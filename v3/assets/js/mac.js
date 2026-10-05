/* v3 poster · the Macintosh. The archive sheet's index cards become the files on a Macintosh of the mid-nineties,
   taped onto the sheet: the Platinum desktop in the poster's colours, with a menu bar, the Archive disk and the
   Trash, the Archive window listing one file for each card, and a window for each file that holds the card's
   whole text. Everything on the screen is built from the sheet's own list (.entries), so adding a card (see the
   instructions beside it in index.html) adds a file: its kind picks the file's picture, or the card's data-icon
   names one (games, film, chart, notes, maze, robot, rocket, text).
   The cards stay the page's own text: without the script, in print and in forced colours they are what shows.
   The Archive window lists the files with their kind and year, newest first; a column's heading sorts by it, and
   View shows them as icons instead. One click (or Return) opens a file, as on a phone, where the old Mac wanted
   two. A window drags by its title bar, its zoom box fills the screen with it, and Escape closes it. Movement
   (the screen coming on, the outlines of a window opening) stops under prefers-reduced-motion. */
(function () {
  'use strict';
  var d = document;
  var sheet = d.getElementById('archive'), list = sheet && sheet.querySelector('.entries');
  if (!list || !window.matchMedia || !('CustomEvent' in window)) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* ---------- the pictures: 32 by 32 dots. '#' ink, '.' white, '+' light grey, '-' grey, '=' dark grey,
     'r' vermilion, ' ' the desk behind ---------- */
  var EMBLEMS = {
    games: ['.......rr.......', '......rrrr......', '......rrrr......', '.......##.......', '.......##.......', '.......##.......', '..############..', '.#............#.', '.#.##......==.#.', '.#.##......==.#.', '.#............#.', '..############..'],
    film: ['################', '#==============#', '#=====r========#', '#=====rr=======#', '#=====rrr======#', '#=====rrrr=====#', '#=====rrr======#', '#=====rr=======#', '#=====r========#', '#==============#', '################', '......####......', '....########....'],
    chart: ['...........rrr..', '...........rrr..', '.......===.rrr..', '.......===.rrr..', '...---.===.rrr..', '...---.===.rrr..', '...---.===.rrr..', '...---.===.rrr..', '.##############.'],
    notes: ['.....rrrrrrrrrr.', '.....rrrrrrrrrr.', '.....#........#.', '.....#........#.', '.....#........#.', '.....#........#.', '.....#........#.', '..####.....####.', '.#####....#####.', '.#####....#####.', '..###......###..'],
    maze: ['#######.#######.', '#.............#.', '#.#####.#####.#.', '#.#.........#.#.', '#.#.#######.#.#.', '#.#.#.....#.#.#.', '#.#.#.rr..#.#.#.', '#...#.rr#.#####.', '#####.#.#.....#.', '#.....#.#####.#.', '#######.......#.', '..............#.'],
    robot: ['.......##.......', '......#rr#......', '.......##.......', '..############..', '..#++++++++++#..', '..#+rrr++rrr+#..', '###+rrr++rrr+###', '###++++++++++###', '..#++######++#..', '..#++++++++++#..', '..############..', '.....#....#.....', '...####..####...'],
    rocket: ['.......##.......', '......#++#......', '.....#++++#.....', '.....#++++#.....', '.....#+##+#.....', '.....#+##+#.....', '.....#++++#.....', '.....#++++#.....', '....##++++##....', '...###++++###...', '...##.####.##...', '......rrrr......', '.......rr.......'],
    text: ['.###########....', '................', '.#############..', '................', '.##########.....', '................', '.############...', '................', '.########.......']
  };
  /* a card's kind picks its file's picture */
  var KIND = { games: 'games', 'music video': 'film', video: 'film', film: 'film', statistics: 'chart', arrangement: 'notes', music: 'notes', 'game design': 'maze', robotics: 'robot', rocketry: 'rocket' };
  function blank(w, h) { var g = []; for (var y = 0; y < h; y++) { g.push([]); for (var x = 0; x < w; x++) g[y].push(' '); } return g; }
  function rows(g) { return g.map(function (r) { return r.join(''); }); }
  /* a document: a page with its top right corner folded over (the fold grey), a light edge inside its right and
     bottom sides, a shadow off them, and its emblem */
  function doc(name) {
    var g = blank(32, 32), x0 = 5, x1 = 26, y0 = 1, y1 = 30, f = 7, x, y;
    for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
      var dx = x - (x1 - f), dy = y - y0;
      if (dx > 0 && dy < f && dx > dy) continue;                  /* cut away above the fold */
      var edge = x === x0 || x === x1 || y === y0 || y === y1 || (dx > 0 && dx === dy);
      g[y][x] = edge ? '#' : (x === x1 - 1 || y === y1 - 1) ? '+' : '.';
    }
    for (var i = 0; i <= f; i++) { g[y0 + f][x1 - f + i] = '#'; g[y0 + i][x1 - f] = '#'; }
    for (y = y0 + 1; y < y0 + f; y++) for (x = x1 - f + 1; x < x1; x++) if (x - (x1 - f) < y - y0) g[y][x] = '+';
    for (y = y0 + f + 1; y <= y1 + 1; y++) g[y][x1 + 1] = '-';
    for (x = x0 + 1; x <= x1 + 1; x++) g[y1 + 1][x] = '-';
    var e = EMBLEMS[name] || EMBLEMS.text, oy = 11 + Math.max(0, (12 - e.length) >> 1);
    e.forEach(function (row, ey) { for (var ex = 0; ex < row.length; ex++) { var c = row.charAt(ex); if (c !== '.') g[oy + ey][8 + ex] = c; } });
    return rows(g);
  }
  function art(lines) { var g = blank(32, 32), top = 32 - lines.length; lines.forEach(function (row, y) { for (var x = 0; x < row.length && x < 32; x++) g[top + y][x] = row.charAt(x); }); return rows(g); }
  /* the disk: a drive seen a little from above, its light vermilion; the Trash: a ribbed can and its lid */
  var DISK = art(['     ########################   ', '    #......................#=#  ', '   #......................#==#  ', '  #......................#===#  ', ' ########################====#  ', ' #++++++++++++++++++++++#====#  ', ' #+--------------------+#====#  ', ' #+--------------------+#===#   ', ' #+-rr-----------------+#==#    ', ' #+--------------------+#=#     ', ' #++++++++++++++++++++++##      ', ' ########################       ', '', '', '', '', '', '']);
  var TRASH = art(['            ########            ', '            #......#            ', '      ####################      ', '      #++++++++++++++++++#      ', '      ####################      ', '       #.+-..+-..+-..+-#        ', '       #.+-..+-..+-..+-#        ', '       #.+-..+-..+-..+-#        ', '       #.+-..+-..+-..+-#        ', '       #.+-..+-..+-..+-#        ', '       #.+-..+-..+-..+-#        ', '       #.+-..+-..+-..+-#        ', '       #.+-..+-..+-..+-#        ', '       #.+-..+-..+-..+-#        ', '       #.+-..+-..+-..+-#        ', '       #.+-..+-..+-..+-#        ', '       #.+-..+-..+-..+-#        ', '       #++++++++++++++++#       ', '        ################        ', '', '']);
  /* the poster's star badge: vermilion in the menu bar (15 dots) and, as the poster draws it, on the screen
     coming on */
  var STAR = ['       #       ', '       #       ', '      ###      ', '      ###      ', '     #####     ', '###############', ' ############# ', '  ###########  ', '   #########   ', '   #########   ', '  #####.#####  ', '  ####   ####  ', ' ###       ### ', ' ##         ## ', '#             #'];
  function tint(lines, c) { return lines.map(function (r) { return r.replace(/#/g, c); }); }
  function badge() {
    var g = blank(32, 32), x, y;
    for (y = 0; y < 32; y++) for (x = 0; x < 32; x++) { var r = Math.hypot(x - 15.5, y - 15.5); if (r <= 15) g[y][x] = r > 13 ? '#' : '.'; }
    STAR.forEach(function (row, sy) { for (var sx = 0; sx < row.length; sx++) if (row.charAt(sx) === '#') g[8 + sy][8 + sx] = '#'; });
    return rows(g);
  }
  var CLS = { '#': 'px-k', '.': 'px-w', '+': 'px-l', '-': 'px-m', '=': 'px-d', r: 'px-r' };
  /* a picture as SVG: one path for each colour, on whole dots */
  function svg(lines, px) {
    var w = 0, paths = {};
    lines.forEach(function (row, y) {
      w = Math.max(w, row.length);
      for (var x = 0; x < row.length;) {
        var c = row.charAt(x), n = 1;
        while (row.charAt(x + n) === c) n++;
        if (CLS[c]) paths[c] = (paths[c] || '') + 'M' + x + ' ' + y + 'h' + n + 'v1h-' + n + 'z';
        x += n;
      }
    });
    return '<svg viewBox="0 0 ' + w + ' ' + lines.length + '" width="' + w * px + '" height="' + lines.length * px + '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' +
      Object.keys(CLS).filter(function (c) { return paths[c]; }).map(function (c) { return '<path class="' + CLS[c] + '" d="' + paths[c] + '"/>'; }).join('') + '</svg>';
  }

  /* ---------- the files, read from the cards ---------- */
  var cards = Array.prototype.slice.call(list.querySelectorAll(':scope > .entry'));
  if (!cards.length) return;
  function text(li, sel) { var e = li.querySelector(sel); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }
  /* a year sorts by its last year ("2021 to 2025" with 2025), then its first; "Now" is the newest, and "2026 to
     now" comes just after it */
  function yearKey(y) {
    var n = (y.match(/\d{4}/g) || []).map(Number), lo = n.length ? Math.min.apply(null, n) : 0;
    if (/now/i.test(y)) return [1e4, n.length ? lo : 1e4];
    return n.length ? [Math.max.apply(null, n), lo] : [0, 0];
  }
  var files = cards.map(function (li, i) {
    var kind = text(li, '.entry__kind'), year = text(li, '.entry__year');
    return { i: i, li: li, year: year, kind: kind, title: text(li, '.entry__title'), line: text(li, '.entry__line'), more: li.querySelector('.entry__more'), link: li.querySelector('.entry__link'), pic: li.getAttribute('data-icon') || KIND[kind.toLowerCase()] || 'text', key: yearKey(year) };
  });

  /* ---------- building ---------- */
  var uid = 0;
  function el(tag, cls, attrs, kids) {
    var e = d.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (k) { if (k) e.appendChild(typeof k === 'string' ? d.createTextNode(k) : k); });
    return e;
  }
  function pic(lines) { var s = el('span', 'mac__pic'); s.innerHTML = svg(lines, 1); return s; }
  function count(n) { return n + (n === 1 ? ' item' : ' items'); }

  var root = el('div', 'mac', { role: 'group', 'aria-label': 'The archive, on a Macintosh' });
  var screen = el('div', 'mac__screen is-off');
  var desk = el('div', 'mac__desk');
  root.appendChild(el('span', 'tape mac__tape mac__tape--a', { 'aria-hidden': 'true' }));
  root.appendChild(el('span', 'tape mac__tape mac__tape--b', { 'aria-hidden': 'true' }));
  root.appendChild(el('div', 'mac__case', null, [
    el('div', 'mac__bezel', null, [screen]),
    el('div', 'mac__chin', { 'aria-hidden': 'true' }, [el('span', 'mac__slot'), el('span', 'mac__badge')])
  ]));

  /* the menu bar: the poster's star, then File, View and Special; each a button that opens its list */
  var menubar = el('div', 'mac__menubar');
  var mark = el('span', 'mac__mark', { 'aria-hidden': 'true' }); mark.innerHTML = svg(tint(STAR, 'r'), 1);
  menubar.appendChild(mark);
  var MENUS = [
    ['File', [['open', 'Open'], ['close', 'Close Window']]],
    ['View', [['icons', 'as Icons'], ['list', 'as List'], null, ['sort-name', 'by Name'], ['sort-kind', 'by Kind'], ['sort-year', 'by Year']]],
    ['Special', [['restart', 'Restart']]]
  ];
  function tick() { var t = el('span', 'mac__tick', { 'aria-hidden': 'true' }); t.innerHTML = '<svg viewBox="0 0 12 12" focusable="false"><path d="M1.5 6.5l3 3L10.5 2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>'; return t; }
  var menus = MENUS.map(function (m) {
    var id = 'mac-menu-' + m[0].toLowerCase();
    var btn = el('button', 'mac__mt', { type: 'button', 'aria-expanded': 'false', 'aria-controls': id }, [m[0]]);
    var pop = el('div', 'mac__mp', { id: id, hidden: '' });
    m[1].forEach(function (it) {
      if (!it) { pop.appendChild(el('div', 'mac__sep', { 'aria-hidden': 'true' })); return; }
      pop.appendChild(el('button', 'mac__mi', { type: 'button', 'data-act': it[0] }, [tick(), it[1]]));
    });
    var wrap = el('div', 'mac__menu', null, [btn, pop]);
    menubar.appendChild(wrap);
    return { btn: btn, pop: pop, wrap: wrap };
  });

  /* the desk's own icons: the Archive disk (its window holds the files) and the Trash */
  function deskIcon(name, lines, act) {
    var b = el('button', 'mac__icon mac__icon--desk', { type: 'button', 'data-act': act }, [el('span', 'mac__pic'), el('span', 'mac__name', null, [name])]);
    b.firstChild.innerHTML = svg(lines, 2);
    return b;
  }
  var diskIcon = deskIcon('Archive', DISK, 'disk'), trashIcon = deskIcon('Trash', TRASH, 'trash');
  desk.appendChild(el('div', 'mac__deskicons', null, [diskIcon, trashIcon]));

  /* a window: a ruled title bar (the front window's only) with its close box, its title and its zoom box, then its
     header and its body */
  function win(kind, title, body, info) {
    var tid = 'mac-w' + (++uid);
    var close = el('button', 'mac__box mac__close', { type: 'button', 'aria-label': 'Close ' + title });
    var zoomBox = kind === 'trash' ? null : el('button', 'mac__box mac__zoombox', { type: 'button', 'aria-label': 'Zoom ' + title, 'aria-pressed': 'false' });
    var bar = el('div', 'mac__bar', null, [close, el('h3', 'mac__title', { id: tid }, [title]), zoomBox]);
    var w = el('section', 'mac__win mac__win--' + kind, { role: 'group', 'aria-labelledby': tid, tabindex: '-1', hidden: '' }, [bar, info || null, body]);
    w._close = close; w._zoom = zoomBox; w._bar = bar;
    return w;
  }
  /* the Archive window: its header (how many files, and how to open one), the columns' headings, the files */
  var COLS = [['name', 'Name'], ['kind', 'Kind'], ['year', 'Year']];
  var heads = COLS.map(function (c) { return el('button', 'mac__col mac__col--' + c[0], { type: 'button', 'data-sort': c[0], 'aria-pressed': 'false' }, [c[1]]); });
  var cols = el('div', 'mac__cols', { role: 'group', 'aria-label': 'Sort the files' }, heads);
  var grid = el('div', 'mac__grid', { role: 'group', 'aria-label': count(files.length) });
  files.forEach(function (f) {
    var b = el('button', 'mac__file', { type: 'button', tabindex: f.i ? '-1' : '0', 'data-i': String(f.i), 'aria-label': f.title + ', ' + f.kind + ', ' + f.year }, [
      el('span', 'mac__namecell', null, [pic(doc(f.pic)), el('span', null, null, [el('span', 'mac__name', { title: f.title }, [f.title]), el('span', 'mac__sub', null, [f.kind + ' · ' + f.year])])]),
      el('span', 'mac__kind', null, [f.kind]), el('span', 'mac__year', null, [f.year])
    ]);
    f.icon = b;
    grid.appendChild(b);
  });
  var hint = el('span', 'mac__hint');
  function hintText() { hint.textContent = (fine.matches ? 'Click' : 'Tap') + ' a file to open it'; }
  hintText(); if (fine.addEventListener) fine.addEventListener('change', hintText);
  var finder = win('finder', 'Archive', el('div', 'mac__body mac__body--finder', null, [cols, grid]), el('p', 'mac__info', null, [el('span', null, null, [count(files.length)]), hint]));
  var trash = win('trash', 'Trash', el('div', 'mac__body mac__body--trash'), el('p', 'mac__info', null, [el('span', null, null, [count(0)])]));
  desk.appendChild(finder); desk.appendChild(trash);
  var boot = el('div', 'mac__boot', { 'aria-hidden': 'true' });
  boot.innerHTML = svg(badge(), 2) + '<span class="mac__bootbar"><i></i></span>';
  desk.appendChild(boot);
  screen.appendChild(menubar); screen.appendChild(desk);

  list.parentNode.insertBefore(root, list);
  sheet.classList.add('has-mac');

  /* ---------- windows ---------- */
  var z = 10, open = [];                                          /* open windows, back to front */
  function front(w) {
    open = open.filter(function (o) { return o !== w; }); open.push(w);
    open.forEach(function (o, k) { o.style.zIndex = String(z + k); o.classList.toggle('is-front', k === open.length - 1); });
  }
  function frontWin() { return open[open.length - 1] || null; }
  function rectIn(e) { var a = e.getBoundingClientRect(), b = desk.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; }
  /* the old Mac's zoom: a few outlines grow from where the window comes from to where it lands (180ms) */
  function zoom(from, to, done) {
    if (reduce.matches || !from) { done(); return; }
    var n = 4, boxes = [], t0 = 0;
    for (var i = 0; i < n; i++) { var b = el('div', 'mac__zoom', { 'aria-hidden': 'true' }); desk.appendChild(b); boxes.push(b); }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 180);
      boxes.forEach(function (b, k) {
        var q = Math.max(0, Math.min(1, p * 1.75 - k * 0.25)), e = 1 - Math.pow(1 - q, 2);
        b.style.left = (from.x + (to.x - from.x) * e) + 'px'; b.style.top = (from.y + (to.y - from.y) * e) + 'px';
        b.style.width = (from.w + (to.w - from.w) * e) + 'px'; b.style.height = (from.h + (to.h - from.h) * e) + 'px';
        b.style.opacity = q > 0 && q < 1 ? '1' : '0';
      });
      if (p < 1) requestAnimationFrame(step);
      else { boxes.forEach(function (b) { b.remove(); }); done(); }
    }
    requestAnimationFrame(step);
  }
  function show(w, from, then) {
    if (!w.hidden) { front(w); if (then) then(); return; }
    w.hidden = false; front(w); place(w);
    var to = rectIn(w);
    w.style.visibility = 'hidden';
    zoom(from, to, function () { w.style.visibility = ''; if (then) then(); });
  }
  function hide(w, to) {
    if (w.hidden) return;
    var from = rectIn(w);
    w.hidden = true; open = open.filter(function (o) { return o !== w; }); if (open.length) front(open[open.length - 1]);
    if (to && !reduce.matches) zoom(from, to, function () {});
    if (w._doc && w.parentNode) w.remove();
    menuState();
  }
  /* where a window opens: files cascade from the Archive window's corner; on a narrow screen every window takes
     the whole desk */
  function narrow() { return desk.clientWidth < 520; }
  function place(w) {
    if (narrow()) { w.style.left = w.style.top = ''; return; }
    if (w._placed) return;
    var k = open.filter(function (o) { return o._doc; }).length - 1, W = desk.clientWidth, H = desk.clientHeight;   /* the other files open */
    var ww = w.offsetWidth, wh = w.offsetHeight;
    var x = w === finder ? 14 : w === trash ? W - ww - 120 : 64 + k * 26, y = w === finder ? 12 : w === trash ? 40 : 30 + k * 22;
    if (x + ww > W - 8) x = Math.max(8, W - ww - 8 - (k % 4) * 20);
    if (y + wh > H - 8) y = Math.max(8, H - wh - 8 - (k % 4) * 16);
    w.style.left = x + 'px'; w.style.top = y + 'px'; w._placed = true;
  }
  /* a file's window: the year and kind, the title, the card's line, then the rest of the card (its paragraphs and
     its list of details, copied as they are) and the card's link */
  var docs = {};
  function openFile(f, focus) {
    var w = docs[f.i];
    if (!w || !w.parentNode) {
      var body = el('div', 'mac__body mac__body--doc', null, [
        el('p', 'mac__meta', null, [f.year + ' · ' + f.kind]),
        el('p', 'mac__head', null, [f.title]),
        f.line ? el('p', 'mac__lead', null, [f.line]) : null
      ]);
      if (f.more) Array.prototype.forEach.call(f.more.children, function (n) { body.appendChild(n.cloneNode(true)); });
      if (f.link) { var go = f.link.cloneNode(true); go.className = 'mac__go'; go.removeAttribute('tabindex'); body.appendChild(el('p', 'mac__goline', null, [go])); }
      w = docs[f.i] = win('doc', f.title, body);
      w.setAttribute('role', 'dialog'); w._doc = true; w._file = f;
      desk.insertBefore(w, boot);
      wireWin(w);
    }
    select(f.icon);
    show(w, f.icon.offsetParent ? rectIn(f.icon) : null, function () { if (focus !== false) w.focus({ preventScroll: true }); menuState(); });
    return w;
  }
  function shut(w, refocus) {
    if (!w || w.hidden) return;
    var back = w._doc ? w._file.icon : w === finder ? diskIcon : trashIcon;
    var to = back.offsetParent ? rectIn(back) : null;
    hide(w, to);
    if (refocus) (back.offsetParent ? back : diskIcon).focus({ preventScroll: true });
  }
  /* the zoom box: the window fills the screen, and back */
  function zoomWin(w, on) {
    if (!w._zoom) return;
    on = on === undefined ? !w.classList.contains('is-zoomed') : on;
    w.classList.toggle('is-zoomed', on); w._zoom.setAttribute('aria-pressed', String(on));
  }
  /* the title bar drags its window (a mouse or pen; on a narrow screen windows stay put); a press anywhere on a
     window brings it to the front; a double click on the title bar zooms it, as the old one did */
  function wireWin(w) {
    w._close.addEventListener('click', function () { shut(w, true); });
    if (w._zoom) {
      w._zoom.addEventListener('click', function () { zoomWin(w); });
      w._bar.addEventListener('dblclick', function (e) { if (e.target === w._bar || e.target.classList.contains('mac__title')) zoomWin(w); });
    }
    w.addEventListener('pointerdown', function () { front(w); menuState(); });
    w._bar.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.mac__box') || e.pointerType === 'touch' || narrow() || w.classList.contains('is-zoomed')) return;
      e.preventDefault();
      var sx = e.clientX, sy = e.clientY, ox = w.offsetLeft, oy = w.offsetTop, W = desk.clientWidth, H = desk.clientHeight;
      w._bar.setPointerCapture(e.pointerId);
      function move(ev) {
        /* the left edge (and so the close box) and the title bar stay on the screen */
        var x = Math.max(0, Math.min(W - 80, ox + ev.clientX - sx)), y = Math.max(0, Math.min(H - 40, oy + ev.clientY - sy));
        w.style.left = Math.round(x) + 'px'; w.style.top = Math.round(y) + 'px';
      }
      function up() { w._bar.removeEventListener('pointermove', move); w._bar.removeEventListener('pointerup', up); w._bar.removeEventListener('pointercancel', up); }
      w._bar.addEventListener('pointermove', move); w._bar.addEventListener('pointerup', up); w._bar.addEventListener('pointercancel', up);
    });
  }
  wireWin(finder); wireWin(trash);
  /* a smaller screen (a resized window) keeps every window's left edge and title bar on it */
  if ('ResizeObserver' in window) new ResizeObserver(function () {
    var W = desk.clientWidth, H = desk.clientHeight;
    open.forEach(function (w) { if (!w.style.left) return; w.style.left = Math.max(0, Math.min(W - 80, w.offsetLeft)) + 'px'; w.style.top = Math.max(0, Math.min(H - 40, w.offsetTop)) + 'px'; });
  }).observe(desk);

  /* ---------- the files: one press opens; arrows move between them, as a list or as icons; typing a name's first
     letters goes to it ---------- */
  var selected = null;
  function select(b) {
    if (selected) selected.classList.remove('is-sel');
    selected = b; if (b) b.classList.add('is-sel');
    if (b && b.classList.contains('mac__file')) files.forEach(function (f) { f.icon.tabIndex = f.icon === b ? 0 : -1; });
    menuState();
  }
  function order() { return Array.prototype.slice.call(grid.children); }
  grid.addEventListener('click', function (e) { var b = e.target.closest('.mac__file'); if (b) openFile(files[+b.getAttribute('data-i')]); });
  grid.addEventListener('focusin', function (e) { var b = e.target.closest('.mac__file'); if (b) select(b); });
  function across() {
    if (!grid.classList.contains('is-icons')) return 1;
    var o = order(), top = o[0].offsetTop, n = 0;
    o.forEach(function (b) { if (b.offsetTop === top) n++; });
    return Math.max(1, n);
  }
  var typed = '', typedT = 0;
  grid.addEventListener('keydown', function (e) {
    var b = e.target.closest('.mac__file'); if (!b) return;
    var o = order(), i = o.indexOf(b), c = across(), n = o.length;
    if (e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      clearTimeout(typedT); typed += e.key.toLowerCase(); typedT = setTimeout(function () { typed = ''; }, 800);
      var hit = o.filter(function (x) { return files[+x.getAttribute('data-i')].title.toLowerCase().indexOf(typed) === 0; })[0];
      if (hit) { e.preventDefault(); hit.focus(); }
      return;
    }
    var to = { ArrowDown: i + c, ArrowUp: i - c, Home: 0, End: n - 1 }[e.key];
    if (c > 1) { if (e.key === 'ArrowRight') to = i + 1; else if (e.key === 'ArrowLeft') to = i - 1; }
    if (to === undefined) return;
    e.preventDefault(); e.stopPropagation();          /* the deck's own arrows (next and last sheet) wait outside */
    o[Math.max(0, Math.min(n - 1, to))].focus();
  });
  diskIcon.addEventListener('click', function () { select(diskIcon); show(finder, rectIn(diskIcon), function () { var s = files.filter(function (f) { return f.icon.tabIndex === 0; })[0]; (s || files[0]).icon.focus({ preventScroll: true }); }); });
  trashIcon.addEventListener('click', function () { select(trashIcon); show(trash, rectIn(trashIcon), function () { trash.focus({ preventScroll: true }); }); });
  desk.addEventListener('pointerdown', function (e) { if (e.target === desk) select(null); });

  /* ---------- the order: by a column, its heading pressed, a triangle for its direction (names A to Z, years newest
     first; the same heading again turns it round). Files that tie keep the cards' order. ---------- */
  var by = 'year', dir = -1;
  var WORDS = { name: ['A to Z', 'Z to A'], kind: ['A to Z', 'Z to A'], year: ['oldest first', 'newest first'] };
  function cmp(a, b) {
    if (by === 'year') return dir * ((a.key[0] - b.key[0]) || (a.key[1] - b.key[1]));
    var x = (by === 'name' ? a.title : a.kind).toLowerCase(), y = (by === 'name' ? b.title : b.kind).toLowerCase();
    return dir * x.localeCompare(y) || (b.key[0] - a.key[0]);
  }
  function setSort(col, way) {
    if (way === undefined) way = col === by ? -dir : (col === 'year' ? -1 : 1);
    by = col; dir = way;
    files.slice().sort(function (a, b) { return cmp(a, b) || a.i - b.i; }).forEach(function (f) { grid.appendChild(f.icon); });
    heads.forEach(function (h) {
      var c = h.getAttribute('data-sort'), on = c === by, name = h.textContent;
      h.setAttribute('aria-pressed', String(on));
      h.setAttribute('data-dir', on ? (dir < 0 ? 'down' : 'up') : '');
      h.setAttribute('aria-label', on ? name + ', ' + WORDS[c][dir < 0 ? 1 : 0] : 'Sort by ' + name);
    });
    menuState();
  }
  heads.forEach(function (h) { h.addEventListener('click', function () { setSort(h.getAttribute('data-sort')); }); });
  setSort('year', -1);

  /* ---------- the menus ---------- */
  var view = 'list';
  function setView(v) {
    view = v === 'icons' ? 'icons' : 'list';
    grid.classList.toggle('is-icons', view === 'icons'); finder.classList.toggle('is-icons', view === 'icons');
    menuState();
  }
  function menuState() {
    menus.forEach(function (m) {
      Array.prototype.forEach.call(m.pop.querySelectorAll('.mac__mi'), function (b) {
        var a = b.getAttribute('data-act'), off = false, on = null;
        if (a === 'open') off = !selected;
        if (a === 'close') off = !frontWin();
        if (a === 'icons' || a === 'list') on = view === a;
        if (/^sort-/.test(a)) on = by === a.slice(5);
        if (on !== null) b.setAttribute('aria-pressed', String(on));
        b.disabled = off;
      });
    });
  }
  function closeMenus(refocus) {
    menus.forEach(function (m) { if (m.btn.getAttribute('aria-expanded') === 'true') { m.btn.setAttribute('aria-expanded', 'false'); m.pop.hidden = true; if (refocus) m.btn.focus({ preventScroll: true }); } });
  }
  function openMenu(m, focusFirst) {
    closeMenus(false); menuState();
    m.btn.setAttribute('aria-expanded', 'true'); m.pop.hidden = false;
    if (focusFirst) { var first = m.pop.querySelector('.mac__mi:not(:disabled)'); if (first) first.focus({ preventScroll: true }); }
  }
  menus.forEach(function (m, k) {
    m.btn.addEventListener('click', function () { if (m.btn.getAttribute('aria-expanded') === 'true') closeMenus(false); else openMenu(m, false); });
    /* with a menu open, pointing at another title opens that one, as on the old Mac */
    m.btn.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' && menus.some(function (o) { return o !== m && o.btn.getAttribute('aria-expanded') === 'true'; })) openMenu(m, false); });
    m.btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); openMenu(m, true); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); menus[(k + (e.key === 'ArrowRight' ? 1 : -1) + menus.length) % menus.length].btn.focus(); }
    });
    m.pop.addEventListener('keydown', function (e) {
      var items = Array.prototype.slice.call(m.pop.querySelectorAll('.mac__mi:not(:disabled)')), i = items.indexOf(d.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); if (items.length) items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus(); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); var next = menus[(k + (e.key === 'ArrowRight' ? 1 : -1) + menus.length) % menus.length]; openMenu(next, true); }
    });
    m.pop.addEventListener('click', function (e) {
      var b = e.target.closest('.mac__mi'); if (!b || b.disabled) return;
      var a = b.getAttribute('data-act'), back = selected;
      closeMenus(false);
      if (a === 'open' && back) back.click();
      else if (a === 'close') shut(frontWin(), true);
      else if (a === 'icons' || a === 'list') { setView(a); show(finder, rectIn(diskIcon)); m.btn.focus({ preventScroll: true }); }
      else if (/^sort-/.test(a)) { setSort(a.slice(5), a.slice(5) === by ? dir : undefined); show(finder, rectIn(diskIcon)); m.btn.focus({ preventScroll: true }); }
      else if (a === 'restart') start(true);
    });
    m.wrap.addEventListener('focusout', function (e) { if (!m.wrap.contains(e.relatedTarget)) { m.btn.setAttribute('aria-expanded', 'false'); m.pop.hidden = true; } });
  });
  d.addEventListener('pointerdown', function (e) { if (!menubar.contains(e.target)) closeMenus(false); });
  /* Escape: an open menu first, then the front window. Arrow keys belong to the Mac while it has the focus (the
     deck's own arrows, to the next and last sheet, wait outside it) */
  root.addEventListener('keydown', function (e) {
    if (/^Arrow/.test(e.key)) { e.stopPropagation(); return; }
    if (e.key !== 'Escape') return;
    var openMenuNow = menus.some(function (m) { return m.btn.getAttribute('aria-expanded') === 'true'; });
    if (openMenuNow) { e.preventDefault(); e.stopPropagation(); closeMenus(true); return; }
    var w = frontWin();
    if (w && w.contains(d.activeElement)) { e.preventDefault(); e.stopPropagation(); shut(w, true); }
  });

  /* ---------- the screen coming on: the first time the sheet arrives, the star badge on the desk and a bar filling
     under it, then the menu bar and the Archive window. Special, Restart does it again. ---------- */
  var started = false, timer = 0;
  function start(again) {
    clearTimeout(timer);
    open.slice().forEach(function (w) { if (w._doc) { w.hidden = true; w.remove(); } else { w.hidden = true; zoomWin(w, false); } });
    open = []; docs = {}; select(null);
    if (reduce.matches) { screen.className = 'mac__screen is-on'; show(finder, null); menuState(); if (again) finder.focus({ preventScroll: true }); return; }
    screen.className = 'mac__screen is-booting';
    timer = setTimeout(function () {
      screen.className = 'mac__screen is-on';
      show(finder, rectIn(diskIcon), function () { if (again) finder.focus({ preventScroll: true }); });
    }, again ? 800 : 700);
  }
  function arrive() { if (started || !sheet.classList.contains('is-in')) return; started = true; start(false); }
  new MutationObserver(arrive).observe(sheet, { attributes: true, attributeFilter: ['class'] });
  if (reduce.matches) { started = true; start(false); } else arrive();

  /* Find (in the index) going to a card opens its file here instead: the deck still lands on the sheet, and the
     file's window opens once it has */
  d.addEventListener('v3:find', function (e) {
    var t = e.detail && e.detail.target, f = t && files.filter(function (x) { return x.li === t || x.li.contains(t); })[0];
    if (!f || !root.getClientRects().length) return;   /* the wall of cards (or forced colours): the card itself */
    e.detail.target = root; e.detail.handled = true;
    var tries = 0;
    (function wait() {
      if (!started && tries++ < 20) { arrive(); setTimeout(wait, 100); return; }
      setTimeout(function () { var w = openFile(f, false); w.classList.remove('is-found'); void w.offsetWidth; w.classList.add('is-found'); setTimeout(function () { w.classList.remove('is-found'); }, 2700); }, reduce.matches ? 0 : 450);
    })();
  });
  window.__v3mac = { files: files, open: openFile, shut: shut, view: setView, sort: setSort, zoom: zoomWin, start: start, get windows() { return open.slice(); } };
})();
