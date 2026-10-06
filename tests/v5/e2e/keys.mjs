// Keyboard and pointer: Tab reaches every part of the room, the wheel over the room scrolls the window,
// a press lights a control's glass, and This fall keeps Groton's time.
import { open, BASE, check } from './lib.mjs';

const { browser, page, errors } = await open();
await page.goto(BASE + '?nohello', { waitUntil: 'load' });
await page.waitForTimeout(800);

const seen = new Set(), trail = [];
let hidden = 0;
for (let i = 0; i < 70; i++) {
  await page.keyboard.press('Tab');
  const f = await page.evaluate(() => {
    const a = document.activeElement;
    if (!a || a === document.body) return null;
    const where = a.closest('.skip') ? 'skip' : a.closest('nav.tabs') ? 'tabs' : a.closest('.toolbar') ? 'toolbar' : a.closest('aside.side') ? 'side' : a.closest('#main .win__body') ? (a.matches('.win__body') ? 'scroller' : 'content') : a.closest('#main') ? 'window' : 'other';
    let el = a, visible = true;
    while (el && el !== document.documentElement) { const s = getComputedStyle(el); if (s.opacity === '0' || s.visibility === 'hidden' || s.display === 'none') { visible = false; break; } el = el.parentElement; }
    return { where, visible, ring: getComputedStyle(a).outlineStyle !== 'none' || getComputedStyle(a).boxShadow !== 'none' };
  });
  if (!f) continue;
  seen.add(f.where); trail.push(f.where);
  if (!f.visible) hidden++;
}
check(trail[0] === 'skip', 'Tab starts at the skip link');
check(trail.slice(1, 7).every(t => t === 'tabs') && trail[7] !== 'tabs', 'the six tabs come next, before the window (the tab bar is first in the source)');
for (const part of ['scroller', 'content', 'tabs', 'toolbar']) check(seen.has(part), `Tab reaches the ${part}`);
check(hidden === 0, `focus never lands on something hidden (${hidden})`);

// the wheel over the bare room scrolls the main window
await page.evaluate(() => { document.querySelector('#main .win__body').scrollTop = 0; document.activeElement.blur(); });
await page.mouse.move(40, 870);
await page.mouse.wheel(0, 400);
await page.waitForTimeout(500);
check(await page.evaluate(() => document.querySelector('#main .win__body').scrollTop > 100), 'the wheel over the room scrolls the window');

// a press lights the toolbar's glass
const btn = await page.locator('.toolbar .btn').nth(1).boundingBox();
await page.mouse.move(btn.x + btn.width / 2, btn.y + btn.height / 2);
await page.mouse.down();
await page.waitForTimeout(250);
const lit = await page.evaluate(() => document.querySelector('.toolbar').glass.press);
await page.mouse.move(btn.x + btn.width / 2, btn.y - 80);           // slide off before letting go, so nothing opens
await page.mouse.up();
await page.waitForTimeout(700);
const out = await page.evaluate(() => document.querySelector('.toolbar').glass.press);
check(lit > .6 && out < .05, `a press lights the glass and lets it go (${lit.toFixed(2)}, then ${out.toFixed(2)})`);

check(/^\d{1,2}:\d{2}\s?(AM|PM) in Groton$/.test((await page.textContent('aside.side [data-clock]')).trim()), 'This fall keeps Groton’s time');
check(errors.length === 0, 'no console errors ' + errors.join(' | '));
await browser.close();
{
  // the Résumé's pinned chips (under 1360px): Tab scrolls each chip, ring and all, clear of the row's fades (opaque from
  // 14px to 100% - 30px; the ring reaches 5px past the chip). The browser leaves a partly hidden chip where it is.
  for (const [w, h] of [[1280, 800], [390, 844]]) {
    const { browser, page, errors } = await open({ width: w, height: h, noGL: true, reduced: true });
    await page.goto(BASE + 'resume/', { waitUntil: 'load' });
    await page.waitForTimeout(700);
    await page.evaluate(() => [...document.querySelectorAll('nav.tabs a')].pop().focus());
    const clear = [];
    for (let i = 0; i < 12 && clear.length < 8; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(60);
      const c = await page.evaluate(() => {
        const a = document.activeElement, row = a.closest('.side__part--pin .toc');
        if (!row) return null;
        const R = row.getBoundingClientRect(), r = a.getBoundingClientRect();
        return Math.min(r.left - (R.left + 14), (R.right - 30) - r.right);
      });
      if (c !== null) clear.push(c);
    }
    check(clear.length === 8 && Math.min(...clear) >= 5, `${w}: Tab keeps each of the ${clear.length} Sections chips clear of the row's fades (least ${Math.min(...clear).toFixed(0)}px)`);
    // a click on a chip half under the end fade still lands on it: the row does not scroll under a pressed pointer
    await page.goto(BASE + 'resume/', { waitUntil: 'load' });
    await page.waitForTimeout(700);
    const t = await page.evaluate(() => {
      const row = document.querySelector('.side__part--pin .toc'), R = row.getBoundingClientRect();
      const a = [...row.querySelectorAll('a')].find(a => { const c = a.getBoundingClientRect(); return c.left < R.right - 30 && c.right > R.right - 20; });
      return a && { hash: a.hash, x: R.right - 20, y: a.getBoundingClientRect().top + a.getBoundingClientRect().height / 2 };
    });
    if (t) { await page.mouse.click(t.x, t.y); await page.waitForTimeout(400); }
    const went = t && await page.evaluate(h => { const a = document.querySelector('.toc a[aria-current="true"]'); return !!a && a.hash === h; }, t.hash);
    check(went, `${w}: a click in a chip's faded end still jumps to its section (${t ? t.hash : 'no chip under the fade'})`);
    check(errors.length === 0, 'no console errors ' + errors.join(' | '));
    await browser.close();
  }
}
{
  // phones show each tab as an icon over its name; every tab keeps its name for screen readers, with and without scripts
  for (const js of [true, false]) {
    const { browser, page } = await open({ width: 390, height: 844, js });
    await page.goto(BASE + 'work/', { waitUntil: 'load' });
    const named = await Promise.all(['Home', 'Work', 'Hockey', 'About', 'Résumé'].map(n => page.getByRole('link', { name: n, exact: true }).count()));
    check(named.every(c => c >= 1), `phone ${js ? 'with' : 'without'} scripts: every tab has its name`);
    await browser.close();
  }
}
