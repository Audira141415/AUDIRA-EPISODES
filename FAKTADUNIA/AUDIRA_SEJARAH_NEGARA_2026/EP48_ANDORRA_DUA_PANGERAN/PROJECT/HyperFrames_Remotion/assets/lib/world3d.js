// EP48 CLAYWORLD: Andorra, two co-princes. One plasticine diorama on a studio table: a Pyrenees valley slab (clay
// heightfield with snow caps, rock and patchwork fields), a blue clay river, a tan road from the Spanish side, a tiny
// stone town with slate roofs, a romanesque bell tower and the Casa de la Vall. Every beat is a corner of this set:
//   PLAZA  (0,0)    two thrones with two crowns on a red dais          s1 hook, s3 the two co-princes, s8 finale
//   SCROLL (-11,0)  the 1278 pareage scroll, bishop vs Count Foix, then the crown hops Foix > king > president (s4)
//   BALLOT (+10,0)  ballot box, villagers vote, the 1993 constitution signed by the two princes (s5)
//   BORIS  (-7,9)   "Boris I" on a crate with an oversized crown, a calendar 12 > 20 JULI 1934, a tiny police figure (s6)
//   BANK   (+8,9)   a vault labelled SURGA PAJAK, the president's "ATAU SAYA MUNDUR!", the sign flips to REFORMASI (s7)
// s2 and s8 are high crane shots over the whole valley: France flag on the north ridge, Spain on the south lip,
// a wooden AUDIRA sign at the valley entrance. Characters and props move on a 15 fps stop-motion clock; the camera
// glides. Figures are generic clay people (dot eyes, simple smile), never likenesses. Everything is a pure function of t.

const FONTS = ['700 80px "Fredoka"', '500 80px "Fredoka"', '700 80px "IBM Plex Mono"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "AUDIRA SURGA PAJAK 1278 1934"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* system fallback */ }
}

import * as THREE from "./three.module.js";
import { mulberry, clamp01, smooth, back, eout, canvasTex, stage } from "./lib3d.js";
import { RoomEnvironment } from "./RoomEnvironment.js";

const V3 = THREE.Vector3;
const HEAD = '"Fredoka", "Arial Rounded MT Bold", Arial, sans-serif', MONO = '"IBM Plex Mono", Consolas, monospace';
const INK = "#2A1E16", CREAM = "#FFF4E2";
const AB = "#10069F", AY = "#FEDF00", AR = "#D50032", FB = "#0055A4", FR = "#EF4135", PUR = "#6B2C91";

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
const win = (t, a, b, fi = 0.35, fo = 0.35) => Math.min(clamp01((t - a) / fi), 1 - clamp01((t - b) / fo));

