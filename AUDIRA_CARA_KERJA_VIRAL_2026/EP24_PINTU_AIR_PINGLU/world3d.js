// EP24 PINTU AIR PINGLU. TOYDIORAMA look: a miniature canal staircase built as a table-top theatre diorama on a wooden stage.
// Matte toy plastic and soft clay (roughness 0.7-0.85), warm stage key light, footlights, cardboard hills on dowels,
// kraft-paper signs with washi tape, toy workers with hard hats, a toy cargo ship.
// The canal runs along +x and steps down: upstream reach (U) -> Madao lock (hero, cut away at the front so water,
// floor culvert and valve are visible) -> reach 2 (R2) -> Qishi lock -> reach 3 (R3) -> Qingnian lock -> sea.
// Three stepped water-saving basins sit behind the Madao chamber.
// Every value is a pure function of t (seeded PRNG only). Time constants come from scene keys K and word anchors AT.
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

// levels (toy units; Madao head 2.2 ~ 29.6 m, Qishi 2.0 ~ 27 m, Qingnian 0.7 ~ 10.32 m)
const U = 5.25, R2 = 3.05, R3 = 1.05, SEA = 0.35, D = 0.9, BASE = -0.6;
const XM0 = -3, XM1 = 3, XQ0 = 8.5, XQ1 = 12, XN0 = 15, XN1 = 17.5;
const CZ = 0.9, BW = -1.25, FRONT = 1.0;

