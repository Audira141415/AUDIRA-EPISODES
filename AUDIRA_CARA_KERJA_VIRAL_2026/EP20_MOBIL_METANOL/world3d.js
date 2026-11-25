// EP20 METANOL. NANOFORGE look: a fluorescent molecular world in a deep void, glossy ball-and-stick atoms
// (C graphite, O red, H white), cyan/magenta rim light, bloom, cinema teal-orange grade.
// One connected dive axis (-z): x-ray car + pump (z 0) -> molecule soup in the tank (ZM) -> energy cubes + glass cylinder (ZC)
// -> fuel-line seal (ZS) -> molecule factory (ZF); s8 rewinds the camera back out to the car.
// Every value is a pure function of t (seeded PRNG only).
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { ShaderPass } from "./ShaderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, ramp, clamp01, canvasTex, track, eout, back } from "./lib3d.js";

const W = 1080, H = 1920;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerp = THREE.MathUtils.lerp;
const ZM = -80, ZC = -150, ZS = -210, ZF = -270;
const win = (t, a, b, fi = 0.4, fo = 0.4) => ramp(t, a - fi, a + fi) * (1 - ramp(t, b - fo, b + fo));

// ---------- geometry helpers ----------
function rbox(w, h, d, r, seg = 4) {
  const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
  s.moveTo(x, y - r); s.lineTo(x + ww, y - r); s.quadraticCurveTo(x + ww + r, y - r, x + ww + r, y);
  s.lineTo(x + ww + r, y + hh); s.quadraticCurveTo(x + ww + r, y + hh + r, x + ww, y + hh + r);
  s.lineTo(x, y + hh + r); s.quadraticCurveTo(x - r, y + hh + r, x - r, y + hh); s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelSize: r * 0.98, bevelThickness: r, bevelSegments: seg, curveSegments: 6 });
  g.translate(0, 0, -(d - 2 * r) / 2); g.computeVertexNormals();
  return g;
}
function rcyl(rad, h, bev, seg = 48) {
  const pts = [v3(0, -h / 2, 0)];
  for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2); pts.push(new THREE.Vector2(rad - bev + Math.cos(a) * bev, -h / 2 + bev + Math.sin(a) * bev)); }
  for (let i = 0; i <= 6; i++) { const a = (i / 6) * (Math.PI / 2); pts.push(new THREE.Vector2(rad - bev + Math.cos(a) * bev, h / 2 - bev + Math.sin(a) * bev)); }
  pts.push(new THREE.Vector2(0, h / 2));
  return new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p.x, p.y)), seg);
}
const dotTex = () => canvasTex(128, 128, (c, w) => { const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(0, 0, w, w); });

function textSprite(txt, color, px = 92, font = "700", bg = null) {
  const tex = canvasTex(512, 160, (c, w, h) => {
    if (bg) { c.fillStyle = bg; c.beginPath(); c.roundRect(6, 20, w - 12, h - 40, 18); c.fill(); }
    c.font = `${font} ${px}px "JetBrains Mono", "Space Grotesk", monospace`; c.textAlign = "center"; c.textBaseline = "middle";
    c.shadowColor = color; c.shadowBlur = 18; c.fillStyle = color; c.fillText(txt, w / 2, h / 2 + 4);
  });
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, toneMapped: false }));
  sp.renderOrder = 20;
  return sp;
}

