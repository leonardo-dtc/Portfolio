// GLSL for the room. SCENE draws the room into a mipmapped texture; COMPOSITE puts it on screen with
// every glass panel and the written name.

export const VERT = `#version 300 es
layout(location = 0) in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

// The room: Apple's Liquid Glass wallpaper language (the macOS Tahoe glass wave over out-of-focus forms), cobalt.
// uDay 0 is Night, 1 is Day. uShift moves the room a little against the pointer.
export const SCENE = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform float uDay; uniform float uAspect; uniform vec2 uShift; uniform vec2 uColor;
out vec4 o;
// the color style: a hue rotation (radians) and a saturation scale in YIQ, which keeps each colour's brightness
vec3 hueShift(vec3 c, float a, float k) {
  vec3 yiq = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312) * c;
  float h = atan(yiq.z, yiq.y) - a, r = length(yiq.yz) * k;   // minus: positive angles follow the colour wheel
  return clamp(mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703) * vec3(yiq.x, r * cos(h), r * sin(h)), 0.0, 1.0);
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float th(float x) { float e = exp(2.0 * clamp(x, -9.0, 9.0)); return (e - 1.0) / (e + 1.0); }
float blob(vec2 p, vec2 c, vec2 r, float s) { vec2 q = (p - c) / r; return 1.0 - smoothstep(-s, s, length(q) - 1.0); }
vec3 room(vec2 p, float a) {
  float y = p.y;
  vec3 top = mix(vec3(0.028, 0.036, 0.20), vec3(0.02, 0.38, 0.76), uDay);
  vec3 mid = mix(vec3(0.08, 0.09, 0.45), vec3(0.36, 0.60, 0.87), uDay);
  vec3 hor = mix(vec3(0.38, 0.28, 0.84), vec3(0.92, 0.87, 0.74), uDay);
  vec3 col = mix(hor, mid, smoothstep(0.46, 0.74, y));
  col = mix(col, top, smoothstep(0.72, 1.08, y));
  vec3 deep = mix(vec3(0.015, 0.04, 0.28), vec3(0.03, 0.16, 0.58), uDay);
  col = mix(deep, col, smoothstep(0.28, 0.52, y));
  float hill = blob(p, vec2(0.16 * a, 0.41), vec2(0.28 * a, 0.085), 0.45);
  col = mix(col, mix(vec3(0.10, 0.24, 0.74), vec3(0.14, 0.52, 0.78), uDay), hill * 0.75);
  float f1 = blob(p, vec2(0.60 * a + 0.015 * sin(uTime * 0.05), 0.10), vec2(0.36 * a, 0.44), 0.10);
  vec3 c1 = mix(vec3(0.07, 0.20, 0.78), vec3(0.14, 0.38, 0.88), uDay) * (0.72 + 0.55 * smoothstep(-0.25, 0.5, y - 0.05));
  col = mix(col, c1, f1 * 0.9);
  float f2 = blob(p, vec2(1.0 * a, -0.04 + 0.012 * sin(uTime * 0.06 + 1.0)), vec2(0.30 * a, 0.56), 0.05);
  vec3 c2 = mix(vec3(0.34, 0.46, 0.96), vec3(0.62, 0.76, 0.96), uDay) * (0.68 + 0.42 * smoothstep(-0.1, 0.5, y));
  col = mix(col, c2, f2 * 0.92);
  float f3 = blob(p, vec2(0.08 * a, -0.10), vec2(0.24 * a, 0.38), 0.08);
  col = mix(col, mix(vec3(0.16, 0.34, 0.82), vec3(0.46, 0.66, 0.86), uDay), f3 * 0.75);
  return col;
}
float crest(float x, float a, float t, float y0, float amp, float x0, float k) {
  return y0 + amp * (0.5 + 0.5 * th((x / a - x0) * k)) + 0.010 * sin(x * 2.6 + t * 0.22) + 0.006 * sin(x * 5.1 - t * 0.17);
}
vec3 layer1(vec2 p, float a, float px) {
  float t = uTime + 7.0;
  float c = crest(p.x, a, t, 0.46, 0.44, 0.70, 3.6);
  float s = (crest(p.x + 0.01, a, t, 0.46, 0.44, 0.70, 3.6) - c) / 0.01;
  float d = (p.y - c) / sqrt(1.0 + s * s);
  vec2 n = normalize(vec2(-s, 1.0));
  float inside = 1.0 - smoothstep(-3.0 * px, 3.0 * px, d);
  float lens = exp(min(d, 0.0) / 0.07);
  vec3 base = room(p, a);
  vec3 under = room(p - n * 0.028 * lens, a);
  vec3 tint = mix(vec3(0.26, 0.22, 0.86), vec3(0.40, 0.62, 1.0), uDay);
  vec3 g = mix(under, tint, 0.16) * (0.96 + 0.2 * lens);
  vec3 col = mix(base, g, inside * 0.85);
  col += mix(vec3(0.62, 0.62, 1.0), vec3(0.9, 0.95, 1.0), uDay) * 0.22 * exp(-pow(d / (5.0 * px), 2.0));
  return col;
}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes + uShift;
  float a = uAspect; vec2 p = vec2(uv.x * a, uv.y);
  float px = 1.0 / uRes.y;
  float t = uTime;
  float c = crest(p.x, a, t, 0.18, 0.64, 0.52, 4.8);
  float s = (crest(p.x + 0.01, a, t, 0.18, 0.64, 0.52, 4.8) - c) / 0.01;
  float d = (p.y - c) / sqrt(1.0 + s * s);
  vec2 n = normalize(vec2(-s, 1.0));
  float inside = 1.0 - smoothstep(-px, px, d);
  float dm = min(d, 0.0);
  float lens = exp(dm / 0.05);
  vec3 base = layer1(p, a, px);
  vec3 under = layer1(p - n * (0.05 * lens + 0.006), a, px);
  vec3 tint = mix(vec3(0.10, 0.24, 0.95), vec3(0.20, 0.50, 1.0), uDay);
  vec3 g = mix(under, tint, 0.10 + 0.16 * (1.0 - lens));
  g *= 0.9 + 0.32 * lens;
  float streak = pow(0.5 + 0.5 * sin(dm * 230.0 + p.x * 4.0 + t * 0.5), 8.0) * exp(dm / 0.03);
  g += mix(vec3(0.5, 0.72, 1.0), vec3(0.8, 0.92, 1.0), uDay) * 0.14 * streak * inside;
  vec3 col = mix(base, g, inside);
  float catchLight = 0.45 + 0.55 * smoothstep(0.15 * a, 0.75 * a, p.x);
  col += mix(vec3(0.78, 0.88, 1.0), vec3(0.95, 0.98, 1.0), uDay) * catchLight * (0.85 * exp(-pow(d / (0.85 * px), 2.0)) + 0.16 * exp(-pow(d / (6.0 * px), 2.0)));
  vec2 q = uv - 0.5; col *= 1.0 - 0.18 * dot(q, q) * (1.0 - 0.5 * uDay);
  col = hueShift(col, uColor.x, uColor.y);
  col += (hash(gl_FragCoord.xy + fract(t)) - 0.5) / 255.0;
  o = vec4(col, 1.0);
}`;

