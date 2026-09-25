// Frame times stay inside the budget at rest, under a pointer sweep, while changing pages and opening a sheet,
// and the room stops drawing in a hidden tab.
import { open, BASE, check } from './lib.mjs';

const { browser, page } = await open();
await page.goto(BASE + '?nohello', { waitUntil: 'load' });
await page.waitForTimeout(1800);
const sample = (ms) => page.evaluate(ms => new Promise(res => {
  const d = []; let last = performance.now(); const end = last + ms;
  (function f(t) { d.push(t - last); last = t; if (t < end) requestAnimationFrame(f); else { d.sort((a, b) => a - b); res({ med: d[d.length >> 1], p95: d[Math.floor(d.length * .95)], max: d[d.length - 1] }); } })(last);
}), ms);
const fmt = s => `p95 ${s.p95.toFixed(1)} ms, median ${s.med.toFixed(1)}`;

const idle = await sample(3000);
check(idle.p95 < 20, `at rest: ${fmt(idle)}`);

const sweep = sample(3000);
for (let i = 0; i < 60; i++) { await page.mouse.move(200 + i * 18, 300 + Math.sin(i / 6) * 120); await page.waitForTimeout(40); }
const s = await sweep;
check(s.p95 < 20, `pointer sweep: ${fmt(s)}`);

const nav = sample(2000);
await page.click('nav.tabs a[data-tab="work"]');
const n = await nav;
check(n.p95 < 24, `page change: ${fmt(n)}`);

await page.waitForTimeout(600);
const sh = sample(2000);
await page.click('a.card[href$="loquar/"]');
const o = await sh;
check(o.p95 < 24, `opening a sheet: ${fmt(o)}`);

const frames = await page.evaluate(async () => {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
  const f0 = window.__roomFrames; await new Promise(r => setTimeout(r, 800));
  return window.__roomFrames - f0;
});
check(frames === 0, `a hidden tab draws no frames (${frames})`);
await browser.close();
