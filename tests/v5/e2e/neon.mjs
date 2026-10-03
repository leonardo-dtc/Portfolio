// The hero's colour, after Apple's "It's Glowtime." art: neon in hot pink, magenta, orange, violet, electric blue and
// cyan on near black. A census of the bright, saturated pixels in the name's box (lit: value .6 or more and
// saturation .2 or more, binned by hue), the ground right round the letters (0.1 to 0.3 em out), and, without the
// room by day, the name's edge (the brighter half of a band 0.03 em either side of the outline) against the ground
// just beyond its light (0.06 to 0.15 em out). The letters are drawn again from the page's own layout (glyph by
// glyph, as hero.js draws its mask), widened or narrowed with a stroke to find each band.
import { open, BASE, check } from './lib.mjs';

async function measure(page) {
  const png = await page.screenshot();
  return page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const k = img.width / innerWidth, W = img.width, H = img.height;
    const btn = document.querySelector('.hero__name'), box = btn.getBoundingClientRect();
    const words = [...btn.querySelectorAll('.hero__w')], cs = getComputedStyle(words[0]);
    const size = parseFloat(cs.fontSize), font = `${cs.fontWeight} ${size * k}px ${cs.fontFamily}`;
    const m = document.createElement('canvas').getContext('2d'); m.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
    const asc = m.measureText('L').fontBoundingBoxAscent || size * .98;
    const glyphs = [], r = document.createRange();
    for (const w of words) { const t = w.firstChild; for (let i = 0; i < t.length; i++) { if (t.data[i] === ' ') continue; r.setStart(t, i); r.setEnd(t, i + 1); const b = r.getBoundingClientRect(); glyphs.push({ ch: t.data[i], x: b.left * k, y: (b.top + asc) * k, x0: b.left * k, x1: b.right * k }); } }
    // a mask of the letters grown (w > 0) or shrunk (w < 0) by w em
    const mask = (w) => {
      const c = new OffscreenCanvas(W, H), g = c.getContext('2d');
      g.font = font; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = Math.abs(w) * 2 * size * k;
      g.fillStyle = g.strokeStyle = '#fff';
      for (const q of glyphs) g.fillText(q.ch, q.x, q.y);
      if (w > 0) for (const q of glyphs) g.strokeText(q.ch, q.x, q.y);
      if (w < 0) { g.globalCompositeOperation = 'destination-out'; for (const q of glyphs) g.strokeText(q.ch, q.x, q.y); }
      return g.getImageData(0, 0, W, H).data;
    };
    const band = (a, b) => { const A = mask(a), B = mask(b); return i => B[i] > 127 && A[i] <= 127; };   // in b, not in a
    const ring = band(.1, .3), near = band(.06, .15), edge = band(-.03, .03), face = band(-1, -.05);
    const shot = new OffscreenCanvas(W, H), sg = shot.getContext('2d'); sg.drawImage(img, 0, 0);
    const d = sg.getImageData(0, 0, W, H).data;
    const lin = v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
    const lum = i => .2126 * lin(d[i]) + .7152 * lin(d[i + 1]) + .0722 * lin(d[i + 2]);
    const at = (a, q) => { if (!a.length) return NaN; a.sort((x, y) => x - y); return a[Math.floor(a.length * q)]; }, med = a => at(a, .5);
    // the census, in the name's box
    const bins = { red: 0, orange: 0, yellow: 0, green: 0, cyan: 0, blue: 0, violet: 0, magenta: 0, pink: 0 }; let lit = 0;
    const X0 = Math.round(box.left * k), X1 = Math.round(box.right * k), Y0 = Math.round(box.top * k), Y1 = Math.round(box.bottom * k);
    for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) {
      const i = (y * W + x) * 4, R = d[i] / 255, G = d[i + 1] / 255, B = d[i + 2] / 255, mx = Math.max(R, G, B), mn = Math.min(R, G, B);
      if (mx < .6 || (mx - mn) / mx < .2) continue;
      lit++;
      let h = mx === R ? 60 * (((G - B) / (mx - mn)) % 6) : mx === G ? 60 * ((B - R) / (mx - mn) + 2) : 60 * ((R - G) / (mx - mn) + 4);
      if (h < 0) h += 360;
      bins[h < 15 ? 'red' : h < 50 ? 'orange' : h < 70 ? 'yellow' : h < 160 ? 'green' : h < 200 ? 'cyan' : h < 250 ? 'blue' : h < 290 ? 'violet' : h < 330 ? 'magenta' : h < 345 ? 'pink' : 'red']++;
    }
    const pct = {}; for (const n in bins) pct[n] = 100 * bins[n] / Math.max(1, lit);
    // the ground right round the letters, and the edge, the faces and the ground beside them at the first, middle
    // and last letter
    const P = Math.round(.35 * size * k), rg = [];
    const parts = [0, glyphs.length >> 1, glyphs.length - 1].map(j => ({ ch: glyphs[j].ch, x0: glyphs[j].x0, x1: glyphs[j].x1, y: glyphs[j].y, edge: [], near: [], face: [] }));
    for (let y = Math.max(0, Y0 - P); y < Math.min(H, Y1 + P); y++) for (let x = Math.max(0, X0 - P); x < Math.min(W, X1 + P); x++) {
      const p = y * W + x, i = p * 4;
      if (ring(i)) rg.push(lum(i));
      for (const q of parts) {
        if (x < q.x0 - P * .3 || x > q.x1 + P * .3 || y > q.y + P * .3 || y < q.y - size * k) continue;
        if (edge(i)) q.edge.push(lum(i)); else if (near(i)) q.near.push(lum(i)); else if (face(i)) q.face.push(lum(i));
      }
    }
    const cr = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    return { pct, lit, ground: med(rg), parts: parts.map(q => { const e = at(q.edge, .75), n = med(q.near), f = med(q.face); return { ch: q.ch, edge: cr(e, n), face: cr(f, n), near: n }; }) };
  }, png.toString('base64'));
}
const f1 = v => v.toFixed(1);
const census = s => `orange ${f1(s.pct.orange)}%, cyan ${f1(s.pct.cyan)}%, pink and magenta ${f1(s.pct.pink + s.pct.magenta)}%, blue and violet ${f1(s.pct.blue + s.pct.violet)}%; ground ${s.ground.toFixed(3)}`;
const ready = page => page.waitForFunction(() => document.querySelector('.hero.is-ready'), null, { timeout: 8000 });
async function lit(page) {                                   // the light is up and the room has drawn it
  await ready(page);
  await page.waitForFunction(() => window.__hero.ink.on >= 1, null, { timeout: 8000 });
  const f0 = await page.evaluate(() => window.__roomFrames);
  await page.evaluate(() => window.__room.kick(1));
  await page.waitForFunction(f0 => window.__roomFrames >= f0 + 2, f0, { timeout: 8000 });
}