// ---------- geometry helpers ----------
function rbox(w, h, d, r, seg = 3) {
  r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
  const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
  s.moveTo(x, y - r); s.lineTo(x + ww, y - r); s.quadraticCurveTo(x + ww + r, y - r, x + ww + r, y);
  s.lineTo(x + ww + r, y + hh); s.quadraticCurveTo(x + ww + r, y + hh + r, x + ww, y + hh + r);
  s.lineTo(x, y + hh + r); s.quadraticCurveTo(x - r, y + hh + r, x - r, y + hh); s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelSize: r * 0.98, bevelThickness: r, bevelSegments: seg, curveSegments: 5 });
  g.translate(0, 0, -(d - 2 * r) / 2); g.computeVertexNormals();
  return g;
}
// box from min/max corners
function rb(parent, mat, x0, x1, y0, y1, z0, z1, r = 0.06, shadow = true) {
  const m = new THREE.Mesh(rbox(x1 - x0, y1 - y0, z1 - z0, r), mat);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = shadow; m.receiveShadow = true;
  parent.add(m);
  return m;
}
const dotTex = () => canvasTex(128, 128, (c, w) => { const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.3, "rgba(255,255,255,.5)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(0, 0, w, w); });

// kraft-paper sign with a washi tape strip
function signTex(txt, sub, bg = "#EBD9B4", ink = "#2B2118", px = 92) {
  return canvasTex(640, 300, (c, w, h) => {
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    const R = mulberry(txt.length * 13 + 7);
    for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(90,60,30,${0.03 + R() * 0.05})`; c.fillRect(R() * w, R() * h, 2, 2); }
    c.strokeStyle = "rgba(60,40,20,.35)"; c.lineWidth = 6; c.strokeRect(14, 14, w - 28, h - 28);
    c.fillStyle = "rgba(230,120,90,.55)"; c.save(); c.translate(w / 2, 16); c.rotate(-0.04); c.fillRect(-90, -14, 180, 40); c.restore();
    c.fillStyle = ink; c.textAlign = "center"; c.textBaseline = "middle";
    c.font = `800 ${px}px "Space Grotesk", "Outfit", sans-serif`; c.fillText(txt, w / 2, sub ? h / 2 - 22 : h / 2 + 6);
    if (sub) { c.font = `600 44px "JetBrains Mono", monospace`; c.fillStyle = "#B4532A"; c.fillText(sub, w / 2, h / 2 + 62); }
  });
}

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.05, 400);
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const s = K;
  const E = {
    pompa: A_("s1:pompa", s.s1 + 4.5),
    terusan: A_("s2:Terusan", s.s2 + 1.2), cgtn: A_("s2:CGTN", s.s2 + 5), enam: A_("s2:enam", s.s2 + 8.5), laut: A_("s2:laut", s.s2 + 11),
    terjun: A_("s3:terjun", s.s3 + 2), tangga: A_("s3:tangga", s.s3 + 4), madao: A_("s3:Madao", s.s3 + 5.5), qishi: A_("s3:Qishi", s.s3 + 6.5), qingnian: A_("s3:Qingnian", s.s3 + 7.6), pintu3: A_("s3:pintu", s.s3 + 9.5),
    masuk: A_("s4:masuk", s.s4 + 0.4), menutup: A_("s4:menutup", s.s4 + 3.4), V: A_("s4:V", s.s4 + 6), tekanan: A_("s4:Tekanan", s.s4 + 6.6), rapat: A_("s4:rapat", s.s4 + 9.2),
    katup: A_("s5:katup", s.s5 + 0.4), mengalir: A_("s5:mengalir", s.s5 + 3.2), turun: A_("s5:turun", s.s5 + 6.8), madao5: A_("s5:Madao", s.s5 + 7.6), m296: A_("s5:29,6", s.s5 + 9.4),
    dibuang: A_("s6:dibuang", s.s6 + 1.4), kolam: A_("s6:kolam", s.s6 + 3), menabung: A_("s6:menabungnya", s.s6 + 4.8), kembali: A_("s6:mengembalikannya", s.s6 + 7.4), enam6: A_("s6:enam", s.s6 + 9.6), ulang: A_("s6:ulang", s.s6 + 11.5),
    kamar7: A_("s7:kamar", s.s7 + 0.4), kubik: A_("s7:kubik", s.s7 + 3.6), menit: A_("s7:menit", s.s7 + 6.4), sama: A_("s7:sama", s.s7 + 8), terbuka: A_("s7:terbuka", s.s7 + 9.6), rekor: A_("s7:rekor", s.s7 + 12.6),
    bukan: A_("s8:Bukan", s.s8), gravitasi: A_("s8:gravitasi", s.s8 + 1.4), pintu8: A_("s8:pintu", s.s8 + 2.6),
  };

  const S = new THREE.Scene();
  S.background = new THREE.Color(0x10131c);
  S.fog = new THREE.Fog(0x141722, 40, 95);
  const pm = new THREE.PMREMGenerator(r);
  S.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  S.environmentIntensity = 0.55;
  S.add(new THREE.HemisphereLight(0xffe7c4, 0x2a2230, 0.45));
  const key = new THREE.DirectionalLight(0xffd9a8, 1.4);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03;
  const sc_ = key.shadow.camera; sc_.left = -13; sc_.right = 13; sc_.top = 13; sc_.bottom = -13; sc_.near = 1; sc_.far = 70;
  S.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x9fb8ff, 0.7); rim.position.set(-6, 9, -14); S.add(rim);
  const warmFill = new THREE.PointLight(0xffa860, 6, 26, 1.8); warmFill.position.set(4, 3, 9); S.add(warmFill);

  // ---------- materials (matte toy plastic + soft clay) ----------
  const toy = (color, rough = 0.78, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.02, ...extra });
  const M = {
    concrete: toy(0xd6c7aa, 0.82), concreteDk: toy(0xc9b99c, 0.84), coping: toy(0xe2d5bb, 0.72),
    grass: toy(0x6aa35a, 0.85), grassDk: toy(0x4f8a4a, 0.85), clay: toy(0xb07a4e, 0.88), clayDk: toy(0x8a5a39, 0.9),
    gate: toy(0xe07a3a, 0.72), gateDk: toy(0xb85a26, 0.75), steel: toy(0x3d4a5c, 0.6),
    hullRed: toy(0xd2483a, 0.7), hullNavy: toy(0x22344f, 0.72), deck: toy(0x9a6b45, 0.8), white: toy(0xf7f3ea, 0.7), glass: toy(0x2a3d55, 0.35),
    cont: [toy(0x2f7fc1, 0.74), toy(0xf2b632, 0.74), toy(0x3aa36b, 0.74), toy(0xe0623a, 0.74), toy(0xf7f3ea, 0.74)],
    wood: toy(0x8a5a36, 0.8), dowel: toy(0xd8b07a, 0.75), yellow: toy(0xf4c430, 0.7), pipe: toy(0x6f7f8f, 0.65),
    dark: toy(0x1b2433, 0.8),
  };
  const waterM = () => new THREE.MeshPhysicalMaterial({ color: 0x3b9ee0, roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 0.8, depthWrite: false, emissive: 0x0b3a66, emissiveIntensity: 0.15 });
  const rippleTex = canvasTex(256, 256, (c, w) => {
    c.fillStyle = "#808080"; c.fillRect(0, 0, w, w);
    const R = mulberry(77);
    for (let i = 0; i < 70; i++) { c.strokeStyle = `rgba(255,255,255,${0.15 + R() * 0.25})`; c.lineWidth = 2 + R() * 3; c.beginPath(); const x = R() * w, y = R() * w; c.ellipse(x, y, 10 + R() * 26, 3 + R() * 5, 0, 0, Math.PI * 2); c.stroke(); }
  }, [3, 1]);
  const surfM = new THREE.MeshPhysicalMaterial({ color: 0x5cb6ee, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.03, transparent: true, opacity: 0.55, depthWrite: false, map: rippleTex, emissive: 0x15507f, emissiveIntensity: 0.15 });

  const world = new THREE.Group(); S.add(world);

  // ---------- stage: plank floor, footlights, backdrop with cardboard flats ----------
  const plankTex = canvasTex(1024, 1024, (c, w) => {
    const R = mulberry(5);
    for (let i = 0; i < 8; i++) { const y = i * w / 8; c.fillStyle = ["#5b3a24", "#664129", "#553620", "#6a452b"][i % 4]; c.fillRect(0, y, w, w / 8); c.fillStyle = "rgba(0,0,0,.45)"; c.fillRect(0, y, w, 4); for (let k = 0; k < 40; k++) { c.fillStyle = `rgba(30,15,5,${0.05 + R() * 0.08})`; c.fillRect(R() * w, y + R() * w / 8, 60 + R() * 200, 2); } c.fillStyle = "rgba(0,0,0,.4)"; c.fillRect(R() * w, y, 4, w / 8); }
  }, [10, 6]);
  const stageFloor = new THREE.Mesh(new THREE.PlaneGeometry(120, 60), new THREE.MeshStandardMaterial({ map: plankTex, roughness: 0.7, metalness: 0.02 }));
  stageFloor.rotation.x = -Math.PI / 2; stageFloor.position.set(8, BASE - 0.01, 0); stageFloor.receiveShadow = true; world.add(stageFloor);
  // diorama table edge (wood) along the front
  rb(world, M.wood, -16, 31, BASE - 0.5, BASE, FRONT, FRONT + 0.5, 0.08);
  const foots = [];
  const footGlowM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc070).multiplyScalar(2.2), toneMapped: false });
  for (let i = 0; i < 18; i++) {
    const x = -13 + i * 2.5;
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.18, 20), M.dark); cup.position.set(x, BASE + 0.09, 3.8); world.add(cup);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), footGlowM); bulb.position.set(x, BASE + 0.18, 3.8); world.add(bulb);
    foots.push(bulb);
  }
  const footL = [0, 1, 2, 3].map((i) => { const p = new THREE.PointLight(0xffb060, 4, 9, 1.6); p.position.set(-6 + i * 8, BASE + 0.6, 3.6); world.add(p); return p; });
  // backdrop
  const back_ = new THREE.Mesh(new THREE.PlaneGeometry(140, 50), toy(0x1a2033, 0.95)); back_.position.set(8, 18, -14); world.add(back_);
  const hillShape = (rad) => { const sh = new THREE.Shape(); sh.absarc(0, 0, rad, 0, Math.PI, false); sh.lineTo(rad, 0); return new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2, curveSegments: 40 }); };
  {
    const R = mulberry(24);
    const hc = [0x4f8a4a, 0x5f9a54, 0x3f7a45, 0x6aa35a];
    for (let i = 0; i < 9; i++) { const h = new THREE.Mesh(hillShape(3.5 + R() * 4), toy(hc[i % 4], 0.85)); h.position.set(-14 + i * 5.6 + R() * 2, BASE + 4 + R() * 1.5, -10 - R() * 2); h.castShadow = true; world.add(h); }
    for (let i = 0; i < 6; i++) {
      const cl = new THREE.Group(); const cm = toy(0xf6f1e6, 0.8);
      [[0, 0, 0.9], [0.9, 0.15, 0.7], [-0.85, -0.1, 0.65], [0.3, 0.55, 0.6]].forEach(([x, y, rr]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, 0.12, 32), cm); m.rotation.x = Math.PI / 2; m.position.set(x, y, 0); cl.add(m); });
      cl.position.set(-12 + i * 8 + R() * 3, 11 + R() * 3.5, -11.5); world.add(cl);
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 8, 8), M.dowel); st.position.set(cl.position.x, cl.position.y + 4, -11.6); world.add(st);
    }
    const sun = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.14, 48), new THREE.MeshStandardMaterial({ color: 0xf4c460, roughness: 0.6, emissive: 0xf4a030, emissiveIntensity: 0.35 })); sun.rotation.x = Math.PI / 2; sun.position.set(-6, 14, -11.8); world.add(sun);
    const sst = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 14, 8), M.dowel); sst.position.set(-6, 6.5, -11.9); world.add(sst);
  }

  // ---------- terrain: clay strata blocks under every reach, grassy terraced banks behind ----------
  const strataTex = canvasTex(512, 512, (c, w) => {
    const cols = ["#7a4a2c", "#8d5a36", "#a16a40", "#7f5032", "#94603a"];
    for (let i = 0; i < 10; i++) { c.fillStyle = cols[i % 5]; c.fillRect(0, i * w / 10, w, w / 10 + 1); }
    const R = mulberry(3); for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(40,20,10,${0.15 + R() * 0.2})`; c.beginPath(); c.arc(R() * w, R() * w, 2 + R() * 6, 0, 7); c.fill(); }
  });
  const strataM = new THREE.MeshStandardMaterial({ map: strataTex, roughness: 0.9 });
  const segs = [[-16, XM0, U], [XM1, XQ0, R2], [XQ1, XN0, R3]];
  for (const [x0, x1, L] of segs) {
    rb(world, strataM, x0, x1, BASE, L - D, BW, FRONT, 0.05);
    rb(world, M.grass, x0, x1, BASE, L + 0.45, -6, BW, 0.12);
  }
  // under Madao chamber: two slabs with an open groove for the culvert
  rb(world, strataM, XM0, XM1 + 1.4, BASE, 1.35, BW, FRONT, 0.05);
  rb(world, M.concreteDk, XM0, XM1, 1.95, R2 - D, BW, FRONT - 0.06, 0.04);
  rb(world, M.concreteDk, XM0, XM1 + 1.4, 1.35, 1.95, BW, 0.35, 0.03);
  // under Qishi / Qingnian chambers
  rb(world, strataM, XQ0, XQ1, BASE, R3 - D, BW, FRONT, 0.05);
  rb(world, strataM, XN0, XN1, BASE, SEA - D, BW, FRONT, 0.05);
  // banks behind the small locks
  rb(world, M.grassDk, XQ0, XQ1, BASE, R2 + 0.45, -6, BW, 0.12);
  rb(world, M.grassDk, XN0, XN1, BASE, R3 + 0.45, -6, BW, 0.12);
  // sea floor + beach
  rb(world, M.clay, XN1, 32, BASE, SEA - D, -6, FRONT, 0.05);
  rb(world, toy(0xe8cf98, 0.9), XN1 + 3, 32, BASE, SEA + 0.1, -6, -3.4, 0.2);

  // trees
  {
    const R = mulberry(90);
    const crown = [toy(0x3f8a4a, 0.85), toy(0x5aa257, 0.85), toy(0x2f6f3f, 0.85)];
    const zoneY = (x) => (x < XM0 ? U : x < XQ0 ? R2 : x < XN0 ? R3 : SEA) + 0.45;
    for (let i = 0; i < 46; i++) {
      const x = -15 + R() * 33, z = -5.6 + R() * 3.2;
      if (x > XM0 - 0.4 && x < XM1 + 0.4 && z > -4.8) continue; // keep basin rack clear
      const y = zoneY(x);
      const tg = new THREE.Group(); tg.position.set(x, y, z); world.add(tg);
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.5, 8), M.wood); tr.position.y = 0.25; tg.add(tr);
      const k = 0.4 + R() * 0.35;
      const cr = R() > 0.5 ? new THREE.Mesh(new THREE.SphereGeometry(k, 18, 14), crown[i % 3]) : new THREE.Mesh(new THREE.ConeGeometry(k, k * 2.4, 18), crown[i % 3]);
      cr.position.y = 0.5 + k * 0.9; cr.castShadow = true; tg.add(cr);
    }
  }

  // ---------- water bodies ----------
  const waters = [];
  function waterBox(x0, x1, z0, z1, y0, y1) {
    const g = new THREE.Group(); world.add(g);
    const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), waterM()); g.add(body);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), surfM); top.rotation.x = -Math.PI / 2; g.add(top);
    const o = { g, body, top, x0, x1, z0, z1, y0, set(y) { const h = Math.max(0.02, y - this.y0); body.scale.set(this.x1 - this.x0, h, this.z1 - this.z0); body.position.set((this.x0 + this.x1) / 2, this.y0 + h / 2, (this.z0 + this.z1) / 2); top.scale.set(this.x1 - this.x0, this.z1 - this.z0, 1); top.position.set((this.x0 + this.x1) / 2, this.y0 + h + 0.004, (this.z0 + this.z1) / 2); } };
    o.set(y1); waters.push(o);
    return o;
  }
  waterBox(-16, XM0 + 0.02, -CZ, CZ, U - D, U);
  const wMadao = waterBox(XM0, XM1, -CZ, CZ, R2 - D, U);
  waterBox(XM1 - 0.02, XQ0 + 0.02, -CZ, CZ, R2 - D, R2);
  waterBox(XQ0, XQ1, -CZ, CZ, R3 - D, R2);
  waterBox(XQ1 - 0.02, XN0 + 0.02, -CZ, CZ, R3 - D, R3);
  waterBox(XN0, XN1, -CZ, CZ, SEA - D, R3);
  const sea = waterBox(XN1 - 0.02, 32, -6, FRONT - 0.05, SEA - D, SEA);

  // ---------- lock structures ----------
  // returns gate pair; leaves hinge at the walls and point upstream (-x) when closed (miter V)
  function lockWalls(x0, x1, floorY, topY, glassFront) {
    rb(world, M.concrete, x0 - 0.15, x1 + 0.15, BASE, topY, BW, -CZ, 0.06);
    rb(world, M.coping, x0 - 0.25, x1 + 0.25, topY, topY + 0.14, BW - 0.1, -CZ + 0.05, 0.05);
    // front: corner posts + coping rail (glass between them shows the water column)
    for (const x of [x0 - 0.15, x1 - 0.2]) rb(world, M.concrete, x, x + 0.35, floorY - 0.1, topY, CZ, FRONT, 0.05);
    rb(world, M.coping, x0 - 0.25, x1 + 0.25, topY, topY + 0.14, CZ - 0.05, FRONT + 0.08, 0.05);
    if (glassFront) {
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, topY - floorY), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.04, depthWrite: false }));
      gl.position.set((x0 + x1) / 2, (floorY + topY) / 2, FRONT - 0.04); world.add(gl);
    }
  }
  function gatePair(x, y0, y1, plate) {
    const leaves = [];
    for (const sz of [1, -1]) {
      const hinge = new THREE.Group(); hinge.position.set(x, 0, sz * CZ); world.add(hinge);
      const L = 0.97, h = y1 - y0;
      const leaf = new THREE.Group(); leaf.position.x = L / 2; hinge.add(leaf);
      const m = new THREE.Mesh(rbox(L, h, 0.14, 0.04), M.gate); m.position.y = (y0 + y1) / 2; m.castShadow = true; leaf.add(m);
      const nb = Math.max(2, Math.round(h / 0.45));
      for (let i = 1; i < nb; i++) { const bar = new THREE.Mesh(rbox(L * 0.94, 0.07, 0.2, 0.03), M.gateDk); bar.position.y = y0 + (i * h) / nb; leaf.add(bar); }
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, h + 0.12, 14), M.gateDk); post.position.set(-L / 2, (y0 + y1) / 2, 0); leaf.add(post);
      if (plate && sz === 1) {
        const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.36), new THREE.MeshStandardMaterial({ map: signTex("AUDIRA", null, "#F3EAD8", "#1E5C3A", 120), roughness: 0.6 }));
        pl.position.set(0, y1 - 0.42, 0.08); leaf.add(pl);
        const pl2 = pl.clone(); pl2.position.z = -0.08; pl2.rotation.y = Math.PI; leaf.add(pl2);
      }
      leaves.push({ hinge, sz });
    }
    // closed: direction (-0.36, -/+0.93); open: (-1, 0)
    const closed = Math.atan2(0.93, -0.36), open = Math.PI; // rotation.y for local +x -> direction (dx, dz): ry = atan2(-dz, dx)
    return { leaves, set(k) { for (const l of leaves) { const ry = l.sz > 0 ? lerp(Math.atan2(0.93, -0.36), Math.PI, k) : lerp(Math.atan2(-0.93, -0.36), -Math.PI, k); l.hinge.rotation.y = ry; } } };
  }
  lockWalls(XM0, XM1, R2 - D, U + 0.35, true);
  const gUpM = gatePair(XM0, U - D, U + 0.35, false);
  const gLoM = gatePair(XM1, R2 - D, U + 0.35, true);
  lockWalls(XQ0, XQ1, R3 - D, R2 + 0.35, true);
  gatePair(XQ0, R2 - D, R2 + 0.35, false).set(0);
  gatePair(XQ1, R3 - D, R2 + 0.35, false).set(0);
  lockWalls(XN0, XN1, SEA - D, R3 + 0.35, true);
  gatePair(XN0, R3 - D, R3 + 0.35, false).set(0);
  gatePair(XN1, SEA - D, R3 + 0.35, false).set(0);

  // gauge staff on the back wall inside the Madao chamber
  const gaugeTex = canvasTex(128, 1024, (c, w, h) => {
    c.fillStyle = "#F7F1E2"; c.fillRect(0, 0, w, h);
    for (let i = 0; i <= 30; i++) { const y = h - (i / 30) * h; c.fillStyle = i % 5 ? "#C0392B" : "#1B2433"; c.fillRect(0, y - 3, i % 5 ? 50 : 90, 6); if (i % 10 === 0 && i) { c.font = "700 34px Space Grotesk"; c.fillStyle = "#1B2433"; c.fillText(i + "", 64, y + 12); } }
  });
  const gauge = new THREE.Mesh(new THREE.PlaneGeometry(0.28, U - R2), new THREE.MeshStandardMaterial({ map: gaugeTex, roughness: 0.7 }));
  gauge.position.set(XM0 + 0.55, (U + R2) / 2, -CZ + 0.012); world.add(gauge);

  // culvert in the floor groove + floor ports + outlet riser into reach 2
  const culM = toy(0x8796a6, 0.6, { transparent: true, opacity: 0.55, depthWrite: false });
  const cul = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, XM1 + 1.2 - XM0 + 0.4, 28, 1, true), culM); cul.rotation.z = Math.PI / 2; cul.position.set((XM0 + XM1 + 1.2) / 2, 1.65, 0.62); world.add(cul);
  const culRing = toy(0x56626f, 0.6);
  for (let i = 0; i < 7; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.035, 8, 28), culRing); ring.rotation.y = Math.PI / 2; ring.position.set(XM0 + 0.2 + i * 1.0, 1.65, 0.62); world.add(ring); }
  const riser = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, R2 - D - 1.65 + 0.1, 24, 1, true), culM); riser.position.set(XM1 + 1.2, (1.65 + R2 - D) / 2 + 0.05, 0.62); world.add(riser);
  const ports = [];
  for (let i = 0; i < 6; i++) { const x = XM0 + 0.6 + i * 0.95; const pt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 10), culM); pt.position.set(x, 1.95 + 0.04, 0.62); world.add(pt); const hole = new THREE.Mesh(new THREE.CircleGeometry(0.11, 18), M.dark); hole.rotation.x = -Math.PI / 2; hole.position.set(x, R2 - D + 0.006, 0.45); world.add(hole); ports.push(x); }
  // valve shaft (in front of the lower head) + sliding valve gate + yellow hand wheel on top
  const VX = XM1 + 0.65;
  for (const dx of [-0.32, 0.32]) rb(world, M.steel, VX + dx - 0.05, VX + dx + 0.05, 1.2, U + 0.6, 0.55, 0.69, 0.02);
  const valve = new THREE.Mesh(rbox(0.5, 0.62, 0.12, 0.04), M.yellow); valve.position.set(VX, 1.65, 0.62); valve.castShadow = true; world.add(valve);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 10), M.steel); world.add(stem);
  const wheel = new THREE.Group(); wheel.position.set(VX, U + 0.75, 0.62); world.add(wheel);
  { const rimW = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.04, 10, 32), toy(0xd23b2b, 0.6)); rimW.rotation.x = Math.PI / 2; wheel.add(rimW); for (let k = 0; k < 3; k++) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.52, 8), M.steel); sp.rotation.z = Math.PI / 2; sp.rotation.y = (k * Math.PI) / 3; wheel.add(sp); } }
  rb(world, M.concrete, VX - 0.5, VX + 0.5, U + 0.25, U + 0.5, -0.2, 1.0, 0.05);

  // ---------- water-saving basins: three stepped tanks behind the Madao chamber ----------
  const BAS = [
    { name: "BAWAH", z0: -2.15, z1: -1.45, y0: 3.3, y1: 3.95 },
    { name: "TENGAH", z0: -3.05, z1: -2.35, y0: 3.95, y1: 4.6 },
    { name: "ATAS", z0: -3.95, z1: -3.25, y0: 4.6, y1: 5.25 },
  ];
  const bx0 = XM0 + 0.3, bx1 = XM1 - 0.3;
  rb(world, M.concreteDk, XM0 - 0.15, XM1 + 0.15, BASE, 3.2, -4.15, BW, 0.06);
  BAS.forEach((b, i) => {
    rb(world, M.concrete, XM0 - 0.15, XM1 + 0.15, 3.2, b.y0, b.z0 - 0.1, b.z1 + 0.1, 0.05);
    rb(world, M.concrete, XM0 - 0.15, XM1 + 0.15, b.y0, b.y1 + 0.08, b.z0 - 0.2, b.z0 - 0.08, 0.04);
    for (const x of [XM0 - 0.15, XM1 - 0.15]) rb(world, M.concrete, x, x + 0.3, b.y0, b.y1 + 0.08, b.z0 - 0.08, b.z1 + 0.08, 0.04);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(bx1 - bx0 + 0.6, b.y1 - b.y0), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.05, depthWrite: false }));
    gl.position.set(0, (b.y0 + b.y1) / 2 + 0.04, b.z1 + 0.06); world.add(gl);
    rb(world, M.coping, XM0 - 0.2, XM1 + 0.2, b.y1 + 0.04, b.y1 + 0.12, b.z1 + 0.02, b.z1 + 0.14, 0.03);
    b.w = waterBox(bx0 - 0.3, bx1 + 0.3, b.z0, b.z1, b.y0 + 0.02, b.y0 + 0.05);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.42), new THREE.MeshStandardMaterial({ map: signTex(b.name, null, "#EBD9B4", "#2B2118", 104), roughness: 0.7 }));
    lab.position.set(XM1 - 0.35, b.y1 + 0.38, b.z1 + 0.15); lab.rotation.x = -0.25; world.add(lab); b.lab = lab;
    // pipe from the basin floor to the chamber back wall
    const len = -CZ - b.z1 + 0.15;
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, len, 16), M.pipe); p.rotation.x = Math.PI / 2; p.position.set(-1.6 + i * 1.6, b.y0 + 0.14, (b.z1 + -CZ) / 2); world.add(p);
    b.px = -1.6 + i * 1.6; b.py = b.y0 + 0.14;
  });

  // ---------- signs on dowels ----------
  function sign(txt, sub, x, y, z, w = 1.7, ry = 0) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; world.add(g);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.2, 8), M.dowel); st.position.y = 0.6; g.add(st);
    const bd = new THREE.Mesh(rbox(w, w * 0.47, 0.06, 0.02), toy(0xd9c39a, 0.85)); bd.position.y = 1.2 + w * 0.2; bd.castShadow = true; g.add(bd);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.98, w * 0.46), new THREE.MeshStandardMaterial({ map: signTex(txt, sub), roughness: 0.75 })); face.position.set(0, 1.2 + w * 0.2, 0.035); g.add(face);
    return g;
  }
  const signM = sign("MADAO", "29,6 m", -5.2, U + 0.45, -2.0, 1.8, 0.25);
  const signQ = sign("QISHI", "27 m", 6.4, R2 + 0.45, -2.0, 1.6, 0.15);
  const signN = sign("QINGNIAN", "10,32 m", 13.4, R3 + 0.45, -2.0, 1.7, 0.1);
  const signB = sign("TELUK BEIBU", "LAUT", 21.5, SEA + 0.1, -4.3, 2.0, 0);
  const signA = sign("AUDIRA", "PINTU AIR MADAO", -9.5, U + 0.45, -2.2, 1.8, 0.3);
  // front plate on the Madao coping
  { const pl = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.3), new THREE.MeshStandardMaterial({ map: canvasTex(800, 100, (c, w, h) => { c.fillStyle = "#1E5C3A"; c.fillRect(0, 0, w, h); c.fillStyle = "#F3EAD8"; c.font = "800 62px Space Grotesk"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("PINTU AIR MADAO · AUDIRA", w / 2, h / 2 + 3); }), roughness: 0.6 }));
    pl.position.set(-0.2, U + 0.42, FRONT + 0.09); world.add(pl); }
  // little lighthouse at the sea
  { const lh = new THREE.Group(); lh.position.set(24, SEA + 0.1, -4.6); world.add(lh);
    for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.34 - i * 0.04, 0.38 - i * 0.04, 0.5, 24), i % 2 ? M.white : toy(0xd2483a, 0.7)); m.position.y = 0.25 + i * 0.5; m.castShadow = true; lh.add(m); }
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe0a0).multiplyScalar(1.8), toneMapped: false })); lamp.position.y = 2.25; lh.add(lamp); }

  // ---------- toy cargo ship (generic, no livery) ----------
  const ship = new THREE.Group(); world.add(ship);
  {
    const hs = new THREE.Shape();
    hs.moveTo(-1.5, -0.45); hs.lineTo(1.05, -0.45); hs.quadraticCurveTo(1.6, -0.42, 1.62, 0); hs.quadraticCurveTo(1.6, 0.42, 1.05, 0.45); hs.lineTo(-1.5, 0.45); hs.quadraticCurveTo(-1.58, 0.45, -1.58, 0.35); hs.lineTo(-1.58, -0.35); hs.quadraticCurveTo(-1.58, -0.45, -1.5, -0.45);
    const hullG = (h, bev) => { const g = new THREE.ExtrudeGeometry(hs, { depth: h, bevelEnabled: true, bevelSize: bev, bevelThickness: bev, bevelSegments: 3, curveSegments: 16 }); g.rotateX(-Math.PI / 2); return g; };
    const low = new THREE.Mesh(hullG(0.22, 0.05), M.hullRed); low.position.y = -0.36; low.castShadow = true; ship.add(low);
    const up = new THREE.Mesh(hullG(0.3, 0.05), M.hullNavy); up.position.y = -0.12; up.castShadow = true; ship.add(up);
    const dk = new THREE.Mesh(new THREE.ShapeGeometry(hs, 16), M.deck); dk.rotation.x = -Math.PI / 2; dk.position.y = 0.24; dk.scale.set(0.95, 0.9, 1); ship.add(dk);
    // bridge house at the stern
    const bh = new THREE.Mesh(rbox(0.55, 0.5, 0.78, 0.06), M.white); bh.position.set(-1.15, 0.5, 0); bh.castShadow = true; ship.add(bh);
    const bh2 = new THREE.Mesh(rbox(0.45, 0.28, 0.84, 0.05), M.white); bh2.position.set(-1.12, 0.88, 0); ship.add(bh2);
    for (const z of [0.43, -0.43]) { const wnd = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.1), M.glass); wnd.position.set(-1.1, 0.9, z * 0.99); wnd.rotation.y = z > 0 ? 0 : Math.PI; ship.add(wnd); }
    const wf = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.1), M.glass); wf.position.set(-0.885, 0.9, 0); wf.rotation.y = Math.PI / 2; ship.add(wf);
    const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.34, 16), toy(0xf2b632, 0.7)); funnel.position.set(-1.3, 1.15, 0); ship.add(funnel);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8), M.white); mast.position.set(1.2, 0.55, 0); ship.add(mast);
    // containers 3 bays x 2 rows x 2 tiers
    const R = mulberry(2424);
    for (let b = 0; b < 4; b++) for (let row = 0; row < 2; row++) for (let tier = 0; tier < 2; tier++) {
      if (tier === 1 && b === 3 && row === 1) continue;
      const c = new THREE.Mesh(rbox(0.5, 0.2, 0.34, 0.03), M.cont[Math.floor(R() * 5)]); c.position.set(-0.55 + b * 0.52, 0.36 + tier * 0.21, row ? 0.18 : -0.18); c.castShadow = true; ship.add(c);
    }
    ship.scale.setScalar(1.0);
  }

  // ---------- toy workers (head with face, hard hat, shoulders wider than hips, bent elbows/knees) ----------
  function worker(shirtC, hatC) {
    const g = new THREE.Group();
    const skin = toy(0xd7a07a, 0.7), shirt = toy(shirtC, 0.78), pants = toy(0x2b3a52, 0.8), shoe = toy(0x1b1b1f, 0.6), hat = toy(hatC, 0.55), eye = toy(0x111111, 0.3);
    const V = (x, y, z) => v3(x, y, z);
    const limb = (parent, a, b, rr, m) => { const d = b.clone().sub(a), len = d.length(); const me = new THREE.Mesh(new THREE.CapsuleGeometry(rr, Math.max(0.001, len), 5, 10), m); me.position.copy(a).add(b).multiplyScalar(0.5); me.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); me.castShadow = true; parent.add(me); return me; };
    for (const sd of [-1, 1]) { limb(g, V(0.07 * sd, 0.36, 0), V(0.08 * sd, 0.2, 0.03), 0.042, pants); limb(g, V(0.08 * sd, 0.2, 0.03), V(0.08 * sd, 0.04, 0), 0.038, pants); const sh_ = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), shoe); sh_.scale.set(1, 0.7, 1.5); sh_.position.set(0.08 * sd, 0.03, 0.03); g.add(sh_); }
    const torso = new THREE.Mesh(new THREE.LatheGeometry([[0.001, 0.34], [0.085, 0.35], [0.1, 0.45], [0.13, 0.58], [0.135, 0.62], [0.08, 0.66], [0.001, 0.67]].map((p) => new THREE.Vector2(p[0], p[1])), 24), shirt); torso.scale.z = 0.7; torso.castShadow = true; g.add(torso);
    const vest = new THREE.Mesh(new THREE.CylinderGeometry(0.118, 0.1, 0.05, 24), toy(0xf2c230, 0.6)); vest.position.y = 0.5; vest.scale.z = 0.72; g.add(vest);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 18), skin); head.position.y = 0.77; head.castShadow = true; g.add(head);
    for (const sd of [-1, 1]) { const ey = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), eye); ey.position.set(0.035 * sd, 0.785, 0.092); g.add(ey); const ck = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), toy(0xe88a7a, 0.7)); ck.position.set(0.06 * sd, 0.755, 0.08); g.add(ck); }
    const mo = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 6, 12, Math.PI), eye); mo.rotation.z = Math.PI; mo.position.set(0, 0.745, 0.096); g.add(mo);
    const hh = new THREE.Mesh(new THREE.SphereGeometry(0.112, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), hat); hh.position.y = 0.8; g.add(hh);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.018, 24), hat); brim.position.set(0, 0.805, 0.015); g.add(brim);
    // arms: posable (shoulder fixed, elbow + wrist set per frame)
    const arms = [];
    for (const sd of [-1, 1]) { const ag = new THREE.Group(); g.add(ag); arms.push({ ag, sd }); }
    const armSet = (k, el, wr) => { const a = arms[k]; while (a.ag.children.length) a.ag.remove(a.ag.children[0]); const sh = V(0.14 * a.sd, 0.6, 0); limb(a.ag, sh, el, 0.034, shirt); limb(a.ag, el, wr, 0.03, skin); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), skin); hd.position.copy(wr); a.ag.add(hd); };
    g.userData.pose = (t, mode) => {
      if (mode === "wave") { const w = Math.sin(t * 9) * 0.06; armSet(1, V(0.24, 0.72, 0.02), V(0.26 + w, 0.9, 0.05)); armSet(0, V(-0.17, 0.46, 0.04), V(-0.15, 0.34, 0.1)); }
      else if (mode === "wheel") { const a = t * 2.4; armSet(0, V(-0.16, 0.5, 0.12), V(-0.12 + 0.05 * Math.cos(a), 0.62, 0.26 + 0.05 * Math.sin(a))); armSet(1, V(0.16, 0.5, 0.12), V(0.12 - 0.05 * Math.cos(a), 0.62, 0.26 - 0.05 * Math.sin(a))); }
      else if (mode === "point") { armSet(1, V(0.24, 0.6, 0.1), V(0.36, 0.7, 0.24)); armSet(0, V(-0.17, 0.46, 0.04), V(-0.15, 0.34, 0.1)); }
      else { armSet(0, V(-0.17, 0.46, 0.04), V(-0.15, 0.32, 0.1)); armSet(1, V(0.17, 0.46, 0.04), V(0.15, 0.32, 0.1)); }
    };
    g.scale.setScalar(0.85);
    world.add(g);
    return g;
  }
  const wkValve = worker(0x2f6fb0, 0xf4c430); wkValve.position.set(VX, U + 0.5, 0.15); wkValve.rotation.y = 0;
  const wkGate = worker(0xd2483a, 0xffffff); wkGate.position.set(XM1 + 1.6, U + 0.35, -1.1); wkGate.rotation.y = -0.5;
  const wkUp = worker(0x3aa36b, 0xf4c430); wkUp.position.set(-6.4, U + 0.45, -1.5); wkUp.rotation.y = 0.5;
  const wkGate2 = worker(0xe07a3a, 0xf4c430); wkGate2.position.set(XM0 - 0.3, U + 0.35 + 0.14, -1.05); wkGate2.rotation.y = 0.3;

  // ---------- flow particles (culvert, ports, basin pipes) ----------
  const DOT = dotTex();
  const flowN = 420;
  const flowG = new THREE.BufferGeometry();
  const fP = new Float32Array(flowN * 3), fC = new Float32Array(flowN * 3);
  flowG.setAttribute("position", new THREE.BufferAttribute(fP, 3)); flowG.setAttribute("color", new THREE.BufferAttribute(fC, 3));
  const flow = new THREE.Points(flowG, new THREE.PointsMaterial({ size: 0.16, map: DOT, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  flow.frustumCulled = false; world.add(flow);
  const FR = mulberry(31), FD = Array.from({ length: flowN }, () => ({ u: FR(), sp: 0.5 + FR() * 0.6, j: FR() * 6.28, r: FR() }));
  // arrow chevrons on basin pipes (show direction)
  const chevG = new THREE.ConeGeometry(0.09, 0.2, 12);
  const chevM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x7fd8ff).multiplyScalar(1.5), transparent: true, opacity: 0, toneMapped: false });
  const chevs = BAS.map((b) => { const c = new THREE.Mesh(chevG, chevM); c.position.set(b.px, b.py + 0.22, (b.z1 - CZ) / 2); world.add(c); return c; });


  // ---------- blurred foreground props (own scene, rendered to a half-res target, blurred and laid over the frame) ----------
  const FGS = new THREE.Scene();
  const fgRig = new THREE.Group(); FGS.add(fgRig);
  fgRig.add(new THREE.HemisphereLight(0xffe7c4, 0x2a2230, 0.7));
  { const d = new THREE.DirectionalLight(0xffd0a0, 1.6); d.position.set(-2, 3, 2); fgRig.add(d, d.target); const f = new THREE.PointLight(0xffa860, 3, 8, 1.6); f.position.set(0, -2.5, -2); fgRig.add(f); }
  const fgA = new THREE.Group(), fgB = new THREE.Group(); fgRig.add(fgA, fgB);
  // set A: toy crane (left), rope coil + crate (right)
  {
    const cr = new THREE.Group(); cr.position.set(-0.7, -1.75, -4.4); cr.rotation.y = 2.5; cr.scale.setScalar(0.8); fgA.add(cr);
    const yel = toy(0xf2b632, 0.7), red = toy(0xd2483a, 0.7);
    const base = new THREE.Mesh(rbox(0.7, 0.22, 0.5, 0.06), red); base.position.y = 0.11; cr.add(base);
    const tower = new THREE.Mesh(rbox(0.16, 1.25, 0.16, 0.04), yel); tower.position.y = 0.85; cr.add(tower);
    for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 6), M.dark); b.position.set(0.085, 0.35 + i * 0.2, 0); b.rotation.z = 0.8; cr.add(b); }
    const jib = new THREE.Mesh(rbox(1.2, 0.1, 0.12, 0.03), yel); jib.position.set(0.42, 1.5, 0); cr.add(jib);
    const cab = new THREE.Mesh(rbox(0.24, 0.2, 0.22, 0.05), red); cab.position.set(0.0, 1.38, 0.1); cr.add(cab);
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.6, 6), M.dark); cable.position.set(0.9, 1.2, 0); cr.add(cable);
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.016, 8, 16, Math.PI * 1.4), M.steel); hook.position.set(0.9, 0.88, 0); cr.add(hook);
    const rope = new THREE.Group(); rope.position.set(0.5, -1.22, -3.9); fgA.add(rope);
    const rm = toy(0xc9a26a, 0.9);
    for (let i = 0; i < 4; i++) { const tr = new THREE.Mesh(new THREE.TorusGeometry(0.26 - i * 0.02, 0.05, 10, 32), rm); tr.rotation.x = Math.PI / 2; tr.position.y = i * 0.075; rope.add(tr); }
    const crate = new THREE.Mesh(rbox(0.5, 0.42, 0.42, 0.05), M.wood); crate.position.set(0.82, -1.3, -4.7); crate.rotation.y = -0.4; fgA.add(crate);
  }
  // set B: cardboard tree (left), a big toy worker waving and a rope coil (right)
  {
    const tg = new THREE.Group(); tg.position.set(-0.72, -1.9, -4.3); fgB.add(tg);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), M.dowel); st.position.y = 0.45; tg.add(st);
    const disc = (rr, y, x, c) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, 0.06, 32), toy(c, 0.85)); m.rotation.x = Math.PI / 2; m.position.set(x, y, 0); tg.add(m); };
    disc(0.42, 1.05, 0, 0x4f8a4a); disc(0.32, 1.32, 0.22, 0x5f9a54); disc(0.3, 1.25, -0.25, 0x3f7a45);
    var bigW = worker(0x2f6fb0, 0xf4c430); fgB.add(bigW); bigW.position.set(0.6, -1.78, -4.2); bigW.rotation.y = -0.5; bigW.scale.setScalar(1.25);
    const rope2 = new THREE.Group(); rope2.position.set(0.18, -1.45, -4.2); fgB.add(rope2);
    for (let i = 0; i < 3; i++) { const tr = new THREE.Mesh(new THREE.TorusGeometry(0.22 - i * 0.02, 0.045, 10, 32), toy(0xc9a26a, 0.9)); tr.rotation.x = Math.PI / 2; tr.position.y = i * 0.07; rope2.add(tr); }
  }
  const fgRT = new THREE.WebGLRenderTarget(W / 2, H / 2, { type: THREE.HalfFloatType, samples: 4 });
  // ---------- post: NaN guard -> bloom -> output -> warm grade ----------
  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  const QV = "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}";
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } }, vertexShader: QV,
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);bvec4 n=isnan(c);bvec4 f=isinf(c);if(any(n)||any(f))c=vec4(0.,0.,0.,1.);gl_FragColor=clamp(c,0.,30.);}" })));
  const fgU = { tDiffuse: { value: null }, tFg: { value: fgRT.texture }, uPx: { value: new THREE.Vector2(2 / W, 2 / H) } };
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: fgU, vertexShader: QV,
    fragmentShader: `uniform sampler2D tDiffuse,tFg;uniform vec2 uPx;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);vec4 f=vec4(0.);float w=0.;
      for(int i=-3;i<=3;i++)for(int j=-3;j<=3;j++){float k=exp(-float(i*i+j*j)/7.);f+=texture2D(tFg,vUv+vec2(float(i),float(j))*uPx*1.6)*k;w+=k;}f/=w;
      f=clamp(f,0.,8.);gl_FragColor=vec4(c.rgb*(1.-clamp(f.a,0.,1.))+f.rgb,1.);}` })));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.18, 0.5, 0.97);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } }, vertexShader: QV,
    fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=dot(c,vec3(.2126,.7152,.0722));
      c*=mix(vec3(.94,.97,1.06),vec3(1.06,1.0,.9),smoothstep(.05,.8,l));c=mix(vec3(l),c,1.08);gl_FragColor=vec4(clamp(c,0.,1.),1.);}` })));

  // ---------- story values ----------
  const shipX = (t) => {
    let x = lerp(-8.0, -6.9, ramp(t, 0, s.s4));
    x = lerp(x, 0, ramp(t, E.masuk - 0.2, E.menutup - 0.3));
    x = lerp(x, 6.0, ramp(t, E.terbuka + 0.6, s.s8 - 0.2));
    return x;
  };
  const dropK = (t) => ramp(t, E.katup + 0.3, E.m296 + 0.7);
  const levelM = (t) => lerp(U, R2, dropK(t));

  // ---------- camera ----------
  const MID = (U + R2) / 2;
  const cTrack = track([
    // hook: low 3/4 front of the Madao lock, ship at the brink upstream
    [0, 3.6, 4.4, 10.0, -4.8, 4.5, -0.6, 1.75],
    [E.pompa, 3.0, 4.6, 9.6, -4.5, 4.5, -0.6, 1.75],
    [s.s1e, 6.4, 4.4, 13.6, -2.4, 4.3, -0.8, 1.75],
    // s2: rise into a wide view of the whole staircase (down to the sea)
    [E.terusan, 8.0, 7.5, 18.0, 3.0, 3.0, -1.0, 1.2],
    [E.enam, 14.0, 6.5, 17.0, 7.0, 2.2, -1.0, 1.2],
    [s.s2e, 16.0, 6.5, 16.0, 8.0, 2.2, -1.2, 1.2],
    // s3: glide along the steps as each hub sign is named
    [E.tangga, 12.0, 6.5, 15.0, 5.0, 2.6, -1.0, 1.2],
    [E.madao, 2.0, 7.0, 12.5, -2.5, 4.3, -1.2, 1.2],
    [E.qishi, 8.5, 5.8, 12.0, 9.5, 2.6, -1.2, 1.2],
    [E.qingnian, 15.5, 4.6, 11.0, 15.8, 1.2, -1.2, 1.2],
    [E.pintu3, 6.0, 6.5, 14.0, 2.0, 3.4, -0.8, 1.4],
    // s4: ship enters, upper gate closes, V close-up from above the upper head
    [E.masuk + 0.4, -1.0, 6.4, 13.6, -3.0, 4.6, -0.4, 1.75],
    [E.menutup + 0.4, -4.6, 8.4, 8.2, -3.4, 4.6, -0.4, 1.75],
    [E.V, -4.4, 11.5, 1.6, -3.4, 4.6, 0.0, 1.75],
    [E.rapat, -3.6, 10.0, 4.4, -2.8, 4.4, -0.2, 1.75],
    // s5: front cutaway: valve, culvert, level falling with the ship
    [E.katup, 3.2, 4.0, 10.6, 2.4, 2.6, 0.2, 1.75],
    [E.mengalir, 1.6, 3.5, 10.6, 0.6, 2.6, 0.2, 1.75],
    [E.turun, 0.0, 4.4, 12.8, -0.2, 3.4, 0.0, 1.75],
    [E.m296, -1.0, 4.8, 13.6, -0.6, 3.7, -0.2, 1.75],
    [s.s5e, -0.6, 6.0, 13.6, -0.3, 3.8, -0.6, 1.75],
    // s6: up and over to look down on the stepped basins behind the chamber
    [E.dibuang, 1.4, 13.0, 4.0, 0.0, 4.2, -2.2, 1.75],
    [E.kolam, 0.8, 14.5, 2.0, 0.0, 4.2, -2.6, 1.75],
    [E.menabung, 1.8, 15.0, 1.2, 0.0, 4.2, -2.8, 1.75],
    [E.kembali, -1.6, 15.0, 1.2, 0.0, 4.2, -2.8, 1.75],
    [E.ulang, -1.0, 13.5, 3.4, 0.0, 4.0, -2.4, 1.75],
    // s7: lower gate opens, ship sails out, pull back to the staircase and the sea
    [E.kamar7, 1.0, 7.2, 14.0, 0.0, 3.6, -0.6, 1.75],
    [E.menit, 5.0, 6.6, 12.4, 2.4, 3.2, -0.4, 1.75],
    [E.terbuka, 8.4, 5.6, 9.6, 3.0, 3.6, -0.4, 1.75],
    [E.rekor, 13.0, 6.5, 16.0, 6.0, 2.8, -1.0, 1.25],
    [s.s7e, 14.0, 6.8, 17.0, 6.5, 2.6, -1.2, 1.25],
    // s8: theatre wide with the footlights
    [E.gravitasi, 11.0, 6.5, 18.0, 4.5, 2.8, -1.2, 1.25],
    [s.dur, 9.0, 6.2, 19.0, 3.5, 2.8, -1.2, 1.25],
  ]);
  const tgt = v3(0, 0, 0);
  const ZOOM = 1.75;

  // ================================================================ draw
  return function draw(t) {
    if (!(t >= 0)) t = 0;
    const c = cTrack(t);
    tgt.set(c[3], c[4], c[5]);
    const Z = c[6];
    cam.position.set(c[3] + (c[0] - c[3]) * Z + 0.05 * Math.sin(t * 0.5), c[4] + (c[1] - c[4]) * Z + 0.04 * Math.sin(t * 0.37 + 1), c[5] + (c[2] - c[5]) * Z);
    tgt.y += 2.2 * (1 - win(t, E.dibuang - 0.6, E.ulang + 0.6, 0.8, 0.8)); cam.lookAt(tgt);
    cam.updateProjectionMatrix();
    // key light shadow box follows the look target
    key.position.set(tgt.x - 6, tgt.y + 14, tgt.z + 10); key.target.position.copy(tgt); key.target.updateMatrixWorld();

    // ship
    const lv = levelM(t);
    const sx = shipX(t);
    const sy = sx < XM0 + 1.6 ? U : sx > XM1 + 1.5 ? R2 : lv;
    ship.position.set(sx, sy - 0.02 + 0.015 * Math.sin(t * 1.3), 0);
    ship.rotation.x = 0.012 * Math.sin(t * 0.9); ship.rotation.z = 0.01 * Math.sin(t * 0.7);

    // gates: upper Madao gate open until the ship is in, closes on "menutup"; lower opens on "terbuka"
    gUpM.set(1 - ramp(t, E.menutup - 0.1, E.menutup + 1.4));
    gLoM.set(ramp(t, E.terbuka - 0.2, E.terbuka + 1.6));

    // chamber level; basins fill in order (high, mid, low) while the chamber drains, then the rest leaves via the culvert
    wMadao.set(lv);
    const dk = dropK(t);
    BAS.forEach((b, i) => { const order = 2 - i; const f = ramp(dk, order * 0.24, order * 0.24 + 0.24); b.w.set(lerp(b.y0 + 0.05, b.y1 - 0.06, f)); });
    for (const w of waters) { w.top.material.map.offset.set((t * 0.03) % 1, (t * 0.017) % 1); }

    // valve: rises on "katup"
    const vo = ramp(t, E.katup - 0.2, E.katup + 0.9) * (1 - ramp(t, E.m296 + 1.2, E.m296 + 2.2));
    valve.position.y = 1.65 + 0.62 * vo;
    stem.position.set(VX, (valve.position.y + U + 0.75) / 2, 0.62); stem.scale.y = U + 0.75 - valve.position.y;
    wheel.rotation.y = 6 * vo;

    // workers
    wkValve.userData.pose(t, t > E.katup - 1.2 && t < E.m296 ? "wheel" : "idle");
    wkGate.userData.pose(t, t > E.terbuka - 0.4 && t < E.rekor + 1 ? "wave" : t > E.sama - 0.5 ? "point" : "idle");
    wkUp.userData.pose(t, t < s.s2 ? "wave" : "idle");
    wkGate2.userData.pose(t, t > E.menutup - 0.6 && t < E.rapat ? "point" : "idle");

    // flow particles
    const flowOn = vo * (1 - dk * 0.6);
    const toBasin = win(t, E.katup, E.m296 + 0.4, 0.4, 0.4) * 0 + win(t, E.menabung - 0.6, E.kembali - 0.3, 0.4, 0.3);
    const fromBasin = win(t, E.kembali - 0.2, E.ulang + 1.0, 0.3, 0.5);
    const basinFlow = Math.max(toBasin, fromBasin);
    for (let i = 0; i < flowN; i++) {
      const d = FD[i]; let x = 0, y = -50, z = 0, a = 0;
      if (i < 260) {
        // culvert: down through floor ports, along the culvert, up the riser into reach 2
        const u = (d.u + t * 0.22 * d.sp) % 1;
        if (u < 0.25) { const px = ports[Math.floor(d.r * 6)]; const k = u / 0.25; x = px; y = lerp(R2 - D + 0.05, 1.7, k); z = lerp(0.45, 0.62, k); }
        else if (u < 0.85) { const k = (u - 0.25) / 0.6; x = lerp(ports[Math.floor(d.r * 6)], XM1 + 1.2, k); y = 1.65 + 0.15 * Math.sin(d.j + u * 30); z = 0.62 + 0.15 * Math.cos(d.j + u * 20); }
        else { const k = (u - 0.85) / 0.15; x = XM1 + 1.2 + 0.08 * Math.sin(d.j); y = lerp(1.7, R2 - D + 0.3, k); z = 0.62; }
        a = flowOn * (0.6 + 0.4 * d.r);
      } else {
        // basin pipes
        const bi = i % 3, b = BAS[bi];
        let u = (d.u + t * 0.35 * d.sp) % 1; if (fromBasin > toBasin) u = 1 - u;
        x = b.px + 0.06 * Math.sin(d.j); y = b.py + 0.05 * Math.cos(d.j + t); z = lerp(-CZ + 0.1, b.z1 - 0.05, u);
        a = basinFlow * 0.9;
      }
      fP[i * 3] = x; fP[i * 3 + 1] = y; fP[i * 3 + 2] = z;
      fC[i * 3] = 0.35 * a; fC[i * 3 + 1] = 0.8 * a; fC[i * 3 + 2] = 1.3 * a;
    }
    flowG.attributes.position.needsUpdate = flowG.attributes.color.needsUpdate = true;
    chevM.opacity = basinFlow;
    chevs.forEach((cv) => { cv.rotation.x = fromBasin > toBasin ? -Math.PI / 2 : Math.PI / 2; });

    // sign pops in s3 (hub names) and the basin labels in s6
    const pop = (g, a) => { const k = a === null ? 1 : back(ramp(t, a - 0.25, a + 0.25)); g.scale.setScalar(0.001 + 0.999 * k); };
    pop(signM, t < s.s3 ? null : E.madao); pop(signQ, t < s.s3 ? null : E.qishi); pop(signN, t < s.s3 ? null : E.qingnian);
    if (t < s.s3) { signM.scale.setScalar(1); signQ.scale.setScalar(1); signN.scale.setScalar(1); }
    BAS.forEach((b, i) => { const k = t < s.s6 ? 1 : back(ramp(t, E.kolam - 0.2 + i * 0.15, E.kolam + 0.3 + i * 0.15)); b.lab.scale.setScalar(0.001 + 0.999 * k); });

    // footlights flicker gently
    const fl = 1 + 0.04 * Math.sin(t * 7.3) + 0.03 * Math.sin(t * 13.1);
    footL.forEach((p, i) => (p.intensity = 4 * fl * (1 + 0.03 * Math.sin(t * 3 + i))));
    bloom.strength = 0.18;
    // foreground props: only in the wide shots; they ride with the camera and slide up from below
    const onA = win(t, s.s2 + 0.2, E.pintu3 - 0.2, 0.6, 0.6), onB = win(t, E.rekor - 1.4, s.dur + 5, 0.6, 0.6);
    fgRig.position.copy(cam.position); fgRig.quaternion.copy(cam.quaternion);
    fgA.visible = onA > 0.01; fgB.visible = onB > 0.01;
    fgA.position.set(0.06 * Math.sin(t * 0.21), -1.6 * (1 - eout(onA)), 0);
    fgB.position.set(0.06 * Math.sin(t * 0.19 + 1), -1.6 * (1 - eout(onB)), 0);
    bigW.userData.pose(t, "wave");
    r.setRenderTarget(fgRT); r.setClearColor(0x000000, 0); r.clear();
    r.render(FGS, cam);
    r.setRenderTarget(null);
    comp.render();
  };
}
