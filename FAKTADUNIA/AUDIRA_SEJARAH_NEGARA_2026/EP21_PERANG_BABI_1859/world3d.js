// EP21 PERANG BABI 1859: TOYDIORAMA. A miniature toy theatre ("TEATER AUDIRA") whose red velvet curtains close and
// open between acts. Six sets play on one wooden stage:
//   I   hook: a toy pig on a green island, a blue US soldier with the Stars and Stripes, a red British warship on wave flats
//   II  a painted floor-cloth map of the San Juan Islands; the 49th parallel, then the Haro and Rosario lines draw on
//   III garden: potato beds, Cutlar with a cork rifle, the pig rooting, Griffin (HBC) walks in past the sheep run
//       IV (same set) a balance scale drops from the flies: 10 dollars against 100
//   V   battle: blue toy soldiers (1 figure = 10 men) and 14 cannons on the shore, five red warships behind wave rows
//       VI (same set) Admiral Baynes glides in on a rowboat and raises his hand; the cannon fuses go out
//   VII joint occupation: British camp north, US camp south, a year counter, Kaiser Wilhelm I descends on wires
//   VIII the only casualty: a bronze pig on a plinth under a follow spot; the curtains close.
// Finishing: RoomEnvironment env map (0.55), Neutral tone mapping at exposure 1.0, warm key spot with soft shadows,
// blob contact shadows, subtle bloom on the footlights. Everything is a function of t.
import * as THREE from "./three.module.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, ramp, eout, clamp01, canvasTex, stage, back } from "./lib3d.js";

const VEL = "#B3262E", USB = "#2F5DA8", UKR = "#C8322B", INK = "#2A1E17", KRAFT = "#DCC093", GOLD = "#D9A64A", SKIN = "#F3C6A0";
const ENV = 0.55;
const V3 = THREE.Vector3;

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

// Rounded box (same construction as three's RoundedBoxGeometry): a segmented unit box whose middle segment is
// stretched flat and whose outer segments are bent onto quarter circles. Normals are exact.
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

