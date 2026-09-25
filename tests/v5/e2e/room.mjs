// The WebGL2 room starts, draws a scene, reacts to defocus, and throws nothing.
import { open, BASE, check } from './lib.mjs';
import { shotSampler, grey } from './pixels.mjs';

const { browser, page, errors } = await open();
await page.goto(BASE + '?nohello', { waitUntil: 'load' });
await page.waitForTimeout(900);
check(await page.evaluate(() => document.documentElement.classList.contains('gl')), 'WebGL2 room active (html.gl)');
await page.addStyleTag({ content: '.space { visibility: hidden !important }' });
await page.waitForTimeout(200);
let s = await shotSampler(page);
const top = grey(await s.mean(0, 0, 1440, 200)), low = grey(await s.mean(0, 700, 1440, 200));
check(top > 4 && top < 200 && low > 4, `room draws a scene (top ${top.toFixed(1)}, low ${low.toFixed(1)})`);
const edge = await page.evaluate(() => { const r = window.__room; return !!r; });
check(edge, 'room handle exposed for checks (window.__room)');
// defocus blurs: the crisp crest line loses contrast
const crisp = await (async () => { const a = await s.mean(700, 0, 40, 900); return a; })();
await page.evaluate(() => window.__room.set({ defocus: 1 }));
await page.waitForTimeout(300);
s = await shotSampler(page);
const variance = async () => { let v = []; for (let y = 60; y < 860; y += 40) v.push(grey(await s.mean(700, y, 40, 40))); const m = v.reduce((a, b) => a + b) / v.length; return v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length; };
const blurred = await variance();
await page.evaluate(() => window.__room.set({ defocus: 0 }));
await page.waitForTimeout(300);
s = await shotSampler(page);
const sharp = await variance();
check(sharp > blurred, `defocus softens the room (variance ${sharp.toFixed(1)} sharp vs ${blurred.toFixed(1)} blurred)`);
check(errors.length === 0, 'no console errors ' + errors.join(' | '));
await browser.close();
