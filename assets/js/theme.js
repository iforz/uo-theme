/* uo-theme: local presentation interactions; no AI service is called by default. */
(() => {
  'use strict';
  const config = window.UOThemeConfig || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) { /* Storage is optional. */ } }
  };
  document.documentElement.classList.add('uo-js');
  const schemeButton = $('button[data-uo-scheme]');
  function setScheme(value) {
    document.documentElement.dataset.uoScheme = value;
    document.documentElement.style.colorScheme = value;
    document.documentElement.style.backgroundColor = 'var(--wp--preset--color--paper)';
    document.body.dataset.uoScheme = value;
    if (schemeButton) {
      schemeButton.setAttribute('aria-pressed', String(value === 'dark'));
      schemeButton.setAttribute('aria-label', value === 'dark' ? '切换浅色模式' : '切换深色模式');
    }
  }
  const storedScheme = document.documentElement.dataset.uoScheme || storage.get('uo-theme:scheme');
  setScheme(storedScheme === 'dark' || storedScheme === 'light' ? storedScheme : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  schemeButton?.addEventListener('click', () => {
    const value = document.body.dataset.uoScheme === 'dark' ? 'light' : 'dark';
    setScheme(value); storage.set('uo-theme:scheme', value);
  });
  const searchButton = $('[data-uo-search-toggle]');
  const searchPanel = $('#uo-site-search');
  function closeSearch() {
    if (searchPanel) searchPanel.hidden = true;
    searchButton?.setAttribute('aria-expanded', 'false');
  }
  searchButton?.addEventListener('click', () => {
    const open = searchPanel.hidden;
    searchPanel.hidden = !open;
    searchButton.setAttribute('aria-expanded', String(open));
    if (open) $('input', searchPanel)?.focus();
  });
  document.addEventListener('click', (event) => {
    if (searchPanel && !searchPanel.hidden && !searchPanel.contains(event.target) && !searchButton.contains(event.target)) closeSearch();
  });
  if ($('.uo-layout > .uo-main')) document.documentElement.classList.add('uo-shell');
  const scrollArea = () => matchMedia('(min-width: 1100px)').matches && document.documentElement.classList.contains('uo-shell') ? $('.uo-main') : document.scrollingElement;
  const progress = $('[data-uo-progress]');
  const backTop = $('[data-uo-top]');
  let scrollQueued = false;
  function updateScroll() {
    const area = scrollArea();
    const top = area?.scrollTop || 0;
    const limit = (area?.scrollHeight || 0) - (area?.clientHeight || window.innerHeight);
    if (progress) progress.style.transform = `scaleX(${limit > 0 ? Math.min(1, top / limit) : 0})`;
    if (backTop) backTop.hidden = top < 600;
    document.body.classList.toggle('uo-scrolled', top > 24);
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  document.addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); } }, { passive: true, capture: true });
  document.addEventListener('uo-theme:navigated', updateScroll);
  window.addEventListener('resize', updateScroll, { passive: true });
  backTop?.addEventListener('click', () => scrollArea()?.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
  updateScroll();
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('uo-is-visible'); revealObserver.unobserve(entry.target); }
    }), { threshold: 0.06 });
    $$('.uo-reveal').forEach((item) => { item.classList.add('uo-will-reveal'); revealObserver.observe(item); });
  }

  // Optional companions start after load so their scripts cannot prolong the initial document load.
  if (config.options?.enabled !== 0) {
    const nonce = document.currentScript?.nonce;
    function loadOptional(src, done) {
      if (!src) return;
      let url;
      try { url = new URL(src, location.href); } catch (_) { return; }
      if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
      const script = document.createElement('script');
      script.src = url.href; script.async = true; script.fetchPriority = 'low';
      if (nonce) script.nonce = nonce;
      if (done) script.onload = done;
      document.head.appendChild(script);
    }
    const start = () => loadOptional(config.scripts?.companion, () => loadOptional(config.scripts?.roaming));
    const idle = () => { if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1500 }); else setTimeout(start, 100); };
    if (document.readyState === 'complete') idle();
    else window.addEventListener('load', idle, { once: true });
  }
})();

