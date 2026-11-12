<?php
/**
 * Title: Site profile
 * Slug: uo-theme/sidebar-profile
 * Categories: uo-theme
 * Inserter: no
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<!-- wp:group {"className":"uo-side-card uo-profile","layout":{"type":"default"}} -->
<div class="wp-block-group uo-side-card uo-profile"><!-- wp:html --><div class="uo-profile-monogram" aria-hidden="true">if<span>✦</span></div><span class="uo-eyebrow">A LITTLE ABOUT HERE</span><!-- /wp:html --><!-- wp:site-title {"level":2,"isLink":false} /--><!-- wp:site-tagline /--><!-- wp:html --><div class="uo-profile-bottom"><span><strong><?php echo esc_html( (string) wp_count_posts()->publish ); ?></strong> 篇手记</span><a href="<?php echo esc_url( get_feed_link() ); ?>">订阅更新 ↗</a></div><!-- /wp:html --></div>
<!-- /wp:group -->
