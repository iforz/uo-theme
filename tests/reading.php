<?php
/** Footer/legal options and article tools, without a live database. */
define( 'ABSPATH', __DIR__ );
function add_action() {} function add_filter() {}
function sanitize_text_field( $s ) { return trim( strip_tags( $s ) ); }
function wp_strip_all_tags( $s ) { return strip_tags( $s ); }
function get_option( $key, $fallback = array() ) { return $GLOBALS['opts'][ $key ] ?? $fallback; }
function wp_parse_args( $a, $b ) { return array_merge( $b, $a ); }
function wp_date() { return '2026'; } function get_bloginfo() { return 'Site'; }
function post_password_required() { return $GLOBALS['protected'] ?? false; }
function get_permalink() { return 'https://example.test/post/'; } function get_the_title() { return '<Title>'; }
function esc_url( $s ) { return htmlspecialchars( $s, ENT_QUOTES, 'UTF-8' ); } function esc_attr( $s ) { return htmlspecialchars( $s, ENT_QUOTES, 'UTF-8' ); }
function comments_open() { return true; } function get_comments_number() { return 0; }
function uo_theme_icon( $n ) { return "<svg data-i=\"$n\"></svg>"; }
require dirname( __DIR__ ) . '/inc/reading.php';
function expect( $v, $message ) { if ( ! $v ) { throw new Exception( $message ); } }
$GLOBALS['opts'] = array( 'wpicp_license' => '蜀ICP备2024046028号-1', 'kratos_options' => array( 's_copyright' => '<b>Copyright</b>' ) );
expect( '蜀ICP备2024046028号-1' === uo_theme_footer_options()['icp'], 'Legacy ICP' );
expect( 'Copyright' === uo_theme_footer_options()['copyright'], 'Plain legacy copyright' );
$GLOBALS['opts']['uo_theme_footer'] = array( 'icp' => '', 'copyright' => 'Mine' );
expect( '蜀ICP备2024046028号-1' === uo_theme_footer_options()['icp'] && 'Mine' === uo_theme_footer_options()['copyright'], 'Empty saved value falls back' );
expect( uo_theme_sanitize_footer( array( 'icp' => array( 'bad' ), 'copyright' => '<b>Text</b>' ) ) === array( 'icp' => '', 'copyright' => 'Text' ), 'Sanitized inputs' );
$out = uo_theme_article_actions( 7 );
expect( false !== strpos( $out, 'data-uo-copy-text' ) && false !== strpos( $out, 'data-title="&lt;Title&gt;"' ), 'Escaped tools' );
expect( false !== strpos( $out, 'href="#comments"' ), 'Comment anchor' );
$GLOBALS['protected'] = true;
expect( '' === uo_theme_article_actions( 7 ), 'Protected content has no tools' );
echo "PASS: footer legacy fallbacks, sanitisation and article tools.\n";
