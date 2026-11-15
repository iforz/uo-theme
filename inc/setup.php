<?php
/** Theme setup, assets and front-end configuration. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function uo_theme_setup() {
	load_theme_textdomain( 'uo-theme', get_template_directory() . '/languages' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'custom-logo', array( 'height' => 96, 'width' => 96, 'flex-width' => true ) );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' ) );
	register_nav_menus( array( 'primary' => __( '主导航', 'uo-theme' ) ) );
	set_post_thumbnail_size( 960, 600, true );
}
add_action( 'after_setup_theme', 'uo_theme_setup' );

function uo_theme_asset( $relative ) {
	return add_query_arg( 'ver', wp_get_theme()->get( 'Version' ), get_theme_file_uri( $relative ) );
}
function uo_theme_read_asset( $relative ) {
	$path = get_theme_file_path( $relative );
	return is_readable( $path ) ? (string) file_get_contents( $path ) : '';
}

function uo_theme_enqueue() {
	$version = wp_get_theme()->get( 'Version' );
	// First-paint CSS/JS ship inline with the HTML (no extra blocking round-trip); filter to link instead.
	$inline = apply_filters( 'uo_theme_inline_assets', true );
	$css = $inline ? uo_theme_read_asset( 'assets/core/css/uo.css' ) . "\n" . uo_theme_read_asset( 'assets/css/companion.css' ) : '';
	if ( '' !== trim( $css ) ) {
		wp_register_style( 'uo-theme', false, array(), $version );
		wp_enqueue_style( 'uo-theme' );
		wp_add_inline_style( 'uo-theme', '/* uo-theme ' . $version . " */\n" . $css );
	} else {
		wp_enqueue_style( 'uo-theme', get_theme_file_uri( 'assets/core/css/uo.css' ), array(), $version );
		wp_enqueue_style( 'uo-theme-companion', get_theme_file_uri( 'assets/css/companion.css' ), array(), $version );
	}
	$js = $inline ? uo_theme_read_asset( 'assets/core/js/uo.js' ) : '';
	if ( '' !== trim( $js ) ) {
		wp_register_script( 'uo-theme-ui', false, array(), $version, true );
		wp_enqueue_script( 'uo-theme-ui' );
		wp_add_inline_script( 'uo-theme-ui', $js );
	} else {
		wp_enqueue_script( 'uo-theme-ui', get_theme_file_uri( 'assets/core/js/uo.js' ), array(), $version, array( 'in_footer' => true, 'strategy' => 'defer' ) );
	}
	// Load on every front page so progressive navigation keeps an identical asset set; re-bind after swaps.
	if ( get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
		wp_add_inline_script( 'comment-reply', "document.addEventListener('uo-theme:navigated',function(){window.addComment&&addComment.init&&addComment.init();});" );
	}

	$appearance = uo_theme_appearance();
	$characters = array();
	foreach ( array( 'gpt', 'claude', 'deepseek' ) as $id ) { $characters[ $id ] = array( 'image' => uo_theme_asset( "assets/mascots/community/$id.webp" ) ); }
	$recent = array();
	foreach ( get_posts( array( 'numberposts' => 5, 'post_status' => 'publish', 'no_found_rows' => true ) ) as $item ) { $recent[] = array( 'title' => get_the_title( $item ), 'url' => get_permalink( $item ) ); }
	$config = apply_filters( 'uo_theme_companion_settings', array(
		'version'     => $version,
		'engine'      => 'wordpress',
		'characters'  => $characters,
		'covers'      => array_map( function ( $name ) { return uo_theme_asset( 'assets/images/' . $name . '.webp' ); }, uo_theme_cover_names() ),
		'scripts'     => array( 'companion' => uo_theme_asset( 'assets/js/companion.js' ), 'roaming' => uo_theme_asset( 'assets/js/roaming.js' ) ),
		'options'     => uo_theme_options(),
		'recentPosts' => $recent,
		'pjax'        => (bool) $appearance['pjax'],
		'noNavigate'  => '/(wp-admin|wp-json|wp-content|wp-includes|feed)(/|$)|/(wp-login|wp-cron|xmlrpc)\\.php$|\\.(xml|txt|zip|pdf|jpe?g|png|gif|webp|svg)$',
		'search'      => array( 'api' => add_query_arg( array( 'search' => '%s', 'per_page' => 8, '_fields' => 'title,url,subtype' ), rest_url( 'wp/v2/search' ) ), 'page' => home_url( '/' ), 'param' => 's' ),
		'context'     => array( 'title' => wp_get_document_title(), 'url' => home_url( add_query_arg( array(), $GLOBALS['wp']->request ?? '' ) ), 'site' => get_bloginfo( 'name' ) ),
		'page'        => array( 'postId' => is_singular() ? get_queried_object_id() : 0, 'type' => is_singular() ? get_post_type() : '' ),
	) );
	// rest_url() would encode %s; keep the literal placeholder.
	$config['search']['api'] = str_replace( '%25s', '%s', $config['search']['api'] );
	wp_add_inline_script( 'uo-theme-ui', 'window.UOThemeConfig = ' . wp_json_encode( $config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ) . ';', 'before' );
}
add_action( 'wp_enqueue_scripts', 'uo_theme_enqueue' );

