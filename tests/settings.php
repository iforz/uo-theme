<?php
/** Settings contract: native capability boundary and hostile values never become runtime assets. */
define( 'ABSPATH', __DIR__ );
function add_action() {}
function absint( $value ) { return abs( (int) $value ); }
require dirname( __DIR__ ) . '/inc/settings.php';
function verify_settings( $value, $expected ) {
 if ( uo_theme_sanitize_options( $value ) !== $expected ) { throw new Exception( 'Unexpected normalized settings' ); }
}
verify_settings( array( 'enabled' => 1, 'roaming' => 1, 'model' => 'claude', 'size' => 156 ), array( 'enabled' => 1, 'roaming' => 1, 'model' => 'claude', 'size' => 156 ) );
verify_settings( array( 'model' => '<script>alert(1)</script>', 'size' => 99999 ), array( 'enabled' => 0, 'roaming' => 0, 'model' => 'deepseek', 'size' => 224 ) );
verify_settings( null, array( 'enabled' => 0, 'roaming' => 0, 'model' => 'deepseek', 'size' => 156 ) );
verify_settings( array( 'model' => array( 'gpt' ), 'size' => 0, 'unexpected' => 'https://evil.invalid/x.js' ), array( 'enabled' => 0, 'roaming' => 0, 'model' => 'deepseek', 'size' => 104 ) );
$source = file_get_contents( dirname( __DIR__ ) . '/inc/settings.php' );
if ( substr_count( $source, "current_user_can( 'manage_options' )" ) < 2 || false === strpos( $source, "settings_fields( 'uo_theme' )" ) ) { throw new Exception( 'Missing capability/nonce boundary' ); }
echo "PASS: known models only, checkbox defaults, bounded sizes, malformed inputs and native permission/nonce boundary.\n";
