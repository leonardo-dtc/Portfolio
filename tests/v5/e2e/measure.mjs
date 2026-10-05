// Measures shared by the hero and contrast checks (neon.mjs, palettes.mjs, contrast.mjs).

// The hero's colour, as the screenshot shows it (neon.mjs says what each figure is): a census of the bright, saturated
// pixels in the name's box by hue (and their OKLCH hues, for the colour styles), the ground right round the letters,
// the edge and the faces against the ground beside them and, with stage, the stage outside the name and the light's
// fall into it.
export async function measure(page, { stage = false } = {}) {
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
    const bins = { red: 0, orange: 0, yellow: 0, green: 0, cyan: 0, blue: 0, violet: 0, magenta: 0, pink: 0 }; let lit = 0, bright = 0, grey = 0;
    // and, for the colour styles, the lit pixels by OKLCH hue (36 bins of 10 degrees), and the bright pixels (value .6
    // or more) that are nearly grey (saturation under .2)
    const oh = new Array(36).fill(0), cb = v => Math.cbrt(v);
    const X0 = Math.round(box.left * k), X1 = Math.round(box.right * k), Y0 = Math.round(box.top * k), Y1 = Math.round(box.bottom * k);
    for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) {
      const i = (y * W + x) * 4, R = d[i] / 255, G = d[i + 1] / 255, B = d[i + 2] / 255, mx = Math.max(R, G, B), mn = Math.min(R, G, B);
      if (mx >= .6) { bright++; if ((mx - mn) / mx < .2) grey++; }
      if (mx < .6 || (mx - mn) / mx < .2) continue;
      lit++;
      { const l1 = lin(d[i]), l2 = lin(d[i + 1]), l3 = lin(d[i + 2]);
        const l_ = cb(.4122214708 * l1 + .5363325363 * l2 + .0514459929 * l3), m_ = cb(.2119034982 * l1 + .6806995451 * l2 + .1073969566 * l3), s_ = cb(.0883024619 * l1 + .2817188376 * l2 + .6299787005 * l3);
        const A = 1.9779984951 * l_ - 2.428592205 * m_ + .4505937099 * s_, Bb = .0259040371 * l_ + .7827717662 * m_ - .808675766 * s_;
        oh[Math.floor(((Math.atan2(Bb, A) * 180 / Math.PI + 360) % 360) / 10) % 36]++; }
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
    const out = { pct, lit, bright, grey, oh, ground: med(rg), parts: parts.map(q => { const e = at(q.edge, .75), n = med(q.near), f = med(q.face), o = med(q.pool); return { ch: q.ch, edge: cr(e, n), face: cr(f, n), pool: cr(f, o), near: n }; }) };
    if (!stage) return out;
    // the stage: everything but the hint, the colour control, and the line and the apps under the name (which are
    // not the room), outside the name's box
    const skip = new Uint8Array(W * H);
    const hint = [...document.querySelectorAll('.hero__hint span')].find(s => getComputedStyle(s).display !== 'none'), hue = document.querySelector('.hue__button');
    const under = [...document.querySelectorAll('.hero__line, .hero .app')].filter(e => getComputedStyle(e).display !== 'none' && getComputedStyle(e.closest('.hero__below')).display !== 'none');
    for (const el of [hint, hue, ...under].filter(Boolean)) { const b = el.getBoundingClientRect(); for (let y = Math.max(0, Math.floor((b.top - 10) * k)); y < Math.min(H, Math.ceil((b.bottom + 10) * k)); y++) for (let x = Math.max(0, Math.floor((b.left - 10) * k)); x < Math.min(W, Math.ceil((b.right + 10) * k)); x++) skip[y * W + x] = 1; }
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

// Text over glass against what is actually behind it: for each box ({ x, y, w, h, c: its computed colour }), the median
// of a ring of screenshot pixels round it, the text blended into it if translucent, and the contrast ratio.
export async function ringContrast(page, boxes) {
  const lum = ([r, g, b]) => { const f = c => { c /= 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
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
  return boxes.map((b, i) => {
    const a = b.c.length > 3 ? b.c[3] : 1;
    const text = b.c.slice(0, 3).map((v, j) => v * a + ring[i][j] * (1 - a));
    const L1 = lum(text), L2 = lum(ring[i]);
    return (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
  });
}
