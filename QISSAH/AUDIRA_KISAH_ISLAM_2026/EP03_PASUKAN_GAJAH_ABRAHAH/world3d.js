// EP03 PASUKAN GAJAH: POLYVERSE low-poly desert at dusk with a DRAFTFORGE relief tablet of the Arabian peninsula lying in the sand (s2-s3).
// East of the tablet the valley of Makkah is a low-poly sand table (s1, s4-s8). People are faceless tokens; the Ka'bah is never touched.
// Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, track, std, stage, pts } from "./lib3d.js";

const VX = 82;                                  // valley centre (Ka'bah) on x
const LON0 = 46, LAT0 = 21, SC = 2.8, TOPY = 1.2, LANDY = 1.65;
const MP = (lon, lat) => [(lon - LON0) * SC, -(lat - LAT0) * SC];

// one loop: Africa + Arabia + south Iran, seas outside (lon, lat)
const LAND = [[31.4, 9.2], [31.4, 31.4], [32.3, 31.3], [33.0, 31.1], [34.4, 31.5], [34.9, 32.8], [60.4, 32.8], [60.4, 25.3], [58.8, 25.5], [57.3, 25.8], [56.0, 27.1], [54.0, 26.6], [52.5, 27.4], [51.0, 28.0], [50.3, 29.3], [49.5, 30.0], [48.6, 29.9], [47.9, 29.4], [48.6, 28.0], [49.6, 27.0], [50.2, 26.2], [50.8, 24.7], [51.3, 26.1], [51.6, 25.3], [51.5, 24.4], [52.5, 24.2], [54.4, 24.3], [55.3, 25.3], [56.1, 26.1], [56.4, 24.9], [56.7, 24.2], [58.6, 23.6], [59.8, 22.5], [58.7, 20.5], [57.8, 19.0], [56.8, 18.6], [55.4, 17.8], [54.0, 16.9], [52.2, 15.7], [50.0, 15.0], [48.7, 14.0], [47.0, 13.5], [45.0, 12.8], [43.5, 12.7], [43.2, 13.5], [42.8, 15.3], [42.6, 16.8], [41.8, 17.9], [40.8, 19.0], [39.6, 20.4], [39.15, 21.5], [38.4, 23.3], [38.05, 24.1], [36.6, 25.6], [35.5, 27.6], [34.95, 28.4], [35.0, 29.5], [34.7, 29.3], [34.45, 28.4], [34.25, 27.75], [33.7, 28.2], [32.6, 29.9], [32.5, 29.5], [32.7, 28.7], [33.6, 27.4], [33.9, 26.7], [34.3, 26.1], [34.9, 25.1], [35.5, 23.9], [36.9, 22.0], [37.25, 20.5], [37.2, 19.6], [38.4, 18.0], [39.45, 15.6], [41.2, 14.1], [42.7, 13.0], [43.15, 11.6], [44.0, 10.5], [45.0, 10.45], [47.5, 11.1], [49.2, 11.3], [51.27, 11.8], [51.0, 10.4], [50.8, 9.2]];
const ROUTE = [[45.25, 13.0], [44.9, 13.9], [44.5, 14.7], [44.2, 15.35], [44.0, 16.6], [44.1, 17.5], [43.6, 18.6], [42.6, 19.6], [41.4, 20.5], [40.4, 21.27], [39.83, 21.42]];
const SANAA = MP(44.2, 15.35), MAKKAH = MP(39.83, 21.42), STELE = MP(45.5, 15.9);

const sm = (a, b, x) => { x = clamp01((x - a) / (b - a)); return x * x * (3 - 2 * x); };
const nz = (x, z) => Math.sin(x * 0.31 + z * 0.17) * 0.5 + Math.sin(x * 0.13 - z * 0.29 + 1.3) * 0.6 + Math.sin(x * 0.71 + z * 0.53 + 2.1) * 0.25 + Math.sin(x * 1.3 - z * 1.1) * 0.12;
// valley: flat floor round the Ka'bah, hills on the north half, open plain to the south where the army camps
export const H = (x, z) => {
  const lx = x - VX, r = Math.hypot(lx, z);
  const mask = 1 - sm(-1, 12, z);
  const hill = sm(11, 19, r) * (1 - sm(31, 40, r)) * mask * (5.6 + 2.4 * nz(lx * 0.8, z * 0.8));
  const dune = 0.22 * (Math.sin(x * 0.19 + z * 0.06) + Math.sin(z * 0.15 - x * 0.05 + 2)) * sm(9, 16, r);
  return Math.max(0, hill) + dune;
};

const m4 = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) =>
  new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
