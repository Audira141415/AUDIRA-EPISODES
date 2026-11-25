// EP02 film world: the cover's Merauke thermal field (same coast, rivers, fire fronts, hotspots),
// extended with story uniforms: hotspot surge, explicit swamp that dries, rain front + flood,
// concession zone, satellite pixel view, and the two area squares (63 ha vs 25.000 ha).
// Cover.tsx is left untouched; this is a copy of its GLSL with the extra uniforms.
import * as THREE from "three";

// world anchors (x, z on the ground plane; 1 unit ≈ 2 km in the area shot)
export const MERAUKE = new THREE.Vector3(-2.7, 0.05, -5.6);
export const RAWA = { x: 2.8, z: -0.6, rx: 2.3, rz: 1.5 };
export const VILLAGE = { x: -1.2, z: 1.8, r: 0.95 };
export const CONC = { x: 7.2, z: -12.2, hx: 2.7, hz: 1.9, ang: 0.35 };
export const AREA = { x: 3.0, z: -8.6 };
export const KM_PER_UNIT = 2;
// 63 ha = 0.63 km2 -> side 0.794 km; 25.000 ha = 250 km2 -> side 15.81 km
export const SQ_SMALL_HALF = Math.sqrt(0.63) / KM_PER_UNIT / 2;
export const SQ_BIG_HALF = Math.sqrt(250) / KM_PER_UNIT / 2;

export const GLSL_COMMON = /* glsl */ `
float hash21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash21(i),hash21(i+vec2(1,0)),u.x), mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float a=0.5, s=0.0; for(int k=0;k<5;k++){ s+=a*vnoise(p); p=p*2.03+vec2(17.1,9.7); a*=0.5; } return s; }
vec3 ironbow(float t){
  t = clamp(t, 0.0, 1.0);
  vec3 c0=vec3(0.01,0.01,0.05), c1=vec3(0.07,0.03,0.33), c2=vec3(0.30,0.05,0.55), c3=vec3(0.66,0.09,0.50),
       c4=vec3(0.90,0.25,0.15), c5=vec3(0.97,0.55,0.07), c6=vec3(0.99,0.82,0.22), c7=vec3(1.0,0.98,0.88);
  if(t<0.14) return mix(c0,c1,t/0.14);
  if(t<0.30) return mix(c1,c2,(t-0.14)/0.16);
  if(t<0.45) return mix(c2,c3,(t-0.30)/0.15);
  if(t<0.60) return mix(c3,c4,(t-0.45)/0.15);
  if(t<0.72) return mix(c4,c5,(t-0.60)/0.12);
  if(t<0.86) return mix(c5,c6,(t-0.72)/0.14);
  return mix(c6,c7,(t-0.86)/0.14);
}
float coastX(float z){ return -4.5 + sin(z*0.21)*0.8 + (fbm(vec2(z*0.12, 3.0))-0.5)*1.8 - z*0.06; }
float riverDist(vec2 p){
  float cz = -5.9 + sin(p.x*0.42)*1.1 + sin(p.x*0.17+1.3)*1.8 + (fbm(p*0.25)-0.5)*1.0 - p.x*0.10;
  return abs(p.y - cz);
}
float river2Dist(vec2 p){
  float cx = 6.0 + sin(p.y*0.33)*1.4 + (fbm(p*0.3+5.0)-0.5)*1.4 - p.y*0.12;
  return abs(p.x - cx);
}
float hgt(vec2 p){
  float sea = 1.0 - smoothstep(coastX(p.y)-0.5, coastX(p.y)+0.3, p.x);
  float h = 0.35*fbm(p*0.18) + 0.08*fbm(p*0.9);
  h -= 0.22*(1.0 - smoothstep(0.1, 0.6, riverDist(p)));
  return mix(h, -0.12, sea);
}
`;

