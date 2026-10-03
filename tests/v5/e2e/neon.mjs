// The hero's colour, after Apple's "It's Glowtime." art: neon in hot pink, magenta, orange, violet, electric blue and
// cyan, its light blooming into a near-black field. A census of the bright, saturated pixels in the name's box (lit:
// value .6 or more and saturation .2 or more, binned by hue), the ground right round the letters (0.1 to 0.3 em out),
// and, without the room by day, the name's edge (the brighter half of a band 0.03 em either side of the outline)
// against the ground just beyond its light (0.06 to 0.15 em out), and the faces against the pool beyond that (0.15 to
// 0.3 em out). By night, the stage: the room outside the name's box near black, and the light falling smoothly into
// it: the mean luminance in bands 0.1 em wide by distance from the letters, in eight directions round them, from
// 0.1 em out (past the tube's own light) to 3 em, with no step between neighbouring bands over 0.01 and no rise, so
// no edge or shape (a pool, the mask's box) outlines the name; and the first frames of a hero view (a first visit and
// a reload), read from the compositor, never showing the bright room. The letters are drawn again from the page's own
// layout (glyph by glyph, as hero.js draws its mask), widened or narrowed with a stroke to find each band.
import { open, BASE, check } from './lib.mjs';

async function measure(page, { stage = false } = {}) {
  const png = await page.screenshot();
  return page.evaluate(async ([b64, stage]) => {
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
    const ring = band(.1, .3), near = band(.06, .15), edge = band(-.03, .03), face = band(-1, -.05), pool = band(.15, .3);
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
    const parts = [0, glyphs.length >> 1, glyphs.length - 1].map(j => ({ ch: glyphs[j].ch, x0: glyphs[j].x0, x1: glyphs[j].x1, y: glyphs[j].y, edge: [], near: [], face: [], pool: [] }));
    for (let y = Math.max(0, Y0 - P); y < Math.min(H, Y1 + P); y++) for (let x = Math.max(0, X0 - P); x < Math.min(W, X1 + P); x++) {
      const p = y * W + x, i = p * 4;
      if (ring(i)) rg.push(lum(i));
      for (const q of parts) {
        if (x < q.x0 - P || x > q.x1 + P || y > q.y + P || y < q.y - size * k) continue;
        if (pool(i)) q.pool.push(lum(i));
        if (x < q.x0 - P * .3 || x > q.x1 + P * .3 || y > q.y + P * .3) continue;
        if (edge(i)) q.edge.push(lum(i)); else if (near(i)) q.near.push(lum(i)); else if (face(i)) q.face.push(lum(i));
      }
    }
    const cr = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    const out = { pct, lit, ground: med(rg), parts: parts.map(q => { const e = at(q.edge, .75), n = med(q.near), f = med(q.face), o = med(q.pool); return { ch: q.ch, edge: cr(e, n), face: cr(f, n), pool: cr(f, o), near: n }; }) };
    if (!stage) return out;
    // the stage: everything but the hint and the colour control (which are not the room), outside the name's box
    const skip = new Uint8Array(W * H);
    const hint = [...document.querySelectorAll('.hero__hint span')].find(s => getComputedStyle(s).display !== 'none'), hue = document.querySelector('.hue__button');
    for (const el of [hint, hue].filter(Boolean)) { const b = el.getBoundingClientRect(); for (let y = Math.max(0, Math.floor((b.top - 10) * k)); y < Math.min(H, Math.ceil((b.bottom + 10) * k)); y++) for (let x = Math.max(0, Math.floor((b.left - 10) * k)); x < Math.min(W, Math.ceil((b.right + 10) * k)); x++) skip[y * W + x] = 1; }
    // each pixel's distance from the letters (em), by a two-pass chamfer over the screen, and the letters' centre
    const L = mask(0), em = size * k, D = new Float32Array(W * H);
    let cx = 0, cy = 0, n = 0;
    for (let p = 0; p < W * H; p++) { if (L[p * 4] > 127) { D[p] = 0; cx += p % W; cy += (p / W) | 0; n++; } else D[p] = 1e9; }
    cx /= n; cy /= n;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const p = y * W + x; let v = D[p]; if (x) v = Math.min(v, D[p - 1] + 1); if (y) { v = Math.min(v, D[p - W] + 1); if (x) v = Math.min(v, D[p - W - 1] + 1.414); if (x < W - 1) v = Math.min(v, D[p - W + 1] + 1.414); } D[p] = v; }
    for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) { const p = y * W + x; let v = D[p]; if (x < W - 1) v = Math.min(v, D[p + 1] + 1); if (y < H - 1) { v = Math.min(v, D[p + W] + 1); if (x < W - 1) v = Math.min(v, D[p + W + 1] + 1.414); if (x) v = Math.min(v, D[p + W - 1] + 1.414); } D[p] = v; }
    let so = 0, no = 0;
    const NB = 30, sum = Array.from({ length: 8 }, () => new Float64Array(NB)), cnt = Array.from({ length: 8 }, () => new Uint32Array(NB));
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const p = y * W + x; if (skip[p] || !D[p]) continue;
      const l = lum(p * 4);
      if (x < X0 || x >= X1 || y < Y0 || y >= Y1) { so += l; no++; }
      const b = Math.floor(D[p] / em / .1); if (b >= NB) continue;
      let a = Math.atan2(cy - y, x - cx) * 180 / Math.PI; if (a < 0) a += 360;
      const s = Math.round(a / 45) % 8; sum[s][b] += l; cnt[s][b]++;
    }
    let step = 0, rise = 0, worst = '';
    const dirs = ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE'];
    dirs.forEach((name, s) => {
      const prof = []; for (let b = 1; b < NB && cnt[s][b] >= 40; b++) prof.push(sum[s][b] / cnt[s][b]);   // from 0.1 em out
      for (let j = 1; j < prof.length; j++) { const dd = prof[j - 1] - prof[j]; if (Math.abs(dd) > step) { step = Math.abs(dd); worst = `${name} at ${((j + 1) * .1).toFixed(1)} em`; } rise = Math.max(rise, -dd); }
    });
    // the hint against the median of a ring round it
    let hintCR = null;
    if (hint) {
      const b = hint.getBoundingClientRect(), px = [];
      for (let i = 0; i < 48; i++) { const x = Math.round((b.left - 4 + (b.width + 8) * i / 47) * k); for (const y of [Math.round((b.top - 4) * k), Math.round((b.bottom + 4) * k)]) { const j = (y * W + x) * 4; px.push([d[j], d[j + 1], d[j + 2]]); } }
      px.sort((a, c) => (a[0] + a[1] + a[2]) - (c[0] + c[1] + c[2]));
      const bg = px[px.length >> 1], c = getComputedStyle(hint.parentElement).color.match(/[\d.]+/g).map(Number), al = c.length > 3 ? c[3] : 1;
      const l3 = v => .2126 * lin(v[0]) + .7152 * lin(v[1]) + .0722 * lin(v[2]);
      hintCR = cr(l3([0, 1, 2].map(j => c[j] * al + bg[j] * (1 - al))), l3(bg));
    }
    return { ...out, outside: so / no, step, rise, worst, hint: hintCR };
  }, [png.toString('base64'), stage]);
}
const f1 = v => v.toFixed(1), f3 = v => v.toFixed(3), f4 = v => v.toFixed(4);
const census = s => `orange ${f1(s.pct.orange)}%, cyan ${f1(s.pct.cyan)}%, pink and magenta ${f1(s.pct.pink + s.pct.magenta)}%, blue and violet ${f1(s.pct.blue + s.pct.violet)}%; ground ${s.ground.toFixed(3)}`;
// the stage checks, for one frame by night
function stageChecks(s, where) {
  check(s.outside <= .03, `${where}: the room outside the name is near black (mean luminance ${f4(s.outside)})`);
  check(s.step <= .01 && s.rise <= .003, `${where}: the light falls smoothly into the dark, eight ways round the letters (largest step ${f4(s.step)} per 0.1 em, ${s.worst}; largest rise ${f4(s.rise)})`);
  check(s.hint >= 4.5, `${where}: the hint at ${s.hint.toFixed(1)}:1 on the stage`);
}
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
  const s = await measure(page, { stage: true });
  check(s.pct.orange >= 10 && s.pct.cyan >= 10 && s.pct.pink + s.pct.magenta >= 5, `night ${width}, the still: orange, cyan and pink in the light (${census(s)})`);
  check(s.ground < .03, `night ${width}: the ground round the letters is near black (luminance ${s.ground.toFixed(3)})`);
  stageChecks(s, `night ${width}, the still`);
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  const { browser, page, errors } = await open();
  await page.goto(BASE, { waitUntil: 'load' });
  if (await page.evaluate(() => document.documentElement.classList.contains('gl'))) {
    await lit(page);
    const frames = [];
    for (let n = 0; n < 4; n++) { if (n) await page.waitForTimeout(2000); frames.push(await measure(page, { stage: true })); }
    const warm = frames.filter(s => s.pct.orange >= 10).length, cold = frames.filter(s => s.pct.cyan >= 10).length;
    check(warm >= 3 && cold >= 3, `night 1440, moving: orange ${warm} and cyan ${cold} of 4 frames at 10% or more (${frames.map(s => `${f1(s.pct.orange)}/${f1(s.pct.cyan)}`).join(', ')})`);
    check(frames.every(s => s.ground < .03), `night 1440, moving: the ground stays near black (${frames.map(s => s.ground.toFixed(3)).join(', ')})`);
    check(frames.every(s => s.outside <= .03), `night 1440, moving: the stage stays near black (${frames.map(s => f4(s.outside)).join(', ')})`);
    check(frames.every(s => s.step <= .01 && s.rise <= .003), `night 1440, moving: the light falls smoothly in every frame (largest steps ${frames.map(s => f4(s.step)).join(', ')})`);
  } else console.log('skip: no WebGL2 here');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
