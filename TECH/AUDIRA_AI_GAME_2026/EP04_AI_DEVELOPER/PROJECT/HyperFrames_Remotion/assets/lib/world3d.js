// PAPAN SIRKUIT: a game factory on a circuit board. Three chips (RENCANA, BANGUN, TES) feed amber pulses; an obstacle course grows on the board and a test agent plays it. A fifth socket stays dark. Illustration, no Roblox assets.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, std, box, cyl, stage, avatar, runPose, restPose, envStrips, pts } from "./lib3d.js";

const AMB = 0xffa726, GRN = 0x39ff9c, RED = 0xff3b47;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x04100c, fog: 0.0052, exp: 1.25, bloom: [0.3, 0.5, 0.9] });
  envStrips(r, scene, [[26, 4, 0xfff0d0, 3, 0, 18, 6], [4, 20, AMB, 2.4, -16, 6, 4], [4, 20, GRN, 1.6, 16, 6, 4]]);
  scene.add(new THREE.HemisphereLight(0x9fcab6, 0x0a2018, 1.7));
  const key = new THREE.DirectionalLight(0xfff2dc, 3.0); key.position.set(-12, 30, 18); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, far: 120 }); key.shadow.bias = -0.0006; scene.add(key);
  const rnd = mulberry(4404);

  // station layout on the board
  const ST = { plan: [-18, 0, 18], build: [0, 0, -2], test: [18, 0, 18], grid: [-34, 0, -44], gauge: [34, 0, -44], sock: [0, 0, 44] };

  // PCB floor with hand-routed copper
  const routes = [[ST.plan, ST.build], [ST.build, ST.test], [ST.test, ST.plan]];
  const S = 2048, W = 180, toPx = (x, z) => [(x / W + 0.5) * S, (z / W + 0.5) * S];
  const pcb = canvasTex(S, S, (g) => {
    g.fillStyle = "#114634"; g.fillRect(0, 0, S, S);
    g.strokeStyle = "rgba(255,178,70,.42)"; g.lineWidth = 3; g.lineCap = "round"; g.lineJoin = "round";
    for (let i = 0; i < 260; i++) { let x = rnd() * S, y = rnd() * S; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { const d = 40 + rnd() * 160; if (k % 2) y += d * (rnd() > 0.5 ? 1 : -1); else x += d * (rnd() > 0.5 ? 1 : -1); g.lineTo(x, y); g.lineTo(x + 18, y + 18); x += 18; y += 18; } g.stroke(); g.fillStyle = "#b98a3a"; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
    g.strokeStyle = "rgba(255,190,90,.8)"; g.lineWidth = 9;
    routes.forEach(([a, b]) => { const [x0, y0] = toPx(a[0], a[2]), [x1, y1] = toPx(b[0], b[2]); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.lineTo(x1, y1); g.stroke(); });
    for (let i = 0; i < 90; i++) { g.fillStyle = i % 2 ? "#c9c2ae" : "#17211c"; g.fillRect(rnd() * S, rnd() * S, 16 + rnd() * 20, 8 + rnd() * 8); }
  });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, W), new THREE.MeshStandardMaterial({ map: pcb, roughness: 0.38, metalness: 0.25, envMapIntensity: 0.4 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);

  // chip factory
  const chip = (pos, name, col) => {
    const G = new THREE.Group(); G.position.set(pos[0], 0, pos[2]); scene.add(G);
    const pkg = box(11, 1.4, 11, std(0x14171a, 0.42, 0.55), 0, 0.9, 0, G);
    const pin = std(0xd9b24a, 0.3, 0.95);
    for (let i = 0; i < 9; i++) for (const s of [-1, 1]) { box(0.55, 0.2, 1.2, pin, -4.4 + i * 1.1, 0.15, s * 6, G); box(1.2, 0.2, 0.55, pin, s * 6, 0.15, -4.4 + i * 1.1, G); }
    const tx = canvasTex(512, 512, (g, w) => { g.fillStyle = "#14171a"; g.fillRect(0, 0, w, w); g.strokeStyle = "#3a4046"; g.lineWidth = 6; g.strokeRect(24, 24, w - 48, w - 48); g.fillStyle = "#" + col.toString(16).padStart(6, "0"); g.font = "700 76px 'Chakra Petch',sans-serif"; g.textAlign = "center"; g.fillText(name, w / 2, w / 2 + 26); g.fillStyle = "#5e666c"; g.font = "500 30px 'IBM Plex Mono',monospace"; g.fillText("AGEN AI", w / 2, w / 2 + 84); });
    const top = new THREE.Mesh(new THREE.PlaneGeometry(10.6, 10.6), new THREE.MeshStandardMaterial({ map: tx, emissiveMap: tx, emissive: 0xffffff, emissiveIntensity: 0.25, roughness: 0.4 })); top.rotation.x = -Math.PI / 2; top.position.y = 1.62; G.add(top);
    return { G, top };
  };
  const chips = { plan: chip(ST.plan, "RENCANA", AMB), build: chip(ST.build, "BANGUN", AMB), test: chip(ST.test, "TES", GRN) };

  // pulses running the plan-build-test loop
  const pulses = pts(scene, 60, { color: AMB, size: 1.1 });
  const pathPts = routes.map(([a, b]) => [[a[0], a[2]], [b[0], a[2]], [b[0], b[2]]]);
  const along = (u) => { u = ((u % 3) + 3) % 3; const i = Math.floor(u), f = u - i, p = pathPts[i], d1 = Math.hypot(p[1][0] - p[0][0], p[1][1] - p[0][1]), d2 = Math.hypot(p[2][0] - p[1][0], p[2][1] - p[1][1]), L = d1 + d2, s = f * L; if (s < d1) { const q = d1 ? s / d1 : 0; return [p[0][0] + (p[1][0] - p[0][0]) * q, p[0][1] + (p[1][1] - p[0][1]) * q]; } const q = d2 ? (s - d1) / d2 : 0; return [p[1][0] + (p[2][0] - p[1][0]) * q, p[1][1] + (p[2][1] - p[1][1]) * q]; };

  // spec sheet: 5 tiles rise over the plan chip
  const specTiles = ["5 BAGIAN", "TITIK SIMPAN", "3 RINTANGAN", "ALUR MAIN", "KONTROL"].map((t, i) => { const tx = canvasTex(512, 96, (g, w, h) => { g.fillStyle = "#14171a"; g.fillRect(0, 0, w, h); g.fillStyle = "#ffa726"; g.fillRect(0, 0, 14, h); g.fillStyle = "#ffe3ad"; g.font = "700 54px 'Chakra Petch',sans-serif"; g.textBaseline = "middle"; g.fillText(t, 36, h / 2 + 3); }); const m = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.32), new THREE.MeshBasicMaterial({ map: tx, transparent: true, toneMapped: false })); scene.add(m); return { m, i }; });

  // obstacle course on the build chip: floating platforms in five sections
  const secs = [], mats = [0xe8dcc0, 0xffc46b, 0xe8dcc0, 0xffc46b, 0xe8dcc0];
  const course = new THREE.Group(); course.position.set(ST.build[0], 0, ST.build[2]); scene.add(course);
  const pad = (x, y, z, w, d, c) => { const m = box(w, 0.7, d, std(c, 0.42, 0.15), x, y, z, course); return m; };
  const P = [[0, 3, 15, 8, 6], [0, 4.2, 7, 5, 4], [-3, 5.4, 1, 4, 4], [3, 6.6, -5, 4, 4], [0, 7.8, -11, 7, 4], [-3.5, 9, -17, 4, 4], [3.5, 10.2, -22, 4, 4], [0, 11.4, -28, 8, 6]];
  const parts = P.map((p, i) => ({ m: pad(p[0], p[1], p[2], p[3], p[4], mats[Math.min(4, Math.floor(i * 0.65))]), y: p[1], i }));
  const hazards = [[0, 5.6, 7, 0], [0, 9, -11, 1], [0, 12.6, -28, 2]].map(([x, y, z, q]) => { const m = box(6.2, 0.5, 0.5, new THREE.MeshStandardMaterial({ color: RED, emissive: RED, emissiveIntensity: 1.1 }), x, y, z, course); return { m, x, y, z, q }; });
  const flags = [1, 4, 7].map((i) => { const p = P[i]; const f = box(0.25, 3, 0.25, std(0xdddddd, 0.3, 0.7), p[0] - 1.5, p[1] + 1.7, p[2], course); const b = box(1.5, 0.9, 0.08, new THREE.MeshStandardMaterial({ color: GRN, emissive: GRN, emissiveIntensity: 0.8 }), p[0] - 0.7, p[1] + 2.7, p[2], course); return { f, b, i }; });

  // test agent
  const A = avatar({ skin: 0xb9c4c8, shirt: 0x39d98a, pants: 0x20604a }); A.G.scale.setScalar(0.8); course.add(A.G);
  const ticks = pts(scene, 40, { color: GRN, size: 0.7 });

  // 1000 creators as LEDs: 440 lit
  const led = new THREE.InstancedMesh(new THREE.BoxGeometry(0.62, 0.4, 0.62), new THREE.MeshStandardMaterial({ roughness: 0.4 }), 1000); led.frustumCulled = false; scene.add(led);
  const order = Array.from({ length: 1000 }, (_, i) => i); for (let i = 999; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const rank = new Int32Array(1000); order.forEach((v, i) => (rank[v] = i));
  const dummy = new THREE.Object3D(), offC = new THREE.Color(0x24483b), onC = new THREE.Color(AMB).multiplyScalar(1.25), cc = new THREE.Color();
  for (let i = 0; i < 1000; i++) { const row = Math.floor(i / 25), col = i % 25; dummy.position.set(ST.grid[0] - 11.4 + col * 0.95, 0.3, ST.grid[2] - 19 + row * 0.95); dummy.updateMatrix(); led.setMatrixAt(i, dummy.matrix); led.setColorAt(i, offC); }

  // gauges: four dials at zero
  const gaugeNames = ["PROGRES", "MAIN ULANG", "PILIHAN", "DAYA TARIK"];
  const gauges = gaugeNames.map((nm, i) => {
    const G = new THREE.Group(); G.position.set(ST.gauge[0] + (i % 2 ? 5.2 : -5.2), 0, ST.gauge[2] + (i < 2 ? -4 : 4.8)); scene.add(G);
    cyl(4.2, 4.5, 0.8, 40, std(0x14171a, 0.4, 0.6), 0, 0.5, 0, G);
    const tx = canvasTex(512, 512, (g, w) => { g.clearRect(0, 0, w, w); g.strokeStyle = "#ffa726"; g.lineWidth = 22; g.beginPath(); g.arc(w / 2, w / 2, 200, Math.PI * 0.8, Math.PI * 2.2); g.stroke(); g.fillStyle = "#ffe3ad"; g.font = "700 56px 'Chakra Petch',sans-serif"; g.textAlign = "center"; g.fillText(nm, w / 2, 400); });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshBasicMaterial({ map: tx, transparent: true, toneMapped: false })); face.rotation.x = -Math.PI / 2; face.position.y = 0.95; G.add(face);
    const nd = new THREE.Group(); nd.position.y = 1.05; G.add(nd); box(0.3, 0.14, 3, new THREE.MeshBasicMaterial({ color: new THREE.Color(RED).multiplyScalar(1.3) }), 0, 0, -1.5, nd);
    return { G, nd };
  });

  // empty socket: the hook that no agent supplied
  const sock = new THREE.Group(); sock.position.set(ST.sock[0], 0, ST.sock[2]); scene.add(sock);
  const rim = std(0x8a9296, 0.45, 0.6); box(11, 0.8, 1, rim, 0, 0.45, -5.5, sock); box(11, 0.8, 1, rim, 0, 0.45, 5.5, sock); box(1, 0.8, 11, rim, -5.5, 0.45, 0, sock); box(1, 0.8, 11, rim, 5.5, 0.45, 0, sock);
  const hint = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ map: canvasTex(512, 512, (g, w) => { g.fillStyle = "#04100c"; g.fillRect(0, 0, w, w); g.fillStyle = "#39ff9c"; g.font = "700 280px 'Chakra Petch',sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("?", w / 2, w / 2 + 14); }), toneMapped: false })); hint.rotation.x = -Math.PI / 2; hint.position.y = 0.12; sock.add(hint);
  const H = avatar({ skin: 0xf5cd30, shirt: 0xff8f1f, pants: 0x394a59 }); H.G.scale.setScalar(0.7); H.G.position.set(-8, 0, 7); scene.add(H.G);

  const tTest = K.s5, tLoop = K.s6;
  const cT = track([
    [0, 9, 34, 44, 0, 8, -8], [K.s1e, 6, 30, 40, 0, 8, -8],
    [K.s2 + 0.8, 0, 30, 40, 0, 2, 8], [K.s2e - 0.4, 4, 34, 44, 0, 2, 8],
    [K.s3 + 0.9, ST.plan[0] - 9, 18, ST.plan[2] + 26, ST.plan[0], 3.4, ST.plan[2]], [K.s3e - 0.4, ST.plan[0] + 7, 17, ST.plan[2] + 25, ST.plan[0], 3.4, ST.plan[2]],
    [K.s4 + 1, 14, 30, 42, 0, 7, -6], [K.s4e - 0.4, -12, 30, 42, 0, 7, -6],
    [K.s5 + 1, 14, 22, 38, 0, 6, 4], [K.s5 + (K.s5e - K.s5) * 0.55, -16, 26, 20, 0, 9, -12], [K.s5e - 0.4, 14, 28, 2, 0, 12, -26],
    [K.s6 + 1.1, ST.grid[0] + 3, 24, ST.grid[2] + 20, ST.grid[0], 0, ST.grid[2] - 1], [K.s6e - 0.5, ST.grid[0] - 3, 28, ST.grid[2] + 22, ST.grid[0], 0, ST.grid[2] - 1],
    [K.s7 + 1.1, ST.gauge[0] + 3, 42, ST.gauge[2] + 30, ST.gauge[0], 0, ST.gauge[2] - 1], [K.s7e - 0.5, ST.gauge[0] - 3, 38, ST.gauge[2] + 28, ST.gauge[0], 0, ST.gauge[2] - 1],
    [K.s8 + 1.1, 3, 25, ST.sock[2] + 27, -2.5, 1, ST.sock[2]], [K.dur, -6, 22, ST.sock[2] + 24, -2.5, 1, ST.sock[2]],
  ]);

  // test run: position along the course as a function of progress; the agent falls once and respawns
  const run = (u) => { const n = P.length - 1, f = clamp01(u) * n, i = Math.min(n - 1, Math.floor(f)), q = f - i, a = P[i], b = P[i + 1]; const arc = Math.sin(q * Math.PI) * 2.2; return [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q + 0.35 + arc, a[2] + (b[2] - a[2]) * q]; };
  const tJump = AT["s5:Melompat"], tHit = AT["s5:rintangan"], tFall = AT["s5:jatuh"], tUp = AT["s5:bangkit"], tEnd = AT["s5:Nol"];

  return (t) => {
    const c = cT(t); cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]);

    // loop pulses only once the team is working
    const active = t > K.s2;
    for (let i = 0; i < 60; i++) { const [x, z] = active ? along(t * 0.22 + i * 0.05) : [0, -300]; pulses.pos[i * 3] = x; pulses.pos[i * 3 + 1] = 0.25; pulses.pos[i * 3 + 2] = z; } pulses.commit();
    const hot = (a, b) => (t > a && t < b ? 1 : 0.25);
    chips.plan.top.material.emissiveIntensity = hot(K.s3, K.s4); chips.build.top.material.emissiveIntensity = hot(K.s4, K.s5); chips.test.top.material.emissiveIntensity = hot(K.s5, K.s6);

    specTiles.forEach(({ m, i }) => { const q = back(clamp01((t - AT["s3:spesifikasi"] - 0.1 - i * 0.55) / 0.3), 2); m.visible = q > 0 && t < K.s4 + 0.1; m.position.set(ST.plan[0], 3.2 + (4 - i) * 1.55 + (1 - q) * -2, ST.plan[2] + 2); m.lookAt(cam.position); m.scale.setScalar(q + 0.001); });

    // course grows during BUILD; it is already complete in the cold open
    const open = t < K.s2 - 0.1;
    parts.forEach((p) => { const q = open ? 1 : eout(clamp01((t - AT["s4:Kode"] - p.i * 0.28) / 0.4)); p.m.scale.set(Math.max(0.001, q), Math.max(0.001, q), Math.max(0.001, q)); p.m.position.y = p.y * q; p.m.visible = q > 0.01; });
    const cOn = open || t > AT["s4:Kode"] + 2.2;
    hazards.forEach((h) => { h.m.visible = cOn; h.m.rotation.y = t * (1.6 + h.q * 0.4); h.m.position.x = h.x; });
    flags.forEach((f) => { const ok = open || t > AT["s4:Kode"] + f.i * 0.3; f.f.visible = f.b.visible = ok; f.b.material.emissiveIntensity = t > tEnd ? 0.7 : 0.35; });

    // the agent: hook run plays fast; test beat plays the whole course
    A.G.visible = open || t > tTest - 0.3 && t < K.s6 + 0.5;
    let u = 0, fall = 0;
    if (open) u = clamp01(t / (K.s1e + 0.1));
    else if (t < tUp) { u = clamp01((t - tTest) / (tFall - tTest)) * 0.6; const fq = clamp01((t - tFall) / 0.45); fall = fq * fq * 13; if (t > tFall + 0.5) { u = 0.42; fall = 13; } } else { u = 0.42 + 0.58 * clamp01((t - tUp) / (K.s5e - tUp - 0.2)); }
    const pp = run(u); A.G.position.set(pp[0], pp[1] - fall, pp[2]);
    const mv = u < 0.999 && !(t > tFall + 0.5 && t < tUp);
    A.G.rotation.y = Math.PI; if (mv) runPose(A, t * 11); else restPose(A);
    if (t > tHit && t < tHit + 0.25) A.G.position.x += Math.sin(t * 60) * 0.3;

    // completion sparkles at the end of the course
    const tk = clamp01((t - tEnd) / 1.2) * (t < K.s6 ? 1 : 0); ticks.P.visible = tk > 0; if (tk > 0) { for (let i = 0; i < 40; i++) { const an = i * 0.7, rr = tk * (1.5 + (i % 7)); ticks.pos[i * 3] = Math.cos(an) * rr; ticks.pos[i * 3 + 1] = 12 + (i % 5) * tk * 1.3; ticks.pos[i * 3 + 2] = -30 + Math.sin(an) * rr; } ticks.commit(); ticks.m.opacity = 1 - tk * 0.6; }

    // LEDs
    const tL = AT["s6:44"]; const lit = t > tL ? Math.floor(440 * eout(clamp01((t - tL) / 1.6))) : 0;
    if (t > K.s6 - 0.5 && t < K.s7 + 0.5) { for (let i = 0; i < 1000; i++) { cc.copy(rank[i] < lit ? onC : offC); led.setColorAt(i, cc); } led.instanceColor.needsUpdate = true; }

    // gauges sweep then drop to zero one by one
    gauges.forEach((g, i) => { const k = AT["s7:progres"] + i * 0.55; const v = 1 - ramp(t, k, k + 0.4); g.nd.rotation.y = 2.2 - v * 4.4 * (0.55 + 0.35 * Math.sin(t * 2 + i)); });

    // the human walks to the empty socket
    const hw = clamp01((t - K.s8) / 2.4); H.G.visible = t > K.s8 - 0.2; H.G.position.set(-9.5 + 2.5 * hw, 0, 6 - 4 * hw + ST.sock[2]); H.G.rotation.y = 1.3; if (hw < 1) runPose(H, t * 8, 0.75); else { restPose(H); H.armR.rotation.z = 0.15; H.head.rotation.x = 0.3; }
    hint.material.opacity = 1; hint.material.color.setScalar(0.45 + 0.55 * Math.abs(Math.sin(t * 2.4)));
    comp.render();
  };
}