const HEAT = /* glsl */ `
uniform float uFire;   // hotspot amount (1 = 11 Okt, >1 surge)
uniform float uDry;    // explicit swamp: 0 wet (fire break), 1 dry
uniform float uRainX;  // rain front x: ground west of it is cooled
uniform float uFlood;  // rivers and swamps swell
uniform float uConc;   // concession zone hotspot concentration
uniform vec3 uClear;   // village clearing (x, z, r)
const vec2 RAWA_C = vec2(${RAWA.x.toFixed(2)}, ${RAWA.z.toFixed(2)});
const vec2 RAWA_R = vec2(${RAWA.rx.toFixed(2)}, ${RAWA.rz.toFixed(2)});
const vec2 CONC_C = vec2(${CONC.x.toFixed(2)}, ${CONC.z.toFixed(2)});
const vec2 CONC_H = vec2(${CONC.hx.toFixed(2)}, ${CONC.hz.toFixed(2)});
const float CONC_A = ${CONC.ang.toFixed(3)};
vec2 concQ(vec2 p){ vec2 q = p - CONC_C; float c = cos(CONC_A), s = sin(CONC_A); return vec2(c*q.x + s*q.y, -s*q.x + c*q.y); }
float rawaMask(vec2 p){
  vec2 d = (p - RAWA_C) / RAWA_R;
  float r = length(d) + (fbm(p*1.3+2.0)-0.5)*0.45;
  return 1.0 - smoothstep(0.85, 1.05, r);
}
float heat(vec2 p, float time, out float hot){
  hot = 0.0;
  float cx = coastX(p.y);
  float sea = 1.0 - smoothstep(cx-0.35, cx+0.25, p.x);
  float n = fbm(p*0.22);
  float n2 = fbm(p*1.1+3.1);
  float T = 0.22 + 0.10*n + 0.05*(n2-0.5);
  float sw = smoothstep(0.56, 0.68, fbm(p*0.16+vec2(11.0,4.0)));
  T = mix(T, 0.12 + 0.03*n2, sw);
  // the explicit story swamp: cold and wet, then dry and warm
  float rw = rawaMask(p);
  float wetRw = rw * (1.0 - uDry);
  T = mix(T, mix(0.08 + 0.03*n2, 0.64 + 0.06*n2, uDry), rw);
  float rd = riverDist(p);
  float rv = 1.0 - smoothstep(0.16 + uFlood*0.55, 0.30 + uFlood*0.8, rd);
  float bank = (1.0 - smoothstep(0.30, 0.55, rd)) - rv;
  float rd2 = river2Dist(p);
  float rv2 = 1.0 - smoothstep(0.08 + uFlood*0.4, 0.17 + uFlood*0.6, rd2);
  float chN = abs(fbm(p*0.55+vec2(7.0,2.0)) - 0.5);
  float chan = (1.0 - smoothstep(0.006 + uFlood*0.03, 0.022 + uFlood*0.05, chN)) * (0.35 + 0.65*sw);
  float water = max(max(rv, rv2*0.95), chan*0.9);
  water = max(water, sw*uFlood*0.85);
  water = max(water, wetRw*0.55);
  T += 0.05*bank;
  T = mix(T, 0.05 + 0.02*n2, water);
  vec2 tp = p - vec2(-2.7, -5.6);
  float town = 1.0 - smoothstep(0.9, 1.6, length(tp*vec2(1.0,1.3)));
  vec2 g = abs(fract(tp*3.2)-0.5);
  float streets = 1.0 - smoothstep(0.03, 0.09, min(g.x, g.y));
  T = mix(T, 0.40 + 0.18*streets + 0.08*hash21(floor(tp*3.2)), town*0.85);
  // village clearing: cool trampled ground, warm hut grid
  float clr = 1.0 - smoothstep(uClear.z*0.6, uClear.z, length(p - uClear.xy));
  T = mix(T, 0.20 + 0.04*n2, clr*0.9);

  float scar = 0.0, front = 0.0, charTex = 0.5;
  for(int i=0;i<6;i++){
    float fi = float(i);
    vec2 o = vec2(1.0 + mod(fi*3.7, 9.0), -1.5 - fi*3.6);
    float ang = 0.45 + fi*0.27;
    vec2 dir = vec2(cos(ang), sin(ang));
    vec2 nrm = vec2(-dir.y, dir.x);
    vec2 q = p - o;
    float along = dot(q, dir);
    float len = 6.5 + fi*1.6;
    float alongMask = 1.0 - smoothstep(len*0.7, len, abs(along));
    float s = dot(q, nrm) + (fbm(vec2(along*0.35, fi*7.0))-0.5)*2.2 + sin(along*0.9+fi)*0.35;
    float width = 0.055 + 0.035*vnoise(vec2(along*2.0+time*1.5, fi));
    float band = (1.0 - smoothstep(width*0.4, width, abs(s))) * alongMask;
    float behind = (1.0 - smoothstep(-0.3, 0.0, s)) * (1.0 - smoothstep(0.6, 2.4 + fi*0.5, -s)) * alongMask;
    front = max(front, band);
    float sc0 = behind * (0.6 + 0.4*fbm(p*1.7+fi));
    if(sc0 > scar){ charTex = fbm(vec2(along*0.45, s*3.2) + fi*3.0); }
    scar = max(scar, sc0);
  }
  // a wet swamp stops the front; a dry one lets it through
  float block = 1.0 - wetRw*0.97;
  scar *= (1.0 - water) * block; front *= (1.0 - water) * block * (1.0 - clr);
  float ash = smoothstep(0.42, 0.62, charTex);
  float scarT = 0.30 + 0.24*ash + 0.06*(n2-0.5);
  T = mix(T, scarT, scar*0.9);
  float pocket = 0.8*smoothstep(0.74, 0.88, fbm(p*2.6+vec2(time*0.05,0.0))) * scar;
  T = max(T, mix(T, 0.70, pocket));
  float flick = 0.85 + 0.15*vnoise(p*6.0 + vec2(time*4.0, 0.0));
  T = max(T, mix(T, 0.74 + 0.08*flick, front));

  vec2 cq = concQ(p);
  float inConc = (1.0 - smoothstep(-0.1, 0.25, abs(cq.x) - CONC_H.x)) * (1.0 - smoothstep(-0.1, 0.25, abs(cq.y) - CONC_H.y));
  for(int k=0;k<2;k++){
    float sc = k==0 ? 2.2 : 4.6;
    vec2 cp = p*sc;
    vec2 cell = floor(cp);
    float r = hash21(cell + float(k)*31.0);
    vec2 c = vec2(hash21(cell+7.3), hash21(cell+1.9))*0.7+0.15;
    float density = (k==0 ? 0.86 : 0.91) - 0.18*scar - 0.10*smoothstep(0.55,0.75,n);
    density -= (uFire - 1.0) * 0.22;
    density -= uConc * inConc * 0.30;
    density += clr;
    float on = step(density, r) * (1.0 - water);
    float d = length(fract(cp)-c);
    float rad = (k==0 ? 0.11 : 0.15) * (0.6 + 0.6*hash21(cell+3.3));
    float core = (1.0 - smoothstep(rad*0.35, rad, d)) * on;
    float halo = (1.0 - smoothstep(rad, rad*2.6, d)) * on;
    float tw = 0.85 + 0.15*sin(time*6.0 + r*40.0);
    T = max(T, mix(T, 0.62, halo*0.55));
    T = max(T, mix(T, 0.97*tw + 0.03, core));
    hot = max(hot, core);
  }
  // rain front (outro): the ground west of uRainX cools; a few embers survive
  float rain = 1.0 - smoothstep(uRainX - 2.0, uRainX + 2.0, p.x + (fbm(p*0.3)-0.5)*3.0);
  float ember = step(0.93, hash21(floor(p*4.6))) * 0.6;
  T = mix(T, max(0.14 + 0.05*n2, T*ember), rain*0.88);
  hot *= 1.0 - rain*(1.0 - ember);
  float seaT = 0.06 + 0.025*fbm(p*vec2(0.4,1.6) + vec2(time*0.03,0.0));
  T = mix(T, seaT, sea);
  hot *= (1.0 - sea);
  return T;
}
`;

