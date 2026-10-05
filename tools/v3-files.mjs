// v3's project files, written from one list: each file's title, the chrome (the name, Email and the year, as on the
// deck), the drawer of tabs, the links back to its sheet, the pager to the files on either side, and the name its
// view transition uses. The numbers, the names and the pager's lines come from the deck itself (v3/index.html): a
// file is numbered by its sheet's place among the sheets, named by the sheet's folder in the index, and described by
// that folder's file. So a sheet that moves, or a folder renamed in the index, changes every file. After changing
// the list below, or the deck, run it:
//
//   node tools/v3-files.mjs           rewrite every file that differs
//   node tools/v3-files.mjs --check   name the files that differ and exit 1, changing nothing
//
// tests/v3/unit/files.test.mjs runs the check, so a file edited by hand that drifts from the deck fails the tests.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../v3/', import.meta.url));
export const EMAIL = 'leonardo.dtc2009@gmail.com';

// The files, in the deck's order: the folder under v3/files/ and the sheet (its id in v3/index.html) it belongs to.
export const FILES = [
  { dir: 'aducanumab', sheet: 'research' },
  { dir: 'genuvalens', sheet: 'exoskeleton' },
  { dir: 'loquar', sheet: 'loquar' },
  { dir: 'ocapex', sheet: 'ocapex' },
  { dir: 'hockey', sheet: 'hockey' },
  { dir: 'resume', sheet: 'record' },
];

const pad = n => String(n).padStart(2, '0');
const plain = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// every sheet of the deck: its number, its name (its folder's tab) and its line (the kicker on the folder's file)
export function sheets(deck = readFileSync(join(ROOT, 'index.html'), 'utf8')) {
  const ids = [...deck.matchAll(/<section class="slide[^"]*" id="([^"]+)"/g)].map(m => m[1]);
  const out = {};
  ids.forEach((id, i) => { out[id] = { id, n: pad(i + 1) }; });
  for (const m of deck.matchAll(/<a class="folder__btn" href="#([^"]+)"[^>]*><span class="folder__tab"><span class="folder__n">\d+<\/span>([^<]+)<\/span>([\s\S]*?)<\/a>/g)) {
    const s = out[m[1]];
    if (!s) continue;
    s.name = plain(m[2]);
    const k = m[3].match(/<p class="file__kicker">([\s\S]*?)<\/p>/);
    s.line = k ? plain(k[1]) : '';
  }
  return out;
}

export function files(deck) {
  const s = sheets(deck);
  return FILES.map(f => {
    const sh = s[f.sheet];
    if (!sh || !sh.name) throw new Error(`v3-files: no sheet "${f.sheet}" with a folder in the index`);
    return { ...f, n: sh.n, name: sh.name, line: sh.line };
  });
}

const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#arrow"/></svg>';

export function chrome() {
  return ['<header class="chrome" aria-label="Page">', '  <a href="../../">Leonardo Carvalho</a>',
    `  <span class="chrome__end"><a href="mailto:${EMAIL}">Email</a><span aria-hidden="true">2026</span></span>`, '</header>'].join('\n');
}

export function drawer(all, cur) {
  const li = all.map(f => f === cur
    ? `      <li class="is-current"><a href="./" aria-current="page"><span>File ${f.n} · ${esc(f.name)}</span></a></li>`
    : `      <li><a href="../${f.dir}/" aria-label="${f.n} ${esc(f.name)}"><span><b>${f.n}</b> <span class="n-name">${esc(f.name)}</span></span></a></li>`);
  return ['<nav class="drawer" aria-label="Files">', '    <ol>', ...li, '    </ol>', '  </nav>'].join('\n');
}

export function back(f) { return `<a class="back" href="../../#${f.sheet}">${arrow}Back to sheet ${f.n}</a>`; }

export function pager(all, cur) {
  const i = all.indexOf(cur), prev = all[i - 1], next = all[i + 1];
  const label = prev && next ? 'Previous and next files' : prev ? 'Previous file' : 'Next file';
  const link = (f, rel, word) => [`      <a href="../${f.dir}/" rel="${rel}">`, `        <span class="pager__k">${word} · File ${f.n}</span>`, `        <span class="pager__t">${esc(f.name)}</span>`,
    `        <span class="pager__d"><span>${esc(f.line)}</span></span>`, '        <span class="pager__go" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#arrow"/></svg></span>', '      </a>'];
  return [`<nav class="pager" aria-label="${label}">`, ...(prev ? link(prev, 'prev', 'Previous') : []), ...(next ? link(next, 'next', 'Next') : []), '    </nav>'].join('\n');
}

// one file's page, with its generated parts written in; throws if a part's place is missing
export function render(html, all, f) {
  const swap = (re, to, what) => {
    if (!re.test(html)) throw new Error(`v3-files: ${f.dir}: no ${what}`);
    html = html.replace(re, to);
  };
  swap(/<title>[^<]*<\/title>/, `<title>File ${f.n} · ${esc(f.name)} · Leonardo Carvalho</title>`, 'title');
  swap(/<header class="chrome"[\s\S]*?<\/header>/, chrome(), 'chrome');
  swap(/<nav class="drawer"[\s\S]*?<\/nav>/, drawer(all, f), 'drawer');
  swap(/view-transition-name: file-\d+/, `view-transition-name: file-${f.n}`, 'view transition name');
  swap(/<a class="back"[^>]*>[\s\S]*?<\/a>/g, back(f), 'link back');
  swap(/<nav class="pager"[\s\S]*?<\/nav>/, pager(all, f), 'pager');
  return html;
}

export function run({ check = false, log = console.log } = {}) {
  const all = files();
  const drift = [];
  for (const f of all) {
    const p = join(ROOT, 'files', f.dir, 'index.html');
    const was = readFileSync(p, 'utf8'), now = render(was, all, f);
    if (now === was) continue;
    drift.push(`v3/files/${f.dir}/index.html`);
    if (!check) writeFileSync(p, now);
  }
  if (drift.length) log(`${check ? 'differs from the list' : 'rewritten'}: ${drift.join(', ')}`);
  return drift;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const check = process.argv.includes('--check');
  const drift = run({ check });
  if (check && drift.length) process.exit(1);
  if (!drift.length) console.log('v3 files: every file matches the deck');
}
