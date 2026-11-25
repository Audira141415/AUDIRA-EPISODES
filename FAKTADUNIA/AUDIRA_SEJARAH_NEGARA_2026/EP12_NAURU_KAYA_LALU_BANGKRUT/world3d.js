// EP12 NAURU: DATAPHYSICAL. One museum data sculpture on a long walnut plinth under a gallery spot.
// Back row (z -12): brushed-aluminium bars "ekspor fosfat" + "kekayaan", later replaced by the income wedges.
// Middle (z 0): Nauru as a machined relief. Green coastal ring, grey interior of hex columns that are milled
// down layer by layer into coral pinnacles as the years run. Time rail at z 8 (linear years 1900-2026).
// Front (z 12): teal acrylic trust-fund tank and the brass "BANK NAURU 2006 TUTUP" plaque.
// Front face: brass name plate NAURU -> NAOERO 2026 and the engraved "AUDIRA DATA MUSEUM" strip.
// Everything is a function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, stage, pts, back, envStrips } from "./lib3d.js";

const WAL = "#2A1B14", ALU = "#C8CCD1", TEAL = "#9FD3D6", BRASS = "#D2B07A", ORANGE = "#D4521C", GREIGE = "#1C1D20";
const HEAD = '"IBM Plex Sans Condensed",sans-serif', MONO = '"IBM Plex Mono",monospace';

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
// piecewise linear over [t, v] pairs
const pl = (P) => (t) => { if (t <= P[0][0]) return P[0][1]; for (let i = 1; i < P.length; i++) if (t <= P[i][0]) { const [a, va] = P[i - 1], [b, vb] = P[i]; return va + (vb - va) * ((t - a) / Math.max(1e-4, b - a)); } return P[P.length - 1][1]; };

