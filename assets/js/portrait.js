/* ============================================================
   PORTRAIT — the photograph, as ASCII, handed to the field.

   This file draws nothing. It produces a grid of densities and gives it to
   field.js, which renders it into the background canvas — so it dims, reveals
   and lives with the field rather than sitting over it in the DOM.

   Two sources, in order:

     1. `window.LCPortrait`, baked by tools/make-portrait.py. This is the normal
        path. It exists because the live path below needs `getImageData`, and a
        canvas that has drawn a `file://` image is tainted — so opening
        index.html straight off disk would silently produce nothing at all.
     2. Failing that, the photograph itself, keyed here at runtime. Only works
        when the page is served over http(s); useful while swapping photos.

   What is stored is luminance, not ink. Which end of it becomes heavy ink flips
   with the ground: on paper the dark parts of the photograph are the ink, and
   on the dark ground it is the other way round, or the portrait reads as its
   own negative. `lc:theme` re-emits the grid with the other polarity.

   The runtime keying is three ideas, each load-bearing:
     - flood fill inward from the border, not a luminance threshold, so only
       backdrop connected to the edge is taken and a light shirt enclosed by a
       dark suit is never reached;
     - every candidate judged against one reference colour rather than against
       the neighbour it came from, because chained tolerance walks through the
       blended cells along a hairline straight into the face;
     - matched on colour *cast* rather than colour, because a studio backdrop is
       vignetted: its luminance drifts across the frame while its chromaticity
       does not. Skin is strongly warm where a grey backdrop is neutral.
   What survives is cleaned of speckle by dropping tiny components — never by
   keeping the largest, which throws the head away when a collar keys out.
   ============================================================ */
