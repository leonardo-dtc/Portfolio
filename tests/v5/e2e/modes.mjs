// Preferences and media: reduced motion, scripts off, print.
import { open, BASE, PAGES, check } from './lib.mjs';

{
  const { browser, page } = await open({ reduced: true });
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForSelector('.enter:not([hidden])', { timeout: 300 }).then(() => check(true, 'reduced motion: name written at once, Enter shown'), () => check(false, 'reduced motion: Enter shown within 300 ms'));
  await page.waitForTimeout(1600);                                   // past the room's 1.5 s start-up at full rate
  const t = await page.evaluate(async () => { const f0 = window.__roomFrames; await new Promise(r => setTimeout(r, 1500)); return { frames: window.__roomFrames - f0 }; });
  check(t.frames < 10, `reduced motion: the room stops redrawing when nothing moves (${t.frames} frames in 1.5 s)`);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const moved = await page.evaluate(() => getComputedStyle(document.querySelector('.space')).translate);
  await page.mouse.move(100, 100); await page.mouse.move(1300, 800);
  await page.waitForTimeout(300);
  check(await page.evaluate(() => getComputedStyle(document.querySelector('.space')).translate) === moved, 'reduced motion: no parallax');
  await browser.close();
}
{
  const { browser, page } = await open({ js: false });
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: 'load' });
    check(await page.locator('#main h1').isVisible(), `no-JS ${p || 'home'}: title visible`);
    check(!(await page.locator('.hello').isVisible()), `no-JS ${p || 'home'}: no hello`);
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
  check(await page.evaluate(() => { const i = document.querySelector('.name__svg'); const s = getComputedStyle(i); return s.display !== 'none' && s.visibility === 'visible' && i.getBoundingClientRect().width > 100; }), 'print: the written name prints on Home');
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
