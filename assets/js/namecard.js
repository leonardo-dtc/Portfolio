/* ============================================================
   NAME CARD — port of the terminal header on sergzorin.com.

   - typed prompt with a blinking caret (starts with the first wave)
   - the name as ASCII block art, two lines, a vertical gradient clipped
     to the glyphs, sized to the column (font-size = width / (chars*.62))
   - waves: `lc:wave` blooms the name outward from an origin (blank →
     scramble → settled), `lc:wave-out` collapses it back toward the
     origin; both carry {ox, oy, t0, speed, band} in viewport px
   - tap/click the name: glitch, then a new art style + palette

   The reference hand-draws five artworks for "SERG / ZORIN". Here the
   art is rasterised from a 5×7 bitmap font so any name works; four of
   his styles are reproduced as cell renderers (halftone ▐▓▓ default).

   Palettes carry the gradient (g), the UI accent (ac), the field's
   bright glyph colour (hi), its mid tone (deep) and the light stop (lit).
   `themed()` derives the light-theme version of each (darker accent
   with ≥4.5:1 on the paper ground, paler field mid tone). Applying one
   sets --ac / --ac-rgb / --ac-hi / --ac-ink on :root and dispatches
   `lc:palette` for field.js. Default = crimson, matched to
   priyandesai.com's reds. RANDOM_ON_LOAD mirrors the reference's
   per-reload shuffle; it is off.
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var motionPreference = matchMedia('(prefers-reduced-motion:reduce)');
  var reduce = motionPreference.matches;
  motionPreference.addEventListener('change', function (e) { reduce = e.matches; });
  var root = document.documentElement;

  var RANDOM_ON_LOAD = false;
  var PAPER = '#F4F2EC';

  var PALETTES = [
    { name: 'crimson', g: 'linear-gradient(180deg,#F7A8AF 0%,#E61E32 45%,#C73B4C 100%)', ac: '#F2455A', hi: '#E61E32', deep: '#7C1E2A', lit: '#F7A8AF' },
    { name: 'coral',   g: 'linear-gradient(180deg,#EC9A9A 0%,#D06262 45%,#AD6262 100%)', ac: '#E18585', hi: '#E18585', deep: '#7E3A3A', lit: '#EC9A9A' },
    { name: 'silver',  g: 'linear-gradient(180deg,#E4E7EF 0%,#B2B7C6 45%,#6A6E7C 100%)', ac: '#D2D6E0', hi: '#D2D6E0', deep: '#6A6E7C', lit: '#E4E7EF' },
    { name: 'purple',  g: 'linear-gradient(180deg,#C9A8FF 0%,#9B6FE6 45%,#8968B9 100%)', ac: '#B585F2', hi: '#B585F2', deep: '#5E4694', lit: '#C9A8FF' },
    { name: 'blue',    g: 'linear-gradient(180deg,#A8C6F7 0%,#6E92DC 45%,#657DB1 100%)', ac: '#8AAEE8', hi: '#8AAEE8', deep: '#42588E', lit: '#A8C6F7' },
    { name: 'green',   g: 'linear-gradient(180deg,#AEE3B9 0%,#6FB983 45%,#467E54 100%)', ac: '#8FD79E', hi: '#8FD79E', deep: '#467E54', lit: '#AEE3B9' },
    { name: 'gold',    g: 'linear-gradient(180deg,#F2DA78 0%,#D8B63E 45%,#7D6726 100%)', ac: '#E6C44C', hi: '#E6C44C', deep: '#7D6726', lit: '#F2DA78' }
  ];

  /* ---------- 5×7 bitmap font ('#' on, '.' off; widths may vary) ---------- */
  var FONT = {
    A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
    C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
    D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
    E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
    F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
    G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'],
    H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
    J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
    K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
    L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
    M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
    N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
    O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
    Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
    R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
    S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
    T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
    W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
    X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
    Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
    Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
    0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
    1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
    2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
    3: ['#####', '...#.', '..#..', '...#.', '....#', '#...#', '.###.'],
    4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
    5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
    6: ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
    7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
    8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
    9: ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
    ' ': ['..', '..', '..', '..', '..', '..', '..'],
    '-': ['.....', '.....', '.....', '.###.', '.....', '.....', '.....'],
    '.': ['..', '..', '..', '..', '..', '##', '##'],
    "'": ['#', '#', '.', '.', '.', '.', '.']
  };
  FONT['’'] = FONT["'"];

  /* ---------- cell renderers = the reference's art styles ---------- */
  function shade(str, tr, rows) { return str.charAt(Math.round(tr * (str.length - 1) / (7 * rows - 1))); }
  var STYLES = [
    { name: 'halftone', rows: 2, sh: '▓▓▓▓▓▓▓▓▒░░▒▓▓',
      on: function (tr, first, last, wide) { var s = shade(this.sh, tr, wide ? 2 : 1); return wide ? (first ? '▐' : s) + s : s; } },
    { name: 'blocks', rows: 2, sh: '███▓▓▓▒▒▒░░░░░',
      on: function (tr, first, last, wide) { var s = shade(this.sh, tr, wide ? 2 : 1); return wide ? s + s : s; } },
    { name: 'rounded', rows: 2,
      on: function (tr, first, last, wide) { if (!wide) return '▓'; return (first ? '▐' : '▓') + (last ? '▌' : '▓'); } },
    { name: 'figlet', rows: 2, sh: '::::++++######',
      on: function (tr, first, last, wide) { var s = shade(this.sh, tr, wide ? 2 : 1); return wide ? s + s : s; } }
  ];

  function glyphsOf(text) { return Array.prototype.map.call(text.toUpperCase(), function (ch) { return FONT[ch] || FONT[' ']; }); }
  function widthOf(text, wide) {
    var g = glyphsOf(text), w = 0;
    for (var i = 0; i < g.length; i++) w += g[i][0].length * (wide ? 2 : 1);
    return w + Math.max(0, g.length - 1);
  }
  function raster(text, style, wide) {
    var glyphs = glyphsOf(text), lines = [], rows = wide ? style.rows : 1;
    for (var br = 0; br < 7; br++) {
      for (var rr = 0; rr < rows; rr++) {
        var tr = br * rows + rr, line = '';
        for (var gi = 0; gi < glyphs.length; gi++) {
          var row = glyphs[gi][br], w = row.length;
          for (var c = 0; c < w; c++) {
            if (row.charAt(c) === '#') {
              var first = c === 0 || row.charAt(c - 1) !== '#';
              var last = c === w - 1 || row.charAt(c + 1) !== '#';
              line += style.on(tr, first, last, wide);
            } else line += wide ? '  ' : ' ';
          }
          if (gi < glyphs.length - 1) line += ' ';
        }
        lines.push(line.replace(/\s+$/, ''));
      }
    }
    return lines.join('\n');
  }

  /* ---------- colour helpers ---------- */
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function rgb(hex) { hex = hex.replace('#', ''); var n = parseInt(hex, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function toHex(c) { return '#' + c.map(function (v) { return Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'); }).join(''); }
  function shadeHex(hex, k) { return toHex(rgb(hex).map(function (v) { return v * k; })); }
  function mixHex(a, b, t) { var A = rgb(a), B = rgb(b); return toHex(A.map(function (v, i) { return v + (B[i] - v) * t; })); }
  function lum(hex) {
    var c = rgb(hex).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function inkFor(ac) { var l = lum(ac); return (l + 0.05) / (lum('#07060A') + 0.05) >= (lum('#F5F3EE') + 0.05) / (l + 0.05) ? '#07060A' : '#F5F3EE'; }
  function isLight() { return root.getAttribute('data-theme') === 'light'; }
  /* the palette as it should read on the current ground */
  function themed(pal) {
    if (!isLight()) return { ac: pal.ac, acHi: pal.lit, hi: pal.hi, deep: pal.deep, lit: pal.lit, grey: '#4A4A4A', mul: 1, g: pal.g };
    var k = 0.74, ac = shadeHex(pal.ac, k);
    while (lum(ac) > 0.155 && k > 0.35) { k -= 0.04; ac = shadeHex(pal.ac, k); }   // 0.155 keeps ≥4.5:1 on PAPER
    var hi = shadeHex(pal.hi, Math.min(0.92, k + 0.12));
    return {
      ac: ac, acHi: shadeHex(ac, 0.72), hi: hi, deep: mixHex(hi, PAPER, 0.5), lit: pal.ac, grey: '#A8A6AE', mul: 0.55,
      g: 'linear-gradient(180deg,' + shadeHex(pal.ac, Math.min(1, k + 0.24)) + ' 0%,' + ac + ' 50%,' + shadeHex(ac, 0.6) + ' 100%)'
    };
  }

  /* ---------- typed prompt ----------
     Leaving the hero backspaces the command rather than fading it out, the way
     the status bar's line clears; coming back types it again. */
  var typed = false, typeTok = 0;
  function typePrompt() {
    if (typed) return; typed = true;
    var t = $('#typed'); if (!t) return;
    var s = t.getAttribute('data-cmd') || './portfolio';
    if (reduce) { t.textContent = s; return; }
    var i = 0, tok = ++typeTok;
    (function step() {
      if (typeTok !== tok) return;
      t.textContent = s.slice(0, i++);
      if (i <= s.length) setTimeout(step, 54);
    })();
  }
  function untypePrompt() {
    var t = $('#typed'); if (!t) return;
    typed = false;
    var tok = ++typeTok;
    if (reduce) { t.textContent = ''; return; }
    var i = t.textContent.length;
    (function step() {
      if (typeTok !== tok) return;
      t.textContent = t.textContent.slice(0, i--);
      if (i >= 0) setTimeout(step, 26);
    })();
  }

  /* ---------- the name ---------- */
  var nb = $('#nameblock'), a1 = $('#art1'), a2 = $('#art2');
  if (!nb || !a1 || !a2) return;
  var NAME = [nb.getAttribute('data-line1') || 'Leonardo', nb.getAttribute('data-line2') || 'Carvalho'];
  var cur = RANDOM_ON_LOAD ? { style: pick(STYLES), pal: pick(PALETTES) } : { style: STYLES[0], pal: PALETTES[0] };
  var busy = false, shown = false, waveTok = 0;
  var GL = '░▒▓█▞▚';

  /* The paged hero cannot scroll, so there the name also yields to the height:
     the lines under it (role, note, way in, hint) keep clear of the status bar.
     `room` is the height left for the two <pre>s; flowing layouts scroll and
     keep the width-only fit. */
  var paged = matchMedia('(min-width: 900px) and (min-height: 620px)');
  function room() {
    var bar = $('#sbar'), last = $('.name-hint');
    if (!paged.matches || !bar || !last || !nb.offsetParent) return Infinity;
    var r = nb.getBoundingClientRect(), under = last.getBoundingClientRect().bottom - r.bottom;
    return bar.getBoundingClientRect().top - 24 - under - r.top - 28;   // 28: the name block's own padding
  }
  function fit() {
    var avail = Math.max(120, nb.clientWidth), tall = room();
    var size = function (wide) {                          // two names of 7 bitmap rows, 2 text rows each when wide, .45em apart
      var len = Math.max(widthOf(NAME[0], wide), widthOf(NAME[1], wide));
      return Math.min(avail / (len * 0.62), tall / (14 * (wide ? 2 : 1) + 0.45));
    };
    var wide = true, fs = size(true);
    if (fs < 9) { wide = false; fs = size(false); }
    return { wide: wide, fs: Math.max(6, Math.min(24, fs)) };
  }
  function strings() {
    var f = fit();
    return { fs: f.fs, s1: raster(NAME[0], cur.style, f.wide), s2: raster(NAME[1], cur.style, f.wide) };
  }
  function blank(s) { return s.replace(/[^\n]/g, ' '); }
  function paint(s1, s2, fs, g) {
    a1.textContent = s1; a2.textContent = s2;
    [a1, a2].forEach(function (el) {
      el.style.fontSize = fs + 'px';
      el.style.background = g;
      el.style.webkitBackgroundClip = 'text';
      el.style.backgroundClip = 'text';
    });
  }
  function applyName() {
    var st = strings(), t = themed(cur.pal);
    if (shown) paint(st.s1, st.s2, st.fs, t.g); else paint(blank(st.s1), blank(st.s2), st.fs, t.g);
    root.style.setProperty('--ac', t.ac);
    root.style.setProperty('--ac-rgb', rgb(t.ac).join(','));
    root.style.setProperty('--ac-hi', t.acHi);
    root.style.setProperty('--ac-ink', inkFor(t.ac));
    root.setAttribute('data-palette', cur.pal.name);
    root.setAttribute('data-art', cur.style.name);
    document.dispatchEvent(new CustomEvent('lc:palette', { detail: { name: cur.pal.name, ac: t.ac, hi: t.hi, deep: t.deep, lit: t.lit, grey: t.grey, mul: t.mul } }));
  }
  applyName();
  addEventListener('resize', function () { if (!waveTok) applyName(); });
  document.addEventListener('lc:theme', function () { applyName(); });

  function measureAdv(fs) {
    var c = document.createElement('canvas').getContext('2d');
    c.font = fs + 'px ' + getComputedStyle(a1).fontFamily;
    return c.measureText('▓').width || fs * 0.6;
  }
  /* geometry shared by both waves: where every glyph sits on screen */
  function layout(o) {
    var st = strings(), adv = measureAdv(st.fs), far = 0;
    var pres = [{ el: a1, lines: st.s1.split('\n') }, { el: a2, lines: st.s2.split('\n') }];
    pres.forEach(function (p) {
      p.r = p.el.getBoundingClientRect();
      [[p.r.left, p.r.top], [p.r.right, p.r.top], [p.r.left, p.r.bottom], [p.r.right, p.r.bottom]].forEach(function (c) {
        far = Math.max(far, Math.hypot(c[0] - o.ox, c[1] - o.oy));
      });
    });
    return { st: st, adv: adv, far: far, pres: pres };
  }
  function render(L, o, R, inward) {
    L.pres.forEach(function (p) {
      var out = p.lines.map(function (line, row) {
        var y = p.r.top + (row + 0.5) * L.st.fs, s = '';
        for (var col = 0; col < line.length; col++) {
          var ch = line.charAt(col);
          if (ch === ' ') { s += ' '; continue; }
          var x = p.r.left + (col + 0.5) * L.adv, d = Math.hypot(x - o.ox, y - o.oy);
          var q = inward ? (d - R) / o.band : (R - d) / o.band;   // <0 untouched side, 0..1.4 scrambling, beyond: the other side
          if (inward) s += q < 0 ? ch : q < 1.4 ? GL.charAt((Math.random() * GL.length) | 0) : ' ';
          else s += q < 0 ? ' ' : q < 1.4 ? GL.charAt((Math.random() * GL.length) | 0) : ch;
        }
        return s;
      });
      p.el.textContent = out.join('\n');
    });
  }
  /* bloom outward from the origin: blank → scramble → settled */
  function waveIn(o) {
    shown = true;
    var t = themed(cur.pal);
    if (reduce) { waveTok = 0; applyName(); return; }
    var L = layout(o), tok = ++waveTok;
    paint(blank(L.st.s1), blank(L.st.s2), L.st.fs, t.g);
    (function frame(now) {
      if (waveTok !== tok) return;
      var R = Math.max(0, (now - o.t0) / 1000) * o.speed;
      render(L, o, R, false);
      if (R - o.band * 1.4 > L.far) { waveTok = 0; applyName(); }
      else requestAnimationFrame(frame);
    })(performance.now());
  }
  /* collapse inward toward the origin: settled → scramble → blank */
  function waveOut(o) {
    if (reduce) { shown = false; waveTok = 0; applyName(); return; }
    var L = layout(o), tok = ++waveTok;
    (function frame(now) {
      if (waveTok !== tok) return;
      var R = L.far - Math.max(0, (now - o.t0) / 1000) * o.speed;
      render(L, o, R, true);
      if (R < -o.band * 1.4) { waveTok = 0; shown = false; applyName(); }
      else requestAnimationFrame(frame);
    })(performance.now());
  }

  document.addEventListener('lc:wave', function (e) {
    var o = e.detail || {};
    waveIn(o);
    var pr = $('.prompt');
    if (pr && o.speed) {
      var r = pr.getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - o.ox, r.top + r.height / 2 - o.oy);
      setTimeout(typePrompt, d / o.speed * 1000 + 150);
    } else typePrompt();
  });
  document.addEventListener('lc:wave-out', function (e) { untypePrompt(); waveOut(e.detail || {}); });
  document.addEventListener('lc:show', function () { shown = true; waveTok = 0; applyName(); typePrompt(); });
  setTimeout(function () { if (!shown && !waveTok) { shown = true; applyName(); typePrompt(); } }, 8000);   // failsafe

  /* ---------- the renderer, shared with app.js ----------
     The panel numerals are the same 5x7 raster in the same live palette, so
     [block] and a click on the name stay in step. */
  window.LCArt = {
    raster: function (text, wide) { return raster(String(text), cur.style, wide !== false); },
    gradient: function () { return themed(cur.pal).g; }
  };

  nb.addEventListener('click', function () {
    if (busy || !shown || waveTok) return; busy = true;
    var ns, np;
    do { ns = pick(STYLES); np = pick(PALETTES); } while (ns === cur.style && np === cur.pal);
    if (reduce) { cur = { style: ns, pal: np }; applyName(); busy = false; return; }
    var gl = function () {
      [a1, a2].forEach(function (el) {
        el.textContent = el.textContent.replace(/[^\n ]/g, function () { return GL.charAt((Math.random() * 6) | 0); });
      });
    };
    var n = 0, iv = setInterval(function () {
      gl();
      if (++n >= 4) { clearInterval(iv); cur = { style: ns, pal: np }; applyName(); busy = false; }
    }, 46);
  });
})();
