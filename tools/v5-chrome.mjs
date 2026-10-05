// v5's chrome, written into every page from one list: the tab bar (the five pages, their icons and their names), the
// head script that runs before the first paint, and, on the home page, the hero's line and its row of apps. The pages
// stay plain HTML that works without scripts; this only keeps the copies the same. After changing the list below, or
// adding a page, run it:
//
//   node tools/v5-chrome.mjs           rewrite every page that differs
//   node tools/v5-chrome.mjs --check   name the pages that differ and exit 1, changing nothing
//
// tests/v5/unit/chrome.test.mjs runs the check, so a page edited by hand that drifts from the list fails the tests.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../v5/', import.meta.url));
export const EMAIL = 'leonardo.dtc2009@gmail.com';

// The pages in the tab bar, in order: the address under v5/, the name, and the icon (24 x 24, drawn in strokes).
export const TABS = [
  { id: 'home', path: '', name: 'Home', icon: 'M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z' },
  { id: 'work', path: 'work/', name: 'Work', icon: 'M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z' },
  { id: 'hockey', path: 'hockey/', name: 'Hockey', icon: 'M7 3.5 13.5 17h5.5M4 19a3.5 1.4 0 1 0 7 0 3.5 1.4 0 1 0-7 0' },
  { id: 'about', path: 'about/', name: 'About', icon: 'M8.4 8.5a3.6 3.6 0 1 0 7.2 0 3.6 3.6 0 1 0-7.2 0M5 20c.9-3.6 3.6-5.5 7-5.5s6.1 1.9 7 5.5' },
  { id: 'resume', path: 'resume/', name: 'Résumé', icon: 'M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20zM13.5 3.5v4.5H18M9.5 12.5h5M9.5 16h5' },
];

// The hero's apps (T34): every page in the tab bar but Home (entering is Home), and a way to write. What each
// shows besides its icon and name in the widget style (T39) is the site's own: its pictures, a line from the home
// page, a drawn page for the résumé, the address to write to; never a count (T36).
export const APPS = [
  { ...TABS[1], more: { shots: [['loquar-openworld-320.webp', 320, 200], ['genuvalens-hardware-crop-320.webp', 320, 213], ['ocapex-site-320.webp', 320, 200]] } },
  { ...TABS[2], more: { line: 'Groton School Boys’ Varsity, goaltender' } },
  { ...TABS[3], more: { photo: ['leonardo-square-320.webp', 320, 320] } },
  { ...TABS[4], more: { page: true } },
  { id: 'write', href: `mailto:${EMAIL}`, name: 'Write to me', icon: 'M4 6.5h16v11H4zM4.5 7l7.5 6 7.5-6', more: { line: EMAIL } },
];

// Who I am, in one line (T27): the home page's own first words.
export const LINE = 'Goaltender at Groton School, Class of 2028.';

// Write to me (T4): in the window's header on Work and on every project sheet, so a way to write shows from every
// view (Home, Hockey, About and Résumé carry it in their toolbars).
export const WRITE = `<a class="btn head__write" href="mailto:${EMAIL}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v11H4zM4.5 7l7.5 6 7.5-6"/></svg>Write to me</a>`;

// The head script. Before the first paint: scripts are on; the hero shows on the first home view of a session, and
// again on a reload (?nohello skips it); a Night or Day kept by the color control; the design toggles kept in this
// browser (toggles.js); a project loaded on its own boots as a sheet.
export const HEAD = `<script>(function(d){d.classList.add('js');try{var n=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];if(d.dataset.page==='home'&&(n&&n.type==='reload'||!sessionStorage.getItem('v5:hello'))&&!/[?&]nohello/.test(location.search))d.classList.add('is-hello')}catch(e){}try{var l=JSON.parse(localStorage.getItem('v5:color')||'{}').look;if(l==='night'||l==='day')d.dataset.appearance=l}catch(e){}try{var t=JSON.parse(localStorage.getItem('v5:toggles')||'{}');for(var k in t)if(/^[a-z][A-Za-z]{1,30}$/.test(k)&&/^[a-z][a-z-]{0,30}$/.test(t[k]))d.dataset[k]=t[k]}catch(e){}if(d.dataset.kind==='sheet')d.classList.add('is-booting')})(document.documentElement)</script>`;

const icon = d => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;

