// Preferences and media: reduced motion, scripts off, print.
import { open, BASE, PAGES, check } from './lib.mjs';

{
  const { browser, page } = await open({ reduced: true });
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__hero && window.__hero.ink.on === 1, null, { timeout: 1500 }).then(() => check(true, 'reduced motion: the name is shown at once'), () => check(false, 'reduced motion: the name is shown at once'));
  await page.waitForTimeout(1600);                                   // past the room's 1.5 s start-up at full rate
  const t = await page.evaluate(async () => { const f0 = window.__roomFrames; await new Promise(r => setTimeout(r, 1500)); return { frames: window.__roomFrames - f0 }; });
  check(t.frames < 10, `reduced motion: the room stops redrawing when nothing moves (${t.frames} frames in 1.5 s)`);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const moved = await page.evaluate(() => getComputedStyle(document.querySelector('.space')).translate);
  await page.mouse.move(100, 100); await page.mouse.move(1300, 800);
  await page.waitForTimeout(300);
  check(await page.evaluate(m => getComputedStyle(document.querySelector('.space')).translate === m && window.__room.state.shift.every(v => v === 0), moved), 'reduced motion: nothing leans with the pointer');
  // transitions only fade or change colour: the tab bubble, the bar's width and a sheet's parent jump to their places
  const props = await page.evaluate(() => ['.tabs__bubble', 'nav.tabs', '#main', '.tabs__label'].map(s => getComputedStyle(document.querySelector(s)).transitionProperty).join(', '));
  check(!/\b(all|transform|translate|scale|width|right|left|top)\b/.test(props) && await page.evaluate(() => getComputedStyle(document.querySelector('.tabs__label')).translate === 'none'), `reduced motion: nothing slides, zooms or stretches (${[...new Set(props.split(', '))].join(', ')})`);
  await browser.close();
}
{
  // windows stay where they are when the pointer moves (only the light follows it, and the room leans behind them)
  const { browser, page } = await open();
  await page.goto(BASE + '?nohello', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  const at = () => page.evaluate(() => [document.getElementById('main'), document.querySelector('aside.side'), document.querySelector('nav.tabs')].map(e => { const r = e.getBoundingClientRect(); return [r.left, r.top].map(v => v.toFixed(1)).join(','); }).join(' ') + ' ' + getComputedStyle(document.querySelector('.space')).translate + ' ' + getComputedStyle(document.querySelector('.space')).perspectiveOrigin);
  const before = await at();
  await page.mouse.move(60, 60); await page.waitForTimeout(500); await page.mouse.move(1380, 840); await page.waitForTimeout(900);
  check(await at() === before, 'the windows do not move with the pointer');
  check(await page.evaluate(() => Math.abs(window.__room.state.shift[0]) > .001), 'the room behind them leans a little');
  await browser.close();
}
{
  const { browser, page } = await open({ js: false });
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: 'load' });
    check(await page.locator('#main h1').isVisible(), `no-JS ${p || 'home'}: title visible`);
    check(!(await page.locator('.hero').isVisible()), `no-JS ${p || 'home'}: no hero`);
  }
  await browser.close();
}
{
  const { browser, page, errors } = await open();
  const pages = async (path) => {
    await page.goto(BASE + path + (path ? '' : '?nohello'), { waitUntil: 'load' });
    await page.waitForTimeout(600);
    const pdf = await page.pdf({ format: 'Letter', preferCSSPageSize: true, printBackground: false });
    return (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  };
  const hockey = await pages('hockey/');
  check(hockey === 1, `print: hockey fits one Letter page (${hockey})`);
  await page.emulateMedia({ media: 'print' });
  const r = await page.evaluate(() => ({
    room: getComputedStyle(document.querySelector('canvas.room')).display,
    tabs: getComputedStyle(document.querySelector('nav.tabs')).display,
    bg: getComputedStyle(document.body).backgroundColor,
    h1: getComputedStyle(document.querySelector('#main h1')).color,
    sides: [...document.querySelectorAll('aside.side')].every(a => a.getBoundingClientRect().top > document.querySelector('#main .win__head').getBoundingClientRect().top),
  }));
  check(r.room === 'none' && r.tabs === 'none', 'print: no room and no tab bar');
  check(r.h1 === 'rgb(0, 0, 0)', 'print: black text');
  check(r.sides, 'print: side windows follow the main content');
  await page.emulateMedia({ media: null });
  const home = await pages('');
  check(home >= 1 && home <= 4, `print: home prints on ${home} pages`);
  await page.emulateMedia({ media: 'print' });
  check(await page.evaluate(() => { const h = document.querySelector('#main h1.name'); const s = getComputedStyle(h); return h.textContent.trim() === 'Leonardo Carvalho' && s.display !== 'none' && s.visibility === 'visible' && s.color === 'rgb(0, 0, 0)' && h.getBoundingClientRect().width > 100; }), 'print: the name prints on Home as black text');
  await page.emulateMedia({ media: null });
  const resume = await pages('resume/');
  check(resume >= 2 && resume <= 6, `print: résumé prints on ${resume} pages`);
  // a project printed while it is open as a sheet prints the project, not the page behind it
  await page.goto(BASE + 'work/loquar/', { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  await page.emulateMedia({ media: 'print' });
  check(await page.evaluate(() => getComputedStyle(document.getElementById('main')).display === 'none' && getComputedStyle(document.querySelector('section.sheet')).display !== 'none'), 'print: an open sheet prints alone');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  // under 1360px the side window sits inside the window (Measurables first); the profile still prints on one page.
  // Without WebGL at 1440 the side window floats in CSS glass, its rim a border, which print clears (a 1px rim and
  // the live region's box once pushed a blank second page)
  for (const [w, h] of [[1440, 900], [1024, 620], [390, 844]]) {
    const { browser, page } = await open({ width: w, height: h, noGL: true });
    await page.goto(BASE + 'hockey/', { waitUntil: 'load' });
    await page.waitForTimeout(600);
    const pdf = await page.pdf({ format: 'Letter', preferCSSPageSize: true, printBackground: false });
    const n = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    check(n === 1, `print from ${w}px without WebGL: hockey fits one Letter page (${n})`);
    await browser.close();
  }
}
{
  // a device that asks for less data, or has 2 GB of memory or less, starts on the still: the same page in CSS glass
  for (const [why, init] of [['memory', () => Object.defineProperty(Navigator.prototype, 'deviceMemory', { get: () => 2 })], ['save-data', () => Object.defineProperty(Navigator.prototype, 'connection', { get: () => ({ saveData: true }) })]]) {
    const { browser, page, errors } = await open();
    await page.addInitScript(init);
    await page.goto(BASE + '?nohello', { waitUntil: 'load' });
    await page.waitForTimeout(600);
    const r = await page.evaluate(() => ({ still: document.documentElement.dataset.still, gl: document.documentElement.classList.contains('gl'), room: getComputedStyle(document.querySelector('canvas.room')).display }));
    check(r.still === why && !r.gl && r.room === 'none', `${why}: starts on the still (data-still=${r.still})`);
    check(errors.length === 0, 'no console errors ' + errors.join(' | '));
    await browser.close();
  }
}
{
  // a room that gives way mid-session (a lost context takes the same path as a slow device) moves nothing on a phone:
  // the dock stays where it was and the color control stays, working over CSS glass
  const { browser, page, errors } = await open({ width: 390, height: 844, touch: true });
  await page.goto(BASE + 'hockey/', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  if (!(await page.evaluate(() => !!window.__room))) check(true, 'giving way: no WebGL here, nothing to lose');
  else {
    const at = () => page.evaluate(() => { const b = document.querySelector('.hue__button'); return [Math.round(document.querySelector('nav.tabs').getBoundingClientRect().left), getComputedStyle(b).display, Math.round(b.getBoundingClientRect().left)].join(' '); });
    const before = await at();
    await page.evaluate(() => document.querySelector('canvas.room').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await page.waitForFunction(() => document.documentElement.classList.contains('no-gl'), null, { timeout: 5000 });
    await page.waitForTimeout(300);
    const after = await at();
    check(after === before && !after.includes('none'), `giving way: the dock and the color control stay put (${before} -> ${after})`);
  }
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  // the budget's second look: a device held to 30 fps to save power keeps the room at 1x; one under about 27 fps gives
  // way to the still. The frame loop is fed a steady frame time, so the result does not depend on this machine's speed.
  for (const [fps, kept] of [[30, true], [24, false]]) {
    const { browser, page, errors } = await open({ width: 640, height: 400 });
    await page.addInitScript((fps) => {
      const raf = window.requestAnimationFrame.bind(window);
      let native = -1, t = 0;
      window.requestAnimationFrame = (cb) => raf((now) => { if (now !== native) { native = now; t += 1000 / fps; } cb(t); });
    }, fps);
    await page.goto(BASE + 'hockey/', { waitUntil: 'load' });
    if (!(await page.evaluate(() => !!window.__room))) { check(true, `${fps} fps: no WebGL here, nothing to budget`); await browser.close(); continue; }
    let log = [];
    for (let i = 0; i < 80 && log.length < 2; i++) {                   // a reader moving the pointer keeps the room drawing
      await page.mouse.move(200 + (i % 2) * 200, 200);
      await page.waitForTimeout(400);
      log = await page.evaluate(() => window.__room.log.map(e => e.event));
    }
    const still = await page.evaluate(() => document.documentElement.dataset.still || '');
    check(kept ? log[1] === 'kept' && !still : log[1] === 'still' && still === 'slow', `${fps} fps: the room ${kept ? 'stays at 1x' : 'gives way to the still'} (${log.join(', ')}${still ? ', data-still=' + still : ''})`);
    check(errors.length === 0, 'no console errors ' + errors.join(' | '));
    await browser.close();
  }
}
{
  // the budget's first look times the frames the room draws: on a 120 Hz screen a drawn frame's cost lands on the tick
  // after it, and while only the room drifts it draws every other tick, so a device drawing at 20 fps (33 ms a frame)
  // must still drop to 1x; one whose frames cost nothing takes no step. Fed a frame time, as above, with no pointer moving.
  for (const [cost, trips] of [[33, true], [0, false]]) {
    const { browser, page, errors } = await open({ width: 320, height: 240 });
    await page.addInitScript((cost) => {
      const raf = window.requestAnimationFrame.bind(window);
      let native = -1, t = 0, drew = false;
      const P = window.WebGL2RenderingContext && WebGL2RenderingContext.prototype;
      if (P) { const draw = P.drawArrays; P.drawArrays = function (...a) { if (this.getParameter(this.FRAMEBUFFER_BINDING) === null) drew = true; return draw.apply(this, a); }; }
      window.requestAnimationFrame = (cb) => raf((now) => { if (now !== native) { native = now; t += 1000 / 120 + (drew ? cost : 0); drew = false; } cb(t); });
    }, cost);
    await page.goto(BASE + 'hockey/', { waitUntil: 'load' });
    if (!(await page.evaluate(() => !!window.__room))) { check(true, `first look, ${cost} ms frames: no WebGL here, nothing to budget`); await browser.close(); continue; }
    await page.waitForFunction(() => window.__room.log.length > 0 || window.__roomFrames > 130, null, { timeout: 60000, polling: 200 });
    const log = await page.evaluate(() => window.__room.log.map(e => `${e.event} at ${e.ms} ms`));
    check(trips ? /^1x/.test(log[0] || '') : log.length === 0, `first look, drawn frames costing ${cost} ms at 120 Hz: ${trips ? 'drops to 1x' : 'takes no step'} (${log.join(', ') || 'no step'})`);
    check(errors.length === 0, 'no console errors ' + errors.join(' | '));
    await browser.close();
  }
}
