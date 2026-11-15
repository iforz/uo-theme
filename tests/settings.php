<?php
/** Settings contract: sanitizers normalise hostile input; REST routes keep WordPress capability checks. */
define( 'ABSPATH', __DIR__ );
function add_action() {}
function absint( $value ) { return abs( (int) $value ); }
function sanitize_text_field( $s ) { return trim( strip_tags( (string) $s ) ); }
function sanitize_textarea_field( $s ) { return trim( strip_tags( (string) $s ) ); }
function sanitize_email( $s ) { return filter_var( $s, FILTER_VALIDATE_EMAIL ) ? $s : ''; }
function esc_url_raw( $s ) { return preg_match( '#^https?://#i', (string) $s ) ? (string) $s : ''; }
function get_option( $k, $d = array() ) { return $GLOBALS['opts'][ $k ] ?? $d; }
function wp_parse_args( $a, $b ) { return array_merge( $b, $a ); }
require dirname( __DIR__ ) . '/inc/settings.php';
function expect( $ok, $message ) { if ( ! $ok ) { throw new Exception( $message ); } }

// Companion options (unchanged contract from 0.x).
expect( uo_theme_sanitize_options( array( 'enabled' => 1, 'roaming' => 1, 'model' => 'claude', 'size' => 156 ) ) === array( 'enabled' => 1, 'roaming' => 1, 'model' => 'claude', 'size' => 156 ), 'Valid companion' );
expect( uo_theme_sanitize_options( array( 'model' => '<script>alert(1)</script>', 'size' => 99999 ) ) === array( 'enabled' => 0, 'roaming' => 0, 'model' => 'deepseek', 'size' => 224 ), 'Hostile companion' );
expect( uo_theme_sanitize_options( null )['size'] === 156, 'Null companion' );

// Appearance.
$a = uo_theme_sanitize_appearance( array(
	'accent' => 'red;}</style><script>', 'scheme' => 'neon', 'layout' => 'list', 'hero_title' => '<b>Hi</b>', 'toc' => 0,
	'nav' => array( array( 'label' => 'Home', 'url' => 'https://example.test/' ), array( 'label' => 'Bad', 'url' => 'javascript:alert(1)' ), array( 'label' => '', 'url' => 'https://x.test' ) ),
	'profile' => array( 'name' => 'uo', 'avatar' => 'javascript:x', 'social' => array( array( 'type' => 'github', 'url' => 'https://github.com/x' ), array( 'type' => 'evil', 'url' => 'https://x' ), array( 'type' => 'mail', 'url' => 'not-an-email' ) ) ),
) );
expect( '#4f5bd5' === $a['accent'], 'Accent must be a hex colour' );
expect( 'system' === $a['scheme'] && 'list' === $a['layout'], 'Enumerations' );
expect( 'Hi' === $a['hero_title'], 'Plain hero text' );
expect( 0 === $a['toc'] && 1 === $a['related'], 'Flags default when absent, honour explicit 0' );
expect( 1 === count( $a['nav'] ) && 'Home' === $a['nav'][0]['label'], 'Nav rejects unsafe/empty items' );
expect( '' === $a['profile']['avatar'], 'Avatar URL scheme' );
expect( 1 === count( $a['profile']['social'] ) && 'github' === $a['profile']['social'][0]['type'], 'Social whitelist' );
expect( '#0f9d7a' === uo_theme_sanitize_appearance( array( 'accent' => '#0F9D7A' ) )['accent'], 'Hex normalised' );

// Capability boundary in the REST layer.
$panel = file_get_contents( dirname( __DIR__ ) . '/inc/panel.php' );
expect( substr_count( $panel, "current_user_can( 'manage_options' )" ) >= 2, 'Settings routes require manage_options' );
expect( false !== strpos( $panel, "'permission_callback' => function () { return current_user_can( 'edit_posts' ); }" ), 'Overview requires edit_posts' );
expect( false !== strpos( $panel, "is_user_logged_in() && current_user_can( 'edit_posts' )" ), 'Panel only for signed-in editors' );
expect( false === strpos( $panel, '__return_true' ), 'No public routes' );
echo "PASS: companion/appearance sanitisation, URL schemes, enumerations and REST capability boundary.\n";
