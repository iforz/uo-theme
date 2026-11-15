<?php
/** Featured lead story. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<article <?php post_class( 'uo-feature uo-card uo-reveal' ); ?>>
	<a class="uo-card__media" href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true"><?php echo uo_theme_cover( null, 'large', true ); ?></a>
	<div class="uo-card__body">
		<span class="uo-badge"><?php echo is_sticky() ? '置顶推荐' : '最新发布'; ?></span>
		<h2 class="uo-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
		<p class="uo-card__excerpt"><?php echo esc_html( uo_theme_excerpt( null, 150 ) ); ?></p>
		<div class="uo-card__meta">
			<?php echo uo_theme_kicker(); ?>
			<span><?php echo uo_theme_icon( 'clock' ); ?><?php echo esc_html( uo_theme_reading_minutes() ); ?> 分钟阅读</span>
		</div>
	</div>
</article>
