/* v3 poster · one small script. Everything is progressive: the page reads
   fully without it. It writes the counts from the sections, clip-reveals
   headlines once per slide, runs the cover's load sequence after the display
   face arrives, drives the desktop sheet-stacking (the covered sheet recedes
   as the next one slides over it), keeps the dot rail, its current-sheet
   label, the index tab and the keyboard in step, and runs the cabinet: the
   index as a small file drawer beside the rail, with its Find slip. It also
   turns the project cards into links and folds the archive cards. All
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
  /* each card with a link folds its line and link away until it is pointed at (the stylesheet decides
     where that happens: never on touch screens or in print) */
  d.querySelectorAll('.entries > .entry').forEach(function (li) {
    var link = li.querySelector('.entry__link');
    if (!link) return;
    var fold = d.createElement('div'), inner = d.createElement('div');
    fold.className = 'entry__fold'; inner.className = 'entry__fold-in';
    var line = li.querySelector('.entry__line');
    if (line) inner.appendChild(line);
    inner.appendChild(link);
    fold.appendChild(inner); li.appendChild(fold);
    li.classList.add('has-fold');
  });
  /* a card the row has stretched (its title is shorter than its neighbours') unfolds from just under its own
     title (--fold-top), and a card near the foot of its sheet lifts as far as its unfolded line needs to stay
     on the sheet (--rise); both measured with the layout: offsets, so the stacking's scale does not count */
  var folded = Array.prototype.slice.call(d.querySelectorAll('.entry.has-fold'));
  function riseCards() {
    folded.forEach(function (li) {
      var sheet = li.closest('.sheet'), inner = li.querySelector('.entry__fold-in'), fold = li.querySelector('.entry__fold'), title = li.querySelector('.entry__title');
      li.style.removeProperty('--rise'); li.style.removeProperty('--fold-top');
      if (!sheet || !inner || getComputedStyle(fold).position !== 'absolute') return;
      var foldTop = li.offsetHeight - 1;
      if (title && title.offsetParent === li) {
        var under = Math.ceil(title.offsetTop + title.offsetHeight + parseFloat(getComputedStyle(li).paddingBottom) - 1);
        if (under < foldTop - 1) { foldTop = under; li.style.setProperty('--fold-top', under + 'px'); }
      }
      var top = 0;
      for (var e = li; e && e !== sheet; e = e.offsetParent) top += e.offsetTop;
      var over = top + foldTop + inner.scrollHeight + 12 - sheet.clientHeight;
      if (over > 0) li.style.setProperty('--rise', Math.ceil(over) + 'px');
    });
  }

  /* ---- counts from the page: the number of sheets, each folder's place and number, each file's
     "Sheet NN / N", the drawer's "N sheets" and the archive's "Sheet NN, name" links. The HTML keeps
     the same values as a fallback for pages read without the script. ---- */
  var N = slides.length;
  html.style.setProperty('--n', N);
  function pad(i) { return (i < 9 ? '0' : '') + (i + 1); }
  function indexOfHash(hash) {
    if (!hash || hash.length < 2) return -1;
    var id = hash.slice(1);
    for (var i = 0; i < slides.length; i++) if (slides[i].id === id) return i;
    return -1;
  }
  var cabinetEl = d.getElementById('cabinet');
  var folderEls = cabinetEl ? Array.prototype.slice.call(cabinetEl.querySelectorAll('.folder')) : [];
  var folderOf = [];   /* sheet index -> folder index */
  folderEls.forEach(function (f, k) {
    f.style.setProperty('--k', k);
    var a = f.querySelector('.folder__btn'), i = a ? indexOfHash(a.getAttribute('href')) : -1;
    if (i < 0) return;
    folderOf[i] = k;
    var num = f.querySelector('.folder__n'); if (num) num.textContent = pad(i);
    var rec = f.querySelector('.file__rec');
    if (rec) {
      var sh = rec.querySelector('.file__sheet') || d.createElement('span');
      sh.className = 'file__sheet'; sh.textContent = 'Sheet ';
      rec.textContent = ''; rec.appendChild(sh); rec.appendChild(d.createTextNode(pad(i) + ' / ' + N));
    }
  });
  /* a divider stands just behind the folder after it, so it takes that folder's place */
  if (cabinetEl) cabinetEl.querySelectorAll('.divider').forEach(function (dv) {
    var nx = dv.nextElementSibling;
    while (nx && !nx.classList.contains('folder')) nx = nx.nextElementSibling;
    if (nx) dv.style.setProperty('--k', folderEls.indexOf(nx));
  });
  function sheetTitle(i) {
    var f = folderEls[folderOf[i]], t = f && f.querySelector('.file__title');
    return t ? t.textContent.trim() : (dots[i] && dots[i].getAttribute('data-name')) || '';
  }
  var cabLabel = d.querySelector('[data-cabinet-label]');
  var cabLabelText = 'Portfolio · ' + N + ' sheet' + (N === 1 ? '' : 's');
  if (cabLabel) cabLabel.textContent = cabLabelText;
  d.querySelectorAll('.entry__link[href^="#"]').forEach(function (a) {
    var i = indexOfHash(a.getAttribute('href'));
    if (i >= 0 && /^Sheet\s/.test(a.textContent.trim())) a.textContent = 'Sheet ' + pad(i) + ', ' + sheetTitle(i);
  });

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
    riseCards();
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
    /* the rest of the script at once, as reduced motion shows it: from the segment being typed to the end */
    function finish() {
      if (done) return;
      clearTimeout(timer); timer = 0; done = true;
      if (span && ci > 0) { span.textContent += segs[si].text.slice(ci); si++; }
      span = null; ci = 0;
      for (; si < segs.length; si++) {
        var seg = segs[si];
        if (seg.file) { if (fileEl) fileEl.textContent = seg.file; continue; }
        var sp = d.createElement('span'); if (seg.cls) sp.className = seg.cls; sp.textContent = seg.text; out.appendChild(sp);
      }
      codeBox.classList.add('is-done');
    }
    if (reduce) {
      finish();
    } else {
      /* a keyboard has no hover to pause it with: the first key press anywhere finishes the script at once,
         so nothing types on while the reader tabs through the page */
      d.addEventListener('keydown', finish, { once: true });
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
     button, with the paper index tab standing above it. Hovering it opens the cabinet beside it
     after a short intent delay, and it closes after a grace period once the pointer has left both; it stays
     open while the pointer is over either. A click on the folder button or the index tab keeps it open (a
     second click closes it). Hovering a dot or a folder, or focusing a folder, pulls that folder's file up;
     the pulled file is part of its folder's link, so a click on it opens its sheet. Below 900px (and in
     windows too short for the drawer) the same cabinet opens as a bottom panel and a tap on a folder goes
     straight to the sheet. Non-modal throughout. */
  var rail = d.querySelector('.rail');
  var railBtn = d.querySelector('.rail__folder');
  var railLabel = d.querySelector('[data-rail-label]');
  var indexTab = d.querySelector('.index-tab');
  var indexAt = d.querySelector('[data-index-at]');
  var cabinet = cabinetEl;
  var folders = folderEls;
  var folderLinks = folders.map(function (f) { return f.querySelector('.folder__btn'); });
  var folderSheet = folderLinks.map(function (a) { return indexOfHash(a.getAttribute('href')); });
  var openers = Array.prototype.slice.call(d.querySelectorAll('[data-index-open]'));
  var names = dots.map(function (a) { return a.getAttribute('data-name') || ''; });
  /* phones, and windows under 540px tall (where the sheets no longer stack and the rail would not fit): the
     pill instead of the rail, and the cabinet as a bottom panel (the stylesheet uses the same query) */
  var phoneMQ = window.matchMedia('(max-width: 899px), (max-height: 539px)');
  var panelMQ = phoneMQ;
  var OPEN_DELAY = 120, CLOSE_GRACE = 300, PULL_DWELL = 50, AIM_DELAY = 320;
  var isOpen = false, pinned = false, openT = 0, closeT = 0, pullT = 0, pulled = -1;
  var quiet = false, opener = null, holdFocusOpen = false, pointerIn = false;
  var findIn = d.getElementById('find');

  /* with the script, keyboard users take the cabinet (one stop on the rail instead of twelve) */
  dots.forEach(function (a) { a.setAttribute('tabindex', '-1'); });

  function within(el) { return !!el && el.nodeType === 1 && ((rail && rail.contains(el)) || (cabinet && cabinet.contains(el)) || (indexTab && indexTab.contains(el))); }
  function isOpener(el) { return openers.indexOf(el) >= 0; }
  function mouseLike(e) { return e.pointerType === 'mouse' || e.pointerType === 'pen'; }
  function setExpanded(v) { openers.forEach(function (b) { b.setAttribute('aria-expanded', v ? 'true' : 'false'); }); }
  function homeButton() { return indexTab || railBtn; } /* the index tab is the keyboard's way in (the folder button is out of the tab order) */

  /* one file out at a time; its dot lights up with it */
  function pull(k) {
    clearTimeout(pullT); pullT = 0;
    if (k === pulled) return;
    var swap = pulled >= 0 && k >= 0;
    if (pulled >= 0 && folders[pulled]) folders[pulled].classList.remove('is-out');
    pulled = k;
    if (k >= 0 && folders[k]) { folders[k].style.setProperty('--rise-delay', swap ? '60ms' : '0ms'); folders[k].classList.add('is-out'); }
    dots.forEach(function (a, i) { a.classList.toggle('is-hot', k >= 0 && i === folderSheet[k]); });
  }
  function pullSoon(k, ms) { clearTimeout(pullT); pullT = setTimeout(function () { pullT = 0; if (isOpen || k < 0) pull(k); }, ms); }

  /* Hover intent. A pulled file covers the folders behind it, so on the way up to it the pointer can cross
     another folder's exposed edge or another dot. While the pointer is heading for the file (it lies in the
     hull of where it was a moment ago and the file's corners: the "safe triangle"), crossing another row
     does not swap the file; if the pointer stops short of the file for AIM_DELAY, the row it rests on wins.
     Straight up and down the dots is never "heading for the file", so scrubbing stays immediate. */
  var locs = [], lastMove = 0, aimT = 0, wantK = -1, wantDwell = 0;
  function trackMove(e) {
    if (!mouseLike(e)) return;
    /* after a pause (100ms without moving) the triangle starts where the pointer rested, not where it was
       before the pause */
    if (Date.now() - lastMove > 100) locs = locs.slice(-1);
    locs.push([e.clientX, e.clientY]); if (locs.length > 4) locs.shift();
    lastMove = Date.now();
    if (aimT) { if (aiming()) { clearTimeout(aimT); aimT = setTimeout(aimDone, AIM_DELAY); } else { clearTimeout(aimT); aimT = 0; pullSoon(wantK, wantDwell); } }
  }
  function fileBox(k) {
    var a = folderLinks[k], file = a && a.querySelector('.file');
    if (!file) return null;
    var r = a.getBoundingClientRect();
    return { l: r.left + file.offsetLeft, t: r.top + file.offsetTop, r: r.left + file.offsetLeft + file.offsetWidth, b: r.top + file.offsetTop + file.offsetHeight };
  }
  function side(p, a, b) { return (p[0] - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (p[1] - b[1]); }
  function inTri(p, a, b, c) {
    var s1 = side(p, a, b), s2 = side(p, b, c), s3 = side(p, c, a);
    return !((s1 < 0 || s2 < 0 || s3 < 0) && (s1 > 0 || s2 > 0 || s3 > 0));
  }
  function aiming() {
    if (pulled < 0 || locs.length < 2 || Date.now() - lastMove > AIM_DELAY) return false;
    var bx = fileBox(pulled);
    if (!bx) return false;
    var cur = locs[locs.length - 1], prev = locs[0];
    if (cur[0] >= bx.l && cur[0] <= bx.r && cur[1] >= bx.t && cur[1] <= bx.b) return true;
    if (prev[0] === cur[0] && prev[1] === cur[1]) return false;
    var c = [[bx.l, bx.t], [bx.r, bx.t], [bx.r, bx.b], [bx.l, bx.b]];
    for (var i = 0; i < 4; i++) if (inTri(cur, prev, c[i], c[(i + 1) % 4])) return true;
    return false;
  }
  function aimDone() { aimT = 0; if (wantK >= 0 && wantK !== pulled) pullSoon(wantK, 0); }
  function want(k, dwell) {
    wantK = k; wantDwell = dwell;
    clearTimeout(aimT); aimT = 0;
    if (k === pulled) { clearTimeout(pullT); pullT = 0; return; }
    if (aiming()) { clearTimeout(pullT); pullT = 0; aimT = setTimeout(aimDone, AIM_DELAY); return; }
    pullSoon(k, dwell);
  }

  /* rows line up with the dots. When the window is too short for the top folder's file to rise inside it,
     the cabinet moves down (as far as it can while staying on screen); when the drawer front would fall
     below the window, it moves up instead and the files make do */
  function place() {
    if (!cabinet) return;
    cabinet.style.removeProperty('--cab-shift');
    cabinet.classList.remove('is-cramped');
    if (panelMQ.matches) return;
    function need() {
      var n = 0;
      folders.forEach(function (f, k) {
        var file = folderLinks[k] && folderLinks[k].querySelector('.file');
        if (file) n = Math.max(n, 12 - (f.getBoundingClientRect().top + file.offsetTop)); /* 12: room for the tilt */
      });
      return n;
    }
    var box = cabinet.getBoundingClientRect(), room = window.innerHeight - 8 - box.bottom, n = need(), shift;
    if (room < 0) {
      shift = Math.max(room, 8 - box.top);
      cabinet.style.setProperty('--cab-shift', Math.floor(shift) + 'px');
      if (need() > 0) cabinet.classList.add('is-cramped');
      return;
    }
    /* in a very short window the files leave out their summary line rather than leave the screen */
    if (n > room) { cabinet.classList.add('is-cramped'); n = need(); }
    shift = Math.max(0, Math.min(n, room));
    if (shift > 0) cabinet.style.setProperty('--cab-shift', Math.ceil(shift) + 'px');
  }

  /* on a phone the panel rides above the on-screen keyboard while Find has it open */
  function kbFix() {
    if (!cabinet) return;
    var vv = window.visualViewport, kb = 0;
    if (isOpen && panelMQ.matches && vv) kb = Math.max(0, Math.round(window.innerHeight - (vv.offsetTop + vv.height)));
    if (kb > 0) cabinet.style.setProperty('--kb', kb + 'px'); else cabinet.style.removeProperty('--kb');
  }

  function openCabinet(how, focusIn) {
    clearTimeout(openT); openT = 0; clearTimeout(closeT); closeT = 0;
    if (!cabinet) return;
    if (!isOpen) {
      isOpen = true; place();
      cabinet.classList.add('is-open'); if (rail) rail.classList.add('is-indexing'); html.classList.add('index-open'); setExpanded(true);
    }
    if (how === 'pin') pinned = true;
    if (focusIn) {
      /* keyboard: focus lands on the current sheet's folder, and stays quiet (no file) until the
         reader moves; a file covering the index the moment it opens would hide the folders */
      quiet = true;
      var f = folderLinks[folderOf[current]] || folderLinks[0];
      if (f) f.focus();
    }
  }
  function closeCabinet(returnFocus) {
    clearTimeout(openT); openT = 0; clearTimeout(closeT); closeT = 0; clearTimeout(aimT); aimT = 0;
    if (!isOpen) return;
    isOpen = false; pinned = false; quiet = false;
    pull(-1);
    if (findIn && findIn.value) { findIn.value = ''; find(''); }
    cabinet.classList.remove('is-open'); if (rail) rail.classList.remove('is-indexing'); html.classList.remove('index-open'); setExpanded(false);
    kbFix();
    var to = opener || homeButton();
    opener = null;
    if (returnFocus && to) { if (to === railBtn) holdFocusOpen = true; to.focus(); }
    else if (within(d.activeElement) && d.activeElement !== railBtn) d.activeElement.blur();
  }
  function scheduleClose() {
    clearTimeout(closeT);
    closeT = setTimeout(function () {
      closeT = 0;
      if (pointerIn) return;
      if (within(d.activeElement) && d.activeElement !== railBtn && d.activeElement !== indexTab) {
        var i = folderLinks.indexOf(d.activeElement);
        if (i >= 0 || d.activeElement !== findIn) pull(i);
        return;
      }
      if (pinned) { if (!(findIn && findIn.value)) pull(-1); return; }
      closeCabinet(false);
    }, CLOSE_GRACE);
  }

  /* ---- Find, on the drawer front: the page's own text, sheet by sheet. A word matches at the start of a
     word ("sat" finds SAT, not "conversation"), accents aside; every word typed must match. Matching folders
     keep their ink and show a count, and each one's file quotes the first line that matched; the first
     match's file comes out. Up and Down step through the matches, Enter goes to the one that is out. ---- */
  var corpus = null, found = [], foundAt = -1;
  var UNITS = '.tile, .timeline li, .stat-list > div, .numbers > div, .entry__meta';
  var LEAVES = 'h1, h2, h3, p, li, dt, dd, figcaption';
  function fold(t) { t = t.toLowerCase(); return t.normalize ? t.normalize('NFD').replace(/[̀-ͯ]/g, '') : t; }
  function textOf(el) {
    var out = '';
    (function walk(n) {
      for (var c = n.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 3) { out += c.data; continue; }
        if (c.nodeType !== 1 || c.getAttribute('aria-hidden') === 'true' || /^(SVG|SCRIPT|STYLE|svg)$/.test(c.tagName)) continue;
        if (c.tagName === 'BR') { out += ' '; continue; }
        var block = !/^inline/.test(getComputedStyle(c).display);
        if (block) out += ' ';
        walk(c);
        if (block) out += ' ';
      }
    })(el);
    return out.replace(/\s+/g, ' ').trim();
  }
  function buildCorpus() {
    corpus = [];
    slides.forEach(function (s, i) {
      var units = Array.prototype.slice.call(s.querySelectorAll(UNITS));
      var leaves = Array.prototype.slice.call(s.querySelectorAll(LEAVES)).filter(function (el) {
        if (units.some(function (u) { return u.contains(el); })) return false;
        return !el.querySelector(LEAVES);
      });
      units.concat(leaves).sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; }).forEach(function (el) {
        if (el.closest('[aria-hidden="true"]')) return;
        var t = textOf(el);
        if (t.length > 1) corpus.push({ i: i, el: el, text: t, key: fold(t) });
      });
    });
  }
  function esc(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  /* the quote: the matching line, cut to about 120 characters around the first match, the words marked */
  function quote(entry, res) {
    var t = entry.text, key = entry.key, at = Infinity;
    if (key.length !== t.length) res = []; /* folding changed the length (rare letters): quote without marks */
    res.forEach(function (re) { re.lastIndex = 0; var m = re.exec(key); if (m) at = Math.min(at, m.index + m[1].length); });
    if (at === Infinity) at = 0;
    var from = 0, to = t.length;
    if (t.length > 120) {
      from = Math.max(0, at - 40); if (from > 0) { var sp = t.indexOf(' ', from); if (sp > 0 && sp < at) from = sp + 1; }
      to = Math.min(t.length, from + 120); if (to < t.length) { var sp2 = t.lastIndexOf(' ', to); if (sp2 > at) to = sp2; }
    }
    var frag = d.createDocumentFragment(), piece = t.slice(from, to), pkey = key.slice(from, to), marks = [];
    res.forEach(function (re) { var g = new RegExp(re.source, 'g'), m; while ((m = g.exec(pkey))) { marks.push([m.index + m[1].length, m.index + m[0].length]); if (!m[0].length) g.lastIndex++; } });
    marks.sort(function (a, b) { return a[0] - b[0]; });
    var pos = 0;
    if (from > 0) frag.appendChild(d.createTextNode('…'));
    marks.forEach(function (mk) {
      if (mk[0] < pos) return;
      frag.appendChild(d.createTextNode(piece.slice(pos, mk[0])));
      var m = d.createElement('mark'); m.textContent = piece.slice(mk[0], mk[1]); frag.appendChild(m);
      pos = mk[1];
    });
    frag.appendChild(d.createTextNode(piece.slice(pos) + (to < t.length ? '…' : '')));
    return frag;
  }
  function setLabel(t, said) { if (cabLabel) cabLabel.textContent = t; var st = d.getElementById('find-status'); if (st) st.textContent = said || ''; }
  function find(q) {
    var words = fold(q).trim().split(/\s+/).filter(Boolean);
    found = []; foundAt = -1;
    folders.forEach(function (f) { f.classList.remove('is-match'); });
    if (!words.length) { cabinet.classList.remove('is-finding'); setLabel(cabLabelText); if (isOpen) pull(-1); return; }
    if (!corpus) buildCorpus();
    var res = words.map(function (w) { return new RegExp('(^|[^a-z0-9])' + esc(w)); });
    var bySheet = {};
    corpus.forEach(function (e) {
      if (!res.every(function (re) { re.lastIndex = 0; return re.test(e.key); })) return;
      (bySheet[e.i] = bySheet[e.i] || []).push(e);
    });
    /* the best match first: a sheet whose own name matches, then the sheet with more matching lines, then
       the earlier sheet; Up and Down step through them in that order */
    Object.keys(bySheet).map(Number).forEach(function (i) {
      var own = fold(sheetTitle(i) + ' ' + (names[i] || ''));
      found.push({ i: i, hits: bySheet[i], own: res.every(function (re) { return re.test(own); }) ? 1 : 0 });
    });
    found.sort(function (a, b) { return (b.own - a.own) || (b.hits.length - a.hits.length) || (a.i - b.i); });
    cabinet.classList.add('is-finding');
    found.forEach(function (r) {
      var f = folders[folderOf[r.i]];
      if (!f) return;
      f.classList.add('is-match');
      var file = f.querySelector('.file'), q2 = file && file.querySelector('.file__quote');
      if (file && !q2) { q2 = d.createElement('p'); q2.className = 'file__quote'; var go = file.querySelector('.file__go'); file.insertBefore(q2, go); }
      if (q2) { q2.textContent = ''; q2.appendChild(quote(r.hits[0], res)); }
      var hits = f.querySelector('.folder__hits');
      if (!hits) { hits = d.createElement('span'); hits.className = 'folder__hits'; hits.setAttribute('aria-hidden', 'true'); f.querySelector('.folder__tab').appendChild(hits); }
      hits.textContent = r.hits.length;
    });
    setLabel('Found · ' + found.length + ' of ' + N, 'Found on ' + found.length + ' of ' + N + ' sheets' + (found.length ? ', first ' + sheetTitle(found[0].i) : ''));
    /* the best match's file comes out (on the panel its tab turns white): Enter goes there */
    if (found.length) { foundAt = 0; quiet = false; pull(folderOf[found[0].i]); }
    else pull(-1);
  }
  function stepFound(by) {
    if (!found.length) return;
    foundAt = (foundAt + by + found.length) % found.length;
    pull(folderOf[found[foundAt].i]);
    if (panelMQ.matches) { var a = folderLinks[folderOf[found[foundAt].i]]; if (a && a.scrollIntoView) a.scrollIntoView({ block: 'nearest' }); }
  }
  /* go to a match: its sheet, then the line itself, ringed in vermilion for a moment */
  function goFound(r, kb) {
    var el = r.hits[0].el, target = el.closest('.entry, li, .tile, .card, .ticket') || el;
    /* an archive card found here is a file on the archive's Macintosh (mac.js): the Mac takes the landing and
       opens the file's window itself */
    var found = { target: target, handled: false };
    d.dispatchEvent(new CustomEvent('v3:find', { detail: found }));
    target = found.target;
    closeCabinet(false);
    go(r.i, false, target);
    if (history.replaceState) history.replaceState(null, '', r.i === 0 ? location.pathname : '#' + slides[r.i].id);
    if (!found.handled) {
      target.classList.remove('is-found'); void target.offsetWidth; target.classList.add('is-found');
      setTimeout(function () { target.classList.remove('is-found'); }, 2700);
    }
    if (kb) { slides[r.i].setAttribute('tabindex', '-1'); slides[r.i].focus({ preventScroll: true }); }
  }

  if (cabinet && rail && railBtn) {
    /* hover intent on the rail, the index tab and the cabinet, as one area */
    [rail, cabinet, indexTab].forEach(function (el) {
      if (!el) return;
      el.addEventListener('pointerenter', function (e) {
        if (!mouseLike(e) || panelMQ.matches) return;
        pointerIn = true; clearTimeout(closeT); closeT = 0;
        if (!isOpen && !openT) openT = setTimeout(function () { openT = 0; if (pointerIn) openCabinet('hover'); }, OPEN_DELAY);
      });
      el.addEventListener('pointerleave', function (e) {
        if (!mouseLike(e) || panelMQ.matches) return;
        if (within(e.relatedTarget)) return; /* from the rail straight into the cabinet, or back */
        pointerIn = false;
        clearTimeout(openT); openT = 0;
        if (isOpen) scheduleClose();
      });
      el.addEventListener('pointermove', trackMove, { passive: true });
    });
    /* a dot pulls its folder's file; moving left from a dot stays on the same row */
    dots.forEach(function (a, i) {
      a.addEventListener('pointerenter', function (e) {
        if (!mouseLike(e) || panelMQ.matches || folderOf[i] === undefined) return;
        trackMove(e); /* first, so the safe triangle includes the point that crossed into this row */
        quiet = false;
        want(folderOf[i], isOpen ? PULL_DWELL : OPEN_DELAY + 60);
      });
    });
    folderLinks.forEach(function (a, k) {
      a.addEventListener('pointerenter', function (e) {
        if (!mouseLike(e) || panelMQ.matches) return;
        trackMove(e); /* first, so the safe triangle includes the point that crossed into this row */
        quiet = false;
        want(k, PULL_DWELL);
      });
      a.addEventListener('focus', function () { if (!quiet && !panelMQ.matches) pull(k); });
    });
    cabinet.addEventListener('pointermove', function (e) { if (mouseLike(e)) quiet = false; });

    /* focusing the folder button opens the cabinet too (keyboard focus only, after the same delay). The button
       is out of the tab order (tabindex -1: the index tab is the keyboard's way in), so this now answers only
       a script or assistive technology that focuses it. */
    railBtn.addEventListener('focus', function () {
      if (holdFocusOpen) { holdFocusOpen = false; return; }
      if (panelMQ.matches || isOpen) return;
      var kb = true; try { kb = railBtn.matches(':focus-visible'); } catch (err) { /* older engines */ }
      if (!kb) return;
      clearTimeout(openT);
      openT = setTimeout(function () { openT = 0; if (d.activeElement === railBtn) { opener = railBtn; openCabinet('focus'); } }, OPEN_DELAY);
    });
    railBtn.addEventListener('blur', function () { holdFocusOpen = false; });

    /* the folder button, the index tab, "portfolio" on the cover and "Open the index" toggle it for click,
       keyboard and touch (the links among them point at #cabinet for pages read without the script) */
    openers.forEach(function (b) {
      b.addEventListener('click', function (e) {
        if (b.tagName === 'A') e.preventDefault();
        var kb = e.detail === 0;
        clearTimeout(openT); openT = 0;
        if (isOpen && (pinned || (b !== railBtn && b !== indexTab))) { closeCabinet(kb); return; }
        opener = b;
        openCabinet('pin', kb);
      });
    });
    d.querySelectorAll('[data-index-close]').forEach(function (b) {
      b.addEventListener('click', function (e) { closeCabinet(e.detail === 0 || within(d.activeElement)); });
    });

    /* focus leaving the rail, the index tab and the cabinet closes it, unless the pointer still holds it.
       A press on another opener ("portfolio" on the cover, "Open the index") leaves it to that opener's
       click, which toggles it; tabbing onto one of them is leaving, so it closes. */
    function focusOut(e) {
      if (!isOpen) { if (!within(e.relatedTarget)) { clearTimeout(openT); openT = 0; } return; }
      if (within(e.relatedTarget)) return;
      setTimeout(function () {
        var ae = d.activeElement;
        if (!isOpen || within(ae)) return;
        if (pointerIn) { pull(-1); return; }
        if (isOpener(ae)) { var kb = true; try { kb = ae.matches(':focus-visible'); } catch (err) { /* older engines */ } if (!kb) return; }
        closeCabinet(false);
      }, 0);
    }
    rail.addEventListener('focusout', focusOut);
    cabinet.addEventListener('focusout', focusOut);
    if (indexTab) indexTab.addEventListener('focusout', focusOut);

    /* a press anywhere else closes it */
    d.addEventListener('pointerdown', function (e) {
      if (!isOpen) return;
      var t = e.target;
      if (within(t) || openers.some(function (b) { return b.contains(t); })) return;
      closeCabinet(false);
    }, true);

    /* Find: typing filters, Up and Down step through the matches, Enter goes, Escape clears the word first */
    if (findIn) {
      findIn.addEventListener('input', function () { find(findIn.value); });
      findIn.addEventListener('focus', function () { if (!isOpen) { opener = opener || homeButton(); openCabinet('pin'); } kbFix(); });
      findIn.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); stepFound(e.key === 'ArrowDown' ? 1 : -1); }
        else if (e.key === 'Enter') { e.preventDefault(); if (found.length) goFound(found[Math.max(0, foundAt)], true); }
        else if (e.key === 'Escape' && findIn.value) { e.preventDefault(); e.stopPropagation(); findIn.value = ''; find(''); }
      });
    }

    /* Escape closes and returns focus; arrows walk the folders; Home and End jump */
    d.addEventListener('keydown', function (e) {
      if (!isOpen) return;
      var ae = d.activeElement, i = folderLinks.indexOf(ae);
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCabinet(within(ae) || isOpener(ae));
        return;
      }
      if (ae === findIn) return;
      if (i < 0 && !isOpener(ae) && !within(ae)) return;
      quiet = false;
      var n = folderLinks.length, k = -1, here = folderOf[current] || 0;
      if (e.key === 'ArrowDown') k = i < 0 ? here : (i + 1) % n;
      else if (e.key === 'ArrowUp') k = i < 0 ? here : (i - 1 + n) % n;
      else if (e.key === 'Home') k = 0;
      else if (e.key === 'End') k = n - 1;
      if (k < 0) return;
      e.preventDefault();
      folderLinks[k].focus();
      pull(k);
    });

    var mqChange = function () { closeCabinet(false); };
    if (phoneMQ.addEventListener) phoneMQ.addEventListener('change', mqChange); else phoneMQ.addListener(mqChange);
    window.addEventListener('resize', function () { if (isOpen) { place(); kbFix(); } });
    if (window.visualViewport) { window.visualViewport.addEventListener('resize', kbFix); window.visualViewport.addEventListener('scroll', kbFix); }
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

  /* the index tab names the current sheet on phones, from the same names as the rail label */
  function writeAt(i) {
    if (!indexAt) return;
    var nm = d.createElement('span'); nm.className = 'index-tab__name'; nm.textContent = ' ' + (names[i] || '');
    indexAt.textContent = ' · ' + pad(i); indexAt.appendChild(nm);
  }

  /* on phones the pill steps aside while the end row, which has its own "Open the index", is on screen
     (the CSS applies it below 900px only) */
  var endRow = d.querySelector('.end');
  if (endRow && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { html.classList.toggle('at-end', es[0].isIntersecting); }).observe(endRow);
  }

  /* ---- phones: the pill and the chrome's strip give way while the reader scrolls down. The pill comes back
     on the way up or as soon as scrolling stops; the strip only on the way up (or near the top). The
     position is clamped to the page, so iOS rubber-banding past either end never flips the direction, and
     the direction must hold for 24px before anything moves. ---- */
  var barY = 0, barAcc = 0, barIdle = 0;
  function bars() {
    if (!phoneMQ.matches) { html.classList.remove('pill-away', 'bars-away'); return; }
    var max = Math.max(0, html.scrollHeight - window.innerHeight);
    var y = Math.min(Math.max(window.pageYOffset || html.scrollTop, 0), max);
    var dy = y - barY; barY = y;
    if (!dy) return;
    if ((dy > 0) !== (barAcc > 0)) barAcc = 0;
    barAcc += dy;
    if (y < 64) html.classList.remove('pill-away', 'bars-away');
    else if (barAcc > 24) html.classList.add('pill-away', 'bars-away');
    else if (barAcc < -24) html.classList.remove('pill-away', 'bars-away');
    clearTimeout(barIdle);
    barIdle = setTimeout(function () { html.classList.remove('pill-away'); }, 650);
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

  /* ---- the project cards: each collage card links where its sheet's own "Read the analysis" or "See the
     project" link goes (read from that link, so the two never disagree), and carries the round badge. The
     card link is a pointer convenience beside that link, so it stays out of the tab order and the
     accessibility tree; the sheet's link is the keyboard's way. ---- */
  slides.forEach(function (s) {
    var more = s.querySelector('a.more[href]'), collage = s.querySelector('.collage');
    if (!more || !collage) return;
    collage.querySelectorAll('.card').forEach(function (card) {
      var a = d.createElement('a');
      a.className = 'card__link'; a.href = more.getAttribute('href'); a.tabIndex = -1; a.setAttribute('aria-hidden', 'true');
      a.innerHTML = '<span class="card__go"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#arrow"/></svg></span>';
      card.appendChild(a);
      card.classList.add('is-link');
    });
  });

  function setCurrent(i) {
    current = i;
    dots.forEach(function (a, k) { if (k === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    folders.forEach(function (f, k) {
      var here = folderSheet[k] === i;
      f.classList.toggle('is-current', here);
      if (here) folderLinks[k].setAttribute('aria-current', 'true'); else folderLinks[k].removeAttribute('aria-current');
    });
    showLabel(i);
    writeAt(i);
  }

  /* ---- 5. navigation: dots, folders, the cover's words, the name in the chrome, arrow keys, the hash ----
     A move of one sheet slides that sheet over (or off) in 380ms. A longer jump does not sweep through every
     sheet in between: it cuts to one screen before the target (after it, going back) and lets only the last
     sheet slide. The page's own scroll position moves (sticky sheets do the rest); any wheel, touch, press or
     scrolling key takes over at once. Reduced motion jumps. */
  var SLIDE_MS = 380, tween = 0, tweenTo = -1;
  function bez(x1, y1, x2, y2) {
    function a(p1, p2) { return 1 - 3 * p2 + 3 * p1; } function b(p1, p2) { return 3 * p2 - 6 * p1; } function c(p1) { return 3 * p1; }
    function at(t, p1, p2) { return ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t; }
    function slope(t, p1, p2) { return 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1); }
    return function (x) {
      var t = x;
      for (var k = 0; k < 6; k++) { var s = slope(t, x1, x2); if (!s) break; t -= (at(t, x1, x2) - x) / s; }
      return at(Math.max(0, Math.min(1, t)), y1, y2);
    };
  }
  var slideEase = bez(0.3, 0, 0.2, 1);
  function stopTween() { if (tween) { cancelAnimationFrame(tween); tween = 0; } tweenTo = -1; }
  ['wheel', 'touchstart', 'pointerdown'].forEach(function (t) { window.addEventListener(t, stopTween, { passive: true, capture: true }); });
  window.addEventListener('keydown', function (e) { if (/^(PageUp|PageDown|Home|End|ArrowUp|ArrowDown| )$/.test(e.key)) stopTween(); }, true);
  function scrollNow(y) { window.scrollTo({ top: y, left: 0, behavior: 'instant' }); }
  function slideTo(y) {
    if (tween && tweenTo === y) return; /* already on its way there */
    stopTween();
    var y0 = window.pageYOffset || html.scrollTop, dy = y - y0, t0 = 0;
    if (Math.abs(dy) < 1) return;
    tweenTo = y;
    tween = requestAnimationFrame(function step(now) {
      if (!t0) t0 = now;
      var t = Math.min(1, (now - t0) / SLIDE_MS);
      scrollNow(Math.round(y0 + dy * slideEase(t)));
      tween = t < 1 ? requestAnimationFrame(step) : 0;
      if (!tween) tweenTo = -1;
    });
  }
  /* el: a line to bring into view on sheets that scroll (phones, tall sheets), as Find does */
  function go(i, instant, el) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    var y = tops[i];
    if (el && (!stackMQ.matches || slides[i].classList.contains('is-tall'))) {
      var r = el.getBoundingClientRect(), ey = r.top + (window.pageYOffset || html.scrollTop);
      y = Math.max(tops[i], Math.min(ey - vh * 0.3, (tops[i + 1] || html.scrollHeight) - vh));
    }
    y = Math.max(0, Math.min(y, html.scrollHeight - window.innerHeight));
    if (instant || reduce) { stopTween(); scrollNow(y); return; }
    if (tween && tweenTo === y) return;
    var from = window.pageYOffset || html.scrollTop;
    if (Math.abs(y - from) > vh * 1.5) scrollNow(y > from ? Math.max(0, y - vh) : y + vh);
    slideTo(y);
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
    requestAnimationFrame(function () { if (Math.abs((window.pageYOffset || html.scrollTop) - tops[i]) > 1 && tweenTo !== tops[i]) go(i); });
  });
  d.addEventListener('keydown', function (e) {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    var inField = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
    /* "/" opens the index at its Find slip, from anywhere but a field */
    if (e.key === '/' && !inField && cabinet && findIn) {
      e.preventDefault();
      if (!isOpen) opener = d.activeElement && d.activeElement !== d.body ? d.activeElement : null;
      openCabinet('pin');
      findIn.focus();
      return;
    }
    if (e.shiftKey) return;
    if (isOpen && (within(d.activeElement) || isOpener(d.activeElement))) return;
    if (inField) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
  });

  window.addEventListener('scroll', function () { onScroll(); bars(); }, { passive: true });
  window.addEventListener('resize', measure);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', measure);
  writeAt(0);
  measure();
  /* re-measure once fonts and images have settled */
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { setTimeout(measure, 50); });
  /* the browser's own fragment jump can land after ours (and, with sticky
     sheets, in the wrong place), so correct it once more shortly after load */
  function jumpToHash() {
    /* coming back with Back or Forward, the browser restores where the reader was; the old #hash is not news */
    var nv = window.performance && performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    if (nv && nv.type === 'back_forward') return;
    var i = indexOfHash(location.hash); if (i > 0) go(i, true);
  }
  /* an address ending in #cabinet (the index links' target without the script) opens the index */
  if (location.hash === '#cabinet' && cabinet) { if (history.replaceState) history.replaceState(null, '', location.pathname); openCabinet('pin'); }
  window.addEventListener('load', function () {
    measure(); jumpToHash();
    setTimeout(function () { measure(); jumpToHash(); }, 150);
  });
  window.addEventListener('hashchange', function () { var i = indexOfHash(location.hash); if (i >= 0) go(i, true); });
})();
