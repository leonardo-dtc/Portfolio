// Screenshots of every page at five sizes, plus the hello, for review. Usage: node tests/v5/e2e/capture.mjs [page,…]
import { open, BASE, PAGES, check } from './lib.mjs';
import { mkdirSync } from 'node:fs';

const OUT = new URL('../../../.impeccable/review/v5/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const want = process.argv[2] ? process.argv[2].split(',') : PAGES.map(p => p || 'home');
for (const [w, h] of [[1440, 900], [1280, 800], [1024, 768], [768, 1024], [390, 844]]) {
  const { browser, page } = await open({ width: w, height: h });
  for (const name of want) {
    const p = name === 'home' ? '' : name;
    await page.goto(BASE + p + (p ? '' : '?nohello'), { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}${name.replace(/\/$/, '').replace(/\//g, '-') || 'home'}-${w}.png` });
  }
  if (want.includes('home')) {
    await page.goto(BASE, { waitUntil: 'load' });
    await page.evaluate(() => sessionStorage.clear());
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}hello-mid-${w}.png` });
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${OUT}hello-done-${w}.png` });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}enter-${w}.png` });
  }
  await browser.close();
}
check(true, `captures written to ${OUT}`);
