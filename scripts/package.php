<?php
/** Build an installable, allow-listed ZIP outside the source repository. */
$root = dirname( __DIR__ );
passthru( escapeshellarg( PHP_BINARY ) . ' ' . escapeshellarg( __DIR__ . '/check.php' ), $status );
if ( 0 !== $status ) { exit( $status ); }
if ( ! class_exists( 'ZipArchive' ) ) { fwrite( STDERR, "PHP ZipArchive extension required.\n" ); exit( 1 ); }
preg_match( '/^Version:\s*(\S+)/m', file_get_contents( "$root/style.css" ), $match );
$version = $match[1];
$build_id = gmdate( 'Ymd\THis\Z' ) . '-' . bin2hex( random_bytes( 3 ) );
$target = dirname( $root ) . "/app_packages/uo-theme/wordpress/$version/$build_id";
if ( ! is_dir( $target ) && ! mkdir( $target, 0755, true ) ) { exit( 1 ); }
$path = "$target/uo-theme-$version.zip";
$zip = new ZipArchive();
if ( true !== $zip->open( $path, ZipArchive::CREATE | ZipArchive::OVERWRITE ) ) { exit( 1 ); }
$paths = array( 'style.css', 'functions.php', 'theme.json', 'LICENSE', 'readme.txt', 'templates', 'parts', 'patterns', 'styles', 'assets', 'inc' );
$files = array();
foreach ( $paths as $relative ) {
	if ( is_file( "$root/$relative" ) ) { $files[] = $relative; continue; }
	$iterator = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( "$root/$relative", FilesystemIterator::SKIP_DOTS ) );
	foreach ( $iterator as $file ) {
		// Keep original generated PNGs in Git; ship the optimized alpha WebP when available.
		if ( 'png' === strtolower( $file->getExtension() ) && false !== strpos( $file->getPathname(), '/assets/mascots/' ) && is_file( substr( $file->getPathname(), 0, -4 ) . '.webp' ) ) { continue; }
		if ( $file->isFile() && '.DS_Store' !== $file->getFilename() ) { $files[] = substr( $file->getPathname(), strlen( $root ) + 1 ); }
	}
}
sort( $files );
foreach ( $files as $file ) {
	$name = "uo-theme/$file";
	$zip->addFile( "$root/$file", $name );
	$zip->setMtimeName( $name, 946684800 );
}
$zip->close();
$hash = hash_file( 'sha256', $path );
file_put_contents( "$path.sha256", "$hash  " . basename( $path ) . "\n" );
$manifest = array(
	'version' => $version,
	'requires' => '6.6',
	'requires_php' => '7.4',
	'package' => "https://github.com/iforz/uo-theme/releases/download/v$version/uo-theme-$version.zip",
	'sha256' => $hash,
);
file_put_contents( "$target/uo-theme.json", json_encode( $manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) . "\n" );
echo "$path\nSHA-256: $hash\n";
