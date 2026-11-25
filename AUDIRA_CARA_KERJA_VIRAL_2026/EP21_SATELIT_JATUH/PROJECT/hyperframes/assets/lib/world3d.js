// EP21 SATELIT JATUH. DISASTERSIM look: a calm geohazard simulation lab. Slate void, grid floor, plinths,
// cut-face blocks with warm strata, documentary warm key light, HUD lab labels (dark plate + teal bar).
// Three stations on one lab axis (-z):
//   BLOCK (z 0)   sliced map block of Sumatra / Malacca / Karimata with a glass 120 km layer above it: the streak, breakup, SE track, BRIN ellipse
//   GLOBE (ZG)    cut-away Earth model with atmosphere shells, orbit ring, Sun lamp, tug robot, decay spiral 275 -> 190 -> 120 km
//   TUNNEL (ZS)   large generic telescope satellite in a descending atmosphere tunnel: compressed air cap (bow shock), heat, breakup
// Every value is a pure function of t (seeded PRNG only).
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
const ZG = -90, ZS = -180, SY = 30;
const win = (t, a, b, fi = 0.4, fo = 0.4) => ramp(t, a - fi, a + fi) * (1 - ramp(t, b - fo, b + fo));
const TEAL = "#4CC9D9", AMBER = "#F2A93B", ORANGE = "#E07B39", RED = "#E5533D", YEL = "#D9B84A";

// ---------- geometry helpers ----------
function rbox(w, h, d, r, seg = 4) {
  const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
  s.moveTo(x, y - r); s.lineTo(x + ww, y - r); s.quadraticCurveTo(x + ww + r, y - r, x + ww + r, y);
  s.lineTo(x + ww + r, y + hh); s.quadraticCurveTo(x + ww + r, y + hh + r, x + ww, y + hh + r);
  s.lineTo(x, y + hh + r); s.quadraticCurveTo(x - r, y + hh + r, x - r, y + hh); s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelSize: r * 0.98, bevelThickness: r, bevelSegments: seg, curveSegments: 6 });
  g.translate(0, 0, -(d - 2 * r) / 2); g.computeVertexNormals();
  return g;
}
function rcyl(rad, h, bev, seg = 48) {
  const pts = [new THREE.Vector2(0, -h / 2)];
  for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2); pts.push(new THREE.Vector2(rad - bev + Math.cos(a) * bev, -h / 2 + bev + Math.sin(a) * bev)); }
  for (let i = 0; i <= 6; i++) { const a = (i / 6) * (Math.PI / 2); pts.push(new THREE.Vector2(rad - bev + Math.cos(a) * bev, h / 2 - bev + Math.sin(a) * bev)); }
  pts.push(new THREE.Vector2(0, h / 2));
  return new THREE.LatheGeometry(pts, seg);
}
const std = (c, r = 0.5, m = 0, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...o });
const dotTex = () => canvasTex(128, 128, (c, w) => { const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(0, 0, w, w); });

// DISASTERSIM lab label: dark plate, coloured bar, white heavy caps. Anchored at its left edge.
function makeLabel(txt, col = TEAL, w = 2.2) {
  const ch = 150;
  let tw = 600;
  const tex = canvasTex(1024, ch, (c, W2, H2) => {
    c.font = '800 66px "Archivo", "Arial Black", sans-serif';
    tw = Math.min(W2 - 12, c.measureText(txt).width + 70);
    c.fillStyle = "rgba(10,16,28,.9)"; c.beginPath(); c.roundRect(4, 16, tw, H2 - 32, 10); c.fill();
    c.fillStyle = col; c.fillRect(4, 16, 13, H2 - 32);
    c.textBaseline = "middle"; c.fillStyle = "#F4F1EA"; c.fillText(txt, 40, H2 / 2 + 4);
  });
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, toneMapped: false }));
  sp.center.set(0, 0.5); sp.renderOrder = 30; sp.scale.set(w, (w * ch) / 1024, 1); sp.visible = false;
  return sp;
}

// ---------- map of the block top (lon 94..116 E, lat 8 N..6 S) ----------
const LON0 = 94, LON1 = 116, LAT0 = 8, LAT1 = -6, BW = 14, BD = 9, BTOP = 4;
const MX = (lon) => ((lon - LON0) / (LON1 - LON0)) * BW - BW / 2;
const MZ = (lat) => ((LAT0 - lat) / (LAT0 - LAT1)) * BD - BD / 2;
const SUMATRA = [[95.3, 5.6], [97.5, 5.2], [98.7, 3.8], [100.3, 2.3], [101.5, 1.7], [103.7, -1.0], [106.0, -3.0], [105.8, -5.9], [104.5, -5.9], [102.3, -4.0], [100.4, -1.0], [98.8, 1.7], [97.1, 3.0], [95.2, 5.2]];
const MALAYA = [[98.2, 8.2], [100.6, 8.2], [100.2, 6.5], [101.0, 6.8], [102.2, 6.2], [103.4, 4.0], [103.5, 2.6], [104.3, 1.4], [103.4, 1.3], [101.3, 2.8], [100.4, 4.2], [100.1, 5.6], [99.2, 7.0]];
const BORNEO = [[108.9, 0.9], [109.0, 1.8], [109.7, 2.1], [111.0, 1.6], [113.0, 3.2], [115.5, 4.6], [116.5, 4.6], [116.5, -4.0], [114.5, -3.9], [113.0, -3.2], [111.5, -3.0], [110.2, -2.9], [110.0, -1.5], [109.2, -0.3]];
const JAVA = [[105.2, -6.8], [106.5, -5.95], [108.5, -6.3], [111.0, -6.4], [113.0, -6.9], [116.5, -6.9], [116.5, -8.5], [105.0, -8.5]];
const ISLES = [[[105.1, -1.6], [106.0, -1.9], [106.8, -3.0], [105.8, -2.9], [105.2, -2.2]], [[107.5, -2.6], [108.3, -2.6], [108.2, -3.2], [107.6, -3.2]]];
function drawMap(c, w, h) {
  const px = (lon) => ((lon - LON0) / (LON1 - LON0)) * w, py = (lat) => ((LAT0 - lat) / (LAT0 - LAT1)) * h;
  const sea = c.createLinearGradient(0, 0, w, h); sea.addColorStop(0, "#0f4a63"); sea.addColorStop(1, "#155f7a"); c.fillStyle = sea; c.fillRect(0, 0, w, h);
  const poly = (P) => { c.beginPath(); P.forEach(([lo, la], i) => (i ? c.lineTo(px(lo), py(la)) : c.moveTo(px(lo), py(la)))); c.closePath(); };
  const lands = [SUMATRA, MALAYA, BORNEO, ...ISLES];
  // shallow shelf glow
  c.save(); c.shadowColor = "rgba(90,170,185,.35)"; c.shadowBlur = 22; c.fillStyle = "#1d6577"; lands.forEach((P) => { poly(P); c.fill(); }); c.restore();
  // land with warm relief
  const R = mulberry(5);
  lands.forEach((P) => {
    poly(P); c.save(); c.clip();
    const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#5f7d45"); g.addColorStop(1, "#6f8a4c"); c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${R() > 0.5 ? "40,60,30" : "180,170,110"},${0.08 + R() * 0.12})`; const x = R() * w, y = R() * h; c.beginPath(); c.arc(x, y, 3 + R() * 16, 0, 7); c.fill(); }
    c.restore(); poly(P); c.strokeStyle = "#cdbf98"; c.lineWidth = 2; c.stroke();
  });
  // graticule
  c.strokeStyle = "rgba(255,255,255,.09)"; c.lineWidth = 1.5;
  for (let lo = 96; lo < 116; lo += 2) { c.beginPath(); c.moveTo(px(lo), 0); c.lineTo(px(lo), h); c.stroke(); }
  for (let la = 6; la > -6; la -= 2) { c.beginPath(); c.moveTo(0, py(la)); c.lineTo(w, py(la)); c.stroke(); }
  c.setLineDash([16, 12]); c.strokeStyle = "rgba(242,169,59,.55)"; c.lineWidth = 3; c.beginPath(); c.moveTo(0, py(0)); c.lineTo(w, py(0)); c.stroke(); c.setLineDash([]);
  const txt = (s, lo, la, size = 26, col = "rgba(244,241,234,.85)", rot = 0, wt = 700) => { c.save(); c.translate(px(lo), py(la)); c.rotate(rot); c.font = `${wt} ${size}px "IBM Plex Mono", monospace`; c.fillStyle = col; c.textAlign = "center"; c.fillText(s, 0, 0); c.restore(); };
  txt("KHATULISTIWA", 113.5, 0.35, 20, "rgba(242,169,59,.85)");
  txt("SUMATERA UTARA", 99.6, 2.0, 24, "#F4F1EA", -0.62, 800);
  txt("SELAT MALAKA", 100.3, 4.6, 19, "rgba(200,235,240,.75)", -0.62);
  txt("SELAT KARIMATA", 108.2, -1.2, 20, "rgba(200,235,240,.8)", -1.2);
  txt("KALIMANTAN", 113.2, 0.4, 26, "#F4F1EA", 0, 800);
  txt("MEDAN", 98.1, 4.1, 20, "#FFE2A8", 0, 700);
  c.fillStyle = "#FFD27A"; c.beginPath(); c.arc(px(98.67), py(3.59), 6, 0, 7); c.fill();
}

