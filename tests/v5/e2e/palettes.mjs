// Every colour style (palette.js), each by night and by day. The hero's name takes the style's own neon: with the room,
// by night, at least 90% of its lit pixels (bright and saturated, as neon.mjs counts them) lie within 75 degrees of
// OKLCH hue of the style's glass, and Graphite's light is silver (most of its bright pixels nearly grey); Cobalt's
// Glowtime colours are neon.mjs's to check. The ground round the letters and the stage stay near black. On Home, and
// in the open colour panel, every line of text over glass keeps 4.5:1 against what is behind it. Without the room, by
// day, the CSS hero's edge and faces keep 3:1 or more against its pool, which takes the style's deep colour.
import { open, BASE, check } from './lib.mjs';
import { measure, ringContrast } from './measure.mjs';
import { PRESETS, turn, lab } from '../../../v5/assets/js/palette.js';

const hueOf = c => { const [, a, b] = lab(c); return (Math.atan2(b, a) * 180 / Math.PI + 360) % 360; };
const keep = (page, preset) => page.addInitScript(v => { try { localStorage.setItem('v5:color', v); } catch (e) { /* none */ } }, JSON.stringify({ preset, look: 'auto' }));
const lit = async page => {
  await page.waitForFunction(() => document.querySelector('.hero.is-ready'), null, { timeout: 8000 });
  await page.waitForFunction(() => window.__hero.ink.on >= 1, null, { timeout: 8000 });
  const f0 = await page.evaluate(() => window.__roomFrames);
  await page.evaluate(() => window.__room.kick(1));
  await page.waitForFunction(f0 => window.__roomFrames >= f0 + 2, f0, { timeout: 8000 });
};
const TEXT = '#main p, #main li, #main h2, #main h3, #main dt, #main dd, .side p, .side li, .toolbar .btn, .hue__panel h2, .hue__panel span, .hue__panel output, .hue__panel button';
async function texts(page) {
  const boxes = await page.$$eval(TEXT, els => els.map(e => {
    const r = e.getBoundingClientRect(), cs = getComputedStyle(e), c = cs.color.match(/[\d.]+/g).map(Number);
    const own = e.childElementCount === 0 || [...e.childNodes].some(n => n.nodeType === 3 && n.data.trim());
    return { x: r.left, y: r.top, w: r.width, h: r.height, c, t: e.textContent.trim().slice(0, 28), own, bg: cs.backgroundColor, on: e.closest('.hue__panel') ? 'panel' : 'glass', behind: !!e.closest('.is-behind') };
  }).filter(b => b.own && b.w > 12 && b.h > 8 && b.y > 30 && b.t && b.bg === 'rgba(0, 0, 0, 0)' && !b.behind && (b.on === 'panel' || b.y + b.h < innerHeight - 90)));
  const ratios = await ringContrast(page, boxes);
  return boxes.map((b, i) => ({ ...b, ratio: ratios[i] }));
}

// PALETTES=rose,teal checks only those
const only = (process.env.PALETTES || '').split(',').filter(Boolean);
for (const [id, label, deg, k] of PRESETS.filter(p => !only.length || only.includes(p[0]))) {
  const glassHue = hueOf(turn([.15, .20, .90], deg, k));
  // the hero, with the room, by night: the still (reduced motion), one moment of the light
  {
    const { browser, page, errors } = await open({ reduced: true });
    await keep(page, id);
    await page.goto(BASE, { waitUntil: 'load' });
    if (await page.evaluate(() => document.documentElement.classList.contains('gl'))) {
      await lit(page);
      const s = await measure(page, { stage: true });
      if (id === 'graphite') check(s.grey >= .8 * s.bright, `${label}: the name's light is silver (${Math.round(100 * s.grey / Math.max(1, s.bright))}% of its bright pixels nearly grey)`);
      else if (id !== 'cobalt') {
        let near = 0; s.oh.forEach((n, b) => { const d = Math.abs(((b * 10 + 5 - glassHue + 540) % 360) - 180); if (d <= 75) near += n; });
        const top = s.oh.map((n, b) => [n, b * 10]).sort((x, y) => y[0] - x[0]).slice(0, 3).map(([n, h]) => `${h}-${h + 10} ${Math.round(100 * n / s.lit)}%`).join(', ');
        check(s.lit > 500 && near >= .9 * s.lit, `${label}: the name's light is the style's own, ${Math.round(100 * near / Math.max(1, s.lit))}% within 75 degrees of its glass (hue ${glassHue.toFixed(0)}; most at ${top})`);
      }
      check(s.ground < .03 && s.outside <= .03, `${label}: the ground and the stage stay near black (${s.ground.toFixed(3)}, ${s.outside.toFixed(4)})`);
    } else console.log('skip: no WebGL2 here');
    check(errors.length === 0, `${label}: no console errors ` + errors.join(' | '));
    await browser.close();
  }
  // Home, by night and by day, with the colour panel open
  for (const scheme of ['dark', 'light']) {
    const { browser, page, errors } = await open({ scheme, reduced: true });
    await keep(page, id);
    await page.goto(BASE + '?nohello', { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    await page.click('.hue__button');
    await page.waitForTimeout(500);
    const all = await texts(page), low = all.filter(b => b.ratio < 4.5);
    const min = all.reduce((m, b) => b.ratio < m.ratio ? b : m, { ratio: 99 });
    check(all.some(b => b.on === 'panel') && low.length === 0, `${label}, ${scheme === 'dark' ? 'night' : 'day'}: ${all.length} lines of text over glass at 4.5:1 or more (lowest ${min.ratio.toFixed(2)}:1, “${min.t}”)${low.map(b => ` | “${b.t}” ${b.ratio.toFixed(2)}:1`).join('')}`);
    check(errors.length === 0, `${label}: no console errors ` + errors.join(' | '));
    await browser.close();
  }
  // without the room, by day: the CSS hero on the style's deep pool
  {
    const { browser, page } = await open({ noGL: true, scheme: 'light', reduced: true });
    await keep(page, id);
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForFunction(() => document.querySelector('.hero.is-ready'), null, { timeout: 8000 });
    await page.waitForTimeout(1600);
    const s = await measure(page);
    check(s.parts.every(q => q.edge >= 3 && q.pool >= 3), `${label}, no WebGL, day: the edge and the faces against the pool ${s.parts.map(q => `${q.ch} ${q.edge.toFixed(1)}/${q.pool.toFixed(1)}:1`).join(', ')}`);
    await browser.close();
  }
}
