// EP16 AYYUB, HENTAKAN KAKI. TERRARIUM: a miniature living world inside a tall glass bell jar standing on a walnut
// plinth on a wooden table, lit by soft window light. Dry cracked earth, a withered tree, a small woven mat and an oil
// lamp beside it (the prophet's presence, never a figure), empty adobe houses on the back hill (the absent family).
// A single footprint-shaped impact in the soil opens a cool spring; water runs in two channels; moss, grass, leaves and
// flowers grow outward from the spring in a time-lapse; houses light up one by one and then double.
// Glass: custom fresnel shader with a soft window reflection and condensation droplets (s5 onward).
// AUDIRA is a small etched brass label on the plinth front (visible in the wide shots and in the sign-off).
// Layout: jar axis at x=z=0, glass radius 6.5 from y=1.3 to 12 + dome to 18.5; soil top GY=3.2; spring S=(1.0, 2.0);
// mat at (-0.2, 1.45); lamp at (-0.95, 1.05); tree at (-1.6, 0.4); houses on the back hill (z<-2).
// Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, track, stage, pts, envStrips } from "./lib3d.js";

function hash(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };

const GY = 3.2, GR = 6.42, JR = 6.5, JH = 9.6;
const S = [1.0, 2.0];
const MAT = { x: -0.2, z: 1.45, w: 1.5, d: 0.95, rot: -0.22 };
const LAMP = [-0.95, 1.0];
const TREE = [-1.6, 0.4];

// water channels: two runs from the spring, each ending in a pool against the glass
const RUNS = [
  [[1.0, 2.0], [1.55, 2.65], [2.05, 3.35], [2.55, 4.1], [3.0, 4.85]],
  [[1.0, 2.0], [0.75, 2.85], [0.05, 3.6], [-0.9, 4.25], [-2.1, 4.85]],
];
const POOLS = [[1.0, 2.0, 0.55], [3.05, 4.95, 0.85], [-2.25, 4.95, 0.62]];
// distance along the water from the spring and how much a point is "in" the water (0..1)
function water(x, z) {
  let best = 1e9, dist = 0, cum0 = 0;
  for (const run of RUNS) {
    let cum = 0;
    for (let i = 0; i < run.length - 1; i++) {
      const [ax, az] = run[i], [bx, bz] = run[i + 1];
      const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
      const u = clamp01(((x - ax) * dx + (z - az) * dz) / (L * L));
      const d = Math.hypot(x - ax - dx * u, z - az - dz * u);
      const w = 0.17 + 0.07 * ((cum + u * L) / 4);
      const e = d - w;
      if (e < best) { best = e; dist = cum + u * L; }
      cum += L;
    }
    cum0 = cum;
  }
  for (const [px, pz, pr] of POOLS) {
    const d = Math.hypot(x - px, z - pz), e = d - pr;
    if (e < best) { best = e; dist = px === S[0] ? d : cum0 + 0.15 + d * 0.8; }
  }
  return { m: 1 - sm((best + 0.04) / 0.16), dist, edge: best };
}
export function H(x, z) {
  let h = GY + 1.45 * sm((-z - 0.9) / 4.0) * (1 - 0.3 * sm((Math.abs(x) - 3.2) / 2.5));
  const flatM = 1 - sm((Math.hypot((x - MAT.x) / 1.1, (z - MAT.z) / 0.8) - 0.8) / 0.4);
  const flatS = 1 - sm((Math.hypot(x - S[0], z - S[1]) - 0.7) / 0.35);
  h += ((vnoise(x * 0.9, z * 0.9) - 0.5) * 0.14 + (vnoise(x * 2.4 + 5, z * 2.4) - 0.5) * 0.05) * (1 - Math.max(flatM, flatS));
  const w = water(x, z);
  h -= 0.2 * w.m * (1 - flatS);
  return h;
}