// The compact admin rail starts collapsed on narrow screens and remains keyboard operable.
(() => {
  const details = document.querySelector('.uo-admin-rail details');
  if (!details) return;
  const compact = matchMedia('(max-width: 1099px)');
  const update = () => { details.open = !compact.matches; };
  update(); compact.addEventListener('change', update);
})();

// Native WP operations stay in a same-origin dialog, including their original forms/nonces.
(() => {
  const dialog = document.querySelector('#uo-admin-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const frame = dialog.querySelector('[data-uo-admin-frame]');
  const title = dialog.querySelector('#uo-admin-title');
  const status = dialog.querySelector('[data-uo-admin-status]');
  let opener;
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-uo-admin]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !url.pathname.includes('/wp-admin/')) return;
    event.preventDefault(); opener = link;
    title.textContent = link.textContent.trim();
    dialog.querySelector('[data-uo-admin-full]').href = url.href;
    if (frame.dataset.entry !== url.href) { frame.dataset.entry = url.href; frame.src = url.href; status.textContent = '正在打开管理界面…'; }
    dialog.showModal();
  });
  frame.addEventListener('load', () => {
    status.textContent = '请在编辑界面保存更改；收起后可继续编辑。';
    try {
      const url = new URL(frame.contentWindow.location.href);
      if (url.origin === location.origin) dialog.querySelector('[data-uo-admin-full]').href = url.href;
    } catch (_) { status.textContent = '该界面可通过“独立窗口”打开。'; }
  });
  dialog.querySelector('[data-uo-admin-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus());
})();

// Low-cost pointer ornament: one transform per input frame, no permanent animation loop.
(() => {
  const media = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const halo = document.createElement('div'); halo.className = 'uo-cursor-halo'; halo.setAttribute('aria-hidden', 'true');
  document.body.appendChild(halo);
  let queued = false, x = 0, y = 0;
  document.addEventListener('pointermove', (event) => {
    if (!media.matches || event.pointerType !== 'mouse') { halo.style.opacity = '0'; return; }
    x = event.clientX; y = event.clientY;
    halo.toggleAttribute('data-active', !!event.target.closest('a,button,summary,input,select,textarea,[role="button"]'));
    if (!queued) { queued = true; requestAnimationFrame(() => { halo.style.transform = `translate3d(${x}px,${y}px,0)`; halo.style.opacity = '1'; queued = false; }); }
  }, { passive: true });
  document.addEventListener('pointerdown', () => halo.setAttribute('data-down', ''));
  document.addEventListener('pointerup', () => halo.removeAttribute('data-down'));
  document.documentElement.addEventListener('pointerleave', () => { halo.style.opacity = '0'; halo.removeAttribute('data-down'); });
  window.addEventListener('blur', () => { halo.style.opacity = '0'; halo.removeAttribute('data-down'); });
  media.addEventListener('change', () => { if (!media.matches) halo.style.opacity = '0'; });
})();

