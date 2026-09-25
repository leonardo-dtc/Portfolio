// The color style control (bottom right): palettes, a hue and vibrance to play with, and Night, Day or Auto.
// It turns the whole room (and so every pane of glass, the written name and the Enter button) in the shader;
// the few pieces of CSS glass follow through --glass-css. The choice is kept in this browser only.
import { createSpring, tween } from './springs.js';

const PRESETS = [
  ['cobalt', 'Cobalt', 0, 1], ['violet', 'Violet', 40, 1], ['rose', 'Rose', 110, .95], ['ember', 'Ember', 150, 1],
  ['gold', 'Gold', 178, .95], ['emerald', 'Emerald', -80, .9], ['teal', 'Teal', -45, 1], ['graphite', 'Graphite', 0, .12],
];
const DEFAULT = { preset: 'cobalt', hue: 0, sat: 1, look: 'auto' };
const KEY = 'v5:color';

// the same YIQ turn as the shader, for swatches and CSS glass
function turn([r, g, b], deg, k) {
  const y = .299 * r + .587 * g + .114 * b, i = .596 * r - .274 * g - .322 * b, q = .211 * r - .523 * g + .312 * b;
  const h = Math.atan2(q, i) - deg * Math.PI / 180, c = Math.hypot(i, q) * k;
  const I = c * Math.cos(h), Q = c * Math.sin(h);
  return [y + .956 * I + .621 * Q, y - .272 * I - .647 * Q, y - 1.106 * I + 1.703 * Q].map(v => Math.round(Math.min(1, Math.max(0, v)) * 255));
}
const rgb = (c, a = 1) => a === 1 ? `rgb(${c.join(',')})` : `rgba(${c.join(',')},${a})`;
const swatch = (deg, k) => `radial-gradient(circle at 32% 28%, ${rgb(turn([.46, .56, 1], deg, k))}, ${rgb(turn([.10, .22, .80], deg, k))} 48%, ${rgb(turn([.02, .04, .26], deg, k))})`;

export function initHue({ room }) {
  const html = document.documentElement;
  const light = matchMedia('(prefers-color-scheme: light)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let st = { ...DEFAULT };
  try { st = { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) { /* storage blocked: defaults */ }

  // ---------- markup ----------
  const wrap = document.createElement('div');
  wrap.className = 'hue';
  const track = Array.from({ length: 13 }, (_, n) => rgb(turn([.10, .22, .80], -180 + n * 30, 1))).join(', ');
  wrap.innerHTML = `
    <div class="hue__panel" id="hue-panel" role="dialog" aria-label="Color style" hidden>
      <div class="hue__head"><h2>Color</h2><button class="hue__reset" type="button">Reset</button></div>
      <div class="hue__swatches" role="radiogroup" aria-label="Palette">
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
    if (room) room.set({ color: [h * Math.PI / 180, k], day: d });
    const base = d > .5 ? [.10, .16, .52] : [.16, .22, .77];
    html.style.setProperty('--glass-css', rgb(turn(base, h, k), d > .5 ? .5 : .34));
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
  document.addEventListener('pointerdown', (e) => { if (isOpen() && !wrap.contains(e.target)) close(false); });
  // arrow keys move through a radio group and choose as they go (the swatches are a grid of four across)
  wrap.querySelectorAll('[role="radiogroup"]').forEach(g => g.addEventListener('keydown', (e) => {
    const all = [...g.querySelectorAll('[role="radio"]')], i = all.indexOf(document.activeElement), across = g.matches('.hue__swatches') ? 4 : 1;
    const step = { ArrowRight: 1, ArrowDown: across, ArrowLeft: -1, ArrowUp: -across }[e.key];
    if (i < 0 || step === undefined) return;
    e.preventDefault(); const next = all[(i + step + all.length) % all.length]; next.focus(); next.click();
  }));

  return { get state() { return { ...st }; }, open, close };
}