export const terrainVert = /* glsl */ `
${GLSL_COMMON}
varying vec2 vP; varying float vDepth;
void main(){
  vec3 pos = position;
  vec2 p = pos.xz;
  pos.y = hgt(p);
  vP = p;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

export const terrainFrag = /* glsl */ `
${GLSL_COMMON}
${HEAT}
uniform float uTime;
uniform float uPix;     // satellite pixel view strength
uniform vec3 uPixC;     // (x, z, radius) of the scanned footprint
uniform vec4 uSqA;      // small square: cx, cz, half, alpha
uniform vec4 uSqB;      // big square: cx, cz, half, alpha
uniform float uConcLine;// concession outline alpha
uniform float uHaze;    // extra smoke haze
varying vec2 vP; varying float vDepth;
float outline(vec2 p, vec2 c, float h, float w){
  vec2 d = abs(p - c) - vec2(h);
  float edge = abs(max(d.x, d.y));
  return 1.0 - smoothstep(w*0.5, w, edge);
}
void main(){
  float hot;
  float T = heat(vP, uTime, hot);
  float grid = 0.0;
  if(uPix > 0.001){
    float cell = 0.55;
    vec2 pq = (floor(vP / cell) + 0.5) * cell;
    float hq;
    float Tq = heat(pq, uTime, hq);
    float m = (1.0 - smoothstep(uPixC.z*0.8, uPixC.z, length(vP - uPixC.xy))) * uPix;
    T = mix(T, Tq, m);
    hot = mix(hot, hq, m);
    vec2 gq = abs(fract(vP / cell) - 0.5);
    grid = (1.0 - smoothstep(0.46, 0.49, max(gq.x, gq.y))) ;
    grid = (1.0 - grid) * m;
  }
  float wetB = rawaMask(vP) * (1.0 - uDry);
  float e = 0.03;
  float h0 = hgt(vP) + 0.035*fbm(vP*5.0);
  float hx = hgt(vP+vec2(e,0.0)) + 0.035*fbm((vP+vec2(e,0.0))*5.0);
  float hz = hgt(vP+vec2(0.0,e)) + 0.035*fbm((vP+vec2(0.0,e))*5.0);
  vec3 N = normalize(vec3(-(hx-h0)/e*2.5, 1.0, -(hz-h0)/e*2.5));
  float lam = clamp(dot(N, normalize(vec3(-0.6,0.55,-0.35))), 0.0, 1.0);
  float shade = 0.55 + 0.75*lam;
  vec3 col = ironbow(T) * mix(shade, 1.0, hot);
  col *= 1.0 + hot*0.55;
  col = mix(col, vec3(0.10, 0.22, 0.75) * shade, wetB * 0.7);
  float haze = smoothstep(14.0, 42.0, vDepth);
  col = mix(col, vec3(0.20,0.05,0.32), clamp(haze*0.6 + uHaze*0.25, 0.0, 0.9));
  // HUD drawn on the ground (cyan)
  vec3 cyan = vec3(0.0, 0.9, 1.0);
  col = mix(col, cyan*0.9, grid*0.55);
  float sa = outline(vP, uSqA.xy, uSqA.z, 0.035) * uSqA.w;
  float sb = outline(vP, uSqB.xy, uSqB.z, 0.10) * uSqB.w;
  vec2 da = abs(vP - uSqA.xy); float fa = step(max(da.x, da.y), uSqA.z) * uSqA.w;
  vec2 db = abs(vP - uSqB.xy); float fb = step(max(db.x, db.y), uSqB.z) * uSqB.w;
  col = mix(col, col*0.75 + cyan*0.10, fb*0.5);
  col = mix(col, col*0.6 + vec3(1.0,0.85,0.25)*0.35, fa*0.6);
  col = mix(col, cyan, sb*0.85);
  col = mix(col, vec3(1.0,0.86,0.3)*1.2, sa);
  // concession outline: dashed yellow rectangle
  vec2 cq = concQ(vP);
  vec2 dq = abs(cq) - CONC_H;
  float ce = abs(max(dq.x, dq.y));
  float along = (abs(dq.x) < abs(dq.y)) ? cq.x : cq.y;
  float dash = step(0.5, fract((cq.x + cq.y) * 1.6));
  float cl = (1.0 - smoothstep(0.03, 0.07, ce)) * dash * uConcLine;
  col = mix(col, vec3(1.0, 0.86, 0.25)*1.3, cl);
  col = max(col, vec3(0.0));
  gl_FragColor = vec4(pow(col, vec3(2.2)), 1.0);
}`;

export const plumeVert = /* glsl */ `
varying vec2 vUv; varying float vWY;
void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.0); vWY = w.y; gl_Position = projectionMatrix * viewMatrix * w; }`;
export const plumeFrag = /* glsl */ `
${GLSL_COMMON}
uniform float uTime; uniform float uSeed; uniform float uWarm; uniform float uAlpha;
varying vec2 vUv; varying float vWY;
void main(){
  vec2 c = vUv - 0.5;
  float r = length(c)*2.0;
  float n = fbm(c*3.2 + uSeed + vec2(-uTime*0.12, uTime*0.18));
  float n2 = fbm(c*7.0 + uSeed*1.7 + vec2(uTime*0.2, 0.0));
  float d = r + (n-0.5)*0.75 + (n2-0.5)*0.25;
  float a = 1.0 - smoothstep(0.25, 0.95, d);
  a *= 1.0 - smoothstep(0.80, 1.0, r);
  a *= smoothstep(0.0, 0.7, vWY);
  a *= 0.55 + 0.6*n;
  float core = 1.0 - smoothstep(0.0, 0.7, d);
  float T = uWarm + 0.10*core + 0.08*(n2-0.5);
  vec3 col = ironbow(T);
  gl_FragColor = vec4(pow(col, vec3(2.2)), clamp(a*uAlpha, 0.0, 1.0));
}`;

// Plume anchors on the fire fronts (same formula as the shader).
export const ANCHORS: { x: number; z: number; h: number; seed: number }[] = [];
for (let i = 0; i < 6; i++) {
  const ox = 1.0 + ((i * 3.7) % 9.0), oz = -1.5 - i * 3.6, ang = 0.45 + i * 0.27;
  for (const [k, along] of [-2.6, 1.8].entries()) {
    ANCHORS.push({ x: ox + Math.cos(ang) * along, z: oz + Math.sin(ang) * along, h: 3.2 + ((i * 7 + k * 3) % 5) * 0.7, seed: i * 3.1 + k * 1.7 });
  }
}

// CPU copy of the ground height (for placing objects on the terrain).
const h21 = (x: number, y: number) => {
  let px = x * 123.34 - Math.floor(x * 123.34), py = y * 456.21 - Math.floor(y * 456.21);
  const d = px * (px + 45.32) + py * (py + 45.32);
  px += d; py += d;
  const v = px * py;
  return v - Math.floor(v);
};
const vn = (x: number, y: number) => {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = h21(ix, iy), b = h21(ix + 1, iy), c = h21(ix, iy + 1), d = h21(ix + 1, iy + 1);
  return (a + (b - a) * ux) * (1 - uy) + (c + (d - c) * ux) * uy;
};
const fbmCpu = (x: number, y: number) => {
  let a = 0.5, s = 0;
  for (let k = 0; k < 5; k++) { s += a * vn(x, y); x = x * 2.03 + 17.1; y = y * 2.03 + 9.7; a *= 0.5; }
  return s;
};
const sstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const groundY = (x: number, z: number) => {
  const cx = -4.5 + Math.sin(z * 0.21) * 0.8 + (fbmCpu(z * 0.12, 3.0) - 0.5) * 1.8 - z * 0.06;
  const sea = 1 - sstep(cx - 0.5, cx + 0.3, x);
  const cz = -5.9 + Math.sin(x * 0.42) * 1.1 + Math.sin(x * 0.17 + 1.3) * 1.8 + (fbmCpu(x * 0.25, z * 0.25) - 0.5) * 1.0 - x * 0.1;
  let h = 0.35 * fbmCpu(x * 0.18, z * 0.18) + 0.08 * fbmCpu(x * 0.9, z * 0.9);
  h -= 0.22 * (1 - sstep(0.1, 0.6, Math.abs(z - cz)));
  return h + (-0.12 - h) * sea;
};
