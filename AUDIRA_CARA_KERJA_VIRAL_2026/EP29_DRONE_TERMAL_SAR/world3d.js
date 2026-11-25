// EP29 DRONE TERMAL SAR. THERMALFORGE look: a FLIR-style world where every material carries a temperature and is shaded
// through an ironbow palette (black > violet > magenta > amber > yellow > white). A screen-space scan line switches
// between the "visible light" night (almost black, moonlit) and the thermal view. One connected world: a generic
// volcano slope (forest of cemara below, open sand and rocks above, a fumarole vent, a distant erupting cone),
// generic SAR crew in orange uniforms, a generic quad drone with a dual gimbal, and a macro microbolometer chip set far
// away (x = 3000) that the camera reaches by diving through the germanium lens.
// Every value is a pure function of t (seeded PRNG only, no accumulated state).
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { ShaderPass } from "./ShaderPass.js";
import { OutputPass } from "./OutputPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, ramp, clamp01, canvasTex, back } from "./lib3d.js";

const W = 1080, H = 1920;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerp = THREE.MathUtils.lerp;
const win = (t, a, b, fi = 0.4, fo = 0.4) => ramp(t, a - fi, a + fi) * (1 - ramp(t, b - fo, b + fo));

// ---------- ironbow (kit palette) ----------
const STOPS = [[0, "#0A0A10"], [0.2, "#310E68"], [0.42, "#9B1D8C"], [0.64, "#EA5E28"], [0.84, "#F7D038"], [1, "#FFFFFF"]];
const lin = (h) => new THREE.Color(h); // THREE.Color from hex is converted to linear working space
const IB_GLSL = (() => {
  let s = "vec3 ib(float x){x=clamp(x,0.,1.);vec3 c=vec3(0.);";
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [a, ca] = STOPS[i], [b, cb] = STOPS[i + 1], A = lin(ca), B = lin(cb);
    s += `if(x>=${a.toFixed(3)})c=mix(vec3(${A.r.toFixed(4)},${A.g.toFixed(4)},${A.b.toFixed(4)}),vec3(${B.r.toFixed(4)},${B.g.toFixed(4)},${B.b.toFixed(4)}),(x-${a.toFixed(3)})/${(b - a).toFixed(3)});`;
  }
  return s + "return c*(1.+1.3*smoothstep(.86,1.,x));}";
})();
export function ibJS(x) {
  x = clamp01(x);
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [a, ca] = STOPS[i], [b, cb] = STOPS[i + 1];
    if (x <= b) return lin(ca).lerp(lin(cb), (x - a) / (b - a));
  }
  return lin("#FFFFFF");
}
const NOISE_GLSL = `float hh3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
return mix(mix(mix(hh3(i),hh3(i+vec3(1,0,0)),f.x),mix(hh3(i+vec3(0,1,0)),hh3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hh3(i+vec3(0,0,1)),hh3(i+vec3(1,0,1)),f.x),mix(hh3(i+vec3(0,1,1)),hh3(i+vec3(1,1,1)),f.x),f.y),f.z);}`;

// shared thermal state (one object, referenced by every thermal material)
const G = {
  uWipe: { value: 0 }, uThOn: { value: 1 }, uTmin: { value: -3 }, uTmax: { value: 36 }, uSun: { value: 0 }, uTair: { value: 1 },
  uAtt: { value: 0.004 }, uHide: { value: 0 },
};
const TH_HEAD = `varying vec3 vWP;varying vec3 vWN;uniform float uWipe,uThOn,uTmin,uTmax,uSun,uTair,uAtt,uT,uV,uF,uSunK,uE;\n${NOISE_GLSL}\n${IB_GLSL}\n`;
const TH_BODY = `{vec3 tn=normalize(vWN);if(!gl_FrontFacing)tn=-tn;vec3 tv=cameraPosition-vWP;float td=length(tv);tv=tv/max(td,1e-4);
float T=uT+uV*((vn3(vWP*uF)*.7+vn3(vWP*uF*3.7)*.3)-.5)*2.;
T+=uSun*uSunK*(11.+8.*max(tn.y,0.));
float em=uE-.45*pow(1.-clamp(abs(dot(tn,tv)),0.,1.),5.);
float Tr=mix(uTair,-22.,clamp(tn.y,0.,1.));
T=mix(Tr,T,em);
T=mix(T,uTair,1.-exp(-td*uAtt));
vec3 tc=ib((T-uTmin)/(uTmax-uTmin));
float tm=uThOn*smoothstep(uWipe+2.5,uWipe-2.5,gl_FragCoord.y);
gl_FragColor.rgb=mix(gl_FragColor.rgb,tc,tm);gl_FragColor.a=mix(gl_FragColor.a,1.,tm);}\n`;

