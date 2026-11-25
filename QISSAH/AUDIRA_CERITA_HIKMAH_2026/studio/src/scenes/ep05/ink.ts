// INK WASH shading for EP05: every surface is "paper + ink density", never lit plastic.
// Shared uniforms (fog, time, underwater) are mutated once per frame by the Scene before render.
import * as THREE from "three";

export const PAL = {
  paper: "#efe7d6",
  paperDeep: "#e2d7c0",
  ink: "#161514",
  inkSoft: "#3a3834",
  wash: "#6d6a62",
  indigo: "#2f3a48",
  mist: "#d9d2c2",
  cinnabar: "#b8321f",
  cinnabarDark: "#8a2216",
  moss: "#4a5a3a",
  deep: "#6a7f8e",
  deepMid: "#a3b3bc",
} as const;

export const G = {
  uTime: { value: 0 },
  uFogColor: { value: new THREE.Color(PAL.paper) },
  uFogNear: { value: 12 },
  uFogFar: { value: 90 },
  uUnder: { value: 0 },
  uPaper: { value: new THREE.Color(PAL.paper) },
  uDeep: { value: new THREE.Color(PAL.deep) },
};

export const NOISE = /* glsl */ `
float h21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),u.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float a=0.5, s=0.0; for(int i=0;i<5;i++){ s+=a*vnoise(p); p=p*2.03+vec2(17.1,9.3); a*=0.5; } return s; }
float h31(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vnoise3(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x), mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x), mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y), f.z); }
`;

const FOG = /* glsl */ `
uniform vec3 uFogColor; uniform float uFogNear; uniform float uFogFar; uniform float uUnder; uniform vec3 uDeep; uniform vec3 uPaper;
vec3 inkFog(vec3 col, vec3 w){
  float d = length(w - cameraPosition);
  float f = smoothstep(uFogNear, uFogFar, d);
  // under water: the deeper the point, the more it sinks into grey-blue ink
  if (uUnder > 0.5) { float dep = clamp(-w.y/14.0, 0.0, 1.0); col = mix(col, col*vec3(0.78,0.85,0.9), 0.45*dep); }
  return mix(col, uFogColor, f);
}
`;

/* ---------- character / rock ink fill ---------- */

const FILL_V = /* glsl */ `
varying vec3 vN; varying vec3 vW; varying vec3 vO;
void main(){ vO = position; vN = normalize(mat3(modelMatrix)*normal); vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }
`;
const FILL_F = /* glsl */ `
${NOISE}
${FOG}
uniform vec3 uTone; uniform float uDark; uniform float uRim; uniform float uPlates; uniform float uGrain; uniform vec3 uTint; uniform float uTintAmt;
varying vec3 vN; varying vec3 vW; varying vec3 vO;
float voronoiEdge(vec3 p){ vec3 b=floor(p), f=fract(p); float d1=8.0, d2=8.0;
  for(int k=-1;k<=1;k++) for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){ vec3 g=vec3(i,j,k); vec3 o=vec3(h31(b+g), h31(b+g+11.3), h31(b+g+27.1));
    float d=length(g+o-f); if(d<d1){ d2=d1; d1=d; } else if(d<d2){ d2=d; } }
  return d2-d1; }
void main(){
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vW);
  float l = dot(n, normalize(vec3(0.35, 0.85, 0.45)))*0.5+0.5;
  float rim = pow(1.0 - abs(dot(n, v)), 2.2);
  float ink = uDark*(0.42 + 0.58*(1.0-l)) + rim*uRim;
  // brush mottling: wet wash pools unevenly
  ink += (fbm(vO.xz*9.0 + vO.y*5.0) - 0.5) * uGrain;
  if (uPlates > 0.0) { float e = voronoiEdge(vO*uPlates); ink = max(ink, smoothstep(0.07, 0.015, e)*0.9); }
  ink = clamp(ink, 0.0, 1.0);
  ink = mix(ink, floor(ink*3.0+0.5)/3.0, 0.7);
  vec3 tone = mix(uTone, uTint, uTintAmt);
  vec3 col = mix(uPaper, tone, ink);
  gl_FragColor = vec4(inkFog(col, vW), 1.0);
}
`;

export type FillOpts = { tone?: string; dark?: number; rim?: number; plates?: number; grain?: number };
export const makeFill = (o: FillOpts = {}) =>
  new THREE.ShaderMaterial({
    vertexShader: FILL_V,
    fragmentShader: FILL_F,
    uniforms: {
      ...G,
      uTone: { value: new THREE.Color(o.tone ?? PAL.ink) },
      uDark: { value: o.dark ?? 0.6 },
      uRim: { value: o.rim ?? 0.45 },
      uPlates: { value: o.plates ?? 0 },
      uGrain: { value: o.grain ?? 0.18 },
      uTint: { value: new THREE.Color(PAL.cinnabar) },
      uTintAmt: { value: 0 },
    },
  });

