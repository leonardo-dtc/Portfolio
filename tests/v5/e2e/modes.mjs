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
  // under 1360px the side window sits inside the window (Measurables first); the profile still prints on one page
  for (const [w, h] of [[1024, 620], [390, 844]]) {
    const { browser, page } = await open({ width: w, height: h, noGL: true });
    await page.goto(BASE + 'hockey/', { waitUntil: 'load' });
    await page.waitForTimeout(600);
    const pdf = await page.pdf({ format: 'Letter', preferCSSPageSize: true, printBackground: false });
    const n = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    check(n === 1, `print from ${w}px: hockey fits one Letter page (${n})`);
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
