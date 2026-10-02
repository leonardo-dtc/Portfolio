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
