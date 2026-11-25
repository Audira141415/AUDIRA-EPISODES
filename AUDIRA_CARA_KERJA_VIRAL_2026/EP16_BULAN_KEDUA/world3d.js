// EP16 BULAN KEDUA. SCALEFORGE look: one continuous logarithmic zoom through one real-metre world.
// Everything lives in real metres with Earth at the origin and the Sun at -X (1 AU). Each frame it is drawn at (P - C) / S,
// S = 10^e metres per render unit, C = focus (kit rule: never scale the camera). Keys come from ../zoom.json (generated zoomkeys.js).
// Stations: the Earth system (Earth, Moon, Hill sphere, capture path), a telescope dome on Earth's surface ("Hungaria"),
// the measuring studio around the 2026 QQ8 rock (person figure + ruler, later the sunlight-push test), and the solar frame.
// Earth/Moon/Sun are enlarged at planetary zoom (chip: SKALA DISESUAIKAN). Pure function of t, seeded randomness only.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { ShaderPass } from "./ShaderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, ramp, clamp01, canvasTex, eout } from "./lib3d.js";
import ZK from "./zoomkeys.js";

const W = 1080, H = 1920, D = 10, FOV = 38, TANH = Math.tan((FOV / 2) * Math.PI / 180);
const AU = 1.496e11, RE = 6.371e6, RM = 1.737e6, DMOON = 3.844e8, RHILL = 1.5e9, RSUN = 6.957e8;
const LANE = 4e8; // rock lane offset (sunward) near Earth
const C = { space: "#03050B", studio: "#F2F4F7", ink: "#141A22", inkL: "#E8EEF6", acc: "#FF6B2C", cool: "#3AA8FF" };
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const lerp = (a, b, k) => a + (b - a) * k;

// ---------- seeded value noise ----------
function hash3(x, y, z, s) {
  let h = (x * 374761393 + y * 668265263 + z * 1274126177 + s * 982451653) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function noise3(x, y, z, s = 1) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const fx = x - xi, fy = y - yi, fz = z - zi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
  let r = 0;
  for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) for (let c = 0; c < 2; c++)
    r += hash3(xi + a, yi + b, zi + c, s) * (a ? u : 1 - u) * (b ? v : 1 - v) * (c ? w : 1 - w);
  return r;
}
const fbm3 = (x, y, z, s, o = 4) => { let a = 0, amp = 0.5, f = 1, n = 0; for (let i = 0; i < o; i++) { a += amp * noise3(x * f, y * f, z * f, s + i); n += amp; amp *= 0.5; f *= 2.02; } return a / n; };

