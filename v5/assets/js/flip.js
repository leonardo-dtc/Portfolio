// GSAP, self-hosted (assets/vendor/gsap: GSAP 3.15.0 and its Flip plugin, under GreenSock's standard no-charge
// licence), for the one motion the springs do not cover: a grid that reflows. Filtering Work used to make the cards
// jump to their new places (and the grid from four across to three); now the cards that stay glide there and take
// their new size on the site's own spring (critically damped, a response of half a second), what follows the grid
// slides with them, those that leave fade out where they were and those that arrive fade in. The library loads only
// where there is a grid to filter, once the page is idle; until it has (or if it cannot), and under reduced motion,
// the grid changes at once, as it did.
const VENDOR = new URL('../vendor/gsap/', import.meta.url).href;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let ready = null;

const script = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.append(s); });
export function loadFlip() {
  if (!ready) ready = script(VENDOR + 'gsap.min.js').then(() => script(VENDOR + 'Flip.min.js'))
    .then(() => { window.gsap.registerPlugin(window.Flip); return true; }, () => false);
  return ready;
}
// when the page has a grid to filter, load it while the page is idle
export function prepareFlip() {
  if (!document.querySelector('[data-cards] .card[data-cat]') || !document.querySelector('[data-filter]')) return;
  (window.requestIdleCallback || (f => setTimeout(f, 300)))(() => loadFlip());
}

// the site's spring as an ease (springs.js): critically damped, a response of .5 s, over a move of d seconds
const spring = d => { const w = 2 * Math.PI / .5 * d; return t => (t >= 1 ? 1 : 1 - (1 + w * t) * Math.exp(-w * t)); };
const T = .6;

// Change the grid (change: a function that hides, shows and re-columns the cards) and move everything given (the
// cards, and what follows the grid, which only slides) from where it was to where it is now. A change while one is
// still moving first finishes it (Flip's way), then moves on from there.
export function reflow(els, change) {
  const { gsap, Flip } = window;
  if (!gsap || !Flip || reduced.matches) { change(); return; }
  const state = Flip.getState(els);
  change();
  Flip.from(state, {
    // sizes change as sizes, not as a scale, so a card's text is laid out afresh at every step and never stretched
    // (with scale, Flip also held the cards that stay at their old size to the end, and then they jumped)
    duration: T, ease: spring(T), absoluteOnLeave: true,
    onEnter: items => gsap.fromTo(items, { opacity: 0 }, { opacity: 1, duration: .4, ease: spring(.4), delay: .12 }),
    onLeave: items => gsap.to(items, { opacity: 0, duration: .16, ease: 'power1.in' }),
    onComplete: () => gsap.set(els, { clearProps: 'transform,opacity' }),
  });
}