/* ---------- inverted-hull brush outline ---------- */

const LINE_V = /* glsl */ `
uniform float uWidth; varying vec3 vW; varying vec3 vO;
void main(){ vO = position; vec4 w = modelMatrix*vec4(position,1.0); vec3 nW = normalize(mat3(modelMatrix)*normal);
  float dist = length(w.xyz - cameraPosition);
  w.xyz += nW*uWidth*clamp(0.55 + dist*0.09, 0.6, 3.0);
  vW=w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }
`;
const LINE_F = /* glsl */ `
${NOISE}
${FOG}
uniform vec3 uLine; varying vec3 vW; varying vec3 vO;
void main(){
  // dry-brush breakup along the stroke
  float b = vnoise3(vO*28.0);
  vec3 col = mix(uLine, uPaper, smoothstep(0.78, 0.98, b)*0.55);
  gl_FragColor = vec4(inkFog(col, vW), 1.0);
}
`;
export const makeLine = (width = 0.012, color: string = PAL.ink) =>
  new THREE.ShaderMaterial({
    vertexShader: LINE_V,
    fragmentShader: LINE_F,
    side: THREE.BackSide,
    uniforms: { ...G, uWidth: { value: width }, uLine: { value: new THREE.Color(color) } },
  });

/* ---------- Shan Shui mountain layer (a plane with a painted ridge) ---------- */

const PLANE_V = /* glsl */ `
varying vec2 vUv; varying vec3 vW;
void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }
`;
const MOUNT_F = /* glsl */ `
${NOISE}
uniform float uSeed; uniform float uInk; uniform vec3 uColor; uniform float uPeak; uniform float uBase; uniform float uRough; uniform float uUnder;
varying vec2 vUv; varying vec3 vW;
float ridge(float x){
  float r = uBase;
  // a few tall peaks (Shan Shui verticals) on a rolling chain
  for (int i=0;i<7;i++){ float fi=float(i); float c = h21(vec2(fi, uSeed))*0.94+0.03; float w = 0.022 + h21(vec2(uSeed, fi))*0.05;
    float hgt = uPeak*(0.35 + 0.65*h21(vec2(fi*3.1, uSeed+2.0)));
    float d = abs(x-c)/w; r = max(r, uBase + hgt*exp(-pow(d, 1.25)*0.9)); }
  r += (fbm(vec2(x*7.0, uSeed))-0.5)*0.12*uRough + (vnoise(vec2(x*60.0, uSeed))-0.5)*0.012;
  return r;
}
void main(){
  if (uUnder > 0.5) discard;
  float x = vUv.x, y = vUv.y;
  float h = ridge(x);
  float inside = smoothstep(0.0, 0.006, h - y);
  float d = h - y;
  // ink concentrated at the ridge, washing out downward into mist
  float body = exp(-d*7.0)*0.85 + 0.25*exp(-d*2.0);
  float cun = smoothstep(0.55, 0.85, fbm(vec2(x*38.0, y*5.0 + uSeed)));     // vertical texture strokes (cun)
  float dots = smoothstep(0.82, 0.9, vnoise(vec2(x*160.0, y*90.0+uSeed)))*smoothstep(0.08, 0.0, d); // moss dots on the crest
  float a = inside*(body + cun*0.35*exp(-d*3.0) + dots*0.8);
  a *= smoothstep(0.02, 0.32, y);       // mist swallows the foot
  a *= 0.8 + 0.4*fbm(vec2(x*5.0, y*4.0)); // uneven wet wash
  a = clamp(a*uInk, 0.0, 0.95);
  gl_FragColor = vec4(uColor, a);
}
`;
export const makeMountain = (seed: number, ink: number, color: string, peak = 0.55, base = 0.28, rough = 1) =>
  new THREE.ShaderMaterial({
    vertexShader: PLANE_V,
    fragmentShader: MOUNT_F,
    transparent: true,
    depthWrite: false,
    uniforms: { uUnder: G.uUnder, uSeed: { value: seed }, uInk: { value: ink }, uColor: { value: new THREE.Color(color) }, uPeak: { value: peak }, uBase: { value: base }, uRough: { value: rough } },
  });

