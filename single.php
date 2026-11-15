<?php
/** Single post. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
$uo_appearance = uo_theme_appearance();
while ( have_posts() ) :
	the_post();
	$uo_id = get_the_ID();
	$uo_author = get_the_author_meta( 'ID' );
	?>
<main id="uo-main" class="uo-main">
	<article <?php post_class( 'uo-article uo-wrap' ); ?>>
		<header class="uo-article__head">
			<?php echo uo_theme_kicker(); ?>
			<h1 class="uo-article__title"><?php the_title(); ?></h1>
			<div class="uo-article__meta">
				<span data-uo-name="<?php echo esc_attr( get_the_author() ); ?>"><?php echo get_avatar( $uo_author, 52, '', '', array( 'class' => 'uo-avatar' ) ); ?><?php the_author(); ?></span>
				<span><?php echo uo_theme_icon( 'clock' ); ?>约 <?php echo esc_html( uo_theme_reading_minutes() ); ?> 分钟 · <?php echo esc_html( number_format_i18n( uo_theme_word_count() ) ); ?> 字</span>
				<?php if ( get_the_modified_date( 'Ymd' ) !== get_the_date( 'Ymd' ) ) : ?><span><?php echo uo_theme_icon( 'calendar' ); ?>更新于 <?php echo esc_html( get_the_modified_date( 'Y.m.d' ) ); ?></span><?php endif; ?>
			</div>
		</header>
		<?php if ( has_post_thumbnail() ) : ?>
		<figure class="uo-article__cover"><?php the_post_thumbnail( 'full', array( 'loading' => 'eager', 'fetchpriority' => 'high', 'alt' => '' ) ); ?></figure>
		<?php endif; ?>
		<div class="uo-article__layout">
			<?php if ( $uo_appearance['toc'] ) : ?>
			<nav class="uo-toc" data-uo-toc hidden aria-label="文章目录"><p class="uo-toc__title">目录</p><ol></ol></nav>
			<?php endif; ?>
			<div class="uo-prose" data-uo-content><?php the_content(); wp_link_pages(); ?></div>
			<div>
				<?php $uo_tags = get_the_tags(); if ( $uo_tags ) : ?>
				<ul class="uo-tags"><?php foreach ( $uo_tags as $uo_tag ) : ?><li><a href="<?php echo esc_url( get_tag_link( $uo_tag ) ); ?>"><?php echo esc_html( $uo_tag->name ); ?></a></li><?php endforeach; ?></ul>
				<?php endif; ?>
				<?php echo uo_theme_article_actions( $uo_id ); ?>
				<?php
				$uo_prev = get_previous_post();
				$uo_next = get_next_post();
				if ( $uo_prev || $uo_next ) : ?>
				<nav class="uo-postnav" aria-label="上一篇与下一篇">
					<?php if ( $uo_prev ) : ?><a href="<?php echo esc_url( get_permalink( $uo_prev ) ); ?>"><span>← 上一篇</span><strong><?php echo esc_html( get_the_title( $uo_prev ) ); ?></strong></a><?php endif; ?>
					<?php if ( $uo_next ) : ?><a class="is-next" href="<?php echo esc_url( get_permalink( $uo_next ) ); ?>"><span>下一篇 →</span><strong><?php echo esc_html( get_the_title( $uo_next ) ); ?></strong></a><?php endif; ?>
				</nav>
				<?php endif; ?>
				<?php if ( comments_open() || get_comments_number() ) { comments_template(); } ?>
			</div>
		</div>
	</article>
	<?php
	if ( $uo_appearance['related'] ) :
		$uo_cat = uo_theme_primary_category();
		$uo_related = $uo_cat ? new WP_Query( array( 'cat' => $uo_cat->term_id, 'post__not_in' => array( $uo_id ), 'posts_per_page' => 3, 'no_found_rows' => true, 'ignore_sticky_posts' => true ) ) : null;
		if ( $uo_related && $uo_related->have_posts() ) : ?>
	<section class="uo-related uo-wrap" aria-label="相关文章">
		<div class="uo-section-head"><h2>继续阅读</h2><a href="<?php echo esc_url( get_category_link( $uo_cat ) ); ?>">更多「<?php echo esc_html( $uo_cat->name ); ?>」→</a></div>
		<div class="uo-grid"><?php while ( $uo_related->have_posts() ) : $uo_related->the_post(); get_template_part( 'template-parts/card' ); endwhile; wp_reset_postdata(); ?></div>
	</section>
		<?php endif;
	endif; ?>
</main>
	<?php
endwhile;
get_footer();
