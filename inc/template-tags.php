<?php
/** Presentation helpers. Markup follows docs/MARKUP-CONTRACT.md so other engines can mirror it. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function uo_theme_icon( $name, $class = '' ) {
	static $paths = array(
		'search'   => '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
		'sun'      => '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
		'moon'     => '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
		'menu'     => '<path d="M4 7h16M4 12h16M4 17h10"/>',
		'arrow-up' => '<path d="M12 19V5M6 11l6-6 6 6"/>',
		'arrow-right' => '<path d="M5 12h14M13 6l6 6-6 6"/>',
		'clock'    => '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
		'calendar' => '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
		'message'  => '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12z"/>',
		'copy'     => '<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M15 9V6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15H9"/>',
		'link'     => '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
		'share'    => '<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',
		'list'     => '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".8"/><circle cx="4.5" cy="12" r=".8"/><circle cx="4.5" cy="18" r=".8"/>',
		'eye'      => '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
		'github'   => '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
		'mail'     => '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
		'rss'      => '<path d="M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14"/><circle cx="6" cy="18" r="1.2"/>',
		'globe'    => '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
		'x'        => '<path d="M4 4l16 16M20 4 4 20"/>',
		'weibo'    => '<path d="M10.5 19c-4 0-7.5-2-7.5-5 0-3 4.5-7.5 8-7.5 1.6 0 1.6 1.4 1.2 2.6 2.5-1 5.3-.9 4.3 2 2 .6 3 1.6 3 3 0 2.6-4 4.9-9 4.9z"/><path d="M16 3.5a5 5 0 0 1 5 5"/>',
		'bilibili' => '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M8 3l2 3M16 3l-2 3M9 12v2M15 12v2"/>',
		'toc'      => '<path d="M4 6h16M4 12h10M4 18h13"/>',
	);
	$svg = $paths[ $name ] ?? '';
	return '<svg class="uo-icon' . ( $class ? ' ' . esc_attr( $class ) : '' ) . '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' . $svg . '</svg>';
}

/** Approximate reading time for mixed CJK/latin text. */
function uo_theme_reading_minutes( $post = null ) {
	$text = wp_strip_all_tags( strip_shortcodes( get_post_field( 'post_content', $post ) ) );
	$cjk = preg_match_all( '/[\x{4e00}-\x{9fff}\x{3040}-\x{30ff}]/u', $text );
	$words = str_word_count( preg_replace( '/[\x{4e00}-\x{9fff}\x{3040}-\x{30ff}]/u', ' ', $text ) );
	return max( 1, (int) ceil( $cjk / 400 + $words / 220 ) );
}
function uo_theme_word_count( $post = null ) {
	$text = wp_strip_all_tags( strip_shortcodes( get_post_field( 'post_content', $post ) ) );
	return (int) preg_match_all( '/[\x{4e00}-\x{9fff}]/u', $text ) + str_word_count( preg_replace( '/[\x{4e00}-\x{9fff}]/u', ' ', $text ) );
}

function uo_theme_cover_names() {
	return array( 'circuit', 'earth', 'workspace', 'collaboration', 'writing', 'analytics', 'cartoon-reading', 'cartoon-coding', 'cartoon-sky' );
}
/** Authored featured image, else a local decorative cover that JS may rotate. */
function uo_theme_cover( $post = null, $size = 'large', $eager = false ) {
	$post = get_post( $post );
	if ( ! $post ) { return ''; }
	$loading = $eager ? 'eager' : 'lazy';
	if ( has_post_thumbnail( $post ) ) {
		return get_the_post_thumbnail( $post, $size, array( 'loading' => $loading, 'decoding' => 'async', 'alt' => '', 'sizes' => '(max-width: 760px) 100vw, 600px' ) );
	}
	$names = uo_theme_cover_names();
	$src = add_query_arg( 'ver', wp_get_theme()->get( 'Version' ), get_theme_file_uri( 'assets/images/' . $names[ $post->ID % count( $names ) ] . '.webp' ) );
	return '<img data-uo-cover src="' . esc_url( $src ) . '" width="960" height="640" alt="" loading="' . $loading . '" decoding="async">';
}

function uo_theme_primary_category( $post = null ) {
	$cats = get_the_category( $post ? get_post( $post )->ID : 0 );
	foreach ( $cats as $cat ) { if ( 1 !== (int) $cat->term_id || count( $cats ) === 1 ) { return $cat; } }
	return $cats[0] ?? null;
}

function uo_theme_kicker( $post = null ) {
	$cat = uo_theme_primary_category( $post );
	$out = '<div class="uo-card__kicker">';
	if ( $cat ) { $out .= '<a href="' . esc_url( get_category_link( $cat ) ) . '">' . esc_html( $cat->name ) . '</a><span aria-hidden="true">/</span>'; }
	$out .= '<time datetime="' . esc_attr( get_the_date( 'c', $post ) ) . '">' . esc_html( get_the_date( 'Y.m.d', $post ) ) . '</time></div>';
	return $out;
}

