<?php
/**
 * Front-end management panel. The UI (assets/core/js/panel.js) is engine-agnostic and talks to
 * window.UOAdapter; here we boot the WordPress adapter for signed-in users. Authentication,
 * capabilities and nonces stay with WordPress core REST; nothing is exposed to anonymous HTML.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function uo_theme_panel_allowed() {
	return is_user_logged_in() && current_user_can( 'edit_posts' );
}

function uo_theme_panel_enqueue() {
	if ( is_admin() || ! uo_theme_panel_allowed() ) { return; }
	$version = wp_get_theme()->get( 'Version' );
	wp_enqueue_style( 'uo-theme-panel', get_theme_file_uri( 'assets/core/css/panel.css' ), array(), $version );
	wp_enqueue_script( 'uo-theme-adapter', get_theme_file_uri( 'assets/adapters/wordpress.js' ), array(), $version, array( 'in_footer' => true, 'strategy' => 'defer' ) );
	wp_enqueue_script( 'uo-theme-panel', get_theme_file_uri( 'assets/core/js/panel.js' ), array( 'uo-theme-adapter' ), $version, array( 'in_footer' => true, 'strategy' => 'defer' ) );
	$user = wp_get_current_user();
	$here = home_url( add_query_arg( array(), $GLOBALS['wp']->request ?? '' ) );
	$post_id = is_singular() ? get_queried_object_id() : 0;
	$config = array(
		'version' => $version,
		'engine'  => 'WordPress ' . get_bloginfo( 'version' ),
		'rest'    => esc_url_raw( rest_url() ),
		'nonce'   => wp_create_nonce( 'wp_rest' ),
		'home'    => home_url( '/' ),
		'site'    => get_bloginfo( 'name' ),
		'user'    => array( 'id' => $user->ID, 'name' => $user->display_name, 'avatar' => get_avatar_url( $user->ID, array( 'size' => 96 ) ) ),
		'caps'    => array(
			'posts'    => current_user_can( 'edit_posts' ),
			'publish'  => current_user_can( 'publish_posts' ),
			'pages'    => current_user_can( 'edit_pages' ),
			'comments' => current_user_can( 'moderate_comments' ),
			'media'    => current_user_can( 'upload_files' ),
			'terms'    => current_user_can( 'manage_categories' ),
			'settings' => current_user_can( 'manage_options' ),
		),
		'links'   => array( 'logout' => wp_logout_url( $here ), 'native' => admin_url() ),
		'current' => $post_id && current_user_can( 'edit_post', $post_id ) ? array( 'id' => $post_id, 'type' => get_post_type( $post_id ) ) : null,
		'mascots' => array_map( function ( $id ) { return uo_theme_asset( "assets/mascots/community/$id-idle.gif" ); }, array( 'gpt' => 'gpt', 'claude' => 'claude', 'deepseek' => 'deepseek' ) ),
	);
	wp_add_inline_script( 'uo-theme-adapter', 'window.UOPanelConfig = ' . wp_json_encode( $config, JSON_HEX_TAG | JSON_HEX_AMP ) . ';', 'before' );
}
add_action( 'wp_enqueue_scripts', 'uo_theme_panel_enqueue', 20 );

/** Signed-in pages are personal: never let shared caches keep them. */
function uo_theme_panel_nocache() {
	if ( ! is_admin() && is_user_logged_in() ) { nocache_headers(); }
}
add_action( 'template_redirect', 'uo_theme_panel_nocache' );

function uo_theme_rest_routes() {
	register_rest_route( 'uo-theme/v1', '/settings', array(
		array( 'methods' => 'GET', 'callback' => function () { return rest_ensure_response( uo_theme_settings_payload() ); }, 'permission_callback' => function () { return current_user_can( 'manage_options' ); } ),
		array( 'methods' => 'POST', 'callback' => 'uo_theme_save_settings', 'permission_callback' => function () { return current_user_can( 'manage_options' ); } ),
	) );
	register_rest_route( 'uo-theme/v1', '/overview', array(
		'methods'             => 'GET',
		'callback'            => 'uo_theme_rest_overview',
		'permission_callback' => function () { return current_user_can( 'edit_posts' ); },
	) );
}
add_action( 'rest_api_init', 'uo_theme_rest_routes' );

function uo_theme_rest_overview() {
	$posts = wp_count_posts( 'post' );
	$data = array(
		'posts'    => array( 'publish' => (int) $posts->publish, 'draft' => (int) $posts->draft, 'future' => (int) $posts->future, 'pending' => (int) $posts->pending ),
		'pages'    => (int) wp_count_posts( 'page' )->publish,
		'comments' => null,
		'media'    => current_user_can( 'upload_files' ) ? (int) array_sum( (array) wp_count_attachments() ) - (int) ( wp_count_attachments()->trash ?? 0 ) : null,
		'drafts'   => array(),
		'recent'   => array(),
	);
	if ( current_user_can( 'moderate_comments' ) ) {
		$c = wp_count_comments();
		$data['comments'] = array( 'pending' => (int) $c->moderated, 'approved' => (int) $c->approved, 'spam' => (int) $c->spam );
	}
	$author = current_user_can( 'edit_others_posts' ) ? '' : get_current_user_id();
	foreach ( get_posts( array( 'post_status' => 'draft', 'numberposts' => 5, 'author' => $author, 'orderby' => 'modified' ) ) as $p ) {
		$data['drafts'][] = array( 'id' => $p->ID, 'title' => $p->post_title, 'modified' => get_post_modified_time( 'c', false, $p ) );
	}
	foreach ( get_posts( array( 'numberposts' => 5 ) ) as $p ) {
		$data['recent'][] = array( 'id' => $p->ID, 'title' => $p->post_title, 'date' => get_post_time( 'c', false, $p ), 'link' => get_permalink( $p ), 'comments' => (int) $p->comment_count );
	}
	return rest_ensure_response( $data );
}