/** Saved palette and accent before first paint, without a network request. */
function uo_theme_prepaint() {
	$appearance = uo_theme_appearance();
	$accent = $appearance['accent'];
	echo '<style id="uo-theme-accent">:root{--uo-accent:' . esc_html( $accent ) . ';--uo-accent-dark:color-mix(in srgb,' . esc_html( $accent ) . ' 62%,#fff)}</style>' . "\n";
	$default = wp_json_encode( $appearance['scheme'] );
	$script = <<<JS
(() => {
  let saved = null;
  try { saved = localStorage.getItem('uo-theme:scheme'); } catch (_) {}
  const fallback = {$default};
  const system = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const scheme = saved === 'dark' || saved === 'light' ? saved : (fallback === 'dark' || fallback === 'light' ? fallback : system);
  const root = document.documentElement;
  root.dataset.uoScheme = scheme;
  root.style.colorScheme = scheme;
  root.style.backgroundColor = scheme === 'dark' ? '#121316' : '#f7f6f3';
})();
JS;
	echo wp_get_inline_script_tag( $script, array( 'id' => 'uo-theme-prepaint' ) );
}
add_action( 'wp_head', 'uo_theme_prepaint', 0 );

function uo_theme_body_class( $classes ) {
	$classes[] = 'uo';
	if ( 'list' === uo_theme_appearance()['layout'] ) { $classes[] = 'uo-layout-list'; }
	return $classes;
}
add_filter( 'body_class', 'uo_theme_body_class' );

/** The floating panel replaces the public toolbar; wp-admin keeps its own. */
function uo_theme_frontend_admin_bar( $show ) {
	return is_admin() ? $show : false;
}
add_filter( 'show_admin_bar', 'uo_theme_frontend_admin_bar', 100 );

function uo_theme_native_frontend_emoji() {
	if ( ! is_admin() ) {
		remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
		remove_action( 'wp_print_styles', 'print_emoji_styles' );
		remove_action( 'wp_enqueue_scripts', 'wp_enqueue_emoji_styles' );
	}
}
add_action( 'init', 'uo_theme_native_frontend_emoji' );

function uo_theme_excerpt_more() { return '…'; }
add_filter( 'excerpt_more', 'uo_theme_excerpt_more' );

/** Keep the main loop count in sync with the hero feature on the first page. */
function uo_theme_pre_get_posts( $query ) {
	if ( is_admin() || ! $query->is_main_query() ) { return; }
	if ( $query->is_search() ) { $query->set( 'post_type', array( 'post', 'page' ) ); }
}
add_action( 'pre_get_posts', 'uo_theme_pre_get_posts' );
