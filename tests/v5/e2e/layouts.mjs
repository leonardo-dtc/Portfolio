// Layout modes: desktop floats one side window in 3D beside the main window, with the tab bar just off the window's
// left edge, its names showing, and the three read as one centred group; laptop folds the side window into the main
// one, placed by its role; phones get a bottom tab bar with a name under each icon.
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
    check(Math.abs(m.l - m.r) <= 4, `${w}: the group is centred (margins ${m.l.toFixed(0)} and ${m.r.toFixed(0)})`);
    // the tab bar shows its names at rest (188px), its right edge 14px off the window, and pointing at it keeps it so
    const rest = await page.evaluate(() => ({ w: document.querySelector('nav.tabs').getBoundingClientRect().width, shown: [...document.querySelectorAll('.tabs__label')].every(l => +getComputedStyle(l).opacity === 1) }));
    check(rest.w > 187 && rest.shown, `${w}: the tab bar shows its names at rest (${rest.w.toFixed(0)}px)`);
    const right0 = await page.evaluate(() => document.querySelector('nav.tabs').getBoundingClientRect().right);
    await page.evaluate(() => document.querySelector('nav.tabs').dispatchEvent(new PointerEvent('pointerenter')));
    const opened = await page.waitForFunction(() => document.querySelector('nav.tabs').getBoundingClientRect().width > 187, null, { timeout: 4000 }).then(() => true, () => false);
    const o = await page.evaluate(() => { const t = document.querySelector('nav.tabs').getBoundingClientRect(), m = document.getElementById('main').getBoundingClientRect(), b = document.querySelector('.tabs__bubble').getBoundingClientRect(); return { right: t.right, left: t.left, main: m.left, bubble: b.width }; });
    check(opened && Math.abs(o.right - right0) < 1 && o.right <= o.main - 13 && o.left >= 11, `${w}: pointed at, it stays 188px wide, clear of the window (${o.left.toFixed(0)} to ${o.right.toFixed(0)}, window at ${o.main.toFixed(0)})`);
    check(o.bubble > 160, `${w}: the bubble spans the labelled tab`);
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

// Laptops: from 946px the tab bar shows its names at rest, and it and the window are centred as one group; narrower,
// with a pointer, it shows icons until pointed at or focused; touch screens keep the names (the window makes room).
for (const [w, h, touch, named] of [[1280, 800, false, true], [1024, 620, false, true], [944, 700, false, false], [1024, 768, true, true], [900, 700, true, true]]) {
  const { browser, page, errors } = await open({ width: w, height: h, touch });
  await page.goto(BASE + 'hockey/', { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  const r = await page.evaluate(() => { const t = document.querySelector('nav.tabs').getBoundingClientRect(), m = document.getElementById('main').getBoundingClientRect(); return { l: t.left, gap: m.left - t.right, right: innerWidth - m.right, shown: [...document.querySelectorAll('.tabs__label')].every(l => +getComputedStyle(l).opacity === 1) }; });
  const what = `${w}${touch ? ' touch' : ''}`;
  check(r.shown === named, `${what}: the tab names ${named ? 'show at rest' : 'wait for the pointer or focus'}`);
  if (named) check(r.l >= 11.5 && Math.abs(r.gap - 14) < 1.5 && Math.abs(r.l - r.right) <= 2, `${what}: the labelled bar fits, 14px off the window, the two centred (margins ${r.l.toFixed(0)} and ${r.right.toFixed(0)})`);
  check(errors.length === 0, `${what}: no console errors ${errors.join(' | ')}`);
  await browser.close();
}

// Under 1360px the side window goes where it serves: Hockey's Measurables and coach contacts first, About's portrait
// first and its Interests last, the Résumé's Sections as chips pinned under the window's head, Home's This fall last.
for (const [w, h] of [[1024, 620], [390, 844], [320, 640]]) {
  const { browser, page, errors } = await open({ width: w, height: h });
  const at = async (path) => {
    await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(700);
    return page.evaluate(() => {
      const body = document.querySelector('#main .win__body'), top = el => el && Math.round(el.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop);
      const pin = document.querySelector('#main > .side__part--pin');
      return { first: body.firstElementChild.matches('aside.side'), last: body.lastElementChild.matches('aside.side, .side__part'), measure: top(document.getElementById('measure-h')), coaches: top(document.getElementById('coaches-h')), interests: top(document.getElementById('likes-h')), essay: top(body.querySelector('aside.side ~ *')), pinned: !!pin && pin.nextElementSibling === body && !!pin.querySelector('.toc') };
    });
  };
  const hockey = await at('hockey/');
  check(hockey.first && hockey.measure < 40 && hockey.coaches < 700, `${w}: Hockey's Measurables start ${hockey.measure}px into the window and coach contacts ${hockey.coaches}px`);
  const about = await at('about/');
  check(about.first && about.last && about.interests > about.essay, `${w}: About's portrait comes first and its Interests last`);
  const resume = await at('resume/');
  check(resume.pinned && resume.last, `${w}: the Résumé's Sections are chips pinned under the head, Contact last`);
  const home = await at('?nohello');
  check(!home.first && home.last, `${w}: Home's This fall comes last`);
  if (w < 900) {
    const d = await page.evaluate(() => [...document.querySelectorAll('nav.tabs a')].map(a => { const r = a.getBoundingClientRect(), l = a.querySelector('.tabs__label'), lr = l.getBoundingClientRect(); return { w: r.width, fs: parseFloat(getComputedStyle(l).fontSize), op: +getComputedStyle(l).opacity, fits: lr.left >= r.left - .5 && lr.right <= r.right + .5 }; }));
    check(d.every(t => t.w >= 44 && t.fs >= 12 && t.op === 1 && t.fits), `${w}: each tab shows its name at 12px or more, every tab 44px or wider (narrowest ${Math.min(...d.map(t => t.w)).toFixed(1)})`);
  }
  check(errors.length === 0, `${w}: no console errors ${errors.join(' | ')}`);
  await browser.close();
}
