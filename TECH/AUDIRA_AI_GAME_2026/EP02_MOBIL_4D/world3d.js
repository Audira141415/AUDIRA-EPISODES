// CAR-5: a drafting table in the dark. One word becomes a wireframe, the wireframe becomes five named parts, the parts become a car that leaves the blueprint and drives. Illustration, no Roblox assets.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, std, box, cyl, stage, avatar, runPose, restPose, label, envStrips, pts } from "./lib3d.js";

const CY = 0x39d0ff, RD = 0xff3b30, NV = 0x06122b;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: NV, fog: 0.0085, exp: 1.12, bloom: [0.26, 0.45, 0.93] });
  envStrips(r, scene, [[30, 5, 0xffffff, 4, 0, 18, 6], [6, 30, CY, 3, -18, 4, 4], [6, 30, 0xff6a4d, 2.4, 18, 4, 4], [40, 3, CY, 1.5, 0, -8, 12]]);
  scene.add(new THREE.HemisphereLight(0x8fb4e8, 0x0a1830, 1.3));
  const key = new THREE.DirectionalLight(0xdfeeff, 2.6); key.position.set(12, 28, 14); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, far: 90 }); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffe7d0, 1.3); fill.position.set(-8, 12, -24); scene.add(fill);
  const rnd = mulberry(2202);

  // blueprint floor, scrolls under the car when it drives
  const grid = canvasTex(1024, 1024, (g, w) => { g.fillStyle = "#0a1c42"; g.fillRect(0, 0, w, w); g.strokeStyle = "rgba(110,200,255,.42)"; g.lineWidth = 2; for (let i = 0; i <= 16; i++) { const p = (i * w) / 16; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, w); g.moveTo(0, p); g.lineTo(w, p); g.stroke(); } g.strokeStyle = "rgba(140,225,255,.7)"; g.lineWidth = 4; g.strokeRect(0, 0, w, w); });
  grid.wrapS = grid.wrapT = THREE.RepeatWrapping; grid.repeat.set(13, 30);
  const floorM = new THREE.MeshStandardMaterial({ map: grid, color: 0xe6e9f0, roughness: 0.95, metalness: 0, envMapIntensity: 0.0 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(240, 560), floorM); floor.rotation.x = -Math.PI / 2; floor.position.z = -150; floor.receiveShadow = true; scene.add(floor);

  // road stripes and pylons exist only during the drive
  const road = new THREE.Group(); scene.add(road);
  const strip = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.04, 5), new THREE.MeshBasicMaterial({ color: new THREE.Color(CY).multiplyScalar(1.4) }), 60); strip.frustumCulled = false; road.add(strip);
  const pyl = new THREE.InstancedMesh(new THREE.BoxGeometry(0.6, 1, 0.6), new THREE.MeshStandardMaterial({ color: 0x0e2452, emissive: CY, emissiveIntensity: 0.55, roughness: 0.3 }), 90); pyl.frustumCulled = false; road.add(pyl);
  const pylD = []; for (let i = 0; i < 90; i++) pylD.push({ x: (i % 2 ? 1 : -1) * (9 + rnd() * 16), z: i * 7, h: 2 + rnd() * 16, w: 1 + rnd() * 2.4 });

  // car body from a side profile with a real open cockpit
  const prof = new THREE.Shape();
  [[-4.6, 0.55], [-4.75, 1.25], [-4.2, 1.6], [-2.4, 1.72], [-1.5, 1.72], [-1.1, 1.38], [0.75, 1.38], [1.05, 1.68], [2.6, 1.5], [4.3, 1.08], [4.72, 0.72], [4.6, 0.42], [3.75, 0.42], [3.5, 1.0], [2.7, 1.2], [1.9, 1.0], [1.65, 0.42], [-1.65, 0.42], [-1.9, 1.0], [-2.7, 1.2], [-3.5, 1.0], [-3.75, 0.42]].forEach(([x, y], i) => (i ? prof.lineTo(x, y) : prof.moveTo(x, y)));
  prof.closePath();
  const bodyG = new THREE.ExtrudeGeometry(prof, { depth: 3.4, bevelEnabled: true, bevelSize: 0.13, bevelThickness: 0.18, bevelSegments: 4, steps: 1 }); bodyG.translate(0, 0, -1.7); bodyG.rotateY(-Math.PI / 2);
  const paint = new THREE.MeshPhysicalMaterial({ color: RD, metalness: 0.5, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.55, transparent: true });
  const body = new THREE.Mesh(bodyG, paint); body.castShadow = true;
  const bodyE = new THREE.LineSegments(new THREE.EdgesGeometry(bodyG, 22), new THREE.LineBasicMaterial({ color: new THREE.Color(CY).multiplyScalar(1.7), transparent: true }));
  const glass = new THREE.Mesh(new THREE.BoxGeometry(3, 0.85, 0.08), new THREE.MeshPhysicalMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.45, roughness: 0.05, metalness: 0.2 })); glass.position.set(0, 2.05, 1.05); glass.rotation.x = -0.45;
  const CAR = new THREE.Group(); scene.add(CAR);
  const BG = new THREE.Group(); BG.add(body, bodyE, glass); CAR.add(BG);
  for (const s of [-1, 1]) { const hl = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 0.08), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2c0).multiplyScalar(1.1) })); hl.position.set(s * 1.1, 1.0, 4.82); BG.add(hl); const tl = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.14, 0.06), new THREE.MeshBasicMaterial({ color: new THREE.Color(RD).multiplyScalar(2) })); tl.position.set(s * 1.1, 1.3, -4.88); BG.add(tl); }

  // the four named wheels
  const tireM = std(0x101318, 0.82, 0.1, { transparent: true }), rimM = new THREE.MeshStandardMaterial({ color: 0xd6dde6, metalness: 0.95, roughness: 0.2, transparent: true });
  const spokeM = std(0x2a3038, 0.4, 0.9, { transparent: true });
  const wheelDefs = [["front left wheel", -1.92, 2.7], ["front right wheel", 1.92, 2.7], ["rear left wheel", -1.92, -2.7], ["rear right wheel", 1.92, -2.7]];
  const wheels = wheelDefs.map(([nm, x, z]) => {
    const steer = new THREE.Group(); steer.position.set(x, 0.86, z); CAR.add(steer);
    const spin = new THREE.Group(); steer.add(spin);
    const tg = new THREE.CylinderGeometry(0.86, 0.86, 0.72, 32); tg.rotateZ(Math.PI / 2);
    const tire = new THREE.Mesh(tg, tireM); tire.castShadow = true; spin.add(tire);
    const rg = new THREE.CylinderGeometry(0.5, 0.5, 0.76, 10); rg.rotateZ(Math.PI / 2); spin.add(new THREE.Mesh(rg, rimM));
    for (let i = 0; i < 5; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.13, 0.84), spokeM); sp.rotation.x = (i / 5) * Math.PI; spin.add(sp); }
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(tg, 30), new THREE.LineBasicMaterial({ color: new THREE.Color(CY).multiplyScalar(1.7), transparent: true })); spin.add(e);
    const lab = label(nm, { font: "700 60px 'JetBrains Mono',monospace", color: "#a5ecff", size: 3.7, w: 660, h: 96 }); scene.add(lab);
    return { nm, x, z, steer, spin, e, tire, lab, base: new THREE.Vector3(x, 0.86, z) };
  });
  const bodyLab = label("body", { font: "700 56px 'JetBrains Mono',monospace", color: "#ffb4ae", size: 2.6, w: 320, h: 96 }); scene.add(bodyLab);

  // leader lines from parts to their labels
  const leadP = new Float32Array(5 * 6); const leadG = new THREE.BufferGeometry(); leadG.setAttribute("position", new THREE.BufferAttribute(leadP, 3));
  const lead = new THREE.LineSegments(leadG, new THREE.LineBasicMaterial({ color: new THREE.Color(CY).multiplyScalar(1.3), transparent: true, opacity: 0.8 })); lead.frustumCulled = false; scene.add(lead);

  // the driver sits low in the open cockpit
  const H = avatar({ skin: 0xf5cd30, shirt: 0x1f6fe0, pants: 0x2f8f49 }); H.G.scale.setScalar(0.62); scene.add(H.G);

  // lump: the same silhouette sealed solid grey, for "one chunk"
  const lumpM = new THREE.MeshStandardMaterial({ color: 0x7c8797, roughness: 0.62, metalness: 0.15, transparent: true });
  const lump = new THREE.Group(); lump.add(new THREE.Mesh(bodyG, lumpM)); wheelDefs.forEach(([, x, z]) => { const g = new THREE.CylinderGeometry(0.92, 0.92, 0.72, 24); g.rotateZ(Math.PI / 2); const m = new THREE.Mesh(g, lumpM); m.position.set(x * 0.9, 0.86, z); lump.add(m); }); lump.traverse((o) => (o.castShadow = true)); scene.add(lump);
  const noRot = label("✕", { font: "900 170px sans-serif", color: "#ff5a50", w: 256, h: 256, size: 2.2 }); scene.add(noRot);

  // script beams on "skrip"
  const bm = new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.6, depthWrite: false, toneMapped: false });
  const beams = wheels.map(() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 6), bm); scene.add(m); return m; });
  // ruler brackets on "ukuran"
  const rulerM = new THREE.MeshBasicMaterial({ color: 0xffd166 }); const rul = [box(1, 0.05, 0.05, rulerM), box(0.05, 0.5, 0.05, rulerM), box(0.05, 0.5, 0.05, rulerM)]; rul.forEach((m) => { m.castShadow = false; scene.add(m); });

  // sparks that build the word into the wireframe
  const sp = pts(scene, 900, { color: CY, size: 0.28 }); const spD = []; for (let i = 0; i < 900; i++) spD.push([rnd() * 9 - 4.5, rnd() * 2.2 + 0.2, rnd() * 3.6 - 1.8, (rnd() - 0.5) * 38, rnd() * 22, (rnd() - 0.5) * 38, rnd()]);

  // wish parade: a plane and a flying dragon built from wire + plate
  const edgeMat = () => new THREE.MeshStandardMaterial({ color: 0xeaf4ff, roughness: 0.3, metalness: 0.5 });
  const plane = new THREE.Group(); const pf = cyl(0.42, 0.62, 6, 14, edgeMat()); pf.rotation.x = Math.PI / 2; plane.add(pf); box(9, 0.14, 1.5, edgeMat(), 0, 0, -0.3, plane); box(3, 0.1, 0.8, edgeMat(), 0, 0.1, -2.7, plane); box(0.12, 1.3, 0.9, std(RD, 0.3), 0, 0.7, -2.7, plane); scene.add(plane);
  const dragM = new THREE.MeshStandardMaterial({ color: 0x1ec8a0, roughness: 0.3, metalness: 0.4, emissive: 0x0a5a48, emissiveIntensity: 0.6 });
  const dragon = []; for (let i = 0; i < 26; i++) { const sz = i === 0 ? 1.5 : 1.15 * (1 - i / 30); const m = box(sz, sz, sz * 1.4, dragM); scene.add(m); dragon.push(m); }
  const wings = [-1, 1].map((s) => { const m = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.08, 2.2), new THREE.MeshStandardMaterial({ color: 0xff8a3c, roughness: 0.45, side: THREE.DoubleSide })); m.geometry.translate(s * 2.7, 0, 0); scene.add(m); return { m, s }; });
  // thousands of future objects: ghost wireframes out to the horizon
  const ghostG = [new THREE.BoxGeometry(2, 2, 2), new THREE.TetrahedronGeometry(1.5), new THREE.TorusGeometry(1, 0.32, 6, 12), new THREE.ConeGeometry(1.1, 2.4, 6), new THREE.IcosahedronGeometry(1.2)];
  const ghostMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(CY).multiplyScalar(1.05), wireframe: true, transparent: true });
  const ghosts = []; for (let i = 0; i < 180; i++) { const m = new THREE.Mesh(ghostG[i % 5], ghostMat); const a = rnd() * 6.283, d = 11 + rnd() * rnd() * 90; m.position.set(Math.cos(a) * d, 1.4 + rnd() * 6, Math.sin(a) * d); m.rotation.set(rnd() * 3, rnd() * 3, 0); m.scale.setScalar(0.7 + rnd() * 0.9); scene.add(m); ghosts.push({ m, t: rnd() * 1.5, s: m.scale.x, spin: rnd() - 0.5 }); }

  const tW = AT["s1:mobil"], tM = AT["s1:masuk"], tS = AT["s1:menyetirnya"], tLump = AT["s3:bongkah"], tRoda = AT["s3:rodanya"], tTwo = AT["s4:schema"], tCar5 = AT["s4:namanya"], tFive = AT["s4:lima"], tBody = AT["s4:bodi"], tWh = AT["s4:roda"], tScript = AT["s5:skrip"], tSize = AT["s5:ukuran"], tSpin = AT["s5:berputar"], tTurn = AT["s5:berbelok"], tDrive = K.s6, tEndDrive = K.s8 + 0.6;
  const cT = track([
    [0, 5, 8, 21, 0, 0.8, 0], [tS, 10, 7, 21, 0, 0.8, 0], [K.s2 - 0.1, 13, 9, 20, 0, 0.8, 0], [K.s2e - 0.3, -12, 12, 21, 0, 0.8, 0],
    [K.s3 + 0.6, -9, 8, 22, 0, 0.8, 0], [K.s3e - 0.3, 9, 7, 21, 0, 0.8, 1],
    [tFive, 0, 19, 32, 0, 2.2, 0], [K.s4e - 0.2, 5, 18, 31, 0, 2.2, 0], [K.s5 + 1, 13, 13, 23, 0, 1, 0], [K.s5e - 0.3, -14, 9, 19, 0, 0.9, 1],
    [tDrive + 1, -5, 6, -20, 0, 0.5, 0], [K.s6e - 1, 5, 4.8, -19, 0, 0.5, 0], [K.s7 + 1, 7, 9, -30, 0, 3.4, 0], [K.s7e - 0.4, -7, 8.5, -29, 0, 3.4, 0],
    [K.s8 + 1.2, 12, 10, -19, 0, 3, 2], [K.s8e, 0, 20, -38, 0, 2, 2], [K.dur, 0, 22, -42, 0, 2, 2],
  ]);
  const dummy = new THREE.Object3D();
  // road distance as a closed-form function of t so any frame can be sought
  const drive = (t) => { const a = Math.max(0, t - tDrive), b = Math.max(0, t - tEndDrive); return 42 * (a - (a > 1.6 ? 0.8 : a - (a * a) / 3.2)) - 42 * (b > 1.6 ? b - 0.8 : (b * b) / 3.2); };

  return (t) => {
    const c = cT(t); cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]);
    const d = drive(t), driving = t > tDrive && t < tEndDrive + 1.6;

    // materialise
    const wire = ramp(t, 0.1, tW + 0.2), solid = ramp(t, tM - 0.1, tM + 0.4), lumpOn = ramp(t, tLump - 0.3, tLump) * (1 - ramp(t, K.s4 + 0.1, K.s4 + 0.6));
    const inLump = lumpOn > 0.02;
    paint.opacity = solid * (1 - lumpOn); tireM.opacity = rimM.opacity = spokeM.opacity = solid * (1 - lumpOn); paint.transparent = tireM.transparent = rimM.transparent = spokeM.transparent = paint.opacity < 1;
    body.visible = paint.opacity > 0.01; glass.visible = solid > 0.5 && !inLump;
    bodyE.material.opacity = wire * (1 - lumpOn) * (solid > 0.8 ? 0.22 : 1);
    lump.visible = inLump; lumpM.opacity = lumpOn;
    // the frozen wheels shake against the lump
    const jolt = t > tRoda && t < K.s3e ? Math.sin(t * 34) * 0.05 * (1 - ramp(t, tRoda + 0.9, tRoda + 1.6)) : 0;
    lump.position.x = jolt;
    noRot.visible = t > tRoda + 0.3 && t < K.s3e + 0.05; noRot.position.set(3.1, 1.5, 2.7); noRot.lookAt(cam.position); noRot.scale.setScalar(back(clamp01((t - tRoda - 0.3) / 0.3), 2.5) + 0.001);

    // explode into five parts
    const ex = ramp(t, tFive, tFive + 1.2) * (1 - ramp(t, K.s5 + 0.3, K.s5 + 1.3));
    BG.position.y = ex * 3.8;
    const steerA = ramp(t, tTurn, tTurn + 0.35) * Math.sin((t - tTurn) * 2.2) * 0.42 * (1 - ramp(t, K.s6, K.s6 + 0.4));
    const stretch = 1 + 0.26 * Math.sin(clamp01((t - tSize) / 1.6) * Math.PI);
    BG.scale.set(1 + (stretch - 1) * 0.3, 1, stretch);
    const spinRate = t > tSpin ? (t - tSpin) * 7 : 0;
    const drvSpin = d * 1.16;
    wheels.forEach((w, i) => {
      const sx = Math.sign(w.x), sz = Math.sign(w.z), on = clamp01((t - (tWh + i * 0.12)) / 0.35);
      w.steer.position.set(w.x * (1 + ex * 0.95), 0.86 + ex * 0.15, w.z * stretch + sz * ex * 0.7);
      w.steer.rotation.y = i < 2 ? steerA : 0;
      w.spin.rotation.x = spinRate + drvSpin + Math.sin(ex * 3) * 0.4;
      w.e.material.opacity = wire * (solid > 0.8 ? 0.15 : 1) * (1 - lumpOn);
      const lv = ex > 0.25 && on > 0;
      w.lab.visible = lv; w.lab.material.opacity = on;
      if (lv) { w.lab.position.set(sx * 3.5, 2.6, w.steer.position.z + (sz > 0 ? 1.1 : -1.1)); w.lab.lookAt(cam.position); }
      leadP.set(lv ? [w.steer.position.x, 1.5, w.steer.position.z, w.lab.position.x, 2.3, w.lab.position.z] : [0, 0, 0, 0, 0, 0], i * 6);
      const bO = t > tScript && t < K.s5e - 0.6; beams[i].visible = bO;
      if (bO) { const a = new THREE.Vector3(0, 1.3 + BG.position.y, 0), b = w.steer.position; beams[i].position.copy(a).lerp(b, 0.5); beams[i].scale.y = a.distanceTo(b); beams[i].quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); bm.opacity = 0.45 + 0.35 * Math.abs(Math.sin(t * 9)); }
    });
    bodyLab.visible = ex > 0.2 && t > tBody; bodyLab.position.set(0, BG.position.y + 3.1, 0.6); bodyLab.lookAt(cam.position);
    leadP.set(bodyLab.visible ? [0, BG.position.y + 1.7, 0, 0, BG.position.y + 2.7, 0.6] : [0, 0, 0, 0, 0, 0], 24);
    leadG.attributes.position.needsUpdate = true;
    const rlOn = t > tSize && t < tSize + 2; rul.forEach((m) => (m.visible = rlOn)); if (rlOn) { const L = 9.5 * stretch; rul[0].scale.x = L; rul[0].rotation.y = Math.PI / 2; rul[0].position.set(3.4, 0.1, 0); rul[1].position.set(3.4, 0.25, L / 2); rul[2].position.set(3.4, 0.25, -L / 2); }

    // driver: walks in on "masuk", sits, then rides
    const inA = clamp01((t - tM) / 0.8);
    const walkOff = inA < 1;
    H.G.visible = t > tM - 0.5 && !(t > K.s3 - 0.1 && t < K.s6 - 0.9);
    const seatX = 0, seatY = 0.42, seatZ = -0.4;
    if (t > K.s6 - 0.9) { const a = clamp01((t - K.s6 + 0.9) / 0.8); H.G.position.set((1 - a) * 5.5, seatY + (1 - a) * -0.42 + Math.sin(a * 3.14) * 2, seatZ); H.G.rotation.y = 0; runPose(H, t * 10, 1 - a); if (a >= 1) { restPose(H); H.legL.rotation.x = H.legR.rotation.x = -1.4; H.armL.rotation.x = H.armR.rotation.x = -1.3; H.G.position.y = seatY + Math.sin(t * 13) * 0.02; } }
    else { H.G.position.set((1 - inA) * 5.5, seatY + (1 - inA) * -0.42 + Math.sin(inA * 3.14) * 2, seatZ); H.G.rotation.y = 0; if (walkOff) runPose(H, t * 10); else { restPose(H); H.legL.rotation.x = H.legR.rotation.x = -1.4; H.armL.rotation.x = H.armR.rotation.x = -1.3; } }

    // road is alive only during the drive
    road.visible = driving || t > K.s8; floorM.map.offset.y = -(d * 30) / 560;
    const dU = t > tEndDrive + 1.6 ? 0 : 1;
    if (road.visible) {
      for (let i = 0; i < 60; i++) { const z = ((i * 9 - d) % 540 + 540) % 540 - 40; dummy.position.set(0, 0.03, z); dummy.scale.setScalar(1); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); strip.setMatrixAt(i, dummy.matrix); }
      strip.instanceMatrix.needsUpdate = true;
      pylD.forEach((p, i) => { const z = ((p.z - d) % 630 + 630) % 630 - 60; dummy.position.set(p.x, p.h / 2, z); dummy.scale.set(p.w, p.h, p.w); dummy.updateMatrix(); pyl.setMatrixAt(i, dummy.matrix); });
      pyl.instanceMatrix.needsUpdate = true;
    }
    CAR.position.y = driving ? Math.sin(t * 17) * 0.015 : 0;

    // sparks gather on the word
    const su = ramp(t, 0, tM); sp.m.opacity = 1 - ramp(t, tM, tM + 0.5); sp.P.visible = t < tM + 0.6;
    if (sp.P.visible) { for (let i = 0; i < 900; i++) { const q = spD[i], e = eout(clamp01(su * 1.3 - q[6] * 0.3)); sp.pos[i * 3] = q[3] + (q[0] - q[3]) * e; sp.pos[i * 3 + 1] = q[4] + (q[1] - q[4]) * e; sp.pos[i * 3 + 2] = q[5] + (q[2] - q[5]) * e; } sp.commit(); }

    // wish parade above the road
    const pIn = ramp(t, AT["s7:pesawat"] - 0.4, AT["s7:pesawat"] + 0.8), wv = 1 - ramp(t, K.s7e, K.s7e + 0.8);
    plane.visible = pIn > 0 && wv > 0; plane.position.set(-4 + Math.sin(t) * 1.2, 6.2 + (1 - pIn) * 14 + Math.sin(t * 1.4) * 0.5, 7); plane.rotation.z = Math.sin(t) * 0.2; plane.scale.setScalar(pIn * wv + 0.001);
    const dIn = ramp(t, AT["s7:naga"] - 0.4, AT["s7:naga"] + 1.0);
    dragon.forEach((m, i) => { m.visible = dIn > 0 && wv > 0; const q = t * 2.1 - i * 0.28; m.position.set(4 + Math.sin(q) * 3.2, 7.2 + (1 - dIn) * 20 + Math.cos(q * 0.8) * 1.2, 8 - i * 0.8); m.rotation.y = Math.cos(q) * 0.5; });
    wings.forEach((w) => { w.m.visible = dIn > 0 && wv > 0; w.m.position.copy(dragon[3].position); w.m.rotation.z = w.s * Math.sin(t * 6) * 0.55; });

    // ghosts for the thousands
    const gt = AT["s8:ribuan"]; ghostMat.opacity = 0.58 * ramp(t, gt - 0.2, gt + 0.8);
    ghosts.forEach((g) => { const u = clamp01((t - gt - g.t) / 0.5); g.m.visible = u > 0; g.m.scale.setScalar(g.s * back(u, 2)); g.m.rotation.y = t * g.spin; });
    bp.strength = 0.26 + ramp(t, tM - 0.2, tM) * (1 - ramp(t, tM, tM + 0.7)) * 0.8;
    comp.render();
  };
}
