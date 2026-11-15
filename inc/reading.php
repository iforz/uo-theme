<?php
/** Footer/legal options; posts, media and comments remain owned by WordPress. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function uo_theme_footer_options() {
	$old = get_option( 'kratos_options', array() );
	$old = is_array( $old ) ? $old : array();
	$icp = get_option( 'wpicp_license', '' );
	$defaults = array(
		'icp'       => is_scalar( $icp ) && $icp ? (string) $icp : ( is_scalar( $old['s_icp'] ?? '' ) ? (string) $old['s_icp'] : '' ),
		'copyright' => isset( $old['s_copyright'] ) && is_scalar( $old['s_copyright'] ) ? wp_strip_all_tags( $old['s_copyright'] ) : '© ' . wp_date( 'Y' ) . ' ' . get_bloginfo( 'name' ),
	);
	$saved = get_option( 'uo_theme_footer', array() );
	return wp_parse_args( is_array( $saved ) ? array_filter( $saved, 'strlen' ) : array(), $defaults );
}
function uo_theme_sanitize_footer( $input ) {
	$input = is_array( $input ) ? $input : array();
	return array(
		'icp'       => sanitize_text_field( is_scalar( $input['icp'] ?? '' ) ? (string) $input['icp'] : '' ),
		'copyright' => sanitize_text_field( is_scalar( $input['copyright'] ?? '' ) ? (string) $input['copyright'] : '' ),
	);
}

/** Article tool bar; rendered after the post body in single.php. */
function uo_theme_article_actions( $post_id ) {
	if ( post_password_required( $post_id ) ) { return ''; }
	$out = '<section class="uo-actions" aria-label="文章工具" data-uo-actions data-url="' . esc_url( get_permalink( $post_id ) ) . '" data-title="' . esc_attr( get_the_title( $post_id ) ) . '">';
	$out .= '<button type="button" class="uo-btn" data-uo-copy-text>' . uo_theme_icon( 'copy' ) . '复制正文</button>';
	$out .= '<button type="button" class="uo-btn" data-uo-copy-link>' . uo_theme_icon( 'link' ) . '复制链接</button>';
	$out .= '<button type="button" class="uo-btn" data-uo-share>' . uo_theme_icon( 'share' ) . '分享</button>';
	if ( comments_open( $post_id ) || get_comments_number( $post_id ) ) { $out .= '<a class="uo-btn" href="#comments">' . uo_theme_icon( 'message' ) . '参与讨论</a>'; }
	$out .= '<span class="uo-actions__status uo-sr-only" role="status" aria-live="polite" data-uo-action-status></span></section>';
	return $out;
}
