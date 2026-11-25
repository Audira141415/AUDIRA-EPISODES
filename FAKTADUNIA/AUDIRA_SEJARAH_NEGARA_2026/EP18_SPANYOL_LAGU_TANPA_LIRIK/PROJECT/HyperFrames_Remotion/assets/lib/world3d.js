// EP18 SPANYOL, LAGU TANPA LIRIK: MEMPHISDIORAMA. An 80s Milan tabletop on warm paper: canary, coral, mint and sky
// blocks on terrazzo plinths, hard purple shadows, indigo outlines. Five plinths in a row on one paper table:
// S0 the toy stadium: a staff of chunky notes that plays on the beat over a row of EMPTY speech bubbles,
// S1 three flag blocks (Spain, Bosnia and Herzegovina, Kosovo) each under an empty bubble,
// S2 the archive: the 1761 document, fife and drum, then the 1770 crown and name plaques,
// S3 the lyric sheets (Alfonso XIII era, Franco era) stamped TIDAK RESMI, crossed out, sinking at 1978,
// S4 the 2007 contest: a ballot box that overflows with slips, a winner sheet rises, a desk calendar flips 5 days,
//    the sheet is yanked away and the lid slams shut.
// Stations change under the HTML shape wipe. Everything is a function of t.
import * as THREE from "./three.module.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, ramp, eout, clamp01, canvasTex, stage, back } from "./lib3d.js";

const YEL = "#FFD234", COR = "#FF5A5F", MINT = "#5EDFB0", SKY = "#5CC8FF", PUR = "#705890", IND = "#25214A", PAPER = "#FFFCF6", CRM = "#F4EFE6", LIL = "#B9A6E0";
const V3 = THREE.Vector3;
const ENV = 0.25;
const BEAT = 60 / 112, T0 = 0.05;

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

// Kosovo outline (Natural Earth 50m via _tools/geo.py), lon/lat
const KOS = [[20.346,42.828],[20.468,42.857],[20.486,42.88],[20.457,42.925],[20.475,42.953],[20.623,43.034],[20.648,43.071],[20.659,43.1],[20.637,43.13],[20.608,43.179],[20.623,43.199],[20.702,43.227],[20.763,43.258],[20.799,43.262],[20.824,43.238],[20.846,43.173],[20.889,43.152],[20.968,43.116],[21.058,43.092],[21.127,43.043],[21.224,42.956],[21.238,42.913],[21.325,42.875],[21.404,42.831],[21.39,42.751],[21.663,42.682],[21.724,42.682],[21.753,42.67],[21.732,42.595],[21.62,42.423],[21.609,42.387],[21.53,42.35],[21.519,42.328],[21.541,42.281],[21.562,42.248],[21.39,42.22],[21.332,42.187],[21.296,42.13],[21.285,42.1],[21.256,42.099],[21.206,42.128],[21.141,42.175],[21.058,42.172],[20.778,42.071],[20.749,42.019],[20.745,41.904],[20.724,41.873],[20.695,41.854],[20.58,41.866],[20.583,41.918],[20.576,42.014],[20.522,42.172],[20.486,42.224],[20.407,42.276],[20.349,42.309],[20.241,42.338],[20.187,42.425],[20.104,42.524],[20.065,42.547],[20.09,42.632],[20.065,42.685],[20.029,42.732],[20.054,42.76],[20.13,42.76],[20.191,42.755],[20.216,42.798],[20.346,42.828]];

