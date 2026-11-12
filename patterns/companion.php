<?php
/**
 * Title: AI companions
 * Slug: uo-theme/companion
 * Categories: uo-theme
 * Inserter: no
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$uo_portrait = file_exists( get_theme_file_path( 'assets/mascots/deepseek.webp' ) ) ? 'deepseek.webp' : 'deepseek.png';
?>
<!-- wp:html -->
<div class="uo-companion-slot">
<section class="uo-companion uo-side-card" data-uo-companion aria-label="AI 灵感搭子">
  <div class="uo-companion-heading"><span><i class="uo-status-dot" aria-hidden="true"></i> AI 灵感搭子</span><button type="button" class="uo-icon-button uo-companion-close" data-uo-close aria-label="收起灵感搭子">×</button><span class="uo-offline-label" data-uo-mode>静态陪伴</span></div>
  <div class="uo-model-tabs" role="group" aria-label="选择陪伴角色"><button type="button" data-uo-model="gpt" aria-pressed="false"><i class="uo-model-dot uo-dot-gpt" aria-hidden="true"></i>GPT</button><button type="button" data-uo-model="claude" aria-pressed="false"><i class="uo-model-dot uo-dot-claude" aria-hidden="true"></i>Claude</button><button type="button" data-uo-model="deepseek" aria-pressed="true"><i class="uo-model-dot uo-dot-deepseek" aria-hidden="true"></i>DeepSeek</button></div>
  <button type="button" class="uo-portrait-stage" data-uo-pet aria-label="和 DeepSeek 打招呼"><span class="uo-portrait-orbit" aria-hidden="true"></span><span class="uo-portrait-spark uo-spark-one" aria-hidden="true">✦</span><span class="uo-portrait-spark uo-spark-two" aria-hidden="true">✧</span><img data-uo-portrait src="<?php echo esc_url( get_theme_file_uri( 'assets/mascots/' . $uo_portrait ) ); ?>" width="768" height="1152" alt="DeepSeek 蓝白鲸鱼主题原创拟人角色" loading="lazy" decoding="async"><span class="uo-touch-hint">轻轻点我，打个招呼</span></button>
  <div class="uo-character-caption"><strong data-uo-name>DeepSeek · 小鲸</strong><span data-uo-tagline>好奇心，是我的小宇宙。</span></div>
  <div class="uo-dialogue"><p data-uo-reply aria-hidden="true">嗨，我是小鲸。今天也一起潜进知识的海里吧。</p><span class="uo-sr-only" data-uo-announce role="status" aria-live="polite" aria-atomic="true">嗨，我是小鲸。今天也一起潜进知识的海里吧。</span><a class="uo-recommended-link" data-uo-recommend hidden></a></div>
  <div class="uo-quick-actions" aria-label="快捷话题"><button type="button" data-uo-prompt="打个招呼">打个招呼</button><button type="button" data-uo-prompt="来点灵感">来点灵感</button><button type="button" data-uo-prompt="推荐阅读">推荐阅读</button></div>
  <form class="uo-companion-form" data-uo-form><label class="uo-sr-only" for="uo-companion-input">对灵感搭子说句话</label><input id="uo-companion-input" name="message" type="text" maxlength="500" placeholder="说句话，让灵感冒个泡…" autocomplete="off" disabled><button type="submit" aria-label="发送消息" disabled>↗</button></form>
  <noscript><p class="uo-companion-noscript">开启 JavaScript 后即可切换角色和体验静态对话。</p></noscript>
</section></div>
<!-- /wp:html -->
