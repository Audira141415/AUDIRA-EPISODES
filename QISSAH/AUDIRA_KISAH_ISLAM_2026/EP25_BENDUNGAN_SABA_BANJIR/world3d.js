// EP25 BENDUNGAN SABA', BANJIR. SATELLITEBRIEFING: an orbital imaging pass over a reconstructed Saba' valley (Ma'rib, Yaman).
// The camera is a tasked satellite: it looks (nearly) straight down, zooms from orbit through cloud decks, re-tasks its
// heading (screen-up rotates from west to north when it follows the caravan road) and dips oblique only for the ruin.
// World (x = east, z = south, 1 unit ~ 10 m): the wadi flows west to east along x; a long stone dam with two sluice
// gates crosses it at x = -60 below rocky hills, a reservoir lies behind it, and two green garden oases spread left and
// right of the wadi downstream (with screen-up = west the south garden is on the left, the north garden on the right).
// A caravan road leaves the north garden for the north with villages strung along it, ending in "the blessed land".
// No people at all: caravans are tiny dots. The flood is water spreading over fields, then the fields turn to scrub.
// The terrain colour is one shader (fields, canals, water, silt, scrub, villages, road) so every state is a pure function
// of t. The HUD (brackets, labels, compass, scale bar, scan sweeps) is drawn on #hud from projected world points.
import * as THREE from "./three.module.js";
import { mulberry, ramp, clamp01, canvasTex, track, stage } from "./lib3d.js";

const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
function hash(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
function fbm(x, z) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 4; i++) { s += a * vnoise(x * f, z * f); f *= 2.03; a *= 0.5; } return s; }
const wz = (x) => 3 * Math.sin(x * 0.021) + 2 * Math.sin(x * 0.057 + 1);
const DAMX = -60, ZC = wz(DAMX);
const CORE = 300, OUTY = -0.7;
function height(x, z) {
  const dz = z - wz(x), adz = Math.abs(dz);
  let h = 0.55 * fbm(x * 0.018 + 7, z * 0.018);
  const mw = sm((-x - 72) / 70), valley = sm((adz - 22) / 30);
  // rocky hills west of the dam, the wadi cutting a gorge through them (ridged noise, ragged edge)
  const rn = fbm(x * 0.03 + 11, z * 0.03), ridge = 1 - Math.abs(2 * fbm(x * 0.02 + 4, z * 0.045) - 1);
  const en = fbm(x * 0.045 + 2, z * 0.045 + 9);
  const hw = sm((-x - 48 - 26 * rn) / 30) * sm((adz - 30 - 10 * rn) / 18) * (1 - sm((adz - 60 - 90 * en) / 40));
  h += mw * valley * (1 - sm((adz - 50 - 90 * en) / 40)) * (1 - sm((-x - 200 - 60 * en) / 50)) * 30 * fbm(x * 0.012 + 3, z * 0.012);
  h += hw * (6 + 26 * ridge * ridge + 10 * rn);
  h -= 1.4 * (1 - sm((adz - 4) / 5));
  if (x < DAMX - 3) h -= 2.2 * (1 - sm((adz - 20) / 9)) * sm((DAMX - 3 - x) / 8);
  const fn = fbm(x * 0.01 + 40, z * 0.01);
  const fade = sm((CORE - 10 - Math.abs(x) - 60 * fn) / 90) * sm((CORE - 10 - Math.abs(z) - 60 * fn) / 90);
  return OUTY + (h - OUTY) * fade;
}
const groundY = (x, z) => (Math.abs(x) < CORE && Math.abs(z) < CORE ? height(x, z) : OUTY);
// caravan road north from the north garden: s = distance along it
const roadX = (s) => 40 + 18 * Math.sin(s * 0.012) + 6 * Math.sin(s * 0.031);
const roadZ = (s) => -62 - s;

