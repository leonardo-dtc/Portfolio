// Layout modes: desktop floats the side windows in 3D, laptop folds them into the window, phone gets a bottom tab bar.
import { open, BASE, check } from './lib.mjs';

for (const [w, h, mode] of [[1440, 900, 'desktop'], [1280, 800, 'laptop'], [1024, 768, 'laptop'], [390, 844, 'phone']]) {
  const { browser, page, errors } = await open({ width: w, height: h });
  await page.goto(BASE + '?nohello', { waitUntil: 'load' });
  await page.waitForTimeout(1300);
  check(await page.evaluate(() => document.documentElement.dataset.mode) === mode, `${w}: mode ${mode}`);
  const sidesOut = await page.evaluate(() => [...document.querySelectorAll('aside.side')].every(a => a.parentElement.matches('[data-space]')));
  check(sidesOut === (mode === 'desktop'), `${w}: side windows ${mode === 'desktop' ? 'float in the room' : 'sit inside the window'}`);
  if (mode === 'desktop') {
    const t = await page.evaluate(() => getComputedStyle(document.querySelector('aside[data-side="left"]')).transform);
    check(t.startsWith('matrix3d'), `${w}: the left window is turned in 3D`);
    const hb = await page.evaluate(() => { const t = document.querySelector('nav.tabs'); t.dispatchEvent(new PointerEvent('pointerenter')); return new Promise(r => setTimeout(() => r(t.classList.contains('is-open')), 400)); });
    check(hb, `${w}: the tab bar opens when pointed at`);
  }
  if (mode === 'phone') {
    const r = await page.evaluate(() => { const b = document.querySelector('nav.tabs').getBoundingClientRect(); return b.bottom > innerHeight - 80 && b.width > innerWidth * .7; });
    check(r, `${w}: the tabs are a bottom bar`);
  }
  const bubble = await page.evaluate(() => { const b = document.querySelector('.tabs__bubble').getBoundingClientRect(), a = document.querySelector('nav.tabs a[aria-current="page"]').getBoundingClientRect(); return Math.abs((b.top + b.bottom) / 2 - (a.top + a.bottom) / 2) < 3 && Math.abs((b.left + b.right) / 2 - (a.left + a.right) / 2) < 3; });
  check(bubble, `${w}: the bubble sits on the current tab`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  check(!overflow, `${w}: no sideways overflow`);
  check(errors.length === 0, `${w}: no console errors ${errors.join(' | ')}`);
  await browser.close();
}
