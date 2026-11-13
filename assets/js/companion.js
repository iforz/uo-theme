/* Optional community companion UI. Loaded after the readable document. */
(() => {
  'use strict';
  const config = window.UOThemeConfig || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const root = $('[data-uo-companion]');
  if (!root || config.options?.enabled === 0) return;
  const characters = {
    gpt: { name: 'GPT · 小缇', tag: '把复杂的事，轻轻讲明白。', alt: 'GPT 银白发小龙角社区拟人角色', accent: '#2d9f89', rgb: '45,159,137', greeting: '嗨，我是小缇。把你的好奇心带上，我们一起理清那些小问号。', touch: ['收到你的招呼啦。今天也要给好奇心留一点位置。', '小龙角感应到灵感了！先写下来，再慢慢完善。'], inspiration: ['把今天遇到的一个问题，拆成三个最小步骤。第一步小到能立刻开始就很好。', '试着用一句话解释刚学到的东西。讲得越简单，往往理解得越清楚。'] },
    claude: { name: 'Claude · 小柯', tag: '让想法，长出温柔的形状。', alt: 'Claude 橙发书卷社区拟人角色', accent: '#c77d5c', rgb: '199,125,92', greeting: '你好呀，我是小柯。给自己一点留白，让灵感慢慢长出来。', touch: ['谢谢你的招呼。先放松一下肩膀，今天也做得很好。', '如果想法还没成形，就先写下一句不完美的话吧。'], inspiration: ['挑一件最近让你停留的小事，写下它的颜色、声音和感受。细节里经常藏着好故事。', '给正在做的东西留一处呼吸的空间。有时少一点，反而更动人。'] },
    deepseek: { name: 'DeepSeek · 小鲸', tag: '好奇心，是我的小宇宙。', alt: 'DeepSeek 蓝白鲸鱼主题社区拟人角色', accent: '#558ddd', rgb: '85,141,221', greeting: '嗨，我是小鲸。今天也一起潜进知识的海里吧。', touch: ['啵！收到你的招呼啦。小鲸带着好心情，继续陪你逛。', '发现一小片灵感海域！别着急，我们再往下探一点。'], inspiration: ['今天不妨试一个“为什么”：找件习以为常的事，追问三次，说不定就有新发现。', '遇到卡住的问题，换个方向画出来。把复杂关系变成一张小图，也是一种潜水术。'] }
  };
  const stage = $('[data-uo-pet]');
  const replyNode = $('[data-uo-reply]', root);
  const recommendation = $('[data-uo-recommend]', root);
  const input = $('input', root);
  const form = $('[data-uo-form]', root);
  input.disabled = false;
  $('button[type="submit"]', form).disabled = false;
  const launcher = $('[data-uo-launch]');
  const backdrop = $('[data-uo-backdrop]');
  const mode = $('[data-uo-mode]', root);
  const tabs = $$('[data-uo-model]', root);
  let model = 'deepseek';
  let adapter = null;
  let controller = null;
  let typingTimer = 0;
  let bubbleTimer = 0;
  let sequence = 0;
  let open = false;
  let dismissed = false;
  let previousFocus = null;
  const greetings = { gpt: 0, claude: 0, deepseek: 0 };

  function cancelReply() {
    sequence += 1;
    controller?.abort(); controller = null;
    clearTimeout(typingTimer); clearTimeout(bubbleTimer);
    root.removeAttribute('aria-busy');
    form.classList.remove('uo-is-busy');
    $('button[type="submit"]', form).disabled = false;
  }
  function paintReply(text) {
    clearTimeout(typingTimer);
    const letters = Array.from(String(text).slice(0, 1500));
    replyNode.textContent = '';
    // Announce the complete response once; animated text is visual only.
    $('[data-uo-announce]', root).textContent = letters.join('');
    if (reducedMotion.matches) { replyNode.textContent = letters.join(''); return; }
    let index = 0;
    function tick() {
      index = Math.min(letters.length, index + 3);
      replyNode.textContent = letters.slice(0, index).join('');
      if (index < letters.length) typingTimer = setTimeout(tick, 24);
    }
    tick();
  }
  function setModel(value) {
    if (!Object.prototype.hasOwnProperty.call(characters, value)) return;
    cancelReply(); model = value;
    const character = characters[value];
    root.dataset.model = value;
    root.style.setProperty('--uo-character', character.accent);
    root.style.setProperty('--uo-character-rgb', character.rgb);
    $('[data-uo-name]', root).textContent = character.name;
    $('[data-uo-tagline]', root).textContent = character.tag;
    tabs.forEach((tab) => tab.setAttribute('aria-pressed', String(tab.dataset.uoModel === value)));
    stage.setAttribute('aria-label', `和 ${character.name.split(' · ')[0]} 打招呼`);
    stage.setAttribute('aria-label', `${character.alt}，拖动或点击聊天`);
    recommendation.hidden = true;
    root.classList.remove('uo-character-enter');
    void root.offsetWidth;
    root.classList.add('uo-character-enter');
    paintReply(character.greeting);
    document.dispatchEvent(new CustomEvent('uo-theme:companion:model', { detail: { model } }));
  }
  function localReply(message) {
    const character = characters[model];
    if (/推荐|文章|阅读/.test(message) && Array.isArray(config.recentPosts) && config.recentPosts.length) {
      const post = config.recentPosts[greetings[model]++ % config.recentPosts.length];
      return { reply: '给你挑了一篇手记，或许正好能碰出一点新想法。', recommendation: post };
    }
    if (/灵感|想法|创作/.test(message)) return { reply: character.inspiration[(greetings[model]++) % character.inspiration.length] };
    if (/累|难过|焦虑|烦/.test(message)) return { reply: '先给自己一小段休息时间吧。喝口水，看看窗外，回来后只做最小的一步也很好。' };
    if (/谢谢|感谢/.test(message)) return { reply: '不客气呀。把这份好心情收好，我们下次再一起找灵感。' };
    if (/你好|招呼|嗨|hello/i.test(message)) return { reply: character.touch[(greetings[model]++) % character.touch.length] };
    return { reply: character.inspiration[(greetings[model]++) % character.inspiration.length] };
  }
  async function send(message) {
    message = String(message).trim().slice(0, 500);
    if (!message) return;
    cancelReply();
    const currentSequence = sequence;
    const currentModel = model;
    controller = new AbortController();
    root.setAttribute('aria-busy', 'true');
    form.classList.add('uo-is-busy');
    $('button[type="submit"]', form).disabled = true;
    recommendation.hidden = true;
    replyNode.textContent = adapter ? '稍等一下，灵感正在路上…' : '让我想一想…';
    try {
      const result = adapter
        ? await adapter({ model: currentModel, message, context: Object.freeze({ ...(config.context || {}) }), signal: controller.signal })
        : await new Promise((resolve) => { bubbleTimer = setTimeout(() => resolve(localReply(message)), reducedMotion.matches ? 0 : 280); });
      if (currentSequence !== sequence || model !== currentModel) return;
      const reply = typeof result === 'string' ? result : result?.reply;
      if (typeof reply !== 'string' || !reply.trim()) throw new Error('Invalid companion response');
      paintReply(reply);
      if (!adapter && result.recommendation?.url) {
        try {
          const url = new URL(result.recommendation.url, location.href);
          if (url.origin === location.origin && /^https?:$/.test(url.protocol)) {
            recommendation.href = url.href;
            recommendation.textContent = `${result.recommendation.title} ↗`;
            recommendation.hidden = false;
          }
        } catch (_) { /* Keep an invalid recommendation out of the UI. */ }
      }
      document.dispatchEvent(new CustomEvent('uo-theme:companion:message', { detail: { model: currentModel, message, reply } }));
    } catch (error) {
      if (currentSequence === sequence && error?.name !== 'AbortError') paintReply('刚刚走神了一下。再试一次，或者换个话题吧。');
    } finally {
      if (currentSequence === sequence) {
        root.removeAttribute('aria-busy'); form.classList.remove('uo-is-busy');
        $('button[type="submit"]', form).disabled = false;
      }
    }
  }
  function launcherState() {
    launcher?.classList.toggle('uo-launcher-visible', dismissed);
    document.dispatchEvent(new CustomEvent('uo-theme:companion:visibility', { detail: { open, dismissed } }));
    launcher?.setAttribute('aria-expanded', String(open));
  }
  function openCompanion() {
    if (open) return;
    previousFocus = document.activeElement;
    dismissed = false; open = true; root.hidden = false;
    root.classList.add('uo-is-open'); root.classList.remove('uo-is-dismissed');
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
    document.body.classList.add('uo-companion-modal-open');
    if (backdrop) backdrop.hidden = false;
    launcherState();
    $('[data-uo-close]', root)?.focus();
  }
  function closeCompanion() {
    if (open) {
      open = false; root.hidden = true;
      root.classList.remove('uo-is-open'); root.removeAttribute('role'); root.removeAttribute('aria-modal');
      document.body.classList.remove('uo-companion-modal-open');
      if (backdrop) backdrop.hidden = true;
      launcherState();
      if (previousFocus?.getClientRects().length) previousFocus.focus();
      else stage.focus();
    } else {
      dismissed = true;
      root.classList.add('uo-is-dismissed');
      launcherState(); launcher?.focus();
    }
  }
  launcher?.addEventListener('click', () => open ? closeCompanion() : openCompanion());
  $('[data-uo-close]', root)?.addEventListener('click', closeCompanion);
  backdrop?.addEventListener('click', closeCompanion);
  tabs.forEach((tab) => tab.addEventListener('click', () => setModel(tab.dataset.uoModel)));
  stage.addEventListener('click', () => {
    if (stage.dataset.dragged === 'true') return;
    openCompanion(); send('打个招呼');
  });
  $$('[data-uo-prompt]', root).forEach((button) => button.addEventListener('click', () => send(button.dataset.uoPrompt)));
  form.addEventListener('submit', (event) => { event.preventDefault(); const message = input.value; input.value = ''; send(message); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (open) closeCompanion();
      if (searchPanel && !searchPanel.hidden) { closeSearch(); searchButton?.focus(); }
    }
    if (event.key === 'Tab' && open) {
      const focusable = $$('button:not([disabled]), input, a[href]', root).filter((element) => !element.hidden && element.getClientRects().length);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
    }
  });
  window.UOTheme = window.UOTheme || {};
  window.UOTheme.companion = Object.freeze({
    setAdapter(handler) {
      if (handler !== null && typeof handler !== 'function') throw new TypeError('Companion adapter must be a function or null');
      cancelReply(); adapter = handler;
      mode.textContent = handler ? '在线陪伴' : '静态陪伴';
      paintReply(characters[model].greeting);
    },
    select: setModel,
    open: openCompanion,
    close: closeCompanion,
    getModel: () => model,
    getMode: () => adapter ? 'adapter' : 'static'
  });
  const preferredModel = config.options?.model;
  setModel(Object.prototype.hasOwnProperty.call(characters, preferredModel) ? preferredModel : 'deepseek');
  launcherState();
  document.dispatchEvent(new CustomEvent('uo-theme:companion:ready', { detail: { api: window.UOTheme.companion } }));
})();

