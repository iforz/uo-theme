<?php
/** Theme setup and presentation assets. */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

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
}
add_action( 'wp_enqueue_scripts', 'uo_theme_enqueue_styles' );
