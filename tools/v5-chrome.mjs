// v5's chrome, written into every page from one list: the tab bar (the six pages, their icons and their names), the
// head script that runs before the first paint, on the home page the hero's line and its row of apps, and the
// archive: the Experiments rows on Home and Work, and the archive page's entries (archive/). The pages
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
import { forV5, esc } from './archive.mjs';

export const ROOT = fileURLToPath(new URL('../v5/', import.meta.url));
export const EMAIL = 'leonardo.dtc2009@gmail.com';

// The pages in the tab bar, in order: the address under v5/, the name, and the icon (24 x 24, drawn in strokes).
export const TABS = [
  { id: 'home', path: '', name: 'Home', icon: 'M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z' },
  { id: 'work', path: 'work/', name: 'Work', icon: 'M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z' },
  { id: 'hockey', path: 'hockey/', name: 'Hockey', icon: 'M7 3.5 13.5 17h5.5M4 19a3.5 1.4 0 1 0 7 0 3.5 1.4 0 1 0-7 0' },
  { id: 'about', path: 'about/', name: 'About', icon: 'M8.4 8.5a3.6 3.6 0 1 0 7.2 0 3.6 3.6 0 1 0-7.2 0M5 20c.9-3.6 3.6-5.5 7-5.5s6.1 1.9 7 5.5' },
  { id: 'resume', path: 'resume/', name: 'Résumé', icon: 'M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20zM13.5 3.5v4.5H18M9.5 12.5h5M9.5 16h5' },
  // a page of its own since Request F (it was a sheet over Work, and hard to find): what I make, and what I listen to
  { id: 'archive', path: 'archive/', name: 'Archive', icon: 'M4 5h16v4H4zM5.5 9v10.5h13V9M10 12.5h4' },
];

// The hero's apps (T34): every page in the tab bar but Home (entering is Home), and a way to write. What each
// shows besides its icon and name in the widget style (T39) is the site's own: its pictures, a line from the home
// page, a drawn page for the résumé, the address to write to; never a count (T36).
export const APPS = [
  { ...TABS[1], more: { shots: [['loquar-openworld-320.webp', 320, 200], ['genuvalens-hardware-crop-320.webp', 320, 213], ['ocapex-site-320.webp', 320, 200]] } },
  { ...TABS[2], more: { line: 'Groton School Boys’ Varsity, goaltender' } },
  { ...TABS[3], more: { photo: ['leonardo-square-320.webp', 320, 320] } },
  { ...TABS[4], more: { page: true } },
  { ...TABS[5], more: { line: 'What I make, and what I listen to' } },
  { id: 'write', href: `mailto:${EMAIL}`, name: 'Write to me', icon: 'M4 6.5h16v11H4zM4.5 7l7.5 6 7.5-6', more: { line: EMAIL.replace('@', '@<wbr>') } },   // (a narrow widget breaks it after the @)
];

// Who I am, in one line (T27): the home page's own first words.
export const LINE = 'Goaltender at Groton School, Class of 2028.';
// the line as written on the hero: the school and the class year each kept on one line (a narrow phone broke
// "Groton / School")
const KEEP = ['Groton School', 'Class of 2028'];
export const lineHTML = (s = LINE) => KEEP.reduce((t, k) => t.replace(k, k.replace(/ /g, '&nbsp;')), s);

// Write to me (T4): in the window's header on Work and on every project sheet, so a way to write shows from every
// view (Home, Hockey, About and Résumé carry it in their toolbars).
export const WRITE = `<a class="btn head__write" href="mailto:${EMAIL}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v11H4zM4.5 7l7.5 6 7.5-6"/></svg>Write to me</a>`;

// The archive (T7: "a mix of personal work and small things"), kept with v3's in archive/*.md (tools/archive.mjs reads
// it, newest first; archive/README.md says how to add an entry, a song, an album or a project included). Here it
// writes the Experiments rows on Home (the newest four things made) and on Work (all of them), and every entry in
// full on the archive's own page, archive/: the things made in its window, and the songs and albums, once there are
// any, in a side window of their own, Listening (inside the window, after the things made, below 1360px). Each
// entry's link reads as the page it opens names itself.
export const ARCHIVE = forV5();
export const MADE = ARCHIVE.filter(a => !a.music), HEARD = ARCHIVE.filter(a => a.music);
// how many of the newest things made the home page shows; Work shows them all
export const HOME_ARCHIVE = 4;

