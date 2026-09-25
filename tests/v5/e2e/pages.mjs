// Every page loads, carries noindex and an h1, has no sideways overflow, no console errors, no third-party requests.
// Usage: node tests/v5/e2e/pages.mjs [comma-separated paths; "," means home only]
import { open, BASE, PAGES, check } from './lib.mjs';

const only = process.argv[2] ? process.argv[2].split(',').filter((p, i, a) => a.indexOf(p) === i) : PAGES;
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const { browser, page, errors, foreign } = await open({ width: w, height: h });
  for (const p of only) {
    const res = await page.goto(BASE + p + (p.includes('?') ? '' : '?nohello'), { waitUntil: 'load' });
    check(res.status() === 200, `${w} ${p || 'home'} loads`);
    check(await page.locator('meta[name="robots"][content="noindex"]').count() === 1, `${w} ${p || 'home'} noindex`);
    check(await page.locator('h1').count() >= 1, `${w} ${p || 'home'} has an h1`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    check(!overflow, `${w} ${p || 'home'} no sideways overflow`);
  }
  await page.waitForTimeout(400);
  check(errors.length === 0, `${w} no console errors ${errors.join(' | ')}`);
  check(foreign.length === 0, `${w} no third-party requests ${foreign.join(' ')}`);
  await browser.close();
}
