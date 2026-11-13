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
  const schemeButton = $('[data-uo-scheme]');
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
  const progress = $('[data-uo-progress]');
  const backTop = $('[data-uo-top]');
  let scrollQueued = false;
  function updateScroll() {
    const limit = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${limit > 0 ? Math.min(1, window.scrollY / limit) : 0})`;
    if (backTop) backTop.hidden = window.scrollY < 600;
    document.body.classList.toggle('uo-scrolled', window.scrollY > 24);
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
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
  const compact = matchMedia('(max-width: 1279px)');
  const update = () => { details.open = !compact.matches; };
  update(); compact.addEventListener('change', update);
})();
