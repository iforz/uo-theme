/* Community llm-pet 8x9 atlas adapter. Original theme runtime, no external service. */
(() => {
  'use strict';
  const options = window.UOThemeConfig?.options || {};
  const pet = document.querySelector('[data-uo-roamer]');
  const button = pet?.querySelector('[data-uo-pet]');
  const sprite = pet?.querySelector('[data-uo-portrait]');
  const api = window.UOTheme?.companion;
  if (!pet || !api || options.enabled === 0) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pause = pet.querySelector('[data-uo-pause]');
  const size = Math.max(104, Math.min(224, Number(options.size) || 156));
  const width = Math.min(size, innerWidth * .4), height = width * 208 / 192;
  pet.style.setProperty('--uo-pet-width', `${width}px`);
  let x = innerWidth - width - 32, y = innerHeight - height - 24;
  let targetX = x, targetY = y, state = 0, frame = 0, elapsed = 0, last = 0, wait = 4;
  let dragging = null, paused = false, hidden = false, dialog = false, request = 0, loaded = false, loadToken = 0;
  // Occupied cells verified against the pinned upstream sheets; remaining cells are transparent.
  const frames = [6, 8, 8, 4, 5, 8, 6, 6, 6];
  const durations = [280, 110, 110, 140, 140, 320];
  const bounds = () => ({ maxX: Math.max(0, innerWidth - width), maxY: Math.max(0, innerHeight - height - 34), minY: document.body.classList.contains('admin-bar') ? 46 : 8 });
  function clamp() {
    const b = bounds();
    x = Math.max(0, Math.min(b.maxX, x)); y = Math.max(b.minY, Math.min(b.maxY, y));
    targetX = Math.max(0, Math.min(b.maxX, targetX)); targetY = Math.max(b.minY, Math.min(b.maxY, targetY));
  }
  function paint() {
    pet.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    sprite.style.backgroundPosition = `${frame * 100 / 7}% ${state * 100 / 8}%`;
    pet.dataset.action = ['idle', 'walk-right', 'walk-left', 'wave', 'jump', 'failed', 'waiting', 'work', 'review'][state];
  }
  function changeState(next) { if (state !== next) { state = next; frame = 0; elapsed = 0; } }
  function active() { return loaded && !document.hidden && !hidden && !dialog && !dragging && !paused && !motion.matches; }
  function tick(time) {
    request = 0;
    const dt = Math.min(.05, Math.max(0, (time - (last || time)) / 1000)); last = time;
    if (active()) {
      if (options.roaming) {
        const distance = Math.hypot(targetX - x, targetY - y);
        if (distance > 2) {
          const step = Math.min(distance, dt * 38);
          changeState(targetX >= x ? 1 : 2);
          x += (targetX - x) / distance * step; y += (targetY - y) / distance * step;
        } else {
          changeState(0); wait -= dt;
          if (wait <= 0) {
            const b = bounds(); targetX = Math.random() * b.maxX;
            // Mostly wander near the bottom; occasional hops to a higher page region.
            targetY = Math.random() < .25 ? b.minY + Math.random() * Math.max(0, b.maxY - b.minY) : b.maxY;
            wait = 4 + Math.random() * 8;
          }
        }
      } else changeState(0);
      elapsed += dt * 1000;
      if (elapsed >= durations[frame % durations.length]) { elapsed = 0; frame = (frame + 1) % frames[state]; }
      clamp(); paint(); request = requestAnimationFrame(tick);
    }
  }
  function schedule() {
    if (request) cancelAnimationFrame(request);
    request = 0; last = 0;
    if (active()) request = requestAnimationFrame(tick);
    else { changeState(dialog ? 6 : 0); frame = 0; paint(); }
  }
  function visibility() { pet.hidden = hidden; schedule(); }
  button.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || dragging) return;
    dragging = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: x, startY: y };
    button.dataset.dragged = 'false'; button.setPointerCapture(event.pointerId);
    pet.classList.add('uo-dragging'); schedule();
  });
  button.addEventListener('pointermove', (event) => {
    if (!dragging || event.pointerId !== dragging.id) return;
    const dx = event.clientX - dragging.x, dy = event.clientY - dragging.y;
    if (Math.hypot(dx, dy) > 5) button.dataset.dragged = 'true';
    if (button.dataset.dragged !== 'true') return;
    x = dragging.startX + dx; y = dragging.startY + dy; targetX = x; targetY = y;
    clamp(); paint();
  });
  function release(event) {
    if (!dragging || event.pointerId !== dragging.id) return;
    dragging = null; wait = 5;
    pet.classList.remove('uo-dragging'); schedule();
    // The following click must still see the drag flag; reset on next pointerdown.
  }
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
  button.addEventListener('keydown', (event) => {
    const deltas = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] };
    if (deltas[event.key]) { event.preventDefault(); x += deltas[event.key][0]; y += deltas[event.key][1]; targetX = x; targetY = y; clamp(); paint(); }
    if (event.key === 'Enter' || event.key === ' ') button.dataset.dragged = 'false';
  });
  pause.addEventListener('click', () => {
    paused = !paused; pause.setAttribute('aria-pressed', String(paused));
    pause.textContent = paused ? '▶' : 'Ⅱ'; pause.setAttribute('aria-label', paused ? '继续角色活动' : '暂停角色活动'); schedule();
  });
  pet.querySelector('[data-uo-hide]').addEventListener('click', () => { api.close(); });
  document.addEventListener('uo-theme:companion:visibility', (event) => {
    dialog = event.detail.open; hidden = event.detail.dismissed; visibility();
  });
  document.addEventListener('uo-theme:companion:model', () => { changeState(0); frame = 0; paint(); });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', schedule);
  window.addEventListener('resize', () => { clamp(); paint(); });
  window.addEventListener('pagehide', () => { if (request) cancelAnimationFrame(request); request = 0; });
  window.addEventListener('pageshow', schedule);
  // Decode the selected sheet before showing; failed downloads leave a usable text launcher.
  function loadSheet() {
    const token = ++loadToken;
    loaded = false; pet.hidden = true; schedule();
    const image = new Image();
    const ready = () => { if (token === loadToken) { loaded = true; visibility(); } };
    image.onload = ready;
    image.onerror = () => { if (token === loadToken) { hidden = true; api.close(); } };
    image.src = window.UOThemeConfig.characters?.[api.getModel()]?.image || '';
    if (image.complete && image.naturalWidth) ready();
  }
  document.addEventListener('uo-theme:companion:model', loadSheet);
  clamp(); paint(); loadSheet(); schedule();
})();