// with the room, by night: the reduced-motion still (one moment of the light, the same everywhere), then the light
// moving, at 1440 on one line and 390 on two
for (const [width, height] of [[1440, 900], [390, 844]]) {
  const { browser, page, errors } = await open({ width, height, reduced: true, touch: width < 700 });
  await page.goto(BASE, { waitUntil: 'load' });
  if (!(await page.evaluate(() => document.documentElement.classList.contains('gl')))) { console.log('skip: no WebGL2 here'); await browser.close(); continue; }
  await lit(page);
  const s = await measure(page);
  check(s.pct.orange >= 10 && s.pct.cyan >= 10 && s.pct.pink + s.pct.magenta >= 5, `night ${width}, the still: orange, cyan and pink in the light (${census(s)})`);
  check(s.ground < .03, `night ${width}: the ground round the letters is near black (luminance ${s.ground.toFixed(3)})`);
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  const { browser, page, errors } = await open();
  await page.goto(BASE, { waitUntil: 'load' });
  if (await page.evaluate(() => document.documentElement.classList.contains('gl'))) {
    await lit(page);
    const frames = [];
    for (let n = 0; n < 4; n++) { if (n) await page.waitForTimeout(2000); frames.push(await measure(page)); }
    const warm = frames.filter(s => s.pct.orange >= 10).length, cold = frames.filter(s => s.pct.cyan >= 10).length;
    check(warm >= 3 && cold >= 3, `night 1440, moving: orange ${warm} and cyan ${cold} of 4 frames at 10% or more (${frames.map(s => `${f1(s.pct.orange)}/${f1(s.pct.cyan)}`).join(', ')})`);
    check(frames.every(s => s.ground < .03), `night 1440, moving: the ground stays near black (${frames.map(s => s.ground.toFixed(3)).join(', ')})`);
  } else console.log('skip: no WebGL2 here');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
// without the room: a real orange trace by night, and by day the edge at 3:1 or more against the ground beside it
{
  const { browser, page } = await open({ noGL: true, reduced: true });
  await page.goto(BASE, { waitUntil: 'load' });
  await ready(page); await page.waitForTimeout(300);
  const s = await measure(page);
  check(s.pct.orange >= 10, `no WebGL, night: an orange trace (${census(s)})`);
  check(s.ground < .03, `no WebGL, night: the ground round the letters is near black (${s.ground.toFixed(3)})`);
  await browser.close();
}
for (const [width, height] of [[1440, 900], [390, 844]]) {
  const { browser, page } = await open({ noGL: true, scheme: 'light', width, height, touch: width < 700 });
  await page.goto(BASE, { waitUntil: 'load' });
  await ready(page); await page.waitForTimeout(1600);
  for (let n = 0; n < 3; n++) {
    if (n) await page.waitForTimeout(3000);
    const s = await measure(page);
    check(s.parts.every(q => q.edge >= 3), `no WebGL, day ${width}: the edge against the ground beside it ${s.parts.map(q => `${q.ch} ${q.edge.toFixed(2)}:1`).join(', ')} (faces ${s.parts.map(q => q.face.toFixed(2)).join(', ')})`);
  }
  await browser.close();
}
