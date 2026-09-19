/* ============================================================
   FIELD — the hero background from priyandesai.com, extended.

   The original is a Framer code component ("ASCII Background") that
   runs two WebGL passes: a simplex-noise "rainbow" texture, then an
   ASCII pass that samples it per cell and maps density to a glyph and
   a 3-stop colour palette. This is a dependency-free 2D-canvas port
   of that exact pipeline:

     n     = simplex3(uv * freq, t * speed)      (uv aspect-corrected)
     hue   = |n|;  rgb = hsv2rgb(hue, 1, value)
     gray  = luminance(rgb) ^ gamma
     g     = clamp(gray + bias)
     glyph = chars[round(g * (chars.length - 1))]
     color = 3-stop mix(grey → deep → hi) at g, with per-stop alpha

   Noise is sampled once per 2×2 block of cells (the shader quantises
   at cell*2), which is what gives the field its paired glyphs.
   Measured on the reference: 22px cells, '*' low / '/' high,
   greys → #7C1E2A (mid) → #E61E32 (bright).

   Added here:
     - pointer: density lifts inside a radius around the cursor
     - wave: a circular front from an origin reveals the field — cells
       ahead of it are empty, cells on it flash as scrambled glyphs,
       cells behind it settle (the Mystique reveal after the loader);
       `pulse` runs the same front over a visible field on every
       panel change
     - dim: the field fades to `dim` behind the chapters
     - tuner: cell size, glyph size, frequency, speed, vibrancy, cursor
       radius/strength and dim are live settings (window.LCField),
       persisted in localStorage by this file

   The palette follows the name card: namecard.js dispatches
   `lc:palette` {hi, deep, lit} and the field recolours.
   ============================================================ */
