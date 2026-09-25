/* v2 editorial · one small script. Everything here is progressive: the pages
   read fully without it. Reveal and image motion, image tone on touch, clips,
   the Work index (filters + cursor preview), the résumé rail and the ⌘K
   search palette. All motion stops under prefers-reduced-motion. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hoverFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = d.body.getAttribute('data-root') || './';

  /* ---- 1. clip-reveal titles and 1-2% image settle on viewport entry ---- */
  // A title already painted in view (the script arrived late) stays put rather than
  // vanishing and replaying. A settled title drops its clip so focus rings show whole.
  var reveals = Array.prototype.slice.call(d.querySelectorAll('.reveal'));
  var painted = !!(window.performance && performance.getEntriesByName && performance.getEntriesByName('first-contentful-paint').length);
  var shown = reveals.map(function (el) { var r = el.getBoundingClientRect(); return painted && r.top < innerHeight && r.bottom > 0; });
  reveals.forEach(function (el, i) {
    if (shown[i]) el.classList.add('is-in', 'is-done');
    var span = d.createElement('span'); span.className = 'reveal__in';
    while (el.firstChild) span.appendChild(el.firstChild);
    el.appendChild(span);
  });
  function settle(el) {
    el.classList.add('is-in');
    if (!el.classList.contains('reveal') || el.classList.contains('is-done')) return;
    var span = el.firstElementChild;
    var done = function (e) { if (e && e.target !== span) return; el.classList.add('is-done'); el.removeEventListener('transitionend', done); };
    el.addEventListener('transitionend', done);
    setTimeout(done, 400);
  }
  var animated = d.querySelectorAll('.reveal, .grow');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { settle(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    animated.forEach(function (el) { if (!el.classList.contains('is-in')) io.observe(el); });
  } else {
    animated.forEach(function (el) { el.classList.add('is-in', 'is-done'); });
  }

  /* ---- 2. image tone: tap resolves to colour on touch devices ---- */
  if (!hoverFine) {
    d.querySelectorAll('.tone').forEach(function (el) {
      if (el.closest('a')) return;
      el.addEventListener('click', function () { el.classList.toggle('is-on'); });
    });
  }

  /* ---- 3. clips: hover to play, tap on touch, always muted ---- */
  d.querySelectorAll('.clip').forEach(function (clip) {
    var v = clip.querySelector('video');
    if (!v) return;
    v.muted = true; v.loop = true; v.playsInline = true;
    function play() { var p = v.play(); if (p && p.then) p.then(function () { clip.classList.add('is-playing'); }).catch(function () {}); }
    function stop() { v.pause(); clip.classList.remove('is-playing'); }
    if (reduce) return;
    if (hoverFine) {
      clip.addEventListener('mouseenter', play); clip.addEventListener('mouseleave', stop);
      clip.addEventListener('focusin', play); clip.addEventListener('focusout', stop);
    } else {
      clip.addEventListener('click', function () { v.paused ? play() : stop(); });
    }
  });

  /* ---- 4. Work index: filters and the cursor-following preview ---- */
  var index = d.querySelector('.index');
  if (index) {
    var buttons = d.querySelectorAll('.filters button');
    var status = d.getElementById('filter-status');
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        var cat = b.getAttribute('data-cat');
        buttons.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        var n = 0;
        index.querySelectorAll('.index__row').forEach(function (row) {
          var show = cat === 'all' || row.getAttribute('data-cat') === cat;
          row.hidden = !show; if (show) n++;
        });
        if (status) status.textContent = n + (n === 1 ? ' entry' : ' entries') + (cat === 'all' ? '' : ' in ' + b.textContent.trim());
      });
    });
    var pv = d.querySelector('.preview');
    if (pv && hoverFine) {
      var img = d.createElement('img'); img.alt = ''; img.hidden = true; img.decoding = 'async'; pv.insertBefore(img, pv.firstChild);
      var ph = pv.querySelector('.ph'), phText = ph && ph.querySelector('span');
      var x = 0, y = 0, raf = 0, head = d.querySelector('.site-head');
      // Beside the cursor, flipped to its left near the right edge, kept between the header and the bottom.
      function place() {
        raf = 0;
        var w = pv.offsetWidth, h = pv.offsetHeight, top = head ? head.getBoundingClientRect().bottom : 0;
        var px = x + 28, py = y - 20;
        if (px + w > innerWidth - 8) px = x - 28 - w;
        py = Math.max(top + 8 + h / 2, Math.min(py, innerHeight - 8 - h / 2));
        pv.style.setProperty('--px', px + 'px'); pv.style.setProperty('--py', py + 'px');
      }
      if (!reduce) {
        index.addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(place); });
      } else {
        pv.classList.add('preview--still');
      }
      index.querySelectorAll('.index__row').forEach(function (row) {
        row.addEventListener('mouseenter', function (e) {
          var src = row.getAttribute('data-preview'), label = row.getAttribute('data-preview-label') || '';
          if (src) { img.src = src; img.alt = ''; img.hidden = false; if (ph) ph.hidden = true; }
          else { img.hidden = true; if (ph) { ph.hidden = false; if (phText) phText.textContent = label; } }
          if (!reduce && !pv.classList.contains('is-on')) {
            // appear at the cursor: commit the position before the glide switches on
            x = e.clientX; y = e.clientY; if (raf) { cancelAnimationFrame(raf); raf = 0; }
            place(); pv.getBoundingClientRect();
          }
          pv.classList.add('is-on');
        });
      });
      index.addEventListener('mouseleave', function () { pv.classList.remove('is-on'); });
    }
  }

  /* ---- 5. Résumé rail: mark the section in view ---- */
  var rail = d.querySelector('.cv__rail');
  if (rail && 'IntersectionObserver' in window) {
    var links = Array.prototype.slice.call(rail.querySelectorAll('a[href^="#"]')).filter(function (a) { return a.getAttribute('href').length > 1; });
    var secs = links.map(function (a) { return d.querySelector(a.getAttribute('href')); }).filter(Boolean);
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var id;
        if (e.isIntersecting) id = e.target.id;
        else if (e.rootBounds && secs[0].getBoundingClientRect().top >= e.rootBounds.bottom) id = '';  // back above the first section
        else return;
        links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + id ? 'true' : 'false'); });
      });
    }, { rootMargin: '-15% 0px -75% 0px' });
    secs.forEach(function (s) { io2.observe(s); });
  }

  /* ---- 6. Search palette (⌘K, Ctrl+K, or /) ---- */
  var dlg = d.getElementById('palette');
  if (dlg && typeof dlg.showModal === 'function') {
    var input = dlg.querySelector('input'), list = dlg.querySelector('.palette__list'), empty = dlg.querySelector('.palette__empty');
    var data = null, loading = null, sel = -1, results = [];
    function load() {
      if (data) return Promise.resolve(data);
      if (!loading) loading = fetch(root + 'data/search.json', { cache: 'no-cache' })
        .then(function (r) { return r.json(); })
        .then(function (j) { data = j.items || []; return data; })
        .catch(function () { data = []; return data; });
      return loading;
    }
    function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
    function score(item, q) {
      var toks = q.split(/\s+/).filter(Boolean), t = norm(item.t), k = norm(item.k), s = norm(item.s), x = norm(item.x), total = 0;
      for (var i = 0; i < toks.length; i++) {
        var tok = toks[i], hit = 0;
        if (t.indexOf(tok) === 0) hit = 6; else if (t.indexOf(tok) >= 0) hit = 4;
        else if (k.indexOf(tok) >= 0) hit = 3; else if (s.indexOf(tok) >= 0) hit = 2; else if (x.indexOf(tok) >= 0) hit = 1;
        if (!hit) return 0; total += hit;
      }
      return total;
    }
    function render(q) {
      var items = data || [];
      q = norm(q.trim());
      results = q ? items.map(function (it) { return { it: it, sc: score(it, q) }; }).filter(function (r) { return r.sc > 0; })
        .sort(function (a, b) { return b.sc - a.sc; }).slice(0, 12).map(function (r) { return r.it; })
        : items.filter(function (it) { return it.k === 'Page'; }).slice(0, 8);
      list.innerHTML = '';
      empty.hidden = results.length > 0;
      results.forEach(function (it, i) {
        var li = d.createElement('li'), a = d.createElement('a');
        li.setAttribute('role', 'none');
        a.href = root + it.u; a.setAttribute('role', 'option'); a.id = 'pal-' + i;
        a.innerHTML = '<span class="t"></span><span class="k"></span>' + (it.s ? '<span class="s"></span>' : '');
        a.querySelector('.t').textContent = it.t; a.querySelector('.k').textContent = it.k;
        if (it.s) a.querySelector('.s').textContent = it.s;
        li.appendChild(a); list.appendChild(li);
      });
      select(results.length ? 0 : -1);
    }
    function select(i, byPointer) {
      sel = i;
      var opts = list.querySelectorAll('a');
      opts.forEach(function (a, j) { a.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
      if (i >= 0) input.setAttribute('aria-activedescendant', 'pal-' + i); else input.removeAttribute('aria-activedescendant');
      if (i >= 0 && opts[i] && !byPointer) opts[i].scrollIntoView({ block: 'nearest' });
    }
    function open() {
      if (dlg.open) return;
      dlg.showModal();
      input.value = '';
      if (!data) { list.innerHTML = ''; empty.hidden = false; empty.textContent = 'Loading the index'; }
      else render('');
      load().then(function () { empty.textContent = 'Nothing matches. Try a project, a school or an instrument.'; render(input.value); });
      setTimeout(function () { input.focus(); }, 0);
    }
    d.querySelectorAll('[data-search-open]').forEach(function (b) { b.addEventListener('click', open); });
    d.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      var typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg.open ? dlg.close() : open(); }
      else if (e.key === '/' && !typing && !dlg.open) { e.preventDefault(); open(); }
    });
    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (results.length) select((sel + 1) % results.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (results.length) select((sel - 1 + results.length) % results.length); }
      else if (e.key === 'Enter') { e.preventDefault(); var a = list.querySelectorAll('a')[sel]; if (a) a.click(); }
      else if (e.key === 'Escape') { e.preventDefault(); dlg.close(); }  // one press closes, even with a query typed
    });
    // the pointer and the keyboard share one highlighted result
    list.addEventListener('mousemove', function (e) {
      var a = e.target.closest && e.target.closest('a'); if (!a) return;
      var i = Array.prototype.indexOf.call(list.querySelectorAll('a'), a);
      if (i !== sel) select(i, true);
    });
    // a result on this same page only moves the hash, so close first
    list.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  }
})();