// Fetch real HTML documents; incompatible pages and errors retain normal browser navigation.
(() => {
  if (!window.fetch || !window.AbortController || !window.DOMParser || !history.pushState || !document.querySelector('.uo-main')) return;
  const $ = (s, root = document) => root.querySelector(s);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.createElement('div'); progress.className = 'uo-route-progress'; progress.setAttribute('aria-hidden', 'true'); document.body.appendChild(progress);
  const status = document.createElement('div'); status.className = 'uo-route-status'; status.hidden = true; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); document.body.appendChild(status);
  let active, sequence = 0, transition, scrollTimer;
  const area = () => document.documentElement.classList.contains('uo-shell') && matchMedia('(min-width:1100px)').matches ? $('.uo-main') : document.scrollingElement;
  const position = () => ({ x: area()?.scrollLeft || 0, y: area()?.scrollTop || 0 });
  const save = () => history.replaceState({ ...history.state, uo: { url: location.href, ...position() } }, '', location.href);
  save(); history.scrollRestoration = 'manual';
  document.addEventListener('scroll', () => { clearTimeout(scrollTimer); scrollTimer = setTimeout(() => { if (!active) save(); }, 120); }, { capture: true, passive: true });
  function eligible(link, event) {
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self') || link.closest('[data-uo-no-nav],.uo-admin-rail,.uo-admin-dialog,.uo-companion')) return false;
    const url = new URL(link.href, location.href);
    if (!/^https?:$/.test(url.protocol) || url.origin !== location.origin || url.username || url.password) return false;
    if (url.pathname === location.pathname && url.search === location.search) return false;
    if (/\/(wp-admin|wp-json|wp-content|wp-includes|feed)(\/|$)|\/(wp-login|wp-cron|xmlrpc)\.php$/i.test(url.pathname) || /(?:^|[?&])(rest_route|preview|customize_changeset_uuid)=/i.test(url.search)) return false;
    return true;
  }
  const assets = doc => Array.from(doc.querySelectorAll('script[src],link[rel="stylesheet"]')).filter(el => !Object.values(window.UOThemeConfig?.scripts || {}).includes(el.src)).map(el => `${el.tagName}:${el.getAttribute('src') || el.getAttribute('href')}`).sort().join('\n');
  function metadata(next) {
    document.title = next.title;
    const selector = 'meta[name="description"],meta[name="robots"],meta[property^="og:"],meta[name^="twitter:"],link[rel="canonical"],link[rel="prev"],link[rel="next"],script[type="application/ld+json"]';
    document.head.querySelectorAll(selector).forEach(el => el.remove());
    next.head.querySelectorAll(selector).forEach(el => document.head.appendChild(el.cloneNode(true)));
    // Block styles can vary between server-rendered templates.
    document.head.querySelectorAll('style[data-uo-route-style]').forEach(el => el.remove());
    next.head.querySelectorAll('style').forEach(el => {
      const current = el.id && document.getElementById(el.id);
      if (current) { if (current.textContent !== el.textContent) current.textContent = el.textContent; }
      else { const copy = el.cloneNode(true); copy.setAttribute('data-uo-route-style', ''); document.head.appendChild(copy); }
    });
  }
  async function navigate(url, { pop = false, state = null } = {}) {
    active?.abort(); transition?.skipTransition();
    const controller = new AbortController(); active = controller; const id = ++sequence;
    document.body.classList.add('uo-routing'); $('.uo-main')?.setAttribute('aria-busy', 'true');
    const hint = setTimeout(() => { if (id === sequence) { status.textContent = '正在加载内容…'; status.hidden = false; } }, 250);
    const timeout = setTimeout(() => controller.abort('timeout'), 8000);
    try {
      const response = await fetch(url.href, { credentials: 'same-origin', signal: controller.signal, headers: { Accept: 'text/html' }, cache: 'no-cache' });
      if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) throw Error('Full navigation required');
      const finalURL = new URL(response.url);
      if (finalURL.origin !== location.origin) throw Error('Cross-origin redirect');
      const next = new DOMParser().parseFromString(await response.text(), 'text/html');
      if (id !== sequence) return;
      const oldMain = $('.uo-main'), newMain = $('.uo-main', next);
      if (!oldMain || !newMain || !$('.uo-layout', next) || !!$('.uo-admin-rail') !== !!$('.uo-admin-rail', next) || assets(document) !== assets(next) || newMain.querySelector('script,iframe,object,embed') || document.body.classList.contains('logged-in') !== next.body.classList.contains('logged-in')) throw Error('Full navigation required');
      const update = () => {
        if (id !== sequence) return;
        oldMain.replaceWith(newMain);
        newMain.querySelectorAll('.uo-reveal').forEach(el => el.classList.add('uo-is-visible'));
        metadata(next);
        document.body.className = next.body.className;
        document.body.dataset.uoScheme = document.documentElement.dataset.uoScheme;
        const nextRail = $('.uo-admin-links', next), rail = $('.uo-admin-links');
        if (nextRail && rail) rail.replaceChildren(...nextRail.childNodes);
        if (!pop) { history.pushState({ ...history.state, uo: { url: finalURL.href, x: 0, y: 0 } }, '', finalURL.href); }
        document.querySelectorAll('.uo-header a[href]').forEach(a => {
          const current = a.href === finalURL.href;
          if (current) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
          a.closest('.wp-block-navigation-item')?.classList.toggle('current-menu-item', current);
        });
        area()?.scrollTo({ top: pop ? (state?.y || 0) : 0, left: pop ? (state?.x || 0) : 0, behavior: 'instant' });
        if (finalURL.hash) { try { document.getElementById(decodeURIComponent(finalURL.hash.slice(1)))?.scrollIntoView(); } catch (_) {} }
        const cfg = Array.from(next.querySelectorAll('script')).find(s => s.textContent.startsWith('window.UOThemeConfig = '));
        if (cfg) { try { const value = JSON.parse(cfg.textContent.trim().slice('window.UOThemeConfig = '.length).replace(/;$/, '')); Object.assign(window.UOThemeConfig.context, value.context); } catch (_) {} }
        closeSearchForNavigation();
        newMain.setAttribute('tabindex', '-1'); newMain.focus({ preventScroll: true });
        document.dispatchEvent(new CustomEvent('uo-theme:navigated', { detail: { url: finalURL.href, title: next.title } }));
        status.textContent = `已加载：${next.title}`;
      };
      if (document.startViewTransition && !reduced.matches) { transition = document.startViewTransition(update); await transition.updateCallbackDone; transition.finished.catch(() => {}); }
      else update();
    } catch (error) {
      if (id !== sequence) return;
      if (pop) location.replace(url.href); else location.assign(url.href);
    } finally {
      clearTimeout(timeout); clearTimeout(hint);
      if (id === sequence) { active = null; document.body.classList.remove('uo-routing'); $('.uo-main')?.removeAttribute('aria-busy'); status.hidden = true; }
    }
  }
  function closeSearchForNavigation() {
    const panel = $('#uo-site-search'); if (panel) panel.hidden = true;
    $('[data-uo-search-toggle]')?.setAttribute('aria-expanded', 'false');
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!eligible(link, event)) return;
    save(); event.preventDefault(); navigate(new URL(link.href, location.href));
  });
  document.addEventListener('submit', event => {
    const form = event.target;
    if (event.defaultPrevented || !form.matches('#uo-site-search form') || form.method.toLowerCase() !== 'get') return;
    const url = new URL(form.action, location.href);
    if (url.origin !== location.origin) return;
    url.search = new URLSearchParams(new FormData(form)).toString();
    save(); event.preventDefault(); navigate(url);
  });
  document.querySelector('[data-uo-refresh]')?.addEventListener('click', () => { save(); navigate(new URL(location.href), { pop: true, state: { ...position() } }); });
  window.addEventListener('popstate', event => {
    if (!event.state?.uo) { location.reload(); return; }
    navigate(new URL(location.href), { pop: true, state: event.state.uo });
  });
})();

