// EP27 BIR TAWIL: SCALEFORGE. One measured map board in a pale measuring studio (1 unit = 1 km, board top y ~ 0).
// The board is a simplified map of southern Egypt, northern Sudan and the Red Sea (Natural Earth 50m coasts).
// Bir Tawil is a raised sand plot (simplified quad, sides 95 / 26 / 46 / 49 km) and the camera zooms continuously
// between the plot (props are NOT to scale) and the whole map:
//   s1 low over the sand: "TIDAK DIKLAIM / UNCLAIMED" sign, crane up, rulers 95 km and 49 km grow along the edges
//   s2 the well (bir = sumur), crane to the map (MESIR / SUDAN pins), a thermometer climbs to 45 °C
//   s3 the straight 1899 line at 22° LU (red ribbon) draws west to east
//   s4 the 1902 administrative line (blue dashes) draws around Bir Tawil and up around the Halaib Triangle;
//      herders' tents, arrows "diurus dari Kairo" and "diurus dari Sudan"
//   s5 claim tints: Egypt (red, north of the 1899 line) and Sudan (blue, south of the 1902 line) sweep in; Halaib gets
//      both, Bir Tawil neither
//   s6 Bir Tawil glows; a balance rises from the map, copies of both plots fly onto its trays at the SAME scale
//      (Halaib ~10x the area), the Halaib tray drops
//   s7 dry well, no settlement, a ruler to the coast (>= 200 km); generic invented micronation flags rise and topple
//   s8 wide pull-back over both lines, then a slow push back to the plot: a "?" flag and the AUDIRA survey marker
// Everything is a pure function of t.

const FONTS = ['700 80px "Space Grotesk"', '500 80px "Space Grotesk"', '500 80px "JetBrains Mono"', '700 80px "JetBrains Mono"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "BIR TAWIL 2.060 km² 45 °C AUDIRA"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* system fallback */ }
}

import * as THREE from "./three.module.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, eout, clamp01, smooth, back, canvasTex, stage, pts } from "./lib3d.js";
import { GEO } from "./geo.js";

const SG = '"Space Grotesk", Arial, sans-serif', JM = '"JetBrains Mono", Consolas, monospace';
const SAND = "#C99A5B", RED = "#E04A3A", BLUE = "#2D6CDF", INK = "#11151B", AMBER = "#F2973A", PURP = "#8D5BD8", TEAL = "#2E9DB5";
const ENV = 0.55;

