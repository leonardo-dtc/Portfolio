/* ============================================================
   CREST — the Groton School arms, baked and parked.

   Nothing shows them at the moment: Academics carries the zebra mark instead.
   The bake and this reader are kept whole so putting the arms on some other
   panel is one line — set ON_PANEL below to that panel's `data-sect` (or to a
   subsection's "<panel>/<slug>", which the art table also understands) and the
   field picks them up. With it null this file registers nothing.

   Like the portrait, it draws nothing: it hands a grid of densities to
   field.js, which renders it into the background canvas, so it dims, reveals and
   lives with the field rather than sitting over it in the DOM. It is a fixed
   picture — unlike the mask, nothing about it moves.

   The grid is baked by tools/make-crest.py. There is no live path keying the
   artwork here, because there is nothing to swap: the arms are the arms. If
   assets/data/crest.js is missing, the panel simply keeps its noise.

   What is stored is luminance, not ink, and which end of it becomes heavy ink
   flips with the ground — the same argument as the portrait. On the dark ground
   the wreath, the cross, the three books of the chief and the motto ribbon are
   the bright parts and so carry the ink, and the crimson quarters recede; on
   paper it is the other way round, which is how the arms are actually printed.

   On the field's grid the crest lands about 33 cells across. That is enough for
   the wreath, the shield, the cross, the sword down the pale and the books, and
   it is not enough for the motto: "cui servire est regnare" wants something near
   90 cells before the letters separate. It reads as an inscribed ribbon, which
   is as far as the grid goes. The averaging in field.js's buildArt is what keeps
   even that much — point-sampling took the lettering out entirely.
   ============================================================ */
(function () {
  'use strict';

  /* light → dark, sixteen steps — ASCII art, not the field's two-glyph ramp */
  var RAMP = " .'`:;-~+=*#%&@$";
  var ON_PANEL = null;        // ← a panel's data-sect puts the arms back on the page
  var HEX = '0123456789abcdef';

  if (!ON_PANEL) return;                 // parked
  if (!window.LCField || !window.LCField.setArt) return;
  var C = window.LCCrest;
  if (!C || !C.grid || !C.grid.length) return;

  var root = document.documentElement;
  var cols = C.cols, rows = C.rows, max = (C.levels || 16) - 1;
  var norm = new Float32Array(cols * rows);
  for (var y = 0; y < rows; y++) {
    var line = C.grid[y] || '';
    for (var x = 0; x < cols; x++) {
      var ch = line.charAt(x), i = HEX.indexOf(ch);
      norm[y * cols + x] = (ch === '' || ch === ' ' || i < 0) ? -1 : i / max;
    }
  }

  function emit() {
    var dark = root.getAttribute('data-theme') !== 'light';
    var dens = new Float32Array(norm.length);
    for (var i = 0; i < norm.length; i++) {
      dens[i] = norm[i] < 0 ? -1 : (dark ? norm[i] : 1 - norm[i]);
    }
    window.LCField.setArt('crest', {
      cols: cols, rows: rows, dens: dens, ramp: RAMP,
      panel: ON_PANEL, align: 'center',
      levFloor: 0.30, rampFloor: 1     // drawn artwork, so it can use most of the range
    });
  }

  emit();                              // the field owns which panel shows what
  document.addEventListener('lc:theme', emit);
  var here = document.querySelector('.panel.is-active');
  if (here && here.dataset.sect === ON_PANEL) window.LCField.showArt('crest');
})();
