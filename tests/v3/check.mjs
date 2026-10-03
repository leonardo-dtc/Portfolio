// Browser checks for the v3 poster edition (one page, twelve sheets).
//
//   python3 tools/serve.py 8778          # in another terminal, from the repository root
//   node tests/v3/check.mjs              # BASE=http://127.0.0.1:8802/v3/ node tests/v3/check.mjs for another server
//
// It finds Playwright through PLAYWRIGHT_MODULE (the path of its index.mjs) or the usual package names, and runs
// Chromium. Each check prints "ok" or "FAIL"; any FAIL sets the exit code to 1.
//
//   1. structure   the sections, the rail's dots and the cabinet's folders match in number and order, and the
//                  counts the script writes (--n, "Sheet NN / N", folder numbers, "N sheets") agree with them
//   2. editions    no link, image or stylesheet points into another edition of the portfolio
//   3. 12px        no visible text under 12px (at rest, with the cabinet open, at desktop and phone widths)
//   4. contrast    the pairs fixed in round three pass (4.5:1, or 3:1 for large text), and a sweep of every text
//                  element over a solid background finds nothing under its threshold
//   5. cabinet     hovering a dot opens the cabinet; moving the mouse up to the pulled file and clicking it
//                  lands on that file's own sheet
//   6. routes      the cover's words go where they say; Find, the targets and the pill do their jobs
//   6b. keyboard   tabbing out of the cabinet closes it; while Find filters, the current tab stays readable
//   7. console     no errors on any load (with and without the script, reduced motion, phone)

const BASE = process.env.BASE || 'http://127.0.0.1:8778/v3/';
async function loadPlaywright() {
  const tries = [process.env.PLAYWRIGHT_MODULE, 'playwright', 'playwright-core', '/opt/node22/lib/node_modules/playwright/index.mjs'].filter(Boolean);
  for (const t of tries) { try { return await import(t); } catch (e) { /* next */ } }
  throw new Error('Playwright not found: set PLAYWRIGHT_MODULE to the path of its index.mjs');
}
const { chromium } = await loadPlaywright();

let failures = 0;
function check(cond, msg, detail) {
  if (cond) console.log('ok   ' + msg);
  else { failures++; console.log('FAIL ' + msg + (detail ? '\n       ' + [].concat(detail).join('\n       ') : '')); }
}
const errors = [];
const browser = await chromium.launch();
async function open({ width = 1440, height = 900, js = true, reduced = false, touch = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, javaScriptEnabled: js, reducedMotion: reduced ? 'reduce' : 'no-preference', ...(touch ? { hasTouch: true, isMobile: true } : {}) });
  const page = await ctx.newPage();
  const tag = `${width}x${height}${js ? '' : ' no-js'}${reduced ? ' reduced' : ''}`;
  page.on('console', m => { if (m.type() === 'error') errors.push(`${tag}: ${m.text()}`); });
  page.on('pageerror', e => errors.push(`${tag}: ${e.message}`));
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(js ? 1200 : 300);
  return page;
}

