// BENGKEL VOXEL: a floating voxel island at dusk where a pink voxel pig is modelled, its length and height get swapped, and it becomes a green creature.
// Own illustration: no game textures, the creature face is an original dark-pixel pattern. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, smooth, canvasTex, track, std, box, stage, avatar, restPose, runPose, pts } from "./lib3d.js";

// Canvas labels use the page fonts, so wait for them before the textures are painted.
try { await document.fonts.ready; await Promise.all([document.fonts.load("20px Silkscreen"), document.fonts.load("800 20px Rubik")]); } catch (e) { /* fallback font */ }

const PAL = { sky: 0x2e2a5a, grass: 0x5dbb4a, dirt: 0x8b5a2b, pink: 0xf4a6b8, leaf: 0x3fa34d, orange: 0xff7a1a, cream: 0xfff6e5, ink: 0x1b1838 };
const SF = "Silkscreen", RF = "Rubik";
const S = 2.2; // creature scale: voxel 0.2 local -> 0.44 world

function pix(n, draw) { const t = canvasTex(n, n, draw); t.magFilter = THREE.NearestFilter; return t; }
function noisy(g, n, shades, rnd, y0 = 0, y1 = n) { for (let y = y0; y < y1; y++) for (let x = 0; x < n; x++) { g.fillStyle = shades[Math.floor(rnd() * shades.length)]; g.fillRect(x, y, 1, 1); } }
const lerpA = (a, b, u) => a + (b - a) * u;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: PAL.sky, fog: 0.0062, exp: 1.12, bloom: [0.42, 0.45, 0.86] });
  scene.fog.color.set(0x3b3268);
  const rnd = mulberry(2209);

  // light: low warm sun behind the island, violet sky fill, cool rim from the camera side
  scene.add(new THREE.HemisphereLight(0xd2c6ee, 0x4a3426, 1.45));
  const sun = new THREE.DirectionalLight(0xffb27a, 2.6); sun.position.set(-14, 16, -30); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 120 }); sun.shadow.bias = -0.0008; sun.shadow.radius = 4;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xffd8c8, 1.05); fill.position.set(30, 18, 24); scene.add(fill);

  // sky dome, square sun, stars, blocky clouds, far mini islands
  const skyT = canvasTex(4, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#14122c"); gr.addColorStop(0.3, "#2e2a5a"); gr.addColorStop(0.44, "#5b3f78"); gr.addColorStop(0.49, "#c4687e"); gr.addColorStop(0.515, "#ff9a5c"); gr.addColorStop(0.56, "#3a2f5c"); gr.addColorStop(1, "#1d1a3a"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(380, 32, 24), new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false, depthWrite: false }));
  scene.add(sky);
  const sunQ = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb36b).multiplyScalar(1.6), fog: false, toneMapped: false }));
  sunQ.position.set(-110, 22, -330); sunQ.lookAt(0, 0, 0); scene.add(sunQ);
  const ST = pts(scene, 260, { color: 0xfff6e5, size: 1.1, opacity: 0.8 });
  for (let i = 0; i < 260; i++) { const a = rnd() * 6.283, e = 0.2 + rnd() * 1.2; ST.pos.set([Math.cos(a) * Math.cos(e) * 340, Math.sin(e) * 340, Math.sin(a) * Math.cos(e) * 340], i * 3); }
  ST.m.fog = false; ST.commit();
  const cloudM = std(0x8f7db8, 1, 0, { emissive: 0x3a2a55 });
  for (let i = 0; i < 12; i++) { const a = rnd() * 6.283, d = 70 + rnd() * 70; const c = box(10 + rnd() * 14, 1.4, 4 + rnd() * 6, cloudM, Math.cos(a) * d, 24 + rnd() * 16, Math.sin(a) * d); c.castShadow = false; box(5 + rnd() * 5, 1.2, 3, cloudM, c.position.x + 3, c.position.y + 1.2, c.position.z + 1).castShadow = false; }

  // textures: original 16px pixel art
  const grassTop = pix(16, (g, n) => noisy(g, n, ["#5DBB4A", "#55B044", "#66C553", "#4FA63F", "#5DBB4A"], rnd));
  const dirtSh = ["#8B5A2B", "#7D4F24", "#996534", "#6F4420", "#8B5A2B"];
  const grassSide = pix(16, (g, n) => { noisy(g, n, dirtSh, rnd); noisy(g, n, ["#5DBB4A", "#55B044", "#4FA63F"], rnd, 0, 3); for (let x = 0; x < n; x++) if (rnd() < 0.45) { g.fillStyle = "#55B044"; g.fillRect(x, 3, 1, 1 + Math.floor(rnd() * 2)); } });
  const dirtT = pix(16, (g, n) => noisy(g, n, dirtSh, rnd));
  const leafT = pix(16, (g, n) => { noisy(g, n, ["#3FA34D", "#36913F", "#4CB65A", "#2E7F38"], rnd); });
  const barkT = pix(16, (g, n) => { for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) { g.fillStyle = ["#6E4420", "#5E391B", "#7A4C26"][(x % 3 + Math.floor(rnd() * 2)) % 3]; g.fillRect(x, y, 1, 1); } });
  const mS = std(0xffffff, 0.95, 0, { map: grassSide }), mT = std(0xffffff, 0.92, 0, { map: grassTop }), mD = std(0xffffff, 0.95, 0, { map: dirtT });
  const grassMats = [mS, mS, mT, mD, mS, mS];
  const leafM = std(0xffffff, 0.9, 0, { map: leafT }), barkM = std(0xffffff, 0.95, 0, { map: barkT });
  const unitG = new THREE.BoxGeometry(1, 1, 1);
  const dummy = new THREE.Object3D();
  const v3 = new THREE.Vector3(), v4 = new THREE.Vector3();

  // island: grass top at y=0, dirt underneath tapering to the rim
  const Rof = (x, z) => { const a = Math.atan2(z, x); return 17.4 + 1.5 * Math.sin(3 * a + 0.4) + 1.0 * Math.sin(5 * a + 2) + 0.6 * Math.sin(8 * a + 1); };
  const CR = { x: 4.18, z: 3.74 };
  const statG = [], statD = [], dynB = [];
  for (let i = -21; i <= 21; i++) for (let j = -21; j <= 21; j++) {
    const rr = Math.hypot(i, j), R = Rof(i, j); if (rr > R) continue;
    const depth = Math.max(1, Math.min(9, Math.floor(1.5 + (R - rr) * 0.9)));
    const dc = Math.hypot(i - CR.x, j - CR.z);
    if (dc < 2.7) dynB.push({ p: [i, -0.5, j], g: 1 }); else statG.push([i, -0.5, j]);
    for (let k = 1; k <= depth; k++) {
      if (k > 2 && rr <= R - 5) continue;
      const rem = (k === 1 && dc < 1.9) || (k === 2 && dc < 1.0);
      if (rem) dynB.push({ p: [i, -0.5 - k, j], g: 0 }); else statD.push([i, -0.5 - k, j]);
    }
  }
  const inst = (geo, mat, list, shadow = true) => { const m = new THREE.InstancedMesh(geo, mat, list.length); list.forEach((p, i) => { dummy.position.set(p[0], p[1], p[2]); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); }); m.castShadow = shadow; m.receiveShadow = true; scene.add(m); return m; };
  inst(unitG, grassMats, statG); inst(unitG, mD, statD);
  // crater debris: pure ballistic, lands on the grass or falls off the island
  const GR = 26;
  const deb = dynB.map((d) => {
    const dx = d.p[0] - CR.x, dz = d.p[2] - CR.z, a = Math.atan2(dz, dx + 0.001) + (rnd() - 0.5) * 0.7, sp = 3.5 + rnd() * 6.5;
    const o = { ...d, vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, vy: 12.5 + rnd() * 7, wx: (rnd() - 0.5) * 14, wz: (rnd() - 0.5) * 14, wy: (rnd() - 0.5) * 6 };
    o.tl = (o.vy + Math.sqrt(o.vy * o.vy + 2 * GR * (d.p[1] - 0.5))) / GR;
    const xl = d.p[0] + o.vx * o.tl, zl = d.p[2] + o.vz * o.tl;
    o.lands = Math.hypot(xl, zl) < Rof(xl, zl) - 0.6 && Math.hypot(xl - CR.x, zl - CR.z) > 3.0;
    o.xl = xl; o.zl = zl; return o;
  });
  const debG = deb.filter((d) => d.g), debD = deb.filter((d) => !d.g);
  const IG = new THREE.InstancedMesh(unitG, grassMats, debG.length), ID = new THREE.InstancedMesh(unitG, mD, debD.length);
  for (const m of [IG, ID]) { m.castShadow = m.receiveShadow = true; m.frustumCulled = false; scene.add(m); }

  // trees
  const trees = [[3, -8, 5], [-14, 9, 4], [-4, -14, 5], [14, -12, 4]];
  const leafPts = [];
  const trunkL = [], leafL = [];
  trees.forEach(([x, z, h], q) => { for (let y = 0; y < h; y++) trunkL.push([x, y + 0.5, z]); for (let y = h; y < h + 3; y++) { const rad = y < h + 2 ? 2 : 1; for (let dx = -rad; dx <= rad; dx++) for (let dz = -rad; dz <= rad; dz++) { if (rad === 2 && Math.abs(dx) === 2 && Math.abs(dz) === 2) continue; leafL.push([x + dx, y + 0.5, z + dz]); if (q === 0) leafPts.push([x + dx, y + 0.5, z + dz]); } } });
  inst(unitG, barkM, trunkL); inst(unitG, leafM, leafL);
  // flowers and pebbles
  const flL = [], flC = [];
  for (let k = 0; k < 70; k++) { const x = Math.round(rnd() * 32 - 16), z = Math.round(rnd() * 32 - 16); if (Math.hypot(x, z) > Rof(x, z) - 1.5 || Math.hypot(x - CR.x, z - CR.z) < 4 || Math.hypot(x - 5, z) < 3.5) continue; flL.push([x + (rnd() - 0.5) * 0.6, 0.14, z + (rnd() - 0.5) * 0.6]); flC.push([0xf4a6b8, 0xfff6e5, 0xff7a1a, 0xc9a6ff][k % 4]); }
  const IF = new THREE.InstancedMesh(new THREE.BoxGeometry(0.26, 0.28, 0.26), std(0xffffff, 0.6), flL.length);
  flL.forEach((p, i) => { dummy.position.set(...p); dummy.scale.setScalar(1); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); IF.setMatrixAt(i, dummy.matrix); IF.setColorAt(i, new THREE.Color(flC[i])); }); scene.add(IF);
  // far floating islets
  [[-60, 6, -70, 4], [70, 12, -40, 3], [55, 2, 60, 5], [-75, 14, 30, 3]].forEach(([x, y, z, s]) => { for (let i = -s; i <= s; i++) for (let j = -s; j <= s; j++) { if (Math.hypot(i, j) > s) continue; box(1, 1, 1, grassMats, x + i, y, z + j).castShadow = false; for (let k = 1; k < s - Math.hypot(i, j) + 1; k++) box(1, 1, 1, mD, x + i, y - k, z + j).castShadow = false; } });
  // lanterns: warm dusk glow points
  const lanM = new THREE.MeshStandardMaterial({ color: 0xffd08a, emissive: 0xffa040, emissiveIntensity: 2.4 });
  [[8, 4], [1, 13.5], [-11, -6], [12, 9]].forEach(([x, z], q) => { box(0.22, 2.4, 0.22, std(0x5e391b, 0.9), x, 1.2, z); box(0.6, 0.6, 0.6, lanM, x, 2.6, z); if (q < 3) { const pl = new THREE.PointLight(0xffa050, 22, 16, 1.6); pl.position.set(x, 2.9, z); scene.add(pl); } });

  // text textures with repaint list (fonts already awaited)
  const textTex = (w, h, paint) => canvasTex(w, h, paint);
  const tag = (txt, bg, fg, w = 512) => {
    const tx = textTex(w, 128, (g, W, Hh) => { g.fillStyle = "#1B1838"; g.fillRect(0, 10, W, Hh - 10); g.fillStyle = bg; g.fillRect(0, 0, W, Hh - 14); g.fillStyle = fg; g.font = `700 60px ${SF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, W / 2, (Hh - 14) / 2 + 2); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(3.6 * (w / 512), 0.9), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, toneMapped: false, fog: false }));
    m.renderOrder = 5; scene.add(m); return m;
  };

  // ---------- voxel creature (pig -> creature), own design ----------
  const pinkSh = ["#F4A6B8", "#EE97AB", "#F7B6C5", "#E88CA2"].map((c) => new THREE.Color(c));
  const greenSh = ["#3FA34D", "#5DBB4A", "#348F41", "#4DB25A"].map((c) => new THREE.Color(c));
  const WHITE = new THREE.Color(0xffffff), EYE = new THREE.Color(0x2a1e2e), DARK = new THREE.Color(0x14121c), ORG = new THREE.Color(0xff7a1a), CYAN = new THREE.Color(0x7fd8ff), SNOUT = new THREE.Color(0xe07f98), NOSE = new THREE.Color(0xa8506a);
  const vGeo = new THREE.BoxGeometry(1, 1, 1);
  function makeCreature(seed, green) {
    const rr = mulberry(seed), vox = [];
    const add = (part, a, b, c, l = 0) => { const dk = rr() < 0.09; vox.push({ part, a, b, c, l, pk: pinkSh[Math.floor(rr() * 4)], gr: dk ? new THREE.Color(0x24602e) : greenSh[Math.floor(rr() * 4)], ap: -1, gT: green ? -1e9 : 1e9, sp: [(rr() - 0.5) * 9, (rr() - 0.5) * 9] }); };
    for (let a = 0; a < 5; a++) for (let b = 0; b < 4; b++) for (let c = 0; c < 8; c++) if (a === 0 || a === 4 || b === 0 || b === 3 || c === 0 || c === 7) add("body", a, b, c);
    for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++) for (let c = 0; c < 5; c++) if (a === 0 || a === 4 || b === 0 || b === 4 || c === 0 || c === 4) add("head", a, b, c);
    for (let l = 0; l < 4; l++) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) for (let c = 0; c < 2; c++) add("leg", a, b, c, l);
    for (let a = 0; a < 3; a++) for (let b = 0; b < 2; b++) add("snout", a, b, 0);
    vox.forEach((v) => { if (v.part === "head" && v.c === 4) { v.eye = v.b === 3 && (v.a === 1 || v.a === 3); v.mouth = v.b === 1 && v.a >= 1 && v.a <= 3; } if (v.part === "snout") v.nose = v.b === 1 && v.a !== 1; });
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.78 });
    const IM = new THREE.InstancedMesh(vGeo, mat, vox.length); IM.castShadow = true; IM.receiveShadow = true; IM.frustumCulled = false;
    const G = new THREE.Group(); G.add(IM); scene.add(G);
    const cc = new THREE.Color();
    function lpos(v, st, out) {
      const m = st.m;
      let sz = 0.2;
      const bob = Math.abs(Math.sin(st.walkPh || 0)) * 0.035 * (st.walkAmt || 0);
      if (v.part === "body") {
        const mi = smooth(clamp01(m * 1.6 - 0.6 * (v.c / 7)));
        const py = 0.4 + (v.b + 0.5) * 0.2, pz = (v.c - 3.5) * 0.2, qy = 0.4 + (v.c + 0.5) * 0.2, qz = (v.b - 1.5) * 0.2;
        out.set((v.a - 2) * 0.2, lerpA(py, qy, mi) + bob, lerpA(pz, qz, mi) + Math.sin(Math.PI * mi) * 0.16);
      } else if (v.part === "head" || v.part === "snout") {
        const hm = smooth(m);
        const hx = 0, hy = lerpA(0.95, 2.45, hm) + Math.sin(Math.PI * hm) * 0.25 + bob, hz = lerpA(1.25, 0, hm) + Math.sin(Math.PI * hm) * 0.12;
        let dx, dy, dz;
        if (v.part === "head") { dx = (v.a - 2) * 0.18; dy = (v.b - 2) * 0.18; dz = (v.c - 2) * 0.18; sz = 0.18; }
        else { dx = (v.a - 1) * 0.18; dy = (v.b - 0.5) * 0.18 - 0.1; dz = 0.45 + 0.07; sz = 0.18 * (1 - smooth(m * 1.8)); }
        const hy2 = st.headYaw || 0, cs = Math.cos(hy2), sn = Math.sin(hy2);
        out.set(hx + dx * cs + dz * sn, hy + dy, hz - dx * sn + dz * cs);
      } else {
        const lx = v.l & 1 ? 0.3 : -0.3, sg = v.l < 2 ? 1 : -1, lz = sg * lerpA(0.6, 0.36, smooth(m));
        const ph = (st.walkPh || 0) + (v.l === 0 || v.l === 3 ? 0 : Math.PI);
        const lift = Math.max(0, Math.sin(ph)) * 0.1 * (st.walkAmt || 0), dz2 = Math.cos(ph) * 0.08 * (st.walkAmt || 0);
        out.set(lx + (v.a - 0.5) * 0.2, 0.2 + (v.b - 0.5) * 0.2 + lift, lz + (v.c - 0.5) * 0.2 + dz2);
      }
      return sz;
    }
    function update(t, st) {
      vox.forEach((v, i) => {
        let sz = lpos(v, st, v3);
        if (st.jit) v3.x += st.jit * (((i * 7919 + Math.floor(t * 30) * 104729) % 13) / 13 - 0.5);
        let rx = 0, rz = 0;
        if (v.ap > 0) { const u = clamp01((t - v.ap) / 0.22); if (u <= 0) sz = 0; else { v3.y += (1 - eout(u)) * 0.9; sz *= 0.4 + 0.6 * back(u, 2); } }
        if (st.boom != null && t >= st.boom) {
          const dt = t - st.boom; v4.set(v3.x, v3.y - 1.2, v3.z).normalize();
          v3.x += v4.x * 5 * dt + v.sp[0] * 0.25 * dt; v3.y += v4.y * 4 * dt + 4 * dt - 7 * dt * dt; v3.z += v4.z * 5 * dt + v.sp[1] * 0.25 * dt;
          sz *= 1 - clamp01(dt / 1.1); rx = v.sp[0] * dt; rz = v.sp[1] * dt;
        }
        dummy.position.copy(v3); dummy.rotation.set(rx, 0, rz); dummy.scale.setScalar(Math.max(0.0001, sz * 0.96)); dummy.updateMatrix(); IM.setMatrixAt(i, dummy.matrix);
        const g = t >= v.gT;
        if (v.part === "snout") cc.copy(v.nose ? NOSE : SNOUT);
        else if (v.eye) cc.copy(g ? DARK : EYE).lerp(ORG, st.eye || 0);
        else if (v.mouth && g) cc.copy(DARK);
        else cc.copy(g ? v.gr : v.pk);
        if (st.tint) cc.lerp(CYAN, st.tint);
        if (st.wf) cc.lerp(WHITE, st.wf);
        IM.setColorAt(i, cc);
      });
      IM.instanceMatrix.needsUpdate = true; IM.instanceColor.needsUpdate = true;
    }
    return { G, IM, vox, update, lpos };
  }

  // stations
  const A = [-4, 10], B = [5, 0], E1 = [3.5, 6.8], D = [-11, -8], SHELF = [-13, 3];
  const tBug = AT["s1:bug"], tBuild0 = AT["s2:Minecraft"] - 0.2, tBuild1 = AT["s2:babi"] + 0.1;
  const tSwap = AT["s3:menukar"], tMorph = AT["s3:malah"], tKode = AT["s3:kode"];
  const tHij = AT["s5:hijau"], tAI = AT["s5:AI"], tAgr = AT["s5:agresif"], tSatu = AT["s5:Satu"];
  const tCreep = AT["s6:Creeper"], tDia = AT["s6:Dia"], tHiss = AT["s6:mendesis"], tB = AT["s6:meledak"], tHurt = AT["s6:terluka"], tUp = AT["s6:mati"] + 0.15;
  const tS1 = AT["s6:Charged"] - 0.15, tS2 = AT["s6:tersambar"];
  const tMerch = AT["s7:merchandise"], tIklan = AT["s7:iklan"], tLima = AT["s7:lima"], tKamu = AT["s8:Kamu"];

  const Q1 = makeCreature(71, true); Q1.G.position.set(A[0], 0, A[1]); Q1.G.scale.setScalar(S);
  const Q2 = makeCreature(72, false); Q2.G.position.set(B[0], 0, B[1]); Q2.G.scale.setScalar(S);
  const Q3 = makeCreature(73, true); Q3.G.position.set(D[0], 0, D[1]); Q3.G.rotation.y = 0.9; Q3.G.scale.setScalar(S);
  // build order for the pig: legs, then body rows bottom-up, then head
  {
    const order = Q2.vox.map((v, i) => i).filter((i) => Q2.vox[i].part !== "snout");
    const rank = (v) => (v.part === "leg" ? 0 : v.part === "body" ? 1 + v.b : v.part === "head" ? 6 + v.b * 0.5 : 9);
    order.sort((x, y) => rank(Q2.vox[x]) - rank(Q2.vox[y]) || Q2.vox[x].c - Q2.vox[y].c);
    order.forEach((i, k) => { Q2.vox[i].ap = tBuild0 + (k / order.length) * (tBuild1 - tBuild0 - 0.6); });
    Q2.vox.forEach((v) => { if (v.part === "snout") v.ap = tBuild1 - 0.4; });
  }
  // leaf tiles: one per voxel, flying from the tree to its slot on the standing creature
  Q2.G.updateMatrixWorld(true);
  const tiles = [];
  Q2.vox.forEach((v, i) => { if (v.part === "snout") { v.gT = tHij; return; } Q2.lpos(v, { m: 1 }, v3); Q2.G.localToWorld(v3); const lp = leafPts[Math.floor(rnd() * leafPts.length)]; const ta = tHij - 0.1 + rnd() * (AT["s5:game"] + 0.25 - tHij); v.gT = ta; tiles.push({ from: [lp[0] + (rnd() - 0.5), lp[1] + (rnd() - 0.5), lp[2] + (rnd() - 0.5)], to: [v3.x, v3.y, v3.z], ta, rx: rnd() * 6, rz: rnd() * 6 }); });
  const IL = new THREE.InstancedMesh(new THREE.BoxGeometry(0.46, 0.46, 0.08), leafM, tiles.length); IL.frustumCulled = false; IL.castShadow = true; scene.add(IL);

  // editor gizmo: plate, wire box, two dimension arrows with swapping handles, code board
  const plateT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#26224c"; g.fillRect(0, 0, w, w); g.strokeStyle = "rgba(255,246,229,.55)"; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, w); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke(); } g.strokeStyle = "#FF7A1A"; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, w - 6); });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.12, 6.4), new THREE.MeshStandardMaterial({ map: plateT, roughness: 0.6, transparent: true, opacity: 0.92, emissive: 0x1c1840 })); plate.position.set(B[0], 0.07, B[1]); plate.receiveShadow = true; scene.add(plate);
  const barM = new THREE.MeshBasicMaterial({ color: 0xfff6e5, toneMapped: false, transparent: true, opacity: 0.9 });
  const bars = []; for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(unitG, barM); scene.add(m); bars.push(m); }
  function setBox(w, h, d, cx, cy, cz, k) {
    const th = 0.07 * k; let n = 0;
    for (const sy of [-1, 1]) for (const sz of [-1, 1]) { bars[n].position.set(cx, cy + sy * h / 2, cz + sz * d / 2); bars[n++].scale.set(w * k, th, th); }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { bars[n].position.set(cx + sx * w / 2, cy, cz + sz * d / 2); bars[n++].scale.set(th, h * k, th); }
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) { bars[n].position.set(cx + sx * w / 2, cy + sy * h / 2, cz); bars[n++].scale.set(th, th, d * k); }
  }
  const arM = new THREE.MeshBasicMaterial({ color: 0xff7a1a, toneMapped: false }), arM2 = new THREE.MeshBasicMaterial({ color: 0x5dbb4a, toneMapped: false });
  const arH = new THREE.Mesh(unitG, arM), arV = new THREE.Mesh(unitG, arM2); scene.add(arH, arV);
  const hdH = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), arM), hdV = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), arM2); scene.add(hdH, hdV);
  const lbP = tag("PANJANG", "#FF7A1A", "#FFF6E5"), lbT = tag("TINGGI", "#5DBB4A", "#1B1838");
  // code board faces +x (toward the s3 camera)
  const board = new THREE.Group(); board.position.set(B[0] - 1, 8.6, B[1] - 3.2); board.rotation.y = Math.PI / 2; scene.add(board);
  const boardT = textTex(640, 400, (g, w, h) => { g.fillStyle = "#1B1838"; g.fillRect(0, 0, w, h); g.fillStyle = "#2E2A5A"; g.fillRect(0, 0, w, 74); g.fillStyle = "#FF7A1A"; g.fillRect(22, 26, 22, 22); g.fillStyle = "#F4A6B8"; g.fillRect(54, 26, 22, 22); g.fillStyle = "#5DBB4A"; g.fillRect(86, 26, 22, 22); g.fillStyle = "#FFF6E5"; g.font = `700 34px ${SF}`; g.textBaseline = "middle"; g.fillText("model_babi", 136, 40); g.font = `700 44px ${SF}`; g.fillStyle = "#FFF6E5"; g.fillText("panjang =", 34, 170); g.fillText("tinggi  =", 34, 300); g.strokeStyle = "#FFF6E5"; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); });
  box(4.8, 3.0, 0.16, [std(0x1b1838), std(0x1b1838), std(0x1b1838), std(0x1b1838), new THREE.MeshBasicMaterial({ map: boardT, toneMapped: false }), std(0x1b1838)], 0, 0, 0, board);
  const valTex = (n, col) => canvasTex(256, 128, (g, w, h) => { g.fillStyle = "#FFF6E5"; g.fillRect(0, 0, w, h); g.fillStyle = "#1B1838"; g.fillRect(0, h - 10, w, 10); for (let i = 0; i < n; i++) { g.fillStyle = col; g.fillRect(22 + i * 54, 30, 44, 56); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(22 + i * 54, 76, 44, 10); } });
  const valA = box(1.5, 0.75, 0.2, [0, 0, 0, 0, 0, 0].map((_, k) => (k === 4 ? new THREE.MeshBasicMaterial({ map: valTex(4, "#FF7A1A"), toneMapped: false }) : std(0xfff6e5))), 0, 0, 0, board);
  const valB = box(1.5, 0.75, 0.2, [0, 0, 0, 0, 0, 0].map((_, k) => (k === 4 ? new THREE.MeshBasicMaterial({ map: valTex(2, "#5DBB4A"), toneMapped: false }) : std(0xfff6e5))), 0, 0, 0, board);
  const rowY = [0.56, -0.64], valX = 1.25;

  // AI chip that snaps onto the side of the head
  const chipT = textTex(128, 128, (g, w) => { g.fillStyle = "#1B1838"; g.fillRect(0, 0, w, w); g.fillStyle = "#FFC24A"; for (let i = 0; i < 4; i++) { g.fillRect(14 + i * 28, 0, 12, 10); g.fillRect(14 + i * 28, w - 10, 12, 10); } g.fillStyle = "#FF7A1A"; g.font = `700 56px ${SF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AI", w / 2, w / 2 + 2); });
  const chip = box(0.95, 0.95, 0.18, [0, 0, 0, 0, 0, 0].map((_, k) => (k === 4 ? new THREE.MeshBasicMaterial({ map: chipT, toneMapped: false }) : std(0x1b1838))), 0, 0, 0, scene);
  chip.rotation.y = Math.PI / 2;

  // explorer: classic blocky body, voxel head with own pixel face, cap and backpack
  const H = avatar({ skin: 0xffd7ae, shirt: 0xff7a1a, pants: 0x8b5a2b, make: (c) => std(c, 0.8), face: false });
  H.head.children.forEach((c) => (c.visible = false));
  const faceT = pix(8, (g) => { g.fillStyle = "#FFD7AE"; g.fillRect(0, 0, 8, 8); g.fillStyle = "#2a1e2e"; g.fillRect(2, 3, 1, 2); g.fillRect(5, 3, 1, 2); g.fillStyle = "#F4A6B8"; g.fillRect(1, 5, 1, 1); g.fillRect(6, 5, 1, 1); g.fillStyle = "#8b3a3a"; g.fillRect(3, 6, 2, 1); });
  const skinM = std(0xffd7ae, 0.8), hairM = std(0x5e391b, 0.9);
  const hb = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.3), [skinM, skinM, hairM, skinM, std(0xffffff, 0.8, 0, { map: faceT }), hairM]); hb.position.y = 0.66; hb.castShadow = true; H.head.add(hb);
  box(1.42, 0.36, 1.42, std(0xfff6e5, 0.7), 0, 1.4, 0, H.head); box(1.42, 0.12, 0.6, std(0xff7a1a, 0.7), 0, 1.26, 0.9, H.head);
  box(1.5, 1.7, 0.6, std(0x8b5a2b, 0.85), 0, 3.05, -0.78, H.G); box(1.55, 0.3, 0.66, std(0x3fa34d, 0.8), 0, 3.5, -0.78, H.G);
  H.G.scale.setScalar(0.82); H.G.rotation.order = "YXZ"; scene.add(H.G);
  const hMats = []; H.G.traverse((o) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m.emissive && !hMats.includes(m)) hMats.push(m); }); });

  // explorer path
  const kd = Math.hypot(E1[0] - CR.x, E1[1] - CR.z), K2 = [E1[0] + ((E1[0] - CR.x) / kd) * 3.4, E1[1] + ((E1[1] - CR.z) / kd) * 3.4];
  const P0 = [-0.6, 11.6], SH = [-11.2, 7.6], P8 = [-7.6, 10.6];
  const mv = [[tBug + 0.35, K.s2 + 1.8, P0, E1], [tUp + 0.55, K.s6e - 0.1, K2, SH], [K.s8 + 0.1, K.s8 + 2.0, SH, P8]];
  const dirY = (a, b) => Math.atan2(b[0] - a[0], b[1] - a[1]);
  const camS7 = [9, 9], camS8 = [-4, 39];
  const yk = [[0, dirY(P0, A)], [tBug + 0.25, dirY(P0, A)], [tBug + 0.5, dirY(P0, E1)], [K.s2 + 1.6, dirY(P0, E1)], [K.s2 + 2.1, dirY(E1, B)], [tUp + 0.35, dirY(E1, B)], [tUp + 0.75, dirY(K2, SH)], [K.s6e - 0.3, dirY(K2, SH)], [K.s6e + 0.2, dirY(SH, camS7)], [K.s8, dirY(SH, camS7)], [K.s8 + 0.3, dirY(SH, P8)], [K.s8 + 1.8, dirY(SH, P8)], [K.s8 + 2.3, dirY(P8, camS8)]];
  for (let i = 1; i < yk.length; i++) { while (yk[i][1] - yk[i - 1][1] > Math.PI) yk[i][1] -= 2 * Math.PI; while (yk[i][1] - yk[i - 1][1] < -Math.PI) yk[i][1] += 2 * Math.PI; }
  const yawAt = (t) => { if (t <= yk[0][0]) return yk[0][1]; for (let i = 0; i < yk.length - 1; i++) if (t < yk[i + 1][0]) return lerpA(yk[i][1], yk[i + 1][1], smooth((t - yk[i][0]) / (yk[i + 1][0] - yk[i][0]))); return yk[yk.length - 1][1]; };

  // explosion pieces
  const fireM = new THREE.MeshBasicMaterial({ color: 0xffb060, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const fire = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), fireM); fire.position.set(CR.x, 2.4, CR.z); scene.add(fire);
  const coreM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const core = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), coreM); core.position.copy(fire.position); scene.add(core);
  const ringM = new THREE.MeshBasicMaterial({ color: 0xfff6e5, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const shock = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 4, 1), ringM); shock.rotation.x = -Math.PI / 2; shock.rotation.z = Math.PI / 4; shock.position.set(CR.x, 0.15, CR.z); scene.add(shock);
  const smoke = []; for (let i = 0; i < 34; i++) { const a = rnd() * 6.283, e = rnd() * 1.2; smoke.push({ d: [Math.cos(a) * Math.cos(e), Math.sin(e) + 0.3, Math.sin(a) * Math.cos(e)], sp: 2.5 + rnd() * 3, s: 0.9 + rnd() * 1.1, dl: rnd() * 0.15, ry: rnd() * 3 }); }
  const ISm = new THREE.InstancedMesh(unitG, std(0x6b6878, 1, 0, { emissive: 0x1a1820 }), smoke.length); ISm.frustumCulled = false; scene.add(ISm);
  const SP = pts(scene, 90, { color: 0xffa040, size: 0.55 });
  const spk = Array.from({ length: 90 }, () => [rnd() * 6.283, rnd() * 1.3, 7 + rnd() * 9]);
  const boomL = new THREE.PointLight(0xff9040, 0, 40, 1.4); boomL.position.set(CR.x, 3, CR.z); scene.add(boomL);
  // hiss rings (square, voxel style)
  const hissR = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 4, 1), new THREE.MeshBasicMaterial({ color: 0xfff6e5, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.rotation.z = Math.PI / 4; scene.add(m); return m; });

  // lightning + charged aura for Q3
  const boltM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xd6f2ff).multiplyScalar(1.3), toneMapped: false });
  const bolt = new THREE.Group(); scene.add(bolt);
  const seg = (a, b, w) => { const m = new THREE.Mesh(unitG, boltM); m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); m.scale.set(w, w, Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])); m.lookAt(b[0], b[1], b[2]); bolt.add(m); };
  { let p = [D[0] + 3, 40, D[1] - 2]; const end = [D[0], 6.4, D[1]]; for (let k = 1; k <= 10; k++) { const u = k / 10; const q = k === 10 ? end : [lerpA(D[0] + 3, end[0], u) + (rnd() - 0.5) * 2.6, lerpA(40, end[1], u), lerpA(D[1] - 2, end[2], u) + (rnd() - 0.5) * 2.6]; seg(p, q, 0.3); if (k === 4 || k === 7) { let bp = q; for (let j = 0; j < 3; j++) { const bq = [bp[0] + (rnd() - 0.3) * 2.5, bp[1] - 2.2, bp[2] + (rnd() - 0.5) * 2.5]; seg(bp, bq, 0.16); bp = bq; } } p = q; } }
  const boltL = new THREE.PointLight(0xa8e4ff, 0, 50, 1.2); boltL.position.set(D[0], 9, D[1]); scene.add(boltL);
  const auraT = canvasTex(64, 64, (g, w) => { g.clearRect(0, 0, w, w); g.strokeStyle = "rgba(160,230,255,1)"; g.lineWidth = 6; for (let i = -w; i < w * 2; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + w, w); g.stroke(); } });
  const auraM = [0, 1].map(() => new THREE.MeshBasicMaterial({ map: auraT, color: 0x7fd8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  const aura = [0, 1].map((k) => { const g = new THREE.Group(); const s = 0.14 + k * 0.12; [[1 + s, 1.6 + s, 0.8 + s, 0, 1.2, 0], [0.9 + s, 0.9 + s, 0.9 + s, 0, 2.45, 0], [1 + s, 0.4 + s, 1.12 + s, 0, 0.2, 0]].forEach(([w, h, d, x, y, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), auraM[k]); m.position.set(x, y, z); g.add(m); }); Q3.G.add(g); return g; });
  const ZP = pts(scene, 40, { color: 0x9fe6ff, size: 0.35 });

  // trophy shelf: front faces +x
  const shelf = new THREE.Group(); shelf.position.set(SHELF[0], 0, SHELF[1]); shelf.rotation.y = Math.PI / 2; scene.add(shelf);
  const plankT = pix(16, (g, n) => { for (let y = 0; y < n; y++) { const base = ["#8B5A2B", "#7D4F24", "#996534"][Math.floor(y / 4) % 3]; for (let x = 0; x < n; x++) { g.fillStyle = rnd() < 0.15 ? "#6F4420" : base; g.fillRect(x, y, 1, 1); } } });
  const plankM = std(0xffffff, 0.9, 0, { map: plankT });
  for (const x of [-3.4, 3.4]) box(0.4, 6.4, 1.6, plankM, x, 3.2, 0, shelf);
  for (const y of [0.2, 2.6, 5.0]) box(7.2, 0.3, 1.6, plankM, 0, y, 0, shelf);
  box(6.4, 6.2, 0.2, std(0x4a2f1a, 0.95), 0, 3.2, -0.72, shelf);
  const items = [];
  const it = (obj, t0) => { items.push({ obj, t0, s: obj.scale.x }); obj.scale.setScalar(0.0001); return obj; };
  const faceTex = (bg) => pix(16, (g, n) => { noisy(g, n, ["#3FA34D", "#5DBB4A", "#348F41"], rnd); g.fillStyle = "#14121C"; g.fillRect(4, 4, 3, 3); g.fillRect(9, 4, 3, 3); g.fillRect(4, 10, 8, 2); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, n, 1); g.fillRect(0, n - 1, n, 1); } });
  // bottom shelf: shirt, mug, box
  { const g = new THREE.Group(); g.position.set(-2.1, 0.35, 0); const gm = std(0x3fa34d, 0.8); box(1.2, 1.3, 0.2, gm, 0, 0.75, 0, g); box(0.45, 0.45, 0.2, gm, -0.75, 1.15, 0, g); box(0.45, 0.45, 0.2, gm, 0.75, 1.15, 0, g); box(0.5, 0.5, 0.21, std(0xffffff, 0.8, 0, { map: faceTex() }), 0, 0.9, 0.01, g); shelf.add(g); it(g, tMerch); }
  { const g = new THREE.Group(); g.position.set(-0.2, 0.35, 0.1); box(0.9, 1.0, 0.9, [0, 0, 0, 0, 0, 0].map((_, k) => (k === 4 ? std(0xffffff, 0.6, 0, { map: faceTex("#FFF6E5") }) : std(0x5dbb4a, 0.6))), 0, 0.5, 0, g); box(0.2, 0.6, 0.2, std(0x5dbb4a, 0.6), 0.6, 0.55, 0, g); box(0.3, 0.2, 0.2, std(0x5dbb4a, 0.6), 0.5, 0.9, 0, g); shelf.add(g); it(g, tMerch + 0.12); }
  { const g = new THREE.Group(); g.position.set(1.9, 0.35, 0); box(1.4, 1.85, 1.0, [0, 0, 0, 0, 0, 0].map((_, k) => (k === 4 ? std(0xffffff, 0.7, 0, { map: faceTex() }) : std(0xfff6e5, 0.7))), 0, 0.93, 0, g); shelf.add(g); it(g, tMerch + 0.24); }
  // middle shelf: plush, ad screen
  const Q4 = makeCreature(74, true); shelf.add(Q4.G); Q4.G.position.set(-1.6, 2.75, 0.1); const q4s = 0.6; Q4.G.scale.setScalar(q4s);
  const q4pop = { obj: Q4.G, t0: tMerch + 0.36, s: q4s }; items.push(q4pop); Q4.G.scale.setScalar(0.0001);
  const adT = textTex(320, 200, (g, w, h) => { g.fillStyle = "#1B1838"; g.fillRect(0, 0, w, h); g.fillStyle = "#3FA34D"; g.fillRect(80, 18, 160, 160); g.fillStyle = "#14121C"; g.fillRect(110, 58, 30, 30); g.fillRect(180, 58, 30, 30); g.fillRect(110, 128, 100, 18); g.fillStyle = "#FF7A1A"; g.font = `700 30px ${SF}`; g.textAlign = "left"; g.fillText("IKLAN", 8, 34); });
  { const g = new THREE.Group(); g.position.set(1.6, 2.75, 0); box(2.3, 1.55, 0.35, [0, 0, 0, 0, 0, 0].map((_, k) => (k === 4 ? new THREE.MeshBasicMaterial({ map: adT, toneMapped: false }) : std(0x2a2a3a, 0.5))), 0, 0.9, 0, g); box(0.5, 0.14, 0.4, std(0x2a2a3a), 0, 0.07, 0, g); shelf.add(g); it(g, tIklan); }
  // top: trophy + plaque on the ground in front
  const goldM = std(0xf2b632, 0.32, 0.55, { emissive: 0x6a4000 });
  { const g = new THREE.Group(); g.position.set(0, 5.15, 0.1); box(1.2, 0.35, 0.8, goldM, 0, 0.18, 0, g); box(0.3, 0.6, 0.3, goldM, 0, 0.65, 0, g); box(1.1, 0.9, 1.0, goldM, 0, 1.35, 0, g); box(0.25, 0.55, 0.25, goldM, -0.7, 1.4, 0, g); box(0.25, 0.55, 0.25, goldM, 0.7, 1.4, 0, g); box(0.5, 0.5, 0.06, std(0xffffff, 0.7, 0, { map: faceTex() }), 0, 1.35, 0.52, g); shelf.add(g); it(g, tLima + 0.1); }
  const plaqT = textTex(1024, 360, (g, w, h) => { g.fillStyle = "#F2B632"; g.fillRect(0, 0, w, h); g.fillStyle = "#1B1838"; g.fillRect(16, 16, w - 32, h - 32); g.fillStyle = "#FFC24A"; g.font = `800 112px ${RF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("TOP 50", w / 2, 108); g.fillStyle = "#FFF6E5"; g.font = `700 48px ${SF}`; g.fillText("PENJAHAT GAME", w / 2, 210); g.fillStyle = "#5DBB4A"; g.font = `700 30px ${SF}`; g.fillText("GUINNESS GAMER'S EDITION", w / 2, 290); });
  { const g = new THREE.Group(); g.position.set(0, 0, 2.3); box(0.25, 1.1, 0.25, goldM, -1.6, 0.55, 0, g); box(0.25, 1.1, 0.25, goldM, 1.6, 0.55, 0, g); const p = box(4.3, 1.5, 0.22, [0, 0, 0, 0, 0, 0].map((_, k) => (k === 4 ? new THREE.MeshBasicMaterial({ map: plaqT, toneMapped: false }) : goldM)), 0, 1.6, 0, g); p.rotation.x = -0.12; shelf.add(g); it(g, tLima); }
  const SPK = pts(scene, 50, { color: 0xffd27a, size: 0.4 });

  // camera: px py pz lx ly lz
  const cpath = track([
    [0, -0.5, 7.4, 41, -2.4, 4.6, 10.4],
    [K.s1e - 0.2, -1.6, 6.8, 35.5, -2.4, 4.5, 10.4],
    [K.s2 + 1.8, 26, 8.4, 15.5, 4.4, 3.6, 3.9],
    [AT["s2:babi"], 28, 7.8, 11, 4.4, 3.4, 3.2],
    [K.s3 + 1.6, 24.5, 7.0, 6.5, 4.8, 3.4, 1.6],
    [tMorph, 22.5, 6.8, 4.5, 4.8, 3.8, 1],
    [AT["s3:empat"] + 0.4, 23, 7.2, 3, 4.8, 4.4, 0.5],
    [tKode, 20, 9, 0.5, 4, 7, -2.4],
    [K.s3e, 20.5, 9, -0.5, 4, 7.1, -2.6],
    [K.s4 + 1.6, 20, 7.0, -12, 4.2, 3.8, 3.2],
    [K.s4e - 0.5, 18, 6.6, -10.5, 4.2, 3.8, 3.2],
    [K.s5 + 1.3, 31, 9.4, -13, 4.2, 4.8, -3.8],
    [tAI, 21, 7.6, -4.4, 5, 5.3, -0.2],
    [tSatu + 0.4, 29, 8.2, -6.5, 5.2, 4.1, -0.8],
    [K.s5e, 28, 8, -2, 4.6, 3.8, 2],
    [tDia, 26, 7.6, 7, 4.3, 3.6, 3.4],
    [tB - 0.1, 24, 7.6, 11, 3.9, 3.6, 5],
    [tB + 1.4, 20, 8.6, 19, 2.8, 1.8, 9.5],
    [AT["s6:mati"] + 0.3, 13, 6.5, 22, 2, 0.8, 11.5],
    [tS1 - 0.5, -2.5, 7.8, -31, -10.6, 4.8, -8],
    [K.s6e, -4.5, 7.2, -28.5, -11, 4.6, -8],
    [K.s7 + 1.7, 9.5, 7.2, 10.4, -12, 3.7, 4.6],
    [K.s7e - 0.4, 7.5, 6.6, 8.0, -12, 3.6, 4.6],
    [K.s8 + 1.7, -3, 7.0, 39.5, -5.7, 4.5, 10.4],
    [K.dur, -8.5, 6.6, 37.5, -5.7, 4.4, 10.4],
  ]);

  return (t) => {
    // ---- camera
    const p = cpath(t);
    let sx = 0, sy = 0, sz = 0;
    if (t > tB) { const a = 0.75 * Math.exp(-(t - tB) * 3.2); sx = a * Math.sin(t * 53); sy = a * Math.sin(t * 61 + 1); sz = a * Math.sin(t * 47 + 2); }
    if (t > tS1) { const a = 0.35 * Math.exp(-(t - tS1) * 4); sx += a * Math.sin(t * 71); sy += a * Math.sin(t * 59); }
    if (t > tBug && t < tBug + 0.6) { const a = 0.3 * (1 - (t - tBug) / 0.6); sx += a * Math.sin(t * 67); sy += a * Math.sin(t * 73); }
    cam.position.set(p[0] + sx, p[1] + sy, p[2] + sz); cam.lookAt(p[3] + sx * 0.5, p[4] + sy * 0.5, p[5]);
    sun.target.position.set(p[3], 0, p[5]); sun.position.set(p[3] - 14, 16, p[5] - 30);

    // ---- Q1: hook creature, later the friend in s8
    const hiss1 = t < tBug + 0.05 ? ramp(t, 1.2, tBug) * (0.5 + 0.5 * Math.sin(t * (10 + t * 4))) * 0.75 : 0;
    const fl1 = t >= tBug && t < tBug + 0.5 ? 1 - (t - tBug) / 0.5 : 0;
    const sw1 = hiss1 * 0.06 + fl1 * 0.1 + (t > tKamu ? Math.max(0, Math.sin((t - tKamu) * 9)) * 0.03 * (1 - ramp(t, tKamu + 0.7, tKamu + 1.2)) : 0);
    Q1.G.scale.set(S * (1 + sw1), S * (1 + sw1 * 0.6), S * (1 + sw1));
    Q1.update(t, { m: 1, wf: Math.max(hiss1, fl1), headYaw: ramp(t, K.s8 + 1.6, K.s8 + 2.4) * 0.55 });

    // ---- Q2: the pig on the workbench
    const m2 = ramp(t, tMorph, tMorph + 1.6);
    const jit = t > tSwap && t < tSwap + 0.5 ? 0.06 : 0;
    let q2x = B[0], q2z = B[1], q2y = 0, walkPh = 0, walkAmt = 0;
    const yaw2 = ramp(t, tCreep, tCreep + 0.5) * Math.atan2(CR.x - B[0], CR.z - B[1]);
    const wu = clamp01((t - (tCreep + 0.4)) / (tHiss - 0.05 - tCreep - 0.4));
    if (t > tCreep + 0.4) { q2x = lerpA(B[0], CR.x, wu); q2z = lerpA(B[1], CR.z, wu); walkAmt = wu > 0 && wu < 1 ? 1 : 0; walkPh = wu * 22; }
    const hissOn = t > tHiss && t < tB ? (t - tHiss) / (tB - tHiss) : 0;
    const wf2 = hissOn ? (0.5 + 0.5 * Math.sin((t - tHiss) * (14 + hissOn * 30))) * (0.35 + 0.6 * hissOn) : 0;
    const sw2 = hissOn * 0.14;
    Q2.G.position.set(q2x, q2y, q2z); Q2.G.rotation.y = yaw2; Q2.G.scale.set(S * (1 + sw2), S * (1 + sw2 * 0.5), S * (1 + sw2));
    const eyeG = t > tAgr - 0.1 && t < tAgr + 1.6 ? Math.min(1, (t - tAgr + 0.1) * 5) * (0.75 + 0.25 * Math.sin(t * 20)) : t > tDia && t < tB ? 0.6 : 0;
    Q2.update(t, { m: m2, jit, walkPh, walkAmt, wf: wf2, eye: eyeG, boom: tB, headYaw: 0 });

    // hiss rings
    hissR.forEach((m, k) => { const ph = ((t - tHiss) * 3.2 + k / 3) % 1; m.visible = t > tHiss && t < tB; m.position.set(q2x, 2.5, q2z); m.scale.setScalar(1.4 + ph * 3.6); m.material.opacity = (1 - ph) * 0.8; });

    // ---- Q3: charged one
    const st1 = t >= tS1;
    const tint = st1 ? 0.35 + 0.15 * Math.sin(t * 9) : 0;
    const flS = (t > tS1 && t < tS1 + 0.4) || (t > tS2 && t < tS2 + 0.3) ? 0.9 : 0;
    Q3.update(t, { m: 1, tint, wf: flS * 0.4, headYaw: Math.sin(t * 0.7) * 0.15 });
    aura.forEach((g, k) => { const on = st1 ? ramp(t, tS1, tS1 + 0.3) : 0; const f = 0.55 + 0.45 * Math.sin(t * (17 + k * 9) + k * 2) * Math.sin(t * 5.3 + k); auraM[k].opacity = on * f * (k ? 0.2 : 0.32) * (t > tS2 && t < tS2 + 0.5 ? 1.6 : 1); g.visible = on > 0; });
    for (let i = 0; i < 40; i++) { const a = i * 2.4 + t * (2 + (i % 3)), h = (i * 0.37 + t * 1.5) % 7; ZP.pos.set([D[0] + Math.cos(a) * 1.9, h, D[1] + Math.sin(a) * 1.9], i * 3); }
    ZP.m.opacity = st1 ? 0.9 : 0; ZP.commit();
    const bOn = (u) => (u > 0 && u < 0.08) || (u > 0.14 && u < 0.22) || (u > 0.3 && u < 0.36);
    bolt.visible = bOn(t - tS1) || bOn(t - tS2); bolt.scale.x = bOn(t - tS2) && !bOn(t - tS1) ? -1 : 1;
    if (bolt.scale.x < 0) bolt.position.set(2 * D[0], 0, 0); else bolt.position.set(0, 0, 0);
    boltL.intensity = bolt.visible ? 120 : 0;

    // ---- gizmo
    const gIn = ramp(t, tBuild0 - 0.5, tBuild0 + 0.2), gOut = ramp(t, K.s4 + 0.2, K.s4 + 0.7);
    const gv = gIn * (1 - gOut);
    const pIn = ramp(t, K.s2 + 0.6, K.s2 + 1.4), pOut = ramp(t, tSatu, tSatu + 0.6);
    plate.visible = pIn * (1 - pOut) > 0.01; plate.scale.set(pIn * (1 - pOut) + 0.0001, 1, pIn * (1 - pOut) + 0.0001);
    const mm = smooth(m2), W = 1.0 * S, Hh = lerpA(0.8, 1.6, mm) * S, L = lerpA(1.6, 0.8, mm) * S, cy = (0.4 + lerpA(0.4, 0.8, mm)) * S;
    const flick = t > tSwap && t < tSwap + 0.5 && Math.floor(t * 24) % 2 === 0;
    barM.color.set(flick ? 0xff7a1a : 0xfff6e5);
    bars.forEach((b) => (b.visible = gv > 0.01));
    setBox(W + 0.3, Hh + 0.3, L + 0.3, B[0], cy, B[1], Math.max(0.001, gv));
    const ax = B[0] + W / 2 + 1.0;
    arH.visible = arV.visible = hdH.visible = hdV.visible = gv > 0.01;
    arH.position.set(ax, 0.3, B[1]); arH.scale.set(0.14 * gv, 0.14 * gv, L * gv);
    const vz = B[1] - L / 2 - 0.8; arV.position.set(ax, 0.4 * S + Hh / 2, vz); arV.scale.set(0.14 * gv, Hh * gv, 0.14 * gv);
    const tipH = [ax, 0.3, B[1] + L / 2 + 0.3], tipV = [ax, 0.4 * S + Hh + 0.3, vz];
    hdH.position.set(...tipH); hdV.position.set(...tipV); hdH.scale.setScalar(gv); hdV.scale.setScalar(gv);
    const su = smooth((t - tSwap) / 0.75);
    const arc = Math.sin(Math.PI * su) * 1.6;
    const pP = [lerpA(tipH[0], tipV[0], su) + arc * 0.6, lerpA(tipH[1], tipV[1], su) + 1.0 + arc, lerpA(tipH[2], tipV[2], su)];
    const pT = [lerpA(tipV[0], tipH[0], su) - arc * 0.6, lerpA(tipV[1], tipH[1], su) + 1.0 - arc * 0.3, lerpA(tipV[2], tipH[2], su)];
    lbP.position.set(...pP); lbT.position.set(...pT);
    for (const lb of [lbP, lbT]) { lb.quaternion.copy(cam.quaternion); lb.scale.setScalar(Math.max(0.001, gv * 0.6)); lb.visible = gv > 0.01; }
    // code board
    const bIn = ramp(t, K.s3 + 0.5, K.s3 + 0.9), bOut = ramp(t, K.s4 + 0.1, K.s4 + 0.4);
    const bs = Math.round(bIn * 4) / 4 * (1 - bOut);
    board.visible = bs > 0.01; board.scale.setScalar(Math.max(0.001, bs));
    const vu = smooth((t - tSwap) / 0.7), vArc = Math.sin(Math.PI * vu);
    const pulse = t > tKode && t < tKode + 1.6 ? 1 + 0.12 * Math.abs(Math.sin((t - tKode) * 8)) : 1;
    valA.position.set(valX + vArc * 0.3, lerpA(rowY[0], rowY[1], vu), 0.2 + vArc * 0.9); valA.scale.setScalar(pulse);
    valB.position.set(valX - vArc * 0.3, lerpA(rowY[1], rowY[0], vu), 0.2 + vArc * 0.3); valB.scale.setScalar(pulse);

    // ---- leaf tiles
    tiles.forEach((tl, i) => {
      const u = clamp01((t - (tl.ta - 0.9)) / 0.9);
      if (u <= 0 || u >= 1) { dummy.position.set(0, -60, 0); dummy.scale.setScalar(0.0001); }
      else { const e = smooth(u); dummy.position.set(lerpA(tl.from[0], tl.to[0], e), lerpA(tl.from[1], tl.to[1], e) + Math.sin(Math.PI * u) * 3.2, lerpA(tl.from[2], tl.to[2], e)); dummy.rotation.set(tl.rx + u * 9, u * 4, tl.rz + u * 7); dummy.scale.setScalar(1); }
      dummy.updateMatrix(); IL.setMatrixAt(i, dummy.matrix);
    });
    IL.instanceMatrix.needsUpdate = true;

    // ---- AI chip
    const cu = clamp01((t - (tAI - 0.35)) / 0.35);
    chip.visible = t > tAI - 0.35 && t < tCreep;
    chip.position.set(B[0] + 0.45 * S + 0.12, 2.45 * S + (1 - eout(cu)) * 7, B[1]);
    chip.scale.setScalar(cu < 1 ? 1 : 1 + 0.25 * Math.max(0, 1 - (t - tAI) * 4));

    // ---- explosion
    const dt = t - tB;
    const ex = dt > 0;
    fire.visible = core.visible = ex && dt < 0.9;
    if (fire.visible) { const s1 = 1 + eout(dt / 0.2) * 7.5; fire.scale.setScalar(s1); fire.rotation.y = dt * 2; fireM.opacity = 0.85 * (1 - clamp01(dt / 0.9)); core.scale.setScalar(s1 * 0.55); coreM.opacity = 1 - clamp01(dt / 0.35); }
    shock.visible = ex && dt < 0.8; if (shock.visible) { shock.scale.setScalar(1 + eout(dt / 0.8) * 12); ringM.opacity = 0.9 * (1 - dt / 0.8); }
    boomL.intensity = ex ? 4000 * Math.exp(-dt * 5) : 0;
    smoke.forEach((s, i) => {
      const u = dt - s.dl; let sc = 0;
      if (ex && u > 0 && u < 3.2) { const d = s.sp * (1 - Math.exp(-u * 2.2)); dummy.position.set(CR.x + s.d[0] * d, 1.2 + s.d[1] * d + u * 0.9, CR.z + s.d[2] * d); sc = s.s * (u < 0.3 ? u / 0.3 : 1 - clamp01((u - 0.3) / 2.9)) * 1.6; dummy.rotation.set(u * 0.6, s.ry + u, 0); }
      else dummy.position.set(0, -60, 0);
      dummy.scale.setScalar(Math.max(0.0001, sc)); dummy.updateMatrix(); ISm.setMatrixAt(i, dummy.matrix);
    });
    ISm.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < 90; i++) { const [a, e, sp] = spk[i]; const u = Math.max(0, dt); const on = ex && u < 1.4; SP.pos.set(on ? [CR.x + Math.cos(a) * Math.cos(e) * sp * u, 2 + Math.sin(e) * sp * u - 9 * u * u, CR.z + Math.sin(a) * Math.cos(e) * sp * u] : [0, -60, 0], i * 3); }
    SP.m.opacity = ex ? 1 - clamp01(dt / 1.4) : 0; SP.commit();
    // debris
    const putDeb = (M, list) => { list.forEach((d, i) => {
      if (!ex) { dummy.position.set(d.p[0], d.p[1], d.p[2]); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1); }
      else if (d.lands && dt >= d.tl) { dummy.position.set(d.xl, 0.5, d.zl); dummy.rotation.set(0, d.wy * d.tl, 0); dummy.scale.setScalar(1); }
      else { const y = d.p[1] + d.vy * dt - 0.5 * GR * dt * dt; dummy.position.set(d.p[0] + d.vx * dt, y, d.p[2] + d.vz * dt); dummy.rotation.set(d.wx * dt, d.wy * dt, d.wz * dt); dummy.scale.setScalar(y < -40 ? 0.0001 : 1); }
      dummy.updateMatrix(); M.setMatrixAt(i, dummy.matrix); }); M.instanceMatrix.needsUpdate = true; };
    putDeb(IG, debG); putDeb(ID, debD);

    // ---- shelf items and trophy sparkles
    items.forEach((x) => { const u = clamp01((t - x.t0) / 0.32); x.obj.scale.setScalar(Math.max(0.0001, x.s * (u <= 0 ? 0 : back(u, 2.4)))); });
    Q4.update(t, { m: 1, headYaw: Math.sin(t * 1.3) * 0.2 });
    for (let i = 0; i < 50; i++) { const a = i * 1.7 + t * 1.2, rr2 = 1.2 + (i % 5) * 0.35, h = 5.3 + ((i * 0.53 + t * 0.8) % 2.6); SPK.pos.set([SHELF[0] + Math.sin(a) * 0.6 + 0.4, h, SHELF[1] + Math.cos(a) * rr2], i * 3); }
    SPK.m.opacity = t > tLima ? 0.9 * (0.6 + 0.4 * Math.sin(t * 6)) : 0; SPK.commit();

    // ---- explorer
    let x = P0[0], z = P0[1], y = 0, moving = false, ph = 0, pitch = 0;
    const seg2 = (k) => { const [t0, t1, a, b] = mv[k]; const u = clamp01((t - t0) / (t1 - t0)), e = smooth(u); x = lerpA(a[0], b[0], e); z = lerpA(a[1], b[1], e); moving = u > 0 && u < 1; ph = e * Math.hypot(b[0] - a[0], b[1] - a[1]) * 1.7; };
    if (t < mv[0][0]) { x = P0[0]; z = P0[1]; }
    else if (t < mv[0][1]) seg2(0);
    else if (t < tB) { x = E1[0]; z = E1[1]; }
    else if (t < mv[1][0]) {
      const u = clamp01((t - tB) / 0.7), e = eout(u);
      x = lerpA(E1[0], K2[0], e); z = lerpA(E1[1], K2[1], e); y = Math.sin(Math.PI * u) * 2.4;
      const up = ramp(t, tUp, tUp + 0.45);
      pitch = -Math.PI / 2 * eout(u) * (1 - up); y += 0.42 * eout(u) * (1 - up);
    } else if (t < mv[1][1]) seg2(1);
    else if (t < mv[2][0]) { x = SH[0]; z = SH[1]; }
    else seg2(2);
    restPose(H); H.head.rotation.set(0, 0, 0);
    if (moving) runPose(H, ph);
    else {
      const sway = Math.sin(t * 2.1) * 0.05; H.armL.rotation.x = sway; H.armR.rotation.x = -sway;
      if (t < tBug) H.head.rotation.x = -0.28;
      if ((t > tBug && t < tBug + 0.35) || (t > tHiss && t < tB)) { H.armL.rotation.z = -2.5; H.armR.rotation.z = 2.5; y += Math.abs(Math.sin((t - tBug) * 14)) * 0.25; }
      if (t > tBuild0 && t < tBuild1) { H.armR.rotation.x = -1.5 + Math.sin(t * 14) * 0.3; H.armL.rotation.x = -0.9 + Math.sin(t * 14 + 1.5) * 0.2; }
      if (t > tMorph && t < tMorph + 0.8) { H.armL.rotation.z = -1.6; H.armR.rotation.z = 1.6; y += Math.sin(Math.PI * (t - tMorph) / 0.8) * 0.5; }
      if (t > AT["s4:Hasilnya"] && t < AT["s4:creepy"]) { H.armR.rotation.z = 2.8; H.armR.rotation.x = -0.7 + Math.sin(t * 18) * 0.14; H.head.rotation.z = 0.18; }
      if (t > AT["s4:creepy"] && t < K.s4e) { H.armR.rotation.x = -1.55; H.armR.rotation.z = 0.15; }
      if (t > tHij && t < tAI) { H.armL.rotation.x = -2.1; H.armL.rotation.z = -0.25; H.head.rotation.x = -0.3; }
      if (t > tAI && t < tAgr + 0.6) { y += Math.max(0, Math.sin((t - tAI) * 9)) * 0.3; H.armL.rotation.z = -0.9; H.armR.rotation.z = 0.9; }
      if (t > tDia && t < tHiss) H.head.rotation.y = Math.sin(t * 6) * 0.35;
      if (t > tB && t < tUp) { H.armL.rotation.z = -2.2; H.armR.rotation.z = 2.2; }
      if (t > K.s6e && t < tLima) { H.armL.rotation.z = -1.25; H.armL.rotation.x = -0.3; }
      if (t > tLima && t < K.s8) { const b2 = Math.abs(Math.sin((t - tLima) * 7)); H.armL.rotation.z = -2.7; H.armR.rotation.z = 2.7; y += b2 * 0.3 * (1 - ramp(t, tLima + 1.5, tLima + 2.2)); }
      if (t > mv[2][1]) { if (t < tKamu) { H.armR.rotation.z = 2.6 + Math.sin(t * 8) * 0.4; } else { H.armR.rotation.x = -1.55; H.armR.rotation.z = 0.1; } }
    }
    H.G.position.set(x, y, z); H.G.rotation.set(pitch, yawAt(t), 0);
    const hurt = t > tHurt && t < tUp + 0.3 ? (Math.floor(t * 8) % 2) * 0.9 : 0;
    hMats.forEach((m) => m.emissive.setRGB(hurt, 0.05 * hurt, 0.05 * hurt));

    comp.render();
  };
}
