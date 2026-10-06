// The hero's apps and the ways past it (T26, T27, T34, T39, T41): every app is a link to its page, and choosing one
// lands on that page's window with the tab bubble on its tab, without passing through Home; Return on an app opens
// it; a scroll, a swipe up, Down, Page Down or Space enter Home; the design toggles (toggles.js) change the hero
// while it shows, from the console, the address or the attribute on <html>, and a change is kept only in this browser.
import { open, BASE, check } from './lib.mjs';

const ready = (page) => page.waitForFunction(() => document.querySelector('.hero.is-ready'), null, { timeout: 8000 }).then(() => true, () => false);
const done = (page, ms = 10000) => page.waitForFunction(() => window.__hero && window.__hero.state === 'done', null, { timeout: ms }).then(() => true, () => false);
const fresh = async (opts = {}, q = '') => { const o = await open(opts); await o.page.goto(BASE + q, { waitUntil: 'load' }); await ready(o.page); await o.page.waitForTimeout(600); return o; };

{
  // the default: the name, one line of who I am, and six apps as round glass icons, each a real link, no numbers
  const { browser, page, errors, foreign } = await fresh();
  const hero = await page.evaluate(() => {
    const apps = [...document.querySelectorAll('.hero .app')];
    return {
      line: document.querySelector('.hero__line').textContent, lineShown: getComputedStyle(document.querySelector('.hero__line')).display !== 'none',
      apps: apps.map(a => [a.querySelector('.app__name').textContent, a.href.replace(new URL('.', location.href).href, '')]),
      shown: apps.every(a => { const r = a.getBoundingClientRect(); return r.width > 40 && r.height > 40 && getComputedStyle(a).visibility !== 'hidden'; }),
      digits: apps.some(a => /\d/.test(a.innerText)), label: document.querySelector('.apps').getAttribute('aria-label'),
      toggles: { ...document.documentElement.dataset }, name: document.querySelector('.hero__name').getBoundingClientRect().bottom,
      below: document.querySelector('.hero__below').getBoundingClientRect().top, hint: document.querySelector('.hero__hint').getBoundingClientRect().top,
      appsBottom: Math.max(...apps.map(a => a.getBoundingClientRect().bottom)),
    };
  });
  check(hero.toggles.heroName === 'neon' && hero.toggles.heroContent === 'both' && hero.toggles.launcher === 'icons', `the defaults: ${hero.toggles.heroName}, ${hero.toggles.heroContent}, ${hero.toggles.launcher}`);
  check(hero.lineShown && hero.line === 'Goaltender at Groton\u00a0School, Class\u00a0of\u00a02028.', `the line under the name, the school and the class year each kept together: “${hero.line}”`);
  check(JSON.stringify(hero.apps) === JSON.stringify([['Work', 'work/'], ['Hockey', 'hockey/'], ['About', 'about/'], ['Résumé', 'resume/'], ['Archive', 'archive/'], ['Write to me', 'mailto:leonardo.dtc2009@gmail.com']]), `six apps, each a link: ${hero.apps.map(a => a[0]).join(', ')}`);
  check(hero.shown && !hero.digits && hero.label === 'Go straight to', 'every app shows with its name, and none shows a number');
  check(hero.below > hero.name && hero.appsBottom < hero.hint - 16, `the group sits under the name (${hero.name.toFixed(0)} to ${hero.below.toFixed(0)}) and clear of the hint (${hero.appsBottom.toFixed(0)} to ${hero.hint.toFixed(0)})`);
  // the apps take the colour style: Rose turns their tint
  const tint = () => page.evaluate(() => getComputedStyle(document.querySelector('.app__art')).backgroundColor + ' ' + getComputedStyle(document.documentElement).getPropertyValue('--style'));
  const before = await tint();
  await page.evaluate(() => { document.querySelector('.hue__button').click(); document.querySelector('[data-preset="rose"]').click(); document.querySelector('.hue__button').click(); });
  await page.waitForTimeout(1200);
  check((await tint()) !== before, 'the apps take the colour style (Rose turns them)');
  // Tab reaches the title, then each app in order (from the top of the page: the skip link)
  await page.evaluate(() => document.querySelector('.skip').focus());
  const order = [];
  for (let i = 0; i < 7; i++) { await page.keyboard.press('Tab'); order.push(await page.evaluate(() => document.activeElement.className + ':' + (document.activeElement.dataset.app || ''))); }
  const ai = order.findIndex(o => o.startsWith('app:work'));
  check(order.some(o => o.startsWith('hero__name')) && ai >= 0 && order.slice(ai, ai + 5).map(o => o.split(':')[1]).join(',') === 'work,hockey,about,resume,write', `Tab reaches the title and every app in order (${order.join(' ')})`);
  // Return on Hockey opens Hockey, straight from the hero
  while (!(await page.evaluate(() => document.activeElement.dataset.app === 'hockey'))) await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Enter');
  check(await done(page), 'Return on an app enters');
  const there = await page.evaluate(() => ({ path: location.pathname, h1: document.querySelector('#main h1').textContent, tab: document.querySelector('.tabs a[aria-current="page"]') && document.querySelector('.tabs a[aria-current="page"]').dataset.tab, kind: document.documentElement.dataset.page, focus: !!document.activeElement.closest('#main'), main: getComputedStyle(document.getElementById('main')).opacity, hero: getComputedStyle(document.querySelector('.hero')).display, ink: window.__room ? window.__room.state.ink : null, stage: window.__room ? window.__room.state.stage : 0, defocus: window.__room ? window.__room.state.defocus : 0, bars: document.querySelectorAll('.space > .toolbar').length, chosen: document.querySelectorAll('.app.is-chosen').length, launching: document.documentElement.classList.contains('is-launching') }));
  check(/\/hockey\/$/.test(there.path) && there.kind === 'hockey' && /goaltender/.test(there.h1), `it lands on Hockey's window (${there.path}, “${there.h1}”)`);
  check(there.focus && there.main === '1' && there.hero === 'none' && there.ink === null && there.stage === 0, 'its window is in, focus is in it, and the hero, the stage and the light are gone');
  await page.waitForFunction(() => !window.__room || window.__room.state.defocus < .02, null, { timeout: 4000 }).catch(() => {});
  check(there.bars === 1 && there.chosen === 0 && !there.launching, `one toolbar, Hockey's, and nothing of the launch is left (${there.bars} toolbars)`);
  await page.waitForTimeout(400);
  const bubble = await page.evaluate(() => { const b = document.querySelector('.tabs__bubble').getBoundingClientRect(), t = document.querySelector('.tabs a[data-tab="hockey"]').getBoundingClientRect(); return Math.abs((b.left + b.width / 2) - (t.left + t.width / 2)) + Math.abs((b.top + b.height / 2) - (t.top + t.height / 2)); });
  check(bubble < 4, `the tab bubble is on Hockey (${bubble.toFixed(1)} px off)`);
  await page.goBack();
  await page.waitForTimeout(900);
  check(await page.evaluate(() => /\/v5\/$/.test(location.pathname) && !document.documentElement.classList.contains('is-hello') && document.querySelector('#main h1.name') !== null), 'Back returns to Home, without the hero');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  check(foreign.length === 0, 'nothing from another site ' + foreign.join(' '));
  await browser.close();
}
{
  // a click on each page's app lands on it; Write to me leaves the hero up (the mail app opens)
  for (const [app, path, title] of [['work', /\/work\/$/, /^Work$/], ['about', /\/about\/$/, /I read the play/], ['resume', /\/resume\/$/, /^Résumé$/]]) {
    const { browser, page, errors } = await fresh();
    await page.click(`.app[data-app="${app}"]`);
    const ok = await done(page);
    const at = await page.evaluate(() => ({ path: location.pathname, h1: document.querySelector('#main h1').textContent }));
    check(ok && path.test(at.path) && title.test(at.h1) && errors.length === 0, `${app}: a click lands on its window (${at.path}, “${at.h1}”)${errors.length ? ' ' + errors.join(' | ') : ''}`);
    await browser.close();
  }
  const { browser, page } = await fresh();
  await page.evaluate(() => document.querySelector('.app[data-app="write"]').addEventListener('click', e => e.preventDefault()));   // no mail app here
  await page.click('.app[data-app="write"]');
  await page.waitForTimeout(500);
  check(await page.evaluate(() => window.__hero.state === 'hero' && document.documentElement.classList.contains('is-hello')), 'Write to me opens mail and the hero stays');
  await browser.close();
}
{
  // T26: a scroll, Down, Page Down and Space enter Home; a stray nudge of the wheel does not
  const ways = [
    ['a scroll', async p => { await p.mouse.move(700, 700); await p.mouse.wheel(0, 400); }],
    ['Down', p => p.keyboard.press('ArrowDown')],
    ['Page Down', p => p.keyboard.press('PageDown')],
    ['Space', p => p.keyboard.press(' ')],
  ];
  for (const [what, act] of ways) {
    const { browser, page, errors } = await fresh();
    if (what === 'a scroll') { await page.mouse.move(700, 700); await page.mouse.wheel(0, 12); await page.waitForTimeout(500); check(await page.evaluate(() => window.__hero.state === 'hero'), 'a nudge of the wheel does not enter'); }
    else await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await act(page);
    const ok = await done(page);
    check(ok && await page.evaluate(() => /\/v5\/$/.test(location.pathname) && getComputedStyle(document.querySelector('#main h1.name')).opacity === '1'), `${what} enters Home${errors.length ? ' ' + errors.join(' | ') : ''}`);
    await browser.close();
  }
  // a swipe up on a phone enters; a sideways swipe does not
  const { browser, page, errors } = await fresh({ width: 390, height: 844, touch: true });
  const swipe = (dx, dy) => page.evaluate(([dx, dy]) => {
    const t = (x, y) => new Touch({ identifier: 1, target: document.body, clientX: x, clientY: y });
    dispatchEvent(new TouchEvent('touchstart', { touches: [t(200, 600)], bubbles: true }));
    for (let i = 1; i <= 6; i++) dispatchEvent(new TouchEvent('touchmove', { touches: [t(200 + dx * i / 6, 600 - dy * i / 6)], bubbles: true }));
    dispatchEvent(new TouchEvent('touchend', { touches: [], bubbles: true }));
  }, [dx, dy]);
  await swipe(160, 30);
  await page.waitForTimeout(400);
  check(await page.evaluate(() => window.__hero.state === 'hero'), 'a sideways swipe does not enter');
  await swipe(0, 160);
  check(await done(page), `a swipe up enters${errors.length ? ' ' + errors.join(' | ') : ''}`);
  await browser.close();
}
{
  // the toggles: from the address (for that visit only), the console and the attribute (kept in this browser); each
  // changes the hero while it shows; a value a toggle does not take is refused; reset returns the defaults
  const { browser, page, errors } = await fresh({}, '?toggles=launcher:widgets,heroContent:c');
  let st = await page.evaluate(() => ({ ...document.documentElement.dataset, kept: localStorage.getItem('v5:toggles'), lineShown: getComputedStyle(document.querySelector('.hero__line')).display !== 'none', grid: getComputedStyle(document.querySelector('.apps')).display }));
  check(st.launcher === 'widgets' && st.heroContent === 'apps' && !st.lineShown && st.grid === 'grid', `the address sets toggles, a letter included (T27 c is ${st.heroContent}; the apps as ${st.launcher})`);
  check(!JSON.parse(st.kept || '{}').launcher, 'for that visit only: a link with ?toggles= is not kept in this browser', st.kept);
  const y0 = await page.evaluate(() => document.querySelector('.hero__name').getBoundingClientRect().top);
  await page.evaluate(() => { window.toggles.heroContent = 'name'; });
  await page.waitForTimeout(300);
  st = await page.evaluate(() => ({ below: getComputedStyle(document.querySelector('.hero__below')).display, top: document.querySelector('.hero__name').getBoundingClientRect().top, y: getComputedStyle(document.querySelector('.hero')).getPropertyValue('--name-y') }));
  check(st.below === 'none' && st.top > y0 + 20 && st.y === '', `toggles.heroContent = 'name' leaves only the name, back in its own place (${y0.toFixed(0)} to ${st.top.toFixed(0)})`);
  check(JSON.parse(await page.evaluate(() => localStorage.getItem('v5:toggles')) || '{}').heroContent === 'name', 'a change from the console is kept in this browser');
  await page.evaluate(() => { window.toggles.T39 = 'c'; window.toggles.heroContent = 'both'; });
  await page.waitForTimeout(300);
  st = await page.evaluate(() => { const a = document.querySelector('.apps').getBoundingClientRect(); return { launcher: document.documentElement.dataset.launcher, right: innerWidth - a.right, top: a.top, pos: getComputedStyle(document.querySelector('.apps')).position }; });
  check(st.launcher === 'desktop' && st.pos === 'fixed' && st.right < 40 && st.top < 60, `toggles.T39 = 'c' lays the apps down the right edge like a Mac desktop (${st.right.toFixed(0)} px from the edge)`);
  await page.evaluate(() => document.documentElement.setAttribute('data-launcher', 'library'));
  await page.waitForTimeout(300);
  st = await page.evaluate(() => ({ launcher: window.toggles.launcher, kept: JSON.parse(localStorage.getItem('v5:toggles') || '{}').launcher, ratio: (() => { const r = document.querySelector('.app__art').getBoundingClientRect(); return r.height / r.width; })() }));
  check(st.launcher === 'library' && st.kept === 'library' && Math.abs(st.ratio - 1.5) < .05, `an edit to the attribute counts too: the library's covers stand 2:3 (${st.ratio.toFixed(2)})`);
  const warned = [];
  page.on('console', m => { if (m.type() === 'warning') warned.push(m.text()); });
  await page.evaluate(() => { window.toggles.launcher = 'carousel'; document.documentElement.setAttribute('data-hero-name', 'chrome'); });
  await page.waitForTimeout(300);
  st = await page.evaluate(() => ({ launcher: window.toggles.launcher, name: document.documentElement.dataset.heroName }));
  check(st.launcher === 'library' && st.name === 'neon' && warned.length === 2, `a value a toggle does not take is refused, with a note of what it takes (${warned.length} notes)`);
  // the glass look while the hero shows: no stage, the shader's glass, and back
  await page.evaluate(() => { window.toggles.heroName = 'glass'; });
  await page.waitForTimeout(500);
  st = await page.evaluate(() => ({ stage: window.__room ? window.__room.state.stage : 0, mode: window.__hero.ink.mode }));
  check(st.stage === 0 && st.mode === 1, `the glass name stands in the lit room (stage ${st.stage}, ink mode ${st.mode})`);
  await page.evaluate(() => { window.toggles.heroName = 'neon'; });
  await page.waitForTimeout(500);
  st = await page.evaluate(() => ({ stage: window.__room ? window.__room.state.stage : 1, mode: window.__hero.ink.mode, day: window.__room ? window.__room.state.day : 0 }));
  check(st.mode === 0 && (st.stage === 1 || !!st.day), `and the neon stands on its stage again (stage ${st.stage}, ink mode ${st.mode})`);
  await page.evaluate(() => window.toggles.reset());
  st = await page.evaluate(() => ({ ...document.documentElement.dataset, kept: localStorage.getItem('v5:toggles') }));
  check(st.heroName === 'neon' && st.heroContent === 'both' && st.launcher === 'icons' && st.kept === null, 'toggles.reset() returns every toggle to its default and forgets them');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  // every style and look, at a laptop and a phone: the apps fit on the screen, clear of the hint and the color
  // control, and no text is under 12 px
  for (const [w, h] of [[1280, 720], [390, 844]]) {
    for (const launcher of ['icons', 'library', 'widgets', 'desktop']) {
      const { browser, page, errors } = await fresh({ width: w, height: h, touch: w < 700 }, `?toggles=launcher:${launcher},heroName:${launcher === 'icons' || launcher === 'widgets' ? 'neon' : 'glass'}`);
      const m = await page.evaluate(() => {
        const vis = el => { const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden'; };
        const apps = [...document.querySelectorAll('.hero .app')].filter(vis).map(a => a.getBoundingClientRect());
        const hint = document.querySelector('.hero__hint span:not([style*="none"])'), hue = document.querySelector('.hue__button');
        const hr = [...document.querySelectorAll('.hero__hint span')].filter(vis)[0].getBoundingClientRect(), ur = hue ? hue.getBoundingClientRect() : null;
        const over = (a, b) => b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
        const small = [...document.querySelectorAll('.hero__below *, .hero .app *')].filter(e => vis(e) && e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 12).length;
        const name = document.querySelector('.hero__name').getBoundingClientRect();
        return { n: apps.length, inside: apps.every(r => r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight), clear: apps.every(r => !over(r, hr) && !over(r, ur) && !over(r, name)), small };
      });
      check(m.n === 6 && m.inside && m.clear && m.small === 0, `${launcher} at ${w}x${h}: six apps on screen, clear of the name, the hint and the color control, no text under 12 px${errors.length ? ' ' + errors.join(' | ') : ''}`);
      await browser.close();
    }
  }
}
{
  // without WebGL the hero is CSS: the apps work the same, and the glass look shows the CSS glass name
  const { browser, page, errors } = await (async () => { const o = await open({ noGL: true }); await o.page.goto(BASE + '?toggles=heroName:glass', { waitUntil: 'load' }); await ready(o.page); await o.page.waitForTimeout(1200); return o; })();
  const css = await page.evaluate(() => ({ neon: getComputedStyle(document.querySelector('.hero__neon')).display, clip: getComputedStyle(document.querySelector('.hero__text')).backgroundClip, stage: getComputedStyle(document.querySelector('.hero'), '::after').backgroundColor }));
  check(css.neon === 'none' && /text/.test(css.clip) && /rgba\(0, 0, 0, 0\)|transparent/.test(css.stage), `without WebGL the glass look is the CSS glass name over the still, with no stage (${css.stage})`);
  await page.click('.app[data-app="about"]');
  check(await done(page) && await page.evaluate(() => /\/about\/$/.test(location.pathname)), `and an app still lands on its page${errors.length ? ' ' + errors.join(' | ') : ''}`);
  await browser.close();
}
{
  // the design toggles' panel (?dev, toggles.js): every toggle as buttons, the one in use pressed; a press switches the
  // hero's title while it shows; Space and Return work its buttons, never the hero's way in; folded, it stays folded in
  // this browser; Close forgets it; with no ?dev and nothing kept, there is none
  const { browser, page, errors } = await fresh({ width: 390, height: 844, touch: true, dpr: 3 }, '?dev');
  const st = () => page.evaluate(() => ({ panel: !!document.querySelector('.devtoggles'), pressed: [...document.querySelectorAll('.devtoggles [aria-pressed="true"]')].map(b => b.dataset.value).join(), name: document.documentElement.dataset.heroName, hero: window.__hero.state, meter: (document.querySelector('.devtoggles__meter') || {}).textContent || '' }));
  const s0 = await st();
  await page.click('.devtoggles button[data-value="glass"]'); await page.waitForTimeout(400);
  const s1 = await st();
  await page.focus('.devtoggles button[data-value="neon"]'); await page.keyboard.press(' '); await page.waitForTimeout(300);
  await page.focus('.devtoggles button[data-value="line"]'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  const s2 = await st();
  check(s0.panel && s0.pressed === 'neon,both,icons,standard' && s1.name === 'glass' && s1.pressed.startsWith('glass,') && s2.name === 'neon' && s2.pressed === 'neon,line,icons,standard' && s2.hero === 'hero', `?dev: the panel shows every toggle, the one in use pressed; a press switches the title while the hero shows, and Space and Return work its buttons, not the hero's way in (${s2.pressed}, hero ${s2.hero})`);
  // the room's resolution: 1.5 times the screen's pixels at most, 2 with the test toggle (a 3x phone), and the readout
  const res = async () => page.evaluate(() => ({ dpr: window.__room.dpr, w: document.querySelector('canvas.room').width, slow: window.__room.slow }));
  check(/^The room: /.test(s2.meter), `the panel reads the room as it draws (“${s2.meter}”)`);
  const r0 = await res();
  if (r0.slow) console.log('skip: the room is held at 1x here (too slow a renderer), so its resolution test cannot be judged');
  else {
    await page.click('.devtoggles button[data-value="sharp"]'); await page.waitForTimeout(900);
    const r1 = await res();
    check(r0.dpr === 1.5 && r0.w === 585 && r1.dpr === 2 && r1.w === 780, `the room's resolution: ${r0.dpr}x (${r0.w}px across) as built, ${r1.dpr}x (${r1.w}px) with the test toggle`);
  }
  await page.click('.devtoggles__fold'); await page.waitForTimeout(200);
  await page.goto(BASE, { waitUntil: 'load' }); await ready(page); await page.waitForTimeout(300);
  const folded = await page.evaluate(() => ({ panel: !!document.querySelector('.devtoggles'), hidden: document.getElementById('devtoggles-body').hidden, exp: document.querySelector('.devtoggles__fold').getAttribute('aria-expanded') }));
  await page.click('.devtoggles__fold'); await page.click('.devtoggles__close'); await page.waitForTimeout(200);
  await page.goto(BASE, { waitUntil: 'load' }); await ready(page); await page.waitForTimeout(300);
  const closed = await page.evaluate(() => ({ panel: !!document.querySelector('.devtoggles'), kept: localStorage.getItem('v5:dev') }));
  check(folded.panel && folded.hidden && folded.exp === 'false' && !closed.panel && closed.kept === null, `folded, the panel stays folded in this browser (without ?dev); Close forgets it (${JSON.stringify({ folded, closed })})`);
  check(errors.length === 0, 'the panel: no console errors ' + errors.join(' | '));
  await page.evaluate(() => window.toggles.reset());
  await browser.close();
}
