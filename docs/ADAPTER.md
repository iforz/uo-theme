# Panel adapter contract (`window.UOAdapter`)

The floating management panel (`assets/core/js/panel.js` + `panel.css`) never talks to an engine
directly. Load an adapter **before** `panel.js`, and only for signed-in users. The WordPress
implementation is `assets/adapters/wordpress.js`; `ports/static/mock-adapter.js` is an in-browser
(localStorage) implementation useful for demos and as a template for other engines.

Every method returns a Promise unless noted. Throw `Error(message)` on failure – the panel shows
the message as a toast.

```ts
interface UOAdapter {
  engine: string;                           // shown in the panel footer, e.g. "WordPress 7.1"
  session(): {                              // sync
    user: { id, name, avatar }, site: string, home: string, version?: string,
    caps: { posts, publish, pages, comments, media, terms, settings }, // booleans → which tabs show
    links: { logout: string, native?: string }, // native = engine's own admin (optional escape hatch)
    current?: { id, type: 'post' | 'page' } | null, // enables "edit this page" on the dock
    mascots?: Record<string, string>         // preview images for the companion picker
  };
  overview(): { posts: { publish, draft, future, pending }, pages, comments?: { pending, approved, spam },
                media?: number, drafts: [{ id, title, modified }], recent: [{ id, title, date, link, comments }] };

  posts: {
    list(type: 'post'|'page', { page, perPage, search, status /* any|publish|draft|future|private|trash */, category })
      : { items: PostItem[], total, pages };
    get(type, id): Post;
    save(type, Partial<Post>): Post;        // create when id is empty
    remove(type, id, force?: boolean);      // force=false → trash
    restore(type, id): Post;                // trash → draft
    previewUrl(post): string;               // sync
    titles(ids: number[]): Record<id, { title, link }>;
  };
  comments: {
    list({ status /* hold|approved|spam|trash */, page, perPage, search }): { items: Comment[], total, pages };
    setStatus(id, status); reply(postId, parentId, text); remove(id);
  };
  media: {
    list({ page, perPage, search, type }): { items: Media[], total, pages };
    upload(file: File, onProgress?: (0..1) => void): Media;
    get(id): Media; update(id, { title, alt }): Media; remove(id);
  };
  terms: {                                    // tax: 'category' | 'tag'
    list(tax, { search?, perPage? }): Term[]; save(tax, { id?, name, slug?, parent? }): Term; remove(tax, id);
  };
  settings: { get(): Settings; save(Settings): Settings };
}

type PostItem = { id, type, title, status, date, modified, link, categories: number[], featured: number, sticky: boolean };
type Post = PostItem & { content: string /* HTML */, excerpt, slug, tags: number[], comments: 'open'|'closed', format: 'html'|'blocks' };
type Comment = { id, post, parent, author, email, url, avatar, content /* plain text */, date, status, link };
type Media = { id, url, thumb, title, alt, mime, date, width, height, size };
type Term = { id, name, slug, count, parent };
type Settings = {
  appearance: { accent, scheme, layout, hero, hero_eyebrow, hero_title, hero_lead, feature, stats, toc, related, pjax, login_link,
                nav: [{ label, url }], profile: { name, avatar, bio, social: [{ type, url }] } },
  companion: { enabled, roaming, model, size }, footer: { copyright, icp },
  site: { title, description, posts_per_page, comments, moderation }
};
```

## Security expectations for adapters

* Authenticate with the engine's own session (cookies + CSRF token / nonce). Never embed long-lived API keys in HTML.
* Print the adapter configuration only for signed-in users with editing rights, on responses that shared caches do not store.
* Enforce permissions server-side; `caps` only hides UI.
* The editor sends **HTML** (`content`). Engines storing Markdown should convert on load/save (e.g. Turndown/marked) inside the adapter.
