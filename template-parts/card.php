<?php
/** Post card (grid / list layout). */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$uo_comments = get_comments_number();
?>
<article <?php post_class( 'uo-card uo-reveal' . ( is_sticky() && is_home() ? ' uo-card--sticky' : '' ) ); ?>>
	<a class="uo-card__media" href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true"><?php echo uo_theme_cover( null, 'large' ); ?></a>
	<div class="uo-card__body">
		<?php echo uo_theme_kicker(); ?>
		<h3 class="uo-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
		<p class="uo-card__excerpt"><?php echo esc_html( uo_theme_excerpt() ); ?></p>
		<div class="uo-card__meta">
			<span><?php echo uo_theme_icon( 'clock' ); ?><?php echo esc_html( uo_theme_reading_minutes() ); ?> 分钟</span>
			<?php if ( $uo_comments ) : ?><span><?php echo uo_theme_icon( 'message' ); ?><?php echo esc_html( $uo_comments ); ?></span><?php endif; ?>
		</div>
	</div>
</article>
