// EP03 HEIGHTMAP, LIDARFORGE look: a seeded greyscale heightmap lies flat as a field of square returns, a laser front lifts every pixel
// to the height its brightness says, the cloud snaps into 4-stud voxels, gets painted, gets a colormap, and is measured.
// Illustration only, no Roblox assets. Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, smooth, canvasTex, track, stage, avatar, restPose, label } from "./lib3d.js";

const N = 96, SP = 0.5, C = (N - 1) / 2, HMAX = 12, VS = 0.5, CARDZ = 62, CYH = 28, CSC = 0.6;
const CPOS = { x: 0, y: 26, z: -8 };
const PAL = { void: 0x04070a, grid: 0x0f2a33, cyan: 0x00f0ff, amber: 0xffb703 };
const RAMP = [[0, "#1e3a8a"], [0.2, "#0e7490"], [0.38, "#059669"], [0.55, "#10b981"], [0.75, "#f59e0b"], [1, "#ef4444"]].map(([s, c]) => [s, new THREE.Color(c)]);
export const MATS = [["Aspal", "#3a3b3e"], ["Basal", "#2f2d33"], ["Bata", "#a2553f"], ["Batu Bulat", "#8a8577"], ["Beton", "#a7a7a2"], ["Lava Retak", "#e2572b"], ["Gletser", "#9fd6e6"], ["Rumput", "#5d9c3c"], ["Tanah", "#7a5e3f"], ["Es", "#c4e4f2"], ["Rumput Daun", "#3f7f2a"], ["Batu Kapur", "#d6cfb6"], ["Lumpur", "#5b4636"], ["Paving", "#8f9294"], ["Batu", "#6f6c68"], ["Garam", "#ede8e2"], ["Pasir", "#d9c38c"], ["Batu Pasir", "#c48a5a"], ["Batu Sabak", "#4f5a5e"], ["Salju", "#f4f7fa"], ["Air", "#2f7fc0"], ["Papan Kayu", "#9b6b3e"]];
const MC = Object.fromEntries(MATS.map(([n, c]) => [n, new THREE.Color(c)]));
const rampCol = (h, out) => { for (let k = 1; k < RAMP.length; k++) if (h <= RAMP[k][0]) { const [a, ca] = RAMP[k - 1], [b, cb] = RAMP[k]; return out.copy(ca).lerp(cb, (h - a) / (b - a)); } return out.copy(RAMP[RAMP.length - 1][1]); };

// ---------- the heightmap: seeded value-noise fbm, island mask, one carved lake ----------
function heightField() {
  const rnd = mulberry(30303);
  const oct = [5, 9, 17, 33].map((s) => { const a = new Float32Array(s * s); for (let k = 0; k < s * s; k++) a[k] = rnd(); return { s, a }; });
  const sm = (x) => x * x * (3 - 2 * x);
  const vn = (o, x, y) => { const { s, a } = oct[o]; const fx = x * (s - 1), fy = y * (s - 1); const i = Math.min(s - 2, Math.floor(fx)), j = Math.min(s - 2, Math.floor(fy)); const u = sm(fx - i), v = sm(fy - j); const A = a[j * s + i], B = a[j * s + i + 1], Cc = a[(j + 1) * s + i], D = a[(j + 1) * s + i + 1]; return A + (B - A) * u + (Cc - A) * v + (A - B - Cc + D) * u * v; };
  const H = new Float32Array(N * N), M = new Float32Array(N * N);
  let mx = 0;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = i / (N - 1), y = j / (N - 1);
    const f = (vn(0, x, y) * 1 + vn(1, x, y) * 0.5 + vn(2, x, y) * 0.25 + vn(3, x, y) * 0.12) / 1.87;
    const d = Math.hypot(x - 0.5, (y - 0.5) * 1.05) * 2;
    const r = 0.86 + 0.22 * (vn(1, y, x) - 0.5);
    const m = 1 - Math.min(1, Math.max(0, (d - (r - 0.4)) / 0.4));
    const peak = Math.exp(-((x - 0.58) ** 2 + (y - 0.4) ** 2) / 0.02);
    let h = m * m * (0.18 + 0.75 * (f - 0.32)) + 0.55 * peak * m;
    h -= 0.55 * Math.exp(-((x - 0.33) ** 2 + (y - 0.64) ** 2) / 0.0045);
    H[j * N + i] = Math.max(0, h); M[j * N + i] = vn(2, y, x);
    mx = Math.max(mx, H[j * N + i]);
  }
  for (let k = 0; k < N * N; k++) { let h = H[k] / mx; h = h < 0.05 ? 0 : (h - 0.05) / 0.95; H[k] = Math.pow(h, 1.15); }
  return { H, M };
}

