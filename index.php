<?php
/** Home, archives and search. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
$uo_appearance = uo_theme_appearance();
$uo_paged = max( 1, (int) get_query_var( 'paged' ) );
$uo_front = is_home() && 1 === $uo_paged;
$uo_rows = is_search() || is_tag() || is_date() || is_author();
?>
<main id="uo-main" class="uo-main">
	<div class="uo-wrap">
	<?php if ( $uo_front && $uo_appearance['hero'] ) :
		$uo_title = $uo_appearance['hero_title'] ?: get_bloginfo( 'description' );
		$uo_first = get_posts( array( 'numberposts' => 1, 'order' => 'ASC', 'fields' => 'ids', 'no_found_rows' => true ) );
		?>
		<section class="uo-hero">
			<div>
				<span class="uo-eyebrow"><?php echo esc_html( $uo_appearance['hero_eyebrow'] ?: get_bloginfo( 'name' ) ); ?></span>
				<h1 class="uo-hero__title"><?php echo esc_html( $uo_title ); ?></h1>
				<?php if ( $uo_appearance['hero_lead'] ) : ?><p class="uo-hero__lead"><?php echo esc_html( $uo_appearance['hero_lead'] ); ?></p><?php endif; ?>
			</div>
			<?php if ( $uo_appearance['stats'] ) : ?>
			<ul class="uo-hero__stats">
				<li><strong><?php echo esc_html( wp_count_posts()->publish ); ?></strong><span>篇文章</span></li>
				<li><strong><?php echo esc_html( wp_count_terms( array( 'taxonomy' => 'category', 'hide_empty' => true ) ) ); ?></strong><span>个分类</span></li>
				<?php if ( $uo_first ) : ?><li><strong><?php echo esc_html( get_the_date( 'Y', $uo_first[0] ) ); ?></strong><span>开始记录</span></li><?php endif; ?>
			</ul>
			<?php endif; ?>
		</section>
	<?php elseif ( ! is_home() ) : ?>
		<header class="uo-page-head">
			<span class="uo-eyebrow"><?php
			if ( is_search() ) { echo '搜索'; }
			elseif ( is_category() ) { echo '分类'; }
			elseif ( is_tag() ) { echo '标签'; }
			elseif ( is_author() ) { echo '作者'; }
			else { echo '归档'; }
			?> · <?php echo esc_html( $GLOBALS['wp_query']->found_posts ); ?> 篇</span>
			<h1><?php
			if ( is_search() ) { printf( '“%s”', esc_html( get_search_query() ) ); }
			elseif ( is_category() || is_tag() ) { single_term_title(); }
			elseif ( is_author() ) { the_author_meta( 'display_name', get_queried_object_id() ); }
			else { echo esc_html( wp_strip_all_tags( get_the_archive_title() ) ); }
			?></h1>
			<?php if ( is_category() || is_tag() ) { $uo_desc = term_description(); if ( $uo_desc ) { echo '<p>' . esc_html( wp_strip_all_tags( $uo_desc ) ) . '</p>'; } } ?>
		</header>
	<?php else : ?>
		<header class="uo-page-head"><span class="uo-eyebrow">全部文章</span><h1>第 <?php echo esc_html( $uo_paged ); ?> 页</h1></header>
	<?php endif; ?>

	<?php if ( is_home() || is_category() ) :
		$uo_current = is_category() ? get_queried_object_id() : 0; ?>
		<ul class="uo-chips" aria-label="分类">
			<li><a class="uo-chip<?php echo $uo_current ? '' : ' is-active'; ?>" href="<?php echo esc_url( home_url( '/' ) ); ?>">全部</a></li>
			<?php foreach ( get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 8 ) ) as $uo_cat ) : ?>
			<li><a class="uo-chip<?php echo $uo_current === $uo_cat->term_id ? ' is-active' : ''; ?>" href="<?php echo esc_url( get_category_link( $uo_cat ) ); ?>"><?php echo esc_html( $uo_cat->name ); ?> <small><?php echo esc_html( $uo_cat->count ); ?></small></a></li>
			<?php endforeach; ?>
		</ul>
	<?php endif; ?>

	<?php if ( have_posts() ) : ?>
		<?php if ( $uo_rows ) :
			$uo_year = ''; echo '<ul class="uo-list">';
			while ( have_posts() ) : the_post();
				$uo_y = get_the_date( 'Y' );
				if ( $uo_y !== $uo_year && ! is_search() ) { echo '</ul><h2 class="uo-year">' . esc_html( $uo_y ) . '</h2><ul class="uo-list">'; $uo_year = $uo_y; }
				get_template_part( 'template-parts/card', 'row' );
			endwhile;
			echo '</ul>';
		else :
			if ( $uo_front && $uo_appearance['feature'] ) { the_post(); get_template_part( 'template-parts/card', 'feature' ); }
			if ( $uo_front ) : ?><div class="uo-section-head"><h2>最近更新</h2></div><?php endif; ?>
			<div class="uo-grid">
			<?php while ( have_posts() ) : the_post(); get_template_part( 'template-parts/card' ); endwhile; ?>
			</div>
		<?php endif; ?>
		<?php uo_theme_pagination(); ?>
	<?php else : ?>
		<div class="uo-empty">
			<h1>没有找到相关内容</h1>
			<p>换个关键词试试，或者看看最近的文章。</p>
			<?php get_search_form(); ?>
		</div>
	<?php endif; ?>
	</div>
</main>
<?php
get_footer();
