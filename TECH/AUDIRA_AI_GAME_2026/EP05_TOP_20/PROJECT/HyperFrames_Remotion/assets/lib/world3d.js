// PAPAN ATAS: a white architectural model of Roblox's chart. Each tower is a game, the sun sweeps shadows across it, and two orange towers break into the skyline. Heights are illustrative, labelled on screen. No Roblox assets.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, std, box, cyl, stage, avatar, runPose, restPose, pts } from "./lib3d.js";

const ORG = 0xff5a1f, WHT = 0xf4f1ea;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xe9e5dc, fog: 0.0042, exp: 1.02, bloom: [0.05, 0.3, 0.97] });
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb0a998, 1.5));
  const sun = new THREE.DirectionalLight(0xfff1dc, 3.4); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); Object.assign(sun.shadow.camera, { left: -120, right: 120, top: 120, bottom: -120, near: 1, far: 320 }); sun.shadow.bias = -0.0005; sun.shadow.radius = 4; scene.add(sun, sun.target);
  const rnd = mulberry(5505);

  const base = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ color: 0xdedacf, roughness: 0.9 })); base.rotation.x = -Math.PI / 2; base.receiveShadow = true; scene.add(base);
  const gT = canvasTex(1024, 1024, (g, w) => { g.clearRect(0, 0, w, w); g.strokeStyle = "rgba(40,36,30,.13)"; g.lineWidth = 2; for (let i = 0; i <= 10; i++) { const p = (i * w) / 10; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, w); g.moveTo(0, p); g.lineTo(w, p); g.stroke(); } }, [24, 24]);
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshBasicMaterial({ map: gT, transparent: true, depthWrite: false })); gr.rotation.x = -Math.PI / 2; gr.position.y = 0.02; scene.add(gr);

  // 100 towers: rank 0 is the tallest; height follows rank; the camera sits at the front row
  const N = 100, towers = [];
  const SP = 7.6;
  for (let i = 0; i < N; i++) { const col = i % 10, row = Math.floor(i / 10), rankH = 6 + 24 * Math.pow(1 - i / 100, 2.3) + rnd() * 0.6; towers.push({ x: (col - 4.5) * SP + (rnd() - 0.5) * 1.2, z: -row * SP + (rnd() - 0.5) * 1.2, h: rankH, w: 4 + rnd() * 1.6, d: 4 + rnd() * 1.6, used: false, alt: 6 + rnd() * 24, q: rnd() * 0.8 }); }
  const idx = Array.from({ length: N }, (_, i) => i); for (let i = N - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  // 81 lit: "more than 80%" drawn as 81 of 100
  idx.slice(0, 81).forEach((i) => (towers[i].used = true));
  const twM = new THREE.MeshStandardMaterial({ roughness: 0.78 });
  const I = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), twM, N); I.castShadow = I.receiveShadow = true; I.frustumCulled = false; scene.add(I);
  const white = new THREE.Color(WHT), tint = new THREE.Color(0xffb48e), cc = new THREE.Color(), dummy = new THREE.Object3D();

  // the two AI towers, front and centre: not part of the pool
  const heroTex = (name) => canvasTex(512, 2400, (g, w, h) => { g.fillStyle = "#ff5a1f"; g.fillRect(0, 0, w, h); for (let y = 30; y < h; y += 46) { for (let x = 26; x < w; x += 58) { g.fillStyle = "rgba(255,240,226,.32)"; g.fillRect(x, y, 34, 24); } } g.save(); g.translate(w / 2, h / 2); g.rotate(-Math.PI / 2); g.fillStyle = "#fff"; g.font = "900 104px 'Playfair Display',serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(name, 0, 0); g.restore(); });
  const hero = (name, x, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(7, 1, 7), (() => { const sd = new THREE.MeshStandardMaterial({ map: heroTex(name), roughness: 0.55 }), tp = std(0xff7a3f, 0.6); return [sd, sd, tp, tp, sd, sd]; })()); m.castShadow = true; m.position.set(x, 0, z); scene.add(m); return m; };
  const HA = hero("BREAK AND STEAL AN EGG", -6.4, 7), HB = hero("HUSS VALLEY", 6.4, 7);
  const egg = new THREE.Mesh(new THREE.SphereGeometry(2.3, 28, 20), std(0xffd24d, 0.32, 0.25)); egg.scale.y = 1.32; egg.castShadow = true; scene.add(egg);
  const flag = new THREE.Group(); box(0.25, 5, 0.25, std(0x333333, 0.5), 0, 2.5, 0, flag); box(3.4, 1.9, 0.1, std(0xffd24d, 0.4), 1.8, 4, 0, flag); flag.children.forEach((c) => (c.castShadow = true)); scene.add(flag);

  // top 20 line: a thin ring-plane the two towers break through
  const lineM = new THREE.MeshBasicMaterial({ color: 0x1b1a18, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
  const line20 = new THREE.Mesh(new THREE.PlaneGeometry(48, 0.22), lineM); line20.position.set(0, 20.5, 11.5); scene.add(line20);
  const lab20 = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.5), new THREE.MeshBasicMaterial({ map: canvasTex(512, 128, (g, w, h) => { g.fillStyle = "#1b1a18"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.font = "700 74px 'IBM Plex Sans',sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("TOP 20", w / 2, h / 2 + 3); }), transparent: true })); lab20.position.set(-14.5, 22.2, 11.5); lab20.scale.setScalar(0.6); scene.add(lab20);

  // visitors flow to each hero tower
  const crowd = pts(scene, 900, { color: 0x262320, size: 1.0, add: false });
  const cD = []; for (let i = 0; i < 900; i++) cD.push({ a: rnd() * 6.283, d: 40 + rnd() * 70, sp: 0.07 + rnd() * 0.12, h: i % 2, ph: rnd() });

  // x-ray overlay on the unknown: hero A shows a blueprint question
  const xray = new THREE.Mesh(new THREE.BoxGeometry(7.3, 1, 7.3), new THREE.MeshBasicMaterial({ color: 0x1b1a18, wireframe: true, transparent: true, opacity: 0.7 })); scene.add(xray);
  const q = (txt) => new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: canvasTex(256, 256, (g, w) => { g.fillStyle = "#1b1a18"; g.font = "900 200px 'Playfair Display',serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, w / 2 + 10); }), transparent: true, depthWrite: false }));
  const qA = q("?"), qB = q("?"); scene.add(qA, qB);

  // business block: three columns on a separate plinth
  const fin = new THREE.Group(); fin.position.set(0, 0, 90); scene.add(fin);
  const colDef = [[-11, 0x2d8a57, 26], [0, 0xd93a2b, 14], [11, 0xd93a2b, 9]];
  const cols = colDef.map(([x, c]) => box(7.6, 1, 7.6, std(c, 0.55), x, 0.5, 0, fin));
  const ghost = colDef.map(([x], i) => { const m = box(7.7, 1, 7.7, new THREE.MeshBasicMaterial({ color: 0x1b1a18, wireframe: true, transparent: true, opacity: 0.32 }), x, 0.5, 0, fin); return m; });

  // final: an avatar climbs the roof of the taller tower
  const H = avatar({ skin: 0xf5cd30, shirt: 0x1b1a18, pants: 0x4a4640 }); H.G.scale.setScalar(0.62); scene.add(H.G);

  const tRise = 0.3, tTop = AT["s1:besar"], tVisit = K.s3, tUsed = AT["s4:80"], tRes = K.s5, tHrs = AT["s5:Seratus"], tNo = K.s6, tFin = K.s7;
  const ROOF = 34;
  const cT = track([
    [0, 3, 34, 112, 0, 12, 0], [K.s1e, -3, 38, 118, 0, 12, 0],
    [K.s2 + 0.8, -14, 24, 96, 0, 12, 7], [K.s2e - 0.4, 14, 24, 98, 0, 12, 7],
    [K.s3 + 1, 2, 70, 70, 0, 6, 8], [K.s3e - 0.4, -6, 66, 66, 0, 6, 8],
    [K.s4 + 1, 8, 110, 80, 0, 2, -30], [K.s4e - 0.4, -8, 124, 88, 0, 2, -30],
    [K.s5 + 1, 26, 44, 88, 0, 10, -8], [K.s5e - 0.5, -24, 40, 84, 0, 10, -8],
    [K.s6 + 1, 2, 26, 76, 0, 12, 7], [K.s6e - 0.5, -2, 32, 72, 0, 12, 7],
    [K.s7 + 1, 6, 22, 90 + 72, 0, 8, 90], [K.s7e - 0.4, -6, 24, 90 + 76, 0, 8, 90],
    [K.s8 + 1.4, 18, ROOF + 12, 46, -6, ROOF - 2, 7], [K.dur, 10, ROOF + 10, 40, -6, ROOF - 2, 7],
  ]);
  const heroH = (t, target, delay) => 0.8 + (target - 0.8) * eout(clamp01((t - tRise - delay) / 1.8));

  return (t) => {
    const c = cT(t); cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]);
    // sun sweeps across the whole film: long shadows at both ends
    const sa = -1.15 + (t / K.dur) * 2.3; sun.position.set(Math.sin(sa) * 110 + c[3], 95 - Math.abs(sa) * 22, 60 + c[5]); sun.target.position.set(c[3], 0, c[5]);

    // towers: scale in row by row, tint on 80%, re-rank on "jam main"
    const reRank = ramp(t, tHrs, tHrs + 1.4) * (1 - ramp(t, tNo, tNo + 0.6));
    const tintOn = ramp(t, tUsed, tUsed + 1.6) * (1 - ramp(t, K.s5, K.s5 + 0.7));
    for (let i = 0; i < N; i++) { const w = towers[i]; const u = eout(clamp01((t + 0.5 - w.q) / 1)); const h = (w.h + (w.alt - w.h) * reRank) * u + 0.1; dummy.position.set(w.x, h / 2, w.z - 8); dummy.scale.set(w.w, h, w.d); dummy.updateMatrix(); I.setMatrixAt(i, dummy.matrix); const on = w.used ? clamp01(tintOn * 2 - w.q) : 0; cc.copy(white).lerp(tint, on); I.setColorAt(i, cc); }
    I.instanceMatrix.needsUpdate = true; I.instanceColor.needsUpdate = true;

    const hA = heroH(t, ROOF, 0.2), hB = heroH(t, 30, 0.5);
    HA.scale.y = hA; HA.position.y = hA / 2; HB.scale.y = hB; HB.position.y = hB / 2;
    egg.position.set(-7.8, hA + 2.0, 6.4); egg.rotation.y = t * 0.4; egg.visible = t > 1.2; egg.scale.setScalar(0.7); egg.scale.y = 0.92;
    flag.position.set(6.4, hB, 7); flag.visible = t > 1.5;
    const showLine = t > tTop - 0.8 && t < K.s3 + 0.6; line20.visible = lab20.visible = showLine; lab20.lookAt(cam.position); lineM.opacity = 0.85 * ramp(t, tTop - 0.8, tTop - 0.2);

    // visitors stream in with the counter beats
    const flow = ramp(t, tVisit, tVisit + 1.2) * (1 - ramp(t, K.s4, K.s4 + 0.8)) + 0.0;
    crowd.P.visible = (flow > 0.01) || t > K.s8; const fin2 = ramp(t, K.s8, K.s8 + 1);
    if (crowd.P.visible) { const f = Math.max(flow, fin2); for (let i = 0; i < 900; i++) { const q0 = cD[i], u = ((t * q0.sp + q0.ph) % 1), d = q0.d * (1 - u) * f + 5; const hx = q0.h ? 6.4 : -6.4; crowd.pos[i * 3] = hx + Math.cos(q0.a) * d; crowd.pos[i * 3 + 1] = 0.4; crowd.pos[i * 3 + 2] = 7 + Math.sin(q0.a) * d; } crowd.commit(); }

    // the unknown: wireframe veil and question marks
    const qs = ramp(t, tNo + 0.3, tNo + 0.9) * (1 - ramp(t, tFin - 0.4, tFin));
    xray.visible = qA.visible = qB.visible = qs > 0; xray.scale.set(1, hA + 0.4, 1); xray.position.set(-6.4, hA / 2, 7); xray.material.opacity = 0.7 * qs;
    qA.position.set(-6.4, 17, 10.8); qB.position.set(6.4, 15, 10.8); qA.lookAt(cam.position); qB.lookAt(cam.position); qA.scale.setScalar(qs + 0.001); qB.scale.setScalar(ramp(t, AT["s6:tidak#2"], AT["s6:tidak#2"] + 0.4) * qs + 0.001);

    // business columns
    const fT = [AT["s7:Pendapatan"], AT["s7:pemesanan"], AT["s7:saham"]], fv = [[1, 1.16], [1, 0.88], [1, 0.81]];
    const scale0 = 14; fin.visible = t > tFin - 1 && t < K.s8 + 0.6;
    cols.forEach((m, i) => { const u = eout(clamp01((t - fT[i]) / 0.7)), h = scale0 * (fv[i][0] + (fv[i][1] - fv[i][0]) * u); const g0 = scale0; m.scale.y = t < fT[i] ? scale0 : h; m.position.y = m.scale.y / 2; ghost[i].scale.y = g0; ghost[i].position.y = g0 / 2; ghost[i].visible = t > fT[i]; });

    // avatar stands on the roof, looks over, waves at the end
    H.G.visible = t > K.s8; H.G.position.set(-4.6, hA, 8); H.G.rotation.y = 0.3; restPose(H); if (t > K.s8 + 1.4) H.armR.rotation.z = 2.6 + Math.sin(t * 6) * 0.35;
    comp.render();
  };
}
