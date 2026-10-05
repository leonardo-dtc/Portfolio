// The color style control (bottom right): palettes, a hue and vibrance to play with, and Night, Day or Auto.
// It turns the whole room (and so every pane of glass) and gives the hero's name its neon (palette.js); the few pieces
// of CSS glass follow through --glass-css, the hero's apps through --style, and the CSS hero's neon through --neon-*.
// The choice is kept in this browser only.
import { createSpring, tween } from './springs.js';
import { PRESETS, turn, neonFor } from './palette.js';

const DEFAULT = { preset: 'cobalt', hue: 0, sat: 1, look: 'auto' };
const KEY = 'v5:color';
// the CSS hero's colours (site.css, --neon-*), from the neon's slots (palette.js); its day pool is the deep colour at
// two thirds (for Cobalt the violet-blue the CSS hero was drawn with)
const CSS_NEON = [['orange', 0], ['pink', 1], ['violet', 3], ['blue', 4], ['cyan', 5], ['amber', 7], ['deep', 12, .67]];

const css = (c, a = 1) => { const v = c.map(x => Math.round(Math.min(1, Math.max(0, x)) * 255)).join(','); return a === 1 ? `rgb(${v})` : `rgba(${v},${a})`; };
const swatch = (deg, k) => `radial-gradient(circle at 32% 28%, ${css(turn([.46, .56, 1], deg, k))}, ${css(turn([.10, .22, .80], deg, k))} 48%, ${css(turn([.02, .04, .26], deg, k))})`;