// ---------- projection: shape coords (X east, Y north, km). world = (X, y, -Y) ----------
const KX = 103.2, KY = 111.0, LON0 = 34.5;
const PX = (lon) => (lon - LON0) * KX, PY = (lat) => (lat - 22) * KY;
const X0 = PX(30), X1 = PX(39.5), Y0 = PY(19.5), Y1 = PY(25), MW = X1 - X0, MH = Y1 - Y0;
const ll = (a) => a.map(([lo, la]) => [PX(lo), PY(la)]);
// Bir Tawil, simplified: north 95 km on 22° N, east 26, south 46, west 49 km
const BT = ll([[33.08, 22], [34.0, 22], [33.862, 21.804], [33.431, 21.703]]);
// Halaib Triangle, simplified: 1902 line from (34.0, 22) to the coast, coast from Natural Earth, south edge on 22° N
const HAL = ll([[34.0, 22], [35.563, 23.272], [35.696, 22.945], [35.797, 22.848], [35.847, 22.786], [35.912, 22.739], [36.229, 22.629], [36.416, 22.393], [36.83, 22.098], [36.87, 22.017], [36.87, 22.0]]);
const COAST_HAL = HAL.slice(1);
const area = (P) => Math.abs(P.reduce((s, p, i) => { const q = P[(i + 1) % P.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
const centroid = (P) => { let a = 0, x = 0, y = 0; P.forEach((p, i) => { const q = P[(i + 1) % P.length], c = p[0] * q[1] - q[0] * p[1]; a += c; x += (p[0] + q[0]) * c; y += (p[1] + q[1]) * c; }); return [x / (3 * a), y / (3 * a)]; };
const BTC = centroid(BT), HALC = centroid(HAL);
export const RATIO = area(HAL) / area(BT);

function clipRect(P) {
  let out = P;
  const T = [
    [(p) => p[0] >= X0, (a, b) => [X0, a[1] + (X0 - a[0]) / (b[0] - a[0]) * (b[1] - a[1])]],
    [(p) => p[0] <= X1, (a, b) => [X1, a[1] + (X1 - a[0]) / (b[0] - a[0]) * (b[1] - a[1])]],
    [(p) => p[1] >= Y0, (a, b) => [a[0] + (Y0 - a[1]) / (b[1] - a[1]) * (b[0] - a[0]), Y0]],
    [(p) => p[1] <= Y1, (a, b) => [a[0] + (Y1 - a[1]) / (b[1] - a[1]) * (b[0] - a[0]), Y1]],
  ];
  for (const [ins, cut] of T) {
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const a = inp[i], b = inp[(i + 1) % inp.length], ia = ins(a), ib = ins(b);
      if (ia) { out.push(a); if (!ib) out.push(cut(a, b)); } else if (ib) out.push(cut(a, b));
    }
    if (!out.length) break;
  }
  return out;
}
const LAND = GEO.map((c) => ({ name: c.name, rings: c.rings.map((r) => clipRect(ll(r))).filter((r) => r.length >= 3) }));

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

// ---------- painters ----------
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function fitFont(g, txt, weight, fam, size, maxW) { let s = size; g.font = `${weight} ${s}px ${fam}`; while (g.measureText(txt).width > maxW && s > 10) { s -= 2; g.font = `${weight} ${s}px ${fam}`; } return s; }
// fine wind ripples + grain, used as colour and bump
function sandPaint(seed, base = SAND, rip = 1) {
  return (g, w, h) => {
    const q = mulberry(seed);
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < (w * h) / 9000; i++) {
      const x = q() * w, y = q() * h, r = 40 + q() * 200, dark = q() < 0.5;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, dark ? `rgba(120,72,30,${0.08 + q() * 0.1})` : `rgba(240,200,140,${0.06 + q() * 0.08})`); gr.addColorStop(1, "rgba(150,105,60,0)");
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // ripples: wavy crests, light face + dark lee
    const n = Math.round(h / 9 * rip);
    for (let i = 0; i < n; i++) {
      const y0 = (i / n) * h + q() * 3, ph = q() * 6.28, a = 0.16 + q() * 0.14;
      for (const [dy, col] of [[0, `rgba(250,214,160,${a + 0.04})`], [2.6, `rgba(100,58,22,${a + 0.06})`]]) {
        g.strokeStyle = col; g.lineWidth = 1.6 + q() * 1.2; g.beginPath();
        for (let x = -10; x <= w + 10; x += 12) {
          const yy = y0 + dy + Math.sin(x * 0.012 + ph) * 7 + Math.sin(x * 0.041 + ph * 2) * 2.2 + Math.sin(x * 0.0031 + i * 0.07) * 14;
          x < 0 ? g.moveTo(x, yy) : g.lineTo(x, yy);
        }
        g.stroke();
      }
    }
    for (let i = 0; i < (w * h) / 60; i++) { const v = q(); g.fillStyle = v < 0.5 ? `rgba(95,62,30,${0.12 + q() * 0.2})` : `rgba(255,248,230,${0.15 + q() * 0.2})`; const s = 0.7 + q() * 1.5; g.fillRect(q() * w, q() * h, s, s); }
  };
}

export function create(canvas, K, AT) {
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xc9a27a, exp: 0.9, bloom: [0.12, 0.5, 0.92], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 0.9;
  r.localClippingEnabled = true;
  bp.threshold = 1.3; bp.strength = 0.06; bp.radius = 0.4;
  cam.near = 2; cam.far = 9000; cam.updateProjectionMatrix();
  { const c = document.createElement("canvas"); c.width = 8; c.height = 512; const g = c.getContext("2d"); const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#A27F5E"); gr.addColorStop(0.45, "#C49A6E"); gr.addColorStop(0.8, "#DDAA74"); gr.addColorStop(1, "#E8B87F"); g.fillStyle = gr; g.fillRect(0, 0, 8, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
  scene.fog = new THREE.FogExp2(0xd4a674, 0.00024);
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;

  // ---------- light: clean studio sun ----------
  const hemi = new THREE.HemisphereLight(0x9fb4c8, 0x7a5532, 0.55); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffc48a, 3.4);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.04; key.shadow.radius = 3;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xbcd2ff, 0.35); fill.position.set(600, 300, 400); scene.add(fill);

  // ---------- helpers ----------
  const labels = [];
  const label = (w, h, paint, rep) => { const tx = canvasTex(w, h, paint, rep); labels.push([tx, paint]); return tx; };
  const add = (m, p = scene, cast = true) => { m.castShadow = cast; m.receiveShadow = true; p.add(m); return m; };
  const G = (x = 0, y = 0, z = 0, p = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0, envMapIntensity: ENV, ...o });
  const phys = (o) => new THREE.MeshPhysicalMaterial({ roughness: 0.3, metalness: 0, envMapIntensity: ENV, ...o });
  const alu = std({ color: 0xd4d8de, metalness: 0.9, roughness: 0.32, envMapIntensity: ENV * 1.6 });
  const darkM = std({ color: 0x1b1f25, metalness: 0.4, roughness: 0.45 });
  const brass = std({ color: 0xc9a050, metalness: 0.9, roughness: 0.3, envMapIntensity: ENV * 1.6 });
  const orangeM = std({ color: 0xf2973a, roughness: 0.4, emissive: 0x6a2c00, emissiveIntensity: 0.5 });
  const woodM = std({ color: 0x8a6440, roughness: 0.8 });
  const blobT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(40,25,10,.6)"); gr.addColorStop(0.55, "rgba(40,25,10,.25)"); gr.addColorStop(1, "rgba(40,25,10,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const blob = (w, d, x, y, z, o = 0.6, p = scene) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, opacity: o, depthWrite: false, fog: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.renderOrder = 2; p.add(m); return m; };
  const shapeOf = (P, c = [0, 0]) => { const s = new THREE.Shape(); P.forEach(([x, y], i) => (i ? s.lineTo(x - c[0], y - c[1]) : s.moveTo(x - c[0], y - c[1]))); s.closePath(); return s; };
  const extr = (P, depth, c) => { const g = new THREE.ExtrudeGeometry(shapeOf(P, c), { depth, bevelEnabled: false }); return g; };
  const W3 = (p, y = 0) => new THREE.Vector3(p[0], y, -p[1]);

  // ---------- studio floor + map board ----------
  const floor = add(new THREE.Mesh(new THREE.PlaneGeometry(12000, 12000), std({ color: 0xb58a5c, roughness: 0.95 })), scene, false);
  floor.rotation.x = -Math.PI / 2; floor.position.y = -32;
  const CW = 2048, CH = Math.round(2048 * MH / MW);
  const cx = (X) => (X - X0) / MW * CW, cy = (Y) => (Y1 - Y) / MH * CH;
  const polyPath = (g, P) => { P.forEach(([x, y], i) => (i ? g.lineTo(cx(x), cy(y)) : g.moveTo(cx(x), cy(y)))); g.closePath(); };
  const mapTx = (tx) => { tx.repeat.set(1 / MW, 1 / MH); tx.offset.set(-X0 / MW, -Y0 / MH); tx.wrapS = tx.wrapT = THREE.ClampToEdgeWrapping; return tx; };
  // sea: deep blue with turquoise shallows along the coast
  const seaT = canvasTex(CW, CH, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#1F6F98"); gr.addColorStop(1, "#185E86"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.save(); g.shadowColor = "rgba(110,215,215,.9)"; g.shadowBlur = 40; g.strokeStyle = "rgba(95,200,205,.75)"; g.lineWidth = 22;
    for (const c of LAND) for (const rg of c.rings) { g.beginPath(); polyPath(g, rg); g.stroke(); }
    g.restore();
    const q = mulberry(5);
    for (let i = 0; i < 2600; i++) { g.strokeStyle = `rgba(255,255,255,${0.03 + q() * 0.05})`; g.lineWidth = 1; const x = q() * w, y = q() * h, l = 6 + q() * 16; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 2, x + l, y); g.stroke(); }
  });
  mapTx(seaT);
  const waveT = canvasTex(256, 256, (g, w, h) => { const q = mulberry(9); g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(${q() < 0.5 ? "255,255,255" : "0,0,0"},${0.12 + q() * 0.2})`; g.lineWidth = 1 + q() * 2; const y = q() * h; g.beginPath(); for (let x = 0; x <= w; x += 8) g.lineTo(x, y + Math.sin(x * 0.05 + i) * 3); g.stroke(); } }, [1 / 6, 1 / 6]);
  const boardTop = std({ map: seaT, roughness: 0.14, metalness: 0.05, envMapIntensity: ENV * 1.4, bumpMap: waveT, bumpScale: 0.25 });
  const board = add(new THREE.Mesh(new THREE.BoxGeometry(MW, 30, MH), [darkM, darkM, boardTop, darkM, darkM, darkM]), scene, false);
  board.position.set((X0 + X1) / 2, -15.6, -(Y0 + Y1) / 2);
  // fix the top-face uv so it uses the shared map transform (Box uv is 0..1 per face)
  { const uv = board.geometry.attributes.uv, pos = board.geometry.attributes.position; for (let i = 0; i < uv.count; i++) { uv.setXY(i, (pos.getX(i) + board.position.x), -(pos.getZ(i) + board.position.z)); } uv.needsUpdate = true; }
  // ruler strip on the south face: km scale from the west edge; latitude strip on the west face
  const rulerS = label(4096, 120, (g, w, h) => {
    g.fillStyle = "#1B1F25"; g.fillRect(0, 0, w, h);
    const px = w / MW;
    for (let k = 0; k <= MW; k += 10) { const x = k * px, maj = k % 100 === 0, mid = k % 50 === 0; g.fillStyle = maj ? "#F2973A" : "#C9CED6"; g.fillRect(x - (maj ? 2 : 1), 0, maj ? 4 : 2, maj ? 62 : mid ? 40 : 24); if (maj) { g.font = `700 40px ${JM}`; g.fillStyle = "#E9ECF0"; g.textAlign = k === 0 ? "left" : "center"; g.fillText(k === 0 ? "0 km" : String(k), x + (k === 0 ? 8 : 0), 108); } }
    g.font = `700 34px ${SG}`; g.textAlign = "right"; g.fillStyle = "#F2973A"; g.fillText("AUDIRA · SKALA PETA", w - 24, 108);
  });
  const sStrip = add(new THREE.Mesh(new THREE.PlaneGeometry(MW, 28), new THREE.MeshBasicMaterial({ map: rulerS, fog: false })), scene, false);
  sStrip.position.set((X0 + X1) / 2, -15.6, -Y0 + 0.2);
  const rulerW = label(2560, 120, (g, w, h) => {
    g.fillStyle = "#1B1F25"; g.fillRect(0, 0, w, h);
    for (let la = 20; la <= 24; la++) { const x = (Y1 - PY(la)) / MH * w, hot = la === 22; g.fillStyle = hot ? RED : "#C9CED6"; g.fillRect(x - 2, 0, 4, 60); g.font = `700 40px ${JM}`; g.textAlign = "center"; g.fillStyle = hot ? "#FF6B5B" : "#E9ECF0"; g.fillText(`${la}° LU`, x, 106); }
  });
  const wStrip = add(new THREE.Mesh(new THREE.PlaneGeometry(MH, 28), new THREE.MeshBasicMaterial({ map: rulerW, fog: false })), scene, false);
  wStrip.rotation.y = -Math.PI / 2; wStrip.position.set(X0 - 0.2, -15.6, -(Y0 + Y1) / 2);

  // ---------- land: extruded coast shapes with a painted desert map + ripple bump ----------
  const landT = canvasTex(CW, CH, (g, w, h) => {
    const q = mulberry(27);
    g.fillStyle = SAND; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 520; i++) {
      const x = q() * w, y = q() * h, r = 20 + q() * 120, X = X0 + x / w * MW;
      const rocky = X > PX(35.2) && q() < 0.55;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, rocky ? `rgba(120,82,52,${0.22 + q() * 0.2})` : q() < 0.5 ? `rgba(168,124,74,${0.08 + q() * 0.1})` : `rgba(246,226,186,${0.12 + q() * 0.12})`);
      gr.addColorStop(1, "rgba(160,120,70,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // wadis
    g.lineCap = "round";
    for (let i = 0; i < 70; i++) {
      let x = q() * w, y = q() * h, a = q() * 6.28; g.strokeStyle = `rgba(130,92,55,${0.18 + q() * 0.18})`; g.lineWidth = 1 + q() * 2.2; g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 14; k++) { a += (q() - 0.5) * 0.9; x += Math.cos(a) * 9; y += Math.sin(a) * 9; g.lineTo(x, y); } g.stroke();
    }
    for (let i = 0; i < 60000; i++) { g.fillStyle = q() < 0.5 ? `rgba(110,75,40,${0.1 + q() * 0.15})` : `rgba(255,246,225,${0.1 + q() * 0.15})`; g.fillRect(q() * w, q() * h, 1.2, 1.2); }
  });
  mapTx(landT);
  const rippleT = canvasTex(512, 512, sandPaint(41, "#9a9a9a", 1.2), [1 / 5, 1 / 5]);
  const grainT = canvasTex(512, 512, (g, w, h) => { const q = mulberry(61); g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { const x = q() * w, y = q() * h, r = 20 + q() * 50, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${q() < 0.5 ? "255,255,255" : "0,0,0"},${0.12 + q() * 0.12})`); gr.addColorStop(1, "rgba(128,128,128,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); } for (let i = 0; i < 26000; i++) { g.fillStyle = q() < 0.5 ? `rgba(255,255,255,${0.15 + q() * 0.25})` : `rgba(0,0,0,${0.15 + q() * 0.25})`; const sz = 1 + q() * 1.5; g.fillRect(q() * w, q() * h, sz, sz); } }, [1 / 9, 1 / 9]);
  const landTop = std({ map: landT, roughness: 0.93, bumpMap: grainT, bumpScale: 1.6 });
  const landSide = std({ color: 0x7d5530, roughness: 0.95 });
  for (const c of LAND) for (const rg of c.rings) {
    const m = add(new THREE.Mesh(extr(rg, 2.6), [landTop, landSide]), scene, false);
    m.rotation.x = -Math.PI / 2; m.position.y = -0.6; m.receiveShadow = true;
  }

  // ---------- Bir Tawil plot: raised sand slab with its own high-res sand ----------
  const bx0 = Math.min(...BT.map((p) => p[0])), bx1 = Math.max(...BT.map((p) => p[0])), by0 = Math.min(...BT.map((p) => p[1])), by1 = Math.max(...BT.map((p) => p[1]));
  const btT = canvasTex(2048, 1024, (g, w, h) => {
    sandPaint(77, "#C99A5B", 2.2)(g, w, h);
    const q = mulberry(78);
    for (let i = 0; i < 380; i++) { const x = q() * w, y = q() * h, s = 2 + q() * 6; g.fillStyle = `rgba(${90 + q() * 50},${62 + q() * 30},${40 + q() * 20},.85)`; g.beginPath(); g.ellipse(x, y, s, s * (0.6 + q() * 0.4), q() * 3, 0, 6.28); g.fill(); g.fillStyle = "rgba(255,240,215,.5)"; g.beginPath(); g.ellipse(x - s * 0.25, y - s * 0.3, s * 0.4, s * 0.25, 0, 0, 6.28); g.fill(); }
  });
  btT.repeat.set(1 / (bx1 - bx0), 1 / (by1 - by0)); btT.offset.set(-bx0 / (bx1 - bx0), -by0 / (by1 - by0));
  const btBump = canvasTex(1024, 512, sandPaint(79, "#909090", 2.2)); btBump.repeat.copy(btT.repeat); btBump.offset.copy(btT.offset);
  const btTop = std({ map: btT, roughness: 0.92, bumpMap: btBump, bumpScale: 4.5, emissive: 0xf2973a, emissiveIntensity: 0 });
  const btSide = std({ color: 0x6e4826, roughness: 0.9 });
  const slab = add(new THREE.Mesh(extr(BT, 2.2), [btTop, btSide]), scene, true);
  slab.rotation.x = -Math.PI / 2; slab.position.y = 2.0;
  const TOP = 4.5;
  // glowing outline (s6, s8)
  const outlinePts = [...BT, BT[0]].map((p) => W3(p, TOP + 0.25));
  const outline = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(outlinePts, false, "catmullrom", 0), 80, 0.55, 6), new THREE.MeshBasicMaterial({ color: 0xffb35c, transparent: true, opacity: 0, toneMapped: false, fog: false }));
  scene.add(outline);
  // corner pegs
  for (const p of BT) { const m = add(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 4, 8), orangeM)); m.position.copy(W3(p, TOP + 1.6)); }

  // dune surface on the plot: real height undulation, cut to the plot outline by an alpha mask
  const inPoly = (x, y, P = BT) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  const duneH = (x, z) => 0.75 * (1 + Math.sin(x * 0.19 + Math.sin(z * 0.11) * 1.6)) + 0.35 * Math.sin(x * 0.63 + z * 0.41) + 0.25 * Math.sin(z * 0.3 - x * 0.07);
  {
    const bw = bx1 - bx0, bh = by1 - by0, geo = new THREE.PlaneGeometry(bw, bh, 300, 110);
    geo.rotateX(-Math.PI / 2); geo.translate((bx0 + bx1) / 2, 0, -(by0 + by1) / 2);
    const pos = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      let e = 1; for (let k = 0; k < BT.length; k++) { const a = BT[k], b = BT[(k + 1) % BT.length], dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy, u = Math.max(0, Math.min(1, ((x - a[0]) * dx + (-z - a[1]) * dy) / L2)); e = Math.min(e, Math.hypot(x - a[0] - u * dx, -z - a[1] - u * dy) / 6); }
      pos.setY(i, TOP - 0.15 + duneH(x, z) * Math.min(1, e)); uv.setXY(i, x, -z);
    }
    geo.computeVertexNormals();
    const mask = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = "#000"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.beginPath(); BT.forEach(([x, y], i) => { const px = (x - bx0) / bw * w, py = (by1 - y) / bh * h; i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); g.fill(); });
    mask.colorSpace = THREE.NoColorSpace; mask.repeat.copy(btT.repeat); mask.offset.copy(btT.offset);
    btTop.alphaMap = mask; btTop.alphaTest = 0.5;
    const dune = add(new THREE.Mesh(geo, btTop), scene, true); dune.receiveShadow = true;
    slab.material = [std({ color: 0xa8743d, roughness: 0.95 }), btSide];
  }
  // rocks and pebbles: on the plot and in the foreground of the hook
  const rockM = [std({ color: 0x5a3c22, roughness: 0.85, flatShading: true }), std({ color: 0x7a5434, roughness: 0.9, flatShading: true }), std({ color: 0x3f2a18, roughness: 0.8, flatShading: true })];
  { const q = mulberry(808);
    const rock = (x, z, sz, y) => { const m = add(new THREE.Mesh(new THREE.DodecahedronGeometry(sz, 0), rockM[Math.floor(q() * 3)])); m.scale.set(1 + q() * 0.6, 0.45 + q() * 0.4, 0.8 + q() * 0.5); m.rotation.set(q(), q() * 6, q()); m.position.set(x, y + sz * 0.2, z); return m; };
    for (let i = 0; i < 70; i++) { const x = bx0 + q() * (bx1 - bx0), y = by0 + q() * (by1 - by0); if (inPoly(x, y)) rock(x, -y, 0.3 + q() * 0.9, TOP + duneH(x, -y) * 0.5); }
    for (let i = 0; i < 14; i++) { const x = -120 + q() * 60, z = 38 + q() * 40; rock(x, z, 0.6 + q() * 1.2, 2); }
    for (let i = 0; i < 40; i++) { const x = -150 + q() * 110, z = -12 + q() * 60; if (!inPoly(x, -z)) rock(x, z, 0.4 + q() * 1.2, 2); }
  }

  // ---------- near props on the plot (not to scale) ----------
  // sign
  const signT = label(1024, 512, (g, w, h) => {
    g.fillStyle = "#F3EFE6"; g.fillRect(0, 0, w, h);
    const q = mulberry(3); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(120,90,60,${q() * 0.08})`; g.fillRect(q() * w, q() * h, 2, 2); }
    g.strokeStyle = RED; g.lineWidth = 18; g.strokeRect(14, 14, w - 28, h - 28);
    g.textAlign = "center"; g.fillStyle = RED; fitFont(g, "TIDAK DIKLAIM", 700, SG, 150, w - 90); g.fillText("TIDAK DIKLAIM", w / 2, 210);
    g.fillStyle = INK; fitFont(g, "UNCLAIMED", 700, SG, 104, w - 200); g.fillText("UNCLAIMED", w / 2, 330);
    g.font = `500 40px ${JM}`; g.fillStyle = "#5A5048"; g.fillText("BIR TAWIL · 2.060 km²", w / 2, 430);
  });
  const sign = G(-80, TOP, 22); sign.rotation.y = 0.18; sign.scale.setScalar(1.4);
  for (const s of [-1, 1]) add(new THREE.Mesh(new THREE.BoxGeometry(1, 17, 1), woodM), sign).position.set(s * 9.5, 8.5, -0.3);
  const signB = add(new THREE.Mesh(new THREE.BoxGeometry(22, 11, 0.7), [woodM, woodM, woodM, woodM, std({ map: signT, roughness: 0.7 }), woodM]), sign);
  signB.position.set(0, 12, 0.2); signB.rotation.z = 0.035;
  blob(42, 12, -80, TOP + 0.05, 23, 0.4);
  // well (bir)
  const stoneT = canvasTex(512, 128, (g, w, h) => { g.fillStyle = "#9C8466"; g.fillRect(0, 0, w, h); const q = mulberry(12); for (let row = 0; row < 4; row++) for (let x = (row % 2) * 20; x < w; x += 40) { g.fillStyle = `rgb(${150 + q() * 40},${128 + q() * 30},${98 + q() * 25})`; rr(g, x + 2, row * 32 + 2, 36, 28, 6); g.fill(); } });
  const well = G(-112, TOP, 11); well.scale.setScalar(1.5);
  add(new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.9, 3.4, 28, 1, true), std({ map: stoneT, roughness: 0.85, side: THREE.DoubleSide })), well).position.y = 1.7;
  add(new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.45, 8, 32), std({ color: 0xb59c7a, roughness: 0.8 })), well).rotation.x = Math.PI / 2;
  well.children[1].position.y = 3.4;
  const hole = add(new THREE.Mesh(new THREE.CircleGeometry(4.2, 28), std({ color: 0x1a120b, roughness: 1 })), well, false); hole.rotation.x = -Math.PI / 2; hole.position.y = 2.6;
  for (const s of [-1, 1]) add(new THREE.Mesh(new THREE.BoxGeometry(0.8, 10, 0.8), woodM), well).position.set(s * 5.2, 5, 0);
  const bar = add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 11.4, 10), woodM), well); bar.rotation.z = Math.PI / 2; bar.position.y = 9.4;
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.2, 5), std({ color: 0x6d5236 })), well).position.set(0.6, 7.2, 0);
  const bucket = add(new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.8, 1.5, 14), std({ color: 0x6f7378, metalness: 0.6, roughness: 0.45 })), well); bucket.position.set(0.6, 4.6, 0);
  blob(24, 24, -112, TOP + 0.05, 11, 0.45);
  // AUDIRA survey marker post
  const markT = label(512, 1024, (g, w, h) => {
    g.fillStyle = "#C9C6BF"; g.fillRect(0, 0, w, h); const q = mulberry(21); for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "80,78,74" : "255,255,255"},${q() * 0.12})`; g.fillRect(q() * w, q() * h, 2, 2); }
    g.fillStyle = AMBER; g.fillRect(0, 70, w, 90);
    g.fillStyle = "#1B1F25"; rr(g, 40, 260, w - 80, 420, 18); g.fill();
    g.textAlign = "center"; g.fillStyle = "#FFFFFF"; fitFont(g, "AUDIRA", 700, SG, 120, w - 120); g.fillText("AUDIRA", w / 2, 420);
    g.font = `700 46px ${JM}`; g.fillStyle = AMBER; g.fillText("TITIK UKUR", w / 2, 520); g.fillText("BT-01", w / 2, 590);
  });
  const marker = G(-108, TOP, 26); marker.rotation.y = 0.35; marker.scale.setScalar(1.7);
  const concrete = std({ color: 0xc9c6bf, roughness: 0.85 });
  add(new THREE.Mesh(new THREE.BoxGeometry(3.4, 10, 3.4), [concrete, concrete, concrete, concrete, std({ map: markT, roughness: 0.8 }), concrete]), marker).position.y = 5;
  const cap = add(new THREE.Mesh(new THREE.ConeGeometry(2.45, 1.4, 4), concrete), marker); cap.position.y = 10.7; cap.rotation.y = Math.PI / 4;
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.6, 10), brass), marker).position.y = 11.5;
  blob(15, 15, -108, TOP + 0.05, 26, 0.45);

  // edge rulers: north 95 km, west 49 km (tilted toward the camera, they grow from the NW corner)
  const mkRuler = (L, unitLabel, seed) => {
    const t = label(2048, 160, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#F4F5F7"); gr.addColorStop(1, "#D6DAE0"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const px = w / L; g.fillStyle = "#14181E";
      for (let k = 0; k <= L; k++) { const maj = k % 10 === 0, mid = k % 5 === 0; g.fillRect(k * px - (maj ? 2 : 1), 0, maj ? 4 : 2, maj ? 64 : mid ? 44 : 24); if (maj && k > 0 && k < L - 4) { g.font = `700 36px ${JM}`; g.textAlign = "center"; g.fillText(String(k), k * px, 104); } }
      g.fillRect(w - 4, 0, 4, 80);
      g.font = `700 44px ${JM}`; g.textAlign = "right"; g.fillStyle = "#C2410C"; g.fillText(unitLabel, w - 16, 146);
      g.font = `700 30px ${SG}`; g.textAlign = "left"; g.fillStyle = "#14181E"; g.fillText("0", 8, 104); g.fillStyle = "#C2410C"; g.fillText("AUDIRA", 10, 146);
    });
    const geo = new THREE.BoxGeometry(L, 0.5, 5.2); geo.translate(L / 2, 0, 0);
    const m = new THREE.Mesh(geo, [alu, alu, std({ map: t, roughness: 0.45, metalness: 0.1 }), alu, alu, alu]); m.castShadow = true;
    return m;
  };
  const rN = G(BT[0][0], TOP + 0.6, -BT[0][1] - 4.5); const rNm = mkRuler(95, "95 km", 1); rNm.rotation.x = 0.75; rN.add(rNm);
  const wdx = BT[3][0] - BT[0][0], wdz = -(BT[3][1] - BT[0][1]);
  const rW = G(BT[0][0] - 4, TOP + 0.6, -BT[0][1] + 1); rW.rotation.y = -Math.atan2(wdz, wdx); const rWm = mkRuler(49, "49 km", 2); rWm.rotation.x = 0.55; rWm.position.z = 3; rW.add(rWm);

  // thermometer (s2)
  const thermo = G(-168, 2, 50); thermo.rotation.y = 0.25;
  const thT = label(256, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "#E7EAEE"); gr.addColorStop(1, "#C9CED6"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let c = 0; c <= 50; c++) { const y = h - (60 + c * (h - 140) / 50), maj = c % 10 === 0; g.fillStyle = c >= 40 ? RED : "#14181E"; g.fillRect(maj ? 150 : 170, y - 1.5, maj ? 70 : 40, 3); if (maj) { g.font = `700 40px ${JM}`; g.textAlign = "right"; g.fillText(String(c), 140, y + 14); } }
    g.font = `700 44px ${SG}`; g.textAlign = "center"; g.fillStyle = "#14181E"; g.fillText("°C", w / 2, 50);
  });
  const TH0 = 9, TH50 = 61, TH = (c) => TH0 + (TH50 - TH0) * c / 50;
  const thPlate = add(new THREE.Mesh(new THREE.BoxGeometry(16, 68, 1.4), [alu, alu, alu, alu, std({ map: thT, roughness: 0.5, metalness: 0.2 }), alu]), thermo); thPlate.position.set(-5, 36, -2);
  add(new THREE.Mesh(new THREE.CylinderGeometry(9, 10, 2.4, 24), darkM), thermo).position.set(0, 1.2, 0);
  const glass = phys({ color: 0xffffff, roughness: 0.05, transmission: 0.9, thickness: 0.6, transparent: true, opacity: 0.35, clearcoat: 1, envMapIntensity: ENV * 2 });
  add(new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 58, 20), glass), thermo).position.set(3.5, 36, 0);
  add(new THREE.Mesh(new THREE.SphereGeometry(4.2, 24, 16), glass), thermo).position.set(3.5, 6.2, 0);
  const redL = std({ color: 0xe0352a, roughness: 0.25, emissive: 0x8a1408, emissiveIntensity: 0.6 });
  add(new THREE.Mesh(new THREE.SphereGeometry(3.4, 20, 14), redL), thermo).position.set(3.5, 6.2, 0);
  const liq = add(new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 1, 14).translate(0, 0.5, 0), redL), thermo); liq.position.set(3.5, 7, 0);
  const brk = G(0, 0, 0, thermo); add(new THREE.Mesh(new THREE.BoxGeometry(8, 1, 1), orangeM), brk).position.set(10, 0, 0);
  const t45T = label(512, 192, (g, w, h) => { g.fillStyle = "rgba(17,21,27,.92)"; rr(g, 0, 0, w, h, 26); g.fill(); g.fillStyle = AMBER; g.fillRect(0, 0, 18, h); g.textAlign = "center"; g.fillStyle = "#fff"; g.font = `700 112px ${SG}`; g.fillText("45 °C", w / 2 + 8, 136); });
  const t45 = new THREE.Mesh(new THREE.PlaneGeometry(26, 9.75), new THREE.MeshBasicMaterial({ map: t45T, transparent: true, toneMapped: false, fog: false })); t45.position.set(28, 0, 0); brk.add(t45);
  blob(30, 30, -168, 2.05, 50, 0.4);

  // herders' tents (s4)
  const tentT = canvasTex(256, 128, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#6B3E2A" : "#D9C8A6"; g.fillRect(i * w / 8, 0, w / 8, h); } g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(0, h * 0.7, w, h * 0.3); });
  const tents = [[-74, 9], [-66, 15], [-90, 26]].map(([x, z], i) => { const T = G(x, TOP, z); const m = add(new THREE.Mesh(new THREE.ConeGeometry(3.6, 4.6, 7), std({ map: tentT, roughness: 0.9 })), T); m.position.y = 2.3; m.rotation.y = i; const d = add(new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.2), std({ color: 0x1c120a })), T, false); d.position.set(0, 1.1, 2.7); d.rotation.x = -0.6; T.visible = false; return T; });

  // ---------- 1899 line (red, solid, straight on 22° N) ----------
  const COAST22 = PX(36.87);
  const redLine = add(new THREE.Mesh(new THREE.BoxGeometry(1, 3.2, 2.8).translate(0.5, 0, 0), std({ color: 0xe04a3a, roughness: 0.4, emissive: 0xb0261a, emissiveIntensity: 0.55 })), scene, true);
  redLine.position.set(X0, 3.3, 0);
  const redLen = COAST22 - X0;
  // ---------- 1902 line (blue dashes, taller): along 22° N (offset north), around Bir Tawil (outside), up the Halaib edge ----------
  const grow = (P, c, f) => P.map((p) => [c[0] + (p[0] - c[0]) * f, c[1] + (p[1] - c[1]) * f]);
  const btO = grow(BT, BTC, 1.1);
  const bluePath = [[X0, 3.2], [btO[0][0], 3.2], btO[3], btO[2], btO[1], [HAL[0][0] + 1.5, 2.2], HAL[1]];
  const segs = []; let blueLen = 0;
  for (let i = 0; i < bluePath.length - 1; i++) { const a = bluePath[i], b = bluePath[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push([a, b, blueLen, L]); blueLen += L; }
  const blueM = std({ color: 0x2d6cdf, roughness: 0.35, emissive: 0x1840a0, emissiveIntensity: 0.6 });
  const dashes = [];
  for (let s = 0; s < blueLen; s += 13) {
    const sg = segs.find((q) => s >= q[2] && s < q[2] + q[3]) || segs[segs.length - 1];
    const u = (s - sg[2]) / sg[3], len = Math.min(8, sg[2] + sg[3] - s);
    if (len < 2) continue;
    const a = sg[0], b = sg[1], dx = (b[0] - a[0]) / sg[3], dy = (b[1] - a[1]) / sg[3];
    const m = add(new THREE.Mesh(new THREE.BoxGeometry(len, 5, 2.6), blueM), scene, true);
    m.position.set(a[0] + (b[0] - a[0]) * u + dx * len / 2, 4.6, -(a[1] + (b[1] - a[1]) * u + dy * len / 2));
    m.rotation.y = Math.atan2(dy, dx);
    m.userData.s = s; m.visible = false; dashes.push(m);
  }

  // ---------- map overlays: Halaib hatch/outline (s4), claim tints (s5) ----------
  const EGSU = LAND.filter((c) => c.name === "Egypt" || c.name === "Sudan");
  const landClip = (g) => { g.beginPath(); for (const c of EGSU) for (const rg of c.rings) polyPath(g, rg); g.clip(); };
  const hatch = (g, col, dir, step = 14, lw = 3) => { g.strokeStyle = col; g.lineWidth = lw; for (let k = -CH; k < CW + CH; k += step) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + dir * CH, CH); g.stroke(); } };
  const egT = canvasTex(CW, CH, (g) => { g.save(); landClip(g); g.beginPath(); g.rect(0, 0, CW, cy(0)); g.clip(); g.fillStyle = "rgba(224,74,58,.30)"; g.fillRect(0, 0, CW, CH); hatch(g, "rgba(200,40,30,.35)", 1); g.restore(); });
  const suT = canvasTex(CW, CH, (g) => {
    g.save(); landClip(g);
    g.beginPath(); g.rect(0, cy(0), CW, CH); polyPath(g, HAL); g.clip("evenodd");
    g.fillStyle = "rgba(45,108,223,.30)"; g.fillRect(0, 0, CW, CH); hatch(g, "rgba(30,80,200,.35)", -1); g.restore();
    g.globalCompositeOperation = "destination-out"; g.beginPath(); polyPath(g, BT); g.fill(); g.globalCompositeOperation = "source-over";
  });
  const halT = canvasTex(CW, CH, (g) => { g.save(); g.beginPath(); polyPath(g, HAL); g.clip(); g.fillStyle = "rgba(255,255,255,.16)"; g.fillRect(0, 0, CW, CH); g.restore(); g.setLineDash([10, 7]); g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = 4; g.beginPath(); polyPath(g, HAL); g.stroke(); });
  const overlay = (tx, y, clipPlane) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH), new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, clippingPlanes: clipPlane ? [clipPlane] : [] }));
    m.rotation.x = -Math.PI / 2; m.position.set((X0 + X1) / 2, y, -(Y0 + Y1) / 2); m.renderOrder = 3; scene.add(m); return m;
  };
  const egClip = new THREE.Plane(new THREE.Vector3(0, 0, -1), -Y1), suClip = new THREE.Plane(new THREE.Vector3(0, 0, 1), Y0);
  const egO = overlay(egT, 2.4, egClip), suO = overlay(suT, 2.6, suClip), halO = overlay(halT, 2.8);

  // ---------- pins: screen-facing tags on thin posts ----------
  const pins = [];
  const tagPaint = (txt, sub, acc) => (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "rgba(14,17,22,.9)"; rr(g, 2, 2, w - 4, h - 4, h * 0.14); g.fill();
    g.strokeStyle = "rgba(255,255,255,.16)"; g.lineWidth = 3; rr(g, 2, 2, w - 4, h - 4, h * 0.14); g.stroke();
    g.fillStyle = acc; g.fillRect(2, h * 0.14, 16, h * 0.72);
    g.textAlign = "left"; g.fillStyle = "#FFFFFF";
    if (sub) {
      fitFont(g, txt, 700, SG, Math.round(h * 0.4), w - 80); g.fillText(txt, 44, h * 0.5);
      g.fillStyle = acc; fitFont(g, sub, 700, JM, Math.round(h * 0.22), w - 80); g.fillText(sub, 46, h * 0.82);
    } else { fitFont(g, txt, 700, SG, Math.round(h * 0.56), w - 80); g.fillText(txt, 44, h * 0.7); }
  };
  const pin = ({ x, z, y = 2, w, h, txt, sub, acc = AMBER, win, post = 0, kind = "map", paint, follow }) => {
    const Gp = G(x, y, z);
    const pw = Math.round(1024), ph = Math.round(1024 * h / w);
    const tx = label(pw, ph, paint || tagPaint(txt, sub, acc));
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tx, transparent: true, toneMapped: false, fog: false, depthWrite: false }));
    pl.position.y = post + h / 2; pl.renderOrder = 6; Gp.add(pl);
    if (post > 0) { const p = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.006, w * 0.006, post, 6), new THREE.MeshBasicMaterial({ color: 0x14181e, fog: false })); p.position.y = post / 2; Gp.add(p); const d = new THREE.Mesh(new THREE.SphereGeometry(w * 0.02, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(acc), toneMapped: false, fog: false })); Gp.add(d); }
    Gp.visible = false;
    const o = { G: Gp, pl, win, kind, follow, pulse: [] }; pins.push(o); return o;
  };
  const END = K.dur + 5;
  const MP = 44; // map tag height
  const pBT = pin({ x: -70, z: -BTC[1], w: 150, h: MP, txt: "BIR TAWIL", sub: "2.060 km²", win: [A("s2:Letaknya"), A("s5:Sudan#2")], post: 60 });
  const pNone = pin({ x: -70, z: -BTC[1], w: 170, h: MP, txt: "TIDAK DIKLAIM", sub: "BIR TAWIL", acc: AMBER, win: [A("s5:Sudan#2"), END], post: 60 });
  const pMesir = pin({ x: -75, z: -75, w: 150, h: 50, txt: "MESIR", win: [A("s2:Mesir") - 0.1, END], post: 20, acc: "#C9CED6" });
  const pSudan = pin({ x: -60, z: 55, w: 150, h: 50, txt: "SUDAN", win: [A("s2:Sudan") - 0.1, END], post: 20, acc: "#C9CED6" });
  const pHal = pin({ x: 85, z: -60, w: 190, h: MP, txt: "SEGITIGA HALAIB", sub: "DI TEPI LAUT MERAH", acc: "#FFFFFF", win: [A("s4:Segitiga"), A("s5:Sudan#2")], post: 40 });
  const pBoth = pin({ x: 85, z: -60, w: 200, h: MP, txt: "DIKLAIM KEDUANYA", sub: "SEGITIGA HALAIB", acc: PURP, win: [A("s5:Sudan#2"), END], post: 40 });
  const pKairo = pin({ x: 40, z: -150, w: 160, h: MP, txt: "↑ KAIRO", sub: "MENGURUS BIR TAWIL", acc: BLUE, win: [A("s4:Kairo") - 0.2, K.s5 + 0.3], post: 10 });
  pSudan.pulse.push(A("s3:Sudan"), A("s4:Sudan"));
  pBT.pulse.push(A("s4:Bir")); pHal.pulse.push(A("s4:Halaib"), A("s5:Halaib")); pBoth.pulse.push(A("s5:Halaib#2") + 1.2); pNone.pulse.push(A("s6:Bir"));
  // near-scale tags on the plot
  const pAbabda = pin({ x: -70, z: 13, y: TOP, w: 40, h: 11, txt: "SUKU ABABDA", sub: "PADANG GEMBALA", acc: BLUE, win: [A("s4:suku") - 0.3, A("s4:Bir") + 0.5], post: 12, kind: "near" });
  const iconPaint = (kind) => (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = "rgba(14,17,22,.9)"; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 6, 0, 6.28); g.fill();
    g.lineWidth = 14; g.strokeStyle = "#fff"; g.fillStyle = kind === "drop" ? "#3FA9F5" : "#E9ECF0";
    if (kind === "drop") { g.beginPath(); g.moveTo(w / 2, h * 0.2); g.bezierCurveTo(w * 0.72, h * 0.45, w * 0.7, h * 0.74, w / 2, h * 0.76); g.bezierCurveTo(w * 0.3, h * 0.74, w * 0.28, h * 0.45, w / 2, h * 0.2); g.fill(); }
    else { g.beginPath(); g.moveTo(w * 0.27, h * 0.5); g.lineTo(w / 2, h * 0.27); g.lineTo(w * 0.73, h * 0.5); g.lineTo(w * 0.73, h * 0.75); g.lineTo(w * 0.27, h * 0.75); g.closePath(); g.fill(); }
    g.strokeStyle = RED; g.lineWidth = 26; g.lineCap = "round"; g.beginPath(); g.moveTo(w * 0.22, h * 0.22); g.lineTo(w * 0.78, h * 0.78); g.stroke();
    g.lineWidth = 12; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 12, 0, 6.28); g.stroke();
  };
  const pDrop = pin({ x: -112, z: 11, y: TOP, w: 14, h: 14, win: [A("s7:air") - 0.2, A("s7:jauh") - 0.2], post: 13, kind: "near", paint: iconPaint("drop"), acc: RED });
  const pHouse = pin({ x: -84, z: 8, y: TOP, w: 14, h: 14, win: [A("s7:permukiman") - 0.2, A("s7:jauh") - 0.2], post: 13, kind: "near", paint: iconPaint("house"), acc: RED });

  // ---------- arrows (s4): "diurus dari Kairo", "diurus dari Sudan" ----------
  const arrow = (from, to, hgt, col) => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), m = a.clone().lerp(b, 0.5); m.y += hgt;
    const cv = new THREE.QuadraticBezierCurve3(a, m, b);
    const geo = new THREE.TubeGeometry(cv, 80, 3, 8);
    const mat = std({ color: col, roughness: 0.35, emissive: col, emissiveIntensity: 0.35 });
    const tube = add(new THREE.Mesh(geo, mat), scene, true);
    const head = add(new THREE.Mesh(new THREE.ConeGeometry(8, 18, 14), mat), scene, true);
    head.position.copy(b); head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cv.getTangent(1).normalize());
    return { tube, head, geo };
  };
  const arK = arrow([BTC[0], 6, -BTC[1] - 10], [40, 8, -145], 60, 0x3f7fe8);
  const arS = arrow([HALC[0], 6, -HALC[1] + 10], [-120, 8, 92], 80, 0x3f7fe8);

  // ---------- balance (s6) ----------
  const Bx = -30, Bz = -215, PIV = 252, L = 190, CHN = 122;
  const bal = G(Bx, -400, Bz);
  const plT = label(1024, 128, (g, w, h) => { g.fillStyle = "#1B1F25"; g.fillRect(0, 0, w, h); g.textAlign = "center"; g.font = `700 64px ${SG}`; g.fillStyle = AMBER; g.fillText("AUDIRA · TIMBANGAN LUAS", w / 2, 86); });
  add(new THREE.Mesh(new THREE.CylinderGeometry(52, 60, 16, 48), [darkM, std({ map: plT, roughness: 0.5 }), darkM]), bal).position.y = 8;
  add(new THREE.Mesh(new THREE.CylinderGeometry(7, 9, PIV - 16, 24), alu), bal).position.y = 16 + (PIV - 16) / 2;
  add(new THREE.Mesh(new THREE.BoxGeometry(30, 24, 24), darkM), bal).position.y = PIV;
  const dialT = canvasTex(512, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "#F2973A"; g.lineWidth = 8; g.beginPath(); g.arc(w / 2, h, h - 20, Math.PI, 2 * Math.PI); g.stroke(); for (let k = -6; k <= 6; k++) { const a = -Math.PI / 2 + k * 0.12, R0 = h - 34, R1 = h - (k % 3 === 0 ? 70 : 52); g.lineWidth = k === 0 ? 8 : 4; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * R0, h + Math.sin(a) * R0); g.lineTo(w / 2 + Math.cos(a) * R1, h + Math.sin(a) * R1); g.stroke(); } });
  const dial = new THREE.Mesh(new THREE.PlaneGeometry(64, 32), new THREE.MeshBasicMaterial({ map: dialT, transparent: true, toneMapped: false, fog: false })); dial.position.set(0, PIV + 14, 12.5); bal.add(dial);
  const needle = G(0, PIV, 13, bal); add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 34, 1), orangeM), needle).position.y = 17;
  const beam = G(0, PIV, 0, bal);
  add(new THREE.Mesh(new THREE.BoxGeometry(2 * L + 10, 9, 11), alu), beam);
  for (const s of [-1, 1]) add(new THREE.Mesh(new THREE.SphereGeometry(7, 20, 14), brass), beam).position.x = s * L;
  add(new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 30, 20), brass), beam).rotation.x = Math.PI / 2;
  const trayW = 176, trayD = 104;
  const mkTray = () => {
    const T = G(0, 0, 0, bal);
    add(new THREE.Mesh(new THREE.BoxGeometry(trayW, 3.5, trayD), alu), T);
    for (const [w, d, x, z] of [[trayW, 3, 0, trayD / 2], [trayW, 3, 0, -trayD / 2], [3, trayD, trayW / 2, 0], [3, trayD, -trayW / 2, 0]]) add(new THREE.Mesh(new THREE.BoxGeometry(w, 6, d), darkM), T).position.set(x, 3, z);
    const hook = new THREE.Vector3(0, 72, 0);
    for (const [x, z] of [[-trayW / 2 + 6, -trayD / 2 + 6], [trayW / 2 - 6, -trayD / 2 + 6], [-trayW / 2 + 6, trayD / 2 - 6], [trayW / 2 - 6, trayD / 2 - 6]]) {
      const a = new THREE.Vector3(x, 2, z), d = hook.clone().sub(a), len = d.length();
      const rod = add(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, len, 6), alu), T); rod.position.copy(a).addScaledVector(d, 0.5); rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    }
    const top = add(new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, CHN - 72, 6), alu), T); top.position.y = 72 + (CHN - 72) / 2;
    return T;
  };
  const trayL = mkTray(), trayR = mkTray();
  // the two plots, same scale (honest area ratio), sand top
  const pieceTop = std({ map: canvasTex(512, 512, sandPaint(55, "#C99A5B", 1.4), [1 / 22, 1 / 22]), roughness: 0.9, bumpMap: rippleT, bumpScale: 0.6 });
  const pieceSide = std({ color: 0xb48858, roughness: 0.9 });
  const SC = 0.5;
  const mkPiece = (P, c, col) => { const Gp = G(); const m = add(new THREE.Mesh(extr(P, 14, c), [pieceTop, pieceSide]), Gp); m.rotation.x = -Math.PI / 2; const loop = [...P, P[0]].map((p) => new THREE.Vector3(p[0] - c[0], 14.3, -(p[1] - c[1]))); Gp.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(loop, false, "catmullrom", 0), 120, 1.6, 6), new THREE.MeshBasicMaterial({ color: col, toneMapped: false, fog: false }))); Gp.visible = false; return Gp; };
  const pcBT = mkPiece(BT, BTC, 0xffb35c), pcHal = mkPiece(HAL, HALC, 0xfff1d6);
  { const coast = COAST_HAL.map((p) => new THREE.Vector3(p[0] - HALC[0], 14.4, -(p[1] - HALC[1]))); add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coast), 40, 2.2, 8), std({ color: 0x2aa7d6, roughness: 0.2, emissive: 0x0b6d96, emissiveIntensity: 0.8 })), pcHal); }
  const pTL = pin({ x: 0, z: 0, w: 150, h: 40, txt: "BIR TAWIL", sub: "SKALA SAMA", acc: AMBER, win: [A("s6:Mengklaim"), K.s7], post: 0 });
  const pTR = pin({ x: 0, z: 0, w: 190, h: 40, txt: "HALAIB ≈ 10×", sub: "LEBIH LUAS · BERPANTAI", acc: TEAL, win: [A("s6:sepuluh") - 0.2, K.s7], post: 0 });

  // ---------- micronation flags (s7): invented, generic designs ----------
  const flagPaint = [
    (g, w, h) => { g.fillStyle = "#1E8C7E"; g.fillRect(0, 0, w, h); g.fillStyle = "#F4C542"; g.beginPath(); g.arc(w * 0.5, h * 0.5, h * 0.26, 0, 6.28); g.fill(); },
    (g, w, h) => { g.fillStyle = "#23305E"; g.fillRect(0, 0, w, h); g.fillStyle = "#F07A2B"; g.beginPath(); g.moveTo(0, h); g.lineTo(w, 0); g.lineTo(w, h); g.fill(); star(g, w * 0.28, h * 0.32, h * 0.16); },
    (g, w, h) => { ["#1A1A1A", "#F2C230", "#E8577E"].forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * h / 3, w, h / 3 + 1); }); },
    (g, w, h) => { g.fillStyle = "#F1F1EC"; g.fillRect(0, 0, w, h); g.fillStyle = "#2E8B3E"; g.beginPath(); g.moveTo(0, 0); g.lineTo(w * 0.42, h / 2); g.lineTo(0, h); g.fill(); g.fillStyle = "#2E8B3E"; g.fillRect(w * 0.55, h * 0.4, w * 0.35, h * 0.2); },
    (g, w, h) => { g.fillStyle = "#6B3FA0"; g.fillRect(0, 0, w, h); g.strokeStyle = "#FFFFFF"; g.lineWidth = 10; g.strokeRect(w * 0.3, h * 0.25, w * 0.4, h * 0.5); g.strokeRect(w * 0.4, h * 0.38, w * 0.2, h * 0.24); },
  ];
  function star(g, x, y, R) { g.fillStyle = "#fff"; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr2 = k % 2 ? R * 0.45 : R; g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } g.fill(); }
  const poleM = std({ color: 0xcfd3d8, metalness: 0.8, roughness: 0.3 });
  const mkFlag = (x, z, paint, size = 1) => {
    const F = G(x, TOP, z); const P = G(0, 0, 0, F);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.28 * size, 0.32 * size, 22 * size, 8).translate(0, 11 * size, 0), poleM), P);
    add(new THREE.Mesh(new THREE.SphereGeometry(0.6 * size, 10, 8), brass), P).position.y = 22.2 * size;
    const geo = new THREE.PlaneGeometry(12 * size, 8 * size, 18, 8); geo.translate(6 * size, 0, 0);
    const cloth = add(new THREE.Mesh(geo, std({ map: canvasTex(256, 170, paint), roughness: 0.85, side: THREE.DoubleSide })), P); cloth.position.y = 17.5 * size;
    cloth.userData.base = Float32Array.from(geo.attributes.position.array);
    const sh = blob(5, 5, x, TOP + 0.04, z, 0.4);
    F.visible = false; return { F, P, cloth, sh, size };
  };
  const flags = [[-131, 11], [-121, 15], [-94, 4], [-73, 7], [-67, 15]].map(([x, z], i) => mkFlag(x, z, flagPaint[i]));
  const qFlag = mkFlag(-95, 17, (g, w, h) => { g.fillStyle = "#F7F7F4"; g.fillRect(0, 0, w, h); g.fillStyle = "#14181E"; g.font = `700 140px ${SG}`; g.textAlign = "center"; g.fillText("?", w / 2, h * 0.8); g.fillStyle = AMBER; g.fillRect(0, h - 14, w, 14); }, 1.35);
  const waveFlag = (fl, t, ph) => { const p = fl.cloth.geometry.attributes.position, b = fl.cloth.userData.base, sz = fl.size; for (let i = 0; i < p.count; i++) { const x = b[i * 3], u = x / (12 * sz); p.setZ(i, (Math.sin(x * 0.5 / sz - t * 6.5 + ph) * 0.9 + Math.sin(x * 1.1 / sz - t * 9 + ph) * 0.25) * u * sz); p.setY(i, b[i * 3 + 1] - u * u * 0.5 * sz); } p.needsUpdate = true; fl.cloth.geometry.computeVertexNormals(); };

  // ---------- s7 ruler to the sea: >= 200 km ----------
  const zR = 12, xR0 = -58, xR1 = PX(36.877);
  const LR = xR1 - xR0;
  const seaRT = label(4096, 160, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#F4F5F7"); gr.addColorStop(1, "#D3D8DF"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const px = w / LR; g.fillStyle = "#14181E";
    for (let k = 0; k <= LR; k += 5) { const maj = k % 50 === 0; g.fillRect(k * px - (maj ? 3 : 1.5), 0, maj ? 6 : 3, maj ? 70 : 34); }
    g.font = `700 50px ${JM}`; g.textAlign = "center"; g.fillText("0", 30, 128); g.fillText("100 km", 100 * px, 128);
    g.fillStyle = "#C2410C"; g.fillRect(200 * px - 5, 0, 10, h); g.fillText("200 km", 200 * px - 120, 128);
    g.textAlign = "right"; g.fillStyle = "#1F6F98"; g.fillText("LAUT MERAH →", w - 20, 128);
  });
  const seaRuler = G(xR0, TOP + 1.2, zR);
  { const geo = new THREE.BoxGeometry(LR, 1, 12); geo.translate(LR / 2, 0, 0); const m = add(new THREE.Mesh(geo, [alu, alu, std({ map: seaRT, roughness: 0.45, metalness: 0.1 }), alu, alu, alu]), seaRuler); m.rotation.x = 0.5; }
  const p200 = pin({ x: -42, z: 14, y: TOP, w: 44, h: 12, txt: "≥ 200 km", sub: "DARI LAUT MERAH →", acc: AMBER, win: [A("s7:jauh"), A("s7:Banyak")], post: 12, kind: "near" });

  // ---------- drifting sand near the plot ----------
  const dust = pts(scene, 220, { color: 0xf3dcb0, size: 0.7, add: false, opacity: 0.75 });
  const dSeed = Array.from({ length: 220 }, (_, i) => { const q = mulberry(500 + i); return [q() * 2 - 1, q(), q() * 2 - 1, q() * 6.28, 0.6 + q() * 1.4]; });

  // ---------- camera ----------
  const cv = (tx, ty, tz, d, el, yaw = 0) => { const e = el * Math.PI / 180; return [tx + d * Math.cos(e) * Math.sin(yaw), ty + d * Math.sin(e), tz + d * Math.cos(e) * Math.cos(yaw), tx, ty, tz]; };
  const tBTx = BTC[0], tBTz = -BTC[1];
  const keys = [
    [0, ...cv(-88, 21, 21, 112, 11, 0.2)],
    [A("s1:lebih"), ...cv(-88, 8, 18, 110, 24, 0.2)],
    [A("s1:persegi"), ...cv(tBTx - 2, 4, tBTz + 2, 205, 44, 0.1)],
    [K.s1e, ...cv(tBTx - 2, 4, tBTz + 2, 222, 48, 0.06)],
    [A("s2:artinya"), ...cv(-109, 10, 13, 88, 26, -0.12)],
    [A("s2:tinggi") + 0.3, ...cv(-109, 10, 13, 94, 28, -0.18)],
    [A("s2:Mesir"), ...cv(-70, 0, -5, 620, 58, 0)],
    [A("s2:Sudan") + 0.6, ...cv(-70, 0, -5, 640, 58, 0.03)],
    [A("s2:bisa"), ...cv(-160, 34, 48, 205, 13, 0.25)],
    [K.s2e, ...cv(-158, 34, 48, 222, 14, 0.28)],
    [K.s3 + 2.1, ...cv(-60, 0, -8, 700, 58, 0)],
    [A("s3:garis"), ...cv(-50, 0, -10, 740, 58, 0)],
    [A("s3:derajat") + 0.5, ...cv(10, 0, -15, 900, 58, 0)],
    [K.s3e, ...cv(30, 0, -20, 1040, 58, 0)],
    [A("s4:garis"), ...cv(30, 0, -20, 1050, 58, 0)],
    [A("s4:gembala") - 0.3, ...cv(-88, 0, 14, 330, 48, 0.1)],
    [A("s4:setempat"), ...cv(-88, 0, 14, 345, 50, 0.12)],
    [A("s4:Kairo"), ...cv(30, 0, -20, 1050, 58, 0)],
    [A("s4:Merah"), ...cv(30, 0, -20, 1060, 58, 0)],
    [K.s4e, ...cv(30, 0, -20, 1060, 58, 0.02)],
    [A("s5:1899"), ...cv(30, 0, -20, 1060, 58, 0.06)],
    [A("s5:Mesir#2"), ...cv(30, 0, -20, 1060, 58, 0.08)],
    [A("s5:1902"), ...cv(30, 0, -20, 1060, 58, 0.03)],
    [K.s5e, ...cv(30, 0, -20, 1060, 58, -0.02)],
    [A("s6:Bir"), ...cv(-92, 4, 14, 290, 46, 0.08)],
    [A("s6:lain") - 0.2, ...cv(-90, 4, 12, 320, 48, 0.1)],
    [A("s6:Mengklaim") + 0.5, ...cv(Bx, 150, Bz, 1650, 14, 0)],
    [A("s6:sepuluh") + 0.4, ...cv(Bx, 150, Bz, 1560, 14, 0.02)],
    [A("s6:mau"), ...cv(Bx, 150, Bz, 1540, 15, 0.03)],
    [K.s7 + 1.0, ...cv(-100, 6, 14, 215, 34, 0.12)],
    [A("s7:permukiman") + 0.3, ...cv(-98, 6, 13, 225, 36, 0.1)],
    [A("s7:jauh") + 0.3, ...cv(-99, 10, 8, 185, 46, 0.05)],
    [A("s7:diakui") + 0.4, ...cv(-99, 8, 8, 195, 48, 0.03)],
    [A("s8:peta"), ...cv(30, 0, -20, 1060, 60, 0)],
    [A("s8:Menurut"), ...cv(30, 0, -20, 1080, 61, 0)],
    [A("s8:Ikuti"), ...cv(-108, 10, 12, 205, 26, 0.24)],
    [K.dur, ...cv(-108, 10, 12, 196, 26, 0.28)],
  ];
  const camT = track(keys);
  const tgt = new THREE.Vector3();
  const pump = (t, a, up = 0.12, down = 0.9) => (t < a ? 0 : t < a + up ? (t - a) / up : Math.max(0, 1 - (t - a - up) / down));
  const win = (t, a, b, i = 0.4, o = 0.3) => clamp01((t - a) / i) * (1 - clamp01((t - b) / o));
  const tmp = new THREE.Vector3();

  // timing
  const tRed0 = A("s3:garis") - 0.2, tRed1 = A("s3:derajat") + 0.3;
  const tBl0 = A("s4:garis") - 0.2, tBl1 = A("s4:setempat") + 0.4;
  const tEg0 = A("s5:Mesir") - 0.1, tEg1 = A("s5:1899") + 0.5;
  const tSu0 = A("s5:Sudan") - 0.1, tSu1 = A("s5:1902") + 0.5;
  const tBal0 = K.s6 - 0.4, tBal1 = K.s7 + 1.4;
  const fBT = [K.s6 + 0.2, 1.1], fHal = [K.s6 + 0.7, 1.2], tTilt = A("s6:sepuluh") - 0.3;
  const tFlag = A("s7:jauh") - 0.1, tTop = A("s7:tidak#3");

  return (t) => {
    if (!labels.done && document.fonts && document.fonts.check(`700 40px "Space Grotesk"`) && document.fonts.check(`700 40px "JetBrains Mono"`)) {
      labels.done = true;
      for (const [tx, paint] of labels) { const c = tx.image, g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); paint(g, c.width, c.height); tx.needsUpdate = true; }
    }
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.25, c[1] + Math.sin(t * 0.29) * 0.18, c[2] + Math.cos(t * 0.31) * 0.2);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    const dist = cam.position.distanceTo(tgt);
    // key light follows the view; shadow box scales with it
    key.target.position.copy(tgt); key.position.set(tgt.x - dist * 1.25, tgt.y + dist * 0.62, tgt.z + dist * 0.75);
    const sb = Math.max(70, dist * 0.75);
    Object.assign(key.shadow.camera, { left: -sb, right: sb, top: sb, bottom: -sb, near: 1, far: dist * 5 + 900 }); key.shadow.camera.updateProjectionMatrix();

    // rulers along the plot edges
    const uR = eout(clamp01((t - A("s1:lebih")) / 1.4)) * (1 - smooth(clamp01((t - K.s3) / 0.8)));
    rN.scale.set(Math.max(0.001, uR), 1, 1); rN.visible = uR > 0.002;
    const uW = eout(clamp01((t - A("s1:lebih") - 0.4) / 1.2)) * (1 - smooth(clamp01((t - K.s3) / 0.8)));
    rW.scale.set(Math.max(0.001, uW), 1, 1); rW.visible = uW > 0.002;
    // thermometer rises, liquid climbs to 45 by "lima"
    const uTh = back(clamp01((t - A("s2:suhunya") + 0.7) / 0.7), 1.2) * (1 - smooth(clamp01((t - K.s3 - 1.2) / 0.8)));
    thermo.scale.setScalar(Math.max(0.001, uTh)); thermo.visible = uTh > 0.002;
    const deg = 24 + 21 * smooth(clamp01((t - A("s2:empat") + 0.2) / (A("s2:derajat") - A("s2:empat") - 0.1)));
    liq.scale.y = Math.max(0.01, TH(deg) - 7);
    brk.position.set(3.5, TH(45), 0); brk.visible = t > A("s2:empat");
    t45.material.opacity = clamp01((t - A("s2:derajat") + 0.6) / 0.3); t45.quaternion.copy(cam.quaternion); thermo.updateMatrixWorld();
    { const q = new THREE.Quaternion(); thermo.getWorldQuaternion(q); t45.quaternion.premultiply(q.invert()); }
    // tents
    tents.forEach((T, i) => { const u = back(clamp01((t - A("s4:gembala") + 0.4 - i * 0.15) / 0.4), 1.6) * (1 - smooth(clamp01((t - K.s5) / 0.6))); T.scale.setScalar(Math.max(0.001, u)); T.visible = u > 0.002; });

    // 1899 red line draws west to east
    const uRed = smooth(clamp01((t - tRed0) / (tRed1 - tRed0)));
    redLine.scale.x = Math.max(0.01, redLen * uRed); redLine.visible = uRed > 0.001;
    redLine.material.emissiveIntensity = 0.55 + 0.9 * pump(t, A("s5:1899"), 0.15, 1.2) + 0.6 * pump(t, A("s8:garis"), 0.15, 1.2);
    // 1902 blue dashes draw along the path
    const sBl = blueLen * smooth(clamp01((t - tBl0) / (tBl1 - tBl0)));
    for (const d of dashes) { const v = clamp01((sBl - d.userData.s) / 8); d.visible = v > 0; d.scale.y = Math.max(0.01, v); }
    blueM.emissiveIntensity = 0.6 + 0.9 * pump(t, A("s5:1902"), 0.15, 1.2) + 0.6 * pump(t, A("s8:garis"), 0.15, 1.2);
    // Halaib outline/hatch from s4
    halO.material.opacity = clamp01((t - A("s4:Segitiga") + 0.2) / 0.5) * (0.75 + 0.25 * pump(t, A("s5:Halaib#2") + 1.2, 0.15, 1.5));
    // claim tints sweep
    const uEg = smooth(clamp01((t - tEg0) / (tEg1 - tEg0)));
    egO.material.opacity = uEg > 0 ? 1 : 0;
    egClip.constant = -Y1 + (Y1 - Y0 + 20) * uEg;
    const uSu = smooth(clamp01((t - tSu0) / (tSu1 - tSu0)));
    suClip.constant = Y0 + (Y1 - Y0 + 20) * uSu; // (0,0,1)·p + c >= 0 -> z >= -c, front runs from the south edge north
    suO.material.opacity = uSu > 0 ? 1 : 0;
    const farK = 0.18 + 0.82 * clamp01((dist - 300) / 600);
    egO.material.opacity *= farK; suO.material.opacity *= farK; halO.material.opacity *= farK;
    // Bir Tawil glows: unclaimed
    const gl = clamp01((t - A("s5:Sudan#2")) / 0.6) * 0.5 + 1.2 * pump(t, A("s6:Bir"), 0.2, 2.0) + 0.6 * pump(t, A("s8:dua"), 0.2, 1.6);
    outline.material.opacity = Math.min(1, gl); btTop.emissiveIntensity = 0.12 * Math.min(1, gl);

    // arrows
    const uK = smooth(clamp01((t - A("s4:Kairo") + 0.8) / 0.9)), uS = smooth(clamp01((t - A("s4:Halaib") + 0.3) / 0.9));
    const fade = 1 - smooth(clamp01((t - K.s5) / 0.6));
    for (const [ar, u] of [[arK, uK], [arS, uS]]) { const n = Math.floor(u * 80) * 8 * 6; ar.geo.setDrawRange(0, n); ar.tube.visible = u > 0.01 && fade > 0.01; ar.head.visible = u > 0.97 && fade > 0.01; ar.tube.scale.setScalar(1); ar.head.scale.setScalar(Math.max(0.001, fade)); }

    // balance rises, plots fly to the trays, Halaib tray drops
    const uB = smooth(clamp01((t - tBal0) / 1.3)) * (1 - smooth(clamp01((t - tBal1) / 1.2)));
    bal.position.y = -330 * (1 - uB); bal.visible = uB > 0.001;
    const fl = (f) => clamp01((t - f[0]) / f[1]);
    const lBT = fl(fBT), lHal = fl(fHal);
    let th = 0;
    if (lBT >= 1) th += 0.06 * (1 - Math.exp(-(t - fBT[0] - fBT[1]) * 6));
    if (lHal >= 1 && t >= tTilt) { const s = t - tTilt; th += -0.26 * (1 - Math.exp(-s * 3.5) * Math.cos(s * 9)); }
    beam.rotation.z = th; needle.rotation.z = th;
    const ends = [-1, 1].map((s) => new THREE.Vector3(s * L * Math.cos(th), PIV + s * L * Math.sin(th) - CHN, 0));
    trayL.position.copy(ends[0]); trayR.position.copy(ends[1]);
    bal.updateMatrixWorld(true);
    const flyTo = (pc, l, from, tray, ph) => {
      if (l <= 0 || uB <= 0.001) { pc.visible = false; return; }
      pc.visible = true;
      tmp.set(0, 3.6, 0); tray.localToWorld(tmp);
      const k = smooth(l);
      pc.position.lerpVectors(from, tmp, k); pc.position.y += Math.sin(Math.PI * k) * 160;
      pc.scale.setScalar(1 + (SC - 1) * k);
      pc.rotation.y = Math.sin(Math.PI * k) * 0.4 * ph;
    };
    flyTo(pcBT, lBT, W3(BTC, 4.6), trayL, 1);
    flyTo(pcHal, lHal, W3(HALC, 2.2), trayR, -1);
    for (const [p, tray] of [[pTL, trayL], [pTR, trayR]]) { tmp.set(0, 150, 0); tray.localToWorld(tmp); p.G.position.copy(tmp); }

    // flags rise on "mendirikan", topple on "tidak satu pun diakui"
    flags.forEach((f, i) => {
      const u = back(clamp01((t - tFlag - i * 0.17) / 0.4), 1.6);
      f.F.visible = u > 0.002; f.F.scale.set(1, Math.max(0.001, u), 1); f.sh.visible = f.F.visible;
      const d = clamp01((t - tTop - i * 0.19) / 0.55), fall = d * d;
      const bounce = d >= 1 ? Math.exp(-(t - tTop - i * 0.19 - 0.55) * 7) * Math.sin((t - tTop - i * 0.19 - 0.55) * 22) * 0.06 : 0;
      const dir = i % 2 ? 1 : -1;
      f.P.rotation.set(0.25 * dir * fall, 0, dir * (1.5 * fall - bounce));
      waveFlag(f, t, i * 1.3);
    });
    const uQ = back(clamp01((t - A("s8:kalau") + 0.2) / 0.6), 1.4);
    qFlag.F.visible = uQ > 0.002; qFlag.sh.visible = qFlag.F.visible; qFlag.F.scale.set(1, Math.max(0.001, uQ), 1); waveFlag(qFlag, t, 0.7);
    // ruler to the sea
    const uSR = smooth(clamp01((t - A("s7:jauh") + 0.3) / 1.0)) * (1 - smooth(clamp01((t - A("s7:Banyak") - 0.2) / 0.6)));
    seaRuler.scale.set(Math.max(0.001, uSR), 1, 1); seaRuler.visible = uSR > 0.002;

    // pins
    const mapVis = 1 - win(t, tBal0 + 0.6, tBal1 - 1.2, 0.4, 0.4);
    for (const p of pins) {
      if (p.follow) { /* static anchor */ }
      let s = p.win ? win(t, p.win[0], p.win[1], 0.35, 0.3) : 1;
      let ks = 1;
      if (p.kind === "map") { s *= clamp01((dist - 450) / 150) * mapVis; ks = dist / 1300; }
      else if (p.kind === "free") ks = dist / 1300;
      else s *= 1 - clamp01((dist - 420) / 200);
      if (p === pTL || p === pTR) s = (p.win ? win(t, p.win[0], p.win[1], 0.35, 0.3) : 1) * clamp01((dist - 380) / 260);
      let pu = 0; for (const a of p.pulse) pu = Math.max(pu, pump(t, a, 0.1, 0.5));
      const sc = back(s, 1.4) * (1 + 0.12 * pu) * ks;
      p.G.visible = s > 0.002; p.G.scale.setScalar(Math.max(0.001, sc));
      p.pl.quaternion.copy(cam.quaternion);
    }

    // drifting sand around the plot (near shots)
    const nearK = 1 - clamp01((dist - 300) / 200);
    dust.m.opacity = 0.75 * nearK;
    const d = dust.pos;
    for (let i = 0; i < 220; i++) { const q = dSeed[i]; const run = ((t * q[4] * 6 + q[3] * 10) % 60) - 30; d[i * 3] = tgt.x + q[0] * 50 + run; d[i * 3 + 1] = TOP + 0.4 + q[1] * 5 + Math.sin(t * 3 * q[4] + q[3]) * 0.6; d[i * 3 + 2] = tgt.z + q[2] * 40 + Math.sin(t * q[4] + q[3]) * 2; }
    dust.commit();
    comp.render();
  };
}
