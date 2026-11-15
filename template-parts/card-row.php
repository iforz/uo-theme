<?php
/** Compact row for archives and search. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<li <?php post_class( 'uo-row' ); ?>>
	<time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( get_the_date( is_date() || is_category() || is_tag() ? 'm.d' : 'Y.m.d' ) ); ?></time>
	<div>
		<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
		<p><?php echo esc_html( uo_theme_excerpt( null, 70 ) ); ?></p>
	</div>
	<div class="uo-row__thumb" aria-hidden="true"><?php echo uo_theme_cover( null, 'thumbnail' ); ?></div>
</li>
