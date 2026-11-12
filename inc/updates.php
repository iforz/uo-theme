<?php
/** Stable GitHub releases integrated with the native WordPress theme updater. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function uo_theme_valid_update_manifest( $data ) {
	if ( ! is_array( $data ) ) { return false; }
	foreach ( array( 'version', 'requires', 'requires_php', 'package', 'sha256' ) as $key ) {
		if ( ! isset( $data[ $key ] ) || ! is_string( $data[ $key ] ) ) { return false; }
	}
	if ( ! preg_match( '/^\d+\.\d+\.\d+$/D', $data['version'] ) ||
		! preg_match( '/^\d+\.\d+(?:\.\d+)?$/D', $data['requires'] ) ||
		! preg_match( '/^\d+\.\d+(?:\.\d+)?$/D', $data['requires_php'] ) ||
		! preg_match( '/^[a-f0-9]{64}$/D', $data['sha256'] ) ) { return false; }
	$expected = 'https://github.com/iforz/uo-theme/releases/download/v' . $data['version'] . '/uo-theme-' . $data['version'] . '.zip';
	return $expected === $data['package'] ? $data : false;
}

function uo_theme_github_release() {
	$cached = get_site_transient( 'uo_theme_github_release_v1' );
	if ( false !== $cached ) { return $cached ? $cached : false; }
	$response = wp_safe_remote_get( 'https://api.github.com/repos/iforz/uo-theme/releases/latest', array( 'timeout' => 15, 'limit_response_size' => 65536, 'headers' => array( 'Accept' => 'application/vnd.github+json' ) ) );
	$data = false;
	if ( ! is_wp_error( $response ) && 200 === wp_remote_retrieve_response_code( $response ) ) {
		$value = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( is_array( $value ) && empty( $value['draft'] ) && empty( $value['prerelease'] ) && isset( $value['tag_name'], $value['assets'] ) && is_string( $value['tag_name'] ) && preg_match( '/^v\d+\.\d+\.\d+$/D', $value['tag_name'] ) && is_array( $value['assets'] ) ) { $data = $value; }
	}
	set_site_transient( 'uo_theme_github_release_v1', $data ? $data : array(), $data ? 15 * MINUTE_IN_SECONDS : 5 * MINUTE_IN_SECONDS );
	return $data;
}

function uo_theme_release_asset_url( $name, $version ) {
	$release = uo_theme_github_release();
	if ( ! $release || 'v' . $version !== $release['tag_name'] ) { return false; }
	foreach ( $release['assets'] as $asset ) {
		if ( isset( $asset['name'], $asset['id'], $asset['browser_download_url'] ) && $name === $asset['name'] && is_int( $asset['id'] ) && $asset['id'] > 0 && 'https://github.com/iforz/uo-theme/releases/download/v' . $version . '/' . $name === $asset['browser_download_url'] ) {
			return 'https://api.github.com/repos/iforz/uo-theme/releases/assets/' . $asset['id'];
		}
	}
	return false;
}

function uo_theme_release_manifest() {
	$cached = get_site_transient( 'uo_theme_release_v1' );
	if ( false !== $cached ) { return uo_theme_valid_update_manifest( $cached ); }
	$data = false;
	$release = uo_theme_github_release();
	$version = $release ? substr( $release['tag_name'], 1 ) : '';
	$url = $release ? uo_theme_release_asset_url( 'uo-theme.json', $version ) : false;
	if ( $url ) {
		$response = wp_safe_remote_get( $url, array( 'timeout' => 15, 'limit_response_size' => 16384, 'headers' => array( 'Accept' => 'application/octet-stream' ) ) );
		if ( ! is_wp_error( $response ) && 200 === wp_remote_retrieve_response_code( $response ) ) {
			$data = uo_theme_valid_update_manifest( json_decode( wp_remote_retrieve_body( $response ), true ) );
			if ( $data && $version !== $data['version'] ) { $data = false; }
		}
	}
	// Cache failures briefly, without inventing an update or disabling the site.
	set_site_transient( 'uo_theme_release_v1', $data ? $data : array(), $data ? 15 * MINUTE_IN_SECONDS : 5 * MINUTE_IN_SECONDS );
	return $data;
}

function uo_theme_check_release( $update, $theme_data, $stylesheet, $locales ) {
	global $wp_version;
	if ( 'uo-theme' !== $stylesheet || 'https://github.com/iforz/uo-theme' !== ( $theme_data['UpdateURI'] ?? '' ) ) { return $update; }
	$data = uo_theme_release_manifest();
	if ( ! $data ) { return $update; }
	if ( version_compare( $wp_version, $data['requires'], '<' ) || version_compare( PHP_VERSION, $data['requires_php'], '<' ) ) { return $update; }
	return array(
		'id' => 'https://github.com/iforz/uo-theme',
		'url' => 'https://github.com/iforz/uo-theme/releases/tag/v' . $data['version'],
		'theme' => 'uo-theme',
		'version' => $data['version'],
		'package' => $data['package'],
		'requires' => $data['requires'],
		'requires_php' => $data['requires_php'],
	);
}
add_filter( 'update_themes_github.com', 'uo_theme_check_release', 10, 4 );

function uo_theme_verify_release_download( $reply, $package, $upgrader, $hook_extra ) {
	if ( false !== $reply || ! is_string( $package ) || 0 !== strpos( $package, 'https://github.com/iforz/uo-theme/releases/download/' ) ) { return $reply; }
	$data = uo_theme_release_manifest();
	if ( ! $data || $package !== $data['package'] ) {
		return new WP_Error( 'uo_theme_manifest', __( 'The theme release could not be verified. Try again later.', 'uo-theme' ) );
	}
	if ( ! function_exists( 'download_url' ) ) { require_once ABSPATH . 'wp-admin/includes/file.php'; }
	$url = uo_theme_release_asset_url( 'uo-theme-' . $data['version'] . '.zip', $data['version'] );
	if ( ! $url ) { return new WP_Error( 'uo_theme_asset', __( 'The theme release asset is unavailable.', 'uo-theme' ) ); }
	$file = wp_tempnam( $package );
	if ( ! $file ) { return new WP_Error( 'uo_theme_tempfile', __( 'Could not create the theme download file.', 'uo-theme' ) ); }
	$response = wp_safe_remote_get( $url, array( 'timeout' => 120, 'stream' => true, 'filename' => $file, 'headers' => array( 'Accept' => 'application/octet-stream' ) ) );
	if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
		wp_delete_file( $file );
		return is_wp_error( $response ) ? $response : new WP_Error( 'uo_theme_download', __( 'The theme download failed. Try again later.', 'uo-theme' ) );
	}
	if ( ! hash_equals( $data['sha256'], hash_file( 'sha256', $file ) ) ) {
		wp_delete_file( $file );
		return new WP_Error( 'uo_theme_checksum', __( 'The theme download checksum does not match the release.', 'uo-theme' ) );
	}
	return $file;
}
add_filter( 'upgrader_pre_download', 'uo_theme_verify_release_download', 10, 4 );
