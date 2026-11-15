/* uo-theme core · floating management panel.
 * Engine-agnostic: every data call goes through window.UOAdapter (docs/ADAPTER.md).
 * No framework, no external requests. */
(() => {
  'use strict';
  const A = window.UOAdapter;
  if (!A || document.querySelector('.uo-panel')) return;
  const S = A.session();
  const caps = S.caps || {};
  const LS = 'uo-panel:state';
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} },
    del(k) { try { localStorage.removeItem(k); } catch (_) {} }
  };

  /* ───────── helpers ───────── */
  const PROPS = new Set(['value', 'checked', 'disabled', 'selected', 'hidden', 'contentEditable', 'tabIndex', 'type', 'min', 'max', 'step', 'placeholder', 'name', 'id', 'title']);
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') Object.entries(v).forEach(([sk, sv]) => (sk.startsWith('--') ? el.style.setProperty(sk, sv) : (el.style[sk] = sv)));
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (PROPS.has(k)) el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    append(el, kids);
    return el;
  }
  function append(el, kids) { kids.flat(Infinity).forEach(c => { if (c == null || c === false) return; el.append(c.nodeType ? c : document.createTextNode(String(c))); }); return el; }
  const ICONS = {
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    post: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    page: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    message: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12z"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m21 16-5-5-9 9"/>',
    tag: '<path d="M3 12V4.5A1.5 1.5 0 0 1 4.5 3H12l9 9-9 9z"/><circle cx="8" cy="8" r="1.5"/>',
    palette: '<path d="M12 21a9 9 0 1 1 9-9c0 2.5-2 3.5-4 3.5h-2a2 2 0 0 0-1.4 3.4A1.3 1.3 0 0 1 12 21z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7" r="1.2"/><circle cx="15.5" cy="8" r="1.2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', back: '<path d="M15 6l-6 6 6 6"/>', chevron: '<path d="m9 6 6 6-6 6"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
    edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>', eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>', logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3"/>',
    max: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', min: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>', dash: '<path d="M5 12h14"/>',
    bold: '<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/>', italic: '<path d="M14 5h-4M14 19h-4M14 5l-4 14"/>', strike: '<path d="M5 12h14M16 7a4 3 0 0 0-8 0c0 4 8 2 8 6.5a4 3 0 0 1-8 .5"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
    quote: '<path d="M7 17c-2 0-3-1.5-3-4 0-3 2-6 5-7M17 17c-2 0-3-1.5-3-4 0-3 2-6 5-7"/>', ul: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    ol: '<path d="M10 6h10M10 12h10M10 18h10M4 5l1.5-1V9M3.5 14.5a1.5 1.5 0 0 1 3 .5c0 1-3 2-3 3.5h3"/>', code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
    hr: '<path d="M4 12h16"/><path d="M8 7h8M8 17h8" opacity=".35"/>', h2: '<path d="M4 6v12M11 6v12M4 12h7M15 10a2.5 2.5 0 1 1 4.5 1.5L15 18h5"/>', h3: '<path d="M4 6v12M11 6v12M4 12h7M15 7.5h5l-3 4a3 3 0 1 1-2 5"/>',
    source: '<path d="m9 8-5 4 5 4M15 8l5 4-5 4"/>', side: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M15 4v16"/>', home: '<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>', copy: '<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M15 9V6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15H9"/>',
    up: '<path d="m6 15 6-6 6 6"/>', down: '<path d="m6 9 6 6 6-6"/>', sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    spam: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>', reply: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v4"/>', undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-4"/>'
  };
  // Avatars may be blocked (e.g. Gravatar); fall back to an initial.
  const avatar = (src, name, size = 32) => { const img = h('img', { src, alt: '', width: size, height: size, loading: 'lazy' }); img.addEventListener('error', () => img.replaceWith(h('span', { class: 'up-avatar-fallback', style: { width: `${size}px`, height: `${size}px` } }, (name || '?').trim().slice(0, 1).toUpperCase())), { once: true }); return img; };
  function icon(name, cls = '') { const t = document.createElement('template'); t.innerHTML = `<svg class="up-i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`; return t.content.firstChild; }
  const fmtDate = (iso, withTime) => { if (!iso) return ''; const d = new Date(iso); if (isNaN(d)) return ''; const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}${withTime ? ` ${p(d.getHours())}:${p(d.getMinutes())}` : ''}`; };
  const ago = iso => { const s = (Date.now() - new Date(iso)) / 1000; if (s < 60) return '刚刚'; if (s < 3600) return `${Math.floor(s / 60)} 分钟前`; if (s < 86400) return `${Math.floor(s / 3600)} 小时前`; if (s < 86400 * 30) return `${Math.floor(s / 86400)} 天前`; return fmtDate(iso); };
  const STATUS = { publish: ['已发布', 'ok'], draft: ['草稿', 'muted'], future: ['定时', 'info'], pending: ['待审', 'warn'], private: ['私密', 'violet'], trash: ['回收站', 'danger'], approved: ['已通过', 'ok'], hold: ['待审核', 'warn'], spam: ['垃圾', 'danger'] };
  const pill = s => h('span', { class: `up-pill is-${(STATUS[s] || [s, 'muted'])[1]}` }, (STATUS[s] || [s])[0]);
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const btn = (label, opts = {}) => h('button', { type: 'button', class: `up-btn ${opts.variant ? 'up-btn--' + opts.variant : ''} ${opts.cls || ''}`, onClick: opts.onClick, disabled: opts.disabled, title: opts.title, 'aria-label': opts.aria }, opts.icon ? icon(opts.icon) : null, label != null ? h('span', null, label) : null);
  const iconBtn = (name, label, onClick, cls = '') => h('button', { type: 'button', class: `up-ibtn ${cls}`, 'aria-label': label, title: label, onClick }, icon(name));
  const field = (label, control, hint) => h('label', { class: 'up-field' }, h('span', { class: 'up-field__label' }, label), control, hint ? h('small', { class: 'up-field__hint' }, hint) : null);
  const toggle = (label, checked, onChange, hint) => h('label', { class: 'up-switch' }, h('input', { type: 'checkbox', checked: !!checked, onChange: e => onChange(e.target.checked) }), h('span', { class: 'up-switch__track', 'aria-hidden': 'true' }), h('span', { class: 'up-switch__text' }, h('strong', null, label), hint ? h('small', null, hint) : null));
  const segmented = (options, value, onChange) => {
    const wrap = h('div', { class: 'up-seg', role: 'tablist' });
    options.forEach(([v, label, count]) => wrap.append(h('button', { type: 'button', role: 'tab', 'aria-selected': String(v === value), onClick: () => { $$('button', wrap).forEach(b => b.setAttribute('aria-selected', 'false')); wrap.querySelector(`[data-v="${CSS.escape(v)}"]`).setAttribute('aria-selected', 'true'); onChange(v); }, dataset: { v } }, label, count != null ? h('em', null, count) : null)));
    return wrap;
  };
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const empty = (title, text, action) => h('div', { class: 'up-empty' }, icon('sparkle'), h('strong', null, title), text ? h('p', null, text) : null, action || null);
  const skeleton = (n = 5) => h('div', { class: 'up-skeleton' }, Array.from({ length: n }, () => h('i')));

  /* ───────── shell ───────── */
  const saved = store.get(LS, {});
  const state = { open: false, view: saved.view || 'overview', max: !!saved.max, rect: saved.rect || null, guard: null };
  const toastHost = h('div', { class: 'up-toasts', 'aria-live': 'polite' });
  function toast(msg, kind = 'ok') {
    const t = h('div', { class: `up-toast is-${kind}` }, icon(kind === 'error' ? 'x' : 'check'), h('span', null, msg));
    toastHost.append(t); requestAnimationFrame(() => t.classList.add('is-in'));
    setTimeout(() => { t.classList.remove('is-in'); setTimeout(() => t.remove(), 300); }, kind === 'error' ? 4200 : 2400);
  }
  const fail = e => toast(e?.message || '操作失败', 'error');

  function modal(title, body, actions, { wide = false } = {}) {
    return new Promise(resolve => {
      const close = v => { layer.classList.remove('is-in'); setTimeout(() => layer.remove(), 200); panel.removeEventListener('keydown', onKey, true); resolve(v); };
      const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); close(null); } };
      const card = h('div', { class: `up-modal ${wide ? 'is-wide' : ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
        h('header', null, h('strong', null, title), iconBtn('x', '关闭', () => close(null))),
        h('div', { class: 'up-modal__body' }, body),
        actions ? h('footer', null, actions(close)) : null);
      const layer = h('div', { class: 'up-layer', onMousedown: e => { if (e.target === layer) close(null); } }, card);
      panel.append(layer); panel.addEventListener('keydown', onKey, true);
      requestAnimationFrame(() => { layer.classList.add('is-in'); (card.querySelector('input,textarea,[data-autofocus]') || card.querySelector('footer .up-btn--primary'))?.focus(); });
    });
  }
  const confirmBox = (title, text, { danger = false, ok = '确定' } = {}) => modal(title, h('p', { class: 'up-muted' }, text), close => [btn('取消', { onClick: () => close(false) }), btn(ok, { variant: danger ? 'danger' : 'primary', onClick: () => close(true) })]);
  const prompt = (title, value = '', placeholder = '') => { const input = h('input', { class: 'up-input', value, placeholder }); return modal(title, input, close => { input.addEventListener('keydown', e => { if (e.key === 'Enter') close(input.value); }); return [btn('取消', { onClick: () => close(null) }), btn('确定', { variant: 'primary', onClick: () => close(input.value) })]; }); };

  const NAV = [
    ['overview', '概览', 'grid', true],
    ['posts', '文章', 'post', caps.posts],
    ['pages', '页面', 'page', caps.pages],
    ['comments', '评论', 'message', caps.comments],
    ['media', '媒体库', 'image', caps.media],
    ['terms', '分类与标签', 'tag', caps.terms],
    ['appearance', '外观', 'palette', caps.settings],
    ['site', '站点设置', 'settings', caps.settings]
  ].filter(n => n[3]);
  const badge = h('em', { class: 'up-nav__badge', hidden: true });
  const navList = h('nav', { class: 'up-nav', 'aria-label': '管理导航' }, NAV.map(([id, label, ic]) => h('button', { type: 'button', class: 'up-nav__item', dataset: { view: id }, onClick: () => go(id) }, icon(ic), h('span', null, label), id === 'comments' ? badge : null)));
  const crumb = h('div', { class: 'up-bar__title' });
  const main = h('section', { class: 'up-main', tabIndex: -1 });
  const userMenu = h('div', { class: 'up-user' },
    avatar(S.user.avatar, S.user.name, 32),
    h('div', null, h('strong', null, S.user.name), h('small', null, S.engine || '')),
    h('a', { class: 'up-ibtn', href: S.links.logout, title: '退出登录', 'aria-label': '退出登录', 'data-uo-no-nav': '' }, icon('logout')));
  const side = h('aside', { class: 'up-side' },
    h('div', { class: 'up-side__brand' }, h('span', { class: 'up-logo' }, (S.site || 'U').trim().slice(0, 1)), h('div', null, h('strong', null, S.site || '站点'), h('small', null, '管理空间'))),
    navList, h('div', { class: 'up-side__foot' }, S.links.native ? h('a', { class: 'up-native', href: S.links.native, target: '_blank', rel: 'noopener', 'data-uo-no-nav': '' }, '原生后台', icon('external')) : null, userMenu));
  const maxBtn = iconBtn(state.max ? 'min' : 'max', '最大化', () => setMax(!panel.classList.contains('is-max')));
  const bar = h('header', { class: 'up-bar' },
    iconBtn('side', '收起侧栏', () => panel.classList.toggle('is-side-hidden'), 'up-side-toggle'),
    crumb, h('div', { class: 'up-bar__tools' }, iconBtn('dash', '收起', () => close()), maxBtn, iconBtn('x', '关闭 (Esc)', () => close())));
  const resizer = h('div', { class: 'up-resize', 'aria-hidden': 'true' });
  const panel = h('div', { class: 'uo-panel', role: 'dialog', 'aria-label': '管理面板', hidden: true }, side, h('div', { class: 'up-body' }, bar, main), resizer, toastHost);

  /* Dock */
  const dockMain = h('button', { type: 'button', class: 'up-dock__main', onClick: () => toggle_(), title: '管理面板 (⌘/Ctrl + .)' }, avatar(S.user.avatar, S.user.name, 30), h('span', null, '管理'), h('kbd', null, '⌘.'));
  const dock = h('div', { class: 'uo-dock', role: 'toolbar', 'aria-label': '管理快捷入口' }, dockMain,
    caps.posts ? h('button', { type: 'button', class: 'up-dock__btn', title: '写文章', 'aria-label': '写文章', onClick: () => openEditor('post') }, icon('plus')) : null,
    S.current ? h('button', { type: 'button', class: 'up-dock__btn', title: '编辑本页', 'aria-label': '编辑本页', onClick: () => openEditor(S.current.type === 'page' ? 'page' : 'post', S.current.id) }, icon('edit')) : null);
  document.body.append(dock, panel);

  function setMax(v) { state.autoMax = false; state.max = v; panel.classList.toggle('is-max', v); maxBtn.replaceChildren(icon(v ? 'min' : 'max')); maxBtn.title = v ? '还原' : '最大化'; persist(); }
  function persist() { store.set(LS, { view: state.view, max: state.max, rect: state.rect }); }
  function applyRect() {
    if (!state.rect || matchMedia('(max-width: 760px)').matches) { panel.style.cssText = ''; return; }
    const r = state.rect, W = innerWidth, H = innerHeight;
    const w = Math.min(Math.max(r.w, 640), W - 24), hh = Math.min(Math.max(r.h, 420), H - 24);
    panel.style.width = `${w}px`; panel.style.height = `${hh}px`;
    panel.style.left = `${Math.min(Math.max(12, r.x), W - w - 12)}px`; panel.style.top = `${Math.min(Math.max(12, r.y), H - hh - 12)}px`;
    panel.style.transform = 'none';
  }
  let lastFocus;
  function open(view, skipRoute) {
    if (!state.open) { lastFocus = document.activeElement; state.open = true; panel.hidden = false; document.documentElement.classList.add('uo-panel-open'); dock.classList.add('is-active'); applyRect(); setMax(state.max); requestAnimationFrame(() => panel.classList.add('is-in')); }
    if (view) go(view); else if (!skipRoute && !main.childNodes.length) go(state.view);
  }
  async function close(force) {
    if (!force && state.guard && !(await state.guard())) return;
    state.open = false; panel.classList.remove('is-in'); dock.classList.remove('is-active'); document.documentElement.classList.remove('uo-panel-open');
    setTimeout(() => { if (!state.open) panel.hidden = true; }, 220); lastFocus?.focus?.();
  }
  const toggle_ = () => (state.open ? close() : open());

  /* Drag / resize (desktop) */
  function dragFrom(handle, mode) {
    handle.addEventListener('pointerdown', e => {
      if (e.button !== 0 || state.max || matchMedia('(max-width: 760px)').matches || (mode === 'move' && e.target.closest('button,a,input'))) return;
      e.preventDefault(); const r = panel.getBoundingClientRect(), sx = e.clientX, sy = e.clientY;
      panel.classList.add('is-dragging'); handle.setPointerCapture(e.pointerId);
      const move = ev => {
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        state.rect = mode === 'move' ? { x: r.left + dx, y: r.top + dy, w: r.width, h: r.height } : { x: r.left, y: r.top, w: r.width + dx, h: r.height + dy };
        applyRect();
      };
      const up = () => { panel.classList.remove('is-dragging'); handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); persist(); };
      handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', up);
    });
  }
  dragFrom(bar, 'move'); dragFrom(resizer, 'size');
  bar.addEventListener('dblclick', e => { if (!e.target.closest('button')) setMax(!panel.classList.contains('is-max')); });
  addEventListener('resize', debounce(applyRect, 120));

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === '.') { e.preventDefault(); toggle_(); }
    else if (e.key === 'Escape' && state.open && !panel.querySelector('.up-layer') && !document.querySelector('dialog[open]')) { e.preventDefault(); close(); }
  });

  /* Router */
  let viewToken = 0;
  async function go(view, params = {}) {
    if (state.guard && !(await state.guard())) return;
    state.guard = null;
    const token = ++viewToken;
    state.view = view === 'edit' ? state.view : view; persist();
    $$('.up-nav__item', navList).forEach(b => b.setAttribute('aria-current', String(b.dataset.view === (view === 'edit' ? (params.type === 'page' ? 'pages' : 'posts') : view))));
    panel.classList.toggle('is-writing', view === 'edit');
    // Writing gets the whole screen by default; leaving restores the saved window state.
    if (view === 'edit' && !state.max && !matchMedia('(max-width: 760px)').matches) { panel.classList.add('is-max'); maxBtn.replaceChildren(icon('min')); state.autoMax = true; }
    else if (view !== 'edit' && state.autoMax) { state.autoMax = false; setMax(state.max); }
    main.replaceChildren(); main.scrollTop = 0;
    const fn = VIEWS[view] || VIEWS.overview;
    try { await fn(main, params, () => token === viewToken); } catch (e) { if (token === viewToken) main.replaceChildren(empty('加载失败', e.message, btn('重试', { onClick: () => go(view, params) }))); }
  }
  const setCrumb = (...parts) => crumb.replaceChildren(...parts.flatMap((p, i) => [i ? h('span', { class: 'up-bar__sep' }, '/') : null, typeof p === 'string' ? h('span', null, p) : p]).filter(Boolean));
  const head = (title, sub, ...tools) => h('div', { class: 'up-head' }, h('div', null, h('h2', null, title), sub ? h('p', null, sub) : null), h('div', { class: 'up-head__tools' }, tools));
  const pager = (page, pages, onPage) => pages <= 1 ? document.createTextNode('') : h('div', { class: 'up-pager' }, btn('上一页', { icon: 'back', disabled: page <= 1, onClick: () => onPage(page - 1) }), h('span', null, `${page} / ${pages}`), btn('下一页', { disabled: page >= pages, onClick: () => onPage(page + 1) }));

  /* ───────── Overview ───────── */
  const VIEWS = {};
  VIEWS.overview = async (root, _, alive) => {
    setCrumb('概览');
    const hr = new Date().getHours();
    const hello = hr < 6 ? '夜深了' : hr < 11 ? '早上好' : hr < 14 ? '中午好' : hr < 18 ? '下午好' : '晚上好';
    root.append(h('div', { class: 'up-hello' }, h('h2', null, `${hello}，${S.user.name}`), h('p', null, '今天想写点什么？')), skeleton(4));
    const data = await A.overview(); if (!alive()) return;
    root.lastChild.remove();
    const stat = (label, value, ic, view, hint) => h('button', { type: 'button', class: 'up-stat', onClick: () => view && go(view) }, h('span', { class: 'up-stat__icon' }, icon(ic)), h('strong', null, value ?? '—'), h('span', null, label), hint ? h('em', null, hint) : null);
    root.append(h('div', { class: 'up-stats' },
      stat('已发布文章', data.posts.publish, 'post', 'posts'),
      stat('草稿', data.posts.draft, 'edit', 'posts', data.posts.future ? `${data.posts.future} 篇定时` : ''),
      data.comments ? stat('待审评论', data.comments.pending, 'message', 'comments', `${data.comments.approved} 条已通过`) : stat('页面', data.pages, 'page', 'pages'),
      data.media != null ? stat('媒体文件', data.media, 'image', 'media') : null));
    if (data.comments?.pending) { badge.hidden = false; badge.textContent = data.comments.pending; }

    const qTitle = h('input', { class: 'up-input', placeholder: '标题' });
    const qBody = h('textarea', { class: 'up-input', rows: 4, placeholder: '记下一个想法，稍后再展开…' });
    const quick = h('form', { class: 'up-card up-quick', onSubmit: async e => {
      e.preventDefault(); if (!qTitle.value.trim() && !qBody.value.trim()) return;
      const b = quick.querySelector('button[type=submit]'); b.disabled = true;
      try { const p = await A.posts.save('post', { title: qTitle.value.trim() || '无标题草稿', content: qBody.value.trim().split(/\n{2,}/).map(t => `<p>${t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(/\n/g, '<br>')}</p>`).join('\n'), status: 'draft' }); toast('草稿已保存'); qTitle.value = qBody.value = ''; go('overview'); void p; }
      catch (err) { fail(err); } finally { b.disabled = false; }
    } }, h('div', { class: 'up-card__head' }, h('strong', null, '快速草稿'), h('small', null, '保存为草稿，不会发布')), qTitle, qBody,
      h('div', { class: 'up-row-end' }, btn('打开完整编辑器', { variant: 'ghost', onClick: () => openEditor('post', null, { title: qTitle.value, content: qBody.value ? `<p>${qBody.value}</p>` : '' }) }), h('button', { type: 'submit', class: 'up-btn up-btn--primary' }, '保存草稿')));
    const list = (items, render, none) => items.length ? h('ul', { class: 'up-mini' }, items.map(render)) : h('p', { class: 'up-muted up-pad' }, none);
    const drafts = h('div', { class: 'up-card' }, h('div', { class: 'up-card__head' }, h('strong', null, '最近草稿'), h('button', { type: 'button', class: 'up-link', onClick: () => go('posts', { status: 'draft' }) }, '全部')),
      list(data.drafts, d => h('li', null, h('button', { type: 'button', onClick: () => openEditor('post', d.id) }, h('span', null, d.title || '（无标题）'), h('small', null, ago(d.modified)))), '没有草稿，灵感都发出去了。'));
    const recent = h('div', { class: 'up-card' }, h('div', { class: 'up-card__head' }, h('strong', null, '最近发布'), h('button', { type: 'button', class: 'up-link', onClick: () => go('posts') }, '管理')),
      list(data.recent, d => h('li', null, h('button', { type: 'button', onClick: () => openEditor('post', d.id) }, h('span', null, d.title || '（无标题）'), h('small', null, fmtDate(d.date)))), '还没有文章。'));
    root.append(h('div', { class: 'up-cols' }, quick, h('div', { class: 'up-stack' }, drafts, recent)));
  };

  /* ───────── Post list ───────── */
  let termCache = null;
  async function categories(force) { if (!termCache || force) termCache = await A.terms.list('category').catch(() => []); return termCache; }
  function listView(type) {
    return async (root, params = {}, alive) => {
      const label = type === 'page' ? '页面' : '文章';
      setCrumb(label);
      const q = { page: params.page || 1, status: params.status || 'any', search: params.search || '', category: params.category || '' };
      const search = h('label', { class: 'up-search' }, icon('search'), h('input', { type: 'search', placeholder: `搜索${label}`, value: q.search, onInput: debounce(e => { q.search = e.target.value; q.page = 1; load(); }, 280) }));
      const statusSeg = segmented([['any', '全部'], ['publish', '已发布'], ['draft', '草稿'], ['future', '定时'], ['private', '私密'], ['trash', '回收站']], q.status, v => { q.status = v; q.page = 1; load(); });
      const tools = h('div', { class: 'up-toolbar' }, statusSeg, h('div', { class: 'up-toolbar__end' }, search));
      if (type === 'post') {
        const cats = await categories(); if (!alive()) return;
        tools.lastChild.prepend(h('select', { class: 'up-input up-select', 'aria-label': '按分类筛选', onChange: e => { q.category = e.target.value; q.page = 1; load(); } }, h('option', { value: '' }, '全部分类'), cats.map(c => h('option', { value: c.id, selected: String(c.id) === String(q.category) }, c.name))));
      }
      const body = h('div');
      root.append(head(label, null, btn(`新建${label}`, { variant: 'primary', icon: 'plus', onClick: () => openEditor(type) })), tools, body);
      const catName = id => termCache?.find(c => c.id === id)?.name;
      async function load() {
        body.replaceChildren(skeleton(6));
        let r; try { r = await A.posts.list(type, q); } catch (e) { body.replaceChildren(empty('加载失败', e.message)); return; }
        if (!alive()) return;
        if (!r.items.length) { body.replaceChildren(empty(q.search ? '没有匹配的结果' : `这里还没有${label}`, q.search ? '换个关键词试试。' : null, !q.search && q.status !== 'trash' ? btn(`写第一篇${label}`, { variant: 'primary', icon: 'plus', onClick: () => openEditor(type) }) : null)); return; }
        const rows = r.items.map(p => {
          const actions = p.status === 'trash'
            ? [iconBtn('undo', '恢复', async () => { try { await A.posts.restore(type, p.id); toast('已恢复为草稿'); load(); } catch (e) { fail(e); } }),
              iconBtn('trash', '永久删除', async () => { if (await confirmBox('永久删除？', `「${p.title || '无标题'}」将被彻底删除，无法恢复。`, { danger: true, ok: '永久删除' })) { try { await A.posts.remove(type, p.id, true); toast('已永久删除'); load(); } catch (e) { fail(e); } } }, 'is-danger')]
            : [p.link ? h('a', { class: 'up-ibtn', href: A.posts.previewUrl(p), target: '_blank', rel: 'noopener', title: p.status === 'publish' ? '查看' : '预览', 'data-uo-no-nav': '' }, icon('eye')) : null,
              iconBtn('edit', '编辑', () => openEditor(type, p.id)),
              iconBtn('trash', '移到回收站', async () => { if (await confirmBox('移到回收站？', `「${p.title || '无标题'}」可以在回收站中恢复。`, { ok: '移到回收站' })) { try { await A.posts.remove(type, p.id); toast('已移到回收站'); load(); } catch (e) { fail(e); } } }, 'is-danger')];
          return h('li', { class: 'up-item' },
            h('button', { type: 'button', class: 'up-item__main', onClick: () => p.status !== 'trash' && openEditor(type, p.id) },
              h('strong', null, p.sticky ? icon('star', 'is-star') : null, p.title || '（无标题）'),
              h('span', { class: 'up-item__meta' }, pill(p.status), h('span', null, fmtDate(p.date, p.status === 'future')), p.categories.slice(0, 2).map(id => catName(id) ? h('span', { class: 'up-tagish' }, catName(id)) : null))),
            h('div', { class: 'up-item__actions' }, actions));
        });
        body.replaceChildren(h('ul', { class: 'up-list' }, rows), pager(q.page, r.pages, p => { q.page = p; load(); main.scrollTop = 0; }), h('p', { class: 'up-count' }, `共 ${r.total} 篇`));
      }
      load();
    };
  }
  VIEWS.posts = listView('post');
  VIEWS.pages = listView('page');

  /* ───────── HTML import/export for the visual editor ───────── */
  const RAW_TAGS = 'script,style,iframe,object,embed,form,input,textarea,select,button,noscript,svg,math,video,audio,canvas';
  function autop(html) {
    if (/<!--\s*wp:/.test(html) || /<p[\s>]/i.test(html) || !/\n/.test(html)) return html;
    return html.split(/\n\s*\n/).map(chunk => { const t = chunk.trim(); if (!t) return ''; return /^<(h\d|ul|ol|blockquote|pre|figure|table|div|hr|p)[\s>]/i.test(t) ? t : `<p>${t.replace(/\n/g, '<br>')}</p>`; }).join('\n');
  }
  function importHTML(raw) {
    const doc = new DOMParser().parseFromString(`<body>${autop(raw || '')}</body>`, 'text/html');
    doc.body.querySelectorAll(RAW_TAGS).forEach(el => {
      const ph = doc.createElement('span'); ph.className = 'up-embed'; ph.contentEditable = 'false';
      ph.dataset.raw = encodeURIComponent(el.outerHTML); ph.dataset.label = el.tagName.toLowerCase();
      ph.textContent = `‹${el.tagName.toLowerCase()}› 嵌入内容（保持原样）`;
      el.replaceWith(ph);
    });
    doc.body.querySelectorAll('*').forEach(el => [...el.attributes].forEach(a => {
      if (/^on/i.test(a.name) || (/^(href|src|xlink:href|action|formaction)$/i.test(a.name) && /^\s*(javascript|vbscript|data:text)/i.test(a.value))) { el.setAttribute(`data-up-keep-${a.name}`, a.value); el.removeAttribute(a.name); }
    }));
    const frag = document.createDocumentFragment(); [...doc.body.childNodes].forEach(n => frag.append(document.adoptNode(n))); return frag;
  }
  function exportHTML(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll('.up-embed').forEach(ph => { const t = document.createElement('template'); t.innerHTML = decodeURIComponent(ph.dataset.raw || ''); ph.replaceWith(t.content); });
    clone.querySelectorAll('*').forEach(n => [...n.attributes].forEach(a => { if (a.name.startsWith('data-up-keep-')) { n.setAttribute(a.name.slice(13), a.value); n.removeAttribute(a.name); } }));
    clone.querySelectorAll('[data-up-uploading]').forEach(n => n.remove());
    return clone.innerHTML.replace(/<p><br><\/p>/g, '').replace(/(<br>\s*)+<\/p>/g, '</p>').trim();
  }
  const ALLOWED = { P: [], H2: [], H3: [], H4: [], STRONG: [], B: [], EM: [], I: [], U: [], S: [], DEL: [], A: ['href', 'title'], UL: [], OL: [], LI: [], BLOCKQUOTE: [], CODE: [], PRE: [], IMG: ['src', 'alt', 'width', 'height'], FIGURE: [], FIGCAPTION: [], BR: [], HR: [], TABLE: [], THEAD: [], TBODY: [], TR: [], TH: [], TD: [], SUP: [], SUB: [], MARK: [] };
  function cleanPaste(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 8) { n.remove(); return; }
      if (n.nodeType !== 1) return;
      walk(n);
      let tag = n.tagName; if (tag === 'H1') tag = 'H2'; if (tag === 'H5' || tag === 'H6') tag = 'H4'; if (tag === 'DIV' || tag === 'SECTION' || tag === 'ARTICLE') tag = 'P';
      if (!ALLOWED[tag]) { if (/^(SCRIPT|STYLE|META|LINK|TITLE|IFRAME|OBJECT)$/.test(n.tagName)) n.remove(); else n.replaceWith(...n.childNodes); return; }
      const el = doc.createElement(tag); ALLOWED[tag].forEach(a => { const v = n.getAttribute(a); if (v && !/^\s*javascript:/i.test(v)) el.setAttribute(a, v); }); el.append(...n.childNodes); n.replaceWith(el);
    });
    walk(doc.body);
    doc.body.querySelectorAll('p').forEach(p => { if (p.querySelector('p,h2,h3,h4,ul,ol,pre,blockquote,table,figure')) p.replaceWith(...p.childNodes); });
    return doc.body.innerHTML;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ───────── Media picker ───────── */
  async function pickMedia({ title = '选择图片', type = 'image' } = {}) {
    let chosen = null; let page = 1, pages = 1, search = '';
    const grid = h('div', { class: 'up-media-grid is-pick' });
    const more = btn('加载更多', { onClick: () => load(true) });
    const input = h('input', { type: 'file', accept: type === 'image' ? 'image/*' : '', multiple: true, hidden: true, onChange: e => uploadFiles([...e.target.files]) });
    const drop = h('div', { class: 'up-drop' }, icon('upload'), h('span', null, '拖拽图片到这里，或 '), h('button', { type: 'button', class: 'up-link', onClick: () => input.click() }, '选择文件上传'), input);
    async function uploadFiles(files) {
      for (const f of files) {
        const tile = h('div', { class: 'up-media is-uploading' }, h('i', { class: 'up-progress', style: { '--p': 0 } }), h('span', null, f.name));
        grid.prepend(tile);
        try { const m = await A.media.upload(f, p => tile.firstChild.style.setProperty('--p', p)); tile.replaceWith(tileFor(m)); toast('上传完成'); } catch (e) { tile.remove(); fail(e); }
      }
    }
    const tileFor = m => h('button', { type: 'button', class: 'up-media', onClick: e => { $$('.up-media', grid).forEach(t => t.classList.remove('is-chosen')); e.currentTarget.classList.add('is-chosen'); chosen = m; okBtn.disabled = false; }, onDblclick: () => { chosen = m; done(m); } }, /^image\//.test(m.mime) ? h('img', { src: m.thumb, alt: m.alt, loading: 'lazy' }) : h('span', { class: 'up-media__file' }, m.mime));
    async function load(append_) {
      if (!append_) { page = 1; grid.replaceChildren(skeleton(3)); } else page++;
      try { const r = await A.media.list({ page, search, type }); pages = r.pages; if (!append_) grid.replaceChildren(); grid.append(...r.items.map(tileFor)); more.hidden = page >= pages; if (!r.items.length && !append_) grid.replaceChildren(empty('还没有图片', '上传第一张吧。')); } catch (e) { fail(e); }
    }
    let done; const okBtn = btn('使用所选', { variant: 'primary', disabled: true, onClick: () => done(chosen) });
    const body = h('div', { class: 'up-picker', onDragover: e => { e.preventDefault(); drop.classList.add('is-over'); }, onDragleave: () => drop.classList.remove('is-over'), onDrop: e => { e.preventDefault(); drop.classList.remove('is-over'); uploadFiles([...e.dataTransfer.files]); } },
      h('div', { class: 'up-toolbar' }, h('label', { class: 'up-search' }, icon('search'), h('input', { type: 'search', placeholder: '搜索媒体', onInput: debounce(e => { search = e.target.value; load(); }, 300) }))), drop, grid, h('div', { class: 'up-center' }, more));
    load();
    return modal(title, body, close => { done = close; return [btn('取消', { onClick: () => close(null) }), okBtn]; }, { wide: true });
  }

  /* ───────── Editor ───────── */
  function openEditor(type, id, seed) { open(null, true); go('edit', { type, id, seed }); }
  VIEWS.edit = async (root, { type = 'post', id, seed }, alive) => {
    const label = type === 'page' ? '页面' : '文章';
    setCrumb(h('button', { type: 'button', class: 'up-link', onClick: () => go(type === 'page' ? 'pages' : 'posts') }, label), id ? '编辑' : '新建');
    root.append(skeleton(8));
    const post = id ? await A.posts.get(type, id) : { id: 0, type, title: seed?.title || '', content: seed?.content || '', excerpt: '', status: 'draft', date: '', slug: '', categories: [], tags: [], featured: 0, comments: 'open', sticky: false, format: 'html' };
    if (!alive()) return;
    root.replaceChildren();
    const draftKey = `uo-panel:draft:${type}:${post.id || 'new'}`;
    let dirty = false, saving = false, mode = 'visual';
    const markDirty = () => { if (!dirty) { dirty = true; status.textContent = '未保存'; status.className = 'up-editor__status is-dirty'; } localSave(); };
    const localSave = debounce(() => store.set(draftKey, { at: Date.now(), title: titleEl.value, content: currentHTML(), excerpt: excerptEl.value }), 1200);

    const titleEl = h('textarea', { class: 'up-editor__title', rows: 1, placeholder: `${label}标题`, value: post.title, onInput: () => { autosize(titleEl); markDirty(); } });
    const bodyEl = h('div', { class: 'up-editor__body uo-prose', contentEditable: 'true', role: 'textbox', 'aria-multiline': 'true', 'aria-label': '正文', 'data-placeholder': '开始写作…  支持 Markdown 快捷输入：## 标题、> 引用、- 列表、``` 代码' });
    bodyEl.append(importHTML(post.content));
    const sourceEl = h('textarea', { class: 'up-editor__source', hidden: true, spellcheck: 'false', onInput: markDirty });
    const currentHTML = () => (mode === 'source' ? sourceEl.value : exportHTML(bodyEl));
    const autosize = el => { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; };
    const words = h('span');
    const countWords = debounce(() => { const t = bodyEl.innerText || ''; const n = (t.match(/[\u4e00-\u9fff]/g) || []).length + (t.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length; words.textContent = `${n} 字`; }, 300);

    /* toolbar */
    const exec = (cmd, val) => { bodyEl.focus(); document.execCommand(cmd, false, val); markDirty(); refreshTools(); };
    const block = tag => { const cur = currentBlock(); exec('formatBlock', cur && cur.tagName === tag.toUpperCase() ? 'P' : tag); };
    const currentBlock = () => { let n = getSelection().anchorNode; while (n && n !== bodyEl) { if (n.nodeType === 1 && /^(P|H2|H3|H4|BLOCKQUOTE|PRE|LI)$/.test(n.tagName)) return n; n = n.parentNode; } return null; };
    const tool = (ic, label, fn, key) => h('button', { type: 'button', class: 'up-tool', title: key ? `${label} (${key})` : label, 'aria-label': label, dataset: { tool: ic }, onMousedown: e => e.preventDefault(), onClick: fn }, icon(ic));
    async function insertLink() {
      const sel = getSelection(); const range = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
      const existing = sel.anchorNode?.parentElement?.closest('a');
      const url = await prompt(existing ? '编辑链接' : '插入链接', existing?.getAttribute('href') || 'https://', 'https://');
      bodyEl.focus(); if (range) { sel.removeAllRanges(); sel.addRange(range); }
      if (url === null) return; if (!url.trim() || url === 'https://') { exec('unlink'); return; }
      if (/^\s*javascript:/i.test(url)) return;
      if (range && range.collapsed && !existing) exec('insertHTML', `<a href="${esc(url)}">${esc(url)}</a>`); else exec('createLink', url);
    }
    async function insertImage() {
      const sel = getSelection(); const range = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
      const m = await pickMedia({ title: '插入图片' }); if (!m) return;
      bodyEl.focus(); if (range) { sel.removeAllRanges(); sel.addRange(range); }
      exec('insertHTML', `<figure class="wp-block-image"><img src="${esc(m.url)}" alt="${esc(m.alt || '')}"${m.width ? ` width="${m.width}" height="${m.height}"` : ''}></figure><p><br></p>`);
    }
    const codeBlock = () => { const cur = currentBlock(); if (cur?.tagName === 'PRE') { exec('formatBlock', 'P'); return; } exec('formatBlock', 'PRE'); };
    const inlineCode = () => { const sel = getSelection(); if (!sel.rangeCount || sel.isCollapsed) return; exec('insertHTML', `<code>${esc(sel.toString())}</code>`); };
    const toolbar = h('div', { class: 'up-editor__tools', role: 'toolbar', 'aria-label': '格式' },
      tool('h2', '二级标题', () => block('h2')), tool('h3', '三级标题', () => block('h3')), h('i', { class: 'up-tool__sep' }),
      tool('bold', '加粗', () => exec('bold'), '⌘B'), tool('italic', '斜体', () => exec('italic'), '⌘I'), tool('strike', '删除线', () => exec('strikeThrough')), tool('code', '行内代码', inlineCode, '⌘E'), tool('link', '链接', insertLink, '⌘K'), h('i', { class: 'up-tool__sep' }),
      tool('quote', '引用', () => block('blockquote')), tool('ul', '无序列表', () => exec('insertUnorderedList')), tool('ol', '有序列表', () => exec('insertOrderedList')), tool('source', '代码块', codeBlock), tool('hr', '分隔线', () => exec('insertHorizontalRule')),
      caps.media ? tool('image', '插入图片', insertImage) : null,
      h('span', { class: 'up-tool__grow' }),
      h('button', { type: 'button', class: 'up-tool up-tool--text', 'aria-pressed': 'false', onClick: e => switchMode(e.currentTarget) }, 'HTML'));
    function refreshTools() {
      if (mode !== 'visual') return;
      const states = { bold: 'bold', italic: 'italic', strike: 'strikeThrough', ul: 'insertUnorderedList', ol: 'insertOrderedList' };
      Object.entries(states).forEach(([k, c]) => { let on = false; try { on = document.queryCommandState(c); } catch (_) {} toolbar.querySelector(`[data-tool="${k}"]`)?.classList.toggle('is-on', on); });
      const cur = currentBlock()?.tagName;
      [['h2', 'H2'], ['h3', 'H3'], ['quote', 'BLOCKQUOTE'], ['source', 'PRE']].forEach(([k, t]) => toolbar.querySelector(`[data-tool="${k}"]`)?.classList.toggle('is-on', cur === t || (t === 'BLOCKQUOTE' && !!getSelection().anchorNode?.parentElement?.closest?.('blockquote'))));
    }
    function switchMode(b) {
      if (mode === 'visual') { sourceEl.value = exportHTML(bodyEl); bodyEl.hidden = true; sourceEl.hidden = false; mode = 'source'; autosize(sourceEl); sourceEl.focus(); }
      else { bodyEl.replaceChildren(importHTML(sourceEl.value)); sourceEl.hidden = true; bodyEl.hidden = false; mode = 'visual'; bodyEl.focus(); }
      b.setAttribute('aria-pressed', String(mode === 'source')); toolbar.classList.toggle('is-source', mode === 'source');
    }
    document.execCommand('defaultParagraphSeparator', false, 'p');
    // Keep top-level text inside paragraphs so formatting and shortcuts always have a block.
    function ensureBlocks() {
      if (!bodyEl.firstChild || (bodyEl.childNodes.length === 1 && bodyEl.firstChild.nodeName === 'BR')) { bodyEl.innerHTML = '<p><br></p>'; const r = document.createRange(); r.setStart(bodyEl.firstChild, 0); const s = getSelection(); if (document.activeElement === bodyEl) { s.removeAllRanges(); s.addRange(r); } }
      [...bodyEl.childNodes].forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) { const sel = getSelection(); const caret = sel.anchorNode === n ? sel.anchorOffset : -1; const p = document.createElement('p'); n.replaceWith(p); p.append(n); if (caret >= 0) { const r = document.createRange(); r.setStart(n, caret); sel.removeAllRanges(); sel.addRange(r); } } });
      bodyEl.classList.toggle('is-empty', !bodyEl.textContent.trim() && !bodyEl.querySelector('img,hr,.up-embed'));
    }
    bodyEl.addEventListener('focus', ensureBlocks);
    bodyEl.addEventListener('input', () => { ensureBlocks(); markDirty(); countWords(); });
    bodyEl.addEventListener('keyup', refreshTools); bodyEl.addEventListener('mouseup', refreshTools);
    bodyEl.addEventListener('keydown', e => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); insertLink(); }
      else if (mod && e.key.toLowerCase() === 'e') { e.preventDefault(); inlineCode(); }
      else if (e.key === 'Tab' && currentBlock()?.tagName === 'PRE') { e.preventDefault(); exec('insertText', '  '); }
      else if (e.key === ' ' && !mod) {
        // Markdown-style shortcuts at the start of a paragraph.
        const blk = currentBlock(); if (!blk || blk.tagName !== 'P') return;
        const sel = getSelection(); const pre = blk.textContent.slice(0, sel.anchorOffset);
        const map = { '#': 'H2', '##': 'H2', '###': 'H3', '>': 'BLOCKQUOTE', '-': 'UL', '*': 'UL', '1.': 'OL' };
        const target = sel.anchorNode === blk.firstChild || sel.anchorNode === blk ? map[pre.trim()] : null;
        if (!target || pre !== blk.textContent.slice(0, pre.length) || pre.trim() !== blk.textContent.trim().slice(0, pre.trim().length)) return;
        if (blk.textContent.trim() !== pre.trim()) return;
        e.preventDefault(); blk.innerHTML = '<br>'; const r = document.createRange(); r.setStart(blk, 0); sel.removeAllRanges(); sel.addRange(r);
        if (target === 'UL') exec('insertUnorderedList'); else if (target === 'OL') exec('insertOrderedList'); else exec('formatBlock', target);
      } else if (e.key === 'Enter' && !e.shiftKey) {
        const blk = currentBlock();
        if (blk?.tagName === 'P' && blk.textContent.trim() === '```') { e.preventDefault(); blk.innerHTML = '<br>'; exec('formatBlock', 'PRE'); }
        else if (blk?.tagName === 'P' && /^-{3,}$/.test(blk.textContent.trim())) { e.preventDefault(); blk.innerHTML = '<br>'; exec('insertHorizontalRule'); }
      }
    });
    bodyEl.addEventListener('paste', e => {
      const files = [...(e.clipboardData?.files || [])].filter(f => /^image\//.test(f.type));
      if (files.length && caps.media) { e.preventDefault(); files.forEach(uploadInline); return; }
      const html = e.clipboardData?.getData('text/html'); const txt = e.clipboardData?.getData('text/plain');
      if (currentBlock()?.tagName === 'PRE') { e.preventDefault(); exec('insertText', txt || ''); return; }
      if (html) { e.preventDefault(); exec('insertHTML', cleanPaste(html)); }
      else if (txt && /\n/.test(txt)) { e.preventDefault(); exec('insertHTML', txt.split(/\n{2,}/).map(t => `<p>${esc(t).replace(/\n/g, '<br>')}</p>`).join('')); }
    });
    bodyEl.addEventListener('drop', e => { const files = [...(e.dataTransfer?.files || [])].filter(f => /^image\//.test(f.type)); if (files.length && caps.media) { e.preventDefault(); const r = document.caretRangeFromPoint?.(e.clientX, e.clientY); if (r) { const s = getSelection(); s.removeAllRanges(); s.addRange(r); } files.forEach(uploadInline); } });
    async function uploadInline(file) {
      const key = `u${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
      exec('insertHTML', `<p data-up-uploading="${key}" contenteditable="false" class="up-uploading">上传中：${esc(file.name)}…</p>`);
      try { const m = await A.media.upload(file); const ph = bodyEl.querySelector(`[data-up-uploading="${key}"]`); const fig = document.createElement('figure'); fig.className = 'wp-block-image'; const img = document.createElement('img'); img.src = m.url; img.alt = m.alt || ''; fig.append(img); ph?.replaceWith(fig); markDirty(); toast('图片已上传'); }
      catch (err) { bodyEl.querySelector(`[data-up-uploading="${key}"]`)?.remove(); fail(err); }
    }

    /* settings drawer */
    const st = { ...post };
    const statusSel = h('select', { class: 'up-input', onChange: e => { st.status = e.target.value; dateWrap.hidden = st.status !== 'future'; markDirty(); updatePrimary(); } },
      [['draft', '草稿'], ['pending', '待审'], ['publish', '已发布'], ['future', '定时发布'], ['private', '私密']].filter(([v]) => caps.publish || ['draft', 'pending'].includes(v)).map(([v, l]) => h('option', { value: v, selected: post.status === v }, l)));
    const toLocal = iso => (iso ? iso.slice(0, 16) : '');
    const dateInput = h('input', { type: 'datetime-local', class: 'up-input', value: toLocal(post.date), onChange: e => { st.date = e.target.value ? `${e.target.value}:00` : ''; markDirty(); } });
    const dateWrap = field('发布时间', dateInput, '定时发布将在此时间自动上线'); dateWrap.hidden = post.status !== 'future';
    const slugEl = h('input', { class: 'up-input', value: post.slug || '', placeholder: '自动生成', onInput: e => { st.slug = e.target.value; markDirty(); } });
    const excerptEl = h('textarea', { class: 'up-input', rows: 3, value: post.excerpt || '', placeholder: '留空则自动截取正文', onInput: e => { st.excerpt = e.target.value; markDirty(); } });
    const featuredBox = h('div', { class: 'up-featured' });
    async function renderFeatured() {
      featuredBox.replaceChildren();
      if (st.featured) {
        let m = null; try { m = await A.media.get(st.featured); } catch (_) {}
        featuredBox.append(h('div', { class: 'up-featured__img' }, m ? h('img', { src: m.thumb, alt: '' }) : h('span', null, `#${st.featured}`)),
          h('div', { class: 'up-row-end' }, btn('更换', { onClick: chooseFeatured }), btn('移除', { variant: 'ghost', onClick: () => { st.featured = 0; markDirty(); renderFeatured(); } })));
      } else featuredBox.append(h('button', { type: 'button', class: 'up-featured__add', onClick: chooseFeatured, disabled: !caps.media }, icon('image'), h('span', null, '设置封面图'), h('small', null, '未设置时使用主题示意封面')));
    }
    async function chooseFeatured() { const m = await pickMedia({ title: '选择封面图' }); if (m) { st.featured = m.id; markDirty(); renderFeatured(); } }
    renderFeatured();
    const drawer = h('aside', { class: 'up-editor__side' },
      h('section', null, h('h3', null, '发布'), field('状态', statusSel), dateWrap, field('链接别名', slugEl)));
    if (type === 'post') {
      const catBox = h('div', { class: 'up-checks' });
      const renderCats = async force => { const cats = await categories(force); catBox.replaceChildren(...cats.map(c => h('label', { class: 'up-check' }, h('input', { type: 'checkbox', checked: st.categories.includes(c.id), onChange: e => { st.categories = e.target.checked ? [...st.categories, c.id] : st.categories.filter(x => x !== c.id); markDirty(); } }), h('span', null, c.name)))); };
      renderCats();
      const addCat = async () => { const name = await prompt('新建分类', '', '分类名称'); if (!name?.trim()) return; try { const t = await A.terms.save('category', { name: name.trim() }); st.categories.push(t.id); await renderCats(true); markDirty(); } catch (e) { fail(e); } };
      const tagInput = tokenInput(st.tags, ids => { st.tags = ids; markDirty(); });
      drawer.append(
        h('section', null, h('h3', null, '分类', h('button', { type: 'button', class: 'up-link', onClick: addCat, hidden: !caps.terms }, '+ 新建')), catBox),
        h('section', null, h('h3', null, '标签'), tagInput),
        h('section', null, h('h3', null, '封面'), featuredBox),
        h('section', null, h('h3', null, '摘要'), excerptEl),
        h('section', null, h('h3', null, '选项'), toggle('允许评论', st.comments === 'open', v => { st.comments = v ? 'open' : 'closed'; markDirty(); }), caps.publish ? toggle('置顶到首页', st.sticky, v => { st.sticky = v; markDirty(); }) : null));
    } else {
      drawer.append(h('section', null, h('h3', null, '封面'), featuredBox), h('section', null, h('h3', null, '选项'), toggle('允许评论', st.comments === 'open', v => { st.comments = v ? 'open' : 'closed'; markDirty(); })));
    }

    /* top bar */
    const status = h('span', { class: 'up-editor__status' }, post.id ? `上次保存 ${ago(post.modified)}` : '新草稿');
    const preview = h('a', { class: 'up-btn up-btn--ghost', target: '_blank', rel: 'noopener', 'data-uo-no-nav': '', hidden: !post.id, href: post.id ? A.posts.previewUrl(post) : '#' }, icon('eye'), h('span', null, '预览'));
    const saveDraftBtn = btn('保存', { onClick: () => save() });
    const primary = btn('', { variant: 'primary', onClick: () => save(primaryTarget()) });
    const primaryTarget = () => (st.status === 'publish' || st.status === 'future' || st.status === 'private' ? st.status : (caps.publish ? 'publish' : 'pending'));
    function updatePrimary() {
      const target = primaryTarget(); const published = post.status === 'publish' || post.status === 'future' || post.status === 'private';
      primary.lastChild.textContent = published && target === post.status ? '更新' : target === 'future' ? '定时发布' : target === 'pending' ? '提交审核' : target === 'private' ? '私密发布' : '发布';
      saveDraftBtn.hidden = published;
    }
    updatePrimary();
    const sideBtn = iconBtn('side', '发布设置', () => editor.classList.toggle('is-side-open'), 'up-editor__side-toggle');
    const top = h('div', { class: 'up-editor__top' }, iconBtn('back', '返回列表', () => go(type === 'page' ? 'pages' : 'posts')), status, h('span', { class: 'up-tool__grow' }), words, preview, saveDraftBtn, primary, sideBtn);
    const editor = h('div', { class: 'up-editor' }, top, h('div', { class: 'up-editor__wrap' }, h('div', { class: 'up-editor__paper' },
      post.format === 'blocks' ? h('div', { class: 'up-note' }, icon('sparkle'), h('span', null, '这篇内容由区块编辑器创建。可视编辑会保留区块结构；复杂区块（嵌入、按钮组等）会以占位块原样保留。')) : null,
      titleEl, toolbar, bodyEl, sourceEl), drawer));
    root.append(editor);
    if (innerWidth > 1100) editor.classList.add('is-side-open');
    requestAnimationFrame(() => { autosize(titleEl); countWords(); bodyEl.classList.toggle('is-empty', !bodyEl.textContent.trim() && !bodyEl.querySelector('img,hr,.up-embed')); (post.id ? bodyEl : titleEl).focus(); });

    // Offer to restore a newer local draft.
    const local = store.get(draftKey, null);
    if (local && local.at > new Date(post.modified || 0).getTime() + 2000 && (local.content !== post.content || local.title !== post.title)) {
      const note = h('div', { class: 'up-note is-warn' }, icon('undo'), h('span', null, `发现 ${ago(new Date(local.at).toISOString())} 的本地未保存内容。`),
        h('button', { type: 'button', class: 'up-link', onClick: () => { titleEl.value = local.title; bodyEl.replaceChildren(importHTML(local.content)); excerptEl.value = st.excerpt = local.excerpt || ''; autosize(titleEl); markDirty(); note.remove(); } }, '恢复'),
        h('button', { type: 'button', class: 'up-link', onClick: () => { store.del(draftKey); note.remove(); } }, '丢弃'));
      editor.querySelector('.up-editor__paper').prepend(note);
    }

    async function save(targetStatus) {
      if (saving) return; saving = true;
      const btns = [saveDraftBtn, primary]; btns.forEach(b => { b.disabled = true; }); status.textContent = '保存中…'; status.className = 'up-editor__status';
      const data = { id: post.id || undefined, title: titleEl.value.trim(), content: currentHTML(), excerpt: excerptEl.value, slug: st.slug, status: targetStatus || st.status, comments: st.comments, featured: st.featured };
      if (type === 'post') { data.categories = st.categories; data.tags = st.tags; data.sticky = st.sticky; }
      if (data.status === 'future' || (st.date && st.date !== post.date)) data.date = st.date || null;
      if (data.status === 'future' && !data.date) { toast('请先设置定时发布时间', 'error'); finish(); return; }
      try {
        const saved_ = await A.posts.save(type, data);
        const firstPublish = saved_.status === 'publish' && post.status !== 'publish';
        Object.assign(post, saved_); Object.assign(st, { status: saved_.status, slug: saved_.slug, date: saved_.date });
        statusSel.value = saved_.status; slugEl.value = saved_.slug || '';
        dirty = false; store.del(draftKey);
        if (!id) { id = saved_.id; }
        status.textContent = `已保存 ${fmtDate(new Date().toISOString(), true).slice(11)}`; status.className = 'up-editor__status is-saved';
        preview.hidden = false; preview.href = A.posts.previewUrl(saved_);
        updatePrimary();
        toast(firstPublish ? `已发布 🎉` : saved_.status === 'future' ? '已设置定时发布' : '已保存');
        if (firstPublish) {
          const view = h('a', { class: 'up-link', href: saved_.link, target: '_blank', rel: 'noopener', 'data-uo-no-nav': '' }, '查看文章 ↗');
          status.replaceChildren('已发布 · ', view);
        }
      } catch (e) { status.textContent = '保存失败'; status.className = 'up-editor__status is-dirty'; fail(e); }
      finish();
      function finish() { saving = false; btns.forEach(b => { b.disabled = false; }); }
    }
    editor.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); } });
    state.guard = async () => !dirty || !!(await confirmBox('放弃未保存的修改？', '修改已暂存在本机，下次打开此文章时可以恢复。', { ok: '离开' }));
    addEventListener('beforeunload', e => { if (dirty && document.body.contains(editor)) { e.preventDefault(); e.returnValue = ''; } });
  };

  function tokenInput(ids, onChange) {
    let current = [...ids]; const names = new Map();
    const wrap = h('div', { class: 'up-tokens' });
    const input = h('input', { class: 'up-tokens__input', placeholder: '输入后回车添加', 'aria-label': '添加标签' });
    const sugg = h('div', { class: 'up-suggest', hidden: true });
    const render = () => { $$('.up-token', wrap).forEach(t => t.remove()); current.forEach(id => wrap.insertBefore(h('span', { class: 'up-token' }, names.get(id) || `#${id}`, h('button', { type: 'button', 'aria-label': '移除', onClick: () => { current = current.filter(x => x !== id); onChange(current); render(); } }, '×')), input)); };
    const add = t => { names.set(t.id, t.name); if (!current.includes(t.id)) { current.push(t.id); onChange(current); } input.value = ''; sugg.hidden = true; render(); };
    input.addEventListener('input', debounce(async () => {
      const q = input.value.trim(); if (!q) { sugg.hidden = true; return; }
      const list = await A.terms.list('tag', { search: q, perPage: 8 }).catch(() => []);
      sugg.replaceChildren(...list.filter(t => !current.includes(t.id)).map(t => h('button', { type: 'button', onMousedown: e => { e.preventDefault(); add(t); } }, t.name, h('small', null, t.count))));
      sugg.hidden = !sugg.childNodes.length;
    }, 220));
    input.addEventListener('keydown', async e => {
      if ((e.key === 'Enter' || e.key === ',' || e.key === '，') && input.value.trim()) {
        e.preventDefault(); const name = input.value.trim().replace(/[,，]$/, '');
        try { const found = (await A.terms.list('tag', { search: name, perPage: 20 })).find(t => t.name.toLowerCase() === name.toLowerCase()); add(found || await A.terms.save('tag', { name })); } catch (err) { fail(err); }
      } else if (e.key === 'Backspace' && !input.value && current.length) { current.pop(); onChange(current); render(); }
    });
    input.addEventListener('blur', () => setTimeout(() => { sugg.hidden = true; }, 150));
    wrap.append(input);
    if (ids.length) A.terms.list('tag', { perPage: 100 }).then(all => { all.forEach(t => names.set(t.id, t.name)); render(); }).catch(render);
    return h('div', { class: 'up-tokens-wrap' }, wrap, sugg);
  }

  /* ───────── Comments ───────── */
  VIEWS.comments = async (root, params = {}, alive) => {
    setCrumb('评论');
    const q = { status: params.status || 'hold', page: 1, search: '' };
    const body = h('div');
    root.append(head('评论', '审核、回复与清理'),
      h('div', { class: 'up-toolbar' }, segmented([['hold', '待审核'], ['approved', '已通过'], ['spam', '垃圾'], ['trash', '回收站']], q.status, v => { q.status = v; q.page = 1; load(); }),
        h('div', { class: 'up-toolbar__end' }, h('label', { class: 'up-search' }, icon('search'), h('input', { type: 'search', placeholder: '搜索评论', onInput: debounce(e => { q.search = e.target.value; q.page = 1; load(); }, 300) })))), body);
    async function load() {
      body.replaceChildren(skeleton(4));
      let r; try { r = await A.comments.list(q); } catch (e) { body.replaceChildren(empty('加载失败', e.message)); return; }
      if (!alive()) return;
      if (q.status === 'hold') { badge.hidden = !r.total; badge.textContent = r.total; }
      if (!r.items.length) { body.replaceChildren(empty(q.status === 'hold' ? '没有待审核的评论' : '这里是空的', q.status === 'hold' ? '都处理完了，休息一下。' : null)); return; }
      const titles = await A.posts.titles([...new Set(r.items.map(c => c.post))]); if (!alive()) return;
      const act = (c, status, label, ic, cls) => iconBtn(ic, label, async () => { try { await A.comments.setStatus(c.id, status); toast(`已${label}`); load(); } catch (e) { fail(e); } }, cls);
      body.replaceChildren(h('ul', { class: 'up-comments' }, r.items.map(c => {
        const replyBox = h('form', { class: 'up-reply', hidden: true, onSubmit: async e => {
          e.preventDefault(); const ta = replyBox.querySelector('textarea'); if (!ta.value.trim()) return;
          try { if (c.status === 'hold') await A.comments.setStatus(c.id, 'approved'); await A.comments.reply(c.post, c.id, ta.value.trim()); toast('回复已发布'); load(); } catch (err) { fail(err); }
        } }, h('textarea', { class: 'up-input', rows: 3, placeholder: `回复 ${c.author}…` }), h('div', { class: 'up-row-end' }, btn('取消', { variant: 'ghost', onClick: () => { replyBox.hidden = true; } }), h('button', { type: 'submit', class: 'up-btn up-btn--primary' }, c.status === 'hold' ? '通过并回复' : '回复')));
        const t = titles[c.post];
        return h('li', { class: 'up-comment' },
          c.avatar ? avatar(c.avatar, c.author, 40) : h('span', { class: 'up-comment__ph' }, c.author.slice(0, 1)),
          h('div', { class: 'up-comment__main' },
            h('div', { class: 'up-comment__head' }, h('strong', null, c.author), c.email ? h('small', null, c.email) : null, h('small', null, ago(c.date)), pill(c.status)),
            h('p', { class: 'up-comment__text' }, c.content),
            t ? h('a', { class: 'up-comment__post', href: c.link || t.link, target: '_blank', rel: 'noopener', 'data-uo-no-nav': '' }, '于《', t.title, '》') : null,
            replyBox),
          h('div', { class: 'up-item__actions is-visible' },
            c.status === 'hold' ? act(c, 'approved', '通过', 'check', 'is-ok') : null,
            c.status === 'approved' ? act(c, 'hold', '驳回', 'undo') : null,
            c.status === 'approved' || c.status === 'hold' ? iconBtn('reply', '回复', () => { replyBox.hidden = !replyBox.hidden; replyBox.querySelector('textarea').focus(); }) : null,
            c.status === 'spam' || c.status === 'trash' ? act(c, 'approved', '恢复', 'undo') : act(c, 'spam', '标记垃圾', 'spam'),
            c.status === 'trash' || c.status === 'spam' ? iconBtn('trash', '永久删除', async () => { if (await confirmBox('永久删除评论？', '此操作无法撤销。', { danger: true, ok: '删除' })) { try { await A.comments.remove(c.id); toast('已删除'); load(); } catch (e) { fail(e); } } }, 'is-danger') : act(c, 'trash', '移到回收站', 'trash', 'is-danger')));
      })), pager(q.page, r.pages, p => { q.page = p; load(); }));
    }
    load();
  };

  /* ───────── Media library ───────── */
  VIEWS.media = async (root, _, alive) => {
    setCrumb('媒体库');
    let page = 1, pages = 1, search = '';
    const grid = h('div', { class: 'up-media-grid' });
    const detail = h('aside', { class: 'up-media-detail', hidden: true });
    const input = h('input', { type: 'file', multiple: true, hidden: true, onChange: e => { uploadFiles([...e.target.files]); e.target.value = ''; } });
    const more = btn('加载更多', { onClick: () => load(true) });
    root.append(head('媒体库', '拖拽文件到此处即可上传', btn('上传文件', { variant: 'primary', icon: 'upload', onClick: () => input.click() }), input),
      h('div', { class: 'up-toolbar' }, h('label', { class: 'up-search' }, icon('search'), h('input', { type: 'search', placeholder: '搜索文件', onInput: debounce(e => { search = e.target.value; load(); }, 300) }))),
      h('div', { class: 'up-media-layout' }, h('div', null, grid, h('div', { class: 'up-center' }, more)), detail));
    root.addEventListener('dragover', e => { e.preventDefault(); root.classList.add('is-dropping'); });
    root.addEventListener('dragleave', e => { if (!root.contains(e.relatedTarget)) root.classList.remove('is-dropping'); });
    root.addEventListener('drop', e => { e.preventDefault(); root.classList.remove('is-dropping'); uploadFiles([...e.dataTransfer.files]); });
    async function uploadFiles(files) {
      for (const f of files) {
        const tile = h('div', { class: 'up-media is-uploading' }, h('i', { class: 'up-progress', style: { '--p': 0 } }), h('span', null, f.name));
        grid.querySelector('.up-empty')?.remove(); grid.prepend(tile);
        try { const m = await A.media.upload(f, p => tile.firstChild.style.setProperty('--p', p)); tile.replaceWith(tileFor(m)); toast(`${f.name} 已上传`); } catch (e) { tile.remove(); fail(e); }
      }
    }
    const tileFor = m => h('button', { type: 'button', class: 'up-media', title: m.title, onClick: e => { $$('.up-media', grid).forEach(t => t.classList.remove('is-chosen')); e.currentTarget.classList.add('is-chosen'); show(m, e.currentTarget); } }, /^image\//.test(m.mime) ? h('img', { src: m.thumb, alt: m.alt, loading: 'lazy' }) : h('span', { class: 'up-media__file' }, (m.mime || '').split('/').pop()));
    function show(m, tile) {
      const title = h('input', { class: 'up-input', value: m.title }); const alt = h('input', { class: 'up-input', value: m.alt, placeholder: '描述图片内容，利于无障碍与SEO' });
      detail.hidden = false;
      detail.replaceChildren(
        h('div', { class: 'up-media-detail__head' }, h('strong', null, '文件详情'), iconBtn('x', '关闭', () => { detail.hidden = true; tile.classList.remove('is-chosen'); })),
        /^image\//.test(m.mime) ? h('img', { class: 'up-media-detail__img', src: m.thumb, alt: '' }) : null,
        h('dl', { class: 'up-dl' }, h('dt', null, '类型'), h('dd', null, m.mime), m.width ? [h('dt', null, '尺寸'), h('dd', null, `${m.width} × ${m.height}`)] : null, m.size ? [h('dt', null, '大小'), h('dd', null, `${(m.size / 1024).toFixed(0)} KB`)] : null, h('dt', null, '上传'), h('dd', null, fmtDate(m.date, true))),
        field('标题', title), /^image\//.test(m.mime) ? field('替代文本', alt) : null,
        h('div', { class: 'up-copy' }, h('input', { class: 'up-input', value: m.url, readOnly: true, onFocus: e => e.target.select() }), iconBtn('copy', '复制链接', async () => { try { await navigator.clipboard.writeText(m.url); toast('链接已复制'); } catch (_) { toast('请手动复制', 'error'); } })),
        h('div', { class: 'up-row-end' },
          btn('删除', { variant: 'danger', onClick: async () => { if (await confirmBox('永久删除文件？', '已插入文章中的此文件将无法显示。', { danger: true, ok: '删除' })) { try { await A.media.remove(m.id); tile.remove(); detail.hidden = true; toast('已删除'); } catch (e) { fail(e); } } } }),
          btn('保存', { variant: 'primary', onClick: async () => { try { Object.assign(m, await A.media.update(m.id, { title: title.value, alt: alt.value })); toast('已保存'); } catch (e) { fail(e); } } })));
    }
    async function load(append_) {
      if (!append_) { page = 1; grid.replaceChildren(skeleton(3)); } else page++;
      let r; try { r = await A.media.list({ page, search }); } catch (e) { grid.replaceChildren(empty('加载失败', e.message)); return; }
      if (!alive()) return;
      pages = r.pages; if (!append_) grid.replaceChildren();
      grid.append(...r.items.map(tileFor)); more.hidden = page >= pages;
      if (!r.items.length && !append_) grid.replaceChildren(empty('媒体库是空的', '拖拽图片到这里上传。'));
    }
    load();
  };

  /* ───────── Terms ───────── */
  VIEWS.terms = async (root, _, alive) => {
    setCrumb('分类与标签');
    root.append(head('分类与标签', '整理内容结构'));
    const col = (tax, label) => {
      const list = h('ul', { class: 'up-terms' }, skeleton(4));
      const nameIn = h('input', { class: 'up-input', placeholder: `新${label}名称` });
      const add = h('form', { class: 'up-inline-form', onSubmit: async e => { e.preventDefault(); if (!nameIn.value.trim()) return; try { await A.terms.save(tax, { name: nameIn.value.trim() }); nameIn.value = ''; toast(`${label}已添加`); if (tax === 'category') termCache = null; load(); } catch (err) { fail(err); } } }, nameIn, h('button', { type: 'submit', class: 'up-btn up-btn--primary' }, '添加'));
      async function load() {
        const terms = await A.terms.list(tax).catch(e => { fail(e); return []; }); if (!alive()) return;
        list.replaceChildren(...(terms.length ? terms.map(t => h('li', null,
          h('span', { class: 'up-terms__name' }, t.name, h('small', null, t.slug)), h('em', null, t.count),
          h('div', { class: 'up-item__actions' },
            iconBtn('edit', '重命名', async () => { const name = await prompt(`重命名${label}`, t.name); if (name && name.trim() && name !== t.name) { try { await A.terms.save(tax, { id: t.id, name: name.trim() }); toast('已更新'); termCache = null; load(); } catch (e) { fail(e); } } }),
            iconBtn('trash', '删除', async () => { if (await confirmBox(`删除${label}「${t.name}」？`, tax === 'category' ? '文章不会被删除，会归入默认分类。' : '文章不会被删除，只会移除此标签。', { danger: true, ok: '删除' })) { try { await A.terms.remove(tax, t.id); toast('已删除'); termCache = null; load(); } catch (e) { fail(e); } } }, 'is-danger')))) : [h('li', { class: 'up-muted' }, `还没有${label}`)]));
      }
      load();
      return h('div', { class: 'up-card' }, h('div', { class: 'up-card__head' }, h('strong', null, label)), add, list);
    };
    root.append(h('div', { class: 'up-cols is-even' }, col('category', '分类'), col('tag', '标签')));
  };

  /* ───────── Settings (appearance + site) ───────── */
  let settingsCache = null;
  async function settingsForm(root, alive, build) {
    root.append(skeleton(6));
    const data = settingsCache = await A.settings.get(); if (!alive()) return;
    root.lastChild.remove();
    const draft = JSON.parse(JSON.stringify(data));
    let changed = false;
    const saveBar = h('div', { class: 'up-savebar', hidden: true }, h('span', null, '有未保存的更改'), btn('撤销', { variant: 'ghost', onClick: () => go(state.view) }), btn('保存更改', { variant: 'primary', onClick: save }));
    const touch = () => { changed = true; saveBar.hidden = false; };
    async function save() {
      try { settingsCache = await A.settings.save(draft); changed = false; saveBar.hidden = true; toast('设置已保存，刷新页面后完整生效'); state.guard = null; }
      catch (e) { fail(e); }
    }
    state.guard = async () => !changed || !!(await confirmBox('放弃未保存的设置？', '离开后这些更改会丢失。', { ok: '放弃' }));
    build(draft, touch);
    root.append(saveBar);
  }
  const section = (title, desc, ...kids) => h('section', { class: 'up-card up-section' }, h('div', { class: 'up-section__head' }, h('h3', null, title), desc ? h('p', null, desc) : null), h('div', { class: 'up-section__body' }, kids));
  const text = (obj, key, touch, attrs = {}) => h(attrs.rows ? 'textarea' : 'input', { class: 'up-input', value: obj[key] ?? '', ...attrs, onInput: e => { obj[key] = attrs.type === 'number' ? +e.target.value : e.target.value; touch(); attrs.onLive?.(e.target.value); } });

  const ACCENTS = [['#4f5bd5', '靛蓝'], ['#0f9d7a', '松绿'], ['#e5533d', '朱砂'], ['#d9822b', '琥珀'], ['#c2417a', '莓红'], ['#2f80c8', '海蓝'], ['#1c1d21', '墨黑']];
  VIEWS.appearance = (root, _, alive) => {
    setCrumb('外观');
    root.append(head('外观', '所有改动即时预览，保存后对访客生效'));
    return settingsForm(root, alive, (d, touch) => {
      const a = d.appearance; const rootEl = document.documentElement;
      const live = { accent: v => { rootEl.style.setProperty('--uo-accent', v); rootEl.style.setProperty('--uo-accent-dark', `color-mix(in srgb, ${v} 62%, #fff)`); }, layout: v => document.body.classList.toggle('uo-layout-list', v === 'list') };
      const swatches = h('div', { class: 'up-swatches' });
      const custom = h('input', { type: 'color', value: a.accent, 'aria-label': '自定义颜色', onInput: e => pick(e.target.value) });
      const pick = v => { a.accent = v; live.accent(v); custom.value = v; $$('button', swatches).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v))); touch(); };
      ACCENTS.forEach(([v, n]) => swatches.append(h('button', { type: 'button', class: 'up-swatch', style: { '--c': v }, title: n, 'aria-label': n, 'aria-pressed': String(a.accent === v), dataset: { v }, onClick: () => pick(v) })));
      swatches.append(h('label', { class: 'up-swatch up-swatch--custom', title: '自定义' }, custom, icon('plus')));
      const choice = (options, value, onChange) => h('div', { class: 'up-choices' }, options.map(([v, label, desc]) => h('label', { class: 'up-choice' }, h('input', { type: 'radio', name: `c${options[0][0]}`, checked: v === value, onChange: () => onChange(v) }), h('strong', null, label), desc ? h('small', null, desc) : null)));

      root.append(
        section('主题色', '用于链接、按钮与高亮', swatches),
        section('外观模式', '访客首次访问时的默认配色，访客可自行切换', choice([['system', '跟随系统', '自动适配深浅'], ['light', '浅色', '纸张质感'], ['dark', '深色', '夜间阅读']], a.scheme, v => { a.scheme = v; touch(); })),
        section('首页', null,
          choice([['grid', '卡片网格', '图文并茂'], ['list', '简洁列表', '信息密度高']], a.layout, v => { a.layout = v; live.layout(v); touch(); }),
          toggle('显示首页标题区', a.hero, v => { a.hero = v ? 1 : 0; touch(); }),
          h('div', { class: 'up-grid2' }, field('眉标', text(a, 'hero_eyebrow', touch, { placeholder: d.site.title })), field('主标题', text(a, 'hero_title', touch, { placeholder: d.site.description }))),
          field('导语', text(a, 'hero_lead', touch, { rows: 2, placeholder: '一句话介绍这个博客（可选）' })),
          toggle('显示统计数字', a.stats, v => { a.stats = v ? 1 : 0; touch(); }),
          toggle('突出展示最新文章', a.feature, v => { a.feature = v ? 1 : 0; touch(); }, '首页第一篇以大卡片展示')),
        section('文章页', null,
          toggle('文章目录', a.toc, v => { a.toc = v ? 1 : 0; touch(); }, '宽屏显示在右侧，窄屏为浮动按钮'),
          toggle('相关文章', a.related, v => { a.related = v ? 1 : 0; touch(); }),
          toggle('无刷新页面切换', a.pjax, v => { a.pjax = v ? 1 : 0; touch(); }, '站内跳转更流畅'),
          toggle('页脚显示登录入口', a.login_link, v => { a.login_link = v ? 1 : 0; touch(); })),
        section('导航菜单', '留空时使用 WordPress 菜单或热门分类', navEditor(a, touch)),
        section('作者卡片', '显示在页脚', profileEditor(a.profile, touch)),
        section('看板娘', '社区动态角色，访客可暂停或收起', companionEditor(d.companion, touch)),
        section('页脚', null, field('版权文字', text(d.footer, 'copyright', touch)), field('ICP 备案号', text(d.footer, 'icp', touch, { placeholder: '例如 京ICP备00000000号' }))));
    });
  };
  function navEditor(a, touch) {
    const list = h('div', { class: 'up-rows' });
    const render = () => list.replaceChildren(...a.nav.map((item, i) => h('div', { class: 'up-rowedit' },
      h('input', { class: 'up-input', value: item.label, placeholder: '名称', onInput: e => { item.label = e.target.value; touch(); } }),
      h('input', { class: 'up-input', value: item.url, placeholder: 'https://', onInput: e => { item.url = e.target.value; touch(); } }),
      iconBtn('up', '上移', () => { if (i) { [a.nav[i - 1], a.nav[i]] = [a.nav[i], a.nav[i - 1]]; render(); touch(); } }),
      iconBtn('down', '下移', () => { if (i < a.nav.length - 1) { [a.nav[i + 1], a.nav[i]] = [a.nav[i], a.nav[i + 1]]; render(); touch(); } }),
      iconBtn('x', '删除', () => { a.nav.splice(i, 1); render(); touch(); }, 'is-danger'))));
    render();
    const seed = () => { const links = $$('.uo-nav a').map(x => ({ label: x.textContent.trim(), url: x.href })); a.nav = links; render(); touch(); };
    return h('div', null, list, h('div', { class: 'up-row-end is-start' }, btn('添加链接', { icon: 'plus', onClick: () => { a.nav.push({ label: '', url: '' }); render(); touch(); list.lastChild?.querySelector('input')?.focus(); } }), !a.nav.length ? btn('从当前菜单导入', { variant: 'ghost', onClick: seed }) : null));
  }
  function profileEditor(p, touch) {
    const av = h('button', { type: 'button', class: 'up-avatar-pick', title: '更换头像', onClick: async () => { const m = await pickMedia({ title: '选择头像' }); if (m) { p.avatar = m.url; img.src = m.thumb; touch(); } } });
    const img = h('img', { src: p.avatar || S.user.avatar, alt: '' }); av.append(img, h('span', null, icon('edit')));
    const social = h('div', { class: 'up-rows' });
    const types = [['github', 'GitHub'], ['mail', '邮箱'], ['globe', '网站'], ['x', 'X / Twitter'], ['weibo', '微博'], ['bilibili', 'B 站'], ['rss', 'RSS']];
    const render = () => social.replaceChildren(...p.social.map((s, i) => h('div', { class: 'up-rowedit is-social' },
      h('select', { class: 'up-input up-select', onChange: e => { s.type = e.target.value; touch(); } }, types.map(([v, l]) => h('option', { value: v, selected: s.type === v }, l))),
      h('input', { class: 'up-input', value: s.url, placeholder: s.type === 'mail' ? 'name@example.com' : 'https://', onInput: e => { s.url = e.target.value; touch(); } }),
      iconBtn('x', '删除', () => { p.social.splice(i, 1); render(); touch(); }, 'is-danger'))));
    render();
    return h('div', null, h('div', { class: 'up-profile-edit' }, av, h('div', { class: 'up-grow' }, field('名字', text(p, 'name', touch, { placeholder: S.user.name })), field('简介', text(p, 'bio', touch, { rows: 2, placeholder: '一句话介绍自己' })))),
      h('span', { class: 'up-field__label' }, '社交链接'), social, h('div', { class: 'up-row-end is-start' }, btn('添加', { icon: 'plus', onClick: () => { p.social.push({ type: 'github', url: '' }); render(); touch(); } })));
  }
  function companionEditor(c, touch) {
    const models = [['gpt', 'GPT · 小缇', '银白长发的龙角少女'], ['claude', 'Claude · 小柯', '温暖的书卷少女'], ['deepseek', 'DeepSeek · 小鲸', '蓝色鲸尾女仆']];
    const cards = h('div', { class: 'up-mascots' }, models.map(([id, name, desc]) => h('label', { class: 'up-mascot' }, h('input', { type: 'radio', name: 'up-mascot', checked: c.model === id, onChange: () => { c.model = id; touch(); } }), h('span', { class: 'up-mascot__img', style: { backgroundImage: S.mascots?.[id] ? `url("${S.mascots[id]}")` : '' } }), h('strong', null, name), h('small', null, desc))));
    const size = h('input', { type: 'range', min: 104, max: 224, step: 4, value: c.size, onInput: e => { c.size = +e.target.value; out.textContent = `${c.size}px`; touch(); } }); const out = h('output', null, `${c.size}px`);
    return h('div', null, toggle('显示看板娘', c.enabled, v => { c.enabled = v ? 1 : 0; touch(); }), toggle('自由行走', c.roaming, v => { c.roaming = v ? 1 : 0; touch(); }, '关闭后停留在角落'), cards, h('label', { class: 'up-field up-range' }, h('span', { class: 'up-field__label' }, '角色尺寸'), size, out));
  }
  VIEWS.site = (root, _, alive) => {
    setCrumb('站点设置');
    root.append(head('站点设置', null));
    return settingsForm(root, alive, (d, touch) => {
      const s = d.site;
      root.append(
        section('基本信息', null, field('站点名称', text(s, 'title', touch)), field('副标题', text(s, 'description', touch), '用于浏览器标题与首页'), field('每页文章数', text(s, 'posts_per_page', touch, { type: 'number', min: 1, max: 50 }))),
        section('评论', null, toggle('新文章默认允许评论', s.comments, v => { s.comments = v ? 1 : 0; touch(); }), toggle('评论需人工审核', s.moderation, v => { s.moderation = v ? 1 : 0; touch(); }, '开启后所有评论先进入待审核')),
        section('关于', null, h('dl', { class: 'up-dl' }, h('dt', null, '主题'), h('dd', null, `uo-theme ${S.version || ''}`), h('dt', null, '引擎'), h('dd', null, A.engine || '—'), h('dt', null, '账号'), h('dd', null, S.user.name)),
          h('div', { class: 'up-row-end is-start' }, h('a', { class: 'up-btn up-btn--ghost', href: S.links.logout, 'data-uo-no-nav': '' }, icon('logout'), h('span', null, '退出登录')))));
    });
  };

  /* Badge warm-up and deep links (#uo-panel=posts) */
  if (caps.comments) A.comments.list({ status: 'hold', perPage: 1 }).then(r => { if (r.total) { badge.hidden = false; badge.textContent = r.total; dock.classList.add('has-badge'); } }).catch(() => {});
  const deep = location.hash.match(/^#uo-panel(?:=(\w+))?/);
  if (deep) { history.replaceState(history.state, '', location.pathname + location.search); open(deep[1] || undefined); }
  // Keep the "edit this page" shortcut in sync with progressive navigation.
  const editBtn = h('button', { type: 'button', class: 'up-dock__btn', title: '编辑本页', 'aria-label': '编辑本页', hidden: !S.current, onClick: () => { const c = S.current; if (c) openEditor(c.type === 'page' ? 'page' : 'post', c.id); } }, icon('edit'));
  dock.querySelector('[aria-label="编辑本页"]')?.remove(); dock.append(editBtn);
  document.addEventListener('uo-theme:navigated', () => {
    const p = window.UOThemeConfig?.page;
    S.current = p && p.postId && (p.type === 'post' || p.type === 'page') ? { id: p.postId, type: p.type } : null;
    editBtn.hidden = !S.current;
  });
  window.UOPanel = { open, close, go, openEditor, toast };
})();
