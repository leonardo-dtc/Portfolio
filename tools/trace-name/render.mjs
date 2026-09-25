// Step 1: render each word of the name in Sacramento at 640px on a 2000x800 canvas (baseline 590, pen at x 110).
// Needs network access to Google Fonts at development time only; the site itself never loads the font.
// Usage: node tools/trace-name/render.mjs
import { chromium } from '/Users/lcarvalho26/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core/index.mjs';

const work = new URL('./work/', import.meta.url).pathname;
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 2400, height: 1000 } });
await page.setContent(`<!doctype html><html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sacramento&display=block">
<style>html,body{margin:0;background:#000;overflow:hidden}canvas{display:block}</style></head><body><canvas id="c" width="2000" height="800"></canvas></body></html>`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.load('640px Sacramento'));
for (const word of ['leonardo', 'carvalho']) {
  const m = await page.evaluate((word) => {
    const c = document.getElementById('c'), g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
    g.font = '640px Sacramento'; g.fillStyle = '#fff'; g.textBaseline = 'alphabetic';
    g.fillText(word, 110, 590);
    return { xh: g.measureText('x').actualBoundingBoxAscent, width: g.measureText(word).width, space: g.measureText(' ').width };
  }, word);
  await page.locator('#c').screenshot({ path: work + word + '.png' });
  console.log(word, m);
}
await browser.close();
