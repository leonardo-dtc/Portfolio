// Text over glass keeps 4.5:1 against what is actually behind it, in both palettes. The background is the median
// of a ring of screenshot pixels around each text box; translucent text is blended into it before measuring.
import { open, BASE, check } from './lib.mjs';

const lum = ([r, g, b]) => { const f = c => { c /= 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
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
  const shot = await page.screenshot();
  const ring = await page.evaluate(async ([b64, boxes]) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const k = img.width / innerWidth;
    return boxes.map(b => {
      const px = [];
      for (let i = 0; i < 24; i++) {
        const sx = (b.x - 3 + (b.w + 6) * (i / 23)) * k;
        for (const sy of [(b.y - 3) * k, (b.y + b.h + 3) * k]) px.push([...x.getImageData(Math.round(sx), Math.round(sy), 1, 1).data.slice(0, 3)]);
      }
      px.sort((a, c2) => (a[0] + a[1] + a[2]) - (c2[0] + c2[1] + c2[2]));
      return px[Math.floor(px.length / 2)];
    });
  }, [shot.toString('base64'), boxes]);
  let fails = 0;
  boxes.forEach((b, i) => {
    const a = b.c.length > 3 ? b.c[3] : 1;
    const text = b.c.slice(0, 3).map((v, j) => v * a + ring[i][j] * (1 - a));
    const L1 = lum(text), L2 = lum(ring[i]);
    const ratio = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
    if (ratio < worst.ratio) worst = { ratio, where: `${scheme} ${p || 'home'}: “${b.t}”` };
    if (ratio < 4.5) { fails++; check(false, `${scheme} ${p || 'home'}: “${b.t}” ${ratio.toFixed(2)}:1`); }
  });
  check(fails === 0, `${scheme} ${p || 'home'}: ${boxes.length} text boxes at 4.5:1 or more`);
  await browser.close();
}
console.log(`lowest: ${worst.ratio.toFixed(2)}:1, ${worst.where}`);