const GLSL = `
uniform float uAge,uScrub,uRes,uNow,uT,uRouteLen,uRoad,uFlow,uDam;
uniform vec4 uVil[13];
varying vec3 vW;
float gWater;
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
float wzf(float x){return 3.*sin(x*.021)+2.*sin(x*.057+1.);}
float roadXf(float s){return 40.+18.*sin(s*.012)+6.*sin(s*.031);}
vec3 terrainColor(vec2 p){
  gWater=0.;
  float x=p.x,z=p.y,dz=z-wzf(x),adz=abs(dz);
  float n1=fb(p*.011),n2=fb(p*.06+3.),n3=vn(p*.8),n4=fb(p*.004+21.);
  // desert: sand tones, dune ripples, dark basalt fields
  vec3 c=mix(vec3(.80,.66,.47),vec3(.68,.53,.36),n1);
  c=mix(c,vec3(.87,.76,.58),smoothstep(.55,.8,n2)*.55);
  c*=1.+.045*sin((x*.6+z*.32)*.21+n1*7.);
  c=mix(c,vec3(.33,.28,.24),smoothstep(.6,.7,n4)*.75);
  // rock: high ground near the dam plus far western ranges
  float rock=smoothstep(1.6,8.,vW.y)+(1.-smoothstep(-360.,-260.,x))*smoothstep(.42,.6,n1);
  vec3 rc=mix(vec3(.47,.37,.28),vec3(.62,.50,.38),n2);rc*=.85+.3*vn(p*.35);
  c=mix(c,rc,clamp(rock,0.,1.));
  // wadi bed: pale gravel with braided channels
  float wad=1.-smoothstep(5.,8.5,adz);
  c=mix(c,vec3(.86,.79,.66)-.06*smoothstep(.3,.9,sin(dz*1.4+n2*9.)),wad*.85);
  // gardens
  float gn=fb(p*.03)*14.;
  float g=smoothstep(-53.,-49.,x)*(1.-smoothstep(116.+gn,122.+gn,x))*smoothstep(8.,10.,adz)*(1.-smoothstep(56.+gn*.5,60.+gn*.5,adz));
  if(g>0.){
    float side=sign(dz);
    vec2 q=vec2((x+52.)/9.,(adz-8.)/6.5);vec2 cell=floor(q),f=fract(q);
    float r=h21(cell+side*31.7);
    vec3 fc=mix(vec3(.20,.37,.14),vec3(.40,.53,.20),r);
    fc=mix(fc,vec3(.30,.46,.18),step(.5,h21(cell*1.7+4.))*.5);
    if(r>.88)fc=vec3(.58,.53,.33);
    fc*=.9+.18*vn(p*1.6);
    float bund=1.-smoothstep(.0,.06,min(min(f.x,1.-f.x)*1.4,min(f.y,1.-f.y)));
    fc=mix(fc,vec3(.30,.27,.18),bund*.55);
    float can=(1.-smoothstep(.7,1.1,abs(adz-35.)))+(1.-smoothstep(.45,.8,abs(fract((x+52.)/18.)-.5)*18.))*step(12.,adz)*step(adz,56.);
    can=clamp(can,0.,1.);
    vec3 cw=vec3(.24,.40,.42)+uFlow*vec3(.16,.2,.2)*pow(.5+.5*sin((x-uT*12.)*.33+adz*.2),6.);
    fc=mix(fc,cw,can*(1.-uNow));
    float thr=fb(p*.04+5.);
    float dm=smoothstep(thr-.08,thr+.08,uScrub*1.12-.06);
    vec3 dc=mix(vec3(.56,.50,.36),vec3(.47,.45,.31),n3);
    dc=mix(dc,vec3(.45,.43,.30),smoothstep(.55,.75,vn(p*2.2))*.6);
    dc=mix(dc,vec3(.36,.32,.22),bund*.45);
    c=mix(c,mix(fc,dc,dm),g);
  }
  // villages and the road north
  for(int i=0;i<13;i++){
    vec4 v=uVil[i];float d=length(p-v.xy);
    float m=(1.-smoothstep(v.z*.7,v.z,d))*v.w;
    vec3 vc=mix(vec3(.62,.50,.36),mix(vec3(.22,.40,.15),vec3(.33,.48,.20),vn(p*.5)),smoothstep(v.z*.22,v.z*.34,d));
    c=mix(c,vc,m);
  }
  float s=-62.-z;
  float road=(1.-smoothstep(.7,1.5,abs(x-roadXf(s))))*step(0.,s)*(1.-smoothstep(uRouteLen-4.,uRouteLen,s));
  c=mix(c,vec3(.92,.84,.68),road*uRoad*.8);
  // reservoir behind the dam (drains after the breach)
  float lw=26.*(1.-smoothstep(130.,200.,-x))*uRes;
  float lake=step(x,${(DAMX - 2.5).toFixed(1)})*(1.-smoothstep(lw-3.,lw,adz+(n2-.5)*6.));
  c=mix(c,mix(vec3(.13,.27,.28),vec3(.26,.40,.38),smoothstep(lw-9.,lw,adz)),lake);
  gWater=max(gWater,lake);
  // silt left by the flood
  float dx=x-(${DAMX}.);
  if(uAge>0.){
    float F=330.*(1.-exp(-uAge*.7));
    float Wm=8.+66.*exp(-max(dx,0.)/240.);
    float silt=smoothstep(-1.,1.,dx)*(1.-smoothstep(F-14.,F,dx))*(1.-smoothstep(Wm-4.,Wm+6.,adz))*smoothstep(3.,6.,uAge)*(1.-uNow*.5);
    c=mix(c,vec3(.55,.45,.32)*(.9+.2*n3),silt*.55);
    float S=smoothstep(0.,1.8,uAge)*(1.-smoothstep(4.,7.,uAge));
    float nn=fb(p*.05+vec2(-uT*.6,0.));
    float W=8.+66.*S*exp(-max(dx,0.)/240.)+(nn-.5)*16.*S;
    float wm=smoothstep(-1.,1.,dx)*(1.-smoothstep(F-16.,F,dx+(nn-.5)*20.))*(1.-smoothstep(W-3.,W,adz))*(1.-smoothstep(6.5,8.5,uAge))*(1.-uNow);
    float streak=pow(vn(vec2(dx*.07-uT*2.4,dz*.35)),3.);
    vec3 wc=mix(vec3(.25,.21,.14),vec3(.22,.25,.21),smoothstep(0.,80.,dx))+streak*vec3(.22,.19,.13);
    float front=smoothstep(F-26.,F-4.,dx)+(1.-smoothstep(W-9.,W-2.,adz))*0.+smoothstep(W-7.,W-2.,adz)*S;
    wc=mix(wc,vec3(.80,.74,.62),clamp(front,0.,1.)*.4);
    float spray=(1.-smoothstep(0.,26.,dx))*(1.-smoothstep(8.,16.,adz))*(1.-smoothstep(1.,3.5,uAge))*uDam;
    wc=mix(wc,vec3(.93,.92,.86),spray*.7*(.5+.5*vn(vec2(dx*.3-uT*6.,dz*.4))));
    c=mix(c,wc,wm);
    gWater=max(gWater,wm);
  }
  // sensor grain
  c*=.97+.06*h21(floor(p*3.));
  return c;
}`;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xa9bccb, fog: 0.0001, exp: 1.0, bloom: [0.16, 0.4, 0.92], shadow: true });
  cam.near = 0.5; cam.far = 9000; cam.setViewOffset(1080, 1920, 0, -110, 1080, 1920); cam.updateProjectionMatrix();
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(2025);
  const tv = new THREE.Vector3(), fm = new THREE.Matrix4(), fq = new THREE.Quaternion(), fs = new THREE.Vector3(), fe = new THREE.Euler();

  // ---------- timing
  const tH = A("s1:banjir") + 0.1, tR0 = K.s1e - 0.62, tR1 = K.s2 - 0.03;
  const tB = A("s5:banjir") - 0.1;
  const tJ = A("s4:jauhkanlah");
  const fAge = (t) => (t < tH ? -1 : t < tR0 ? t - tH : t < tR1 ? (tR0 - tH) * (1 - sm((t - tR0) / (tR1 - tR0))) : t < tB ? -1 : t - tB);
  const scrubAt = (t) => ramp(t, A("s5:Kebun") - 0.2, A("s5:pahit") + 0.8);
  const nowAt = (t) => ramp(t, K.s6 - 0.35, K.s6 + 0.5);
  const spacing = (t) => 46 * (1 + 1.9 * ramp(t, tJ, tJ + 3.6));

  // ---------- lights
  const hemi = new THREE.HemisphereLight(0xdfe8f0, 0x6b5a44, 1.05); scene.add(hemi);
  const sunL = new THREE.DirectionalLight(0xfff0d8, 2.4); sunL.castShadow = true;
  sunL.shadow.mapSize.set(4096, 4096); sunL.shadow.bias = -0.0004; sunL.shadow.normalBias = 0.03;
  const SC = sunL.shadow.camera; SC.near = 1; SC.far = 9000;
  scene.add(sunL); scene.add(sunL.target);
  const SUN = new THREE.Vector3(-0.55, 0.72, 0.42).normalize();

  // ---------- terrain (core with relief + flat outer apron, one shared shader)
  const U = { uAge: { value: -1 }, uScrub: { value: 0 }, uRes: { value: 1 }, uNow: { value: 0 }, uT: { value: 0 }, uRouteLen: { value: 600 }, uRoad: { value: 1 }, uFlow: { value: 1 }, uDam: { value: 1 },
    uVil: { value: Array.from({ length: 13 }, () => new THREE.Vector4(0, 9999, 1, 0)) } };
  const tmat = new THREE.MeshStandardMaterial({ roughness: 0.96, metalness: 0 });
  tmat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = "varying vec3 vW;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvW=(modelMatrix*vec4(transformed,1.)).xyz;");
    const f0 = sh.fragmentShader;
    sh.fragmentShader = f0.replace("#include <common>", "#include <common>\n" + GLSL)
      .replace("vec4 diffuseColor = vec4( diffuse, opacity );", "vec4 diffuseColor = vec4( terrainColor(vW.xz), opacity );")
      .replace("float roughnessFactor = roughness;", "float roughnessFactor = mix(roughness,.28,gWater);");
    if (sh.fragmentShader.indexOf("terrainColor(vW.xz)") < 0) throw new Error("terrain shader patch failed");
  };
  const cg = new THREE.PlaneGeometry(2 * CORE, 2 * CORE, 300, 300); cg.rotateX(-Math.PI / 2);
  { const p = cg.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, height(p.getX(i), p.getZ(i))); cg.computeVertexNormals(); }
  const core = new THREE.Mesh(cg, tmat); core.receiveShadow = true; scene.add(core);
  const og = new THREE.PlaneGeometry(5200, 5200, 1, 1); og.rotateX(-Math.PI / 2);
  const outer = new THREE.Mesh(og, tmat); outer.position.set(0, OUTY - 0.08, -600); scene.add(outer);

  // ---------- dam: coursed stone wall in 13 segments + two sluice gates
  const stoneTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#b39a78"; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? -24 : 0; x < w; x += 48) {
      const v = 150 + Math.floor(rnd() * 50); g.fillStyle = `rgb(${v + 20},${v + 4},${v - 24})`; g.fillRect(x + 2, y + 2, 44, 28);
    }
    for (let i = 0; i < 1600; i++) { g.fillStyle = rnd() < 0.5 ? "rgba(60,45,30,.12)" : "rgba(255,240,215,.1)"; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
  });
  const stoneM = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.9, color: 0xffffff });
  const ruinM = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 1, color: 0xfff4e4 });
  const SEG = [];
  for (let i = 0; i < 13; i++) {
    const z = ZC - 30 + i * 5;
    const m = new THREE.Mesh(new THREE.BoxGeometry(5, 8.5, 5.02), stoneM);
    m.castShadow = m.receiveShadow = true; scene.add(m);
    const r1 = rnd(), r2 = rnd(), r3 = rnd(), r4 = rnd();
    SEG.push({ m, z, burst: i >= 4 && i <= 8, r1, r2, r3, r4 });
  }
  const capM = new THREE.MeshStandardMaterial({ color: 0xcdb48e, roughness: 0.85 });
  const SLU = [];
  for (const sd of [-1, 1]) {
    const G = new THREE.Group(); const zc = ZC + sd * 36.5; const y0 = groundY(DAMX, zc) - 1.2;
    for (const o of [-3.4, 3.4]) { const p = new THREE.Mesh(new THREE.BoxGeometry(6.5, 10, 2.4), stoneM); p.position.set(0, 5, o); p.castShadow = p.receiveShadow = true; G.add(p); }
    const lin = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.6, 9.2), capM); lin.position.set(0, 10.4, 0); lin.castShadow = true; G.add(lin);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 5), stoneM); wing.position.set(4.6, 3, sd * 5.6); wing.castShadow = wing.receiveShadow = true; G.add(wing);
    G.position.set(DAMX + 1, y0, zc); scene.add(G); SLU.push({ G, lin, wing, zc });
  }
  // breach debris
  const NDB = 46;
  const deb = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), stoneM, NDB); deb.frustumCulled = false; deb.castShadow = true; scene.add(deb);
  const DB = Array.from({ length: NDB }, () => ({ z: ZC - 12 + rnd() * 24, y: rnd() * 7, s: 0.8 + rnd() * 1.6, a: rnd(), b: rnd(), c: rnd(), d: rnd() }));
  // present-day rubble around the sluices
  const NRB = 70;
  const rub = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), ruinM, NRB); rub.castShadow = rub.receiveShadow = true; rub.frustumCulled = false; scene.add(rub);
  const RB = Array.from({ length: NRB }, (_, i) => { const sd = i % 2 ? 1 : -1; const z = ZC + sd * (14 + rnd() * 26), x = DAMX - 3 + rnd() * 9; return { x, z, y: groundY(x, z), s: 0.6 + rnd() * 1.5, rx: rnd() * 3, ry: rnd() * 3 }; });

  // ---------- trees (garden crowns) and scrub (khamth, atsl, sidr)
  const inGarden = (x, adz) => x > -47 && x < 114 && adz > 11 && adz < 55;
  const TR = [];
  while (TR.length < 1700) {
    const x = -47 + rnd() * 160, sd = rnd() < 0.5 ? -1 : 1, adz = 11 + rnd() * 44;
    const fx = ((x + 52) / 9) % 1, fy = ((adz - 8) / 6.5) % 1;
    if (Math.min(fx, 1 - fx) > 0.16 && Math.min(fy, 1 - fy) > 0.18 && rnd() > 0.12) continue;
    const z = wz(x) + sd * adz;
    TR.push({ x, z, y: groundY(x, z) + 0.5, s: 0.65 + rnd() * 0.5, d: fbm(x * 0.04 + 5, z * 0.04) });
  }
  const crownG = new THREE.IcosahedronGeometry(1, 1);
  const crownM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true });
  const trees = new THREE.InstancedMesh(crownG, crownM, TR.length); trees.castShadow = true; trees.frustumCulled = false; scene.add(trees);
  TR.forEach((o, i) => trees.setColorAt(i, new THREE.Color().setHSL(0.27 + rnd() * 0.06, 0.45, 0.2 + rnd() * 0.1)));
  const SB = [];
  // labelled specimens first (index 0 khamth, 1 atsl, 2 sidr), placed near the s5 close-up
  SB.push({ x: 18, z: 33, k: 0 }, { x: 27, z: 26, k: 1 }, { x: 22, z: 44, k: 2 });
  while (SB.length < 1300) {
    const x = -47 + rnd() * 160, sd = rnd() < 0.5 ? -1 : 1, adz = 11 + rnd() * 44;
    const v = rnd(); const k = v < 0.62 ? 0 : v < 0.96 ? 1 : 2;
    SB.push({ x, z: wz(x) + sd * adz, k });
  }
  const scrubM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true });
  const scrub = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), scrubM, SB.length); scrub.castShadow = true; scrub.frustumCulled = false; scene.add(scrub);
  SB.forEach((o, i) => {
    o.y = groundY(o.x, o.z) + (o.k === 2 ? 1.1 : 0.4); o.d = fbm(o.x * 0.04 + 5, o.z * 0.04);
    o.s = i < 3 ? [1.0, 1.7, 2.2][o.k] : o.k === 0 ? 0.5 + rnd() * 0.45 : o.k === 1 ? 0.9 + rnd() * 0.6 : 1.5 + rnd() * 0.5;
    o.sy = o.k === 1 ? 1.5 : 0.8; o.rot = rnd() * 6;
    const c = o.k === 0 ? new THREE.Color().setHSL(0.16, 0.32, 0.3 + rnd() * 0.06) : o.k === 1 ? new THREE.Color().setHSL(0.36, 0.2, 0.42 + rnd() * 0.06) : new THREE.Color().setHSL(0.27, 0.45, 0.2);
    scrub.setColorAt(i, c);
  });

  // ---------- villages along the road + the blessed land, caravans
  const NV = 13, HPV = 14, HCITY = 44;
  const HO = [];
  for (let i = 0; i < NV; i++) {
    const n = i === 12 ? HCITY : HPV, R = i === 12 ? 9 : 4.2;
    for (let j = 0; j < n; j++) { const a = rnd() * 6.283, rr = Math.sqrt(rnd()) * R; HO.push({ v: i, ox: Math.cos(a) * rr, oz: Math.sin(a) * rr, w: 1.8 + rnd() * 1.6, h: 1.2 + rnd() * 1.2, d: 1.8 + rnd() * 1.6, ry: (rnd() - 0.5) * 0.4 }); }
  }
  const houseM = new THREE.MeshStandardMaterial({ color: 0xd9c2a0, roughness: 0.9 });
  const houses = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), houseM, HO.length); houses.castShadow = true; houses.frustumCulled = false; scene.add(houses);
  const NCV = 6, PERC = 5;
  const camel = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 1.2, 0.8), new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 1 }), NCV * PERC); camel.castShadow = true; camel.frustumCulled = false; scene.add(camel);
  const vilS = (i, D) => 25 + i * D;

  // ---------- GCP survey target with the AUDIRA mark (present-day only), lying on the ground east of the south sluice
  const gcpTex = canvasTex(512, 640, (g, w, h) => {
    g.fillStyle = "#f2efe6"; g.fillRect(0, 0, w, 512);
    g.fillStyle = "#15191c"; g.fillRect(40, 40, 216, 216); g.fillRect(256, 256, 216, 216);
    g.strokeStyle = "#15191c"; g.lineWidth = 10; g.strokeRect(20, 20, 472, 472);
    g.fillStyle = "#15191c"; g.fillRect(0, 528, w, 112);
    g.fillStyle = "#f2efe6"; g.font = "700 84px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", w / 2, 586);
  });
  const gcp = new THREE.Group(); const GCPX = DAMX + 9, GCPZ = ZC + 31;
  const gp = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.25), new THREE.MeshStandardMaterial({ map: gcpTex, roughness: 0.8 })); gp.rotation.x = -Math.PI / 2; gp.receiveShadow = true; gcp.add(gp);
  gcp.position.set(GCPX, groundY(GCPX, GCPZ) + 0.12, GCPZ); gcp.rotation.y = 125 * Math.PI / 180; scene.add(gcp);

  // ---------- cloud decks (only met during the orbit descent and the closing pull-back)
  const cloudTex = canvasTex(512, 512, (g, w, h) => {
    for (let i = 0; i < 60; i++) {
      const a = rnd() * 6.283, rr = Math.sqrt(rnd()) * 150, x = w / 2 + Math.cos(a) * rr, y = h / 2 + Math.sin(a) * rr * 0.8, R = 40 + rnd() * 80;
      const gr = g.createRadialGradient(x, y, 1, x, y, R); gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(0.6, "rgba(250,252,255,.25)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }
  });
  const CL = [];
  for (let i = 0; i < 12; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, depthWrite: false, fog: false, opacity: 0.9 }));
    m.rotation.x = -Math.PI / 2; m.rotation.z = rnd() * 6;
    const a = rnd() * 6.283, rr = 260 + rnd() * 900, s = 380 + rnd() * 520;
    m.position.set(30 + Math.cos(a) * rr * 0.75, 650 + rnd() * 1500, Math.sin(a) * rr * 1.2); m.scale.set(s, s, 1); scene.add(m); CL.push(m);
  }

  // ---------- camera track: [t, tx, tz, ln(alt), tilt deg, heading deg]  heading -90: screen-up = west
  const L = Math.log;
  const camK = track([
    [0, 30, 0, L(3300), 0, -90],
    [1.3, 28, 0, L(1300), 0, -90],
    [2.9, 26, 0, L(400), 3, -90],
    [4.4, 18, 0, L(345), 8, -90],
    [6.4, 8, 0, L(320), 16, -90],
    [8.7, 12, 0, L(330), 12, -90],
    [9.9, 22, 0, L(350), 7, -90],
    [14.6, 26, 0, L(320), 10, -89],
    [17.2, 18, -6, L(270), 18, -86],
    [20.4, 10, -24, L(300), 14, -74],
    [23.1, 30, -130, L(520), 9, -32],
    [26.2, 44, -290, L(740), 5, -4],
    [30.3, 48, -400, L(780), 5, 0],
    [32.4, 48, -420, L(790), 5, 0],
    [34.5, 47, -440, L(830), 4, 0],
    [38.2, 44, -760, L(1480), 3, 0],
    [41.0, 40, -860, L(1620), 3, 0],
    [41.6, 40, -880, L(1660), 3, 0],
  ]);
  const camK2 = track([
    [41.2, 12, 0, L(440), 8, -90],
    [42.5, 16, 0, L(390), 9, -90],
    [43.8, 24, 2, L(330), 17, -90],
    [45.6, 34, 18, L(235), 24, -90],
    [47.2, 30, 32, L(150), 30, -91],
    [49.1, 24, 36, L(130), 32, -93],
    [50.7, -42, 38, L(95), 40, -100],
    [53.2, -55, 36, L(64), 47, -110],
    [57.2, -56, 35, L(58), 51, -128],
    [61.2, -55, 33, L(64), 49, -146],
    [63.4, -20, 12, L(250), 26, -118],
    [67.2, 12, 0, L(370), 14, -98],
    [71.9, 22, 0, L(420), 9, -90],
    [74.2, 22, 0, L(720), 4, -90],
    [77.8, 22, 0, L(1900), 1, -90],
    [81.2, 22, 0, L(3300), 0, -90],
    [84.5, 22, 0, L(3700), 0, -90],
  ]);
  const CUT = K.s5 - 0.05;
  const upH = new THREE.Vector3(), camT = new THREE.Vector3();
  let ALT = 300, HD = -90;

  // ---------- HUD canvas
  const hud = canvas.ownerDocument.getElementById("hud");
  const X = hud.getContext("2d");
  const MINT = "#7CF3C8", AMBER = "#FFB347", RED = "#FF6A5C", WHITE = "#EAF4F0";
  const scan = canvas.ownerDocument.createElement("canvas"); scan.width = 1080; scan.height = 1920;
  { const s = scan.getContext("2d"); s.fillStyle = "rgba(160,255,220,.035)"; for (let y = 0; y < 1920; y += 4) s.fillRect(0, y, 1080, 1); }
  const pv = new THREE.Vector3();
  const P = (x, y, z) => { pv.set(x, y, z).project(cam); return [(pv.x + 1) * 540, (1 - pv.y) * 960, pv.z < 1]; };
  const FONT = (s, w = 600) => `${w} ${s}px "IBM Plex Mono", monospace`;
  function txt(s, x, y, o = {}) {
    const size = o.size || 22, col = o.color || MINT, al = o.align || "left";
    X.font = FONT(size, o.weight || 600);
    const w = X.measureText(s).width, x0 = al === "left" ? x : al === "right" ? x - w : x - w / 2;
    X.globalAlpha = o.alpha ?? 1;
    if (o.bg !== false) { X.fillStyle = o.bgc || "rgba(3,11,15,.78)"; X.fillRect(x0 - 9, y - size * 0.98, w + 18, size * 1.38); }
    X.fillStyle = col; X.fillText(s, x0, y); X.globalAlpha = 1;
    return w;
  }
  function brk(x0, y0, x1, y1, col, a = 1, len = 26, lw = 3) {
    X.globalAlpha = a; X.strokeStyle = col; X.lineWidth = lw; X.beginPath();
    for (const [x, y, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { X.moveTo(x + sx * len, y); X.lineTo(x, y); X.lineTo(x, y + sy * len); }
    X.stroke(); X.globalAlpha = 1;
  }
  const boxOf = (pts) => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y, z] of pts) { const [sx, sy] = P(x, y, z); a = Math.min(a, sx); b = Math.min(b, sy); c = Math.max(c, sx); d = Math.max(d, sy); } return [a, b, c, d]; };
  const gardenPts = (sd) => { const o = []; for (const x of [-48, 0, 60, 116]) for (const a of [10, 57]) o.push([x, 0, wz(x) + sd * a]); return o; };
  const vis = (t, a, b, fi = 0.25, fo = 0.25) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b));
  function pin(wx, wy, wzz, dx, dy, lines, col, a) {
    if (a <= 0.01) return;
    const [sx, sy, ok] = P(wx, wy, wzz); if (!ok) return;
    X.globalAlpha = a; X.strokeStyle = col; X.lineWidth = 2.5;
    X.beginPath(); X.arc(sx, sy, 9, 0, 6.283); X.stroke();
    X.beginPath(); X.moveTo(sx + Math.sign(dx) * 9, sy); X.lineTo(sx + dx * 0.55, sy + dy); X.lineTo(sx + dx, sy + dy); X.stroke();
    X.globalAlpha = 1;
    lines.forEach((l, i) => { if (l) txt(l[0], sx + dx + (dx > 0 ? 12 : -12), sy + dy + 8 + i * 34, { align: dx > 0 ? "left" : "right", color: l[1] || col, alpha: a * (l[2] ?? 1), size: l[3] || 24 }); });
  }
  const statusAt = (t) => t < tH - 0.1 ? "ARSIP · MASA KEJAYAAN" : t < tR0 ? "ARSIP · BANJIR BESAR" : t < tR1 + 0.1 ? "◀◀ PUTAR ULANG" : t < K.s5 - 0.2 ? "ARSIP · MASA KEJAYAAN" : t < K.s6 - 0.3 ? "REKONSTRUKSI · SAIL AL-'ARIM" : "CITRA HARI INI";

  function drawHUD(t) {
    X.clearRect(0, 0, 1080, 1920);
    X.drawImage(scan, 0, 0);
    X.textBaseline = "alphabetic";
    // frame brackets
    brk(34, 168, 1046, 1282, "rgba(124,243,200,.55)", 1, 46, 2);
    // top-right tag (sign-off brightens it)
    const so = ramp(t, A("s8:Kisah"), A("s8:Kisah") + 0.6);
    const blink = Math.floor(t * 2) % 2 === 0 ? 1 : 0.35;
    const tw = txt("SAT · AUDIRA", 1024, 210, { align: "right", size: 22 + so * 6, color: so > 0.5 ? "#06121A" : MINT, bgc: so > 0.5 ? "rgba(124,243,200,.95)" : "rgba(3,11,15,.78)" });
    X.fillStyle = so > 0.5 ? "#06121A" : RED; X.globalAlpha = blink; X.beginPath(); X.arc(1024 - tw - 26, 203 - so * 2, 6, 0, 6.283); X.fill(); X.globalAlpha = 1;
    // bottom-right: location + status
    txt("MA'RIB, YAMAN", 1024, 1216, { align: "right", size: 23, color: WHITE });
    const st = statusAt(t), rw = st.startsWith("◀◀");
    txt(st, 1024, 1252, { align: "right", size: 21, color: rw ? "#06121A" : st.startsWith("REK") ? AMBER : MINT, bgc: rw ? (Math.floor(t * 8) % 2 ? MINT : "#ffffff") : undefined });
    // bottom-left: scale bar (word label only) + altitude word
    const dist = ALT / Math.cos(0.2), upp = (2 * dist * Math.tan((38 * Math.PI / 180) / 2) * (1080 / 1920)) / 1080;
    let L = 1; for (const c of [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000]) if (c / upp <= 230) L = c;
    const px = L / upp;
    X.fillStyle = WHITE; X.fillRect(230, 1232, px, 4); X.fillRect(230, 1222, 3, 18); X.fillRect(230 + px - 3, 1222, 3, 18); X.fillRect(230 + px / 2 - 1, 1226, 2, 10);
    txt("SKALA", 230, 1212, { size: 19, color: WHITE, bg: false });
    const altW = ALT > 1800 ? "ORBIT" : ALT > 650 ? "TINGGI" : ALT > 180 ? "SEDANG" : "RENDAH";
    txt("KETINGGIAN · " + altW, 230, 1268, { size: 19, color: MINT, bg: false });
    // compass (N arrow follows the camera heading)
    const ca = -HD * Math.PI / 180, cx = 600, cy = 1236;
    X.strokeStyle = "rgba(234,244,240,.8)"; X.lineWidth = 2; X.beginPath(); X.arc(cx, cy, 26, 0, 6.283); X.stroke();
    X.save(); X.translate(cx, cy); X.rotate(ca); X.fillStyle = RED; X.beginPath(); X.moveTo(0, -22); X.lineTo(7, 2); X.lineTo(-7, 2); X.closePath(); X.fill();
    X.fillStyle = WHITE; X.beginPath(); X.moveTo(0, 22); X.lineTo(7, 2); X.lineTo(-7, 2); X.closePath(); X.fill();
    X.font = FONT(17, 700); X.fillStyle = WHITE; X.textAlign = "center"; X.fillText("U", 0, -30); X.textAlign = "left"; X.restore();

    // reticle during orbit legs
    const ret = Math.max(1 - ramp(t, 2.4, 3.2), ramp(t, K.s8 + 1.0, K.s8 + 2.2) * (1 - ramp(t, K.outro - 0.4, K.outro)));
    if (ret > 0.01) {
      const [sx, sy] = P(30, 0, 0); const R = 70 + 30 * Math.sin(t * 2);
      brk(sx - R, sy - R, sx + R, sy + R, MINT, ret, 22, 2.5);
      X.globalAlpha = ret; X.strokeStyle = MINT; X.lineWidth = 1.5; X.beginPath(); X.moveTo(sx - R - 40, sy); X.lineTo(sx - 16, sy); X.moveTo(sx + 16, sy); X.lineTo(sx + R + 40, sy); X.moveTo(sx, sy - R - 40); X.lineTo(sx, sy - 16); X.moveTo(sx, sy + 16); X.lineTo(sx, sy + R + 40); X.stroke(); X.globalAlpha = 1;
      if (t < 3.2) txt("SAPUAN ORBIT", sx + R + 12, sy - R + 4, { size: 20, alpha: ret });
    }

    // garden brackets: s1 (KANAN/KIRI then the flood alarm), s2 (TANDA, KIRI/KANAN), s7 (ghost outline)
    const gL = boxOf(gardenPts(1)), gR = boxOf(gardenPts(-1));
    const flick = (Math.floor(t * 9) % 2) ? 1 : 0.45;
    const al1 = (a0, a1) => vis(t, a0, a1, 0.2, 0.3);
    const kR = al1(A("s1:kanan") - 0.1, tH + 0.9) + al1(A("s2:kanan") - 0.1, K.s2e - 0.1);
    const kL = al1(A("s1:kiri") - 0.1, tH + 0.9) + al1(A("s2:kiri") - 0.1, K.s2e - 0.1);
    const red1 = t > tH && t < K.s2;
    if (kR > 0.01) { brk(gR[0], gR[1], gR[2], gR[3], red1 ? RED : MINT, kR * (red1 ? flick : 1)); txt("KEBUN KANAN", gR[2] - 4, gR[1] - 14, { align: "right", alpha: kR, color: red1 ? RED : MINT }); }
    if (kL > 0.01) { brk(gL[0], gL[1], gL[2], gL[3], red1 ? RED : MINT, kL * (red1 ? flick : 1)); txt("KEBUN KIRI", gL[0] + 4, gL[3] + 34, { alpha: kL, color: red1 ? RED : MINT }); }
    const tda = vis(t, A("s2:tanda") - 0.1, A("s2:Dua") + 0.1, 0.2, 0.3);
    if (tda > 0.01) { const a = Math.min(gL[0], gR[0]) - 22, b = Math.min(gL[1], gR[1]) - 22, c = Math.max(gL[2], gR[2]) + 22, d = Math.max(gL[3], gR[3]) + 22; brk(a, b, c, d, WHITE, tda, 40, 3); txt("TANDA", (a + c) / 2, b - 12, { align: "center", alpha: tda, color: WHITE, size: 26 }); }
    const ng = vis(t, A("s3:Negeri") - 0.1, A("s3:Mereka") + 0.2, 0.2, 0.4);
    if (ng > 0.01) { const a = Math.min(gL[0], gR[0]) - 20, b = Math.min(gL[1], gR[1]) - 20, c = Math.max(gL[2], gR[2]) + 20, d = Math.max(gL[3], gR[3]) + 20; brk(a, b, c, d, MINT, ng, 36, 3); txt("NEGERI YANG BAIK", (a + c) / 2, d + 36, { align: "center", alpha: ng, size: 24 }); }
    const ghost = vis(t, K.s7 + 1.4, K.s7e, 0.5, 0.4);
    if (ghost > 0.01) {
      X.setLineDash([10, 9]);
      for (const g of [gL, gR]) { X.globalAlpha = ghost; X.strokeStyle = WHITE; X.lineWidth = 2.5; X.strokeRect(g[0], g[1], g[2] - g[0], g[3] - g[1]); }
      X.setLineDash([]); X.globalAlpha = 1;
      txt("DUA KEBUN", (gL[0] + gR[2]) / 2, Math.min(gL[1], gR[1]) - 14, { align: "center", alpha: ghost, color: WHITE });
      const tn = vis(t, A("s7:tanda") - 0.1, K.s7e, 0.3, 0.4);
      if (tn > 0.01) { const [sx, sy] = P(30, 0, 0); X.globalAlpha = tn; X.strokeStyle = MINT; X.lineWidth = 3; X.beginPath(); X.arc(sx, sy, 250 + 20 * (1 - tn), 0, 6.283); X.stroke(); X.globalAlpha = 1; txt("TANDA", sx, sy + 290, { align: "center", alpha: tn, size: 26 }); }
    }
    // dam label (s2 opening and s5 opening)
    const dl = vis(t, K.s2 + 0.2, A("s2:Dua"), 0.3, 0.3) + vis(t, K.s5 - 0.1, tB + 0.2, 0.2, 0.1);
    pin(DAMX, 8.5, ZC, -170, 90, [["BENDUNGAN", WHITE]], WHITE, Math.min(1, dl));
    // flood alarm pinned to the water front (hook + s5)
    const age = fAge(t);
    if (age > 0.05 && t < K.s6 - 0.3) {
      const F = 330 * (1 - Math.exp(-age * 0.7)), fx = DAMX + Math.max(18, F * 0.72);
      const fa = (t < K.s2 ? 1 - ramp(t, tR0 - 0.1, tR0 + 0.2) : 1 - ramp(t, A("s5:Kebun") - 0.2, A("s5:Kebun") + 0.2)) * ramp(age, 0.05, 0.4);
      const ln = [["BANJIR BESAR", RED]]; if (t > tB) ln.push(["SAIL AL-'ARIM", AMBER, ramp(t, A("s5:al-arim") - 0.1, A("s5:al-arim") + 0.2)]);
      pin(fx, 0, wz(fx), 120, 60, ln, RED, fa * (0.55 + 0.45 * flick));
    }
    // s3-s4: villages, links, the blessed land, the distance meter
    if (t > K.s3 + 2 && t < K.s5 + 0.2) {
      const D = spacing(t), va = vis(t, A("s3:jalur") - 0.2, K.s5 + 0.2, 0.3, 0.5);
      const amb = ramp(t, tJ, tJ + 1.2);
      const SP = []; for (let i = 0; i < NV; i++) { const s = vilS(i, D); SP.push(P(roadX(s), 0, roadZ(s))); }
      for (let i = 0; i < NV - 1; i++) {
        const k = ramp(t, A("s3:kampung-kampung") - 0.2 + i * 0.16, A("s3:kampung-kampung") + 0.1 + i * 0.16) * va;
        if (k <= 0.01) continue;
        const [x0, y0] = SP[i], [x1, y1] = SP[i + 1];
        X.globalAlpha = k; X.strokeStyle = amb > 0.5 ? AMBER : MINT; X.lineWidth = 3; if (amb > 0.5) X.setLineDash([12, 10]);
        X.beginPath(); X.moveTo(x0, y0); X.lineTo(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k); X.stroke(); X.setLineDash([]); X.globalAlpha = 1;
      }
      for (let i = 0; i < NV; i++) {
        const a = ramp(t, A("s3:jalur") + i * 0.12, A("s3:jalur") + 0.25 + i * 0.12) * va; if (a <= 0.01) continue;
        const [x, y] = SP[i]; if (y < 150 || y > 1290) continue;
        X.globalAlpha = a; X.strokeStyle = i === 12 ? WHITE : amb > 0.5 ? AMBER : MINT; X.lineWidth = 3; X.beginPath(); X.arc(x, y, i === 12 ? 22 : 12, 0, 6.283); X.stroke();
        X.fillStyle = X.strokeStyle; X.beginPath(); X.arc(x, y, 3.5, 0, 6.283); X.fill(); X.globalAlpha = 1;
      }
      const [x0, y0] = SP[0]; txt("KAMPUNG", x0 + 24, y0 + 8, { alpha: ramp(t, A("s3:kampung-kampung"), A("s3:kampung-kampung") + 0.3) * va * (1 - amb), size: 22 });
      const [xa, ya] = SP[2], [xb, yb] = SP[3];
      txt("AMAN", (xa + xb) / 2 + 22, (ya + yb) / 2 + 8, { alpha: ramp(t, A("s3:aman") - 0.1, A("s3:aman") + 0.2) * va * (1 - amb), size: 22 });
      const [xc, yc] = SP[12]; if (yc > 150) txt("NEGERI YANG DIBERKAHI", xc, yc - 36, { align: "center", color: WHITE, alpha: ramp(t, A("s3:diberkahi") - 0.1, A("s3:diberkahi") + 0.3) * va, size: 23 });
      txt("JALUR PERJALANAN", x0 + 24, y0 + 44, { alpha: vis(t, A("s3:jalur") - 0.1, A("s3:kampung-kampung") + 0.2, 0.2, 0.3), size: 22, color: WHITE });
      // distance meter
      const ma = vis(t, tJ - 0.4, K.s5 + 0.1, 0.3, 0.3);
      if (ma > 0.01) {
        const f = ramp(t, tJ, tJ + 3.6), x0m = 250, w = 520, ym = 1140;
        X.globalAlpha = ma; X.fillStyle = "rgba(3,11,15,.8)"; X.fillRect(x0m - 16, ym - 44, w + 32, 74);
        X.strokeStyle = WHITE; X.lineWidth = 2; X.strokeRect(x0m, ym, w, 14);
        X.fillStyle = f > 0.5 ? AMBER : MINT; X.fillRect(x0m, ym, w * (0.22 + 0.78 * f), 14); X.globalAlpha = 1;
        txt("JARAK PERJALANAN", x0m, ym - 14, { size: 20, color: WHITE, bg: false, alpha: ma });
        txt(f < 0.5 ? "DEKAT" : "JAUH", x0m + w, ym - 14, { size: 20, align: "right", color: f < 0.5 ? MINT : AMBER, bg: false, alpha: ma });
      }
    }
    // s5: what grew instead
    const sp = (i, w, dx, dy, lbl) => { const o = SB[i], a = vis(t, A(w) - 0.1, K.s5e + 0.35, 0.2, 0.3); pin(o.x, o.y + 1, o.z, dx, dy, [[lbl, AMBER]], AMBER, a); };
    sp(0, "s5:pahit", 150, -80, "BERBUAH PAHIT"); sp(1, "s5:atsl", 150, 70, "ATSL"); sp(2, "s5:sidr", -150, 60, "SIDR");
    // s6: the ruin label
    const rl = vis(t, A("s6:Ma'rib") - 0.1, K.s6e + 0.1, 0.3, 0.3);
    if (rl > 0.01) {
      const sl = SLU[1];
      pin(DAMX + 1, sl.G.position.y + 10.5, sl.zc, 150, -120, [["MA'RIB, YAMAN", WHITE], ["± ABAD KE-8 SM", MINT, ramp(t, A("s6:abad") - 0.1, A("s6:abad") + 0.25)], ["UNESCO 2023", MINT, ramp(t, A("s6:2023") - 0.1, A("s6:2023") + 0.25)]], WHITE, rl);
    }
    // rewind glitch bands
    if (t > tR0 - 0.05 && t < tR1 + 0.08) {
      const rr = mulberry(Math.floor(t * 30));
      for (let i = 0; i < 7; i++) { const y = 200 + rr() * 1080, h = 6 + rr() * 30; X.fillStyle = `rgba(${rr() < 0.5 ? "124,243,200" : "255,255,255"},${0.08 + rr() * 0.18})`; X.fillRect(0, y, 1080, h); }
    }
    // scene-change scan sweep (the satellite refreshing its tile)
    for (const k of ["s2", "s3", "s4", "s5", "s6", "s7", "s8"]) {
      const u = (t - (K[k] - 0.18)) / 0.6;
      if (u > 0 && u < 1) {
        const y = 150 + u * 1150;
        const gr = X.createLinearGradient(0, y - 120, 0, y); gr.addColorStop(0, "rgba(124,243,200,0)"); gr.addColorStop(1, "rgba(124,243,200,.16)");
        X.fillStyle = gr; X.fillRect(0, y - 120, 1080, 120); X.fillStyle = "rgba(190,255,230,.85)"; X.fillRect(0, y - 2, 1080, 3);
      }
    }
  }

  // ---------- per frame
  return (t) => {
    const age = fAge(t), scr = scrubAt(t), now = nowAt(t);
    U.uAge.value = age; U.uScrub.value = scr; U.uNow.value = now; U.uT.value = t;
    U.uRes.value = age < 0 ? 1 - now : (1 - 0.92 * ramp(age, 0.1, 4)) * (1 - now);
    U.uFlow.value = age < 0 ? 1 : 1 - ramp(age, 0, 0.6);
    U.uDam.value = 1;
    const D = spacing(t), vA = 1 - ramp(t, tB + 1.5, K.s6 - 0.3);
    U.uRouteLen.value = vilS(12, D) + 6; U.uRoad.value = 1 - 0.7 * now;
    for (let i = 0; i < NV; i++) { const s = vilS(i, D); U.uVil.value[i].set(roadX(s), roadZ(s), i === 12 ? 30 : 15, vA); }

    // camera
    const c = t < CUT ? camK(t) : camK2(t);
    let [tx, tz, la, tilt, hd] = c;
    const sh = (age > 0 && age < 1.2 ? (1 - age / 1.2) : 0) * 1.4;
    tx += Math.sin(t * 0.37) * 1.2 + Math.sin(t * 31) * sh; tz += Math.cos(t * 0.29) * 1.2 + Math.cos(t * 27) * sh;
    hd += Math.sin(t * 0.21) * 0.8;
    const alt = Math.exp(la); ALT = alt; HD = hd;
    const hr = hd * Math.PI / 180, tr = tilt * Math.PI / 180;
    upH.set(Math.sin(hr), 0, -Math.cos(hr));
    camT.set(tx, 0, tz);
    cam.position.set(tx - upH.x * alt * Math.tan(tr), alt, tz - upH.z * alt * Math.tan(tr));
    cam.up.copy(upH); cam.lookAt(camT); cam.updateMatrixWorld();
    scene.fog.color.set(0xa9bccb); scene.background.set(0xa9bccb);
    scene.fog.density = 0.00007 + 0.00002 * clamp01((alt - 300) / 3000);

    // sun + shadow box follow the target
    const sb = Math.max(40, alt * 0.8);
    sunL.position.set(tx + SUN.x * 3000, SUN.y * 3000, tz + SUN.z * 3000); sunL.target.position.set(tx, 0, tz);
    SC.left = -sb; SC.right = sb; SC.top = sb; SC.bottom = -sb; SC.updateProjectionMatrix();

    // dam
    const ab = age;
    SEG.forEach((o, i) => {
      const y0 = groundY(DAMX, o.z) - 1.2 + 4.25;
      let px = DAMX, py = y0, pz = o.z, rx = 0, rz = 0, sy = 1, v = true;
      if (o.burst && ab > 0) {
        const k = 1 - Math.exp(-ab * 1.25);
        px = DAMX + (26 + 34 * o.r1) * k; pz = o.z + (o.r2 - 0.5) * 16 * k;
        py = y0 + 7 * o.r3 * ab * Math.exp(-ab * 1.6) - 6.5 * ramp(ab, 0.5, 2.6);
        rx = (o.r4 - 0.5) * 3 * k; rz = -(0.6 + o.r1) * 1.6 * k;
        v = ab < 5.5;
      }
      if (now > 0.5) { v = !(i >= 2 && i <= 10); sy = 0.3; py = groundY(DAMX, o.z) - 1.2 + 4.25 * 0.3; }
      o.m.visible = v; o.m.position.set(px, py, pz); o.m.rotation.set(rx, 0, rz); o.m.scale.set(1, sy, 1);
      o.m.material = now > 0.5 ? ruinM : stoneM;
    });
    for (const s of SLU) { s.lin.visible = now < 0.5; s.G.children.forEach((m) => { if (m.material !== capM) m.material = now > 0.5 ? ruinM : stoneM; }); s.wing.scale.y = now > 0.5 ? 0.55 : 1; s.wing.position.y = now > 0.5 ? 1.65 : 3; }
    for (let i = 0; i < NDB; i++) {
      const o = DB[i];
      let s = 0.0001;
      if (ab > 0 && ab < 6 && now < 0.5) {
        const k = 1 - Math.exp(-ab * (1 + o.d));
        tv.set(DAMX + (10 + 70 * o.a) * k, Math.max(groundY(DAMX + 40 * k, o.z) + 0.3, o.y + 9 * o.b * ab * Math.exp(-ab * 2) - 3 * ramp(ab, 0.6, 2.5)), o.z + (o.c - 0.5) * 30 * k);
        s = o.s * (1 - ramp(ab, 3.5, 6));
        fe.set(o.a * 9 * k, o.b * 7 * k, o.c * 5 * k);
      } else tv.set(0, -50, 0);
      fq.setFromEuler(fe); fm.compose(tv, fq, fs.set(s, s, s)); deb.setMatrixAt(i, fm);
    }
    deb.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < NRB; i++) { const o = RB[i], s = now > 0.5 ? o.s : 0.0001; fe.set(o.rx, o.ry, 0); fq.setFromEuler(fe); fm.compose(tv.set(o.x, o.y + o.s * 0.3, o.z), fq, fs.set(s, s * 0.7, s * 1.2)); rub.setMatrixAt(i, fm); }
    rub.instanceMatrix.needsUpdate = true;
    gcp.visible = now > 0.5;

    // trees: submerged under the flood, replaced by scrub
    const F = age > 0 ? 330 * (1 - Math.exp(-age * 0.7)) : 0;
    const S = age > 0 ? sm(age / 1.8) * (1 - sm((age - 4) / 3)) : 0;
    const wat = (x, z) => { if (age <= 0) return 0; const dx = x - DAMX; if (dx < 0 || dx > F) return 0; const W = 8 + 66 * S * Math.exp(-dx / 240); return 1 - sm((Math.abs(z - wz(x)) - W + 3) / 3); };
    const repl = (d) => sm((scr * 1.12 - 0.06 - d + 0.08) / 0.16);
    for (let i = 0; i < TR.length; i++) {
      const o = TR[i];
      const s = o.s * (1 - 0.75 * wat(o.x, o.z)) * (1 - repl(o.d));
      fm.compose(tv.set(o.x, o.y - (1 - s / o.s) * 0.6, o.z), fq.identity(), fs.set(s, s * 0.8, s)); trees.setMatrixAt(i, fm);
    }
    trees.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < SB.length; i++) {
      const o = SB[i], g = i < 3 ? sm((scr - 0.2) / 0.4) : repl(o.d), s = Math.max(0.0001, o.s * g);
      fe.set(0, o.rot, 0); fq.setFromEuler(fe); fm.compose(tv.set(o.x, o.y, o.z), fq, fs.set(s, s * o.sy, s)); scrub.setMatrixAt(i, fm);
    }
    scrub.instanceMatrix.needsUpdate = true;

    // villages and caravans
    let hi = 0;
    for (const o of HO) {
      const s0 = vilS(o.v, D), x = roadX(s0) + o.ox, z = roadZ(s0) + o.oz, s = vA > 0.01 ? vA : 0.0001;
      fe.set(0, o.ry, 0); fq.setFromEuler(fe); fm.compose(tv.set(x, groundY(x, z) + o.h * s / 2, z), fq, fs.set(o.w * s, o.h * s, o.d * s)); houses.setMatrixAt(hi++, fm);
    }
    houses.instanceMatrix.needsUpdate = true;
    const RL = vilS(12, D), cvA = vA * (1 - 0.6 * ramp(t, tJ, tJ + 3));
    for (let c2 = 0; c2 < NCV; c2++) for (let j = 0; j < PERC; j++) {
      const sc = (((c2 / NCV + t * 0.011) % 1) * RL) - j * 2.1;
      const x = roadX(sc), z = roadZ(sc), s = cvA > 0.01 && sc > 0 ? cvA : 0.0001;
      const yaw = Math.atan2(roadX(sc + 1) - x, 1);
      fe.set(0, Math.PI / 2 - yaw, 0); fq.setFromEuler(fe); fm.compose(tv.set(x + 1.6, groundY(x, z) + 0.6, z), fq, fs.set(s, s, s)); camel.setMatrixAt(c2 * PERC + j, fm);
    }
    camel.instanceMatrix.needsUpdate = true;

    // clouds: fade in only where the camera is high
    const cw = Math.max(1 - ramp(t, 2.2, 3.0), 0.4 * ramp(t, K.s8 + 1.5, K.s8 + 3));
    for (const m of CL) { const rel = alt - m.position.y; m.visible = rel > 40 && cw > 0.01; m.material.opacity = 0.85 * cw * sm((rel - 40) / 300) * sm((alt - 900) / 600); }

    bp.strength = 0.16; bp.threshold = 0.92;
    comp.render();
    drawHUD(t);
  };
}
