// The hero: "Leonardo Carvalho" in Switzer, heavy and blocky, drawn by the room in neon light (after Apple's "It's
// Glowtime"): a crisp tube of flowing colour locked to every letter's outline, three echoes tracing it again in their
// own colours (pink, orange, cyan) a little inside and outside the edge, translucent faces in the tube's colours, and
// a pool with a coloured halo behind, near black by night (the ink in shaders.js). The echoes grow out of the outline as the light arrives. The title is
// the control: click or tap it (or press Return) and the name glides into the main window's title slot, the light
// going out as it turns white, and hands off to the HTML title, which is plain text from then on (the effect stays
// out of the content layer). Without the room (no WebGL2, reduced transparency, forced colours) the same name is HTML
// text with the neon approximated in CSS (solid under reduced transparency, plain in forced colours), and entering
// is a fade.
//
// Layouts are read from the page itself, glyph by glyph: the hero button and the window's title are real text set
// by the stylesheet, so the mask is drawn exactly where (and as) the browser sets them, and the glide ends on the
// title's own glyphs. The mask (red the letters, green a soft copy of them whose half level is the outline the neon
// follows, blue a wide blur of them for the halo and the pool) is redrawn at screen resolution on every frame of the
// glide.
import { createSpring, tween } from './springs.js';
import { onFrame } from './frame.js';

// the same stack as --font-name in site.css, so if Switzer cannot load, the canvas and the title fall back alike
const FAMILY = '"Switzer", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI Variable Display", "Segoe UI", Roboto, system-ui, sans-serif';
const TUBE = .024, GLOW = .4;               // the outline's softness and the halo's, as fractions of the font size
const DRIFT = .05;                          // how far the echoes stray from the outline, with their glow (font sizes)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wait = s => new Promise(r => setTimeout(r, s * 1000));

// a layout: font size and weight (CSS px), and each letter with its baseline origin on screen (CSS px)
function measure(root, ctx) {
  const words = [...root.querySelectorAll('.name__w, .hero__w')];
  const box = root.getBoundingClientRect();
  if (!words.length || box.width < 2) return null;
  const cs = getComputedStyle(words[0]);
  const k = root.offsetWidth ? box.width / root.offsetWidth : 1;   // a transform's scale (the window arriving)
  const size = parseFloat(cs.fontSize) * k, weight = parseFloat(cs.fontWeight) || 700;
  ctx.font = `${weight} ${size}px ${FAMILY}`;
  const asc = ctx.measureText('L').fontBoundingBoxAscent || size * .98;
  const r = document.createRange(), glyphs = [];
  for (const w of words) {
    const t = w.firstChild;
    if (!t || t.nodeType !== 3) continue;
    for (let i = 0; i < t.length; i++) {
      if (t.data[i] === ' ') continue;
      r.setStart(t, i); r.setEnd(t, i + 1);
      const b = r.getBoundingClientRect();
      glyphs.push({ ch: t.data[i], x: b.left, y: b.top + asc, w: b.width });
    }
  }
  return glyphs.length ? { size, weight, glyphs } : null;
}
const centre = L => { let x = 0, y = 0; for (const g of L.glyphs) { x += g.x; y += g.y; } return [x / L.glyphs.length, y / L.glyphs.length]; };
function bounds(L) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const g of L.glyphs) { x0 = Math.min(x0, g.x); x1 = Math.max(x1, g.x + Math.max(g.w, L.size * .7)); y0 = Math.min(y0, g.y - L.size * .78); y1 = Math.max(y1, g.y + L.size * .06); }
  return { x0, x1, y0, y1 };
}
// Part way from a to b (the same letters): the size in log space, the weight in a line, the letters about a centre
// that moves in a straight line. At 0 it is a exactly, at 1 exactly b.
export function between(a, b, v) {
  const s = a.size * Math.pow(b.size / a.size, v), ca = centre(a), cb = centre(b);
  const c = [ca[0] + (cb[0] - ca[0]) * v, ca[1] + (cb[1] - ca[1]) * v];
  const glyphs = a.glyphs.map((g, i) => {
    const h = b.glyphs[i] || g;
    const ox = (g.x - ca[0]) / a.size * (1 - v) + (h.x - cb[0]) / b.size * v;
    const oy = (g.y - ca[1]) / a.size * (1 - v) + (h.y - cb[1]) / b.size * v;
    return { ch: g.ch, x: c[0] + ox * s, y: c[1] + oy * s, w: (g.w / a.size * (1 - v) + h.w / b.size * v) * s };
  });
  return { size: s, weight: a.weight + (b.weight - a.weight) * v, glyphs };
}

