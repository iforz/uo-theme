<?php
/**
 * Title: AI companions
 * Slug: uo-theme/companion
 * Categories: uo-theme
 * Inserter: no
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<!-- wp:html -->
<div class="uo-companion-slot">
<div class="uo-roamer" data-uo-roamer hidden><button type="button" class="uo-sprite" data-uo-pet aria-label="拖动角色，或点击打开对话"><span data-uo-portrait aria-hidden="true"></span></button><div class="uo-pet-controls"><button type="button" data-uo-pause aria-label="暂停角色活动" aria-pressed="false">Ⅱ</button><button type="button" data-uo-hide aria-label="收起角色">×</button></div><span class="uo-pet-hint">拖动我 · 点击聊天</span></div>
<section class="uo-companion uo-side-card" hidden data-uo-companion aria-label="AI 灵感搭子">
  <div class="uo-companion-heading"><span><i class="uo-status-dot" aria-hidden="true"></i> AI 灵感搭子</span><button type="button" class="uo-icon-button uo-companion-close" data-uo-close aria-label="收起灵感搭子">×</button><span class="uo-offline-label" data-uo-mode>静态陪伴</span></div>
  <div class="uo-character-caption"><strong data-uo-name>DeepSeek · 小鲸</strong><span data-uo-tagline>好奇心，是我的小宇宙。</span></div>
  <div class="uo-dialogue"><p data-uo-reply aria-hidden="true">嗨，我是小鲸。今天也一起潜进知识的海里吧。</p><span class="uo-sr-only" data-uo-announce role="status" aria-live="polite" aria-atomic="true">嗨，我是小鲸。今天也一起潜进知识的海里吧。</span><a class="uo-recommended-link" data-uo-recommend target="_blank" rel="noopener noreferrer" title="在新标签页打开文章" hidden></a></div>
  <div class="uo-quick-actions" aria-label="快捷话题"><button type="button" data-uo-prompt="打个招呼">打个招呼</button><button type="button" data-uo-prompt="来点灵感">来点灵感</button><button type="button" data-uo-prompt="推荐阅读">推荐阅读</button></div>
  <form class="uo-companion-form" data-uo-form><label class="uo-sr-only" for="uo-companion-input">对灵感搭子说句话</label><input id="uo-companion-input" name="message" type="text" maxlength="500" placeholder="说句话，让灵感冒个泡…" autocomplete="off" disabled><button type="submit" aria-label="发送消息" disabled>↗</button></form>
  <p class="uo-pet-credit"><a href="https://github.com/savanna0425/llm-pet" target="_blank" rel="noopener noreferrer">社区动画 · llm-pet ↗</a><br>形象：ZipZipPipe / DeepSeek 原设：上善<br>非商业同人 · DeepSeek BY-NC-SA 4.0</p>
  <noscript><p class="uo-companion-noscript">开启 JavaScript 后即可切换角色和体验静态对话。</p></noscript>
</section></div>
<!-- /wp:html -->