(function () {
  'use strict';

  var SRC = 'assets/img/portrait.jpg';
  var COLS = 150, EDGE_LUM = 0.68, CHROMA = 22;
  /* light → dark, sixteen steps. Any characters at all: this is ASCII art, not
     the field's two-glyph density ramp. */
  var RAMP = " .'`:;-~+=*#%&@$";
  var ON_PANEL = 'about';
  var HEX = '0123456789abcdef';

  var root = document.documentElement;
  var norm = null, cols = 0, rows = 0;      // auto-levelled luminance, -1 = backdrop

  if (!window.LCField || !window.LCField.setArt) return;

  if (window.LCPortrait && window.LCPortrait.grid) fromBaked(window.LCPortrait);
  else fromPhoto();

  /* ---------- the baked grid ---------- */
  function fromBaked(p) {
    cols = p.cols; rows = p.rows;
    var levels = p.levels || 16, max = levels - 1;
    norm = new Float32Array(cols * rows);
    for (var y = 0; y < rows; y++) {
      var line = p.grid[y] || '';
      for (var x = 0; x < cols; x++) {
        var ch = line.charAt(x), i = HEX.indexOf(ch);
        norm[y * cols + x] = (ch === '' || ch === ' ' || i < 0) ? -1 : i / max;
      }
    }
    ready();
  }

  /* ---------- keying the photograph here, when the page is served ---------- */
  function fromPhoto() {
    var img = new Image();
    img.decoding = 'async';
    img.onerror = function () {};
    img.onload = function () {
      try { key(img); }
      catch (e) {
        // a file:// canvas is tainted; say so rather than failing mutely
        if (console && console.info) console.info('[portrait] cannot read the photograph here — run tools/make-portrait.py, or serve the folder over http.');
      }
    };
    img.src = SRC;
  }

  function key(img) {
    var sc = COLS, sr = Math.max(8, Math.round(sc * (img.naturalHeight / img.naturalWidth)));
    var c = document.createElement('canvas');
    c.width = sc; c.height = sr;
    var g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, sc, sr);
    var px = g.getImageData(0, 0, sc, sr).data;          // throws on a tainted canvas

    var N = sc * sr, lum = new Float32Array(N), i, x, y;
    for (i = 0; i < N; i++) lum[i] = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;

    var edge = [];
    function collect(ex, ey) { var k = ey * sc + ex; if (lum[k] >= EDGE_LUM) edge.push(k); }
    for (x = 0; x < sc; x++) { collect(x, 0); collect(x, sr - 1); }
    for (y = 0; y < sr; y++) { collect(0, y); collect(sc - 1, y); }
    if (!edge.length) return;
    var ref = [0, 1, 2].map(function (ch) {
      var v = edge.map(function (k) { return px[k * 4 + ch]; }).sort(function (a, b) { return a - b; });
      return v[v.length >> 1];
    });
    var refRB = ref[0] - ref[2], refGB = ref[1] - ref[2];
    function isBackdrop(k) {
      if (lum[k] < EDGE_LUM) return false;
      var r = px[k * 4], gg = px[k * 4 + 1], b = px[k * 4 + 2];
      return Math.abs((r - b) - refRB) <= CHROMA && Math.abs((gg - b) - refGB) <= CHROMA;
    }
    var bg = new Uint8Array(N), q = [];
    edge.forEach(function (k) { if (!bg[k] && isBackdrop(k)) { bg[k] = 1; q.push(k); } });
    flood(bg, q, sc, sr, isBackdrop);

    var seen = new Uint8Array(N), MIN = Math.max(8, Math.round(N * 0.004));
    var notBg = function (k) { return !bg[k]; };
    for (i = 0; i < N; i++) {
      if (bg[i] || seen[i]) continue;
      var comp = [i], st = [i];
      seen[i] = 1;
      flood(seen, st, sc, sr, notBg, comp);
      if (comp.length < MIN) for (var z = 0; z < comp.length; z++) bg[comp[z]] = 1;
    }

    var lo = 1, hi = 0, v = new Float32Array(N);
    for (i = 0; i < N; i++) {
      if (bg[i]) { v[i] = -1; continue; }
      v[i] = lum[i];
      if (lum[i] < lo) lo = lum[i];
      if (lum[i] > hi) hi = lum[i];
    }
    var span = Math.max(0.001, hi - lo);

    var x0 = sc, x1 = -1, y0 = sr, y1 = -1;
    for (y = 0; y < sr; y++) {
      for (x = 0; x < sc; x++) {
        if (bg[y * sc + x]) continue;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
    if (x1 < x0 || y1 < y0) return;
    cols = x1 - x0 + 1; rows = y1 - y0 + 1;
    norm = new Float32Array(cols * rows);
    for (y = 0; y < rows; y++) {
      for (x = 0; x < cols; x++) {
        var s = v[(y + y0) * sc + (x + x0)];
        norm[y * cols + x] = s < 0 ? -1 : Math.pow((s - lo) / span, 0.85);
      }
    }
    ready();
  }

  /* ---------- polarity, and handing it over ---------- */
  function emit() {
    if (!norm) return;
    var dark = root.getAttribute('data-theme') !== 'light';
    var dens = new Float32Array(norm.length);
    for (var i = 0; i < norm.length; i++) {
      // on the dark ground the bright parts of the photograph are the ink;
      // on paper it is the dark parts, or the portrait reads as its own negative
      dens[i] = norm[i] < 0 ? -1 : (dark ? norm[i] : 1 - norm[i]);
    }
    window.LCField.setArt('portrait', {
      cols: cols, rows: rows, dens: dens, ramp: RAMP, panel: ON_PANEL,
      caption: 'Portrait, from a photograph.'
    });
  }
  function ready() {
    emit();                                  // the field owns which panel shows what
    document.addEventListener('lc:theme', emit);
    var here = document.querySelector('.panel.is-active');
    if (here && here.dataset.sect === ON_PANEL) window.LCField.showArt('portrait');
  }

  function flood(mark, stack, w, h, ok, out) {
    while (stack.length) {
      var k = stack.pop(), kx = k % w, ky = (k / w) | 0;
      var n = [[kx - 1, ky], [kx + 1, ky], [kx, ky - 1], [kx, ky + 1]];
      for (var j = 0; j < 4; j++) {
        var nx = n[j][0], ny = n[j][1];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        var nk = ny * w + nx;
        if (mark[nk] || !ok(nk)) continue;
        mark[nk] = 1; stack.push(nk);
        if (out) out.push(nk);
      }
    }
  }
})();