/* ---------- in-page helpers (passed as strings so they run in the page) ---------- */
const HELPERS = `
  window.__v3 = {
    parse(c) { const m = c && c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[\\s,\\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; },
    lum(c) { const f = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); },
    over(top, bottom) { const a = top.a; return { r: top.r * a + bottom.r * (1 - a), g: top.g * a + bottom.g * (1 - a), b: top.b * a + bottom.b * (1 - a), a: 1 }; },
    /* the solid colour behind an element: the first opaque background up the tree, with any translucent ones
       on the way laid over it; null where a picture, a blend mode or a gradient makes it unknowable */
    bg(el, pseudo) {
      const layers = [], r0 = el.getBoundingClientRect(), cx = r0.left + r0.width / 2, cy = r0.top + r0.height / 2;
      if (pseudo) { const c = this.parse(getComputedStyle(el, pseudo).backgroundColor); if (c && c.a > 0) { layers.push(c); } }
      for (let e = pseudo ? el.parentElement : el; e && !(layers.length && layers[layers.length - 1].a >= 1); e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (e !== el) { const r = e.getBoundingClientRect(); if (r.width && (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) && e !== document.body && e !== document.documentElement) continue; }
        if (cs.mixBlendMode !== 'normal') return null;
        if (cs.backgroundImage !== 'none' && e !== document.body && e !== document.documentElement && !/\\.sheet$|sheet /.test(e.className)) return null;
        const c = this.parse(cs.backgroundColor);
        if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
      }
      let col = { r: 21, g: 21, b: 21, a: 1 };
      for (let i = layers.length - 1; i >= 0; i--) col = this.over(layers[i], col);
      return col;
    },
    ratio(fg, bg) { const a = this.lum(fg), b = this.lum(bg); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); },
    pair(el, pseudo) {
      const cs = getComputedStyle(el), bg = this.bg(el, pseudo);
      if (!bg) return null;
      const fg = this.over(this.parse(cs.color), bg);
      const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700;
      const large = size >= 24 || (bold && size >= 18.66);
      return { ratio: Math.round(this.ratio(fg, bg) * 100) / 100, need: large ? 3 : 4.5, size, fg: cs.color, bg: 'rgb(' + [bg.r, bg.g, bg.b].map(Math.round).join(', ') + ')' };
    },
    shown(el) {
      if (!el.isConnected || el.closest('.sr-only')) return false;
      if (el.checkVisibility && !el.checkVisibility({ visibilityProperty: true })) return false;
      /* text squashed by a transform on its way in or out (a bar scaling up, say) is not being read yet */
      const r = el.getBoundingClientRect(); return r.width > 0 && r.height >= parseFloat(getComputedStyle(el).fontSize) * 0.5;
    },
    /* every element that holds its own visible text */
    texts() {
      const out = [];
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        if (!n.data.trim()) continue;
        const el = n.parentElement;
        if (!el || /^(SCRIPT|STYLE|TITLE)$/.test(el.tagName) || out.includes(el) || !this.shown(el)) continue;
        out.push(el);
      }
      return out;
    },
    /* the rendered size of text: CSS font size, scaled by the SVG viewBox where it sits in an SVG */
    px(el) {
      const fs = parseFloat(getComputedStyle(el).fontSize);
      const svg = el.closest('svg');
      if (svg && el.getScreenCTM) { const m = el.getScreenCTM(); return fs * Math.hypot(m.a, m.b); }
      return fs;
    },
    name(el) { return el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : '') + ' "' + el.textContent.trim().replace(/\\s+/g, ' ').slice(0, 40) + '"'; },
  };`;
async function helpers(page) { await page.evaluate(HELPERS); }

