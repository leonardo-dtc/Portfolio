/* ============================================================
   TUNER — sliders over field.js's live settings, plus comments.

   Toggle with T, [tune] in the status bar, or ?tune in the URL.
   Slider values persist in localStorage (field.js owns that); "copy
   json" hands you the JSON to paste into DEFAULTS once you like it.

   Comments: "+ comment" arms crosshair mode; click any element on
   the page, write the note, save. Notes are pinned on the page while
   the tuner is open, listed here with the panel they belong to, and
   "copy all" turns them into a Markdown list to paste into a chat.
   Stored in localStorage (`lc-notes`) — this browser only.
   ============================================================ */
(function () {
  'use strict';
  var host = document.getElementById('tuner');
  var field = window.LCField;
  if (!host || !field) return;
  var $ = function (s, c) { return (c || document).querySelector(s); };

  var ROWS = [
    { key: 'speed',    label: 'movement speed',  min: 0,   max: 3,   step: 0.05, fmt: function (v) { return v.toFixed(2) + '×'; } },
    { key: 'vibrancy', label: 'colour vibrancy', min: 0,   max: 2,   step: 0.05, fmt: function (v) { return v.toFixed(2) + '×'; } },
    { key: 'cell',     label: 'cell size',       min: 8,   max: 40,  step: 1,    fmt: function (v) { return v + 'px'; } },
    { key: 'glyph',    label: 'glyph size',      min: 0.4, max: 1.3, step: 0.02, fmt: function (v) { return Math.round(v * 100) + '%'; } },
    { key: 'freq',     label: 'noise frequency', min: 1,   max: 12,  step: 0.1,  fmt: function (v) { return v.toFixed(1); } },
    { key: 'cursorR',  label: 'cursor radius',   min: 0,   max: 500, step: 10,   fmt: function (v) { return v + 'px'; } },
    { key: 'cursorK',  label: 'cursor strength', min: 0,   max: 1.5, step: 0.05, fmt: function (v) { return v.toFixed(2); } },
    { key: 'cursorScr', label: 'cursor decode',   min: 0,   max: 1,   step: 0.05, fmt: function (v) { return v.toFixed(2); } },
    { key: 'dim',      label: 'chapter dim',     min: 0,   max: 1,   step: 0.02, fmt: function (v) { return Math.round(v * 100) + '%'; } },
    { key: 'artLift',  label: 'image brightness', min: 0,  max: 2,   step: 0.05, fmt: function (v) { return Math.round(v * 100) + '%'; } },
    { key: 'fieldLift', label: 'field brightness', min: 0, max: 2,   step: 0.05, fmt: function (v) { return Math.round(v * 100) + '%'; } }
  ];

  host.innerHTML =
    '<div class="tuner__head"><b>field tuner</b><button type="button" class="tuner__x" aria-label="Close">✕</button></div>' +
    ROWS.map(function (r) {
      return '<div class="tuner__row"><div><label for="tune-' + r.key + '">' + r.label + '</label>' +
        '<input type="range" id="tune-' + r.key + '" data-key="' + r.key + '" min="' + r.min + '" max="' + r.max + '" step="' + r.step + '"></div>' +
        '<span class="tuner__val" data-val="' + r.key + '"></span></div>';
    }).join('') +
    '<div class="tuner__foot"><button type="button" class="tuner__btn" data-act="reset">reset</button><button type="button" class="tuner__btn" data-act="copy">copy json</button></div>' +
    '<span class="tuner__sub">comments</span>' +
    '<div class="tuner__foot" style="margin-top:0"><button type="button" class="tuner__btn" data-act="add">+ comment</button><button type="button" class="tuner__btn" data-act="copynotes">copy all</button><button type="button" class="tuner__btn" data-act="clear">clear</button></div>' +
    '<ul class="tuner__list" id="tuner-notes"></ul>' +
    '<p class="tuner__note">T toggles this panel, Esc cancels a comment. Sliders and comments live in this browser only; copy them out to keep them.</p>';

  /* ---------- sliders ---------- */
  var inputs = {}, vals = {};
  ROWS.forEach(function (r) {
    inputs[r.key] = host.querySelector('[data-key="' + r.key + '"]');
    vals[r.key] = host.querySelector('[data-val="' + r.key + '"]');
    inputs[r.key].addEventListener('input', function () { var patch = {}; patch[r.key] = parseFloat(this.value); field.set(patch); });
  });
  function sync() {
    var c = field.get();
    ROWS.forEach(function (r) { inputs[r.key].value = c[r.key]; vals[r.key].textContent = r.fmt(c[r.key]); });
  }
  sync();
  document.addEventListener('lc:field', sync);

  function copyText(text, btn, label) {
    var done = function () { btn.textContent = 'copied'; setTimeout(function () { btn.textContent = label; }, 1200); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { prompt('Copy:', text); });
    else prompt('Copy:', text);
  }
  host.querySelector('.tuner__x').addEventListener('click', function () { toggle(false); });
  host.querySelector('[data-act="reset"]').addEventListener('click', function () { field.reset(); });
  host.querySelector('[data-act="copy"]').addEventListener('click', function () { copyText(JSON.stringify(field.get(), null, 2), this, 'copy json'); });

  /* ---------- comments ---------- */
  var NKEY = 'lc-notes';
  var notes = (function () { try { return JSON.parse(localStorage.getItem(NKEY) || '[]'); } catch (e) { return []; } })();
  var list = $('#tuner-notes'), btnAdd = host.querySelector('[data-act="add"]');
  var curIndex = 0, curSect = 'intro', commenting = false, hover = null, editor = null, pins = [];
  document.addEventListener('lc:panel', function (e) { curIndex = e.detail.index; curSect = e.detail.sect; });

  function saveNotes() { try { localStorage.setItem(NKEY, JSON.stringify(notes)); } catch (e) {} }
  function selectorFor(el) {
    if (el.id) return '#' + el.id;
    var path = [], cur = el;
    while (cur && cur !== document.body) {
      if (cur.id) { path.unshift('#' + cur.id); break; }
      var seg = cur.tagName.toLowerCase();
      var cls = Array.prototype.filter.call(cur.classList, function (c) { return !/^(is-|lc-)/.test(c) && c !== 'ch' && c !== 'flip'; }).slice(0, 2);
      if (cls.length) seg += '.' + cls.join('.');
      if (cur.parentElement) {
        var sib = Array.prototype.filter.call(cur.parentElement.children, function (s) { return s.tagName === cur.tagName; });
        if (sib.length > 1) seg += ':nth-of-type(' + (sib.indexOf(cur) + 1) + ')';
      }
      path.unshift(seg);
      cur = cur.parentElement;
    }
    return path.join(' > ');
  }
  function pickTarget(el) {
    var t = el.closest && el.closest('[data-anim], .entry, .stat, .fact, .nameblock, .prompt, .role, a, button, h1, h2, h3, p, dd, dt, .card, .nav, .sbar, .counter, .rail, .hint, .portrait, canvas');
    return t || el;
  }
  function snippet(el) { return (el.innerText || el.textContent || el.tagName).replace(/\s+/g, ' ').trim().slice(0, 70); }

  function startComment() {
    commenting = true;
    document.body.classList.add('is-commenting');
    btnAdd.classList.add('is-on'); btnAdd.textContent = 'click an element…';
  }
  function stopComment() {
    commenting = false;
    document.body.classList.remove('is-commenting');
    btnAdd.classList.remove('is-on'); btnAdd.textContent = '+ comment';
    if (hover) { hover.classList.remove('lc-hover'); hover = null; }
  }
  btnAdd.addEventListener('click', function () { commenting ? stopComment() : startComment(); });

  document.addEventListener('mouseover', function (e) {
    if (!commenting || (e.target.closest && e.target.closest('.tuner, .lc-note'))) return;
    var el = pickTarget(e.target);
    if (hover && hover !== el) hover.classList.remove('lc-hover');
    hover = el; el.classList.add('lc-hover');
  });
  document.addEventListener('click', function (e) {
    if (!commenting) return;
    if (e.target.closest && e.target.closest('.tuner, .lc-note')) return;
    e.preventDefault(); e.stopPropagation();
    var el = pickTarget(e.target);
    stopComment();
    openEditor(el, e.clientX, e.clientY);
  }, true);

  function openEditor(el, x, y) {
    closeEditor();
    var sel = selectorFor(el);
    editor = document.createElement('div');
    editor.className = 'lc-note';
    editor.innerHTML = '<span class="where">' + escape(curSect + ' · ' + snippet(el)) + '</span>' +
      '<textarea placeholder="What should change here?"></textarea>' +
      '<div class="row"><button type="button" class="tuner__btn" data-act="save">save</button><button type="button" class="tuner__btn" data-act="cancel">cancel</button></div>';
    document.body.appendChild(editor);
    var w = editor.offsetWidth, h = editor.offsetHeight;
    editor.style.left = Math.max(8, Math.min(innerWidth - w - 8, x + 14)) + 'px';
    editor.style.top = Math.max(8, Math.min(innerHeight - h - 8, y + 14)) + 'px';
    var ta = editor.querySelector('textarea');
    ta.focus();
    editor.querySelector('[data-act="cancel"]').addEventListener('click', closeEditor);
    editor.querySelector('[data-act="save"]').addEventListener('click', function () {
      var note = ta.value.trim();
      if (!note) { ta.focus(); return; }
      notes.push({ id: Date.now(), sel: sel, snippet: snippet(el), note: note, panel: curIndex, sect: curSect,
        theme: document.documentElement.getAttribute('data-theme') || 'dark', ts: new Date().toISOString().slice(0, 16).replace('T', ' ') });
      saveNotes(); closeEditor(); renderList();
    });
    ta.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) editor.querySelector('[data-act="save"]').click(); });
  }
  function closeEditor() { if (editor) { editor.remove(); editor = null; } }
  function escape(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function renderList() {
    list.innerHTML = notes.map(function (n, i) {
      return '<li class="tuner__item"><b>#' + (i + 1) + '</b><span><span class="what" data-go="' + n.panel + '">' + escape(n.note) + '</span>' +
        '<span class="where" data-go="' + n.panel + '">' + escape(n.sect + ' · ' + n.snippet) + '</span></span>' +
        '<button type="button" data-del="' + n.id + '" aria-label="Delete">✕</button></li>';
    }).join('');
    renderPins();
  }
  list.addEventListener('click', function (e) {
    var del = e.target.closest('[data-del]'), go = e.target.closest('[data-go]');
    if (del) { var id = +del.getAttribute('data-del'); notes = notes.filter(function (n) { return n.id !== id; }); saveNotes(); renderList(); return; }
    if (go) document.dispatchEvent(new CustomEvent('lc:goto', { detail: { index: +go.getAttribute('data-go') } }));
  });
  host.querySelector('[data-act="copynotes"]').addEventListener('click', function () {
    if (!notes.length) { copyText('(no comments yet)', this, 'copy all'); return; }
    var md = '# Portfolio comments (' + notes.length + ')\n' + notes.map(function (n, i) {
      return (i + 1) + '. [' + n.sect + ' · ' + n.theme + '] `' + n.sel + '` — “' + n.snippet + '”: ' + n.note;
    }).join('\n');
    copyText(md, this, 'copy all');
  });
  host.querySelector('[data-act="clear"]').addEventListener('click', function () {
    if (!notes.length || !confirm('Delete all ' + notes.length + ' comments?')) return;
    notes = []; saveNotes(); renderList();
  });

  /* pins on the page while the tuner is open */
  function renderPins() {
    pins.forEach(function (p) { p.remove(); }); pins = [];
    if (host.hidden) return;
    notes.forEach(function (n, i) {
      var pin = document.createElement('span');
      pin.className = 'lc-pin'; pin.textContent = i + 1; pin.hidden = true;
      document.body.appendChild(pin); pins.push(pin);
    });
  }
  function placePins() {
    if (host.hidden || !pins.length) return;
    notes.forEach(function (n, i) {
      var pin = pins[i]; if (!pin) return;
      var el = null; try { el = document.querySelector(n.sel); } catch (e) {}
      if (!el) { pin.hidden = true; return; }
      var r = el.getBoundingClientRect();
      var vis = r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).opacity !== '0';
      pin.hidden = !vis;
      if (vis) { pin.style.left = r.left + 'px'; pin.style.top = r.top + 'px'; }
    });
  }
  (function loop() { requestAnimationFrame(loop); if (!host.hidden) placePins(); })();
  renderList();

  /* ---------- toggle ---------- */
  function toggle(on) {
    var show = typeof on === 'boolean' ? on : host.hidden;
    host.hidden = !show;
    if (show) { sync(); renderPins(); } else { stopComment(); closeEditor(); renderPins(); }
  }
  document.addEventListener('lc:tuner', function () { toggle(); });
  addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target, tag = t && t.tagName;
    if (e.key === 'Escape') { if (commenting) { stopComment(); return; } if (editor) { closeEditor(); return; } if (!host.hidden) toggle(false); return; }
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
    if (e.key === 't' || e.key === 'T') toggle();
  });
  if (/[?&]tune\b/.test(location.search)) toggle(true);
})();
