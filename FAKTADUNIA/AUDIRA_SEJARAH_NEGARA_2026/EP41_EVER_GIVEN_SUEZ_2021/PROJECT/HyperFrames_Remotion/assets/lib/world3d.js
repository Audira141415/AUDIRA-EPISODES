// EP41 EVER GIVEN, SUEZ 2021: TOYDIORAMA. A tabletop desert-and-canal model ("MAKET AUDIRA", km 151 signpost).
// One toy container ship with stacked rounded containers sails up a narrow resin-blue canal, a sandstorm blows in,
// swirl ribbons push the container stacks like a sail and the ship wedges diagonally, bow in one bank, stern in the
// other. A tiny yellow excavator digs at the towering bow (the hook image), a queue of toy ships fills the canal
// behind, ripple rings spread over the table to three shipping-crate pedestals (chip, sheep on a boat, garden gnome),
// then a dredger, ballast jets and 14 tugs pull the ship free. A kraft route map on an easel is a separate set (s2).
// Finishing: RoomEnvironment (scene.environmentIntensity 0.55), Neutral tone mapping at exposure 1.0, warm sun with
// soft shadows that follow the camera target, blob contact shadows, blurred foreground props riding with the camera.
// Everything is a pure function of t.
import * as THREE from "./three.module.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, ramp, eout, clamp01, canvasTex, stage, back, pts } from "./lib3d.js";
import { GEO_W, GEO_S } from "./geo.js";

const V3 = THREE.Vector3;
const INK = "#2A1E17", KRAFT = "#DCC093";

