// EP10 DZULQARNAIN, TEMBOK BESI. FLUIDFORGE molten metal in an epic basalt mountain world, cool steel-blue dusk.
// Dzulqarnain is never shown: his presence is a banner with two horn-like crescents and a travelling column of torches (no bearers).
// Ya'juj and Ma'juj are never creatures: only a dark dust storm beyond the pass. People are tiny faceless dark silhouettes.
// World: the pass sits at the origin between two basalt cliffs (gap |x|<6.6), villagers' side +z, storm side -z.
// West (x<-138) a dark muddy sea where the sun sets; east (x>130) an open shelterless plain where it rises.
// Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, track, stage, pts } from "./lib3d.js";

const WALL_H = 24, WALL_W = 14, ROWS = 16, COLS = 6;

// ---------- deterministic terrain
function hash(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
function fbm(x, z) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 5; i++) { s += a * vnoise(x * f, z * f); f *= 2.03; a *= 0.5; } return s; }
const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };

export function H(x, z) {
  const ax = Math.abs(x);
  const wild = sm((ax - 12) / 18);                      // natural noise away from the pass
  const bw = 24 + 14 * fbm(x * 0.012 + 3, 1.7) * wild;
  const band = Math.exp(-Math.pow(z / bw, 2));
  let prof;
  if (ax < 6.6) prof = 0;
  else if (ax < 7.7) prof = WALL_H * sm((ax - 6.6) / 1.1);
  else if (ax < 18) prof = WALL_H + 17 * Math.sin(((ax - 7.7) / 10.3) * Math.PI / 2);
  else prof = 41 - 10 * sm((ax - 18) / 40) + 26 * (fbm(x * 0.025, z * 0.02 + 5) - 0.5) * 2 - 34 * sm((ax - 110) / 45);
  prof = Math.max(0, prof);
  let h = prof * band * (1 + (fbm(x * 0.08, z * 0.08) - 0.5) * 0.25 * sm((ax - 8) / 6));
  // cliff faces: columnar roughness
  h += (vnoise(x * 0.9, z * 0.6) - 0.5) * 1.2 * sm((ax - 7) / 3) * band;
  // rolling foothills everywhere else, flat floor near the pass
  const flat = 1 - sm((Math.hypot(x, z * 0.6) - 40) / 50);
  h += (fbm(x * 0.02 + 9, z * 0.02) - 0.42) * 7 * (1 - flat) + (fbm(x * 0.1, z * 0.1) - 0.5) * 0.5;
  // far ranges behind the storm side and the villagers' side (not over the west sea)
  const land = sm((x + 130) / 20);
  h += (70 * Math.exp(-Math.pow((z + 230) / 45, 2)) + 46 * Math.exp(-Math.pow((z - 270) / 50, 2))) * (0.5 + fbm(x * 0.015, z * 0.01)) * land;
  // west: dives under the muddy sea
  h = h + (-7 - h) * sm((-x - 128) / 22);
  // east: an open plain with no shelter
  h = h + (0.4 + (fbm(x * 0.05, z * 0.05) - 0.5) * 0.8 - h) * sm((x - 112) / 22);
  return h;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x0d1626, fog: 0.004, exp: 1.0, bloom: [0.75, 0.55, 0.78], shadow: false });
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(1083);
  const NOISE = `float hsh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hsh(i),hsh(i+vec2(1,0)),u.x),mix(hsh(i+vec2(0,1)),hsh(i+vec2(1,1)),u.x),u.y);}`;

  // ---------- timing
  const tAsk = A("s5:membayarmu"), tRefuse = A("s6:lebih"), tHelp = A("s6:Bantu");
  const tIron0 = A("s6:Bawakan") + 0.3, tIron1 = A("s6:gunung") + 0.25;
  const tBlow = A("s6:Tiuplah"), tRed = A("s6:menyala") + 0.4;
  const tPour0 = A("s6:tembaga") - 0.1, tPour1 = K.s7 + 1.8;
  const tYaj = A("s5:Ya'juj");
  const hookOn = (t) => t < K.s2 - 0.02;

  // ---------- lights
  const hemi = new THREE.HemisphereLight(0x3a5170, 0x120d0a, 0.9); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1); scene.add(key); scene.add(key.target);
  const fireL = new THREE.PointLight(0xff6a1a, 0, 60, 1.6); fireL.position.set(0, 4, 5); scene.add(fireL);
  const cuL = new THREE.PointLight(0xff9a40, 0, 70, 1.5); cuL.position.set(0, 26, 6); scene.add(cuL);
  const torchL = new THREE.PointLight(0xffa04a, 0, 40, 1.6); scene.add(torchL);
  const moonF = new THREE.DirectionalLight(0xa8c8ec, 0); moonF.position.set(14, 30, 60); scene.add(moonF);
  const stormL = new THREE.PointLight(0x9ab4ff, 0, 160, 1.2); stormL.position.set(-10, 30, -60); scene.add(stormL);

  // ---------- moods (sky, sun, fog), lerped by time keys
  const C = (h) => new THREE.Color(h);
  const ST = {
    HOOK: { top: C(0x070c18), hor: C(0x34506f), az: 186, el: -6, sc: C(0x8fb0d8), si: 0.55, vis: 0, hs: C(0x2c4060), hi: 0.75, fog: 0.0042, exp: 1.0 },
    NOON: { top: C(0x24446a), hor: C(0xb6a690), az: 188, el: 15, sc: C(0xffdcb0), si: 2.2, vis: 1, hs: C(0x6d88a8), hi: 1.0, fog: 0.0036, exp: 1.0 },
    WA: { top: C(0x1d2a48), hor: C(0xd9864e), az: 186, el: 5.5, sc: C(0xffb070), si: 2.0, vis: 1, hs: C(0x55607c), hi: 0.85, fog: 0.0030, exp: 1.0 },
    WB: { top: C(0x12162c), hor: C(0xa8462a), az: 186, el: -1.7, sc: C(0xff7a3a), si: 1.2, vis: 1, hs: C(0x3a3a55), hi: 0.7, fog: 0.0030, exp: 1.0 },
    EA: { top: C(0x26365a), hor: C(0xeaa062), az: -8, el: -1.2, sc: C(0xffbc70), si: 1.6, vis: 1, hs: C(0x5a6684), hi: 0.8, fog: 0.0034, exp: 1.0 },
    EB: { top: C(0x4f74a0), hor: C(0xf0c48c), az: -8, el: 9, sc: C(0xffe2b8), si: 1.9, vis: 1, hs: C(0x7a8ca6), hi: 0.9, fog: 0.0032, exp: 0.92 },
    DUSK: { top: C(0x0b1426), hor: C(0x4a6586), az: 186, el: -5, sc: C(0x9db8dc), si: 0.8, vis: 0, hs: C(0x34496a), hi: 0.85, fog: 0.0032, exp: 1.0 },
    NIGHT: { top: C(0x050912), hor: C(0x24344d), az: 186, el: -9, sc: C(0x7f9cc4), si: 0.5, vis: 0, hs: C(0x22324c), hi: 0.6, fog: 0.0036, exp: 1.0 },
    DAWN: { top: C(0x172540), hor: C(0xb08a78), az: -8, el: -3, sc: C(0xffc49a), si: 0.9, vis: 0, hs: C(0x3c5070), hi: 0.8, fog: 0.0034, exp: 1.0 },
    DAWN2: { top: C(0x26406a), hor: C(0xe8b48a), az: -8, el: 2.5, sc: C(0xffd0a0), si: 1.6, vis: 1, hs: C(0x5a7090), hi: 0.95, fog: 0.0030, exp: 1.0 },
  };
  const MOOD = [[0, "HOOK"], [K.s2 - 0.03, "HOOK"], [K.s2, "NOON"], [K.s3 - 0.5, "WA"], [A("s3:terbenam#2") + 0.6, "WB"], [K.s4 - 0.03, "WB"], [K.s4, "EA"], [A("s4:Di"), "EB"],
    [K.s5 - 0.03, "EB"], [K.s5, "DUSK"], [A("s5:Bolehkah"), "DUSK"], [K.s6 + 2, "NIGHT"], [A("s7:Tapi"), "NIGHT"], [A("s7:Bila"), "DAWN"], [K.s8 + 2, "DAWN2"], [K.dur, "DAWN2"]];
  const M = { top: new THREE.Color(), hor: new THREE.Color(), sc: new THREE.Color(), hs: new THREE.Color() };
  const sunDir = new THREE.Vector3();
  function mood(t) {
    let i = 0; while (i < MOOD.length - 2 && MOOD[i + 1][0] <= t) i++;
    const a = ST[MOOD[i][1]], b = ST[MOOD[i + 1][1]];
    const u = sm((t - MOOD[i][0]) / Math.max(0.001, MOOD[i + 1][0] - MOOD[i][0]));
    for (const k of ["top", "hor", "sc", "hs"]) M[k].copy(a[k]).lerp(b[k], u);
    for (const k of ["az", "el", "si", "vis", "hi", "fog", "exp"]) M[k] = a[k] + (b[k] - a[k]) * u;
    const az = M.az * Math.PI / 180, el = M.el * Math.PI / 180;
    sunDir.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
    return M;
  }

  // ---------- sky dome
  const SU = { uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3() }, uSunC: { value: new THREE.Color() }, uVis: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(850, 48, 24), new THREE.ShaderMaterial({
    uniforms: SU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD;void main(){vD=normalize((modelMatrix*vec4(position,1.)).xyz-cameraPosition);gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 uTop,uHor,uSun,uSunC;uniform float uVis;varying vec3 vD;
${NOISE}
void main(){vec3 d=normalize(vD);float e=d.y;
 vec3 c=mix(uHor,uTop,smoothstep(-.02,.45,e));
 c=mix(c,uHor*.7,smoothstep(0.,-.12,e));
 float g=max(dot(d,uSun),0.);
 c+=uSunC*(pow(g,6.)*.32+pow(g,40.)*.35)*(.35+.65*uVis);
 float st=step(.9985,hsh(floor(d.xz/(abs(d.y)+.3)*420.)))*smoothstep(.15,.6,e)*(1.-uVis)*(1.-smoothstep(.12,.3,uHor.r));
 c+=vec3(st*.6);
 float cl=vn(vec2(atan(d.z,d.x)*6.,e*14.));c=mix(c,c*1.12,smoothstep(.55,.8,cl)*smoothstep(.0,.15,e)*smoothstep(.45,.1,e));
 gl_FragColor=vec4(c,1.);}`,
  }));
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);

  const discTex = canvasTex(256, 256, (g, w) => { g.clearRect(0, 0, w, w); const gr = g.createRadialGradient(128, 128, 4, 128, 128, 128); gr.addColorStop(0, "rgba(255,250,235,1)"); gr.addColorStop(.42, "rgba(255,236,190,1)"); gr.addColorStop(.5, "rgba(255,200,120,.55)"); gr.addColorStop(1, "rgba(255,160,80,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const sunM = new THREE.MeshBasicMaterial({ map: discTex, transparent: true, fog: false, depthWrite: false, color: 0xffffff });
  const sun = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), sunM); sun.renderOrder = -9; scene.add(sun);

  // ---------- terrain: non-uniform grid, dense near the pass
  const NX = 520, NZ = 300;
  const xs = [], zs = [];
  for (let i = 0; i <= NX; i++) { const u = i / NX * 2 - 1; xs.push(470 * Math.sign(u) * Math.pow(Math.abs(u), 1.9)); }
  for (let j = 0; j <= NZ; j++) { const u = j / NZ * 2 - 1; zs.push(330 * Math.sign(u) * Math.pow(Math.abs(u), 1.6)); }
  const tp = new Float32Array((NX + 1) * (NZ + 1) * 3), tc = new Float32Array((NX + 1) * (NZ + 1) * 3), tidx = [];
  const basalt = C(0x17191e), column = C(0x2a2f38), dust = C(0x2c2622), mud = C(0x120d0a), sand = C(0x5a442c), tmpC = new THREE.Color();
  for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) {
    const k = (j * (NX + 1) + i) * 3, x = xs[i], z = zs[j], h = H(x, z);
    tp[k] = x; tp[k + 1] = h; tp[k + 2] = z;
    const sl = Math.min(1, Math.abs(H(x + 0.6, z) - H(x - 0.6, z)) / 1.6 + Math.abs(H(x, z + 0.6) - H(x, z - 0.6)) / 2.4);
    tmpC.copy(dust).lerp(basalt, sm(h / 6)).lerp(column, sl * 0.8);
    tmpC.multiplyScalar(0.8 + 0.4 * vnoise(x * 0.3, z * 0.3));
    tmpC.lerp(mud, sm((-x - 120) / 12)).lerp(sand, sm((x - 110) / 20) * (1 - sm(h / 3)));
    tc[k] = tmpC.r; tc[k + 1] = tmpC.g; tc[k + 2] = tmpC.b;
  }
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1; tidx.push(a, c, b, b, c, d); }
  const tg = new THREE.BufferGeometry();
  tg.setAttribute("position", new THREE.BufferAttribute(tp, 3)); tg.setAttribute("color", new THREE.BufferAttribute(tc, 3)); tg.setIndex(tidx); tg.computeVertexNormals();
  const terrain = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0.05 }));
  terrain.frustumCulled = false; scene.add(terrain);

  // ---------- the dark muddy sea in the west (QS 18:86, as he saw it)
  const WU = { uT: { value: 0 }, uSun: { value: new THREE.Vector3() }, uSunC: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uFog: { value: new THREE.Color() }, uDen: { value: 0.003 }, uSI: { value: 1 } };
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1100, 760, 220, 150), new THREE.ShaderMaterial({
    uniforms: WU, fog: false,
    vertexShader: `uniform float uT;varying vec3 vW;varying vec3 vN;varying float vD;
float wv(vec2 p){return sin(p.x*.18+uT*.55)*.16+sin(p.y*.23-uT*.4+p.x*.05)*.12+sin((p.x-p.y)*.41+uT*.8)*.05;}
void main(){vec3 p=(modelMatrix*vec4(position,1.)).xyz;float h=wv(p.xz);float e=.3;
 vN=normalize(vec3(wv(p.xz-vec2(e,0.))-wv(p.xz+vec2(e,0.)),2.*e,wv(p.xz-vec2(0.,e))-wv(p.xz+vec2(0.,e))));
 p.y+=h;vW=p;vec4 mv=viewMatrix*vec4(p,1.);vD=-mv.z;gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `uniform vec3 uSun,uSunC,uHor,uFog;uniform float uDen,uT,uSI;varying vec3 vW;varying vec3 vN;varying float vD;
${NOISE}
void main(){vec3 V=normalize(cameraPosition-vW);vec3 N=normalize(vN+vec3(vn(vW.xz*.4+uT*.05)-.5,0.,vn(vW.zx*.4-uT*.04)-.5)*.18);
 float fr=pow(1.-max(dot(N,V),0.),4.);
 vec3 base=vec3(.045,.03,.022)*(.8+.4*vn(vW.xz*.08));
 vec3 R=reflect(-V,N);float sp=pow(max(dot(R,uSun),0.),70.)*2.2+pow(max(dot(R,uSun),0.),8.)*.18;
 vec3 c=base+uHor*fr*.55+uSunC*sp*uSI;
 float fd=1.-exp(-pow(uDen*vD,2.));gl_FragColor=vec4(mix(c,uFog,fd),1.);}`,
  }));
  sea.rotation.x = -Math.PI / 2; sea.position.set(-690, -0.4, 0); sea.frustumCulled = false; scene.add(sea);

  // ---------- wall: iron blocks with a heat shader (bottom-up glow front, brighter molten seams)
  const HU = { uFront: { value: -5 }, uHeatK: { value: 0 } };
  const ironM = new THREE.MeshStandardMaterial({ color: 0x5a5f68, roughness: 0.5, metalness: 0.3, emissive: 0x262e3c });
  ironM.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, HU);
    s.vertexShader = s.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vHw;varying vec2 vHuv;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvec4 hwp=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nhwp=instanceMatrix*hwp;\n#endif\nvHw=(modelMatrix*hwp).xyz;vHuv=uv;");
    s.fragmentShader = s.fragmentShader.replace("#include <common>", `#include <common>\nvarying vec3 vHw;varying vec2 vHuv;uniform float uFront,uHeatK;\n${NOISE}`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
 float ha=smoothstep(uFront+.5,uFront-2.5,vHw.y)*uHeatK;
 vec2 q=abs(vHuv*2.-1.);float seam=smoothstep(.78,1.,max(q.x,q.y));
 float nz=vn(vHw.xy*1.7+vHw.z)*.5+vn(vHw.xy*5.)*.5;
 float hh=ha*(.65+.5*nz)+seam*ha*.9;
 totalEmissiveRadiance+=mix(vec3(.45,.04,.0),vec3(1.3,.42,.08),clamp(hh*hh,0.,1.))*hh*.6;`);
  };
  const NB = ROWS * COLS * 2;
  const bw = WALL_W / COLS, bh = WALL_H / ROWS, bd = 1.6;
  const blocks = new THREE.InstancedMesh(new THREE.BoxGeometry(bw * 0.97, bh * 0.95, bd * 0.97), ironM, NB);
  blocks.frustumCulled = false; scene.add(blocks);
  const BL = [];
  for (let r0 = 0; r0 < ROWS; r0++) for (let l = 0; l < 2; l++) for (let c = 0; c < COLS; c++) {
    const k = r0 * 12 + l * 6 + c;
    BL[k] = { x: -WALL_W / 2 + (c + 0.5) * bw + (rnd() - .5) * 0.06, y: (r0 + 0.5) * bh, z: (l - 0.5) * bd, side: c < 3 ? -1 : 1, rz: (rnd() - .5) * 0.03, sp: rnd() };
  }
  const bm = new THREE.Matrix4(), bq = new THREE.Quaternion(), bs = new THREE.Vector3(), bpv = new THREE.Vector3(), be = new THREE.Euler();
  // iron piles where the blocks come from
  const piles = new THREE.InstancedMesh(new THREE.BoxGeometry(bw * 0.9, bh * 0.85, bd * 0.9), ironM, 60);
  piles.frustumCulled = false; scene.add(piles);
  const PL = [];
  for (let i = 0; i < 60; i++) { const s = i < 30 ? -1 : 1, a = rnd() * 6.28, rr = Math.sqrt(rnd()) * 3.2; PL.push({ x: s * 15 + Math.cos(a) * rr, z: 19 + Math.sin(a) * rr * 0.8, y: 0.6 + (1 - rr / 3.2) * 2.2 * rnd(), ry: rnd() * 3, k: rnd() }); }

  // ---------- copper skin (front, back, top): flows down from the top, hot then cooling to an iridescent sheen
  const CU = { uF: { value: 0 }, uT: { value: 0 }, uCool: { value: 0 }, uSun: { value: new THREE.Vector3() }, uSunC: { value: new THREE.Color() }, uSI: { value: 1 }, uFog: { value: new THREE.Color() }, uDen: { value: 0.004 } };
  const cuM = new THREE.ShaderMaterial({
    uniforms: CU, fog: false, side: THREE.DoubleSide,
    vertexShader: `varying vec3 vW;varying vec3 vN;varying float vD;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);vec4 mv=viewMatrix*w;vD=-mv.z;gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `uniform float uF,uT,uCool,uSI,uDen;uniform vec3 uSun,uSunC,uFog;varying vec3 vW;varying vec3 vN;varying float vD;
${NOISE}
void main(){float dep=${WALL_H.toFixed(1)}-vW.y;float x=vW.x;
 float drip=(vn(vec2(x*1.1,3.))-.5)*3.2+(vn(vec2(x*3.7,7.))-.5)*1.3;
 float reach=uF*26.-1.+drip*min(1.,uF*3.);
 float edge=reach-dep;if(edge<0.)discard;
 float fresh=exp(-edge*.32);
 float flow=vn(vec2(x*2.2+vW.z,vW.y*.45+uT*2.4))*.6+vn(vec2(x*6.,vW.y*1.3+uT*4.))*.4;
 vec3 hot=mix(vec3(.7,.19,.03),vec3(1.15,.6,.2),fresh)*(.8+.4*flow);
 vec3 V=normalize(cameraPosition-vW);vec3 N=normalize(vN+vec3(flow-.5,flow-.5,0.)*.35);
 float fr=pow(1.-abs(dot(N,V)),2.);
 vec3 cu=vec3(.78,.38,.2);
 vec3 ir=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+fr*1.4+flow*.7+vW.y*.035));
 float df=max(dot(N,uSun),0.)*uSI;
 vec3 cool=cu*(.32+.6*df)+ir*cu*.75*(.35+fr)+pow(max(dot(reflect(-V,N),uSun),0.),24.)*uSunC*.5*uSI;
 vec2 gq=abs(fract(vec2((x+7.)/2.3333,vW.y/1.5))-.5)*2.;float seam=smoothstep(.82,1.,max(gq.x,gq.y));
 float hm=vn(vW.xy*.9)*.6+vn(vW.xy*3.1)*.4;
 float heat=(1.-uCool)*(.5+.5*fresh)*(1.-smoothstep(4.,26.,edge)*.35);
 cool*=mix(.62,1.25,seam)*(.8+.45*hm);cool+=vec3(.9,.45,.15)*seam*.18*(1.-uCool*.5);
 vec3 c=mix(cool,hot,clamp(heat,0.,1.));
 c+=vec3(.7,.22,.04)*smoothstep(.12,0.,edge)*(1.-uCool*.6);
 float fd=1.-exp(-pow(uDen*vD,2.));gl_FragColor=vec4(mix(c,uFog,fd),1.);}`,
  });
  const cuF = new THREE.Mesh(new THREE.PlaneGeometry(WALL_W + 0.2, WALL_H, 40, 60), cuM); cuF.position.set(0, WALL_H / 2, bd + 0.03); scene.add(cuF);
  const cuB = new THREE.Mesh(new THREE.PlaneGeometry(WALL_W + 0.2, WALL_H, 40, 60), cuM); cuB.position.set(0, WALL_H / 2, -bd - 0.03); cuB.rotation.y = Math.PI; scene.add(cuB);
  const cuT = new THREE.Mesh(new THREE.PlaneGeometry(WALL_W + 0.2, bd * 2 + 0.06), cuM); cuT.rotation.x = -Math.PI / 2; cuT.position.set(0, WALL_H + 0.02, 0); scene.add(cuT);

  // ---------- gantry, chains and three crucibles over the wall top; molten streams
  const timber = new THREE.MeshStandardMaterial({ color: 0x2a1c12, roughness: 0.85 });
  const darkIron = new THREE.MeshStandardMaterial({ color: 0x25272b, roughness: 0.5, metalness: 0.6 });
  const gantry = new THREE.Group(); scene.add(gantry);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(22, 0.9, 0.9), timber); beam.position.set(0, 31, 0); gantry.add(beam);
  const CRU = [];
  const streamM = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uT;varying vec2 vU;${NOISE}void main(){float f=vn(vec2(vU.x*6.,vU.y*5.+uT*9.));float s=sin(vU.x*3.1416);gl_FragColor=vec4(vec3(1.0,.45,.12)*(.7+.6*f)*s,1.);}`,
  });
  const lipM = new THREE.MeshBasicMaterial({ color: 0xb4501a });
  [-4.2, 0, 4.2].forEach((x, i) => {
    const piv = new THREE.Group(); piv.position.set(x, 28.4, 0.6); gantry.add(piv);
    const bowl = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0, -1), new THREE.Vector2(0.9, -0.9), new THREE.Vector2(1.25, -0.2), new THREE.Vector2(1.35, 0.6), new THREE.Vector2(1.45, 0.75)], 18), darkIron);
    piv.add(bowl);
    const lip = new THREE.Mesh(new THREE.CircleGeometry(1.3, 18), lipM); lip.rotation.x = -Math.PI / 2; lip.position.y = 0.5; piv.add(lip);
    for (const s of [-1, 1]) { const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 5), darkIron); ch.position.set(s * 1.3, 1.6, 0); piv.add(ch); }
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 1, 10, 1, true), streamM); st.frustumCulled = false; scene.add(st);
    CRU.push({ piv, st, x, k: i * 0.18 });
  });

  // ---------- bellows and the fire trough at the villagers' foot of the wall
  const leather = new THREE.MeshStandardMaterial({ color: 0x3b2618, roughness: 0.9 });
  const BEL = [];
  [-4.6, -1.55, 1.55, 4.6].forEach((x, i) => {
    const G = new THREE.Group(); G.position.set(x, 0, 5.2); G.rotation.y = Math.PI; scene.add(G);
    const bot = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.14, 2.6), timber); bot.position.set(0, 0.35, 0.6); G.add(bot);
    const topP = new THREE.Group(); topP.position.set(0, 0.42, -0.6); G.add(topP);
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.14, 2.6), timber); top.position.set(0, 0, 1.25); topP.add(top);
    const bag = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 2.2, 10, 1), leather); bag.rotation.x = Math.PI / 2; bag.position.set(0, 0.55, 0.7); G.add(bag);
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.16, 1.4, 8), darkIron); nozzle.rotation.x = Math.PI / 2; nozzle.position.set(0, 0.45, -1.1); G.add(nozzle);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 6), timber); handle.position.set(0, 0.15, 2.4); handle.rotation.x = 0.2; topP.add(handle);
    BEL.push({ topP, bag, k: i * 1.3 });
  });
  const trough = new THREE.Mesh(new THREE.BoxGeometry(WALL_W, 0.5, 1.4), darkIron); trough.position.set(0, 0.25, 2.6); scene.add(trough);
  const coals = new THREE.Mesh(new THREE.BoxGeometry(WALL_W - 0.3, 0.1, 1.2), new THREE.MeshBasicMaterial({ color: 0xff5010 })); coals.position.set(0, 0.52, 2.6); scene.add(coals);

  // ---------- peak line measure (iron level reaches the cliff shoulders)
  const peakM = new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0 });
  const peakLine = new THREE.Mesh(new THREE.BoxGeometry(19, 0.09, 0.09), peakM); peakLine.position.set(0, WALL_H, 2.2); scene.add(peakLine);
  const peakTicks = [];
  for (const s of [-1, 1]) { const tk = new THREE.Mesh(new THREE.BoxGeometry(0.09, 2.2, 0.09), peakM); tk.position.set(s * 9.5, WALL_H, 2.2); scene.add(tk); peakTicks.push(tk); }

  // ---------- the banner with two horn-like crescents
  const banTex = canvasTex(256, 360, (g, w, h) => {
    const BGC = "#3a1414";
    g.fillStyle = BGC; g.fillRect(0, 0, w, h);
    const horn = (cx, rot) => { g.save(); g.translate(cx, 168); g.rotate(rot); g.fillStyle = "#e3b14f"; g.beginPath(); g.arc(0, 0, 46, 0, 7); g.fill(); g.fillStyle = BGC; g.beginPath(); g.arc(0, -17, 41, 0, 7); g.fill(); g.restore(); };
    horn(84, -0.45); horn(172, 0.45);
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.45)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#d9a441"; g.lineWidth = 8; g.strokeRect(14, 14, w - 28, h - 28);
  });
  const banner = new THREE.Group(); scene.add(banner);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 7.4, 8), darkIron); pole.position.y = 3.7; banner.add(pole);
  const fin = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 6), new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: 0.8, roughness: 0.3 })); fin.position.y = 7.7; banner.add(fin);
  const clothG = new THREE.PlaneGeometry(2.3, 3.2, 14, 8);
  const clothBase = clothG.attributes.position.array.slice();
  const cloth = new THREE.Mesh(clothG, new THREE.MeshStandardMaterial({ map: banTex, side: THREE.DoubleSide, roughness: 0.8, emissive: 0x2a0d06, emissiveIntensity: 0.2 }));
  cloth.position.set(1.2, 5.6, 0); banner.add(cloth);

  // ---------- torches (no bearers): poles + flames
  const NT = 24;
  const tPoles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.06, 3.2, 5), darkIron, NT); tPoles.frustumCulled = false; scene.add(tPoles);
  const flames = pts(scene, NT * 5, { color: 0xffa040, size: 1.3, add: true });
  const tseed = []; for (let i = 0; i < NT * 5; i++) tseed.push([rnd(), rnd(), rnd()]);

  // path helpers: arc-length walk along a polyline, extrapolated backwards past the start
  function poly(ptsA) { const L = [0]; for (let i = 1; i < ptsA.length; i++) L.push(L[i - 1] + Math.hypot(ptsA[i][0] - ptsA[i - 1][0], ptsA[i][1] - ptsA[i - 1][1])); return { p: ptsA, L, len: L[L.length - 1] }; }
  function walk(P, a, out) {
    let i = 0;
    if (a <= 0) { const [x0, z0] = P.p[0], [x1, z1] = P.p[1], l = P.L[1]; out.set(x0 + (x0 - x1) / l * -a, 0, z0 + (z0 - z1) / l * -a); out.dx = (x1 - x0) / l; out.dz = (z1 - z0) / l; return out; }
    a = Math.min(a, P.len);
    while (i < P.p.length - 2 && P.L[i + 1] < a) i++;
    const [x0, z0] = P.p[i], [x1, z1] = P.p[i + 1], l = P.L[i + 1] - P.L[i], f = (a - P.L[i]) / l;
    out.set(x0 + (x1 - x0) * f, 0, z0 + (z1 - z0) * f); out.dx = (x1 - x0) / l; out.dz = (z1 - z0) / l; return out;
  }
  const PW = poly([[-12, 54], [-30, 52], [-58, 47], [-88, 41], [-112, 33], [-133, 26]]);
  const PE = poly([[104, 52], [128, 44], [150, 37], [164, 33]]);
  const PP = poly([[-4, 130], [-2, 90], [-1, 52], [-6, 30], [-11, 15]]);
  const PX = poly([[-11, 15], [-6, 34], [0, 70], [8, 120], [14, 170]]);
  const PLANT = { x: -11.5, z: 12 };
  function headArc(t) {
    if (t < K.s3) return { P: PW, a: 8 * clamp01((t - K.s2) / (K.s3 - K.s2)) };
    if (t < K.s4) return { P: PW, a: 8 + (PW.len - 8) * sm((t - K.s3 - 0.3) / (A("s3:terbenam") - K.s3 - 0.3)) };
    if (t < K.s5) return { P: PE, a: PE.len * eout((t - K.s4 + 1.2) / (A("s4:kaum") - K.s4 + 1.2)) };
    if (t < K.s6) return { P: PP, a: PP.len * sm((t - K.s5 + 0.5) / (A("s5:Sebuah") + 1.2 - K.s5 + 0.5)) };
    return { P: PX, a: 70 * clamp01((t - K.s8 - 0.5) / (K.dur - K.s8)) };
  }
  // planted layout: two rows lining the work site, on both cliff feet
  const plantPos = (i, out) => { const s = i % 2 ? 1 : -1, j = Math.floor(i / 2); out.set(s * (9.2 + (j % 2) * 0.8), 0, 4 + j * 2.4); return out; };
  const tv = new THREE.Vector3(), tv2 = new THREE.Vector3(), hp = new THREE.Vector3();
  function torchPos(i, t, out) {
    const planted = (hookOn(t) || (t >= K.s6 && t < K.s8 + 0.5));
    const marching = !hookOn(t) && t >= K.s2;
    const marchP = (tt, o) => { const { P, a } = headArc(tt); const j = Math.floor(i / 2), s = i % 2 ? 1 : -1; walk(P, a - 3.2 * (j + 1), o); o.x += -o.dz * s * 1.1; o.z += o.dx * s * 1.1; return o; };
    if (planted && !(t >= K.s8)) {
      plantPos(i, out);
      if (t >= K.s6 && t < K.s6 + 2.5) { marchP(K.s6 - 0.01, tv2); out.lerp(tv2, 1 - sm((t - K.s6) / 2.5)); }
    } else if (t >= K.s8) {
      marchP(t, out);
      if (t < K.s8 + 2.5) { plantPos(i, tv2); out.lerp(tv2, 1 - sm((t - K.s8) / 2.5)); }
    } else if (marching) marchP(t, out);
    out.y = H(out.x, out.z);
    return out;
  }
  function bannerPos(t, out) {
    if (hookOn(t) || (t >= K.s6 && t < K.s8)) { out.set(PLANT.x, 0, PLANT.z); if (t >= K.s6 && t < K.s6 + 2.5) { const { P, a } = headArc(K.s6 - 0.01); walk(P, a, tv2); out.lerp(tv2, 1 - sm((t - K.s6) / 2.5)); } }
    else { const { P, a } = headArc(t); walk(P, a, out); }
    out.y = H(out.x, out.z);
    return out;
  }

  // ---------- faceless people: dark lathe silhouettes
  const figG = new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(.26, .05), new THREE.Vector2(.3, .5), new THREE.Vector2(.24, 1.0), new THREE.Vector2(.18, 1.2), new THREE.Vector2(.2, 1.32), new THREE.Vector2(.17, 1.5), new THREE.Vector2(.08, 1.66), new THREE.Vector2(0, 1.7)], 10);
  const NP = 44, NE = 52;
  const folk = new THREE.InstancedMesh(figG, new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 1 }), NP + NE);
  folk.frustumCulled = false; scene.add(folk);
  const FK = [];
  for (let i = 0; i < NP; i++) FK.push({ x: -7.5 + rnd() * 16, z: 17.5 + rnd() * 10, s: 0.9 + rnd() * 0.25, ph: rnd() * 6.28 });
  for (let i = 0; i < NE; i++) { const a = rnd() * 6.28, rr = 3 + Math.sqrt(rnd()) * 13; FK.push({ x: 190 + Math.cos(a) * rr, z: 30 + Math.sin(a) * rr * 0.8, s: 0.85 + rnd() * 0.3, ph: rnd() * 6.28 }); }
  const fm = new THREE.Matrix4();

  // ---------- the offered coins (QS 18:94) and their refusal (QS 18:95)
  const NCO = 46;
  const coins = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 14), new THREE.MeshStandardMaterial({ color: 0xe0b04a, metalness: 0.9, roughness: 0.28, emissive: 0x5a3a08, emissiveIntensity: 0.5 }), NCO);
  coins.frustumCulled = false; scene.add(coins);
  const CO = []; for (let i = 0; i < NCO; i++) { const a = rnd() * 6.28, rr = Math.sqrt(rnd()) * 0.9; CO.push({ x: Math.cos(a) * rr, z: Math.sin(a) * rr, y: (1 - rr / 0.9) * 0.55 * rnd() + i * 0.004, rx: (rnd() - .5) * 0.6, rz: (rnd() - .5) * 0.6, k: rnd() }); }
  const cloth2 = new THREE.Mesh(new THREE.CircleGeometry(1.4, 20), new THREE.MeshStandardMaterial({ color: 0x4a1d18, roughness: 1 })); cloth2.rotation.x = -Math.PI / 2; scene.add(cloth2);
  const COIN0 = new THREE.Vector3(0.5, 0, 14.6);
  const glint = pts(scene, 40, { color: 0xffe2a0, size: 0.35, add: true });

  // ---------- particles: storm dust (normal blend), embers, fire, impact sparks
  const NS = 900;
  const storm = pts(scene, NS, { color: 0x1d1814, size: 11, add: false, opacity: 0.5 });
  storm.m.fog = false; storm.m.needsUpdate = true;
  const sseed = []; for (let i = 0; i < NS; i++) sseed.push([rnd(), rnd(), rnd(), rnd()]);
  const embers = pts(scene, 520, { color: 0xff8a30, size: 0.32, add: true });
  const eseed = []; for (let i = 0; i < 520; i++) eseed.push([rnd(), rnd(), rnd(), rnd()]);
  const fire = pts(scene, 700, { color: 0xff6418, size: 1.0, add: true });
  const fseed = []; for (let i = 0; i < 700; i++) fseed.push([rnd(), rnd(), rnd(), rnd()]);
  const sparks = pts(scene, 200, { color: 0xffc070, size: 0.4, add: true });
  const kseed = []; for (let i = 0; i < 200; i++) kseed.push([rnd(), rnd(), rnd(), rnd()]);
  const haze = pts(scene, 260, { color: 0xffd8a0, size: 0.9, add: true, opacity: 0.2 });
  const zseed = []; for (let i = 0; i < 260; i++) zseed.push([rnd(), rnd(), rnd()]);

  // ---------- state curves
  const stormA = (t) => (hookOn(t) ? 0.75 : 0) + (t >= K.s5 ? ramp(t, tYaj - 0.6, tYaj + 1.2) * (1 - 0.25 * ramp(t, K.s6, K.s6 + 3)) + 0.3 * ramp(t, K.s7 - 0.5, K.s7 + 0.8) * (1 - ramp(t, A("s7:rahmat"), A("s7:Bila") + 1)) - 0.65 * ramp(t, A("s7:rahmat"), K.s8) : 0);
  const wallOn = (t) => hookOn(t) || t >= K.s6;
  const ironProg = (t) => (hookOn(t) || t >= K.s7 ? 1 : clamp01((t - tIron0) / (tIron1 - tIron0)));
  const heatFront = (t) => (hookOn(t) ? 40 : -2 + 30 * sm((t - tBlow) / (tRed - tBlow)));
  const heatK = (t) => (hookOn(t) ? 1 : 1 - 0.72 * ramp(t, K.s7 + 1.5, A("s7:rahmat")) - 0.16 * ramp(t, A("s7:rahmat"), K.s8 + 3));
  const pourF = (t) => (hookOn(t) ? 0.12 + 0.55 * (t / K.s2) : clamp01((t - tPour0) / (tPour1 - tPour0)));
  const pouring = (t) => hookOn(t) || (t > tPour0 - 0.3 && t < tPour1 + 0.4);
  const cool = (t) => (hookOn(t) ? 0 : ramp(t, tPour1 - 0.5, A("s7:Tapi")) * 0.85 + 0.12 * ramp(t, A("s7:rahmat"), K.s8 + 2));
  const fireA = (t) => (hookOn(t) ? 0.55 : ramp(t, tBlow - 0.3, tBlow + 0.5) * (1 - ramp(t, K.s7 + 0.5, K.s7 + 3)) + 0.25 * (t >= K.s6 && t < tBlow ? 1 : 0));
  const blowA = (t) => (hookOn(t) ? 0.4 : ramp(t, tBlow - 0.2, tBlow + 0.3) * (1 - ramp(t, A("s6:Lalu"), A("s6:Lalu") + 1)));
  const gantryOn = (t) => hookOn(t) || (t > A("s6:Lalu") - 1.2 && t < K.s7 + 3.2);
  const coinA = (t) => (t >= K.s5 && t < K.s7 ? back((t - tAsk + 0.2) / 0.7) : 0);

  // ---------- cameras: [t, cx, cy, cz, lx, ly, lz]; four tracks, cut at the jumps across the world
  const camHook = track([
    [0, 9, 29, 26, 0, 22, 0],
    [A("s1:mendidih"), 12, 24, 42, 0, 18, 0],
    [A("s1:dibangun"), 4, 18, 58, 0, 17, 0],
    [A("s1:gunung"), 0, 17, 92, 0, 19, 0],
    [A("s1:Pembangunnya"), -4, 9, 66, 0, 12, 10],
    [K.s2, -7, 6, 52, 0, 4, 12],
  ]);
  const camW = track([
    [K.s2, -7, 5.2, 66, -12, 5.0, 54],
    [A("s2:Dzulqarnain"), -6, 6.4, 62.5, -12.2, 5.6, 54],
    [A("s2:tanduk"), -8, 8, 66, -12.5, 5.2, 54],
    [A("s2:Siapa"), 4, 22, 90, -16, 6, 50],
    [A("s2:Koresh"), 10, 40, 112, -20, 22, 30],
    [K.s2e, -8, 18, 82, -30, 12, 46],
    [A("s3:jalan"), -30, 62, 100, -100, 30, 36],
    [A("s3:Ia"), -72, 30, 66, -140, 16, 28],
    [A("s3:matahari"), -104, 13, 52, -180, 7, 20],
    [A("s3:terbenam#2"), -118, 9, 49, -200, 6, 14],
    [K.s3e, -121, 8, 48, -210, 5, 14],
  ]);
  const camE = track([
    [K.s4, 116, 8, 66, 170, 7, 40],
    [A("s4:terbit"), 126, 6.5, 58, 190, 7, 34],
    [A("s4:kaum"), 150, 4.2, 48, 192, 2.6, 30],
    [A("s4:sinarnya"), 158, 4.5, 46, 196, 2.8, 30],
    [A("s4:Di"), 150, 18, 66, 188, 1, 32],
    [K.s4e, 142, 28, 78, 188, 0, 30],
  ]);
  const camP = track([
    [K.s5, 0, 74, 178, 0, 16, 0],
    [A("s5:gunung"), 0, 34, 104, 0, 16, 0],
    [A("s5:Sebuah"), 12, 9, 46, 0, 3, 18],
    [A("s5:Ya'juj"), 4, 20, 50, 0, 12, -40],
    [A("s5:kerusakan") + 0.5, 0, 24, 46, 0, 14, -60],
    [A("s5:Bolehkah"), 1.8, 2.0, 9.4, 0.6, 1.9, 20],
    [K.s5e, 2.2, 2.1, 9.2, 0.6, 2.0, 20],
    [tRefuse, 2.6, 2.2, 9.0, 0.6, 2.1, 20],
    [tHelp, 2, 14, 62, 0, 9, 4],
    [tIron0, 0, 17, 76, 0, 15.5, 0],
    [tIron1, 0, 20, 82, 0, 18, 0],
    [tBlow, 13, 5.5, 26, 0, 3.0, 3],
    [A("s6:merah"), 4, 14, 82, 0, 13, 0],
    [A("s6:Lalu"), 2, 16, 74, 0, 15, 0],
    [A("s6:dituangkan"), 14, 36, 58, 0, 20, 0],
    [K.s6e, 8, 34, 64, 0, 18, 0],
    [A("s7:mendakinya"), 0, 40, 72, 0, 21, -8],
    [A("s7:melubanginya"), 6, 31, 82, 0, 17, 0],
    [A("s7:Tapi"), 4, 27, 86, 0, 16, 0],
  ]);
  const camQ = track([
    [A("s7:Tapi") - 0.2, -5, 15, 88, 0, 17, 0],
    [A("s7:ini"), -10, 17, 100, 0, 17, 0],
    [A("s7:rahmat"), -4, 20, 96, 0, 15, 0],
    [K.s7e, 0, 34, 132, 0, 16, 0],
    [K.s8 + 3, 16, 52, 166, 0, 14, 0],
    [K.dur, 34, 66, 196, 0, 12, 4],
  ]);
  // s2: the camera stays with the banner (orbiting, then easing back) before handing over to the westward flight
  const bcam = new THREE.Vector3();
  const camS2 = (t) => {
    bannerPos(t, bcam);
    const u = clamp01((t - K.s2) / (K.s2e - K.s2));
    const ang = 0.55 - 1.0 * u, dist = 9.5 + 9 * sm((t - A("s2:Siapa")) / 4);
    const c = [bcam.x + Math.sin(ang) * dist, bcam.y + 4.4 + 2.5 * sm((t - A("s2:Siapa")) / 4), bcam.z + Math.cos(ang) * dist, bcam.x + 0.4, bcam.y + 5.2, bcam.z];
    const h = sm((t - (K.s2e - 1.1)) / 1.3);
    if (h <= 0) return c;
    const w = camW(t); return c.map((v, i) => v + (w[i] - v) * h);
  };
  const camAt = (t) => (t < K.s2 ? camHook(t) : t < K.s2e + 0.2 ? camS2(t) : t < K.s4 ? camW(t) : t < K.s5 ? camE(t) : t < A("s7:Tapi") - 0.2 ? camP(t) : camQ(t));
  const look = new THREE.Vector3();

  return (t) => {
    const c = camAt(t);
    cam.position.set(c[0] + Math.sin(t * .29) * .2, c[1] + Math.sin(t * .23) * .12, c[2] + Math.cos(t * .31) * .2);
    look.set(c[3], c[4], c[5]); cam.lookAt(look);

    // mood
    const m = mood(t);
    SU.uTop.value.copy(m.top); SU.uHor.value.copy(m.hor); SU.uSun.value.copy(sunDir); SU.uSunC.value.copy(m.sc); SU.uVis.value = m.vis;
    sky.position.copy(cam.position);
    scene.background.copy(m.hor); scene.fog.color.copy(m.hor).multiplyScalar(0.92); scene.fog.density = m.fog;
    r.toneMappingExposure = m.exp;
    hemi.color.copy(m.hs); hemi.groundColor.setRGB(0.07, 0.05, 0.04); hemi.intensity = m.hi;
    key.color.copy(m.sc); key.intensity = m.si; key.position.copy(cam.position).addScaledVector(sunDir, 200); key.target.position.copy(cam.position);
    if (sunDir.y < 0) key.position.y = cam.position.y + 60;
    sun.position.copy(cam.position).addScaledVector(sunDir, 640); sun.lookAt(cam.position);
    sunM.opacity = m.vis; sun.visible = m.vis > 0.01;
    sunM.color.copy(m.sc).lerp(new THREE.Color(1, 1, 1), 0.4);
    WU.uT.value = t; WU.uSun.value.copy(sunDir); WU.uSunC.value.copy(m.sc); WU.uHor.value.copy(m.hor); WU.uFog.value.copy(scene.fog.color); WU.uDen.value = m.fog; WU.uSI.value = m.vis;
    CU.uT.value = t; CU.uSun.value.copy(sunDir.y > 0 ? sunDir : tv.set(sunDir.x, 0.35, sunDir.z).normalize()); CU.uSunC.value.copy(m.sc); CU.uSI.value = Math.max(0.35, m.si * 0.6); CU.uFog.value.copy(scene.fog.color); CU.uDen.value = m.fog;
    moonF.intensity = t >= K.s6 && t < K.s7 ? 3.6 * (1 - 0.6 * ramp(t, tBlow, tRed)) : 0;
    bp.strength = 0.5 + 0.15 * fireA(t); bp.threshold = 0.86;

    // wall blocks
    const ip = ironProg(t), won = wallOn(t);
    for (let k = 0; k < NB; k++) {
      const b = BL[k];
      const tk = tIron0 + (k / NB) * (tIron1 - tIron0 - 0.55);
      let u = hookOn(t) || t >= K.s7 ? 1 : clamp01((t - tk) / 0.55);
      if (!won || (!hookOn(t) && t < tk)) { bs.setScalar(0.0001); bpv.set(0, -50, 0); be.set(0, 0, 0); }
      else {
        const e = eout(u);
        const sx = b.side * 15, sz = 19;
        bpv.set(sx + (b.x - sx) * e, 1 + (b.y - 1) * e + Math.sin(Math.PI * u) * 7, sz + (b.z - sz) * e);
        be.set((1 - e) * 1.4 * b.sp, (1 - e) * 2 * b.side, b.rz);
        bs.setScalar(1);
      }
      bq.setFromEuler(be); bm.compose(bpv, bq, bs); blocks.setMatrixAt(k, bm);
    }
    blocks.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < 60; i++) {
      const p = PL[i];
      const on = t >= K.s6 - 0.5 && t < K.s7 && p.k > ip * 1.05;
      bs.setScalar(on ? 1 : 0.0001); bpv.set(p.x, H(p.x, p.z) + p.y, p.z); be.set(0, p.ry, 0.1);
      bq.setFromEuler(be); bm.compose(bpv, bq, bs); piles.setMatrixAt(i, bm);
    }
    piles.instanceMatrix.needsUpdate = true;
    HU.uFront.value = heatFront(t); HU.uHeatK.value = heatK(t);

    // copper skin
    const F = won ? pourF(t) : 0;
    CU.uF.value = F; CU.uCool.value = cool(t);
    cuF.visible = cuB.visible = cuT.visible = won && F > 0.001;

    // gantry, crucibles, streams
    const gOn = gantryOn(t);
    gantry.visible = gOn;
    gantry.position.y = hookOn(t) ? 0 : 14 * (1 - eout((t - A("s6:Lalu") + 1.2) / 1.0)) + 30 * ramp(t, K.s7 + 2.2, K.s7 + 3.2);
    const pr = pouring(t);
    streamM.uniforms.uT.value = t;
    CRU.forEach((cr) => {
      const tilt = pr ? 0.75 * (hookOn(t) ? 1 : ramp(t, tPour0 - 0.4 + cr.k, tPour0 + 0.2 + cr.k) * (1 - ramp(t, tPour1 - 0.2, tPour1 + 0.4))) : 0;
      cr.piv.rotation.x = -tilt + Math.sin(t * 1.3 + cr.x) * 0.02;
      const on = gOn && tilt > 0.3;
      cr.st.visible = on;
      if (on) { const top = 28.4 + gantry.position.y - 0.2, bot = WALL_H + 0.05; cr.st.position.set(cr.x + Math.sin(t * 7 + cr.x) * 0.03, (top + bot) / 2, 1.25); cr.st.scale.set(1, top - bot, 1); }
    });

    // bellows and fire
    const fa = fireA(t), ba = blowA(t);
    trough.visible = coals.visible = won;
    coals.material.color.setRGB(0.3 + 1.6 * fa, 0.08 + 0.4 * fa, 0.02);
    BEL.forEach((b) => {
      const ph = Math.sin(t * 5.2 + b.k);
      b.topP.rotation.x = -(0.12 + 0.18 * (0.5 + 0.5 * ph) * ba);
      b.bag.scale.set(1, 1, 0.75 + 0.3 * (0.5 + 0.5 * ph) * ba + 0.2 * (1 - ba));
      b.topP.parent.visible = won;
    });
    const puff = ba * (0.5 + 0.5 * Math.sin(t * 5.2));
    fireL.intensity = won ? 110 * fa * (0.75 + 0.25 * puff) + 90 * heatK(t) * clamp01(heatFront(t) / 20) * (won ? 1 : 0) : 0;
    cuL.intensity = won && F > 0 ? 160 * (1 - cool(t)) + 25 : 0;
    stormL.intensity = stormA(t) > 0.1 ? 4000 * Math.pow(Math.max(0, Math.sin(t * 3.7) * Math.sin(t * 1.13 + 2)), 24) * stormA(t) : 0;

    // peak line while stacking
    peakM.opacity = ramp(t, A("s6:Besi"), A("s6:Besi") + 0.4) * (1 - ramp(t, tBlow, tBlow + 0.6)) * (0.7 + 0.3 * Math.sin(t * 8));
    peakLine.visible = peakM.opacity > 0.01;
    peakTicks.forEach((k) => { k.visible = peakLine.visible; });

    // banner + torches
    bannerPos(t, hp); banner.position.copy(hp);
    const dd = headArc(t); walk(dd.P, dd.a, tv);
    const planted = hookOn(t) || (t >= K.s6 && t < K.s8);
    banner.rotation.y = planted ? -0.5 : Math.atan2(-tv.dz, tv.dx) + Math.PI;
    const ca = clothG.attributes.position.array;
    for (let i = 0; i < ca.length; i += 3) { const x = clothBase[i] + 1.15; ca[i + 2] = Math.sin(t * 3.1 - x * 2.2 + clothBase[i + 1] * 0.6) * 0.18 * x; }
    clothG.attributes.position.needsUpdate = true; clothG.computeVertexNormals();
    banner.visible = true;
    torchL.position.set(hp.x + 1, hp.y + 5, hp.z + 1); torchL.intensity = 28 * (m.vis > 0.5 && m.el > 4 ? 0.3 : 1);
    for (let i = 0; i < NT; i++) {
      torchPos(i, t, tv);
      const bob = planted ? 0 : Math.abs(Math.sin(t * 4.4 + i)) * 0.12;
      fm.compose(tv2.set(tv.x, tv.y + 1.6 + bob, tv.z), bq.identity(), bs.setScalar(1)); tPoles.setMatrixAt(i, fm);
      for (let k = 0; k < 5; k++) {
        const s = tseed[i * 5 + k], j = i * 5 + k, ph = (t * (2.2 + s[0]) + s[1]) % 1;
        flames.pos[j * 3] = tv.x + (s[2] - .5) * 0.25 + Math.sin(t * 9 + s[0] * 20) * 0.05;
        flames.pos[j * 3 + 1] = tv.y + 3.3 + bob + ph * 0.8;
        flames.pos[j * 3 + 2] = tv.z + (s[1] - .5) * 0.25;
      }
    }
    tPoles.instanceMatrix.needsUpdate = true; flames.commit();

    // people
    for (let i = 0; i < NP + NE; i++) {
      const f = FK[i];
      let x = f.x, z = f.z, sy = 1;
      if (i < NP && t >= K.s6 && t < K.s7) { x += (f.x < 0.5 ? -1 : 1) * 3.5 * ramp(t, tHelp, tIron0) * (Math.abs(f.x) < 5 ? 1 : 0.4); }
      const sway = Math.sin(t * 1.4 + f.ph) * 0.03;
      fm.compose(tv.set(x, H(x, z), z), bq.setFromEuler(be.set(sway, f.ph, 0)), bs.set(f.s, f.s * sy, f.s));
      folk.setMatrixAt(i, fm);
    }
    folk.instanceMatrix.needsUpdate = true;

    // coins: rise on "membayarmu", slide back toward the villagers on "lebih baik", then gone
    const ca2 = coinA(t), back2 = ramp(t, tRefuse, tRefuse + 1.2), gone = ramp(t, tHelp + 0.6, tHelp + 1.4);
    cloth2.visible = ca2 > 0.01 && gone < 0.99;
    cloth2.position.set(COIN0.x, H(COIN0.x, COIN0.z + 2.6 * back2) + 0.04, COIN0.z + 2.6 * back2);
    for (let i = 0; i < NCO; i++) {
      const o = CO[i];
      const sc = Math.max(0.0001, clamp01(ca2 * 1.3 - o.k * 0.3) * (1 - gone));
      fm.compose(tv.set(COIN0.x + o.x, cloth2.position.y + 0.04 + o.y * clamp01(ca2), COIN0.z + o.z + 2.6 * back2), bq.setFromEuler(be.set(o.rx, 0, o.rz)), bs.setScalar(sc));
      coins.setMatrixAt(i, fm);
    }
    coins.instanceMatrix.needsUpdate = true;
    coins.material.emissiveIntensity = 0.6 * (1 - 0.8 * back2);
    for (let i = 0; i < 40; i++) {
      const o = CO[i], tw = Math.pow(Math.max(0, Math.sin(t * 3 + i * 1.7)), 30);
      const on = ca2 > 0.5 && back2 < 0.5;
      glint.pos[i * 3] = COIN0.x + o.x; glint.pos[i * 3 + 1] = on ? cloth2.position.y + 0.1 + o.y : -99; glint.pos[i * 3 + 2] = COIN0.z + o.z;
      glint.col[i * 3] = glint.col[i * 3 + 1] = glint.col[i * 3 + 2] = tw;
    }
    glint.commit();

    // storm beyond the pass: dust rolls toward the gap; in s7 it piles against the wall, climbs and falls back
    const sa = stormA(t), surge = t >= K.s7 ? ramp(t, K.s7, A("s7:mendakinya") + 0.6) * (1 - ramp(t, A("s7:rahmat"), K.s8)) : 0;
    for (let i = 0; i < NS; i++) {
      const s = sseed[i];
      if (sa < 0.02) { storm.pos[i * 3 + 1] = -500; continue; }
      const cyc = (s[0] * 150 + t * (5 + s[1] * 4)) % 150;
      let z = -152 + cyc, x = (s[2] - .5) * (40 + (-z) * 0.9) + Math.sin(t * 0.4 + s[3] * 9) * 3;
      let y = 1 + s[3] * (12 + (-z) * 0.32) + Math.sin(t * 0.6 + s[0] * 7) * 1.5;
      if (z > -5) { const over = z + 5; z = -5 + Math.min(over, 2.6); y += over * (0.6 + 2.4 * surge) * (Math.abs(x) < 8 ? 1 : 0.3); if (y > WALL_H + 1.5) y = WALL_H + 1.5 - (y - WALL_H - 1.5) * 0.6; x = Math.max(-30, Math.min(30, x)); }
      storm.pos[i * 3] = x; storm.pos[i * 3 + 1] = y; storm.pos[i * 3 + 2] = z;
      const sh = 0.006 + s[1] * 0.014; storm.col[i * 3] = sh * 1.1; storm.col[i * 3 + 1] = sh; storm.col[i * 3 + 2] = sh * 0.9;
    }
    storm.m.opacity = 0.72 * Math.min(1, sa) * (cam.position.z < -4 ? 0.4 : 1);
    storm.commit();

    // embers rising from the hot wall and the fire
    const ea = won ? Math.max(fa, heatK(t) * clamp01(heatFront(t) / 10) * 0.8, pouring(t) ? 1 : 0) : 0;
    for (let i = 0; i < 520; i++) {
      const s = eseed[i];
      if (ea < 0.02 || s[3] > ea) { embers.pos[i * 3 + 1] = -99; continue; }
      const life = (t * (0.35 + s[1] * 0.4) + s[0]) % 1;
      embers.pos[i * 3] = (s[2] - .5) * 18 + Math.sin(t * 1.3 + s[0] * 30) * 1.5 * life;
      embers.pos[i * 3 + 1] = (s[3] < 0.5 ? 0.5 : 10 + s[0] * 14) + life * 14;
      embers.pos[i * 3 + 2] = 2.2 + s[1] * 5 + life * 2;
    }
    embers.commit();
    for (let i = 0; i < 700; i++) {
      const s = fseed[i];
      if (fa < 0.02 || !won) { fire.pos[i * 3 + 1] = -99; continue; }
      const life = (t * (1.4 + s[1]) + s[0]) % 1;
      fire.pos[i * 3] = (s[2] - .5) * (WALL_W - 0.6);
      fire.pos[i * 3 + 1] = 0.6 + life * (1.2 + 2.6 * fa * (0.6 + 0.8 * puff)) * (0.6 + s[3] * 0.6);
      fire.pos[i * 3 + 2] = 2.6 - life * (0.4 + 1.0 * puff) + (s[3] - .5) * 0.6;
      const v = (1 - life) * fa; fire.col[i * 3] = v; fire.col[i * 3 + 1] = v * (0.45 + 0.4 * (1 - life)); fire.col[i * 3 + 2] = v * 0.12;
    }
    fire.commit();
    // sparks: where the dust strikes the far face (cannot pierce it) and where copper meets the iron
    for (let i = 0; i < 200; i++) {
      const s = kseed[i];
      let x = 0, y = -99, z = 0;
      if (i < 110 && t >= K.s7 && t < A("s7:Tapi") + 0.5) {
        const a = (t * (1.2 + s[0]) + s[1]) % 1;
        x = (s[2] - .5) * WALL_W * 0.9; y = 2 + s[3] * 18 + a * 1.5 - a * a * 3; z = -bd - 0.2 - a * 2;
      } else if (i >= 110 && pouring(t) && won) {
        const a = (t * (1.8 + s[0]) + s[1]) % 1;
        const cr = CRU[i % 3];
        x = cr.x + (s[2] - .5) * 2.5 * a; y = WALL_H + 0.2 + a * 2.5 - a * a * 4; z = 1.2 + (s[3] - .5) * 2 * a;
      }
      sparks.pos[i * 3] = x; sparks.pos[i * 3 + 1] = y; sparks.pos[i * 3 + 2] = z;
    }
    sparks.commit();
    // heat haze motes over the shelterless east plain and the sunset shore
    const hz = t >= K.s3 && t < K.s5;
    for (let i = 0; i < 260; i++) {
      const s = zseed[i];
      const cx = t < K.s4 ? -150 : 185, cz = t < K.s4 ? 22 : 32;
      const life = (t * 0.08 + s[0]) % 1;
      haze.pos[i * 3] = hz ? cx + (s[1] - .5) * 70 : 0; haze.pos[i * 3 + 1] = hz ? 0.5 + life * 9 : -99; haze.pos[i * 3 + 2] = cz + (s[2] - .5) * 50;
    }
    haze.m.opacity = 0.1 * (t >= K.s4 ? ramp(t, A("s4:terbit"), A("s4:kaum")) : 0.4);
    haze.commit();

    comp.render();
  };
}
