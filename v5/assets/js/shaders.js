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
// The ink is the hero's name: a mask (red the letters, green a soft height for their bevel, blue a wide blur of them
// for the light behind) placed by uInkX; uInk0 = (shown, dim, white, bevel px), uInk1 = (glow, lean x, lean y, -),
// uInkL = the highlight on the glass (centre x, y, radius, strength), all in device px.
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
  // The name: solid glass letters with a light behind them. The light spills round the letters into the room (blue,
  // leaning a few pixels toward the pointer) and shines through their frosted faces; the bevel catches a bright rim
  // on the side facing the light, which leans toward the pointer too. Turning white, they become plain white text.
  if (uInk0.x > 0.001) {
    vec2 isz = vec2(textureSize(uInk, 0));
    vec2 mu = (px * uInkX.x + uInkX.yz) / isz;
    if (mu.x > 0.0 && mu.y > 0.0 && mu.x < 1.0 && mu.y < 1.0) {
      // an explicit mip level: inside this branch the GPU has no derivatives to choose one at the mask's edge
      float lk = max(0.0, log2(max(uInkX.x, 1e-4)));
      float on = uInk0.x, white = uInk0.z, bev = max(uInk0.w, 1.0);
      float cov = textureLod(uInk, mu, lk).r * on;
      vec2 lean = uInk1.yz * uInkX.x / isz;
      float back = textureLod(uInk, mu - lean, lk).b;                  // the wide light behind
      float leak = textureLod(uInk, mu - lean * 0.4, lk + 3.0).r;      // and a tight leak of it right at the edges
      vec3 glowC = hueShift(mix(vec3(0.44, 0.58, 1.0), vec3(0.86, 0.93, 1.0), uDay), uColor.x, uColor.y);
      float glow = uInk1.x * on * (1.0 - white);
      col += glowC * (back * mix(0.5, 0.26, uDay) + leak * mix(0.22, 0.14, uDay)) * glow;
      if (cov > 0.003) {
        float hc = textureLod(uInk, mu, lk).g;
        vec2 e = vec2(max(1.0, bev * 0.5) * uInkX.x) / isz;
        float hx = textureLod(uInk, mu + vec2(e.x, 0.0), lk).g - textureLod(uInk, mu - vec2(e.x, 0.0), lk).g;
        float hy = textureLod(uInk, mu + vec2(0.0, e.y), lk).g - textureLod(uInk, mu - vec2(0.0, e.y), lk).g;
        // the moving surface, kept to a shimmer
        vec2 q = uv * vec2(uRes.x / uRes.y, 1.0);
        vec2 flow = vec2(sin(q.y * 21.0 + uTime * 0.9 + 1.7 * sin(q.x * 9.0 + uTime * 0.5)), cos(q.x * 17.0 - uTime * 0.7 + 1.9 * sin(q.y * 11.0 - uTime * 0.4)));
        vec3 n = normalize(vec3(-vec2(hx, hy) * 3.0 + flow * 0.012, 1.0));
        // the light: from the upper left, leaning gently toward the pointer
        vec3 L = normalize(vec3(clamp((uLight - px) / uRes.y, -1.0, 1.0) * 0.5 + vec2(-0.42, -0.58), 0.75));
        vec2 lit = normalize(L.xy + 1e-5), nn = normalize(n.xy + 1e-5);
        float slope = clamp(1.0 - n.z, 0.0, 1.0);
        float edge = exp(-pow((hc - 0.56) / 0.13, 2.0));          // the rim, just inside the letter's edge
        float facing = max(dot(nn, lit), 0.0), away = max(dot(nn, -lit), 0.0);
        // frosted inside: the room behind, bent a little at the bevel and deeply blurred, lit from behind
        vec2 spx = px - n.xy * bev * 3.5;
        vec2 suv = spx / uRes; suv.y = 1.0 - suv.y;
        vec3 frost = roomAt(suv, max(uLod, uFrostLod));
        vec3 g = frost * 1.12 + glowC * (0.24 + 0.5 * back) * uInk1.x + vec3(0.1);
        // by day the room behind is bright, so the glass is a deeper blue (as the windows are) and the rims draw on it
        vec3 deep = hueShift(vec3(0.13, 0.27, 0.80), uColor.x, uColor.y);
        g = mix(g, mix(frost * 0.55, deep, 0.62) + glowC * 0.12 * back * uInk1.x, uDay);
        g *= 1.0 - 0.38 * slope * away;                           // the bevel away from the light falls into shade
        g += vec3(0.96, 0.98, 1.0) * edge * (0.95 * facing + 0.38 * away + 0.12);   // a bright rim, a fainter one behind
        g += vec3(0.96, 0.98, 1.0) * slope * facing * 0.35;
        // a soft highlight across the faces, drawn toward the pointer
        vec2 dl = (px - uInkL.xy) / max(uInkL.z, 1.0);
        g += vec3(0.95, 0.97, 1.0) * uInkL.w * exp(-dot(dl, dl));
        float sweep = fract(uTime / 9.0) * 2.6 - 0.8;
        g += vec3(1.0) * 0.045 * exp(-pow((uv.x * 0.85 + (1.0 - uv.y) * 0.35 - sweep) * 6.0, 2.0));
        // as the window's title it is plain white, as the HTML title it hands off to
        g = mix(g, vec3(1.0), white);
        g *= 1.0 - 0.5 * uInk0.y;
        col = mix(col, g, cov);
      }
    }
  }
  o = vec4(col, 1.0);
}`;