/* ---------- drifting mist band ---------- */
const MIST_F = /* glsl */ `
${NOISE}
uniform float uSeed; uniform float uAlpha; uniform vec3 uPaper; uniform float uTime; uniform float uUnder;
varying vec2 vUv;
void main(){
  if (uUnder > 0.5) discard;
  float n = fbm(vec2(vUv.x*3.0 + uTime*0.012 + uSeed, vUv.y*2.0));
  float band = smoothstep(0.0, 0.35, vUv.y)*smoothstep(1.0, 0.45, vUv.y);
  float edge = smoothstep(0.0, 0.12, vUv.x)*smoothstep(1.0, 0.88, vUv.x);
  gl_FragColor = vec4(uPaper, clamp(band*edge*smoothstep(0.3, 0.7, n)*uAlpha, 0.0, 1.0));
}
`;
export const makeMist = (seed: number, alpha: number) =>
  new THREE.ShaderMaterial({ vertexShader: PLANE_V, fragmentShader: MIST_F, transparent: true, depthWrite: false, uniforms: { uSeed: { value: seed }, uAlpha: { value: alpha }, uPaper: G.uPaper, uTime: G.uTime, uUnder: G.uUnder } });

/* ---------- paper sky ---------- */
const SKY_F = /* glsl */ `
${NOISE}
uniform vec3 uPaper; uniform float uUnder;
varying vec2 vUv;
void main(){
  if (uUnder > 0.5) discard;
  float fib = fbm(vUv*vec2(300.0, 900.0))*0.04 + fbm(vUv*12.0)*0.05;
  vec3 col = uPaper*(0.97 + fib) - vec3(0.05,0.045,0.03)*smoothstep(0.55, 1.0, vUv.y);
  // pale sun: a dry ochre wash disc
  float s = length((vUv - vec2(0.62, 0.66))*vec2(2.0, 1.0));
  col = mix(col, vec3(0.86, 0.76, 0.6), smoothstep(0.045, 0.035, s)*0.55);
  gl_FragColor = vec4(col, 1.0);
}
`;
export const makeSky = () => new THREE.ShaderMaterial({ vertexShader: PLANE_V, fragmentShader: SKY_F, depthWrite: false, uniforms: { uPaper: G.uPaper, uUnder: G.uUnder } });

/* ---------- river surface ---------- */
const WATER_V = /* glsl */ `
varying vec3 vW;
void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }
`;
const WATER_F = /* glsl */ `
${NOISE}
${FOG}
uniform float uTime; uniform vec3 uWake; uniform float uWakeAmt; uniform vec3 uRing; uniform float uRingAge;
uniform vec3 uBlot; uniform float uBlotAge; uniform float uBlotAmt; uniform vec3 uRed;
varying vec3 vW;
void main(){
  vec2 p = vW.xz;
  if (gl_FrontFacing) {
    // ripple strokes: long thin horizontal brush lines drifting with the current
    float lines = 0.0;
    for (int i=0;i<2;i++){ float fi=float(i);
      vec2 q = vec2(p.x*0.22 + uTime*0.05*(1.0+fi), p.y*(2.6+fi*1.7));
      float n = vnoise(q + fi*13.0);
      float l = smoothstep(0.035, 0.0, abs(fract(n*3.0+fi*0.3)-0.5)-0.44);
      lines += l*smoothstep(0.45, 0.75, fbm(vec2(p.x*0.08, p.y*0.4)+fi))*0.55; }
    float ink = lines*0.5 + fbm(p*0.05)*0.12;
    // wake behind the swimmer
    vec2 dw = p - uWake.xz; float rw = length(dw*vec2(0.6,1.0));
    ink += uWakeAmt*smoothstep(0.05, 0.0, abs(fract(rw*2.2 - uTime*0.9)-0.5)-0.4)*smoothstep(2.6, 0.3, rw)*step(dw.x, 0.25)*0.6;
    // rings where they sank
    float rr = length(p - uRing.xz);
    float ringR = uRingAge*0.7;
    ink += step(0.0, uRingAge)*smoothstep(0.06, 0.0, abs(fract((rr-ringR)*1.6)-0.5)-0.42)*step(rr, ringR)*smoothstep(ringR, ringR*0.2, rr)*exp(-uRingAge*0.09)*0.8;
    vec3 col = mix(uPaper*0.985, vec3(0.2,0.21,0.22), clamp(ink, 0.0, 0.9));
    // red ink blot spreading from the sting
    if (uBlotAmt > 0.0) {
      vec2 db = p - uBlot.xz; float r = length(db*vec2(0.85,1.0));
      float R = 0.2 + 0.9*(1.0-exp(-uBlotAge*0.5));
      float edge = R*(0.75 + 0.5*fbm(normalize(db+1e-4)*2.0 + vec2(uBlotAge*0.05, 0.0)) );
      float a = smoothstep(edge, edge*0.55, r);
      float core = smoothstep(edge*0.5, 0.0, r);
      float tex = fbm(db*4.0 + uBlotAge*0.1);
      col = mix(col, uRed, clamp((a*0.7 + core*0.3)*(0.7+0.5*tex)*uBlotAmt, 0.0, 0.92));
    }
    gl_FragColor = vec4(inkFog(col, vW), 1.0);
  } else {
    // seen from below: a pale shimmering ceiling, fading to ink with distance
    float c = fbm(p*0.7 + vec2(uTime*0.08, uTime*0.05));
    float caustic = smoothstep(0.55, 0.62, fbm(p*1.6 - uTime*0.06));
    vec3 col = mix(vec3(0.62,0.69,0.72), vec3(0.85,0.87,0.84), c*0.6 + caustic*0.3);
    if (uBlotAmt > 0.0) { float r = length(p - uBlot.xz); col = mix(col, uRed, smoothstep(2.4, 0.2, r)*0.55*uBlotAmt); }
    float d = length(vW - cameraPosition);
    col = mix(col, uFogColor, smoothstep(4.0, 30.0, d));
    gl_FragColor = vec4(col, 1.0);
  }
}
`;
export const WATER_U = {
  uWake: { value: new THREE.Vector3() },
  uWakeAmt: { value: 0 },
  uRing: { value: new THREE.Vector3() },
  uRingAge: { value: -1 },
  uBlot: { value: new THREE.Vector3() },
  uBlotAge: { value: 0 },
  uBlotAmt: { value: 0 },
  uRed: { value: new THREE.Color(PAL.cinnabar) },
};
export const makeWater = () =>
  new THREE.ShaderMaterial({ vertexShader: WATER_V, fragmentShader: WATER_F, side: THREE.DoubleSide, uniforms: { ...G, ...WATER_U } });