function uo_theme_excerpt( $post = null, $length = 90 ) {
	$post = get_post( $post );
	$text = has_excerpt( $post ) ? $post->post_excerpt : wp_strip_all_tags( strip_shortcodes( excerpt_remove_blocks( $post->post_content ) ) );
	$text = trim( preg_replace( '/\s+/u', ' ', html_entity_decode( $text, ENT_QUOTES, 'UTF-8' ) ) );
	return mb_strlen( $text ) > $length ? mb_substr( $text, 0, $length ) . '…' : $text;
}

/** Nav items: theme option → classic menu location → first menu → top categories. */
function uo_theme_nav_items() {
	$appearance = uo_theme_appearance();
	$items = array();
	if ( ! empty( $appearance['nav'] ) ) {
		foreach ( $appearance['nav'] as $item ) { $items[] = array( 'label' => $item['label'], 'url' => $item['url'] ); }
		return $items;
	}
	$locations = get_nav_menu_locations();
	$menu = ! empty( $locations['primary'] ) ? wp_get_nav_menu_object( $locations['primary'] ) : null;
	if ( ! $menu ) { $menus = wp_get_nav_menus(); $menu = $menus[0] ?? null; }
	if ( $menu ) {
		foreach ( (array) wp_get_nav_menu_items( $menu->term_id ) as $item ) {
			if ( empty( $item->menu_item_parent ) ) { $items[] = array( 'label' => $item->title, 'url' => $item->url ); }
		}
	}
	if ( ! $items ) {
		$items[] = array( 'label' => '首页', 'url' => home_url( '/' ) );
		foreach ( get_categories( array( 'number' => 4, 'orderby' => 'count', 'order' => 'DESC', 'hide_empty' => true ) ) as $cat ) {
			$items[] = array( 'label' => $cat->name, 'url' => get_category_link( $cat ) );
		}
	}
	return $items;
}
function uo_theme_is_current_url( $url ) {
	$current = home_url( add_query_arg( array(), $GLOBALS['wp']->request ?? '' ) );
	$a = untrailingslashit( preg_replace( '#^https?://#', '', $url ) );
	$b = untrailingslashit( preg_replace( '#^https?://#', '', $current ) );
	return $a === $b;
}

function uo_theme_pagination() {
	$links = paginate_links( array( 'mid_size' => 1, 'prev_text' => '←', 'next_text' => '→', 'type' => 'plain' ) );
	if ( $links ) { echo '<nav class="uo-pagination" aria-label="分页">' . $links . '</nav>'; } // phpcs:ignore WordPress.Security.EscapeOutput -- core-escaped.
}

/** Render a card. $variant: card|feature|row. */
function uo_theme_card( $variant = 'card', $post = null ) {
	set_query_var( 'uo_card_variant', $variant );
	if ( $post ) { $GLOBALS['post'] = get_post( $post ); setup_postdata( $GLOBALS['post'] ); }
	get_template_part( 'template-parts/card', $variant );
}

function uo_theme_social_links() {
	$profile = uo_theme_appearance()['profile'];
	$out = '';
	foreach ( $profile['social'] as $item ) {
		$href = 'mail' === $item['type'] ? 'mailto:' . antispambot( $item['url'] ) : $item['url'];
		$out .= '<a href="' . esc_url( $href, array( 'http', 'https', 'mailto' ) ) . '" target="_blank" rel="noopener me" aria-label="' . esc_attr( $item['type'] ) . '">' . uo_theme_icon( $item['type'] ) . '</a>';
	}
	return $out;
}

/** Comment markup callback. */
function uo_theme_comment( $comment, $args, $depth ) {
	$tag = 'li';
	?>
	<<?php echo $tag; ?> id="comment-<?php comment_ID(); ?>" <?php comment_class( 'uo-comment-item' ); ?>>
	<article class="uo-comment">
		<?php echo get_avatar( $comment, 40 ); ?>
		<div>
			<div class="uo-comment__head"><strong><?php comment_author_link( $comment ); ?></strong><time datetime="<?php comment_time( 'c' ); ?>"><?php echo esc_html( human_time_diff( get_comment_time( 'U', true ), time() ) . '前' ); ?></time>
			<?php if ( '0' === $comment->comment_approved ) : ?><span class="uo-pending">· 等待审核</span><?php endif; ?></div>
			<div class="uo-comment__body"><?php comment_text(); ?></div>
			<?php comment_reply_link( array_merge( $args, array( 'depth' => $depth, 'max_depth' => $args['max_depth'], 'reply_text' => '回复' ) ) ); ?>
		</div>
	</article>
	<?php
}
