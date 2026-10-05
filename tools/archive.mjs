// The archive, kept in one place for both editions: archive/*.md, one file an entry (archive/README.md says how to
// add one). This writes v3's index cards (the files on its Macintosh, and the wall of cards) into v3/index.html, copies
// any covers into both editions, and gives tools/v5-chrome.mjs the list for v5's archive sheet and its rows. Run it
// after adding or changing an entry:
//
//   node tools/archive.mjs           rewrite v3's cards and v5's pages, and copy the covers
//   node tools/archive.mjs --check   name what differs from archive/ and exit 1, changing nothing
//
// tests/v3/unit/archive.test.mjs runs the check, so an edition edited by hand that drifts from archive/ fails the tests.
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync, copyFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sheets } from './v3-files.mjs';

export const REPO = fileURLToPath(new URL('../', import.meta.url));
export const DIR = join(REPO, 'archive');

// the fields an entry's head may hold (anything else is a typing slip, and stops the run)
export const FIELDS = ['kind', 'title', 'by', 'year', 'line', 'listen', 'cover', 'alt', 'link', 'link-text', 'v3', 'v5', 'icon', 'draft'];
// kinds that are music: they sit on the archive's Listening shelf, and v3's CD Player plays them
export const MUSIC = ['song', 'album', 'ep', 'single', 'playlist', 'mixtape'];
// where a listen link goes, by its address
const SERVICES = [[/(^|\.)spotify\.com$/, 'Spotify'], [/(^|\.)music\.apple\.com$/, 'Apple Music'], [/(^|\.)(youtube\.com|youtu\.be)$/, 'YouTube'],
  [/(^|\.)bandcamp\.com$/, 'Bandcamp'], [/(^|\.)soundcloud\.com$/, 'SoundCloud'], [/(^|\.)tidal\.com$/, 'Tidal'], [/(^|\.)deezer\.com$/, 'Deezer']];

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unquote = v => (/^(["']).*\1$/.test(v) ? v.slice(1, -1).replace(/\\"/g, '"') : v);

// one entry: its head between two --- lines (name: value, one a line), then paragraphs, then its details as
// "- Name: what" lines
export function parse(src, name = 'entry') {
  const m = String(src).replace(/^﻿/, '').replace(/\r\n?/g, '\n').match(/^---\n([\s\S]*?)\n---[ \t]*(?:\n([\s\S]*))?$/);
  if (!m) throw new Error(`archive/${name}: its head (kind, title, year, line) goes between two --- lines at the very top`);
  const e = { id: name.replace(/\.md$/, ''), text: [], facts: [] };
  for (const raw of m[1].split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf(':');
    if (i < 1) throw new Error(`archive/${name}: "${line}" should read "name: value"`);
    const k = line.slice(0, i).trim().toLowerCase(), v = unquote(line.slice(i + 1).trim());
    if (!FIELDS.includes(k)) throw new Error(`archive/${name}: there is no field "${k}" (the fields: ${FIELDS.join(', ')})`);
    e[k] = v;
  }
  e.draft = /^(true|yes)$/i.test(e.draft || '');
  for (const k of ['kind', 'title', 'year', 'line']) if (!e[k]) throw new Error(`archive/${name}: "${k}" is missing`);
  if (/[–—]/.test(src)) throw new Error(`archive/${name}: the site uses no en or em dashes`);
  for (const block of (m[2] || '').split(/\n[ \t]*\n/)) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (lines.every(l => l.startsWith('- '))) {
      for (const l of lines) {
        const j = l.indexOf(': ');
        if (j < 3) throw new Error(`archive/${name}: the detail "${l}" should read "- Name: what"`);
        e.facts.push([l.slice(2, j).trim(), l.slice(j + 2).trim()]);
      }
    } else e.text.push(lines.join(' '));
  }
  e.music = MUSIC.includes(e.kind.toLowerCase());
  if (e.listen) e.service = service(e.listen, name);
  if (e.link && !/^https:\/\//.test(e.link)) throw new Error(`archive/${name}: "link" is a full https:// address (a page on this site goes in v3 or v5)`);
  if (e.v3 && !/^#[a-z][\w-]*$/.test(e.v3)) throw new Error(`archive/${name}: "v3" names one of v3's sheets, such as "#record" (in quotes)`);
  if (e.v5 && (/^(https?:|\/)/.test(e.v5) || !/\/(#[\w-]+)?$/.test(e.v5))) throw new Error(`archive/${name}: "v5" is a page under v5/, such as resume/#amora`);
  if (e.cover && !/^[\w.-]+\.(jpe?g|png|webp|gif)$/i.test(e.cover)) throw new Error(`archive/${name}: "cover" names a .jpg, .png, .webp or .gif file in archive/covers/`);
  if (e.cover && !e.alt) e.alt = e.music ? `Cover of ${e.title}${e.by ? ` by ${e.by}` : ''}` : '';
  if (e.cover && !e.alt) throw new Error(`archive/${name}: a cover needs "alt": what the picture shows, for anyone who cannot see it`);
  return e;
}
function service(url, name) {
  let host;
  try { host = new URL(url).hostname; } catch (err) { throw new Error(`archive/${name}: "listen" is not an address: ${url}`); }
  if (!/^https:/.test(url)) throw new Error(`archive/${name}: "listen" is a full https:// address`);
  return (SERVICES.find(([re]) => re.test(host)) || [null, host.replace(/^www\./, '')])[1];
}

// a year sorts by its last year ("2021 to 2025" with 2025), then its first; "Now" is the newest, and "2026 to now"
// comes just after it (the same order v3's Macintosh uses)
export function yearKey(y) {
  const n = (String(y).match(/\d{4}/g) || []).map(Number), lo = n.length ? Math.min(...n) : 0;
  if (/now/i.test(y)) return [1e4, n.length ? lo : 1e4];
  return n.length ? [Math.max(...n), lo] : [0, 0];
}

// every entry, newest first (ties by file name); drafts included, marked
export function entries(dir = DIR) {
  if (!existsSync(dir)) return [];
  const all = readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'README.md' && !f.startsWith('_')).sort()
    .map(f => parse(readFileSync(join(dir, f), 'utf8'), f));
  const ids = new Set();
  for (const e of all) { if (ids.has(e.id)) throw new Error(`archive: two entries are called ${e.id}`); ids.add(e.id); }
  return all.sort((a, b) => { const x = yearKey(a.year), y = yearKey(b.year); return (y[0] - x[0]) || (y[1] - x[1]) || a.id.localeCompare(b.id); });
}
export const published = (all = entries()) => all.filter(e => !e.draft);

// ---------- covers: a picture's size, from its first bytes (PNG, JPEG, WebP, GIF) ----------
export function imageSize(b) {
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.length > 10 && b.toString('ascii', 0, 3) === 'GIF') return [b.readUInt16LE(6), b.readUInt16LE(8)];
  if (b.length > 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (chunk === 'VP8L') { const v = b.readUInt32LE(21); return [(v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1]; }
    if (chunk === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  }
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i + 9 < b.length;) {
      if (b[i] !== 0xff) { i++; continue; }
      const marker = b[i + 1], len = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      i += 2 + len;
    }
  }
  return null;
}
export function cover(e, dir = DIR) {
  if (!e.cover) return null;
  const src = join(dir, 'covers', e.cover);
  if (!existsSync(src)) throw new Error(`archive/${e.id}.md: its cover archive/covers/${e.cover} is not there`);
  const size = imageSize(readFileSync(src));
  if (!size) throw new Error(`archive/covers/${e.cover}: not a picture this can read (use .jpg, .png, .webp or .gif)`);
  return { file: e.cover, src, w: size[0], h: size[1], alt: e.alt };
}

// ---------- v3: the index cards ----------
// a sheet's link reads as the deck names it, by its number and its file's title in the index ("Sheet 10, The record");
// the deck's script (site.js) writes the same from the page, so it stays right if sheets move
export function v3Link(e, deck) {
  if (!e.v3) return null;
  const id = e.v3.slice(1), s = sheets(deck)[id];
  const t = deck.match(new RegExp(`<a class="folder__btn" href="#${id}"[\\s\\S]*?<p class="file__title">([\\s\\S]*?)</p>`));
  if (!s || !t) throw new Error(`archive/${e.id}.md: v3 has no sheet ${e.v3} with a folder in the index`);
  return { href: e.v3, text: `Sheet ${s.n}, ${t[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\\s+/g, ' ').trim()}` };
}
export function v3Card(e, deck) {
  const c = cover(e), link = v3Link(e, deck), pad = '          ';
  const out = [`        <li class="entry${e.music ? ' entry--music' : ''}"${e.icon ? ` data-icon="${esc(e.icon)}"` : ''}>`,
    `${pad}<p class="entry__meta"><span class="entry__year">${esc(e.year)}</span><span class="entry__kind">${esc(e.kind)}</span></p>`];
  if (c) out.push(`${pad}<img class="entry__cover" src="assets/img/archive/${esc(c.file)}" width="${c.w}" height="${c.h}" alt="${esc(c.alt)}" loading="lazy" decoding="async">`);
  out.push(`${pad}<h3 class="entry__title">${esc(e.title)}</h3>`);
  if (e.by) out.push(`${pad}<p class="entry__by">${esc(e.by)}</p>`);
  out.push(`${pad}<p class="entry__line">${esc(e.line)}.</p>`);
  if (e.text.length || e.facts.length) {
    out.push(`${pad}<div class="entry__more">`, ...e.text.map(t => `${pad}  <p>${esc(t)}</p>`));
    if (e.facts.length) out.push(`${pad}  <dl class="entry__facts">`, ...e.facts.map(([k, v]) => `${pad}    <div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`), `${pad}  </dl>`);
    out.push(`${pad}</div>`);
  }
  if (e.listen) out.push(`${pad}<a class="entry__listen" href="${esc(e.listen)}" rel="noopener">Listen on ${esc(e.service)}</a>`);
  if (link) out.push(`${pad}<a class="entry__link" href="${link.href}">${esc(link.text)}</a>`);
  if (e.link) out.push(`${pad}<a class="entry__link" href="${esc(e.link)}" rel="noopener">${esc(e['link-text'] || new URL(e.link).hostname.replace(/^www\./, ''))}</a>`);
  out.push('        </li>');
  return out.join('\n');
}
const V3_NOTE = `<!-- Written by tools/archive.mjs from archive/*.md, one file an entry (archive/README.md says how to add one,
           a song, an album or a project included). Edit there and run node tools/archive.mjs: changes made here are
           undone by the next run. -->`;
const V3_RE = /<!-- (?:HOW TO ADD AN ENTRY|Written by tools\/archive\.mjs)[\s\S]*?<ul class="entries" aria-label="Archive entries">[\s\S]*?\n {6}<\/ul>/;
export function renderV3(deck, all = entries()) {
  if (!V3_RE.test(deck)) throw new Error('archive: v3/index.html has no list of entries (<ul class="entries">) after its note');
  const list = ['<ul class="entries" aria-label="Archive entries">', ...published(all).map(e => v3Card(e, deck)), '      </ul>'].join('\n');
  return deck.replace(V3_RE, () => `${V3_NOTE}\n      ${list}`);
}

// ---------- v5: the list its generator writes from ----------
// a page's link reads as the page names itself, and the part it opens at ("Résumé · Amora string quartet")
export function v5LinkText(path) {
  const [page, hash] = path.split('#');
  const file = join(REPO, 'v5', page, 'index.html');
  if (!existsSync(file)) throw new Error(`archive: v5 has no page ${page}`);
  const html = readFileSync(file, 'utf8');
  const title = ((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').split(' · ')[0];
  if (!hash) return title;
  const at = html.indexOf(`id="${hash}"`);
  if (at < 0) throw new Error(`archive: v5's ${page} has nothing with id "${hash}"`);
  const h = html.slice(at).match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/);
  return h ? `${title} · ${h[1].replace(/<[^>]+>/g, '').trim()}` : title;
}
export function forV5(all = entries()) {
  return published(all).map(e => {
    const c = cover(e);
    return {
      id: e.id, year: e.year, kind: e.kind, title: e.title, by: e.by || '', line: e.line, text: e.text, facts: e.facts, music: e.music,
      cover: c && { file: c.file, w: c.w, h: c.h, alt: c.alt },
      listen: e.listen ? { href: e.listen, service: e.service } : null,
      link: e.v5 ? { href: e.v5, text: v5LinkText(e.v5) } : null,
      away: e.link ? { href: e.link, text: e['link-text'] || new URL(e.link).hostname.replace(/^www\./, '') } : null,
    };
  });
}

// ---------- the covers, copied into each edition with a note of where they came from ----------
// (each edition's archive folder holds these copies and nothing else, so a copy no entry names any more, its entry
// gone or its picture changed, is taken out; the picture itself stays in archive/covers/)
export const strays = (names, want) => names.filter(f => !want.has(f.replace(/\.json$/, '')));
function syncCovers({ check, all }) {
  const drift = [], want = new Set();
  for (const e of published(all)) {
    const c = cover(e); if (!c) continue;
    want.add(c.file);
    for (const ed of ['v3', 'v5']) {
      const dir = join(REPO, ed, 'assets', 'img', 'archive'), to = join(dir, c.file), note = `${to}.json`;
      const sidecar = JSON.stringify({ prompt: `The cover of the archive's entry "${e.title}" (archive/${e.id}.md), copied from archive/covers/${c.file} by tools/archive.mjs.` }, null, 2) + '\n';
      const same = existsSync(to) && readFileSync(to).equals(readFileSync(c.src)) && existsSync(note) && readFileSync(note, 'utf8') === sidecar;
      if (same) continue;
      drift.push(`${ed}/assets/img/archive/${c.file}`);
      if (check) continue;
      mkdirSync(dir, { recursive: true });
      copyFileSync(c.src, to);
      writeFileSync(note, sidecar);
    }
  }
  for (const ed of ['v3', 'v5']) {
    const dir = join(REPO, ed, 'assets', 'img', 'archive');
    if (!existsSync(dir)) continue;
    for (const f of strays(readdirSync(dir), want)) {
      drift.push(`${ed}/assets/img/archive/${f} (no entry names it)`);
      if (!check) unlinkSync(join(dir, f));
    }
    if (!check && !readdirSync(dir).length) rmdirSync(dir);
  }
  return drift;
}

export function run({ check = false, log = console.log } = {}) {
  const all = entries();
  const drift = syncCovers({ check, all });
  const p = join(REPO, 'v3', 'index.html'), was = readFileSync(p, 'utf8'), now = renderV3(was, all);
  if (now !== was) { drift.push('v3/index.html'); if (!check) writeFileSync(p, now); }
  if (drift.length) log(`${check ? 'differs from archive/' : 'rewritten'}: ${drift.join(', ')}`);
  return drift;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const check = process.argv.includes('--check');
  let drift;
  try { drift = run({ check }); } catch (err) { console.error(err.message); process.exit(1); }
  // v5's pages come from tools/v5-chrome.mjs, which reads this list itself (so it runs on its own, after this)
  const v5 = spawnSync(process.execPath, [join(REPO, 'tools', 'v5-chrome.mjs'), ...(check ? ['--check'] : [])], { encoding: 'utf8' });
  process.stdout.write(v5.stdout); process.stderr.write(v5.stderr);
  if (check && (drift.length || v5.status)) process.exit(1);
  if (v5.status) process.exit(v5.status);
  if (!drift.length) console.log(`archive: ${published().length} entries; v3 matches archive/`);
}
