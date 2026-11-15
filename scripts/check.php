<?php
/** Static checks: PHP syntax, JSON, metadata, template inventory and markup-contract hooks. */
$root = dirname( __DIR__ );
$errors = array();
function check_result( $condition, $message ) {
	global $errors;
	if ( ! $condition ) { $errors[] = $message; }
}
$php = array_merge( glob( "$root/*.php" ), glob( "$root/inc/*.php" ), glob( "$root/template-parts/*.php" ), glob( "$root/scripts/*.php" ), glob( "$root/tests/*.php" ) );
foreach ( $php as $file ) {
	exec( escapeshellarg( PHP_BINARY ) . ' -l ' . escapeshellarg( $file ) . ' 2>&1', $output, $status );
	check_result( 0 === $status, "PHP syntax: $file" );
}
$data = json_decode( file_get_contents( "$root/theme.json" ), true );
check_result( JSON_ERROR_NONE === json_last_error() && 3 === ( $data['version'] ?? null ), 'theme.json' );
$css = file_get_contents( "$root/style.css" );
foreach ( array( 'Theme Name: uo-theme', 'Text Domain: uo-theme', 'Update URI: https://github.com/iforz/uo-theme', 'Requires at least: 6.6', 'Requires PHP: 7.4' ) as $header ) {
	check_result( false !== strpos( $css, $header ), "Missing header $header" );
}
// Classic theme: block templates would switch WordPress into block-theme mode.
check_result( ! is_dir( "$root/templates" ), 'templates/ must not exist (classic theme)' );
foreach ( array( 'index.php', 'single.php', 'page.php', '404.php', 'header.php', 'footer.php', 'comments.php', 'searchform.php', 'template-parts/card.php', 'template-parts/card-feature.php', 'template-parts/card-row.php', 'template-parts/companion.php' ) as $template ) {
	check_result( is_file( "$root/$template" ), "Missing template $template" );
}
foreach ( array( 'assets/core/css/uo.css', 'assets/core/css/panel.css', 'assets/core/js/uo.js', 'assets/core/js/panel.js', 'assets/adapters/wordpress.js', 'assets/css/companion.css', 'assets/js/companion.js', 'assets/js/roaming.js' ) as $asset ) {
	check_result( is_file( "$root/$asset" ) && filesize( "$root/$asset" ) > 200, "Missing asset $asset" );
}
// Markup contract hooks used by the engine-agnostic JS must be present in templates.
$templates = implode( "\n", array_map( 'file_get_contents', array_merge( glob( "$root/*.php" ), glob( "$root/template-parts/*.php" ), array( "$root/inc/reading.php" ) ) ) );
foreach ( array( 'id="uo-main"', 'data-uo-content', 'data-uo-toc', 'data-uo-progress', 'data-uo-top', 'data-uo-scheme-toggle', 'data-uo-search-open', 'id="uo-search"', 'data-uo-search-results', 'data-uo-actions', 'data-uo-menu-toggle' ) as $hook ) {
	check_result( false !== strpos( $templates, $hook ), "Markup contract hook missing: $hook" );
}
// Core JS stays engine-agnostic.
foreach ( array( 'assets/core/js/uo.js', 'assets/core/js/panel.js', 'assets/core/css/uo.css', 'assets/core/css/panel.css' ) as $core ) {
	$src = file_get_contents( "$root/$core" );
	check_result( false === stripos( $src, 'wp-json' ) && false === strpos( $src, 'wp/v2' ) && false === strpos( $src, '--wp--' ), "Core file references WordPress internals: $core" );
}
if ( $errors ) { fwrite( STDERR, implode( "\n", $errors ) . "\n" ); exit( 1 ); }
echo 'PASS: PHP syntax (' . count( $php ) . " files), theme.json, metadata, classic template inventory, assets and markup contract.\n";