// the rows of Experiments: each opens its entry on the archive's page (things made only; the music is there too)
export function expRows(up, n = Infinity, list = ARCHIVE) {
  const rows = list.filter(a => !a.music).slice(0, n).map(a => `          <li><a class="row" href="${up}archive/#${a.id}" data-hover><span class="row__t"><em>${esc(a.title.toLowerCase())}</em><small>${esc(a.line)}</small></span><span class="row__m">${esc(a.year)}</span></a></li>`);
  return ['<ul class="rows exp">', ...rows, '        </ul>'].join('\n');
}
const chevron = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 6 6 6-6 6"/></svg>';
const away = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h10v10M19 5 6 18"/></svg>';
// the archive's page: every entry in full; the things made in its window (archiveList), the music in its side window
// (listening)
const entryOf = (up, h = 2) => a => [
    `          <li class="arc__item" id="${a.id}">`,
    `            <p class="arc__meta"><span class="arc__year">${esc(a.year)}</span><span class="arc__kind">${esc(a.kind)}</span></p>`,
    ...(a.cover ? [`            <img class="arc__cover" src="${up}assets/img/archive/${esc(a.cover.file)}" width="${a.cover.w}" height="${a.cover.h}" alt="${esc(a.cover.alt)}" loading="lazy" decoding="async">`] : []),
    `            <h${h} class="arc__title">${esc(a.title)}</h${h}>`,
    ...(a.by ? [`            <p class="arc__by">${esc(a.by)}</p>`] : []),
    `            <p class="arc__line">${esc(a.line)}.</p>`,
    ...(a.text.length ? ['            <div class="prose">', ...a.text.map(t => `              <p>${esc(t)}</p>`), '            </div>'] : []),
    ...(a.facts.length ? ['            <dl class="facts facts--box">', ...a.facts.map(([k, v]) => `              <dt>${esc(k)}</dt><dd>${esc(v)}</dd>`), '            </dl>'] : []),
    ...((a.listen || a.link || a.away) ? ['            <p class="arc__go">',
      ...(a.listen ? [`              <a class="btn" href="${esc(a.listen.href)}" rel="noopener">Listen on ${esc(a.listen.service)}${away}</a>`] : []),
      ...(a.link ? [`              <a class="btn" href="${up}${a.link.href}">${esc(a.link.text)}${chevron}</a>`] : []),
      ...(a.away ? [`              <a class="btn" href="${esc(a.away.href)}" rel="noopener">${esc(a.away.text)}${away}</a>`] : []),
      '            </p>'] : []),
    '          </li>',
  ].join('\n');
