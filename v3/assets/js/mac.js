/* v3 poster · the Macintosh. The archive sheet's index cards become the files on a Macintosh of the mid-nineties,
   taped onto the sheet: the Platinum desktop in the poster's colours, with a menu bar, the Archive disk, the Trash and
   the Archive window listing one file for each card, a window for each file that holds the card's whole text, and
   the desk accessories of the star menu (Alarm Clock, Calculator, CD Player, Desktop Patterns, Note Pad, Puzzle).
   Everything about the archive is built from the sheet's own list (.entries, written from archive/*.md by
   tools/archive.mjs), so a new entry is a new file: its kind picks the file's picture, or its "icon" names one. Songs
   and albums are the CD Player's tracks, and what is still going (a year "to now", or "Now") lies out on the desk.
   The desk is left as a desk in use: its icons where they were last put down (the macDesk toggle, toggles.js, lines
   them up instead), and Special, Clean Up Desktop tidies them. Icons drag with a mouse; the arrow keys walk them.
   The cards stay the page's own text: without the script, in print and in forced colours they are what shows.
   The Archive window lists the files with their kind and year, newest first; a column's heading sorts by it, and
   View shows them as icons instead. One click (or Return) opens a file, as on a phone, where the old Mac wanted
   two. A window drags by its title bar, its zoom box fills the screen with it, and Escape closes it. Movement
   (the screen coming on, the outlines of a window opening, a puzzle tile sliding) stops under prefers-reduced-motion. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var sheet = d.getElementById('archive'), list = sheet && sheet.querySelector('.entries');
  if (!list || !window.matchMedia || !('CustomEvent' in window)) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  /* ---------- the pictures: 32 by 32 dots. '#' ink, '.' white, '+' light grey, '-' grey, '=' dark grey,
     'r' vermilion, ' ' the desk behind ---------- */
  function blank(w, h) { var g = []; for (var y = 0; y < h; y++) { g.push([]); for (var x = 0; x < w; x++) g[y].push(' '); } return g; }
  function rows(g) { return g.map(function (r) { return r.join(''); }); }
  function put(g, x, y, c) { x = Math.round(x); y = Math.round(y); if (y >= 0 && y < g.length && x >= 0 && x < g[0].length) g[y][x] = c; }
  function box(g, x0, y0, x1, y1, fill, edge) { for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) put(g, x, y, edge && (x === x0 || x === x1 || y === y0 || y === y1) ? edge : fill); }
  function round(g, cx, cy, r, fill, edge) { for (var y = 0; y < g.length; y++) for (var x = 0; x < g[0].length; x++) { var q = Math.hypot(x - cx, y - cy); if (q <= r) put(g, x, y, edge && q > r - 1.15 ? edge : fill); } }
  function line(g, x0, y0, x1, y1, c) { var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (var i = 0; i <= n; i++) put(g, x0 + (x1 - x0) * i / (n || 1), y0 + (y1 - y0) * i / (n || 1), c); }
  /* a drop shadow one dot to the lower right of whatever is drawn */
  function shade(g) { var s = rows(g); for (var y = 1; y < g.length; y++) for (var x = 1; x < g[0].length; x++) if (s[y].charAt(x) === ' ' && s[y - 1].charAt(x - 1) !== ' ' && s[y - 1].charAt(x - 1) !== '-') g[y][x] = '-'; return rows(g); }
  /* a 16-wide emblem for a document's face, drawn on white ('.' lets the page show) */
  function emblem(h, draw) { var g = blank(16, h); draw(g); return rows(g).map(function (r) { return r.replace(/ /g, '.'); }); }
  var EMBLEMS = {
    games: ['.......rr.......', '......rrrr......', '......rrrr......', '.......##.......', '.......##.......', '.......##.......', '..############..', '.#............#.', '.#.##......==.#.', '.#.##......==.#.', '.#............#.', '..############..'],
    film: ['################', '#==============#', '#=====r========#', '#=====rr=======#', '#=====rrr======#', '#=====rrrr=====#', '#=====rrr======#', '#=====rr=======#', '#=====r========#', '#==============#', '################', '......####......', '....########....'],
    chart: ['...........rrr..', '...........rrr..', '.......===.rrr..', '.......===.rrr..', '...---.===.rrr..', '...---.===.rrr..', '...---.===.rrr..', '...---.===.rrr..', '.##############.'],
    notes: ['.....rrrrrrrrrr.', '.....rrrrrrrrrr.', '.....#........#.', '.....#........#.', '.....#........#.', '.....#........#.', '.....#........#.', '..####.....####.', '.#####....#####.', '.#####....#####.', '..###......###..'],
    maze: ['#######.#######.', '#.............#.', '#.#####.#####.#.', '#.#.........#.#.', '#.#.#######.#.#.', '#.#.#.....#.#.#.', '#.#.#.rr..#.#.#.', '#...#.rr#.#####.', '#####.#.#.....#.', '#.....#.#####.#.', '#######.......#.', '..............#.'],
    robot: ['.......##.......', '......#rr#......', '.......##.......', '..############..', '..#++++++++++#..', '..#+rrr++rrr+#..', '###+rrr++rrr+###', '###++++++++++###', '..#++######++#..', '..#++++++++++#..', '..############..', '.....#....#.....', '...####..####...'],
    rocket: ['.......##.......', '......#++#......', '.....#++++#.....', '.....#++++#.....', '.....#+##+#.....', '.....#+##+#.....', '.....#++++#.....', '.....#++++#.....', '....##++++##....', '...###++++###...', '...##.####.##...', '......rrrr......', '.......rr.......'],
    text: ['.###########....', '................', '.#############..', '................', '.##########.....', '................', '.############...', '................', '.########.......'],
    /* a compact disc, its label ring vermilion */
    disc: emblem(12, function (g) { round(g, 7.5, 5.5, 5.7, '+', '#'); round(g, 7.5, 5.5, 3.1, 'r'); round(g, 7.5, 5.5, 1.4, '.', '#'); put(g, 5, 2, '.'); put(g, 4, 3, '.'); }),
    /* a song: two notes on a beam */
    song: ['....############', '....############', '....#.........##', '....#.........##', '....#.........##', '....#.........##', '....#.........##', '.####.....######', '#####....#######', '#####....#######', '.###......#####.']
  };
  /* a card's kind picks its file's picture */
  var KIND = { games: 'games', 'music video': 'film', video: 'film', film: 'film', statistics: 'chart', arrangement: 'notes', music: 'notes', 'game design': 'maze', robotics: 'robot', rocketry: 'rocket',
    song: 'disc', single: 'disc', album: 'disc', ep: 'disc', playlist: 'disc', mixtape: 'disc' };
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
  /* the desk accessories' pictures, drawn on the dots: a calculator, the fifteen puzzle, an alarm clock with its
     bells, a pad with its spiral and a red margin, a disc rising out of its player, a swatch of checks */
  var PICS = {
    calc: (function () { var g = blank(32, 32); box(g, 7, 2, 24, 28, '+', '#'); box(g, 10, 5, 21, 10, '=', '#'); line(g, 15, 8, 19, 8, '.'); for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) box(g, 10 + c * 3, 13 + r * 4, 11 + c * 3, 15 + r * 4, r === 3 && c === 3 ? 'r' : '.', null); for (r = 0; r < 4; r++) for (c = 0; c < 4; c++) { put(g, 12 + c * 3, 15 + r * 4, '='); } return shade(g); })(),
    puzzle: (function () { var g = blank(32, 32); box(g, 3, 3, 27, 27, '=', '#'); for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) if (r < 3 || c < 3) box(g, 5 + c * 6, 5 + r * 6, 9 + c * 6, 9 + r * 6, r === 0 && c === 0 ? 'r' : '.', '#'); return shade(g); })(),
    clock: (function () { var g = blank(32, 32); round(g, 8.5, 7.5, 4.2, 'r', '#'); round(g, 22.5, 7.5, 4.2, 'r', '#'); line(g, 8, 27, 6, 29, '#'); line(g, 23, 27, 25, 29, '#'); round(g, 15.5, 17.5, 11, '.', '#'); line(g, 15, 18, 15, 10, '#'); line(g, 16, 18, 21, 18, '#'); put(g, 15, 7, '#'); put(g, 26, 17, '#'); put(g, 15, 28, '#'); put(g, 5, 17, '#'); return shade(g); })(),
    notepad: (function () { var g = blank(32, 32); box(g, 6, 4, 25, 29, '.', '#'); for (var x = 8; x <= 23; x += 3) { put(g, x, 2, '#'); put(g, x, 3, '#'); put(g, x, 4, '='); } for (var y = 9; y <= 26; y += 3) line(g, 8, y, 23, y, '-'); line(g, 11, 6, 11, 27, 'r'); return shade(g); })(),
    cd: (function () { var g = blank(32, 32); round(g, 15.5, 11.5, 9.5, '+', '#'); round(g, 15.5, 11.5, 4.4, 'r'); round(g, 15.5, 11.5, 1.6, ' ', '#'); put(g, 11, 6, '.'); put(g, 10, 7, '.'); box(g, 2, 17, 29, 28, '+', '#'); line(g, 6, 20, 25, 20, '#'); box(g, 5, 23, 12, 25, '=', null); put(g, 25, 24, 'r'); put(g, 26, 24, 'r'); return shade(g); })(),
    patterns: (function () { var g = blank(32, 32); box(g, 4, 4, 27, 27, '.', '#'); for (var y = 6; y <= 25; y++) for (var x = 6; x <= 25; x++) if (((x >> 1) + (y >> 1)) % 2) put(g, x, y, '#'); box(g, 18, 18, 25, 25, 'r', '#'); return shade(g); })()
  };
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
    return { i: i, li: li, year: year, kind: kind, title: text(li, '.entry__title'), by: text(li, '.entry__by'), line: text(li, '.entry__line'), more: li.querySelector('.entry__more'),
      links: Array.prototype.slice.call(li.querySelectorAll('.entry__listen, .entry__link')), cover: li.querySelector('.entry__cover'), listen: li.querySelector('.entry__listen'),
      music: li.classList.contains('entry--music'), pic: li.getAttribute('data-icon') || KIND[kind.toLowerCase()] || 'text', key: yearKey(year) };
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
  function pic(lines, px) { var s = el('span', 'mac__pic'); s.innerHTML = svg(lines, px || 1); return s; }
  function count(n) { return n + (n === 1 ? ' item' : ' items'); }
  var ICON = { '<': 'M8 1.5 3 6l5 4.5', '>': 'M4 1.5 9 6l-5 4.5' };
  function glyph(k) { return '<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="' + ICON[k] + '" fill="none" stroke="currentColor" stroke-width="2"/></svg>'; }

  var root = el('div', 'mac', { role: 'group', 'aria-label': 'The archive, on a Macintosh' });
  var screen = el('div', 'mac__screen is-off');
  var desk = el('div', 'mac__desk');
  root.appendChild(el('span', 'tape mac__tape mac__tape--a', { 'aria-hidden': 'true' }));
  root.appendChild(el('span', 'tape mac__tape mac__tape--b', { 'aria-hidden': 'true' }));
  root.appendChild(el('div', 'mac__case', null, [
    el('div', 'mac__bezel', null, [screen]),
    el('div', 'mac__chin', { 'aria-hidden': 'true' }, [el('span', 'mac__slot'), el('span', 'mac__badge')])
  ]));

  /* the desk accessories, as the star menu lists them (the CD Player once the archive holds a song or an album) */
  var heard = files.some(function (f) { return f.music; });
  var APPS = [['clock', 'Alarm Clock'], ['calc', 'Calculator'], ['cd', 'CD Player'], ['patterns', 'Desktop Patterns'], ['notepad', 'Note Pad'], ['puzzle', 'Puzzle']].filter(function (a) { return a[0] !== 'cd' || heard; });
  var APPNAME = {}; APPS.forEach(function (a) { APPNAME[a[0]] = a[1]; });

  /* the menu bar: the poster's star (the desk accessories), then File, View and Special; each a button that opens
     its list */
  var menubar = el('div', 'mac__menubar');
  var MENUS = [
    ['star', APPS.map(function (a) { return ['app-' + a[0], a[1]]; })],
    ['File', [['open', 'Open'], ['close', 'Close Window']]],
    ['View', [['icons', 'as Icons'], ['list', 'as List'], null, ['sort-name', 'by Name'], ['sort-kind', 'by Kind'], ['sort-year', 'by Year']]],
    ['Special', [['cleanup', 'Clean Up Desktop'], null, ['restart', 'Restart']]]
  ];
  function tick() { var t = el('span', 'mac__tick', { 'aria-hidden': 'true' }); t.innerHTML = '<svg viewBox="0 0 12 12" focusable="false"><path d="M1.5 6.5l3 3L10.5 2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>'; return t; }
  var menus = MENUS.map(function (m) {
    var star = m[0] === 'star', id = 'mac-menu-' + m[0].toLowerCase();
    var btn = el('button', 'mac__mt' + (star ? ' mac__mt--star' : ''), star ? { type: 'button', 'aria-expanded': 'false', 'aria-controls': id, 'aria-label': 'Desk accessories' } : { type: 'button', 'aria-expanded': 'false', 'aria-controls': id }, [star ? null : m[0]]);
    if (star) btn.innerHTML = svg(tint(STAR, 'r'), 1);
    var pop = el('div', 'mac__mp', { id: id, hidden: '' });
    m[1].forEach(function (it) {
      if (!it) { pop.appendChild(el('div', 'mac__sep', { 'aria-hidden': 'true' })); return; }
      pop.appendChild(el('button', 'mac__mi', { type: 'button', 'data-act': it[0] }, [tick(), it[1]]));
    });
    var wrap = el('div', 'mac__menu', null, [btn, pop]);
    menubar.appendChild(wrap);
    return { btn: btn, pop: pop, wrap: wrap };
  });

  /* ---------- the desk's icons: the Archive disk, what is still going (lying out), three of the accessories (aliases,
     their names in italics as the old Mac set an alias; all of them are in the star menu) and the Trash ---------- */
  var deskWrap = el('div', 'mac__deskicons', { role: 'group', 'aria-label': 'Desktop' });
  var icons = [];
  function deskIcon(key, name, lines, act, extra) {
    var b = el('button', 'mac__icon mac__icon--desk' + (extra ? ' ' + extra : ''), { type: 'button', 'data-act': act, 'data-key': key, tabindex: icons.length ? '-1' : '0' }, [pic(lines, 2), el('span', 'mac__name', { title: name }, [name])]);
    b._key = key; icons.push(b); deskWrap.appendChild(b);
    return b;
  }
  var diskIcon = deskIcon('disk', 'Archive', DISK, 'disk');
  /* what is still being made lies out on the desk: the two newest, as many as the desk holds beside its accessories
     (music is played, not made, so it stays in the Archive and the CD Player) */
  var loose = files.filter(function (f) { return /now/i.test(f.year) && !f.music; }).slice(0, 2);
  loose.forEach(function (f, k) { f.desk = deskIcon('loose' + k, f.title, doc(f.pic), 'file', 'mac__icon--doc'); f.desk._file = f; });
  ['cd', 'puzzle', 'notepad'].filter(function (k) { return APPNAME[k]; }).forEach(function (k) { deskIcon(k, APPNAME[k], PICS[k], 'app', 'mac__icon--alias'); });
  var trashIcon = deskIcon('trash', 'Trash', TRASH, 'trash');
  desk.appendChild(deskWrap);

  /* where each lies: two loose columns beside the Archive window as it opens, a little out of line and overlapping
     here and there (each as [from the right edge, how far down the desk's height]); Clean Up (and the tidy toggle)
     lines them up down the right edge instead */
  var MESSY = { disk: [100, 0], cd: [214, 0.06], loose0: [108, 0.33], puzzle: [200, 0.41], notepad: [98, 0.66], loose1: [226, 0.75], loose2: [150, 0.9], trash: [100, 1] };
  var IW = 96, IH = 100;
  function narrow() { return desk.clientWidth < 520; }
  function messyAt() {
    var W = desk.clientWidth, H = desk.clientHeight, at = {};
    Object.keys(MESSY).forEach(function (k) { at[k] = [(W - MESSY[k][0]) / W, (6 + MESSY[k][1] * (H - IH - 8)) / H]; });
    return at;
  }
  function tidyAt() {
    var W = desk.clientWidth, H = desk.clientHeight, rowsN = Math.max(1, Math.floor((H - 8) / IH)), at = {}, k = 0;
    icons.forEach(function (b) {
      if (b === trashIcon) return;
      var col = Math.floor(k / rowsN), row = k % rowsN;
      if (col === 0 && row === rowsN - 1) { k++; col = Math.floor(k / rowsN); row = k % rowsN; }   /* the corner is the Trash's */
      at[b._key] = [(W - 6 - IW - col * (IW + 4)) / W, (6 + row * IH) / H]; k++;
    });
    at.trash = [(W - 6 - IW) / W, (H - IH - 2) / H];
    return at;
  }
  function placeIcon(b) {
    var W = desk.clientWidth, H = desk.clientHeight, f = b._at || [0, 0];
    b.style.left = Math.round(Math.max(2, Math.min(W - IW - 2, f[0] * W))) + 'px';
    b.style.top = Math.round(Math.max(2, Math.min(H - IH, f[1] * H))) + 'px';
  }
  var tidied = false;
  function layoutIcons(reset) {
    if (reset) tidied = html.getAttribute('data-mac-desk') === 'tidy';
    if (!desk.clientWidth || !desk.clientHeight) return;          /* not on screen yet: laid out once it is */
    IH = Math.max.apply(null, icons.map(function (b) { return b.offsetHeight; })) + 2 || IH;   /* the tallest, its name on two lines */
    var at = tidied || narrow() ? tidyAt() : messyAt();
    icons.forEach(function (b) { if (reset || !b._moved) b._at = (at[b._key] || at.disk).slice(); if (reset) b._moved = false; placeIcon(b); });
  }
  function cleanUp() { tidied = true; icons.forEach(function (b) { b._moved = false; }); layoutIcons(false); }

  /* a window: a ruled title bar (the front window's only) with its close box, its title and its zoom box, then its
     header and its body */
  function win(kind, title, body, info) {
    var tid = 'mac-w' + (++uid);
    var close = el('button', 'mac__box mac__close', { type: 'button', 'aria-label': 'Close ' + title });
    var zoomBox = /trash|app/.test(kind) ? null : el('button', 'mac__box mac__zoombox', { type: 'button', 'aria-label': 'Zoom ' + title, 'aria-pressed': 'false' });
    var bar = el('div', 'mac__bar', null, [close, el('h3', 'mac__title', { id: tid }, [title]), zoomBox]);
    var w = el('section', 'mac__win ' + kind.split(' ').map(function (k) { return 'mac__win--' + k; }).join(' '), { role: 'group', 'aria-labelledby': tid, tabindex: '-1', hidden: '' }, [bar, info || null, body]);
    w._close = close; w._zoom = zoomBox; w._bar = bar;
    return w;
  }
  /* the Archive window: the columns' headings, then the files */
  var COLS = [['name', 'Name'], ['kind', 'Kind'], ['year', 'Year']];
  var heads = COLS.map(function (c) { return el('button', 'mac__col mac__col--' + c[0], { type: 'button', 'data-sort': c[0], 'aria-pressed': 'false' }, [c[1]]); });
  var cols = el('div', 'mac__cols', { role: 'group', 'aria-label': 'Sort the files' }, heads);
  var grid = el('div', 'mac__grid', { role: 'group', 'aria-label': count(files.length) });
  files.forEach(function (f) {
    var b = el('button', 'mac__file', { type: 'button', tabindex: f.i ? '-1' : '0', 'data-i': String(f.i), 'aria-label': f.title + (f.by ? ', ' + f.by : '') + ', ' + f.kind + ', ' + f.year }, [
      el('span', 'mac__namecell', null, [pic(doc(f.pic)), el('span', null, null, [el('span', 'mac__name', { title: f.title }, [f.title]), el('span', 'mac__sub', null, [f.kind + ' · ' + f.year])])]),
      el('span', 'mac__kind', null, [f.kind]), el('span', 'mac__year', null, [f.year])
    ]);
    f.icon = b;
    grid.appendChild(b);
  });
  var finder = win('finder', 'Archive', el('div', 'mac__body mac__body--finder', null, [cols, grid]));
  var trash = win('trash', 'Trash', el('div', 'mac__body mac__body--trash'));
  finder._back = diskIcon; trash._back = trashIcon;
  desk.appendChild(finder); desk.appendChild(trash);
  var boot = el('div', 'mac__boot', { 'aria-hidden': 'true' });
  boot.innerHTML = svg(badge(), 2) + '<span class="mac__bootbar"><i></i></span>';
  screen.appendChild(menubar); screen.appendChild(desk); screen.appendChild(boot);

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
    if (w._start) w._start();
    var to = rectIn(w);
    w.style.visibility = 'hidden';
    zoom(from, to, function () { w.style.visibility = ''; if (then) then(); });
  }
  function hide(w, to) {
    if (w.hidden) return;
    var from = rectIn(w);
    w.hidden = true; open = open.filter(function (o) { return o !== w; }); if (open.length) front(open[open.length - 1]);
    if (w._stop) w._stop();
    if (to && !reduce.matches) zoom(from, to, function () {});
    if (w._doc && w.parentNode) w.remove();
    menuState();
  }
  /* where a window opens: files cascade from the Archive window's corner, an accessory opens beside its icon; on a
     narrow screen every window takes the whole desk (an accessory sits in its middle) */
  function place(w) {
    if (narrow()) { w.style.left = w.style.top = ''; return; }
    if (w._placed) return;
    var k = open.filter(function (o) { return o._doc; }).length - 1, W = desk.clientWidth, H = desk.clientHeight;   /* the other files open */
    var ww = w.offsetWidth, wh = w.offsetHeight, x, y;
    if (w === finder) { x = 14; y = 12; }
    else if (w === trash) { x = W - ww - 120; y = 40; }
    else if (w._app && w._back) { var ic = rectIn(w._back); x = ic.x - ww - 10; y = ic.y - 12; if (x < 8) x = ic.x + ic.w + 10; }
    else if (w._app) { var n = open.filter(function (o) { return o._app; }).length - 1; x = 40 + n * 24; y = 18 + n * 20; }   /* from the star menu */
    else { x = 64 + k * 26; y = 30 + k * 22; }
    var step = Math.max(0, k) % 4;
    if (x + ww > W - 8) x = Math.max(8, W - ww - 8 - step * 20);
    if (y + wh > H - 8) y = Math.max(8, H - wh - 8 - step * 16);
    w.style.left = Math.max(0, x) + 'px'; w.style.top = Math.max(0, y) + 'px'; w._placed = true;
  }
  /* a file's window: the year and kind, the title, the artist, the card's line, then the rest of the card (its
     cover, its paragraphs and its list of details, copied as they are) and the card's links */
  var docs = {};
  function openFile(f, focus, from) {
    var w = docs[f.i];
    if (!w || !w.parentNode) {
      var body = el('div', 'mac__body mac__body--doc', null, [
        f.cover ? el('p', 'mac__cover', null, [f.cover.cloneNode(true)]) : null,
        el('p', 'mac__meta', null, [f.year + ' · ' + f.kind]),
        el('p', 'mac__head', null, [f.title]),
        f.by ? el('p', 'mac__by', null, [f.by]) : null,
        f.line ? el('p', 'mac__lead', null, [f.line]) : null
      ]);
      if (f.more) Array.prototype.forEach.call(f.more.children, function (n) { body.appendChild(n.cloneNode(true)); });
      if (f.links.length) body.appendChild(el('p', 'mac__goline', null, f.links.map(function (a) { var go = a.cloneNode(true); go.className = 'mac__go'; go.removeAttribute('tabindex'); return go; })));
      w = docs[f.i] = win('doc', f.title, body);
      w.setAttribute('role', 'dialog'); w._doc = true; w._file = f;
      desk.appendChild(w);
      wireWin(w);
    }
    var origin = from || f.icon;
    w._back = origin;                                             /* it closes back to where it was opened from */
    select(origin);
    show(w, origin.offsetParent ? rectIn(origin) : null, function () { if (focus !== false) w.focus({ preventScroll: true }); menuState(); });
    return w;
  }
  function shut(w, refocus) {
    if (!w || w.hidden) return;
    var back = w._back && w._back.offsetParent ? w._back : diskIcon;
    var to = back.offsetParent ? rectIn(back) : null;
    hide(w, to);
    if (refocus) back.focus({ preventScroll: true });
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
  /* a smaller screen (a resized window) keeps every window's left edge and title bar on it, and the icons where they
     lie in proportion */
  if ('ResizeObserver' in window) new ResizeObserver(function () {
    var W = desk.clientWidth, H = desk.clientHeight;
    open.forEach(function (w) { if (!w.style.left) return; w.style.left = Math.max(0, Math.min(W - 80, w.offsetLeft)) + 'px'; w.style.top = Math.max(0, Math.min(H - 40, w.offsetTop)) + 'px'; });
    layoutIcons(false);
  }).observe(desk);

  /* ---------- the desk accessories: each a small window, made the first time it opens, that keeps its state when it
     closes (the Note Pad keeps its pages in this browser) ---------- */
  var apps = {};
  function openApp(key, focus) {
    var w = apps[key];
    if (!w) {
      w = apps[key] = BUILD[key]();
      w.setAttribute('role', 'dialog'); w._app = key; w._back = icons.filter(function (b) { return b._key === key; })[0];
      desk.appendChild(w);
      wireWin(w);
    }
    select(w._back);
    show(w, w._back && w._back.offsetParent ? rectIn(w._back) : null, function () { if (focus !== false) (w._focus || w).focus({ preventScroll: true }); menuState(); });
    return w;
  }
  var BUILD = {
    /* the time in Groton, where I am at school, to the second while it is open */
    clock: function () {
      var t = el('p', 'mac__clock-time'), day = el('p', 'mac__clock-day');
      var ft = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', second: '2-digit' });
      var fd = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'long', month: 'long', day: 'numeric' });
      function now() { var n = new Date(); t.textContent = ft.format(n); day.textContent = fd.format(n) + ' · Groton'; }
      var w = win('app clock', 'Alarm Clock', el('div', 'mac__body mac__body--clock', null, [t, day]));
      w._start = function () { now(); clearInterval(w._timer); w._timer = setInterval(now, 1000); };
      w._stop = function () { clearInterval(w._timer); };
      return w;
    },
    /* a four-function calculator: its keys, or the keyboard's (digits, + - * /, Return for =, Delete to clear) */
    calc: function () {
      var out = el('output', 'mac__calc-out', { 'aria-live': 'polite' }, ['0']);
      var KEYS = [['C', 'clear', 'Clear'], ['±', 'neg', 'Change sign'], ['÷', '/', 'Divide'], ['×', '*', 'Multiply'], ['7', '7'], ['8', '8'], ['9', '9'], ['−', '-', 'Minus'], ['4', '4'], ['5', '5'], ['6', '6'], ['+', '+', 'Plus'], ['1', '1'], ['2', '2'], ['3', '3'], ['=', '=', 'Equals'], ['0', '0'], ['.', '.', 'Point']];
      var keyEls = {};
      var pad = el('div', 'mac__keys', null, KEYS.map(function (k) {
        var b = el('button', 'mac__key' + (/^[0-9.]$/.test(k[1]) ? '' : ' mac__key--op') + (k[1] === '=' ? ' mac__key--eq' : '') + (k[1] === '0' ? ' mac__key--zero' : ''), { type: 'button', 'data-k': k[1], 'aria-label': k[2] || k[0] }, [k[0]]);
        keyEls[k[1]] = b; return b;
      }));
      var cur = '0', acc = null, op = null, fresh = true;
      function fmt(n) { if (!isFinite(n)) return null; var s = String(+n.toPrecision(12)); return s.replace('-', '−').length > 13 ? n.toExponential(6).replace('e+', 'e') : s; }
      function calc(a, b, o) { return o === '+' ? a + b : o === '-' ? a - b : o === '*' ? a * b : b === 0 ? NaN : a / b; }
      function showNum() { out.textContent = cur.replace('-', '−'); ['+', '-', '*', '/'].forEach(function (o) { keyEls[o].classList.toggle('is-on', op === o && fresh); }); }
      function result(v) { var s = fmt(v); if (s === null) { out.textContent = 'Error'; cur = '0'; acc = null; op = null; fresh = true; return false; } cur = s; return true; }
      function press(k) {
        if (/^[0-9]$/.test(k)) { if (fresh || cur === '0') cur = k; else if (cur.replace(/[-.]/g, '').length < 12) cur += k; else return; fresh = false; }
        else if (k === '.') { if (fresh) cur = '0.'; else if (cur.indexOf('.') < 0) cur += '.'; fresh = false; }
        else if (k === 'clear') { cur = '0'; acc = null; op = null; fresh = true; }
        else if (k === 'neg') { if (+cur !== 0) cur = cur.charAt(0) === '-' ? cur.slice(1) : '-' + cur; }
        else if (k === 'back') { if (fresh) return; cur = cur.length > 1 && cur !== '-0' ? cur.slice(0, -1) : '0'; if (cur === '-') cur = '0'; }
        else if (/^[+\-*/]$/.test(k)) { if (op && !fresh) { if (!result(calc(acc, +cur, op))) return; } acc = +cur; op = k; fresh = true; }
        else if (k === '=') { if (!op) return; var ok = result(calc(acc, +cur, op)); acc = null; op = null; fresh = true; if (!ok) return; }
        showNum();
      }
      pad.addEventListener('click', function (e) { var b = e.target.closest('.mac__key'); if (b) press(b.getAttribute('data-k')); });
      var w = win('app calc', 'Calculator', el('div', 'mac__body mac__body--calc', null, [out, pad]));
      var MAP = { Enter: '=', '=': '=', Backspace: 'back', Delete: 'clear', c: 'clear', C: 'clear', x: '*', X: '*', ',': '.' };
      w.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var k = MAP[e.key] || (/^[0-9.+\-*/]$/.test(e.key) ? e.key : null);
        if (!k || (e.key === 'Enter' && e.target.closest('.mac__key, .mac__box'))) return;
        e.preventDefault(); e.stopPropagation(); press(k);
        var b = keyEls[k]; if (b) { b.classList.add('is-pressed'); setTimeout(function () { b.classList.remove('is-pressed'); }, 110); }
      });
      return w;
    },
    /* the songs and albums of the archive as CDs: the one in the player (the disc as the archive's cards draw it,
     its title and artist written on it, or its cover as the case's insert), the previous and next, the list of them,
     a way to listen (on the service it is on) and its file. With none, the drive is empty */
    cd: function () {
      var tracks = files.filter(function (f) { return f.music; }), at = 0;
      var lcd = el('p', 'mac__lcd', { 'aria-live': 'polite' });
      var prev = el('button', 'mac__cdb', { type: 'button', 'aria-label': 'Previous track' }), next = el('button', 'mac__cdb', { type: 'button', 'aria-label': 'Next track' });
      prev.innerHTML = glyph('<') + glyph('<'); next.innerHTML = glyph('>') + glyph('>');
      var art = el('div', 'mac__cdart'), go = el('p', 'mac__goline');
      var listEl = el('ol', 'mac__tracks');
      tracks.forEach(function (f, k) {
        var b = el('button', 'mac__track', { type: 'button', 'aria-label': f.title + (f.by ? ', ' + f.by : '') }, [el('span', 'mac__track-n', null, [(k < 9 ? '0' : '') + (k + 1)]), el('span', 'mac__track-t', null, [f.title]), f.by ? el('span', 'mac__track-by', null, [f.by]) : null]);
        b.addEventListener('click', function () { cue(k); });
        listEl.appendChild(el('li', null, null, [b]));
      });
      function cd(f) {
        if (f.cover) return el('span', 'cd cd--insert', null, [f.cover.cloneNode(true)]);
        return el('span', 'cd', { 'aria-hidden': 'true' }, [el('span', 'cd__disc', null, [el('span', 'cd__label', null, [el('b', null, null, [f.title]), f.by ? el('i', null, null, [f.by]) : null])])]);
      }
      function cue(k, first) {
        if (!tracks.length) return;
        at = (k + tracks.length) % tracks.length;
        var f = tracks[at];
        lcd.textContent = (at < 9 ? '0' : '') + (at + 1) + '  ' + f.title + (f.by ? ' · ' + f.by : '');
        Array.prototype.forEach.call(listEl.querySelectorAll('.mac__track'), function (b, i) { b.setAttribute('aria-current', i === at ? 'true' : 'false'); });
        art.textContent = ''; var disc = cd(f); if (!first) disc.classList.add('is-new'); art.appendChild(disc);
        go.textContent = '';
        if (f.listen) { var l = f.listen.cloneNode(true); l.className = 'mac__go'; go.appendChild(l); }
        var o = el('button', 'mac__go', { type: 'button' }, ['Open its file']);
        o.addEventListener('click', function () { openFile(f, true, w._back); });
        go.appendChild(o);
      }
      prev.addEventListener('click', function () { cue(at - 1); });
      next.addEventListener('click', function () { cue(at + 1); });
      var deck = el('div', 'mac__cdface', null, [lcd, el('div', 'mac__cdkeys', null, [prev, next])]);
      var w = win('app cd', 'CD Player', el('div', 'mac__body mac__body--cd', null, tracks.length ? [deck, el('div', 'mac__cdmain', null, [art, el('div', null, null, [listEl, go])])] : [deck]));
      if (tracks.length) cue(0, true);
      else { lcd.textContent = 'No disc'; prev.disabled = next.disabled = true; }
      return w;
    },
    /* the desk's pattern, kept in this browser: the poster's dots, the old Mac's checks, graph paper, a staff, the
     rink's lines, a maze */
    patterns: function () {
      var group = el('div', 'mac__pats', { role: 'radiogroup', 'aria-label': 'Pattern' }, PATTERNS.map(function (p) {
        return el('button', 'mac__pat', { type: 'button', role: 'radio', 'aria-checked': 'false', 'data-pat': p[0], tabindex: '-1' }, [el('span', 'mac__swatch', { 'data-pattern': p[0], 'aria-hidden': 'true' }), el('span', null, null, [p[1]])]);
      }));
      group.addEventListener('click', function (e) { var b = e.target.closest('.mac__pat'); if (b) { setPattern(b.getAttribute('data-pat'), true); b.focus(); } });
      group.addEventListener('keydown', function (e) {
        var all = Array.prototype.slice.call(group.querySelectorAll('.mac__pat')), i = all.indexOf(d.activeElement);
        var step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (i < 0 || !step) return;
        e.preventDefault(); var n = all[(i + step + all.length) % all.length]; setPattern(n.getAttribute('data-pat'), true); n.focus();
      });
      var w = win('app patterns', 'Desktop Patterns', el('div', 'mac__body mac__body--pats', null, [group]));
      w._radios = group;
      w._focus = null;
      w._start = function () { syncPatterns(); w._focus = group.querySelector('[aria-checked="true"]'); };
      return w;
    },
    /* eight pages to write on, kept in this browser: the corner turns them */
    notepad: function () {
      var KEY = 'v3:notepad', pages = store(KEY), at = 0;
      if (!Array.isArray(pages) || pages.length !== 8) pages = ['', '', '', '', '', '', '', ''];
      var area = el('textarea', 'mac__pad-text', { 'aria-label': 'Note Pad, page 1', spellcheck: 'false' });
      var num = el('span', 'mac__pad-n', { 'aria-hidden': 'true' }, ['1']);
      var prev = el('button', 'mac__pad-turn', { type: 'button', 'aria-label': 'Previous page' }), next = el('button', 'mac__pad-turn', { type: 'button', 'aria-label': 'Next page' });
      prev.innerHTML = glyph('<'); next.innerHTML = glyph('>');
      var saveT = 0;
      function turn(k) { pages[at] = area.value; at = (at + k + 8) % 8; area.value = pages[at]; num.textContent = String(at + 1); area.setAttribute('aria-label', 'Note Pad, page ' + (at + 1)); store(KEY, pages); }
      area.value = pages[0];
      area.addEventListener('input', function () { pages[at] = area.value; clearTimeout(saveT); saveT = setTimeout(function () { store(KEY, pages); }, 300); });
      prev.addEventListener('click', function () { turn(-1); }); next.addEventListener('click', function () { turn(1); });
      var w = win('app notepad', 'Note Pad', el('div', 'mac__body mac__body--pad', null, [area, el('div', 'mac__pad-foot', null, [prev, num, next])]));
      w._focus = area;
      w._stop = function () { pages[at] = area.value; store(KEY, pages); };
      return w;
    },
    /* the fifteen puzzle: a press on a tile beside the space slides it in; with the board focused, an arrow slides
     the tile on that side of the space toward it */
    puzzle: function () {
      var order, board = el('div', 'mac__puz', { role: 'group', tabindex: '0', 'aria-label': 'Puzzle. The arrow keys slide a tile into the space.' });
      var said = el('p', 'sr-only', { 'aria-live': 'polite' });
      var tiles = [];
      for (var n = 1; n <= 15; n++) { var t = el('button', 'mac__tile' + (n === 1 ? ' mac__tile--one' : ''), { type: 'button', tabindex: '-1', 'aria-label': String(n) }, [String(n)]); t._n = n; tiles.push(t); board.appendChild(t); }
      function draw() { tiles.forEach(function (t) { var i = order.indexOf(t._n); t.style.setProperty('--x', i % 4); t.style.setProperty('--y', (i / 4) | 0); }); }
      function solved() { for (var i = 0; i < 15; i++) if (order[i] !== i + 1) return false; return true; }
      function slide(n) {
        var i = order.indexOf(n), s = order.indexOf(0);
        if (!((Math.abs(i - s) === 1 && ((i / 4) | 0) === ((s / 4) | 0)) || Math.abs(i - s) === 4)) return;
        order[s] = n; order[i] = 0; draw();
        var done = solved(); board.classList.toggle('is-solved', done); said.textContent = done ? 'Solved' : '';
      }
      function mix() {
        order = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
        var s = 15, last = -1;
        for (var k = 0; k < 200 || solved(); k++) {
          var can = [s - 4, s + 4, s % 4 ? s - 1 : -1, s % 4 < 3 ? s + 1 : -1].filter(function (j) { return j >= 0 && j < 16 && j !== last; });
          var j = can[Math.floor(Math.random() * can.length)];
          order[s] = order[j]; order[j] = 0; last = s; s = j;
        }
        board.classList.remove('is-solved'); said.textContent = ''; draw();
      }
      board.addEventListener('click', function (e) { var t = e.target.closest('.mac__tile'); if (t) slide(t._n); });
      board.addEventListener('keydown', function (e) {
        var s = order.indexOf(0), j = { ArrowLeft: s % 4 < 3 ? s + 1 : -1, ArrowRight: s % 4 ? s - 1 : -1, ArrowUp: s + 4 < 16 ? s + 4 : -1, ArrowDown: s - 4 }[e.key];
        if (j === undefined) return;
        e.preventDefault(); if (j >= 0) slide(order[j]);
      });
      var again = el('button', 'mac__go mac__go--small', { type: 'button' }, ['Shuffle']);
      again.addEventListener('click', function () { mix(); board.focus(); });
      mix();
      var w = win('app puzzle', 'Puzzle', el('div', 'mac__body mac__body--puz', null, [board, said, el('p', 'mac__goline', null, [again])]));
      w._focus = board;
      return w;
    }
  };
  var PATTERNS = [['dots', 'Dots'], ['checks', 'Checks'], ['graph', 'Graph paper'], ['staff', 'Staff'], ['rink', 'Rink'], ['maze', 'Maze']];
  var pattern = 'dots';
  function syncPatterns() {
    var w = apps.patterns; if (!w) return;
    Array.prototype.forEach.call(w._radios.querySelectorAll('.mac__pat'), function (b) { var on = b.getAttribute('data-pat') === pattern; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
  }
  function setPattern(p, keep) {
    if (!PATTERNS.some(function (x) { return x[0] === p; })) return;
    pattern = p; desk.setAttribute('data-pattern', p); syncPatterns();
    if (keep) store('v3:mac-pattern', p);
  }
  setPattern(store('v3:mac-pattern') || 'dots', false);

  /* ---------- the desk's icons: one press opens; a mouse drags them; the arrow keys walk them ---------- */
  var selected = null;
  function select(b) {
    if (selected) selected.classList.remove('is-sel');
    selected = b; if (b) b.classList.add('is-sel');
    if (b && b.classList.contains('mac__file')) files.forEach(function (f) { f.icon.tabIndex = f.icon === b ? 0 : -1; });
    if (b && b.classList.contains('mac__icon--desk')) icons.forEach(function (x) { x.tabIndex = x === b ? 0 : -1; });
    menuState();
  }
  function openIcon(b) {
    var act = b.getAttribute('data-act');
    if (act === 'disk') { select(b); show(finder, rectIn(b), function () { var s = files.filter(function (f) { return f.icon.tabIndex === 0; })[0]; (s || files[0]).icon.focus({ preventScroll: true }); }); }
    else if (act === 'trash') { select(b); show(trash, rectIn(b), function () { trash.focus({ preventScroll: true }); }); }
    else if (act === 'file') openFile(b._file, true, b);
    else if (act === 'app') openApp(b._key);
  }
  icons.forEach(function (b) {
    b.addEventListener('click', function () { if (b._dragged) { b._dragged = false; return; } openIcon(b); });
    b.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch' || e.button !== 0 || narrow()) return;
      var sx = e.clientX, sy = e.clientY, ox = b.offsetLeft, oy = b.offsetTop, W = desk.clientWidth, H = desk.clientHeight, moving = false;
      b.setPointerCapture(e.pointerId);
      function move(ev) {
        var dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!moving && Math.abs(dx) + Math.abs(dy) < 5) return;
        moving = true; b.classList.add('is-dragging');
        var x = Math.max(2, Math.min(W - IW - 2, ox + dx)), y = Math.max(2, Math.min(H - IH, oy + dy));
        b.style.left = Math.round(x) + 'px'; b.style.top = Math.round(y) + 'px';
      }
      function up() {
        b.removeEventListener('pointermove', move); b.removeEventListener('pointerup', up); b.removeEventListener('pointercancel', up);
        b.classList.remove('is-dragging');
        if (!moving) return;
        b._dragged = true; b._moved = true; b._at = [b.offsetLeft / desk.clientWidth, b.offsetTop / desk.clientHeight];
        setTimeout(function () { b._dragged = false; }, 0);
      }
      b.addEventListener('pointermove', move); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up);
    });
  });
  deskWrap.addEventListener('focusin', function (e) { var b = e.target.closest('.mac__icon--desk'); if (b) select(b); });
  deskWrap.addEventListener('keydown', function (e) {
    var i = icons.indexOf(e.target), to = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: icons.length - 1 }[e.key];
    if (i < 0 || to === undefined) return;
    e.preventDefault(); e.stopPropagation(); icons[(to + icons.length) % icons.length].focus();
  });

  /* ---------- the files: one press opens; arrows move between them, as a list or as icons; typing a name's first
     letters goes to it ---------- */
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
  desk.addEventListener('pointerdown', function (e) { if (e.target === desk || e.target === deskWrap) select(null); });

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
      else if (/^app-/.test(a)) openApp(a.slice(4));
      else if (a === 'cleanup') { cleanUp(); m.btn.focus({ preventScroll: true }); }
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
    open.slice().forEach(function (w) { if (w._stop) w._stop(); if (w._doc) { w.hidden = true; w.remove(); } else { w.hidden = true; zoomWin(w, false); } });
    open = []; docs = {}; select(null);
    layoutIcons(true);
    if (reduce.matches) { screen.className = 'mac__screen is-on'; show(finder, null); menuState(); if (again) finder.focus({ preventScroll: true }); return; }
    screen.className = 'mac__screen is-booting';
    timer = setTimeout(function () {
      screen.className = 'mac__screen is-on';
      show(finder, rectIn(diskIcon), function () { if (again) finder.focus({ preventScroll: true }); });
    }, again ? 800 : 700);
  }
  function arrive() { if (started || !sheet.classList.contains('is-in')) return; started = true; start(false); }
  new MutationObserver(arrive).observe(sheet, { attributes: true, attributeFilter: ['class'] });
  layoutIcons(true);
  if (reduce.matches) { started = true; start(false); } else arrive();
  /* the keyboard can come in before the screen is on (Tab from the sheet before, or Shift+Tab from the one after): the
     screen comes on at once, with the Archive window, and the focus stays where it landed */
  function onNow() {
    started = true; clearTimeout(timer);
    if (screen.classList.contains('is-on')) return;
    screen.className = 'mac__screen is-on';
    if (finder.hidden) show(finder, null);
    menuState();
  }
  root.addEventListener('focusin', onNow);
  /* the desk toggle (toggles.js): tidy or as it was left */
  d.addEventListener('v3:toggle', function (e) { if (e.detail && e.detail.name === 'macDesk') layoutIcons(true); });

  /* Find (in the index) going to a card opens its file here instead: the deck still lands on the sheet, and the
     file's window opens once it has */
  d.addEventListener('v3:find', function (e) {
    var t = e.detail && e.detail.target, f = t && files.filter(function (x) { return x.li === t || x.li.contains(t); })[0];
    if (!f || !root.getClientRects().length) return;   /* the wall of cards (or forced colours): the card itself */
    e.detail.target = root; e.detail.handled = true;
    var tries = 0;
    /* the file opens once the deck has landed and the screen is on, so the Archive window coming on never covers it */
    var waited = screen.classList.contains('is-on');
    (function wait() {
      if (!screen.classList.contains('is-on') && tries++ < 40) { arrive(); setTimeout(wait, 100); return; }
      setTimeout(function () { var w = openFile(f, false); w.classList.remove('is-found'); void w.offsetWidth; w.classList.add('is-found'); setTimeout(function () { w.classList.remove('is-found'); }, 2700); }, reduce.matches ? 0 : waited ? 450 : 220);
    })();
  });
  window.__v3mac = { files: files, open: openFile, app: openApp, shut: shut, view: setView, sort: setSort, zoom: zoomWin, start: start, cleanUp: cleanUp, pattern: setPattern, icons: icons,
    get windows() { return open.slice(); } };
})();