export function create(canvas, K, AT) {
  const A = (k) => AT[k];
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x1c1d20, fog: 0.0042, exp: 1.05, bloom: [0.12, 0.4, 0.92] });
  envStrips(r, scene, [[30, 4, 0xfff2dc, 3, 0, 22, 10], [4, 30, 0xdfe8ee, 1.6, -24, 8, 0], [4, 30, 0xffe0b8, 1.4, 24, 8, -6], [40, 3, 0xffffff, 0.8, 0, -6, 24]]);
  const rnd = mulberry(1968);
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x2a1b14, 0.55));
  const key = new THREE.DirectionalLight(0xffe2bd, 2.2);
  key.position.set(-14, 34, 22); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -26, right: 26, top: 30, bottom: -30, near: 1, far: 120 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fd3d6, 0.55); rim.position.set(18, 12, -26); scene.add(rim);
  const pool = new THREE.SpotLight(0xfff0d6, 260, 120, 0.62, 0.55, 1.4); pool.position.set(0, 46, 14); pool.target.position.set(0, 0, 0); scene.add(pool, pool.target);

  const labels = [];
  const label = (w, h, paint) => { const tx = canvasTex(w, h, paint); labels.push([tx, paint]); return tx; };
  let fontsOk = false;

  // ---------- materials ----------
  const walTex = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = WAL; g.fillRect(0, 0, w, h);
    const R = mulberry(7);
    for (let i = 0; i < 260; i++) { const y = R() * h, a = 0.04 + R() * 0.1; g.strokeStyle = R() < 0.5 ? `rgba(80,52,34,${a})` : `rgba(14,8,5,${a})`; g.lineWidth = 1 + R() * 5; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.006 + i) * 9 + Math.sin(x * 0.03 + i * 3) * 2); g.stroke(); }
  }, [2, 2]);
  const mWal = new THREE.MeshStandardMaterial({ map: walTex, roughness: 0.48, metalness: 0.05 });
  const brushed = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#b9bdc2"; g.fillRect(0, 0, w, h); const R = mulberry(3); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${R() < 0.5 ? 255 : 90},${R() < 0.5 ? 255 : 95},${R() < 0.5 ? 255 : 100},${0.05 + R() * 0.08})`; g.fillRect(0, R() * h, w, 1); } }, [1, 3]);
  const mAlu = new THREE.MeshStandardMaterial({ color: ALU, map: brushed, roughness: 0.36, metalness: 0.6 });
  const mAluDk = new THREE.MeshStandardMaterial({ color: "#8E9399", roughness: 0.35, metalness: 0.8 });
  const mBrass = new THREE.MeshStandardMaterial({ color: BRASS, roughness: 0.32, metalness: 0.7 });
  const mOrange = new THREE.MeshStandardMaterial({ color: ORANGE, roughness: 0.4, metalness: 0.2, emissive: ORANGE, emissiveIntensity: 0.18 });
  const mGreen = new THREE.MeshStandardMaterial({ color: "#5E7F55", roughness: 0.55, metalness: 0.25 });
  const mTeal = new THREE.MeshStandardMaterial({ color: TEAL, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide });
  const mLiquid = new THREE.MeshStandardMaterial({ color: "#5FB7BC", roughness: 0.15, metalness: 0.05, transparent: true, opacity: 0.78, emissive: "#2C7F86", emissiveIntensity: 0.25 });

  // gallery floor + plinth (x -10..10, z -20..22, top y 0)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: "#121315", roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -3; floor.receiveShadow = true; scene.add(floor);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(20, 3, 42), mWal); plinth.position.set(0, -1.5, 1); plinth.castShadow = plinth.receiveShadow = true; scene.add(plinth);
  const lip = new THREE.Mesh(new THREE.BoxGeometry(20.3, 0.12, 42.3), mAluDk); lip.position.set(0, -0.06, 1); scene.add(lip);

  // ---------- island relief ----------
  const RAD = (a) => 5.6 * (1 + 0.07 * Math.sin(2 * a + 0.6) + 0.04 * Math.cos(3 * a) + 0.025 * Math.sin(5 * a + 1));
  const ring = (k, n = 96) => { const p = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, rr = RAD(a) * k; p.push([Math.cos(a) * rr, Math.sin(a) * rr]); } return p; };
  const shape = (k, holeK) => { const s = new THREE.Shape(ring(k).map(([x, z]) => new THREE.Vector2(x, -z))); if (holeK) s.holes.push(new THREE.Path(ring(holeK).reverse().map(([x, z]) => new THREE.Vector2(x, -z)))); return s; };
  const slab = (shp, y0, d, mat) => { const g = new THREE.ExtrudeGeometry(shp, { depth: d, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 1, curveSegments: 1 }); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, mat); m.position.y = y0; m.castShadow = m.receiveShadow = true; scene.add(m); return m; };
  slab(shape(1.08), 0, 0.3, mAlu);
  slab(shape(1.0, 0.7), 0.3, 0.55, mGreen);
  slab(shape(0.74), 0.3, 0.42, mAluDk);
  const LAG = [-1.5, 1.4];
  const lagoon = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.1, 40), mLiquid); lagoon.position.set(LAG[0], 0.76, LAG[1]); scene.add(lagoon);
  // orange focal rim along the coast for "21 km2"
  const coast = ring(1.015, 120).map(([x, z]) => new THREE.Vector3(x, 0.92, z));
  const rimMesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coast, true), 240, 0.09, 8, true), mOrange); scene.add(rimMesh);

  // interior columns
  const cols = [];
  const S = 0.37;
  for (let iz = -20; iz <= 20; iz++) for (let ix = -20; ix <= 20; ix++) {
    const x = ix * S + (iz % 2 ? S / 2 : 0), z = iz * S * 0.866;
    const a = Math.atan2(z, x), d = Math.hypot(x, z);
    if (d > RAD(a) * 0.69) continue;
    if (Math.hypot(x - LAG[0], z - LAG[1]) < 0.95) continue;
    const pin = rnd() < 0.34;
    const h0 = 1.45 + rnd() * 0.12;
    const hf = pin ? 0.55 + rnd() * 0.75 : 0.08 + rnd() * 0.14;
    const sw = (((a + Math.PI) / (Math.PI * 2)) + 0.35) % 1;
    cols.push({ x, z, h0, hf, pin, sxz: pin ? 0.42 + rnd() * 0.25 : 1, m: 0.78 * sw + 0.22 * rnd(), j: rnd() });
  }
  const colGeo = new THREE.CylinderGeometry(0.21, 0.23, 1, 6); colGeo.translate(0, 0.5, 0);
  const colMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.62, metalness: 0.35 });
  const colIM = new THREE.InstancedMesh(colGeo, colMat, cols.length); colIM.castShadow = colIM.receiveShadow = true; scene.add(colIM);
  const dmy = new THREE.Object3D(), cA = new THREE.Color("#8C9884"), cPin = new THREE.Color("#D8D3C6"), cPit = new THREE.Color("#7C786F"), cTmp = new THREE.Color();
  cols.forEach((c, i) => colIM.setColorAt(i, cA));

  // phosphate glints
  const glint = pts(scene, 90, { color: 0xffd27a, size: 0.55, opacity: 0.9 });
  const gIdx = Array.from({ length: 90 }, () => Math.floor(rnd() * cols.length));

  // ---------- time rail ----------
  const RZ = 8, X = (y) => -9 + ((y - 1900) / 126) * 18;
  const railBar = new THREE.Mesh(new THREE.BoxGeometry(18.6, 0.22, 0.22), mAlu); railBar.position.set(0, 0.3, RZ); railBar.castShadow = true; scene.add(railBar);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 10), mAluDk); p.position.set(s * 9.3, 0.15, RZ); scene.add(p); }
  const ticks = {};
  for (const y of [1900, 1906, 1968, 1970, 2006, 2026]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 10), y === 1968 ? mOrange : mBrass); m.geometry.translate(0, 0.5, 0); m.position.set(X(y), 0.3, RZ); m.scale.y = 0.6; m.castShadow = true; scene.add(m); ticks[y] = m; }
  const band90 = new THREE.Mesh(new THREE.BoxGeometry(X(1999) - X(1990), 0.3, 0.3), new THREE.MeshStandardMaterial({ color: BRASS, transparent: true, opacity: 0.45, roughness: 0.3, metalness: 0.6 }));
  band90.position.set((X(1990) + X(1999)) / 2, 0.3, RZ); scene.add(band90);
  const railTx = label(2048, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const px = (y) => ((X(y) + 9.6) / 19.2) * w;
    g.textBaseline = "middle"; g.font = `600 52px ${MONO}`;
    const put = (txt, y, al, col) => { g.fillStyle = col; g.textAlign = al; g.fillText(txt, px(y) + (al === "right" ? -8 : al === "left" ? 8 : 0), h / 2); };
    put("1900", 1900, "right", BRASS); put("1906", 1906, "left", BRASS);
    g.font = `700 58px ${MONO}`; put("1968", 1968, "right", ORANGE);
    g.font = `600 52px ${MONO}`; put("1970", 1970, "left", BRASS); put("90-an", 1994.5, "center", BRASS); put("2006", 2006, "center", BRASS); put("2026", 2026, "right", BRASS);
  });
  const railLbl = new THREE.Mesh(new THREE.PlaneGeometry(19.2, 1.2), new THREE.MeshBasicMaterial({ map: railTx, transparent: true, depthWrite: false }));
  railLbl.rotation.x = -Math.PI / 2; railLbl.position.set(0, 0.02, RZ + 1.0); scene.add(railLbl);
  const slider = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.5, 24), mBrass); slider.castShadow = true; scene.add(slider);

  // ---------- engraved tags ----------
  const tagMesh = (txt, w, x, z, sub) => {
    const tx = label(1024, 220, (g, W, H) => {
      g.fillStyle = "#2A2118"; g.fillRect(0, 0, W, H);
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#E2C690"); gr.addColorStop(1, "#B8955C"); g.fillStyle = gr; g.fillRect(6, 6, W - 12, H - 12);
      g.fillStyle = "#2A1B14"; g.textAlign = "center"; g.textBaseline = "middle";
      g.font = `700 ${sub ? 80 : 96}px ${HEAD}`; g.fillText(txt, W / 2, sub ? H * 0.38 : H / 2);
      if (sub) { g.font = `500 50px ${MONO}`; g.fillText(sub, W / 2, H * 0.76); }
    });
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, w * 220 / 1024, 0.06), [mBrass, mBrass, mBrass, mBrass, new THREE.MeshStandardMaterial({ map: tx, roughness: 0.7, metalness: 0.15 }), mBrass]);
    m.rotation.x = -1.0; m.position.set(x, 0.42, z); m.castShadow = true; scene.add(m); return m;
  };

  // ---------- bars (back row) ----------
  const BZ = -12;
  const barGeo = new THREE.BoxGeometry(2.4, 1, 2.4); barGeo.translate(0, 0.5, 0);
  const bars = [-2, 2].map((x) => { const b = new THREE.Mesh(barGeo, mAlu); b.position.set(x, 0, BZ); b.castShadow = b.receiveShadow = true; scene.add(b); const cap = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.16, 2.5), mBrass); cap.castShadow = true; scene.add(cap); return { b, cap, x }; });
  const barBase = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.18, 3.4), mAluDk); barBase.position.set(0, 0.09, BZ); barBase.receiveShadow = true; scene.add(barBase);
  const tagEks = tagMesh("EKSPOR FOSFAT", 3.4, -2, BZ + 2.6), tagKay = tagMesh("KEKAYAAN", 3.4, 2, BZ + 2.6);

  // ---------- income wedges (s7) ----------
  const wedge = (th0, mat) => { const g = new THREE.CylinderGeometry(3.4, 3.4, 1, 48, 1, false, th0, Math.PI - 0.06); g.translate(0, 0.5, 0); const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; scene.add(m); return m; };
  const wFish = wedge(Math.PI, new THREE.MeshStandardMaterial({ color: "#DADDE1", roughness: 0.38, metalness: 0.45 })), wCamp = wedge(0, mBrass);
  const tagFish = tagMesh("IZIN TANGKAP IKAN", 3.8, -2.6, BZ + 4.6), tagCamp = tagMesh("PUSAT PENAHANAN", 3.8, 2.6, BZ + 4.6, "dibiayai Australia");

  // ---------- trust tank + bank plaque (front) ----------
  const TX = -3.6, TZ = 13.2;
  const tankBase = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.3, 3.4), mAluDk); tankBase.position.set(TX, 0.15, TZ); tankBase.castShadow = true; scene.add(tankBase);
  const tank = new THREE.Mesh(new THREE.BoxGeometry(4.2, 6, 3), mTeal); tank.position.set(TX, 3.3, TZ); scene.add(tank);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(4.2, 6, 3)), new THREE.LineBasicMaterial({ color: 0xcfeef0, transparent: true, opacity: 0.6 })); edges.position.copy(tank.position); scene.add(edges);
  const liqGeo = new THREE.BoxGeometry(4.0, 1, 2.8); liqGeo.translate(0, 0.5, 0);
  const liquid = new THREE.Mesh(liqGeo, mLiquid); liquid.position.set(TX, 0.32, TZ); scene.add(liquid);
  const tagTank = tagMesh("DANA PERWALIAN", 3.6, TX, TZ + 2.7);
  const PX = 3.6, PZ = 13.4;
  const stand = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.5, 1.6), mAluDk); stand.position.set(PX, 0.25, PZ); stand.castShadow = true; scene.add(stand);
  const plaqTx = label(1024, 600, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#E6CB95"); gr.addColorStop(0.5, "#C9A66A"); gr.addColorStop(1, "#A9864F"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#5A4426"; g.lineWidth = 10; g.strokeRect(26, 26, w - 52, h - 52);
    g.fillStyle = "#2A1B14"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `700 130px ${HEAD}`; g.fillText("BANK NAURU", w / 2, 175);
    g.font = `600 110px ${MONO}`; g.fillText("2006", w / 2, 330);
    g.fillStyle = ORANGE; g.fillRect(250, 410, w - 500, 120); g.fillStyle = "#F4EDE2"; g.font = `700 96px ${HEAD}`; g.fillText("TUTUP", w / 2, 474);
  });
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.7, 0.22), [mBrass, mBrass, mBrass, mBrass, new THREE.MeshStandardMaterial({ map: plaqTx, roughness: 0.32, metalness: 0.65 }), mBrass]);
  plaque.castShadow = true; scene.add(plaque);

  // ---------- name plate + museum strip on the plinth front face (z 22) ----------
  const plateTx = (l1, l2, hot) => label(1400, 230, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#E8CE98"); gr.addColorStop(1, "#B48F55"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#5A4426"; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28);
    g.fillStyle = "#2A1B14"; g.textBaseline = "middle"; g.textAlign = "left";
    g.font = `700 130px ${HEAD}`; g.fillText(l1, 60, h / 2 + 4);
    const w1 = g.measureText(l1).width; g.font = `600 84px ${MONO}`; g.fillStyle = hot; g.fillText(l2, 60 + w1 + 50, h / 2 + 8);
  });
  const plate = new THREE.Group(); plate.position.set(0, -1.05, 22.12); scene.add(plate);
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.64), new THREE.MeshStandardMaterial({ map: plateTx("NAURU", "21 km²", ORANGE), roughness: 0.32, metalness: 0.6 })); pf.position.z = 0.03; plate.add(pf);
  const pb = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.64), new THREE.MeshStandardMaterial({ map: plateTx("NAOERO", "· 2026", "#6B2A0E"), roughness: 0.32, metalness: 0.6 })); pb.rotation.x = Math.PI; pb.position.z = -0.03; plate.add(pb);
  const pcore = new THREE.Mesh(new THREE.BoxGeometry(10, 1.64, 0.04), mBrass); plate.add(pcore);
  const museTx = label(1600, 120, (g, w, h) => { g.fillStyle = "#1A110C"; g.fillRect(0, 0, w, h); g.fillStyle = BRASS; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `600 50px ${MONO}`; g.fillText("AUDIRA DATA MUSEUM  ·  KOLEKSI SEJARAH NEGARA", w / 2, h / 2 + 3); });
  const muse = new THREE.Mesh(new THREE.PlaneGeometry(12, 0.9), new THREE.MeshStandardMaterial({ map: museTx, roughness: 0.4, metalness: 0.5 })); muse.position.set(0, -2.4, 22.03); scene.add(muse);

  // ---------- hook: cash plane + crates ----------
  const ps = new THREE.Shape();
  [[2.6, 0], [2.2, 0.28], [0.6, 0.32], [-0.2, 2.6], [-0.75, 2.6], [-0.4, 0.32], [-1.9, 0.26], [-2.4, 1.1], [-2.75, 1.1], [-2.55, 0], [-2.75, -1.1], [-2.4, -1.1], [-1.9, -0.26], [-0.4, -0.32], [-0.75, -2.6], [-0.2, -2.6], [0.6, -0.32], [2.2, -0.28]].forEach(([x, y], i) => (i ? ps.lineTo(x, y) : ps.moveTo(x, y)));
  const pg = new THREE.ExtrudeGeometry(ps, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 }); pg.rotateX(-Math.PI / 2);
  const plane = new THREE.Mesh(pg, mAlu); plane.castShadow = true; scene.add(plane);
  const crates = [0, 1, 2].map(() => { const G = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.8, 0.9), mAluDk); b.castShadow = true; G.add(b); for (const s of [-0.35, 0.35]) { const band = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.84, 0.94), mBrass); band.position.x = s; G.add(band); } scene.add(G); return G; });

  // ---------- ore ships (s3-s4) ----------
  const ships = [0, 1].map(() => { const G = new THREE.Group(); const h = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.32, 0.55), mBrass); h.position.y = 0.16; h.castShadow = true; G.add(h); const ore = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.32, 8), new THREE.MeshStandardMaterial({ color: "#D8D3C6", roughness: 0.8 })); ore.position.y = 0.48; G.add(ore); scene.add(G); return G; });

  // ---------- timing ----------
  const hookEnd = K.s2;
  const tTer = A("s1:terkaya"), tTut = A("s1:tutup"), tDit = A("s1:diterbangkan");
  const yearAt = pl([[K.s3, 1900], [A("s3:Sejak"), 1900], [A("s3:1906") + 0.6, 1906], [K.s3e, 1940], [A("s4:1968"), 1968], [A("s4:kemudian"), 1968], [A("s4:kemudian") + 0.8, 1970], [K.s4e, 1980], [K.s5e, 1990], [A("s6:sembilan"), 1995], [A("s6:Tahun"), 1999], [A("s6:2006"), 2006], [A("s7:2026"), 2006], [A("s7:2026") + 1.0, 2026]]);
  const mineP = pl([[A("s3:1906"), 0], [K.s3e, 0.3], [K.s4e, 0.5], [A("s5:Yang"), 1]]);
  const hEks = (t) => t < hookEnd ? 6.2 * eout(ramp(t, tTer - 0.5, tTer + 0.5)) : pl([[A("s3:dikapalkan"), 0.05], [K.s3e, 2.6], [A("s4:Uang"), 2.6], [A("s4:deras"), 6.6], [A("s6:habis") - 0.2, 6.6], [A("s6:habis") + 1.2, 0.35], [K.s7 - 0.2, 0.35], [K.s7 + 0.8, 0]])(t);
  const hKay = (t) => t < hookEnd ? 8.2 * eout(ramp(t, tTer - 0.3, tTer + 0.7)) - 7.2 * ramp(t, tTut - 0.05, tTut + 0.45) : pl([[K.s3, 0.25], [A("s4:Uang"), 0.25], [A("s4:deras") + 0.4, 8.2], [A("s6:tergerus") - 0.2, 8.2], [A("s6:buruk") + 0.4, 1.0], [K.s7 - 0.2, 1.0], [K.s7 + 0.8, 0]])(t);
  const level = (t) => t < hookEnd ? 0.04 : pl([[A("s4:Uang"), 0.02], [A("s4:terkaya") + 0.5, 0.88], [A("s6:tergerus") - 0.1, 0.88], [A("s6:investasi") + 1.0, 0.05]])(t);
  const tBank = A("s6:2006") + 0.3, tFlip = A("s7:berganti");

  // ---------- camera ----------
  const keys = [
    [0, 3, 27, 41, 0, 1.5, -3.5],
    [tTer, 1, 23, 35, 0, 2.5, -5],
    [tTut - 0.5, 0, 22, 39, 0, 1.5, 2],
    [tDit + 1.6, -2, 27, 46, 0, 2, 4],
    [hookEnd - 0.02, -2.5, 28, 47, 0, 2, 4],
    [hookEnd, 0, 31, 27, 0, 0, 0.8],
    [K.s2e, 3, 27, 22, 0, 0.3, 0.8],
    [K.s3 + 0.8, 7, 19, 21, 0, 1, 0],
    [A("s3:1906") + 0.6, 8, 15, 18, 0, 1.2, 0],
    [A("s3:Jerman"), 5, 15, 19, 0.5, 1.2, -1.5],
    [K.s3e, 3, 12, 21, 0.5, 0.8, 4],
    [A("s4:1968") + 0.8, 1.5, 7.5, 17, 0.7, 0.4, 8],
    [A("s4:kemudian") + 0.8, 2, 8, 18, 1.2, 0.6, 7.5],
    [A("s4:Uang") + 1.6, 0, 17, 10, 0, 4.2, -12],
    [K.s4e, 2, 15, 6, 0, 4.6, -12],
    [A("s5:mengeruk") + 0.3, 7, 12, 15, 0, 1.2, 0],
    [A("s5:Yang") + 0.2, 4, 7.5, 9.5, 0, 1.3, 0],
    [K.s5e, 1.5, 6.5, 8.5, -0.5, 1.2, -0.5],
    [A("s6:habis") + 0.8, 0, 19, 21, 0, 2.2, -6],
    [A("s6:Dana") + 1.2, -3.2, 15, 33, -3.4, 3.0, 13],
    [A("s6:2006") + 0.8, 0, 15, 40, 0, 2.6, 13],
    [K.s6e, 0.5, 15, 41, 0, 2.6, 13],
    [A("s7:izin") + 0.4, 0, 24, 14, 0, 1.4, -11],
    [A("s7:Australia") + 0.1, 1.5, 22, 12, 0, 1.4, -11],
    [A("s7:2026") + 0.7, 0, 5.5, 56, 0, -0.4, 22],
    [A("s7:Naoero") + 0.6, 0, 5, 54, 0, -0.5, 22],
    [K.s8 + 0.2, 0, 6.5, 55, 0, -0.2, 20],
    [A("s8:habis"), 0, 26, 50, 0, 0, 2],
    [K.end, 0, 42, 62, 0, 0, 1],
    [K.dur, 0, 44, 64, 0, 0, 1],
  ];
  const camT = track(keys);
  const tgt = new THREE.Vector3();

  return (t) => {
    if (!fontsOk && document.fonts && document.fonts.check(`700 40px ${HEAD}`) && document.fonts.check(`600 30px ${MONO}`)) { fontsOk = true; for (const [tx, paint] of labels) { const c = tx.image, g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); paint(g, c.width, c.height); tx.needsUpdate = true; } }
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.33) * 0.35, c[1] + Math.sin(t * 0.27) * 0.25, c[2] + Math.cos(t * 0.29) * 0.3);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    const hook = t < hookEnd;

    // island milling
    const p = hook ? 1 : mineP(t);
    cols.forEach((q, i) => {
      const u = clamp01((p - q.m * 0.86) / 0.14);
      const h = q.h0 + (q.hf - q.h0) * u, hq = u >= 1 ? q.hf : q.hf + Math.ceil((h - q.hf) / 0.2) * 0.2;
      const sxz = 1 + (q.sxz - 1) * u;
      dmy.position.set(q.x, 0.72, q.z); dmy.rotation.set(0, q.j * 3, 0); dmy.scale.set(sxz, Math.max(0.02, hq), sxz); dmy.updateMatrix(); colIM.setMatrixAt(i, dmy.matrix);
      cTmp.copy(cA).lerp(q.pin ? cPin : cPit, u); colIM.setColorAt(i, cTmp);
    });
    colIM.instanceMatrix.needsUpdate = true; colIM.instanceColor.needsUpdate = true;
    // glints: phosphate found in 1900
    const gOn = hook ? 0 : ramp(t, A("s3:fosfat") - 0.2, A("s3:fosfat") + 0.6) * (1 - ramp(t, A("s3:1906") + 0.5, A("s3:dikapalkan")));
    for (let i = 0; i < 90; i++) { const q = cols[gIdx[i]], tw = Math.sin(t * 5 + i * 1.7) > 0.2; glint.pos[i * 3] = q.x; glint.pos[i * 3 + 1] = gOn > 0.01 && tw ? 0.72 + q.h0 + 0.12 : -50; glint.pos[i * 3 + 2] = q.z; }
    glint.commit(); glint.m.opacity = 0.85 * gOn;
    // orange coast rim
    const rimU = hook ? 0 : eout(ramp(t, A("s2:21") - 0.2, A("s2:21") + 0.5)) * (1 - ramp(t, K.s3 - 0.3, K.s3 + 0.5));
    rimMesh.visible = rimU > 0.01; rimMesh.position.y = 0.6 * rimU - 0.6 * (1 - rimU); mOrange.emissiveIntensity = 0.18 + 0.25 * rimU * (0.5 + 0.5 * Math.sin(t * 4));

    // rail + slider
    const yr = yearAt(t), sOn = !hook && t >= K.s3 - 0.2;
    slider.visible = sOn; slider.position.set(X(yr), 0.55, RZ);
    ticks[1968].scale.y = 0.6 + 1.4 * (hook ? 0 : eout(ramp(t, A("s4:1968") - 0.2, A("s4:1968") + 0.5)));

    // bars
    const he = Math.max(0.001, hEks(t)), hk = Math.max(0.001, hKay(t));
    [he, hk].forEach((h, i) => { const B = bars[i]; B.b.scale.y = h; B.b.visible = h > 0.01; B.cap.position.set(B.x, h + 0.08, BZ); B.cap.visible = h > 0.01; });
    const barsOn = hook || t < K.s7 + 0.8; tagEks.visible = tagKay.visible = barsOn; barBase.visible = barsOn;
    // wedges
    const wf = hook ? 0 : eout(ramp(t, A("s7:izin") - 0.2, A("s7:izin") + 0.7)), wc = hook ? 0 : eout(ramp(t, A("s7:pusat") - 0.2, A("s7:pusat") + 0.7));
    wFish.scale.y = Math.max(0.001, 2.0 * wf); wFish.position.set(-0.12, 0, BZ); wFish.visible = wf > 0.01;
    wCamp.scale.y = Math.max(0.001, 2.0 * wc); wCamp.position.set(0.12, 0, BZ); wCamp.visible = wc > 0.01;
    tagFish.visible = wf > 0.3; tagCamp.visible = wc > 0.3;

    // tank
    const lv = level(t); liquid.scale.y = Math.max(0.001, 5.9 * lv); liquid.visible = lv > 0.005;
    // bank plaque drop
    const tb = hook ? tTut - 0.1 : tBank, fall = clamp01((t - tb) / 0.4), shown = hook ? t >= tb - 0.6 : t >= tb - 0.6;
    plaque.visible = shown;
    const py = 14 - 12.05 * fall * fall, settle = t > tb + 0.4 ? Math.sin((t - tb - 0.4) * 20) * Math.exp(-(t - tb - 0.4) * 9) * 0.05 : 0;
    plaque.position.set(PX, Math.max(1.85, py), PZ - 0.25); plaque.rotation.set(-0.32 + settle, 0, 0);

    // name plate flip
    plate.rotation.x = hook ? 0 : Math.PI * eout(ramp(t, tFlip, tFlip + 0.9));

    // hook plane + crates
    const pu = (t - (tDit - 1.3)) / 3.4;
    plane.visible = hook && pu > -0.05 && pu < 1.05;
    const pp = (u) => [14 - 28 * u, 12 - 1.5 * u, -6 + 24 * u];
    if (plane.visible) { const [x, y, z] = pp(clamp01(pu)); plane.position.set(x, y + Math.sin(t * 2) * 0.1, z); plane.rotation.set(0, Math.atan2(-24, -28), Math.sin(t * 1.3) * 0.06); }
    crates.forEach((G, i) => {
      const ud = 0.42 + i * 0.11, td = tDit - 1.3 + ud * 3.4, [x, y, z] = pp(ud);
      G.visible = hook && t >= td;
      const fy = y - 0.5 * 30 * Math.max(0, t - td) ** 2;
      G.position.set(x, Math.max(0.4, fy - 0.5), z); G.rotation.set(0, 0.4 + i * 0.7, fy > 0.9 ? (t - td) * 2 : 0);
    });
    // ore ships loop off the east coast
    const shOn = !hook && t > A("s3:dikapalkan") - 0.3 && t < K.s4e;
    ships.forEach((G, i) => {
      const ph = ((t - A("s3:dikapalkan") + 0.3) / 3.2 + i * 0.5) % 1;
      G.visible = shOn && ph >= 0; const s = Math.max(0.001, Math.min(1, ph / 0.12, (1 - ph) / 0.12));
      G.position.set(6.2 + ph * 3.0, 0, -1.5 - ph * 5.5); G.rotation.y = 1.07; G.scale.setScalar(s);
    });

    key.position.set(tgt.x - 14, 34, tgt.z + 22); key.target.position.copy(tgt);
    bp.strength = 0.12;
    comp.render();
  };
}