/* ---------- 1. structure ---------- */
{
  const page = await open();
  const s = await page.evaluate(() => {
    const sections = [...document.querySelectorAll('.deck > section.slide')].map(x => '#' + x.id);
    const dots = [...document.querySelectorAll('.rail > a[href^="#"]')].map(a => a.getAttribute('href'));
    const folders = [...document.querySelectorAll('.cabinet .folder .folder__btn')].map(a => a.getAttribute('href'));
    const n = sections.length;
    const pad = i => (i < 9 ? '0' : '') + (i + 1);
    const recs = [...document.querySelectorAll('.cabinet .folder')].map(f => f.querySelector('.file__rec').textContent.replace(/\s+/g, ' ').trim());
    const nums = [...document.querySelectorAll('.cabinet .folder__n')].map(x => x.textContent.trim());
    const ks = [...document.querySelectorAll('.cabinet .folder')].map(f => getComputedStyle(f).getPropertyValue('--k').trim());
    return {
      sections, dots, folders, n,
      cssN: getComputedStyle(document.documentElement).getPropertyValue('--n').trim(),
      recsOk: recs.every((r, i) => r.endsWith(pad(i) + ' / ' + n)), recs,
      numsOk: nums.every((x, i) => x === pad(i)), ksOk: ks.every((k, i) => +k === i),
      label: document.querySelector('[data-cabinet-label]').textContent,
      archive: [...document.querySelectorAll('.entry__link[href^="#"]')].map(a => [a.getAttribute('href'), a.textContent.trim()]),
      names: Object.fromEntries([...document.querySelectorAll('.deck > section.slide')].map((x, i) => ['#' + x.id, pad(i)])),
    };
  });
  check(s.sections.length > 0 && s.sections.length === s.dots.length && s.dots.length === s.folders.length, `sections, dots and folders match in number (${s.sections.length}, ${s.dots.length}, ${s.folders.length})`);
  check(s.sections.every((id, i) => s.dots[i] === id && s.folders[i] === id), 'sections, dots and folders match in order', s.sections.map((id, i) => `${id} ${s.dots[i]} ${s.folders[i]}`).filter(l => new Set(l.split(' ')).size > 1));
  check(+s.cssN === s.n, `--n is the number of sheets (${s.cssN})`);
  check(s.recsOk, '"Sheet NN / N" on every file is written from the sections', s.recs);
  check(s.numsOk && s.ksOk, 'folder numbers and --k follow the folders');
  check(s.label.endsWith(s.n + ' sheets'), `the drawer says "${s.label}"`);
  check(s.archive.every(([h, t]) => !/^Sheet/.test(t) || t.startsWith('Sheet ' + s.names[h] + ',')), 'archive links that name a sheet name the right number', s.archive.map(x => x.join(' ')));
  await page.context().close();
}

