// EP44 TACTICBOARD: the Football War (El Salvador vs Honduras, 1969) on a 3D football tactics board.
// The board is a 106 x 68 pitch (1 unit = 1 m) that, by a ripple spreading out from the ball, becomes a map of Central
// America at 1 unit = 10 km (equirectangular around 87.5 W / 15.2 N, Natural Earth 50m). The grass becomes the land:
// El Salvador and Honduras rise as bevelled grass tiles (teal edge = El Salvador, amber edge = Honduras; no flags).
//   s1 hook: ball on the centre spot between two puck lines; at "berperang" a gold ripple turns the pitch into a war map
//      with run arrows and fighter silhouettes; at "korek" a match leans on the ball and lights.
//   s2 full reveal, El Salvador small and packed with pawns, five El Salvador outlines stamped into Honduras,
//      pawns cross the border to farm plots (300.000+)
//   s3 land reform: plots flip to amber, pawns pushed back across the border, the border pulses red
//   s4 two stadium tokens (Tegucigalpa, San Salvador); LED scoreboard 0-1 then 3-0; riot rings
//   s5 a third stadium in the Mexico corner; 3-2 after extra time; the diplomatic link between capitals snaps
//   s6 propeller fighters strike the Honduran airport; troop arrows; the last propeller dogfight, close
//   s7 LED counter to 100 JAM, ceasefire line (OAS), pawns forced home, El Salvador pulses: civil war a decade later
//   s8 peace 1980; the ball returns with its match; three fuel cans rise: TANAH, KEMISKINAN, MIGRASI
// LED text is a 5x7 bitmap drawn in code. Everything is a pure function of t.

const FONTS = ['400 80px "Anton"', '700 80px "Barlow Condensed"', '600 80px "Barlow Condensed"', '700 80px "JetBrains Mono"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "HONDURAS 1969 AUDIRA"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* system fallback */ }
}

import * as THREE from "./three.module.js";
import { mulberry, eout, clamp01, smooth, back, canvasTex, stage, pts } from "./lib3d.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { GEO } from "./geo.js";

const HEAD = '"Barlow Condensed", "Arial Narrow", sans-serif', DISP = '"Anton", Impact, sans-serif', MONO = '"JetBrains Mono", Consolas, monospace';
const TEAL = "#2FD6C3", AMBER = "#FFB23E", YEL = "#FFE27A", GOLD = "#FFC94A", CORAL = "#FF6B4A", CHALK = "#F4F7F2", NAVY = "#1B3C8C";

// ---------- projection ----------
const LON0 = -87.5, LAT0 = 15.2;
const proj = (lon, lat) => [(lon - LON0) * 10.742, -(lat - LAT0) * 11.06];
const X0 = -53, X1 = 53, Z0 = -34, Z1 = 34, BW = X1 - X0, BH = Z1 - Z0;

function clipRect(ring, x0, z0, x1, z1) {
  let out = ring;
  const edges = [[(p) => p[0] >= x0, (a, b) => [x0, a[1] + (b[1] - a[1]) * (x0 - a[0]) / (b[0] - a[0])]],
    [(p) => p[0] <= x1, (a, b) => [x1, a[1] + (b[1] - a[1]) * (x1 - a[0]) / (b[0] - a[0])]],
    [(p) => p[1] >= z0, (a, b) => [a[0] + (b[0] - a[0]) * (z0 - a[1]) / (b[1] - a[1]), z0]],
    [(p) => p[1] <= z1, (a, b) => [a[0] + (b[0] - a[0]) * (z1 - a[1]) / (b[1] - a[1]), z1]]];
  for (const [inside, cut] of edges) {
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const a = inp[(i + inp.length - 1) % inp.length], b = inp[i];
      if (inside(b)) { if (!inside(a)) out.push(cut(a, b)); out.push(b); } else if (inside(a)) out.push(cut(a, b));
    }
    if (!out.length) break;
  }
  return out;
}
const area = (P) => { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
const LAND = {};
for (const c of GEO) {
  const rings = c.rings.map((r) => clipRect(r.map(([lo, la]) => proj(lo, la)), X0 + 0.3, Z0 + 0.3, X1 - 0.3, Z1 - 0.3)).filter((P) => P.length > 2 && Math.abs(area(P)) > 0.15);
  rings.sort((a, b) => Math.abs(area(b)) - Math.abs(area(a)));
  if (rings.length) LAND[c.name] = rings;
}
function inPoly(P, x, z) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > z) !== (b[1] > z) && x < ((b[0] - a[0]) * (z - a[1])) / (b[1] - a[1]) + a[0]) c = !c; }
  return c;
}
const ES = LAND["El Salvador"][0], HN = LAND["Honduras"][0];

// monotone Hermite through time keys [t, ...values], never overshoots
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

