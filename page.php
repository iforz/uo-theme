<?php
/** Static page; pages titled/slugged as archives also list every post by year. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
while ( have_posts() ) :
	the_post();
	$uo_slug = get_post_field( 'post_name' );
	$uo_is_archive = in_array( $uo_slug, array( 'archives', 'archive', 'guidang' ), true ) || false !== mb_strpos( get_the_title(), '归档' ) || 'page-archives.php' === get_page_template_slug();
	?>
<main id="uo-main" class="uo-main">
	<article <?php post_class( 'uo-article uo-wrap' ); ?>>
		<header class="uo-article__head">
			<h1 class="uo-article__title"><?php the_title(); ?></h1>
		</header>
		<?php if ( has_post_thumbnail() ) : ?><figure class="uo-article__cover"><?php the_post_thumbnail( 'full', array( 'loading' => 'eager', 'alt' => '' ) ); ?></figure><?php endif; ?>
		<div class="uo-article__layout">
			<div class="uo-prose" data-uo-content><?php the_content(); ?></div>
			<?php if ( $uo_is_archive ) :
				$uo_all = get_posts( array( 'numberposts' => -1, 'post_status' => 'publish', 'no_found_rows' => true ) );
				$uo_year = '';
				echo '<div class="uo-archive">';
				foreach ( $uo_all as $uo_p ) {
					$uo_y = get_the_date( 'Y', $uo_p );
					if ( $uo_y !== $uo_year ) { echo ( $uo_year ? '</ul>' : '' ) . '<h2 class="uo-year">' . esc_html( $uo_y ) . '</h2><ul class="uo-list">'; $uo_year = $uo_y; }
					echo '<li class="uo-row" style="grid-template-columns:72px minmax(0,1fr)"><time>' . esc_html( get_the_date( 'm.d', $uo_p ) ) . '</time><div><h3><a href="' . esc_url( get_permalink( $uo_p ) ) . '">' . esc_html( get_the_title( $uo_p ) ) . '</a></h3></div></li>';
				}
				echo $uo_year ? '</ul></div>' : '</div>';
			endif; ?>
			<?php if ( comments_open() || get_comments_number() ) { echo '<div>'; comments_template(); echo '</div>'; } ?>
		</div>
	</article>
</main>
	<?php
endwhile;
get_footer();
