// Work's filters (flip.js). GSAP loads only where there is a grid to filter: never on Home, and on Work once the page
// is idle. Choosing a filter shows the right cards and says how many; with motion the cards that stay glide (they are
// between their old and new places partway through) and the grid ends exactly where the instant change puts it, with
// nothing left in their inline styles; under reduced motion the change is instant. Choosing again while the cards
// are still moving lands cleanly too.
import { open, BASE, check } from './lib.mjs';

const pick = (page, f) => page.evaluate(f => [...document.querySelectorAll(`button[data-filter="${f}"]`)].find(b => b.offsetParent).click(), f);
const boxes = page => page.evaluate(() => [...document.querySelectorAll('[data-cards] .card[data-cat]')].map(c => { const r = c.getBoundingClientRect(); return { href: c.getAttribute('href'), hidden: c.hidden, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), style: c.getAttribute('style') || '' }; }));
const vendor = reqs => reqs.filter(u => u.includes('/vendor/gsap/'));

// the layout each filter should end in, from the instant change (reduced motion)
const want = {};
{
  const { browser, page, errors } = await open({ reduced: true });
  const reqs = []; page.on('request', r => reqs.push(r.url()));
  await page.goto(BASE + '?nohello', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  check(vendor(reqs).length === 0, `Home loads no GSAP (${vendor(reqs).length} requests)`);
  await page.goto(BASE + 'work/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.gsap && window.Flip, null, { timeout: 8000 }).catch(() => {});
  check(vendor(reqs).length === 2 && await page.evaluate(() => !!(window.gsap && window.Flip)), `Work loads GSAP and Flip once idle (${vendor(reqs).map(u => u.split('/').pop()).join(', ')})`);
  for (const f of ['build', 'research', 'all']) {
    await pick(page, f);
    const b = await boxes(page), live = await page.evaluate(() => document.querySelector('.sr-live').textContent);
    want[f] = b;
    const shown = b.filter(c => !c.hidden).length;
    check(shown > 0 && live === `${shown} ${shown === 1 ? 'project' : 'projects'}`, `reduced motion, ${f}: ${shown} cards shown at once, announced as “${live}”`);
  }
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
// with motion
{
  const { browser, page, errors } = await open();
  await page.goto(BASE + 'work/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.gsap && window.Flip, null, { timeout: 8000 });
  await page.waitForTimeout(800);
  const before = await boxes(page);
  // on the way: every card that moves is seen between where it was and where it goes (sampled each frame for 1.2 s)
  const seen = await page.evaluate(() => new Promise(res => {
    const cards = [...document.querySelectorAll('[data-cards] .card[data-cat]')], out = [], t0 = performance.now();
    [...document.querySelectorAll('button[data-filter="build"]')].find(b => b.offsetParent).click();
    (function f() { out.push(cards.map(c => { const r = c.getBoundingClientRect(); return { href: c.getAttribute('href'), x: r.left, w: r.width }; })); if (performance.now() - t0 < 1200) requestAnimationFrame(f); else res(out); })();
  }));
  await page.waitForTimeout(600);
  const after = await boxes(page);
  const moving = want.build.filter(z => { const a = before.find(c => c.href === z.href); return !z.hidden && (Math.abs(a.x - z.x) > 4 || Math.abs(a.w - z.w) > 4); });
  const between = moving.filter(z => { const a = before.find(c => c.href === z.href); return seen.some(fr => { const m = fr.find(c => c.href === z.href), t = Math.abs(a.w - z.w) > 4 ? (m.w - a.w) / (z.w - a.w) : (m.x - a.x) / (z.x - a.x); return t > .05 && t < .95; }); });
  check(moving.length > 0 && between.length === moving.length, `build: the ${moving.length} cards that move are seen on their way, between their old and new places and sizes (${seen.length} frames)`);
  const same = after.every(c => { const z = want.build.find(w => w.href === c.href); return c.hidden === z.hidden && (c.hidden || (Math.abs(c.x - z.x) <= 1 && Math.abs(c.y - z.y) <= 1 && Math.abs(c.w - z.w) <= 1)); });
  check(same, 'build: the grid ends exactly where the instant change puts it');
  check(after.every(c => c.style === ''), `build: nothing is left in the cards' inline styles (${after.filter(c => c.style).map(c => c.style).join(' | ') || 'none'})`);
  // again while the cards are still moving: build, then all 200 ms later
  await page.evaluate(() => { const btn = f => [...document.querySelectorAll(`button[data-filter="${f}"]`)].find(b => b.offsetParent); btn('research').click(); setTimeout(() => btn('all').click(), 200); });
  await page.waitForTimeout(1600);
  const end = await boxes(page);
  const clean = end.every(c => { const z = want.all.find(w => w.href === c.href); return !c.hidden && Math.abs(c.x - z.x) <= 1 && Math.abs(c.y - z.y) <= 1 && Math.abs(c.w - z.w) <= 1 && c.style === ''; });
  check(clean, 'research, then all while moving: every card lands in its place, with nothing left in its styles');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
