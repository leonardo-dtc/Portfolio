/* ============================================================
   GAMES — three programs behind "Sites and programs".

   The entry's detail ends in a prompt, `$ ./games`. Pressing it clears the
   detail and opens a terminal with three programs: the dinosaur game,
   tetris, and snake. Each is the original's rules in text: the same
   speeds, the same scoring, the same way to lose. They share one screen,
   one status line, one set of keys (arrows, space, q to leave), and one
   record of best scores, kept in localStorage under `lc-games-best`.

   The screen is a <pre>: each game hands back its rows as strings and
   the loop writes them. The dinosaur game is pixel art, two pixel rows to
   a text row with half-block characters, so the T-rex is the T-rex. Keys
   are taken on the window in the capture phase while the terminal is
   open, so the arrows drive the game rather than turning the page.
   Leaving the subsection closes the terminal.
   ============================================================ */
(function () {
  'use strict';

  var BEST = 'lc-games-best';
  function bests() { try { return JSON.parse(localStorage.getItem(BEST) || '{}') || {}; } catch (e) { return {}; } }
  function record(name, score) {
    var b = bests();
    if (score > (b[name] || 0)) { b[name] = score; try { localStorage.setItem(BEST, JSON.stringify(b)); } catch (e) {} }
    return Math.max(score, b[name] || 0);
  }
  function pad(n, w) { n = String(Math.max(0, Math.floor(n))); while (n.length < w) n = '0' + n; return n; }
  function fit(s, w) { s = s || ''; while (s.length < w) s += ' '; return s.length > w ? s.slice(0, w) : s; }
  function rep(c, n) { return new Array(n + 1).join(c); }
  function centre(s, w) { return fit(rep(' ', Math.max(0, Math.floor((w - s.length) / 2))) + s, w); }
  function blank(w, h) { var r = []; for (var i = 0; i < h; i++) r.push(fit('', w)); return r; }
  function put(rows, x, y, s) {                      // write into a row, clipped, spaces transparent
    if (y < 0 || y >= rows.length) return;
    var r = rows[y].split('');
    for (var i = 0; i < s.length; i++) { var c = s.charAt(i), xx = x + i; if (c !== ' ' && xx >= 0 && xx < r.length) r[xx] = c; }
    rows[y] = r.join('');
  }
  function overlay(rows, w, lines) {                 // a centred block of text over the screen
    var y0 = Math.floor((rows.length - lines.length) / 2);
    lines.forEach(function (s, i) { rows[y0 + i] = centre(s, w); });
  }

  /* ---------- pixels ----------
     A buffer of W by H pixels, drawn to H/2 text rows: a text row holds
     two pixel rows, and the block characters carry the top, the bottom,
     or both. Sprites are strings of '#' and '.'. */
  function Pix(w, h) { this.w = w; this.h = h; this.b = new Uint8Array(w * h); }
  Pix.prototype.clear = function () { this.b.fill(0); };
  Pix.prototype.set = function (x, y) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.b[y * this.w + x] = 1; };
  Pix.prototype.get = function (x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.b[y * this.w + x] : 0; };
  Pix.prototype.blit = function (art, x, y) {        // top-left at x, y
    for (var r = 0; r < art.length; r++) for (var c = 0; c < art[r].length; c++) if (art[r].charAt(c) === '#') this.set(x + c, y + r);
  };
  Pix.prototype.rows = function () {
    var out = [];
    for (var y = 0; y < this.h; y += 2) {
      var s = '';
      for (var x = 0; x < this.w; x++) {
        var a = this.b[y * this.w + x], b = y + 1 < this.h ? this.b[(y + 1) * this.w + x] : 0;
        s += a && b ? '█' : a ? '▀' : b ? '▄' : ' ';
      }
      out.push(s);
    }
    return out;
  };
  function hitArt(a, ax, ay, b, bx, by) {            // do two sprites share a lit pixel
    for (var r = 0; r < a.length; r++) for (var c = 0; c < a[r].length; c++) {
      if (a[r].charAt(c) !== '#') continue;
      var x = ax + c - bx, y = ay + r - by;
      if (y >= 0 && y < b.length && x >= 0 && x < b[y].length && b[y].charAt(x) === '#') return true;
    }
    return false;
  }

  /* ---------- the dinosaur game ----------
     The runner from Chrome's offline page, at the original's proportions:
     the T-rex a third of the field's height, a small cactus three
     quarters of the T-rex, the pterodactyl a T-rex wide, the jump nearly
     twice the T-rex's height and long enough to clear three cacti in a
     row. Cacti to jump and, once the score allows, pterodactyls to jump
     or duck. The speed climbs with the score, the score with the
     distance. Drawn at ninety-six by fifty-two pixels. */
  var TREX = [
    '......########', '......#.######', '......########', '......#####...', '......#######.', '#.....#####...',
    '#....######...', '##..#######...', '###########.#.', '.##########.#.', '..#########...', '...########...', '....######....'
  ];
  var LEGS = [['.....##.##....', '.....#...##...', '.....##.......'], ['.....##.##....', '......##.#....', '.........##...']];
  var TREX_RUN = LEGS.map(function (l) { return TREX.concat(l); });
  var TREX_JUMP = TREX.concat(['.....##.##....', '.....##.##....', '.....##.##....']);
  var DUCK = [
    '#...........########', '#..........##.######', '##.........#########', '###..###...#######..',
    '####################', '.##################.', '..##############....'
  ];
  var DUCK_LEGS = [['...##..##...........', '...##...#...........'], ['...##..##...........', '....#..##...........']];
  var DUCK_RUN = DUCK_LEGS.map(function (l) { return DUCK.concat(l); });
  var CACTUS_S = ['..##..', '..##..', '#.##.#', '#.##.#', '#.##.#', '######', '.####.', '..##..', '..##..', '..##..', '..##..', '..##..'];
  var CACTUS_L = ['...##...', '...##...', '#..##..#', '#..##..#', '#..##..#', '#..##..#', '##.##.##', '.######.', '..####..', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...'];
  function beside(a, b, gap) {                       // two sprites side by side, feet level
    var h = Math.max(a.length, b.length), out = [];
    for (var r = 0; r < h; r++) {
      var ra = r - (h - a.length), rb = r - (h - b.length);
      out.push((ra >= 0 ? a[ra] : rep('.', a[0].length)) + rep('.', gap) + (rb >= 0 ? b[rb] : rep('.', b[0].length)));
    }
    return out;
  }
  var CACTI = [CACTUS_S, CACTUS_L, beside(CACTUS_S, CACTUS_S, 0), beside(beside(CACTUS_S, CACTUS_S, 0), CACTUS_S, 0), beside(CACTUS_L, CACTUS_L, 0), beside(CACTUS_S, CACTUS_L, 0)];
  var BIRD = [
    ['.....#........', '....##........', '...###........', '#.############', '##############', '.###########..', '..#######.....', '...####.......'],
    ['..............', '..............', '..............', '#.############', '##############', '.###########..', '..#####..###..', '...##....#....']
  ];
  var CLOUD = ['...####...', '.########.', '##########'];
  var DINO = {
    name: 'dinosaur', W: 96, H: 52, GROUND: 47, X: 10,
    reset: function () {
      this.pix = this.pix || new Pix(this.W, this.H);
      this.y = 0; this.vy = 0; this.duck = false; this.dist = 0; this.score = 0; this.speed = 100;
      this.obs = []; this.gap = 60; this.t = 0; this.over = false; this.ready = true; this.hi = bests().dinosaur || 0;
      this.clouds = [[24, 8], [60, 16], [86, 4]];
      var s = ''; for (var i = 0; i < this.W * 2; i++) s += Math.random() < 0.07 ? '#' : '.'; this.pebbles = s;
    },
    key: function (k) {
      if (this.over) { if (k === ' ' || k === 'Enter' || k === 'ArrowUp') this.reset(); return; }
      if (k === ' ' || k === 'ArrowUp') { this.ready = false; if (this.y === 0 && !this.duck) this.vy = 200; }   // twice its height, and long enough for three cacti
      if (k === 'ArrowDown') { this.ready = false; this.duck = true; if (this.y > 0) this.vy -= 160; }
    },
    keyUp: function (k) { if (k === 'ArrowDown') this.duck = false; },
    step: function (dt) {
      this.t += dt;
      if (this.ready) return;
      this.speed = Math.min(160, 100 + this.score / 15);
      this.dist += this.speed * dt; this.score = Math.floor(this.dist / 8);
      this.vy -= 620 * dt; this.y = Math.max(0, this.y + this.vy * dt); if (this.y === 0) this.vy = 0;
      this.gap -= this.speed * dt;
      if (this.gap <= 0) {
        var bird = this.score > 400 && Math.random() < 0.3;
        this.obs.push(bird ? { x: this.W, bird: true, up: [0, 10, 21][Math.floor(Math.random() * 3)] }
                           : { x: this.W, art: CACTI[Math.floor(Math.random() * CACTI.length)] });
        this.gap = 45 + Math.random() * 55 + this.speed * 0.4;
      }
      var self = this;
      this.obs.forEach(function (o) { o.x -= self.speed * dt * (o.bird ? 1.15 : 1); });
      this.obs = this.obs.filter(function (o) { return o.x > -30; });
      this.clouds.forEach(function (c) { c[0] -= self.speed * dt * 0.2; if (c[0] < -10) { c[0] = self.W + 6; c[1] = 2 + Math.floor(Math.random() * 18); } });
      if (this.hit()) { this.over = true; this.hi = record('dinosaur', this.score); }
    },
    sprite: function () {
      var f = Math.floor(this.t * 8) % 2;
      if (this.y > 0) return TREX_JUMP;
      return this.duck ? DUCK_RUN[f] : TREX_RUN[f];
    },
    hit: function () {
      var art = this.sprite(), ax = this.X, ay = this.GROUND - art.length - Math.round(this.y), self = this;
      return this.obs.some(function (o) {
        var b = o.bird ? BIRD[0] : o.art, bx = Math.round(o.x), by = self.GROUND - b.length - (o.bird ? o.up : 0);
        return hitArt(art, ax, ay, b, bx, by);
      });
    },
    draw: function () {
      var p = this.pix, self = this, off = Math.floor(this.dist) % this.W;
      p.clear();
      this.clouds.forEach(function (c) { p.blit(CLOUD, Math.round(c[0]), c[1]); });
      for (var x = 0; x < this.W; x++) { p.set(x, this.GROUND); if (this.pebbles.charAt((x + off) % (this.W * 2)) === '#') p.set(x, this.GROUND + 2); }
      this.obs.forEach(function (o) {
        var b = o.bird ? BIRD[Math.floor(self.t * 5) % 2] : o.art;
        p.blit(b, Math.round(o.x), self.GROUND - b.length - (o.bird ? o.up : 0));
      });
      var art = this.sprite();
      p.blit(art, this.X, this.GROUND - art.length - Math.round(this.y));
      var rows = p.rows();
      if (this.ready) put(rows, 38, 9, 'space to run');
      if (this.over) overlay(rows, this.W, ['G A M E   O V E R', '', 'space again  ·  q menu']);
      return rows;
    },
    status: function () { return 'dinosaur   ' + pad(this.score, 5) + '   HI ' + pad(this.hi, 5); },
    hint: 'space jump  ·  ↓ duck  ·  q menu'
  };

  /* ---------- tetris ----------
     The ten by twenty well, the seven pieces from a seven-bag, the NES
     speeds by level and the NES scores for one to four lines at once,
     a paced soft drop on down, a hard drop on space, a piece locking the
     moment it cannot fall, and the NES clear: full rows flash and empty
     from the middle outward before the stack settles. */
  var SHAPES = {
    I: [[[0, 1], [1, 1], [2, 1], [3, 1]], [[2, 0], [2, 1], [2, 2], [2, 3]], [[0, 2], [1, 2], [2, 2], [3, 2]], [[1, 0], [1, 1], [1, 2], [1, 3]]],
    O: [[[1, 0], [2, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [2, 1]]],
    T: [[[1, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [1, 1], [2, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [1, 2]], [[1, 0], [0, 1], [1, 1], [1, 2]]],
    S: [[[1, 0], [2, 0], [0, 1], [1, 1]], [[1, 0], [1, 1], [2, 1], [2, 2]], [[1, 1], [2, 1], [0, 2], [1, 2]], [[0, 0], [0, 1], [1, 1], [1, 2]]],
    Z: [[[0, 0], [1, 0], [1, 1], [2, 1]], [[2, 0], [1, 1], [2, 1], [1, 2]], [[0, 1], [1, 1], [1, 2], [2, 2]], [[1, 0], [0, 1], [1, 1], [0, 2]]],
    J: [[[0, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [2, 2]], [[1, 0], [1, 1], [0, 2], [1, 2]]],
    L: [[[2, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [1, 1], [1, 2], [2, 2]], [[0, 1], [1, 1], [2, 1], [0, 2]], [[0, 0], [1, 0], [1, 1], [1, 2]]]
  };
  var NES_MS = [800, 717, 633, 550, 467, 383, 300, 217, 133, 100, 83, 83, 83, 67, 67, 67, 50, 50, 50, 33];
  var CLEAR_MS = 90, CLEAR_STEPS = 5;                // the wipe, from the middle out, one column pair a step
  var TETRIS = {
    name: 'tetris', COLS: 10, ROWS: 20, W: 46, H: 22,
    reset: function () {
      this.grid = []; for (var y = 0; y < this.ROWS; y++) this.grid.push(new Array(this.COLS).fill(0));
      this.bag = []; this.score = 0; this.lines = 0; this.level = 0; this.over = false; this.hi = bests().tetris || 0;
      this.clearing = null; this.next = this.take(); this.spawn(); this.fall = 0; this.soft = false;
    },
    take: function () {
      if (!this.bag.length) { this.bag = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']; for (var i = 6; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = this.bag[i]; this.bag[i] = this.bag[j]; this.bag[j] = t; } }
      return this.bag.pop();
    },
    spawn: function () {
      this.cur = { t: this.next, r: 0, x: 3, y: this.next === 'I' ? -1 : 0 }; this.next = this.take();
      if (this.hits(this.cur.x, this.cur.y, this.cur.r)) { this.over = true; this.hi = record('tetris', this.score); }
    },
    hits: function (x, y, r) {
      var cells = SHAPES[this.cur.t][r];
      for (var i = 0; i < 4; i++) {
        var cx = x + cells[i][0], cy = y + cells[i][1];
        if (cx < 0 || cx >= this.COLS || cy >= this.ROWS) return true;
        if (cy >= 0 && this.grid[cy][cx]) return true;
      }
      return false;
    },
    key: function (k) {
      if (this.over) { if (k === ' ' || k === 'Enter') this.reset(); return; }
      if (this.clearing) return;
      var c = this.cur;
      if (k === 'ArrowLeft' && !this.hits(c.x - 1, c.y, c.r)) c.x--;
      if (k === 'ArrowRight' && !this.hits(c.x + 1, c.y, c.r)) c.x++;
      if (k === 'ArrowUp' || k === 'x' || k === 'z') {
        var r = (c.r + (k === 'z' ? 3 : 1)) % 4, kicks = [0, -1, 1, -2, 2];
        for (var i = 0; i < kicks.length; i++) if (!this.hits(c.x + kicks[i], c.y, r)) { c.x += kicks[i]; c.r = r; break; }
      }
      if (k === 'ArrowDown') { if (!this.soft) this.fall = 0; this.soft = true; }
      if (k === ' ') { var n = 0; while (!this.hits(c.x, c.y + 1, c.r)) { c.y++; n++; } this.score += n * 2; this.lock(); }
    },
    keyUp: function (k) { if (k === 'ArrowDown') this.soft = false; },
    step: function (dt) {
      if (this.clearing) {
        this.clearing.t += dt * 1000;
        if (this.clearing.t >= CLEAR_MS * CLEAR_STEPS) this.settle();
        return;
      }
      this.fall += dt * 1000;
      var ms = this.soft ? 90 : NES_MS[Math.min(this.level, NES_MS.length - 1)];   // a soft drop is quick, not instant
      while (this.fall >= ms) {
        this.fall -= ms;
        if (!this.hits(this.cur.x, this.cur.y + 1, this.cur.r)) { this.cur.y++; if (this.soft) this.score += 1; }
        else { this.lock(); break; }
      }
    },
    lock: function () {
      var c = this.cur, self = this;
      SHAPES[c.t][c.r].forEach(function (p) { var y = c.y + p[1]; if (y >= 0) self.grid[y][c.x + p[0]] = 1; });
      var full = [];
      this.grid.forEach(function (row, y) { if (row.every(function (v) { return v; })) full.push(y); });
      this.cur = null; this.fall = 0;
      if (full.length) this.clearing = { rows: full, t: 0 };
      else this.spawn();
    },
    settle: function () {
      var n = this.clearing.rows.length, gone = {};
      this.clearing.rows.forEach(function (y) { gone[y] = true; });
      var kept = this.grid.filter(function (row, y) { return !gone[y]; });
      while (kept.length < this.ROWS) kept.unshift(new Array(this.COLS).fill(0));
      this.grid = kept; this.clearing = null;
      this.score += [40, 100, 300, 1200][n - 1] * (this.level + 1); this.lines += n; this.level = Math.floor(this.lines / 10);
      this.spawn();
    },
    draw: function () {
      var rows = [], c = this.cur, live = {}, wipe = this.clearing ? Math.floor(this.clearing.t / CLEAR_MS) : -1, gone = {};
      if (c && !this.over) SHAPES[c.t][c.r].forEach(function (p) { live[(c.x + p[0]) + ',' + (c.y + p[1])] = 1; });
      if (this.clearing) this.clearing.rows.forEach(function (y) { gone[y] = true; });
      var panel = ['next', '', '', '', '', '', 'score ' + pad(this.score, 6), 'lines ' + pad(this.lines, 3), 'level ' + pad(this.level, 2), '', 'best  ' + pad(this.hi, 6)];
      SHAPES[this.next][0].forEach(function (p) { var s = panel[1 + p[1]] || ''; panel[1 + p[1]] = fit(s, 2 + p[0] * 2) + '[]'; });
      for (var y = 0; y < this.ROWS; y++) {
        var s = '<!';
        for (var x = 0; x < this.COLS; x++) {
          var on = this.grid[y][x] || live[x + ',' + y];
          if (gone[y]) on = Math.abs(x - 4.5) > wipe + 0.5;                     // the wipe, from the middle out
          s += on ? '[]' : ' .';
        }
        rows.push(fit(s + '!>   ' + (panel[y] || ''), this.W));
      }
      rows.push(fit('<!' + rep('==', this.COLS) + '!>', this.W));
      rows.push(fit('  ' + rep('\\/', this.COLS), this.W));
      if (this.over) overlay(rows, this.W, ['G A M E   O V E R', '', 'space again  ·  q menu']);
      return rows;
    },
    status: function () { return 'tetris   ' + pad(this.score, 6) + '   best ' + pad(this.hi, 6); },
    hint: '← → move  ·  ↑ turn  ·  ↓ quick  ·  space drop  ·  q menu'
  };

  /* ---------- snake ----------
     A walled field, a snake that grows by one for every piece of food and
     dies on the wall or on itself, a little faster with every meal. Each
     cell is two characters wide, which makes it square, so a step up is
     the same distance as a step across. The snake is one continuous line
     with an arrowhead where it is going. */
  var LINE = { '': '  ', 'W': '╸ ', 'E': '╺━', 'N': '╹ ', 'S': '╻ ',
               'EW': '━━', 'NS': '┃ ', 'EN': '┗━', 'ES': '┏━', 'NW': '┛ ', 'SW': '┓ ' };
  var HEAD = { '1,0': '━▶', '-1,0': '◀━', '0,-1': '▲ ', '0,1': '▼ ' };
  var SNAKE = {
    name: 'snake', COLS: 30, ROWS: 16, W: 64, H: 18,
    reset: function () {
      this.body = [[16, 8], [15, 8], [14, 8], [13, 8]]; this.dir = [1, 0]; this.queue = []; this.score = 0; this.eaten = 0;
      this.over = false; this.ready = true; this.acc = 0; this.hi = bests().snake || 0; this.place();
    },
    place: function () {
      var self = this, ok = false, f;
      while (!ok) { f = [Math.floor(Math.random() * this.COLS), Math.floor(Math.random() * this.ROWS)]; ok = !this.body.some(function (p) { return p[0] === f[0] && p[1] === f[1]; }); }
      this.food = f;
    },
    key: function (k) {
      if (this.over) { if (k === ' ' || k === 'Enter') this.reset(); return; }
      var d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[k];
      if (!d) return;
      this.ready = false;
      var last = this.queue.length ? this.queue[this.queue.length - 1] : this.dir;
      if (d[0] === -last[0] && d[1] === -last[1]) return;          // no turning back on itself
      if (this.queue.length < 2) this.queue.push(d);
    },
    keyUp: function () {},
    step: function (dt) {
      if (this.ready) return;
      this.acc += dt * 1000;
      var ms = Math.max(60, 130 - this.eaten * 2.5);
      while (this.acc >= ms) {
        this.acc -= ms;
        if (this.queue.length) this.dir = this.queue.shift();
        var h = this.body[0], n = [h[0] + this.dir[0], h[1] + this.dir[1]], self = this;
        var wall = n[0] < 0 || n[0] >= this.COLS || n[1] < 0 || n[1] >= this.ROWS;
        var bite = this.body.some(function (p, i) { return i < self.body.length - 1 && p[0] === n[0] && p[1] === n[1]; });
        if (wall || bite) { this.over = true; this.hi = record('snake', this.score); return; }
        this.body.unshift(n);
        if (n[0] === this.food[0] && n[1] === this.food[1]) { this.score += 10; this.eaten++; this.place(); }
        else this.body.pop();
      }
    },
    draw: function () {
      var rows = blank(this.W, this.H), self = this, wall = rep('█', this.W);
      rows[0] = wall; rows[this.H - 1] = wall;
      for (var y = 1; y < this.H - 1; y++) rows[y] = '██' + fit('', this.COLS * 2) + '██';
      function cell(p, s) { put(rows, 2 + p[0] * 2, 1 + p[1], s); }
      cell(this.food, '● ');
      var b = this.body;
      for (var i = b.length - 1; i > 0; i--) {                    // the body: each cell joined to its neighbours
        var sides = '';
        [b[i - 1], b[i + 1]].forEach(function (q) {
          if (!q) return;
          var dx = q[0] - b[i][0], dy = q[1] - b[i][1];
          sides += dx === 1 ? 'E' : dx === -1 ? 'W' : dy === -1 ? 'N' : 'S';
        });
        sides = sides.split('').sort().join('');
        cell(b[i], LINE[sides] || LINE[sides.charAt(0)] || '  ');
      }
      cell(b[0], HEAD[this.dir[0] + ',' + this.dir[1]] || '● ');
      if (this.ready) put(rows, 20, 4, 'an arrow to start');
      if (this.over) overlay(rows, this.W, ['G A M E   O V E R', '', 'space again  ·  q menu']);
      return rows;
    },
    status: function () { return 'snake   ' + pad(this.score, 5) + '   best ' + pad(this.hi, 5); },
    hint: 'arrows steer  ·  q menu'
  };

  var PROGRAMS = [DINO, TETRIS, SNAKE];
  window.LCGames = { programs: PROGRAMS };            // for tests

  /* ---------- the terminal ---------- */
  var term = null, game = null, pick = 0, raf = 0, last = 0, tick = 0;
  function paint(rows, status, hint) {
    term.screen.textContent = rows.join('\n');
    term.status.textContent = status;
    term.hint.textContent = hint;
  }
  function menu() {
    var b = bests(), rows = blank(46, 12), cur = Math.floor(tick * 2) % 2 ? '>' : ' ';
    rows[1] = '  select a program';
    PROGRAMS.forEach(function (p, i) {
      rows[3 + i] = '  ' + (i === pick ? cur : ' ') + ' ' + (i + 1) + '  ' + fit(p.name, 12) + '   best ' + pad(b[p.name] || 0, 6);
    });
    rows[9] = '  scores are kept on this device';
    paint(rows, 'games   ' + PROGRAMS.length + ' programs', '↑ ↓ choose  ·  enter run  ·  1 2 3  ·  q back');
  }
  function run(i) { pick = i; game = PROGRAMS[i]; game.reset(); }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now; tick += dt;
    if (game) { if (!game.over) game.step(dt); paint(game.draw(), game.status(), game.hint); }
    else menu();
  }
  /* the key by its code first, so a synthetic or remote press naming the key
     differently (Return, Spacebar, Up) is read the same as a real one */
  function norm(e) {
    var c = e.code || '', k = e.key || '';
    if (c === 'Space' || k === ' ' || k === 'Spacebar' || k === 'space') return ' ';
    if (c === 'Enter' || c === 'NumpadEnter' || k === 'Enter' || k === 'Return') return 'Enter';
    if (/^Arrow(Up|Down|Left|Right)$/.test(c)) return c;
    if (/^(Up|Down|Left|Right)$/.test(k)) return 'Arrow' + k;
    if (/^Digit[0-9]$/.test(c)) return c.slice(5);
    if (/^Key[A-Z]$/.test(c)) return c.slice(3).toLowerCase();
    return k;
  }
  function onKey(e) {
    if (!term) return;
    var k = norm(e);
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    e.stopImmediatePropagation();
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'PageUp', 'PageDown'].indexOf(k) >= 0) e.preventDefault();
    if (game) {
      if (k === 'q' || k === 'Escape') { game = null; return; }
      if (e.repeat && (k === ' ' || k === 'ArrowUp' || k === 'Enter')) return;   // a held key jumps or turns once
      game.key(k); return;
    }
    if (k === 'q' || k === 'Escape') { close(true); return; }
    if (k === 'ArrowUp') pick = (pick + PROGRAMS.length - 1) % PROGRAMS.length;
    if (k === 'ArrowDown') pick = (pick + 1) % PROGRAMS.length;
    if (k === 'Enter' || k === ' ') run(pick);
    if (k >= '1' && k <= String(PROGRAMS.length)) run(parseInt(k, 10) - 1);
  }
  function onKeyUp(e) { if (term && game && game.keyUp) game.keyUp(norm(e)); }
  function onClick(e) {                               // a click on a menu line runs it
    if (!term || game || !term.screen.contains(e.target)) return;
    var lh = term.screen.scrollHeight / term.screen.textContent.split('\n').length;
    var row = Math.floor((e.clientY - term.screen.getBoundingClientRect().top - 10) / lh) - 3;
    if (row >= 0 && row < PROGRAMS.length) run(row);
  }
  function open(body) {
    if (term) close(false);
    var saved = Array.prototype.slice.call(body.children);
    saved.forEach(function (el) { el.hidden = true; });
    var root = document.createElement('div'); root.className = 'term'; root.tabIndex = 0;
    root.innerHTML = '<p class="term__prompt"><span class="term__p">$</span> ./games</p><pre class="term__screen" aria-live="off"></pre>' +
                     '<p class="term__status"></p><p class="term__hint"></p>';
    body.appendChild(root);
    term = { body: body, saved: saved, root: root, screen: root.querySelector('.term__screen'), status: root.querySelector('.term__status'), hint: root.querySelector('.term__hint') };
    game = null; pick = 0; last = 0;
    addEventListener('keydown', onKey, true);
    addEventListener('keyup', onKeyUp, true);
    root.addEventListener('click', onClick);
    root.focus({ preventScroll: true });
    raf = requestAnimationFrame(frame);
  }
  function close(restore) {
    if (!term) return;
    cancelAnimationFrame(raf); raf = 0;
    removeEventListener('keydown', onKey, true);
    removeEventListener('keyup', onKeyUp, true);
    if (term.root.parentNode) term.root.parentNode.removeChild(term.root);
    if (restore) term.saved.forEach(function (el) { el.hidden = false; });
    term = null; game = null;
  }
  document.addEventListener('click', function (e) {
    var go = e.target.closest && e.target.closest('[data-games]');
    if (!go) return;
    e.preventDefault();
    var body = go.closest('.sub__body');
    if (body) open(body);
  });
  document.addEventListener('lc:sub', function () { close(false); });
  document.addEventListener('lc:panel', function () { close(false); });
})();
