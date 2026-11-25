// OTAK NPC: a cel-shaded manga village. Ink outlines, two-tone shading, red as the only colour of thought. The camera snaps between panels. Illustration, no game assets.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage, runPose, restPose } from "./lib3d.js";

const INK = 0x14110f, PAPER = 0xf5efe0, RED = 0xe0242a;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: PAPER, exp: 1.0, bloom: [0.0, 0.1, 1.0], shadow: true });
  r.toneMapping = THREE.NoToneMapping;
  const rnd = mulberry(3303);
  const grad = new THREE.DataTexture(new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 255, 255, 255, 255]), 3, 1); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const toon = (c) => new THREE.MeshToonMaterial({ color: c, gradientMap: grad });
  const inkM = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
  scene.add(new THREE.AmbientLight(0xffffff, 1.0));
  const sun = new THREE.DirectionalLight(0xffffff, 2.3); sun.position.set(-20, 40, 26); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, far: 180 }); scene.add(sun);
  // inked mesh: hull behind the toon surface, sized in world units so the line weight stays even
  const ink = (geo, c, x = 0, y = 0, z = 0, parent = scene, w = 0.06) => {
    const m = new THREE.Mesh(geo, typeof c === "number" ? toon(c) : c); m.position.set(x, y, z); m.castShadow = true;
    geo.computeBoundingBox(); const b = geo.boundingBox; const hull = new THREE.Mesh(geo, inkM);
    hull.scale.set(1 + (2 * w) / Math.max(0.1, b.max.x - b.min.x), 1 + (2 * w) / Math.max(0.1, b.max.y - b.min.y), 1 + (2 * w) / Math.max(0.1, b.max.z - b.min.z)); m.add(hull);
    parent.add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  // ground: paper with hand-hatched stones
  const gT = canvasTex(1024, 1024, (g, w) => { g.fillStyle = "#ece4d0"; g.fillRect(0, 0, w, w); g.strokeStyle = "rgba(20,17,15,.28)"; g.lineWidth = 3; for (let i = 0; i < 34; i++) { const x = rnd() * w, y = rnd() * w; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(x + k * 11, y); g.lineTo(x + k * 11 - 14, y + 26); g.stroke(); } } }, [12, 12]);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), new THREE.MeshToonMaterial({ map: gT, gradientMap: grad })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  // village houses as a backdrop
  for (let i = 0; i < 16; i++) { const a = -2.4 + (i / 15) * 1.7 * Math.PI * 0.62, d = 46 + rnd() * 30, x = Math.cos(a) * d, z = Math.sin(a) * d - 8, w = 9 + rnd() * 8, h = 7 + rnd() * 9; const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = rnd() * 3; scene.add(G); ink(B(w, h, w * 0.8), 0xf8f3e6, 0, h / 2, 0, G, 0.14); const rf = new THREE.ConeGeometry(w * 0.82, 4.6, 4); rf.rotateY(Math.PI / 4); ink(rf, 0x4a4540, 0, h + 2.3, 0, G, 0.14); }

  // jointed cel figure
  const person = (shirt, skin = 0xf7f2e4, pants = 0x35312c) => {
    const G = new THREE.Group();
    const limb = (x, y, c) => { const p = new THREE.Group(); p.position.set(x, y, 0); G.add(p); ink(B(0.98, 2, 0.98), c, 0, -1, 0, p); return p; };
    const torso = ink(B(2, 2, 1), shirt, 0, 3, 0, G);
    const legL = limb(-0.5, 2, pants), legR = limb(0.5, 2, pants), armL = limb(-1.5, 4, skin), armR = limb(1.5, 4, skin);
    const hp = new THREE.Group(); hp.position.y = 4; G.add(hp);
    const head = ink(new THREE.CylinderGeometry(0.72, 0.72, 1.3, 18), skin, 0, 0.65, 0, hp);
    const fT = canvasTex(128, 128, (g) => { g.fillStyle = "#14110f"; g.beginPath(); g.ellipse(40, 54, 7, 15, 0, 0, 7); g.ellipse(88, 54, 7, 15, 0, 0, 7); g.fill(); g.lineWidth = 7; g.strokeStyle = "#14110f"; g.beginPath(); g.moveTo(44, 92); g.lineTo(84, 92); g.stroke(); });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshBasicMaterial({ map: fT, transparent: true })); face.position.set(0, 0.65, 0.74); hp.add(face);
    scene.add(G);
    return { G, torso, head: hp, armL, armR, legL, legR };
  };
  const NPC = person(0xd8d0bd); const PL = person(0x3b5fa8);
  NPC.G.position.set(3.2, 0, 0); NPC.G.rotation.y = -Math.PI / 2 + 0.3;
  PL.G.position.set(-3.6, 0, 0.5); PL.G.rotation.y = Math.PI / 2 - 0.3;

  // NPC hat, lifted off when the head opens
  const hat = ink(new THREE.ConeGeometry(1.5, 1.1, 18), 0x4a4540, 0, 1.75, 0, NPC.head, 0.06);
  // red brain inside the NPC's opened head
  const bG = new THREE.IcosahedronGeometry(0.72, 3); { const p = bG.attributes.position; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(p, i), n = 1 + 0.13 * Math.sin(v.x * 11) * Math.cos(v.y * 13) + 0.08 * Math.sin(v.z * 17); v.multiplyScalar(n); p.setXYZ(i, v.x, v.y, v.z); } bG.computeVertexNormals(); }
  const brain = ink(bG, RED, 0, 1.15, 0, NPC.head, 0.05);
  const nodeG = new THREE.SphereGeometry(0.11, 8, 6), nodeM = new THREE.MeshBasicMaterial({ color: RED });
  const nodes = []; for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(nodeG, nodeM); const a = rnd() * 6.283, b = rnd() * 3.14, d = 1.4 + rnd() * 2.2; m.userData.p = new THREE.Vector3(Math.cos(a) * Math.sin(b) * d, 1.15 + Math.cos(b) * d, Math.sin(a) * Math.sin(b) * d); NPC.head.add(m); nodes.push(m); }
  const lnP = new Float32Array(26 * 6), lnG = new THREE.BufferGeometry(); lnG.setAttribute("position", new THREE.BufferAttribute(lnP, 3)); const lines = new THREE.LineSegments(lnG, new THREE.LineBasicMaterial({ color: RED })); lines.frustumCulled = false; NPC.head.add(lines);

  // old dialogue: a rigid decision tree of inked cards
  const tree = new THREE.Group(); tree.position.set(0, 0, 0); scene.add(tree);
  const cardT = (txt) => canvasTex(512, 128, (g, w, h) => { g.fillStyle = "#fffdf5"; g.fillRect(0, 0, w, h); g.strokeStyle = "#14110f"; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = "#14110f"; g.font = "700 52px 'Patrick Hand',sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + 3); });
  const cards = ["Halo.", "Ada misi?", "Selamat tinggal.", "???"].map((t, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.6), new THREE.MeshBasicMaterial({ map: cardT(t) })); m.position.set(0, 5.9 - i * 1.8, 6); tree.add(m); return m; });
  const xT = canvasTex(256, 256, (g) => { g.clearRect(0, 0, 256, 256); g.strokeStyle = "#e0242a"; g.lineWidth = 34; g.lineCap = "round"; g.beginPath(); g.moveTo(44, 44); g.lineTo(212, 212); g.moveTo(212, 44); g.lineTo(44, 212); g.stroke(); });
  const xM = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), new THREE.MeshBasicMaterial({ map: xT, transparent: true })); xM.position.set(0, 0.5, 6.1); tree.add(xM);

  // the official example: a very busy beaver and its dam
  const BV = new THREE.Group(); BV.position.set(26, 0, 0); scene.add(BV);
  const brown = 0x9a6a3c;
  const bb = ink(new THREE.SphereGeometry(2.1, 16, 12), brown, 0, 2.4, 0, BV, 0.1); bb.scale.set(1, 1.15, 1);
  const bh = ink(new THREE.SphereGeometry(1.4, 16, 12), brown, 0, 5.1, 0.4, BV, 0.1);
  ink(new THREE.SphereGeometry(0.42, 10, 8), brown, -1.1, 6.3, 0.2, BV, 0.06); ink(new THREE.SphereGeometry(0.42, 10, 8), brown, 1.1, 6.3, 0.2, BV, 0.06);
  ink(B(0.75, 0.75, 0.15), 0xffffff, 0, 4.25, 1.62, BV, 0.05);
  for (const s of [-0.55, 0.55]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), new THREE.MeshBasicMaterial({ color: INK })); e.position.set(s, 5.4, 1.66); BV.add(e); }
  const tail = ink(B(2.2, 0.35, 3.4), 0x54381f, 0, 0.5, -2.8, BV, 0.08); const logs = [];
  for (let i = 0; i < 16; i++) { const g = new THREE.CylinderGeometry(0.55, 0.55, 8 + rnd() * 3, 10); g.rotateZ(Math.PI / 2); const m = ink(g, 0xb98b58, 0, 0.6 + (i % 4) * 1.05, -6.5 - (i % 3) * 0.2, BV, 0.07); m.position.x = -6 + ((i * 3) % 12); logs.push(m); }
  const wr = new THREE.Group(); wr.position.set(0, 0, 0); BV.add(wr);

  // memory slabs: 1200 data tables stacked behind the advisor
  const slab = new THREE.InstancedMesh(new THREE.BoxGeometry(1.1, 0.5, 0.8), toon(0xf8f3e6), 1200), slabI = new THREE.InstancedMesh(new THREE.BoxGeometry(1.16, 0.56, 0.86), inkM, 1200); slab.frustumCulled = slabI.frustumCulled = false; scene.add(slabI, slab);
  const slabD = []; for (let i = 0; i < 1200; i++) slabD.push({ x: -26 + ((i % 40) * 1.32), y: 0.3 + (Math.floor(i / 40) % 30) * 0.62, z: -11, d: rnd() * 1.6 });

  // context chips orbit the brain while the conversation grows
  const chipMats = ["ingat", "tanya", "jawab", "konteks"].map((t) => new THREE.MeshBasicMaterial({ map: canvasTex(256, 96, (g, w, h) => { g.fillStyle = "#e0242a"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.font = "700 54px 'Patrick Hand',sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t, w / 2, h / 2 + 2); }), transparent: true }));
  const chips = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.64), chipMats[i % 4]); scene.add(m); chips.push(m); }

  // ally loop: crate, enemies as dummies
  const crate = ink(B(2.4, 2.4, 2.4), 0xd9b98a, -30, 1.2, -24, scene, 0.1);
  const foes = []; for (let i = 0; i < 3; i++) { const f = person(0x2a2622); f.G.position.set(-40 + i * 5.6, 0, -30 - (i % 2) * 2); foes.push(f); }

  // circular trail for the infinite loop
  const ring = new THREE.Mesh(new THREE.RingGeometry(4.6, 4.95, 64), new THREE.MeshBasicMaterial({ color: RED, side: THREE.DoubleSide, transparent: true })); ring.rotation.x = -Math.PI / 2; ring.position.set(30, 0.05, -30); scene.add(ring);
  const LP = person(0xd8d0bd); LP.head.children[0].visible = true;
  const lBrain = ink(bG.clone(), RED, 0, 1.15, 0, LP.head, 0.05);

  // ghost replay of human moves for the training beat
  const ghostMat = new THREE.MeshBasicMaterial({ color: 0x3b5fa8, transparent: true, opacity: 0.35 });
  const ghostG = new THREE.Group(); for (let i = 0; i < 7; i++) { const g = new THREE.Mesh(B(2, 5.4, 1), ghostMat); g.position.set(-10 + i * 1.8, 2.7 + Math.sin(i) * 0.3, 30); ghostG.add(g); } scene.add(ghostG);

  // cuts: a snap between named shots. [t, px py pz lx ly lz]; two keys per shot make the camera keep drifting.
  const shots = [
    [0, [1, 6, 30], [0, 1.8, 0]], [K.s1e, [-1, 5, 27], [0, 1.8, 0]],
    [K.s2, [9, 5, 13], [3.2, 2.8, 0]], [K.s2e, [7.6, 5.2, 11.5], [3.2, 3, 0]],
    [K.s3, [-2, 6, 30], [0, 2.4, 0]], [K.s3e, [2, 5.5, 28], [0, 2.4, 0]],
    [K.s4, [8.2, 6.6, 10], [3.2, 4.6, 0]], [AT["s4:Roblox"] - 0.1, [7, 7, 9], [3.2, 4.7, 0]],
    [AT["s4:Roblox"], [30, 7.5, 27], [26, 2.4, -1]], [K.s4e, [23, 6.5, 25], [26, 2.4, -1]],
    [K.s5, [9, 7, 13], [3.2, 4.2, 0]], [AT["s5:Total"] - 0.1, [7.5, 7.4, 12], [3.2, 4.2, 0]],
    [AT["s5:Total"], [-2, 11, 40], [-1, 7, -8]], [K.s5e, [3, 13, 44], [-1, 7, -8]],
    [K.s6, [-30, 9, 8], [-33, 2, -24]], [K.s6e, [-36, 8, 6], [-33, 2, -24]],
    [K.s7, [28, 15, -4], [30, 1.5, -30]], [K.s7e, [33, 17, -6], [30, 1.5, -30]],
    [K.s8, [-5, 7, 60], [-3, 2, 30]], [AT["s8:Kalau"] - 0.1, [-1, 6.5, 57], [-3, 2, 30]],
    [AT["s8:Kalau"], [0, 6, 28], [0, 2, 0]], [K.dur, [1, 5, 24], [0, 2.2, 0]],
  ];
  const dummy = new THREE.Object3D();
  const tOpen = AT["s4:otak"], tBv = AT["s4:Roblox"], tSl = AT["s5:Total"], tBohong = AT["s7:dibohongi"];

  return (t) => {
    let i = 0; while (i < shots.length - 1 && shots[i + 1][0] <= t) i++;
    const a = shots[i], b = shots[Math.min(i + 1, shots.length - 1)];
    const u = b[0] > a[0] ? clamp01((t - a[0]) / (b[0] - a[0])) : 0;
    // shot pairs drift; the jump into a new pair is a cut
    const drift = i % 2 === 0 ? u : 1;
    const px = a[1][0] + (b[1][0] - a[1][0]) * (i % 2 === 0 ? drift : 0), py = a[1][1] + (b[1][1] - a[1][1]) * (i % 2 === 0 ? drift : 0), pz = a[1][2] + (b[1][2] - a[1][2]) * (i % 2 === 0 ? drift : 0);
    const punch = i % 2 === 0 ? 1 - eout(clamp01((t - a[0]) / 0.22)) : 0;
    cam.position.set(px, py, pz + punch * 2.4); cam.lookAt(a[2][0], a[2][1], a[2][2]);
    cam.rotateZ(punch * 0.03);

    // conversation stage
    const talk = Math.sin(t * 10) > 0 ? 0.08 : 0;
    PL.armR.rotation.x = -0.4 - talk * 3;
    NPC.head.rotation.y = 0;
    // hook: NPC starts blank, "!" nod when it believes
    const beli = AT["s1:percaya"]; NPC.head.position.y = 4 + (t > beli && t < beli + 0.5 ? Math.sin((t - beli) * 18) * 0.12 : 0);
    // brain visibility: lid lifts open
    const open = ramp(t, tOpen - 0.1, tOpen + 0.35);
    hat.visible = open < 0.05; 
    const headTop = NPC.head.children[0]; headTop.scale.y = 1 - 0.32 * open; headTop.position.y = 0.65 - 0.2 * open;
    brain.visible = open > 0 && t < K.s6; brain.scale.setScalar(back(open, 2)); brain.rotation.y = t * 0.4;
    const nOn = ramp(t, K.s5, K.s5 + 1.1) * (t < K.s6 ? 1 : 0);
    nodes.forEach((n, k) => { n.visible = nOn > 0.01; const pp = n.userData.p; n.position.set(pp.x * nOn + Math.sin(t * 2 + k) * 0.08, 1.15 + (pp.y - 1.15) * nOn, pp.z * nOn); lnP.set([0, 1.15, 0, n.position.x, n.position.y, n.position.z], k * 6); });
    lines.visible = nOn > 0.01; lnG.attributes.position.needsUpdate = true;
    chips.forEach((c, k) => { const on = ramp(t, K.s5 + 0.3 + k * 0.28, K.s5 + 0.6 + k * 0.28) * (t < tSl ? 1 : 0); c.visible = on > 0; const an = t * 0.8 + k * 0.785; c.position.set(3.2 + Math.cos(an) * 3.4, 6.2 + Math.sin(an * 2) * 0.8, Math.sin(an) * 3.4); c.lookAt(cam.position); c.scale.setScalar(on + 0.001); });

    // old tree
    tree.visible = t > K.s3 - 0.05 && t < K.s4;
    cards.forEach((c, k) => { c.visible = t > K.s3 + 0.4 + k * 0.6; });
    cards[3].visible = t > AT["s3:Tanya"]; xM.visible = t > AT["s3:Tanya"] + 0.4;
    xM.scale.setScalar(back(clamp01((t - AT["s3:Tanya"] - 0.4) / 0.25), 3) + 0.001);
    // chosen line pulses: rigid nod
    if (t > K.s3 && t < K.s4) NPC.head.rotation.y = Math.floor(t * 1.2) % 2 ? 0.08 : -0.08;

    // beaver works, tail slaps
    tail.rotation.x = Math.sin(t * 7) * 0.25; bh.rotation.z = Math.sin(t * 3) * 0.05; BV.rotation.y = -0.15 + Math.sin(t * 0.9) * 0.08;
    const bvOn = ramp(t, tBv, tBv + 0.3); BV.scale.setScalar(0.2 + 0.8 * back(bvOn, 2));
    logs.forEach((l, k) => { const q = clamp01((t - tBv - 0.3 - k * 0.2) / 0.3); l.visible = q > 0; l.position.y = (0.6 + (k % 4) * 1.05) + (1 - q) * 7; });

    // tables rise
    const sl = t > tSl ? 1 : 0; let sI = 0;
    slabD.forEach((d) => { const q = sl ? clamp01((t - tSl - d.d) / 0.3) : 0; dummy.position.set(d.x, d.y + (1 - q) * -8, d.z); dummy.scale.setScalar(q > 0 ? 1 : 0.001); dummy.updateMatrix(); slab.setMatrixAt(sI, dummy.matrix); slabI.setMatrixAt(sI, dummy.matrix); sI++; });
    slab.instanceMatrix.needsUpdate = slabI.instanceMatrix.needsUpdate = true;
    slab.visible = slabI.visible = t > tSl && t < K.s6;

    // ally beat: the player and a brained companion run, crate opens, foe falls
    const allyT = t > K.s6 && t < K.s7;
    if (allyT) {
      const q = clamp01((t - K.s6) / (K.s7 - K.s6));
      PL.G.position.set(-27 - q * 4, 0, -17 - q * 2); PL.G.rotation.y = Math.PI + 0.5; runPose(PL, t * 8);
      NPC.G.position.set(-23 - q * 6, 0, -19 - q * 1); NPC.G.rotation.y = Math.PI + 0.3; runPose(NPC, t * 8 + 1);
      const arm = t > AT["s6:mencari"]; if (arm) { NPC.armR.rotation.x = -2.3; }
      crate.rotation.y = 0.4; crate.position.y = 1.2 + (t > AT["s6:mencari"] ? Math.abs(Math.sin((t - AT["s6:mencari"]) * 5)) * 0.4 : 0);
      foes.forEach((f, k) => { const ht = AT["s6:bertarung"] + k * 0.3; const d = ramp(t, ht, ht + 0.35); f.G.rotation.x = -d * 1.45; f.G.position.y = d * 0.7; });
    } else {
      if (t <= K.s6 || t >= K.s7) { restPose(PL); restPose(NPC); PL.armR.rotation.x = -0.4 - talk * 3; PL.G.position.set(-3.6, 0, 0.5); PL.G.rotation.y = Math.PI / 2 - 0.3; NPC.G.position.set(3.2, 0, 0); NPC.G.rotation.y = -Math.PI / 2 + 0.3; }
      foes.forEach((f) => { f.G.rotation.x = 0; f.G.position.y = 0; });
    }
    // loop beat
    ring.visible = t > K.s7 && t < K.s8; ring.material.opacity = 0.9;
    LP.G.visible = t > K.s7 && t < K.s8;
    if (LP.G.visible) { const an = (t - K.s7) * 2.4; LP.G.position.set(30 + Math.cos(an) * 4.8, 0, -30 + Math.sin(an) * 4.8); LP.G.rotation.y = -an; runPose(LP, t * 12); lBrain.rotation.y = t * 7; lBrain.material.color.set(Math.floor(t * 6) % 2 ? RED : 0xff7a50); }
    // training beat
    ghostG.visible = t > K.s8 && t < AT["s8:Kalau"];
    ghostG.children.forEach((g, k) => { g.position.x = -11 + k * 2.7 + ((t * 2) % 2.7); g.rotation.z = Math.sin(t * 5 + k) * 0.12; });
    if (t > K.s8 && t < AT["s8:Kalau"]) { const q = (t - K.s8) * 2; NPC.G.position.set(-11 + ((t * 5.4) % 18), 0, 30); NPC.G.rotation.y = Math.PI / 2; runPose(NPC, t * 11); brain.visible = true; }
    if (t >= AT["s8:Kalau"]) { brain.visible = true; NPC.armR.rotation.x = -1.2; PL.armR.rotation.x = -1.2 + Math.sin(t * 3) * 0.1; }
    comp.render();
  };
}