// rounded box with exact normals (RoundedBoxGeometry construction)
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
// smooth seeded 3D noise from a few random plane waves
function noiseFn(seed, n = 7) {
  const q = mulberry(seed), W = [];
  for (let i = 0; i < n; i++) { const d = new V3(q() - 0.5, q() - 0.5, q() - 0.5).normalize().multiplyScalar(0.6 + q() * 1.8); W.push([d, q() * 6.283, 0.5 + q() * 0.5]); }
  const tot = W.reduce((s, w) => s + w[2], 0);
  return (x, y, z) => { let s = 0; for (const [d, p, a] of W) s += Math.sin(d.x * x + d.y * y + d.z * z + p) * a; return s / tot; };
}
// hand-rolled look: push vertices out along their direction from the centre by smooth noise
function lumpy(geo, amp, seed, f = 3) {
  const g = geo.clone(), pa = g.attributes.position, nz = noiseFn(seed), p = new V3(), c = new V3();
  g.computeBoundingBox(); g.boundingBox.getCenter(c);
  for (let i = 0; i < pa.count; i++) {
    p.fromBufferAttribute(pa, i);
    const d = p.clone().sub(c); const L = d.length() || 1;
    p.addScaledVector(d, (nz(p.x * f, p.y * f, p.z * f) * amp) / L);
    pa.setXYZ(i, p.x, p.y, p.z);
  }
  g.computeVertexNormals();
  return g;
}

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x9cc3db, exp: 1.0, bloom: [0.1, 0.4, 0.92], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  cam.near = 0.2; cam.far = 600; cam.updateProjectionMatrix();
  scene.background = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#7FAFD0"); gr.addColorStop(0.45, "#B5D3E2"); gr.addColorStop(0.8, "#EAD9C0"); gr.addColorStop(1, "#E2C9A6"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.fog = new THREE.Fog(0xd8d2c2, 70, 190);

  // ---------- lights: warm softbox key, peach bounce, cool rim ----------
  const hemi = new THREE.HemisphereLight(0xfff0dc, 0x6b4a33, 0.75); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe2bd, 2.5);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.025; key.shadow.radius = 4;
  scene.add(key, key.target);
  const bounce = new THREE.DirectionalLight(0xffb59a, 0.45); scene.add(bounce, bounce.target);
  const rim = new THREE.DirectionalLight(0xd2e2ff, 0.8); scene.add(rim, rim.target);
  const vaultGlow = new THREE.PointLight(0xffc35a, 0, 6, 1.6); scene.add(vaultGlow);

  // ---------- textures ----------
  const thumbT = canvasTex(512, 512, (g, w, h) => {
    const q = mulberry(48); g.fillStyle = "rgb(128,128,128)"; g.fillRect(0, 0, w, h);
    const im = g.getImageData(0, 0, w, h);
    for (let i = 0; i < w * h; i++) { const v = (q() - 0.5) * 46; im.data[i * 4] += v; im.data[i * 4 + 1] += v; im.data[i * 4 + 2] += v; }
    g.putImageData(im, 0, 0);
    for (let k = 0; k < 9; k++) { // fingerprints: concentric ellipse arcs
      const cx = q() * w, cy = q() * h, rot = q() * 3.14, a0 = q() * 6.28;
      g.save(); g.translate(cx, cy); g.rotate(rot);
      for (let rr = 6; rr < 70; rr += 4.2) { g.strokeStyle = `rgba(${q() < 0.5 ? 90 : 170},${q() < 0.5 ? 90 : 170},${q() < 0.5 ? 90 : 170},.55)`; g.lineWidth = 2.2; g.beginPath(); g.ellipse(0, 0, rr * 1.35, rr, 0, a0, a0 + 2.2 + q() * 2.4); g.stroke(); }
      g.restore();
    }
    for (let k = 0; k < 70; k++) { const x = q() * w, y = q() * h, a = q() * 3.14, L = 20 + q() * 50; g.strokeStyle = `rgba(${q() < 0.5 ? 70 : 190},${q() < 0.5 ? 70 : 190},${q() < 0.5 ? 70 : 190},.4)`; g.lineWidth = 2 + q() * 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L * 0.5 + 6, y + Math.sin(a) * L * 0.5 - 6, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
    for (let k = 0; k < 40; k++) { const x = q() * w, y = q() * h, rr = 4 + q() * 16; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(70,70,70,.35)"); gr.addColorStop(1, "rgba(128,128,128,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  }, [1, 1]);
  thumbT.colorSpace = THREE.NoColorSpace;
  const groundBump = thumbT.clone(); groundBump.repeat.set(9, 9); groundBump.wrapS = groundBump.wrapT = THREE.RepeatWrapping; groundBump.needsUpdate = true;
  thumbT.wrapS = thumbT.wrapT = THREE.RepeatWrapping; thumbT.repeat.set(2.5, 2.5);
  const stoneT = canvasTex(256, 256, (g, w, h) => {
    const q = mulberry(7); g.fillStyle = "#6E6258"; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 30) for (let x = -20 + ((y / 30) % 2) * 22; x < w; x += 44) { const c = 150 + q() * 50; g.fillStyle = `rgb(${c + 12},${c},${c - 14})`; g.beginPath(); g.roundRect(x + 3 + q() * 3, y + 3 + q() * 2, 36 + q() * 4, 24 + q() * 2, 9); g.fill(); }
  }, [1, 1]);
  stoneT.wrapS = stoneT.wrapT = THREE.RepeatWrapping;
  const plankT = canvasTex(512, 256, (g, w, h) => {
    const q = mulberry(5); const cols = ["#A86E3C", "#B67A44", "#9C6436", "#B07444"];
    for (let i = 0; i < 4; i++) { g.fillStyle = cols[i]; g.fillRect(0, i * 64, w, 64); for (let k = 0; k < 26; k++) { g.strokeStyle = "rgba(70,35,10,.2)"; g.lineWidth = 1 + q() * 2; g.beginPath(); const y = i * 64 + q() * 64; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + q() * 8 - 4, w * 0.6, y + q() * 8 - 4, w, y); g.stroke(); } g.fillStyle = "rgba(40,20,5,.5)"; g.fillRect(0, i * 64, w, 3); }
  }, [1, 1]);
  plankT.wrapS = plankT.wrapT = THREE.RepeatWrapping;
  const blobT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(40,20,10,.62)"); gr.addColorStop(0.55, "rgba(40,20,10,.28)"); gr.addColorStop(1, "rgba(40,20,10,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });

  // ---------- materials ----------
  const mc = {};
  const once = (k, f) => mc[k] || (mc[k] = f());
  const SHEEN = new THREE.Color("#ffe4d2");
  const clay = (c, ro = 0.68, bump = 4) => once("c" + c + ro + bump, () => new THREE.MeshPhysicalMaterial({ color: c, roughness: ro, metalness: 0, sheen: 0.22, sheenColor: SHEEN, sheenRoughness: 0.55, bumpMap: thumbT, bumpScale: bump }));
  const clayMap = (key, map, ro = 0.64) => once("m" + key, () => new THREE.MeshPhysicalMaterial({ color: 0xffffff, map, roughness: ro, sheen: 0.2, sheenColor: SHEEN, sheenRoughness: 0.55, bumpMap: thumbT, bumpScale: 2.4 }));
  const goldEnv = pm.fromScene(new RoomEnvironment(), 0.02).texture;
  const gold = new THREE.MeshPhysicalMaterial({ color: "#E8B53E", roughness: 0.3, metalness: 0.6, clearcoat: 0.5, clearcoatRoughness: 0.25, envMap: goldEnv, envMapIntensity: 1.1, bumpMap: thumbT, bumpScale: 1.5 });
  const steel = new THREE.MeshPhysicalMaterial({ color: "#8F98A3", roughness: 0.38, metalness: 0.45, clearcoat: 0.4, envMap: goldEnv, envMapIntensity: 0.9, bumpMap: thumbT, bumpScale: 2 });
  const bead = new THREE.MeshPhysicalMaterial({ color: "#121014", roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.4 });
  const glint = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const wood = (c = "#B07444") => once("w" + c, () => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.66, map: plankT, sheen: 0.15, sheenColor: SHEEN, bumpMap: thumbT, bumpScale: 1.5 }));
  const stone = (c = "#ffffff") => once("s" + c, () => new THREE.MeshPhysicalMaterial({ color: c, map: stoneT, bumpMap: stoneT, bumpScale: 4, roughness: 0.72, sheen: 0.18, sheenColor: SHEEN }));
  const water = new THREE.MeshPhysicalMaterial({ color: "#3C8ED6", roughness: 0.18, clearcoat: 0.8, clearcoatRoughness: 0.1, bumpMap: thumbT, bumpScale: 1.6 });
  const mk = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const grp = (x = 0, y = 0, z = 0, p = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
  const blobM = new THREE.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false });
  const blob = (p, x, z, sx, sz, y = 0.02) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), blobM); m.rotation.x = -Math.PI / 2; m.scale.set(sx, sz, 1); m.position.set(x, y, z); m.renderOrder = 2; p.add(m); return m; };
  const SPH = (rr, s = 24) => once("sph" + rr + s, () => new THREE.SphereGeometry(rr, s, Math.round(s * 0.75)));
  const CYL = (a, b, h, s = 24) => once("cyl" + [a, b, h, s], () => new THREE.CylinderGeometry(a, b, h, s));
  const LUMP = (geo, amp, seed, f) => lumpy(geo, amp, seed, f);

  // ---------- painted labels ----------
  const rr = (g, x, y, w, h, rad) => { g.beginPath(); g.roundRect(x, y, w, h, rad); };
  function fitText(g, txt, font, size, maxW) { g.font = font(size); while (g.measureText(txt).width > maxW && size > 8) { size -= 2; g.font = font(size); } return size; }
  const fH = (s) => `700 ${s}px ${HEAD}`, fM = (s) => `700 ${s}px ${MONO}`;
  function claytext(g, txt, x, y, font, size, fill, maxW, stroke = INK) {
    fitText(g, txt, font, size, maxW);
    g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
    g.lineWidth = size * 0.16; g.strokeStyle = stroke; g.strokeText(txt, x, y + size * 0.06);
    g.fillStyle = fill; g.fillText(txt, x, y);
  }
  // wooden sign board with painted letters; returns a group (board + posts)
  function woodSign(x, z, w, h, lines, { ry = 0, post = 1.2, y0 = null, board = "#B07444", plank = true } = {}) {
    const G = grp(x, y0 ?? H(x, z), z); G.rotation.y = ry;
    mk(LUMP(rb(w, h, 0.22, 0.08), 0.03, x * 3 + z), wood(board), 0, post + h / 2, 0, G);
    for (const s of [-1, 1]) mk(LUMP(rb(0.18, post + 0.25, 0.18, 0.06), 0.02, s + x), wood("#8A5A30"), s * (w / 2 - 0.35), (post + 0.25) / 2 - 0.05, -0.05, G);
    const pw = 1024, ph = Math.round(pw * h / w);
    const tx = canvasTex(pw, ph, (g, W, Hh) => {
      g.clearRect(0, 0, W, Hh);
      const tot = lines.reduce((s, l) => s + l[1], 0);
      let y = (Hh - tot * Hh) / 2;
      for (const [txt, k, col, font] of lines) { claytext(g, txt, W / 2, y + (k * Hh) / 2, font || fH, k * Hh * 0.78, col || CREAM, W * 0.86); y += k * Hh; }
    });
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.96, h * 0.92), new THREE.MeshStandardMaterial({ map: tx, transparent: true, roughness: 0.7, alphaTest: 0.04 }));
    pl.position.set(0, post + h / 2, 0.125); G.add(pl);
    return G;
  }
  // camera-facing bubble / tag
  function bubble(w, h, paint, tail = true) {
    const pw = 768, ph = Math.round(pw * h / w);
    const tx = canvasTex(pw, ph, (g, W, Hh) => {
      g.clearRect(0, 0, W, Hh);
      const bh = tail ? Hh * 0.8 : Hh * 0.96;
      g.fillStyle = "rgba(40,25,10,.28)"; rr(g, 10, 16, W - 20, bh - 14, bh * 0.36); g.fill();
      g.fillStyle = CREAM; g.strokeStyle = INK; g.lineWidth = Hh * 0.035;
      rr(g, 8, 6, W - 22, bh - 14, bh * 0.36); g.fill(); g.stroke();
      if (tail) { g.beginPath(); g.moveTo(W * 0.24, bh - 10); g.lineTo(W * 0.16, Hh - 6); g.lineTo(W * 0.38, bh - 10); g.closePath(); g.fill(); g.stroke(); g.fillRect(W * 0.235, bh - 26, W * 0.16, 22); }
      paint(g, W, bh);
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, toneMapped: false }));
    m.renderOrder = 9; m.visible = false; scene.add(m); return m;
  }
  const tmpV = new V3(), tmpQ = new THREE.Quaternion();
  function bill(m, k, scale = 1) { m.visible = k > 0.002; if (!m.visible) return; m.material.opacity = Math.min(1, k * 1.5); m.quaternion.copy(cam.quaternion); const s = scale * Math.max(0.001, back(k, 2)); m.scale.set(s * (1 + 0.15 * (1 - k)), s, 1); }
  // stop-motion squash pop: stretch tall then settle, volume preserving
  function squash(o, u, base = 1) {
    if (u <= 0) { o.visible = false; return 0; }
    o.visible = true; const y = back(clamp01(u), 2.4); const sx = Math.min(1.35, 1 / Math.sqrt(Math.max(0.55, y)));
    o.scale.set(base * sx, base * Math.max(0.001, y), base * sx); return y;
  }

  // ======================================================================================
  // TABLE + VALLEY SLAB
  // ======================================================================================
  const tbl = mk(new THREE.PlaneGeometry(420, 420), new THREE.MeshStandardMaterial({ color: "#C89B6C", map: (() => { const t2 = plankT.clone(); t2.repeat.set(14, 28); t2.needsUpdate = true; return t2; })(), roughness: 0.7 }), 0, -2.4, 0);
  tbl.rotation.x = -Math.PI / 2; tbl.castShadow = false;

  const PQ = mulberry(1278), PEAKS = [];
  for (let i = 0; i < 12; i++) PEAKS.push({ x: -27 + i * 4.9 + (PQ() - 0.5) * 2.5, z: -15 - PQ() * 10, h: 5 + PQ() * 6, s: 2.6 + PQ() * 2.2 });
  for (let i = 0; i < 10; i++) { const s = i % 2 ? 1 : -1; PEAKS.push({ x: s * (20 + PQ() * 6), z: -12 + Math.floor(i / 2) * 7 + PQ() * 3, h: 3 + PQ() * 4, s: 2.4 + PQ() * 2 }); }
  const nzG = noiseFn(93);
  const R0 = 30;
  function H(x, z) {
    const rd = Math.hypot(x, z * 0.96);
    if (rd > R0 + 1.2) return -2.3;
    const vx = x / 19, vz = (z - 6) / 15.5, vd = vx * vx + vz * vz;
    const flat = Math.exp(-Math.pow(vd, 2.2));
    let m = smooth((-z - 8) / 11) * 14 + smooth((Math.abs(x) - 17) / 9) * 8 + smooth((z - 20) / 6) * 3.2 * (1 - Math.exp(-((x - 3) ** 2) / 10));
    for (const p of PEAKS) m += p.h * Math.exp(-((x - p.x) ** 2 + (z - p.z) ** 2) / (2 * p.s * p.s));
    m += 0.9 * nzG(x * 0.3, 0, z * 0.3) * smooth(m / 3);
    const h = m * (1 - flat) + 0.1 * nzG(x * 0.9, 1, z * 0.9);
    const e = smooth((rd - (R0 - 1.4)) / 1.6);
    return h * (1 - e) - 2.3 * e;
  }
  {
    const N = 230, geo = new THREE.PlaneGeometry(64, 64, N, N); geo.rotateX(-Math.PI / 2);
    const pa = geo.attributes.position, col = new Float32Array(pa.count * 3), c = new THREE.Color(), tc = new THREE.Color();
    const G1 = ["#6FA35A", "#7DB065", "#5E9450", "#8DB86A", "#79A85C"].map((h) => new THREE.Color(h));
    const ROCK = new THREE.Color("#8C7B6B"), SNOW = new THREE.Color("#F3F1EC"), SIDE = new THREE.Color("#7B5A3E"), PINEG = new THREE.Color("#4C7F44");
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i), z = pa.getZ(i), h = H(x, z);
      pa.setY(i, h);
      const hx = H(x + 0.25, z) - h, hz = H(x, z + 0.25) - h, slope = Math.hypot(hx, hz) / 0.25;
      const cell = (Math.floor(x / 3.2 + 100) * 7 + Math.floor((z + 0.7 * Math.sin(x * 0.4)) / 2.6 + 100) * 13) % 5;
      c.copy(G1[cell]);
      if (h > 0.9) c.lerp(PINEG, clamp01((h - 0.9) / 3));
      c.lerp(ROCK, clamp01((slope - 0.75) * 1.4) * clamp01(h / 2));
      c.lerp(SNOW, smooth((h + 1.4 * nzG(x * 0.6, 2, z * 0.6) - 11.2) / 1.6));
      if (h < -0.25) c.copy(SIDE).multiplyScalar(0.85 + 0.15 * clamp01(h + 2.3));
      tc.copy(c); col[i * 3] = tc.r; col[i * 3 + 1] = tc.g; col[i * 3 + 2] = tc.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
    const gm = new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.7, sheen: 0.2, sheenColor: SHEEN, sheenRoughness: 0.6, bumpMap: groundBump, bumpScale: 3 });
    const ground = mk(geo, gm); ground.castShadow = true;
  }
  // ribbon (river, road) following the ground
  function ribbon(pts, width, mat, lift = 0.06, seed = 1) {
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new V3(x, 0, z)));
    const n = 200, pos = [], idx = [], uv = [];
    const nz = noiseFn(seed);
    for (let i = 0; i <= n; i++) {
      const u = i / n, p = curve.getPoint(u), tg = curve.getTangent(u); const nx = -tg.z, nzz = tg.x;
      const w = width * (1 + 0.15 * nz(u * 20, 0, 0));
      for (const s of [-1, 1]) { const x = p.x + nx * s * w / 2, z = p.z + nzz * s * w / 2; pos.push(x, H(x, z) + lift + (s ? 0 : 0), z); uv.push((s + 1) / 2, u * 12); }
      if (i < n) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = mk(g, mat); m.castShadow = false; return { m, curve };
  }
  ribbon([[-24, -6.4], [-17, -6.8], [-9, -7.6], [0, -7.0], [9, -6.9], [14.5, -4], [16.8, 4], [16.4, 14], [14.2, 24], [12, 31]], 1.4, water, 0.08, 3);
  const road = ribbon([[3.4, 31], [3.4, 24], [3.6, 18], [2.4, 12], [0.4, 6], [0, 2.4]], 1.5, clay("#D9B98A", 0.75), 0.05, 9);

  // ---------- town ----------
  const ROOF = ["#55515C", "#4A4652", "#5E5867", "#8F4A34"], WALL = ["#ffffff", "#F2E8DA", "#E6DCCB", "#FFF4E6"];
  function house(x, z, w, d, h, ry, k = 0) {
    const G = grp(x, H(x, z), z); G.rotation.y = ry;
    mk(LUMP(rb(w, h, d, 0.16), 0.05, k * 11 + 3, 1.6), stone(WALL[k % 4]), 0, h / 2, 0, G);
    const sh = new THREE.Shape(); sh.moveTo(-w / 2 - 0.25, 0); sh.lineTo(w / 2 + 0.25, 0); sh.lineTo(0, h * 0.42 + 0.4); sh.closePath();
    const rg = new THREE.ExtrudeGeometry(sh, { depth: d + 0.4, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3 }); rg.translate(0, 0, -(d + 0.4) / 2);
    mk(LUMP(rg, 0.04, k * 7 + 1, 1.5), clay(ROOF[k % 4], 0.6), 0, h - 0.02, 0, G);
    const win = clay("#2E2A33", 0.4);
    const nwin = Math.max(1, Math.round(w / 1.1));
    for (let i = 0; i < nwin; i++) { const wx = -w / 2 + (i + 0.5) * (w / nwin); mk(rb(0.36, 0.48, 0.1, 0.06), win, wx, h * 0.68, d / 2 + 0.01, G); mk(rb(0.46, 0.08, 0.14, 0.03), wood("#7A4A26"), wx, h * 0.68 - 0.3, d / 2 + 0.03, G); }
    mk(rb(0.56, 0.95, 0.1, 0.08), wood("#6E4426"), w * 0.18, 0.47, d / 2 + 0.02, G);
    if (k % 3 === 0) mk(rb(0.34, 0.8, 0.34, 0.06), stone("#D9CFC0"), w * 0.28, h + h * 0.28, -d * 0.15, G);
    blob(G, 0, 0, w * 1.6, d * 1.6);
    return G;
  }
  [[-4.6, -4.6, 2.4, 2.2, 2.6, 0.1], [4.8, -4.9, 2.6, 2.2, 2.9, -0.08], [-7.7, -4.1, 2.2, 2.0, 2.4, 0.2], [7.9, -4.4, 2.4, 2.2, 2.7, -0.15],
    [-10.4, -4.7, 2.6, 2.2, 3.0, 0.05], [11.0, -4.5, 2.4, 2.0, 2.5, 0.12], [-13.4, -3.6, 2.2, 2.0, 2.4, 0.3], [13.9, -3.4, 2.4, 2.0, 2.6, -0.25],
    [-15.2, 8.0, 2.2, 2.0, 2.4, 0.25], [15.6, 9.2, 2.2, 2.0, 2.5, -0.2], [-15.0, 3.2, 2.0, 2.0, 2.2, 0.4], [15.0, 1.0, 2.0, 2.0, 2.3, -0.4],
    [-6.2, -10.6, 2.0, 2.0, 2.2, 0.1], [5.6, -10.8, 2.2, 2.0, 2.3, -0.1], [-1.0, -11.6, 2.0, 1.8, 2.0, 0.0], [11.6, 15.6, 2.0, 2.0, 2.2, -0.3], [-13.4, 16.2, 2.0, 2.0, 2.1, 0.3],
  ].forEach((a, i) => house(...a, i));
  // Boris's house with a balcony
  const borisHouse = house(-10.9, 10.0, 2.8, 2.2, 3.3, 0.18, 2);
  mk(rb(1.8, 0.14, 0.7, 0.05), wood("#7A4A26"), 0.1, 2.0, 1.4, borisHouse);
  for (let i = 0; i < 6; i++) mk(CYL(0.035, 0.035, 0.55, 8), wood("#5C3A1E"), -0.7 + i * 0.32, 2.3, 1.72, borisHouse);
  mk(rb(1.85, 0.08, 0.08, 0.03), wood("#5C3A1E"), 0.1, 2.6, 1.72, borisHouse);
  // romanesque bell tower
  {
    const G = grp(-3.0, H(-3, -6.2), -6.2);
    mk(LUMP(rb(1.5, 6.2, 1.5, 0.14), 0.05, 31, 1.4), stone("#EDE3D3"), 0, 3.1, 0, G);
    for (let lv = 0; lv < 2; lv++) for (const [ax, az] of [[0, 0.76], [0.76, 0], [-0.76, 0]]) { const m = mk(rb(0.42, 0.7, 0.12, 0.2), clay("#2E2A33", 0.4), ax, 4.2 + lv * 1.1, az, G); if (!az) m.rotation.y = Math.PI / 2; }
    mk(new THREE.ConeGeometry(1.25, 1.4, 4), clay("#4A4652", 0.6), 0, 6.9, 0, G).rotation.y = Math.PI / 4;
    mk(SPH(0.22), gold, 0, 5.1, 0.35, G);
    blob(G, 0, 0, 3, 3);
  }
  // Casa de la Vall (parliament) behind the plaza, with the Andorra flag
  const AD_T = canvasTex(360, 240, (g, w, h) => {
    g.fillStyle = AB; g.fillRect(0, 0, w / 3, h); g.fillStyle = AY; g.fillRect(w / 3, 0, w / 3 + 1, h); g.fillStyle = AR; g.fillRect((2 * w) / 3, 0, w / 3, h);
    g.fillStyle = "#E3B23C"; g.strokeStyle = "#9A6E10"; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2 - 34, h / 2 - 40); g.lineTo(w / 2 + 34, h / 2 - 40); g.lineTo(w / 2 + 34, h / 2 + 8); g.quadraticCurveTo(w / 2 + 30, h / 2 + 40, w / 2, h / 2 + 50); g.quadraticCurveTo(w / 2 - 30, h / 2 + 40, w / 2 - 34, h / 2 + 8); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#C8102E"; for (let i = 0; i < 3; i++) g.fillRect(w / 2 - 22 + i * 16, h / 2 - 32, 7, 30);
  });
  const FR_T = canvasTex(360, 240, (g, w, h) => { g.fillStyle = FB; g.fillRect(0, 0, w / 3, h); g.fillStyle = "#fff"; g.fillRect(w / 3, 0, w / 3 + 1, h); g.fillStyle = FR; g.fillRect((2 * w) / 3, 0, w / 3, h); });
  const ES_T = canvasTex(360, 240, (g, w, h) => { g.fillStyle = "#AA151B"; g.fillRect(0, 0, w, h); g.fillStyle = "#F1BF00"; g.fillRect(0, h / 4, w, h / 2); g.fillStyle = "#AA151B"; g.beginPath(); g.roundRect(w * 0.26, h * 0.38, w * 0.08, h * 0.24, 4); g.fill(); });
  const PUR_T = canvasTex(240, 360, (g, w, h) => { g.fillStyle = PUR; g.fillRect(0, 0, w, h); g.fillStyle = "#E3B23C"; g.beginPath(); g.moveTo(w / 2 - 50, h * 0.62); g.lineTo(w / 2 + 50, h * 0.62); g.lineTo(w / 2 + 46, h * 0.45); g.quadraticCurveTo(w / 2 + 26, h * 0.3, w / 2, h * 0.24); g.quadraticCurveTo(w / 2 - 26, h * 0.3, w / 2 - 46, h * 0.45); g.closePath(); g.fill(); g.fillStyle = PUR; g.fillRect(w / 2 - 5, h * 0.32, 10, h * 0.26); g.fillRect(w / 2 - 22, h * 0.4, 44, 10); g.beginPath(); g.moveTo(0, h); g.lineTo(w / 2, h - 50); g.lineTo(w, h); g.fill(); });
  const flags = []; let casaFlag = null;
  function flag(p, x, y, z, w, h, tx, poleH, ry = 0) {
    const G = grp(x, y, z, p); G.rotation.y = ry;
    mk(CYL(0.06, 0.07, poleH, 10), wood("#D9C2A0"), 0, poleH / 2, 0, G); mk(SPH(0.12, 14), gold, 0, poleH + 0.08, 0, G);
    const geo = new THREE.PlaneGeometry(w, h, 16, 6); geo.translate(w / 2, 0, 0);
    const m = mk(geo, new THREE.MeshPhysicalMaterial({ map: tx, roughness: 0.75, side: THREE.DoubleSide, sheen: 0.2, sheenColor: SHEEN, bumpMap: thumbT, bumpScale: 1.5 }), 0.06, poleH - h / 2 - 0.05, 0, G);
    flags.push({ geo, base: Float32Array.from(geo.attributes.position.array), w, ph: x * 1.7 + z });
    return G;
  }
  function banner(p, x, y, z, w, h, tx, poleH) { // hanging vertical banner on a T pole
    const G = grp(x, y, z, p);
    mk(CYL(0.07, 0.08, poleH, 10), wood("#8A5A30"), 0, poleH / 2, 0, G); mk(rb(w + 0.3, 0.1, 0.1, 0.04), wood("#8A5A30"), 0, poleH - 0.1, 0.1, G); mk(SPH(0.13, 14), gold, 0, poleH + 0.08, 0, G);
    const geo = new THREE.PlaneGeometry(w, h, 6, 12); geo.translate(0, -h / 2, 0);
    const m = mk(geo, new THREE.MeshPhysicalMaterial({ map: tx, roughness: 0.75, side: THREE.DoubleSide, sheen: 0.25, sheenColor: SHEEN, bumpMap: thumbT, bumpScale: 1.5 }), 0, poleH - 0.16, 0.16, G);
    return { G, m };
  }
  {
    const G = grp(0, H(0, -4.4), -4.4);
    mk(LUMP(rb(7.2, 3.8, 2.6, 0.18), 0.05, 61, 1.2), stone("#E9DFCD"), 0, 1.9, 0, G);
    mk(LUMP(rb(1.8, 5.6, 1.8, 0.16), 0.05, 62, 1.4), stone("#E4D8C4"), -2.6, 2.8, 0.2, G);
    mk(new THREE.ConeGeometry(1.45, 1.3, 4), clay("#4A4652", 0.6), -2.6, 6.25, 0.2, G).rotation.y = Math.PI / 4;
    const sh = new THREE.Shape(); sh.moveTo(-3.85, 0); sh.lineTo(3.85, 0); sh.lineTo(0, 1.3); sh.closePath();
    const rg = new THREE.ExtrudeGeometry(sh, { depth: 3.0, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3 }); rg.translate(0, 0, -1.5);
    mk(LUMP(rg, 0.04, 63, 1.4), clay("#55515C", 0.6), 0.6, 3.78, 0, G);
    for (let i = 0; i < 4; i++) { mk(rb(0.5, 0.7, 0.1, 0.2), clay("#2E2A33", 0.4), -0.9 + i * 1.2, 2.7, 1.32, G); }
    mk(rb(1.0, 1.5, 0.12, 0.45), wood("#6E4426"), 0.9, 0.75, 1.32, G);
    casaFlag = flag(G, 0.9, 5.0, 0.2, 2.0, 1.33, AD_T, 2.4);
    blob(G, 0, 0, 10, 4.5);
  }
  // spare clay and a sculpting tool on the table, beyond the slab
  mk(LUMP(SPH(1.6, 32), 0.25, 77, 1.2), clay("#E07A5F"), 33.5, -1.2, 10).scale.set(1, 0.7, 1);
  mk(LUMP(SPH(1.2, 32), 0.2, 78, 1.2), clay("#F2C14E"), 31.6, -1.5, 15).scale.set(1, 0.6, 1);
  { const t1 = mk(rb(0.35, 0.18, 7, 0.08), wood("#C08A54"), -32.5, -2.25, 9); t1.rotation.y = 0.5; }

  // ---------- trees (instanced) ----------
  {
    const q = mulberry(4), P = [];
    for (let i = 0; i < 2600 && P.length < 260; i++) {
      const x = (q() - 0.5) * 60, z = (q() - 0.5) * 60, h = H(x, z);
      if (h < 0.9 || h > 9.5 || Math.hypot(x, z) > R0 - 2) continue;
      if (Math.abs(x) < 17 && z > -9 && z < 20) continue;
      if (Math.abs(x) < 12 && z > 17) continue;
      P.push([x, h, z, 0.7 + q() * 0.7]);
    }
    for (let i = 0; i < 1400 && P.length < 300; i++) { // a few round trees on the valley floor edges
      const x = (q() - 0.5) * 36, z = -8 + q() * 30; const h = H(x, z);
      const busy = [[0, 0, 7], [-11, 0, 5], [10.5, 0.5, 5], [-7, 12.4, 5.5], [6.8, 9.5, 5], [3, 15, 3.5], [-4, 22, 3], [-6, 2, 4.5], [12.5, 10, 4.5], [10.5, 6, 3]].some(([cx, cz, rad]) => Math.hypot(x - cx, z - cz) < rad);
      if (busy || Math.abs(x - 2.5 + (z - 12) * 0.1) < 2.4 && z > 2) continue;
      if (h > 1.2 || Math.abs(z + 7) < 1.6 || Math.abs(x - 16) < 1.6) continue;
      if (Math.abs(x) < 15.5 && z > -5.5 && z < 5) continue;
      if (z > 15) continue;
      if (Math.abs(x) < 6 && z > 5) continue;
      P.push([x, h, z, 0.45 + q() * 0.35]);
    }
    const cone1 = LUMP(new THREE.ConeGeometry(0.9, 1.7, 14, 3), 0.06, 5, 2), cone2 = LUMP(new THREE.ConeGeometry(0.7, 1.4, 14, 3), 0.06, 6, 2), trunk = new THREE.CylinderGeometry(0.14, 0.18, 0.8, 8);
    const ims = [[trunk, clay("#7A4A26"), 0.4], [cone1, clay("#ffffff"), 1.35], [cone2, clay("#ffffff"), 2.2]].map(([g, m, y]) => { const im = new THREE.InstancedMesh(g, m, P.length); im.castShadow = im.receiveShadow = true; scene.add(im); return [im, y]; });
    const M4 = new THREE.Matrix4(), S = new V3(), Tq = new THREE.Quaternion(), cc = new THREE.Color(), GR = ["#3F7A45", "#4F8F50", "#356B3B", "#5A9A55"];
    P.forEach(([x, h, z, s], i) => { ims.forEach(([im, y], j) => { M4.compose(new V3(x, h + y * s, z), Tq.setFromAxisAngle(new V3(0, 1, 0), i), S.set(s, s, s)); im.setMatrixAt(i, M4); if (j) im.setColorAt(i, cc.set(GR[(i + j) % 4])); }); });
    ims.forEach(([im]) => { im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; });
  }
  // clay clouds hanging over the ridge
  const clouds = [[-12, 19, -22, 1.2], [9, 21, -24, 1.4], [20, 16, -10, 1.0]].map(([x, y, z, s], i) => { const G = grp(x, y, z); const q = mulberry(i + 40); for (let k = 0; k < 6; k++) mk(LUMP(SPH(1 + q() * 0.6, 24), 0.12, i * 9 + k, 1.4), clay("#FBF8F2", 0.7), (k - 2.5) * 0.95, q() * 0.6, q() * 0.6, G); G.scale.setScalar(s); mk(CYL(0.012, 0.012, 14, 4), clay("#FFFFFF"), 0, 7, 0, G).castShadow = false; return G; });

  // flags on the borders + labels
  flag(scene, -1.5, H(-1.5, -19), -19, 3.4, 2.27, FR_T, 4.2);
  woodSign(1.6, -18.2, 4.6, 1.3, [["PRANCIS", 1, CREAM]], { post: 2.6, y0: H(1.6, -18.2) - 0.4 });
  flag(scene, -3.0, H(-3.0, 26.6), 26.6, 3.0, 2.0, ES_T, 3.4);
  woodSign(-1.2, 23.2, 4.2, 1.2, [["SPANYOL", 1, CREAM]], { post: 1.2, ry: 0.05 });
  const andorraSign = woodSign(-13.6, 19.5, 5.2, 1.4, [["ANDORRA", 1, AY]], { post: 1.3, ry: 0.2, board: "#3E4FA8" });
  // AUDIRA: a big wooden sign at the valley entrance + a small arrow post by the plaza
  woodSign(6.8, 21.5, 5.0, 1.6, [["AUDIRA", 0.68, CREAM], ["audira.my.id", 0.32, "#FFE2A8", (s) => `700 ${s}px ${MONO}`]], { post: 1.4, ry: -0.18 });
  {
    const G = grp(4.6, 0, 2.6); G.rotation.y = -0.35;
    mk(CYL(0.08, 0.09, 2.5, 10), wood("#8A5A30"), 0, 1.25, 0, G);
    const sh = new THREE.Shape(); sh.moveTo(-0.9, -0.28); sh.lineTo(0.75, -0.28); sh.lineTo(1.1, 0); sh.lineTo(0.75, 0.28); sh.lineTo(-0.9, 0.28); sh.closePath();
    const ag = new THREE.ExtrudeGeometry(sh, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 });
    mk(ag, wood("#B07444"), 0.15, 2.05, 0.02, G);
    const tx = canvasTex(512, 160, (g, w, h) => { g.clearRect(0, 0, w, h); claytext(g, "AUDIRA", w * 0.46, h / 2, fH, h * 0.62, CREAM, w * 0.8); });
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 0.55), new THREE.MeshStandardMaterial({ map: tx, transparent: true, alphaTest: 0.05, roughness: 0.7 })); pl.position.set(0.16, 2.05, 0.21); G.add(pl);
    blob(G, 0, 0, 0.9, 0.9);
  }

  // ======================================================================================
  // PLAZA: dais, two thrones, two crowns, banners
  // ======================================================================================
  const PL = grp(0, 0, 0);
  mk(LUMP(rb(8.2, 0.46, 3.6, 0.16), 0.04, 81, 1.2), stone("#E2D6C2"), 0, 0.23, -0.1, PL);
  mk(rb(7.6, 0.06, 3.2, 0.03), clay("#B5302B", 0.7), 0, 0.47, -0.1, PL);
  mk(rb(2.2, 0.22, 0.9, 0.08), stone("#E2D6C2"), 0, 0.11, 2.1, PL);
  mk(rb(1.6, 0.04, 2.6, 0.02), clay("#B5302B", 0.7), 0, 0.48, 1.0, PL);
  blob(PL, 0, -0.1, 11, 5.5, 0.01);
  const GOLDC = clay("#D9A62E", 0.66, 4.5);
  function throne(x, side) {
    const G = grp(x, 0.47, -0.45, PL);
    mk(LUMP(rb(1.55, 0.5, 1.4, 0.14), 0.05, 90 + side, 2.2), GOLDC, 0, 0.6, 0, G);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) mk(rb(0.2, 0.4, 0.2, 0.06), GOLDC, sx * 0.62, 0.2, sz * 0.55, G);
    mk(LUMP(rb(1.6, 2.5, 0.36, 0.17), 0.06, 92 + side, 2.0), GOLDC, 0, 1.95, -0.55, G);
    for (const sx of [-1, 1]) { mk(LUMP(rb(0.26, 0.55, 1.35, 0.1), 0.03, 95 + sx, 3), GOLDC, sx * 0.8, 1.05, 0.02, G); mk(SPH(0.17, 18), gold, sx * 0.7, 3.27, -0.55, G); }
    mk(SPH(0.22, 18), gold, 0, 3.32, -0.55, G);
    const cush = side < 0 ? PUR : FB;
    mk(LUMP(rb(1.32, 0.26, 1.16, 0.12), 0.05, 94 + side, 3), clay(cush, 0.72), 0, 0.97, 0.05, G);
    if (side < 0) { // purple inlay with a gold mitre
      mk(LUMP(rb(1.15, 1.8, 0.08, 0.1), 0.025, 97, 3), clay(PUR, 0.72), 0, 2.0, -0.35, G);
      const ms = mitreShape(); const mg = new THREE.ExtrudeGeometry(ms, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
      mk(mg, gold, 0, 1.75, -0.32, G).scale.setScalar(0.6);
    } else { // tricolour inlay
      [FB, "#F6F3EC", FR].forEach((c, i) => mk(LUMP(rb(0.38, 1.8, 0.08, 0.06), 0.025, 98 + i, 3), clay(c, 0.72), (i - 1) * 0.38, 2.0, -0.35, G));
    }
    return G;
  }
  function mitreShape() { const ms = new THREE.Shape(); ms.moveTo(-0.36, 0); ms.lineTo(0.36, 0); ms.lineTo(0.35, 0.45); ms.quadraticCurveTo(0.22, 0.86, 0, 1.02); ms.quadraticCurveTo(-0.22, 0.86, -0.35, 0.45); ms.closePath(); return ms; }
  const thrL = throne(-1.75, -1), thrR = throne(1.75, 1);
  // clay name plaques on the seat bases
  [[thrL, "USKUP URGELL", "#3D1257"], [thrR, "PRESIDEN PRANCIS", "#0B2E6E"]].forEach(([G, txt, col], i) => {
    mk(LUMP(rb(1.5, 0.42, 0.1, 0.06), 0.015, 140 + i, 4), clay("#FFF1DA", 0.7), 0, 0.42, 0.74, G);
    const tx = canvasTex(768, 216, (g, w, h) => { g.clearRect(0, 0, w, h); fitText(g, txt, fH, 120, w * 0.9); g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(txt, w / 2, h / 2 + 6); });
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 0.4), new THREE.MeshBasicMaterial({ map: tx, transparent: true, alphaTest: 0.05, toneMapped: false, fog: false })); pl.position.set(0, 0.42, 0.8); G.add(pl);
  });
  // cobbled plaza in front of the dais (instanced flattened clay pebbles)
  {
    const q = mulberry(333), P = [];
    for (let z = 1.9; z < 7.6; z += 0.42) for (let x = -6.2; x < 6.2; x += 0.46) {
      const jx = x + (q() - 0.5) * 0.14 + ((Math.round(z / 0.42) % 2) * 0.23), jz = z + (q() - 0.5) * 0.12;
      if (Math.hypot(jx / 6.4, (jz - 1.9) / 5.8) > 1) continue;
      P.push([jx, jz, 0.19 + q() * 0.05, q()]);
    }
    const geo = LUMP(new THREE.SphereGeometry(1, 14, 8), 0.12, 31, 2.5);
    const im = new THREE.InstancedMesh(geo, clay("#ffffff", 0.72, 3), P.length); im.castShadow = false; im.receiveShadow = true; scene.add(im);
    const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new V3(), cc = new THREE.Color(), CB = ["#B9AA98", "#A89886", "#C7B9A6", "#9C8C7C", "#BFA88E"];
    P.forEach(([x, z, r0, c], i) => { M4.compose(new V3(x, H(x, z) + 0.02, z), Q.setFromAxisAngle(new V3(0, 1, 0), c * 6), S.set(r0, 0.07, r0 * 0.9)); im.setMatrixAt(i, M4); im.setColorAt(i, cc.set(CB[Math.floor(c * 5)])); });
    im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true;
  }
  // a tiny Andorra flag on a clay pot at the front of the plaza, and two flower pots
  {
    const G = grp(0, 0.47, 2.75);
    mk(LUMP(CYL(0.36, 0.28, 0.5, 20), 0.02, 150, 4), clay("#B5562E", 0.7), 0, 0.25, 0, G);
    mk(LUMP(CYL(0.33, 0.33, 0.06, 20), 0.01, 151, 4), clay("#5A3A2A", 0.8), 0, 0.5, 0, G);
    flag(G, 0, 0.45, 0, 0.9, 0.6, AD_T, 1.85);
    blob(G, 0, 0, 1.0, 1.0);
    for (const [x, z, c] of [[1.55, 6.2, "#E0475A"], [-1.1, 7.2, "#F2C14E"]]) {
      const F = grp(x, 0, z);
      mk(LUMP(CYL(0.3, 0.24, 0.42, 18), 0.02, 152 + x, 4), clay("#B5562E", 0.7), 0, 0.21, 0, F);
      mk(LUMP(SPH(0.34, 18), 0.06, 153 + x, 3), clay("#4F8F50", 0.7), 0, 0.55, 0, F).scale.set(1, 0.7, 1);
      const q = mulberry(Math.round(x * 10) + 200); for (let i = 0; i < 6; i++) { const a = i * 1.05; mk(SPH(0.08, 10), clay(c, 0.6), Math.cos(a) * 0.2 + (q() - 0.5) * 0.05, 0.7 + q() * 0.08, Math.sin(a) * 0.2, F); }
      blob(F, 0, 0, 0.8, 0.8);
    }
  }
  function crown(gems, s = 1) {
    const G = new THREE.Group();
    mk(LUMP(new THREE.CylinderGeometry(0.36, 0.33, 0.28, 32, 2, true), 0.012, 3, 6), gold, 0, 0.14, 0, G).material.side = THREE.DoubleSide;
    mk(new THREE.TorusGeometry(0.345, 0.045, 10, 32), gold, 0, 0.02, 0, G).rotation.x = Math.PI / 2;
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; mk(new THREE.ConeGeometry(0.085, 0.26, 10), gold, Math.sin(a) * 0.34, 0.39, Math.cos(a) * 0.34, G); mk(SPH(0.05, 12), gold, Math.sin(a) * 0.34, 0.54, Math.cos(a) * 0.34, G); }
    gems.forEach((c, i) => { const a = (i - (gems.length - 1) / 2) * 0.7; mk(SPH(0.075, 14), new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.15, clearcoat: 1, envMapIntensity: 1.2 }), Math.sin(a) * 0.36, 0.14, Math.cos(a) * 0.36, G); });
    G.scale.setScalar(s); scene.add(G); return G;
  }
  const crownL = crown([PUR, "#E04B6A", PUR], 1.15), crownR = crown([FB, "#F6F3EC", FR], 1.15);
  const banL = banner(PL, -3.75, 0.47, -0.9, 1.1, 1.7, PUR_T, 3.5), banR = banner(PL, 3.75, 0.47, -0.9, 1.6, 1.07, FR_T, 3.5);
  banR.m.rotation.z = 0;

  // ======================================================================================
  // CLAY PEOPLE
  // ======================================================================================
  const EYE = SPH(0.07, 16), GL = SPH(0.022, 8), HAND = SPH(0.16, 16);
  const cheekM = new THREE.MeshStandardMaterial({ color: "#F08C96", roughness: 0.8, transparent: true, opacity: 0.6 });
  const people = [];
  function person(o) {
    const G = grp(0, 0, 0); G.visible = false;
    const coat = o.coatM || clay(o.coat), pants = clay(o.pants || "#3B3A44"), sk = clay(o.skin || "#E9B28C", 0.55, 2), boot = clay(o.boot || "#3A2A20", 0.5);
    const legs = [-1, 1].map((s) => {
      const hip = grp(s * 0.2, 1.2, 0, G); mk(rb(0.32, 0.64, 0.36, 0.13), pants, 0, -0.3, 0, hip);
      const knee = grp(0, -0.6, 0, hip); mk(rb(0.29, 0.5, 0.33, 0.12), pants, 0, -0.23, 0, knee); mk(rb(0.36, 0.22, 0.54, 0.1), boot, 0, -0.5, 0.08, knee);
      return { hip, knee };
    });
    mk(rb(0.74, 0.38, 0.46, 0.16), pants, 0, 1.24, 0, G);
    const torso = grp(0, 1.4, 0, G);
    const chestW = o.wide || 1.04;
    mk(LUMP(rb(chestW, 0.95, 0.6, 0.22), 0.025, (o.seed || 1) * 5, 2.5), coat, 0, 0.45, 0, torso);
    if (o.belly) mk(LUMP(SPH(0.56, 28), 0.03, 9, 2.5), coat, 0, 0.28, 0.16, torso).scale.set(1.05, 0.95, 0.9);
    if (o.robe) mk(LUMP(CYL(0.5, 0.8, 1.45, 28), 0.03, 4, 2), clay(o.robe), 0, -0.55, 0, torso);
    if (o.shirt) { mk(rb(0.36, 0.5, 0.05, 0.04), clay("#F6F3EC", 0.6), 0, 0.68, 0.3, torso); mk(rb(0.1, 0.42, 0.05, 0.03), clay(o.tie || "#A3262E", 0.5), 0, 0.6, 0.33, torso); }
    if (o.sash) { const S = grp(0, 0.45, 0.31, torso); S.rotation.z = 0.68; [FB, "#F6F3EC", FR].forEach((c, i) => mk(rb(0.12, 1.32, 0.05, 0.03), clay(c, 0.55), (i - 1) * 0.12, 0, i * 0.003, S)); mk(SPH(0.09, 14), gold, -0.33, -0.32, 0.05, torso); }
    if (o.cape) mk(LUMP(rb(1.2, 1.5, 0.12, 0.06), 0.03, 12, 2), clay(o.cape), 0, 0.2, -0.36, torso);
    if (o.mozzetta) { mk(LUMP(CYL(0.5, 0.66, 0.42, 28), 0.02, 13, 3), clay(o.mozzetta), 0, 0.78, 0, torso); mk(rb(0.06, 0.26, 0.04, 0.02), gold, 0, 0.42, 0.33, torso); mk(rb(0.18, 0.06, 0.04, 0.02), gold, 0, 0.47, 0.33, torso); }
    if (o.ermine) { mk(LUMP(CYL(0.52, 0.64, 0.3, 28), 0.02, 14, 3), clay("#F7F4EE", 0.7), 0, 0.84, 0, torso); for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.28; mk(SPH(0.035, 8), clay("#1A1A1F", 0.5), Math.sin(a) * 0.6, 0.82, Math.cos(a) * 0.6, torso); } }
    if (o.crossbelt) { const c = mk(rb(0.13, 1.15, 0.04, 0.02), clay("#F2EEE4", 0.6), 0, 0.46, 0.31, torso); c.rotation.z = -0.62; }
    const head = grp(0, 1.0, 0, torso);
    mk(CYL(0.15, 0.17, 0.22, 12), sk, 0, 0.02, 0, head);
    mk(LUMP(SPH(0.42, 32), 0.015, (o.seed || 1) * 3, 3), sk, 0, 0.47, 0, head).scale.set(1, 1.0, 0.94);
    const eyes = [-1, 1].map((s) => { const e = mk(EYE, bead, s * 0.15, 0.53, 0.36, head); const g2 = new THREE.Mesh(GL, glint); g2.position.set(0.022, 0.026, 0.055); e.add(g2); return e; });
    for (const s of [-1, 1]) { const c = new THREE.Mesh(once("cheek", () => new THREE.CircleGeometry(0.07, 16)), cheekM); c.position.set(s * 0.25, 0.4, 0.37); c.rotation.y = s * 0.45; head.add(c); }
    const sm = mk(once("smile", () => new THREE.TorusGeometry(0.08, 0.02, 6, 14, Math.PI)), bead, 0, 0.36, 0.385, head); sm.rotation.z = Math.PI; sm.castShadow = false;
    mk(SPH(0.07, 14), clay(o.nose || "#E39C78", 0.55, 2), 0, 0.45, 0.42, head);
    if (o.hair) { mk(LUMP(SPH(0.44, 28, ), 0.03, 7, 4), clay(o.hair, 0.65), 0, 0.58, -0.06, head).scale.set(1.0, 0.75, 0.95); }
    if (o.mous) for (const s of [-1, 1]) { const m = mk(once("mous", () => new THREE.TorusGeometry(0.09, 0.035, 8, 14, Math.PI * 1.2)), clay(o.mous, 0.6), s * 0.1, 0.36, 0.4, head); m.rotation.z = s > 0 ? -0.3 : Math.PI + 0.3; m.scale.set(s, 1, 1); }
    let hat = null;
    if (o.mitre) { hat = grp(0, 0.74, 0, head); const mg = new THREE.ExtrudeGeometry(mitreShape(), { depth: 0.5, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.06, bevelSegments: 4, curveSegments: 16 }); mg.translate(0, 0, -0.25); mk(mg, clay(PUR, 0.6), 0, 0, 0, hat).scale.set(1.1, 1.05, 1); mk(rb(0.12, 0.95, 0.06, 0.03), gold, 0, 0.5, 0.33, hat); mk(rb(0.82, 0.12, 0.66, 0.05), gold, 0, 0.07, 0, hat); }
    if (o.redcap) { hat = mk(SPH(0.45, 24, ), clay("#C8102E", 0.6), 0, 0.62, -0.02, head); hat.scale.set(1, 0.6, 1); mk(SPH(0.09, 12), clay(AY, 0.6), 0, 0.9, 0, head); }
    if (o.cap) { hat = grp(0, 0.78, 0, head); mk(CYL(0.4, 0.42, 0.22, 24), clay("#1C1F24", 0.5), 0, 0.02, 0, hat); mk(rb(0.5, 0.05, 0.3, 0.02), clay("#111114", 0.3), 0, -0.07, 0.36, hat); mk(SPH(0.06, 10), gold, 0, 0.05, 0.41, hat); }
    if (o.beret) { hat = mk(SPH(0.46, 24), clay(o.beret, 0.7), 0.04, 0.72, -0.02, head); hat.scale.set(1.05, 0.42, 1.05); }
    const arms = [-1, 1].map((s) => {
      const sh = grp(s * (chestW * 0.6), 0.82, 0, torso); mk(rb(0.28, 0.56, 0.32, 0.13), coat, 0, -0.24, 0, sh);
      const el = grp(0, -0.5, 0, sh); mk(rb(0.26, 0.48, 0.29, 0.12), o.sleeve ? clay(o.sleeve) : coat, 0, -0.21, 0, el);
      const hand = mk(HAND, sk, 0, -0.5, 0, el);
      return { sh, el, hand };
    });
    blob(G, 0, 0, 1.6, 1.3);
    G.scale.setScalar(o.s || 0.72);
    const P = { G, torso, head, eyes, arms, legs, hat, s: o.s || 0.72, ph: o.ph || 0, id: people.length, sm };
    people.push(P); return P;
  }
  const SK = ["#E9B28C", "#D79A72", "#F0C3A0", "#C98A62"];
  const bishop = person({ coat: "#F1EADB", robe: "#F1EADB", pants: "#F1EADB", mozzetta: PUR, mitre: true, skin: SK[0], boot: "#4A2A5A", seed: 2, ph: 0.4, sleeve: "#F1EADB" });
  const crozier = grp(0, -0.5, 0.06, bishop.arms[0].el); { mk(CYL(0.035, 0.035, 2.6, 10), gold, 0, 0.45, 0, crozier); const hk = mk(new THREE.TorusGeometry(0.16, 0.035, 8, 20, Math.PI * 1.4), gold, 0.15, 1.77, 0, crozier); hk.rotation.z = -0.4; }
  const pres = person({ coat: "#2D3A5A", pants: "#252E46", shirt: true, tie: "#2A4F9E", sash: true, hair: "#6B5A4A", skin: SK[2], seed: 3, ph: 1.3 });
  const foixStripes = canvasTex(256, 256, (g, w, h) => { for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? "#C8102E" : "#F2C230"; g.fillRect((i * w) / 7, 0, w / 7 + 1, h); } });
  const foix = person({ coatM: clayMap("foix", foixStripes), pants: "#5A3A2A", redcap: true, skin: SK[1], seed: 4, ph: 2.1, sleeve: "#C8102E" });
  const king = person({ coat: "#2346A0", robe: "#2346A0", ermine: true, cape: "#1D3880", skin: SK[2], seed: 5, ph: 0.9, hair: "#8A6A3A" });
  const boris = person({ coat: "#7E2234", belly: true, cape: "#C0392B", pants: "#2C2A33", skin: SK[0], mous: "#3A2414", hair: "#3A2414", seed: 6, ph: 0.2, s: 0.78, wide: 1.12 });
  const borisCrown = crown([AR, "#2BA84A", FB, AR], 1.8);
  const sword = grp(0, -0.5, 0.06, boris.arms[1].el); { mk(rb(0.1, 1.15, 0.05, 0.03), clay("#CFD6DC", 0.4), 0, -0.6, 0, sword); mk(rb(0.42, 0.08, 0.1, 0.03), wood("#7A4A26"), 0, -0.04, 0, sword); sword.rotation.x = Math.PI; }
  const police = person({ coat: "#2F4A3A", pants: "#26392D", cap: true, crossbelt: true, skin: SK[3], seed: 7, ph: 1.7, s: 0.5 });
  const CIT = [
    person({ coat: "#D9822B", pants: "#3B4A6B", beret: "#2A2A3A", skin: SK[1], seed: 8, ph: 0.3, s: 0.66 }),
    person({ coat: "#4C8C6A", pants: "#5A3A2A", hair: "#C9A06A", skin: SK[2], seed: 9, ph: 1.1, s: 0.62 }),
    person({ coat: "#B8506A", pants: "#2C2A33", hair: "#2A1E16", skin: SK[3], seed: 10, ph: 2.4, s: 0.64 }),
    person({ coat: "#E0B84A", pants: "#3B3A44", beret: "#7A2E3A", skin: SK[0], seed: 11, ph: 0.8, s: 0.6 }),
  ];
  const presHair = pres.head.children.find((c) => c.material && c.material.color && c.material === clay("#6B5A4A", 0.65));
  const HAIRC = ["#6B5A4A", "#2A1E16", "#BDB6AA", "#8A6A3A"];

  // pose helpers on the stop-motion clock
  function stand(P, ts, x, z, ry, base = 0) {
    P.G.visible = true; P.G.position.set(x, base, z); P.G.rotation.set(0, ry, 0);
    const boil = 1 + 0.008 * Math.sin(Math.floor(ts * 15) * 12.9898 + P.id * 78.233);
    P.G.scale.setScalar(P.s * boil);
    P.torso.position.y = 1.4 + Math.sin(ts * 2.2 + P.ph) * 0.015; P.torso.rotation.set(0, 0, 0);
    P.head.rotation.set(0, 0, Math.sin(ts * 0.9 + P.ph) * 0.05);
    const bl = (ts * 0.37 + P.ph * 0.13) % 1; const s = bl < 0.04 ? 0.12 : 1; for (const e of P.eyes) e.scale.set(1, s, 1);
    P.legs.forEach((L) => { L.hip.rotation.set(0, 0, 0); L.knee.rotation.set(0, 0, 0); });
    P.arms.forEach((a, i) => { const sg = i ? 1 : -1; a.sh.rotation.set(0.05, 0, sg * 0.16); a.el.rotation.set(-0.42, 0, 0); });
  }
  function walk(P, ph, amp = 1) {
    P.legs.forEach((L, i) => { const s = Math.sin(ph + i * Math.PI); L.hip.rotation.x = s * 0.55 * amp; L.knee.rotation.x = Math.max(0, -s) * 0.8 * amp; });
    P.arms.forEach((a, i) => { a.sh.rotation.x = -Math.sin(ph + i * Math.PI) * 0.5 * amp; });
    P.G.position.y += Math.abs(Math.sin(ph)) * 0.06 * amp;
  }
  // walk from a to b between times t0..t1 (ts clock); returns progress
  function path(P, ts, ax, az, bx, bz, t0, t1, base = 0) {
    const u = clamp01((ts - t0) / (t1 - t0)), e = u < 1 ? u : 1;
    const x = ax + (bx - ax) * e, z = az + (bz - az) * e;
    const ry = Math.atan2(bx - ax, bz - az);
    stand(P, ts, x, z, u > 0 && u < 1 ? ry : 0, base);
    if (u > 0 && u < 1) walk(P, (ts - t0) * 9, 1);
    return u;
  }
  const lookAt = (P, x, z) => { P.G.rotation.y = Math.atan2(x - P.G.position.x, z - P.G.position.z); };

  // ======================================================================================
  // SCROLL ZONE (s4)
  // ======================================================================================
  const SC = grp(-11, 0, -0.6);
  mk(LUMP(rb(0.3, 1.7, 0.3, 0.1), 0.02, 21, 2), wood("#8A5A30"), 0, 0.85, 0, SC);
  mk(rb(1.4, 0.16, 1.0, 0.06), wood("#8A5A30"), 0, 0.08, 0, SC);
  const scTop = grp(0, 1.85, 0, SC); scTop.rotation.x = -0.72;
  mk(rb(3.6, 0.14, 2.2, 0.06), wood("#9C6436"), 0, -0.08, 0, scTop);
  const PARCH = "#F2E2BC";
  const scrollT = canvasTex(1024, 640, (g, w, h) => {
    const q = mulberry(12); g.fillStyle = PARCH; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 600; i++) { g.fillStyle = `rgba(150,110,60,${0.04 + q() * 0.06})`; g.fillRect(q() * w, q() * h, 2 + q() * 10, 1 + q() * 3); }
    g.strokeStyle = "rgba(150,100,50,.5)"; g.lineWidth = 6; g.strokeRect(26, 26, w - 52, h - 52);
    g.textAlign = "center"; g.fillStyle = "#5A3418"; g.font = fH(64); g.fillText("PERJANJIAN", w / 2, 128);
    g.font = fM(190); g.fillStyle = "#3A2210"; g.fillText("1278", w / 2, 330);
    g.font = `500 44px ${HEAD}`; g.fillStyle = "#6A4426"; g.fillText("Uskup Urgell  ·  Count Foix", w / 2, 420);
    g.strokeStyle = "rgba(90,52,24,.35)"; g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(140, 470 + i * 34); g.lineTo(w - 140, 470 + i * 34); g.stroke(); }
  });
  const scrollM = new THREE.MeshPhysicalMaterial({ map: scrollT, roughness: 0.8, sheen: 0.2, sheenColor: SHEEN, bumpMap: thumbT, bumpScale: 1 });
  const sheet = mk(new THREE.PlaneGeometry(3.2, 2.0), scrollM, 0, 0.01, 0, scTop); sheet.rotation.x = -Math.PI / 2;
  const rollers = [-1, 1].map((s) => { const m = mk(CYL(0.13, 0.13, 2.2, 18), clay(PARCH, 0.7), 0, 0.12, 0, scTop); m.rotation.x = Math.PI / 2; return m; });
  const seals = [[PUR, -0.8], ["#C8102E", 0.8]].map(([c, x]) => { const m = mk(LUMP(CYL(0.24, 0.26, 0.08, 24), 0.02, 3, 4), clay(c, 0.45), x, 0.06, 0.62, scTop); m.visible = false; return m; });
  { const s2 = grp(0, 0, 0, seals[1]); [0, 1, 2].forEach((i) => mk(rb(0.06, 0.1, 0.36, 0.02), clay("#F2C230", 0.5), -0.12 + i * 0.12, 0.05, 0, s2)); }
  // tiny Andorra model they tug
  const MINI = grp(0, 0, 0);
  mk(LUMP(SPH(0.55, 28), 0.08, 22, 3), clay("#6FA35A"), 0, 0, 0, MINI).scale.set(1.3, 0.75, 1);
  mk(LUMP(new THREE.ConeGeometry(0.35, 0.6, 18), 0.03, 23, 4), clay("#F3F1EC"), -0.2, 0.5, -0.1, MINI);
  mk(LUMP(new THREE.ConeGeometry(0.28, 0.45, 18), 0.03, 24, 4), clay("#8C7B6B"), 0.3, 0.42, 0.0, MINI);
  { const f = flag(MINI, 0.05, 0.25, 0.2, 0.42, 0.28, AD_T, 0.6); f.scale.setScalar(1); }
  // crown token that hops Foix > king > president
  const hopCrown = crown([AR, AY, AR], 0.9);
  // stepping beads between the relay figures
  const beads = []; for (let i = 0; i < 14; i++) { const x = -8.6 + i * 0.32; const m = mk(SPH(0.09, 10), clay(i < 7 ? "#F2C230" : FB, 0.5), x, 0.08, 1.9); m.visible = false; beads.push(m); }

  // ======================================================================================
  // BALLOT ZONE (s5)
  // ======================================================================================
  const BT = grp(8.3, 0, 0.9);
  mk(LUMP(rb(1.8, 0.14, 1.2, 0.06), 0.02, 31, 2), wood("#9C6436"), 0, 1.0, 0, BT);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) mk(rb(0.14, 1.0, 0.14, 0.04), wood("#7A4A26"), sx * 0.75, 0.5, sz * 0.45, BT);
  const box = grp(0, 1.07, 0, BT);
  mk(LUMP(rb(1.1, 0.9, 0.8, 0.12), 0.02, 32, 2), clay("#F6F0E2", 0.6), 0, 0.45, 0, box);
  mk(rb(1.12, 0.16, 0.82, 0.06), clay(AB, 0.55), 0, 0.84, 0, box);
  mk(rb(0.5, 0.05, 0.1, 0.02), clay("#1A1418", 0.4), 0, 0.93, 0, box);
  { const tx = canvasTex(512, 256, (g, w, h) => { g.clearRect(0, 0, w, h); claytext(g, "REFERENDUM", w / 2, h * 0.32, fH, 70, AB, w * 0.9, "#F6F0E2"); claytext(g, "1993", w / 2, h * 0.72, fM, 92, AR, w * 0.9, "#F6F0E2"); });
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.5), new THREE.MeshStandardMaterial({ map: tx, transparent: true, alphaTest: 0.05, roughness: 0.7 })); pl.position.set(0, 0.42, 0.41); box.add(pl); }
  blob(BT, 0, 0, 2.6, 1.8);
  const ballotT = canvasTex(128, 160, (g, w, h) => { g.fillStyle = "#FBF8F0"; g.fillRect(0, 0, w, h); g.strokeStyle = "#2E8B3E"; g.lineWidth = 14; g.lineCap = "round"; g.beginPath(); g.moveTo(30, 84); g.lineTo(56, 112); g.lineTo(100, 46); g.stroke(); });
  const ballots = CIT.map(() => { const m = mk(rb(0.36, 0.46, 0.03, 0.02), new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: ballotT, roughness: 0.8, sheen: 0.2, sheenColor: SHEEN }), 0, 0, 0); m.visible = false; return m; });
  // constitution lectern + book
  const LC = grp(11.7, 0, 0.2);
  mk(LUMP(rb(0.3, 1.6, 0.3, 0.1), 0.02, 41, 2), wood("#8A5A30"), 0, 0.8, 0, LC);
  mk(rb(1.3, 0.16, 1.0, 0.06), wood("#8A5A30"), 0, 0.08, 0, LC);
  const lcTop = grp(0, 1.72, 0, LC); lcTop.rotation.x = -0.7;
  mk(rb(2.6, 0.12, 1.7, 0.05), wood("#9C6436"), 0, -0.06, 0, lcTop);
  const BOOK = grp(0, 0.02, 0, lcTop);
  mk(rb(2.5, 0.08, 1.6, 0.04), clay("#7A2E3A", 0.55), 0, 0, 0, BOOK);
  const pageT = canvasTex(1024, 640, (g, w, h) => {
    const q = mulberry(19); g.fillStyle = "#FBF4E4"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(120,90,50,.18)"; g.fillRect(w / 2 - 3, 0, 6, h);
    for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(150,110,60,${0.03 + q() * 0.04})`; g.fillRect(q() * w, q() * h, 2 + q() * 6, 1 + q() * 2); }
    g.textAlign = "center"; g.fillStyle = "#3A2210"; g.font = fH(66); g.fillText("KONSTITUSI", w / 4, 170); g.font = `500 44px ${HEAD}`; g.fillText("ANDORRA", w / 4, 240);
    g.font = fM(130); g.fillStyle = AR; g.fillText("1993", w / 4, 420);
    g.strokeStyle = "rgba(60,40,20,.25)"; g.lineWidth = 3; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(w / 2 + 60, 90 + i * 40); g.lineTo(w - 60, 90 + i * 40); g.stroke(); }
    g.strokeStyle = "#3A2210"; g.lineWidth = 3; for (const y of [440, 580]) { g.beginPath(); g.moveTo(w / 2 + 70, y); g.lineTo(w - 70, y); g.stroke(); }
    g.font = `500 30px ${HEAD}`; g.fillStyle = PUR; g.fillText("Uskup Urgell", (w * 3) / 4, 478); g.fillStyle = FB; g.fillText("Presiden Prancis", (w * 3) / 4, 618);
  });
  const page = mk(new THREE.PlaneGeometry(2.4, 1.5), new THREE.MeshPhysicalMaterial({ map: pageT, roughness: 0.8, sheen: 0.15, sheenColor: SHEEN }), 0, 0.05, 0, BOOK); page.rotation.x = -Math.PI / 2;
  function sigTube(seed, cx, cz, col) {
    const q = mulberry(seed), pts = [];
    for (let i = 0; i <= 26; i++) { const u = i / 26; pts.push(new V3(cx - 0.42 + u * 0.84, 0.065, cz - 0.06 * Math.sin(u * 19 + q() * 2) - 0.03 * Math.cos(u * 41))); }
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.014, 6, false);
    const m = mk(g, clay(col, 0.4, 0), 0, 0, 0, BOOK); m.castShadow = false; return { m, n: g.index.count };
  }
  const sigs = [sigTube(5, 0.6, (410 / 640 - 0.5) * 1.5, "#4A1E5E"), sigTube(9, 0.6, (550 / 640 - 0.5) * 1.5, "#14306A")];
  const quill = grp(0, 0, 0); { mk(new THREE.ConeGeometry(0.04, 0.45, 10), clay("#E9D9B8", 0.7), 0, 0.22, 0, quill); mk(SPH(0.03, 8), bead, 0, 0, 0, quill); } quill.visible = false;
  const quill2 = quill.clone(); scene.add(quill2);

  // ======================================================================================
  // BORIS ZONE (s6)
  // ======================================================================================
  const crate = grp(-7.6, 0, 12.4);
  mk(LUMP(rb(1.5, 0.95, 1.1, 0.08), 0.02, 51, 2), wood("#B07444"), 0, 0.475, 0, crate);
  { const tx = canvasTex(512, 256, (g, w, h) => { g.clearRect(0, 0, w, h); claytext(g, "BORIS I", w / 2, h / 2, fH, 120, AY, w * 0.9); }); const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.65), new THREE.MeshStandardMaterial({ map: tx, transparent: true, alphaTest: 0.05, roughness: 0.7 })); pl.position.set(0, 0.5, 0.56); crate.add(pl); }
  blob(crate, 0, 0, 2.2, 1.7);
  // calendar on a post
  const CAL = grp(-10.3, 0, 12.7); CAL.rotation.y = 0.35;
  mk(CYL(0.08, 0.09, 1.6, 10), wood("#8A5A30"), 0, 0.8, 0, CAL);
  mk(LUMP(rb(1.5, 1.6, 0.18, 0.1), 0.02, 52, 2), clay("#F6F0E2", 0.6), 0, 2.3, 0, CAL);
  mk(rb(1.5, 0.42, 0.22, 0.08), clay(AR, 0.55), 0, 2.95, 0, CAL);
  for (const s of [-1, 1]) mk(new THREE.TorusGeometry(0.08, 0.025, 8, 16), steel, s * 0.4, 3.18, 0, CAL);
  let calDay = -1;
  const calCv = document.createElement("canvas"); calCv.width = 512; calCv.height = 640;
  const calT = new THREE.CanvasTexture(calCv); calT.colorSpace = THREE.SRGBColorSpace; calT.anisotropy = 8;
  function paintCal(d) {
    const g = calCv.getContext("2d"), w = 512, h = 640; g.clearRect(0, 0, w, h);
    claytext(g, "JULI 1934", w / 2, 70, fH, 74, "#FFF4E2", w * 0.9, "#7A0020");
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = INK; g.font = fM(300); g.fillText(String(d), w / 2, 370);
    calT.needsUpdate = true;
  }
  paintCal(12); calDay = 12;
  { const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.75), new THREE.MeshStandardMaterial({ map: calT, transparent: true, alphaTest: 0.03, roughness: 0.7 })); pl.position.set(0, 2.45, 0.1); CAL.add(pl); }
  blob(CAL, 0, 0, 1.2, 1.0);
  const bubPerang = bubble(3.0, 1.5, (g, W, Hh) => claytext(g, "PERANG!", W / 2, Hh / 2, fH, Hh * 0.5, AR, W * 0.84));

  // ======================================================================================
  // BANK ZONE (s7)
  // ======================================================================================
  const BK = grp(6.8, H(6.8, 9.5), 9.5); BK.rotation.y = -0.12;
  mk(LUMP(rb(5.8, 3.9, 2.6, 0.16), 0.04, 71, 1.3), stone("#EFE6D6"), 0, 1.95, 0, BK);
  mk(rb(6.4, 0.3, 3.0, 0.1), stone("#D9CFC0"), 0, 4.0, 0, BK);
  { const sh = new THREE.Shape(); sh.moveTo(-3.2, 0); sh.lineTo(3.2, 0); sh.lineTo(0, 1.2); sh.closePath(); const pg = new THREE.ExtrudeGeometry(sh, { depth: 2.8, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3 }); pg.translate(0, 0, -1.4); mk(LUMP(pg, 0.03, 72, 1.4), stone("#E6DCCB"), 0, 4.12, 0, BK); }
  for (const x of [-2.5, -1.75, 1.75, 2.5]) { mk(LUMP(CYL(0.22, 0.25, 3.4, 20), 0.02, 73 + x, 3), stone("#F4ECDD"), x, 1.95, 1.45, BK); }
  mk(rb(6.0, 0.25, 0.9, 0.08), stone("#D9CFC0"), 0, 0.12, 1.55, BK);
  mk(CYL(1.48, 1.48, 0.2, 40), clay("#2A2622", 0.5), 0, 1.75, 1.22, BK).rotation.x = Math.PI / 2;
  // gold inside
  const coins = grp(0, 0, 1.1, BK);
  { const q = mulberry(5); for (let i = 0; i < 9; i++) { const st = 3 + Math.floor(q() * 5); const cx = -0.8 + (i % 3) * 0.8, cy = 0.75 + Math.floor(i / 3) * 0.55; for (let k = 0; k < st; k++) mk(CYL(0.2, 0.2, 0.07, 18), gold, cx + (q() - 0.5) * 0.05, cy + k * 0.075 - 0.2, 0, coins); } }
  coins.rotation.x = Math.PI / 2; coins.rotation.set(0, 0, 0); coins.position.set(0, 0.6, 1.15);
  const doorPiv = grp(-1.3, 1.75, 1.42, BK);
  const door = grp(1.3, 0, 0, doorPiv);
  { const d0 = mk(CYL(1.3, 1.3, 0.34, 48), steel, 0, 0, 0, door); d0.rotation.x = Math.PI / 2;
    const rg = mk(new THREE.TorusGeometry(1.2, 0.07, 10, 48), steel, 0, 0, 0.18, door);
    for (let i = 0; i < 14; i++) { const a = (i / 14) * 6.283; mk(SPH(0.07, 10), gold, Math.cos(a) * 1.05, Math.sin(a) * 1.05, 0.2, door); }
    const wh = grp(0, 0, 0.3, door); mk(new THREE.TorusGeometry(0.42, 0.06, 10, 32), gold, 0, 0, 0, wh); for (let i = 0; i < 3; i++) { const s = mk(rb(0.84, 0.08, 0.08, 0.03), gold, 0, 0, 0, wh); s.rotation.z = (i / 3) * Math.PI; } mk(SPH(0.12, 14), gold, 0, 0, 0.04, wh);
    door.userData.wheel = wh; }
  // flipping sign over the vault
  const SIGNP = grp(0, 3.55, 1.45, BK);
  const signFront = canvasTex(1024, 300, (g, w, h) => { g.fillStyle = "#2F2A26"; rr(g, 0, 0, w, h, 40); g.fill(); claytext(g, "SURGA PAJAK", w / 2, h / 2 + 4, fH, 170, AY, w * 0.88); });
  const signBack = canvasTex(1024, 300, (g, w, h) => { g.fillStyle = "#2E7D3A"; rr(g, 0, 0, w, h, 40); g.fill(); claytext(g, "REFORMASI PAJAK", w / 2, h * 0.42, fH, 130, "#FFF4E2", w * 0.9, "#163E1C"); claytext(g, "2013–2016", w / 2, h * 0.8, fM, 64, "#CDEFC6", w * 0.9, "#163E1C"); });
  mk(rb(3.5, 1.05, 0.16, 0.08), wood("#7A4A26"), 0, 0, 0, SIGNP);
  { const a = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 0.97), new THREE.MeshStandardMaterial({ map: signFront, roughness: 0.6 })); a.position.z = 0.085; SIGNP.add(a); const b = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 0.97), new THREE.MeshStandardMaterial({ map: signBack, roughness: 0.6 })); b.position.z = -0.085; b.rotation.x = Math.PI; SIGNP.add(b); }
  blob(BK, 0, 0.8, 8.5, 5.4);
  const bubMundur = bubble(3.4, 1.7, (g, W, Hh) => { claytext(g, "ATAU SAYA", W / 2, Hh * 0.33, fH, Hh * 0.27, INK, W * 0.84, CREAM); claytext(g, "MUNDUR!", W / 2, Hh * 0.68, fH, Hh * 0.38, AR, W * 0.84); });
  const bubSiapa = bubble(2.6, 1.0, (g, W, Hh) => claytext(g, "SIAPA PUN", W / 2, Hh / 2, fH, Hh * 0.46, FB, W * 0.86, CREAM), false);

  // ======================================================================================
  // CAMERA
  // ======================================================================================
  const s2b = A("s2:Andorra") - 0.2;
  const CAM = [
    // [start, keys]  keys: [t, px,py,pz, lx,ly,lz]
    [0, [[0, 0.7, 3.5, 17.4, 0, 1.7, -0.4], [3.0, 0.3, 3.6, 15.6, 0, 1.7, -0.4], [K.s2 + 0.05, -0.4, 3.8, 14.8, 0, 1.75, -0.4]]],
    [K.s2, [[K.s2 + 0.05, -0.4, 3.8, 14.8, 0, 1.75, -0.4], [s2b + 1.6, -3, 40, 42, 0, 2, -3], [A("s2:Spanyol") + 0.4, -1, 44, 46, 0, 2.5, -2], [K.s3, 1, 46, 47, 0, 2.5, -2]]],
    [K.s3, [[K.s3, 1, 46, 47, 0, 2.5, -2], [A("s3:Uskup") - 0.1, 0, 5.0, 21.5, 0, 1.6, 0.6], [A("s3:siapa"), 1.0, 4.6, 20.0, 0.6, 1.6, 0.6], [K.s4, 1.4, 4.4, 19.4, 0.8, 1.6, 0.6]]],
    [K.s4, [[K.s4, -8.3, 6.2, 12.2, -11, 1.6, 0.0], [A("s4:sepakat"), -8.9, 5.6, 10.6, -11, 1.6, 0.2], [A("s4:Hak") - 0.2, -8.6, 5.8, 11.2, -10.2, 1.6, 0.3], [A("s4:raja") + 0.2, -6.7, 6.4, 16.2, -6.8, 1.7, 0.6], [K.s5, -6.5, 6.6, 17.0, -6.6, 1.7, 0.6]]],
    [K.s5, [[K.s5, 12.8, 5.4, 15.8, 10.2, 1.7, 0.7], [A("s5:suara"), 12.9, 5.2, 15.0, 10.4, 1.6, 0.7], [A("s5:menandatanganinya") - 0.2, 13.4, 4.6, 11.0, 11.7, 1.6, 0.5], [K.s6, 13.5, 4.4, 10.4, 11.8, 1.6, 0.4]]],
    [K.s6, [[K.s6, -6.2, 4.8, 29.5, -6.8, 1.6, 12.2], [A("s6:Raja"), -7.3, 3.8, 30.0, -7.6, 1.3, 12.4], [A("s6:perang") + 0.5, -6.3, 4.4, 29.6, -6.4, 1.4, 12.6], [A("s6:Delapan"), -6.0, 4.6, 28.6, -6.0, 1.5, 12.8], [K.s7, -5.4, 4.8, 28.8, -5.6, 1.5, 13.3]]],
    [K.s7, [[K.s7, 1.4, 4.6, 27.0, 4.4, 2.4, 11.0], [A("s7:mengancam"), 1.6, 4.4, 26.2, 4.2, 2.3, 11.2], [A("s7:mereformasi") - 0.6, 3.0, 4.8, 25.4, 5.6, 2.6, 10.8], [K.s8, 3.2, 5.0, 25.0, 5.7, 2.7, 10.8]]],
    [K.s8, [[K.s8, 3.2, 5.0, 25.0, 5.7, 2.7, 10.8], [K.s8 + 2.8, 6, 24, 40, 2, 2, 4], [A("s8:Menurut"), 3, 34, 44, 1.5, 2, 0.5], [K.dur, 1, 38, 46, 1, 2, -0.5]]],
  ].map(([s, k]) => [s, track(k)]);
  const look = new V3();
  function camAt(t) {
    let f = CAM[0][1]; for (const [s, fn] of CAM) if (t >= s) f = fn;
    const v = f(t); cam.position.set(v[0], v[1], v[2]); look.set(v[3], v[4], v[5]); cam.lookAt(look);
  }

  const tmpC = new THREE.Color();
  // ======================================================================================
  // DRAW
  // ======================================================================================
  return function draw(t) {
    const ts = Math.floor(t * 15 + 1e-6) / 15; // stop-motion clock
    camAt(t);
    const d = cam.position.distanceTo(look);
    const wide = d > 30;
    key.position.copy(look).add(new V3(-16, 26, 18)); key.target.position.copy(look);
    const sh = wide ? 40 : 14;
    Object.assign(key.shadow.camera, { left: -sh, right: sh, top: sh, bottom: -sh, near: 1, far: 120 }); key.shadow.camera.updateProjectionMatrix();
    key.shadow.radius = wide ? 2 : 4;
    bounce.position.copy(look).add(new V3(14, 4, 16)); bounce.target.position.copy(look);
    rim.position.copy(look).add(new V3(4, 14, -22)); rim.target.position.copy(look);

    if (casaFlag) casaFlag.visible = t >= K.s2;
    // flags wave (stepped)
    for (const f of flags) { const p = f.geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = f.base[i * 3]; const u = x / f.w; p.setZ(i, Math.sin(x * 2.2 - ts * 3.2 + f.ph) * 0.12 * u); } p.needsUpdate = true; }
    clouds.forEach((c, i) => { c.position.y += 0; c.rotation.y = Math.sin(ts * 0.3 + i) * 0.08; });

    // hide all people, then place per scene
    for (const P of people) P.G.visible = false;
    borisCrown.visible = false; hopCrown.visible = false; MINI.visible = false; quill.visible = quill2.visible = false;
    for (const b of ballots) b.visible = false;

    // ---------- crowns on thrones (s1..s3, s8) ----------
    const cY = 0.47 + 0.97 + 0.13;
    let lift = 0;
    if (t < K.s3 + 1.2) lift = t < K.s2 ? 0 : smooth((ts - A("s2:dua") + 0.2) / 0.6) * (1 - smooth((ts - K.s3 - 0.4) / 0.8));
    if (t >= K.s8) lift = smooth((ts - A("s8:dua") + 0.3) / 0.7);
    [crownL, crownR].forEach((c, i) => {
      const sg = i ? 1 : -1; const x = sg * 1.75;
      let hop = 0;
      if (t < K.s2) { // hook: crowns hop on the words
        const a1 = i ? A("s1:Prancis") - 0.1 : A("s1:kepala") - 0.1;
        const u = clamp01((ts - a1) / 0.5); hop = Math.sin(u * Math.PI) * 0.7;
        if (i === 1) { const u2 = clamp01((ts - A("s1:presiden") + 0.05) / 0.45); hop += Math.sin(u2 * Math.PI) * 0.35; }
      }
      const big = 1 + lift * (wide ? 3.2 : 1.2);
      c.visible = true;
      c.position.set(x * (1 + lift * 0.6), cY + hop + lift * (wide ? 6.5 : 2.6), -0.4);
      c.rotation.set(0, ts * 0.8 * lift + sg * 0.3, sg * 0.05 * Math.sin(ts * 2));
      const sq = hop > 0 ? 1 + hop * 0.25 : 1; c.scale.set(1.15 * big / Math.sqrt(sq), 1.15 * big * sq, 1.15 * big / Math.sqrt(sq));
    });
    // banners: bishop banner swings in at "kepala", French banner at "presiden"
    {
      const kL = t < K.s2 ? clamp01((ts - A("s1:kepala") + 0.3) / 0.35) : 1, kR = t < K.s2 ? clamp01((ts - A("s1:presiden") + 0.2) / 0.35) : 1;
      squash(banL.m, kL, 1); squash(banR.m, kR, 1);
      banL.m.rotation.y = Math.sin(ts * 1.6) * 0.06; banR.m.rotation.y = Math.sin(ts * 1.6 + 1) * 0.06;
    }
    // Andorra sign pop (s2)
    andorraSign.scale.setScalar(t >= K.s2 && t < K.s3 ? 1 + 0.25 * Math.sin(clamp01((ts - A("s2:Andorra")) / 0.5) * Math.PI) : 1);

    // ---------- s3 + s8: the two princes at the plaza ----------
    if ((t >= K.s3 && t < K.s4) || t >= K.s8) {
      if (t < K.s4) {
        path(bishop, ts, -8.5, 2.4, -2.8, 2.3, A("s3:Uskup") - 1.6, A("s3:Uskup") + 0.2);
        path(pres, ts, 8.5, 2.4, 2.8, 2.3, A("s3:Presiden") - 1.6, A("s3:Presiden") + 0.2);
        if (ts > A("s3:Uskup") + 0.2) { bishop.G.rotation.y = 0.25; bishop.arms[1].sh.rotation.z = 0.5 + 0.15 * Math.sin(ts * 6); }
        if (ts > A("s3:Presiden") + 0.2) { pres.G.rotation.y = -0.25; }
        // "siapa pun yang sedang menjabat": the president changes hair three times (any office holder)
        const u = (ts - A("s3:siapa")) / (A("s3:menjabat") + 0.4 - A("s3:siapa"));
        const hk = u > 0 && u < 1 ? Math.floor(u * 4) % 4 : 0;
        if (presHair) presHair.material = clay(HAIRC[hk], 0.65);
        if (u > 0 && u < 1) pres.G.scale.setScalar(pres.s * (1 + 0.06 * Math.sin(u * 25)));
        bill(bubSiapa, win(t, A("s3:siapa") - 0.1, K.s4 - 0.3, 0.3, 0.3)); bubSiapa.position.set(2.2, 3.9, 2.6);
      } else {
        stand(bishop, ts, -3.2, 1.9, 0.25); stand(pres, ts, 3.2, 1.9, -0.25);
        if (presHair) presHair.material = clay(HAIRC[0], 0.65);
        const w = ts > A("s8:AUDIRA") - 0.5 ? 1 : 0; bishop.arms[1].sh.rotation.z = 0.4 + w * 1.6 + 0.2 * Math.sin(ts * 8) * w; pres.arms[0].sh.rotation.z = -0.4 - w * 1.6 - 0.2 * Math.sin(ts * 8 + 1) * w;
        bubSiapa.visible = false;
      }
    } else bubSiapa.visible = false;
    if (t < K.s3 || t >= K.s4) { if (presHair && t < K.s8) presHair.material = clay(HAIRC[0], 0.65); }

    // ---------- s4: scroll, tug, relay ----------
    {
      const on = t >= K.s4 - 0.05 && t < K.s5;
      SC.visible = true;
      const un = on ? smooth((ts - A("s4:1278") + 0.3) / 0.9) : 1;
      sheet.scale.set(Math.max(0.02, un), 1, 1); rollers[0].position.x = -1.65 * un - 0.02; rollers[1].position.x = 1.65 * un + 0.02;
      seals[0].visible = seals[1].visible = false;
      if (on) {
        squash(seals[0], (ts - A("s4:sepakat")) / 0.3, 1); squash(seals[1], (ts - A("s4:sepakat") - 0.25) / 0.3, 1);
        // bishop and Count Foix tug the little valley, then shake hands
        const tug = ts > A("s4:berebut") - 0.4 && ts < A("s4:sepakat") ? 1 : 0;
        const sw = Math.sin(ts * 9) * 0.35 * tug;
        stand(bishop, ts, -12.7 + sw * 0.25, 1.0, 0.9); stand(foix, ts, -9.3 + sw * 0.25, 1.0, -0.9);
        if (ts >= A("s4:berebut") - 0.4) {
          MINI.visible = ts < A("s4:sepakat") + 0.4;
          MINI.position.set(-11 + sw, 1.75 + Math.abs(sw) * 0.2, 1.15); MINI.rotation.z = sw * 0.5;
          if (tug) { bishop.arms.forEach((a) => { a.sh.rotation.x = -1.1; a.el.rotation.x = -0.2; }); foix.arms.forEach((a) => { a.sh.rotation.x = -1.1; a.el.rotation.x = -0.2; }); bishop.torso.rotation.z = -sw * 0.15; foix.torso.rotation.z = -sw * 0.15; }
          if (ts >= A("s4:sepakat")) { // handshake over the scroll
            const hs = Math.sin(ts * 14) * 0.08;
            bishop.arms[0].sh.rotation.set(-1.25 + hs, 0, 0.35); foix.arms[1].sh.rotation.set(-1.25 + hs, 0, -0.35);
            bishop.sm.scale.set(1.2, 1.2, 1); foix.sm.scale.set(1.2, 1.2, 1);
          }
        }
        // relay: king and president pop up, crown hops
        const tk = A("s4:raja") - 0.25, tp = A("s4:presiden") - 0.25;
        if (ts >= tk) { stand(king, ts, -6.5, 1.0, -0.15); const y = squash(king.G, (ts - tk) / 0.4, king.s); }
        if (ts >= tp) { stand(pres, ts, -4.0, 1.0, -0.3); squash(pres.G, (ts - tp) / 0.4, pres.s); }
        if (ts >= A("s4:Hak") - 0.2) {
          hopCrown.visible = true;
          const headY = (P) => 1.4 * P.s + 1.0 * P.s + 0.86 * P.s;
          const PTS = [[-9.3, headY(foix) + 0.25, 1.0], [-6.5, headY(king) + 0.12, 1.0], [-4.0, headY(pres) + 0.55, 1.0]];
          let p = PTS[0], arc = 0;
          const h1 = clamp01((ts - tk - 0.1) / 0.6), h2 = clamp01((ts - tp - 0.1) / 0.6);
          if (h2 > 0) { p = PTS[1].map((v, j) => v + (PTS[2][j] - v) * h2); arc = Math.sin(h2 * Math.PI) * 1.2; }
          else if (h1 > 0) { p = PTS[0].map((v, j) => v + (PTS[1][j] - v) * h1); arc = Math.sin(h1 * Math.PI) * 1.2; }
          hopCrown.position.set(p[0], p[1] + arc + (h2 >= 1 ? 0.08 * Math.sin(ts * 4) : 0), p[2]);
          hopCrown.rotation.y = ts * 1.5; const ap = squash(hopCrown, (ts - A("s4:Hak") + 0.2) / 0.35, 0.9);
          const nb = Math.floor(14 * Math.min(1, h1 * 0.5 + h2 * 0.5));
          beads.forEach((b, i) => { b.visible = i < nb; });
        } else beads.forEach((b) => (b.visible = false));
      } else beads.forEach((b) => (b.visible = false));
    }

    // ---------- s5: referendum + constitution ----------
    {
      const on = t >= K.s5 - 0.05 && t < K.s6;
      BOOK.visible = t >= K.s5 - 0.05;
      if (on) squash(BOOK, (ts - A("s5:konstitusi") + 0.3) / 0.4, 1); else BOOK.scale.setScalar(1);
      const sA = A("s5:menandatanganinya"), sB = A("s5:Presiden");
      const p0 = on ? clamp01((ts - sA - 0.2) / 1.0) : t >= K.s6 ? 1 : 0, p1 = on ? clamp01((ts - sB) / 1.0) : t >= K.s6 ? 1 : 0;
      sigs[0].m.geometry.setDrawRange(0, Math.floor(sigs[0].n * p0 / 3) * 3); sigs[1].m.geometry.setDrawRange(0, Math.floor(sigs[1].n * p1 / 3) * 3);
      sigs[0].m.visible = p0 > 0; sigs[1].m.visible = p1 > 0;
      if (on) {
        // villagers queue and vote one after another
        const v0 = A("s5:Rakyatnya") - 0.2, v1 = A("s5:suara") + 0.4, step = (v1 - v0) / CIT.length;
        CIT.forEach((P, i) => {
          const tv = v0 + i * step; // moment this villager drops the ballot
          const slot = i - clamp01((ts - v0) / (v1 - v0)) * CIT.length; // queue position shrinks
          const qx = 7.2 - Math.max(0, i - Math.max(0, (ts - v0) / step)) * 0.95, qz = 2.3 + Math.max(0, i - Math.max(0, (ts - v0) / step)) * 0.25;
          const done = ts > tv + 0.6;
          const x = done ? 7.0 - (ts - tv - 0.6) * 1.8 : qx, z = done ? 3.2 + (ts - tv - 0.6) * 0.9 : qz;
          stand(P, ts, x, z, done ? -1.9 : 1.2);
          if (done) walk(P, ts * 9, 1);
          const b = ballots[i], u = clamp01((ts - tv) / 0.5);
          if (ts > tv - 0.35 && u < 1) {
            b.visible = true; P.arms[1].sh.rotation.x = -1.3; P.arms[1].el.rotation.x = -0.1;
            const sx = qx + 0.5, sy = 1.9 * P.s / 0.66, sz = qz;
            b.position.set(sx + (8.3 - sx) * u, sy + (2.05 - sy) * u + Math.sin(u * Math.PI) * 0.7, sz + (0.9 - sz) * u); b.rotation.set(0, 1.2, u * 3);
          }
        });
        // princes at the lectern
        stand(bishop, ts, 10.4, 1.4, 0.55); stand(pres, ts, 13.0, 1.4, -0.55);
        if (ts > sA - 0.2 && ts < sA + 1.4) { bishop.arms[1].sh.rotation.set(-1.0, 0, 0.1); quill.visible = true; bishop.arms[1].hand.getWorldPosition(quill.position); quill.rotation.set(-0.5, 0, -0.6 + 0.2 * Math.sin(ts * 20)); }
        if (ts > sB - 0.2 && ts < sB + 1.4) { pres.arms[0].sh.rotation.set(-1.0, 0, -0.1); quill2.visible = true; pres.arms[0].hand.getWorldPosition(quill2.position); quill2.rotation.set(-0.5, 0, 0.6 + 0.2 * Math.sin(ts * 20)); }
      }
    }

    // ---------- s6: Boris I ----------
    {
      const on = t >= K.s6 - 0.05 && t < K.s7;
      const tA = A("s6:ditangkap");
      // calendar 12 > 20 JULI 1934 over "Delapan hari kemudian"
      let day = 12;
      if (t >= K.s6) day = 12 + Math.floor(8 * clamp01((ts - A("s6:Delapan") + 0.1) / (A("s6:kemudian") + 0.5 - A("s6:Delapan"))) + 1e-6);
      if (day !== calDay) { calDay = day; paintCal(day); }
      if (on) {
        const tCrown = A("s6:menobatkan");
        const off = ts > tA ? 1 : 0;
        // Boris on the crate, then down and led away
        if (!off) {
          stand(boris, ts, -7.6, 12.4, 0.35, 0.95);
          if (ts > A("s6:perang") - 0.2) { boris.arms[1].sh.rotation.set(-1.5 - 0.2 * Math.sin(ts * 12), 0, 0.3); boris.arms[1].el.rotation.x = -0.1; boris.G.rotation.y = 0.9; }
          else if (ts > A("s6:Raja") - 0.2) { boris.arms[0].sh.rotation.z = -2.2; boris.arms[1].sh.rotation.z = 2.2; boris.G.position.y += Math.abs(Math.sin(ts * 7)) * 0.12; }
          // crown: drops onto his head at "menobatkan"
          borisCrown.visible = ts > tCrown - 0.6;
          const u = clamp01((ts - tCrown + 0.6) / 0.6);
          const hy = 0.95 + (1.4 + 1.0 + 0.82) * boris.s * boris.G.scale.y / boris.s;
          tmpV.set(0, 0, 0); boris.head.getWorldPosition(tmpV);
          borisCrown.position.set(tmpV.x, tmpV.y + 0.74 * boris.s + (1 - eout(u)) * 2.5 + (u < 1 ? 0 : 0), tmpV.z); borisCrown.rotation.set(0.12, boris.G.rotation.y, -0.18);
          const sq = u >= 1 ? 1 + 0.15 * Math.max(0, Math.sin((ts - tCrown) * 18) * Math.exp(-(ts - tCrown) * 5)) : 1;
          borisCrown.scale.set(1.8 / Math.sqrt(sq), 1.8 * (2 - sq), 1.8 / Math.sqrt(sq));
        } else {
          const u = path(boris, ts, -6.8, 12.9, -3.0, 18.5, tA + 0.35, K.s7 + 0.4);
          if (ts < tA + 0.35) { stand(boris, ts, -6.8, 12.9, 0.6, 0.95 * (1 - clamp01((ts - tA) / 0.3))); boris.G.position.x = -7.6 + 0.8 * clamp01((ts - tA) / 0.3); }
          boris.arms[1].sh.rotation.set(-0.6, 0, 0.6); boris.eyes.forEach((e) => e.scale.set(1, 0.4, 1)); boris.sm.rotation.z = 0; boris.sm.position.y = 0.3;
          // crown tumbles off and rolls
          borisCrown.visible = true;
          const f = clamp01((ts - tA) / 0.7);
          borisCrown.position.set(-7.4 - f * 1.6, 0.95 + 2.6 * (1 - f) * (1 - f) + Math.abs(Math.sin(f * 7)) * 0.3 * (1 - f), 12.6 + f * 1.2);
          borisCrown.rotation.set(f * 1.4, f * 2, 1.2 * f);
          borisCrown.scale.setScalar(1.8);
        }
        if (off) boris.sm.rotation.z = 0; else { boris.sm.rotation.z = Math.PI; boris.sm.position.y = 0.36; }
        // the bishop, surprised
        stand(bishop, ts, -3.7, 12.9, -1.2);
        if (ts > A("s6:perang") && ts < A("s6:Delapan") + 0.5) { bishop.eyes.forEach((e) => e.scale.set(1.5, 1.5, 1.5)); bishop.torso.rotation.x = -0.15; bishop.arms[1].sh.rotation.set(-0.6, 0, 1.4); }
        // tiny police: walks in, takes Boris away
        if (ts > A("s6:Delapan") - 0.2) {
          if (ts < tA + 0.35) path(police, ts, 0.4, 15.6, -6.1, 13.3, A("s6:Delapan") - 0.2, tA);
          else { path(police, ts, -6.1, 13.3, -2.3, 18.9, tA + 0.35, K.s7 + 0.4); police.arms[0].sh.rotation.set(-0.5, 0, -0.6); }
          if (ts >= tA && ts < tA + 0.35) { police.G.rotation.y = -1.2; police.arms[0].sh.rotation.set(-1.4, 0, 0); }
        }
        bill(bubPerang, win(t, A("s6:perang") - 0.1, A("s6:Delapan") - 0.1, 0.25, 0.3)); bubPerang.scale.multiplyScalar(0.75); bubPerang.position.set(-5.4, 2.05, 13.7);
      } else { bubPerang.visible = false; }
    }

    // ---------- s7: vault ----------
    {
      const on = t >= K.s7 - 0.05 && t < K.s8 + 3;
      const open = on ? smooth((ts - A("s7:surga") + 0.4) / 0.7) * (1 - smooth((ts - A("s7:mereformasi") + 0.2) / 0.6)) : 0;
      doorPiv.rotation.y = -1.25 * open; door.userData.wheel.rotation.z = ts * 2 * (open > 0 && open < 1 ? 1 : 0) + open * 3;
      vaultGlow.intensity = open * 14; BK.localToWorld(vaultGlow.position.set(0, 1.8, 2.2));
      coins.visible = open > 0.02;
      const fl = on ? smooth((ts - A("s7:mereformasi") + 0.1) / 0.6) : t >= K.s8 ? 1 : 0;
      SIGNP.rotation.x = fl * Math.PI * 2 - (fl > 0 ? 0 : 0); SIGNP.rotation.x = fl * Math.PI;
      SIGNP.scale.setScalar(1 + 0.12 * Math.sin(fl * Math.PI));
      if (t >= K.s7 && t < K.s8) {
        stand(pres, ts, 3.3, 13.0, 0.55);
        const th = A("s7:mengancam");
        if (ts > th - 0.2 && ts < A("s7:Beberapa")) { pres.arms[1].sh.rotation.set(-1.4, 0, 0.5); pres.arms[1].el.rotation.x = -0.1; pres.arms[0].sh.rotation.set(0, 0, -0.9); pres.G.rotation.y = 0.9; }
        if (ts > A("s7:mundur") - 0.1 && ts < A("s7:mundur") + 0.6) { pres.G.position.x -= 0.4 * Math.sin(clamp01((ts - A("s7:mundur") + 0.1) / 0.7) * Math.PI); pres.G.position.y += 0.25 * Math.sin(clamp01((ts - A("s7:mundur") + 0.1) / 0.5) * Math.PI); }
        if (ts > A("s7:mereformasi") + 0.3) { pres.arms[0].sh.rotation.z = -2.4; pres.arms[1].sh.rotation.z = 2.4; pres.sm.scale.set(1.3, 1.3, 1); }
        bill(bubMundur, win(t, th - 0.1, A("s7:Beberapa") - 0.2, 0.3, 0.3), 0.72); bubMundur.position.set(3.7, 3.3, 13.9);
      } else bubMundur.visible = false;
    }
    if (!(t >= K.s7 && t < K.s8)) pres.sm.scale.set(1, 1, 1);
    if (!(t >= K.s4 && t < K.s5)) { bishop.sm.scale.set(1, 1, 1); foix.sm.scale.set(1, 1, 1); }
    if (t < K.s6 || t >= K.s7) { bishop.torso.rotation.x = 0; boris.sm.rotation.z = Math.PI; boris.sm.position.y = 0.36; }

    comp.render();
  };
}
