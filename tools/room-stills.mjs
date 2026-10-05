// Render the v5 room shader to two WebP stills (Night and Day): the CSS background under the canvas,
// shown before WebGL starts, without WebGL, and with scripts off. The Day still also gets a soft copy, the room as the
// hero shows it (defocused, as room.js draws it then: about 4.5% of the width), for the CSS hero by day, so the room
// does not go from sharp to soft when WebGL takes over.
// Usage: node tools/room-stills.mjs   (needs the preview server on 8778)
import { chromium } from '/Users/lcarvalho26/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core/index.mjs';
import { writeFileSync } from 'node:fs';

const out = new URL('../v5/assets/img/', import.meta.url).pathname;
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 400, height: 300 } });
await page.goto('http://127.0.0.1:8778/v5/assets/js/shaders.js');   // any same-origin page will do
for (const [name, day] of [['room-night', 0], ['room-day', 1]]) {
  const url = await page.evaluate(async (day) => {
    const { SCENE, VERT } = await import('/v5/assets/js/shaders.js');
    const c = document.createElement('canvas'); c.width = 1920; c.height = 1080;
    const gl = c.getContext('webgl2', { preserveDrawingBuffer: true });
    const p = gl.createProgram();
    for (const [t, s] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, SCENE]]) { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); gl.attachShader(p, sh); }
    gl.linkProgram(p); gl.useProgram(p);
    gl.bindVertexArray(gl.createVertexArray()); gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const u = n => gl.getUniformLocation(p, n);
    gl.viewport(0, 0, 1920, 1080);
    gl.uniform2f(u('uRes'), 1920, 1080); gl.uniform1f(u('uTime'), 32); gl.uniform1f(u('uDay'), day);
    gl.uniform1f(u('uAspect'), 1920 / 1080); gl.uniform2f(u('uShift'), 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return c.toDataURL('image/webp', .86);
  }, day);
  const buf = Buffer.from(url.split(',')[1], 'base64');
  writeFileSync(out + name + '.webp', buf);
  writeFileSync(out + name + '.webp.json', JSON.stringify({ source: 'tools/room-stills.mjs', note: 'rendered from the v5 room shader; no photograph', size: [1920, 1080], day }, null, 2) + '\n');
  console.log(name, buf.length, 'bytes');
  if (day) {
    const soft = Buffer.from((await page.evaluate(soften, url)).split(',')[1], 'base64');
    writeFileSync(out + 'room-day-soft.webp', soft);
    writeFileSync(out + 'room-day-soft.webp.json', JSON.stringify({ source: 'tools/room-stills.mjs', note: 'room-day.webp, defocused as the hero shows the room; no photograph', size: [480, 270], day }, null, 2) + '\n');
    console.log('room-day-soft', soft.length, 'bytes');
  }
}
await browser.close();

// the still, softened: a quarter of its size with a Gaussian blur of 8px there (34px at full size, about the room's
// defocus), its edges held as WebGL clamps them rather than fading to nothing
async function soften(src) {
  const img = new Image(); img.src = src; await img.decode();
  const W = 480, H = 270, P = 32, big = document.createElement('canvas');
  big.width = W + 2 * P; big.height = H + 2 * P;
  const g = big.getContext('2d');
  g.drawImage(img, P, P, W, H);
  const sw = img.width / W, sh = img.height / H;
  g.drawImage(img, 0, 0, sw, img.height, 0, P, P, H); g.drawImage(img, img.width - sw, 0, sw, img.height, P + W, P, P, H);
  g.drawImage(big, P, P, W, 1, P, 0, W, P); g.drawImage(big, P, P + H - 1, W, 1, P, P + H, W, P);
  for (const [x, y] of [[0, 0], [P + W, 0], [0, P + H], [P + W, P + H]]) g.drawImage(big, x ? P + W - 1 : P, y ? P + H - 1 : P, 1, 1, x, y, P, P);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const cx = c.getContext('2d'); cx.filter = 'blur(8px)'; cx.drawImage(big, -P, -P);
  return c.toDataURL('image/webp', .8);
}