export function archiveList(up, all = ARCHIVE) {
  return ['<ol class="arc">', ...all.filter(a => !a.music).map(entryOf(up)), '        </ol>'].join('\n');
}
const probes = [0, 1, 2, 3].map(n => `<span class="probe" data-corner="${n}"></span>`).join('');
// The Listening window, after Spotify on Vision Pro: a now playing card (its artwork, title, artist and line, and
// Listen on its service between Previous and Next, which step through the songs: listening.js), then every song and
// album as a row that opens it where it plays. The artwork is drawn (only pictures I may publish go on the site): a
// field of its own colour (its "hue") with its title set on it. Without the script the card shows the newest and
// the rows do the rest.
const play = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
const skip = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d < 0 ? 'M6.5 5.5v13M18 6.2v11.6a.8.8 0 0 1-1.25.66L9 12.66a.8.8 0 0 1 0-1.32l7.75-5.8A.8.8 0 0 1 18 6.2z' : 'M17.5 5.5v13M6 6.2v11.6a.8.8 0 0 0 1.25.66L15 12.66a.8.8 0 0 0 0-1.32L7.25 5.54A.8.8 0 0 0 6 6.2z'}"/></svg>`;
// (an entry always has its hue from archive/; one without keeps the stylesheet's)
const hueOf = a => (Number.isFinite(a.hue) ? ` style="--h: ${a.hue}"` : '');
// a cover of its own in archive/covers/ (a picture I may publish: my own photo or drawing) takes the drawn artwork's place
const coverOf = (a, up) => (a.cover ? `${up}assets/img/archive/${a.cover.file}` : '');
const artOf = (a, small, up) => {
  const src = coverOf(a, up), img = src ? `<img src="${esc(src)}" width="${a.cover.w}" height="${a.cover.h}" alt="" loading="lazy" decoding="async">` : '';
  return `<span class="art${small ? ' art--s' : ''}${src ? ' art--img' : ''}"${hueOf(a)} aria-hidden="true">${img}${small ? '' : `<i>${esc(a.by)}</i><b>${esc(a.title)}</b>`}</span>`;
};
const listenOf = a => (a.listen ? `<a class="player__listen${a.listen.service === 'Spotify' ? ' is-spotify' : ''}" href="${esc(a.listen.href)}" rel="noopener" data-hover>${play}<span><span class="player__on">Listen on </span>${esc(a.listen.service)}</span></a>` : `<a class="player__listen" hidden data-hover>${play}<span><span class="player__on">Listen on </span></span></a>`);
export function listening(up, all = ARCHIVE) {
  const heard = all.filter(a => a.music);
  if (!heard.length) return '';
  const now = heard[0], i = '      ';
  const row = (a, n) => {
    const go = a.listen ? ['a', ` href="${esc(a.listen.href)}" rel="noopener"`] : ['div', ''];
    const kind = /^song$/i.test(a.kind) ? '' : `${esc(a.kind)} · `;
    return [`${i}  <li class="track${n ? '' : ' is-current'}" id="${a.id}"${hueOf(a)} data-title="${esc(a.title)}" data-by="${esc(a.by)}" data-line="${esc(a.line)}."${a.listen ? ` data-href="${esc(a.listen.href)}" data-service="${esc(a.listen.service)}"` : ''}${a.cover ? ` data-cover="${esc(coverOf(a, up))}"` : ''}>`,
      `${i}    <${go[0]} class="track__go"${go[1]}${n ? '' : ' aria-current="true"'}${a.listen ? ' data-hover' : ''}>${artOf(a, true, up)}<span class="track__t"><b>${esc(a.title)}</b><small>${kind}${esc(a.by)}</small></span>${a.listen ? `<span class="vh">, on ${esc(a.listen.service)}</span>${away}` : ''}</${go[0]}>`,
      ...(a.text.length ? [`${i}    <div class="track__more">`, ...a.text.map(t => `${i}      <p>${esc(t)}</p>`), `${i}    </div>`] : []),
      ...(a.facts.length ? [`${i}    <dl class="facts facts--box track__more">`, ...a.facts.map(([k, v]) => `${i}      <dt>${esc(k)}</dt><dd>${esc(v)}</dd>`), `${i}    </dl>`] : []),
      `${i}  </li>`].join('\n');
  };
  return ['', '  <aside class="side glass" data-glass="window" data-side="right" data-inline="end" aria-labelledby="listening">', `    ${probes}`,
    '    <div class="side__part player" data-player>', '      <h2 id="listening">Listening</h2>',
    `${i}<div class="player__now">`,
    `${i}  ${artOf(now, false, up)}`,
    `${i}  <div class="player__info"><h3 class="player__title">${esc(now.title)}</h3><p class="player__by">${esc(now.by)}</p><p class="player__line">${esc(now.line)}.</p></div>`,
    `${i}  <p class="player__keys"><button class="player__skip" type="button" data-skip="-1" aria-label="Previous" data-hover>${skip(-1)}</button>${listenOf(now)}<button class="player__skip" type="button" data-skip="1" aria-label="Next" data-hover>${skip(1)}</button></p>`,
    `${i}</div>`,
    `${i}<ol class="tracks">`, ...heard.map(row), `${i}</ol>`,
    '    </div>', '  </aside>'].join('\n');
}