// ---------- textures ----------
function earthTextures() {
  const w = 1024, h = 512;
  const surf = canvasTex(w, h, (g) => {
    const img = g.createImageData(w, h);
    const ocean = [24, 84, 160], deep = [12, 48, 104], land = [86, 128, 70], desert = [196, 166, 108], ice = [240, 245, 250];
    for (let y = 0; y < h; y++) {
      const lat = (y / h - 0.5) * Math.PI, cl = Math.cos(lat), sl = Math.sin(lat);
      for (let x = 0; x < w; x++) {
        const lon = (x / w) * Math.PI * 2, px = cl * Math.cos(lon), pz = cl * Math.sin(lon);
        const n = fbm3(px * 1.6 + 3, sl * 1.6, pz * 1.6, 11, 5);
        const dsr = fbm3(px * 3 + 9, sl * 3, pz * 3, 31, 3);
        let col;
        if (Math.abs(sl) > 0.955 + (dsr - 0.5) * 0.05) col = ice;
        else if (n > 0.53) { const k = clamp01((dsr - 0.45) * 3) * clamp01(1 - Math.abs(Math.abs(sl) - 0.4) * 3); col = land.map((c, i) => c + (desert[i] - c) * k); }
        else { const k = clamp01((n - 0.3) / 0.23); col = deep.map((c, i) => c + (ocean[i] - c) * k); }
        const i4 = (y * w + x) * 4;
        img.data[i4] = col[0]; img.data[i4 + 1] = col[1]; img.data[i4 + 2] = col[2]; img.data[i4 + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
  });
  const cloud = canvasTex(w, h, (g) => {
    const img = g.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      const lat = (y / h - 0.5) * Math.PI, cl = Math.cos(lat), sl = Math.sin(lat);
      for (let x = 0; x < w; x++) {
        const lon = (x / w) * Math.PI * 2;
        const n = fbm3(cl * Math.cos(lon) * 2.4, sl * 3.2, cl * Math.sin(lon) * 2.4, 77, 4);
        const a = clamp01((n - 0.52) * 3.4);
        const i4 = (y * w + x) * 4;
        img.data[i4] = img.data[i4 + 1] = img.data[i4 + 2] = 255; img.data[i4 + 3] = a * 220;
      }
    }
    g.putImageData(img, 0, 0);
  });
  return { surf, cloud };
}
function moonTexture() {
  const r = mulberry(404);
  return canvasTex(512, 256, (g, w, h) => {
    const img = g.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const lat = (y / h - 0.5) * Math.PI, lon = (x / w) * Math.PI * 2;
      const n = fbm3(Math.cos(lat) * Math.cos(lon) * 2, Math.sin(lat) * 2, Math.cos(lat) * Math.sin(lon) * 2, 5, 4);
      const v = 120 + (n - 0.5) * 120;
      const i4 = (y * w + x) * 4; img.data[i4] = v; img.data[i4 + 1] = v * 0.98; img.data[i4 + 2] = v * 0.95; img.data[i4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    for (let i = 0; i < 70; i++) { const cx = r() * w, cy = h * (0.15 + r() * 0.7), rr = 2 + r() * 9; g.strokeStyle = "rgba(60,58,55,.35)"; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.stroke(); }
  });
}
// constant-screen-size tag: ring marker + label on a dark pill
function tagTex(text, sub, col, ring = true) {
  const w = 1024, h = 160;
  return canvasTex(w, h, (g) => {
    g.font = "800 58px Arial, Helvetica, sans-serif";
    const tw = g.measureText(text).width;
    g.font = "700 32px 'Courier New', monospace";
    const sw = sub ? g.measureText(sub).width : 0;
    const x0 = ring ? 100 : 8, bw = Math.max(tw, sw) + 36;
    g.fillStyle = "rgba(5,8,14,.74)";
    g.beginPath(); g.roundRect(x0, sub ? 14 : 38, bw, sub ? 132 : 84, 10); g.fill();
    g.fillStyle = col; g.fillRect(x0, sub ? 14 : 38, 6, sub ? 132 : 84);
    g.font = "800 58px Arial, Helvetica, sans-serif"; g.fillStyle = "#FFFFFF"; g.textBaseline = "alphabetic";
    g.fillText(text, x0 + 20, sub ? 78 : 101);
    if (sub) { g.font = "700 32px 'Courier New', monospace"; g.fillStyle = col; g.fillText(sub, x0 + 20, 126); }
    if (ring) {
      g.strokeStyle = col; g.lineWidth = 7; g.beginPath(); g.arc(50, 80, 26, 0, 7); g.stroke();
      g.fillStyle = col; g.beginPath(); g.arc(50, 80, 7, 0, 7); g.fill();
      g.fillRect(76, 78, 24, 4);
    }
  });
}

export function create(canvas, K, AT) {
  const A = (k) => { const v = AT[k] ?? K[k]; if (v === undefined) throw new Error("anchor " + k); return v; };
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1.0;
  const S = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(r);
  S.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  S.environmentIntensity = 0.55;
  const cam = new THREE.PerspectiveCamera(FOV, W / H, 0.02, 40000);
  cam.setViewOffset(W, H, 0, 140, W, H); // origin of render space sits at y≈820 px (inside the 300–1250 band)

  // ---------- lights ----------
  const sun = new THREE.DirectionalLight(0xfff4e6, 3.0); sun.position.set(-1, 0.22, 0.28); S.add(sun); S.add(sun.target);
  const hemi = new THREE.HemisphereLight(0xdfe8ff, 0x20242c, 0.2); S.add(hemi);
  const lamp = new THREE.PointLight(0xffb36b, 0, 0, 0); S.add(lamp);

  // ---------- zoom keys ----------
  const keyT = ZK.map((k) => (k[0] === "@0" ? 0 : k[0] === "@END" ? K.dur : A(k[0])) + k[1]);
  const zoomAt = (t) => {
    let i = 0;
    while (i < ZK.length - 2 && t > keyT[i + 1]) i++;
    const a = ZK[i], b = ZK[i + 1];
    const raw = clamp01((t - keyT[i]) / Math.max(0.01, keyT[i + 1] - keyT[i]));
    const s5 = raw * raw * raw * (raw * (raw * 6 - 15) + 10);
    const k = raw * 0.08 + s5 * 0.92;
    const e = lerp(a[2], b[2], k), Sv = Math.pow(10, e), Sa = Math.pow(10, a[2]), Sb = Math.pow(10, b[2]);
    const w = Math.abs(Sb - Sa) < 1e-9 ? k : clamp01((Sv - Sa) / (Sb - Sa));
    return { e, S: Sv, fa: a[3], fb: b[3], w, yaw: lerp(a[4], b[4], k), el: lerp(a[5], b[5], k) };
  };
  const boostE = (e) => 1 + 24 * ramp(e, 6.9, 8.3);
  const boostS = (e) => 1 + 29 * ramp(e, 9.4, 10.6);

  // ---------- capture path (Earth-centred rotating frame, units of 1e9 m) ----------
  const d0 = 3.49e9 / (AU - LANE);
  const P0 = V(((AU - LANE) * Math.cos(d0) - AU) / 1e9, 0, -((AU - LANE) * Math.sin(d0)) / 1e9);
  const ctrl = [P0, V(-0.47, 0.03, -2.5), V(-0.68, 0.08, -1.45), V(-0.92, 0.05, -0.45), V(-0.62, -0.04, 0.55), V(0.12, -0.08, 0.92),
    V(0.82, 0, 0.42), V(0.74, 0.06, -0.42), V(0.05, 0.09, -0.86), V(-0.62, 0.03, -0.42), V(-0.5, -0.04, 0.36), V(0.42, -0.03, 0.47),
    V(0.98, 0.04, -0.12), V(0.45, 0.09, -1.02), V(-0.62, 0.05, -1.12), V(-1.22, 0, -0.18), V(-1.02, -0.05, 0.92), V(0.1, -0.07, 1.42),
    V(1.25, 0, 1.3), V(2.0, 0.04, 2.45), V(2.55, 0.05, 3.8), V(2.95, 0, 5.4)];
  const curve = new THREE.CatmullRomCurve3(ctrl, false, "centripetal");
  curve.arcLengthDivisions = 2000;
  const NS = 1600, samp = [];
  for (let i = 0; i < NS; i++) samp.push(curve.getPointAt(i / (NS - 1)));
  let best = 9;
  for (let i = 0; i < NS; i++) if (i / (NS - 1) < 0.7) best = Math.min(best, samp[i].length());
  const sc = 0.537 / best; // so the closest pass is 537,000 km
  const sl = (p) => Math.hypot(p.x * sc, p.y, p.z * sc);
  let uIn = 0, uClose = 0, bb = 9;
  for (let i = 0; i < NS; i++) { const rr = sl(samp[i]), u = i / (NS - 1); if (!uIn && rr < 1.5) uIn = u; if (u < 0.7 && rr < bb) { bb = rr; uClose = u; } }
  const P = (u) => {
    if (u <= 1) { const q = curve.getPointAt(clamp01(u)); return V(q.x * sc * 1e9, q.y * 1e9, q.z * sc * 1e9); }
    const p1 = curve.getPointAt(1), tg = curve.getTangentAt(1), q = p1.addScaledVector(tg, (u - 1) * 6);
    return V(q.x * sc * 1e9, q.y * 1e9, q.z * sc * 1e9);
  };
  const uLab = 0.56;
  const L = P(uLab);
  const tSwap = A("s3:Matahari") - 0.1;
  const pl = (t, pts) => { if (t <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const k = clamp01((t - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0])); const s = k * k * (3 - 2 * k); return lerp(pts[i - 1][1], pts[i][1], s); } return pts[pts.length - 1][1]; };
  const uOf = (t) => pl(t, [[A("s5:masuk") - 0.3, 0], [A("s5:negatif") + 0.2, uIn + 0.01], [A("s5:paling") + 0.3, uClose], [A("s5e") - 0.2, uLab], [A("s7") + 0.3, uLab], [A("s7:sendirian"), 1.0], [K.dur, 1.22]]);
  const helioRock = (t) => {
    const dl = lerp(0.55, d0, ramp(t, A("s3:Matahari"), A("s3:mendekat") + 1.2));
    return V((AU - LANE) * Math.cos(dl) - AU, 0, -(AU - LANE) * Math.sin(dl)).lerp(P(0), ramp(t, A("s3:mendekat") + 0.6, A("s3e")));
  };
  const rockPos = (t) => {
    if (t < tSwap) return P(uLab - 0.04 + 0.04 * ramp(t, 0, A("s2:Ukurannya")));
    if (t < A("s3e") + 0.05) return helioRock(t);
    return P(uOf(t));
  };
  // rock as seen by the path ribbon: drawn progress and opacity
  const pathDraw = (t) => (t < A("s3") ? [uLab - 0.04 + 0.04 * ramp(t, 0, A("s2:Ukurannya")), 0.55] : t < A("s5:masuk") - 0.3 ? [0, 0] : [Math.min(1, uOf(t)), 1]);

  // ---------- ribbon (screen-constant width curves) ----------
  const ribVS = `attribute vec3 aN;attribute float aS;attribute float aU;uniform vec3 uOff;uniform float uScale;uniform float uHW;varying float vU;
void main(){vU=aU;vec3 p=uOff+position*uScale+aN*aS*uHW;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`;
  const ribFS = `uniform vec3 uC;uniform float uO;uniform float uDraw;uniform float uDash;varying float vU;
void main(){if(vU>uDraw)discard;if(uDash>0.&&fract(vU*uDash)>.56)discard;gl_FragColor=vec4(uC,uO);}`;
  function ribbon(pts, closed, color, dash = 0, glow = 1.4) {
    const n = pts.length, pos = [], nor = [], side = [], uu = [], idx = [];
    let tot = 0; const cum = [0];
    for (let i = 1; i < n; i++) { tot += pts[i].distanceTo(pts[i - 1]); cum.push(tot); }
    if (closed) tot += pts[0].distanceTo(pts[n - 1]);
    for (let i = 0; i < n; i++) {
      const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
      const tg = b.clone().sub(a); let nn = tg.clone().cross(V(0, 1, 0));
      if (nn.lengthSq() < 1e-12) nn = tg.clone().cross(V(1, 0, 0));
      nn.normalize();
      for (const s of [-1, 1]) { pos.push(pts[i].x, pts[i].y, pts[i].z); nor.push(nn.x, nn.y, nn.z); side.push(s); uu.push(cum[i] / tot); }
    }
    const seg = closed ? n : n - 1;
    for (let i = 0; i < seg; i++) { const a = i * 2, b = ((i + 1) % n) * 2; idx.push(a, a + 1, b, a + 1, b + 1, b); }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aN", new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute("aS", new THREE.Float32BufferAttribute(side, 1));
    g.setAttribute("aU", new THREE.Float32BufferAttribute(uu, 1));
    g.setIndex(idx);
    const m = new THREE.ShaderMaterial({ vertexShader: ribVS, fragmentShader: ribFS, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { uOff: { value: V() }, uScale: { value: 1 }, uHW: { value: 0.01 }, uC: { value: new THREE.Color(color).multiplyScalar(glow) }, uO: { value: 1 }, uDraw: { value: 1 }, uDash: { value: dash } } });
    const me = new THREE.Mesh(g, m); me.frustumCulled = false; me.renderOrder = 3; S.add(me);
    return me;
  }
  const circlePts = (n, rx = 1, rz = rx) => Array.from({ length: n }, (_, i) => V(Math.cos((i / n) * Math.PI * 2) * rx, 0, Math.sin((i / n) * Math.PI * 2) * rz));
  const ribMoon = ribbon(circlePts(256), true, "#AEB8C8", 0, 1.0);
  const ribHillEq = ribbon(circlePts(256), true, C.acc, 60, 1.3);
  const ribEarthOrb = ribbon(circlePts(1024), true, C.cool, 0, 1.4);
  const ribRockOrb = ribbon(circlePts(1024), true, C.acc, 220, 1.5);
  const ribPath = ribbon(samp.map((p) => V(p.x * sc, p.y, p.z * sc)), false, C.acc, 0, 1.7);
  const ribQuasi = ribbon(circlePts(256, 2.3, 1.25), true, "#9CCBFF", 46, 1.3);
  const ribHillR = ribbon([V(0, 0, 0), V(0.9, 0, 0.44).normalize()], false, "#FFFFFF", 0, 1.2);
  const pClose = P(uClose);
  const ribCloseR = ribbon([V(0, 0, 0), pClose.clone().normalize()], false, "#FFFFFF", 0, 1.2);

  // ---------- tags ----------
  function tag(text, sub, col, ring = true, hpx = 78) {
    const m = new THREE.SpriteMaterial({ map: tagTex(text, sub, col, ring), transparent: true, depthTest: false, depthWrite: false, sizeAttenuation: false });
    const s = new THREE.Sprite(m); s.center.set(ring ? 50 / 1024 : 0, 0.5);
    const sy = (hpx / H) * 2 * TANH; s.scale.set(sy * 6.4, sy, 1); s.renderOrder = 10; S.add(s); return s;
  }
  const T = {
    earth: tag("BUMI", "", C.cool), moon: tag("BULAN", "", "#C9D2DE"), rock: tag("2026 QQ8", "PELACAK AUDIRA", C.acc), sun: tag("MATAHARI", "", "#FFC46B"),
    hill: tag("BOLA HILL", "", C.acc, false), kamo: tag("KAMO'OALEWA", "SEIRAMA", "#9CCBFF"), hillR: tag("1,5 JUTA km", "", "#FFFFFF", false, 70),
    closeR: tag("537.000 km", "18 AGUSTUS", "#FFFFFF", false, 74), eorb: tag("ORBIT BUMI", "", C.cool, false, 64), rorb: tag("ORBIT BATU", "359 HARI", C.acc, false, 66),
    dome: tag("HUNGARIA", "19 AGUSTUS", C.acc), size: tag("1–2 m", "", C.acc, false, 76), man: tag("MANUSIA", "", "#FFFFFF", false, 60),
    stage: tag("SAMPAH ROKET", "BERONGGA", "#FFFFFF", false, 66), rocklab: tag("BATU", "PADAT", C.acc, false, 66), light: tag("CAHAYA MATAHARI", "", "#FFC46B", false, 60),
    tarikE: tag("TARIKAN BUMI", "", C.cool, false, 58), tarikS: tag("TARIKAN MATAHARI", "", C.acc, false, 58),
  };

  // ---------- Earth system ----------
  const tex = earthTextures();
  const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.MeshStandardMaterial({ map: tex.surf, roughness: 0.82, metalness: 0 }));
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.008, 96, 64), new THREE.MeshStandardMaterial({ map: tex.cloud, transparent: true, roughness: 1, depthWrite: false }));
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.07, 64, 48), new THREE.ShaderMaterial({ side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: "varying vec3 n;varying vec3 vv;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);vv=normalize(-mv.xyz+vec3(1e-6));gl_Position=projectionMatrix*mv;}",
    fragmentShader: "varying vec3 n;varying vec3 vv;void main(){float f=clamp(1.-abs(dot(normalize(n),normalize(vv))),0.,1.);float a=pow(f,2.2)*.9;gl_FragColor=vec4(vec3(.35,.65,1.)*a*1.2,a);}" }));
  S.add(earth, clouds, atmo);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), new THREE.MeshStandardMaterial({ map: moonTexture(), roughness: 0.95 }));
  S.add(moon);
  const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uO: { value: 0 } },
    vertexShader: "varying vec3 n;varying vec3 vv;varying vec3 op;void main(){op=position;vec4 mv=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);vv=normalize(-mv.xyz+vec3(1e-6));gl_Position=projectionMatrix*mv;}",
    fragmentShader: "uniform float uO;varying vec3 n;varying vec3 vv;varying vec3 op;void main(){float f=clamp(1.-abs(dot(normalize(n),normalize(vv))),0.,1.);float lat=abs(fract(op.y*4.+.5)-.5);float ln=1.-smoothstep(0.,.025,lat);float a=uO*(.025+.42*pow(f,3.)+.12*ln);gl_FragColor=vec4(mix(vec3(1.,.55,.3),vec3(1.),.35)*1.2,a);}" }));
  hill.renderOrder = 2; S.add(hill);
  const sunM = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFD38A").multiplyScalar(2.2) }));
  const glowTex = canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "rgba(255,210,140,1)"); gr.addColorStop(0.25, "rgba(255,160,70,.45)"); gr.addColorStop(1, "rgba(255,120,40,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  S.add(sunM, sunGlow);
  // rock glow dot for orbital views
  const dotTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.2, "rgba(255,150,90,.9)"); gr.addColorStop(1, "rgba(255,107,44,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
  const rockDot = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: false }));
  rockDot.renderOrder = 9; S.add(rockDot);
  const kamoDot = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0x9ccbff, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: false }));
  kamoDot.renderOrder = 9; S.add(kamoDot);

  // arrows (unit length along +y, scaled per frame)
  function arrow(color) {
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.6), transparent: true });
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 16), mat); const hd = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 20), mat);
    g.add(sh, hd); g.userData = { sh, hd, mat }; S.add(g); return g;
  }
  const setArrow = (g, from, to, rad, op, z) => {
    const d = to.clone().sub(from), len = d.length();
    if (len < 1e-9 || op <= 0.001) { g.visible = false; return; }
    g.visible = true; const dir = d.clone().normalize();
    g.position.copy(z.R(from)); g.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
    const hl = Math.min(len * 0.45, rad * 5), sl = len - hl;
    g.userData.sh.scale.set(rad / z.S, sl / z.S, rad / z.S); g.userData.sh.position.set(0, sl / 2 / z.S, 0);
    g.userData.hd.scale.set(rad * 2.4 / z.S, hl / z.S, rad * 2.4 / z.S); g.userData.hd.position.set(0, (sl + hl / 2) / z.S, 0);
    g.userData.mat.opacity = op;
  };
  const arE1 = arrow(C.cool), arS1 = arrow(C.acc), arE2 = arrow(C.cool), arS2 = arrow(C.acc), arT1 = arrow(C.acc), arT2 = arrow(C.acc), arT3 = arrow(C.acc), arTE = arrow(C.cool);

  // ---------- telescope dome station (real metres, local up = +y) ----------
  const dome = new THREE.Group(); S.add(dome);
  const rD = mulberry(1616);
  const groundAlpha = canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 30, 128, 128, 128); gr.addColorStop(0, "#fff"); gr.addColorStop(0.75, "#999"); gr.addColorStop(1, "#000"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(700, 64), new THREE.MeshStandardMaterial({ color: "#1d2b25", roughness: 1, alphaMap: groundAlpha, transparent: true }));
  ground.rotation.x = -Math.PI / 2; dome.add(ground);
  const white = new THREE.MeshStandardMaterial({ color: "#E8EEF6", roughness: 0.55 });
  const silver = new THREE.MeshStandardMaterial({ color: "#C9D1DA", roughness: 0.3, metalness: 0.8 });
  const darkM = new THREE.MeshStandardMaterial({ color: "#2A3038", roughness: 0.7 });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.3, 3.2, 64), white); wall.position.y = 1.6; dome.add(wall);
  const ringT = new THREE.Mesh(new THREE.TorusGeometry(3.22, 0.12, 12, 64), silver); ringT.rotation.x = Math.PI / 2; ringT.position.y = 3.2; dome.add(ringT);
  const cupola = new THREE.Mesh(new THREE.SphereGeometry(3.3, 64, 32, 0.32, Math.PI * 2 - 0.64, 0, Math.PI / 2), silver); cupola.position.y = 3.2; cupola.rotation.y = Math.PI / 2 + 0.5; dome.add(cupola);
  const inner = new THREE.Mesh(new THREE.SphereGeometry(3.1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#3a2a1c", emissive: "#ff9a4a", emissiveIntensity: 0.55, side: THREE.BackSide })); inner.position.y = 3.2; dome.add(inner);
  const door = new THREE.Mesh(new THREE.CylinderGeometry(3.31, 3.31, 2.0, 16, 1, true, -0.18, 0.36), darkM); door.position.y = 1.0; door.rotation.y = 0.9; dome.add(door);
  const tube = new THREE.Group(); tube.position.set(0, 3.3, 0); dome.add(tube);
  const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 3.2, 32), white); tb.position.y = 1.0; tube.add(tb);
  const tbr = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.06, 10, 32), darkM); tbr.rotation.x = Math.PI / 2; tbr.position.y = 2.6; tube.add(tbr);
  const skyDir = V(0.55, 0.78, 0.3).normalize();
  tube.quaternion.setFromUnitVectors(V(0, 1, 0), skyDir);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.5, 260, 16, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(C.acc).multiplyScalar(1.4), transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
  beam.position.copy(V(0, 3.3, 0).addScaledVector(skyDir, 133)); beam.quaternion.setFromUnitVectors(V(0, 1, 0), skyDir); dome.add(beam);
  const treeM = new THREE.MeshStandardMaterial({ color: "#16301f", roughness: 0.9 });
  for (let i = 0; i < 40; i++) {
    const a = rD() * Math.PI * 2, rr = 12 + rD() * 70, hgt = 4 + rD() * 5;
    if (Math.abs(Math.sin(a - 1.2)) < 0.3 && rr < 30) continue;
    const tr = new THREE.Mesh(new THREE.ConeGeometry(hgt * 0.24, hgt, 10), treeM); tr.position.set(Math.cos(a) * rr, hgt / 2, Math.sin(a) * rr); dome.add(tr);
  }
  const hillM = new THREE.MeshStandardMaterial({ color: "#121c1a", roughness: 1 });
  for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2 + rD() * 0.3, rr = 300 + rD() * 150, hh = 20 + rD() * 45; const hm = new THREE.Mesh(new THREE.ConeGeometry(90 + rD() * 70, hh, 12), hillM); hm.position.set(Math.cos(a) * rr, hh / 2 - 2, Math.sin(a) * rr); dome.add(hm); }

  // ---------- measuring studio around the rock (real metres, origin = rock rest point) ----------
  const lab = new THREE.Group(); S.add(lab);
  const FLOOR = -1.0;
  const floorTex = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#E6EAF0"; g.fillRect(0, 0, w, h);
    for (let i = 0; i <= 20; i++) { const p = (i / 20) * w; g.strokeStyle = i % 10 === 0 ? "rgba(20,26,34,.55)" : "rgba(20,26,34,.16)"; g.lineWidth = i % 10 === 0 ? 4 : 1.5; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, h); g.stroke(); g.beginPath(); g.moveTo(0, p); g.lineTo(w, p); g.stroke(); }
  }, [20, 20]);
  const floorAlpha = canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, "#fff"); gr.addColorStop(0.55, "#bbb"); gr.addColorStop(1, "#000"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
  const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, alphaMap: floorAlpha, transparent: true, roughness: 0.85, depthWrite: false });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), floorMat); floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR; lab.add(floor);
  const shadowTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(10,14,20,.55)"); gr.addColorStop(1, "rgba(10,14,20,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
  const blob = (w, d, x, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, FLOOR + 0.005, z); lab.add(m); return m; };
  // floor ruler strip with metre numbers
  const stripTex = canvasTex(2048, 128, (g, w, h) => {
    g.fillStyle = "#141A22"; g.fillRect(0, 0, w, h);
    for (let i = 0; i <= 50; i++) { const x = 40 + i * 38.4; g.fillStyle = i % 10 === 0 ? "#FF6B2C" : "#E8EEF6"; g.fillRect(x, 0, i % 10 === 0 ? 6 : 3, i % 10 === 0 ? 64 : i % 5 === 0 ? 44 : 26); if (i % 10 === 0) { g.font = "800 44px Arial"; g.fillText(i / 10 + " m", x + 12, 108); } }
    g.font = "800 46px Arial"; g.fillStyle = "#FF6B2C"; g.fillText("AUDIRA · SKALA", 1560, 108);
  });
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 0.32), new THREE.MeshStandardMaterial({ map: stripTex, roughness: 0.6 }));
  strip.rotation.x = -Math.PI / 2; strip.position.set(-0.4, FLOOR + 0.01, 1.35); lab.add(strip);
  // vertical ruler post with AUDIRA
  const postTex = canvasTex(256, 2048, (g, w, h) => {
    g.fillStyle = "#F7F8FA"; g.fillRect(0, 0, w, h);
    for (let i = 0; i <= 100; i++) { const y = h - 40 - i * 18.6; const big = i % 50 === 0, mid = i % 10 === 0; g.fillStyle = big ? "#FF6B2C" : "#141A22"; g.fillRect(0, y, big ? 150 : mid ? 100 : i % 5 === 0 ? 64 : 36, big ? 7 : 3); if (mid) { g.font = "800 46px Arial"; g.fillText((i / 50).toFixed(1).replace(".", ","), 120, y - 8); } }
    g.save(); g.translate(205, h * 0.62); g.rotate(-Math.PI / 2); g.font = "800 54px Arial"; g.fillStyle = "#FF6B2C"; g.fillText("AUDIRA", 0, 0); g.restore();
  });
  const post = new THREE.Group(); lab.add(post); post.position.set(-1.45, FLOOR, -0.15);
  const pBody = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.2, 0.06), new THREE.MeshStandardMaterial({ color: "#F7F8FA", roughness: 0.5 })); pBody.position.y = 1.1; post.add(pBody);
  const pFace = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 2.2), new THREE.MeshStandardMaterial({ map: postTex, roughness: 0.5 })); pFace.position.set(0, 1.1, 0.031); post.add(pFace);
  for (const y of [0.0, 2.2]) { const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.17, 16), new THREE.MeshStandardMaterial({ color: C.acc, roughness: 0.4 })); cap.rotation.z = Math.PI / 2; cap.position.y = y; post.add(cap); }
  const pBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.05, 32), darkM); pBase.position.y = 0.025; post.add(pBase);

  // the rock: smooth low-frequency displacement, a few dimples, vertex colour (no streaky relief)
  const rockG = new THREE.SphereGeometry(1, 128, 96);
  { const pa = rockG.attributes.position, col = []; const dimples = [V(0.6, 0.5, 0.62), V(-0.7, 0.2, 0.68), V(0.1, -0.8, 0.6), V(-0.2, 0.75, -0.6)].map((v) => v.normalize());
    const p = V();
    for (let i = 0; i < pa.count; i++) {
      p.fromBufferAttribute(pa, i); const n = p.clone().normalize();
      let d = (fbm3(n.x * 1.3 + 4, n.y * 1.3, n.z * 1.3, 61, 4) - 0.5) * 0.55 + (noise3(n.x * 4, n.y * 4, n.z * 4, 71) - 0.5) * 0.08;
      for (const c of dimples) { const k = n.dot(c); if (k > 0.94) d -= 0.07 * Math.sin(((k - 0.94) / 0.06) * Math.PI); }
      const s = 1 + d; p.copy(n).multiplyScalar(s); p.x *= 0.88; p.y *= 0.6; p.z *= 0.62; pa.setXYZ(i, p.x, p.y, p.z);
      const shade = 0.78 + d * 0.9 + (noise3(n.x * 9, n.y * 9, n.z * 9, 81) - 0.5) * 0.12;
      col.push(0.48 * shade, 0.435 * shade, 0.4 * shade);
    }
    rockG.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); rockG.computeVertexNormals(); }
  const rock = new THREE.Mesh(rockG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.93, metalness: 0 }));
  lab.add(rock);
  const rockShadow = blob(2.4, 1.6, 0, 0);
  // bracket over the rock (1–2 m)
  const brM = new THREE.MeshBasicMaterial({ color: new THREE.Color(C.acc).multiplyScalar(1.2) });
  const bracket = new THREE.Group(); lab.add(bracket);
  { const bar = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.025, 0.025), brM); bracket.add(bar); for (const x of [-0.88, 0.88]) { const tk = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.18, 0.025), brM); tk.position.set(x, -0.08, 0); bracket.add(tk); } }
  bracket.position.set(0, 0.95, 0.1);

  // generic person figure: face, shoulders wider than hips, bent elbows/knees, skin differs from clothes
  const person = new THREE.Group(); lab.add(person);
  { const skin = new THREE.MeshStandardMaterial({ color: "#C68E6A", roughness: 0.6 }), shirt = new THREE.MeshStandardMaterial({ color: "#2F6FB0", roughness: 0.75 }),
      pants = new THREE.MeshStandardMaterial({ color: "#26303D", roughness: 0.8 }), shoe = new THREE.MeshStandardMaterial({ color: "#14181E", roughness: 0.5 }), hair = new THREE.MeshStandardMaterial({ color: "#2A1E16", roughness: 0.8 }),
      eye = new THREE.MeshStandardMaterial({ color: "#101214", roughness: 0.2 });
    const limb = (a, b, rr, m) => { const d = b.clone().sub(a), len = d.length(); const me = new THREE.Mesh(new THREE.CapsuleGeometry(rr, Math.max(0.001, len), 6, 14), m); me.position.copy(a).add(b).multiplyScalar(0.5); me.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); person.add(me); };
    for (const s of [-1, 1]) {
      const hip = V(0.1 * s, 0.95, 0), knee = V(0.115 * s, 0.53, 0.05), ank = V(0.125 * s, 0.1, -0.01);
      limb(hip, knee, 0.078, pants); limb(knee, ank, 0.062, pants); limb(ank.clone().add(V(0, -0.03, -0.03)), V(0.13 * s, 0.05, 0.15), 0.052, shoe);
      const sh = V(0.215 * s, 1.41, 0), el = V(0.275 * s, 1.14, 0.05), wr = V(0.245 * s, 0.93, 0.19);
      limb(sh, el, 0.055, shirt); limb(el, wr, 0.043, skin);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.052, 16, 12), skin); hand.position.copy(wr).add(V(0, -0.03, 0.02)); hand.scale.set(0.8, 1.1, 1); person.add(hand);
    }
    const torso = new THREE.Mesh(new THREE.LatheGeometry([V(0.001, 0.9), V(0.155, 0.92), V(0.17, 1.04), V(0.18, 1.2), V(0.21, 1.35), V(0.225, 1.42), V(0.17, 1.47), V(0.06, 1.5), V(0.001, 1.505)].map((v) => new THREE.Vector2(v.x, v.y)), 32), shirt);
    torso.scale.z = 0.62; person.add(torso);
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.158, 0.158, 0.05, 32), pants); belt.position.y = 0.93; belt.scale.z = 0.64; person.add(belt);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.052, 0.1, 16), skin); neck.position.y = 1.53; person.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 32, 24), skin); head.position.y = 1.665; head.scale.set(0.95, 1.12, 1.02); person.add(head);
    const hr = new THREE.Mesh(new THREE.SphereGeometry(0.116, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52), hair); hr.position.set(0, 1.68, -0.008); hr.rotation.x = -0.25; hr.scale.set(0.97, 1.08, 1.04); person.add(hr);
    for (const s of [-1, 1]) { const ey = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 8), eye); ey.position.set(0.038 * s, 1.678, 0.1); person.add(ey); const br = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.008, 0.01), hair); br.position.set(0.038 * s, 1.705, 0.103); person.add(br); }
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 8), skin); nose.position.set(0, 1.65, 0.113); person.add(nose);
    const mouth = new THREE.Mesh(new THREE.CapsuleGeometry(0.006, 0.03, 4, 8), new THREE.MeshStandardMaterial({ color: "#7a3b30" })); mouth.rotation.z = Math.PI / 2; mouth.position.set(0, 1.612, 0.104); person.add(mouth);
  }
  person.position.set(1.3, FLOOR, 0.3); person.rotation.y = -0.35;
  const personShadow = blob(0.9, 0.7, 1.3, 0.3);

  // hollow rocket-stage suspect (generic, no markings) for the sunlight-push test
  const stage = new THREE.Group(); lab.add(stage);
  { const shell = new THREE.MeshStandardMaterial({ color: "#E9ECEF", roughness: 0.42, metalness: 0.35, side: THREE.DoubleSide });
    const prof = [[1.0, -2.1], [1.03, -2.17], [1.07, -2.17], [1.1, -2.1], [1.1, 2.1], [1.07, 2.17], [1.03, 2.17], [1.0, 2.1], [1.0, -2.1]].map((p) => new THREE.Vector2(p[0], p[1]));
    stage.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 72), shell));
    const band = new THREE.Mesh(new THREE.CylinderGeometry(1.106, 1.106, 0.32, 72, 1, true), new THREE.MeshStandardMaterial({ color: C.acc, roughness: 0.5 })); band.position.y = 1.35; stage.add(band);
    const bell = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0.28, -2.1), new THREE.Vector2(0.4, -2.5), new THREE.Vector2(0.62, -2.95), new THREE.Vector2(0.66, -3.0)], 48), new THREE.MeshStandardMaterial({ color: "#5b6068", roughness: 0.35, metalness: 0.8, side: THREE.DoubleSide })); stage.add(bell);
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.9, 0.5, 32, 1, true), darkM); strut.position.y = -1.9; stage.add(strut);
  }
  stage.scale.setScalar(0.62);
  const sunRays = [];
  const rayM = new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFD27A").multiplyScalar(1.8), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const rR = mulberry(2626);
  for (let i = 0; i < 16; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.8, 6), rayM.clone()); m.rotation.z = Math.PI / 2; m.userData = { y: -0.6 + rR() * 2.4, z: -3.4 + rR() * 4.6, ph: rR() }; lab.add(m); sunRays.push(m); }
  const trailM = new THREE.MeshBasicMaterial({ color: new THREE.Color(C.acc).multiplyScalar(1.2), transparent: true, depthWrite: false });
  const trailS = new THREE.Mesh(new THREE.BoxGeometry(1, 0.03, 0.03), trailM); lab.add(trailS);
  const trailR = new THREE.Mesh(new THREE.BoxGeometry(1, 0.03, 0.03), trailM); lab.add(trailR);

  // ---------- stars ----------
  const stars = new THREE.Group(); S.add(stars);
  for (const [n, sz, seed] of [[2200, 2.0, 7], [260, 3.6, 9]]) {
    const rs = mulberry(seed), pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const u = rs() * 2 - 1, a = rs() * Math.PI * 2, q = Math.sqrt(1 - u * u); pos.set([q * Math.cos(a) * 15000, u * 15000, q * Math.sin(a) * 15000], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    stars.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xdfe8ff, size: sz, sizeAttenuation: false, transparent: true, depthWrite: false })));
  }

  // ---------- post: NaN guard before bloom ----------
  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(any(isnan(c))||any(isinf(c)))c=vec4(0.,0.,0.,1.);gl_FragColor=clamp(c,0.,64.);}" })));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.32, 0.4, 1.0);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());

  // ---------- DOM gauge ----------
  const gdot = document.querySelector("#gdot"), gval = document.querySelector("#gval");
  const bgCol = new THREE.Color(), cSpace = new THREE.Color(C.space), cStudio = new THREE.Color(C.studio);
  const pxOf = (rRender, z) => (rRender / (D * TANH)) * (H / 2); // screen radius in px of an object at the focus distance

  return (t) => {
    const zz = zoomAt(t), e = zz.e, Sv = zz.S, BE = boostE(e), BS = boostS(e);
    const sunPos = V(-AU, 0, 0), R = rockPos(t);
    const domePt = V(0, RE * BE + 2.5, 0);
    const anchor = (name) => {
      if (name.includes(">")) { const [ab, f] = name.split(":"); const [a, b] = ab.split(">"); return anchor(a).lerp(anchor(b), +f); }
      return name === "E" ? V() : name === "R" ? R.clone() : name === "L" ? L.clone() : name === "DOME" ? domePt.clone() : name === "SUNMID" ? V(-AU * 0.5, 0, 0) : V();
    };
    const Cf = anchor(zz.fa).lerp(anchor(zz.fb), zz.w);
    const z = { S: Sv, R: (p) => V((p.x - Cf.x) / Sv, (p.y - Cf.y) / Sv, (p.z - Cf.z) / Sv) };
    // camera: orbit around the render origin
    const yaw = (zz.yaw + Math.sin(t * 0.21) * 2.2) * Math.PI / 180, el = (zz.el + Math.sin(t * 0.17 + 1) * 1.2) * Math.PI / 180;
    cam.position.set(D * Math.cos(el) * Math.sin(yaw), D * Math.sin(el), D * Math.cos(el) * Math.cos(yaw));
    cam.up.set(0, 1, 0); cam.lookAt(0, 0, 0); cam.updateMatrixWorld();
    stars.position.copy(cam.position);

    // windows
    const domeW = ramp(t, A("s2:QQ8") + 0.4, A("s2:QQ8") + 1.2) * (1 - ramp(t, A("s2:Ukurannya"), A("s2:Ukurannya") + 0.5));
    const studio = (1 - domeW) * (1 - ramp(e, 3.4, 5.8));
    bgCol.copy(cSpace).lerp(cStudio, studio); r.setClearColor(bgCol, 1);
    stars.children.forEach((p) => (p.material.opacity = 1 - studio));
    hemi.intensity = lerp(0.18, 1.1, studio) + domeW * 0.25 * (1 - ramp(e, 3, 5));
    hemi.color.set(domeW > 0.5 ? "#7d93c8" : "#dfe8ff");
    sun.intensity = lerp(3.1, 2.2, studio) * (1 - 0.7 * domeW * (1 - ramp(e, 3, 5)));
    S.environmentIntensity = 0.55;

    // Earth, clouds, atmosphere
    const er = (RE * BE) / Sv, ep = z.R(V());
    const earthOn = er > 0.0005 && er < 3000 && !(domeW > 0.5 && e < 3.5);
    for (const m of [earth, clouds, atmo]) { m.visible = earthOn; m.position.copy(ep); m.scale.setScalar(er); }
    earth.rotation.y = 0.6 + t * 0.02; clouds.rotation.y = 0.6 + t * 0.026;
    // Moon
    const phm = 2.25 + t * 0.012, mp = V(Math.cos(phm) * DMOON, DMOON * 0.03, Math.sin(phm) * DMOON);
    const mr = (RM * BE) / Sv; moon.visible = mr > 0.0004 && mr < 3000 && e > 6; moon.position.copy(z.R(mp)); moon.scale.setScalar(mr);
    // Sun
    const sr = (RSUN * BS) / Sv, spr = z.R(sunPos); sunM.visible = e > 9.3 && sr < 3000; sunM.position.copy(spr); sunM.scale.setScalar(sr);
    sunGlow.visible = sunM.visible; sunGlow.position.copy(spr); sunGlow.scale.setScalar(sr * 7); sunGlow.material.opacity = ramp(e, 9.4, 10.2);
    sun.position.set(-1, 0.22, 0.28);

    // Hill sphere
    const hillOn = ramp(t, A("s4:Hill") - 0.4, A("s4:Hill") + 0.8);
    const hr = (RHILL * lerp(0.6, 1, eout(hillOn))) / Sv;
    hill.visible = hillOn > 0.01 && e > 7.6 && hr < 2000; hill.position.copy(ep); hill.scale.setScalar(hr);
    hill.material.uniforms.uO.value = hillOn * (1 - ramp(e, 10.6, 11.2));

    // ribbons: width in render units for a given px thickness
    const hw = (px) => (px / H) * D * TANH;
    const setRib = (m, on, off, scale, px, op, draw = 1) => { m.visible = on && op > 0.005; if (!m.visible) return; const u = m.material.uniforms; u.uOff.value.copy(off); u.uScale.value = scale; u.uHW.value = hw(px); u.uO.value = op; u.uDraw.value = draw; };
    setRib(ribMoon, e > 7.3 && e < 11, ep, DMOON / Sv, 2.2, 0.55 * ramp(e, 7.3, 8) * (1 - ramp(t, A("s3:Matahari") - 1, A("s3:Matahari"))) + 0.55 * ramp(t, A("s4"), A("s4") + 1) * ramp(e, 7.3, 8));
    setRib(ribHillEq, e > 7.8 && e < 11.2, ep, (RHILL * lerp(0.6, 1, eout(hillOn))) / Sv, 3, 0.85 * hillOn);
    const helioOp = ramp(e, 8.9, 9.5) * (t > A("s3") && t < A("s4") + 0.5 ? 1 : 0);
    setRib(ribEarthOrb, e > 9 && e < 12.5, spr, AU / Sv, 3.2, helioOp);
    setRib(ribRockOrb, e > 9 && e < 12.5, spr, (AU - LANE) / Sv, 3.2, helioOp);
    const [pdu, pdo] = pathDraw(t);
    setRib(ribPath, e > 7.4 && e < 11.4 && pdu > 0.002, ep, 1e9 / Sv, 4.2, pdo * ramp(e, 7.4, 8.2), pdu);
    const quasiOn = ramp(t, A("s6:Pengiring"), A("s6:Pengiring") + 1.2) * (1 - ramp(t, A("s7") + 0.2, A("s7") + 1));
    setRib(ribQuasi, e > 8.5 && e < 12, ep, 1e10 / Sv, 3, quasiOn);
    const hillRon = ramp(t, A("s4:Hill") + 0.6, A("s4:juta")) * (1 - ramp(t, A("s5") - 0.4, A("s5")));
    setRib(ribHillR, e > 7.8 && e < 11, ep, RHILL / Sv, 3, hillRon, hillRon);
    const closeOn = ramp(t, A("s5:paling") - 0.3, A("s5:paling") + 0.7) * (1 - ramp(t, A("s5e") - 0.2, A("s5e") + 0.3));
    setRib(ribCloseR, e > 7.8 && e < 11, ep, pClose.length() / Sv, 3, closeOn, closeOn);

    // arrows: Hill sphere tug-of-war (s4) and the Sun's tug (s7)
    const arOn = ramp(t, A("s4:tarikan"), A("s4:tarikan") + 0.6) * (1 - ramp(t, A("s5") + 0.4, A("s5") + 1.0));
    const pA = V(0.85e9, 0, 0.45e9), pB = V(-0.3e9, 0, -2.0e9);
    const toE = (p, len) => p.clone().add(p.clone().negate().normalize().multiplyScalar(len));
    const toS = (p, len) => p.clone().add(V(-1, 0, 0).multiplyScalar(len));
    const arR = 2.6e7 * (Sv / 2.1e9);
    setArrow(arE1, pA, toE(pA, 0.62e9 * eout(arOn)), arR, arOn, z); setArrow(arS1, pA, toS(pA, 0.22e9 * eout(arOn)), arR, arOn, z);
    setArrow(arE2, pB, toE(pB, 0.2e9 * eout(arOn)), arR, arOn, z); setArrow(arS2, pB, toS(pB, 0.62e9 * eout(arOn)), arR, arOn, z);
    const tugOn = ramp(t, A("s7"), A("s7") + 0.6) * (1 - ramp(t, A("s8") - 0.2, A("s8") + 0.5));
    const pul = 0.85 + 0.15 * Math.sin(t * 6);
    setArrow(arT1, R, toS(R, 0.9e9 * tugOn * pul), arR, tugOn, z);
    setArrow(arT2, R.clone().add(V(0, 0, 0.32e9)), toS(R.clone().add(V(0, 0, 0.32e9)), 0.6e9 * tugOn * pul), arR * 0.7, tugOn * 0.6, z);
    setArrow(arT3, R.clone().add(V(0, 0, -0.32e9)), toS(R.clone().add(V(0, 0, -0.32e9)), 0.6e9 * tugOn * pul), arR * 0.7, tugOn * 0.6, z);
    setArrow(arTE, R, toE(R, 0.22e9 * tugOn * (1 - ramp(t, A("s7:lepas"), A("s7:lepas") + 1.5))), arR * 0.8, tugOn, z);

    const cR = V().setFromMatrixColumn(cam.matrixWorld, 0), cU = V().setFromMatrixColumn(cam.matrixWorld, 1);
    // rock dot + tags
    const rp = z.R(R);
    const swapFade = 1 - (ramp(t, tSwap - 0.5, tSwap) - ramp(t, tSwap, tSwap + 0.6));
    const rockOrb = ramp(e, 3.2, 4.2) * swapFade;
    rockDot.visible = rockOrb > 0.01; rockDot.position.copy(rp); rockDot.material.opacity = rockOrb;
    const dsz = (28 / H) * 2 * TANH; rockDot.scale.set(dsz, dsz, 1);
    const showTag = (s, pos, op) => { s.visible = op > 0.01; if (s.visible) { s.position.copy(pos); s.material.opacity = op; } };
    showTag(T.rock, rp, rockOrb * (t < A("s2:Teleskop") || t > A("s3:Matahari") ? 1 : 0.0) * (1 - quasiOn));
    const epx = pxOf(er, 0);
    const notLab = 1 - ramp(-e, -4, -3.2);
    showTag(T.earth, ep.clone().add(V(er * 1.1, -er * 0.3, 0)), ramp(t, 0.6, 1.4) * (epx < 60 ? 1 : 0) * ramp(e, 8.5, 9) * notLab);
    showTag(T.moon, z.R(mp), ramp(e, 7.6, 8.2) * (1 - ramp(e, 10, 10.6)) * (t < A("s2:Teleskop") ? 1 : 0));
    showTag(T.sun, spr, ramp(e, 10.2, 10.8) * (t > A("s3") && t < A("s4") ? 1 : 0));
    showTag(T.hill, ep.clone().add(cR.clone().multiplyScalar(-0.62 * hr).addScaledVector(cU, 0.8 * hr)), hillOn * ramp(t, A("s4:Hill"), A("s4:Hill") + 0.5) * (1 - quasiOn) * (1 - ramp(e, 10.6, 11)));
    showTag(T.hillR, ep.clone().add(V(0.9, 0, 0.44).normalize().multiplyScalar(RHILL * 0.9 / Sv)), hillRon * ramp(t, A("s4:juta") - 0.3, A("s4:juta") + 0.3));
    showTag(T.closeR, ep.clone().add(pClose.clone().multiplyScalar(0.55 / Sv)), closeOn);
    showTag(T.eorb, z.R(V(-AU + AU * Math.cos(0.7), 0, AU * Math.sin(0.7))), helioOp * ramp(t, A("s3:Matahari"), A("s3:Matahari") + 0.6));
    showTag(T.rorb, z.R(V(-AU + (AU - LANE) * Math.cos(-0.9), 0, (AU - LANE) * Math.sin(-0.9))), helioOp * ramp(t, A("s3:Matahari") + 0.6, A("s3:Matahari") + 1.2));
    const kph = 0.35 + (t - A("s6:Pengiring")) * 0.25, kp = V(Math.cos(kph) * 2.3e10, 0, Math.sin(kph) * 1.25e10);
    kamoDot.visible = quasiOn > 0.01; kamoDot.position.copy(z.R(kp)); kamoDot.material.opacity = quasiOn; kamoDot.scale.set(dsz, dsz, 1);
    showTag(T.kamo, z.R(kp), quasiOn);
    showTag(T.tarikE, z.R(pA.clone().add(V(0, 0, 0.25e9))), arOn); showTag(T.tarikS, z.R(pB.clone().add(V(0.5e9, 0, -0.25e9))), arOn);

    // dome station
    const dOn = domeW > 0.01 && e < 4.6;
    dome.visible = dOn; if (dOn) { dome.position.copy(z.R(V(0, RE * BE, 0))); dome.scale.setScalar(1 / Sv); }
    lamp.intensity = dOn ? 0.9 * (1 - ramp(e, 2.5, 4)) : 0;
    lamp.position.copy(z.R(V(0, RE * BE + 5.5, 0)));
    showTag(T.dome, z.R(V(0, RE * BE + 7.5, 0)), domeW * ramp(t, A("s2:Hungaria") - 0.3, A("s2:Hungaria") + 0.3) * (1 - ramp(e, 3, 4)));
    beam.material.opacity = 0.42 * ramp(t, A("s2:menemukannya"), A("s2:menemukannya") + 0.6);

    // studio station
    const lOn = e < 6.5 && domeW < 0.5;
    lab.visible = lOn;
    const s6a = A("s6:Astronom"), pushS = ramp(t, A("s6:mendorong"), A("s6:Dorongan") + 0.2), pushR = ramp(t, A("s6:Dorongan"), A("s6:kecil") + 0.8);
    const testOn = ramp(t, s6a, s6a + 0.8) * (1 - ramp(t, A("s6:Pengiring"), A("s6:Pengiring") + 0.6));
    const sizeOn = ramp(t, A("s2:Ukurannya"), A("s2:meter")) * (1 - ramp(t, A("s3:Matahari") - 1.5, A("s3:Matahari") - 0.8));
    if (lOn) {
      lab.position.copy(z.R(L)); lab.scale.setScalar(1 / Sv);
      floorMat.opacity = studio; strip.material.opacity = studio; strip.material.transparent = true;
      rock.rotation.set(0.25 + Math.sin(t * 0.13) * 0.08, t * 0.09, 0.12);
      const rx = 0.3 * eout(pushR) * testOn;
      rock.position.set(rx, 0, 0); rockShadow.position.x = rx;
      person.visible = sizeOn > 0.01; personShadow.visible = person.visible;
      post.visible = sizeOn > 0.01 || testOn > 0.01; bracket.visible = sizeOn > 0.3;
      bracket.scale.x = eout(ramp(t, A("s2:satu"), A("s2:meter") + 0.3)) || 0.001;
      stage.visible = testOn > 0.01;
      const sx = -3.6 + 3.0 * eout(pushS);
      stage.position.set(sx, 0.35, -3.0); stage.rotation.set(Math.PI / 2, 0, 0.55);
      trailS.visible = testOn > 0.01 && pushS > 0.02; trailS.scale.x = Math.max(0.001, 3.0 * eout(pushS)); trailS.position.set(-3.6 + 1.5 * eout(pushS), FLOOR + 0.02, -3.0);
      trailR.visible = testOn > 0.01 && pushR > 0.02; trailR.scale.x = Math.max(0.001, rx); trailR.position.set(rx / 2, FLOOR + 0.02, 0);
      const rayOn = testOn * ramp(t, A("s6:Cahaya") - 0.2, A("s6:Cahaya") + 0.5);
      for (const m of sunRays) { const k = (t * 0.55 + m.userData.ph) % 1; m.visible = rayOn > 0.01; m.position.set(-9 + k * 9.5, m.userData.y, m.userData.z); m.material.opacity = rayOn * Math.sin(k * Math.PI) * 0.75; }
    } else { for (const m of sunRays) m.visible = false; }
    const lr = (p) => z.R(L.clone().add(p));
    showTag(T.size, lr(V(-0.05, 1.12, 0.1)), lOn ? sizeOn * ramp(t, A("s2:satu"), A("s2:meter")) * studio : 0);
    showTag(T.man, lr(V(1.42, FLOOR + 1.95, 0.3)), lOn ? sizeOn * ramp(t, A("s2:setinggi") - 0.2, A("s2:manusia")) * studio : 0);
    showTag(T.stage, lr(V(-3.6 + 3.0 * eout(pushS) - 0.9, 1.75, -3.0)), lOn ? testOn * ramp(t, A("s6:roket") - 0.2, A("s6:roket") + 0.4) * studio : 0);
    showTag(T.rocklab, lr(V(0.3 * eout(pushR) + 0.75, 0.2, 0.5)), lOn ? testOn * ramp(t, A("s6:Dorongan"), A("s6:Dorongan") + 0.5) * studio : 0);
    showTag(T.light, lr(V(-5.6, 1.6, -0.6)), lOn ? testOn * ramp(t, A("s6:Cahaya"), A("s6:Cahaya") + 0.5) * studio : 0);

    // gauge: frame height exponent
    const eh = e + Math.log10(2 * D * TANH);
    if (gdot) gdot.style.transform = `translateY(${(1 - clamp01(eh / 13)) * 820}px)`;
    if (gval) gval.innerHTML = `10<sup>${eh.toFixed(1).replace(".", ",")}</sup> m`;

    comp.render();
  };
}
