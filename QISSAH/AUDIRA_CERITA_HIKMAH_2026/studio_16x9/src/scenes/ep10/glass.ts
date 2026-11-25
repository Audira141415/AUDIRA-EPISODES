// EP10 "Cinta dan Waktu": the whole allegory is painted as one wide triptych leadlight window.
// The picture is an SDF "cartoon" evaluated in a fragment shader: every shape is its own pane of
// pot-metal glass, big regions are split into irregular panes (Voronoi), lead came runs along every
// shape edge and pane edge, faces and folds are grisaille paint. One colour per pane (STAINEDGLASS
// rule 1): gradients (sky) are sampled at the pane centre, not per pixel.
// Window coordinates (world units on the wall plane): x -6.7..6.7, y -2.8..6.1.
// Characters (index k): 0 Cinta, 1 Kekayaan, 2 Kegembiraan, 3 Kecantikan, 4 Kesedihan, 5 Waktu, 6 Penduduk.

export const WIN = { x0: -6.7, y0: -2.8, w: 13.4, h: 8.9 } as const;
// lancets: centre x, half width, spring line. Sill is shared. Arches are equilateral (R = 2 * hw).
export const SILL = -2.6;
export const LANCETS: [number, number, number][] = [
  [-4.7, 1.8, 1.8],
  [0, 2.0, 2.4],
  [4.7, 1.8, 1.8],
];
export const HORIZON = 1.1;
export const HEART: [number, number] = [0, 4.5];
export const SUN: [number, number] = [4.6, 3.3];

const f = (v: number) => v.toFixed(3);

export const GLASS_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const FRAG_BODY = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uOrigin;
uniform vec2 uSize;
uniform float uT;
uniform float uGlow;    // sun behind the glass (overall)
uniform float uStorm;   // 0 calm .. 1 full storm
uniform float uSun;     // sun disc + rays in the right lancet
uniform float uWater;   // near sea level (window y)
uniform float uFlash;   // lightning
uniform float uReveal;  // radius (from the heart medallion) of panes already lit
uniform float uDim;     // global fade of the glass (scene changes)
uniform float uBg;      // brightness of the background panes (lower when a figure is in focus)
uniform float uHeart;   // brightness of the heart medallion
uniform float uIsle1;   // vertical offset of the home island (sinks)
uniform float uIsle2;   // 0..1 the nearest island rises in the right lancet
uniform float uPoolAmt;
uniform vec4 uCh[7];    // x, y, scale, boat (0 standing, 1 in a boat)
uniform vec4 uPo[7];    // facing (+1 / -1), pose, highlight, talk

#define PI 3.14159265
#define HZ ${f(HORIZON)}

vec3 C; float ID; float E; float SC;

vec3 srgb(float r, float g, float b){ return vec3(r, g, b) / 255.0; }
float dot2(vec2 v){ return dot(v, v); }
float hash1(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
vec2 hash2(vec2 p){ return vec2(hash1(p), hash1(p + 17.31)); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash1(i), hash1(i + vec2(1, 0)), f.x), mix(hash1(i + vec2(0, 1)), hash1(i + vec2(1, 1)), f.x), f.y); }