/* ---------- underwater dome ---------- */
const DOME_F = /* glsl */ `
uniform vec3 uDeep; uniform float uDepth;
varying vec3 vW; varying vec3 vDir;
void main(){
  float up = normalize(vDir).y;
  vec3 top = vec3(0.76,0.81,0.82);
  vec3 col = mix(uDeep*0.85, mix(uDeep*1.15, top, smoothstep(-0.1, 0.9, up)), smoothstep(-0.9, 0.4, up));
  col = mix(col, uDeep*0.7, clamp(uDepth/16.0, 0.0, 1.0)*0.45);
  gl_FragColor = vec4(col, 1.0);
}
`;
const DOME_V = /* glsl */ `
varying vec3 vW; varying vec3 vDir;
void main(){ vDir = position; vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }
`;
export const DOME_U = { uDepth: { value: 0 } };
export const makeDome = () =>
  new THREE.ShaderMaterial({ vertexShader: DOME_V, fragmentShader: DOME_F, side: THREE.BackSide, depthWrite: false, uniforms: { uDeep: G.uDeep, ...DOME_U } });

/* ---------- soft billboard blot (red ink clouds, light shafts, bubbles) ---------- */
const BLOT_F = /* glsl */ `
${NOISE}
uniform vec3 uColor; uniform float uAlpha; uniform float uSeed; uniform float uMode;
varying vec2 vUv;
void main(){
  vec2 c = vUv - 0.5;
  float a;
  if (uMode < 0.5) { // ink cloud
    float r = length(c)*2.0;
    float n = fbm(c*3.5 + uSeed);
    a = smoothstep(1.0, 0.25, r + (n-0.5)*0.7);
  } else if (uMode < 1.5) { // light shaft
    a = smoothstep(0.5, 0.0, abs(c.x))*smoothstep(-0.5, 0.4, c.y)*(0.6+0.4*vnoise(vec2(c.x*8.0+uSeed, 0.0)));
  } else { // bubble ring
    float r = length(c)*2.0;
    a = smoothstep(0.16, 0.0, abs(r-0.8));
  }
  gl_FragColor = vec4(uColor, clamp(a*uAlpha, 0.0, 1.0));
}
`;
export const makeBlot = (color: string, mode = 0, seed = 0) =>
  new THREE.ShaderMaterial({
    vertexShader: PLANE_V,
    fragmentShader: BLOT_F,
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color(color) }, uAlpha: { value: 1 }, uSeed: { value: seed }, uMode: { value: mode } },
  });
