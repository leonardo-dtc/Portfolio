// The hello: "leonardo carvalho" written in liquid glass over the out-of-focus room, then Enter.
// The ink is a small mask canvas (red: the stroke, green: a soft height for the glass normals, blue: its
// shadow) that the room shader turns into glass. After Enter the same ink stays on as the home window's title.
import { nameLayout, STROKE } from './name.js';
import { createSpring, tween } from './springs.js';
import { onFrame } from './frame.js';

const PACE = { delay: .3, d1: 1.45, start2: .82, d2: 1.45 };   // overlapped: Enter is ready at about 2.4 s
const REPLAY = { delay: 0, d1: 1.2, start2: .66, d2: 1.2 };
const PAD = 14;                                                // the margin around the name in name.svg's viewBox
const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const total = p => Math.max(p.delay + p.d1, p.delay + p.start2 + p.d2);
const progress = (p, t, lens) => [ease((t - p.delay) / p.d1) * lens[0], ease((t - p.delay - p.start2) / p.d2) * lens[1]];
const now = () => performance.now() / 1000;

export function createHello({ room, windows }) {
  const html = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas'), g = canvas.getContext('2d');
  // on: how much shows; dim: a sheet in front; white: 0 is clear glass (the hello), 1 the white title; px: stroke on screen
  const ink = { on: 0, dim: 0, white: 0, px: STROKE, canvas, dirty: false, xform: [1, 0, 0] };
  room.set({ ink });

  // ---------- where the name goes: a layout maps name units to device px, screen = s * unit + t ----------
  const shapes = {};
  function shape(lines) {
    if (shapes[lines]) return shapes[lines];
    const L = nameLayout(lines), ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    document.body.append(svg);
    const lens = L.paths.map(d => { const p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); svg.append(p); return p.getTotalLength(); });
    svg.remove();
    return (shapes[lines] = { box: L.box, paths: L.paths.map(d => new Path2D(d)), lens });
  }
  function hero() {
    const dpr = room.dpr, W = innerWidth * dpr, H = innerHeight * dpr;
    const lines = innerWidth < 700 ? 2 : 1, b = shape(lines).box;
    const s = Math.min((lines === 1 ? .8 : .86) * W / (b.x1 - b.x0), (lines === 1 ? .3 : .5) * H / (b.y1 - b.y0));
    const cy = H * (lines === 1 ? (innerHeight < 560 ? .38 : .45) : .42);
    return { lines, s, tx: W / 2 - (b.x0 + b.x1) / 2 * s, ty: cy - (b.y0 + b.y1) / 2 * s };
  }
  // the title sits exactly where the (hidden) name.svg image is laid out in the window header
  function title() {
    const img = document.querySelector('#main h1.name .name__svg');
    const r = img && img.getBoundingClientRect();
    if (!r || r.width < 4) return null;
    const lines = /name-2\.svg/.test(img.currentSrc || '') ? 2 : 1;       // the phone title is the two-line name
    const dpr = room.dpr, b = shape(lines).box, s = r.width * dpr / (b.x1 - b.x0 + 2 * PAD);
    return { lines, s, tx: r.left * dpr - (b.x0 - PAD) * s, ty: r.top * dpr - (b.y0 - PAD) * s };
  }
  // part way from a to b: scale in log space, the centre in a straight line
  function between(a, b, v) {
    const bx = shape(a.lines).box, cu = (bx.x0 + bx.x1) / 2, cv = (bx.y0 + bx.y1) / 2;
    const s = Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * v);
    const cx = a.tx + cu * a.s + (b.tx + cu * b.s - a.tx - cu * a.s) * v;
    const cy = a.ty + cv * a.s + (b.ty + cv * b.s - a.ty - cv * a.s) * v;
    return { lines: a.lines, s, tx: cx - cu * s, ty: cy - cv * s };
  }

  // ---------- the mask ----------
  // Blurs use the shadow of a stroke drawn off the canvas, which every browser's 2D canvas supports.
  let drawn = null;
  function draw(L, prog) {
    const sh = shape(L.lines), b = sh.box, px = STROKE * L.s, m = Math.ceil(px * 1.6 + 6);
    const ox = Math.floor(b.x0 * L.s + L.tx - m), oy = Math.floor(b.y0 * L.s + L.ty - m);
    const cw = Math.ceil((b.x1 - b.x0) * L.s) + 2 * m, ch = Math.ceil((b.y1 - b.y0) * L.s + px * .6) + 2 * m;
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-over'; g.shadowColor = 'transparent'; g.setLineDash([]);
    g.fillStyle = '#000'; g.fillRect(0, 0, cw, ch);
    g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = STROKE;
    const away = cw + 2 * m + 64;
    for (const [colour, blur, drop] of [['#f00', 0, 0], ['#0f0', px * .26, 0], ['#00f', px * .55, px * .42]]) {
      g.strokeStyle = colour;
      if (blur) { g.shadowColor = colour; g.shadowBlur = blur * 2; g.shadowOffsetX = away; g.shadowOffsetY = drop; }
      else { g.shadowColor = 'transparent'; }
      g.setTransform(L.s, 0, 0, L.s, L.tx - ox - (blur ? away : 0), L.ty - oy);
      sh.paths.forEach((p, i) => {
        const q = prog ? prog[i] : sh.lens[i];
        if (q <= .5) return;
        g.setLineDash(q >= sh.lens[i] - .5 ? [] : [q, 1e6]);
        g.stroke(p);
      });
    }
    g.shadowColor = 'transparent'; g.setLineDash([]);
    drawn = { ...L, ox, oy };
    ink.dirty = true;
    place(L);
  }
  // show the mask drawn for one layout at another, without redrawing it (the shader maps device px to mask px)
  function place(L) {
    const k = drawn.s / L.s;
    ink.xform = [k, drawn.tx - drawn.ox - k * L.tx, drawn.ty - drawn.oy - k * L.ty];
    ink.px = STROKE * L.s;
    room.kick(.3);
  }

  // ---------- the hello ----------
  const btn = document.querySelector('.hello .enter');
  const space = document.querySelector('[data-space]');
  const parts = () => ({
    main: document.getElementById('main'),
    sides: [...document.querySelectorAll('aside.side:not(.side--inline)')],
    tabs: document.querySelector('nav.tabs'),
    bar: document.querySelector('.toolbar:not(.toolbar--sheet)'),
    grab: document.querySelector('.grab'),
  });
  const all = p => [p.main, ...p.sides, p.tabs, p.bar, p.grab];
  let state = 'idle', skip = false, cleanup = () => {};

  // the Enter button sits a set distance under the written name, whatever the screen's shape
  function placeEnter(L) {
    const b = shape(L.lines).box, bottom = (b.y1 * L.s + L.ty) / room.dpr;
    btn.style.top = `${Math.round(Math.min(bottom + 40, innerHeight - 76))}px`;
  }

  function start() {
    state = 'writing';
    space.inert = true;
    windows.hideNow(all(parts()));
    room.set({ defocus: 1 });
    ink.on = 1; ink.white = 0;
    skip = reduced.matches;
    let L = hero(), finished = false;
    placeEnter(L);
    const t0 = now();
    const off = onFrame(() => {
      if (state !== 'writing' && state !== 'ready') { off(); return; }
      const t = skip ? 99 : now() - t0;
      draw(L, progress(PACE, t, shape(L.lines).lens));
      if (t >= total(PACE) - .15) ready();
      if (t >= total(PACE)) { finished = true; off(); }
    });
    const onResize = () => { L = hero(); placeEnter(L); if (finished && state === 'ready') draw(L, null); };

    // While it writes, a click or a key finishes the name. Once it is written, Return, the button, or a
    // scroll or swipe down enters. These listen first (capture) so the hidden window never scrolls meanwhile.
    const hold = e => { if (state === 'writing' || state === 'ready' || state === 'entering') e.stopPropagation(); };
    const mine = e => e.target.closest && e.target.closest('.hue');     // the color control is not part of the hello
    const onDown = e => { if (state === 'writing' && !mine(e) && !(e.target.closest && e.target.closest('.enter'))) skip = true; };
    const onKey = e => {
      if (mine(e) || e.metaKey || e.ctrlKey || e.altKey || ['Tab', 'Shift', 'Meta', 'Alt', 'Control', 'CapsLock'].includes(e.key)) return;
      hold(e);
      if (state === 'writing') { skip = true; if (e.key === ' ' || e.key === 'Enter') e.preventDefault(); return; }
      if (state === 'ready' && ['Enter', ' ', 'ArrowDown', 'PageDown'].includes(e.key) && document.activeElement !== btn) { e.preventDefault(); enter(); }
    };
    const onWheel = e => { hold(e); if (state === 'writing') skip = true; else if (state === 'ready' && e.deltaY > 24) enter(); };
    let y0 = null;
    const onTouchStart = e => { y0 = e.touches[0].clientY; };
    const onTouchMove = e => {
      if (y0 == null || y0 - e.touches[0].clientY < 40) return;
      y0 = null;
      if (state === 'writing') skip = true; else if (state === 'ready') enter();
    };
    const on = [['pointerdown', onDown, { capture: true }], ['keydown', onKey, { capture: true }], ['wheel', onWheel, { capture: true, passive: true }],
      ['touchstart', onTouchStart, { passive: true }], ['touchmove', onTouchMove, { passive: true }], ['resize', onResize]];
    on.forEach(([type, fn, o]) => addEventListener(type, fn, o));
    btn.addEventListener('click', enter);
    cleanup = () => { on.forEach(([type, fn, o]) => removeEventListener(type, fn, o)); btn.removeEventListener('click', enter); };
  }

  const btnGlass = createSpring({ value: 0, response: .5, damping: .8 });
  function ready() {
    if (state !== 'writing') return;
    state = 'ready';
    btn.glass = { m: 0, dim: 0 };
    btn.hidden = false;
    requestAnimationFrame(() => btn.classList.add('is-ready'));
    if (reduced.matches) { btnGlass.snap(1); btn.glass.m = 1; room.kick(.3); }
    else tween(btnGlass, 1, v => { btn.glass.m = Math.min(1, Math.max(0, v)); });
  }

  async function enter() {
    if (state !== 'ready') return;
    state = 'entering';
    try { sessionStorage.setItem('v5:hello', '1'); } catch (e) { /* storage blocked: the hello plays again next time */ }
    const p = parts(), from = hero();
    draw(from, null);                                          // the last few letters, if Enter came early
    html.classList.add('is-entering');
    html.classList.remove('is-hello');
    btn.classList.remove('is-ready'); btn.classList.add('is-gone');
    tween(btnGlass, 0, v => { btn.glass.m = Math.max(0, v); }).then(() => { btn.hidden = true; html.classList.remove('is-entering'); });
    space.inert = false;
    const h1 = p.main.querySelector('h1');
    if (h1) h1.focus({ preventScroll: true });

    if (reduced.matches) {
      room.set({ defocus: 0 });
      ink.on = 0;
      await windows.materialise(all(p));
      return done(false);
    }
    const focus = createSpring({ value: 1, response: 1.1, damping: 1 });
    tween(focus, 0, v => room.set({ defocus: Math.max(0, v) }));
    windows.materialise([p.main], { delay: .18 });
    windows.materialise(p.sides, { delay: .34, stagger: .06, from: 'side' });
    windows.materialise([p.tabs], { delay: .55, from: 'ornament' });
    windows.materialise([p.bar], { delay: .62, from: 'ornament' });
    windows.materialise([p.grab], { delay: .7, from: 'ornament' });
    const slot = title();
    if (!slot || slot.lines === from.lines) {
      // the name flies into the title slot, following it as the window arrives
      const fly = createSpring({ value: 0, response: .8, damping: .92 });
      await tween(fly, 1, v => { ink.white = Math.min(1, Math.max(0, v)); const to = title(); if (to && to.lines === from.lines) place(between(from, to, Math.min(1, v))); });
      done(true);
    } else {
      // the hello and the title only differ in shape between 700px windows and phone titles: fade across
      const fade = createSpring({ value: 1, response: .35, damping: 1 });
      await tween(fade, 0, v => { ink.on = Math.max(0, v); });
      done(false);
    }
  }
  function done(inPlace) { cleanup(); showTitle(inPlace); }

  // ---------- the title ----------
  const shown = createSpring({ value: 0, response: .45, damping: 1 });
  let tracking = null;
  function showTitle(already = true) {
    state = 'glass';
    ink.white = 1;
    const T = title();
    if (T) draw(T, null);
    shown.snap(already ? 1 : 0); ink.on = shown.value;
    if (tracking) return;
    tracking = onFrame(dt => {
      if (state !== 'glass') return;
      const T2 = title(), main = document.getElementById('main');
      if (!T2) { shown.snap(0); ink.on = 0; return; }              // the title left with its page
      shown.target = 1;
      shown.step(dt);
      // the ink fades with its header, so page swaps and a sheet stepping in front take the title with them
      const head = document.querySelector('#main h1.name').closest('.win__head');
      const seen = head ? +getComputedStyle(head).opacity : 1;
      ink.on = Math.min(1, Math.max(0, shown.value)) * seen;
      ink.dim = main && main.glass ? main.glass.dim || 0 : 0;
      if (!drawn || T2.lines !== drawn.lines || Math.abs(T2.s - drawn.s) / drawn.s > .04) draw(T2, null);
      else place(T2);
    });
  }

  // pressing the name writes it again, in place
  function replay() {
    if (state !== 'glass' || !title()) return;
    state = 'replay';
    const t0 = now();
    const off = onFrame(() => {
      const T = title();
      const lens = T ? shape(T.lines).lens : [0, 0];
      if (!T) { off(); state = 'glass'; return; }
      const t = reduced.matches ? 99 : now() - t0;
      draw(T, progress(REPLAY, t, lens));
      if (t >= total(REPLAY)) { off(); state = 'glass'; }
    });
  }
  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#main h1.name')) replay(); });

  // if the room goes away mid-hello, drop straight into the windows
  function abort() {
    cleanup();
    html.classList.remove('is-hello', 'is-entering');
    space.inert = false;
    all(parts()).filter(Boolean).forEach(el => windows.settle(el));
    state = 'glass';
  }

  return { start, showTitle, replay, abort, ink, get state() { return state; } };
}