float sdCircle(vec2 p, float r){ return length(p) - r; }
float sdBox(vec2 p, vec2 b){ vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
float sdSeg(vec2 p, vec2 a, vec2 b, float r){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }
float sdEll(vec2 p, vec2 r){ return (length(p / r) - 1.0) * min(r.x, r.y); }
float sdTrap(vec2 p, float r1, float r2, float he){
  vec2 k1 = vec2(r2, he); vec2 k2 = vec2(r2 - r1, 2.0 * he);
  p.x = abs(p.x);
  vec2 ca = vec2(p.x - min(p.x, (p.y < 0.0) ? r1 : r2), abs(p.y) - he);
  vec2 cb = p - k1 + k2 * clamp(dot(k1 - p, k2) / dot2(k2), 0.0, 1.0);
  float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
  return s * sqrt(min(dot2(ca), dot2(cb)));
}
float sdTri(vec2 p, vec2 p0, vec2 p1, vec2 p2){
  vec2 e0 = p1 - p0, e1 = p2 - p1, e2 = p0 - p2;
  vec2 v0 = p - p0, v1 = p - p1, v2 = p - p2;
  vec2 pq0 = v0 - e0 * clamp(dot(v0, e0) / dot(e0, e0), 0.0, 1.0);
  vec2 pq1 = v1 - e1 * clamp(dot(v1, e1) / dot(e1, e1), 0.0, 1.0);
  vec2 pq2 = v2 - e2 * clamp(dot(v2, e2) / dot(e2, e2), 0.0, 1.0);
  float s = sign(e0.x * e2.y - e0.y * e2.x);
  vec2 d = min(min(vec2(dot(pq0, pq0), s * (v0.x * e0.y - v0.y * e0.x)), vec2(dot(pq1, pq1), s * (v1.x * e1.y - v1.y * e1.x))), vec2(dot(pq2, pq2), s * (v2.x * e2.y - v2.y * e2.x)));
  return -sqrt(d.x) * sign(d.y);
}
float sdHeart(vec2 p){
  p.x = abs(p.x);
  if (p.y + p.x > 1.0) return sqrt(dot2(p - vec2(0.25, 0.75))) - sqrt(2.0) / 4.0;
  return sqrt(min(dot2(p - vec2(0.0, 1.0)), dot2(p - 0.5 * max(p.x + p.y, 0.0)))) * sign(p.x - p.y);
}
float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

// one layer of glass: inside -> becomes the top pane; outside -> its edge still counts for lead
void lay(float d, vec3 c, float id, float sc){ if (d < 0.0) { C = c; ID = id; E = -d; SC = sc; } else E = min(E, d); }

vec3 RUBY(){ return srgb(179., 18., 46.); }
vec3 RUBYD(){ return srgb(126., 11., 34.); }
vec3 LOVE(){ return srgb(205., 38., 40.); }
vec3 AMBER(){ return srgb(224., 165., 38.); }
vec3 GOLD(){ return srgb(246., 196., 69.); }
vec3 SAPH(){ return srgb(28., 63., 158.); }
vec3 AZURE(){ return srgb(60., 116., 208.); }
vec3 PALE(){ return srgb(142., 189., 235.); }
vec3 COBALT(){ return srgb(24., 40., 120.); }
vec3 EMER(){ return srgb(31., 122., 62.); }
vec3 EMERL(){ return srgb(63., 163., 90.); }
vec3 UMBER(){ return srgb(138., 75., 28.); }
vec3 UMBERD(){ return srgb(96., 50., 20.); }
vec3 VIOLET(){ return srgb(84., 44., 140.); }
vec3 FLESH(){ return srgb(226., 176., 138.); }
vec3 SILVER(){ return srgb(150., 160., 176.); }
vec3 SILVERD(){ return srgb(88., 98., 116.); }
vec3 WHITE(){ return srgb(236., 240., 244.); }
vec3 ROSE(){ return srgb(226., 98., 140.); }
vec3 ORANGE(){ return srgb(236., 118., 30.); }
vec3 SADBLUE(){ return srgb(40., 58., 140.); }
vec3 SAND(){ return srgb(214., 170., 92.); }

float lancetD(vec2 p, float cx, float hw, float spring){
  float side = abs(p.x - cx) - hw;
  float base = max(side, ${f(SILL)} - p.y);
  if (p.y <= spring) return base;
  float R = 2.0 * hw;
  float dl = length(p - vec2(cx + hw, spring)) - R;
  float dr = length(p - vec2(cx - hw, spring)) - R;
  return max(max(dl, dr), ${f(SILL)} - p.y);
}
float windowD(vec2 p){
  return min(lancetD(p, ${LANCETS[0].map(f).join(", ")}), min(lancetD(p, ${LANCETS[1].map(f).join(", ")}), lancetD(p, ${LANCETS[2].map(f).join(", ")})));
}

float hullD(vec2 q, float hl, float depth){
  float R = (hl * hl + depth * depth) / (2.0 * depth);
  return max(length(q - vec2(0.0, R - depth)) - R, q.y);
}

// ---- characters ----
vec3 robeCol(int k){
  if (k == 0) return LOVE();
  if (k == 1) return AMBER();
  if (k == 2) return ORANGE();
  if (k == 3) return ROSE();
  if (k == 4) return SADBLUE();
  if (k == 5) return SILVER();
  return EMER();
}
vec3 sleeveCol(int k){
  if (k == 0) return RUBYD();
  if (k == 1) return srgb(190., 130., 24.);
  if (k == 2) return srgb(200., 90., 20.);
  if (k == 3) return srgb(180., 64., 110.);
  if (k == 4) return srgb(28., 40., 104.);
  if (k == 5) return SILVER();
  return srgb(24., 92., 48.);
}
vec2 headPos(int k){ return k == 4 ? vec2(0.13, 1.5) : vec2(0.03, 1.64); }
vec2 handF(float i){
  if (i < 0.5) return vec2(0.22, 0.85);
  if (i < 1.5) return vec2(0.68, 1.71);
  if (i < 2.5) return vec2(0.42, 2.05);
  if (i < 3.5) return vec2(0.12, 1.58);
  return vec2(0.62, 1.0);
}
vec2 handB(float i){
  if (i < 0.5) return vec2(-0.3, 0.82);
  if (i < 1.5) return vec2(-0.36, 0.86);
  if (i < 2.5) return vec2(-0.38, 2.0);
  if (i < 3.5) return vec2(-0.02, 1.55);
  return vec2(0.5, 0.95);
}
vec2 poseHand(float pose, bool front){
  float a = floor(pose), b = min(a + 1.0, 4.0), fr = fract(pose);
  fr = fr * fr * (3.0 - 2.0 * fr);
  return front ? mix(handF(a), handF(b), fr) : mix(handB(a), handB(b), fr);
}

vec2 localQ(vec2 p, int k){
  vec4 c = uCh[k];
  vec2 q = (p - c.xy) / c.z;
  q.x *= uPo[k].x;
  return q;
}

// mode 0: body only, 1: boat only, 2: both
void figure(vec2 p, int k, int mode){
  vec4 c = uCh[k]; vec4 po = uPo[k];
  float s = c.z;
  if (s < 0.02) return;
  vec2 q = localQ(p, k);
  if (length(q - vec2(0.0, 0.9)) > 2.3) return;
  float base = 300.0 + float(k) * 20.0;
  vec3 rc = robeCol(k), sc = sleeveCol(k);
  float pose = po.y;
  vec2 hf = poseHand(pose, true), hb = poseHand(pose, false);
  if (k == 5) hb = vec2(0.62, 1.82); // Time always holds the hourglass up
  vec2 hp = headPos(k);
  if (mode != 1) {
    // gown blown back by the storm wind
    vec2 qs = q; qs.x += (0.05 + 0.13 * uStorm) * (1.42 - q.y) * (1.0 - clamp(q.y / 1.42, 0.0, 1.0)) + 0.03 * uStorm * sin(uT * 2.0 + q.y * 6.0 + float(k)) * (1.42 - q.y);
    if (k == 0) lay(sdEll(rot(-0.35) * (q - vec2(-0.2, 1.36)), vec2(0.2, 0.46)) * s, UMBERD(), base, 0.0);
    if (k == 3) lay(sdEll(rot(-0.2) * (q - vec2(-0.14, 1.3)), vec2(0.21, 0.5)) * s, GOLD() * 0.92, base, 0.0);
    lay(sdSeg(q, vec2(-0.12, 1.33), hb, 0.07) * s, sc, base + 1.0, 0.0);
    lay(sdCircle(q - hb, 0.065) * s, FLESH(), base + 2.0, 0.0);
    float r1 = k == 1 ? 0.58 : (k == 5 ? 0.5 : 0.52);
    float r2 = k == 1 ? 0.25 : 0.19;
    lay(sdTrap(qs - vec2(0.0, 0.71), r1, r2, 0.71) * s, rc, base + 3.0, 3.4);
    lay(sdTrap(q - vec2(0.0, 1.3), r2 - 0.02, 0.13, 0.13) * s, sc, base + 4.0, 0.0);
    // belt / sash: gold for Love and Wealth, cream for the others
    lay(sdBox(q - vec2(0.0, 1.14), vec2(r2 + 0.0, 0.03)) * s, (k <= 1) ? GOLD() : WHITE() * 0.85, base + 5.0, 0.0);
    if (k == 0) lay(sdHeart((q - vec2(0.02, 1.2)) / 0.11) * 0.11 * s, GOLD(), base + 11.0, 0.0);
    // face
    lay(sdEll(q - hp, k == 5 ? vec2(0.15, 0.17) : vec2(0.155, 0.17)) * s, FLESH(), base + 6.0, 0.0);
    // hair / hood
    if (k == 0) lay(max(sdCircle(q - hp - vec2(-0.04, 0.03), 0.2), -sdCircle(q - hp - vec2(0.04, -0.04), 0.165)) * s, UMBERD(), base + 7.0, 0.0);
    if (k == 1 || k == 6) lay(max(sdCircle(q - hp - vec2(-0.03, 0.03), 0.19), -sdCircle(q - hp - vec2(0.05, -0.05), 0.17)) * s, UMBERD(), base + 7.0, 0.0);
    if (k == 2) lay(max(sdCircle(q - hp - vec2(-0.04, 0.04), 0.2), -sdCircle(q - hp - vec2(0.06, -0.06), 0.165)) * s, UMBER(), base + 7.0, 0.0);
    if (k == 3) lay(max(sdCircle(q - hp - vec2(-0.04, 0.03), 0.2), -sdCircle(q - hp - vec2(0.05, -0.04), 0.165)) * s, GOLD() * 0.92, base + 7.0, 0.0);
    if (k == 4) lay(max(sdCircle(q - hp - vec2(-0.05, 0.04), 0.23), -sdEll(q - hp - vec2(0.07, -0.03), vec2(0.15, 0.16))) * s, srgb(22., 32., 90.), base + 7.0, 0.0);
    if (k == 5) {
      lay(max(smin(sdCircle(q - hp - vec2(-0.03, 0.04), 0.24), sdTri(q - hp, vec2(-0.1, 0.0), vec2(-0.32, -0.25), vec2(-0.25, 0.2)), 0.05), -sdEll(q - hp - vec2(0.05, -0.03), vec2(0.15, 0.17))) * s, SILVERD(), base + 7.0, 0.0);
      lay(sdTri(q, hp + vec2(-0.12, -0.04), hp + vec2(0.17, -0.06), hp + vec2(0.0, -0.66)) * s, WHITE(), base + 10.0, 0.0);
    }
    if (k == 1) lay(sdTri(q - hp - vec2(-0.02, 0.15), vec2(-0.14, 0.0), vec2(0.14, 0.0), vec2(0.0, 0.18)) * s, GOLD(), base + 11.0, 0.0);
    if (k == 3) lay(sdCircle(q - hp - vec2(-0.12, 0.12), 0.06) * s, srgb(250., 150., 190.), base + 11.0, 0.0);
    lay(sdSeg(q, vec2(0.12, 1.36), hf, 0.07) * s, sc, base + 8.0, 0.0);
    lay(sdCircle(q - hf, 0.07) * s, FLESH(), base + 9.0, 0.0);
    if (k == 5) {
      vec2 h = (q - hb - vec2(0.02, 0.32)) / 1.45;
      float hs = s * 1.45;
      lay(sdSeg(h, vec2(-0.15, -0.22), vec2(-0.15, 0.22), 0.022) * hs, UMBERD(), base + 12.0, 0.0);
      lay(sdSeg(h, vec2(0.15, -0.22), vec2(0.15, 0.22), 0.022) * hs, UMBERD(), base + 12.0, 0.0);
      lay(sdTri(h, vec2(-0.13, 0.2), vec2(0.13, 0.2), vec2(0.0, 0.0)) * hs, srgb(150., 215., 230.), base + 13.0, 0.0);
      lay(sdTri(h, vec2(-0.13, -0.2), vec2(0.13, -0.2), vec2(0.0, 0.0)) * hs, srgb(150., 215., 230.), base + 13.0, 0.0);
      // the sand runs down with the story
      float run = fract(uT / 30.0);
      lay(sdTri(h, vec2(-0.1, -0.2), vec2(0.1, -0.2), vec2(0.0, -0.2 + 0.16 * run)) * hs, AMBER(), base + 14.0, 0.0);
      lay(sdTri(h, vec2(-0.08 * (1.0 - run), 0.15 - 0.1 * run), vec2(0.08 * (1.0 - run), 0.15 - 0.1 * run), vec2(0.0, 0.01)) * hs, AMBER(), base + 14.0, 0.0);
      lay(sdBox(h - vec2(0.0, 0.23), vec2(0.17, 0.035)) * hs, GOLD(), base + 15.0, 0.0);
      lay(sdBox(h - vec2(0.0, -0.23), vec2(0.17, 0.035)) * hs, GOLD(), base + 15.0, 0.0);
    }
  }
  if (mode != 0 && c.w > 0.01) {
    float b = clamp(c.w, 0.0, 1.0);
    vec2 bq = q - vec2(0.05, 0.62);
    // cargo behind the rower
    if (k == 1) {
      lay(sdBox(q - vec2(-0.72, 0.85), vec2(0.27, 0.2)) * s, RUBYD(), base + 18.0, 0.0);
      lay(sdBox(q - vec2(-0.72, 0.93), vec2(0.28, 0.035)) * s, GOLD(), base + 18.0, 0.0);
      float coins = min(min(sdCircle(q - vec2(-1.05, 0.72), 0.2), sdCircle(q - vec2(-0.4, 0.7), 0.15)), sdCircle(q - vec2(-0.95, 1.08), 0.13));
      lay(coins * s, GOLD(), base + 17.0, 9.0);
    }
    if (pose > 3.5) lay(sdSeg(q, hf, vec2(1.25, -0.45), 0.035) * s, UMBERD(), base + 19.0, 0.0); // oar
    lay(hullD(bq / b, 1.32, 0.42) * b * s, UMBER(), base + 16.0, 2.2);
    vec3 trim = k == 5 ? SILVERD() : (k == 0 ? GOLD() : robeCol(k));
    lay(max(hullD(bq / b, 1.32, 0.42), -(bq.y / b + 0.09)) * b * s, trim, base + 17.0, 0.0);
    if (k == 3) for (int i = 0; i < 6; i++) {
      float fi = float(i);
      lay(sdCircle(bq - vec2(-1.0 + fi * 0.4, 0.02), 0.07) * s, mod(fi, 2.0) < 0.5 ? srgb(250., 160., 200.) : GOLD(), base + 11.0, 0.0);
    }
  }
}

// ---- picture ----
void picture(vec2 p){
  C = vec3(0.0); ID = 0.0; E = 1e3; SC = 0.0;
  float t = uT;
  lay(-1.0, vec3(0.0), 1.0, 1.25); // sky (colour per pane later)
  // the sun on the right
  if (uSun > 0.01) {
    vec2 sp = p - vec2(${f(SUN[0])}, ${f(SUN[1])});
    float r = length(sp);
    float ring = max(r - 1.55 * uSun, 0.66 * uSun - r);
    if (ring < 0.0) {
      float a = atan(sp.y, sp.x) + t * 0.03;
      float k = a / (2.0 * PI / 18.0);
      float fr = fract(k);
      float ad = min(fr, 1.0 - fr) * (2.0 * PI / 18.0) * r;
      float par = mod(floor(k), 2.0);
      C = par < 0.5 ? GOLD() : AMBER(); ID = 20.0 + par; E = min(-ring, ad); SC = 0.0;
    } else E = min(E, ring);
    lay(sdCircle(sp, 0.6 * uSun), GOLD() * 1.25, 22.0, 0.0);
  }
  // storm clouds
  float grow = (1.0 - uStorm) * 1.4;
  float cl = sdCircle(p - vec2(-5.6, 4.1), 1.3);
  cl = smin(cl, sdCircle(p - vec2(-4.1, 4.6), 1.1), 0.5);
  cl = smin(cl, sdCircle(p - vec2(-2.6, 4.9), 0.95), 0.5);
  cl = smin(cl, sdCircle(p - vec2(-1.0, 5.8), 1.0), 0.5);
  cl = smin(cl, sdCircle(p - vec2(1.6, 5.6), 1.0), 0.5);
  cl = smin(cl, sdEll(p - vec2(-4.4, 3.2), vec2(2.4, 0.5)), 0.4);
  lay(cl + grow, mix(srgb(150., 165., 210.), srgb(58., 68., 120.), uStorm), 23.0, 1.6);
  float cl2 = sdCircle(p - vec2(-5.0, 4.4), 0.8);
  cl2 = smin(cl2, sdCircle(p - vec2(-3.7, 4.95), 0.7), 0.4);
  lay(cl2 + grow, mix(srgb(200., 210., 235.), srgb(92., 104., 160.), uStorm), 24.0, 1.8);
  float cr = sdEll(p - vec2(5.5, 2.35), vec2(1.5, 0.32));
  cr = smin(cr, sdCircle(p - vec2(4.3, 2.35), 0.38), 0.3);
  lay(cr, mix(srgb(220., 214., 230.), srgb(120., 120., 160.), uStorm * 0.7), 25.0, 1.8);
  // small calm-day cloud
  lay(sdEll(p - vec2(-1.2, 3.4), vec2(0.9, 0.22)) + uStorm * 2.0, srgb(225., 232., 245.), 25.5, 1.8);
  if (uFlash > 0.05) {
    float lx = -4.4 + 3.2 * floor(mod(t * 0.37, 3.0));
    vec2 lp = p - vec2(lx, 0.0);
    float lt = sdSeg(lp, vec2(-0.2, 3.6), vec2(0.25, 2.85), 0.05);
    lt = min(lt, sdSeg(lp, vec2(0.25, 2.85), vec2(-0.15, 2.6), 0.05));
    lt = min(lt, sdSeg(lp, vec2(-0.15, 2.6), vec2(0.35, 1.6), 0.045));
    lay(lt, GOLD() * (1.0 + uFlash), 26.0, 0.0);
  }
  // heart medallion in the crown of the centre lancet
  vec2 mp = p - vec2(${f(HEART[0])}, ${f(HEART[1])});
  lay(sdCircle(mp, 0.95), GOLD(), 27.0, 0.0);
  lay(sdCircle(mp, 0.83), AMBER(), 28.0, 0.0);
  {
    float rr = length(mp);
    if (rr < 0.83) {
      float a = atan(mp.y, mp.x) + uT * 0.02;
      float k = a / (2.0 * PI / 12.0);
      float fr = fract(k);
      E = min(E, min(fr, 1.0 - fr) * (2.0 * PI / 12.0) * rr + step(rr, 0.25) * 9.0);
      if (mod(floor(k), 2.0) < 0.5) C = GOLD();
    }
  }
  lay(sdHeart((mp - vec2(0.0, -0.42)) / 0.78) * 0.78, RUBY(), 29.0, 0.0);
  // sea to the horizon
  float calmK = 1.0 - uStorm;
  lay(p.y - (HZ + 0.03 * sin(p.x * 3.0)), mix(SAPH(), AZURE(), calmK * 0.4), 60.0, 1.4);
  for (int k = 1; k < 7; k++) {
    float fk = float(k);
    float amp = 0.04 + 0.08 * uStorm;
    float yb = HZ - fk * 0.5 + amp * sin(p.x * (1.4 + fk * 0.3) + fk * 1.7 + t * (0.5 + 0.25 * fk) * (0.4 + uStorm));
    vec3 cc = mod(fk, 2.0) < 0.5 ? SAPH() : AZURE() * 0.9;
    lay(p.y - yb, mix(cc, cc * 1.25, calmK * 0.5), 60.0 + fk, 1.5);
  }
  // home island (centre lancet) with a palm
  float isl = sdEll(p - vec2(0.0, -2.35 + uIsle1), vec2(2.2, 0.8));
  lay(isl, UMBER(), 90.0, 2.4);
  lay(max(isl, -(p.y + 1.66 - uIsle1 - 0.05 * sin(p.x * 4.0))), SAND(), 91.0, 2.6);
  vec2 tp = p - vec2(-1.75, -1.9 + uIsle1);
  float lean = 0.25 * uStorm + 0.06 * uStorm * sin(t * 2.2);
  tp = rot(lean) * tp;
  float trunk = sdSeg(tp, vec2(0.0), vec2(0.15, 1.6), 0.07);
  trunk = min(trunk, sdSeg(tp, vec2(0.15, 1.6), vec2(0.42, 2.9), 0.06));
  lay(trunk, UMBERD(), 92.0, 3.0);
  vec2 crown = tp - vec2(0.42, 2.9);
  for (int k = 0; k < 6; k++) {
    float fk = float(k);
    float ang = -(0.3 + fk * 0.62) + 0.1 * sin(t * 1.5 + fk) * (0.3 + uStorm);
    vec2 fq = rot(-ang) * crown;
    lay(sdEll(fq - vec2(0.42, 0.0), vec2(0.45, 0.1)), mod(fk, 2.0) < 0.5 ? EMER() : EMERL(), 93.0 + fk, 0.0);
  }
  // the nearest island, rising in the right lancet after the rescue
  if (uIsle2 > 0.01) {
    float i2 = sdEll(p - vec2(4.75, -3.45 + 1.05 * uIsle2), vec2(1.75, 0.75));
    lay(i2, srgb(120., 84., 40.), 96.0, 2.4);
    lay(max(i2, -(p.y + 2.62 - 1.05 * uIsle2 - 0.04 * sin(p.x * 5.0))), EMERL(), 97.0, 3.0);
    for (int k = 0; k < 3; k++) {
      float fk = float(k);
      lay(sdCircle(p - vec2(5.7 + fk * 0.35, -2.55 + 1.05 * uIsle2 + 0.1 * fk), 0.12) + (1.0 - uIsle2), mod(fk, 2.0) < 0.5 ? GOLD() : ROSE(), 98.0, 0.0);
    }
  }
  // characters standing on land (in front of the island, behind the near sea)
  for (int k = 0; k < 7; k++) if (uCh[k].w < 0.5) figure(p, k, 0);
  // the rising sea in front
  float wv = uWater + (0.04 + 0.06 * uStorm) * sin(p.x * 2.4 + t * 1.6) + 0.05 * uStorm * sin(p.x * 5.1 - t * 2.3);
  lay(p.y - wv, mix(COBALT(), SAPH(), calmK * 0.6), 100.0, 1.7);
  lay(max(p.y - wv, -(p.y - wv + 0.15)), PALE(), 101.0, 3.5);
  lay(p.y - (wv - 0.7 + 0.08 * sin(p.x * 1.9 - t)), SAPH() * 0.85, 102.0, 1.6);
  // boats float on the sea; Time's boat last, carrying Love when she climbs in
  for (int k = 1; k < 7; k++) if (k != 5 && uCh[k].w >= 0.5) figure(p, k, 2);
  if (uCh[5].w >= 0.5) {
    figure(p, 5, 0);
    if (uCh[0].w >= 0.5) figure(p, 0, 0);
    figure(p, 5, 1);
  }
  float fw = ${f(SILL)} + 0.6 + 0.07 * sin(p.x * 3.3 + t * (0.6 + uStorm));
  lay(p.y - fw, mix(COBALT() * 0.9, SAPH(), calmK * 0.5), 105.0, 1.5);
  lay(max(p.y - fw, -(p.y - fw + 0.1)), PALE() * 0.9, 106.0, 4.0);
  // border of small jewel panes inside each lancet
  float wd = windowD(p);
  float bd = max(wd, -(wd + 0.2));
  if (bd < 0.0) { C = vec3(0.0); ID = 200.0; E = -bd; SC = 4.2; } else E = min(E, bd);
}

vec3 skyColour(vec2 c){
  float warm = smoothstep(0.5, 4.8, c.x) * smoothstep(-0.5, 2.5, c.y) * uSun;
  float n = hash1(floor(c * 3.0));
  vec3 storm = mix(COBALT(), VIOLET(), 0.35 + 0.35 * n);
  storm = mix(storm, SAPH() * 1.1, smoothstep(0.0, 4.0, c.y) * 0.2);
  vec3 calm = mix(AZURE(), PALE(), smoothstep(0.5, 5.5, c.y)) * (0.95 + 0.1 * n);
  vec3 base = mix(calm, storm, uStorm);
  float n2 = hash1(floor(c * 2.3) + 5.0);
  base = mix(base, mix(PALE(), AZURE(), 0.5) * mix(1.0, 0.7, uStorm), step(0.86, n2) * 0.7);
  float sd = length(c - vec2(${f(SUN[0])}, ${f(SUN[1])}));
  vec3 glow = mix(GOLD(), mix(AMBER(), PALE(), 0.4), smoothstep(1.2, 3.6, sd));
  return mix(base, glow, warm * (1.0 - smoothstep(1.4, 4.4, sd)) * 0.95);
}

vec4 voro(vec2 x){
  vec2 n = floor(x), fx = fract(x);
  vec2 mg, mr; float md = 8.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 g = vec2(float(i), float(j));
    vec2 o = 0.15 + 0.7 * hash2(n + g);
    vec2 r = g + o - fx;
    float d = dot(r, r);
    if (d < md) { md = d; mr = r; mg = g; }
  }
  md = 8.0;
  for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++) {
    vec2 g = mg + vec2(float(i), float(j));
    vec2 o = 0.15 + 0.7 * hash2(n + g);
    vec2 r = g + o - fx;
    if (dot(mr - r, mr - r) > 0.00001) md = min(md, dot(0.5 * (mr + r), normalize(r - mr)));
  }
  vec2 cid = n + mg;
  vec2 centre = cid + 0.15 + 0.7 * hash2(cid);
  return vec4(md, hash1(cid), centre);
}

