<?php
/** 404. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="uo-main" class="uo-main">
	<div class="uo-wrap uo-empty">
		<p class="uo-empty__code">404</p>
		<h1>这一页走丢了</h1>
		<p>链接可能已失效，搜索一下或回到首页继续阅读。</p>
		<?php get_search_form(); ?>
		<p style="margin-top:28px"><a class="uo-btn" href="<?php echo esc_url( home_url( '/' ) ); ?>">返回首页 <?php echo uo_theme_icon( 'arrow-right' ); ?></a></p>
	</div>
</main>
<?php
get_footer();
