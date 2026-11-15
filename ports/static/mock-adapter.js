/* uo-theme · mock adapter (localStorage). Demonstrates the UOAdapter contract for engines
 * without a server API and powers ports/static. Replace each method with real calls to port. */
(() => {
  'use strict';
  const KEY = 'uo-mock-db';
  const now = () => new Date().toISOString();
  const seed = () => ({
    seq: 100,
    posts: [
      { id: 1, type: 'post', title: '把博客主题做成跨引擎的', content: '<h2>为什么</h2><p>同一套设计，在 WordPress、Typecho、Hexo 上都能用。</p><h2>怎么做</h2><p>核心只依赖一份标记约定和一个适配器接口。</p>', excerpt: '', status: 'publish', date: '2026-11-12T10:00:00', modified: '2026-11-12T10:00:00', slug: 'cross-engine', categories: [1], tags: [1], featured: 0, comments: 'open', sticky: false },
      { id: 2, type: 'post', title: '一篇草稿', content: '<p>还没写完。</p>', excerpt: '', status: 'draft', date: '2026-11-14T09:00:00', modified: '2026-11-14T09:00:00', slug: 'draft', categories: [2], tags: [], featured: 0, comments: 'open', sticky: false },
      { id: 3, type: 'page', title: '关于', content: '<p>这是关于页面。</p>', excerpt: '', status: 'publish', date: '2026-10-01T09:00:00', modified: '2026-10-01T09:00:00', slug: 'about', categories: [], tags: [], featured: 0, comments: 'closed', sticky: false }
    ],
    terms: { category: [{ id: 1, name: '编程', slug: 'code', count: 1, parent: 0 }, { id: 2, name: '随笔', slug: 'notes', count: 1, parent: 0 }], tag: [{ id: 1, name: '设计', slug: 'design', count: 1, parent: 0 }] },
    comments: [{ id: 1, post: 1, parent: 0, author: '读者', email: 'reader@example.test', url: '', avatar: '', content: '思路很清晰！', date: now(), status: 'hold', link: '#' }],
    media: [],
    settings: {
      appearance: { accent: '#4f5bd5', scheme: 'system', layout: 'grid', hero: 1, hero_eyebrow: '', hero_title: '', hero_lead: '', feature: 1, stats: 1, toc: 1, related: 1, pjax: 1, login_link: 1, nav: [], profile: { name: '', avatar: '', bio: '', social: [] } },
      companion: { enabled: 0, roaming: 0, model: 'deepseek', size: 156 }, footer: { copyright: '© 2026 Demo', icp: '' },
      site: { title: 'uo-theme Demo', description: '跨引擎的博客主题', posts_per_page: 10, comments: 1, moderation: 1 }
    }
  });
  let db; try { db = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch (_) { db = seed(); }
  const commit = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (_) {} };
  const wait = v => new Promise(r => setTimeout(() => r(structuredClone(v)), 120));
  const page = (arr, p = 1, n = 20) => ({ items: arr.slice((p - 1) * n, p * n), total: arr.length, pages: Math.max(1, Math.ceil(arr.length / n)) });
  const item = p => ({ id: p.id, type: p.type, title: p.title, status: p.status, date: p.date, modified: p.modified, link: `#post-${p.id}`, categories: p.categories, featured: p.featured, sticky: p.sticky });

  window.UOAdapter = {
    engine: 'Static demo (localStorage)',
    session: () => ({ user: { id: 1, name: 'Demo', avatar: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22%3E%3Crect width=%2240%22 height=%2240%22 fill=%22%234f5bd5%22/%3E%3Ctext x=%2220%22 y=%2226%22 font-size=%2218%22 text-anchor=%22middle%22 fill=%22white%22%3ED%3C/text%3E%3C/svg%3E' }, site: db.settings.site.title, home: location.href, version: 'demo', caps: { posts: true, publish: true, pages: true, comments: true, media: true, terms: true, settings: true }, links: { logout: '#' }, current: null }),
    overview: () => wait({ posts: { publish: db.posts.filter(p => p.type === 'post' && p.status === 'publish').length, draft: db.posts.filter(p => p.status === 'draft').length, future: 0, pending: 0 }, pages: db.posts.filter(p => p.type === 'page').length, comments: { pending: db.comments.filter(c => c.status === 'hold').length, approved: db.comments.filter(c => c.status === 'approved').length, spam: 0 }, media: db.media.length, drafts: db.posts.filter(p => p.status === 'draft').map(p => ({ id: p.id, title: p.title, modified: p.modified })), recent: db.posts.filter(p => p.type === 'post' && p.status === 'publish').map(p => ({ id: p.id, title: p.title, date: p.date, link: '#', comments: 0 })) }),
    posts: {
      list: (type, { page: p = 1, perPage = 20, search = '', status = 'any', category = '' } = {}) => wait(page(db.posts.filter(x => x.type === type && (status === 'any' ? x.status !== 'trash' : x.status === status) && (!search || x.title.includes(search)) && (!category || x.categories.includes(+category))).sort((a, b) => b.date.localeCompare(a.date)).map(item), p, perPage)),
      get: (type, id) => wait({ ...db.posts.find(x => x.id === +id), format: 'html' }),
      save: (type, data) => { let p = db.posts.find(x => x.id === data.id); if (!p) { p = { id: ++db.seq, type, title: '', content: '', excerpt: '', status: 'draft', date: now().slice(0, 19), slug: '', categories: [], tags: [], featured: 0, comments: 'open', sticky: false }; db.posts.push(p); } Object.assign(p, Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)), { modified: now() }); commit(); return wait({ ...p, link: `#post-${p.id}`, format: 'html' }); },
      remove: (type, id, force) => { if (force) db.posts = db.posts.filter(x => x.id !== id); else db.posts.find(x => x.id === id).status = 'trash'; commit(); return wait(null); },
      restore: (type, id) => { const p = db.posts.find(x => x.id === id); p.status = 'draft'; commit(); return wait(p); },
      previewUrl: p => `#post-${p.id}`,
      titles: ids => wait(Object.fromEntries(db.posts.filter(p => ids.includes(p.id)).map(p => [p.id, { title: p.title, link: '#' }])))
    },
    comments: {
      list: ({ status = 'hold', page: p = 1, perPage = 20 } = {}) => wait(page(db.comments.filter(c => c.status === status), p, perPage)),
      setStatus: (id, status) => { db.comments.find(c => c.id === id).status = status; commit(); return wait(null); },
      reply: (post, parent, content) => { db.comments.push({ id: ++db.seq, post, parent, author: 'Demo', email: '', url: '', avatar: '', content, date: now(), status: 'approved', link: '#' }); commit(); return wait(null); },
      remove: id => { db.comments = db.comments.filter(c => c.id !== id); commit(); return wait(null); }
    },
    media: {
      list: ({ page: p = 1, perPage = 30 } = {}) => wait(page(db.media, p, perPage)),
      upload: file => new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => { const m = { id: ++db.seq, url: r.result, thumb: r.result, title: file.name, alt: '', mime: file.type, date: now(), width: 0, height: 0, size: file.size }; db.media.unshift(m); commit(); resolve(m); }; r.onerror = () => reject(Error('读取失败')); r.readAsDataURL(file); }),
      get: id => wait(db.media.find(m => m.id === id)),
      update: (id, data) => { Object.assign(db.media.find(m => m.id === id), data); commit(); return wait(db.media.find(m => m.id === id)); },
      remove: id => { db.media = db.media.filter(m => m.id !== id); commit(); return wait(null); }
    },
    terms: {
      list: (tax, { search = '' } = {}) => wait(db.terms[tax].filter(t => !search || t.name.includes(search))),
      save: (tax, data) => { let t = db.terms[tax].find(x => x.id === data.id); if (!t) { t = { id: ++db.seq, name: '', slug: '', count: 0, parent: 0 }; db.terms[tax].push(t); } Object.assign(t, data); t.slug = t.slug || t.name; commit(); return wait(t); },
      remove: (tax, id) => { db.terms[tax] = db.terms[tax].filter(t => t.id !== id); commit(); return wait(null); }
    },
    settings: { get: () => wait(db.settings), save: data => { db.settings = data; commit(); return wait(data); } }
  };
})();