/* ---------- 2. no link or source into another edition ---------- */
{
  const page = await open();
  await page.hover('.rail a[href="#loquar"]'); await page.waitForTimeout(400); /* the cards' links exist by now */
  const base = new URL(BASE);
  const urls = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('a[href], link[href], img[src], img[srcset], source[srcset], script[src], use[href]').forEach(el => {
      ['href', 'src'].forEach(k => { const v = el.getAttribute(k); if (v) out.push({ el: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''), v, abs: new URL(v, location.href).href }); });
      const ss = el.getAttribute('srcset'); if (ss) ss.split(',').forEach(part => { const v = part.trim().split(/\s+/)[0]; out.push({ el: 'srcset', v, abs: new URL(v, location.href).href }); });
    });
    return out;
  });
  const dir = base.pathname.replace(/[^/]*$/, '');      /* /v3/ or /Portfolio/v3/ */
  const bad = urls.filter(u => { const x = new URL(u.abs); return x.origin === base.origin && !x.pathname.startsWith(dir); });
  check(bad.length === 0, `no link or source leaves ${dir} for another edition (${urls.length} checked)`, bad.map(u => `${u.el} ${u.v}`));
  const css = await (await page.request.get(new URL('assets/css/site.css', BASE).href)).text();
  const cssBad = [...css.matchAll(/url\(([^)]+)\)/g)].map(m => m[1].replace(/['"]/g, '')).filter(u => !u.startsWith('data:') && new URL(u, new URL('assets/css/site.css', BASE)).pathname.indexOf(dir) !== 0);
  check(cssBad.length === 0, 'the stylesheet loads nothing from another edition', cssBad);
  await page.context().close();
}

/* ---------- 3. no visible text under 12px ---------- */
for (const [w, h, touch] of [[1440, 900, false], [1024, 620, false], [390, 844, true], [320, 640, true]]) {
  const page = await open({ width: w, height: h, touch });
  await helpers(page);
  const scan = () => page.evaluate(() => window.__v3.texts().map(el => ({ name: window.__v3.name(el), px: Math.round(window.__v3.px(el) * 10) / 10 })).filter(x => x.px < 11.95));
  const small = await scan();
  /* and with the cabinet open (its folders, the drawer front, a pulled file) */
  await page.evaluate(() => document.querySelector('.index-tab').click());
  await page.waitForTimeout(400);
  if (!touch) { await page.hover('.cabinet .folder__btn[href="#hockey"]'); await page.waitForTimeout(500); }
  const small2 = await scan();
  check(small.length + small2.length === 0, `no visible text under 12px at ${w}x${h} (page and open cabinet)`, [...small, ...small2].map(x => `${x.px}px ${x.name}`));
  await page.context().close();
}

/* ---------- 4. contrast ---------- */
{
  const page = await open();
  await helpers(page);
  const PAIRS = [
    ['.skip', 'skip link (black on vermilion)'],
    ['.panel li', 'skills list on vermilion'], ['.panel p:not(.micro)', 'skills paragraphs on vermilion'], ['.panel .micro', 'skills small print on vermilion'],
    ['.numbers .l', 'OCAPEX number labels'], ['.numbers .foot', 'OCAPEX footnote'], ['.card--red .small', 'the 486 card line'],
    ['.panel h3', 'skills headings (display, white)'], ['.numbers .n', 'OCAPEX numbers (display, white)'], ['.card--red .big', '486 (display, white)'],
    ['.stat-list .ac', 'Genuvalens adaptive results on paper'], ['#ocapex .title__sub', 'OCAPEX subtitle on paper'],
    ['.code__body', 'code panel text'], ['.code__bar b', 'code panel file name'],
    ['.folder.is-current .folder__tab', 'current folder tab (black on vermilion)', '::before'], ['.find__k', 'Find label'], ['.cabinet__label', 'drawer label'],
    ['.entry__year', 'archive years (24px)'], ['.ticket .card__k', 'ticket kicker (vermilion on black)'], ['.timeline .yr', 'hockey years (vermilion on black)'],
  ];
  const res = await page.evaluate(PAIRS => PAIRS.map(([sel, what, pseudo]) => {
    const els = [...document.querySelectorAll(sel)];
    if (!els.length) return { sel, what, missing: true };
    const ps = els.map(el => window.__v3.pair(el, pseudo)).filter(Boolean);
    const worst = ps.sort((a, b) => (a.ratio / a.need) - (b.ratio / b.need))[0];
    return { sel, what, ...worst };
  }), PAIRS);
  for (const r of res) check(!r.missing && r.ratio >= r.need, `${r.what}: ${r.ratio}:1 (needs ${r.need}, ${r.size}px)`, r.missing ? 'not found' : `${r.fg} on ${r.bg}`);
  /* code keywords and comments, coloured spans inside the panel */
  await page.waitForFunction(() => document.querySelector('.code__body .k') && document.querySelector('.code__body .c') && document.querySelector('.code__body .n'), null, { timeout: 20000 }).catch(() => {});
  const code = await page.evaluate(() => ['.code__body .k', '.code__body .c', '.code__body .n'].map(s => { const el = document.querySelector(s); return el ? { s, ...window.__v3.pair(el) } : { s, missing: true }; }));
  for (const c of code) check(!c.missing && c.ratio >= 4.5, `code panel ${c.s}: ${c.ratio}:1`);
  /* vermilion text that appears on hover over paper */
  await page.evaluate(() => { const el = document.querySelector('#exoskeleton .more'); window.scrollTo(0, document.getElementById('exoskeleton').getBoundingClientRect().top + scrollY); return !!el; });
  await page.waitForTimeout(900);
  await page.hover('#exoskeleton .more');
  await page.waitForTimeout(250);
  const more = await page.evaluate(() => window.__v3.pair(document.querySelector('#exoskeleton .more')));
  check(more && more.ratio >= 4.5, `"Read the report" on hover, on paper: ${more && more.ratio}:1`);
  /* the sweep: every text element over a solid colour, at rest */
  const sweep = await page.evaluate(() => window.__v3.texts().map(el => ({ el: window.__v3.name(el), p: window.__v3.pair(el) })).filter(x => x.p && x.p.ratio < x.p.need).map(x => `${x.p.ratio}:1 < ${x.p.need} ${x.el} (${x.p.fg} on ${x.p.bg})`));
  check(sweep.length === 0, 'contrast sweep at 1440x900: every text over a solid colour meets its threshold', sweep);
  await page.context().close();
  /* phones: the vermilion subtitle on paper stays large */
  const ph = await open({ width: 390, height: 844, touch: true });
  await helpers(ph);
  const sub = await ph.evaluate(() => window.__v3.pair(document.querySelector('#ocapex .title__sub')));
  check(sub && sub.size >= 24 && sub.ratio >= sub.need, `OCAPEX subtitle on a phone: ${sub && sub.size}px, ${sub && sub.ratio}:1`);
  const sweep2 = await ph.evaluate(() => window.__v3.texts().map(el => ({ el: window.__v3.name(el), p: window.__v3.pair(el) })).filter(x => x.p && x.p.ratio < x.p.need).map(x => `${x.p.ratio}:1 < ${x.p.need} ${x.el} (${x.p.fg} on ${x.p.bg})`));
  check(sweep2.length === 0, 'contrast sweep at 390x844', sweep2);
  await ph.context().close();
}

/* ---------- 5. the cabinet: hover opens it, the pulled file takes the click ---------- */
for (const [w, h] of [[1440, 900], [1024, 620]]) {
  const page = await open({ width: w, height: h });
  const box = sel => page.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, h: r.height, w: r.width }; }, sel);
  const dot = await box('.rail a[href="#hockey"]');
  await page.mouse.move(dot.cx, dot.cy, { steps: 5 });
  await page.waitForTimeout(450);
  const opened = await page.evaluate(() => ({ open: document.getElementById('cabinet').classList.contains('is-open'), out: (document.querySelector('.folder.is-out .folder__btn') || {}).hash }));
  check(opened.open && opened.out === '#hockey', `${w}x${h}: hovering the hockey dot opens the cabinet with the hockey file out`, JSON.stringify(opened));
  /* reach for "Open the sheet" the way a hand does: up and to the left at about 45 degrees, then across */
  const go = await box('#file-hockey .file__go');
  const path = [[dot.cx - (dot.cy - go.cy), go.cy], [go.cx, go.cy]];
  let from = [dot.cx, dot.cy];
  for (const pt of path) {
    const n = Math.max(6, Math.round(Math.hypot(pt[0] - from[0], pt[1] - from[1]) / 6));
    for (let k = 1; k <= n; k++) { await page.mouse.move(from[0] + (pt[0] - from[0]) * k / n, from[1] + (pt[1] - from[1]) * k / n); await page.waitForTimeout(8); }
    from = pt;
  }
  await page.mouse.down(); await page.mouse.up();
  await page.waitForTimeout(1200);
  const landed = await page.evaluate(() => ({ current: document.querySelector('.rail a[aria-current="true"]').getAttribute('href'), hash: location.hash, y: Math.round(scrollY) }));
  check(landed.current === '#hockey', `${w}x${h}: a click on the pulled file lands on its own sheet`, JSON.stringify(landed));
  /* target sizes: every dot and folder row is at least 24px tall (WCAG 2.5.8) */
  await page.mouse.move(dot.cx, dot.cy, { steps: 3 }); await page.waitForTimeout(450);
  const sizes = await page.evaluate(() => ({ dots: [...document.querySelectorAll('.rail > a')].map(a => a.getBoundingClientRect()), rows: [...document.querySelectorAll('.cabinet .folder__btn')].map(a => a.getBoundingClientRect()), cab: document.getElementById('cabinet').getBoundingClientRect(), vh: innerHeight }));
  const tooSmall = [...sizes.dots, ...sizes.rows].filter(r => r.height < 23.99 || r.width < 23.99);
  check(tooSmall.length === 0, `${w}x${h}: dots and folder rows are at least 24px (dots ${Math.round(sizes.dots[0].width)}x${Math.round(sizes.dots[0].height)}, rows ${Math.round(sizes.rows[0].width)}x${Math.round(sizes.rows[0].height)})`);
  check(sizes.cab.top >= 0 && sizes.cab.bottom <= sizes.vh, `${w}x${h}: the cabinet fits the window (${Math.round(sizes.cab.top)} to ${Math.round(sizes.cab.bottom)} of ${sizes.vh})`);
  const aligned = await page.evaluate(() => { const d = [...document.querySelectorAll('.rail > a')].map(a => a.getBoundingClientRect()); const f = [...document.querySelectorAll('.cabinet .folder__btn')].map(a => a.getBoundingClientRect()); return d.map((r, i) => Math.round(Math.abs((r.top + r.bottom) / 2 - (f[i].top + f[i].bottom) / 2))); });
  check(Math.max(...aligned) <= 2, `${w}x${h}: each dot is level with its folder (largest offset ${Math.max(...aligned)}px)`);
  await page.context().close();
}

