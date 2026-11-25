// EP29 KALENDER ETIOPIA: STAINEDGLASS. A long stone chamber (units ~ m, wall face z = 0, floor y = 0). Morning light
// shines through leaded windows set along one wall; the camera trucks between them.
// W  (x 0)    the JENDELA 13 BULAN: 12 month panels (3 x 4, each a numbered medallion over 30 day-diamonds) and a small
//             oculus at the crown for Pagumen (5 gold petals + a 6th ruby petal for the leap year). Below the sill, four
//             roundels with simple evangelist symbols + names (eagle wings, wings + star, maned disc, horned head; no figures,
//             no faces). A stone plinth in front receives the Enkutatash jewels and carries the brass AUDIRA plaque.
// MAP (x -24) a lancet with Ethiopia in green-yellow-red glass among amber neighbours, the Red Sea in sapphire,
//             Addis Ababa as a jewel; small AUDIRA signature pane in the border.
// TL  (x 24)  two horizontal glass bands: ANNIANUS (+-400 M) and DIONYSIUS EXIGUUS (525 M); each has a ruby star pane for
//             its count of year one, 8 panes apart; a gold bracket "8 TAHUN" joins them.
// OF  (x 46)  a Gregorian lancet: JAN..DES panes light ruby (8 years behind) up to September 10, then emerald (7 years);
//             the medallion turns 8 -> 7.
// ML  (x 68)  a rose in green, yellow and red with 2000 -> 2007 at its heart; bunting strings drop across the chamber;
//             plaque ADDIS ABABA - 11 SEPTEMBER 2007.
// Glass is unlit (MeshBasic) and the brightest thing in frame; light lands on the flagstones as coloured pools and shafts.
// Everything is a function of t.

const FONTS = ['700 80px "Cinzel"', '600 80px "Cinzel"', '700 80px "EB Garamond"', 'italic 600 80px "EB Garamond"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "PAGUMEN 2019 ADDIS"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* fall back to system fonts */ }
}

import * as THREE from "./three.module.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, clamp01, smooth, eout, back, canvasTex, stage, pts } from "./lib3d.js";
import { GEO } from "./geo.js";

const CIN = '"Cinzel", Georgia, serif', GAR = '"EB Garamond", Georgia, serif';
const ENV = 0.3;
const LEAD = "#15161A";
const PAL = {
  EM: { a: "#0E8A3A", b: "#23A653", bg: "#16327E" },
  RU: { a: "#B3122A", b: "#D6303D", bg: "#0D5C2E" },
  SA: { a: "#1D4DB5", b: "#3A72DC", bg: "#8A1222" },
  AM: { a: "#D99A16", b: "#F0BE2E", bg: "#1B3479" },
};
const GOLDG = "#F0C23A", RUBY = "#C0182E", EMER = "#0F8E3C", SAPH = "#1F52BE", VIOL = "#5B2A86";
const ETG = "#078930", ETY = "#FCDD09", ETR = "#DA121A";
const MAPX = -24, TLX = 24, OFX = 46, MLX = 68;

const hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const rgb = (h, j = 1, a = 1) => { const [r, g, b] = hx(h); return `rgba(${Math.min(255, r * j) | 0},${Math.min(255, g * j) | 0},${Math.min(255, b * j) | 0},${a})`; };

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

// ---------- glass painting: one colour per pane, seedy streaks and bubbles, darker thick edges, lead on top ----------
const poly = (P) => (g) => { g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) g.lineTo(P[i][0], P[i][1]); g.closePath(); };
const circ = (x, y, r) => (g) => { g.moveTo(x + r, y); g.arc(x, y, r, 0, 6.2832); };
const seg = (cx, cy, r0, r1, a0, a1) => (g) => { g.arc(cx, cy, r1, a0, a1); g.arc(cx, cy, r0, a1, a0, true); g.closePath(); };
const bbOf = (P) => { const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]); const x = Math.min(...xs), y = Math.min(...ys); return [x, y, Math.max(...xs) - x, Math.max(...ys) - y]; };
function pane(g, path, col, q, bb) {
  g.save(); g.beginPath(); path(g); g.clip();
  const j = 0.92 + q() * 0.16;
  g.fillStyle = rgb(col, j); g.fillRect(bb[0] - 2, bb[1] - 2, bb[2] + 4, bb[3] + 4);
  const L = Math.max(bb[2], bb[3]), S = Math.min(bb[2], bb[3]);
  for (let i = 0; i < 4; i++) {
    const x = bb[0] + q() * bb[2], y = bb[1] + q() * bb[3], rr = (0.25 + q() * 0.6) * L;
    const gr = g.createRadialGradient(x, y, 0, x, y, rr); const lt = q() < 0.5;
    gr.addColorStop(0, lt ? "rgba(255,255,235,.14)" : "rgba(0,0,0,.18)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  const ang = q() * Math.PI; g.lineCap = "round";
  for (let i = 0; i < 6; i++) {
    const x = bb[0] + q() * bb[2], y = bb[1] + q() * bb[3];
    g.strokeStyle = q() < 0.5 ? `rgba(255,255,235,${0.05 + q() * 0.08})` : `rgba(0,0,0,${0.06 + q() * 0.09})`;
    g.lineWidth = 1 + q() * S * 0.09; g.beginPath(); g.moveTo(x - Math.cos(ang) * L, y - Math.sin(ang) * L);
    g.quadraticCurveTo(x + (q() - 0.5) * L * 0.3, y + (q() - 0.5) * L * 0.3, x + Math.cos(ang) * L, y + Math.sin(ang) * L); g.stroke();
  }
  const nb = Math.min(40, (bb[2] * bb[3]) / 500 | 0);
  for (let i = 0; i < nb; i++) { g.fillStyle = `rgba(255,255,255,${0.1 + q() * 0.22})`; g.beginPath(); g.arc(bb[0] + q() * bb[2], bb[1] + q() * bb[3], 0.6 + q() * 1.8, 0, 6.283); g.fill(); }
  g.beginPath(); path(g); g.lineWidth = Math.max(6, S * 0.2); g.strokeStyle = "rgba(0,0,0,.3)"; g.stroke();
  g.restore();
}
function lead(g, path, w) {
  g.beginPath(); path(g); g.lineJoin = "round"; g.lineCap = "round";
  g.lineWidth = w; g.strokeStyle = LEAD; g.stroke();
  g.lineWidth = Math.max(1, w * 0.2); g.strokeStyle = "rgba(150,150,160,.32)"; g.stroke();
}
// grisaille: dark paint fired on the glass
function paint(g, txt, x, y, font, col = "rgba(22,12,6,.93)", align = "center") { g.font = font; g.textAlign = align; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(txt, x, y); }
function star(cx, cy, R, r, n = 5, rot = -Math.PI / 2) { const P = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr = i % 2 ? r : R; P.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return P; }

// lancet outline: rectangle y0..y1 under a pointed arch (centres on the opposite springing side)
function lancet(W, y0, y1, k = 0.75) {
  const R = k * W, c = R - W / 2, apex = y1 + Math.sqrt(R * R - c * c), aE = Math.atan2(apex - y1, c);
  const s = new THREE.Shape();
  s.moveTo(-W / 2, y0); s.lineTo(W / 2, y0); s.lineTo(W / 2, y1);
  s.absarc(-c, y1, R, 0, aE, false);
  s.absarc(c, y1, R, Math.PI - aE, Math.PI, false);
  s.lineTo(-W / 2, y0);
  return { s, apex };
}
function archHead(W, y1, k = 0.75) {
  const R = k * W, c = R - W / 2, apex = y1 + Math.sqrt(R * R - c * c), aE = Math.atan2(apex - y1, c);
  const s = new THREE.Shape();
  s.moveTo(-W / 2, y1); s.lineTo(W / 2, y1);
  s.absarc(-c, y1, R, 0, aE, false);
  s.absarc(c, y1, R, Math.PI - aE, Math.PI, false);
  return { s, apex };
}
function shapeGeo(shape, bb, segs = 48) {
  const geo = new THREE.ShapeGeometry(shape, segs);
  const p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - bb[0]) / (bb[2] - bb[0]), (p.getY(i) - bb[1]) / (bb[3] - bb[1]));
  return geo;
}