// flat-shaded merge of [geometry, matrix] parts (no BufferGeometryUtils in assets/lib)
function merge(list) {
  const pos = [], nor = [];
  for (const [g0, m] of list) {
    const g = g0.index ? g0.toNonIndexed() : g0.clone();
    g.applyMatrix4(m); g.computeVertexNormals();
    pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  return g;
}
const inPoly = (x, y, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };

export function create(canvas, K, AT) {
  const { scene, cam, comp, bp, r } = stage(canvas, { bg: 0xc98a6a, fog: 0.0052, exp: 1.02, bloom: [0.3, 0.5, 0.9] });
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(570);
  const flat = (c, rough = 0.9, extra = {}) => std(c, rough, 0, { flatShading: true, ...extra });
  const add = (geo, mat, x = 0, y = 0, z = 0, p = scene, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; p.add(m); return m; };

  // ---------- dusk sky
  scene.background = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#241a35"); gr.addColorStop(0.42, "#5e3550"); gr.addColorStop(0.7, "#b8605a"); gr.addColorStop(0.86, "#e79a62"); gr.addColorStop(1, "#d79068"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.fog.color.set(0xc98a6a);
  const hemi = new THREE.HemisphereLight(0xffcaa0, 0x5a3a33, 0.95);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xff9a5a, 3.1);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 400 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0x8f80c8, 0.55); fill.position.set(80, 40, -60); scene.add(fill);

  // ---------- materials
  const SANDM = flat(0xe2c18c), TERRA = flat(0xb5532f, 0.8), GOLD = std(0xd9a441, 0.35, 0.6, { flatShading: true });
  const EL = flat(0x8d8279, 0.85), EL2 = flat(0x7d7169, 0.85, { side: THREE.DoubleSide }), IVORY = flat(0xf1e6cf, 0.5);
  const CLOTH = flat(0x9c3a24, 0.8), WOOD = flat(0x6b4429, 0.8);
  const ARMY = flat(0x6a3a28, 0.85), STONE = flat(0x3d3330, 0.7);

  // ---------- ground (one desert; the valley is part of it)
  {
    const g = new THREE.PlaneGeometry(340, 260, 170, 130); g.rotateX(-Math.PI / 2); g.translate(40, 0, 0);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, H(p.getX(i), p.getZ(i)));
    const ng = g.toNonIndexed(); ng.computeVertexNormals();
    const q = ng.attributes.position, col = new Float32Array(q.count * 3);
    const cA = new THREE.Color(0xe3c38e), cB = new THREE.Color(0xd49c66), cC = new THREE.Color(0xb86d45), cD = new THREE.Color(0x9c5636), c = new THREE.Color();
    for (let i = 0; i < q.count; i += 3) {
      const h = (q.getY(i) + q.getY(i + 1) + q.getY(i + 2)) / 3;
      if (h < 0.8) c.copy(cA).lerp(cB, clamp01(h / 0.8) * 0.35); else if (h < 3.5) c.copy(cB).lerp(cC, (h - 0.8) / 2.7); else c.copy(cC).lerp(cD, clamp01((h - 3.5) / 3.5));
      const j = 0.94 + rnd() * 0.1; c.multiplyScalar(j);
      for (let k = 0; k < 3; k++) { col[(i + k) * 3] = c.r; col[(i + k) * 3 + 1] = c.g; col[(i + k) * 3 + 2] = c.b; }
    }
    ng.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const m = new THREE.Mesh(ng, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true }));
    m.receiveShadow = true; scene.add(m);
    const far = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), flat(0xd8b080, 1)); far.rotation.x = -Math.PI / 2; far.position.y = -0.35; scene.add(far);
    // distant low-poly ridges for a horizon silhouette
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2, d = 230 + rnd() * 80;
      const c2 = new THREE.Mesh(new THREE.ConeGeometry(25 + rnd() * 30, 14 + rnd() * 22, 4 + Math.floor(rnd() * 2)), flat(0xa86a52, 1));
      c2.position.set(40 + Math.cos(a) * d, 4, Math.sin(a) * d); c2.rotation.y = rnd() * 3; scene.add(c2);
    }
  }

  // =====================================================================================
  // MAP TABLET (DRAFTFORGE): relief of the peninsula, graticule, pins, labels, route
  // =====================================================================================
  const MAP = new THREE.Group(); scene.add(MAP);
  add(new THREE.BoxGeometry(84, TOPY, 68), flat(0x6f8c8f, 0.75), 0, TOPY / 2, 0, MAP);              // sea
  add(new THREE.BoxGeometry(86, 0.9, 1.2), TERRA, 0, 0.45, 34.6, MAP); add(new THREE.BoxGeometry(86, 0.9, 1.2), TERRA, 0, 0.45, -34.6, MAP);
  add(new THREE.BoxGeometry(1.2, 0.9, 70), TERRA, 42.6, 0.45, 0, MAP); add(new THREE.BoxGeometry(1.2, 0.9, 70), TERRA, -42.6, 0.45, 0, MAP);
  {
    const sh = new THREE.Shape(LAND.map(([lo, la]) => { const [x, z] = MP(lo, la); return new THREE.Vector2(x, -z); }));
    const g = new THREE.ExtrudeGeometry(sh, { depth: LANDY - TOPY, bevelEnabled: false }); g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, [flat(0xe6c690, 0.92), flat(0xc48a58, 0.9)]); m.position.y = TOPY; m.castShadow = m.receiveShadow = true; MAP.add(m);
  }
  // route curve on the land
  const RC = new THREE.CatmullRomCurve3(ROUTE.map(([lo, la]) => { const [x, z] = MP(lo, la); return new THREE.Vector3(x, LANDY + 0.04, z); }), false, "centripetal");
  const RL = RC.getLength();
  const routeSamples = RC.getSpacedPoints(400);
  let uS = 0; { let best = 1e9; routeSamples.forEach((p, i) => { const d = Math.hypot(p.x - SANAA[0], p.z - SANAA[1]); if (d < best) { best = d; uS = i / 400; } }); }
  const nearRoute = (x, z) => routeSamples.some((p) => Math.hypot(p.x - x, p.z - z) < 1.3);
  // relief: low-poly cones on the Sarawat/Hejaz, Yemen highlands, Hajar, Ethiopian highlands
  {
    const westCoast = (lat) => 43.2 - ((lat - 13.5) * 8.2) / 16;
    const ridge = (lo, la) => (la > 13.2 && la < 29 && lo > westCoast(la) + 0.25 && lo < westCoast(la) + 2.0) || (la > 13.2 && la < 16.8 && lo > 43.4 && lo < 46.6) || (lo > 56.5 && lo < 59 && la > 22.6 && la < 24) || (lo > 36.2 && lo < 40.8 && la > 9.4 && la < 14.2);
    const cg = [];
    let tries = 0;
    while (cg.length < 190 && tries++ < 20000) {
      const lo = 33 + rnd() * 27, la = 9.4 + rnd() * 21;
      if (!inPoly(lo, la, LAND) || !ridge(lo, la)) continue;
      const [x, z] = MP(lo, la);
      if (nearRoute(x, z) || Math.hypot(x - SANAA[0], z - SANAA[1]) < 2.2 || Math.hypot(x - STELE[0], z - STELE[1]) < 1.8 || Math.hypot(x - MAKKAH[0], z - MAKKAH[1]) < 2) continue;
      const rr = 0.45 + rnd() * 0.55, hh = 0.3 + rnd() * 0.9;
      cg.push([new THREE.ConeGeometry(rr, hh, 5), m4(x, LANDY + hh / 2 - 0.05, z, 0, rnd() * 6, 0)]);
    }
    const mtn = new THREE.Mesh(merge(cg), flat(0xc98f5c, 0.9)); mtn.castShadow = mtn.receiveShadow = true; MAP.add(mtn);
  }
  // graticule every 5 degrees, drafting lines over land and sea
  {
    const v = [], y = LANDY + 0.06;
    for (let lo = 35; lo <= 60; lo += 5) { const [x] = MP(lo, 0); v.push(x, y, -33.4, x, y, 33.4); }
    for (let la = 10; la <= 30; la += 5) { const [, z] = MP(0, la); v.push(-41.4, y, z, 41.4, y, z); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    MAP.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x8a3a1e, transparent: true, opacity: 0.45 })));
  }
  const flatLabel = (txt, sub, w, bg, fg, font = 52) => {
    const tx = canvasTex(1024, 192, (g) => {
      g.clearRect(0, 0, 1024, 192);
      if (bg) { g.fillStyle = bg; g.fillRect(0, 18, 1024, 156); }
      g.fillStyle = fg; g.textBaseline = "middle"; g.font = `800 ${font * 1.7}px Archivo, Inter, sans-serif`; g.fillText(txt, 34, sub ? 74 : 98);
      if (sub) { g.font = `700 ${font * 0.95}px Archivo, Inter, sans-serif`; g.globalAlpha = 0.85; g.fillText(sub, 36, 142); }
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.1875), new THREE.MeshBasicMaterial({ map: tx, transparent: true, toneMapped: false, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.renderOrder = 5; return m;
  };
  const LBL = [];
  const putLabel = (m, lon, lat, y, at, rotZ = 0) => { const [x, z] = MP(lon, lat); m.position.set(x, y, z); m.rotation.z = rotZ; MAP.add(m); LBL.push({ m, at }); return m; };
  putLabel(flatLabel("JAZIRAH ARAB", null, 15, null, "#7a3a1f"), 46.2, 24.8, LANDY + 0.08, -1);
  putLabel(flatLabel("LAUT MERAH", null, 9, null, "#e9dcc0"), 37.4, 21.6, TOPY + 0.05, -1, 0.95);
  putLabel(flatLabel("YAMAN", "WILAYAH ABRAHAH", 8.5, "#b5532f", "#fbf1dc"), 49.2, 17.1, LANDY + 2.2, "s2:Yaman");
  putLabel(flatLabel("HABASYAH", "ETHIOPIA, ASAL ABRAHAH", 9.5, "#2a1a12", "#f2d79a"), 37.4, 11.6, LANDY + 2.2, "s2:Habasyah");
  putLabel(flatLabel("PRASASTI ABRAHAH", "BATU BERTULIS, 548 & 552 M", 8.6, "#f1e2c4", "#2a1a12"), 47.0, 14.4, LANDY + 1.6, "s2:Prasasti");
  putLabel(flatLabel("SANA'A", "GEREJA MEGAH, MENURUT IBNU ISHAQ", 7, "#f1e2c4", "#2a1a12"), 41.8, 15.6, LANDY + 1.6, "s2:gereja");
  putLabel(flatLabel("MAKKAH", "KA'BAH", 6.4, "#2a1a12", "#f2d79a"), 41.6, 22.9, LANDY + 1.8, "s2:Ka'bah");
  // pins: Sana'a church, the stele, Makkah cube
  const church = new THREE.Group(); church.position.set(SANAA[0], LANDY, SANAA[1]); MAP.add(church);
  add(new THREE.BoxGeometry(1.3, 0.62, 0.7), flat(0xf3ead6), 0, 0.31, 0, church);
  { const rf = add(new THREE.CylinderGeometry(0.42, 0.42, 1.3, 3), TERRA, 0, 0.74, 0, church); rf.rotation.z = Math.PI / 2; rf.scale.set(1, 1, 0.95); }
  add(new THREE.BoxGeometry(0.42, 1.25, 0.42), flat(0xf3ead6), -0.62, 0.62, 0, church);
  add(new THREE.SphereGeometry(0.3, 8, 5, 0, 6.3, 0, 1.6), GOLD, 0.45, 0.95, 0, church);
  add(new THREE.BoxGeometry(0.05, 0.32, 0.05), GOLD, -0.62, 1.42, 0, church); add(new THREE.BoxGeometry(0.05, 0.05, 0.2), GOLD, -0.62, 1.48, 0, church);
  const stele = add(new THREE.BoxGeometry(0.42, 1.25, 0.2), STONE, STELE[0], LANDY + 0.62, STELE[1], MAP); stele.rotation.y = 0.3;
  add(new THREE.BoxGeometry(0.46, 0.08, 0.24), GOLD, 0, 0.66, 0, stele);
  const lead = (a, b) => { const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]); const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x2a1a12 })); MAP.add(l); return l; };
  const LEADS = [
    { l: lead([SANAA[0] - 0.7, LANDY + 0.6, SANAA[1]], [MP(41.8, 15.6)[0] + 3.4, LANDY + 1.6, MP(41.8, 15.6)[1] + 0.3]), at: "s2:gereja" },
    { l: lead([STELE[0], LANDY + 1.25, STELE[1]], [MP(47.0, 14.4)[0], LANDY + 1.6, MP(47.0, 14.4)[1] - 0.7]), at: "s2:Prasasti" },
    { l: lead([MAKKAH[0], LANDY + 0.5, MAKKAH[1]], [MP(41.6, 22.9)[0], LANDY + 1.8, MP(41.6, 22.9)[1] + 0.5]), at: "s2:Ka'bah" },
  ];
  const kabTex = canvasTex(256, 256, (g) => {
    g.fillStyle = "#121012"; g.fillRect(0, 0, 256, 256);
    g.fillStyle = "#1b181b"; for (let x = 0; x < 256; x += 32) g.fillRect(x, 0, 2, 256);
    g.fillStyle = "#c9a23e"; g.fillRect(0, 50, 256, 30);
    g.fillStyle = "#8a6a22"; for (let x = 4; x < 256; x += 16) { g.beginPath(); g.moveTo(x, 65); g.lineTo(x + 6, 56); g.lineTo(x + 12, 65); g.lineTo(x + 6, 74); g.fill(); }
    g.fillStyle = "#e7c66a"; g.fillRect(0, 50, 256, 2); g.fillRect(0, 78, 256, 2);
  });
  const KSIDE = new THREE.MeshStandardMaterial({ map: kabTex, roughness: 0.7, emissive: 0xffffff, emissiveMap: kabTex, emissiveIntensity: 0.18 });
  const KTOP = std(0x141214, 0.8);
  const kaabaMesh = (s) => { const m = new THREE.Mesh(new THREE.BoxGeometry(2.2 * s, 2.5 * s, 2.2 * s), [KSIDE, KSIDE, KTOP, KTOP, KSIDE, KSIDE]); m.castShadow = m.receiveShadow = true; return m; };
  const mk = kaabaMesh(0.32); mk.position.set(MAKKAH[0], LANDY + 0.4, MAKKAH[1]); MAP.add(mk);
  const ringMat = (c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const ringG = new THREE.RingGeometry(0.85, 1.0, 40); ringG.rotateX(-Math.PI / 2);
  const PULSE = [
    { m: new THREE.Mesh(ringG, ringMat(0xf2c14e)), p: SANAA, at: "s2:Sana'a" },
    { m: new THREE.Mesh(ringG, ringMat(0xf2c14e)), p: STELE, at: "s2:Prasasti" },
    { m: new THREE.Mesh(ringG, ringMat(0xf2c14e)), p: MAKKAH, at: "s2:Ka'bah" },
    { m: new THREE.Mesh(ringG, ringMat(0xf2c14e)), p: MAKKAH, at: "s3:perjalanan" },
  ];
  PULSE.forEach((q) => { q.m.position.set(q.p[0], LANDY + 0.08, q.p[1]); MAP.add(q.m); });
  // dashed intent line (s2) and the drawn route (s3)
  const sanaToMakkah = RC.getSpacedPoints(300).slice(Math.round(uS * 300));
  const dashG = new THREE.BufferGeometry().setFromPoints(sanaToMakkah.map((p) => p.clone().setY(LANDY + 0.12)));
  const dash = new THREE.Line(dashG, new THREE.LineDashedMaterial({ color: 0x2a1a12, dashSize: 0.45, gapSize: 0.32, transparent: true, opacity: 0 }));
  dash.computeLineDistances(); MAP.add(dash);
  const TUBS = 400, RAD = 6;
  const tube = new THREE.Mesh(new THREE.TubeGeometry(RC, TUBS, 0.13, RAD, false), new THREE.MeshStandardMaterial({ color: 0xb5532f, emissive: 0xb5532f, emissiveIntensity: 0.35, roughness: 0.6 }));
  tube.castShadow = true; MAP.add(tube);

  // ---------- elephants (low-poly, face +x)
  function elephant(s, isLead) {
    const G = new THREE.Group(), B = new THREE.Group(); G.add(B);
    const a = (geo, mat, x, y, z, p = B) => add(geo, mat, x, y, z, p);
    a(new THREE.IcosahedronGeometry(1, 1), EL, 0, 1.85, 0).scale.set(1.55, 1.1, 1.05);
    a(new THREE.IcosahedronGeometry(0.72, 1), EL, 1.45, 2.25, 0);
    for (const sz of [-1, 1]) a(new THREE.CircleGeometry(0.78, 6), EL2, 1.12, 2.3, sz * 0.66).scale.set(0.8, 1.1, 1);
    a(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(1.95, 2.15, 0), new THREE.Vector3(2.28, 1.6, 0), new THREE.Vector3(2.3, 1.0, 0), new THREE.Vector3(2.12, 0.45, 0)]), 8, 0.16, 5), EL, 0, 0, 0);
    for (const sz of [-1, 1]) { const tk = a(new THREE.ConeGeometry(0.07, 0.62, 5), IVORY, 2.05, 1.72, sz * 0.27); tk.rotation.z = -1.35; }
    const legs = [];
    for (const [lx, lz] of [[0.8, 0.5], [0.8, -0.5], [-0.8, 0.5], [-0.8, -0.5]]) {
      const pv = new THREE.Group(); pv.position.set(lx, 1.38, lz); B.add(pv);
      a(new THREE.CylinderGeometry(0.3, 0.27, 1.38, 6), EL, 0, -0.69, 0, pv);
      legs.push(pv);
    }
    a(new THREE.CylinderGeometry(0.04, 0.03, 0.9, 4), EL, -1.62, 1.5, 0).rotation.z = -0.3;
    a(new THREE.BoxGeometry(1.5, 0.12, 2.3), CLOTH, 0, 2.98, 0);
    for (const sz of [-1, 1]) { a(new THREE.BoxGeometry(1.5, 0.85, 0.06), CLOTH, 0, 2.52, sz * 1.13); a(new THREE.BoxGeometry(1.54, 0.09, 0.09), GOLD, 0, 2.12, sz * 1.15); }
    a(new THREE.BoxGeometry(0.95, 0.55, 0.95), WOOD, -0.1, 3.32, 0);
    a(new THREE.ConeGeometry(0.8, 0.5, 4), CLOTH, -0.1, 3.85, 0).rotation.y = Math.PI / 4;
    if (isLead) { a(new THREE.BoxGeometry(0.08, 0.5, 0.55), GOLD, 2.08, 2.45, 0); a(new THREE.SphereGeometry(0.12, 6, 4), GOLD, -0.1, 4.15, 0); }
    G.scale.setScalar(s);
    return { G, B, legs };
  }
  const poseEl = (e, x, y, z, yaw, ph, amp, kneel = 0) => {
    e.G.position.set(x, y, z); e.G.rotation.y = yaw;
    const sw = Math.sin(ph) * amp;
    e.legs[0].rotation.z = sw * (1 - kneel) - 1.25 * kneel; e.legs[1].rotation.z = -sw * (1 - kneel) - 1.25 * kneel;
    e.legs[2].rotation.z = -sw * (1 - kneel) + 0.35 * kneel; e.legs[3].rotation.z = sw * (1 - kneel) + 0.35 * kneel;
    e.B.rotation.z = -0.2 * kneel; e.B.position.y = -0.62 * kneel + Math.abs(Math.sin(ph)) * amp * 0.12;
  };

  // ---------- tokens (faceless): soldier with spear, plain robe, camel
  const TOKP = [[new THREE.ConeGeometry(0.17, 0.46, 6), m4(0, 0.23, 0)], [new THREE.IcosahedronGeometry(0.09, 0), m4(0, 0.5, 0)], [new THREE.CylinderGeometry(0.1, 0.11, 0.06, 6), m4(0, 0.56, 0)]];
  const TOK = merge(TOKP);
  const SPEAR = merge([...TOKP, [new THREE.CylinderGeometry(0.012, 0.012, 0.82, 4), m4(0.14, 0.42, 0)], [new THREE.ConeGeometry(0.03, 0.1, 4), m4(0.14, 0.87, 0)], [new THREE.BoxGeometry(0.04, 0.2, 0.16), m4(-0.15, 0.28, 0)]]);
  const CAMEL = merge([
    [new THREE.IcosahedronGeometry(0.3, 0), m4(0, 0.62, 0, 0, 0, 0, 1.35, 0.8, 0.72)], [new THREE.IcosahedronGeometry(0.17, 0), m4(-0.02, 0.86, 0)],
    [new THREE.CylinderGeometry(0.06, 0.085, 0.46, 5), m4(0.4, 0.82, 0, 0, 0, -0.7)], [new THREE.BoxGeometry(0.24, 0.1, 0.1), m4(0.6, 1.0, 0)],
    ...[[0.24, 0.13], [0.24, -0.13], [-0.24, 0.13], [-0.24, -0.13]].map(([x, z]) => [new THREE.CylinderGeometry(0.035, 0.028, 0.56, 4), m4(x, 0.28, z)]),
  ]);
  const inst = (geo, mat, n) => { const m = new THREE.InstancedMesh(geo, mat, n); m.frustumCulled = false; m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; };
  const MX = new THREE.Matrix4(), QQ = new THREE.Quaternion(), EU = new THREE.Euler(), PV = new THREE.Vector3(), SV = new THREE.Vector3();
  const setI = (im, i, x, y, z, ry, s, rx = 0, rz = 0) => { EU.set(rx, ry, rz, "YXZ"); QQ.setFromEuler(EU); PV.set(x, y, z); SV.set(s, s, s); MX.compose(PV, QQ, SV); im.setMatrixAt(i, MX); };

  // map column: 7 elephants (lead bigger) and 36 tiny soldiers following the head along the route
  const MEL = [0, 1, 2, 3, 4, 5, 6].map((i) => { const e = elephant(i === 0 ? 0.27 : 0.2, i === 0); MAP.add(e.G); return e; });
  const NMS = 36, mapSold = inst(SPEAR, ARMY, NMS); mapSold.parent.remove(mapSold); MAP.add(mapSold);
  const NKB = 12, kab = inst(TOK, flat(0xefe4cc), NKB); kab.parent.remove(kab); MAP.add(kab);
  const headTrack = track([
    [K.s3 - 0.2, uS], [A("s3:gajah"), uS + 0.17 * (1 - uS)], [A("s3:Mahmud") + 0.8, uS + 0.3 * (1 - uS)], [A("s3:dikalahkan") + 0.3, uS + 0.78 * (1 - uS)], [K.s3e + 0.2, 0.985],
  ]);
  const headU = (t) => clamp01(headTrack(t)[0]);
  const KABU = [0.5, 0.64, 0.78].map((f) => uS + f * (1 - uS));
  const kabTip = KABU.map((u) => { for (let t = K.s3; t < K.s3e + 1; t += 0.02) if (headU(t) >= u - 0.012) return t; return K.s3e; });
  const onRoute = (u, lat = 0) => { const uu = clamp01(u); const p = RC.getPointAt(uu), tg = RC.getTangentAt(uu); return [p.x - tg.z * lat, p.z + tg.x * lat, Math.atan2(-tg.z, tg.x)]; };

  // =====================================================================================
  // VALLEY OF MAKKAH (sand table at true-ish scale)
  // =====================================================================================
  const kaaba = kaabaMesh(1); kaaba.position.set(VX, 1.25, 0); scene.add(kaaba);
  add(new THREE.CylinderGeometry(4.4, 4.5, 0.08, 40), flat(0xeae1cf, 0.8), VX, 0.04, 0);
  // houses round the clearing, a path open to the south
  const HOUSE = [flat(0xe8d3a8), flat(0xd8b583), flat(0xc98d62), flat(0xf0e4c8)];
  const LAMP = new THREE.MeshStandardMaterial({ color: 0x3a2410, emissive: 0xffb046, emissiveIntensity: 0 });
  const homes = [];
  for (let i = 0; i < 34; i++) {
    const a = rnd() * Math.PI * 2, d = 6 + rnd() * 5.5;
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (z > 3 && Math.abs(x) < 3) continue;
    const w = 1.1 + rnd() * 1.1, h = 0.9 + rnd() * 1.1, dp = 1.1 + rnd() * 1.0;
    const hm = add(new THREE.BoxGeometry(w, h, dp), HOUSE[i % 4], VX + x, h / 2, z); hm.rotation.y = a + Math.PI / 2;
    add(new THREE.BoxGeometry(w + 0.12, 0.12, dp + 0.12), HOUSE[(i + 1) % 4], 0, h / 2 + 0.06, 0, hm);
    add(new THREE.BoxGeometry(0.3, 0.42, 0.04), homes.length === 3 ? LAMP : flat(0x3a2418), 0, -h / 2 + 0.21, dp / 2 + 0.01, hm, false);
    homes.push([VX + x, z]);
  }
  for (let i = 0; i < 9; i++) {  // palms
    const a = 0.6 + rnd() * 5, d = 9 + rnd() * 6, x = VX + Math.cos(a) * d, z = Math.sin(a) * d;
    const P = new THREE.Group(); P.position.set(x, H(x, z), z); scene.add(P);
    add(new THREE.CylinderGeometry(0.08, 0.13, 2.4, 5), WOOD, 0, 1.2, 0, P).rotation.z = 0.08;
    for (let k = 0; k < 6; k++) { const lf = add(new THREE.ConeGeometry(0.16, 1.4, 3), flat(0x6f7a3a), Math.cos(k) * 0.5, 2.35, Math.sin(k) * 0.5, P); lf.rotation.set(Math.sin(k) * 1.3, 0, -Math.cos(k) * 1.3); }
  }
  // camp: tents, Abrahah's crimson tent on the west side
  const TENTC = [flat(0xe8d3a8), flat(0xb5532f), flat(0xd8b583)];
  for (let i = 0; i < 14; i++) { const x = VX - 9 + (i % 7) * 3 + rnd(), z = 45 + Math.floor(i / 7) * 3.4 + rnd(); add(new THREE.ConeGeometry(1.1, 1.5, 6), TENTC[i % 3], x, H(x, z) + 0.75, z).rotation.y = rnd(); }
  const TENT = [VX - 13.5, 33];
  add(new THREE.ConeGeometry(1.9, 2.3, 8), flat(0x7a1f1a, 0.8), TENT[0], H(...TENT) + 1.15, TENT[1]);
  add(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 4), GOLD, TENT[0], H(...TENT) + 2.7, TENT[1]);

  // army in the valley: 7 elephants, 150 soldiers
  const DEL = [[0, 27], [-3, 30.4], [3, 30.4], [-6, 31.4], [6, 31.4], [-1.6, 32.2], [1.6, 32.2]].map(([x, z], i) => ({ e: elephant(i === 0 ? 0.68 : 0.55, i === 0), x: VX + x, z, ph: rnd() * 6 }));
  DEL.forEach((d) => scene.add(d.e.G));
  const SOLD = [];
  for (let row = 0; row < 12; row++) for (let c = 0; c < 13; c++) { if (SOLD.length >= 150) break; SOLD.push({ x: VX - 6 + c + (rnd() - 0.5) * 0.35, z: 34.5 + row * 0.95 + (rnd() - 0.5) * 0.3, ph: rnd() * 6 }); }
  const NS = SOLD.length, sold = inst(SPEAR, ARMY, NS);
  const armyZ = (t) => -2 * ramp(t, 0, K.s1e) - 10 * ramp(t, K.s6 - 0.3, A("s6:berhenti") + 0.3);
  const marching = (t) => (t < K.s1e + 0.4) || (t > K.s6 - 0.3 && t < A("s6:berhenti") + 0.3) ? 1 : 0;
  const wave = A("s6:dijadikan") - 0.25;
  const crumbleT = (z0) => wave + 0.9 * clamp01((z0 - 28) / 18);
  const soldPos = (s, t) => [s.x, s.z + armyZ(t)];

  // camels: 200, grazing east, driven into the camp on "merampas"
  const NC = 200, camels = inst(CAMEL, flat(0xc8955a, 0.9), NC);
  const CAM = Array.from({ length: NC }, (_, i) => {
    const a = rnd() * 6.283, d = Math.sqrt(rnd()) * 5.2, a2 = rnd() * 6.283, d2 = Math.sqrt(rnd()) * 3.4;
    return { x0: VX + 15 + Math.cos(a) * d, z0: 18 + Math.sin(a) * d * 0.8, x1: VX + 12 + Math.cos(a2) * d2, z1: 37 + Math.sin(a2) * d2 * 0.7, yaw: rnd() * 6.283, k: rnd(), ph: rnd() * 6 };
  });
  const herdA = A("s4:merampas") - 0.6, herdB = A("s4:Abdul") + 0.6;

  // Abdul Muthalib and Abrahah: single faceless robed tokens with name tags
  const robe = (c, s, crown) => {
    const G = new THREE.Group(); scene.add(G);
    add(new THREE.ConeGeometry(0.22, 0.62, 8), flat(c), 0, 0.31, 0, G);
    add(new THREE.CylinderGeometry(0.21, 0.13, 0.22, 8), flat(c), 0, 0.5, 0, G);
    add(new THREE.IcosahedronGeometry(0.105, 1), flat(0x8a6a50), 0, 0.68, 0, G);
    add(new THREE.CylinderGeometry(0.12, 0.125, 0.09, 8), crown ? GOLD : flat(0xf6f0e2), 0, 0.75, 0, G);
    add(new THREE.BoxGeometry(0.46, 0.05, 0.07), crown ? GOLD : flat(0xc9a23e), 0, 0.46, 0.0, G);
    G.scale.setScalar(s); return G;
  };
  const AM = robe(0xf2ebdd, 2.0, false), AB = robe(0x7a1f1a, 2.1, true);
  const tag = (txt, sub, w, bg, fg) => {
    const tx = canvasTex(1024, 220, (g) => { g.clearRect(0, 0, 1024, 220); g.fillStyle = bg; g.fillRect(0, 10, 1024, 160); g.fillStyle = bg; g.beginPath(); g.moveTo(482, 170); g.lineTo(512, 214); g.lineTo(542, 170); g.fill(); g.fillStyle = fg; g.textBaseline = "middle"; g.textAlign = "center"; g.font = "800 92px Archivo, Inter, sans-serif"; g.fillText(txt, 512, sub ? 66 : 90); if (sub) { g.font = "700 46px Archivo, Inter, sans-serif"; g.fillText(sub, 512, 136); } });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false, toneMapped: false }));
    s.scale.set(w, w * 0.215, 1); s.renderOrder = 20; scene.add(s); return s;
  };
  const tagAM = tag("ABDUL MUTHALIB", "PEMILIK 200 UNTA", 1.45, "#f1e2c4", "#2a1a12");
  const tagAB = tag("ABRAHAH", "PENGUASA YAMAN", 1.25, "#7a1f1a", "#f6e3b0");
  const tagMahD = tag("MAHMUD", "GAJAH TERDEPAN", 1.7, "#2a1a12", "#f2c14e");
  const tagMahM = tag("MAHMUD", "GAJAH TERDEPAN", 1.05, "#2a1a12", "#f2c14e");
  const AMstart = [VX - 3, 8], AMmeet = [VX - 12, 27.0], ABpos = [VX - 12, 28.9], AMhill = [VX - 15, -11];
  const amA = A("s4:Abdul"), amB = A("s4:Bukan") + 0.2;

  // Meccans: 70 tokens leave their houses for the hills on "mengungsi"
  const NM = 70, mec = inst(TOK, new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true }), NM);
  const MEC = Array.from({ length: NM }, (_, i) => {
    const hm = homes[i % homes.length], a = -Math.PI * (0.12 + 0.76 * rnd()), d = 17 + rnd() * 6;
    const c = new THREE.Color([0xf1e7d2, 0xd9c3a0, 0xb98a63, 0xe8dcc4, 0x9c7a5a][i % 5]); mec.setColorAt(i, c);
    return { x0: hm[0] + (rnd() - 0.5) * 1.6, z0: hm[1] + (rnd() - 0.5) * 1.6 + 1.0, x1: VX + Math.cos(a) * d, z1: Math.sin(a) * d, d: rnd() * 1.4 };
  });
  const goA = A("s5:mengungsi") - 0.8;

  // birds: two wings + body per bird, instanced
  const NB = 240;
  const wingG = new THREE.BufferGeometry(); wingG.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0.12, 0, 0, -0.12, -0.18, 0, 0.62, 0, 0, -0.12, 0.16, 0, 0.5, -0.18, 0, 0.62], 3)); wingG.computeVertexNormals();
  const wingG2 = wingG.clone(); wingG2.scale(1, 1, -1); wingG2.computeVertexNormals();
  const BIRD = new THREE.MeshStandardMaterial({ color: 0x2b201c, roughness: 0.8, side: THREE.DoubleSide });
  const wl = inst(wingG, BIRD, NB), wr = inst(wingG2, BIRD, NB), bb = inst(new THREE.ConeGeometry(0.07, 0.42, 4).rotateZ(-Math.PI / 2), BIRD, NB);
  [wl, wr, bb].forEach((m) => { m.castShadow = false; });
  const BS = Array.from({ length: NB }, () => ({ r: 2.5 + rnd() * 7, a: rnd() * 6.283, w: (0.35 + rnd() * 0.5) * (rnd() < 0.5 ? -1 : 1), y: (rnd() - 0.5) * 3.2, f: 13 + rnd() * 7, p: rnd() * 6, s: 0.75 + rnd() * 0.5 }));
  const fly1 = track([[A("s1:kawanan") - 2.4, VX - 45, 11, 10], [A("s1:kawanan") + 0.1, VX, 9, 5], [A("s1:kawanan") + 3.2, VX + 55, 14, -8]]);
  const fly2 = track([
    [A("s6:burung") - 1.4, VX - 80, 30, 10], [A("s6:berbondong-bondong") + 0.6, VX - 4, 12, 22], [A("s6:melempari") + 1.5, VX + 1, 10.5, 25], [A("s6:dijadikan"), VX - 1, 11, 24],
    [A("s6:dijadikan") + 2.2, VX + 6, 16, 18], [K.s7 + 4, VX + 60, 40, -50],
  ]);
  const flock = (t) => (t > A("s1:kawanan") - 2.4 && t < A("s1:kawanan") + 3.2 ? [fly1(t), 1] : t > A("s6:burung") - 1.4 && t < K.s7 + 4 ? [fly2(t), 2] : [null, 0]);
  const birdPos = (i, t) => {
    const [c, ph] = flock(t); if (!c) return null;
    const b = BS[i], spread = ph === 2 ? 1 + 0.6 * ramp(t, A("s6:melempari") - 0.5, A("s6:melempari") + 0.8) : 0.8, ang = b.a + b.w * t;
    return [c[0] + Math.cos(ang) * b.r * spread, c[1] + b.y + Math.sin(t * 0.9 + b.p) * 0.6, c[2] + Math.sin(ang) * b.r * spread * 0.8];
  };

  // glowing pebbles (sijjil): fall from birds onto the army
  const NP = 220, peb = pts(scene, NP, { color: 0xffa040, size: 0.7, opacity: 1 });
  const PS = Array.from({ length: NP }, (_, i) => ({ P: 0.85 + rnd() * 0.45, ph: rnd(), b: Math.floor(rnd() * NB), s: Math.floor(rnd() * NS) }));
  const pebA = A("s6:melempari") - 0.3, pebB = A("s6:dijadikan") + 0.2;

  // dry leaves: the army crumbles "like eaten leaves"
  const leafShape = new THREE.Shape(); leafShape.moveTo(0, -0.1); leafShape.quadraticCurveTo(0.08, 0, 0, 0.1); leafShape.quadraticCurveTo(-0.08, 0, 0, -0.1);
  const LS = [];
  SOLD.forEach((s, i) => { for (let k = 0; k < 3; k++) LS.push({ src: i, el: -1, h: 0.1 + rnd() * 0.5 }); });
  DEL.forEach((d, i) => { if (i > 0) for (let k = 0; k < 18; k++) LS.push({ src: -1, el: i, h: 0.3 + rnd() * 1.4 }); });
  const NL = LS.length, leaves = inst(new THREE.ShapeGeometry(leafShape), new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide }), NL);
  leaves.castShadow = false;
  LS.forEach((l, i) => { Object.assign(l, { dx: (rnd() - 0.5) * 0.8, dz: (rnd() - 0.5) * 0.8, wx: 0.8 + rnd() * 2.2, wz: -0.3 - rnd() * 1.6, Tf: 1.6 + rnd() * 1.6, d: rnd() * 0.5, r1: rnd() * 6, f: 4 + rnd() * 5, s: 0.9 + rnd() * 1.0 }); leaves.setColorAt(i, new THREE.Color([0xc08a3e, 0x8a5a2b, 0x9a8a4a, 0xb0743a, 0x6e4a26][i % 5])); });

  // stars for the night of s7-s8; sand motes for depth
  const NST = 360, stars = pts(scene, NST, { color: 0xfff2d8, size: 1.6, opacity: 1 });
  for (let i = 0; i < NST; i++) { const a = rnd() * 6.283, e = 0.12 + rnd() * 1.2, R = 420; stars.pos[i * 3] = VX + Math.cos(a) * Math.cos(e) * R; stars.pos[i * 3 + 1] = Math.sin(e) * R; stars.pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * R; }
  stars.commit();
  const NDU = 240, dust = pts(scene, NDU, { color: 0xffd9a8, size: 0.07, opacity: 0.5 });
  const dseed = Array.from({ length: NDU }, () => [rnd(), rnd(), rnd(), rnd()]);

  // ---------- cameras: [t, px, py, pz, tx, ty, tz]
  const CUT1 = K.s2 - 0.04, CUT2 = K.s4 - 0.04;
  const camV1 = track([
    [0, VX + 7, 8.5, 54, VX, 1.2, 10],
    [A("s1:Ka'bah"), VX + 4, 9.5, 46, VX, 1.0, 0],
    [A("s1:kawanan") - 0.4, VX + 2, 10.5, 42, VX, 4.5, -3],
    [CUT1, VX + 1, 11.5, 40, VX, 7, -6],
  ]);
  const camM = track([
    [CUT1, -8, 66, 76, -10, 1.6, 15],
    [A("s2:Habasyah") + 0.4, -13, 52, 66, -13, 1.6, 17],
    [A("s2:Prasasti") + 0.2, 1, 32, 46, -1, 1.6, 15],
    [A("s2:gereja") + 0.2, -9.5, 19, 38, -9.8, 1.8, 15.8],
    [A("s2:berziarah"), -8, 30, 36, -11, 1.6, 6],
    [K.s3 + 0.2, -9, 26, 34, -10, 1.6, 7],
  ]);
  // s3 follows the head of the column: offsets relative to it
  const camF = track([
    [K.s3 + 0.2, 3, 11, 13], [A("s3:gajah") + 0.2, 2.5, 6, 8], [A("s3:Mahmud") - 0.5, 2.6, 1.3, 3.3], [A("s3:Mahmud") + 0.9, 2.2, 1.2, 3.0],
    [A("s3:Kabilah-kabilah") + 0.9, 5, 17, 21], [CUT2, 5, 21, 25],
  ]);
  const camV2 = track([
    [CUT2, VX + 16, 10, 39, VX + 15, 0.5, 20],
    [A("s4:merampas") + 1.4, VX + 31, 13, 30, VX + 13, 0.5, 28],
    [A("s4:Abdul"), VX + 9, 17, 41, VX - 4, 0.8, 16],
    [A("s4:datang"), VX + 1, 12, 36, VX - 8, 0.8, 21],
    [A("s4:Bukan"), VX - 20, 4.0, 29.2, VX - 12, 1.25, 27.95],
    [K.s5, VX - 21, 3.0, 28.4, VX - 12, 1.2, 27.95],
    [A("s5:aku"), VX - 21.5, 2.8, 27.95, VX - 12, 1.2, 27.95],
    [A("s5:Lalu") - 0.4, VX - 21.3, 2.9, 27.6, VX - 12, 1.2, 27.95],
    [A("s5:Lalu") + 0.3, VX - 20.5, 3.4, 27.3, VX - 12, 1.3, 27.5],
    [A("s5:mengungsi") + 0.6, VX + 5, 17, 21, VX - 4, 3, -10],
    [K.s6 - 0.2, VX - 4, 14, 30, VX - 3, 3, -2],
    [K.s6 + 1.2, VX - 15, 9, 42, VX - 1, 1.5, 22],
    [A("s6:berhenti"), VX - 9.5, 3.2, 12.5, VX, 1.3, 15.4],
    [A("s6:Makkah") + 0.3, VX - 10.5, 3.6, 14, VX, 1.4, 15.6],
    [A("s6:burung") + 0.6, VX - 15, 7, 32, VX - 4, 6, 14],
    [A("s6:melempari") + 0.4, VX - 20, 12, 47, VX, 3.2, 21],
    [A("s6:Surah"), VX - 18, 13, 49, VX, 2.2, 22],
    [A("s6:dijadikan") + 0.4, VX - 13, 9, 42, VX, 1.2, 22],
    [K.s7, VX - 10, 8.5, 38, VX, 1.2, 20],
    [K.s7 + 3.5, VX - 6, 15, 37, VX, 1.2, 9],
    [A("s7:Nabi"), VX + 5, 16, 25, VX, 2, -1],
    [A("s7:Sebagian"), VX + 9, 20, 27, VX, 2, -3],
    [K.s8, VX + 6, 27, 35, VX, 2, -2],
    [K.s8 + 3.5, VX + 2, 46, 52, VX, 0, 2],
    [K.end, VX - 4, 60, 62, VX - 2, 0, 0],
    [K.dur, VX - 6, 62, 64, VX - 2, 0, -1],
  ]);
  const look = new THREE.Vector3(), sunDir = new THREE.Vector3();

  return (t) => {
    // ---------- camera
    let c;
    if (t < CUT1) c = camV1(t);
    else if (t < K.s3 + 0.2) c = camM(t);
    else if (t < CUT2) {
      const [hx, hz] = onRoute(headU(t)), o = camF(t), w = ramp(t, A("s3:Kabilah-kabilah") - 0.3, A("s3:Kabilah-kabilah") + 1.2);
      const mid = RC.getPointAt(uS + 0.62 * (1 - uS));
      const tx = hx + (mid.x - hx) * w, tz = hz + (mid.z - hz) * w;
      const blend = ramp(t, K.s3 + 0.2, K.s3 + 1.0), m0 = camM(K.s3 + 0.2);
      const f = [tx + o[0], LANDY + o[1], tz + o[2], tx, LANDY + 0.25, tz];
      c = f.map((v, i) => m0[i] + (v - m0[i]) * blend);
    } else c = camV2(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.12, c[1] + Math.sin(t * 0.29) * 0.08, c[2] + Math.cos(t * 0.31) * 0.12);
    look.set(c[3], c[4], c[5]); cam.lookAt(look);

    // ---------- dusk to night
    const night = ramp(t, K.s7 - 1, K.s8 + 2);
    sunDir.set(-0.85, 0.42 - 0.16 * night, 0.32).normalize();
    sun.target.position.set(c[3], 0, c[5]); sun.position.copy(sun.target.position).addScaledVector(sunDir, 160);
    sun.intensity = 3.1 - 1.9 * night; sun.color.setRGB(1, 0.6 - 0.12 * night, 0.35 - 0.05 * night);
    hemi.intensity = 0.95 - 0.35 * night; hemi.color.setRGB(1 - 0.35 * night, 0.79 - 0.25 * night, 0.63 - 0.05 * night);
    const sh = t > CUT1 && t < CUT2 ? 55 : 45 + 30 * ramp(t, K.s8, K.end);
    Object.assign(sun.shadow.camera, { left: -sh, right: sh, top: sh, bottom: -sh }); sun.shadow.camera.updateProjectionMatrix();
    stars.m.opacity = night;

    // ---------- map
    for (const l of LBL) l.m.scale.setScalar(l.at === -1 ? 1 : Math.max(0.001, back((t - A(l.at)) / 0.45)));
    for (const l of LEADS) l.l.visible = t > A(l.at) + 0.2;
    for (const q of PULSE) { const u = (t - A(q.at)) / 1.4; q.m.material.opacity = u > 0 && u < 1 ? 0.9 * (1 - u) : 0; q.m.scale.setScalar(0.5 + 2.2 * clamp01(u)); }
    church.scale.setScalar(Math.max(0.001, back((t - A("s2:gereja") + 0.3) / 0.5)));
    stele.scale.set(1, Math.max(0.001, back((t - A("s2:Prasasti") + 0.2) / 0.5)), 1);
    dash.material.opacity = 0.85 * ramp(t, A("s2:berziarah") - 0.2, A("s2:berziarah") + 0.6) * (1 - ramp(t, K.s3 + 2, K.s3 + 4));
    dash.material.dashOffset = -t * 0.8;
    const hu = t < K.s3 ? uS : headU(t);
    const drawU = Math.min(1, hu + (t > K.s3 ? 0.02 : 0));
    const i0 = Math.floor(uS * TUBS), i1 = Math.max(i0, Math.floor(drawU * TUBS));
    tube.geometry.setDrawRange(i0 * RAD * 6, (i1 - i0) * RAD * 6);
    const moving = t > K.s3 - 0.2 && t < K.s3e + 0.3;
    MEL.forEach((e, i) => {
      const u = hu - (i === 0 ? 0 : (0.55 + i * 0.62)) / RL, [x, z, yaw] = onRoute(u);
      poseEl(e, x, LANDY, z, yaw, t * 7 + i, moving ? 0.35 : 0);
      e.G.visible = u > 0.002 && t > K.s2 - 1;
    });
    for (let j = 0; j < NMS; j++) {
      const u = hu - (5.0 + Math.floor(j / 3) * 0.32) / RL, [x, z, yaw] = onRoute(u, ((j % 3) - 1) * 0.2);
      setI(mapSold, j, x, LANDY + (moving ? Math.abs(Math.sin(t * 9 + j)) * 0.03 : 0), z, yaw, u > 0.002 ? 0.34 : 0.0001);
    }
    mapSold.instanceMatrix.needsUpdate = true;
    for (let k = 0; k < NKB; k++) {
      const g = Math.floor(k / 4), [x, z, yaw] = onRoute(KABU[g] + 0.006 + (k % 2) * 0.004, ((k % 4) - 1.5) * 0.26);
      const tip = eout((t - kabTip[g] - (k % 4) * 0.06) / 0.35);
      setI(kab, k, x, LANDY, z, yaw + Math.PI, 0.36, 0, tip * 1.45);
    }
    kab.instanceMatrix.needsUpdate = true;
    tagMahM.visible = t > A("s3:Mahmud") - 0.3 && t < A("s3:Kabilah-kabilah") + 0.3;
    { const [x, z] = onRoute(hu); tagMahM.position.set(x, LANDY + 1.75, z); tagMahM.material.opacity = ramp(t, A("s3:Mahmud") - 0.3, A("s3:Mahmud")); }

    // ---------- valley: army
    const az = armyZ(t), mv = marching(t);
    const kneel = ramp(t, A("s6:berhenti"), A("s6:menolak") + 0.5);
    DEL.forEach((d, i) => {
      const z = d.z + az, sc = i === 0 ? 1 : 1 - ramp(t, crumbleT(z) + 0.15, crumbleT(z) + 0.8);
      poseEl(d.e, d.x, H(d.x, z), z, Math.PI / 2, t * 4.2 + d.ph, mv * 0.32, i === 0 ? kneel : 0);
      d.e.G.scale.setScalar(Math.max(0.001, (i === 0 ? 0.68 : 0.55) * sc));
      d.e.G.visible = sc > 0.002;
    });
    tagMahD.visible = t > K.s6 - 0.2 && t < A("s6:burung") - 0.3;
    tagMahD.position.set(DEL[0].x, H(DEL[0].x, DEL[0].z + az) + 2.9 - 0.5 * kneel, DEL[0].z + az);
    SOLD.forEach((s, i) => {
      const [x, z] = soldPos(s, t), sc = 1 - ramp(t, crumbleT(s.z - 4) + 0.1, crumbleT(s.z - 4) + 0.5);
      setI(sold, i, x, H(x, z) + mv * Math.abs(Math.sin(t * 6 + s.ph)) * 0.04, z, Math.PI / 2, Math.max(0.0001, sc));
    });
    sold.instanceMatrix.needsUpdate = true;

    // camels
    CAM.forEach((m, i) => {
      const a = herdA + m.k * (herdB - herdA - 2.4), u = ramp(t, a, a + 2.4);
      const x = m.x0 + (m.x1 - m.x0) * u, z = m.z0 + (m.z1 - m.z0) * u;
      const walking = u > 0.01 && u < 0.99;
      const yaw = walking ? Math.atan2(-(m.z1 - m.z0), m.x1 - m.x0) : m.yaw + Math.sin(t * 0.3 + m.ph) * 0.2;
      setI(camels, i, x, H(x, z) + (walking ? Math.abs(Math.sin(t * 8 + m.ph)) * 0.05 : 0), z, yaw, 0.95);
    });
    camels.instanceMatrix.needsUpdate = true;

    // Abdul Muthalib: from the valley to Abrahah, then up to the hills with his people
    {
      const u1 = ramp(t, amA, amB), u2 = ramp(t, A("s5:Lalu") + 0.6, K.s6 + 3.5);
      let x = AMstart[0] + (AMmeet[0] - AMstart[0]) * u1, z = AMstart[1] + (AMmeet[1] - AMstart[1]) * u1;
      x += (AMhill[0] - AMmeet[0]) * u2; z += (AMhill[1] - AMmeet[1]) * u2;
      AM.position.set(x, H(x, z), z);
      AM.rotation.y = u2 > 0.01 ? Math.atan2(AMhill[0] - AMmeet[0], AMhill[1] - AMmeet[1]) : Math.atan2(AMmeet[0] - AMstart[0], AMmeet[1] - AMstart[1]) * (1 - ramp(t, amB - 0.4, amB + 0.2));
      AM.visible = t > CUT2;
      tagAM.visible = t > A("s4:Abdul") - 0.2 && t < A("s5:mengungsi"); tagAM.position.set(x, H(x, z) + 2.15, z);
      const ue = ramp(t, A("s5:Lalu") + 0.2, A("s5:Lalu") + 2.2);
      const bx = ABpos[0] + (TENT[0] - ABpos[0]) * ue, bz = ABpos[1] + (TENT[1] - ABpos[1]) * ue;
      AB.position.set(bx, H(bx, bz), bz); AB.rotation.y = Math.PI; AB.scale.setScalar(Math.max(0.001, 2.1 * (1 - ramp(t, A("s5:Lalu") + 1.6, A("s5:Lalu") + 2.2))));
      AB.visible = t > CUT2 && t < K.s6;
      tagAB.visible = t > A("s4:Abrahah") - 0.2 && t < A("s5:Lalu") + 0.6; tagAB.position.set(bx, H(bx, bz) + 2.3, bz);
    }

    // Meccans to the hills
    MEC.forEach((m, i) => {
      const u = ramp(t, goA + m.d, goA + m.d + 3.2), x = m.x0 + (m.x1 - m.x0) * u, z = m.z0 + (m.z1 - m.z0) * u;
      const w = u > 0.01 && u < 0.99;
      setI(mec, i, x, H(x, z) + (w ? Math.abs(Math.sin(t * 9 + i)) * 0.05 : 0), z, Math.atan2(-(m.z1 - m.z0), m.x1 - m.x0) - Math.PI / 2 * (1 - (w ? 1 : 0)), 1.6);
    });
    mec.instanceMatrix.needsUpdate = true;
    LAMP.emissiveIntensity = 3 * ramp(t, A("s7:Nabi") - 0.4, A("s7:Nabi") + 0.8);

    // birds
    const fl = flock(t);
    for (let i = 0; i < NB; i++) {
      const p = birdPos(i, t);
      if (!p) { setI(wl, i, 0, -50, 0, 0, 0.0001); setI(wr, i, 0, -50, 0, 0, 0.0001); setI(bb, i, 0, -50, 0, 0, 0.0001); continue; }
      const q = birdPos(i, t + 0.05) || p, yaw = Math.atan2(-(q[2] - p[2]), q[0] - p[0]), b = BS[i];
      const fa = Math.sin(t * b.f + b.p) * 0.85, s = b.s * (fl[1] === 1 ? 1.4 : 1.0);
      setI(wl, i, p[0], p[1], p[2], yaw, s, fa, 0); setI(wr, i, p[0], p[1], p[2], yaw, s, -fa, 0); setI(bb, i, p[0], p[1], p[2], yaw, s);
    }
    wl.instanceMatrix.needsUpdate = wr.instanceMatrix.needsUpdate = bb.instanceMatrix.needsUpdate = true;

    // pebbles
    for (let k = 0; k < NP; k++) {
      const ps = PS[k];
      if (t < pebA || t > pebB) { peb.pos[k * 3 + 1] = -60; continue; }
      const x0 = t - pebA + ps.ph * ps.P, n = Math.floor(x0 / ps.P), u = (x0 - n * ps.P) / ps.P, ts = t - u * ps.P;
      const src = birdPos((ps.b + n * 13) % NB, ts), so = SOLD[(ps.s + n * 7) % NS];
      if (!src || ts < pebA) { peb.pos[k * 3 + 1] = -60; continue; }
      const [tx, tz] = soldPos(so, ts), ty = H(tx, tz) + 0.3;
      peb.pos[k * 3] = src[0] + (tx - src[0]) * u; peb.pos[k * 3 + 2] = src[2] + (tz - src[2]) * u;
      peb.pos[k * 3 + 1] = src[1] + (ty - src[1]) * u * u;
      const g = 0.65 + 0.35 * u;
      peb.col[k * 3] = 1 * g; peb.col[k * 3 + 1] = 0.62 * g; peb.col[k * 3 + 2] = 0.25 * g;
    }
    peb.commit();

    // leaves
    LS.forEach((l, i) => {
      let sx, sz, tc;
      if (l.src >= 0) { const s = SOLD[l.src];[sx, sz] = soldPos(s, t); tc = crumbleT(s.z - 4) + 0.1; }
      else { const d = DEL[l.el]; sx = d.x; sz = d.z + az; tc = crumbleT(sz) + 0.15; }
      const u = t - tc - l.d * 0.4;
      if (u < 0) { setI(leaves, i, 0, -50, 0, 0, 0.0001); return; }
      const uf = Math.min(u, l.Tf), dr = 1 - Math.exp(-uf * 1.1);
      const x = sx + l.dx + l.wx * dr, z = sz + l.dz + l.wz * dr, g = H(x, z) + 0.03;
      const fall = clamp01(u / l.Tf);
      const y = g + (l.h + 0.5 * Math.sin(Math.PI * Math.min(1, fall * 1.3))) * (1 - fall * fall);
      const land = ramp(u, l.Tf - 0.25, l.Tf);
      setI(leaves, i, x, y, z, l.r1 + uf * 1.5, l.s, (u * l.f) * (1 - land) - Math.PI / 2 * land, Math.sin(u * l.f * 0.7) * 1.2 * (1 - land));
    });
    leaves.instanceMatrix.needsUpdate = true;

    // sand motes near the lens
    const dp = dust.pos;
    for (let i = 0; i < NDU; i++) {
      const d = dseed[i];
      dp[i * 3] = c[0] + (c[3] - c[0]) * (0.1 + 0.45 * d[0]) + (d[1] - 0.5) * 12 + ((t * 0.9 + d[3] * 20) % 12) - 6;
      dp[i * 3 + 1] = c[4] + (c[1] - c[4]) * (0.2 + 0.5 * d[2]) + Math.sin(t * 0.4 + d[0] * 7) * 0.6;
      dp[i * 3 + 2] = c[2] + (c[5] - c[2]) * (0.1 + 0.45 * d[0]) + (d[3] - 0.5) * 12;
    }
    dust.commit();
    dust.m.opacity = 0.5 * (1 - night * 0.6);

    bp.strength = 0.28 + 0.35 * (t > pebA && t < pebB + 0.5 ? 1 : 0) + 0.25 * night;
    comp.render();
  };
}
