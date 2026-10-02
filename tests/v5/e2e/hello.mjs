// The hero (the first home view of a session): the name in Liquid Glass with the light behind it, the hint at the
// foot of the screen, the title as the control (click, Return, the hint), the glide into the window's title and the
// hand-off to the HTML title; later views skip it; reduced motion, phones, no WebGL and reduced transparency.
import { open, BASE, check } from './lib.mjs';
import { shotSampler, grey } from './pixels.mjs';

const done = (page, ms = 10000) => page.waitForFunction(() => window.__hero && window.__hero.state === 'done', null, { timeout: ms }).then(() => true, () => false);
const ready = (page) => page.waitForFunction(() => document.querySelector('.hero.is-ready'), null, { timeout: 6000 }).then(() => true, () => false);

{
  const { browser, page, errors } = await open();
  await page.goto(BASE, { waitUntil: 'load' });
  check(await page.evaluate(() => document.documentElement.classList.contains('is-hello')), 'first view opens on the hero');
  check(await ready(page), 'the hero is ready once Switzer has loaded');
  const a11y = await page.evaluate(() => { const b = document.querySelector('.hero__name'); return { tag: b.tagName, label: b.getAttribute('aria-label'), font: getComputedStyle(b).fontFamily, weight: getComputedStyle(b).fontWeight }; });
  check(a11y.tag === 'BUTTON' && a11y.label === 'Leonardo Carvalho. Enter the portfolio', `the title is a button named “${a11y.label}”`);
  check(/Switzer/.test(a11y.font) && +a11y.weight >= 760 && +a11y.weight <= 820, `the name is Switzer at ${a11y.weight}`);
  check(await page.evaluate(() => document.fonts.check('780 100px "Switzer"')), 'Switzer has loaded');
  await page.waitForTimeout(1600);
  const hint = await page.evaluate(() => { const h = document.querySelector('.hero__hint'), r = h.getBoundingClientRect(), t = [...h.children].find(s => getComputedStyle(s).display !== 'none'); return { text: t.textContent, bottom: innerHeight - r.bottom, size: parseFloat(getComputedStyle(h).fontSize), opacity: +getComputedStyle(h).opacity, tab: h.tabIndex }; });
  check(hint.text === 'Click the title to proceed' && hint.opacity > .9, `the hint reads “${hint.text}”`);
  check(Math.abs(hint.bottom - 32) < 3 && hint.size >= 13 && hint.size <= 15, `the hint sits ${hint.bottom.toFixed(0)}px above the bottom at ${hint.size}px`);
  check(hint.tab < 0, 'the hint is not a tab stop');
  // the name is drawn in the room: the band across it is brighter than the same band with the ink off
  let s = await shotSampler(page);
  const box = await page.locator('.hero__name').boundingBox();
  const withInk = grey(await s.mean(box.x, box.y, box.width, box.height));
  await page.evaluate(() => { window.__room.set({ ink: null }); window.__room.kick(1); });
  await page.waitForTimeout(400);
  s = await shotSampler(page);
  const without = grey(await s.mean(box.x, box.y, box.width, box.height));
  check(withInk > without + 4, `the name is drawn in the room (${withInk.toFixed(1)} with the glass, ${without.toFixed(1)} without)`);
  await page.evaluate(() => { window.__room.set({ ink: window.__hero.ink }); window.__room.kick(1); });
  // no wheel or swipe to enter any more
  await page.mouse.move(720, 700);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(500);
  check(await page.evaluate(() => window.__hero.state === 'hero'), 'a scroll does not enter');
  // Return anywhere enters
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => !document.documentElement.classList.contains('is-hello'), null, { timeout: 4000 });
  check(true, 'Return enters');
  check(await page.evaluate(() => !!document.activeElement.closest('main')), 'focus lands in the window');
  const pulled = await page.waitForFunction(() => window.__room.state.defocus < .05, null, { timeout: 4000 }).then(() => true, () => false);
  check(pulled, 'the room pulls focus');
  check(await done(page), 'the name lands and hands off to the title');
  const after = await page.evaluate(() => { const h = document.querySelector('#main h1.name'), cs = getComputedStyle(h); return { text: h.textContent.trim(), opacity: cs.opacity, font: cs.fontFamily, weight: cs.fontWeight, color: cs.color, ink: window.__room.state.ink, main: getComputedStyle(document.getElementById('main')).opacity, hero: getComputedStyle(document.querySelector('.hero')).display }; });
  check(after.text === 'Leonardo Carvalho' && after.opacity === '1' && /Switzer/.test(after.font) && after.color === 'rgb(255, 255, 255)', `the title is white text in Switzer ${after.weight}`);
  check(after.ink === null, 'the glass is off once the title has landed: it stays out of the content layer');
  check(after.main === '1' && after.hero === 'none', 'the window is in and the hero is gone');
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(400);
  check(!(await page.evaluate(() => document.documentElement.classList.contains('is-hello'))), 'a second view in the session skips the hero');
  check(await page.evaluate(() => !window.__room.state.ink && getComputedStyle(document.querySelector('#main h1.name')).opacity === '1'), 'and opens on the text title');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  // a click on the title enters, and so does a click on the hint
  for (const [target, what] of [['.hero__name', 'the title'], ['.hero__fine', 'the hint']]) {
    const { browser, page, errors } = await open();
    await page.goto(BASE, { waitUntil: 'load' });
    await ready(page);
    await page.waitForTimeout(1600);
    await page.locator(target).click();
    check(await page.waitForFunction(() => window.__hero.state !== 'hero', null, { timeout: 3000 }).then(() => true, () => false), `a click on ${what} enters`);
    check(await done(page), 'and settles in the window');
    check(errors.length === 0, 'no console errors ' + errors.join(' | '));
    await browser.close();
  }
}
{
  // reduced motion: the name is there at once and entering is a short fade, without the glide or the focus pull
  const { browser, page, errors } = await open({ reduced: true });
  await page.goto(BASE, { waitUntil: 'load' });
  await ready(page);
  await page.waitForTimeout(250);
  check(await page.evaluate(() => window.__hero.ink.on === 1 && +getComputedStyle(document.querySelector('.hero__hint')).opacity > .5), 'reduced motion: the name and the hint are there at once');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(80);
  check(await page.evaluate(() => window.__room.state.defocus === 0), 'reduced motion: no focus pull');
  check(await done(page, 3000), 'reduced motion: the window is in');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  // phones: two lines, the tap hint, and the title lands on two lines too
  const { browser, page, errors } = await open({ width: 390, height: 844, touch: true });
  await page.goto(BASE, { waitUntil: 'load' });
  await ready(page);
  await page.waitForTimeout(1600);
  const r = await page.evaluate(() => { const w = [...document.querySelectorAll('.hero__w')].map(e => e.getBoundingClientRect()); const t = [...document.querySelector('.hero__hint').children].find(s => getComputedStyle(s).display !== 'none'); return { lines: w[1].top - w[0].top > w[0].height * .6, hint: t.textContent }; });
  check(r.lines, 'phone: the name is on two lines');
  check(r.hint === 'Tap the title to proceed', `phone: the hint reads “${r.hint}”`);
  await page.locator('.hero__name').tap();
  check(await done(page), 'phone: a tap enters');
  check(await page.evaluate(() => { const w = [...document.querySelectorAll('#main .name__w')].map(e => e.getBoundingClientRect()); return w[1].top - w[0].top > w[0].height * .6; }), 'phone: the title is the two-line name');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  // no WebGL: the hero is the name as CSS glass text, with the same hint, and entering is a fade
  const { browser, page, errors } = await open({ noGL: true });
  await page.goto(BASE, { waitUntil: 'load' });
  await ready(page);
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => ({ gl: document.documentElement.classList.contains('gl'), hello: document.documentElement.classList.contains('is-hello'), text: +getComputedStyle(document.querySelector('.hero__text')).opacity, clip: getComputedStyle(document.querySelector('.hero__text')).backgroundClip }));
  check(!r.gl && r.hello && r.text > .9 && /text/.test(r.clip), 'no WebGL: the hero is the name in CSS glass');
  await page.locator('.hero__name').click();
  check(await done(page, 4000), 'no WebGL: a click fades into the windows');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  // reduced transparency: no room, the CSS hero
  const { browser, page, errors } = await open();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] });
  await page.goto(BASE, { waitUntil: 'load' });
  await ready(page);
  const r = await page.evaluate(() => ({ gl: document.documentElement.classList.contains('gl'), hello: document.documentElement.classList.contains('is-hello'), rt: matchMedia('(prefers-reduced-transparency: reduce)').matches }));
  if (!r.rt) console.log('skip reduced transparency: this Chrome cannot emulate it');
  else check(!r.gl && r.hello, 'reduced transparency: the CSS hero, without the room');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
