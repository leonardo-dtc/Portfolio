/* ============================================================
   APP — page controller. Ported from references/repo ("Horizon"),
   without GSAP, plus the wave transitions and scramble-settle.

   Two modes over the same markup:
     panels — >=900px wide and >=620px tall: six panels stacked in
              place, one active. Wheel, arrows, number keys or the nav
              move between them. Horizon's choreography: wheel
              accumulation past 42 and a lock between moves — plus a
              per-gesture gate so trackpad momentum can never skip a
              panel. Dragging does not navigate: it collided with
              selecting text and with the entry titles.
     flow   — everything else: an ordinary vertical document. Each
              panel populates as it scrolls into view, and again every
              time it comes back.

   Load: the preloader counts 000→100 against real progress (fonts,
   window load, 1.5s floor, 4.5s cap). At 100 a circular wave leaves
   the counter — the field materialises behind it (field.js), the name
   scrambles and settles as the front passes (namecard.js), and the
   chrome fades in by distance.

   Panel change: the current panel collapses toward the pager (farthest
   pieces first — the load wave in reverse), then the next blooms
   outward from it while the field runs a pulse from the same origin.
   Every `[data-anim]` piece rises and fades; `[data-scramble]` and
   `[data-num]` text scrambles and settles, left to right; then each
   `.hl` key phrase wipes its accent box in behind the settled words.

   The status bar starts empty but for the hint. Leaving the hero once
   brings in the counter, rail, toggles and the typed prompt for good;
   the hint itself belongs to the home panel and comes back with it.

   Three display toggles, persisted per browser: [roman] swaps 00 for
   Roman figures, [block] rebuilds the numerals out of the hero's 5x7
   raster, [grad] clips the headlines to the hero's palette gradient.
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var coarse = matchMedia('(pointer:coarse)').matches;
  var hoverable = matchMedia('(hover:hover)').matches;
  var wide = matchMedia('(min-width:900px) and (min-height:620px)');
  var NBSP = ' ';
  var doc = document.documentElement, body = document.body;
  var field = window.LCField || null;
  var clamp = function (n, lo, hi) { return Math.max(lo, Math.min(hi, n)); };
  var pad2 = function (n) { return String(n).padStart(2, '0'); };
  var pad3 = function (n) { return String(n).padStart(3, '0'); };

  var panels = $$('.panel'), total = panels.length;
  var navBtns = $$('[data-nav]');
  var counterEl = $('#counter'), counterT = $('#counter-total'), railBar = $('#rail-bar'),
      themeBtn = $('#theme-toggle');
  var mode = null, index = 0, lock = 0, finished = false, flowObs = null;

  /* ---------- persisted display state ---------- */
  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {}
    return null;
  }
  var roman = ls('lc-numfmt') !== 'arabic';      // panel figures: I / V (default) vs 01 / 06
  var numArt = ls('lc-numart') === '1';          // outlined serif vs the hero's block art
  var headGrad = ls('lc-headgrad') === '1';      // flat ink vs the hero's gradient
  var csMode = ls('lc-cshover') === 'row' ? 'row' : 'text';   // what the decode answers to
  var ROMAN = ['\u2014', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  /* The big figure at the head of a panel follows the toggle; the pager in the
     bottom-left is always 00-format, so the two never have to be read together. */
  function figure(n) { return roman ? (ROMAN[n] || String(n)) : pad2(n); }
  var T = { outT: 0.42, outAnim: 260, inT: 0.75, lock: 1150, band: 140 };
  function setTotal() { if (counterT) counterT.textContent = '/ ' + pad2(total - 1); }

  /* ---------- scramble-settle ---------- */
  var MONO = '░▒▓#*+=:·', DIGITS = '0123456789';
  function textNodes(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), out = [], n;
    while ((n = w.nextNode())) {
      if (n._orig == null) n._orig = n.textContent;
      if (n._orig.trim()) out.push(n);
    }
    return out;
  }
  function restore(nodes) { nodes.forEach(function (n) { n.textContent = n._orig; }); }
  /* The scramble alphabet follows the text, so Roman numerals shuffle through
     Roman letters rather than sitting still. */
  var ROMAN_CH = 'IVXLCDM';
  function kind(el, nodes) {
    if (!el.hasAttribute('data-num')) return { chars: MONO, re: /[^\s ]/, blank: true };
    var txt = nodes.map(function (n) { return n._orig; }).join('');
    if (/[0-9]/.test(txt) || !/[IVXLCDM]/.test(txt)) return { chars: DIGITS, re: /[0-9]/, blank: false };
    return { chars: ROMAN_CH, re: /[IVXLCDM]/, blank: false };
  }
  function scrambleIn(el) {
    var nodes = textNodes(el);
    if (!nodes.length) return;
    var k = kind(el, nodes);
    var tok = el._tok = (el._tok || 0) + 1;
    var count = nodes.reduce(function (a, n) { return a + n._orig.length; }, 0);
    if (reduce) { restore(nodes); return; }
    var dur = clamp(count * 45, 700, 2000), band = k.blank ? Math.max(6, Math.round(count * 0.35)) : count;
    var t0 = performance.now(), frame = 0, rnd = [];
    (function step(now) {
      if (el._tok !== tok) return;
      var f = Math.min(1, (now - t0) / dur), settled = Math.floor(f * (count + band)) - band, refresh = frame++ % 3 === 0, i = 0;
      nodes.forEach(function (n) {
        var s = n._orig, out = '';
        for (var c = 0; c < s.length; c++, i++) {
          var ch = s.charAt(c);
          if (!k.re.test(ch) || i < settled) out += ch;
          else if (i < settled + band || !k.blank) { if (refresh || !rnd[i]) rnd[i] = k.chars.charAt((Math.random() * k.chars.length) | 0); out += rnd[i]; }
          else out += ' ';
        }
        n.textContent = out;
      });
      if (f < 1) requestAnimationFrame(step); else restore(nodes);
    })(t0);
  }
  function scrambleOut(el) {
    var nodes = textNodes(el);
    if (!nodes.length) return;
    var k = kind(el, nodes);
    var tok = el._tok = (el._tok || 0) + 1;
    var count = nodes.reduce(function (a, n) { return a + n._orig.length; }, 0);
    if (reduce) { restore(nodes); return; }
    var dur = 260, t0 = performance.now(), frame = 0, rnd = [];
    (function step(now) {
      if (el._tok !== tok) return;
      var f = Math.min(1, (now - t0) / dur), keep = Math.floor((1 - f) * count), refresh = frame++ % 2 === 0, i = 0;
      nodes.forEach(function (n) {
        var s = n._orig, out = '';
        for (var c = 0; c < s.length; c++, i++) {
          var ch = s.charAt(c);
          if (!k.re.test(ch) || i < keep) out += ch;
          else { if (refresh || !rnd[i]) rnd[i] = k.chars.charAt((Math.random() * k.chars.length) | 0); out += rnd[i]; }
        }
        n.textContent = out;
      });
      if (f < 1) requestAnimationFrame(step); else restore(nodes);
    })(t0);
  }

  /* ---------- panel population ---------- */
  /* a panel holds both its own content and, once drilled into, a sub-page; only
     the branch that is not [hidden] is on screen and printable */
  function partsOf(panel) {
    return $$('[data-anim]', panel).filter(function (el) { return !el.closest('[hidden]'); });
  }
  function scramblersOf(part) {
    var list = $$('[data-scramble],[data-num]', part);
    if (part.hasAttribute('data-scramble') || part.hasAttribute('data-num')) list.unshift(part);
    return list;
  }
  /* ---------- the two display toggles ----------
     [block] rebuilds each panel numeral out of the same 5x7 raster the hero
     name uses, clipped to the live palette gradient; sized by height, since the
     raster is 14 rows tall where the serif figure is one line. [grad] gives the
     headlines the other half of that treatment. Both follow the palette, so a
     click on the name recolours them with everything else. */
  function baseFs(el) {
    var prev = el.style.fontSize;
    el.style.fontSize = '';
    var v = parseFloat(getComputedStyle(el).fontSize) || 120;
    el.style.fontSize = prev;
    return v;
  }
  function paintNumerals() {
    var art = numArt && window.LCArt, g = art ? window.LCArt.gradient() : '';
    $$('.numeral').forEach(function (el) {
      el._tok = (el._tok || 0) + 1;                       // cancel any scramble mid-flight
      var txt = el.getAttribute('data-fig') || figure(parseInt(el.getAttribute('data-n'), 10) || 0);
      if (!art) {
        el.classList.remove('is-art');
        el.style.fontSize = ''; el.style.backgroundImage = '';
        el.textContent = txt;
        el.setAttribute('data-num', '');
        return;
      }
      /* Fill the box the serif figure would have occupied. The tall 14-row
         raster only reads where each row can carry ~8px; below that the 7-row
         variant gives every bitmap pixel twice the height, which is what keeps
         About's and Contact's smaller figures legible. */
      var box = baseFs(el) * 0.78, wide = box / 14 >= 8;
      var lines = window.LCArt.raster(txt, wide), rows = lines.split('\n').length;
      el.removeAttribute('data-num');                     // block art is not text to scramble
      el.textContent = lines;
      el.classList.add('is-art');
      el.style.fontSize = Math.max(5.5, box / rows) + 'px';
      el.style.backgroundImage = g;
    });
  }
  function paintHeadlines() {
    var g = headGrad && window.LCArt ? window.LCArt.gradient() : '';
    $$('.headline').forEach(function (h) {
      h.classList.toggle('is-grad', !!g);
      h.style.backgroundImage = g;
    });
  }
  document.addEventListener('lc:palette', function () { paintNumerals(); paintHeadlines(); });

  /* ---------- cursor-proximity character scramble ----------
     sergzorin.com's decode, but driven by the pointer instead of a clock: every
     character measures its distance to the cursor and flickers at a rate that
     falls off with it. Under the cursor the glyph changes almost every frame;
     a couple of hundred pixels out it never changes at all.

     Each character is locked to the width it had before the effect started, so
     swapping glyphs in a proportional serif can never shift the line. */
  var CS_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#*+=:%&$@/\\|<>~';
  var CS_RADIUS = 190;                 // beyond this the text is untouched
  /* A title is large serif type that people are trying to read; a link is a
     small run of mono. The title gets a shorter reach and a gentler rate so it
     shimmers rather than boils.

     `rate` is the share of frames a character under the cursor is swapped for
     another, so it is really a readability dial: at 0.9 a link spent most of
     every frame as some other word and could not be read at all. Low enough
     now that the word keeps its shape and only flickers around it. */
  var CS_TITLE = { r: 130, rate: 0.42 }, CS_LINK = { r: 190, rate: 0.3 };
  function csTune(el) {
    return el.classList.contains('entry__open') || el.classList.contains('sub__title') ? CS_TITLE : CS_LINK;
  }
  /* No decoding while a panel is printing. Held as a deadline rather than a flag
     cleared by a timer: a dropped or throttled timeout would otherwise leave the
     effect switched off for the rest of the session. */
  var csFrozenUntil = 0;
  /* the text as authored, never the scrambled DOM — a sub-page is built from
     this, so opening one mid-hover can never carry the glitch across */
  function csText(el) { return el._csText != null ? el._csText : el.textContent; }
  function csWrap(el) {
    if (el._cs) return el._cs;
    var text = el._csText = el.textContent, frag = document.createDocumentFragment(), cells = [];
    Array.prototype.forEach.call(text, function (ch) {
      if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
      var sp = document.createElement('span');
      sp.className = 'cs';
      sp.textContent = ch;
      sp._ch = ch;
      frag.appendChild(sp);
      cells.push(sp);
    });
    el.textContent = '';
    el.appendChild(frag);
    cells.forEach(function (sp) {                    // lock the width before anything moves
      sp.style.width = sp.getBoundingClientRect().width.toFixed(2) + 'px';
    });
    el._cs = cells;
    return cells;
  }
  /* is this element genuinely under the pointer (or, in row mode, its entry)? */
  function csHovered(el) {
    if (el.matches(':hover')) return true;
    if (csMode !== 'row') return false;
    var row = el.closest('.entry');
    return !!row && row.matches(':hover');
  }
  function csStop(el) {
    if (el._csRaf) { cancelAnimationFrame(el._csRaf); el._csRaf = 0; }
    if (el._cs) el._cs.forEach(function (sp) { sp.textContent = sp._ch; });
  }
  function csStart(el) {
    if (!el || Date.now() < csFrozenUntil) return;
    var cells = csWrap(el);
    if (!cells.length || el._csRaf) return;
    var boxes = cells.map(function (sp) {
      var r = sp.getBoundingClientRect();
      return { sp: sp, x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    var tune = csTune(el), first = true;
    (function frame() {
      el._csRaf = requestAnimationFrame(frame);
      /* Self-terminating: `pointerout` can be missed (a fast exit, a relayout,
         the element being hidden under the cursor), and because the effect is
         driven by distance rather than by hover state, a loop left running
         re-decodes the element every time the cursor passes near it again.
         The first pass is exempt so a hover state that has not been applied
         yet cannot kill the effect before it starts. */
      if (!first && !csHovered(el)) return csStop(el);
      first = false;
      var p = pointer;
      boxes.forEach(function (b) {
        var d = Math.hypot(b.x - p.x, b.y - p.y);
        var near = 1 - Math.min(1, d / tune.r);      // 1 under the cursor, 0 at the edge
        if (near <= 0) { b.sp.textContent = b.sp._ch; return; }
        // cubic falloff: a busy core, a calm edge
        if (Math.random() < near * near * near * tune.rate) b.sp.textContent = CS_CHARS.charAt((Math.random() * CS_CHARS.length) | 0);
        else b.sp.textContent = b.sp._ch;
      });
    })();
  }
  var pointer = { x: -9999, y: -9999 };
  /* `text` decodes only while the pointer is on the words themselves; `row`
     decodes the title from anywhere in its entry. A sub-page title and any link
     always answer to their own hover, under either setting. */
  var CS_ALWAYS = '.sub__title, .links a, .entry__body a, .entry__more a, .sub__body a, .link, .contact__v a';
  function csTargets(e) {
    var out = [], t = e.target.closest && e.target.closest(CS_ALWAYS + ', .entry__open');
    if (t) out.push(t);
    if (csMode === 'row') {
      var row = e.target.closest && e.target.closest('.entry');
      if (row) { var title = $('.entry__open', row); if (title && out.indexOf(title) < 0) out.push(title); }
    }
    return out;
  }
  function wireScramblers() {
    if (coarse || reduce || !hoverable) return;
    addEventListener('pointermove', function (e) { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
    document.addEventListener('pointerover', function (e) { csTargets(e).forEach(csStart); });
    document.addEventListener('pointerout', function (e) {
      csTargets(e).forEach(function (t) {
        var into = e.relatedTarget;
        if (t.contains(into)) return;                                  // still inside the words
        if (csMode === 'row' && into && into.closest && into.closest('.entry') === t.closest('.entry')) return;
        csStop(t);
      });
    });
  }

  /* ---------- key-phrase highlights ----------
     The box is wiped in behind each phrase once its line has arrived, so the
     words settle first and the accent follows them. */
  function litOf(part) {
    var list = $$('.hl', part);
    if (part.classList.contains('hl')) list.unshift(part);
    return list;
  }
  function light(list, on) { list.forEach(function (h) { h.classList.toggle('is-lit', on); }); }

  function center(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function origin() {
    var r = counterEl ? counterEl.getBoundingClientRect() : null;
    return r && (r.width || r.height) ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: 40, y: innerHeight - 40 };
  }
  function farthest(o) { return Math.hypot(Math.max(o.x, innerWidth - o.x), Math.max(o.y, innerHeight - o.y)); }
  function bump(panel) { panel._tok = (panel._tok || 0) + 1; return panel._tok; }
  function wave(name, o, speed) {
    document.dispatchEvent(new CustomEvent(name, { detail: { ox: o.x, oy: o.y, t0: performance.now(), speed: speed, band: T.band } }));
  }

  function settle(list) {
    list.forEach(function (t) { t._tok = (t._tok || 0) + 1; restore(textNodes(t)); });
  }

  /* ---------- the transition off the hero: a typed command, then the buffer prints ----------
     The hero keeps the circular glyph wave. Everywhere else the prompt in the
     corner types the command that got you here, and the panel prints as its
     answer: each block wipes in left to right behind a block caret while its
     labels and figures scramble and settle. Command first, content second — the
     causality is the whole point, so the print never starts until the line is
     typed and a beat has passed. */
  var cmdTok = 0;
  var cmdEl = $('#sbar-cmd'), pwdEl = $('#sbar-pwd'), caretEl = $('#print-caret');
  var PRINT = { dur: 360, step: 58, outDur: 190, outStep: 26, key: 22, beat: 130 };

  /* document order is two columns on a chapter panel; print in reading order */
  function printOrder(panel) {
    return partsOf(panel).map(function (el) {
      var r = el.getBoundingClientRect();
      return { el: el, top: r.top, left: r.left, last: el.hasAttribute('data-last') ? 1 : 0 };
    }).sort(function (a, b) {
      if (a.last !== b.last) return a.last - b.last;          // the way out prints after the page
      return Math.abs(a.top - b.top) > 18 ? a.top - b.top : a.left - b.left;
    }).map(function (o) { return o.el; });
  }
  function typeCmd(text, pwd, after) {
    var tok = ++cmdTok;
    if (!cmdEl || reduce) { if (cmdEl) cmdEl.textContent = ''; if (pwdEl && pwd) pwdEl.textContent = pwd; return after(); }
    var i = 0;
    /* on the first move off the hero the host line is still typing itself; a
       command may not start landing in the middle of it */
    (function ready() {
      if (cmdTok !== tok) return;
      if (hostEl && hostEl.textContent !== HOST) return setTimeout(ready, 40);
      step();
    })();
    function step() {
      if (cmdTok !== tok) return;
      cmdEl.textContent = text.slice(0, i++);
      if (i <= text.length) return setTimeout(step, PRINT.key);
      setTimeout(function () {                      // the shell answers: pwd moves, the line clears
        if (cmdTok !== tok) return;
        cmdEl.textContent = '';
        if (pwdEl && pwd) pwdEl.textContent = pwd;
        after();
      }, PRINT.beat);
    }
  }
  /* the block caret that runs ahead of the text being printed */
  function runCaret(panel, order, tok) {
    if (!caretEl || reduce) return;
    caretEl.style.opacity = '1';
    order.forEach(function (el, i) {
      setTimeout(function () {
        if (panel._tok !== tok) return;
        var r = el.getBoundingClientRect();
        caretEl.style.top = Math.round(r.top + 2) + 'px';
        caretEl.style.height = Math.min(20, Math.max(10, r.height)) + 'px';
        caretEl.animate([{ left: Math.round(r.left) + 'px' },
                         { left: Math.round(r.left + Math.min(r.width, 460)) + 'px' }],
                        { duration: PRINT.dur, easing: 'steps(20)', fill: 'forwards' });
      }, i * PRINT.step);
    });
    setTimeout(function () { caretEl.style.opacity = '0'; }, order.length * PRINT.step + PRINT.dur);
  }
  function clip(el, from, to, dur, done) {
    var a = el.animate([{ clipPath: from }, { clipPath: to }],
                       { duration: dur, easing: 'steps(20)', fill: 'forwards' });
    a.onfinish = function () { a.cancel(); el.style.clipPath = to === OPEN ? '' : to; if (done) done(); };
    return a;
  }
  var OPEN = 'inset(0 0 0 0)', SHUT = 'inset(0 100% 0 0)';

  function printIn(panel, tok, cmd, pwd) {
    var order = printOrder(panel);
    panel._printAt = Date.now();
    panel.classList.add('is-print');
    order.forEach(function (el) {                   // hide everything before a single frame paints
      el.classList.remove('is-out', 'is-pre'); el.classList.add('is-in');
      el.style.transitionDelay = '0ms';
      el.style.clipPath = reduce ? '' : SHUT;
    });
    function start() {
      if (panel._tok !== tok) return;
      order.forEach(function (el, i) {
        var delay = reduce ? 0 : i * PRINT.step;
        setTimeout(function () {
          if (panel._tok !== tok) return;
          if (!reduce) clip(el, SHUT, OPEN, PRINT.dur);
          var sc = scramblersOf(el);
          if (sc.length) { if (reduce) settle(sc); else sc.forEach(scrambleIn); }
          var hl = litOf(el);
          if (hl.length) setTimeout(function () { if (panel._tok === tok) light(hl, true); }, reduce ? 0 : 430);
        }, delay);
      });
      runCaret(panel, order, tok);
      csFrozenUntil = Date.now() + order.length * PRINT.step + PRINT.dur;
    }
    if (cmd) typeCmd(cmd, pwd, start); else start();
  }
  function printOut(panel, tok) {
    csFrozenUntil = Date.now() + 4000;              // a ceiling; printIn sets the real one
    $$('.entry__open, .sub__title, a', panel).forEach(csStop);
    var order = printOrder(panel).reverse();
    order.forEach(function (el, i) {
      light(litOf(el), false);
      setTimeout(function () {
        if (panel._tok !== tok) return;
        if (!reduce) clip(el, OPEN, SHUT, PRINT.outDur);
      }, reduce ? 0 : i * PRINT.outStep);
    });
    return (reduce ? 0 : order.length * PRINT.outStep + PRINT.outDur);
  }
  /* A print that gets interrupted leaves its parts clipped shut with nothing
     left to open them: a tab hidden mid-transition has its timers throttled
     to a crawl, a resize can flip the mode under it, an animation can be
     cancelled before its onfinish runs. The result is a panel that is active
     and empty. So: if the active panel has parts still shut long after its
     print began, and nothing is animating them, open them. Checked on the
     events that cause it and on a slow tick, since the cause is not always
     an event this page sees. */
  var HEAL_AFTER = 4000;
  function heal() {
    var panel = panels[index];
    if (!panel || !panel.classList.contains('is-active') || !panel._printAt) return;
    if (Date.now() - panel._printAt < HEAL_AFTER) return;
    var shut = partsOf(panel).filter(function (el) {
      var cp = el.style.clipPath;
      if (!cp || cp === OPEN) return false;
      return !(el.getAnimations && el.getAnimations().length);
    });
    if (!shut.length) return;
    shut.forEach(function (el) {
      el.style.clipPath = '';
      el.classList.remove('is-pre', 'is-out'); el.classList.add('is-in');
      settle(scramblersOf(el));
      light(litOf(el), true);
    });
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) setTimeout(heal, 300); });
  setInterval(heal, 2500);

  function clearPrint(panel) {
    panel.classList.remove('is-print');
    partsOf(panel).forEach(function (el) { el.style.clipPath = ''; });
  }
  function animateIn(panel, o, opts) {
    opts = opts || {};
    var tok = bump(panel), far = farthest(o), speed = opts.speed || far / T.inT;
    var hero = panel.id === 'intro';            // the glyph wave belongs to the hero only
    panel.classList.add('is-active');
    panel.scrollTop = 0;                        // a list taller than the window starts at its top
    if (!hero) return printIn(panel, tok, opts.cmd, opts.pwd);
    clearPrint(panel);
    partsOf(panel).forEach(function (el) {
      var c = center(el), delay = reduce ? 0 : Math.hypot(c.x - o.x, c.y - o.y) / speed * 1000;
      el.classList.remove('is-in', 'is-out'); el.classList.add('is-pre'); el.style.transitionDelay = '0ms';
      void el.offsetWidth;
      el.style.transitionDelay = Math.round(delay) + 'ms';
      el.classList.remove('is-pre'); el.classList.add('is-in');
      var sc = scramblersOf(el);
      if (sc.length) {
        if (hero) setTimeout(function () { if (panel._tok !== tok) return; sc.forEach(scrambleIn); }, delay);
        else settle(sc);
      }
      var hl = litOf(el);
      if (hl.length) setTimeout(function () { if (panel._tok !== tok) return; light(hl, true); }, delay + (reduce ? 0 : 520));
    });
    if (hero) wave('lc:wave', o, speed);
  }
  function animateOut(panel, o) {
    var tok = bump(panel), far = farthest(o), speed = far / T.outT;
    var hero = panel.id === 'intro';
    if (!hero) {
      var ms = printOut(panel, tok);
      setTimeout(function () {
        if (panel._tok !== tok) return;
        panel.classList.remove('is-active'); clearPrint(panel); resetSub(panel);
      }, ms + 40);
      return ms;
    }
    partsOf(panel).forEach(function (el) {
      var c = center(el), delay = reduce ? 0 : (far - Math.hypot(c.x - o.x, c.y - o.y)) / speed * 1000;
      el.style.transitionDelay = Math.round(delay) + 'ms';
      el.classList.remove('is-in', 'is-pre'); el.classList.add('is-out');
      light(litOf(el), false);
      var sc = scramblersOf(el);
      if (sc.length && hero) setTimeout(function () { if (panel._tok !== tok) return; sc.forEach(scrambleOut); }, delay);
    });
    if (hero) wave('lc:wave-out', o, speed);
    setTimeout(function () { if (panel._tok !== tok) return; panel.classList.remove('is-active'); }, reduce ? 0 : T.outT * 1000 + T.outAnim);
  }
  /* ---------- back to the hero: the wave wipes the slate ----------
     Going home does not unprint the panel it leaves. The hero's circular wave
     runs out from the corner as it always has, and the leaving panel's parts
     are taken off the moment the front reaches them, each at its own
     distance, while the hero's parts come in behind the same front: one
     wiper, one pass, and the slate is clean. */
  function wipeOut(panel, o, speed) {
    var tok = bump(panel), far = farthest(o);
    csFrozenUntil = Date.now() + 2000;
    $$('.entry__open, .sub__title, a', panel).forEach(csStop);
    panel.classList.remove('is-print');            // the print's own opacity rule would hold the parts open
    partsOf(panel).forEach(function (el) {
      var c = center(el), delay = reduce ? 0 : Math.hypot(c.x - o.x, c.y - o.y) / speed * 1000;
      setTimeout(function () {
        if (panel._tok !== tok) return;
        light(litOf(el), false);
        el.style.transitionDelay = '0ms';
        el.style.clipPath = '';
        el.classList.remove('is-in', 'is-out'); el.classList.add('is-pre');   // gone at once: is-pre carries no transition
      }, delay);
    });
    setTimeout(function () {
      if (panel._tok !== tok) return;
      panel.classList.remove('is-active'); clearPrint(panel); resetSub(panel);
    }, reduce ? 0 : far / speed * 1000 + 60);
  }
  function showInstant(panel) {
    bump(panel);
    panel.classList.add('is-active');
    panel.scrollTop = 0;
    panel.classList.remove('is-print');
    partsOf(panel).forEach(function (el) {
      el.style.transitionDelay = '0ms';
      el.classList.remove('is-pre', 'is-out'); el.classList.add('is-in');
      el.style.clipPath = '';
      light(litOf(el), true);
      scramblersOf(el).forEach(function (s) { s._tok = (s._tok || 0) + 1; restore(textNodes(s)); });
    });
  }
  function hideParts(panel) {
    bump(panel);
    panel.classList.remove('is-print');
    partsOf(panel).forEach(function (el) {
      el.style.transitionDelay = '0ms';
      el.classList.remove('is-in', 'is-out'); el.classList.add('is-pre');
      el.style.clipPath = '';
      light(litOf(el), false);
    });
  }

  /* ---------- a subsection is its own page ----------
     Clicking an entry deloads the panel, swaps its content for a page built from
     that entry, and prints it back in under `cat <slug>.md`. The prompt's pwd
     carries the depth; `back`, Escape or leaving the panel unwinds it. */
  var subOf = null;
  /* the field picks its background art from this: a subsection may have its own
     picture, and falls back to the panel's when it does not */
  function announceSub(panel, slug) {
    document.dispatchEvent(new CustomEvent('lc:sub', {
      detail: { sect: panel.dataset.sect || null, slug: slug || null }
    }));
  }
  function subPage(panel) {
    var sub = $('.subpage', panel);
    if (!sub) { sub = document.createElement('div'); sub.className = 'subpage'; sub.hidden = true; panel.appendChild(sub); }
    return sub;
  }
  function buildSub(panel, entry, slug) {
    var sub = subPage(panel);
    var pIdx = panels.indexOf(panel), eIdx = $$('.entry', panel).indexOf(entry) + 1;
    var title = csText($('.entry__open', entry)).trim();
    var meta = $('.entry__meta', entry), body = $('.entry__body', entry), more = $('.entry__more', entry);
    sub.innerHTML = '';

    var back = document.createElement('button');
    back.type = 'button'; back.className = 'sub__back';
    back.setAttribute('data-back', ''); back.setAttribute('data-anim', ''); back.setAttribute('data-last', '');
    back.setAttribute('aria-label', 'Back to ' + (panel.dataset.sect || 'the list'));
    back.innerHTML = '<span class="sub__back__p">$</span> cd&nbsp;.. <span class="sub__back__c"></span>';
    sub.appendChild(back);

    var mark = document.createElement('div');
    mark.className = 'lead-mark';
    mark.innerHTML = '<p class="numeral numeral--sm" data-anim data-num data-n="' + pIdx +
      '" data-fig="' + figure(pIdx) + '.' + figure(eIdx) + '" aria-hidden="true"></p>' +
      '<p class="eyebrow" data-anim data-scramble>' + slug.replace(/-/g, ' ') + '</p>';
    sub.appendChild(mark);

    var h = document.createElement('h2');
    h.className = 'sub__title'; h.setAttribute('data-anim', ''); h.textContent = title;
    sub.appendChild(h);

    if (meta) {
      var m = document.createElement('p');
      m.className = 'entry__meta'; m.setAttribute('data-anim', ''); m.setAttribute('data-scramble', '');
      m.innerHTML = meta.innerHTML;
      sub.appendChild(m);
    }
    var wrap = document.createElement('div');
    wrap.className = 'sub__body'; wrap.setAttribute('data-anim', '');
    if (body) wrap.innerHTML += '<p class="sub__lede">' + body.innerHTML + '</p>';
    if (more) wrap.innerHTML += more.innerHTML;
    sub.appendChild(wrap);
    $$('[data-scramble],[data-num]', sub).forEach(function (el) { textNodes(el); });
    paintNumerals();
    return sub;
  }
  function swap(panel, toSub, entry, slug) {
    if (panel._busy) return;
    panel._busy = true;
    var tok = bump(panel), ms = printOut(panel, tok);
    setTimeout(function () {
      if (panel._tok !== tok) { panel._busy = false; return; }
      if (toSub) buildSub(panel, entry, slug);
      var side = $('.chapter__side', panel), list = $('.entries', panel), sub = subPage(panel);
      if (side) side.hidden = toSub;
      if (list) list.hidden = toSub;
      sub.hidden = !toSub;
      subOf = toSub ? entry : null;
      panel.classList.toggle('is-sub', toSub);
      panel.scrollTop = 0;                                 // a page opens at its top, where `cd ..` is
      panel._busy = false;
      announceSub(panel, toSub ? slug : null);
      var tok2 = bump(panel);
      printIn(panel, tok2,
        toSub ? 'cat ' + slug + '.md' : 'cd ..',
        '~/' + panel.dataset.sect + (toSub ? '/' + slug : ''));
    }, ms + 40);
  }
  function drill(entry) {
    var panel = entry.closest('.panel'), btn = $('.entry__open', entry);
    swap(panel, true, entry, btn.getAttribute('data-slug') || 'detail');
  }
  function undrill() { if (subOf) swap(subOf.closest('.panel'), false); }
  /* leaving the panel entirely: unwind with no ceremony */
  function resetSub(panel) {
    if (!subOf || subOf.closest('.panel') !== panel) return;
    var side = $('.chapter__side', panel), list = $('.entries', panel), sub = $('.subpage', panel);
    if (side) side.hidden = false;
    if (list) list.hidden = false;
    if (sub) sub.hidden = true;
    panel.classList.remove('is-sub');
    subOf = null;
    announceSub(panel, null);
  }
  function wireEntries() {
    $$('.entry__open').forEach(function (btn) {
      btn.removeAttribute('aria-expanded');
      btn.removeAttribute('aria-controls');
      btn.addEventListener('click', function () { drill(btn.closest('.entry')); });
    });
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-back]')) { e.preventDefault(); undrill(); }
    });
  }

  /* ---------- preloader: 000 → 100 against real progress ---------- */
  /* the boot log: one line per real milestone, printed when it actually lands */
  function bootLine(label, note) {
    var log = $('#boot-log');
    if (!log) return;
    var li = document.createElement('li');
    li.innerHTML = '<b>[ ok ]</b> <i>' + label + '</i>' + (note ? ' <span class="dots">' + note + '</span>' : '');
    log.appendChild(li);
    void li.offsetWidth;                 // a forced reflow arms the transition without waiting on a frame
    li.classList.add('is-in');
  }
  function typeBoot(after) {
    var t = $('#boot-typed');
    if (!t) return after && after();
    var str = './portfolio --verbose';
    if (reduce) { t.textContent = str; return after && after(); }
    var i = 0;
    (function step() {
      t.textContent = str.slice(0, i++);
      if (i <= str.length) return setTimeout(step, 38);
      if (after) setTimeout(after, 160);
    })();
  }

  function runLoader() {
    var pre = $('#preloader'), num = $('#pct');
    if (!pre || !num) return finish();
    var start = performance.now(), MIN = reduce ? 150 : 1500, MAX = 4500;
    var parts = { fonts: 0, load: document.readyState === 'complete' ? 1 : 0, field: field ? 1 : 0 };
    var faces = ['400 1em "Bodoni Moda"', 'italic 400 1em "Bodoni Moda"', '400 1em "JetBrains Mono"', 'italic 400 1em "JetBrains Mono"'];
    var done = 0, said = {};
    var report = function (k, label, note) { if (said[k]) return; said[k] = 1; bootLine(label, note); };
    typeBoot(function () { if (field) report('field', 'field', 'ascii · 30fps'); });
    if (document.fonts && document.fonts.load) {
      faces.forEach(function (f) {
        document.fonts.load(f).catch(function () {}).then(function () {
          done++; parts.fonts = Math.max(parts.fonts, done / faces.length);
          if (done === 2) report('f1', 'typeface', 'bodoni moda');
          if (done === faces.length) report('f2', 'typeface', 'jetbrains mono');
        });
      });
      document.fonts.ready.then(function () { parts.fonts = 1; });
    } else parts.fonts = 1;
    addEventListener('load', function () { parts.load = 1; report('doc', 'document', panels.length + ' panels'); });
    var shown = 0;
    (function tick(now) {
      if (finished) return;
      var el = now - start;
      var target = Math.min(1, parts.fonts * 0.55 + parts.load * 0.25 + parts.field * 0.2);
      var goal = Math.min(target, el / MIN);
      if (el > MAX) goal = 1;
      shown += (goal - shown) * 0.12;
      if (goal >= 1 && shown > 0.992) shown = 1;
      num.textContent = pad3(Math.round(shown * 100));
      if (shown >= 1) { report('go', 'ready', 'entering'); return finish(); }
      requestAnimationFrame(tick);
    })(start);
  }

  /* the curtain: a wave from the counter, or a plain show under reduced motion */
  function finish() {
    if (finished) return; finished = true;
    var pre = $('#preloader'), num = $('#pct'), o = null, speed = 0;
    if (!reduce) {
      var r = num ? num.getBoundingClientRect() : null;
      o = { x: r ? r.left + r.width / 2 : innerWidth / 2, y: r ? r.top + r.height / 2 : innerHeight / 2 };
      speed = Math.hypot(innerWidth, innerHeight) / 1.5;
    }
    if (pre) { pre.classList.add('is-done'); setTimeout(function () { pre.hidden = true; }, 500); }
    body.classList.remove('is-loading');
    if (o) {
      if (field) field.reveal({ ox: o.x, oy: o.y, t0: performance.now() + 80, speed: speed, band: 160 });
      chromeIn(o, speed);
      if (mode === 'panels') animateIn(panels[index], o, { speed: speed });
      else panels.forEach(function (p) { if (p._shown) animateIn(p, o, { speed: speed }); });
    } else {
      if (field) field.show();
      chromeIn(null, 0);
      if (mode === 'panels') showInstant(panels[index]); else panels.forEach(function (p) { if (p._shown) showInstant(p); });
      document.dispatchEvent(new CustomEvent('lc:show'));
    }
    barState();
  }
  function chromeIn(o, speed) {
    $$('[data-wave]').forEach(function (el) {
      var delay = 0;
      if (o) { var c = center(el); delay = Math.hypot(c.x - o.x, c.y - o.y) / speed * 1000 + 120; }
      el.style.transitionDelay = Math.round(delay) + 'ms';
      el.classList.add('is-in');
    });
  }

  /* ---------- mode ---------- */
  function setMode() {
    var next = wide.matches ? 'panels' : 'flow';
    if (next === mode) return;
    if (next === 'panels') setPanels(); else setFlow();
  }
  function setPanels() {
    mode = 'panels';
    if (flowObs) { flowObs.disconnect(); flowObs = null; }
    body.classList.add('mode-panels');
    scrollTo(0, 0);
    panels.forEach(function (p, k) {
      if (k === index) { if (finished) showInstant(p); else { p.classList.add('is-active'); hideParts(p); } }
      else { p.classList.remove('is-active'); hideParts(p); }
    });
    if (finished) document.dispatchEvent(new CustomEvent('lc:show'));
    chrome(index);
  }
  function flowOrigin() { return { x: 40, y: innerHeight - 40 }; }
  function setFlow() {
    var from = index;
    mode = 'flow';
    body.classList.remove('mode-panels');
    panels.forEach(function (p) { p.classList.remove('is-active'); p._shown = false; if (finished) hideParts(p); });
    if (finished) document.dispatchEvent(new CustomEvent('lc:show'));
    flowObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var p = e.target;
        if (e.isIntersecting) { if (!p._shown) { p._shown = true; if (finished) animateIn(p, flowOrigin()); } }
        else if (p._shown) { p._shown = false; hideParts(p); }
      });
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0.1 });
    panels.forEach(function (p) { flowObs.observe(p); });
    if (from > 0) panels[from].scrollIntoView({ block: 'start' });
    chrome(index);
    onScroll();
  }

  /* ---------- navigation ---------- */
  function go(n, force) {
    var i = clamp(n, 0, total - 1);
    if (mode !== 'panels') {
      panels[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      chrome(i);
      return;
    }
    if (i === index) return;
    if (!force && Date.now() < lock) return;
    var from = index;
    index = i;
    lock = Date.now() + T.lock;
    var o = origin();
    if (panels[i].id === 'intro') {                // home: no unprinting; the wave wipes the old page as it brings the hero in
      var speed = farthest(o) / T.inT;
      wipeOut(panels[from], o, speed);
      animateIn(panels[i], o, cmdFor(i));
      if (field) field.pulse({ ox: o.x, oy: o.y, speed: speed, band: T.band });
      chrome(i);
      return;
    }
    var wait = animateOut(panels[from], o);
    if (typeof wait !== 'number') wait = reduce ? 0 : Math.round(T.outT * 1000 * 0.55 + 60);
    setTimeout(function () {
      if (index !== i) return;
      animateIn(panels[i], o, cmdFor(i));
      if (field && panels[i].id === 'intro') field.pulse({ ox: o.x, oy: o.y, speed: farthest(o) / T.inT, band: T.band });
    }, wait);
    chrome(i);
  }
  /* the line the prompt types on the way into a panel */
  function cmdFor(i) {
    var sect = panels[i].dataset.sect || pad2(i);
    if (panels[i].id === 'intro' || mode !== 'panels') return {};
    return { cmd: 'cd ./' + sect, pwd: '~/' + sect };
  }
  function chrome(i) {
    index = i;
    navBtns.forEach(function (b) { b.setAttribute('aria-current', String(!b.hasAttribute('data-quiet') && parseInt(b.dataset.nav, 10) === i)); });
    if (counterEl && counterEl.textContent !== pad2(i)) { counterEl.textContent = pad2(i); scrambleIn(counterEl); }
    barState(i);
    if (mode !== 'flow') setRail(total > 1 ? i / (total - 1) : 0);
    if (field) field.setDim(i !== 0);
    document.dispatchEvent(new CustomEvent('lc:panel', { detail: { index: i, sect: panels[i].dataset.sect || pad2(i) } }));
  }
  function setRail(p) { if (railBar) railBar.style.transform = 'scaleX(' + p + ')'; }

  /* ---------- flow mode: active panel + rail from the scroll ---------- */
  function onScroll() {
    if (mode !== 'flow') return;
    var mid = scrollY + innerHeight * 0.5, p = 0;
    for (var i = 0; i < total; i++) {
      var top = panels[i].offsetTop, h = panels[i].offsetHeight || 1;
      if (mid >= top && mid < top + h) { p = i + (mid - top) / h; break; }
      if (mid >= top + h) p = i + 1;
    }
    var active = clamp(Math.floor(clamp(p, 0, total - 1)), 0, total - 1);
    if (active !== index) chrome(active);
    var scrollable = doc.scrollHeight - innerHeight;
    setRail(scrollable > 0 ? clamp(scrollY / scrollable, 0, 1) : 0);
  }

  /* ---------- theme ---------- */
  function theme() { return doc.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }
  function setTheme(t) {
    if (t === 'light') doc.setAttribute('data-theme', 'light'); else doc.removeAttribute('data-theme');
    if (themeBtn) themeBtn.textContent = t === 'light' ? '[dark]' : '[light]';
    try { localStorage.setItem('lc-theme', t); } catch (e) {}
    document.dispatchEvent(new CustomEvent('lc:theme', { detail: { theme: t } }));
  }

  /* ---------- input ---------- */
  function typing(e) {
    var t = e.target, tag = t && t.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable);
  }
  function overUi(e) { return !!(e.target.closest && e.target.closest('.tuner, .lc-note')); }
  function wireInput() {
    navBtns.forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); go(parseInt(b.dataset.nav, 10)); });
    });
    document.addEventListener('lc:goto', function (e) { go(e.detail.index, true); });

    addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey || typing(e)) return;
      var k = e.key;
      if (k === 'Escape' && subOf) { e.preventDefault(); return undrill(); }
      if (/^[1-9]$/.test(k) && parseInt(k, 10) <= total) { e.preventDefault(); return go(parseInt(k, 10) - 1); }
      if (k === 'Home') { e.preventDefault(); return go(0); }
      if (k === 'End') { e.preventDefault(); return go(total - 1); }
      if (mode !== 'panels') return;                     // flow mode scrolls natively
      /* a panel taller than the window scrolls by the keys that scroll a page,
         a screen at a time, and turns only once it has reached its end */
      if (k === 'ArrowDown' || k === 'PageDown' || k === ' ') { e.preventDefault(); return scrollRoom(1) > 2 ? scrollPanel(1) : go(index + 1); }
      if (k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); return scrollRoom(-1) > 2 ? scrollPanel(-1) : go(index - 1); }
      if (k === 'ArrowRight') { e.preventDefault(); return go(index + 1); }
      if (k === 'ArrowLeft') { e.preventDefault(); return go(index - 1); }
    });

    /* how far the active panel can still scroll the way asked (it is its own
       scroll container in panel mode, with the bar hidden), and a scroll of
       most of a screen that way */
    function scrollRoom(dir) {
      var panel = panels[index];
      if (!panel || panel.scrollHeight <= panel.clientHeight + 2) return 0;
      return dir > 0 ? panel.scrollHeight - panel.clientHeight - panel.scrollTop : panel.scrollTop;
    }
    function scrollPanel(dir) {
      var panel = panels[index];
      panel.scrollBy({ top: dir * panel.clientHeight * 0.8, behavior: reduce ? 'auto' : 'smooth' });
    }
    /* one move per gesture: a trackpad's momentum tail keeps `armed` down until the deltas stop */
    var wheelLast = 0, armed = true, acc = 0;
    addEventListener('wheel', function (e) {
      if (mode !== 'panels' || overUi(e) || subOf) return;   // inside a subsection the wheel scrolls it, not the site
      var now = Date.now();
      if (now - wheelLast > 260) { armed = true; acc = 0; }
      wheelLast = now;
      var vert = Math.abs(e.deltaY) >= Math.abs(e.deltaX), d = vert ? e.deltaY : e.deltaX;
      /* a list taller than the window scrolls first, natively, and the page
         turns only from its end and only on a fresh gesture: the one that
         brought the list to its end is spent, so it cannot run on into the
         next panel */
      if (vert && scrollRoom(d > 0 ? 1 : -1) > 2) { armed = false; acc = 0; return; }
      if (!armed || now < lock) return;
      acc += d;
      if (Math.abs(acc) > 42) { var dir = acc > 0 ? 1 : -1; armed = false; acc = 0; go(index + dir); }
    }, { passive: true });

    var queued = false;
    addEventListener('scroll', function () {
      if (mode !== 'flow' || queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; onScroll(); });
    }, { passive: true });

    var timer = 0;
    addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        setMode();
        if (numArt) paintNumerals();
        $$('.entry__open, .sub__title').forEach(function (el) { csStop(el); el._cs = null; el.textContent = el.textContent; });
        setTimeout(heal, 600);
      }, 150);
    });
    if (wide.addEventListener) wide.addEventListener('change', setMode);

    var fmtBtn = $('#num-format');
    if (fmtBtn) fmtBtn.addEventListener('click', function () {
      roman = !roman; ls('lc-numfmt', roman ? 'roman' : 'arabic');
      setTotal(); paintNumerals(); labels();
      if (counterEl) counterEl.textContent = figure(index);
      reScramble();
    });
    var artBtn = $('#num-style');
    if (artBtn) artBtn.addEventListener('click', function () {
      numArt = !numArt; ls('lc-numart', numArt ? '1' : '0');
      paintNumerals(); labels(); reScramble();
    });
    var headBtn = $('#head-style');
    if (headBtn) headBtn.addEventListener('click', function () {
      headGrad = !headGrad; ls('lc-headgrad', headGrad ? '1' : '0');
      paintHeadlines(); labels();
    });

    var csBtn = $('#cs-hover');
    if (csBtn) csBtn.addEventListener('click', function () {
      csMode = csMode === 'row' ? 'text' : 'row';
      ls('lc-cshover', csMode);
      $$('.entry__open').forEach(csStop);
      labels();
    });

    var tune = $('#tune-toggle');
    if (tune) tune.addEventListener('click', function () { document.dispatchEvent(new CustomEvent('lc:tuner')); });
    /* [hide] blanks everything but the field, so a picture can be looked at
       without the text over it; the button stays, and Escape also brings the
       page back. A development aid. */
    var bare = $('#ui-toggle');
    function setBare(on) {
      document.documentElement.classList.toggle('is-bare', on);
      if (bare) bare.textContent = on ? '[show]' : '[hide]';
    }
    if (bare) bare.addEventListener('click', function () { setBare(!document.documentElement.classList.contains('is-bare')); });
    /* the caption under the picture: each picture names itself in a sentence
       when it registers, and the field says which one is up */
    var cap = $('#bare-caption');
    document.addEventListener('lc:art', function (e) { if (cap) cap.textContent = (e.detail && e.detail.caption) || ''; });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.documentElement.classList.contains('is-bare')) setBare(false); });
    if (themeBtn) {
      themeBtn.textContent = theme() === 'light' ? '[dark]' : '[light]';
      themeBtn.addEventListener('click', function () { setTheme(theme() === 'light' ? 'dark' : 'light'); });
    }
  }

  /* ---------- status bar ----------
     Nothing but the hint is there to begin with: the counter, rail, toggles and
     prompt arrive the first time the reader leaves the hero, and stay. The hint
     belongs to the home panel and returns whenever the hero does. */
  var HOST = 'leonardo@carvalho';
  var hostEl = $('#sbar-host'), hostTyped = false, hostTok = 0;
  function typeHost() {
    if (!hostEl || hostTyped) return;
    hostTyped = true;
    var tok = ++hostTok;
    var s = HOST;
    if (reduce) { hostEl.textContent = s; return; }
    var i = 0;
    (function step() {
      if (hostTok !== tok) return;
      hostEl.textContent = s.slice(0, i++);
      if (i <= s.length) setTimeout(step, 30);
    })();
  }
  /* On the hero only the toggles and the centred hint are up. Leaving it brings
     the pager, the centred rail and the prompt in on the load wave's timing, and
     retypes the host line; coming back takes them away again. */
  function barState(i) {
    if (!finished) return;
    var home = (i === undefined ? index : i) === 0;
    body.classList.toggle('hint-on', home);
    if (home) {
      body.classList.remove('bar-on'); hostTyped = false;
      if (hostEl) hostEl.textContent = '';
      if (cmdEl) cmdEl.textContent = ''; if (pwdEl) pwdEl.textContent = '~';
      return;
    }
    if (body.classList.contains('bar-on')) return;
    body.classList.add('bar-on');
    setTimeout(typeHost, reduce ? 0 : 340);
  }

  /* ---------- toggle labels: each button names what clicking it does ---------- */
  function labels() {
    var f = $('#num-format'), n = $('#num-style'), h = $('#head-style');
    if (f) f.textContent = roman ? '[00]' : '[roman]';
    if (n) n.textContent = numArt ? '[stroke]' : '[block]';
    if (h) h.textContent = headGrad ? '[flat]' : '[grad]';
    var cs = $('#cs-hover');
    if (cs) cs.textContent = csMode === 'row' ? '[text]' : '[row]';
  }
  /* settle the figures again so a toggle reads as a change, not a swap */
  function reScramble() {
    if (counterEl) scrambleIn(counterEl);
    if (numArt) return;                                   // block art has no text to settle
    $$(mode === 'panels' ? '.panel.is-active .numeral' : '.numeral').forEach(scrambleIn);
  }

  /* ---------- ring cursor (Horizon) ---------- */
  function wireCursor() {
    var cur = $('#cursor'), dot = $('#cursorDot');
    if (!cur || !dot || coarse || reduce || !hoverable) return;
    body.classList.add('custom-cursor');
    var x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, seen = false;
    addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!seen) { seen = true; cur.style.opacity = '1'; dot.style.opacity = '1'; }
      dot.style.left = tx + 'px'; dot.style.top = ty + 'px';
      var hot = e.target.closest && e.target.closest('a, button, .entry, input, textarea');
      cur.classList.toggle('is-hot', !!hot);
    }, { passive: true });
    doc.addEventListener('mouseleave', function () { cur.style.opacity = '0'; dot.style.opacity = '0'; });
    doc.addEventListener('mouseenter', function () { if (seen) { cur.style.opacity = '1'; dot.style.opacity = '1'; } });
    (function loop() {
      requestAnimationFrame(loop);
      x += (tx - x) * 0.22; y += (ty - y) * 0.22;
      cur.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-50%)';
    })();
  }

  /* ---------- the path: a timeline inside a sub-page ----------
     Delegated rather than wired per element: the timeline lives inside an
     entry's detail, so it is rebuilt from that markup every time the sub-page
     is opened, and anything bound to the old nodes would be bound to nothing.
     Hovering reads a season out; clicking or focusing pins it, and the pin is
     what the readout falls back to when the pointer leaves. */
  function tlReadout(stop) {
    var tl = stop.closest('.tl');
    var out = tl && tl.parentNode.querySelector('.tl__out');
    if (!out) return;
    var yr = $('.tl__yr', stop);
    out.innerHTML = '<b>' + (yr ? yr.textContent : '') + '</b>' + stop.dataset.team;
  }
  function tlPin(stop) {
    $$('.tl__stop', stop.closest('.tl')).forEach(function (s) { s.dataset.on = s === stop ? '1' : '0'; });
    tlReadout(stop);
  }
  document.addEventListener('mouseover', function (e) {
    var s = e.target.closest && e.target.closest('.tl__stop');
    if (s) tlReadout(s);
  });
  document.addEventListener('focusin', function (e) {
    var s = e.target.closest && e.target.closest('.tl__stop');
    if (s) tlPin(s);
  });
  document.addEventListener('click', function (e) {
    var s = e.target.closest && e.target.closest('.tl__stop');
    if (s) tlPin(s);
  });
  document.addEventListener('mouseout', function (e) {
    var tl = e.target.closest && e.target.closest('.tl');
    if (!tl || (e.relatedTarget && tl.contains(e.relatedTarget))) return;
    var pinned = $('.tl__stop[data-on="1"]', tl) || $('.tl__stop.is-now', tl);
    if (pinned) tlReadout(pinned);
  });

  /* ---------- letter-flip links (priyandesai.com) ---------- */
  function flipify(el) {
    var text = (el.getAttribute('data-text') || el.textContent).trim();
    el.textContent = '';
    el.setAttribute('aria-label', text);
    Array.prototype.forEach.call(text, function (ch, i) {
      var s = document.createElement('span');
      s.className = 'ch';
      s.style.setProperty('--i', i);
      var a = document.createElement('i');
      a.textContent = ch === ' ' ? NBSP : ch;
      var b = a.cloneNode(true);
      b.setAttribute('aria-hidden', 'true');
      s.appendChild(a); s.appendChild(b);
      el.appendChild(s);
    });
  }

  /* ---------- portrait: hide the empty state once a real image is in ---------- */
  (function () {
    var img = $('.portrait img');
    if (!img) return;
    var fill = function () { if (img.naturalWidth) img.closest('.portrait').classList.add('is-filled'); };
    if (img.complete) fill(); else img.addEventListener('load', fill);
    img.addEventListener('error', function () { img.remove(); });
  })();

  /* ---------- boot ---------- */
  body.classList.add('can-animate');
  if (counterEl) counterEl.setAttribute('data-num', '');
  setTotal(); paintNumerals(); paintHeadlines(); labels();
  $$('[data-scramble],[data-num]').forEach(function (el) { textNodes(el); });   // cache the originals before anything touches them
  $$('.flip').forEach(flipify);
  wireInput();
  wireEntries();
  wireScramblers();
  wireCursor();
  setMode();
  runLoader();
  setTimeout(finish, 7000);   // whatever happens, the curtain lifts
})();
