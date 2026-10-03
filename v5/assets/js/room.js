// The room: one WebGL2 canvas behind everything. Pass 1 draws the scene into a mipmapped texture (so any
// amount of defocus or frost is a texture read); pass 2 composites it with the glass panels and the ink.
import { onFrame } from './frame.js';
import { SCENE, COMPOSITE, VERT } from './shaders.js';

export function createRoom(canvas) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' });
  if (!gl) return null;

  const program = (fs) => {
    const p = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, fs]]) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error('room shader: ' + gl.getShaderInfoLog(sh));
      gl.attachShader(p, sh);
    }
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('room program: ' + gl.getProgramInfoLog(p));
    return p;
  };
  const sceneP = program(SCENE), compP = program(COMPOSITE);
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const uniforms = (p, names) => Object.fromEntries(names.map(n => [n, gl.getUniformLocation(p, n)]));
  const us = uniforms(sceneP, ['uRes', 'uTime', 'uDay', 'uAspect', 'uShift', 'uColor']);
  const uc = uniforms(compP, ['uScene', 'uInk', 'uRes', 'uLod', 'uFrostLod', 'uTime', 'uDay', 'uLight', 'uCount', 'uInv', 'uBox', 'uState', 'uInk0', 'uInkX', 'uPointer', 'uColor', 'uInk1', 'uInkL']);

  const tex = gl.createTexture(), fbo = gl.createFramebuffer(), inkTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, inkTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  let w = 0, h = 0, maxLod = 6;
  let dpr = Math.min(devicePixelRatio || 1, 1.5);
  const st = { defocus: 0, day: 0, shift: [0, 0], light: [innerWidth * .3, -200], panels: { count: 0 }, ink: null, pointer: [-1e4, -1e4], color: [0, 1], fast: 1.5 };

  function size() {
    const nw = Math.max(1, Math.round(innerWidth * dpr)), nh = Math.max(1, Math.round(innerHeight * dpr));
    if (nw === w && nh === h) return;
    w = canvas.width = nw; h = canvas.height = nh;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    maxLod = Math.log2(Math.max(8, .045 * w));          // the hero's defocus: about 4.5% of the width
    st.fast = Math.max(st.fast, .3);
  }

  let frames = 0, counted = 0, acc = 0, slow = false, clock = 0, lost = false, panelSum = 0;
  let drew = false, after = 0, acc1 = 0;                  // both looks time the tick that follows a drawn one; the second, at 1x
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const note = (event, ms) => { api.log.push({ at: Math.round(performance.now()), event, ms: Math.round(ms * 10) / 10 }); };
  window.__roomFrames = 0;
  const off = onFrame((dt) => {
    if (document.hidden || lost) return;
    // budget, first look: over the first 90 frames the room draws, a machine averaging over 22 ms drops to 1x and stops
    // the room's own motion. Each drawn frame is timed by the tick that follows it, which carries its cost (while
    // only the room drifts it draws every other tick, so a drawn tick's own time is the cheap tick before it). Each
    // counts up to 50 ms, so a few long frames while the page loads cannot trip it alone.
    if (drew && counted < 90) {
      counted++; acc += Math.min(dt, .05);
      if (counted === 90 && acc / 90 > .022) { slow = true; note('1x', acc / 90 * 1000); if (dpr > 1) { dpr = 1; w = h = 0; } }
    }
    // budget, second look: once the room has dropped to 1x, the next 30 frames it draws (after 5 to settle) are timed;
    // still under about 27 fps on average (over 37 ms), it gives way to the still, the CSS glass path a lost context
    // takes. A device held to 30 fps to save power (a phone in Low Power Mode, a laptop's energy saver) runs at 33 ms
    // a frame by design, so it keeps the room at 1x rather than losing it a few seconds in.
    if (slow && drew && after < 35) {
      after++;
      if (after > 5) acc1 += Math.min(dt, .1);
      if (after === 35) {
        const avg = acc1 / 30, weak = avg > 1 / 27;
        note(weak ? 'still' : 'kept', avg * 1000);
        if (weak) { giveWay('slow'); return; }
      }
    }
    drew = false;
    if (api.source) api.setPanels(api.source());          // where the glass is now, after this frame's motion
    frames++;
    const idle = st.fast <= 0;
    st.fast -= dt;
    const frozen = slow || still.matches;                 // reduced motion (or a slow machine) stops the room's own drift
    if (!frozen) clock += dt;
    if (idle && (frozen || frames % 2)) return;           // 30 fps when only the room drifts, none when it is still
    size();
    window.__roomFrames++;

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, w, h); gl.useProgram(sceneP);
    gl.uniform2f(us.uRes, w, h); gl.uniform1f(us.uTime, clock + 20); gl.uniform1f(us.uDay, st.day);
    gl.uniform1f(us.uAspect, w / h); gl.uniform2f(us.uShift, st.shift[0], st.shift[1]); gl.uniform2f(us.uColor, st.color[0], st.color[1]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindTexture(gl.TEXTURE_2D, tex); gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, w, h); gl.useProgram(compP);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(uc.uScene, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, inkTex); gl.uniform1i(uc.uInk, 1);
    const ink = st.ink;
    if (ink && ink.dirty) {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ink.canvas);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ink.dirty = false;
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform2f(uc.uRes, w, h);
    gl.uniform1f(uc.uLod, Math.max(0, st.defocus) * maxLod);
    gl.uniform1f(uc.uFrostLod, Math.log2(Math.max(4, 26 * dpr)));
    gl.uniform1f(uc.uTime, clock); gl.uniform1f(uc.uDay, st.day);
    gl.uniform2f(uc.uLight, st.light[0] * dpr, st.light[1] * dpr);
    gl.uniform2f(uc.uPointer, st.pointer[0] * dpr, st.pointer[1] * dpr);
    gl.uniform2f(uc.uColor, st.color[0], st.color[1]);
    const P = st.panels;
    gl.uniform1i(uc.uCount, P.count || 0);
    if (P.count) { gl.uniformMatrix3fv(uc.uInv, true, P.inv); gl.uniform4fv(uc.uBox, P.box); gl.uniform4fv(uc.uState, P.state); }
    gl.uniform4f(uc.uInk0, ink ? ink.on : 0, ink ? (ink.dim || 0) : 0, ink ? (ink.white || 0) : 0, ink ? (ink.px || 24) : 24);
    const x = ink && ink.xform ? ink.xform : [1, 0, 0];
    gl.uniform3f(uc.uInkX, x[0], x[1], x[2]);
    const lean = ink && ink.lean ? ink.lean : [0, 0], hl = ink && ink.light ? ink.light : [0, 0, 1, 0];
    gl.uniform4f(uc.uInk1, ink ? (ink.glow || 0) : 0, lean[0], lean[1], ink ? (ink.fs || 0) : 0);
    gl.uniform4f(uc.uInkL, hl[0], hl[1], hl[2], hl[3]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    drew = true;
  }, 2);                                                   // last in the frame: everything that moves has moved

  // The room stops for good: its context was lost, or it was too slow even at 1x. The page carries on in CSS glass
  // over the still (boot.js), and the context is released so the GPU gets its memory back.
  function giveWay(why) {
    if (lost) return;
    lost = true;
    off();
    if (why !== 'lost') {
      console.info(`v5: the room drew its frames in ${api.log[api.log.length - 1].ms} ms at 1x, so the page uses the still`);
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    }
    api.onlost && api.onlost(why);
  }
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); giveWay('lost'); });

  const api = {
    log: [],                                             // what the budget decided, and when: { at, event, ms }
    get gaveWay() { return lost; },
    get dpr() { return dpr; },
    get lod() { return maxLod; },
    get slow() { return slow; },                         // the budget tripped: 1x, and the room's own motion stopped
    set(o) { Object.assign(st, o); st.fast = Math.max(st.fast, .5); },
    source: null,                                        // () => panels, read each frame just before drawing
    // panels arrive every frame; only a change in them wakes the room to full rate
    setPanels(p) { let sum = p.count; for (let i = 0; i < p.count * 9; i++) sum += p.inv[i] * (i % 7 + 1); for (let i = 0; i < p.count * 4; i++) sum += p.state[i] * 13.7; if (Math.abs(sum - panelSum) > 1e-7) st.fast = Math.max(st.fast, .4); panelSum = sum; st.panels = p; },
    get state() { return st; },
    kick(s = 2) { st.fast = Math.max(st.fast, s); },
    destroy() { off(); },
    onlost: null,
  };
  return api;
}
