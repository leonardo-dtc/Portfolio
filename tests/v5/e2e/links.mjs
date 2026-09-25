// Every link on every page resolves, stays inside v5 or goes to an allowed site, and every #target exists.
import { open, BASE, PAGES, check } from './lib.mjs';

const ALLOWED = ['eliteprospects.com', 'ncsasports.org', 'ocapex.com', 'youtube.com', 'fda.gov', 'doi.org'];
const { browser, page } = await open({ js: false });
const seen = new Map();
let bad = 0, total = 0;
const fail = (msg) => { bad++; check(false, msg); };
for (const p of PAGES) {
  await page.goto(BASE + p, { waitUntil: 'load' });
  const links = await page.$$eval('a[href]', as => as.map(a => a.href));
  for (const href of links) {
    total++;
    const u = new URL(href);
    if (u.protocol === 'mailto:') continue;
    if (u.hostname === '127.0.0.1' && !u.pathname.startsWith('/v5/')) { fail(`${p}: link leaves v5: ${href}`); continue; }
    if (u.hostname !== '127.0.0.1') { if (!ALLOWED.some(h => u.hostname === h || u.hostname.endsWith('.' + h))) fail(`${p}: external ${u.hostname} not allowed`); continue; }
    const key = u.origin + u.pathname;
    if (!seen.has(key)) { const r = await page.request.get(key); seen.set(key, { ok: r.ok(), html: await r.text() }); }
    const t = seen.get(key);
    if (!t.ok) fail(`${p}: ${u.pathname} does not resolve`);
    if (u.hash.length > 1 && !t.html.includes(`id="${decodeURIComponent(u.hash.slice(1))}"`)) fail(`${p}: ${u.pathname}${u.hash} has no target`);
  }
}
check(bad === 0, `${total} links on ${PAGES.length} pages resolve`);
await browser.close();