// thermal PBR: MeshStandardMaterial in visible mode, temperature (deg C) through ironbow in thermal mode
function tmat(color, th, pbr = {}) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, envMapIntensity: 0.08, ...pbr });
  const own = { uT: { value: th.T }, uV: { value: th.v ?? 1.5 }, uF: { value: th.f ?? 0.6 }, uSunK: { value: th.sun ?? 0 }, uE: { value: th.e ?? 0.95 } };
  m.userData.th = own;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, G, own);
    sh.vertexShader = "varying vec3 vWP;varying vec3 vWN;\n" + sh.vertexShader
      .replace("#include <defaultnormal_vertex>", "#include <defaultnormal_vertex>\nvWN=(vec4(transformedNormal,0.)*viewMatrix).xyz;")
      .replace("#include <project_vertex>", "#include <project_vertex>\n{vec4 tw=vec4(transformed,1.);\n#ifdef USE_INSTANCING\ntw=instanceMatrix*tw;\n#endif\nvWP=(modelMatrix*tw).xyz;}");
    sh.fragmentShader = TH_HEAD + sh.fragmentShader.replace("#include <dithering_fragment>", TH_BODY + "#include <dithering_fragment>");
  };
  m.customProgramCacheKey = () => "th1";
  return m;
}
// additive particle material with the same visible/thermal switch. attribute aT = temperature, aA = alpha
function pmat(visCol, size) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { ...G, uVis: { value: new THREE.Color(visCol) }, uSize: { value: size } },
    vertexShader: `attribute float aT;attribute float aA;attribute float aS;varying float vT;varying float vA;uniform float uSize;
void main(){vT=aT;vA=aA;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=uSize*aS*(1080./-mv.z)*.5;gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `uniform float uWipe,uThOn,uTmin,uTmax;uniform vec3 uVis;varying float vT;varying float vA;\n${IB_GLSL}
void main(){vec2 p=gl_PointCoord-.5;float r=dot(p,p)*4.;if(r>1.)discard;float a=vA*(1.-r)*(1.-r);
vec3 tc=ib((vT-uTmin)/(uTmax-uTmin));float tm=uThOn*smoothstep(uWipe+2.5,uWipe-2.5,gl_FragCoord.y);
gl_FragColor=vec4(mix(uVis,tc*.9,tm)*a,a);}`,
  });
}

// ---------- geometry helpers ----------
function rbox(w, h, d, r, seg = 3) {
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
  s.moveTo(x, y - r); s.lineTo(x + ww, y - r); s.quadraticCurveTo(x + ww + r, y - r, x + ww + r, y);
  s.lineTo(x + ww + r, y + hh); s.quadraticCurveTo(x + ww + r, y + hh + r, x + ww, y + hh + r);
  s.lineTo(x, y + hh + r); s.quadraticCurveTo(x - r, y + hh + r, x - r, y + hh); s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelSize: r * 0.98, bevelThickness: r, bevelSegments: seg, curveSegments: 4 });
  g.translate(0, 0, -(d - 2 * r) / 2); g.computeVertexNormals();
  return g;
}
const mesh = (geo, mat, parent, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (parent) parent.add(m); return m; };

// ---------- terrain ----------
export const trailX = (z) => 1.5 * Math.sin(z * 0.045) + 0.04 * z;
function hRaw(x, z) {
  return 0.13 * -z + 3.2 * Math.sin(x * 0.045 + 1) * Math.sin(z * 0.03) + 1.3 * Math.sin(x * 0.13 + z * 0.07) + 0.55 * Math.sin(x * 0.31 - z * 0.23) + 0.004 * x * x * 0.3;
}
export function hAt(x, z) {
  const d = Math.abs(x - trailX(z));
  const tr = 1 - clamp01((d - 1.2) / 3); // flatten a trail groove
  return hRaw(x, z) - 0.25 * tr;
}

// ---------- person (generic SAR crew: helmet, face, orange jacket, bent joints) ----------
function person(seed, scale = 1) {
  const R = mulberry(seed);
  const skinV = ["#c68a62", "#a8724f", "#d29a72"][Math.floor(R() * 3)];
  const M = {
    skin: tmat(skinV, { T: 34, v: 0.6, f: 4 }, { roughness: 0.6 }),
    jacket: tmat("#e2601a", { T: 23 + R() * 2, v: 1.2, f: 5 }, { roughness: 0.7 }),
    stripe: tmat("#d9dde0", { T: 20, v: 0.5, f: 5 }, { roughness: 0.3, metalness: 0.2 }),
    pants: tmat("#2c3240", { T: 20, v: 1, f: 5 }),
    helmet: tmat(R() < 0.5 ? "#f2f0ea" : "#f0a21b", { T: 15, v: 0.6, f: 5 }, { roughness: 0.35 }),
    pack: tmat("#33463a", { T: 11, v: 1, f: 5 }),
    boot: tmat("#2a211b", { T: 10, v: 0.8, f: 5 }),
    eye: tmat("#16110e", { T: 33, v: 0.2 }),
    lamp: tmat("#fff3cf", { T: 42, v: 0.2 }, { emissive: "#fff1c8", emissiveIntensity: 3 }),
  };
  const g = new THREE.Group();
  const cap = (r, l, mat) => { const gg = new THREE.CapsuleGeometry(r, l, 4, 10); gg.translate(0, -l / 2 - r * 0.6, 0); return new THREE.Mesh(gg, mat); };
  const hip = new THREE.Group(); hip.position.y = 0.95; g.add(hip);
  mesh(rbox(0.34, 0.2, 0.22, 0.07), M.pants, hip, 0, 0.02, 0);
  const torso = new THREE.Group(); torso.position.y = 0.1; hip.add(torso);
  const tg = rbox(0.48, 0.56, 0.27, 0.1); tg.translate(0, 0.3, 0);
  mesh(tg, M.jacket, torso);
  mesh(rbox(0.49, 0.05, 0.28, 0.02), M.stripe, torso, 0, 0.36, 0);
  mesh(rbox(0.34, 0.42, 0.17, 0.06), M.pack, torso, 0, 0.32, -0.21);
  const neck = mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.1, 10), M.skin, torso, 0, 0.62, 0);
  const head = new THREE.Group(); head.position.y = 0.76; torso.add(head);
  const hg = new THREE.SphereGeometry(0.105, 20, 14); hg.scale(1, 1.12, 1.02);
  mesh(hg, M.skin, head);
  mesh(new THREE.SphereGeometry(0.018, 8, 6), M.skin, head, 0, -0.01, 0.105);
  mesh(new THREE.SphereGeometry(0.012, 8, 6), M.eye, head, 0.036, 0.025, 0.094);
  mesh(new THREE.SphereGeometry(0.012, 8, 6), M.eye, head, -0.036, 0.025, 0.094);
  const hm = new THREE.SphereGeometry(0.125, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2); hm.scale(1, 0.9, 1.08);
  mesh(hm, M.helmet, head, 0, 0.035, -0.005);
  mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.018, 20), M.helmet, head, 0, 0.035, 0.0);
  const lamp = mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.03, 12), M.lamp, head, 0, 0.07, 0.125); lamp.rotation.x = Math.PI / 2;
  const limbs = {};
  for (const sd of [1, -1]) {
    const sh = new THREE.Group(); sh.position.set(0.27 * sd, 0.52, 0); torso.add(sh);
    sh.add(cap(0.055, 0.2, M.jacket));
    const el = new THREE.Group(); el.position.y = -0.29; sh.add(el);
    el.add(cap(0.048, 0.18, M.jacket));
    mesh(new THREE.SphereGeometry(0.048, 10, 8), M.skin, el, 0, -0.27, 0.0);
    const hp = new THREE.Group(); hp.position.set(0.1 * sd, -0.02, 0); hip.add(hp);
    hp.add(cap(0.075, 0.3, M.pants));
    const kn = new THREE.Group(); kn.position.y = -0.43; hp.add(kn);
    kn.add(cap(0.065, 0.3, M.pants));
    mesh(rbox(0.12, 0.09, 0.24, 0.035), M.boot, kn, 0, -0.43, 0.05);
    limbs[sd] = { sh, el, hp, kn };
  }
  g.scale.setScalar(scale);
  // pose: ph = walk phase (rad), w = walk amount 0..1
  g.userData.pose = (ph, w = 1, look = 0) => {
    for (const sd of [1, -1]) {
      const L = limbs[sd], s = Math.sin(ph + (sd > 0 ? 0 : Math.PI));
      L.hp.rotation.x = -0.45 * s * w - 0.08;
      L.kn.rotation.x = 0.18 + 0.55 * w * Math.max(0, Math.sin(ph + (sd > 0 ? 0 : Math.PI) + 1.3));
      L.sh.rotation.x = 0.4 * s * w * -1 + 0.08;
      L.sh.rotation.z = 0.1 * sd;
      L.el.rotation.x = -0.45 - 0.15 * w;
    }
    hip.position.y = 0.95 - 0.025 * w * Math.abs(Math.cos(ph));
    torso.rotation.x = 0.1 * w;
    head.rotation.y = look;
  };
  g.userData.pose(0, 0);
  g.userData.limbs = limbs;
  return g;
}

// ---------- drone (generic quad with dual gimbal) ----------
function drone(labelTex, withEnv) {
  const g = new THREE.Group();
  const shell = tmat("#30343c", { T: 21, v: 1.5, f: 6 }, { roughness: 0.38, metalness: 0.45 });
  const dark = tmat("#16181c", { T: 17, v: 1, f: 6 }, { roughness: 0.5, metalness: 0.3, envMapIntensity: 0.5 });
  const motor = tmat("#5a5f68", { T: 48, v: 3, f: 9 }, { roughness: 0.3, metalness: 0.9, envMapIntensity: 0.8 });
  const prop = tmat("#1b1d22", { T: 6, v: 1, f: 6 }, { roughness: 0.4 });
  const batt = tmat("#3b3f48", { T: 31, v: 1.2, f: 6 }, { roughness: 0.45, metalness: 0.3 });
  mesh(rbox(0.42, 0.12, 0.6, 0.05), shell, g, 0, 0, 0);
  mesh(rbox(0.32, 0.09, 0.42, 0.04), batt, g, 0, 0.1, -0.04);
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.07), new THREE.MeshStandardMaterial({ map: labelTex, transparent: true, roughness: 0.5, emissive: "#ffffff", emissiveMap: labelTex, emissiveIntensity: 0.5 }));
  lab.rotation.x = -Math.PI / 2; lab.position.set(0, 0.148, -0.02); g.add(lab);
  const props = [];
  for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const arm = mesh(rbox(0.05, 0.04, 0.5, 0.018), dark, g, sx * 0.3, 0.01, sz * 0.32);
    arm.rotation.y = Math.atan2(sx, sz);
    const mx = sx * 0.47, mz = sz * 0.5;
    mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.08, 16), motor, g, mx, 0.05, mz);
    mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8), dark, g, mx, -0.07, mz);
    const p = new THREE.Group(); p.position.set(mx, 0.1, mz); g.add(p);
    const bl = rbox(0.4, 0.008, 0.035, 0.003, 1);
    mesh(bl, prop, p); const b2 = mesh(bl, prop, p); b2.rotation.y = Math.PI / 2;
    props.push(p);
  }
  // nav lights
  mesh(new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshBasicMaterial({ color: "#ff3b30" }), g, 0.47, 0.0, 0.5);
  mesh(new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshBasicMaterial({ color: "#2bff88" }), g, -0.47, 0.0, 0.5);
  // gimbal: visible camera (glass) + thermal camera (germanium)
  const gim = new THREE.Group(); gim.position.set(0, -0.13, 0.26); g.add(gim);
  mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8), dark, gim, 0, 0.04, 0);
  mesh(rbox(0.22, 0.12, 0.13, 0.04), shell, gim, 0, -0.03, 0);
  const glass = withEnv(new THREE.MeshPhysicalMaterial({ color: "#0d1a2a", roughness: 0.05, metalness: 0.2, clearcoat: 1 }), 1.6);
  const germ = withEnv(new THREE.MeshStandardMaterial({ color: "#8a9098", roughness: 0.1, metalness: 1 }), 1.6);
  const ring = withEnv(new THREE.MeshStandardMaterial({ color: "#1a1c20", roughness: 0.35, metalness: 0.8 }), 0.9);
  withEnv(shell, 0.5); withEnv(motor, 0.8);
  const lens = (x, r, mat) => {
    const rg = mesh(new THREE.CylinderGeometry(r + 0.008, r + 0.01, 0.03, 28), ring, gim, x, -0.03, 0.07); rg.rotation.x = Math.PI / 2;
    const l = new THREE.SphereGeometry(r, 28, 14, 0, Math.PI * 2, 0, Math.PI / 3.2); l.rotateX(Math.PI / 2);
    return mesh(l, mat, gim, x, -0.03, 0.068);
  };
  lens(-0.055, 0.026, glass);
  const gl = lens(0.05, 0.036, germ);
  g.userData = { props, gim, germ: gl };
  return g;
}

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1.0;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.03, 1600);
  const s = K;
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const E = {
    erupsi: A_("s1:erupsi", s.s1 + 2), cahaya: A_("s1:cahaya", s.s1 + 4.5), panas: A_("s1:panas", s.s1 + 6),
    nov1: A_("s2:November", s.s2 + 4), dimulai: A_("s2:dimulai", s.s2 + 5), ketiga: A_("s2:ketiga", s.s2 + 7), regu: A_("s2:regu", s.s2 + 9),
    terbang: A_("s2:menerbangkan", s.s2 + 11),
    infra: A_("s3:inframerah", s.s3 + 1), hangat: A_("s3:hangat", s.s3 + 2.5), tubuh: A_("s3:Tubuh", s.s3 + 4), mikro: A_("s3:mikrometer", s.s3 + 7),
    kaca: A_("s3:Kaca", s.s3 + 9), germ: A_("s3:germanium", s.s3 + 11.5),
    bolo: A_("s4:mikrobolometer", s.s4 + 1.5), piksel: A_("s4:piksel", s.s4 + 3.5), panasi: A_("s4:menghangatkan", s.s4 + 5), hambatan: A_("s4:hambatan", s.s4 + 7),
    chip: A_("s4:Chip", s.s4 + 9),
    warna: A_("s5:warna", s.s5 + 1.5), dingin: A_("s5:dingin", s.s5 + 2.2), jingga: A_("s5:jingga", s.s5 + 3.5), putih: A_("s5:putih", s.s5 + 4.5),
    beda5: A_("s5:membedakan", s.s5 + 6), derajat: A_("s5:derajat", s.s5 + 8.5),
    beda: A_("s6:beda", s.s6 + 3), daun: A_("s6:daun", s.s6 + 5.5), batu: A_("s6:batu", s.s6 + 6.2), air: A_("s6:air", s.s6 + 7.5),
    semeru: A_("s6:Semeru", s.s6 + 8.5), panggang: A_("s6:terpanggang", s.s6 + 9.5), fumarol: A_("s6:fumarol", s.s6 + 11), palsu: A_("s6:palsu", s.s6 + 13),
    menyapu: A_("s7:menyapu", s.s7 + 1), operator: A_("s7:Operator", s.s7 + 4.5), tandai: A_("s7:menandai", s.s7 + 5.2), kunci: A_("s7:mengunci", s.s7 + 6.6),
    darat7: A_("s7:darat", s.s7 + 8.4), pasti7: A_("s7:memastikan", s.s7 + 9.2),
    pasti8: A_("s8:memastikan", s.s8 + 2.2), mendaki: A_("s8:mendaki", s.s8 + 4.2), ikuti: A_("s8:Ikuti", s.s8 + 6.5),
  };

  const S = new THREE.Scene();
  S.background = new THREE.Color("#03040a");
  const pm = new THREE.PMREMGenerator(r);
  const ENV = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  S.environment = ENV; S.environmentIntensity = 0.06;
  const withEnv = (m, k) => { m.envMap = ENV; m.envMapIntensity = k; return m; };
  S.fog = new THREE.FogExp2("#05070f", 0.006);
  S.add(new THREE.HemisphereLight("#334a7a", "#040406", 0.35));
  const moon = new THREE.DirectionalLight("#9fb4ff", 0.55); moon.position.set(-60, 90, 40); S.add(moon);

  // sky dome: thermal sky is cold (near black), visible sky is deep navy with faint eruption glow
  const skyM = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: G,
    vertexShader: "varying vec3 vD;void main(){vD=normalize(position);vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}",
    fragmentShader: `uniform float uWipe,uThOn,uTmin,uTmax;varying vec3 vD;\n${IB_GLSL}
