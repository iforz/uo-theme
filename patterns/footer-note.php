<?php
/**
 * Title: Copyright, registration, credits and reading controls
 * Slug: uo-theme/footer-note
 * Categories: uo-theme
 * Inserter: no
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$footer = uo_theme_footer_options();
?>
<!-- wp:html -->
<div class="uo-footer-legal"><span><?php echo esc_html( $footer['copyright'] ); ?></span><?php if ( $footer['icp'] ) : ?><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $footer['icp'] ); ?></a><?php endif; ?></div>
<details class="uo-footer-credits"><summary>主题与素材署名 <span aria-hidden="true">↗</span></summary><div class="uo-credit-panel"><p>主题 <a href="https://github.com/iforz/uo-theme" target="_blank" rel="noopener noreferrer">uo-theme</a> · WordPress</p><p>社区角色：<a href="https://github.com/savanna0425/llm-pet" target="_blank" rel="noopener noreferrer">savanna0425 / llm-pet</a>；形象：ZipZipPipe；DeepSeek 原设：上善。非官方同人，署名及非商业使用；DeepSeek 另遵循 CC BY-NC-SA 4.0。<a href="https://github.com/savanna0425/llm-pet/blob/fdd821feb49b294ea8abe42c9cf41e6c52e3aacf/NOTICE.md" target="_blank" rel="noopener noreferrer">素材许可</a></p><p>封面为主题示意配图，来自 <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer">Unsplash</a>：<a href="https://unsplash.com/photos/FO7JIlwjOtU" target="_blank" rel="noopener noreferrer">Alexandre Debiève · 电路板</a>、<a href="https://unsplash.com/photos/Q1p7bh3SHj8" target="_blank" rel="noopener noreferrer">NASA · 地球</a>；另有<a href="https://images.unsplash.com/photo-1498050108023-c5249f4df085" target="_blank" rel="noopener noreferrer">工作台</a>、<a href="https://images.unsplash.com/photo-1519389950473-47ba0277781c" target="_blank" rel="noopener noreferrer">协作</a>、<a href="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" target="_blank" rel="noopener noreferrer">书写</a>、<a href="https://images.unsplash.com/photo-1460925895917-afdab827c52f" target="_blank" rel="noopener noreferrer">数据</a>。正文中原有的来源引用随文章保留。</p></div></details>
<div class="uo-reading-progress" aria-hidden="true"><span data-uo-progress></span></div><button type="button" class="uo-back-top uo-icon-button" data-uo-top aria-label="回到顶部" hidden>↑</button><button class="uo-companion-launcher" type="button" data-uo-launch aria-label="打开 AI 灵感搭子" aria-expanded="false"><span aria-hidden="true">✦</span><span>灵感搭子</span></button><button type="button" class="uo-companion-backdrop" data-uo-backdrop aria-label="关闭灵感搭子" hidden tabindex="-1"></button>
<!-- /wp:html -->
