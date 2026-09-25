// Keyboard and pointer: Tab reaches every part of the room, the wheel over the room scrolls the window,
// a press lights a control's glass, and the Now window keeps Groton's time.
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

check(/^\d{1,2}:\d{2}\s?(AM|PM), Eastern time$/.test((await page.textContent('[data-clock]')).trim()), 'the Now window keeps Groton’s time');
check(errors.length === 0, 'no console errors ' + errors.join(' | '));
await browser.close();
{
  // phones show the tabs as icons; each keeps its name for screen readers, with and without scripts
  for (const js of [true, false]) {
    const { browser, page } = await open({ width: 390, height: 844, js });
    await page.goto(BASE + 'work/', { waitUntil: 'load' });
    const named = await Promise.all(['Home', 'Work', 'Hockey', 'About', 'Résumé'].map(n => page.getByRole('link', { name: n, exact: true }).count()));
    check(named.every(c => c >= 1), `phone ${js ? 'with' : 'without'} scripts: every tab has its name`);
    await browser.close();
  }
}