// Article tools use the displayed content and canonical permalink; no external share SDK.
(() => {
  async function copy(value) {
    if (navigator.clipboard?.writeText && window.isSecureContext) { await navigator.clipboard.writeText(value); return; }
    const input = document.createElement('textarea'); input.value = value; input.setAttribute('readonly', '');
    input.style.cssText = 'position:fixed;left:-9999px;top:0;'; document.body.appendChild(input); input.select();
    let ok = false; try { ok = document.execCommand('copy'); } finally { input.remove(); }
    if (!ok) throw Error('Clipboard unavailable');
  }
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-uo-copy-text],[data-uo-copy-link],[data-uo-share]');
    const tools = button?.closest('[data-uo-article-actions]'); if (!tools || button.disabled) return;
    const status = tools.querySelector('[data-uo-action-status]');
    button.disabled = true;
    try {
      if (button.hasAttribute('data-uo-copy-text')) {
        const content = tools.previousElementSibling;
        if (!content?.classList.contains('uo-reading-content')) throw Error('Content missing');
        await copy(`${tools.dataset.title}\n\n${content.innerText || content.textContent}\n\n来源：${tools.dataset.url}`);
        status.textContent = '正文已复制，已附原文链接。';
      } else if (button.hasAttribute('data-uo-share') && navigator.share) {
        await navigator.share({ title: tools.dataset.title, url: tools.dataset.url }); status.textContent = '分享完成。';
      } else { await copy(tools.dataset.url); status.textContent = button.hasAttribute('data-uo-share') ? '文章链接已复制，可以粘贴分享。' : '原文链接已复制。'; }
    } catch (error) { status.textContent = error.name === 'AbortError' ? '已取消分享。' : '暂时无法自动复制或分享，请使用浏览器菜单。'; }
    finally { button.disabled = false; }
  });
})();

