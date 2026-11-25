// EP28 MOTOR RADAR. TOONFORGE look: cel-shaded anime road movie. A generic adventure motorcycle (no maker badge, no
// livery) with a helmeted rider cruises a bright anime highway; every hero prop is MeshToon (3-band ramp) with an
// inverted-hull ink contour. Two radar "eyes" (front cyan, rear sakura pink) project translucent striped cones, and the
// road carries a wave layer: outgoing ring packets leave the radar, echo packets return from the car (squeezed and
// red-shifted to hot colours when the car closes in = Doppler). Impact frames (inverted ink/paper posterise + radial
// speed lines) hit when the hero echo returns, on the "bukan pertama" twist and on "tidak mengerem sendiri".
// Bike stays at the origin facing +x; the world scrolls by D(t) = integral of the speed profile (table built once).
// Every value is a pure function of t (seeded PRNG only, no accumulated state).
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { ShaderPass } from "./ShaderPass.js";
import { OutputPass } from "./OutputPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, ramp, clamp01, canvasTex, track, back } from "./lib3d.js";

const W = 1080, H = 1920;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerp = THREE.MathUtils.lerp;
const win = (t, a, b, fi = 0.3, fo = 0.3) => ramp(t, a - fi, a + fi) * (1 - ramp(t, b - fo, b + fo));
const P = {
  ink: "#111116", white: "#ffffff", orange: "#ff9f1c", cyan: "#45b6fe", pink: "#ff7597", red: "#e63946",
  sky: "#3a86ff", dusk: "#1f1d36", road: "#3d4466", grass: "#79d36b", yellow: "#ffd23f", purple: "#8f7cf0",
};

