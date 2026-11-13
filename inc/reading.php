<?php
/** Reading presentation; posts, media and comments remain owned by WordPress. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function uo_theme_footer_options() {
	$old = get_option( 'kratos_options', array() );
	$old = is_array( $old ) ? $old : array();
	$icp = get_option( 'wpicp_license', '' );
	$defaults = array(
		'icp' => is_scalar( $icp ) && $icp ? (string) $icp : ( is_scalar( $old['s_icp'] ?? '' ) ? (string) $old['s_icp'] : '' ),
		'copyright' => isset( $old['s_copyright'] ) && is_scalar( $old['s_copyright'] ) ? wp_strip_all_tags( $old['s_copyright'] ) : '© ' . wp_date( 'Y' ) . ' ' . get_bloginfo( 'name' ),
	);
	$saved = get_option( 'uo_theme_footer', array() );
	return wp_parse_args( is_array( $saved ) ? $saved : array(), $defaults );
}
function uo_theme_sanitize_footer( $input ) {
	$input = is_array( $input ) ? $input : array();
	return array( 'icp' => sanitize_text_field( is_scalar( $input['icp'] ?? '' ) ? (string) $input['icp'] : '' ), 'copyright' => sanitize_text_field( is_scalar( $input['copyright'] ?? '' ) ? (string) $input['copyright'] : '' ) );
}
function uo_theme_register_footer_settings() {
	register_setting( 'uo_theme', 'uo_theme_footer', array( 'type' => 'array', 'sanitize_callback' => 'uo_theme_sanitize_footer', 'show_in_rest' => false ) );
}
add_action( 'admin_init', 'uo_theme_register_footer_settings' );

/** Action markup follows this theme's main post content, never feed/REST/admin output. */
function uo_theme_reading_actions( $html, $block ) {
	if ( is_admin() || is_feed() || ! is_singular( 'post' ) || false === strpos( $block['attrs']['className'] ?? '', 'uo-reading-content' ) ) { return $html; }
	$post_id = get_queried_object_id();
	if ( post_password_required( $post_id ) ) { return $html; }
	$url = get_permalink( $post_id );
	$actions = '<section class="uo-article-actions" aria-label="文章工具" data-uo-article-actions data-url="' . esc_url( $url ) . '" data-title="' . esc_attr( get_the_title( $post_id ) ) . '"><div class="uo-article-action-buttons">';
	$actions .= '<button type="button" data-uo-copy-text>复制正文</button><button type="button" data-uo-copy-link>复制链接</button><button type="button" data-uo-share>分享文章 ↗</button>';
	if ( comments_open( $post_id ) || get_comments_number( $post_id ) ) { $actions .= '<a href="#comments">参与讨论 ↓</a>'; }
	$actions .= '</div><span class="uo-action-status" role="status" aria-live="polite" data-uo-action-status></span></section>';
	return $html . $actions;
}
add_filter( 'render_block_core/post-content', 'uo_theme_reading_actions', 10, 2 );

/** Missing featured images get a local decorative cover, without rewriting post metadata. */
function uo_theme_cover_fallback( $html, $block, $instance = null ) {
	if ( is_admin() || is_feed() || '' !== trim( $html ) ) { return $html; }
	$post_id = absint( $instance->context['postId'] ?? get_the_ID() );
	if ( ! $post_id || 'post' !== get_post_type( $post_id ) || post_password_required( $post_id ) ) { return $html; }
	$names = array( 'circuit', 'earth', 'workspace', 'collaboration', 'writing', 'analytics' );
	$name = $names[ $post_id % count( $names ) ];
	$src = add_query_arg( 'ver', wp_get_theme()->get( 'Version' ), get_theme_file_uri( 'assets/images/' . $name . '.webp' ) );
	$image = '<img data-uo-cover class="uo-fallback-cover" src="' . esc_url( $src ) . '" width="960" height="640" alt="" loading="lazy" decoding="async">';
	if ( ! empty( $block['attrs']['isLink'] ) ) { $image = '<a href="' . esc_url( get_permalink( $post_id ) ) . '" target="_blank" rel="noopener noreferrer" aria-label="' . esc_attr( get_the_title( $post_id ) ) . '">' . $image . '</a>'; }
	return '<figure class="wp-block-post-featured-image uo-editorial-cover">' . $image . '<figcaption class="uo-sr-only">主题示意配图</figcaption></figure>';
}
add_filter( 'render_block_core/post-featured-image', 'uo_theme_cover_fallback', 5, 3 );