// by day there is no stage: the room keeps its light round the name
{
  const { browser, page, errors } = await open({ scheme: 'light', reduced: true });
  await page.goto(BASE, { waitUntil: 'load' });
  if (await page.evaluate(() => document.documentElement.classList.contains('gl'))) {
    await lit(page);
    const s = await measure(page, { stage: true });
    check(s.outside > .08, `day 1440: no stage, the room keeps its light (mean luminance ${f4(s.outside)} outside the name)`);
  } else console.log('skip: no WebGL2 here');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
// the first frames of a hero view, by night, as the compositor sends them (a screencast): a first visit (from a black
// page on the same origin) and a reload, each from the new page's first paint until the light is up. None may show the
// bright room: the page's CSS darkens the room's still from the first paint, and the room's first frame is already dark.
async function firstFrames(page, how, gl) {
  const cdp = await page.context().newCDPSession(page), frames = [];
  cdp.on('Page.screencastFrame', f => { if (frames.length < 160) frames.push(f); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, everyNthFrame: 1 });
  if (how === 'visit') await page.goto(BASE, { waitUntil: 'commit' }); else await page.reload({ waitUntil: 'commit' });
  await ready(page);
  if (gl && !(await page.evaluate(() => document.documentElement.classList.contains('gl')))) { await cdp.detach(); return null; }
  if (gl) await lit(page);
  await new Promise(r => setTimeout(r, gl ? 400 : 1200));
  await cdp.send('Page.stopScreencast');
  // from the new page's first paint (a reload starts on the old page's last frames), the first 40
  const fp = await page.evaluate(() => { const e = performance.getEntriesByName('first-paint')[0]; return e ? performance.timeOrigin + e.startTime : 0; });
  const mine = frames.filter(f => f.metadata.timestamp * 1000 >= fp - 1).slice(0, 40), means = [];
  for (let i = 0; i < mine.length; i += 8) means.push(...await page.evaluate(async (list) => {
    const lin = v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
    const b = document.querySelector('.hero__name').getBoundingClientRect(), out = [];
    for (const b64 of list) {
      const i = new Image(); i.src = 'data:image/jpeg;base64,' + b64; await i.decode();
      const c = new OffscreenCanvas(i.width, i.height), g = c.getContext('2d'); g.drawImage(i, 0, 0);
      const d = g.getImageData(0, 0, i.width, i.height).data, k = i.width / innerWidth;
      let s = 0, n = 0;
      for (let y = 0; y < i.height - 110 * k; y += 2) for (let x = 0; x < i.width; x += 2) {
        if (x >= (b.left - 40) * k && x < (b.right + 40) * k && y >= (b.top - 40) * k && y < (b.bottom + 40) * k) continue;   // the name and its light
        const j = (y * i.width + x) * 4; s += .2126 * lin(d[j]) + .7152 * lin(d[j + 1]) + .0722 * lin(d[j + 2]); n++;
      }
      out.push(s / n);
    }
    return out;
  }, mine.slice(i, i + 8).map(f => f.data)));
  await cdp.detach();
  return means;
}
for (const noGL of [false, true]) {
  const { browser, page, errors } = await open({ noGL });
  await page.context().route('**/v5/__black.html', r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><html style="background:#000"><body></body></html>' }));
  await page.goto(BASE + '__black.html');
  const gl = !noGL;
  for (const how of ['visit', 'reload']) {
    const means = await firstFrames(page, how, gl);
    if (!means) { console.log('skip: no WebGL2 here'); break; }
    check(means.length > 0 && Math.max(...means) <= .03, `${noGL ? 'no WebGL' : 'with the room'}, night, ${how === 'visit' ? 'a first visit' : 'a reload'}: no flash of the bright room, ${means.length} frames from the first paint (mean luminance round the name ${means.map(f4).join(' ')})`);
  }
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
// without the room: a real orange trace by night on the same near-black stage, and by day the edge at 3:1 or more
// against the ground beside it and the faces at 3:1 or more against the pool round the letters (the still, under
// reduced motion, is the dimmest: the second face is not there to lift them)
for (const [width, height] of [[1440, 900], [390, 844]]) {
  const { browser, page } = await open({ noGL: true, reduced: true, width, height, touch: width < 700 });
  await page.goto(BASE, { waitUntil: 'load' });
  await ready(page); await page.waitForTimeout(300);
  const s = await measure(page, { stage: true });
  check(s.pct.orange >= 10, `no WebGL, night ${width}: an orange trace (${census(s)})`);
  check(s.ground < .03, `no WebGL, night ${width}: the ground round the letters is near black (${s.ground.toFixed(3)})`);
  stageChecks(s, `no WebGL, night ${width}`);
  await browser.close();
}
for (const [width, height, reduced] of [[1440, 900, false], [390, 844, false], [1440, 900, true]]) {
  const { browser, page } = await open({ noGL: true, scheme: 'light', width, height, reduced, touch: width < 700 });
  await page.goto(BASE, { waitUntil: 'load' });
  await ready(page); await page.waitForTimeout(1600);
  for (let n = 0; n < (reduced ? 1 : 3); n++) {
    if (n) await page.waitForTimeout(3000);
    const s = await measure(page), where = `no WebGL, day ${width}${reduced ? ', the still' : ''}`;
    check(s.parts.every(q => q.edge >= 3), `${where}: the edge against the ground beside it ${s.parts.map(q => `${q.ch} ${q.edge.toFixed(2)}:1`).join(', ')}`);
    check(s.parts.every(q => q.pool >= 3), `${where}: the faces against the pool ${s.parts.map(q => `${q.ch} ${q.pool.toFixed(2)}:1`).join(', ')}`);
  }
  await browser.close();
}