export function create(canvas, K, AT) {
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x0a0708, exp: 0.9, bloom: [0.25, 0.5, 0.85], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 0.9;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  bp.threshold = 0.86; bp.strength = 0.3; bp.radius = 0.45;
  { const c = document.createElement("canvas"); c.width = 8; c.height = 512; const g = c.getContext("2d"); const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#1a1310"); gr.addColorStop(1, "#070506"); g.fillStyle = gr; g.fillRect(0, 0, 8, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
  scene.fog = new THREE.FogExp2(0x0c0908, 0.012);
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;

  const labels = [];
  const label = (w, h, paintFn, rep) => { const tx = canvasTex(w, h, paintFn, rep); labels.push([tx, paintFn]); return tx; };
  const add = (m, p = scene, cast = true) => { m.castShadow = cast; m.receiveShadow = true; p.add(m); return m; };
  const G = (x = 0, y = 0, z = 0, p = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, envMapIntensity: ENV, ...o });
  const glassM = (map, extra = {}) => new THREE.MeshBasicMaterial({ map, fog: false, ...extra });
  const pump = (t, a, up = 0.12, down = 0.9) => (t < a ? 0 : t < a + up ? (t - a) / up : Math.max(0, 1 - (t - a - up) / down));
  const on = (t, a, d = 0.3) => smooth((t - a) / d);

  // ---------- stone ----------
  const stonePaint = (seed, base = [78, 68, 58]) => (g, w, h) => {
    const q = mulberry(seed);
    g.fillStyle = "#1c1612"; g.fillRect(0, 0, w, h);
    const rowH = h / 8;
    for (let ry = 0; ry < 8; ry++) {
      let x = -q() * 200;
      while (x < w) {
        const bw = 170 + q() * 170, j = 0.78 + q() * 0.34;
        g.fillStyle = `rgb(${base[0] * j | 0},${base[1] * j | 0},${base[2] * j | 0})`;
        g.fillRect(x + 4, ry * rowH + 4, bw - 8, rowH - 8);
        for (let k = 0; k < 3; k++) { const cx = x + q() * bw, cy = ry * rowH + q() * rowH, rr = 20 + q() * 60; const gr = g.createRadialGradient(cx, cy, 0, cx, cy, rr); gr.addColorStop(0, q() < 0.5 ? "rgba(255,240,220,.07)" : "rgba(0,0,0,.12)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(cx - rr, cy - rr, rr * 2, rr * 2); }
        const gr = g.createLinearGradient(0, ry * rowH, 0, ry * rowH + rowH); gr.addColorStop(0, "rgba(255,240,215,.06)"); gr.addColorStop(1, "rgba(0,0,0,.16)"); g.fillStyle = gr; g.fillRect(x + 4, ry * rowH + 4, bw - 8, rowH - 8);
        x += bw;
      }
    }
    for (let i = 0; i < w * h / 70; i++) { g.fillStyle = q() < 0.5 ? `rgba(0,0,0,${0.08 + q() * 0.16})` : `rgba(255,240,220,${0.04 + q() * 0.07})`; const s = 0.7 + q() * 2.2; g.fillRect(q() * w, q() * h, s, s); }
  };
  const wallT = canvasTex(1024, 1024, stonePaint(7), [35, 7.5]);
  const wall = add(new THREE.Mesh(new THREE.PlaneGeometry(140, 30), std({ map: wallT, bumpMap: wallT, bumpScale: 1.2, color: 0xb0a090 })), scene, false);
  wall.position.set(22, 15, -0.32);
  const floorT = canvasTex(1024, 1024, (g, w, h) => {
    const q = mulberry(23); g.fillStyle = "#15110e"; g.fillRect(0, 0, w, h);
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      const j = 0.75 + q() * 0.4; g.fillStyle = `rgb(${70 * j | 0},${62 * j | 0},${54 * j | 0})`; g.fillRect(x * 256 + 5, y * 256 + 5, 246, 246);
      for (let k = 0; k < 5; k++) { const cx = x * 256 + q() * 256, cy = y * 256 + q() * 256, rr = 30 + q() * 90; const gr = g.createRadialGradient(cx, cy, 0, cx, cy, rr); gr.addColorStop(0, q() < 0.5 ? "rgba(255,240,220,.06)" : "rgba(0,0,0,.14)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(cx - rr, cy - rr, rr * 2, rr * 2); }
    }
    for (let i = 0; i < w * h / 60; i++) { g.fillStyle = q() < 0.5 ? `rgba(0,0,0,${0.1 + q() * 0.15})` : `rgba(255,240,220,${0.03 + q() * 0.06})`; const s = 0.7 + q() * 2; g.fillRect(q() * w, q() * h, s, s); }
  }, [140 / 3.2, 50 / 3.2]);
  const floor = add(new THREE.Mesh(new THREE.PlaneGeometry(140, 50), std({ map: floorT, bumpMap: floorT, bumpScale: 0.8, roughness: 0.62, color: 0xa89888 })), scene, false);
  floor.rotation.x = -Math.PI / 2; floor.position.set(22, 0, 24.7);
  const frameT = canvasTex(1024, 1024, stonePaint(41, [92, 80, 66]), [0.28, 0.28]);
  const stoneM = std({ map: frameT, bumpMap: frameT, bumpScale: 1.0, color: 0xc8b8a4 });
  const ironM = std({ color: 0x1a1b1e, metalness: 0.7, roughness: 0.45, envMapIntensity: ENV * 1.5 });

  // grey seedy glass used for tinted segment panes (colour set per frame)
  const seedT = canvasTex(256, 256, (g, w, h) => { pane(g, poly([[0, 0], [w, 0], [w, h], [0, h]]), "#E6E2DA", mulberry(5), [0, 0, w, h]); });
  const softT = canvasTex(128, 128, (g, w) => { g.filter = "blur(16px)"; g.fillStyle = "#fff"; g.fillRect(30, 30, w - 60, w - 60); });
  const glowT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 1, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,240,200,1)"); gr.addColorStop(0.3, "rgba(255,210,140,.45)"); gr.addColorStop(1, "rgba(255,180,90,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const shaftT = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(0.6, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); const gx = g.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, "rgba(0,0,0,1)"); gx.addColorStop(0.3, "rgba(0,0,0,0)"); gx.addColorStop(0.7, "rgba(0,0,0,0)"); gx.addColorStop(1, "rgba(0,0,0,1)"); g.globalCompositeOperation = "destination-out"; g.fillStyle = gx; g.fillRect(0, 0, w, h); });

  const addM = (o) => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, ...o });
  const pools = []; // [mesh, baseColor, getGlow]
  const pool = (x, z, w, d, col, op = 0.5) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), addM({ map: softT, color: col }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.02 + pools.length * 0.0005, z); m.renderOrder = 2; scene.add(m);
    const o = { m, c: new THREE.Color(col), op }; pools.push(o); return o;
  };
  // a shaft: quad from a top edge at the glass to a bottom edge on the floor
  const shaft = (x0, y0, x1, z1, w0, w1, col) => {
    const geo = new THREE.BufferGeometry();
    const v = new Float32Array([x0 - w0 / 2, y0, 0.1, x0 + w0 / 2, y0, 0.1, x1 - w1 / 2, 0.05, z1, x1 + w1 / 2, 0.05, z1]);
    geo.setAttribute("position", new THREE.BufferAttribute(v, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), 2));
    geo.setIndex([0, 2, 1, 1, 2, 3]);
    const m = new THREE.Mesh(geo, addM({ map: shaftT, color: col, side: THREE.DoubleSide, opacity: 1 }));
    m.renderOrder = 3; scene.add(m);
    return { m, c: new THREE.Color(col) };
  };

  // stone frame around an outline, with a hole the shape of the glass
  const frame = (x, W, y0, y1, k = 0.75, m = 0.42, depth = 0.75) => {
    const outer = lancet(W + 2 * m, y0 - m, y1, k).s, inner = lancet(W, y0, y1, k).s;
    outer.holes.push(inner);
    const geo = new THREE.ExtrudeGeometry(outer, { depth, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2, curveSegments: 40 });
    const f = add(new THREE.Mesh(geo, stoneM)); f.position.set(x, 0, -0.3);
    // sill
    add(new THREE.Mesh(new THREE.BoxGeometry(W + 1.3, 0.24, 1.1), stoneM)).position.set(x, y0 - m - 0.12, 0.2);
    return f;
  };
  const glassPlane = (w, h, mat, x, y, z = -0.12) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); scene.add(m); return m; };
  const engr = (txt, w, h, font, opts = {}) => label(w, h, (g, W, H) => {
    stonePaint(opts.seed || 51, [96, 84, 70])(g, W, H);
    g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(0, 0, W, H);
    g.strokeStyle = "rgba(220,180,90,.75)"; g.lineWidth = 4; g.strokeRect(10, 10, W - 20, H - 20);
    g.font = font; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "rgba(0,0,0,.7)"; g.fillText(txt, W / 2 + 2, H / 2 + 4);
    const gr = g.createLinearGradient(0, H * 0.25, 0, H * 0.75); gr.addColorStop(0, "#FFE59A"); gr.addColorStop(1, "#C08A22");
    g.fillStyle = gr; g.fillText(txt, W / 2, H / 2 + 2);
  });
  const plaque = (txt, w, h, x, y, z, font, cw = 1024) => {
    const tx = engr(txt, cw, Math.round(cw * h / w), font);
    const m = add(new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.16), [stoneM, stoneM, stoneM, stoneM, std({ map: tx, emissiveMap: tx, emissive: 0xffffff, emissiveIntensity: 0.12, roughness: 0.7 }), stoneM]));
    m.position.set(x, y, z); return m;
  };

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0xd8c8b0, 0x1a1210, 0.22); scene.add(hemi);
  const sun = new THREE.SpotLight(0xffdcae, 0, 80, 0.3, 0.75, 1.0);
  sun.position.set(0, 26, -16); sun.target.position.set(0, 0, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 5;
  scene.add(sun, sun.target);
  const stLights = {};
  for (const [k, x, c] of [["W", 0, 0xffc890], ["MAP", MAPX, 0xd8e0a0], ["TL", TLX, 0xffc890], ["OF", OFX, 0xffb0a0], ["ML", MLX, 0xffd890]]) {
    const L = new THREE.PointLight(c, 0, 26, 1.2); L.position.set(x, 6.5, 4.5); scene.add(L); stLights[k] = L;
  }
  const tintL = new THREE.PointLight(0xff3040, 0, 9, 1.5); tintL.position.set(-4.2, 9, 1.4); scene.add(tintL);
  const tintR = new THREE.PointLight(0x3a60ff, 0, 9, 1.5); tintR.position.set(4.2, 9, 1.4); scene.add(tintR);

  // ================= W: the 13-month window =================
  const PW = 2.0, PH = 2.3, MG = 0.24, GW = 3 * PW + 2 * MG, GY0 = 3.0, GH = 4 * PH + 3 * MG, GY1 = GY0 + GH;
  const HUE = ["EM", "RU", "SA", "AM"];
  const panelHue = (i) => { const c = i % 3, rr = (i / 3) | 0; return PAL[HUE[(rr + c) % 4]]; };
  const paintMonth = (i) => (g, w, h) => {
    const q = mulberry(300 + i * 7), P = panelHue(i), B = 28;
    g.fillStyle = LEAD; g.fillRect(0, 0, w, h);
    // border of small panes
    const borderSeg = [];
    for (let x = 0, k = 0; x < w; x += 64, k++) { borderSeg.push([[x, 0], [x + 64, 0], [x + 64, B], [x, B]], k); borderSeg.push([[x, h - B], [x + 64, h - B], [x + 64, h], [x, h]], k + 1); }
    for (let y = B, k = 0; y < h - B; y += 67, k++) { const y2 = Math.min(h - B, y + 67); borderSeg.push([[0, y], [B, y], [B, y2], [0, y2]], k); borderSeg.push([[w - B, y], [w, y], [w, y2], [w - B, y2]], k + 1); }
    const segs = []; for (let s = 0; s < borderSeg.length; s += 2) segs.push([borderSeg[s], borderSeg[s + 1]]);
    for (const [P2, k] of segs) pane(g, poly(P2), k % 2 ? GOLDG : P.bg, q, bbOf(P2));
    // medallion zone
    const MZ = 196, cx = w / 2, cy = B + MZ / 2;
    pane(g, poly([[B, B], [w - B, B], [w - B, B + MZ], [B, B + MZ]]), VIOL, q, [B, B, w - 2 * B, MZ]);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; const P2 = star(cx + Math.cos(a) * 168, cy + Math.sin(a) * 82, 20, 9, 4, 0); pane(g, poly(P2), GOLDG, q, bbOf(P2)); }
    for (let k = 0; k < 12; k++) { const a0 = k * Math.PI / 6, a1 = a0 + Math.PI / 6; pane(g, seg(cx, cy, 66, 88, a0, a1), k % 2 ? P.a : GOLDG, q, [cx - 88, cy - 88, 176, 176]); }
    pane(g, circ(cx, cy, 66), "#F4CF5A", q, [cx - 66, cy - 66, 132, 132]);
    paint(g, String(i + 1), cx, cy + 4, `700 ${i + 1 >= 10 ? 74 : 86}px ${GAR}`);
    // 30 day-diamonds
    const LY = B + MZ, LH = h - B - LY, cw = (w - 2 * B) / 5, ch = LH / 6;
    pane(g, poly([[B, LY], [w - B, LY], [w - B, h - B], [B, h - B]]), P.bg, q, [B, LY, w - 2 * B, LH]);
    const dia = [];
    for (let ry = 0; ry < 6; ry++) for (let rx = 0; rx < 5; rx++) {
      const x0 = B + rx * cw, y0 = LY + ry * ch;
      const D = [[x0 + cw / 2, y0 + 3], [x0 + cw - 3, y0 + ch / 2], [x0 + cw / 2, y0 + ch - 3], [x0 + 3, y0 + ch / 2]];
      pane(g, poly(D), (rx + ry) % 2 ? P.a : P.b, q, bbOf(D)); dia.push(D);
    }
    // lead
    for (const [P2] of segs) lead(g, poly(P2), 6);
    lead(g, poly([[B, B], [w - B, B], [w - B, B + MZ], [B, B + MZ]]), 7);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; lead(g, poly(star(cx + Math.cos(a) * 168, cy + Math.sin(a) * 82, 20, 9, 4, 0)), 5); }
    lead(g, circ(cx, cy, 88), 8); lead(g, circ(cx, cy, 66), 7);
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; lead(g, poly([[cx + Math.cos(a) * 66, cy + Math.sin(a) * 66], [cx + Math.cos(a) * 88, cy + Math.sin(a) * 88]]), 5); }
    for (const D of dia) lead(g, poly(D), 5);
    lead(g, poly([[B, LY], [w - B, LY], [w - B, h - B], [B, h - B]]), 7);
    lead(g, poly([[2, 2], [w - 2, 2], [w - 2, h - 2], [2, h - 2]]), 8);
  };
  const panels = [];
  for (let i = 0; i < 12; i++) {
    const c = i % 3, rr = (i / 3) | 0;
    const tx = label(512, 592, paintMonth(i)); tx.anisotropy = 16;
    const m = glassPlane(PW, PH, glassM(tx), (c - 1) * (PW + MG), GY1 - PH / 2 - rr * (PH + MG));
    panels.push({ m, c, rr, hue: new THREE.Color(panelHue(i).a) });
  }
  // mullions, transoms, saddle bars
  for (const s of [-1, 1]) add(new THREE.Mesh(new THREE.BoxGeometry(MG, GH, 0.55), stoneM)).position.set(s * (PW + MG) / 2, GY0 + GH / 2, -0.05);
  for (let k = 1; k < 4; k++) add(new THREE.Mesh(new THREE.BoxGeometry(GW, MG, 0.5), stoneM)).position.set(0, GY0 + k * (PH + MG) - MG / 2, -0.06);
  add(new THREE.Mesh(new THREE.BoxGeometry(GW, MG, 0.5), stoneM)).position.set(0, GY1 + MG / 2 - 0.02, -0.06);
  for (let k = 0; k < 4; k++) add(new THREE.Mesh(new THREE.BoxGeometry(GW, 0.04, 0.05), ironM)).position.set(0, GY0 + k * (PH + MG) + 0.62, -0.06);
  // arch head with rays + oculus for Pagumen
  const AH = archHead(GW, GY1 + MG);
  const OCY = GY1 + 2.05, OR = 1.18, OR0 = 0.44;
  const headBB = [-GW / 2, GY1 + MG, GW / 2, AH.apex];
  const headT = label(512, Math.round(512 * (AH.apex - GY1 - MG) / GW), (g, w, h) => {
    const q = mulberry(77), sx = w / GW, cx = w / 2, cy = h - (OCY - GY1 - MG) * sx;
    g.fillStyle = LEAD; g.fillRect(0, 0, w, h);
    const N = 18;
    for (let k = 0; k < N; k++) { const a0 = Math.PI + k * Math.PI / N * 2, a1 = a0 + Math.PI / N * 2; pane(g, seg(cx, cy, OR * sx, w, a0, a1), [SAPH, VIOL, SAPH, "#14306E"][k % 4], q, [0, 0, w, h]); }
    for (let k = 0; k < N; k++) { const a = Math.PI + (k + 0.5) * Math.PI / N * 2; const x = cx + Math.cos(a) * (OR * sx + 70), y = cy + Math.sin(a) * (OR * sx + 70); const S = star(x, y, 15, 7, 4, a); pane(g, poly(S), GOLDG, q, bbOf(S)); lead(g, poly(S), 4); }
    for (let k = 0; k < N; k++) { const a = Math.PI + k * Math.PI / N * 2; lead(g, poly([[cx + Math.cos(a) * OR * sx, cy + Math.sin(a) * OR * sx], [cx + Math.cos(a) * w, cy + Math.sin(a) * w]]), 6); }
  });
  const headM = new THREE.Mesh(shapeGeo(AH.s, headBB), glassM(headT)); headM.position.z = -0.13; scene.add(headM);
  const petals = [];
  for (let k = 0; k < 6; k++) {
    const a0 = Math.PI / 2 + k * Math.PI / 3 + 0.035, a1 = a0 + Math.PI / 3 - 0.07;
    const s = new THREE.Shape(); s.absarc(0, 0, OR, a0, a1, false); s.absarc(0, 0, OR0 + 0.04, a1, a0, true);
    const m = new THREE.Mesh(shapeGeo(s, [-OR, -OR, OR, OR]), glassM(seedT)); m.position.set(0, OCY, -0.08); scene.add(m);
    petals.push({ m, c: new THREE.Color(k === 5 ? RUBY : (k % 2 ? "#F0B428" : "#E39A12")) });
  }
  const leadDisc = new THREE.Mesh(new THREE.CircleGeometry(OR + 0.02, 64), new THREE.MeshBasicMaterial({ color: 0x0b0b0d })); leadDisc.position.set(0, OCY, -0.1); scene.add(leadDisc);
  const pagT = label(256, 256, (g, w) => { const q = mulberry(13); g.fillStyle = LEAD; g.fillRect(0, 0, w, w); pane(g, circ(w / 2, w / 2, w / 2 - 6), "#2A57C8", q, [0, 0, w, w]); paint(g, "13", w / 2, w / 2 + 6, `700 120px ${GAR}`, "rgba(255,236,170,.96)"); lead(g, circ(w / 2, w / 2, w / 2 - 6), 10); });
  const pagC = new THREE.Mesh(new THREE.CircleGeometry(OR0, 48), glassM(pagT)); pagC.position.set(0, OCY, -0.07); scene.add(pagC);
  { const ring = add(new THREE.Mesh(new THREE.TorusGeometry(OR + 0.1, 0.13, 12, 64), stoneM)); ring.position.set(0, OCY, 0.02); }
  const PAGUMEN = plaque("PAGUMEN", 1.9, 0.36, 0, GY1 + 0.62, 0.12, `700 104px ${CIN}`, 1024);
  frame(0, GW, GY0, GY1 + MG);
  // predella roundels: four evangelist symbols, simple shapes, no figures, no faces
  const EVA = [["YOHANES", SAPH, "eagle"], ["MATIUS", RUBY, "wings"], ["MARKUS", EMER, "lion"], ["LUKAS", "#C98410", "ox"]];
  const paintEva = (k) => (g, w) => {
    const [name, bgc, sym] = EVA[k], q = mulberry(500 + k), c = w / 2;
    g.fillStyle = LEAD; g.fillRect(0, 0, w, w);
    for (let s = 0; s < 16; s++) { const a0 = s * Math.PI / 8, a1 = a0 + Math.PI / 8; pane(g, seg(c, c, 214, 250, a0, a1), s % 2 ? GOLDG : VIOL, q, [0, 0, w, w]); }
    pane(g, circ(c, c, 214), bgc, q, [c - 214, c - 214, 428, 428]);
    const shapes = [];
    const mir = (P) => P.map(([x, y]) => [w - x, y]);
    if (sym === "eagle") {
      const Lw = [[244, 238], [92, 150], [110, 196], [64, 206], [112, 238], [84, 262], [244, 276]];
      shapes.push([Lw, GOLDG], [mir(Lw), GOLDG], [[[232, 190], [280, 190], [272, 330], [256, 352], [240, 330]], "#F6E3A0"], [[[238, 160], [274, 160], [290, 178], [256, 196], [236, 186]], "#F6E3A0"], [[[236, 334], [276, 334], [300, 372], [212, 372]], GOLDG]);
    } else if (sym === "wings") {
      const Lw = [[248, 330], [176, 110], [130, 142], [146, 200], [110, 222], [140, 270], [118, 292], [190, 336]];
      shapes.push([Lw, "#F6E3A0"], [mir(Lw), "#F6E3A0"], [star(256, 150, 46, 18, 6), GOLDG]);
    } else if (sym === "lion") {
      shapes.push([star(256, 248, 132, 92, 12, -Math.PI / 2), "#E39A12"], [[[200, 186], [218, 140], [240, 178]], GOLDG], [[[312, 186], [294, 140], [272, 178]], GOLDG]);
      shapes.push(["c", 256, 250, 76, GOLDG]);
    } else {
      const Lh = [[206, 206], [140, 168], [118, 112], [160, 140], [214, 182]];
      shapes.push([[[192, 196], [320, 196], [300, 330], [212, 330]], "#B8641C"], [Lh, "#F6E3A0"], [mir(Lh), "#F6E3A0"], ["c", 256, 318, 46, "#E9B86A"]);
    }
    for (const s of shapes) { if (s[0] === "c") pane(g, circ(s[1], s[2], s[3]), s[4], q, [s[1] - s[3], s[2] - s[3], s[3] * 2, s[3] * 2]); else pane(g, poly(s[0]), s[1], q, bbOf(s[0])); }
    const band = [[96, 392], [416, 392], [404, 452], [108, 452]];
    pane(g, poly(band), "#F4DD92", q, bbOf(band));
    paint(g, name, c, 424, `700 ${name.length > 6 ? 44 : 50}px ${CIN}`);
    for (const s of shapes) lead(g, s[0] === "c" ? circ(s[1], s[2], s[3]) : poly(s[0]), 6);
    lead(g, poly(band), 7); lead(g, circ(c, c, 214), 8); lead(g, circ(c, c, 250), 8);
    for (let s = 0; s < 16; s++) { const a = s * Math.PI / 8; lead(g, poly([[c + Math.cos(a) * 214, c + Math.sin(a) * 214], [c + Math.cos(a) * 250, c + Math.sin(a) * 250]]), 5); }
  };
  const RY = 1.78, RR = 0.7;
  const roundels = EVA.map((_, k) => {
    const tx = label(512, 512, paintEva(k)); tx.anisotropy = 16;
    const x = (k - 1.5) * 1.62;
    const m = new THREE.Mesh(new THREE.CircleGeometry(RR, 64), glassM(tx)); m.position.set(x, RY, -0.1); scene.add(m);
    const ring = add(new THREE.Mesh(new THREE.TorusGeometry(RR + 0.06, 0.09, 10, 56), stoneM)); ring.position.set(x, RY, 0.0);
    return m;
  });
  add(new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.2, 0.6), stoneM)).position.set(0, 0.86, 0.12);

  // plinth with the AUDIRA brass plaque; Enkutatash jewels rise on it
  const PZ = 4.4;
  add(new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.1, 1.3), stoneM)).position.set(0, 0.55, PZ);
  add(new THREE.Mesh(new THREE.BoxGeometry(2.95, 0.16, 1.62), stoneM)).position.set(0, 1.18, PZ);
  add(new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.14, 1.55), stoneM)).position.set(0, 0.07, PZ);
  const brandT = label(1024, 300, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#D9B45A"); gr.addColorStop(0.5, "#B48A30"); gr.addColorStop(1, "#7E5C1C"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const q = mulberry(9); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "255,240,200" : "60,40,10"},${0.04 + q() * 0.06})`; g.fillRect(q() * w, q() * h, 1 + q() * 30, 1); }
    g.strokeStyle = "#5A3E10"; g.lineWidth = 8; g.strokeRect(16, 16, w - 32, h - 32);
    g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 140px ${CIN}`; g.fillStyle = "rgba(255,240,200,.5)"; g.fillText("AUDIRA", w / 2 + 2, h * 0.42 + 3); g.fillStyle = "#3A260A"; g.fillText("AUDIRA", w / 2, h * 0.42);
    g.font = `600 44px ${CIN}`; g.fillStyle = "#3A260A"; g.fillText("JENDELA 13 BULAN", w / 2, h * 0.8);
  });
  const brand = add(new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.56, 0.05), [std({ color: 0x8a6420, metalness: 0.8, roughness: 0.4 }), std({ color: 0x8a6420, metalness: 0.8 }), std({ color: 0x8a6420, metalness: 0.8 }), std({ color: 0x8a6420, metalness: 0.8 }), std({ map: brandT, metalness: 0.75, roughness: 0.38, envMapIntensity: ENV * 2.5, emissiveMap: brandT, emissive: 0xffffff, emissiveIntensity: 0.16 }), std({ color: 0x8a6420 })]));
  brand.position.set(0, 0.58, PZ + 0.68);
  const GEMC = [ETG, ETY, ETR, "#2E6BE0", ETG, ETY, ETR];
  const gems = GEMC.map((c, k) => {
    const geo = k % 3 === 1 ? new THREE.IcosahedronGeometry(1, 0) : new THREE.OctahedronGeometry(1, 0);
    const m = add(new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.06, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.05, flatShading: true, emissive: c, emissiveIntensity: 0.45, envMapIntensity: 1.6 })));
    const x = (k - 3) * 0.36, z = PZ + (k % 2 ? -0.28 : 0.2), s = 0.17 + (k === 3 ? 0.07 : (k % 3) * 0.025);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    scene.add(glow);
    return { m, x, z, s, glow, ph: k * 1.3 };
  });

  // main pools + shafts
  const mainPools = panels.map((p) => pool((p.c - 1) * 2.15, 3.0 + 0.62 * (3 - p.rr) * 1.0 + 0.4, 2.2, 1.9, p.hue.getHex(), 0.42));
  const pagPool = pool(0, 6.6, 1.6, 1.2, 0xf0b428, 0.4);
  const warmPool = pool(0, 4.8, 9.5, 7.5, 0xffc27a, 0.12);
  const mainShafts = [-1, 0, 1].map((c) => shaft(c * 2.2, GY0 + 6, c * 2.6, 5.6, 1.7, 2.6, [0xff9a70, 0xffe0a0, 0x80a8ff][c + 1]));

  // ================= MAP window =================
  const MW = 6.0, MY0 = 3.0, MY1 = 10.6;
  const LON0 = 31.6, LON1 = 49.4, LAT0 = -2, LAT1 = 20;
  const mapT = label(768, 973, (g, w, h) => {
    const q = mulberry(1987);
    const X = (lon) => (lon - LON0) / (LON1 - LON0) * w, Y = (lat) => (LAT1 - lat) / (LAT1 - LAT0) * h;
    const ringP = (c) => (gg) => { for (const rg of c.rings) { gg.moveTo(X(rg[0][0]), Y(rg[0][1])); for (const p of rg) gg.lineTo(X(p[0]), Y(p[1])); gg.closePath(); } };
    const eth = GEO.find((c) => c.name === "Ethiopia");
    // jittered quarry cells; each cell is a separate piece of glass
    const NX = 7, NY = 9, V = [];
    for (let j = 0; j <= NY; j++) { V.push([]); for (let i = 0; i <= NX; i++) { const edge = i === 0 || j === 0 || i === NX || j === NY; V[j].push([i * w / NX + (edge ? 0 : (q() - 0.5) * 40), j * h / NY + (edge ? 0 : (q() - 0.5) * 40)]); } }
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const C = [V[j][i], V[j][i + 1], V[j + 1][i + 1], V[j + 1][i]], bb = bbOf(C), jt = 0.88 + q() * 0.22;
      g.save(); g.beginPath(); poly(C)(g); g.clip();
      pane(g, poly(C), SAPH, q, bb);
      let n = 0;
      for (const c of GEO) { if (c === eth) continue; g.save(); g.beginPath(); ringP(c)(g); g.clip(); pane(g, poly(C), n++ % 2 ? "#9A6620" : "#7E5218", q, bb); g.restore(); }
      g.save(); g.beginPath(); ringP(eth)(g); g.clip();
      for (const [la0, la1, col] of [[11.2, 25, ETG], [7.3, 11.2, ETY], [-5, 7.3, ETR]]) { g.save(); g.beginPath(); g.rect(0, Y(la1), w, Y(la0) - Y(la1)); g.clip(); pane(g, poly(C), col, q, bb); g.restore(); }
      g.restore();
      g.fillStyle = jt > 1 ? `rgba(255,255,240,${(jt - 1) * 0.5})` : `rgba(0,0,0,${(1 - jt) * 0.6})`; g.fillRect(bb[0], bb[1], bb[2], bb[3]);
      g.restore();
    }
    // labels painted on the glass
    paint(g, "LAUT MERAH", 0, 0, `italic 600 30px ${GAR}`);
    g.save(); g.translate(X(39.6), Y(17.0)); g.rotate(1.02); paint(g, "LAUT MERAH", 0, 0, `italic 600 30px ${GAR}`, "rgba(240,236,220,.9)"); g.restore();
    // lead network: cells thin, borders and coast thick
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) lead(g, poly([V[j][i], V[j][i + 1], V[j + 1][i + 1], V[j + 1][i]]), 4);
    for (const c of GEO) lead(g, ringP(c), 6);
    g.save(); g.beginPath(); ringP(eth)(g); g.clip(); for (const la of [11.2, 7.3]) lead(g, poly([[0, Y(la)], [w, Y(la)]]), 6); g.restore();
    lead(g, ringP(eth), 11);
    // Addis Ababa jewel + labels
    const ax = X(38.74), ay = Y(9.03);
    pane(g, circ(ax, ay, 17), "#F8F2E0", q, [ax - 17, ay - 17, 34, 34]); lead(g, circ(ax, ay, 17), 6);
    g.font = `700 30px ${CIN}`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 7; g.strokeStyle = "rgba(20,14,8,.9)"; g.strokeText("ADDIS ABABA", ax - 6, ay - 38); g.fillStyle = "#FFF6DA"; g.fillText("ADDIS ABABA", ax - 6, ay - 38);
    g.font = `700 74px ${CIN}`; g.lineWidth = 10; g.strokeText("ETIOPIA", X(40.6), Y(5.4)); g.fillStyle = "#FFF6DA"; g.fillText("ETIOPIA", X(40.6), Y(5.4));
    // border + lead-came signature pane
    const Bd = 22, SG = [[w - 200, h - 54], [w - Bd - 8, h - 54], [w - Bd - 8, h - Bd - 6], [w - 200, h - Bd - 6]];
    for (const [x0, y0, x1, y1] of [[0, 0, w, Bd], [0, h - Bd, w, h], [0, 0, Bd, h], [w - Bd, 0, w, h]]) {
      const horiz = x1 - x0 > y1 - y0, L = horiz ? x1 - x0 : y1 - y0, n = Math.round(L / 60);
      for (let k = 0; k < n; k++) { const P = horiz ? [[x0 + k * L / n, y0], [x0 + (k + 1) * L / n, y0], [x0 + (k + 1) * L / n, y1], [x0 + k * L / n, y1]] : [[x0, y0 + k * L / n], [x1, y0 + k * L / n], [x1, y0 + (k + 1) * L / n], [x0, y0 + (k + 1) * L / n]]; pane(g, poly(P), k % 2 ? GOLDG : RUBY, q, bbOf(P)); lead(g, poly(P), 5); }
    }
    pane(g, poly(SG), "#F4DD92", q, bbOf(SG)); paint(g, "AUDIRA", (SG[0][0] + SG[1][0]) / 2, (SG[0][1] + SG[2][1]) / 2 + 2, `700 24px ${CIN}`); lead(g, poly(SG), 5);
    lead(g, poly([[2, 2], [w - 2, 2], [w - 2, h - 2], [2, h - 2]]), 8);
  });
  mapT.anisotropy = 16;
  const mapM = glassPlane(MW, MY1 - MY0, glassM(mapT), MAPX, (MY0 + MY1) / 2);
  const ethMaskT = canvasTex(384, 486, (g, w, h) => {
    const eth = GEO.find((c) => c.name === "Ethiopia");
    const X = (lon) => (lon - LON0) / (LON1 - LON0) * w, Y = (lat) => (LAT1 - lat) / (LAT1 - LAT0) * h;
    g.filter = "blur(3px)"; g.fillStyle = "#fff"; g.beginPath(); for (const rg of eth.rings) { g.moveTo(X(rg[0][0]), Y(rg[0][1])); for (const p of rg) g.lineTo(X(p[0]), Y(p[1])); g.closePath(); } g.fill();
  });
  const ethMask = glassPlane(MW, MY1 - MY0, addM({ map: ethMaskT, color: 0xfff0c0, opacity: 0 }), MAPX, (MY0 + MY1) / 2, -0.1);
  const MH = archHead(MW, MY1);
  const mapHeadT = label(512, Math.round(512 * (MH.apex - MY1) / MW), (g, w, h) => {
    const q = mulberry(61), cx = w / 2, cy = h + 30; g.fillStyle = LEAD; g.fillRect(0, 0, w, h);
    pane(g, circ(cx, cy, 120), GOLDG, q, [cx - 120, cy - 120, 240, 240]);
    const N = 14; for (let k = 0; k < N; k++) { const a0 = Math.PI + k * Math.PI / N, a1 = a0 + Math.PI / N; pane(g, seg(cx, cy, 120, w, a0, a1), k % 2 ? "#E8A21A" : "#F6CC48", q, [0, 0, w, h]); }
    for (let k = 0; k <= N; k++) { const a = Math.PI + k * Math.PI / N; lead(g, poly([[cx + Math.cos(a) * 120, cy + Math.sin(a) * 120], [cx + Math.cos(a) * w, cy + Math.sin(a) * w]]), 6); }
    lead(g, circ(cx, cy, 120), 8);
  });
  const mapHead = new THREE.Mesh(shapeGeo(MH.s, [-MW / 2, MY1, MW / 2, MH.apex]), glassM(mapHeadT)); mapHead.position.set(MAPX, 0, -0.13); scene.add(mapHead);
  frame(MAPX, MW, MY0, MY1);
  add(new THREE.Mesh(new THREE.BoxGeometry(MW, 0.04, 0.05), ironM)).position.set(MAPX, 5.6, -0.06);
  add(new THREE.Mesh(new THREE.BoxGeometry(MW, 0.04, 0.05), ironM)).position.set(MAPX, 8.2, -0.06);
  const mapPool = pool(MAPX, 4.6, 6.4, 5.5, 0xc8d070, 0.32);
  const mapShaft = shaft(MAPX, 8, MAPX + 0.4, 5.4, 4.2, 5.4, 0xfff0b0);
  plaque("ETIOPIA", 3.0, 0.5, MAPX, 1.75, -0.1, `700 104px ${CIN}`);

  // ================= decorative lancets between stations =================
  const decoT = [0, 1, 2].map((v) => label(256, 960, (g, w, h) => {
    const q = mulberry(900 + v), cols = [[SAPH, RUBY], [EMER, GOLDG], [VIOL, SAPH]][v];
    g.fillStyle = LEAD; g.fillRect(0, 0, w, h);
    const cw = w / 3, ch = cw * 1.5;
    for (let ry = -1; ry < h / ch + 1; ry++) for (let rx = -1; rx < 4; rx++) {
      const x0 = rx * cw + (ry % 2 ? cw / 2 : 0), y0 = ry * ch / 2;
      const D = [[x0 + cw / 2, y0], [x0 + cw, y0 + ch / 2], [x0 + cw / 2, y0 + ch], [x0, y0 + ch / 2]];
      pane(g, poly(D), cols[(rx + ry + 9) % 2], q, bbOf(D)); lead(g, poly(D), 5);
    }
    lead(g, poly([[2, 2], [w - 2, 2], [w - 2, h - 2], [2, h - 2]]), 8);
  }));
  const decos = [];
  for (const [x, v] of [[-36, 2], [-12, 0], [12, 1], [35, 2], [57, 0], [79, 1]]) {
    const DW = 1.7, D0 = 3.4, D1 = 10.2;
    const m = glassPlane(DW, D1 - D0, glassM(decoT[v]), x, (D0 + D1) / 2);
    const H = archHead(DW, D1), hm = new THREE.Mesh(shapeGeo(H.s, [-DW / 2, D1, DW / 2, H.apex]), glassM(seedT)); hm.position.set(x, 0, -0.13); scene.add(hm);
    frame(x, DW, D0, D1, 0.75, 0.3, 0.6);
    decos.push({ m, hm, x, hc: new THREE.Color(v === 1 ? GOLDG : SAPH), p: pool(x, 3.4, 2.2, 3.6, v === 1 ? 0xe0c060 : 0x7090ff, 0.22) });
  }

  // ================= TL: two glass bands =================
  const NP = 14, YW = 0.52, BW = NP * YW;
  const bands = [[10.0, "#D99A16", "#B47812", 11], [6.4, "#2A5CC8", "#1B3F98", 3]].map(([y, c1, c2, mk], bi) => {
    const panesB = [];
    for (let k = 0; k < NP; k++) {
      const x = TLX + (k - (NP - 1) / 2) * YW;
      let mat;
      if (k === mk) {
        const tx = label(128, 256, (g, w, h) => { const q = mulberry(70 + bi); g.fillStyle = LEAD; g.fillRect(0, 0, w, h); pane(g, poly([[6, 6], [w - 6, 6], [w - 6, h - 6], [6, h - 6]]), RUBY, q, [0, 0, w, h]); const S = star(w / 2, h / 2, 50, 20, 5); pane(g, poly(S), "#FFE07A", q, bbOf(S)); lead(g, poly(S), 5); lead(g, poly([[4, 4], [w - 4, 4], [w - 4, h - 4], [4, h - 4]]), 8); });
        mat = glassM(tx);
      } else mat = glassM(seedT);
      const m = glassPlane(YW - 0.06, 1.12, mat, x, y);
      panesB.push({ m, c: new THREE.Color(k === mk ? "#ffffff" : (k % 2 ? c1 : c2)), mk: k === mk, x });
    }
    const back = new THREE.Mesh(new THREE.PlaneGeometry(BW + 0.04, 1.2), new THREE.MeshBasicMaterial({ color: 0x0b0b0d })); back.position.set(TLX, y, -0.16); scene.add(back);
    // stone frame
    for (const s of [-1, 1]) { add(new THREE.Mesh(new THREE.BoxGeometry(BW + 0.9, 0.26, 0.6), stoneM)).position.set(TLX, y + s * 0.72, 0.0); add(new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.7, 0.6), stoneM)).position.set(TLX + s * (BW / 2 + 0.3), y, 0.0); }
    return { panes: panesB, y, mk, xm: TLX + (mk - (NP - 1) / 2) * YW };
  });
  plaque("ANNIANUS  ·  ALEKSANDRIA  ·  ±400 M", 6.4, 0.52, TLX, 11.28, 0.0, `700 54px ${CIN}`, 1280);
  plaque("DIONYSIUS EXIGUUS  ·  525 M", 6.4, 0.52, TLX, 7.68, 0.0, `700 56px ${CIN}`, 1280);
  const bracketM = std({ color: 0xffd060, emissive: 0xffc040, emissiveIntensity: 1.6, metalness: 0.6, roughness: 0.3 });
  const brBar = add(new THREE.Mesh(new THREE.BoxGeometry(1, 0.08, 0.08), bracketM)); brBar.position.set(0, 8.5, 0.25);
  const brA = add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 1, 0.08), bracketM));
  const brB = add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 1, 0.08), bracketM));
  const eightT = label(512, 160, (g, w, h) => { const q = mulberry(8); g.fillStyle = LEAD; g.fillRect(0, 0, w, h); pane(g, poly([[6, 6], [w - 6, 6], [w - 6, h - 6], [6, h - 6]]), "#F4DD92", q, [0, 0, w, h]); paint(g, "8 TAHUN", w / 2, h / 2 + 4, `700 92px ${CIN}`); lead(g, poly([[4, 4], [w - 4, 4], [w - 4, h - 4], [4, h - 4]]), 9); });
  const eight = glassPlane(1.7, 0.53, glassM(eightT, { transparent: true }), 0, 8.95, 0.3);
  const tlPool = pool(TLX, 4.2, 8.4, 4.5, 0xffc070, 0.3);
  const tlShafts = [shaft(TLX - 1, 9.6, TLX - 1.6, 6.5, 6, 7, 0xffc060), shaft(TLX + 1, 6.2, TLX + 1.6, 4.8, 6, 7, 0x6c90ff)];

  // ================= OF: Gregorian lancet, 8 -> 7 =================
  const OW = 5.4, OPW = 1.6, OPH = 1.0, OMG = 0.3, OVG = 0.2, OY0 = 3.0, OY1 = OY0 + 4 * OPH + 3 * OVG;
  const MON = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
  const monPaint = (txt, sub, col, wpx) => (g, w, h) => {
    const q = mulberry(txt.length * 31 + (sub ? sub.length : 0) + col.length); g.fillStyle = LEAD; g.fillRect(0, 0, w, h);
    pane(g, poly([[5, 5], [w - 5, 5], [w - 5, h - 5], [5, h - 5]]), col, q, [0, 0, w, h]);
    paint(g, txt, w / 2, sub ? h * 0.4 : h / 2 + 4, `700 ${sub ? 54 : 68}px ${CIN}`, "rgba(255,246,220,.95)");
    if (sub) paint(g, sub, w / 2, h * 0.76, `700 38px ${GAR}`, "rgba(255,246,220,.9)");
    lead(g, poly([[3, 3], [w - 3, 3], [w - 3, h - 3], [3, h - 3]]), 9);
  };
  const ofPanes = [];
  MON.forEach((mn, k) => {
    const c = k % 3, rr = (k / 3) | 0, x = OFX + (c - 1) * (OPW + OMG), y = OY1 - OPH / 2 - rr * (OPH + OVG);
    if (k === 8) {
      const wl = OPW / 3 - 0.02, wr = OPW * 2 / 3 - 0.02;
      const tl = label(128, 240, monPaint("SEP", "1–10", RUBY)), tr = label(256, 240, monPaint("SEP", "11–30", EMER));
      ofPanes.push({ m: glassPlane(wl, OPH, glassM(tl), x - OPW / 2 + wl / 2, y), seq: 8, grp: 0 });
      ofPanes.push({ m: glassPlane(wr, OPH, glassM(tr), x + OPW / 2 - wr / 2, y), seq: 9, grp: 1 });
    } else {
      const tx = label(256, 160, monPaint(mn, null, k < 8 ? RUBY : EMER));
      ofPanes.push({ m: glassPlane(OPW, OPH, glassM(tx), x, y), seq: k < 8 ? k : k + 1, grp: k < 8 ? 0 : 1 });
    }
  });
  { const bk = new THREE.Mesh(new THREE.PlaneGeometry(OW, OY1 - OY0), new THREE.MeshBasicMaterial({ color: 0x0b0b0d })); bk.position.set(OFX, (OY0 + OY1) / 2, -0.16); scene.add(bk); }
  for (const s of [-1, 1]) add(new THREE.Mesh(new THREE.BoxGeometry(OMG, OY1 - OY0, 0.5), stoneM)).position.set(OFX + s * (OPW + OMG) / 2, (OY0 + OY1) / 2, -0.05);
  for (let k = 1; k < 4; k++) add(new THREE.Mesh(new THREE.BoxGeometry(OW, OVG, 0.46), stoneM)).position.set(OFX, OY0 + k * (OPH + OVG) - OVG / 2, -0.06);
  const OH = archHead(OW, OY1 + 0.2);
  const ofHeadT = label(512, Math.round(512 * (OH.apex - OY1 - 0.2) / OW), (g, w, h) => {
    const q = mulberry(66), cx = w / 2, cy = h * 0.52; g.fillStyle = LEAD; g.fillRect(0, 0, w, h);
    const N = 16; for (let k = 0; k < N; k++) { const a0 = k * Math.PI * 2 / N, a1 = a0 + Math.PI * 2 / N; pane(g, seg(cx, cy, 140, w, a0, a1), k % 2 ? SAPH : "#14306E", q, [0, 0, w, h]); lead(g, poly([[cx + Math.cos(a0) * 140, cy + Math.sin(a0) * 140], [cx + Math.cos(a0) * w, cy + Math.sin(a0) * w]]), 5); }
  });
  { const hm = new THREE.Mesh(shapeGeo(OH.s, [-OW / 2, OY1 + 0.2, OW / 2, OH.apex]), glassM(ofHeadT)); hm.position.set(OFX, 0, -0.13); scene.add(hm); }
  add(new THREE.Mesh(new THREE.BoxGeometry(OW, 0.22, 0.48), stoneM)).position.set(OFX, OY1 + 0.1, -0.06);
  const OMY = OY1 + 0.2 + (OH.apex - OY1 - 0.2) * 0.48, OMR = 1.3;
  const digitPaint = (d, col) => (g, w) => { const q = mulberry(d.length + 40); g.fillStyle = LEAD; g.fillRect(0, 0, w, w); for (let s = 0; s < 12; s++) { const a0 = s * Math.PI / 6, a1 = a0 + Math.PI / 6; pane(g, seg(w / 2, w / 2, 190, 250, a0, a1), s % 2 ? GOLDG : col, q, [0, 0, w, w]); lead(g, poly([[w / 2 + Math.cos(a0) * 190, w / 2 + Math.sin(a0) * 190], [w / 2 + Math.cos(a0) * 250, w / 2 + Math.sin(a0) * 250]]), 5); } pane(g, circ(w / 2, w / 2, 190), col, q, [w / 2 - 190, w / 2 - 190, 380, 380]); paint(g, d, w / 2, w / 2 - 12, `700 230px ${GAR}`, "rgba(255,240,200,.97)"); paint(g, "TAHUN", w / 2, w / 2 + 128, `700 50px ${CIN}`, "rgba(255,240,200,.95)"); lead(g, circ(w / 2, w / 2, 190), 9); lead(g, circ(w / 2, w / 2, 250), 9); };
  const d8 = new THREE.Mesh(new THREE.CircleGeometry(OMR, 64), glassM(label(512, 512, digitPaint("8", RUBY)), { transparent: true }));
  const d7 = new THREE.Mesh(new THREE.CircleGeometry(OMR, 64), glassM(label(512, 512, digitPaint("7", EMER)), { transparent: true }));
  d8.position.set(OFX, OMY, -0.09); d7.position.set(OFX, OMY, -0.085); scene.add(d8, d7);
  { const ring = add(new THREE.Mesh(new THREE.TorusGeometry(OMR + 0.08, 0.12, 10, 64), stoneM)); ring.position.set(OFX, OMY, 0.02); }
  frame(OFX, OW, OY0, OY1 + 0.2);
  plaque("BULAN MASEHI", 3.4, 0.5, OFX, 1.75, -0.1, `700 96px ${CIN}`);
  const ofPool = pool(OFX, 4.4, 6.4, 5, 0xff8a70, 0.3);
  const ofPool2 = pool(OFX + 0.8, 5.0, 4.4, 3.6, 0x40d070, 0.0);

  // ================= ML: millennium rose + bunting =================
  const RC = 9.3, RRAD = 3.3;
  { const bk = new THREE.Mesh(new THREE.CircleGeometry(RRAD + 0.04, 96), new THREE.MeshBasicMaterial({ color: 0x0b0b0d })); bk.position.set(MLX, RC, -0.16); scene.add(bk); }
  const roseSegs = [];
  for (const [r0, r1, n, col, ring] of [[1.0, 1.78, 8, ETG, 0], [1.78, 2.56, 12, ETY, 1], [2.56, RRAD, 16, ETR, 2]]) {
    for (let k = 0; k < n; k++) {
      const a0 = k * Math.PI * 2 / n + 0.03, a1 = a0 + Math.PI * 2 / n - 0.06;
      const s = new THREE.Shape(); s.absarc(0, 0, r1 - 0.03, a0, a1, false); s.absarc(0, 0, r0 + 0.03, a1, a0, true);
      const m = new THREE.Mesh(shapeGeo(s, [-r1, -r1, r1, r1], 12), glassM(seedT)); m.position.set(MLX, RC, -0.12); scene.add(m);
      const c = new THREE.Color(col).multiplyScalar(0.9 + ((k * 7) % 5) * 0.05);
      roseSegs.push({ m, c, ring, k });
    }
  }
  const yrPaint = (txt, col, strike) => (g, w) => { const q = mulberry(txt.length + (strike ? 9 : 2)); g.fillStyle = LEAD; g.fillRect(0, 0, w, w); pane(g, circ(w / 2, w / 2, w / 2 - 8), col, q, [0, 0, w, w]); paint(g, txt, w / 2, w / 2 + 8, `700 128px ${GAR}`, "rgba(255,244,210,.97)"); lead(g, circ(w / 2, w / 2, w / 2 - 8), 12); };
  const y2000 = new THREE.Mesh(new THREE.CircleGeometry(0.97, 64), glassM(label(384, 384, yrPaint("2000", "#4A4E66")), { transparent: true }));
  const y2007 = new THREE.Mesh(new THREE.CircleGeometry(0.97, 64), glassM(label(384, 384, yrPaint("2007", "#C98A10")), { transparent: true }));
  y2000.position.set(MLX, RC, -0.1); y2007.position.set(MLX, RC, -0.095); scene.add(y2000, y2007);
  const strikeM = std({ color: 0x15161a, metalness: 0.6, roughness: 0.4 });
  const strike = add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.14, 0.06), strikeM)); strike.position.set(MLX, RC, 0.02); strike.rotation.z = 0.5;
  { const ring = add(new THREE.Mesh(new THREE.TorusGeometry(RRAD + 0.18, 0.26, 14, 96), stoneM)); ring.position.set(MLX, RC, 0.0); }
  for (const rr of [1.0, 1.78, 2.56]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.04, 6, 96), ironM); ring.position.set(MLX, RC, -0.04); scene.add(ring); }
  plaque("ADDIS ABABA  ·  11 SEPTEMBER 2007", 6.0, 0.6, MLX, 4.95, 0.0, `700 60px ${CIN}`, 1280);
  add(new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.24, 0.9), stoneM)).position.set(MLX, 4.45, 0.15);
  const mlPool = pool(MLX, 5.0, 7.5, 6, 0xe8d040, 0.28);
  const mlShaft = shaft(MLX, 8.5, MLX + 0.3, 6.5, 5.0, 6.6, 0xfff0a0);
  // bunting: three strings of green/yellow/red pennants on catenaries
  const triG = new THREE.BufferGeometry();
  triG.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-0.24, 0, 0, 0.24, 0, 0, 0, -0.62, 0]), 3)); triG.computeVertexNormals();
  const penM = [ETG, ETY, ETR].map((c) => std({ color: c, emissive: c, emissiveIntensity: 0.28, roughness: 0.75, side: THREE.DoubleSide }));
  const strings = [[7.6, 3.2, 1.2], [6.9, 5.2, 1.5], [6.0, 7.4, 1.8]].map(([yy, zz, sag], si) => {
    const N = 22, P = [], L = 15;
    const grp = G(MLX, 0, zz);
    const pts3 = [];
    for (let k = 0; k <= 40; k++) { const u = k / 40, x = -L / 2 + u * L; pts3.push(new THREE.Vector3(x, yy - sag * 4 * u * (1 - u), 0)); }
    const cord = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts3), 60, 0.025, 5), std({ color: 0x6a5c48, roughness: 0.95 })); grp.add(cord);
    for (let k = 0; k < N; k++) {
      const u = (k + 0.5) / N, x = -L / 2 + u * L, y = yy - sag * 4 * u * (1 - u);
      const m = new THREE.Mesh(triG, penM[(k + si) % 3]); m.position.set(x, y, 0); m.castShadow = true; grp.add(m); P.push({ m, k, col: (k + si) % 3 });
    }
    return { grp, P, si };
  });

  // ---------- dust motes ----------
  const dust = pts(scene, 260, { color: 0xffe8c0, size: 0.07, opacity: 0.75 });
  const dq = mulberry(4); const dSeed = Array.from({ length: 260 }, () => [dq() - 0.5, dq(), dq(), dq() * 6.28, 0.2 + dq() * 0.5]);

  // ---------- timing ----------
  const tA = A("s1:satu#2"), tB = A("s1:bulan");
  const lightAt = (i) => tA + i * (tB - tA) / 12;
  const s3D = A("s3:dua"), s3H = A("s3:hari");
  const relAt = (i) => s3D + i * (s3H - s3D) / 12;
  const tSeb = A("s4:sebelas"), tEnk = A("s4:Enkutatash"), tPer = A("s4:permata");
  const tEva = ["s3:Yohanes", "s3:Matius", "s3:Markus", "s3:Lukas"].map(A);

  // ---------- camera ----------
  const cv = (x, y, z, tx, ty, tz) => [x, y, z, tx, ty, tz];
  const keys = [
    [0, ...cv(0, 7.6, 13.5, 0, 8.2, 0)],
    [tB + 0.3, ...cv(0, 5.6, 25, 0, 9.1, 0)],
    [K.s1e, ...cv(0.4, 5.0, 29, 0, 9.3, 0)],
    [K.s2 + 0.85, ...cv(MAPX, 6.6, 21.5, MAPX, 8.1, 0)],
    [K.s2e, ...cv(MAPX + 0.7, 6.8, 19.5, MAPX, 8.0, 0)],
    [K.s3 + 0.9, ...cv(0, 6.6, 26, 0, 9.4, 0)],
    [A("s3:Sisanya") - 0.1, ...cv(0.3, 7.6, 22.5, 0, 9.9, 0)],
    [A("s3:ketiga") - 0.1, ...cv(0, 14.0, 11, 0, 15.3, 0)],
    [A("s3:enam") + 0.5, ...cv(0.3, 14.2, 10.2, 0, 15.3, 0)],
    [A("s3:Keempat") + 0.7, ...cv(-1.9, 2.6, 9.6, -1.9, 2.3, 0)],
    [tEva[0] + 0.2, ...cv(-2.2, 2.6, 9.4, -2.2, 2.3, 0)],
    [tEva[3], ...cv(2.0, 2.6, 9.4, 2.0, 2.3, 0)],
    [K.s3e, ...cv(1.3, 2.9, 10.6, 1.2, 2.4, 0)],
    [tSeb - 0.3, ...cv(-0.4, 7.4, 23, -0.6, 9.0, 0)],
    [tSeb + 0.9, ...cv(-0.6, 7.6, 21.5, -0.8, 9.2, 0)],
    [tEnk - 0.1, ...cv(0.5, 3.0, PZ + 7.6, 0, 2.0, PZ)],
    [K.s4e, ...cv(0.8, 2.9, PZ + 6.6, 0, 1.9, PZ)],
    [K.s5 + 1.5, ...cv(TLX, 8.4, 26, TLX, 9.0, 0)],
    [K.s5e, ...cv(TLX + 0.6, 8.4, 24.5, TLX, 8.9, 0)],
    [K.s6 + 1.1, ...cv(OFX, 6.8, 25, OFX, 7.5, 0)],
    [A("s6:tujuh") - 0.2, ...cv(OFX + 0.3, 6.9, 23.6, OFX, 7.6, 0)],
    [A("s6:tujuh") + 0.25, ...cv(OFX + 0.2, 7.0, 21.8, OFX, 7.8, 0)],
    [K.s6e, ...cv(OFX + 0.2, 7.0, 21.5, OFX, 7.8, 0)],
    [K.s7 + 1.1, ...cv(MLX, 8.4, 26, MLX, 9.9, 0)],
    [A("s7:bendera") - 0.2, ...cv(MLX - 0.3, 8.2, 24.5, MLX, 9.7, 0)],
    [K.s7e, ...cv(MLX - 0.8, 8.0, 23.5, MLX, 9.5, 0)],
    [K.s8 + 1.4, ...cv(34, 9.0, 40, 34, 9.0, 0)],
    [K.s8 + 2.9, ...cv(0, 4.0, 27, 0, 8.6, 0)],
    [A("s8:Menurut"), ...cv(0, 3.8, 25.5, 0, 8.6, 0)],
    [K.dur, ...cv(0, 4.6, 34, 0, 9.0, 0)],
  ];
  const camT = track(keys);
  const tgt = new THREE.Vector3();

  return (t) => {
    if (!labels.done && document.fonts && document.fonts.check(`700 40px "Cinzel"`) && document.fonts.check(`700 40px "EB Garamond"`)) {
      labels.done = true;
      for (const [tx, p] of labels) { const c = tx.image, g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); p(g, c.width, c.height); tx.needsUpdate = true; }
    }
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.18, c[1] + Math.sin(t * 0.29) * 0.12, c[2] + Math.cos(t * 0.31) * 0.2);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);

    const sunUp = 0.55 + 0.45 * on(t, 0, 1.6);
    const s8b = 1 + 0.18 * on(t, K.s8 + 1.5, 1.5);
    // ---- W panels ----
    let sum = 0;
    panels.forEach((p, i) => {
      let g = 0.1 + 0.9 * on(t, lightAt(i) - 0.05, 0.22) + 0.8 * pump(t, lightAt(i), 0.06, 0.6);
      const dim = on(t, K.s3 - 0.1, 0.5) * (1 - on(t, relAt(i), 0.2));
      g *= 1 - 0.5 * dim; g += 0.75 * pump(t, relAt(i), 0.06, 0.7);
      if (i === 0) g += 1.0 * pump(t, tSeb - 0.05, 0.15, 1.8) + 0.35 * (t > tSeb ? 1 - on(t, K.s5, 0.5) : 0);
      else g *= 1 - 0.32 * on(t, tSeb - 0.2, 0.3) * (1 - on(t, K.s5, 0.5));
      g *= sunUp * s8b;
      p.m.material.color.setScalar(g); sum += g;
      mainPools[i].m.material.color.copy(p.hue).multiplyScalar(mainPools[i].op * g);
    });
    const avg = sum / 12;
    // ---- Pagumen ----
    const pagOn = on(t, tB - 0.05, 0.22);
    petals.forEach((p, k) => {
      let g = 0.1 + 0.9 * pagOn + 0.8 * pump(t, tB, 0.06, 0.6);
      if (k < 5) { g *= 1 - 0.5 * on(t, K.s3 - 0.1, 0.5) * (1 - on(t, A("s3:lima") + k * 0.1, 0.15)); g += 0.8 * pump(t, A("s3:lima") + k * 0.1, 0.06, 0.6); }
      else { g = 0.08 + 1.0 * on(t, A("s3:enam") - 0.05, 0.2) + 1.0 * pump(t, A("s3:enam"), 0.06, 0.9) + 0.8 * pump(t, A("s3:kabisatnya"), 0.1, 1.0); }
      g *= sunUp * s8b;
      p.m.material.color.copy(p.c).multiplyScalar(g);
    });
    pagC.material.color.setScalar((0.1 + 0.9 * pagOn + 0.9 * pump(t, A("s3:Pagumen"), 0.08, 1.0) + 0.6 * pump(t, A("s3:Pagumen#2"), 0.08, 0.8)) * sunUp * s8b);
    pagPool.m.material.color.copy(pagPool.c).multiplyScalar(pagPool.op * pagOn * sunUp);
    headM.material.color.setScalar((0.25 + 0.6 * pagOn) * sunUp * s8b);
    // ---- roundels ----
    roundels.forEach((m, k) => {
      let g = 0.16 + 0.9 * on(t, tEva[k] - 0.1, 0.2) + 0.8 * pump(t, tEva[k], 0.06, 0.8);
      if (k === 3) g += 0.8 * pump(t, A("s3:kabisatnya"), 0.1, 1.0);
      m.material.color.setScalar(g * sunUp * s8b);
    });
    warmPool.m.material.color.copy(warmPool.c).multiplyScalar(warmPool.op * avg);
    mainShafts.forEach((s, k) => s.m.material.color.copy(s.c).multiplyScalar(0.07 * avg * (1 + 0.15 * Math.sin(t * 0.6 + k))));
    sun.intensity = 260 * avg; tintL.intensity = 5 * avg; tintR.intensity = 5 * avg;
    stLights.W.intensity = 5 * avg;
    // ---- gems ----
    gems.forEach((o, k) => {
      const u = back(clamp01((t - tEnk + 0.2 - k * 0.12) / 0.5), 1.6);
      const y = 1.26 + o.s * 1.3 + (u - 1) * 0.6 + 0.06 * Math.sin(t * 1.6 + o.ph) * u;
      o.m.position.set(o.x, y, o.z); o.m.scale.set(o.s * u, o.s * 1.3 * u, o.s * u); o.m.visible = u > 0.001;
      o.m.rotation.set(0.15, t * 0.7 + o.ph, 0.1);
      o.glow.position.set(o.x, y, o.z + 0.1);
      const gl = 0.9 * pump(t, tEnk - 0.2 + k * 0.12 + 0.3, 0.08, 0.6) + 0.9 * pump(t, tPer + k * 0.06, 0.08, 0.9) + (u > 0.5 ? 0.22 : 0);
      o.glow.material.opacity = gl; o.glow.scale.setScalar(0.9 + 0.6 * gl);
    });
    // ---- MAP ----
    const mapOn = on(t, K.s2 - 0.9, 0.9);
    const ethP = pump(t, A("s2:Etiopia") - 0.1, 0.15, 1.4) + pump(t, A("s2:Etiopia#2") - 0.1, 0.15, 1.2) + 0.5 * pump(t, A("s2:Ortodoks"), 0.15, 1.2);
    const mapG = (0.2 + 0.85 * mapOn) * sunUp;
    mapM.material.color.setScalar(mapG); mapHead.material.color.setScalar(mapG * 0.9);
    ethMask.material.opacity = 0.35 * ethP * mapOn;
    mapPool.m.material.color.copy(mapPool.c).multiplyScalar(mapPool.op * mapG);
    mapShaft.m.material.color.copy(mapShaft.c).multiplyScalar(0.06 * mapG);
    stLights.MAP.intensity = 5 * mapG;
    // ---- deco ----
    decos.forEach((d, k) => { const g = 0.42 * sunUp * (1 + 0.1 * Math.sin(t * 0.5 + k)) * s8b; d.m.material.color.setScalar(g); d.hm.material.color.copy(d.hc).multiplyScalar(g); d.p.m.material.color.copy(new THREE.Color(d.p.c)).multiplyScalar(d.p.op * g); });
    // ---- TL ----
    const tlOn = on(t, K.s5 - 0.6, 0.8);
    const bandAt = [A("s5:Sekitar"), A("s5:Eropa")], mkAt = [A("s5:Annianus"), A("s5:Dionysius")];
    bands.forEach((b, bi) => {
      b.panes.forEach((p, k) => {
        let g = 0.12 + 0.18 * tlOn + 0.75 * on(t, bandAt[bi] + k * 0.1, 0.2) + 0.5 * pump(t, bandAt[bi] + k * 0.1, 0.05, 0.5);
        if (p.mk) g = 0.15 + 0.15 * tlOn + 1.0 * on(t, mkAt[bi] - 0.1, 0.2) + 1.0 * pump(t, mkAt[bi], 0.08, 1.0) + 0.6 * pump(t, A("s5:delapan"), 0.1, 1.0);
        p.m.material.color.copy(p.c).multiplyScalar(g * s8b);
      });
    });
    const uBr = eout(clamp01((t - A("s5:delapan") + 0.15) / 0.7));
    const xA = bands[0].xm, xB = bands[1].xm, yBar = 8.55;
    brA.position.set(xA, yBar + 0.35 * 0.5, 0.25); brA.scale.y = 0.35 * Math.max(0.001, uBr);
    brB.position.set(xB, yBar - 0.5 * 0.5 * 0 - 0.25, 0.25); brB.scale.y = 0.5 * Math.max(0.001, uBr);
    brA.position.y = yBar + 0.35 / 2 * uBr; brB.position.y = yBar - 0.5 / 2 * uBr;
    brBar.scale.x = Math.max(0.001, (xA - xB) * uBr); brBar.position.set(xB + (xA - xB) * uBr / 2, yBar, 0.25);
    brBar.visible = brA.visible = brB.visible = uBr > 0.002;
    eight.position.set((xA + xB) / 2, 9.0, 0.3); eight.material.opacity = on(t, A("s5:delapan") + 0.2, 0.3); eight.visible = eight.material.opacity > 0.01;
    eight.material.color.setScalar(1.1 + 0.6 * pump(t, A("s5:delapan") + 0.3, 0.1, 1.0));
    tlPool.m.material.color.copy(tlPool.c).multiplyScalar(tlPool.op * (0.3 + 0.7 * tlOn));
    tlShafts.forEach((s) => s.m.material.color.copy(s.c).multiplyScalar(0.05 * (0.3 + 0.7 * tlOn)));
    stLights.TL.intensity = 4.5 * (0.3 + 0.7 * tlOn);
    // ---- OF ----
    const ofOn = on(t, K.s6 - 0.6, 0.8);
    const t0a = A("s6:Januari"), t0b = A("s6:September") + 0.1, t1a = A("s6:Setelah"), t1b = A("s6:September#2") + 0.2;
    ofPanes.forEach((p) => {
      const ta = p.grp === 0 ? t0a + p.seq * (t0b - t0a) / 8 : t1a + (p.seq - 9) * (t1b - t1a) / 3;
      const g = 0.12 + 0.12 * ofOn + 0.9 * on(t, ta, 0.18) + 0.6 * pump(t, ta, 0.05, 0.5) + (p.grp === 0 ? 0.35 * pump(t, A("s6:delapan"), 0.1, 1.0) : 0.5 * pump(t, A("s6:tujuh"), 0.1, 1.2));
      p.m.material.color.setScalar(g * s8b);
    });
    const u8 = on(t, A("s6:delapan") - 0.15, 0.25), u7 = on(t, A("s6:tujuh") - 0.15, 0.3);
    d8.material.color.setScalar((0.2 + 0.2 * ofOn + 0.9 * u8 + 0.8 * pump(t, A("s6:delapan"), 0.08, 0.9)) * s8b);
    d7.material.opacity = u7; d7.visible = u7 > 0.01; d7.material.color.setScalar((1.0 + 0.9 * pump(t, A("s6:tujuh"), 0.08, 1.0)) * s8b);
    d7.scale.setScalar(1 + 0.08 * pump(t, A("s6:tujuh"), 0.08, 0.6));
    ofPool.m.material.color.copy(ofPool.c).multiplyScalar(ofPool.op * (0.3 + 0.7 * ofOn) * (1 - 0.6 * u7));
    ofPool2.m.material.color.copy(ofPool2.c).multiplyScalar(0.3 * u7);
    stLights.OF.intensity = 4.5 * (0.3 + 0.7 * ofOn);
    // ---- ML ----
    const mlOn = on(t, K.s7 - 0.6, 0.8), t07 = A("s7:2007"), t00 = A("s7:2000");
    const colPulse = [A("s7:hijau"), A("s7:kuning"), A("s7:merah")];
    roseSegs.forEach((s) => {
      const ta = t07 + 0.05 + s.ring * 0.18 + s.k * 0.012;
      const g = 0.15 + 0.3 * mlOn + 0.6 * on(t, ta, 0.2) + 0.6 * pump(t, ta, 0.05, 0.7) + 0.6 * pump(t, colPulse[s.ring], 0.08, 0.7);
      s.m.material.color.copy(s.c).multiplyScalar(g * s8b);
    });
    const u00 = on(t, t00 - 0.2, 0.25), u07 = on(t, t07 - 0.12, 0.2);
    y2000.material.color.setScalar((0.25 + 0.75 * u00) * (1 - 0.6 * u07)); y2000.visible = u07 < 0.99;
    y2007.material.opacity = u07; y2007.visible = u07 > 0.01; y2007.material.color.setScalar(1.15 + 0.8 * pump(t, t07, 0.08, 1.0));
    const uS = eout(clamp01((t - A("s7:tapi") + 0.1) / 0.3));
    strike.scale.x = Math.max(0.001, uS); strike.visible = uS > 0.002 && u07 < 0.98; strike.position.z = 0.02;
    mlPool.m.material.color.copy(mlPool.c).multiplyScalar(mlPool.op * (0.3 + 0.7 * mlOn) * (1 + 0.6 * u07));
    mlShaft.m.material.color.copy(mlShaft.c).multiplyScalar(0.055 * (0.3 + 0.7 * mlOn));
    stLights.ML.intensity = 5 * (0.3 + 0.7 * mlOn) * (1 + 0.4 * u07);
    const tBd = A("s7:bendera");
    strings.forEach((s) => {
      const u = back(clamp01((t - tBd + 0.35 - s.si * 0.16) / 0.7), 1.3);
      s.grp.position.y = 9 * (1 - u); s.grp.visible = u > 0.001;
      s.P.forEach((p) => {
        p.m.rotation.x = 0.25 * Math.sin(t * 2.1 + p.k * 0.7 + s.si) * (0.4 + 0.6 * u) + 0.12;
        p.m.rotation.y = 0.15 * Math.sin(t * 1.3 + p.k * 0.5);
        p.m.material.emissiveIntensity = 0.28 + 0.6 * pump(t, colPulse[p.col], 0.08, 0.8);
      });
    });

    // ---- dust ----
    const d = dust.pos;
    for (let i = 0; i < 260; i++) { const q = dSeed[i]; d[i * 3] = tgt.x + q[0] * 9 + Math.sin(t * q[4] + q[3]) * 0.4; d[i * 3 + 1] = 0.3 + ((q[1] * 14 + t * q[4] * 0.25) % 14); d[i * 3 + 2] = 0.6 + q[2] * 9 + Math.cos(t * q[4] + q[3]) * 0.4; }
    dust.commit();
    comp.render();
  };
}