// ---------- 5x7 LED bitmap font ----------
const G5 = {
  A: "01110100011000111111100011000110001", B: "11110100011000111110100011000111110", C: "01110100011000010000100001000101110",
  D: "11110100011000110001100011000111110", E: "11111100001000011110100001000011111", F: "11111100001000011110100001000010000",
  G: "01110100011000010111100011000101111", H: "10001100011000111111100011000110001", I: "01110001000010000100001000010001110",
  J: "00111000100001000010000101001001100", K: "10001100101010011000101001001010001", L: "10000100001000010000100001000011111",
  M: "10001110111010110101100011000110001", N: "10001100011100110101100111000110001", O: "01110100011000110001100011000101110",
  P: "11110100011000111110100001000010000", Q: "01110100011000110001101011001001101", R: "11110100011000111110101001001010001",
  S: "01111100001000001110000010000111110", T: "11111001000010000100001000010000100", U: "10001100011000110001100011000101110",
  V: "10001100011000110001100010101000100", W: "10001100011000110101101011010101010", X: "10001100010101000100010101000110001",
  Y: "10001100010101000100001000010000100", Z: "11111000010001000100010001000011111",
  0: "01110100011001110101110011000101110", 1: "00100011000010000100001000010001110", 2: "01110100010000100010001000100011111",
  3: "11111000100010000010000011000101110", 4: "00010001100101010010111110001000010", 5: "11111100001111000001000011000101110",
  6: "00110010001000011110100011000101110", 7: "11111000010001000100010000100001000", 8: "01110100011000101110100011000101110",
  9: "01110100011000101111000010001001100", "-": "00000000000000011111000000000000000", "·": "00000000000000000100000000000000000",
  ".": "00000000000000000000000000110001100", ":": "00000011000110000000011000110000000", "!": "00100001000010000100001000000000100",
  " ": "00000000000000000000000000000000000",
};

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x070b14, exp: 1.0, bloom: [0.08, 0.3, 0.93], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  cam.near = 0.5; cam.far = 2400; cam.updateProjectionMatrix();
  scene.background = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#02050B"); gr.addColorStop(0.5, "#0B1730"); gr.addColorStop(1, "#16274A"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });

  // ---------- lights: stadium key (floodlight white), cool fill, rim ----------
  scene.add(new THREE.HemisphereLight(0xe6efff, 0x1a2418, 0.7));
  const key = new THREE.DirectionalLight(0xfff6ea, 2.4);
  key.position.set(-60, 140, 90); key.target.position.set(0, 0, 4);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -75, right: 75, top: 60, bottom: -60, near: 20, far: 400 });
  key.shadow.bias = -0.0003; key.shadow.normalBias = 0.03; key.shadow.radius = 4;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xa8c8ff, 0.9); rim.position.set(80, 50, -120); scene.add(rim);

  const std = (c, ro = 0.6, me = 0, ex = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: ro, metalness: me, ...ex });
  const add = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const basic = (o = {}) => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, ...o });
  const txt = (s, font, color, align = "center", stroke) => (g, w, h) => {
    g.clearRect(0, 0, w, h); g.font = font(h); g.textAlign = align; g.textBaseline = "middle";
    const x = align === "center" ? w / 2 : align === "left" ? 8 : w - 8;
    if (stroke) { g.lineJoin = "round"; g.strokeStyle = stroke; g.lineWidth = h * 0.18; g.strokeText(s, x, h * 0.56); }
    g.fillStyle = color; g.fillText(s, x, h * 0.56);
  };
  function plate(w, h, paint, x, y, z, flat = true, p = scene, cw = 1024) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic({ map: canvasTex(cw, Math.round((cw * h) / w), paint) }));
    if (flat) m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z); m.renderOrder = 7; p.add(m); return m;
  }
  // standing tag: dark chip with a coloured left bar, faces the camera every frame
  const fit = (g, str, wgt, px, fam, maxW) => { g.font = `${wgt} ${px}px ${fam}`; const m = g.measureText(str).width; if (m > maxW) g.font = `${wgt} ${px * maxW / m}px ${fam}`; };
  const tag = (s, sub, col, w = 14, h = 3.2) => plate(w, h, (g, W, H) => {
    g.clearRect(0, 0, W, H); g.fillStyle = "rgba(8,14,26,.9)"; const rr = H * 0.12;
    g.beginPath(); g.roundRect(4, 4, W - 8, H - 8, rr); g.fill();
    g.fillStyle = col; g.fillRect(4, 4, H * 0.14, H - 8);
    g.textAlign = "left"; g.textBaseline = "middle"; g.fillStyle = "#fff"; const mw = W - H * 0.45;
    if (sub) { fit(g, s, 700, H * 0.44, HEAD, mw); g.fillText(s, H * 0.3, H * 0.38); fit(g, sub, 700, H * 0.22, MONO, mw); g.fillStyle = col; g.fillText(sub, H * 0.3, H * 0.76); }
    else { fit(g, s, 700, H * 0.62, HEAD, mw); g.fillText(s, H * 0.3, H * 0.56); }
  }, 0, 0, 0, false, scene, 1024);
  const tagOnTop = (m) => { m.material.depthTest = false; m.renderOrder = 20; return m; };
  const noiseTex = (seed, base, amp, n, rep) => canvasTex(512, 512, (g, w) => { g.fillStyle = base; g.fillRect(0, 0, w, w); const q = mulberry(seed); for (let i = 0; i < n; i++) { const v = q() < 0.5 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${amp * (0.4 + q() * 0.6)})`; g.fillRect(q() * w, q() * w, 1 + q() * 2.5, 1 + q() * 1.5); } }, rep);

  // ---------- stadium room: dark floor, bokeh bowl, floodlight towers ----------
  add(new THREE.PlaneGeometry(1600, 1600), std(0x0a0f18, 0.92, 0, { map: noiseTex(3, "#1a2130", 0.08, 30000, [40, 40]) }), 0, -4.2, 0).rotation.x = -Math.PI / 2;
  const NB = 300, bok = pts(scene, NB, { size: 8, add: true, opacity: 0.85 });
  bok.m.fog = false;
  const bq = mulberry(1969), bokB = [];
  for (let i = 0; i < NB; i++) {
    const a = bq() * Math.PI * 2, rr = 240 + bq() * 220;
    bokB.push([Math.cos(a) * rr, 8 + bq() ** 1.5 * 150, Math.sin(a) * rr * 0.8 - 50, bq() * 6.3, 0.4 + bq() * 1.2, bq() < 0.3 ? [1, 0.75, 0.45] : bq() < 0.55 ? [0.5, 0.95, 0.9] : [0.92, 0.95, 1]]);
  }
  const towerM = std(0x2a313c, 0.45, 0.6), lampM = new THREE.MeshBasicMaterial({ color: 0xfff6dc, toneMapped: false });
  for (const [x, z] of [[-150, -170], [150, -170], [-210, -40], [210, -40]]) {
    add(new THREE.CylinderGeometry(1.4, 2.4, 110, 10), towerM, x, 50, z);
    const head = new THREE.Group(); head.position.set(x, 108, z); head.lookAt(0, 0, 0); scene.add(head);
    add(new THREE.BoxGeometry(22, 12, 1.5), towerM, 0, 0, -0.9, head);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) add(new THREE.CircleGeometry(2.0, 20), lampM, -7.5 + i * 5, -2.8 + j * 5.6, 0.1, head).castShadow = false;
  }

  // ---------- textures: pitch and map ----------
  const CW = 2048, CH = Math.round((CW * BH) / BW);
  const P2 = (x, z) => [((x - X0) / BW) * CW, ((z - Z0) / BH) * CH];
  const U = CW / BW; // px per unit
  const pitchT = canvasTex(CW, CH, (g, w, h) => {
    for (let i = 0; i < 14; i++) { g.fillStyle = i % 2 ? "#2E9A4E" : "#35A857"; g.fillRect((i / 14) * w, 0, w / 14 + 1, h); }
    const q = mulberry(7);
    for (let i = 0; i < 70000; i++) { const v = q() < 0.5 ? "220,255,220" : "0,30,0"; g.fillStyle = `rgba(${v},${0.03 + q() * 0.05})`; g.fillRect(q() * w, q() * h, 1 + q() * 2, 1 + q() * 3); }
    g.strokeStyle = "rgba(246,250,244,.92)"; g.lineWidth = 0.14 * U; g.lineJoin = "round";
    const m = 2.5, L = (x0, z0, x1, z1) => { const [a, b] = P2(x0, z0), [c, d] = P2(x1, z1); g.strokeRect(a, b, c - a, d - b); };
    L(X0 + m, Z0 + m, X1 - m, Z1 - m);
    g.beginPath(); g.moveTo(...P2(0, Z0 + m)); g.lineTo(...P2(0, Z1 - m)); g.stroke();
    g.beginPath(); g.arc(...P2(0, 0), 9.15 * U, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "rgba(246,250,244,.95)";
    for (const sx of [-1, 1]) {
      const gx = sx > 0 ? X1 - m : X0 + m;
      L(Math.min(gx, gx - sx * 16.5), -20.15, Math.max(gx, gx - sx * 16.5), 20.15);
      L(Math.min(gx, gx - sx * 5.5), -9.16, Math.max(gx, gx - sx * 5.5), 9.16);
      g.beginPath(); g.arc(...P2(gx - sx * 11, 0), 0.25 * U, 0, Math.PI * 2); g.fill();
      g.beginPath(); const a0 = sx > 0 ? Math.PI - 0.93 : -0.93; g.arc(...P2(gx - sx * 11, 0), 9.15 * U, a0, a0 + 1.86); g.stroke();
    }
    g.beginPath(); g.arc(...P2(0, 0), 0.3 * U, 0, Math.PI * 2); g.fill();
  });
  pitchT.anisotropy = 16;

  const ringPath = (g, P) => { g.beginPath(); P.forEach(([x, z], i) => { const [px, py] = P2(x, z); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); };
  const mapT = canvasTex(CW, CH, (g, w, h) => {
    const gr = g.createRadialGradient(...P2(0, 6), 60, ...P2(0, 6), w * 0.7);
    gr.addColorStop(0, "#1B3E66"); gr.addColorStop(0.6, "#122C4C"); gr.addColorStop(1, "#0A1B33");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const q = mulberry(11);
    for (let i = 0; i < 70000; i++) { const v = q() < 0.5 ? "190,220,255" : "0,8,20"; g.fillStyle = `rgba(${v},${0.02 + q() * 0.035})`; g.fillRect(q() * w, q() * h, 1 + q() * 2, 1); }
    // graticule (1 degree)
    g.strokeStyle = "rgba(160,200,240,.16)"; g.lineWidth = 2;
    for (let la = 12; la <= 18; la++) { g.beginPath(); g.moveTo(...P2(X0, proj(0, la)[1])); g.lineTo(...P2(X1, proj(0, la)[1])); g.stroke(); }
    for (let lo = -92; lo <= -83; lo++) { g.beginPath(); g.moveTo(...P2(proj(lo, 0)[0], Z0)); g.lineTo(...P2(proj(lo, 0)[0], Z1)); g.stroke(); }
    // land: the pitch grass, mowed stripes kept
    for (const [name, rings] of Object.entries(LAND)) {
      const mine = name === "El Salvador" || name === "Honduras";
      for (const P of rings) {
        g.save(); ringPath(g, P); g.clip();
        for (let i = 0; i < 28; i++) { g.fillStyle = mine ? (i % 2 ? "#2E9A4E" : "#35A857") : (i % 2 ? "#4B5751" : "#525E57"); g.fillRect((i / 28) * w, 0, w / 28 + 1, h); }
        for (let i = 0; i < 9000; i++) { const v = q() < 0.5 ? "220,255,220" : "0,30,0"; g.fillStyle = `rgba(${v},${0.04 + q() * 0.05})`; g.fillRect(q() * w, q() * h, 1 + q() * 2, 1 + q() * 3); }
        g.restore();
      }
    }
    // coast halo + chalk borders
    for (const rings of Object.values(LAND)) for (const P of rings) { g.strokeStyle = "rgba(160,205,240,.25)"; g.lineWidth = 9; ringPath(g, P); g.stroke(); }
    for (const rings of Object.values(LAND)) for (const P of rings) { g.strokeStyle = "rgba(244,248,240,.85)"; g.lineWidth = 3.2; ringPath(g, P); g.stroke(); }
    g.textAlign = "center"; g.textBaseline = "middle";
    const lab = (s, x, z, px, col = "rgba(236,244,236,.78)", font = HEAD, wgt = 700) => { g.font = `${wgt} ${px}px ${font}`; g.fillStyle = col; g.fillText(s, ...P2(x, z)); };
    lab("GUATEMALA", -36, -9, 58); lab("BELIZE", -27, -27, 44); lab("NIKARAGUA", 22, 25, 58); lab("MEKSIKO", -45, -29, 46);
    lab("LAUT KARIBIA", 24, -22, 62, "rgba(170,205,235,.5)", HEAD, 600); lab("SAMUDRA PASIFIK", -30, 28, 62, "rgba(170,205,235,.5)", HEAD, 600);
    // edge ruler
    g.font = `700 26px ${MONO}`; g.fillStyle = "rgba(200,225,250,.4)";
    "ABCDEFGHJKLM".split("").forEach((c, i) => { const px = ((i + 0.5) / 12) * w; g.fillText(c, px, 22); g.fillText(c, px, h - 22); });
    for (let i = 0; i < 8; i++) { const py = ((i + 0.5) / 8) * h; g.fillText(String(i + 1), 22, py); g.fillText(String(i + 1), w - 22, py); }
    // scale bar 100 km
    const [sx, sy] = P2(-50, 31), L = 10 * U;
    g.fillStyle = "rgba(230,240,250,.75)"; g.fillRect(sx, sy, L / 2, 8); g.strokeStyle = "rgba(230,240,250,.75)"; g.lineWidth = 2; g.strokeRect(sx, sy, L, 8);
    g.font = `500 24px ${MONO}`; g.textAlign = "left"; g.fillText("0", sx - 4, sy - 16); g.fillText("100 KM", sx + L - 30, sy - 16);
  });
  mapT.anisotropy = 16;
  const roughT = noiseTex(5, "#d0d0d0", 0.35, 60000, [6, 4]);

  // ---------- reveal shader shared by the board and the land tiles ----------
  const RV = { uMapT: { value: mapT }, uR: { value: 0 }, uRing: { value: 0 }, uC: { value: new THREE.Vector2(0, 0) } };
  const head = `varying vec3 vWP;\nuniform sampler2D uMapT; uniform float uR, uRing; uniform vec2 uC;\n`;
  const vtx = (sh) => { Object.assign(sh.uniforms, RV); sh.vertexShader = "varying vec3 vWP;\n" + sh.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;"); };
  const boardM = std(0xffffff, 0.84, 0, { map: pitchT, roughnessMap: roughT });
  boardM.onBeforeCompile = (sh) => {
    vtx(sh);
    sh.fragmentShader = head + sh.fragmentShader
      .replace("#include <map_fragment>", `#include <map_fragment>
vec2 buv = vec2((vWP.x - (${X0.toFixed(1)})) / ${BW.toFixed(1)}, 1.0 - (vWP.z - (${Z0.toFixed(1)})) / ${BH.toFixed(1)});
vec3 mc = texture2D(uMapT, buv).rgb;
float dd = length(vWP.xz - uC);
float rk = 1.0 - smoothstep(uR - 1.4, uR, dd);
diffuseColor.rgb = mix(diffuseColor.rgb, mc, rk);
float rgw = exp(-abs(dd - uR) / 0.55) * uRing;`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
totalEmissiveRadiance += vec3(1.0, 0.78, 0.3) * rgw * 1.6;`);
  };
  const board = add(new THREE.PlaneGeometry(BW, BH), boardM, 0, 0, 0);
  board.rotation.x = -Math.PI / 2; board.castShadow = false;

  // bevelled frame + base
  {
    const M = 4, rr = 2.5;
    const s = new THREE.Shape(), a0 = X0 - M, a1 = X1 + M, b0 = -(Z1 + M), b1 = -(Z0 - M);
    s.moveTo(a0 + rr, b0); s.lineTo(a1 - rr, b0); s.quadraticCurveTo(a1, b0, a1, b0 + rr); s.lineTo(a1, b1 - rr); s.quadraticCurveTo(a1, b1, a1 - rr, b1);
    s.lineTo(a0 + rr, b1); s.quadraticCurveTo(a0, b1, a0, b1 - rr); s.lineTo(a0, b0 + rr); s.quadraticCurveTo(a0, b0, a0 + rr, b0);
    const hole = new THREE.Path(); hole.moveTo(X0 + 0.3, -(Z1 - 0.3)); hole.lineTo(X0 + 0.3, -(Z0 + 0.3)); hole.lineTo(X1 - 0.3, -(Z0 + 0.3)); hole.lineTo(X1 - 0.3, -(Z1 - 0.3)); hole.closePath();
    s.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 1.0, bevelEnabled: true, bevelThickness: 0.6, bevelSize: 0.7, bevelSegments: 5, curveSegments: 10 });
    geo.rotateX(-Math.PI / 2);
    add(geo, std(0x343c48, 0.42, 0.25, { map: noiseTex(8, "#a0a5ad", 0.16, 40000, [0.03, 0.03]) }), 0, -0.6, 0);
    add(new THREE.BoxGeometry(BW + 2 * M + 1.6, 3.2, BH + 2 * M + 1.6), std(0x141922, 0.7), 0, -2.4, 0);
  }
  const RIMY = 1.1;

  // goals at both ends (pitch phase only)
  const goalM = std(0xf2f4f6, 0.3, 0.2);
  const netT = canvasTex(256, 256, (g, w) => { g.clearRect(0, 0, w, w); g.strokeStyle = "rgba(240,244,248,.9)"; g.lineWidth = 3; for (let i = 0; i <= w; i += 21) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, w); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } });
  netT.wrapS = netT.wrapT = THREE.RepeatWrapping; netT.repeat.set(4, 2);
  const goals = [-1, 1].map((sx) => {
    const G = new THREE.Group(); G.position.set(sx * (X1 - 2.5), 0, 0); scene.add(G);
    for (const z of [-3.66, 3.66]) add(new THREE.CylinderGeometry(0.12, 0.12, 2.44, 10), goalM, 0, 1.22, z, G);
    add(new THREE.CylinderGeometry(0.12, 0.12, 7.56, 10), goalM, 0, 2.44, 0, G).rotation.x = Math.PI / 2;
    const n = add(new THREE.PlaneGeometry(7.32, 2.44), new THREE.MeshStandardMaterial({ map: netT, alphaMap: netT, transparent: true, side: THREE.DoubleSide, roughness: 0.8, depthWrite: false }), sx * 1.6, 1.22, 0, G);
    n.rotation.y = Math.PI / 2; n.castShadow = false;
    return G;
  });

  // ---------- land tiles (El Salvador teal edge, Honduras amber edge) ----------
  function extrudeRing(P, depth, bev) {
    const s = new THREE.Shape(P.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 4 });
    g.rotateX(-Math.PI / 2); g.translate(0, bev, 0); return g;
  }
  const TU = { uTint: { value: 0 } };
  function tileTop(tint) {
    const m = std(0xffffff, 0.8, 0, { roughnessMap: roughT });
    const u = { uHot: { value: 0 }, uHotC: { value: new THREE.Color(0xff4a3a) }, uTintC: { value: new THREE.Color(tint) } };
    m.onBeforeCompile = (sh) => {
      vtx(sh); Object.assign(sh.uniforms, u);
      sh.fragmentShader = head + "uniform float uHot; uniform vec3 uHotC, uTintC;\n" + sh.fragmentShader
        .replace("void main() {", "void main() {\n if (length(vWP.xz - uC) > uR) discard;")
        .replace("#include <map_fragment>", `#include <map_fragment>
vec2 buv = vec2((vWP.x - (${X0.toFixed(1)})) / ${BW.toFixed(1)}, 1.0 - (vWP.z - (${Z0.toFixed(1)})) / ${BH.toFixed(1)});
diffuseColor.rgb = mix(texture2D(uMapT, buv).rgb, uTintC * (0.6 + 0.5 * texture2D(uMapT, buv).g), 0.32);
diffuseColor.rgb = mix(diffuseColor.rgb, uHotC, uHot * 0.35);`)
        .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uHotC * uHot * 0.25;");
    };
    m.u = u; return m;
  }
  function tileSide(col) {
    const m = new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.2 });
    m.onBeforeCompile = (sh) => { vtx(sh); sh.fragmentShader = head + sh.fragmentShader.replace("void main() {", "void main() {\n if (length(vWP.xz - uC) > uR) discard;"); };
    return m;
  }
  const TH = 0.9;
  const esTop = tileTop(0x2fd6c3), hnTop = tileTop(0xe0b04a);
  const esTile = new THREE.Group(), hnTile = new THREE.Group(); scene.add(esTile, hnTile);
  for (const P of LAND["El Salvador"]) add(extrudeRing(P, TH, 0.18), [esTop, tileSide(TEAL)], 0, 0, 0, esTile);
  for (const P of LAND["Honduras"]) add(extrudeRing(P, TH, 0.18), [hnTop, tileSide(AMBER)], 0, 0, 0, hnTile);
  const TOPY = TH + 0.36;

  // outlines as flat ribbons (used for the 5x stamp, border tension, civil-war pulse)
  function ribbon(pts3, w, mat, dash = 0, y = 0.07) {
    const pos = [], idx = []; let v = 0;
    for (let i = 0; i < pts3.length - 1; i++) {
      if (dash && Math.floor(i / dash) % 2 === 1) { idx.push(v, v, v, v, v, v); continue; }
      const a = new THREE.Vector3(pts3[i][0], y, pts3[i][1]), b = new THREE.Vector3(pts3[i + 1][0], y, pts3[i + 1][1]);
      const d = b.clone().sub(a).normalize(), s = new THREE.Vector3(-d.z, 0, d.x).multiplyScalar(w / 2);
      pos.push(a.x - s.x, y, a.z - s.z, a.x + s.x, y, a.z + s.z, b.x - s.x, y, b.z - s.z, b.x + s.x, y, b.z + s.z);
      idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2); v += 4;
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx);
    const m = new THREE.Mesh(geo, mat); m.renderOrder = 4; m.frustumCulled = false; scene.add(m);
    m.n = pts3.length - 1; m.draw = (u) => { u = clamp01(u); m.visible = u > 0.001; geo.setDrawRange(0, Math.ceil(u * m.n) * 6); };
    m.draw(0); return m;
  }
  const dens = (P, step = 0.5) => { const o = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); for (let k = 0; k < n; k++) o.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); } o.push(o[0]); return o; };
  const esC = (() => { let x = 0, z = 0; for (const p of ES) { x += p[0]; z += p[1]; } return [x / ES.length, z / ES.length]; })();
  const esLineM = basic({ color: 0xff5a48, opacity: 0 });
  const esLine = ribbon(dens(ES), 0.5, esLineM, 0, TOPY + 0.04);
  const hnLineM = basic({ color: 0xff5a48, opacity: 0 });
  const hnLine = ribbon(dens(HN), 0.5, hnLineM, 0, TOPY + 0.04);
  // five El Salvador outlines stamped into Honduras
  const stampSpots = [[-2, 7.5], [22, 6], [33, -2.5], [8, -3.5], [-12, 1.5]];
  const stamps = stampSpots.map(([x, z]) => { const P = dens(ES.map(([a, b]) => [a - esC[0] + x, b - esC[1] + z])); const m = basic({ color: 0xbff7ef, opacity: 0.95 }); const rb = ribbon(P, 0.42, m, 4, TOPY + 0.05); const f = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(P.map(([a, b]) => new THREE.Vector2(a, -b)))), basic({ color: 0x2fd6c3, opacity: 0 })); f.rotation.x = -Math.PI / 2; f.position.y = TOPY + 0.03; f.renderOrder = 3; scene.add(f); return { rb, m, f }; });
  const stampN = stampSpots.map((p, i) => plate(4, 4, txt(String(i + 1), (h) => `400 ${h * 0.8}px ${DISP}`, "#08201E", "center"), p[0], TOPY + 0.07, p[1], true, scene, 256));
  const stampBadge = plate(12, 3.4, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "rgba(8,14,26,.92)"; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, h * 0.18); g.fill(); g.fillStyle = AMBER; g.font = `400 ${h * 0.62}px ${DISP}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("5× LEBIH LUAS", w / 2, h * 0.54); }, 18, 6, -6, false, scene, 1024);

  // country tags (standing)
  const esTag = tag("EL SALVADOR", "KECIL & PADAT", TEAL, 11, 2.6);
  const hnTag = tag("HONDURAS", "5× LEBIH LUAS", AMBER, 11, 2.6);

  // ---------- city pins ----------
  const SS = proj(-89.19, 13.69), TG = proj(-87.21, 14.08), MX = [-44, -24];
  function pin(p, col) {
    const G = new THREE.Group(); G.position.set(p[0], TOPY, p[1]); scene.add(G);
    add(new THREE.CylinderGeometry(0.55, 0.55, 0.3, 24), std(0xffffff, 0.3), 0, 0.15, 0, G);
    add(new THREE.CylinderGeometry(0.3, 0.3, 0.36, 20), std(col, 0.3), 0, 0.2, 0, G);
    return G;
  }
  const ssPin = pin(SS, TEAL), tgPin = pin(TG, AMBER);
  const ssLab = plate(9.5, 1.7, txt("SAN SALVADOR", (h) => `700 ${h * 0.8}px ${HEAD}`, "#0B2420", "center", "rgba(255,255,255,.75)"), SS[0] + 0.2, TOPY + 0.06, SS[1] + 1.6, true, scene, 800);
  const tgLab = plate(9.5, 1.7, txt("TEGUCIGALPA", (h) => `700 ${h * 0.8}px ${HEAD}`, "#2A1A04", "center", "rgba(255,255,255,.75)"), TG[0] + 0.4, TOPY + 0.06, TG[1] + 1.6, true, scene, 800);

  // ---------- AUDIRA brass plaque (south rim) ----------
  const brassT = canvasTex(2048, 200, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#E9C877"); gr.addColorStop(0.5, "#C99A45"); gr.addColorStop(1, "#A97C33"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const q = mulberry(4); for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "255,240,200" : "60,40,10"},${0.05 + q() * 0.06})`; g.fillRect(q() * w, q() * h, 2 + q() * 30, 1); }
    g.strokeStyle = "rgba(70,45,10,.75)"; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28);
    g.font = `700 100px ${HEAD}`; g.textAlign = "center"; g.textBaseline = "middle";
    const s = "AUDIRA  ·  PAPAN TAKTIK AMERIKA TENGAH  ·  1969";
    g.fillStyle = "rgba(255,240,205,.55)"; g.fillText(s, w / 2 + 2, h * 0.55 + 3); g.fillStyle = "#3B2709"; g.fillText(s, w / 2, h * 0.55);
  });
  add(new THREE.BoxGeometry(46, 0.5, 3.2), [std(0xc99a45, 0.35, 0.9), std(0xc99a45, 0.35, 0.9), std(0xffffff, 0.34, 0.85, { map: brassT }), std(0xc99a45, 0.35, 0.9), std(0xc99a45, 0.35, 0.9), std(0xc99a45, 0.35, 0.9)], 0, RIMY + 0.1, Z1 + 2.0);

  // ---------- LED scoreboard (north rim), 5x7 bitmap ----------
  const SB = { x: 0, y: 1.2, z: -17, w: 28 };
  const sbG = new THREE.Group(); sbG.position.set(SB.x, 0, SB.z); scene.add(sbG);
  const sbH = (SB.w * 520) / 1600;
  for (const sx of [-0.38, 0.38]) add(new THREE.CylinderGeometry(0.8, 1.0, SB.y + 1, 18), std(0x2a313b, 0.4, 0.6), sx * SB.w, (SB.y + 1) / 2 - 1, -0.6, sbG);
  add(new THREE.BoxGeometry(SB.w + 2.2, sbH + 2.2, 2.4), std(0x1b2029, 0.42, 0.55), 0, SB.y + sbH / 2, -0.9, sbG);
  const sbCan = document.createElement("canvas"); sbCan.width = 1600; sbCan.height = 520;
  const sbTex = new THREE.CanvasTexture(sbCan); sbTex.colorSpace = THREE.SRGBColorSpace; sbTex.anisotropy = 8;
  function ledText(g, parts, x0, y0, p0, center, wmax) {
    const n = parts.reduce((s, [str]) => s + [...str].length, 0), cols = n * 6 - 1;
    const p = wmax ? Math.min(p0, wmax / cols) : p0; y0 += ((p0 - p) * 7) / 2;
    let x = center ? x0 + (wmax - cols * p) / 2 : x0;
    for (const [str, col] of parts) for (const ch of str) {
      const gl = G5[ch] || G5[" "];
      for (let ry = 0; ry < 7; ry++) for (let cx = 0; cx < 5; cx++) if (gl[ry * 5 + cx] === "1") {
        const px = x + cx * p + p / 2, py = y0 + ry * p + p / 2;
        g.fillStyle = col; g.globalAlpha = 0.28; g.beginPath(); g.arc(px, py, p * 0.62, 0, 6.283); g.fill();
        g.globalAlpha = 1; g.beginPath(); g.arc(px, py, p * 0.4, 0, 6.283); g.fill();
      }
      x += 6 * p;
    }
  }
  function dotField(g, x0, y0, w, h, p) { g.fillStyle = "rgba(90,110,140,.16)"; for (let y = y0 + p / 2; y < y0 + h; y += p) for (let x = x0 + p / 2; x < x0 + w; x += p) { g.beginPath(); g.arc(x, y, p * 0.3, 0, 6.283); g.fill(); } }
  function paintSB(row1, row2, flash) {
    const g = sbCan.getContext("2d"), w = sbCan.width, h = sbCan.height;
    g.fillStyle = "#05080E"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#0B1220"; g.fillRect(0, 0, w, 92);
    ledText(g, [["AUDIRA", GOLD]], 36, 18, 8, false);
    ledText(g, [["PAPAN SKOR", "#9FB6CC"]], w - 36 - 59 * 8, 18, 8, false);
    dotField(g, 40, 120, w - 80, 26 * 7, 26);
    if (flash) { g.fillStyle = "rgba(255,226,122,.12)"; g.fillRect(40, 116, w - 80, 26 * 7 + 8); }
    ledText(g, row1, 40, 120, 26, true, w - 80);
    dotField(g, 40, 360, w - 80, 13 * 7, 13);
    ledText(g, row2, 40, 360, 13, true, w - 80);
    sbTex.needsUpdate = true;
  }
  const sbFace = add(new THREE.PlaneGeometry(SB.w, sbH), new THREE.MeshBasicMaterial({ map: sbTex, toneMapped: false }), 0, SB.y + sbH / 2, 0.32, sbG);
  sbFace.castShadow = false;

  // ---------- pieces ----------
  function lathe(rad, h, rc, seg = 48) {
    const p = [new THREE.Vector2(0, 0)];
    for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2); p.push(new THREE.Vector2(rad - rc + Math.cos(a) * rc, rc + Math.sin(a) * rc)); }
    for (let i = 0; i <= 6; i++) { const a = (i / 6) * (Math.PI / 2); p.push(new THREE.Vector2(rad - rc + Math.cos(a) * rc, h - rc + Math.sin(a) * rc)); }
    p.push(new THREE.Vector2(0, h));
    return new THREE.LatheGeometry(p, seg);
  }
  const topTex = (lab, col) => canvasTex(256, 256, (g, w) => {
    g.fillStyle = NAVY; g.beginPath(); g.arc(w / 2, w / 2, w / 2, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#fff"; g.lineWidth = w * 0.05; g.beginPath(); g.arc(w / 2, w / 2, w * 0.4, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#fff"; g.font = `400 ${w * 0.38}px ${DISP}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(lab, w / 2, w * 0.53);
    g.fillStyle = col; g.fillRect(w * 0.34, w * 0.75, w * 0.32, w * 0.05);
  });
  const blobT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(0,0,0,.6)"); gr.addColorStop(0.55, "rgba(0,0,0,.26)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const blob = (p, sx, sz) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), basic({ map: blobT })); m.rotation.x = -Math.PI / 2; m.scale.set(sx, sz, 1); m.position.y = 0.03; m.renderOrder = 2; p.add(m); return m; };
  const PM = {
    body: new THREE.MeshPhysicalMaterial({ color: NAVY, roughness: 0.24, clearcoat: 0.8, clearcoatRoughness: 0.12 }),
    base: std(0xeef1f4, 0.38),
    es: new THREE.MeshPhysicalMaterial({ color: TEAL, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
    hn: new THREE.MeshPhysicalMaterial({ color: AMBER, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
    esTop: new THREE.MeshStandardMaterial({ map: topTex("ES", TEAL), roughness: 0.25 }),
    hnTop: new THREE.MeshStandardMaterial({ map: topTex("HN", AMBER), roughness: 0.25 }),
  };
  const geoPB = lathe(1.72, 0.26, 0.1), geoP = lathe(1.5, 0.95, 0.2), geoBand = new THREE.CylinderGeometry(1.515, 1.515, 0.24, 48, 1, true), geoTop = new THREE.CircleGeometry(1.32, 48);
  function puck(side, sc = 1) {
    const G = new THREE.Group(); scene.add(G);
    add(geoPB, PM.base, 0, 0, 0, G); add(geoP, PM.body, 0, 0.22, 0, G); add(geoBand, side === "es" ? PM.es : PM.hn, 0, 0.62, 0, G);
    const top = add(geoTop, side === "es" ? PM.esTop : PM.hnTop, 0, 1.175, 0, G); top.rotation.x = -Math.PI / 2;
    blob(G, 5, 5); G.scale.setScalar(sc); G.visible = false;
    return { G, sc };
  }
  function drive(o, t, keys, t0, t1, fi = 0.35, fo = 0.35, y = 0) {
    const k = Math.min(back(clamp01((t - t0) / fi), 1.6), 1 - smooth(clamp01((t - t1) / fo)));
    o.G.visible = k > 0.002;
    if (!o.G.visible) return null;
    o.trk = o.trk || track(keys);
    const [x, z, yaw] = o.trk(t);
    o.G.position.set(x, y, z); o.G.rotation.y = yaw || 0; o.G.scale.setScalar(o.sc * Math.max(0.001, k));
    return [x, z, yaw];
  }
  const yawTo = (dx, dz) => Math.atan2(-dx, -dz);

  // football: truncated-icosahedron look from a painted texture on a sphere
  const ballT = canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = "#F6F7F8"; g.fillRect(0, 0, w, h);
    const q = mulberry(5);
    g.fillStyle = "#15181D";
    const pent = (cx, cy, rr, rot) => { g.beginPath(); for (let i = 0; i < 5; i++) { const a = rot + (i / 5) * Math.PI * 2; g.lineTo(cx + Math.cos(a) * rr * 1.6, cy + Math.sin(a) * rr); } g.closePath(); g.fill(); };
    for (const [u, v] of [[0.1, 0.5], [0.3, 0.2], [0.3, 0.8], [0.5, 0.5], [0.7, 0.2], [0.7, 0.8], [0.9, 0.5], [0.2, 0.05], [0.6, 0.05], [0.4, 0.95], [0.8, 0.95]]) pent(u * w, v * h, 34, q() * 6);
    g.strokeStyle = "rgba(40,44,52,.35)"; g.lineWidth = 3;
    for (let i = 0; i < 60; i++) { g.beginPath(); g.moveTo(q() * w, q() * h); g.lineTo(q() * w, q() * h); g.stroke(); }
  });
  const ballM = new THREE.MeshPhysicalMaterial({ map: ballT, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const ball = new THREE.Group(); scene.add(ball);
  const ballMesh = add(new THREE.SphereGeometry(1.1, 48, 32), ballM, 0, 1.1, 0, ball);
  blob(ball, 3.4, 3.4);
  // matchstick + flame
  const match = new THREE.Group(); ball.add(match);
  add(new THREE.BoxGeometry(0.22, 4.2, 0.22), std(0xd9b27a, 0.75), 0, 2.1, 0, match);
  add(new THREE.SphereGeometry(0.26, 16, 12), std(0x9b1d14, 0.55), 0, 4.3, 0, match).scale.set(1, 1.35, 1);
  match.position.set(1.15, 0, 0.55); match.rotation.z = -0.5;
  const flameT = canvasTex(128, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h * 0.68, 2, w / 2, h * 0.6, h * 0.48); gr.addColorStop(0, "rgba(255,255,230,1)"); gr.addColorStop(0.25, "rgba(255,210,90,.95)"); gr.addColorStop(0.6, "rgba(255,110,30,.55)"); gr.addColorStop(1, "rgba(255,60,0,0)"); g.fillStyle = gr; g.beginPath(); g.ellipse(w / 2, h * 0.6, w * 0.42, h * 0.42, 0, 0, Math.PI * 2); g.fill(); });
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameT, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
  flame.scale.set(1.1, 2.2, 1); flame.position.set(0, 4.95, 0); match.add(flame);
  const flameL = new THREE.PointLight(0xffa040, 0, 18, 1.6); flameL.position.set(0, 4.8, 0.3); match.add(flameL);
  const pemicuTag = tag("PEMICU", "BUKAN BENSIN", YEL, 7.5, 2.2);

  // ---------- s1 hook: two puck lines ----------
  const H1 = { es: [puck("es", 1.15), puck("es", 1.15), puck("es", 1.15)], hn: [puck("hn", 1.15), puck("hn", 1.15), puck("hn", 1.15)] };
  const H1E = [[-4.6, -5], [-5.4, -0.5], [-3.8, 3.5]], H1H = [[4.6, -5.5], [5.4, -1], [3.8, 3.2]];

  // arrows
  const curve = (a, b, bend = 0.2, n = 60) => { const dx = b[0] - a[0], dz = b[1] - a[1]; const cx = (a[0] + b[0]) / 2 - dz * bend, cz = (a[1] + b[1]) / 2 + dx * bend; return Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * cx + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * cz + u * u * b[1]]; }); };
  function arrow(a, b, col, w, bend = 0.15, dash = 0, hd = 2.2, y = TOPY + 0.08) {
    const P = curve(a, b, bend);
    const mat = basic({ color: col, opacity: 0.95 });
    const rb = ribbon(P.slice(0, -2), w, mat, dash, y);
    const e = P[P.length - 1], p = P[P.length - 4], dx = e[0] - p[0], dz = e[1] - p[1], l = Math.hypot(dx, dz);
    const sh = new THREE.Shape(); sh.moveTo(0, hd); sh.lineTo(hd * 0.62, -hd * 0.2); sh.lineTo(-hd * 0.62, -hd * 0.2); sh.closePath();
    const h = new THREE.Mesh(new THREE.ShapeGeometry(sh), mat);
    h.position.set(e[0] - (dx / l) * hd * 0.6, y + 0.005, e[1] - (dz / l) * hd * 0.6); h.renderOrder = 4; scene.add(h);
    h.rotation.set(-Math.PI / 2, 0, 0); h.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.atan2(-dx, -dz));
    return { rb, h, mat, set(u, o = 1) { rb.draw(u); h.visible = u > 0.97 && o > 0.01; mat.opacity = 0.95 * o; } };
  }
  const hookArr = [arrow([-14, 15], [1, 11], CORAL, 0.7, 0.18, 3, 2.4), arrow([-16, 12], [-6, 3], CORAL, 0.7, -0.15, 3, 2.4), arrow([-11, 17], [6, 16], CORAL, 0.6, -0.1, 3, 2.2)];

  // ---------- planes: propeller fighter silhouettes ----------
  const planeShape = (() => {
    const s = new THREE.Shape();
    // nose at -z (shape y = +), half-outline mirrored
    const R = [[0, 2.2], [0.32, 2.0], [0.4, 1.2], [0.42, 0.5], [2.6, 0.25], [2.7, -0.15], [0.4, -0.35], [0.26, -1.6], [1.0, -1.9], [1.05, -2.15], [0.12, -2.2]];
    const L = R.slice().reverse().map(([x, y]) => [-x, y]);
    [...R, ...L].forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    s.closePath(); return s;
  })();
  const planeGeo = new THREE.ExtrudeGeometry(planeShape, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 2 });
  planeGeo.rotateX(-Math.PI / 2); // shape y -> -z
  const propT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 4, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(230,235,240,.7)"); gr.addColorStop(0.8, "rgba(230,235,240,.25)"); gr.addColorStop(1, "rgba(230,235,240,0)"); g.fillStyle = gr; g.beginPath(); g.arc(w / 2, w / 2, w / 2, 0, 6.3); g.fill(); });
  function plane(side, sc = 1) {
    const G = new THREE.Group(); scene.add(G);
    const B = new THREE.Group(); G.add(B);
    add(planeGeo, std(0x9aa3ad, 0.38, 0.55), 0, 0, 0, B);
    add(new THREE.SphereGeometry(0.3, 14, 10), new THREE.MeshPhysicalMaterial({ color: 0x9fd4ff, roughness: 0.05, transmission: 0.3, clearcoat: 1 }), 0, 0.32, -0.6, B).scale.set(1, 0.8, 1.8);
    for (const sx of [-1, 1]) add(new THREE.BoxGeometry(0.9, 0.06, 0.42), side === "es" ? PM.es : PM.hn, sx * 1.95, 0.31, 0.05, B);
    add(new THREE.BoxGeometry(0.5, 0.08, 0.3), side === "es" ? PM.es : PM.hn, 0, 0.32, 1.3, B);
    const pr = new THREE.Mesh(new THREE.CircleGeometry(0.85, 24), basic({ map: propT, side: THREE.DoubleSide })); pr.position.set(0, 0.15, -2.35); B.add(pr);
    const sh = blob(G, 4.4, 3.6); sh.material.opacity = 0.7;
    G.scale.setScalar(sc); G.visible = false;
    return { G, B, sh, sc };
  }
  function fly(o, t, path, t0, t1, alt, bank = 0) {
    const k = Math.min(clamp01((t - t0) / 0.3), 1 - clamp01((t - t1) / 0.3));
    o.G.visible = k > 0.002; if (!o.G.visible) return;
    const u = clamp01((t - t0) / (t1 - t0));
    const p = path(u), p2 = path(Math.min(1, u + 0.01)), p0 = path(Math.max(0, u - 0.01));
    o.G.position.set(p[0], 0, p[1]); o.G.rotation.y = yawTo(p2[0] - p0[0], p2[1] - p0[1]);
    o.B.position.y = alt; o.B.rotation.z = bank;
    o.G.scale.setScalar(o.sc * Math.max(0.001, k));
    o.sh.position.y = TOPY + 0.05; o.sh.material.opacity = 0.5 * k;
  }
  const raid = [plane("es", 1.25), plane("es", 1.25), plane("es", 1.25)];
  const hookPl = [plane("es", 1.0), plane("hn", 1.0)];
  const dogA = plane("es", 1.05), dogB = plane("hn", 1.05);
  const dogC = [TG[0] + 6, TG[1] - 6];
  const dogTag = tagOnTop(tag("PERTEMPURAN UDARA TERAKHIR", "PESAWAT TEMPUR BALING-BALING", YEL, 14, 2.8));
  const bandaraTag = tag("BANDARA HONDURAS", "", AMBER, 9, 2);

  // ---------- migrants: pawns (instanced), farm plots ----------
  const pawnGeo = (() => { const pr = [[0, 0], [0.46, 0], [0.46, 0.1], [0.34, 0.2], [0.22, 0.5], [0.3, 0.6], [0.17, 0.68], [0.26, 0.82], [0.27, 0.95], [0.19, 1.08], [0, 1.13]].map(([x, y]) => new THREE.Vector2(x, y)); return new THREE.LatheGeometry(pr, 20); })();
  const NP = 64;
  const pawnI = new THREE.InstancedMesh(pawnGeo, new THREE.MeshPhysicalMaterial({ color: 0xdfe3e8, roughness: 0.42, clearcoat: 0.4 }), NP);
  const pawnB = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 20), PM.es, NP);
  pawnI.castShadow = true; pawnI.frustumCulled = pawnB.frustumCulled = false; scene.add(pawnI, pawnB);
  const pq = mulberry(300), PW = [];
  const sample = (P, x0, x1, z0, z1, avoid) => { for (let k = 0; k < 4000; k++) { const x = x0 + pq() * (x1 - x0), z = z0 + pq() * (z1 - z0); if (inPoly(P, x, z) && (!avoid || avoid.every((p) => Math.hypot(p[0] - x, p[1] - z) > 1.5))) return [x, z]; } return [(x0 + x1) / 2, (z0 + z1) / 2]; };
  const homes = [], farms = [];
  for (let i = 0; i < NP; i++) { homes.push(sample(ES, -28, -5, 11, 21, homes.length < 60 ? homes : null)); }
  for (let i = 0; i < NP; i++) {
    // farm spots on a grid in western/central Honduras, north of Tegucigalpa
    const gx = i % 10, gz = Math.floor(i / 10);
    let p = [-14 + gx * 2.7 + (gz % 2) * 1.2, -1 + gz * 2.2];
    if (!inPoly(HN, p[0], p[1])) p = sample(HN, -12, 14, -2, 10, farms);
    farms.push(p);
  }
  for (let i = 0; i < NP; i++) PW.push({ h: homes[i], f: farms[i], d: pq(), back1: i % 8 < 3 }); // 3 of 8 pushed back in s3, the rest in s7
  const plotT = canvasTex(256, 192, (g, w, h) => { g.fillStyle = "#e6d2b0"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(90,60,30,.55)"; g.lineWidth = 6; for (let x = 10; x < w; x += 22) { g.beginPath(); g.moveTo(x, 6); g.lineTo(x, h - 6); g.stroke(); } g.strokeStyle = "rgba(255,255,255,.7)"; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); });
  const plotI = new THREE.InstancedMesh(new THREE.BoxGeometry(2.3, 0.14, 1.8), new THREE.MeshStandardMaterial({ map: plotT, roughness: 0.85 }), NP);
  plotI.frustumCulled = false; plotI.receiveShadow = true; scene.add(plotI);
  const cBrown = new THREE.Color(0x8a5a32), cAmber = new THREE.Color(AMBER);
  const dummy = new THREE.Object3D(), tmpC = new THREE.Color();
  const pushArr = [arrow([-2, 4], [-16, 14], CORAL, 0.7, 0.12, 3, 2.4), arrow([8, 3], [-10, 16], CORAL, 0.7, -0.1, 3, 2.4)];
  const homeArr = [arrow([4, 2], [-14, 15], GOLD, 0.6, 0.15, 3, 2.2), arrow([-6, -1], [-20, 13], GOLD, 0.6, -0.12, 3, 2.2), arrow([12, 4], [-8, 17], GOLD, 0.6, 0.1, 3, 2.2)];

  // ---------- stadium tokens ----------
  function stadium(p) {
    const G = new THREE.Group(); G.position.set(p[0], TOPY, p[1]); scene.add(G);
    const bowl = add(new THREE.TorusGeometry(2.0, 0.55, 14, 48), std(0xe9edf2, 0.35, 0.1), 0, 0.4, 0, G); bowl.rotation.x = Math.PI / 2; bowl.scale.set(1.25, 1, 1.0);
    const f = add(new THREE.CircleGeometry(1.75, 40), std(0x2e9a4e, 0.8), 0, 0.12, 0, G); f.rotation.x = -Math.PI / 2; f.scale.set(1.25, 1, 1);
    for (const [x, z] of [[-2.6, -1.9], [2.6, -1.9], [-2.6, 1.9], [2.6, 1.9]]) { add(new THREE.CylinderGeometry(0.07, 0.09, 2.6, 8), std(0x5a6270, 0.4, 0.6), x, 1.3, z, G); add(new THREE.BoxGeometry(0.6, 0.35, 0.12), lampM, x, 2.65, z, G).castShadow = false; }
    G.visible = false; return G;
  }
  const stTG = stadium([TG[0] + 2.5, TG[1] - 4]), stSS = stadium([SS[0] - 1, SS[1] - 4.2]), stMX = stadium(MX);
  const mxTag = tag("MEKSIKO", "LAGA PENENTU · KE MEXICO CITY", GOLD, 11, 2.6);
  const mxArr = [arrow([SS[0], SS[1] - 2], [MX[0] + 3, MX[1] + 2.5], GOLD, 0.55, -0.12, 3, 2), arrow([TG[0], TG[1] - 2], [MX[0] + 3.5, MX[1] + 1.5], GOLD, 0.55, 0.1, 3, 2)];
  const mxEdge = arrow([MX[0] - 1, MX[1] - 2], [X0 + 1.5, Z0 + 1.5], GOLD, 0.5, 0, 2, 1.6, 0.12);
  const riotTag = tag("KERUSUHAN", "STADION & JALANAN", "#FF5A48", 9, 2.4);

  // ---------- diplomatic link ----------
  const linkC = new THREE.QuadraticBezierCurve3(new THREE.Vector3(SS[0], TOPY + 0.6, SS[1]), new THREE.Vector3((SS[0] + TG[0]) / 2, 9, (SS[1] + TG[1]) / 2), new THREE.Vector3(TG[0], TOPY + 0.6, TG[1]));
  const LP = linkC.getPoints(80);
  const linkM = basic({ color: 0xffe9b0, opacity: 0.95 });
  const linkGeoA = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(LP.slice(0, 41)), 50, 0.22, 8), linkGeoB = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(LP.slice(40)), 50, 0.22, 8);
  const linkA = new THREE.Mesh(linkGeoA, linkM), linkB = new THREE.Mesh(linkGeoB, linkM); scene.add(linkA, linkB);
  const putus = plate(9, 2.2, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "rgba(200,30,40,.94)"; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 18); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 8; g.beginPath(); g.roundRect(20, 20, w - 40, h - 40, 12); g.stroke(); g.fillStyle = "#fff"; fit(g, "HUBUNGAN DIPLOMATIK PUTUS", 700, h * 0.46, HEAD, w - 70); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("HUBUNGAN DIPLOMATIK PUTUS", w / 2, h * 0.55); }, LP[40].x, LP[40].y, LP[40].z, false, scene, 1100);

  // ---------- war: troop arrows, strike rings ----------
  const troopArr = [arrow([-12, 15.5], [-2, 13.5], CORAL, 0.9, 0.1, 0, 2.8), arrow([-13, 11], [-5, 4], CORAL, 0.9, -0.12, 0, 2.8), arrow([-20, 11.5], [-17, 4], CORAL, 0.8, 0.15, 0, 2.6)];
  const SPK = pts(scene, 260, { color: 0xffd27a, size: 0.5, add: true });
  const ringGeo = new THREE.RingGeometry(0.86, 1, 64);
  const ringM = (c) => basic({ color: c, opacity: 0, side: THREE.DoubleSide });
  const bursts = [];
  function burst(tt, x, z, n, col = 0xfff0c0, y = 1.4) { const R = new THREE.Mesh(ringGeo, ringM(col)); R.rotation.x = -Math.PI / 2; R.position.set(x, TOPY + 0.1, z); R.renderOrder = 6; scene.add(R); const q = mulberry(Math.round(x * 100 + z * 7 + tt * 13)); const P = Array.from({ length: n }, () => [q() * 6.28, 2 + q() * 6, 2 + q() * 5, q() * 0.25]); bursts.push({ tt, x, z, y, R, P }); }
  burst(A("s4:Kerusuhan"), stTG.position.x, stTG.position.z, 50, 0xff7a5a);
  burst(A("s4:Kerusuhan") + 0.15, stSS.position.x, stSS.position.z, 50, 0xff7a5a);
  burst(A("s6:bandara") + 0.1, TG[0], TG[1], 70, 0xfff0c0);
  burst(A("s6:bandara") + 0.35, TG[0] + 1.6, TG[1] - 1.2, 50, 0xffd08a);
  // pulses from the ball (ripple device in 3D)
  const pulses = [0, 1, 2].map(() => { const R = new THREE.Mesh(ringGeo, ringM(0xffc94a)); R.rotation.x = -Math.PI / 2; R.renderOrder = 6; scene.add(R); return R; });

  // ---------- ceasefire, civil war, peace, fuel cans ----------
  const ceaseM = basic({ color: 0xffffff, opacity: 0.95 });
  const ceaseLine = ribbon(dens([[-11.5, 15.2], [-9.5, 11], [-11.5, 6.5], [-14.5, 4.5]], 0.4).slice(0, -1), 0.45, ceaseM, 3, TOPY + 0.1);
  const ceaseTag = tag("GENCATAN SENJATA", "ORGANISASI NEGARA-NEGARA AMERIKA (OAS)", CHALK, 14, 3);
  const civTag = tag("PERANG SAUDARA", "SATU DEKADE KEMUDIAN", "#FF5A48", 10, 2.6);
  const docT = canvasTex(512, 680, (g, w, h) => {
    g.fillStyle = "#F4EEDF"; g.fillRect(0, 0, w, h);
    const q = mulberry(80); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(120,100,60,${q() * 0.06})`; g.fillRect(q() * w, q() * h, 2, 2); }
    g.fillStyle = "#2A2418"; g.textAlign = "center"; g.font = `700 54px ${HEAD}`; g.fillText("PERJANJIAN DAMAI", w / 2, 90);
    g.font = `700 92px ${DISP}`; g.fillText("1980", w / 2, 200);
    g.fillStyle = "rgba(60,50,30,.35)"; for (let y = 260; y < 540; y += 30) g.fillRect(60, y, w - 120 - ((y * 7) % 90), 8);
    g.strokeStyle = "#1E3A7A"; g.lineWidth = 5; g.beginPath(); g.moveTo(70, 610); g.bezierCurveTo(110, 560, 150, 640, 200, 600); g.stroke();
    g.strokeStyle = "#7A2A1E"; g.beginPath(); g.moveTo(310, 612); g.bezierCurveTo(350, 570, 390, 640, 440, 596); g.stroke();
    g.fillStyle = "#2A2418"; g.font = `600 22px ${MONO}`; g.fillText("EL SALVADOR", 140, 650); g.fillText("HONDURAS", 375, 650);
  });
  const doc = add(new THREE.BoxGeometry(7.5, 0.08, 10), [std(0xf4eedf, 0.9), std(0xf4eedf, 0.9), std(0xffffff, 0.85, 0, { map: docT }), std(0xf4eedf, 0.9), std(0xf4eedf, 0.9), std(0xf4eedf, 0.9)], 0, 0, 0);
  const canGeo = (() => { const s = new THREE.Shape(); const w = 1.5, h = 2.1, rr = 0.3; s.moveTo(-w + rr, -h); s.lineTo(w - rr, -h); s.quadraticCurveTo(w, -h, w, -h + rr); s.lineTo(w, h - rr); s.quadraticCurveTo(w, h, w - rr, h); s.lineTo(-w + rr, h); s.quadraticCurveTo(-w, h, -w, h - rr); s.lineTo(-w, -h + rr); s.quadraticCurveTo(-w, -h, -w + rr, -h); const g = new THREE.ExtrudeGeometry(s, { depth: 1.6, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 4 }); g.translate(0, h + 0.2, -0.8); return g; })();
  const cans = ["TANAH", "KEMISKINAN", "MIGRASI"].map((s, i) => {
    const G = new THREE.Group(); scene.add(G);
    add(canGeo, new THREE.MeshPhysicalMaterial({ color: 0xc8341f, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.2 }), 0, 0, 0, G);
    add(new THREE.CylinderGeometry(0.32, 0.32, 0.5, 16), std(0x2b2b2b, 0.4, 0.6), 0.9, 4.75, 0, G);
    const hb = add(new THREE.TorusGeometry(0.55, 0.13, 8, 20, Math.PI), std(0xa52a17, 0.4), -0.5, 4.5, 0, G);
    const lb = plate(3.2, 1.1, txt(s, (h) => `700 ${h * 0.72}px ${HEAD}`, "#fff", "center"), 0, 2.4, 1.02, false, G, 512);
    blob(G, 5, 3.4); G.visible = false;
    return G;
  });

  // =================== camera ===================
  const CAM = track([
    [0, 2, 12, 27, 0, 2.2, -4],
    [A("s1:dua") - 0.2, 1.5, 13, 28, 0, 2.0, -4],
    [A("s1:berperang") + 0.6, -4, 34, 44, -4, 0, 0],
    [A("s1:korek") - 0.4, 1.5, 10, 20, 0.5, 2.6, -5],
    [K.s2 - 0.1, 1.5, 10.5, 21, 0.5, 2.6, -5],
    [A("s2:Amerika") + 0.4, 8, 110, 118, 8, 0, 0],
    [A("s2:kecil") + 0.2, -15, 34, 50, -15, 0, 12],
    [A("s2:lima") - 0.1, 10, 105, 120, 10, 0, 2],
    [A("s2:tiga") - 0.2, -4, 60, 70, -4, 0, 6],
    [K.s3 + 0.4, -2, 48, 56, -1, 0, 4],
    [A("s3:diambil") + 0.2, -1, 32, 40, -1, 0, 3],
    [A("s3:terusir") + 0.2, -9, 38, 50, -9, 0, 9],
    [K.s4 + 0.4, -4, 40, 50, -6, 3, 2],
    [A("s4:Honduras") - 0.3, 5, 22, 37, 2, 3, 3],
    [A("s4:membalas") - 0.2, -12, 24, 40, -10, 3, 3],
    [A("s4:Kerusuhan") + 0.3, -7, 44, 64, -7, 3, 5],
    [K.s5 + 0.3, -40, 30, 8, -42, 3, -22],
    [A("s5:dua") + 0.3, -39, 29, 9, -41, 3, -22],
    [A("s5:memutus") - 0.3, -7, 24, 40, -7, 2, 10],
    [K.s6 + 0.3, -8, 34, 48, -6, 0, 8],
    [A("s6:bandara") + 0.3, 0, 28, 40, 2, 0, 8],
    [A("s6:pasukan") + 0.3, -8, 34, 46, -7, 0, 8],
    [A("s6:terakhir") - 0.3, dogC[0] + 1, 14, dogC[1] + 20, dogC[0], 3.5, dogC[1] - 1],
    [K.s6e + 0.2, dogC[0] + 3, 14, dogC[1] + 19, dogC[0] + 1, 3.5, dogC[1] - 1],
    [K.s7 + 0.6, -5, 20, 38, -6, 4, 2],
    [A("s7:gencatan") + 0.3, -10, 32, 42, -10, 0, 8],
    [A("s7:Puluhan") - 0.2, -8, 40, 52, -8, 0, 8],
    [A("s7:saudara"), -15, 28, 42, -15, 0, 13],
    [K.s8 + 0.4, 0, 28, 38, 0, 1, 2],
    [A("s8:Bolanya") - 0.2, 1, 12, 22, 0, 3, -3],
    [A("s8:Bensinnya") + 0.4, 1, 20, 36, 0, 2, -3],
    [K.end + 0.5, 2, 25, 44, 0, 2, -3],
  ]);
  const look = new THREE.Vector3();

  // =================== draw ===================
  let lastSB = "";
  return function draw(t) {
    for (let i = 0; i < NB; i++) { const b = bokB[i]; bok.pos[i * 3] = b[0]; bok.pos[i * 3 + 1] = b[1]; bok.pos[i * 3 + 2] = b[2]; const k = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * b[4] + b[3])); bok.col[i * 3] = b[5][0] * k; bok.col[i * 3 + 1] = b[5][1] * k; bok.col[i * 3 + 2] = b[5][2] * k; }
    bok.commit();
    const vis = (m, k) => { m.visible = k > 0.002; m.material.opacity = k; };
    const face = (m, k, x, y, z, s = 1) => { vis(m, k); if (m.visible) { m.position.set(x, y, z); m.quaternion.copy(cam.quaternion); const dk = Math.min(2.4, Math.max(0.5, cam.position.distanceTo(m.position) / 60)); m.scale.setScalar(Math.max(0.001, s * dk)); } };

    // ---- reveal radius: pitch -> map ----
    const rv1 = A("s1:berperang") - 0.25, rv2 = A("s2:Amerika") - 0.4;
    const R = 38 * eout((t - rv1) / 1.3) + 62 * eout((t - rv2) / 1.8);
    RV.uR.value = R;
    RV.uRing.value = R > 0.1 && R < 99 ? Math.max(win(t, rv1, rv1 + 1.3, 0.1, 0.5), win(t, rv2, rv2 + 1.8, 0.1, 0.6)) : 0;
    const gk = 1 - smooth(clamp01((t - rv1) / 0.8));
    goals.forEach((G) => { G.visible = gk > 0.01; G.scale.set(1, Math.max(0.001, gk), 1); });
    const rise = smooth(clamp01((t - rv1 - 0.3) / 0.7));
    esTile.scale.y = hnTile.scale.y = Math.max(0.001, rise); esTile.visible = hnTile.visible = rise > 0.002;
    const topY = TOPY * rise;

    // ---- LED scoreboard ----
    let row1 = [["ES", TEAL], [" - ", YEL], ["HN", AMBER]], row2 = [["KUALIFIKASI PIALA DUNIA", "#CFE0F2"]], fl = -9;
    const sc = (a, b) => [["ES ", TEAL], [`${a}-${b}`, YEL], [" HN", AMBER]];
    if (t < K.s2) {
      if (t >= A("s1:bola")) { row1 = sc(3, 2); fl = A("s1:bola"); } else if (t >= A("s1:pertandingan")) { row1 = sc(3, 0); fl = A("s1:pertandingan"); } else if (t >= A("s1:Tiga") + 0.05) { row1 = sc(0, 1); fl = A("s1:Tiga") + 0.05; }
      row2 = t >= A("s1:berperang") ? [["LALU PERANG", "#FF7A68"]] : [["3 PERTANDINGAN", "#CFE0F2"]];
    } else if (t < K.s4) { row1 = [["1969", YEL]]; row2 = [["AMERIKA TENGAH", "#CFE0F2"]]; }
    else if (t < K.s5) {
      if (t >= A("s4:tiga")) { row1 = sc(3, 0); row2 = [["SAN SALVADOR", TEAL]]; fl = A("s4:tiga"); }
      else if (t >= A("s4:satu")) { row1 = sc(0, 1); row2 = [["TEGUCIGALPA", AMBER]]; fl = A("s4:satu"); }
    } else if (t < K.s6) {
      if (t >= A("s5:dua")) { row1 = sc(3, 2); row2 = [["MEKSIKO · PERPANJANGAN WAKTU", GOLD]]; fl = A("s5:dua"); } else { row1 = sc(0, 0); row2 = [["LAGA PENENTU · MEKSIKO", GOLD]]; }
    } else if (t < K.s7) { row1 = [["14 JULI", "#FF7A68"]]; row2 = [["PERANG DIMULAI", "#FF7A68"]]; }
    else if (t < K.s8) { const n = Math.round(100 * eout((t - K.s7) / Math.max(0.5, A("s7:seratus") - K.s7))); row1 = [[`${n} JAM`, YEL]]; row2 = [[t >= A("s7:gencatan") ? "GENCATAN SENJATA · OAS" : "PERANG", t >= A("s7:gencatan") ? CHALK : "#FF7A68"]]; }
    else { row1 = [["1980", YEL]]; row2 = [["PERJANJIAN DAMAI", CHALK]]; }
    const sbK = Math.max(win(t, -1, K.s2 + 0.3, 0.3, 0.5), win(t, K.s4 - 0.2, K.s5 - 0.35, 0.4, 0.3), win(t, K.s5 - 0.05, K.s6 + 0.3, 0.4, 0.5), win(t, K.s7 - 0.2, A("s7:gencatan") + 1.2, 0.4, 0.5), win(t, K.s8 - 0.2, A("s8:Bolanya") - 0.3, 0.4, 0.5));
    const sbP = t < K.s2 + 1 ? [0, -9, 0.45] : t < K.s5 - 0.2 ? [-1, -4, 0.55] : t < K.s6 + 1 ? [-39, -31, 0.5] : t < K.s8 - 0.1 ? [-8, 0, 0.7] : [2, -6, 0.5];
    sbG.position.set(sbP[0], 0, sbP[1]);
    sbG.visible = sbK > 0.002; sbG.scale.set(sbP[2], Math.max(0.001, back(sbK, 1.2)) * sbP[2], sbP[2]);
    const flash = t - fl < 0.5 && t >= fl && Math.floor((t - fl) * 8) % 2 === 0;
    const st = JSON.stringify([row1, row2, flash]);
    if (st !== lastSB) { lastSB = st; paintSB(row1, row2, flash); }

    // ---- ball + match ----
    const bIn = Math.max(win(t, -1, K.s2 + 0.4, 0.3, 0.6), win(t, A("s8:Bolanya") - 0.5, K.dur + 5, 0.4, 0.4));
    ball.visible = bIn > 0.002; ball.scale.setScalar(Math.max(0.001, bIn * (t > K.s8 ? 1.35 : 1)));
    ball.position.set(0, topY, 0);
    ballMesh.rotation.set(0.4, t * 0.25, 0);
    const mk = Math.max(back(clamp01((t - A("s1:korek") + 0.15) / 0.35)) * (t < K.s2 + 0.4 ? 1 : 0), t > K.s8 ? back(clamp01((t - A("s8:pemicu") + 0.1) / 0.35)) : 0);
    match.visible = mk > 0.01; match.scale.setScalar(Math.max(0.001, mk));
    const lit = Math.max(clamp01((t - A("s1:apinya")) / 0.25) * (t < K.s2 + 0.4 ? 1 : 0), t > K.s8 ? clamp01((t - A("s8:pemicu") - 0.2) / 0.25) : 0);
    flame.visible = lit > 0.01; flame.scale.set(1.1 * lit * (1 + 0.08 * Math.sin(t * 31)), 2.2 * lit * (1 + 0.1 * Math.sin(t * 23 + 1)), 1); flameL.intensity = 7 * lit;
    face(pemicuTag, win(t, A("s8:pemicu"), K.dur + 5, 0.3, 0.3), -3.4, topY + 1.0, 2.8);

    // ripple pulses from the ball
    const pulseT = [A("s1:berperang") - 0.25, A("s1:apinya"), A("s8:pemicu")];
    pulses.forEach((Rg, i) => { const dt = t - pulseT[i]; const on = dt > 0 && dt < 1.6; Rg.visible = on; if (on) { Rg.position.set(0, topY + 0.12, 0); Rg.scale.setScalar(1.5 + eout(dt / 1.6) * 22); Rg.material.opacity = (1 - dt / 1.6) * 0.9; } });

    // ---- s1 pucks + hook arrows + planes ----
    const s1e = K.s2 + 0.3;
    H1.es.forEach((o, i) => { const p = H1E[i]; drive(o, t, [[0, p[0] - 2, p[1], 0], [A("s1:berperang"), p[0], p[1], 0], [s1e, p[0] + 0.8, p[1], 0]], -0.3 + i * 0.1, s1e, 0.35, 0.35, topY); });
    H1.hn.forEach((o, i) => { const p = H1H[i]; drive(o, t, [[0, p[0] + 2, p[1], 0], [A("s1:berperang"), p[0], p[1], 0], [s1e, p[0] - 0.8, p[1], 0]], -0.25 + i * 0.1, s1e, 0.35, 0.35, topY); });
    hookArr.forEach((a, i) => a.set((t - A("s1:berperang") - 0.3 - i * 0.12) / 0.6, 1 - clamp01((t - K.s2 + 0.2) / 0.4)));
    fly(hookPl[0], t, (u) => [-24 + u * 30, -6 - u * 4], A("s1:berperang") - 0.1, K.s2 + 0.2, 4);
    fly(hookPl[1], t, (u) => [22 - u * 28, -12 + u * 2], A("s1:berperang") + 0.1, K.s2 + 0.2, 5);

    // ---- s2 tags, stamps ----
    const tagA = rise * win(t, A("s2:El") - 0.2, K.s3, 0.3, 0.4);
    face(esTag, tagA, esC[0] + 4, 5.6, esC[1] - 1.4, t < A("s2:lima") ? 1 : 0.85);
    face(hnTag, rise * win(t, A("s2:Honduras") - 0.1, K.s3, 0.3, 0.4), 18, 5.4, 2);
    stamps.forEach((s, i) => { const t0 = A("s2:lima") - 0.2 + i * 0.22, k = win(t, t0, A("s2:Lebih") + 0.3, 0.25, 0.5); s.rb.draw(k > 0 ? 1 : 0); s.m.opacity = 0.95 * k; s.f.material.opacity = 0.22 * k; s.f.visible = k > 0.002; vis(stampN[i], k); stampN[i].position.y = topY + 0.08; });
    face(stampBadge, win(t, A("s2:kali") - 0.1, A("s2:Lebih") + 0.3, 0.25, 0.4), 16, 9, -4, back(clamp01((t - A("s2:kali") + 0.1) / 0.35)));

    // ---- pins + labels ----
    const pinK = rise * win(t, A("s2:El") - 0.2, K.dur + 5, 0.3, 0.3);
    for (const [G, L] of [[ssPin, ssLab], [tgPin, tgLab]]) { G.visible = pinK > 0.01; G.scale.setScalar(Math.max(0.001, pinK)); G.position.y = topY; vis(L, pinK * win(t, K.s4 - 0.4, K.s8 + 0.5, 0.3, 0.4)); L.position.y = topY + 0.06; }

    // ---- pawns + plots ----
    const goT = (p) => A("s2:tiga") - 0.3 + p.d * 2.4, backT = (p) => (p.back1 ? A("s3:terusir") - 0.9 + p.d * 1.0 : A("s7:Puluhan") - 0.2 + p.d * 2.0);
    const pawnK = rise * win(t, A("s2:kecil") - 0.4, K.s8 + 1.2, 0.5, 0.6);
    const flipT = A("s3:diambil") - 0.1;
    for (let i = 0; i < NP; i++) {
      const p = PW[i];
      const u1 = smooth(clamp01((t - goT(p)) / 1.6)), u2 = smooth(clamp01((t - backT(p)) / 1.5));
      const hop = Math.sin(Math.PI * clamp01((t - goT(p)) / 1.6)) * 1.2 + Math.sin(Math.PI * clamp01((t - backT(p)) / 1.5)) * 1.2;
      let x = p.h[0] + (p.f[0] - p.h[0]) * u1, z = p.h[1] + (p.f[1] - p.h[1]) * u1;
      const hh = [p.h[0] + Math.sin(i) * 1.2, p.h[1] + Math.cos(i) * 0.8];
      x += (hh[0] - x) * u2; z += (hh[1] - z) * u2;
      const s = Math.max(0.001, pawnK * 1.0);
      dummy.position.set(x, topY + 0.05 + hop * 0.6, z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(s); dummy.updateMatrix();
      pawnI.setMatrixAt(i, dummy.matrix);
      dummy.position.y = topY + 0.06 + hop * 0.6; dummy.updateMatrix(); pawnB.setMatrixAt(i, dummy.matrix);
      // plot under the farm spot
      const pk = rise * win(t, A("s2:bertani") - 0.6 + p.d * 0.8, A("s4:kualifikasi"), 0.4, 0.6);
      const fl2 = smooth(clamp01((t - flipT - p.d * 0.9) / 0.45));
      dummy.position.set(p.f[0], topY + 0.02 + Math.sin(Math.PI * fl2) * 0.9, p.f[1]); dummy.rotation.set(Math.PI * fl2, 0, 0); dummy.scale.set(Math.max(0.001, pk), Math.max(0.001, pk), Math.max(0.001, pk)); dummy.updateMatrix();
      plotI.setMatrixAt(i, dummy.matrix);
      plotI.setColorAt(i, tmpC.copy(cBrown).lerp(cAmber, fl2 > 0.5 ? 1 : 0));
    }
    pawnI.instanceMatrix.needsUpdate = pawnB.instanceMatrix.needsUpdate = plotI.instanceMatrix.needsUpdate = true; if (plotI.instanceColor) plotI.instanceColor.needsUpdate = true;
    pawnI.visible = pawnB.visible = pawnK > 0.002;
    pushArr.forEach((a, i) => a.set((t - A("s3:terusir") + 0.9 - i * 0.15) / 0.7, win(t, A("s3:terusir") - 0.9, K.s4 - 0.2, 0.1, 0.4)));
    homeArr.forEach((a, i) => a.set((t - A("s7:Puluhan") + 0.2 - i * 0.15) / 0.8, win(t, A("s7:Puluhan") - 0.2, K.s8 - 0.1, 0.1, 0.4)));
    // border tension and civil-war pulse
    const tens = win(t, A("s3:Ketegangan") - 0.2, K.s4 + 0.4, 0.3, 0.5) * (0.6 + 0.4 * Math.sin(t * 9));
    hnLineM.opacity = tens * 0.9; hnLine.draw(tens > 0.01 ? 1 : 0); hnLine.position.y = topY - TOPY;
    const civ = win(t, A("s7:memicu") - 0.2, K.s8 + 0.2, 0.3, 0.5);
    esLineM.opacity = Math.max(tens, civ * (0.6 + 0.4 * Math.sin(t * 8))) * 0.95; esLine.draw(esLineM.opacity > 0.01 ? 1 : 0); esLine.position.y = topY - TOPY;
    esTop.u.uHot.value = civ * (0.6 + 0.4 * Math.sin(t * 8)); hnTop.u.uHot.value = 0;
    face(civTag, civ, esC[0] - 1, 3.6, esC[1] + 1, back(clamp01((t - A("s7:memicu") + 0.2) / 0.35)));

    // ---- s4 stadiums + riot ----
    const stK = (a, b) => win(t, a, b, 0.35, 0.4);
    for (const [G, k] of [[stTG, stK(A("s4:Honduras") - 0.3, K.s6)], [stSS, stK(A("s4:El") - 0.3, K.s6)], [stMX, stK(A("s5:digelar") - 0.4, K.s6)]]) { G.visible = k > 0.002; G.scale.setScalar(Math.max(0.001, back(k))); G.position.y = topY; }
    face(riotTag, win(t, A("s4:Kerusuhan"), K.s5 - 0.1, 0.25, 0.3), (stTG.position.x + stSS.position.x) / 2, 7.5, (stTG.position.z + stSS.position.z) / 2 - 3, back(clamp01((t - A("s4:Kerusuhan")) / 0.3)));
    // s5 Mexico
    mxArr.forEach((a, i) => a.set((t - A("s5:Meksiko") + 0.6 - i * 0.12) / 0.7, win(t, A("s5:Meksiko") - 0.6, A("s5:Di") + 0.2, 0.1, 0.4)));
    mxEdge.set((t - A("s5:Meksiko") + 0.1) / 0.6, win(t, A("s5:Meksiko") - 0.1, A("s5:Di") + 0.2, 0.1, 0.4));
    face(mxTag, win(t, A("s5:Meksiko") - 0.2, A("s5:Di") + 0.2, 0.3, 0.4), MX[0] + 3, 6.5, MX[1] + 2);
    // diplomatic link
    const kL = win(t, A("s5:Di") - 0.2, K.s6 + 0.6, 0.4, 0.4), snapT = A("s5:diplomatik") + 0.1, sd = Math.max(0, t - snapT);
    linkA.visible = linkB.visible = kL > 0.002; linkM.opacity = 0.95 * kL; linkM.color.set(t > snapT ? 0xff8a7a : 0xffe9b0);
    const drawU = clamp01((t - A("s5:Di") + 0.2) / 0.8);
    linkA.geometry.setDrawRange(0, Math.ceil(drawU * linkGeoA.index.count / 3) * 3); linkB.geometry.setDrawRange(0, drawU >= 1 ? Infinity : 0);
    linkA.position.set(-sd * 1.4, -Math.min(4, sd * sd * 5), sd * 0.4); linkB.position.set(sd * 1.4, -Math.min(4, sd * sd * 5), -sd * 0.4);
    face(putus, win(t, snapT, K.s6 + 0.2, 0.15, 0.4), LP[40].x, LP[40].y + 1.2, LP[40].z, 1.3 - 0.3 * clamp01((t - snapT) / 0.2));

    // ---- s6 war ----
    raid.forEach((o, i) => { const a = [SS[0] - 2 + i * 1.2, SS[1] + 1 - i * 2.2], b = [TG[0] + 1 - i * 1.4, TG[1] - 1 + i * 1.6]; fly(o, t, (u) => { const v = eout(u); return [a[0] + (b[0] - a[0]) * v * 1.25, a[1] + (b[1] - a[1]) * v * 1.25 - Math.sin(Math.PI * v) * 3]; }, A("s6:pesawat") - 0.3 + i * 0.15, A("s6:bandara") + 1.3 + i * 0.1, 5.5 + i * 0.6, -0.15); });
    face(bandaraTag, win(t, A("s6:bandara"), A("s6:Ini") + 0.2, 0.2, 0.4), TG[0] - 4, 6.8, TG[1] - 2);
    troopArr.forEach((a, i) => a.set((t - A("s6:pasukan") + 0.1 - i * 0.15) / 0.8, win(t, A("s6:pasukan") - 0.2, A("s7:gencatan"), 0.1, 0.6)));
    const dgT0 = A("s6:Ini") - 0.4, dgT1 = K.s7 + 0.4;
    const dog = (ph, rr, alt) => (u) => { const a = ph + (t - dgT0) * 1.5; return [dogC[0] + Math.cos(a) * rr, dogC[1] + Math.sin(a) * rr * 0.75]; };
    fly(dogA, t, dog(0, 4.2), dgT0, dgT1, 3.4, 0.55); fly(dogB, t, dog(-0.75, 4.2), dgT0, dgT1, 3.9, 0.55);
    face(dogTag, win(t, A("s6:terakhir") - 0.3, K.s7 + 0.2, 0.3, 0.4), dogC[0], 5.2, dogC[1] - 3, back(clamp01((t - A("s6:terakhir") + 0.3) / 0.35)));

    // ---- s7 ceasefire ----
    const kc = win(t, A("s7:gencatan") - 0.2, K.s8 + 0.6, 0.2, 0.5);
    ceaseLine.draw((t - A("s7:gencatan") + 0.2) / 0.9); ceaseM.opacity = 0.95 * kc; ceaseLine.position.y = topY - TOPY;
    face(ceaseTag, 0, -10, 4, 8, back(clamp01((t - A("s7:gencatan")) / 0.35)));

    // ---- s8 peace document + fuel cans ----
    const kd = win(t, A("s8:Perjanjian") - 0.3, A("s8:Bolanya") - 0.4, 0.4, 0.5);
    doc.visible = kd > 0.002; doc.position.set(-1, topY + 0.15 + (1 - kd) * 3, 3); doc.rotation.set(0, 0.15 - (1 - kd) * 0.6, 0); doc.scale.setScalar(Math.max(0.001, kd));
    cans.forEach((G, i) => { const t0 = A(["s8:tanah", "s8:kemiskinan", "s8:migrasi"][i]) - 0.15; const k = back(clamp01((t - t0) / 0.4), 1.4) * (1 - clamp01((t - K.dur - 4) / 0.4)); G.visible = k > 0.002; G.position.set(-5 + i * 5, topY, -5 - (i === 1 ? 1.5 : 0)); G.rotation.y = (i - 1) * -0.3; G.scale.setScalar(Math.max(0.001, k * 0.85)); });

    // ---- sparks and rings ----
    let pi = 0;
    for (const b of bursts) {
      const dt = t - b.tt, on = dt >= 0 && dt < 1.2;
      b.R.visible = on; if (on) { b.R.position.set(b.x, TOPY + 0.12, b.z); b.R.scale.setScalar(0.6 + eout(dt / 0.8) * 5); b.R.material.opacity = (1 - clamp01(dt / 0.8)) * 0.95; }
      for (const p of b.P) {
        if (pi >= 260) break;
        const tt = dt - p[3];
        if (tt > 0 && tt < 0.9 && on) { SPK.pos[pi * 3] = b.x + Math.cos(p[0]) * p[1] * tt; SPK.pos[pi * 3 + 1] = b.y + p[2] * tt - 9 * tt * tt; SPK.pos[pi * 3 + 2] = b.z + Math.sin(p[0]) * p[1] * tt; const k = 1 - tt / 0.9; SPK.col[pi * 3] = k; SPK.col[pi * 3 + 1] = 0.8 * k; SPK.col[pi * 3 + 2] = 0.5 * k; }
        else SPK.pos[pi * 3 + 1] = -50;
        pi++;
      }
    }
    for (; pi < 260; pi++) SPK.pos[pi * 3 + 1] = -50;
    SPK.commit();

    // ---- camera ----
    const c = CAM(t);
    let shx = 0, shy = 0;
    for (const tt of [A("s1:berperang") - 0.2, A("s4:Kerusuhan"), A("s5:diplomatik") + 0.1, A("s6:bandara") + 0.1]) { const d = t - tt; if (d > 0 && d < 0.4) { const a = (1 - d / 0.4) * 0.3; shx += Math.sin(d * 90) * a; shy += Math.cos(d * 77) * a * 0.6; } }
    cam.position.set(c[0] + shx, c[1] + shy, c[2]); look.set(c[3] + shx * 0.5, c[4], c[5]); cam.lookAt(look);
    comp.render();
  };
}
