/* uo-theme · WordPress adapter for the engine-agnostic panel (assets/core/js/panel.js).
 * Implements the UOAdapter contract documented in docs/ADAPTER.md using core REST + cookie nonce. */
(() => {
  'use strict';
  const C = window.UOPanelConfig;
  if (!C) return;
  let nonce = C.nonce;
  const base = C.rest.replace(/\/$/, '') + '/';
  // Works with pretty (/wp-json/) and plain (?rest_route=/) permalinks.
  const endpoint = path => { const p = path.replace(/^\//, ''); return base.includes('?') ? base + p.replace('?', '&') : base + p; };
  const text = html => { const d = new DOMParser().parseFromString(String(html || ''), 'text/html'); return d.body.textContent || ''; };
  const qs = params => { const u = new URLSearchParams(); Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') u.set(k, Array.isArray(v) ? v.join(',') : v); }); const s = u.toString(); return s ? `?${s}` : ''; };

  async function refreshNonce() {
    // Signed-in pages are never cached; re-read the panel config from the current page.
    const res = await fetch(location.href, { credentials: 'same-origin', headers: { Accept: 'text/html' } });
    const m = (await res.text()).match(/"nonce":"([a-f0-9]+)"/);
    if (m) { nonce = m[1]; return true; }
    return false;
  }
  async function api(path, { method = 'GET', body, headers = {}, raw = false, retry = true } = {}) {
    const init = { method, credentials: 'same-origin', headers: { 'X-WP-Nonce': nonce, Accept: 'application/json', ...headers } };
    if (body !== undefined) { if (body instanceof Blob || body instanceof FormData) init.body = body; else { init.body = JSON.stringify(body); init.headers['Content-Type'] = 'application/json'; } }
    const res = await fetch(endpoint(path), init);
    const fresh = res.headers.get('X-WP-Nonce'); if (fresh) nonce = fresh;
    if (res.status === 403 && retry) {
      const data = await res.clone().json().catch(() => ({}));
      if (data.code === 'rest_cookie_invalid_nonce' && await refreshNonce()) return api(path, { method, body, headers, raw, retry: false });
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const err = new Error(data.message ? text(data.message) : `请求失败（${res.status}）`); err.status = res.status; err.code = data.code; throw err;
    }
    if (raw) return res;
    const data = res.status === 204 ? null : await res.json();
    return { data, total: +res.headers.get('X-WP-Total') || 0, pages: +res.headers.get('X-WP-TotalPages') || 1 };
  }

  const route = type => (type === 'page' ? 'wp/v2/pages' : 'wp/v2/posts');
  const toItem = p => ({
    id: p.id, type: p.type, title: p.title?.raw ?? text(p.title?.rendered), status: p.status, date: p.date, modified: p.modified,
    link: p.link, categories: p.categories || [], featured: p.featured_media || 0, sticky: !!p.sticky
  });
  const toPost = p => ({
    ...toItem(p), content: p.content?.raw ?? '', excerpt: p.excerpt?.raw ?? '', slug: decode(p.slug || ''), tags: p.tags || [],
    comments: p.comment_status || 'open', format: /<!--\s*wp:/.test(p.content?.raw || '') ? 'blocks' : 'html'
  });
  const fromPost = d => {
    const out = {};
    ['title', 'content', 'excerpt', 'status', 'slug'].forEach(k => { if (d[k] !== undefined) out[k] = d[k]; });
    if (d.date !== undefined) out.date = d.date || null;
    if (d.categories) out.categories = d.categories;
    if (d.tags) out.tags = d.tags;
    if (d.featured !== undefined) out.featured_media = d.featured || 0;
    if (d.comments) out.comment_status = d.comments;
    if (d.sticky !== undefined) out.sticky = !!d.sticky;
    return out;
  };
  const statusMap = { approved: 'approved', hold: 'hold', unapproved: 'hold', spam: 'spam', trash: 'trash' };
  const commentQuery = { approved: 'approve', hold: 'hold', spam: 'spam', trash: 'trash' };
  const toComment = c => ({
    id: c.id, post: c.post, parent: c.parent, author: c.author_name || '匿名', email: c.author_email || '', url: c.author_url || '',
    avatar: c.author_avatar_urls?.['48'] || '', content: text(c.content?.rendered || c.content?.raw), date: c.date, status: statusMap[c.status] || c.status, link: c.link
  });
  const toMedia = m => ({
    id: m.id, url: m.source_url, title: m.title?.raw ?? text(m.title?.rendered), alt: m.alt_text || '', mime: m.mime_type, date: m.date,
    thumb: m.media_details?.sizes?.medium?.source_url || m.media_details?.sizes?.thumbnail?.source_url || m.source_url,
    width: m.media_details?.width || 0, height: m.media_details?.height || 0, size: m.media_details?.filesize || 0
  });
  const decode = s => { try { return decodeURIComponent(s); } catch (_) { return s; } };
  const toTerm = t => ({ id: t.id, name: t.name, slug: decode(t.slug), count: t.count, parent: t.parent || 0, link: t.link });
  const taxRoute = tax => (tax === 'tag' ? 'wp/v2/tags' : 'wp/v2/categories');

  window.UOAdapter = {
    engine: C.engine,
    session: () => ({ user: C.user, caps: C.caps, links: C.links, home: C.home, site: C.site, current: C.current, version: C.version, mascots: C.mascots }),
    overview: async () => (await api('uo-theme/v1/overview')).data,

    posts: {
      async list(type, { page = 1, perPage = 20, search = '', status = 'any', category = '' } = {}) {
        const r = await api(route(type) + qs({ context: 'edit', page, per_page: perPage, search, status, categories: category, orderby: search ? 'relevance' : 'date', _fields: 'id,type,title,status,date,modified,link,categories,featured_media,sticky' }));
        return { items: r.data.map(toItem), total: r.total, pages: r.pages };
      },
      async get(type, id) { return toPost((await api(`${route(type)}/${id}?context=edit`)).data); },
      async save(type, data) {
        const path = data.id ? `${route(type)}/${data.id}` : route(type);
        return toPost((await api(path + '?context=edit', { method: 'POST', body: fromPost(data) })).data);
      },
      async remove(type, id, force = false) { await api(`${route(type)}/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' }); },
      async restore(type, id) { return toPost((await api(`${route(type)}/${id}?context=edit`, { method: 'POST', body: { status: 'draft' } })).data); },
      previewUrl(post) { return post.status === 'publish' ? post.link : `${C.home.replace(/\/$/, '')}/?${post.type === 'page' ? 'page_id' : 'p'}=${post.id}&preview=true`; },
      async titles(ids) {
        if (!ids.length) return {};
        const r = await api('wp/v2/posts' + qs({ include: ids, per_page: 100, status: 'any', context: 'edit', _fields: 'id,title,link' })).catch(() => ({ data: [] }));
        const p = await api('wp/v2/pages' + qs({ include: ids, per_page: 100, status: 'any', context: 'edit', _fields: 'id,title,link' })).catch(() => ({ data: [] }));
        return Object.fromEntries([...r.data, ...p.data].map(x => [x.id, { title: x.title?.raw ?? text(x.title?.rendered), link: x.link }]));
      }
    },

    comments: {
      async list({ status = 'hold', page = 1, perPage = 20, search = '' } = {}) {
        const r = await api('wp/v2/comments' + qs({ context: 'edit', status: commentQuery[status] || status, page, per_page: perPage, search }));
        return { items: r.data.map(toComment), total: r.total, pages: r.pages };
      },
      async setStatus(id, status) { return toComment((await api(`wp/v2/comments/${id}?context=edit`, { method: 'POST', body: { status: commentQuery[status] || status } })).data); },
      async reply(post, parent, content) { return toComment((await api('wp/v2/comments?context=edit', { method: 'POST', body: { post, parent, content } })).data); },
      async remove(id) { await api(`wp/v2/comments/${id}?force=true`, { method: 'DELETE' }); }
    },

    media: {
      async list({ page = 1, perPage = 30, search = '', type = '' } = {}) {
        const r = await api('wp/v2/media' + qs({ context: 'edit', page, per_page: perPage, search, media_type: type }));
        return { items: r.data.map(toMedia), total: r.total, pages: r.pages };
      },
      upload(file, onProgress) {
        return new Promise((resolve, reject) => {
          const x = new XMLHttpRequest();
          x.open('POST', endpoint('wp/v2/media?context=edit'));
          x.withCredentials = true;
          x.setRequestHeader('X-WP-Nonce', nonce);
          x.setRequestHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name).replace(/%20/g, ' ')}"`);
          x.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
          x.upload.onprogress = e => e.lengthComputable && onProgress?.(e.loaded / e.total);
          x.onload = () => {
            let data = {}; try { data = JSON.parse(x.responseText); } catch (_) {}
            if (x.status >= 200 && x.status < 300) resolve(toMedia(data)); else reject(new Error(data.message ? text(data.message) : `上传失败（${x.status}）`));
          };
          x.onerror = () => reject(new Error('网络错误，上传失败'));
          x.send(file);
        });
      },
      async update(id, data) { return toMedia((await api(`wp/v2/media/${id}?context=edit`, { method: 'POST', body: { title: data.title, alt_text: data.alt } })).data); },
      async remove(id) { await api(`wp/v2/media/${id}?force=true`, { method: 'DELETE' }); },
      async get(id) { return toMedia((await api(`wp/v2/media/${id}?context=edit`)).data); }
    },

    terms: {
      async list(tax, { search = '', perPage = 100 } = {}) {
        const r = await api(taxRoute(tax) + qs({ context: 'edit', per_page: perPage, search, orderby: search ? 'name' : 'count', order: search ? 'asc' : 'desc', hide_empty: false }));
        return r.data.map(toTerm);
      },
      async save(tax, data) {
        const body = { name: data.name }; if (data.slug !== undefined) body.slug = data.slug; if (data.parent !== undefined) body.parent = data.parent;
        return toTerm((await api(data.id ? `${taxRoute(tax)}/${data.id}` : taxRoute(tax), { method: 'POST', body })).data);
      },
      async remove(tax, id) { await api(`${taxRoute(tax)}/${id}?force=true`, { method: 'DELETE' }); }
    },

    settings: {
      async get() { return (await api('uo-theme/v1/settings')).data; },
      async save(data) { return (await api('uo-theme/v1/settings', { method: 'POST', body: data })).data; }
    }
  };
})();
