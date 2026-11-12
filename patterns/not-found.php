<?php
/**
 * Title: Page not found
 * Slug: uo-theme/not-found
 * Categories: uo-theme
 * Inserter: no
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<!-- wp:paragraph {"className":"uo-eyebrow","textColor":"accent"} --><p class="uo-eyebrow has-accent-color has-text-color">404</p><!-- /wp:paragraph --><!-- wp:heading {"level":1} --><h1 class="wp-block-heading"><?php esc_html_e( 'This page took a different path.', 'uo-theme' ); ?></h1><!-- /wp:heading --><!-- wp:paragraph --><p><?php esc_html_e( 'Try searching for what you need, or return to the home page.', 'uo-theme' ); ?></p><!-- /wp:paragraph --><!-- wp:pattern {"slug":"uo-theme/search-form"} /--><!-- wp:paragraph --><p><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Back to home', 'uo-theme' ); ?></a></p><!-- /wp:paragraph -->
