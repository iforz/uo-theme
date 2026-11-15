/** Core JS must parse, stay engine-agnostic and boot the panel only through UOAdapter. Run: node tests/core.mjs */
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const files = ['assets/core/js/uo.js', 'assets/core/js/panel.js', 'assets/adapters/wordpress.js', 'ports/static/mock-adapter.js', 'assets/js/companion.js', 'assets/js/roaming.js'];
for (const f of files) new vm.Script(read(f), { filename: f });
for (const f of ['assets/core/js/uo.js', 'assets/core/js/panel.js']) {
  const src = read(f);
  assert.ok(!/wp-json|wp\/v2|wp-admin|wpApiSettings/.test(src), `${f} must not reference WordPress internals`);
}
const panel = read('assets/core/js/panel.js');
assert.ok(panel.includes('const A = window.UOAdapter;') && panel.includes('if (!A ||'), 'Panel exits without an adapter');
// Panel without adapter must be inert.
const ctx = { window: {}, document: { querySelector: () => null } };
ctx.window = ctx; vm.createContext(ctx); vm.runInContext(panel, ctx);
assert.equal(ctx.UOPanel, undefined, 'No panel without adapter');
// The visual editor must neutralise inline handlers and javascript: URLs it loads.
assert.ok(panel.includes("data-up-keep-") && panel.includes('javascript|vbscript'), 'Editor import neutralises active content');
console.log(`PASS: ${files.length} scripts parse; core is engine-agnostic; panel is inert without an adapter; editor neutralises active content.`);