// Native dialog image preview, with normal image links retained when dialogs are unavailable.
(() => {
  const dialog = document.createElement('dialog');
  if (typeof dialog.showModal !== 'function') return;
  dialog.className = 'uo-image-dialog'; dialog.setAttribute('aria-label', '图片预览');
  const close = document.createElement('button'); close.type = 'button'; close.className = 'uo-icon-button'; close.textContent = '×'; close.setAttribute('aria-label', '关闭图片预览');
  const image = document.createElement('img'), caption = document.createElement('p');
  dialog.append(close, image, caption); document.body.appendChild(dialog);
  let opener;
  const selector = '.uo-reading-content img, .uo-reading-card > .wp-block-post-featured-image img';
  function prepare() { document.querySelectorAll(selector).forEach(img => { if (!img.closest('a')) { img.tabIndex = 0; img.setAttribute('role', 'button'); img.setAttribute('aria-haspopup', 'dialog'); } }); }
  function open(img, event) {
    if (!img?.matches(selector)) return;
    const link = img.closest('a');
    if (link && !/\.(?:png|jpe?g|webp|gif|avif)(?:[?#]|$)/i.test(link.href)) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const src = new URL(img.currentSrc || img.src, location.href); if (!/^https?:$/.test(src.protocol)) return;
    event.preventDefault(); opener = img; image.src = src.href; image.alt = img.alt || ''; caption.textContent = img.alt || '图片预览'; dialog.showModal();
  }
  document.addEventListener('click', event => open(event.target.closest('img'), event));
  document.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && event.target.matches(selector) && !event.target.closest('a')) open(event.target, event); });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { image.removeAttribute('src'); opener?.focus(); });
  prepare(); document.addEventListener('uo-theme:navigated', prepare);
})();

// Shuffle only decorative fallback covers. Authored featured images are never replaced.
(() => {
  const covers = (window.UOThemeConfig?.covers || []).filter(src => { try { return new URL(src, location.href).origin === location.origin; } catch (_) { return false; } });
  if (covers.length < 2) return;
  function randomize() {
    let bag = [], last = '';
    document.querySelectorAll('img[data-uo-cover]').forEach(img => {
      if (!bag.length) {
        bag = [...covers];
        for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
        if (bag.at(-1) === last) [bag[0], bag[bag.length - 1]] = [bag.at(-1), bag[0]];
      }
      const src = bag.pop(); img.src = src; last = src;
    });
  }
  randomize(); document.addEventListener('uo-theme:navigated', randomize);
})();
