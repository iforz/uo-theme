<?php
/** Static checks, optionally using the actual WordPress block parser. */
$root = dirname( __DIR__ );
$errors = array();
function check_result( $condition, $message ) {
	global $errors;
	if ( ! $condition ) { $errors[] = $message; }
}
foreach ( array_merge( glob( "$root/*.php" ), glob( "$root/inc/*.php" ), glob( "$root/patterns/*.php" ), glob( "$root/scripts/*.php" ) ) as $file ) {
	exec( escapeshellarg( PHP_BINARY ) . ' -l ' . escapeshellarg( $file ) . ' 2>&1', $output, $status );
	check_result( 0 === $status, "PHP syntax: $file" );
}
foreach ( array_merge( array( "$root/theme.json" ), glob( "$root/styles/*.json" ) ) as $file ) {
	$data = json_decode( file_get_contents( $file ), true );
	check_result( JSON_ERROR_NONE === json_last_error() && 3 === ( $data['version'] ?? null ), "Theme JSON: $file" );
}
$css = file_get_contents( "$root/style.css" );
foreach ( array( 'Theme Name: uo-theme', 'Text Domain: uo-theme', 'Update URI: https://github.com/iforz/uo-theme', 'Requires at least: 6.6', 'Requires PHP: 7.4' ) as $header ) {
	check_result( false !== strpos( $css, $header ), "Missing header $header" );
}
if ( isset( $argv[1] ) ) {
	$parser = rtrim( $argv[1], '/' ) . '/wp-includes/class-wp-block-parser.php';
	if ( ! is_file( $parser ) ) { fwrite( STDERR, "WordPress source not found: $parser\n" ); exit( 1 ); }
	require $parser;
}
$files = array_merge( glob( "$root/templates/*.html" ), glob( "$root/parts/*.html" ), glob( "$root/patterns/*.php" ) );
foreach ( $files as $file ) {
	$content = file_get_contents( $file );
	if ( 'php' === pathinfo( $file, PATHINFO_EXTENSION ) ) {
		// Render PHP patterns with isolated WordPress escaping/translation helpers.
		if ( ! defined( 'ABSPATH' ) ) {
			define( 'ABSPATH', $root );
			function esc_html_e( $text, $domain ) { echo htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' ); }
			function esc_attr__( $text, $domain ) { return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' ); }
			function esc_url( $url ) { return htmlspecialchars( $url, ENT_QUOTES, 'UTF-8' ); }
			function home_url( $path ) { return 'https://example.test' . $path; }
			function esc_html( $text ) { return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' ); }
			function get_theme_file_uri( $path ) { return 'https://example.test/wp-content/themes/uo-theme/' . $path; }
			function get_theme_file_path( $path ) { return dirname( __DIR__ ) . '/' . $path; }
			function wp_count_posts() { return (object) array( 'publish' => 87 ); }
			function get_feed_link() { return 'https://example.test/feed/'; }
		}
		ob_start(); require $file; $content = ob_get_clean();
	}
	preg_match_all( '/<!--\s+(\/)?wp:([a-z0-9\/-]+)(.*?)-->/s', $content, $matches, PREG_SET_ORDER );
	$stack = array();
	foreach ( $matches as $match ) {
		$name = $match[2]; $attributes = trim( $match[3] );
		if ( '/' === $match[1] ) {
			check_result( array_pop( $stack ) === $name, "Mismatched block $name in $file" );
			continue;
		}
		$self_closing = '/' === substr( $attributes, -1 );
		$json = trim( $self_closing ? substr( $attributes, 0, -1 ) : $attributes );
		if ( '' !== $json ) {
			$attrs = json_decode( $json, true );
			check_result( JSON_ERROR_NONE === json_last_error(), "Invalid block JSON in $file: $json" );
			if ( 'template-part' === $name ) { check_result( is_file( "$root/parts/{$attrs['slug']}.html" ), "Missing template part in $file" ); }
			if ( 'pattern' === $name ) { check_result( is_file( "$root/patterns/" . basename( $attrs['slug'] ) . '.php' ), "Missing pattern in $file" ); }
		}
		if ( ! $self_closing ) { $stack[] = $name; }
	}
	check_result( empty( $stack ), "Unclosed blocks in $file" );
	if ( class_exists( 'WP_Block_Parser' ) ) {
		$blocks = ( new WP_Block_Parser() )->parse( $content );
		check_result( count( $blocks ) > 0, "WordPress parser returned no blocks in $file" );
	}
}
if ( $errors ) { fwrite( STDERR, implode( "\n", $errors ) . "\n" ); exit( 1 ); }
echo 'PASS: PHP syntax, JSON, metadata, block nesting and template references (' . count( $files ) . ' files)' . ( class_exists( 'WP_Block_Parser' ) ? '; WordPress block parser PASS' : '' ) . ".\n";
