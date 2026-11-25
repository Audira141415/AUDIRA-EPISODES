// EP02 GREYBOX / URBANFORGE. A laser-tag map maquette on an obsidian plinth in a dark gallery, at real stud scale (1 unit = 1 stud:
// avatar 5 tall, walls 10 tall, lanes 10 wide). The greybox is matte grey plaster under a moving sun; data (lanes, spawns, pockets,
// tape measures) is projected light. Polished pieces rise over the plaster in waves. Illustration only. Every value is a function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, std, box, cyl, stage, avatar, runPose, restPose } from "./lib3d.js";

const C = { grey: 0x9ea3ab, base: 0xcfcdc6, cream: 0xead6b2, terra: 0xd47b58, moss: 0x78a768, trim: 0x17a99f, red: 0xd9434a, blue: 0x2f74d6, crate: 0xe39a35, slate: 0x3a414d, glass: 0x14222e, ink: 0x23272f };
const PJ = { cyan: 0x00e6ff, amber: 0xffb703, emer: 0x00f59b, vio: 0xa98bff, red: 0xff3b4e, blue: 0x2f8bff };
const HEX = (c) => "#" + c.toString(16).padStart(6, "0");

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0x0a0a0c, exp: 1.0, bloom: [0.32, 0.5, 0.93] });
  scene.fog = new THREE.Fog(0x0a0a0c, 260, 520);
  scene.add(new THREE.HemisphereLight(0xe5e7eb, 0x17191e, 0.85));
  const sun = new THREE.DirectionalLight(0xfffbf2, 2.3); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -88, right: 88, top: 88, bottom: -88, near: 1, far: 320 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  const rnd = mulberry(2202);

  // gallery, plinth, baseplate
  const gal = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), std(0x0c0d10, 0.95)); gal.rotation.x = -Math.PI / 2; gal.position.y = -7; gal.receiveShadow = true; scene.add(gal);
  box(98, 6.9, 148, std(0x141519, 0.45, 0.2), -1.5, -3.5, 0, scene);
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(46, 2.9), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, map: canvasTex(1600, 100, (g, w, h) => { g.fillStyle = "#c9a45c"; g.font = "700 64px 'Space Grotesk', Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA  ·  MAQUETTE LASER TAG  ·  GREYBOX", w / 2, h / 2 + 3); }) }));
  plaque.position.set(-1.5, -3.4, 74.06); scene.add(plaque);
  const gridT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = HEX(C.base); g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(110,110,104,.30)"; g.lineWidth = 3; g.strokeRect(0, 0, w, h); g.strokeStyle = "rgba(110,110,104,.13)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke(); }, [88 / 10, 138 / 10]);
  box(88, 0.4, 138, std(0xbab8b1, 0.9), -1.5, -0.21, 0, scene);
  const bpl = new THREE.Mesh(new THREE.PlaneGeometry(88, 138), new THREE.MeshStandardMaterial({ map: gridT, roughness: 0.92 })); bpl.rotation.x = -Math.PI / 2; bpl.position.set(-1.5, 0, 0); bpl.receiveShadow = true; scene.add(bpl);

  // ---- layout (stud units). Lanes along z: INTERIOR x[-27,-17], TENGAH x[-5,5], EKSTERIOR x[17,27]. Cross lanes at z=+-20. Spawns z beyond +-45.
  const plaster = std(C.grey, 0.88), mats = {};
  const pm = (c) => mats[c] || (mats[c] = std(c, 0.6));
  const trimM = std(C.trim, 0.4), glassM = std(C.glass, 0.2, 0.1, { emissive: new THREE.Color(0x00b8ee), emissiveIntensity: 0.65 });
  const lampM = std(0xffe2a0, 0.3, 0, { emissive: new THREE.Color(PJ.amber), emissiveIntensity: 2.4 });
  const pieces = [];
  const P = (x0, x1, z0, z1, h, col, o = {}) => pieces.push({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0, h, col, ...o });
  const segs = [[-45, -27], [-13, 13], [27, 45]];
  for (const [z0, z1] of segs) {
    P(-17, -5, z0, z1, 10, C.cream, { wins: [-1, 1], lamp: 1 });
    P(5, 17, z0, z1, 10, C.terra, { wins: [-1, 1], lamp: 1 });
    P(-32, -27, z0, z1, 12, C.cream, { wins: [1] });
  }
  for (const [z0, z1] of [[-45, -37], [-35, -27], [-13, -4], [4, 13], [27, 35], [37, 45]]) P(27, 29, z0, z1, 3, C.moss);
  P(-32, 29, -61, -59, 6, C.red); P(-32, 29, 59, 61, 6, C.blue);
  for (const s of [-1, 1]) { P(-34, -32, s < 0 ? -61 : 45, s < 0 ? -45 : 61, 6, s < 0 ? C.red : C.blue); P(29, 31, s < 0 ? -61 : 45, s < 0 ? -45 : 61, 6, s < 0 ? C.red : C.blue); }
  for (const s of [-1, 1]) { P(-14, -10, s * 53 - 1.5, s * 53 + 1.5, 4, C.slate); P(8, 12, s * 53 - 1.5, s * 53 + 1.5, 4, C.slate); }
  P(-8, -6, 43, 45, 12, C.slate); P(6, 8, 43, 45, 12, C.slate); // sign arch pillars
  // cover blocks the avatar places in s2 (exterior lane, blue half)
  const placeT = [0, 1, 2, 3, 4, 5].map((i) => AT["s2:Developer"] + i * 0.55);
  [[25.2, 41], [18.8, 37], [25.2, 33], [18.8, 29], [25.2, 25], [18.8, 44]].forEach(([x, z], i) => P(x - 1.25, x + 1.25, z - 1.25, z + 1.25, 2.5, C.crate, { tp: placeT[i] }));

  const tC = AT["s1:cantik"];
  const hookAt = (z) => tC + 0.1 + ((z + 62) / 124) * 2.1;
  const wave = (t0, span) => (z) => t0 + ((62 - z) / 124) * span;
  const wFloor = wave(AT["s7:diganti"], 1.7), wWall = wave(AT["s7:tembok"] - 0.15, 0.6), wWin = wave(AT["s7:jendela"] - 0.1, 0.5), wLamp = wave(AT["s7:lampu"] - 0.1, 0.5), wDeco = wave(AT["s7:dekorasi"] - 0.1, 0.5);
  const pol = (t, z, w) => (t < K.s7 ? 1 - ramp(t, hookAt(z), hookAt(z) + 0.4) : ramp(t, w(z), w(z) + 0.45));

  for (const p of pieces) {
    p.g = box(p.w, p.h, p.d, plaster, p.x, p.h / 2, p.z, scene);
    const geo = new THREE.BoxGeometry(p.w + 0.3, p.h + 0.12, p.d + 0.3); geo.translate(0, (p.h + 0.12) / 2, 0);
    const G = new THREE.Group(); G.position.set(p.x, 0, p.z); scene.add(G);
    const m = new THREE.Mesh(geo, pm(p.col)); m.castShadow = m.receiveShadow = true; G.add(m);
    if (p.h >= 8) { const tr = new THREE.Mesh(new THREE.BoxGeometry(p.w + 0.6, 0.7, p.d + 0.6), trimM); tr.position.y = p.h - 0.25; tr.castShadow = true; G.add(tr); }
    if (p.tp) for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(p.w + 0.36, 0.3, 0.3), std(0x8a5520, 0.6)); st.position.set(0, p.h * (0.5 + s * 0.3), p.d / 2 + 0.18); G.add(st); }
    p.P = G;
    p.win = [];
    if (p.wins) { const n = Math.max(1, Math.floor(p.d / 6)); for (const s of p.wins) for (let i = 0; i < n; i++) { const wm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3, 3.4), glassM); wm.position.set(p.x + s * (p.w / 2 + 0.24), 5.6, p.z - p.d / 2 + ((i + 0.5) * p.d) / n); scene.add(wm); p.win.push(wm); } }
    p.lamps = [];
    if (p.lamp) for (const zz of [p.z - p.d / 2 + 1.6, p.z + p.d / 2 - 1.6]) { const L = new THREE.Group(); L.position.set(p.x, p.h, zz); cyl(0.22, 0.22, 1.6, 8, std(0x2a2d36, 0.5), 0, 0.8, 0, L); const b = new THREE.Mesh(new THREE.SphereGeometry(0.6, 14, 10), lampM); b.position.y = 1.9; L.add(b); scene.add(L); p.lamps.push(L); }
  }

  // polished floors (slate lanes + team-tinted spawns)
  const floors = [];
  const F = (x0, x1, z0, z1, col) => { const m = box(x1 - x0, 0.12, z1 - z0, pm(col), (x0 + x1) / 2, 0.06, (z0 + z1) / 2, scene); m.castShadow = false; floors.push(m); };
  F(-27, -17, -45, 45, C.slate); F(-5, 5, -45, 45, C.slate); F(17, 27, -45, 45, C.slate); F(-32, 29, -25, -15, C.slate); F(-32, 29, 15, 25, C.slate);
  F(-32, 29, -59, -45, 0x5a2a30); F(-32, 29, 45, 59, 0x22385e);

  // decorations: plants, banners, crates
  const deco = [];
  const plant = (x, z) => { const G = new THREE.Group(); G.position.set(x, 0, z); cyl(0.9, 0.7, 1.4, 14, std(0xe8e2d4, 0.5), 0, 0.7, 0, G); const b = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), std(0x3f9a4f, 0.7)); b.position.y = 2.5; b.castShadow = true; G.add(b); scene.add(G); deco.push(G); };
  const flag = (x, z, col) => { const G = new THREE.Group(); G.position.set(x, 0, z); cyl(0.15, 0.15, 9, 8, std(0xdedede, 0.4, 0.6), 0, 4.5, 0, G); const f = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.6, 4), std(col, 0.6)); f.position.set(0, 7.4, 2.1); f.castShadow = true; G.add(f); scene.add(G); deco.push(G); };
  const crate = (x, z, s = 2) => { const G = new THREE.Group(); G.position.set(x, 0, z); box(s, s, s, std(C.crate, 0.6), 0, s / 2, 0, G); scene.add(G); deco.push(G); };
  for (const z of [-38, -6, 6, 38]) { plant(-3.6, z); plant(3.6, z + 2); }
  for (const s of [-1, 1]) { flag(-22, s * 47, s < 0 ? C.red : C.blue); flag(22, s * 47, s < 0 ? C.red : C.blue); }
  crate(-24.5, -35); crate(-19.5, 34); crate(-24, 8, 2.4); crate(-19.5, -8); crate(2.5, -50); crate(-2.5, 50);

  // sign arch board "AUDIRA LASER TAG"
  box(18, 4.4, 0.8, plaster, 0, 11.6, 44, scene);
  const boardP = new THREE.Group(); boardP.position.set(0, 9.4, 44); scene.add(boardP);
  const bg = new THREE.BoxGeometry(18.4, 4.8, 1); bg.translate(0, 2.4, 0); const bm = new THREE.Mesh(bg, std(0x16181d, 0.4)); bm.castShadow = true; boardP.add(bm);
  const signT = canvasTex(1024, 256, (g, w, h) => { g.fillStyle = "#16181d"; g.fillRect(0, 0, w, h); g.strokeStyle = "#ffb703"; g.lineWidth = 8; g.strokeRect(14, 14, w - 28, h - 28); g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#ffb703"; g.font = "800 132px 'Space Grotesk', Arial, sans-serif"; g.fillText("AUDIRA", w / 2, 102); g.fillStyle = "#00e6ff"; g.font = "700 62px 'Space Grotesk', Arial, sans-serif"; g.fillText("L A S E R   T A G", w / 2, 196); });
  const signM = new THREE.MeshBasicMaterial({ map: signT, transparent: true, toneMapped: false });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(17.6, 4.4), signM); sign.position.set(0, 11.6, 44.56); scene.add(sign);

  // door slab in the west cross lane (x -12..-10, z 13..27, 12 tall)
  const doorM = std(C.grey, 0.85);
  const dL = box(1, 1, 1, doorM, 0, 0, 0, scene), dR = box(1, 1, 1, doorM, 0, 0, 0, scene), dT = box(1, 1, 1, doorM, 0, 0, 0, scene);
  const frM = new THREE.MeshBasicMaterial({ color: PJ.red, toneMapped: false, transparent: true, opacity: 0 });
  const fr = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), frM); m.renderOrder = 5; scene.add(m); return m; });
  const setDoor = (wo, ho) => { fr[0].scale.set(0.3, ho, 0.3); fr[0].position.set(-9.85, ho / 2, 20 - wo / 2); fr[1].scale.set(0.3, ho, 0.3); fr[1].position.set(-9.85, ho / 2, 20 + wo / 2); fr[2].scale.set(0.3, 0.3, wo + 0.3); fr[2].position.set(-9.85, ho, 20); const pw = (14 - wo) / 2; dL.scale.set(2, 12, pw); dL.position.set(-11, 6, 13 + pw / 2); dR.scale.set(2, 12, pw); dR.position.set(-11, 6, 27 - pw / 2); dT.scale.set(2, 12 - ho, wo); dT.position.set(-11, ho + (12 - ho) / 2, 20); };
  const cGrey = new THREE.Color(C.grey), cCream = new THREE.Color(C.cream);

  // s3 problems: water gap, tall tower with a sight cone, a door too small
  const water = box(10, 0.24, 12, std(0x1a1d24, 0.12, 0.35), 22, 0.02, 0, scene); water.receiveShadow = true; water.castShadow = false;
  const bridge = box(10, 0.4, 12, std(C.base, 0.9), 22, 0.2, 0, scene);
  const tgeo = new THREE.BoxGeometry(6, 1, 6); tgeo.translate(0, 0.5, 0);
  const tower = new THREE.Mesh(tgeo, plaster); tower.castShadow = tower.receiveShadow = true; tower.position.set(11, 10, -3); scene.add(tower);
  const cg = new THREE.ConeGeometry(0.5, 1, 40, 1, true); cg.translate(0, -0.5, 0); cg.rotateX(-Math.PI / 2);
  const coneM = new THREE.MeshBasicMaterial({ color: PJ.red, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const cone = new THREE.Mesh(cg, coneM); scene.add(cone);

  // projected light layers
  const proj = (w, d, col, x, z, ox = 0, oz = 0) => { const g = new THREE.PlaneGeometry(w, d); g.rotateX(-Math.PI / 2); g.translate(ox, 0, oz); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2 })); m.position.set(x, 0.09, z); m.renderOrder = 2; scene.add(m); return m; };
  const lanes = [[-22, PJ.cyan, "s4:interior"], [0, PJ.emer, "s4:tengah"], [22, PJ.vio, "s4:eksterior"]].map(([x, c, k]) => ({ m: proj(10, 90, c, x, 45, 0, -45), t: AT[k] }));
  const spR = proj(61, 14, PJ.red, -1.5, -52), spB = proj(61, 14, PJ.blue, -1.5, 52);
  const cross = [-20, 20].map((z, i) => ({ m: proj(61, 10, PJ.amber, -32, z, 30.5, 0), t: AT["s5:silang"] - 0.35 + i * 0.4 }));
  const pocket = [-20, 20].map((z) => { const g = new THREE.CircleGeometry(6.5, 48); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: PJ.red, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); m.position.set(0, 0.14, z); m.renderOrder = 3; scene.add(m);
    const rg = new THREE.RingGeometry(0.92, 1, 64); rg.rotateX(-Math.PI / 2); const ring = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ color: 0xff6a6a, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending })); ring.position.set(0, 0.18, z); ring.renderOrder = 4; scene.add(ring); return { m, ring }; });

  // scan wave plane (projector sweep)
  const scanT = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(0,230,255,0)"); gr.addColorStop(0.75, "rgba(0,230,255,.35)"); gr.addColorStop(1, "rgba(180,250,255,1)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(66, 16), new THREE.MeshBasicMaterial({ map: scanT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  scan.position.set(-1.5, 8, 0); scene.add(scan);

  // tape measures (s6)
  const tapeTex = (vert) => canvasTex(vert ? 64 : 1024, vert ? 1024 : 64, (g, w, h) => { g.fillStyle = "#ffc21a"; g.fillRect(0, 0, w, h); g.fillStyle = "#1b1b1b"; for (let i = 0; i <= 40; i++) { const L = i % 20 === 0 ? 0.9 : i % 4 === 0 ? 0.6 : 0.32; const p = (i / 40) * (vert ? h : w); if (vert) g.fillRect(0, Math.min(h - 4, Math.max(0, h - p - 2)), w * L, 4); else g.fillRect(Math.min(w - 4, Math.max(0, p - 2)), 0, 4, h * L); } });
  const tg1 = new THREE.PlaneGeometry(10, 0.9); tg1.translate(-5, 0, 0); tg1.rotateY(Math.PI / 2);
  const tapeD = new THREE.Mesh(tg1, new THREE.MeshBasicMaterial({ map: tapeTex(false), side: THREE.DoubleSide, toneMapped: false })); tapeD.position.set(-9.4, 1.2, 15); scene.add(tapeD);
  const caseD = box(0.9, 1.4, 1.4, std(0x1d1f24, 0.4), -9.4, 1.2, 15, scene); const caseD2 = box(0.92, 0.5, 1.42, std(PJ.amber, 0.4), -9.4, 1.2, 15, scene);
  const tg2 = new THREE.PlaneGeometry(0.9, 10); tg2.translate(0, 5, 0); tg2.rotateY(Math.PI / 2);
  const tapeW = new THREE.Mesh(tg2, new THREE.MeshBasicMaterial({ map: tapeTex(true), side: THREE.DoubleSide, toneMapped: false })); tapeW.position.set(-4.82, 0, 11.2); scene.add(tapeW);
  const caseW = box(0.9, 1.4, 1.4, std(0x1d1f24, 0.4), -4.4, 0, 11.2, scene);

  // camera icon (s6): the player camera glides behind the avatar, clear of the wall top
  const camIco = new THREE.Group(); scene.add(camIco);
  box(1.8, 1.2, 1.1, std(0x1d1f24, 0.35, 0.3), 0, 0, 0, camIco); const lens = cyl(0.42, 0.5, 0.7, 20, std(0x0e0f12, 0.2, 0.6), 0, 0, 0.85, camIco); lens.rotation.x = Math.PI / 2;
  const rec = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: PJ.emer, toneMapped: false })); rec.position.set(0.6, 0.42, 0.56); camIco.add(rec);
  const viewLine = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 6), new THREE.MeshBasicMaterial({ color: PJ.emer, transparent: true, opacity: 0.8, toneMapped: false })); scene.add(viewLine);

  // laser beams (s5)
  const beamM = new THREE.MeshBasicMaterial({ color: PJ.red, toneMapped: false, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
  const beamB = beamM.clone(); beamB.color = new THREE.Color(PJ.cyan);
  const beam1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1, 8), beamM), beam2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1, 8), beamB); scene.add(beam1, beam2);

  // billboard tags
  const tags = [];
  const tag = (text, col, w, pos, tin, tout) => {
    const W = 1024, H = 200;
    const tx = canvasTex(W, H, (g) => { g.clearRect(0, 0, W, H); g.fillStyle = "rgba(10,10,12,.88)"; g.beginPath(); g.roundRect(6, 6, W - 12, H - 12, 30); g.fill(); g.strokeStyle = col; g.lineWidth = 9; g.stroke(); g.fillStyle = col; g.font = "700 96px 'Space Grotesk', Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, W / 2, H / 2 + 5, W - 90); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, (w * H) / W), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, depthTest: false, toneMapped: false }));
    m.renderOrder = 20; scene.add(m); const o = { m, pos, tin, tout }; tags.push(o); return o;
  };
  const RED = "#ff5a66", GRN = "#00f59b", AMB = "#ffb703";
  const tF1 = AT["s3:Memperbaikinya"], tF2 = tF1 + 0.8, tF3 = tF1 + 1.6;
  let hT = 0;
  tag("SUSAH DILEWATI", RED, 9, () => [22, 8.5, 0], AT["s3:susah"] - 0.15, tF1 + 0.35);
  tag("DIPERBAIKI", GRN, 13, () => [22, 8.5, 0], tF1 + 0.45, K.s4 - 0.1);
  tag("KEUNTUNGAN TIDAK ADIL", RED, 12, () => [19, 10 + hT * 0.55, -1], AT["s3:keuntungan"] - 0.15, tF2 + 0.35);
  tag("DIPERBAIKI", GRN, 13, () => [11, 19, -3], tF2 + 0.6, K.s4 - 0.1);
  tag("TIDAK SEBANDING", RED, 8, () => [-10, 7.2, 20], AT["s3:sebanding"] - 0.25, tF3 + 0.35);
  tag("DIPERBAIKI", GRN, 13, () => [-11, 15.5, 20], tF3 + 0.9, K.s4 - 0.1);
  tag("ZONA SPAWN", "#ff6b78", 24, () => [-1.5, 12, -52], AT["s4:Zona"], AT["s5:Persimpangan"]);
  tag("ZONA SPAWN", "#5aa8ff", 24, () => [-1.5, 12, 52], AT["s4:berlawanan"], AT["s5:Persimpangan"]);
  tag("INTERIOR", HEX(PJ.cyan), 20, () => [-22, 14, 0], AT["s4:interior"], AT["s5:combat"] - 0.6);
  tag("TENGAH", HEX(PJ.emer), 17, () => [0, 14, 0], AT["s4:tengah"], AT["s5:combat"] - 0.6);
  tag("EKSTERIOR", HEX(PJ.vio), 20, () => [22, 14, 0], AT["s4:eksterior"], AT["s5:combat"] - 0.6);
  tag("JALUR SILANG", AMB, 18, () => [-18, 12, 20], AT["s5:silang"] + 0.1, AT["s5:combat"] - 0.6);
  tag("JALUR SILANG", AMB, 18, () => [-18, 12, -20], AT["s5:silang"] + 0.4, AT["s5:combat"] - 0.6);
  tag("COMBAT POCKET", "#ff4d5e", 15, () => [0, 13, 20], AT["s5:combat"], K.s5e + 0.2);
  tag("COMBAT POCKET", "#ff4d5e", 15, () => [0, 13, -20], AT["s5:combat"] + 0.15, K.s5e + 0.2);
  tag("LORONG ≥ 10 STUD", AMB, 8, () => [-10.4, 9.6, 20], AT["s6:lebarnya"], AT["s6:Setiap"] - 0.1);
  tag("DINDING ≥ 10 STUD", AMB, 8, () => [-3.5, 11.5, 13], AT["s6:tingginya"], K.s6e + 0.3);
  const camT = { p: [0, 0, 0] };
  tag("KAMERA TAK TERSANGKUT", GRN, 7, () => [camT.p[0] + 0.5, camT.p[1] + 2.4, camT.p[2]], AT["s6:kamera"], K.s7 + 0.6);

  // avatars (classic blocky proportions, ~5 studs tall)
  const mk = (shirt, pants, skin = 0xf5cd30) => { const a = avatar({ skin, shirt, pants, make: (c) => std(c, 0.5) }); a.G.rotation.order = "YXZ"; scene.add(a.G); return a; };
  const H = mk(0x1f6fd1, 0x2a3550), R = mk(0xd9434a, 0x3b2a2e), E1 = mk(0xd9434a, 0x3b2a2e, 0xe8b88a), E2 = mk(0x1f6fd1, 0x2a3550, 0xc98b5a), E3 = mk(0xe0574e, 0x2e2e2e, 0xc98b5a), E4 = mk(0x2f8bdf, 0x2e2e2e, 0xe8b88a);
  const PI = Math.PI;
  const path = (keys, t) => { if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, th: null }; for (let i = 0; i < keys.length - 1; i++) { const a = keys[i], b = keys[i + 1]; if (t <= b[0]) { const u = (t - a[0]) / (b[0] - a[0]), dx = b[1] - a[1], dz = b[2] - a[2], mv = Math.hypot(dx, dz) > 0.01; return { x: a[1] + dx * u, z: a[2] + dz * u, mv, th: mv ? Math.atan2(dx, dz) : null }; } } const l = keys[keys.length - 1]; return { x: l[1], z: l[2], mv: false, th: null }; };
  const pose = (a, s, t) => {
    const sc = s.sc ?? 1; a.G.visible = s.vis !== false && sc > 0.01;
    a.G.position.set(s.x, s.y || 0, s.z); a.G.rotation.set(s.rx || 0, s.th, 0); a.G.scale.setScalar(Math.max(0.001, sc));
    restPose(a);
    if (s.m === "run") runPose(a, t * 13, 1); else if (s.m === "walk") runPose(a, t * 8, 0.55);
    else if (s.m === "up") { a.armL.rotation.x = a.armR.rotation.x = -2.9; }
    else if (s.m === "throw") { a.armL.rotation.x = a.armR.rotation.x = -1.5; }
    else if (s.m === "jump") { a.armL.rotation.x = a.armR.rotation.x = -2.6; a.legL.rotation.x = 0.45; a.legR.rotation.x = -0.35; }
    else if (s.m === "aim") { a.armR.rotation.x = -1.57; a.armL.rotation.x = -1.35; a.armL.rotation.y = 0.45; }
    else if (s.m === "wave") { a.armR.rotation.z = 2.6 + Math.sin(t * 8) * 0.45; }
    else if (s.m === "flail") { a.armL.rotation.x = -2.7 + Math.sin(t * 22) * 0.5; a.armR.rotation.x = -2.7 - Math.sin(t * 22) * 0.5; }
  };
  const run = (keys, t, th0, m = "run") => { const p = path(keys, t); return { x: p.x, z: p.z, th: p.th ?? th0, m: p.mv ? m : "idle" }; };

  const sJ = AT["s3:dilewati"] - 0.1, sB = AT["s3:sebanding"];
  const hero = (t) => {
    if (t < AT["s2:mencoba"]) {
      const th = t < K.s2 - 0.4 ? 0.7 : 0.7 + (PI - 0.7) * ramp(t, K.s2 - 0.4, K.s2 + 0.3);
      let m = "idle"; for (const tp of placeT) { if (t > tp - 0.4 && t < tp) m = "up"; else if (t >= tp && t < tp + 0.25) m = "throw"; }
      return { x: 22, z: 46, th, m };
    }
    if (t < sJ) return run([[AT["s2:mencoba"], 22, 46], [AT["s2:mencoba"] + 0.6, 22.3, 41], [AT["s2:mencoba"] + 1.2, 21.7, 36], [AT["s2:mencoba"] + 1.8, 22.3, 31], [AT["s2:mencoba"] + 2.4, 21.7, 26], [AT["s2:mencoba"] + 3.2, 22, 19], [K.s3 + 3.1, 22, 19], [sJ - 0.05, 22, 7.6]], t, PI);
    if (t < sJ + 0.8) { const u = (t - sJ) / 0.8; return { x: 22, z: 7.6 - 5.4 * u, y: 3 * 4 * u * (1 - u) + (u > 0.5 ? -0.0 : 0), th: PI, m: "jump" }; }
    if (t < sJ + 1.7) { const u = (t - sJ - 0.8) / 0.9; return { x: 22, z: 2.2, y: -5.6 * eout(u), th: PI, m: "flail" }; }
    if (t < AT["s3:benda"] - 0.4) return { x: 22, z: 2.2, vis: false, th: PI };
    if (t < sB - 0.3) return run([[AT["s3:benda"] - 0.4, -1, 22], [sB - 0.3, -8.4, 24.6]], t, PI / 2, "walk");
    if (t < tF3 + 1.1) return { x: -8.4, z: 24.6, th: PI / 2 * ramp(t, sB - 0.3, sB + 0.1) + (1 - ramp(t, sB - 0.3, sB + 0.1)) * Math.atan2(-7.4, 2.6), m: t > sB && t < sB + 1.2 ? "up" : "idle" };
    if (t < K.s4 + 0.6) return run([[tF3 + 1.1, -8.4, 24.6], [tF3 + 1.6, -8.6, 20], [tF3 + 2.8, -17, 20]], t, -PI / 2, "walk");
    if (t < AT["s5:tengah"] - 0.2) return { x: 0, z: 49, th: PI, m: "idle" };
    if (t < AT["s5:combat"] + 0.9) return run([[AT["s5:tengah"] - 0.2, 0, 49], [AT["s5:combat"] + 0.9, 1.5, 26]], t, PI);
    if (t < AT["s5:keramaian"] + 0.5) return { x: 1.5, z: 26, th: PI, m: "aim" };
    if (t < AT["s6:Ukurannya"] + 0.8) return run([[AT["s5:keramaian"] + 0.5, 1.5, 26], [AT["s5:keramaian"] + 1.4, -2.6, 19], [AT["s6:Ukurannya"] + 0.8, -2.6, 8.2]], t, -PI / 2, "walk");
    const j1 = AT["s6:dilompati"] - 0.55, j2 = j1 + 0.72;
    if (t < K.s7 + 0.2) { let y = 0, m = "idle"; for (const j of [j1, j2]) if (t > j && t < j + 0.62) { const u = (t - j) / 0.62; y = 3.3 * 4 * u * (1 - u); m = "jump"; } return { x: -2.6, z: 8.2, y, th: -PI / 2, m }; }
    if (t < K.s8) return run([[K.s7 + 0.2, -2.6, 8.2], [K.s7 + 1.0, 0, 13], [K.s7 + 3.4, 0, 40]], t, 0);
    if (t < AT["s8:lahir"] + 0.3) return run([[K.s8, 0, 40], [AT["s8:lahir"] + 0.3, 0, 48]], t, 0, "walk");
    return { x: 0, z: 48, th: 0.12, m: "wave" };
  };
  const red = (t) => {
    if (t < AT["s3:titik"] - 0.1) return { x: 0, z: -50, th: 0, m: "idle" };
    if (t < K.s4) { const s = 1 - ramp(t, tF2 + 1.2, tF2 + 1.5); return { x: 11, z: -3, y: 10 + hT, th: -PI / 4 + Math.sin(t * 1.3) * 0.25, m: "aim", sc: s * back(clamp01((t - AT["s3:titik"] + 0.1) / 0.35)) }; }
    if (t < AT["s5:silang"]) return { x: 0, z: -48, th: 0, m: "idle" };
    if (t < AT["s5:combat"] + 0.9) return run([[AT["s5:silang"], 0, -48], [AT["s5:combat"] + 0.9, -1.5, 14]], t, 0);
    if (t < AT["s5:keramaian"] + 0.1) return { x: -1.5, z: 14, th: 0, m: "aim" };
    if (t < AT["s6:dua"] - 0.6) return run([[AT["s5:keramaian"] + 0.1, -1.5, 14], [AT["s5:keramaian"] + 1.6, 4, 17.6]], t, -PI / 2, "walk");
    if (t < K.s7) return run([[AT["s6:dua"] - 0.6, 4, 17.6], [AT["s6:Setiap"] + 0.5, -22, 17.6]], t, -PI / 2, "walk");
    return { x: -6.5, z: 54, th: 0.3, m: t > AT["s8:Kamu"] ? "wave" : "idle" };
  };
  const mate = (a, sx, sz, keys, end, s8) => (t) => {
    if (t < K.s5 + 4.6) return { x: sx, z: sz, th: sz < 0 ? 0 : PI, m: "idle" };
    if (t < K.s7) { const p = run(keys, t, keys[keys.length - 1][3] ?? 0); return p; }
    return { ...s8, m: t > AT["s8:Kamu"] + 0.2 && s8.wave ? "wave" : "idle" };
  };
  const mA = AT["s5:Jadi"] - 3.2, mB = AT["s5:Jadi"] + 1.4;
  const e1 = mate(E1, -12, -50, [[mA, -12, -50], [mA + 1, -22, -45], [mA + 3, -22, -20], [mB, -3, -21]], 0, { x: -17, z: 50, th: 0.4 });
  const e2 = mate(E2, 12, 50, [[mA, 12, 50], [mA + 0.8, 22, 45], [mA + 3.6, 22, -20], [mB, 3, -19]], 0, { x: 16.5, z: 50, th: -0.4, wave: 1 });
  const e3 = mate(E3, 12, -50, [[mA, 12, -50], [mA + 0.8, 22, -45], [mA + 3.6, 22, 20], [mB, 7, 26]], 0, { x: -23, z: 51, th: 0.6 });
  const e4base = mate(E4, -12, 50, [[mA, -12, 50], [mA + 0.6, -22, 45], [mA + 2.6, -22, 22.4], [mB, -5, 22.4]], 0, { x: 5.5, z: 55, th: -0.3, wave: 1 });
  const e4 = (t) => { if (t >= K.s6 && t < K.s7) return run([[AT["s6:dua"] - 0.6, 4, 22.4], [AT["s6:Setiap"] + 0.5, -22, 22.4]], t, -PI / 2, "walk"); return e4base(t); };

  // camera: px py pz lx ly lz
  const cA = track([
    [0, 50, 84, 132, -3, 0, 2], [K.s1e, 44, 78, 124, -2, 0, 4],
    [K.s2 + 0.9, 58, 34, 88, 20, 2, 38], [AT["s2:mencoba"], 56, 32, 84, 21, 2, 35], [K.s2e - 0.3, 56, 32, 64, 21, 2, 24],
    [AT["s3:susah"], 56, 30, 40, 22, 2, 4], [AT["s3:titik"] + 0.3, 64, 34, 50, 16, 14, 0], [AT["s3:keuntungan"] + 0.8, 70, 40, 60, 10, 28, -2],
    [AT["s3:benda"] + 0.4, 21, 8.5, 21.5, -10, 5, 22.5], [sB + 0.6, 19, 8, 22, -10, 5, 22.5],
    [tF1 + 0.6, 60, 85, 95, 3, 4, 4], [K.s3e, 56, 92, 104, 2, 2, 2],
    [AT["s4:tata"], 4, 200, 88, -1, 0, -20], [K.s4e, 0, 206, 84, -1.5, 0, -22], [AT["s5:Persimpangan"] + 0.4, -2, 204, 82, -1.5, 0, -20],
    [AT["s5:combat"] + 0.6, 30, 62, 72, 0, 2, 16], [K.s5e - 0.4, 34, 66, 80, -1, 2, 14],
    [AT["s6:Di"], -40, 16, 22, -8, 6.5, 20], [AT["s6:Setiap"] - 0.4, -38, 15, 21, -8, 6.5, 20],
    [AT["s6:dinding"] + 0.5, 30, 14, 30, -4, 8.5, 9], [K.s6e, 32, 15, 32, -4, 8.5, 9],
    [K.s7 + 1.6, 46, 56, 84, 0, 2, 12], [AT["s7:diganti"], 60, 85, 118, -1, 0, 2], [K.s7e, 54, 80, 120, -1, 0, 4],
    [K.s8 + 1.8, 10, 26, 96, 0, 6, 42], [K.dur, -6, 27, 98, 0, 6.5, 42],
  ]);

  const dummyV = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  const placeBeam = (m, a, b) => { dummyV.subVectors(b, a); const L = dummyV.length(); m.position.copy(a).addScaledVector(dummyV, 0.5); m.quaternion.setFromUnitVectors(up, dummyV.clone().normalize()); m.scale.set(1, L, 1); };

  return (t) => {
    const p = cA(t); cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]);
    const sa = 2.35 + t * 0.006; sun.position.set(Math.cos(sa) * 80, 92, Math.sin(sa) * 70 + 20); sun.target.position.set(0, 0, 0);

    // s3 problem state
    const inS3 = t >= K.s3 && t < K.s4;
    hT = inS3 ? 24 * ramp(t, AT["s3:titik"] - 0.1, AT["s3:titik"] + 1.0) * (1 - ramp(t, tF2, tF2 + 1.2)) : 0;
    tower.visible = hT > 0.05; tower.scale.y = Math.max(0.01, hT);
    const shr = inS3 ? ramp(t, AT["s3:benda"] - 0.3, AT["s3:benda"] + 0.5) * (1 - ramp(t, tF3, tF3 + 1.0)) : 0;
    setDoor(10 - 6.8 * shr, 10 - 6.4 * shr);
    frM.opacity = clamp01(shr * 1.5) * (0.6 + 0.4 * Math.sin(t * 9)); for (const m of fr) m.visible = shr > 0.02;
    const wOpen = inS3 ? ramp(t, AT["s3:Area"] - 0.2, AT["s3:Area"] + 0.4) : 0;
    water.visible = wOpen > 0.01; water.scale.z = Math.max(0.01, wOpen);
    const bU = inS3 ? eout(clamp01((t - tF1) / 0.8)) : 0;
    bridge.visible = bU > 0.01; bridge.position.z = 16 * (1 - bU);
    const cv = hT > 0.5 ? clamp01(hT / 8) * (1 - ramp(t, AT["s3:benda"] - 0.7, AT["s3:benda"])) : 0;
    coneM.opacity = 0.13 * cv; cone.visible = cv > 0.01;
    if (cone.visible) { const ap = new THREE.Vector3(11, 10 + hT + 4.6, -3), tg = new THREE.Vector3(-4 + Math.sin(t * 0.9) * 8, 0, 12 + Math.cos(t * 0.7) * 4); const L = ap.distanceTo(tg); cone.position.copy(ap); cone.lookAt(tg); cone.scale.set(L * 0.55, L * 0.55, L); }

    // pieces: placement + polish waves
    for (const pc of pieces) {
      let s = 1;
      if (pc.tp) { const u = clamp01((t - pc.tp) / 0.45); if (t < pc.tp - 0.4) s = 0; else if (t < pc.tp) { pc.g.position.set(22, 6.6 + 0.2 * Math.sin(t * 9), 45.3); s = back(clamp01((t - pc.tp + 0.4) / 0.25)); } else { const e = eout(u); pc.g.position.set(22 + (pc.x - 22) * e, 6.6 * (1 - e) + 4 * Math.sin(u * PI) + pc.h / 2 * e + (1 - e) * 0, 45.3 + (pc.z - 45.3) * e); s = 1; } if (t >= pc.tp + 0.45) pc.g.position.set(pc.x, pc.h / 2, pc.z); }
      pc.g.visible = s > 0.01; pc.g.scale.setScalar(Math.max(0.01, s));
      const pw = pol(t, pc.z, wWall); pc.P.visible = pw > 0.005; pc.P.scale.y = Math.max(0.005, pw);
      const pwin = pol(t, pc.z, wWin); for (const w of pc.win) { w.visible = pwin > 0.01; w.scale.set(1, Math.max(0.01, pwin), Math.max(0.01, pwin)); }
      const pl = pol(t, pc.z, wLamp); for (const L of pc.lamps) { L.visible = pl > 0.01; L.scale.setScalar(Math.max(0.01, back(pl))); }
    }
    for (const f of floors) { const u = pol(t, f.position.z, wFloor); f.visible = u > 0.01; f.scale.y = Math.max(0.01, u); f.position.y = 0.06 * u; }
    for (const d of deco) { const u = pol(t, d.position.z, wDeco); d.visible = u > 0.01; d.scale.setScalar(Math.max(0.01, back(u, 2.2))); }
    const pb = pol(t, 44, wWall); boardP.visible = pb > 0.01; boardP.scale.y = Math.max(0.01, pb); signM.opacity = clamp01((pb - 0.6) / 0.4); sign.visible = signM.opacity > 0.01;
    doorM.color.copy(cGrey).lerp(cCream, pol(t, 20, wWall));

    // scan sweeps (hook: far to near; s7 floor: near to far)
    let so = 0;
    if (t > tC && t < tC + 2.7) { const u = clamp01((t - tC - 0.1) / 2.1); scan.position.z = -62 + 124 * u; so = Math.sin(clamp01((t - tC) / 2.6) * PI); }
    const w0 = AT["s7:diganti"];
    if (t > w0 - 0.1 && t < w0 + 2.0) { const u = clamp01((t - w0) / 1.7); scan.position.z = 62 - 124 * u; so = Math.sin(clamp01((t - w0 + 0.1) / 2.0) * PI); }
    scan.material.opacity = 0.9 * so; scan.visible = so > 0.01;

    // projections
    const projOff = 1 - ramp(t, K.s6 - 0.2, K.s6 + 1.2);
    lanes.forEach((l) => { const u = ramp(t, l.t - 0.2, l.t + 0.5); l.m.scale.z = Math.max(0.01, u); l.m.material.opacity = 0.62 * Math.min(1, u * 3) * projOff; l.m.visible = u > 0.01 && projOff > 0.01; });
    const sr = ramp(t, AT["s4:Zona"] - 0.1, AT["s4:Zona"] + 0.4), sb = ramp(t, AT["s4:berlawanan"] - 0.2, AT["s4:berlawanan"] + 0.3);
    spR.material.opacity = 0.6 * sr * projOff; spB.material.opacity = 0.6 * sb * projOff; spR.visible = sr * projOff > 0.01; spB.visible = sb * projOff > 0.01;
    cross.forEach((c) => { const u = ramp(t, c.t, c.t + 0.6); c.m.scale.x = Math.max(0.01, u); c.m.material.opacity = 0.66 * Math.min(1, u * 3) * projOff; c.m.visible = u > 0.01 && projOff > 0.01; });
    const pk = ramp(t, AT["s5:Persimpangan"], AT["s5:Persimpangan"] + 0.6) * projOff, pk2 = ramp(t, AT["s5:combat"] - 0.1, AT["s5:combat"] + 0.3);
    pocket.forEach((q, i) => { const beat = 0.5 + 0.5 * Math.sin(t * 7 + i); q.m.material.opacity = pk * (0.35 + 0.4 * pk2 * beat); q.m.visible = pk > 0.01; const ph = ((t * 0.9 + i * 0.5) % 1); q.ring.scale.setScalar(6 + ph * 7 * pk2); q.ring.material.opacity = pk2 * (1 - ph) * projOff; q.ring.visible = pk2 * projOff > 0.01; });

    // avatars
    pose(H, hero(t), t); pose(R, red(t), t); pose(E1, e1(t), t); pose(E2, e2(t), t); pose(E3, e3(t), t); pose(E4, e4(t), t);

    // lasers between the two meeting players
    const lz0 = AT["s5:pertempuran"] - 0.2, lz1 = AT["s5:keramaian"] + 0.1;
    const lon = t > lz0 && t < lz1;
    beam1.visible = lon && Math.sin(t * 17) > 0.1; beam2.visible = lon && Math.sin(t * 17 + 2.4) > 0.2;
    if (lon) { placeBeam(beam1, new THREE.Vector3(-1.1, 3.4, 15.4), new THREE.Vector3(1.4, 3.6, 24.8)); placeBeam(beam2, new THREE.Vector3(1.6, 3.4, 24.6), new THREE.Vector3(-1.4, 3.6, 15.2)); }

    // tapes
    const td = ramp(t, AT["s6:pintu"], AT["s6:stud"] - 0.1), tdo = 1 - ramp(t, K.s7 + 0.3, K.s7 + 0.8);
    tapeD.visible = caseD.visible = caseD2.visible = td > 0.01 && tdo > 0.01; tapeD.scale.z = Math.max(0.01, td); caseD.position.z = caseD2.position.z = 15 + 10 * td;
    const tw = ramp(t, AT["s6:dinding"], AT["s6:stud#2"] - 0.1);
    tapeW.visible = caseW.visible = tw > 0.01 && tdo > 0.01; tapeW.scale.y = Math.max(0.01, tw); caseW.position.y = 10 * tw + 0.2;
    const ci = ramp(t, AT["s6:kamera"] - 0.5, AT["s6:kamera"]) * (1 - ramp(t, K.s7 + 0.4, K.s7 + 0.9));
    camIco.visible = viewLine.visible = ci > 0.01;
    if (camIco.visible) { const a = 0.55 * Math.sin((t - AT["s6:kamera"]) * 1.4); const cx = -2.6 + Math.cos(a) * 7.5, cy = 6.6 + Math.sin(t * 2) * 0.2, cz = 8.2 + Math.sin(a) * 7.5; camIco.position.set(cx, cy, cz); camIco.lookAt(-2.6, 4.8, 8.2); camIco.scale.setScalar(ci); camT.p = [cx, cy, cz]; placeBeam(viewLine, new THREE.Vector3(cx, cy, cz), new THREE.Vector3(-2.6, 4.8, 8.2)); }

    // tags
    for (const g of tags) { const u = back(clamp01((t - g.tin) / 0.35), 2), o = 1 - ramp(t, g.tout - 0.25, g.tout); const s = u * o; g.m.visible = s > 0.01; if (g.m.visible) { const q = g.pos(); g.m.position.set(q[0], q[1], q[2]); g.m.quaternion.copy(cam.quaternion); g.m.scale.setScalar(Math.max(0.01, s)); } }
    comp.render();
  };
}
