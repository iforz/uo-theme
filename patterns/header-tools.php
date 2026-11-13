<?php
/**
 * Title: Header tools
 * Slug: uo-theme/header-tools
 * Categories: uo-theme
 * Inserter: no
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<!-- wp:html -->
<div class="uo-header-tools"><button class="uo-icon-button" type="button" data-uo-refresh aria-label="刷新当前内容" title="刷新当前内容"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.3 7a7 7 0 0 1 11.5-1L20 9M4 15l2.2 3A7 7 0 0 0 17.7 17"/></svg></button><button class="uo-icon-button" type="button" data-uo-search-toggle aria-label="打开站内搜索" aria-expanded="false" aria-controls="uo-site-search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg></button><button class="uo-icon-button" type="button" data-uo-scheme aria-label="切换深色模式" aria-pressed="false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20.2 14.2A8.5 8.5 0 0 1 9.8 3.8a8.5 8.5 0 1 0 10.4 10.4Z"/></svg></button></div>
<div id="uo-site-search" class="uo-site-search" hidden><form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>"><label class="uo-sr-only" for="uo-site-search-input">搜索文章</label><input id="uo-site-search-input" name="s" type="search" placeholder="搜索文章、工具和灵感…" required><button type="submit">搜索 ↗</button></form></div>
<!-- /wp:html -->