// ---------- molecule templates (local units: C-H bond = 1) ----------
const TET = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map((a) => v3(...a).normalize());
function centre(m) { const c = v3(0, 0, 0); m.a.forEach((x) => c.add(x[1])); c.multiplyScalar(1 / m.a.length); m.a.forEach((x) => x[1].sub(c)); return m; }
function mMethanol() {
  const C = v3(0, 0, 0), O = TET[0].clone().multiplyScalar(1.3);
  const perp = new THREE.Vector3().crossVectors(TET[0], v3(0, 0, 1)).normalize();
  const HO = O.clone().add(TET[0].clone().multiplyScalar(0.34).add(perp.multiplyScalar(0.94)).normalize().multiplyScalar(0.95));
  return centre({ a: [["C", C], ["O", O], ["H", TET[1].clone()], ["H", TET[2].clone()], ["H", TET[3].clone()], ["H", HO]], b: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5]] });
}
function mOctane() {
  const a = [], b = [];
  for (let i = 0; i < 8; i++) { a.push(["C", v3(i * 1.27, (i % 2) * 0.82, 0)]); if (i) b.push([i - 1, i]); }
  for (let i = 0; i < 8; i++) {
    const out = i % 2 ? 1 : -1, c = a[i][1];
    for (const z of [-0.82, 0.82]) { a.push(["H", v3(c.x, c.y + out * 0.5, z)]); b.push([i, a.length - 1]); }
    if (i === 0 || i === 7) { a.push(["H", v3(c.x + (i ? 0.95 : -0.95), c.y + out * 0.3, 0)]); b.push([i, a.length - 1]); }
  }
  return centre({ a, b });
}
const mCO2 = () => ({ a: [["C", v3(0, 0, 0)], ["O", v3(-1.25, 0, 0)], ["O", v3(1.25, 0, 0)]], b: [[0, 1], [0, 2]] });
const mH2O = () => ({ a: [["O", v3(0, 0, 0)], ["H", v3(-0.76, -0.6, 0)], ["H", v3(0.76, -0.6, 0)]], b: [[0, 1], [0, 2]] });
const mO2 = () => ({ a: [["O", v3(-0.62, 0, 0)], ["O", v3(0.62, 0, 0)]], b: [[0, 1]] });
const mH2 = () => ({ a: [["H", v3(-0.4, 0, 0)], ["H", v3(0.4, 0, 0)]], b: [[0, 1]] });

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.05, 900);
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const s = K;
  const E = {
    minum: A_("s1:minum", 1.1), tangki: A_("s1:tangki", 3.1),
    geely: A_("s2:Geely", s.s2 + 1), listrik: A_("s2:listrik", s.s2 + 5), metanol: A_("s2:metanol", s.s2 + 5.5), bensin: A_("s2:bensin", s.s2 + 6), campur: A_("s2:campurannya", s.s2 + 7), pertama: A_("s2:pertama", s.s2 + 9), indy: A_("s2:Indy", s.s2 + 10.5),
    alkohol: A_("s3:alkohol", s.s3 + 1), karbon: A_("s3:karbon", s.s3 + 2), oksigen: A_("s3:oksigen", s.s3 + 2.8), hidrogen: A_("s3:hidrogen", s.s3 + 3.7), cair: A_("s3:Cair", s.s3 + 4.5), campur3: A_("s3:bercampur", s.s3 + 7), sensor: A_("s3:Sensor", s.s3 + 7.7), komputer: A_("s3:komputer", s.s3 + 9.6),
    separuh: A_("s4:separuh", s.s4 + 2.5), injektor: A_("s4:injektor", s.s4 + 4), dua: A_("s4:dua", s.s4 + 5), injeksi: A_("s4:Injeksi", s.s4 + 6.5), beku: A_("s4:beku", s.s4 + 10.8),
    oktan: A_("s5:Oktannya", s.s5 + 1.6), piston: A_("s5:piston", s.s5 + 3.7), menguap: A_("s5:menguap", s.s5 + 6.9), dingin: A_("s5:mendinginkan", s.s5 + 9), busi: A_("s5:Busi", s.s5 + 10.4), karbon5: A_("s5:karbon", s.s5 + 12.6), air: A_("s5:air", s.s5 + 13.8),
    serang: A_("s6:menyerang", s.s6 + 3.3), karet: A_("s6:karet", s.s6 + 5.2), bengkak: A_("s6:membengkak", s.s6 + 5.9), baja: A_("s6:baja", s.s6 + 7.5), khusus: A_("s6:khusus", s.s6 + 9.2),
    banyak: A_("s7:Kebanyakan", s.s7 + 1.5), batu: A_("s7:batu", s.s7 + 3.4), baru: A_("s7:Baru", s.s7 + 4.3), tangkap: A_("s7:tangkapan", s.s7 + 6.9), hidro7: A_("s7:hidrogen", s.s7 + 7.7), indo: A_("s7:Indonesia", s.s7 + 8.8), bio: A_("s7:biodiesel", s.s7 + 14.4),
    satu: A_("s8:Satu", s.s8), kimia: A_("s8:kimia", s.s8 + 2.9),
  };

  const S = new THREE.Scene();
  const VOID = new THREE.Color(0x02050f);
  S.background = VOID;
  S.fog = new THREE.FogExp2(0x030816, 0.026);
  const pm = new THREE.PMREMGenerator(r);
  S.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  S.environmentIntensity = 0.55;
  S.add(new THREE.AmbientLight(0x0a192f, 1.6));
  // lights ride with the camera so every zone keeps the same microscope lighting
  const rig = new THREE.Group(); S.add(rig);
  const keyL = new THREE.DirectionalLight(0xc7d2fe, 2.2); keyL.position.set(4, 7, 2); keyL.target.position.set(0, 0, -10); rig.add(keyL, keyL.target);
  const cyanL = new THREE.PointLight(0x00f5d4, 38, 30, 1.6); cyanL.position.set(-7, 3, -12); rig.add(cyanL);
  const magL = new THREE.PointLight(0xf43f5e, 30, 30, 1.6); magL.position.set(7, -3, -11); rig.add(magL);
  const goldL = new THREE.PointLight(0xf59e0b, 7, 22, 1.6); goldL.position.set(0, -5, -6); rig.add(goldL);

  // ---------- shared materials ----------
  const phys = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.26, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.06, ...o });
  const MAT = {
    C: phys(0x2a2f38, { emissive: 0x05080d }), O: phys(0xf0364f, { emissive: 0x3a0610 }), H: phys(0xd9e0ea),
    B: phys(0xaebccf, { metalness: 0.45, roughness: 0.3 }),
    Cx: phys(0x3a3a3a, { roughness: 0.7, clearcoat: 0.1 }), Ox: phys(0x8a5a5e, { roughness: 0.7, clearcoat: 0.1 }), Hx: phys(0x9a9a9a, { roughness: 0.7, clearcoat: 0.1 }), Bx: phys(0x6b6b6b, { roughness: 0.7, clearcoat: 0.1 }),
    Cg: phys(0x1f3a2c, { emissive: 0x0a6b3a, emissiveIntensity: 0.8 }), Og: phys(0xf0364f, { emissive: 0x2d7a3f, emissiveIntensity: 0.5 }), Hg: phys(0xe9fff2, { emissive: 0x2a9a5a, emissiveIntensity: 0.6 }), Bg: phys(0x7ef0b0, { emissive: 0x1f8a4f, emissiveIntensity: 0.6 }),
  };
  const RAD = { C: 0.42, O: 0.4, H: 0.27 };
  // instanced batch per material; positions are rewritten every frame
  const sphG = new THREE.SphereGeometry(1, 28, 20), bondG = new THREE.CylinderGeometry(1, 1, 1, 14, 1);
  const BATCH = {};
  for (const k of Object.keys(MAT)) {
    const m = new THREE.InstancedMesh(k[0] === "B" ? bondG : sphG, MAT[k], 900);
    m.frustumCulled = false; m.count = 0; S.add(m); BATCH[k] = { m, n: 0 };
  }
  const dmy = new THREE.Object3D(), UP = v3(0, 1, 0), tq = new THREE.Quaternion(), tv = v3(0, 0, 0), tv2 = v3(0, 0, 0);
  const put = (k, p, sc) => { const b = BATCH[k]; if (b.n >= 900 || !(sc > 1e-4)) return; dmy.position.copy(p); dmy.quaternion.identity(); dmy.scale.setScalar(sc); dmy.updateMatrix(); b.m.setMatrixAt(b.n++, dmy.matrix); };
  const bond = (k, p1, p2, rad) => {
    const b = BATCH[k]; if (b.n >= 900 || !(rad > 1e-4)) return;
    tv.subVectors(p2, p1); const L = tv.length(); if (L < 1e-4) return;
    tq.setFromUnitVectors(UP, tv.multiplyScalar(1 / L));
    dmy.position.addVectors(p1, p2).multiplyScalar(0.5); dmy.quaternion.copy(tq); dmy.scale.set(rad, L, rad); dmy.updateMatrix(); b.m.setMatrixAt(b.n++, dmy.matrix);
  };
  const WP = Array.from({ length: 40 }, () => v3(0, 0, 0));
  // draw a molecule template at pos/quat/scale; v = material variant ('', 'x' grey, 'g' green)
  function mol(T, pos, q, sc, v = "", bs = 1) {
    for (let i = 0; i < T.a.length; i++) { WP[i].copy(T.a[i][1]).applyQuaternion(q).multiplyScalar(sc).add(pos); put(T.a[i][0] + v, WP[i], RAD[T.a[i][0]] * sc); }
    if (bs > 0.01) for (const [i, j] of T.b) bond("B" + v, WP[i], WP[j], 0.1 * sc * bs);
  }
  const eul = new THREE.Euler(), qq = new THREE.Quaternion();
  const rotQ = (x, y, z) => qq.setFromEuler(eul.set(x, y, z));
  const bro = (sd, t, a = 0.3) => tv2.set(a * Math.sin(t * 0.7 + sd * 1.7) + a * 0.5 * Math.sin(t * 1.9 + sd * 3.1), a * Math.sin(t * 0.6 + sd * 2.3) + a * 0.5 * Math.sin(t * 1.5 + sd), a * Math.sin(t * 0.8 + sd * 0.9));
  const T_ME = mMethanol(), T_OC = mOctane(), T_CO2 = mCO2(), T_H2O = mH2O(), T_O2 = mO2(), T_H2 = mH2();

  const DOT = dotTex();
  const glowSprite = (color, size) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: DOT, color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); sp.scale.setScalar(size); S.add(sp); return sp; };

  // ---------- background: suspended particles along the whole dive axis ----------
  {
    const R = mulberry(20), N = 2600, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const pal = [new THREE.Color(0x00f5d4), new THREE.Color(0xa855f7), new THREE.Color(0x38bdf8), new THREE.Color(0xf59e0b)];
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (R() - 0.5) * 46; pos[i * 3 + 1] = (R() - 0.5) * 40; pos[i * 3 + 2] = 25 - R() * 330;
      const c = pal[Math.floor(R() * 4)]; const k = 0.25 + R() * 0.55; col[i * 3] = c.r * k; col[i * 3 + 1] = c.g * k; col[i * 3 + 2] = c.b * k;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    var dust = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.16, map: DOT, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
    dust.frustumCulled = false; S.add(dust);
    const g2 = new THREE.BufferGeometry(); const p2 = new Float32Array(160 * 3), c2 = new Float32Array(160 * 3);
    for (let i = 0; i < 160; i++) { p2[i * 3] = (R() - 0.5) * 70; p2[i * 3 + 1] = (R() - 0.5) * 60; p2[i * 3 + 2] = -10 - R() * 320; const c = pal[Math.floor(R() * 3)]; c2[i * 3] = c.r * 0.12; c2[i * 3 + 1] = c.g * 0.12; c2[i * 3 + 2] = c.b * 0.12; }
    g2.setAttribute("position", new THREE.BufferAttribute(p2, 3)); g2.setAttribute("color", new THREE.BufferAttribute(c2, 3));
    var bokeh = new THREE.Points(g2, new THREE.PointsMaterial({ size: 2.6, map: DOT, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    bokeh.frustumCulled = false; S.add(bokeh);
  }

  // =====================================================================  ZONE 1: x-ray car at a pump
  const carG = new THREE.Group(); S.add(carG);
  const floorTex = canvasTex(1024, 1024, (c, w) => {
    c.fillStyle = "#03070f"; c.fillRect(0, 0, w, w);
    c.strokeStyle = "rgba(0,245,212,.16)"; c.lineWidth = 2;
    for (let i = 0; i <= w; i += 64) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, w); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); }
    c.fillStyle = "rgba(0,245,212,.35)"; for (let i = 0; i <= w; i += 64) for (let j = 0; j <= w; j += 64) c.fillRect(i - 3, j - 3, 6, 6);
  }, [8, 8]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.32, metalness: 0.7, envMapIntensity: 0.6 }));
  floor.rotation.x = -Math.PI / 2; carG.add(floor);
  // body: extruded sedan profile with wheel arches
  const prof = new THREE.Shape();
  prof.moveTo(2.42, 0.34); prof.lineTo(1.93, 0.34); prof.absarc(1.46, 0.36, 0.47, 0, Math.PI, false); prof.lineTo(-0.99, 0.34);
  prof.absarc(-1.46, 0.36, 0.47, 0, Math.PI, false); prof.lineTo(-2.4, 0.34);
  prof.bezierCurveTo(-2.5, 0.5, -2.48, 0.8, -2.36, 0.98); prof.lineTo(-1.6, 1.04); prof.bezierCurveTo(-1.3, 1.1, -1.05, 1.32, -0.85, 1.42);
  prof.bezierCurveTo(-0.4, 1.5, 0.3, 1.5, 0.55, 1.42); prof.bezierCurveTo(0.85, 1.3, 1.0, 1.1, 1.25, 1.02); prof.bezierCurveTo(1.8, 0.95, 2.25, 0.9, 2.4, 0.78);
  prof.bezierCurveTo(2.5, 0.65, 2.5, 0.45, 2.42, 0.34);
  const bodyG = new THREE.ExtrudeGeometry(prof, { depth: 1.5, bevelEnabled: true, bevelSize: 0.14, bevelThickness: 0.16, bevelSegments: 6, curveSegments: 24 });
  bodyG.translate(0, 0, -0.75); bodyG.computeVertexNormals();
  const bodyM = new THREE.MeshPhysicalMaterial({ color: 0x0d3a4f, metalness: 0.4, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.04, transparent: true, opacity: 0.42, depthWrite: false, envMapIntensity: 1.4, side: THREE.DoubleSide });
  const body = new THREE.Mesh(bodyG, bodyM); body.renderOrder = 5; carG.add(body);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(bodyG, 28), new THREE.LineBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  carG.add(edges);
  // side windows (dark glass with cyan rim)
  const winS = new THREE.Shape(); winS.moveTo(-1.42, 1.08); winS.bezierCurveTo(-1.15, 1.22, -0.95, 1.36, -0.8, 1.38); winS.bezierCurveTo(-0.3, 1.44, 0.25, 1.44, 0.5, 1.37); winS.bezierCurveTo(0.75, 1.26, 0.9, 1.14, 1.08, 1.06); winS.lineTo(-1.42, 1.06);
  const winM = new THREE.MeshPhysicalMaterial({ color: 0x050a12, metalness: 0.3, roughness: 0.05, clearcoat: 1, envMapIntensity: 1.8, transparent: true, opacity: 0.7, depthWrite: false });
  for (const z of [0.92, -0.92]) { const wm = new THREE.Mesh(new THREE.ShapeGeometry(winS, 16), winM); wm.position.z = z; if (z < 0) wm.rotation.y = Math.PI, wm.scale.x = -1; wm.renderOrder = 6; carG.add(wm); }
  // wheels
  const tyreM = new THREE.MeshPhysicalMaterial({ color: 0x0b0d12, roughness: 0.55, clearcoat: 0.3 }), rimM = new THREE.MeshStandardMaterial({ color: 0xd8e2ee, metalness: 0.95, roughness: 0.18 });
  const spins = [];
  for (const x of [1.46, -1.46]) for (const z of [0.8, -0.8]) {
    const wg = new THREE.Group(); wg.position.set(x, 0.36, z);
    const ty = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.1, 18, 40), tyreM); wg.add(ty);
    const rim = new THREE.Mesh(rcyl(0.22, 0.18, 0.03, 32), rimM); rim.rotation.x = Math.PI / 2; wg.add(rim);
    for (let k = 0; k < 5; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.2, 0.03), new THREE.MeshStandardMaterial({ color: 0x1b2230, metalness: 0.8, roughness: 0.3 })); sp.position.z = z > 0 ? 0.1 : -0.1; sp.rotation.z = (k / 5) * Math.PI * 2; sp.position.x = Math.sin(-sp.rotation.z) * 0.1; sp.position.y = Math.cos(sp.rotation.z) * 0.1; wg.add(sp); }
    carG.add(wg); spins.push(wg);
  }
  // lights (head/tail strips)
  const headM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.4, 2.6), toneMapped: false }), tailM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 0.25, 0.35), toneMapped: false });
  for (const z of [0.62, -0.62]) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.42), headM); h.position.set(2.5, 0.72, z); carG.add(h); const tt = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.5), tailM); tt.position.set(-2.5, 0.88, z); carG.add(tt); }
  // fuel tank inside (under rear seat) with a two-colour swirling liquid
  const TK = v3(-1.15, 0.62, 0);
  const tankGlass = new THREE.Mesh(rbox(0.95, 0.42, 1.25, 0.1), new THREE.MeshPhysicalMaterial({ color: 0x9fe8ff, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.22, depthWrite: false, clearcoat: 1 }));
  tankGlass.position.copy(TK); tankGlass.renderOrder = 7; carG.add(tankGlass);
  const liqU = { uT: { value: 0 }, uMix: { value: 0 }, uLev: { value: 0.3 }, uGlow: { value: 1 } };
  const liqM = new THREE.ShaderMaterial({
    uniforms: liqU, transparent: true, depthWrite: false,
    vertexShader: "varying vec3 vP;varying vec3 vN;void main(){vP=position;vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `uniform float uT,uMix,uLev,uGlow;varying vec3 vP;varying vec3 vN;
      void main(){float y=(vP.y+.18)/.36; if(y>uLev) discard;
        float sw=sin(vP.x*9.+sin(vP.z*7.+uT*1.3)*2.2+uT*1.7)*.5+.5; float k=mix(step(.0,vP.x)*1.,sw,uMix);
        vec3 blu=vec3(.15,.6,1.4),amb=vec3(1.5,.75,.12); vec3 c=mix(blu,amb,k);
        float fr=pow(1.-abs(vN.z),2.)*.6; float top=smoothstep(uLev-.06,uLev,y)*.8;
        gl_FragColor=vec4(c*(.75+fr+top)*uGlow,.82);}`,
  });
  const liq = new THREE.Mesh(rbox(0.85, 0.36, 1.15, 0.08), liqM); liq.position.copy(TK); liq.renderOrder = 8; carG.add(liq);
  // battery pack under the floor (glows on "listrik")
  const battM = new THREE.MeshStandardMaterial({ color: 0x0a2a3a, emissive: 0x00c8ff, emissiveIntensity: 0, metalness: 0.5, roughness: 0.3 });
  const batt = new THREE.Mesh(rbox(1.9, 0.12, 1.3, 0.04), battM); batt.position.set(0.25, 0.42, 0); carG.add(batt);
  for (let i = 0; i < 6; i++) { const ln = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.13, 1.2), new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.6, toneMapped: false })); ln.position.set(-0.6 + i * 0.34, 0.42, 0); carG.add(ln); }
  // filler neck + two-colour streams from the pump
  const FILL = v3(-1.78, 0.98, 0.9);
  const neck = new THREE.CatmullRomCurve3([FILL, v3(-1.7, 0.95, 0.6), v3(-1.45, 0.86, 0.35), TK.clone().add(v3(-0.2, 0.2, 0.2))]);
  const flowU = { uT: { value: 0 }, uOn: { value: 0 } };
  const flowM = new THREE.ShaderMaterial({
    uniforms: flowU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: "varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform float uT,uOn;varying vec2 vU;void main(){float a=fract(vU.x*6.-uT*1.6);float b=step(.5,fract(vU.x*3.-uT*.8));vec3 c=mix(vec3(.2,.7,1.6),vec3(1.6,.8,.15),b);float e=1.-abs(vU.y-.5)*2.;gl_FragColor=vec4(c*(.5+.8*smoothstep(.0,.25,a)*smoothstep(.6,.3,a))*uOn*e,1.);}",
  });
  carG.add(new THREE.Mesh(new THREE.TubeGeometry(neck, 40, 0.045, 10), flowM));
  // pump
  const PUMP = v3(-3.15, 0, 1.75);
  const pumpG = new THREE.Group(); pumpG.position.copy(PUMP); pumpG.rotation.y = 0.55; carG.add(pumpG);
  const pumpBody = new THREE.Mesh(rbox(0.8, 1.9, 0.5, 0.08), new THREE.MeshPhysicalMaterial({ color: 0x0e1626, metalness: 0.6, roughness: 0.25, clearcoat: 1 })); pumpBody.position.y = 0.95; pumpG.add(pumpBody);
  const scrTex = canvasTex(512, 640, (c, w, h) => {
    c.fillStyle = "#02060d"; c.fillRect(0, 0, w, h);
    c.strokeStyle = "#00f5d4"; c.lineWidth = 6; c.strokeRect(10, 10, w - 20, h - 20);
    c.fillStyle = "#ffffff"; c.font = '800 104px "Space Grotesk", Arial'; c.textAlign = "center"; c.fillText("AUDIRA", w / 2, 140);
    c.fillStyle = "#00f5d4"; c.font = '600 34px "JetBrains Mono", monospace'; c.fillText("FUEL LAB", w / 2, 196);
    c.fillStyle = "#38bdf8"; c.fillRect(46, 260, 190, 150); c.fillStyle = "#f59e0b"; c.fillRect(276, 260, 190, 150);
    c.fillStyle = "#02060d"; c.font = '800 46px "Space Grotesk", Arial'; c.fillText("CH₃OH", 141, 352); c.fillText("BENSIN", 371, 352);
    c.fillStyle = "#ffffff"; c.font = '600 40px "JetBrains Mono", monospace'; c.fillText("METANOL + BENSIN", w / 2, 500); c.fillStyle = "#00f5d4"; c.fillText("1 TANGKI", w / 2, 570);
  });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.78), new THREE.MeshBasicMaterial({ map: scrTex, toneMapped: false, color: new THREE.Color(1.25, 1.25, 1.25) }));
  scr.position.set(0, 1.42, 0.262); pumpG.add(scr);
  for (const [x, col] of [[-0.2, 0x38bdf8], [0.2, 0xf59e0b]]) { const hol = new THREE.Mesh(rbox(0.16, 0.26, 0.12, 0.04), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.5, roughness: 0.3 })); hol.position.set(x, 0.75, 0.3); pumpG.add(hol); }
  pumpG.updateMatrixWorld(true);
  const hoseM = new THREE.MeshPhysicalMaterial({ color: 0x111827, roughness: 0.45, clearcoat: 0.6 });
  for (const [x, col] of [[-0.2, 0x38bdf8], [0.2, 0xf59e0b]]) {
    const a = pumpG.localToWorld(v3(x, 0.75, 0.36));
    const c = new THREE.CatmullRomCurve3([a, a.clone().add(v3(0.15, -0.45, 0.25)), v3(-2.3, 0.35, 1.45 + x * 0.3), v3(-1.95, 0.95, 1.12 + x * 0.12), FILL.clone().add(v3(-0.05, 0.02, 0.12))]);
    carG.add(new THREE.Mesh(new THREE.TubeGeometry(c, 60, 0.035, 10), hoseM));
    const band = new THREE.Mesh(new THREE.TubeGeometry(c, 60, 0.038, 10, false), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.0, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false }));
    band.userData.flow = true; carG.add(band);
  }
  const nozzle = new THREE.Mesh(rbox(0.12, 0.12, 0.3, 0.04), new THREE.MeshStandardMaterial({ color: 0xcfd8e3, metalness: 0.9, roughness: 0.2 }));
  nozzle.position.copy(FILL).add(v3(-0.04, 0.03, 0.14)); nozzle.rotation.x = 0.4; carG.add(nozzle);
  const fillGlow = glowSprite(0x7dd3fc, 0.9);
  // "listrik" pulse ring under car
  const ringM = new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(2.6, 2.75, 96), ringM); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; carG.add(ring);
  // car-zone molecules: methanol + gasoline chains orbit the car in s8
  // (drawn through the batch in draw())

  // =====================================================================  ZONE 2: molecule soup in the tank (ZM)
  const HERO = v3(0, 0.2, ZM);
  const heroLab = { C: textSprite("C", "#cbd5e1"), O: textSprite("O", "#ff6b81"), H: textSprite("H", "#ffffff") };
  for (const k in heroLab) { heroLab[k].scale.set(1.6, 0.5, 1); S.add(heroLab[k]); }
  const heroGlow = [glowSprite(0x9fb4d0, 2.2), glowSprite(0xff3355, 2.2), ...[0, 1, 2, 3].map(() => glowSprite(0xffffff, 1.5))];
  const SOUP = []; { const R = mulberry(41); for (let i = 0; i < 46; i++) SOUP.push({ oc: i % 4 === 3, p: v3((R() - 0.5) * 22, (R() - 0.5) * 16, ZM - 4 - R() * 16), r: [R() * 6, R() * 6, R() * 6], w: [R() - 0.5, R() - 0.5, R() - 0.5], sd: R() * 50 }); }
  // sensor ring on a fuel line
  const SEN = v3(4.2, -3.2, ZM - 3);
  const senG = new THREE.Group(); senG.position.copy(SEN); S.add(senG);
  const chrome = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 1, roughness: 0.14 });
  const senRing = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.28, 24, 64), chrome); senRing.rotation.y = Math.PI / 2; senG.add(senRing);
  const senBand = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.3, 8, 64, Math.PI * 0.5), new THREE.MeshBasicMaterial({ color: 0x00f5d4, toneMapped: false, transparent: true, opacity: 0 })); senBand.rotation.y = Math.PI / 2; senG.add(senBand);
  const lineM = new THREE.MeshPhysicalMaterial({ color: 0x9fdcff, transparent: true, opacity: 0.12, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide });
  const fuelLine = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 18, 40, 1, true), lineM); fuelLine.rotation.z = Math.PI / 2; senG.add(fuelLine);
  const arcs = []; for (let i = 0; i < 6; i++) { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(12 * 3), 3)); const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: new THREE.Color(0.6, 2.4, 2.2), transparent: true, opacity: 0, toneMapped: false, blending: THREE.AdditiveBlending })); senG.add(l); arcs.push(l); }
  const ecuTex = canvasTex(512, 200, (c, w, h) => { c.fillStyle = "#06121f"; c.fillRect(0, 0, w, h); c.strokeStyle = "#00f5d4"; c.lineWidth = 5; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = "#00f5d4"; c.font = '700 56px "JetBrains Mono", monospace'; c.textAlign = "center"; c.fillText("ECU", w / 2, 92); c.fillStyle = "#cbd5e1"; c.font = '500 32px "JetBrains Mono", monospace'; c.fillText("semprotan + busi", w / 2, 150); });
  const ecu = new THREE.Group();
  ecu.add(new THREE.Mesh(rbox(2.4, 1.0, 0.4, 0.08), new THREE.MeshStandardMaterial({ color: 0x0b1626, metalness: 0.6, roughness: 0.3 })));
  { const sc = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.86), new THREE.MeshBasicMaterial({ map: ecuTex, toneMapped: false })); sc.position.z = 0.21; ecu.add(sc); }
  ecu.position.copy(SEN).add(v3(-0.4, 2.6, -1.0)); S.add(ecu);
  const wireU = { uT: { value: 0 }, uOn: { value: 0 } };
  const wire = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([SEN.clone().add(v3(0, 1.4, 0)), SEN.clone().add(v3(-0.1, 1.9, -0.4)), ecu.position.clone().add(v3(0, -0.5, 0))]), 30, 0.05, 8), new THREE.ShaderMaterial({ uniforms: wireU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexShader: "varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: "uniform float uT,uOn;varying vec2 vU;void main(){float a=smoothstep(.3,0.,abs(fract(vU.x*2.-uT*1.5)-.5));gl_FragColor=vec4(vec3(.2,2.2,2.)*(.25+a)*uOn,1.);}" }));
  S.add(wire);

  // =====================================================================  ZONE 3: energy cubes + glass cylinder (ZC)
  const cubeY = 5.0;
  const cubeGlassM = new THREE.MeshPhysicalMaterial({ color: 0xd8f3ff, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.16, depthWrite: false, clearcoat: 1, envMapIntensity: 1.6 });
  const mkCube = (x, col, label) => {
    const g = new THREE.Group(); g.position.set(x, cubeY, ZC); S.add(g);
    const gl = new THREE.Mesh(rbox(2.2, 2.2, 2.2, 0.18), cubeGlassM); gl.renderOrder = 9; g.add(gl);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.2, 2.2, 2.2)), new THREE.LineBasicMaterial({ color: 0xbfeaff, transparent: true, opacity: 0.35 })); g.add(e);
    const en = new THREE.Mesh(rbox(1.9, 1.9, 1.9, 0.12), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85, toneMapped: false, depthWrite: false })); en.renderOrder = 8; g.add(en);
    const lab = textSprite(label, "#ffffff", 64, "700"); lab.scale.set(2.6, 0.81, 1); lab.position.set(0, -1.65, 0); g.add(lab);
    const lit = textSprite("1 LITER", "#9fb4d0", 48, "500"); lit.scale.set(2.0, 0.62, 1); lit.position.set(0, 1.55, 0); g.add(lit);
    return { g, en };
  };
  const cubeB = mkCube(-1.65, new THREE.Color(0.95, 0.45, 0.06), "BENSIN");
  const cubeM = mkCube(1.65, new THREE.Color(0.08, 0.42, 1.0), "METANOL");
  const enSparks = []; { const R = mulberry(9); for (let i = 0; i < 40; i++) enSparks.push({ c: i % 2, ph: R() * 10, x: (R() - 0.5) * 1.6, z: (R() - 0.5) * 1.6, sp: 0.4 + R() * 0.6 }); }
  const sparkPts = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(40 * 3), 3)), new THREE.PointsMaterial({ size: 0.18, map: DOT, color: new THREE.Color(2, 2, 2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  sparkPts.frustumCulled = false; S.add(sparkPts);
  // cylinder
  const CY = v3(0, -1.0, ZC), BORE = 1.6, HEAD = 1.5;
  const cylG = new THREE.Group(); cylG.position.copy(CY); S.add(cylG);
  const glassM = new THREE.MeshPhysicalMaterial({ color: 0x9fd8ff, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.07, depthWrite: false, clearcoat: 1, envMapIntensity: 0.7, side: THREE.DoubleSide });
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(BORE, BORE, 5.6, 64, 1, true), glassM); tube.position.y = -1.3; tube.renderOrder = 10; cylG.add(tube);
  const steel = new THREE.MeshStandardMaterial({ color: 0xb9c4d2, metalness: 0.95, roughness: 0.22 });
  for (const y of [HEAD + 0.02, -4.1]) { const rg = new THREE.Mesh(new THREE.TorusGeometry(BORE + 0.05, 0.09, 16, 72), steel); rg.rotation.x = Math.PI / 2; rg.position.y = y; cylG.add(rg); }
  const head = new THREE.Mesh(rcyl(BORE + 0.25, 0.7, 0.12, 64), new THREE.MeshPhysicalMaterial({ color: 0x1a2433, metalness: 0.85, roughness: 0.28, clearcoat: 0.5 })); head.position.y = HEAD + 0.35; cylG.add(head);
  const piston = new THREE.Group(); cylG.add(piston);
  const pistonM = new THREE.MeshStandardMaterial({ color: 0xc8d2de, metalness: 0.92, roughness: 0.26 });
  const pTop = new THREE.Mesh(rcyl(BORE - 0.04, 1.0, 0.1, 64), pistonM); pTop.position.y = -0.5; piston.add(pTop);
  for (const y of [-0.22, -0.4]) { const rg = new THREE.Mesh(new THREE.TorusGeometry(BORE - 0.03, 0.025, 8, 64), new THREE.MeshStandardMaterial({ color: 0x444c58, metalness: 0.9, roughness: 0.35 })); rg.rotation.x = Math.PI / 2; rg.position.y = y; piston.add(rg); }
  const rod = new THREE.Mesh(rcyl(0.28, 3.0, 0.08, 24), pistonM); rod.position.y = -2.4; piston.add(rod);
  // injector (left, angled) and spark plug (right)
  const inj = new THREE.Group(); inj.position.set(-0.7, HEAD + 0.6, 0); inj.rotation.z = -0.32; cylG.add(inj);
  const injB = new THREE.Mesh(rcyl(0.2, 1.6, 0.06, 24), chrome); injB.position.y = 0.6; inj.add(injB);
  const injT = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.05, 0.4, 16), chrome); injT.position.y = -0.35; inj.add(injT);
  const injCap = new THREE.Mesh(rcyl(0.26, 0.35, 0.06, 24), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })); injCap.position.y = 1.45; inj.add(injCap);
  const plug = new THREE.Group(); plug.position.set(0.75, HEAD + 0.6, 0); cylG.add(plug);
  const cer = new THREE.Mesh(rcyl(0.17, 1.2, 0.06, 24), new THREE.MeshPhysicalMaterial({ color: 0xf4f1ea, roughness: 0.25, clearcoat: 1 })); cer.position.y = 0.55; plug.add(cer);
  const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.25, 6), steel); hex.position.y = 0.0; plug.add(hex);
  const elec = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.45, 8), steel); elec.position.y = -0.5; plug.add(elec);
  const sparkGlow = glowSprite(0xbfe9ff, 1.6), flashGlow = glowSprite(0xffa040, 6);
  const sparkLight = new THREE.PointLight(0xffb060, 0, 14, 1.4); S.add(sparkLight);
  // chamber volume tint (cool blue / hot orange)
  const volU = { uC: { value: new THREE.Color(0, 0, 0) }, uA: { value: 0 } };
  const vol = new THREE.Mesh(new THREE.CylinderGeometry(BORE - 0.06, BORE - 0.06, 1, 48, 1, true), new THREE.ShaderMaterial({ uniforms: volU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: "varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}",
    fragmentShader: "uniform vec3 uC;uniform float uA;varying vec3 vN;varying vec3 vV;void main(){float f=1.-abs(dot(normalize(vN),normalize(vV)));gl_FragColor=vec4(uC*uA*(.25+.9*f*f),1.);}" }));
  vol.renderOrder = 11; cylG.add(vol);
  // spray droplets
  const NSP = 420, spR = mulberry(77), SPD = Array.from({ length: NSP }, () => ({ ph: spR(), a: spR() * Math.PI * 2, rr: spR(), sp: 0.7 + spR() * 0.6 }));
  const sprayG = new THREE.BufferGeometry(); sprayG.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NSP * 3), 3)); sprayG.setAttribute("color", new THREE.BufferAttribute(new Float32Array(NSP * 3), 3));
  const spray = new THREE.Points(sprayG, new THREE.PointsMaterial({ size: 0.11, map: DOT, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  spray.frustumCulled = false; S.add(spray);
  // frost flakes (cold start)
  const NFR = 180, frR = mulberry(5), FRD = Array.from({ length: NFR }, () => ({ x: (frR() - 0.5) * 10, y: frR() * 12, z: (frR() - 0.5) * 6, sp: 0.3 + frR() * 0.5, ph: frR() * 7 }));
  const frost = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(NFR * 3), 3)), new THREE.PointsMaterial({ size: 0.14, map: DOT, color: new THREE.Color(1.2, 1.6, 2.2), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  frost.frustumCulled = false; S.add(frost);
  // reaction: 2 x (2 CH3OH + 3 O2 -> 2 CO2 + 4 H2O)
  const RX = []; // each atom: el, reactant mol index+local, product mol index+local
  const rMols = [], pMols = [];
  { const R = mulberry(64);
    for (let gI = 0; gI < 2; gI++) {
      const base = rMols.length, pbase = pMols.length;
      for (let k = 0; k < 2; k++) rMols.push({ T: T_ME, p: v3((R() - 0.5) * 2.2, R(), (R() - 0.5) * 1.6), r: [R() * 6, R() * 6, R() * 6], sd: R() * 30 });
      for (let k = 0; k < 3; k++) rMols.push({ T: T_O2, p: v3((R() - 0.5) * 2.4, R(), (R() - 0.5) * 1.8), r: [R() * 6, R() * 6, R() * 6], sd: R() * 30 });
      for (let k = 0; k < 2; k++) pMols.push({ T: T_CO2, p: v3((R() - 0.5) * 2.4, R(), (R() - 0.5) * 1.6), r: [R() * 6, R() * 6, R() * 6], sd: R() * 30 });
      for (let k = 0; k < 4; k++) pMols.push({ T: T_H2O, p: v3((R() - 0.5) * 2.4, R(), (R() - 0.5) * 1.6), r: [R() * 6, R() * 6, R() * 6], sd: R() * 30 });
      // atom bookkeeping
      const pool = { C: [], O: [], H: [] };
      for (let m = base; m < rMols.length; m++) rMols[m].T.a.forEach((a, i) => pool[a[0]].push([m, i]));
      const used = { C: 0, O: 0, H: 0 };
      for (let m = pbase; m < pMols.length; m++) pMols[m].T.a.forEach((a, i) => { const src = pool[a[0]][used[a[0]]++]; RX.push({ el: a[0], rm: src[0], ri: src[1], pm: m, pi: i }); });
    }
  }
  const RPOS = Array.from({ length: 80 }, () => v3(0, 0, 0)), PPOS = Array.from({ length: 80 }, () => v3(0, 0, 0));

  // =====================================================================  ZONE 4: fuel-line joint (ZS)
  const segG = new THREE.Group(); segG.position.set(0, 0, ZS); S.add(segG);
  const pipeM = new THREE.MeshPhysicalMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.13, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide, clearcoat: 1 });
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 22, 48, 1, true), pipeM); pipe.rotation.z = Math.PI / 2; pipe.renderOrder = 10; segG.add(pipe);
  const pitTex = canvasTex(512, 256, (c, w, h) => { const R = mulberry(12); c.fillStyle = "#808080"; c.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { const x = R() * w, y = R() * h, rr = 2 + R() * 9; const g = c.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, "#1a1410"); g.addColorStop(0.7, "#4a4038"); g.addColorStop(1, "rgba(128,128,128,0)"); c.fillStyle = g; c.beginPath(); c.arc(x, y, rr, 0, 7); c.fill(); } });
  const alM = new THREE.MeshStandardMaterial({ color: 0x8d96a1, metalness: 0.7, roughness: 0.5, envMapIntensity: 0.4 });
  const pitM = new THREE.MeshStandardMaterial({ color: 0x5a616b, map: pitTex, transparent: true, opacity: 0, metalness: 0.2, roughness: 0.9, depthWrite: false });
  const oldParts = new THREE.Group(), newParts = new THREE.Group(); segG.add(oldParts, newParts);
  const collar = new THREE.Mesh(rcyl(1.45, 2.0, 0.14, 64), alM); collar.rotation.z = Math.PI / 2; collar.position.x = -1.3; oldParts.add(collar);
  const pits = new THREE.Mesh(new THREE.CylinderGeometry(1.465, 1.465, 1.7, 64, 1, true), pitM); pits.rotation.z = Math.PI / 2; pits.position.x = -1.3; oldParts.add(pits);
  const rubM = new THREE.MeshPhysicalMaterial({ color: 0x15171c, roughness: 0.62, clearcoat: 0.2, emissive: 0x000000 });
  const oring = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.2, 24, 72), rubM); oring.rotation.y = Math.PI / 2; oring.position.x = 0.4; oldParts.add(oring);
  const ssM = new THREE.MeshStandardMaterial({ color: 0x8f9aa6, metalness: 1, roughness: 0.24, envMapIntensity: 0.35 });
  const collar2 = new THREE.Mesh(rcyl(1.45, 2.0, 0.14, 64), ssM); collar2.rotation.z = Math.PI / 2; collar2.position.x = -1.3; newParts.add(collar2);
  const seal2 = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.2, 24, 72), new THREE.MeshPhysicalMaterial({ color: 0x0f766e, roughness: 0.3, clearcoat: 1, emissive: 0x00f5d4, emissiveIntensity: 0.25 })); seal2.rotation.y = Math.PI / 2; seal2.position.x = 0.4; newParts.add(seal2);
  const warnGlow = glowSprite(0xff3355, 3.5), okGlow = glowSprite(0x2dd4bf, 4.5);
  const segLab = { al: textSprite("ALUMINIUM", "#e2e8f0", 60, "700", "rgba(2,6,15,.6)"), rub: textSprite("KARET SEAL", "#e2e8f0", 60, "700", "rgba(2,6,15,.6)"), ss: textSprite("BAJA TAHAN KARAT", "#7ff5e0", 48, "700", "rgba(2,6,15,.6)"), sk: textSprite("SEAL KHUSUS", "#7ff5e0", 56, "700", "rgba(2,6,15,.6)") };
  for (const k in segLab) { segLab[k].scale.set(2.8, 0.88, 1); S.add(segLab[k]); }
  const SEGM = []; { const R = mulberry(3); for (let i = 0; i < 18; i++) SEGM.push({ x: R() * 22, y: (R() - 0.5) * 1.1, z: (R() - 0.5) * 1.1, r: [R() * 6, R() * 6, R() * 6], sd: R() * 20, sp: 0.8 + R() * 0.6 }); }

  // =====================================================================  ZONE 5: molecule factory (ZF)
  const facG = new THREE.Group(); facG.position.set(0, -2.2, ZF); S.add(facG);
  const slab = new THREE.Mesh(rbox(12, 0.5, 7, 0.18), new THREE.MeshPhysicalMaterial({ color: 0x0b1626, metalness: 0.6, roughness: 0.3, clearcoat: 1 })); facG.add(slab);
  const slabTop = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 6.6), new THREE.MeshStandardMaterial({ map: floorTex, transparent: true, opacity: 0.8, roughness: 0.3, metalness: 0.6 })); slabTop.rotation.x = -Math.PI / 2; slabTop.position.y = 0.26; facG.add(slabTop);
  const mkReactor = (x, col, emi) => {
    const g = new THREE.Group(); g.position.set(x, 0.25, -0.6); facG.add(g);
    const tank = new THREE.Mesh(rcyl(1.0, 2.6, 0.4, 48), new THREE.MeshPhysicalMaterial({ color: col, metalness: 0.7, roughness: 0.25, clearcoat: 1, emissive: emi, emissiveIntensity: 0.0 })); tank.position.y = 1.3; g.add(tank);
    const band = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.06, 10, 64), new THREE.MeshBasicMaterial({ color: emi, toneMapped: false })); band.rotation.x = Math.PI / 2; band.position.y = 1.6; g.add(band);
    const stack = new THREE.Mesh(rcyl(0.22, 1.4, 0.06, 20), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 })); stack.position.set(0.55, 3.1, -0.3); g.add(stack);
    return { g, tank, band };
  };
  const reCoal = mkReactor(-3.2, 0x3b3f46, 0x9ca3af), reGreen = mkReactor(3.2, 0x14532d, 0x22c55e);
  const beltM = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5, metalness: 0.4 });
  for (const x of [-3.2, 3.2]) { const b = new THREE.Mesh(rbox(1.0, 0.12, 3.2, 0.05), beltM); b.position.set(x, 0.38, 1.9); facG.add(b); }
  const outBelt = new THREE.Mesh(rbox(5.4, 0.12, 0.9, 0.05), beltM); outBelt.position.set(0, 0.38, 0.9); facG.add(outBelt);
  const coalM = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.85, metalness: 0.1 });
  const coal = []; { const R = mulberry(8); for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22 + R() * 0.1, 0), coalM); m.userData = { ph: i / 9, rx: R() * 6 }; facG.add(m); coal.push(m); } }
  const smokeR = mulberry(66), SMK = Array.from({ length: 70 }, () => ({ ph: smokeR(), x: (smokeR() - 0.5) * 0.5, z: (smokeR() - 0.5) * 0.5, s: 0.6 + smokeR() }));
  const smoke = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(70 * 3), 3)), new THREE.PointsMaterial({ size: 1.4, map: DOT, color: 0x6b7280, transparent: true, opacity: 0, depthWrite: false }));
  smoke.frustumCulled = false; S.add(smoke);
  const panelTex = canvasTex(512, 256, (c, w, h) => { c.fillStyle = "#04130b"; c.fillRect(0, 0, w, h); c.strokeStyle = "#22c55e"; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16); c.strokeStyle = "rgba(34,197,94,.5)"; c.lineWidth = 3; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(i * w / 4, 8); c.lineTo(i * w / 4, h - 8); c.stroke(); } c.beginPath(); c.moveTo(8, h / 2); c.lineTo(w - 8, h / 2); c.stroke(); });
  const solar = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.9), new THREE.MeshStandardMaterial({ map: panelTex, emissive: 0xffffff, emissiveMap: panelTex, emissiveIntensity: 0.6, metalness: 0.4, roughness: 0.2, side: THREE.DoubleSide }));
  solar.position.set(4.9, 1.2, 1.6); solar.rotation.set(-0.9, -0.4, 0); facG.add(solar);
  const signTex = canvasTex(1024, 220, (c, w, h) => { c.fillStyle = "#02060d"; c.fillRect(0, 0, w, h); c.strokeStyle = "#00f5d4"; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = "#ffffff"; c.font = '800 112px "Space Grotesk", Arial'; c.textBaseline = "middle"; c.fillText("AUDIRA", 44, h / 2 + 6); c.fillStyle = "#00f5d4"; c.font = '600 50px "JetBrains Mono", monospace'; c.fillText("MOLECULE LAB", 540, h / 2 + 4); });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.95), new THREE.MeshBasicMaterial({ map: signTex, toneMapped: false, color: new THREE.Color(1.15, 1.15, 1.15) })); sign.position.set(0, 3.9, -2.4); facG.add(sign);
  const drumTex = canvasTex(1024, 256, (c, w, h) => { c.fillStyle = "#b45309"; c.fillRect(0, 0, w, h); c.fillStyle = "rgba(0,0,0,.25)"; c.fillRect(0, 40, w, 10); c.fillRect(0, h - 50, w, 10); c.fillStyle = "#fff7ed"; c.font = '800 96px "Space Grotesk", Arial'; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("BIODIESEL", w * 0.25, h / 2); c.fillText("BIODIESEL", w * 0.75, h / 2); });
  const drum = new THREE.Group();
  drum.add(new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.7, 48, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffff, map: drumTex, metalness: 0.4, roughness: 0.4, envMapIntensity: 0.5 })));
  for (const y of [0.85, -0.85]) { const cp = new THREE.Mesh(new THREE.CylinderGeometry(0.77, 0.77, 0.06, 48), new THREE.MeshStandardMaterial({ color: 0x7c2d12, metalness: 0.6, roughness: 0.35 })); cp.position.y = y; drum.add(cp); }
  drum.position.set(0, 1.12, 2.3); facG.add(drum);
  const facLab = { coal: textSprite("BATU BARA", "#cbd5e1", 60, "700", "rgba(2,6,15,.6)"), green: textSprite("CO₂ + H₂ HIJAU", "#86efac", 52, "700", "rgba(2,6,15,.6)") };
  for (const k in facLab) { facLab[k].scale.set(2.8, 0.88, 1); S.add(facLab[k]); }
  facG.updateMatrixWorld(true);
  const FW = (x, y, z) => facG.localToWorld(v3(x, y, z));

  // ---------- post: NaN guard -> bloom -> output (ACES) -> teal-orange grade ----------
  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  const QV = "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}";
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } }, vertexShader: QV,
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);bvec4 n=isnan(c);bvec4 f=isinf(c);if(any(n)||any(f))c=vec4(0.,0.,0.,1.);gl_FragColor=clamp(c,0.,40.);}" })));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.45, 0.5, 0.85);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());
  const gradeU = { tDiffuse: { value: null }, uFlash: { value: 0 } };
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: gradeU, vertexShader: QV,
    fragmentShader: `uniform sampler2D tDiffuse;uniform float uFlash;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=dot(c,vec3(.2126,.7152,.0722));
      vec3 sh=vec3(.86,1.02,1.1),hi=vec3(1.1,1.0,.86);c*=mix(sh,hi,smoothstep(.08,.75,l));c=mix(vec3(l),c,1.12);c=(c-.5)*1.1+.5;c+=uFlash*vec3(.55,.8,1.);gl_FragColor=vec4(clamp(c,0.,1.),1.);}` })));

  // ---------- camera shots (each a smooth track inside its zone), dives blend between zones ----------
  const camCar1 = track([
    [0, -6.2, 2.1, 11.2, -1.7, 0.85, 0.2],
    [E.minum, -6.0, 2.0, 10.6, -1.6, 0.85, 0.2],
    [s.s1e, -3.6, 1.6, 7.4, -1.4, 0.7, 0.2],
    [E.listrik, 3.6, 2.6, 11.6, 0.0, 0.85, 0],
    [E.campur, 6.4, 2.0, 9.6, 0.2, 0.85, 0],
    [E.pertama, 2.0, 3.2, 11.4, -0.3, 0.9, 0],
    [s.s2e - 0.6, -2.0, 1.7, 7.0, -1.2, 0.7, 0],
    [s.s3, -1.25, 0.95, 3.2, -1.15, 0.62, 0],
  ]);
  const camMol = track([
    [s.s3 - 0.4, 0.4, 1.4, ZM + 20, 0, 0.9, ZM],
    [E.alkohol, 0.6, 1.4, ZM + 16.5, 0, 1.0, ZM],
    [E.hidrogen, 3.0, 1.8, ZM + 15.5, 0, 1.0, ZM],
    [E.cair + 0.6, -1.5, 3.0, ZM + 22, 0, 0.8, ZM - 4],
    [E.campur3, -3.5, 2.2, ZM + 21, 0.5, 0.4, ZM - 5],
    [E.sensor + 0.4, 9.0, -0.4, ZM + 9.0, 3.8, -1.9, ZM - 3],
    [s.s3e, 9.8, 0.2, ZM + 8.4, 3.6, -1.7, ZM - 3],
  ]);
  const camCyl = track([
    [s.s4 - 0.3, 0.3, cubeY + 2.0, ZC + 17, 0, cubeY + 0.9, ZC],
    [E.separuh, 1.2, cubeY + 1.7, ZC + 16, 0, cubeY + 0.9, ZC],
    [E.injektor + 0.3, 2.6, 2.0, ZC + 15, -0.3, 0.6, ZC],
    [E.injeksi, 1.4, 1.4, ZC + 14, -0.2, 0.4, ZC],
    [s.s4e, -1.8, 1.2, ZC + 14.5, 0, 0.3, ZC],
    [E.piston, -1.0, 0.8, ZC + 15, 0, 0.2, ZC],
    [E.menguap, 1.4, 0.9, ZC + 14, 0, 0.3, ZC],
    [E.busi, 0.3, 0.9, ZC + 13.5, 0, 0.4, ZC],
    [E.air, -1.6, 1.2, ZC + 15, 0, 0.3, ZC],
    [s.s5e, -0.6, 1.0, ZC + 16, 0, 0.2, ZC],
  ]);
  const camSeal = track([
    [s.s6 - 0.3, -7.0, 3.2, ZS + 15, -0.6, 1.6, ZS],
    [E.serang, -5.0, 2.4, ZS + 12.5, -1.0, 1.5, ZS],
    [E.bengkak, 3.5, 2.2, ZS + 12, 0.3, 1.5, ZS],
    [E.baja + 0.6, 0.8, 3.0, ZS + 14, -0.4, 1.6, ZS],
    [s.s6e, -2.5, 2.6, ZS + 14, -0.4, 1.5, ZS],
  ]);
  const camFac = track([
    [s.s7 - 0.3, 0, 5.5, ZF + 21, 0, 1.2, ZF],
    [E.banyak, -1.6, 4.2, ZF + 18, -1.2, 0.8, ZF],
    [E.batu, -2.4, 3.4, ZF + 16.5, -2.0, 0.5, ZF],
    [E.baru + 0.4, 3.0, 3.6, ZF + 15.5, 2.4, 0.6, ZF],
    [E.hidro7, 3.4, 3.2, ZF + 15, 2.6, 0.5, ZF],
    [E.indo + 0.5, 0.4, 3.2, ZF + 18, 0, 0.6, ZF + 1],
    [s.s7e, -0.8, 2.8, ZF + 17, 0, 0.5, ZF + 1.4],
  ]);
  const camCar2 = track([
    [s.s8, -1.4, 1.5, 6.0, -1.15, 0.6, 0],
    [s.s8 + 1.4, -3.0, 2.2, 9.0, -0.6, 0.8, 0],
    [E.kimia, 4.0, 3.0, 12.5, 0, 0.9, 0],
    [s.dur, 6.5, 3.4, 13.5, 0.2, 0.9, 0],
  ]);
  const SHOTS = [[camCar1, s.s3, 0.25, 0.75, 0], [camMol, s.s4, 0.45, 0.55, 5], [camCyl, s.s6, 0.45, 0.55, 6], [camSeal, s.s7, 0.45, 0.55, 5], [camFac, s.s8, 0.25, 1.15, 3], [camCar2, 1e9, 0, 0, 0]];
  const pa = v3(0, 0, 0), pb = v3(0, 0, 0), la = v3(0, 0, 0), lb = v3(0, 0, 0);
  function camAt(t) {
    let i = 0; while (t > SHOTS[i][1] + SHOTS[i][3]) i++;
    const c = SHOTS[i][0](t); pa.set(c[0], c[1], c[2]); la.set(c[3], c[4], c[5]);
    let dive = 0;
    if (i > 0) { const [, T, w1, w2] = SHOTS[i - 1]; if (t < T + w2) { const u = clamp01((t - (T - w1)) / (w1 + w2)); const k = u * u * (3 - 2 * u); const c0 = SHOTS[i - 1][0](t); pb.set(c0[0], c0[1], c0[2]); lb.set(c0[3], c0[4], c0[5]); pa.lerpVectors(pb, pa, k); la.lerpVectors(lb, la, k); dive = Math.sin(Math.PI * u); } }
    if (i < SHOTS.length - 1) { const [, T, w1, w2] = SHOTS[i]; if (t > T - w1) { const u = clamp01((t - (T - w1)) / (w1 + w2)); const k = u * u * (3 - 2 * u); const c1 = SHOTS[i + 1][0](t); pb.set(c1[0], c1[1], c1[2]); lb.set(c1[3], c1[4], c1[5]); pa.lerp(pb, k); la.lerp(lb, k); dive = Math.sin(Math.PI * u); pa.y += SHOTS[i][4] * dive; la.y += SHOTS[i][4] * dive * 0.6; } }
    return dive;
  }

  // ================================================================ draw
  return function draw(t) {
    if (!(t >= 0)) t = 0;
    for (const k in BATCH) BATCH[k].n = 0;
    const dive = camAt(t);
    if (t > s.s8 - 0.3 && t < s.s8 + 1.4) { const f = clamp01((pa.z - 1) / 5); tv.copy(pa).add(v3(0, -0.4, -10)); la.lerpVectors(tv, la, f); }
    cam.position.copy(pa);
    // Brownian camera float (micro-world)
    cam.position.x += 0.04 * Math.sin(t * 0.9); cam.position.y += 0.035 * Math.sin(t * 0.7 + 1.3);
    cam.lookAt(la);
    cam.fov = 38 + 10 * dive; cam.updateProjectionMatrix();
    rig.position.copy(cam.position); rig.quaternion.copy(cam.quaternion);
    gradeU.uFlash.value = 0.08 * dive * dive;
    const cz = cam.position.z;
    const near = (z, d = 45) => Math.abs(cz - z) < d;

    // ---------- zone 1 ----------
    const inCar = cz > -40;
    carG.visible = inCar; floor.visible = cz > -4;
    if (inCar) {
      const t8 = t >= s.s8;
      liqU.uT.value = t;
      // level rises while filling in s1-s2; full in s8
      const lev = t8 ? 0.9 : 0.25 + 0.6 * ramp(t, 0.3, s.s2e);
      liqU.uLev.value = lev;
      liqU.uMix.value = t8 ? 1 : ramp(t, E.campur - 0.4, E.campur + 1.0) + (t < E.tangki ? 0 : 0.35 * ramp(t, E.tangki, E.tangki + 1.5)) * (1 - ramp(t, E.campur - 0.4, E.campur + 1.0));
      liqU.uGlow.value = 1 + 0.5 * win(t, E.metanol, E.bensin + 0.6, 0.3, 0.3);
      flowU.uT.value = t; flowU.uOn.value = t8 ? 0 : 1 - ramp(t, s.s2e - 1.2, s.s2e);
      carG.traverse((m) => { if (m.userData.flow) m.material.opacity = flowU.uOn.value * (0.35 + 0.25 * Math.sin(t * 6)); });
      fillGlow.visible = true; fillGlow.position.copy(FILL); fillGlow.material.opacity = 0.7 * flowU.uOn.value;
      const el = t8 ? 0.4 : win(t, E.listrik - 0.1, E.metanol + 0.3, 0.25, 0.4);
      battM.emissiveIntensity = 1.6 * el;
      ringM.opacity = el * (1 - ((t * 0.9) % 1)) * 0.8; ring.scale.setScalar(0.6 + ((t * 0.9) % 1) * 0.7);
      for (const w of spins) w.rotation.z = 0;
      // s8: molecules orbit the car (methanol blue side, gasoline chains)
      if (t8) {
        const k = ramp(t, s.s8 + 0.8, s.s8 + 2.2);
        for (let i = 0; i < 18; i++) {
          const a = i / 18 * Math.PI * 2 + t * 0.25, rr = 3.6 + 0.4 * Math.sin(i * 1.7);
          tv2.set(Math.cos(a) * rr, 1.3 + 0.6 * Math.sin(a * 2 + i), Math.sin(a) * rr * 0.8);
          const P = tv2.clone();
          mol(i % 3 === 2 ? T_OC : T_ME, P, rotQ(t * 0.6 + i, t * 0.4 + i * 2, i), (i % 3 === 2 ? 0.1 : 0.16) * k);
        }
      }
    } else fillGlow.visible = false;

    // ---------- zone 2 ----------
    const hz = near(ZM);
    for (const k in heroLab) heroLab[k].visible = false;
    heroGlow.forEach((g) => (g.visible = false));
    senG.visible = ecu.visible = wire.visible = hz;
    if (hz) {
      const q = rotQ(0.35 + 0.25 * Math.sin(t * 0.4), t * 0.35, 0.15);
      const hp = HERO.clone().add(bro(1, t, 0.12));
      const hs = 1.55;
      mol(T_ME, hp, q, hs);
      const shows = [[E.karbon, 0, "C"], [E.oksigen, 1, "O"], [E.hidrogen, 2, "H"]];
      const labOn = t >= s.s3 && t < s.s4 ? 1 - ramp(t, E.cair + 0.3, E.cair + 1.0) : 0;
      for (const [ta, idx, el] of shows) {
        const on = ramp(t, ta - 0.15, ta + 0.25) * labOn;
        if (on < 0.01) continue;
        const ids = el === "H" ? [2, 3, 4, 5] : [idx];
        ids.forEach((ai, j) => {
          const p = T_ME.a[ai][1].clone().applyQuaternion(q).multiplyScalar(hs).add(hp);
          const g = heroGlow[el === "H" ? 2 + j : idx]; g.visible = true; g.position.copy(p); g.material.opacity = 0.55 * on * (0.8 + 0.2 * Math.sin(t * 5));
          if (j === 0) { const L = heroLab[el]; L.visible = true; L.position.copy(p).add(v3(0, el === "H" ? 0.9 : 1.0, 0.4)); L.material.opacity = on; }
        });
      }
      const mixK = ramp(t, E.cair - 0.4, E.campur3 + 0.4);
      for (let i = 0; i < SOUP.length; i++) {
        const m = SOUP[i];
        const enter = m.oc ? mixK : Math.max(mixK, ramp(t, s.s3 + 0.2, s.s3 + 1.2) * 0.999);
        if (enter < 0.01) continue;
        const p = m.p.clone().add(bro(m.sd, t, 0.5));
        if (m.oc) p.x += (1 - mixK) * (m.p.x > 0 ? 9 : -9);
        p.x -= 10 * ramp(t, E.sensor - 0.8, E.sensor + 0.4);
        mol(m.oc ? T_OC : T_ME, p, rotQ(m.r[0] + t * m.w[0], m.r[1] + t * m.w[1], m.r[2] + t * m.w[2]), (m.oc ? 0.9 : 1.05) * enter);
      }
      // stream through the sensor
      const sOn = ramp(t, E.sensor - 0.8, E.sensor);
      for (let i = 0; i < 12; i++) {
        const u = ((t * 0.12 + i / 12) % 1);
        const p = SEN.clone().add(v3(-9 + 18 * u, 0.45 * Math.sin(i * 2.3 + t), 0.45 * Math.cos(i * 1.7 + t)));
        mol(i % 4 === 3 ? T_OC : T_ME, p, rotQ(i + t * 0.5, i * 2 + t * 0.3, i), (i % 4 === 3 ? 0.32 : 0.42) * sOn);
      }
      const read = ramp(t, E.sensor - 0.2, E.sensor + 0.6);
      senBand.material.opacity = read; senBand.rotation.x = t * 2.2;
      arcs.forEach((l, j) => {
        const pa_ = l.geometry.attributes.position, R = mulberry(Math.floor(t * 14) * 7 + j);
        const a0 = j / 6 * Math.PI * 2;
        for (let k2 = 0; k2 < 12; k2++) { const u = k2 / 11, a = a0 + u * 1.2; pa_.setXYZ(k2, (R() - 0.5) * 0.25, Math.cos(a) * (1.25 - 0.3 * Math.sin(u * 3.14)) + (R() - 0.5) * 0.12, Math.sin(a) * (1.25 - 0.3 * Math.sin(u * 3.14)) + (R() - 0.5) * 0.12); }
        pa_.needsUpdate = true; l.material.opacity = read * 0.9;
      });
      wireU.uT.value = t; wireU.uOn.value = ramp(t, E.komputer - 0.6, E.komputer + 0.2);
      ecu.scale.setScalar(0.001 + 0.999 * back(ramp(t, E.komputer - 0.7, E.komputer - 0.1)));
    }

    // ---------- zone 3 ----------
    const cz3 = near(ZC);
    cylG.visible = spray.visible = frost.visible = cz3; cubeB.g.visible = cubeM.g.visible = sparkPts.visible = cz3 && t < s.s5 + 0.2;
    { const up = 7 * ramp(t, E.injektor, E.injektor + 1.4); cubeB.g.position.y = cubeM.g.position.y = cubeY + up; sparkPts.position.y = up; }
    sparkGlow.visible = flashGlow.visible = cz3; sparkLight.intensity = 0;
    if (cz3) {
      // energy levels: gasoline full, methanol drops to half on "separuh"
      const half = ramp(t, E.separuh - 0.2, E.separuh + 0.9);
      cubeB.en.scale.set(1, 1, 1); cubeB.en.position.y = 0;
      const lm = 1 - 0.5 * half; cubeM.en.scale.set(1, lm, 1); cubeM.en.position.y = -0.95 * (1 - lm);
      cubeM.en.material.opacity = 0.62; cubeB.en.material.opacity = 0.62;
      const sp = sparkPts.geometry.attributes.position;
      enSparks.forEach((e, i) => { const cube = e.c ? cubeM : cubeB; const top = e.c ? -0.95 + 1.9 * lm : 0.95; const y = -0.95 + ((t * e.sp + e.ph) % 1) * (top + 0.95); sp.setXYZ(i, cube.g.position.x + e.x, cubeY + y, ZC + e.z); });
      sp.needsUpdate = true;
      // piston: s4 slow idle stroke; s5 compression on "piston", power stroke after spark
      const comp_ = ramp(t, E.piston - 0.2, E.piston + 1.6), power = ramp(t, E.busi + 0.15, E.busi + 1.3);
      const idle = t < s.s5 ? 0.5 + 0.5 * Math.sin((t - s.s4) * 1.6) : 0;
      const pY = t < s.s5 ? lerp(-2.6, -1.4, idle) : lerp(lerp(-2.6, 0.5, comp_), -2.6, power);
      piston.position.y = pY;
      const top = pY + 0.0, bot = HEAD; // chamber between piston top and head
      vol.scale.set(1, Math.max(0.05, bot - top), 1); vol.position.y = (bot + top) / 2;
      const cool = ramp(t, E.menguap - 0.3, E.dingin + 0.6) * (1 - ramp(t, E.busi - 0.2, E.busi + 0.1));
      const hot = ramp(t, E.busi, E.busi + 0.15) * (1 - ramp(t, E.busi + 0.4, E.air + 0.5));
      const press = comp_ * (1 - cool) * (1 - ramp(t, E.busi, E.busi + 0.2)) * 0.5;
      volU.uC.value.setRGB(0.1 + 0.7 * hot + 0.5 * press, 0.25 + 0.3 * hot + 0.12 * press, 0.9 * cool + 0.06);
      volU.uA.value = Math.max(cool, hot, press * 0.8, 0.04);
      // spray: injection pulses, methanol pulse twice as long
      const injOn = t >= E.injektor - 0.3 && t < E.busi ? 1 : 0;
      const per = 2.2, ph = ((t - E.injektor) % per + per) % per;
      const pulse = injOn * (t < E.menguap ? (ph < 1.2 ? 1 : 0) : t < E.dingin ? 1 : 0);
      const strong = 1 + 0.6 * ramp(t, E.injeksi - 0.3, E.injeksi + 0.4) * (t < s.s5 ? 1 : 0);
      const evap = ramp(t, E.menguap - 0.2, E.dingin + 0.4);
      cylG.updateMatrixWorld(true);
      const tipW = inj.localToWorld(v3(0, -0.55, 0));
      const dir = v3(0.32, -1, 0).normalize();
      const P = sprayG.attributes.position, Cc = sprayG.attributes.color;
      for (let i = 0; i < NSP; i++) {
        const d = SPD[i]; const u = ((t * 1.6 * d.sp + d.ph) % 1);
        const len = u * (top < HEAD - 0.4 ? Math.min(2.6, HEAD - top + 0.2) : 2.6) * strong;
        const spread = u * 0.55 * strong;
        const x = tipW.x + dir.x * len + Math.cos(d.a) * spread * d.rr, y = tipW.y + dir.y * len, z = tipW.z + Math.sin(d.a) * spread * d.rr;
        const alive = pulse * (1 - evap * u * 1.4) * (1 - u * 0.3);
        P.setXYZ(i, x, Math.max(y, CY.y + top + 0.05), z);
        const a = Math.max(0, alive);
        Cc.setXYZ(i, 0.35 * a, 1.0 * a, 1.9 * a);
      }
      P.needsUpdate = Cc.needsUpdate = true;
      // frost for the cold-start claim
      const fr = win(t, E.injeksi + 0.8, s.s5 + 0.5, 0.6, 0.6);
      frost.material.opacity = fr;
      const FP = frost.geometry.attributes.position;
      FRD.forEach((f, i) => FP.setXYZ(i, f.x + 0.3 * Math.sin(t + f.ph), CY.y + 6 - ((f.y + t * f.sp) % 12), ZC + f.z + 1.5));
      FP.needsUpdate = true;
      // spark: cold-start test spark on "beku", ignition on "Busi"
      const plugTip = plug.localToWorld(v3(0, -0.75, 0));
      const s1k = Math.max(win(t, E.beku - 0.1, E.beku + 0.25, 0.08, 0.15), win(t, E.busi, E.busi + 0.3, 0.06, 0.2));
      sparkGlow.position.copy(plugTip); sparkGlow.material.opacity = s1k * (0.75 + 0.25 * Math.sin(t * 90)); sparkGlow.scale.setScalar(1.2 + 1.4 * s1k);
      flashGlow.position.copy(plugTip).add(v3(0, -0.6, 0.4)); flashGlow.material.opacity = 0.35 * hot; flashGlow.scale.setScalar(2.5 + 2 * hot);
      sparkLight.position.copy(plugTip); sparkLight.intensity = 30 * Math.max(s1k, hot);
      // molecules in the chamber: reactants -> products
      const rk = ramp(t, E.busi + 0.1, E.busi + 1.1);
      const chH = Math.max(0.6, bot - top - 0.5), chY = top + 0.25;
      const onMol = t >= s.s5 - 0.3 ? ramp(t, s.s5 - 0.3, s.s5 + 0.5) : 0;
      if (onMol > 0.01) {
        rMols.forEach((m, mi) => { const p = v3(m.p.x, chY + m.p.y * chH * 0.85, m.p.z).add(CY).add(bro(m.sd, t, 0.12)); const qm = rotQ(m.r[0] + t * 0.5, m.r[1] + t * 0.4, m.r[2]); m.T.a.forEach((a, i) => { RPOS[mi * 6 + i] = (RPOS[mi * 6 + i] || v3()).copy(a[1]).applyQuaternion(qm).multiplyScalar(0.36).add(p); }); });
        const out = ramp(t, E.busi + 0.6, E.air + 0.8);
        pMols.forEach((m, mi) => { const p = v3(m.p.x * (1 + 0.5 * out), chY + m.p.y * chH * 0.85, m.p.z * (1 + 0.4 * out)).add(CY).add(bro(m.sd + 3, t, 0.16)); const qm = rotQ(m.r[0] + t * 0.7, m.r[1] + t * 0.5, m.r[2]); m.T.a.forEach((a, i) => { PPOS[mi * 6 + i].copy(a[1]).applyQuaternion(qm).multiplyScalar(0.36).add(p); }); });
        if (rk < 0.02) rMols.forEach((m, mi) => { m.T.a.forEach((a, i) => put(a[0], RPOS[mi * 6 + i], RAD[a[0]] * 0.36 * onMol)); m.T.b.forEach(([i, j]) => bond("B", RPOS[mi * 6 + i], RPOS[mi * 6 + j], 0.036 * onMol)); });
        else if (rk > 0.98) pMols.forEach((m, mi) => { const hl = m.T === T_CO2 ? win(t, E.karbon5, E.karbon5 + 1.2, 0.2, 0.3) : win(t, E.air, E.air + 1.2, 0.2, 0.3); const sc = 0.36 * (1 + 0.25 * hl); m.T.a.forEach((a, i) => put(a[0], PPOS[mi * 6 + i], RAD[a[0]] * sc)); m.T.b.forEach(([i, j]) => bond("B", PPOS[mi * 6 + i], PPOS[mi * 6 + j], 0.036)); });
        else {
          // atoms fly apart and regroup (burst outward mid-way)
          const ex = Math.sin(Math.PI * rk) * 0.9;
          for (const a of RX) { const p0 = RPOS[a.rm * 6 + a.ri], p1 = PPOS[a.pm * 6 + a.pi]; const p = p0.clone().lerp(p1, eout(rk)); const c = CY.clone().add(v3(0, chY + chH * 0.4, 0)); p.add(p.clone().sub(c).multiplyScalar(ex * 0.6)); put(a.el, p, RAD[a.el] * 0.36); }
        }
      }
    }

    // ---------- zone 4 ----------
    const sz = near(ZS);
    segG.visible = sz; for (const k in segLab) segLab[k].visible = false; warnGlow.visible = okGlow.visible = false;
    if (sz) {
      const sw = ramp(t, E.baja - 0.3, E.baja + 0.7);
      const pit = ramp(t, E.serang - 0.2, E.serang + 1.4);
      pitM.opacity = pit; alM.color.setRGB(lerp(0.27, 0.2, pit), lerp(0.29, 0.19, pit), lerp(0.32, 0.17, pit)); alM.roughness = 0.5 + 0.35 * pit;
      const sw2 = ramp(t, E.bengkak - 0.4, E.bengkak + 1.0);
      oring.scale.set(1 + 0.12 * sw2, 1 + 0.12 * sw2, 1 + 1.3 * sw2); // swollen tube (local z = thickness after rotation)
      rubM.emissive.setRGB(0.35 * sw2, 0.02 * sw2, 0.05 * sw2);
      oldParts.position.y = 4.5 * eout(sw); oldParts.visible = sw < 0.99; oldParts.rotation.x = 0.4 * sw;
      newParts.position.y = -4.5 * (1 - eout(ramp(t, E.baja + 0.1, E.baja + 1.0))); newParts.visible = t > E.baja - 0.1;
      const P0 = segG.position;
      const lab = (L, on, p) => { if (on < 0.01) return; L.visible = true; L.material.opacity = on; L.position.copy(P0).add(p); };
      if (0) lab(segLab.al, win(t, E.serang - 0.1, E.baja, 0.3, 0.3), v3(-1.3, 2.35 + oldParts.position.y, 0.4));
      if (0) lab(segLab.rub, win(t, E.karet - 0.1, E.baja, 0.3, 0.3), v3(1.3, -2.1 + oldParts.position.y, 0.4));
      if (0) lab(segLab.ss, ramp(t, E.baja + 0.4, E.baja + 0.9), v3(-1.3, 2.35, 0.4));
      if (0) lab(segLab.sk, ramp(t, E.khusus - 0.3, E.khusus + 0.2), v3(1.3, -2.1, 0.4));
      warnGlow.visible = true; warnGlow.position.copy(P0).add(v3(0.4, 0, 0.8)); warnGlow.material.opacity = 0.6 * sw2 * (1 - sw) * (0.7 + 0.3 * Math.sin(t * 7));
      okGlow.visible = true; okGlow.position.copy(P0).add(v3(-0.4, 0, 0.8)); okGlow.material.opacity = 0.45 * ramp(t, E.khusus - 0.3, E.khusus + 0.3);
      // methanol molecules streaming along the line; they jostle the collar while attacking
      const att = win(t, E.serang - 0.4, E.baja, 0.4, 0.3);
      SEGM.forEach((m, i) => { const x = ((m.x + t * m.sp) % 22) - 11; const p = v3(x, m.y, m.z).add(P0).add(bro(m.sd, t, 0.1)); if (att > 0.01 && Math.abs(x + 1.3) < 1.3) p.y += att * 0.4 * Math.sin(t * 9 + i); mol(T_ME, p, rotQ(m.r[0] + t, m.r[1] + t * 0.7, m.r[2]), 0.42); });
    }

    // ---------- zone 5 ----------
    const fz = near(ZF);
    facG.visible = smoke.visible = fz; for (const k in facLab) facLab[k].visible = false;
    if (fz) {
      const coalOn = ramp(t, E.banyak - 0.3, E.banyak + 0.6), greenOn = ramp(t, E.baru - 0.2, E.baru + 0.6);
      reCoal.tank.material.emissiveIntensity = 0.25 * coalOn; reGreen.tank.material.emissiveIntensity = 0.5 * greenOn * (0.8 + 0.2 * Math.sin(t * 3));
      reCoal.band.material.color.setRGB(0.6 * coalOn + 0.1, 0.6 * coalOn + 0.1, 0.6 * coalOn + 0.12); reGreen.band.material.color.setRGB(0.1, 0.3 + 1.6 * greenOn, 0.15 + 0.5 * greenOn);
      // coal lumps on the left belt
      coal.forEach((m) => { const u = (m.userData.ph + t * 0.12) % 1; m.position.set(-3.2 + 0.2 * Math.sin(m.userData.rx), 0.62, 3.4 - 2.6 * u); m.rotation.set(m.userData.rx, u * 2, 0); m.visible = coalOn > 0.01; m.scale.setScalar(Math.min(1, (1 - u) * 6) * coalOn + 0.001); });
      smoke.material.opacity = 0.35 * coalOn;
      const SP = smoke.geometry.attributes.position; const st = FW(-2.65, 3.9, -0.9);
      SMK.forEach((m, i) => { const u = (m.ph + t * 0.18) % 1; SP.setXYZ(i, st.x + m.x + u * 1.6, st.y + u * 3.5, st.z + m.z - u * 0.6); });
      SP.needsUpdate = true;
      // green route: CO2 + H2 converge into the green reactor
      if (greenOn > 0.01) for (let i = 0; i < 6; i++) {
        const u = (i / 6 + t * 0.15) % 1, isC = i % 2 === 0;
        const p0 = isC ? FW(5.3, 1.4, -1.8) : FW(4.9, 1.5, 1.8), p1 = FW(3.2, 1.6, -0.6);
        const p = p0.clone().lerp(p1, u); p.y += 0.4 * Math.sin(u * Math.PI);
        mol(isC ? T_CO2 : T_H2, p, rotQ(t + i, t * 0.6 + i, 0), 0.32 * greenOn * Math.min(1, (1 - u) * 5));
      }
      // outputs: grey methanol from coal, green methanol from CO2 + H2 -> drum
      const toDrum = ramp(t, E.indo - 0.3, E.indo + 0.8);
      for (let i = 0; i < 10; i++) {
        const fromG = i % 2 === 1; const on = fromG ? greenOn : coalOn; if (on < 0.01) continue;
        const u = (i / 10 + t * 0.11) % 1;
        const a = FW(fromG ? 2.2 : -2.2, 1.0, 0.9), b = FW(fromG ? 0.4 : -0.4, 1.0, 0.9), c = FW(0, 2.4, 2.3);
        const p = u < 0.6 ? a.clone().lerp(b, u / 0.6) : b.clone().lerp(toDrum > 0.5 ? c : b, (u - 0.6) / 0.4);
        p.y += 0.12 * Math.sin(t * 2 + i);
        mol(T_ME, p, rotQ(t * 0.6 + i, t * 0.5 + i * 2, i), 0.3 * on, fromG ? "g" : "x");
      }
      drum.scale.setScalar(0.001 + 0.999 * back(ramp(t, E.indo - 0.4, E.indo + 0.4)));
      drum.rotation.y = t * 0.2;
      const lab = (L, on, p) => { if (on < 0.01) return; L.visible = true; L.material.opacity = on; L.position.copy(p); };
      if (0) lab(facLab.coal, ramp(t, E.batu - 0.4, E.batu + 0.2), FW(-3.2, 3.4, 0.6));
      if (0) lab(facLab.green, ramp(t, E.tangkap - 0.4, E.tangkap + 0.2), FW(3.2, 3.4, 0.6));
    }

    // background drift
    dust.position.y = 0.15 * Math.sin(t * 0.2); bokeh.position.x = 0.4 * Math.sin(t * 0.1);
    bloom.strength = 0.45 + 0.4 * dive;
    for (const k in BATCH) { const b = BATCH[k]; b.m.count = b.n; b.m.instanceMatrix.needsUpdate = true; }
    comp.render();
  };
}
