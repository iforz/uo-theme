<?php
/** Theme setup and presentation assets. */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/inc/updates.php';
require_once __DIR__ . '/inc/settings.php';

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
	// Ship the complete first-paint design with HTML; no extra render-blocking CSS round trip.
	$css_path = get_theme_file_path( 'assets/css/theme.css' );
	$inline = apply_filters( 'uo_theme_inline_styles', true ) && is_readable( $css_path );
	$css = $inline ? file_get_contents( $css_path ) : false;
	if ( is_string( $css ) && '' !== trim( $css ) ) {
		wp_register_style( 'uo-theme', false, array(), $version );
		wp_enqueue_style( 'uo-theme' );
		wp_add_inline_style( 'uo-theme', '/* uo-theme ' . $version . " */\n" . $css );
	} else {
		wp_enqueue_style( 'uo-theme', get_theme_file_uri( 'assets/css/theme.css' ), array(), $version );
	}
	$ui_path = get_theme_file_path( 'assets/js/theme.js' );
	$ui_inline = apply_filters( 'uo_theme_inline_ui', true ) && is_readable( $ui_path );
	$ui = $ui_inline ? file_get_contents( $ui_path ) : false;
	if ( is_string( $ui ) && '' !== trim( $ui ) ) {
		wp_register_script( 'uo-theme-ui', false, array(), $version, true );
		wp_enqueue_script( 'uo-theme-ui' );
		wp_add_inline_script( 'uo-theme-ui', $ui, 'after' );
	} else {
		wp_enqueue_script( 'uo-theme-ui', get_theme_file_uri( 'assets/js/theme.js' ), array(), $version, array( 'in_footer' => true, 'strategy' => 'defer' ) );
	}
	$characters = array();
	foreach ( array( 'gpt', 'claude', 'deepseek' ) as $id ) {
		$characters[ $id ] = array( 'image' => add_query_arg( 'ver', $version, get_theme_file_uri( "assets/mascots/community/$id.webp" ) ) );
	}
	$recent = array();
	foreach ( get_posts( array( 'numberposts' => 5, 'post_status' => 'publish' ) ) as $post ) {
		$recent[] = array( 'title' => get_the_title( $post ), 'url' => get_permalink( $post ) );
	}
	$config = apply_filters( 'uo_theme_companion_settings', array(
		'version' => $version,
		'characters' => $characters,
		'scripts' => array( 'companion' => add_query_arg( 'ver', $version, get_theme_file_uri( 'assets/js/companion.js' ) ), 'roaming' => add_query_arg( 'ver', $version, get_theme_file_uri( 'assets/js/roaming.js' ) ) ),
		'options' => uo_theme_options(),
		'recentPosts' => $recent,
		'context' => array( 'title' => wp_get_document_title(), 'url' => home_url( add_query_arg( array(), $GLOBALS['wp']->request ?? '' ) ), 'site' => get_bloginfo( 'name' ) ),
	) );
	wp_add_inline_script( 'uo-theme-ui', 'window.UOThemeConfig = ' . wp_json_encode( $config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ) . ';', 'before' );
}
add_action( 'wp_enqueue_scripts', 'uo_theme_enqueue_styles' );

/** Keep the native toolbar in wp-admin; use the theme rail on the public site. */
function uo_theme_frontend_admin_bar( $show ) {
	return is_admin() ? $show : false;
}
add_filter( 'show_admin_bar', 'uo_theme_frontend_admin_bar', 100 );

/** Article entry points open separately; navigation, categories and pagination stay native. */
function uo_theme_article_link_target( $html, $block ) {
	if ( is_admin() || ! class_exists( 'WP_HTML_Tag_Processor' ) ) { return $html; }
	$links = new WP_HTML_Tag_Processor( $html );
	while ( $links->next_tag( 'A' ) ) {
		if ( ! $links->get_attribute( 'href' ) ) { continue; }
		if ( 'core/latest-posts' === ( $block['blockName'] ?? '' ) && ! $links->has_class( 'wp-block-latest-posts__post-title' ) && ! $links->has_class( 'wp-block-latest-posts__read-more' ) ) { continue; }
		$links->set_attribute( 'target', '_blank' );
		$rel = preg_split( '/\s+/', trim( (string) $links->get_attribute( 'rel' ) ) );
		$links->set_attribute( 'rel', implode( ' ', array_unique( array_filter( array_merge( $rel, array( 'noopener', 'noreferrer' ) ) ) ) ) );
		$links->set_attribute( 'title', __( '在新标签页打开文章', 'uo-theme' ) );
	}
	return $links->get_updated_html();
}
foreach ( array( 'post-title', 'post-featured-image', 'post-excerpt', 'post-navigation-link', 'latest-posts' ) as $uo_theme_article_block ) {
	add_filter( 'render_block_core/' . $uo_theme_article_block, 'uo_theme_article_link_target', 10, 2 );
}

/** Modern browsers render native emoji; avoid the optional compatibility download on public pages. */
function uo_theme_native_frontend_emoji() {
	if ( ! is_admin() ) {
		remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
		remove_action( 'wp_enqueue_scripts', 'wp_enqueue_emoji_styles' );
		remove_action( 'wp_print_styles', 'print_emoji_styles' );
	}
}
add_action( 'init', 'uo_theme_native_frontend_emoji' );

/** Set the saved palette before styles/body paint, without a network request. */
function uo_theme_prepaint_scheme() {
	$script = <<<'JS'
(() => {
  let saved = null;
  try { saved = localStorage.getItem('uo-theme:scheme'); } catch (_) {}
  const scheme = saved === 'dark' || saved === 'light' ? saved : (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const root = document.documentElement;
  root.dataset.uoScheme = scheme;
  root.style.colorScheme = scheme;
  root.style.backgroundColor = scheme === 'dark' ? '#151f29' : '#f4f7f8';
})();
JS;
	echo wp_get_inline_script_tag( $script, array( 'id' => 'uo-theme-prepaint' ) );
}
add_action( 'wp_head', 'uo_theme_prepaint_scheme', 0 );
