<?php
/** Theme settings: one schema shared by the front-end panel (REST) and templates. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

/** Companion options (kept from 0.x for data continuity). */
function uo_theme_options() {
	$saved = get_option( 'uo_theme_options', array() );
	return wp_parse_args( is_array( $saved ) ? $saved : array(), array( 'enabled' => 1, 'roaming' => 1, 'model' => 'deepseek', 'size' => 156 ) );
}
function uo_theme_sanitize_options( $input ) {
	$input = is_array( $input ) ? $input : array();
	return array(
		'enabled' => empty( $input['enabled'] ) ? 0 : 1,
		'roaming' => empty( $input['roaming'] ) ? 0 : 1,
		'model'   => in_array( $input['model'] ?? '', array( 'gpt', 'claude', 'deepseek' ), true ) ? $input['model'] : 'deepseek',
		'size'    => max( 104, min( 224, absint( $input['size'] ?? 156 ) ) ),
	);
}

function uo_theme_appearance_defaults() {
	return array(
		'accent'       => '#4f5bd5',
		'scheme'       => 'system',
		'layout'       => 'grid',
		'hero'         => 1,
		'hero_eyebrow' => '',
		'hero_title'   => '',
		'hero_lead'    => '',
		'feature'      => 1,
		'stats'        => 1,
		'toc'          => 1,
		'related'      => 1,
		'pjax'         => 1,
		'login_link'   => 1,
		'nav'          => array(),
		'profile'      => array( 'name' => '', 'avatar' => '', 'bio' => '', 'social' => array() ),
	);
}
function uo_theme_appearance() {
	$saved = get_option( 'uo_theme_appearance', array() );
	$value = wp_parse_args( is_array( $saved ) ? $saved : array(), uo_theme_appearance_defaults() );
	$value['profile'] = wp_parse_args( is_array( $value['profile'] ) ? $value['profile'] : array(), uo_theme_appearance_defaults()['profile'] );
	return $value;
}

function uo_theme_sanitize_hex( $color, $fallback ) {
	return preg_match( '/^#[0-9a-f]{6}$/i', (string) $color ) ? strtolower( $color ) : $fallback;
}
function uo_theme_sanitize_appearance( $input ) {
	$input = is_array( $input ) ? $input : array();
	$d = uo_theme_appearance_defaults();
	$text = function ( $key, $max ) use ( $input ) { $v = $input[ $key ] ?? ''; return mb_substr( sanitize_text_field( is_scalar( $v ) ? (string) $v : '' ), 0, $max ); };
	$out = array(
		'accent'       => uo_theme_sanitize_hex( $input['accent'] ?? '', $d['accent'] ),
		'scheme'       => in_array( $input['scheme'] ?? '', array( 'system', 'light', 'dark' ), true ) ? $input['scheme'] : 'system',
		'layout'       => in_array( $input['layout'] ?? '', array( 'grid', 'list' ), true ) ? $input['layout'] : 'grid',
		'hero_eyebrow' => $text( 'hero_eyebrow', 60 ),
		'hero_title'   => $text( 'hero_title', 120 ),
		'hero_lead'    => $text( 'hero_lead', 300 ),
		'nav'          => array(),
		'profile'      => array( 'social' => array() ),
	);
	foreach ( array( 'hero', 'feature', 'stats', 'toc', 'related', 'pjax', 'login_link' ) as $flag ) {
		$out[ $flag ] = array_key_exists( $flag, $input ) ? ( empty( $input[ $flag ] ) ? 0 : 1 ) : $d[ $flag ];
	}
	foreach ( array_slice( is_array( $input['nav'] ?? null ) ? $input['nav'] : array(), 0, 12 ) as $item ) {
		$label = mb_substr( sanitize_text_field( (string) ( $item['label'] ?? '' ) ), 0, 30 );
		$url = esc_url_raw( (string) ( $item['url'] ?? '' ) );
		if ( '' !== $label && '' !== $url ) { $out['nav'][] = array( 'label' => $label, 'url' => $url ); }
	}
	$profile = is_array( $input['profile'] ?? null ) ? $input['profile'] : array();
	$out['profile']['name'] = mb_substr( sanitize_text_field( (string) ( $profile['name'] ?? '' ) ), 0, 40 );
	$out['profile']['avatar'] = esc_url_raw( (string) ( $profile['avatar'] ?? '' ) );
	$out['profile']['bio'] = mb_substr( sanitize_textarea_field( (string) ( $profile['bio'] ?? '' ) ), 0, 240 );
	$types = array( 'github', 'mail', 'rss', 'globe', 'x', 'weibo', 'bilibili' );
	foreach ( array_slice( is_array( $profile['social'] ?? null ) ? $profile['social'] : array(), 0, 8 ) as $item ) {
		$type = in_array( $item['type'] ?? '', $types, true ) ? $item['type'] : '';
		$url = 'mail' === $type ? sanitize_email( (string) ( $item['url'] ?? '' ) ) : esc_url_raw( (string) ( $item['url'] ?? '' ) );
		if ( $type && $url ) { $out['profile']['social'][] = array( 'type' => $type, 'url' => $url ); }
	}
	return $out;
}

