<?php
/** Offline regression coverage for update trust and checksum failure paths. */
define( 'ABSPATH', dirname( __DIR__ ) . '/' );
define( 'MINUTE_IN_SECONDS', 60 );
$cache = array();
$http = array( 'status' => 503, 'body' => '' );
$wp_version = '6.6';
class WP_Error { public $code; function __construct( $code, $message = '' ) { $this->code = $code; } }
function add_filter() {}
function __( $text, $domain ) { return $text; }
function get_site_transient( $name ) { global $cache; return $cache[$name] ?? false; }
function set_site_transient( $name, $value, $ttl ) { global $cache; $cache[$name] = $value; }
function wp_safe_remote_get( $url, $args ) {
 global $http, $release;
 if (isset($args['stream'])) { file_put_contents($args['filename'], 'verified theme zip'); return array('status'=>200,'body'=>''); }
 if (substr($url,-7)==='/latest' && $http['status']===200) { return array('status'=>200,'body'=>json_encode($release)); }
 return $http;
}
function wp_remote_retrieve_response_code( $response ) { return $response['status']; }
function wp_remote_retrieve_body( $response ) { return $response['body']; }
function is_wp_error( $value ) { return $value instanceof WP_Error; }
function download_url() {}
function wp_tempnam( $url ) { return tempnam( sys_get_temp_dir(), 'uo-update-' ); }
function wp_delete_file( $path ) { unlink( $path ); }
function expect( $condition, $message ) { if ( ! $condition ) { throw new RuntimeException( $message ); } }
require dirname( __DIR__ ) . '/inc/updates.php';
$manifest = array( 'version' => '0.1.1', 'requires' => '6.6', 'requires_php' => '7.4', 'package' => 'https://github.com/iforz/uo-theme/releases/download/v0.1.1/uo-theme-0.1.1.zip', 'sha256' => hash( 'sha256', 'verified theme zip' ) );
$release = array('tag_name'=>'v0.1.1','draft'=>false,'prerelease'=>false,'assets'=>array(
 array('id'=>1,'name'=>'uo-theme.json','browser_download_url'=>'https://github.com/iforz/uo-theme/releases/download/v0.1.1/uo-theme.json'),
 array('id'=>2,'name'=>'uo-theme-0.1.1.zip','browser_download_url'=>$manifest['package'])
));
expect( $manifest === uo_theme_valid_update_manifest( $manifest ), 'Valid manifest rejected' );
foreach ( array( 'https://evil.test/theme.zip', 'http://github.com/iforz/uo-theme/releases/download/v0.1.1/uo-theme-0.1.1.zip', 'https://github.com/iforz/another/releases/download/v0.1.1/uo-theme-0.1.1.zip', $manifest['package'] . '?redirect=evil' ) as $url ) {
 $bad = $manifest; $bad['package'] = $url; expect( false === uo_theme_valid_update_manifest( $bad ), 'Untrusted package accepted' );
}
$bad = $manifest; $bad['version'] = '0.1.2-beta'; expect( false === uo_theme_valid_update_manifest( $bad ), 'Prerelease accepted' );
$bad = $manifest; $bad['sha256'] = array(); expect( false === uo_theme_valid_update_manifest( $bad ), 'Malformed hash accepted' );
expect( false === uo_theme_release_manifest(), 'HTTP failure must not offer update' );
$cache = array(); $http = array( 'status' => 200, 'body' => json_encode( $manifest ) );
expect( $manifest === uo_theme_release_manifest(), 'Manifest fetch failed' );
expect( 'unchanged' === uo_theme_check_release( 'unchanged', array(), 'other-theme', array() ), 'Affected another theme' );
$headers = array( 'UpdateURI' => 'https://github.com/iforz/uo-theme' );
expect( '0.1.1' === uo_theme_check_release( false, $headers, 'uo-theme', array() )['version'], 'Update offer missing' );
$wp_version = '6.5';
expect( false === uo_theme_check_release( false, $headers, 'uo-theme', array() ), 'Incompatible WordPress accepted' );
$wp_version = '6.6';
$path = uo_theme_verify_release_download( false, $manifest['package'], null, array() );
expect( is_file( $path ), 'Valid download failed' ); unlink( $path );
$cache['uo_theme_release_v1']['sha256'] = str_repeat( '0', 64 );
$error = uo_theme_verify_release_download( false, $manifest['package'], null, array() );
expect( is_wp_error( $error ) && 'uo_theme_checksum' === $error->code, 'Tampered archive not rejected' );
expect( false === uo_theme_verify_release_download( false, 'https://example.test/other-theme.zip', null, array() ), 'Affected unrelated download' );
$cache['uo_theme_github_release_v1']['assets'][1]['browser_download_url'] = 'https://evil.test/zip';
expect( false === uo_theme_release_asset_url( 'uo-theme-0.1.1.zip', '0.1.1' ), 'Untrusted API asset accepted' );
echo "PASS: manifest origin/version/shape, HTTP failure, theme isolation, valid download and checksum rejection.\n";
