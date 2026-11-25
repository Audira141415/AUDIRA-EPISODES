// EP26 SAMPAH JADI LISTRIK. CLAYWORLD look: a hand-pressed plasticine table-top diorama of Palembang's waste-to-energy
// plant (PSEL Keramasan), built as a cutaway so the whole chain reads left to right along +x:
// clay city + Musi river (x -46..-22) -> road + ramp (-24..-7) -> tipping deck (-7..-2) -> bunker + crane grab (-2..5)
// -> hopper + inclined moving grate + furnace shaft (5..13) -> ash bin (13..15) -> boiler + steam drum (13..17)
// -> turbine + generator (17..25, front) ; flue-gas train (reactor, bag house, stack) behind (z -7..-3)
// -> substation + pylon line back to the city (z -10).
// Materials: MeshPhysical clay, low sheen (0.22, #ffe4d2), visible fingerprint/grain bump so colours stay saturated.
// Warm studio light, RoomEnvironment reflections at 0.55, exposure 1, soft shadows as the AO stand-in.
// Animation of props is stepped at 15 fps (stop-motion cadence); the camera glides. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { ShaderPass } from "./ShaderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, ramp, clamp01, canvasTex, track, eout, back } from "./lib3d.js";

const W = 1080, H = 1920;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerp = THREE.MathUtils.lerp;
const win = (t, a, b, fi = 0.4, fo = 0.4) => ramp(t, a - fi, a + fi) * (1 - ramp(t, b - fo, b + fo));
const step15 = (t) => Math.floor(t * 15) / 15;
const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
const frac = (x) => x - Math.floor(x);

const PAL = {
  terracotta: "#d95a3d", mustard: "#e8a838", olive: "#5a7846", coral: "#e26d6a", teal: "#3b828a", cream: "#f6efe3",
  earth: "#513b2c", charcoal: "#2b2725", lilac: "#9b7fc4", leaf: "#6fae4a", sky: "#4f97d9", pink: "#f29bb5",
  concrete: "#d3c6b2", brick: "#b8553a", ash: "#b9b2a6", board: "#7d9a55", table: "#b98a5e",
};