export function tabBar(up, tab) {
  const links = TABS.map(t => `    <a data-tab="${t.id}" href="${up + t.path || './'}"${t.id === tab ? ' aria-current="page"' : ''}>${icon(t.icon)}<span class="tabs__label">${t.name}</span></a>`);
  return ['<nav class="tabs glass" data-glass="ornament" aria-label="Pages">', '    <span class="tabs__bubble" aria-hidden="true"></span>', ...links, '  </nav>'].join('\n');
}

export function appRow(up) {
  const img = ([f, w, h]) => `<img src="${up}assets/img/${f}" width="${w}" height="${h}" alt="" loading="lazy" decoding="async">`;
  const more = ({ shots, photo, page, line }) => {
    if (shots) return `<span class="app__more app__shots" aria-hidden="true">${shots.map(img).join('')}</span>`;
    if (photo) return `<span class="app__more app__photo" aria-hidden="true">${img(photo)}</span>`;
    if (page) return '<span class="app__more app__page" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
    return `<span class="app__more app__line" aria-hidden="true">${line}</span>`;
  };
  const apps = APPS.map(a => `    <a class="app" data-app="${a.id}" href="${a.href || up + a.path}"><span class="app__art">${icon(a.icon)}</span><span class="app__name">${a.name}</span>${more(a.more)}</a>`);
  return ['<div class="hero__below">', `    <p class="hero__line">${LINE}</p>`, '    <nav class="apps" aria-label="Go straight to">', ...apps.map(a => '  ' + a), '    </nav>', '  </div>'].join('\n');
}

// every page: its file, how far below v5/ it sits, and the tab it belongs to
export function pages() {
  const out = [];
  const walk = (dir) => {
    for (const f of readdirSync(dir).sort()) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) { if (f !== 'assets') walk(p); }
      else if (f === 'index.html') out.push(p);
    }
  };
  walk(ROOT);
  return out.map(file => {
    const depth = relative(ROOT, file).split(sep).length - 1;
    return { file, up: '../'.repeat(depth) };
  });
}

const NAV = /<nav class="tabs glass"[\s\S]*?<\/nav>/;
const SCRIPT = /<script>\(function\(d\)\{[\s\S]*?\}\)\(document\.documentElement\)<\/script>/;
const APPS_RE = /<(?:div class="hero__below"|p class="hero__line")>[\s\S]*?<\/(?:div|nav)>(?=\n  <p class="hero__hint">)/;
const HEAD_RE = /(<header class="win__head">\n      <div>[\s\S]*?<\/div>)(?:\n      <a class="btn head__write"[\s\S]*?<\/a>)?(\n    <\/header>)/;
const NEON = /(<span class="hero__neon" aria-hidden="true">[\s\S]*?<\/span>\n  )(?=<p class="hero__hint">)/;

// the page as it should be: its chrome rewritten from the lists above
export function render(html, up) {
  const tab = (html.match(/<html[^>]*\sdata-tab="([^"]+)"/) || [])[1];
  if (!tab || !NAV.test(html) || !SCRIPT.test(html)) throw new Error('not a v5 page: no data-tab, tab bar or head script');
  let out = html.replace(SCRIPT, () => HEAD).replace(NAV, () => tabBar(up, tab));
  const kind = (html.match(/<html[^>]*\sdata-kind="([^"]+)"/) || [])[1], page = (html.match(/<html[^>]*\sdata-page="([^"]+)"/) || [])[1];
  if (kind === 'sheet' || page === 'work') {
    if (!HEAD_RE.test(out)) throw new Error('no window header for Write to me');
    out = out.replace(HEAD_RE, (m, a, b) => `${a}\n      ${WRITE}${b}`);
  }
  if (/<div class="hero">/.test(out)) {
    if (APPS_RE.test(out)) out = out.replace(APPS_RE, () => appRow(up));
    else if (NEON.test(out)) out = out.replace(NEON, (m, neon) => `${neon}${appRow(up)}\n  `);
    else throw new Error('the hero has no place for its apps');
  }
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const check = process.argv.includes('--check');
  const differ = [];
  for (const { file, up } of pages()) {
    const html = readFileSync(file, 'utf8'), want = render(html, up);
    if (want === html) continue;
    differ.push(relative(ROOT, file));
    if (!check) writeFileSync(file, want);
  }
  if (check) {
    if (differ.length) { console.error(`v5 chrome differs from tools/v5-chrome.mjs in: ${differ.join(', ')}\nRun: node tools/v5-chrome.mjs`); process.exit(1); }
    console.log('v5 chrome: every page matches');
  } else console.log(differ.length ? `v5 chrome: rewrote ${differ.join(', ')}` : 'v5 chrome: every page already matches');
}
