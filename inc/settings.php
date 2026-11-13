<?php
/** Presentation settings; WordPress owns authentication, nonces and persistence. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function uo_theme_options() {
	return wp_parse_args( get_option( 'uo_theme_options', array() ), array( 'enabled' => 1, 'roaming' => 1, 'model' => 'deepseek', 'size' => 156 ) );
}

function uo_theme_sanitize_options( $input ) {
	$input = is_array( $input ) ? $input : array();
	return array(
		'enabled' => empty( $input['enabled'] ) ? 0 : 1,
		'roaming' => empty( $input['roaming'] ) ? 0 : 1,
		'model' => in_array( $input['model'] ?? '', array( 'gpt', 'claude', 'deepseek' ), true ) ? $input['model'] : 'deepseek',
		'size' => max( 104, min( 224, absint( $input['size'] ?? 156 ) ) ),
	);
}

function uo_theme_register_settings() {
	register_setting( 'uo_theme', 'uo_theme_options', array( 'type' => 'array', 'sanitize_callback' => 'uo_theme_sanitize_options', 'show_in_rest' => false ) );
}
add_action( 'admin_init', 'uo_theme_register_settings' );

function uo_theme_settings_menu() {
	add_theme_page( 'uo-theme · 主题设置', 'uo-theme 设置', 'manage_options', 'uo-theme', 'uo_theme_settings_page' );
}
add_action( 'admin_menu', 'uo_theme_settings_menu' );

function uo_theme_settings_assets( $hook ) {
	if ( 'appearance_page_uo-theme' === $hook ) {
		wp_enqueue_style( 'uo-theme-admin', get_theme_file_uri( 'assets/css/admin.css' ), array(), wp_get_theme()->get( 'Version' ) );
	}
}
add_action( 'admin_enqueue_scripts', 'uo_theme_settings_assets' );

function uo_theme_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) { return; }
	$options = uo_theme_options();
	$models = array( 'gpt' => array( 'GPT · 白发龙娘', '银白长发，龙角与浅紫裙装' ), 'claude' => array( 'Claude · 书卷少女', '橙色长发，温暖的书卷气' ), 'deepseek' => array( 'DeepSeek · 蓝鲸女仆', '蓝色长发，鲸尾与女仆裙装' ) );
	?>
	<div class="wrap uo-settings"><div class="uo-settings-intro"><span class="uo-settings-eyebrow">UO THEME / STUDIO</span><h1>给博客一点生命力。</h1><p>选一位陪伴角色，让阅读保持安静，也带一点趣味。</p><a href="<?php echo esc_url( home_url( '/' ) ); ?>">查看博客 ↗</a></div>
	<?php settings_errors( 'uo_theme_options' ); ?>
	<form action="options.php" method="post"><?php settings_fields( 'uo_theme' ); ?>
	<section class="uo-settings-section"><h2>选择陪伴角色</h2><p>社区标准版 · 九组动态动作 · 保存后对所有访客生效</p><div class="uo-settings-models">
	<?php foreach ( $models as $id => $info ) : ?>
	<label class="uo-settings-model"><input type="radio" name="uo_theme_options[model]" value="<?php echo esc_attr( $id ); ?>" <?php checked( $options['model'], $id ); ?>>
	<span class="uo-settings-pet" style="background-image:url('<?php echo esc_url( get_theme_file_uri( 'assets/mascots/community/' . $id . '.webp' ) ); ?>')" aria-hidden="true"></span>
	<strong><?php echo esc_html( $info[0] ); ?></strong><span><?php echo esc_html( $info[1] ); ?></span></label>
	<?php endforeach; ?></div></section>
	<section class="uo-settings-section"><h2>活动方式</h2><div class="uo-settings-controls">
	<label><input type="checkbox" name="uo_theme_options[enabled]" value="1" <?php checked( $options['enabled'], 1 ); ?>> 显示看板娘</label>
	<label><input type="checkbox" name="uo_theme_options[roaming]" value="1" <?php checked( $options['roaming'], 1 ); ?>> 允许自由行走（访客仍可暂停）</label>
	<label>角色宽度 <input type="number" min="104" max="224" step="1" name="uo_theme_options[size]" value="<?php echo esc_attr( $options['size'] ); ?>"> px</label>
	<p>可拖动到页面任意位置，点击角色打开对话。尊重系统「减少动态效果」设置；本轮对话为本地静态回复。</p></div></section>
	<section class="uo-settings-section uo-settings-credit"><h2>形象来源</h2><p>社区动画包：<a href="https://github.com/savanna0425/llm-pet">savanna0425 / llm-pet</a>；形象创作：<a href="https://space.bilibili.com/4168597">ZipZipPipe</a>；DeepSeek 原设：上善。非官方同人，与模型公司无关联。</p><p>美术素材仅限署名、非商业使用；DeepSeek 另遵循 CC BY-NC-SA 4.0。素材许可独立于主题代码。<a href="https://github.com/savanna0425/llm-pet/blob/fdd821feb49b294ea8abe42c9cf41e6c52e3aacf/NOTICE.md">阅读素材使用条件 ↗</a></p></section>
	<?php submit_button( '保存设置' ); ?></form></div>
	<?php
}

/** Do not expose administrator links in anonymous HTML or shared page caches. */
function uo_theme_admin_rail() {
	if ( ! current_user_can( 'manage_options' ) ) { return; }
	$links = array( array( '⌂', '工作台', admin_url() ), array( '✎', '写文章', admin_url( 'post-new.php' ) ), array( '▤', '文章管理', admin_url( 'edit.php' ) ), array( '▧', '媒体库', admin_url( 'upload.php' ) ), array( '☏', '评论', admin_url( 'edit-comments.php' ) ), array( '✦', '看板娘与主题', admin_url( 'themes.php?page=uo-theme' ) ), array( '◈', '站点编辑器', admin_url( 'site-editor.php' ) ) );
	if ( is_singular() && current_user_can( 'edit_post', get_queried_object_id() ) ) { $links[] = array( '↗', '编辑本文', get_edit_post_link() ); }
	echo '<nav class="uo-admin-rail" aria-label="管理员快捷菜单"><details open><summary><span aria-hidden="true">◉</span> 管理空间</summary><div class="uo-admin-links">';
	foreach ( $links as $link ) { echo '<a href="' . esc_url( $link[2] ) . '"><span aria-hidden="true">' . esc_html( $link[0] ) . '</span>' . esc_html( $link[1] ) . '</a>'; }
	echo '</div></details></nav>';
}
add_action( 'wp_footer', 'uo_theme_admin_rail' );
