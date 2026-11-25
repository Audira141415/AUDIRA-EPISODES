// SATU KALIMAT: a phone lies on a sunny wooden table and the game grows out of its screen, brick by brick. Illustration, no Roblox assets. Every value is a function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, std, box, cyl, stage, avatar, runPose, restPose, label } from "./lib3d.js";

const U = 0.5, BH = 0.36, TOP = 0.62;
const C = { grass: 0x58b84a, grass2: 0x4aa83f, path: 0xd9c9a0, leaf: 0x2f9e4f, leaf2: 0x3cb860, trunk: 0x8a5a33, log: 0x7a4a26, red: 0xe5392f, yel: 0xffc61a, blu: 0x1f7ae0, wht: 0xf7f3e8, pink: 0xff7ab8 };

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xe9d2a6, exp: 1.08, bloom: [0.03, 0.3, 0.99] });
  scene.add(new THREE.HemisphereLight(0xfff6e4, 0xb88a55, 1.5));
  const sun = new THREE.DirectionalLight(0xfff0d2, 3.0); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 140 }); sun.shadow.bias = -0.0006; sun.shadow.radius = 5;
  scene.add(sun, sun.target);
  const rnd = mulberry(1101);

  // table
  const wood = canvasTex(1024, 1024, (g, w, h) => { g.fillStyle = "#c98f55"; g.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? "#c58a50" : "#cf965b"; g.fillRect((i * w) / 6, 0, w / 6, h); g.fillStyle = "rgba(70,38,12,.55)"; g.fillRect((i * w) / 6, 0, 3, h); } for (let i = 0; i < 520; i++) { const x = rnd() * w; g.strokeStyle = `rgba(90,52,20,${0.05 + rnd() * 0.12})`; g.lineWidth = 1 + rnd() * 2; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 10 * rnd(), h * 0.3, x - 12 * rnd(), h * 0.6, x + 6 * rnd(), h); g.stroke(); } }, [7, 7]);
  const tbl = new THREE.Mesh(new THREE.PlaneGeometry(320, 320), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.55 })); tbl.rotation.x = -Math.PI / 2; tbl.position.z = 30; tbl.receiveShadow = true; scene.add(tbl);

  // phone
  const ph = new THREE.Group(); scene.add(ph);
  box(10.2, 0.56, 20.2, std(0x1c1f26, 0.28, 0.8), 0, 0.3, 0, ph);
  const scr = document.createElement("canvas"); scr.width = 540; scr.height = 1080; const sg = scr.getContext("2d");
  const scrT = new THREE.CanvasTexture(scr); scrT.colorSpace = THREE.SRGBColorSpace; scrT.anisotropy = 8;
  const scrM = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 19.6), new THREE.MeshBasicMaterial({ map: scrT, color: 0xdddddd, toneMapped: false })); scrM.rotation.x = -Math.PI / 2; scrM.position.y = 0.6; ph.add(scrM);
  const PROMPT = "game petualangan santai di hutan lebat, dengan banyak rintangan";
  let lastKey = "";
  const wrap = (txt, n) => { const out = []; let cur = ""; for (const w of txt.split(" ")) { if ((cur + " " + w).trim().length > n) { out.push(cur); cur = w; } else cur = (cur + " " + w).trim(); } if (cur) out.push(cur); return out; };
  const paintScreen = (txt, caret, send, status) => {
    const key = txt + caret + send + status; if (key === lastKey) return; lastKey = key;
    const g = sg; g.fillStyle = "#14161c"; g.fillRect(0, 0, 540, 1080);
    g.fillStyle = "#fff"; g.font = "700 40px Fredoka,sans-serif"; g.textAlign = "left"; g.fillText("Buat game baru", 40, 120);
    g.fillStyle = "#8a93a6"; g.font = "500 26px Nunito,sans-serif"; g.fillText("ilustrasi antarmuka", 40, 160);
    if (status) { g.fillStyle = "#ffc61a"; g.beginPath(); g.roundRect(40, 210, 460, 68, 34); g.fill(); g.fillStyle = "#14161c"; g.font = "700 30px Fredoka,sans-serif"; g.fillText(status, 66, 254); }
    [["#3cb860","Hutan"],["#1f7ae0","Lompat"],["#e5392f","Balap"],["#ffc61a","Harta"]].forEach(([c,l],i)=>{const x=40+(i%2)*240,yy=300+Math.floor(i/2)*150;g.fillStyle=c;g.beginPath();g.roundRect(x,yy,220,130,20);g.fill();g.fillStyle=i===3?"#14161c":"#fff";g.font="700 34px Fredoka,sans-serif";g.fillText(l,x+22,yy+80);});
    const ls = wrap(txt + (caret ? "|" : ""), 21), bh = 74 + ls.length * 48, y = 620;
    g.fillStyle = "#f2efe6"; g.beginPath(); g.roundRect(40, y, 460, bh, 30); g.fill();
    g.fillStyle = "#14161c"; g.font = "600 36px Nunito,sans-serif"; ls.forEach((l, i) => g.fillText(l, 66, y + 58 + i * 48));
    if (send) { g.fillStyle = "#1f7ae0"; g.beginPath(); g.arc(462, y + bh - 42, 28, 0, 7); g.fill(); g.fillStyle = "#fff"; g.font = "700 34px sans-serif"; g.textAlign = "center"; g.fillText("↑", 462, y + bh - 30); }
    scrT.needsUpdate = true;
  };

  // brick pool: everything in the game world is one instanced studded brick
  const list = [];
  const add = (ix, iy, iz, c, t0, group = 0) => list.push({ x: ix * U, y: TOP + BH / 2 + iy * BH, z: iz * U, c: new THREE.Color(c), t0: t0 + rnd() * 0.25, group, sx: (rnd() - 0.5) * 3 });
  const tD = AT["s4:dunia"], tK = AT["s4:kode"], tP = AT["s4:tampilan"], tS = AT["s4:suara"], tR = AT["s5:Hasilnya"], tU = AT["s5:diubah"];
  for (let i = -9; i <= 9; i++) for (let j = -19; j <= 19; j++) {
    const onPath = Math.abs(i - Math.round(Math.sin(j * 0.32) * 2.5)) <= 1;
    if (onPath) add(i, 0, j, C.path, tK + (19 - j) * 0.03, 1);
    else add(i, 0, j, (i + j) % 2 ? C.grass : C.grass2, tD + (Math.abs(i) + Math.abs(j)) * 0.022, 2);
  }
  const trees = [[-7, 14], [7, 11], [-6, 5], [7, 2], [-7, -4], [6, -7], [-6, -13], [7, -15], [-8, -9], [8, -11], [-8, 9]];
  const leafIdx = [];
  trees.forEach(([x, z], q) => { const b = tD + 0.35 + q * 0.08, tall = 2 + (q % 3); for (let y = 1; y <= tall; y++) add(x, y, z, C.trunk, b + y * 0.03, 3); for (let y = tall + 1; y <= tall + 4; y++) { const rad = y < tall + 3 ? 2 : 1; for (let dx = -rad; dx <= rad; dx++) for (let dz = -rad; dz <= rad; dz++) { if (Math.abs(dx) + Math.abs(dz) > rad + 1) continue; leafIdx.push(list.length); add(x + dx, y, z + dz, q % 2 ? C.leaf : C.leaf2, b + 0.1 + y * 0.03, 4); } } });
  const logsZ = [10, 2, -6];
  logsZ.forEach((j, q) => { for (let dx = -2; dx <= 2; dx++) add(Math.round(Math.sin(j * 0.32) * 2.5) + dx, 1, j, C.log, AT["s5:mainkan"] - 1.4 + q * 0.12, 5); });
  // change request: bridge coins appear when the player asks
  const coinsZ = [14, 6, -2, -10, -16]; coinsZ.forEach((j, q) => add(Math.round(Math.sin(j * 0.32) * 2.5), 3, j, C.yel, tU + q * 0.1, 6));
  const flowers = []; for (let k = 0; k < 40; k++) { const i = Math.round(rnd() * 18 - 9), j = Math.round(rnd() * 38 - 19); if (Math.abs(i - Math.sin(j * 0.32) * 2.5) < 3) continue; flowers.push([i, j]); add(i, 1, j, [C.red, C.yel, C.pink, C.wht][k % 4], tP + rnd() * 0.5, 7); }
  // sound: little note columns hop on "suara"
  const notes = [[-3, -17], [3, -17], [0, 17]];
  notes.forEach(([x, z], q) => { for (let y = 1; y <= 3; y++) add(x, y, z, C.blu, tS + q * 0.12 + y * 0.04, 8); add(x + 1, 3, z, C.blu, tS + q * 0.12 + 0.2, 8); });
  // the "basic game" plate: small, finished, deliberately plain
  const baseZ = Math.round((74 - 15) / U), bt = K.s7 + 0.5;
  for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) add(i, -1.7, baseZ + j, (i + j) % 2 ? C.grass : C.grass2, bt + (Math.abs(i) + Math.abs(j)) * 0.03, 9);
  for (let y = -1; y <= 1; y++) add(-3, y, baseZ - 2, C.trunk, bt + 0.5, 9);
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) add(-3 + dx, 2, baseZ - 2 + dz, C.leaf, bt + 0.6, 9);
  for (let y = -1; y <= 3; y++) add(3, y, baseZ + 1, C.wht, bt + 0.7, 9);
  add(4, 3, baseZ + 1, C.red, bt + 0.9, 9); add(4, 2, baseZ + 1, C.red, bt + 0.9, 9);
  // burst bricks in the hook
  const hook = []; for (let i = 0; i < 240; i++) hook.push([rnd() * 8 - 4, rnd() * 14 - 7, rnd() * 6.283, 4 + rnd() * 8, rnd() * 0.5]);
  const N = list.length + hook.length;
  const bG = new THREE.BoxGeometry(U * 0.97, BH * 0.97, U * 0.97), sG = new THREE.CylinderGeometry(U * 0.28, U * 0.28, BH * 0.34, 12);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.32, metalness: 0.02 });
  const IB = new THREE.InstancedMesh(bG, mat, N), IS = new THREE.InstancedMesh(sG, mat, N);
  IB.castShadow = IS.castShadow = IB.receiveShadow = true; IB.frustumCulled = IS.frustumCulled = false; scene.add(IB, IS);
  const hookC = [C.red, C.yel, C.blu, C.grass, C.wht];
  list.forEach((b, i) => { IB.setColorAt(i, b.c); IS.setColorAt(i, b.c); });
  hook.forEach((b, i) => { const c = new THREE.Color(hookC[i % 5]); IB.setColorAt(list.length + i, c); IS.setColorAt(list.length + i, c); });

  // spec sheet that floats up on "rencananya"
  const specT = canvasTex(512, 720, (g, w, h) => { g.fillStyle = "#fbf7ea"; g.fillRect(0, 0, w, h); g.fillStyle = "#1f2a44"; g.font = "700 46px Fredoka,sans-serif"; g.fillText("RENCANA GAME", 34, 76); g.fillStyle = "#e5392f"; g.fillRect(34, 92, 180, 8); g.font = "600 32px Nunito,sans-serif"; ["Tema: hutan lebat", "Tujuan: sampai ujung", "Rintangan: batang kayu", "Kontrol: sentuh layar", "Suasana: santai"].forEach((s, i) => { g.fillStyle = "#1f7ae0"; g.fillRect(34, 150 + i * 96, 34, 34); g.fillStyle = "#fff"; g.fillText("✓", 37, 178 + i * 96); g.fillStyle = "#1f2a44"; g.fillText(s, 84, 178 + i * 96); }); g.fillStyle = "#8a93a6"; g.font = "500 24px Nunito,sans-serif"; g.fillText("contoh ilustrasi", 34, 680); });
  const spec = new THREE.Mesh(new THREE.BoxGeometry(8, 11.2, 0.06), [0, 0, 0, 0, 0, 0].map((_, i) => (i === 4 ? new THREE.MeshBasicMaterial({ map: specT, toneMapped: false }) : std(0xbdb9ad, 0.8)))); spec.castShadow = true; scene.add(spec);

  // hero
  const H = avatar({ skin: 0xf5cd30, shirt: 0x1f7ae0, pants: 0x3a9a48 }); H.G.scale.setScalar(0.42); scene.add(H.G);

  // table clutter gives the sunlit depth
  const mug = new THREE.Group(); mug.position.set(-11, 0, -14); scene.add(mug); cyl(2.3, 2, 4.8, 32, std(0xf4efe0, 0.3), 0, 2.4, 0, mug); const tor = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.28, 12, 28), std(0xf4efe0, 0.3)); tor.position.set(2.6, 2.5, 0); tor.castShadow = true; mug.add(tor);
  const pen = cyl(0.32, 0.32, 15, 8, std(0xf2b632, 0.45), 10.5, 0.34, 3); pen.rotation.set(Math.PI / 2, 0, 0.35);
  const pile = []; for (let i = 0; i < 26; i++) { const m = box(1 + (i % 2), 0.6, 1, std(hookC[i % 5], 0.3), 9 + rnd() * 5 - 2, 0.32, 14 + rnd() * 9 - 2); m.rotation.y = rnd() * 3; pile.push(m); }

  // crowd: 100 small players, 71 of them new to the editor
  const crowdZ = 42, crowd = [];
  const hBox = new THREE.BoxGeometry(0.8, 0.8, 0.8), tBox = new THREE.BoxGeometry(1, 1.1, 0.6);
  const cMat = new THREE.MeshStandardMaterial({ roughness: 0.4 });
  const IH = new THREE.InstancedMesh(hBox, cMat, 100), IT = new THREE.InstancedMesh(tBox, cMat, 100);
  IH.castShadow = IT.castShadow = true; IH.frustumCulled = IT.frustumCulled = false; scene.add(IH, IT);
  const shirts = [0xe5392f, 0x1f7ae0, 0x3a9a48, 0xff7ab8, 0xff8a1a];
  const order = Array.from({ length: 100 }, (_, i) => i); for (let i = 99; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  for (let i = 0; i < 100; i++) { const x = (i % 10 - 4.5) * 1.5, z = crowdZ + (Math.floor(i / 10) - 4.5) * 1.55; crowd.push({ x, z, fresh: order.indexOf(i) < 71, s: shirts[i % 5], ph: rnd() * 6.28, d: Math.hypot(x, z - crowdZ) * 0.03 }); }
  const grey = new THREE.Color(0x8d8778), cc = new THREE.Color();

  // availability tiles
  const tileZ = 74, tiles = [];
  [["Selandia", "SELANDIA BARU", "NZ"], ["Singapura", "SINGAPURA", "SG"], ["Serbia", "SERBIA", "RS"], ["Thailand", "THAILAND", "TH"], ["Indonesia", "INDONESIA", "?"]].forEach(([w, nm, code], i) => {
    const on = code !== "?";
    const G = new THREE.Group(); const tx = canvasTex(512, 256, (g, W, Hh) => { g.fillStyle = on ? "#ffc61a" : "#b9b2a3"; g.fillRect(0, 0, W, Hh); g.fillStyle = "#1f2a44"; g.font = "700 120px Fredoka,sans-serif"; g.textAlign = "center"; g.fillText(code, W / 2, 128); g.font = "600 44px Nunito,sans-serif"; g.fillText(nm, W / 2, 206); });
    const m = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.6, 2.6), [0, 0, 1, 0, 0, 0].map((_, k) => (k === 2 ? new THREE.MeshStandardMaterial({ map: tx, roughness: 0.4 }) : std(on ? 0xd9a60f : 0x8d8778, 0.4)))); m.castShadow = true; G.add(m);
    G.position.set(i === 4 ? 0 : i % 2 ? 2.85 : -2.85, 0.32, tileZ + (i === 4 ? 3.3 : Math.floor(i / 2) * 3.3 - 3.3)); scene.add(G); tiles.push({ G, t: AT["s7:" + w] });
  });

  // camera: px py pz lx ly lz
  const c0 = track([
    [0, 0, 31, 13, 0, 0, 0.5], [K.s1e, 0, 29, 15, 0, 0, 0], [K.s2e - 0.4, 3, 33, 19, 0, 0, 0.5], [K.s3e - 0.4, -3, 26, 15, 0, 0, 1.5],
    [AT["s4:Baru"], 2, 28, 17, 0, 3, 1], [K.s4e - 0.5, -9, 25, 22, 0, 0.5, 1], [K.s5 + 2, 4, 15, 20, 0, 1, 5], [K.s5e - 0.6, -5, 17, 2, 0, 1, -8],
    [K.s6 + 1.2, 0, 26, crowdZ + 12, 0, 0, crowdZ - 2], [K.s6e - 0.4, 2, 28, crowdZ + 15, 0, 0, crowdZ - 1],
    [K.s7 + 1.2, 2, 13, tileZ - 7, 0, 0, tileZ - 15], [AT["s7:Selandia"] - 1.5, -2, 12, tileZ - 7.5, 0, 0, tileZ - 15], [AT["s7:Selandia"] - 0.1, 0, 18, tileZ + 10, 0, 0, tileZ - 0.5], [K.s7e - 0.6, -1, 20, tileZ + 12, 0, 0, tileZ],
    [K.s8 + 1.4, 9, 26, 23, 0, 1, 0], [K.dur, -7, 33, 26, 0, 1, 0],
  ]);
  const zPath = (j) => Math.sin(j * 0.32) * 2.5 * U;
  const dummy = new THREE.Object3D();

  return (t) => {
    const p = c0(t); cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]);
    sun.position.set(p[3] + 24, 46, p[5] + 18); sun.target.position.set(p[3], 0, p[5]);

    // screen copy
    const n1 = "buat game pertamaku";
    let txt = n1.slice(0, Math.floor(clamp01(t / 1.6) * n1.length)), caret = Math.floor(t * 3) % 2 === 0, send = t > 1.6, st = "";
    if (t >= K.s2) { txt = ""; send = false; st = "Tab Build, langsung di HP"; }
    if (t >= K.s3) { txt = PROMPT.slice(0, Math.floor(clamp01((t - K.s3) / (K.s3e - K.s3 - 0.5)) * PROMPT.length)); st = ""; send = t > K.s3e - 0.5; }
    if (t >= K.s4) { txt = PROMPT; caret = false; st = "AI sedang membuat..."; send = false; }
    paintScreen(txt, caret, send, st);

    // bricks
    const hb = AT["s1:game"], hi = list.length;
    list.forEach((b, i) => {
      const u = clamp01((t - b.t0) / 0.36);
      if (u <= 0) { dummy.position.set(0, -50, 0); dummy.scale.setScalar(0.001); }
      else { const e = eout(u); dummy.position.set(b.x + (1 - e) * b.sx, b.y + (1 - e) * 9 + (u < 1 ? Math.sin(u * 3.14) * 0.15 : 0), b.z); dummy.scale.setScalar(u < 1 ? 0.6 + 0.4 * back(u, 2.2) : 1); }
      dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); IB.setMatrixAt(i, dummy.matrix);
      dummy.position.y += BH * 0.6; dummy.updateMatrix(); IS.setMatrixAt(i, dummy.matrix);
    });
    hook.forEach((b, i) => {
      const u = clamp01((t - hb - b[4]) / 1.5);
      if (u <= 0 || t > K.s2 + 0.2) { dummy.position.set(0, -50, 0); dummy.scale.setScalar(0.001); }
      else { const x = b[0] + Math.cos(b[2]) * u * 7, z = b[1] + Math.sin(b[2]) * u * 7; let y = TOP + b[3] * 2.4 * u - 16 * u * u; if (y < 0.2) y = 0.2; dummy.position.set(x, y, z); dummy.scale.setScalar(1.3); dummy.rotation.set(u * 9, u * 7, 0); }
      dummy.updateMatrix(); IB.setMatrixAt(hi + i, dummy.matrix); dummy.position.y += BH * 0.6; dummy.updateMatrix(); IS.setMatrixAt(hi + i, dummy.matrix); dummy.rotation.set(0, 0, 0);
    });
    IB.instanceMatrix.needsUpdate = IS.instanceMatrix.needsUpdate = true;
    // the requested change: the forest blossoms pink
    if (t >= tU && t < tU + 1.2) { const u = clamp01((t - tU) / 1.0), pk = new THREE.Color(C.pink); leafIdx.forEach((i) => { cc.copy(list[i].c).lerp(pk, u); IB.setColorAt(i, cc); IS.setColorAt(i, cc); }); IB.instanceColor.needsUpdate = IS.instanceColor.needsUpdate = true; }
    if (t >= tU + 1.2) { const pk = new THREE.Color(C.pink); if (!IB.__pk) { leafIdx.forEach((i) => { IB.setColorAt(i, pk); IS.setColorAt(i, pk); }); IB.instanceColor.needsUpdate = IS.instanceColor.needsUpdate = true; IB.__pk = 1; } }
    else if (t < tU && IB.__pk !== 0) { leafIdx.forEach((i) => { IB.setColorAt(i, list[i].c); IS.setColorAt(i, list[i].c); }); IB.instanceColor.needsUpdate = IS.instanceColor.needsUpdate = true; IB.__pk = 0; }

    // spec sheet
    const sIn = ramp(t, AT["s4:rencananya"] - 0.3, AT["s4:rencananya"] + 0.4), sOut = ramp(t, tK - 0.1, tK + 0.5);
    spec.visible = sIn > 0 && sOut < 1;
    spec.position.set(sOut * 22, 1 + 7 * sIn + sOut * 4, 7); spec.rotation.set(-0.72 + sOut * 0.3, sOut * 1.2, Math.sin(t) * 0.02 + sOut * 0.5);

    // hero path over the phone
    const hIn = AT["s4:karakter"];
    H.G.visible = t > hIn;
    const dropY = (1 - eout(clamp01((t - hIn) / 0.5))) * 10;
    const run1 = clamp01((t - tR) / (tU - tR)), run2 = clamp01((t - AT["s5:uji"]) / (K.s5e - AT["s5:uji"]));
    let jr = 18 - run1 * 34; let moving = t > tR && t < tU;
    if (t >= tU) { jr = -16 + run2 * 32; moving = t > AT["s5:uji"] && t < K.s5e; }
    if (t > K.s5e) { jr = 16; moving = false; }
    if (t > K.s8) { jr = 16 - ramp(t, K.s8, K.s8 + 1.3) * 16; moving = t < K.s8 + 1.3; }
    if (t < tR) jr = 18;
    const hop = logsZ.reduce((m, z) => Math.max(m, Math.max(0, 1 - Math.abs(jr - z) / 2.2)), 0);
    H.G.position.set(zPath(jr), TOP + BH + dropY + hop * hop * 1.4, jr * U);
    H.G.rotation.y = t >= tU && t < K.s5e + 0.1 && t > AT["s5:uji"] - 0.3 ? Math.PI : t < tU ? Math.PI : 0;
    if (t > K.s8 + 1.3) H.G.rotation.y = 0.3;
    if (moving) runPose(H, t * 11); else { restPose(H); if (t > K.s8 + 1.3) { H.armR.rotation.z = 2.6 + Math.sin(t * 7) * 0.4; } else if (t < tR) H.armR.rotation.z = 0; }

    // crowd
    const fr = AT["s6:71"];
    crowd.forEach((c, i) => {
      const u = back(clamp01((t - K.s6 - 0.3 - c.d) / 0.4), 2);
      const bob = Math.abs(Math.sin(t * 3 + c.ph)) * 0.16 * (c.fresh && t > fr ? 1 : 0);
      dummy.scale.setScalar(Math.max(0.001, u)); dummy.position.set(c.x, 2.05 * u + bob, c.z); dummy.updateMatrix(); IH.setMatrixAt(i, dummy.matrix);
      dummy.position.set(c.x, 0.9 * u + bob, c.z); dummy.updateMatrix(); IT.setMatrixAt(i, dummy.matrix);
      const on = c.fresh ? ramp(t, fr + c.d, fr + c.d + 0.25) : 0;
      cc.copy(grey).lerp(new THREE.Color(0xf5cd30), on); IH.setColorAt(i, cc); cc.copy(grey).lerp(new THREE.Color(c.s), on); IT.setColorAt(i, cc);
    });
    IH.instanceMatrix.needsUpdate = IT.instanceMatrix.needsUpdate = true; IH.instanceColor.needsUpdate = IT.instanceColor.needsUpdate = true;

    tiles.forEach((x) => { const u = clamp01((t - x.t) / 0.32); const e = back(u, 2); x.G.visible = u > 0; x.G.position.y = 0.32 + (1 - eout(u)) * 6; x.G.scale.setScalar(0.7 + 0.3 * e); });
    comp.render();
  };
}
