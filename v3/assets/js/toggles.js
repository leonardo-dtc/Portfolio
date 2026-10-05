/* Design toggles: the choices still open on the decision page, to try in the browser's developer tools. Each is a
   data attribute on <html> (data-archive="cards") that the stylesheet and the scripts read. A change is kept in this
   browser only (localStorage, set again before the first paint by the page's head script), so visitors always see
   the defaults.

     In the console   toggles                       each one's value (toggles.list(): what each is, and its choices)
                      toggles.archive = 'cards'     or toggles.set('archive', 'cards'), or by its question:
                                                    toggles.T40 = 'desk'
                      toggles.reset()               every one back to its default (or toggles.reset('archive'))
     In the address   ?toggles=archive:cards,cover:desk (for that visit only)
     In Elements      edit the data attribute on <html>

   It runs before site.js and mac.js (the scripts are deferred, in order), so they read the toggles as they start. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, KEY = 'v3:toggles';
  var TOGGLES = {
    archive: {
      q: 'T17', def: 'mac',
      values: { mac: 'the archive as a classic Macintosh (built)', cards: 'the wall of index cards' },
      note: 'If the Mac is picked the rest of the deck stays as it is: the Mac is one object on one sheet, as the mask and ' +
        'the code panel are. Its pixel face (Tiny5) stays inside its screen; the index’s Find opens its files; print, ' +
        'scripts off and forced colours still show the cards. v3/README.md says more.'
    },
    cover: { q: 'T40', def: 'poster', values: { poster: 'the cover as a poster (built)', desk: 'a desk: its objects open the project files' } },
    talk: { q: 'T18', def: 'clean', values: { clean: 'the contact sheet, clean: the framed words, the address and the profiles, a plain end', collage: 'as round three left it: stickers, tape and the torn paper end' } },
    talkWords: { q: 'T18 words', def: 'lets-talk', values: { 'lets-talk': 'LET’S TALK (the words now)', 'get-in-touch': 'GET IN TOUCH', 'say-hello': 'SAY HELLO' } }
  };
  var WORDS = { 'lets-talk': ['Let’s', 'Talk'], 'get-in-touch': ['Get in', 'Touch'], 'say-hello': ['Say', 'Hello'] };
  var names = Object.keys(TOGGLES);
  var attr = function (n) { return 'data-' + n.replace(/[A-Z]/g, function (c) { return '-' + c.toLowerCase(); }); };
  function stored() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function keep(o) { try { if (Object.keys(o).length) localStorage.setItem(KEY, JSON.stringify(o)); else localStorage.removeItem(KEY); } catch (e) { /* not kept */ } }
  function nameOf(n) {
    if (TOGGLES[n]) return n;
    n = String(n).toLowerCase();
    for (var i = 0; i < names.length; i++) if (TOGGLES[names[i]].q.toLowerCase() === n) return names[i];
    return null;
  }
  function valueOf(t, v) { v = String(v).trim().toLowerCase(); return Object.prototype.hasOwnProperty.call(t.values, v) ? v : null; }
  function current(n) { return html.getAttribute(attr(n)) || TOGGLES[n].def; }
  // what this script last wrote to each attribute, so the observer below can tell its own writes from an edit
  var written = {};
  /* the console's object holds each toggle's value, so typing toggles shows them all */
  var shown = {};
  function write(n, v) { written[n] = v; shown[n] = v; if (html.getAttribute(attr(n)) !== v) html.setAttribute(attr(n), v); }

  // what a toggle does besides its attribute (the stylesheet does the rest)
  function effect(n, v, initial) {
    if (n === 'talkWords') {
      var w = WORDS[v] || WORDS['lets-talk'], hl = d.querySelectorAll('.talk__word > .hl');
      for (var i = 0; i < hl.length && i < 2; i++) { var t = hl[i].querySelector('.hl__in') || hl[i]; t.textContent = w[i]; }
    }
    // the cards' folds and the Mac measure themselves on a resize
    if (!initial) window.dispatchEvent(new Event('resize'));
  }
  function put(n, v, keepIt) {
    var was = current(n);
    write(n, v);
    if (keepIt !== false) {
      var kept = stored();
      if (v === TOGGLES[n].def) delete kept[n]; else kept[n] = v;
      keep(kept);
    }
    effect(n, v);
    if (v !== was) d.dispatchEvent(new CustomEvent('v3:toggle', { detail: { name: n, value: v, was: was } }));
  }
  function set(n, v, keepIt) {
    var k = nameOf(n);
    if (!k) { console.warn('toggles: no toggle "' + n + '". There are: ' + names.join(', ')); return; }
    var t = TOGGLES[k], val = valueOf(t, v);
    if (!val) { console.warn('toggles: ' + k + ' (' + t.q + ') takes ' + Object.keys(t.values).map(function (x) { return '"' + x + '"'; }).join(', ')); return; }
    put(k, val, keepIt);
    return val;
  }
  function list() {
    var rows = {};
    names.forEach(function (k) {
      var t = TOGGLES[k];
      rows[k] = { question: t.q, value: current(k), default: t.def, choices: Object.keys(t.values).map(function (v) { return v + ' (' + t.values[v] + ')'; }).join('; ') };
    });
    console.table(rows);
    names.forEach(function (k) { if (TOGGLES[k].note) console.info(k + ': ' + TOGGLES[k].note); });
  }
  function reset(n) { (n ? [nameOf(n)].filter(Boolean) : names).forEach(function (k) { put(k, TOGGLES[k].def); }); }

  // what this browser kept (the head script set it already), then the address; every toggle shows on <html>
  var kept = stored();
  names.forEach(function (k) { write(k, valueOf(TOGGLES[k], kept[k] || TOGGLES[k].def) || TOGGLES[k].def); });
  var asked = (location.search.match(/[?&]toggles=([^&]*)/) || [])[1];
  /* (for this visit only: a link with ?toggles= never changes what that browser shows next time) */
  if (asked) decodeURIComponent(asked).split(',').forEach(function (pair) { var p = pair.split(':'); if (p[0] && p[1]) set(p[0], p[1], false); });
  effect('talkWords', current('talkWords'), true);

  // an attribute edited in the Elements panel counts as a change (a value it does not take goes back, with a note)
  new MutationObserver(function (records) {
    records.forEach(function (r) {
      var k = null;
      names.forEach(function (n) { if (attr(n) === r.attributeName) k = n; });
      var raw = k && html.getAttribute(r.attributeName);
      if (!k || raw === written[k]) return;
      var v = valueOf(TOGGLES[k], raw || '');
      if (v) put(k, v); else { write(k, written[k] || TOGGLES[k].def); set(k, raw); }
    });
  }).observe(html, { attributes: true, attributeFilter: names.map(attr) });

  /* the methods are there but not listed, so the console shows just the values */
  var methods = { set: set, list: list, reset: reset, get: function (n) { var k = nameOf(n); return k ? current(k) : undefined; } };
  Object.keys(methods).forEach(function (k) { Object.defineProperty(shown, k, { value: methods[k], enumerable: false }); });
  window.toggles = window.Proxy ? new Proxy(shown, {
    get: function (o, p) { var k = typeof p === 'string' && nameOf(p); return k ? current(k) : o[p]; },
    set: function (o, p, v) { set(p, v); return true; }
  }) : shown;
  var changed = names.filter(function (k) { return current(k) !== TOGGLES[k].def; });
  console.info('v3 design toggles: ' + names.map(function (k) { return k + ' (' + TOGGLES[k].q + ') = ' + current(k); }).join(', ') + '.' +
    (changed.length ? ' Changed in this browser; toggles.reset() returns to the defaults.' : '') + ' toggles.list() shows the choices.');
})();