// ---------- toon materials + ink hulls ----------
const RAMP = (() => { const d = new Uint8Array([70, 150, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (c, extra = {}) => new THREE.MeshToonMaterial({ color: c, gradientMap: RAMP, ...extra });
const INK = new THREE.MeshBasicMaterial({ color: P.ink, side: THREE.BackSide });
function rbox(w, h, d, r, seg = 3) {
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
  s.moveTo(x, y - r); s.lineTo(x + ww, y - r); s.quadraticCurveTo(x + ww + r, y - r, x + ww + r, y);
  s.lineTo(x + ww + r, y + hh); s.quadraticCurveTo(x + ww + r, y + hh + r, x + ww, y + hh + r);
  s.lineTo(x, y + hh + r); s.quadraticCurveTo(x - r, y + hh + r, x - r, y + hh); s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelSize: r * 0.98, bevelThickness: r, bevelSegments: seg, curveSegments: 5 });
  g.translate(0, 0, -(d - 2 * r) / 2); g.computeVertexNormals();
  return g;
}
// mesh + inverted hull scaled so the ink line is ~t thick on every axis
function inked(geo, mat, t, parent, pos, rot, noInk) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; g.add(m);
  if (!noInk) {
    geo.computeBoundingBox();
    const bb = geo.boundingBox, sz = bb.getSize(v3(0, 0, 0)), c = bb.getCenter(v3(0, 0, 0));
    const s = v3((sz.x + 2 * t) / Math.max(sz.x, 0.02), (sz.y + 2 * t) / Math.max(sz.y, 0.02), (sz.z + 2 * t) / Math.max(sz.z, 0.02));
    const hl = new THREE.Mesh(geo, INK); hl.scale.copy(s); hl.position.set(c.x * (1 - s.x), c.y * (1 - s.y), c.z * (1 - s.z));
    g.add(hl);
  }
  if (pos) g.position.copy(pos);
  if (rot) g.rotation.set(rot[0], rot[1], rot[2]);
  if (parent) parent.add(g);
  g.userData.mesh = m;
  return g;
}
const sph = (r) => new THREE.SphereGeometry(r, 20, 14);
function cylZ(r, len, seg = 20) { const g = new THREE.CylinderGeometry(r, r, len, seg); g.rotateX(Math.PI / 2); return g; }
function cylX(r, len, seg = 20) { const g = new THREE.CylinderGeometry(r, r, len, seg); g.rotateZ(Math.PI / 2); return g; }
// a limb segment from a to b: unit cylinder + hull, oriented per call
const UP = v3(0, 1, 0);
function limb(parent, r, mat, inkT = 0.02) {
  const g = new THREE.Group();
  const geo = new THREE.CylinderGeometry(r, r * 0.92, 1, 16); geo.translate(0, 0.5, 0);
  const hgeo = new THREE.CylinderGeometry(r + inkT, r * 0.92 + inkT, 1, 16); hgeo.translate(0, 0.5, 0);
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; g.add(m);
  g.add(new THREE.Mesh(hgeo, INK));
  parent.add(g);
  const d = v3(0, 0, 0);
  g.set = (a, b) => { d.subVectors(b, a); const L = d.length(); g.position.copy(a); g.quaternion.setFromUnitVectors(UP, d.normalize()); g.scale.set(1, Math.max(0.001, L), 1); };
  return g;
}
function mono(keys) {
  const n = keys.length, xs = keys.map((k) => k[0]), ys = keys.map((k) => k[1]);
  const d = [], m = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / Math.max(1e-4, xs[i + 1] - xs[i]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  return (t) => {
    if (t <= xs[0]) return ys[0];
    if (t >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (xs[i + 1] < t) i++;
    const h = xs[i + 1] - xs[i], u = (t - xs[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1];
  };
}
// keys must be strictly increasing in time; drop any that collide after the estimated timeline shifts
const sortK = (keys) => { const o = []; for (const k of keys) { if (o.length && k[0] <= o[o.length - 1][0] + 0.05) continue; o.push(k); } return o; };

// ---------- textures ----------
function labelTex(txt, bg, fg, w = 512, h = 160, font = 88) {
  return canvasTex(w, h, (c) => {
    c.save(); c.transform(1, 0, -0.18, 1, 0, 0);
    c.fillStyle = P.ink; c.fillRect(30, 18, w - 40, h - 24);
    c.fillStyle = bg; c.fillRect(20, 8, w - 46, h - 30);
    c.restore();
    c.font = `italic 900 ${font}px "Arial Black", Impact, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillStyle = fg; c.fillText(txt, w / 2 - 4, h / 2 - 6);
  });
}
function sprite(tex, w, h, order = 30) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, toneMapped: false }));
  sp.scale.set(w, h, 1); sp.renderOrder = order; sp.userData.w = w; sp.userData.h = h; return sp;
}
function signTex(lines, bg, fg, accent) {
  return canvasTex(1024, 512, (c, w, h) => {
    c.fillStyle = P.ink; c.fillRect(0, 0, w, h);
    c.fillStyle = bg; c.fillRect(18, 18, w - 36, h - 36);
    c.fillStyle = accent; c.fillRect(18, h - 92, w - 36, 74);
    c.textAlign = "center"; c.textBaseline = "middle";
    lines.forEach(([txt, size, col], i) => { c.font = `italic 900 ${size}px "Arial Black", Impact, sans-serif`; c.fillStyle = col || fg; c.fillText(txt, w / 2, 120 + i * 150); });
  });
}
function dashTex(warn, k) {
  return canvasTex(512, 320, (c, w, h) => {
    c.fillStyle = "#0b1022"; c.fillRect(0, 0, w, h);
    c.strokeStyle = "#45b6fe"; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16);
    if (!warn) {
      // radar status: bike icon with two arcs
      c.fillStyle = "#ffffff"; c.fillRect(w / 2 - 14, 120, 28, 90);
      c.strokeStyle = "#45b6fe"; c.lineWidth = 10;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(w / 2, 120, 30 + i * 26, -Math.PI * 0.75, -Math.PI * 0.25); c.stroke(); }
      c.strokeStyle = "#ff7597";
      for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(w / 2, 210, 30 + i * 26, Math.PI * 0.25, Math.PI * 0.75); c.stroke(); }
      c.font = 'bold 30px "Arial Black", sans-serif'; c.fillStyle = "#9fd8ff"; c.textAlign = "left"; c.fillText("RADAR ON", 24, 52);
      c.textAlign = "right"; c.fillStyle = "#ffd23f"; c.fillText("AUDIRA", w - 24, 52);
    } else {
      c.fillStyle = k ? "#e63946" : "#3a0a12"; c.fillRect(16, 16, w - 32, h - 32);
      c.beginPath(); c.moveTo(w / 2, 50); c.lineTo(w / 2 + 120, 260); c.lineTo(w / 2 - 120, 260); c.closePath();
      c.fillStyle = "#ffd23f"; c.fill(); c.lineWidth = 12; c.strokeStyle = P.ink; c.lineJoin = "round"; c.stroke();
      c.font = '900 150px "Arial Black", Impact'; c.textAlign = "center"; c.fillStyle = P.ink; c.fillText("!", w / 2, 240);
    }
  });
}

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFShadowMap;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.1, 2000);
  const s = K;
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const E = {
    melihat: A_("s1:melihat", 0.5), macet: A_("s1:macet", 3.6), pertama: A_("s1:pertama", 7),
    eicma: A_("s2:EICMA", s.s2 + 1.5), ducati: A_("s2:Ducati", s.s2 + 5), africa: A_("s2:Africa", s.s2 + 9),
    matanya: A_("s3:Matanya", s.s3), menembak: A_("s3:menembakkan", s.s3 + 4), lima: A_("s3:lima", s.s3 + 7.5), gema: A_("s3:gema", s.s3 + 9.5), sepertiga: A_("s3:sepertiga", s.s3 + 11), situ: A_("s3:situ", s.s3 + 13.5),
    melambat: A_("s4:melambat", s.s4 + 1), terjepit: A_("s4:terjepit", s.s4 + 2.5), sirene: A_("s4:sirene", s.s4 + 5.5), selisih: A_("s4:selisih", s.s4 + 8),
    cruise: A_("s5:cruise", s.s5 + 1.5), radarB: A_("s5:Radar", s.s5 + 4), spion: A_("s5:spion", s.s5 + 5.5), titik: A_("s5:titik", s.s5 + 7), kedip: A_("s5:mengedipkan", s.s5 + 8.5), pengemudi: A_("s5:pengemudi", s.s5 + 10),
    kenapa: A_("s6:kenapa", s.s6 + 0.3), macet6: A_("s6:macet", s.s6 + 2), berhenti: A_("s6:berhenti", s.s6 + 5), transmisi: A_("s6:Transmisi", s.s6 + 5.8), melepas: A_("s6:melepas", s.s6 + 7), tuas: A_("s6:tuas", s.s6 + 8.5), jalan: A_("s6:jalan", s.s6 + 9.5), perintah: A_("s6:perintah", s.s6 + 11),
    bahaya: A_("s7:bahaya", s.s7 + 0.4), layar: A_("s7:layar", s.s7 + 1.4), mengerem: A_("s7:mengerem", s.s7 + 3.6), menambah: A_("s7:menambah", s.s7 + 5), tapi: A_("s7:Tapi", s.s7 + 6.5), sendiri: A_("s7:sendiri", s.s7 + 8.5),
    batas: A_("s8:Kemampuannya", s.s8), menyetir: A_("s8:menyetir", s.s8 + 3.5), ikuti: A_("s8:Ikuti", s.s8 + 5),
  };

  const S = new THREE.Scene();
  S.background = new THREE.Color("#8ccaff");
  S.add(cam);
  const pm = new THREE.PMREMGenerator(r);
  const envTex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  pm.dispose();
  const metal = (c, rough = 0.28) => new THREE.MeshStandardMaterial({ color: c, metalness: 1, roughness: rough, envMap: envTex, envMapIntensity: 0.55 });

  // ---------- lights: hard anime sun + saturated sky/ground fill ----------
  S.add(new THREE.HemisphereLight("#bfe3ff", "#7a5fb0", 1.05));
  const sun = new THREE.DirectionalLight("#fff3dc", 2.6);
  sun.position.set(14, 22, 16); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 80 });
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
  S.add(sun); S.add(sun.target);
  const rim = new THREE.DirectionalLight("#ffd0e8", 0.7); rim.position.set(-12, 6, -10); S.add(rim);

  // ---------- sky dome: anime gradient + painted cumulus ----------
  const skyTex = canvasTex(64, 1024, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#1f5fe0"); g.addColorStop(0.3, "#3a86ff"); g.addColorStop(0.46, "#9fd2ff"); g.addColorStop(0.5, "#fff1dc"); g.addColorStop(0.52, "#b9d8ff"); g.addColorStop(1, "#6f86c9");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, depthWrite: false, fog: false }));
  sky.renderOrder = -10; S.add(sky);
  const cloudTex = (seed) => canvasTex(512, 320, (c, w, h) => {
    const R = mulberry(seed); const blobs = [];
    for (let i = 0; i < 9; i++) blobs.push([90 + R() * 330, 150 + R() * 90 - i * 4, 55 + R() * 70]);
    blobs.push([256, 120, 110]);
    c.fillStyle = P.ink; blobs.forEach(([x, y, rr]) => { c.beginPath(); c.arc(x, y, rr + 7, 0, 6.283); c.fill(); });
    c.fillStyle = "#b9c6f2"; blobs.forEach(([x, y, rr]) => { c.beginPath(); c.arc(x, y, rr, 0, 6.283); c.fill(); });
    c.fillStyle = "#ffffff"; blobs.forEach(([x, y, rr]) => { c.beginPath(); c.arc(x - rr * 0.12, y - rr * 0.18, rr * 0.86, 0, 6.283); c.fill(); });
    c.globalCompositeOperation = "destination-in"; const fg = c.createLinearGradient(0, 0, 0, h); fg.addColorStop(0, "#000"); fg.addColorStop(0.82, "#000"); fg.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = fg; c.fillRect(0, 0, w, h);
  });
  const clouds = [];
  const CR = mulberry(28);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + CR() * 0.3, d = 420 + CR() * 200;
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cloudTex(i * 13 + 3), transparent: true, depthWrite: false, fog: false }));
    const sc = 140 + CR() * 120; sp.scale.set(sc, sc * 0.62, 1);
    sp.userData = { a, d, y: 40 + CR() * 90 };
    sp.renderOrder = -9; S.add(sp); clouds.push(sp);
  }
  // distant mountain ranges (flat ink-edged layers)
  const mtn = new THREE.Group(); S.add(mtn);
  [[520, "#7c8fd6", 90, 3], [430, "#a3b3ec", 60, 7]].forEach(([rad, col, hgt, sd]) => {
    const R = mulberry(sd);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2, sh = new THREE.Shape(), wdt = 150 + R() * 120, hh = hgt * (0.6 + R() * 0.7);
      sh.moveTo(-wdt, 0); sh.quadraticCurveTo(-wdt * 0.3, hh * 0.9, 0, hh); sh.quadraticCurveTo(wdt * 0.35, hh * 0.85, wdt, 0); sh.lineTo(-wdt, 0);
      const m = new THREE.Mesh(new THREE.ShapeGeometry(sh, 8), new THREE.MeshBasicMaterial({ color: col, fog: false }));
      const ol = new THREE.Mesh(new THREE.ShapeGeometry(sh, 8), new THREE.MeshBasicMaterial({ color: P.ink, fog: false }));
      ol.scale.set(1.012, 1.03, 1); ol.position.z = -0.5;
      const g = new THREE.Group(); g.add(ol, m);
      g.position.set(Math.cos(a) * rad, -6, Math.sin(a) * rad); g.lookAt(0, -6, 0);
      mtn.add(g);
    }
  });
  S.fog = new THREE.Fog("#b9d8ff", 90, 330);

  // ---------- ground + road ----------
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), toon(P.grass)); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; ground.receiveShadow = true; S.add(ground);
  const ROAD_Z0 = -5.6, ROAD_Z1 = 1.9;
  const road = new THREE.Mesh(new THREE.PlaneGeometry(900, ROAD_Z1 - ROAD_Z0), toon(P.road)); road.rotation.x = -Math.PI / 2; road.position.set(0, 0, (ROAD_Z0 + ROAD_Z1) / 2); road.receiveShadow = true; S.add(road);
  const curbM = toon("#f2f2f8");
  for (const z of [ROAD_Z0 - 0.15, ROAD_Z1 + 0.15]) { const c = new THREE.Mesh(new THREE.BoxGeometry(900, 0.12, 0.3), curbM); c.position.set(0, 0.04, z); c.receiveShadow = true; S.add(c); }
  const lineM = new THREE.MeshBasicMaterial({ color: "#f4f6ff" });
  for (const z of [ROAD_Z0 + 0.25, ROAD_Z1 - 0.25]) { const l = new THREE.Mesh(new THREE.PlaneGeometry(900, 0.14), lineM); l.rotation.x = -Math.PI / 2; l.position.set(0, 0.012, z); S.add(l); }
  const NDASH = 40, DASH_SP = 6;
  const dashes = new THREE.InstancedMesh(new THREE.PlaneGeometry(3, 0.16).rotateX(-Math.PI / 2), lineM, NDASH);
  dashes.frustumCulled = false; S.add(dashes);
  const dm = new THREE.Object3D();

  // ---------- roadside props (scroll with D) ----------
  const props = [];
  const PR = mulberry(2828);
  const trunkM = toon("#8a5a3c"), leafA = toon("#3fbf6a"), leafB = toon("#2a9d8f"), leafC = toon("#9bdc5a");
  const LOOP = 160;
  for (let i = 0; i < 34; i++) {
    const side = i % 2 ? 1 : -1, g = new THREE.Group();
    const h = 2.2 + PR() * 1.8;
    inked(new THREE.CylinderGeometry(0.13, 0.18, h, 10).translate(0, h / 2, 0), trunkM, 0.04, g);
    const lm = [leafA, leafB, leafC][i % 3];
    for (let k = 0; k < 3; k++) inked(new THREE.IcosahedronGeometry(0.9 + PR() * 0.5, 1), lm, 0.06, g, v3((PR() - 0.5) * 0.8, h + 0.4 + k * 0.55, (PR() - 0.5) * 0.8));
    const sc = 0.9 + PR() * 0.6; g.scale.setScalar(sc);
    S.add(g); props.push({ g, x0: (i / 34) * LOOP + PR() * 3, z: side > 0 ? ROAD_Z1 + 3.5 + PR() * 9 : ROAD_Z0 - 3.5 - PR() * 9 });
  }
  // street lamps on the far side
  const poleM = toon("#e8ecff");
  for (let i = 0; i < 6; i++) {
    const g = new THREE.Group();
    inked(new THREE.CylinderGeometry(0.08, 0.1, 6, 10).translate(0, 3, 0), poleM, 0.035, g);
    inked(rbox(1.6, 0.12, 0.14, 0.05), poleM, 0.035, g, v3(0.0, 6, 0.7), [0, Math.PI / 2, 0]);
    inked(rbox(0.5, 0.12, 0.26, 0.05), toon("#fff6c8", { emissive: "#fff2a8", emissiveIntensity: 0.6 }), 0.03, g, v3(0, 5.92, 1.4));
    S.add(g); props.push({ g, x0: i * (LOOP / 6) + 7, z: ROAD_Z0 - 1.3 });
  }
  // AUDIRA billboard (in-world brand), repeats with the loop
  const boardTex = signTex([["AUDIRA", 190, "#ffffff"], ["CARA KERJA VIRAL", 64, P.yellow]], "#1f1d36", "#fff", P.cyan);
  const board = new THREE.Group();
  inked(new THREE.CylinderGeometry(0.16, 0.16, 5, 10).translate(0, 2.5, 0), poleM, 0.04, board, v3(-1.8, 0, 0));
  inked(new THREE.CylinderGeometry(0.16, 0.16, 5, 10).translate(0, 2.5, 0), poleM, 0.04, board, v3(1.8, 0, 0));
  inked(rbox(6.4, 3.3, 0.3, 0.1), toon("#1f1d36"), 0.06, board, v3(0, 6, 0));
  const bf = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 3.0), new THREE.MeshBasicMaterial({ map: boardTex, toneMapped: false })); bf.position.set(0, 6, 0.17); board.add(bf);
  board.rotation.y = 0.35;
  S.add(board); props.push({ g: board, x0: 40, z: ROAD_Z0 - 6.5 });

  // one-shot milestone signs for the news beat (placed so they pass the camera on their words)
  const mkSign = (lines, bg, acc) => {
    const g = new THREE.Group();
    inked(new THREE.CylinderGeometry(0.12, 0.12, 3.4, 10).translate(0, 1.7, 0), poleM, 0.04, g, v3(-1.3, 0, 0));
    inked(new THREE.CylinderGeometry(0.12, 0.12, 3.4, 10).translate(0, 1.7, 0), poleM, 0.04, g, v3(1.3, 0, 0));
    inked(rbox(4.2, 2.2, 0.2, 0.08), toon(P.ink), 0.05, g, v3(0, 4.2, 0));
    const f = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.0), new THREE.MeshBasicMaterial({ map: signTex(lines, bg, P.ink, acc), toneMapped: false })); f.position.set(0, 4.2, 0.11); g.add(f);
    g.rotation.y = 0.25; S.add(g); return g;
  };
  const signA = mkSign([["EICMA", 170, P.ink], ["MILAN · 3 NOV", 80, P.ink]], P.yellow, P.pink);
  const signB = mkSign([["2020", 200, "#ffffff"], ["RADAR DEPAN-BELAKANG", 56, "#ffffff"]], P.red, P.ink);

  // ---------- the motorcycle (generic adventure bike, faces +x) ----------
  const bike = new THREE.Group(); S.add(bike);
  const BM = {
    white: toon("#f7f7fb"), orange: toon(P.orange), cyan: toon(P.cyan), dark: toon("#2b2d3a"), seat: toon("#1c1d26"),
    tire: toon("#24252e"), gold: metal("#d8a640", 0.32), steel: metal("#c9ced8", 0.22), grey: toon("#6b7184"),
  };
  const F = v3(0.84, 0.46, 0), R = v3(-0.8, 0.44, 0);
  const mkWheel = (c, rad, wide) => {
    const g = new THREE.Group(); g.position.copy(c);
    const spin = new THREE.Group(); g.add(spin);
    inked(new THREE.TorusGeometry(rad, wide, 12, 40), BM.tire, 0.022, spin);
    inked(new THREE.TorusGeometry(rad - wide - 0.02, 0.022, 8, 40), BM.gold, 0.012, spin);
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, rad - wide - 0.06, 4), BM.steel); sp.position.set(Math.cos(a) * (rad - wide) * 0.48, Math.sin(a) * (rad - wide) * 0.48, (i % 2 ? 0.02 : -0.02)); sp.rotation.z = a - Math.PI / 2; spin.add(sp); }
    inked(cylZ(0.06, 0.2), BM.grey, 0.015, spin);
    bike.add(g); return spin;
  };
  const wF = mkWheel(F, 0.44, 0.07), wR = mkWheel(R, 0.41, 0.085);
  // front brake disc + caliper (glows when brake assist adds pressure)
  const disc = new THREE.Mesh(cylZ(0.17, 0.012, 28), BM.steel); disc.position.set(F.x, F.y, 0.1); bike.add(disc);
  const calM = toon(P.red, { emissive: "#ff2a2a", emissiveIntensity: 0 });
  inked(rbox(0.12, 0.09, 0.05, 0.02), calM, 0.012, bike, v3(F.x - 0.1, F.y + 0.11, 0.13));
  // fork
  const head = v3(0.56, 1.2, 0);
  for (const z of [-0.11, 0.11]) {
    const a = v3(F.x, F.y, z), b = v3(head.x, head.y, z), mid = a.clone().lerp(b, 0.5);
    const up = limb(bike, 0.032, BM.gold, 0.012); up.set(a, mid);
    const lo = limb(bike, 0.026, BM.steel, 0.012); lo.set(mid, b);
  }
  // swingarm, engine, skid plate, exhaust
  for (const z of [-0.13, 0.13]) { const sa = limb(bike, 0.04, BM.grey, 0.015); sa.set(v3(R.x, R.y, z), v3(-0.05, 0.56, z)); }
  inked(rbox(0.62, 0.44, 0.42, 0.09), BM.dark, 0.022, bike, v3(0.05, 0.64, 0));
  inked(rbox(0.3, 0.26, 0.5, 0.07), BM.steel, 0.02, bike, v3(0.26, 0.84, 0), [0, 0, -0.35]);
  inked(rbox(0.64, 0.06, 0.38, 0.025), BM.steel, 0.015, bike, v3(0.08, 0.38, 0), [0, 0, 0.08]);
  inked(cylX(0.075, 0.5), BM.steel, 0.018, bike, v3(-0.66, 0.76, 0.24), [0, 0, 0.18]);
  inked(cylX(0.05, 0.05), BM.dark, 0.012, bike, v3(-0.93, 0.81, 0.24), [0, 0, 0.18]);
  // DCT clutch cover bump (right side)
  inked(cylZ(0.13, 0.08), BM.grey, 0.015, bike, v3(0.02, 0.62, 0.24));
  // tank, shrouds, seat, tail
  inked(rbox(0.66, 0.4, 0.56, 0.17), BM.white, 0.024, bike, v3(0.18, 1.12, 0), [0, 0, -0.08]);
  for (const z of [-0.3, 0.3]) {
    inked(rbox(0.5, 0.3, 0.05, 0.02), BM.orange, 0.015, bike, v3(0.3, 0.98, z), [0, 0, -0.25]);
    inked(rbox(0.4, 0.06, 0.03, 0.012), BM.cyan, 0.01, bike, v3(0.26, 1.09, z * 1.06), [0, 0, -0.25]);
  }
  inked(rbox(0.74, 0.12, 0.34, 0.055), BM.seat, 0.02, bike, v3(-0.36, 1.04, 0), [0, 0, 0.05]);
  inked(rbox(0.52, 0.16, 0.26, 0.07), BM.white, 0.02, bike, v3(-0.8, 1.1, 0), [0, 0, 0.12]);
  inked(rbox(0.04, 0.07, 0.16, 0.015), toon("#ff3344", { emissive: "#ff2030", emissiveIntensity: 1.6 }), 0.01, bike, v3(-1.07, 1.14, 0));
  // high front beak, fairing, headlights, windscreen
  inked(rbox(0.52, 0.06, 0.2, 0.025), BM.white, 0.015, bike, v3(0.86, 1.02, 0), [0, 0, -0.22]);
  inked(rbox(0.38, 0.44, 0.44, 0.1), BM.white, 0.022, bike, v3(0.62, 1.26, 0), [0, 0, -0.25]);
  for (const z of [-0.09, 0.09]) inked(rbox(0.05, 0.08, 0.12, 0.02), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 3.2, 3.6) }), 0.01, bike, v3(0.82, 1.22, z), [0, 0, -0.25]);
  const scr = new THREE.Mesh(rbox(0.04, 0.5, 0.4, 0.018), new THREE.MeshToonMaterial({ color: "#a8e0ff", gradientMap: RAMP, transparent: true, opacity: 0.55 }));
  scr.position.set(0.56, 1.63, 0); scr.rotation.z = -0.38; bike.add(scr);
  // radar units: front under the headlights, rear under the tail light
  const radF = new THREE.Group(); bike.add(radF); radF.position.set(0.86, 0.97, 0); radF.scale.setScalar(2.1); radF.position.x = 0.93;
  inked(rbox(0.06, 0.12, 0.17, 0.025), BM.dark, 0.012, radF);
  const radFg = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.07), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 2.2, 3.4) })); radFg.position.x = 0.032; radFg.rotation.y = Math.PI / 2; radF.add(radFg);
  const radB = new THREE.Group(); bike.add(radB); radB.position.set(-1.03, 0.95, 0); radB.scale.setScalar(1.5);
  inked(rbox(0.06, 0.11, 0.16, 0.025), BM.dark, 0.012, radB);
  const radBg = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.06), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.4, 0.9, 1.6) })); radBg.position.x = -0.032; radBg.rotation.y = -Math.PI / 2; radB.add(radBg);
  const RADF = v3(0.9, 0.97, 0), RADB = v3(-1.06, 0.95, 0);
  // indicators (blink)
  const indM = new THREE.MeshBasicMaterial({ color: "#ff9f1c" });
  const indOn = new THREE.Color(4, 2.1, 0.3), indOff = new THREE.Color("#a35a08");
  const inds = [];
  for (const [x, y, z] of [[-1.0, 1.02, -0.17], [-1.0, 1.02, 0.17], [0.66, 1.16, -0.25], [0.66, 1.16, 0.25]]) { const m = inked(sph(0.03), indM, 0.01, bike, v3(x, y, z)); inds.push(m); }
  // handlebar, grips, mirrors with blind-spot lamps, dash
  const bar = limb(bike, 0.018, BM.dark, 0.01); bar.set(v3(0.48, 1.38, -0.42), v3(0.48, 1.38, 0.42));
  for (const z of [-0.36, 0.36]) inked(cylZ(0.026, 0.12), BM.seat, 0.01, bike, v3(0.48, 1.38, z));
  const mirLamp = [];
  for (const z of [-1, 1]) {
    const st = limb(bike, 0.011, BM.dark, 0.008); st.set(v3(0.5, 1.4, z * 0.3), v3(0.48, 1.64, z * 0.37));
    inked(rbox(0.05, 0.11, 0.17, 0.03), BM.dark, 0.012, bike, v3(0.48, 1.67, z * 0.4));
    const lm = new THREE.MeshBasicMaterial({ color: "#5a3a10" });
    const l = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.035), lm); l.position.set(0.452, 1.69, z * 0.43); l.rotation.y = -Math.PI / 2; bike.add(l);
    mirLamp.push(lm);
  }
  // ghost clutch lever (only shown to say "no lever"), left grip; resume button on the left switch block
  const ghostM = new THREE.MeshBasicMaterial({ color: "#9fd8ff", transparent: true, opacity: 0, depthWrite: false });
  const ghost = new THREE.Mesh(rbox(0.04, 0.02, 0.22, 0.008), ghostM); ghost.position.set(0.56, 1.39, -0.36); ghost.rotation.y = 0.25; bike.add(ghost);
  inked(rbox(0.05, 0.05, 0.05, 0.012), BM.seat, 0.008, bike, v3(0.47, 1.41, -0.27));
  const btnM = new THREE.MeshBasicMaterial({ color: "#2a5a7a" });
  const btn = new THREE.Mesh(sph(0.014), btnM); btn.position.set(0.44, 1.42, -0.27); bike.add(btn);
  const dashGeo = new THREE.PlaneGeometry(0.24, 0.15);
  const dashOK = dashTex(false), dashW1 = dashTex(true, 1), dashW0 = dashTex(true, 0);
  const dashMat = new THREE.MeshBasicMaterial({ map: dashOK, toneMapped: false });
  const dash = new THREE.Mesh(dashGeo, dashMat); dash.position.set(0.47, 1.52, 0); dash.rotation.set(0, -Math.PI / 2, 0); dash.rotateX(-0.55); bike.add(dash);
  inked(rbox(0.05, 0.19, 0.28, 0.02), BM.dark, 0.012, bike, v3(0.5, 1.52, 0), [0, 0, -0.55]);

  // ---------- rider (generic, helmet on, proper proportions) ----------
  const rider = new THREE.Group(); bike.add(rider);
  const RM = { jacket: toon("#ff9f1c"), jacket2: toon("#f7f7fb"), pants: toon("#33384d"), boot: toon("#1c1d26"), glove: toon("#2b2d3a"), skin: toon("#d9a27a"), helmet: toon("#f7f7fb"), visor: metal("#22263a", 0.12) };
  // pelvis + torso (shoulders wider than hips)
  inked(rbox(0.26, 0.2, 0.32, 0.08), RM.pants, 0.02, rider, v3(-0.34, 1.16, 0));
  const torsoGeo = new THREE.CylinderGeometry(0.25, 0.17, 0.58, 18); torsoGeo.scale(0.8, 1, 1.0);
  inked(torsoGeo, RM.jacket, 0.022, rider, v3(-0.2, 1.44, 0), [0, 0, -0.5]);
  inked(rbox(0.06, 0.34, 0.3, 0.03), RM.jacket2, 0.012, rider, v3(-0.07, 1.47, 0), [0, 0, -0.5]);
  inked(cylZ(0.11, 0.5), RM.jacket, 0.02, rider, v3(-0.06, 1.66, 0));
  inked(new THREE.CylinderGeometry(0.055, 0.06, 0.12, 12), RM.skin, 0.015, rider, v3(0.0, 1.78, 0), [0, 0, -0.4]);
  // helmet with peak, visor, chin bar, stripe
  const helm = new THREE.Group(); rider.add(helm); helm.position.set(0.06, 1.95, 0);
  const hg = sph(0.17); hg.scale(1.12, 1.0, 0.95);
  inked(hg, RM.helmet, 0.022, helm);
  inked(rbox(0.26, 0.03, 0.2, 0.012), RM.helmet, 0.012, helm, v3(0.14, 0.13, 0), [0, 0, -0.25]);
  const vg = new THREE.SphereGeometry(0.172, 20, 12, -0.95, 1.9, 1.15, 0.65); vg.rotateY(Math.PI / 2); vg.scale(1.13, 1.0, 0.97);
  helm.add(new THREE.Mesh(vg, RM.visor));
  inked(rbox(0.1, 0.07, 0.2, 0.03), RM.helmet, 0.012, helm, v3(0.15, -0.11, 0), [0, 0, 0.3]);
  inked(rbox(0.32, 0.035, 0.03, 0.012), BM.cyan, 0.008, helm, v3(-0.02, 0.06, 0.162), [0, 0, 0.2]);
  inked(rbox(0.32, 0.035, 0.03, 0.012), BM.cyan, 0.008, helm, v3(-0.02, 0.06, -0.162), [0, 0, 0.2]);
  // arms
  const arms = [-1, 1].map((sd) => {
    const up = limb(rider, 0.058, RM.jacket, 0.016), fo = limb(rider, 0.05, RM.jacket2, 0.016);
    const el = inked(sph(0.062), RM.jacket, 0.016, rider), gl = inked(sph(0.055), RM.glove, 0.014, rider);
    return { sd, up, fo, el, gl };
  });
  const legs = [-1, 1].map((sd) => {
    const th = limb(rider, 0.085, RM.pants, 0.018), sh = limb(rider, 0.065, RM.pants, 0.016);
    const kn = inked(sph(0.082), RM.pants, 0.016, rider);
    const bt = inked(rbox(0.26, 0.12, 0.11, 0.04), RM.boot, 0.016, rider);
    return { sd, th, sh, kn, bt };
  });
  const tmpA = v3(0, 0, 0), tmpB = v3(0, 0, 0), tmpC = v3(0, 0, 0);
  function poseRider(t, footDown, brakeSq) {
    for (const a of arms) {
      const sh = tmpA.set(-0.06, 1.66, a.sd * 0.24), el = tmpB.set(0.17, 1.42, a.sd * 0.33), wr = tmpC.set(0.46, 1.4, a.sd * 0.37);
      a.up.set(sh, el); a.fo.set(el, wr); a.el.position.copy(el); a.gl.position.copy(wr);
    }
    for (const l of legs) {
      const fd = l.sd < 0 ? footDown : 0;
      const hip = v3(-0.32, 1.13, l.sd * 0.13);
      const knee = v3(lerp(0.06, -0.02, fd), lerp(0.98, 0.72, fd), l.sd * lerp(0.25, 0.42, fd));
      const ank = v3(lerp(-0.12, 0.06, fd), lerp(0.5, 0.1, fd), l.sd * lerp(0.25, 0.58, fd));
      l.th.set(hip, knee); l.sh.set(knee, ank); l.kn.position.copy(knee);
      l.bt.position.set(ank.x + 0.07, ank.y - 0.04, ank.z);
    }
    helm.rotation.z = -0.05 + 0.02 * Math.sin(t * 0.9);
    rider.position.y = 0.006 * Math.sin(t * 7.3);
  }

  // ---------- cars (cel-shaded, generic) ----------
  const tireM = toon("#24252e"), glassM = toon("#203a6b"), rimM = metal("#d6dbe4", 0.25);
  function mkCar(col) {
    const g = new THREE.Group();
    const bm = toon(col);
    inked(rbox(4.1, 0.72, 1.78, 0.26), bm, 0.035, g, v3(0, 0.62, 0));
    inked(rbox(2.2, 0.62, 1.56, 0.26), glassM, 0.035, g, v3(-0.25, 1.22, 0));
    inked(rbox(1.9, 0.08, 1.5, 0.035), bm, 0.02, g, v3(-0.3, 1.55, 0));
    const wheels = [];
    for (const x of [-1.3, 1.3]) for (const z of [-0.84, 0.84]) {
      const w = inked(cylZ(0.34, 0.22), tireM, 0.025, g, v3(x, 0.34, z));
      inked(cylZ(0.18, 0.24), rimM, 0.01, w);
      wheels.push(w);
    }
    const tl = new THREE.MeshBasicMaterial({ color: "#7a1018" });
    for (const z of [-0.66, 0.66]) { const m = new THREE.Mesh(rbox(0.06, 0.16, 0.36, 0.03), tl); m.position.set(-2.06, 0.78, z); g.add(m); }
    const hl = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.4, 2.2) });
    for (const z of [-0.64, 0.64]) { const m = new THREE.Mesh(rbox(0.06, 0.14, 0.34, 0.03), hl); m.position.set(2.06, 0.78, z); g.add(m); }
    S.add(g);
    return { g, wheels, tl };
  }
  const lead = mkCar(P.pink), rearCar = mkCar(P.cyan), blindCar = mkCar(P.yellow);
  const jam = [P.purple, "#f7f7fb", "#5ad1a8", P.orange].map((c) => mkCar(c));
  const BRAKE_ON = new THREE.Color(4.5, 0.35, 0.4), BRAKE_OFF = new THREE.Color("#7a1018");

  // ---------- motion profile: bike speed, distance table, car gaps ----------
  const vKeys = sortK([[0, 13], [E.cruise, 13], [E.cruise + 1.6, 11], [E.macet6, 11], [E.berhenti + 0.5, 0], [E.perintah, 0], [E.perintah + 1.6, 7], [E.mengerem, 8], [E.menambah + 0.6, 3.5], [s.s8, 6], [s.s8 + 3, 13], [s.dur + 1, 13]]);
  const vF = mono(vKeys);
  const DT = 1 / 120, NT = Math.ceil((s.dur + 2) / DT);
  const Dtab = new Float32Array(NT + 1);
  for (let i = 1; i <= NT; i++) Dtab[i] = Dtab[i - 1] + Math.max(0, vF((i - 0.5) * DT)) * DT;
  const D = (t) => { const x = Math.max(0, t) / DT, i = Math.min(NT - 1, Math.floor(x)), f = x - i; return Dtab[i] * (1 - f) + Dtab[i + 1] * f; };
  const gapF = mono(sortK([[0, 13], [s.s2 - 0.2, 13], [E.menembak - 1.2, 22], [E.melambat, 22], [E.selisih + 0.8, 12], [E.cruise + 2.4, 15], [E.macet6, 13], [E.berhenti + 0.4, 6.2], [E.perintah, 6.2], [E.perintah + 2.2, 10], [E.bahaya, 10.5], [E.mengerem + 0.4, 6.8], [E.tapi, 7], [s.s8 + 1, 10], [s.dur + 1, 16]]));
  const rearF = mono(sortK([[0, -5.5], [s.s1e, -6.5], [s.s2 + 1, -40], [E.kedip - 1.6, -34], [E.kedip + 0.7, -7.8], [E.pengemudi + 1.2, -7.4], [s.s6 + 0.5, -40], [s.s8 + 0.5, -40], [s.s8 + 3, -14], [s.dur + 1, -13]]));
  const blindF = mono(sortK([[0, -40], [E.radarB - 1.4, -30], [E.titik, -3.4], [E.kedip - 0.4, -3.8], [s.s5e, 16], [s.s5e + 1, 40], [s.dur + 1, 40]]));
  const BLANE = -3.6;

  // ---------- radar cones (striped, translucent, pulsing outward) ----------
  const coneMat = (col) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.NormalBlending,
    uniforms: { uC: { value: new THREE.Color(col) }, uT: { value: 0 }, uA: { value: 0 } },
    vertexShader: "varying vec2 vUv;varying vec3 vN;varying vec3 vV;void main(){vUv=uv;vec4 wp=modelMatrix*vec4(position,1.);vN=normalize(mat3(modelMatrix)*normal);vV=cameraPosition-wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}",
    fragmentShader: "uniform vec3 uC;uniform float uT,uA;varying vec2 vUv;varying vec3 vN;varying vec3 vV;void main(){float d=1.-vUv.y;float st=fract(d*7.-uT*1.6);float band=smoothstep(.0,.06,st)*(1.-smoothstep(.12,.2,st));float lv=length(vV);vec3 v=lv>1e-4?vV/lv:vec3(0.,0.,1.);float fr=1.-abs(dot(normalize(vN+vec3(1e-5)),v));float a=uA*(.08+.5*band+.25*pow(fr,3.))*pow(1.-d,.7)*smoothstep(0.,.06,d);gl_FragColor=vec4(uC*(1.+.6*band),clamp(a,0.,1.));}",
  });
  const coneGeo = new THREE.ConeGeometry(2.6, 13, 40, 1, true); coneGeo.translate(0, -6.5, 0); coneGeo.rotateZ(Math.PI / 2); // apex at origin, opening toward +x
  const coneF = new THREE.Mesh(coneGeo, coneMat(P.cyan)); coneF.position.copy(RADF); coneF.scale.set(1, 0.42, 1); coneF.renderOrder = 5; bike.add(coneF);
  const coneB = new THREE.Mesh(coneGeo, coneMat(P.pink)); coneB.position.copy(RADB); coneB.rotation.y = Math.PI; coneB.scale.set(0.8, 0.42, 1.25); coneB.renderOrder = 5; bike.add(coneB);

  // ---------- wave layer on the road: ring packets (outgoing / echo) ----------
  const NR = 24;
  const ringU = { uR: { value: Array.from({ length: NR }, () => new THREE.Vector4(0, 0, 0, 0)) }, uD: { value: Array.from({ length: NR }, () => new THREE.Vector4(1, 0, 0, 0)) }, uA: { value: 1 } };
  const waveMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: ringU,
    vertexShader: "varying vec2 vP;void main(){vec4 wp=modelMatrix*vec4(position,1.);vP=wp.xz;gl_Position=projectionMatrix*viewMatrix*wp;}",
    fragmentShader: `#define NR ${NR}
uniform vec4 uR[NR];uniform vec4 uD[NR];uniform float uA;varying vec2 vP;
void main(){vec4 acc=vec4(0.);
 for(int i=0;i<NR;i++){vec4 R=uR[i];if(R.w<=0.001)continue;vec2 q=vP-R.xy;float L=length(q);if(L<1e-3)continue;
  vec2 dir=uD[i].xy;float c=dot(q/L,dir);float sect=smoothstep(uD[i].z,uD[i].z+.06,c);
  float d=abs(L-R.z);float core=1.-smoothstep(.05,.09,d);float edge=1.-smoothstep(.09,.14,d);
  vec3 col=uD[i].w<.5?vec3(.35,.82,1.):(uD[i].w<1.5?vec3(1.,.48,.66):vec3(1.,.22,.2));
  float a=R.w*sect;vec4 c4=vec4(mix(vec3(.04,.04,.07),col*1.6,core/max(edge,1e-3)),edge*a);
  acc.rgb=mix(acc.rgb,c4.rgb,c4.a);acc.a=max(acc.a,c4.a);}
 if(acc.a<.003)discard;gl_FragColor=vec4(acc.rgb,acc.a*uA);}`,
  });
  const wave = new THREE.Mesh(new THREE.PlaneGeometry(80, 26).rotateX(-Math.PI / 2), waveMat);
  wave.position.set(0, 0.06, -2); wave.renderOrder = 6; S.add(wave);
  // distance bracket on the road (50 m / jaga jarak)
  const bracketM = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0 });
  const bracket = new THREE.Group(); S.add(bracket);
  const bLine = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.12).rotateX(-Math.PI / 2), bracketM); bracket.add(bLine);
  const bT1 = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 1.1).rotateX(-Math.PI / 2), bracketM), bT2 = bT1.clone(); bracket.add(bT1, bT2);
  bracket.position.set(0, 0.07, 1.2);

  // ---------- sprites: labels, onomatopoeia, impact callouts ----------
  const SP = {
    m50: sprite(labelTex("50 m", P.yellow, P.ink), 2.4, 0.75),
    jaga: sprite(labelTex("JAGA JARAK", P.cyan, P.ink, 640, 160, 74), 3.0, 0.75),
    ping: sprite(labelTex("PING!", P.cyan, P.ink, 420, 170, 100), 1.7, 0.69),
    echo: sprite(labelTex("GEMA!", P.pink, "#ffffff", 440, 170, 100), 1.8, 0.7),
    blind: sprite(labelTex("TITIK BUTA", P.yellow, P.ink, 600, 160, 72), 2.2, 0.59),
    sein: sprite(labelTex("KEDIP-KEDIP!", P.orange, P.ink, 720, 160, 70), 2.4, 0.53),
    dct: sprite(labelTex("KOPLING GANDA", P.yellow, P.ink, 760, 160, 70), 0.62, 0.13),
    k1: sprite(labelTex("KOPLING 1", P.orange, P.ink, 560, 160, 80), 0.4, 0.114),
    k2: sprite(labelTex("KOPLING 2", P.cyan, P.ink, 560, 160, 80), 0.4, 0.114),
    noLever: sprite(canvasTex(256, 256, (c) => { c.lineCap = "round"; for (const [lw, col] of [[56, P.ink], [34, P.red]]) { c.lineWidth = lw; c.strokeStyle = col; c.beginPath(); c.moveTo(50, 50); c.lineTo(206, 206); c.moveTo(206, 50); c.lineTo(50, 206); c.stroke(); } }), 0.28, 0.28),
    plus: sprite(labelTex("+ REM", P.red, "#ffffff", 420, 170, 100), 0.62, 0.25),
    warn: sprite(dashW1, 1.3, 0.81),
    radar: sprite(labelTex("RADAR DEPAN", P.cyan, P.ink, 700, 160, 78), 0.55, 0.126),
    tap: sprite(labelTex("TEKAN", P.cyan, P.ink, 400, 160, 90), 0.36, 0.14),
  };
  for (const k in SP) S.add(SP[k]);
  const pop = (sp, on, pos, rot = 0) => {
    sp.visible = on > 0.01; if (!sp.visible) return;
    const k = back(on, 2.2); sp.scale.set(sp.userData.w * k, sp.userData.h * k, 1); sp.material.opacity = Math.min(1, on * 1.5); sp.material.rotation = rot; sp.position.copy(pos);
  };

  // ---------- DCT exploded diagram (two clutch packs on one shaft) ----------
  const dct = new THREE.Group(); S.add(dct);
  const fricM = toon(P.orange), steelM = toon("#d9dde8"), drumM = toon("#5a6075"), drum2M = toon(P.cyan);
  const packs = [];
  for (const [pk, rad, col] of [[0, 0.42, drumM], [1, 0.36, drum2M]]) {
    const g = new THREE.Group(); dct.add(g);
    const plates = [];
    for (let i = 0; i < 6; i++) { const p = inked(cylX(rad - 0.03, 0.022, 28), i % 2 ? fricM : steelM, 0.012, g); plates.push(p); }
    inked(cylX(rad + 0.03, 0.03, 28), col, 0.014, g, v3(-0.12, 0, 0));
    packs.push({ g, plates, pk });
  }
  inked(cylX(0.05, 2.0), BM.steel, 0.014, dct);
  dct.position.set(0.8, 1.25, 2.4); dct.rotation.y = -0.22;

  // ---------- foreground layer (camera-attached, blurred-feeling grass tufts + road cones) ----------
  const FG = new THREE.Group(); cam.add(FG);
  const tuftM = toon("#4cb35a");
  for (const [x, y, sc] of [[-1.15, -2.05, 0.55], [1.15, -2.0, 0.5]]) {
    const g = new THREE.Group();
    for (let i = 0; i < 7; i++) { const cg = new THREE.ConeGeometry(0.05, 0.6 + (i % 3) * 0.2, 5); cg.translate(0, 0.3, 0); inked(cg, tuftM, 0.015, g, v3((i - 3) * 0.06, 0, (i % 2) * 0.05), [0, 0, (i - 3) * 0.12]); }
    g.position.set(x, y, -4.2); g.scale.setScalar(sc * 2); FG.add(g);
  }

  // ---------- camera shots (bike-relative; [t, px,py,pz, lx,ly,lz, roll]) ----------
  const sh = (keys) => track(sortK(keys));
  const SHOTS = [
    { a: 0, f: sh([[0, 6.0, 1.5, 8.0, -0.6, 1.05, 0, 0.14], [E.melihat, 5.8, 1.55, 7.9, -0.8, 1.05, 0, 0.12], [E.macet, 5.3, 1.75, 8.4, -1.2, 1.0, 0, 0.07], [E.pertama - 0.1, 5.5, 1.9, 8.8, -1.2, 1.0, 0, 0.04], [s.s1e, 7.6, 2.8, 11.0, -1.4, 1.0, 0, -0.1]]) },
    { a: s.s2, f: sh([[s.s2, 2.4, 2.4, 12.0, 0.0, 1.5, -1.5, -0.04], [E.eicma, 1.2, 2.7, 12.4, -0.4, 1.9, -2.4, 0.03], [E.ducati, -0.4, 2.9, 12.8, -0.8, 2.0, -2.6, 0.0], [E.africa - 0.6, 3.0, 1.8, 9.6, 0.0, 1.05, 0, 0.1], [s.s2e, 3.6, 1.7, 9.0, 0.1, 1.0, 0, 0.12]]) },
    { a: s.s3, f: sh([[s.s3, 3.5, 1.15, 0.95, 0.85, 1.05, 0, 0.12], [E.matanya + 1.2, 3.8, 1.25, 1.2, 0.8, 1.05, 0, 0.1], [E.menembak - 1.2, 0.6, 2.8, 9.0, -0.1, 1.5, 0, 0.04], [E.menembak + 0.5, -7.0, 2.6, 0.5, 10, 0.1, -0.5, 0], [E.gema, -6.8, 2.6, 0.5, 10, 0.1, -0.5, 0], [s.s3e, -6.6, 2.7, 0.5, 10, 0.15, -0.5, 0]]) },
    { a: s.s4, f: sh([[s.s4, -6.6, 2.9, 0.6, 10, 0.2, -0.5, -0.04], [E.terjepit, -6.3, 2.8, 0.6, 10, 0.2, -0.5, -0.05], [s.s4e, -6.0, 2.8, 0.6, 9, 0.2, -0.5, -0.04]]) },
    { a: s.s5, f: sh([[s.s5, -6.0, 4.4, 5.6, 7, 0.6, -0.4, 0], [E.radarB - 0.3, -5.4, 4.0, 5.6, 7, 0.7, -0.4, 0.02]]) },
    { a: E.radarB, f: sh([[E.radarB, 5.0, 6.0, 6.6, -3.0, 0.4, -1.8, 0.08], [E.titik, 5.4, 6.5, 7.2, -2.2, 0.3, -1.9, 0.1], [E.kedip, 5.6, 4.6, 5.2, -6.5, 0.6, -0.9, 0.08], [s.s5e, 5.9, 4.6, 5.4, -6.5, 0.6, -0.9, 0.08]]) },
    { a: s.s6, f: sh([[s.s6, 1.6, 1.6, 7.6, 0.2, 1.55, 0, 0], [E.berhenti, 1.8, 1.7, 7.2, 0.4, 1.7, 0.2, 0.0], [E.transmisi - 0.2, 2.4, 1.55, 6.6, 0.4, 1.3, 1.3, 0.03], [E.melepas + 0.4, 2.2, 1.5, 6.2, 0.4, 1.25, 1.4, 0.05], [E.tuas - 0.5, 2.4, 1.6, 6.3, 0.4, 1.25, 1.4, 0.05], [E.tuas - 0.22, 4.8, 2.7, 1.4, 0.5, 1.35, -0.1, 0.06], [E.tuas + 0.05, 2.9, 2.5, -2.9, 0.45, 1.3, -0.3, 0.1], [E.perintah, 2.5, 2.35, -2.6, 0.45, 1.3, -0.25, 0.08], [s.s6e, 2.7, 2.45, -2.8, 0.45, 1.3, -0.25, 0.06]]) },
    { a: s.s7, f: sh([[s.s7, -5.0, 3.6, 3.4, 5, 0.9, -0.3, 0.05], [E.layar + 1, -4.4, 3.3, 3.0, 5, 0.9, -0.3, 0.06], [E.mengerem - 0.3, -4.0, 3.1, 2.8, 5, 0.9, -0.3, 0.06]]) },
    { a: E.mengerem, f: sh([[E.mengerem, 5.4, 1.75, 5.0, 0.2, 0.95, 0, 0.12], [E.menambah + 1, 5.1, 1.7, 4.8, 0.2, 0.95, 0, 0.1], [E.tapi - 0.3, 5.0, 1.7, 4.7, 0.2, 0.95, 0, 0.1]]) },
    { a: E.tapi, f: sh([[E.tapi, 6.6, 2.2, 8.6, -0.6, 1.4, 0, -0.14], [s.s7e, 7.0, 2.4, 9.0, -0.6, 1.4, 0, -0.1]]) },
    { a: s.s8, f: sh([[s.s8, 6.4, 2.6, 9.4, -0.6, 1.5, 0, -0.06], [E.menyetir, -6.0, 3.6, 10.2, 1.5, 1.7, 0, 0.0], [s.dur, -10, 5.4, 12, 3, 2.0, -1, 0.03]]) },
  ];
  const BW = 0.32;
  function camAt(t) {
    let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].a) i++;
    let c = SHOTS[i].f(t);
    if (i + 1 < SHOTS.length && t > SHOTS[i + 1].a - BW) {
      const u = ramp(t, SHOTS[i + 1].a - BW, SHOTS[i + 1].a + BW); c = c.map((v, j) => lerp(v, SHOTS[i + 1].f(t)[j], u));
    } else if (i > 0 && t < SHOTS[i].a + BW) {
      const u = ramp(t, SHOTS[i].a - BW, SHOTS[i].a + BW), p = SHOTS[i - 1].f(t); c = p.map((v, j) => lerp(v, c[j], u));
    }
    return c;
  }
  // shot changes = snap moments (for speed lines / smear)
  const snapAt = SHOTS.slice(1).map((x) => x.a);

  // ---------- post: NaN guard -> bloom -> output -> anime grade (speed lines, impact frames) ----------
  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  const QV = "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}";
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } }, vertexShader: QV,
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);bvec4 n=isnan(c);bvec4 f=isinf(c);if(any(n)||any(f))c=vec4(0.,0.,0.,1.);gl_FragColor=clamp(c,0.,30.);}" })));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.38, 0.45, 0.95);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());
  const gradeU = { tDiffuse: { value: null }, uSpeed: { value: 0 }, uImp: { value: 0 }, uFrame: { value: 0 }, uFocus: { value: new THREE.Vector2(0.5, 0.55) } };
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: gradeU, vertexShader: QV,
    fragmentShader: `uniform sampler2D tDiffuse;uniform float uSpeed,uImp,uFrame;uniform vec2 uFocus;varying vec2 vUv;
float h1(float n){return fract(sin(n*127.1+uFrame*311.7)*43758.5453);}
void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;
 c=mix(vec3(dot(c,vec3(.299,.587,.114))),c,1.1);
 vec2 p=(vUv-uFocus)*vec2(1.,1.7778);float R=length(p);float a=atan(p.y,p.x);
 float id=floor((a+3.14159)/6.28318*140.);float hh=h1(id);float on=step(1.-.55*uSpeed,hh);
 float rmin=.42+.35*h1(id+7.);float w=abs(fract((a+3.14159)/6.28318*140.)-.5);
 float line=on*smoothstep(rmin,rmin+.15,R)*(1.-smoothstep(.06,.22,w));c=mix(c,vec3(1.),line*.85*min(1.,uSpeed*1.4));
 float L=dot(c,vec3(.299,.587,.114));vec3 imp=L>.5?vec3(.07,.06,.1):vec3(1.,.97,.93);
 float il=on*smoothstep(.25,.4,R)*(1.-smoothstep(.1,.3,w));imp=mix(imp,vec3(.9,.12,.2),il*.9);
 c=mix(c,imp,uImp);
 gl_FragColor=vec4(clamp(c,0.,1.),1.);}` })));

  // impact frames (short hard cuts) and their focus points
  const IMP = [[E.pertama + 0.05, 0.2], [E.sendiri + 0.05, 0.22]];
  // hero echo return in s3 also gets an impact (computed from the pulse system below)
  const C = 16; // visual wave speed (slow motion)
  const heroEmit = (() => { const g = gapF(E.gema) - 2.05 - RADF.x; return E.gema + 0.1 - 2 * g / C; })();
  IMP.push([heroEmit + 2 * (gapF(E.gema) - 2.05 - RADF.x) / C, 0.16]);

  const rings = [];
  const addRing = (cx, cz, rr, a, dx, dz, cosMin, col) => { if (rings.length >= NR || a <= 0.003 || rr <= 0.02) return; rings.push([cx, cz, rr, a, dx, dz, cosMin, col]); };
  // pulse packets: emit from radar (fx, 0) toward target (tx, tz); the echo returns from the target
  function packets(t, on, period, phase, fx, tx, tz, squeeze, echoCol) {
    if (on < 0.01) return;
    const dx = tx - fx, dz = tz, dist = Math.hypot(dx, dz); if (dist < 0.5) return;
    const ux = dx / dist, uz = dz / dist;
    const k0 = Math.floor((t - phase) / period);
    for (let k = k0; k > k0 - 4; k--) {
      const te = phase + k * period, age = t - te; if (age < 0) continue;
      const out = C * age;
      for (let j = 0; j < 3; j++) { const rr = out - j * 0.55; if (rr > 0.05 && rr < dist) addRing(fx, 0, rr, on * (1 - j * 0.25) * (1 - 0.4 * rr / dist), ux, uz, 0.9, 0); }
      const back_ = out - dist;
      if (back_ > 0) {
        const sp = 0.55 * (1 - 0.55 * squeeze);
        for (let j = 0; j < 3; j++) { const rr = back_ - j * sp; if (rr > 0.05 && rr < dist) addRing(tx, tz, rr, on * (1 - j * 0.2), -ux, -uz, 0.92, echoCol); }
      }
    }
  }

  const blinkOn = (t, a, b, hz) => (t > a && t < b ? (Math.floor((t - a) * hz * 2) % 2 === 0 ? 1 : 0) : 0);

  return (t) => {
    const Dt = D(t), v = vF(t);
    // ----- road + props scroll -----
    for (let i = 0; i < NDASH; i++) {
      let x = ((i * DASH_SP - Dt) % (NDASH * DASH_SP) + NDASH * DASH_SP) % (NDASH * DASH_SP) - NDASH * DASH_SP / 2;
      dm.position.set(x, 0.013, -1.8); dm.rotation.set(0, 0, 0); dm.scale.set(1, 1, 1); dm.updateMatrix(); dashes.setMatrixAt(i, dm.matrix);
    }
    dashes.instanceMatrix.needsUpdate = true;
    for (const p of props) { const x = ((p.x0 - Dt) % LOOP + LOOP) % LOOP - LOOP * 0.42; p.g.position.set(x, 0, p.z); }
    const placeOnce = (g, tA, relX, z) => { const xw = D(tA) + relX; const x = xw - Dt; g.visible = x > -40 && x < 70; g.position.set(x, 0, z); };
    placeOnce(signA, E.eicma, 3, ROAD_Z0 - 4.5);
    placeOnce(signB, E.ducati, 2.5, ROAD_Z0 - 4.5);
    mtn.position.x = -Dt * 0.03;
    clouds.forEach((c) => { const u = c.userData; c.position.set(Math.cos(u.a) * u.d - Dt * 0.05, u.y, Math.sin(u.a) * u.d); c.lookAt(cam.position.x, u.y, cam.position.z); });

    // ----- bike -----
    wF.rotation.z = -Dt / 0.51; wR.rotation.z = -Dt / 0.5;
    const brakeAssist = win(t, E.menambah - 0.2, E.tapi + 0.4, 0.15, 0.4);
    bike.rotation.x = 0; bike.position.y = 0.004 * Math.sin(t * 9.1) * Math.min(1, v / 8);
    bike.rotation.z = -0.02 * brakeAssist; // nose dive under braking
    const footDown = win(t, E.berhenti - 0.3, E.perintah + 0.3, 0.45, 0.5);
    poseRider(t, footDown, brakeAssist);
    calM.emissiveIntensity = 2.2 * brakeAssist * (0.8 + 0.2 * Math.sin(t * 30));

    // ----- cars -----
    const g = gapF(t), gPrev = gapF(t - 0.15);
    lead.g.position.set(RADF.x + g + 2.05, 0, 0);
    const leadBrake = (g < gPrev - 0.05) || (t > E.berhenti - 0.6 && t < E.perintah + 0.2) ? 1 : 0;
    lead.tl.color.copy(leadBrake ? BRAKE_ON : BRAKE_OFF);
    lead.wheels.forEach((w) => (w.rotation.z = -(Dt + g) / 0.34));
    const rx = rearF(t); rearCar.g.visible = rx > -36; rearCar.g.position.set(RADB.x + rx - 2.05, 0, 0); rearCar.wheels.forEach((w) => (w.rotation.z = -(Dt + rx) / 0.34));
    const bx = blindF(t); blindCar.g.visible = bx > -36 && bx < 36; blindCar.g.position.set(bx, 0, BLANE); blindCar.wheels.forEach((w) => (w.rotation.z = -(Dt + bx) / 0.34));
    const jamOn = t > E.macet6 - 2.5 && t < E.bahaya + 0.5;
    jam.forEach((c, i) => { c.g.visible = jamOn; c.g.position.set(RADF.x + g + 2.05 + (i - 0.6) * 5.6 + (i % 2) * 1.2, 0, BLANE); c.tl.color.copy(t > E.berhenti - 0.8 && t < E.perintah ? BRAKE_ON : BRAKE_OFF); });

    // ----- radar cones -----
    const fOn = Math.max(win(t, -1, s.s2 + 0.6, 0.3, 0.5), 0.35 * win(t, s.s2, s.s3, 0.3, 0.3), win(t, E.matanya, s.s5e, 0.3, 0.4), 0.7 * win(t, s.s6, s.s6e, 0.3, 0.3), win(t, s.s7, s.s7e, 0.3, 0.3), win(t, s.s8, s.dur + 2, 0.4, 0.1));
    const bOn = Math.max(win(t, -1, s.s2 + 0.6, 0.3, 0.5), 0.35 * win(t, s.s2, s.s3, 0.3, 0.3), win(t, E.matanya, E.menembak, 0.3, 0.3), win(t, E.radarB - 0.2, s.s5e, 0.3, 0.4), win(t, s.s8, s.dur + 2, 0.4, 0.1));
    coneF.material.uniforms.uT.value = t; coneF.material.uniforms.uA.value = fOn * 0.8; coneF.visible = fOn > 0.01;
    coneB.material.uniforms.uT.value = t; coneB.material.uniforms.uA.value = bOn * 0.8; coneB.visible = bOn > 0.01;
    const glowF = 0.5 + 0.5 * fOn, glowB = 0.5 + 0.5 * bOn;
    radFg.material.color.setRGB(0.3 + 0.4 * glowF, 1.2 * glowF + 0.3, 2.8 * glowF);
    radBg.material.color.setRGB(2.8 * glowB, 0.6 * glowB + 0.2, 1.3 * glowB);

    // ----- wave rings -----
    rings.length = 0;
    const leadRear = RADF.x + g + 2.05 - 2.05;
    const hookOn = win(t, -1, s.s2 - 0.2, 0.2, 0.4);
    packets(t, hookOn, 1.1, 0.0, RADF.x, leadRear, 0, 0, 1);
    packets(t, hookOn, 1.1, 0.4, RADB.x, RADB.x + rx, 0, 0, 1);
    const s3On = win(t, E.menembak - 0.2, s.s3e + 0.2, 0.2, 0.3);
    packets(t, s3On, 1.6, heroEmit, RADF.x, leadRear, 0, 0, 1);
    const sq = ramp(t, E.melambat, E.terjepit + 0.3);
    packets(t, win(t, s.s4, s.s4e, 0.3, 0.3), 0.95, s.s4, RADF.x, leadRear, 0, sq, sq > 0.5 ? 2 : 1);
    packets(t, win(t, s.s5, E.radarB, 0.3, 0.3), 1.2, s.s5, RADF.x, leadRear, 0, 0, 1);
    packets(t, win(t, E.radarB, E.kedip - 1.2, 0.3, 0.3), 1.0, E.radarB, RADB.x, bx + 2.05, BLANE, 0, 1);
    packets(t, win(t, E.kedip - 1.6, s.s5e, 0.3, 0.3), 0.8, E.kedip, RADB.x, RADB.x + rx, 0, 0, 2);
    packets(t, win(t, s.s7, E.mengerem, 0.3, 0.3), 0.8, s.s7, RADF.x, leadRear, 0, 0.6, 2);
    packets(t, win(t, s.s8, s.dur + 2, 0.4, 0.1), 1.2, s.s8, RADF.x, leadRear, 0, 0, 1);
    // blind spot rings are diagonal: put them in the rear packet (cosMin wider)
    for (let i = 0; i < NR; i++) {
      const R0 = rings[i];
      if (R0) { ringU.uR.value[i].set(R0[0], R0[1], R0[2], R0[3]); ringU.uD.value[i].set(R0[4], R0[5], R0[6], R0[7]); }
      else ringU.uR.value[i].set(0, 0, 0, 0);
    }
    // the blind-spot packet aims diagonally back-left
    // ----- bracket -----
    const b50 = win(t, E.lima - 0.2, E.situ + 1.0, 0.3, 0.4), bJ = win(t, E.cruise, E.radarB - 0.2, 0.3, 0.3);
    const bOnA = Math.max(b50, bJ);
    bracketM.opacity = bOnA * 0.95;
    bracket.visible = bOnA > 0.01;
    const x0 = RADF.x + 0.1, x1 = leadRear;
    bLine.position.x = (x0 + x1) / 2; bLine.scale.x = Math.max(0.01, x1 - x0); bT1.position.x = x0; bT2.position.x = x1;

    // ----- lamps: mirror blind-spot, indicators -----
    const bsOn = win(t, E.titik - 0.6, s.s5e, 0.1, 0.3);
    mirLamp[0].color.setRGB(0.35 + 3.6 * bsOn, 0.22 + 1.7 * bsOn, 0.06 + 0.2 * bsOn);
    const blink = blinkOn(t, E.kedip, s.s5e + 0.2, 4);
    inds.forEach((m) => m.userData.mesh.material.color.copy(blink ? indOn : indOff));
    // ghost clutch lever + resume button + dash
    ghostM.opacity = 0.6 * win(t, E.tuas - 0.4, E.jalan, 0.2, 0.3);
    const tap = win(t, E.perintah - 0.1, s.s6e, 0.15, 0.3);
    btnM.color.setRGB(0.16 + 0.6 * tap, 0.35 + 2.0 * tap, 0.48 + 3.0 * tap);
    const warnOn = t > E.bahaya - 0.1 && t < E.tapi + 0.6;
    dashMat.map = warnOn ? (Math.floor(t * 6) % 2 ? dashW1 : dashW0) : dashOK;

    // ----- DCT diagram -----
    const dOn = win(t, E.transmisi - 0.3, E.tuas - 0.6, 0.3, 0.35);
    dct.visible = dOn > 0.01; dct.scale.setScalar(0.001 + back(dOn, 1.8) * 0.72);
    const sep = ramp(t, E.melepas - 0.1, E.melepas + 0.6);
    packs.forEach((p) => {
      p.g.position.x = (p.pk ? 0.42 : -0.42) * (1 + 0.35 * sep);
      p.plates.forEach((pl, i) => (pl.position.x = (i - 2.5) * (0.03 + 0.05 * sep)));
      p.g.rotation.x = t * (2 + p.pk) * (1 - sep * 0.8);
    });
    dct.rotation.x = 0.1 * Math.sin(t * 0.8);

    // ----- sprites -----
    const lp = v3(leadRear, 0, 0);
    pop(SP.m50, b50, v3((x0 + x1) / 2, 0.9, 1.9), -0.04);
    pop(SP.jaga, bJ, v3((x0 + x1) / 2, 0.9, 1.9), -0.04);
    pop(SP.ping, win(t, E.menembak, E.menembak + 1.6, 0.15, 0.3), v3(RADF.x + 1.4, 1.9, 0.6), 0.06);
    const heroBack = IMP[2][0];
    pop(SP.echo, win(t, heroBack - 1.2, heroBack + 1.4, 0.15, 0.3), lp.clone().add(v3(-0.6, 2.4, 0.4)), -0.06);
    pop(SP.blind, win(t, E.titik - 0.2, E.kedip - 0.2, 0.15, 0.25), v3(bx + 0.4, 2.3, BLANE), 0.05);
    pop(SP.sein, win(t, E.kedip + 0.1, s.s5e, 0.15, 0.25), v3(RADB.x - 3.2, 0.9, 0.6), -0.05);
    dct.updateMatrixWorld(true);
    const lOn = win(t, E.transmisi - 0.25, E.tuas - 0.6, 0.15, 0.3);
    pop(SP.dct, lOn, dct.localToWorld(v3(0, -0.66, 0.2)), -0.04);
    pop(SP.k1, win(t, E.melepas - 0.1, E.tuas - 0.6, 0.15, 0.3), dct.localToWorld(v3(-0.42 * (1 + 0.35 * sep), 0.05, 0.6)), 0.03);
    pop(SP.k2, win(t, E.melepas + 0.1, E.tuas - 0.6, 0.15, 0.3), dct.localToWorld(v3(0.42 * (1 + 0.35 * sep), 0.05, 0.6)), -0.03);
    pop(SP.noLever, win(t, E.tuas - 0.2, E.jalan, 0.12, 0.25), v3(0.58, 1.46, -0.38), 0);
    pop(SP.tap, win(t, E.perintah - 0.05, s.s6e, 0.12, 0.25), v3(0.42, 1.5, -0.22), 0.05);
    pop(SP.warn, win(t, E.bahaya - 0.1, E.mengerem - 0.2, 0.15, 0.25), v3(2.2, 2.5, 0.5), 0.04);
    if (SP.warn.visible) SP.warn.material.map = Math.floor(t * 6) % 2 ? dashW1 : dashW0;
    pop(SP.radar, win(t, s.s3 + 0.2, E.menembak - 1.4, 0.15, 0.25), v3(1.0, 0.72, 0.3), 0.05);
    pop(SP.plus, brakeAssist, v3(F.x - 0.05, F.y + 0.42, 0.25), -0.05);

    // ----- camera -----
    const c = camAt(t);
    let imp = 0; for (const [ta, d] of IMP) imp = Math.max(imp, t >= ta && t < ta + d ? 1 : 0);
    let snap = 0; for (const a of snapAt) snap = Math.max(snap, win(t, a, a + 0.05, 0.08, 0.35));
    const shake = Math.max(...IMP.map(([ta]) => win(t, ta, ta + 0.25, 0.02, 0.35)));
    cam.position.set(c[0] + shake * 0.06 * Math.sin(t * 71), c[1] + shake * 0.05 * Math.sin(t * 53) + 0.01 * Math.sin(t * 1.3), c[2]);
    cam.up.set(0, 1, 0);
    cam.lookAt(c[3], c[4], c[5]);
    cam.rotateZ(c[6]);
    cam.updateMatrixWorld(true);
    sky.position.copy(cam.position);
    FG.visible = cam.position.y < 2.6 && Math.abs(cam.position.z) > 3.5;
    FG.position.set(0.03 * Math.sin(t * 0.7), 0.02 * Math.sin(t * 0.9), 0);

    // ----- post uniforms -----
    gradeU.uSpeed.value = clamp01(Math.max(0.55 * clamp01((v - 4) / 9) * (t < s.s3 || t > s.s8 ? 1 : 0.35), snap * 0.9, imp));
    gradeU.uImp.value = imp;
    gradeU.uFrame.value = Math.floor(t * 12) % 97;
    bloom.strength = 0.38 + 0.25 * imp;
    comp.render();
  };
}
