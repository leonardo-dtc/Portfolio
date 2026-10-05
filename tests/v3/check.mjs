// Browser checks for the v3 poster edition (one page of twelve sheets, and the six project files in v3/files/).
//
//   python3 tools/serve.py 8778          # in another terminal, from the repository root
//   node tests/v3/check.mjs              # BASE=http://127.0.0.1:8802/v3/ node tests/v3/check.mjs for another server
//
// It finds Playwright through PLAYWRIGHT_MODULE (the path of its index.mjs) or the usual package names, and runs
// Chromium. Each check prints "ok" or "FAIL"; any FAIL sets the exit code to 1.
//
//   1. structure   the sections, the rail's dots and the cabinet's folders match in number and order, and the
//                  counts the script writes (--n, "Sheet NN / N", folder numbers, "N sheets") agree with them
//   2. editions    no link, image or stylesheet points into another edition of the portfolio (the deck, every
//                  file, site.css and files.css)
//   3. 12px        no visible text under 12px (at rest, with the cabinet open, at desktop and phone widths; every
//                  file on screen and in print, the printed link addresses included)
//   4. contrast    the pairs fixed in round three pass (4.5:1, or 3:1 for large text), and a sweep of every text
//                  element over a solid background finds nothing under its threshold
//   4b. step back  pointing at a collage card steps the other back by colour: no text is dimmed by opacity and
//                  every text still meets its threshold; the card pointed at comes to the top
//   5. cabinet     hovering a dot opens the cabinet; moving the mouse up to the pulled file and clicking it
//                  lands on that file's own sheet
//   5b. intent     diagonal paths from a dot up to its file keep that file out (V3_AIM=full runs all 108 paths);
//                  scrubbing straight down the dots stays immediate
//   6. routes      the cover's words go where they say; Find, the targets and the pill do their jobs
//   6b. keyboard   tabbing out of the cabinet closes it; while Find filters, the current tab stays readable
//   6c. keyboard   the walk from the top (the Index tab is the one way in); focus never rests on a hidden chrome
//                  name or pill; the first key press finishes the code panel; 44px touch targets
//   6d. the Mac    the archive's cards become the files on a classic Macintosh (one file a card, in order);
//                  the screen comes on when the sheet arrives; a click or Return opens a file's window, in front,
//                  with the focus, and Escape closes it, the focus back on its icon; arrows move between files
//                  and never change the sheet; View, by Name lists them; File, Open and Close Window, the close
//                  box, the Archive disk, the Trash and Special, Restart work; the title bar drags its window and
//                  never off the screen's left edge; Find opens a card's file; at 390 and 320 every window takes
//                  the whole screen and nothing scrolls sideways; under reduced motion no outline zooms; without
//                  the script, in print and in forced colours the cards show instead
//   7. files       the hockey file prints on one Letter page; pager lines show without the script; the narrow
//                  drawer shows one tab; the chrome text sits where the deck's does; Back returns to where the
//                  reader was
//   8. console     no errors on any load (with and without the script, reduced motion, phone, every file)

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
/* the project files, v3/files/<slug>/: when you add a file, add its slug here */
const FILES = ['aducanumab', 'genuvalens', 'loquar', 'ocapex', 'hockey', 'resume'];
async function open({ width = 1440, height = 900, js = true, reduced = false, touch = false, path = '' } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, javaScriptEnabled: js, reducedMotion: reduced ? 'reduce' : 'no-preference', ...(touch ? { hasTouch: true, isMobile: true } : {}) });
  const page = await ctx.newPage();
  const tag = `${path || '/'} ${width}x${height}${js ? '' : ' no-js'}${reduced ? ' reduced' : ''}`;
  page.on('console', m => { if (m.type() === 'error') errors.push(`${tag}: ${m.text()}`); });
  page.on('pageerror', e => errors.push(`${tag}: ${e.message}`));
  await page.goto(new URL(path, BASE).href, { waitUntil: 'load' });
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
    /* how much an element's own opacity and its ancestors' (opacity and filter: opacity()) let through */
    eff(el) { let a = 1; for (let e = el; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); a *= +cs.opacity; const m = cs.filter.match(/opacity\\(([\\d.]+)\\)/); if (m) a *= +m[1]; } return a; },
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
  for (const sheet of ['assets/css/site.css', 'assets/css/files.css']) {
    const css = await (await page.request.get(new URL(sheet, BASE).href)).text();
    const cssBad = [...css.matchAll(/url\(([^)]+)\)/g)].map(m => m[1].replace(/['"]/g, '')).filter(u => !u.startsWith('data:') && new URL(u, new URL(sheet, BASE)).pathname.indexOf(dir) !== 0);
    check(cssBad.length === 0, `${sheet} loads nothing from another edition`, cssBad);
  }
  await page.context().close();
  /* every project file: its links, images, stylesheet and script stay in the edition, and it asks for nothing
     from another origin */
  for (const slug of FILES) {
    const fp = await open({ path: `files/${slug}/` });
    const furls = await fp.evaluate(() => {
      const out = [];
      document.querySelectorAll('a[href], link[href], img[src], img[srcset], source[srcset], script[src], use[href]').forEach(el => {
        ['href', 'src'].forEach(k => { const v = el.getAttribute(k); if (v) out.push({ el: el.tagName.toLowerCase(), v, abs: new URL(v, location.href).href }); });
        const ss = el.getAttribute('srcset'); if (ss) ss.split(',').forEach(part => { const v = part.trim().split(/\s+/)[0]; out.push({ el: 'srcset', v, abs: new URL(v, location.href).href }); });
      });
      return { out, loaded: performance.getEntriesByType('resource').map(r => r.name), robots: (document.querySelector('meta[name="robots"]') || {}).content };
    });
    const fbad = furls.out.filter(u => { const x = new URL(u.abs); return x.origin === base.origin && !x.pathname.startsWith(dir); });
    const foreign = furls.loaded.filter(u => new URL(u).origin !== base.origin);
    check(fbad.length === 0 && foreign.length === 0 && furls.robots === 'noindex', `files/${slug}/: nothing leaves ${dir}, nothing from another origin, noindex (${furls.out.length} checked)`, [...fbad.map(u => `${u.el} ${u.v}`), ...foreign]);
    await fp.context().close();
  }
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

/* the files: on screen at desktop and phone widths, and in print, where 1rem is 12pt and nothing (not even a
   printed link address) goes under 9pt (12px) */
for (const slug of FILES) {
  const small = [];
  for (const [w, h, touch] of [[1440, 900, false], [390, 844, true]]) {
    const fp = await open({ width: w, height: h, touch, path: `files/${slug}/` });
    await helpers(fp);
    small.push(...(await fp.evaluate(() => window.__v3.texts().map(el => ({ name: window.__v3.name(el), px: Math.round(window.__v3.px(el) * 10) / 10 })).filter(x => x.px < 11.95))).map(x => `${w}: ${x.px}px ${x.name}`));
    if (!touch) {
      await fp.emulateMedia({ media: 'print' });
      const pr = await fp.evaluate(() => {
        const t = window.__v3.texts().map(el => ({ name: window.__v3.name(el), px: Math.round(parseFloat(getComputedStyle(el).fontSize) * 10) / 10 })).filter(x => x.px < 11.95);
        const addr = [...document.querySelectorAll('a[href^="http"]')].filter(a => a.checkVisibility()).map(a => ({ name: 'address after ' + a.textContent.trim().slice(0, 30), cs: getComputedStyle(a, '::after') })).filter(x => x.cs.content !== 'none' && x.cs.content !== 'normal').map(x => ({ name: x.name, px: Math.round(parseFloat(x.cs.fontSize) * 10) / 10 })).filter(x => x.px < 11.95);
        return [...t, ...addr];
      });
      small.push(...pr.map(x => `print: ${x.px}px ${x.name}`));
    }
    await fp.context().close();
  }
  check(small.length === 0, `files/${slug}/: no visible text under 12px (1440, 390, and in print)`, small.slice(0, 12));
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

/* ---------- 4b. the step back: by colour, so dimmed text keeps its contrast ---------- */
{
  const page = await open();
  await helpers(page);
  const goSheet = async id => { await page.evaluate(id => document.querySelector(`.rail a[href="#${id}"]`).click(), id); await page.mouse.move(700, 120); await page.waitForTimeout(1300); };
  /* every text in a root: not dimmed by opacity, and over its solid colour at its threshold */
  const audit = sel => page.evaluate(sel => window.__v3.texts().filter(el => document.querySelector(sel).contains(el)).map(el => ({ el: window.__v3.name(el), eff: window.__v3.eff(el), p: window.__v3.pair(el) })).filter(x => x.eff < 0.99 || (x.p && x.p.ratio < x.p.need)).map(x => `${x.el}: opacity ${x.eff.toFixed(2)}${x.p ? `, ${x.p.ratio}:1 (needs ${x.p.need}, ${x.p.fg} on ${x.p.bg})` : ''}`), sel);
  /* a point on the card that the card itself takes (the other card may cover part of it) */
  const pointIn = sel => page.evaluate(sel => { const c = document.querySelector(sel), r = c.getBoundingClientRect(); for (const fy of [.5, .3, .7, .2, .8]) for (const fx of [.5, .3, .7, .2, .8]) { const x = r.left + r.width * fx, y = r.top + r.height * fy, e = document.elementFromPoint(x, y); if (e && c.contains(e)) return [x, y]; } return null; }, sel);
  const bad = [], tops = [];
  for (const id of ['research', 'exoskeleton', 'loquar']) {
    await goSheet(id);
    for (const k of ['a', 'b']) {
      const pt = await pointIn(`#${id} .card--${k}`);
      await page.mouse.move(pt[0], pt[1], { steps: 4 }); await page.waitForTimeout(1000);
      bad.push(...(await audit(`#${id} .collage`)).map(x => `${id}, card--${k} pointed at: ${x}`));
      /* where the two cards overlap, the one pointed at is on top */
      const top = await page.evaluate(([id, k]) => { const a = document.querySelector(`#${id} .card--a`).getBoundingClientRect(), b = document.querySelector(`#${id} .card--b`).getBoundingClientRect(); const l = Math.max(a.left, b.left), t = Math.max(a.top, b.top), r = Math.min(a.right, b.right), btm = Math.min(a.bottom, b.bottom); if (l >= r || t >= btm) return null; const e = document.elementFromPoint((l + r) / 2, (t + btm) / 2), c = e && e.closest('.card'); return c ? (c.classList.contains('card--' + k) ? 'ok' : `card--${k} pointed at, the other card on top`) : 'nothing'; }, [id, k]);
      if (top !== null) tops.push(`${id}: ${top}`);
    }
    /* from the second card back to the first, crossing the paper on the way: the first comes to the top at once,
       not after the second card's 800ms drop */
    const ptA = await pointIn(`#${id} .card--a`);
    const off = await page.evaluate(id => { const r = document.querySelector(`#${id} .collage`).getBoundingClientRect(); return [r.left + 4, r.bottom + 30]; }, id);
    await page.mouse.move(off[0], off[1], { steps: 3 }); await page.waitForTimeout(150);
    await page.mouse.move(ptA[0], ptA[1], { steps: 3 }); await page.waitForTimeout(200);
    const back = await page.evaluate(id => { const a = document.querySelector(`#${id} .card--a`).getBoundingClientRect(), b = document.querySelector(`#${id} .card--b`).getBoundingClientRect(); const l = Math.max(a.left, b.left), t = Math.max(a.top, b.top), r = Math.min(a.right, b.right), btm = Math.min(a.bottom, b.bottom); if (l >= r || t >= btm) return null; const e = document.elementFromPoint((l + r) / 2, (t + btm) / 2), c = e && e.closest('.card'); return c && c.classList.contains('card--a') ? 'ok' : 'card--a pointed at again, card--b still on top 200ms later'; }, id);
    if (back !== null) tops.push(`${id} (back to card--a): ${back}`);
    await page.mouse.move(700, 120); await page.waitForTimeout(900);
  }
  check(bad.length === 0, 'pointing at a collage card steps the other back by colour: no text dimmed by opacity, every text at its threshold', bad.slice(0, 12));
  check(tops.length > 0 && tops.every(t => /: ok$/.test(t)), `the card pointed at comes to the top (${tops.length} overlaps)`, tops);
  await page.context().close();
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

/* ---------- 5b. hover intent: from a dot up and left to its pulled file, the file stays out ----------
   Mouse moves at a hand's pace (CDP events 8 or 16 ms apart, 12 or 30 of them) from the centre of a dot to the
   middle of its file, 5, 10 or 20% of the way down it. Crossing the other folders' edges and dots on the way
   must not swap the file, and the point reached must be that file (so a click opens its sheet).
   V3_AIM=full runs every dot below the cabinet's top: 9 dots, 108 paths. */
{
  const page = await open();
  const client = await page.context().newCDPSession(page);
  const mv = (x, y) => client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  const FULL = process.env.V3_AIM === 'full';
  const names = FULL ? ['Viola & violin', 'The record', 'OCAPEX', 'Contact', 'Goaltender', 'Loquar', 'Drug safety', 'About me', 'Archive'] : ['Viola & violin', 'The record', 'OCAPEX'];
  const out = () => page.evaluate(() => { const f = document.querySelector('.folder.is-out .folder__btn'); return f ? f.getAttribute('href') : null; });
  const wrong = []; let n = 0;
  for (const name of names) for (const ms of FULL ? [8, 16] : [16]) for (const steps of FULL ? [12, 30] : [12]) for (const frac of [0.05, 0.1, 0.2]) {
    await mv(700, 800); await page.waitForTimeout(900);
    const dot = await page.$eval(`.rail a[data-name="${name}"]`, a => { const r = a.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    await mv(dot[0], dot[1]); await page.waitForTimeout(700);
    const before = await out();
    const fb = await page.evaluate(() => { const f = document.querySelector('.folder.is-out .file'); if (!f) return null; const r = f.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; });
    n++;
    if (!fb) { wrong.push(`${name}: no file out`); continue; }
    const tx = (fb[0] + fb[2]) / 2, ty = fb[1] + (fb[3] - fb[1]) * frac;
    for (let i = 1; i <= steps; i++) { await mv(dot[0] + (tx - dot[0]) * i / steps, dot[1] + (ty - dot[1]) * i / steps); await new Promise(r => setTimeout(r, ms)); }
    await page.waitForTimeout(500);
    const after = await out();
    const under = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y), a = e && e.closest('.folder__btn'); return a ? a.getAttribute('href') : null; }, [tx, ty]);
    if (after !== before || under !== before) wrong.push(`${name}, ${steps} moves ${ms}ms apart, ${frac * 100}% down: ${before} became ${after} (under the pointer ${under})`);
  }
  check(wrong.length === 0, `hover intent: ${n - wrong.length} of ${n} diagonal paths from a dot up to its file keep that file out`, wrong);
  /* scrubbing: straight down from one dot to the next, a short rest brings the next file out */
  await mv(700, 800); await page.waitForTimeout(900);
  const d1 = await page.$eval('.rail a[data-name="Loquar"]', a => { const r = a.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  const d2 = await page.$eval('.rail a[data-name="OCAPEX"]', a => { const r = a.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await mv(d1[0], d1[1]); await page.waitForTimeout(700);
  for (let i = 1; i <= 4; i++) { await mv(d1[0], d1[1] + (d2[1] - d1[1]) * i / 4); await new Promise(r => setTimeout(r, 16)); }
  await page.waitForTimeout(150);
  const scrub = await out();
  check(scrub === '#ocapex', `scrubbing straight down the dots stays immediate (150ms after reaching OCAPEX: ${scrub})`);
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
  const pillAt = p => p.evaluate(() => { const t = document.querySelector('.index-tab'), r = t.getBoundingClientRect(); return { text: t.innerText.replace(/\s+/g, ' ').trim().toLowerCase(), right: Math.round(innerWidth - r.right), bottom: Math.round(innerHeight - r.bottom), w: Math.round(r.width), h: r.height, bg: getComputedStyle(t).backgroundColor }; });
  const pill = await pillAt(ph);
  check(pill.text === 'index · 01 cover' && pill.right === 12 && pill.bottom === 14 && pill.h >= 44 && pill.bg === 'rgb(21, 21, 21)', `phones: a black pill rests at the bottom right (12px in, 14px up) and reads "${pill.text}" (${pill.w}x${pill.h})`, JSON.stringify(pill));
  await ph.tap('.index-tab'); await ph.waitForTimeout(400);
  check(await ph.evaluate(() => document.getElementById('cabinet').classList.contains('is-open')), 'phones: the pill opens the bottom panel');
  await ph.context().close();
  const ls = await open({ width: 844, height: 390, touch: true });
  const pill2 = await pillAt(ls);
  check(pill2.text === 'index · 01' && pill2.right === 12 && pill2.w <= 130, `windows under 540px tall: the pill names the number only, "${pill2.text}" (${pill2.w}px wide)`, JSON.stringify(pill2));
  await ls.context().close();

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
  const t1 = await rm.evaluate(() => { const c = document.querySelector('#loquar .card--a'), s = getComputedStyle(c), o = document.querySelector('#loquar .card--b'); return { transform: s.transform, translate: s.translate, rotate: s.rotate, img: getComputedStyle(c.querySelector('img')).scale, otherImg: getComputedStyle(o.querySelector('img')).opacity, otherCard: getComputedStyle(o).opacity + ' ' + getComputedStyle(o).filter }; });
  check(t0 === t1.transform && t1.translate === 'none' && t1.rotate === 'none' && (t1.img === 'none' || t1.img === '1') && +t1.otherImg < 1 && t1.otherCard === '1 none', 'reduced motion: a card hover moves nothing; the other card steps back by colour and its picture fades', JSON.stringify(t1));
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

/* ---------- 6c. keyboard: the walk, focus that is always on screen, the code panel; touch targets ---------- */
{
  /* the Index tab is the one way into the index: the folder button is out of the tab order, so focus never
     opens the cabinet on its way to the cover's routes */
  const page = await open();
  const walk = [];
  for (let k = 0; k < 7; k++) { await page.keyboard.press('Tab'); await page.waitForTimeout(60); walk.push(await page.evaluate(() => document.activeElement.textContent.trim().replace(/\s+/g, ' '))); }
  const cab = await page.evaluate(() => document.getElementById('cabinet').classList.contains('is-open'));
  const want = ['Skip to content', 'Leonardo Carvalho', 'Email', 'Index · 01 Cover', 'portfolio', 'goaltender', 'researcher'];
  check(!cab && want.every((t, i) => walk[i] === t), `keyboard: the walk from the top is skip, name, Email, Index, then the cover's routes (and the cabinet stays shut)`, walk.join(' | '));
  /* the code panel: a keyboard has no hover to pause it, so the first key press finishes it at once */
  const typed = await page.evaluate(() => ({ len: document.querySelector('[data-code-out]').textContent.length, done: document.querySelector('[data-code]').classList.contains('is-done') }));
  await page.waitForTimeout(1200);
  const later = await page.evaluate(() => document.querySelector('[data-code-out]').textContent.length);
  await page.context().close();
  const rm = await open({ reduced: true });
  const full = await rm.evaluate(() => document.querySelector('[data-code-out]').textContent.length);
  await rm.context().close();
  check(typed.done && typed.len === full && later === full, `keyboard: the first key press finishes the code panel (${typed.len} of ${full} characters, nothing typed after)`, JSON.stringify({ typed, later, full }));

  /* narrow windows: the chrome's strip and the pill step away while scrolling down, but come back while they
     hold keyboard focus */
  const ph = await open({ width: 720, height: 800 });
  await ph.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight / 2, behavior: 'instant' }));
  await ph.waitForTimeout(400);
  const away = await ph.evaluate(() => document.documentElement.classList.contains('bars-away'));
  await ph.keyboard.press('Tab'); await ph.keyboard.press('Tab'); await ph.waitForTimeout(450);
  const name = await ph.evaluate(() => { const a = document.activeElement, r = a.getBoundingClientRect(); return { text: a.textContent.trim(), top: Math.round(r.top), bottom: Math.round(r.bottom) }; });
  await ph.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await ph.waitForTimeout(900);
  const atEnd = await ph.evaluate(() => document.documentElement.className);
  await ph.keyboard.press('Tab'); await ph.waitForTimeout(450);
  const mail = await ph.evaluate(() => { const a = document.activeElement, r = a.getBoundingClientRect(); return { text: a.textContent.trim(), top: Math.round(r.top), bottom: Math.round(r.bottom) }; });
  await ph.keyboard.press('Tab'); await ph.waitForTimeout(450);
  const pill = await ph.evaluate(() => { const a = document.activeElement, r = a.getBoundingClientRect(), cs = getComputedStyle(a); return { cls: a.className, top: Math.round(r.top), bottom: Math.round(r.bottom), opacity: +cs.opacity, vh: innerHeight }; });
  check(away && name.text === 'Leonardo Carvalho' && name.top >= 0, `narrow windows: the chrome's name comes back while it has focus (top ${name.top}px)`, JSON.stringify(name));
  check(mail.text === 'Email' && mail.top >= 0, `narrow windows: so does its Email (top ${mail.top}px)`, JSON.stringify(mail));
  check(/at-end/.test(atEnd) && pill.cls === 'index-tab' && pill.opacity === 1 && pill.top >= 0 && pill.bottom <= pill.vh, `narrow windows: at the foot, the Index pill comes back while it has focus (opacity ${pill.opacity}, ${pill.top} to ${pill.bottom} of ${pill.vh})`, JSON.stringify({ atEnd, pill }));
  await ph.context().close();

  /* touch screens: the routes and the chrome's name are 44px tall targets, and the whole height takes the tap
     (measured along the word's own height: the hand line is tilted 3 degrees) */
  const tp = await open({ width: 390, height: 844, touch: true });
  const tt = await tp.evaluate(() => [...document.querySelectorAll('.route'), document.querySelector('.chrome a')].filter(a => a.getClientRects().length && a.checkVisibility()).map(a => {
    const r = a.getClientRects()[0], cx = r.left + r.width / 2, cy = r.top + r.height / 2, h = a.offsetHeight;
    const hit = y => { const e = document.elementFromPoint(cx, y); return !!e && (e === a || a.contains(e)); };
    return { t: a.textContent.trim(), h, ends: hit(cy - h / 2 + 2) && hit(cy + h / 2 - 2) };
  }));
  check(tt.length >= 4 && tt.every(x => x.h >= 44 && x.ends), `touch: the cover's routes and the chrome's name take 44px (${tt.map(x => x.t + ' ' + x.h).join(', ')})`, JSON.stringify(tt));
  await tp.context().close();
}

/* ---------- 6d. the archive's Macintosh (assets/js/mac.js) ---------- */
{
  const page = await open({ path: '#archive' });
  await page.waitForTimeout(1600);
  const s0 = await page.evaluate(() => {
    const m = window.__v3mac, cards = [...document.querySelectorAll('#archive .entries > .entry')];
    const shown = [...document.querySelectorAll('.mac__grid > .mac__file')].map(b => window.__v3mac.files[+b.dataset.i].title);
    return { n: cards.length, files: m ? m.files.map(f => f.title) : [], shown, titles: cards.map(c => c.querySelector('.entry__title').textContent.replace(/\s+/g, ' ').trim()), on: document.querySelector('.mac__screen').className, cards: getComputedStyle(document.querySelector('#archive .entries')).display, wins: m.windows.map(w => w.querySelector('.mac__title').textContent), year: document.querySelector('.mac__col--year').getAttribute('aria-pressed'), kinds: [...document.querySelectorAll('.mac__file .mac__kind')].map(k => k.checkVisibility()).every(Boolean) };
  });
  check(s0.n > 0 && s0.files.join('|') === s0.titles.join('|'), `one file on the Mac for each archive card (${s0.files.length} of ${s0.n})`);
  check(s0.shown.join('|') === s0.titles.join('|') && s0.year === 'true' && s0.kinds, 'the Archive window lists them with their kind and year, newest first by Year, as the cards stand', JSON.stringify(s0.shown));
  check(/is-on/.test(s0.on) && s0.cards === 'none' && s0.wins.join() === 'Archive', `the screen is on once the sheet arrives, the Archive window open, the cards given way (${s0.on}; ${s0.wins.join()})`);
  const st = () => page.evaluate(() => ({ active: document.activeElement && (document.activeElement.getAttribute('aria-label') || document.activeElement.textContent.trim().slice(0, 40)), doc: !!document.activeElement.closest('.mac__win--doc'), wins: window.__v3mac.windows.map(w => w.querySelector('.mac__title').textContent), cur: document.querySelector('.rail a[aria-current]')?.getAttribute('href') }));
  /* down the list: from the first file to the third */
  const expect = await page.evaluate(() => { const g = [...document.querySelectorAll('.mac__grid > .mac__file')]; g[0].focus(); return g[2].getAttribute('aria-label'); });
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown');
  let s = await st();
  check(s.active === expect && s.cur === '#archive', `Down moves through the list and the deck stays on the sheet (${s.active}; ${s.cur})`);
  const want = s.active;
  await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  s = await st();
  check(s.wins.length === 2 && s.doc && want.startsWith(s.wins[1]), `Return opens the file in front, with the focus (${s.wins.join(' | ')})`);
  /* the file holds the whole card: its line, its paragraphs, its details and its link */
  const doc = await page.evaluate(() => {
    const w = window.__v3mac.windows.pop(), f = w._file, li = f.li;
    return { paras: w.querySelectorAll('.mac__body--doc > p:not([class])').length, cardParas: li.querySelectorAll('.entry__more > p').length, rows: w.querySelectorAll('.mac__body--doc dt').length, cardRows: li.querySelectorAll('.entry__more dt').length, line: (w.querySelector('.mac__lead') || {}).textContent === f.line, link: !!w.querySelector('.mac__go[href^="#"]') };
  });
  check(doc.cardParas > 0 && doc.paras === doc.cardParas && doc.rows === doc.cardRows && doc.line && doc.link, `the file's window holds the whole card: its line, ${doc.paras} paragraphs, ${doc.rows} details and its link`, JSON.stringify(doc));
  /* the zoom box fills the screen with the window, and puts it back */
  const zoomed = await page.evaluate(async () => {
    const w = window.__v3mac.windows.pop(), d = document.querySelector('.mac__desk').getBoundingClientRect(), r0 = w.getBoundingClientRect();
    w.querySelector('.mac__zoombox').click(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const r1 = w.getBoundingClientRect();
    w.querySelector('.mac__zoombox').click(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const r2 = w.getBoundingClientRect();
    return { fill: r1.width >= d.width - 20 && r1.height >= d.height - 20, back: Math.abs(r2.width - r0.width) < 1 && Math.abs(r2.left - r0.left) < 1 };
  });
  check(zoomed.fill && zoomed.back, 'the zoom box fills the screen with the file, and puts it back', JSON.stringify(zoomed));
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  s = await st();
  check(s.wins.length === 1 && s.active === want, `Escape closes it and the focus goes back to its file (${s.active})`);
  /* typing a name's first letters goes to it */
  await page.keyboard.type('te'); await page.waitForTimeout(100);
  s = await st();
  check(/^ten sports/.test(s.active), `typing "te" goes to the file whose name starts so (${s.active})`);
  /* a column's heading sorts by it; the same heading again turns it round */
  const order = () => page.evaluate(() => [...document.querySelectorAll('.mac__grid > .mac__file')].map(b => window.__v3mac.files[+b.dataset.i].title.toLowerCase()));
  await page.click('.mac__col--name'); const az = await order();
  await page.click('.mac__col--name'); const za = await order();
  await page.click('.mac__col--year'); const ny = await order();
  const sorted = [...az].sort((a, b) => a.localeCompare(b));
  check(az.join('|') === sorted.join('|') && za.join('|') === [...sorted].reverse().join('|') && ny.join('|') === s0.titles.map(t => t.toLowerCase()).join('|'), 'Name sorts A to Z, then Z to A; Year puts the newest first again', JSON.stringify({ az, za }));
  await page.click('.mac__mt >> text=View'); await page.click('.mac__mi[data-act="icons"]');
  const icons = await page.evaluate(() => { const r = [...document.querySelectorAll('.mac__grid > .mac__file')].map(b => b.getBoundingClientRect()); return document.querySelector('.mac__grid').classList.contains('is-icons') && r.filter(x => Math.abs(x.top - r[0].top) < 2).length > 1; });
  await page.click('.mac__mt >> text=View'); await page.click('.mac__mi[data-act="list"]');
  const back = await page.evaluate(() => { const r = [...document.querySelectorAll('.mac__grid > .mac__file')].map(b => b.getBoundingClientRect()); return !document.querySelector('.mac__grid').classList.contains('is-icons') && r.every((x, i) => !i || x.top > r[i - 1].top); });
  check(icons && back, 'View, as Icons lays the files out as icons; as List goes back to one row a file');
  const last = await page.evaluate(() => { const g = [...document.querySelectorAll('.mac__grid > .mac__file')], l = g[g.length - 1]; l.focus(); return window.__v3mac.files[+l.dataset.i].title; });
  await page.click('.mac__mt >> text=File'); await page.click('.mac__mi[data-act="open"]'); await page.waitForTimeout(500);
  const opened = (await st()).wins;
  await page.click('.mac__mt >> text=File'); await page.click('.mac__mi[data-act="close"]'); await page.waitForTimeout(400);
  check(opened[opened.length - 1] === last && (await st()).wins.length === 1, `File, Open opens the chosen file and Close Window closes it (${opened.join(' | ')})`);
  const bar = await page.evaluate(() => { const r = document.querySelector('.mac__win--finder .mac__bar').getBoundingClientRect(); return [r.left + r.width * .7, r.top + r.height / 2]; });
  await page.mouse.move(bar[0], bar[1]); await page.mouse.down(); await page.mouse.move(bar[0] - 400, bar[1] + 40, { steps: 6 }); await page.mouse.up();
  const pos = await page.evaluate(() => { const w = document.querySelector('.mac__win--finder'); return [w.offsetLeft, w.offsetTop]; });
  check(pos[0] === 0 && pos[1] > 12, `the title bar drags its window, never past the screen's left edge (${pos})`);
  await page.click('.mac__win--finder .mac__close'); await page.waitForTimeout(400);
  const closed = (await st()).wins.length;
  await page.click('.mac__icon--desk >> nth=0'); await page.waitForTimeout(500);
  const disk = (await st()).wins.join();
  await page.click('.mac__icon--desk >> nth=1'); await page.waitForTimeout(500);
  const bin = (await st()).wins.join();
  check(closed === 0 && disk === 'Archive' && /Trash/.test(bin), `the close box shuts the Archive window, the disk opens it again, and the Trash opens (${disk}; ${bin})`);
  await page.keyboard.press('Escape');
  await page.click('.mac__mt >> text=Special'); await page.click('.mac__mi[data-act="restart"]'); await page.waitForTimeout(200);
  const boot = await page.evaluate(() => document.querySelector('.mac__screen').className);
  await page.waitForTimeout(1300);
  check(/is-booting/.test(boot) && (await st()).wins.join() === 'Archive', `Special, Restart brings the screen on again, the Archive window alone (${boot})`);
  /* nothing on the screen is under 13px */
  const tiny = await page.evaluate(() => { window.__v3mac.open(window.__v3mac.files[0]); return [...document.querySelectorAll('.mac__screen *')].filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.data.trim()) && e.checkVisibility() && parseFloat(getComputedStyle(e).fontSize) < 13).map(e => e.className + ' ' + getComputedStyle(e).fontSize); });
  check(tiny.length === 0, `nothing on the Mac's screen is set under 13px (${tiny.length})`, tiny.slice(0, 5).join(', '));
  /* Find, from the cover: a card's words open its file on the Mac */
  const word = await page.evaluate(() => { const t = window.__v3mac.files[window.__v3mac.files.length - 1].kind; return t; });
  await page.evaluate(() => document.querySelector('.rail a[href="#cover"]').click()); await page.waitForTimeout(1200);
  await page.keyboard.press('/'); await page.waitForTimeout(400); await page.keyboard.type(word); await page.waitForTimeout(500); await page.keyboard.press('Enter'); await page.waitForTimeout(1800);
  s = await st();
  check(s.cur === '#archive' && s.wins.length >= 2 && s.wins.some(t => /Rocketry/.test(t)), `Find "${word}" lands on the archive and opens the file (${s.wins.join(' | ')})`);
  /* and a word only in a file's paragraphs finds it too */
  await page.evaluate(() => document.querySelector('.rail a[href="#cover"]').click()); await page.waitForTimeout(1200);
  await page.keyboard.press('/'); await page.waitForTimeout(400); await page.keyboard.type('Gompurkle'); await page.waitForTimeout(500); await page.keyboard.press('Enter'); await page.waitForTimeout(1800);
  s = await st();
  check(s.cur === '#archive' && s.wins.some(t => /labyrinth/.test(t)), `Find "Gompurkle" (a word in a file's details) opens that file (${s.wins.join(' | ')})`);
  await page.context().close();
}
for (const [w, h] of [[390, 844], [320, 700]]) {
  const page = await open({ width: w, height: h, touch: true, path: '#archive' });
  await page.evaluate(() => document.querySelector('.mac').scrollIntoView({ block: 'center' })); await page.waitForTimeout(1600);
  const sub = await page.evaluate(() => [...document.querySelectorAll('.mac__file .mac__sub')].every(e => e.checkVisibility()) && ![...document.querySelectorAll('.mac__file .mac__year')].some(e => e.checkVisibility()));
  await page.tap('.mac__file >> nth=1'); await page.waitForTimeout(600);
  const r = await page.evaluate(() => { const d = document.querySelector('.mac__desk').getBoundingClientRect(), w = window.__v3mac.windows.pop().getBoundingClientRect(); return { fill: w.width >= d.width - 16 && w.height >= d.height - 16, side: document.documentElement.scrollWidth > innerWidth }; });
  check(sub && r.fill && !r.side, `${w}x${h}: the list puts each file's kind and year under its name; a file's window takes the whole screen; nothing scrolls sideways`);
  await page.context().close();
}
{
  const page = await open({ reduced: true, path: '#archive' });
  const r = await page.evaluate(() => { window.__v3mac.open(window.__v3mac.files[0]); return { on: document.querySelector('.mac__screen').className, z: document.querySelectorAll('.mac__zoom').length }; });
  check(/is-on/.test(r.on) && r.z === 0, `reduced motion: the screen is on from the first frame and no outline zooms (${r.on}, ${r.z})`);
  await page.context().close();
}
{
  const page = await open({ js: false, path: '#archive' });
  const nojs = await page.evaluate(() => ({ mac: !!document.querySelector('.mac'), cards: getComputedStyle(document.querySelector('#archive .entries')).display, more: [...document.querySelectorAll('.entries .entry__more')].every(e => e.checkVisibility()) }));
  await page.context().close();
  const pp = await open({ path: '#archive' }); await pp.emulateMedia({ media: 'print' });
  const print = await pp.evaluate(() => ({ mac: getComputedStyle(document.querySelector('.mac')).display, cards: getComputedStyle(document.querySelector('#archive .entries')).display, more: getComputedStyle(document.querySelector('.entries .entry__more')).display }));
  await pp.context().close();
  const fc = await browser.newContext({ viewport: { width: 1440, height: 900 }, forcedColors: 'active' }), fp = await fc.newPage();
  await fp.goto(new URL('#archive', BASE).href); await fp.waitForTimeout(1200);
  const forced = await fp.evaluate(() => ({ mac: getComputedStyle(document.querySelector('.mac')).display, cards: getComputedStyle(document.querySelector('#archive .entries')).display, more: getComputedStyle(document.querySelector('.entries .entry__more')).display }));
  await fc.close();
  check(!nojs.mac && nojs.cards !== 'none' && nojs.more && print.mac === 'none' && print.cards !== 'none' && print.more !== 'none' && forced.mac === 'none' && forced.cards !== 'none' && forced.more !== 'none', `the cards show instead, each with its whole file, without the script, in print and in forced colours (${JSON.stringify({ nojs, print, forced })})`);
}

/* ---------- 7. the files ---------- */
{
  /* the coach one-pager prints on one Letter page */
  const hk = await open({ path: 'files/hockey/' });
  const pdf = await hk.pdf({ format: 'Letter' });
  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  check(pages === 1, `files/hockey/ prints on one Letter page (${pages})`);
  await hk.context().close();

  /* without the script every pager line shows (a hover reveal needs a resting twin) */
  const nj = await open({ path: 'files/hockey/', js: false });
  const lines = await nj.evaluate(() => [...document.querySelectorAll('.pager__d > span')].map(s => ({ o: +getComputedStyle(s).opacity, h: Math.round(s.getBoundingClientRect().height) })));
  check(lines.length === 2 && lines.every(l => l.o === 1 && l.h >= 12), `files without the script: the pager's lines show (${lines.map(l => l.h + 'px').join(', ')})`, JSON.stringify(lines));
  await nj.context().close();

  /* phones: the drawer shows only the current tab (a class, not :has()), the page never scrolls sideways, and
     the back, link-row and contact links and the chrome's name are 44px targets */
  const narrow = [];
  for (const slug of FILES) {
    const fp = await open({ width: 390, height: 844, touch: true, path: `files/${slug}/` });
    const r = await fp.evaluate(() => ({
      tabs: [...document.querySelectorAll('.drawer li')].filter(li => li.getBoundingClientRect().width > 0).length,
      wide: document.documentElement.scrollWidth - innerWidth,
      small: [...document.querySelectorAll('.back, .linkrow a, .contacts a, .chrome a')].filter(a => a.checkVisibility()).map(a => [a.textContent.trim().slice(0, 24), Math.round(a.getBoundingClientRect().height)]).filter(x => x[1] < 44),
    }));
    if (r.tabs !== 1 || r.wide > 0 || r.small.length) narrow.push(`${slug}: ${JSON.stringify(r)}`);
    await fp.context().close();
  }
  check(narrow.length === 0, 'files at 390: one drawer tab, no sideways scroll, 44px touch targets', narrow);

  /* the chrome's text sits where the deck's does, so it does not show double while the page changes */
  const off = [];
  for (const [w, h] of [[1440, 900], [1280, 800], [1024, 620]]) {
    const at = async path => { const p = await open({ width: w, height: h, path }); const y = await p.evaluate(() => { const a = document.querySelector('.chrome a'), rg = document.createRange(); rg.selectNodeContents(a); const r = rg.getBoundingClientRect(); return Math.round((r.top + r.bottom) / 2 * 10) / 10; }); await p.context().close(); return y; };
    const deck = await at(''), file = await at('files/aducanumab/');
    if (Math.abs(deck - file) > 1) off.push(`${w}x${h}: deck ${deck}, file ${file}`);
  }
  check(off.length === 0, 'the chrome\'s name sits at the same height on the deck and in a file (1440x900, 1280x800, 1024x620)', off);

  /* Back from a file lands where the reader was, not on the sheet in the old #hash */
  const bp = await open({ path: '#research' });
  const y0 = await bp.evaluate(() => { window.scrollTo({ top: 7 * innerHeight, behavior: 'instant' }); return Math.round(scrollY); });
  await bp.waitForTimeout(500);
  await bp.goto(new URL('files/hockey/', BASE).href, { waitUntil: 'load' }); await bp.waitForTimeout(300);
  await bp.goBack({ waitUntil: 'load' }); await bp.waitForTimeout(1200);
  const back = await bp.evaluate(() => ({ y: Math.round(scrollY), hash: location.hash, type: (performance.getEntriesByType('navigation')[0] || {}).type }));
  check(Math.abs(back.y - y0) < 50, `Back from a file returns to where the reader was (${y0} -> ${back.y}, ${back.type}, hash ${back.hash})`, JSON.stringify(back));
  await bp.context().close();
  const hp = await open({ path: '#hockey' });
  check(await hp.evaluate(() => document.querySelector('.rail a[aria-current="true"]').getAttribute('href')) === '#hockey', 'a fresh load of #hockey still lands on the hockey sheet');
  await hp.context().close();
  /* and the files load without errors with the script off */
  for (const slug of FILES) { const fp = await open({ path: `files/${slug}/`, js: false }); await fp.context().close(); }
}

/* ---------- 7b. the decisions of 2026-10-05: Email in the chrome (T4), the class games left out (T6), the contact
   sheet clean with its words inside their frame (T18), and the design toggles (toggles.js): the archive's Mac or its
   cards (T17), the cover as a poster or a desk (T40), the contact sheet clean or as it was, and its words ---------- */
{
  const page = await open();
  const mail = await page.evaluate(() => { const a = [...document.querySelectorAll('.chrome a')].find(x => /^mailto:/.test(x.getAttribute('href'))); return a && { text: a.textContent.trim(), href: a.getAttribute('href') }; });
  check(mail && mail.text === 'Email' && mail.href === 'mailto:leonardo.dtc2009@gmail.com', 'T4: the chrome carries Email, so a way to write shows on every sheet', JSON.stringify(mail));
  const games = await page.evaluate(() => ({ cards: [...document.querySelectorAll('.entries > .entry .entry__title')].map(e => e.textContent), mac: window.__v3mac ? window.__v3mac.files.length : 0, record: /Snake, Minesweeper/.test(document.getElementById('record').textContent), index: document.getElementById('file-archive').textContent }));
  check(!games.cards.some(t => /snake|minesweeper/i.test(t)) && games.cards.length === 7 && games.mac === 7 && games.record && !/games/i.test(games.index), `T6: no class games in the archive (${games.cards.length} cards, ${games.mac} files on the Mac) or in its index card; The record keeps them as coursework`, JSON.stringify(games));
  const def = await page.evaluate(() => ({ archive: document.documentElement.dataset.archive, cover: document.documentElement.dataset.cover, talk: document.documentElement.dataset.talk, words: document.documentElement.dataset.talkWords, api: typeof window.toggles, list: typeof window.toggles.list }));
  check(def.archive === 'mac' && def.cover === 'poster' && def.talk === 'clean' && def.words === 'lets-talk' && def.api === 'object' && def.list === 'function', `the toggles' defaults show on <html>: archive ${def.archive}, cover ${def.cover}, talk ${def.talk}, words ${def.words}`, JSON.stringify(def));
  // the archive: the Mac by default; the wall of cards from the console, kept across a reload; reset returns the Mac
  const view = () => page.evaluate(() => { const vis = e => !!e && e.checkVisibility(); return { mac: vis(document.querySelector('.mac')), cards: [...document.querySelectorAll('.entries > .entry')].filter(vis).length }; });
  const v0 = await view();
  await page.evaluate(() => { window.toggles.archive = 'cards'; });
  await page.waitForTimeout(300);
  const v1 = await view();
  await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1200);
  const v2 = await view(), kept = await page.evaluate(() => localStorage.getItem('v3:toggles'));
  check(v0.mac && v0.cards === 0 && !v1.mac && v1.cards === 7 && !v2.mac && v2.cards === 7 && /"archive":"cards"/.test(kept), `T17: the Mac by default; toggles.archive = 'cards' shows the wall of cards instead, kept in this browser across a reload`, JSON.stringify({ v0, v1, v2, kept }));
  // Find with the cards goes to the card itself, not to a window on the Mac
  await page.evaluate(() => { document.querySelector('[data-index-open]').click(); });
  await page.waitForTimeout(400);
  await page.fill('.find input', 'Rocketry'); await page.keyboard.press('Enter');   /* (on the archive's card alone) */
  await page.waitForTimeout(1600);
  const found = await page.evaluate(() => ({ card: !!document.querySelector('.entries > .entry.is-found'), files: window.__v3mac.windows.filter(w => !/finder|trash/.test(w.className)).length, file: (document.querySelector('dialog.entry-file[open] .entry-file__title') || {}).textContent }));
  check(found.card && found.files === 0 && /Rocketry/.test(found.file || ''), 'T17: with the cards, Find lights the card itself and opens its file on paper (no file opens on the hidden Mac)', JSON.stringify(found));
  // the card's file: Escape puts it away and the focus goes back to its card; a press on the card opens it again
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await page.click('.entries > .entry:nth-child(2)'); await page.waitForTimeout(500);
  const cardFile = await page.evaluate(() => { const dlg = document.querySelector('dialog.entry-file'), li = document.querySelector('.entries > .entry:nth-child(2)'); return { open: dlg.open, title: dlg.querySelector('.entry-file__title').textContent === li.querySelector('.entry__title').textContent.trim(), paras: dlg.querySelectorAll('.entry-file__more > p').length === li.querySelectorAll('.entry__more > p').length, link: !!dlg.querySelector('.entry-file__go a[href^="#"]'), inCard: getComputedStyle(li.querySelector('.entry__more')).display }; });
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  const after = await page.evaluate(() => ({ open: document.querySelector('dialog.entry-file').open, focus: document.activeElement.className }));
  check(cardFile.open && cardFile.title && cardFile.paras && cardFile.link && cardFile.inCard === 'none' && !after.open && after.focus === 'entry__open', 'T17: a card on the wall shows its year, kind, title and line; pressing it opens its whole file, and Escape returns to the card', JSON.stringify({ cardFile, after }));
  const warned = [];
  page.on('console', m => { if (m.type() === 'warning') warned.push(m.text()); });
  await page.evaluate(() => { window.toggles.archive = 'drawer'; document.documentElement.setAttribute('data-cover', 'table'); });
  await page.waitForTimeout(300);
  const bad = await page.evaluate(() => ({ archive: window.toggles.archive, cover: document.documentElement.dataset.cover }));
  check(bad.archive === 'cards' && bad.cover === 'poster' && warned.length === 2, `a value a toggle does not take is refused, with a note of what it takes (${warned.length} notes)`, JSON.stringify({ bad, warned }));
  await page.evaluate(() => window.toggles.reset());
  const reset = await page.evaluate(() => ({ archive: document.documentElement.dataset.archive, kept: localStorage.getItem('v3:toggles') }));
  check(reset.archive === 'mac' && reset.kept === null && (await view()).mac, 'toggles.reset() brings the Mac back and forgets every toggle', JSON.stringify(reset));
  await page.context().close();
}
{
  // T18: the contact sheet, clean: no stickers, tape or torn end; its words inside the drawn frame, every letter at
  // least 4px from the line, at every size and in each wording; and the collage, as it was, with its frame now clear
  // of the letters too
  const out = [];
  const inside = async (p) => {
    // the letters' ink, from a picture of the words with the frame and anything taped over them hidden
    await p.evaluate(() => document.querySelectorAll('.talk__frame, #contact .sticker, #contact .talk__word > .tape').forEach(e => { e.style.visibility = 'hidden'; }));
    await p.waitForTimeout(100);
    const wb = await p.evaluate(() => { const r = document.querySelector('.talk__word').getBoundingClientRect(); return { x: Math.max(0, Math.floor(r.left - 60)), y: Math.max(0, Math.floor(r.top - 60)), w: Math.ceil(r.width + 120), h: Math.ceil(r.height + 120) }; });
    const png = await p.screenshot({ clip: { x: wb.x, y: wb.y, width: wb.w, height: wb.h } });
    await p.evaluate(() => document.querySelectorAll('.talk__frame, #contact .sticker, #contact .talk__word > .tape').forEach(e => { e.style.visibility = ''; }));
    return p.evaluate(async ([b64, wb]) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = new OffscreenCanvas(img.width, img.height), g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, img.width, img.height).data, k = img.width / wb.w;
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) { const i = (y * img.width + x) * 4, r = d[i], gg = d[i + 1], bb = d[i + 2]; if ((r > 200 && gg > 200 && bb > 200) || (r > 170 && gg < 100 && bb < 100)) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
      const ink = { left: wb.x + x0 / k, right: wb.x + (x1 + 1) / k, top: wb.y + y0 / k, bottom: wb.y + (y1 + 1) / k };
      // the drawn line's inner edge: its points on screen, the innermost of each side
      const path = [...document.querySelectorAll('.talk__frame path')].find(x => x.checkVisibility());
      const ctm = path.getScreenCTM(), L = path.getTotalLength(), pts = [];
      for (let i = 0; i <= 800; i++) { const q = path.getPointAtLength(L * i / 800); pts.push([ctm.a * q.x + ctm.c * q.y + ctm.e, ctm.b * q.x + ctm.d * q.y + ctm.f]); }
      const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]), X0 = Math.min(...xs), X1 = Math.max(...xs), Y0 = Math.min(...ys), Y1 = Math.max(...ys), W = X1 - X0, H = Y1 - Y0;
      const mid = (q, a) => a === 'x' ? q[1] > Y0 + H * .1 && q[1] < Y1 - H * .1 : q[0] > X0 + W * .08 && q[0] < X1 - W * .08;
      const inner = { left: Math.max(...pts.filter(q => q[0] < X0 + W * .25 && mid(q, 'x')).map(q => q[0])), right: Math.min(...pts.filter(q => q[0] > X1 - W * .25 && mid(q, 'x')).map(q => q[0])), top: Math.max(...pts.filter(q => q[1] < Y0 + H * .25 && mid(q, 'y')).map(q => q[1])), bottom: Math.min(...pts.filter(q => q[1] > Y1 - H * .25 && mid(q, 'y')).map(q => q[1])) };
      const half = parseFloat(getComputedStyle(path).strokeWidth) / 2;
      const stickers = [...document.querySelectorAll('#contact .sticker, #contact .talk__word > .tape, #contact .talk__foot .tear')].filter(e => e.checkVisibility()).length;
      return { gap: Math.round((Math.min(ink.left - inner.left, inner.right - ink.right, ink.top - inner.top, inner.bottom - ink.bottom) - half) * 10) / 10, stickers, fs: Math.round(parseFloat(getComputedStyle(document.querySelector('.talk__word')).fontSize)) };
    }, [png.toString('base64'), wb]);
  };
  for (const [w, h] of [[1440, 900], [1280, 720], [1024, 768], [768, 1024], [390, 844], [320, 640]]) {
    for (const words of ['lets-talk', 'get-in-touch', 'say-hello']) {
      const p = await open({ width: w, height: h, touch: w < 900, path: `?toggles=talkWords:${words}#contact` });
      await p.evaluate(() => document.getElementById('contact').scrollIntoView({ behavior: 'instant' }));
      await p.waitForTimeout(1800);
      const m = await inside(p);
      if (!(m.gap >= 4 && m.stickers === 0)) out.push(`${w}x${h} ${words}: ${JSON.stringify(m)}`);
      await p.context().close();
    }
    const c = await open({ width: w, height: h, touch: w < 900, path: '?toggles=talk:collage#contact' });
    await c.evaluate(() => document.getElementById('contact').scrollIntoView({ behavior: 'instant' }));
    await c.waitForTimeout(1800);
    const m = await inside(c);
    if (!(m.gap >= 4)) out.push(`${w}x${h} collage: ${JSON.stringify(m)}`);
    await c.context().close();
  }
  check(out.length === 0, 'T18: the contact sheet is clean (no stickers, tape or torn end) and its words sit inside their frame, 4px or more from the line, at six sizes and in all three wordings; the collage\'s frame clears its letters too', out);
}
{
  // T40: the cover as a desk. Six objects, each a link to its project file, on screen, clear of the name's letters,
  // of each other, the tag, the rail and the hint (the code panel's link lies under the name, as the panel does);
  // on phones a grid of three under the name; pointing at one picks it up; a click opens its file
  const out = [];
  for (const [w, h] of [[1440, 900], [1280, 720], [1280, 800], [1536, 864], [1920, 1080], [1024, 768], [768, 1024], [390, 844], [320, 640]]) {
    const p = await open({ width: w, height: h, touch: w < 900, path: '?toggles=cover:desk' });
    await p.waitForTimeout(900);
    const m = await p.evaluate(() => {
      const box = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
      const meet = (a, b, pad = 0) => a.l < b.r + pad && b.l < a.r + pad && a.t < b.b + pad && b.t < a.b + pad;
      const items = [...document.querySelectorAll('.desk__item')].map(li => { const a = li.querySelector('a'), parts = [...a.children].filter(c => c.checkVisibility()).map(box); return { name: li.className.match(/--(\w+)/)[1], href: a.getAttribute('href'), parts, all: box(a), label: parseFloat(getComputedStyle(li.querySelector('.desk__label')).fontSize) }; });
      const rg = document.createRange(), letters = [];
      for (const w of document.querySelectorAll('.cover__title > .name .w')) { rg.selectNodeContents(w); for (const r of rg.getClientRects()) letters.push({ l: r.left, t: r.top + r.height * .12, r: r.right, b: r.bottom - r.height * .1 }); }
      const others = ['.cover__foot .tag', '.rail', '.cover__hint', '.cover__hand'].map(s => document.querySelector(s)).filter(e => e && e.checkVisibility()).map(box);
      const vw = innerWidth, vh = innerHeight, bad = [];
      for (const it of items) {
        if (it.all.l < 0 || it.all.r > vw || it.all.t < 0 || (vw >= 900 && it.all.b > vh)) bad.push(`${it.name} off screen`);
        if (it.name !== 'research' && it.parts.some(p => letters.some(L => meet(p, L)))) bad.push(`${it.name} on the name`);
        if (it.parts.some(p => others.some(o => meet(p, o, 2)))) bad.push(`${it.name} on the tag, rail, hint or hand line`);
        for (const o of items) if (o !== it && it.name < o.name && it.parts.some(p => o.parts.some(q => meet(p, q)))) bad.push(`${it.name} on ${o.name}`);
        if (it.label < 16) bad.push(`${it.name}'s label at ${it.label}px`);
      }
      return { n: items.length, hrefs: items.map(i => i.href).sort().join(' '), bad, mask: document.querySelector('.cover .sticker--mask').checkVisibility(), wide: document.documentElement.scrollWidth - innerWidth };
    });
    if (m.n !== 6 || m.hrefs !== 'files/aducanumab/ files/genuvalens/ files/hockey/ files/loquar/ files/ocapex/ files/resume/' || m.bad.length || m.mask || m.wide > 0) out.push(`${w}x${h}: ${JSON.stringify(m)}`);
    await p.context().close();
  }
  check(out.length === 0, 'T40: the desk lays six objects, each a link to its file, clear of the name, each other, the tag, the rail and the hint, from 1920x1080 to a 320px phone (labels 16px or more, no sideways scroll)', out);
  const p = await open({ path: '?toggles=cover:desk' });
  await p.waitForTimeout(900);
  const mid = () => p.evaluate(() => { const r = document.querySelector('.desk__item--hockey .desk__obj').getBoundingClientRect(); return (r.top + r.bottom) / 2; });
  const before = await mid();
  await p.hover('.desk__item--hockey a'); await p.waitForTimeout(600);
  const lifted = await mid();
  await p.click('.desk__item--hockey a');
  await p.waitForURL(/files\/hockey\/$/, { timeout: 5000 }).catch(() => {});
  check(lifted < before - 4 && /files\/hockey\/$/.test(p.url()), `T40: pointing at the mask picks it up (${Math.round(before - lifted)}px) and a click opens the hockey file`);
  await p.context().close();
  const poster = await open();
  check(await poster.evaluate(() => !document.querySelector('.desk').checkVisibility() && document.querySelector('.cover .sticker--mask').checkVisibility()), 'T40: the poster (the default) shows no desk');
  await poster.context().close();
}

