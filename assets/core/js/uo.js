/* uo-theme core · front interactions. Engine-agnostic: depends only on the markup
 * contract (docs/MARKUP-CONTRACT.md) and the optional window.UOThemeConfig object. */
(() => {
  'use strict';
  const config = window.UOThemeConfig || (window.UOThemeConfig = {});
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) { /* optional */ } }
  };
  const hooks = { content: [] };
  let spy; // TOC scroll observer (declared before the first onContent run)
  const UO = window.UO = window.UO || {};
  UO.onContent = fn => { hooks.content.push(fn); fn(document); };
  root.classList.add('uo-js');

  /* Toast */
  let toastEl, toastTimer;
  UO.toast = (text) => {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'uo-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = text; toastEl.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2200);
  };
  async function copy(value) {
    if (navigator.clipboard?.writeText && window.isSecureContext) { await navigator.clipboard.writeText(value); return; }
    const t = document.createElement('textarea'); t.value = value; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.appendChild(t); t.select(); let ok = false; try { ok = document.execCommand('copy'); } finally { t.remove(); }
    if (!ok) throw Error('Clipboard unavailable');
  }
  UO.copy = copy;

  /* Blocked avatar services fall back to a neutral initial. */
  document.addEventListener('error', e => {
    const img = e.target; if (!(img instanceof HTMLImageElement) || !img.matches('.uo-avatar, .uo-profile img, .uo-comment img.avatar, .uo-author img')) return;
    const span = document.createElement('span'); span.className = `${img.className} uo-avatar-fallback`; span.textContent = (img.closest('[data-uo-name]')?.dataset.uoName || img.alt || '·').trim().slice(0, 1);
    span.style.width = `${img.width || 26}px`; span.style.height = `${img.height || 26}px`; img.replaceWith(span);
  }, true);

  /* Color scheme */
  function setScheme(value) {
    root.dataset.uoScheme = value; root.style.colorScheme = value; root.style.backgroundColor = '';
    $$('[data-uo-scheme-toggle]').forEach(b => { b.setAttribute('aria-pressed', String(value === 'dark')); b.setAttribute('aria-label', value === 'dark' ? '切换到浅色' : '切换到深色'); });
  }
  setScheme(root.dataset.uoScheme === 'dark' ? 'dark' : 'light');
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-uo-scheme-toggle]'); if (!b) return;
    const next = root.dataset.uoScheme === 'dark' ? 'light' : 'dark';
    const apply = () => { setScheme(next); store.set('uo-theme:scheme', next); };
    if (document.startViewTransition && !reduced.matches) document.startViewTransition(apply); else apply();
  });

  /* Mobile nav */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-uo-menu-toggle]');
    if (t) { const open = document.body.classList.toggle('uo-nav-open'); t.setAttribute('aria-expanded', String(open)); return; }
    if (document.body.classList.contains('uo-nav-open') && !e.target.closest('.uo-nav')) { document.body.classList.remove('uo-nav-open'); $('[data-uo-menu-toggle]')?.setAttribute('aria-expanded', 'false'); }
  });

  /* Scroll: header state, progress, back-to-top */
  const progress = $('[data-uo-progress]'), top = $('[data-uo-top]');
  let queued = false;
  function onScroll() {
    queued = false;
    const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    document.body.classList.toggle('uo-scrolled', y > 8);
    if (progress) progress.style.transform = `scaleX(${$('[data-uo-content]') && max > 0 ? Math.min(1, y / max) : 0})`;
    if (top) top.hidden = y < 640;
  }
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  top?.addEventListener('click', () => scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' }));
  onScroll();

  /* Reveal */
  const io = 'IntersectionObserver' in window && !reduced.matches ? new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -6% 0px', threshold: .04 }) : null;
  UO.onContent(scope => {
    $$('.uo-reveal', scope).forEach((el, i) => { el.style.setProperty('--uo-i', String(i % 6)); if (io) io.observe(el); else el.classList.add('is-in'); });
  });

  /* Prose enhancements: anchors, code copy, zoomable images */
  function slug(text, used) {
    let base = text.trim().toLowerCase().replace(/[\s\u3000]+/g, '-').replace(/[^\p{L}\p{N}-]/gu, '').slice(0, 48) || 'section';
    let s = base, n = 2; while (used.has(s) || document.getElementById(s)) s = `${base}-${n++}`; used.add(s); return s;
  }
  UO.onContent(scope => {
    const prose = $('[data-uo-content]', scope) || (scope.matches?.('[data-uo-content]') ? scope : null);
    if (!prose) return;
    const used = new Set();
    // Many CJK posts mark sections as short "一、…" paragraphs; present them as headings.
    if (!$('h2', prose)) {
      $$(':scope > p', prose).forEach(p => {
        const t = p.textContent.trim();
        if (t.length <= 32 && /^([一二三四五六七八九十]+、|第[一二三四五六七八九十0-9]+[部章节步]|\d{1,2}[、.．]\s*\S)/.test(t) && !p.querySelector('img,br')) { const h2 = document.createElement('h2'); h2.innerHTML = p.innerHTML; h2.dataset.uoFromP = ''; p.replaceWith(h2); }
      });
    }
    const heads = $$('h2, h3', prose).filter(h => h.textContent.trim());
    heads.forEach(h => {
      if (!h.id) h.id = slug(h.textContent, used);
      if (!$('.uo-anchor', h)) { const a = document.createElement('a'); a.className = 'uo-anchor'; a.href = `#${h.id}`; a.textContent = '#'; a.setAttribute('aria-hidden', 'true'); a.tabIndex = -1; h.prepend(a); }
    });
    $$('pre', prose).forEach(pre => {
      if ($('.uo-code-copy', pre)) return;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'uo-code-copy'; b.textContent = '复制';
      b.addEventListener('click', async () => { try { await copy((pre.querySelector('code') || pre).innerText.replace(/\n?复制(成功)?$/, '')); b.textContent = '已复制'; } catch (_) { b.textContent = '失败'; } setTimeout(() => { b.textContent = '复制'; }, 1600); });
      pre.appendChild(b);
    });
    $$('img', prose).forEach(img => {
      const link = img.closest('a');
      if (link && !/\.(png|jpe?g|webp|gif|avif)(\?|#|$)/i.test(link.href)) return;
      img.dataset.uoZoom = ''; if (!link) { img.tabIndex = 0; img.setAttribute('role', 'button'); img.setAttribute('aria-label', `放大图片${img.alt ? '：' + img.alt : ''}`); }
    });
    buildToc(heads);
  });

  /* TOC + scroll spy */
  function buildToc(heads) {
    const toc = $('[data-uo-toc]'), fab = $('[data-uo-toc-toggle]');
    spy?.disconnect();
    if (!toc) return;
    const list = $('ol', toc);
    if (heads.length < 2) { toc.hidden = true; if (fab) fab.hidden = true; return; }
    list.replaceChildren(...heads.map(h => {
      const li = document.createElement('li'); if (h.tagName === 'H3') li.className = 'is-sub';
      const a = document.createElement('a'); a.href = `#${h.id}`; a.textContent = h.textContent.replace(/^#/, '').trim(); li.appendChild(a); return li;
    }));
    toc.hidden = false; if (fab) fab.hidden = false;
    const links = new Map($$('a', list).map(a => [a.hash.slice(1), a]));
    const visible = new Set();
    spy = new IntersectionObserver(entries => {
      entries.forEach(en => en.isIntersecting ? visible.add(en.target.id) : visible.delete(en.target.id));
      const current = heads.find(h => visible.has(h.id)) || heads.filter(h => h.getBoundingClientRect().top < 120).pop();
      links.forEach(a => a.classList.remove('is-active'));
      if (current) links.get(current.id)?.classList.add('is-active');
    }, { rootMargin: '-72px 0px -60% 0px' });
    heads.forEach(h => spy.observe(h));
  }
  document.addEventListener('click', e => {
    const fab = e.target.closest('[data-uo-toc-toggle]'), toc = $('[data-uo-toc]');
    if (fab && toc) { toc.classList.toggle('is-sheet'); return; }
    if (toc?.classList.contains('is-sheet') && (e.target.closest('[data-uo-toc] a') || !e.target.closest('[data-uo-toc]'))) toc.classList.remove('is-sheet');
  });

  /* Lightbox */
  const box = document.createElement('dialog');
  if (typeof box.showModal === 'function') {
    box.className = 'uo-dialog uo-lightbox'; box.setAttribute('aria-label', '图片预览');
    const img = document.createElement('img'), cap = document.createElement('p'); box.append(img, cap); document.body.appendChild(box);
    let opener;
    const open = (el, e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault(); opener = el; img.src = el.currentSrc || el.src; img.alt = el.alt || ''; cap.textContent = el.alt || ''; box.showModal();
    };
    document.addEventListener('click', e => { const el = e.target.closest('img[data-uo-zoom]'); if (el) open(el, e); });
    document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('img[data-uo-zoom]')) open(e.target, e); });
    box.addEventListener('click', () => box.close());
    box.addEventListener('close', () => { img.removeAttribute('src'); opener?.focus?.(); });
  }

  /* Article actions */
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-uo-copy-text],[data-uo-copy-link],[data-uo-share]');
    const tools = b?.closest('[data-uo-actions]'); if (!tools) return;
    const status = $('[data-uo-action-status]', tools);
    const say = t => { if (status) status.textContent = t; UO.toast(t); };
    try {
      if (b.hasAttribute('data-uo-copy-text')) {
        const content = $('[data-uo-content]'); if (!content) throw Error('missing');
        const clone = content.cloneNode(true); $$('.uo-anchor,.uo-code-copy', clone).forEach(n => n.remove());
        await copy(`${tools.dataset.title}\n\n${clone.innerText || clone.textContent}\n\n来源：${tools.dataset.url}`); say('正文已复制，附带原文链接');
      } else if (b.hasAttribute('data-uo-share') && navigator.share) {
        await navigator.share({ title: tools.dataset.title, url: tools.dataset.url }); say('分享完成');
      } else { await copy(tools.dataset.url); say('链接已复制'); }
    } catch (err) { say(err.name === 'AbortError' ? '已取消分享' : '无法自动复制，请使用浏览器菜单'); }
  });

  /* Search palette: ⌘K / Ctrl+K / "/" */
  const dlg = $('#uo-search');
  if (dlg && typeof dlg.showModal === 'function') {
    const input = $('input', dlg), results = $('[data-uo-search-results]', dlg);
    let timer, ctrl, active = -1;
    const items = () => $$('.uo-search__item', results);
    const select = i => { const all = items(); active = Math.max(-1, Math.min(all.length - 1, i)); all.forEach((el, n) => el.setAttribute('aria-selected', String(n === active))); all[active]?.scrollIntoView({ block: 'nearest' }); };
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const openSearch = () => { if (!dlg.open) { dlg.showModal(); input.select(); } };
    async function query(q) {
      ctrl?.abort();
      if (!q.trim() || !config.search?.api) { results.innerHTML = q.trim() ? `<div class="uo-search__hint">按 Enter 搜索 “${esc(q)}”</div>` : ''; return; }
      ctrl = new AbortController();
      results.innerHTML = '<div class="uo-search__hint">搜索中…</div>';
      try {
        const res = await fetch(config.search.api.replace('%s', encodeURIComponent(q)), { signal: ctrl.signal, credentials: 'same-origin' });
        const data = await res.json();
        const list = (Array.isArray(data) ? data : data.items || []).map(r => ({ title: r.title?.rendered ?? r.title, url: r.url || r.link, type: r.subtype || r.type || '' }));
        const label = { post: '文章', page: '页面', category: '分类', post_tag: '标签' };
        results.innerHTML = list.length ? list.map(r => `<a class="uo-search__item" role="option" aria-selected="false" href="${esc(r.url)}"><svg class="uo-icon" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg><span>${r.title ? new DOMParser().parseFromString(r.title, 'text/html').body.textContent.replace(/[<>]/g, '') : '(无标题)'}</span><small>${esc(label[r.type] || r.type)}</small></a>`).join('')
          + `<a class="uo-search__item" role="option" aria-selected="false" href="${esc(searchUrl(q))}"><svg class="uo-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span>查看 “${esc(q)}” 的全部结果</span></a>`
          : `<div class="uo-search__hint">没有找到 “${esc(q)}” 相关内容</div>`;
        active = -1;
      } catch (err) { if (err.name !== 'AbortError') results.innerHTML = `<div class="uo-search__hint">按 Enter 搜索 “${esc(q)}”</div>`; }
    }
    const searchUrl = q => { const u = new URL(config.search?.page || '/', location.href); u.searchParams.set(config.search?.param || 's', q); return u.href; };
    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => query(input.value), 180); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); select(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); select(active - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); const a = items()[active]; dlg.close(); if (a) a.click(); else if (input.value.trim()) UO.navigate(searchUrl(input.value)); }
    });
    results.addEventListener('click', e => { if (e.target.closest('a')) dlg.close(); });
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    document.addEventListener('click', e => { if (e.target.closest('[data-uo-search-open]')) { e.preventDefault(); openSearch(); } });
    document.addEventListener('keydown', e => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey) && !e.shiftKey) { e.preventDefault(); openSearch(); }
      else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); openSearch(); }
    });
  }

  /* Progressive navigation: swap #uo-main, fall back to full loads on any doubt. */
  UO.navigate = url => location.assign(url);
  (() => {
    if (!window.fetch || !window.DOMParser || !history.pushState || !$('#uo-main') || config.pjax === false) return;
    const bar = document.createElement('div'); bar.className = 'uo-route-bar'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
    const skip = new RegExp(config.noNavigate || '/(feed|admin|api|login)(/|$)|\\.(php|xml|txt|zip|pdf|jpe?g|png|gif|webp|svg)$', 'i');
    let active, seq = 0;
    history.replaceState({ ...history.state, uo: 1, y: scrollY }, '', location.href);
    history.scrollRestoration = 'manual';
    const fingerprint = doc => $$('script[src],link[rel="stylesheet"]', doc).map(el => el.getAttribute('src') || el.getAttribute('href')).filter(s => !/companion|roaming|panel|admin/.test(s)).sort().join('|');
    function eligible(a, e) {
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.hasAttribute('download') || (a.target && a.target !== '_self') || a.closest('[data-uo-no-nav],.uo-panel,.uo-dock,.uo-companion')) return false;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || !/^https?:$/.test(u.protocol)) return false;
      if (u.pathname === location.pathname && u.search === location.search) return false;
      return !skip.test(u.pathname) && !/[?&](preview|replytocom|customize_changeset_uuid)=/.test(u.search);
    }
    async function go(href, { pop = false, y = 0 } = {}) {
      active?.abort(); const c = new AbortController(); active = c; const id = ++seq;
      document.body.classList.add('uo-routing');
      const timeout = setTimeout(() => c.abort(), 9000);
      try {
        const res = await fetch(href, { credentials: 'same-origin', signal: c.signal, headers: { Accept: 'text/html', 'X-UO-Navigate': '1' } });
        if (!res.ok || !res.headers.get('content-type')?.includes('text/html')) throw Error('full');
        const finalUrl = new URL(res.url); if (finalUrl.origin !== location.origin) throw Error('full');
        const next = new DOMParser().parseFromString(await res.text(), 'text/html');
        if (id !== seq) return;
        const newMain = $('#uo-main', next), oldMain = $('#uo-main');
        if (!newMain || fingerprint(next) !== fingerprint(document) || newMain.querySelector('script:not([type="application/ld+json"]),iframe[src*="recaptcha"]') || next.body.classList.contains('logged-in') !== document.body.classList.contains('logged-in')) throw Error('full');
        const swap = () => {
          oldMain.replaceWith(newMain);
          document.title = next.title;
          const sel = 'meta[name="description"],meta[property^="og:"],meta[name^="twitter:"],link[rel="canonical"],link[rel="prev"],link[rel="next"],script[type="application/ld+json"]';
          $$(sel, document.head).forEach(n => n.remove()); $$(sel, next.head).forEach(n => document.head.appendChild(n.cloneNode(true)));
          $$('style[id]', next.head).forEach(s => { const cur = document.getElementById(s.id); if (cur) { if (cur.textContent !== s.textContent) cur.textContent = s.textContent; } else document.head.appendChild(s.cloneNode(true)); });
          document.body.className = next.body.className + ' uo-routing';
          const nav = $('.uo-nav', next); if (nav && $('.uo-nav')) $('.uo-nav').replaceWith(nav);
          document.body.classList.remove('uo-nav-open');
          if (!pop) history.pushState({ uo: 1, y: 0 }, '', finalUrl.href);
          scrollTo({ top: pop ? y : 0, behavior: 'instant' });
          if (finalUrl.hash) { try { document.getElementById(decodeURIComponent(finalUrl.hash.slice(1)))?.scrollIntoView(); } catch (_) {} }
          const cfg = $$('script', next).find(s => s.textContent.includes('window.UOThemeConfig = '));
          if (cfg) { try { const v = JSON.parse(cfg.textContent.trim().replace(/^window\.UOThemeConfig = /, '').replace(/;$/, '')); Object.assign(config.context || (config.context = {}), v.context || {}); config.page = v.page; } catch (_) {} }
          hooks.content.forEach(fn => { try { fn(newMain); } catch (err) { console.error(err); } });
          newMain.setAttribute('tabindex', '-1'); newMain.focus({ preventScroll: true });
          onScroll();
          document.dispatchEvent(new CustomEvent('uo-theme:navigated', { detail: { url: finalUrl.href, title: next.title } }));
        };
        if (document.startViewTransition && !reduced.matches) await document.startViewTransition(swap).updateCallbackDone; else swap();
      } catch (_) {
        if (id === seq) { if (pop) location.replace(href); else location.assign(href); }
      } finally {
        clearTimeout(timeout);
        if (id === seq) { document.body.classList.remove('uo-routing'); active = null; }
      }
    }
    UO.navigate = href => go(new URL(href, location.href).href);
    document.addEventListener('click', e => { const a = e.target.closest('a[href]'); if (!eligible(a, e)) return; e.preventDefault(); history.replaceState({ ...history.state, uo: 1, y: scrollY }, '', location.href); go(a.href); });
    addEventListener('popstate', e => { if (!e.state?.uo) { location.reload(); return; } go(location.href, { pop: true, y: e.state.y || 0 }); });
    let st; addEventListener('scroll', () => { clearTimeout(st); st = setTimeout(() => { if (!active) history.replaceState({ ...history.state, uo: 1, y: scrollY }, '', location.href); }, 150); }, { passive: true });
  })();

  /* Optional companion loads after the page is complete. */
  if (config.options && config.options.enabled !== 0 && config.scripts?.companion) {
    const nonce = document.currentScript?.nonce;
    const load = (src, done) => {
      let u; try { u = new URL(src, location.href); } catch (_) { return; }
      if (u.origin !== location.origin) return;
      const s = document.createElement('script'); s.src = u.href; s.async = true; if (nonce) s.nonce = nonce; if (done) s.onload = done; document.head.appendChild(s);
    };
    const start = () => load(config.scripts.companion, () => config.scripts.roaming && load(config.scripts.roaming));
    const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 2000 }) : setTimeout(start, 200));
    if (document.readyState === 'complete') idle(); else addEventListener('load', idle, { once: true });
  }
})();