// ---------- geometry helpers ----------
function rbox(w, h, d, r, seg = 3) {
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
  s.moveTo(x, y - r); s.lineTo(x + ww, y - r); s.quadraticCurveTo(x + ww + r, y - r, x + ww + r, y);
  s.lineTo(x + ww + r, y + hh); s.quadraticCurveTo(x + ww + r, y + hh + r, x + ww, y + hh + r);
  s.lineTo(x, y + hh + r); s.quadraticCurveTo(x - r, y + hh + r, x - r, y + hh); s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelSize: r * 0.98, bevelThickness: r, bevelSegments: seg, curveSegments: 5 });
  g.translate(0, 0, -(d - 2 * r) / 2); g.computeVertexNormals();
  return g;
}
// hand-rolled lump: sphere with seeded low-frequency dents (indexed, so normals stay smooth)
function lumpGeo(seed, wS = 18, hS = 12, amp = 0.2) {
  const g = new THREE.SphereGeometry(1, wS, hS), p = g.attributes.position, R = mulberry(seed);
  const a = [R() * 6, R() * 6, R() * 6, R() * 6, R() * 6, R() * 6];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = 1 + amp * (Math.sin(2.3 * x + a[0]) * Math.sin(2.1 * y + a[1]) + 0.6 * Math.sin(3.7 * z + a[2]) * Math.sin(3.1 * x + a[3]) + 0.3 * Math.sin(5.3 * y + a[4] + 4 * z));
    p.setXYZ(i, x * k, y * k * 0.86, z * k);
  }
  g.computeVertexNormals();
  return g;
}
function tube(points, r, seg = 64) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), seg, r, 14, false);
}

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.1, 900);
  cam.setViewOffset(W, H, 0, -110, W, H); // subjects sit a little low: panels own the top band
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const s = K;
  const E = {
    truk1: A_("s1:truk", s.s1 + 3), des1: A_("s1:Desember", s.s1 + 4), dibakar: A_("s1:dibakar", s.s1 + 5.3), tungku: A_("s1:tungku", s.s1 + 6), listrik1: A_("s1:listrik", s.s1 + 9),
    psel: A_("s2:PSEL", s.s2 + 2.5), uji: A_("s2:uji", s.s2 + 5), alir: A_("s2:mengalirkan", s.s2 + 6.5), pln2: A_("s2:PLN", s.s2 + 9.5), resmi: A_("s2:Peresmian", s.s2 + 10.5),
    truk3: A_("s3:Truk", s.s3), tumpah: A_("s3:menumpahkan", s.s3 + 0.4), bunker: A_("s3:bunker", s.s3 + 1.6), diperam: A_("s3:diperam", s.s3 + 3.6), hari: A_("s3:hari", s.s3 + 5.3),
    airnya: A_("s3:Airnya", s.s3 + 6), kering: A_("s3:kering", s.s3 + 7.7), capit: A_("s3:Capit", s.s3 + 8.3), angkat: A_("s3:mengangkatnya", s.s3 + 9.4), corong: A_("s3:corong", s.s3 + 10.7),
    jeruji: A_("s4:jeruji", s.s4 + 0.8), geser: A_("s4:bergeser", s.s4 + 2), udara: A_("s4:Udara", s.s4 + 4.7), atas: A_("s4:atas", s.s4 + 6.4), tengah: A_("s4:tengah", s.s4 + 7.9), ujung: A_("s4:ujung", s.s4 + 9.3), abu4: A_("s4:abu", s.s4 + 10.3),
    rebus: A_("s5:merebus", s.s5 + 0.8), uap1: A_("s5:uap", s.s5 + 3.4), turbin: A_("s5:turbin", s.s5 + 6.3), gen: A_("s5:generator", s.s5 + 8), kap: A_("s5:Kapasitasnya", s.s5 + 9), dijual: A_("s5:dijual", s.s5 + 11.5),
    kenapa: A_("s6:Kenapa", s.s6), gas: A_("s6:gas", s.s6 + 4.5), d850: A_("s6:850", s.s6 + 6.4), detik: A_("s6:detik", s.s6 + 8.6), dioksin: A_("s6:dioksin", s.s6 + 10.3),
    asap: A_("s6:Asapnya", s.s6 + 11.3), kapur: A_("s6:kapur", s.s6 + 12), karbon: A_("s6:karbon", s.s6 + 12.7), kantong: A_("s6:kantong", s.s6 + 13.6),
    pabrik: A_("s7:Pabriknya", s.s7), setara: A_("s7:setara", s.s7 + 3.5), rumah: A_("s7:rumah", s.s7 + 5.3), tapi: A_("s7:Tapi", s.s7 + 5.9), abunya: A_("s7:Abunya", s.s7 + 7.4),
    ditimbun: A_("s8:ditimbun", s.s8 + 1.2), nyala: A_("s8:menyalakan", s.s8 + 2.2), ikuti: A_("s8:Ikuti", s.s8 + 3.6),
  };

  const S = new THREE.Scene();
  S.background = new THREE.Color("#2a201b");
  S.fog = new THREE.Fog("#3a2a22", 70, 170);
  const pm = new THREE.PMREMGenerator(r);
  S.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  S.environmentIntensity = 0.55;
  S.add(new THREE.HemisphereLight(0xfff1dc, 0x4a3326, 0.5));
  const key = new THREE.DirectionalLight(0xfff0d8, 2.0);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.04; key.shadow.radius = 4;
  const sc_ = key.shadow.camera; sc_.near = 1; sc_.far = 160;
  S.add(key, key.target);
  const bounce = new THREE.PointLight(0xffd8bf, 10, 60, 1.6); S.add(bounce);
  const rim = new THREE.DirectionalLight(0xffe6c8, 1.1); rim.position.set(-10, 18, -30); S.add(rim);
  const fireL = new THREE.PointLight(0xff7a2a, 30, 16, 1.6); fireL.position.set(9.5, 3.6, 1.2); S.add(fireL);

  // ---------- clay grain bump (seeded blotches + fingerprint whorls) ----------
  const grain = canvasTex(512, 512, (c, w, h) => {
    const R = mulberry(2626);
    c.fillStyle = "#808080"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { const x = R() * w, y = R() * h, rr = 1 + R() * 5; c.fillStyle = R() < 0.5 ? `rgba(255,255,255,${0.05 + R() * 0.08})` : `rgba(0,0,0,${0.05 + R() * 0.08})`; c.beginPath(); c.arc(x, y, rr, 0, 6.283); c.fill(); }
    for (let i = 0; i < 9000; i++) { const x = R() * w, y = R() * h; c.fillStyle = `rgba(${R() < 0.5 ? 255 : 0},${R() < 0.5 ? 255 : 0},${R() < 0.5 ? 255 : 0},.12)`; c.fillRect(x, y, 1.5, 1.5); }
    c.lineWidth = 1.4;
    for (let f = 0; f < 6; f++) {
      const cx = R() * w, cy = R() * h;
      for (let k = 3; k < 46; k += 3.2) { c.strokeStyle = `rgba(0,0,0,${0.1 + 0.05 * R()})`; c.beginPath(); c.ellipse(cx, cy, k * 1.25, k, R() * 3, 0.3, 5.6); c.stroke(); }
    }
    for (let i = 0; i < 40; i++) { const x = R() * w, y = R() * h; c.strokeStyle = "rgba(255,255,255,.12)"; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 20 * R(), y + 30 * R(), x + 40 * R() - 20, y + 50 * R()); c.stroke(); }
  }, [2, 2]);
  grain.colorSpace = THREE.NoColorSpace;
  const clay = (color, o = {}) => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color), roughness: o.rough ?? 0.74, metalness: 0, sheen: 0.22, sheenColor: new THREE.Color("#ffe4d2"), sheenRoughness: 0.6,
    bumpMap: grain, bumpScale: o.bump ?? 1.6, ...(o.extra || {}),
  });
  const M = {
    board: clay(PAL.board, { bump: 2.2 }), table: clay(PAL.table, { rough: 0.85 }), road: clay("#8d7f74", { bump: 2 }), mark: clay(PAL.cream),
    concrete: clay(PAL.concrete), concreteDk: clay("#bfae97"), cut: clay("#e38b62"), brick: clay(PAL.brick), brickDk: clay("#8e3d2a"),
    cream: clay(PAL.cream), mustard: clay(PAL.mustard), teal: clay(PAL.teal), coral: clay(PAL.coral), terracotta: clay(PAL.terracotta), olive: clay(PAL.olive),
    charcoal: clay(PAL.charcoal), earth: clay(PAL.earth), leaf: clay(PAL.leaf), sky: clay(PAL.sky), lilac: clay(PAL.lilac), ash: clay(PAL.ash),
    river: clay("#4f97d9", { rough: 0.35, bump: 0.8 }), glass: new THREE.MeshPhysicalMaterial({ color: "#2b3540", roughness: 0.12, metalness: 0, clearcoat: 1 }),
    copper: new THREE.MeshPhysicalMaterial({ color: "#c7774a", roughness: 0.35, metalness: 0.8 }), steel: new THREE.MeshPhysicalMaterial({ color: "#c9ccd2", roughness: 0.3, metalness: 0.85 }),
    tubes: clay("#4f97d9"), gen: clay("#3f9a6a"), white: clay("#fbf6ee", { rough: 0.85, bump: 1 }),
  };
  const BASIC = (hex, k = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k) });

  const world = new THREE.Group(); S.add(world);
  const add = (geo, mat, x, y, z, parent = world, rot) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rot) m.rotation.set(rot[0], rot[1], rot[2]); parent.add(m); return m; };
  const rb = (w, h, d, mat, x, y, z, rr = 0.12, parent = world) => add(rbox(w, h, d, rr), mat, x, y, z, parent);

  // ---------- backdrop: warm studio sweep ----------
  {
    const tx = canvasTex(256, 1024, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#1f1714"); g.addColorStop(0.42, "#4a3326"); g.addColorStop(0.52, "#8a5a40"); g.addColorStop(1, "#5a3c2c"); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.MeshBasicMaterial({ map: tx, side: THREE.BackSide, depthWrite: false, fog: false }));
    dome.renderOrder = -10; S.add(dome);
  }
  // table + clay board
  add(new THREE.PlaneGeometry(600, 600), M.table, 0, -1.25, 0, world, [-Math.PI / 2, 0, 0]);
  rb(84, 1.2, 30, M.board, -6, -0.6, -1, 0.5);
  // little clay grass tufts on the board edge
  // river (Musi) in front of the city + red bridge
  rb(34, 0.3, 4.2, M.river, -36, 0.0, 9.5, 0.14);
  {
    const red = clay("#c8402e");
    for (const tx_ of [-46.5, -41.5]) { rb(0.8, 6.5, 0.8, red, tx_, 3.2, 8.3, 0.2); rb(0.8, 6.5, 0.8, red, tx_, 3.2, 10.7, 0.2); rb(0.9, 0.7, 3.2, red, tx_, 6.6, 9.5, 0.2); }
    rb(10, 0.35, 2.6, M.concrete, -44, 1.2, 9.5, 0.12);
    rb(1.6, 1.2, 2.6, M.concrete, -49.6, 0.6, 9.5, 0.2); rb(1.6, 1.2, 2.6, M.concrete, -38.4, 0.6, 9.5, 0.2);
  }

  // ---------- city of clay houses ----------
  const houseCols = [PAL.coral, PAL.mustard, PAL.teal, PAL.cream, PAL.lilac, PAL.sky, PAL.pink, PAL.leaf];
  const roofCols = [PAL.terracotta, "#8e3d2a", PAL.earth, "#c8402e"];
  const RH = mulberry(77);
  const roofG = new THREE.CylinderGeometry(0.0001, 1.25, 1.0, 4, 1); roofG.rotateY(Math.PI / 4);
  const winPos = [];
  for (let ix = 0; ix < 6; ix++) for (let iz = 0; iz < 4; iz++) {
    if (ix === 5 && iz === 0) continue;
    const x = -44 + ix * 3.6 + (RH() - 0.5) * 0.6, z = -8.5 + iz * 3.6 + (RH() - 0.5) * 0.5;
    const w = 1.9 + RH() * 0.5, h = 1.5 + RH() * 1.3, d = 1.8 + RH() * 0.4;
    rb(w, h, d, clay(houseCols[Math.floor(RH() * houseCols.length)]), x, h / 2, z, 0.22);
    const rf = add(roofG, clay(roofCols[Math.floor(RH() * 4)]), x, h + 0.5, z); rf.scale.set(w / 1.7, 1, d / 1.7);
    rb(0.45, 0.8, 0.12, M.earth, x - w * 0.22, 0.4, z + d / 2 + 0.02, 0.06);
    winPos.push([x + w * 0.18, h * 0.55, z + d / 2 + 0.04, w, h]);
  }
  // windows: instanced, dark -> warm lamp glow
  const winG = rbox(0.55, 0.5, 0.08, 0.08);
  const winM = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const wins = new THREE.InstancedMesh(winG, winM, winPos.length);
  const WD = new THREE.Color("#3a3036"), WL = new THREE.Color("#ffc65a").multiplyScalar(1.6), tmpC = new THREE.Color();
  const mtx = new THREE.Matrix4();
  winPos.forEach((p, i) => { mtx.makeTranslation(p[0], p[1], p[2]); wins.setMatrixAt(i, mtx); wins.setColorAt(i, WD); });
  world.add(wins);
  // order of lighting: nearest to the power line first
  const winOrder = winPos.map((p, i) => [i, Math.hypot(p[0] + 24, p[2] + 10)]).sort((a, b) => a[1] - b[1]).map((a, k) => [a[0], k]);
  // round clay trees
  const trunkG = new THREE.CylinderGeometry(0.12, 0.16, 1.0, 8); trunkG.translate(0, 0.5, 0);
  const crownG = lumpGeo(5, 16, 12, 0.12);
  const RT = mulberry(91);
  for (let i = 0; i < 26; i++) {
    let x, z;
    if (i < 14) { x = -46 + RT() * 24; z = -11 + RT() * 15; } else { x = -22 + RT() * 50; z = -13 + RT() * 2.5; }
    if (i < 14 && ((x + 44) % 3.6 < 2.6) && ((z + 8.5) % 3.6 < 2.4)) { x -= 1.4; }
    add(trunkG, M.earth, x, 0, z);
    const cr = add(crownG, clay(RT() < 0.5 ? PAL.leaf : PAL.olive), x, 1.55, z); cr.scale.setScalar(0.6 + RT() * 0.35);
  }

  // ---------- road, ramp, tipping deck ----------
  rb(18, 0.16, 3.8, M.road, -24, 0.06, 0, 0.07);
  for (let i = 0; i < 7; i++) rb(1.0, 0.06, 0.18, M.mark, -31 + i * 2.4, 0.16, 0, 0.03);
  {
    const sh = new THREE.Shape(); sh.moveTo(-15, 0); sh.lineTo(-7, 3); sh.lineTo(-7, 0); sh.lineTo(-15, 0);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 2.8, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1, bevelSegments: 2 }); g.translate(0, 0, -1.4); g.computeVertexNormals();
    add(g, M.concreteDk, 0, 0, 0);
  }
  rb(5.2, 3.0, 6.2, M.concrete, -4.6, 1.5, 0, 0.18);
  rb(5.2, 0.12, 0.25, M.mustard, -4.6, 3.05, 3.0, 0.05);
  // sign plate on the deck front: PSEL KERAMASAN
  function plate(text, sub, w, h, bg, fg, x, y, z, ry = 0) {
    const tx = canvasTex(1024, Math.round(1024 * h / w), (c, cw, ch) => {
      c.fillStyle = bg; c.fillRect(0, 0, cw, ch);
      c.fillStyle = fg; c.textAlign = "center"; c.textBaseline = "middle";
      c.font = `900 ${Math.round(ch * (sub ? 0.46 : 0.6))}px "Baloo 2", "Arial Black", sans-serif`; c.fillText(text, cw / 2, ch * (sub ? 0.4 : 0.54));
      if (sub) { c.font = `700 ${Math.round(ch * 0.2)}px "Nunito", Arial, sans-serif`; c.fillText(sub, cw / 2, ch * 0.78); }
    });
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; world.add(g);
    add(rbox(w + 0.3, h + 0.3, 0.22, 0.1), clay(fg === "#ffffff" ? PAL.charcoal : PAL.earth), 0, 0, -0.05, g);
    const face = add(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tx, color: new THREE.Color(0.9, 0.9, 0.9) }), 0, 0, 0.125, g);
    return g;
  }
  plate("PSEL KERAMASAN", "PALEMBANG", 4.4, 1.5, PAL.mustard, "#3b2a20", -4.6, 1.5, 3.2);

  // ---------- bunker (cutaway) ----------
  rb(7.4, 0.5, 6.0, M.concreteDk, 1.5, 0.25, -0.3, 0.12);           // floor
  rb(7.6, 6.2, 0.6, M.concrete, 1.5, 3.1, -3.3, 0.18);             // back wall
  rb(0.6, 6.2, 6.0, M.concrete, 5.1, 3.1, -0.3, 0.18);             // right wall (towards furnace)
  rb(7.6, 1.2, 0.5, M.concrete, 1.5, 0.6, 2.6, 0.16);              // low front lip
  rb(7.6, 0.14, 0.52, M.cut, 1.5, 1.22, 2.6, 0.05);                // sliced-clay cut face
  rb(0.62, 0.14, 6.0, M.cut, 5.1, 6.22, -0.3, 0.05);
  // leachate channel along the front, with a grill
  rb(7.0, 0.25, 0.6, clay("#3f6f8a", { rough: 0.4 }), 1.5, 0.52, 2.0, 0.08);
  plate("BUNKER", null, 2.0, 0.62, PAL.cream, "#3b2a20", -0.6, 1.0, 2.95);
  // garbage pile: 4 lump shapes x instanced, bright clay colours
  const junkCols = [PAL.coral, PAL.mustard, PAL.teal, PAL.lilac, PAL.leaf, PAL.sky, PAL.cream, PAL.pink, PAL.terracotta, "#ffd166"].map((c) => new THREE.Color(c));
  const lumpGs = [lumpGeo(11), lumpGeo(12), lumpGeo(13), lumpGeo(14)];
  const pileN = 90, pile = [], RP = mulberry(303);
  const pileMeshes = lumpGs.map((g) => { const m = new THREE.InstancedMesh(g, M.cream, pileN); m.frustumCulled = false; world.add(m); return m; });
  const lumpMat = clay("#ffffff");
  pileMeshes.forEach((m) => (m.material = lumpMat));
  const hs = (x, z) => Math.max(0.3, 3.4 - 0.16 * (x - 0.6) ** 2 - 0.12 * (z + 1.6) ** 2);
  pileMeshes.forEach((m, k) => {
    for (let i = 0; i < pileN; i++) {
      const x = -1.5 + RP() * 6.1, z = -2.8 + RP() * 4.6, h = hs(x, z), y = 0.6 + RP() * h, sc = 0.32 + RP() * 0.28;
      pile.push({ m, i, x, y, z, sc, rx: RP() * 6, ry: RP() * 6 });
      m.setColorAt(i, junkCols[Math.floor(RP() * junkCols.length)]);
    }
  });
  // water drips (leachate) falling from the pile into the channel
  const dropG = lumpGeo(21, 10, 8, 0.05); dropG.scale(1, 1.4, 1);
  const dropM = new THREE.MeshPhysicalMaterial({ color: "#6fc3ff", roughness: 0.1, transmission: 0, clearcoat: 1, sheen: 0.2 });
  const drops = new THREE.InstancedMesh(dropG, dropM, 24); drops.frustumCulled = false; world.add(drops);
  const DR = mulberry(55), dropD = Array.from({ length: 24 }, () => ({ x: -1 + DR() * 5.2, z: 1.2 + DR() * 0.8, ph: DR(), sp: 0.7 + DR() * 0.6 }));
  // dumped lumps from the hero truck
  const dumpN = 26, dumpM = new THREE.InstancedMesh(lumpGs[2], lumpMat, dumpN); dumpM.frustumCulled = false; world.add(dumpM);
  const DD = mulberry(808), dumpD = Array.from({ length: dumpN }, (_, i) => { dumpM.setColorAt(i, junkCols[i % junkCols.length]); return { vx: 1.6 + DD() * 2.4, vz: (DD() - 0.5) * 3, vy: DD() * 1.5, dl: DD() * 0.8, sc: 0.3 + DD() * 0.2 }; });

  // ---------- overhead crane + grab ----------
  rb(9.6, 0.4, 0.4, M.mustard, 1.9, 7.4, -2.9, 0.1); rb(9.6, 0.4, 0.4, M.mustard, 1.9, 7.4, 2.2, 0.1);
  for (const x of [-2.6, 6.4]) for (const z of [-2.9, 2.2]) rb(0.4, 7.4, 0.4, M.mustard, x, 3.7, z, 0.12);
  const bridge = new THREE.Group(); world.add(bridge);
  rb(0.7, 0.55, 5.8, M.coral, 0, 7.85, -0.35, 0.14, bridge);
  const trolley = rb(1.1, 0.6, 1.1, M.teal, 0, 7.3, 0, 0.18, bridge);
  const cable = add(new THREE.CylinderGeometry(0.05, 0.05, 1, 8), M.charcoal, 0, 6, 0, bridge);
  const grab = new THREE.Group(); bridge.add(grab);
  add(new THREE.SphereGeometry(0.45, 18, 12), M.teal, 0, 0.3, 0, grab);
  rb(0.5, 0.5, 0.5, M.coral, 0, 0.75, 0, 0.12, grab);
  const claws = [];
  const clawG = new THREE.TorusGeometry(0.85, 0.14, 10, 16, Math.PI * 0.55);
  for (let k = 0; k < 6; k++) {
    const piv = new THREE.Group(); piv.rotation.y = (k / 6) * Math.PI * 2; grab.add(piv);
    const arm = new THREE.Group(); arm.position.set(0.3, 0.2, 0); piv.add(arm);
    const cl = add(clawG, M.coral, 0, -0.85, 0, arm, [0, 0, Math.PI * 0.45 + Math.PI]);
    claws.push(arm);
  }
  const grabbed = new THREE.Group(); grab.add(grabbed);
  { const RG = mulberry(4); for (let i = 0; i < 7; i++) { const m = add(lumpGs[i % 4], clay(junkCols[i].getStyle()), (RG() - 0.5) * 0.7, -0.55 - RG() * 0.4, (RG() - 0.5) * 0.7, grabbed); m.scale.setScalar(0.3); } }
  const fallN = 10, fallM = new THREE.InstancedMesh(lumpGs[1], lumpMat, fallN); fallM.frustumCulled = false; world.add(fallM);
  for (let i = 0; i < fallN; i++) fallM.setColorAt(i, junkCols[(i * 3) % junkCols.length]);

  // ---------- hopper, grate, furnace ----------
  const hop = add(new THREE.CylinderGeometry(1.9, 0.8, 1.8, 4, 1, true), clay("#9aa3ad", { extra: { side: THREE.DoubleSide } }), 6.6, 6.0, -0.3); hop.rotation.y = Math.PI / 4;
  rb(1.2, 1.3, 2.6, clay("#9aa3ad"), 6.7, 4.6, -0.3, 0.12);
  // furnace back + sides (firebrick), glowing inside face
  const glowTex = canvasTex(512, 1024, (c, w, h) => {
    c.fillStyle = "#8e3d2a"; c.fillRect(0, 0, w, h);
    const g = c.createRadialGradient(w * 0.45, h * 0.78, 10, w * 0.45, h * 0.78, h * 0.6); g.addColorStop(0, "rgba(255,200,90,1)"); g.addColorStop(0.35, "rgba(255,120,40,.85)"); g.addColorStop(1, "rgba(142,61,42,0)");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.strokeStyle = "rgba(60,20,10,.35)"; c.lineWidth = 4;
    for (let y = 0; y < h; y += 42) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); for (let x = (y / 42) % 2 ? 0 : 40; x < w; x += 80) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 42); c.stroke(); } }
  });
  const furnaceBack = new THREE.MeshStandardMaterial({ color: "#ffffff", map: glowTex, emissive: "#ffffff", emissiveMap: glowTex, emissiveIntensity: 0.4, roughness: 0.85, bumpMap: grain, bumpScale: 1.4 });
  add(new THREE.PlaneGeometry(7.6, 12.5), furnaceBack, 9.6, 6.0, -2.55);
  rb(8.2, 12.6, 0.5, M.brickDk, 9.6, 6.1, -2.95, 0.16);
  rb(0.5, 12.6, 5.2, M.brick, 13.55, 6.1, -0.3, 0.16);
  rb(0.5, 4.4, 5.2, M.brick, 5.65, 2.2, -0.3, 0.16);
  rb(3.4, 0.5, 5.2, M.brick, 7.5, 7.0, -0.3, 0.16);                 // furnace roof over the grate (shaft rises to the right)
  rb(0.5, 6.0, 5.2, M.brick, 9.15, 10.0, -0.3, 0.16);               // shaft left wall
  rb(4.9, 0.5, 5.2, M.brick, 11.35, 12.6, -0.3, 0.16);              // shaft roof
  rb(8.3, 0.9, 0.5, M.brick, 9.6, 0.45, 2.15, 0.14);                // low front lip
  rb(8.3, 0.14, 0.52, M.cut, 9.6, 0.95, 2.15, 0.05);
  plate("TUNGKU", null, 2.0, 0.62, PAL.cream, "#3b2a20", 7.4, 1.25, 2.55);
  // inclined step grate: A (top) -> B (bottom)
  const GA = v3(6.9, 3.7, 0), GB = v3(12.9, 1.3, 0), gDir = GB.clone().sub(GA), gLen = gDir.length(); gDir.normalize();
  const gNorm = v3(-gDir.y, gDir.x, 0); // points up-left
  const gAng = Math.atan2(gDir.y, gDir.x);
  const nBars = 11, bars = [];
  const barG = rbox(gLen / nBars * 1.05, 0.3, 4.2, 0.1);
  for (let i = 0; i < nBars; i++) {
    const b = add(barG, i % 2 ? clay("#5b5450") : clay("#6e6560"), 0, 0, -0.3); b.rotation.z = gAng; bars.push(b);
  }
  // grate support blocks
  rb(6.8, 0.6, 4.4, M.concreteDk, 9.9, 0.55, -0.3, 0.14);
  // air arrows under the grate
  const arrowM = clay("#7fc8ff"); arrowM.emissive = new THREE.Color("#2a7fd0"); arrowM.emissiveIntensity = 0.4;
  const arrows = [];
  for (let i = 0; i < 5; i++) {
    const g = new THREE.Group(); const u = 0.12 + i * 0.19; const p = GA.clone().lerp(GB, u); g.position.set(p.x, p.y - 1.2, 1.4); world.add(g);
    add(new THREE.CylinderGeometry(0.11, 0.11, 0.6, 10), arrowM, 0, 0, 0, g); add(new THREE.ConeGeometry(0.26, 0.4, 12), arrowM, 0, 0.48, 0, g);
    arrows.push({ g, base: p.y - 1.25, i });
  }
  // lumps travelling down the grate
  const gN = 70, gLumps = new THREE.InstancedMesh(lumpGs[0], lumpMat, gN); gLumps.frustumCulled = false; world.add(gLumps);
  const RGr = mulberry(1212), gD = Array.from({ length: gN }, () => ({ u0: RGr(), z: -2.2 + RGr() * 3.8, c: junkCols[Math.floor(RGr() * junkCols.length)].clone(), sc: 0.28 + RGr() * 0.2, rx: RGr() * 6 }));
  gD.forEach((d, i) => gLumps.setColorAt(i, d.c));
  const CHAR = new THREE.Color(PAL.charcoal), ASHC = new THREE.Color(PAL.ash), EMB = new THREE.Color("#ff6a2a");
  // clay flames (emissive basic, instanced, colours > 1 feed the bloom)
  const flameG = lumpGeo(31, 12, 10, 0.12); flameG.scale(0.55, 1.0, 0.55); flameG.translate(0, 0.9, 0);
  { const p = flameG.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); const k = clamp01(1 - (y - 0.4) / 1.6); p.setX(i, p.getX(i) * (0.35 + 0.65 * k)); p.setZ(i, p.getZ(i) * (0.35 + 0.65 * k)); } flameG.computeVertexNormals(); }
  const fN = 34, flames = new THREE.InstancedMesh(flameG, new THREE.MeshBasicMaterial({ color: 0xffffff }), fN); flames.frustumCulled = false; world.add(flames);
  const RF = mulberry(4444), fD = Array.from({ length: fN }, (_, i) => ({ u: 0.28 + RF() * 0.5, z: -2 + RF() * 3.4, s: 0.7 + RF() * 0.7, k: RF() }));
  const fCols = ["#ffd75e", "#ffa53a", "#ff6a2a", "#ffe9a0"].map((c) => new THREE.Color(c).multiplyScalar(2.4));
  fD.forEach((d, i) => flames.setColorAt(i, fCols[i % 4]));
  // hot gas parcel rising in the shaft (s6) + bead ring timer + thermometer
  const gasN = 7, gasM = new THREE.InstancedMesh(lumpGs[3], new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffb347").multiplyScalar(2.2) }), gasN); gasM.frustumCulled = false; world.add(gasM);
  const ring = new THREE.Group(); ring.position.set(11.4, 9.0, 2.6); world.add(ring);
  add(new THREE.TorusGeometry(1.45, 0.12, 12, 48), M.cream, 0, 0, -0.1, ring);
  const beadG = new THREE.SphereGeometry(0.17, 12, 10), beadOff = new THREE.MeshStandardMaterial({ color: "#5a4a44", roughness: 0.7 }), beads = [];
  for (let i = 0; i < 20; i++) { const a = Math.PI / 2 - (i / 20) * Math.PI * 2; const b = add(beadG, new THREE.MeshBasicMaterial({ color: 0xffffff }), Math.cos(a) * 1.45, Math.sin(a) * 1.45, 0.1, ring); beads.push(b); }
  const ringLabel = (() => { const tx = canvasTex(512, 256, (c, w, h) => { c.fillStyle = "#fff6e6"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `900 150px "Baloo 2", "Arial Black", sans-serif`; c.fillText("2 dtk", w / 2, h / 2 + 8); }); const m = add(new THREE.PlaneGeometry(1.9, 0.95), new THREE.MeshBasicMaterial({ map: tx, transparent: true }), 0, 0, 0.05, ring); return m; })();
  add(new THREE.CircleGeometry(1.32, 40), clay("#2f6b72"), 0, 0, -0.05, ring);
  const thermo = new THREE.Group(); thermo.position.set(8.0, 9.6, 2.6); world.add(thermo);
  add(new THREE.CapsuleGeometry(0.32, 4.2, 8, 16), M.white, 0, 0, 0, thermo);
  add(new THREE.SphereGeometry(0.55, 18, 14), clay("#e0442e"), 0, -2.3, 0.05, thermo);
  const tFill = add(new THREE.CylinderGeometry(0.18, 0.18, 1, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff5a32").multiplyScalar(1.4) }), 0, 0, 0.2, thermo);
  rb(0.9, 0.08, 0.1, M.charcoal, 0.2, 1.1, 0.3, 0.03, thermo);
  { const tx = canvasTex(512, 200, (c, w, h) => { c.fillStyle = "#3b2a20"; c.textBaseline = "middle"; c.font = `900 150px "Baloo 2", "Arial Black", sans-serif`; c.fillText("850°C", 10, h / 2 + 6); }); add(new THREE.PlaneGeometry(2.3, 0.9), new THREE.MeshBasicMaterial({ map: tx, transparent: true }), 0.5, 2.95, 0.3, thermo); }
  // dioxin molecule that breaks apart
  const mol = new THREE.Group(); mol.position.set(11.2, 11.0, 1.8); world.add(mol);
  const molParts = [];
  { const ballG = new THREE.SphereGeometry(0.22, 14, 10), cM = clay("#4a4442"), oM = clay("#e0442e"), clM = clay("#7bd04a");
    const P = [];
    for (const cx of [-0.95, 0.95]) for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + Math.PI / 6; P.push([cx + Math.cos(a) * 0.55, Math.sin(a) * 0.55, cM]); }
    P.push([0, 0.42, oM], [0, -0.42, oM], [-1.95, 0.6, clM], [-1.95, -0.6, clM], [1.95, 0.6, clM], [1.95, -0.6, clM]);
    for (const [x, y, m] of P) { const b = add(m === cM ? ballG : new THREE.SphereGeometry(m === clM ? 0.3 : 0.26, 14, 10), m, x, y, 0, mol); molParts.push({ b, x, y }); } }

  // ---------- ash bin ----------
  rb(2.4, 1.0, 3.4, M.concreteDk, 14.9, 0.5, 0.8, 0.14);
  const ashPile = add(lumpGeo(41, 18, 12, 0.15), M.ash, 14.9, 1.0, 0.8); ashPile.scale.set(1.0, 0.5, 1.4);
  plate("ABU", null, 1.2, 0.55, PAL.cream, "#3b2a20", 14.9, 0.5, 2.62);
  // little ash dumper
  const ashCart = new THREE.Group(); ashCart.position.set(12.4, 0, 3.7); world.add(ashCart);
  rb(1.6, 0.8, 1.2, M.mustard, 0, 0.75, 0, 0.16, ashCart); { const m = add(lumpGeo(42, 14, 10, 0.12), M.ash, 0, 1.15, 0, ashCart); m.scale.set(0.7, 0.28, 0.5); }
  for (const x of [-0.5, 0.5]) for (const z of [-0.62, 0.62]) add(new THREE.TorusGeometry(0.24, 0.12, 10, 18), M.charcoal, x, 0.3, z, ashCart);

  // ---------- boiler + drum ----------
  rb(3.8, 9.8, 0.5, clay("#d9cbb4"), 15.4, 7.6, -2.95, 0.16);
  rb(0.5, 9.8, 5.2, clay("#d9cbb4"), 17.35, 7.6, -0.3, 0.16);
  rb(3.8, 0.5, 5.2, clay("#d9cbb4"), 15.4, 12.6, -0.3, 0.16);
  const tubeMat = M.tubes;
  for (let i = 0; i < 9; i++) add(new THREE.CapsuleGeometry(0.16, 8.4, 6, 12), tubeMat, 13.9 + (i % 5) * 0.65 + (i > 4 ? 0.32 : 0), 7.7, i > 4 ? -1.4 : 0.2);
  const drum = add(new THREE.CapsuleGeometry(0.75, 3.2, 8, 20), M.cream, 15.3, 13.7, -0.6, world, [0, 0, Math.PI / 2]);
  plate("BOILER", null, 2.0, 0.62, PAL.cream, "#3b2a20", 15.4, 3.4, 2.4);
  // steam pipe from drum down to the turbine
  const steamPts = [v3(16.9, 13.7, -0.6), v3(18.6, 13.6, -0.2), v3(19.0, 11, 0.8), v3(19.0, 5, 1.2), v3(19.1, 3.2, 1.4), v3(19.6, 2.4, 1.4)];
  const steamCurve = new THREE.CatmullRomCurve3(steamPts);
  add(tube(steamPts, 0.32), M.cream, 0, 0, 0);
  const puffN = 22, puffs = new THREE.InstancedMesh(lumpGs[1], M.white, puffN); puffs.frustumCulled = false; world.add(puffs);
  const waterN = 10, waterB = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 12, 10), clay("#6fc3ff", { rough: 0.3 }), waterN); waterB.frustumCulled = false; world.add(waterB);

  // ---------- turbine + generator (front hall) ----------
  rb(9.0, 0.8, 3.6, M.concreteDk, 22.2, 0.4, 1.4, 0.18);
  const turb = new THREE.Group(); turb.position.set(20.6, 2.25, 1.4); world.add(turb);
  // casing: back half only (cutaway), stepped cone along x
  const casG = new THREE.LatheGeometry([[0.9, -2], [1.05, -1.6], [1.25, -0.6], [1.5, 0.6], [1.6, 1.5], [1.2, 2]].map(([rr, y]) => new THREE.Vector2(rr, y)), 32, Math.PI, Math.PI);
  casG.rotateZ(-Math.PI / 2); casG.computeVertexNormals();
  const casing = add(casG, clay(PAL.teal, { extra: { side: THREE.DoubleSide } }), 0, 0, 0, turb);
  casing.rotation.x = Math.PI / 2;
  const rotor = new THREE.Group(); turb.add(rotor);
  add(new THREE.CylinderGeometry(0.22, 0.22, 5.4, 16), M.steel, 0, 0, 0, rotor, [0, 0, Math.PI / 2]);
  const bladeCols = [PAL.mustard, PAL.coral, PAL.mustard, PAL.coral, PAL.mustard];
  [[-1.5, 0.75], [-0.8, 0.95], [-0.1, 1.15], [0.6, 1.3], [1.3, 1.42]].forEach(([x, rr], k) => {
    for (let b = 0; b < 12; b++) {
      const bl = add(rbox(0.12, rr - 0.25, 0.3, 0.05), clay(bladeCols[k]), x, 0, 0, rotor);
      const a = (b / 12) * Math.PI * 2; bl.rotation.set(a, 0, 0); bl.translateY((rr - 0.25) / 2 + 0.22); bl.rotateY(0.5);
    }
  });
  const gen = new THREE.Group(); gen.position.set(24.2, 2.25, 1.4); world.add(gen);
  add(new THREE.CapsuleGeometry(1.25, 1.6, 8, 24), M.gen, 0, 0, 0, gen, [0, 0, Math.PI / 2]);
  for (const x of [-0.6, 0, 0.6]) add(new THREE.TorusGeometry(1.28, 0.08, 8, 32), M.copper, x, 0, 0, gen, [0, Math.PI / 2, 0]);
  const coupling = add(new THREE.CylinderGeometry(0.35, 0.35, 0.8, 6), M.mustard, 22.75, 2.25, 1.4, world, [0, 0, Math.PI / 2]);
  plate("TURBIN", null, 2.0, 0.62, PAL.cream, "#3b2a20", 20.6, 0.4, 3.25);
  plate("GENERATOR", null, 2.6, 0.62, PAL.cream, "#3b2a20", 24.2, 0.4, 3.25);
  // spark that runs from the generator into the line
  const sparkM = new THREE.MeshBasicMaterial({ color: new THREE.Color("#fff07a").multiplyScalar(2.6) });

  // ---------- flue-gas train (behind) ----------
  add(tube([v3(16.0, 3.0, -3.0), v3(17.0, 2.6, -4.6), v3(18.6, 3.0, -5.6)], 0.5, 24), clay("#a9a39b"), 0, 0, 0);
  const reactor = new THREE.Group(); reactor.position.set(19.4, 0, -5.6); world.add(reactor);
  add(new THREE.CapsuleGeometry(1.1, 4.0, 8, 20), clay("#e9e2d6"), 0, 3.2, 0, reactor);
  add(new THREE.ConeGeometry(1.1, 1.2, 20), clay("#e9e2d6"), 0, 0.6, 0, reactor, [Math.PI, 0, 0]);
  const bagHouse = new THREE.Group(); bagHouse.position.set(23.2, 0, -5.8); world.add(bagHouse);
  rb(3.8, 5.0, 0.4, clay(PAL.sky), 0, 2.5, -1.4, 0.14, bagHouse); rb(0.4, 5.0, 3.2, clay(PAL.sky), 1.9, 2.5, 0, 0.14, bagHouse); rb(0.4, 5.0, 3.2, clay(PAL.sky), -1.9, 2.5, 0, 0.14, bagHouse);
  rb(4.2, 0.5, 3.4, clay("#3f7fc0"), 0, 5.2, 0, 0.14, bagHouse); rb(3.8, 1.0, 3.2, clay("#3f7fc0"), 0, 0.5, 0, 0.14, bagHouse);
  const bags = [];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) { const b = add(new THREE.CapsuleGeometry(0.24, 2.6, 6, 14), M.white, -1.3 + i * 0.65, 2.7, -0.6 + j * 0.9, bagHouse); bags.push({ b, k: i + j * 0.5 }); }
  add(tube([v3(20.5, 5.4, -5.6), v3(21.3, 6.2, -5.7), v3(22.2, 5.6, -5.8)], 0.38, 20), clay("#a9a39b"), 0, 0, 0);
  // stack with AUDIRA band
  const stack = new THREE.Group(); stack.position.set(27.0, 0, -5.4); world.add(stack);
  add(new THREE.CylinderGeometry(0.75, 1.15, 17, 28), M.cream, 0, 8.5, 0, stack);
  for (const y of [13.5, 15.8]) add(new THREE.CylinderGeometry(0.83, 0.83, 0.55, 28), clay(PAL.coral), 0, y, 0, stack);
  add(tube([v3(25.1, 2.2, -5.8), v3(26.0, 2.4, -5.6), v3(26.5, 2.6, -5.4)], 0.36, 12), clay("#a9a39b"), 0, 0, 0);
  {
    const tx = canvasTex(1024, 256, (c, w, h) => { c.fillStyle = PAL.teal; c.fillRect(0, 0, w, h); c.fillStyle = "#fff6e6"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `900 170px "Baloo 2", "Arial Black", sans-serif`; c.fillText("AUDIRA", w / 2, h / 2 + 8); });
    const g = new THREE.CylinderGeometry(0.86, 0.9, 1.3, 40, 1, true, -Math.PI / 2, Math.PI);
    add(g, new THREE.MeshStandardMaterial({ map: tx, roughness: 0.75, bumpMap: grain, bumpScale: 1 }), 0, 11.2, 0, stack);
  }
  plate("FILTER", null, 1.8, 0.6, PAL.cream, "#3b2a20", 23.2, 0.6, -3.9);
  const vapN = 6, vap = new THREE.InstancedMesh(lumpGs[2], clay("#ffffff", { rough: 0.9 }), vapN); vap.frustumCulled = false; world.add(vap);
  const limeN = 12, lime = new THREE.InstancedMesh(lumpGs[3], M.white, limeN), carb = new THREE.InstancedMesh(lumpGs[0], clay("#2a2624"), limeN);
  lime.frustumCulled = carb.frustumCulled = false; world.add(lime, carb);

  // ---------- substation + pylon line back to the city ----------
  rb(4.0, 0.4, 3.0, M.concreteDk, 29.5, 0.2, 1.0, 0.12);
  for (const x of [28.5, 30.5]) { rb(1.3, 1.6, 1.2, clay("#7e8a94"), x, 1.2, 1.0, 0.18); for (let k = 0; k < 3; k++) add(new THREE.CylinderGeometry(0.1, 0.12, 0.8, 8), M.cream, x - 0.4 + k * 0.4, 2.4, 1.0); }
  const pylX = [30, 16, 2, -12, -24];
  const pylTop = 9.2, pylZ = -10;
  function pylon(x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
    for (const sx of [-0.7, 0.7]) for (const sz of [-0.7, 0.7]) { const l = add(new THREE.CylinderGeometry(0.1, 0.14, pylTop, 6), clay("#8a8f96"), sx * 0.6, pylTop / 2, sz * 0.6, g); l.rotation.set(sz * -0.06, 0, sx * 0.06); }
    rb(0.5, 0.35, 4.6, clay("#8a8f96"), 0, pylTop, 0, 0.1, g); rb(0.4, 0.3, 3.2, clay("#8a8f96"), 0, pylTop - 1.6, 0, 0.1, g);
    for (let k = 0; k < 3; k++) add(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 8), M.cream, 0, pylTop - 0.4, -1.8 + k * 1.8, g);
    return g;
  }
  pylX.forEach((x) => pylon(x, pylZ));
  // wires (sagging) and the bead path; the last span drops into the city
  const wirePath = [];
  const wireDots = [v3(30, 2.4, 1.0), v3(30, pylTop - 0.6, pylZ)];
  for (let i = 1; i < pylX.length; i++) wireDots.push(v3(pylX[i], pylTop - 0.6, pylZ));
  wireDots.push(v3(-32, 3.2, -6));
  const wireCurvePts = [];
  for (let i = 0; i < wireDots.length - 1; i++) {
    const a = wireDots[i], b = wireDots[i + 1];
    for (let k = 0; k < 12; k++) { const u = k / 12; const p = a.clone().lerp(b, u); p.y -= Math.sin(Math.PI * u) * (i === 0 ? 0 : 0.9); wireCurvePts.push(p); }
  }
  wireCurvePts.push(wireDots[wireDots.length - 1]);
  const wireCurve = new THREE.CatmullRomCurve3(wireCurvePts);
  for (const dz of [-1.8, 0, 1.8]) add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wireCurvePts.map((p, i) => i < 13 ? p.clone() : p.clone().add(v3(0, 0, dz * (1 - 0.6 * (p.x < -24))))) ), 260, 0.06, 6, false), M.charcoal, 0, 0, 0);
  const beadN = 34, beadsE = new THREE.InstancedMesh(new THREE.SphereGeometry(0.28, 12, 10), sparkM, beadN); beadsE.frustumCulled = false; world.add(beadsE);

  // ---------- trucks ----------
  function truck(cab, bed) {
    const g = new THREE.Group(); world.add(g);
    const body = new THREE.Group(); g.add(body);
    rb(1.2, 1.35, 1.7, clay(cab), 1.1, 1.05, 0, 0.26, body);
    rb(0.08, 0.55, 1.35, M.glass, 1.72, 1.3, 0, 0.04, body);
    for (const z of [-0.55, 0.55]) add(new THREE.SphereGeometry(0.13, 12, 10), BASIC("#fff3c4", 1.5), 1.72, 0.65, z, body);
    rb(3.2, 0.25, 1.7, M.charcoal, -0.2, 0.42, 0, 0.1, body);
    const bedG = new THREE.Group(); bedG.position.set(-1.8, 0.6, 0); body.add(bedG); // hinge at the rear
    rb(2.3, 0.18, 1.7, clay(bed), 1.15, 0.1, 0, 0.08, bedG);
    rb(2.3, 0.8, 0.16, clay(bed), 1.15, 0.5, 0.78, 0.07, bedG); rb(2.3, 0.8, 0.16, clay(bed), 1.15, 0.5, -0.78, 0.07, bedG);
    rb(0.16, 0.8, 1.7, clay(bed), 2.25, 0.5, 0, 0.07, bedG);
    const load = new THREE.Group(); bedG.add(load);
    const RL = mulberry(cab.length * 7 + bed.charCodeAt(2));
    for (let i = 0; i < 9; i++) { const m = add(lumpGs[i % 4], clay(junkCols[Math.floor(RL() * junkCols.length)].getStyle()), 0.35 + RL() * 1.6, 0.75 + RL() * 0.3, (RL() - 0.5) * 1.1, load); m.scale.setScalar(0.28 + RL() * 0.12); }
    const wheels = [];
    for (const x of [1.1, -0.6, -1.4]) for (const z of [-0.85, 0.85]) { const w = add(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 18), M.charcoal, x, 0.4, z, body, [Math.PI / 2, 0, 0]); add(new THREE.CylinderGeometry(0.18, 0.18, 0.32, 12), M.mustard, 0, 0, 0, w); wheels.push(w); }
    return { g, body, bedG, load, wheels };
  }
  const tCols = [[PAL.coral, PAL.teal], [PAL.teal, PAL.mustard], [PAL.mustard, PAL.coral], [PAL.sky, PAL.leaf]];
  const roadT = tCols.map(([a, b]) => truck(a, b));
  const hero = truck(PAL.leaf, PAL.mustard);
  // road path: city -> road -> ramp -> deck
  const roadPt = (x) => {
    if (x < -15) return [x, 0.14, 0];
    if (x < -7) return [x, 0.14 + (x + 15) * (3 / 8), Math.atan(3 / 8)];
    return [x, 3.14, 0];
  };

  // ---------- front yard: pipe rack, crates, trash bags, wheelie bins (fills the lower third of close shots) ----------
  {
    const pipeT = clay(PAL.teal), pipeC = clay(PAL.cream), sup = clay("#8a8f96");
    for (let x = 7; x <= 27; x += 4) rb(0.3, 1.3, 0.3, sup, x, 0.65, 4.8, 0.08);
    add(new THREE.CylinderGeometry(0.22, 0.22, 20.6, 16), pipeT, 17, 1.25, 4.8, world, [0, 0, Math.PI / 2]);
    add(new THREE.CylinderGeometry(0.17, 0.17, 20.6, 16), pipeC, 17, 0.8, 4.95, world, [0, 0, Math.PI / 2]);
    for (let x = 9; x <= 25; x += 8) add(new THREE.TorusGeometry(0.26, 0.06, 8, 20), M.coral, x, 1.25, 4.8, world, [0, Math.PI / 2, 0]);
    const crateM = [clay("#c99a5e"), clay("#b5844b")], plank = clay("#8f6236");
    const crate = (x, z, s_, ry) => { const g = new THREE.Group(); g.position.set(x, s_ / 2, z); g.rotation.y = ry; world.add(g); rb(s_, s_, s_, crateM[Math.round(x) & 1], 0, 0, 0, 0.08, g); for (const yy of [-0.25, 0.25]) rb(s_ + 0.04, 0.1, s_ + 0.04, plank, 0, yy * s_, 0, 0.03, g); };
    [[2.5, 5.6, 0.9, 0.3], [3.4, 6.3, 0.7, -0.4], [11.5, 6.4, 0.9, 0.2], [20.5, 6.2, 0.85, -0.3], [21.3, 7.0, 0.65, 0.5], [26.0, 6.6, 0.9, 0.1]].forEach(([x, z, s_, r_]) => crate(x, z, s_, r_));
    const bagCols = ["#2f5d46", "#3a4b7a", "#2b2725", "#4b6e3a"];
    const bagG = lumpGeo(61, 16, 12, 0.14);
    const RBg = mulberry(616);
    const bagAt = [[-1.5, 5.2], [-0.6, 5.7], [0.2, 5.1], [7.2, 6.0], [8.1, 6.5], [15.6, 6.8], [16.4, 6.2], [23.3, 5.6], [24.0, 6.3], [12.8, 7.2]];
    bagAt.forEach(([x, z], i) => { const sc = 0.45 + RBg() * 0.2; const b = add(bagG, clay(bagCols[i % 4], { rough: 0.45 }), x, sc * 0.8, z); b.scale.set(sc, sc * 1.1, sc); add(new THREE.SphereGeometry(0.11, 10, 8), clay(bagCols[i % 4], { rough: 0.45 }), x, sc * 1.85, z); });
    const binC = [PAL.leaf, PAL.mustard, PAL.sky];
    [[-3.6, 5.0], [-2.7, 5.1], [5.0, 5.4]].forEach(([x, z], i) => { rb(0.8, 1.1, 0.8, clay(binC[i]), x, 0.6, z, 0.12); rb(0.86, 0.12, 0.86, clay(PAL.charcoal), x, 1.2, z, 0.05); });
  }
  // second yard row: kerb with clay shrubs, cable spools, more bags and crates (z 7.5..10.5)
  {
    rb(34, 0.4, 0.6, M.concreteDk, 10, 0.2, 10.4, 0.15);
    const RY = mulberry(717), shrubM = [clay(PAL.leaf), clay(PAL.olive), clay("#8cc35a")];
    for (let x = -6.5; x <= 27; x += 1.6 + RY() * 0.8) { const m = add(crownG, shrubM[Math.floor(RY() * 3)], x, 0.55, 9.6 + RY() * 0.4); m.scale.set(0.55 + RY() * 0.25, 0.45 + RY() * 0.2, 0.5); }
    const spoolM = [clay(PAL.coral), clay(PAL.sky), clay(PAL.mustard)];
    for (let i = 0; i < 9; i++) {
      const x = -4 + i * 3.6 + RY() * 1.2, z = 7.6 + RY() * 1.2, k = i % 3;
      if (k === 0) { const sp = new THREE.Group(); sp.position.set(x, 0.55, z); sp.rotation.y = RY() * 3; world.add(sp); add(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 24), spoolM[i % 3], 0, 0, -0.35, sp, [Math.PI / 2, 0, 0]); add(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 24), spoolM[i % 3], 0, 0, 0.35, sp, [Math.PI / 2, 0, 0]); add(new THREE.CylinderGeometry(0.36, 0.36, 0.6, 20), clay(PAL.charcoal), 0, 0, 0, sp, [Math.PI / 2, 0, 0]); }
      else if (k === 1) { for (let j = 0; j < 3; j++) { const sc = 0.4 + RY() * 0.15; const b = add(lumpGeo(80 + j, 14, 10, 0.14), clay(["#2f5d46", "#3a4b7a", "#4b6e3a"][j], { rough: 0.45 }), x + (j - 1) * 0.6, sc * 0.8, z + RY() * 0.4); b.scale.set(sc, sc * 1.1, sc); } }
      else { rb(0.9, 0.9, 0.9, clay("#c99a5e"), x, 0.45, z, 0.08); rb(0.65, 0.65, 0.65, clay("#b5844b"), x + 0.2, 1.22, z, 0.07); }
    }
  }
  // ash truck: grey load, drives out along the road in s7
  const ashTruck = truck("#8a8279", "#6e6862");
  ashTruck.load.children.forEach((m) => { m.material = M.ash; });
  { const tx = canvasTex(512, 200, (c, w, h) => { c.fillStyle = PAL.cream; c.fillRect(0, 0, w, h); c.fillStyle = "#3b2a20"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `900 150px "Baloo 2", "Arial Black", sans-serif`; c.fillText("ABU", w / 2, h / 2 + 8); });
    const pl = add(new THREE.PlaneGeometry(1.4, 0.55), new THREE.MeshBasicMaterial({ map: tx, color: new THREE.Color(0.9, 0.9, 0.9) }), 1.15, 0.62, 0.87, ashTruck.bedG); }

  // ---------- blurred foreground props (own scene, half-res target, blurred and composited) ----------
  const FGS = new THREE.Scene();
  const fgRig = new THREE.Group(); FGS.add(fgRig);
  fgRig.add(new THREE.HemisphereLight(0xfff1dc, 0x4a3326, 0.9));
  { const d = new THREE.DirectionalLight(0xfff0d8, 1.8); d.position.set(-2, 3, 2); fgRig.add(d, d.target); }
  FGS.environment = S.environment; FGS.environmentIntensity = 0.5;
  const fg = new THREE.Group(); fgRig.add(fg);
  {
    fg.scale.setScalar(1.0);
    const bin = new THREE.Group(); bin.position.set(-0.85, -1.55, -4.2); fg.add(bin);
    add(new THREE.CylinderGeometry(0.34, 0.28, 0.8, 20), clay(PAL.leaf), 0, 0.4, 0, bin); add(new THREE.CylinderGeometry(0.38, 0.38, 0.1, 20), clay(PAL.olive), 0, 0.85, 0, bin);
    const RB = mulberry(9);
    for (let i = 0; i < 6; i++) { const m = add(lumpGs[i % 4], clay(junkCols[i + 1].getStyle()), 0.35 + RB() * 0.7, -1.5 + RB() * 0.1, -4.0 - RB() * 0.4, fg); m.scale.setScalar(0.1 + RB() * 0.06); }
    const bg_ = lumpGeo(71, 14, 10, 0.14);
    [[-0.45, -1.62, -4.0, "#2f5d46", 0.2], [-0.2, -1.66, -4.3, "#3a4b7a", 0.17], [0.55, -1.66, -4.1, "#2b2725", 0.18], [0.05, -1.72, -3.7, "#4b6e3a", 0.22], [0.3, -1.7, -3.9, "#3a4b7a", 0.18]].forEach(([x, y, z, c_, sc]) => { const m = add(bg_, clay(c_, { rough: 0.45 }), x, y, z, fg); m.scale.set(sc, sc * 1.15, sc); });
    const cr2 = add(rbox(0.42, 0.42, 0.42, 0.04), clay("#c99a5e"), 0.62, -1.72, -4.5, fg); cr2.rotation.y = 0.5;
    const tr = add(trunkG, M.earth, 0.95, -1.95, -4.4, fg); tr.scale.setScalar(0.7);
    const cr = add(crownG, clay(PAL.leaf), 0.95, -1.0, -4.4, fg); cr.scale.setScalar(0.48);
  }
  const fgRT = new THREE.WebGLRenderTarget(W / 2, H / 2, { type: THREE.HalfFloatType, samples: 4 });

  // shadows for clay props (not the emissive bits)
  world.traverse((o) => { if (o.isMesh && !(o.material && o.material.isMeshBasicMaterial)) { o.castShadow = true; o.receiveShadow = true; } });

  // ---------- post: NaN guard -> fg composite -> bloom -> output -> warm grade ----------
  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  const QV = "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}";
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } }, vertexShader: QV,
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);bvec4 n=isnan(c);bvec4 f=isinf(c);if(any(n)||any(f))c=vec4(0.,0.,0.,1.);gl_FragColor=clamp(c,0.,30.);}" })));
  const fgU = { tDiffuse: { value: null }, tFg: { value: fgRT.texture }, uPx: { value: new THREE.Vector2(2 / W, 2 / H) }, uOn: { value: 0 } };
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: fgU, vertexShader: QV,
    fragmentShader: `uniform sampler2D tDiffuse,tFg;uniform vec2 uPx;uniform float uOn;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(uOn<.001){gl_FragColor=c;return;}vec4 f=vec4(0.);float w=0.;
      for(int i=-3;i<=3;i++)for(int j=-3;j<=3;j++){float k=exp(-float(i*i+j*j)/7.);f+=texture2D(tFg,vUv+vec2(float(i),float(j))*uPx*1.6)*k;w+=k;}f/=w;
      f=clamp(f,0.,8.);float a=clamp(f.a,0.,1.)*uOn;gl_FragColor=vec4(c.rgb*(1.-a)+f.rgb*uOn,1.);}` })));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.2, 0.45, 1.0);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } }, vertexShader: QV,
    fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=dot(c,vec3(.2126,.7152,.0722));
      c*=mix(vec3(.97,.95,1.02),vec3(1.05,1.0,.92),smoothstep(.05,.8,l));c=mix(vec3(l),c,1.1);gl_FragColor=vec4(clamp(c,0.,1.),1.);}` })));

  // ---------- camera track: [t, pos xyz, target xyz] ----------
  const cTrack = track([
    // s1 hook: low beside a full truck on the road, plant glowing beyond; swoop into the furnace; out to the generator
    [0, -11.0, 7.0, 11.0, 3.0, 3.0, -0.5],
    [E.truk1, -6.0, 7.5, 11.0, 5.0, 3.2, -0.5],
    [E.dibakar, 3.0, 5.8, 15.5, 9.0, 3.8, -0.5],
    [E.tungku + 0.9, 6.8, 4.6, 11.0, 9.6, 3.4, -0.4],
    [E.listrik1, 14.0, 6.5, 17.0, 20.0, 3.6, -0.5],
    // s2 context: three-quarter view of the whole plant, then the line toward the grid
    [s.s2 + 1.2, -30.0, 22.0, 48.0, 8.0, 4.0, -2.0],
    [E.uji, -24.0, 20.0, 48.0, 10.0, 4.0, -2.0],
    [E.alir + 0.8, 42.0, 22.0, 36.0, 10.0, 6.0, -8.0],
    [E.resmi, -18.0, 18.0, 44.0, 6.0, 4.0, -2.0],
    // s3 bunker
    [s.s3 + 0.3, -10.5, 7.5, 13.0, -2.5, 3.2, 0],
    [E.tumpah + 1.4, -5.5, 7.0, 12.0, 0.8, 2.8, -0.3],
    [E.diperam, -0.5, 5.0, 10.5, 1.5, 2.1, -0.5],
    [E.airnya + 0.8, 1.2, 2.8, 8.6, 1.6, 1.3, 0.4],
    [E.capit, 0.0, 8.8, 14.0, 2.5, 5.4, -0.4],
    [E.corong + 0.6, 3.6, 8.6, 13.0, 6.2, 5.2, -0.4],
    // s4 grate
    [s.s4 + 0.4, 6.8, 7.0, 12.0, 9.2, 3.4, -0.3],
    [E.udara + 0.2, 9.2, 2.0, 9.6, 9.6, 2.5, -0.3],
    [E.atas, 7.2, 5.6, 9.0, 7.6, 3.6, -0.3],
    [E.tengah, 9.6, 4.6, 9.0, 9.8, 2.9, -0.3],
    [E.ujung, 12.6, 3.6, 9.2, 13.4, 1.7, 0],
    // s5 steam -> turbine -> generator -> grid
    [s.s5 + 0.5, 12.5, 9.0, 15.5, 14.8, 7.0, -0.6],
    [E.uap1, 15.0, 13.0, 15.0, 16.2, 10.8, -0.5],
    [E.turbin, 18.2, 5.6, 11.5, 20.4, 2.3, 1.0],
    [E.gen, 22.0, 5.2, 11.0, 23.4, 2.3, 1.0],
    [E.kap, 22.5, 7.5, 17.0, 22.5, 3.4, 0],
    [E.dijual + 0.4, 30.0, 11.0, 18.0, 20.0, 7.0, -8.0],
    // s6 why so hot: shaft + timer, molecule, flue-gas train, stack
    [s.s6 + 0.4, 6.5, 9.5, 17.0, 10.4, 8.2, 0],
    [E.gas, 8.0, 8.6, 14.0, 10.4, 8.4, 0.5],
    [E.dioksin + 0.2, 9.5, 11.6, 11.5, 10.9, 10.9, 1.0],
    [E.asap + 0.4, 15.5, 11.0, 9.0, 21.0, 3.6, -5.2],
    [E.kantong, 19.5, 8.0, 6.0, 23.0, 3.2, -5.5],
    [s.s6e, 22.5, 11.0, 9.0, 26.0, 10.0, -5.0],
    // s7 payoff: whole chain, city lights, then the ash that remains
    [s.s7 + 0.6, -10.0, 26.0, 60.0, 2.0, 4.0, -2.0],
    [E.setara - 0.2, -24.0, 16.0, 18.0, -34.0, 1.5, -3.0],
    [E.rumah, -26.0, 15.0, 16.0, -35.0, 1.4, -3.0],
    [E.abunya - 0.2, -11.0, 6.5, 10.5, -17.0, 1.2, 0.6],
    [E.abunya + 1.6, -13.5, 6.0, 10.0, -19.5, 1.1, 0.6],
    // s8 resolution: rise over the city with the plant behind
    [s.s8 + 0.5, -36.0, 12.0, 30.0, -24.0, 3.0, -3.0],
    [s.s8e, -30.0, 22.0, 58.0, -10.0, 4.0, -3.0],
    [s.dur + 1, -29.0, 23.0, 60.0, -9.0, 4.0, -3.0],
  ]);
  const tgt = v3(0, 0, 0);
  const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpS = v3(1, 1, 1), tmpP = v3(0, 0, 0), tmpE = new THREE.Euler();
  const setInst = (mesh, i, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) => { tmpE.set(rx, ry, rz); tmpQ.setFromEuler(tmpE); tmpP.set(x, y, z); tmpS.set(sx, sy, sz); tmpM.compose(tmpP, tmpQ, tmpS); mesh.setMatrixAt(i, tmpM); };
  // turbine speed integrated numerically so the angle is a pure function of t
  const turbSpeed = (t) => 1.2 + 9 * ramp(t, E.uap1, E.turbin + 0.8);
  const integ = (fn, t) => { let a = 0; const dt = 1 / 30; for (let x = 0; x < t; x += dt) a += fn(x) * Math.min(dt, t - x); return a; };

  // ================================================================ draw
  return function draw(t) {
    if (!(t >= 0)) t = 0;
    const tq = step15(t);
    const c = cTrack(t);
    // stop-motion rig micro-drift (stepped)
    const sd = Math.floor(t * 7.5);
    const d0 = Math.hypot(c[0] - c[3], c[1] - c[4], c[2] - c[5]), Z = Math.max(1, 2.3 - d0 * 0.04);
    cam.position.set(c[3] + (c[0] - c[3]) * Z + 0.05 * (hash(sd, 1) - 0.5), c[4] + (c[1] - c[4]) * Z + 0.04 * (hash(sd, 2) - 0.5), c[5] + (c[2] - c[5]) * Z);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    const dist = cam.position.distanceTo(tgt);
    key.position.set(tgt.x - 14, tgt.y + 26, tgt.z + 18); key.target.position.copy(tgt); key.target.updateMatrixWorld();
    const sh = Math.max(12, dist * 0.75); sc_.left = -sh; sc_.right = sh; sc_.top = sh; sc_.bottom = -sh; sc_.updateProjectionMatrix();
    bounce.position.set(cam.position.x, cam.position.y - 2, cam.position.z - 2);

    // ---- road trucks (wrap with a clay squash at both ends)
    roadT.forEach((tr, i) => {
      const span = 32, x = -40 + frac(i / 4 + 0.62 + tq * 1.5 / span) * span; // -40 .. -8
      const [px, py, pitch] = roadPt(x);
      const k = Math.min(ramp(x, -40, -38.5), 1 - ramp(x, -9.6, -8.1));
      tr.g.position.set(px, py, -0.7); tr.g.rotation.set(0, 0, pitch);
      tr.g.scale.set(0.001 + k * (1 + 0.1 * (1 - k)), 0.001 + k * (1 - 0.1 * (1 - k)), 0.001 + k);
      tr.body.position.y = 0.03 * Math.abs(Math.sin(tq * 9 + i));
      tr.wheels.forEach((w) => (w.rotation.y = -x * 1.4));
    });
    // ---- hero truck: parked on the deck, backed up to the bunker; tips on "menumpahkan"
    const tip = ramp(tq, E.tumpah - 0.1, E.tumpah + 0.9) * (1 - ramp(tq, E.diperam + 0.6, E.diperam + 1.8));
    hero.g.position.set(-3.9, 3.14, 0.2); hero.g.rotation.set(0, Math.PI, 0);
    hero.g.visible = true;
    hero.bedG.rotation.z = 0.95 * tip;
    hero.load.visible = tip < 0.55 || t < E.tumpah;
    for (let i = 0; i < dumpN; i++) {
      const d = dumpD[i], u = tq - (E.tumpah + 0.45 + d.dl * 0.6);
      let x = -2.0, y = -40, z = 0.2, sc = 0.001;
      if (u > 0 && t < s.s4) { const tt = Math.min(u, 1.1); x = -2.0 + d.vx * tt; z = 0.2 + d.vz * tt * 0.5; y = 4.0 + d.vy * tt - 4.9 * tt * tt; y = Math.max(y, hs(x, z) * 0.85 + 0.6); sc = d.sc; }
      setInst(dumpM, i, x, y, z, sc, sc * 0.85, sc, i, i * 2, 0);
    }
    dumpM.instanceMatrix.needsUpdate = true;

    // ---- bunker pile settles while it "ferments"; drips fall into the channel
    const dry = ramp(t, E.diperam, E.kering + 0.5);
    pile.forEach((p) => setInst(p.m, p.i, p.x, 0.5 + (p.y - 0.5) * (1 - 0.14 * dry), p.z, p.sc, p.sc * (1 - 0.1 * dry), p.sc, p.rx, p.ry, 0));
    pileMeshes.forEach((m) => (m.instanceMatrix.needsUpdate = true));
    const dripOn = win(t, E.diperam - 0.3, E.capit + 0.4, 0.4, 0.6);
    dropD.forEach((d, i) => {
      const u = frac(d.ph + tq * 0.9 * d.sp);
      const y0 = Math.max(1.0, hs(d.x, d.z) * 0.4 + 0.6);
      const sc = dripOn * 0.14 * (u < 0.9 ? 1 : (1 - u) * 10);
      setInst(drops, i, d.x, lerp(y0, 0.6, u * u), d.z, sc, sc, sc);
    });
    drops.instanceMatrix.needsUpdate = true;

    // ---- crane: idle near the pile, grabs on "Capit", carries to the hopper on "mengangkatnya", drops on "corong"
    const gx = lerp(0.8, 1.6, ramp(tq, E.capit - 1.5, E.capit - 0.4));
    const carry = ramp(tq, E.angkat - 0.1, E.corong + 0.2);
    const cx = lerp(gx, 6.6, carry) + (t > s.s4 ? lerp(0, -5.2, ramp(tq, s.s4, s.s4 + 6)) : 0);
    bridge.position.x = cx;
    const down = win(tq, E.capit - 0.2, E.angkat - 0.3, 0.6, 0.5);
    const grabY = lerp(6.6, 3.9, down);
    grab.position.y = grabY - 1.0;
    cable.scale.y = Math.max(0.05, 7.2 - grabY + 0.4); cable.position.y = 7.2 - (7.2 - grabY + 0.4) / 2;
    const closed = ramp(tq, E.capit + 0.3, E.capit + 0.8) * (1 - ramp(tq, E.corong + 0.2, E.corong + 0.6));
    claws.forEach((a) => (a.rotation.z = lerp(0.55, -0.05, closed)));
    grabbed.visible = closed > 0.6;
    for (let i = 0; i < fallN; i++) {
      const u = tq - (E.corong + 0.35 + i * 0.05);
      const on = u > 0 && u < 1.2;
      const yy = 6.0 - 4.9 * u * u;
      setInst(fallM, i, 6.6 + ((i % 3) - 1) * 0.3, on ? Math.max(4.6, yy) : -40, -0.3 + ((i % 4) - 1.5) * 0.25, on ? 0.28 : 0.001, on ? 0.24 : 0.001, on ? 0.28 : 0.001, i, i, 0);
    }
    fallM.instanceMatrix.needsUpdate = true;

    // ---- moving grate: bars slide alternately along the slope (stepped)
    bars.forEach((b, i) => {
      const off = (i % 2 ? 1 : -1) * 0.12 * Math.sin(tq * 2.6);
      const p = GA.clone().addScaledVector(gDir, (i + 0.5) * gLen / nBars + off).addScaledVector(gNorm, -0.1 - (i % 2) * 0.06);
      b.position.set(p.x, p.y, -0.3);
    });
    // lumps travel down, dry -> burn -> ash
    gD.forEach((d, i) => {
      const u = frac(d.u0 + tq * 0.035);
      const p = GA.clone().addScaledVector(gDir, u * gLen).addScaledVector(gNorm, 0.25 + 0.08 * Math.sin(d.rx + tq * 3));
      const sc = d.sc * lerp(1.15, 0.55, u);
      setInst(gLumps, i, p.x, p.y, d.z, sc, sc * 0.8, sc, d.rx + u * 4, d.rx, 0);
      tmpC.copy(d.c).lerp(CHAR, ramp(u, 0.22, 0.5));
      if (u > 0.3 && u < 0.75) tmpC.lerp(EMB, 0.5 * win(u, 0.4, 0.62, 0.08, 0.1));
      tmpC.lerp(ASHC, ramp(u, 0.7, 0.95));
      gLumps.setColorAt(i, tmpC);
    });
    gLumps.instanceMatrix.needsUpdate = true; gLumps.instanceColor.needsUpdate = true;
    const fs = Math.floor(t * 12);
    fD.forEach((d, i) => {
      const p = GA.clone().addScaledVector(gDir, d.u * gLen).addScaledVector(gNorm, 0.2);
      const fl = 0.75 + 0.5 * hash(i, fs);
      setInst(flames, i, p.x, p.y, d.z, d.s * 0.55 * (0.9 + 0.2 * hash(i + 9, fs)), d.s * fl, d.s * 0.55, 0.15 * (hash(i, fs + 3) - 0.5), hash(i, 7) * 6, 0.2 * (hash(i + 2, fs) - 0.5));
    });
    flames.instanceMatrix.needsUpdate = true;
    fireL.intensity = 26 + 10 * hash(3, fs);
    furnaceBack.emissiveIntensity = 0.38 + 0.1 * hash(5, fs);
    const airOn = win(t, E.udara - 0.4, E.atas + 0.6, 0.4, 0.6);
    arrows.forEach((a) => { const u = frac(tq * 0.9 + a.i * 0.2); a.g.position.y = a.base + 0.5 * u; a.g.scale.setScalar(0.001 + airOn * Math.min(1, (1 - u) * 4)); });

    // ---- s6: gas parcel rises through the shaft in exactly two seconds; bead ring counts the two seconds
    const gasOn = win(t, E.gas - 0.6, E.dioksin + 0.6, 0.5, 0.5);
    const cyc = frac(Math.max(0, t - E.gas) / 2);
    for (let i = 0; i < gasN; i++) {
      const y = lerp(4.4, 11.8, cyc) + (i % 3 - 1) * 0.35, sc = gasOn * (0.32 + 0.12 * hash(i, 1)) * (1 - 0.4 * cyc);
      setInst(gasM, i, 11.2 + Math.sin(i * 2.1) * 0.5, y, -0.4 + Math.cos(i * 1.7) * 0.8, sc, sc, sc, i, i, 0);
    }
    gasM.instanceMatrix.needsUpdate = true;
    const ringOn = win(t, E.gas - 0.5, E.dioksin + 1.2, 0.4, 0.5);
    ring.scale.setScalar(0.001 + 0.78 * back(ringOn));
    const lit = t > E.gas ? Math.floor(cyc * 20) + 1 : 0;
    beads.forEach((b, i) => b.material.color.set(i < lit ? "#ffb02e" : "#6a5a52").multiplyScalar(i < lit ? 2.2 : 1));
    thermo.scale.setScalar(0.001 + back(win(t, E.kenapa + 0.3, E.dioksin + 1.2, 0.4, 0.5)));
    const fillH = lerp(0.6, 3.6, ramp(t, E.kenapa + 0.5, E.d850 + 0.3)) + 0.05 * Math.sin(tq * 6);
    tFill.scale.y = fillH; tFill.position.y = -2.1 + fillH / 2;
    const molOn = win(t, E.gas, E.dioksin + 2.2, 0.4, 0.4), brk = ramp(t, E.dioksin, E.dioksin + 1.2);
    mol.scale.setScalar(0.001 + back(molOn)); mol.rotation.y = 0.3 * Math.sin(t * 0.8);
    molParts.forEach((p, i) => { const a = Math.atan2(p.y + 0.01, p.x + 0.01 * (i % 3)) + 0.4 * hash(i, 4); p.b.position.set(p.x + Math.cos(a) * 2.6 * brk, p.y + Math.sin(a) * 2.6 * brk, 1.2 * brk * (hash(i, 8) - 0.5)); p.b.scale.setScalar(Math.max(0.001, 1 - 0.85 * brk)); });

    // ---- boiler: tubes heat up, water beads climb, steam puffs ride the pipe to the turbine
    const heat = ramp(t, E.rebus - 0.3, E.uap1 + 0.4);
    tubeMat.color.set(PAL.sky).lerp(tmpC.set("#ff7d3a"), 0.75 * heat);
    tubeMat.emissive.set("#ff5a20"); tubeMat.emissiveIntensity = 0.35 * heat;
    const steamK = 0.45 + 0.55 * ramp(t, E.uap1 - 0.6, E.uap1 + 0.4);
    for (let i = 0; i < puffN; i++) {
      const u = frac(i / puffN + tq * 0.22);
      const p = steamCurve.getPointAt(u);
      const sc = steamK * (0.26 + 0.1 * Math.sin(i * 1.7 + tq * 4));
      setInst(puffs, i, p.x + 0.15 * Math.sin(i), p.y + 0.42, p.z + 0.15 * Math.cos(i), sc, sc * 0.85, sc, i, i, 0);
    }
    puffs.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < waterN; i++) { const u = frac(i / waterN + tq * 0.3); setInst(waterB, i, 14.0 + (i % 5) * 0.65, lerp(3.4, 11.6, u), 0.75, 1, 1, 1); }
    waterB.instanceMatrix.needsUpdate = true;
    const ang = integ(turbSpeed, tq);
    rotor.rotation.x = ang; gen.rotation.x = ang; coupling.rotation.x = ang;

    // ---- power beads along the line to the city
    const flowOn = Math.max(0.35, win(t, E.alir - 0.4, s.s3, 0.5, 0.8), win(t, E.gen, s.s6, 0.5, 0.8), ramp(t, E.pabrik, E.setara));
    for (let i = 0; i < beadN; i++) {
      const u = frac(i / beadN + tq * 0.05);
      const p = wireCurve.getPointAt(u);
      const sc = flowOn * (0.8 + 0.4 * hash(i, Math.floor(t * 6)));
      setInst(beadsE, i, p.x, p.y + 0.05, p.z, sc, sc, sc);
    }
    beadsE.instanceMatrix.needsUpdate = true;
    // ---- city windows: some at the hook's "listrik", all from "setara"
    const fLit = Math.max(0.35 * ramp(t, E.listrik1 - 0.3, E.listrik1 + 0.6), ramp(t, E.setara - 0.2, E.rumah + 0.6));
    winOrder.forEach(([i, k]) => { const kk = clamp01((fLit * winPos.length - k) * 1.5); wins.setColorAt(i, tmpC.copy(WD).lerp(WL, kk)); });
    wins.instanceColor.needsUpdate = true;

    // ---- flue-gas cleaning: lime + carbon puffs, bags breathe, clean vapour at the stack
    const limeOn = win(t, E.kapur - 0.3, s.s7, 0.3, 0.6), carbOn = win(t, E.karbon - 0.3, s.s7, 0.3, 0.6), bagOn = win(t, E.kantong - 0.3, s.s7, 0.3, 0.6);
    for (let i = 0; i < limeN; i++) {
      const u = frac(i / limeN + tq * 0.5);
      const sL = limeOn * (0.1 + 0.25 * u) * (1 - u * 0.6);
      setInst(lime, i, 19.4 + Math.cos(i * 2.4) * 0.8 * u - 1.6, 5.8 + 1.0 * u, -5.6 + Math.sin(i * 2.4) * 0.8 * u + 1.0, sL, sL, sL, i, i, 0);
      const sC = carbOn * (0.1 + 0.22 * u) * (1 - u * 0.6);
      setInst(carb, i, 18.0 + Math.cos(i * 1.9) * 0.6 * u, 3.6 + 0.8 * u, -4.4 + Math.sin(i * 1.9) * 0.6 * u, sC, sC, sC, i, i, 0);
    }
    lime.instanceMatrix.needsUpdate = true; carb.instanceMatrix.needsUpdate = true;
    bags.forEach((b) => { const k = 1 + bagOn * 0.22 * Math.max(0, Math.sin(tq * 5 - b.k * 1.3)); b.b.scale.set(k, 1, k); });
    for (let i = 0; i < vapN; i++) { const u = frac(i / vapN + tq * 0.12); const sc = 0.4 + 0.9 * u; setInst(vap, i, 27.0 + 0.6 * u, 17.3 + 3.2 * u, -5.4, sc * (1 - u) * 1.2, sc * (1 - u), sc * (1 - u) * 1.2, i, i, 0); }
    vap.instanceMatrix.needsUpdate = true;
    // ash pile grows a touch over the film
    ashPile.scale.set(1.1, 0.62 + 0.2 * ramp(t, 0, s.s8), 1.45);
    ashCart.position.x = 12.4 - 0.8 * ramp(tq, E.abunya, E.abunya + 1.4);
    { const k = ramp(tq, E.tapi - 1.4, s.s8 + 2.0); const ax = lerp(-11.5, -26, k); const vis = win(t, E.tapi - 1.6, s.s8 + 2.5, 0.3, 0.3);
      ashTruck.g.visible = vis > 0.01; ashTruck.g.position.set(ax, 0.14, 0.95); ashTruck.g.rotation.set(0, Math.PI, 0);
      const q_ = 0.001 + vis; ashTruck.g.scale.set(q_, q_, q_); ashTruck.wheels.forEach((w) => (w.rotation.y = ax * 1.4)); ashTruck.body.position.y = 0.03 * Math.abs(Math.sin(tq * 9)); }

    // ---- foreground props: only in the wide shots, ride with the camera
    const onFg = Math.max(win(t, s.s2 + 0.4, s.s2e, 0.6, 0.5), win(t, s.s4 + 0.3, s.s5e, 0.5, 0.5), win(t, s.s7 + 0.2, E.setara - 0.6, 0.5, 0.5), win(t, s.s8 + 0.4, s.dur + 5, 0.6, 0.6));
    fgU.uOn.value = onFg;
    if (onFg > 0.001) {
      fgRig.position.copy(cam.position); fgRig.quaternion.copy(cam.quaternion);
      fg.position.set(0.04 * Math.sin(t * 0.2), -1.4 * (1 - eout(onFg)), 0);
      r.setRenderTarget(fgRT); r.setClearColor(0x000000, 0); r.clear(); r.render(FGS, cam); r.setRenderTarget(null);
    }
    bloom.strength = 0.18 + 0.08 * win(t, E.dibakar, E.listrik1, 0.5, 0.8);
    comp.render();
  };
}