/* ---------- 7c. the bug audit of 2026-10-05: what it found, held ---------- */
{
  /* the Mac is in the Tab order before its screen comes on: Tab from the record's last link lands in it */
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const page = await open({ width: w, height: h, touch: w < 900 });
    await page.evaluate(() => { const l = [...document.querySelectorAll('#record a')]; l[l.length - 1].focus(); });
    await page.waitForTimeout(500); await page.keyboard.press('Tab'); await page.waitForTimeout(300);
    const r = await page.evaluate(() => ({ mac: !!document.activeElement.closest('.mac'), on: document.querySelector('.mac__screen').classList.contains('is-on') }));
    check(r.mac && r.on, `${w}x${h}: Tab from the record goes into the Mac, which comes on at once`, JSON.stringify(r));
    await page.context().close();
  }
  /* Find on a first visit: the file it opens is the window in front, once the screen has come on */
  {
    const page = await open();
    await page.keyboard.press('/'); await page.waitForTimeout(300); await page.keyboard.type('Gompurkle'); await page.waitForTimeout(500);
    for (let k = 0; k < 6 && await page.evaluate(() => (document.querySelector('.folder.is-out .folder__btn') || {}).hash) !== '#archive'; k++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(120); }
    await page.keyboard.press('Enter'); await page.waitForTimeout(2800);
    const r = await page.evaluate(() => { const w = window.__v3mac.windows; return w.length ? w[w.length - 1].querySelector('.mac__title').textContent : ''; });
    check(/labyrinth/.test(r), `Find on a first visit opens the file in front of the Archive window (${r})`);
    await page.context().close();
  }
  /* Find reads what shows: the hidden desk is not a match, a curly apostrophe or prime is typed straight, and a
     match read only by screen readers rings the sheet's visible title */
  {
    const page = await open();
    const q = async (word) => { await page.fill('#find', word); await page.waitForTimeout(500); return page.evaluate(() => [...document.querySelectorAll('.folder.is-match .folder__btn')].map(a => a.getAttribute('data-sheet-href') || a.getAttribute('href'))); };
    await page.keyboard.press('/'); await page.waitForTimeout(300);
    const resume = await q('resume'), apos = await q("let's"), prime = await q("5'11"), skills = await q('how i work');
    await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
    const ring = await page.evaluate(() => { const e = document.querySelector('.is-found'); return e ? { vis: !!e.getClientRects().length && !e.closest('.sr-only'), cls: e.className } : null; });
    check(!resume.includes('#cover') && apos.includes('#contact') && prime.includes('#hockey') && ring && ring.vis, 'Find reads what shows: no match on the hidden desk, "let\'s" and 5\'11 found, and a screen-reader heading rings something visible', JSON.stringify({ resume, apos, prime, skills, ring }));
    await page.context().close();
  }
  /* a long jump: the sheet it cuts to is shown already read */
  {
    const page = await open();
    const r = await page.evaluate(() => new Promise(res => {
      const mid = document.getElementById('ocapex'); let low = 1;
      document.querySelector('.rail a[href="#hockey"]').click();
      const t0 = performance.now();
      (function f() { if (mid.getBoundingClientRect().top < 60) low = Math.min(low, ...[...mid.querySelectorAll('.r, .hl__in')].map(e => +getComputedStyle(e).opacity)); if (performance.now() - t0 < 300) requestAnimationFrame(f); else res(low); })();
    }));
    check(r === 1, `a long jump shows the sheet it cuts to already read (lowest opacity on it while shown: ${r})`);
    await page.context().close();
  }
  /* print: the research chart's bars keep their colours, the tools are outlined, the clean contact words print at 28pt */
  {
    const page = await open(); await page.emulateMedia({ media: 'print' });
    const r = await page.evaluate(() => ({ bars: getComputedStyle(document.querySelector('.bar')).printColorAdjust, tools: getComputedStyle(document.querySelector('.tools span')).backgroundColor, talk: getComputedStyle(document.querySelector('.talk__word')).fontSize, halo: getComputedStyle(document.querySelector('.route')).textShadow }));
    check(r.bars === 'exact' && /0\)$|transparent/.test(r.tools) && Math.abs(parseFloat(r.talk) - 37.33) < 1 && r.halo === 'none', 'print: the chart\'s bars in colour, the tools outlined, the contact words at 28pt, no halo on the cover\'s words', JSON.stringify(r));
    await page.context().close();
  }
  /* a link with ?toggles= is for that visit only */
  {
    const page = await open({ path: '?toggles=archive:cards' });
    const during = await page.evaluate(() => document.documentElement.dataset.archive);
    await page.goto(new URL('', BASE).href); await page.waitForTimeout(800);
    const after = await page.evaluate(() => ({ archive: document.documentElement.dataset.archive, kept: localStorage.getItem('v3:toggles') }));
    check(during === 'cards' && after.archive === 'mac' && after.kept === null, '?toggles= in a link applies to that visit only', JSON.stringify({ during, after }));
    await page.context().close();
  }
  /* Space on the Index tab opens the index, as on a button; under 360px the pill names only the number */
  {
    const page = await open();
    await page.focus('.index-tab'); await page.keyboard.press(' '); await page.waitForTimeout(400);
    const r = await page.evaluate(() => ({ open: document.getElementById('cabinet').classList.contains('is-open'), y: scrollY, role: document.querySelector('.index-tab').getAttribute('role') }));
    check(r.open && r.y === 0 && r.role === 'button', 'Space on the Index tab opens the index and does not scroll the page', JSON.stringify(r));
    await page.context().close();
    const ph = await open({ width: 320, height: 640, touch: true, path: '#exoskeleton' }); await ph.waitForTimeout(600);
    const pill = await ph.evaluate(() => { const t = document.querySelector('.index-tab'); return { text: t.innerText.replace(/\s+/g, ' ').trim(), w: Math.round(t.getBoundingClientRect().width) }; });
    check(/^Index · \d\d$/i.test(pill.text) && pill.w <= 140, `320px: the pill names only the number ("${pill.text}", ${pill.w}px)`);
    await ph.context().close();
  }
  /* the hockey sheet names the coaches and how to write; the hockey file on a phone reaches the contacts within two screens */
  {
    const page = await open({ path: '#hockey' });
    const r = await page.evaluate(() => ({ coaches: [...document.querySelectorAll('#hockey .coaches dd')].map(d => d.textContent), mail: !!document.querySelector('#hockey a[href^="mailto:"]') }));
    check(r.coaches.length === 3 && r.mail, 'the hockey sheet names its three coaches with their roles, and how to write', JSON.stringify(r));
    await page.context().close();
    const ph = await open({ width: 390, height: 844, touch: true, path: 'files/hockey/' });
    const at = await ph.evaluate(() => document.getElementById('coaches').getBoundingClientRect().top / innerHeight);
    check(at < 2, `phones: the hockey file reaches the coach contacts within two screens (${at.toFixed(2)})`);
    await ph.context().close();
  }
  /* the names beside the rail at 1880px and more, clear of the sheets */
  {
    const page = await open({ width: 1920, height: 1080, path: '#about' });
    const r = await page.evaluate(() => { const a = document.querySelector('.rail a[aria-current="true"]'), cs = getComputedStyle(a, '::after'); return { content: cs.content, weight: cs.fontWeight, size: parseFloat(cs.fontSize) }; });
    check(/About me/.test(r.content) && +r.weight >= 700 && r.size >= 12, 'at 1920px every dot has its sheet\'s name at rest, the current one bold', JSON.stringify(r));
    await page.context().close();
  }
}

/* ---------- 8. console ---------- */
check(errors.length === 0, 'no console errors', errors);

await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exitCode = failures ? 1 : 0;
