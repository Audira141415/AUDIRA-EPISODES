// EP43 GIMLI GLIDER 1983: PAPERWORLD. A folded-paper Boeing 767 among paper clouds hung on threads, over a patchwork
// paper Canada; a paper studio table with a map board, a cutaway paper fuel tank, a dripstick, a broken gauge, a
// calculator tape (7.682 L x 1,77 = "13.597 kg", really pounds) and the flight computer; then the glide: engines go
// dark, crease lines fold the jet into a paper glider, and it lands on the Gimli drag strip among tiny paper race cars.
//   s1 hook: jet at 12 km, hanging fuel gauge drops to E, altitude thread to the ground
//   s2 studio map: Montreal -> Ottawa -> (Edmonton, planned); a small paper jet rides the dashes
//   s3 bench: broken gauge (RUSAK), tank cutaway, dripstick, calculator tape with PON != KG stamp
//   s4 tank fills to 45 %, the 22.300 kg line stays far above; the flight computer pops up "CUKUP"
//   s5 sky over Ontario: alarm beacon, left engine dies, then right, cockpit dark, 61 penumpang
//   s6 crease lines fold the jet into a glider, ~17 min glide down through clouds, Gimli racetrack appears, race on
//   s7 forward slip, touchdown, nose gear folds, nose scrapes (paper sparks), stop before the barrier
//   s8 GIMLI GLIDER tag, back to the map: the real route Ottawa -> Red Lake -> Gimli.
// Units: the jet is ~19 units long. Everything is a pure function of t.

const FONTS = ['800 80px "Baloo 2"', '700 80px "Baloo 2"', '800 80px "Nunito"', '700 80px "Nunito"', '400 80px "Patrick Hand"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "GIMLI 1,77 AUDIRA ½ ≠ kg"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* system fallback */ }
}

import * as THREE from "./three.module.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, eout, clamp01, smooth, canvasTex, stage, pts } from "./lib3d.js";
import { GEO } from "./geo.js";

const HEAD = '"Baloo 2", "Arial Rounded MT Bold", sans-serif', BODY = '"Nunito", Arial, sans-serif', HAND = '"Patrick Hand", "Comic Sans MS", cursive';
const IVORY = "#F4EEDF", CORAL = "#E8735A", MINT = "#7CC6A4", GOLD = "#E8B64A", COBALT = "#2F5DA8", BROWN = "#6B4A35", INK = "#3A2E26", FUEL = "#6FA8D6";
const ramp = (t, a, b) => smooth((t - a) / (b - a));
const win = (t, a, b, fi = 0.4, fo = 0.4) => Math.min(clamp01((t - a) / fi), 1 - clamp01((t - b) / fo));
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerp = (a, b, u) => a + (b - a) * u;