// grisaille paint on the figures
float paint(vec2 p){
  float sh = 1.0;
  if (ID == 1.0 && uStorm > 0.3) { // rain
    float rl = abs(fract((p.x + p.y * 0.35) * 5.0 + uT * 3.0) - 0.5);
    sh *= mix(1.0, mix(0.72, 1.0, smoothstep(0.0, 0.05, rl)), uStorm);
  }
  if (ID == 90.0 || ID == 96.0) { float st = abs(sin(p.y * 38.0 + sin(p.x * 3.0) * 1.5)); sh *= mix(0.72, 1.0, smoothstep(0.0, 0.25, st)); }
  if (ID < 300.0) return sh;
  int k = int(floor((ID - 300.0) / 20.0 + 0.001));
  float part = ID - 300.0 - float(k) * 20.0;
  vec2 q = localQ(p, k);
  vec2 hp = headPos(k);
  float talk = uPo[k].w;
  if (part > 5.5 && part < 6.5) { // face
    vec2 f = q - hp;
    float d;
    bool closed = (k == 4) || (k == 0 && uPo[0].y > 2.5 && uPo[0].y < 3.5);
    if (closed) d = sdSeg(f, vec2(0.05, 0.0), vec2(0.13, -0.015), 0.008);
    else d = min(sdSeg(f, vec2(0.065, 0.02), vec2(0.13, 0.015), 0.012), sdCircle(f - vec2(0.105, 0.018), 0.018));
    d = min(d, sdSeg(f, vec2(0.04, 0.075), vec2(0.13, 0.065), 0.007));          // brow
    if (k == 5) d = min(d, sdSeg(f, vec2(0.0, 0.11), vec2(0.12, 0.11), 0.006)); // wrinkle
    d = min(d, sdSeg(f, vec2(0.12, 0.0), vec2(0.15, -0.04), 0.006));            // nose
    float m = talk > 0.05 ? sdEll(f - vec2(0.1, -0.085), vec2(0.035, 0.008 + 0.03 * talk)) : sdSeg(f, vec2(0.075, -0.085), vec2(0.12, (k == 4 || k == 0) ? -0.095 : -0.08), 0.007);
    if (k != 5) d = min(d, m);
    sh *= mix(0.25, 1.0, smoothstep(0.0, 0.012, d));
  }
  if (part > 2.5 && part < 3.5) { // robe folds
    float d = 1e3;
    for (int i = -2; i <= 2; i++) d = min(d, sdSeg(q, vec2(float(i) * 0.05, 1.1), vec2(float(i) * 0.17, 0.05), 0.006));
    sh *= mix(0.55, 1.0, smoothstep(0.0, 0.03, d));
  }
  if (part < 0.5 || (part > 6.5 && part < 7.5) || (part > 9.5 && part < 10.5)) { // hair / beard strands
    float st = abs(sin((q.x * 3.0 + q.y * 1.2) * 40.0));
    sh *= mix(0.78, 1.0, smoothstep(0.0, 0.4, st));
  }
  if (part > 15.5 && part < 16.5) { float st = abs(sin(q.y * 30.0)); sh *= mix(0.7, 1.0, smoothstep(0.0, 0.25, st)); }
  if (k == 5 && part > 9.5 && part < 10.5 && talk > 0.05) { // Time speaks through the beard
    float m = sdEll(q - hp - vec2(0.1, -0.1), vec2(0.035, 0.01 + 0.025 * talk));
    sh *= mix(0.3, 1.0, smoothstep(0.0, 0.01, m));
  }
  return sh;
}

