// Shared helpers for the v5 browser checks (playwright-core with the installed Chrome).
// Elsewhere, point them at another copy and browser through the environment:
//   PLAYWRIGHT_MODULE  the playwright or playwright-core entry (index.mjs) to import
//   PW_CHANNEL         the browser channel ('chrome' by default; empty for Playwright's bundled Chromium)
//   PW_ARGS            extra launch arguments, space separated (for example the swiftshader flags for WebGL
//                      on a machine without a GPU: --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader)
//   V5_SLOW            stretches every wait and timeout by this factor, for software rendering, where a frame can
//                      take a second; the checks that measure time or frame rate are then not meaningful
const MODULE = process.env.PLAYWRIGHT_MODULE || '/Users/lcarvalho26/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core/index.mjs';
const { chromium } = await import(MODULE);
const CHANNEL = process.env.PW_CHANNEL ?? 'chrome';
const ARGS = (process.env.PW_ARGS || '').split(/\s+/).filter(Boolean);
const SLOW = Math.max(1, +process.env.V5_SLOW || 1);
function stretch(page) {
  page.setDefaultTimeout(30000 * SLOW);
  const wait = page.waitForTimeout.bind(page);
  page.waitForTimeout = ms => wait(ms * SLOW);
  const scaled = (fn, at) => (...a) => { if (a[at] && a[at].timeout) a[at] = { ...a[at], timeout: a[at].timeout * SLOW }; return fn(...a); };
  page.waitForSelector = scaled(page.waitForSelector.bind(page), 1);
  page.waitForURL = scaled(page.waitForURL.bind(page), 1);
  page.waitForFunction = scaled(page.waitForFunction.bind(page), 2);
}

export const BASE = process.env.V5_BASE || 'http://127.0.0.1:8778/v5/';
export const PAGES = ['', 'work/', 'hockey/', 'about/', 'resume/', 'work/aducanumab/', 'work/genuvalens/', 'work/loquar/', 'work/daedalus/', 'work/ocapex/', 'work/freecode/', 'work/this-site/'];

export async function open({ width = 1440, height = 900, js = true, reduced = false, scheme = 'dark', args = [] } = {}) {
  const browser = await chromium.launch({ ...(CHANNEL ? { channel: CHANNEL } : {}), args: [...ARGS, ...args] });
  const ctx = await browser.newContext({ viewport: { width, height }, javaScriptEnabled: js, reducedMotion: reduced ? 'reduce' : 'no-preference', colorScheme: scheme });
  const page = await ctx.newPage();
  if (SLOW > 1) stretch(page);
  const errors = [], foreign = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('request', r => { const u = new URL(r.url()); if (!['127.0.0.1', 'localhost'].includes(u.hostname) && !u.protocol.startsWith('data')) foreign.push(r.url()); });
  return { browser, page, errors, foreign };
}

export function check(cond, msg) {
  if (!cond) { console.error('FAIL ' + msg); process.exitCode = 1; }
  else console.log('ok   ' + msg);
}