export function create(canvas, K, AT) {
  const A = (k) => AT[k];
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x120f16, exp: 1.0, bloom: [0.07, 0.3, 0.97], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.background = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#1A1420"); gr.addColorStop(0.55, "#120E16"); gr.addColorStop(1, "#0B090D"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0xffe6cc, 0x2a1c16, 0.5); scene.add(hemi);
  const key = new THREE.SpotLight(0xffd9a8, 3.4, 0, 0.62, 0.65, 0);
  key.position.set(5, 17, 17); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03;
  key.shadow.camera.near = 8; key.shadow.camera.far = 60; key.target.position.set(0, 1.2, 0); scene.add(key, key.target);
  const fill = new THREE.SpotLight(0xa9c1ff, 0.9, 0, 0.7, 0.8, 0); fill.position.set(-12, 9, 12); fill.target.position.set(0, 1.5, 0); scene.add(fill, fill.target);
  const rim = new THREE.DirectionalLight(0xffc48a, 0.6); rim.position.set(-3, 9, -8); scene.add(rim);
  const foot = new THREE.PointLight(0xffa860, 1.6, 9, 1.2); foot.position.set(0, 0.9, 3.2); scene.add(foot);
  const follow = new THREE.SpotLight(0xfff1d6, 0, 0, 0.16, 0.5, 0); follow.position.set(0, 19, 10); follow.castShadow = true; follow.shadow.mapSize.set(1024, 1024); follow.shadow.bias = -0.0004;
  scene.add(follow, follow.target);

  // ---------- textures ----------
  const labels = [];
  const label = (w, h, paint) => { const tx = canvasTex(w, h, paint); labels.push([tx, paint]); return tx; };
  let fontsOk = false;
  const FB = (px) => `${px}px Bungee, 'Arial Black', sans-serif`;
  const FM = (wt, px) => `${wt} ${px}px 'IBM Plex Mono', 'Courier New', monospace`;
  try { document.fonts.load(FB(40)); document.fonts.load(FM(700, 40)); } catch (e) { /* no font api */ }
  const grainT = canvasTex(256, 256, (g, w, h) => { const q = mulberry(21); const im = g.createImageData(w, h); for (let i = 0; i < w * h; i++) { const v = 118 + q() * 40; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } g.putImageData(im, 0, 0); }, [3, 3]);
  grainT.colorSpace = THREE.NoColorSpace;
  const weaveT = canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#EDEDED"; g.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 4) { g.fillStyle = i % 8 ? "rgba(0,0,0,.07)" : "rgba(255,255,255,.5)"; g.fillRect(i, 0, 2, h); g.fillStyle = i % 8 ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.08)"; g.fillRect(0, i, w, 2); } }, [3, 3]);
  const plankT = canvasTex(512, 512, (g, w, h) => {
    const q = mulberry(5); const cols = ["#8E5B32", "#9A6638", "#875430", "#A06C3D"];
    for (let i = 0; i < 8; i++) { g.fillStyle = cols[i % 4]; g.fillRect(0, i * 64, w, 64); for (let k = 0; k < 30; k++) { g.strokeStyle = "rgba(60,30,10,.18)"; g.lineWidth = 1 + q() * 2; g.beginPath(); const y = i * 64 + q() * 64; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + q() * 8 - 4, w * 0.6, y + q() * 8 - 4, w, y); g.stroke(); } g.fillStyle = "rgba(30,15,5,.55)"; g.fillRect(0, i * 64, w, 3); const jx = q() * w; g.fillRect(jx, i * 64, 3, 64); }
  }, [3, 2]);
  const blobT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(0,0,0,.6)"); gr.addColorStop(0.5, "rgba(0,0,0,.3)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });

  // ---------- materials ----------
  const mc = {};
  const once = (k, f) => mc[k] || (mc[k] = f());
  const fabric = (c) => once("f" + c, () => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, metalness: 0, map: weaveT, bumpMap: weaveT, bumpScale: 0.8, envMapIntensity: ENV }));
  const plastic = (c, ro = 0.55) => once("p" + c + ro, () => new THREE.MeshStandardMaterial({ color: c, roughness: ro, metalness: 0, bumpMap: grainT, bumpScale: 0.3, envMapIntensity: ENV }));
  const clay = (c) => once("c" + c, () => new THREE.MeshStandardMaterial({ color: c, roughness: 0.82, metalness: 0, bumpMap: grainT, bumpScale: 1.2, envMapIntensity: ENV }));
  const skinM = (c) => once("s" + c, () => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.55, sheen: 0.6, sheenColor: new THREE.Color("#ffd2c0"), sheenRoughness: 0.5, bumpMap: grainT, bumpScale: 0.2, envMapIntensity: ENV }));
  const gloss = new THREE.MeshPhysicalMaterial({ color: "#16121A", roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.4 });
  const glint = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const gold = new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.3, metalness: 0.85, envMapIntensity: ENV * 1.8 });
  const iron = new THREE.MeshStandardMaterial({ color: "#2B2A2E", roughness: 0.42, metalness: 0.7, envMapIntensity: ENV * 1.5 });
  const bronze = new THREE.MeshStandardMaterial({ color: "#B07A3E", roughness: 0.32, metalness: 0.88, envMapIntensity: 1.1 });
  const wood = (c = "#9A6638") => once("w" + c, () => new THREE.MeshStandardMaterial({ color: c, roughness: 0.72, map: plankT, envMapIntensity: ENV }));
  const velvet = new THREE.MeshPhysicalMaterial({ color: VEL, roughness: 0.78, sheen: 1, sheenColor: new THREE.Color("#ff8d8d"), sheenRoughness: 0.35, side: THREE.DoubleSide, map: weaveT, envMapIntensity: ENV });
  const pink = plastic("#F2A2B3", 0.5), pinkD = plastic("#E07F93", 0.5), cheekM = new THREE.MeshStandardMaterial({ color: "#F08C96", roughness: 0.8, transparent: true, opacity: 0.75 });
  const mk = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const grp = (x = 0, y = 0, z = 0, p = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
  const blobM = new THREE.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false, toneMapped: false });
  const blob = (p, x, z, sx, sz, y = 0.015) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), blobM); m.rotation.x = -Math.PI / 2; m.scale.set(sx, sz, 1); m.position.set(x, y, z); m.renderOrder = 2; p.add(m); return m; };
  const SPH = (rr, s = 20) => once("sph" + rr + s, () => new THREE.SphereGeometry(rr, s, Math.round(s * 0.7)));
  const CYL = (a, b, h, s = 20) => once("cyl" + [a, b, h, s], () => new THREE.CylinderGeometry(a, b, h, s));

  // ---------- kraft tags on dowels (all in-world labels) ----------
  function paintTag(g, w, h, lines, tape = "rgba(126,196,178,.8)") {
    g.clearRect(0, 0, w, h);
    g.fillStyle = KRAFT; g.beginPath(); g.roundRect(6, 22, w - 12, h - 28, 12); g.fill();
    const q = mulberry(w * 7 + h);
    for (let i = 0; i < 220; i++) { g.strokeStyle = q() < 0.5 ? "rgba(120,80,40,.16)" : "rgba(255,240,210,.22)"; g.lineWidth = 1 + q(); const x = q() * w, y = 22 + q() * (h - 28); g.beginPath(); g.moveTo(x, y); g.lineTo(x + q() * 18 - 9, y + q() * 6 - 3); g.stroke(); }
    g.strokeStyle = "rgba(70,45,20,.4)"; g.lineWidth = 3; g.beginPath(); g.roundRect(6, 22, w - 12, h - 28, 12); g.stroke();
    g.save(); g.translate(w / 2, 26); g.rotate(-0.04); g.fillStyle = tape; g.fillRect(-w * 0.17, -16, w * 0.34, 32); g.fillStyle = "rgba(255,255,255,.25)"; for (let i = -w * 0.17; i < w * 0.17; i += 14) g.fillRect(i, -16, 5, 32); g.restore();
    const tot = lines.reduce((s, l) => s + l[1] * 1.12, 0);
    let y = 22 + (h - 28 - tot) / 2;
    for (const [txt, px, kind, col] of lines) {
      let size = px;
      const font = (s) => (kind === "M" ? FM(700, s) : FB(s));
      g.font = font(size); while (g.measureText(txt).width > w - 44 && size > 10) { size -= 2; g.font = font(size); }
      g.fillStyle = col || INK; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, y + px * 0.58); y += px * 1.12;
    }
  }
  function tag(p, x, y, z, w, h, lines, opt = {}) {
    const G = grp(x, 0, z, p);
    const pw = opt.pw || 512, ph = Math.round(pw * h / w);
    const tx = label(pw, ph, (g, W, H) => paintTag(g, W, H, lines, opt.tape));
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: 0xcfcfcf, map: tx, transparent: true, roughness: 0.9, envMapIntensity: 0.2, alphaTest: 0.05 }));
    pl.position.y = y; pl.castShadow = true; G.add(pl);
    if (!opt.noStick) mk(CYL(0.035, 0.035, y - h / 2 + 0.05, 8), wood("#C08A54"), 0, (y - h / 2) / 2, -0.03, G);
    G.rotation.y = opt.ry || 0;
    return G;
  }
  const pop = (o, t, a, d = 0.4, s = 1) => { const k = t < a ? 0 : back(clamp01((t - a) / d), 1.9); o.scale.setScalar(Math.max(0.0001, k * s)); o.visible = k > 0.001; return k; };

  // ---------- flags ----------
  const ukT = canvasTex(320, 160, (g, w, h) => { g.fillStyle = "#012169"; g.fillRect(0, 0, w, h); g.lineCap = "butt"; g.strokeStyle = "#fff"; g.lineWidth = 30; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke(); g.strokeStyle = "#C8102E"; g.lineWidth = 10; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke(); g.fillStyle = "#fff"; g.fillRect(w / 2 - 26, 0, 52, h); g.fillRect(0, h / 2 - 26, w, 52); g.fillStyle = "#C8102E"; g.fillRect(w / 2 - 16, 0, 32, h); g.fillRect(0, h / 2 - 16, w, 32); });
  const usT = canvasTex(320, 168, (g, w, h) => { for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? "#fff" : "#B22234"; g.fillRect(0, (i * h) / 13, w, h / 13 + 1); } g.fillStyle = "#3C3B6E"; g.fillRect(0, 0, w * 0.42, (h * 7) / 13); g.fillStyle = "#fff"; for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 6; xx++) { g.beginPath(); g.arc(12 + xx * 21 + (yy % 2) * 6, 11 + yy * 17, 3.6, 0, 7); g.fill(); } });
  const flags = [];
  function flag(p, x, y, z, w, h, tx, pole = true) {
    const G = grp(x, 0, z, p);
    if (pole) { mk(CYL(0.05, 0.06, y + 0.1, 10), wood("#C9A06A"), 0, (y + 0.1) / 2, 0, G); mk(SPH(0.09, 12), gold, 0, y + 0.15, 0, G); }
    const geo = new THREE.PlaneGeometry(w, h, 14, 4); geo.translate(w / 2, 0, 0);
    const m = mk(geo, new THREE.MeshStandardMaterial({ map: tx, roughness: 0.85, side: THREE.DoubleSide, envMapIntensity: ENV }), 0.04, y - h / 2, 0, G);
    flags.push({ geo, base: Float32Array.from(geo.attributes.position.array), w, ph: x * 1.7 + z, m });
    return G;
  }

  // ---------- toy people ----------
  const HAND = SPH(0.17, 16), EYE = SPH(0.068, 16), GL = SPH(0.022, 8);
  function person(o) {
    const G = new THREE.Group();
    const coat = fabric(o.coat), pants = fabric(o.pants || "#3B3A44"), sk = skinM(o.skin || SKIN), boot = plastic(o.boot || "#2B211C", 0.45);
    const legs = [-1, 1].map((s) => {
      const hip = grp(s * 0.2, 1.2, 0, G); mk(rb(0.32, 0.64, 0.36, 0.11), pants, 0, -0.3, 0, hip);
      const knee = grp(0, -0.6, 0, hip); mk(rb(0.29, 0.5, 0.33, 0.1), pants, 0, -0.23, 0, knee); mk(rb(0.34, 0.2, 0.52, 0.08), boot, 0, -0.5, 0.08, knee);
      return { hip, knee };
    });
    mk(rb(0.76, 0.38, 0.46, 0.14), pants, 0, 1.24, 0, G);
    const torso = grp(0, 1.4, 0, G);
    mk(rb(1.02, 0.95, 0.58, 0.17), coat, 0, 0.45, 0, torso);
    if (o.tails) mk(rb(0.86, 0.5, 0.6, 0.12), coat, 0, -0.06, -0.02, torso);
    if (o.vest) mk(rb(0.6, 0.8, 0.06, 0.03), fabric(o.vest), 0, 0.48, 0.29, torso);
    if (o.buttons) for (let i = 0; i < 3; i++) mk(SPH(0.045, 10), gold, 0, 0.22 + i * 0.2, 0.3, torso);
    if (o.belt) mk(rb(1.04, 0.12, 0.6, 0.05), plastic(o.belt, 0.5), 0, 0.06, 0, torso);
    if (o.cross) { const c = mk(rb(0.13, 1.15, 0.04, 0.02), fabric("#F2EEE4"), 0, 0.46, 0.3, torso); c.rotation.z = 0.62; }
    if (o.epaul) for (const s of [-1, 1]) mk(rb(0.36, 0.1, 0.38, 0.05), gold, s * 0.56, 0.95, 0, torso);
    const head = grp(0, 1.0, 0, torso);
    mk(CYL(0.15, 0.17, 0.2, 12), sk, 0, 0.02, 0, head);
    mk(rb(0.82, 0.76, 0.74, 0.24), sk, 0, 0.46, 0, head);
    const eyes = [-1, 1].map((s) => { const e = mk(EYE, gloss, s * 0.17, 0.52, 0.36, head); const g2 = new THREE.Mesh(GL, glint); g2.position.set(0.022, 0.026, 0.055); e.add(g2); return e; });
    for (const s of [-1, 1]) { const c = new THREE.Mesh(once("cheek", () => new THREE.CircleGeometry(0.075, 16)), cheekM); c.position.set(s * 0.27, 0.38, 0.374); head.add(c); }
    const sm = mk(once("smile", () => new THREE.TorusGeometry(0.085, 0.02, 6, 14, Math.PI)), gloss, 0, 0.34, 0.37, head); sm.rotation.z = Math.PI; sm.castShadow = false;
    if (o.frown) { sm.rotation.z = 0; sm.position.y = 0.28; }
    mk(SPH(0.055, 12), skinM("#E8AE88"), 0, 0.45, 0.385, head);
    if (o.hair) { mk(rb(0.86, 0.22, 0.78, 0.08), clay(o.hair), 0, 0.86, -0.02, head); mk(rb(0.86, 0.5, 0.2, 0.08), clay(o.hair), 0, 0.62, -0.31, head); }
    if (o.beard) { mk(rb(0.74, 0.3, 0.2, 0.09), clay(o.beard), 0, 0.2, 0.32, head); mk(rb(0.5, 0.09, 0.12, 0.04), clay(o.beard), 0, 0.31, 0.4, head); for (const s of [-1, 1]) mk(rb(0.16, 0.36, 0.5, 0.06), clay(o.beard), s * 0.4, 0.4, 0.08, head); }
    const hatC = o.hatC || "#1E2433";
    if (o.hat === "kepi") { const h = mk(CYL(0.33, 0.39, 0.36, 22), fabric(hatC), 0, 1.0, -0.03, head); h.rotation.x = -0.14; mk(rb(0.5, 0.05, 0.26, 0.02), plastic("#141218", 0.3), 0, 0.86, 0.4, head); mk(SPH(0.05, 10), gold, 0, 0.98, 0.37, head); }
    if (o.hat === "straw") { mk(CYL(0.72, 0.74, 0.05, 28), clay("#E2C16E"), 0, 0.88, 0, head); mk(CYL(0.36, 0.4, 0.3, 22), clay("#E2C16E"), 0, 1.05, 0, head); mk(CYL(0.405, 0.405, 0.08, 22), fabric("#7A3B2A"), 0, 0.94, 0, head); }
    if (o.hat === "top") { mk(CYL(0.58, 0.6, 0.05, 28), plastic("#1A1A1F", 0.4), 0, 0.88, 0, head); mk(CYL(0.37, 0.37, 0.62, 22), plastic("#1A1A1F", 0.4), 0, 1.2, 0, head); mk(CYL(0.375, 0.375, 0.1, 22), fabric("#5B2A2A"), 0, 0.96, 0, head); }
    if (o.hat === "bicorne") { const b = mk(rb(1.22, 0.46, 0.26, 0.12), plastic("#15161C", 0.4), 0, 1.02, 0, head); mk(rb(1.26, 0.06, 0.3, 0.03), gold, 0, 0.82, 0, head); mk(SPH(0.08, 10), gold, 0, 1.06, 0.14, head); b.castShadow = true; }
    if (o.hat === "pickel") { mk(SPH(0.47, 22), plastic("#17171B", 0.25), 0, 0.82, 0, head).scale.set(1, 0.72, 1); mk(CYL(0.02, 0.09, 0.34, 10), gold, 0, 1.3, 0, head); mk(rb(0.3, 0.2, 0.05, 0.03), gold, 0, 0.98, 0.42, head); }
    if (o.hat === "shako") { mk(CYL(0.32, 0.36, 0.5, 20), plastic("#1A1A20", 0.4), 0, 1.06, 0, head); mk(rb(0.46, 0.05, 0.24, 0.02), plastic("#141218", 0.3), 0, 0.86, 0.38, head); mk(SPH(0.07, 10), fabric("#F2EEE4"), 0, 1.36, 0.1, head); }
    const arms = [-1, 1].map((s) => {
      const sh = grp(s * 0.63, 0.82, 0, torso); mk(rb(0.28, 0.56, 0.32, 0.11), coat, 0, -0.24, 0, sh);
      const el = grp(0, -0.5, 0, sh); mk(rb(0.26, 0.48, 0.29, 0.1), coat, 0, -0.21, 0, el);
      const hand = mk(HAND, o.glove ? plastic("#F4F1EA", 0.6) : sk, 0, -0.5, 0, el);
      sh.rotation.z = s * 0.14; el.rotation.x = -0.32;
      return { sh, el, hand };
    });
    G.scale.setScalar(o.s || 1);
    const ph = (o.ph || 0);
    return { G, torso, head, eyes, arms, legs, ph };
  }
  function life(P, t, base = 1.4) {
    P.torso.position.y = base + Math.sin(t * 2.2 + P.ph) * 0.012;
    P.head.rotation.z = Math.sin(t * 0.9 + P.ph) * 0.05;
    const bl = (t * 0.37 + P.ph * 0.13) % 1;
    const s = bl < 0.03 ? 0.12 : 1;
    for (const e of P.eyes) e.scale.y = s;
  }
  function walk(P, ph, amp) {
    P.legs.forEach((L, i) => { const s = Math.sin(ph + i * Math.PI); L.hip.rotation.x = s * 0.5 * amp; L.knee.rotation.x = Math.max(0, -s) * 0.7 * amp; });
    P.arms.forEach((a, i) => { a.sh.rotation.x = -Math.sin(ph + i * Math.PI) * 0.45 * amp; });
    P.G.position.y = Math.abs(Math.sin(ph)) * 0.05 * amp * (P.G.scale.x);
  }
  function rifle(P, held = "R") {
    const a = P.arms[held === "R" ? 1 : 0];
    const R = grp(0, -0.5, 0.05, a.el);
    mk(rb(0.12, 0.16, 0.7, 0.04), wood("#7A4A26"), 0, 0, -0.1, R);
    mk(CYL(0.035, 0.035, 0.9, 10), iron, 0, 0.02, 0.6, R).rotation.x = Math.PI / 2;
    return R;
  }

  // Crowd soldier baked into one instanced mesh per material.
  function bakeCrowd(P, n, p) {
    P.G.updateMatrixWorld(true);
    const byMat = new Map();
    P.G.traverse((o) => { if (!o.isMesh) return; const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); g.applyMatrix4(o.matrixWorld); if (!byMat.has(o.material)) byMat.set(o.material, []); byMat.get(o.material).push(g); });
    const meshes = [];
    for (const [mat, gs] of byMat) {
      let cnt = 0; for (const g of gs) cnt += g.attributes.position.count;
      const P3 = new Float32Array(cnt * 3), N3 = new Float32Array(cnt * 3), U2 = new Float32Array(cnt * 2); let o = 0;
      for (const g of gs) { P3.set(g.attributes.position.array, o * 3); N3.set(g.attributes.normal.array, o * 3); if (g.attributes.uv) U2.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; }
      const G = new THREE.BufferGeometry(); G.setAttribute("position", new THREE.BufferAttribute(P3, 3)); G.setAttribute("normal", new THREE.BufferAttribute(N3, 3)); G.setAttribute("uv", new THREE.BufferAttribute(U2, 2));
      const im = new THREE.InstancedMesh(G, mat, n); im.castShadow = im.receiveShadow = true; im.frustumCulled = false; p.add(im); meshes.push(im);
    }
    const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), S = new V3(), T = new V3();
    return { set(i, x, y, z, ry, s) { M4.compose(T.set(x, y, z), Q.setFromEuler(E.set(0, ry, 0)), S.set(s || 1e-4, s || 1e-4, s || 1e-4)); for (const m of meshes) m.setMatrixAt(i, M4); }, commit() { for (const m of meshes) m.instanceMatrix.needsUpdate = true; } };
  }

  // ---------- the pig ----------
  function pig(bodyM, snoutM, s = 1) {
    const G = new THREE.Group(); const body = grp(0, 0, 0, G);
    mk(rb(1.0, 0.86, 1.4, 0.38), bodyM, 0, 0.8, 0, body);
    const head = grp(0, 1.0, 0.66, body);
    mk(rb(0.86, 0.78, 0.72, 0.3), bodyM, 0, 0.05, 0.1, head);
    mk(CYL(0.22, 0.25, 0.2, 22), snoutM, 0, -0.06, 0.52, head).rotation.x = Math.PI / 2;
    for (const sx of [-1, 1]) mk(SPH(0.045, 10), gloss, sx * 0.08, -0.06, 0.62, head);
    const ears = [-1, 1].map((sx) => { const e = mk(rb(0.28, 0.32, 0.07, 0.05), snoutM, sx * 0.3, 0.46, 0.0, head); e.rotation.set(-0.5, 0, sx * -0.45); return e; });
    const eyes = [-1, 1].map((sx) => { const e = mk(EYE, gloss, sx * 0.2, 0.18, 0.45, head); const g2 = new THREE.Mesh(GL, glint); g2.position.set(0.022, 0.026, 0.055); e.add(g2); return e; });
    const xe = grp(0, 0, 0, head);
    for (const sx of [-1, 1]) for (const a of [-0.78, 0.78]) { const b = mk(rb(0.18, 0.04, 0.03, 0.01), gloss, sx * 0.2, 0.18, 0.47, xe); b.rotation.z = a; }
    xe.visible = false;
    if (bodyM !== bronze) for (const sx of [-1, 1]) { const c = new THREE.Mesh(once("cheek", () => new THREE.CircleGeometry(0.075, 16)), cheekM); c.position.set(sx * 0.3, 0.02, 0.465); head.add(c); }
    for (const [x, z] of [[-0.3, 0.45], [0.3, 0.45], [-0.3, -0.45], [0.3, -0.45]]) { mk(CYL(0.13, 0.12, 0.42, 14), bodyM, x, 0.25, z, body); mk(CYL(0.125, 0.125, 0.08, 14), bodyM === bronze ? bronze : plastic("#9B5A63", 0.4), x, 0.04, z, body); }
    const pts = []; for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 3.2; pts.push(new V3(Math.cos(a) * 0.09, 0.95 + Math.sin(a) * 0.09 + i * 0.006, -0.72 - i * 0.008)); }
    mk(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.035, 8), snoutM, 0, 0, 0, body);
    G.scale.setScalar(s);
    return { G, body, head, eyes, xe, ears };
  }

  // ---------- STAGE (always on) ----------
  const floor = mk(new THREE.BoxGeometry(17, 1.6, 10.6), [wood("#7A4A2A"), wood("#7A4A2A"), new THREE.MeshStandardMaterial({ color: "#B88457", roughness: 0.62, map: plankT, envMapIntensity: ENV }), wood("#5E3A22"), wood("#6B4227"), wood("#5E3A22")], 0, -0.8, -1.1);
  floor.castShadow = false;
  // apron trim + footlights
  mk(rb(17.2, 0.22, 0.4, 0.08), gold, 0, -0.04, 4.2);
  const bulbM = new THREE.MeshStandardMaterial({ color: "#FFD9A0", emissive: "#FFB25E", emissiveIntensity: 1.6, roughness: 0.3 });
  for (let i = 0; i < 9; i++) { if (i === 4) continue; const x = -6.4 + i * 1.6; const hd = mk(CYL(0.26, 0.3, 0.26, 16, ), iron, x, 0.13, 4.05); hd.scale.z = 0.7; mk(SPH(0.15, 14), bulbM, x, 0.22, 4.18).castShadow = false; }
  // plaque on the apron: "TEATER AUDIRA" + act number (repainted per act)
  let plaqueAct = 0;
  const plaqueT = label(1024, 200, (g, w, h) => {
    g.fillStyle = "#2B1A12"; g.fillRect(0, 0, w, h);
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#F1CF7A"); gr.addColorStop(0.5, "#D2A245"); gr.addColorStop(1, "#A57A2C");
    g.fillStyle = gr; g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, 26); g.fill();
    g.strokeStyle = "#7A5520"; g.lineWidth = 6; g.beginPath(); g.roundRect(22, 22, w - 44, h - 44, 18); g.stroke();
    g.fillStyle = "#3A2410"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = FB(78); g.fillText("TEATER AUDIRA", w / 2, h / 2 - 16);
    g.font = FM(700, 34); g.fillText("BABAK " + ["I", "II", "III", "IV", "V", "VI"][Math.max(0, plaqueAct)] + "  ·  PERANG BABI 1859", w / 2, h / 2 + 50);
  });
  const plaque = mk(new THREE.PlaneGeometry(2.9, 0.567), new THREE.MeshBasicMaterial({ color: 0xd2d2d2, map: plaqueT }), 0, 0.311, 3.987);
  plaque.castShadow = false; plaque.rotation.x = -0.3;
  mk(rb(3.05, 0.66, 0.12, 0.05), wood("#4A2E18"), 0, 0.29, 3.92).rotation.x = -0.3;
  // proscenium: pillars, header, gold trims, side walls
  const wallM = new THREE.MeshStandardMaterial({ color: "#4A1A1F", roughness: 0.85, map: weaveT, envMapIntensity: 0.3 });
  for (const s of [-1, 1]) {
    mk(rb(1.5, 16.5, 1.0, 0.18), wallM, s * 8.55, 6.65, 3.75);
    mk(rb(0.18, 16.5, 1.06, 0.06), gold, s * 7.85, 6.65, 3.75);
    mk(new THREE.PlaneGeometry(8, 22), wallM, s * 13.2, 6, 3.6).castShadow = false;
  }
  mk(rb(18.6, 2.4, 1.0, 0.2), wallM, 0, 15.6, 3.75);
  mk(rb(18.6, 0.18, 1.06, 0.06), gold, 0, 14.4, 3.75);
  // valance swag
  { const g = new THREE.PlaneGeometry(15.6, 1.5, 120, 4); const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i); pa.setZ(i, Math.sin(x * 4.2) * 0.12); pa.setY(i, y - Math.max(0, 0.75 - y) * 0.0 - (y < -0.6 ? Math.abs(Math.sin(x * 0.81)) * 0.35 : 0)); } g.computeVertexNormals(); mk(g, velvet, 0, 13.6, 3.55).castShadow = false; }
  // curtains: two halves, vertices rewritten every frame
  const CUR = [-1, 1].map((s) => { const g = new THREE.PlaneGeometry(1, 1, 96, 10); const m = mk(g, velvet, 0, 0, 0); m.castShadow = false; return { s, g, uv: Float32Array.from(g.attributes.uv.array) }; });
  function curtains(o, t) {
    for (const C of CUR) {
      const pa = C.g.attributes.position;
      for (let i = 0; i < pa.count; i++) {
        const u = C.s < 0 ? C.uv[i * 2] : 1 - C.uv[i * 2], v = C.uv[i * 2 + 1];
        const wOpen = 1.05 + 0.9 * v;
        const width = 7.9 + (wOpen - 7.9) * o;
        const x = C.s * (7.75 - u * width);
        const fold = (0.13 + 0.16 * o) * Math.sin(u * 15 * Math.PI * 2 + C.s) + 0.03 * Math.sin(t * 1.3 + u * 7 + v * 2);
        const y = v * 13.6 + o * u * (1 - v) * 1.4 * (1 - v);
        pa.setXYZ(i, x, y, 3.45 + fold);
      }
      pa.needsUpdate = true; C.g.computeVertexNormals();
    }
  }
  // audience silhouettes in the dark (foreground layer)
  const audM = new THREE.MeshStandardMaterial({ color: "#120E12", roughness: 0.9, envMapIntensity: 0.1 });
  { const q = mulberry(77); for (let row = 0; row < 2; row++) for (let i = 0; i < 9; i++) { const x = -8 + i * 2 + row * 1 + q() * 0.4, z = 8 + row * 2.2, y = -2.9 - row * 0.2; mk(rb(1.5, 1.4, 0.9, 0.4), audM, x, y, z); mk(SPH(0.42, 16), audM, x + q() * 0.1, y + 1.1, z); } }
  mk(new THREE.PlaneGeometry(60, 30), new THREE.MeshStandardMaterial({ color: "#0C0A0D", roughness: 1 }), 0, -4, 10).rotation.x = -Math.PI / 2;

  // backdrop drop + painted skies per act
  const paintSky = (top, mid, bot, hills, seed, extra) => (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(0.6, mid); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const q = mulberry(seed);
    if (extra) extra(g, w, h, q);
    hills.forEach(([c, y0, amp, f], k) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, y0 + Math.sin(x * f + k * 2 + seed) * amp + Math.sin(x * f * 2.7 + k) * amp * 0.35); g.lineTo(w, h); g.fill(); g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = 4; g.stroke(); });
    for (let i = 0; i < 2600; i++) { g.fillStyle = q() < 0.5 ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.035)"; g.fillRect(q() * w, q() * h, 2 + q() * 3, 2 + q() * 3); }
  };
  const bdTex = {
    1: canvasTex(512, 512, paintSky("#7FB6D9", "#B9D9E6", "#E9E2C6", [["#8DB27A", 360, 26, 0.012], ["#6E9A5E", 410, 20, 0.02]], 3)),
    2: canvasTex(512, 512, paintSky("#1D2A44", "#24375A", "#2D4468", [], 4, (g, w, h, q) => { g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = 2; for (let x = 0; x < w; x += 48) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 48) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } })),
    3: canvasTex(512, 512, paintSky("#F2B880", "#F6D4A0", "#F3E6C4", [["#9EB46F", 330, 22, 0.014], ["#7F9C58", 400, 16, 0.024]], 5)),
    5: canvasTex(512, 512, paintSky("#4A2E5E", "#D9644A", "#F4B068", [["#3E3550", 380, 14, 0.01]], 6)),
    7: canvasTex(512, 512, paintSky("#8EC3DD", "#C4E2E8", "#EEF0D8", [["#7FAE76", 350, 24, 0.016], ["#5F915A", 405, 18, 0.022]], 7)),
    8: canvasTex(512, 512, paintSky("#0E1328", "#1A2142", "#262A4A", [["#14182E", 420, 12, 0.012]], 8, (g, w, h, q) => { for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,240,200,${0.4 + q() * 0.6})`; g.beginPath(); g.arc(q() * w, q() * h * 0.7, 1 + q() * 2.2, 0, 7); g.fill(); } })),
  };
  const bdMat = new THREE.MeshStandardMaterial({ color: 0xa8a8a8, map: bdTex[1], roughness: 0.95, envMapIntensity: 0.2 });
  const backdrop = mk(new THREE.PlaneGeometry(17, 15), bdMat, 0, 7.3, -6.3); backdrop.castShadow = false;
  // paper sun and clouds on dowel rods
  const sky = grp(0, 0, -5.6);
  const sun = grp(-4.3, 0, 0, sky); mk(CYL(0.06, 0.06, 9.8, 8), wood("#C9A06A"), 0, 4.9, -0.1, sun); const sunD = mk(new THREE.CylinderGeometry(1.15, 1.15, 0.12, 40), plastic("#F2C766", 0.6), 0, 9.6, 0, sun); sunD.rotation.x = Math.PI / 2;
  const cloud = grp(2.6, 0, 0.1, sky); mk(CYL(0.05, 0.05, 8.6, 8), wood("#C9A06A"), 0, 4.3, -0.1, cloud);
  for (const [x, y, rr] of [[-0.9, 8.5, 0.75], [0, 8.9, 1.0], [0.95, 8.5, 0.7]]) { const c = mk(new THREE.CylinderGeometry(rr, rr, 0.14, 32), plastic("#F7F2EA", 0.7), x, y, 0, cloud); c.rotation.x = Math.PI / 2; }

  // shared props
  function mound(p, sx, sy, sz, x = 0, z = 0) {
    const m = mk(SPH(1, 48), clay("#6FA35A"), x, -0.15, z, p); m.scale.set(sx, sy, sz);
    const b = mk(SPH(1, 48), clay("#D8C08A"), x, -0.32, z, p); b.scale.set(sx * 1.08, sy * 0.55, sz * 1.1);
    return m;
  }
  function tree(p, x, z, s = 1) { const G = grp(x, 0, z, p); mk(CYL(0.1, 0.14, 0.9, 10), wood("#7A4A26"), 0, 0.45, 0, G); mk(new THREE.ConeGeometry(0.62, 1.2, 14), clay("#3F7A45"), 0, 1.3, 0, G); mk(new THREE.ConeGeometry(0.48, 1.0, 14), clay("#4F8F50"), 0, 1.9, 0, G); G.scale.setScalar(s); return G; }
  function wave(p, x, z, w, hgt, col, seed) {
    const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0);
    const n = Math.round(w / 0.9);
    for (let i = 0; i <= n; i++) { const xx = -w / 2 + (i / n) * w; sh.quadraticCurveTo(xx - w / n / 2, hgt + 0.25, xx, hgt); }
    sh.lineTo(w / 2, 0); sh.lineTo(-w / 2, 0);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, curveSegments: 6 });
    const m = mk(g, plastic(col, 0.45), x, 0, z, p); m.userData.seed = seed; m.userData.x0 = x; return m;
  }
  function ship(p, s = 1) {
    const G = grp(0, 0, 0, p); const H = grp(0, 0, 0, G);
    const red = plastic(UKR, 0.45);
    mk(rb(3.4, 0.82, 1.15, 0.3), red, 0.2, 0.42, 0, H);
    const bow = mk(new THREE.CylinderGeometry(0.1, 0.58, 1.1, 18), red, -1.95, 0.44, 0, H); bow.rotation.z = Math.PI / 2; bow.scale.set(0.74, 1, 1);
    mk(rb(3.44, 0.2, 1.19, 0.08), plastic("#F2EEE4", 0.5), 0.2, 0.62, 0, H);
    for (let i = 0; i < 7; i++) mk(rb(0.16, 0.13, 0.05, 0.02), gloss, -1.1 + i * 0.4, 0.62, 0.6, H);
    const guns = []; for (let i = 0; i < 7; i++) { const c = mk(CYL(0.05, 0.06, 0.4, 10), iron, -1.1 + i * 0.4, 0.62, 0.5, H); c.rotation.x = Math.PI / 2; guns.push(c); }
    mk(rb(3.2, 0.12, 1.0, 0.05), wood("#B88457"), 0.2, 0.86, 0, H);
    mk(rb(0.95, 0.5, 1.12, 0.1), red, 1.45, 1.05, 0, H);
    mk(rb(1.0, 0.06, 1.16, 0.03), gold, 1.45, 1.32, 0, H);
    const sailM = once("sail", () => new THREE.MeshStandardMaterial({ color: "#F3EAD6", roughness: 0.9, map: weaveT, side: THREE.DoubleSide, envMapIntensity: ENV }));
    for (const [mx, mh] of [[-0.9, 3.0], [0.25, 3.5], [1.2, 2.6]]) {
      mk(CYL(0.05, 0.065, mh, 10), wood("#8A5A30"), mx, 0.9 + mh / 2, 0, H);
      for (const [yy, ww] of [[0.45, 1.1], [0.78, 0.85]]) {
        const sg = new THREE.PlaneGeometry(ww, mh * 0.3, 6, 4); const pa = sg.attributes.position; for (let i = 0; i < pa.count; i++) { const x = pa.getX(i) / ww * 2, y = pa.getY(i) / (mh * 0.3) * 2; pa.setZ(i, (1 - x * x) * 0.18 * (1 - 0.3 * y)); } sg.computeVertexNormals();
        const sl = mk(sg, sailM, mx + 0.06, 0.9 + mh * yy, 0, H); sl.rotation.y = Math.PI / 2;
        mk(CYL(0.025, 0.025, ww + 0.1, 8), wood("#8A5A30"), mx, 0.9 + mh * yy + mh * 0.15, 0, H).rotation.x = Math.PI / 2;
      }
    }
    mk(CYL(0.03, 0.04, 1.2, 8), wood("#8A5A30"), -2.7, 0.75, 0, H).rotation.z = 1.25;
    flag(H, 1.2, 0.9 + 2.6 + 0.6, 0, 0.62, 0.32, ukT, false).position.y = 0;
    G.scale.setScalar(s);
    return { G, H, guns };
  }
  function cannon(p, x, z, ry) { const G = grp(x, 0, z, p); mk(rb(0.5, 0.26, 0.62, 0.08), wood("#6E4426"), 0, 0.2, 0, G); for (const s of [-1, 1]) { const w = mk(CYL(0.17, 0.17, 0.06, 16), wood("#4A2E18"), s * 0.27, 0.17, 0, G); w.rotation.z = Math.PI / 2; } const b = mk(CYL(0.08, 0.11, 0.85, 14), iron, 0, 0.42, -0.1, G); b.rotation.x = Math.PI / 2 - 0.2; G.rotation.y = ry; return G; }

  // ================= ACT I: HOOK =================
  const gHook = grp();
  mound(gHook, 2.4, 0.95, 1.7, 0, 0.6);
  tree(gHook, -1.8, -0.3, 0.8); tree(gHook, 1.9, -0.2, 0.7);
  const hookPig = pig(pink, pinkD, 1.25); gHook.add(hookPig.G); hookPig.G.position.set(0, 0.62, 0.85);
  blob(hookPig.G, 0, 0, 1.4, 1.9, 0.02);
  const usHero = person({ coat: USB, pants: "#7E9AC4", hat: "kepi", buttons: true, belt: "#2A2420", ph: 1 }); gHook.add(usHero.G); usHero.G.position.set(-3.5, 0, 1.4); usHero.G.rotation.y = 0.45; usHero.G.scale.setScalar(0.85);
  rifle(usHero).rotation.set(-1.2, 0, 0);
  blob(gHook, -3.5, 1.4, 1.5, 1.2);
  flag(gHook, -4.7, 4.3, 0.2, 1.7, 0.9, usT);
  for (const [x, z, c, sd] of [[4.2, -0.9, "#3E7FA6", 1], [4.4, 0.3, "#5B9BC0", 2]]) wave(gHook, x, z, 7.5, 0.55, c, sd);
  const hookShip = ship(gHook, 0.78); hookShip.G.position.set(3.6, 0, -0.4); hookShip.G.rotation.y = -0.5;
  flag(gHook, 6.1, 4.0, 1.1, 1.5, 0.8, ukT);
  const hookWaves = gHook.children.filter((c) => c.userData.seed);

  // ================= ACT II: MAP =================
  const gMap = grp();
  const lon0 = -124.4, lon1 = -122.0, lat0 = 47.95, lat1 = 49.15, MW = 1600, MH = 1200;
  const MP = (lo, la) => [(lo - lon0) / (lon1 - lon0) * MW, (lat1 - la) / (lat1 - lat0) * MH];
  const MAPW = 12, MAPH = 9, MZ = -0.8;
  const W3 = (lo, la) => { const [px, py] = MP(lo, la); return [-MAPW / 2 + px / MW * MAPW, MZ - MAPH / 2 + py / MH * MAPH]; };
  const VI = [[-124.6, 48.55], [-124.1, 48.45], [-123.9, 48.37], [-123.7, 48.33], [-123.55, 48.31], [-123.42, 48.4], [-123.32, 48.42], [-123.28, 48.47], [-123.37, 48.55], [-123.42, 48.66], [-123.55, 48.78], [-123.7, 48.92], [-123.85, 49.05], [-124.0, 49.3], [-124.6, 49.3]];
  const MAIN = [[-123.25, 49.3], [-123.15, 49.1], [-123.08, 49.02], [-122.95, 49.0], [-122.78, 48.97], [-122.7, 48.88], [-122.62, 48.76], [-122.5, 48.66], [-122.55, 48.52], [-122.62, 48.42], [-122.52, 48.3], [-122.43, 48.18], [-122.4, 48.05], [-122.36, 47.9], [-121.8, 47.9], [-121.8, 49.3]];
  const OLY = [[-124.6, 48.12], [-124.0, 48.17], [-123.6, 48.15], [-123.2, 48.12], [-122.95, 48.1], [-122.78, 48.06], [-122.72, 47.9], [-124.6, 47.9]];
  const SJ = [[-123.22, 48.6], [-123.16, 48.63], [-123.08, 48.6], [-123.0, 48.53], [-122.97, 48.46], [-123.03, 48.45], [-123.1, 48.49], [-123.18, 48.53]];
  const ORC = [[-123.03, 48.7], [-122.95, 48.73], [-122.87, 48.7], [-122.78, 48.69], [-122.74, 48.64], [-122.82, 48.61], [-122.88, 48.65], [-122.93, 48.6], [-123.0, 48.63]];
  const LOP = [[-122.93, 48.56], [-122.86, 48.57], [-122.8, 48.48], [-122.84, 48.42], [-122.9, 48.44], [-122.95, 48.5]];
  const SMALL = [[-122.95, 48.585, 0.022], [-122.81, 48.575, 0.02], [-123.04, 48.72, 0.016], [-123.17, 48.68, 0.012], [-122.75, 48.53, 0.014]];
  const HARO = [[-123.3, 49.0], [-123.22, 48.84], [-123.25, 48.66], [-123.26, 48.52], [-123.24, 48.4], [-123.3, 48.28], [-123.5, 48.2]];
  const ROS = [[-123.3, 49.0], [-123.05, 48.86], [-122.82, 48.77], [-122.7, 48.62], [-122.7, 48.45], [-122.74, 48.3], [-122.95, 48.2], [-123.5, 48.2]];
  const mapT = label(MW, MH, (g, w, h) => {
    const poly = (pts) => { g.beginPath(); pts.forEach(([lo, la], i) => { const [x, y] = MP(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); };
    g.fillStyle = "#6FA9B5"; g.fillRect(0, 0, w, h);
    const q = mulberry(1846);
    g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = 3;
    for (let i = 0; i < 120; i++) { const x = q() * w, y = q() * h; g.beginPath(); g.arc(x, y, 14, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
    const land = (pts, wash) => { poly(pts); g.fillStyle = "#EAD9AE"; g.fill(); if (wash) { g.fillStyle = wash; g.fill(); } g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); };
    land(VI, "rgba(200,50,43,.28)"); land(OLY, "rgba(47,93,168,.25)");
    poly(MAIN); g.fillStyle = "#EAD9AE"; g.fill(); g.save(); poly(MAIN); g.clip(); g.fillStyle = "rgba(47,93,168,.28)"; g.fillRect(0, MP(0, 49.0)[1], w, h); g.fillStyle = "rgba(200,50,43,.28)"; g.fillRect(0, 0, w, MP(0, 49.0)[1]); g.restore(); poly(MAIN); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
    for (const pl of [SJ, ORC, LOP]) land(pl, "rgba(111,163,90,.55)");
    for (const [lo, la, rr] of SMALL) { const [x, y] = MP(lo, la); g.beginPath(); g.ellipse(x, y, rr / (lon1 - lon0) * MW, rr * 0.7 / (lat1 - lat0) * MH, 0.4, 0, 7); g.fillStyle = "#9FC48A"; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); }
    for (let i = 0; i < 5000; i++) { g.fillStyle = q() < 0.5 ? "rgba(255,255,255,.04)" : "rgba(60,40,20,.05)"; g.fillRect(q() * w, q() * h, 3, 3); }
    const txt = (s, lo, la, px, rot = 0, col = INK, font = "B") => { const [x, y] = MP(lo, la); g.save(); g.translate(x, y); g.rotate(rot); g.font = font === "B" ? FB(px) : FM(700, px); g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = px * 0.22; g.strokeStyle = "rgba(255,248,230,.85)"; g.strokeText(s, 0, 0); g.fillStyle = col; g.fillText(s, 0, 0); g.restore(); };
    txt("PULAU", -123.98, 48.86, 58, -0.55, "#8E1F1A"); txt("VANCOUVER", -123.86, 48.76, 58, -0.55, "#8E1F1A"); txt("(INGGRIS)", -123.88, 48.62, 38, -0.55, "#8E1F1A", "M");
    txt("AMERIKA SERIKAT", -122.2, 48.35, 52, -Math.PI / 2, "#1E3F7A");
    txt("WILAYAH INGGRIS", -122.45, 49.1, 36, 0, "#8E1F1A", "M");
    txt("49° LU", -122.38, 48.94, 34, 0, INK, "M");
    txt("KEP. SAN JUAN", -122.98, 48.36, 48, 0, "#2E5A26");
    txt("SELAT HARO", -123.42, 48.66, 36, -1.45, "#1E3F7A", "M");
    txt("SELAT ROSARIO", -122.62, 48.58, 34, -1.45, "#8E1F1A", "M");
    g.strokeStyle = "rgba(60,40,20,.55)"; g.lineWidth = 10; g.strokeRect(14, 14, w - 28, h - 28);
    const cx = 130, cy = h - 140; g.fillStyle = "rgba(255,248,230,.9)"; g.beginPath(); g.moveTo(cx, cy - 80); g.lineTo(cx + 22, cy); g.lineTo(cx, cy + 80); g.lineTo(cx - 22, cy); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); g.fillStyle = INK; g.font = FB(40); g.textAlign = "center"; g.fillText("U", cx, cy - 100);
  });
  const mapCloth = mk(new THREE.PlaneGeometry(MAPW, MAPH), new THREE.MeshStandardMaterial({ map: mapT, roughness: 0.92, bumpMap: weaveT, bumpScale: 0.6, envMapIntensity: 0.35 }), 0, 0.03, MZ, gMap);
  mapCloth.rotation.x = -Math.PI / 2; mapCloth.castShadow = false;
  // weights on the corners (brass) so it reads as a cloth laid on the stage
  for (const [x, z] of [[-5.8, MZ - 4.3], [5.8, MZ - 4.3], [-5.8, MZ + 4.3], [5.8, MZ + 4.3]]) mk(CYL(0.28, 0.32, 0.3, 20), gold, x, 0.18, z, gMap);
  function dashLine(pts, col, step = 0.2) {
    const P = pts.map(([lo, la]) => W3(lo, la)); const out = [];
    for (let i = 0; i < P.length - 1; i++) { const [x0, z0] = P[i], [x1, z1] = P[i + 1], L = Math.hypot(x1 - x0, z1 - z0); for (let d = 0; d < L; d += step) { const u = d / L; out.push([x0 + (x1 - x0) * u, z0 + (z1 - z0) * u, Math.atan2(z1 - z0, x1 - x0)]); } }
    const im = new THREE.InstancedMesh(rb(0.13, 0.07, 0.07, 0.03), plastic(col, 0.4), out.length); im.castShadow = true; im.frustumCulled = false;
    const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion();
    out.forEach(([x, z, a], i) => { M4.compose(new V3(x, 0.07, z), Q.setFromAxisAngle(new V3(0, 1, 0), -a), new V3(1, 1, 1)); im.setMatrixAt(i, M4); });
    im.count = 0; gMap.add(im); return { im, n: out.length };
  }
  const lat49 = dashLine([[-121.9, 49.0], [-123.3, 49.0]], "#F4ECD8", 0.22);
  const haroL = dashLine(HARO, USB), rosL = dashLine(ROS, UKR);
  const [qx, qz] = W3(-123.12, 48.52);
  const qMark = tag(gMap, qx, 1.0, qz, 0.9, 1.1, [["?", 120, "B", "#8E1F1A"]], { pw: 256 });
  const claimPins = [];
  for (const [lo, la] of [[-123.09, 48.54], [-122.9, 48.67], [-122.875, 48.5]]) { const [x, z] = W3(lo, la); const u = flag(gMap, x - 0.22, 1.0, z, 0.5, 0.28, usT); u.rotation.y = 0.25; const b = flag(gMap, x + 0.12, 1.0, z + 0.05, 0.5, 0.28, ukT); b.rotation.y = -0.25; claimPins.push(u, b); }

  // ================= ACT III/IV: GARDEN + SCALE =================
  const gGarden = grp();
  const bed = mk(rb(9.5, 0.32, 3.6, 0.14), clay("#6B4A31"), 0.2, 0.16, -0.4, gGarden);
  { const im = new THREE.InstancedMesh(SPH(1, 14), clay("#5E9A4C"), 18 * 5); im.castShadow = true; const q = mulberry(9); const M4 = new THREE.Matrix4(); let k = 0;
    for (let rw = 0; rw < 3; rw++) for (let i = 0; i < 6; i++) { const x = -3.6 + i * 1.5 + rw * 0.3, z = -1.6 + rw * 1.1; if (Math.abs(x - 0.6) < 0.8 && rw === 2) { k += 5; continue; } for (let j = 0; j < 5; j++) { const s = 0.18 + q() * 0.12; M4.compose(new V3(x + (q() - 0.5) * 0.5, 0.42 + q() * 0.25, z + (q() - 0.5) * 0.4), new THREE.Quaternion(), new V3(s, s * 0.8, s)); im.setMatrixAt(k++, M4); } }
    for (; k < 90; k++) im.setMatrixAt(k, new THREE.Matrix4().makeScale(0, 0, 0)); gGarden.add(im); }
  for (let i = 0; i < 9; i++) { mk(rb(0.16, 1.1, 0.16, 0.05), wood("#B98A5A"), -6 + i * 1.5, 0.55, -2.9, gGarden); }
  for (const y of [0.45, 0.85]) mk(rb(12.2, 0.1, 0.08, 0.03), wood("#C49A66"), 0, y, -2.9, gGarden);
  // farmhouse flat (left) and HBC sheep run (right)
  { const G = grp(-4.6, 0, -4.2, gGarden); mk(rb(2.6, 1.8, 1.6, 0.12), clay("#E9DCC0"), 0, 0.9, 0, G); const roof = mk(new THREE.CylinderGeometry(0.01, 1.7, 1.2, 4, 1), clay("#9C4A35"), 0, 2.4, 0, G); roof.rotation.y = Math.PI / 4; roof.scale.set(1.15, 1, 0.75); mk(rb(0.5, 0.8, 0.06, 0.05), wood("#6E4426"), 0.4, 0.45, 0.8, G); mk(rb(0.45, 0.45, 0.06, 0.05), plastic("#BFD9E6", 0.3), -0.6, 1.0, 0.8, G); }
  const sheep = [];
  for (const [x, z, ry] of [[3.2, -4.1, -0.4], [4.6, -3.7, 0.3], [5.6, -4.5, -0.9]]) { const G = grp(x, 0, z, gGarden); for (const [a, b, c] of [[0, 0.62, 0], [0.28, 0.66, 0.15], [-0.28, 0.66, -0.12], [0.05, 0.85, 0], [0, 0.6, 0.3], [0, 0.62, -0.3]]) mk(SPH(0.36, 16), clay("#F4F0E6"), a, b, c, G); const hd = mk(rb(0.3, 0.32, 0.36, 0.1), clay("#2A2622"), 0, 0.72, 0.55, G); for (const [lx, lz] of [[-0.2, 0.25], [0.2, 0.25], [-0.2, -0.25], [0.2, -0.25]]) mk(CYL(0.06, 0.06, 0.4, 8), clay("#2A2622"), lx, 0.2, lz, G); G.rotation.y = ry; G.scale.setScalar(0.85); sheep.push(hd); }
  const hbc = tag(gGarden, 4.3, 1.75, -2.6, 2.6, 0.95, [["HUDSON'S BAY CO.", 64, "B", "#7A1F1A"], ["PETERNAKAN DOMBA · INGGRIS", 30, "M"]], { pw: 768, tape: "rgba(240,170,170,.8)" });
  // characters
  const cutlar = person({ coat: "#5E86B8", pants: "#5B4A3A", vest: "#7A5A3A", hat: "straw", hair: "#6B4026", ph: 2 }); gGarden.add(cutlar.G); cutlar.G.position.set(-3.1, 0.32, 0.9); cutlar.G.rotation.y = 0.55; cutlar.G.scale.setScalar(0.92);
  const cRifle = rifle(cutlar); cutlar.arms[0].sh.rotation.x = -1.0; cutlar.arms[1].sh.rotation.x = -1.15; cutlar.arms[1].el.rotation.x = -0.25; cutlar.arms[0].el.rotation.x = -0.6; cRifle.rotation.set(1.05, 0, 0);
  blob(gGarden, -3.1, 0.9, 1.4, 1.1, 0.34);
  const griffin = person({ coat: "#3F6B4A", pants: "#34343C", hat: "top", tails: true, buttons: true, hair: "#C9A06A", beard: "#C9A06A", ph: 3 }); gGarden.add(griffin.G); griffin.G.scale.setScalar(0.92);
  const gBlob = blob(gGarden, 3.0, 0.9, 1.4, 1.1, 0.34);
  const gardenPig = pig(pink, pinkD, 0.95); gGarden.add(gardenPig.G);
  const pigBlob = blob(gGarden, 0.5, 0.2, 1.3, 1.7, 0.34);
  const tagCut = tag(gGarden, -4.6, 3.55, 1.3, 2.1, 0.78, [["LYMAN CUTLAR", 70, "B"], ["PETANI AMERIKA", 34, "M", "#1E3F7A"]], { tape: "rgba(150,190,240,.8)" });
  const tagGri = tag(gGarden, 4.6, 3.55, 1.3, 2.3, 0.78, [["CHARLES GRIFFIN", 66, "B"], ["PEGAWAI HBC · INGGRIS", 32, "M", "#8E1F1A"]], { tape: "rgba(240,170,170,.8)" });
  // shot: cork puff + star
  const puff = grp(0, 0, 0, gGarden); const puffs = []; for (let i = 0; i < 6; i++) puffs.push(mk(SPH(0.22, 14), new THREE.MeshStandardMaterial({ color: "#F6F2EA", roughness: 0.9, transparent: true, opacity: 0.9 }), 0, 0, 0, puff));
  const starSh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + Math.PI / 2, rr = i % 2 ? 0.16 : 0.38; i ? starSh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : starSh.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  const starG = new THREE.ExtrudeGeometry(starSh, { depth: 0.08, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1 });
  const stars = [0, 1, 2].map(() => mk(starG, new THREE.MeshStandardMaterial({ color: "#F6C945", roughness: 0.4, emissive: "#6B4A00", emissiveIntensity: 0.4 }), 0, 0, 0, gGarden));
  // balance scale lowered from the flies
  const scaleG = grp(0, 0, 1.7, gGarden); scaleG.scale.setScalar(1.25);
  mk(CYL(0.55, 0.7, 0.25, 24), wood("#6E4426"), 0, 0.12, 0, scaleG); mk(CYL(0.09, 0.12, 2.4, 14), gold, 0, 1.4, 0, scaleG); mk(SPH(0.16, 14), gold, 0, 2.66, 0, scaleG);
  const beam = grp(0, 2.6, 0, scaleG); mk(rb(3.4, 0.12, 0.14, 0.05), gold, 0, 0, 0, beam);
  const pans = [-1, 1].map((s) => { const P = grp(0, 0, 0, scaleG); mk(CYL(0.62, 0.5, 0.1, 28), gold, 0, 0, 0, P); for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; const c = mk(CYL(0.012, 0.012, 1.15, 6), gold, Math.cos(a) * 0.45, 0.58, Math.sin(a) * 0.45, P); c.rotation.set(Math.sin(a) * 0.37, 0, -Math.cos(a) * 0.37); c.castShadow = false; } return P; });
  const coinG = new THREE.CylinderGeometry(0.17, 0.17, 0.06, 24);
  const coinL = [], coinR = [];
  coinL.push(...[0, 1].map((k) => mk(coinG, gold, 0, 0.09 + k * 0.065, 0, pans[0])));
  { let n = 0; for (let st = 0; st < 7 && n < 20; st++) { const a = st / 6 * Math.PI * 2, rr = st === 6 ? 0 : 0.36; for (let k = 0; k < 3 && n < 20; k++, n++) coinR.push(mk(coinG, gold, st === 6 ? 0 : Math.cos(a) * rr, 0.09 + k * 0.065, st === 6 ? 0 : Math.sin(a) * rr, pans[1])); } }
  const ropes = [-1, 1].map((s) => { const m = mk(CYL(0.02, 0.02, 12, 6), plastic("#CDB48A", 0.8), s * 0.06, 8.6, 0, scaleG); m.castShadow = false; return m; });
  const t10 = tag(scaleG, 0, 0.62, 0, 1.2, 0.64, [["$10", 92, "B", "#1E3F7A"], ["TAWARAN", 30, "M"]], { pw: 384, tape: "rgba(150,190,240,.8)", noStick: true });
  const t100 = tag(scaleG, 0, 0.62, 0, 1.3, 0.64, [["$100", 92, "B", "#8E1F1A"], ["TUNTUTAN", 30, "M"]], { pw: 384, tape: "rgba(240,170,170,.8)", noStick: true });
  const bangT = canvasTex(256, 384, (g, w, h) => { g.fillStyle = "#D7322B"; g.strokeStyle = "#2A1E17"; g.lineWidth = 12; g.beginPath(); g.roundRect(80, 20, 96, 230, 30); g.fill(); g.stroke(); g.beginPath(); g.arc(128, 320, 46, 0, 7); g.fill(); g.stroke(); });
  const bangs = [[-3.1, 3.7, 0.9], [3.0, 3.7, 0.9]].map(([x, y, z]) => { const m = mk(new THREE.PlaneGeometry(0.75, 1.12), new THREE.MeshStandardMaterial({ map: bangT, transparent: true, alphaTest: 0.1, roughness: 0.6 }), x, y, z, gGarden); return m; });

  // ================= ACT V/VI: BATTLE =================
  const gBattle = grp();
  mk(rb(16.4, 0.3, 4.6, 0.12), clay("#B9A06A"), 0, 0.15, 1.9, gBattle);
  mk(rb(16.4, 0.06, 4.2, 0.03), clay("#7FA35A"), 0, 0.31, 2.2, gBattle);
  const seaWaves = [];
  for (const [z, c, sd] of [[-5.3, "#2C5E86", 1], [-4.0, "#36709A", 2], [-2.5, "#3E7FA6", 3], [-1.0, "#4C90B6", 4], [-0.2, "#5FA2C4", 5]]) seaWaves.push(wave(gBattle, 0, z, 17, 0.62, c, sd));
  const SHIPPOS = [[3.4, -1.75, -0.45], [-0.4, -3.3, -0.4], [4.6, -4.6, -0.5], [-4.2, -1.75, -0.45], [-4.6, -4.6, -0.4]];
  const ships = SHIPPOS.map(() => ship(gBattle, 1.0));
  flag(gBattle, -7.0, 5.0, 3.4, 1.8, 0.95, usT);
  const pickett = person({ coat: "#24407A", pants: "#7E9AC4", hat: "kepi", epaul: true, buttons: true, belt: "#1A1612", hair: "#6B4026", beard: "#6B4026", ph: 5 }); gBattle.add(pickett.G); pickett.G.scale.setScalar(0.95);
  { const sw = grp(0, -0.5, 0, pickett.arms[0].el); mk(rb(0.06, 1.0, 0.1, 0.02), plastic("#D8DCE2", 0.25), 0, -0.4, 0.1, sw); sw.rotation.x = 0.2; }
  const pBlob = blob(gBattle, 0, 2.45, 1.4, 1.1, 0.32);
  const tagPick = tag(gBattle, 1.75, 3.0, 2.9, 2.1, 0.74, [["GEORGE PICKETT", 64, "B"], ["KAPTEN · AS", 32, "M", "#1E3F7A"]], { tape: "rgba(150,190,240,.8)" });
  const solProto = person({ coat: USB, pants: "#7E9AC4", hat: "kepi", buttons: true, belt: "#2A2420" });
  solProto.arms[1].sh.rotation.x = -0.25; solProto.arms[1].el.rotation.x = -1.0; rifle(solProto).rotation.set(-1.45, 0, 0);
  const CROWD = 46, crowd = bakeCrowd(solProto, CROWD, gBattle);
  const crowdPos = [];
  { const q = mulberry(461); const rowsZ = [2.35, 1.65, 0.95, 0.3]; const order = [];
    for (let rw = 0; rw < 4; rw++) for (let i = 0; i < 12; i++) { const x = -6.1 + i * 1.1 + (rw % 2) * 0.45; if (rw === 0 && Math.abs(x) < 0.7) continue; order.push([x, rowsZ[rw], (q() - 0.5) * 0.4, Math.abs(x) + rw * 3]); }
    order.sort((a, b) => a[3] - b[3]); for (let i = 0; i < CROWD; i++) crowdPos.push(order[i]); }
  const cannons = []; for (let i = 0; i < 14; i++) cannons.push(cannon(gBattle, -6.5 + i * 1.0, -0.1 + (i % 2) * 0.15, Math.PI));
  const fuseM = new THREE.MeshStandardMaterial({ color: "#FFC46B", emissive: "#FF8A2A", emissiveIntensity: 2.2 });
  const fuses = cannons.map((c) => { const f = mk(SPH(0.07, 10), fuseM, 0, 0.62, 0.3, c); f.castShadow = false; return f; });
  const smokeM = new THREE.MeshStandardMaterial({ color: "#C9C6C2", roughness: 1, transparent: true, opacity: 0.8 });
  const smokes = cannons.map((c) => mk(SPH(0.16, 12), smokeM, 0, 0.8, 0.3, c));
  const note10 = tag(gBattle, -6.6, 2.05, 3.55, 1.9, 0.66, [["1 FIGUR =", 44, "B"], ["±10 TENTARA", 36, "M", "#1E3F7A"]], { pw: 512, tape: "rgba(150,190,240,.8)" });
  // Baynes on a rowboat
  const boat = grp(0, 0, -0.65, gBattle);
  mk(rb(2.4, 0.5, 1.0, 0.24), plastic("#E9DFC9", 0.5), 0, 0.42, 0, boat); mk(rb(2.44, 0.12, 1.04, 0.05), plastic(UKR, 0.45), 0, 0.62, 0, boat);
  const baynes = person({ coat: "#1F2A4A", pants: "#F0ECE2", hat: "bicorne", epaul: true, buttons: true, belt: "#C9A24A", hair: "#E2DED6", ph: 6 }); boat.add(baynes.G); baynes.G.position.set(0.1, 0.45, 0); baynes.G.scale.setScalar(0.95);
  const tagBay = tag(boat, 1.9, 3.4, 0.3, 2.3, 0.8, [["ROBERT BAYNES", 66, "B"], ["LAKSAMANA MUDA · INGGRIS", 30, "M", "#8E1F1A"]], { tape: "rgba(240,170,170,.8)", noStick: true });
  const bubT = label(512, 400, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = "#FFFDF6"; g.strokeStyle = INK; g.lineWidth = 8;
    g.beginPath(); for (const [x, y, rr] of [[150, 170, 95], [250, 130, 110], [360, 170, 95], [200, 240, 90], [320, 240, 90]]) { g.moveTo(x + rr, y); g.arc(x, y, rr, 0, 7); } g.fill(); g.stroke(); g.fill();
    g.beginPath(); g.arc(120, 350, 22, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(80, 385, 12, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#F2A2B3"; g.beginPath(); g.arc(256, 190, 78, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#E07F93"; g.beginPath(); g.ellipse(256, 215, 36, 26, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = INK; for (const s of [-1, 1]) { g.beginPath(); g.arc(256 + s * 13, 215, 6, 0, 7); g.fill(); g.beginPath(); g.arc(256 + s * 30, 168, 9, 0, 7); g.fill(); }
    g.fillStyle = "#F2A2B3"; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 40, 130); g.lineTo(256 + s * 78, 100); g.lineTo(256 + s * 66, 150); g.closePath(); g.fill(); g.stroke(); }
  });
  const bubble = mk(new THREE.PlaneGeometry(1.7, 1.33), new THREE.MeshStandardMaterial({ map: bubT, transparent: true, alphaTest: 0.1, roughness: 0.8 }), -1.5, 4.1, 0.2, boat);

  // ================= ACT VII: CAMPS =================
  const gCamps = grp();
  mound(gCamps, 6.2, 1.25, 3.2, 0, -0.6);
  const moundY = (x, z) => { const q = 1 - (x / 6.2) ** 2 - ((z + 0.6) / 3.2) ** 2; return q > 0 ? Math.max(0, -0.15 + 1.25 * Math.sqrt(q)) : 0; };
  tree(gCamps, -5.2, -1.6, 0.75); tree(gCamps, 5.0, -2.2, 0.8);
  wave(gCamps, 0, -5.2, 17, 0.6, "#3E7FA6", 6); wave(gCamps, 0, -4.2, 17, 0.5, "#4C90B6", 7);
  const stripeT = (c) => canvasTex(128, 128, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#F4EEE0" : c; g.fillRect(i * 16, 0, 16, h); } }, [2, 1]);
  const tentM = { uk: new THREE.MeshStandardMaterial({ map: stripeT(UKR), roughness: 0.88, envMapIntensity: ENV }), us: new THREE.MeshStandardMaterial({ map: stripeT(USB), roughness: 0.88, envMapIntensity: ENV }) };
  const tents = { uk: [], us: [] };
  for (const [x, z, side] of [[-2.6, -2.1, "uk"], [-1.0, -2.4, "uk"], [0.6, -2.15, "uk"], [-0.4, 0.9, "us"], [1.2, 1.1, "us"], [2.8, 0.85, "us"]]) {
    const G = grp(x, moundY(x, z) - 0.06, z, gCamps); const c = mk(new THREE.ConeGeometry(0.85, 1.25, 4), tentM[side], 0, 0.62, 0, G); c.rotation.y = Math.PI / 4; mk(new THREE.CircleGeometry(0.28, 3), plastic("#2A1E17", 0.8), 0, 0.3, 0.61, G).rotation.z = Math.PI / 2; tents[side].push(G);
  }
  const ukPole = flag(gCamps, 2.4, 3.6, -2.3, 1.3, 0.68, ukT); ukPole.position.y = moundY(2.4, -2.3) - 0.05;
  const usPole = flag(gCamps, -2.6, 3.6, 1.0, 1.3, 0.68, usT); usPole.position.y = moundY(-2.6, 1.0) - 0.05;
  const winPole = flag(gCamps, 0.15, 3.0, -0.5, 1.5, 0.8, usT);
  const redcoat = { coat: UKR, pants: "#F0ECE2", hat: "shako", cross: true, ph: 7 }, bluecoat = { coat: USB, pants: "#7E9AC4", hat: "kepi", buttons: true, belt: "#2A2420", ph: 8 };
  const campMen = [];
  for (const [o, x, z, ry] of [[redcoat, -3.4, -1.6, 0.4], [redcoat, -1.8, -1.3, 0.2], [redcoat, 1.5, -1.5, -0.3], [bluecoat, -1.6, 1.6, 0.3], [bluecoat, 0.4, 1.9, 0], [bluecoat, 3.6, 1.5, -0.4]]) {
    const P = person({ ...o, ph: x }); P.G.scale.setScalar(0.55); P.G.position.set(x, 0, z); P.G.rotation.y = ry; gCamps.add(P.G); P.home = [x, z, ry]; campMen.push(P);
  }
  const tagUK = tag(gCamps, -3.6, 2.9, -2.9, 1.9, 0.8, [["KAMP INGGRIS", 54, "B", "#8E1F1A"], ["UTARA · MAKS. 100", 30, "M"]], { pw: 512, tape: "rgba(240,170,170,.8)" });
  const tagUS = tag(gCamps, 4.5, 2.3, 2.0, 1.9, 0.8, [["KAMP AS", 58, "B", "#1E3F7A"], ["SELATAN · MAKS. 100", 30, "M"]], { pw: 512, tape: "rgba(150,190,240,.8)" });
  // year counter on an easel
  let calVal = null;
  const easel = grp(-4.3, 0, 2.7, gCamps);
  for (const s of [-1, 1]) { const l = mk(rb(0.1, 2.6, 0.1, 0.03), wood("#B98A5A"), s * 0.55, 1.25, 0, easel); l.rotation.z = -s * 0.12; }
  const calT = canvasTex(512, 420, () => {});
  const paintCal = (v) => { const g = calT.image.getContext("2d"), w = 512, h = 420; const yr = v.length === 4; paintTag(g, w, h, yr ? [[v, 150, "B", v === "1872" ? "#1E3F7A" : INK], ["PENDUDUKAN BERSAMA", 30, "M", "#5A3A1A"]] : [["TAHUN KE-" + v, 92, "B"], ["PENDUDUKAN BERSAMA", 30, "M", "#5A3A1A"]], "rgba(246,214,120,.85)"); calT.needsUpdate = true; };
  const calCard = mk(new THREE.PlaneGeometry(1.7, 1.4), new THREE.MeshStandardMaterial({ color: 0xcfcfcf, map: calT, transparent: true, alphaTest: 0.05, roughness: 0.85, envMapIntensity: 0.2 }), 0, 1.95, 0.08, easel);
  mk(rb(1.6, 0.1, 0.3, 0.03), wood("#9A6638"), 0, 1.2, 0.05, easel);
  // Kaiser Wilhelm I on a podium, lowered on wires
  const podium = grp(3.3, 0, 2.6, gCamps);
  mk(rb(1.5, 0.9, 1.1, 0.12), wood("#7A4A2A"), 0, 0.45, 0, podium);
  const podT = label(512, 160, (g, w, h) => { g.fillStyle = "#D2A245"; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 18); g.fill(); g.fillStyle = "#3A2410"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = FB(56); g.fillText("ARBITRASE", w / 2, h / 2 - 18); g.font = FM(700, 32); g.fillText("21 OKT 1872", w / 2, h / 2 + 34); });
  mk(new THREE.PlaneGeometry(1.25, 0.4), new THREE.MeshStandardMaterial({ map: podT, roughness: 0.35, metalness: 0.5 }), 0, 0.5, 0.56, podium).castShadow = false;
  const kaiser = person({ coat: "#3B4A5E", pants: "#20242C", hat: "pickel", epaul: true, buttons: true, belt: "#C9A24A", beard: "#EDEBE6", skin: "#F0C6A6", ph: 9 }); podium.add(kaiser.G); kaiser.G.scale.setScalar(0.9);
  const gavel = grp(0, -0.5, 0.1, kaiser.arms[1].el); mk(CYL(0.035, 0.035, 0.7, 8), wood("#6E4426"), 0, 0, 0.3, gavel).rotation.x = Math.PI / 2; mk(rb(0.36, 0.18, 0.18, 0.05), wood("#5A3418"), 0, 0, 0.65, gavel);
  const wires = [-1, 1].map((s) => { const m = mk(CYL(0.008, 0.008, 14, 4), plastic("#DDDDDD", 0.3), s * 0.35, 0, 0, podium); m.castShadow = false; return m; });
  const tagKai = tag(podium, -1.5, 4.35, 0.2, 2.2, 0.8, [["KAISAR WILHELM I", 60, "B"], ["JERMAN · PENENGAH", 30, "M", "#5A3A1A"]], { noStick: true });
  // confetti
  const CF = 140, conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.14, 0.09), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.7 }), CF);
  conf.frustumCulled = false; gCamps.add(conf);
  { const q = mulberry(1872); const cols = ["#C8322B", "#2F5DA8", "#F2C766", "#F4EEE0", "#7FB069"]; for (let i = 0; i < CF; i++) conf.setColorAt(i, new THREE.Color(cols[Math.floor(q() * 5)])); }
  const confR = Array.from({ length: CF }, (_, i) => { const q = mulberry(i * 13 + 5); return [q() * 13 - 6.5, q() * 3, q() * 6 - 3.5, q() * 6, 0.6 + q() * 0.6]; });

  // ================= ACT VIII: THE ONLY CASUALTY =================
  const gFinal = grp();
  mk(rb(1.9, 1.2, 1.9, 0.14), wood("#5E3A22"), 0, 0.6, 0.6, gFinal);
  mk(rb(2.1, 0.16, 2.1, 0.06), gold, 0, 1.24, 0.6, gFinal);
  const finT = label(512, 200, (g, w, h) => { g.fillStyle = "#D2A245"; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 18); g.fill(); g.strokeStyle = "#7A5520"; g.lineWidth = 5; g.beginPath(); g.roundRect(16, 16, w - 32, h - 32, 12); g.stroke(); g.fillStyle = "#3A2410"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = FB(52); g.fillText("SATU-SATUNYA", w / 2, h / 2 - 30); g.font = FB(52); g.fillText("KORBAN · 1859", w / 2, h / 2 + 32); });
  mk(new THREE.PlaneGeometry(1.6, 0.62), new THREE.MeshStandardMaterial({ map: finT, roughness: 0.3, metalness: 0.55, envMapIntensity: 1.0 }), 0, 0.62, 1.56, gFinal).castShadow = false;
  const statue = pig(bronze, bronze, 1.05); gFinal.add(statue.G); statue.G.position.set(0, 1.32, 0.6);
  for (let i = 0; i < 8; i++) { const f = grp((i % 2 ? 1 : -1) * (1.25 + (i % 3) * 0.12), 0, -0.3 + Math.floor(i / 2) * 0.45, gFinal); mk(CYL(0.02, 0.02, 0.4, 6), clay("#4F8F50"), 0, 0.2, 0, f); mk(SPH(0.12, 12), clay(i % 2 ? "#E04B4B" : "#F2C766"), 0, 0.42, 0, f); }
  blob(gFinal, 0, 0.6, 3.2, 3.2, 0.012);

  // ---------- timings ----------
  const T2 = K.s2, T3 = K.s3, T4 = K.s4, T5 = K.s5, T6 = K.s6, T7 = K.s7, T8 = K.s8;
  const tPem = A("s1:Pemicunya"), tBabi1 = A("s1:babi");
  const tKep = A("s2:Kepulauan"), tVan = A("s2:Vancouver"), tMen = A("s2:menarik"), tTeng = A("s2:tengah"), tMas = A("s2:Masalahnya"), tDua = A("s2:dua"), tSel2 = A("s2:selat#2"), tKlaim = A("s2:mengklaim");
  const tLyman = A("s3:Lyman"), tTembak = A("s3:menembak"), tPemi = A("s3:Pemiliknya"), tCharles = A("s3:Charles");
  const tTawar = A("s4:menawarkan"), tSep = A("s4:sepuluh"), tSer = A("s4:seratus"), tBesar = A("s4:membesar"), tPers = A("s4:Perselisihan");
  const tKapten = A("s5:Kapten"), tEnam = A("s5:enam"), tKapal = A("s5:kapal"), t461 = A("s5:461"), tEmpat = A("s5:empat"), tLima = A("s5:lima"), tTujuh = A("s5:tujuh"), t2140 = A("s5:2.140");
  const tLaks = A("s6:Laksamana"), tBay = A("s6:Baynes"), tTolak = A("s6:menolak"), tBabi6 = A("s6:babi");
  const tBersama = A("s7:bersama"), tMasing = A("s7:masing-masing"), tSelama = A("s7:selama"), t1872 = A("s7:1872"), tArb = A("s7:arbitrase"), tKaisar = A("s7:Kaisar"), tMenang = A("s7:memenangkan");
  const tKorb = A("s8:korban"), tSatu = A("s8:Satu-satunya"), tMenurut = A("s8:Menurut"), tIkuti = A("s8:Ikuti");
  const tShot = tTembak + 0.35;
  const SW = [T2, T3, T5, T7, T8];

  // ---------- camera: [t, px,py,pz, tx,ty,tz] ----------
  const keys = [
    [0, 0, 6.2, 33, 0, 3.0, 0], [tPem, 0, 4.4, 24, 0, 2.1, 0.4], [T2 - 0.62, 0, 4.0, 20.5, 0, 2.0, 0.5], [T2 - 0.02, 0, 4.0, 20.4, 0, 2.0, 0.5],
    [T2 + 0.02, 0, 5.0, 24, 0, 1.8, 0], [T2 + 1.0, 0, 7.5, 22, 0, 1.0, -0.4], [T2 + 3.3, 0.6, 17.5, 9.0, 0.6, 0, -1.9], [tMas, 1.0, 16.6, 8.6, 0.9, 0, -1.8], [T3 - 1.9, 1.3, 16.0, 8.8, 1.0, 0, -1.6],
    [T3 - 0.62, 0, 5.2, 25, 0, 2.2, 0], [T3 - 0.02, 0, 5.2, 25, 0, 2.2, 0],
    [T3 + 0.02, 0, 5.4, 27, 0, 2.2, 0], [tLyman, -1.3, 4.6, 21, -1.3, 1.9, 0.4], [tShot + 0.7, -0.6, 4.4, 19.5, -0.7, 1.7, 0.4], [tPemi, 0.3, 4.8, 22, 0.5, 2.0, 0.4], [tCharles + 0.4, 1.2, 4.7, 21, 1.4, 2.0, 0.4],
    [T4 + 0.2, 0.2, 5.0, 21.5, 0.1, 2.5, 0.9], [tSer + 0.4, 0.3, 5.0, 21, 0.2, 2.5, 1.0], [tBesar - 0.2, 0, 5.1, 23, 0, 2.4, 0.8], [tBesar + 0.7, 0, 4.4, 19.5, 0, 2.5, 0.8], [T5 - 0.62, 0, 4.5, 20, 0, 2.5, 0.8], [T5 - 0.02, 0, 4.5, 20, 0, 2.5, 0.8],
    [T5 + 0.02, 0, 5.8, 26, 0, 2.3, -0.6], [tKapten + 0.3, 0, 5.0, 21, 0, 2.3, 0.6], [tKapal, 0.6, 6.0, 25, 0.7, 2.3, -1.2], [t461 + 0.2, 0, 8.0, 33, 0, 2.4, -1.0], [tLima, 0, 9.2, 38, 0, 2.7, -1.3], [T6 - 0.1, 0, 9.4, 39, 0, 2.7, -1.3],
    [tBay, 2.5, 7.8, 10.8, 2.1, 2.5, -0.65], [tTolak + 1.2, 2.4, 7.3, 9.8, 2.1, 2.7, -0.65], [tBabi6 - 0.7, 2.1, 7.5, 10.4, 1.8, 3.0, -0.65], [T7 - 0.62, 1.0, 6.0, 19, 0.6, 2.4, -0.4], [T7 - 0.02, 0.8, 5.2, 20, 0.6, 2.6, -0.4],
    [T7 + 0.02, 0, 6.2, 28.5, 0, 2.0, -0.6], [tMasing, 0, 6.6, 27.5, 0, 1.9, -0.6], [tSelama + 0.2, -2.8, 4.6, 16.5, -3.4, 2.2, 1.4], [t1872 + 0.5, -2.4, 4.7, 17, -2.9, 2.2, 1.2], [tKaisar - 0.3, 1.4, 5.4, 21, 2.0, 2.6, 1.0], [tMenang + 0.2, 1.0, 5.4, 21, 1.4, 2.6, 0.4], [K.s7e, 0, 6.2, 27.5, 0, 2.0, -0.4], [T8 - 0.62, 0, 6.0, 26, 0, 2.2, 0], [T8 - 0.02, 0, 6.0, 26, 0, 2.2, 0],
    [T8 + 0.02, 0, 4.2, 21, 0, 2.3, 0.6], [tMenurut, 0, 3.8, 17.5, 0, 2.35, 0.6], [tIkuti, 0, 3.9, 18, 0, 2.4, 0.6], [tIkuti + 2.3, 0, 6.0, 33, 0, 3.2, 0], [K.dur, 0, 6.2, 35, 0, 3.4, 0],
  ];
  for (const k of keys) if (k[2] < 10 && !(k[0] >= T6 && k[0] < T7 - 0.7) && !(k[0] > T8 && k[0] <= tIkuti)) k[5] -= 0.9;
  const camT = track(keys);
  const tgt = new V3();

  function curtainOpen(t) {
    let o = ramp(t, 0.1, 1.25);
    for (const T of SW) if (t > T - 0.6 && t < T + 1.0) o = t < T ? 1 - ramp(t, T - 0.6, T - 0.08) : ramp(t, T + 0.1, T + 1.0);
    if (t > K.end - 1.2) o = Math.min(o, 1 - ramp(t, K.end - 1.2, K.end + 0.05));
    return o;
  }

  return (t) => {
    if (!fontsOk && document.fonts && document.fonts.check(FB(40)) && document.fonts.check(FM(700, 40))) { fontsOk = true; for (const [tx, paint] of labels) { const c = tx.image; paint(c.getContext("2d"), c.width, c.height); tx.needsUpdate = true; } calVal = null; }
    const act = t < T2 ? 1 : t < T3 ? 2 : t < T5 ? 3 : t < T7 ? 5 : t < T8 ? 7 : 8;
    const actN = { 1: 0, 2: 1, 3: 2, 5: 3, 7: 4, 8: 5 }[act];
    if (actN !== plaqueAct) { plaqueAct = actN; const c = plaqueT.image; labels.find((l) => l[0] === plaqueT)[1](c.getContext("2d"), c.width, c.height); plaqueT.needsUpdate = true; }
    gHook.visible = act === 1; gMap.visible = act === 2; gGarden.visible = act === 3; gBattle.visible = act === 5; gCamps.visible = act === 7; gFinal.visible = act === 8;
    bdMat.map = bdTex[act]; sky.visible = act === 1 || act === 3 || act === 7;
    sun.position.y = act === 3 ? -1.6 : act === 7 ? -0.6 : 0; cloud.position.x = act === 7 ? -1.2 : 2.6 + Math.sin(t * 0.2) * 0.3;

    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.12, c[1] + Math.sin(t * 0.29) * 0.08, c[2]);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    curtains(curtainOpen(t), t);

    // light moods
    let dim = 1, fI = 0, fx = 0, fy = 1.2, fz = 0.8;
    if (act === 1) { const k = ramp(t, tPem - 0.2, tPem + 0.6); dim = 1 - 0.5 * k; fI = 3.6 * k; fx = 0; fy = 1.3; fz = 0.9; }
    if (act === 5 && t >= T6) { const k = ramp(t, tLaks, tLaks + 0.8); dim = 1 - 0.25 * k; fI = 1.1 * k; fx = 2.1; fy = 2.2; fz = -0.65; }
    if (act === 8) { dim = 0.42; fI = 6; fx = 0; fy = 1.8; fz = 0.6; }
    if (act === 3 && t >= T4) { const k = ramp(t, tBesar - 0.3, tBesar + 0.5); key.color.set(0xffd9a8).lerp(new THREE.Color(0xff9a7a), k * 0.6); } else key.color.set(0xffd9a8);
    key.intensity = 2.4 * dim; fill.intensity = 0.6 * dim; hemi.intensity = 0.5 * (0.45 + 0.55 * dim); rim.intensity = 0.6 * dim;
    follow.intensity = fI; follow.target.position.set(fx, fy, fz); follow.position.set(fx * 0.6, 19, fz + 10);
    foot.intensity = 1.6;
    for (const f of flags) { const pa = f.geo.attributes.position; for (let i = 0; i < pa.count; i++) { const x = f.base[i * 3], y = f.base[i * 3 + 1]; pa.setZ(i, Math.sin(x * 4.5 - t * 5 + y * 1.5 + f.ph) * 0.07 * (x / f.w)); } pa.needsUpdate = true; f.geo.computeVertexNormals(); }

    // ----- I -----
    if (act === 1) {
      for (const w of hookWaves) w.position.x = w.userData.x0 + Math.sin(t * 1.1 + w.userData.seed * 1.7) * 0.25;
      const hop = t > tBabi1 - 0.1 ? Math.abs(Math.sin(clamp01((t - tBabi1 + 0.1) / 0.5) * Math.PI)) * 0.6 * Math.exp(-(t - tBabi1) * 0.8) : 0;
      hookPig.G.position.y = 0.62 + hop + Math.abs(Math.sin(t * 3.1)) * 0.03;
      hookPig.head.rotation.x = Math.sin(t * 3.1) * 0.08 - (t > tPem ? 0.12 * ramp(t, tPem, tPem + 0.4) : 0);
      hookPig.G.rotation.y = Math.sin(t * 0.8) * 0.15;
      hookPig.ears.forEach((e, i) => { e.rotation.x = -0.5 + Math.sin(t * 6 + i) * 0.08; });
      life(usHero, t); usHero.arms[0].sh.rotation.z = -0.14 - 0.08 * Math.sin(t * 2);
      hookShip.G.position.y = Math.sin(t * 1.3) * 0.06; hookShip.G.rotation.z = Math.sin(t * 1.1) * 0.03;
    }
    // ----- II -----
    if (act === 2) {
      lat49.im.count = Math.floor(lat49.n * ramp(t, tMen - 0.1, tMen + 1.2));
      haroL.im.count = Math.floor(haroL.n * ramp(t, tDua - 0.2, tDua + 1.1));
      rosL.im.count = Math.floor(rosL.n * ramp(t, tSel2 - 0.1, tSel2 + 1.2));
      const qk = pop(qMark, t, tTeng, 0.4); if (t > tDua) { qMark.visible = false; }
      qMark.rotation.y = Math.sin(t * 2) * 0.15; if (qk) qMark.scale.setScalar(Math.max(1e-4, qk));
      claimPins.forEach((p, i) => pop(p, t, tKlaim - 0.1 + i * 0.12, 0.35));
    }
    // ----- III / IV -----
    if (act === 3) {
      life(cutlar, t, 1.4); life(griffin, t, 1.4);
      const shot = t >= tShot;
      const rec = shot ? Math.exp(-(t - tShot) * 9) : 0;
      let a0x = -1.0, a0e = -0.6, a1x = -1.15 + rec * 0.35;
      cRifle.rotation.x = 1.05 + rec * 0.3; cRifle.visible = true;
      if (t >= T4) { const off = ramp(t, tTawar, tTawar + 0.5); a1x = -1.15 + off * 0.95; a0x = -1.0 + off * 0.2; cRifle.visible = off < 0.5; if (t > tSep) { a0x = -1.3; a0e = -0.3; } }
      if (t >= tBesar) a1x = -2.4 + Math.sin(t * 8) * 0.25;
      cutlar.arms[0].sh.rotation.x = a0x; cutlar.arms[0].el.rotation.x = a0e; cutlar.arms[1].sh.rotation.x = a1x; cutlar.arms[1].el.rotation.x = -0.25;
      // pig: roots in the bed, then tips over at the shot
      const pg = gardenPig;
      pg.G.position.set(0.5 - Math.min(t - T3, 2.5) * 0.06, 0.32, 0.2); pg.G.rotation.y = -0.55;
      const ko = shot ? eout(clamp01((t - tShot - 0.05) / 0.32)) : 0;
      pg.G.rotation.z = ko * Math.PI / 2 * 0.98; pg.G.position.y = 0.32 + ko * 0.3 + (shot ? Math.max(0, Math.sin((t - tShot) * 10) * 0.25 * Math.exp(-(t - tShot) * 4)) : 0);
      pg.head.rotation.x = shot ? 0 : 0.25 + Math.sin(t * 5) * 0.18;
      pg.eyes.forEach((e) => { e.visible = !shot; }); pg.xe.visible = shot;
      pigBlob.position.x = 0.5 + ko * 0.5;
      // puff and stars
      const pu = clamp01((t - tShot) / 1.2); puff.visible = t >= tShot && pu < 1;
      puff.position.set(-1.5, 2.0, 1.8);
      puffs.forEach((m, i) => { const a = i / 6 * Math.PI * 2; m.position.set(Math.cos(a) * 0.4 * eout(pu) + pu * 0.6, Math.sin(a) * 0.3 * eout(pu) + pu * 0.4, 0); m.scale.setScalar(0.4 + eout(pu) * 1.1); m.material.opacity = 0.9 * (1 - pu); });
      stars.forEach((s, i) => { const a = (t - tShot) * 2.4 + i * 2.09; const k = shot ? ramp(t, tShot + 0.2, tShot + 0.5) * (1 - ramp(t, T4 - 0.4, T4)) : 0; s.visible = k > 0.01; s.position.set(0.9 + Math.cos(a) * 0.55, 1.75 + Math.sin(a * 2) * 0.08, 0.4 + Math.sin(a) * 0.35); s.rotation.set(0, a, 0); s.scale.setScalar(Math.max(1e-4, k)); });
      // Griffin walks in from the right
      const wk = clamp01((t - tPemi + 0.2) / 1.6), gx = 8.5 - 5.5 * eout(wk);
      griffin.G.position.set(t < tPemi - 0.2 ? 30 : gx, 0.32, 0.9); griffin.G.rotation.y = -0.55;
      if (wk > 0 && wk < 1) walk(griffin, (t - tPemi) * 9, 1 - wk * 0.6); else walk(griffin, 0, 0);
      gBlob.position.x = griffin.G.position.x;
      griffin.arms.forEach((a, i) => { const s2 = i ? 1 : -1; a.sh.rotation.z = s2 * 0.14; a.el.rotation.x = -0.32; if (wk >= 1) { a.sh.rotation.x = 0; a.sh.rotation.z = s2 * 0.75; a.el.rotation.x = -1.5; } });
      pop(tagCut, t, tLyman, 0.45); pop(tagGri, t, tCharles, 0.45);
      if (t >= T4) { tagCut.visible = tagGri.visible = false; }
      // scale drops in, coins, beam
      const dk = ramp(t, tTawar - 0.4, tTawar + 0.6);
      scaleG.visible = t > tTawar - 0.4; scaleG.position.y = (1 - dk) * 9 + (dk < 1 ? 0 : Math.sin(clamp01((t - tTawar - 0.6) / 0.5) * Math.PI) * 0.06);
      const L = t >= tSep ? 2 : 0, R = t >= tSer ? 20 : 0;
      const ang = R > 0 ? -0.3 : L > 0 ? 0.16 : 0;
      const tgtA = R > 0 ? ang * back(clamp01((t - tSer) / 0.6), 2.4) + 0.16 * (1 - clamp01((t - tSer) / 0.6)) : L > 0 ? ang * back(clamp01((t - tSep) / 0.5), 2.4) : 0;
      const a = tgtA + Math.sin(t * 3) * 0.008;
      beam.rotation.z = a;
      pans.forEach((P, i) => { const s = i ? 1 : -1; P.position.set(s * 1.6 * Math.cos(a), 2.6 + s * 1.6 * Math.sin(a) - 1.2, 0); });
      coinL.forEach((m, i) => pop(m, t, tSep + i * 0.12, 0.25));
      coinR.forEach((m, i) => pop(m, t, tSer + i * 0.035, 0.22));
      pop(t10, t, tSep + 0.1, 0.4); pop(t100, t, tSer + 0.1, 0.4);
      t10.position.set(pans[0].position.x, pans[0].position.y, 0.62); t100.position.set(pans[1].position.x, pans[1].position.y, 0.62);
      ropes.forEach((m) => { m.visible = dk < 0.999 || t < tTawar + 1.5; });
      bangs.forEach((b, i) => { const k = pop(b, t, tBesar - 0.1 + i * 0.15, 0.35, 1 + 0.12 * Math.sin(t * 14)); b.rotation.z = Math.sin(t * 9 + i) * 0.12; });
      if (t >= tBesar) griffin.arms.forEach((a, i) => { a.sh.rotation.x = -2.6 + Math.sin(t * 9 + i * 3) * 0.25; a.sh.rotation.z = (i ? 1 : -1) * 0.3; a.el.rotation.x = -0.3; });
      cutlar.G.rotation.y = t >= T4 ? 0.35 : 0.55;
      sheep.forEach((h, i) => { h.rotation.x = Math.max(0, Math.sin(t * 1.5 + i * 2)) * 0.5; });
    }
    // ----- V / VI -----
    if (act === 5) {
      seaWaves.forEach((w) => { w.position.x = Math.sin(t * 0.9 + w.userData.seed * 1.9) * 0.35; w.position.y = Math.sin(t * 1.3 + w.userData.seed) * 0.04; });
      const pk = pop(pickett.G, t, tKapten - 0.1, 0.5, 0.95); pickett.G.position.set(0, 0.3, 2.45); pickett.G.rotation.y = -0.1; life(pickett, t);
      pickett.arms[0].sh.rotation.x = t > tEnam ? -1.6 - Math.sin(clamp01((t - tEnam) / 0.4) * Math.PI) * 0.3 : -0.2;
      pBlob.visible = pk > 0.01;
      pop(tagPick, t, A("s5:Pickett"), 0.45); if (t >= tLaks) tagPick.visible = false;
      for (let i = 0; i < CROWD; i++) {
        const [x, z, ry] = crowdPos[i];
        const a = i < 7 ? tEnam + i * 0.12 : t461 + 0.15 + (i - 7) * 0.035;
        const k = t < a ? 0 : back(clamp01((t - a) / 0.35), 2);
        crowd.set(i, x, 0.3 + Math.abs(Math.sin(t * 2.4 + i)) * 0.015, z, ry - 0.15, k * 0.55);
      }
      crowd.commit();
      pop(note10, t, tEnam + 0.4, 0.4);
      cannons.forEach((c, i) => { const k = pop(c, t, tEmpat + i * 0.06, 0.3); c.position.y = 0.3; });
      ships.forEach((S, i) => {
        const [x, z, ry] = SHIPPOS[i]; const a = i < 3 ? tKapal - 0.3 + i * 0.35 : tLima - 0.1 + (i - 3) * 0.3;
        const k = eout(clamp01((t - a) / 1.3)); S.G.visible = t > a;
        S.G.position.set(x + (1 - k) * 14, -0.15 + Math.sin(t * 1.4 + i) * 0.06, z); S.G.rotation.set(0, ry, Math.sin(t * 1.1 + i * 2) * 0.03);
        S.guns.forEach((gn, j) => { const o = t < tTujuh ? 0 : eout(clamp01((t - tTujuh - i * 0.08 - j * 0.03) / 0.3)); gn.position.z = 0.42 + o * 0.25; });
      });
      // fuses burn from 2.140 onward, go out at "menolak"
      const lit = t > t2140 - 0.2 && t < tTolak;
      fuses.forEach((f, i) => { f.visible = lit && cannons[i].visible; f.scale.setScalar(0.8 + 0.5 * Math.abs(Math.sin(t * 23 + i * 1.7))); });
      smokes.forEach((s, i) => { const u = clamp01((t - tTolak - i * 0.04) / 1.4); s.visible = t > tTolak && u < 1; s.position.y = 0.75 + u * 1.2; s.scale.setScalar(0.5 + u * 1.6); });
      smokeM.opacity = 0.75;
      // rowboat with Baynes
      const bk = eout(clamp01((t - tLaks + 0.3) / 1.6));
      boat.visible = t > tLaks - 0.3; boat.position.set(2.1 + (1 - bk) * 10, 0.05 + Math.sin(t * 1.6) * 0.05, -0.65); boat.rotation.z = Math.sin(t * 1.2) * 0.03;
      life(baynes, t, 1.4);
      const st = ramp(t, tTolak - 0.15, tTolak + 0.3);
      baynes.arms[1].sh.rotation.x = -0.1 - st * 2.7; baynes.arms[1].sh.rotation.z = 0.14 + st * 0.2; baynes.arms[1].el.rotation.x = -0.3 + st * 0.15;
      baynes.arms[0].sh.rotation.x = -0.2; baynes.arms[0].el.rotation.x = -1.2;
      pop(tagBay, t, tBay - 0.2, 0.45);
      const bb = pop(bubble, t, tBabi6 - 0.35, 0.45); bubble.position.y = 4.1 + Math.sin(t * 2) * 0.05;
    }
    // ----- VII -----
    if (act === 7) {
      campMen.forEach((P, i) => { life(P, t); walk(P, 0, 0); P.G.position.set(P.home[0], moundY(P.home[0], P.home[1]), P.home[1]); P.G.rotation.y = P.home[2]; P.arms.forEach((a) => { a.el.rotation.x = -0.32; }); });
      // one redcoat and one bluecoat meet in the middle at "bersama"
      for (const [i, tx, tz, ry] of [[1, -0.55, -0.15, 0.7], [4, 0.45, 0.25, -2.3]]) {
        const P = campMen[i]; const u = clamp01((t - tBersama + 0.3) / 1.4), e = eout(u);
        P.G.position.x = P.home[0] + (tx - P.home[0]) * e; P.G.position.z = P.home[1] + (tz - P.home[1]) * e; P.G.position.y = moundY(P.G.position.x, P.G.position.z) + (u > 0 && u < 1 ? Math.abs(Math.sin((t - tBersama) * 10)) * 0.03 : 0);
        if (u > 0 && u < 1) { P.G.rotation.y = Math.atan2(tx - P.home[0], tz - P.home[1]); walk(P, (t - tBersama) * 10, 1); }
        else if (u >= 1) { P.G.rotation.y = i === 1 ? 1.15 : -2.0; const hs = Math.sin(t * 9) * 0.12; P.arms[1].sh.rotation.x = -1.1 + hs; P.arms[1].el.rotation.x = -0.2; }
      }
      pop(tagUK, t, tMasing, 0.45); pop(tagUS, t, tMasing + 0.25, 0.45);
      // year counter
      let v = "1859";
      if (t >= tSelama) v = String(Math.min(12, 1 + Math.floor((t - tSelama) / ((t1872 - 0.3 - tSelama) / 11)))) + " THN";
      if (t >= t1872 - 0.15) v = "1872";
      if (v !== calVal) { calVal = v; paintCal(v.endsWith("THN") ? v.replace(" THN", "") : v); }
      calCard.scale.setScalar(1 + 0.08 * Math.exp(-((t - tSelama) % 0.3) * 12) * (t > tSelama && t < t1872 ? 1 : 0));
      // Kaiser lowered on wires
      const kd = eout(clamp01((t - tKaisar + 0.5) / 1.4));
      podium.visible = t > tKaisar - 0.5; podium.position.y = (1 - kd) * 10;
      wires.forEach((w) => { w.position.y = 2.2 + 7; w.visible = kd < 1 || t < tKaisar + 1.6; });
      life(kaiser, t); kaiser.G.position.y = 0.9;
      const gv = t >= tMenang - 0.25 ? Math.sin(clamp01((t - tMenang + 0.25) / 0.35) * Math.PI) : 0;
      kaiser.arms[1].sh.rotation.x = -0.6 - 1.4 * gv - (t > tMenang ? 0.6 : 0.3); kaiser.arms[1].el.rotation.x = -0.6;
      pop(tagKai, t, tKaisar + 0.4, 0.45);
      // British camp folds, the Union Jack lowers, the US flag rises on the hilltop
      const win = ramp(t, tMenang + 0.1, tMenang + 0.9);
      tents.uk.forEach((G, i) => { G.scale.y = Math.max(0.12, 1 - win * 0.88); });
      ukPole.children[2].position.y = 3.6 - 0.34 - win * 2.4;
      winPole.visible = t > tMenang - 0.1; winPole.position.y = 1.0 - (1 - eout(clamp01((t - tMenang) / 0.9))) * 3.2;
      for (let i = 0; i < CF; i++) {
        const [x, y0, z, ph, sp] = confR[i]; const u = t - tMenang - 0.2;
        const M4 = new THREE.Matrix4();
        if (u < 0) M4.makeScale(0, 0, 0); else M4.compose(new V3(x + Math.sin(u * 2 + ph) * 0.3, 9 + y0 - u * 2.4 * sp, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(u * 3 + ph, u * 2, ph)), new V3(1, 1, 1));
        conf.setMatrixAt(i, M4);
      }
      conf.instanceMatrix.needsUpdate = true;
    }
    // ----- VIII -----
    if (act === 8) {
      statue.G.rotation.y = -0.35 + Math.sin(t * 0.4) * 0.05;
    }
    comp.render();
  };
}
