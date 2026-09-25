/* v3 poster · one small script. Everything is progressive: the page reads
   fully without it. It does four things: clip-reveals headlines once per
   slide, runs the cover's load sequence after the display face arrives,
   drives the desktop sheet-stacking (the covered sheet recedes as the next
   one slides over it) and keeps the dot rail and keyboard in step. All
   movement stops under prefers-reduced-motion. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stackMQ = window.matchMedia('(min-width: 900px) and (min-height: 600px)');
  var deck = d.querySelector('.deck');
  var slides = Array.prototype.slice.call(d.querySelectorAll('.deck > .slide'));
  var dims = slides.map(function (s) { return s.querySelector('.slide__dim'); });
  var dots = Array.prototype.slice.call(d.querySelectorAll('.rail a'));
  var cover = d.querySelector('.cover');
  if (!deck || !slides.length) return;

  /* ---- 1. wrap headlines so they can rise out of a clipped line box ---- */
  d.querySelectorAll('.hl').forEach(function (el) {
    var span = d.createElement('span'); span.className = 'hl__in';
    while (el.firstChild) span.appendChild(el.firstChild);
    el.appendChild(span);
  });

  /* ---- 2. reveals replay every time a sheet comes back ----
     Phones: an observer adds the class at 30% and removes it once the sheet is
     fully out. Desktop stacking: a covered sheet still intersects the viewport,
     so update() decides from the scroll geometry instead. */
  var started = false;
  if ('IntersectionObserver' in window && !stackMQ.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.target === cover && !started) return;
        if (e.intersectionRatio >= 0.3) e.target.classList.add('is-in');
        else if (e.intersectionRatio === 0) e.target.classList.remove('is-in');
      });
    }, { threshold: [0, 0.3] });
    slides.forEach(function (s) { io.observe(s); });
  } else if (!('IntersectionObserver' in window)) {
    slides.forEach(function (s) { s.classList.add('is-in'); });
  }

  /* cover: start once the display face is in, but never wait past 500 ms */
  function startCover() {
    if (started || !cover) return; started = true;
    requestAnimationFrame(function () { cover.classList.add('is-in'); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(startCover);
  setTimeout(startCover, 500);

  /* ---- 3. geometry: normal-flow tops, and which sheets are too tall to stick ---- */
  var tops = [], vh = window.innerHeight, current = 0;
  function measure() {
    vh = window.innerHeight;
    slides.forEach(function (s, i) {
      s.classList.remove('is-tall'); s.style.transform = '';
      if (dims[i]) dims[i].style.opacity = '';
    });
    if (stackMQ.matches) {
      /* flow height, not scrollHeight: unrevealed text is still translated
         down and would count as overflow */
      slides.forEach(function (s) { s.classList.add('is-tall'); });
      var fits = slides.map(function (s) { return s.offsetHeight <= vh + 2; });
      slides.forEach(function (s, i) { if (fits[i]) s.classList.remove('is-tall'); });
    }
    var y = deck.offsetTop;
    tops = slides.map(function (s) { var t = y; y += s.offsetHeight; return t; });
    update();
  }

  /* ---- 4. the covered sheet recedes: transform and opacity only ---- */
  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var y = window.pageYOffset || html.scrollTop;
    /* current slide: the last one whose flow top has passed the middle of the viewport */
    var cur = 0;
    for (var i = 0; i < slides.length; i++) { if (tops[i] <= y + vh * 0.5) cur = i; }
    if (cur !== current) setCurrent(cur);
    if (!stackMQ.matches) return;
    for (var j = 0; j < slides.length; j++) {
      var s = slides[j];
      /* q: how far this sheet has risen into place; p: how far the next one covers it */
      var q = j === 0 ? 1 : (y - (tops[j] - vh)) / vh; q = q < 0 ? 0 : q > 1 ? 1 : q;
      var p = j < slides.length - 1 ? (y - (tops[j + 1] - vh)) / vh : 0; p = p < 0 ? 0 : p > 1 ? 1 : p;
      if (j > 0 || started) {
        if (q >= 0.3 && p <= 0.62) s.classList.add('is-in');
        else if (q < 0.1 || p > 0.88) s.classList.remove('is-in');
      }
      if (reduce || s.classList.contains('is-tall')) continue;
      s.style.transform = p > 0 ? 'scale(' + (1 - 0.05 * p).toFixed(4) + ')' : '';
      if (dims[j]) dims[j].style.opacity = p > 0 ? (0.45 * p).toFixed(3) : '';
      /* stickers and tape settle a beat after their sheet slides in; `translate`
         composes with their rotate/scale transforms */
      var lag = j > 0 && q > 0 && q < 1 ? ((1 - q) * 28).toFixed(1) + 'px' : '';
      var bits = props[j];
      for (var k = 0; k < bits.length; k++) bits[k].style.translate = lag ? '0 ' + lag : '';
    }
  }
  var props = slides.map(function (s) { return Array.prototype.slice.call(s.querySelectorAll('.sticker, .tape')); });

  var hoverFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- the cover's code panel types itself out: a preset script drawn from the
     analysis and the simulation. Hovering pauses it and frees the panel to scroll;
     leaving resumes. It waits while the cover is covered or the tab is hidden. ---- */
  var codeBox = d.querySelector('[data-code]');
  if (codeBox) {
    var out = codeBox.querySelector('[data-code-out]'), fileEl = codeBox.querySelector('[data-code-file]'), body = codeBox.querySelector('.code__body');
    var SCRIPT = [
      ['analysis.py', [
        '# aducanumab · FDA adverse-event reports, 2016 to 2024',
        '# AEMS Public Dashboard, retrieved 2026-08-31',
        'from scipy.stats import chi2_contingency, binomtest',
        'import numpy as np',
        '',
        'cases = {"aducanumab": 486, "lecanemab": 3728, "donanemab": 3238}',
        'aria  = {"aducanumab": 181, "lecanemab": 957,  "donanemab": 1100}',
        '',
        'table = [[aria[d], cases[d] - aria[d]] for d in cases]',
        'chi2, p, dof, _ = chi2_contingency(table)',
        'share = {d: aria[d] / cases[d] for d in cases}',
        '# aducanumab 0.372 · lecanemab 0.257 · donanemab 0.340',
        '# proportions of submitted reports, not patient risk',
        '',
        'def two_proportion_z(k1, n1, k2, n2):',
        '    p1, p2 = k1 / n1, k2 / n2',
        '    pool = (k1 + k2) / (n1 + n2)',
        '    se = np.sqrt(pool * (1 - pool) * (1 / n1 + 1 / n2))',
        '    return (p1 - p2) / se',
        '',
        'z_lec = two_proportion_z(181, 486, 957, 3728)',
        'z_don = two_proportion_z(181, 486, 1100, 3238)',
        '',
        'by_year = {2016: 18, 2018: 3, 2019: 14, 2021: 17,',
        '           2022: 223, 2023: 160, 2024: 51}',
        'top_terms = ["ARIA-E", "ARIA-H", "headache",',
        '             "confusional state", "cerebral haemorrhage"]',
        'serious = {"aducanumab": 0.547, "lecanemab": 0.424, "donanemab": 0.516}',
        'female  = binomtest(k=round(0.528 * 486), n=486, p=0.5)',
        ''
      ]],
      ['genuvalens/controller.py', [
        '# genuvalens · assist-as-needed knee exoskeleton, simulated',
        '# squat-to-stand after ACL reconstruction · five repetitions per condition',
        'KP_RISE, KP_HOLD = 90.0, 60.0      # N·m/rad',
        'KD, TAU_MAX = 4.0, 30.0',
        'GATE_RISE, GATE_HOLD = 0.85, 0.15',
        '',
        'def torque(theta, omega, theta_ref, kp, asym):',
        '    tau = kp * (theta_ref - theta) - KD * omega',
        '    tau *= 1.0 + asym               # leg-asymmetry term',
        '    return max(-TAU_MAX, min(TAU_MAX, tau))',
        '',
        'def gain(p_rise, kp):',
        '    if p_rise > GATE_RISE: return KP_RISE',
        '    if p_rise < GATE_HOLD: return KP_HOLD',
        '    return kp                       # keep the last confident choice',
        '',
        'def phase(theta, omega, N=14):',
        '    x = filt(theta, omega, N)       # moving average, sigma 0.015 rad',
        '    return clf.predict_proba(x)[0, 1]',
        ''
      ]],
      ['genuvalens/simulate.py', [
        'for condition in ("none", "fixed", "adaptive"):',
        '    for rep in range(5):',
        '        capacity = 0.50 + 0.05 * rep   # quadriceps symmetry, 50% to 70%',
        '        theta, omega, kp = 0.0, 0.0, KP_HOLD',
        '        for t in np.arange(0.0, 2.0, 0.005):',
        '            p_rise = phase(theta, omega)',
        '            kp = gain(p_rise, kp)',
        '            assist = {',
        '                "none": 0.0,',
        '                "fixed": 30.0 * np.sin(np.pi * t / 1.5),',
        '                "adaptive": torque(theta, omega, target(t), kp, asym.estimate()),',
        '            }[condition]',
        '            theta, omega = plant.step(assist + athlete(capacity, t))',
        '        results[condition].append(metrics(theta))',
        '',
        '# extension completed · time · loading symmetry · peak athlete torque',
        '# none      87.2%   2.00 s   74.8%    9.6 N·m',
        '# fixed    113.9%   0.81 s   85.8%   23.3 N·m',
        '# adaptive  98.0%   1.30 s   78.6%    3.6 N·m   (taper 11.8%)',
        '# model results, not patient outcomes',
        ''
      ]],
      ['loquar/scene.ts', [
        '// loquar · a city, not a syllabus',
        'export type Word = { hanzi: string; pinyin: string; heard: number };',
        'export type Scene = { id: string; place: string; words: Word[] };',
        '',
        'export function reply(scene: Scene, said: string) {',
        '  const word = scene.words.find(w => matches(w.hanzi, said));',
        '  if (!word) return { scene, hint: scene.words[0].pinyin };',
        '  word.heard += 1;',
        '  return { scene: word.heard > 2 ? next(scene) : scene, hint: null };',
        '}',
        ''
      ]],
      ['daedalus/labyrinth.lua', [
        '-- daedalus · the labyrinth changes between rooms',
        'local function rebuild(maze, seed)',
        '    for _, room in ipairs(maze.rooms) do',
        '        room.doors = shuffle(room.doors, seed + room.id)',
        '    end',
        '    return maze',
        'end'
      ]]
    ];
    var KW = /^(from|import|def|return|if|for|in|range|export|type|function|const|local|end|do|and|or|not|while|else)$/;
    /* flatten into coloured segments; each segment types one character at a time */
    var segs = [];
    SCRIPT.forEach(function (file) {
      segs.push({ file: file[0] });
      file[1].forEach(function (line) {
        var i = line.indexOf('#'), j = line.indexOf('//'), k = line.indexOf('--');
        var cut = [i, j, k].filter(function (x) { return x >= 0; }).sort(function (a, b) { return a - b; })[0];
        var code = cut === undefined ? line : line.slice(0, cut), com = cut === undefined ? '' : line.slice(cut);
        code.split(/(\s+)/).forEach(function (tok) {
          if (!tok) return;
          var cls = KW.test(tok) ? 'k' : (/^["'].*|\d/.test(tok) ? 'n' : '');
          segs.push({ cls: cls, text: tok });
        });
        if (com) segs.push({ cls: 'c', text: com });
        segs.push({ cls: '', text: '\n' });
      });
    });
    var si = 0, ci = 0, span = null, paused = false, done = false, timer = 0;
    function atBottom() { body.scrollTop = body.scrollHeight; }
    function tick() {
      timer = 0;
      if (done) return;
      if (paused || d.hidden || (cover && !cover.classList.contains('is-in'))) { timer = setTimeout(tick, 250); return; }
      var seg = segs[si];
      if (!seg) { done = true; codeBox.classList.add('is-done'); return; }
      if (seg.file) { if (fileEl) fileEl.textContent = seg.file; si++; ci = 0; span = null; timer = setTimeout(tick, 600); return; }
      if (ci === 0) { span = d.createElement('span'); if (seg.cls) span.className = seg.cls; out.appendChild(span); }
      var ch = seg.text.charAt(ci); span.textContent += ch; ci++;
      if (ci >= seg.text.length) { si++; ci = 0; span = null; }
      atBottom();
      timer = setTimeout(tick, ch === '\n' ? 140 + Math.random() * 120 : 16 + Math.random() * 26);
    }
    if (reduce) {
      segs.forEach(function (seg) { if (seg.file) return; var sp = d.createElement('span'); if (seg.cls) sp.className = seg.cls; sp.textContent = seg.text; out.appendChild(sp); });
      if (fileEl) fileEl.textContent = 'daedalus/labyrinth.lua';
      codeBox.classList.add('is-done');
    } else {
      codeBox.addEventListener('pointerenter', function () { paused = true; codeBox.classList.add('is-paused'); });
      codeBox.addEventListener('pointerleave', function () { paused = false; codeBox.classList.remove('is-paused'); atBottom(); });
      codeBox.addEventListener('click', function () { if (!hoverFine) { paused = !paused; codeBox.classList.toggle('is-paused', paused); if (!paused) atBottom(); } });
      timer = setTimeout(tick, 1400);
    }
  }

  /* ---- the index drawer: folders for every sheet; choosing one scrolls there ---- */
  var drawer = d.getElementById('drawer');
  if (drawer && typeof drawer.showModal === 'function') {
    var opener = null;
    function openDrawer(e) {
      if (drawer.open) return;
      opener = e && e.currentTarget ? e.currentTarget : null;
      drawer.querySelectorAll('.folder[data-current]').forEach(function (f) { f.removeAttribute('aria-current'); f.removeAttribute('data-current'); });
      var cur = drawer.querySelector('.folder__btn[data-go="' + slides[current].id + '"]');
      if (cur) { cur.parentNode.setAttribute('aria-current', 'true'); cur.parentNode.setAttribute('data-current', ''); }
      html.classList.add('drawer-open');
      drawer.classList.add('is-quiet');
      drawer.showModal();
      if (cur) cur.focus(); else { var first = drawer.querySelector('.folder__btn'); if (first) first.focus(); }
    }
    function closeDrawer() { if (drawer.open) drawer.close(); }
    function wake() { drawer.classList.remove('is-quiet'); }
    /* once the pointer takes over, drop the keyboard focus so only the hovered card shows */
    drawer.addEventListener('pointermove', function () { wake(); var ae = d.activeElement; if (ae && ae.classList && ae.classList.contains('folder__btn')) ae.blur(); });
    drawer.addEventListener('keydown', wake);
    drawer.addEventListener('close', function () {
      html.classList.remove('drawer-open'); drawer.classList.remove('is-quiet');
      if (opener && opener.focus) opener.focus();
    });
    d.querySelectorAll('[data-drawer-open]').forEach(function (b) { b.addEventListener('click', openDrawer); });
    d.querySelectorAll('[data-drawer-close]').forEach(function (b) { b.addEventListener('click', closeDrawer); });
    drawer.addEventListener('click', function (e) { if (e.target === drawer) closeDrawer(); });
    drawer.querySelectorAll('.folder__btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-go'), i = indexOfHash('#' + id);
        closeDrawer();
        if (i >= 0) { go(i); if (history.replaceState) history.replaceState(null, '', i === 0 ? location.pathname : '#' + id); }
      });
    });
    /* arrow keys walk the folders while the drawer is open */
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var btns = Array.prototype.slice.call(drawer.querySelectorAll('.folder__btn')), i = btns.indexOf(d.activeElement);
      e.preventDefault(); e.stopPropagation();
      btns[(i + (e.key === 'ArrowDown' ? 1 : -1) + btns.length) % btns.length].focus();
    });
  }

  /* ---- magnetic contact buttons: a few pixels toward a fine pointer ---- */
  if (hoverFine && !reduce) {
    d.querySelectorAll('.contact__links a').forEach(function (a) {
      a.addEventListener('pointermove', function (e) {
        var r = a.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        a.style.translate = (dx * 8).toFixed(1) + 'px ' + (dy * 8).toFixed(1) + 'px';
      });
      a.addEventListener('pointerleave', function () { a.style.translate = ''; });
    });
  }
  function setCurrent(i) {
    current = i;
    dots.forEach(function (a, k) { if (k === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }

  /* ---- 5. navigation: dots, the name in the chrome, arrow keys, the hash ---- */
  function go(i, instant) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    window.scrollTo({ top: tops[i], left: 0, behavior: instant ? 'instant' : (reduce ? 'auto' : 'smooth') });
  }
  function indexOfHash(hash) {
    if (!hash || hash.length < 2) return -1;
    var id = hash.slice(1);
    for (var i = 0; i < slides.length; i++) if (slides[i].id === id) return i;
    return -1;
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var i = indexOfHash(a.getAttribute('href'));
    if (i < 0) return;
    e.preventDefault();
    go(i);
    if (history.replaceState) history.replaceState(null, '', i === 0 ? location.pathname : '#' + slides[i].id);
  });
  d.addEventListener('keydown', function (e) {
    if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (d.getElementById('drawer') && d.getElementById('drawer').open) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', measure);
  measure();
  /* re-measure once fonts and images have settled */
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { setTimeout(measure, 50); });
  /* the browser's own fragment jump can land after ours (and, with sticky
     sheets, in the wrong place), so correct it once more shortly after load */
  function jumpToHash() { var i = indexOfHash(location.hash); if (i > 0) go(i, true); }
  window.addEventListener('load', function () {
    measure(); jumpToHash();
    setTimeout(function () { measure(); jumpToHash(); }, 150);
  });
  window.addEventListener('hashchange', function () { var i = indexOfHash(location.hash); if (i >= 0) go(i, true); });
})();