(function () {
  'use strict';

  var cv = document.getElementById('field');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var KEY = 'lc-field';

  /* ---------- settings ---------- */
  var DEFAULTS = {
    cursorScr: 0.85, // how hard the cursor scrambles the glyphs under it
    cell: 22,        // px per glyph cell (measured on the reference)
    glyph: 0.82,     // glyph font size as a share of the cell (18px at 22)
    freq: 4.5,       // noise frequency   (component default .5  → 4.5)
    speed: 1,        // × the reference time speed (.375 → .1875/s)
    vibrancy: 1,     // × tier alpha; >1 also lifts the mid and bright tones
    cursorR: 180,    // px, pointer influence radius
    cursorK: 0.6,    // pointer influence strength
    dim: 0.22,       // field alpha behind the chapters
    /* Two brightness dials, kept apart on purpose. Both scale the tone a cell
       is painted at without touching which glyph it picks, so a picture keeps
       its shape and the noise keeps its texture: only how far up the palette
       they sit changes. `artLift` is how far a picture stands off the field;
       `fieldLift` is how bright the field itself burns. */
    artLift: 1.6,    // × the tone a picture's cells are painted at; above 1 it also
                     //   lifts the picture's alpha out of the chapter dim, to full at 2
    fieldLift: 1     // × the tone the noise is painted at
  };
  var RANGE = { cell: [6, 60], glyph: [0.2, 2], freq: [0.2, 20], speed: [0, 5], vibrancy: [0, 3], cursorR: [0, 1200], cursorK: [0, 3], cursorScr: [0, 1], dim: [0, 1], artLift: [0, 2], fieldLift: [0, 2] };
  var FIXED = {
    chars: '*/',            // low → high density
    gamma: 1.0,             // luminance gamma (component default 5.5 → 1.5; 1.0 matches the reference's bright share)
    bias: 0,
    value: 1,
    fps: 30,                // the original throttles to ~30fps
    levels: 16,             // colour steps in the sprite cache
    baseSpeed: 0.1875,
    font: 'ui-monospace, Menlo, Consolas, monospace',
    scr: '░▒▓#+=:·'         // glyphs flashed on the wave front
  };
  var TIER_A = { grey: 0.28, deep: 0.85, hi: 1 };

  function load() { try { var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} }
  function sanitize(o) {
    var out = {};
    for (var k in DEFAULTS) {
      var v = parseFloat(o && o[k]);
      if (!isFinite(v)) v = DEFAULTS[k];
      out[k] = Math.max(RANGE[k][0], Math.min(RANGE[k][1], v));
    }
    return out;
  }
  var saved = load();
  /* artLift at 1 was the old default and did nothing a viewer could see, so a
     browser that saved it is carrying nothing worth keeping; take the new one */
  if (saved && saved.artLift === 1) delete saved.artLift;
  var cfg = sanitize(Object.assign({}, DEFAULTS, saved));

  /* ---------- simplex noise (Gustavson / Wagner, seeded) ---------- */
  var noise3 = (function () {
    var grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
    var p = new Uint8Array(256), i, j, t, seed = 1337;
    for (i = 0; i < 256; i++) p[i] = i;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    for (i = 255; i > 0; i--) { j = Math.floor(rnd() * (i + 1)); t = p[i]; p[i] = p[j]; p[j] = t; }
    var perm = new Uint8Array(512), permMod12 = new Uint8Array(512);
    for (i = 0; i < 512; i++) { perm[i] = p[i & 255]; permMod12[i] = perm[i] % 12; }
    var F3 = 1 / 3, G3 = 1 / 6;
    function dot(g, x, y, z) { return g[0] * x + g[1] * y + g[2] * z; }
    return function (xin, yin, zin) {
      var n0, n1, n2, n3;
      var s = (xin + yin + zin) * F3;
      var i = Math.floor(xin + s), j = Math.floor(yin + s), k = Math.floor(zin + s);
      var t = (i + j + k) * G3;
      var x0 = xin - (i - t), y0 = yin - (j - t), z0 = zin - (k - t);
      var i1, j1, k1, i2, j2, k2;
      if (x0 >= y0) {
        if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
        else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
      } else {
        if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
        else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
        else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      }
      var x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
      var x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3;
      var x3 = x0 - 1 + 3 * G3, y3 = y0 - 1 + 3 * G3, z3 = z0 - 1 + 3 * G3;
      var ii = i & 255, jj = j & 255, kk = k & 255;
      var gi0 = permMod12[ii + perm[jj + perm[kk]]];
      var gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]];
      var gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]];
      var gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]];
      var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
      if (t0 < 0) n0 = 0; else { t0 *= t0; n0 = t0 * t0 * dot(grad3[gi0], x0, y0, z0); }
      var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
      if (t1 < 0) n1 = 0; else { t1 *= t1; n1 = t1 * t1 * dot(grad3[gi1], x1, y1, z1); }
      var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
      if (t2 < 0) n2 = 0; else { t2 *= t2; n2 = t2 * t2 * dot(grad3[gi2], x2, y2, z2); }
      var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
      if (t3 < 0) n3 = 0; else { t3 *= t3; n3 = t3 * t3 * dot(grad3[gi3], x3, y3, z3); }
      return 32 * (n0 + n1 + n2 + n3);
    };
  })();

  /* ---------- colour ---------- */
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  // luminance of hsv2rgb(h, s, v) — the shader's rainbow pass
  function hsvLum(h, s, v) {
    var r = clamp01(Math.abs(((h + 1) % 1) * 6 - 3) - 1);
    var g = clamp01(Math.abs(((h + 2 / 3) % 1) * 6 - 3) - 1);
    var b = clamp01(Math.abs(((h + 1 / 3) % 1) * 6 - 3) - 1);
    var R = v * ((1 - s) + s * r), G = v * ((1 - s) + s * g), B = v * ((1 - s) + s * b);
    return 0.3 * R + 0.59 * G + 0.11 * B;
  }
  function hex(c) {
    c = String(c).trim().replace('#', '');
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    var n = parseInt(c, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix3(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function mix4(a, b, t) { return mix3(a, b, t).concat(a[3] + (b[3] - a[3]) * t); }

  var pal = { grey: cv.dataset.grey || '#4A4A4A', deep: cv.dataset.deep || '#7C1E2A', hi: cv.dataset.hi || '#E61E32', lit: cv.dataset.lit || '#F7A8AF', mul: 1 };
  var P1, P2, P3;
  function setPalette() {
    var v = cfg.vibrancy, up = Math.max(0, v - 1);
    var grey = hex(pal.grey);
    var deep = mix3(hex(pal.deep), hex(pal.hi), up * 0.5);
    var hi = mix3(hex(pal.hi), hex(pal.lit), up * 0.45);
    var m = pal.mul || 1;                       // the light ground needs a quieter field
    P1 = grey.concat(clamp01(TIER_A.grey * v * m));
    P2 = deep.concat(clamp01(TIER_A.deep * v * m));
    P3 = hi.concat(clamp01(TIER_A.hi * v * m));
  }
  // 3-stop palette at density g, exactly as the shader mixes it
  function colorAt(g) {
    var t = g * 2;
    var c = mix4(P1, P2, clamp01(t));
    return mix4(c, P3, clamp01(t - 1));
  }

  /* ---------- sprite cache: one tile per (glyph, colour level) ---------- */
  var W = 0, H = 0, dpr = 1, cols = 0, rows = 0, sprites = [], scr = [], scrL = [];
  function tile(ch, c, cellSize, glyphScale) {
    var cell = cellSize || cfg.cell, t = document.createElement('canvas');
    t.width = t.height = Math.ceil(cell * dpr);
    var tc = t.getContext('2d');
    tc.scale(dpr, dpr);
    tc.font = Math.max(4, Math.round(cell * (glyphScale || cfg.glyph))) + 'px ' + FIXED.font;
    tc.textAlign = 'center'; tc.textBaseline = 'middle';
    tc.fillStyle = 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + c[3].toFixed(3) + ')';
    tc.fillText(ch, cell / 2, cell / 2 + cell * 0.04);
    return t;
  }
  function buildSprites() {
    sprites = []; scr = [];
    /* A picture's glyphs are tiles with the palette baked in, exactly like the
       noise's, so they go stale on the same events. Dropping them here means
       every caller that rebuilds the noise rebuilds the picture too, rather
       than the picture keeping the colour of whatever palette it was mounted
       under while the field around it changes. */
    artSprites = null;
    var n = FIXED.levels;
    for (var gi = 0; gi < FIXED.chars.length; gi++) {
      sprites[gi] = [];
      for (var L = 0; L < n; L++) sprites[gi][L] = tile(FIXED.chars[gi], colorAt(L / (n - 1)));
    }
    var flash = P3.slice(0, 3).concat(1);
    for (var k = 0; k < FIXED.scr.length; k++) {
      scr[k] = tile(FIXED.scr[k], flash);
      scrL[k] = [];
      for (var M = 0; M < n; M++) scrL[k][M] = tile(FIXED.scr[k], colorAt(M / (n - 1)));
    }
  }
  function size() {
    W = Math.max(1, innerWidth); H = Math.max(1, innerHeight);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / cfg.cell); rows = Math.ceil(H / cfg.cell);
    buildSprites();
    buildArt();
    if (reduce) draw(performance.now());
  }

  /* ---------- pointer, wave, dim ---------- */
  var ptr = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, k: 0, tk: 0 };
  if (fine && !reduce) {
    addEventListener('pointermove', function (e) {
      ptr.tx = e.clientX; ptr.ty = e.clientY; ptr.tk = 1;
      if (ptr.x < -1e3) { ptr.x = ptr.tx; ptr.y = ptr.ty; }
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', function () { ptr.tk = 0; });
    document.documentElement.addEventListener('mouseenter', function () { ptr.tk = 1; });
  }
  var hidden = !reduce;      // nothing is drawn until app.js reveals or shows the field
  var wave = null;
  var dimOn = false, dimA = 1;

  /* ---------- the art layer ----------
     Pictures drawn by the field's own cell loop, on the field's grid, at the
     field's cell size and alpha. Inside a picture's rectangle a cell paints a
     glyph from that picture's ramp instead of `*` or `/`; everywhere else the
     noise carries on. Nothing is composited over anything: the background
     simply takes the shape.

     Pictures register under a key and name the panel they belong to, and the
     field swaps between them on `lc:panel`. Two kinds:
       - fixed   — `{cols, rows, dens}`, resampled onto the grid once (the
                   portrait, baked from a photograph);
       - live    — `{aspect, live(now, gw, gh, out)}`, which fills the grid
                   itself every frame (the mask, which turns).

     Each arrives on a front sweeping the diagonal from its bottom-left corner
     to its top-right — noise ahead of it, scrambled glyphs on it, the picture
     behind — and leaves on the same front running backwards. ART_BAND is how
     much of that diagonal is mid-scramble at once, so it is really a duration:
     BAND / (1 + 2*BAND) * ART_MS, about 550ms per cell.

     The floors matter on the dark ground, where a subject's darkest parts land
     at the noise's own brightness and dissolve into it. A picture may set its
     own; the defaults suit a photograph. */
  var ART_MS = 2400, ART_BAND = 0.42, ART_LEV_FLOOR = 0.62, ART_RAMP_FLOOR = 6;
  var arts = {}, artKey = null, wantKey = null, art = null;
  var dg = null, gw = 0, gh = 0, gx0 = 0, gy0 = 0;
  var artSprites = null, artRamp = null, artP = 0, artLast = 0;

  function mount(key) {
    artKey = key || null;
    art = artKey ? arts[artKey] : null;
    buildArt();
    /* the page shows a picture's caption when the rest of it is hidden */
    document.dispatchEvent(new CustomEvent('lc:art', { detail: { key: artKey, caption: (art && art.caption) || '' } }));
  }
  function buildArt() {
    dg = null;
    if (!art || !W || !H) return;
    var cell = cfg.cell, x, y;
    gh = Math.max(6, Math.floor(H * 0.88 / cell));
    var ratio = (art.cols && art.rows) ? art.cols / art.rows : (art.aspect || 1);
    gw = Math.max(4, Math.round(gh * ratio));
    /* A picture is sized by its height, so a wide one can run past the sides
       of the window; that one is fitted to the width instead. */
    var wide = Math.floor(W * 0.96 / cell);
    if (gw > wide) { gw = Math.max(4, wide); gh = Math.max(6, Math.round(gw / ratio)); }
    gx0 = art.align === 'center'
      ? Math.max(0, Math.round((W - gw * cell) / 2 / cell))
      : Math.max(0, Math.round((W * 1.02 - gw * cell) / cell));   // default: off the right edge
    gy0 = Math.max(0, Math.round((H - gh * cell) / 2 / cell));
    dg = new Float32Array(gw * gh);
    if (!art.live) {
      /* Average each source block rather than picking one cell out of it. A
         picture is baked far finer than the grid it lands on — the crest is 150
         cells across and arrives on about 33 — and at that ratio a point sample
         keeps or drops a feature depending on nothing but where the cells happen
         to fall. It is what turned the crest's motto ribbon into noise, and what
         made the portrait shimmer as the window resized. A block that is mostly
         backdrop stays backdrop, so a silhouette keeps its edge rather than
         dissolving into a fringe of half-lit cells. */
      for (y = 0; y < gh; y++) {
        var ya = (y * art.rows / gh) | 0, yb = Math.max(ya + 1, ((y + 1) * art.rows / gh) | 0);
        for (x = 0; x < gw; x++) {
          var xa = (x * art.cols / gw) | 0, xb = Math.max(xa + 1, ((x + 1) * art.cols / gw) | 0);
          var sum = 0, on = 0, all = 0;
          for (var sy = ya; sy < yb; sy++) {
            for (var sx = xa; sx < xb; sx++) {
              var s = art.dens[sy * art.cols + sx];
              all++;
              if (s >= 0) { sum += s; on++; }
            }
          }
          dg[y * gw + x] = on * 2 >= all ? sum / on : -1;
        }
      }
    }
    if (artRamp !== art.ramp || !artSprites) {
      artRamp = art.ramp; artSprites = [];
      for (var i = 0; i < art.ramp.length; i++) {
        artSprites[i] = [];
        for (var L = 0; L < FIXED.levels; L++) artSprites[i][L] = tile(art.ramp.charAt(i), colorAt(L / (FIXED.levels - 1)));
      }
    }
  }
  function advanceArt(now) {
    var dt = artLast ? Math.min(100, now - artLast) : 16;
    artLast = now;
    artP = clamp01(artP + (artKey && artKey === wantKey ? 1 : -1) * dt / ART_MS);
    if (artP <= 0 && artKey !== wantKey) mount(wantKey);   // only swap once the last one has gone
    if (art && art.live && dg && artP > 0) art.live(now, gw, gh, dg);
  }
  /* Which picture belongs on screen. A picture names its `panel`, and may also
     name a `sub` — an entry's slug — for a subsection of it. The subsection's
     own picture wins where there is one; otherwise the panel's picture stands,
     which is what lets subsections be given art one at a time rather than all
     twenty at once. `lc:panel` clears the subsection, since leaving a panel
     unwinds any drill-down with it. */
  var atSect = null, atSub = null;
  function route() {
    var panelKey = null, subKey = null;
    for (var key in arts) {
      var a = arts[key];
      if (!a || a.panel !== atSect) continue;
      if (a.sub) { if (a.sub === atSub) subKey = key; }
      else if (!panelKey) panelKey = key;
    }
    wantKey = subKey || panelKey;
    if (!artKey && wantKey) mount(wantKey);
  }
  document.addEventListener('lc:panel', function (e) {
    atSect = (e.detail && e.detail.sect) || null; atSub = null; route();
  });
  document.addEventListener('lc:sub', function (e) {
    var d = e.detail || {};
    /* Leaving a panel unwinds its subsection, and that unwind lands *after*
       lc:panel has already moved on — so an announcement naming a panel we are
       no longer on is about where we came from, and following it would drag the
       old panel's picture onto the new one. The panel is lc:panel's to set. */
    if (d.sect && d.sect !== atSect) return;
    atSub = d.slug || null;
    route();
  });

  /* ---------- draw ---------- */
  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    if (hidden) return;
    ptr.x += (ptr.tx - ptr.x) * 0.18; ptr.y += (ptr.ty - ptr.y) * 0.18; ptr.k += (ptr.tk - ptr.k) * 0.1;
    var dimT = dimOn ? cfg.dim : 1;
    dimA += (dimT - dimA) * 0.08;
    if (Math.abs(dimT - dimA) < 0.003) dimA = dimT;

    advanceArt(now);
    var t = now / 1000, cell = cfg.cell, F = cfg.freq, S = FIXED.baseSpeed * cfg.speed, aspect = W / H;
    var nChars = FIXED.chars.length, nLev = FIXED.levels;
    var R2 = cfg.cursorR * cfg.cursorR, K = cfg.cursorK * ptr.k * 0.75, useK = K > 0.005 && R2 > 0;
    /* cells under the pointer stop reporting their density and start flickering
       through the scramble set instead; the rate falls off cubically, so the
       cell under the cursor changes almost every frame and one at the edge of
       the radius almost never does */
    var SCR = cfg.cursorScr * ptr.k, nScr = FIXED.scr.length, useScr = SCR > 0.005 && R2 > 0;
    var useArt = art && dg && artSprites && artP > 0.0005, nRamp = art ? art.ramp.length : 0;
    var AL = cfg.artLift, FL = cfg.fieldLift;
    /* Tone alone cannot lift a drawn piece: it already paints at full density,
       so scaling it clamps to nothing. Behind the chapters the whole canvas is
       at `dim`, and that alpha is what makes a picture read as faded. The top
       half of the dial carries the picture's alpha from the dim up to 1. */
    var artA = Math.min(1, dimA + (1 - dimA) * clamp01(AL - 1)), lifted = artA > dimA + 0.002;
    var aLev = art && art.levFloor != null ? art.levFloor : ART_LEV_FLOOR;
    var aRmp = art && art.rampFloor != null ? art.rampFloor : ART_RAMP_FLOOR;
    var artR = artP * (1 + 2 * ART_BAND) - ART_BAND;
    var uA = 1 / Math.max(1, gw - 1), uB = 1 / Math.max(1, gh - 1);
    var wv = wave, Rw = 0, band = 1;
    if (wv) { Rw = Math.max(0, (now - wv.t0) / 1000) * wv.speed; band = wv.band; }
    ctx.globalAlpha = dimA;

    for (var by = 0; by < rows; by += 2) {
      for (var bx = 0; bx < cols; bx += 2) {
        var u = (bx * cell) / W, v = (by * cell) / H;
        u = (u - 0.5) * aspect + 0.5;
        var n = noise3(u * F, v * F, t * S);
        var gray = hsvLum(Math.abs(n), 1, FIXED.value);
        gray = Math.pow(Math.min(1, Math.max(1e-4, gray)), FIXED.gamma);
        var g0 = clamp01(gray + FIXED.bias);
        for (var dy = 0; dy < 2; dy++) {
          for (var dx = 0; dx < 2; dx++) {
            var cx = bx + dx, cy = by + dy;
            if (cx >= cols || cy >= rows) continue;
            var px = cx * cell, py = cy * cell, g = g0, decode = false;
            if (useK || useScr) {
              var ddx = px + cell / 2 - ptr.x, ddy = py + cell / 2 - ptr.y, d2 = ddx * ddx + ddy * ddy;
              if (d2 < R2) {
                var near = 1 - d2 / R2;
                if (useK) g = clamp01(g + K * near);
                if (useScr && Math.random() < near * near * near * SCR) decode = true;
              }
            }
            if (wv) {
              var d = Math.hypot(px + cell / 2 - wv.ox, py + cell / 2 - wv.oy), p = (Rw - d) / band;
              if (p < 0) {
                if (!wv.pulse) continue;                       // reveal: nothing ahead of the front
              } else if (p < 1) {
                ctx.globalAlpha = (wv.pulse ? Math.max(dimA, 0.45) : dimA) * (0.25 + 0.75 * p);
                ctx.drawImage(scr[(Math.random() * scr.length) | 0], px, py, cell, cell);
                ctx.globalAlpha = dimA;
                continue;
              } else if (p < 1.6 && Math.random() < (1.6 - p) * 1.2) {
                ctx.drawImage(sprites[(Math.random() * nChars) | 0][Math.round(g * (nLev - 1))], px, py, cell, cell);
                continue;
              }
            }
            var set = null, lev = Math.round(clamp01(g * FL) * (nLev - 1)), isArt = false;
            if (useArt && !decode) {
              var ax = cx - gx0, ay = cy - gy0;
              if (ax >= 0 && ay >= 0 && ax < gw && ay < gh) {
                var ad = dg[ay * gw + ax];
                if (ad >= 0 && (artR - (ax * uA + (gh - 1 - ay) * uB) / 2) >= 0) {
                  var q = artR - (ax * uA + (gh - 1 - ay) * uB) / 2;
                  lev = Math.round(clamp01((aLev + ad * (1 - aLev)) * AL) * (nLev - 1));
                  isArt = true;
                  set = q >= ART_BAND
                    ? artSprites[aRmp + Math.round(ad * (nRamp - 1 - aRmp))]
                    : scrL[(Math.random() * nScr) | 0];
                }
              }
            }
            if (!set) set = decode ? scrL[(Math.random() * nScr) | 0] : sprites[Math.round(g * (nChars - 1))];
            if (isArt && lifted) {
              ctx.globalAlpha = artA;
              ctx.drawImage(set[lev], px, py, cell, cell);
              ctx.globalAlpha = dimA;
            } else {
              ctx.drawImage(set[lev], px, py, cell, cell);
            }
          }
        }
      }
    }
    if (wv) {
      var far = Math.hypot(Math.max(wv.ox, W - wv.ox), Math.max(wv.oy, H - wv.oy));
      if (Rw - band * 1.6 > far) wave = null;
    }
    ctx.globalAlpha = 1;
  }

  function mkWave(o, pulse) {
    return { ox: o.ox, oy: o.oy, t0: o.t0 || performance.now(), speed: o.speed || 1000, band: o.band || 160, pulse: pulse };
  }

  /* ---------- public API ---------- */
  var api = {
    defaults: Object.assign({}, DEFAULTS),
    get: function () { return Object.assign({}, cfg); },
    set: function (patch) {
      var prev = cfg;
      cfg = sanitize(Object.assign({}, cfg, patch));
      var geo = cfg.cell !== prev.cell || cfg.glyph !== prev.glyph;
      if (cfg.vibrancy !== prev.vibrancy) setPalette();
      if (geo) size(); else if (cfg.vibrancy !== prev.vibrancy) { buildSprites(); buildArt(); }
      save();
      document.dispatchEvent(new CustomEvent('lc:field', { detail: api.get() }));
      if (reduce) draw(performance.now());
    },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} api.set(DEFAULTS); },
    setArt: function (key, a) {
      arts[key] = a;
      /* re-registering the picture that is *currently up* has to repoint `art`,
         not only the table: buildArt reads `art`, so without this it rebuilds
         from the grid that was just replaced. This is the path both pictures
         take to flip polarity on lc:theme, and it is why the portrait used to
         keep the old polarity until you left the panel and came back. */
      if (key === artKey) { art = a; buildArt(); }
      else if (!artKey && wantKey === key) mount(key);
    },
    showArt: function (key) {
      wantKey = key || null;
      if (!artKey && wantKey) mount(wantKey);
      if (reduce) { artP = wantKey ? 1 : 0; draw(performance.now()); }
    },
    reveal: function (o) { hidden = false; wave = mkWave(o, false); },
    pulse: function (o) { if (hidden || reduce) return; wave = mkWave(o, true); },
    show: function () { hidden = false; wave = null; if (reduce) draw(performance.now()); },
    setDim: function (on) { dimOn = !!on; if (reduce) { dimA = dimOn ? cfg.dim : 1; draw(performance.now()); } }
  };
  window.LCField = api;

  document.addEventListener('lc:palette', function (e) {
    var d = e.detail || {};
    if (d.hi) pal.hi = d.hi; if (d.deep) pal.deep = d.deep; if (d.lit) pal.lit = d.lit; if (d.grey) pal.grey = d.grey; if (d.mul) pal.mul = d.mul;
    setPalette(); buildSprites(); buildArt();
    if (reduce) draw(performance.now());
  });

  /* ---------- lifecycle ---------- */
  setPalette();
  size();
  addEventListener('resize', size);
  if (!reduce) {
    var last = 0, minDt = 1000 / FIXED.fps;
    (function loop(ts) {
      requestAnimationFrame(loop);
      if (document.hidden || ts - last < minDt) return;
      last = ts;
      draw(ts);
    })(0);
  }
})();
