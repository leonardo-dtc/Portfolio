/* ============================================================
   SUBART — the pictures that belong to a single subsection.

   A panel has a picture; drilling into one of its entries can change it. This
   file draws nothing either: it reads the table baked by tools/make-subart.py
   and hands each entry to field.js, which routes on `lc:sub` and falls back to
   the panel's own picture wherever a subsection has none. So the table can stay
   half-empty — the subsections without art keep showing the panel's, and adding
   one is a bake plus nothing else. No edit here, no script tag, no CSS.

   Keys are "<panel>" for a whole panel or "<panel>/<slug>" for one of its
   entries, the slug being the entry's own `data-slug` — so the table reads as
   the site's own table of contents, and a panel and its subsections are the
   same kind of thing to bake.

   Storage and polarity are the portrait's: luminance per cell, a space for the
   ground, and which end is heavy ink decided by `lc:theme` at render time.

   The floors default to a drawn mark's — a crest or a badge, which can use most
   of the ramp. A photograph wants the field's own softer defaults instead, so an
   entry may carry `levFloor` / `rampFloor` and override them.
   ============================================================ */
(function () {
  'use strict';

  var RAMP = " .'`:;-~+=*#%&@$";
  var HEX = '0123456789abcdef';
  var LEV_FLOOR = 0.30, RAMP_FLOOR = 1;
  /* one sentence per picture, shown under it when the rest of the page is
     hidden; keyed the way the table is, so a bake without one shows nothing */
  var CAPTIONS = {
    'academics': 'The Groton zebra, from a photograph.',
    'academics/american-heritage': 'American Heritage School\'s crest.',
    'academics/groton': 'The Schoolhouse, from a photograph of the campus.',
    'athletics/road-to-groton': 'The Florida Alliance crest.',
    'leadership/freecode': 'Python’s mark.',
    'music/carnegie-hall': 'A grand piano with its lid up, from a photograph: the keys, the strings inside, the lyre below.',
  };

  if (!window.LCField || !window.LCField.setArt) return;
  var T = window.LCSubArt;
  if (!T) return;

  var root = document.documentElement;
  var pics = [];

  Object.keys(T).forEach(function (key) {
    var e = T[key], cut = key.indexOf('/');   // no slash: the picture is the panel's own
    if (!e || !e.grid || !e.grid.length || cut === 0) return;
    var cols = e.cols, rows = e.rows, max = (e.levels || 16) - 1;
    var norm = new Float32Array(cols * rows);
    for (var y = 0; y < rows; y++) {
      var line = e.grid[y] || '';
      for (var x = 0; x < cols; x++) {
        var ch = line.charAt(x), i = HEX.indexOf(ch);
        norm[y * cols + x] = (ch === '' || ch === ' ' || i < 0) ? -1 : i / max;
      }
    }
    pics.push({
      key: 'art:' + key,
      panel: cut < 0 ? key : key.slice(0, cut),
      sub: cut < 0 ? null : key.slice(cut + 1),
      cols: cols, rows: rows, norm: norm, caption: CAPTIONS[key] || '',
      ink: e.ink || null,          // 'dark' or 'light' fixes which end is ink in both themes; else the ground decides
      levFloor: e.levFloor != null ? e.levFloor : LEV_FLOOR,
      rampFloor: e.rampFloor != null ? e.rampFloor : RAMP_FLOOR
    });
  });
  if (!pics.length) return;

  function emit() {
    var dark = root.getAttribute('data-theme') !== 'light';
    pics.forEach(function (p) {
      var dens = new Float32Array(p.norm.length);
      var bright = p.ink ? p.ink === 'light' : dark;   // is the bright end of the luminance the ink?
      for (var i = 0; i < p.norm.length; i++) {
        dens[i] = p.norm[i] < 0 ? -1 : (bright ? p.norm[i] : 1 - p.norm[i]);
      }
      window.LCField.setArt(p.key, {
        cols: p.cols, rows: p.rows, dens: dens, ramp: RAMP,
        panel: p.panel, sub: p.sub, align: 'center', caption: p.caption,
        levFloor: p.levFloor, rampFloor: p.rampFloor
      });
    });
  }

  emit();
  document.addEventListener('lc:theme', emit);
})();