export function createHero({ room, windows }) {
  const html = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');
  const btn = hero && hero.querySelector('.hero__name'), hint = hero && hero.querySelector('.hero__hint');
  const space = document.querySelector('[data-space]');
  const glass = () => !!room && html.classList.contains('gl');
  let state = 'off', cleanup = () => {};

  const parts = () => ({
    main: document.getElementById('main'),
    side: document.querySelector('aside.side:not(.side--inline)'),
    tabs: document.querySelector('nav.tabs'),
    bar: document.querySelector('.space > .toolbar:not(.toolbar--sheet)'),
    grab: document.querySelector('.grab'),
  });
  const all = p => [p.main, p.side, p.tabs, p.bar, p.grab].filter(Boolean);

  // ---------- the mask ----------
  const ctx = document.createElement('canvas').getContext('2d');
  const canvas = document.createElement('canvas'), g = canvas.getContext('2d');
  const letters = document.createElement('canvas'), lg = letters.getContext('2d');
  // on: how much shows; white: 0 is neon, 1 the white title; px: the outline's softness; fs: the font size; glow: the
  // light (with hover and press); lean: the halo's lean toward the pointer; light: the hot spot (x, y, radius, strength)
  const ink = { on: 0, dim: 0, white: 0, px: 3, fs: 100, glow: 0, lean: [0, 0], light: [0, 0, 1, 0], canvas, dirty: false, xform: [1, 0, 0] };
  let drawnAt = 0;                                                         // the room's pixel ratio the mask was drawn for
  function draw(L, withGlow) {
    const dpr = drawnAt = room.dpr, fs = L.size * dpr, bev = fs * TUBE, gs = fs * GLOW, b = bounds(L);
    const m = Math.ceil((withGlow ? gs * 2.6 : bev * 4 + fs * DRIFT) + 4);
    const ox = Math.floor(b.x0 * dpr) - m, oy = Math.floor(b.y0 * dpr) - m;
    const cw = Math.ceil(b.x1 * dpr) + m - ox, ch = Math.ceil(b.y1 * dpr) + m - oy;
    for (const c of [canvas, letters]) if (c.width !== cw || c.height !== ch) { c.width = cw; c.height = ch; }
    lg.setTransform(1, 0, 0, 1, 0, 0);
    lg.clearRect(0, 0, cw, ch);
    lg.font = `${Math.round(L.weight)} ${fs}px ${FAMILY}`;
    lg.textBaseline = 'alphabetic';
    lg.fillStyle = '#fff';
    for (const q of L.glyphs) lg.fillText(q.ch, q.x * dpr - ox, q.y * dpr - oy);
    // each channel is the letters' shadow (sharp, or blurred), cast from a copy drawn off the canvas: every
    // browser's 2D canvas blurs shadows
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-over'; g.shadowColor = 'transparent';
    g.fillStyle = '#000'; g.fillRect(0, 0, cw, ch);
    g.globalCompositeOperation = 'lighter';
    const away = cw + 64;
    for (const [colour, blur] of [['#f00', 0], ['#0f0', bev], ['#00f', withGlow ? gs : -1]]) {
      if (blur < 0) continue;
      g.shadowColor = colour; g.shadowBlur = blur * 2; g.shadowOffsetX = away; g.shadowOffsetY = 0;
      g.drawImage(letters, -away, 0);
    }
    g.shadowColor = 'transparent';
    ink.xform = [1, -ox, -oy];
    ink.px = bev; ink.fs = fs;
    ink.dirty = true;
    room.kick(.3);
  }

  // ---------- the light: the hot spot and the halo lean gently toward the pointer ----------
  const glowS = createSpring({ value: 1, response: .45, damping: 1 });   // 1 at rest, lifted by hover, flared by a press
  let shown = 0;                                                           // the arrival, 0 to 1
  function lightFor(L, glowLeft) {
    const dpr = room.dpr, b = bounds(L);
    const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, hw = Math.max(1, (b.x1 - b.x0) / 2), hh = Math.max(1, (b.y1 - b.y0) / 2);
    const [lx, ly] = reduced.matches ? [innerWidth * .35, -120] : room.state.light;
    const dx = clamp((lx - cx) / hw, -1.4, 1.4), dy = clamp((ly - cy) / (hh * 4), -1.2, 1.2);
    ink.light = [(cx + dx * hw * .5) * dpr, (cy + dy * hh * .7) * dpr, L.size * 1.4 * dpr, .14 * glowLeft];
    ink.lean = reduced.matches ? [0, 0] : [dx * L.size * .05 * dpr, dy * L.size * .07 * dpr];
    ink.glow = shown * glowS.value * glowLeft;
  }

  // ---------- the hero ----------
  let H = null;
  const heroLayout = () => btn && measure(btn, ctx);
  const titleOf = () => document.querySelector('#main h1.name');
  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.race([Promise.all([document.fonts.load('780 100px "Switzer"'), document.fonts.load('700 40px "Switzer"')]).catch(() => {}), wait(2.5)]);
  }

  async function start() {
    if (!hero || !btn) { html.classList.remove('is-hello'); return; }
    state = 'hero';
    space.inert = true;
    windows.hideNow(all(parts()));
    if (glass()) { room.set({ defocus: 1, ink }); ink.on = 0; ink.white = 0; }
    listen();
    await fontsReady();
    if (state !== 'hero') return;
    hero.classList.add('is-ready');                                       // the CSS name and the hint come up
    if (!glass()) return;
    H = heroLayout();
    if (!H) return;
    draw(H, true);
    const frame = onFrame((dt) => {
      if (state !== 'hero') { frame(); return; }
      if (room.dpr !== drawnAt) draw(H, true);                              // a slow machine's room dropped to 1x
      const settled = glowS.step(dt);
      lightFor(H, 1);
      ink.on = shown;
      // the light never stops moving, so the room draws at full rate while the hero shows; on a machine that tripped
      // the room's budget (its clock stopped) and under reduced motion (one still), only while the light or the
      // arrival moves
      if (!settled || shown < 1 || !(reduced.matches || room.slow)) room.kick(.1);
    }, 1);
    if (reduced.matches) shown = 1;
    else tween(createSpring({ value: 0, response: .8, damping: 1 }), 1, v => { shown = clamp(v, 0, 1); });
  }

  function listen() {
    const onClick = () => enter();
    const onKey = (e) => {
      if (state !== 'hero' || e.key !== 'Enter' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.closest && e.target.closest('.hue')) return;          // the color control is not part of the hero
      e.preventDefault(); e.stopPropagation();
      flare(); enter();
    };
    const onSkip = (e) => { if (state === 'hero' && e.target.closest && e.target.closest('.skip')) { e.preventDefault(); enter(); } };
    const onEnterBtn = () => { glowS.target = 1.22; };
    const onLeaveBtn = () => { glowS.target = 1; };
    const onDown = () => flare();
    const onResize = () => { if (state === 'hero' && glass()) { H = heroLayout(); if (H) draw(H, true); } };
    btn.addEventListener('click', onClick);
    if (hint) hint.addEventListener('click', onClick);
    btn.addEventListener('pointerenter', onEnterBtn);
    btn.addEventListener('pointerleave', onLeaveBtn);
    btn.addEventListener('pointerdown', onDown);
    addEventListener('keydown', onKey, true);
    document.addEventListener('click', onSkip, true);
    addEventListener('resize', onResize);
    cleanup = () => {
      btn.removeEventListener('click', onClick);
      if (hint) hint.removeEventListener('click', onClick);
      btn.removeEventListener('pointerenter', onEnterBtn);
      btn.removeEventListener('pointerleave', onLeaveBtn);
      btn.removeEventListener('pointerdown', onDown);
      removeEventListener('keydown', onKey, true);
      document.removeEventListener('click', onSkip, true);
      removeEventListener('resize', onResize);
    };
  }
  // a press flares the light behind the letters briefly: a kick to a critically damped spring, which settles back
  function flare() { if (!reduced.matches && state === 'hero') glowS.velocity += 20; }

  // ---------- entering ----------
  async function enter() {
    if (state !== 'hero') return;
    state = 'entering';
    try { sessionStorage.setItem('v5:hello', '1'); } catch (e) { /* storage blocked: the hero plays again next time */ }
    const p = parts(), title = titleOf();
    html.classList.add('is-entering');
    html.classList.remove('is-hello');
    space.inert = false;
    if (title) title.style.opacity = '0';
    const h1 = p.main && p.main.querySelector('h1');
    if (h1) h1.focus({ preventScroll: true });
    if (!glass() || reduced.matches || !H || !title) return fade(p);

    // the room pulls focus (the background only)
    tween(createSpring({ value: 1, response: 1, damping: 1 }), 0, v => room.set({ defocus: Math.max(0, v) }));
    // the main window's glass forms under the gliding name; its contents wait until the name is nearly home
    const kids = [...p.main.children];
    kids.forEach(k => { k.style.opacity = '0'; });
    const arrivals = [windows.materialise([p.main], { delay: .04 })];
    let contentAt = null;
    const content = (t) => {
      const v = clamp((t - contentAt) / .24, 0, 1), e = 1 - Math.pow(1 - v, 3);
      kids.forEach(k => { k.style.opacity = e.toFixed(3); });
      return v >= 1;
    };

    // the glide: one critically damped spring from the hero to the title, read after the window has moved in each
    // frame, so the name and its slot never drift apart; it lands when less than a quarter pixel is left to travel
    const glide = createSpring({ value: 0, target: 1, response: .65, damping: 1 });
    let T = measure(title, ctx) || H, t = 0;
    await new Promise(resolve => {
      const off = onFrame((dt) => {
        t += dt;
        glide.step(dt); glowS.step(dt);
        T = measure(title, ctx) || T;
        const v = clamp(glide.value, 0, 1);
        const [a, b] = [centre(H), centre(T)];
        // the window's contents come in once the name is within about half a line of its slot, never under it
        if (contentAt == null && (1 - v) * Math.hypot(b[0] - a[0], b[1] - a[1]) < T.size * .6) {
          contentAt = t;
          arrivals.push(windows.materialise([p.side], { delay: .06, from: 'side' }),
            windows.materialise([p.tabs], { delay: .12, from: 'ornament' }),
            windows.materialise([p.bar, p.grab], { delay: .18, stagger: 0, from: 'ornament' }));
        }
        if (contentAt != null) content(t);
        const travel = Math.hypot(b[0] - a[0], b[1] - a[1]) + Math.abs(T.size - H.size) * 4;
        const glowLeft = Math.pow(1 - v, 2);
        ink.white = v;
        ink.on = shown;
        if ((1 - v) * travel < .25 && Math.abs(glide.velocity) * travel < 2) {
          off();
          draw(T, false);
          lightFor(T, 0);
          ink.white = 1;
          resolve();
          return;
        }
        const L = between(H, T, v);
        draw(L, glowLeft > .01);
        lightFor(L, glowLeft);
      }, 1);
    });
    if (contentAt == null) { contentAt = t; arrivals.push(windows.materialise([p.side, p.tabs, p.bar, p.grab].filter(Boolean))); }
    // The hand-off: the HTML title fades in over the identical white glyphs (150 ms), then the ink goes from under
    // it (100 ms). Two half-faded copies of one glyph would read paler than either, so the title comes in on top.
    await new Promise(resolve => {
      let u = 0;
      const off = onFrame((dt) => {
        t += dt; u += dt;
        const done = content(t);
        title.style.opacity = clamp(u / .15, 0, 1).toFixed(3);
        ink.on = 1 - clamp((u - .15) / .1, 0, 1);
        room.kick(.2);
        if (u >= .25 && done) { off(); resolve(); }
      }, 1);
    });
    finish(false);
    await Promise.all(arrivals);
  }

  // reduced motion, or no room: the hero fades out and the windows fade in (150 ms crossfades under reduced motion)
  async function fade(p) {
    if (room) room.set({ defocus: 0 });
    ink.on = 0;
    const title = titleOf();
    if (title) title.style.opacity = '';
    await windows.materialise(all(p), { stagger: reduced.matches ? 0 : .06 });
    finish(true);
  }

  // settle: snap every window into place (when the room was lost mid-way); otherwise each finishes its own arrival
  function finish(settle) {
    cleanup();
    state = 'done';
    ink.on = 0; ink.glow = 0;
    if (room) room.set({ ink: null, defocus: 0 });
    canvas.width = canvas.height = letters.width = letters.height = 1;     // the mask is not needed again
    const p = parts(), title = titleOf();
    if (title) title.style.opacity = '';
    if (p.main) [...p.main.children].forEach(k => { k.style.opacity = ''; });
    if (settle) all(p).forEach(el => windows.settle(el));
    html.classList.remove('is-hello', 'is-entering');
    hero.classList.remove('is-ready');
  }

  // if the room goes away: during the hero the CSS name takes over by itself; while entering, finish at once
  function abort() {
    if (state === 'entering') finish(true);
  }

  return { start, enter, abort, ink, get state() { return state; } };
}
