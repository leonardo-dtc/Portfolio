/* ============================================================
   MASK — a goaltender's mask in the background of the Athletics panel.

   Not built, not procedural: these are frames pre-rendered from a real 3D model
   (assets/model/GMask.obj, 60k triangles) by tools/make-mask.py, and baked into
   assets/data/mask.js. The browser never sees geometry — it picks one of eleven
   frames from where the cursor is horizontally and resamples it onto the field's
   grid. Discrete steps, the way the reference site swaps between hand-made art
   variants, rather than solving an angle every frame.

   Eleven frames span ±31° of yaw, all sharing one centre and scale, so the head
   turns in place instead of jittering as the frame swaps.

   It follows the cursor and nothing else — no idle drift. What it does instead
   is *travel*: the frame it shows chases the frame the cursor asks for at a
   capped rate, so it can never skip one. The cursor leaving the window is only
   another position to travel to, so the mask turns back to head-left over half a
   second rather than cutting to it, and turns out again the same way when the
   cursor returns. With no pointer at all — a phone, or a page that has just
   loaded — it rests head-left, which is where it starts.
   ============================================================ */
(function () {
  'use strict';

  var RAMP = " .'`:;-~+=*#%&@$";
  var HEX = '0123456789abcdef';
  var EDGE = 0.10;                           // cursor deadband at each screen edge
  var REST = 0;                              // frame 0 faces left: the pose it loads in and returns to
  var TURN = 11;                             // frames/s ceiling. Under one frame per tick at 30fps,
                                             // which is what makes skipping a frame impossible
  var EASE = 7;                              // 1/s, so the last of the turn settles instead of stopping

  if (!window.LCField || !window.LCField.setArt) return;
  var M = window.LCMask;
  if (!M || !M.frames || !M.frames.length) return;

  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fine = matchMedia('(pointer:fine)').matches;
  var N = M.frames.length, max = (M.levels || 16) - 1;

  /* decode once: frames[f][y*cols+x], -1 where the mask is not */
  var grids = M.frames.map(function (rows) {
    var g = new Float32Array(M.cols * M.rows);
    for (var y = 0; y < M.rows; y++) {
      var line = rows[y] || '';
      for (var x = 0; x < M.cols; x++) {
        var ch = line.charAt(x), i = HEX.indexOf(ch);
        g[y * M.cols + x] = (ch === '' || ch === ' ' || i < 0) ? -1 : i / max;
      }
    }
    return g;
  });

  var ptrX = 0.5, here = false;
  if (fine && !reduce) {
    addEventListener('pointermove', function (e) {
      ptrX = e.clientX / Math.max(1, innerWidth);
      here = true;
    }, { passive: true });
    /* the same pair field.js watches for its own cursor falloff, so the two
       agree about when the cursor is gone */
    document.documentElement.addEventListener('mouseleave', function () { here = false; });
  }

  var cur = REST, last = 0;                  // cur is a position between frames, not a frame
  var shown = -1, lastOut = null, lastGW = 0, lastGH = 0;

  /* where the cursor is asking the head to point. Off the window is not a
     special case — it is REST, an ordinary destination to travel to */
  function aim() {
    if (!here) return REST;
    var f = (ptrX - EDGE) / Math.max(0.001, 1 - 2 * EDGE);
    return Math.min(1, Math.max(0, f)) * (N - 1);
  }

  function turn(now) {
    var dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    if (!dt) return;                         // first call only seeds the clock
    var to = aim(), d = to - cur;
    if (Math.abs(d) < 1e-3) { cur = to; return; }
    /* exponential toward the target, but never faster than TURN. The cap is the
       whole point: an ease alone covers ten frames in two ticks when the cursor
       jumps the width of the screen, and the head appears to cut rather than turn */
    var step = d * (1 - Math.exp(-EASE * dt)), cap = TURN * dt;
    cur += Math.max(-cap, Math.min(cap, step));
  }

  function live(now, gw, gh, out) {
    if (!reduce) turn(now);
    var want = Math.round(cur);
    /* the field keeps the grid between frames, so doing nothing is the cache —
       but it hands over a fresh, zero-filled one whenever it rebuilds, and
       skipping that would paint the mask as a solid rectangle */
    var fresh = out !== lastOut || gw !== lastGW || gh !== lastGH;
    if (!fresh && want === shown) return;
    lastOut = out; lastGW = gw; lastGH = gh; shown = want;

    var g = grids[want], i = 0;
    for (var y = 0; y < gh; y++) {
      var sy = (y * M.rows / gh) | 0;
      for (var x = 0; x < gw; x++, i++) {
        out[i] = g[sy * M.cols + ((x * M.cols / gw) | 0)];
      }
    }
  }

  window.LCField.setArt('mask', {
    ramp: RAMP, aspect: M.aspect || 0.84, panel: 'athletics', align: 'center',
    caption: 'A goaltender\'s mask, turning with the cursor.',
    levFloor: 0.26, rampFloor: 1,       // a render, so it can use most of the range
    live: live
  });
})();
