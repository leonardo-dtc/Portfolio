/* ============================================================
   LIVE — pictures that are drawn rather than photographed.

   A photograph does not survive this grid. Thirty-odd cells across is
   enough for a silhouette and three or four tones, and a camera spends
   almost all of its information below that. Geometry does survive: a ring,
   a Y, a spiral, a glyph. So the pieces here are drawn, and because they
   are drawn they can also move.

   The engine is one offscreen canvas. A piece draws into it with ordinary
   2D primitives, and this file reduces that to the density grid field.js
   asked for, by the same block-average the bakes use. What a piece paints
   IS the ink: white is a full-strength glyph, grey is a lighter one, and
   anything left transparent is not part of the picture, so the noise shows
   through. That is the mask's convention, not the portrait's, so nothing
   flips with the theme.

   draw(g, w, h, t, p):
     g  offscreen 2D context, already cleared
     w,h  its pixel size (the grid, times SS)
     t  seconds, monotonic; 0 under prefers-reduced-motion, so a piece that
        reads `t` freezes rather than needing to know about the setting
     p  pointer: x and y in 0..1 across the viewport, eased, plus `here`,
        false when the cursor has left the window

   A piece may also carry a `caption`, one sentence saying what it is, which
   the page shows under the picture when the rest of the page is hidden.
   ============================================================ */
(function () {
  'use strict';
  if (!window.LCField || !window.LCField.setArt) return;

  var RAMP = " .'`:;-~+=*#%&@$";
  var SS = 5;              // offscreen pixels per grid cell
  var COVER = 0.22;        // a cell needs this much paint to be part of the picture
  var motionPreference = matchMedia('(prefers-reduced-motion:reduce)');
  var reduce = motionPreference.matches;
  motionPreference.addEventListener('change', function (e) { reduce = e.matches; });
  var fine = matchMedia('(pointer:fine)').matches;

  /* One pointer for every piece, eased, so nothing jumps when the cursor
     does and a piece that leans on it settles rather than snapping. */
  var ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, here: false };
  if (fine && !reduce) {
    addEventListener('pointermove', function (e) {
      ptr.tx = e.clientX / Math.max(1, innerWidth);
      ptr.ty = e.clientY / Math.max(1, innerHeight);
      ptr.here = true;
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', function () {
      ptr.here = false; ptr.tx = 0.5; ptr.ty = 0.5;
    });
  }

  var cv = document.createElement('canvas');
  var g = cv.getContext('2d', { willReadFrequently: true });

  function reduceTo(out, gw, gh, W, H) {
    var d = g.getImageData(0, 0, W, H).data, n = SS * SS;
    for (var y = 0; y < gh; y++) {
      for (var x = 0; x < gw; x++) {
        var sum = 0, a = 0;
        for (var j = 0; j < SS; j++) {
          var row = ((y * SS + j) * W + x * SS) * 4;
          for (var i = 0; i < SS; i++) {
            var k = row + i * 4, al = d[k + 3] / 255;
            if (al > 0) { a += al; sum += al * (0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2]) / 255; }
          }
        }
        out[y * gw + x] = (a / n) < COVER ? -1 : sum / (a || 1);
      }
    }
  }

  /* key is "<panel>" or "<panel>/<slug>", the same address the baked table
     uses, so a drawn piece and a baked one are interchangeable in a slot */
  function mount(key, opt) {
    var cut = key.indexOf('/');
    window.LCField.setArt('live:' + key, {
      aspect: opt.aspect || 1,
      panel: cut < 0 ? key : key.slice(0, cut),
      sub: cut < 0 ? null : key.slice(cut + 1),
      ramp: RAMP, align: 'center', caption: opt.caption || '',
      levFloor: opt.levFloor != null ? opt.levFloor : 0.30,
      rampFloor: opt.rampFloor != null ? opt.rampFloor : 1,
      live: function (now, gw, gh, out) {
        ptr.x += (ptr.tx - ptr.x) * 0.12;
        ptr.y += (ptr.ty - ptr.y) * 0.12;
        var W = gw * SS, H = gh * SS;
        if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.clearRect(0, 0, W, H);
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.strokeStyle = '#fff';
        g.fillStyle = '#fff';
        g.save();
        try { opt.draw(g, W, H, reduce ? 0 : now / 1000, ptr); }
        catch (e) { g.restore(); return; }
        g.restore();
        reduceTo(out, gw, gh, W, H);
      }
    });
  }

  window.LCLive = { mount: mount, ss: SS };
})();