// Composite: the room (sharp or defocused), soft shadows under the panels, the glass inside them, the ink.
// Panels arrive as inverse homographies (screen device px, y down -> panel px), size, radius, kind, and state.
// The ink is the hero's name: a mask (red the letters, green a soft copy of them whose half level is the outline the
// neon follows, blue a wide blur of them for the halo and the pool) placed by uInkX; uInk0 = (shown, dim, white, the
// soft copy's sigma), uInk1 = (light, lean x, lean y, font size), uInkL = the hot spot near the pointer (centre x, y,
// radius, strength), all in device px.
export const COMPOSITE = `#version 300 es
precision highp float;
uniform sampler2D uScene; uniform sampler2D uInk;
uniform vec2 uRes; uniform float uLod; uniform float uFrostLod; uniform float uTime; uniform float uDay;
uniform vec2 uLight; uniform vec2 uPointer; uniform int uCount;
uniform mat3 uInv[16]; uniform vec4 uBox[16]; uniform vec4 uState[16];
uniform vec4 uInk0; uniform vec3 uInkX; uniform vec2 uColor; uniform vec4 uInk1; uniform vec4 uInkL;
// the color style: a hue rotation (radians) and a saturation scale in YIQ, which keeps each colour's brightness
vec3 hueShift(vec3 c, float a, float k) {
  vec3 yiq = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312) * c;
  float h = atan(yiq.z, yiq.y) - a, r = length(yiq.yz) * k;   // minus: positive angles follow the colour wheel
  return clamp(mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703) * vec3(yiq.x, r * cos(h), r * sin(h)), 0.0, 1.0);
}
// ---------- the hero's name in neon light (after Apple's "It's Glowtime") ----------
const float TAU = 6.2831853;
// The colour style's turn for the name's light: a third as far as the room's, its vibrance three quarters as strong,
// and held inside the Glowtime family, the arc of hues from orange through pink, magenta, violet and blue to cyan
// (YIQ angles -4 to 196 degrees), so a palette shifts which of those colours lead and never turns them lime or green.
// No clamp of the result, so light can add up; guarded where the light is exactly 0 (the mask's corners, the
// hand-off), where atan(0, 0) is undefined.
vec3 neonTurn(vec3 c) {
  vec3 yiq = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312) * c;
  float h = atan(yiq.z, yiq.y + 1e-6) - uColor.x / 3.0, r = length(yiq.yz) * mix(1.0, uColor.y, 0.75);
  h = 1.676 + clamp(mod(h - 1.676 + 3.14159265, TAU) - 3.14159265, -1.745, 1.745);
  return mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703) * vec3(yiq.x, r * cos(h), r * sin(h));
}
// the moment of the light's cycle the room's clock starts from: the first frame of the arrival, and the one still
// under reduced motion (where the clock does not run)
const float T_REST = 31.0;
// the Glowtime colours, as light
const vec3 N_ORANGE = vec3(1.00, 0.40, 0.05), N_PINK = vec3(1.00, 0.12, 0.46), N_MAGENTA = vec3(0.88, 0.12, 0.92);
const vec3 N_VIOLET = vec3(0.52, 0.20, 1.00), N_BLUE = vec3(0.13, 0.34, 1.00), N_CYAN = vec3(0.08, 0.80, 1.00);
// the main tube's colour along phi: orange (a wide stretch), hot pink, magenta, violet, electric blue, cyan (a wide
// stretch), and back
vec3 neonRamp(float phi) {
  float s = 1.0 - abs(fract(phi) * 2.0 - 1.0);
  vec3 c = mix(N_ORANGE, N_PINK, smoothstep(0.21, 0.31, s));
  c = mix(c, N_MAGENTA, smoothstep(0.33, 0.43, s));
  c = mix(c, N_VIOLET, smoothstep(0.44, 0.52, s));
  c = mix(c, N_BLUE, smoothstep(0.54, 0.62, s));
  return mix(c, N_CYAN, smoothstep(0.64, 0.74, s));
}
// the halo's colour: only blue, violet and pink, saturated (no cyan or orange to go teal or maroon over the pool)
vec3 haloRamp(float phi) {
  float s = 1.0 - abs(fract(phi) * 2.0 - 1.0);
  return mix(mix(vec3(0.20, 0.30, 1.00), vec3(0.50, 0.16, 1.00), smoothstep(0.0, 0.5, s)), vec3(0.95, 0.14, 0.66), smoothstep(0.55, 1.0, s));
}
// a Gaussian-softened edge's level as a distance from it, in its softness (log-odds; + inside)
float edgeDist(float g) { g = clamp(g, 0.003, 0.997); return log(g / (1.0 - g)) / 1.7; }
// a bloom round that edge, falling to nothing where the level runs out (about 3.4 softnesses away)
float bloom(float d, float w) { return exp(-abs(d) / w) * smoothstep(3.3, 2.2, abs(d)); }
// Three echoes of the outline, each its own colour family (pink to magenta, orange to amber, azure to cyan; violet is
// the faces' and the halo's). Each: its drift (font sizes in x and y, and their periods in s; a
// negative period turns the other way), the level it follows (in the outline's softnesses, + inside the letters) and
// how far and how slowly that breathes, its slot on the colour turns, the wave on which it wanders from its turn (a
// direction in radians per font size, a period, a phase), and its strength (orange the strongest, so it holds its own
// against the pinks and burns white where it meets them).
const vec4 E_DRIFT[3] = vec4[3](vec4(0.024, 0.018, 13.0, -16.5), vec4(0.020, 0.024, -17.0, 12.0), vec4(0.026, 0.016, 19.0, -10.5));
const vec4 E_LEVEL[3] = vec4[3](vec4(1.15, 0.35, 11.0, 1.0), vec4(-1.25, 0.35, 14.5, 2.4), vec4(-0.55, 0.55, 9.5, 4.1));
const vec4 E_WAVE[3] = vec4[3](vec4(-0.9, 0.7, -15.0, 1.5), vec4(0.6, -1.1, 18.0, 3.0), vec4(-1.2, -0.4, -10.0, 4.5));
const float E_SLOT[3] = float[3](0.25, 0.5, 0.75), E_GAIN[3] = float[3](0.9, 1.3, 1.05);
const vec3 E_A[3] = vec3[3](N_PINK, N_ORANGE, vec3(0.11, 0.48, 1.00));
const vec3 E_B[3] = vec3[3](N_MAGENTA, vec3(1.00, 0.56, 0.08), N_CYAN);

out vec4 o;
float sdRound(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
vec3 roomAt(vec2 uv, float lod) {
  vec2 t = exp2(max(lod, 0.0)) / uRes;
  vec3 c = textureLod(uScene, uv, lod).rgb * 0.36;
  c += textureLod(uScene, uv + vec2(t.x, 0.0), lod).rgb * 0.16;
  c += textureLod(uScene, uv - vec2(t.x, 0.0), lod).rgb * 0.16;
  c += textureLod(uScene, uv + vec2(0.0, t.y), lod).rgb * 0.16;
  c += textureLod(uScene, uv - vec2(0.0, t.y), lod).rgb * 0.16;
  return c;
}
// One pane of glass (panel i, at its own pixel lp, sd from its rounded edge) laid over what is behind it.
vec3 glassOver(int i, vec2 lp, float sd, vec2 px, vec3 col) {
  vec2 hb = uBox[i].xy * 0.5; float r = uBox[i].z, kind = uBox[i].w;
  float m = uState[i].x, dim = uState[i].y;
  float e = 1.0;
  vec2 n = normalize(vec2(sdRound(lp + vec2(e, 0.0) - hb, hb, r) - sdRound(lp - vec2(e, 0.0) - hb, hb, r),
                          sdRound(lp + vec2(0.0, e) - hb, hb, r) - sdRound(lp - vec2(0.0, e) - hb, hb, r)) + 1e-6);
  float lensW = kind < 0.5 ? 30.0 : 20.0;
  float edge = clamp(1.0 + sd / lensW, 0.0, 1.0);
  float bend = edge * edge * (kind < 0.5 ? 26.0 : 16.0) * m;
  vec2 suv = (px - n * bend) / uRes; suv.y = 1.0 - suv.y;
  float frost = mix(uLod, max(uLod, kind > 1.5 ? uFrostLod - 1.0 : uFrostLod), m);
  vec3 g = roomAt(suv, frost);
  bool prominent = kind > 2.5;
  // night glass is luminous cobalt, as in the comps; day glass is a deeper blue that the cap below holds down
  vec3 tint = hueShift(prominent ? mix(vec3(0.16, 0.34, 1.0), vec3(0.24, 0.46, 1.0), uDay) : mix(vec3(0.15, 0.20, 0.90), vec3(0.10, 0.16, 0.40), uDay), uColor.x, uColor.y);
  g = mix(g, tint, (prominent ? 0.46 : kind > 1.5 ? 0.22 : 0.48) * m) * (prominent ? 1.0 + 0.16 * m : 1.0);
  // legibility: whatever the room behind it (the day sky is bright), the glass stays a dark enough ground for white
  // text; the rims and highlights come after this, so the edges keep their light
  if (!prominent) { float gy = dot(g, vec3(0.2126, 0.7152, 0.0722)); g *= mix(1.0, min(1.0, 0.22 / max(gy, 1e-3)), m); }
  vec2 L = normalize(uLight - px + 1e-3);
  float rim = exp(-pow((sd + 1.1) / 1.1, 2.0));
  g += vec3(1.0) * rim * (0.30 + 0.55 * max(dot(n, -L), 0.0)) * 0.8 * m;
  g += vec3(1.0) * edge * edge * 0.06 * m;
  g += vec3(1.0) * exp(-dot(px - uLight, px - uLight) / (2.0 * 300.0 * 300.0)) * 0.06 * m;
  // a press lights the glass from within, under the pointer
  float press = uState[i].z;
  if (press > 0.001) { vec2 dp = px - uPointer; float pr = 0.07 * uRes.y; g += vec3(0.92, 0.96, 1.0) * press * 0.24 * exp(-dot(dp, dp) / (2.0 * pr * pr)); }
  g *= 1.0 - 0.55 * dim;
  return mix(col, g, smoothstep(1.5, -0.5, sd) * min(1.0, m * 1.6));
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 col = uLod > 0.05 ? roomAt(uv, uLod) : textureLod(uScene, uv, 0.0).rgb;
  float shadow = 0.0;
  // the front pane over this pixel, and the one behind it
  int hit = -1, under = -1; vec2 lp = vec2(0.0), lp2 = vec2(0.0); float sd = 1e5, sd2 = 1e5;
  for (int i = 0; i < 16; i++) {
    if (i >= uCount) break;
    vec2 hb = uBox[i].xy * 0.5;
    vec3 h = uInv[i] * vec3(px, 1.0);
    vec2 p = h.xy / h.z;
    float d = sdRound(p - hb, hb, uBox[i].z);
    vec3 hs = uInv[i] * vec3(px - vec2(0.0, 22.0), 1.0);
    float ds = sdRound(hs.xy / hs.z - hb, hb, uBox[i].z);
    float reach = uBox[i].w < 0.5 ? 90.0 : 40.0;
    shadow = max(shadow, (1.0 - smoothstep(-24.0, reach, ds)) * (uBox[i].w < 0.5 ? 0.34 : 0.22) * uState[i].x);
    if (d < 1.5) { under = hit; lp2 = lp; sd2 = sd; hit = i; lp = p; sd = d; }
  }
  col *= 1.0 - shadow * (hit >= 0 ? 0.0 : 1.0);
  if (hit >= 0) {
    // a front pane that is only partly there (arriving, leaving, or at its antialiased rim) shows the pane behind
    // it through the gap, not the bare room
    if (under >= 0 && smoothstep(1.5, -0.5, sd) * min(1.0, uState[hit].x * 1.6) < 0.999) col = glassOver(under, lp2, sd2, px, col);
    col = glassOver(hit, lp, sd, px, col);
  }
  // The name in neon light, after Apple's "It's Glowtime". Each letter's outline is a crisp tube of light locked to
  // the letters' true edge, its colour flowing along the name (orange, hot pink, magenta, violet, electric blue,
  // cyan) with a white-hot core and a hair of red and blue split. Three echoes trace the outline again, each in its
  // own colour family, drifting a little and following a level just inside or outside the edge, so they cross the
  // tube and add up toward white where they meet. The faces are translucent light in the tube's colour (violet where
  // it runs cool), the halo behind leans toward the pointer and falls away where the tube runs warm or icy, and the
  // room gives way to a pool under it all (near black by night, a deep violet-blue by day).
  // The traces take turns being brightest (a cycle in 16 s sliding along the name) and wander on their own 10 to 19 s
  // waves; the letters never move. The echoes grow out of the outline as the light arrives and fold back as it goes,
  // and turning white the light goes out and the letters become plain white text. Seven reads of the mask.
  if (uInk0.x > 0.001) {
    vec2 isz = vec2(textureSize(uInk, 0));
    vec2 mp = px * uInkX.x + uInkX.yz;                                   // this pixel in the mask
    vec2 mu = mp / isz;
    if (mu.x > 0.0 && mu.y > 0.0 && mu.x < 1.0 && mu.y < 1.0) {
      // an explicit mip level: inside this branch the GPU has no derivatives to choose one at the mask's edge
      float lk = max(0.0, log2(max(uInkX.x, 1e-4)));
      float on = uInk0.x, white = uInk0.z, sig = max(uInk0.w, 0.75);    // sig: the outline's softness, mask px
      float fs = max(uInk1.w, 8.0);                                        // the font size, mask px
      float lit = uInk1.x * on * (1.0 - white);                            // arrival, hover lift, press flare; out as it whitens
      float calm = min(lit, 1.0);
      float t = uTime + T_REST;                                            // the room's clock (still under reduced motion)
      vec4 m = textureLod(uInk, mu, lk);                                   // read 1: letters, outline field, wide blur
      // the outline is where the soft copy crosses one half; its log-odds is about the distance from it, in sig
      float d = edgeDist(m.g);
      vec2 nrm = normalize(vec2(textureLod(uInk, mu + vec2(sig / isz.x, 0.0), lk).g, textureLod(uInk, mu + vec2(0.0, sig / isz.y), lk).g) - m.g + 1e-6);   // reads 2, 3
      // the colour, in font sizes from the name's centre: bands drifting along the name (a cycle in 14 s) through a
      // slow warp (15 and 19 s)
      vec2 q = (mp - 0.5 * isz) / fs;
      vec2 wq = q + 0.30 * vec2(sin(q.y * 1.9 + t * 0.42), sin(q.x * 0.8 - t * 0.33));
      float phi = 0.21 * wq.x - 0.28 * wq.y - t / 14.0;
      vec3 cT = neonRamp(phi);
      // the turns: a slow brightness cycle sliding along the name, a quarter of it apart for each trace, each wandering
      // from its turn on its own wave
      float cyc = q.x * 1.25 + q.y * 0.5 - TAU * t / 16.0;
      float up0 = pow(0.5 + 0.5 * cos(cyc + 0.6 * sin(dot(q, vec2(1.1, 0.6)) + TAU * t / 12.0)), 2.0);
      // the tube, its red and blue a hair apart (the split turns round in 16 s), and its white-hot core
      vec3 dc = vec3(d) + vec3(0.24, 0.0, -0.24) * dot(nrm, vec2(cos(t * 0.39), sin(t * 0.39)));
      vec3 tube = dc * dc / 0.9;
      float face = clamp(d * sig + 0.5, 0.0, 1.0);                       // inside the letters (antialiased)
      vec3 light = cT * exp(-tube * tube) * (0.85 + 0.5 * up0);
      light += vec3(1.0, 0.95, 0.97) * exp(-d * d / 0.03) * (0.04 + 0.24 * up0);
      light += cT * bloom(d, 1.3) * 0.45 * (1.0 - face);
      // the echoes (reads 4 to 6): their drift and level grow out of the outline with the light, and fold back into it
      float grow = calm;
      for (int i = 0; i < 3; i++) {
        vec4 D = E_DRIFT[i], V = E_LEVEL[i], W = E_WAVE[i];
        vec2 off = vec2(D.x * sin(TAU * t / D.z + V.w), D.y * cos(TAU * t / D.w + V.w * 1.618)) * grow;
        float lev = (V.x + V.y * sin(TAU * t / V.z + V.w * 2.3)) * grow;
        float ei = edgeDist(textureLod(uInk, (mp + off * fs) / isz, lk).g), di = ei - lev;
        // the further it strays from the outline (in softnesses), the fainter, so the name never reads double
        float stray = length(off) / max(sig / fs, 1e-3) + 0.5 * abs(lev);
        float up = pow(0.5 + 0.5 * cos(cyc - TAU * E_SLOT[i] + 0.6 * sin(dot(q, W.xy) + TAU * t / W.z + W.w)), 2.0);
        vec3 c = mix(E_A[i], E_B[i], 0.5 + 0.5 * sin(TAU * t / 19.0 + q.x * 0.5 + float(i) * 1.7));
        // (its bloom goes where the field runs out, so nothing is left at the mask's edge)
        light += c * E_GAIN[i] * (exp(-di * di / 0.14) + 0.16 * bloom(di, 0.9) * smoothstep(3.35, 2.6, abs(ei))) * (0.95 + 0.65 * up) * (1.0 - 0.45 * smoothstep(0.6, 2.0, stray)) * grow;
      }
      // the halo (read 7): the wide blur, leaning toward the pointer, breathing over 10 s, in blue, violet and pink.
      // It and the violet in the faces fall away where the tube runs warm (orange, hot pink) or icy (cyan), so those
      // stretches burn in their own colour on the dark instead of washing to salmon or blue
      float warm = smoothstep(0.0, 0.3, cT.r - cT.b), icy = smoothstep(0.3, 0.6, cT.g - cT.r);
      float cool = (1.0 - warm) * (1.0 - 0.7 * icy);
      float back = textureLod(uInk, mu - uInk1.yz * uInkX.x / isz, lk).b;
      vec3 haloC = haloRamp(phi * 0.7 + 0.15);
      light += haloC * back * (0.3 + back) * mix(0.6 * cool, 0.5, uDay) * (0.88 + 0.12 * sin(TAU * t / 10.0)) * (1.0 - 0.6 * face);
      // the faces: translucent light in the tube's colour, deepest away from the edge: crimson where it runs warm (a
      // dim orange face would read brown), violet where it runs cool. By day, violet and brighter, over the day pool
      vec3 faceC = mix(mix(cT, N_PINK, 0.5 * warm * (1.0 - uDay)), vec3(0.46, 0.32, 1.0), mix(0.75 * cool, 0.75, uDay));
      light += faceC * face * mix(0.16 + 0.18 * smoothstep(0.4, 1.6, d), 0.30 + 0.30 * smoothstep(0.4, 1.6, d), uDay);
      // the light leans toward the pointer: the tubes run hotter near it
      vec2 dl = (px - uInkL.xy) / max(uInkL.z, 1.0);
      light *= lit * (1.0 + 3.0 * uInkL.w * exp(-dot(dl, dl)));
      // where light piles up (traces crossing, a press) it spills into every channel and burns toward white; then a
      // soft tone curve, so the burn rolls off rather than clipping, and the colour style turns it a third as far as
      // the room, so every palette keeps the Glowtime family and only shifts its emphasis
      float hot = max(max(light.r, light.g), light.b);
      light += vec3(max(hot - 1.8, 0.0) * 0.9);
      vec3 L = max(neonTurn(1.0 - exp(-light)), 0.0);
      // the pool under the light, tied to the same light term. By night the room gives way to near black behind the
      // name (a mix, not a dimming, so no cobalt shows through round the letters), a soft oval and a hug of the wide
      // blur, deepest round the letters; by day, where the room is bright, it falls about 80% toward a saturated
      // violet-blue that follows the halo, hugging the letters
      vec3 deepN = hueShift(vec3(0.010, 0.009, 0.026), uColor.x, uColor.y);
      float poolN = max(smoothstep(1.0, 0.3, length(mu * 2.0 - 1.0)) * 0.8, smoothstep(0.0, 0.2, m.b));
      vec3 deepD = clamp(neonTurn(mix(vec3(0.14, 0.08, 0.56), haloC * 0.42, 0.4)), 0.0, 1.0);
      float poolD = smoothstep(0.0, 0.24, m.b) * 0.82;
      vec3 ground = mix(mix(col, deepN, poolN * calm), mix(col, deepD, poolD * calm), uDay);
      ground *= 1.0 - 0.2 * face * calm;
      vec3 neon = clamp(ground + L, 0.0, 1.0) * (1.0 - 0.5 * uInk0.y);
      // as the window's title it is plain white, as the HTML title it hands off to
      col = mix(neon, mix(col, vec3(1.0), m.r * on), 1.0 - (1.0 - white) * (1.0 - white));
    }
  }
  o = vec4(col, 1.0);
}`;
