<?php
/** Theme setup and presentation assets. */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/inc/updates.php';

function uo_theme_setup() {
	load_theme_textdomain( 'uo-theme', get_template_directory() . '/languages' );
	add_theme_support( 'wp-block-styles' );
	add_theme_support( 'editor-styles' );
	add_editor_style( 'assets/css/theme.css' );
	register_block_pattern_category( 'uo-theme', array( 'label' => __( 'uo-theme', 'uo-theme' ) ) );
}
add_action( 'after_setup_theme', 'uo_theme_setup' );

function uo_theme_enqueue_styles() {
	$version = wp_get_theme()->get( 'Version' );
	wp_enqueue_style( 'uo-theme', get_theme_file_uri( 'assets/css/theme.css' ), array(), $version );
	wp_enqueue_script( 'uo-theme-ui', get_theme_file_uri( 'assets/js/theme.js' ), array(), $version, true );
	$characters = array();
	foreach ( array( 'gpt', 'claude', 'deepseek' ) as $id ) {
		$extension = file_exists( get_theme_file_path( "assets/mascots/$id.webp" ) ) ? 'webp' : 'png';
		$characters[ $id ] = array( 'image' => get_theme_file_uri( "assets/mascots/$id.$extension" ) );
	}
	$recent = array();
	foreach ( get_posts( array( 'numberposts' => 5, 'post_status' => 'publish' ) ) as $post ) {
		$recent[] = array( 'title' => get_the_title( $post ), 'url' => get_permalink( $post ) );
	}
	$config = apply_filters( 'uo_theme_companion_settings', array(
		'characters' => $characters,
		'recentPosts' => $recent,
		'context' => array( 'title' => wp_get_document_title(), 'url' => home_url( add_query_arg( array(), $GLOBALS['wp']->request ?? '' ) ), 'site' => get_bloginfo( 'name' ) ),
	) );
	wp_add_inline_script( 'uo-theme-ui', 'window.UOThemeConfig = ' . wp_json_encode( $config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ) . ';', 'before' );
}
add_action( 'wp_enqueue_scripts', 'uo_theme_enqueue_styles' );