export function initHue({ room }) {
  const html = document.documentElement;
  const light = matchMedia('(prefers-color-scheme: light)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let st = { ...DEFAULT };
  try { st = { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) { /* storage blocked: defaults */ }
  // a palette kept from an earlier visit takes its values as they are now (its hue may have been tuned since)
  const kept = PRESETS.find(p => p[0] === st.preset);
  if (kept) st = { ...st, hue: kept[2], sat: kept[3] };

  // ---------- markup ----------
  const wrap = document.createElement('div');
  wrap.className = 'hue';
  const track = Array.from({ length: 13 }, (_, n) => css(turn([.10, .22, .80], -180 + n * 30, 1))).join(', ');
  // the swatches fill their rows: four across, or three when four would leave one alone (nine of them)
  const across = PRESETS.length % 4 && !(PRESETS.length % 3) ? 3 : 4;
  wrap.innerHTML = `
    <div class="hue__panel" id="hue-panel" role="dialog" aria-label="Color style" hidden>
      <div class="hue__head"><h2>Color</h2><button class="hue__reset" type="button">Reset</button></div>
      <div class="hue__swatches" role="radiogroup" aria-label="Palette" style="--across: ${across}">
        ${PRESETS.map(([id, label, d, k]) => `<button type="button" role="radio" aria-checked="false" data-preset="${id}"><i style="background:${swatch(d, k)}"></i><span>${label}</span></button>`).join('')}
      </div>
      <label class="hue__range"><span>Hue</span><input type="range" min="-180" max="180" step="1" data-k="hue" style="--track: linear-gradient(90deg, ${track})"><output></output></label>
      <label class="hue__range"><span>Vibrance</span><input type="range" min="0" max="150" step="1" data-k="sat"><output></output></label>
      <div class="hue__seg" role="radiogroup" aria-label="Appearance">
        <button type="button" role="radio" data-look="auto">Auto</button><button type="button" role="radio" data-look="night">Night</button><button type="button" role="radio" data-look="day">Day</button>
      </div>
    </div>
    <button class="hue__button" type="button" aria-expanded="false" aria-controls="hue-panel" aria-label="Color style"><i></i></button>`;
  document.body.append(wrap);
  const panel = wrap.querySelector('.hue__panel'), button = wrap.querySelector('.hue__button');
  const range = k => wrap.querySelector(`input[data-k="${k}"]`);

  // ---------- applying ----------
  const hue = createSpring({ value: st.hue, response: .55, damping: 1 });
  const sat = createSpring({ value: st.sat, response: .55, damping: 1 });
  const day = createSpring({ value: 0, response: .7, damping: 1 });
  const isDay = () => st.look === 'day' || (st.look === 'auto' && light.matches);
  function paint() {
    const h = hue.value, k = Math.max(0, sat.value), d = Math.min(1, Math.max(0, day.value));
    const neon = neonFor(h, k);
    if (room) room.set({ color: [h * Math.PI / 180, k], day: d, neon: neon.list, arc: neon.arc });
    const base = d > .5 ? [.10, .16, .52] : [.16, .22, .77];
    html.style.setProperty('--glass-css', css(turn(base, h, k), d > .5 ? .5 : .34));
    // the style's own colour, solid: the hero's apps are drawn in it (site.css, --style)
    html.style.setProperty('--style', css(turn([.22, .40, 1], h, k)));
    // the hero's neon (its CSS version), the same colours as the shader's
    for (const [n, i, f = 1] of CSS_NEON) html.style.setProperty(`--neon-${n}`, css(neon.set[i].map(v => v * f)));
    button.querySelector('i').style.background = swatch(h, k);
  }
  function apply(animate) {
    html.dataset.appearance = st.look;
    const to = { hue: st.hue, sat: st.sat, day: isDay() ? 1 : 0 };
    if (!animate || reduced.matches) { hue.snap(to.hue); sat.snap(to.sat); day.snap(to.day); paint(); }
    else {
      // the hue is an angle: turn the short way round (Gold to Emerald is 102°, not a sweep through every colour)
      hue.value += 360 * Math.round((to.hue - hue.value) / 360);
      tween(hue, to.hue, paint); tween(sat, to.sat, paint); tween(day, to.day, paint);
    }
    wrap.querySelectorAll('[data-preset]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.preset === st.preset)));
    wrap.querySelectorAll('[data-look]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.look === st.look)));
    // each radio group is one stop for Tab (its checked radio, or its first while a custom colour is set)
    wrap.querySelectorAll('[role="radiogroup"]').forEach(g => { const rs = [...g.querySelectorAll('[role="radio"]')], on = rs.find(r => r.getAttribute('aria-checked') === 'true') || rs[0]; rs.forEach(r => { r.tabIndex = r === on ? 0 : -1; }); });
    range('hue').value = st.hue; range('sat').value = Math.round(st.sat * 100);
    range('hue').nextElementSibling.textContent = `${st.hue > 0 ? '+' : ''}${Math.round(st.hue)}°`;
    range('sat').nextElementSibling.textContent = `${Math.round(st.sat * 100)}%`;
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* not kept */ }
  }
  apply(false);
  light.addEventListener('change', () => apply(true));

  // ---------- using it ----------
  const isOpen = () => !panel.hidden;
  function open() {
    panel.hidden = false; button.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => panel.classList.add('is-open'));
    const cur = wrap.querySelector('[data-preset][aria-checked="true"]') || wrap.querySelector('[data-preset]');
    cur.focus({ preventScroll: true });
  }
  function close(refocus) {
    panel.classList.remove('is-open'); button.setAttribute('aria-expanded', 'false');
    setTimeout(() => { if (!panel.classList.contains('is-open')) panel.hidden = true; }, reduced.matches ? 0 : 200);
    if (refocus) button.focus({ preventScroll: true });
  }
  button.addEventListener('click', () => (isOpen() ? close(false) : open()));
  wrap.addEventListener('click', (e) => {
    const p = e.target.closest('[data-preset]'), l = e.target.closest('[data-look]');
    if (p) { const [, , d, k] = PRESETS.find(x => x[0] === p.dataset.preset); st = { ...st, preset: p.dataset.preset, hue: d, sat: k }; apply(true); }
    else if (l) { st = { ...st, look: l.dataset.look }; apply(true); }
    else if (e.target.closest('.hue__reset')) { st = { ...DEFAULT }; apply(true); }
  });
  wrap.addEventListener('input', (e) => {
    const k = e.target.dataset.k; if (!k) return;
    st = { ...st, preset: 'custom', [k]: k === 'sat' ? +e.target.value / 100 : +e.target.value };
    apply(false);
  });
  // Escape closes the panel before anything else hears it (an open sheet stays open); a click elsewhere closes it
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) { e.stopPropagation(); e.preventDefault(); close(true); } }, true);
  document.addEventListener('pointerdown', (e) => { if (isOpen() && !wrap.contains(e.target) && !button.contains(e.target)) close(false); });
  // and so does focus arriving anywhere else (Tab past the panel either way, or back into the page from the browser's
  // own controls), so it never stays open over what the keyboard has moved on to; the window losing focus leaves it
  const ours = el => !!el && (wrap.contains(el) || button.contains(el));
  document.addEventListener('focusin', (e) => { if (isOpen() && !ours(e.target)) close(false); });

  // Under 360px five labelled tabs fill the dock, so the button joins the front window's toolbar (its actions, inline
  // at the foot of the page or sheet; on Work, its filters) and the panel opens above the dock. During the hero it
  // waits in the corner as before.
  const narrow = matchMedia('(max-width: 359px)');
  function place() {
    const front = document.querySelector('section.sheet:not(.is-closing)') || document.getElementById('main');
    const bar = narrow.matches && !html.matches('.is-hello, .is-entering') && front && (front.querySelector('.toolbar--inline:not(.filters)') || front.querySelector('.toolbar--inline'));
    wrap.classList.toggle('hue--toolbar', !!bar);
    const home = bar || wrap;
    if (button.parentElement === home) return;
    if (isOpen()) close(false);
    home.append(button);
  }
  narrow.addEventListener('change', place);
  document.addEventListener('v5:navigate', place);
  new MutationObserver(place).observe(html, { attributes: true, attributeFilter: ['class'] });   // the hero leaving
  place();
  // arrow keys move through a radio group and choose as they go (the swatches are a grid, so Up and Down go a row)
  wrap.querySelectorAll('[role="radiogroup"]').forEach(g => g.addEventListener('keydown', (e) => {
    const all = [...g.querySelectorAll('[role="radio"]')], i = all.indexOf(document.activeElement), row = g.matches('.hue__swatches') ? across : 1;
    const step = { ArrowRight: 1, ArrowDown: row, ArrowLeft: -1, ArrowUp: -row }[e.key];
    if (i < 0 || step === undefined) return;
    e.preventDefault(); const next = all[(i + step + all.length) % all.length]; next.focus(); next.click();
  }));

  return { get state() { return { ...st }; }, open, close };
}
