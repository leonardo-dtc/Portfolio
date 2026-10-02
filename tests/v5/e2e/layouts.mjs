// Layout modes: desktop floats one side window in 3D beside the main window, with the tab bar just off the window's
// left edge and the three read as one centred group; laptop folds the side window into the main one; phones get a
// bottom tab bar.
import { open, BASE, check } from './lib.mjs';

for (const [w, h, mode] of [[1360, 768, 'desktop'], [1440, 900, 'desktop'], [1680, 1050, 'desktop'], [1920, 1080, 'desktop'], [1280, 800, 'laptop'], [1024, 768, 'laptop'], [390, 844, 'phone']]) {
  const { browser, page, errors } = await open({ width: w, height: h });
  await page.goto(BASE + '?nohello', { waitUntil: 'load' });
  await page.waitForTimeout(1300);
  check(await page.evaluate(() => document.documentElement.dataset.mode) === mode, `${w}: mode ${mode}`);
  check(await page.evaluate(() => document.querySelectorAll('aside.side').length) === 1, `${w}: one side window`);
  const sidesOut = await page.evaluate(() => [...document.querySelectorAll('aside.side')].every(a => a.parentElement.matches('[data-space]')));
  check(sidesOut === (mode === 'desktop'), `${w}: the side window ${mode === 'desktop' ? 'floats in the room' : 'sits inside the window'}`);
  if (mode !== 'phone') {
    const g = await page.evaluate(() => { const t = document.querySelector('nav.tabs').getBoundingClientRect(), m = document.getElementById('main').getBoundingClientRect(); return { gap: m.left - t.right, dy: Math.abs((t.top + t.bottom) / 2 - (m.top + m.bottom) / 2) }; });
    check(Math.abs(g.gap - 14) < 1.5 && g.dy < 2, `${w}: the tab bar sits ${g.gap.toFixed(1)}px off the window's left edge, centred on it`);
  }
  if (mode === 'desktop') {
    const t = await page.evaluate(() => getComputedStyle(document.querySelector('aside.side')).transform);
    check(t.startsWith('matrix3d'), `${w}: the side window is turned in 3D`);
    // the group's outline: from the tab bar's left edge to the side window's far edge (its projected corners)
    const m = await page.evaluate(() => { const xs = [...document.querySelectorAll('aside.side > .probe')].map(p => p.getBoundingClientRect().left); return { l: document.querySelector('nav.tabs').getBoundingClientRect().left, r: innerWidth - Math.max(...xs) }; });
    const limit = w < 1460 ? 48 : 4;    // under about 1460px the opened tab bar needs the room on the left
    check(Math.abs(m.l - m.r) <= limit, `${w}: the group is centred (margins ${m.l.toFixed(0)} and ${m.r.toFixed(0)})`);
    // the tab bar opens to the left, its right edge staying put, and never covers the window
    const right0 = await page.evaluate(() => document.querySelector('nav.tabs').getBoundingClientRect().right);
    await page.evaluate(() => document.querySelector('nav.tabs').dispatchEvent(new PointerEvent('pointerenter')));
    const opened = await page.waitForFunction(() => document.querySelector('nav.tabs').getBoundingClientRect().width > 187, null, { timeout: 4000 }).then(() => true, () => false);
    const o = await page.evaluate(() => { const t = document.querySelector('nav.tabs').getBoundingClientRect(), m = document.getElementById('main').getBoundingClientRect(), b = document.querySelector('.tabs__bubble').getBoundingClientRect(); return { right: t.right, left: t.left, main: m.left, bubble: b.width }; });
    check(opened && Math.abs(o.right - right0) < 1 && o.right <= o.main - 13 && o.left >= 11, `${w}: the tab bar opens leftward to 188px, clear of the window (${o.left.toFixed(0)} to ${o.right.toFixed(0)}, window at ${o.main.toFixed(0)})`);
    check(o.bubble > 160, `${w}: the bubble widens with it`);
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
