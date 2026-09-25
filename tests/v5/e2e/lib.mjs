// Shared helpers for the v5 browser checks (playwright-core with the installed Chrome).
import { chromium } from '/Users/lcarvalho26/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core/index.mjs';

export const BASE = process.env.V5_BASE || 'http://127.0.0.1:8778/v5/';
export const PAGES = ['', 'work/', 'hockey/', 'about/', 'resume/', 'work/aducanumab/', 'work/genuvalens/', 'work/loquar/', 'work/daedalus/', 'work/ocapex/', 'work/freecode/', 'work/this-site/'];

export async function open({ width = 1440, height = 900, js = true, reduced = false, scheme = 'dark' } = {}) {
  const browser = await chromium.launch({ channel: 'chrome' });
  const ctx = await browser.newContext({ viewport: { width, height }, javaScriptEnabled: js, reducedMotion: reduced ? 'reduce' : 'no-preference', colorScheme: scheme });
  const page = await ctx.newPage();
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
