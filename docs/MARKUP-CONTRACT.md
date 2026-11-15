# Markup contract

uo-theme is split into an **engine-agnostic core** (`assets/core/`) and thin **engine adapters**
(`assets/adapters/`, plus the template files of each engine). Any blog engine that renders the
markup below, includes `uo.css` + `uo.js`, and (optionally) provides a `window.UOAdapter`
gets the full design, interactions and the floating management panel.

The WordPress templates in the repository root (`header.php`, `index.php`, `single.php`, …) are
the reference implementation; `ports/static/` is a framework-free HTML version of the same markup.

## Page skeleton

```html
<html data-uo-scheme="light">            <!-- set before paint: "light" | "dark" -->
<body class="uo [uo-layout-list]">
  <div class="uo-progress" data-uo-progress></div>
  <header class="uo-header"><div class="uo-wrap uo-header__inner">
    <a class="uo-brand" href="/"><span class="uo-brand__mark">i</span><span class="uo-brand__name">Site</span></a>
    <nav class="uo-nav"><ul><li><a href="/" aria-current="page">首页</a></li>…</ul></nav>
    <div class="uo-header__tools">
      <a class="uo-tool uo-tool--search" href="/search" data-uo-search-open>…</a>
      <button class="uo-tool" data-uo-scheme-toggle>…</button>
      <button class="uo-tool uo-menu-toggle" data-uo-menu-toggle>…</button>
    </div>
  </div></header>
  <main id="uo-main" class="uo-main"> … page content … </main>   <!-- swapped by progressive navigation -->
  <footer class="uo-footer"> … </footer>
  <div class="uo-fab-stack"><button class="uo-fab uo-toc-fab" data-uo-toc-toggle hidden></button><button class="uo-fab" data-uo-top hidden></button></div>
  <dialog class="uo-dialog" id="uo-search"> <div class="uo-search"> <form class="uo-search__bar">…<input name="q"></form> <div data-uo-search-results></div> </div> </dialog>
</body>
```

## Content blocks

| Block | Classes | Notes |
| --- | --- | --- |
| Hero | `.uo-hero`, `.uo-eyebrow`, `.uo-hero__title`, `.uo-hero__lead`, `.uo-hero__stats` | Home page intro |
| Category chips | `ul.uo-chips > li > a.uo-chip[.is-active]` | Optional `<small>` count |
| Feature card | `article.uo-feature.uo-card` with `.uo-card__media`, `.uo-card__body`, `.uo-badge` | Lead story |
| Card grid | `.uo-grid > article.uo-card.uo-reveal` | `.uo-card__media > img`, `.uo-card__kicker`, `.uo-card__title > a`, `.uo-card__excerpt`, `.uo-card__meta` |
| Row list | `ul.uo-list > li.uo-row` | `time`, `h3 > a`, `p`, `.uo-row__thumb` ; year headings `h2.uo-year` |
| Page head | `header.uo-page-head` | Archive/search title |
| Pagination | `nav.uo-pagination > .page-numbers[.current]` | |
| Article | `article.uo-article` → `.uo-article__head`, `.uo-article__title`, `.uo-article__meta`, `.uo-article__cover`, `.uo-article__layout` | |
| Body | `div.uo-prose[data-uo-content]` | Rendered HTML of the post. Headings get anchors, `pre` gets copy buttons, images zoom |
| TOC | `nav.uo-toc[data-uo-toc] > ol` | Filled automatically from `h2/h3` in `[data-uo-content]` |
| Article tools | `section.uo-actions[data-uo-actions data-url data-title]` with `[data-uo-copy-text]`, `[data-uo-copy-link]`, `[data-uo-share]`, `[data-uo-action-status]` | |
| Tags / prev-next / related | `.uo-tags`, `.uo-postnav`, `.uo-related` | |
| Comments | `.uo-comments`, `.uo-comment-list`, `.uo-comment` | Form classes follow WordPress (`.comment-form`); other engines may reuse them |

Decorative fallback covers use `<img data-uo-cover>`; `uo.js` rotates them from `UOThemeConfig.covers`.

## Configuration object (optional)

```js
window.UOThemeConfig = {
  covers: ['/img/a.webp', …],                 // rotating fallback covers
  search: { api: '/api/search?q=%s', page: '/search', param: 'q' }, // api returns [{title,url,type}] or {items:[…]}
  pjax: true,                                 // progressive navigation (needs #uo-main)
  noNavigate: '/(admin|api)(/|$)',            // RegExp source of paths that must load normally
  options: { enabled: 1 }, scripts: { companion, roaming } // optional mascot
};
```

## Theming

Only CSS custom properties are public: `--uo-accent`, `--uo-bg`, `--uo-surface`, `--uo-ink`,
`--uo-muted`, `--uo-line`, fonts and radii (see the top of `uo.css`). Dark mode is
`html[data-uo-scheme="dark"]`. To set the accent server-side, print
`<style>:root{--uo-accent:#hex}</style>` before the stylesheet.