void main(){
  vec2 p = uOrigin + vUv * uSize;
  picture(p);
  vec3 col = C;
  float cellEdge = 9.0;
  float h = 0.5;
  vec2 cc = p;
  if (SC > 0.0) {
    vec4 v = voro(p * SC + ID * 7.13);
    cellEdge = v.x / SC;
    h = v.y;
    cc = (v.zw - ID * 7.13) / SC;
  }
  if (ID == 1.0) col = skyColour(cc);
  if (ID == 200.0) { float b = floor(h * 3.0); col = b < 1.0 ? RUBY() : b < 2.0 ? SAPH() : GOLD(); }
  float e = min(E, cellEdge);
  col *= 0.92 + 0.16 * h;
  vec2 sp = rot(h * 6.28) * p;
  float streak = vnoise(sp * vec2(2.5, 26.0)) * 0.6 + vnoise(sp * vec2(7.0, 60.0)) * 0.4;
  col *= 0.86 + 0.26 * streak;
  float bub = smoothstep(0.93, 0.98, vnoise(p * 55.0 + h * 13.0));
  col += bub * 0.08;
  float lw = 0.032;
  col *= mix(0.62, 1.0, smoothstep(lw, lw + 0.11, e));
  col *= paint(p);
  // brightness: figures by focus, medallion by the story, everything else by uBg
  float b = uBg * (1.0 + uFlash * 0.7);
  if (ID >= 300.0) { int k = int(floor((ID - 300.0) / 20.0 + 0.001)); b = 0.72 + 0.5 * uPo[k].z; }
  else if (ID >= 27.0 && ID <= 29.0) b = uHeart;
  else if (ID >= 20.0 && ID <= 22.0) b = max(uBg, 0.9);
  float lf = 0.85 + 0.3 * smoothstep(-2.0, 5.0, p.x) * uSun + 0.25 * smoothstep(1.5, 0.0, length(p - vec2(${f(SUN[0])}, ${f(SUN[1])}))) * uSun;
  float lit = clamp((uReveal - length(cc - vec2(${f(HEART[0])}, ${f(HEART[1])}))) / 1.2, 0.0, 1.0);
  vec3 lin = pow(max(col, 0.0), vec3(2.2)) * uGlow * lf * b * mix(0.03, 1.0, lit) * uDim;
#ifdef POOL
  float inside = 1.0 - smoothstep(-0.05, 0.05, windowD(p));
  vec2 edge = smoothstep(vec2(0.0), vec2(0.12), vUv) * smoothstep(vec2(0.0), vec2(0.12), 1.0 - vUv);
  gl_FragColor = vec4(lin * inside * edge.x * edge.y * uPoolAmt, 1.0);
#else
  float lead = 1.0 - smoothstep(lw - 0.006, lw, e);
  vec3 leadCol = vec3(0.012, 0.012, 0.014) + vec3(0.03) * smoothstep(lw, 0.0, e) * 0.6;
  gl_FragColor = vec4(mix(lin, leadCol, lead), 1.0);
#endif
}
`;

export const GLASS_FRAG = FRAG_BODY;
export const POOL_FRAG = "#define POOL\n" + FRAG_BODY;
