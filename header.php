<?php
/** Site header. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$uo_name = get_bloginfo( 'name' );
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="uo-skip" href="#uo-main">跳到正文</a>
<div class="uo-progress" data-uo-progress aria-hidden="true"></div>
<header class="uo-header">
	<div class="uo-wrap uo-header__inner">
		<a class="uo-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
			<span class="uo-brand__mark" aria-hidden="true"><?php
			$uo_logo = get_theme_mod( 'custom_logo' );
			if ( $uo_logo ) { echo wp_get_attachment_image( $uo_logo, array( 64, 64 ), false, array( 'alt' => '', 'loading' => 'eager' ) ); }
			else { echo esc_html( mb_substr( preg_replace( '/\s+/u', '', $uo_name ), 0, 1 ) ); }
			?></span>
			<span class="uo-brand__name"><?php echo esc_html( $uo_name ); ?></span>
		</a>
		<nav class="uo-nav" aria-label="主导航">
			<ul>
			<?php foreach ( uo_theme_nav_items() as $uo_item ) : ?>
				<li><a href="<?php echo esc_url( $uo_item['url'] ); ?>"<?php echo uo_theme_is_current_url( $uo_item['url'] ) ? ' aria-current="page"' : ''; ?>><?php echo esc_html( $uo_item['label'] ); ?></a></li>
			<?php endforeach; ?>
			</ul>
		</nav>
		<div class="uo-header__tools">
			<a class="uo-tool uo-tool--search" href="<?php echo esc_url( home_url( '/?s=' ) ); ?>" data-uo-search-open aria-label="搜索 (⌘K)"><?php echo uo_theme_icon( 'search' ); ?><span>搜索文章</span><kbd>⌘K</kbd></a>
			<button type="button" class="uo-tool" data-uo-scheme-toggle aria-pressed="false" aria-label="切换深色模式"><?php echo uo_theme_icon( 'sun', 'uo-scheme-icon--light' ) . uo_theme_icon( 'moon', 'uo-scheme-icon--dark' ); ?></button>
			<button type="button" class="uo-tool uo-menu-toggle" data-uo-menu-toggle aria-expanded="false" aria-label="打开菜单"><?php echo uo_theme_icon( 'menu' ); ?></button>
		</div>
	</div>
</header>