/* ---------- 6. routes, Find, the pill, no script ---------- */
{
  const page = await open();
  const routes = await page.evaluate(() => [...document.querySelectorAll('.cover__hand a')].map(a => {
    const r = a.getBoundingClientRect(), pts = [[0.5, 0.5], [0.5, 0.78], [0.15, 0.6], [0.85, 0.4]].map(([fx, fy]) => [r.left + r.width * fx, r.top + r.height * fy]);
    const miss = pts.map(([x, y]) => { const e = document.elementFromPoint(x, y); return e && (e === a || a.contains(e)) ? null : (e ? e.tagName + '.' + e.className : 'nothing') + ' at ' + Math.round(x) + ',' + Math.round(y); }).filter(Boolean);
    return { text: a.textContent, href: a.getAttribute('href'), opens: a.hasAttribute('data-index-open'), reachable: !miss.length, miss };
  }));
  const want = { portfolio: '#cabinet', goaltender: '#hockey', researcher: '#research', violist: '#music' };
  check(routes.length === 4 && routes.every(r => want[r.text] === r.href), 'the cover\'s words are links: ' + routes.map(r => r.text + ' ' + r.href).join(', '));
  check(routes.every(r => r.reachable), 'nothing covers the cover\'s words (the whole word takes the pointer)', routes.filter(r => !r.reachable).map(r => r.text + ': ' + r.miss.join('; ')));
  await page.click('.route[href="#hockey"]');
  await page.waitForTimeout(1200);
  check(await page.evaluate(() => document.querySelector('.rail a[aria-current="true"]').getAttribute('href')) === '#hockey', '"goaltender" goes to the hockey sheet');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(600);
  await page.click('.route[href="#cabinet"]'); await page.waitForTimeout(400);
  check(await page.evaluate(() => document.getElementById('cabinet').classList.contains('is-open')), '"portfolio" opens the cabinet');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await page.keyboard.press('/'); await page.waitForTimeout(300);
  await page.keyboard.type('Carnegie'); await page.waitForTimeout(300);
  const found = await page.evaluate(() => ({ focus: document.activeElement.id, match: [...document.querySelectorAll('.folder.is-match .folder__btn')].map(a => a.hash), quote: (document.querySelector('.folder.is-out .file__quote') || {}).textContent }));
  check(found.focus === 'find' && found.match.includes('#music') && /Carnegie/.test(found.quote || ''), '"/" opens Find; "Carnegie" finds the music sheet and quotes the line', JSON.stringify(found));
  await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
  check(await page.evaluate(() => document.querySelector('.rail a[aria-current="true"]').getAttribute('href')) === '#music', 'Enter goes to the match');
  const tab = await page.evaluate(() => { const r = document.querySelector('.index-tab').getBoundingClientRect(); return { h: r.height, fs: getComputedStyle(document.querySelector('.index-tab')).fontSize, text: document.querySelector('.index-tab__k').textContent }; });
  check(tab.h >= 24 && parseFloat(tab.fs) >= 12 && tab.text === 'Index', `the rail carries an "Index" tab (${tab.h}px tall, ${tab.fs})`);
  await page.context().close();

  const ph = await open({ width: 390, height: 844, touch: true });
  const pill = await ph.evaluate(() => { const t = document.querySelector('.index-tab'), r = t.getBoundingClientRect(); return { text: t.textContent.replace(/\s+/g, ' ').trim(), centred: Math.abs((r.left + r.right) / 2 - innerWidth / 2) < 2, bottom: innerHeight - r.bottom, h: r.height, bg: getComputedStyle(t).backgroundColor }; });
  check(/^Index · 01 Cover$/.test(pill.text) && pill.centred && pill.h >= 44 && pill.bg === 'rgb(21, 21, 21)', `phones: a black pill at the bottom centre reads "${pill.text}" (${pill.h}px)`);
  await ph.tap('.index-tab'); await ph.waitForTimeout(400);
  check(await ph.evaluate(() => document.getElementById('cabinet').classList.contains('is-open')), 'phones: the pill opens the bottom panel');
  await ph.context().close();

  const nojs = await open({ js: false });
  const nj = await nojs.evaluate(() => ({ dots: [...document.querySelectorAll('.rail > a')].every(a => a.tabIndex === 0 || !a.hasAttribute('tabindex')), cabinet: getComputedStyle(document.getElementById('cabinet')).display }));
  await nojs.click('.index-tab'); await nojs.waitForTimeout(200);
  const shown = await nojs.evaluate(() => getComputedStyle(document.getElementById('cabinet')).display);
  check(nj.dots && nj.cabinet === 'none' && shown !== 'none', 'without the script the dots are plain links and the Index tab shows the cabinet as its target');
  await nojs.context().close();

  const rm = await open({ reduced: true });
  await rm.evaluate(() => document.querySelector('.rail a[href="#loquar"]').click()); await rm.waitForTimeout(300);
  const card = await rm.$('#loquar .card--a'); const b = await card.boundingBox();
  const t0 = await rm.evaluate(() => getComputedStyle(document.querySelector('#loquar .card--a')).transform);
  await rm.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 3 }); await rm.waitForTimeout(300);
  const t1 = await rm.evaluate(() => { const c = document.querySelector('#loquar .card--a'), s = getComputedStyle(c); return { transform: s.transform, translate: s.translate, rotate: s.rotate, img: getComputedStyle(c.querySelector('img')).scale, other: getComputedStyle(document.querySelector('#loquar .card--b')).filter }; });
  check(t0 === t1.transform && t1.translate === 'none' && t1.rotate === 'none' && (t1.img === 'none' || t1.img === '1') && /opacity/.test(t1.other), 'reduced motion: a card hover changes opacity only', JSON.stringify(t1));
  await rm.context().close();
}

