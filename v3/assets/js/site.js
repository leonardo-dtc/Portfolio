/* v3 poster · one small script. Everything is progressive: the page reads
   fully without it. It clip-reveals headlines once per slide, runs the
   cover's load sequence after the display face arrives, drives the desktop
   sheet-stacking (the covered sheet recedes as the next one slides over it),
   keeps the dot rail, its current-sheet label and the keyboard in step, and
   runs the cabinet: the index as a small file drawer beside the rail. All
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
  /* archive cards reveal one after another, however many Leonardo adds */
  d.querySelectorAll('.entries > li').forEach(function (li, i) { li.style.setProperty('--i', i); });

  /* ---- 2. reveals replay every time a sheet comes back ----
     Phones: an observer adds the class at 30% and removes it once the sheet is
     fully out. Desktop stacking: a covered sheet still intersects the viewport,
     so update() decides from the scroll geometry instead. */
  var started = false, io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      if (stackMQ.matches) return;
      entries.forEach(function (e) {
        if (e.target === cover && !started) return;
        if (e.intersectionRatio >= 0.3) e.target.classList.add('is-in');
        else if (e.intersectionRatio === 0) e.target.classList.remove('is-in');
      });
    }, { threshold: [0, 0.3] });
    slides.forEach(function (s) { io.observe(s); });
  } else {
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
  var tops = [], vh = window.innerHeight, current = 0, stacked = stackMQ.matches;
  function measure() {
    vh = window.innerHeight;
    slides.forEach(function (s, i) {
      s.classList.remove('is-tall'); s.style.transform = '';
      if (dims[i]) dims[i].style.opacity = '';
      props[i].forEach(function (b) { b.style.translate = ''; });
    });
    /* leaving the stacked layout (a narrower or shorter window): observe afresh so the
       sheet in view reveals at once instead of waiting for the next threshold */
    if (io && stacked && !stackMQ.matches) slides.forEach(function (s) { io.unobserve(s); io.observe(s); });
    stacked = stackMQ.matches;
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
      /* a mouse pauses by hovering; touch and pen toggle with a tap (their enter and
         leave fire around every tap, so they must not drive the pause) */
      var tapped = false;
      codeBox.addEventListener('pointerdown', function (e) { tapped = e.pointerType !== 'mouse'; });
      codeBox.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { paused = true; codeBox.classList.add('is-paused'); } });
      codeBox.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { paused = false; codeBox.classList.remove('is-paused'); atBottom(); } });
      codeBox.addEventListener('click', function () { if (tapped) { paused = !paused; codeBox.classList.toggle('is-paused', paused); if (!paused) atBottom(); } });
      timer = setTimeout(tick, 1400);
    }
  }

  /* ---- the rail and the cabinet ----
     The rail is always on screen: a dot per sheet, the current sheet's number and name, and the folder
     button. Hovering or focusing it opens the cabinet beside it after a short intent delay, and it closes
     after a grace period once the pointer has left both; it stays open while the pointer is over either.
     A click on the folder button keeps it open (a second click closes it). Hovering a dot or a folder, or
     focusing a folder, pulls that folder's file up. Below 900px the same cabinet opens from the index
     button as a bottom panel and a tap on a folder goes straight to the sheet. Non-modal throughout. */
  var rail = d.querySelector('.rail');
  var railBtn = d.querySelector('.rail__folder');
  var railLabel = d.querySelector('[data-rail-label]');
  var cabinet = d.getElementById('cabinet');
  var folders = cabinet ? Array.prototype.slice.call(cabinet.querySelectorAll('.folder')) : [];
  var folderLinks = folders.map(function (f) { return f.querySelector('.folder__btn'); });
  var openers = Array.prototype.slice.call(d.querySelectorAll('[data-index-open]'));
  var names = dots.map(function (a) { return a.getAttribute('data-name') || ''; });
  var phoneMQ = window.matchMedia('(max-width: 899px)');
  var OPEN_DELAY = 120, CLOSE_GRACE = 300, PULL_DWELL = 50;
  var isOpen = false, pinned = false, openT = 0, closeT = 0, pullT = 0, pulled = -1;
  var quiet = false, opener = null, holdFocusOpen = false, pointerIn = false;

  /* with the script, keyboard users take the cabinet (one stop on the rail instead of twelve) */
  dots.forEach(function (a) { a.setAttribute('tabindex', '-1'); });

  function within(el) { return !!el && el.nodeType === 1 && ((rail && rail.contains(el)) || (cabinet && cabinet.contains(el))); }
  function isOpener(el) { return openers.indexOf(el) >= 0; }
  function mouseLike(e) { return e.pointerType === 'mouse' || e.pointerType === 'pen'; }
  function setExpanded(v) { openers.forEach(function (b) { b.setAttribute('aria-expanded', v ? 'true' : 'false'); }); }

  /* one file out at a time; its dot lights up with it */
  function pull(k) {
    clearTimeout(pullT); pullT = 0;
    if (k === pulled) return;
    var swap = pulled >= 0 && k >= 0;
    if (pulled >= 0 && folders[pulled]) folders[pulled].classList.remove('is-out');
    pulled = k;
    if (k >= 0 && folders[k]) { folders[k].style.setProperty('--rise-delay', swap ? '60ms' : '0ms'); folders[k].classList.add('is-out'); }
    dots.forEach(function (a, i) { a.classList.toggle('is-hot', i === k); });
  }
  function pullSoon(k, ms) { clearTimeout(pullT); pullT = setTimeout(function () { pull(k); }, ms); }

  /* rows line up with the dots; only when a window is too short for the top folder's file to rise inside
     it does the cabinet move down (as far as it can while staying on screen) */
  function place() {
    if (!cabinet) return;
    cabinet.style.removeProperty('--cab-shift');
    cabinet.classList.remove('is-cramped');
    if (phoneMQ.matches) return;
    function need() {
      var n = 0;
      folders.forEach(function (f) {
        var file = f.querySelector('.file');
        if (file) n = Math.max(n, 12 - (f.getBoundingClientRect().top + file.offsetTop)); /* 12: room for the tilt */
      });
      return n;
    }
    var room = window.innerHeight - 8 - cabinet.getBoundingClientRect().bottom, n = need();
    /* in a very short window the files leave out their summary line rather than leave the screen */
    if (n > room) { cabinet.classList.add('is-cramped'); n = need(); }
    var shift = Math.max(0, Math.min(n, room));
    if (shift > 0) cabinet.style.setProperty('--cab-shift', Math.ceil(shift) + 'px');
  }

  function openCabinet(how, focusIn) {
    clearTimeout(openT); openT = 0; clearTimeout(closeT); closeT = 0;
    if (!cabinet) return;
    if (!isOpen) {
      isOpen = true; place();
      cabinet.classList.add('is-open'); rail.classList.add('is-indexing'); setExpanded(true);
    }
    if (how === 'pin') pinned = true;
    if (focusIn) {
      /* keyboard: focus lands on the current sheet's folder, and stays quiet (no file) until the
         reader moves; a file covering the index the moment it opens would hide the folders */
      quiet = true;
      var f = folderLinks[current] || folderLinks[0];
      if (f) f.focus();
    }
  }
  function closeCabinet(returnFocus) {
    clearTimeout(openT); openT = 0; clearTimeout(closeT); closeT = 0;
    if (!isOpen) return;
    isOpen = false; pinned = false; quiet = false;
    pull(-1);
    cabinet.classList.remove('is-open'); rail.classList.remove('is-indexing'); setExpanded(false);
    var to = opener || railBtn;
    opener = null;
    if (returnFocus && to) { if (to === railBtn) holdFocusOpen = true; to.focus(); }
    else if (within(d.activeElement) && d.activeElement !== railBtn) d.activeElement.blur();
  }
  function scheduleClose() {
    clearTimeout(closeT);
    closeT = setTimeout(function () {
      closeT = 0;
      if (pointerIn) return;
      if (within(d.activeElement) && d.activeElement !== railBtn) { var i = folderLinks.indexOf(d.activeElement); pull(i); return; }
      if (pinned) { pull(-1); return; }
      closeCabinet(false);
    }, CLOSE_GRACE);
  }

  if (cabinet && rail && railBtn) {
    /* hover intent on the rail and the cabinet, as one area */
    [rail, cabinet].forEach(function (el) {
      el.addEventListener('pointerenter', function (e) {
        if (!mouseLike(e) || phoneMQ.matches) return;
        pointerIn = true; clearTimeout(closeT); closeT = 0;
        if (!isOpen && !openT) openT = setTimeout(function () { openT = 0; if (pointerIn) openCabinet('hover'); }, OPEN_DELAY);
      });
      el.addEventListener('pointerleave', function (e) {
        if (!mouseLike(e) || phoneMQ.matches) return;
        if (within(e.relatedTarget)) return; /* from the rail straight into the cabinet, or back */
        pointerIn = false;
        clearTimeout(openT); openT = 0;
        if (isOpen) scheduleClose();
      });
    });
    /* a dot pulls its folder's file; moving left from a dot stays on the same row */
    dots.forEach(function (a, i) {
      a.addEventListener('pointerenter', function (e) {
        if (!mouseLike(e) || phoneMQ.matches) return;
        quiet = false;
        pullSoon(i, isOpen ? PULL_DWELL : OPEN_DELAY + 60);
      });
    });
    folderLinks.forEach(function (a, k) {
      a.addEventListener('pointerenter', function (e) {
        if (!mouseLike(e) || phoneMQ.matches) return;
        quiet = false;
        pullSoon(k, PULL_DWELL);
      });
      a.addEventListener('focus', function () { if (!quiet && !phoneMQ.matches) pull(k); });
    });
    cabinet.addEventListener('pointermove', function (e) { if (mouseLike(e)) quiet = false; });

    /* focusing the folder button opens the cabinet too (keyboard focus only, after the same delay) */
    railBtn.addEventListener('focus', function () {
      if (holdFocusOpen) { holdFocusOpen = false; return; }
      if (phoneMQ.matches || isOpen) return;
      var kb = true; try { kb = railBtn.matches(':focus-visible'); } catch (err) { /* older engines */ }
      if (!kb) return;
      clearTimeout(openT);
      openT = setTimeout(function () { openT = 0; if (d.activeElement === railBtn) { opener = railBtn; openCabinet('focus'); } }, OPEN_DELAY);
    });
    railBtn.addEventListener('blur', function () { holdFocusOpen = false; });

    /* the folder button and "Open the index" toggle it for click, keyboard and touch */
    openers.forEach(function (b) {
      b.addEventListener('click', function (e) {
        var kb = e.detail === 0;
        clearTimeout(openT); openT = 0;
        if (isOpen && (pinned || b !== railBtn)) { closeCabinet(kb); return; }
        opener = b;
        openCabinet('pin', kb);
      });
    });
    d.querySelectorAll('[data-index-close]').forEach(function (b) {
      b.addEventListener('click', function (e) { closeCabinet(e.detail === 0 || within(d.activeElement)); });
    });

    /* focus leaving both the rail and the cabinet closes it, unless the pointer still holds it */
    function focusOut(e) {
      if (!isOpen) { if (!within(e.relatedTarget)) { clearTimeout(openT); openT = 0; } return; }
      if (within(e.relatedTarget) || isOpener(e.relatedTarget)) return;
      setTimeout(function () {
        if (!isOpen || within(d.activeElement)) return;
        if (pointerIn) { pull(-1); return; }
        if (pinned && isOpener(d.activeElement)) return;
        closeCabinet(false);
      }, 0);
    }
    rail.addEventListener('focusout', focusOut);
    cabinet.addEventListener('focusout', focusOut);

    /* a press anywhere else closes it */
    d.addEventListener('pointerdown', function (e) {
      if (!isOpen) return;
      var t = e.target;
      if (within(t) || openers.some(function (b) { return b.contains(t); })) return;
      closeCabinet(false);
    }, true);

    /* Escape closes and returns focus; arrows walk the folders; Home and End jump */
    d.addEventListener('keydown', function (e) {
      if (!isOpen) return;
      var ae = d.activeElement, i = folderLinks.indexOf(ae);
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCabinet(within(ae) || isOpener(ae));
        return;
      }
      if (i < 0 && !isOpener(ae) && !within(ae)) return;
      quiet = false;
      var n = folderLinks.length, k = -1;
      if (e.key === 'ArrowDown') k = i < 0 ? current : (i + 1) % n;
      else if (e.key === 'ArrowUp') k = i < 0 ? current : (i - 1 + n) % n;
      else if (e.key === 'Home') k = 0;
      else if (e.key === 'End') k = n - 1;
      if (k < 0) return;
      e.preventDefault();
      folderLinks[k].focus();
      pull(k);
    });

    phoneMQ.addEventListener ? phoneMQ.addEventListener('change', function () { closeCabinet(false); }) : phoneMQ.addListener(function () { closeCabinet(false); });
    window.addEventListener('resize', function () { if (isOpen) place(); });
  }

  /* the label beside the rail follows the current sheet; it fades through a swap, and while the reader
     scrolls past several sheets it only shows where they land */
  var labelT = 0, labelTo = 0;
  function writeLabel(i) {
    if (!railLabel) return;
    var b = d.createElement('b'); b.textContent = (i < 9 ? '0' : '') + (i + 1);
    railLabel.textContent = '';
    railLabel.appendChild(b);
    railLabel.appendChild(d.createTextNode(' ' + (names[i] || '')));
  }
  function showLabel(i) {
    labelTo = i;
    if (!railLabel) return;
    if (reduce) { writeLabel(i); return; }
    if (labelT) return;
    railLabel.classList.add('is-swapping');
    labelT = setTimeout(function () { labelT = 0; writeLabel(labelTo); railLabel.classList.remove('is-swapping'); }, 120);
  }

  /* on phones the floating index button steps aside while the end row, which has its own
     "Open the index", is on screen (the CSS applies it below 900px only) */
  var endRow = d.querySelector('.end');
  if (endRow && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { html.classList.toggle('at-end', es[0].isIntersecting); }).observe(endRow);
  }

  /* ---- magnetic buttons on the contact sheet: a few pixels toward a fine pointer ---- */
  if (hoverFine && !reduce) {
    d.querySelectorAll('[data-magnet]').forEach(function (a) {
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
    folders.forEach(function (f, k) {
      f.classList.toggle('is-current', k === i);
      if (k === i) folderLinks[k].setAttribute('aria-current', 'true'); else folderLinks[k].removeAttribute('aria-current');
    });
    showLabel(i);
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
    if (within(a)) closeCabinet(false);
    go(i);
    if (history.replaceState) history.replaceState(null, '', i === 0 ? location.pathname : '#' + slides[i].id);
    /* the skip link, and any in-page link taken from the keyboard, also moves focus, as the native jump would */
    if (a.classList.contains('skip') || e.detail === 0) { slides[i].setAttribute('tabindex', '-1'); slides[i].focus({ preventScroll: true }); }
  });
  /* keyboard focus landing in a stacked sheet brings that sheet to rest, so the sheet
     above it in the stack never covers the focused link */
  d.addEventListener('focusin', function (e) {
    if (!stackMQ.matches) return;
    var t = e.target, s = t.closest ? t.closest('.deck > .slide') : null, i = slides.indexOf(s);
    if (i < 0 || s.classList.contains('is-tall')) return;
    try { if (!t.matches(':focus-visible')) return; } catch (err) { /* older engines: always correct */ }
    requestAnimationFrame(function () { if (Math.abs((window.pageYOffset || html.scrollTop) - tops[i]) > 1) go(i); });
  });
  d.addEventListener('keydown', function (e) {
    if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (isOpen && (within(d.activeElement) || isOpener(d.activeElement))) return;
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
