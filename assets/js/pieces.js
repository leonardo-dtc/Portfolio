/* ============================================================
   PIECES — the drawn background pictures, one per slot.

   Each is a draw(g, w, h, t, p) handed to live.js. Everything is built
   from measured geometry rather than traced by eye: the soccer ball is a
   real truncated icosahedron projected from a rotating sphere, the benzene
   ring is a regular hexagon with alternating bonds at the real bond angle,
   the rink is the IIHF end zone at its published proportions, the ARIA
   chart plots the three figures from the paper. Where the subject is a
   character, the character itself is set rather than drawn.

   Coordinates are worked in a unit box and scaled, so a piece reads the
   same whatever grid the field hands it.
   ============================================================ */
(function () {
  'use strict';
  var L = window.LCLive;
  if (!L) return;

  var TAU = Math.PI * 2;
  function lerp(a, b, t) { return a + (b - a) * t; }
  /* a piece leans this way when the cursor is out of the window: centred */
  function lean(p, k) { return { x: (p.x - 0.5) * (k || 1), y: (p.y - 0.5) * (k || 1) }; }
  function box(w, h, pad) {
    var s = Math.min(w, h) * (1 - (pad == null ? 0.14 : pad));
    return { s: s, cx: w / 2, cy: h / 2 };
  }
  /* A stroke thinner than roughly one cell never survives the reduction, so
     every line here is floored at a cell's width rather than a pixel. */
  var CELL = (window.LCLive && window.LCLive.ss) || 5;
  function lw(g, v) { g.lineWidth = Math.max(CELL * 0.9, v); }
  /* What a piece paints is the ink, and the field reads a cell's tone from
     the colour it was painted, not from its alpha: alpha only decides whether
     enough of the cell was painted to count at all. So a lighter mark is
     painted grey, and anything under about a fifth of a cell is not there. */
  function ink(g, v) {
    var c = Math.round(Math.max(0, Math.min(1, v)) * 255);
    g.fillStyle = g.strokeStyle = 'rgb(' + c + ',' + c + ',' + c + ')';
  }

  /* ---------- athletics: the offensive zone ----------
     IIHF proportions: 30m wide, goal line 4m from the boards, blue line
     22.86m out, faceoff circles r=4.5m on the dots. Drawn end-on, which is
     the half a goaltender actually lives in. */
  L.mount('athletics/prep-and-showcase', { aspect: 1.05, caption: 'The offensive zone of a rink at IIHF proportions, seen from the crease.', draw: function (g, w, h, t, p) {
    var m = Math.min(w, h) * 0.09, W = w - m * 2, H = h - m * 2, u = W / 30;
    g.translate(m, m);
    lw(g, u * 0.30);
    g.globalAlpha = 0.9;
    var r = u * 7;
    g.beginPath();                                   // boards, rounded at the end
    g.moveTo(0, H); g.lineTo(0, r);
    g.arcTo(0, 0, r, 0, r); g.lineTo(W - r, 0);
    g.arcTo(W, 0, W, r, r); g.lineTo(W, H);
    g.stroke();
    var gy = H * 0.20;
    g.globalAlpha = 0.7;                             // goal line
    g.beginPath(); g.moveTo(u * 1.5, gy); g.lineTo(W - u * 1.5, gy); g.stroke();
    g.globalAlpha = 1;                               // crease and net
    lw(g, u * 0.34);
    g.beginPath(); g.arc(W / 2, gy, u * 2.6, 0, Math.PI); g.stroke();
    g.beginPath(); g.rect(W / 2 - u * 1.3, gy - u * 1.6, u * 2.6, u * 1.6); g.stroke();
    g.globalAlpha = 0.62;                            // blue line
    lw(g, u * 0.5);
    g.beginPath(); g.moveTo(0, H * 0.84); g.lineTo(W, H * 0.84); g.stroke();
    g.globalAlpha = 0.8;                             // the two end circles
    lw(g, u * 0.28);
    [-1, 1].forEach(function (d) {
      var cx = W / 2 + d * u * 7.5, cy = gy + H * 0.30;
      g.beginPath(); g.arc(cx, cy, u * 4.6, 0, TAU); g.stroke();
      g.beginPath(); g.arc(cx, cy, u * 0.75, 0, TAU); g.fill();
    });
  }});

  /* ---------- athletics: crossed oars, scissoring with the cursor ----------
     Hatchet blades, the asymmetric cleaver shape a modern sweep oar carries:
     one straight edge running off the loom, a squared tip, the other edge
     curving back in. Drawn from the reference, not a paddle. */
  L.mount('athletics/crew', { aspect: 1, caption: 'Two sweep oars, crossed; they scissor with the cursor.', draw: function (g, w, h, t, p) {
    var b = box(w, h, 0.08), s = b.s, l = lean(p, 1);
    var spread = 0.40 + l.x * 0.26;
    g.translate(b.cx, b.cy + s * 0.04);
    [-1, 1].forEach(function (side) {
      g.save();
      g.rotate(side * spread);
      lw(g, s * 0.030);
      g.globalAlpha = 0.95;
      g.beginPath(); g.moveTo(0, s * 0.46); g.lineTo(0, -s * 0.24); g.stroke();      // loom
      g.globalAlpha = 1;                                                             // hatchet blade
      g.beginPath();
      g.moveTo(-side * s * 0.018, -s * 0.22);             // neck, on the loom's edge away from the hook
      g.lineTo(-side * s * 0.018, -s * 0.50);             // straight spine
      g.lineTo(side * s * 0.13, -s * 0.52);               // squared tip, offset to one side
      g.lineTo(side * s * 0.15, -s * 0.44);
      g.quadraticCurveTo(side * s * 0.11, -s * 0.28, side * s * 0.018, -s * 0.22);   // curved back edge, to the loom's other edge
      g.closePath(); g.fill();
      g.globalAlpha = 0.6;                                                           // handle
      lw(g, s * 0.05);
      g.beginPath(); g.moveTo(0, s * 0.35); g.lineTo(0, s * 0.46); g.stroke();
      g.restore();
    });
  }});

  /* ---------- athletics: the ball ----------
     A truncated icosahedron, built as one: each of the twelve icosahedron
     vertices is cut a third of the way along its five edges, which leaves
     a pentagon there and a hexagon on every face, and the middle third of
     each edge is the seam between two hexagons. Every corner is projected
     from the turning sphere, so a pentagon foreshortens with its tilt and
     the hexagons between the pentagons close. Only the near hemisphere is
     drawn, which is what makes it read as a ball. */
  var BALL = (function () {
    var t = (1 + Math.sqrt(5)) / 2, V = [];
    function unit(a) { var n = Math.hypot(a[0], a[1], a[2]); return [a[0] / n, a[1] / n, a[2] / n]; }
    function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
    function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
    /* a third of the way from a to b, put back on the sphere */
    function cut(a, b, k) { return unit([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]); }
    [[0, 1, t], [0, -1, t], [0, 1, -t], [0, -1, -t],
     [1, t, 0], [-1, t, 0], [1, -t, 0], [-1, -t, 0],
     [t, 0, 1], [-t, 0, 1], [t, 0, -1], [-t, 0, -1]].forEach(function (a) { V.push(unit(a)); });
    var pents = [], seams = [];
    V.forEach(function (v, i) {
      var e1 = unit(cross(v, Math.abs(v[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), e2 = cross(v, e1);
      var near = [];
      V.forEach(function (u, j) {
        if (j === i || dot(u, v) < 0.4) return;         // the five neighbours
        near.push({ u: u, a: Math.atan2(dot(u, e2), dot(u, e1)) });
        if (j > i) seams.push([cut(v, u, 1 / 3), cut(v, u, 2 / 3)]);
      });
      near.sort(function (p, q) { return p.a - q.a; });  // in order around v
      pents.push({ c: v, k: near.map(function (n) { return cut(v, n.u, 1 / 3); }) });
    });
    return { pents: pents, seams: seams };
  })();
  L.mount('athletics/soccer', { aspect: 1, caption: 'A football, a truncated icosahedron, turning.', draw: function (g, w, h, t, p) {
    var b = box(w, h, 0.12), R = b.s * 0.5, l = lean(p, 1);
    var ax = l.y * 1.6, ay = l.x * 2.4 + t * 0.25;    // roll with the cursor, drift on its own
    var ca = Math.cos(ax), sa = Math.sin(ax), cb = Math.cos(ay), sb = Math.sin(ay);
    function turn(v) {                                 // rotate; a point past the rim is held on it
      var y = v[1] * ca - v[2] * sa, z1 = v[1] * sa + v[2] * ca;
      var x = v[0] * cb + z1 * sb, z = -v[0] * sb + z1 * cb;
      if (z < 0) { var n = Math.hypot(x, y) || 1; x /= n; y /= n; }
      return { x: x * R, y: y * R, z: z };
    }
    g.translate(b.cx, b.cy);
    g.lineWidth = Math.max(1, R * 0.045);
    g.globalAlpha = 0.85;
    g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke();
    g.lineWidth = Math.max(1, R * 0.03);               // the seams between hexagons
    BALL.seams.forEach(function (e) {
      var a = turn(e[0]), c = turn(e[1]), z = Math.max(a.z, c.z);
      if (z < 0.05) return;                            // far hemisphere
      g.globalAlpha = 0.2 + 0.35 * z;
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(c.x, c.y); g.stroke();
    });
    BALL.pents.forEach(function (q) {                  // the pentagons, as they actually project
      var c = turn(q.c);
      if (c.z < 0.02) return;                          // far hemisphere
      g.globalAlpha = 0.35 + 0.65 * c.z;
      g.beginPath();
      q.k.forEach(function (v, i) { var o = turn(v); if (i) g.lineTo(o.x, o.y); else g.moveTo(o.x, o.y); });
      g.closePath(); g.fill();
    });
  }});

  /* ---------- academics: the cube ----------
     A puzzle cube, seen from above and to one side so three faces show.
     It is shuffled in a burst of quick turns, then solves itself one
     unhurried turn at a time, ten to twenty of them, sits solved for a
     moment, and is shuffled again. The stickers go with the layers, so the
     state is real: the solve is the shuffle run backwards. */
  var CUBE = (function () {
    var tone = { '1,0,0': 0.48, '-1,0,0': 0.6, '0,1,0': 1, '0,-1,0': 0.3, '0,0,1': 0.74, '0,0,-1': 0.86 };
    var DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    var cubies = [];
    function solved() {
      cubies.length = 0;
      for (var x = -1; x <= 1; x++) for (var y = -1; y <= 1; y++) for (var z = -1; z <= 1; z++) {
        var st = [];
        DIRS.forEach(function (n) { if (n[0] * x + n[1] * y + n[2] * z === 1) st.push({ n: n, k: tone[n.join(',')] }); });
        cubies.push({ p: [x, y, z], st: st });
      }
    }
    solved();
    return { cubies: cubies, DIRS: DIRS, solved: solved, at: null };
  })();
  var CUBE_QUICK = 0.26, CUBE_REST = 0.7, CUBE_SLOW = 2.2, CUBE_DONE = 1.8;   // seconds per shuffle turn, pause, solve turn, and solved
  function hash1(k, salt) { var r = Math.sin(k * 12.9898 + salt) * 43758.5453; return r - Math.floor(r); }
  function cubeCount(c) { return 10 + Math.floor(hash1(c, 7.3) * 11); }        // ten to twenty turns a cycle
  function cubeShuffle(c, i) {                                                  // shuffle turn i of cycle c
    var r = hash1(c * 64 + i, 4.1);
    return { axis: Math.floor(r * 3) % 3, layer: Math.floor(r * 9) % 3 - 1, dir: (Math.floor(r * 27) % 2) ? 1 : -1 };
  }
  /* turn k of the cycle's whole sequence: the shuffle, then the shuffle undone in reverse */
  function cubeTurn(c, n, k) {
    if (k < n) return cubeShuffle(c, k);
    var m = cubeShuffle(c, 2 * n - 1 - k);
    return { axis: m.axis, layer: m.layer, dir: -m.dir };
  }
  /* rotate v about an axis by angle a (right-handed); a quarter turn on integer vectors stays integer */
  function turn3(v, axis, a) {
    var c = Math.round(Math.cos(a) * 1e9) / 1e9, s = Math.round(Math.sin(a) * 1e9) / 1e9;
    if (axis === 0) return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
    if (axis === 1) return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
    return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]];
  }
  function cubeApply(m) {
    CUBE.cubies.forEach(function (q) {
      if (q.p[m.axis] !== m.layer) return;
      q.p = turn3(q.p, m.axis, m.dir * Math.PI / 2).map(Math.round);
      q.st.forEach(function (f) { f.n = turn3(f.n, m.axis, m.dir * Math.PI / 2).map(Math.round); });
    });
  }
  /* Where the cube is at time t: which cycle, how many turns of it are done,
     and the turn under way with how far it has got. The cubies are brought
     to that point, replaying from solved if the clock has jumped. */
  function cubeAt(t) {
    var c = 0, start = 0, n = cubeCount(0), span = n * CUBE_QUICK + CUBE_REST + n * CUBE_SLOW + CUBE_DONE;
    while (t >= start + span) { start += span; c++; n = cubeCount(c); span = n * CUBE_QUICK + CUBE_REST + n * CUBE_SLOW + CUBE_DONE; }
    var u = t - start, k, f;
    if (u < n * CUBE_QUICK) { k = Math.floor(u / CUBE_QUICK); f = Math.min(1, (u - k * CUBE_QUICK) / CUBE_QUICK / 0.9); }
    else if (u < n * CUBE_QUICK + CUBE_REST) { k = n; f = 0; }
    else if (u < n * CUBE_QUICK + CUBE_REST + n * CUBE_SLOW) {
      var v = u - n * CUBE_QUICK - CUBE_REST; k = n + Math.floor(v / CUBE_SLOW); f = Math.min(1, (v - (k - n) * CUBE_SLOW) / CUBE_SLOW / 0.6);
    } else { k = 2 * n; f = 0; }
    var at = CUBE.at, from = 0;
    if (at && at.c === c && at.k <= k) from = at.k; else CUBE.solved();
    for (var i = from; i < k; i++) cubeApply(cubeTurn(c, n, i));
    CUBE.at = { c: c, k: k };
    return { move: k < 2 * n ? cubeTurn(c, n, k) : null, f: f * f * (3 - 2 * f) };
  }
  L.mount('academics/ap-exams', { aspect: 1, caption: 'A puzzle cube that shuffles itself and then solves itself, ten to twenty turns at a time.', draw: function (g, w, h, t, p) {
    var b = box(w, h, 0.12), s = b.s, l = lean(p, 1);
    var yaw = -0.6 + l.x * 0.35, pitch = 0.46 + l.y * 0.2;
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    var e = s * 0.215;                                 // one cubie
    function view(v) {                                 // yaw, then pitch; z comes out toward the eye
      var x = v[0] * cy + v[2] * sy, z = -v[0] * sy + v[2] * cy;
      return [x, -(v[1] * cp - z * sp), v[1] * sp + z * cp];
    }
    var st = cubeAt(t), mv = st.move || { axis: 0, layer: 2, dir: 1 };   // layer 2 turns nothing
    var ang = mv.dir * st.f * Math.PI / 2;
    g.translate(b.cx, b.cy);
    g.globalAlpha = 1;
    var order = CUBE.cubies.map(function (c) {
      var on = c.p[mv.axis] === mv.layer, ctr = [c.p[0] * e, c.p[1] * e, c.p[2] * e];
      if (on) ctr = turn3(ctr, mv.axis, ang);
      return { c: c, on: on, ctr: ctr, z: view(ctr)[2] };
    }).sort(function (a, b2) { return a.z - b2.z; });   // far cubies first
    order.forEach(function (o) {
      CUBE.DIRS.forEach(function (n) {
        var nn = o.on ? turn3(n, mv.axis, ang) : n, nz = view(nn)[2];
        if (nz <= 0.02) return;                        // faces turned away
        var ax = Math.abs(n[0]) ? 1 : 0, ay = Math.abs(n[1]) ? 2 : (ax ? 2 : 1);   // two tangents
        var U = [0, 0, 0], V = [0, 0, 0]; U[ax] = 1; V[ay] = 1;
        var stk = null;
        o.c.st.forEach(function (f) { if (f.n[0] === n[0] && f.n[1] === n[1] && f.n[2] === n[2]) stk = f; });
        function quad(inset, k2) {
          g.beginPath();
          [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c2, i) {
            var v = [n[0] * e / 2 + (U[0] * c2[0] + V[0] * c2[1]) * e * inset,
                     n[1] * e / 2 + (U[1] * c2[0] + V[1] * c2[1]) * e * inset,
                     n[2] * e / 2 + (U[2] * c2[0] + V[2] * c2[1]) * e * inset];
            if (o.on) v = turn3(v, mv.axis, ang);
            var s2 = view([v[0] + o.ctr[0], v[1] + o.ctr[1], v[2] + o.ctr[2]]);
            i ? g.lineTo(s2[0], s2[1]) : g.moveTo(s2[0], s2[1]);
          });
          g.closePath(); ink(g, k2); g.fill();
        }
        quad(0.5, 0.18);                               // the body, dark, which is the seam between stickers
        if (stk) quad(0.41, stk.k);                    // the sticker
      });
    });
  }});

  /* ---------- academics: the track ahead ----------
     Two rails running off to a vanishing point, the ties sliding toward
     the viewer, a marker post every few ties. The horizon and the point
     it all runs to shift with the cursor. Nothing here needs explaining:
     it is a track, and it goes ahead. Distance is drawn as tone. The piece
     is twice as wide as high, so the horizon crosses the whole screen. */
  L.mount('academics/track-ahead', { aspect: 2, caption: 'A track running off to the horizon; the ties slide toward you.', draw: function (g, w, h, t, p) {
    var l = lean(p, 1), m = h;                                       // wide: the horizon runs the whole way across
    var vx = w * 0.5 + h * l.x * 0.2, vy = h * (0.34 + l.y * 0.05);  // the vanishing point
    var y0 = h * 1.02, half = h * 0.55;                              // where the rails leave the frame
    g.globalAlpha = 1;
    ink(g, 0.3);                                                     // horizon, faint
    lw(g, m * 0.006);
    g.beginPath(); g.moveTo(0, vy); g.lineTo(w, vy); g.stroke();
    var dz = 0.55, ph = (t * 0.4) % 1;                               // ties, sliding toward the viewer
    for (var n = 0; n < 30; n++) {
      var z = (n + 1 - ph) * dz, f = 1 / (1 + z);                    // f: 1 at the bottom, 0 at the horizon
      if (f < 0.06) break;
      var y = vy + (y0 - vy) * f, hw = half * f * 1.18;
      ink(g, 0.3 + 0.7 * f);
      lw(g, m * 0.06 * f);
      g.beginPath(); g.moveTo(vx - hw, y); g.lineTo(vx + hw, y); g.stroke();
      if ((n + Math.floor(t * 0.4)) % 4 === 1) {                     // a marker post beside the track
        var px = vx + half * f * 1.55, ph2 = h * 0.10 * f;
        ink(g, 0.45 + 0.5 * f);
        lw(g, m * 0.018 * f);
        g.beginPath(); g.moveTo(px, y); g.lineTo(px, y - ph2); g.stroke();
        var sq = Math.max(CELL * 1.2, m * 0.04 * f);
        g.beginPath(); g.rect(px - sq / 2, y - ph2 - sq, sq, sq); g.fill();
      }
    }
    ink(g, 1);                                                       // rails
    lw(g, m * 0.016);
    [-1, 1].forEach(function (d) {
      g.beginPath(); g.moveTo(vx + d * half, y0); g.lineTo(vx, vy); g.stroke();
    });
    g.beginPath(); g.arc(vx, vy, Math.max(CELL * 0.8, m * 0.02), 0, TAU); g.fill();   // the point it runs to
  }});

  /* ---------- academics: the launch ----------
     Drawn from rocketry.jpg: a slender competition rocket already well up
     off the rail, the thin exhaust column under it, and the smoke rolling
     out across the field at the pad. The rocket is small and the smoke is
     most of the picture, which is what a launch looks like. */
  L.mount('academics/robotics', { aspect: 0.62, caption: 'A competition rocket off the pad, from a photograph of a launch.', draw: function (g, w, h, t, p) {
    var s = Math.min(w / 0.62, h) * 0.94, top = (h - s) / 2, l = lean(p, 1);
    g.translate(w / 2, top);
    g.globalAlpha = 1;
    function hash(i, k) { var v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); }
    var padY = s * 0.90, cloudTop = s * 0.60;
    ink(g, 0.55);                                                    // the pad and the launch rail
    lw(g, s * 0.010);
    g.beginPath(); g.moveTo(-s * 0.16, padY); g.lineTo(s * 0.16, padY); g.stroke();
    g.beginPath(); g.moveTo(0, padY); g.lineTo(0, s * 0.74); g.stroke();
    var ry = s * (0.05 + l.y * 0.02 + Math.sin(t * 0.7) * 0.004);   // the rocket, well up the frame
    var bw = s * 0.030, nose = s * 0.07, len = s * 0.27;             // slender: about nine diameters long
    /* The plume, on the old plume's clock: every puff is shot out of the
       nozzle and falls straight down, growing as it goes, so the exhaust is
       a cone that is narrow at the rocket and as wide as the mound where it
       meets it. The bright core is the exhaust itself. */
    var puffs = [], nozzle = ry + len + s * 0.05, meet = padY - s * 0.14;
    ink(g, 1);
    lw(g, s * 0.012);
    g.beginPath(); g.moveTo(0, nozzle); g.lineTo(0, nozzle + s * 0.10); g.stroke();
    for (var i = 0; i < 26; i++) {
      var ph = (t * 0.45 + i / 26) % 1, spread = 0.01 + 0.09 * ph;
      puffs.push({
        x: (hash(i, 4) - 0.5) * spread * s * 1.6 + Math.sin(t * 0.6 + i) * s * 0.006,
        y: nozzle + (meet - nozzle) * ph,
        r: s * (0.012 + 0.07 * ph),
        k: 1 - 0.25 * ph, a: 1
      });
    }
    /* The smoke at the pad: a bulky mound the plume lands in and that
       churns in place, and skirts of puffs born in it that roll out along
       the ground, grow, grey, and are gone before the edge of the picture.
       Nothing here rises: the plume comes down and the smoke spreads. */
    for (i = 0; i < 18; i++) {                                       // the mound
      var a = hash(i, 1), b2 = hash(i, 2), c = hash(i, 3);
      puffs.push({
        x: (a - 0.5) * s * 0.18 + Math.sin(t * 0.5 + i * 1.7) * s * 0.012,
        y: padY - s * (0.035 + 0.11 * b2) + Math.cos(t * 0.45 + i * 2.3) * s * 0.01,
        r: s * (0.065 + 0.05 * c) * (1 + 0.06 * Math.sin(t * 0.7 + i)),
        k: 0.85 + 0.15 * c, a: 1
      });
    }
    for (i = 0; i < 40; i++) {                                       // the skirts
      var a2 = hash(i, 4), b3 = hash(i, 5), c2 = hash(i, 6);
      var ph2 = (t * 0.55 + a2) % 1, ease = ph2 * (2 - ph2);         // out fast, then drifting
      var side = b3 < 0.5 ? -1 : 1;
      puffs.push({
        x: side * (0.05 + 0.22 * ease * (0.6 + 0.4 * c2)) * s + Math.sin(t * 0.4 + i) * s * 0.008,
        y: padY - s * (0.03 + (0.02 + 0.04 * c2) * Math.sin(ph2 * Math.PI)),   // a slight lift, then back to the ground
        r: s * (0.03 + 0.055 * ease),
        k: 1 - 0.6 * ph2,                                            // white when born, grey as it thins
        a: ph2 < 0.7 ? 1 : (1 - ph2) / 0.3                           // and gone at the end
      });
    }
    puffs.sort(function (u, v) { return u.k - v.k; });               // the freshest on top
    puffs.forEach(function (q) { ink(g, q.k); g.globalAlpha = q.a; g.beginPath(); g.arc(q.x, q.y, q.r, 0, TAU); g.fill(); });
    g.globalAlpha = 1;
    g.save(); g.translate(0, ry);                                    // the rocket itself
    ink(g, 1);
    g.beginPath();                                                   // ogive nose and body tube
    g.moveTo(0, 0);
    g.quadraticCurveTo(bw * 0.6, nose * 0.4, bw, nose);
    g.lineTo(bw, len); g.lineTo(-bw, len); g.lineTo(-bw, nose);
    g.quadraticCurveTo(-bw * 0.6, nose * 0.4, 0, 0);
    g.closePath(); g.fill();
    [-1, 1].forEach(function (d2) {                                  // swept fins
      g.beginPath();
      g.moveTo(d2 * bw, len * 0.76);
      g.lineTo(d2 * bw * 2.7, len * 0.98);
      g.lineTo(d2 * bw * 2.7, len * 1.08);
      g.lineTo(d2 * bw, len * 1.0);
      g.closePath(); g.fill();
    });
    g.beginPath(); g.moveTo(-bw * 0.5, len); g.lineTo(bw * 0.5, len); g.lineTo(bw * 0.75, len + bw * 0.9); g.lineTo(-bw * 0.75, len + bw * 0.9); g.closePath(); g.fill();   // nozzle
    ink(g, 0.45);                                                    // the payload band and the coupler, as darker rings
    g.fillRect(-bw, nose + s * 0.008, bw * 2, s * 0.03);
    g.fillRect(-bw, len * 0.56, bw * 2, s * 0.008);
    ink(g, 1);                                                       // the flame
    g.beginPath();
    g.moveTo(-bw * 0.7, len + bw * 0.9);
    g.quadraticCurveTo(0, len + s * 0.09, bw * 0.7, len + bw * 0.9);
    g.closePath(); g.fill();
    g.restore();
  }});

  /* ---------- research: the helix ----------
     A DNA double helix, seen side-on and turning: two backbones half a turn
     apart, the base pairs as rungs between them. The strand nearer the eye
     is the brighter and the thicker, which is what makes it read as a
     spiral rather than two sine waves. The panel's own picture. */
  L.mount('research', { aspect: 0.62, caption: 'A DNA double helix, turning.', draw: function (g, w, h, t, p) {
    var l = lean(p, 1), s = h * 0.92, top = (h - s) / 2, cx = w / 2, A = w * 0.30;
    var rot = t * 0.5 + l.x * 1.4, turns = 2.0, N = 72;
    g.globalAlpha = 1;
    function strand(ph, near) {                       // the half of a backbone on one side of the axis
      for (var i = 0; i < N; i++) {
        var a0 = rot + turns * TAU * i / N + ph, a1 = a0 + turns * TAU / N, z = Math.cos(a0 + turns * TAU / N / 2);
        if ((z >= 0) !== near) continue;
        var k = 0.5 + 0.5 * z;
        ink(g, 0.35 + 0.65 * k);
        lw(g, s * (0.014 + 0.012 * k));
        g.beginPath();
        g.moveTo(cx + A * Math.sin(a0), top + s * i / N);
        g.lineTo(cx + A * Math.sin(a1), top + s * (i + 1) / N);
        g.stroke();
      }
    }
    strand(0, false); strand(Math.PI, false);         // the far halves first
    for (var j = 0; j < 20; j++) {                    // the base pairs
      var y = top + s * (j + 0.5) / 20, a = rot + turns * TAU * (j + 0.5) / 20;
      var open = Math.abs(Math.sin(a));               // edge-on where the strands cross
      if (open < 0.12) continue;
      ink(g, 0.3 + 0.45 * open);
      lw(g, s * 0.012);
      g.beginPath(); g.moveTo(cx + A * Math.sin(a) * 0.9, y); g.lineTo(cx - A * Math.sin(a) * 0.9, y); g.stroke();
    }
    strand(0, true); strand(Math.PI, true);           // the near halves over them
  }});

  /* ---------- research: the scan ----------
     An axial MRI slice with ARIA, the amyloid-related imaging abnormality
     the paper is about, drawn as a FLAIR slice reads: the skull's ring, a
     gap of fluid, the cortex folded around the rim with its sulci cut in,
     the fissure down the midline, the two lateral ventricles dark in the
     middle, and the abnormality itself: the bright, ill-defined patches of
     ARIA-E, the oedema, and the dark specks of ARIA-H, the
     microhaemorrhages. The slice drifts slowly through the head. */
  L.mount('research/aducanumab', { aspect: 0.9, caption: 'An axial MRI slice showing ARIA, the amyloid-related imaging abnormality the paper is about: bright patches of oedema, dark specks of microhaemorrhage.', draw: function (g, w, h, t, p) {
    var b = box(w, h, 0.06), s = b.s;
    var slice = 0.5 + 0.5 * Math.sin(t * 0.25);        // where in the head the slice is
    var RX = s * 0.40 * (0.95 + 0.05 * slice), RY = s * 0.48 * (0.95 + 0.05 * slice);   // the head, longer front to back
    g.translate(b.cx, b.cy); g.globalAlpha = 1; g.lineCap = 'round';
    ink(g, 0.95); lw(g, s * 0.03);                      // the skull
    g.beginPath(); g.ellipse(0, 0, RX, RY, 0, 0, TAU); g.stroke();
    function scallop(kx, ky, amp) {                     // a folded rim
      g.beginPath();
      for (var a = 0; a <= TAU + 0.01; a += 0.03) {
        var bump = 1 + amp * Math.sin(a * 15 + 0.6);
        var x = Math.cos(a) * RX * kx * bump, y = Math.sin(a) * RY * ky * bump;
        a ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.closePath();
    }
    ink(g, 0.82); scallop(0.88, 0.90, 0.035); g.fill();  // the cortex, bright
    ink(g, 0.5); scallop(0.70, 0.72, 0.06); g.fill();    // the white matter inside it
    ink(g, 0.22); lw(g, s * 0.03);                       // the sulci, cut in from the rim
    for (var k = 0; k < 15; k++) {
      var an = k * TAU / 15 + 0.35;
      g.beginPath();
      g.moveTo(Math.cos(an) * RX * 0.9, Math.sin(an) * RY * 0.92);
      g.lineTo(Math.cos(an + 0.08) * RX * 0.64, Math.sin(an + 0.08) * RY * 0.66);
      g.stroke();
    }
    ink(g, 0.2); lw(g, s * 0.022);                       // the fissure down the midline
    g.beginPath(); g.moveTo(0, -RY * 0.9); g.lineTo(0, -RY * 0.24); g.stroke();
    g.beginPath(); g.moveTo(0, RY * 0.26); g.lineTo(0, RY * 0.9); g.stroke();
    ink(g, 0.1); lw(g, s * (0.05 + 0.03 * slice));       // the lateral ventricles, two dark horns
    [-1, 1].forEach(function (d) {
      g.beginPath();
      g.moveTo(d * RX * 0.12, -RY * 0.32);
      g.quadraticCurveTo(d * RX * 0.30, -RY * 0.04, d * RX * 0.14, RY * 0.24);
      g.stroke();
    });
    ink(g, 1);                                           // ARIA-E: bright, ill-defined, in the white matter
    [[0.44, 0.40, 0.11], [0.52, 0.24, 0.08], [0.34, 0.54, 0.07], [-0.46, -0.22, 0.09], [-0.54, -0.06, 0.06]].forEach(function (q, i) {
      var r = s * q[2] * (0.8 + 0.2 * Math.sin(t * 0.4 + i));
      g.beginPath(); g.arc(q[0] * RX, q[1] * RY, r, 0, TAU); g.fill();
    });
    ink(g, 0.06);                                        // ARIA-H: dark specks near the cortex
    [[0.60, -0.42], [0.68, 0.12], [-0.30, 0.68], [-0.64, 0.30], [0.20, -0.74], [-0.12, 0.76], [0.56, 0.60], [-0.20, -0.66]].forEach(function (q) {
      g.beginPath(); g.arc(q[0] * RX, q[1] * RY, s * 0.024, 0, TAU); g.fill();
    });
  }});

  /* ---------- research: the brace, on its own ----------
     The knee exoskeleton as hardware, from the side: a thigh cuff and a
     shank cuff, each with its straps, the rigid uprights running from them
     to the hinge, the hinge itself, and the actuator mounted on the thigh
     upright above it with a link down to the shank. The shank swings
     through the knee's range on its own clock and with the cursor. */
  L.mount('research/genuvalens', { aspect: 0.70, caption: 'The knee exoskeleton on its own: thigh and shank cuffs, the uprights, the hinge, and the actuator above it.', draw: function (g, w, h, t, p) {
    var S = Math.min(w / 0.70, h) * 0.95, l = lean(p, 1);
    var flex = Math.max(0, Math.min(1, 0.5 + 0.45 * Math.sin(t * 0.6) + l.y * 0.35));   // the hinge, from straight to bent
    var hx = w / 2 + S * 0.06, hy = h / 2 + S * 0.02;    // the hinge
    var be = 0.10, al = 0.06 + 0.95 * flex;               // the thigh upright leans back a little; the shank swings back with flexion
    var Lt = S * 0.36, Ls = S * 0.36;
    var tu = [-Math.sin(be), -Math.cos(be)], su = [-Math.sin(al), Math.cos(al)];   // along each upright, away from the hinge
    var tn = [Math.cos(be), -Math.sin(be)], sn = [Math.cos(al), Math.sin(al)];     // across each, toward the front
    var tx = hx + tu[0] * Lt, ty = hy + tu[1] * Lt, sx = hx + su[0] * Ls, sy = hy + su[1] * Ls;
    g.globalAlpha = 1; g.lineCap = 'round';
    function cuff(cx, cy, n, u, half) {                 // a thick shell across the limb, with two straps
      ink(g, 1); lw(g, S * 0.12);
      g.beginPath(); g.moveTo(cx - n[0] * half, cy - n[1] * half); g.lineTo(cx + n[0] * half, cy + n[1] * half); g.stroke();
      ink(g, 0.45); lw(g, S * 0.024);
      [-0.55, 0.55].forEach(function (k) {
        g.beginPath();
        g.moveTo(cx + n[0] * half * k - u[0] * S * 0.085, cy + n[1] * half * k - u[1] * S * 0.085);
        g.lineTo(cx + n[0] * half * k + u[0] * S * 0.085, cy + n[1] * half * k + u[1] * S * 0.085);
        g.stroke();
      });
    }
    cuff(tx, ty, tn, tu, S * 0.15); cuff(sx, sy, sn, su, S * 0.13);
    ink(g, 1); lw(g, S * 0.045);                         // the uprights
    g.beginPath(); g.moveTo(tx, ty); g.lineTo(hx, hy); g.lineTo(sx, sy); g.stroke();
    var mx = hx + tu[0] * Lt * 0.55, my = hy + tu[1] * Lt * 0.55;   // the actuator, on the thigh upright
    g.save(); g.translate(mx, my); g.rotate(-be);
    ink(g, 1); g.beginPath(); g.rect(-S * 0.065, -S * 0.10, S * 0.13, S * 0.20); g.fill();
    ink(g, 0.35); g.beginPath(); g.rect(-S * 0.04, -S * 0.07, S * 0.08, S * 0.05); g.fill();   // its housing seam
    g.restore();
    var lx = hx + su[0] * Ls * 0.30 + sn[0] * S * 0.045, ly = hy + su[1] * Ls * 0.30 + sn[1] * S * 0.045;   // the link, actuator to shank
    ink(g, 0.7); lw(g, S * 0.025);
    g.beginPath(); g.moveTo(mx + tn[0] * S * 0.05 + tu[0] * -S * 0.10, my + tn[1] * S * 0.05 + tu[1] * -S * 0.10); g.lineTo(lx, ly); g.stroke();
    ink(g, 1); lw(g, S * 0.03);                          // the hinge
    g.beginPath(); g.arc(hx, hy, S * 0.075, 0, TAU); g.stroke();
    g.beginPath(); g.arc(hx, hy, S * 0.02, 0, TAU); g.fill();
    ink(g, 0.6);
    for (var k = 0; k < 4; k++) { var a = k * Math.PI / 2 + Math.PI / 4; g.beginPath(); g.arc(hx + Math.cos(a) * S * 0.048, hy + Math.sin(a) * S * 0.048, S * 0.012, 0, TAU); g.fill(); }
  }});

  /* ---------- research: the cell ----------
     An animal cell as a textbook draws it, with few organelles and each of
     them large enough to be named at a glance: the membrane, not quite a
     circle; the nucleus with its double envelope and a nucleolus; two
     mitochondria, bean-shaped, with the inner membrane folded into cristae;
     rough endoplasmic reticulum in long studded sheets against the nucleus;
     a Golgi stack of flattened sacs with vesicles budding off it. Each has
     its own tone, so they stay apart on the grid. */
  L.mount('research/the-question', { aspect: 1, caption: 'An animal cell: nucleus and nucleolus, two mitochondria, rough endoplasmic reticulum, a Golgi stack, vesicles.', draw: function (g, w, h, t, p) {
    var b = box(w, h, 0.06), R = b.s * 0.48;
    g.translate(b.cx, b.cy); g.globalAlpha = 1; g.lineCap = 'round';
    function edge(a) { return R * (1 + 0.05 * Math.sin(3 * a + t * 0.2) + 0.03 * Math.sin(5 * a - t * 0.15)); }
    g.beginPath();
    for (var a = 0; a <= TAU + 0.01; a += 0.05) { var r = edge(a); a ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(r, 0); }
    g.closePath(); ink(g, 0.2); g.fill();               // cytoplasm, faint
    ink(g, 1); lw(g, R * 0.05); g.stroke();             // the membrane
    var nx = -R * 0.22, ny = -R * 0.16, nr = R * 0.34;  // the nucleus, large
    ink(g, 1); lw(g, R * 0.045);
    g.beginPath(); g.arc(nx, ny, nr, 0, TAU); g.stroke();
    ink(g, 0.65); lw(g, R * 0.025);
    g.beginPath(); g.arc(nx, ny, nr * 0.86, 0, TAU); g.stroke();
    ink(g, 0.8); g.beginPath(); g.arc(nx + nr * 0.2, ny - nr * 0.1, nr * 0.34, 0, TAU); g.fill();   // the nucleolus
    ink(g, 0.7); lw(g, R * 0.03);                       // rough ER: long sheets wrapped around the nucleus, studded
    [1.32, 1.52].forEach(function (k, i) {
      var a0 = -0.2 + i * 0.1, a1 = 1.7 - i * 0.1;
      g.beginPath();
      for (var u = a0; u <= a1; u += 0.05) {
        var rr = nr * k + R * 0.02 * Math.sin(u * 9);
        u === a0 ? g.moveTo(nx + Math.cos(u) * rr, ny + Math.sin(u) * rr) : g.lineTo(nx + Math.cos(u) * rr, ny + Math.sin(u) * rr);
      }
      g.stroke();
      ink(g, 0.95);
      for (u = a0 + 0.1; u < a1; u += 0.22) { g.beginPath(); g.arc(nx + Math.cos(u) * (nr * k + R * 0.04), ny + Math.sin(u) * (nr * k + R * 0.04), R * 0.025, 0, TAU); g.fill(); }
      ink(g, 0.7);
    });
    [[0.52, -0.42, 0.55], [-0.46, 0.50, -0.25]].forEach(function (m, i) {   // two mitochondria, big, with cristae
      g.save();
      g.translate(m[0] * R + Math.sin(t * 0.3 + i) * R * 0.02, m[1] * R + Math.cos(t * 0.25 + i * 2) * R * 0.02);
      g.rotate(m[2] + Math.sin(t * 0.1 + i) * 0.08);
      ink(g, 0.95); lw(g, R * 0.04);
      g.beginPath(); g.ellipse(0, 0, R * 0.24, R * 0.12, 0, 0, TAU); g.stroke();
      ink(g, 0.7); lw(g, R * 0.028);
      g.beginPath();                                    // the inner membrane, folded back and forth
      for (var k = 0; k <= 8; k++) {
        var x = -R * 0.18 + k * R * 0.045, y = (k % 2 ? -1 : 1) * R * 0.075;
        k ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
      g.restore();
    });
    ink(g, 0.8); lw(g, R * 0.035);                      // the Golgi stack: flattened sacs, bowed
    [0, 1, 2, 3].forEach(function (i) {
      var cy = R * (0.36 + i * 0.09);
      g.beginPath(); g.moveTo(R * 0.12, cy + R * 0.05); g.quadraticCurveTo(R * 0.40, cy - R * 0.10 + i * R * 0.02, R * 0.68 - i * R * 0.03, cy + R * 0.05); g.stroke();
    });
    ink(g, 0.6);                                        // vesicles, budding from the stack and drifting
    [[0.76, 0.28], [0.50, 0.20], [0.22, 0.76], [0.66, 0.70], [-0.05, 0.58]].forEach(function (v, i) {
      g.beginPath(); g.arc(v[0] * R + Math.sin(t * 0.4 + i) * R * 0.02, v[1] * R + Math.cos(t * 0.35 + i) * R * 0.02, R * 0.05, 0, TAU); g.fill();
    });
  }});

  /* ---------- research: the paper's own figure ----------
     ARIA as a share of reports, aducanumab against its two successors:
     real numbers, drawn as a chart is drawn, with axes, ticks, a grid, and
     the subject's bar white against the others' grey. */
  var ARIA = [['ADU', 37.2], ['LEC', 25.7], ['DON', 34.0]];
  L.mount('research/toolkit', { aspect: 1.1, caption: 'ARIA as a share of adverse-event reports, from the paper: aducanumab, then lecanemab and donanemab.', draw: function (g, w, h, t, p) {
    var m = Math.min(w, h) * 0.12, X0 = m * 1.5, Y0 = h - m * 1.3, W = w - X0 - m * 0.7, H = h - m * 2.4, top = 40;
    g.globalAlpha = 1;
    ink(g, 0.3); lw(g, H * 0.008);                     // the grid, faint
    for (var v = 10; v <= 40; v += 10) { var y = Y0 - v / top * H; g.beginPath(); g.moveTo(X0, y); g.lineTo(X0 + W, y); g.stroke(); }
    ink(g, 1); lw(g, H * 0.016);                       // the axes
    g.beginPath(); g.moveTo(X0, Y0 - H * 1.04); g.lineTo(X0, Y0); g.lineTo(X0 + W * 1.02, Y0); g.stroke();
    lw(g, H * 0.012);                                  // ticks up the y axis
    for (v = 0; v <= 40; v += 10) { y = Y0 - v / top * H; g.beginPath(); g.moveTo(X0 - m * 0.22, y); g.lineTo(X0, y); g.stroke(); }
    var bw = W / (ARIA.length * 2 + 1);
    ARIA.forEach(function (d, i) {                     // the bars, and a tick under each
      var x = X0 + bw * (1 + i * 2), hh = d[1] / top * H, grow = Math.min(1, 0.35 + t * 0.5);
      ink(g, i === 0 ? 1 : 0.55);
      g.fillRect(x, Y0 - hh * grow, bw, hh * grow);
      ink(g, 1);
      g.beginPath(); g.moveTo(x + bw / 2, Y0); g.lineTo(x + bw / 2, Y0 + m * 0.22); g.stroke();
    });
  }});

  /* ---------- build: the brackets ----------
     Angle brackets and a slash, set large in the site's mono, with the
     caret blinking inside them the way the prompt's does. The panel's
     own picture. */
  L.mount('build', { aspect: 1.5, caption: 'Angle brackets and a slash, with the caret blinking inside them.', draw: function (g, w, h, t, p) {
    var b = box(w, h, 0.10), s = b.s, l = lean(p, 1), fs = Math.round(s * 0.55);
    g.font = '500 ' + fs + 'px "JetBrains Mono", ui-monospace, Menlo, monospace';
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.globalAlpha = 1;
    var cw = g.measureText('<').width, gap = cw * 0.1, total = cw * 4 + gap * 3;
    var x = b.cx + l.x * s * 0.03 - total / 2 + cw / 2, cy = b.cy + l.y * s * 0.02 + fs * 0.04;
    ['<', '/', null, '>'].forEach(function (ch) {
      if (ch === null) {                                 // the caret: a block, on and off every 0.55s, on when still
        if (t === 0 || Math.floor(t / 0.55) % 2 === 0) { ink(g, 1); g.fillRect(x - cw * 0.26, cy - fs * 0.34, cw * 0.52, fs * 0.68); }
      } else { ink(g, ch === '/' ? 0.6 : 1); g.fillText(ch, x, cy); }
      x += cw + gap;
    });
  }});

  /* ---------- build: the mark, and its loader ----------
     Loquar's badge, drawn from the geometry its own loader is fitted to
     (design-system/loquar/logo-split.py in the Loquar repo): a dark disc,
     a speech bubble with its tail and a globe with its continents, cream on
     the disc, sharing a sage lens. Then the loader, on its own 3.8s
     timeline: the two circles wind up, rush together and fuse into one
     sphere, the globe turns once, and they come apart into the mark again.
     Between plays the mark rests for two to five seconds. Tone stands in
     for colour: cream is white, the sage lens and continents grey, the
     disc near-black. */
  function kf(u, stops) {                                // a keyframe track, eased between its stops
    if (u <= stops[0][0]) return stops[0][1];
    for (var i = 1; i < stops.length; i++) {
      if (u <= stops[i][0]) {
        var f = (u - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]); f = f * f * (3 - 2 * f);
        return stops[i - 1][1] + (stops[i][1] - stops[i - 1][1]) * f;
      }
    }
    return stops[stops.length - 1][1];
  }
  var LQ = {
    bub: { x: 45.2, y: 58.37, r: 25.58, ri: 24.48 }, glo: { x: 80.57, y: 59.49, r: 29.16, ri: 28.06 },
    tail: [[23.46, 94.59], [45.16, 80.96], [31.98, 76.68]], tailO: [35.81, 81.52],
    /* the continents, traced from the loader's own land strip (the near tile), in units about the globe's centre */
    land: [
      [[-2.75, -22.85], [-0.5, -22.48], [2.37, -20.11], [2.25, -18.48], [0.62, -16.23], [1.62, -13.11], [-2.25, -8.12], [-3, -5.74], [-4.5, -4.87], [-7.62, -4.75], [-9.62, -1.75], [-8.62, 2.75], [-7.12, 4.87], [-7.62, 7.24], [-10.24, 7.99], [-11.99, 7.62], [-13.36, 10.61], [-15.61, 12.36], [-16.61, 14.36], [-18.23, 15.49], [-19.86, 14.99], [-19.98, 13.99], [-18.48, 10.61], [-19.73, 8.24], [-16.36, 4.5], [-18.11, -1.62], [-15.74, -4.75], [-18.36, -8.12], [-18.86, -11.74], [-18.11, -14.11], [-20.73, -17.11], [-19.61, -18.36], [-17.86, -18.48], [-14.86, -15.49], [-12.86, -18.36], [-9.49, -19.11], [-7.62, -21.73], [-4.75, -21.85], [-2.87, -22.73]],
      [[15.74, -16.73], [18.73, -15.86], [20.48, -13.61], [23.23, -11.99], [24.35, -9.62], [23.48, -2], [24.98, 0.87], [25.1, 3], [23.6, 6.74], [23.6, 10.74], [21.98, 13.24], [17.23, 17.11], [14.74, 17.23], [13.74, 15.49], [14.36, 12.49], [13.99, 9.37], [14.86, 6.99], [14.61, 5], [13.61, 4.25], [9.87, 4.37], [7.62, 1.75], [5.12, 0.87], [4.5, 0], [4.62, -1.5], [6.87, -5.74], [9.99, -7.37], [11.36, -9.12], [11.36, -10.74], [9.74, -13.11], [10.12, -15.24], [11.49, -16.23], [15.61, -16.61]],
      [[-5.12, 10.24], [-3.5, 10.24], [-1.25, 11.36], [2.75, 10.49], [4, 11.11], [5.49, 13.24], [5.74, 14.74], [4.12, 16.73], [3.87, 19.23], [1.87, 21.35], [2.62, 23.48], [2.25, 24.85], [1.12, 25.1], [-0.62, 24.23], [-2.37, 21.48], [-5.12, 20.86], [-8.87, 17.61], [-8.99, 15.49], [-7.24, 13.61], [-6.37, 11.11], [-5.25, 10.37]]
    ],
    bubT: { x: [[0.08, 0], [0.11, -1.4], [0.26, 18.3], [0.72, 18.3], [0.82, -1.6], [0.90, 0]],
            y: [[0.08, 0], [0.11, -0.4], [0.26, 5.13], [0.72, 5.13], [0.82, -0.6], [0.90, 0]],
            k: [[0.08, 1], [0.11, 0.985], [0.26, 1.429], [0.31, 1.404], [0.72, 1.404], [0.82, 0.975], [0.90, 1]] },
    gloT: { x: [[0.08, 0], [0.11, 1.4], [0.26, -17.07], [0.72, -17.07], [0.82, 1.6], [0.90, 0]],
            y: [[0.08, 0], [0.11, -0.4], [0.26, 4.01], [0.72, 4.01], [0.82, -0.6], [0.90, 0]],
            k: [[0.08, 1], [0.11, 0.985], [0.26, 1.271], [0.31, 1.249], [0.72, 1.249], [0.82, 0.975], [0.90, 1]] },
    tailK: [[0.08, 1], [0.11, 1.05], [0.20, 0.02], [0.74, 0.02], [0.84, 1.07], [0.90, 1]],
    lens: [[0.11, 1], [0.24, 0], [0.74, 0], [0.86, 1]], lensFill: [[0.11, 1], [0.18, 0], [0.76, 0], [0.90, 1]],
    drift: [[0.34, 0], [0.56, 1]]
  };
  L.mount('build/loquar', { aspect: 1, caption: 'Loquar\'s mark, and its loader: the bubble and the globe fuse into one sphere, the globe turns once, and they come apart again.', draw: function (g, w, h, t, p) {
    var b = box(w, h, 0.08), s = b.s, U = s / 128, X0 = b.cx - 63.5 * U, Y0 = b.cy - 63.5 * U;
    var T = 3.8, c = 0, start = 0, rest = 2 + 3 * hash1(0, 2.2);     // a play, then a rest of two to five seconds
    while (t >= start + T + rest) { start += T + rest; c++; rest = 2 + 3 * hash1(c, 2.2); }
    var u = Math.min(1, (t - start) / T);                 // 1 is at rest, which is the logo
    var bt = { x: kf(u, LQ.bubT.x), y: kf(u, LQ.bubT.y), k: kf(u, LQ.bubT.k) };
    var gt = { x: kf(u, LQ.gloT.x), y: kf(u, LQ.gloT.y), k: kf(u, LQ.gloT.k) };
    var bx = X0 + (LQ.bub.x + bt.x) * U, by = Y0 + (LQ.bub.y + bt.y) * U, br = LQ.bub.r * bt.k * U, bri = LQ.bub.ri * bt.k * U;
    var gx = X0 + (LQ.glo.x + gt.x) * U, gy = Y0 + (LQ.glo.y + gt.y) * U, gr = LQ.glo.r * gt.k * U, gri = LQ.glo.ri * gt.k * U;
    g.globalAlpha = 1;
    ink(g, 0.3);                                           // the disc, lightly shaded, so the badge is whole
    g.beginPath(); g.arc(X0 + 63.5 * U, Y0 + 63.5 * U, 64 * U, 0, TAU); g.fill();
    ink(g, 1);                                             // the bubble, and its tail retracting into it
    g.beginPath(); g.arc(bx, by, br, 0, TAU); g.fill();
    var tk = kf(u, LQ.tailK);
    g.beginPath();
    LQ.tail.forEach(function (q, i) {
      var x1 = LQ.tailO[0] + tk * (q[0] - LQ.tailO[0]), y1 = LQ.tailO[1] + tk * (q[1] - LQ.tailO[1]);   // the tail's own scale, about its base
      var x2 = LQ.bub.x + bt.x + bt.k * (x1 - LQ.bub.x), y2 = LQ.bub.y + bt.y + bt.k * (y1 - LQ.bub.y);   // then the bubble's
      i ? g.lineTo(X0 + x2 * U, Y0 + y2 * U) : g.moveTo(X0 + x2 * U, Y0 + y2 * U);
    });
    g.closePath(); g.fill();
    g.beginPath(); g.arc(gx, gy, gr, 0, TAU); g.fill();    // the globe
    g.save();                                              // its continents, drifting one turn while fused
    g.beginPath(); g.arc(gx, gy, gr, 0, TAU); g.clip();
    /* The strip the loader drifts is the near tile, its mirror image, and the
       pair again, so every seam is continuous; one period, two tiles, is a
       full turn. The same four copies are drawn here, mirrored where the
       strip is. */
    var R = LQ.glo.r, d = kf(u, LQ.drift) * 4 * R;
    [[0, 1], [2 * R, -1], [4 * R, 1], [6 * R, -1]].forEach(function (tile) {
      var off = tile[0] - d, sgn = tile[1];
      if (off + R < -R - 4 || off - R > R + 4) return;   // this copy is off the globe
      LQ.land.forEach(function (poly) {
        g.beginPath();
        poly.forEach(function (q, i) {
          var x = gx + (sgn * q[0] + off) * gt.k * U, y = gy + q[1] * gt.k * U;
          i ? g.lineTo(x, y) : g.moveTo(x, y);
        });
        g.closePath(); ink(g, 0.6); g.fill();
        if (U > 1.6) { ink(g, 0.15); lw(g, 0.6 * U); g.stroke(); }   // the badge's thin outline, where the grid is fine enough to keep it
      });
    });
    g.restore();
    /* The lens: sage where the circles overlap, with its dark arcs. It fades
       with real alpha over the cream and the continents already painted, so
       a dissolved lens paints nothing and the turning globe shows through. */
    var lf = kf(u, LQ.lensFill), lo = kf(u, LQ.lens);
    if (lf > 0.01) {
      g.save(); g.beginPath(); g.arc(bx, by, bri, 0, TAU); g.clip();
      g.globalAlpha = lf; ink(g, 0.6); g.beginPath(); g.arc(gx, gy, gri, 0, TAU); g.fill();
      g.restore();
    }
    if (lo > 0.01) {
      g.globalAlpha = lo; ink(g, 0.15); lw(g, 0.5 * U);
      g.save(); g.beginPath(); g.arc(bx, by, bri, 0, TAU); g.clip();
      g.beginPath(); g.arc(gx, gy, gri, 0, TAU); g.stroke();
      g.restore();
      g.save(); g.beginPath(); g.arc(gx, gy, gri, 0, TAU); g.clip();
      g.beginPath(); g.arc(bx, by, bri, 0, TAU); g.stroke();
      g.restore();
    }
    g.globalAlpha = 1;
  }});

  /* ---------- build: the labyrinth, whose walls move ----------
     A real maze: a spanning tree carved over thirteen by thirteen cells,
     closed all round, with a square glade in the middle that has a door in
     the centre of each of its four sides and no other way in. There is
     always at least one wall on the move: every 0.9s another wall sets off
     and takes 2.6s to slide one cell, along its own line or across it, one
     axis at a time, to a place that keeps it a maze. The passage a move
     opens and the passage it closes lie on the same loop, so the labyrinth
     is never cut in two and never broken open, and no move may close a
     passage of the cell outside a door, so every door leads on. */
  var MAZE = (function () {
    var N = 13, G0 = 5, G1 = 7, MID = 6;                   // the glade is the middle three by three
    function glade(x, y) { return x >= G0 && x <= G1 && y >= G0 && y <= G1; }
    var GC = G0 * N + G0;
    function node(x, y) { return glade(x, y) ? GC : y * N + x; }
    var edges = [], at = {}, adj = {};
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      if (x + 1 < N && !(glade(x, y) && glade(x + 1, y))) edges.push({ a: node(x, y), b: node(x + 1, y), x: x, y: y, v: true });    // the wall east of (x, y)
      if (y + 1 < N && !(glade(x, y) && glade(x, y + 1))) edges.push({ a: node(x, y), b: node(x, y + 1), x: x, y: y, v: false });   // the wall south of it
    }
    edges.forEach(function (e, i) {
      e.i = i; e.open = false; e.fixed = false; at[(e.v ? 'v' : 'h') + e.x + ',' + e.y] = e;
      (adj[e.a] = adj[e.a] || []).push(e); (adj[e.b] = adj[e.b] || []).push(e);
    });
    var doors = [], doorCells = {};
    edges.forEach(function (e) {                           // the glade's wall never moves: a door mid-side, or shut for good
      if ((e.a === GC) === (e.b === GC)) return;
      e.fixed = true;
      e.open = e.v ? (e.y === MID && (e.x === G0 - 1 || e.x === G1)) : (e.x === MID && (e.y === G0 - 1 || e.y === G1));
      if (e.open) { doors.push(e); doorCells[e.a === GC ? e.b : e.a] = true; }
    });
    /* the cell outside each door is the way in, so no passage of its own may
       ever be closed: a wall may not slide into one of its openings */
    edges.forEach(function (e) { e.guard = doorCells[e.a] || doorCells[e.b]; });
    var seed = 7;
    function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
    var seen = {}, stack = [GC]; seen[GC] = true;         // carved by backtracking out through the four doors
    doors.forEach(function (e) { var n = e.a === GC ? e.b : e.a; seen[n] = true; stack.push(n); });
    while (stack.length) {
      var cc = stack[stack.length - 1];
      var out = adj[cc].filter(function (e) { return !e.fixed && !seen[e.a === cc ? e.b : e.a]; });
      if (!out.length) { stack.pop(); continue; }
      var e = out[Math.floor(rnd() * out.length)], n = e.a === cc ? e.b : e.a;
      e.open = true; seen[n] = true; stack.push(n);
    }
    /* A door that opens onto a dead end is no door. The carving sweeps
       past some door cells before they are expanded and leaves them as
       pockets, so each is given a passage onward: open it, then break the
       loop that makes by closing another wall on the path it closed. */
    doors.forEach(function (door) {
      var d = door.a === GC ? door.b : door.a;
      if (adj[d].some(function (e) { return e.open && e !== door; })) return;
      var ahead = adj[d].filter(function (e) { return !e.fixed; });
      var e = ahead[Math.floor(rnd() * ahead.length)], n = e.a === d ? e.b : e.a;
      var on = path(d, n), loop = [];
      edges.forEach(function (f) { if (on[f.i] && !f.fixed && f.a !== d && f.b !== d) loop.push(f); });
      e.open = true;
      if (loop.length) loop[Math.floor(rnd() * loop.length)].open = false;
    });
    function path(from, to) {                              // the edges on the one path through the tree
      var prev = {}, q = [from]; prev[from] = null;
      while (q.length) {
        var c2 = q.shift(); if (c2 === to) break;
        adj[c2].forEach(function (e2) { if (!e2.open) return; var n2 = e2.a === c2 ? e2.b : e2.a; if (!(n2 in prev)) { prev[n2] = e2; q.push(n2); } });
      }
      var on = {}, c3 = to;
      while (prev[c3]) { var e3 = prev[c3]; on[e3.i] = true; c3 = e3.a === c3 ? e3.b : e3.a; }
      return on;
    }
    function slides(busy) {                                // every wall that could slide one cell, along or across, and leave a maze
      var list = [];
      edges.forEach(function (e) {
        if (e.open || e.fixed || busy[e.i]) return;
        var on = null;
        [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (dd) {
          var f = at[(e.v ? 'v' : 'h') + (e.x + dd[0]) + ',' + (e.y + dd[1])];
          if (!f || !f.open || f.fixed || f.guard || busy[f.i]) return;
          if (!on) on = path(e.a, e.b);
          if (on[f.i]) list.push({ from: e, to: f });
        });
      });
      return list;
    }
    return { N: N, G0: G0, G1: G1, edges: edges, slides: slides, step: 0, moves: [] };
  })();
  var MAZE_STEP = 0.9, MAZE_SLIDE = 2.6;                   // a new wall sets off this often; each takes this long
  L.mount('build/daedalus', { aspect: 1, caption: 'A labyrinth, closed all round, with a glade in the middle that has a door in each side; there is always a wall on the move, sliding to a place that keeps it a maze.', draw: function (g, w, h, t, p) {
    var N = MAZE.N, b = box(w, h, 0.10), s = b.s, c = s / N, x0 = b.cx - s / 2, y0 = b.cy - s / 2;
    var K = Math.floor(t / MAZE_STEP);
    while (MAZE.step <= K) {                               // every move that has set off, applied as it sets off
      var busy = {};
      for (var j = Math.max(0, MAZE.step - 3); j < MAZE.step; j++) { var pm = MAZE.moves[j]; if (pm && pm.from) { busy[pm.from.i] = true; busy[pm.to.i] = true; } }
      var list = MAZE.slides(busy), m = list.length ? list[Math.floor(hash1(MAZE.step, 9.4) * list.length)] : { from: null, to: null };
      if (m.from) { m.from.open = true; m.to.open = false; }
      MAZE.moves[MAZE.step] = m; MAZE.step++;
    }
    var flying = [];                                       // the walls in transit right now
    for (var k = Math.max(0, K - 3); k <= K; k++) {
      var mv = MAZE.moves[k], q = (t - k * MAZE_STEP) / MAZE_SLIDE;
      if (mv && mv.from && q < 1) flying.push({ m: mv, q: q * q * (3 - 2 * q) });
    }
    var arriving = {};
    flying.forEach(function (f) { arriving[f.m.to.i] = true; });
    g.globalAlpha = 1; g.lineCap = 'square';
    ink(g, 0.25);                                          // the glade
    g.fillRect(x0 + MAZE.G0 * c, y0 + MAZE.G0 * c, (MAZE.G1 - MAZE.G0 + 1) * c, (MAZE.G1 - MAZE.G0 + 1) * c);
    ink(g, 1); lw(g, c * 0.24);
    function wall(e, fx, fy) {                             // a wall at a cell position, fractional while it slides
      g.beginPath();
      if (e.v) { g.moveTo(x0 + (fx + 1) * c, y0 + fy * c); g.lineTo(x0 + (fx + 1) * c, y0 + (fy + 1) * c); }
      else { g.moveTo(x0 + fx * c, y0 + (fy + 1) * c); g.lineTo(x0 + (fx + 1) * c, y0 + (fy + 1) * c); }
      g.stroke();
    }
    MAZE.edges.forEach(function (e) { if (!e.open && !arriving[e.i]) wall(e, e.x, e.y); });
    flying.forEach(function (f) { wall(f.m.from, f.m.from.x + (f.m.to.x - f.m.from.x) * f.q, f.m.from.y + (f.m.to.y - f.m.from.y) * f.q); });
    g.strokeRect(x0, y0, s, s);                            // closed all round
  }});

  /* ---------- leadership: the flag ----------
     The panel's own picture: a plain standard on its pole, flying. The cloth
     is a mesh whose depth is a wave travelling from the hoist to the fly,
     pinned at the pole and growing with distance, with a slower second wave
     under it so it never quite repeats. Each quad is lit by its slope and its
     x is foreshortened by its depth, which is what makes a ripple read as a
     fold rather than as shading painted on flat cloth. With no device on the
     cloth the folds are the whole picture, so the wave is let grow from
     close to the hoist rather than only at the fly, the cloth sits at a
     middle tone so a fold can go brighter as well as darker, and the light
     is set harder than a printed flag would want. The cursor is the wind:
     further right, harder; out of the window, a steady breeze. */
  L.mount('leadership', { aspect: 1.5, caption: 'A flag on its pole, in the wind.', draw: function (g, w, h, t, p) {
    var s = Math.min(w / 1.5, h) * 0.94, bw = s * 1.5, x0 = (w - bw) / 2, y0 = (h - s) / 2;
    var wind = 0.45 + 0.95 * (p.here ? p.x : 0.5);
    var px = (Math.floor((x0 + bw * 0.09) / CELL) + 0.5) * CELL, top = y0 + s * 0.06;   // the hoist, on a cell's centre so the pole is one cell wide
    var len = bw * 0.80, hgt = len / 1.9;                       // the flag's own proportion, 1:1.9
    var NU = 44, NV = 24;
    function at(u, v) {
      var a = Math.pow(u, 0.75) * s * 0.10 * wind;             // amplitude, pinned at the hoist and growing fast
      var k1 = 8.5, k2 = 3.7, w1 = 2.0 + 1.5 * wind, w2 = 0.9 + 0.7 * wind;
      var ph1 = u * k1 - t * w1 + v * 0.9, ph2 = u * k2 - t * w2 + v * 1.7 + 1.0;
      var z = a * (Math.sin(ph1) + 0.5 * Math.sin(ph2));
      var dzu = a * (k1 * Math.cos(ph1) + 0.5 * k2 * Math.cos(ph2)) / len;      // dz/dx along the fly
      var dzv = a * (0.9 * Math.cos(ph1) + 0.5 * 1.7 * Math.cos(ph2)) / hgt;    // dz/dy down the hoist
      var sag = s * 0.09 * u * u * Math.max(0, 1.3 - wind);   // the fly end drops in a soft wind
      return { x: px + u * len + z * 0.45, y: top + v * hgt + sag + z * 0.50, nx: -dzu, ny: -dzv };
    }
    var LX = -0.66, LY = -0.30, LZ = 0.68;                     // the light: upper left, and in front
    function shade(q) {
      var m = Math.sqrt(q.nx * q.nx + q.ny * q.ny + 1);
      return (q.nx * LX + q.ny * LY + LZ) / (m * LZ);          // 1 where the cloth lies flat
    }
    function cloth(u, v) { return 0.78; }                      // plain cloth, at a middle tone: the folds carry it
    g.globalAlpha = 1;
    g.lineWidth = 1;                                            // a hairline of the same tone hides the seams
    for (var j = 0; j < NV; j++) {
      for (var i = 0; i < NU; i++) {
        var u0 = i / NU, u1 = (i + 1) / NU, v0 = j / NV, v1 = (j + 1) / NV;
        var a = at(u0, v0), b = at(u1, v0), c = at(u1, v1), d = at(u0, v1), m = at((u0 + u1) / 2, (v0 + v1) / 2);
        ink(g, Math.min(1, cloth((u0 + u1) / 2, (v0 + v1) / 2) * Math.max(0.3, Math.min(1.35, shade(m)))));
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath();
        g.fill(); g.stroke();
      }
    }
    ink(g, 0.85);                                               // the pole, and its finial
    lw(g, s * 0.012);
    g.beginPath(); g.moveTo(px, y0 + s * 0.03); g.lineTo(px, y0 + s); g.stroke();
    g.beginPath(); g.arc(px, y0 + s * 0.025, Math.max(CELL * 0.7, s * 0.012), 0, TAU); g.fill();
  }});

  /* ---------- leadership: OCAPEX's mark ----------
     The logo without its lettering: the ring, and the eighth note with its
     smile. Measured from the logo file, in units of the ring's radius with
     the ring's centre at the origin: the ring is open through 77 degrees
     about east; the stem and the flag are the logo's own outlines reduced to
     a few points each; the head, the smile and the dot are the circles
     fitted to them. The ring is closed here where the logo's is open on the
     right, by request. The five staff lines are the logo's, sampled across
     the disc: one wave, dipping at the left and rising to the right, with the
     lines fanning a little wider as they go; they are drawn light and clipped
     to the disc. The wordmark and the pale disc are left out: the letters are
     noise at this grid, and a faint disc shares cells with the ring and
     waters it down. The ring and the stem are drawn a cell and a half wide so
     that each cell they cross is theirs outright. */
  var OC = {
    stem: [[-0.005, -0.798], [0.026, -0.795], [0.045, -0.779], [0.014, -0.240], [0.004, 0.313], [-0.044, 0.217], [-0.017, -0.338], [-0.030, -0.781]],
    flag: [[0.061, -0.747], [0.061, -0.649], [0.074, -0.568], [0.105, -0.501], [0.143, -0.457], [0.198, -0.422], [0.305, -0.383], [0.370, -0.347], [0.426, -0.297], [0.468, -0.230], [0.471, -0.343], [0.449, -0.436], [0.423, -0.479], [0.380, -0.518], [0.152, -0.637], [0.102, -0.683], [0.064, -0.740]],
    head: [-0.340, 0.395, 0.299],
    smile: [-0.329, 0.381, 0.233, 0.593, 2.468],       // centre, radius, and the arc it spans
    dot: [-0.110, 0.467],
    staff: [[-0.97, 0.00], [-0.853, 0.059], [-0.750, 0.086], [-0.647, 0.097], [-0.544, 0.088], [-0.441, 0.064], [-0.338, 0.030], [-0.235, -0.017], [-0.132, -0.068], [-0.029, -0.127], [0.074, -0.189], [0.177, -0.249], [0.281, -0.309], [0.384, -0.360], [0.487, -0.408], [0.590, -0.446], [0.693, -0.470], [0.796, -0.482], [0.899, -0.478], [0.97, -0.470]],
    gap: function (u) { return 0.218 + 0.037 * u; }    // between one staff line and the next, wider to the right
  };
  L.mount('leadership/ocapex', { aspect: 1, caption: 'OCAPEX\'s mark: the ring, the staff, and the eighth note.', draw: function (g, w, h, t, p) {
    var b = box(w, h, 0.06), r = b.s / 2 * 0.94, cx = b.cx, cy = b.cy;   // the ring's radius, with room for its stroke
    function P(q) { return [cx + q[0] * r, cy + q[1] * r]; }
    function shape(pts) {
      g.beginPath();
      pts.forEach(function (q, i) { var v = P(q); if (i) g.lineTo(v[0], v[1]); else g.moveTo(v[0], v[1]); });
      g.closePath(); g.fill(); g.stroke();
    }
    g.globalAlpha = 1;
    g.save();                                                  // the staff, light, and only inside the ring
    g.beginPath(); g.arc(cx, cy, r * 0.985, 0, TAU); g.clip();
    ink(g, 0.35); g.lineWidth = CELL * 0.9;
    for (var i = 0; i < 5; i++) {
      g.beginPath();
      OC.staff.forEach(function (q, j) {
        var v = P([q[0], q[1] + i * OC.gap(q[0])]);
        if (j) g.lineTo(v[0], v[1]); else g.moveTo(v[0], v[1]);
      });
      g.stroke();
    }
    g.restore();
    ink(g, 1);                                                 // the ring
    g.lineWidth = Math.max(CELL * 1.5, r * 0.04);
    g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke();
    g.lineWidth = Math.max(CELL * 1.2, r * 0.02);              // the note: stem, flag, head
    shape(OC.stem); shape(OC.flag);
    var hd = P(OC.head);
    g.beginPath(); g.arc(hd[0], hd[1], OC.head[2] * r, 0, TAU); g.fill();
    ink(g, 0.15);                                              // the smile, and the dot beside it
    lw(g, r * 0.03);
    var sm = P(OC.smile);
    g.beginPath(); g.arc(sm[0], sm[1], OC.smile[2] * r, OC.smile[3], OC.smile[4]); g.stroke();
    var dt = P(OC.dot);
    g.beginPath(); g.arc(dt[0], dt[1], Math.max(CELL * 0.5, r * 0.02), 0, TAU); g.fill();
  }});

  /* ---------- leadership: León ----------
     Mexico, with León pulsing: the city the Sound of Giving was streamed to.
     The outline is Natural Earth's 1:110m coast and border for Mexico,
     projected flat with the longitudes scaled by the cosine of the country's
     middle latitude and reduced to the points the grid can tell apart; the
     city is at 21.12 N, 101.68 W. The country is a faint ground with its coast
     a cell and a half wide, and the pulse is a ring leaving the city every two
     seconds, thinning into the ground as it grows. */
  var MX = { aspect: 1.528, leon: [0.51, 0.638], pts: [[0.659, 0.377], [0.647, 0.425], [0.641, 0.465], [0.635, 0.565], [0.641, 0.595], [0.651, 0.622], [0.658, 0.665], [0.68, 0.706], [0.687, 0.737], [0.7, 0.764], [0.735, 0.779], [0.749, 0.802], [0.778, 0.786], [0.803, 0.781], [0.848, 0.761], [0.869, 0.739], [0.877, 0.707], [0.88, 0.661], [0.886, 0.645], [0.908, 0.63], [0.943, 0.617], [0.972, 0.619], [0.992, 0.615], [1, 0.626], [0.999, 0.653], [0.981, 0.686], [0.973, 0.719], [0.979, 0.729], [0.966, 0.795], [0.958, 0.781], [0.945, 0.783], [0.933, 0.816], [0.927, 0.81], [0.923, 0.812], [0.923, 0.82], [0.862, 0.82], [0.862, 0.851], [0.847, 0.851], [0.871, 0.882], [0.875, 0.894], [0.88, 0.897], [0.88, 0.916], [0.837, 0.916], [0.821, 0.961], [0.826, 0.971], [0.821, 1], [0.784, 0.941], [0.767, 0.923], [0.74, 0.909], [0.722, 0.913], [0.695, 0.933], [0.679, 0.939], [0.631, 0.914], [0.6, 0.889], [0.575, 0.881], [0.538, 0.855], [0.51, 0.829], [0.502, 0.814], [0.483, 0.811], [0.449, 0.794], [0.436, 0.768], [0.4, 0.737], [0.384, 0.703], [0.376, 0.676], [0.387, 0.67], [0.384, 0.655], [0.391, 0.64], [0.391, 0.621], [0.38, 0.597], [0.377, 0.575], [0.366, 0.547], [0.337, 0.492], [0.304, 0.449], [0.288, 0.415], [0.26, 0.393], [0.253, 0.379], [0.258, 0.345], [0.242, 0.332], [0.222, 0.306], [0.214, 0.267], [0.196, 0.263], [0.162, 0.207], [0.16, 0.19], [0.142, 0.148], [0.131, 0.106], [0.131, 0.085], [0.107, 0.063], [0.096, 0.066], [0.078, 0.051], [0.072, 0.073], [0.078, 0.099], [0.081, 0.141], [0.122, 0.214], [0.127, 0.218], [0.132, 0.237], [0.137, 0.236], [0.144, 0.272], [0.154, 0.286], [0.161, 0.305], [0.182, 0.333], [0.193, 0.384], [0.212, 0.434], [0.214, 0.463], [0.229, 0.465], [0.255, 0.515], [0.254, 0.524], [0.24, 0.545], [0.234, 0.544], [0.225, 0.511], [0.204, 0.48], [0.163, 0.439], [0.164, 0.399], [0.159, 0.369], [0.121, 0.327], [0.116, 0.334], [0.108, 0.32], [0.088, 0.307], [0.068, 0.275], [0.071, 0.271], [0.084, 0.274], [0.097, 0.253], [0.098, 0.229], [0.072, 0.189], [0.053, 0.174], [0.013, 0.06], [0, 0.01], [0.079, 0], [0.076, 0.011], [0.201, 0.076], [0.293, 0.076], [0.293, 0.053], [0.35, 0.053], [0.362, 0.073], [0.399, 0.114], [0.418, 0.173], [0.435, 0.19], [0.462, 0.206], [0.483, 0.163], [0.51, 0.162], [0.533, 0.184], [0.561, 0.254], [0.581, 0.285], [0.588, 0.323], [0.597, 0.349], [0.646, 0.378]] };
  L.mount('leadership/imagina', { aspect: MX.aspect, caption: 'Mexico, with Le\u00f3n pulsing: the city the Sound of Giving was streamed to.', draw: function (g, w, h, t, p) {
    var s = Math.min(w / MX.aspect, h) * 0.92, X0 = w / 2 - s * MX.aspect / 2, Y0 = h / 2 - s / 2;
    function X(x) { return X0 + x * s * MX.aspect; }
    function Y(y) { return Y0 + y * s; }
    g.globalAlpha = 1;
    g.beginPath();
    MX.pts.forEach(function (q, i) { if (i) g.lineTo(X(q[0]), Y(q[1])); else g.moveTo(X(q[0]), Y(q[1])); });
    g.closePath();
    ink(g, 0.3); g.fill();                                     // the country
    ink(g, 1); g.lineWidth = CELL * 1.4; g.stroke();           // its coast and border
    var lx = X(MX.leon[0]), ly = Y(MX.leon[1]);
    for (var i = 0; i < 2; i++) {                              // the pulse: two rings a second apart
      var u = (t / 2 + i / 2) % 1, k = 1 - u;
      ink(g, 0.3 + 0.7 * k * k);
      g.lineWidth = CELL * (1.3 - 0.6 * u);
      g.beginPath(); g.arc(lx, ly, s * (0.03 + 0.42 * u), 0, TAU); g.stroke();
    }
    ink(g, 1);                                                 // the city
    g.beginPath(); g.arc(lx, ly, CELL * 1.1, 0, TAU); g.fill();
  }});

  /* ---------- leadership: the Capitol ----------
     The east front, measured off the straight-on photograph: the skyline was
     read column by column against the sky, so every width and height here is
     the building's own in units of its height from the statue's crown to the
     ground. The Statue of Freedom on the tholos, a narrow lantern a tenth of
     the height; the dome, taller than a hemisphere; the peristyle round its
     foot and, wider than the peristyle, the drum's base; the portico under
     its pediment with the grand steps below; and the wings, a third of the
     height, with their rows of windows and a pedimented pavilion at each end.
     Only the wings' length is a liberty: at the true proportion the dome
     would be six cells across. Solid forms, with the columns and the windows
     as tone against dark walls, since nothing under a cell survives this
     grid. */
  L.mount('leadership/congressional-award', { aspect: 1.46, caption: 'The Capitol, from the east.', draw: function (g, w, h, t, p) {
    var s = Math.min(w / 1.46, h) * 0.86, cx = w / 2, top = (h - s) / 2 + s * 0.01;
    g.translate(cx, top);
    g.globalAlpha = 1;
    function R(x, y, ww, hh, k) { ink(g, k); g.fillRect(x * s, y * s, ww * s, hh * s); }
    function cols(x0, x1, y0, y1, n, k) {                      // n columns across x0..x1, each a cell wide
      ink(g, k);
      var cw = Math.max(CELL * 0.95, s * 0.012);
      for (var i = 0; i < n; i++) {
        var x = (x0 + (x1 - x0) * (i + 0.5) / n) * s;
        g.fillRect(x - cw / 2, y0 * s, cw, (y1 - y0) * s);
      }
    }
    function win(x0, x1, y, n, k) {                            // a row of windows, dark on the wall
      ink(g, k);
      var ww = Math.max(CELL * 0.8, s * 0.014), wh = Math.max(CELL * 0.8, s * 0.028);
      for (var i = 0; i < n; i++) {
        var x = (x0 + (x1 - x0) * (i + 0.5) / n) * s;
        g.fillRect(x - ww / 2, y * s, ww, wh);
      }
    }
    function pediment(x0, x1, yb, yt, k) {
      ink(g, k);
      g.beginPath(); g.moveTo(x0 * s, yb * s); g.lineTo((x0 + x1) / 2 * s, yt * s); g.lineTo(x1 * s, yb * s); g.closePath(); g.fill();
    }
    ink(g, 1);                                                 // the Statue of Freedom, on her pedestal
    g.beginPath(); g.arc(0, s * 0.03, Math.max(CELL * 0.5, s * 0.012), 0, TAU); g.fill();
    g.beginPath(); g.moveTo(-s * 0.012, s * 0.042); g.lineTo(s * 0.012, s * 0.042); g.lineTo(s * 0.02, s * 0.10); g.lineTo(-s * 0.02, s * 0.10); g.closePath(); g.fill();
    R(-0.03, 0.10, 0.06, 0.016, 0.8);
    ink(g, 1);                                                 // the tholos: a cap on a narrow ring of columns
    g.beginPath(); g.ellipse(0, s * 0.14, s * 0.045, s * 0.025, 0, Math.PI, TAU); g.fill();
    R(-0.038, 0.14, 0.076, 0.08, 0.35);
    cols(-0.038, 0.038, 0.14, 0.22, 2, 1);
    R(-0.05, 0.218, 0.10, 0.012, 1);
    ink(g, 0.9);                                               // the dome, taller than a hemisphere
    g.beginPath();
    g.moveTo(-s * 0.17, s * 0.40);
    g.bezierCurveTo(-s * 0.17, s * 0.30, -s * 0.09, s * 0.225, 0, s * 0.225);
    g.bezierCurveTo(s * 0.09, s * 0.225, s * 0.17, s * 0.30, s * 0.17, s * 0.40);
    g.closePath(); g.fill();
    ink(g, 0.3); lw(g, s * 0.008);                             // its ribs
    for (var i = -2; i <= 2; i++) {
      g.beginPath();
      g.moveTo(i * s * 0.06, s * 0.40);
      g.quadraticCurveTo(i * s * 0.045, s * 0.27, 0, s * 0.23);
      g.stroke();
    }
    R(-0.185, 0.395, 0.37, 0.016, 1);                          // the balustrade round the dome's foot
    R(-0.185, 0.411, 0.37, 0.10, 0.35);                        // the peristyle: the ring of columns round the drum
    cols(-0.185, 0.185, 0.411, 0.511, 5, 1);
    R(-0.20, 0.511, 0.40, 0.02, 1);                            // its entablature
    R(-0.22, 0.531, 0.44, 0.10, 0.75);                         // the drum's base, wider, windows in it
    win(-0.19, 0.19, 0.556, 5, 0.2);
    R(-0.23, 0.631, 0.46, 0.06, 0.9);                          // and its footing
    pediment(-0.36, 0.36, 0.71, 0.64, 1);                      // the central portico: pediment, entablature, columns
    R(-0.38, 0.71, 0.76, 0.022, 1);
    R(-0.36, 0.732, 0.72, 0.17, 0.3);
    cols(-0.34, 0.34, 0.732, 0.902, 8, 1);
    [-1, 1].forEach(function (d) {                             // the wings, and the pavilion at the end of each
      var w0 = Math.min(d * 0.38, d * 0.72), w1 = Math.max(d * 0.38, d * 0.72);
      R(w0, 0.70, w1 - w0, 0.25, 0.6);
      R(w0, 0.70, w1 - w0, 0.016, 1);
      var a = Math.min(d * 0.40, d * 0.58), b = Math.max(d * 0.40, d * 0.58);
      win(a, b, 0.75, 4, 0.15);
      win(a, b, 0.83, 4, 0.15);
      var lo = Math.min(d * 0.60, d * 0.72), hi = Math.max(d * 0.60, d * 0.72);
      pediment(lo, hi, 0.70, 0.665, 1);
      R(lo, 0.716, hi - lo, 0.234, 0.3);
      cols(lo, hi, 0.716, 0.95, 3, 1);
    });
    R(-0.73, 0.95, 1.46, 0.05, 0.8);                           // the basement storey, the whole width
    ink(g, 0.7); lw(g, s * 0.006);                             // the grand steps
    for (i = 0; i < 5; i++) {
      var y = 0.915 + i * 0.019, hw = 0.16 + i * 0.03;
      g.beginPath(); g.moveTo(-hw * s, y * s); g.lineTo(hw * s, y * s); g.stroke();
    }
  }});

  /* ---------- music: an instrument ----------
     A member of the violin family, upright and from the front: the body's
     two bouts and the C-bouts between them, from the classic outline in units
     of the body's length; the neck, the pegbox and the scroll above it; and
     the fingerboard, the f-holes, the bridge and the tailpiece as a lighter
     tone on the body. The fingerboard is only drawn where it crosses the body:
     on the neck it would take the neck with it, since the two are a cell
     wide between them. One drawing serves the viola on the panel and the
     four of the quartet, each at its own size. */
  var FIDDLE = [                                            // the right half of the body, top centre to bottom centre
    [[0.13, 0.00], [0.235, 0.09], [0.235, 0.22]],           // out round the upper bout
    [[0.235, 0.30], [0.21, 0.35], [0.19, 0.37]],            // in to the upper corner
    [[0.15, 0.40], [0.15, 0.53], [0.21, 0.56]],             // the C-bout, out to the lower corner
    [[0.29, 0.60], [0.29, 0.72], [0.29, 0.78]],             // round the lower bout
    [[0.29, 0.90], [0.14, 1.00], [0.00, 1.00]]              // down to the bottom
  ];
  function fiddle(g, cx, y0, L, endpin, tone) {             // cx the centre line, y0 the top of the body, L its length in px, tone its ink
    var k = tone == null ? 0.85 : tone;
    g.save(); g.translate(cx, y0);
    ink(g, k);                                              // the neck and the pegbox, under the body
    g.fillRect(-L * 0.035, -L * 0.56, L * 0.07, L * 0.60);
    g.fillRect(-L * 0.045, -L * 0.72, L * 0.09, L * 0.20);
    g.beginPath(); g.arc(0, -L * 0.77, Math.max(CELL * 0.6, L * 0.065), 0, TAU); g.fill();   // the scroll
    g.beginPath(); g.moveTo(0, 0);                          // the body, the outline mirrored down the left side
    FIDDLE.forEach(function (c) { g.bezierCurveTo(c[0][0] * L, c[0][1] * L, c[1][0] * L, c[1][1] * L, c[2][0] * L, c[2][1] * L); });
    for (var i = FIDDLE.length - 1; i >= 0; i--) {
      var c = FIDDLE[i], e = i ? FIDDLE[i - 1][2] : [0, 0];
      g.bezierCurveTo(-c[1][0] * L, c[1][1] * L, -c[0][0] * L, c[0][1] * L, -e[0] * L, e[1] * L);
    }
    g.closePath(); g.fill();
    if (endpin) { lw(g, L * 0.02); g.beginPath(); g.moveTo(0, L); g.lineTo(0, L * 1.18); g.stroke(); }
    ink(g, k * 0.35);                                       // the fingerboard, where it runs out over the body; on the neck it would take the neck with it at this grid
    g.beginPath(); g.moveTo(-L * 0.034, L * 0.02); g.lineTo(L * 0.034, L * 0.02); g.lineTo(L * 0.04, L * 0.45); g.lineTo(-L * 0.04, L * 0.45); g.closePath(); g.fill();
    lw(g, L * 0.022);                                       // the f-holes
    [-1, 1].forEach(function (d) {
      g.beginPath(); g.moveTo(d * L * 0.10, L * 0.40); g.quadraticCurveTo(d * L * 0.135, L * 0.51, d * L * 0.11, L * 0.62); g.stroke();
    });
    g.fillRect(-L * 0.13, L * 0.55, L * 0.26, L * 0.03);    // the bridge
    g.beginPath(); g.moveTo(-L * 0.02, L * 0.66); g.lineTo(L * 0.02, L * 0.66); g.lineTo(L * 0.045, L * 0.97); g.lineTo(-L * 0.045, L * 0.97); g.closePath(); g.fill();   // the tailpiece
    g.restore();
  }

  /* ---------- music: the alto clef ----------
     The viola's clef on its staff, and a note the cursor puts where it likes:
     the pointer's height picks a line or a space, the stem goes up from a
     low note and down from a high one, and a note off the top or bottom of
     the staff gets its ledger line. The clef is the printed glyph itself, its
     outline taken from a public-domain engraving and set on the staff by
     that engraving's own staff metrics, so the two uprights and the two
     hooks are the type's rather than a drawing of them. With the cursor at
     rest the note sits on the middle line, which on this clef is middle C.
     Drawn smaller than the pictures around it, at about half the window's
     height. */
  var CLEF = { d: 'M 4752,7579 L 4752,5273 L 4752,5222 L 5018,5222 L 5018,7528 L 5018,7579 L 4752,7579 z M 5152,7579 L 5152,5273 L 5152,5222 L 5237,5222 L 5237,6377 C 5279,6355 5322,6310 5364,6239 C 5407,6169 5443,6095 5471,6016 C 5499,5937 5514,5879 5516,5841 C 5529,5925 5550,5992 5578,6043 C 5607,6093 5638,6129 5674,6151 C 5710,6172 5745,6183 5781,6183 C 5870,6183 5926,6143 5950,6062 C 5974,5981 5986,5882 5986,5765 C 5986,5712 5985,5664 5982,5622 C 5979,5580 5973,5537 5962,5494 C 5952,5451 5935,5412 5911,5378 C 5886,5344 5854,5320 5814,5308 C 5778,5298 5742,5293 5707,5293 C 5675,5293 5648,5299 5627,5310 C 5605,5321 5593,5338 5591,5358 C 5596,5376 5608,5397 5629,5422 C 5650,5446 5664,5465 5672,5477 C 5680,5489 5684,5506 5684,5529 C 5684,5570 5670,5604 5642,5632 C 5614,5660 5577,5675 5530,5675 C 5484,5675 5446,5658 5418,5625 C 5390,5591 5375,5551 5373,5506 C 5377,5445 5399,5392 5438,5348 C 5478,5305 5527,5272 5586,5250 C 5645,5228 5704,5217 5764,5217 C 5832,5217 5897,5229 5959,5253 C 6022,5277 6078,5313 6126,5359 C 6175,5406 6214,5463 6242,5531 C 6270,5598 6284,5675 6284,5760 C 6284,5878 6262,5976 6219,6053 C 6175,6131 6119,6189 6051,6225 C 5982,6261 5909,6281 5832,6283 C 5752,6278 5685,6260 5632,6229 L 5526,6401 L 5632,6572 C 5705,6542 5777,6527 5847,6527 C 5936,6527 6013,6553 6080,6603 C 6146,6654 6197,6719 6232,6800 C 6266,6881 6284,6964 6284,7050 C 6284,7144 6263,7232 6221,7313 C 6179,7394 6120,7458 6044,7507 C 5967,7555 5880,7579 5781,7579 C 5666,7574 5570,7547 5493,7497 C 5416,7448 5378,7374 5378,7277 C 5382,7230 5399,7194 5429,7167 C 5459,7139 5491,7125 5526,7122 C 5568,7122 5606,7137 5639,7167 C 5672,7196 5689,7233 5689,7277 C 5689,7294 5685,7310 5677,7325 C 5669,7339 5658,7356 5642,7376 C 5626,7395 5615,7409 5609,7418 C 5603,7428 5598,7439 5596,7453 C 5596,7471 5607,7486 5630,7498 C 5652,7510 5681,7517 5716,7520 C 5826,7515 5899,7468 5936,7381 C 5972,7292 5990,7183 5990,7050 C 5990,6935 5977,6834 5951,6748 C 5925,6661 5869,6618 5781,6618 C 5703,6618 5643,6651 5601,6719 C 5559,6786 5532,6865 5520,6956 C 5507,6879 5487,6805 5458,6734 C 5429,6662 5396,6599 5357,6545 C 5320,6492 5279,6449 5237,6419 L 5237,7579 L 5152,7579 z', x0: 4752.0, space: 590.5, mid: 6398.0, path: null };
  L.mount('music/chamber-orchestra', { aspect: 1.6, caption: 'The alto clef on its staff; the cursor puts a note on it.', draw: function (g, w, h, t, p) {
    var s = Math.min(w / 1.6, h) * 0.94, cx = w / 2, cy = h / 2, u = s * 0.115;      // u: one staff space
    var left = cx - s * 0.72, right = cx + s * 0.72;
    g.globalAlpha = 1;
    ink(g, 0.5); lw(g, u * 0.07);                                              // the staff
    for (var i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(left, cy + i * u); g.lineTo(right, cy + i * u); g.stroke(); }
    if (!CLEF.path && window.Path2D) CLEF.path = new Path2D(CLEF.d);
    ink(g, 1);
    if (CLEF.path) {                                                           // the clef, the glyph scaled by its staff space
      g.save(); g.translate(left + u * 1.2, cy); g.scale(u / CLEF.space, u / CLEF.space); g.translate(-CLEF.x0, -CLEF.mid);
      g.fill(CLEF.path); g.restore();
    } else {                                                                   // without Path2D, the uprights at least
      g.fillRect(left + u * 1.2, cy - 2 * u, u * 0.45, 4 * u); g.fillRect(left + u * 1.9, cy - 2 * u, Math.max(CELL * 0.9, u * 0.15), 4 * u);
    }
    var pos = Math.max(-6, Math.min(6, Math.round(((p.here ? p.y : 0.5) * 2 - 1) * 6)));   // the note, in half-spaces from the middle line
    if (!p.here) pos = 0;
    var nx = cx + s * 0.24, ny = cy + pos * u * 0.5, nr = Math.max(CELL * 0.7, u * 0.42);
    if (Math.abs(pos) >= 6) { lw(g, u * 0.1); g.beginPath(); g.moveTo(nx - u * 0.8, ny); g.lineTo(nx + u * 0.8, ny); g.stroke(); }   // its ledger line
    g.beginPath(); g.ellipse(nx, ny, nr * 1.25, nr * 0.85, -0.45, 0, TAU); g.fill();
    g.lineWidth = Math.max(CELL * 0.9, u * 0.1);
    var up = pos > 0, sx = nx + (up ? 1 : -1) * nr * 1.05;
    g.beginPath(); g.moveTo(sx, ny); g.lineTo(sx, ny + (up ? -1 : 1) * u * 3.2); g.stroke();
  }});

  /* ---------- music: Florida ----------
     Florida, with a note pulsing at Fort Lauderdale, where the orchestra
     plays. The outline is the state's from a public boundary file, projected
     flat with the longitudes scaled by the cosine of its middle latitude and
     reduced to the points the grid can tell apart; the state is a faint
     ground with its coast a cell and a half wide. The note is an eighth note
     that swells on every beat, and a ring leaves it each beat and thins into
     the ground as it grows. */
  var FL = { aspect: 1.14, at: [0.986, 0.83], pts: [[0.281, 0.001], [0.346, 0], [0.364, 0.049], [0.544, 0.061], [0.713, 0.074], [0.719, 0.11], [0.735, 0.109], [0.741, 0.074], [0.736, 0.043], [0.748, 0.03], [0.778, 0.044], [0.814, 0.05], [0.822, 0.124], [0.839, 0.207], [0.877, 0.316], [0.935, 0.432], [0.927, 0.44], [0.929, 0.494], [0.954, 0.555], [0.992, 0.677], [1, 0.715], [0.999, 0.754], [0.985, 0.895], [0.973, 0.898], [0.96, 0.941], [0.964, 0.955], [0.939, 0.987], [0.929, 0.98], [0.904, 0.993], [0.862, 1], [0.85, 0.982], [0.856, 0.956], [0.826, 0.881], [0.803, 0.867], [0.783, 0.877], [0.767, 0.835], [0.763, 0.801], [0.736, 0.763], [0.729, 0.737], [0.733, 0.701], [0.718, 0.695], [0.722, 0.716], [0.708, 0.722], [0.666, 0.629], [0.65, 0.606], [0.689, 0.538], [0.664, 0.542], [0.646, 0.563], [0.629, 0.53], [0.652, 0.437], [0.656, 0.359], [0.64, 0.341], [0.635, 0.316], [0.61, 0.31], [0.581, 0.269], [0.557, 0.252], [0.555, 0.227], [0.539, 0.218], [0.525, 0.19], [0.475, 0.153], [0.431, 0.161], [0.433, 0.187], [0.419, 0.182], [0.364, 0.214], [0.305, 0.222], [0.307, 0.203], [0.293, 0.181], [0.225, 0.13], [0.176, 0.109], [0.132, 0.103], [0.095, 0.107], [0.015, 0.123], [0.035, 0.098], [0.024, 0.084], [0.03, 0.056], [0, 0.023], [0.004, 0.001]] };
  L.mount('music/fyo', { aspect: FL.aspect, caption: 'Florida, with a note pulsing at Fort Lauderdale, where the orchestra plays.', draw: function (g, w, h, t, p) {
    var s = Math.min(w / FL.aspect, h) * 0.92, X0 = w / 2 - s * FL.aspect / 2, Y0 = h / 2 - s / 2;
    function X(x) { return X0 + x * s * FL.aspect; }
    function Y(y) { return Y0 + y * s; }
    g.globalAlpha = 1;
    g.beginPath();
    FL.pts.forEach(function (q, i) { if (i) g.lineTo(X(q[0]), Y(q[1])); else g.moveTo(X(q[0]), Y(q[1])); });
    g.closePath();
    ink(g, 0.3); g.fill();                                     // the state
    ink(g, 1); g.lineWidth = CELL * 1.4; g.stroke();           // its coast and its border
    var nx = X(FL.at[0]), ny = Y(FL.at[1]), beat = (t * 1.5) % 1, swell = 1 + 0.18 * Math.pow(1 - beat, 3);   // 90 to the minute
    for (var i = 0; i < 2; i++) {                              // the rings, two a beat apart
      var u = (t * 0.75 + i / 2) % 1, k = 1 - u;
      ink(g, 0.3 + 0.7 * k * k); g.lineWidth = CELL * (1.2 - 0.6 * u);
      g.beginPath(); g.arc(nx, ny, s * (0.03 + 0.34 * u), 0, TAU); g.stroke();
    }
    ink(g, 1);                                                 // the note: head, stem, flag
    var nr = Math.max(CELL * 0.75, s * 0.035) * swell;
    g.beginPath(); g.ellipse(nx, ny, nr * 1.25, nr * 0.85, -0.45, 0, TAU); g.fill();
    g.lineWidth = Math.max(CELL * 0.9, nr * 0.28);
    g.beginPath(); g.moveTo(nx + nr * 1.05, ny - nr * 0.3); g.lineTo(nx + nr * 1.05, ny - s * 0.17 * swell); g.stroke();
    g.beginPath(); g.moveTo(nx + nr * 1.05, ny - s * 0.17 * swell);
    g.quadraticCurveTo(nx + nr * 1.05 + s * 0.06, ny - s * 0.13 * swell, nx + nr * 1.05 + s * 0.045, ny - s * 0.06 * swell); g.stroke();
  }});

  /* ---------- music: the quartet ----------
     Amora's four, standing in a row: two violins, a viola and a cello on its
     endpin. The sizes are the instruments' own relative to one another, with
     the cello drawn a touch under scale so the violins keep their outline at
     this grid; at true scale they would be four cells wide. */
  L.mount('music/amora', { aspect: 1.15, caption: 'Amora\'s four: two violins, a viola and a cello.', draw: function (g, w, h, t, p) {
    var s = Math.min(w / 1.15, h) * 0.76, cx = w / 2, base = h / 2 + s * 0.40;   // base: where the bodies' bottoms stand
    var row = [[0.30, false], [0.30, false], [0.34, false], [0.475, true]], gap = s * 0.05, x = 0;
    row.forEach(function (r) { x += r[0] * 0.58 * s + gap; });
    x = cx - (x - gap) / 2;
    g.globalAlpha = 1;
    row.forEach(function (r) {
      var L = r[0] * s, wd = L * 0.58;
      fiddle(g, x + wd / 2, base - L - (r[1] ? L * 0.18 : 0), L, r[1]);
      x += wd + gap;
    });
  }});

  /* ---------- music: the metronome ----------
     The panel's own picture: a metronome, the pyramid case with its window,
     the pendulum on its pivot near the foot and the weight on it, the beat
     marked on the scale beside it. The cursor sets the tempo, across the
     dial's own range: 40 to the minute at the left edge of the window, 208
     at the right, and the weight slides to where that tempo sits on the
     scale, high for slow and low for fast. The swing is a phase that
     accumulates at the current tempo, so a change of tempo bends the beat
     rather than jumping it; out of the window it settles to 72. The case's
     foot flashes at each end of the swing, which is the tick. */
  var metro = { phase: 0, last: 0, bpm: 72 };
  L.mount('music', { aspect: 0.62, caption: 'A metronome; the cursor sets its tempo, 40 to 208 to the minute.', draw: function (g, w, h, t, p) {
    var s = Math.min(w / 0.62, h) * 0.94, cx = w / 2, top = h / 2 - s * 0.5;
    var want = p.here ? 40 + 168 * Math.max(0, Math.min(1, p.x)) : 72;
    metro.bpm += (want - metro.bpm) * 0.08;
    var dt = metro.last ? Math.min(0.1, Math.max(0, t - metro.last)) : 0;
    metro.last = t;
    metro.phase += dt * metro.bpm / 60 * Math.PI;                             // one beat is one swing, end to end
    var swing = Math.sin(metro.phase), ang = swing * 0.42;
    var pivot = [cx, top + s * 0.86], rod = s * 0.66;
    g.globalAlpha = 1;
    ink(g, 0.55);                                                              // the case
    g.beginPath(); g.moveTo(cx - s * 0.30, top + s * 0.96); g.lineTo(cx - s * 0.11, top + s * 0.06); g.lineTo(cx + s * 0.11, top + s * 0.06); g.lineTo(cx + s * 0.30, top + s * 0.96); g.closePath(); g.fill();
    ink(g, 0.15);                                                              // its window, dark
    g.beginPath(); g.moveTo(cx - s * 0.17, top + s * 0.80); g.lineTo(cx - s * 0.06, top + s * 0.12); g.lineTo(cx + s * 0.06, top + s * 0.12); g.lineTo(cx + s * 0.17, top + s * 0.80); g.closePath(); g.fill();
    ink(g, 0.7); lw(g, s * 0.008);                                             // the scale, a mark every twelve beats
    for (var i = 0; i <= 7; i++) {
      var y = top + s * (0.18 + i * 0.085);
      g.beginPath(); g.moveTo(cx - s * 0.035, y); g.lineTo(cx + s * 0.035, y); g.stroke();
    }
    ink(g, Math.abs(swing) > 0.965 ? 1 : 0.85);                                // the foot, which ticks
    g.fillRect(cx - s * 0.32, top + s * 0.94, s * 0.64, s * 0.05);
    g.save(); g.translate(pivot[0], pivot[1]); g.rotate(ang);
    ink(g, 1); g.lineWidth = CELL * 1.1;                                       // the pendulum
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -rod); g.stroke();
    var k = (metro.bpm - 40) / 168, wy = -rod * (0.92 - 0.62 * k);             // the weight, high for slow, low for fast
    g.fillRect(-s * 0.05, wy - s * 0.035, s * 0.10, s * 0.07);
    g.beginPath(); g.arc(0, 0, Math.max(CELL * 0.7, s * 0.03), 0, TAU); g.fill();   // the pivot
    g.restore();
  }});

  /* ---------- music: the laurel ----------
     Two branches tied at the foot and curving up to meet, nearly, at the
     top, each with its leaves in pairs splayed either side of it and
     pointing on along it. The branch is floored at a cell's width, which is
     what the first drawing lacked: its stem was thinner than a cell and
     dropped out, leaving the leaves floating in two arcs. */
  var LAUREL = [[0.06, 0.44], [0.46, 0.30], [0.50, -0.20], [0.14, -0.42]];      // one branch, a cubic, foot to tip
  L.mount('music/honors', { aspect: 1, caption: 'A laurel wreath.', draw: function (g, w, h, t, p) {
    var b = box(w, h, 0.1), s = b.s, B = LAUREL;
    g.translate(b.cx, b.cy);
    g.globalAlpha = 1;
    function at(u) {
      var v = 1 - u;
      return [v * v * v * B[0][0] + 3 * v * v * u * B[1][0] + 3 * v * u * u * B[2][0] + u * u * u * B[3][0],
              v * v * v * B[0][1] + 3 * v * v * u * B[1][1] + 3 * v * u * u * B[2][1] + u * u * u * B[3][1]];
    }
    function along(u) {
      var v = 1 - u;
      return Math.atan2(3 * v * v * (B[1][1] - B[0][1]) + 6 * v * u * (B[2][1] - B[1][1]) + 3 * u * u * (B[3][1] - B[2][1]),
                        3 * v * v * (B[1][0] - B[0][0]) + 6 * v * u * (B[2][0] - B[1][0]) + 3 * u * u * (B[3][0] - B[2][0]));
    }
    [-1, 1].forEach(function (d) {
      g.save(); g.scale(d, 1);
      ink(g, 0.7); lw(g, s * 0.014);
      g.beginPath(); g.moveTo(B[0][0] * s, B[0][1] * s);
      g.bezierCurveTo(B[1][0] * s, B[1][1] * s, B[2][0] * s, B[2][1] * s, B[3][0] * s, B[3][1] * s); g.stroke();
      ink(g, 1);
      for (var i = 0; i < 11; i++) {
        var u = 0.06 + i / 11 * 0.9, q = at(u), a = along(u);
        [-1, 1].forEach(function (side) {
          g.save(); g.translate(q[0] * s, q[1] * s); g.rotate(a + side * 0.6);
          g.beginPath(); g.ellipse(s * 0.05, 0, s * 0.052, s * 0.018, 0, 0, TAU); g.fill();
          g.restore();
        });
      }
      g.restore();
    });
    ink(g, 0.8);                                                               // the knot
    g.beginPath(); g.ellipse(0, s * 0.45, s * 0.05, s * 0.03, 0, 0, TAU); g.fill();
  }});
})();
