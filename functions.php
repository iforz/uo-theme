<?php
/** uo-theme bootstrap. Presentation lives in assets/core (engine-agnostic); this file wires WordPress. */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/inc/updates.php';
require_once __DIR__ . '/inc/settings.php';
require_once __DIR__ . '/inc/reading.php';
require_once __DIR__ . '/inc/template-tags.php';
require_once __DIR__ . '/inc/setup.php';
require_once __DIR__ . '/inc/panel.php';