// a hand-squeezed sphere
function blobGeo(r, seed, seg = 14, amp = 0.08) {
  const g = new THREE.SphereGeometry(r, seg, Math.max(6, Math.round(seg * 0.7)));
  const p = g.attributes.position, R = mulberry(seed), a = [R() * 9, R() * 9, R() * 9], v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = v.clone().normalize();
    const d = 1 + amp * (Math.sin(n.x * 3.1 + a[0]) * Math.sin(n.y * 2.7 + a[1]) + 0.6 * Math.sin(n.z * 4.3 + a[2] + n.x * 2));
    p.setXYZ(i, v.x * d, v.y * d, v.z * d);
  }
  g.computeVertexNormals();
  return g;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0x2a2119, fog: 0.011, exp: 1.0, bloom: [0.22, 0.5, 0.86], shadow: true });
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const C = (h) => new THREE.Color(h);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  r.localClippingEnabled = false;

  // ---------- timing
  const ST1 = A("s1:kaki"), BU1 = A("s1:memancarkan");
  const ST5 = A("s5:kakimu"), BU5 = A("s5:Inilah");
  const FALL0 = A("s2:penyakit");
  const tFam1 = A("s1:keluarganya"), tFam2 = A("s2:keluarganya");
  const tBack = A("s6:Keluarganya"), tDbl = A("s6:dilipatgandakan");
  // water reveal (distance along the water from the spring)
  function rev(t) {
    if (t < K.s2 - 0.05) return 1.9 * eout((t - BU1 + 0.05) / 1.6) * (t > BU1 - 0.05 ? 1 : 0);
    if (t < BU5) return 0;
    return 9 * eout((t - BU5 + 0.05) / 6.5);
  }
  // growth front radius from the spring
  const gRad = (t) => t < BU5 ? 0 : 1.1 * ramp(t, BU5 + 2.5, K.s6) + 7.6 * ramp(t, K.s6 - 0.1, K.s6 + 7.2);
  const gAt = (t, d, jit = 0) => sm((gRad(t) - d - jit) / 1.0);
  const dS = (x, z) => Math.hypot(x - S[0], z - S[1]);

  // ---------- environment for metal and water
  envStrips(r, scene, [[30, 40, 0xfff2dc, 1.6, -40, 25, 30], [60, 10, 0xffe6c4, 0.5, 0, 50, 0], [40, 20, 0x8a7a66, 0.4, 40, 5, -20]], 0x1a1510);

  // ---------- lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -16, right: 16, top: 22, bottom: -10, near: 1, far: 120 });
  scene.add(key); scene.add(key.target);
  const fill = new THREE.DirectionalLight(0xcfe0ff, 0.5); fill.position.set(20, 14, 30); scene.add(fill);
  const lampL = new THREE.PointLight(0xffb060, 0, 6, 1.6); scene.add(lampL);
  const houseL = new THREE.PointLight(0xffb468, 0, 7, 1.6); houseL.position.set(0, 5.4, -2.6); scene.add(houseL);
  const springL = new THREE.PointLight(0x9fe8ff, 0, 4, 1.8); springL.position.set(S[0], GY + 0.6, S[1]); scene.add(springL);

  const MO = {
    DRY: { kc: C(0xffd7a2), ki: 2.7, az: -58, el: 38, hs: C(0xe2d2b6), hg: C(0x5e4a34), hi: 1.0, fog: C(0x3a2e22), exp: 1.12, fi: 0.6, lamp: 2.2 },
    EVE: { kc: C(0xffa060), ki: 1.7, az: -75, el: 16, hs: C(0xa898b0), hg: C(0x3a281c), hi: 0.62, fog: C(0x261c14), exp: 1.15, fi: 0.32, lamp: 5.5 },
    DAWN: { kc: C(0xe4ecff), ki: 2.4, az: -62, el: 28, hs: C(0xc6d8e6), hg: C(0x3c3a34), hi: 0.85, fog: C(0x223038), exp: 1.02, fi: 0.5, lamp: 1.6 },
    LUSH: { kc: C(0xfff0d2), ki: 2.8, az: -52, el: 40, hs: C(0xe6efd6), hg: C(0x4a4428), hi: 1.1, fog: C(0x2c2a1e), exp: 1.0, fi: 0.55, lamp: 1.4 },
  };
  const MOOD = [[0, "DRY"], [K.s3 - 1, "DRY"], [K.s3 + 2.5, "EVE"], [K.s5 + 1.5, "EVE"], [BU5 + 0.5, "DAWN"], [K.s6, "DAWN"], [K.s6 + 4, "LUSH"], [K.dur, "LUSH"]];
  const M = { kc: new THREE.Color(), hs: new THREE.Color(), hg: new THREE.Color(), fog: new THREE.Color() };
  function mood(t) {
    let i = 0; while (i < MOOD.length - 2 && MOOD[i + 1][0] <= t) i++;
    const a = MO[MOOD[i][1]], b = MO[MOOD[i + 1][1]];
    const u = sm((t - MOOD[i][0]) / Math.max(0.001, MOOD[i + 1][0] - MOOD[i][0]));
    for (const k of ["kc", "hs", "hg", "fog"]) M[k].copy(a[k]).lerp(b[k], u);
    for (const k of ["ki", "az", "el", "hi", "exp", "fi", "lamp"]) M[k] = a[k] + (b[k] - a[k]) * u;
    return M;
  }

  // ---------- room: wooden table, plaster wall with a window, a shelf
  const woodTex = canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = "#6a4528"; g.fillRect(0, 0, w, h);
    const R = mulberry(16);
    for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? "rgba(40,22,10,.18)" : "rgba(150,100,60,.12)"; g.fillRect(0, i * h / 6, w, h / 6); g.fillStyle = "rgba(25,14,6,.55)"; g.fillRect(0, i * h / 6, w, 3); }
    for (let i = 0; i < 260; i++) { const y = R() * h; g.strokeStyle = `rgba(${R() < 0.5 ? "35,20,8" : "160,110,70"},${0.08 + R() * 0.12})`; g.lineWidth = 1 + R() * 2; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 4 * R()); g.stroke(); }
  }, [3, 2]);
  const table = new THREE.Mesh(new THREE.BoxGeometry(80, 1, 46), new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.62, metalness: 0, color: 0xd8c0a4 }));
  table.position.set(0, -0.5, -4); table.receiveShadow = true; scene.add(table);
  const wallTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#8a7660"; g.fillRect(0, 0, w, h);
    const R = mulberry(5); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(${R() < 0.5 ? "60,48,36" : "180,160,130"},.06)`; g.beginPath(); g.arc(R() * w, R() * h, 2 + R() * 9, 0, 6.3); g.fill(); }
  }, [4, 3]);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(160, 90), new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95 }));
  wall.position.set(0, 30, -27); wall.receiveShadow = true; scene.add(wall);
  const winTex = canvasTex(512, 640, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#fff6e6"); gr.addColorStop(1, "#ffe2b8"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = "#3a2a1c"; g.fillRect(0, 0, w, 22); g.fillRect(0, h - 22, w, 22); g.fillRect(0, 0, 22, h); g.fillRect(w - 22, 0, 22, h);
    g.fillRect(w / 2 - 9, 0, 18, h); g.fillRect(0, h * 0.45 - 9, w, 18);
  });
  const winM = new THREE.MeshBasicMaterial({ map: winTex, color: 0xffffff, fog: true });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(16, 20), winM); win.position.set(-27, 22, -26.8); scene.add(win);
  // a shelf with jars and books on the right wall section
  const shelfM = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.7 });
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(22, 0.6, 3), shelfM); shelf.position.set(24, 17, -25.4); shelf.castShadow = shelf.receiveShadow = true; scene.add(shelf);
  const RS = mulberry(61);
  for (let i = 0; i < 9; i++) {
    const hgt = 2.4 + RS() * 1.6;
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.9 + RS() * 0.5, hgt, 2.2), new THREE.MeshStandardMaterial({ color: [0x7a3a2a, 0x2f4a5a, 0x6a6a3a, 0x8a6a3a, 0x3a5a3a][i % 5], roughness: 0.8 }));
    b.position.set(15 + i * 1.25, 17.3 + hgt / 2, -25.3); b.rotation.z = i === 6 ? 0.25 : 0; scene.add(b);
  }
  for (let i = 0; i < 3; i++) {
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.2, 20), new THREE.MeshStandardMaterial({ color: 0xa8c4b4, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.55 }));
    jar.position.set(28 + i * 2.2, 18.4, -25.3); scene.add(jar);
  }
  // a linen cloth and a small brass dish of pebbles on the table
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(7, 0.08, 5), new THREE.MeshStandardMaterial({ color: 0xe8dcc6, roughness: 0.95 }));
  cloth.position.set(-11.5, 0.04, 6); cloth.rotation.y = 0.35; cloth.receiveShadow = true; scene.add(cloth);
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.0, 0.35, 28), new THREE.MeshStandardMaterial({ color: 0xb08d4a, roughness: 0.32, metalness: 0.85 }));
  dish.position.set(10.5, 0.18, 6.5); dish.castShadow = true; scene.add(dish);
  for (let i = 0; i < 9; i++) { const p = new THREE.Mesh(blobGeo(0.28, 700 + i, 10, 0.12), new THREE.MeshStandardMaterial({ color: [0x9a8f84, 0xc4b8a6, 0x6e6660][i % 3], roughness: 0.7 })); p.scale.y = 0.6; p.position.set(10.5 + Math.cos(i * 2.1) * 0.7 * (i % 3 ? 1 : 0.3), 0.45, 6.5 + Math.sin(i * 2.1) * 0.6 * (i % 3 ? 1 : 0.3)); scene.add(p); }

  // ---------- plinth, brass ring and the AUDIRA label
  const walnut = canvasTex(1024, 128, (g, w, h) => {
    g.fillStyle = "#4a2e1a"; g.fillRect(0, 0, w, h);
    const R = mulberry(7); for (let i = 0; i < 120; i++) { const y = R() * h; g.strokeStyle = `rgba(${R() < 0.5 ? "20,10,4" : "120,80,50"},.2)`; g.lineWidth = 1 + R() * 2; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 40) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 3); g.stroke(); }
  });
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(6.85, 7.0, 1.3, 96), new THREE.MeshStandardMaterial({ map: walnut, roughness: 0.42, metalness: 0.05 }));
  plinth.position.y = 0.65; plinth.castShadow = plinth.receiveShadow = true; scene.add(plinth);
  const brass = new THREE.MeshStandardMaterial({ color: 0xc09a52, roughness: 0.3, metalness: 0.9 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(JR + 0.04, 0.09, 10, 120).rotateX(Math.PI / 2), brass); ring.position.y = 1.32; scene.add(ring);
  const labTex = canvasTex(900, 240, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#e6c886"); gr.addColorStop(0.5, "#b8914a"); gr.addColorStop(1, "#d8b46c"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const R = mulberry(3); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${R() < 0.5 ? "90,60,20" : "255,240,200"},.05)`; g.fillRect(R() * w, R() * h, 40 + R() * 120, 1); }
    g.strokeStyle = "#6a4a1c"; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28);
    g.strokeStyle = "rgba(255,240,200,.55)"; g.lineWidth = 2; g.strokeRect(24, 24, w - 48, h - 48);
    g.textAlign = "center"; g.textBaseline = "middle"; g.font = "700 120px Georgia, 'Times New Roman', serif";
    const txt = "A U D I R A";
    g.fillStyle = "rgba(255,240,200,.75)"; g.fillText(txt, w / 2 + 2, h / 2 + 6);
    g.fillStyle = "#4a3010"; g.fillText(txt, w / 2, h / 2 + 3);
    g.fillStyle = "#6a4a1c"; g.fillRect(70, h / 2 - 2, 70, 4); g.fillRect(w - 140, h / 2 - 2, 70, 4);
  });
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.95, 0.52), new THREE.MeshStandardMaterial({ map: labTex, roughness: 0.32, metalness: 0.75, envMapIntensity: 0.9 }));
  label.position.set(0, 0.64, 6.95); label.rotation.x = -0.11; scene.add(label);
  for (const s of [-1, 1]) { const rv = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), brass); rv.position.set(s * 0.9, 0.64, 6.99); scene.add(rv); }

  // ---------- soil column seen through the glass (strata), ground surface on top
  const strata = canvasTex(1024, 512, (g, w, h) => {
    // v = (y - 1.3) / 3.7, canvas top = v 1
    const yv = (y) => h - ((y - 1.3) / 3.7) * h;
    g.fillStyle = "#5a3f28"; g.fillRect(0, 0, w, h);
    const R = mulberry(12);
    g.fillStyle = "#8f8a82"; g.fillRect(0, yv(1.95), w, h - yv(1.95));
    for (let i = 0; i < 900; i++) { const y = yv(1.3 + R() * 0.65); g.fillStyle = ["#b8b2a6", "#7a746c", "#9a948a", "#d0c8ba"][i % 4]; g.beginPath(); g.ellipse(R() * w, y, 4 + R() * 9, 3 + R() * 6, R() * 3, 0, 6.3); g.fill(); }
    g.fillStyle = "#1e1a18"; g.fillRect(0, yv(2.2), w, yv(1.95) - yv(2.2));
    for (let i = 0; i < 300; i++) { g.fillStyle = "rgba(60,55,50,.6)"; g.fillRect(R() * w, yv(1.95 + R() * 0.25), 3 + R() * 6, 2 + R() * 4); }
    const gr = g.createLinearGradient(0, yv(4.8), 0, yv(2.2)); gr.addColorStop(0, "#8a6440"); gr.addColorStop(1, "#4e3420"); g.fillStyle = gr; g.fillRect(0, 0, w, yv(2.2));
    for (let i = 0; i < 1200; i++) { g.fillStyle = `rgba(${R() < 0.5 ? "40,26,14" : "150,110,70"},.25)`; g.fillRect(R() * w, R() * yv(2.2), 2 + R() * 3, 2 + R() * 3); }
    for (let i = 0; i < 40; i++) { g.strokeStyle = "rgba(200,170,120,.35)"; g.lineWidth = 1.5; const x = R() * w, y = yv(2.3 + R() * 0.8); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y + 20, x + (R() - 0.5) * 30, y + 40); g.stroke(); }
  });
  const colG = new THREE.CylinderGeometry(GR + 0.01, GR + 0.01, 1, 160, 1, true);
  { const p = colG.attributes.position, uv = colG.attributes.uv;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); const y = p.getY(i) > 0 ? H(x * 0.995, z * 0.995) : 1.32; p.setY(i, y); uv.setY(i, (y - 1.3) / 3.7); }
    colG.computeVertexNormals(); }
  const soilCol = new THREE.Mesh(colG, new THREE.MeshStandardMaterial({ map: strata, roughness: 0.9 }));
  soilCol.receiveShadow = true; scene.add(soilCol);

  // cracked-earth texture: tileable Voronoi edges
  const crackTex = canvasTex(512, 512, (g, w, h) => {
    const R = mulberry(1601), NP = 24, P = [];
    for (let i = 0; i < NP; i++) P.push([R() * w, R() * h]);
    const img = g.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let f1 = 1e9, f2 = 1e9;
      for (const [px, py] of P) {
        let dx = Math.abs(x - px), dy = Math.abs(y - py); if (dx > w / 2) dx = w - dx; if (dy > h / 2) dy = h - dy;
        const d = dx * dx + dy * dy; if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
      }
      const e = Math.sqrt(f2) - Math.sqrt(f1);
      const n = 0.92 + 0.08 * hash(x * 0.05, y * 0.05);
      let v = e < 4 ? 0.22 : e < 8 ? 0.22 + (e - 4) / 4 * 0.6 : 0.88 + 0.12 * Math.min(1, e / 30);
      v *= n;
      const i = (y * w + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.round(255 * Math.min(1, v)); img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }, [3, 3]);

  // ground: polar grid
  const NR = 70, NS = 200;
  const gpos = [], guv = [], gidx = [];
  for (let i = 0; i <= NR; i++) for (let j = 0; j < NS; j++) {
    const rr = GR * Math.pow(i / NR, 0.85), a = (j / NS) * Math.PI * 2;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    gpos.push(x, H(x, z), z); guv.push(x / 13 + 0.5, z / 13 + 0.5);
  }
  for (let i = 0; i < NR; i++) for (let j = 0; j < NS; j++) {
    const a = i * NS + j, b = i * NS + (j + 1) % NS, c = (i + 1) * NS + j, d = (i + 1) * NS + (j + 1) % NS;
    gidx.push(a, c, b, b, c, d);
  }
  const gg = new THREE.BufferGeometry();
  gg.setAttribute("position", new THREE.Float32BufferAttribute(gpos, 3));
  gg.setAttribute("uv", new THREE.Float32BufferAttribute(guv, 2));
  gg.setIndex(gidx); gg.computeVertexNormals();
  const GN = gpos.length / 3;
  const gcol = new Float32Array(GN * 3), gdry = new Float32Array(GN), gDist = new Float32Array(GN), gWat = new Float32Array(GN), gBase = new Float32Array(GN * 3);
  const dryA = C(0xdcb47c), dryB = C(0xc49a62), wetC = C(0x5c4128), lushA = C(0x4a3a24), lushB = C(0x3e4a26), tc = new THREE.Color();
  for (let i = 0; i < GN; i++) {
    const x = gpos[i * 3], z = gpos[i * 3 + 2];
    tc.copy(dryA).lerp(dryB, vnoise(x * 1.3 + 4, z * 1.3));
    gBase[i * 3] = tc.r; gBase[i * 3 + 1] = tc.g; gBase[i * 3 + 2] = tc.b;
    gDist[i] = dS(x, z) + (vnoise(x * 2, z * 2) - 0.5) * 0.7;
    const w = water(x, z); gWat[i] = w.edge < 0.45 ? w.dist + Math.max(0, w.edge) * 1.6 : 99;
  }
  gg.setAttribute("color", new THREE.BufferAttribute(gcol, 3));
  gg.setAttribute("aDry", new THREE.BufferAttribute(gdry, 1));
  const UCR = { value: 0.7 };
  const groundM = new THREE.MeshStandardMaterial({ vertexColors: true, map: crackTex, roughness: 0.92 });
  groundM.onBeforeCompile = (sh) => {
    sh.uniforms.uCrack = UCR;
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute float aDry;\nvarying float vDry;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvDry = aDry;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vDry;\nuniform float uCrack;").replace("#include <map_fragment>",
      "#ifdef USE_MAP\nvec4 sampledDiffuseColor = texture2D( map, vMapUv );\ndiffuseColor.rgb *= mix(vec3(1.0), sampledDiffuseColor.rgb, clamp(vDry * uCrack, 0.0, 1.0));\n#endif");
  };
  const ground = new THREE.Mesh(gg, groundM); ground.receiveShadow = true; scene.add(ground);
  let lastG = "";
  function paintGround(t, wr) {
    const key2 = gRad(t).toFixed(3) + "|" + wr.toFixed(3);
    if (key2 === lastG) return; lastG = key2;
    const gr = gRad(t);
    for (let i = 0; i < GN; i++) {
      const g = sm((gr - gDist[i]) / 1.0);
      const wet = gWat[i] < 50 ? sm((wr - gWat[i] + 0.3) / 0.6) : 0;
      tc.setRGB(gBase[i * 3], gBase[i * 3 + 1], gBase[i * 3 + 2]).lerp(wetC, wet * 0.85).lerp(gpos[i * 3 + 2] < -1 ? lushB : lushA, g);
      gcol[i * 3] = tc.r; gcol[i * 3 + 1] = tc.g; gcol[i * 3 + 2] = tc.b;
      gdry[i] = (1 - g) * (1 - 0.8 * wet);
    }
    gg.attributes.color.needsUpdate = true; gg.attributes.aDry.needsUpdate = true;
  }

  // ---------- water: plane over the channels; reveal by distance from the spring
  const WX0 = -3.2, WX1 = 4.2, WZ0 = 1.2, WZ1 = 6.0, WS = 0.05;
  const wnx = Math.round((WX1 - WX0) / WS), wnz = Math.round((WZ1 - WZ0) / WS);
  const wg = new THREE.PlaneGeometry(WX1 - WX0, WZ1 - WZ0, wnx, wnz); wg.rotateX(-Math.PI / 2); wg.translate((WX0 + WX1) / 2, 0, (WZ0 + WZ1) / 2);
  { const p = wg.attributes.position, am = new Float32Array(p.count), ad = new Float32Array(p.count);
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); const w = water(x, z); am[i] = Math.hypot(x, z) < GR - 0.05 ? w.m : 0; ad[i] = w.dist; }
    wg.setAttribute("aMask", new THREE.BufferAttribute(am, 1)); wg.setAttribute("aDist", new THREE.BufferAttribute(ad, 1)); }
  const WU = { uRev: { value: 0 }, uT: { value: 0 }, uDeep: { value: C(0x1f5e66) }, uLite: { value: C(0x9ad8d2) }, uSky: { value: C(0xfff0d8) } };
  const waterM = new THREE.ShaderMaterial({
    uniforms: WU, transparent: true, depthWrite: false,
    vertexShader: `attribute float aMask;attribute float aDist;varying float vM;varying float vD;varying vec3 vW;void main(){vM=aMask;vD=aDist;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: `uniform float uRev,uT;uniform vec3 uDeep,uLite,uSky;varying float vM;varying float vD;varying vec3 vW;
void main(){float m=smoothstep(.3,.62,vM);float front=smoothstep(uRev+.02,uRev-.22,vD);float a=m*front;if(a<.01)discard;
 vec3 V=normalize(cameraPosition-vW);float fr=pow(1.-clamp(V.y,0.,1.),2.2);
 float rip=sin(vD*15.-uT*5.2+sin(vW.x*6.+uT)*1.4)*.5+.5;float rip2=sin(vW.x*11.+vW.z*9.-uT*3.1)*.5+.5;
 vec3 c=mix(uDeep,uLite,.12+.3*rip*rip2+.2*(1.-vM));
 c=mix(c,uSky,fr*.28);
 float edge=smoothstep(.62,.35,vM)*m;c=mix(c,vec3(.92,.97,.96),edge*.5);
 float spark=pow(rip*rip2,10.)*.6;c+=vec3(spark);
 float lead=smoothstep(uRev-.35,uRev,vD)*front;c=mix(c,vec3(.8,.94,.96),lead*.3);
 gl_FragColor=vec4(c,a*(.82+.12*fr));}`,
  });
  const waterMesh = new THREE.Mesh(wg, waterM); waterMesh.position.y = GY - 0.075; waterMesh.renderOrder = 2; scene.add(waterMesh);
  // the spring's own puddle sits on the flat soil around the footprint
  const pg = new THREE.CircleGeometry(0.78, 64); pg.rotateX(-Math.PI / 2);
  { const p = pg.attributes.position, am = new Float32Array(p.count), ad = new Float32Array(p.count);
    for (let i = 0; i < p.count; i++) { const rr = Math.hypot(p.getX(i), p.getZ(i)); am[i] = rr > 0.77 ? 0.2 : 1; ad[i] = rr; }
    pg.setAttribute("aMask", new THREE.BufferAttribute(am, 1)); pg.setAttribute("aDist", new THREE.BufferAttribute(ad, 1)); }
  const puddle = new THREE.Mesh(pg, waterM); puddle.position.set(S[0], GY + 0.03, S[1]); puddle.renderOrder = 2; scene.add(puddle);

  // ---------- footprint impression and the impact ring
  const footTex = canvasTex(256, 384, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const sole = (alpha, blur) => {
      g.filter = `blur(${blur}px)`; g.fillStyle = `rgba(26,14,6,${alpha})`;
      g.beginPath(); g.ellipse(w * 0.5, h * 0.66, w * 0.25, h * 0.27, 0.06, 0, 6.3); g.fill();
      g.beginPath(); g.ellipse(w * 0.53, h * 0.4, w * 0.28, h * 0.17, -0.1, 0, 6.3); g.fill();
      const toes = [[0.36, 0.17, 0.085], [0.5, 0.135, 0.06], [0.61, 0.135, 0.053], [0.7, 0.16, 0.047], [0.77, 0.205, 0.042]];
      for (const [x, y, rr] of toes) { g.beginPath(); g.arc(w * x, h * y, w * rr, 0, 6.3); g.fill(); }
    };
    sole(0.55, 7); sole(0.97, 1.5);
    g.filter = "none";
  });
  const footM = new THREE.MeshBasicMaterial({ map: footTex, transparent: true, depthWrite: false, opacity: 0, polygonOffset: true, polygonOffsetFactor: -2 });
  const foot = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.64), footM);
  foot.rotation.set(-Math.PI / 2, 0, 0.5); foot.position.set(S[0], GY + 0.012, S[1]); foot.renderOrder = 3; scene.add(foot);
  const rimTex = canvasTex(256, 384, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.filter = "blur(6px)"; g.fillStyle = "rgba(250,228,186,.9)";
    g.beginPath(); g.ellipse(w * 0.5, h * 0.62, w * 0.36, h * 0.36, 0.06, 0, 6.3); g.fill();
    g.beginPath(); g.ellipse(w * 0.54, h * 0.3, w * 0.4, h * 0.25, -0.1, 0, 6.3); g.fill(); g.filter = "none";
  });
  const rimM = new THREE.MeshBasicMaterial({ map: rimTex, transparent: true, depthWrite: false, opacity: 0, polygonOffset: true, polygonOffsetFactor: -1 });
  const fRim = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.64), rimM); fRim.rotation.copy(foot.rotation); fRim.position.set(S[0], GY + 0.008, S[1]); fRim.renderOrder = 3; scene.add(fRim);
  const shockM = new THREE.MeshBasicMaterial({ color: 0xe8d2a8, transparent: true, opacity: 0, depthWrite: false });
  const shock = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48).rotateX(-Math.PI / 2), shockM); shock.position.set(S[0], GY + 0.04, S[1]); scene.add(shock);

  // ---------- tree (withered), leaves (dry then fresh)
  const barkTex = canvasTex(128, 256, (g, w, h) => { g.fillStyle = "#6b5846"; g.fillRect(0, 0, w, h); const R = mulberry(8); for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(${R() < 0.5 ? "40,30,22" : "150,130,110"},.4)`; g.lineWidth = 1 + R() * 2; const x = R() * w; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (R() - 0.5) * 12, h); g.stroke(); } });
  const barkM = new THREE.MeshStandardMaterial({ map: barkTex, color: 0xd8c8b4, roughness: 0.9 });
  const RT = mulberry(1616);
  const tips = [];
  const yUp = V(0, 1, 0);
  function branch(a, dir, len, rad, depth) {
    const b = a.clone().addScaledVector(dir, len);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.62, rad, len, 8), barkM);
    m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(yUp, dir); m.castShadow = true; scene.add(m);
    const kn = new THREE.Mesh(new THREE.SphereGeometry(rad * 0.64, 8, 6), barkM); kn.position.copy(b); scene.add(kn);
    if (depth === 3) { tips.push({ p: b, dir }); return; }
    const n = depth === 0 ? 3 : 2 + (RT() < 0.45 ? 1 : 0);
    for (let k = 0; k < n; k++) {
      const yaw = (k / n) * Math.PI * 2 + RT() * 1.2 + depth;
      const tilt = 0.5 + RT() * 0.35;
      const side = V(Math.cos(yaw), 0, Math.sin(yaw));
      const nd = dir.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(side, Math.sin(tilt)).normalize();
      nd.y = Math.max(nd.y, 0.25); nd.normalize();
      branch(b, nd, len * (0.7 + RT() * 0.12), rad * 0.62, depth + 1);
    }
  }
  const tBase = V(TREE[0], H(TREE[0], TREE[1]) - 0.05, TREE[1]);
  branch(tBase, V(0.06, 1, 0.04).normalize(), 2.1, 0.22, 0);
  // roots flaring into the soil
  for (let k = 0; k < 4; k++) { const a = k * 1.6 + 0.3; const rt = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.7, 6), barkM); rt.position.set(TREE[0] + Math.cos(a) * 0.22, tBase.y + 0.08, TREE[1] + Math.sin(a) * 0.22); rt.rotation.set(Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2); scene.add(rt); }

  const leafShape = new THREE.Shape(); leafShape.moveTo(0, 0); leafShape.quadraticCurveTo(0.09, 0.08, 0, 0.24); leafShape.quadraticCurveTo(-0.09, 0.08, 0, 0);
  const leafG = new THREE.ShapeGeometry(leafShape, 4);
  const leafMat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.7 });
  const NLG = tips.length * 14, NLD = 64;
  const leafGreen = new THREE.InstancedMesh(leafG, leafMat, NLG); leafGreen.castShadow = true; leafGreen.frustumCulled = false; scene.add(leafGreen);
  const leafDry = new THREE.InstancedMesh(leafG, leafMat.clone(), NLD); leafDry.castShadow = true; leafDry.frustumCulled = false; scene.add(leafDry);
  const RL = mulberry(1617);
  const LG = [], LD = [];
  const lgCols = [C(0x5f9a3a), C(0x77b04a), C(0x4c8a32), C(0x8cc25a)];
  tips.forEach((tp) => {
    for (let k = 0; k < 14; k++) {
      const p = tp.p.clone().add(V((RL() - 0.5) * 0.9, (RL() - 0.3) * 0.6, (RL() - 0.5) * 0.9));
      LG.push({ p, e: new THREE.Euler(RL() * 6.3, RL() * 6.3, RL() * 6.3), s: 0.85 + RL() * 0.6, d: dS(p.x, p.z) + RL() * 1.3, c: lgCols[k % 4] });
    }
  });
  const ldCols = [C(0x8a6a3a), C(0x9a7440), C(0x6e5434), C(0xa88850)];
  for (let i = 0; i < NLD; i++) {
    const tp = tips[i % tips.length];
    const p = tp.p.clone().add(V((RL() - 0.5) * 0.6, -RL() * 0.15, (RL() - 0.5) * 0.6));
    const a = RL() * 6.3, rr = 0.4 + RL() * 2.0;
    const lx = TREE[0] + Math.cos(a) * rr, lz = TREE[1] + Math.sin(a) * rr;
    LD.push({ p, e: new THREE.Euler(2.4 + RL() * 0.6, RL() * 6.3, RL() * 0.6), land: V(lx, H(lx, lz) + 0.02, lz), le: new THREE.Euler(-Math.PI / 2, 0, RL() * 6.3), tf: FALL0 + 0.1 + i * 0.105 + RL() * 0.2, sw: RL() * 6.3, c: ldCols[i % 4], d: dS(lx, lz) });
  }
  const fm = new THREE.Matrix4(), tq = new THREE.Quaternion(), tv = new THREE.Vector3(), ts = new THREE.Vector3(), te = new THREE.Euler();
  function updLeaves(t) {
    LG.forEach((o, i) => {
      const g = t < BU5 ? 0 : sm((gRad(t) - o.d) / 1.4);
      const sw = Math.sin(t * 1.7 + i) * 0.08;
      te.set(o.e.x + sw, o.e.y, o.e.z);
      leafGreen.setMatrixAt(i, fm.compose(o.p, tq.setFromEuler(te), ts.setScalar(Math.max(0.0001, o.s * back(g, 1.2)))));
      leafGreen.setColorAt(i, o.c);
    });
    leafGreen.instanceMatrix.needsUpdate = true; if (leafGreen.instanceColor) leafGreen.instanceColor.needsUpdate = true;
    LD.forEach((o, i) => {
      const inS1 = t < K.s2 - 0.05;
      const u = inS1 ? 0 : clamp01((t - o.tf) / 1.8);
      const cover = t > BU5 ? sm((gRad(t) - o.d) / 0.8) : 0;
      if (u <= 0) { tv.copy(o.p); te.copy(o.e); te.x += Math.sin(t * 2 + i) * 0.05; }
      else {
        const e = u * u * (3 - 2 * u);
        tv.copy(o.p).lerp(o.land, e); tv.x += Math.sin(u * 7 + o.sw) * 0.18 * (1 - u); tv.z += Math.cos(u * 6 + o.sw) * 0.14 * (1 - u);
        te.set(o.e.x + (o.le.x - o.e.x) * e + Math.sin(u * 9) * 0.6 * (1 - u), o.e.y, o.e.z + (o.le.z - o.e.z) * e);
      }
      leafDry.setMatrixAt(i, fm.compose(tv, tq.setFromEuler(te), ts.setScalar(Math.max(0.0001, 1.05 * (1 - cover)))));
      leafDry.setColorAt(i, o.c);
    });
    leafDry.instanceMatrix.needsUpdate = true; if (leafDry.instanceColor) leafDry.instanceColor.needsUpdate = true;
  }

  // ---------- mat and lamp (the presence)
  const matTex = canvasTex(512, 320, (g, w, h) => {
    g.fillStyle = "#c8a468"; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) {
      const o = ((x + y) / 16) % 2;
      g.fillStyle = o ? "#b48c50" : "#dcb878"; g.fillRect(x + (o ? 0 : 2), y + (o ? 2 : 0), o ? 16 : 12, o ? 12 : 16);
    }
    g.strokeStyle = "#7a2e22"; g.lineWidth = 14; g.strokeRect(22, 22, w - 44, h - 44);
    g.strokeStyle = "#2e4a3a"; g.lineWidth = 5; g.strokeRect(42, 42, w - 84, h - 84);
    g.fillStyle = "#7a2e22"; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(w / 2 - 70 + i * 35, h / 2 - 18); g.lineTo(w / 2 - 52 + i * 35, h / 2); g.lineTo(w / 2 - 70 + i * 35, h / 2 + 18); g.lineTo(w / 2 - 88 + i * 35, h / 2); g.fill(); }
  });
  const matM = new THREE.MeshStandardMaterial({ map: matTex, roughness: 0.95 });
  const mat = new THREE.Mesh(new THREE.BoxGeometry(MAT.w, 0.035, MAT.d), matM);
  mat.position.set(MAT.x, H(MAT.x, MAT.z) + 0.03, MAT.z); mat.rotation.y = MAT.rot; mat.receiveShadow = true; mat.castShadow = true; scene.add(mat);
  // fringe
  const fringeM = new THREE.MeshStandardMaterial({ color: 0xd8bc84, roughness: 1 });
  for (const s of [-1, 1]) for (let k = 0; k < 12; k++) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.01, 0.09), fringeM);
    const lx = s * (MAT.w / 2 + 0.04), lz = -MAT.d / 2 + 0.06 + k * (MAT.d - 0.12) / 11;
    f.position.set(MAT.x + lx * Math.cos(MAT.rot) + lz * Math.sin(MAT.rot), mat.position.y, MAT.z - lx * Math.sin(MAT.rot) + lz * Math.cos(MAT.rot)); f.rotation.y = MAT.rot + Math.PI / 2; scene.add(f);
  }
  const lampG = new THREE.Group(); lampG.position.set(LAMP[0], H(LAMP[0], LAMP[1]), LAMP[1]); lampG.rotation.y = 0.6; scene.add(lampG);
  const stone = new THREE.Mesh(blobGeo(0.2, 90, 10, 0.1), new THREE.MeshStandardMaterial({ color: 0x8a8070, roughness: 0.8 })); stone.scale.set(1.2, 0.45, 1); stone.position.y = 0.06; stone.castShadow = true; lampG.add(stone);
  const lampM = new THREE.MeshStandardMaterial({ color: 0xa8603a, roughness: 0.6 });
  const lampB = new THREE.Mesh(blobGeo(0.13, 91, 14, 0.03), lampM); lampB.scale.set(1.25, 0.55, 1); lampB.position.y = 0.2; lampB.castShadow = true; lampG.add(lampB);
  const spout = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.2, 8).rotateZ(-Math.PI / 2 + 0.25), lampM); spout.position.set(0.19, 0.23, 0); lampG.add(spout);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.016, 6, 12, Math.PI * 1.2), lampM); handle.position.set(-0.17, 0.24, 0); handle.rotation.z = Math.PI * 0.45; lampG.add(handle);
  const flameM = new THREE.MeshBasicMaterial({ color: 0xffd890, transparent: true });
  const flame = new THREE.Mesh(blobGeo(0.032, 92, 8, 0.03), flameM); flame.scale.set(1, 2.1, 1); flame.position.set(0.28, 0.32, 0); lampG.add(flame);
  const glowTex = canvasTex(64, 64, (g, w) => { const gr = g.createRadialGradient(32, 32, 1, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const fGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffb860, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5 }));
  fGlow.scale.setScalar(0.42); fGlow.position.copy(flame.position); lampG.add(fGlow);
  const flameW = new THREE.Vector3();

  // ---------- houses (the family): three on the hill, three more rise when the family doubles
  const adobe = new THREE.MeshStandardMaterial({ color: 0xdcc6a0, roughness: 0.9 });
  const adobe2 = new THREE.MeshStandardMaterial({ color: 0xcfb38a, roughness: 0.9 });
  const doorM = new THREE.MeshStandardMaterial({ color: 0x1e1610, roughness: 1 });
  const HP = [[-3.1, -2.7, 1.0], [0.25, -3.75, 1.1], [3.15, -2.85, 0.95], [-4.5, -0.95, 0.85], [-1.6, -4.85, 0.8], [4.55, -1.05, 0.85]];
  const houses = HP.map(([x, z, s], k) => {
    const G = new THREE.Group(); const base = new THREE.Group(); G.add(base);
    G.position.set(x, H(x, z) - 0.05, z); G.rotation.y = Math.atan2(0 - x, 7 - z); G.scale.setScalar(s); scene.add(G);
    const w = 0.82, h = 0.62 + (k % 3) * 0.08, d = 0.72;
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), k % 2 ? adobe2 : adobe); body.position.y = h / 2; body.castShadow = body.receiveShadow = true; base.add(body);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.06, d + 0.08), adobe2); roof.position.y = h + 0.03; roof.castShadow = true; base.add(roof);
    if (k % 3 === 1) { const dm = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 8, 0, 6.3, 0, 1.6), adobe); dm.position.set(0.12, h + 0.05, -0.05); dm.castShadow = true; base.add(dm); }
    else { const par = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.3), adobe); par.position.set(-0.2, h + 0.15, -0.12); par.castShadow = true; base.add(par); }
    const door = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.3), doorM); door.position.set(-0.18, 0.15, d / 2 + 0.003); base.add(door);
    const wm = new THREE.MeshStandardMaterial({ color: 0x1a1410, emissive: 0xffb050, emissiveIntensity: 0, roughness: 1 });
    for (const [wx, wy] of [[0.14, h * 0.62], [0.3, h * 0.62]]) { const wi = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.13), wm); wi.position.set(wx, wy, d / 2 + 0.003); base.add(wi); }
    const dg = new THREE.MeshStandardMaterial({ color: 0x1a1410, emissive: 0xffa040, emissiveIntensity: 0, roughness: 1 });
    door.material = dg;
    return { G, base, wm, dg, k, s };
  });
  function houseLight(k, t) {
    if (k >= 3) return t > tDbl ? ramp(t, tDbl + 0.55 + (k - 3) * 0.3, tDbl + 0.85 + (k - 3) * 0.3) : 0;
    if (t < K.s2 - 0.05) return 0.85 * (1 - ramp(t, tFam1 + 0.1 + k * 0.22, tFam1 + 0.3 + k * 0.22));
    if (t < K.s6) return t < K.s3 ? 0.85 * (1 - ramp(t, tFam2 + k * 0.35, tFam2 + 0.25 + k * 0.35)) : 0;
    return ramp(t, tBack + 0.5 + k * 0.45, tBack + 0.75 + k * 0.45);
  }
  const houseRise = (k, t) => (k < 3 ? 1 : back(clamp01((t - tDbl - (k - 3) * 0.3) / 0.6), 1.6));

  // ---------- shrubs, moss, grass, flowers, rocks
  const RO = mulberry(1618);
  const free = (x, z, pad = 0) => {
    const rr = Math.hypot(x, z); if (rr > GR - 0.35) return false;
    if (water(x, z).edge < 0.18 + pad) return false;
    if (Math.hypot((x - MAT.x) / 1.0, (z - MAT.z) / 0.7) < 1.05 + pad) return false;
    if (Math.hypot(x - LAMP[0], z - LAMP[1]) < 0.35 + pad) return false;
    if (Math.hypot(x - TREE[0], z - TREE[1]) < 0.35) return false;
    for (const [hx, hz, hs] of HP) if (Math.hypot(x - hx, z - hz) < 0.62 * hs + pad) return false;
    return true;
  };
  const rand = (pad) => { for (let n = 0; n < 200; n++) { const a = RO() * 6.283, rr = Math.sqrt(RO()) * (GR - 0.3); const x = Math.cos(a) * rr, z = Math.sin(a) * rr; if (free(x, z, pad)) return [x, z]; } return [0, -5.5]; };
  const twigG = new THREE.CylinderGeometry(0.008, 0.022, 0.6, 5).translate(0, 0.3, 0);
  const NSH = 16, NTW = 8;
  const twigs = new THREE.InstancedMesh(twigG, new THREE.MeshStandardMaterial({ roughness: 0.85 }), NSH * NTW); twigs.castShadow = true; twigs.frustumCulled = false; scene.add(twigs);
  const shLeaf = new THREE.InstancedMesh(blobGeo(0.09, 95, 8, 0.1), new THREE.MeshStandardMaterial({ roughness: 0.75 }), NSH * NTW); shLeaf.castShadow = true; shLeaf.frustumCulled = false; scene.add(shLeaf);
  const SH = [];
  for (let i = 0; i < NSH; i++) { const [x, z] = rand(0.15); SH.push({ x, z, y: H(x, z), d: dS(x, z) + RO() * 0.6, s: 0.8 + RO() * 0.6, yaw: RO() * 6.3 }); }
  const twDry = C(0x7a5a38), twGreen = C(0x4f7a30), shLc = [C(0x5a9a3c), C(0x74b04c), C(0x9cc860)];
  function updShrubs(t) {
    let n = 0;
    for (const s of SH) {
      const g = t < BU5 ? 0 : sm((gRad(t) - s.d) / 1.2);
      const wilt = t >= K.s2 && t < BU5 ? ramp(t, A("s2:Ia#2"), A("s2:bencana") + 0.5) : t < K.s2 ? 0.6 : 0;
      for (let k = 0; k < NTW; k++) {
        const yaw = s.yaw + (k / NTW) * 6.283;
        const pitch = (0.75 + 0.35 * wilt) * (1 - g) + 0.32 * g + (k % 3) * 0.08 + Math.sin(t * 1.3 + k) * 0.03 * g;
        te.set(pitch, yaw, 0, "YXZ");
        const sc = s.s * (0.8 + 0.4 * g) * (1 - 0.25 * wilt * (1 - g));
        tv.set(s.x, s.y - 0.02, s.z);
        twigs.setMatrixAt(n, fm.compose(tv, tq.setFromEuler(te), ts.set(sc, sc * (0.9 + (k % 2) * 0.2), sc)));
        twigs.setColorAt(n, tc.copy(twDry).lerp(twGreen, g));
        // leaf blob at the twig tip
        const L = 0.6 * sc * (0.9 + (k % 2) * 0.2);
        const dir = V(0, 1, 0).applyEuler(te);
        const lp = V(s.x, s.y - 0.02, s.z).addScaledVector(dir, L);
        shLeaf.setMatrixAt(n, fm.compose(lp, tq.identity(), ts.setScalar(Math.max(0.0001, back(g, 1.3) * (1 + (k % 3) * 0.25)))));
        shLeaf.setColorAt(n, shLc[k % 3]);
        n++;
      }
    }
    twigs.instanceMatrix.needsUpdate = true; twigs.instanceColor.needsUpdate = true;
    shLeaf.instanceMatrix.needsUpdate = true; shLeaf.instanceColor.needsUpdate = true;
  }
  // rocks
  const rockM = new THREE.MeshStandardMaterial({ color: 0x9a8e7e, roughness: 0.85 });
  for (let i = 0; i < 20; i++) { const [x, z] = rand(0.05); const s = 0.05 + RO() * 0.13; const rk = new THREE.Mesh(blobGeo(1, 400 + i, 10, 0.16), rockM); rk.scale.set(s * 1.3, s * 0.7, s); rk.position.set(x, H(x, z) + s * 0.2, z); rk.rotation.y = RO() * 6; rk.castShadow = rk.receiveShadow = true; scene.add(rk); }
  // pebbles along the water
  for (let i = 0; i < 46; i++) {
    const run = RUNS[i % 2], u = RO() * (run.length - 1.01), j = Math.floor(u), f = u - j;
    const x0 = run[j][0] + (run[j + 1][0] - run[j][0]) * f, z0 = run[j][1] + (run[j + 1][1] - run[j][1]) * f;
    const side = (RO() < 0.5 ? -1 : 1) * (0.3 + RO() * 0.12), dx = run[j + 1][1] - run[j][1], dz = -(run[j + 1][0] - run[j][0]), L = Math.hypot(dx, dz);
    const x = x0 + dx / L * side, z = z0 + dz / L * side; if (Math.hypot(x, z) > GR - 0.2) continue;
    const s = 0.04 + RO() * 0.06; const pb = new THREE.Mesh(blobGeo(1, 500 + i, 8, 0.15), new THREE.MeshStandardMaterial({ color: [0xc4b8a6, 0x8a8278, 0xa89c8a][i % 3], roughness: 0.6 }));
    pb.scale.set(s * 1.4, s * 0.6, s); pb.position.set(x, H(x, z) + s * 0.25, z); pb.castShadow = true; scene.add(pb);
  }
  // moss cushions
  const NM = 2400, moss = new THREE.InstancedMesh(blobGeo(1, 96, 10, 0.15), new THREE.MeshStandardMaterial({ roughness: 0.95 }), NM);
  moss.receiveShadow = true; moss.castShadow = true; moss.frustumCulled = false; scene.add(moss);
  const MS = []; const mCols = [C(0x4f7d2c), C(0x5f9236), C(0x3f6a26), C(0x7aa844)];
  for (let i = 0; i < NM; i++) { const [x, z] = rand(-0.08); MS.push({ x, z, y: H(x, z), d: dS(x, z) + RO() * 0.9, s: 0.05 + RO() * 0.07, c: mCols[i % 4], r: RO() * 6 }); }
  const NGR = 1500, grass = new THREE.InstancedMesh(new THREE.ConeGeometry(0.018, 1, 4).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ roughness: 0.8 }), NGR);
  grass.castShadow = true; grass.frustumCulled = false; scene.add(grass);
  const GS = []; const grCols = [C(0x6aa83e), C(0x88bc52), C(0x4f8a30)];
  for (let i = 0; i < NGR; i++) { const [x, z] = rand(-0.05); GS.push({ x, z, y: H(x, z), d: dS(x, z) + 0.4 + RO() * 1.0, h: 0.18 + RO() * 0.3, tx: (RO() - 0.5) * 0.5, tz: (RO() - 0.5) * 0.5, c: grCols[i % 3] }); }
  const NFL = 160, flowers = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshStandardMaterial({ roughness: 0.6, emissive: 0x000000 }), NFL);
  flowers.frustumCulled = false; flowers.castShadow = true; scene.add(flowers);
  const FS = []; const flCols = [C(0xf6f0e0), C(0xf2c94c), C(0xe88aa0), C(0xb8a0e8)];
  for (let i = 0; i < NFL; i++) { const [x, z] = rand(0); FS.push({ x, z, y: H(x, z), d: dS(x, z) + 1.4 + RO() * 1.2, h: 0.14 + RO() * 0.18, c: flCols[i % 4] }); }
  const stems = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.006, 0.008, 1, 4).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: 0x4f7a30 }), NFL); stems.frustumCulled = false; scene.add(stems);
  let lastV = "";
  function updGreen(t) {
    const gr = gRad(t), key3 = gr.toFixed(3) + (gr > 0 ? Math.floor(t * 30) : "");
    if (key3 === lastV) return; lastV = key3;
    MS.forEach((o, i) => { const g = sm((gr - o.d) / 0.9); te.set(0, o.r, 0); moss.setMatrixAt(i, fm.compose(tv.set(o.x, o.y - 0.02, o.z), tq.setFromEuler(te), ts.set(o.s * g + 1e-4, o.s * 0.42 * g + 1e-4, o.s * 0.9 * g + 1e-4))); moss.setColorAt(i, o.c); });
    moss.instanceMatrix.needsUpdate = true; moss.instanceColor.needsUpdate = true;
    GS.forEach((o, i) => { const g = sm((gr - o.d) / 1.1); te.set(o.tx + Math.sin(t * 1.6 + i * 0.37) * 0.06, 0, o.tz); grass.setMatrixAt(i, fm.compose(tv.set(o.x, o.y - 0.01, o.z), tq.setFromEuler(te), ts.set(g + 1e-4, o.h * g + 1e-4, g + 1e-4))); grass.setColorAt(i, o.c); });
    grass.instanceMatrix.needsUpdate = true; grass.instanceColor.needsUpdate = true;
    FS.forEach((o, i) => { const g = sm((gr - o.d) / 0.8); const hh = o.h * g; stems.setMatrixAt(i, fm.compose(tv.set(o.x, o.y, o.z), tq.identity(), ts.set(1, hh + 1e-4, 1))); flowers.setMatrixAt(i, fm.compose(tv.set(o.x, o.y + hh, o.z), tq.identity(), ts.setScalar(back(g, 1.5) + 1e-4))); flowers.setColorAt(i, o.c); });
    stems.instanceMatrix.needsUpdate = true; flowers.instanceMatrix.needsUpdate = true; flowers.instanceColor.needsUpdate = true;
  }

  // ---------- spring: droplets, water column, dust at the impact, motes in the window light
  const ND = 240, drops = pts(scene, ND, { color: 0xbfeef0, size: 0.07, add: false, opacity: 0.95 });
  const RD = mulberry(1619); const DS = []; for (let i = 0; i < ND; i++) DS.push({ a: RD() * 6.283, sp: 0.15 + RD() * 0.55, v: 0.7 + RD() * 0.6, p: 0.55 + RD() * 0.5, ph: RD() });
  const colM = new THREE.MeshStandardMaterial({ color: 0xbfe8ec, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.62, emissive: 0x2a5a60, emissiveIntensity: 0.25 });
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.09, 1, 14, 1, true).translate(0, 0.5, 0), colM); column.position.set(S[0], GY - 0.06, S[1]); scene.add(column);
  const ND2 = 60, dust = pts(scene, ND2, { color: 0xc8a878, size: 0.09, add: false, opacity: 0.7 });
  const DU = []; for (let i = 0; i < ND2; i++) DU.push({ a: RD() * 6.283, v: 0.6 + RD() * 1.2, up: 0.3 + RD() * 0.7 });
  const NMO = 110, motes = pts(scene, NMO, { color: 0xffe2b0, size: 0.09, add: true, opacity: 0.32 });
  const MOS = []; for (let i = 0; i < NMO; i++) MOS.push([(RD() - 0.5) * 16, 2 + RD() * 15, (RD() - 0.5) * 14, RD() * 6.3, 0.1 + RD() * 0.2]);
  // springBurst(t): 0 before, jet strength after a burst time
  const springOn = (t) => (t >= BU1 - 0.02 && t < K.s2 - 0.05) ? t - BU1 : t >= BU5 - 0.02 ? t - BU5 : -1;
  const stompAge = (t) => (t >= ST1 && t < K.s2 - 0.05) ? t - ST1 : t >= ST5 ? t - ST5 : -1;

  // ---------- birds (s7-s8)
  const birdM = new THREE.MeshStandardMaterial({ color: 0x6a4a3a, roughness: 0.7 });
  const breastM = new THREE.MeshStandardMaterial({ color: 0xd8884a, roughness: 0.7 });
  const birds = [0, 1].map((k) => {
    const g = new THREE.Group();
    const b = new THREE.Mesh(blobGeo(0.09, 97 + k, 10, 0.04), birdM); b.scale.set(0.8, 0.75, 1.35); g.add(b);
    const br = new THREE.Mesh(blobGeo(0.07, 99, 8, 0.04), breastM); br.position.set(0, -0.02, 0.05); g.add(br);
    const hd = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), birdM); hd.position.set(0, 0.07, 0.1); g.add(hd);
    const bk = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.05, 5).rotateX(Math.PI / 2), C2(0xd8a040)); bk.position.set(0, 0.065, 0.17); g.add(bk);
    const wL = new THREE.Mesh(blobGeo(0.07, 100, 8, 0.04).scale(1.6, 0.25, 1).translate(0.09, 0, 0), birdM), wR = wL.clone(); wR.scale.x = -1;
    g.add(wL); g.add(wR); g.scale.setScalar(1.3); scene.add(g); g.visible = false; return { g, wL, wR, k };
  });
  function C2(c) { return new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 }); }

  // ---------- glass bell jar: fresnel, a soft window reflection and condensation
  const dropTex = canvasTex(1024, 1024, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const R = mulberry(1620);
    for (let i = 0; i < 1300; i++) {
      const x = R() * w, y = R() * h, rr = 1.5 + Math.pow(R(), 3) * 7;
      if (x < rr + 2 || x > w - rr - 2 || y < rr + 2 || y > h - rr - 2) continue;
      const gr = g.createRadialGradient(x - rr * 0.3, y - rr * 0.35, 0, x, y, rr);
      gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(0.35, "rgba(255,255,255,.25)"); gr.addColorStop(0.8, "rgba(200,220,225,.35)"); gr.addColorStop(1, "rgba(120,140,150,.0)");
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 6.3); g.fill();
    }
    for (let i = 0; i < 0; i++) { const x = 30 + R() * (w - 60), y0 = R() * h * 0.5, L = 120 + R() * 300; g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 2 + R() * 2; g.beginPath(); g.moveTo(x, y0); g.bezierCurveTo(x + 6, y0 + L / 3, x - 6, y0 + L * 0.66, x + 2, Math.min(h - 10, y0 + L)); g.stroke(); }
  });
  const GU = { uCond: { value: 0 }, uT: { value: 0 }, uDrops: { value: dropTex }, uWin: { value: V(-0.55, 0.42, 0.72).normalize() }, uRefl: { value: 1 } };
  const glassM = new THREE.ShaderMaterial({
    uniforms: GU, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: `varying vec3 vN;varying vec3 vP;varying vec2 vUv;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vP=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: `uniform float uCond,uT,uRefl;uniform sampler2D uDrops;uniform vec3 uWin;varying vec3 vN;varying vec3 vP;varying vec2 vUv;
void main(){vec3 N=normalize(vN);vec3 I=normalize(vP-cameraPosition);if(!gl_FrontFacing)N=-N;
 float ndv=abs(dot(N,-I));float fr=pow(1.-ndv,3.);
 vec3 R=reflect(I,N);
 // a soft four-pane window seen in the glass
 float az=atan(R.x,R.z),el=asin(clamp(R.y,-1.,1.));float waz=atan(uWin.x,uWin.z),wel=asin(uWin.y);
 vec2 q=vec2((az-waz)/.32,(el-wel)/.3);
 float pane=smoothstep(1.,.86,abs(q.x))*smoothstep(1.,.86,abs(q.y));
 float bars=smoothstep(.03,.07,abs(q.x))*smoothstep(.03,.07,abs(q.y));
 float win=pane*bars;
 // vertical sheen bands of a blown-glass cylinder
 float band=smoothstep(.25,.0,abs(ndv-.32))*.5+smoothstep(.12,.0,abs(ndv-.12))*.6;
 vec4 d=texture2D(uDrops,fract(vUv*vec2(12.,4.4)+vec2(0.,uT*.002)));
 float a=.03+fr*.22+band*.06*uRefl+win*.22*uRefl+d.a*uCond*.5;
 vec3 c=mix(vec3(.8,.9,.92),vec3(1.,.96,.88),win);
 c=mix(c,vec3(.94,.97,.98),d.a*uCond);
 c+=vec3(.06,.07,.06)*band;
 gl_FragColor=vec4(c,clamp(a,0.,.7));}`,
  });
  const jarSide = new THREE.Mesh(new THREE.CylinderGeometry(JR, JR, JH - 1.3, 128, 1, true), glassM); jarSide.position.y = (JH + 1.3) / 2; jarSide.renderOrder = 10; scene.add(jarSide);
  const jarTop = new THREE.Mesh(new THREE.SphereGeometry(JR, 128, 32, 0, Math.PI * 2, 0, Math.PI / 2), glassM); jarTop.position.y = JH; jarTop.renderOrder = 10; scene.add(jarTop);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 14), new THREE.MeshStandardMaterial({ color: 0xc8dcdc, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.6 })); knob.position.y = JH + JR + 0.3; scene.add(knob);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(JR, 0.05, 8, 128).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xd8ecec, roughness: 0.1, transparent: true, opacity: 0.5 })); lip.position.y = 1.45; scene.add(lip);

  // ---------- camera
  const CAM = track([
    [0, 3.2, 9.8, 12.6, 0.0, 3.2, 0.6],
    [A("s1:keluarganya"), 2.4, 9.2, 11.4, 0.0, 3.3, 0.4],
    [ST1 - 0.3, 2.4, 7.4, 8.8, 0.8, 2.7, 1.6],
    [BU1 + 0.4, 2.7, 7.6, 9.0, 0.9, 2.9, 1.7],
    [K.s2 - 0.1, 3.8, 9.8, 11.8, 0.8, 3.2, 1.4],
    [K.s2 + 0.25, 13, 12.5, 40, 0, 5.6, 0],
    [FALL0 - 0.6, 6, 11.5, 36, -0.4, 5.4, 0],
    [FALL0 + 1.0, -4.4, 9.4, 14.6, -1.3, 4.6, 0.2],
    [A("s2:Ia#2") + 0.4, -1.5, 11.4, 12.4, -0.4, 2.8, 0.4],
    [A("s2:bencana") + 0.4, 1.8, 11.6, 11.6, 0.2, 2.8, -0.2],
    [tFam2 - 0.3, 2.0, 9.0, 9.2, 0.2, 3.6, -2.4],
    [K.s3 - 0.2, 0.4, 8.6, 8.2, 0.1, 3.8, -2.8],
    [K.s3 + 0.6, 3.6, 7.2, 8.4, -0.7, 3.2, 1.0],
    [A("s3:ya"), 2.6, 6.6, 7.4, -0.75, 3.1, 1.0],
    [K.s4 - 0.2, 1.8, 6.3, 6.8, -0.8, 3.0, 1.0],
    [K.s4 + 0.8, -6.5, 10.2, 11.5, -0.7, 3.0, 0.8],
    [A("s4:berhenti"), -3.6, 9.6, 12.6, -0.5, 3.0, 0.8],
    [K.s5 - 0.2, -1.2, 8.8, 11.4, 0.2, 3.0, 1.3],
    [ST5 - 0.35, 2.3, 7.4, 8.8, 0.8, 2.7, 1.6],
    [BU5 + 0.4, 2.6, 7.8, 9.4, 0.9, 2.9, 1.7],
    [A("s5:Kesembuhan") - 0.3, 5.2, 9.0, 12.8, 0.9, 3.3, 1.6],
    [K.s6 - 0.2, 3.5, 9.6, 14.2, 0.4, 3.6, 0.6],
    [tBack + 0.3, 0.8, 10.6, 14.0, 0.0, 3.9, -1.6],
    [tDbl + 1.0, -2.8, 11.2, 14.8, 0.0, 3.9, -1.6],
    [K.s7 - 0.2, -5.6, 11.4, 15.8, -0.6, 4.2, -0.4],
    [K.s7 + 2.6, -4.8, 8.8, 11.0, -1.4, 5.0, 0.4],
    [A("s7:sebaik-baik"), -2.6, 10.4, 11.4, -1.4, 5.2, 0.4],
    [K.s8 - 0.2, 0.0, 12.4, 14.0, -0.6, 5.0, 0.0],
    [K.s8 + 3.0, 6.0, 12.0, 36.0, 0.0, 5.8, 0.0],
    [A("s8:Hal") - 0.4, 3.0, 10.4, 32.0, 0.0, 5.2, 0.0],
    [A("s8:Kisah") - 0.6, 1.4, 3.6, 21.0, 0.0, 2.6, 0.0],
    [K.end, 0.5, 2.8, 19.4, 0.0, 2.25, 0.0],
    [K.dur, 0.4, 2.7, 19.0, 0.0, 2.2, 0.0],
  ]);

  return (t) => {
    const m = mood(t);
    // time-lapse in s6: the window light sweeps across twice (days passing)
    const tl6 = clamp01((t - (K.s6 - 0.2)) / (K.s7 - K.s6 + 0.2));
    const sweep = t > K.s6 - 0.2 && t < K.s7 ? Math.sin(tl6 * Math.PI * 2) * 38 * Math.sin(tl6 * Math.PI) : 0;
    const az = (m.az + sweep) * Math.PI / 180, el = m.el * Math.PI / 180;
    hemi.color.copy(m.hs); hemi.groundColor.copy(m.hg); hemi.intensity = m.hi;
    key.color.copy(m.kc); key.intensity = m.ki * (1 - 0.18 * Math.abs(Math.sin(tl6 * Math.PI * 2)) * (sweep !== 0 ? 1 : 0));
    key.position.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(60).add(V(0, 4, 0)); key.target.position.set(0, 4, 0);
    fill.intensity = m.fi;
    scene.background.copy(m.fog); scene.fog.color.copy(m.fog); r.toneMappingExposure = m.exp;
    winM.color.setRGB(0.75 + m.ki * 0.09, 0.72 + m.ki * 0.08, 0.66 + m.ki * 0.07);

    // lamp flicker
    const fl = 0.86 + 0.08 * Math.sin(t * 17.3) * Math.sin(t * 5.1) + 0.06 * Math.sin(t * 31.7);
    flame.getWorldPosition(flameW);
    lampL.position.copy(flameW).add(V(0, 0.15, 0)); lampL.intensity = m.lamp * fl;
    flame.scale.set(1, 2.1 * (0.92 + 0.1 * Math.sin(t * 13)), 1);
    fGlow.material.opacity = 0.28 + 0.08 * m.lamp * fl / 5.5;

    // ground, water, cracks
    const wr = rev(t);
    UCR.value = t < K.s2 ? 0.75 : t < BU5 ? 0.75 + 0.25 * ramp(t, A("s2:setan"), A("s2:bencana") + 0.6) : 1;
    paintGround(t, wr);
    WU.uRev.value = wr; WU.uT.value = t; waterMesh.visible = puddle.visible = wr > 0.01;
    WU.uSky.value.copy(m.kc).lerp(C(0xffffff), 0.3);

    // footprint and shock ring
    const sa = stompAge(t);
    const fpOn = sa >= 0;
    footM.opacity = fpOn ? (0.9 * clamp01(sa / 0.05)) * (1 - 0.4 * clamp01(wr / 0.7)) : 0;
    rimM.opacity = footM.opacity * 0.8;
    const fpS = fpOn ? 1 + 0.25 * (1 - eout(sa / 0.25)) : 1; foot.scale.set(fpS, fpS, 1);
    shockM.opacity = fpOn ? 0.3 * (1 - clamp01(sa / 0.7)) : 0; shock.scale.setScalar(0.2 + 1.6 * eout(sa / 0.7));
    for (let i = 0; i < ND2; i++) {
      const o = DU[i];
      if (!fpOn || sa > 1.4) { dust.pos[i * 3 + 1] = -99; continue; }
      const u = sa, rr = 0.2 + o.v * eout(u / 0.9) * 0.9;
      dust.pos[i * 3] = S[0] + Math.cos(o.a) * rr; dust.pos[i * 3 + 2] = S[1] + Math.sin(o.a) * rr;
      dust.pos[i * 3 + 1] = GY + 0.05 + o.up * Math.sin(Math.min(Math.PI, u * 2.6)) * 0.45 * Math.exp(-u * 1.2);
      const fade = 1 - clamp01(u / 1.4); dust.col[i * 3] = 0.78 * fade; dust.col[i * 3 + 1] = 0.66 * fade; dust.col[i * 3 + 2] = 0.47 * fade;
    }
    dust.m.opacity = fpOn ? 0.75 * (1 - clamp01(sa / 1.4)) : 0; dust.commit();

    // spring jet and droplets
    const so = springOn(t);
    const jet = so < 0 ? 0 : 1.15 * eout(so / 0.25) * (1 - 0.62 * ramp(so, 0.6, 2.4)) + 0.04 * Math.sin(t * 9) * (so > 0.3 ? 1 : 0);
    column.visible = jet > 0.01; column.scale.set(1 + 0.5 * (1 - ramp(so, 0.2, 1.2)), Math.max(0.01, jet), 1);
    springL.intensity = so < 0 ? 0 : 1.6 * (1 - 0.6 * ramp(so, 0.5, 2.5));
    for (let i = 0; i < ND; i++) {
      const o = DS[i];
      if (so < 0) { drops.pos[i * 3 + 1] = -99; continue; }
      const age = (so + o.ph * o.p) % o.p, launch = so - age;
      if (launch < 0) { drops.pos[i * 3 + 1] = -99; continue; }
      const str = 1 - 0.62 * ramp(launch, 0.4, 2.4);
      const vy = (3.2 + 1.6 * o.v) * str, vh = o.sp * (0.7 + 0.6 * str);
      const y = GY - 0.04 + vy * age - 4.9 * age * age;
      if (y < GY - 0.08) { drops.pos[i * 3 + 1] = -99; continue; }
      drops.pos[i * 3] = S[0] + Math.cos(o.a) * vh * age; drops.pos[i * 3 + 1] = y; drops.pos[i * 3 + 2] = S[1] + Math.sin(o.a) * vh * age;
      drops.col[i * 3] = 0.75; drops.col[i * 3 + 1] = 0.93; drops.col[i * 3 + 2] = 0.95;
    }
    drops.commit();

    // condensation on the glass after the spring returns
    GU.uCond.value = t < BU5 ? 0 : 0.42 * ramp(t, BU5 + 0.8, BU5 + 3.2) - 0.26 * ramp(t, K.s6 + 2, K.s7);
    GU.uT.value = t;
    // weaker reflections while the camera is inside the jar
    GU.uRefl.value = 1;

    // plants
    updLeaves(t); updShrubs(t); updGreen(t);
    flowers.material.emissive.setRGB(0.04, 0.04, 0.03);

    // houses
    let lit = 0;
    houses.forEach((h) => {
      const l = houseLight(h.k, t); lit += l;
      const rise = houseRise(h.k, t);
      h.G.visible = rise > 0.002;
      h.base.scale.set(1, Math.max(0.002, rise), 1); h.base.position.y = -0.4 * (1 - Math.min(1, rise));
      const flick = 1 + 0.06 * Math.sin(t * 7 + h.k * 2);
      h.wm.emissiveIntensity = 2.2 * l * flick; h.dg.emissiveIntensity = 0.9 * l * flick;
    });
    houseL.intensity = 1.2 * lit;

    // motes in the window light (s2-s4 dry air)
    const mo = t < K.s5 ? 1 : 0.35;
    for (let i = 0; i < NMO; i++) {
      const [x, y, z, ph, sp] = MOS[i];
      motes.pos[i * 3] = x + Math.sin(t * sp + ph) * 0.8; motes.pos[i * 3 + 1] = y + ((t * sp * 0.6 + ph) % 3) - 1.5; motes.pos[i * 3 + 2] = z + Math.cos(t * sp * 0.8 + ph) * 0.6;
      const v = mo * (0.5 + 0.5 * Math.sin(t * 0.9 + ph * 3)); motes.col[i * 3] = v; motes.col[i * 3 + 1] = v * 0.88; motes.col[i * 3 + 2] = v * 0.7;
    }
    motes.commit();

    // birds: one perches and hops on a low branch, one flies a lap inside the jar
    const bOn = t > K.s7 + 0.4;
    birds.forEach((b) => {
      b.g.visible = bOn; if (!bOn) return;
      const u = t - K.s7 - 0.4;
      if (b.k === 0) {
        const tp = tips[2].p, hop = Math.floor(u * 1.6) % 3, hz = Math.abs(Math.sin(u * Math.PI * 1.6)) * 0.08;
        b.g.position.set(tp.x + (hop - 1) * 0.12, tp.y + 0.12 + hz, tp.z); b.g.rotation.y = 0.8 + (hop - 1) * 0.5;
        const f = hz > 0.04 ? 0.6 : -0.1; b.wL.rotation.z = f; b.wR.rotation.z = -f;
      } else {
        const a = u * 0.9 + 1.4, rr = 3.2 + 0.6 * Math.sin(u * 0.7);
        b.g.position.set(Math.cos(a) * rr, 8.4 + Math.sin(u * 1.3) * 0.8, Math.sin(a) * rr - 0.5); b.g.rotation.y = -a;
        const f = Math.sin(u * 22) * 0.8; b.wL.rotation.z = f; b.wR.rotation.z = -f;
      }
    });

    // camera, with a small shake at each stomp
    const cv = CAM(t);
    const sh = sa >= 0 && sa < 0.45 ? 0.05 * (1 - sa / 0.45) : 0;
    cam.position.set(cv[0] + Math.sin(t * 61) * sh, cv[1] + Math.sin(t * 47 + 1) * sh, cv[2]);
    cam.lookAt(cv[3], cv[4], cv[5]);
    comp.render();
  };
}
