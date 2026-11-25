// EP32 FELTCRAFT: 24 rabbits that overran Australia (1859). A needle-felt tabletop: a patchwork felt map of Australia
// (states sewn as felt patches, blanket stitch on the coast) on a quilted blue ocean, and beside it an embroidery hoop
// holding Barwon Park (Victoria) as a zoomed-in diorama, joined to a red-headed sewing pin at Victoria by red yarn.
//   s1 hook: 24 felt rabbits burst from a crate in the hoop; the camera pulls out while a rabbit carpet floods the map
//   s2 rewind to October 1859: map clear, pin at Victoria, Thomas Austin (felt figure + name tag), a kangaroo (no native rabbits)
//   s3 the crate opens again: 24 rabbits; s4 white pet rabbits join from the house, mixed-coat babies pop up
//   s5 the carpet spreads from Victoria across the south-east and the continent
//   s6 damage in the hoop: grass eaten, ringbarked young tree, eroded bare patches; then WA: the 1901 fence is sewn
//      by a needle as a stitched line; the carpet crosses it anyway
//   s7 1950 myxoma: purple felt virus balls drop, the carpet thins to about 1/6 then regrows; DNA yarn helix from the crate
//   s8 a felt emu on Western Australia (EP02 callback), final pull-back with the woven AUDIRA label on the quilt.
// Puppets pose on twos (12/s); the camera moves at full rate. Everything is a pure function of t.

const FONTS = ['800 80px "Fraunces"', 'italic 800 80px "Fraunces"', '700 80px "Courier Prime"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "AUDIRA VICTORIA 1859"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* fallback */ }
}

import * as THREE from "./three.module.js";
import { mulberry, clamp01, smooth, eout, back, canvasTex, stage } from "./lib3d.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { GEO } from "./geo.js";

const HEAD = '"Fraunces", Georgia, serif', MONO = '"Courier Prime", "Courier New", monospace';
const INK = "#4A2E1E", RUST = "#B5532F", CREAM = "#FFF6E3";

// ---------- projection: 1 unit = 1 degree latitude, longitude scaled by cos(26 deg) ----------
const proj = (lon, lat) => [(lon - 133.5) * 0.9, -(lat + 26)];
const RINGS = [];
for (const c of GEO) if (c.name === "Australia") for (const r of c.rings) if (r.length > 20) RINGS.push(r.map(([a, b]) => proj(a, b)));
function inPoly(x, z, P) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, zi] = P[i], [xj, zj] = P[j]; if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c; } return c; }
const onLand = (x, z) => RINGS.some((R) => inPoly(x, z, R));
const MX0 = -19, MX1 = 19, MZ0 = -16, MZ1 = 18.5, MW = MX1 - MX0, MH = MZ1 - MZ0;
const TOPY = 0.95; // map top surface
const SRC = proj(144.36, -38.15); // Barwon Park / Geelong
const HX = 8, HZ = 27, HTOP = 0.36; // embroidery hoop centre and felt surface

