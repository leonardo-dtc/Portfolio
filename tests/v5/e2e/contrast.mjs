// Text over glass keeps 4.5:1 against what is actually behind it, in both palettes. The background is the median
// of a ring of screenshot pixels around each text box; translucent text is blended into it before measuring.
import { open, BASE, check } from './lib.mjs';
import { ringContrast } from './measure.mjs';

let worst = { ratio: 99 };
for (const scheme of ['dark', 'light']) for (const p of ['', 'work/', 'hockey/', 'about/', 'resume/', 'work/loquar/']) {
  const { browser, page } = await open({ scheme });
  await page.goto(BASE + p + (p ? '' : '?nohello'), { waitUntil: 'load' });
  await page.waitForTimeout(1400);
  const boxes = await page.$$eval('#main p, #main li, #main h2, #main h3, #main dt, #main dd, #main .cv__when, .side p, .side li, .sheet p, .sheet dt, .sheet dd, .toolbar .btn', els => els.map(e => {
    const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    const c = cs.color.match(/[\d.]+/g).map(Number);
    return { x: r.left, y: r.top, w: r.width, h: r.height, c, t: e.textContent.trim().slice(0, 32), bg: cs.backgroundColor, behind: !!e.closest('.is-behind') };
  }).filter(b => b.w > 20 && b.h > 8 && b.y > 30 && b.y + b.h < innerHeight - 90 && b.t && b.bg === 'rgba(0, 0, 0, 0)' && !b.behind).slice(0, 24));
  const ratios = await ringContrast(page, boxes);
  let fails = 0;
  boxes.forEach((b, i) => {
    const ratio = ratios[i];
    if (ratio < worst.ratio) worst = { ratio, where: `${scheme} ${p || 'home'}: “${b.t}”` };
    if (ratio < 4.5) { fails++; check(false, `${scheme} ${p || 'home'}: “${b.t}” ${ratio.toFixed(2)}:1`); }
  });
  check(fails === 0, `${scheme} ${p || 'home'}: ${boxes.length} text boxes at 4.5:1 or more`);
  await browser.close();
}
console.log(`lowest: ${worst.ratio.toFixed(2)}:1, ${worst.where}`);
