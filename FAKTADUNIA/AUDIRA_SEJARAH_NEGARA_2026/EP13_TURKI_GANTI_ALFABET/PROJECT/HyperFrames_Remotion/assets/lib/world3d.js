// EP13 TEXTVOYAGE: Turkey changes its script in 1928. Monumental extruded typography in brushed concrete with titanium edges
// under warm volumetric light. Every glyph is real: text is drawn with a web font on a canvas, its outline is traced and
// extruded (Archivo Black for Latin monoliths, Amiri for the Ottoman-script tablets). Stations, separated along x:
// A  street of blade signs flipping from Ottoman script to Latin (hook)
// B  calligraphy hall: bronze Ottoman-script tablets that gently turn
// C  same hall: consonant blocks K _ R with a glowing vowel gap; Latin letters rise, then sink back (opposed)
// D  1928 monolith, then the 29-letter wall with C-cedilla, G-breve, I, I-dot, O-umlaut, S-cedilla, U-umlaut in gold (also the payoff)
// E  5 TAHUN sinks, 3 BULAN rises; Turkey plate with a touring route
// F  three date slabs: 1 NOV 1928, 1 DES 1928, 1 JAN 1929 with newspaper, street sign, book and document
// G  Q W X fenced off with red tape "DILARANG DI DOKUMEN RESMI s/d 2013"
// Station changes happen under the HTML letterform wipe. Everything is a function of t.

const FONTS = ['400 120px "Archivo Black"', '700 120px Amiri', '400 120px Amiri'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([
      Promise.all(FONTS.map((f) => document.fonts.load(f, f.includes("Amiri") ? "كتاب" : "AB19"))),
      new Promise((r) => setTimeout(r, 15000)),
    ]);
  } catch (e) { /* fall back to system fonts */ }
}

import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, stage, pts, back, smooth, envStrips } from "./lib3d.js";
import { GEO } from "./geo.js";

const LAT = '"Archivo Black", "Arial Black", sans-serif';
const ARB = 'Amiri, "Noto Naskh Arabic", "Segoe UI", Arial, sans-serif';
const RED = "#E30A17", GOLD = "#D4AF37", IVORY = "#EDE7DC", GRAPH = "#232427";

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

