/* v4: the room's few behaviours. Everything here is decoration on a page that reads without it.
   1. Static: a fixed canvas redrawn every frame, one grain per CSS pixel (hasque.com's measure). Four noise
      tiles are made once and laid down at a random offset each frame, so the field is new every frame
      without regenerating a million pixels sixty times a second.
   2. The window's light follows the pointer, slowly.
   3. One reveal grammar for everything that arrives; things that arrive together cascade.
   4. A live clock for Groton, Massachusetts.
   5. Row previews spring in at one fixed place on the right (fine pointers only).
   6. The bottom edge's blur fades out as the page runs out, so the last lines are never blurred.
   7. The record's right column sticks by its top when it fits the screen and by its bottom when it does not.
   8. Page changes: cross-document view transitions where the browser has them, a short fade elsewhere.
   Under prefers-reduced-motion: no static motion, no reveal, no light follow, no page fade. */
(function () {
  var root = document.documentElement;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  root.classList.add('js', 'js-ready');

  // 1. static
  var grain = document.querySelector('.grain');
  if (grain && grain.getContext) {
    var g = grain.getContext('2d'), T = 512, pats = [], gw = 0, gh = 0;
    var makeTile = function () {
      var c = document.createElement('canvas'); c.width = c.height = T;
      var x = c.getContext('2d'), img = x.createImageData(T, T), px = new Uint32Array(img.data.buffer);
      for (var i = 0; i < px.length; i++) { var v = (Math.random() * 256) | 0; px[i] = 0xff000000 | (v << 16) | (v << 8) | v; }
      x.putImageData(img, 0, 0);
      return g.createPattern(c, 'repeat');
    };
    for (var k = 0; k < 4; k++) pats.push(makeTile());
    var size = function () { gw = grain.width = Math.max(1, innerWidth); gh = grain.height = Math.max(1, innerHeight); };
    var draw = function () {
      var ox = (Math.random() * T) | 0, oy = (Math.random() * T) | 0;
      g.setTransform(1, 0, 0, 1, -ox, -oy);
      g.fillStyle = pats[(Math.random() * pats.length) | 0];
      g.fillRect(ox, oy, gw, gh);
    };
    size(); draw();
    addEventListener('resize', function () { size(); draw(); }, { passive: true });
    if (!still) (function loop() { draw(); requestAnimationFrame(loop); })();
  }

  // 2. the light in the window
  var win = document.querySelector('.win');
  if (win && fine && !still) {
    var tx = 50, ty = 0, cx = 50, cy = 0, raf = 0;
    var paint = function () {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      win.style.setProperty('--mx', cx.toFixed(2) + '%'); win.style.setProperty('--my', cy.toFixed(2) + '%');
      raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(paint) : 0;
    };
    addEventListener('pointermove', function (e) {
      var r = win.getBoundingClientRect();
      tx = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100));
      ty = Math.max(-20, Math.min(60, (e.clientY - r.top) / r.height * 100 - 20));
      if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });
    root.addEventListener('pointerleave', function () { tx = 50; ty = 0; if (!raf) raf = requestAnimationFrame(paint); });
  }

  // 3. reveal: whatever enters the screen in the same moment cascades in reading order
  var rv = [].slice.call(document.querySelectorAll('.rv'));
  var show = function (el) {
    el.classList.add('is-in');
    setTimeout(function () { el.classList.add('rv-done'); }, (parseInt(el.style.getPropertyValue('--d'), 10) || 0) + 900);
  };
  if (still || !('IntersectionObserver' in window)) {
    rv.forEach(show);
  } else {
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (en) { return en.isIntersecting; }).map(function (en) { return en.target; });
      batch.sort(function (a, b) { var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return (ra.top - rb.top) || (ra.left - rb.left); });
      batch.forEach(function (el, i) {
        var step = parseInt((el.parentNode.getAttribute && el.parentNode.getAttribute('data-stagger')) || '100', 10);
        el.style.setProperty('--d', Math.min(i * step, 600) + 'ms');
        show(el); io.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
    // belt and braces: whatever sits in the first screen is shown after a second even if the observer stays quiet
    setTimeout(function () { rv.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) show(el); }); }, 1000);
  }

  // 4. the clock
  var clock = document.querySelector('[data-clock] b');
  if (clock) {
    var tick = function () {
      try {
        clock.textContent = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', weekday: 'short', day: 'numeric', month: 'short' }).format(new Date()).replace(',', ' ·');
      } catch (e) { clock.textContent = new Date().toLocaleTimeString(); }
    };
    tick(); setInterval(tick, 20000);
  }

  // 5. row previews: one fixed place on the right
  var prows = [].slice.call(document.querySelectorAll('a.row[data-peek]'));
  if (prows.length && fine) {
    var peek = document.createElement('div'); peek.className = 'peek'; peek.setAttribute('aria-hidden', 'true');
    document.body.appendChild(peek);
    var shown = null, outT = 0;
    var fill = function (row) {
      var kind = row.getAttribute('data-peek'), src = row.getAttribute('data-peek-src'), tile = row.getAttribute('data-peek-tile') || '';
      peek.innerHTML = '<div class="tile__box" style="background:' + tile + '"><div class="dev dev--' + kind + '"><div class="dev__body">' +
        (kind === 'mac' ? '<div class="dev__bar"><i></i><i></i><i></i></div>' : '') +
        '<div class="dev__screen"><img src="' + src + '" alt=""></div></div></div></div>';
      shown = src;
    };
    prows.forEach(function (row) {
      row.addEventListener('pointerenter', function () {
        clearTimeout(outT);
        if (shown !== row.getAttribute('data-peek-src')) fill(row);
        if (peek.classList.contains('is-on')) return;
        peek.classList.remove('is-out');
        void peek.offsetWidth; // start the spring from the small, blurred state
        peek.classList.add('is-on');
      });
      row.addEventListener('pointerleave', function () {
        peek.classList.remove('is-on'); peek.classList.add('is-out');
        outT = setTimeout(function () { peek.classList.remove('is-out'); }, 320);
      });
    });
    // fetch the three screens while the page is idle, so the first preview is never empty
    setTimeout(function () { prows.forEach(function (row) { var im = new Image(); im.src = row.getAttribute('data-peek-src'); }); }, 1500);
  }

  // 6. the bottom edge fades out as the page runs out
  var edge = document.querySelector('.edge');
  if (edge) {
    var eRaf = 0;
    var edgeFade = function () { eRaf = 0; var left = root.scrollHeight - (scrollY + innerHeight); edge.style.opacity = Math.max(0, Math.min(1, left / 160)).toFixed(3); };
    addEventListener('scroll', function () { if (!eRaf) eRaf = requestAnimationFrame(edgeFade); }, { passive: true });
    addEventListener('resize', edgeFade, { passive: true });
    addEventListener('load', edgeFade);
    edgeFade();
  }

  // 7. the record's right column: by its top when it fits, by its bottom when it does not
  var aside = document.querySelector('.record > aside');
  if (aside) {
    var stick = function () { aside.style.top = Math.min(48, innerHeight - aside.offsetHeight - 48) + 'px'; };
    stick();
    addEventListener('resize', stick, { passive: true });
    addEventListener('load', stick);
  }

  // 8. page changes
  var menu = document.querySelector('.menu');
  var mark = menu && menu.querySelector('.pill__mark');
  if ('onpagereveal' in window) {
    // The menu holds its place across the change only when it is on screen; otherwise it travels with the page
    addEventListener('pageswap', function (e) {
      if (!e.viewTransition || !menu) return;
      var r = menu.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) { menu.style.viewTransitionName = 'none'; if (mark) mark.style.viewTransitionName = 'none'; }
    });
    addEventListener('pageshow', function () { if (menu) menu.style.viewTransitionName = ''; if (mark) mark.style.viewTransitionName = ''; });
  } else if (!still) {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // same page: let it scroll
      e.preventDefault();
      root.classList.add('is-leaving');
      setTimeout(function () { location.href = url.href; }, 220);
    });
    addEventListener('pageshow', function () { root.classList.remove('is-leaving'); });
  }
})();
