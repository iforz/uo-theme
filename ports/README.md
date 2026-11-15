# Porting uo-theme to other blog engines

The repository root is the WordPress theme. Everything an engine needs to reproduce the design lives in
`assets/core/` and two contracts:

* [docs/MARKUP-CONTRACT.md](../docs/MARKUP-CONTRACT.md) – HTML structure, classes and `data-uo-*` hooks.
* [docs/ADAPTER.md](../docs/ADAPTER.md) – `window.UOAdapter`, the data interface of the floating panel.

`ports/static/` is a working, backend-free reference: open `ports/static/index.html` through any static
file server (`php -S 127.0.0.1:8080` at the repo root, then visit `/ports/static/`). The panel there
is driven by `mock-adapter.js` (localStorage).

## Recipe

1. Copy `assets/core/` (and optionally `assets/images/`, `assets/css/companion.css`, `assets/js/companion.js`, `roaming.js`, `assets/mascots/`).
2. Translate the WordPress templates (`header.php`, `index.php`, `single.php`, `page.php`, `footer.php`, `template-parts/*`) into the engine's template language, keeping classes and `data-uo-*` attributes.
3. Inline the pre-paint scheme script in `<head>` (see `ports/static/index.html`) and print `:root{--uo-accent:…}` if the accent is configurable.
4. Optional: write an adapter implementing `docs/ADAPTER.md` and load it plus `panel.css`/`panel.js` **only for signed-in editors**.

## Engine notes

| Engine | Templates | Panel adapter |
| --- | --- | --- |
| **Typecho** (PHP) | `header.php`/`index.php`/`post.php` map almost 1:1 to the WordPress files; use `$this->title()`, `$this->content()`, `$this->category(',')`. | Typecho has no full REST API: add a small action plugin (`Widget_Contents_Post_Edit`, `Widget_Comments_Edit`) guarded by `$this->user->pass('editor')` and `Typecho_Widget::widget('Widget_Security')->getToken()`. |
| **Ghost** (Handlebars) | `default.hbs` + `index.hbs`/`post.hbs`; `{{#foreach posts}}`, `{{content}}` inside `.uo-prose[data-uo-content]`. | Ghost Admin API uses JWT from staff tokens – proxy it server-side; never ship admin keys to the browser. Members/session cookies alone cannot write posts. |
| **Halo** (Thymeleaf) | `templates/index.html`, `post.html` with `th:each`. | Halo 2 console API (`/apis/api.console.halo.run/…`) works with the signed-in session cookie + CSRF header. |
| **Hexo / Hugo / Astro** (static) | EJS / Go templates / Astro components generating the same markup. Search: set `UOThemeConfig.search.api` to a JSON index or use Pagefind. | No runtime backend: either omit the panel, or point an adapter at a Git-based CMS API (e.g. GitHub contents API through a serverless function with OAuth). |
| **Typecho/Ghost/Halo comments** | Reuse `.uo-comments`, `.uo-comment` and the `.comment-form` field classes. | `comments.*` methods map to each engine's moderation endpoints. |

Keep engine-specific URLs out of `assets/core`: `scripts/check.php` fails if core files reference WordPress internals.
