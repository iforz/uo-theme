<?php
/** Search form used by empty states and 404. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<form class="uo-search-page" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
	<label class="uo-sr-only" for="uo-s-<?php echo esc_attr( wp_unique_id() ); ?>">搜索</label>
	<input type="search" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="输入关键词…">
	<button type="submit" class="uo-btn uo-btn--primary">搜索</button>
</form>
