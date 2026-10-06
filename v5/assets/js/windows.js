// The windows in the room: layout modes, the side window turned toward you, the tab bar and its bubble, sheets in
// front of a stepped-back parent, the window bar's spring drag, the hover light, and scroll forwarding. Windows stay
// where they are: the pointer moves the light and leans the room behind them, never the windows themselves.
// Every motion is a spring stepped in the shared frame loop, so the glass never lags its window.
import { createSpring, tween } from './springs.js';
import { onFrame } from './frame.js';

const wait = (s) => new Promise(r => setTimeout(r, s * 1000));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function createWindows({ room }) {
  const html = document.documentElement;
  const space = document.querySelector('[data-space]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const qDesk = matchMedia('(min-width: 1360px)'), qPhone = matchMedia('(max-width: 899px)'), qShort = matchMedia('(max-height: 520px)');
  const $main = () => document.getElementById('main');
  const $sheet = () => document.querySelector('section.sheet:not(.is-closing)');
  const $front = () => $sheet() || $main();
  let mode = '';

  // ---------- layout modes ----------
  const printing = matchMedia('print');
  function layout() {
    if (printing.matches) return;                        // paper is narrower than any screen mode; keep the screen's layout
    mode = qDesk.matches ? 'desktop' : qPhone.matches ? 'phone' : 'laptop';
    html.dataset.mode = mode;
    // the tab bar lies over the window's text when it opens (and over scrolling content on phones),
    // which only CSS backdrop glass can frost
    const bar = tabs(); if (bar) bar.setAttribute('data-glass-off', '');
    const main = $main();
    if (!main) return;
    const body = main.querySelector('.win__body');
    const asides = [...document.querySelectorAll('aside.side')].sort((a, b) => (a.dataset.side === 'left' ? -1 : 1));
    if (mode === 'desktop') {
      asides.forEach(a => { a.classList.remove('side--inline'); gather(a); });
      const out = asides.filter(a => a.parentElement !== space);
      if (out.length) main.after(...asides);
    } else if (body) {
      asides.forEach(a => { a.classList.add('side--inline'); a.style.transform = ''; inline(a, main, body); });
    }
    // a row pinned between the head and the body takes a grid row of its own (a class, not :has(), for older browsers)
    main.classList.toggle('has-pin', !!main.querySelector(':scope > .side__part--pin'));
    // crossing 1360px with a sheet open: a side window that comes out to float steps back with the parent, and one
    // that goes inside the main window leaves the step back to it (so closing the sheet finds nothing left behind)
    const open = !!$sheet();
    asides.forEach(a => {
      const away = open && !a.classList.contains('side--inline');
      a.inert = away;
      a.classList.toggle('is-behind', away);
      if (away) { a.glass = a.glass || { m: 1, dim: 0 }; a.glass.dim = back.value; a.style.setProperty('--back', back.value.toFixed(4)); }
      else { if (a.glass) a.glass.dim = 0; a.style.removeProperty('--back'); }
    });
    placeBubble(true);
    scrollable();
  }
  // Below 1360px the side window's content sits inside the main window, placed by its role. data-inline on the
  // aside gives one place for all of it, or one per part, in order: "start" before the main content (Hockey's
  // Measurables and coach contacts, About's portrait), "end" after it (Home's This fall, Work's In progress), "pin"
  // a row of chips pinned between the window's head and its body (the Résumé's Sections); in a window under 520px
  // tall that row leads the body instead and scrolls away with it. The aside goes where its first start or end part
  // goes; a part placed elsewhere is lifted out of it, and goes home at 1360px and wider.
  const liftedOf = a => [...document.querySelectorAll('.side__part--lifted')].filter(p => p._home && p._home.aside === a);
  function partsOf(a) {                                   // every part, in the aside or lifted out of it, in order
    const inside = [...a.querySelectorAll(':scope > .side__part')];
    inside.forEach((p, i) => { if (!p._home) p._home = { aside: a, index: i }; });
    return [...inside, ...liftedOf(a)].sort((x, y) => x._home.index - y._home.index);
  }
  function putBack(p) {
    const a = p._home.aside;
    p.classList.remove('side__part--lifted', 'side__part--pin');
    a.insertBefore(p, a.querySelectorAll(':scope > .side__part')[p._home.index] || null);
  }
  // the end of a window's body is before its actions (the inline toolbar at its foot), so they stay last
  const atEnd = (body, el) => { const foot = body.lastElementChild; if (foot && foot !== el && foot.matches('.toolbar--inline')) foot.before(el); else body.append(el); };
  function inline(a, main, body) {
    const words = (a.dataset.inline || 'end').split(/\s+/);
    const places = partsOf(a).map(p => [p, words[Math.min(p._home.index, words.length - 1)]]);
    const own = (places.find(([, w]) => w !== 'pin') || [null, words.find(w => w !== 'pin') || 'end'])[1];
    if (own === 'start') { if (a.parentElement !== body) body.prepend(a); }
    else if (a.parentElement !== body) atEnd(body, a);
    for (const [p, w] of places) {
      if (w === own) { if (p.parentElement !== a) putBack(p); continue; }
      p.classList.add('side__part--lifted');
      p.classList.toggle('side__part--pin', w === 'pin');
      if (w === 'pin') {
        if (qShort.matches) { if (p.parentElement !== body) body.prepend(p); }
        else if (p.parentElement !== main) body.before(p);
      }
      else if (p.parentElement !== body) { if (w === 'start') body.prepend(p); else atEnd(body, p); }
    }
  }
  function gather(a) { liftedOf(a).sort((x, y) => x._home.index - y._home.index).forEach(putBack); }
  // A floating side window taller than its room scrolls; it becomes a tab stop then, so the keyboard can scroll it
  // in every browser (some make scrollers focusable on their own, some do not).
  function scrollable() {
    for (const a of document.querySelectorAll('aside.side')) {
      const over = !a.classList.contains('side--inline') && a.scrollHeight > a.clientHeight + 4;
      if (over && !a.hasAttribute('tabindex')) a.tabIndex = 0;
      else if (!over && a.getAttribute('tabindex') === '0') a.removeAttribute('tabindex');
    }
  }
  qDesk.addEventListener('change', layout); qPhone.addEventListener('change', layout); qShort.addEventListener('change', layout);
  let sized = 0;
  addEventListener('resize', () => { placeBubble(true); cancelAnimationFrame(sized); sized = requestAnimationFrame(scrollable); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scrollable);

  // ---------- pointer: the light, and the room's lean (desktop) ----------
  // The windows never follow the pointer (visionOS keeps windows fixed in space); the light does, and the room
  // behind them leans a little against it. Reduced motion keeps the room still too.
  const px = createSpring({ value: 0, response: .9, damping: 1 }), py = createSpring({ value: 0, response: .9, damping: 1 });
  let lightX = innerWidth * .35, lightY = -120, moving = false;
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    px.target = e.clientX / innerWidth - .5; py.target = e.clientY / innerHeight - .5;
    lightX = e.clientX; lightY = e.clientY; moving = true;
  }, { passive: true });
  // the pointer leaving the page lets the room settle back (pointerleave does not bubble, so it is heard on <html>)
  document.documentElement.addEventListener('pointerleave', () => { px.target = 0; py.target = 0; moving = true; });
  const lx = createSpring({ value: lightX, response: .6, damping: 1 }), ly = createSpring({ value: lightY, response: .6, damping: 1 });
  onFrame((dt) => {
    if (!moving && Math.abs(px.value - px.target) < 1e-4 && Math.abs(py.value - py.target) < 1e-4 && Math.abs(lx.value - lx.target) < .05 && Math.abs(ly.value - ly.target) < .05) return;
    moving = false;
    px.step(dt); py.step(dt);
    lx.target = lightX; ly.target = lightY; lx.step(dt); ly.step(dt);
    const still = reduced.matches || mode !== 'desktop';
    const x = still ? 0 : px.value, y = still ? 0 : py.value;
    if (room) room.set({ shift: [x * .012, -y * .008], light: [lx.value, ly.value] });
  });

  // ---------- the tab bar ----------
  const tabs = () => document.querySelector('nav.tabs');
  let openT = 0, closeT = 0;
  document.addEventListener('pointerenter', (e) => {
    const t = e.target instanceof Element && e.target.closest('nav.tabs');
    if (!t || mode === 'phone') return;
    clearTimeout(closeT); openT = setTimeout(() => t.classList.add('is-open'), 120);
  }, true);
  document.addEventListener('pointerleave', (e) => {
    const t = e.target instanceof Element && e.target.matches('nav.tabs') && e.target;
    if (!t) return;
    clearTimeout(openT); closeT = setTimeout(() => t.classList.remove('is-open'), 300);
  }, true);
  document.addEventListener('focusin', (e) => { const t = e.target.closest && e.target.closest('nav.tabs'); if (t && mode !== 'phone') t.classList.add('is-open'); });
  document.addEventListener('focusout', (e) => { const t = e.target.closest && e.target.closest('nav.tabs'); if (t && !t.contains(e.relatedTarget)) t.classList.remove('is-open'); });

  const bY = createSpring({ value: 0, response: .45, damping: .8 }), bX = createSpring({ value: 0, response: .45, damping: .8 });
  let bubbleOff = null;
  function placeBubble(instant) {
    const nav = tabs(); if (!nav) return;
    const bubble = nav.querySelector('.tabs__bubble'), cur = nav.querySelector('a[aria-current="page"]');
    if (!bubble) return;
    if (!cur) { bubble.style.opacity = '0'; return; }
    bubble.style.opacity = '';
    const horizontal = mode === 'phone';
    const tx = cur.offsetLeft, ty = cur.offsetTop;
    bubble.style.width = horizontal ? cur.offsetWidth + 'px' : '';
    bubble.style.height = horizontal ? '' : cur.offsetHeight + 'px';
    bubble.style.left = horizontal ? '0px' : ''; bubble.style.top = horizontal ? '' : '0px';
    bX.target = horizontal ? tx : 0; bY.target = horizontal ? 0 : ty;
    if (instant || reduced.matches) { bX.snap(); bY.snap(); }
    if (bubbleOff) return;
    bubbleOff = onFrame((dt) => {
      const a = bX.step(dt), b = bY.step(dt);
      const v = horizontal ? bX.velocity : bY.velocity;
      const stretch = clamp(Math.abs(v) / 3000, 0, .3);            // Liquid Glass stretches while it travels
      bubble.style.transform = `translate(${bX.value}px, ${bY.value}px) scale(${horizontal ? 1 + stretch : 1 - stretch * .25}, ${horizontal ? 1 - stretch * .25 : 1 + stretch})`;
      if (a && b) { bubbleOff(); bubbleOff = null; }
    });
  }
  function setTab(key) {
    const nav = tabs(); if (!nav) return;
    nav.querySelectorAll('a[data-tab]').forEach(a => { if (a.dataset.tab === key) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    placeBubble(false);
  }

  // ---------- materialise ----------
  // Short moves that settle without overshoot, since every one of these carries text: a window grows from 98.5%
  // (8px at most at its corners), the side window turns from 32 degrees to its 24, an ornament grows from 96%.
  function frameOf(el, v, from) {
    if (from === 'side') {
      const sgn = el.dataset.side === 'left' ? 1 : -1;
      return `rotateY(${(sgn * (24 + (1 - v) * 8)).toFixed(3)}deg)`;
    }
    if (from === 'ornament') return `translateZ(1px) scale(${(.96 + .04 * v).toFixed(4)})`;
    return `scale(${(.985 + .015 * v).toFixed(4)})`;
  }
  function kindOf(el) { return el.matches('aside.side') ? (el.classList.contains('side--inline') ? 'inline' : 'side') : el.matches('.tabs, .toolbar, .grab') ? 'ornament' : 'window'; }
  // A sheet and its toolbar show only over the part of their move where the parent's are gone (the parent's text is
  // out by a quarter of the way back, its toolbar by two fifths), so opening or closing, two texts or two toolbars
  // never show at once; a page's toolbar leaving for the next page's is gone within its first 0.2s (the next one
  // starts at 0.26s, nav.js swapBar); everything else fades over the first 70% of its move.
  const lead = el => el.matches('section.sheet') ? .25 : el.matches('.toolbar--sheet') ? .4 : el.matches('.toolbar.is-leaving') ? .3 : 0;
  function setIn(el, v, from) {
    el.glass = el.glass || { m: 0, dim: 0 };
    const lo = lead(el), o = clamp((v - lo) * 1.4 / (1 - lo), 0, 1);
    el.glass.m = el.matches('.toolbar--sheet') ? o : clamp(v, 0, 1);   // the toolbar's glass too: one capsule at a time
    el.style.opacity = o.toFixed(3);
    if (from !== 'inline') el.style.transform = frameOf(el, v, from);
  }
  function settle(el) { el.style.opacity = ''; el.style.transform = ''; if (el.glass) el.glass.m = 1; if (el._spring) el._spring.snap(1); }
  async function animate(el, to, delay, from) {
    from = from || kindOf(el);
    if (reduced.matches) {
      el.style.transition = 'opacity .15s'; setIn(el, to, 'inline');
      if (to === 1) { await wait(.15); settle(el); el.style.transition = ''; }
      return;
    }
    // an element that has never moved is fully in (it came with the page), so it leaves from 1, not from nothing
    const s = el._spring || (el._spring = createSpring({ value: el.glass ? el.glass.m : 1, response: from === 'side' ? .55 : from === 'ornament' ? .45 : .5, damping: 1 }));
    if (delay) await wait(delay);
    const arrived = await tween(s, to, v => setIn(el, v, from));
    if (to === 1 && arrived) settle(el);                     // not when a newer move took over (it would flash in)
  }
  function materialise(els, { stagger = .08, delay = 0, from } = {}) {
    return Promise.all(els.filter(Boolean).map((el, i) => animate(el, 1, delay + i * stagger, from)));
  }
  function dematerialise(els, { stagger = 0, from } = {}) {
    return Promise.all(els.filter(Boolean).map((el, i) => animate(el, 0, i * stagger, from)));
  }
  function hideNow(els) { els.filter(Boolean).forEach(el => { el.glass = { m: 0, dim: 0 }; el.style.opacity = '0'; if (el._spring) el._spring.snap(0); }); }

  // ---------- sheets ----------
  // The parent steps back and dims under one shared spring, so a sheet opening while another closes never fights it.
  const behind = () => [$main(), ...document.querySelectorAll('aside.side:not(.side--inline)'), tabs(), document.querySelector('.toolbar:not(.toolbar--sheet):not(.is-leaving)'), document.querySelector('.grab')].filter(Boolean);
  const back = createSpring({ value: 0, response: .5, damping: 1 });
  // the room's glass cannot frost the page itself, so the parent's contents fade as it recedes and its toolbar
  // and window bar step away with it; the tab bar and side windows stay, dimmed
  const setBack = v => behind().forEach(el => {
    el.glass = el.glass || { m: 1, dim: 0 };
    el.glass.dim = v;
    if (el.matches('.toolbar, .grab')) el.glass.m = Math.max(0, 1 - v * 2.5);
    el.style.setProperty('--back', v.toFixed(4));
  });
  async function dimParent(to) {
    behind().forEach(el => { el.inert = to > 0; if (to > 0) el.classList.add('is-behind'); });
    if (reduced.matches) { back.snap(to); setBack(to); return; }
    await tween(back, to, setBack);
  }
  const barOf = () => [...document.querySelectorAll('.toolbar--sheet:not(.is-closing)')].pop();
  async function openSheet(sheet, { instant = false } = {}) {
    space.append(sheet);
    const bar = barOf();
    if (bar) sheet.after(bar);                             // its pager comes after it in the tab order, as on screen
    hideNow([sheet, bar]);
    if (instant) {
      behind().forEach(el => { el.inert = true; el.classList.add('is-behind'); });
      back.snap(1); setBack(1); settle(sheet); if (bar) settle(bar);
      return;
    }
    await Promise.all([dimParent(1), materialise([sheet, bar], { stagger: .1, delay: .04 })]);
  }
  async function closeSheet() {
    const sheet = $sheet(); if (!sheet) return;
    const bar = barOf();
    [sheet, bar].filter(Boolean).forEach(el => { el.classList.add('is-closing'); el.inert = true; });
    await Promise.all([dematerialise([bar, sheet]), dimParent(0)]);
    sheet.remove(); if (bar) bar.remove();
    if ($sheet()) return;                                  // another sheet opened meanwhile: the parent stays back
    setBack(0);
    behind().forEach(el => { el.inert = false; el.classList.remove('is-behind'); el.style.removeProperty('--back'); });
  }

  // ---------- the window bar: drag, then spring home ----------
  const dx = createSpring({ value: 0, response: .5, damping: .7 }), dy = createSpring({ value: 0, response: .5, damping: .7 });
  let drag = null;
  const rubber = d => d * 40 / (40 + Math.abs(d));
  document.addEventListener('pointerdown', (e) => {
    const g = e.target.closest && e.target.closest('.grab'); if (!g || reduced.matches) return;
    drag = { x: e.clientX, y: e.clientY }; g.setPointerCapture(e.pointerId);
  });
  document.addEventListener('pointermove', (e) => { if (!drag) return; dx.snap(rubber(e.clientX - drag.x)); dy.snap(rubber(e.clientY - drag.y)); applyDrag(); });
  const letGo = () => { if (!drag) return; drag = null; tween(dx, 0, applyDrag); tween(dy, 0, applyDrag); };
  document.addEventListener('pointerup', letGo);
  document.addEventListener('pointercancel', letGo);
  function applyDrag() { space.style.setProperty('--dx', dx.value.toFixed(2) + 'px'); space.style.setProperty('--dy', dy.value.toFixed(2) + 'px'); }

  // ---------- press: a control's glass lights up from under the pointer, then settles ----------
  const pressSpring = createSpring({ value: 0, response: .3, damping: 1 });
  let pressed = null;
  document.addEventListener('pointerdown', (e) => {
    const g = e.target.closest && e.target.closest('[data-glass]:not([data-glass="window"])');
    if (!g || reduced.matches || !room) return;
    if (pressed && pressed !== g && pressed.glass) pressed.glass.press = 0;
    pressed = g; g.glass = g.glass || { m: 1, dim: 0 };
    room.set({ pointer: [e.clientX, e.clientY] });
    tween(pressSpring, 1, v => { if (pressed) pressed.glass.press = v; });
  });
  const release = () => {
    const el = pressed; if (!el) return;
    tween(pressSpring, 0, v => { if (el.glass) el.glass.press = v; }).then(() => { if (pressed === el) pressed = null; });
  };
  document.addEventListener('pointerup', release);
  document.addEventListener('pointercancel', release);
  document.addEventListener('pointermove', (e) => { if (pressed && room) room.set({ pointer: [e.clientX, e.clientY] }); }, { passive: true });

  // ---------- hover light ----------
  document.addEventListener('pointermove', (e) => {
    const el = e.target.closest && e.target.closest('[data-hover]'); if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--hx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    el.style.setProperty('--hy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  }, { passive: true });

  // ---------- scrolling from anywhere reaches the front window ----------
  const scroller = () => $front() && $front().querySelector('.win__body');
  const inHero = () => html.classList.contains('is-hello');            // the windows are hidden behind the hero
  addEventListener('wheel', (e) => {
    // over the Résumé's pinned row of chips, which only scrolls sideways, a vertical wheel still scrolls the record
    // (in a short window the row is inside the record, which the wheel scrolls on its own)
    if (!inHero() && e.target.closest && e.target.closest('#main > .side__part--pin') && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const b = scroller(); if (b) b.scrollBy({ top: e.deltaY, left: 0 });
      return;
    }
    if (inHero() || (e.target.closest && e.target.closest('.win, .side, .sheet, .tabs, .toolbar'))) return;
    const b = scroller(); if (b) b.scrollBy({ top: e.deltaY, left: 0 });
  }, { passive: true });
  addEventListener('keydown', (e) => {
    if (inHero() || e.altKey || e.ctrlKey || e.metaKey) return;
    // from nowhere in particular, or from the front window's title, where a page change leaves the focus: it sits in
    // the window's head, above the part that scrolls, so the keys would otherwise scroll nothing
    const a = document.activeElement, front = $front();
    const fromTitle = !!(a && front && a.matches('h1') && front.contains(a) && !a.closest('.win__body'));
    if (a !== document.body && !fromTitle) return;
    const b = scroller(); if (!b) return;
    const page = b.clientHeight * .85;
    const by = { ArrowDown: 60, ArrowUp: -60, PageDown: page, PageUp: -page, ' ': e.shiftKey ? -page : page, Home: -1e6, End: 1e6 }[e.key];
    if (by === undefined) return;
    e.preventDefault(); b.focus({ preventScroll: true }); b.scrollBy({ top: by, behavior: reduced.matches ? 'auto' : 'smooth' });
  });

  layout();
  return {
    get mode() { return mode; },
    materialise, dematerialise, hideNow, settle, openSheet, closeSheet, setTab,
    refresh() { layout(); },
    front: $front,
  };
}
