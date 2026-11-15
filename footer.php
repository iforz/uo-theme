<?php
/** Site footer: profile, categories, tags, legal line, search dialog, companion. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$uo_appearance = uo_theme_appearance();
$uo_profile = $uo_appearance['profile'];
$uo_footer = uo_theme_footer_options();
$uo_admin = get_userdata( 1 );
$uo_name = $uo_profile['name'] ?: ( $uo_admin ? $uo_admin->display_name : get_bloginfo( 'name' ) );
$uo_avatar = $uo_profile['avatar'] ?: ( $uo_admin ? get_avatar_url( $uo_admin->ID, array( 'size' => 96 ) ) : '' );
$uo_bio = $uo_profile['bio'] ?: get_bloginfo( 'description' );
?>
<footer class="uo-footer">
	<div class="uo-wrap">
		<div class="uo-footer__grid">
			<section>
				<div class="uo-profile" data-uo-name="<?php echo esc_attr( $uo_name ); ?>">
					<?php if ( $uo_avatar ) : ?><img src="<?php echo esc_url( $uo_avatar ); ?>" alt="" width="48" height="48" loading="lazy"><?php endif; ?>
					<div><strong><?php echo esc_html( $uo_name ); ?></strong><p><?php echo esc_html( $uo_bio ); ?></p></div>
				</div>
				<div class="uo-social"><?php echo uo_theme_social_links(); ?><a href="<?php echo esc_url( get_feed_link() ); ?>" aria-label="RSS 订阅" data-uo-no-nav><?php echo uo_theme_icon( 'rss' ); ?></a></div>
			</section>
			<section>
				<h2>分类</h2>
				<ul>
				<?php foreach ( get_categories( array( 'number' => 6, 'orderby' => 'count', 'order' => 'DESC' ) ) as $uo_cat ) : ?>
					<li><a href="<?php echo esc_url( get_category_link( $uo_cat ) ); ?>"><?php echo esc_html( $uo_cat->name ); ?></a></li>
				<?php endforeach; ?>
				</ul>
			</section>
			<section>
				<h2>标签</h2>
				<ul class="uo-tagcloud">
				<?php foreach ( get_tags( array( 'number' => 14, 'orderby' => 'count', 'order' => 'DESC' ) ) as $uo_tag ) : ?>
					<li><a href="<?php echo esc_url( get_tag_link( $uo_tag ) ); ?>"><?php echo esc_html( $uo_tag->name ); ?></a></li>
				<?php endforeach; ?>
				</ul>
			</section>
		</div>
		<div class="uo-footer__legal">
			<span><?php echo esc_html( $uo_footer['copyright'] ); ?></span>
			<?php if ( $uo_footer['icp'] ) : ?><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $uo_footer['icp'] ); ?></a><?php endif; ?>
			<?php if ( $uo_appearance['login_link'] && ! is_user_logged_in() ) : ?><a class="uo-login-link" href="<?php echo esc_url( wp_login_url( home_url( add_query_arg( array(), $GLOBALS['wp']->request ?? '' ) ) ) ); ?>" data-uo-no-nav data-uo-login>登录</a><?php endif; ?>
			<details>
				<summary>主题与素材署名</summary>
				<div class="uo-credits">
					主题 <a href="https://github.com/iforz/uo-theme" target="_blank" rel="noopener">uo-theme</a> · 社区角色 <a href="https://github.com/savanna0425/llm-pet" target="_blank" rel="noopener">savanna0425/llm-pet</a>，形象 ZipZipPipe，DeepSeek 原设 上善；非官方同人，署名·非商业使用，DeepSeek 另遵循 CC BY-NC-SA 4.0（<a href="https://github.com/savanna0425/llm-pet/blob/fdd821feb49b294ea8abe42c9cf41e6c52e3aacf/NOTICE.md" target="_blank" rel="noopener">素材许可</a>）。
					示意封面来自 <a href="https://unsplash.com/license" target="_blank" rel="noopener">Unsplash</a>（Alexandre Debiève、NASA 等）及 AI 生成卡通插画。
				</div>
			</details>
		</div>
	</div>
</footer>

<div class="uo-fab-stack">
	<button type="button" class="uo-fab uo-toc-fab" data-uo-toc-toggle hidden aria-label="文章目录"><?php echo uo_theme_icon( 'toc' ); ?></button>
	<button type="button" class="uo-fab" data-uo-top hidden aria-label="回到顶部"><?php echo uo_theme_icon( 'arrow-up' ); ?></button>
</div>

<dialog class="uo-dialog" id="uo-search" aria-label="搜索">
	<div class="uo-search">
		<form class="uo-search__bar" role="search" action="<?php echo esc_url( home_url( '/' ) ); ?>" method="get">
			<?php echo uo_theme_icon( 'search' ); ?>
			<input type="search" name="s" placeholder="搜索文章、分类、标签…" autocomplete="off" aria-label="搜索关键词">
			<kbd>ESC</kbd>
		</form>
		<div class="uo-search__results" role="listbox" data-uo-search-results></div>
		<div class="uo-search__foot"><span><kbd>↑</kbd><kbd>↓</kbd>选择</span><span><kbd>↵</kbd>打开</span><span><kbd>/</kbd>随时唤起</span></div>
	</div>
</dialog>

<?php get_template_part( 'template-parts/companion' ); ?>
<?php wp_footer(); ?>
</body>
</html>
