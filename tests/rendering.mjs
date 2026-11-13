/** No browser/network: first-paint preference and post-load scheduling contracts. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const php = readFileSync(new URL('functions.php', root), 'utf8');
const prepaint = php.match(/\$script = <<<'JS'\n([\s\S]*?)\nJS;/)[1];
const ui = readFileSync(new URL('assets/js/theme.js', root), 'utf8').split('// Native WP operations')[0];
for (const file of ['assets/js/theme.js', 'assets/js/companion.js', 'assets/js/roaming.js']) new vm.Script(readFileSync(new URL(file, root), 'utf8'), { filename: file });
function context({ saved = null, dark = false, blocked = false, enabled = 1 } = {}) {
  const events = {}, idle = [], scripts = [], buttonEvents = {};
  const element = { dataset: {}, style: {}, scrollHeight: 1000, classList: { add() {}, toggle() {} } };
  const button = { setAttribute() {}, addEventListener(k, fn) { buttonEvents[k] = fn; } };
  const document = {
    documentElement: element, readyState: 'loading', currentScript: { nonce: 'test-nonce' },
    querySelector: s => s === 'button[data-uo-scheme]' ? button : (s === '[data-uo-scheme]' ? element : null), querySelectorAll: () => [],
    addEventListener() {}, createElement: () => ({}), head: { appendChild: s => scripts.push(s) }
  };
  const scope = { document, URL, location: { href: 'https://blog.iforz.cn/', origin: 'https://blog.iforz.cn' },
    localStorage: { getItem() { if (blocked) throw Error('Storage denied'); return saved; }, setItem() {} },
    matchMedia: q => ({ matches: q.includes('color-scheme') && dark, addEventListener() {} }),
    innerHeight: 1000, scrollY: 0, setTimeout: fn => idle.push(fn),
    requestIdleCallback: fn => idle.push(fn), addEventListener: (k, fn) => { events[k] = fn; },
    UOThemeConfig: { options: { enabled }, scripts: { companion: 'https://blog.iforz.cn/companion.js', roaming: 'https://blog.iforz.cn/roaming.js' } }
  };
  scope.window = scope;
  vm.createContext(scope);
  return { scope, document, element, scripts, events, idle, buttonEvents };
}
export function runRenderingChecks() {
  const result = {};
  for (const [name, options, expected] of [
    ['saved_dark', { saved: 'dark' }, 'dark'], ['saved_light_overrides_system', { saved: 'light', dark: true }, 'light'],
    ['system_dark', { dark: true }, 'dark'], ['blocked_storage', { dark: true, blocked: true }, 'dark'],
    ['invalid_preference', { saved: 'invalid' }, 'light']
  ]) {
    const c = context(options);
    assert.equal(c.document.body, undefined); // Head bootstrap must never need the body.
    vm.runInContext(prepaint, c.scope);
    assert.equal(c.element.dataset.uoScheme, expected);
    assert.equal(c.element.style.colorScheme, expected);
    assert.equal(c.element.style.backgroundColor, expected === 'dark' ? '#151f29' : '#f4f7f8');
    result[name] = true;
  }
  const c = context({ saved: 'dark' }); vm.runInContext(prepaint, c.scope);
  c.document.body = { dataset: {}, classList: { add() {}, toggle() {} } };
  vm.runInContext(ui, c.scope);
  assert.equal(c.document.body.dataset.uoScheme, 'dark');
  assert.equal(c.scripts.length, 0); assert.equal(c.idle.length, 0);
  c.events.load(); assert.equal(c.scripts.length, 0); c.idle.shift()();
  assert.equal(c.scripts.length, 1); assert.ok(c.scripts[0].src.endsWith('/companion.js'));
  assert.equal(c.scripts[0].async, true); assert.equal(c.scripts[0].nonce, 'test-nonce');
  c.scripts[0].onload(); assert.equal(c.scripts.length, 2); assert.ok(c.scripts[1].src.endsWith('/roaming.js'));
  result.companion_after_load_and_idle = true; result.roaming_after_companion = true;
  c.buttonEvents.click(); assert.equal(c.element.dataset.uoScheme, 'light'); assert.equal(c.document.body.dataset.uoScheme, 'light');
  c.buttonEvents.click(); assert.equal(c.element.dataset.uoScheme, 'dark'); result.root_body_toggle_consistent = true; assert.equal(c.element.onclick, undefined); result.only_button_selectable = true;
  const off = context({ enabled: 0 }); off.document.body = { dataset: {}, classList: { add() {}, toggle() {} } }; vm.runInContext(ui, off.scope);
  assert.equal(off.events.load, undefined); assert.equal(off.scripts.length, 0); result.disabled_no_download = true;
  const foreign = context(); foreign.document.body = { dataset: {}, classList: { add() {}, toggle() {} } };
  foreign.scope.UOThemeConfig.scripts.companion = 'https://other.example/evil.js'; vm.runInContext(ui, foreign.scope); foreign.events.load(); foreign.idle.shift()();
  assert.equal(foreign.scripts.length, 0); result.only_same_origin_scripts = true;
  return result;
}
export const results = runRenderingChecks();