export function create(canvas, K, AT) {
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xfffcf6, fog: 0.003, exp: 0.82, bloom: [0.04, 0.3, 0.97], fov: 38 });
  bp.threshold = 1.3; bp.strength = 0.03;
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 0.86;
  r.shadowMap.type = THREE.PCFShadowMap;
  { const c = document.createElement("canvas"); c.width = 8; c.height = 512; const g = c.getContext("2d"); const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#C9B6F0"); gr.addColorStop(0.55, "#F2C9DC"); gr.addColorStop(1, "#FFE3B8"); g.fillStyle = gr; g.fillRect(0, 0, 8, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
  scene.fog = null;
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const rnd = mulberry(1761);

  const hemi = new THREE.HemisphereLight(0xfff8f0, 0x7a64b0, 0.6);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff1dc, 2.7);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -42, right: 42, top: 42, bottom: -42, near: 1, far: 260 });
  key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02;
  scene.add(key, key.target);

  // ---------- materials + builders ----------
  const mats = {};
  const mat = (c) => mats[c] || (mats[c] = new THREE.MeshStandardMaterial({ color: c, roughness: 0.62, metalness: 0, envMapIntensity: ENV }));
  const OLM = new THREE.MeshBasicMaterial({ color: IND, side: THREE.BackSide });
  const ol = (m, e = 0.09) => {
    const g = m.geometry; g.computeBoundingBox();
    const s = new V3(), c = new V3(); g.boundingBox.getSize(s); g.boundingBox.getCenter(c);
    const o = new THREE.Mesh(g, OLM);
    o.scale.set((s.x + 2 * e) / Math.max(s.x, 0.02), (s.y + 2 * e) / Math.max(s.y, 0.02), (s.z + 2 * e) / Math.max(s.z, 0.02));
    o.position.set(c.x * (1 - o.scale.x), c.y * (1 - o.scale.y), c.z * (1 - o.scale.z));
    m.add(o); return m;
  };
  const add = (m, p = scene) => { m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  // box with its base at y
  const B = (w, h, d, c, x, y, z, p, e = 0.09) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof c === "string" ? mat(c) : c); m.position.set(x, y + h / 2, z); add(m, p); if (e) ol(m, e); return m; };
  const C = (rt, rb, h, c, x, y, z, p, e = 0.08, seg = 32) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), typeof c === "string" ? mat(c) : c); m.position.set(x, y + h / 2, z); add(m, p); if (e) ol(m, e); return m; };
  const S = (rad, c, x, y, z, p, e = 0.08) => { const m = new THREE.Mesh(new THREE.SphereGeometry(rad, 32, 20), typeof c === "string" ? mat(c) : c); m.position.set(x, y, z); add(m, p); if (e) ol(m, e); return m; };
  const G = (x = 0, y = 0, z = 0, p = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };

  // canvas labels repainted once web fonts are ready
  const labels = [];
  const label = (w, h, paint) => { const tx = canvasTex(w, h, paint); labels.push([tx, paint]); return tx; };
  let fontsOk = false;
  const RF = (px) => `${px}px Righteous, sans-serif`;
  const WF = (wt, px) => `${wt} ${px}px 'Work Sans', sans-serif`;
  const faceMat = (tx) => new THREE.MeshStandardMaterial({ map: tx, roughness: 0.62, envMapIntensity: ENV });
  // box whose +z face carries a texture
  const TB = (w, h, d, tx, side, x, y, z, p, e = 0.09) => { const s = mat(side); const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [s, s, s, s, faceMat(tx), s]); m.position.set(x, y + h / 2, z); add(m, p); if (e) ol(m, e); return m; };

  // ---------- paper table + terrazzo ----------
  const paperT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#FBF4E8"; g.fillRect(0, 0, w, h); const q = mulberry(5); for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(150,120,90,${q() * 0.05})`; g.fillRect(q() * w, q() * h, 1 + q() * 2, 1 + q() * 2); } }, [40, 30]);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(1400, 900), new THREE.MeshStandardMaterial({ map: paperT, roughness: 0.9, envMapIntensity: ENV }));
  table.rotation.x = -Math.PI / 2; table.position.x = 160; table.receiveShadow = true; scene.add(table);
  const shadowTint = (w, d, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.ShadowMaterial({ color: PUR, opacity: 0.55 })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; scene.add(m); return m; };
  shadowTint(1400, 900, 160, 0.02, 0);
  const terrT = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#F2ECE2"; g.fillRect(0, 0, w, h);
    const q = mulberry(81), cols = [COR, YEL, MINT, SKY, PUR, IND, "#E9B9A6", "#9AD7C2"];
    for (let i = 0; i < 900; i++) {
      const x = q() * w, y = q() * h, s = 3 + q() * (q() < 0.12 ? 18 : 8);
      g.fillStyle = cols[Math.floor(q() * cols.length)]; g.globalAlpha = 0.75 + q() * 0.25;
      g.beginPath(); const n = 3 + Math.floor(q() * 4); for (let k = 0; k < n; k++) { const a = (k / n) * 6.283 + q(); g.lineTo(x + Math.cos(a) * s * (0.6 + q() * 0.6), y + Math.sin(a) * s * (0.6 + q() * 0.6)); } g.fill();
    }
    g.globalAlpha = 1;
  }, [3, 2]);
  const terr = new THREE.MeshStandardMaterial({ map: terrT, roughness: 0.5, envMapIntensity: ENV });
  const plinth = (x, w, d) => { B(w, 2, d, terr, x, 0, 0, scene, 0.14); shadowTint(w - 0.05, d - 0.05, x, 2.02, 0); };

  // Memphis confetti: rings, triangles, zigzags, dotted cylinders around a station
  const triG = new THREE.CylinderGeometry(0.9, 0.9, 0.35, 3);
  const ringG = new THREE.TorusGeometry(0.8, 0.22, 12, 32);
  const zigShape = new THREE.Shape(); { const n = 5; zigShape.moveTo(0, 0); for (let i = 1; i <= n; i++) zigShape.lineTo(i * 0.7, i % 2 ? 0.6 : 0); zigShape.lineTo(n * 0.7, 0.35 + (n % 2 ? 0.6 : 0) - 0.35); for (let i = n; i >= 0; i--) zigShape.lineTo(i * 0.7, (i % 2 ? 0.6 : 0) + 0.35); }
  const zigG = new THREE.ExtrudeGeometry(zigShape, { depth: 0.3, bevelEnabled: false }); zigG.center();
  const floaters = [];
  const confetti = (cx, n, rx, rz, yMin = 0.2, seed = 1) => {
    const q = mulberry(seed), pal = [COR, YEL, MINT, SKY, PUR, IND];
    for (let i = 0; i < n; i++) {
      const kind = i % 3, geo = [triG, ringG, zigG][kind];
      const m = new THREE.Mesh(geo, mat(pal[Math.floor(q() * 6)]));
      let x, z; do { x = (q() * 2 - 1) * rx; z = (q() * 2 - 1) * rz; } while (Math.abs(x) < rx * 0.62 && Math.abs(z) < rz * 0.55);
      const fl = q() < 0.35;
      m.position.set(cx + x, fl ? 6 + q() * 10 : yMin + 0.2, z);
      m.rotation.set(fl ? q() * 3 : (kind === 1 ? Math.PI / 2 : 0), q() * 6, fl ? q() * 3 : 0);
      if (kind === 0) m.rotation.x = 0;
      add(m); ol(m, 0.06);
      if (fl) floaters.push([m, m.position.y, q() * 6]);
    }
  };

  // speech bubble (rounded rect + tail), extruded; centered on its body
  const bubbleGeo = (w, h, tail = -1) => {
    const s = new THREE.Shape(), rr = Math.min(0.55, h * 0.3), x0 = -w / 2, y0 = -h / 2;
    s.moveTo(x0 + rr, y0);
    if (tail) { const tx = tail < 0 ? x0 + w * 0.22 : x0 + w * 0.62; s.lineTo(tx, y0); s.lineTo(tx - 0.15 * tail * 0 + (tail < 0 ? -0.1 : 0.5), y0 - h * 0.42); s.lineTo(tx + w * 0.16, y0); }
    s.lineTo(x0 + w - rr, y0); s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + rr);
    s.lineTo(x0 + w, y0 + h - rr); s.quadraticCurveTo(x0 + w, y0 + h, x0 + w - rr, y0 + h);
    s.lineTo(x0 + rr, y0 + h); s.quadraticCurveTo(x0, y0 + h, x0, y0 + h - rr);
    s.lineTo(x0, y0 + rr); s.quadraticCurveTo(x0, y0, x0 + rr, y0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.6, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 2, curveSegments: 10 });
    g.translate(0, 0, -0.3); return g;
  };
  const bubbleMat = new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.5, envMapIntensity: ENV });
  // an empty bubble: white body, two faint dashed blanks where words would be
  const bubble = (w, h, x, y, z, p = scene, tail = -1) => {
    const g = G(x, y, z, p);
    const m = add(new THREE.Mesh(bubbleGeo(w, h, tail), bubbleMat), g); ol(m, 0.1);
    const nd = Math.max(2, Math.round(w / 1.1));
    for (let i = 0; i < nd; i++) { const d = new THREE.Mesh(new THREE.BoxGeometry(w * 0.5 / nd, 0.14, 0.06), mat("#D9D2E8")); d.position.set(-w * 0.32 + (i + 0.5) * (w * 0.64 / nd), -h * 0.12, 0.42); g.add(d); }
    return g;
  };

  // music note: ellipsoid head + stem (+ flag on some)
  const note = (col, up = true, flag = false) => {
    const g = new THREE.Group();
    const h = add(new THREE.Mesh(new THREE.SphereGeometry(0.62, 28, 18), mat(col)), g); h.scale.set(1.25, 0.9, 0.8); h.rotation.z = 0.35; ol(h, 0.07);
    const sx = up ? 0.68 : -0.68;
    const st = add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.3, 0.2), mat(IND)), g); st.position.set(sx, up ? 1.6 : -1.6, 0);
    if (flag) { const f = add(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.42, 0.22), mat(col)), g); f.position.set(sx + 0.45, up ? 2.95 : -2.95, 0); f.rotation.z = up ? -0.5 : 0.5; ol(f, 0.05); }
    return { g, h };
  };

  // ======================= S0: the toy stadium =======================
  const X0 = 0;
  plinth(X0, 44, 26);
  // back wall: staff on canary, bubble row on sky blue
  const wallT = label(1024, 420, (g, w, h) => {
    g.fillStyle = YEL; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(37,33,74,.9)"; const q = mulberry(3);
    for (let i = 0; i < 70; i++) { const x = q() * w, y = q() * h; if (x > 60 && x < w - 60 && y > 40 && y < h - 30) continue; g.beginPath(); g.arc(x, y, 3 + q() * 3, 0, 6.283); g.fill(); }
    g.strokeStyle = COR; g.lineWidth = 9; g.beginPath(); for (let x = 20; x < w; x += 40) g.lineTo(x, h - 16 - ((x / 40) % 2) * 14); g.stroke();
  });
  TB(27, 10.5, 1.2, wallT, YEL, X0, 9.4, -8.5);
  const lowT = canvasTex(1024, 300, (g, w, h) => { g.fillStyle = SKY; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 6; for (let x = -h; x < w; x += 46) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + h, 0); g.stroke(); } });
  TB(27, 7.4, 1.2, lowT, SKY, X0, 2, -8.5);
  // staff: five lines, a thick bar line and a coral disc as the clef
  const STY = 12.2, SP = 1.05;
  for (let i = 0; i < 5; i++) B(23.5, 0.2, 0.35, IND, X0 + 0.6, STY + i * SP - 0.1, -7.6, scene, 0);
  B(0.5, 4 * SP + 0.2, 0.5, IND, X0 - 11.3, STY - 0.1, -7.6, scene, 0);
  B(0.5, 4 * SP + 0.2, 0.5, IND, X0 + 12.3, STY - 0.1, -7.6, scene, 0);
  const clef = C(1.5, 1.5, 0.5, COR, 0, 0, 0, scene, 0.08); clef.rotation.x = Math.PI / 2; clef.position.set(X0 - 9.6, STY + 2 * SP, -7.4);
  const clef2 = add(new THREE.Mesh(ringG, mat(MINT))); clef2.position.set(X0 - 9.6, STY + 2 * SP, -6.9); clef2.scale.setScalar(0.9); ol(clef2, 0.05);
  // the motif on the staff: E5 F5 E5 D5 C#5 D5 E5 A4 (steps above E4)
  const STEPS = [7, 8, 7, 6, 5, 6, 7, 3];
  const NCOL = [COR, MINT, SKY, PUR, COR, YEL, MINT, COR];
  const notes = STEPS.map((st, i) => {
    const n = note(NCOL[i], st < 5, i === 7);
    n.g.position.set(X0 - 7.2 + i * 2.6, STY + st * SP * 0.5, -7.1);
    scene.add(n.g); n.base = n.g.position.clone(); return n;
  });
  const sharp = B(0.18, 1.2, 0.2, IND, X0 - 7.2 + 4 * 2.6 - 1.25, STY + 5 * SP * 0.5 - 0.6, -7.1, scene, 0);
  // sound rings that leave a playing note
  const rings = [];
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 8, 40), new THREE.MeshBasicMaterial({ color: COR, transparent: true, opacity: 0 })); scene.add(m); rings.push(m); }
  // lyric line: a coral shelf on two mint legs, five EMPTY bubbles
  B(0.8, 3.4, 0.8, MINT, X0 - 10.5, 2, -4.4); B(0.8, 3.4, 0.8, MINT, X0 + 10.5, 2, -4.4);
  const shelfT = label(1024, 64, (g, w, h) => { g.fillStyle = COR; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.font = WF(800, 34); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("LIRIK RESMI  ·  —  ·  —  ·  —", w / 2, h / 2 + 2); });
  TB(24, 0.9, 2.6, shelfT, COR, X0, 5.4, -4.4);
  const lyr = [];
  for (let i = 0; i < 5; i++) { const b = bubble(3.9, 2.5, X0 - 9.4 + i * 4.7, 7.85, -4.4, scene, i % 2 ? 1 : -1); lyr.push(b); }
  // bleachers with silent toy fans, a scoreboard with the brand
  const fanBody = new THREE.CylinderGeometry(0.34, 0.42, 1.0, 14), fanHead = new THREE.SphereGeometry(0.32, 16, 12);
  const fans = [];
  const FCOL = [COR, MINT, SKY, YEL, PUR, "#F59FB5"];
  for (const s of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      const x = X0 + s * (15.3 + k * 1.55), h = 1 + k * 1.0;
      B(1.55, h, 13, k % 2 ? MINT : SKY, x, 2, 0.5, scene, 0.07);
      for (let j = 0; j < 5; j++) {
        const z = -4.4 + j * 2.4, fg = G(x, 2 + h, z);
        const b = add(new THREE.Mesh(fanBody, mat(FCOL[(k * 5 + j + (s > 0 ? 2 : 0)) % 6])), fg); b.position.y = 0.5;
        const hd = add(new THREE.Mesh(fanHead, mat(CRM)), fg); hd.position.y = 1.32;
        fans.push([fg, fg.position.y, k * 5 + j + (s > 0 ? 9 : 0)]);
      }
    }
  }
  const brandT = label(640, 256, (g, w, h) => { g.fillStyle = IND; g.fillRect(0, 0, w, h); g.strokeStyle = YEL; g.lineWidth = 10; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = YEL; g.font = RF(132); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", w / 2, h / 2 + 8); });
  const board = G(X0 + 18.6, 0, -7);
  B(0.5, 9, 0.5, IND, -2, 2, 0, board, 0); B(0.5, 9, 0.5, IND, 2, 2, 0, board, 0);
  TB(6.4, 2.6, 0.6, brandT, IND, 0, 10.4, 0.2, board);
  board.rotation.y = -0.35;
  // front step of the stage with the brand
  const stepT = label(1024, 140, (g, w, h) => { g.fillStyle = COR; g.fillRect(0, 0, w, h); g.fillStyle = IND; g.font = RF(96); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("A U D I R A", w / 2, h / 2 + 6); g.fillStyle = YEL; for (let x = 30; x < w; x += 300) { g.beginPath(); g.arc(x, h / 2, 14, 0, 6.283); g.fill(); } });
  TB(16, 1.3, 3, stepT, COR, X0, 2, 9.6);
  // Sottsass totems at the back corners
  for (const s of [-1, 1]) { C(0.9, 0.9, 9, COR, X0 + s * 15.8, 2, -10.5); S(1.25, SKY, X0 + s * 15.8, 12.3, -10.5); const tr = add(new THREE.Mesh(ringG, mat(MINT))); tr.position.set(X0 + s * 15.8, 15.2, -10.5); tr.scale.setScalar(1.5); ol(tr, 0.05); }
  // mic on a stand nobody sings into
  C(0.14, 0.14, 4.6, IND, X0 - 11.5, 3.3, 8.2, scene, 0); C(1.0, 1.0, 0.3, IND, X0 - 11.5, 3.3, 8.2, scene, 0); S(0.5, "#C9C9D2", X0 - 11.5, 8.2, 8.2);
  confetti(X0, 34, 30, 22, 0.0, 11);

  // ======================= S1: three flags without official lyrics =======================
  const X1 = 80;
  plinth(X1, 40, 22);
  const flagES = canvasTex(600, 400, (g, w, h) => { g.fillStyle = "#AA151B"; g.fillRect(0, 0, w, h); g.fillStyle = "#F1BF00"; g.fillRect(0, h / 4, w, h / 2); });
  const flagBA = canvasTex(800, 400, (g, w, h) => {
    g.fillStyle = "#002395"; g.fillRect(0, 0, w, h); const u = h, a = 0.5 * u;
    g.fillStyle = "#FECB00"; g.beginPath(); g.moveTo(a, 0); g.lineTo(a + u, 0); g.lineTo(a + u, h); g.closePath(); g.fill();
    g.fillStyle = "#fff";
    const star = (cx, cy, R) => { g.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? R * 0.4 : R, an = -Math.PI / 2 + k * Math.PI / 5; g.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); } g.fill(); };
    for (let i = 0; i < 9; i++) { const y = (-0.5 + i) / 7 * h; star(a + y - 0.2 * u, y, 0.06 * u); }
  });
  const flagXK = canvasTex(600, 400, (g, w, h) => {
    g.fillStyle = "#244AA5"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#D0A650"; g.beginPath();
    const lx0 = 20.03, lx1 = 21.76, ly0 = 41.85, ly1 = 43.27, sc = 0.5 * h / (ly1 - ly0), cx = w / 2, cy = h * 0.6;
    for (const [lo, la] of KOS) g.lineTo(cx + (lo - (lx0 + lx1) / 2) * sc * 0.74, cy - (la - (ly0 + ly1) / 2) * sc);
    g.fill();
    g.fillStyle = "#fff";
    const star = (sx, sy, R) => { g.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? R * 0.4 : R, an = -Math.PI / 2 + k * Math.PI / 5; g.lineTo(sx + Math.cos(an) * rr, sy + Math.sin(an) * rr); } g.fill(); };
    for (let i = 0; i < 6; i++) { const an = Math.PI * (0.72 - i * 0.088); star(cx + Math.cos(an) * h * 0.36, h * 0.47 - Math.sin(an) * h * 0.36 + h * 0.06, h * 0.045); }
  });
  const plaque = (txt, col, fg) => label(800, 150, (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = RF(txt.length > 14 ? 58 : 76); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + 4); });
  const flagUnit = (x, z, ped, col, tx, fw, fh, name, ry) => {
    const g = G(X1 + x, 2, z);
    TB(fw * 0.82, ped, fw * 0.5, plaque(name, col, col === YEL ? IND : "#fff"), col, 0, 0, 0, g);
    const f = TB(fw, fh, 0.9, tx, "#F2ECE2", 0, ped, 0, g, 0.12);
    const bb = bubble(4.2, 2.6, 0, ped + fh + 2.6, 0, g);
    g.rotation.y = ry;
    return { g, f, bb };
  };
  const fES = flagUnit(0, 2.5, 3.2, COR, flagES, 9, 6, "SPANYOL", 0);
  const fBA = flagUnit(-11.5, -3, 2.2, MINT, flagBA, 10, 5, "BOSNIA & HERZEGOVINA", 0.22);
  const fXK = flagUnit(11.5, -3, 2.2, SKY, flagXK, 9, 6, "KOSOVO", -0.22);
  confetti(X1, 30, 30, 20, 0.0, 22);

  // ======================= S2: the archive (1761, 1770) =======================
  const X2 = 160;
  plinth(X2, 40, 24);
  const docT = label(800, 1040, (g, w, h) => {
    g.fillStyle = "#FBF3E0"; g.fillRect(0, 0, w, h);
    g.strokeStyle = IND; g.lineWidth = 8; g.strokeRect(30, 30, w - 60, h - 60);
    g.fillStyle = IND; g.textAlign = "center"; g.font = RF(64); g.fillText("MARCHA", w / 2, 150); g.fillText("GRANADERA", w / 2, 222);
    g.fillStyle = COR; g.font = RF(190); g.fillText("1761", w / 2, 430);
    g.strokeStyle = IND; g.lineWidth = 4;
    for (let s = 0; s < 3; s++) { const y0 = 530 + s * 140; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(80, y0 + i * 16); g.lineTo(w - 80, y0 + i * 16); g.stroke(); } const q = mulberry(7 + s); g.fillStyle = IND; for (let x = 120; x < w - 90; x += 52) { const y = y0 + Math.floor(q() * 9) * 8; g.beginPath(); g.ellipse(x, y, 11, 8, -0.4, 0, 6.283); g.fill(); g.fillRect(x + 9, y - 46, 3, 46); } }
    g.fillStyle = IND; g.font = WF(700, 40); g.fillText("Manuel de Espinosa", w / 2, 975);
  });
  const docG = G(X2 - 1, 2, -3);
  B(1, 9, 1, COR, -3.6, 0, -1.5, docG); B(1, 9, 1, COR, 3.6, 0, -1.5, docG); B(9.4, 0.8, 2.2, YEL, 0, 1.2, 0.4, docG);
  const doc = TB(10, 13, 0.5, docT, "#EDE3CC", 0, 2, 0.4, docG, 0.1); doc.rotation.x = -0.12;
  // fife (yellow, holes) and drum (coral, zigzag) with sticks
  const fife = G(X2 - 4.5, 2.55, 8.5);
  const fb = C(0.45, 0.45, 10, YEL, 0, -5, 0, fife); fb.rotation.z = 0;
  for (let i = 0; i < 6; i++) { const hm = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.2, 12), mat(IND)); hm.position.set(0, -2.6 + i * 0.9, 0.42); hm.rotation.x = Math.PI / 2; fife.add(hm); }
  fife.rotation.set(Math.PI / 2, 0, -1.25);
  const drumT = canvasTex(1024, 256, (g, w, h) => { g.fillStyle = COR; g.fillRect(0, 0, w, h); g.strokeStyle = "#fff"; g.lineWidth = 12; g.beginPath(); for (let x = 0; x <= w; x += 64) g.lineTo(x, (x / 64) % 2 ? 50 : h - 50); g.stroke(); g.fillStyle = YEL; g.fillRect(0, 0, w, 26); g.fillRect(0, h - 26, w, 26); });
  const drumG = G(X2 - 10.5, 2, 3.5);
  const drum = add(new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 3, 40), [new THREE.MeshStandardMaterial({ map: drumT, roughness: 0.6, envMapIntensity: ENV }), mat("#FFFFFF"), mat("#FFFFFF")]), drumG); drum.position.y = 1.5; ol(drum, 0.08);
  const sticks = [-1, 1].map((s) => { const p = G(s * 1.4, 3.3, 1.6, drumG); const st = C(0.13, 0.13, 3.6, IND, 0, 0, 0, p, 0); st.rotation.z = Math.PI / 2; st.position.set(-s * 1.6, 0.2, 0); S(0.3, YEL, -s * 0.05, 0.2, 0, p, 0.05); p.rotation.y = s * 0.5; return p; });
  // crown on a pedestal + name plaques
  const crownG = G(X2 + 10.5, 0, -4);
  C(2.2, 2.6, 6, MINT, 0, 2, 0, crownG);
  const crown = G(0, 8, 0, crownG);
  C(2.0, 2.0, 1.4, YEL, 0, 0, 0, crown, 0.08);
  for (let i = 0; i < 6; i++) { const an = (i / 6) * 6.283; const cn = add(new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.6, 4), mat(YEL)), crown); cn.position.set(Math.cos(an) * 1.6, 2.1, Math.sin(an) * 1.6); ol(cn, 0.06); S(0.3, COR, Math.cos(an) * 1.6, 3.05, Math.sin(an) * 1.6, crown, 0.05); }
  S(0.5, SKY, 0, 0.7, 2.05, crown, 0.05);
  const tagCarlos = TB(7.6, 2.0, 1.2, plaque("CARLOS III · 1770", IND, YEL), IND, 0, 0, 0, G(X2 + 9, 2, 3.2), 0.08).parent;
  const tagIsabel = TB(6, 2.0, 1.2, plaque("ISABEL II", PUR, "#fff"), PUR, 0, 0, 0, G(X2 + 2.5, 2, 6), 0.08).parent;
  const sealT = label(256, 256, (g, w, h) => { g.fillStyle = COR; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 4, 0, 6.283); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 22, 0, 6.283); g.stroke(); g.fillStyle = "#fff"; g.font = RF(44); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("LAGU", w / 2, h / 2 - 22); g.fillText("KEBANGSAAN", w / 2, h / 2 + 26); });
  const seal = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.3, 40), [mat(COR), faceMat(sealT), mat(COR)]); seal.rotation.x = Math.PI / 2; seal.rotation.y = 0; add(seal, docG); seal.position.set(3.4, 4.2, 1.2); seal.rotation.set(Math.PI / 2 - 0.12, 0, 0);
  confetti(X2, 30, 30, 21, 0.0, 33);

  // ======================= S3: the lyric sheets that were never official =======================
  const X3 = 240;
  plinth(X3, 40, 22);
  const sheetT = (title) => label(700, 940, (g, w, h) => {
    g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, w, h);
    g.fillStyle = PUR; g.fillRect(0, 0, w, 150); g.fillStyle = "#fff"; g.font = RF(54); g.textAlign = "center"; g.fillText("LIRIK", w / 2, 70); g.font = WF(800, 40); g.fillText(title, w / 2, 125);
    const q = mulberry(title.length * 7); g.fillStyle = "#B9B3C9";
    for (let y = 210; y < h - 70; y += 62) { let x = 60; while (x < w - 120) { const ww = 30 + q() * 90; g.fillRect(x, y, ww, 18); x += ww + 16; } if (q() < 0.25) y += 34; }
  });
  const easel = (x, title, col) => {
    const g = G(X3 + x, 2, -2);
    B(0.7, 11, 0.7, col, -2.8, 0, -1.2, g); B(0.7, 11, 0.7, col, 2.8, 0, -1.2, g); B(7.4, 0.7, 1.8, col, 0, 1.5, 0.2, g);
    const sh = TB(7, 9.4, 0.25, sheetT(title), "#E8E4F0", 0, 2.2, 0.1, g, 0.08); sh.rotation.x = -0.1;
    return { g, sh };
  };
  const eA = easel(-6, "ERA ALFONSO XIII", MINT), eF = easel(6, "ERA FRANCO", SKY);
  eA.g.rotation.y = 0.18; eF.g.rotation.y = -0.18;
  const stampT = label(600, 200, (g, w, h) => { g.strokeStyle = COR; g.lineWidth = 14; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = COR; g.font = RF(96); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("TIDAK RESMI", w / 2, h / 2 + 6); });
  const stampM = new THREE.MeshBasicMaterial({ map: stampT, transparent: true, depthWrite: false });
  const stamps = [eA, eF].map((e) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 2.07), stampM); m.position.set(0, 7.0, 0.32); m.rotation.z = 0.16; e.sh.add(m); m.position.set(0, 0.3, 0.2); return m; });
  // big coral cross over the Franco sheet
  const cross = G(0, 0, 0.5, eF.sh);
  for (const s of [-1, 1]) { const bar = B(10.5, 0.9, 0.4, COR, 0, -0.45, 0, cross, 0.07); bar.rotation.z = s * 0.92; }
  // after 1978: an empty bubble and notes that rise in the middle
  const midB = bubble(5.2, 3.2, X3, 12.2, 1.5);
  const midN = [0, 1, 2].map((i) => { const n = note([COR, MINT, YEL][i], true, i === 2); n.g.position.set(X3 - 3.2 + i * 3.2, 6.2 + (i % 2) * 1.0, 2); scene.add(n.g); return n; });
  confetti(X3, 28, 30, 20, 0.0, 44);

  // ======================= S4: the 2007 contest =======================
  const X4 = 320;
  plinth(X4, 42, 26);
  const signT = label(1024, 300, (g, w, h) => { g.fillStyle = IND; g.fillRect(0, 0, w, h); g.fillStyle = YEL; g.font = RF(104); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("SAYEMBARA LIRIK", w / 2, 112); g.fillStyle = "#fff"; g.font = WF(800, 64); g.fillText("2007  ·  MADRID 2016", w / 2, 222); });
  const sign = G(X4 - 1, 2, -10);
  B(0.6, 10, 0.6, COR, -6.5, 0, 0, sign, 0); B(0.6, 10, 0.6, COR, 6.5, 0, 0, sign, 0);
  TB(15.5, 4.5, 0.7, signT, IND, 0, 8.6, 0.3, sign);
  const boxT = label(700, 512, (g, w, h) => { g.fillStyle = MINT; g.fillRect(0, 0, w, h); g.fillStyle = IND; g.font = RF(92); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("NASKAH", w / 2, h / 2 - 50); g.fillText("LIRIK", w / 2, h / 2 + 50); g.strokeStyle = IND; g.lineWidth = 10; g.strokeRect(24, 24, w - 48, h - 48); });
  const BXx = X4 - 2, BXz = 1, BXh = 6.2;
  TB(7.4, BXh, 5.4, boxT, MINT, BXx, 2, BXz);
  B(4.6, 0.25, 0.7, IND, BXx, 2 + BXh, BXz, scene, 0);
  const lid = B(7.9, 0.9, 5.9, COR, 0, 0, 0, G(BXx, 0, BXz), 0.09).parent;
  const lidX = G(0, 0, 0, lid);
  // slips: instanced paper
  const NS = 360;
  const slipM = new THREE.InstancedMesh(new THREE.BoxGeometry(1.0, 0.05, 1.35), new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.7, envMapIntensity: ENV }), NS);
  slipM.castShadow = slipM.receiveShadow = true; scene.add(slipM);
  const slipCol = ["#FFFFFF", "#FFF6D6", "#FFE4E0", "#E3F7EF"];
  const slips = [];
  for (let i = 0; i < NS; i++) {
    const inBox = i < 90;
    const an = rnd() * 6.283, rr = 4.6 + Math.pow(rnd(), 1.4) * 7.5;
    const px = BXx + Math.cos(an) * rr * 1.1, pz = BXz + Math.sin(an) * rr * 0.75 + 1.5;
    const py = 2.05 + Math.max(0, 2.6 - (rr - 4.6) * 0.42) * rnd();
    slips.push({ inBox, px: inBox ? BXx + (rnd() - 0.5) * 3 : px, py: inBox ? 2 + BXh + 0.4 : py, pz: inBox ? BXz + (rnd() - 0.5) * 0.4 : pz, sx: BXx + (rnd() - 0.5) * 14, sz: BXz + (rnd() - 0.5) * 8, rx: (rnd() - 0.5) * 0.6, ry: rnd() * 6.283, rz: (rnd() - 0.5) * 0.6, u: rnd(), spin: 2 + rnd() * 4 });
    slipM.setColorAt(i, new THREE.Color(slipCol[i % 4]));
  }
  slipM.instanceColor.needsUpdate = true;
  // the winning sheet
  const winT = label(500, 660, (g, w, h) => { g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, w, h); g.strokeStyle = YEL; g.lineWidth = 28; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = COR; g.font = RF(64); g.textAlign = "center"; g.fillText("PEMENANG", w / 2, 120); const q = mulberry(9); g.fillStyle = "#B9B3C9"; for (let y = 190; y < h - 70; y += 54) { let x = 60; while (x < w - 90) { const ww = 26 + q() * 70; g.fillRect(x, y, ww, 16); x += ww + 14; } } });
  const win = G(BXx, 0, BXz);
  TB(4.4, 5.8, 0.2, winT, "#FFFFFF", 0, -2.9, 0, win, 0.08);
  // critic bubbles with a bold "!"
  const critT = label(256, 256, (g, w, h) => { g.fillStyle = IND; g.font = RF(200); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("!", w / 2, h / 2 + 10); });
  const critM = new THREE.MeshBasicMaterial({ map: critT, transparent: true, depthWrite: false });
  const crit = [[-6.5, 13.5, 0, COR], [6, 15.5, 0, YEL], [-5.5, 18.2, -1, SKY], [6.8, 11.5, 1, PUR], [0.5, 21.2, -1, MINT], [-8.5, 9.6, 1, YEL]].map(([x, y, z, c], i) => {
    const g = G(BXx + x, y, BXz + z);
    const b = add(new THREE.Mesh(bubbleGeo(2.8, 2.2, i % 2 ? 1 : -1), mat(c)), g); ol(b, 0.08);
    const ex = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), critM); ex.position.z = 0.45; g.add(ex);
    return g;
  });
  // desk calendar: five pages, flipped over the top hinge
  const calG = G(X4 + 8.6, 2, 3.5);
  B(5.2, 1.1, 3.4, IND, 0, 0, 0, calG); B(4.8, 6.6, 0.5, IND, 0, 1.1, -1.2, calG, 0.07);
  const hinge = G(0, 7.2, -0.75, calG); hinge.rotation.x = -0.1;
  const pages = [1, 2, 3, 4, 5].map((d) => {
    const tx = label(400, 460, (g, w, h) => { g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, w, h); g.fillStyle = COR; g.fillRect(0, 0, w, 110); g.fillStyle = "#fff"; g.font = RF(70); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("HARI", w / 2, 58); g.fillStyle = IND; g.font = RF(250); g.fillText(String(d), w / 2, 300); });
    const p = new THREE.Mesh(new THREE.BoxGeometry(4.3, 5.4, 0.05), [mat("#fff"), mat("#fff"), mat("#fff"), mat("#fff"), faceMat(tx), mat("#EEE")]);
    p.geometry.translate(0, -2.75, 0); p.position.z = 0.2 - d * 0.06; p.castShadow = true; hinge.add(p); return p;
  });
  B(4.6, 0.5, 0.6, YEL, 0, -0.3, 0.1, hinge, 0.05);
  confetti(X4, 26, 32, 22, 0.0, 55);

  // ---------- timing ----------
  const w1 = K.s2, w2 = K.s3, w3 = K.s5, w4 = K.s6, w5 = K.s8;
  const tBos = A("s2:Bosnia"), tKos = A("s2:Kosovo"), tTanpa2 = A("s2:tanpa");
  const t1770 = A("s4:1770"), tCarlos = A("s4:Carlos"), tIsabel = A("s4:Isabel"), tLK = A("s4:kebangsaan");
  const tResmi5 = A("s5:resmi"), tFranco = A("s5:Franco"), t1978 = A("s5:1978"), tDimain = A("s5:dimainkan");
  const tSay = A("s6:Sayembara"), tRibu = A("s6:ribuan");
  const tWin = A("s7:pemenang"), tKrit = A("s7:dikritik"), tLima = A("s7:lima"), tTarik = A("s7:ditarik"), tBatal = A("s7:dibatalkan");
  const tGran = A("s3:Granadera"), tMan = A("s3:Manuel"), t1761 = A("s3:1761");

  // ---------- camera ----------
  const keys = [
    [0, X0 - 5, 14, 60, X0, 10.6, -4], [A("s1:resmi"), X0 - 2, 14, 62, X0, 10.4, -4], [A("s1:dinyanyikan"), X0 + 3, 15, 65, X0, 10.2, -4], [w1 - 0.02, X0 + 5, 15.5, 67, X0, 10.2, -4],
    [w1, X1 - 3, 10, 36, X1, 8.4, 2.5], [A("s2:Real") + 0.4, X1 + 1, 10.5, 38, X1, 8.6, 2.5], [tBos - 0.5, X1 + 2, 11.5, 42, X1, 8.6, 2],
    [tBos + 1.2, X1 - 4, 15, 74, X1, 8.2, 0], [tTanpa2, X1 + 2, 16, 76, X1, 8.4, 0], [w2 - 0.02, X1 + 4, 16.5, 77, X1, 8.4, 0],
    [w2, X2 - 6, 12.5, 46, X2 - 1, 9, -2], [t1761 + 0.5, X2 - 3, 12, 42, X2 - 1, 9, -2], [tGran, X2 - 6, 11, 44, X2 - 2.5, 7.5, 1], [tMan + 0.8, X2 - 5, 12, 48, X2 - 1, 7.5, 1], [K.s4 - 0.3, X2 - 2, 12.5, 50, X2, 7.5, 0],
    [t1770 + 0.3, X2 + 7, 13, 46, X2 + 7, 9, 0], [tCarlos + 0.8, X2 + 7, 16, 44, X2 + 7, 7, 1], [tIsabel + 0.6, X2 + 5, 16, 46, X2 + 5, 6.8, 1], [tLK, X2 + 2, 13, 44, X2 + 2, 7.5, 0], [w3 - 0.02, X2 + 1, 13.5, 46, X2 + 1, 7.5, 0],
    [w3, X3 - 4, 12, 40, X3, 8.5, -1], [tResmi5 + 0.6, X3 - 2, 12, 37, X3, 8.5, -1], [tFranco + 0.3, X3 + 5, 11, 30, X3 + 5.5, 8, -1], [t1978 + 0.4, X3 + 3, 12, 36, X3 + 2, 8, -1], [tDimain, X3, 13, 40, X3, 9.5, 0], [w4 - 0.02, X3 - 1, 13.5, 42, X3, 9.5, 0],
    [w4, X4 + 4, 13, 52, X4, 9, -3], [A("s6:Madrid"), X4 + 1, 12, 46, X4, 9, -4], [tSay, X4 - 2, 12, 42, X4 - 1, 7, 0], [tRibu + 0.6, X4 - 4, 14, 46, X4, 6.5, 1], [K.s7 - 0.1, X4 - 3, 15, 48, X4, 7.5, 1],
    [tWin + 0.4, X4 - 2, 15, 44, X4 - 1, 11, 0], [tKrit + 0.6, X4 - 3, 16, 50, X4 - 1, 13, 0], [tLima - 0.2, X4 + 5, 12, 42, X4 + 5, 8.5, 1], [tTarik + 0.3, X4 + 4, 13, 46, X4 + 4, 9, 1], [tBatal + 0.4, X4 + 2, 15, 52, X4 + 2, 8, 0], [w5 - 0.02, X4, 15.5, 52, X4 + 1, 8.5, 0],
    [w5, X0 + 9, 16, 56, X0, 10.5, -3], [A("s8:kata"), X0 + 4, 15.5, 58, X0, 10.5, -3], [A("s8:Menurut"), X0 - 2, 17, 66, X0, 10.5, -3], [K.end, X0 - 8, 21, 78, X0, 10.5, -3], [K.dur, X0 - 9, 22, 80, X0, 10.5, -3],
  ];
  const camT = track(keys);
  const tgt = new V3();
  const M4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), v4 = new V3(), s4 = new V3();
  const pop = (t, a, d = 0.4) => (t < a ? 0 : back(clamp01((t - a) / d), 1.8));

  return (t) => {
    if (!fontsOk && document.fonts && document.fonts.check(RF(40)) && document.fonts.check(WF(800, 30))) { fontsOk = true; for (const [tx, paint] of labels) { const c = tx.image; paint(c.getContext("2d"), c.width, c.height); tx.needsUpdate = true; } }
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.25, c[1] + Math.sin(t * 0.29) * 0.15, c[2] + Math.cos(t * 0.31) * 0.2);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    key.position.set(tgt.x - 34, 62, tgt.z + 38); key.target.position.set(tgt.x, 0, tgt.z);
    const tq = Math.floor(t * 15) / 15; // toy parts on twos
    const bt = (t - T0) / BEAT, bi = Math.floor(bt), bf = bt - bi;

    // floaters bob
    for (const [m, y0, ph] of floaters) { m.position.y = y0 + Math.sin(tq * 1.3 + ph) * 0.5; m.rotation.y = ph + tq * 0.4; }

    // S0: the playing staff; one note per beat, bubbles stay empty
    const k = ((bi % 8) + 8) % 8;
    notes.forEach((n, i) => {
      const on = i === k ? Math.sin(Math.min(1, bf * 1.6) * Math.PI) : 0;
      n.g.position.set(n.base.x, n.base.y + on * 0.9, n.base.z + on * 1.6);
      n.g.scale.setScalar(1 + on * 0.28);
      n.g.rotation.z = Math.sin(tq * 3.2 + i) * 0.06;
    });
    rings.forEach((m, i) => {
      const age = bt - (bi - i);
      const kk = (((bi - i) % 8) + 8) % 8, n = notes[kk];
      m.position.set(n.base.x, n.base.y, n.base.z + 0.8);
      const s = 0.8 + age * 1.6; m.scale.setScalar(s); m.material.opacity = Math.max(0, 0.55 * (1 - age / 2.6)); m.material.color.set(NCOL[kk]);
    });
    lyr.forEach((b, i) => { const j = Math.floor(k * 5 / 8); const on = i === j ? Math.sin(Math.min(1, bf * 1.4) * Math.PI) : 0; b.scale.setScalar(1 + on * 0.05); b.position.y = 7.85 + on * 0.18; });
    fans.forEach(([g, y0, i]) => { g.position.y = y0 + Math.max(0, Math.sin(bt * Math.PI + i * 0.7)) * 0.12; g.rotation.y = Math.sin(tq * 0.8 + i) * 0.3; });

    // S1: flags rise on their names, bubbles pop empty above all three
    fES.g.scale.y = 1;
    const rBA = t < w1 + 0.1 ? 1 : pop(t, tBos - 0.15, 0.5), rXK = t < w1 + 0.1 ? 1 : pop(t, tKos - 0.15, 0.5);
    fBA.g.scale.set(1, Math.max(0.001, rBA), 1); fBA.g.visible = rBA > 0.002;
    fXK.g.scale.set(1, Math.max(0.001, rXK), 1); fXK.g.visible = rXK > 0.002;
    [fES, fBA, fXK].forEach((f, i) => { const p = t < w1 + 0.1 ? 1 : pop(t, (i === 0 ? A("s2:Spanyol") : tTanpa2) + i * 0.12, 0.45); f.bb.scale.setScalar(Math.max(0.001, p)); f.bb.position.y = (i === 0 ? 3.2 + 6 : i === 1 ? 2.2 + 5 : 2.2 + 6) + 2.6 + Math.sin(tq * 2 + i) * 0.15; });

    // S2: drum sticks tap on the beat in s3, crown drops at 1770, plaques and seal pop
    sticks.forEach((p, i) => { const a = Math.max(0, Math.sin((bt + i * 0.5) * Math.PI * 2)); p.rotation.z = (i ? -1 : 1) * 0.35 * a; });
    const cd = clamp01((tq - (t1770 - 0.35)) / 0.45);
    crown.position.y = 8 + (t < t1770 - 0.35 ? 30 : 14 * (1 - eout(cd)) - Math.sin(clamp01((tq - t1770 + 0.35 - 0.45) / 0.3) * Math.PI) * 0.4 * (cd >= 1 ? 1 : 0));
    crown.rotation.y = tq * 0.5;
    const pc = pop(tq, tCarlos), pi_ = pop(tq, tIsabel);
    tagCarlos.scale.setScalar(Math.max(0.001, pc)); tagCarlos.visible = pc > 0.002;
    tagIsabel.scale.setScalar(Math.max(0.001, pi_)); tagIsabel.visible = pi_ > 0.002;
    const ps = pop(tq, tLK - 0.1, 0.3); seal.scale.setScalar(Math.max(0.001, ps)); seal.visible = ps > 0.002;
    doc.position.y = 2 + 6.5;
    fife.position.y = 2.55;

    // S3: stamps, cross, sink at 1978, then the empty bubble + rising notes
    stamps.forEach((m, i) => { const p = pop(tq, tResmi5 + i * 0.18, 0.22); m.visible = p > 0.002; m.scale.setScalar(Math.max(0.001, 1 + (1 - p) * 0.8)); m.material.opacity = Math.min(1, p); });
    const pX = pop(tq, tFranco - 0.05, 0.3); cross.visible = pX > 0.002; cross.scale.setScalar(Math.max(0.001, pX));
    const sink = ramp(t, t1978 + 0.3, t1978 + 2.3);
    [eA, eF].forEach((e) => { e.g.position.y = 2 - sink * 12.5; e.g.visible = sink < 0.999; });
    const pb = pop(tq, t1978 + 2.0, 0.5); midB.scale.setScalar(Math.max(0.001, pb)); midB.visible = pb > 0.002; midB.position.y = 12.2 + Math.sin(tq * 2) * 0.2;
    midN.forEach((n, i) => { const p = pop(tq, tDimain - 0.2 + i * 0.2, 0.5); n.g.visible = p > 0.002; n.g.scale.setScalar(Math.max(0.001, p * 1.2)); const on = i === ((bi % 3) + 3) % 3 ? Math.sin(Math.min(1, bf * 1.6) * Math.PI) : 0; n.g.position.y = 6.2 + (i % 2) * 1.0 + on * 0.6; });

    // S4: slips fall in, then overflow; winner rises, critics pop, calendar flips, sheet yanked, lid slams
    for (let i = 0; i < NS; i++) {
      const s = slips[i];
      let x, y, z, sc = 1;
      if (s.inBox) {
        const a = tSay - 0.4 + s.u * (tRibu - tSay + 0.2), u = clamp01((tq - a) / 1.0);
        if (u <= 0) sc = 0;
        else if (u >= 1) sc = 0;
        x = s.sx + (s.px - s.sx) * u; z = s.sz + (s.pz - s.sz) * u; y = 26 - (26 - s.py) * u * u;
        e4.set(s.rx + tq * s.spin * (1 - u), s.ry + tq * s.spin * 0.5, s.rz);
      } else {
        const a = tRibu - 0.3 + s.u * 2.6, u = clamp01((tq - a) / 0.9);
        if (u <= 0) sc = 0;
        const top = 2 + BXh + 0.6;
        x = BXx + (s.px - BXx) * u; z = BXz + (s.pz - BXz) * u; y = top + (s.py - top) * u + Math.sin(u * Math.PI) * (3 + s.u * 3);
        e4.set(s.rx + (1 - u) * s.spin, s.ry, s.rz + (1 - u) * s.spin * 0.7);
      }
      if (t < w4 - 0.5) sc = 0;
      q4.setFromEuler(e4); M4.compose(v4.set(x, y, z), q4, s4.set(sc, sc, sc)); slipM.setMatrixAt(i, M4);
    }
    slipM.instanceMatrix.needsUpdate = true;
    const wu = eout(clamp01((tq - tWin + 0.2) / 0.9));
    const yank = clamp01((tq - tTarik + 0.05) / 0.55);
    win.visible = t > tWin - 0.25 && yank < 1;
    win.position.y = 2 + BXh - 2.5 + wu * 10.5 + Math.sin(tq * 2.2) * 0.25 * wu + yank * yank * 34;
    win.rotation.y = (1 - wu) * 2.4 + Math.sin(tq * 1.1) * 0.08;
    win.rotation.z = yank * 0.6;
    crit.forEach((g, i) => { const p = pop(tq, tKrit - 0.1 + i * 0.12, 0.3), out = clamp01((tq - tTarik - 0.2 - i * 0.05) / 0.35); const v = p * (1 - out); g.visible = v > 0.002; g.scale.setScalar(Math.max(0.001, v)); g.rotation.z = Math.sin(tq * 6 + i) * 0.12; });
    pages.forEach((p, i) => { if (i === 4) return; const a = tLima - 0.35 + i * 0.3, u = eout(clamp01((tq - a) / 0.28)); p.rotation.x = -u * Math.PI * 0.96; p.visible = u < 0.98; });
    const ld = clamp01((tq - tBatal + 0.15) / 0.3);
    lid.visible = tq > tBatal - 0.2;
    lid.position.y = 2 + BXh + 0.25 + (1 - ld * ld) * 8;
    const pLx = pop(tq, tBatal + 0.25, 0.3);
    lidX.visible = pLx > 0.002;
    if (!lidX.children.length) { for (const s of [-1, 1]) { const bar = B(6, 0.7, 0.3, IND, 0, -0.35, 0, lidX, 0.05); bar.rotation.z = s * 0.6; } }
    lidX.position.set(0, -BXh / 2 - 0.25, 2.85); lidX.scale.setScalar(Math.max(0.001, pLx));

    comp.render();
  };
}