// strata for every cut face (warm sand layers like the kit)
function drawStrata(c, w, h, seed) {
  const R = mulberry(seed);
  const cols = ["#4f6a3a", "#c9a46b", "#b8925e", "#9c7a52", "#7d6347", "#5a4a3c", "#3a3430"];
  const tops = [0, 0.06, 0.2, 0.38, 0.55, 0.72, 0.86];
  for (let k = 0; k < cols.length; k++) {
    c.fillStyle = cols[k]; c.beginPath(); c.moveTo(0, h);
    for (let x = 0; x <= w; x += 16) c.lineTo(x, h * tops[k] + (k ? 6 * Math.sin(x * 0.012 + k * 1.7) + 4 * Math.sin(x * 0.031 + k) : 0));
    c.lineTo(w, h); c.closePath(); c.fill();
  }
  for (let i = 0; i < 1600; i++) { c.fillStyle = `rgba(${R() > 0.5 ? "255,240,210" : "30,20,10"},${0.06 + R() * 0.12})`; c.fillRect(R() * w, h * 0.07 + R() * h * 0.93, 2 + R() * 3, 2 + R() * 2); }
}

// ---------- generic telescope satellite (no logos) ----------
function makeSat() {
  const g = new THREE.Group();
  const foilTex = canvasTex(256, 256, (c, w) => { const R = mulberry(31); c.fillStyle = "#c08a33"; c.fillRect(0, 0, w, w); for (let i = 0; i < 260; i++) { const l = R(); c.fillStyle = `rgba(${l > 0.5 ? "255,226,150" : "90,55,15"},${0.15 + R() * 0.3})`; c.beginPath(); c.moveTo(R() * w, R() * w); c.lineTo(R() * w, R() * w); c.lineTo(R() * w, R() * w); c.fill(); } });
  const solarTex = canvasTex(512, 256, (c, w, h) => { c.fillStyle = "#0d1f3f"; c.fillRect(0, 0, w, h); c.strokeStyle = "rgba(160,190,230,.45)"; c.lineWidth = 3; for (let x = 0; x <= w; x += 42) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y <= h; y += 42) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } });
  const maskTex = canvasTex(256, 256, (c, w) => { const R = mulberry(9); for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { c.fillStyle = R() > 0.5 ? "#30343b" : "#7d848d"; c.fillRect(x * 4, y * 4, 4, 4); } });
  const foil = std(0xffffff, 0.34, 1, { map: foilTex });
  const white = std(0xe9e6df, 0.42, 0.05);
  const dark = std(0x14181f, 0.5, 0.4);
  const silver = new THREE.MeshPhysicalMaterial({ color: 0xd5d9de, metalness: 0.9, roughness: 0.25, clearcoat: 0.3 });
  const body = new THREE.Mesh(rbox(1.0, 1.0, 1.5, 0.08), foil); g.add(body);
  const tube = new THREE.Group();
  const tb = new THREE.Mesh(rcyl(0.36, 1.3, 0.05), white); tb.rotation.x = Math.PI / 2; tube.add(tb);
  const ap = new THREE.Mesh(new THREE.CircleGeometry(0.3, 32), dark); ap.position.z = 0.66; tube.add(ap);
  const t2 = new THREE.Mesh(rcyl(0.15, 1.0, 0.03), white); t2.rotation.x = Math.PI / 2; t2.position.set(-0.3, 0.36, -0.1); tube.add(t2);
  tube.position.set(0.08, -0.05, 1.3); g.add(tube);
  const mask = new THREE.Group();
  const mk = new THREE.Mesh(rbox(1.3, 0.07, 1.0, 0.03), std(0xffffff, 0.6, 0.3, { map: maskTex })); mk.rotation.x = -0.35; mask.add(mk);
  for (const x of [-0.55, 0.55]) { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), silver); st.position.set(x, -0.18, 0); mask.add(st); }
  mask.position.set(0, 0.72, 0.1); g.add(mask);
  const wings = [];
  for (const sd of [-1, 1]) {
    const wg = new THREE.Group();
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), silver); arm.rotation.z = Math.PI / 2; arm.position.x = sd * 0.25; wg.add(arm);
    const pn = new THREE.Mesh(rbox(1.8, 0.035, 0.8, 0.015), std(0xffffff, 0.28, 0.6, { map: solarTex })); pn.position.x = sd * 1.4; wg.add(pn);
    wg.position.x = sd * 0.5; g.add(wg); wings.push(wg);
  }
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 10, 0, Math.PI * 2, 0, 0.9), silver); dish.material.side = THREE.DoubleSide; dish.rotation.x = Math.PI; dish.position.set(0, -0.62, -0.35); g.add(dish);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { g, body, tube, mask, wings, dish, mats: [foil, white] };
}

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.05, 900);
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const s = K;
  const E = {
    nasa: A_("s1:NASA", 1.2), terbakar: A_("s1:terbakar", 3.6), jatuh1: A_("s1:jatuh", 6.5),
    swift: A_("s2:Swift", s.s2 + 4), tahun: A_("s2:tahun", s.s2 + 7), korban: A_("s2:korban", s.s2 + 9), puing: A_("s2:puing", s.s2 + 10.5),
    jatuh: A_("s3:jatuh", s.s3 + 1), cepat: A_("s3:cepat", s.s3 + 2.5), meleset: A_("s3:meleset", s.s3 + 3.6), udara: A_("s3:udara", s.s3 + 8.5), mencuri: A_("s3:mencuri", s.s3 + 9.5),
    matahari: A_("s4:Matahari", s.s4 + 0.5), memanas: A_("s4:memanas", s.s4 + 2.4), mengembang: A_("s4:mengembang", s.s4 + 3.4), padat: A_("s4:padat", s.s4 + 4.6),
    mesin: A_("s4:mesin", s.s4 + 7.4), robot: A_("s4:robot", s.s4 + 8.3), gagal: A_("s4:gagal", s.s4 + 9.6), mendekat: A_("s4:mendekat", s.s4 + 10.2),
    okt: A_("s5:Oktober", s.s5 + 1), diakhiri: A_("s5:diakhiri", s.s5 + 4.5), nov: A_("s5:November", s.s5 + 6), rendah: A_("s5:rendah", s.s5 + 8.5),
    batas: A_("s6:batas", s.s6 + 0.3), lajunya: A_("s6:lajunya", s.s6 + 2.5), udara6: A_("s6:Udara", s.s6 + 6), termampat: A_("s6:termampatkan", s.s6 + 7.3), berpijar: A_("s6:berpijar", s.s6 + 8.5), gesekan: A_("s6:gesekan", s.s6 + 10.5),
    panel: A_("s7:Panel", s.s7), hancur: A_("s7:hancur", s.s7 + 1.5), tung: A_("s7:Tungsten", s.s7 + 2.8), cermin: A_("s7:cermin", s.s7 + 3.6), melesat: A_("s7:melesat", s.s7 + 5.3),
    tenggara: A_("s7:tenggara", s.s7 + 6.2), risiko: A_("s7:Risiko", s.s7 + 7), ambang: A_("s7:ambang", s.s7 + 11.5), prakiraan: A_("s7:Prakiraan", s.s7 + 14),
    bukan: A_("s8:Bukan", s.s8), habis: A_("s8:habis", s.s8 + 2.2),
  };

  const S = new THREE.Scene();
  const SLATE = new THREE.Color(0x0b1220);
  S.background = SLATE;
  S.fog = new THREE.FogExp2(0x0b1220, 0.012);
  const pm = new THREE.PMREMGenerator(r);
  S.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  S.environmentIntensity = 0.55;
  S.add(new THREE.HemisphereLight(0x9fb8d6, 0x2a1e14, 0.75));
  const keyL = new THREE.DirectionalLight(0xffdcb4, 2.2);
  keyL.castShadow = true; keyL.shadow.mapSize.set(2048, 2048);
  Object.assign(keyL.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 90 });
  keyL.shadow.bias = -0.0004; keyL.shadow.normalBias = 0.02;
  S.add(keyL, keyL.target);
  const rimL = new THREE.DirectionalLight(0x6fa8ff, 1.3); S.add(rimL, rimL.target);
  S.add(cam);

  const DOT = dotTex();
  const glow = (color, size, parent = S) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: DOT, color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); sp.scale.setScalar(size); parent.add(sp); return sp; };
  const pointsOf = (n, size, parent = S, fog = true) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const p = new THREE.Points(g, new THREE.PointsMaterial({ size, map: DOT, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, fog }));
    p.frustumCulled = false; parent.add(p); return p;
  };
  const QV = "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}";

  // ---------- lab floor ----------
  const floorTex = canvasTex(512, 512, (c, w) => {
    c.fillStyle = "#0d1522"; c.fillRect(0, 0, w, w);
    c.strokeStyle = "rgba(120,170,200,.16)"; c.lineWidth = 2;
    for (let i = 0; i <= w; i += 128) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, w); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); }
    c.strokeStyle = "rgba(120,170,200,.06)"; c.lineWidth = 1;
    for (let i = 0; i <= w; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, w); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); }
  }, [60, 90]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(240, 360), std(0xffffff, 0.62, 0.35, { map: floorTex }));
  floor.rotation.x = -Math.PI / 2; floor.position.z = -90; floor.receiveShadow = true; S.add(floor);
  const plinthM = std(0x1b2433, 0.42, 0.45);
  const plateTex = (txt) => canvasTex(1024, 96, (c, w, h) => { c.fillStyle = "#0e1726"; c.fillRect(0, 0, w, h); c.fillStyle = TEAL; c.fillRect(0, 0, 10, h); c.font = '700 44px "IBM Plex Mono", monospace'; c.fillStyle = "#cfeff3"; c.textBaseline = "middle"; c.fillText(txt, 34, h / 2 + 2); });

  // =====================================================================  BLOCK station (z 0)
  const blockG = new THREE.Group(); S.add(blockG);
  const plinth = new THREE.Mesh(rbox(15.6, 1.0, 10.6, 0.25), plinthM); plinth.position.y = 0.5; plinth.castShadow = plinth.receiveShadow = true; blockG.add(plinth);
  const strataTex = canvasTex(1024, 256, (c, w, h) => drawStrata(c, w, h, 3));
  const sideM = std(0xffffff, 0.88, 0, { map: strataTex });
  const topM = std(0xffffff, 0.72, 0.02, { map: canvasTex(1400, 900, drawMap) });
  const block = new THREE.Mesh(new THREE.BoxGeometry(BW, 3, BD), [sideM, sideM, topM, sideM, sideM, sideM]);
  block.position.y = BTOP - 1.5; block.castShadow = block.receiveShadow = true; blockG.add(block);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 0.9), new THREE.MeshBasicMaterial({ map: plateTex("AUDIRA · REENTRY LAB // SUMATERA UTARA"), toneMapped: false }));
  plate.position.set(0, 0.5, 5.31); blockG.add(plate);
  const sign = new THREE.Group(); sign.position.set(-0.6, BTOP, -4.4); blockG.add(sign);
  { const bd = new THREE.Mesh(rbox(5.4, 0.9, 0.12, 0.04), plinthM); bd.position.y = 1.0; bd.castShadow = true; sign.add(bd);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 0.72), new THREE.MeshBasicMaterial({ map: plateTex("AUDIRA · LAB SIMULASI RE-ENTRY"), toneMapped: false })); face.position.set(0, 1.0, 0.07); sign.add(face);
    for (const x of [-2.2, 2.2]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8), std(0x9fb3c8, 0.3, 0.9)); leg.position.set(x, 0.3, 0); sign.add(leg); } }
  // glass 120 km layer
  const layerU = { uO: { value: 1 }, uC: { value: new THREE.Color(TEAL) } };
  const layer = new THREE.Mesh(new THREE.PlaneGeometry(BW, BD), new THREE.ShaderMaterial({ uniforms: layerU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, vertexShader: QV,
    fragmentShader: "uniform float uO;uniform vec3 uC;varying vec2 vUv;void main(){vec2 g=abs(fract(vUv*vec2(14.,9.))-.5);float l=smoothstep(.46,.5,max(g.x,g.y));vec2 e=min(vUv,1.-vUv);float ed=1.-smoothstep(0.,.01,min(e.x,e.y));float a=(.04+.16*l+.85*ed)*uO;gl_FragColor=vec4(uC*a,a);}" }));
  layer.rotation.x = -Math.PI / 2; layer.position.y = 7; blockG.add(layer);
  const lab120 = makeLabel("120 KM", TEAL, 1.5); blockG.add(lab120);
  // posts at the corners holding the glass layer
  for (const [x, z] of [[-7, -4.5], [7, -4.5], [-7, 4.5], [7, 4.5]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3, 8), std(0x9fb3c8, 0.3, 0.9)); p.position.set(x, 5.5, z); blockG.add(p); }
  // town lights (calm, small)
  const towns = pointsOf(70, 0.13, blockG);
  {
    const R = mulberry(77), P = towns.geometry.attributes.position, C = towns.geometry.attributes.color;
    const cities = [[98.67, 3.59, 22], [101.45, 0.5, 8], [104.75, -2.98, 9], [101.7, 3.1, 12], [103.8, 1.35, 10], [109.3, -0.03, 6], [106.8, -6.2, 3]];
    let i = 0;
    for (const [lo, la, n] of cities) for (let k = 0; k < n && i < 70; k++, i++) { P.setXYZ(i, MX(lo + (R() - 0.5) * 0.7), BTOP + 0.03, MZ(la + (R() - 0.5) * 0.6)); C.setXYZ(i, 1.0, 0.75, 0.38); }
  }
  // streak + fragments
  const A0 = [94.2, 6.2], EN = [98.6, 3.4], F0 = [113.8, -3.6];
  const pathP = (sv, o) => {
    if (sv < 0) { const u = sv + 1; o.set(MX(lerp(A0[0], EN[0], u)), 7 + 1.9 * -sv, MZ(lerp(A0[1], EN[1], u))); }
    else { const u = Math.min(sv, 1.2); o.set(MX(lerp(EN[0], F0[0], u)), 7 - 2.55 * Math.pow(u, 1.5), MZ(lerp(EN[1], F0[1], u))); }
    return o;
  };
  const NTR = 60, NF = 6, NFT = 34;
  const streak = pointsOf(NTR + NF * NFT, 0.55, blockG);
  const headMain = glow(0xffd29a, 1.6, blockG), headCore = glow(0xffffff, 0.5, blockG);
  const fragHeads = Array.from({ length: NF }, () => glow(0xffb070, 0.6, blockG));
  const FR = Array.from({ length: NF }, (_, i) => { const R = mulberry(300 + i); return { lat: (R() - 0.5) * 1.4, up: (R() - 0.3) * 0.6, sp: 0.82 + R() * 0.2, sz: 0.4 + R() * 0.35, fade: 0.55 + R() * 0.35 }; });
  const ghost = pointsOf(120, 0.09, blockG);
  { const P = ghost.geometry.attributes.position, C = ghost.geometry.attributes.color, o = v3(0, 0, 0); for (let i = 0; i < 120; i++) { pathP(-0.9 + (i / 119) * 1.9, o); P.setXYZ(i, o.x, o.y, o.z); C.setXYZ(i, 0, 0, 0); } }
  const ellipse = pointsOf(90, 0.12, blockG);
  { const P = ellipse.geometry.attributes.position, cx = MX(110.8), cz = MZ(-2.4), ang = Math.atan2(MZ(F0[1]) - MZ(EN[1]), MX(F0[0]) - MX(EN[0])); for (let i = 0; i < 90; i++) { const a = (i / 90) * Math.PI * 2, ex = 2.9 * Math.cos(a), ez = 0.9 * Math.sin(a); P.setXYZ(i, cx + ex * Math.cos(ang) - ez * Math.sin(ang), BTOP + 0.05, cz + ex * Math.sin(ang) + ez * Math.cos(ang)); } }
  const labBrin = makeLabel("PERKIRAAN BRIN", AMBER, 2.3); blockG.add(labBrin);
  const labEntry = makeLabel("SUMATERA UTARA", RED, 2.3); blockG.add(labEntry);
  const dropLine = pointsOf(24, 0.07, blockG);
  { const P = dropLine.geometry.attributes.position; for (let i = 0; i < 24; i++) P.setXYZ(i, MX(EN[0]), BTOP + 0.05 + (i / 23) * 2.9, MZ(EN[1])); }

  // =====================================================================  GLOBE station (ZG)
  const globeZ = new THREE.Group(); S.add(globeZ);
  const R0 = 3.2, G0 = v3(0, 6.8, ZG);
  const gpl = new THREE.Mesh(rcyl(4.4, 1.2, 0.22, 64), plinthM); gpl.position.set(0, 0.6, ZG); gpl.castShadow = gpl.receiveShadow = true; globeZ.add(gpl);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.42, 2.6, 24), std(0xb9935a, 0.3, 1)); stand.position.set(0, 2.5, ZG); stand.castShadow = true; globeZ.add(stand);
  const gplate = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 0.6), new THREE.MeshBasicMaterial({ map: plateTex("AUDIRA · MODEL ORBIT"), toneMapped: false }));
  gplate.position.set(0, 0.62, ZG + 4.42); globeZ.add(gplate);
  const cut = new THREE.Group(); cut.position.copy(G0); globeZ.add(cut);
  cut.quaternion.setFromUnitVectors(v3(-1, 0, -1).normalize(), v3(0.85, 0, 0.75).normalize());
  const earthTex = canvasTex(1024, 512, (c, w, h) => {
    const R = mulberry(12), N = 64, P = new Float32Array(N * N); for (let i = 0; i < P.length; i++) P[i] = R();
    const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const a = P[(yi & 63) * N + (xi & 63)], b = P[(yi & 63) * N + ((xi + 1) & 63)], cc = P[((yi + 1) & 63) * N + (xi & 63)], d = P[((yi + 1) & 63) * N + ((xi + 1) & 63)]; const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); return a + (b - a) * u + (cc - a) * v + (a - b - cc + d) * u * v; };
    const img = c.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const fx = x / 64, fy = y / 64; const n = vn(fx, fy) * 0.55 + vn(fx * 2.1, fy * 2.1) * 0.28 + vn(fx * 4.3, fy * 4.3) * 0.17;
      const lat = Math.abs(y / h - 0.5) * 2; let rr, gg, bb;
      if (lat > 0.86) { rr = 236; gg = 240; bb = 244; }
      else if (n > 0.56) { const k = (n - 0.56) * 3; rr = 95 + 90 * k * (lat < 0.4 ? 1 : 0.4); gg = 125 + 30 * k; bb = 70 + 20 * k; }
      else { const k = n / 0.56; rr = 18 + 22 * k; gg = 80 + 40 * k; bb = 112 + 30 * k; }
      const i = (y * w + x) * 4; img.data[i] = rr; img.data[i + 1] = gg; img.data[i + 2] = bb; img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    c.strokeStyle = "rgba(255,255,255,.12)"; c.lineWidth = 1; for (let i = 1; i < 12; i++) { c.beginPath(); c.moveTo((i * w) / 12, 0); c.lineTo((i * w) / 12, h); c.stroke(); } for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(0, (i * h) / 6); c.lineTo(w, (i * h) / 6); c.stroke(); }
  });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(R0, 96, 64, 0, Math.PI * 1.5), std(0xffffff, 0.62, 0.05, { map: earthTex, side: THREE.DoubleSide }));
  earth.castShadow = true; cut.add(earth);
  const coreTex = canvasTex(512, 512, (c, w) => {
    const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, "#f5c46c"); g.addColorStop(0.3, "#e6973a"); g.addColorStop(0.36, "#f08a2c"); g.addColorStop(0.55, "#e0742c"); g.addColorStop(0.57, "#b5502a"); g.addColorStop(0.95, "#7d3a22"); g.addColorStop(0.955, "#6b4a30"); g.addColorStop(1, "#8a6a44");
    c.fillStyle = g; c.fillRect(0, 0, w, w);
    const R = mulberry(4); for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(255,220,160,${R() * 0.12})`; const a = R() * 7, rr = R() * w * 0.48; c.beginPath(); c.arc(w / 2 + Math.cos(a) * rr, w / 2 + Math.sin(a) * rr, 2 + R() * 6, 0, 7); c.fill(); }
  });
  const faceM = std(0xffffff, 0.7, 0, { map: coreTex, emissiveMap: coreTex, emissive: 0xff8a3d, emissiveIntensity: 0.1, side: THREE.DoubleSide });
  const atmU = { uR: { value: R0 }, uTh: { value: R0 + 0.55 }, uD: { value: 0.3 } };
  const atmM = new THREE.ShaderMaterial({ uniforms: atmU, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: "varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform float uR,uTh,uD;varying vec2 vP;void main(){float r=length(vP);if(r<uR||r>uTh)discard;vec3 c;float a;if(r<uR+.13){c=vec3(.55,.8,1.);a=.6;}else{float k=(r-uR-.13)/max(.05,uTh-uR-.13);c=mix(vec3(.3,.85,.9),vec3(.15,.45,.7),k);a=(.28+.4*uD)*(1.-k*.7);}gl_FragColor=vec4(c,a);}" });
  for (const ry of [0, -Math.PI / 2]) {
    const f = new THREE.Mesh(new THREE.CircleGeometry(R0, 96, Math.PI / 2, Math.PI), faceM); f.rotation.y = ry; cut.add(f);
    const a = new THREE.Mesh(new THREE.CircleGeometry(R0 + 1.4, 96, Math.PI / 2, Math.PI), atmM); a.rotation.y = ry; a.renderOrder = 3; cut.add(a);
  }
  const shellM = (col, o) => new THREE.ShaderMaterial({ uniforms: { uC: { value: new THREE.Color(col) }, uO: { value: o } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: "varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz+vec3(0.,0.,1e-4));gl_Position=projectionMatrix*mv;}",
    fragmentShader: "uniform vec3 uC;uniform float uO;varying vec3 vN;varying vec3 vV;void main(){float f=pow(clamp(1.-abs(dot(normalize(vN),normalize(vV))),0.,1.),2.2);float a=(.06+f)*uO;gl_FragColor=vec4(uC*a,a);}" });
  const tropo = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48, 0, Math.PI * 1.5), shellM(0x8fd0ff, 0.55)); tropo.scale.setScalar(R0 + 0.13); cut.add(tropo);
  const thermo = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48, 0, Math.PI * 1.5), shellM(0x4cc9d9, 0.4)); cut.add(thermo);
  const labAtm = makeLabel("ATMOSFER ATAS", TEAL, 1.9); globeZ.add(labAtm);
  // orbit frame
  const orbG = new THREE.Group(); orbG.position.copy(G0); orbG.rotation.x = -0.36; globeZ.add(orbG);
  const ringM = new THREE.MeshBasicMaterial({ color: 0x4cc9d9, transparent: true, opacity: 0.9, toneMapped: false });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.008, 8, 200), ringM); ring.rotation.x = Math.PI / 2; orbG.add(ring);
  const rAlt = (t) => R0 + 1.2 - 0.33 * ramp(t, E.padat - 0.5, s.s4e) - 0.18 * ramp(t, s.s5, E.okt + 0.3) - 0.215 * ramp(t, E.okt + 0.3, E.nov + 0.3) - 0.175 * ramp(t, E.nov + 0.3, s.s5e);
  const tmid = (s.s3 + s.s3e) / 2;
  const theta = (t) => Math.PI / 2 - 0.09 * (t - tmid) + Math.PI * 2 * 1.25 * ramp(t, s.s5, s.s5e);
  const orbLocal = (t, o) => { const rr = rAlt(t), th = theta(t); return o.set(rr * Math.cos(th), 0, rr * Math.sin(th)); };
  // decay spiral sampled from the same functions
  const spPts = []; { const o = v3(0, 0, 0); for (let i = 0; i <= 240; i++) { const tt = lerp(s.s5, s.s5e, i / 240); spPts.push(orbLocal(tt, o).clone()); } }
  const spiralGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spPts), 480, 0.022, 8, false);
  const spiral = new THREE.Mesh(spiralGeo, new THREE.MeshBasicMaterial({ color: 0xf2a93b, toneMapped: false, transparent: true, opacity: 0.95 })); orbG.add(spiral);
  const lab275 = makeLabel("275 KM", YEL, 1.8), lab190 = makeLabel("190 KM", ORANGE, 1.8); globeZ.add(lab275, lab190);
  const pin275 = orbLocal(E.okt, v3(0, 0, 0)).clone(), pin190 = orbLocal(E.nov, v3(0, 0, 0)).clone();
  const satS = makeSat(); satS.g.scale.setScalar(0.2); globeZ.add(satS.g);
  const satGlow = glow(0xffc070, 0.5, globeZ);
  // arrows: fall (amber) and speed (teal)
  const mkArrow = (col) => { const g = new THREE.Group(); const m = new THREE.MeshBasicMaterial({ color: col, toneMapped: false }); const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 10), m); sh.position.y = 0.5; g.add(sh); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.36, 16), m); tip.position.y = 1.0; g.add(tip); g.userData.tip = tip; g.userData.sh = sh; globeZ.add(g); return g; };
  const arFall = mkArrow(0xf2a93b), arSpd = mkArrow(0x4cc9d9);
  const labFall = makeLabel("JATUH", AMBER, 1.5), labSpd = makeLabel("LAJU", TEAL, 1.35); globeZ.add(labFall, labSpd);
  const air = pointsOf(180, 0.09, globeZ);
  const AIR = Array.from({ length: 180 }, (_, i) => { const R = mulberry(500 + i); return { ph: R(), a: R() * 6.28, rr: 0.08 + R() * 0.8, sp: 0.5 + R() * 0.5 }; });
  // Sun lamp
  const SUNP = G0.clone().add(v3(-3.4, 4.6, -4.0));
  const sunM = std(0x000000, 0.4, 0, { emissive: 0xffa640, emissiveIntensity: 0.8 });
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.15, 48, 32), sunM); sun.position.copy(SUNP); globeZ.add(sun);
  const corona = glow(0xffb347, 5, globeZ); corona.position.copy(SUNP);
  const sunL = new THREE.PointLight(0xffb060, 0, 30, 1.4); sunL.position.copy(SUNP); globeZ.add(sunL);
  const wind = pointsOf(240, 0.07, globeZ);
  const WIND = Array.from({ length: 240 }, (_, i) => { const R = mulberry(900 + i); return { ph: R(), ox: (R() - 0.5) * 2.2, oy: (R() - 0.5) * 2.2, oz: (R() - 0.5) * 2.2 }; });
  const labSun = makeLabel("MATAHARI", AMBER, 1.6); globeZ.add(labSun);
  // tug robot (generic three-arm servicer)
  const tug = new THREE.Group(); globeZ.add(tug);
  { const tm = std(0xd6d0c4, 0.35, 0.4); const b = new THREE.Mesh(rbox(0.7, 0.5, 0.5, 0.08), tm); tug.add(b);
    for (let k = 0; k < 3; k++) { const a = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 8), std(0x8a96a8, 0.3, 0.9)); const ang = (k / 3) * Math.PI * 2; a.position.set(0.55, Math.cos(ang) * 0.22, Math.sin(ang) * 0.22); a.rotation.z = Math.PI / 2 - 0.4 * Math.cos(ang); tug.add(a); }
    const pn = new THREE.Mesh(rbox(0.08, 0.5, 1.4, 0.02), std(0x13284a, 0.3, 0.6)); pn.position.x = -0.42; tug.add(pn);
    tug.scale.setScalar(0.22); }

  // =====================================================================  TUNNEL station (ZS)
  const tunZ = new THREE.Group(); S.add(tunZ);
  const S0 = v3(0, SY, ZS);
  const backU = { uT: { value: 0 }, uLine: { value: -99 }, uHeat: { value: 0 } };
  const back = new THREE.Mesh(new THREE.PlaneGeometry(120, 200), new THREE.ShaderMaterial({ uniforms: backU, fog: false,
    vertexShader: "varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}",
    fragmentShader: `uniform float uT,uLine,uHeat;varying vec3 vW;void main(){float y=vW.y-${SY.toFixed(1)};float alt=y+uT;
      vec3 hi=vec3(.03,.05,.11),mid=vec3(.06,.12,.2),lo=vec3(.32,.16,.08);vec3 c=mix(mid,hi,smoothstep(-5.,40.,alt));c=mix(lo,c,smoothstep(-40.,-6.,alt));
      float band=.5+.5*sin(alt*.9);c+=vec3(.025,.035,.045)*band;
      vec2 g=abs(fract(vW.xy*.5)-.5);c+=vec3(.05,.09,.11)*smoothstep(.47,.5,max(g.x,g.y))*.6;
      float d=abs(vW.y-uLine);c+=vec3(.3,.79,.85)*(exp(-d*d*6.)*1.6+exp(-d*1.2)*.12);
      c+=vec3(.6,.25,.08)*uHeat*.25*exp(-length(vW.xy-vec2(0.,${SY.toFixed(1)}))*.08);
      gl_FragColor=vec4(c,1.);}` }));
  back.position.set(0, SY, ZS - 34); tunZ.add(back);
  const lab120b = makeLabel("120 KM", TEAL, 1.5); tunZ.add(lab120b);
  // flow frame: local +y = travel direction (down-right)
  const DIR = v3(0.42, -1, 0.18).normalize();
  const fz = new THREE.Group(); fz.position.copy(S0); fz.quaternion.setFromUnitVectors(v3(0, 1, 0), DIR); tunZ.add(fz);
  const tumble = new THREE.Group(); fz.add(tumble);
  const satB = makeSat(); satB.g.rotation.x = -Math.PI / 2; tumble.add(satB.g);
  const heatMats = satB.mats;
  // bow shock: paraboloid cap ahead of the nose, with a visible gap
  const shPts = []; for (let i = 0; i <= 40; i++) { const yy = -(i / 40) * 3.2; shPts.push(new THREE.Vector2(Math.sqrt(-yy * 2.0) + 0.001, 2.25 + yy)); }
  const shockU = { uHeat: { value: 0 }, uT: { value: 0 } };
  const shock = new THREE.Mesh(new THREE.LatheGeometry(shPts, 64), new THREE.ShaderMaterial({ uniforms: shockU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: "varying float vY;varying vec3 vN;varying vec3 vV;void main(){vY=position.y;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz+vec3(0.,0.,1e-4));gl_Position=projectionMatrix*mv;}",
    fragmentShader: "uniform float uHeat,uT;varying float vY;varying vec3 vN;varying vec3 vV;void main(){float tip=smoothstep(-2.4,2.25,vY);float f=pow(clamp(1.-abs(dot(normalize(vN),normalize(vV))),0.,1.),1.6);float fl=.85+.15*sin(uT*31.+vY*7.);vec3 c=mix(vec3(1.,.3,.08),vec3(1.,.85,.55),tip);c=mix(c,vec3(1.,1.,.92),tip*tip*tip);float a=uHeat*(.07*tip+.45*f*tip+.03)*fl;gl_FragColor=vec4(c*a*.8,a);}" }));
  fz.add(shock);
  const tipGlow = glow(0xffd6a0, 3.2, fz); tipGlow.position.set(0, 2.1, 0);
  const trailU = { uHeat: { value: 0 }, uT: { value: 0 } };
  const trail = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 0.25, 9, 48, 20, true), new THREE.ShaderMaterial({ uniforms: trailU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, vertexShader: QV,
    fragmentShader: "uniform float uHeat,uT;varying vec2 vUv;void main(){float k=vUv.y;float n=.6+.4*sin(vUv.x*40.+uT*9.+k*13.)*sin(k*22.-uT*14.);vec3 c=mix(vec3(.8,.18,.05),vec3(1.,.7,.35),k);float a=uHeat*pow(k,2.2)*.32*n;gl_FragColor=vec4(c*a,a);}" }));
  trail.position.y = -0.9 - 4.5; fz.add(trail);
  const heatL = new THREE.PointLight(0xff8a40, 0, 14, 1.5); heatL.position.set(0, 1.8, 0); fz.add(heatL);
  const flow = pointsOf(900, 0.1, fz, false);
  const FLOW = Array.from({ length: 900 }, (_, i) => { const R = mulberry(1300 + i); return { r0: Math.sqrt(R()) * 3.4, a: R() * 6.283, ph: R(), sp: 0.8 + R() * 0.4 }; });
  const sparks = pointsOf(320, 0.09, fz, false);
  const SPK = Array.from({ length: 320 }, (_, i) => { const R = mulberry(2100 + i); const d = v3(R() - 0.5, R() - 0.5, R() - 0.5).normalize(); return { d, sp: 1 + R() * 3, ph: R() }; });
  const shards = []; for (let i = 0; i < 10; i++) { const R = mulberry(700 + i); const m = new THREE.Mesh(rbox(0.25 + R() * 0.3, 0.06 + R() * 0.1, 0.2 + R() * 0.3, 0.02), std(0xc8ccd2, 0.4, 0.8, { emissive: 0xff7a30, emissiveIntensity: 0 })); m.userData = { d: v3(R() - 0.5, R() - 0.5, R() - 0.5).normalize(), sp: 0.8 + R() * 1.6, rx: R() * 6 }; m.visible = false; tumble.add(m); shards.push(m); }
  const tungsten = new THREE.Mesh(rbox(0.36, 0.28, 0.42, 0.05), std(0x2a2422, 0.5, 0.9, { emissive: 0xc0280e, emissiveIntensity: 0 })); tungsten.visible = false; tumble.add(tungsten);
  const mirror = new THREE.Mesh(rcyl(0.34, 0.06, 0.02), new THREE.MeshPhysicalMaterial({ color: 0xe8edf2, metalness: 1, roughness: 0.06, emissive: 0xff6a20, emissiveIntensity: 0 })); mirror.visible = false; tumble.add(mirror);
  const labTung = makeLabel("TUNGSTEN", RED, 1.5), labMir = makeLabel("CERMIN", ORANGE, 1.3), labAir = makeLabel("UDARA TERMAMPAT", AMBER, 2.0);
  tunZ.add(labTung, labMir, labAir);

  // ---------- foreground dust riding with the camera ----------
  const fgDust = pointsOf(110, 0.025, cam, false);
  const FD = Array.from({ length: 110 }, (_, i) => { const R = mulberry(4000 + i); return { x: (R() - 0.5) * 2.4, y: (R() - 0.5) * 4.2, z: -1.4 - R() * 3, ph: R() * 6.28, k: 0.2 + R() * 0.5 }; });

  // ---------- post: NaN guard -> bloom -> output -> documentary grade ----------
  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } }, vertexShader: QV,
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);bvec4 n=isnan(c);bvec4 f=isinf(c);if(any(n)||any(f))c=vec4(0.,0.,0.,1.);gl_FragColor=clamp(c,0.,40.);}" })));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.5, 0.5, 0.82);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());
  const gradeU = { tDiffuse: { value: null }, uFlash: { value: 0 } };
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: gradeU, vertexShader: QV,
    fragmentShader: `uniform sampler2D tDiffuse;uniform float uFlash;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=dot(c,vec3(.2126,.7152,.0722));
      vec3 sh=vec3(.9,1.0,1.08),hi=vec3(1.08,1.0,.9);c*=mix(sh,hi,smoothstep(.1,.8,l));c=mix(vec3(l),c,1.05);c=(c-.5)*1.06+.52;c+=vec3(.012,.016,.024)*(1.-l);c+=uFlash*vec3(1.,.8,.6);gl_FragColor=vec4(clamp(c,0.,1.),1.);}` })));

  // ---------- camera shots ----------
  const camB1 = track([
    [0, 0.6, 10.2, 19.5, -2.6, 6.9, -1.4],
    [E.terbakar, 0.2, 10.0, 18.6, -2.2, 6.8, -1.0],
    [s.s1e, 1.4, 9.8, 17.4, -1.2, 6.6, -0.4],
    [s.s2 + 1, 2.0, 9.6, 16.6, -0.8, 6.5, -0.3],
  ]);
  const so = v3(0, 0, 0), sw = v3(0, 0, 0);
  const satWorld = (t, o) => { orbLocal(t, so); return o.copy(so).applyEuler(orbG.rotation).add(G0); };
  const gRel = (tt, dx, dy, dz) => { const p = satWorld(tt, v3(0, 0, 0)).sub(G0); return [tt, p.x + dx, p.y + dy, p.z + dz, p.x - 0.3, p.y + 0.2, p.z]; };
  const gTrack = track([
    [s.s3, 2.0, 3.6, 17.5, 0, 0.6, 0],
    [E.meleset, 3.6, 3.4, 16.5, 0.4, 0.8, 0],
    [E.udara, 2.4, 2.6, 13.5, 0.6, 0.9, 0],
    [s.s3e, 0.4, 3.6, 18.5, -0.5, 1.4, -1],
    [E.memanas, -1.6, 4.8, 22.5, -1.4, 2.2, -1.5],
    [E.padat, -0.8, 4.4, 21.0, -1.0, 1.6, -1.2],
    gRel(E.robot, 2.4, 1.6, 6.5),
    gRel(E.mendekat + 0.5, 3.4, 2.2, 7.5),
    [s.s5 + 0.5, 1.6, 10.5, 15.5, 0, -0.4, 0],
    [E.nov, -1.8, 11.0, 14.5, 0, -0.5, 0],
    [s.s5e, 0.6, 7.0, 13.0, 0, 0.0, 0],
  ]);
  const radial = v3(0, 0, 0), tang = v3(0, 0, 0), upv = v3(0, 1, 0), tmp = v3(0, 0, 0), tmp2 = v3(0, 0, 0);
  const satFrame = (t) => { satWorld(t, sw); satWorld(t + 0.05, tmp); tang.subVectors(tmp, sw).normalize(); radial.subVectors(sw, G0).normalize(); };
  const camG = (t) => {
    satFrame(t);
    // close view relative to the satellite (s2 hero, tug beat)
    const u = clamp01((t - s.s2) / Math.max(1, s.s2e - s.s2));
    const near = sw.clone().addScaledVector(radial, lerp(2.4, 3.0, u)).addScaledVector(upv, 0.45).addScaledVector(tang, lerp(1.1, -0.6, u));
    const nearL = sw.clone().addScaledVector(radial, -0.35);
    const g = gTrack(t); const far = v3(g[0], g[1], g[2]).add(G0), farL = v3(g[3], g[4], g[5]).add(G0);
    const wNear = clamp01(1 - ramp(t, s.s3 - 0.4, s.s3 + 2.0));
    const p = far.lerp(near, wNear), l = farL.lerp(nearL, wNear);
    return [p.x, p.y, p.z, l.x, l.y, l.z];
  };
  const camS = track([
    [s.s6 - 0.6, -1.8, 3.0, 13.5, 0.3, -0.6, 0],
    [E.lajunya, -1.0, 2.0, 12.5, 0.4, -0.8, 0],
    [E.termampat, 0.9, 0.9, 10.8, 0.6, -1.1, 0],
    [E.gesekan, 2.0, 0.6, 11.6, 0.5, -0.9, 0],
    [E.panel, -0.4, 1.4, 12.8, 0.2, -0.6, 0],
    [E.hancur + 1, 1.2, 0.5, 11.0, 0.3, -0.7, 0],
    [E.melesat + 0.6, 0.4, 0.4, 12.5, 0.3, -0.7, 0],
  ].map((k) => [k[0], k[1], k[2] + SY, k[3] + ZS, k[4], k[5] + SY, k[6] + ZS]));
  const camB2 = track([
    [E.melesat - 0.4, -3.2, 10.8, 12.6, -2.4, 5.0, -0.6],
    [E.tenggara + 0.6, 1.0, 11.4, 13.4, 1.2, 4.8, 0.0],
    [E.risiko, 2.8, 12.6, 15.0, 2.4, 4.6, 0.4],
    [E.prakiraan, 1.2, 13.4, 16.4, 1.0, 4.4, 0.2],
    [s.s8, 0.2, 14.0, 18.5, 0, 4.0, 0],
    [s.dur, 0, 15.5, 23, 0, 3.6, 0],
  ]);
  const SHOTS = [[camB1, s.s2, 0.35, 0.85, 2.5], [camG, s.s6, 0.45, 0.75, 3], [camS, E.melesat, 0.45, 0.85, 3], [camB2, 1e9, 0, 0, 0]];
  const pa = v3(0, 0, 0), pb = v3(0, 0, 0), la = v3(0, 0, 0), lb = v3(0, 0, 0);
  function camAt(t) {
    let i = 0; while (t > SHOTS[i][1] + SHOTS[i][3]) i++;
    const c = SHOTS[i][0](t); pa.set(c[0], c[1], c[2]); la.set(c[3], c[4], c[5]);
    let dive = 0;
    if (i > 0) { const [, T, w1, w2] = SHOTS[i - 1]; if (t < T + w2) { const u = clamp01((t - (T - w1)) / (w1 + w2)); const k = u * u * (3 - 2 * u); const c0 = SHOTS[i - 1][0](t); pb.set(c0[0], c0[1], c0[2]); lb.set(c0[3], c0[4], c0[5]); pa.lerpVectors(pb, pa, k); la.lerpVectors(lb, la, k); dive = Math.sin(Math.PI * u); } }
    if (i < SHOTS.length - 1) { const [, T, w1, w2] = SHOTS[i]; if (t > T - w1) { const u = clamp01((t - (T - w1)) / (w1 + w2)); const k = u * u * (3 - 2 * u); const c1 = SHOTS[i + 1][0](t); pb.set(c1[0], c1[1], c1[2]); lb.set(c1[3], c1[4], c1[5]); pa.lerp(pb, k); la.lerp(lb, k); dive = Math.sin(Math.PI * u); pa.y += SHOTS[i][4] * dive; la.y += SHOTS[i][4] * dive * 0.6; } }
    return dive;
  }
  const col = new THREE.Color();
  const P3 = v3(0, 0, 0), Q3 = v3(0, 0, 0);

  // ================================================================ draw
  return function draw(t) {
    if (!(t >= 0)) t = 0;
    const dive = camAt(t);
    cam.position.copy(pa);
    cam.position.x += 0.05 * Math.sin(t * 0.43); cam.position.y += 0.04 * Math.sin(t * 0.37 + 1.3);
    cam.lookAt(la);
    cam.fov = 38 + 8 * dive; cam.updateProjectionMatrix();
    gradeU.uFlash.value = 0.05 * dive * dive;
    const cz = cam.position.z;
    const inB = cz > -45, inG = cz <= -45 && cz > -140, inS = cz <= -140;
    blockG.visible = inB; globeZ.visible = inG; tunZ.visible = inS;
    const focus = inB ? v3(0, 3, 0) : inG ? v3(0, 4, ZG) : S0;
    keyL.position.copy(focus).add(v3(9, 18, 12)); keyL.target.position.copy(focus);
    rimL.position.copy(focus).add(v3(-6, 8, -16)); rimL.target.position.copy(focus);
    // foreground dust
    { const P = fgDust.geometry.attributes.position, C = fgDust.geometry.attributes.color; FD.forEach((d, i) => { P.setXYZ(i, d.x + 0.08 * Math.sin(t * 0.3 + d.ph), d.y + 0.1 * Math.sin(t * 0.21 + d.ph * 2), d.z); C.setXYZ(i, 0.5 * d.k, 0.55 * d.k, 0.6 * d.k); }); P.needsUpdate = C.needsUpdate = true; }

    // ================= BLOCK
    if (inB) {
      const regime1 = t < s.s3;
      let sv, on;
      if (regime1) { sv = 0.02 + (t - E.terbakar) * 0.075; on = 1; }
      else { sv = 0.08 + 0.92 * ramp(t, E.melesat - 0.5, E.ambang); on = ramp(t, E.melesat - 0.5, E.melesat); }
      const heat = clamp01((sv + 0.6) / 0.6);
      const split = ramp(sv, 0.03, 0.12);
      const P = streak.geometry.attributes.position, C = streak.geometry.attributes.color;
      let n = 0;
      // main trail (before and during split)
      const mainA = on * (1 - split);
      for (let k = 0; k < NTR; k++) {
        const sk = sv - k * 0.011; pathP(sk, P3);
        let f = (1 - k / NTR) * mainA * clamp01((sk + 0.75) / 0.4);
        f *= 1.7; P.setXYZ(n, P3.x, P3.y, P3.z); C.setXYZ(n, 1.0 * f, 0.62 * f * (1 - k / NTR * 0.5), 0.3 * f * (1 - k / NTR)); n++;
      }
      pathP(sv, P3);
      headMain.position.copy(P3); headMain.material.opacity = mainA * (0.4 + 0.6 * heat); headMain.scale.setScalar(1.8 + 2.0 * heat);
      headCore.position.copy(P3); headCore.material.opacity = mainA * heat;
      // fragments
      for (let i = 0; i < NF; i++) {
        const fr = FR[i];
        const fsv = 0.05 + (sv - 0.05) * fr.sp;
        const fadeA = on * split * (1 - ramp(fsv, fr.fade, fr.fade + 0.2));
        for (let k = 0; k < NFT; k++) {
          const sk = Math.max(0.05, fsv - k * 0.009); pathP(sk, P3);
          const sp = (sk - 0.05);
          P3.x += -0.45 * fr.lat * sp * 2.4; P3.z += 0.9 * fr.lat * sp * 2.4; P3.y += fr.up * sp;
          const f = (1 - k / NFT) * fadeA * fr.sz * 1.6;
          P.setXYZ(n, P3.x, P3.y, P3.z); C.setXYZ(n, 1.0 * f, 0.55 * f, 0.22 * f); n++;
          if (k === 0) { fragHeads[i].position.copy(P3); fragHeads[i].material.opacity = fadeA; fragHeads[i].scale.setScalar(0.35 + fr.sz); }
        }
      }
      P.needsUpdate = C.needsUpdate = true;
      // ghost route and ellipse (s7 onwards)
      const gA = regime1 ? 0 : ramp(t, E.melesat, E.tenggara + 0.5);
      { const GC = ghost.geometry.attributes.color; for (let i = 0; i < 120; i++) { const f = gA * 0.45 * (i % 2); GC.setXYZ(i, 0.95 * f, 0.66 * f, 0.23 * f); } GC.needsUpdate = true; }
      const eA = regime1 ? 0 : ramp(t, E.tenggara - 0.2, E.tenggara + 0.6);
      { const EC = ellipse.geometry.attributes.color; for (let i = 0; i < 90; i++) { const f = eA * (i % 2 ? 0.9 : 0.25) * (0.8 + 0.2 * Math.sin(t * 3 + i * 0.3)); EC.setXYZ(i, 0.95 * f, 0.66 * f, 0.23 * f); } EC.needsUpdate = true; }
      labBrin.visible = eA > 0.01; labBrin.material.opacity = eA * (1 - ramp(t, s.s8 + 2, s.s8 + 2.6) * 0); labBrin.position.set(MX(105.8), BTOP + 0.9, MZ(-4.9));
      // entry marker: hook + s7
      const dA = regime1 ? win(t, -1, s.s2 - 0.2, 1, 0.4) : ramp(t, E.melesat, E.melesat + 0.6) * (1 - ramp(t, E.risiko, E.risiko + 0.5));
      { const DC = dropLine.geometry.attributes.color; for (let i = 0; i < 24; i++) { const f = dA * (i % 2) * 0.8; DC.setXYZ(i, 0.9 * f, 0.33 * f, 0.24 * f); } DC.needsUpdate = true; }
      labEntry.visible = dA > 0.01; labEntry.material.opacity = dA; labEntry.position.set(MX(EN[0]) + 0.25, BTOP + 0.55, MZ(EN[1]) + 0.2);
      lab120.visible = true; lab120.material.opacity = 1; lab120.position.set(-7.0 + 0.1, 7.35, -4.5);
      layerU.uO.value = 0.8 + 0.2 * Math.sin(t * 1.3);
      towns.material.opacity = 1;
    }

    // ================= GLOBE
    if (inG) {
      const th = 0.55 + 0.6 * ramp(t, E.memanas - 0.3, E.mengembang + 0.8);
      thermo.scale.setScalar(R0 + th); atmU.uTh.value = R0 + th;
      const dens = ramp(t, E.memanas - 0.3, E.padat + 0.5);
      atmU.uD.value = 0.3 + 0.7 * dens; thermo.material.uniforms.uO.value = 0.35 + 0.4 * dens;
      labAtm.visible = win(t, E.mengembang - 0.4, s.s4e - 0.6) > 0.01; labAtm.material.opacity = win(t, E.mengembang - 0.4, s.s4e - 0.6);
      labAtm.position.copy(G0).add(v3(-R0 - th - 0.2, 1.6, 0.4)); labAtm.center.set(1, 0.5);
      // orbit ring follows the current altitude; colour follows the warning ramp
      const rr = rAlt(t); ring.scale.setScalar(rr);
      const st = t < s.s4 ? 0 : t < s.s5 ? 1 : 2;
      ringM.color.set([0x4cc9d9, 0xd9b84a, 0xe07b39][st]); ringM.opacity = 0.35 + 0.55 * (1 - ramp(t, s.s5 + 0.5, s.s5 + 2)) + 0.1;
      ring.material.opacity = Math.min(1, ringM.opacity);
      ring.visible = true; ring.scale.y = rr; // torus lies in its own XY, rotated into the orbit plane
      // spiral drawn as the satellite descends
      const sp = clamp01((t - s.s5) / (s.s5e - s.s5));
      spiral.visible = sp > 0.002; spiralGeo.setDrawRange(0, Math.floor(spiralGeo.index.count * sp / 6) * 6);
      lab275.visible = t > E.okt - 0.1; lab275.material.opacity = ramp(t, E.okt - 0.1, E.okt + 0.3) * (1 - ramp(t, E.nov - 0.2, E.nov + 0.2) * 0.55);
      lab275.position.copy(pin275).applyEuler(orbG.rotation).add(G0).add(v3(0.15, 0.25, 0));
      lab190.visible = t > E.nov - 0.1; lab190.material.opacity = ramp(t, E.nov - 0.1, E.nov + 0.3);
      lab190.position.copy(pin190).applyEuler(orbG.rotation).add(G0).add(v3(0.15, 0.25, 0));
      // satellite
      satFrame(t);
      satS.g.position.copy(sw); tmp.copy(sw).add(tang); satS.g.up.copy(radial); satS.g.lookAt(tmp);
      const satScale = 0.2 * (1 + 0.9 * ramp(t, s.s3, s.s3 + 2));
      satS.g.scale.setScalar(satScale);
      satGlow.position.copy(sw); satGlow.material.opacity = 0.25 * ramp(t, s.s3, s.s3 + 2) + 0.45 * ramp(t, s.s5e - 2, s.s5e);
      // arrows (s3)
      const aA = win(t, E.jatuh - 0.3, s.s4 + 0.3, 0.3, 0.5);
      const fallLen = 1.5 * ramp(t, E.jatuh - 0.3, E.jatuh + 0.4);
      const spdLen = 1.9 * ramp(t, E.cepat - 0.3, E.cepat + 0.4) * (1 - 0.3 * ramp(t, E.mencuri, E.mencuri + 0.8));
      const setArrow = (ar, dir, len, a) => { ar.visible = a > 0.01 && len > 0.02; if (!ar.visible) return; ar.position.copy(sw); ar.quaternion.setFromUnitVectors(upv, dir); ar.userData.sh.scale.y = len; ar.userData.sh.position.y = len / 2; ar.userData.tip.position.y = len; };
      tmp2.copy(radial).negate();
      setArrow(arFall, tmp2, fallLen, aA); setArrow(arSpd, tang, spdLen, aA);
      labFall.visible = aA * fallLen > 0.05; labFall.material.opacity = aA; labFall.position.copy(sw).addScaledVector(tmp2, fallLen + 0.25);
      labSpd.visible = aA * spdLen > 0.05; labSpd.material.opacity = aA; labSpd.position.copy(sw).addScaledVector(tang, spdLen + 0.2).add(v3(0, 0.12, 0));
      // residual air streaming past the satellite
      const airA = ramp(t, E.udara - 0.4, E.udara + 0.6) * (1 - ramp(t, s.s5e - 0.5, s.s5e)) * (0.45 + 0.55 * dens);
      { const P = air.geometry.attributes.position, C = air.geometry.attributes.color; AIR.forEach((a, i) => { const u = ((a.ph + t * 0.55 * a.sp) % 1) * 2 - 1; tmp.copy(sw).addScaledVector(tang, -u * 2.2).addScaledVector(radial, Math.cos(a.a) * a.rr); tmp.y += Math.sin(a.a) * a.rr; P.setXYZ(i, tmp.x, tmp.y, tmp.z); const f = airA * (1 - Math.abs(u)) * (i < 60 + 120 * dens ? 1 : 0); C.setXYZ(i, 0.6 * f, 0.85 * f, 1.0 * f); }); P.needsUpdate = C.needsUpdate = true; }
      // Sun
      const flare = ramp(t, E.matahari - 0.3, E.matahari + 0.5) * (1 - 0.5 * ramp(t, s.s5 + 1, s.s5e));
      sunM.emissiveIntensity = 0.7 + 2.6 * flare;
      corona.material.opacity = 0.35 + 0.55 * flare; corona.scale.setScalar(4.2 + 2.5 * flare + 0.3 * Math.sin(t * 2.3));
      sunL.intensity = 4 + 70 * flare;
      labSun.visible = win(t, E.matahari - 0.2, E.mengembang + 0.4) > 0.01; labSun.material.opacity = win(t, E.matahari - 0.2, E.mengembang + 0.4); labSun.position.copy(SUNP).add(v3(1.3, 0.6, 0));
      const wA = win(t, E.matahari, s.s4e - 0.5, 0.4, 0.8);
      { const P = wind.geometry.attributes.position, C = wind.geometry.attributes.color; WIND.forEach((w, i) => { const u = (w.ph + t * 0.32) % 1; tmp.lerpVectors(SUNP, G0, u); tmp.x += w.ox * (1 - u) * 0.8 + w.ox * u * 1.2; tmp.y += w.oy * (1 - u) * 0.8 + w.oy * u * 1.2; tmp.z += w.oz * 0.7; P.setXYZ(i, tmp.x, tmp.y, tmp.z); const f = wA * Math.sin(Math.PI * u); C.setXYZ(i, 1.0 * f, 0.68 * f, 0.3 * f); }); P.needsUpdate = C.needsUpdate = true; }
      // tug robot: approaches, starts spinning, drifts away
      const tA = win(t, E.robot - 0.3, E.mendekat + 1.6, 0.4, 0.6);
      tug.visible = tA > 0.01;
      if (tug.visible) {
        const app = ramp(t, E.robot - 0.3, E.gagal), lost = ramp(t, E.gagal, E.mendekat + 1.6);
        tug.position.copy(sw).addScaledVector(tang, -1.5 + 0.55 * app - 1.2 * lost).addScaledVector(radial, 0.2 + 1.1 * lost).add(v3(0, 0.1 + 0.5 * lost, 0));
        tug.rotation.set(0.3 + 9 * lost * lost, 1.2 + 6 * lost, 0.2 + 4 * lost * lost);
        tug.scale.setScalar(0.42 * tA);
      }
    }

    // ================= TUNNEL
    if (inS) {
      const heat = clamp01(ramp(t, s.s6 - 0.4, E.batas + 0.8) * 0.45 + ramp(t, E.udara6 - 0.3, E.berpijar) * 0.55);
      const comp_ = ramp(t, E.udara6 - 0.5, E.termampat + 0.4);
      const brk = ramp(t, E.hancur - 0.1, E.hancur + 0.9);
      backU.uT.value = t * 2.2; backU.uLine.value = SY - (E.batas - t) * 2.6; backU.uHeat.value = heat;
      lab120b.visible = Math.abs(backU.uLine.value - SY) < 9; lab120b.material.opacity = 1 - clamp01(Math.abs(backU.uLine.value - SY) / 9);
      lab120b.position.set(-3.6, backU.uLine.value + 0.35, ZS - 6);
      shockU.uHeat.value = heat * (0.25 + 0.75 * comp_) * (1 - 0.35 * brk); shockU.uT.value = t;
      trailU.uHeat.value = heat; trailU.uT.value = t;
      tipGlow.material.opacity = 0.45 * heat * (0.3 + 0.7 * comp_); tipGlow.scale.setScalar(1.0 + 0.9 * heat);
      heatL.intensity = 10 * heat;
      bloom.strength = 0.45 + 0.2 * heat;
      tumble.rotation.y = 0.25 * t + 0.6;
      tumble.rotation.x = 0.06 * Math.sin(t * 0.7);
      for (const m of heatMats) { m.emissive = m.emissive || new THREE.Color(); m.emissive.setRGB(0.9 * heat * 0.25, 0.3 * heat * 0.25, 0.08 * heat * 0.25); }
      // breakup: wings tear off first, then body melts into shards and sparks
      const wu = ramp(t, E.panel - 0.1, E.panel + 2.4);
      satB.wings.forEach((wg, i) => { const sd = i ? 1 : -1; wg.position.set(sd * (0.5 + 1.6 * wu), -0.2 * wu, -4.5 * wu * wu); wg.rotation.set(5 * wu * sd, 3 * wu, 2.5 * wu); wg.scale.setScalar(Math.max(0.001, 1 - wu * wu)); wg.visible = wu < 0.99; });
      const bodyS = Math.max(0.001, 1 - brk);
      for (const m of [satB.body, satB.tube, satB.mask, satB.dish]) { m.scale.setScalar(bodyS); m.visible = brk < 0.99; }
      const su = ramp(t, E.hancur - 0.1, E.hancur + 2.0);
      shards.forEach((m) => { m.visible = su > 0.01 && su < 0.99; const d = m.userData; m.position.copy(d.d).multiplyScalar(d.sp * su * 1.8); m.position.z -= 3.0 * su * su; m.rotation.set(d.rx + 4 * su, 3 * su, 2 * su); m.scale.setScalar(Math.max(0.001, 1 - su)); m.material.emissiveIntensity = 2.2 * Math.sin(Math.PI * su); });
      const surv = ramp(t, E.hancur, E.hancur + 0.6);
      tungsten.visible = surv > 0.01; tungsten.position.set(-0.35 - 0.25 * surv, 0.1, -0.6 * surv); tungsten.rotation.set(t * 1.1, t * 0.7, 0); tungsten.material.emissiveIntensity = 1.6 * surv * (0.85 + 0.15 * Math.sin(t * 6));
      mirror.visible = surv > 0.01; mirror.position.set(0.45 + 0.25 * surv, -0.1, 0.4 - 0.6 * surv); mirror.rotation.set(1.2 + t * 0.9, t * 0.5, 0.4); mirror.material.emissiveIntensity = 0.5 * surv;
      tumble.updateMatrixWorld(true);
      const lT = win(t, E.tung - 0.2, E.melesat + 0.2, 0.3, 0.3), lM = win(t, E.cermin - 0.2, E.melesat + 0.2, 0.3, 0.3);
      labTung.visible = lT > 0.01; labTung.material.opacity = lT; tungsten.getWorldPosition(labTung.position); labTung.position.x -= 0.2; labTung.position.y += 0.35; labTung.center.set(1, 0.5);
      labMir.visible = lM > 0.01; labMir.material.opacity = lM; mirror.getWorldPosition(labMir.position); labMir.position.x += 0.35; labMir.position.y -= 0.1;
      const lA = win(t, E.termampat - 0.2, E.panel - 0.3, 0.3, 0.4);
      labAir.visible = lA > 0.01; labAir.material.opacity = lA; fz.localToWorld(labAir.position.set(0, 2.5, 0)); labAir.position.y += 0.9; labAir.center.set(0.5, 0);
      // flow of air molecules in the travel frame: undisturbed ahead, piled up and heated behind the shock front
      const P = flow.geometry.attributes.position, C = flow.geometry.attributes.color;
      const kS = 0.5;
      FLOW.forEach((f, i) => {
        const yu = 7 - ((f.ph + t * 0.9 * f.sp) % 1) * 15;
        let rr = f.r0, y = yu, hot = 0;
        const ys = 2.25 - kS * rr * rr;
        if (yu < ys && comp_ > 0.001) { const dd = ys - yu; y = ys - dd * lerp(1, 0.4, comp_); rr = f.r0 + comp_ * (0.25 + dd * 0.32); hot = comp_ * Math.exp(-dd * 0.5) * (1 - brk * 0.4); }
        P.setXYZ(i, Math.cos(f.a) * rr, y, Math.sin(f.a) * rr);
        const base = 0.22 + 0.1 * (1 - Math.abs(yu) / 8);
        const k = Math.min(1, base + hot * 1.2) * (0.5 + 0.5 * heat + 0.3);
        C.setXYZ(i, lerp(0.45, 1.0, hot) * k, lerp(0.7, 0.55, hot) * k, lerp(0.95, 0.22, hot) * k);
      });
      P.needsUpdate = C.needsUpdate = true;
      { const SP = sparks.geometry.attributes.position, SC = sparks.geometry.attributes.color; const su2 = ramp(t, E.panel - 0.1, E.melesat); SPK.forEach((p, i) => { const u = (p.ph + t * 0.8) % 1; const a = su2 > 0 && su2 < 1 ? 1 : 0; tmp.copy(p.d).multiplyScalar(p.sp * u * 0.8); tmp.y -= 5 * u; SP.setXYZ(i, tmp.x, tmp.y, tmp.z); const f = a * (1 - u) * (0.6 + 0.4 * brk); SC.setXYZ(i, 1.0 * f, 0.6 * f, 0.25 * f); }); SP.needsUpdate = SC.needsUpdate = true; }
    } else bloom.strength = inB ? 0.55 : 0.5;

    comp.render();
  };
}
