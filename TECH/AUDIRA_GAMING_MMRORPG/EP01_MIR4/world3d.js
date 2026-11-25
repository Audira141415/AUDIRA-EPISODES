// DARKSTEEL: one long walk through a dark mine, left to right, from the vein to the furnace to the toll gate to a chain that snaps. Original art, no MIR4 assets.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, std, box, cyl, stage, pts, figure, back, envStrips } from "./lib3d.js";

const ST = { mine: 0, furn: 62, gate: 118, chain: 172, port: 236 };
const EMBER = 0xff6a1f, STEEL = 0x46e0d0, VIOLET = 0x8f5bff, RED = 0xff2a18;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x070a10, fog: 0.0085, exp: 1.3, bloom: [0.34, 0.55, 0.9] });
  envStrips(r, scene, [[24, 4, 0xbfe8ff, 5, 0, 14, 8], [4, 22, STEEL, 3.4, -14, 2, 6], [4, 22, 0xffb070, 3.4, 14, 2, 4], [30, 3, 0xffffff, 1.4, 0, -8, 8]]);
  const rnd = mulberry(40);
  const hemi = new THREE.HemisphereLight(0x5f7f9c, 0x1a120c, 2.4);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xa8cde0, 1.9);
  key.position.set(-20, 40, 30);
  scene.add(key);

  // rock: stone with cracks painted on canvas, one floor, a far wall and parallax boulders in front of the lens
  const rockT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#23262c"; g.fillRect(0, 0, w, h); const q = mulberry(5); for (let i = 0; i < 2600; i++) { const v = 20 + q() * 60; g.fillStyle = `rgba(${v},${v + 4},${v + 10},.5)`; g.fillRect(q() * w, q() * h, 2 + q() * 22, 2 + q() * 10); } g.strokeStyle = "rgba(0,0,0,.55)"; for (let i = 0; i < 60; i++) { g.lineWidth = 1 + q() * 3; g.beginPath(); let x = q() * w, y = q() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (q() - 0.5) * 70; y += (q() - 0.5) * 70; g.lineTo(x, y); } g.stroke(); } }, [3, 3]);
  const rock = std(0xffffff, 0.92, 0.05, { map: rockT, flatShading: true });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(520, 120), new THREE.MeshStandardMaterial({ color: 0x2b2d33, roughness: 0.85, metalness: 0.15, map: rockT }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(120, 0, 0); floor.receiveShadow = true; scene.add(floor);

  const dummy = new THREE.Object3D();
  const boulders = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), rock, 620);
  boulders.frustumCulled = false;
  for (let i = 0; i < 620; i++) {
    const back_ = i < 430;
    const x = -60 + rnd() * 370;
    dummy.position.set(x, back_ ? rnd() * 44 - 2 : rnd() * 3, back_ ? -22 - rnd() * 22 : 20 + rnd() * 14);
    const s = back_ ? 3 + rnd() * 8 : 0.8 + rnd() * 2.4;
    dummy.scale.set(s * (0.8 + rnd()), s * (0.7 + rnd() * 0.7), s);
    dummy.rotation.set(rnd() * 6, rnd() * 6, rnd() * 6);
    dummy.updateMatrix(); boulders.setMatrixAt(i, dummy.matrix);
  }
  scene.add(boulders);
  const stal = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 6), rock, 130);
  stal.frustumCulled = false;
  for (let i = 0; i < 130; i++) { const s = 0.8 + rnd() * 2; dummy.position.set(-50 + rnd() * 350, 37 - rnd() * 3, -18 + rnd() * 34); dummy.scale.set(s, 5 + rnd() * 13, s); dummy.rotation.set(Math.PI, 0, 0); dummy.updateMatrix(); stal.setMatrixAt(i, dummy.matrix); }
  scene.add(stal);

  // darksteel: cold crystal clusters. The hero vein at the mine is the brightest thing in the first act.
  const crystalM = new THREE.MeshPhysicalMaterial({ color: 0x6f8a99, emissive: STEEL, emissiveIntensity: 0.32, metalness: 0.85, roughness: 0.16, flatShading: true });
  const veinM = new THREE.MeshPhysicalMaterial({ color: 0x5c5478, emissive: VIOLET, emissiveIntensity: 0.34, metalness: 0.85, roughness: 0.18, flatShading: true });
  const makeVein = (x, z, n, m, spread, seed) => {
    const q = mulberry(seed), I = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1, 0), m, n);
    I.frustumCulled = false;
    for (let i = 0; i < n; i++) { dummy.position.set(x + (q() - 0.5) * spread, q() * spread * 0.5, z + (q() - 0.5) * 4); const s = 0.3 + q() * 1.0; dummy.scale.set(s, s * (1.6 + q() * 2), s); dummy.rotation.set((q() - 0.5) * 1.2, q() * 6, (q() - 0.5) * 1.2); dummy.updateMatrix(); I.setMatrixAt(i, dummy.matrix); }
    scene.add(I); return I;
  };
  makeVein(3.6, -2.2, 46, crystalM, 6, 11);
  makeVein(-26, -12, 34, veinM, 12, 12); makeVein(24, -16, 34, crystalM, 12, 13); makeVein(44, -8, 24, veinM, 7, 14);
  makeVein(92, -14, 24, veinM, 10, 15); makeVein(142, -13, 26, crystalM, 10, 16);
  const veinL = new THREE.PointLight(STEEL, 260, 42, 1.7); veinL.position.set(4, 5, 3); scene.add(veinL);
  const veinL2 = new THREE.PointLight(VIOLET, 520, 70, 1.6); veinL2.position.set(-24, 12, -10); scene.add(veinL2);

  // warrior: walks between stations, swings the pickaxe only while mining
  const wMat = std(0x161a22, 0.75, 0.2), wArm = std(0x3a414c, 0.48, 0.7), wSkin = std(0x4a382c, 0.7, 0);
  const W = figure(wMat, wArm, wSkin, 1.05);
  const pick = new THREE.Group();
  const handle = cyl(0.09, 0.11, 3.2, 8, std(0x3b2a1c, 0.8, 0), 0, -1.7, 0.4, pick); handle.rotation.x = 0.1;
  const headM = std(0x8b95a5, 0.25, 0.95);
  const head = box(0.26, 0.26, 2.2, headM, 0, -3.1, 0.55, pick); head.castShadow = true;
  W.armR.add(pick);
  const cape = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 3, 6, 10), new THREE.MeshStandardMaterial({ color: 0x6b1712, roughness: 0.8, side: THREE.DoubleSide }));
  cape.position.set(0, 2.7, -0.62); W.G.add(cape);
  const capeBase = cape.geometry.attributes.position.array.slice();
  W.G.position.set(ST.mine, 0, 0); scene.add(W.G);
  const heroL = new THREE.SpotLight(0xffe2c0, 420, 40, 0.5, 0.7, 1.5); heroL.position.set(-6, 15, 13); scene.add(heroL, heroL.target);

  // monster: a hulking shape that crosses the back of the mine with two ember eyes, for scale
  const mon = new THREE.Group();
  const monM = std(0x0b0d12, 0.95, 0);
  cyl(2.2, 3.2, 8, 8, monM, 0, 6, 0, mon);
  const mh = new THREE.Mesh(new THREE.IcosahedronGeometry(2.1, 0), monM); mh.position.set(0, 11.6, 0.4); mon.add(mh);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff5a20).multiplyScalar(6) })); e.position.set(s * 0.8, 11.9, 2.3); mon.add(e); const horn = new THREE.Mesh(new THREE.ConeGeometry(0.42, 3, 6), monM); horn.position.set(s * 1.5, 13.8, 0); horn.rotation.z = -s * 0.5; mon.add(horn); }
  mon.position.set(-30, 0, -20); scene.add(mon);

  // furnace: iron stack, glowing mouth, hopper feeding crystals from upper left, a mold that releases the token
  const fur = new THREE.Group(); fur.position.set(ST.furn, 0, -3); scene.add(fur);
  const iron = std(0x1c1a1b, 0.55, 0.9), brass = std(0x7d5a2c, 0.35, 0.9);
  cyl(5.2, 6.4, 9, 12, iron, 0, 4.5, 0, fur); cyl(4.2, 5.2, 6, 12, iron, 0, 12, 0, fur); cyl(1.9, 2.6, 8, 10, iron, 0, 19, 0, fur);
  for (const y of [1.2, 5, 8.9, 14.8]) { const h = new THREE.Mesh(new THREE.TorusGeometry(y < 9 ? 6.1 - y * 0.08 : 4.3, 0.28, 8, 24), brass); h.rotation.x = Math.PI / 2; h.position.y = y; fur.add(h); }
  const glowM = new THREE.MeshBasicMaterial({ color: new THREE.Color(EMBER).multiplyScalar(1) });
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(5, 3.4, 1.6), glowM); mouth.position.set(0, 4.2, 5.2); fur.add(mouth);
  for (let i = -2; i <= 2; i++) { const g = box(0.26, 3.6, 0.4, iron, i * 1.05, 4.2, 6.1, fur); g.castShadow = false; }
  const hopper = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 1.2, 4, 8, 1, true), std(0x30343c, 0.5, 0.8, { side: THREE.DoubleSide }));
  hopper.position.set(-11, 19.5, 0); hopper.rotation.z = -0.5; fur.add(hopper);
  const chute = box(9, 0.5, 2.2, iron, -6, 15.6, 0, fur); chute.rotation.z = -0.42;
  const furL = new THREE.PointLight(EMBER, 0, 72, 1.6); furL.position.set(ST.furn, 6, 8); scene.add(furL);
  const stream = pts(scene, 320, { color: STEEL, size: 0.9 });
  const sparks = pts(scene, 240, { color: 0xffa040, size: 0.55 });

  // token: an obvious illustration, stamped with its label so nobody reads it as a real receipt
  const faceT = canvasTex(512, 512, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 40, w / 2, w / 2, w / 2); gr.addColorStop(0, "#e9b860"); gr.addColorStop(1, "#7a4d18"); g.fillStyle = gr; g.fillRect(0, 0, w, w); g.strokeStyle = "#3f2408"; g.lineWidth = 16; g.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3, x = w / 2 + Math.cos(a) * 214, y = w / 2 + Math.sin(a) * 214; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); g.stroke(); g.fillStyle = "#2a1705"; g.textAlign = "center"; g.font = "700 96px Oswald"; g.fillText("DRACO", w / 2, w / 2 + 22); g.font = "700 34px Inter"; g.fillText("ILUSTRASI", w / 2, w / 2 + 78); });
  const tokMat = [std(0xb07e33, 0.32, 0.95), new THREE.MeshStandardMaterial({ map: faceT, metalness: 0.65, roughness: 0.34, emissive: 0x4a2a08, emissiveIntensity: 0.2 }), new THREE.MeshStandardMaterial({ map: faceT, metalness: 0.65, roughness: 0.34, emissive: 0x4a2a08, emissiveIntensity: 0.2 })];
  const token = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.55, 6), tokMat);
  faceT.center.set(0.5, 0.5); faceT.rotation = Math.PI / 2; token.rotation.x = Math.PI / 2; const tok = new THREE.Group(); tok.add(token); scene.add(tok);
  const tokL = new THREE.PointLight(0xffb15a, 0, 34, 1.7); tok.add(tokL);

  // toll gate: a level-40 rune slab and a tax banner
  const gat = new THREE.Group(); gat.position.set(ST.gate, 0, -6); gat.scale.setScalar(0.5); scene.add(gat);
  const stoneM = std(0x34373f, 0.9, 0.05, { map: rockT });
  box(4, 26, 5, stoneM, -11, 13, 0, gat); box(4, 26, 5, stoneM, 11, 13, 0, gat); box(28, 5, 6, stoneM, 0, 27, 0, gat);
  const runeT = canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#07090d"; g.fillRect(0, 0, w, h); g.strokeStyle = "#46e0d0"; g.lineWidth = 7; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = "#46e0d0"; g.textAlign = "center"; g.font = "700 150px Oswald"; g.fillText("LV 40", w / 2, 178); });
  const rune = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), new THREE.MeshBasicMaterial({ map: runeT, color: 0xbbbbbb })); rune.position.set(0, 21, 3.05); gat.add(rune);
  const banT = canvasTex(256, 512, (g, w, h) => { g.fillStyle = "#6b1712"; g.fillRect(0, 0, w, h); g.fillStyle = "#e7c27a"; g.textAlign = "center"; g.font = "700 62px Oswald"; g.fillText("PAJAK", w / 2, 110); g.font = "700 36px Oswald"; g.fillText("TAMBANG", w / 2, 160); g.beginPath(); g.arc(w / 2, 310, 74, 0, 7); g.fill(); g.fillStyle = "#6b1712"; g.font = "700 90px Oswald"; g.fillText("%", w / 2, 342); });
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 14, 8, 14), new THREE.MeshStandardMaterial({ map: banT, side: THREE.DoubleSide, roughness: 0.75 })); banner.position.set(-5.2, 11.5, 3.1); gat.add(banner);
  const banBase = banner.geometry.attributes.position.array.slice();
  const gateL = new THREE.PointLight(STEEL, 0, 50, 1.6); gateL.position.set(ST.gate, 15, 8); scene.add(gateL);

  // chain: links climbing to the upper right. The token rides it. A section near the top fails.
  const linkM = std(0x8f97a3, 0.3, 0.95);
  const links = [];
  const chainPath = (u) => [ST.chain - 16 + u * 74, 7 + u * 26 + Math.sin(u * 3.14) * 3, -6];
  for (let i = 0; i < 44; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.27, 8, 16), linkM); m.scale.set(1.3, 0.85, 1); const p = chainPath(i / 43); m.position.set(p[0], p[1], p[2]); m.rotation.set(i % 2 ? Math.PI / 2 : 0, 0, 0.38); m.castShadow = true; scene.add(m); m.userData.base = m.position.clone(); m.userData.i = i; links.push(m); }
  const chainL = new THREE.PointLight(0xffb15a, 0, 70, 1.6); chainL.position.set(ST.chain + 8, 22, 6); scene.add(chainL);
  const hackL = new THREE.PointLight(RED, 0, 90, 1.5); hackL.position.set(ST.chain + 28, 22, 4); scene.add(hackL);
  const mint = pts(scene, 900, { color: 0xffd27a, size: 0.8 });
  const redFx = pts(scene, 180, { color: RED, size: 1.1 });

  // portcullis: falls on the announcement. A second, close one drops on the hook, in front of the lens.
  const makeBars = (w, h, r) => { const g = new THREE.Group(); const m = std(0x24262c, 0.55, 0.9); for (let x = -w / 2; x <= w / 2 + 0.01; x += 3.4) { const b = cyl(r, r, h, 8, m, x, h / 2, 0, g); const tip = new THREE.Mesh(new THREE.ConeGeometry(r * 1.5, 1.8, 8), m); tip.rotation.x = Math.PI; tip.position.set(x, -0.8, 0); tip.castShadow = true; g.add(tip); b.castShadow = true; } for (let y = 4; y < h; y += 6) box(w + 2, 0.7, 0.7, m, 0, y, 0, g); return g; };
  const port = makeBars(34, 40, 0.42); port.position.set(ST.port, 44, -2); scene.add(port);
  box(5, 42, 7, stoneM, ST.port - 19.5, 21, -2, scene); box(5, 42, 7, stoneM, ST.port + 19.5, 21, -2, scene);
  const hookBars = makeBars(40, 40, 0.42); hookBars.position.set(ST.mine + 4, 46, 13); scene.add(hookBars);
  const portL = new THREE.PointLight(0x7fd8ff, 0, 70, 1.5); portL.position.set(ST.port + 2, 14, -14); scene.add(portL);
  const dust = pts(scene, 260, { color: 0xb8c0cc, size: 0.5, opacity: 0.5 });
  const flakes = pts(scene, 420, { color: STEEL, size: 0.32, opacity: 0.8 });
  const flakeSeed = []; for (let i = 0; i < 420; i++) flakeSeed.push([rnd() * 320 - 50, rnd() * 34, -18 + rnd() * 30, rnd() * 6.28, 0.3 + rnd() * 0.5]);
  const seedS = []; for (let i = 0; i < 900; i++) seedS.push([rnd(), rnd(), rnd(), rnd()]);

  const stop = AT["s1:disetop"], gateFall = AT["s7:disetop"], hack = AT["s6:dibobol"], mintT = AT["s6:mencetak"], bridge = AT["s6:bridge"], sm = AT["s3:smelting"], draco1 = AT["s3:DRACO"];
  const camT = track([
    [0, 2, 6, 34, 1.2, 3.8, 0],
    [K.s2 - 0.1, 1.2, 5.6, 30, 0.8, 3.4, 0],
    [K.s2 + 3, -8, 10, 58, -4, 6.4, -6],
    [K.s2e - 0.8, 16, 9, 48, 14, 5, -3],
    [K.s3 + 1.6, ST.furn - 3, 12, 62, ST.furn - 1, 8.6, -2],
    [draco1, ST.furn + 4, 9, 50, ST.furn + 5, 6.2, 0],
    [K.s3e, ST.furn + 12, 7.5, 36, ST.furn + 11, 4, 0],
    [K.s4 + 1.6, ST.gate - 6, 9, 50, ST.gate - 1, 6, -4],
    [K.s4e - 0.6, ST.gate + 4, 8.5, 44, ST.gate + 1, 5.2, -4],
    [K.s5 + 1.4, ST.chain - 8, 12, 50, ST.chain - 4, 9, -6],
    [K.s5e - 0.3, ST.chain + 16, 21, 56, ST.chain + 14, 19, -6],
    [hack, ST.chain + 28, 24, 56, ST.chain + 28, 20, -6],
    [K.s6e - 0.2, ST.chain + 40, 22, 66, ST.chain + 34, 18, -6],
    [K.s7 + 1.8, ST.port - 6, 13, 66, ST.port, 8.5, -2],
    [K.s7e, ST.port - 2, 11, 58, ST.port, 7, -2],
    [K.s8 + 1.5, ST.port - 7, 9, 44, ST.port - 3, 5.4, -2],
    [K.end, ST.port - 7, 11, 62, ST.port - 2, 7.4, -2],
    [K.dur, ST.port - 7, 12, 68, ST.port - 2, 8, -2],
  ]);
  // warrior position over the film: x, walking fades in only while x changes
  const wx = (t) => {
    let x = ST.mine - 3;
    x += (ST.furn + 10 - x) * ramp(t, K.s2e - 0.8, K.s3 + 3.6);
    x += (ST.gate - 3 - (ST.furn + 10)) * ramp(t, K.s3e - 0.2, K.s4 + 2.2);
    x += (ST.chain - 8 - (ST.gate - 3)) * ramp(t, K.s4e - 0.6, K.s5 + 2.2);
    x += (ST.port - 8 - (ST.chain - 8)) * ramp(t, K.s5e - 1, K.s7 + 2);
    return x;
  };
  const tokU = (t) => clamp01((t - K.s5 - 1) / (K.s5e - K.s5 - 0.2)) * 0.62 + 0.38 * eout((t - K.s5e) / 3);

  return (t) => {
    // lens and world are functions of t only
    const c = camT(t);
    const sh = 0.5 * Math.exp(-Math.max(0, t - stop) * 5) * (t > stop ? 1 : 0) + 0.8 * Math.exp(-Math.max(0, t - gateFall - 0.42) * 5) * (t > gateFall + 0.42 ? 1 : 0) + 0.5 * Math.exp(-Math.max(0, t - hack) * 4) * (t > hack ? 1 : 0);
    cam.position.set(c[0] + Math.sin(t * 0.7) * 0.5 + Math.sin(t * 47) * sh, c[1] + Math.cos(t * 0.53) * 0.3 + Math.sin(t * 61) * sh, c[2]);
    cam.lookAt(c[3], c[4], c[5]);
    W.G.rotation.set(0, 0, 0);

    // warrior
    const x = wx(t), dx = wx(t + 0.1) - x, walk = clamp01(Math.abs(dx) * 4);
    W.G.position.x = x;
    const mining = ramp(t, 0, 0.1) * (1 - ramp(t, K.s2e - 1.2, K.s2e - 0.8));
    const sw = (t * 2.3) % 1;
    const swing = sw < 0.34 ? -2.6 * eout(sw / 0.34) : -2.6 + 3 * ramp(sw, 0.34, 0.46);
    const wc = Math.sin(t * 8.6) * 0.75 * walk;
    W.armR.rotation.x = mining ? swing * mining + wc * (1 - mining) : -wc * 0.8;
    W.armL.rotation.x = mining ? swing * 0.45 * mining : wc * 0.8;
    W.legL.rotation.x = wc; W.legR.rotation.x = -wc;
    W.G.rotation.y = mining > 0.5 ? 0.7 : walk > 0.2 ? Math.PI / 2 : 0.25;
    W.G.position.y = Math.abs(Math.sin(t * 8.6)) * 0.14 * walk;
    const cp = cape.geometry.attributes.position;
    for (let i = 0; i < cp.count; i++) { const u = (capeBase[i * 3 + 1] + 1.5) / 3; cp.array[i * 3 + 2] = capeBase[i * 3 + 2] - (1 - u) * (0.5 + walk * 1.5 + Math.sin(t * 3.2 + u * 5 + capeBase[i * 3]) * 0.3); }
    cp.needsUpdate = true;
    const bp_ = banner.geometry.attributes.position;
    for (let i = 0; i < bp_.count; i++) bp_.array[i * 3 + 2] = banBase[i * 3 + 2] + Math.sin(t * 1.8 + banBase[i * 3 + 1] * 0.5) * 0.3 * (7 - banBase[i * 3 + 1]) / 14;
    bp_.needsUpdate = true;

    // monster crosses the mine
    mon.position.x = -44 + 72 * clamp01((t - K.s2) / (K.s2e - K.s2 + 1));
    mon.position.y = Math.abs(Math.sin(t * 1.4)) * 0.5;
    mon.rotation.z = Math.sin(t * 1.4) * 0.03;

    // crystal pulse answers each pick hit
    veinL.intensity = (70 + 150 * Math.exp(-sw * 7) * mining) * (t < K.s3 ? 1 : 0.15);
    crystalM.emissiveIntensity = 0.3 + 0.5 * Math.exp(-sw * 7) * mining;

    // furnace: ramps up on the word smelting. Crystals stream in, then the mouth flares and the token leaves.
    const heat = ramp(t, sm - 0.7, sm + 0.9) * (1 - 0.55 * ramp(t, K.s4 + 3, K.s5));
    const fl = 1 + Math.sin(t * 11) * 0.09 + Math.sin(t * 23.3) * 0.05;
    glowM.color.setHex(EMBER).multiplyScalar(0.2 + 1.15 * heat * fl);
    furL.intensity = 620 * heat * fl;
    const si = stream.pos, feed = ramp(t, sm - 0.2, sm + 0.8) * (1 - ramp(t, draco1 - 0.1, draco1 + 1.2));
    for (let i = 0; i < 320; i++) {
      const u = (i / 320 + t * 0.62) % 1, a = seedS[i];
      const on = feed > a[0] ? 1 : 0;
      si[i * 3] = ST.furn - 13 + 13 * u + (a[1] - 0.5) * 1.3;
      si[i * 3 + 1] = (19 - 4.5 * u - 2.5 * u * u + (a[2] - 0.5) * 1.3) * on - 40 * (1 - on);
      si[i * 3 + 2] = -3 + (a[3] - 0.5) * 2;
    }
    stream.commit();
    const sp = sparks.pos;
    for (let i = 0; i < 240; i++) {
      const a = seedS[i + 300], life = (a[0] + t * (0.5 + a[1] * 0.6)) % 1;
      const on = heat > 0.25;
      sp[i * 3] = ST.furn + (a[2] - 0.5) * 5 + (a[3] - 0.5) * 12 * life;
      sp[i * 3 + 1] = on ? 5 + 13 * life * (0.6 + a[1]) - 7 * life * life : -30;
      sp[i * 3 + 2] = 4 + a[1] * 7 * life;
    }
    sparks.commit();

    // token: born at the word DRACO, then rides the chain; on the announcement it goes cold behind the bars
    const born = back((t - draco1) / 0.7);
    const u = tokU(t);
    let tp;
    if (t < K.s5 + 1) { const go = ramp(t, K.s4 + 1, K.s5 + 1); const b0 = [ST.furn + 10, 7.5, 5]; if (t > K.s3e) { b0[0] = wx(t) + 8; b0[1] = 9; b0[2] = 1; } const p0 = chainPath(0); tp = [b0[0] + (p0[0] - b0[0]) * go, b0[1] + (p0[1] - b0[1]) * go + Math.sin(t * 1.5) * 0.3, b0[2] + (-3.4 - b0[2]) * go]; }
    else { const p = chainPath(u); tp = [p[0], p[1] + 1.7, p[2] + 2.6]; }
    tok.position.set(tp[0], tp[1], tp[2]);
    tok.rotation.y = Math.sin(t * 0.9) * 0.55;
    const hookShow = eout(t / 0.25) * (1 - ramp(t, K.s1e - 0.2, K.s1e + 0.1));
    const hk = back((t - AT["s1:kripto"]) / 0.45) * (t > K.s2 - 0.15 ? 0 : 1);
    if (t < K.s2) tok.position.set(4.6, 7.4, 1.5);
    if (t >= K.s6e - 0.5) { const g = ramp(t, K.s6e - 0.5, K.s7 + 1.4); tok.position.lerp(new THREE.Vector3(ST.port + 1.5, 9, -9), g); }
    tok.scale.setScalar(t < K.s2 ? Math.max(0.0001, hk * 0.5) : Math.max(0.0001, born));
    tokL.intensity = (t > draco1 ? 60 : 0) * (1 - 0.8 * ramp(t, gateFall, gateFall + 1.2));

    // lights along the walk
    gateL.intensity = 300 * ramp(t, K.s3e - 0.5, K.s4 + 0.6) * (1 - ramp(t, K.s4e, K.s5 + 1.5));
    chainL.intensity = 900 * ramp(t, K.s4e, K.s5 + 1) * (1 - 0.92 * ramp(t, hack, hack + 0.9));
    hackL.intensity = 1000 * ramp(t, hack - 0.05, hack + 0.15) * (1 - ramp(t, K.s7, K.s7 + 2)) * (0.7 + 0.3 * Math.sin(t * 14));
    hemi.intensity = 2.4 - 0.9 * ramp(t, gateFall, K.s8 + 2);
    key.intensity = 1.9 - 0.8 * ramp(t, gateFall, K.s8 + 2);

    // chain failure
    const br = ramp(t, hack - 0.02, hack + 0.5);
    for (const m of links) {
      const b = m.userData.base, i = m.userData.i;
      const near = Math.max(0, 1 - Math.abs(i - 31) / 5);
      const dir = i < 31 ? -1 : 1;
      m.position.set(b.x + dir * near * 5 * br, b.y - near * near * 7 * br * br + Math.sin(i + t * 8) * 0.05 * near, b.z + Math.sin(i * 3) * near * 3 * br);
      m.rotation.z = 0.38 + near * dir * 1.3 * br;
    }
    const mi = mint.pos, mc = mint.col, mAct = ramp(t, mintT - 0.2, mintT + 1.1) * (1 - ramp(t, K.s7 + 1, K.s7 + 3));
    const px = ST.chain + 37, py = 26;
    for (let i = 0; i < 900; i++) {
      const a = seedS[i], ang = a[0] * 6.283, sp1 = 5 + a[1] * 34, life = (a[2] + (t - mintT) * (0.18 + a[3] * 0.25)) % 1;
      const on = mAct > a[3];
      mi[i * 3] = on ? px + Math.cos(ang) * sp1 * life : 0;
      mi[i * 3 + 1] = on ? py + Math.sin(ang) * sp1 * life * 0.8 - 11 * life * life : -60;
      mi[i * 3 + 2] = -6 + (a[1] - 0.5) * 22 * life;
    }
    mint.commit();
    const ri = redFx.pos;
    for (let i = 0; i < 180; i++) {
      const a = seedS[i + 200], dt = t - hack, on = dt > 0 && dt < 1.6;
      ri[i * 3] = on ? px + Math.cos(a[0] * 6.28) * (2 + a[1] * 24) * eout(dt / 1.1) : 0;
      ri[i * 3 + 1] = on ? py + Math.sin(a[0] * 6.28) * (2 + a[1] * 18) * eout(dt / 1.1) - 9 * dt * dt : -60;
      ri[i * 3 + 2] = -6 + (a[2] - 0.5) * 12;
    }
    redFx.commit();

    // bars: hook bars in front of the lens, then the big gate
    const hb = ramp(t, stop - 0.22, stop) * (1 - ramp(t, K.s2 + 0.1, K.s2 + 0.8));
    hookBars.position.y = 46 - 46 * (hb * hb);
    const pf = clamp01((t - gateFall) / 0.42);
    const bounce = pf >= 1 ? Math.exp(-(t - gateFall - 0.42) * 7) * Math.abs(Math.sin((t - gateFall - 0.42) * 15)) * 1.2 : 0;
    port.position.y = 44 - 44 * pf * pf + bounce;
    const di = dust.pos;
    for (let i = 0; i < 260; i++) {
      const a = seedS[i + 500], dt = t - gateFall - 0.42, on = dt > 0 && dt < 5;
      const c0 = i % 2 ? 1 : 0;
      di[i * 3] = on ? ST.port + (a[0] - 0.5) * 34 + (a[1] - 0.5) * 22 * eout(dt / 2.4) : 0;
      di[i * 3 + 1] = on ? 0.5 + a[2] * 8 * eout(dt / 2) : -60;
      di[i * 3 + 2] = -2 + (a[3] - 0.5) * 18 * eout(dt / 2);
    }
    dust.commit();
    dust.m.opacity = 0.55 * (1 - ramp(t, gateFall + 3, gateFall + 5.2));

    heroL.target.position.set(x, 3, 0); heroL.position.set(x - 6, 15, 13);
    portL.intensity = 620 * ramp(t, K.s6e, K.s7 + 1);
    // always-on drifting flakes keep depth alive
    const fi = flakes.pos;
    for (let i = 0; i < 420; i++) { const f = flakeSeed[i]; fi[i * 3] = f[0] + Math.sin(t * f[4] + f[3]) * 1.6; fi[i * 3 + 1] = (f[1] + t * f[4] * 0.8) % 34; fi[i * 3 + 2] = f[2] + Math.cos(t * f[4] + f[3]) * 1.4; }
    flakes.commit();

    bp.strength = 0.34 + 0.3 * ramp(t, hack, hack + 0.2) * (1 - ramp(t, hack + 0.6, hack + 2));
    comp.render();
  };
}