// The head script. Before the first paint: scripts are on; the hero shows on the first home view of a session, and
// again on a reload (?nohello skips it); a Night or Day kept by the color control; the design toggles kept in this
// browser (toggles.js), then any in the address for this visit (?toggles=heroName:glass; a letter or a question's
// name, as in ?toggles=T39:b, waits for toggles.js); a project loaded on its own boots as a sheet. And a way out: boot.js marks the page "booted"
// once everything has started, which is always before DOMContentLoaded (it is a deferred module); a page that is not
// booted by then (a file that failed to load, a script that stopped, a browser too old for modules) drops back to
// the page without scripts, rather than staying hidden behind a hero that will never leave.
export const HEAD = `<script>(function(d){d.classList.add('js');try{var n=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];if(d.dataset.page==='home'&&(n&&n.type==='reload'||!sessionStorage.getItem('v5:hello'))&&!/[?&]nohello/.test(location.search))d.classList.add('is-hello')}catch(e){}try{var l=JSON.parse(localStorage.getItem('v5:color')||'{}').look;if(l==='night'||l==='day')d.dataset.appearance=l}catch(e){}try{var t=JSON.parse(localStorage.getItem('v5:toggles')||'{}');for(var k in t)if(/^[a-z][A-Za-z]{1,30}$/.test(k)&&/^[a-z][a-z-]{0,30}$/.test(t[k]))d.dataset[k]=t[k]}catch(e){}try{var q=/[?&]toggles=([^&#]*)/.exec(location.search);if(q)decodeURIComponent(q[1]).split(',').forEach(function(p){var a=p.split(':');if(a.length===2&&/^[a-z][A-Za-z]{1,30}$/.test(a[0])&&/^[a-z][a-z-]{0,30}$/.test(a[1]=a[1].trim().toLowerCase()))d.dataset[a[0]]=a[1]})}catch(e){}if(d.dataset.kind==='sheet')d.classList.add('is-booting');document.addEventListener('DOMContentLoaded',function(){var c=d.classList;if(!c.contains('booted')){c.remove('js');c.remove('is-hello');c.remove('is-booting')}})})(document.documentElement)</script>`;

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
  return ['<div class="hero__below">', `    <p class="hero__line">${lineHTML()}</p>`, '    <nav class="apps" aria-label="Go straight to">', ...apps.map(a => '  ' + a), '    </nav>', '  </div>'].join('\n');
}

// every page: its file, how far below v5/ it sits, and the tab it belongs to
export function pages() {
  const out = [];
  const walk = (dir) => {
    for (const f of readdirSync(dir).sort()) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) { if (f !== 'assets') walk(p); }
      else if (f === 'index.html' && !/<html[^>]*\sdata-moved/.test(readFileSync(p, 'utf8'))) out.push(p);   /* (a page that moved only sends its visitors on) */
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
const EXP_RE = /<ul class="rows exp">[\s\S]*?<\/ul>/;
const ARC_RE = /<ol class="arc">[\s\S]*?<\/ol>/;
const LISTEN_RE = /( {2}<!-- Listening: [^\n]*-->)(?:\n {2}<aside[\s\S]*?<\/aside>)?/;
const NEON = /(<span class="hero__neon" aria-hidden="true">[\s\S]*?<\/span>\n  )(?=<p class="hero__hint">)/;
const BODY_RE = /<div class="win__body" data-scroll tabindex="0"[^>]*>/;

// The window's body scrolls and is a tab stop, so it is named: a region called by the page's name (its title's first
// part; Home's title is the name alone, so Home's is its tab's)
export function bodyName(html, tab) {
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  return title.includes(' · ') ? title.split(' · ')[0] : (TABS.find(t => t.id === tab) || {}).name;
}

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
  if (EXP_RE.test(out)) out = out.replace(EXP_RE, () => expRows(up, page === 'home' ? HOME_ARCHIVE : Infinity));
  if (page === 'archive') {
    if (!ARC_RE.test(out) || !LISTEN_RE.test(out)) throw new Error('the archive page has no list for its entries, or no place for its Listening window');
    out = out.replace(ARC_RE, () => archiveList(up)).replace(LISTEN_RE, (m, note) => note + listening(up));
  }
  if (BODY_RE.test(out)) out = out.replace(BODY_RE, () => `<div class="win__body" data-scroll tabindex="0" role="region" aria-label="${bodyName(out, tab)}">`);
  if (/<div class="hero">/.test(out)) {
    if (APPS_RE.test(out)) out = out.replace(APPS_RE, () => appRow(up));
    else if (NEON.test(out)) out = out.replace(NEON, (m, neon) => `${neon}${appRow(up)}\n  `);
    else throw new Error('the hero has no place for its apps');
  }
  return out;
}

// every page as it should be; with check, nothing is written. Returns the pages that differ.
export function run({ check = false, log = console.log } = {}) {
  const differ = [];
  for (const { file, up } of pages()) {
    const html = readFileSync(file, 'utf8'), want = render(html, up);
    if (want === html) continue;
    differ.push(relative(ROOT, file));
    if (!check) writeFileSync(file, want);
  }
  if (differ.length) log(`${check ? 'v5 chrome differs from tools/v5-chrome.mjs in' : 'v5 chrome: rewrote'} ${differ.join(', ')}`);
  return differ;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const check = process.argv.includes('--check');
  const differ = run({ check, log: check ? console.error : console.log });
  if (check && differ.length) { console.error('Run: node tools/v5-chrome.mjs'); process.exit(1); }
  if (!differ.length) console.log(check ? 'v5 chrome: every page matches' : 'v5 chrome: every page already matches');
}