function uo_theme_register_settings() {
	register_setting( 'uo_theme', 'uo_theme_options', array( 'type' => 'array', 'sanitize_callback' => 'uo_theme_sanitize_options', 'show_in_rest' => false ) );
	register_setting( 'uo_theme', 'uo_theme_appearance', array( 'type' => 'array', 'sanitize_callback' => 'uo_theme_sanitize_appearance', 'show_in_rest' => false ) );
	register_setting( 'uo_theme', 'uo_theme_footer', array( 'type' => 'array', 'sanitize_callback' => 'uo_theme_sanitize_footer', 'show_in_rest' => false ) );
}
add_action( 'init', 'uo_theme_register_settings' );

/** Settings payload shared by GET and POST responses. */
function uo_theme_settings_payload() {
	return array(
		'appearance' => uo_theme_appearance(),
		'companion'  => uo_theme_options(),
		'footer'     => uo_theme_footer_options(),
		'site'       => array(
			'title'          => get_option( 'blogname' ),
			'description'    => get_option( 'blogdescription' ),
			'posts_per_page' => (int) get_option( 'posts_per_page' ),
			'comments'       => 'open' === get_option( 'default_comment_status' ) ? 1 : 0,
			'moderation'     => (int) get_option( 'comment_moderation' ),
		),
	);
}
function uo_theme_save_settings( $request ) {
	$data = $request->get_json_params();
	$data = is_array( $data ) ? $data : array();
	// register_setting() sanitizers run inside update_option().
	if ( isset( $data['appearance'] ) ) { update_option( 'uo_theme_appearance', $data['appearance'] ); }
	if ( isset( $data['companion'] ) ) { update_option( 'uo_theme_options', $data['companion'] ); }
	if ( isset( $data['footer'] ) ) { update_option( 'uo_theme_footer', $data['footer'] ); }
	if ( isset( $data['site'] ) && is_array( $data['site'] ) ) {
		$site = $data['site'];
		if ( isset( $site['title'] ) ) { update_option( 'blogname', sanitize_text_field( (string) $site['title'] ) ); }
		if ( isset( $site['description'] ) ) { update_option( 'blogdescription', sanitize_text_field( (string) $site['description'] ) ); }
		if ( isset( $site['posts_per_page'] ) ) { update_option( 'posts_per_page', max( 1, min( 50, absint( $site['posts_per_page'] ) ) ) ); }
		if ( isset( $site['comments'] ) ) { update_option( 'default_comment_status', empty( $site['comments'] ) ? 'closed' : 'open' ); }
		if ( isset( $site['moderation'] ) ) { update_option( 'comment_moderation', empty( $site['moderation'] ) ? 0 : 1 ); }
	}
	return rest_ensure_response( uo_theme_settings_payload() );
}