void main(){float y=vD.y;vec3 vis=mix(vec3(.010,.013,.03),vec3(.002,.003,.008),clamp(y*2.,0.,1.));
vis+=vec3(.05,.012,.004)*exp(-pow(atan(vD.x,-vD.z)*3.,2.))*exp(-abs(y-.08)*9.);
vec3 th=ib((mix(-6.,-24.,clamp(y*1.6,0.,1.))-uTmin)/(uTmax-uTmin))+vec3(.012,.0,.03)*(1.-clamp(y*3.,0.,1.));
float tm=uThOn*smoothstep(uWipe+2.5,uWipe-2.5,gl_FragCoord.y);gl_FragColor=vec4(mix(vis,th,tm),1.);}`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), skyM); sky.frustumCulled = false; S.add(sky);

  // terrain (sand, ash and rock: heats strongly in the sun)
  const tg = new THREE.PlaneGeometry(700, 700, 260, 260); tg.rotateX(-Math.PI / 2); tg.translate(0, 0, -200);
  { const p = tg.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, hAt(p.getX(i), p.getZ(i))); tg.computeVertexNormals(); }
  const groundTex = canvasTex(512, 512, (c, w, h) => {
    const R = mulberry(5); c.fillStyle = "#5a5450"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++) { const v = 60 + R() * 70; c.fillStyle = `rgb(${v},${v * 0.95},${v * 0.9})`; c.fillRect(R() * w, R() * h, 2 + R() * 4, 2 + R() * 4); }
  }, [80, 80]);
  const ground = mesh(tg, tmat("#ffffff", { T: 2, v: 4.5, f: 0.18, sun: 1.05 }, { map: groundTex, roughness: 0.95 }), S);
  // treeline ground darker (litter) is handled by trees covering it

  // distant erupting cone + ash column
  const coneG = new THREE.LatheGeometry([[0.01, 330], [22, 326], [30, 312], [70, 250], [160, 150], [300, 40], [430, -10]].map(([x, y]) => new THREE.Vector2(x, y)), 48);
  const volcano = mesh(coneG, tmat("#3a3634", { T: 4, v: 4, f: 0.05, sun: 0.4 }), S, -60, 30, -720);
  const crater = mesh(new THREE.CylinderGeometry(21, 18, 6, 32), tmat("#ff5a1a", { T: 180, v: 30, f: 0.4 }, { emissive: "#ff4a10", emissiveIntensity: 1.6 }), S, -60, 360, -720);
  const NA = 900, aGeo = new THREE.BufferGeometry(), aPos = new Float32Array(NA * 3), aT = new Float32Array(NA), aA = new Float32Array(NA), aS = new Float32Array(NA);
  aGeo.setAttribute("position", new THREE.BufferAttribute(aPos, 3)); aGeo.setAttribute("aT", new THREE.BufferAttribute(aT, 1));
  aGeo.setAttribute("aA", new THREE.BufferAttribute(aA, 1)); aGeo.setAttribute("aS", new THREE.BufferAttribute(aS, 1));
  const ash = new THREE.Points(aGeo, pmat("#3a2a2a", 120)); ash.frustumCulled = false; S.add(ash);
  const AJ = Array.from({ length: NA }, (_, i) => { const R = mulberry(900 + i); return [R(), R() - 0.5, R() - 0.5, R()]; });

  // forest of cemara (conical) below the treeline
  const R0 = mulberry(29);
  const trees = [];
  for (let i = 0; i < 2600 && trees.length < 1500; i++) {
    const x = (R0() - 0.5) * 340, z = -24 + R0() * 150 - (R0() < 0.15 ? R0() * 12 : 0);
    if (Math.abs(x - trailX(z)) < 3.2) continue;
    if (Math.abs(x - 9) < 6 && Math.abs(z - 17) < 6) continue; // operator clearing
    if (x > -22 && x < 10 && z < -12) continue; // clear view onto the open slope
    trees.push([x, z, 0.75 + R0() * 0.6, R0() * 6.28]);
  }
  const folG = new THREE.ConeGeometry(1.6, 4.6, 9, 3); folG.translate(0, 2.3, 0);
  const trkG = new THREE.CylinderGeometry(0.14, 0.22, 3.2, 7); trkG.translate(0, 1.6, 0);
  const fol = new THREE.InstancedMesh(folG, tmat("#1f3a2c", { T: 5, v: 2.2, f: 1.4, sun: 0.35 }), trees.length * 3);
  const trk = new THREE.InstancedMesh(trkG, tmat("#3a2c22", { T: 6, v: 1, f: 2, sun: 0.2 }), trees.length);
  { const d = new THREE.Object3D(); let k = 0;
    trees.forEach(([x, z, sc, ry], i) => {
      const y = hAt(x, z) - 0.1;
      d.position.set(x, y, z); d.rotation.set(0, ry, 0); d.scale.setScalar(sc); d.updateMatrix(); trk.setMatrixAt(i, d.matrix);
      for (let j = 0; j < 3; j++) { d.position.set(x, y + sc * (2.2 + j * 1.9), z); d.scale.set(sc * (1.25 - j * 0.3), sc * (1 - j * 0.12), sc * (1.25 - j * 0.3)); d.rotation.set(0, ry + j, 0); d.updateMatrix(); fol.setMatrixAt(k++, d.matrix); }
    }); }
  S.add(fol, trk);

  // rocks: field above treeline + a few near the trail. Big boulder for the "batu" beat.
  const rockG = new THREE.IcosahedronGeometry(1, 2);
  { const p = rockG.attributes.position, R = mulberry(77); const nz = Array.from({ length: 12 }, () => [R() * 2 - 1, R() * 2 - 1, R() * 2 - 1, R()]);
    for (let i = 0; i < p.count; i++) { const v = v3(p.getX(i), p.getY(i), p.getZ(i)); let k = 1; for (const [a, b, c, w] of nz) k += 0.09 * w * Math.sin(3 * (v.x * a + v.y * b + v.z * c) + w * 6); v.multiplyScalar(k); v.y *= 0.72; p.setXYZ(i, v.x, v.y, v.z); }
    rockG.computeVertexNormals(); }
  const rocks = [];
  { const R = mulberry(41); for (let i = 0; i < 700; i++) { const x = (R() - 0.5) * 170, z = -28 - R() * 140; if (Math.abs(x - trailX(z)) < 2.5) continue; if (x > 0 && x < 14 && z > -110 && z < -68) continue; rocks.push([x, z, 0.35 + R() * R() * 2.4, R() * 6]); } }
  const HOT = [[-14, -52, 1.6], [6.5, -47, 1.25], [-2.5, -60, 1.9]]; // sun-baked rocks in the s6 frame
  HOT.forEach(([x, z, sc]) => rocks.push([x, z, sc, 1]));
  const rockM = tmat("#4d4744", { T: 8, v: 2.5, f: 1.1, sun: 1.3 }, { roughness: 0.9 });
  const rockI = new THREE.InstancedMesh(rockG, rockM, rocks.length);
  { const d = new THREE.Object3D(); rocks.forEach(([x, z, sc, ry], i) => { d.position.set(x, hAt(x, z) + sc * 0.25, z); d.rotation.set(0, ry, 0); d.scale.set(sc * 1.2, sc, sc); d.updateMatrix(); rockI.setMatrixAt(i, d.matrix); }); }
  S.add(rockI);
  const BOULDER = v3(-7.5, 0, -36); BOULDER.y = hAt(BOULDER.x, BOULDER.z);
  const boulder = mesh(rockG, rockM, S, BOULDER.x, BOULDER.y + 1.1, BOULDER.z); boulder.scale.set(2.6, 2.1, 2.0);

  // fumarole vent: warm ground patch + rising vapour
  const FUM = v3(15, 0, -58); FUM.y = hAt(FUM.x, FUM.z);
  const ventG = new THREE.CircleGeometry(3.2, 40); ventG.rotateX(-Math.PI / 2);
  const vent = mesh(ventG, tmat("#3a2f2a", { T: 40, v: 14, f: 1.2 }, { roughness: 0.95, transparent: false }), S, FUM.x, FUM.y + 0.12, FUM.z);
  vent.material.polygonOffset = true; vent.material.polygonOffsetFactor = -4;
  const NF = 420, fGeo = new THREE.BufferGeometry(), fPos = new Float32Array(NF * 3), fT = new Float32Array(NF), fA = new Float32Array(NF), fS = new Float32Array(NF);
  fGeo.setAttribute("position", new THREE.BufferAttribute(fPos, 3)); fGeo.setAttribute("aT", new THREE.BufferAttribute(fT, 1));
  fGeo.setAttribute("aA", new THREE.BufferAttribute(fA, 1)); fGeo.setAttribute("aS", new THREE.BufferAttribute(fS, 1));
  const steam = new THREE.Points(fGeo, pmat("#202630", 7)); steam.frustumCulled = false; S.add(steam);
  const FJ = Array.from({ length: NF }, (_, i) => { const R = mulberry(4000 + i); return [R(), R() - 0.5, R() - 0.5, R()]; });

  // small lake (water is opaque to thermal: flat cool surface)
  const LAKE = v3(-26, 0, -44); LAKE.y = hAt(LAKE.x, LAKE.z) + 0.35;
  const lakeG = new THREE.CircleGeometry(7, 48); lakeG.rotateX(-Math.PI / 2); lakeG.scale(1.4, 1, 1);
  mesh(lakeG, tmat("#0b1420", { T: 7, v: 0.4, f: 0.5, e: 0.9 }, { roughness: 0.08, metalness: 0.4, envMapIntensity: 0.3 }), S, LAKE.x, LAKE.y, LAKE.z);

  // ---------- crew ----------
  const crew = [person(11), person(12), person(13)];
  crew.forEach((p) => S.add(p));
  const crewAt = (i, t) => { // walking uphill along the trail; s7/s8 they head to the marked spot
    const z0 = 13 - i * 2.3;
    let z = z0 - 0.32 * t, x = trailX(z) + (i - 1) * 0.55;
    return { x, z, ph: t * 5.2 + i * 1.7, w: 1 };
  };
  const TGT = v3(9, 0, -104); TGT.y = hAt(TGT.x, TGT.z);
  const team2 = [person(21), person(22), person(23)]; team2.forEach((p) => S.add(p));
  const team2At = (i, t) => {
    const u = ramp(t, E.darat7 - 1.2, E.ikuti + 1.5);
    const a = v3(TGT.x - 4 + i * 1.2, 0, TGT.z + 9 + i * 1.2), b = v3(TGT.x - 2.5 + i * 1.4, 0, TGT.z + 3 + i * 0.6);
    const x = lerp(a.x, b.x, u), z = lerp(a.z, b.z, u);
    const mv = u > 0.001 && u < 0.999 ? 1 : 0.15;
    return { x, z, ph: t * 5.4 + i * 2, w: mv, yaw: Math.atan2(b.x - a.x, b.z - a.z) };
  };
  // six teams spread across sectors (s2)
  const REGU = [[-30, -20], [24, -30], [-12, -70], [32, -86], [-40, -100], [6, -6]];
  const reguP = [];
  REGU.forEach(([x, z], k) => { for (let j = 0; j < 3; j++) { const p = person(100 + k * 3 + j); p.position.set(x + j * 1.1 - 1, hAt(x + j * 1.1 - 1, z + j * 0.7), z + j * 0.7); p.rotation.y = k + j * 0.3; p.userData.pose(j + k, 0.6); S.add(p); reguP.push(p); } });
  // s6: figure in the open and one behind the boulder, one under a tree
  const solo = person(51); S.add(solo);
  const SOLO = v3(-1.5, 0, -40); SOLO.y = hAt(SOLO.x, SOLO.z); solo.position.copy(SOLO); solo.rotation.y = 0.5;
  const hid = person(52); S.add(hid); hid.position.set(BOULDER.x - 0.6, hAt(BOULDER.x - 0.6, BOULDER.z - 2.6), BOULDER.z - 2.6); hid.userData.pose(0.4, 0.2);
  const tree6 = v3(-4.5, 0, -52); tree6.y = hAt(tree6.x, tree6.z);
  const under = person(53); S.add(under); under.position.set(tree6.x + 0.6, tree6.y, tree6.z + 0.4); under.userData.pose(1, 0.1);
  const bigTree = new THREE.Group(); bigTree.position.copy(tree6); S.add(bigTree);
  { const fm = tmat("#1f3a2c", { T: 5, v: 2.2, f: 1.4, sun: 0.35 });
    mesh(trkG, tmat("#3a2c22", { T: 6, v: 1, f: 2 }), bigTree).scale.set(1.2, 1.4, 1.2);
    for (let j = 0; j < 4; j++) { const c = mesh(folG, fm, bigTree, 0, 2.4 + j * 1.6, 0); c.scale.set(2.2 - j * 0.42, 1.0, 2.2 - j * 0.42); c.rotation.y = j; } }

  // operator with tablet (AUDIRA ground-station UI)
  const OP = v3(9, 0, 17); OP.y = hAt(OP.x, OP.z);
  const op = person(31); op.position.copy(OP); op.rotation.y = Math.PI + 0.35; S.add(op); op.updateMatrixWorld(true);
  { const L = op.userData.limbs; for (const sd of [1, -1]) { L[sd].sh.rotation.set(-0.75, 0, 0.12 * sd); L[sd].el.rotation.x = -1.0; } }
  const screenTex = canvasTex(640, 420, (c, w, h) => {
    c.fillStyle = "#07060c"; c.fillRect(0, 0, w, h);
    const gr = c.createRadialGradient(w * 0.55, h * 0.6, 4, w * 0.55, h * 0.6, w * 0.5);
    gr.addColorStop(0, "#fff6c8"); gr.addColorStop(0.08, "#f7d038"); gr.addColorStop(0.2, "#ea5e28"); gr.addColorStop(0.45, "#9b1d8c"); gr.addColorStop(0.8, "#310e68"); gr.addColorStop(1, "#0a0a10");
    c.fillStyle = gr; c.fillRect(0, 50, w, h - 50);
    c.strokeStyle = "rgba(0,229,255,.85)"; c.lineWidth = 2; for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(30, 90 + i * 44); c.lineTo(w - 30, 90 + i * 44); c.stroke(); }
    c.strokeStyle = "#ff3b30"; c.lineWidth = 4; c.strokeRect(w * 0.55 - 34, h * 0.6 - 34, 68, 68);
    c.fillStyle = "#0a0a10"; c.fillRect(0, 0, w, 50);
    c.fillStyle = "#ffffff"; c.font = "700 32px Arial"; c.fillText("AUDIRA", 18, 36);
    c.fillStyle = "#00e5ff"; c.font = "600 24px Arial"; c.fillText("THERMAL · SEKTOR", 150, 34);
    c.fillStyle = "#ea5e28"; c.fillText("● REC", w - 100, 34);
  });
  const tab = new THREE.Group(); op.add(tab); tab.position.set(0, 1.18, 0.42); tab.rotation.x = -0.75;
  mesh(rbox(0.36, 0.25, 0.025, 0.012), tmat("#1a1c20", { T: 22, v: 0.5 }, { metalness: 0.4, roughness: 0.4 }), tab);
  const scr = mesh(new THREE.PlaneGeometry(0.33, 0.215), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }), tab, 0, 0, 0.0135);

  // drone
  const labelTex = canvasTex(256, 64, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = "#e8eef4"; c.font = "800 44px Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("AUDIRA", w / 2, h / 2 + 2); });
  const DR = drone(labelTex, withEnv); S.add(DR);
  const gimLight = new THREE.PointLight("#ffd9b0", 0.0, 2.5, 2); S.add(gimLight);
  const gimLight2 = new THREE.PointLight("#9fd8ff", 0.0, 2.5, 2); S.add(gimLight2);
  // lawnmower path over the sector (s7)
  const SEC = { x0: -2, x1: 20, z0: -92, z1: -117, alt: 24 };
  const lanes = 6, lanePts = [];
  for (let i = 0; i < lanes; i++) { const z = lerp(SEC.z1, SEC.z0, i / (lanes - 1)); const a = i % 2 ? SEC.x1 : SEC.x0, b = i % 2 ? SEC.x0 : SEC.x1; lanePts.push(v3(a, 0, z), v3(b, 0, z)); }
  const segL = []; let totL = 0; for (let i = 0; i < lanePts.length - 1; i++) { const l = lanePts[i].distanceTo(lanePts[i + 1]); segL.push(l); totL += l; }
  const pathAt = (u) => { let d = clamp01(u) * totL; for (let i = 0; i < segL.length; i++) { if (d <= segL[i] || i === segL.length - 1) return lanePts[i].clone().lerp(lanePts[i + 1], clamp01(d / segL[i])); d -= segL[i]; } return lanePts[0].clone(); };
  const NTR = 600, trPts = [];
  for (let i = 0; i < NTR; i++) { const p = pathAt(i / (NTR - 1)); trPts.push(v3(p.x, hAt(p.x, p.z) + 0.6, p.z)); }
  const trG = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(trPts, false, "centripetal", 0.1), NTR, 0.3, 5, false);
  const trail = new THREE.Mesh(trG, new THREE.MeshBasicMaterial({ color: "#00E5FF", transparent: true, opacity: 0.95, toneMapped: false, depthTest: false })); trail.renderOrder = 20; trail.frustumCulled = false; S.add(trail);
  // sector outline draped on terrain
  const secG = new THREE.BufferGeometry(), sp = [];
  const edge = (a, b) => { for (let i = 0; i <= 40; i++) { const x = lerp(a[0], b[0], i / 40), z = lerp(a[1], b[1], i / 40); sp.push(x, hAt(x, z) + 0.4, z); } };
  edge([SEC.x0 - 4, SEC.z0 + 4], [SEC.x1 + 4, SEC.z0 + 4]); edge([SEC.x1 + 4, SEC.z0 + 4], [SEC.x1 + 4, SEC.z1 - 4]); edge([SEC.x1 + 4, SEC.z1 - 4], [SEC.x0 - 4, SEC.z1 - 4]); edge([SEC.x0 - 4, SEC.z1 - 4], [SEC.x0 - 4, SEC.z0 + 4]);
  secG.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  const secLine = new THREE.Line(secG, new THREE.LineBasicMaterial({ color: "#00E5FF", transparent: true, opacity: 0.6, toneMapped: false, depthTest: false })); secLine.renderOrder = 19; S.add(secLine);
  // thermal camera footprint on the ground during the sweep (what one pass "sees")
  const fpG = new THREE.PlaneGeometry(7, 5.2); fpG.rotateX(-Math.PI / 2);
  const foot = new THREE.Mesh(fpG, new THREE.MeshBasicMaterial({ color: "#00E5FF", transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, toneMapped: false }));
  foot.renderOrder = 21; foot.visible = false; S.add(foot);
  const footEdge = new THREE.LineSegments(new THREE.EdgesGeometry(fpG), new THREE.LineBasicMaterial({ color: "#00E5FF", transparent: true, depthTest: false, toneMapped: false }));
  footEdge.renderOrder = 22; foot.add(footEdge);
  // the warm spot (ambiguous: never a person shape)
  const spot = mesh(new THREE.SphereGeometry(0.55, 20, 12), tmat("#40342c", { T: 27, v: 3, f: 2 }), S, TGT.x, TGT.y + 0.15, TGT.z); spot.scale.set(1.3, 0.4, 0.9);

  // HUD sprites
  const bracketTex = (col, label) => canvasTex(512, 300, (c, w, h) => {
    c.clearRect(0, 0, w, h); c.strokeStyle = col; c.lineWidth = 9; const L = 46, x0 = 120, y0 = 30, x1 = w - 120, y1 = 230;
    for (const [x, y, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { c.beginPath(); c.moveTo(x + dx * L, y); c.lineTo(x, y); c.lineTo(x, y + dy * L); c.stroke(); }
    if (label) { c.font = "700 38px Arial"; c.textAlign = "center"; const tw = c.measureText(label).width + 26; c.fillStyle = col; c.fillRect(w / 2 - tw / 2, 244, tw, 50); c.fillStyle = "#0A0A10"; c.fillText(label, w / 2, 283); }
  });
  const sprite = (tex, w, h) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, toneMapped: false })); sp.scale.set(w, h, 1); sp.renderOrder = 30; sp.userData.w = w; sp.userData.h = h; sp.visible = false; S.add(sp); return sp; };
  const SPR = {
    leaf: sprite(bracketTex("#00E5FF", "TERHALANG DAUN"), 5, 2.95), rock: sprite(bracketTex("#00E5FF", "TERHALANG BATU"), 5, 2.95),
    f1: sprite(bracketTex("#FF3B30", "SINYAL PALSU?"), 5, 2.95), f2: sprite(bracketTex("#FF3B30", "SINYAL PALSU?"), 5, 2.95), f3: sprite(bracketTex("#FF3B30", "UAP FUMAROL"), 8, 4.7),
    me: sprite(bracketTex("#F7D038", "BEDA SUHU"), 4.6, 2.7), drone: sprite(bracketTex("#F7D038", "DRONE TERMAL"), 7, 4.1),
    hot: sprite(bracketTex("#FF3B30", "TITIK PANAS"), 9, 5.3), lock: sprite(bracketTex("#00E5FF", "KOORDINAT TERKUNCI"), 9, 5.3),
  };
  const reguSp = REGU.map((_, k) => sprite(bracketTex(k === 5 ? "#F7D038" : "#00E5FF", k === 5 ? "DRONE" : "REGU " + (k + 1)), 4.6, 2.7));
  const pop = (sp, k, pos) => { sp.visible = k > 0.01; if (!sp.visible) return; sp.position.copy(pos); const s2 = 0.001 + back(k, 2); sp.scale.set(sp.userData.w * s2, sp.userData.h * s2, 1); sp.material.opacity = Math.min(1, k * 1.5); };

  // IR emission rings (s3): billboards expanding from warm bodies
  const ringTex = canvasTex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = "#fff"; c.lineWidth = 3; c.beginPath(); for (let i = 0; i <= 200; i++) { const a = (i / 200) * Math.PI * 2, rr = 108 + 6 * Math.sin(a * 14); const x = w / 2 + Math.cos(a) * rr, y = h / 2 + Math.sin(a) * rr; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); });
  const RINGS = [];
  for (let i = 0; i < 14; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); m.renderOrder = 25; m.visible = false; S.add(m); RINGS.push(m); }
  // glass pane (s3): opaque & cold in thermal
  const pane = new THREE.Group(); S.add(pane);
  mesh(rbox(0.85, 1.25, 0.04, 0.02), tmat("#5c7a8a", { T: 7, v: 0.4, f: 1, e: 0.86 }, { roughness: 0.05, metalness: 0.5, envMapIntensity: 0.9, transparent: true, opacity: 0.35 }), pane);
  const paneLab = new THREE.Sprite(new THREE.SpriteMaterial({ map: bracketTex("#00E5FF", "KACA"), transparent: true, depthTest: false, toneMapped: false })); paneLab.scale.set(0.9, 0.53, 1); paneLab.position.y = 0.85; paneLab.renderOrder = 30; // no in-world label: the panel already names KACA

  // ---------- macro chip set (x = 3000) ----------
  const C0 = v3(3000, 0, 0);
  const chipS = new THREE.Group(); chipS.position.copy(C0); S.add(chipS);
  const gold = withEnv(new THREE.MeshStandardMaterial({ color: "#d9a441", roughness: 0.22, metalness: 1 }), 1.2);
  const silicon = withEnv(new THREE.MeshStandardMaterial({ color: "#1d1f2a", roughness: 0.28, metalness: 0.55 }), 1.0);
  const ceramic = withEnv(new THREE.MeshStandardMaterial({ color: "#2a2730", roughness: 0.55, metalness: 0.1 }), 0.7);
  const legM = withEnv(new THREE.MeshStandardMaterial({ color: "#8d96a6", roughness: 0.3, metalness: 0.9 }), 1.0);
  mesh(rbox(15, 0.8, 12, 0.3), ceramic, chipS, 0, -0.5, 0);
  mesh(rbox(11.4, 0.4, 8.8, 0.12), silicon, chipS, 0, 0.08, 0);
  const NX = 32, NY = 24, PIT = 0.32;
  const pixG = rbox(0.26, 0.035, 0.26, 0.012, 1);
  const pixI = new THREE.InstancedMesh(pixG, new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: true }), NX * NY);
  const legG = new THREE.CylinderGeometry(0.012, 0.012, 0.22, 6);
  const legI = new THREE.InstancedMesh(legG, legM, NX * NY * 2);
  const padI = new THREE.InstancedMesh(rbox(0.36, 0.06, 0.5, 0.03, 1), gold, 64);
  const pxPos = [];
  { const d = new THREE.Object3D(); let k = 0, q = 0;
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const x = (i - (NX - 1) / 2) * PIT, z = (j - (NY - 1) / 2) * PIT; pxPos.push([x, z]);
      d.position.set(x, 0.5, z); d.updateMatrix(); pixI.setMatrixAt(k, d.matrix); pixI.setColorAt(k, new THREE.Color("#222")); k++;
      for (const sd of [-1, 1]) { d.position.set(x + sd * 0.11, 0.38, z + sd * 0.11); d.updateMatrix(); legI.setMatrixAt(q++, d.matrix); }
    }
    let p = 0; for (let i = 0; i < 16; i++) for (const sd of [-1, 1]) { d.position.set((i - 7.5) * 0.62, 0.12, sd * 5.4); d.rotation.set(0, 0, 0); d.updateMatrix(); padI.setMatrixAt(p++, d.matrix); }
    for (let i = 0; i < 16; i++) for (const sd of [-1, 1]) { d.position.set(sd * 6.7, 0.12, (i - 7.5) * 0.42); d.rotation.set(0, Math.PI / 2, 0); d.updateMatrix(); padI.setMatrixAt(p++, d.matrix); }
  }
  pixI.frustumCulled = false; chipS.add(pixI, legI, padI);
  // bond wires
  for (let i = 0; i < 16; i++) for (const sd of [1]) {
    const a = v3((i - 7.5) * 0.62, 0.15, sd * 5.4), b = v3((i - 7.5) * 0.5, 0.3, sd * 4.2), m = a.clone().lerp(b, 0.5); m.y += 0.6;
    mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 12, 0.018, 5), gold, chipS);
  }
  const chipLab = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.5), new THREE.MeshBasicMaterial({ map: canvasTex(512, 86, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = "#d9a441"; c.font = "700 46px Arial"; c.fillText("AUDIRA · VOx µBOLOMETER", 6, 60); }), transparent: true, toneMapped: false }));
  chipLab.rotation.x = -Math.PI / 2; chipLab.position.set(-3.4, 0.11, 5.85); chipS.add(chipLab);
  // readout scan bar
  const scan = mesh(new THREE.BoxGeometry(NX * PIT + 0.4, 0.02, 0.06), new THREE.MeshBasicMaterial({ color: "#00E5FF", toneMapped: false, transparent: true }), chipS, 0, 0.56, 0);
  // IR photons falling onto pixels
  const NPH = 160, phI = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 4), new THREE.MeshBasicMaterial({ color: "#ff9a3c", transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), NPH);
  phI.frustumCulled = false; chipS.add(phI);
  const PJ = Array.from({ length: NPH }, (_, i) => { const R = mulberry(7000 + i); return [Math.floor((0.45 + 0.55 * R()) * NY) * NX + Math.floor(R() * NX), R(), R()]; }).map((q) => [Math.min(q[0], NX * NY - 1), q[1], q[2]]);
  const chipKey = new THREE.PointLight("#ffd4a8", 300, 60, 2); chipKey.position.set(C0.x + 8, 12, 9); S.add(chipKey);
  const chipRim = new THREE.PointLight("#7a5cff", 220, 60, 2); chipRim.position.set(C0.x - 10, 6, -10); S.add(chipRim);
  const chipBg = mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: "#07050d", fog: false }), S, C0.x, -2, 0); chipBg.rotation.x = -Math.PI / 2;
  // heat image on the grid: a generic warm figure silhouette + a warm rock
  const img = pxPos.map(([x, z], k) => {
    const u = (k % NX) / (NX - 1), v = 1 - Math.floor(k / NX) / (NY - 1);
    const e = (cx, cy, rx, ry) => Math.max(0, 1 - Math.hypot((u - cx) / rx, (v - cy) / ry));
    const body = Math.min(1, 2.2 * Math.max(e(0.5, 0.78, 0.07, 0.09), e(0.5, 0.52, 0.12, 0.2), e(0.45, 0.24, 0.04, 0.16), e(0.55, 0.24, 0.04, 0.16), 0.8 * e(0.37, 0.5, 0.035, 0.15), 0.8 * e(0.63, 0.5, 0.035, 0.15)));
    const rock = 0.5 * e(0.17, 0.2, 0.12, 0.08);
    const R = mulberry(k + 3)();
    return Math.min(1, 0.12 + 0.12 * (1 - v) + body * 0.86 + rock + 0.05 * R);
  });
  const HERO = Math.floor(NY * 0.22) * NX + Math.floor(NX * 0.5); // a pixel in the head
  const tmpC = new THREE.Color(), gray = new THREE.Color();

  // ---------- camera shots ----------
  const crewMid = (t) => { const c = crewAt(1, t); return v3(c.x, hAt(c.x, c.z), c.z); };
  function droneAt(t) {
    const c = crewMid(t);
    let p = v3(c.x + 1.6, c.y + 6.5 + 0.18 * Math.sin(t * 1.3), c.z - 2.5);
    p = p.lerp(v3(c.x - 1.9, c.y + 2.6 + 0.12 * Math.sin(t * 1.3), c.z + 3.4), 1 - ramp(t, E.nov1 - 1, E.dimulai + 0.5));
    // s2: climbs and drifts up-slope
    const up = ramp(t, E.dimulai - 1, E.ketiga - 0.3) * (1 - ramp(t, s.s3 + 0.5, E.tubuh));
    p.y += 16 * up; p.z -= 10 * up;
    // s3 end: low near the crew for the gimbal close-up
    const low = ramp(t, E.kaca - 0.5, E.germ - 0.6);
    p = p.lerp(v3(c.x + 3.2, c.y + 4.4 + 0.06 * Math.sin(t * 1.7), c.z - 1.2), low);
    let yaw = Math.PI + 0.2 * Math.sin(t * 0.21), pitch = 0.04 * Math.sin(t * 0.9);
    // s6-s8: over the field, then the lawnmower sweep, then hover at the spot and rise
    if (t > s.s6 - 1) {
      const sw = clamp01((t - E.menyapu + 0.6) / (E.tandai - E.menyapu + 0.6));
      const q = pathAt(sw), q2 = pathAt(sw + 0.01);
      let pp = v3(q.x, hAt(q.x, q.z) + SEC.alt, q.z);
      const hov = ramp(t, E.tandai - 0.2, E.kunci + 0.6);
      pp = pp.lerp(v3(TGT.x, TGT.y + 22, TGT.z + 3), hov);
      const pre = 1 - ramp(t, s.s7 - 1.2, E.menyapu);
      pp = pp.lerp(v3(-2, hAt(-2, -50) + 14, -50), pre);
      pp.y += 14 * ramp(t, s.s8, s.s8 + 6);
      p = pp; yaw = Math.atan2(q2.x - q.x, q2.z - q.z) * (1 - hov) * (1 - pre); pitch = 0.12 * (1 - hov) * (1 - pre);
    }
    return { p, yaw, pitch };
  }
  const look = (p, q, t) => [p.x, p.y, p.z, q.x, q.y, q.z];
  const SHOTS = [
    { a: -1, f: (t) => { // s1: low on the trail, crew mid-frame, drone above, cone behind
      const c = crewMid(t), u = ramp(t, 0, E.ketiga);
      return look(v3(c.x - 3.4 + 1.2 * u, c.y + 1.1 + 0.6 * u, c.z + 8.8 - 1.2 * u), v3(c.x + 0.4, c.y + 4.2 + 0.6 * u, c.z - 6), t);
    } },
    { a: E.ketiga - 0.3, f: (t) => { // s2: rise with the drone, reveal sectors and six teams
      const d = droneAt(t).p, u = ramp(t, E.ketiga - 0.3, E.terbang + 1.5);
      return look(v3(d.x - 2 - 2 * u, d.y + 3 + 3 * u, d.z + 16 + 8 * u), v3(d.x, d.y - 2.5 - 2 * u, d.z - 20 - 8 * u), t);
    }, cut: true },
    { a: s.s3 + 0.2, f: (t) => { // s3: close to a crew member, IR rings; then the glass; then the gimbal
      const c = crewAt(0, t), cp = v3(c.x, hAt(c.x, c.z), c.z), u = ramp(t, s.s3, E.kaca);
      const p0 = v3(cp.x + 2.6 - 0.8 * u, cp.y + 1.5, cp.z - 3.8 + 0.6 * u);
      const tg = v3(cp.x, cp.y + 1.2, cp.z);
      const g = ramp(t, E.kaca + 1.4, E.germ + 0.1);
      const d = droneAt(t), gp = d.p.clone().add(v3(0, -0.16, 0.33).applyAxisAngle(v3(0, 1, 0), d.yaw));
      const fwd = v3(0.25, -0.1, 1).applyAxisAngle(v3(0, 1, 0), d.yaw).normalize();
      const p1 = gp.clone().addScaledVector(fwd, 1.6 - 1.25 * ramp(t, E.germ - 0.6, s.s3e + 0.15)).add(v3(0.12, 0.05, 0));
      const P = p0.lerp(p1, g), T = tg.lerp(gp.clone().add(v3(0.05, -0.03, 0)), g);
      return look(P, T, t);
    }, cut: true },
    { a: s.s4 - 0.05, f: (t) => { // s4: macro chip glide
      const u = ramp(t, s.s4, E.chip), h = ramp(t, E.hambatan - 0.8, E.hambatan + 0.6) * (1 - ramp(t, E.chip - 0.3, E.chip + 0.8));
      const [hx, hz] = pxPos[HERO];
      let P = v3(lerp(-1, 4, u), lerp(14, 6.2, u), lerp(1, 10, u)), T = v3(lerp(0, -0.5, u), 0.3, lerp(0, -0.5, u));
      P = P.lerp(v3(hx + 0.9, 1.5, hz + 1.9), h); T = T.lerp(v3(hx, 0.5, hz), h);
      return look(P.add(C0), T.add(C0), t);
    }, cut: true },
    { a: s.s5, f: (t) => { // s5: pull up to read the whole heat image, then two neighbour pixels
      const u = ramp(t, s.s5 - 0.4, E.putih), n = ramp(t, E.beda5 - 0.4, E.derajat);
      const [hx, hz] = pxPos[HERO];
      let P = v3(lerp(3, 0.6, u), lerp(6.5, 15.5, u), lerp(9, 7.5, u)), T = v3(0, 0.3, lerp(-0.4, 0.4, u));
      P = P.lerp(v3(hx + 0.45, 1.35, hz + 1.25), n); T = T.lerp(v3(hx + 0.16, 0.5, hz), n);
      return look(P.add(C0), T.add(C0), t);
    } },
    { a: s.s6 - 0.05, f: (t) => { // s6: open slope at the treeline; figure, boulder, tree; then hot rocks + fumarole
      const u = ramp(t, s.s6, E.semeru), v = ramp(t, E.semeru - 0.3, s.s6e);
      const P0 = v3(0.5 - 1.0 * u, hAt(0, -12) + 4.6 + 0.6 * u, -12 - 2 * u), T0 = v3(-3.8 - 0.8 * u, SOLO.y + 0.4, -42);
      const P1 = v3(0 + 2 * v, hAt(2, -28) + 6 + 2 * v, -27 - 2 * v), T1 = v3(lerp(-3.5, 8, v), lerp(SOLO.y + 1, FUM.y + 1.5, v), lerp(-40, -55, v));
      return look(P0.lerp(P1, v), T0.lerp(T1, v), t);
    }, cut: true },
    { a: s.s7 - 0.4, f: (t) => { // s7: oblique over the sector, following the sweep
      const u = ramp(t, s.s7 - 0.4, E.operator), cx = (SEC.x0 + SEC.x1) / 2, cz = (SEC.z0 + SEC.z1) / 2, cy = hAt(cx, cz);
      return look(v3(cx + 3 + 2 * u, cy + 80 - 6 * u, cz + 20 - 4 * u), v3(cx + 6, cy, cz + 1), t);
    } },
    { a: E.operator - 0.3, f: (t) => { // s7: over the operator's shoulder onto the AUDIRA ground-station screen
      const u = ramp(t, E.operator - 0.3, E.tandai + 0.9);
      const P = op.localToWorld(v3(0.12 - 0.08 * u, 1.62 - 0.04 * u, 0.95 - 0.08 * u)), T = op.localToWorld(v3(-0.07, 1.2, 0.42));
      return look(P, T, t);
    }, cut: true },
    { a: E.tandai + 0.9, f: (t) => { // s7: the marked spot, the ground team walks in
      const u = ramp(t, E.tandai + 0.9, s.s8);
      return look(v3(TGT.x - 5 + 2 * u, TGT.y + 13 - 3 * u, TGT.z + 44 - 6 * u), v3(TGT.x - 2, TGT.y, TGT.z + 9 - 2 * u), t);
    }, cut: true },
    { a: s.s8, f: (t) => { // s8: low behind the ground team, cone ahead
      const u = ramp(t, s.s8 - 0.6, K.outro), m = team2At(1, t), my = hAt(m.x, m.z);
      return look(v3(m.x - 2.5 - 1.5 * u, my + 3.6 + 1.2 * u, m.z + 7.5 + 3 * u), v3(m.x + 1, my - 0.6 + 0.4 * u, m.z - 12), t);
    } },
  ];
  const BW = 0.6;
  function camAt(t) {
    let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].a) i++;
    let c = SHOTS[i].f(t);
    const nx = SHOTS[i + 1], cur = SHOTS[i];
    if (nx && !nx.cut && t > nx.a - BW) { const u = ramp(t, nx.a - BW, nx.a + BW), n = nx.f(t); c = c.map((v, j) => lerp(v, n[j], u)); }
    else if (i > 0 && !cur.cut && t < cur.a + BW) { const u = ramp(t, cur.a - BW, cur.a + BW), p = SHOTS[i - 1].f(t); c = p.map((v, j) => lerp(v, c[j], u)); }
    return c;
  }
  const cuts = SHOTS.filter((x) => x.cut).map((x) => x.a);

  // ---------- post: NaN guard -> thermal sensor fx -> bloom -> output ----------
  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  const QV = "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}";
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } }, vertexShader: QV,
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);bvec4 n=isnan(c);bvec4 f=isinf(c);if(any(n)||any(f))c=vec4(0.,0.,0.,1.);gl_FragColor=clamp(c,0.,30.);}" })));
  const fxU = { tDiffuse: { value: null }, uWipe: G.uWipe, uLine: { value: 0 }, uFlash: { value: 0 }, uFrame: { value: 0 }, uSensor: { value: 1 } };
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: fxU, vertexShader: QV,
    fragmentShader: `uniform sampler2D tDiffuse;uniform float uWipe,uLine,uFlash,uFrame,uSensor;varying vec2 vUv;