// Hermite track with harmonic-mean tangents: never overshoots a key.
function track(keys) {
  keys.sort((a, b) => a[0] - b[0]);
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

// Rounded box: segmented unit box whose outer segments are bent onto quarter circles. Exact normals.
const rbC = {};
function rb(w, h, d, r = 0.1, seg = 3) {
  const key = [w, h, d, r, seg].join();
  if (rbC[key]) return rbC[key];
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const S = seg * 2 + 1, hs = 0.5 / S;
  const g = new THREE.BoxGeometry(1, 1, 1, S, S, S);
  const pa = g.attributes.position, na = g.attributes.normal;
  const bx = w / 2 - r, by = h / 2 - r, bz = d / 2 - r, p = new V3(), n = new V3();
  for (let i = 0; i < pa.count; i++) {
    p.fromBufferAttribute(pa, i);
    n.set(p.x - Math.sign(p.x) * hs, p.y - Math.sign(p.y) * hs, p.z - Math.sign(p.z) * hs).normalize();
    pa.setXYZ(i, Math.sign(p.x) * bx + n.x * r, Math.sign(p.y) * by + n.y * r, Math.sign(p.z) * bz + n.z * r);
    na.setXYZ(i, n.x, n.y, n.z);
  }
  return (rbC[key] = g);
}

// Canal cross-section: bed, sloped banks, flat desert with soft dunes far out.
const BED = -0.28, TOP = 0.1, W0 = 1.05, W1 = 1.8;
function H(x, z) {
  const ax = Math.abs(x);
  if (ax < W0) return BED;
  if (ax < W1) { const u = (ax - W0) / (W1 - W0); return BED + (TOP - BED) * u * u * (3 - 2 * u); }
  const far = clamp01((ax - 3.2) / 2.5) * (1 - clamp01((ax - 10) / 1.5));
  return TOP + far * (0.16 * Math.sin(x * 0.8 + z * 0.23) * Math.sin(z * 0.17 - x * 0.3) + 0.08);
}

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp } = stage(canvas, { bg: 0xe9cfa2, exp: 1.0, bloom: [0.06, 0.3, 0.97], fov: 34 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  scene.background = null;
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  scene.fog = new THREE.Fog(0xead2a6, 30, 120);
  cam.setViewOffset(1080, 1920, 0, 150, 1080, 1920);
  scene.add(cam);

  // ---------- sky dome (vertex gradient, tinted by the storm) ----------
  const skyG = new THREE.SphereGeometry(400, 32, 24);
  { const c = [], pa = skyG.attributes.position, top = new THREE.Color("#7FB4D8"), mid = new THREE.Color("#CFE1E6"), hor = new THREE.Color("#F2DDB4"), x = new THREE.Color();
    for (let i = 0; i < pa.count; i++) { const y = pa.getY(i) / 400; if (y > 0.25) x.copy(mid).lerp(top, clamp01((y - 0.25) / 0.6)); else x.copy(hor).lerp(mid, clamp01((y + 0.05) / 0.3)); c.push(x.r, x.g, x.b); }
    skyG.setAttribute("color", new THREE.Float32BufferAttribute(c, 3)); }
  const skyM = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, toneMapped: true });
  const sky = new THREE.Mesh(skyG, skyM); scene.add(sky);
  const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(14, 40), new THREE.MeshBasicMaterial({ color: "#FFF1C9", fog: false, transparent: true, opacity: 0.9 }));
  sunDisc.position.set(-150, 120, -300); sunDisc.lookAt(0, 0, 0); scene.add(sunDisc);

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0xd6e8ff, 0xd9b27a, 0.75); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe0b4, 2.6);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 60 });
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xb9cfff, 0.45); fill.position.set(8, 5, 6); scene.add(fill);

  // ---------- textures ----------
  const labels = [];
  const label = (w, h, paint) => { const tx = canvasTex(w, h, paint); labels.push([tx, paint]); return tx; };
  let fontsOk = false;
  const FT = (px) => `${px}px 'Titan One', 'Arial Black', sans-serif`;
  const FM = (px) => `700 ${px}px 'Space Mono', 'Courier New', monospace`;
  try { document.fonts.load(FT(40)); document.fonts.load(FM(40)); } catch (e) { /* no font api */ }
  const noise = (seed, base, amp, rep) => { const tx = canvasTex(256, 256, (g, w, h) => { const q = mulberry(seed); const im = g.createImageData(w, h); for (let i = 0; i < w * h; i++) { const v = base + q() * amp; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } g.putImageData(im, 0, 0); }, rep); tx.colorSpace = THREE.NoColorSpace; return tx; };
  const grainT = noise(21, 118, 40, [3, 3]);
  const sandT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#E6C48E"; g.fillRect(0, 0, w, h); const q = mulberry(9); for (let i = 0; i < 26000; i++) { const v = q(); g.fillStyle = v < 0.45 ? "rgba(150,105,55,.10)" : v < 0.9 ? "rgba(255,240,205,.16)" : "rgba(120,80,40,.22)"; const s = 1 + q() * 2.4; g.fillRect(q() * w, q() * h, s, s); } for (let k = 0; k < 40; k++) { g.strokeStyle = "rgba(170,120,70,.08)"; g.lineWidth = 3; g.beginPath(); const y = q() * h; g.moveTo(0, y); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.03 + k) * 6); g.stroke(); } }, [40, 200]);
  const sandBump = noise(33, 90, 120, [40, 200]);
  const rippleT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); const q = mulberry(4); for (let i = 0; i < 90; i++) { g.strokeStyle = q() < 0.5 ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.25)"; g.lineWidth = 2 + q() * 4; g.beginPath(); const y = q() * h, x = q() * w; g.moveTo(x - 40, y); g.quadraticCurveTo(x, y + 8 * (q() - 0.5), x + 40, y); g.stroke(); } }, [3, 120]);
  rippleT.colorSpace = THREE.NoColorSpace;
  const corrT = canvasTex(64, 64, (g, w, h) => { g.fillStyle = "#888"; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 8) { g.fillStyle = "#c8c8c8"; g.fillRect(x, 0, 3, h); g.fillStyle = "#4a4a4a"; g.fillRect(x + 5, 0, 2, h); } }, [3, 1]);
  corrT.colorSpace = THREE.NoColorSpace;
  const plankT = canvasTex(256, 256, (g, w, h) => { const q = mulberry(5); const cols = ["#B07A45", "#A06C3D", "#BB8650", "#9A6638"]; for (let i = 0; i < 4; i++) { g.fillStyle = cols[i]; g.fillRect(0, i * 64, w, 64); for (let k = 0; k < 14; k++) { g.strokeStyle = "rgba(70,35,10,.2)"; g.lineWidth = 1 + q() * 2; g.beginPath(); const y = i * 64 + q() * 64; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + q() * 6 - 3, w * 0.6, y + q() * 6 - 3, w, y); g.stroke(); } g.fillStyle = "rgba(40,20,5,.5)"; g.fillRect(0, i * 64, w, 3); } });
  const blobT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(0,0,0,.62)"); gr.addColorStop(0.5, "rgba(0,0,0,.3)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const woolT = noise(61, 60, 190, [2, 2]);

  // ---------- materials ----------
  const mc = {};
  const once = (k, f) => mc[k] || (mc[k] = f());
  const plastic = (c, ro = 0.62) => once("p" + c + ro, () => new THREE.MeshStandardMaterial({ color: c, roughness: ro, metalness: 0, bumpMap: grainT, bumpScale: 0.25 }));
  const clay = (c) => once("c" + c, () => new THREE.MeshStandardMaterial({ color: c, roughness: 0.84, bumpMap: grainT, bumpScale: 1.1 }));
  const wood = (c = "#B07A45") => once("w" + c, () => new THREE.MeshStandardMaterial({ color: c, roughness: 0.74, map: plankT }));
  const gloss = new THREE.MeshPhysicalMaterial({ color: "#16121A", roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.04 });
  const glint = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const metal = new THREE.MeshStandardMaterial({ color: "#B8BEC6", roughness: 0.3, metalness: 0.85 });
  const brass = new THREE.MeshStandardMaterial({ color: "#D6A84E", roughness: 0.3, metalness: 0.85 });
  const glass = new THREE.MeshPhysicalMaterial({ color: "#20323F", roughness: 0.1, clearcoat: 1 });
  const mk = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const grp = (x = 0, y = 0, z = 0, p = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
  const blobM = new THREE.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false, toneMapped: false });
  const blob = (p, x, z, sx, sz, y = 0.01) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), blobM); m.rotation.x = -Math.PI / 2; m.scale.set(sx, sz, 1); m.position.set(x, y, z); m.renderOrder = 2; p.add(m); return m; };
  const SPH = (rr, s = 20) => once("sph" + rr + s, () => new THREE.SphereGeometry(rr, s, Math.round(s * 0.7)));
  const CYL = (a, b, h, s = 20) => once("cyl" + [a, b, h, s], () => new THREE.CylinderGeometry(a, b, h, s));
  const pop = (o, t, a, d = 0.4, s = 1) => { const k = t < a ? 0 : back(clamp01((t - a) / d), 1.9); o.scale.setScalar(Math.max(0.0001, k * s)); o.visible = k > 0.001; return k; };

  // ---------- kraft tags (floor labels) ----------
  function paintTag(g, w, h, lines, tape = "rgba(240,120,80,.8)") {
    g.clearRect(0, 0, w, h);
    g.fillStyle = KRAFT; g.beginPath(); g.roundRect(6, 20, w - 12, h - 26, 14); g.fill();
    const q = mulberry(w * 7 + h);
    for (let i = 0; i < 200; i++) { g.strokeStyle = q() < 0.5 ? "rgba(120,80,40,.16)" : "rgba(255,240,210,.22)"; g.lineWidth = 1 + q(); const x = q() * w, y = 20 + q() * (h - 26); g.beginPath(); g.moveTo(x, y); g.lineTo(x + q() * 18 - 9, y + q() * 6 - 3); g.stroke(); }
    g.strokeStyle = "rgba(70,45,20,.45)"; g.lineWidth = 4; g.beginPath(); g.roundRect(6, 20, w - 12, h - 26, 14); g.stroke();
    g.save(); g.translate(w / 2, 24); g.rotate(-0.05); g.fillStyle = tape; g.fillRect(-w * 0.15, -15, w * 0.3, 30); g.fillStyle = "rgba(255,255,255,.25)"; for (let i = -w * 0.15; i < w * 0.15; i += 14) g.fillRect(i, -15, 5, 30); g.restore();
    const tot = lines.reduce((s, l) => s + l[1] * 1.12, 0);
    let y = 20 + (h - 26 - tot) / 2;
    for (const [txt, px, kind, col] of lines) {
      let size = px; const font = (s) => (kind === "M" ? FM(s) : FT(s));
      g.font = font(size); while (g.measureText(txt).width > w - 48 && size > 10) { size -= 2; g.font = font(size); }
      g.fillStyle = col || INK; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, y + px * 0.58); y += px * 1.12;
    }
  }
  // A card lying on the floor, propped up toward the viewer (tilt from flat), yawed by ry.
  function floorTag(x, z, w, h, lines, o = {}) {
    const G = grp(x, (o.y ?? H(x, z)) + 0.02, z);
    const pw = 512, ph = Math.round(pw * h / w);
    const tx = label(pw, ph, (g, W, Hh) => paintTag(g, W, Hh, lines, o.tape));
    const inner = grp(0, 0, 0, G);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tx, transparent: true, roughness: 0.9, alphaTest: 0.05, side: THREE.DoubleSide }));
    pl.position.y = h / 2; pl.castShadow = true; inner.add(pl);
    inner.rotation.x = -(o.tilt ?? 0.55);
    mk(rb(w * 0.9, 0.05, 0.12, 0.02), wood("#8A5A30"), 0, 0.02, 0.06, G);
    G.rotation.y = o.ry || 0;
    return G;
  }

  // ---------- ground: canal strip + desert ----------
  const gG = new THREE.PlaneGeometry(26, 170, 260, 340);
  gG.rotateX(-Math.PI / 2); gG.translate(0, 0, -55);
  { const pa = gG.attributes.position, col = []; const wet = new THREE.Color("#B8925E"), dry = new THREE.Color("#F0D3A0"), x = new THREE.Color();
    for (let i = 0; i < pa.count; i++) { const px = pa.getX(i), pz = pa.getZ(i); const y = H(px, pz); pa.setY(i, y); x.copy(wet).lerp(dry, clamp01((y - BED) / (TOP - BED + 0.05))); col.push(x.r, x.g, x.b); }
    gG.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); gG.computeVertexNormals(); }
  const sandM = new THREE.MeshStandardMaterial({ map: sandT, vertexColors: true, roughness: 0.95, bumpMap: sandBump, bumpScale: 0.6 });
  const ground = mk(gG, sandM); ground.castShadow = false;
  const farT = sandT.clone(); farT.repeat.set(160, 160); farT.needsUpdate = true;
  const farM = new THREE.MeshStandardMaterial({ color: "#F4D9A8", map: farT, roughness: 0.95 });
  for (const s of [-1, 1]) { const far = mk(new THREE.PlaneGeometry(240, 500), farM, s * (12.8 + 120), TOP - 0.004, -55); far.rotation.x = -Math.PI / 2; far.castShadow = false; }
  { const far = mk(new THREE.PlaneGeometry(26, 200), farM, 0, TOP - 0.004, -240); far.rotation.x = -Math.PI / 2; far.castShadow = false; }
  // water: glossy toy resin
  const waterM = new THREE.MeshPhysicalMaterial({ color: "#2C8EC2", roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.08, bumpMap: rippleT, bumpScale: 0.6, transparent: true, opacity: 0.9 });
  const water = mk(new THREE.PlaneGeometry(3.4, 170), waterM, 0, 0, -55); water.rotation.x = -Math.PI / 2; water.castShadow = false;
  // bank edge kerbs (toy rock revetment) and a service road + palms on the banks
  for (const s of [-1, 1]) {
    const road = mk(new THREE.PlaneGeometry(0.42, 170), plastic("#5E5A57", 0.8), s * 2.9, TOP + 0.006, -55); road.rotation.x = -Math.PI / 2; road.castShadow = false;
    const dash = mk(new THREE.PlaneGeometry(0.03, 170), new THREE.MeshStandardMaterial({ color: "#F4E3B0", roughness: 0.6 }), s * 2.9, TOP + 0.01, -55); dash.rotation.x = -Math.PI / 2; dash.castShadow = false;
  }
  function palm(x, z, s = 1) {
    const G = grp(x, H(x, z), z); G.scale.setScalar(s);
    for (let i = 0; i < 6; i++) { const m = mk(CYL(0.035 - i * 0.002, 0.04 - i * 0.002, 0.13, 10), clay(i % 2 ? "#8C5E34" : "#9E6B3C"), Math.sin(i * 0.4) * 0.02 * i, 0.065 + i * 0.12, 0, G); m.rotation.z = 0.05 * i; }
    for (let k = 0; k < 7; k++) { const a = (k / 7) * Math.PI * 2; const L = mk(rb(0.42, 0.025, 0.12, 0.012), clay(k % 2 ? "#4E9A4B" : "#3F8740"), Math.cos(a) * 0.19 + 0.06, 0.78, Math.sin(a) * 0.19, G); L.rotation.set(0, -a, -0.45); }
    blob(G, 0.03, 0, 0.5, 0.5, 0.012);
    return G;
  }
  { const q = mulberry(17); for (let i = 0; i < 26; i++) { const s = i % 2 ? 1 : -1; const z = 8 - i * 3.3 + q() * 1.2; if (s > 0 && z > -1.5 && z < 7) continue; palm(s * (3.45 + q() * 0.5), z, 0.8 + q() * 0.35); } }
  for (const [x, z, s] of [[-4.4, 3.2, 1.1], [-5.2, 0.6, 0.9], [4.6, -2.4, 1.0], [-4.1, -4.5, 0.85]]) palm(x, z, s);

  // km 151 signpost with the AUDIRA plaque (brand inside the world)
  const signT = label(512, 360, (g, w, h) => {
    g.fillStyle = "#F5F1E6"; g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, 28); g.fill();
    g.strokeStyle = "#2B3A55"; g.lineWidth = 14; g.beginPath(); g.roundRect(24, 24, w - 48, h - 48, 20); g.stroke();
    g.fillStyle = "#2B3A55"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = FT(118); g.fillText("KM 151", w / 2, 140);
    g.fillStyle = "#C2462F"; g.beginPath(); g.roundRect(70, 222, w - 140, 76, 14); g.fill();
    g.fillStyle = "#fff"; g.font = FM(40); g.fillText("MAKET AUDIRA", w / 2, 262);
  });
  const sign = grp(-2.5, TOP, -3.1);
  mk(CYL(0.025, 0.025, 0.55, 10), metal, -0.16, 0.27, 0, sign); mk(CYL(0.025, 0.025, 0.55, 10), metal, 0.16, 0.27, 0, sign);
  mk(rb(0.56, 0.4, 0.04, 0.03), plastic("#2B3A55"), 0, 0.62, -0.005, sign);
  const signP = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.366), new THREE.MeshStandardMaterial({ map: signT, roughness: 0.6 })); signP.position.set(0, 0.62, 0.017); sign.add(signP);
  sign.rotation.y = 0.55;
  blob(sign, 0, 0, 0.7, 0.3);

  // ---------- the hero ship ----------
  const L = 4.4, B = 0.31;
  function hullGeo(h) {
    const s = new THREE.Shape();
    s.moveTo(-B, -L / 2 + 0.08); s.quadraticCurveTo(-B, -L / 2, -B + 0.08, -L / 2); s.lineTo(B - 0.08, -L / 2); s.quadraticCurveTo(B, -L / 2, B, -L / 2 + 0.08);
    s.lineTo(B, L / 2 - 0.95); s.bezierCurveTo(B, L / 2 - 0.35, 0.12, L / 2, 0, L / 2); s.bezierCurveTo(-0.12, L / 2, -B, L / 2 - 0.35, -B, L / 2 - 0.95); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 24 });
    g.rotateX(-Math.PI / 2);
    return g;
  }
  const ship = grp(0, 0, 0);
  const shipBody = grp(0, 0, 0, ship);
  mk(hullGeo(0.13), plastic("#B5372E", 0.55), 0, -0.13, 0, shipBody);
  mk(hullGeo(0.42), plastic("#22324A", 0.5), 0, 0.02, 0, shipBody);
  { const s = new THREE.Shape(); s.moveTo(-B + 0.03, -L / 2 + 0.06); s.lineTo(B - 0.03, -L / 2 + 0.06); s.lineTo(B - 0.03, L / 2 - 0.95); s.bezierCurveTo(B - 0.03, L / 2 - 0.4, 0.1, L / 2 - 0.06, 0, L / 2 - 0.06); s.bezierCurveTo(-0.1, L / 2 - 0.06, -B + 0.03, L / 2 - 0.4, -B + 0.03, L / 2 - 0.95); s.closePath();
    const dg = new THREE.ShapeGeometry(s); dg.rotateX(-Math.PI / 2); mk(dg, plastic("#6E7C70", 0.7), 0, 0.466, 0, shipBody); }
  // white boot-top line
  for (const sx of [-1, 1]) mk(rb(0.012, 0.03, 3.3, 0.005), plastic("#EDEDE6"), sx * (B + 0.02), 0.04, 0.45, shipBody);
  const nameT = label(1024, 150, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "#F4F2EA"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = FT(120); g.fillText("EVER GIVEN", w / 2, h / 2 + 4); });
  for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.17), new THREE.MeshStandardMaterial({ map: nameT, transparent: true, roughness: 0.5 })); p.position.set(sx * (B + 0.024), 0.29, -0.55); p.rotation.y = sx * Math.PI / 2; shipBody.add(p); }
  // deckhouse (forward third), funnel aft
  const dh = grp(0, 0.47, -0.95, shipBody);
  mk(rb(0.6, 0.62, 0.24, 0.03), plastic("#F1EEE6", 0.5), 0, 0.31, 0, dh);
  for (let i = 0; i < 5; i++) mk(rb(0.56, 0.025, 0.01, 0.005), glass, 0, 0.12 + i * 0.1, -0.122, dh);
  mk(rb(0.86, 0.06, 0.16, 0.02), plastic("#F1EEE6", 0.5), 0, 0.6, 0, dh);
  mk(rb(0.8, 0.045, 0.012, 0.006), glass, 0, 0.6, -0.08, dh);
  mk(CYL(0.01, 0.01, 0.22, 6), metal, 0, 0.74, 0.04, dh);
  const fn = grp(0, 0.47, 1.92, shipBody);
  mk(rb(0.2, 0.34, 0.24, 0.04), plastic("#22324A", 0.5), 0, 0.17, 0, fn);
  mk(rb(0.205, 0.05, 0.245, 0.01), plastic("#F1EEE6", 0.5), 0, 0.26, 0, fn);
  // containers: instanced rounded boxes, toy colours, ribbed sides
  const CPAL = ["#D6453A", "#2F6DB5", "#F08A2E", "#2A9D8F", "#F2C94C", "#8A939C", "#3E8E4E", "#E8E2D2", "#B23A60", "#6A4C9C"];
  const conts = [];
  { const q = mulberry(41); for (let b = 0; b < 17; b++) { const z = -1.62 + b * 0.205; if (z > -1.18 && z < -0.72) continue; if (z > 1.75) continue; const nose = clamp01((z + 1.7) / 0.6); for (let rIdx = 0; rIdx < 6; rIdx++) { const x = (rIdx - 2.5) * 0.098; if (nose < 1 && Math.abs(x) > 0.1 + nose * 0.2) continue; const tiers = 3 + Math.floor(q() * 2.4) + (Math.abs(z) < 1.2 ? 1 : 0); for (let k = 0; k < tiers; k++) conts.push([x, 0.515 + k * 0.09, z, CPAL[Math.floor(q() * CPAL.length)]]); } } }
  const contM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, bumpMap: corrT, bumpScale: 1.2 });
  const contIM = new THREE.InstancedMesh(rb(0.094, 0.086, 0.198, 0.01, 2), contM, conts.length);
  contIM.castShadow = contIM.receiveShadow = true;
  { const M4 = new THREE.Matrix4(), c = new THREE.Color(); conts.forEach(([x, y, z, col], i) => { M4.makeTranslation(x, y, z); contIM.setMatrixAt(i, M4); contIM.setColorAt(i, c.set(col)); }); }
  shipBody.add(contIM);
  const shipBlob = blob(ship, 0, 0, 1.1, 5.0, 0.012);

  // ---------- queue ships (lighter build) ----------
  const stripeT = canvasTex(512, 32, (g, w, h) => { const q = mulberry(8); for (let x = 0; x < w; x += 16) { g.fillStyle = CPAL[Math.floor(q() * CPAL.length)]; g.fillRect(x, 0, 16, h); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(x + 14, 0, 2, h); } });
  stripeT.wrapS = THREE.RepeatWrapping;
  const HULLC = ["#22324A", "#5A2430", "#1F2B2A", "#2C4F6B", "#3A3A42", "#1E5A55"];
  function liteShip(seed) {
    const q = mulberry(seed); const len = 2.4 + q() * 1.2, w = 0.4 + q() * 0.08;
    const G = grp(0, 0, 0);
    mk(rb(w, 0.12, len, 0.05), plastic("#B5372E", 0.55), 0, -0.06, 0, G);
    mk(rb(w, 0.24, len, 0.07), plastic(HULLC[Math.floor(q() * HULLC.length)], 0.5), 0, 0.12, 0, G);
    const bow = mk(CYL(0.0, w / 2, 0.36, 4), plastic("#2A2A30", 0.5), 0, 0.08, -len / 2 - 0.1, G); bow.rotation.x = -Math.PI / 2; bow.rotation.y = Math.PI / 4; bow.scale.set(1, 1, 0.7);
    mk(rb(w * 0.9, 0.36, 0.2, 0.03), plastic("#F1EEE6", 0.5), 0, 0.42, len / 2 - 0.3, G);
    const nb = 2 + Math.floor(q() * 3);
    for (let i = 0; i < nb; i++) { const l = (len - 0.75) / nb - 0.04; const tx = stripeT.clone(); tx.offset.x = q(); tx.repeat.set(0.35, 1); tx.needsUpdate = true; const hh = 0.12 + Math.floor(q() * 3) * 0.08;
      const m = mk(rb(w * 0.88, hh, l, 0.015), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.6, bumpMap: corrT, bumpScale: 0.8 }), 0, 0.24 + hh / 2, -len / 2 + 0.25 + l / 2 + i * (l + 0.04), G); }
    blob(G, 0, 0, w * 2.2, len * 1.05, 0.012);
    return { G, len };
  }
  const queue = [];
  for (let i = 0; i < 24; i++) { const s = liteShip(100 + i); s.z = -5.2 - i * 4.1; s.x = (i % 2 ? 0.12 : -0.12); queue.push(s); }

  // ---------- excavator (tiny, yellow) ----------
  const exc = grp(-2.22, TOP, -1.22);
  { const yel = plastic("#F2B51E", 0.55), dk = plastic("#2A2A2E", 0.7);
    for (const s of [-1, 1]) mk(rb(0.26, 0.05, 0.06, 0.022), dk, 0, 0.025, s * 0.065, exc);
    mk(rb(0.18, 0.04, 0.12, 0.012), dk, 0, 0.065, 0, exc);
    const body = grp(0, 0.085, 0, exc); exc.userData.body = body;
    mk(rb(0.2, 0.06, 0.15, 0.02), yel, -0.02, 0.03, 0, body);
    mk(rb(0.08, 0.09, 0.075, 0.015), yel, 0.04, 0.1, 0.035, body);
    mk(rb(0.06, 0.05, 0.005, 0.004), glass, 0.08, 0.11, 0.035, body).rotation.y = Math.PI / 2;
    mk(rb(0.06, 0.05, 0.08, 0.01), plastic("#C9C3B6", 0.6), -0.09, 0.075, -0.02, body);
    const boom = grp(0.06, 0.06, -0.03, body); exc.userData.boom = boom;
    mk(rb(0.2, 0.03, 0.03, 0.01), yel, 0.1, 0, 0, boom);
    const arm = grp(0.2, 0, 0, boom); exc.userData.arm = arm;
    mk(rb(0.16, 0.022, 0.024, 0.008), yel, 0.07, 0, 0, arm);
    const bk = grp(0.15, 0, 0, arm); exc.userData.bucket = bk;
    mk(rb(0.05, 0.04, 0.05, 0.008), dk, 0.02, -0.015, 0, bk);
    blob(exc, 0, 0, 0.4, 0.3, 0.008);
  }
  exc.rotation.y = 0.3;
  const dirt = grp(-1.98, 0, -1.32); // pushed-up sand mounds at the bow
  for (const [x, z, s] of [[0, 0, 0.32], [0.15, 0.22, 0.24], [-0.12, -0.2, 0.22], [0.22, -0.12, 0.18]]) { const m = mk(SPH(1, 16), clay("#D9B077"), x, H(-1.98 + x, -1.32 + z) - 0.02, z, dirt); m.scale.set(s * 0.6, s * 0.25, s * 0.6); }
  const dirt2 = dirt.clone(); dirt2.position.set(1.98, 0, 1.32); scene.add(dirt2);

  // ---------- tugs ----------
  function tug(c) {
    const G = grp(0, 0, 0);
    mk(rb(0.16, 0.08, 0.36, 0.05), plastic(c, 0.5), 0, 0.02, 0, G);
    mk(rb(0.18, 0.03, 0.38, 0.015), plastic("#2A2A2E", 0.8), 0, 0.0, 0, G);
    mk(rb(0.1, 0.08, 0.12, 0.02), plastic("#F1EEE6", 0.5), 0, 0.1, 0.03, G);
    mk(rb(0.09, 0.02, 0.005, 0.004), glass, 0, 0.12, -0.032, G);
    mk(CYL(0.018, 0.02, 0.07, 10), plastic("#2A2A2E", 0.5), 0, 0.17, 0.07, G);
    blob(G, 0, 0, 0.35, 0.55, 0.01);
    return G;
  }
  const TUGC = ["#D6453A", "#F08A2E", "#2F6DB5"];
  const tugs = []; const lineM = new THREE.MeshStandardMaterial({ color: "#F2E6C8", roughness: 0.8 });
  // [x, z, yaw, attach local z on ship]
  const TP = [[-0.75, 3.0, 0.2, 2.1], [-0.25, 3.3, 0.1, 2.1], [0.3, 3.5, 0, 2.0], [-0.95, 3.9, 0.3, 1.8], [0.0, 4.1, 0, 1.9], [0.75, 3.1, -0.2, 2.0], [-0.55, 4.5, 0.2, 1.7],
    [0.75, -3.0, Math.PI - 0.2, -2.1], [0.25, -3.3, Math.PI, -2.1], [-0.3, -3.5, Math.PI, -2.0], [0.95, -3.9, Math.PI + 0.3, -1.8], [0.0, -4.1, Math.PI, -1.9], [-0.75, -3.1, Math.PI + 0.2, -2.0], [0.55, -4.5, Math.PI - 0.2, -1.7]];
  TP.forEach((p, i) => { const G = tug(TUGC[i % 3]); const ln = mk(CYL(0.006, 0.006, 1, 6), lineM); ln.castShadow = false; tugs.push({ G, ln, p }); });

  // ---------- dredger ----------
  const dred = grp(-0.55, 0, -3.0);
  mk(rb(0.42, 0.12, 0.8, 0.04), plastic("#C9473A", 0.5), 0, 0.02, 0, dred);
  mk(rb(0.3, 0.2, 0.22, 0.03), plastic("#F1EEE6", 0.5), 0, 0.17, 0.22, dred);
  mk(rb(0.06, 0.06, 0.6, 0.02), plastic("#F2B51E", 0.5), 0, 0.02, -0.55, dred).rotation.x = 0.35;
  const cutter = mk(SPH(0.07, 12), metal, 0, -0.08, -0.82, dred);
  { const c = new THREE.CatmullRomCurve3([new V3(0.1, 0.12, 0.1), new V3(-0.5, 0.25, 0.3), new V3(-1.2, 0.5, 0.4), new V3(-1.9, 0.62, 0.55)]); mk(new THREE.TubeGeometry(c, 30, 0.028, 8), plastic("#3A3A40", 0.6), 0, 0, 0, dred); }
  blob(dred, 0, 0, 0.7, 1.1, 0.01);
  const plume = pts(scene, 260, { color: 0xd9ad70, size: 0.05, add: false, opacity: 0.95 });
  const jets = pts(scene, 300, { color: 0x8fd0ff, size: 0.13, add: false, opacity: 1 });
  const sand = pts(scene, 1800, { color: 0xc98f4c, size: 0.16, add: false, opacity: 0.0 });
  const SQ = mulberry(71); const sandP = Array.from({ length: 1800 }, () => [SQ() * 16, SQ() * 3.2, SQ() * 16 - 6, 0.6 + SQ() * 0.8]);

  // ---------- wind swirl ribbons ----------
  const ribM = new THREE.MeshStandardMaterial({ color: "#FFF8EA", roughness: 0.5, emissive: "#FFF1D2", emissiveIntensity: 0.25, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
  const ribs = [];
  for (let i = 0; i < 6; i++) {
    const y0 = 0.45 + (i % 3) * 0.32, z0 = 0.6 + i * 0.55, pp = [];
    for (let k = 0; k <= 60; k++) { const u = k / 60, x = -4.5 + u * 9; const loop = Math.exp(-Math.pow((u - 0.42) * 7, 2)); pp.push(new V3(x - Math.sin(u * 14 + i) * 0.25 * loop, y0 + Math.sin(u * 7 + i) * 0.12 + Math.cos(u * 14 + i) * 0.28 * loop, z0 + Math.sin(u * 5 + i * 2) * 0.2)); }
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pp), 240, 0.028, 6); const m = mk(g, ribM); m.castShadow = false; m.scale.set(1, 1, 1);
    ribs.push({ m, n: g.index.count, ph: i * 0.17 });
  }

  // ---------- football fields (400 m ~ 4 pitches) ----------
  const pitchT = canvasTex(256, 384, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#4FA34E" : "#5BB35A"; g.fillRect(0, (i * h) / 8, w, h / 8 + 1); } g.strokeStyle = "#F7F7F0"; g.lineWidth = 7; g.strokeRect(14, 14, w - 28, h - 28); g.beginPath(); g.moveTo(14, h / 2); g.lineTo(w - 14, h / 2); g.stroke(); g.beginPath(); g.arc(w / 2, h / 2, 34, 0, 7); g.stroke(); g.strokeRect(w / 2 - 60, 14, 120, 50); g.strokeRect(w / 2 - 60, h - 64, 120, 50); });
  const pitches = [0, 1, 2, 3].map((i) => { const m = mk(rb(0.66, 0.03, 1.04, 0.012), new THREE.MeshStandardMaterial({ map: pitchT, roughness: 0.85 }), 2.48, TOP + 0.016, 0.62 + i * 1.1); return m; });
  const pitchTag = floorTag(3.5, 1.9, 1.3, 0.5, [["≈ 4 LAPANGAN BOLA", 56, "T"], ["400 m", 44, "M", "#B5372E"]], { ry: 0.5, tilt: 0.7 });

  // ---------- pedestal crates with ripple props ----------
  const crateT = (txt, col) => label(512, 340, (g, w, h) => { g.fillStyle = "#C99A62"; g.fillRect(0, 0, w, h); const q = mulberry(txt.length * 7); for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? "rgba(90,50,20,.12)" : "rgba(255,230,190,.1)"; g.fillRect(0, (i * h) / 5, w, h / 5); g.fillStyle = "rgba(70,35,10,.5)"; g.fillRect(0, (i * h) / 5, w, 3); } for (let i = 0; i < 300; i++) { g.fillStyle = "rgba(80,40,10,.12)"; g.fillRect(q() * w, q() * h, 20 * q(), 2); } g.strokeStyle = "rgba(60,30,10,.7)"; g.lineWidth = 18; g.strokeRect(9, 9, w - 18, h - 18);
    let px = 96; g.font = FT(px); while (g.measureText(txt).width > w - 70 && px > 20) { px -= 4; g.font = FT(px); } g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + 6); });
  function crate(x, z, txt, col) {
    const G = grp(x, H(x, z), z);
    const tx = crateT(txt, col);
    const side = new THREE.MeshStandardMaterial({ map: tx, roughness: 0.8 }), plain = wood("#C08A54");
    const m = new THREE.Mesh(rb(0.6, 0.36, 0.44, 0.03), plain); m.position.y = 0.18; m.castShadow = m.receiveShadow = true; G.add(m);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.57, 0.33), side); face.position.set(0, 0.18, 0.222); G.add(face);
    blob(G, 0, 0, 1.0, 0.8, 0.01);
    const top = grp(0, 0.36, 0, G);
    return { G, top };
  }
  const PED = [crate(3.55, 0.7, "CIP", "#2B3A55"), crate(3.55, 2.65, "130.000 DOMBA", "#2B3A55"), crate(3.55, 4.6, "KURCACI TAMAN", "#2B3A55")];
  PED.forEach((p) => { p.G.rotation.y = 1.0; });
  // chip
  const chip = grp(0, 0, 0, PED[0].top);
  mk(rb(0.42, 0.06, 0.42, 0.02), new THREE.MeshPhysicalMaterial({ color: "#23262D", roughness: 0.3, clearcoat: 0.7 }), 0, 0.06, 0, chip);
  mk(rb(0.2, 0.012, 0.2, 0.01), brass, 0, 0.096, 0, chip);
  for (let s = 0; s < 4; s++) for (let i = 0; i < 6; i++) { const a = s * Math.PI / 2, o = (i - 2.5) * 0.06; const p = mk(rb(0.03, 0.012, 0.07, 0.004), metal, 0, 0.035, 0, chip); p.position.set(Math.cos(a) * 0.24 + Math.sin(a) * o, 0.035, Math.sin(a) * 0.24 - Math.cos(a) * o); p.rotation.y = -a + Math.PI / 2; }
  // sheep on a little livestock boat
  const sheepG = grp(0, 0, 0, PED[1].top);
  mk(rb(0.74, 0.1, 0.4, 0.05), plastic("#2F6DB5", 0.5), 0, 0.05, 0, sheepG);
  mk(rb(0.76, 0.02, 0.42, 0.01), plastic("#F1EEE6", 0.5), 0, 0.105, 0, sheepG);
  const woolM = new THREE.MeshStandardMaterial({ color: "#F7F2E6", roughness: 0.95, bumpMap: woolT, bumpScale: 2.5 });
  const sheep = [];
  for (const [x, z, ry] of [[-0.2, 0.02, 0.3], [0.05, -0.06, -0.2], [0.25, 0.06, 0.1]]) {
    const S = grp(x, 0.11, z, sheepG);
    for (const [bx, by, bz, br] of [[0, 0.11, 0, 0.075], [0.05, 0.12, 0.02, 0.06], [-0.05, 0.12, -0.02, 0.06], [0.0, 0.15, 0.0, 0.06], [-0.02, 0.1, 0.04, 0.055]]) mk(SPH(br, 14), woolM, bx, by, bz, S);
    const hd = grp(0.1, 0.15, 0, S); mk(rb(0.06, 0.06, 0.05, 0.02), plastic("#2A2626", 0.7), 0.0, 0, 0, hd);
    for (const s of [-1, 1]) { mk(SPH(0.009, 8), gloss, 0.025, 0.012, s * 0.02, hd); const e = mk(rb(0.01, 0.03, 0.02, 0.005), plastic("#2A2626", 0.7), -0.01, 0.02, s * 0.034, hd); e.rotation.x = s * 0.6; }
    for (const [lx, lz] of [[0.04, 0.03], [0.04, -0.03], [-0.04, 0.03], [-0.04, -0.03]]) mk(CYL(0.008, 0.008, 0.07, 6), plastic("#2A2626", 0.7), lx, 0.035, lz, S);
    S.rotation.y = ry; sheep.push({ S, hd });
  }
  // generic garden gnome
  const gnome = grp(0, 0, 0, PED[2].top);
  { const coat = clay("#2F6DB5"), sk = new THREE.MeshPhysicalMaterial({ color: "#F3C6A0", roughness: 0.55, sheen: 0.6, sheenColor: new THREE.Color("#ffd2c0") });
    mk(rb(0.2, 0.05, 0.16, 0.02), plastic("#3B2A1E", 0.6), 0, 0.025, 0.0, gnome);
    mk(CYL(0.08, 0.12, 0.22, 20), coat, 0, 0.16, 0, gnome);
    mk(CYL(0.122, 0.122, 0.03, 20), plastic("#3B2A1E", 0.5), 0, 0.1, 0, gnome);
    mk(rb(0.03, 0.03, 0.01, 0.005), brass, 0, 0.1, 0.12, gnome);
    mk(SPH(0.09, 20), sk, 0, 0.33, 0, gnome);
    const beard = mk(new THREE.ConeGeometry(0.085, 0.16, 20), clay("#F4F1EA"), 0, 0.25, 0.04, gnome); beard.rotation.x = Math.PI;
    mk(SPH(0.03, 12), clay("#F09A86"), 0, 0.32, 0.085, gnome);
    for (const s of [-1, 1]) { const e = mk(SPH(0.014, 10), gloss, s * 0.035, 0.36, 0.075, gnome); const g2 = new THREE.Mesh(SPH(0.004, 6), glint); g2.position.set(0.004, 0.005, 0.012); e.add(g2); }
    const hat = mk(new THREE.ConeGeometry(0.095, 0.28, 20), clay("#D6453A"), 0, 0.5, -0.01, gnome); hat.rotation.x = -0.18;
    for (const s of [-1, 1]) { const a = grp(s * 0.1, 0.24, 0, gnome); mk(rb(0.05, 0.12, 0.05, 0.02), coat, 0, -0.05, 0.02, a); mk(SPH(0.028, 10), sk, 0, -0.11, 0.04, a); a.rotation.set(-0.5, 0, s * 0.25); }
  }
  const pedTags = [];

  // ---------- ripple rings ----------
  const ringM = () => new THREE.MeshBasicMaterial({ color: "#FFF4D6", transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const rings = Array.from({ length: 9 }, () => { const m = new THREE.Mesh(new THREE.RingGeometry(0.965, 1, 128), ringM()); m.rotation.x = -Math.PI / 2; m.position.y = 0.42; m.renderOrder = 3; scene.add(m); return m; });

  // ---------- floor tags ----------
  const tagHal = floorTag(-2.15, -2.4, 0.8, 0.32, [["HALUAN", 70, "T", "#B5372E"]], { ry: -2.36, tilt: 0.6 });
  const tagBur = floorTag(2.5, 1.95, 1.0, 0.4, [["BURITAN", 70, "T", "#2B3A55"]], { ry: 0.53, tilt: 0.6 });
  const tagJal = floorTag(-2.3, 9.4, 1.1, 0.42, [["1 JALUR", 70, "T", "#2B3A55"], ["± 300 m lebar", 34, "M"]], { ry: 0.3, tilt: 0.6 });
  const tagExc = floorTag(-3.0, -0.35, 1.05, 0.4, [["EKSKAVATOR", 60, "T", "#B5372E"], ["kecil, menggali haluan", 30, "M"]], { ry: 0.85, tilt: 0.6 });
  const tagDre = floorTag(-2.45, -4.7, 1.05, 0.4, [["KAPAL KERUK", 60, "T", "#2B3A55"], ["mengisap pasir", 30, "M"]], { ry: -2.87, tilt: 0.6 });
  const tagTug = floorTag(2.45, 4.9, 1.15, 0.42, [["14 KAPAL TUNDA", 58, "T", "#B5372E"]], { ry: 0.35, tilt: 0.65 });
  const tagHeld = floorTag(2.3, -1.3, 1.25, 0.46, [["DITAHAN MESIR", 56, "T", "#B5372E"], ["> 100 HARI", 40, "M"]], { ry: 1.1, tilt: 0.65 });

  // ---------- map set (separate island at x=-40) ----------
  const MX = -40;
  const mapW = 1024, mapH = 1500;
  const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  const WB = { l0: -10, l1: 108, a0: -6, a1: 58, x: 12, y: 96, w: 1000, h: 640 };
  const SB = { l0: 28.4, l1: 35.6, a0: 27.5, a1: 31.9, x: 12, y: 790, w: 1000, h: 690 };
  const prj = (B, lon, lat) => [B.x + ((lon - B.l0) / (B.l1 - B.l0)) * B.w, B.y + ((merc(B.a1) - merc(lat)) / (merc(B.a1) - merc(B.a0))) * B.h];
  const ROUTE = [[103.5, 1.4], [100.5, 3.2], [97.5, 5.9], [88, 5.6], [80.5, 5.2], [70, 9], [58, 12.5], [50, 12.8], [43.4, 12.7], [40.5, 15.5], [37.5, 21], [34.5, 26.8], [33, 29.0], [32.55, 29.95], [32.33, 30.6], [32.3, 31.3], [28, 33.4], [20, 34.6], [12, 37.6], [5, 37.6], [-2, 36.2], [-5.7, 36.0], [-9.4, 37.4], [-9.6, 43.2], [-4.5, 48.2], [1.5, 50.4], [4.1, 51.95]];
  const CANAL = [[32.3, 31.26], [32.31, 30.9], [32.28, 30.6], [32.36, 30.42], [32.47, 30.3], [32.55, 30.12], [32.57, 29.95]];
  let mapP = -1, mapK = -1;
  function polys(g, B, geo, fillFor) {
    for (const c of geo) { g.fillStyle = fillFor(c.name); for (const ring of c.rings) { g.beginPath(); ring.forEach(([lo, la], i) => { const [x, y] = prj(B, lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fill(); g.stroke(); } }
  }
  function paintMap(g, w, h) {
    const p = Math.max(0, mapP), k = Math.max(0, mapK);
    g.fillStyle = "#E7D3A8"; g.fillRect(0, 0, w, h);
    const q = mulberry(3); for (let i = 0; i < 3000; i++) { g.fillStyle = q() < 0.5 ? "rgba(120,80,40,.06)" : "rgba(255,245,220,.12)"; g.fillRect(q() * w, q() * h, 2 + q() * 4, 2 + q() * 3); }
    g.fillStyle = INK; g.textAlign = "left"; g.textBaseline = "middle"; g.font = FT(46); g.fillText("RUTE EVER GIVEN", 22, 50);
    g.font = FM(24); g.textAlign = "right"; g.fillText("MARET 2021", w - 22, 52);
    for (const [B, geo, lw] of [[WB, GEO_W, 1.2], [SB, GEO_S, 2.2]]) {
      g.save(); g.beginPath(); g.rect(B.x, B.y, B.w, B.h); g.clip();
      g.fillStyle = "#A9D2E3"; g.fillRect(B.x, B.y, B.w, B.h);
      g.strokeStyle = "rgba(90,70,40,.55)"; g.lineWidth = lw;
      polys(g, B, geo, (n) => (n === "Egypt" ? "#E9A15A" : n === "Malaysia" || n === "Netherlands" ? "#F2CF7A" : "#F2E6C6"));
      g.restore();
      g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(B.x, B.y, B.w, B.h);
    }
    // world route (dashed red, drawn by progress)
    const pathW = ROUTE.map(([lo, la]) => prj(WB, lo, la));
    const seg = []; let tot = 0; for (let i = 1; i < pathW.length; i++) { const d = Math.hypot(pathW[i][0] - pathW[i - 1][0], pathW[i][1] - pathW[i - 1][1]); seg.push(d); tot += d; }
    let rem = tot * p; g.strokeStyle = "#C2362B"; g.lineWidth = 7; g.setLineDash([16, 10]); g.lineCap = "round"; g.beginPath(); g.moveTo(...pathW[0]); let head = pathW[0];
    for (let i = 1; i < pathW.length && rem > 0; i++) { const f = Math.min(1, rem / seg[i - 1]); head = [pathW[i - 1][0] + (pathW[i][0] - pathW[i - 1][0]) * f, pathW[i - 1][1] + (pathW[i][1] - pathW[i - 1][1]) * f]; g.lineTo(...head); rem -= seg[i - 1]; }
    g.stroke(); g.setLineDash([]);
    const dot = (xy, c, r0) => { g.fillStyle = c; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(xy[0], xy[1], r0, 0, 7); g.fill(); g.stroke(); };
    const pill = (txt, x, y, al = "left", bg = "#FFF6E2", fc = INK, px = 26) => { g.font = FM(px); const tw = g.measureText(txt).width; const x0 = al === "left" ? x : al === "right" ? x - tw - 20 : x - tw / 2 - 10; g.fillStyle = bg; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.roundRect(x0, y - px * 0.75, tw + 20, px * 1.5, 8); g.fill(); g.stroke(); g.fillStyle = fc; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(txt, x0 + 10, y + 1); };
    dot(pathW[0], "#F2B51E", 11); dot(pathW[pathW.length - 1], "#F2B51E", 11);
    pill("TANJUNG PELEPAS (MALAYSIA)", pathW[0][0] + 6, pathW[0][1] + 42, "right");
    pill("ROTTERDAM", pathW[pathW.length - 1][0] + 20, pathW[pathW.length - 1][1] - 8, "left");
    const sz = prj(WB, 32.55, 29.95); dot(sz, "#C2362B", 10); pill("SUEZ", sz[0] + 18, sz[1] + 30, "left", "#C2362B", "#fff");
    if (p > 0 && p < 1) dot(head, "#22324A", 9);
    // inset frame from the world map to the zoom
    const z0 = prj(WB, SB.l0, SB.a1), z1 = prj(WB, SB.l1, SB.a0);
    g.strokeStyle = "#C2362B"; g.lineWidth = 4; g.strokeRect(z0[0], z0[1], z1[0] - z0[0], z1[1] - z0[1]);
    g.globalAlpha = 0.6; g.beginPath(); g.moveTo(z0[0], z1[1]); g.lineTo(SB.x, SB.y); g.moveTo(z1[0], z1[1]); g.lineTo(SB.x + SB.w, SB.y); g.stroke(); g.globalAlpha = 1;
    // zoom: canal + labels
    const cp = CANAL.map(([lo, la]) => prj(SB, lo, la));
    g.strokeStyle = INK; g.lineWidth = 16; g.lineJoin = "round"; g.beginPath(); cp.forEach((xy, i) => (i ? g.lineTo(...xy) : g.moveTo(...xy))); g.stroke();
    g.strokeStyle = k > 0.5 ? "#1E7FD0" : "#4FA6D8"; g.lineWidth = 10; g.stroke();
    g.font = FT(44); g.fillStyle = "#2B5C7A"; g.textAlign = "center"; g.fillText("LAUT MEDITERANIA", SB.x + SB.w * 0.42, SB.y + 64);
    g.save(); g.translate(...prj(SB, 34.1, 28.6)); g.rotate(-0.95); g.fillText("LAUT MERAH", 0, 0); g.restore();
    g.font = FT(58); g.fillStyle = "rgba(90,45,15,.55)"; g.fillText("MESIR", ...prj(SB, 30.3, 29.2));
    const ps = prj(SB, 32.3, 31.26), su = prj(SB, 32.57, 29.95), eg = prj(SB, 32.57, 30.02);
    pill("PORT SAID", ps[0] + 22, ps[1] + 10, "left");
    pill("SUEZ", su[0] - 26, su[1] + 34, "right");
    if (k > 0) { pill("TERUSAN SUEZ", cp[3][0] + 34, cp[3][1] - 10, "left", "#2B3A55", "#fff", 28); }
    if (k > 0.5) { dot(eg, "#F2B51E", 14); pill("KM 151", eg[0] + 26, eg[1] - 4, "left", "#C2362B", "#fff", 28); }
  }
  const mapT = label(mapW, mapH, paintMap);
  const mapSet = grp(MX, TOP, 0);
  const MBW = 3.4, MBH = MBW * mapH / mapW;
  const board = grp(0, 0.35 + MBH / 2, 0, mapSet); board.rotation.x = -0.08;
  mk(rb(MBW + 0.22, MBH + 0.22, 0.1, 0.05), wood("#8A5A30"), 0, 0, -0.06, board);
  const mapP3 = new THREE.Mesh(new THREE.PlaneGeometry(MBW, MBH), new THREE.MeshStandardMaterial({ map: mapT, roughness: 0.85 })); mapP3.position.z = 0.0; mapP3.receiveShadow = true; board.add(mapP3);
  for (const [x, y] of [[-1.2, MBH / 2 - 0.02], [1.2, MBH / 2 - 0.02]]) { const tp = mk(rb(0.5, 0.14, 0.01, 0.01), new THREE.MeshStandardMaterial({ color: "#F08A5E", roughness: 0.6, transparent: true, opacity: 0.85 }), x, y, 0.012, board); tp.rotation.z = x > 0 ? 0.2 : -0.2; }
  for (const s of [-1, 1]) { const leg = mk(rb(0.1, MBH + 0.6, 0.1, 0.03), wood("#9A6638"), s * 1.3, (MBH + 0.6) / 2 - 0.05, -0.2, mapSet); leg.rotation.z = s * 0.06; }
  const back2 = mk(rb(0.1, MBH + 0.4, 0.1, 0.03), wood("#9A6638"), 0, (MBH + 0.4) / 2, -0.9, mapSet); back2.rotation.x = 0.3;
  blob(mapSet, 0, -0.2, 4.6, 1.8, 0.01);
  palm(MX - 2.6, -0.8, 1.6); palm(MX + 2.7, -1.2, 1.4); palm(MX + 3.4, 0.6, 1.1);
  const mini = liteShip(400); mini.G.position.set(MX - 1.2, TOP + 0.07, 1.6); mini.G.rotation.y = 1.3; mini.G.scale.setScalar(0.45);

  // ---------- blurred foreground props riding with the camera ----------
  const blurTex = (draw) => canvasTex(512, 512, (g, w, h) => { g.filter = "blur(16px)"; draw(g, w, h); });
  const fgPalm = blurTex((g, w, h) => { g.fillStyle = "#2F5A2E"; for (let k = 0; k < 7; k++) { g.save(); g.translate(w * 0.5, h * 0.55); g.rotate(-1.4 + k * 0.45); g.beginPath(); g.ellipse(120, 0, 140, 34, 0, 0, 7); g.fill(); g.restore(); } g.fillStyle = "#5A3A20"; g.fillRect(w * 0.47, h * 0.55, 30, h); });
  const fgCrate = blurTex((g, w, h) => { const cs = ["#C2462F", "#2F6DB5", "#F08A2E"]; for (let i = 0; i < 3; i++) { g.fillStyle = cs[i]; g.fillRect(70 + i * 20, 150 + i * 110, 380, 105); } });
  const fgM = (tx) => new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, fog: false, opacity: 0.95 });
  const fg1 = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.25), fgM(fgPalm)); fg1.position.set(-0.78, -0.86, -2.4); cam.add(fg1);
  const fg2 = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.05), fgM(fgCrate)); fg2.position.set(0.82, -0.98, -2.4); cam.add(fg2);
  fg1.renderOrder = fg2.renderOrder = 10;

  // ---------- timing ----------
  const T = {
    sel: A("s1:Selama"), dan: A("s2:dan"), ter: A("s2:Terusan"), hanya: A("s2:hanya"), ever: A("s3:Ever"), panj: A("s3:Panjangnya"), emp2: A("s3:empat#2"), badai: A("s3:Badai"), tujuh: A("s3:tujuh"),
    tump: A("s4:Tumpukan"), angin: A("s4:angin"), hil: A("s4:kehilangan"), kandas: A("s4:kandas"), hal: A("s4:Haluannya"), bur: A("s4:buritannya"),
    antre: A("s5:antrean"), tiga: A("s5:tiga"), meng: A("s5:menunggu"), barang: A("s5:Barang"),
    efek: A("s6:Efeknya"), cip: A("s6:cip"), domba: A("s6:domba"), kurc: A("s6:kurcaci"),
    keruk: A("s7:keruk"), air: A("s7:air"), eks: A("s7:ekskavator"), dua7: A("s7:Dua"), emp7: A("s7:empat"), tarik: A("s7:menarik"), lepas: A("s7:lepas"),
    tahan: A("s8:menahan"), ganti: A("s8:ganti"), satu: A("s8:Satu"), menurut: A("s8:Menurut"),
  };
  const WED = { x: 0, z: 0, yaw: 0.9 };
  const sail = track([[T.dan, 13], [T.panj - 0.2, 3.3], [T.badai, 2.6], [T.hil, 1.7]]);
  function shipPose(t) {
    if (t < K.s2) return { ...WED, roll: 0 };
    if (t < T.hil) { const z = sail(t)[0]; const w = ramp(t, T.tump, T.hil); return { x: 0.08 * w, z, yaw: 0.1 * w, roll: 0.035 * w * (1 + 0.3 * Math.sin(t * 3)) }; }
    if (t < T.kandas + 0.5) { const u = ramp(t, T.hil, T.kandas + 0.5); const z0 = sail(T.hil)[0]; return { x: 0.08 * (1 - u), z: z0 * (1 - u), yaw: 0.1 + (WED.yaw - 0.1) * u, roll: 0.035 * (1 - u) }; }
    if (t < T.tarik) { const sh = t < T.kandas + 1.3 ? Math.sin((t - T.kandas - 0.5) * 30) * 0.012 * Math.exp(-(t - T.kandas - 0.5) * 4) : 0; return { x: 0, z: 0, yaw: WED.yaw + sh, roll: sh * 0.5 }; }
    const u = ramp(t, T.tarik, T.tarik + 1.8); return { x: 0, z: 0, yaw: WED.yaw * (1 - u), roll: 0 };
  }

  // ---------- camera shots (cuts happen under panel changes) ----------
  const SHOTS = [
    [-1, track([[0, -0.6, 0.42, 2.55, -1.75, 0.62, -1.15], [T.sel - 0.2, -0.45, 0.5, 2.8, -1.7, 0.64, -1.1], [K.s2 - 0.3, 3.4, 5.4, 10.6, 0.0, 0.2, -1.4], [K.s2, 3.5, 5.5, 10.8, 0.0, 0.2, -1.4]])],
    [K.s2, track([[K.s2, MX + 0.2, 3.2, 13.0, MX, 2.75, 0], [T.ter - 0.3, MX - 0.1, 3.1, 12.2, MX, 2.6, 0], [T.ter + 1.6, MX + 0.1, 2.1, 9.8, MX, 1.85, 0], [T.dan, MX + 0.15, 2.05, 9.4, MX, 1.85, 0]])],
    [T.dan, track([[T.dan, 2.3, 6.4, 18.5, 0, 0.0, 9.8], [T.ever - 0.4, 1.4, 3.6, 12.6, 0, 0.2, 6.0], [T.ever + 0.6, 3.7, 0.95, 6.8, 0, 0.45, 3.4], [T.panj + 0.2, 3.9, 1.3, 6.4, 0.2, 0.4, 2.8], [T.emp2 + 0.3, 6.6, 5.6, 7.6, 1.2, 0.2, 2.3], [T.badai + 0.4, 4.6, 2.3, 7.6, 0.6, 0.45, 2.4], [T.tujuh + 0.8, -3.8, 2.4, 10.4, 0.0, 0.6, 2.2],
      [T.tump + 0.5, -4.4, 2.0, 5.4, 0.0, 0.7, 1.8], [T.hil, -4.6, 2.6, 4.8, 0.0, 0.5, 1.2], [T.kandas + 0.4, 2.0, 6.2, 8.6, 0.0, 0.15, -0.3], [T.hal - 0.1, -0.2, 1.6, 3.6, -1.4, 0.5, -1.0], [T.hal + 1.0, -0.55, 0.6, 2.7, -1.75, 0.6, -1.15],
      [T.bur + 0.2, 4.6, 2.0, 5.3, 1.75, 0.4, 1.35], [K.s5 - 0.1, 3.4, 2.4, 5.6, 1.2, 0.3, 0.6], [T.antre, 1.6, 4.6, 7.0, 0.1, 0.0, -6], [T.meng, 0.9, 7.2, 8.6, 0.0, 0.0, -13], [K.s6 - 0.2, 0.6, 6.0, 7.6, 0.0, 0.0, -9],
      [T.efek + 0.6, 5.2, 8.6, 11.5, 1.3, 0.1, 1.2], [T.cip - 0.3, 6.2, 1.5, 1.7, 3.45, 0.3, 0.7], [T.cip + 1.9, 6.1, 1.55, 1.95, 3.45, 0.3, 0.8], [T.domba - 0.4, 6.2, 1.5, 3.65, 3.45, 0.3, 2.65], [T.domba + 1.8, 6.1, 1.55, 3.9, 3.45, 0.3, 2.75], [T.kurc - 0.4, 6.2, 1.5, 5.6, 3.45, 0.32, 4.6], [K.s7 - 0.3, 6.6, 3.0, 7.4, 2.4, 0.6, 3.2],
      [T.keruk - 0.1, -3.3, 2.0, -6.4, -0.8, 0.3, -2.4], [T.air - 0.3, -3.1, 2.1, -6.0, -0.7, 0.3, -2.6], [T.air + 0.6, -4.8, 4.2, 0.4, -0.4, 0.4, -0.6], [T.air + 1.3, -3.7, 2.3, 4.3, 0.0, 0.4, 0.2], [T.eks - 0.2, -1.15, 0.55, 1.6, -1.95, 0.4, -1.3], [T.dua7 - 0.2, -1.05, 0.62, 1.8, -1.9, 0.42, -1.25], [T.emp7 + 0.2, 3.4, 7.4, 9.6, 0.0, 0.1, -0.2], [T.lepas + 0.4, 2.6, 5.2, 8.2, 0.0, 0.2, 0.0],
      [T.tahan + 0.6, 4.7, 2.2, 2.4, 1.0, 0.4, -0.5], [T.ganti, 4.3, 2.0, 1.8, 1.2, 0.4, -0.7], [T.satu - 0.3, 3.4, 4.0, 7.6, 0.6, 0.3, 0.2], [T.satu + 2.4, 0.4, 11.5, 13.5, 0.0, 0.0, -2.5], [K.end + 3, 0.2, 13.0, 14.6, 0.0, 0.0, -3.5]])],
  ];
  const tgt = new V3();

  let ripT = [T.angin, T.kandas, T.tiga, T.cip, T.domba, T.kurc, T.satu, T.satu + 0.5, T.satu + 1.0];

  return function draw(t) {
    if (!fontsOk) { try { if (document.fonts.check(FT(40)) && document.fonts.check(FM(40))) { fontsOk = true; for (const [tx, paint] of labels) { const c = tx.image; paint(c.getContext("2d"), c.width, c.height); tx.needsUpdate = true; } } } catch (e) { fontsOk = true; } }
    { const p = ramp(t, K.s2 + 0.1, A("s2:Mesir") + 0.3), k = ramp(t, T.ter - 0.1, T.ter + 0.9); const pq = Math.round(p * 40) / 40, kq = k > 0.5 ? 1 : k > 0 ? 0.4 : 0; if (pq !== mapP || kq !== mapK) { mapP = pq; mapK = kq; const c = mapT.image; paintMap(c.getContext("2d"), c.width, c.height); mapT.needsUpdate = true; } }
    // camera
    let shot = SHOTS[0]; for (const s of SHOTS) if (t >= s[0]) shot = s;
    const c = shot[1](t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.04, c[1] + Math.sin(t * 0.29) * 0.03, c[2]);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    const vo = t < K.s2 ? 110 + 40 * ramp(t, T.sel, K.s2 - 0.3) : 150; if (vo !== cam.view.offsetY) cam.setViewOffset(1080, 1920, 0, vo, 1080, 1920);
    const onMap = t >= K.s2 && t < T.dan;
    const camH = c[1];
    fg1.visible = fg2.visible = !onMap && camH < 3.2;
    // sun follows the target so shadows stay crisp
    sun.position.set(tgt.x - 5, tgt.y + 9, tgt.z + 5); sun.target.position.copy(tgt);
    // storm
    const storm = t < K.s2 ? 0 : ramp(t, T.badai - 0.3, T.badai + 1.2) * (1 - ramp(t, T.kandas + 0.6, T.hal + 0.6));
    skyM.color.setRGB(1, 1 - 0.25 * storm, 1 - 0.5 * storm);
    scene.fog.color.setRGB(0.918 - 0.05 * storm, 0.824 - 0.13 * storm, 0.65 - 0.22 * storm);
    scene.fog.near = 30 - 28 * storm; scene.fog.far = 120 - 95 * storm;
    sun.intensity = 2.6 * (1 - 0.45 * storm); sun.color.setRGB(1, 0.88 - 0.1 * storm, 0.7 - 0.15 * storm);
    sand.m.opacity = 0.85 * storm;
    if (storm > 0.001) { for (let i = 0; i < sandP.length; i++) { const p = sandP[i]; const x = ((p[0] + t * 5.5 * p[3]) % 16) - 8; sand.pos[i * 3] = tgt.x + x; sand.pos[i * 3 + 1] = 0.3 + p[1] + Math.sin(t * 3 + i) * 0.05; sand.pos[i * 3 + 2] = tgt.z + p[2]; } sand.commit(); }
    sand.P.visible = storm > 0.001;
    // water ripples
    rippleT.offset.set(t * 0.02, t * 0.05);

    // hero ship
    const sp = shipPose(t);
    ship.visible = !(t >= K.s2 && t < T.dan);
    ship.position.set(sp.x, 0, sp.z); ship.rotation.set(0, sp.yaw, 0); shipBody.rotation.z = sp.roll;
    shipBody.position.y = Math.sin(t * 1.1) * 0.006;
    // queue
    const wed = t < K.s2 || t >= T.kandas;
    queue.forEach((s, i) => {
      let k = 0;
      if (t < K.s2) k = 1; else if (t >= T.antre - 0.4) k = eout(clamp01((t - (T.antre - 0.4) - i * 0.13) / 1.0));
      s.G.visible = k > 0.001;
      s.G.position.set(s.x, Math.sin(t * 1.2 + i) * 0.01, s.z - (1 - k) * 12);
      s.G.rotation.y = Math.sin(i * 1.7) * 0.03;
    });
    // excavator
    exc.visible = wed && t >= 0 && (t < K.s2 || t >= T.kandas + 1);
    { const d = t * 2.4; exc.userData.boom.rotation.z = -0.15 - 0.25 * (0.5 + 0.5 * Math.sin(d)); exc.userData.arm.rotation.z = -0.9 + 0.35 * Math.sin(d + 0.8); exc.userData.bucket.rotation.z = -0.6 + 0.6 * Math.sin(d + 1.6); exc.userData.body.rotation.y = 0.1 * Math.sin(d * 0.5); }
    dirt.visible = dirt2.visible = wed && (t < K.s2 || t >= T.kandas) && t < T.tarik + 1;
    // fields (s3)
    const pk = t >= T.dan ? ramp(t, T.emp2 - 0.6, T.emp2 + 0.2) * (1 - ramp(t, T.tump, T.tump + 0.6)) : 0;
    pitches.forEach((m, i) => { const k = ramp(t, T.emp2 - 0.6 + i * 0.18, T.emp2 + i * 0.18); m.visible = pk > 0.01 && k > 0.01; m.scale.set(1, 1, Math.max(0.001, k)); });
    pop(pitchTag, t, T.emp2 + 0.4, 0.4); if (t > T.tump) pitchTag.visible = false;
    // ribbons
    ribs.forEach((R, i) => { const u = clamp01((t - T.tump + 0.4 - R.ph) / (T.kandas - T.tump + 0.2)); const vis = u > 0 && u < 1 && t < T.kandas + 0.5; R.m.visible = vis; if (vis) { const n = R.n; const len = Math.floor(n * 0.42); const st = Math.floor((n + len) * u) - len; const a = Math.max(0, st), b = Math.min(n, st + len); R.m.geometry.setDrawRange(a - (a % 3), Math.max(0, b - a) - (Math.max(0, b - a) % 3)); } });
    // floor tags
    pop(tagJal, t, T.hanya - 0.2, 0.45); if (t < T.dan || t > K.s3 + 1) tagJal.visible = false;
    pop(tagHal, t, T.hal, 0.45); if (t > K.s5 + 0.5) tagHal.visible = false;
    pop(tagBur, t, T.bur, 0.45); if (t > K.s5 + 0.5) tagBur.visible = false;
    pop(tagExc, t, T.eks, 0.45); if (t > T.emp7) tagExc.visible = false;
    tagDre.visible = false;
    pop(tagTug, t, T.emp7 + 0.3, 0.45); if (t > K.s8) tagTug.visible = false;
    pop(tagHeld, t, T.tahan, 0.45); if (t > T.satu) tagHeld.visible = false;
    sign.visible = !(t >= T.dan && t < K.s4) ? true : true;
    // pedestals + props
    const pedOn = t >= T.efek - 0.2;
    PED.forEach((p, i) => { const k = pop(p.G, t, T.efek + 0.1 + i * 0.15, 0.5); p.G.visible = pedOn && k > 0.001 && t < K.s8; });
    const pr = [T.cip, T.domba, T.kurc];
    pop(chip, t, pr[0] + 0.15, 0.45); chip.rotation.y = t * 0.6; chip.position.y = 0.04 * Math.sin(t * 2);
    pop(sheepG, t, pr[1] + 0.15, 0.45); sheepG.rotation.z = Math.sin(t * 1.7) * 0.04; sheep.forEach((s, i) => { s.hd.rotation.z = Math.sin(t * 3 + i * 2) * 0.15; });
    pop(gnome, t, pr[2] + 0.15, 0.45); gnome.rotation.y = Math.sin(t * 1.3) * 0.2 - 0.3;
    // rings: from the ship centre, one per step, then the s8 recap
    rings.forEach((m, i) => { const a = ripT[i]; const u = (t - a) / 2.2; if (u < 0 || u > 1) { m.visible = false; return; } m.visible = true; const rr = 0.6 + eout(u) * (i >= 6 ? 14 : 8); m.scale.set(rr, rr, 1); m.material.opacity = 0.85 * (1 - u); m.position.set(ship.position.x, 0.44, ship.position.z); });
    // dredger, jets
    dred.visible = t >= T.keruk - 0.5 && t < T.tarik + 0.5;
    if (dred.visible) { const k = eout(clamp01((t - T.keruk + 0.5) / 1.2)); dred.position.set(-0.55, Math.sin(t * 1.4) * 0.01, -3.0 - (1 - k) * 6); cutter.rotation.x = t * 6; }
    plume.P.visible = dred.visible && t > T.keruk; jets.P.visible = t > T.air - 0.2 && t < T.eks + 0.6;
    if (plume.P.visible) { for (let i = 0; i < 260; i++) { const u = ((t * 0.9 + i / 260) % 1); const x0 = dred.position.x - 1.9, z0 = dred.position.z + 0.55; plume.pos[i * 3] = x0 - u * 0.9 + Math.sin(i * 7.1) * 0.06 * u; plume.pos[i * 3 + 1] = 0.62 + u * 0.5 - u * u * 1.0; plume.pos[i * 3 + 2] = z0 + Math.sin(i * 3.3) * 0.12 * u; } plume.commit(); }
    if (jets.P.visible) { const cs = Math.cos(sp.yaw), sn = Math.sin(sp.yaw); for (let i = 0; i < 300; i++) { const j = i % 6, u = ((t * 1.3 + (i / 300) * 7) % 1); const lz = -1.4 + j * 0.55, side = j % 2 ? 1 : -1; const lx = side * (B + 0.03 + u * 0.32); const ly = 0.3 + u * 0.2 - u * u * 0.6; const wx = lx * cs + lz * sn, wz = -lx * sn + lz * cs; jets.pos[i * 3] = sp.x + wx; jets.pos[i * 3 + 1] = ly; jets.pos[i * 3 + 2] = sp.z + wz; } jets.commit(); }
    // tugs
    const tugOn = t >= T.emp7 - 0.3;
    const pull = ramp(t, T.tarik - 0.3, T.tarik + 0.5);
    tugs.forEach((g, i) => {
      const [x, z, ry, az] = g.p; const k = tugOn ? eout(clamp01((t - T.emp7 + 0.3 - i * 0.07) / 0.8)) : 0;
      g.G.visible = k > 0.001; g.ln.visible = k > 0.95 && t < K.s8 + 2;
      const dz = z > 0 ? 1 : -1;
      const gx = x, gz = z + dz * ((1 - k) * 3 + pull * 0.25 * (1 - ramp(t, T.tarik + 1.8, T.tarik + 2.5)));
      g.G.position.set(gx, Math.sin(t * 1.6 + i) * 0.008, gz); g.G.rotation.y = ry;
      if (g.ln.visible) { const cs = Math.cos(sp.yaw), sn = Math.sin(sp.yaw); const ax = sp.x + az * sn, azz = sp.z + az * cs; const a = new V3(ax, 0.22, azz), b = new V3(gx, 0.08, gz - dz * 0.15); const mid = a.clone().add(b).multiplyScalar(0.5); g.ln.position.copy(mid); g.ln.scale.set(1, a.distanceTo(b), 1); g.ln.quaternion.setFromUnitVectors(new V3(0, 1, 0), b.sub(a).normalize()); }
    });
    comp.render();
  };
}
