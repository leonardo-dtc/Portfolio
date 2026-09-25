// The hello: first view writes the name, Enter is ready in time, Return enters, focus lands in the window,
// the second view in the session skips it, and a click while it writes finishes it at once.
import { open, BASE, check } from './lib.mjs';
import { shotSampler, grey } from './pixels.mjs';

{
  const { browser, page, errors } = await open();
  await page.goto(BASE, { waitUntil: 'load' });
  check(await page.evaluate(() => document.documentElement.classList.contains('is-hello')), 'first view opens on the hello');
  const t0 = Date.now();
  await page.waitForSelector('.enter.is-ready', { timeout: 5000 });
  const readyAt = (Date.now() - t0) / 1000;
  check(readyAt < 3.2, `Enter ready at ${readyAt.toFixed(2)} s`);
  // the name is drawn: the middle band is brighter than the same band with the ink off
  await page.addStyleTag({ content: '.hello .enter { visibility: hidden !important }' });
  let s = await shotSampler(page);
  const withInk = grey(await s.mean(160, 330, 1120, 160));
  await page.evaluate(() => window.__room.set({ ink: Object.assign(window.__room.state.ink, { on: 0 }) }));
  await page.waitForTimeout(150);
  s = await shotSampler(page);
  const without = grey(await s.mean(160, 330, 1120, 160));
  check(withInk > without + 2, `the name is drawn in the room (${withInk.toFixed(1)} with ink, ${without.toFixed(1)} without)`);
  await page.evaluate(() => window.__room.set({ ink: Object.assign(window.__room.state.ink, { on: 1 }) }));
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => !document.documentElement.classList.contains('is-hello'), null, { timeout: 4000 });
  check(true, 'Return enters glass mode');
  check(await page.evaluate(() => !!document.activeElement.closest('main')), 'focus lands in the window');
  const pulled = await page.waitForFunction(() => window.__room.state.defocus < .05, null, { timeout: 2500 }).then(() => true, () => false);
  check(pulled, 'the room pulls focus within 2.5 s');
  await page.waitForTimeout(600);
  check(await page.evaluate(() => getComputedStyle(document.getElementById('main')).opacity === '1'), 'the main window has materialised');
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(300);
  check(!(await page.evaluate(() => document.documentElement.classList.contains('is-hello'))), 'second view in the session skips the hello');
  check(await page.evaluate(() => window.__room.state.ink && window.__room.state.ink.on > .9), 'the name stays as the window title');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  const { browser, page } = await open();
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await page.mouse.click(700, 250);
  await page.waitForTimeout(200);
  check(await page.evaluate(() => document.querySelector('.enter').classList.contains('is-ready')), 'a click while it writes finishes it at once');
  await browser.close();
}
{
  // a scroll down enters once the name is written; pressing the title writes it again
  const { browser, page, errors } = await open();
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForSelector('.enter.is-ready', { timeout: 5000 });
  await page.mouse.move(720, 700);
  await page.mouse.wheel(0, 120);
  await page.waitForFunction(() => !document.documentElement.classList.contains('is-hello'), null, { timeout: 2000 }).then(() => check(true, 'a scroll down enters'), () => check(false, 'a scroll down enters'));
  check(await page.evaluate(() => document.querySelector('#main .win__body').scrollTop === 0), 'the window opens at its top');
  await page.waitForFunction(() => window.__hello.state === 'glass', null, { timeout: 3000 });
  const box = await page.locator('#main h1.name').boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  check(await page.evaluate(() => window.__hello.state === 'replay'), 'pressing the name writes it again');
  await page.waitForFunction(() => window.__hello.state === 'glass', null, { timeout: 4000 }).then(() => check(true, 'the replay finishes'), () => check(false, 'the replay finishes'));
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  // reduced motion: the name is already written and Enter is ready at once; entering is a crossfade
  const { browser, page, errors } = await open({ reduced: true });
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(250);
  check(await page.evaluate(() => document.querySelector('.enter').classList.contains('is-ready')), 'reduced motion: no writing, Enter is ready');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(80);
  check(await page.evaluate(() => window.__room.state.defocus === 0), 'reduced motion: no focus pull');
  await page.waitForTimeout(700);
  check(await page.evaluate(() => getComputedStyle(document.getElementById('main')).opacity === '1'), 'reduced motion: the window is in');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  // phones write on two lines; entering fades the name and the title fades in
  const { browser, page, errors } = await open({ width: 390, height: 844 });
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForSelector('.enter.is-ready', { timeout: 5000 });
  const tall = await page.evaluate(() => window.__hello.ink.canvas.height / window.__hello.ink.canvas.width);
  check(tall > .45, `two lines on a phone (mask ${tall.toFixed(2)} tall for its width)`);
  await page.locator('.enter').click();
  await page.waitForFunction(() => window.__hello.state === 'glass', null, { timeout: 3000 });
  await page.waitForTimeout(900);
  check(await page.evaluate(() => window.__room.state.ink.on > .95), 'the title is in');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  // reduced transparency: no room, no hello, CSS glass and the name as an image
  const { browser, page, errors } = await open();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] });
  await page.goto(BASE, { waitUntil: 'load' });
  const r = await page.evaluate(() => ({ gl: document.documentElement.classList.contains('gl'), hello: document.documentElement.classList.contains('is-hello'), img: getComputedStyle(document.querySelector('.name__svg')).visibility, rt: matchMedia('(prefers-reduced-transparency: reduce)').matches }));
  if (!r.rt) console.log('skip reduced transparency: this Chrome cannot emulate it');
  else {
    check(!r.gl && !r.hello, 'reduced transparency: straight into CSS glass');
    check(r.img === 'visible', 'reduced transparency: the name shows as an image');
  }
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
