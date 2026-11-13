/** DOM-emulator tests, not browser/visual tests. Pass a pinned linkedom worker module path. */
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const source = readFileSync(new URL('../assets/js/theme.js', import.meta.url), 'utf8');
const initial = `<html data-uo-scheme="dark"><head><title>Home</title><link rel="canonical" href="https://example.test/"><script src="/native.js"></script></head><body><header class="uo-header"><button data-uo-scheme></button><button data-uo-refresh></button><a href="/category/">Category</a></header><div class="uo-layout"><main class="uo-main"><a id="route" href="/category/">Next</a><a id="article" href="/article/" target="_blank">Article</a><p id="plain">Plain text</p><img data-uo-cover src="/old.webp"><img data-uo-cover src="/old.webp"><img data-uo-cover src="/old.webp"><img id="authored-cover" src="/authored.webp"><div class="uo-reading-content"><p>Article body</p></div><section data-uo-article-actions data-title="Title" data-url="https://example.test/post/"><button data-uo-copy-text>Copy text</button><button data-uo-copy-link>Copy link</button><button data-uo-share>Share</button><span data-uo-action-status></span></section></main><aside class="uo-sidebar">Persistent</aside></div><nav class="uo-admin-rail"><details><div class="uo-admin-links"><a data-uo-admin href="/wp-admin/edit.php">Posts</a></div></details></nav><dialog id="uo-admin-dialog"><h2 id="uo-admin-title"></h2><a data-uo-admin-full></a><button data-uo-admin-close></button><p data-uo-admin-status></p><iframe data-uo-admin-frame></iframe></dialog></body></html>`;
export async function runNavigationChecks(parseHTML) {
  const { document, Event, DOMParser } = parseHTML(initial);
  const listeners = {}, requests = [], assigned = [], stored = new Map(), timers = [], copied = [], shared = [];
  const location = { href:'https://example.test/', origin:'https://example.test', pathname:'/', search:'', assign:u=>assigned.push(u), replace:u=>assigned.push(u), reload:()=>assigned.push('reload') };
  function setURL(url) { const u = new URL(url); Object.assign(location,{href:u.href,origin:u.origin,pathname:u.pathname,search:u.search}); }
  const history = { state:{other:1}, entries:[], replaceState(s,_,u){this.state=s;setURL(u);},pushState(s,_,u){this.entries.push(s);this.state=s;setURL(u);} };
  const main = document.querySelector('.uo-main'); main.scrollTop=123; main.scrollLeft=0; main.clientHeight=500; main.scrollHeight=1200;
  const elementProto = Object.getPrototypeOf(main);
  elementProto.scrollTo = function(o){this.scrollTop=o.top;this.scrollLeft=o.left||0;}; elementProto.focus = function(){document.focusTarget=this;};
  const dialog = document.querySelector('dialog'); dialog.showModal=()=>{dialog.open=true;}; dialog.close=()=>{dialog.open=false;dialog.dispatchEvent(new Event('close'));};
  Object.defineProperty(document, 'scrollingElement', { value:document.documentElement });
  Object.defineProperty(document, 'readyState', { value:'loading' });
  const scope = {document,DOMParser,URL,URLSearchParams,AbortController,CustomEvent:Event,history,location,isSecureContext:true,navigator:{clipboard:{writeText:async value=>copied.push(value)},share:async value=>shared.push(value)},
    matchMedia:q=>({matches:q.includes('min-width')||q.includes('color-scheme'),addEventListener(){}}),
    localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)},
    setTimeout:(fn)=>{timers.push(fn);return timers.length;},clearTimeout(){},requestAnimationFrame:fn=>fn(),innerHeight:800,
    addEventListener:(k,fn)=>listeners[k]=fn,
    UOThemeConfig:{covers:['https://example.test/a.webp','https://example.test/b.webp','https://example.test/c.webp'],options:{enabled:0},context:{title:'Home'},scripts:{companion:'https://example.test/companion.js',roaming:'https://example.test/roaming.js'}},
    fetch:(url,opts)=>new Promise((resolve,reject)=>requests.push({url,opts,resolve,reject}))};
  scope.window=scope;vm.createContext(scope);vm.runInContext(source,scope);
  function click(el,options={}) { const e=new Event('click',{bubbles:true,cancelable:true});Object.assign(e,{button:0,...options});el.dispatchEvent(e);return e; }
  async function tick(){for(let i=0;i<12;i++)await Promise.resolve();}
  function page(name='Category',extra='') {return initial.replace('<title>Home</title>',`<title>${name}</title>`).replace('href="https://example.test/"',`href="https://example.test/${name.toLowerCase()}/"`).replace('<main class="uo-main">','<main class="uo-main"><h1>'+name+'</h1>'+extra);}
  async function answer(index,body=page(),url='https://example.test/category/') {requests[index].resolve({ok:true,url,headers:{get:()=> 'text/html; charset=utf-8'},text:async()=>body});await tick();}
  const out={};assert.equal(new Set(Array.from(document.querySelectorAll('[data-uo-cover]')).map(i=>i.getAttribute('src'))).size,3);assert.equal(document.querySelector('#authored-cover').getAttribute('src'),'/authored.webp');out.random_covers_preserve_authored_images=true;
  click(document.querySelector('#plain')); assert.equal(document.documentElement.dataset.uoScheme,'dark');
  click(document.querySelector('button[data-uo-scheme]'));assert.equal(document.documentElement.dataset.uoScheme,'light');
  click(document.querySelector('#plain'));assert.equal(document.documentElement.dataset.uoScheme,'light');
  assert.equal(stored.get('uo-theme:scheme'),'light');out.scheme_button_only=true;
  click(document.querySelector('[data-uo-copy-text]'));await tick();assert.ok(copied[0].includes('Article body'));assert.ok(copied[0].includes('https://example.test/post/'));
  click(document.querySelector('[data-uo-copy-link]'));await tick();assert.equal(copied[1],'https://example.test/post/');
  click(document.querySelector('[data-uo-share]'));await tick();assert.equal(shared[0].url,'https://example.test/post/');
  scope.navigator.share=undefined;click(document.querySelector('[data-uo-share]'));await tick();assert.equal(copied[2],'https://example.test/post/');out.copy_text_link_and_native_share_fallback=true;
  scope.navigator.clipboard.writeText=async()=>{throw Error('denied');};click(document.querySelector('[data-uo-copy-link]'));await tick();assert.ok(document.querySelector('[data-uo-action-status]').textContent.includes('浏览器菜单'));assert.equal(document.querySelector('[data-uo-copy-link]').disabled,false);out.clipboard_denial_recovers=true;
  click(document.querySelector('[data-uo-admin]'));assert.equal(dialog.open,true);assert.equal(document.querySelector('iframe').getAttribute('src'),'https://example.test/wp-admin/edit.php');
  click(document.querySelector('[data-uo-admin-close]'));assert.equal(dialog.open,false);assert.ok(document.querySelector('iframe').getAttribute('src'));out.admin_dialog_keeps_editor=true;
  click(document.querySelector('#article'));click(document.querySelector('#route'),{ctrlKey:true});assert.equal(requests.length,0);out.new_tab_and_modifiers_native=true;
  // Dynamically loaded optional scripts must not force every later route to full navigation.
  const optional=document.createElement('script');optional.src='https://example.test/companion.js';document.head.appendChild(optional);
  const sidebar=document.querySelector('.uo-sidebar');click(document.querySelector('#route'));assert.equal(requests.length,1);assert.equal(requests[0].opts.credentials,'same-origin');await answer(0);
  assert.equal(assigned.length,0);assert.equal(document.title,'Category');assert.equal(location.href,'https://example.test/category/');assert.equal(document.querySelector('main h1').textContent,'Category');assert.equal(document.querySelector('.uo-sidebar'),sidebar);assert.equal(document.body.dataset.uoScheme,'light');assert.equal(history.entries.length,1);assert.equal(document.querySelector('link[rel="canonical"]').getAttribute('href'),'https://example.test/category/');out.partial_html_url_metadata_and_rails=true;
  setURL('https://example.test/');listeners.popstate({state:{uo:{x:0,y:123}}});await answer(1,page('Home'),'https://example.test/');assert.equal(document.querySelector('.uo-main').scrollTop,123);assert.equal(history.entries.length,1);out.popstate_restores_scroll=true;
  // New scripts and HTTP failures must use the normal document route.
  click(document.querySelector('#route'));await answer(2,page('Other','<script src="/different.js"></script>'));assert.equal(assigned.at(-1),'https://example.test/category/');out.incompatible_script_fallback=true;
  click(document.querySelector('#route'));requests[3].reject(Error('offline'));await tick();assert.equal(assigned.length,2);out.network_error_fallback=true;
  click(document.querySelector('#route'));click(document.querySelector('#route'));assert.equal(requests[4].opts.signal.aborted,true);await answer(5,page('Latest'));await answer(4,page('Stale'));assert.equal(document.title,'Latest');out.latest_request_wins=true;
  return out;
}
if (typeof process !== 'undefined' && process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  const {parseHTML}=await import(pathToFileURL(process.argv[2]).href);console.log(JSON.stringify(await runNavigationChecks(parseHTML),null,2));
}
