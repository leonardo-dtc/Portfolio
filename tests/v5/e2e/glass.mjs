// Glass is drawn by the room under every [data-glass] element, and it goes when the element dematerialises.
import { open, BASE, check } from './lib.mjs';
import { shotSampler, grey } from './pixels.mjs';

const { browser, page, errors } = await open();
await page.goto(BASE + '?nohello', { waitUntil: 'load' });
await page.waitForTimeout(1000);
// hide the HTML content so only what the canvas draws is measured
await page.addStyleTag({ content: '.space * { visibility: hidden !important } .space .glass { visibility: visible !important } .space .glass > * { visibility: hidden !important }' });
await page.waitForTimeout(250);
const box = await page.evaluate(() => { const r = document.querySelector('main.win').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
const inside = async (s) => s.mean(box.x + box.w / 2 - 20, box.y + box.h / 2 - 20, 40, 40);
const outsideRef = async (s) => s.mean(box.x + box.w / 2 - 20, box.y + box.h / 2 - 20, 40, 40);

let s = await shotSampler(page);
const glassIn = grey(await inside(s));
await page.evaluate(() => { document.querySelector('main.win').glass = { m: 0, dim: 0 }; });
await page.waitForTimeout(250);
s = await shotSampler(page);
const bare = grey(await outsideRef(s));
check(Math.abs(glassIn - bare) >= 6, `the window's glass differs from the open room under it (${glassIn.toFixed(1)} vs ${bare.toFixed(1)})`);

await page.evaluate(() => { document.querySelector('main.win').glass = { m: 1, dim: 1 }; });
await page.waitForTimeout(250);
s = await shotSampler(page);
const dimmed = grey(await inside(s));
check(dimmed < glassIn - 4, `a dimmed window is darker (${dimmed.toFixed(1)} vs ${glassIn.toFixed(1)})`);
check(errors.length === 0, 'no console errors ' + errors.join(' | '));
await browser.close();