export function create(canvas, K, AT) {
  const { scene, cam, comp } = stage(canvas, { bg: PAL.void, fog: 0.0016, exp: 1.0, bloom: [0.55, 0.55, 0.72], fov: 45, shadow: false });
  scene.add(new THREE.HemisphereLight(0xaee6ff, 0x0a1620, 1.4));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(30, 60, 40); scene.add(sun);
  const rnd = mulberry(3303);
  const { H, M } = heightField();
  const X = (i) => (i - C) * SP, Z = (j) => (j - C) * SP, Yh = (k) => H[k] * HMAX;

  // material per cell (the colormap)
  const matOf = (k) => { const h = H[k], n = M[k]; if (h <= 0.001) return "Air"; if (h < 0.07) return n > 0.55 ? "Lumpur" : "Pasir"; if (h < 0.4) return n > 0.5 ? "Rumput Daun" : "Rumput"; if (h < 0.62) return n > 0.6 ? "Batu Sabak" : "Batu"; if (h < 0.8) return n > 0.5 ? "Batu" : "Es"; return "Salju"; };
  const CM = []; for (let k = 0; k < N * N; k++) CM.push(MC[matOf(k)]);

  // key cells
  let pk = 0; for (let k = 0; k < N * N; k++) if (H[k] > H[pk]) pk = k;
  const pi = pk % N, pj = Math.floor(pk / N);
  let lake = 0, bestL = 1e9; for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const d = Math.hypot(i / (N - 1) - 0.33, j / (N - 1) - 0.64); if (d < bestL) { bestL = d; lake = j * N + i; } }
  // patch A: a slope with the widest height range, centre mid-height
  let pa = 0, bestR = -1;
  for (let j = 14; j < N - 14; j += 2) for (let i = 14; i < N - 14; i += 2) {
    const h = H[j * N + i]; if (h < 0.22 || h > 0.5) continue;
    let lo = 1, hi = 0; for (let dj = -8; dj <= 8; dj += 2) for (let di = -8; di <= 8; di += 2) { const v = H[(j + dj) * N + i + di]; lo = Math.min(lo, v); hi = Math.max(hi, v); }
    if (hi - lo > bestR && Math.hypot(i - pi, j - pj) > 14) { bestR = hi - lo; pa = j * N + i; }
  }
  const ai = pa % N, aj = Math.floor(pa / N);
  let val = 0, bestV = 1e9; for (let j = 10; j < N - 10; j++) for (let i = 10; i < N - 10; i++) { const h = H[j * N + i]; const d = Math.abs(h - 0.12) + Math.hypot(i - (pi - 22), j - (pj + 6)) * 0.01; if (d < bestV) { bestV = d; val = j * N + i; } }

  // ---------- point cloud ----------
  const sq = canvasTex(64, 64, (g, w) => { g.clearRect(0, 0, w, w); g.fillStyle = "#fff"; g.fillRect(6, 6, w - 12, w - 12); });
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * N * 3), col = new Float32Array(N * N * 3);
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const pm = new THREE.PointsMaterial({ size: 1.12, map: sq, vertexColors: true, alphaTest: 0.5, transparent: false, sizeAttenuation: true });
  const cloud = new THREE.Points(geo, pm); cloud.frustumCulled = false; scene.add(cloud);

  // floor grid (survey void)
  const gridM = new THREE.LineBasicMaterial({ color: PAL.grid, transparent: true, opacity: 0.75 });
  const gp = []; for (let k = -40; k <= 40; k++) { gp.push(k * 4, -0.05, -160, k * 4, -0.05, 160, -160, -0.05, k * 4, 160, -0.05, k * 4); }
  const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.Float32BufferAttribute(gp, 3)); scene.add(new THREE.LineSegments(gg, gridM));

  // glowing helpers
  const glow = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, toneMapped: false, depthWrite: false });
  const bar = (len, c, th = 0.06) => new THREE.Mesh(new THREE.BoxGeometry(len, th, th), glow(c));
  const LBL = [];
  const tag = (text, size, color = "#00f0ff", w = 768) => { const m = label(text, { w, h: 160, font: "700 84px 'JetBrains Mono', monospace", color, bg: "rgba(4,7,10,.72)", size }); scene.add(m); LBL.push(m); return m; };

  // frame around the flat image (s1)
  const frame = new THREE.Group(); scene.add(frame);
  const half = N * SP / 2 + 0.4;
  [[0, -half, 0], [0, half, 0], [-half, 0, 1], [half, 0, 1]].forEach(([x, z, rot]) => { const b = bar(half * 2, PAL.cyan, 0.14); b.position.set(x, 0.05, z); if (rot) b.rotation.y = Math.PI / 2; frame.add(b); });
  const fLab = tag("HEIGHTMAP.PNG", 12); fLab.position.set(-half + 6.4, 0.1, -half - 2.2); fLab.rotation.x = -Math.PI / 2; LBL.pop();
  // s1 measure bar
  const kmBar = new THREE.Group(); scene.add(kmBar);
  const kb = bar(N * SP, PAL.amber, 0.22); kmBar.add(kb);
  [-1, 1].forEach((s) => { const e = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.2, 0.22), glow(PAL.amber)); e.position.x = s * N * SP / 2; kmBar.add(e); });
  kmBar.position.set(0, 0.6, half + 2.4);
  const kmLab = tag("≈ 4,6 KM", 11, "#ffb703");

  // laser curtain
  const lzT = canvasTex(32, 256, (g, w, h) => { const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, "rgba(0,240,255,.9)"); gr.addColorStop(0.08, "rgba(0,240,255,.35)"); gr.addColorStop(1, "rgba(0,240,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const laser = new THREE.Mesh(new THREE.PlaneGeometry(N * SP + 6, 18), new THREE.MeshBasicMaterial({ map: lzT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, opacity: 0.8 }));
  scene.add(laser);
  const lzLine = bar(N * SP + 6, PAL.cyan, 0.16); scene.add(lzLine);

  // survey tags (s2)
  const tG = tag("GUNUNG", 4.2), tL = tag("LEMBAH", 4.2), tD = tag("DANAU", 4.2);
  const tagAt = [[tG, pk, AT["s2:Gunung"]], [tL, val, AT["s2:lembah"]], [tD, lake, AT["s2:danau"]]];
  const leadM = glow(PAL.cyan, 0.8); const leads = tagAt.map(() => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1, 0.08), leadM); scene.add(m); return m; });

  // ---------- voxels ----------
  const vT = canvasTex(128, 128, (g, w) => { g.fillStyle = "#d8d8d8"; g.fillRect(0, 0, w, w); g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, 7); g.fillRect(0, w - 7, w, 7); g.fillRect(0, 0, 7, w); g.fillRect(w - 7, 0, 7, w); });
  const vE = canvasTex(128, 128, (g, w) => { g.fillStyle = "#000"; g.fillRect(0, 0, w, w); g.fillStyle = "#fff"; g.fillRect(0, 0, w, 5); g.fillRect(0, w - 5, w, 5); g.fillRect(0, 0, 5, w); g.fillRect(w - 5, 0, 5, w); });
  const top = (i, j) => Math.max(0, Math.round(Yh(j * N + i) / VS));
  const cells = [];
  const patch = (ci, cj, R, tag) => {
    for (let dj = -R; dj <= R; dj++) for (let di = -R; di <= R; di++) {
      const d = Math.hypot(di, dj); if (d > R + 0.3) continue;
      const i = ci + di, j = cj + dj; if (i < 1 || j < 1 || i > N - 2 || j > N - 2) continue;
      const tp = top(i, j); const nb = Math.min(top(i - 1, j), top(i + 1, j), top(i, j - 1), top(i, j + 1));
      const lo = Math.max(0, Math.min(tp - 1, nb, tp), tp - 5);
      for (let k = lo; k <= tp; k++) cells.push({ i, j, k, tp, d, tag, side: k < tp, r: rnd() });
    }
  };
  patch(ai, aj, 9, 0); const nA = cells.length; patch(pi, pj, 6, 1);
  // patch A materials by local height band
  let lo = 1e9, hi = -1; cells.forEach((c) => { if (c.tag === 0) { lo = Math.min(lo, c.tp); hi = Math.max(hi, c.tp); } });
  const W = { rumput: AT["s3:rumput"], pasir: AT["s3:pasir"], salju: AT["s3:salju"], es: AT["s3:es"], batu: AT["s3:batu"], lumpur: AT["s3:lumpur"], lava: AT["s3:lava"], air: AT["s3:air"], dicat: AT["s3:dicat"] };
  cells.forEach((c) => {
    const k = c.j * N + c.i;
    c.elev = rampCol(H[k], new THREE.Color());
    if (c.tag === 1) { c.mat = (c.side ? MC["Batu"] : CM[k]).clone().multiplyScalar(0.62); return; }
    const hn = (c.tp - lo) / Math.max(1, hi - lo);
    let m, w;
    if (c.side) { m = c.r < 0.5 ? "Tanah" : "Batu"; w = W.dicat; }
    else if (hn < 0.1) { m = "Air"; w = W.air; }
    else if (hn < 0.22) { m = "Pasir"; w = W.pasir; }
    else if (hn < 0.32) { m = "Lumpur"; w = W.lumpur; }
    else if (hn < 0.58) { m = c.r < 0.25 ? "Rumput Daun" : "Rumput"; w = W.rumput; }
    else if (hn < 0.8) { m = c.r < 0.1 ? "Lava Retak" : "Batu"; w = c.r < 0.1 ? W.lava : W.batu; }
    else if (hn < 0.9) { m = "Es"; w = W.es; }
    else { m = "Salju"; w = W.salju; }
    c.mat = MC[m]; c.paint = w + c.d * 0.035;
  });
  const vm = new THREE.MeshStandardMaterial({ map: vT, emissiveMap: vE, emissive: new THREE.Color(0x35e8ff), emissiveIntensity: 0.55, roughness: 0.85 });
  const IV = new THREE.InstancedMesh(new THREE.BoxGeometry(VS * 0.985, VS * 0.985, VS * 0.985), vm, cells.length); IV.frustumCulled = false; scene.add(IV);
  const hidePt = new Uint8Array(N * N);

  // scale callout on one cube next to the avatar (s2)
  const hc = { i: ai + 1, j: aj + 1 }; const htp = top(hc.i, hc.j);
  const hcx = X(hc.i), hcz = Z(hc.j), hcy = htp * VS + VS / 2;
  const hiBox = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(VS * 1.04, VS * 1.04, VS * 1.04)), new THREE.LineBasicMaterial({ color: PAL.amber, toneMapped: false })); hiBox.position.set(hcx, hcy, hcz); scene.add(hiBox);
  const dims = [0, 1, 2].map((ax) => { const g = new THREE.Group(); const b = bar(VS, PAL.amber, 0.025); g.add(b); const l = label("4 STUD", { w: 512, h: 160, font: "700 96px 'JetBrains Mono', monospace", color: "#ffb703", bg: "rgba(4,7,10,.8)", size: 0.5 }); g.add(l); g.userData.l = l; scene.add(g); return g; });
  dims[0].position.set(hcx, hcy + VS / 2 + 0.06, hcz + VS / 2 + 0.06);
  dims[1].position.set(hcx + VS / 2 + 0.06, hcy, hcz + VS / 2 + 0.06); dims[1].children[0].rotation.z = Math.PI / 2;
  dims[2].position.set(hcx + VS / 2 + 0.06, hcy + VS / 2 + 0.06, hcz); dims[2].children[0].rotation.y = Math.PI / 2;
  const dOff = [[0, 0.16, 0.12], [0.3, 0, 0.12], [0.3, 0.14, 0]];
  dims.forEach((g, n) => g.userData.l.position.set(...dOff[n]));
  const dAt = [AT["s2:empat"], AT["s2:empat#2"], AT["s2:empat#3"]];

  // palette wheel (s3): 22 swatches orbit the patch
  const ring = new THREE.Group(); scene.add(ring);
  const sw = MATS.map(([n, c], q) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.06), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, emissive: new THREE.Color(c), emissiveIntensity: 0.25 })); const a = (q / 22) * Math.PI * 2; m.position.set(Math.cos(a) * 3.9, 0, Math.sin(a) * 3.9); m.userData.a = a; m.userData.n = n; ring.add(m); return m; });
  const named = { Rumput: W.rumput, Pasir: W.pasir, Salju: W.salju, Es: W.es, Batu: W.batu, Lumpur: W.lumpur, "Lava Retak": W.lava, Air: W.air };

  // ---------- cards ----------
  const cardTex = (fill, title) => canvasTex(1024, 1100, (g) => {
    g.fillStyle = "#04070a"; g.fillRect(0, 0, 1024, 1100);
    const px = 1000 / N;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { g.fillStyle = fill(j * N + i); g.fillRect(12 + i * px, 88 + j * px, px - 1, px - 1); }
    g.strokeStyle = "#00f0ff"; g.lineWidth = 6; g.strokeRect(9, 85, 1006, 1006);
    g.fillStyle = "#00f0ff"; g.font = "700 54px 'JetBrains Mono', monospace"; g.textBaseline = "middle"; g.fillText(title, 14, 42);
    g.fillStyle = "#ffb703"; g.textAlign = "right"; g.font = "700 40px 'JetBrains Mono', monospace"; g.fillText("AUDIRA SURVEY", 1010, 44);
  });
  const grey = (k) => { const v = Math.round((0.06 + 0.94 * H[k]) * 255); return `rgb(${v},${v},${v})`; };
  const hmT = cardTex(grey, "HEIGHTMAP"); const cmT = cardTex((k) => "#" + CM[k].getHexString(), "COLORMAP");
  const CW = 1024 / 1000 * N * SP, CH = 1100 / 1000 * N * SP; // plane size so that pixels match the island grid
  const mkCard = (tx) => { const G = new THREE.Group(); const m = new THREE.Mesh(new THREE.PlaneGeometry(CW, CH), new THREE.MeshBasicMaterial({ map: tx, transparent: true, side: THREE.DoubleSide, toneMapped: false, depthWrite: false, color: 0xc4c4c4 })); m.position.set(0, 38 / 1000 * N * SP, 0); G.add(m); G.userData.m = m; scene.add(G); return G; };
  const card = mkCard(hmT), ccard = mkCard(cmT);
  // card scan line + brightness markers (s4)
  const scanL = bar(N * SP + 1, PAL.cyan, 0.3); card.add(scanL);
  const ringM = (c) => { const m = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.45, 40), glow(c)); m.material.side = THREE.DoubleSide; scene.add(m); return m; };
  const mkHi = ringM(0xffffff), mkLo = ringM(0x3b82f6);
  const beam = (c) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1, 8), glow(c, 0.85)); scene.add(m); return m; };
  const bHi = beam(0xffffff), bLo = beam(0x60a5fa);
  // pixel callout on the flat card (s6)
  const Q = { i: pi, j: pj }; const qx = X(Q.i), qz = CARDZ + Z(Q.j);
  const pxBox = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(SP, 0.02, SP)), new THREE.LineBasicMaterial({ color: PAL.amber, toneMapped: false })); pxBox.position.set(qx, 0.08, qz); scene.add(pxBox);
  const pxFill = new THREE.Mesh(new THREE.PlaneGeometry(SP, SP), glow(PAL.amber, 0.25)); pxFill.rotation.x = -Math.PI / 2; pxFill.position.set(qx, 0.07, qz); scene.add(pxFill);
  const pxDim = bar(SP, PAL.amber, 0.02); pxDim.position.set(qx, 0.1, qz + SP / 2 + 0.06); scene.add(pxDim);
  const pxLab = label("1 PIKSEL = 4 STUD", { w: 1024, h: 160, font: "700 84px 'JetBrains Mono', monospace", color: "#ffb703", bg: "rgba(4,7,10,.82)", size: 1.5 }); scene.add(pxLab);
  const edgeA = tag("4096 PIKSEL", 13, "#ffb703"), edgeB = tag("4096 PIKSEL", 13, "#ffb703");
  // s7 dimensions on the island
  const dimX = bar(N * SP, PAL.amber, 0.35), dimZ = bar(N * SP, PAL.amber, 0.35); dimZ.rotation.y = Math.PI / 2; scene.add(dimX, dimZ);
  dimX.position.set(0, 0.5, half + 3); dimZ.position.set(-half - 3, 0.5, 0);
  const labX = tag("16.384 STUD", 24, "#ffb703"), labZ = tag("≈ 4,6 KM", 20, "#ffb703");

  // ---------- characters ----------
  const S = avatar({ skin: 0xf5cd30, shirt: 0x1d8fe0, pants: 0x2b3a4a }); scene.add(S.G);
  const STUD = VS / 4; S.G.scale.setScalar(STUD);
  // operator: the same blocky figure as a scanned hologram, presenting the cards
  const O = avatar({ skin: 0x0d2a33, shirt: 0x0b1f28, pants: 0x0b1a22, make: (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, emissive: new THREE.Color(0x1490a8), emissiveIntensity: 0.7, transparent: true, opacity: 0.88 }) });
  O.G.traverse((m) => { if (m.isMesh && m.geometry.type !== "PlaneGeometry") { const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 30), new THREE.LineBasicMaterial({ color: PAL.cyan, toneMapped: false })); m.add(e); } });
  O.G.scale.setScalar(2.1); scene.add(O.G);
  // survey marker on the summit (s8)
  const mk = new THREE.Group(); scene.add(mk);
  const legM = new THREE.MeshStandardMaterial({ color: 0x9aa4ad, metalness: 0.6, roughness: 0.4 });
  [0, 2.09, 4.19].forEach((a) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.75, 6), legM); l.position.set(Math.cos(a) * 0.12, 0.36, Math.sin(a) * 0.12); l.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3); mk.add(l); });
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.16), new THREE.MeshStandardMaterial({ color: 0x1b2a33, roughness: 0.4 })); head.position.y = 0.78; mk.add(head);
  const bcn = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), glow(PAL.cyan)); bcn.position.y = 0.88; mk.add(bcn);
  const plate = label("AUDIRA SURVEY", { w: 1024, h: 200, font: "700 112px 'JetBrains Mono', monospace", color: "#00f0ff", bg: "rgba(4,7,10,.85)", size: 1.1 }); plate.position.y = 1.15; mk.add(plate);
  const sweepR = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.26, 48), glow(PAL.cyan, 0.7)); sweepR.rotation.x = -Math.PI / 2; mk.add(sweepR);

  // ---------- camera ----------
  const P = new THREE.Vector3(X(ai), top(ai, aj) * VS + VS, Z(aj));
  const Pk = new THREE.Vector3(X(pi), top(pi, pj) * VS + VS, Z(pj));
  const tVox = AT["s2:voxel"];
  const cA = track([
    [0, 0, 74, 58, 0, 0, -6], [3.2, 4, 56, 56, 0, 2, -4], [K.s1e, -10, 40, 60, 0, 4, -4],
    [K.s2 + 2.4, -4, 32, 52, 0, 4, -2], [tVox - 0.2, P.x + 6.5, P.y + 6, P.z + 11.5, P.x, P.y + 0.2, P.z], [K.s2e, P.x + 4, P.y + 3.6, P.z + 8.6, P.x, P.y + 0.4, P.z],
    [K.s3 + 4, P.x + 3.6, P.y + 4.6, P.z + 6.8, P.x, P.y + 1.3, P.z], [K.s3e, P.x + 1.2, P.y + 5.0, P.z + 7.4, P.x, P.y + 1.3, P.z],
    [K.s4 + 2.6, 2, 66, 84, 0, 19, 0], [K.s4e, 6, 63, 82, 0, 19, 0],
    [K.s5 + 2.4, -4, 66, 86, 0, 18, 0], [AT["s5:menentukan"], 0, 60, 82, 0, 12, 2], [K.s5e, 0, 62, CARDZ + 46, 0, 0, CARDZ - 4],
    [AT["s6:piksel"], qx + 1.6, 2.2, qz + 3.4, qx, 0.42, qz], [AT["s6:Ukuran"], qx + 2.3, 3.0, qz + 4.4, qx, 0.4, qz], [AT["s6:empat#2"] + 0.6, 0, 70, CARDZ + 60, 0, 6, CARDZ - 10], [K.s6e, 0, 74, CARDZ + 64, 0, 6, CARDZ - 12],
    [K.s7 + 3.2, 22, 96, 128, 0, 30, 28], [K.s7e, 34, 118, 150, 0, 34, 26],
    [K.s8 + 3, Pk.x + 5.5, Pk.y + 3.6, Pk.z + 8.6, Pk.x, Pk.y + 0.6, Pk.z], [AT["s8:Kamu"], Pk.x + 2.9, Pk.y + 2.0, Pk.z + 5.2, Pk.x, Pk.y + 0.75, Pk.z], [K.dur, Pk.x + 0.6, Pk.y + 2.3, Pk.z + 5.6, Pk.x, Pk.y + 0.75, Pk.z],
  ]);

  const tmp = new THREE.Color(), tmp2 = new THREE.Color(), cyan = new THREE.Color(PAL.cyan), white = new THREE.Color(0xffffff);
  const dummy = new THREE.Object3D();
  const tRise0 = 1.5, tRise1 = 5.0, tScan0 = AT["s4:Area"] - 0.2, tScan1 = K.s4e - 0.2;
  const tCm = AT["s5:colormap"], tDr0 = AT["s5:colormap"] + 0.5, tDr1 = AT["s5:menentukan#2"] - 0.3;
  const tMove0 = AT["s5:menentukan#2"] - 0.3, tMove1 = K.s5e + 0.3;
  const tB = K.s8 + 0.4;
  const setCard = (G, p, rx, op) => { G.position.copy(p); G.rotation.set(rx, 0, 0); G.visible = op > 0.01; G.userData.m.material.opacity = op; };
  const vA = new THREE.Vector3(), vB = new THREE.Vector3();

  return (t) => {
    const c = cA(t); cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]);
    LBL.forEach((m) => m.quaternion.copy(cam.quaternion));

    // ---- voxel cubes ----
    hidePt.fill(0);
    for (let n = 0; n < cells.length; n++) {
      const v = cells[n]; let s = 0, colr = v.elev;
      if (v.tag === 0) {
        const a0 = tVox + v.d * 0.05 + (v.tp - v.k) * 0.04, a1 = K.s3e - 0.3 + v.d * 0.03;
        s = back(clamp01((t - a0) / 0.3), 2.2) * (1 - eout(clamp01((t - a1) / 0.35)));
        if (t > a0 + 0.12 && t < a1 + 0.25) hidePt[v.j * N + v.i] = 1;
        if (t > v.paint) { const u = clamp01((t - v.paint) / 0.3); colr = tmp.copy(v.elev).lerp(white, Math.sin(u * Math.PI) * 0.6).lerp(v.mat, u); }
      } else {
        const a0 = tB + v.d * 0.06 + (v.tp - v.k) * 0.05;
        s = back(clamp01((t - a0) / 0.3), 2.2);
        if (t > a0 + 0.12) hidePt[v.j * N + v.i] = 1;
        colr = v.mat;
      }
      if (s <= 0.001) { dummy.position.set(0, -500, 0); dummy.scale.setScalar(0.001); }
      else { dummy.position.set(X(v.i), v.k * VS + VS / 2 + (1 - s) * 0.6, Z(v.j)); dummy.scale.setScalar(Math.max(0.001, s)); }
      dummy.updateMatrix(); IV.setMatrixAt(n, dummy.matrix); IV.setColorAt(n, colr);
    }
    IV.instanceMatrix.needsUpdate = true; IV.instanceColor.needsUpdate = true;

    // ---- point cloud ----
    const zf = -N * SP / 2 - 3 + (N * SP + 6) * ramp(t, tRise0, tRise1);
    const scanOn = t > tScan0 - 0.2 && t < tScan1 + 0.3;
    const zs = -N * SP / 2 - 1 + (N * SP + 2) * clamp01((t - tScan0) / (tScan1 - tScan0));
    const dr = ramp(t, tDr0, tDr1);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const k = j * N + i, z = Z(j), h = H[k];
      const u = smooth((zf - z) / 7);
      let y = Yh(k) * u;
      if (hidePt[k]) y = -999;
      const dx = X(i) - cam.position.x, dy = y - cam.position.y, dz = z - cam.position.z; if (dx * dx + dy * dy + dz * dz < 42) y = -999;
      pos[k * 3] = X(i); pos[k * 3 + 1] = y + 0.02; pos[k * 3 + 2] = z;
      const gv = 0.05 + 0.75 * h; tmp2.setRGB(gv, gv, gv);
      rampCol(h, tmp); tmp2.lerp(tmp, u);
      const cm = clamp01((dr * 1.3 - (z + N * SP / 2) / (N * SP)) / 0.3);
      if (cm > 0) tmp2.lerp(CM[k], cm);
      const fr = Math.max(t < tRise1 + 0.4 ? 1 - Math.abs(zf - z) / 1.6 : 0, scanOn ? 1 - Math.abs(zs - z) / 1.2 : 0);
      if (fr > 0) tmp2.lerp(cyan, fr * 0.85);
      col[k * 3] = tmp2.r; col[k * 3 + 1] = tmp2.g; col[k * 3 + 2] = tmp2.b;
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;

    // ---- laser curtain ----
    const lOn1 = t > tRise0 - 0.1 && t < tRise1 + 0.3, lz = lOn1 ? zf : zs;
    laser.visible = lzLine.visible = lOn1 || scanOn;
    laser.position.set(0, 9, lz); lzLine.position.set(0, 0.2, lz);
    laser.material.opacity = 0.75;

    // ---- s1 frame + km bar ----
    const fo = 1 - ramp(t, 2.2, 3.4); frame.visible = fo > 0.01; frame.children.forEach((b) => (b.material.opacity = fo)); fLab.visible = fo > 0.01; fLab.material.opacity = fo;
    const kmA = ramp(t, AT["s1:empat"] - 0.3, AT["s1:empat"] + 0.3), kmO = 1 - ramp(t, K.s1e, K.s1e + 0.6);
    kmBar.visible = kmLab.visible = false; kmBar.scale.x = Math.max(0.001, kmA); kmLab.material.opacity = kmA * kmO; kmBar.children.forEach((b) => (b.material.opacity = kmO));
    kmLab.position.set(0, 3.2, half + 2.4);

    // ---- survey tags ----
    tagAt.forEach(([m, k, a], n) => { const i = k % N, j = Math.floor(k / N); const o = ramp(t, a - 0.1, a + 0.25) * (1 - ramp(t, tVox - 2.6, tVox - 1.8)); m.visible = leads[n].visible = o > 0.01; m.material.opacity = o; const y0 = Yh(k) * smooth((zf - Z(j)) / 7); m.position.set(X(i), y0 + 5.2, Z(j)); leads[n].position.set(X(i), y0 + 2.2, Z(j)); leads[n].scale.y = 4.4; });

    // ---- scale dims ----
    const hcO = ramp(t, dAt[0] - 0.4, dAt[0]) * (1 - ramp(t, K.s2e, K.s2e + 0.5)); hiBox.visible = hcO > 0.01;
    dims.forEach((g, n) => { const o = ramp(t, dAt[n] - 0.1, dAt[n] + 0.25) * (1 - ramp(t, K.s2e - 0.2, K.s2e + 0.3)); g.visible = o > 0.01; g.children[0].scale.x = Math.max(0.001, o); g.userData.l.material.opacity = o; g.userData.l.quaternion.copy(cam.quaternion); });

    // ---- palette wheel ----
    const rO = ramp(t, K.s3 + 0.2, AT["s3:Dari"]) * (1 - ramp(t, K.s3e - 0.6, K.s3e)); ring.visible = false;
    ring.position.set(P.x, P.y + 1.4 + (1 - rO) * 2, P.z); ring.rotation.set(0.12, t * 0.22, 0); ring.scale.setScalar(Math.max(0.001, rO));
    sw.forEach((m) => { const a = named[m.userData.n]; const pop = a ? Math.max(0, 1 - Math.abs(t - a - 0.15) / 0.45) : 0; m.scale.setScalar(1 + pop * 0.9); m.lookAt(cam.position); });

    // ---- cards ----
    const hIn = ramp(t, AT["s4:heightmap"] - 0.2, AT["s4:Heightmap"] + 0.6);
    const mv = ramp(t, tMove0, tMove1);
    let hOp = ramp(t, AT["s4:heightmap"] - 0.2, AT["s4:heightmap"] + 0.4) * (1 - ramp(t, tCm - 0.5, tCm));
    vA.set(0, 0.2, 0).lerp(vB.set(CPOS.x, CPOS.y, CPOS.z), hIn); card.scale.setScalar(1 - (1 - CSC) * hIn);
    if (t > tCm) { vA.set(0, 0.06, CARDZ); card.scale.setScalar(1); hOp = mv; }
    setCard(card, vA, -Math.PI / 2, hOp);
    const sOn = scanOn; scanL.visible = sOn; scanL.position.set(0, N * SP / 2 - (N * SP) * clamp01((t - tScan0) / (tScan1 - tScan0)), 0.05);
    const cIn = ramp(t, tCm - 0.3, tCm + 0.4);
    vA.set(CPOS.x, CPOS.y, CPOS.z).lerp(vB.set(0, HMAX + 1.5, 0), dr); ccard.scale.setScalar(CSC + (1 - CSC) * dr);
    setCard(ccard, vA, -Math.PI / 2, cIn * (1 - ramp(t, tDr1 - 0.6, tDr1 + 0.2)));
    // terang/gelap markers: a beam from the pixel down to the terrain it lifts
    const mH = ramp(t, AT["s4:terang"] - 0.1, AT["s4:terang"] + 0.3) * (1 - ramp(t, K.s4e - 0.3, K.s4e + 0.3));
    const mL = ramp(t, AT["s4:gelap"] - 0.1, AT["s4:gelap"] + 0.3) * (1 - ramp(t, K.s4e - 0.3, K.s4e + 0.3));
    const onCard = (k, m, b, o, yT) => { const i = k % N, j = Math.floor(k / N); m.visible = b.visible = o > 0.01; m.material.opacity = o; const a = new THREE.Vector3(CPOS.x + X(i) * CSC, CPOS.y + 0.15, CPOS.z + Z(j) * CSC), e = new THREE.Vector3(X(i), yT, Z(j)); m.position.copy(a); m.rotation.set(-Math.PI / 2, 0, 0); m.scale.setScalar((0.6 + 0.4 * back(o)) * 0.7); const L = a.distanceTo(e) * o; b.position.copy(a).lerp(e, 0.5 * o); b.scale.set(1, Math.max(0.001, L), 1); b.lookAt(e); b.rotateX(Math.PI / 2); b.material.opacity = o * 0.85; };
    onCard(pk, mkHi, bHi, mH, Yh(pk) + 0.3); onCard(lake, mkLo, bLo, mL, 0.3);

    // ---- pixel callout ----
    const pO = ramp(t, AT["s6:piksel"] - 0.6, AT["s6:piksel"]) * (1 - ramp(t, AT["s6:empat#2"] + 0.4, AT["s6:empat#2"] + 1)) * (t > K.s6 - 0.5 ? 1 : 0);
    pxBox.visible = pxFill.visible = pxDim.visible = pO > 0.01; pxLab.visible = false; pxFill.material.opacity = 0.3 * pO * (0.7 + 0.3 * Math.sin(t * 6)); pxLab.material.opacity = pO; pxDim.material.opacity = pO;
    pxLab.position.set(qx + 0.15, 0.95, qz + 0.4); pxLab.quaternion.copy(cam.quaternion);
    const eO = ramp(t, AT["s6:empat#2"] - 0.2, AT["s6:empat#2"] + 0.4) * (1 - ramp(t, K.s7 + 2.4, K.s7 + 3.2));
    edgeA.visible = edgeB.visible = eO > 0.01; edgeA.material.opacity = edgeB.material.opacity = eO;
    edgeA.position.set(0, 3, CARDZ - 12); edgeB.position.set(-N * SP / 2 + 6, 2.5, CARDZ + 2); edgeB.rotateZ(Math.PI / 2);

    // ---- s7 dims ----
    const xO = ramp(t, AT["s7:belas"] - 0.3, AT["s7:belas"] + 0.5) * (1 - ramp(t, K.s7e, K.s7e + 0.8)), zO = ramp(t, AT["s7:koma"] - 0.3, AT["s7:koma"] + 0.5) * (1 - ramp(t, K.s7e, K.s7e + 0.8));
    dimX.visible = labX.visible = xO > 0.01; dimX.scale.x = Math.max(0.001, xO); labX.material.opacity = xO; labX.position.set(0, 6, half + 8);
    dimZ.visible = labZ.visible = zO > 0.01; dimZ.scale.x = Math.max(0.001, zO); labZ.material.opacity = zO; labZ.position.set(-half - 6, 9, 0);

    // ---- small avatar ----
    restPose(S); S.G.rotation.set(0, 0, 0);
    let sv = false;
    if (t > tVox + 0.3 && t < K.s3e + 0.2) {
      sv = true; const d = 1 - eout(clamp01((t - tVox - 0.3) / 0.55));
      S.G.position.set(P.x, P.y + d * 3, P.z); S.G.rotation.y = 0.35;
      if (t > K.s3) { S.G.rotation.y = -0.5 + Math.sin(t * 0.8) * 0.3; const fl = Object.values(named).reduce((m, a) => Math.max(m, 1 - Math.abs(t - a) / 0.35), 0); S.armR.rotation.x = -1.4 - fl * 0.5; S.armR.rotation.z = 0.2; }
      else if (t > dAt[0] - 0.2) { S.armR.rotation.x = -1.2; S.armR.rotation.z = -0.3; }
    } else if (t > K.s6 - 0.3 && t < K.s6e + 0.3) {
      sv = true; S.G.position.set(qx - 0.05, 0.06, qz + 0.02); S.G.rotation.y = 0.35;
      const st = AT["s6:stud"]; if (t > st - 0.3) { S.armR.rotation.x = -0.9; S.armR.rotation.z = 0.45; }
    } else if (t > tB + 0.3) {
      sv = true; const d = 1 - eout(clamp01((t - tB - 0.5) / 0.6));
      S.G.position.set(Pk.x, Pk.y + d * 4, Pk.z); S.G.rotation.y = 0.45;
      const wv = AT["s8:Kamu"] - 0.4; if (t > wv) { S.armR.rotation.z = 2.5 + Math.sin((t - wv) * 9) * 0.45; S.armL.rotation.z = -0.15; }
    }
    S.G.visible = sv;
    mk.visible = t > tB; mk.position.set(Pk.x + 0.75, top(pi + 1, pj) * VS + VS, Pk.z - 0.35); mk.scale.setScalar(back(clamp01((t - tB - 0.9) / 0.4))); plate.quaternion.copy(cam.quaternion);
    bcn.material.opacity = 0.5 + 0.5 * Math.sin(t * 5); sweepR.scale.setScalar(1 + ((t * 0.8) % 1) * 4); sweepR.material.opacity = 0.7 * (1 - ((t * 0.8) % 1));

    // ---- operator ----
    const oO = ramp(t, K.s4 + 0.2, K.s4 + 1.4) * (1 - ramp(t, K.s5e - 0.6, K.s5e + 0.2));
    O.G.visible = oO > 0.01; restPose(O);
    O.G.position.set(-17, (1 - oO) * -12, 2); O.G.rotation.y = 0.55;
    if (t < K.s5) { const p = ramp(t, AT["s4:terang"] - 0.5, AT["s4:terang"]); O.armR.rotation.x = -2.2 * Math.max(p, ramp(t, AT["s4:heightmap"] - 0.3, AT["s4:heightmap"] + 0.3) * 0.8); O.armR.rotation.z = 0.25; O.head.rotation.y = -0.3; }
    else { const p = ramp(t, tCm - 0.3, tCm + 0.3); O.armR.rotation.x = O.armL.rotation.x = -2.6 * p + dr * 1.4; O.armR.rotation.z = 0.2; O.armL.rotation.z = -0.2; }

    comp.render();
  };
}