float h(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;vec2 px=vUv*vec2(1080.,1920.);
float th=smoothstep(uWipe+2.5,uWipe-2.5,px.y)*uSensor;
c+=th*(h(floor(px/2.)+uFrame*7.13)-.5)*.022;
c*=1.-th*.05*step(.5,fract(px.y/4.));
float d=abs(px.y-uWipe);c+=uLine*vec3(0.,.9,1.)*(exp(-d*.35)*1.6+exp(-d*.04)*.12);
c=mix(c,vec3(.92,.28,.05)*1.1,uFlash);
gl_FragColor=vec4(c,1.);}` })));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.55, 0.55, 0.82);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());

  const dm = new THREE.Object3D();
  return (t) => {
    // ---- thermal state ----
    let wipe;
    if (t < s.s2 - 0.2) {
      const split = 0.43 * H - 40 * ramp(t, 0, E.cahaya - 0.8);
      wipe = lerp(split, -10, ramp(t, E.cahaya - 0.8, E.cahaya + 0.3));
      wipe = lerp(wipe, H + 20, ramp(t, E.panas - 0.15, E.panas + 0.85));
    } else wipe = H + 20;
    if (t > E.mendaki - 0.6) wipe = lerp(H + 20, 0.5 * H, ramp(t, E.mendaki - 0.6, E.mendaki + 1.2));
    G.uWipe.value = wipe;
    fxU.uLine.value = wipe > 0 && wipe < H ? 1 : 0;
    G.uSun.value = ramp(t, E.panggang - 0.5, E.panggang + 1.6) * (1 - ramp(t, s.s7 - 1, s.s7 + 0.3));
    let fl = 0; cuts.forEach((a) => (fl = Math.max(fl, 1 - Math.abs(t - a) / 0.14)));
    fxU.uFlash.value = clamp01(fl) * 0.4;
    fxU.uFrame.value = Math.floor(t * 30) % 997;
    const inChip = t > s.s4 - 0.05 && t < s.s6 - 0.05;
    fxU.uSensor.value = inChip ? 0 : 1;
    S.fog.density = inChip ? 0.0 : 0.006;
    bloom.strength = inChip ? 0.45 : 0.55;

    // ---- camera ----
    const c = camAt(t);
    cam.position.set(c[0] + 0.03 * Math.sin(t * 0.7), c[1] + 0.03 * Math.sin(t * 0.53 + 1), c[2]);
    cam.lookAt(c[3], c[4], c[5]);
    cam.updateMatrixWorld(true);
    sky.position.copy(cam.position);

    // ---- crew ----
    crew.forEach((p, i) => { const a = crewAt(i, t); p.position.set(a.x, hAt(a.x, a.z), a.z); p.rotation.y = Math.PI + 0.05; p.userData.pose(a.ph, a.w); });
    team2.forEach((p, i) => { const a = team2At(i, t); p.position.set(a.x, hAt(a.x, a.z), a.z); p.rotation.y = a.yaw; p.userData.pose(a.ph, a.w); p.visible = t > s.s6; });
    reguP.forEach((p) => (p.visible = t < s.s4 || (t > s.s7 - 0.5 && t < E.operator)));
    solo.userData.pose(t * 1.2, 0.0, 0.3 * Math.sin(t * 0.4));

    // ---- drone ----
    const d = droneAt(t);
    DR.position.copy(d.p); DR.rotation.set(d.pitch, d.yaw, 0.03 * Math.sin(t * 0.8));
    DR.userData.props.forEach((p, i) => (p.rotation.y = t * 47 * (i % 2 ? 1 : -1) + i));
    DR.userData.gim.rotation.x = 0.25 + 0.1 * Math.sin(t * 0.3);
    const gk = win(t, E.kaca + 0.6, s.s3e + 0.3, 0.6, 0.2);
    gimLight.intensity = 6 * gk; gimLight2.intensity = 4 * gk;
    gimLight.position.copy(d.p).add(v3(0.5, 0.3, -1.1).applyAxisAngle(v3(0, 1, 0), d.yaw));
    gimLight2.position.copy(d.p).add(v3(-0.6, -0.3, -0.9).applyAxisAngle(v3(0, 1, 0), d.yaw));

    // ---- volcano ash column ----
    for (let i = 0; i < NA; i++) {
      const J = AJ[i], u = (t * 0.018 + J[0]) % 1;
      aPos[i * 3] = -60 + J[1] * (20 + 160 * u) + 120 * u * u; aPos[i * 3 + 1] = 362 + 430 * u; aPos[i * 3 + 2] = -720 + J[2] * (20 + 140 * u);
      aT[i] = lerp(150, 6, Math.pow(u, 0.5)); aA[i] = 0.5 * Math.min(1, u * 12) * (1 - u); aS[i] = 0.6 + 2.4 * u;
    }
    aGeo.attributes.position.needsUpdate = aGeo.attributes.aT.needsUpdate = aGeo.attributes.aA.needsUpdate = aGeo.attributes.aS.needsUpdate = true;
    // ---- fumarole vapour ----
    for (let i = 0; i < NF; i++) {
      const J = FJ[i], u = (t * 0.16 + J[0]) % 1;
      fPos[i * 3] = FUM.x + J[1] * (1.2 + 5 * u) + 4 * u * u; fPos[i * 3 + 1] = FUM.y + 0.3 + 15 * u; fPos[i * 3 + 2] = FUM.z + J[2] * (1.2 + 4 * u);
      fT[i] = lerp(46, 8, Math.pow(u, 0.6)); fA[i] = 0.26 * Math.min(1, u * 10) * (1 - u); fS[i] = 0.6 + 2.6 * u;
    }
    fGeo.attributes.position.needsUpdate = fGeo.attributes.aT.needsUpdate = fGeo.attributes.aA.needsUpdate = fGeo.attributes.aS.needsUpdate = true;

    // ---- s3: IR rings + glass pane ----
    const rOn = win(t, E.infra - 0.4, E.kaca + 0.8, 0.4, 0.5);
    const c0 = crewAt(0, t), body = v3(c0.x, hAt(c0.x, c0.z) + 1.25, c0.z);
    const srcs = [[body, 1, 1], [v3(c0.x + 3.5, hAt(c0.x + 3.5, c0.z - 2) + 0.4, c0.z - 2), 0.35, 0.3], [v3(c0.x - 3, hAt(c0.x - 3, c0.z - 3) + 2.5, c0.z - 3), 0.25, 0.22]];
    RINGS.forEach((m, i) => {
      const [p, k, col] = srcs[i % 3 === 0 ? 0 : i % 3], ph = (t * 0.55 + i * 0.37) % 1;
      m.visible = rOn > 0.01; if (!m.visible) return;
      const boost = i % 3 === 0 ? 1 + 0.5 * ramp(t, E.tubuh - 0.3, E.tubuh + 0.5) : 1;
      m.position.copy(p); m.scale.setScalar((0.3 + 1.7 * ph) * (0.6 + 0.5 * k) * boost);
      m.material.color.copy(ibJS(0.5 + 0.3 * col)); m.material.opacity = rOn * (1 - ph) * (0.35 + 0.65 * k);
    });
    const pk = ramp(t, E.kaca - 0.5, E.kaca + 0.3) * (1 - ramp(t, E.germ - 1.0, E.germ - 0.4));
    pane.visible = pk > 0.01;
    if (pane.visible) { const camP = cam.position, mid = camP.clone().lerp(body, 0.8); pane.position.set(mid.x, mid.y - 2.2 * (1 - pk), mid.z); pane.lookAt(camP.x, mid.y, camP.z); }

    // ---- s4/s5: chip ----
    if (inChip || Math.abs(t - s.s4) < 1) {
      const heat = (k) => ramp(t, E.panasi - 0.6 + 0.9 * ((k * 0.618) % 1), E.panasi + 0.9 + 0.9 * ((k * 0.618) % 1));
      const colK = ramp(t, E.warna - 0.2, E.warna + 0.9);
      for (let k = 0; k < NX * NY; k++) {
        const v = 0.06 + (img[k] - 0.06) * heat(k);
        gray.setRGB(v * v * 0.7, v * v * 0.7, v * v * 0.7);
        tmpC.copy(ibJS(v)).multiplyScalar(0.95);
        tmpC.lerp(gray, 1 - colK);
        if (k === HERO) tmpC.multiplyScalar(1 + 0.6 * win(t, E.hambatan - 0.2, E.chip, 0.2, 0.3));
        if (k === HERO + 1) tmpC.multiplyScalar(1 + 0.3 * win(t, E.beda5, s.s5e + 1, 0.3, 0.3));
        pixI.setColorAt(k, tmpC);
        const [x, z] = pxPos[k]; dm.position.set(x, 0.5 + (k === HERO ? 0.08 * win(t, E.hambatan - 0.2, E.chip, 0.2, 0.3) : 0), z); dm.rotation.set(0, 0, 0); dm.scale.setScalar(1); dm.updateMatrix(); pixI.setMatrixAt(k, dm.matrix);
      }
      pixI.instanceColor.needsUpdate = true; pixI.instanceMatrix.needsUpdate = true;
      const sOn = win(t, E.chip - 0.2, E.warna, 0.2, 0.4);
      scan.visible = sOn > 0.01; scan.material.opacity = sOn; scan.position.z = (((t - E.chip) * 3.2) % 1) * NY * PIT - (NY * PIT) / 2;
      const pOn = win(t, E.panasi - 0.6, E.chip, 0.3, 0.5);
      PJ.forEach(([k, a, b], i) => {
        const u = (t * 1.1 + a) % 1, [x, z] = pxPos[k];
        dm.position.set(x + 0.1 * (1 - u), 0.6 + 1.4 * (1 - u), z + 0.06 * (1 - u)); dm.rotation.set(0.07, 0, -0.07); dm.scale.set(1, pOn > 0.01 ? 0.35 : 0.0001, 1); dm.updateMatrix(); phI.setMatrixAt(i, dm.matrix);
      });
      phI.instanceMatrix.needsUpdate = true; phI.material.opacity = 0.8 * pOn;
    }

    // ---- s2 team brackets ----
    reguSp.forEach((sp, k) => { const [x, z] = REGU[k]; const a = k === 5 ? E.terbang : E.regu - 0.9 + k * 0.18;
      pop(sp, win(t, a, s.s2e + 0.2, 0.2, 0.3), k === 5 ? DR.position.clone().add(v3(0, 1.6, 0)) : v3(x, hAt(x, z) + 3.4, z)); });
    // ---- s6 markers ----
    pop(SPR.me, win(t, E.beda - 0.3, E.daun - 0.1, 0.2, 0.25), SOLO.clone().add(v3(0, 2.9, 0)));
    pop(SPR.leaf, win(t, E.daun - 0.15, E.semeru - 0.3, 0.2, 0.3), tree6.clone().add(v3(0, 4.5, 0)));
    pop(SPR.rock, win(t, E.batu - 0.15, E.semeru - 0.3, 0.2, 0.3), BOULDER.clone().add(v3(1.8, 2.6, 0)));
    const fp = win(t, E.panggang + 0.6, s.s6e + 0.2, 0.25, 0.3);
    pop(SPR.f1, fp, v3(HOT[1][0], hAt(HOT[1][0], HOT[1][1]) + 1.1, HOT[1][1]));
    pop(SPR.f2, ramp(t, E.panggang + 1.0, E.panggang + 1.3) * fp, v3(HOT[2][0], hAt(HOT[2][0], HOT[2][1]) + 1.3, HOT[2][1]));
    pop(SPR.f3, win(t, E.fumarol - 0.1, s.s6e + 0.2, 0.25, 0.3), FUM.clone().add(v3(-1.5, 5, 0)));
    // ---- s7 markers + sweep trail ----
    const sw = clamp01((t - E.menyapu + 0.6) / (E.tandai - E.menyapu + 0.6));
    trail.visible = t > E.menyapu - 0.7 && t < s.s8 + 2;
    trG.setDrawRange(0, Math.max(6, Math.floor(sw * NTR) * 5 * 6));
    trail.material.opacity = 0.95 * (1 - 0.75 * ramp(t, E.kunci - 0.5, E.kunci + 0.5)) * (1 - ramp(t, s.s8, s.s8 + 2));
    secLine.visible = t > s.s7 - 0.5 && t < s.s8 + 2; secLine.material.opacity = 0.6 * ramp(t, s.s7 - 0.5, E.menyapu) * (1 - ramp(t, s.s8, s.s8 + 2));
    { const fOn = win(t, E.menyapu - 0.3, E.tandai - 0.2, 0.3, 0.3); foot.visible = fOn > 0.01;
      if (foot.visible) { const dp = DR.position; foot.position.set(dp.x, hAt(dp.x, dp.z) + 0.6, dp.z); foot.rotation.y = DR.rotation.y; foot.material.opacity = 0.22 * fOn; footEdge.material.opacity = 0.9 * fOn; } }
    pop(SPR.drone, win(t, E.menyapu - 0.2, E.operator - 0.2, 0.3, 0.2), DR.position.clone().add(v3(0, 3, 0)));
    pop(SPR.hot, win(t, E.tandai - 0.1, E.kunci, 0.2, 0.15), TGT.clone().add(v3(0, 1.2, 0)));
    pop(SPR.lock, win(t, E.kunci, s.s8 - 0.3, 0.2, 0.3), TGT.clone().add(v3(0, 1.2, 0)));

    comp.render();
  };
}