// monotone cubic over [t, ...values]: never overshoots between keys
function track(keys) {
  keys = keys.slice().sort((a, b) => a[0] - b[0]);
  const n = keys.length;
  const tan = keys.map((k, i) => k.map((v, j) => {
    if (j === 0 || i === 0 || i === n - 1) return 0;
    const a = keys[i - 1], b = keys[i + 1], d0 = (v - a[j]) / Math.max(0.001, k[0] - a[0]), d1 = (b[j] - v) / Math.max(0.001, b[0] - k[0]);
    return d0 * d1 <= 0 ? 0 : 2 / (1 / d0 + 1 / d1);
  }));
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0; while (keys[i + 1][0] < t) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1[0] - k0[0], u = (t - k0[0]) / h, u2 = u * u, u3 = u2 * u;
    return k0.slice(1).map((_, jj) => { const j = jj + 1; return (2 * u3 - 3 * u2 + 1) * k0[j] + (u3 - 2 * u2 + u) * h * tan[i][j] + (-2 * u3 + 3 * u2) * k1[j] + (u3 - u2) * h * tan[i + 1][j]; });
  };
}

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xeadfc8, exp: 0.82, bloom: [0.1, 0.4, 0.93], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.82;
  const pmg = new THREE.PMREMGenerator(r);
  scene.environment = pmg.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.25;
  cam.near = 0.3; cam.far = 2600; cam.setViewOffset(1080, 1920, 0, 80, 1080, 1920); cam.updateProjectionMatrix();
  const skyBg = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#F7CFA6"); gr.addColorStop(0.45, "#FBE6CB"); gr.addColorStop(1, "#E4ECE6"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.background = skyBg;
  scene.fog = new THREE.Fog(0xf0e2cc, 140, 760);

  // ---------- lights: warm paper-lamp key that follows the subject, cool fill ----------
  scene.add(new THREE.HemisphereLight(0xfff4e2, 0x8a7a66, 1.15));
  const key = new THREE.DirectionalLight(0xffe4c0, 2.7);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 320 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.04; key.shadow.radius = 4;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xc4d6ff, 0.55); fill.position.set(120, 60, -80); scene.add(fill);

  // ---------- paper materials ----------
  const fibBump = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); const q = mulberry(3);
    for (let i = 0; i < 4200; i++) { const v = q() < 0.5 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${0.07 + q() * 0.12})`; g.save(); g.translate(q() * w, q() * h); g.rotate(q() * 6.28); g.fillRect(0, 0, 2 + q() * 7, 1); g.restore(); }
  }, [1, 1]);
  fibBump.colorSpace = THREE.NoColorSpace;
  const PMAP = {};
  const paperMap = (hex) => PMAP[hex] || (PMAP[hex] = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = hex; g.fillRect(0, 0, w, h);
    const q = mulberry((parseInt(hex.slice(1), 16) % 9973) + 7);
    for (let i = 0; i < 12; i++) { const x = q() * w, y = q() * h, R = 30 + q() * 80, gr = g.createRadialGradient(x, y, 1, x, y, R), v = q() < 0.5 ? "255,255,245" : "90,70,50"; gr.addColorStop(0, `rgba(${v},0.06)`); gr.addColorStop(1, `rgba(${v},0)`); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
    for (let i = 0; i < 2600; i++) { const v = q() < 0.55 ? "255,252,240" : "70,50,30"; g.fillStyle = `rgba(${v},${0.03 + q() * 0.07})`; g.fillRect(q() * w, q() * h, 1 + q() * 4, 1); }
  }, [1, 1]));
  const paper = (hex, o = {}) => new THREE.MeshStandardMaterial({ color: 0xffffff, map: paperMap(hex), bumpMap: fibBump, bumpScale: o.bump ?? 0.5, roughness: o.ro ?? 0.92, metalness: 0, flatShading: !!o.flat, side: o.ds ? THREE.DoubleSide : THREE.FrontSide, ...(o.ex || {}) });
  const add = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const basic = (o = {}) => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, ...o });
  const poly = (pts2) => { const s = new THREE.Shape(); pts2.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return s; };
  // extruded card centred on its thickness; face material on caps, paler cut core on the sides
  const card = (shape, depth, face, edge, p = scene) => { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 12 }); g.translate(0, 0, -depth / 2); return add(g, [face, edge], 0, 0, 0, p); };
  const fit = (g, s, font, px, maxW) => { let f = px; g.font = font(f); while (g.measureText(s).width > maxW && f > 12) { f -= 2; g.font = font(f); } return f; };
  const blobTex = canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, "rgba(50,32,16,.6)"); gr.addColorStop(1, "rgba(50,32,16,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const blob = (w, d, x, y, z, p = scene, op = 0.55) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), basic({ map: blobTex, opacity: op })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.renderOrder = 2; p.add(m); return m; };
  const face = (w, h, cw, paint, o = {}) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), o.basic ? basic({ map: canvasTex(cw, Math.round((cw * h) / w), paint), toneMapped: false, depthWrite: true, transparent: !!o.tr }) : paper(IVORY, { ex: { map: canvasTex(cw, Math.round((cw * h) / w), paint), bumpScale: 0.25 } }));

  // ---------- 3D paper tags (billboards on a thread) ----------
  const tags = [];
  function tag(title, sub, col, w, pos, vis, lift = 3) {
    const cw = 720, ch = sub ? 250 : 160;
    const tex = canvasTex(cw, ch, (g, W, H) => {
      g.fillStyle = "rgba(60,40,20,.25)"; g.beginPath(); g.roundRect(16, 18, W - 24, H - 26, 20); g.fill();
      g.fillStyle = "#FBF6EA"; g.beginPath(); g.roundRect(6, 6, W - 24, H - 26, 20); g.fill();
      g.fillStyle = col; g.beginPath(); g.roundRect(6, 6, 26, H - 26, [20, 0, 0, 20]); g.fill();
      const q = mulberry(title.length * 13 + 5); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(90,70,40,${0.03 + q() * 0.05})`; g.fillRect(10 + q() * (W - 34), 8 + q() * (H - 32), 1 + q() * 3, 1); }
      g.fillStyle = INK; g.textBaseline = "middle"; g.textAlign = "left";
      fit(g, title, (f) => `800 ${f}px ${HEAD}`, sub ? 92 : 100, W - 90); g.fillText(title, 56, sub ? 82 : (H - 20) / 2 + 6);
      if (sub) { g.fillStyle = "#6A5A4C"; fit(g, sub, (f) => `700 ${f}px ${BODY}`, 54, W - 90); g.fillText(sub, 58, 170); }
      g.fillStyle = "rgba(232,182,74,.75)"; g.save(); g.translate(W / 2, 10); g.rotate(-0.06); g.fillRect(-60, -12, 120, 30); g.restore();
    });
    const h = (w * ch) / cw;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic({ map: tex, toneMapped: false, depthTest: false }));
    m.renderOrder = 20; scene.add(m);
    const lg = new THREE.BufferGeometry().setFromPoints([V3(0, 0, 0), V3(0, 1, 0)]);
    const ln = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0x3a2e26, transparent: true, depthTest: false })); ln.renderOrder = 19; scene.add(ln);
    const o = { update(t) {
      const v = vis(t); m.visible = ln.visible = v > 0.01; if (!m.visible) return;
      const p = typeof pos === "function" ? pos(t) : pos;
      const up = V3(0, 1, 0).applyQuaternion(cam.quaternion);
      m.position.copy(p).addScaledVector(up, lift + h / 2 + 0.6 * (1 - eout(v)));
      m.quaternion.copy(cam.quaternion); m.scale.setScalar(0.7 + 0.3 * eout(v)); m.material.opacity = v;
      const a = lg.attributes.position; a.setXYZ(0, p.x, p.y, p.z); const b = p.clone().addScaledVector(up, lift + 0.2); a.setXYZ(1, b.x, b.y, b.z); a.needsUpdate = true; lg.computeBoundingSphere();
      ln.material.opacity = 0.75 * v;
    } };
    tags.push(o); return o;
  }

  // ================= WORLD 1: patchwork paper Canada far below =================
  const fieldTex = canvasTex(2048, 2048, (g, w, h) => {
    g.fillStyle = "#CDC79C"; g.fillRect(0, 0, w, h);
    const q = mulberry(77), cols = ["#B9C48A", "#D8C98F", "#A8BD84", "#E2D3A2", "#C3B27A", "#9DB27F", "#D2C27E", "#B4C795"];
    for (let i = 0; i < 260; i++) {
      const x = q() * w, y = q() * h, fw = 60 + q() * 220, fh = 50 + q() * 180;
      g.save(); g.translate(x, y); g.rotate((q() - 0.5) * 0.3);
      g.fillStyle = cols[Math.floor(q() * cols.length)]; g.fillRect(-fw / 2, -fh / 2, fw, fh);
      g.strokeStyle = "rgba(255,250,235,.35)"; g.lineWidth = 2; for (let k = -fw / 2 + 8; k < fw / 2; k += 9) { g.beginPath(); g.moveTo(k, -fh / 2); g.lineTo(k, fh / 2); g.stroke(); }
      g.strokeStyle = "rgba(80,60,30,.35)"; g.lineWidth = 3; g.strokeRect(-fw / 2, -fh / 2, fw, fh); g.restore();
    }
    g.strokeStyle = "rgba(245,236,214,.85)"; g.lineWidth = 7; for (let i = 0; i < 9; i++) { g.beginPath(); const y = q() * h; g.moveTo(0, y); g.lineTo(w, y + (q() - 0.5) * 300); g.stroke(); }
    for (let i = 0; i < 18; i++) { const x = q() * w, y = q() * h, R = 30 + q() * 70; g.fillStyle = "#8DB7CF"; g.beginPath(); g.ellipse(x, y, R, R * (0.5 + q() * 0.4), q() * 3, 0, 7); g.fill(); g.strokeStyle = "rgba(250,245,230,.8)"; g.lineWidth = 4; g.stroke(); }
    for (let i = 0; i < 26000; i++) { const v = q() < 0.5 ? "255,250,235" : "60,40,20"; g.fillStyle = `rgba(${v},${0.03 + q() * 0.05})`; g.fillRect(q() * w, q() * h, 1 + q() * 3, 1); }
  }, [7, 7]);
  const ground = add(new THREE.PlaneGeometry(4200, 4200), new THREE.MeshStandardMaterial({ map: fieldTex, roughness: 0.95, bumpMap: fibBump, bumpScale: 0.3 }), 300, 0, 300);
  ground.rotation.x = -Math.PI / 2; ground.castShadow = false;

  // ---------- paper clouds hung on threads ----------
  function cloudShape(w, seed) {
    const q = mulberry(seed), n = 3 + Math.floor(q() * 2), C = [];
    for (let i = 0; i < n; i++) { const cx = -w / 2 + ((i + 0.5) * w) / n, rr = (w / n) * (i === 0 || i === n - 1 ? 0.55 : 0.8) * (0.85 + q() * 0.35); C.push([cx, rr * 0.25, rr]); }
    const P = [[w / 2, 0]];
    for (let k = 1; k < 48; k++) { const x = w / 2 - (k / 48) * w; let y = 0.12; for (const [cx, cy, rr] of C) { const d = rr * rr - (x - cx) ** 2; if (d > 0) y = Math.max(y, cy + Math.sqrt(d)); } P.push([x, y]); }
    P.push([-w / 2, 0]);
    return poly(P);
  }
  const cloudFace = paper("#FFFDF8", { bump: 0.35 }), cloudEdge = paper("#D3DCE4"), cloudBack = paper("#EEF0F2");
  const threadM = basic({ color: 0x6b5a48, opacity: 0.45 });
  const clouds = [];
  function cloud(x, y, z, w, seed, rot = 0) {
    const G = new THREE.Group(); G.position.set(x, y, z); G.rotation.y = rot; scene.add(G);
    const q = mulberry(seed);
    for (let k = 0; k < 3; k++) { const c = card(cloudShape(w * (1 - k * 0.22), seed + k * 11), 0.5, k === 0 ? cloudFace : cloudBack, cloudEdge, G); c.position.set((q() - 0.5) * w * 0.25, k * 0.25 * w * 0.08, -k * 1.4); c.castShadow = true; }
    for (const s of [-1, 1]) { const th = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 90, 4), threadM); th.position.set(s * w * 0.28, 45 + w * 0.12, 0); G.add(th); }
    clouds.push(G); return G;
  }
  const cq = mulberry(404);
  for (let i = 0; i < 46; i++) {
    const x = -90 + i * 10.5 + (cq() - 0.5) * 8; if (x > 400) break;
    const side = cq() < 0.5 ? -1 : 1, z = side * (10 + cq() * 34), y = 40 + cq() * 42 - (x > 250 ? (x - 250) * 0.12 : 0);
    if (y < 30) continue;
    cloud(x, y, z, 7 + cq() * 9, 500 + i, (cq() - 0.5) * 0.6);
  }
  // a few big low clouds as a floor under the cruise altitude
  for (let i = 0; i < 16; i++) cloud(-80 + i * 22 + cq() * 8, 52 + cq() * 6, (cq() - 0.5) * 60, 16 + cq() * 10, 900 + i, (cq() - 0.5) * 0.4);

  // ---------- the paper Boeing 767 ----------
  const jetRoot = new THREE.Group(); jetRoot.rotation.order = "YZX"; scene.add(jetRoot);
  const jet = new THREE.Group(); jet.position.set(1.2, 2.85, 0); jetRoot.add(jet); // pivot = main-gear contact point
  const bodyM = paper("#F7F2E8", { flat: true }), bellyM = paper("#E6E0D4", { flat: true }), finM = paper(CORAL), finE = paper("#F3B3A2"), engM = paper(COBALT, { flat: true }), darkM = paper("#3B3A40", { ro: 0.8 }), wingM = paper("#F2ECDF"), wingE = paper("#D9CDB8");
  const T10 = Math.PI / 10;
  const fus = add(new THREE.CylinderGeometry(1.15, 1.15, 12, 10, 1, false, T10), bodyM, 0, 0, 0, jet); fus.rotation.z = Math.PI / 2;
  const noseM = add(new THREE.CylinderGeometry(0.34, 1.15, 2.7, 10, 1, false, T10), bodyM, 7.35, -0.08, 0, jet); noseM.rotation.z = -Math.PI / 2;
  add(new THREE.SphereGeometry(0.34, 10, 8), bodyM, 8.7, -0.08, 0, jet);
  const tailC = add(new THREE.CylinderGeometry(0.32, 1.15, 4.4, 10, 1, false, T10), bodyM, -8.15, 0.28, 0, jet); tailC.rotation.z = Math.PI / 2 - 0.1;
  // livery decal: windows, cheatline, flight number (generic, no airline marks)
  const livTex = canvasTex(2048, 124, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = CORAL; g.fillRect(40, 66, w - 80, 10); g.fillStyle = GOLD; g.fillRect(40, 80, w - 80, 5);
    g.fillStyle = "#34404F"; for (let x = 120; x < w - 120; x += 30) { if (Math.abs(x - 560) < 30 || Math.abs(x - 1480) < 30) continue; g.beginPath(); g.roundRect(x, 18, 14, 22, 6); g.fill(); }
    g.strokeStyle = "#7d7568"; g.lineWidth = 3; for (const x of [530, 1460]) { g.beginPath(); g.roundRect(x, 10, 46, 50, 8); g.stroke(); }
    g.fillStyle = INK; g.font = `800 40px ${HEAD}`; g.textBaseline = "middle"; g.textAlign = "left"; g.fillText("PENERBANGAN 143", 640, 104);
    g.font = `700 26px ${BODY}`; g.fillStyle = "#6A5A4C"; g.fillText("BOEING 767", 1150, 106);
  });
  const livM = basic({ map: livTex, toneMapped: true, depthWrite: false, opacity: 1 });
  for (const s of [-1, 1]) { const d = new THREE.Mesh(new THREE.PlaneGeometry(11.8, 0.715), livM); d.position.set(0.2, 0.0, s * 1.1); if (s < 0) d.rotation.y = Math.PI; d.renderOrder = 3; jet.add(d); }
  const cockM = new THREE.MeshStandardMaterial({ color: 0x33465a, roughness: 0.3, emissive: 0x7fd4ff, emissiveIntensity: 0.25 });
  for (const s of [-1, 1]) { const cw = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.34), cockM); cw.position.set(6.75, 0.4, s * 0.9); cw.rotation.y = s > 0 ? 0.33 : Math.PI - 0.33; jet.add(cw); }
  // wings
  const wingShape = (sg) => poly([[2.1, 0], [-3.3, sg * 10.6], [-4.7, sg * 10.6], [-3.7, 0]]);
  const wings = [];
  for (const s of [-1, 1]) {
    const W = new THREE.Group(); W.position.set(0.2, -0.5, s * 0.95); jet.add(W);
    const g = new THREE.ExtrudeGeometry(wingShape(s), { depth: 0.16, bevelEnabled: false }); g.rotateX(Math.PI / 2);
    add(g, [wingM, wingE], 0, 0, 0, W);
    // engine under the wing
    const E = new THREE.Group(); E.position.set(0.9, -0.85, s * 3.7); W.add(E);
    const nac = add(new THREE.CylinderGeometry(0.64, 0.52, 2.9, 14), engM, 0, 0, 0, E); nac.rotation.z = Math.PI / 2;
    add(new THREE.BoxGeometry(1.8, 0.7, 0.16), bellyM, -0.3, 0.55, 0, E);
    const lip = add(new THREE.TorusGeometry(0.58, 0.09, 8, 24), bodyM, 1.45, 0, 0, E); lip.rotation.y = Math.PI / 2;
    const fanTex = canvasTex(256, 256, (gg, w2, h2) => { gg.fillStyle = "#2c2c33"; gg.fillRect(0, 0, w2, h2); gg.translate(w2 / 2, h2 / 2); for (let k = 0; k < 14; k++) { gg.rotate((Math.PI * 2) / 14); gg.fillStyle = k % 2 ? "#C9C2B4" : "#ADA595"; gg.beginPath(); gg.moveTo(0, 0); gg.lineTo(120, -18); gg.lineTo(124, 12); gg.closePath(); gg.fill(); } gg.fillStyle = "#EDE6D8"; gg.beginPath(); gg.arc(0, 0, 26, 0, 7); gg.fill(); gg.fillStyle = INK; gg.beginPath(); gg.moveTo(0, -20); gg.lineTo(6, 0); gg.lineTo(-6, 0); gg.fill(); });
    const fanG = new THREE.Group(); fanG.position.set(1.38, 0, 0); fanG.rotation.y = Math.PI / 2; E.add(fanG);
    const fan = new THREE.Mesh(new THREE.CircleGeometry(0.54, 28), new THREE.MeshStandardMaterial({ map: fanTex, roughness: 0.7 })); fanG.add(fan);
    const glowM = basic({ color: 0xffa24a, opacity: 1, blending: THREE.AdditiveBlending, toneMapped: false });
    const glowG = new THREE.Group(); glowG.position.set(-1.5, 0, 0); glowG.rotation.y = -Math.PI / 2; E.add(glowG);
    glowG.add(new THREE.Mesh(new THREE.CircleGeometry(0.44, 24), glowM));
    const haloTex = canvasTex(128, 128, (gg, w2, h2) => { const gr = gg.createRadialGradient(w2 / 2, h2 / 2, 2, w2 / 2, h2 / 2, w2 / 2); gr.addColorStop(0, "rgba(255,190,110,.9)"); gr.addColorStop(1, "rgba(255,140,60,0)"); gg.fillStyle = gr; gg.fillRect(0, 0, w2, h2); });
    const haloM = basic({ map: haloTex, opacity: 1, blending: THREE.AdditiveBlending, toneMapped: false });
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), haloM); halo.position.z = 0.25; glowG.add(halo);
    const exh = add(new THREE.CircleGeometry(0.42, 20), darkM, -1.46, 0, 0, E); exh.rotation.y = -Math.PI / 2;
    wings.push({ W, s, E, fan, glowM, haloM });
  }
  // fin and tailplanes
  card(poly([[-5.5, 0.85], [-8.1, 5.6], [-9.7, 5.6], [-9.6, 0.85]]), 0.18, finM, finE, jet);
  const stripe = card(poly([[-7.1, 3.0], [-7.75, 4.2], [-9.65, 4.2], [-9.62, 3.0]]), 0.2, paper(GOLD), finE, jet);
  for (const s of [-1, 1]) {
    const g = new THREE.ExtrudeGeometry(poly([[-7.4, 0], [-9.5, s * 4.3], [-10.4, s * 4.3], [-9.9, 0]]), { depth: 0.14, bevelEnabled: false }); g.rotateX(Math.PI / 2);
    add(g, [wingM, wingE], 0, 0.35, s * 0.4, jet);
  }
  const beaconM = new THREE.MeshStandardMaterial({ color: 0xc8392f, emissive: 0xff2a1a, emissiveIntensity: 0 });
  add(new THREE.SphereGeometry(0.22, 12, 10), beaconM, 0.8, 1.2, 0, jet);
  // landing gear
  const mainG = new THREE.Group(); mainG.position.set(-1.2, -0.75, 0); jet.add(mainG);
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.14, 0.14, 1.3, 8), darkM, 0, -0.6, s * 2.2, mainG);
    for (const dx of [-0.5, 0.5]) { const w2 = add(new THREE.CylinderGeometry(0.45, 0.45, 0.5, 16), darkM, dx, -1.65, s * 2.2, mainG); w2.rotation.x = Math.PI / 2; }
  }
  const noseG = new THREE.Group(); noseG.position.set(5.6, -0.85, 0); jet.add(noseG);
  add(new THREE.CylinderGeometry(0.11, 0.11, 1.3, 8), darkM, 0, -0.62, 0, noseG);
  const nw = add(new THREE.CylinderGeometry(0.4, 0.4, 0.45, 16), darkM, 0, -1.6, 0, noseG); nw.rotation.x = Math.PI / 2;
  // crease lines (the jet "becomes" a paper glider): dashed folds along the spine and both wings
  const creases = [], dashM = paper(CORAL, { ex: { emissive: 0xe8735a, emissiveIntensity: 0.25 } });
  function creaseLine(p0, p1, parent, u0, u1) {
    const L = p0.distanceTo(p1), n = Math.max(3, Math.floor(L / 0.62));
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n, p = p0.clone().lerp(p1, u);
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.42), dashM); m.position.copy(p); m.lookAt(parent.localToWorld(p1.clone())); parent.add(m);
      m.lookAt(p1.clone().applyMatrix4(parent.matrixWorld)); m.visible = false; creases.push({ m, u: lerp(u0, u1, u) });
    }
  }
  jetRoot.updateMatrixWorld(true);
  creaseLine(V3(8.8, 0.62, 0), V3(-9.5, 1.12, 0), jet, 0, 0.55);
  for (const w of wings) { w.W.updateMatrixWorld(true); creaseLine(V3(-0.6, 0.04, w.s * 0.3), V3(-3.9, 0.04, w.s * 10.3), w.W, 0.25, 0.85); creaseLine(V3(1.8, 0.04, w.s * 0.3), V3(-3.0, 0.04, w.s * 9.8), w.W, 0.45, 1); }
  // hanging fuel gauge (hook) and altitude thread
  function makeGauge(R, cracked) {
    const G = new THREE.Group();
    const faceTex = canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = "#FBF6EA"; g.beginPath(); g.arc(256, 256, 250, 0, 7); g.fill();
      g.lineWidth = 34; g.strokeStyle = "#E8735A"; g.beginPath(); g.arc(256, 280, 178, Math.PI + 0.52, Math.PI + 0.9); g.stroke();
      g.strokeStyle = INK; g.lineWidth = 6; for (let k = 0; k <= 8; k++) { const a = Math.PI + 0.52 + (k / 8) * (Math.PI - 1.04); g.beginPath(); g.moveTo(256 + Math.cos(a) * 160, 280 + Math.sin(a) * 160); g.lineTo(256 + Math.cos(a) * (k % 4 ? 192 : 205), 280 + Math.sin(a) * (k % 4 ? 192 : 205)); g.stroke(); }
      g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `800 70px ${HEAD}`; g.fillText("E", 96, 170); g.fillText("F", 416, 170); g.font = `800 56px ${HEAD}`; g.fillText("½", 256, 56);
      g.font = `800 40px ${BODY}`; g.fillStyle = "#6A5A4C"; g.fillText("BAHAN BAKAR", 256, 380); g.font = `700 34px ${BODY}`; g.fillText("kg", 256, 430);
      if (cracked) { g.strokeStyle = "rgba(40,30,25,.8)"; g.lineWidth = 4; g.beginPath(); g.moveTo(330, 120); g.lineTo(300, 200); g.lineTo(350, 260); g.lineTo(310, 330); g.moveTo(300, 200); g.lineTo(240, 230); g.stroke(); }
      const q = mulberry(cracked ? 9 : 8); for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(90,70,40,${0.03 + q() * 0.05})`; g.fillRect(q() * w, q() * h, 1 + q() * 3, 1); }
    });
    const rim = add(new THREE.CylinderGeometry(R * 1.08, R * 1.08, 0.5, 40), paper(GOLD), 0, 0, 0, G); rim.rotation.x = Math.PI / 2;
    const f = new THREE.Mesh(new THREE.CircleGeometry(R, 40), paper(IVORY, { ex: { map: faceTex, bumpScale: 0.2 } })); f.position.z = 0.27; G.add(f);
    const piv = new THREE.Group(); piv.position.set(0, -R * 0.1, 0.36); G.add(piv);
    add(new THREE.BoxGeometry(R * 0.08, R * 0.72, 0.06), paper(COBALT), 0, R * 0.36, 0, piv);
    add(new THREE.CylinderGeometry(R * 0.1, R * 0.1, 0.14, 16), paper(INK), 0, 0, 0, piv).rotation.x = Math.PI / 2;
    return { G, piv };
  }
  const skyGauge = makeGauge(2.4, false); scene.add(skyGauge.G);
  const sgThread = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 40, 4), threadM); sgThread.position.y = 22; skyGauge.G.add(sgThread);
  const altDash = []; const altM = paper(CORAL, { ex: { emissive: 0xe8735a, emissiveIntensity: 0.3 } });
  for (let i = 0; i < 34; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.1, 0.18), altM); scene.add(m); altDash.push(m); }

  // ================= WORLD 2: the Gimli racetrack (old RCAF strip) =================
  const RW0 = 470, RW1 = 770, RY = 0.16;
  const rwTex = canvasTex(4096, 192, (g, w, h) => {
    g.fillStyle = "#8F8C86"; g.fillRect(0, 0, w, h); const q = mulberry(12);
    for (let i = 0; i < 9000; i++) { const v = q() < 0.5 ? "230,225,210" : "40,35,30"; g.fillStyle = `rgba(${v},${0.04 + q() * 0.06})`; g.fillRect(q() * w, q() * h, 1 + q() * 4, 1); }
    g.fillStyle = "#F4EEDF"; g.fillRect(0, 10, w, 6); g.fillRect(0, h - 16, w, 6);
    for (let x = 60; x < 1000; x += 60) g.fillRect(x, h / 2 - 3, 34, 6);
    for (let k = 0; k < 8; k++) g.fillRect(24, 28 + k * 18, 70, 10);
    // drag strip start line (checkers) and lane paint after the old runway half
    const sx = ((640 - RW0) / (RW1 - RW0)) * w;
    for (let j = 0; j < 12; j++) for (let k = 0; k < 2; k++) { g.fillStyle = (j + k) % 2 ? "#F4EEDF" : "#2B2622"; g.fillRect(sx + k * 16, j * 16, 16, 16); }
    g.fillStyle = "#E8B64A"; g.fillRect(sx + 40, h / 2 - 50, w - sx, 5); g.fillRect(sx + 40, h / 2 + 45, w - sx, 5);
    g.fillStyle = "rgba(244,238,223,.9)"; g.font = `800 64px ${HEAD}`; g.textBaseline = "middle"; g.save(); g.translate(150, h / 2); g.rotate(Math.PI / 2); g.textAlign = "center"; g.fillText("32L", 0, 0); g.restore();
  });
  const runway = add(new THREE.BoxGeometry(RW1 - RW0, 0.16, 14), [paper("#7f7b75"), paper("#7f7b75"), new THREE.MeshStandardMaterial({ map: rwTex, roughness: 0.9, bumpMap: fibBump, bumpScale: 0.2 }), paper("#7f7b75"), paper("#7f7b75"), paper("#7f7b75")], (RW0 + RW1) / 2, 0.08, 0);
  add(new THREE.BoxGeometry(380, 0.08, 120), paper("#B7C98E"), 615, 0.04, -10).castShadow = false;
  // scrape trail behind the nose
  const scrapeM = basic({ color: 0x2b2420, opacity: 0 });
  const scrape = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.7), scrapeM); scrape.rotation.x = -Math.PI / 2; scrape.position.y = RY + 0.02; scrape.renderOrder = 3; scene.add(scrape);
  // centre barrier of the drag strip
  const BAR0 = 628;
  const railTex = canvasTex(512, 32, (g, w, h) => { for (let x = 0; x < w; x += 32) { g.fillStyle = (x / 32) % 2 ? "#F4EEDF" : CORAL; g.fillRect(x, 0, 32, h); } });
  railTex.wrapS = THREE.RepeatWrapping; railTex.repeat.set(10, 1);
  add(new THREE.BoxGeometry(RW1 - BAR0, 0.45, 0.25), new THREE.MeshStandardMaterial({ map: railTex, roughness: 0.85 }), (BAR0 + RW1) / 2, 0.85, 0);
  for (let x = BAR0; x <= RW1; x += 4) add(new THREE.BoxGeometry(0.25, 0.9, 0.25), paper("#D9D0C0"), x, 0.55, 0);
  // race cars
  function car(col, num) {
    const G = new THREE.Group(); scene.add(G);
    add(new THREE.BoxGeometry(3.0, 0.55, 1.3), paper(col, { flat: true }), 0, 0.62, 0, G);
    add(new THREE.BoxGeometry(1.2, 0.5, 1.0), paper(col), -0.2, 1.1, 0, G);
    add(new THREE.BoxGeometry(0.5, 0.42, 1.5), paper(INK), -1.45, 1.05, 0, G);
    const nT = canvasTex(64, 64, (g) => { g.fillStyle = "#FBF6EA"; g.beginPath(); g.arc(32, 32, 30, 0, 7); g.fill(); g.fillStyle = INK; g.font = `800 40px ${HEAD}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(num, 32, 35); });
    for (const s of [-1, 1]) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.24, 16), basic({ map: nT, depthWrite: true, toneMapped: true, transparent: false })); d.position.set(0.5, 0.65, s * 0.66); if (s < 0) d.rotation.y = Math.PI; G.add(d); }
    for (const [dx, dz] of [[0.95, 0.65], [0.95, -0.65], [-0.95, 0.65], [-0.95, -0.65]]) { const w2 = add(new THREE.CylinderGeometry(0.34, 0.34, 0.3, 14), darkM, dx, 0.34, dz, G); w2.rotation.x = Math.PI / 2; }
    blob(4, 2.2, 0, 0.05, 0, G, 0.45);
    return G;
  }
  const racers = [car(CORAL, "7"), car(COBALT, "3")];
  const parked = [[GOLD, "12", 668, -11], [MINT, "5", 676, -11.5], ["#F4EEDF", "21", 684, -11], [BROWN, "9", 700, 12], [CORAL, "44", 708, 12.5], [COBALT, "8", 716, 12]].map(([c, n, x, z]) => { const g = car(c, n); g.position.set(x, RY, z); g.rotation.y = Math.PI / 2; return g; });
  // flags at the start line
  const flagTex = canvasTex(128, 96, (g, w, h) => { for (let j = 0; j < 6; j++) for (let k = 0; k < 8; k++) { g.fillStyle = (j + k) % 2 ? "#F4EEDF" : "#2B2622"; g.fillRect(k * 16, j * 16, 16, 16); } });
  const flags = [];
  for (const [x, z] of [[640, 8.5], [640, -8.5], [700, 8.5], [700, -8.5]]) {
    add(new THREE.CylinderGeometry(0.08, 0.08, 5, 6), paper("#D9D0C0"), x, 2.5, z);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.4, 8, 1), new THREE.MeshStandardMaterial({ map: flagTex, side: THREE.DoubleSide, roughness: 0.9 })); f.position.set(x + 1.0, 4.3, z); f.castShadow = true; scene.add(f); flags.push(f);
  }
  // grandstand with the AUDIRA banner (faces the runway from the north side)
  const GS = new THREE.Group(); GS.position.set(690, 0, -28); scene.add(GS);
  const crowdTex = canvasTex(1024, 64, (g, w, h) => { g.fillStyle = "#CFC4AE"; g.fillRect(0, 0, w, h); const q = mulberry(31), cs = [CORAL, COBALT, GOLD, MINT, "#F4EEDF", BROWN, "#9E6BB0"]; for (let x = 6; x < w; x += 13) { g.fillStyle = cs[Math.floor(q() * cs.length)]; g.beginPath(); g.roundRect(x, 18 + q() * 6, 9, 30, 4); g.fill(); g.fillStyle = "#E9C9A4"; g.beginPath(); g.arc(x + 4.5, 14 + q() * 4, 4.2, 0, 7); g.fill(); } });
  for (let k = 0; k < 4; k++) add(new THREE.BoxGeometry(60, 1.2 + k * 1.2, 2.4), [paper("#D9CDB8"), paper("#D9CDB8"), paper("#E7DDCA"), paper("#D9CDB8"), new THREE.MeshStandardMaterial({ map: crowdTex, roughness: 0.9 }), paper("#D9CDB8")], 0, (1.2 + k * 1.2) / 2, -k * 2.4, GS);
  add(new THREE.BoxGeometry(64, 0.4, 12), paper(CORAL), 0, 8.6, -3.6, GS);
  for (const x of [-30, -10, 10, 30]) add(new THREE.CylinderGeometry(0.18, 0.18, 8.6, 8), paper("#D9D0C0"), x, 4.3, -8.6, GS);
  const banner = face(26, 3.4, 1024, (g, w, h) => { g.fillStyle = "#FBF6EA"; g.fillRect(0, 0, w, h); g.fillStyle = CORAL; g.fillRect(0, 0, 22, h); g.fillRect(w - 22, 0, 22, h); g.fillStyle = INK; g.font = `800 92px ${HEAD}`; g.textAlign = "center"; g.textBaseline = "middle"; g.letterSpacing = "0.14em"; g.fillText("AUDIRA", w / 2 - 150, h / 2 + 6); g.letterSpacing = "0em"; g.fillStyle = "#6A5A4C"; g.font = `700 44px ${BODY}`; g.fillText("· SIRKUIT GIMLI ·", w / 2 + 250, h / 2 + 4); });
  banner.position.set(0, 10.7, 2.45); GS.add(banner);
  // hangar and sign
  const HG = new THREE.Group(); HG.position.set(540, 0, -46); scene.add(HG);
  add(new THREE.BoxGeometry(30, 9, 18), paper("#E7DDCA"), 0, 4.5, 0, HG);
  const roof = add(new THREE.CylinderGeometry(9.2, 9.2, 30.4, 3, 1, false), paper(COBALT, { flat: true }), 0, 9.0, 0, HG); roof.rotation.z = Math.PI / 2; roof.rotation.x = Math.PI / 6; roof.scale.set(1, 1, 0.45);
  const hd = face(14, 6, 512, (g, w, h) => { g.fillStyle = "#CDBFA6"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(60,45,30,.45)"; g.lineWidth = 4; for (let x = 0; x < w; x += 42) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } g.fillStyle = INK; g.font = `800 70px ${HEAD}`; g.textAlign = "center"; g.fillText("GIMLI", w / 2, 80); });
  hd.position.set(0, 3.2, 9.02); HG.add(hd);
  const sign = new THREE.Group(); sign.position.set(600, 0, -17); scene.add(sign);
  for (const x of [-4, 4]) add(new THREE.CylinderGeometry(0.15, 0.15, 6, 6), paper(BROWN), x, 3, 0, sign);
  const sb = face(10, 3, 512, (g, w, h) => { g.fillStyle = "#FBF6EA"; g.fillRect(0, 0, w, h); g.strokeStyle = MINT; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14); g.fillStyle = INK; g.font = `800 58px ${HEAD}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("SIRKUIT BALAP", w / 2, h * 0.38); g.font = `700 36px ${BODY}`; g.fillStyle = "#6A5A4C"; g.fillText("Gimli · Manitoba", w / 2, h * 0.74); });
  sb.position.set(0, 5, 0.1); sign.add(sb); add(new THREE.BoxGeometry(10.3, 3.3, 0.18), paper("#D9CDB8"), 0, 5, -0.02, sign);
  // Lake Winnipeg (cut blue paper) and paper trees
  const lakeTex = canvasTex(1024, 1024, (g, w, h) => { g.fillStyle = "#86B6D3"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(245,240,226,.55)"; g.lineWidth = 3; const q = mulberry(2); for (let i = 0; i < 160; i++) { const x = q() * w, y = q() * h; g.beginPath(); g.arc(x, y, 14, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } }, [1, 1]);
  const lq = mulberry(21), lakeP = []; for (let k = 0; k < 40; k++) { const a = (k / 40) * Math.PI * 2, rr = 1 + 0.12 * Math.sin(a * 3 + 1) + (lq() - 0.5) * 0.08; lakeP.push([Math.cos(a) * 260 * rr, Math.sin(a) * 120 * rr]); }
  const lk = new THREE.ExtrudeGeometry(poly(lakeP), { depth: 0.3, bevelEnabled: false }); lk.rotateX(-Math.PI / 2);
  const lakeM = new THREE.MeshStandardMaterial({ map: lakeTex, roughness: 0.55 }); lakeTex.repeat.set(1 / 60, 1 / 60);
  add(lk, [lakeM, paper("#DCE7EE")], 660, 0.02, -190);
  const treeQ = mulberry(66), treeM = [paper("#7FAE79", { flat: true }), paper("#94BE82", { flat: true }), paper("#6E9E6C", { flat: true })], trunkM = paper(BROWN);
  for (let i = 0; i < 120; i++) {
    const x = 380 + treeQ() * 460, z = (treeQ() < 0.5 ? -1 : 1) * (18 + treeQ() * 60);
    if (z < -58 && Math.abs(x - 660) < 240) continue;
    if (Math.abs(x - 690) < 36 && z < -14 && z > -44) continue;
    if (Math.abs(x - 540) < 20 && z < -32 && z > -60) continue;
    const s = 0.8 + treeQ() * 0.9, T = new THREE.Group(); T.position.set(x, 0, z); T.scale.setScalar(s); scene.add(T);
    add(new THREE.CylinderGeometry(0.25, 0.3, 1.4, 6), trunkM, 0, 0.7, 0, T);
    for (let k = 0; k < 3; k++) add(new THREE.ConeGeometry(1.8 - k * 0.45, 2.0, 7), treeM[(i + k) % 3], 0, 1.8 + k * 1.1, 0, T);
  }
  // paper sparks
  const NS = 140, sparks = pts(scene, NS, { color: 0xffb04a, size: 0.55, add: true, opacity: 1 });
  const spQ = mulberry(55), spB = []; for (let i = 0; i < NS; i++) spB.push([spQ(), spQ(), spQ(), spQ()]);

  // ================= WORLD 3: the paper studio table (map board + fuel bench) =================
  const SZ = 900, SY = 0.6;
  const tableTex = canvasTex(1024, 1024, (g, w, h) => { g.fillStyle = "#EADFC8"; g.fillRect(0, 0, w, h); const q = mulberry(5); for (let i = 0; i < 30000; i++) { const v = q() < 0.5 ? "255,250,235" : "80,60,30"; g.fillStyle = `rgba(${v},${0.03 + q() * 0.05})`; g.fillRect(q() * w, q() * h, 1 + q() * 4, 1); } g.strokeStyle = "rgba(120,95,60,.12)"; g.lineWidth = 2; for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(w, x); g.stroke(); } }, [12, 8]);
  add(new THREE.BoxGeometry(700, 1.2, 420), new THREE.MeshStandardMaterial({ map: tableTex, roughness: 0.92 }), 0, 0, SZ).castShadow = false;
  const wall = face(760, 300, 2048, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#BFE0CF"); gr.addColorStop(0.6, "#E9E3CB"); gr.addColorStop(1, "#F2E2C6"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const q = mulberry(14); for (let i = 0; i < 40000; i++) { const v = q() < 0.5 ? "255,250,235" : "80,60,30"; g.fillStyle = `rgba(${v},${0.025 + q() * 0.04})`; g.fillRect(q() * w, q() * h, 1 + q() * 3, 1); }
    g.fillStyle = "rgba(255,253,246,.85)"; for (let i = 0; i < 9; i++) { const x = q() * w, y = 60 + q() * h * 0.4, s = 30 + q() * 50; g.beginPath(); g.arc(x, y, s, 0, 7); g.arc(x + s, y - s * 0.4, s * 1.2, 0, 7); g.arc(x + s * 2.2, y, s * 0.9, 0, 7); g.fill(); }
    g.fillStyle = INK; g.font = `400 46px ${HAND}`; g.textAlign = "left"; g.fillText("Studio Kertas AUDIRA", 1220, 690);
  });
  wall.position.set(0, 150, SZ - 150); scene.add(wall); wall.receiveShadow = true;

  // ---- map board ----
  const MAPX = -90, LON0 = -91, LAT0 = 49.5, KZ = 1.6, KX = KZ * Math.cos((LAT0 * Math.PI) / 180);
  const MW = 58, MD = 29, MP = (lon, lat) => [(lon - LON0) * KX, -(lat - LAT0) * KZ];
  const board = new THREE.Group(); board.position.set(MAPX, SY + 6.4, SZ + 8); board.rotation.x = 0.42; scene.add(board);
  for (const x of [-24, 24]) { const leg = add(new THREE.BoxGeometry(1.2, 13, 1.2), paper(BROWN), MAPX + x, SY + 6, SZ - 4); leg.rotation.x = -0.35; }
  const LAKES = [
    [[-96.9, 50.4], [-96.4, 50.9], [-96.6, 51.7], [-97.2, 52.4], [-97.9, 53.2], [-98.3, 53.8], [-98.9, 53.6], [-98.6, 52.9], [-98.0, 52.0], [-97.3, 51.2], [-97.1, 50.6]],
    [[-92.1, 46.7], [-90.0, 46.6], [-87.5, 46.4], [-84.6, 46.5], [-84.8, 47.2], [-85.9, 47.9], [-87.2, 48.6], [-88.6, 48.4], [-89.6, 48.0], [-91.0, 47.3]],
    [[-87.8, 41.7], [-86.6, 42.1], [-86.2, 43.5], [-86.0, 44.9], [-85.0, 45.8], [-86.6, 45.9], [-87.6, 44.9], [-87.9, 43.4]],
    [[-82.4, 43.0], [-81.7, 43.6], [-81.7, 44.6], [-80.4, 45.0], [-81.2, 45.8], [-83.6, 46.1], [-84.5, 45.9], [-83.4, 45.1], [-83.3, 44.2], [-82.6, 43.9]],
    [[-83.4, 41.7], [-81.4, 41.6], [-79.0, 42.6], [-79.8, 42.9], [-81.4, 42.7], [-83.0, 42.0]],
    [[-79.8, 43.3], [-79.0, 43.2], [-76.4, 43.4], [-76.2, 44.0], [-77.2, 44.0], [-78.9, 43.9], [-79.7, 43.6]],
  ];
  const CWm = 2400, CHm = 1200, MP2 = (lon, lat) => { const [x, z] = MP(lon, lat); return [(x / MW + 0.5) * CWm, (z / MD + 0.5) * CHm]; };
  const mapTex = canvasTex(CWm, CHm, (g, w, h) => {
    g.fillStyle = "#79A9C6"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 3; const q = mulberry(9); for (let i = 0; i < 220; i++) { const x = q() * w, y = q() * h; g.beginPath(); g.arc(x, y, 18, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
    const ring = (rg) => { g.beginPath(); rg.forEach(([lo, la], i) => { const [x, y] = MP2(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); };
    for (const c of GEO) for (const rg of c.rings) { ring(rg); g.fillStyle = "rgba(70,50,30,.28)"; g.save(); g.translate(7, 9); g.fill(); g.restore(); }
    for (const c of GEO) for (const rg of c.rings) { ring(rg); g.fillStyle = c.name === "Canada" ? "#F0C987" : "#C7C0B2"; g.fill(); g.strokeStyle = "rgba(120,95,60,.6)"; g.lineWidth = 2.5; g.stroke(); }
    for (const c of GEO) if (c.name !== "Canada") for (const rg of c.rings) { g.save(); ring(rg); g.clip(); g.strokeStyle = "rgba(90,70,50,.16)"; g.lineWidth = 3; for (let k = -h; k < w; k += 22) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + h, h); g.stroke(); } g.restore(); }
    for (const rg of LAKES) { ring(rg); g.fillStyle = "#79A9C6"; g.fill(); g.strokeStyle = "rgba(90,120,140,.6)"; g.lineWidth = 2; g.stroke(); }
    for (let i = 0; i < 50000; i++) { const v = q() < 0.5 ? "255,250,235" : "70,50,30"; g.fillStyle = `rgba(${v},${0.03 + q() * 0.05})`; g.fillRect(q() * w, q() * h, 1 + q() * 3, 1); }
    g.strokeStyle = "rgba(90,70,50,.18)"; g.lineWidth = 2; g.setLineDash([10, 10]);
    for (let la = 42; la <= 58; la += 4) { const [, y] = MP2(LON0, la); g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    for (let lo = -115; lo <= -65; lo += 10) { const [x] = MP2(lo, LAT0); g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    g.setLineDash([]);
    const lab = (s, lo, la, size, col, sp = 0.2) => { const [x, y] = MP2(lo, la); g.font = `800 ${size}px ${HEAD}`; g.fillStyle = col; g.textAlign = "center"; g.letterSpacing = `${sp}em`; g.fillText(s, x, y); g.letterSpacing = "0em"; };
    lab("K A N A D A", -100, 56.3, 96, "rgba(107,74,53,.55)", 0.1);
    lab("ONTARIO", -86, 51.6, 44, "rgba(107,74,53,.6)");
    lab("MANITOBA", -98.5, 55.2, 40, "rgba(107,74,53,.6)");
    lab("QUEBEC", -72, 51.5, 40, "rgba(107,74,53,.6)");
    lab("ALBERTA", -114.2, 56.4, 36, "rgba(107,74,53,.55)");
    lab("AMERIKA SERIKAT", -100, 44.5, 46, "rgba(107,74,53,.45)");
    // cartouche
    g.save(); g.translate(w - 330, h - 120); g.fillStyle = "#FBF6EA"; g.beginPath(); g.roundRect(-270, -78, 540, 150, 16); g.fill(); g.strokeStyle = CORAL; g.lineWidth = 6; g.stroke();
    g.fillStyle = INK; g.textAlign = "center"; g.font = `800 52px ${HEAD}`; g.fillText("PETA KERTAS AUDIRA", 0, -12); g.font = `700 34px ${BODY}`; g.fillStyle = "#6A5A4C"; g.fillText("Penerbangan 143 · 23 Juli 1983", 0, 40); g.restore();
    // compass
    g.save(); g.translate(150, 150); g.fillStyle = CORAL; g.beginPath(); g.moveTo(0, -80); g.lineTo(18, 0); g.lineTo(-18, 0); g.fill(); g.fillStyle = "#6A5A4C"; g.beginPath(); g.moveTo(0, 80); g.lineTo(18, 0); g.lineTo(-18, 0); g.fill(); g.font = `800 44px ${HEAD}`; g.textAlign = "center"; g.fillText("U", 0, -96); g.restore();
  });
  add(new THREE.BoxGeometry(MW + 2, 0.8, MD + 2), paper("#C9B691"), 0, -0.4, 0, board);
  add(new THREE.BoxGeometry(MW, 0.16, MD), [paper("#E6DAC0"), paper("#E6DAC0"), new THREE.MeshStandardMaterial({ map: mapTex, roughness: 0.9, bumpMap: fibBump, bumpScale: 0.25 }), paper("#E6DAC0"), paper("#E6DAC0"), paper("#E6DAC0")], 0, 0.08, 0, board);
  blob(MW + 14, MD + 14, MAPX, SY + 0.02, SZ + 8, scene, 0.4);
  // map route dashes
  const CITY = { MTL: [-73.57, 45.5], OTT: [-75.7, 45.42], EDM: [-113.49, 53.55], RL: [-93.79, 51.03], GIM: [-96.99, 50.63] };
  const MPV = (lo, la, y = 0.2) => { const [x, z] = MP(lo, la); return V3(x, y, z); };
  function route(stops, col, bulge) {
    const out = [], P = stops.map(([lo, la]) => MPV(lo, la));
    let L = 0; const segs = [];
    for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1], d = a.distanceTo(b), c = a.clone().lerp(b, 0.5).add(V3(0, 0, -d * bulge)); segs.push([a, c, b, L, d]); L += d; }
    const M = paper(col, { ex: { emissive: new THREE.Color(col), emissiveIntensity: 0.15 } });
    const at = (s) => { for (const [a, c, b, l0, d] of segs) if (s <= l0 + d + 1e-6) { const u = (s - l0) / d; return a.clone().multiplyScalar((1 - u) ** 2).add(c.clone().multiplyScalar(2 * u * (1 - u))).add(b.clone().multiplyScalar(u * u)); } return P[P.length - 1].clone(); };
    for (let s = 0.3; s < L; s += 0.9) { const p = at(s), p2 = at(Math.min(L, s + 0.1)); const m = add(new THREE.BoxGeometry(0.75, 0.14, 0.3), M, p.x, 0.2, p.z, board); m.rotation.y = -Math.atan2(p2.z - p.z, p2.x - p.x); m.visible = false; out.push({ m, u: s / L }); }
    return { out, at, L };
  }
  const planR = route([CITY.MTL, CITY.OTT, CITY.EDM], COBALT, 0.06);
  const realR = route([CITY.OTT, CITY.RL, CITY.GIM], CORAL, 0.05);
  const pins = {};
  for (const [k, col] of [["MTL", COBALT], ["OTT", COBALT], ["EDM", COBALT], ["RL", CORAL], ["GIM", MINT]]) {
    const G = new THREE.Group(); const [x, z] = MP(...CITY[k]); G.position.set(x, 0.16, z); board.add(G);
    add(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), paper("#8C8C8C"), 0, 1.2, 0, G);
    card(poly([[0, 0], [1.4, -0.45], [0, -0.9]]), 0.06, paper(col), paper("#F3E9D6"), G).position.set(0.04, 2.35, 0);
    add(new THREE.SphereGeometry(0.2, 10, 8), paper(col), 0, 2.45, 0, G);
    G.visible = false; pins[k] = G;
  }
  // tiny paper dart on the map
  const dart = new THREE.Group(); board.add(dart);
  const dg = new THREE.ExtrudeGeometry(poly([[1.6, 0], [-1.0, 0.9], [-0.6, 0], [-1.0, -0.9]]), { depth: 0.08, bevelEnabled: false }); dg.rotateX(Math.PI / 2);
  add(dg, [paper("#FFFDF8"), paper("#D9CDB8")], 0, 0, 0, dart);
  add(new THREE.BoxGeometry(2.4, 0.3, 0.06), paper(CORAL), -0.2, -0.12, 0, dart);

  // ---- fuel bench ----
  const BX = 80, BZ = SZ + 6;
  const bench = new THREE.Group(); bench.position.set(BX, SY, BZ); scene.add(bench);
  const TR = 6, TH = 13, FH = 12.2;
  const tankIn = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#EFE6D2"; g.fillRect(0, 0, w, h); const q = mulberry(17); for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(90,70,40,${0.03 + q() * 0.05})`; g.fillRect(q() * w, q() * h, 1 + q() * 3, 1); }
    g.strokeStyle = "rgba(107,74,53,.35)"; g.lineWidth = 3; for (let k = 1; k < 12; k++) { const y = h - (k / 12) * (FH / TH) * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  });
  add(new THREE.CylinderGeometry(TR, TR, TH, 40, 1, true, Math.PI / 2, Math.PI), paper(IVORY, { ds: true, ex: { map: tankIn } }), 0, TH / 2, -2, bench);
  add(new THREE.CylinderGeometry(TR + 0.15, TR + 0.15, 0.5, 40, 1, false, Math.PI / 2, Math.PI), paper(MINT), 0, 0.25, -2, bench);
  const rimT = add(new THREE.TorusGeometry(TR, 0.16, 8, 40, Math.PI), paper(MINT), 0, TH, -2, bench); rimT.rotation.x = Math.PI / 2; rimT.rotation.z = Math.PI;
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.3, TH, 0.3), paper(MINT), s * TR, TH / 2, -2, bench);
  // fill: half-cylinder + front cut face, scaled by level
  const fillG = new THREE.Group(); fillG.position.set(0, 0.5, -2); bench.add(fillG);
  const fg = new THREE.CylinderGeometry(TR - 0.2, TR - 0.2, 1, 40, 1, false, Math.PI / 2, Math.PI); fg.translate(0, 0.5, 0);
  const fuelM = paper(FUEL, { ro: 0.6, ex: { emissive: 0x2b5a85, emissiveIntensity: 0.12 } });
  add(fg, fuelM, 0, 0, 0, fillG);
  const ffg = new THREE.PlaneGeometry(2 * (TR - 0.2), 1); ffg.translate(0, 0.5, 0);
  const ffTex = canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#79B0DA"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(255,255,255,.45)"; g.lineWidth = 3; for (let y = 20; y < h; y += 26) { g.beginPath(); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.05 + y) * 4); g.stroke(); } g.fillStyle = "rgba(255,255,255,.7)"; g.fillRect(0, 0, w, 8); });
  const ffM = paper(FUEL, { ds: true, ex: { map: ffTex, emissive: 0x2b5a85, emissiveIntensity: 0.1 } });
  const fFront = add(ffg, ffM, 0, 0, 0.02, fillG);
  // needed line (22.300 kg) and the half line
  const ringLine = (y, col, dashed) => { const G = new THREE.Group(); G.position.set(0, y, -2); bench.add(G); const M = paper(col, { ex: { emissive: new THREE.Color(col), emissiveIntensity: 0.25 } }); const n = 28; for (let i = 0; i < n; i++) { if (dashed && i % 2) continue; const a = Math.PI / 2 + ((i + 0.5) / n) * Math.PI; const m = add(new THREE.BoxGeometry(0.2, 0.2, (Math.PI * TR) / n - (dashed ? 0 : 0.04)), M, Math.sin(a) * (TR - 0.12), 0, Math.cos(a) * (TR - 0.12), G); m.rotation.y = a + Math.PI / 2; } const fr = add(new THREE.BoxGeometry(2 * TR, 0.2, 0.2), M, 0, 0, 0.1, G); fr.visible = !dashed; return G; };
  const needLine = ringLine(0.5 + FH, CORAL, false), halfLine = ringLine(0.5 + FH / 2, INK, true);
  // dripstick
  const stickTex = canvasTex(64, 1024, (g, w, h) => { g.fillStyle = "#E9DCC0"; g.fillRect(0, 0, w, h); g.fillStyle = INK; for (let k = 0; k < 40; k++) { const y = (k / 40) * h; g.fillRect(0, y, k % 5 ? 20 : 44, 4); } g.fillStyle = CORAL; g.fillRect(0, 0, w, 50); });
  const stick = new THREE.Group(); bench.add(stick);
  add(new THREE.BoxGeometry(0.42, 16, 0.42), paper("#E9DCC0", { ex: { map: stickTex } }), 0, 8, 0, stick);
  const wetM = paper(FUEL, { ro: 0.5, ex: { emissive: 0x2b5a85, emissiveIntensity: 0.15 } });
  const wet = add(new THREE.BoxGeometry(0.46, 1, 0.46), wetM, 0, 0.5, 0, stick);
  // broken gauge on a stand
  const bg = makeGauge(2.6, true); bench.add(bg.G); bg.G.position.set(11.5, 6.4, 3.5); bg.G.rotation.y = -0.25;
  add(new THREE.CylinderGeometry(0.3, 0.4, 3.4, 10), paper(BROWN), 11.5, 1.7, 3.0, bench);
  add(new THREE.CylinderGeometry(1.6, 1.8, 0.4, 20), paper(BROWN), 11.5, 0.2, 3.0, bench);
  const rusak = face(3.6, 1.5, 512, (g, w, h) => { g.fillStyle = CORAL; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 18); g.fill(); g.fillStyle = "#FFF8EE"; g.font = `800 120px ${HEAD}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("RUSAK", w / 2, h / 2 + 8); });
  rusak.position.set(12.6, 3.6, 4.4); rusak.rotation.set(0, -0.25, 0.12); bench.add(rusak);
  // calculator + receipt tape
  const calc = new THREE.Group(); calc.position.set(-12, 0, 4); calc.rotation.y = 0.28; bench.add(calc);
  const keysTex = canvasTex(512, 640, (g, w, h) => { g.fillStyle = GOLD; g.fillRect(0, 0, w, h); g.fillStyle = "#3B4A3E"; g.beginPath(); g.roundRect(40, 40, w - 80, 130, 14); g.fill(); g.fillStyle = "#9FE0B0"; g.font = `800 80px ${BODY}`; g.textAlign = "right"; g.fillText("1,77", w - 70, 135); const lbl = ["7", "8", "9", "×", "4", "5", "6", "-", "1", "2", "3", "+", "0", ",", "=", "÷"]; for (let i = 0; i < 16; i++) { const x = 50 + (i % 4) * 106, y = 210 + Math.floor(i / 4) * 104; g.fillStyle = "#FBF6EA"; g.beginPath(); g.roundRect(x, y, 90, 86, 14); g.fill(); g.fillStyle = INK; g.font = `800 52px ${HEAD}`; g.textAlign = "center"; g.fillText(lbl[i], x + 45, y + 62); } });
  const cbody = add(new THREE.BoxGeometry(5.2, 0.9, 6.5), [paper(GOLD), paper(GOLD), paper(GOLD, { ex: { map: keysTex } }), paper(GOLD), paper(GOLD), paper(GOLD)], 0, 1.4, 0, calc); cbody.rotation.x = 0.35;
  add(new THREE.BoxGeometry(5.6, 1.0, 1.4), paper(BROWN), 0, 1.2, -3.2, calc);
  const tapeG = new THREE.PlaneGeometry(3.4, 9, 1, 24), tp = tapeG.attributes.position;
  for (let i = 0; i < tp.count; i++) { const y = tp.getY(i) + 4.5; tp.setY(i, y); tp.setZ(i, -0.03 * y * y); }
  tapeG.computeVertexNormals();
  const tapeC = document.createElement("canvas"); tapeC.width = 340; tapeC.height = 900;
  const tapeTex = new THREE.CanvasTexture(tapeC); tapeTex.colorSpace = THREE.SRGBColorSpace; tapeTex.anisotropy = 8;
  let tapeState = -1;
  const paintTape = (st) => {
    const g = tapeC.getContext("2d"), w = 340, h = 900; g.fillStyle = "#FFFDF6"; g.fillRect(0, 0, w, h);
    const q = mulberry(4); for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(90,70,40,${0.03 + q() * 0.05})`; g.fillRect(q() * w, q() * h, 1 + q() * 3, 1); }
    g.strokeStyle = "rgba(107,74,53,.3)"; g.setLineDash([8, 8]); g.lineWidth = 2; for (let y = 60; y < h; y += 130) { g.beginPath(); g.moveTo(16, y); g.lineTo(w - 16, y); g.stroke(); } g.setLineDash([]);
    g.textAlign = "right"; g.textBaseline = "middle"; g.fillStyle = INK;
    const line = (s, y, f = 66, col = INK) => { g.fillStyle = col; g.font = `800 ${f}px ${BODY}`; g.fillText(s, w - 26, y); };
    if (st >= 1) line("7.682 L", 470, 74);
    if (st >= 2) { line("× 1,77", 570, 74); }
    if (st >= 3) { g.fillStyle = INK; g.fillRect(26, 615, w - 52, 7); line("13.597", 670, 80); g.font = `700 40px ${BODY}`; g.textAlign = "left"; g.fillText("kg?", 22, 672); g.textAlign = "right"; }
    if (st >= 4) { g.save(); g.translate(w / 2, 300); g.rotate(-0.12); g.strokeStyle = CORAL; g.lineWidth = 9; g.beginPath(); g.roundRect(-150, -62, 300, 124, 14); g.stroke(); g.fillStyle = CORAL; g.textAlign = "center"; g.font = `800 64px ${HEAD}`; g.fillText("PON ≠ KG", 0, 6); g.restore(); g.fillStyle = CORAL; g.font = `400 38px ${HAND}`; g.textAlign = "left"; g.font = `400 46px ${HAND}`; g.fillText("1,77 = lb/L", 30, 400); }
    if (st >= 5) { g.fillStyle = "#2F8A5A"; g.font = `400 38px ${HAND}`; g.textAlign = "left"; g.font = `400 42px ${HAND}`; g.fillText("benar: 0,803 kg/L", 22, 160); }
    tapeTex.needsUpdate = true;
  };
  const tape = add(tapeG, paper("#F1E8D6", { ds: true, ro: 0.95, ex: { map: tapeTex, bumpScale: 0.15 } }), 0, 2.0, -3.0, calc); tape.castShadow = true;
  // flight computer (pops up in s4)
  const comp3 = new THREE.Group(); comp3.position.set(-7.5, 0, 9); comp3.rotation.y = 0.32; bench.add(comp3);
  const hingeC = new THREE.Group(); comp3.add(hingeC);
  add(new THREE.BoxGeometry(8, 5.6, 0.7), paper("#D9CDB8"), 0, 2.8, 0, hingeC);
  const scr = face(7.0, 4.4, 768, (g, w, h) => {
    g.fillStyle = "#1F2B26"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(160,240,190,.15)"; g.lineWidth = 2; for (let y = 0; y < h; y += 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.fillStyle = "#9FF0B8"; g.textAlign = "left"; g.font = `800 46px ${BODY}`; g.fillText("KOMPUTER PESAWAT", 40, 70);
    g.font = `700 40px ${BODY}`; g.fillStyle = "#7FCF98"; g.fillText("BAHAN BAKAR DI TANGKI", 40, 160);
    g.font = `800 120px ${BODY}`; g.fillStyle = "#C8FFD6"; g.fillText("22.300", 40, 290); g.font = `800 60px ${BODY}`; g.fillText("kg", 470, 290);
    g.fillStyle = "#9FF0B8"; g.beginPath(); g.roundRect(40, 330, 330, 74, 12); g.fill(); g.fillStyle = "#1F2B26"; g.font = `800 50px ${HEAD}`; g.fillText("✓ CUKUP", 70, 386);
  }, { basic: true });
  scr.position.set(0, 2.9, 0.37); hingeC.add(scr);
  add(new THREE.BoxGeometry(3.4, 0.4, 2.4), paper(BROWN), 0, 0.2, 0.4, comp3);
  for (const [x, z, w, d] of [[0, -2, 15, 15], [11.5, 3, 5, 5], [-12, 4, 8, 9], [-7.5, 9, 9, 4]]) blob(w, d, x, 0.03, z, bench, 0.4);

  // ================= tags =================
  const jp = new THREE.Vector3();
  const jetAt = (dx, dy, dz) => () => jetRoot.localToWorld(V3(dx + 1.2, dy + 2.85, dz));
  const boardAt = (lo, la, y = 3.4) => () => { const [x, z] = MP(lo, la); return board.localToWorld(V3(x, y, z)); };
  const benchAt = (x, y, z) => () => bench.localToWorld(V3(x, y, z));
  tag("12 KM", "41.000 kaki di atas Kanada", CORAL, 6, jetAt(-2, -1.5, 3), (t) => win(t, A("s1:kilometer") - 0.3, K.s2 - 0.2, 0.35, 0.2), -6.5);
  tag("MONTREAL", "", COBALT, 9, boardAt(...CITY.MTL), (t) => Math.max(win(t, A("s2:1983"), K.s3 - 0.1, 0.35, 0.2), 0));
  tag("OTTAWA", "", COBALT, 9, boardAt(...CITY.OTT), (t) => win(t, A("s2:Kanada"), K.s3 - 0.1, 0.35, 0.2), 4.2);
  tag("EDMONTON", "tujuan akhir", COBALT, 10, boardAt(...CITY.EDM), (t) => win(t, A("s2:Air") , K.s3 - 0.1, 0.35, 0.2));
  tag("PENGUKUR BAHAN BAKAR", "rusak", CORAL, 7.5, benchAt(11.5, 9.2, 3.5), (t) => win(t, A("s3:rusak") - 0.2, A("s3:tangki") + 0.4, 0.3, 0.3), 0.6);
  tag("TONGKAT CELUP", "diukur manual", COBALT, 7, benchAt(0, 16.4, -0.3), (t) => win(t, A("s3:tongkat") - 0.2, A("s3:Untuk") + 0.2, 0.3, 0.3), 0.6);
  tag("BUTUH 22.300 kg", "", CORAL, 7, benchAt(-2.5, 0.6 + FH, -4), (t) => win(t, A("s4:dua") - 0.1, A("s4:Komputer") - 0.2, 0.3, 0.3), -3.2);
  tag("TERISI ±10.100 kg", "kurang dari separuh", COBALT, 7.5, () => bench.localToWorld(V3(3.5, 0.5 + FH * fillLevel + 0.1, -0.5)), (t) => win(t, A("s4:kurang") - 0.1, A("s4:Komputer") - 0.2, 0.3, 0.3), 0.8);
  tag("MESIN KIRI", "mati", CORAL, 5.6, jetAt(1.6, -1.6, -4.6), (t) => win(t, A("s5:kiri") - 0.1, A("s5:Layar") - 0.1, 0.3, 0.3), 1.0);
  tag("MESIN KANAN", "mati", CORAL, 5.6, jetAt(1.6, -1.6, 4.6), (t) => win(t, A("s5:kanan") - 0.1, A("s5:Enam") - 0.1, 0.3, 0.3), 1.0);
  tag("LAYAR KOKPIT PADAM", "", INK, 6.4, jetAt(7.2, 0.8, 0), (t) => win(t, A("s5:Layar") - 0.1, A("s5:Enam") + 0.6, 0.3, 0.3), 1.6);
  tag("DI ATAS ONTARIO", "dekat Red Lake", COBALT, 6.2, jetAt(-6, 2, 0), (t) => win(t, K.s5 + 0.2, A("s5:kiri") - 0.2, 0.3, 0.3), 2.6);
  tag("PESAWAT LAYANG", "jet tanpa mesin", MINT, 7.5, jetAt(0, 1.2, 0), (t) => win(t, A("s6:melayangkan") - 0.2, A("s6:kopilot") - 0.2, 0.35, 0.3), 3.2);
  tag("GIMLI", "bekas pangkalan udara", MINT, 12, V3(600, 9, -16), (t) => win(t, A("s6:Gimli") - 0.1, A("s6:sirkuit") - 0.2, 0.35, 0.3), 2);
  tag("ADA LOMBA!", "sore itu", GOLD, 9, V3(700, 2, 0), (t) => win(t, A("s6:lomba") - 0.2, K.s7 + 1.0, 0.3, 0.3), 3.5);
  tag("RODA DEPAN", "tidak terkunci", CORAL, 5.6, jetAt(5.6, -2.2, 0), (t) => win(t, A("s7:Roda") - 0.1, A("s7:menyeret") - 0.1, 0.3, 0.3), 2.4);
  tag("RED LAKE", "dua mesin mati", CORAL, 11, boardAt(...CITY.RL), (t) => win(t, A("s8:Satu") + 0.6, A("s8:Menurut") - 0.1, 0.35, 0.3), 7.5);
  tag("GIMLI", "mendarat selamat", MINT, 11, boardAt(...CITY.GIM), (t) => win(t, A("s8:tertukar") + 0.2, K.dur, 0.35, 0.3), 2.6);
  tag("OTTAWA", "", COBALT, 10, boardAt(...CITY.OTT), (t) => win(t, A("s8:Satu") + 0.2, K.dur, 0.35, 0.3));

  // ================= motion tracks =================
  const C1 = K.s2, C2 = K.s5, C3 = A("s8:Satu");
  const S7 = K.s7, TD = A("s7:Roda") + 0.5, COL = A("s7:terkunci"), STOP = A("s7:berhenti");
  // jet pivot path [t, x, y, z, yaw, pitch, roll] (deg)
  const jetT = track([
    [0, -34, 72, 0, 0, 0, 0], [C1, -12, 72, 0, 0, 0, 0],
    [C2, 30, 72, 0, 0, 0, 0], [K.s5e, 62, 71, 0, 0, -1, 0], [K.s6, 64, 71, 0, 0, -2, 0],
    [A("s6:menit"), 150, 62, 0, 0, -4, -3], [A("s6:Gimli"), 262, 47, 0, 0, -5, 0], [A("s6:sirkuit"), 330, 35, 0, 0, -5, 0], [A("s6:lomba"), 392, 25, 0, 0, -5, 0],
    [S7, 412, 22, 0, 0, -5, 0], [A("s7:membuang"), 440, 16, -2, 16, -2, 26], [A("s7:ketinggian") + 0.4, 468, 10, -2.5, 14, -1, 22],
    [A("s7:Roda"), 500, 4.5, -0.6, 2, 2, 3], [TD, 522, RY, 0, 0, 3, 0], [COL, 538, RY, 0, 0, 2, 0], [A("s7:hidung"), 556, RY, 0, 0, -10.2, 0],
    [A("s7:mengerem"), 600, RY, 0, 0, -10.2, 0], [STOP, 611, RY, 0, 0, -10.2, 0], [K.dur, 611, RY, 0, 0, -10.2, 0],
  ]);
  // camera segments
  const sky1 = track([ // [t, dx, dy, dz, dist, el, az] relative to the jet
    [0, 1.5, 3.4, 0, 40, 13, 62], [A("s1:kehabisan"), 1.0, 3.2, 0, 36, 11, 55], [A("s1:kilometer"), 0.5, 2.4, 0, 39, 7, 48], [A("s1:Penyebabnya"), 0.5, 3.0, 0, 35, 9, 44], [C1, 0.8, 3.0, 0, 33, 10, 40],
  ]);
  const mapT = track([ // absolute [t, x, y, z, dist, el, az]
    [C1, ...(() => { const [x, z] = MP(...CITY.MTL); return [MAPX + x - 2, SY + 9, SZ + 8 + z * 0.9]; })(), 52, 66, -6],
    [A("s2:Kanada"), ...(() => { const [x, z] = MP(...CITY.OTT); return [MAPX + x - 3, SY + 9, SZ + 8 + z * 0.9]; })(), 54, 66, -4],
    [A("s2:Air"), MAPX + 4, SY + 9, SZ + 6, 70, 68, -2],
    [A("s2:pertamanya"), ...(() => { const [x, z] = MP(...CITY.EDM); return [MAPX + x + 4, SY + 9, SZ + 7 + z * 0.9]; })(), 64, 66, 2],
    [K.s3, MAPX - 2, SY + 9, SZ + 6, 74, 68, 0],
  ]);
  const benchT = track([
    [K.s3, BX + 11.5, SY + 6.4, BZ + 3.5, 30, 10, -12], [A("s3:rusak"), BX + 11.0, SY + 6.0, BZ + 3.5, 25, 9, -8],
    [A("s3:tangki"), BX + 4, SY + 7.5, BZ, 40, 12, -4], [A("s3:tongkat"), BX + 1, SY + 8.5, BZ - 1, 38, 13, 0], [A("s3:celup"), BX + 0.5, SY + 6.5, BZ - 1, 34, 12, 2],
    [A("s3:liter"), BX - 12, SY + 7.5, BZ + 1, 30, 12, 14], [A("s3:koma"), BX - 12.4, SY + 8.0, BZ + 0.5, 27, 11, 16], [A("s3:pon"), BX - 12.6, SY + 8.2, BZ + 0.5, 25, 10, 17], [K.s3e, BX - 12.6, SY + 8.2, BZ + 0.5, 24, 10, 17],
    [K.s4 + 0.6, BX - 1, SY + 10, BZ, 50, 14, -2], [A("s4:kilogram"), BX - 0.5, SY + 10, BZ - 1, 48, 15, 0], [A("s4:separuhnya"), BX, SY + 9, BZ - 1, 46, 14, 2],
    [A("s4:Komputer") + 0.3, BX - 7.5, SY + 3.5, BZ + 9, 24, 12, 18], [A("s4:cukup"), BX - 7.5, SY + 3.5, BZ + 9, 22, 11, 20], [C2, BX - 7.5, SY + 3.5, BZ + 9, 21, 11, 20],
  ]);
  const sky2 = track([ // relative to jet + weight toward the airfield focus point (last value)
    [C2, -1, 0.5, 0, 46, 12, -150, 0], [A("s5:alarm"), 0, 0.5, 0, 42, 14, -140, 0], [A("s5:kiri"), 1, -0.5, -2.5, 30, 8, -128, 0], [A("s5:kanan") - 0.2, 1, -0.5, 0, 40, 10, -90, 0],
    [A("s5:kanan") + 0.6, 1, -0.5, 2, 34, 8, -50, 0], [A("s5:Layar"), 5, 0.4, 0, 30, 10, 30, 0], [A("s5:Enam"), 0, 0.4, 0, 46, 16, 30, 0], [K.s5e, 0, 0.5, 0, 50, 18, 26, 0],
    [K.s6 + 0.8, 1, 4, 0, 74, 50, 20, 0], [A("s6:layang"), 1, 4, 0, 72, 54, 12, 0], [A("s6:melayangkan"), 1, 4, 0, 72, 46, 6, 0], [A("s6:menit"), 0, 0, 0, 50, 22, 40, 0],
    [A("s6:kopilot"), 0, 0, 0, 54, 18, 70, 0], [A("s6:Gimli"), 14, -5, 0, 52, 15, -84, 0], [A("s6:sirkuit"), 26, -8, 0, 56, 15, -92, 0], [A("s6:lomba"), 30, -9, 0, 58, 14, -100, 0],
    [S7 + 0.3, 2, 0, 0, 46, 10, 40, 0.2], [A("s7:ketinggian"), 3, 0, 0, 40, 8, 42, 0.05], [TD, 2, 0.5, 0, 38, 7, 38, 0], [A("s7:hidung"), 4, 0.5, 0, 30, 7, 48, 0],
    [A("s7:mengerem"), 5, 0.5, 0, 28, 8, 52, 0], [STOP, 3, 0.5, 0, 32, 11, 42, 0], [A("s7:Tidak"), 8, 1, 0, 58, 22, 30, 0.35], [K.s8, 2, 1, 0, 50, 18, 20, 0.2],
    [A("s8:terbang"), 1, 1, 0, 44, 14, -20, 0], [C3, 1, 1, 0, 42, 13, -36, 0],
  ]);
  const AF = V3(650, 0, 0);
  const mapEnd = track([
    [C3, MAPX - 6, SY + 10, SZ + 4, 80, 68, 0], [A("s8:tertukar"), MAPX - 8, SY + 10, SZ + 5, 74, 66, 0], [A("s8:Menurut"), MAPX - 8, SY + 10, SZ + 5, 70, 64, -3], [K.dur, MAPX - 8, SY + 10, SZ + 5, 68, 63, -5],
  ]);
  const tgt = V3(0, 0, 0);
  let fillLevel = 0.28;

  return function draw(t) {
    // ---- jet ----
    const [jx, jy, jz, yaw, pit, rol] = jetT(t);
    const bob = t < STOP - 3 ? Math.sin(t * 1.3) * 0.25 : 0;
    jetRoot.position.set(jx, jy + (jy > 5 ? bob : 0), jz);
    jetRoot.rotation.set((rol * Math.PI) / 180 + (jy > 5 ? Math.sin(t * 0.9) * 0.02 : 0), (yaw * Math.PI) / 180, (pit * Math.PI) / 180);
    const fold = ramp(t, A("s6:layang") - 0.6, A("s6:melayangkan") + 0.8);
    const offL = ramp(t, A("s5:kiri"), A("s5:kiri") + 0.8), offR = ramp(t, A("s5:kanan"), A("s5:kanan") + 0.8);
    const off2 = t < C2 ? 0 : 1; // engines run until the sky-2 segment
    wings.forEach((w) => {
      const dead = off2 * (w.s < 0 ? offL : offR);
      const spin = t * 30 - (t > A("s5:kiri") ? 0 : 0);
      w.fan.rotation.z = -(1 - dead) * spin - dead * (A(w.s < 0 ? "s5:kiri" : "s5:kanan") * 30) - 4 * Math.sin(Math.min(1, dead) * 1.5);
      const on = 1 - dead; w.glowM.opacity = on; w.haloM.opacity = 0.85 * on * (0.85 + 0.15 * Math.sin(t * 17 + w.s));
      w.W.rotation.x = -w.s * (0.06 + 0.1 * fold);
    });
    livM.opacity = 1 - 0.55 * fold;
    creases.forEach((c) => { c.m.visible = t > C2 && fold > c.u * 0.98 + 0.01; });
    const alarm = win(t, A("s5:alarm") - 0.1, K.s6, 0.1, 0.5);
    beaconM.emissiveIntensity = alarm * (Math.sin(t * 14) > 0 ? 3 : 0.2);
    const dark = ramp(t, A("s5:Layar"), A("s5:padam"));
    cockM.emissiveIntensity = 0.25 * (1 - dark); cockM.color.setRGB(0.2 - 0.08 * dark, 0.27 - 0.12 * dark, 0.35 - 0.16 * dark);
    const gear = ramp(t, A("s6:Gimli"), A("s6:sirkuit"));
    mainG.visible = noseG.visible = gear > 0.01; mainG.scale.y = noseG.scale.y = Math.max(0.01, gear);
    noseG.rotation.z = -1.35 * ramp(t, COL, A("s7:hidung"));
    // sky gauge (hook): needle falls to E
    skyGauge.G.visible = t < C1;
    jetRoot.updateMatrixWorld(true);
    jetRoot.getWorldPosition(jp);
    skyGauge.G.position.set(jp.x + 8.8, jp.y - 1.2 + Math.sin(t * 1.1) * 0.2, jp.z + 4);
    skyGauge.G.rotation.set(0, 0.9 + Math.sin(t * 0.8) * 0.06, Math.sin(t * 1.1) * 0.03);
    const lvl = 1 - ramp(t, A("s1:kehabisan") - 0.2, A("s1:bakar") + 0.4);
    skyGauge.piv.rotation.z = ((60 - 120 * lvl) * Math.PI) / 180 + (lvl < 0.05 ? Math.sin(t * 9) * 0.03 : 0);
    // altitude thread
    const altU = win(t, A("s1:kilometer") - 0.4, C1, 0.8, 0.2);
    altDash.forEach((m, i) => { const u = i / altDash.length; m.visible = t < C1 && u < altU; m.position.set(jp.x - 2, jp.y - 1.5 - u * (jp.y - 2), jp.z + 3); });

    // ---- landing details ----
    const scr0 = A("s7:hidung"), scrU = ramp(t, scr0 - 0.1, STOP);
    const nosePt = jet.localToWorld(V3(8.6, -1.0, 0));
    scrapeM.opacity = 0.5 * ramp(t, scr0 - 0.2, scr0 + 0.2);
    { const x0 = 556 + 8.6 - 1.2, x1 = Math.max(x0 + 0.1, nosePt.x); scrape.scale.x = x1 - x0; scrape.position.x = (x0 + x1) / 2; scrape.position.z = 0; }
    const spOn = win(t, scr0 - 0.05, STOP - 0.3, 0.1, 0.4);
    for (let i = 0; i < NS; i++) {
      const b = spB[i], ph = (t * 1.6 + b[0]) % 1;
      sparks.pos[i * 3] = nosePt.x - ph * (3 + b[1] * 5); sparks.pos[i * 3 + 1] = RY + 0.2 + Math.sin(ph * Math.PI) * (0.6 + b[2] * 1.4); sparks.pos[i * 3 + 2] = (b[3] - 0.5) * (1 + ph * 4);
    }
    sparks.commit(); sparks.m.opacity = spOn; sparks.P.visible = spOn > 0.01;
    // the race: two cars launch at "lomba", stop early when the jet comes in
    const race = ramp(t, A("s6:balap"), A("s6:lomba") + 1.6);
    racers[0].position.set(640 + 108 * race, RY, 3.6); racers[1].position.set(640 + 100 * race, RY, -3.6);
    racers.forEach((c) => (c.rotation.y = 0));
    flags.forEach((f, i) => { const p = f.geometry.attributes.position; for (let k = 0; k < p.count; k++) { const x = p.getX(k) + 1.0; p.setZ(k, Math.sin(x * 2.6 - t * 6 + i) * 0.18 * x); } p.needsUpdate = true; });

    // ---- studio props ----
    const mapRoute = ramp(t, A("s2:1983") - 0.4, A("s2:kilogram#2"));
    planR.out.forEach((d) => (d.m.visible = (t >= C1 && t < K.s3 && d.u < mapRoute) || t >= C3));
    const realU = ramp(t, C3 + 0.2, A("s8:menjatuhkan"));
    realR.out.forEach((d) => (d.m.visible = t >= C3 && d.u < realU));
    pins.MTL.visible = pins.OTT.visible = t >= C1; pins.EDM.visible = t >= A("s2:Air") - 0.2;
    pins.RL.visible = t >= C3 + 0.4; pins.GIM.visible = t >= A("s8:tertukar");
    for (const k in pins) { const p = pins[k]; p.scale.setScalar(1.3); }
    if (t < C3) { const s = planR.L * Math.min(0.55, mapRoute * 0.62); const p = planR.at(s), p2 = planR.at(s + 0.3); dart.position.set(p.x, 1.4, p.z); dart.rotation.y = -Math.atan2(p2.z - p.z, p2.x - p.x); }
    else { const s = realR.L * realU; const p = realR.at(Math.min(realR.L - 0.01, s)), p2 = realR.at(Math.min(realR.L, s + 0.3)); dart.position.set(p.x, 1.4, p.z); if (s < realR.L - 0.3) dart.rotation.y = -Math.atan2(p2.z - p.z, p2.x - p.x); }
    dart.scale.setScalar(2.2);
    // bench
    rusak.visible = t >= A("s3:rusak") - 0.1; rusak.rotation.z = 0.12 + 0.12 * Math.sin((t - A("s3:rusak")) * 5) * Math.exp(-(t - A("s3:rusak")) * 1.5);
    bg.piv.rotation.z = (60 * Math.PI) / 180 + 0.25 * Math.sin(t * 2.1) + 0.12 * Math.sin(t * 7.3);
    const dip = ramp(t, A("s3:tongkat") - 0.5, A("s3:celup") + 0.2), lift2 = ramp(t, A("s3:celup") + 0.7, A("s3:Untuk") + 0.3);
    stick.position.set(2.6, 0.55 + 15 * (1 - dip) + 3.5 * lift2, -0.5);
    fillLevel = 0.28 + (0.454 - 0.28) * ramp(t, A("s4:membawa") - 0.2, A("s4:separuhnya") + 0.2);
    fillG.scale.y = FH * fillLevel; wet.scale.y = FH * 0.28 + 0.02; wet.position.y = (FH * 0.28) / 2 - 0.05;
    needLine.visible = t >= A("s4:dua") - 0.2; halfLine.visible = t >= A("s4:kurang") - 0.2;
    const ts = t < A("s3:liter") ? 0 : t < A("s3:satu") ? 1 : t < A("s3:tujuh#2") ? 2 : t < A("s3:pon") ? 3 : t < A("s3:pon") + 0.9 ? 4 : 5;
    if (ts !== tapeState) { tapeState = ts; paintTape(ts); }
    const pop = ramp(t, A("s4:Komputer") - 0.3, A("s4:Komputer") + 0.4);
    hingeC.rotation.x = -(1 - pop) * 1.45; comp3.visible = pop > 0.01;

    // ---- camera ----
    let mode;
    if (t < C1) { const [dx, dy, dz, d, el, az] = sky1(t); tgt.set(jp.x + dx, jp.y + 2.85 + dy, jp.z + dz); mode = [d, el, az]; }
    else if (t < K.s3) { const [x, y, z, d, el, az] = mapT(t); tgt.set(x, y, z); mode = [d, el, az]; }
    else if (t < C2) { const [x, y, z, d, el, az] = benchT(t); tgt.set(x, y, z); mode = [d, el, az]; }
    else if (t < C3) { const [dx, dy, dz, d, el, az, w] = sky2(t); tgt.set(jp.x + dx, jp.y + 2.85 + dy, jp.z + dz).lerp(AF, w); mode = [d, el, az]; }
    else { const [x, y, z, d, el, az] = mapEnd(t); tgt.set(x, y, z); mode = [d, el, az]; }
    const [d, el, az] = mode, e = (el * Math.PI) / 180, a = (az * Math.PI) / 180;
    cam.position.set(tgt.x + d * Math.cos(e) * Math.sin(a), tgt.y + d * Math.sin(e), tgt.z + d * Math.cos(e) * Math.cos(a));
    if (cam.position.y < RY + 1.2) cam.position.y = RY + 1.2;
    cam.lookAt(tgt);
    const studio = (t >= C1 && t < C2) || t >= C3;
    scene.fog.near = studio ? 900 : 140; scene.fog.far = studio ? 2400 : 760;
    key.target.position.copy(tgt); key.position.copy(tgt).add(V3(-45, 95, 60));
    key.shadow.camera.left = key.shadow.camera.bottom = studio ? -40 : -48; key.shadow.camera.right = key.shadow.camera.top = studio ? 40 : 48; key.shadow.camera.updateProjectionMatrix();
    clouds.forEach((c) => (c.visible = !studio));
    bp.strength = 0.1;

    for (const tg of tags) tg.update(t);
    comp.render();
  };
}