/* ---------- 6b. keyboard: tabbing out of the cabinet closes it; Find keeps the current tab readable ---------- */
{
  const page = await open();
  await helpers(page);
  await page.focus('.index-tab'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  const opened = await page.evaluate(() => document.getElementById('cabinet').classList.contains('is-open'));
  await page.focus('.cabinet__close'); await page.keyboard.press('Tab'); await page.waitForTimeout(250);
  const out = await page.evaluate(() => ({ open: document.getElementById('cabinet').classList.contains('is-open'), at: document.activeElement.textContent.trim() }));
  check(opened && !out.open, `keyboard: Enter on the Index tab opens the cabinet, and tabbing on out of it (to "${out.at}") closes it`, JSON.stringify({ opened, ...out }));
  await page.keyboard.press('/'); await page.waitForTimeout(250);
  await page.keyboard.type('Carnegie'); await page.waitForTimeout(300);
  const cur = await page.evaluate(() => { const t = document.querySelector('.folder.is-current:not(.is-match) .folder__tab'); return t ? window.__v3.pair(t, '::before') : null; });
  check(cur && cur.ratio >= 4.5, `Find: the current sheet's vermilion tab stays readable while other sheets match (${cur && cur.ratio}:1)`, cur && `${cur.fg} on ${cur.bg}`);
  await page.context().close();
}

/* ---------- 7. console ---------- */
check(errors.length === 0, 'no console errors', errors);

await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exitCode = failures ? 1 : 0;