// monotone Hermite through time keys, never overshoots
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
const two = (t) => Math.floor(t * 12) / 12; // stop-motion on twos

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp } = stage(canvas, { bg: 0xcfd8d6, exp: 0.82, bloom: [0.06, 0.4, 0.94], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.82;
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.25;
  cam.near = 0.2; cam.far = 600; cam.updateProjectionMatrix();
  scene.background = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#AFC3C6"); gr.addColorStop(0.55, "#CBD5CC"); gr.addColorStop(1, "#E3D6BC"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });

  // ---------- cosy light ----------
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x8a7458, 1.05));
  const key = new THREE.DirectionalLight(0xffe4bc, 2.6);
  key.position.set(-30, 60, 40); key.target.position.set(2, 0, 8);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -32, right: 32, top: 34, bottom: -34, near: 10, far: 160 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03; key.shadow.radius = 5;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xffd29a, 0.9); rim.position.set(30, 25, -50); scene.add(rim);
  const warm = new THREE.PointLight(0xffc98a, 18, 18, 1.6); warm.position.set(HX + 2, 4.5, HZ + 3); scene.add(warm);

  // ---------- felt materials ----------
  const fibreTex = canvasTex(512, 512, (g, w) => {
    g.fillStyle = "#d8d8d8"; g.fillRect(0, 0, w, w);
    const q = mulberry(5501);
    for (let i = 0; i < 6000; i++) {
      const x = q() * w, y = q() * w, a = q() * 6.283, l = 4 + q() * 14, v = Math.floor(165 + q() * 90);
      g.strokeStyle = `rgba(${v},${v},${v},${0.35 + q() * 0.4})`; g.lineWidth = 0.6 + q() * 1.1;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.5, y + Math.sin(a + 0.6) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
  }, [2, 2]);
  const fuzzTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d"); const im = g.createImageData(256, 256); const q = mulberry(5517); for (let i = 0; i < im.data.length; i += 4) { const v = Math.pow(q(), 2.2) * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); const tx = new THREE.CanvasTexture(c); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(5, 5); tx.magFilter = THREE.NearestFilter; return tx; })();
  const MC = new Map();
  const felt = (color, rep = 2) => {
    const k = "f" + color + rep; if (MC.has(k)) return MC.get(k);
    const map = fibreTex.clone(); map.repeat.set(rep, rep); map.needsUpdate = true;
    const m = new THREE.MeshPhysicalMaterial({ color, map, roughness: 1, metalness: 0, sheen: 1, sheenRoughness: 0.75, sheenColor: new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.45), bumpMap: map, bumpScale: 1.2 });
    MC.set(k, m); return m;
  };
  const shellM = (color, lv) => { const k = "s" + color + lv; if (MC.has(k)) return MC.get(k); const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.12 + lv * 0.06), alphaMap: fuzzTex, alphaTest: 0.35 + lv * 0.15, roughness: 1, side: THREE.DoubleSide }); MC.set(k, m); return m; };
  const bead = new THREE.MeshPhysicalMaterial({ color: 0x14100e, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.03 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xd9dde2, roughness: 0.22, metalness: 1, envMapIntensity: 2.5 });
  const wood = (c = "#C89A64") => { const k = "w" + c; if (MC.has(k)) return MC.get(k); const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.62, map: canvasTex(256, 256, (g, w) => { g.fillStyle = "#e8e0d4"; g.fillRect(0, 0, w, w); const q = mulberry(91); for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(110,70,30,${0.08 + q() * 0.18})`; g.lineWidth = 1 + q() * 3; const y = q() * w; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + q() * 8 - 4, w * 0.6, y + q() * 8 - 4, w, y + q() * 6 - 3); g.stroke(); } }) }); MC.set(k, m); return m; };
  const SPH = new THREE.SphereGeometry(1, 28, 20), SPHL = new THREE.SphereGeometry(1, 12, 9), CYL = new THREE.CylinderGeometry(1, 1, 1, 18), CONE = new THREE.ConeGeometry(1, 1, 14);
  const mesh = (geo, mat, p, x = 0, y = 0, z = 0, sh = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = sh; m.receiveShadow = true; (p || scene).add(m); return m; };
  // needle-felt part: base + fuzz shells
  function fuzzy(geo, color, p, shells = 2, sp = 0.06) {
    const G = new THREE.Group(); (p || scene).add(G);
    const b = new THREE.Mesh(geo, felt(color, 1.5)); b.castShadow = b.receiveShadow = true; G.add(b);
    for (let i = 0; i < shells; i++) { const s = new THREE.Mesh(geo, shellM(color, i)); s.scale.setScalar(1 + (i + 1) * sp); G.add(s); }
    return G;
  }
  const blob = (p, rad, op = 0.35) => { const m = new THREE.Mesh(new THREE.CircleGeometry(rad, 24), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, opacity: op, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.renderOrder = 2; p.add(m); return m; };
  const blobTex = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(40,22,8,.9)"); gr.addColorStop(0.55, "rgba(40,22,8,.35)"); gr.addColorStop(1, "rgba(40,22,8,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });

  // ---------- labels (felt tags) ----------
  function tagTex(lines, opt = {}) {
    const w = opt.w || 1024, h = opt.h || 300;
    return canvasTex(w, h, (g) => {
      const bg = opt.bg || CREAM, fg = opt.fg || INK, bd = opt.bd || RUST, R = h * 0.16;
      g.fillStyle = "rgba(40,20,8,.28)"; rr(g, 10, 16, w - 16, h - 20, R); g.fill();
      g.fillStyle = bg; rr(g, 4, 4, w - 16, h - 20, R); g.fill();
      const q = mulberry(w + h); for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "255,255,255" : "60,30,10"},${0.04 + q() * 0.05})`; g.fillRect(8 + q() * (w - 24), 8 + q() * (h - 28), 1 + q() * 3, 1); }
      g.setLineDash([h * 0.07, h * 0.05]); g.lineWidth = h * 0.025; g.strokeStyle = bd; rr(g, 4 + h * 0.07, 4 + h * 0.07, w - 16 - h * 0.14, h - 20 - h * 0.14, R * 0.6); g.stroke(); g.setLineDash([]);
      g.textAlign = "center"; g.textBaseline = "middle";
      lines.forEach(([s, size, font, col], i) => { g.font = `${font || "800"} ${size * h}px ${font && font.includes("700") ? MONO : HEAD}`; g.fillStyle = col || fg; const y = (h - 16) * (lines.length === 1 ? 0.52 : (i + 0.75) / (lines.length + 0.5)); let sz = size * h; while (g.measureText(s).width > w - 90 && sz > 10) { sz -= 2; g.font = `${font || "800"} ${sz}px ${font && font.includes("700") ? MONO : HEAD}`; } g.fillText(s, w / 2 - 6, y); });
    });
  }
  function rr(g, x, y, w, h, R) { g.beginPath(); g.moveTo(x + R, y); g.arcTo(x + w, y, x + w, y + h, R); g.arcTo(x + w, y + h, x, y + h, R); g.arcTo(x, y + h, x, y, R); g.arcTo(x, y, x + w, y, R); g.closePath(); }
  function tag(lines, wU, opt = {}) {
    const tx = tagTex(lines, opt), asp = (opt.h || 300) / (opt.w || 1024);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(wU, wU * asp), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, toneMapped: false }));
    m.renderOrder = 8; m.visible = false; scene.add(m); return m;
  }
  const showTag = (m, k, x, y, z, s = 1) => { m.visible = k > 0.003; if (!m.visible) return; m.position.set(x, y, z); m.quaternion.copy(cam.quaternion); m.material.opacity = k; m.scale.setScalar(Math.max(0.001, s * (0.6 + 0.4 * back(k)))); };

  // ---------- table: quilted ocean, backdrop, pompom clouds, button sun ----------
  const quiltT = canvasTex(512, 512, (g, w) => {
    g.fillStyle = "#cfdfe6"; g.fillRect(0, 0, w, w);
    const q = mulberry(21); for (let i = 0; i < 5000; i++) { const v = q() < 0.5 ? 255 : 90; g.strokeStyle = `rgba(${v},${v},${v},${0.08 + q() * 0.1})`; g.lineWidth = 1; const x = q() * w, y = q() * w, a = q() * 6.28; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9); g.stroke(); }
    g.strokeStyle = "rgba(60,90,110,.35)"; g.lineWidth = 6; for (let k = -w; k < 2 * w; k += w / 2) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + w, w); g.stroke(); g.beginPath(); g.moveTo(k + w, 0); g.lineTo(k, w); g.stroke(); }
    g.strokeStyle = "rgba(255,248,230,.75)"; g.lineWidth = 3; g.setLineDash([14, 10]); for (let k = -w; k < 2 * w; k += w / 2) { g.beginPath(); g.moveTo(k + 6, 0); g.lineTo(k + w + 6, w); g.stroke(); g.beginPath(); g.moveTo(k + w + 6, 0); g.lineTo(k + 6, w); g.stroke(); }
  }, [68, 68]);
  const quiltM = new THREE.MeshPhysicalMaterial({ color: "#7FAFC4", map: quiltT, roughness: 1, sheen: 1, sheenRoughness: 0.7, sheenColor: new THREE.Color("#d8ecf5"), bumpMap: quiltT, bumpScale: 2 });
  const quilt = mesh(new THREE.PlaneGeometry(420, 420), quiltM, scene, 0, 0, 10, false); quilt.rotation.x = -Math.PI / 2;
  const wall = mesh(new THREE.PlaneGeometry(520, 160), felt("#9DB3B8", 30), scene, 0, 60, -150, false);
  wall.material = wall.material.clone(); wall.material.color.set("#93AAB0");
  const threadM = new THREE.MeshBasicMaterial({ color: 0xf3ead8 });
  [[-40, 44, -120, 7], [30, 52, -126, 8], [-4, 60, -134, 7.5], [64, 40, -116, 6], [-74, 50, -124, 6.5]].forEach(([x, y, z, s], i) => {
    const G = new THREE.Group(); G.position.set(x, y, z); scene.add(G);
    [[0, 0, 0, 1], [1.1, -0.2, 0.2, 0.8], [-1.0, -0.3, 0.1, 0.75], [0.4, 0.5, -0.3, 0.7]].forEach(([a, b, c, k]) => fuzzy(SPH, "#EFE9DF", G, 2, 0.05).position.set(a * s, b * s, c * s) || 0);
    G.children.forEach((c, j) => c.scale.setScalar(s * [1, 0.8, 0.75, 0.7][j]));
    mesh(new THREE.CylinderGeometry(0.04, 0.04, 40, 4), threadM, G, 0, 20, 0, false);
  });
  { // button sun: felt disc with four holes and a cross stitch
    const G = new THREE.Group(); G.position.set(-24, 66, -140); G.scale.setScalar(2.2); scene.add(G);
    const d = mesh(new THREE.CylinderGeometry(5, 5, 0.8, 48), felt("#F2B53B", 3), G); d.rotation.x = Math.PI / 2;
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const h = mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.9, 16), felt("#B07A1E"), G, a * 1.1, b * 1.1, 0.05); h.rotation.x = Math.PI / 2; }
    for (const s of [1, -1]) { const st = mesh(new THREE.CylinderGeometry(0.16, 0.16, 3.4, 8), felt("#FFF6E3"), G, 0, 0, 0.5); st.rotation.z = s * Math.PI / 4; }
    mesh(new THREE.CylinderGeometry(0.04, 0.04, 40, 4), threadM, G, 0, 22, 0, false);
  }

  // ---------- patchwork felt map ----------
  const STATES = [
    ["#D9A45B", [[100, 0], [129, 0], [129, -50], [100, -50]]],
    ["#C9774A", [[129, 0], [138, 0], [138, -26], [129, -26]]],
    ["#E0BE6A", [[129, -26], [141, -26], [141, -50], [129, -50]]],
    ["#9DB76E", [[138, 0], [160, 0], [160, -28.2], [153.5, -28.2], [150, -28.6], [149, -29], [141, -29], [141, -26], [138, -26]]],
    ["#7FA35E", [[141, -29], [149, -29], [150, -28.6], [153.5, -28.2], [160, -28.2], [160, -37.5], [150, -37.5], [148, -36.8], [147, -36], [144, -35.9], [143, -35], [141, -34]]],
    ["#B4C77E", [[141, -34], [143, -35], [144, -35.9], [147, -36], [148, -36.8], [150, -37.5], [160, -37.5], [160, -39.9], [141, -39.9]]],
    ["#6E9C5A", [[140, -39.9], [150, -39.9], [150, -45], [140, -45]]],
  ];
  const BORDERS = [[[129, -14.5], [129, -31.8]], [[129, -26], [141, -26]], [[138, -16], [138, -26]], [[141, -26], [141, -38.1]], [[141, -29], [149, -29], [150, -28.6], [153.5, -28.2]], [[141, -34], [143, -35], [144, -35.9], [147, -36], [148, -36.8], [150, -37.5]]];
  const CWm = 2048, CHm = Math.round((CWm * MH) / MW);
  const P2 = (x, z) => [((x - MX0) / MW) * CWm, ((z - MZ0) / MH) * CHm];
  const ringPath = (g, R) => { g.beginPath(); R.forEach(([x, z], i) => { const [px, py] = P2(x, z); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); };
  const mapT = canvasTex(CWm, CHm, (g, w, h) => {
    g.fillStyle = "#C9A66B"; g.fillRect(0, 0, w, h);
    g.save(); g.beginPath(); for (const R of RINGS) { R.forEach(([x, z], i) => { const [px, py] = P2(x, z); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); } g.clip();
    for (const [col, poly] of STATES) { g.fillStyle = col; g.beginPath(); poly.forEach(([lo, la], i) => { const [px, py] = P2(...proj(lo, la)); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); g.fill(); }
    const q = mulberry(33);
    for (let i = 0; i < 160000; i++) { const v = q() < 0.5 ? "255,250,235" : "70,40,15"; g.strokeStyle = `rgba(${v},${0.05 + q() * 0.07})`; g.lineWidth = 1 + q() * 1.2; const x = q() * w, y = q() * h, a = q() * 6.28, l = 3 + q() * 9; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    // seam shadows + running stitches on borders
    for (const B of BORDERS) {
      const pth = () => { g.beginPath(); B.forEach(([lo, la], i) => { const [px, py] = P2(...proj(lo, la)); i ? g.lineTo(px, py) : g.moveTo(px, py); }); };
      g.setLineDash([]); g.strokeStyle = "rgba(60,30,10,.35)"; g.lineWidth = 9; pth(); g.stroke();
      g.setLineDash([22, 14]); g.strokeStyle = "rgba(255,246,227,.95)"; g.lineWidth = 6; pth(); g.stroke();
    }
    g.setLineDash([]);
    g.font = `700 46px ${MONO}`; g.fillStyle = "rgba(74,46,30,.55)"; g.textAlign = "center";
    [["AUSTRALIA BARAT", 121.5, -25], ["WILAYAH UTARA", 133.5, -20], ["AUSTRALIA SELATAN", 135, -30], ["QUEENSLAND", 144.5, -22.5], ["NEW SOUTH WALES", 146, -32], ["VICTORIA", 144.3, -36.9]].forEach(([s, lo, la]) => { const [px, py] = P2(...proj(lo, la)); g.fillText(s, px, py); });
    g.restore();
    g.strokeStyle = "rgba(60,30,10,.45)"; g.lineWidth = 10; for (const R of RINGS) { ringPath(g, R); g.stroke(); }
  });
  mapT.repeat.set(1 / MW, 1 / MH); mapT.offset.set(-MX0 / MW, MZ1 / MH); mapT.anisotropy = 16;
  const mapBump = fibreTex.clone(); mapBump.repeat.set(0.35, 0.35); mapBump.needsUpdate = true;
  const mapTop = new THREE.MeshPhysicalMaterial({ map: mapT, roughness: 1, sheen: 1, sheenRoughness: 0.75, sheenColor: new THREE.Color("#fff3dc"), bumpMap: mapBump, bumpScale: 1.4 });
  const mapSide = felt("#B5874E", 0.4);
  for (const R of RINGS) {
    const s = new THREE.Shape(R.map(([x, z]) => new THREE.Vector2(x, -z)));
    const geo = new THREE.ExtrudeGeometry(s, { depth: TOPY - 0.12, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.08, bevelSegments: 2, curveSegments: 3 });
    geo.rotateX(-Math.PI / 2); geo.translate(0, 0.1, 0);
    const m = new THREE.Mesh(geo, [mapTop, mapSide]); m.castShadow = m.receiveShadow = true; scene.add(m);
  }
  // blanket stitch along the coast
  {
    const segs = [];
    for (const R of RINGS) {
      const L = []; let acc = 0;
      for (let i = 0; i < R.length; i++) { const a = R[i], b = R[(i + 1) % R.length]; const d = Math.hypot(b[0] - a[0], b[1] - a[1]); let s = (0.42 - acc); while (s <= d) { const u = s / d; L.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, b[0] - a[0], b[1] - a[1]]); s += 0.42; } acc = (acc + d) % 0.42; }
      segs.push(...L);
    }
    const n = segs.length;
    const v = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.62, 5), felt("#FFF6E3", 1), n);
    const h = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 5), felt("#FFF6E3", 1), n);
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(1, 1, 1);
    segs.forEach(([x, z, dx, dz], i) => {
      const l = Math.hypot(dx, dz) || 1; let nx = dz / l, nz = -dx / l;
      if (onLand(x + nx * 0.15, z + nz * 0.15)) { nx = -nx; nz = -nz; }
      M.compose(new THREE.Vector3(x + nx * 0.07, TOPY - 0.3, z + nz * 0.07), Q.identity(), S); v.setMatrixAt(i, M);
      const yaw = Math.atan2(nx, nz);
      Q.setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)); const Q2 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)).multiply(Q);
      M.compose(new THREE.Vector3(x - nx * 0.1, TOPY + 0.02, z - nz * 0.1), Q2, S); h.setMatrixAt(i, M);
    });
    v.castShadow = h.castShadow = true; scene.add(v, h);
  }

  // ---------- AUDIRA woven labels sewn onto the quilt ----------
  function wovenLabel(x, z, yaw, s) {
    const tx = canvasTex(1024, 300, (g, w, h) => {
      g.fillStyle = "#FBF7EE"; g.fillRect(0, 0, w, h);
      const q = mulberry(7); for (let i = 0; i < h; i += 3) { g.fillStyle = `rgba(150,140,120,${0.06 + q() * 0.06})`; g.fillRect(0, i, w, 1); }
      g.fillStyle = "#0B3D2E"; g.fillRect(0, 0, w, 26); g.fillRect(0, h - 26, w, 26);
      g.font = `800 150px ${HEAD}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#0B3D2E"; g.fillText("AUDIRA", w / 2, h * 0.47);
      g.font = `700 34px ${MONO}`; g.fillStyle = "#3E6B4F"; g.fillText("HANDMADE STORY · EP 32", w / 2, h * 0.82);
      g.setLineDash([16, 10]); g.strokeStyle = RUST; g.lineWidth = 6; g.beginPath(); g.moveTo(40, 30); g.lineTo(40, h - 30); g.moveTo(w - 40, 30); g.lineTo(w - 40, h - 30); g.stroke();
    });
    const m = mesh(new THREE.BoxGeometry(4 * s, 0.06, 1.17 * s), [felt("#FBF7EE"), felt("#FBF7EE"), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.75 }), felt("#FBF7EE"), felt("#FBF7EE"), felt("#FBF7EE")], scene, x, 0.04, z);
    m.rotation.y = yaw; return m;
  }
  wovenLabel(HX - 6.4, HZ + 5.4, 0.18, 1.0);
  wovenLabel(-9, 21.5, -0.08, 2.1);

  // ---------- Victoria pin + red yarn to the hoop ----------
  const pinG = new THREE.Group(); pinG.position.set(SRC[0], TOPY, SRC[1]); scene.add(pinG);
  mesh(new THREE.CylinderGeometry(0.04, 0.01, 2.2, 8), metal, pinG, 0, 0.9, 0);
  const pinHead = mesh(SPH, new THREE.MeshPhysicalMaterial({ color: 0xd8342b, roughness: 0.15, clearcoat: 1, transmission: 0.0 }), pinG, 0, 2.05, 0); pinHead.scale.setScalar(0.38);
  const yarnM = felt("#C8372E", 3);
  const yarnCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(SRC[0], TOPY + 1.8, SRC[1]), new THREE.Vector3(SRC[0] + 0.2, 1.4, SRC[1] + 5.5), new THREE.Vector3(HX + 1.2, 0.9, HZ - 9), new THREE.Vector3(HX + 0.6, 0.62, HZ - 6.1)]);
  mesh(new THREE.TubeGeometry(yarnCurve, 80, 0.09, 8), yarnM, scene);

  // ---------- embroidery hoop: Barwon Park ----------
  const H = new THREE.Group(); H.position.set(HX, 0, HZ); scene.add(H);
  const hoopFelt = felt("#8DB35F", 2.5);
  mesh(new THREE.CylinderGeometry(6, 6, HTOP, 72), hoopFelt, H, 0, HTOP / 2, 0);
  const ring1 = mesh(new THREE.TorusGeometry(6.05, 0.22, 14, 96), wood("#D2A46C"), H, 0, 0.3, 0); ring1.rotation.x = Math.PI / 2;
  const ring2 = mesh(new THREE.TorusGeometry(6.38, 0.2, 14, 96), wood("#C08E55"), H, 0, 0.32, 0); ring2.rotation.x = Math.PI / 2;
  { const c = new THREE.Group(); c.position.set(6.55, 0.35, 0); H.add(c); mesh(new THREE.BoxGeometry(0.5, 0.5, 0.7), wood("#C08E55"), c); const sc = mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.3, 10), metal, c, 0.35, 0, 0); sc.rotation.z = Math.PI / 2; const kn = mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.25, 16), metal, c, 1.0, 0, 0); kn.rotation.z = Math.PI / 2; }
  // hills with blanket stitch along the crest
  const stitchM = felt("#FFF6E3", 1);
  [[-2.5, -4.0, 3.2, 1.4, 1.4, "#6F9A52"], [2.2, -4.3, 3.6, 1.8, 1.3, "#5E8A4C"], [4.6, -2.6, 1.6, 0.9, 1.0, "#86AE5E"]].forEach(([x, z, a, b, c, col]) => {
    const hm = fuzzy(SPH, col, H, 1, 0.04); hm.position.set(x, HTOP - 0.05, z); hm.scale.set(a, b, c);
    for (let k = -8; k <= 8; k++) { const u = k / 9.2; const st = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 5), stitchM, H, x + u * a, HTOP - 0.05 + b * Math.sqrt(1 - u * u) + 0.02, z + c * 0.15); st.rotation.x = Math.PI / 2 + 0.5; st.rotation.z = -u * 0.9; }
  });
  // homestead
  const house = new THREE.Group(); house.position.set(-2.7, HTOP, -1.9); house.rotation.y = 0.25; H.add(house);
  const wallT = canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#F1E4C8"; g.fillRect(0, 0, w, h); for (const x of [0.2, 0.8]) { g.fillStyle = "#8FB7D0"; g.fillRect(x * w - 40, 60, 80, 80); g.strokeStyle = "#FFF6E3"; g.lineWidth = 6; g.setLineDash([10, 8]); g.strokeRect(x * w - 40, 60, 80, 80); g.beginPath(); g.moveTo(x * w, 60); g.lineTo(x * w, 140); g.moveTo(x * w - 40, 100); g.lineTo(x * w + 40, 100); g.stroke(); g.setLineDash([]); } g.fillStyle = "#7A4E2E"; g.fillRect(w / 2 - 38, 110, 76, 146); g.fillStyle = "#F2B53B"; g.beginPath(); g.arc(w / 2 + 22, 190, 7, 0, 7); g.fill(); });
  const wallM = new THREE.MeshPhysicalMaterial({ color: "#ffffff", map: wallT, roughness: 1, sheen: 1, sheenRoughness: 0.8, sheenColor: new THREE.Color("#fff"), bumpMap: fibreTex, bumpScale: 1 });
  mesh(new THREE.BoxGeometry(2.0, 1.05, 1.4), [felt("#EADBBB"), felt("#EADBBB"), felt("#EADBBB"), felt("#EADBBB"), wallM, felt("#EADBBB")], house, 0, 0.53, 0);
  for (const s of [-1, 1]) { const rf = mesh(new THREE.BoxGeometry(2.3, 0.12, 0.98), felt("#B5532F", 2), house, 0, 1.3, s * 0.36); rf.rotation.x = s * 0.62; }
  mesh(new THREE.BoxGeometry(1.4, 0.55, 0.05), felt("#EADBBB"), house, 0, 1.25, 0).scale.set(1, 1, 1);
  mesh(new THREE.BoxGeometry(0.25, 0.6, 0.25), felt("#9A6A4A"), house, 0.6, 1.6, -0.15);
  blob(house, 1.6, 0.35).position.y = 0.01;
  // sign: Barwon Park
  const sign = new THREE.Group(); sign.position.set(-0.6, HTOP, -3.0); sign.rotation.y = -0.1; H.add(sign);
  for (const s of [-1, 1]) mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 8), wood("#9A6A3E"), sign, s * 0.75, 0.5, 0);
  const signT = tagTex([["BARWON PARK", 0.36, "800"], ["VICTORIA · 1859", 0.2, "700"]], { w: 1024, h: 380 });
  const sp = mesh(new THREE.PlaneGeometry(1.9, 0.7), new THREE.MeshStandardMaterial({ map: signT, transparent: true, roughness: 0.9 }), sign, 0, 0.95, 0.04);
  mesh(new THREE.BoxGeometry(1.85, 0.62, 0.05), felt("#7A4E2E"), sign, 0, 0.95, 0);
  // gum tree (old) and the young tree that gets ringbarked
  function yarnTrunk(rt, rb, h, col) { const tx = canvasTex(64, 256, (g, w, hh) => { g.fillStyle = "#ddd"; g.fillRect(0, 0, w, hh); for (let y = 0; y < hh; y += 10) { g.fillStyle = "rgba(60,30,10,.35)"; g.fillRect(0, y, w, 3); } }, [3, h * 3]); return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 14), new THREE.MeshPhysicalMaterial({ color: col, map: tx, bumpMap: tx, bumpScale: 2, roughness: 1, sheen: 1, sheenColor: new THREE.Color("#fff3dc") })); }
  { const T = new THREE.Group(); T.position.set(3.0, HTOP, -2.4); H.add(T); const tr = yarnTrunk(0.16, 0.26, 2.0, "#8A6040"); tr.position.y = 1.0; tr.castShadow = true; T.add(tr);
    [[0, 2.4, 0, 0.95], [0.7, 2.1, 0.2, 0.7], [-0.6, 2.2, -0.1, 0.72], [0.1, 2.9, -0.2, 0.65]].forEach(([x, y, z, s]) => { const c = fuzzy(SPH, "#7FA06A", T, 2, 0.05); c.position.set(x, y, z); c.scale.setScalar(s); });
    blob(T, 1.4, 0.3).position.y = 0.01; }
  const YT = new THREE.Group(); YT.position.set(1.7, HTOP, 0.2); H.add(YT);
  const ytTrunk = yarnTrunk(0.08, 0.12, 1.1, "#8A6040"); ytTrunk.position.y = 0.55; ytTrunk.castShadow = true; YT.add(ytTrunk);
  const barkBand = new THREE.Mesh(new THREE.CylinderGeometry(0.128, 0.135, 0.26, 16), felt("#8A6040")); barkBand.position.y = 0.2; YT.add(barkBand);
  const ytCrown = [[0, 1.25, 0, 0.45], [0.25, 1.05, 0.1, 0.32], [-0.24, 1.08, -0.05, 0.32]].map(([x, y, z, s]) => { const c = fuzzy(SPH, "#8FBF5E", YT, 2, 0.05); c.position.set(x, y, z); c.scale.setScalar(s); return c; });
  const crownMats = ytCrown.flatMap((c) => c.children.map((m) => m.material));
  const crownCol0 = new THREE.Color("#8FBF5E"), crownCol1 = new THREE.Color("#9A7B4F");
  // clone materials so recolour does not touch other "#8FBF5E" parts
  ytCrown.forEach((c) => c.children.forEach((m) => { m.material = m.material.clone(); }));
  const leaves = Array.from({ length: 12 }, (_, i) => { const l = mesh(new THREE.CircleGeometry(0.07, 10), felt("#A88A55"), YT, 0, 0, 0); l.material = l.material.clone(); l.material.side = THREE.DoubleSide; l.visible = false; return l; });
  // grass tufts (instanced felt cones)
  const NT = 280, tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(0.07, 0.24, 6), felt("#9CC46A", 1), NT); tufts.castShadow = true; H.add(tufts);
  const TU = []; { const q = mulberry(404); while (TU.length < NT) { const a = q() * 6.283, rr2 = Math.sqrt(q()) * 5.6; const x = Math.cos(a) * rr2, z = Math.sin(a) * rr2; if (Math.hypot(x + 2.7, z + 1.9) < 1.5 || z < -3.0) continue; TU.push([x, z, q() * 6.28, 0.7 + q() * 0.7, q()]); } }
  const tcol = new THREE.Color(); TU.forEach((u, i) => { tcol.set(["#9CC46A", "#86B15A", "#B5D17A"][i % 3]); tufts.setColorAt(i, tcol); });
  // bare patches + erosion gullies
  const frayT = canvasTex(256, 256, (g, w) => { g.fillStyle = "rgba(0,0,0,0)"; g.fillRect(0, 0, w, w); const q = mulberry(9); g.fillStyle = "#fff"; g.beginPath(); for (let i = 0; i <= 40; i++) { const a = (i / 40) * 6.283, rr2 = w * (0.36 + q() * 0.1); i ? g.lineTo(w / 2 + Math.cos(a) * rr2, w / 2 + Math.sin(a) * rr2) : g.moveTo(w / 2 + Math.cos(a) * rr2, w / 2 + Math.sin(a) * rr2); } g.fill(); g.strokeStyle = "rgba(255,255,255,.8)"; for (let i = 0; i < 160; i++) { const a = q() * 6.283, r0 = w * 0.38; g.lineWidth = 1.5; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * r0, w / 2 + Math.sin(a) * r0); g.lineTo(w / 2 + Math.cos(a) * (r0 + 6 + q() * 14), w / 2 + Math.sin(a) * (r0 + 6 + q() * 14)); g.stroke(); } });
  const patchMat = new THREE.MeshStandardMaterial({ color: "#8A6A48", map: fibreTex, alphaMap: frayT, transparent: true, roughness: 1, depthWrite: false });
  const PAT = [[-0.6, 2.4, 1.3], [2.6, 2.1, 1.0], [0.4, -1.0, 1.1], [-3.6, 1.2, 0.9], [3.8, -0.4, 0.8], [-1.9, 4.0, 0.8]].map(([x, z, s]) => { const m = mesh(new THREE.CircleGeometry(s, 24), patchMat, H, x, HTOP + 0.012, z, false); m.rotation.x = -Math.PI / 2; m.visible = false; return m; });
  const gullyT = canvasTex(512, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "#fff"; g.lineCap = "round"; for (let k = 0; k < 3; k++) { g.lineWidth = 14 - k * 4; g.beginPath(); for (let x = 0; x <= w; x += 8) { const y = h / 2 + Math.sin(x * 0.025 + k) * 22 + (k - 1) * 18; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } });
  const gullyM = new THREE.MeshStandardMaterial({ color: "#5A3A22", alphaMap: gullyT, transparent: true, roughness: 1, depthWrite: false });
  const GUL = [[0.0, 3.2, 3.4, 0.3], [-2.6, 2.6, 2.4, -0.5], [2.8, 3.0, 2.2, 0.6]].map(([x, z, l, yaw]) => { const m = mesh(new THREE.PlaneGeometry(l, l / 4), gullyM, H, x, HTOP + 0.02, z, false); m.rotation.set(-Math.PI / 2, 0, yaw); m.visible = false; m.renderOrder = 3; return m; });

  // crate with a hinged lid
  const crate = new THREE.Group(); crate.position.set(0.25, HTOP, 1.25); crate.rotation.y = -0.3; H.add(crate);
  const plankT = canvasTex(512, 384, (g, w, h) => { g.fillStyle = "#C9995F"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 96) { g.fillStyle = "rgba(80,45,15,.45)"; g.fillRect(0, y, w, 6); } const q = mulberry(5); for (let i = 0; i < 120; i++) { g.strokeStyle = `rgba(90,55,20,${0.1 + q() * 0.15})`; g.lineWidth = 2; const y = q() * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + q() * 6 - 3); g.stroke(); } g.font = `700 48px ${MONO}`; g.fillStyle = "rgba(120,30,20,.85)"; g.textAlign = "center"; g.fillText("INGGRIS → VICTORIA", w / 2, h * 0.45); g.font = `700 64px ${MONO}`; g.fillText("1859", w / 2, h * 0.68); });
  const plankM = new THREE.MeshStandardMaterial({ map: plankT, roughness: 0.7 });
  const plainPlank = wood("#C9995F");
  mesh(new THREE.BoxGeometry(1.1, 0.62, 0.8), [plainPlank, plainPlank, plainPlank, plainPlank, plankM, plainPlank], crate, 0, 0.31, 0);
  const lidP = new THREE.Group(); lidP.position.set(0, 0.63, -0.4); crate.add(lidP);
  mesh(new THREE.BoxGeometry(1.16, 0.08, 0.84), plainPlank, lidP, 0, 0.04, 0.42);
  blob(crate, 1.0, 0.4).position.y = 0.01;

  // ---------- Thomas Austin (felt figure) ----------
  function person() {
    const G = new THREE.Group();
    const coat = "#6B4A32", trou = "#3C3A44", skin = "#E8B48C";
    const P = (x, y, z, p = G) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
    const part = (geo, col, p, x, y, z, sx, sy, sz, fz = true) => { const m = fz ? fuzzy(geo, col, p, 1, 0.04) : mesh(geo, felt(col), p); m.position.set(x, y, z); m.scale.set(sx, sy, sz); return m; };
    part(CYL, trou, G, 0, 0.8, 0, 0.21, 0.16, 0.17);
    part(CYL, coat, G, 0, 1.14, 0, 0.33, 0.56, 0.22).children.forEach((m) => { m.geometry = m.geometry; });
    // shoulders wider than hips: tapered torso
    G.children[G.children.length - 1].children.forEach((m) => { m.geometry = new THREE.CylinderGeometry(1, 0.66, 1, 18); });
    for (const y of [1.0, 1.15, 1.3]) mesh(SPH, new THREE.MeshStandardMaterial({ color: 0xd9a94a, metalness: 0.8, roughness: 0.3 }), G, 0, y, 0.2).scale.setScalar(0.025);
    part(CYL, skin, G, 0, 1.46, 0, 0.07, 0.1, 0.07, false);
    const head = P(0, 1.66, 0);
    part(SPH, skin, head, 0, 0, 0, 0.19, 0.2, 0.18, false);
    for (const s of [-1, 1]) { mesh(SPH, bead, head, s * 0.065, 0.03, 0.16).scale.setScalar(0.028); }
    mesh(SPH, felt("#D9967A"), head, 0, -0.02, 0.18).scale.setScalar(0.035);
    part(SPH, "#5A3A26", head, 0, -0.12, 0.08, 0.16, 0.12, 0.1);
    part(CYL, "#4A3426", head, 0, 0.15, 0, 0.3, 0.03, 0.3, false);
    part(CYL, "#4A3426", head, 0, 0.26, 0, 0.17, 0.2, 0.17, false);
    mesh(CYL, felt("#B5532F"), head, 0, 0.18, 0).scale.set(0.175, 0.04, 0.175);
    const limb = (x, y, l1, l2, r, col, endCol, end) => { const a = P(x, y, 0); part(CYL, col, a, 0, -l1 / 2, 0, r, l1, r); const b = P(0, -l1, 0, a); part(CYL, col, b, 0, -l2 / 2, 0, r * 0.9, l2, r * 0.9); const e = end(b, l2); return { a, b }; };
    const armL = limb(-0.34, 1.36, 0.3, 0.28, 0.065, coat, skin, (b, l) => mesh(SPH, felt(skin), b, 0, -l - 0.04, 0).scale.setScalar(0.06));
    const armR = limb(0.34, 1.36, 0.3, 0.28, 0.065, coat, skin, (b, l) => mesh(SPH, felt(skin), b, 0, -l - 0.04, 0).scale.setScalar(0.06));
    const legL = limb(-0.11, 0.74, 0.36, 0.34, 0.075, trou, "#2a2018", (b, l) => { const m = mesh(new THREE.BoxGeometry(0.13, 0.08, 0.24), felt("#2A2018"), b, 0, -l - 0.03, 0.05); return m; });
    const legR = limb(0.11, 0.74, 0.36, 0.34, 0.075, trou, "#2a2018", (b, l) => { const m = mesh(new THREE.BoxGeometry(0.13, 0.08, 0.24), felt("#2A2018"), b, 0, -l - 0.03, 0.05); return m; });
    blob(G, 0.5, 0.4).position.y = 0.01;
    return { G, armL, armR, legL, legR, head };
  }
  const AU = person(); AU.G.position.set(-1.2, HTOP, 1.3); AU.G.rotation.y = 0.35; AU.G.scale.setScalar(1.05); H.add(AU.G);
  const auTag = tag([["THOMAS AUSTIN", 0.34, "800"], ["pemilik lahan asal Inggris", 0.17, "700"]], 1.05, { h: 360 });

  // ---------- kangaroo ----------
  const KG = new THREE.Group(); H.add(KG); KG.visible = false;
  { const c = "#B07A4A";
    const b = fuzzy(SPH, c, KG, 2, 0.05); b.position.set(0, 0.55, 0); b.scale.set(0.3, 0.42, 0.28); b.rotation.x = -0.35;
    const bl = fuzzy(SPH, "#E2C49A", KG, 1, 0.04); bl.position.set(0, 0.5, 0.18); bl.scale.set(0.18, 0.28, 0.12);
    const hd = fuzzy(SPH, c, KG, 2, 0.05); hd.position.set(0, 1.05, 0.12); hd.scale.set(0.15, 0.15, 0.2);
    const sn = fuzzy(SPH, c, KG, 1, 0.04); sn.position.set(0, 1.0, 0.3); sn.scale.set(0.08, 0.08, 0.1);
    mesh(SPH, bead, KG, 0, 1.01, 0.4).scale.setScalar(0.03);
    for (const s of [-1, 1]) { mesh(SPH, bead, KG, s * 0.08, 1.1, 0.25).scale.setScalar(0.025); const e = fuzzy(SPH, c, KG, 1, 0.04); e.position.set(s * 0.08, 1.27, 0.08); e.scale.set(0.05, 0.14, 0.03); e.rotation.z = -s * 0.2;
      const f = fuzzy(SPH, c, KG, 1, 0.04); f.position.set(s * 0.14, 0.08, 0.15); f.scale.set(0.07, 0.06, 0.24); const lg = fuzzy(SPH, c, KG, 1, 0.04); lg.position.set(s * 0.17, 0.3, 0.0); lg.scale.set(0.11, 0.2, 0.16);
      const ar = fuzzy(SPH, c, KG, 1, 0.04); ar.position.set(s * 0.13, 0.72, 0.24); ar.scale.set(0.04, 0.11, 0.04); ar.rotation.x = 0.6; }
    const tl = fuzzy(CONE, c, KG, 1, 0.04); tl.position.set(0, 0.25, -0.45); tl.scale.set(0.11, 0.75, 0.11); tl.rotation.x = -1.75;
    blob(KG, 0.6, 0.35).position.y = 0.01; }
  const kgTag = tag([["KELINCI ASLI: 0", 0.4, "800"]], 1.1, { h: 240, bg: "#B5532F", fg: CREAM, bd: CREAM });

  // ---------- felt rabbits (hero, in the hoop) ----------
  function rabbit(col, sc = 1) {
    const G = new THREE.Group(); const B = new THREE.Group(); G.add(B);
    const body = fuzzy(SPH, col, B, 2, 0.07); body.position.set(0, 0.16, 0); body.scale.set(0.17, 0.15, 0.22);
    const head = fuzzy(SPH, col, B, 2, 0.07); head.position.set(0, 0.31, 0.17); head.scale.setScalar(0.12);
    const ears = [-1, 1].map((s) => { const e = fuzzy(SPH, col, B, 1, 0.06); e.position.set(s * 0.05, 0.47, 0.13); e.scale.set(0.035, 0.13, 0.025); e.rotation.set(-0.25, 0, -s * 0.18); return e; });
    const tl = fuzzy(SPH, "#FFF8EC", B, 2, 0.08); tl.position.set(0, 0.2, -0.22); tl.scale.setScalar(0.06);
    for (const s of [-1, 1]) { mesh(SPH, bead, B, s * 0.065, 0.34, 0.26, false).scale.setScalar(0.022); }
    mesh(SPH, felt("#E88A93"), B, 0, 0.3, 0.29, false).scale.setScalar(0.018);
    for (const s of [-1, 1]) { const f = mesh(SPH, felt(col), B, s * 0.07, 0.03, 0.13); f.scale.set(0.04, 0.03, 0.06); }
    const bl = blob(G, 0.28, 0.35); bl.position.y = 0.005;
    G.scale.setScalar(sc); G.visible = false; H.add(G);
    return { G, B, ears };
  }
  const WILD = ["#8C7562", "#9A8068", "#7E6A58", "#A28A72"];
  const HR = []; // 24 wild
  { const q = mulberry(2424);
    for (let i = 0; i < 24; i++) {
      const a1 = q() * 6.283, r1 = 0.75 + q() * 1.35;
      let t2; do { const a = q() * 6.283, rr2 = 1.0 + Math.sqrt(q()) * 4.4; t2 = [Math.cos(a) * rr2, Math.sin(a) * rr2]; } while (Math.hypot(t2[0] + 2.7, t2[1] + 1.9) < 1.5 || t2[1] < -2.8);
      HR.push({ R: rabbit(WILD[i % 4], 1.25), t1: [crate.position.x + Math.cos(a1) * r1, crate.position.z + 0.3 + Math.sin(a1) * r1 * 0.8], t2, d: 0.55 + q() * 0.5, ph: q() * 6.28, yawJ: q() - 0.5 });
    }
  }
  const PETS = []; { const q = mulberry(808); for (let i = 0; i < 8; i++) { const a = q() * 6.283, rr2 = 1.4 + q() * 2.6; PETS.push({ R: rabbit(["#F4EEE4", "#EFE6D6", "#F7F1E8", "#E9DCC6"][i % 4], 1.2), tg: [Math.cos(a) * rr2, 0.8 + Math.sin(a) * rr2 * 0.7], ph: q() * 6.28 }); } }
  const BABY = []; { const q = mulberry(4040); for (let i = 0; i < 44; i++) { const c = new THREE.Color(WILD[i % 4]).lerp(new THREE.Color("#F4EEE4"), q() * 0.7); let p; do { const a = q() * 6.283, rr2 = 0.8 + Math.sqrt(q()) * 4.8; p = [Math.cos(a) * rr2, Math.sin(a) * rr2]; } while (Math.hypot(p[0] + 2.7, p[1] + 1.9) < 1.5 || p[1] < -2.8); BABY.push({ R: rabbit("#" + c.getHexString(), 0.85 + q() * 0.25), p, ph: q() * 6.28, r: q(), d: q() * 1.4 }); } }
  // six babies gnaw the young tree in s6
  const GNAW = [0, 1, 2, 3, 4, 5].map((k) => { const a = (k / 6) * 6.283 + 0.4; return [YT.position.x + Math.cos(a) * 0.42, YT.position.z + Math.sin(a) * 0.42, a]; });

  // ---------- carpet rabbits on the map (instanced) ----------
  const NC = 2600, CQ = mulberry(1859), CR = [];
  while (CR.length < NC) { const x = MX0 + CQ() * MW, z = MZ0 + CQ() * MH; if (!onLand(x, z)) continue; const d = Math.hypot(x - SRC[0], (z - SRC[1]) * 1.0) + (CQ() - 0.5) * 3.0 - (z > 8 ? 1.5 : 0); CR.push({ x, z, d, r: CQ(), yaw: CQ() * 6.28, ph: CQ() * 6.28, s: 0.85 + CQ() * 0.3, c: CQ() }); }
  const cBodyM = felt("#ffffff", 1);
  const parts = [[SPHL, [0, 0.16, 0], [0.17, 0.15, 0.22], [0, 0, 0]], [SPHL, [0, 0.31, 0.17], [0.12, 0.12, 0.12], [0, 0, 0]], [SPHL, [-0.05, 0.47, 0.13], [0.035, 0.13, 0.03], [-0.25, 0, 0.18]], [SPHL, [0.05, 0.47, 0.13], [0.035, 0.13, 0.03], [-0.25, 0, -0.18]], [SPHL, [0, 0.2, -0.22], [0.065, 0.065, 0.065], [0, 0, 0]]];
  const PL = parts.map(([, p, s, e]) => new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...e)), new THREE.Vector3(...s)));
  const CI = parts.map(([geo], k) => { const m = new THREE.InstancedMesh(geo, k === 4 ? felt("#FFF8EC", 1) : cBodyM, NC); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); return m; });
  { const c = new THREE.Color(); CR.forEach((o, i) => { c.set(o.c < 0.62 ? WILD[i % 4] : o.c < 0.88 ? "#B8977A" : "#EEE6DA"); for (let k = 0; k < 4; k++) CI[k].setColorAt(i, c); }); }
  const M4 = new THREE.Matrix4(), M5 = new THREE.Matrix4(), Q4 = new THREE.Quaternion(), V4 = new THREE.Vector3(), S4 = new THREE.Vector3(), Z4 = new THREE.Matrix4().makeScale(0, 0, 0);

  // ---------- 1901 fence: a stitched line sewn by a needle ----------
  const FENCE = [[119.75, -33.95], [119.5, -32.5], [119.2, -31], [119.1, -29.6], [119.5, -28.2], [119.9, -26.6], [120.3, -25], [120.1, -23.3], [119.9, -21.7], [119.95, -20.0]].map(([a, b]) => proj(a, b));
  const fCurve = new THREE.CatmullRomCurve3(FENCE.map(([x, z]) => new THREE.Vector3(x, TOPY + 0.06, z)));
  const FL = fCurve.getLength(), NST = Math.floor(FL / 0.55);
  const fStitch = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07, 0.07, 0.36, 6), felt("#B5532F", 1), NST); fStitch.castShadow = true; fStitch.frustumCulled = false; scene.add(fStitch);
  const fPost = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.06, 0.55, 6), wood("#7A5230"), NST); fPost.castShadow = true; fPost.frustumCulled = false; scene.add(fPost);
  const needle = new THREE.Group(); scene.add(needle);
  mesh(new THREE.CylinderGeometry(0.06, 0.005, 3.2, 10), metal, needle, 0, 0, 0);
  { const eye = mesh(new THREE.TorusGeometry(0.08, 0.025, 6, 12), metal, needle, 0, 1.5, 0); }
  const fenceTag = tag([["PAGAR ANTI-KELINCI", 0.3, "800"], ["Australia Barat · 1901", 0.18, "700"]], 3.4, { h: 340 });

  // ---------- myxoma: purple felt virus balls ----------
  const VIR = [[146, -36.5], [149.5, -33], [140.5, -34.5], [151, -29], [143.5, -31]].map(([lo, la], i) => {
    const [x, z] = proj(lo, la); const G = new THREE.Group(); scene.add(G);
    const b = fuzzy(SPH, "#7B4AA8", G, 2, 0.06); b.scale.setScalar(0.7);
    const q = mulberry(70 + i); for (let k = 0; k < 18; k++) { const v = new THREE.Vector3(q() - 0.5, q() - 0.5, q() - 0.5).normalize(); const c = mesh(CONE, felt("#C59BE0"), G, v.x * 0.78, v.y * 0.78, v.z * 0.78); c.scale.set(0.12, 0.35, 0.12); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v); }
    const ring = mesh(new THREE.TorusGeometry(1, 0.06, 6, 48), new THREE.MeshBasicMaterial({ color: 0xb98ae0, transparent: true, depthWrite: false }), scene, x, TOPY + 0.05, z, false); ring.rotation.x = Math.PI / 2;
    G.visible = false; return { G, x, z, ring };
  });
  const virTag = tag([["VIRUS MYXOMA · 1950", 0.36, "800"]], 6.0, { h: 240, bg: "#5E3A85", fg: CREAM, bd: "#E8D6F5" });

  // ---------- DNA yarn helix from the crate ----------
  const DNA = new THREE.Group(); DNA.position.set(HX + crate.position.x, HTOP + 0.7, HZ + crate.position.z); scene.add(DNA);
  const helix = (ph) => new THREE.CatmullRomCurve3(Array.from({ length: 80 }, (_, i) => { const u = i / 79, a = u * 6.283 * 2.5 + ph; return new THREE.Vector3(Math.cos(a) * 0.42, u * 3.2, Math.sin(a) * 0.42); }));
  const hA = mesh(new THREE.TubeGeometry(helix(0), 240, 0.07, 8), felt("#C8372E", 3), DNA), hB = mesh(new THREE.TubeGeometry(helix(Math.PI), 240, 0.07, 8), felt("#FFF6E3", 3), DNA);
  const rungs = Array.from({ length: 22 }, (_, i) => { const u = (i + 0.5) / 22, a = u * 6.283 * 2.5; const m = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.84, 6), felt(i % 2 ? "#F2B53B" : "#7FA35E"), DNA, 0, u * 3.2, 0); m.rotation.set(0, -a, Math.PI / 2); return m; });
  DNA.visible = false;
  const dnaTag = tag([["DNA · STUDI 2022", 0.3, "800"], ["→ kelinci Austin, 1859", 0.2, "700"]], 1.4, { h: 360 });

  // ---------- emu (EP02 callback) ----------
  const EMU = new THREE.Group(); const [ex, ez] = proj(117.6, -30.2); EMU.position.set(ex, TOPY, ez); EMU.rotation.y = 0.5; scene.add(EMU); EMU.visible = false;
  { const c = "#5A4636";
    const b = fuzzy(SPH, c, EMU, 3, 0.08); b.position.set(0, 1.15, 0); b.scale.set(0.5, 0.42, 0.62);
    const nk = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.3, 0.45), new THREE.Vector3(0, 1.8, 0.62), new THREE.Vector3(0, 2.25, 0.6)]);
    mesh(new THREE.TubeGeometry(nk, 20, 0.09, 8), felt("#8A9AA8"), EMU);
    const hd = fuzzy(SPH, "#6A5A4E", EMU, 1, 0.05); hd.position.set(0, 2.32, 0.66); hd.scale.set(0.13, 0.12, 0.15);
    const bk = mesh(CONE, felt("#3A2E26"), EMU, 0, 2.3, 0.85); bk.scale.set(0.05, 0.16, 0.05); bk.rotation.x = Math.PI / 2;
    for (const s of [-1, 1]) { mesh(SPH, bead, EMU, s * 0.09, 2.36, 0.74).scale.setScalar(0.03);
      const th = mesh(CYL, felt("#7E8C96"), EMU, s * 0.18, 0.72, 0.05); th.scale.set(0.06, 0.5, 0.06); th.rotation.x = -0.25;
      const sh = mesh(CYL, felt("#7E8C96"), EMU, s * 0.18, 0.25, -0.02); sh.scale.set(0.05, 0.48, 0.05); sh.rotation.x = 0.2;
      const ft = mesh(new THREE.BoxGeometry(0.16, 0.05, 0.26), felt("#5E6A72"), EMU, s * 0.18, 0.03, 0.06); }
    blob(EMU, 1.0, 0.4).position.y = 0.01; }
  EMU.scale.setScalar(1.9);
  const emuTag = tag([["EP 02 · PERANG EMU", 0.3, "800"], ["Australia vs hewan · 1932", 0.18, "700"]], 3.0, { h: 340 });
  const vicTag = tag([["VICTORIA", 0.42, "800"], ["Oktober 1859", 0.2, "700"]], 4.2, { h: 330 });

  // ---------- foreground notions ----------
  function yarnBall(x, z, s, col) { const G = new THREE.Group(); G.position.set(x, s, z); scene.add(G); mesh(SPH, felt(col, 2), G).scale.setScalar(s); for (let k = 0; k < 9; k++) { const t = mesh(new THREE.TorusGeometry(s * 1.01, s * 0.05, 6, 40), felt(col, 2), G); t.rotation.set(k * 0.7, k * 1.3, k * 0.4); } for (const sgn of [-1, 1]) { const nd = mesh(new THREE.CylinderGeometry(s * 0.06, s * 0.06, s * 4, 8), wood("#D9B98C"), G, sgn * s * 0.3, s * 0.6, 0); nd.rotation.set(0.3, 0, sgn * 0.5); } return G; }
  function spool(x, z, s, col) { const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G); mesh(new THREE.CylinderGeometry(s, s, s * 0.25, 28), wood("#D9B98C"), G, 0, s * 0.125, 0); mesh(new THREE.CylinderGeometry(s * 0.78, s * 0.78, s * 1.5, 28), felt(col, 3), G, 0, s * 1.0, 0); mesh(new THREE.CylinderGeometry(s, s, s * 0.25, 28), wood("#D9B98C"), G, 0, s * 1.875, 0); return G; }
  yarnBall(HX + 5.4, HZ + 6.6, 0.9, "#C9563A");
  spool(HX - 7.6, HZ + 7.5, 1.3, "#3E9C95");
  yarnBall(22, 25, 2.2, "#F2B53B");
  spool(-24, 26, 2.6, "#C9563A");
  [[HX + 3.8, HZ + 7.4, "#E8B4C8"], [HX - 4.6, HZ + 8.6, "#F2B53B"], [HX + 7.2, HZ + 3.2, "#B9A2D8"]].forEach(([x, z, c]) => fuzzy(SPH, c, scene, 2, 0.08).position.set(x, 0.45, z) || 0);
  scene.children.filter((o) => o.isGroup && o.children[0] && o.children[0].material === felt("#E8B4C8")).forEach(() => {});

  // ---------- camera ----------
  const h = (dx, dy, dz) => [HX + dx, dy, HZ + dz];
  const CAM = track([
    [0, ...h(0.6, 3.4, 7.6), ...h(0.1, 0.6, 0.2)],
    [A("s1:kelinci") + 0.1, ...h(0.2, 9, 15), ...h(-1.5, 0, -6)],
    [A("s1:peternakan") - 0.3, 1.5, 60, 68, 1, 0, 3],
    [A("s1:juta") + 0.3, 1.5, 57, 65, 1, 0, 3],
    [A("s1:kewalahan") + 0.6, 1.5, 54, 62, 1, 0, 3],
    [K.s2 + 0.5, 3, 54, 62, 3, 0, 4],
    [A("s2:Victoria") + 0.2, 10, 19, 40, 9, 0, 18],
    [A("s2:Thomas") + 0.3, ...h(-0.3, 3.4, 8.2), ...h(-0.7, 1.35, 0.5)],
    [A("s2:berburu"), ...h(0.4, 3.3, 7.8), ...h(-0.3, 1.25, 0.4)],
    [A("s2:Padahal") + 0.4, ...h(2.2, 3.6, 7.9), ...h(2.6, 1.2, -0.5)],
    [K.s3 + 0.2, ...h(1.0, 3.0, 5.8), ...h(0.2, 0.7, 0.9)],
    [A("s3:lahannya"), ...h(0.2, 5.4, 9.6), ...h(0, 0.5, 0.2)],
    [A("s3:halaman"), ...h(-0.8, 5.6, 9.8), ...h(-0.5, 0.5, -0.2)],
    [K.s4 + 0.4, ...h(-1.4, 4.4, 8.0), ...h(-1.4, 0.5, -0.6)],
    [A("s4:Australia"), ...h(0.4, 6.4, 10.8), ...h(0, 0.4, 0.2)],
    [K.s5 + 0.4, ...h(0.6, 9.5, 15), ...h(0, 0, -2)],
    [A("s5:lima"), 11, 24, 38, 8, 0, 13],
    [A("s5:Dalam"), 6, 38, 52, 4, 0, 6],
    [A("s5:penyebaran"), 1, 55, 62, 0.5, 0, 3],
    [K.s6 + 0.5, ...h(3.6, 3.3, 5.4), ...h(1.5, 0.75, 0.1)],
    [A("s6:tanah"), ...h(1.6, 5.8, 9.6), ...h(0.4, 0.4, 0.6)],
    [A("s6:Tahun") + 0.6, -4, 30, 30, -8, 0, 3],
    [A("s6:pagar"), -7.5, 20, 21, -12.5, 0, 1.5],
    [A("s6:lolos"), -7, 21, 22, -12, 0, 1.0],
    [K.s7 + 0.6, 4, 56, 62, 4, 0, 3.5],
    [A("s7:juta#2"), 5, 54, 60, 5, 0, 4],
    [A("s7:lagi"), 4.5, 56, 62, 4.5, 0, 4],
    [A("s7:Studi") + 0.6, ...h(0.9, 5.2, 10.6), ...h(0.4, 1.7, 1.0)],
    [A("s7:Austin"), ...h(0.5, 5.6, 11.2), ...h(0.3, 1.8, 1.0)],
    [K.s8 + 0.6, -8.5, 15, 19, -14, 1.5, 3],
    [A("s8:Menurut"), -8, 17, 21, -13.5, 1.5, 3],
    [A("s8:bersalah"), -7.5, 19, 24, -12.5, 1.0, 3.5],
    [A("s8:AUDIRA"), 2, 50, 62, 2, 0, 9],
    [K.dur, 2, 54, 66, 2, 0, 9],
  ]);
  const look = new THREE.Vector3();

  // ---------- population curves ----------
  const spreadR = (t) => {
    if (t < K.s2 + 0.2) return 34 * smooth((t - A("s1:ekor")) / (A("s1:peternakan") - 0.4 - A("s1:ekor")));
    if (t < K.s5) return 34 * (1 - smooth((t - K.s2 - 0.2) / 1.6));
    if (t < A("s6:lolos") - 0.3) return 5 + 6 * smooth((t - K.s5 - 0.3) / (A("s5:pemburu") - K.s5)) + 11.5 * smooth((t - A("s5:Dalam")) / (A("s5:dunia") - A("s5:Dalam")));
    return 22.5 + 11.5 * smooth((t - A("s6:lolos") + 0.3) / 2.2);
  };
  const density = (t) => { if (t < A("s7:turun")) return 1; const d1 = 1 - 0.83 * smooth((t - A("s7:turun")) / (A("s7:juta#2") + 0.3 - A("s7:turun"))); return d1 + 0.4 * smooth((t - A("s7:jumlahnya")) / (A("s7:lagi") + 0.5 - A("s7:jumlahnya"))); };

  return function draw(t) {
    const tq = two(t);
    // ---- carpet ----
    const R = spreadR(t), D = density(t), cs = 1.5 + 0.75 * clamp01((CAM(t)[1] - 18) / 30);
    for (let i = 0; i < NC; i++) {
      const o = CR[i];
      let k = smooth((R - o.d) / 1.4) * smooth((D - o.r) / 0.04 + 0.5);
      if (k < 0.01) { for (let p = 0; p < 5; p++) CI[p].setMatrixAt(i, Z4); continue; }
      const hop = Math.pow(Math.max(0, Math.sin(tq * 4.2 + o.ph)), 2) * 0.12;
      Q4.setFromAxisAngle(V4.set(0, 1, 0), o.yaw + Math.sin(tq * 0.7 + o.ph) * 0.3);
      M4.compose(S4.set(o.x, TOPY + hop, o.z), Q4, V4.set(1, 1, 1).multiplyScalar(cs * o.s * k));
      for (let p = 0; p < 5; p++) { M5.multiplyMatrices(M4, PL[p]); CI[p].setMatrixAt(i, M5); }
    }
    for (const m of CI) m.instanceMatrix.needsUpdate = true;

    // ---- hero rabbits ----
    const rel1 = A("s1:Dua") - 0.1, rel2 = A("s3:melepas") + 0.15, gone1 = K.s2 + 0.2;
    const crateP = [crate.position.x, crate.position.z];
    const place = (o, x, z, yaw, hopY, k) => { o.R.G.visible = k > 0.01; if (!o.R.G.visible) return; o.R.G.position.set(x, HTOP, z); o.R.G.rotation.y = yaw; o.R.B.position.y = hopY; o.R.G.scale.setScalar(o.sc0 * Math.max(0.001, k)); };
    HR.forEach((o, i) => {
      o.sc0 = o.sc0 || o.R.G.scale.x || 1.25;
      let t0, tgt, show = 1;
      if (t < gone1 + 1) { t0 = rel1 + i * 0.06; tgt = o.t1; show = 1 - smooth((t - gone1) / 0.6); }
      else { t0 = rel2 + i * 0.05; tgt = o.t2; }
      if (t < t0) { o.R.G.visible = false; return; }
      const u = clamp01((two(t) - t0) / o.d), e = eout(u);
      const fx = crateP[0] + (tgt[0] - crateP[0]) * e, fz = crateP[1] + (tgt[1] - crateP[1]) * e;
      const arc = u < 1 ? Math.sin(u * Math.PI) * 0.9 + Math.abs(Math.sin(u * Math.PI * 2)) * 0.15 : 0;
      const wx = u >= 1 ? Math.sin(tq * 0.55 + o.ph) * 0.22 : 0, wz = u >= 1 ? Math.cos(tq * 0.47 + o.ph) * 0.18 : 0;
      const hopY = arc + (u >= 1 ? Math.pow(Math.max(0, Math.sin(tq * 3.3 + o.ph)), 3) * 0.12 : 0);
      const yaw = Math.atan2(tgt[0] - crateP[0], tgt[1] - crateP[1]) + (u >= 1 ? Math.sin(tq * 0.4 + o.ph) * 0.6 : 0);
      let sk = show * clamp01(u * 5 + 0.2);
      if (t > K.s7 && i % 3 === 0) sk *= 1 - smooth((t - A("s7:turun")) / 2.5) * (1 - smooth((t - A("s7:jumlahnya")) / 1.5));
      place(o, fx + wx, fz + wz, yaw, hopY, sk);
    });
    // pets from the house
    const doorP = [house.position.x + 0.15, house.position.z + 0.85];
    PETS.forEach((o, i) => {
      o.sc0 = o.sc0 || 1.2;
      const t0 = A("s4:peliharaan") - 1.0 + i * 0.12;
      if (t < t0) { o.R.G.visible = false; return; }
      const u = clamp01((two(t) - t0) / 1.4), e = eout(u);
      const x = doorP[0] + (o.tg[0] - doorP[0]) * e, z = doorP[1] + (o.tg[1] - doorP[1]) * e;
      const hopY = u < 1 ? Math.abs(Math.sin(u * Math.PI * 3)) * 0.3 : Math.pow(Math.max(0, Math.sin(tq * 3 + o.ph)), 3) * 0.1;
      place(o, x + (u >= 1 ? Math.sin(tq * 0.5 + o.ph) * 0.2 : 0), z, Math.atan2(o.tg[0] - doorP[0], o.tg[1] - doorP[1]), hopY, clamp01(u * 6));
    });
    // babies
    BABY.forEach((o, i) => {
      o.sc0 = o.sc0 || o.R.G.scale.x;
      const t0 = A("s4:keturunannya") - 0.1 + o.d * 1.6 + (i > 20 ? 1.8 + (i - 20) * 0.08 : 0);
      if (t < t0) { o.R.G.visible = false; return; }
      let x = o.p[0] + Math.sin(tq * 0.5 + o.ph) * 0.2, z = o.p[1] + Math.cos(tq * 0.45 + o.ph) * 0.2, yaw = o.ph + Math.sin(tq * 0.4 + o.ph) * 0.7;
      if (i < 6) { const g = GNAW[i], u = eout(clamp01((two(t) - A("s6:pohon") + 0.9) / 0.9)); x += (g[0] - x) * u; z += (g[1] - z) * u; if (u > 0.5) yaw = Math.atan2(YT.position.x - g[0], YT.position.z - g[1]); }
      let k = back(clamp01((t - t0) / 0.35), 2.2);
      if (t > A("s7:turun") && o.r < 0.75) k *= 1 - smooth((t - A("s7:turun") - o.r) / 0.8) * (1 - smooth((t - A("s7:jumlahnya") - o.r) / 1.2) * (o.r < 0.4 ? 1 : 0));
      place(o, x, z, yaw, Math.pow(Math.max(0, Math.sin(tq * 3.6 + o.ph)), 3) * 0.1, k);
    });

    // ---- crate lid ----
    const lid = Math.max(win(t, rel1 - 0.35, gone1 - 0.3, 0.25, 0.4), win(t, rel2 - 0.4, 1e9, 0.3, 0.3));
    lidP.rotation.x = -1.95 * lid;

    // ---- Austin ----
    {
      const wave = win(t, A("s3:melepas") - 0.3, A("s3:Katanya"), 0.4, 0.5), hunt = win(t, A("s2:rindu") - 0.2, A("s2:Padahal"), 0.4, 0.4);
      const br = Math.sin(tq * 2.2) * 0.03;
      AU.armL.a.rotation.set(0.15 + br, 0, -0.22); AU.armL.b.rotation.set(-0.45, 0, 0);
      AU.armR.a.rotation.set(0.15 - br - 2.0 * wave - 0.6 * hunt, 0, 0.22 + 0.3 * wave); AU.armR.b.rotation.set(-0.45 - 0.6 * wave + Math.sin(tq * 8) * 0.25 * wave, 0, 0);
      AU.legL.a.rotation.x = -0.3; AU.legL.b.rotation.x = 0.45; AU.legR.a.rotation.x = 0.12; AU.legR.b.rotation.x = 0.22;
      AU.head.rotation.y = -0.3 * wave + Math.sin(tq * 0.8) * 0.12; AU.head.rotation.x = 0.1 * wave;
      if (false) showTag(auTag, win(t, A("s2:Thomas") - 0.1, A("s3:Katanya") + 0.4, 0.35, 0.4), HX + AU.G.position.x, 2.3, HZ + AU.G.position.z, 1);
    }
    // ---- kangaroo ----
    {
      const k = win(t, A("s2:Padahal") - 0.6, K.s3 + 0.8, 0.3, 0.5);
      KG.visible = k > 0.01; if (KG.visible) { const u = clamp01((two(t) - A("s2:Padahal") + 0.6) / 1.2); KG.position.set(4.6 - 1.6 * eout(u), HTOP + Math.abs(Math.sin(u * Math.PI * 3)) * 0.45 * (1 - u), -0.6 + 0.3 * u); KG.rotation.y = -0.9 + 0.5 * u; KG.scale.setScalar(1.25 * k); }
      showTag(kgTag, win(t, A("s2:tidak") - 0.1, K.s3 + 0.4, 0.3, 0.4), HX + 2.8, 2.6, HZ - 0.4, 1);
    }
    // ---- damage ----
    {
      const tA = A("s6:Rumput") - 0.2, tB = A("s6:habis") + 1.0;
      const M = new THREE.Matrix4();
      TU.forEach(([x, z, yaw, s, rk], i) => {
        let k = 1;
        if (t > tA) k = 1 - smooth((t - tA - rk * (tB - tA)) / 0.5);
        if (t > A("s7:Tapi")) k = Math.max(k, 0.5 * smooth((t - A("s7:Tapi") - rk) / 1.5));
        M.compose(new THREE.Vector3(x, HTOP + 0.1 * s * k, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0.1)), new THREE.Vector3(s * k + 1e-4, s * k + 1e-4, s * k + 1e-4)); tufts.setMatrixAt(i, M);
      });
      tufts.instanceMatrix.needsUpdate = true;
      PAT.forEach((m, i) => { const k = smooth((t - A("s6:habis") + 0.3 - i * 0.25) / 0.6); m.visible = k > 0.01; m.scale.setScalar(Math.max(0.001, k)); });
      GUL.forEach((m, i) => { const k = smooth((t - A("s6:tergerus") + 0.2 - i * 0.3) / 0.8); m.visible = k > 0.01; m.material.opacity = k; m.scale.set(Math.max(0.001, k), 1, 1); });
      const rb = smooth((t - A("s6:kulitnya") + 0.1) / 0.8), dead = smooth((t - A("s6:dimakan")) / 1.2);
      barkBand.material.color.set(rb > 0.5 ? "#F2E3C2" : "#8A6040");
      crownMats.forEach(() => {}); ytCrown.forEach((c) => { c.children.forEach((m) => m.material.color.copy(crownCol0).lerp(crownCol1, dead)); c.scale.setScalar([0.45, 0.32, 0.32][ytCrown.indexOf(c)] * (1 - 0.25 * dead)); });
      leaves.forEach((l, i) => { const t0 = A("s6:dimakan") + i * 0.18, dt = t - t0; l.visible = dt > 0 && dt < 3.2 && t < K.s7; if (l.visible) { l.position.set(Math.sin(i * 2.1) * (0.3 + dt * 0.15), Math.max(0.03, 1.2 - dt * 0.55), Math.cos(i * 1.7) * (0.3 + dt * 0.12)); l.rotation.set(dt * 3 + i, dt * 2, i); } });
    }
    // ---- fence ----
    {
      const t0 = A("s6:membangun") - 0.2, t1 = A("s6:kilometer") + 0.2, u = clamp01((t - t0) / (t1 - t0));
      const on = t > t0 - 0.5 && t < K.s7 + 1.0;
      const Mx = new THREE.Matrix4(), q = new THREE.Quaternion();
      for (let i = 0; i < NST; i++) {
        const v = (i + 0.5) / NST, k = on ? smooth((u - v) / 0.04) : 0;
        if (k < 0.01) { fStitch.setMatrixAt(i, Z4); fPost.setMatrixAt(i, Z4); continue; }
        const p = fCurve.getPointAt(v), tg = fCurve.getTangentAt(v);
        q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tg);
        Mx.compose(p, q, new THREE.Vector3(k, k, k)); fStitch.setMatrixAt(i, Mx);
        Mx.compose(new THREE.Vector3(p.x + 0.0, p.y + 0.25 * k, p.z), new THREE.Quaternion(), new THREE.Vector3(k, k, k)); fPost.setMatrixAt(i, i % 2 ? Z4 : Mx);
      }
      fStitch.instanceMatrix.needsUpdate = true; fPost.instanceMatrix.needsUpdate = true;
      needle.visible = on && u > 0 && u < 1;
      if (needle.visible) { const p = fCurve.getPointAt(Math.min(0.999, u + 0.01)); const dip = Math.abs(Math.sin(tq * 9)) * 0.5; needle.position.set(p.x + 0.3, p.y + 1.1 - dip, p.z + 0.4); needle.rotation.set(0.35, 0, -0.45); }
      showTag(fenceTag, win(t, A("s6:pagar") - 0.2, K.s7 - 0.2, 0.3, 0.4), FENCE[0][0] - 2.6, 2.6, FENCE[0][1] - 4.5, 1);
    }
    // ---- virus ----
    VIR.forEach((v, i) => {
      const t0 = A("s7:virus") - 0.2 + i * 0.22, dt = t - t0, k = win(t, t0, A("s7:Tapi") + 0.3, 0.05, 0.6);
      v.G.visible = k > 0.01 && dt > 0;
      if (v.G.visible) { const fall = clamp01(dt / 0.7); v.G.position.set(v.x, TOPY + 0.75 + (1 - eout(fall)) * 14 + (fall >= 1 ? Math.abs(Math.sin(dt * 5)) * Math.exp(-(dt - 0.7) * 3) * 0.6 : 0), v.z); v.G.rotation.y = dt * 0.8; v.G.scale.setScalar(1.5 * k); }
      const ph = ((dt - 0.7) % 1.3) / 1.3; v.ring.visible = dt > 0.7 && k > 0.01; if (v.ring.visible) { v.ring.scale.setScalar(1 + ph * 5); v.ring.material.opacity = (1 - ph) * 0.8 * k; }
    });
    showTag(virTag, win(t, A("s7:virus") + 0.3, A("s7:Tapi"), 0.3, 0.4), proj(146, -36.5)[0] - 2, 6.5, proj(146, -36.5)[1] - 4, 1);
    // ---- DNA ----
    {
      const t0 = A("s7:Studi"), k = win(t, t0, K.s8 + 0.4, 0.2, 0.5), u = clamp01((t - t0) / 1.8);
      DNA.visible = k > 0.01;
      if (DNA.visible) { hA.geometry.setDrawRange(0, Math.floor(u * hA.geometry.index.count / 3) * 3); hB.geometry.setDrawRange(0, Math.floor(u * hB.geometry.index.count / 3) * 3); rungs.forEach((m, i) => { m.visible = (i + 0.5) / 22 < u; }); DNA.rotation.y = t * 0.5; DNA.scale.setScalar(Math.max(0.001, k)); }
      showTag(dnaTag, win(t, A("s7:memastikan") - 0.2, K.s8 + 0.2, 0.3, 0.4), DNA.position.x + 1.35, 2.6, DNA.position.z + 0.4, 1);
    }
    // ---- emu ----
    {
      const k = win(t, A("s8:Perang") - 0.3, K.dur + 5, 0.4, 0.4);
      EMU.visible = k > 0.01; if (EMU.visible) { const b = back(clamp01((t - A("s8:Perang") + 0.3) / 0.5), 2); EMU.scale.setScalar(1.9 * Math.max(0.001, b)); EMU.rotation.y = 0.5 + Math.sin(tq * 1.3) * 0.15; EMU.children[0].position.y = 1.15 + Math.sin(tq * 4) * 0.02; }
      showTag(emuTag, win(t, A("s8:Emu") - 0.1, A("s8:AUDIRA") - 0.5, 0.3, 0.5), ex + 2.2, 3.4, ez + 1.6, 1);
    }
    showTag(vicTag, win(t, A("s2:Victoria") - 0.6, A("s2:Thomas") + 0.2, 0.3, 0.4), SRC[0] + 2.2, 4.4, SRC[1] - 0.5, 1);
    pinHead.scale.setScalar(0.38 * (1 + 0.25 * win(t, A("s2:Victoria") - 0.4, A("s2:Thomas"), 0.2, 0.3) * Math.abs(Math.sin(t * 6))));

    // ---- camera ----
    const c = CAM(t);
    cam.position.set(c[0], c[1], c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    comp.render();
  };
}