// ---------- glyph outlines: canvas -> pixel-edge loops -> simplified shapes ----------
function rdp(p, eps) {
  if (p.length < 3) return p;
  const keep = new Uint8Array(p.length); keep[0] = keep[p.length - 1] = 1;
  const st = [[0, p.length - 1]];
  while (st.length) {
    const [a, b] = st.pop();
    const [ax, ay] = p[a], [bx, by] = p[b], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1;
    let md = -1, mi = -1;
    for (let i = a + 1; i < b; i++) { const d = Math.abs((p[i][0] - ax) * dy - (p[i][1] - ay) * dx) / L; if (d > md) { md = d; mi = i; } }
    if (md > eps) { keep[mi] = 1; st.push([a, mi], [mi, b]); }
  }
  return p.filter((_, i) => keep[i]);
}
const area = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
function inPoly(x, y, p) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const [xi, yi] = p[i], [xj, yj] = p[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; }
  return c;
}
function traceLoops(a, w, h) {
  const ins = (x, y) => x >= 0 && y >= 0 && x < w && y < h && a[(y * w + x) * 4 + 3] > 127;
  const W1 = w + 1, E = [], out = new Map();
  const add = (x0, y0, x1, y1) => { const k = y0 * W1 + x0; E.push([x0, y0, x1, y1, 0]); let l = out.get(k); if (!l) out.set(k, (l = [])); l.push(E.length - 1); };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!ins(x, y)) continue;
    if (!ins(x, y - 1)) add(x + 1, y, x, y);
    if (!ins(x, y + 1)) add(x, y + 1, x + 1, y + 1);
    if (!ins(x - 1, y)) add(x, y, x, y + 1);
    if (!ins(x + 1, y)) add(x + 1, y + 1, x + 1, y);
  }
  const loops = [];
  for (let s = 0; s < E.length; s++) {
    if (E[s][4]) continue;
    const loop = []; let e = s;
    for (;;) {
      const ed = E[e]; ed[4] = 1; loop.push([ed[0], ed[1]]);
      const c = (out.get(ed[3] * W1 + ed[2]) || []).filter((j) => !E[j][4]);
      if (!c.length) break;
      if (c.length === 1) e = c[0];
      else { const dx = ed[2] - ed[0], dy = ed[3] - ed[1]; e = c.find((j) => dx * (E[j][3] - E[j][1]) - dy * (E[j][2] - E[j][0]) > 0) ?? c[0]; }
    }
    // drop collinear points, then simplify
    const q = loop.filter((p, i) => { const a0 = loop[(i - 1 + loop.length) % loop.length], b0 = loop[(i + 1) % loop.length]; return (p[0] - a0[0]) * (b0[1] - p[1]) - (p[1] - a0[1]) * (b0[0] - p[0]) !== 0; });
    if (q.length < 3) continue;
    let kf = 0, df = -1; for (let i = 1; i < q.length; i++) { const d = (q[i][0] - q[0][0]) ** 2 + (q[i][1] - q[0][1]) ** 2; if (d > df) { df = d; kf = i; } }
    const r = [...rdp(q.slice(0, kf + 1), 0.85), ...rdp([...q.slice(kf), q[0]], 0.85).slice(1, -1)];
    if (r.length >= 3 && Math.abs(area(r)) > 6) loops.push(r);
  }
  return loops;
}
const shapeCache = new Map();
// Returns THREE.Shapes in pixel units, centred on x, baseline at y=0 (y up), plus the pixel box.
function glyphShapes(txt, font, px, arabic) {
  const key = txt + "|" + font + "|" + px;
  if (shapeCache.has(key)) return shapeCache.get(key);
  const c = document.createElement("canvas"), g = c.getContext("2d");
  const f = `${font.split("|")[0]} ${px}px ${arabic ? ARB : LAT}`;
  g.font = f; g.direction = arabic ? "rtl" : "ltr"; g.textAlign = "left";
  const m = g.measureText(txt);
  const L = Math.ceil(m.actualBoundingBoxLeft), R = Math.ceil(m.actualBoundingBoxRight), A = Math.ceil(m.actualBoundingBoxAscent), D = Math.ceil(m.actualBoundingBoxDescent);
  const w = L + R + 8, h = A + D + 8;
  c.width = w; c.height = h;
  g.font = f; g.direction = arabic ? "rtl" : "ltr"; g.textAlign = "left"; g.fillStyle = "#fff";
  g.fillText(txt, 4 + L, 4 + A);
  const loops = traceLoops(g.getImageData(0, 0, w, h).data, w, h);
  const cx = w / 2, by = 4 + A;
  const outers = loops.filter((l) => area(l) < 0), holes = loops.filter((l) => area(l) > 0);
  const toV = (l) => l.map(([x, y]) => new THREE.Vector2(x - cx, by - y));
  const shapes = outers.map((o) => ({ o, s: new THREE.Shape(toV(o)), a: Math.abs(area(o)) }));
  for (const hl of holes) {
    let best = null;
    for (const S of shapes) if (inPoly(hl[0][0] + 0.5, hl[0][1] + 0.5, S.o) && (!best || S.a < best.a)) best = S;
    if (best) best.s.holes.push(new THREE.Path(toV(hl)));
  }
  const res = { shapes: shapes.map((s) => s.s), w: L + R, asc: A, desc: D };
  shapeCache.set(key, res);
  return res;
}
// Extruded glyph mesh. height = world height of a capital (px units scaled), depth as a fraction of height.
function glyphMesh(txt, { h = 6, depth = 0.4, arabic = false, weight = "400", px = 180, mats, bevel = 0.035 }) {
  const G = glyphShapes(txt, weight, px, arabic);
  const geo = new THREE.ExtrudeGeometry(G.shapes, { depth: px * depth, bevelEnabled: true, bevelThickness: px * bevel, bevelSize: px * bevel * 0.7, bevelSegments: 2, curveSegments: 1 });
  geo.translate(0, 0, -px * depth / 2);
  const m = new THREE.Mesh(geo, mats);
  const s = h / (arabic ? px * 0.72 : G.asc);
  m.scale.setScalar(s);
  m.castShadow = m.receiveShadow = true;
  m.userData.w = G.w * s;
  return m;
}

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const BG = 0x101012;
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: BG, fog: 0.0024, exp: 1.12, bloom: [0.18, 0.5, 0.9], fov: 38 });
  envStrips(r, scene, [[40, 6, 0xffe2b8, 2.2, 0, 30, 10], [30, 4, 0xffffff, 1.2, -30, 10, -20], [20, 30, 0x8fa3c0, 0.5, 40, 5, 0], [60, 4, 0xffc890, 1.0, 0, -10, 30]], 0x0d0b09);
  const hemi = new THREE.HemisphereLight(0xdfe3ea, 0x2a2724, 0.9);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe2bc, 2.4);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -80, right: 80, top: 80, bottom: -80, near: 1, far: 400 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x9fb4d0, 0.55);
  scene.add(rim, rim.target);

  // ---------- materials ----------
  const concTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#a3a19c"; g.fillRect(0, 0, w, h);
    const q = mulberry(13);
    for (let i = 0; i < 9000; i++) { const v = 120 + q() * 70; g.fillStyle = `rgba(${v},${v - 1},${v - 3},${0.08 + q() * 0.12})`; g.fillRect(q() * w, q() * h, 1 + q() * 2.5, 1 + q() * 2.5); }
    for (let i = 0; i < 160; i++) { const y = q() * h; g.strokeStyle = `rgba(${q() < 0.5 ? "255,250,240" : "40,36,30"},${0.03 + q() * 0.05})`; g.lineWidth = 0.6 + q() * 1.6; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (q() - 0.5) * 6); g.stroke(); }
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(30,26,22,${0.1 + q() * 0.15})`; g.beginPath(); g.arc(q() * w, q() * h, 0.8 + q() * 1.6, 0, 7); g.fill(); }
  }, [1, 1]);
  const concPx = concTex.clone(); concPx.repeat.set(1 / 260, 1 / 260); concPx.needsUpdate = true;
  const mConc = new THREE.MeshStandardMaterial({ color: 0xdedbd5, map: concPx, roughness: 0.82, metalness: 0.0 });
  const mTi = new THREE.MeshStandardMaterial({ color: 0x8a9099, roughness: 0.3, metalness: 0.9, envMapIntensity: 1.1 });
  const mTiDark = new THREE.MeshStandardMaterial({ color: 0x3a3e45, roughness: 0.35, metalness: 0.85 });
  const mGold = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.26, metalness: 0.95, emissive: 0x3a2a05, emissiveIntensity: 0.6 });
  const mGoldSide = new THREE.MeshStandardMaterial({ color: 0x9c7a22, roughness: 0.3, metalness: 0.95 });
  const mBronze = new THREE.MeshStandardMaterial({ color: 0xd9b77a, roughness: 0.3, metalness: 0.75, emissive: 0x2a1a06, emissiveIntensity: 0.5 });
  const mBronzeSide = new THREE.MeshStandardMaterial({ color: 0x8a6232, roughness: 0.35, metalness: 0.8 });
  const mRed = new THREE.MeshStandardMaterial({ color: 0xe30a17, roughness: 0.45, metalness: 0.2, emissive: 0x3a0204, emissiveIntensity: 0.5 });
  const LATM = [mConc, mTi], GOLDM = [mGold, mGoldSide], BRZ = [mBronze, mBronzeSide], REDM = [mRed, mTi];

  const add = (geo, mat, x, y, z, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const B = (w, h, d, mat, x, y, z, p) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p);
  const boxConc = (u = 1) => { const t = concTex.clone(); t.repeat.set(u, u); t.needsUpdate = true; return new THREE.MeshStandardMaterial({ color: 0xb8b5af, map: t, roughness: 0.85 }); };
  const mWall = boxConc(2), mPill = boxConc(1);
  // titanium-framed slab: concrete core with thin metal edges
  function slab(w, h, d, x, y, z, p = scene) {
    const G = new THREE.Group(); G.position.set(x, y, z); p.add(G);
    B(w, h, d, mPill, 0, h / 2, 0, G);
    const e = 0.35;
    B(w + e, e, d + e, mTi, 0, h, 0, G); B(w + e, e, d + e, mTi, 0, 0.1, 0, G);
    B(e, h, d + e, mTi, -w / 2, h / 2, 0, G); B(e, h, d + e, mTi, w / 2, h / 2, 0, G);
    return G;
  }

  // floor: dark polished concrete
  const floorT = concTex.clone(); floorT.repeat.set(160, 160); floorT.needsUpdate = true;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(6000, 1200), new THREE.MeshStandardMaterial({ color: 0x45444a, map: floorT, roughness: 0.42, metalness: 0.15 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(1500, 0, -200); floor.receiveShadow = true; scene.add(floor);

  // volumetric light shafts: additive gradient sheets that turn to the camera around y
  const shaftTex = canvasTex(64, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,226,180,.9)"); gr.addColorStop(0.6, "rgba(255,210,160,.35)"); gr.addColorStop(1, "rgba(255,200,150,0)");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const g2 = g.createLinearGradient(0, 0, w, 0); g2.addColorStop(0, "rgba(0,0,0,1)"); g2.addColorStop(0.5, "rgba(0,0,0,0)"); g2.addColorStop(1, "rgba(0,0,0,1)");
    g.globalCompositeOperation = "destination-out"; g.fillStyle = g2; g.fillRect(0, 0, w, h);
  });
  const shafts = [];
  const shaft = (x, z, w, h, o = 0.16, tilt = 0.18) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide }));
    m.position.set(x, h / 2 - 1, z); scene.add(m); shafts.push([m, tilt]); return m;
  };

  // ============ A: street of blade signs ============
  const winTex = canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = "#b8b0a4"; g.fillRect(0, 0, w, h);
    const q = mulberry(5);
    for (let r0 = 0; r0 < 6; r0++) for (let c = 0; c < 3; c++) {
      const x = 22 + c * 78, y = 30 + r0 * 80, lit = q() < 0.3;
      g.fillStyle = lit ? "#f2c98a" : "#2c2a28"; g.fillRect(x, y, 56, 54);
      g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(x, y + 50, 56, 6);
      g.strokeStyle = "#7a736a"; g.lineWidth = 4; g.strokeRect(x, y, 56, 54);
    }
  });
  const mBld = new THREE.MeshStandardMaterial({ color: 0xcfcac2, map: winTex, roughness: 0.85, emissive: 0x6b4a1e, emissiveMap: winTex, emissiveIntensity: 0.18 });
  const SIGNS = [["KAHVE", "قهوه"], ["KİTAP", "كتاب"], ["BERBER", "بربر"], ["ECZANE", "اجزاخانه"],
    ["GAZETE", "غزته"], ["TERZİ", "ترزی"], ["LOKANTA", "لوقانطه"], ["OTEL", "اوتل"]];
  const labels = [];
  const label = (w, h, paint) => { const tx = canvasTex(w, h, paint); labels.push([tx, paint]); return tx; };
  const signTex = (txt, ar) => label(512, 256, (g, w, h) => {
    if (ar) {
      g.fillStyle = "#efe6d2"; g.fillRect(0, 0, w, h); g.strokeStyle = "#7a5a2a"; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, h - 20);
      g.fillStyle = "#2a2118"; g.font = `700 150px ${ARB}`; g.direction = "rtl"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + 10);
    } else {
      g.fillStyle = "#26282c"; g.fillRect(0, 0, w, h); g.fillStyle = RED; g.fillRect(0, h - 22, w, 10);
      g.strokeStyle = "#a9afb8"; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
      g.fillStyle = IVORY; g.font = `400 ${txt.length > 6 ? 92 : 110}px ${LAT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 - 4);
    }
  });
  const signs = [];
  {
    const q = mulberry(28);
    let k = 0;
    for (const s of [-1, 1]) for (let z = 18; z > -170; z -= 14) {
      const hgt = 16 + q() * 18;
      add(new THREE.BoxGeometry(12, hgt, 13.4), mBld, s * 15.5, hgt / 2, z);
      B(12.4, 1.2, 13.8, mTiDark, s * 15.5, 4.2, z);
      if (z < 10) {
        const [lat, ar] = SIGNS[k++ % SIGNS.length];
        const G = new THREE.Group(); G.position.set(s * 6.3, 7.4 + q() * 1.4, z + 2); scene.add(G);
        B(4.9, 2.6, 0.22, mTiDark, 0, 0, 0, G);
        const f = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.3), new THREE.MeshStandardMaterial({ map: signTex(ar, true), roughness: 0.6 })); f.position.z = 0.12; G.add(f);
        const b = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.3), new THREE.MeshStandardMaterial({ map: signTex(lat, false), roughness: 0.5, metalness: 0.2 })); b.position.z = -0.12; b.rotation.y = Math.PI; G.add(b);
        add(new THREE.CylinderGeometry(0.09, 0.09, 3.4, 6), mTi, s * 7.9, G.position.y + 1.7, z + 2, scene).rotation.z = Math.PI / 2;
        add(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 6), mTi, s * 6.3, G.position.y + 1.5, z + 2, scene);
        signs.push({ G, z });
      }
    }
    // end of the street: a far monolith wall so the view never ends in void
    B(60, 46, 4, mWall, 0, 23, -190);
    shaft(-5, -60, 14, 60, 0.12); shaft(6, -120, 18, 70, 0.1);
  }

  // ============ B + C: calligraphy hall ============
  const XB = 600, XC = 640;
  B(150, 70, 4, mWall, XB + 20, 35, -62);
  for (const x of [XB - 34, XB - 14, XB + 54, XB + 76]) for (const z of [-40, -14, 12]) { if (x > XB + 40 && z > 0) continue; slab(3.4, 46, 3.4, x, 0, z); }
  const tablet = (txt, w, h, x, z, ry, th) => {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; scene.add(G);
    const T = slab(w, h, 1.4, 0, 1.2, 0, G);
    B(w * 0.5, 1.2, 3, mTiDark, 0, 0.6, 0, G);
    const g = glyphMesh(txt, { h: th, arabic: true, weight: "700", px: 200, depth: 0.12, mats: BRZ, bevel: 0.02 });
    const wmax = w * 0.86; if (g.userData.w > wmax) g.scale.multiplyScalar(wmax / g.userData.w);
    g.position.set(0, 1.2 + h * 0.36, 1.1); G.add(g);
    return { G, T, g };
  };
  // Osmanlica (the Ottoman Turkish language), kitap (book), kalem (pen)
  const tabMain = tablet("عثمانلیجه", 24, 11, XB, 0, 0, 5.2);
  const tabL = tablet("كتاب", 10, 7, XB - 20, -18, 0.35, 4);
  const tabR = tablet("قلم", 10, 7, XB + 19, -20, -0.3, 4);
  shaft(XB - 6, -6, 16, 70, 0.14); shaft(XB + 10, -10, 12, 70, 0.1); shaft(XC + 6, -6, 14, 70, 0.12);
  // C: the consonant puzzle. kwr written without vowels above, Latin K _ R below with a glowing gap
  const tabC = tablet("كور", 9, 6, XC, -8, 0, 4);
  tabC.G.position.y = 11.5;
  B(2, 11.5, 2, mTi, XC, 5.75, -8);
  const kM = glyphMesh("K", { h: 6, mats: LATM, depth: 0.5 }); kM.position.set(XC - 7.5, 0.3, 0); scene.add(kM);
  const rM = glyphMesh("R", { h: 6, mats: LATM, depth: 0.5 }); rM.position.set(XC + 7.5, 0.3, 0); scene.add(rM);
  const gapF = new THREE.Group(); gapF.position.set(XC, 0.3, 0); scene.add(gapF);
  const mGlow = new THREE.MeshStandardMaterial({ color: 0xd4af37, emissive: 0xd4a640, emissiveIntensity: 1.0, roughness: 0.4, metalness: 0.5 });
  for (const [w, h, x, y] of [[5, 0.3, 0, 0], [5, 0.3, 0, 6.6], [0.3, 6.6, -2.5, 3.3], [0.3, 6.6, 2.5, 3.3]]) B(w, h, 0.3, mGlow, x, y, 0, gapF);
  const gapFill = new THREE.Mesh(new THREE.PlaneGeometry(4.7, 6.3), new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }));
  gapFill.position.set(0, 3.3, 0); gapF.add(gapFill);
  const ghosts = ["O", "Ö", "U", "Ü"].map((c) => { const m = glyphMesh(c, { h: 4.6, mats: GOLDM, depth: 0.25 }); m.position.set(XC, 0.9, 0); m.userData.s0 = m.scale.x; scene.add(m); return m; });
  const gapL = new THREE.PointLight(0xffc870, 0, 30, 2); gapL.position.set(XC, 4, 3); scene.add(gapL);
  B(64, 9, 6, mPill, XC, 4.5, -36); B(64.6, 0.4, 6.6, mTi, XC, 9.1, -36);
  const propose = "ABCDEF".split("").map((c, i) => { const m = glyphMesh(c, { h: 7, mats: LATM, depth: 0.45 }); m.position.set(XC + (i < 3 ? -22 + i * 6.2 : 9.6 + (i - 3) * 6.2), 9, -36); scene.add(m); return m; });

  // ============ D: 1928 + the 29-letter wall (also the payoff) ============
  const XD = 1200;
  const ALPHA = ["A", "B", "C", "Ç", "D", "E", "F", "G", "Ğ", "H", "I", "İ", "J", "K", "L", "M", "N", "O", "Ö", "P", "R", "S", "Ş", "T", "U", "Ü", "V", "Y", "Z"];
  const SPECIAL = new Set(["Ç", "Ğ", "I", "İ", "Ö", "Ş", "Ü"]);
  const wall = [];
  ALPHA.forEach((c, i) => {
    const row = Math.floor(i / 8), col = i % 8, n = row === 3 ? 5 : 8;
    const x = XD + (col - (n - 1) / 2) * 9.6, y = 5 + (3 - row) * 10.2;
    const m = glyphMesh(c, { h: 7, mats: LATM, depth: 0.42 });
    m.position.set(x, y, 0); scene.add(m);
    const gm = glyphMesh(c, { h: 7, mats: GOLDM, depth: 0.42 }); gm.position.set(x, y, 0); gm.visible = false; scene.add(gm);
    // ledge under each row
    wall.push({ m, gm, c, x, y, sp: SPECIAL.has(c), i });
  });
  for (let row = 0; row < 4; row++) { const n = row === 3 ? 5 : 8; B(n * 9.6 + 2, 0.7, 5, mTi, XD, 4.3 + (3 - row) * 10.2, 0); }
  B(84, 3.6, 7, mPill, XD, 1.8, 0);
  B(84.6, 0.4, 7.6, mTi, XD, 3.7, 0);
  B(80, 46, 2, mWall, XD, 23, -9);
  const plaque = label(2048, 96, (g, w, h) => {
    g.fillStyle = "#3a3c41"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#c9ccd2"; g.font = `400 52px ${LAT}`; g.textBaseline = "middle";
    g.letterSpacing = "14px"; g.textAlign = "left"; g.fillText("ALFABE · 1928 · 29 HARF", 40, h / 2 + 2);
    g.textAlign = "right"; g.fillStyle = "#d4af37"; g.fillText("AUDIRA", w - 40, h / 2 + 2);
  });
  const plq = new THREE.Mesh(new THREE.PlaneGeometry(64, 3), new THREE.MeshStandardMaterial({ map: plaque, roughness: 0.4, metalness: 0.6 }));
  plq.position.set(XD, 1.9, 3.55); scene.add(plq);
  const goldL = new THREE.PointLight(0xffc870, 0, 120, 1.6); goldL.position.set(XD, 34, 14); scene.add(goldL);
  const y1928 = glyphMesh("1928", { h: 9, mats: LATM, depth: 0.45 }); y1928.position.set(XD, 0.2, 62); scene.add(y1928);
  const p1928 = slab(32, 1.2, 8, XD, 0, 62);
  shaft(XD - 20, -4, 22, 80, 0.1); shaft(XD + 22, -4, 22, 80, 0.1); shaft(XD, 56, 18, 60, 0.08);
  const tabH = tablet("عثمانلیجه", 18, 8, XD - 14, 72, 0.2, 3.8);

  // ============ E: 5 TAHUN -> 3 BULAN, Turkey plate ============
  const XE = 1800;
  const five = glyphMesh("5", { h: 17, mats: LATM, depth: 0.42 }); five.position.set(XE - 11, 0.2, 0); scene.add(five);
  const tahun = glyphMesh("TAHUN", { h: 4.6, mats: LATM, depth: 0.5 }); tahun.position.set(XE + 10, 0.2, 2); scene.add(tahun);
  const three = glyphMesh("3", { h: 17, mats: [mConc, mRed], depth: 0.42 }); three.position.set(XE - 11, 0.2, 0); scene.add(three);
  const bulan = glyphMesh("BULAN", { h: 4.6, mats: LATM, depth: 0.5 }); bulan.position.set(XE + 10, 0.2, 2); scene.add(bulan);
  B(70, 50, 2, mWall, XE, 25, -18);
  shaft(XE - 10, -6, 20, 70, 0.12);
  // Turkey plate from Natural Earth outline
  const KM = 1.9, XM = XE + 70, ZM = 20, LON0 = 35.2, LAT0 = 39;
  const tur = GEO.find((c) => c.name === "Turkey");
  const tShapes = tur.rings.filter((rg) => rg.length > 30).map((rg) => new THREE.Shape(rg.map(([lo, la]) => new THREE.Vector2((lo - LON0) * KM * 0.777, (la - LAT0) * KM))));
  const tGeo = new THREE.ExtrudeGeometry(tShapes, { depth: 0.8, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.12, bevelSegments: 1 });
  const tMapT = concTex.clone(); tMapT.repeat.set(0.12, 0.12); tMapT.needsUpdate = true;
  const turkey = new THREE.Mesh(tGeo, [new THREE.MeshStandardMaterial({ color: 0xe0d9cd, map: tMapT, roughness: 0.75 }), mTi]);
  turkey.rotation.x = -Math.PI / 2; turkey.position.set(XM, 1.2, ZM); turkey.castShadow = turkey.receiveShadow = true; scene.add(turkey);
  B(44, 1.2, 20, mTiDark, XM, 0.6, ZM - 1);
  const P = (lo, la) => [XM + (lo - LON0) * KM * 0.777, 2.25, ZM - (la - LAT0) * KM];
  // illustrative touring loop through the country (no stops claimed)
  const ROUTE = [[29.0, 41.0], [27.5, 41.0], [26.4, 40.1], [29.1, 40.2], [27.1, 38.4], [30.7, 36.9], [32.9, 39.9], [35.3, 37.0], [37.0, 39.7], [39.7, 41.0], [36.3, 41.3], [35.1, 42.0], [32.9, 39.9]];
  const rPts = ROUTE.map(([lo, la]) => new THREE.Vector3(...P(lo, la)));
  const rCurve = new THREE.CatmullRomCurve3(rPts, false, "centripetal");
  const NR = 160;
  const rDots = pts(scene, NR, { color: 0xff3a2e, size: 0.75, add: true, opacity: 1 });
  const cityDots = pts(scene, ROUTE.length, { color: 0xffd27a, size: 1.6, add: true });
  shaft(XM, ZM - 20, 24, 60, 0.07); B(90, 50, 2, mWall, XM, 25, ZM - 40);

  // ============ F: date slabs ============
  const XF = 2400;
  const MON = [[XF - 9, 0, "1 NOV", "1928", "UU No. 1353"], [XF + 9, -60, "1 DES", "1928", null], [XF - 9, -120, "1 JAN", "1929", null]];
  const dates = MON.map(([x, z, a, b, sub], i) => {
    const G = slab(13, 18, 2.6, x, 0, z);
    const ma = glyphMesh(a, { h: 3.0, mats: i === 1 ? LATM : LATM, depth: 0.35 }); ma.position.set(0, 11.6, 1.6); G.add(ma);
    const mb = glyphMesh(b, { h: 3.6, mats: GOLDM, depth: 0.35 }); mb.position.set(0, 6.0, 1.6); G.add(mb);
    if (ma.userData.w > 11) ma.scale.multiplyScalar(11 / ma.userData.w);
    if (sub) {
      const tx = label(512, 96, (g, w, h) => { g.fillStyle = "#2c2e33"; g.fillRect(0, 0, w, h); g.fillStyle = IVORY; g.font = `400 52px ${LAT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(sub, w / 2, h / 2 + 2); });
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.7), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.4, metalness: 0.5 })); pl.position.set(0, 3.0, 1.32); G.add(pl);
    }
    return G;
  });
  // icons: newspaper + street sign (1 Dec), book + document (1 Jan)
  const paperTex = label(512, 700, (g, w, h) => {
    g.fillStyle = "#efe9dc"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#1e1c1a"; g.font = `400 84px ${LAT}`; g.textAlign = "center"; g.fillText("GAZETE", w / 2, 100);
    g.fillRect(30, 122, w - 60, 6); g.font = `400 40px ${LAT}`; g.fillText("YENİ HARFLER", w / 2, 186);
    g.fillStyle = "rgba(30,28,26,.55)";
    for (let c = 0; c < 3; c++) for (let l = 0; l < 22; l++) g.fillRect(30 + c * 154, 220 + l * 20, 138 - ((l * 7 + c * 3) % 5) * 12, 9);
  });
  const news = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 7.4), new THREE.MeshStandardMaterial({ map: paperTex, roughness: 0.9, side: THREE.DoubleSide }));
  news.position.set(MON[1][0] + 10.2, 10.5, -60 + 2.5); news.castShadow = true; scene.add(news);
  const stSign = new THREE.Group(); stSign.position.set(MON[1][0] + 10.2, 0, -60 + 4); stSign.userData.k = 1.7; scene.add(stSign);
  add(new THREE.CylinderGeometry(0.15, 0.15, 6, 8), mTi, 0, 3, 0, stSign);
  const cadTex = label(512, 160, (g, w, h) => { g.fillStyle = "#1f3d78"; g.fillRect(0, 0, w, h); g.strokeStyle = "#f2efe8"; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = "#f2efe8"; g.font = `400 72px ${LAT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("CADDE", w / 2, h / 2 + 2); });
  const cad = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.4, 0.15), [mTiDark, mTiDark, mTiDark, mTiDark, new THREE.MeshStandardMaterial({ map: cadTex, roughness: 0.5 }), mTiDark]);
  cad.position.set(0, 5.6, 0); stSign.add(cad);
  const bookTex = label(320, 440, (g, w, h) => { g.fillStyle = "#6b1f1a"; g.fillRect(0, 0, w, h); g.strokeStyle = GOLD; g.lineWidth = 6; g.strokeRect(18, 18, w - 36, h - 36); g.fillStyle = GOLD; g.font = `400 58px ${LAT}`; g.textAlign = "center"; g.fillText("KİTAP", w / 2, h / 2 + 18); });
  const book = new THREE.Mesh(new THREE.BoxGeometry(4.2, 5.8, 1.1), [mConc, mConc, mConc, mConc, new THREE.MeshStandardMaterial({ map: bookTex, roughness: 0.6 }), mConc]);
  book.position.set(MON[2][0] - 10.4, 3.4, -120 + 2.6); book.castShadow = true; scene.add(book);
  const docTex = label(400, 540, (g, w, h) => {
    g.fillStyle = "#f1ece2"; g.fillRect(0, 0, w, h); g.fillStyle = "#222"; g.font = `400 44px ${LAT}`; g.textAlign = "center"; g.fillText("RESMÎ", w / 2, 70);
    g.fillStyle = "rgba(30,30,30,.5)"; for (let l = 0; l < 14; l++) g.fillRect(40, 110 + l * 26, w - 80 - ((l * 5) % 4) * 30, 9);
    g.strokeStyle = RED; g.lineWidth = 6; g.beginPath(); g.arc(w - 90, h - 90, 50, 0, 7); g.stroke();
  });
  const doc = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 5.9), new THREE.MeshStandardMaterial({ map: docTex, roughness: 0.9, side: THREE.DoubleSide }));
  doc.position.set(MON[2][0] - 10.4, 11.2, -120 + 2.2); doc.castShadow = true; scene.add(doc);
  for (const [x, z] of MON) shaft(x, z - 4, 16, 60, 0.1);
  B(80, 50, 2, mWall, XF, 25, -150);

  // ============ G: Q W X fenced off ============
  const XG = 3000;
  const qwx = ["Q", "W", "X"].map((c, i) => { const m = glyphMesh(c, { h: 8, mats: LATM, depth: 0.4 }); m.position.set(XG - 15 + i * 15, 0.2, 0); scene.add(m); return m; });
  const fence = new THREE.Group(); fence.position.set(XG, 0, 0); scene.add(fence);
  const FX0 = 23, FZ = 7;
  for (let x = -FX0; x <= FX0 + 0.01; x += 5.75) for (const z of [-FZ, FZ]) add(new THREE.CylinderGeometry(0.2, 0.2, 4.6, 8), mTi, x, 2.3, z, fence);
  for (const z of [-FZ, FZ]) for (const y of [1.5, 4.2]) B(FX0 * 2, 0.18, 0.18, mTi, 0, y, z, fence);
  for (const x of [-FX0, FX0]) { for (let z = -FZ; z <= FZ + 0.01; z += 4.67) add(new THREE.CylinderGeometry(0.2, 0.2, 4.6, 8), mTi, x, 2.3, z, fence); for (const y of [1.5, 4.2]) B(0.18, 0.18, FZ * 2, mTi, x, y, 0, fence); }
  const tapeTex = label(2048, 96, (g, w, h) => { g.fillStyle = RED; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.font = `400 46px ${LAT}`; g.textBaseline = "middle"; g.letterSpacing = "4px"; g.fillText("DILARANG DI DOKUMEN RESMI · s/d 2013 · DILARANG DI DOKUMEN RESMI · s/d 2013", 20, h / 2 + 2); });
  const tape = new THREE.Mesh(new THREE.PlaneGeometry(FX0 * 2, 1.1), new THREE.MeshStandardMaterial({ map: tapeTex, roughness: 0.6, emissive: 0x2a0000, emissiveIntensity: 0.4 }));
  tape.position.set(0, 2.85, FZ + 0.25); fence.add(tape);
  const y2013 = glyphMesh("2013", { h: 8, mats: [mConc, mRed], depth: 0.4 }); y2013.position.set(XG, 0.2, -26); scene.add(y2013);
  B(80, 50, 2, mWall, XG, 25, -42);
  shaft(XG - 8, -6, 18, 60, 0.12); shaft(XG + 12, -10, 16, 60, 0.1);

  // dust motes in the light
  const dust = pts(scene, 260, { color: 0xffe2b8, size: 0.16, add: true, opacity: 0.55 });
  const dq = mulberry(77), dSeed = Array.from({ length: 260 }, () => [dq() - 0.5, dq(), dq() - 0.5, dq() * 6, 0.2 + dq() * 0.6]);

  // ---------- timing ----------
  const cut = (k) => A(k) - 0.01;
  const c2 = cut("s2:Ini"), c4 = cut("s4:Tahun"), c5 = cut("s5:Komisi"), c6 = cut("s6:Satu"), c7 = cut("s7:Aturannya"), c8 = cut("s8:Satu");
  const flip0 = A("s1:mengganti") - 0.3;
  const vok = A("s3:vokal"), usul = A("s3:Usulan"), tent = A("s3:ditentang");
  const hasil = A("s4:Hasilnya"), n29 = A("s4:29"), khus = A("s4:khusus");
  const pang = A("s5:memangkasnya"), tiga = A("s5:tiga"), keli = A("s5:berkeliling");
  const mul1 = A("s6:Mulai"), mul2 = A("s6:Mulai#2");
  const tQ = A("s7:Q"), tW = A("s7:W"), tX = A("s7:X"), dil = A("s7:dilarang"), t2013 = A("s7:2013");
  const M = MON.map(([x, z]) => [x, z]);
  const keys = [
    [0, 0.6, 5.0, 40, 0, 7.6, -40],
    [c2 - 0.02, -0.4, 5.6, 17, 0, 8.0, -40],
    [c2, XB + 10, 7.5, 80, XB, 7.0, 0],
    [A("s2:Utsmani"), XB + 3, 8, 74, XB, 7.0, 0],
    [K.s3 - 0.3, XB - 1, 8.4, 70, XB + 2, 7.0, 0],
    [A("s3:Aksara") + 2.4, XC + 3, 9, 66, XC, 7.2, -2],
    [usul - 0.2, XC - 2, 9.2, 62, XC, 7.2, -2],
    [usul + 1.8, XC, 14, 76, XC, 7.5, -12],
    [tent + 1.6, XC + 4, 15, 82, XC, 7, -12],
    [c4 - 0.02, XC + 6, 15.5, 86, XC, 7, -12],
    [c4, XD + 9, 6, 62 + 95, XD, 5.5, 62],
    [A("s4:Presiden"), XD + 3, 7, 62 + 102, XD, 5.8, 62],
    [A("s4:Komisi"), XD - 4, 9, 62 + 108, XD, 7, 56],
    [hasil + 0.5, XD - 8, 15, 128, XD - 4, 19, 0],
    [n29 + 0.6, XD, 20, 222, XD, 21.5, 0],
    [c5 - 0.02, XD + 6, 21, 212, XD, 21.5, 0],
    [c5, XE + 8, 9, 136, XE + 1, 8.8, 0],
    [pang, XE, 9.5, 130, XE + 1, 8.8, 0],
    [keli - 0.6, XE - 3, 11, 132, XE + 1, 9.0, 0],
    [keli + 1.8, XE + 70, 54, 84, XE + 70, 0, 18],
    [c6 - 0.02, XE + 72, 51, 82, XE + 70, 0, 18],
    [c6, M[0][0] + 11, 9, 70, M[0][0] - 1, 9.5, 0],
    [A("s6:undang-undangnya"), M[0][0] + 5, 9.5, 66, M[0][0] - 1, 9.5, 0],
    [mul1 - 1.7, M[0][0] + 3, 9.5, 64, M[0][0], 9.5, 0],
    [mul1 + 0.9, M[1][0] - 2, 9.5, -60 + 70, M[1][0] + 4, 9.5, -60],
    [mul2 - 1.7, M[1][0] + 1, 9.8, -60 + 66, M[1][0] + 4, 9.5, -60],
    [mul2 + 0.9, M[2][0] + 1, 9.5, -120 + 78, M[2][0] - 3, 9.5, -120],
    [c7 - 0.02, M[2][0] - 2, 10, -120 + 72, M[2][0] - 3.5, 9.5, -120],
    [c7, XG + 8, 8, 112, XG, 6, -6],
    [tQ, XG + 2, 9, 120, XG, 6, -4],
    [dil + 1, XG - 4, 10.5, 124, XG, 6, -2],
    [c8 - 0.02, XG - 6, 11, 126, XG, 6, -2],
    [c8, XD - 10, 13, 150, XD, 21, 16],
    [A("s8:Menurut"), XD + 2, 26, 212, XD + 4, 22, 8],
    [K.end, XD + 6, 31, 232, XD + 4, 22.5, 6],
    [K.dur, XD + 7, 32, 236, XD + 4, 22.5, 6],
  ];
  const camT = track(keys);
  const tgt = new THREE.Vector3();

  return (t) => {
    // fonts may arrive late: repaint canvas labels once
    if (!labels.done && document.fonts && document.fonts.check(`400 40px "Archivo Black"`)) { labels.done = true; for (const [tx, paint] of labels) { const c = tx.image, g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); paint(g, c.width, c.height); tx.needsUpdate = true; } }
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.35, c[1] + Math.sin(t * 0.29) * 0.22, c[2] + Math.cos(t * 0.31) * 0.3);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    key.position.set(tgt.x - 40, 80, tgt.z + 55); key.target.position.copy(tgt);
    rim.position.set(tgt.x + 50, 30, tgt.z - 80); rim.target.position.copy(tgt);

    // A: signs flip in a wave down the street
    for (const s of signs) { const u = smooth(clamp01((t - flip0 - (18 - s.z) * 0.011) / 0.6)); s.G.rotation.y = Math.PI * u; s.G.position.y += 0; }

    // B/C: tablets turn gently
    tabMain.G.rotation.y = Math.sin(t * 0.32) * 0.12;
    tabL.G.rotation.y = 0.35 + Math.sin(t * 0.27 + 1) * 0.08; tabR.G.rotation.y = -0.3 + Math.sin(t * 0.3 + 2) * 0.08;
    tabC.G.rotation.y = Math.sin(t * 0.4) * 0.15;
    tabH.G.rotation.y = 0.2 + Math.sin(t * 0.3) * 0.1; tabH.G.visible = t > c8 - 0.05;
    // vowel gap: ghost vowels cycle after "vokal"
    const gOn = clamp01((t - vok + 0.2) / 0.4);
    gapL.intensity = 22 * gOn * (1 + 0.15 * Math.sin(t * 5));
    gapFill.material.opacity = 0.06 + 0.16 * gOn;
    const ph = Math.max(0, t - vok) / 0.75;
    ghosts.forEach((g, i) => { const k = Math.floor(ph) % 4, f = ph - Math.floor(ph); const on = gOn > 0 && k === i; const s = on ? back(clamp01(f / 0.25)) * (1 - smooth(clamp01((f - 0.8) / 0.2))) : 0; g.visible = s > 0.01; g.scale.setScalar(Math.max(0.001, s) * g.userData.s0); });
    // Latin proposal letters rise, then are pushed back down when opposed
    propose.forEach((m, i) => { const up = eout(clamp01((t - usul - 0.3 - i * 0.12) / 1.0)), dn = smooth(clamp01((t - tent - i * 0.08) / 1.6)); m.position.y = 9 - 8.2 + 8.2 * up - 6.2 * dn; m.visible = up > 0.001 && t < c4 + 0.5; });

    // D: 1928 sinks gently once the wall takes over; gold for the Turkish letters
    const s28 = smooth(clamp01((t - hasil + 1.0) / 1.6));
    y1928.position.y = 0.2 - 10 * s28; y1928.visible = s28 < 0.999; p1928.position.y = -1.3 * s28;
    const wallIn = t > c5 ? 1 : clamp01((t - A("s4:Komisi") - 0.5) / 1.4);
    wall.forEach((w) => {
      const rise = t >= c8 - 0.1 ? 1 : eout(clamp01((wallIn * 29 - w.i * 0.6) / 4));
      const gold = w.sp && t > khus + 0.05 * (w.i % 7);
      const pop = gold ? Math.sin(Math.PI * clamp01((t - khus) / 0.6)) * 2.2 : 0;
      for (const m of [w.m, w.gm]) { m.position.y = w.y - 9 * (1 - rise); m.position.z = pop; }
      w.m.visible = !gold && rise > 0.002; w.gm.visible = gold && rise > 0.002;
    });
    goldL.intensity = 500 * clamp01((t - khus) / 0.8) * (t > c5 && t < c8 ? 0 : 1);

    // E: the five years sink back, three months rise
    const dn5 = smooth(clamp01((t - pang + 0.1) / 1.4)), up3 = eout(clamp01((t - tiga + 0.4) / 1.2));
    five.position.y = 0.2 - 19 * dn5; five.rotation.x = -0.25 * dn5; tahun.position.y = 0.2 - 6 * dn5; five.visible = dn5 < 0.999; tahun.visible = dn5 < 0.999;
    three.position.y = 0.2 - 19 * (1 - up3); bulan.position.y = 0.2 - 6 * (1 - up3); three.visible = bulan.visible = up3 > 0.001;
    const ru = clamp01((t - keli + 0.2) / 2.6);
    for (let i = 0; i < NR; i++) { const u = i / (NR - 1), on = u <= ru; const p = rCurve.getPointAt(u); rDots.pos[i * 3] = p.x; rDots.pos[i * 3 + 1] = on ? p.y + 0.1 : -50; rDots.pos[i * 3 + 2] = p.z; }
    rDots.commit();
    ROUTE.forEach(([lo, la], i) => { const p = P(lo, la), on = i / (ROUTE.length - 1) <= ru + 0.01; cityDots.pos[i * 3] = p[0]; cityDots.pos[i * 3 + 1] = on && t > keli - 0.3 ? p[1] + 0.2 : -50; cityDots.pos[i * 3 + 2] = p[2]; });
    cityDots.commit();

    // F: date slabs lift into place as the camera reaches them; icons drift
    const dIn = [A("s6:November") - 0.6, A("s6:Desember") - 0.9, A("s6:Januari") - 0.9];
    dates.forEach((G, i) => { const u = t < c6 ? 1 : eout(clamp01((t - dIn[i] + 0.8) / 1.0)); G.position.y = -19 * (1 - u); });
    const nOn = eout(clamp01((t - A("s6:koran") + 0.2) / 0.6));
    news.position.y = 10.5 + Math.sin(t * 0.8) * 0.25; news.rotation.set(-0.08, -0.35 + Math.sin(t * 0.6) * 0.06, 0.05); news.scale.setScalar(Math.max(0.001, nOn));
    stSign.scale.setScalar(1.7 * Math.max(0.001, eout(clamp01((t - A("s6:papan") + 0.2) / 0.5))));
    book.scale.setScalar(Math.max(0.001, eout(clamp01((t - A("s6:buku") + 0.2) / 0.5)))); book.rotation.y = 0.3 + Math.sin(t * 0.5) * 0.08;
    doc.scale.setScalar(Math.max(0.001, eout(clamp01((t - A("s6:komunikasi") + 0.2) / 0.5)))); doc.position.y = 11.2 + Math.sin(t * 0.7) * 0.2; doc.rotation.set(-0.05, 0.3, -0.04);

    // G: Q W X appear on their words, fence and tape rise on "dilarang"
    [tQ, tW, tX].forEach((a, i) => { const u = eout(clamp01((t - a + 0.15) / 0.5)); qwx[i].position.y = 0.2 - 10 * (1 - u); qwx[i].visible = u > 0.001; });
    const fu = eout(clamp01((t - c7 - 0.3) / 1.0)), tu = eout(clamp01((t - dil + 0.2) / 0.7));
    fence.position.y = -5 * (1 - fu); fence.visible = fu > 0.001; tape.scale.x = Math.max(0.001, tu); tape.visible = tu > 0.001;
    const y13 = eout(clamp01((t - t2013 + 0.2) / 0.9)) * (1 - smooth(clamp01((t - tQ + 0.6) / 1.2))); y2013.position.y = 0.2 - 7 * (1 - y13); y2013.visible = y13 > 0.001;

    // shafts face the camera around y and breathe
    for (const [m, tilt] of shafts) { m.rotation.set(0, Math.atan2(cam.position.x - m.position.x, cam.position.z - m.position.z), tilt); m.material.opacity = m.userData.o0 ?? (m.userData.o0 = m.material.opacity); m.material.opacity = m.userData.o0 * (0.85 + 0.15 * Math.sin(t * 0.7 + m.position.x)); }
    const d = dust.pos;
    for (let i = 0; i < 260; i++) { const q = dSeed[i]; d[i * 3] = tgt.x + q[0] * 50 + Math.sin(t * q[4] + q[3]) * 1.2; d[i * 3 + 1] = 0.5 + ((q[1] * 30 + t * q[4] * 0.4) % 30); d[i * 3 + 2] = tgt.z + q[2] * 50 + 10 + Math.cos(t * q[4] + q[3]) * 1.2; }
    dust.commit();
    comp.render();
  };
}
