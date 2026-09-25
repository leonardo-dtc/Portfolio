// Render the v5 room shader to two WebP stills (Night and Day): the CSS background under the canvas,
// shown before WebGL starts, without WebGL, and with scripts off.
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
}
await browser.close();
