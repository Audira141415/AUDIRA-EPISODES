// BLOCK TOWN: a floating voxel kingdom at golden hour. A literal chain of blocks hangs under it and grows as the film runs. The camera cranes between landmarks. Original art, no Nine Chronicles assets.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, stage, pts, back, envStrips } from "./lib3d.js";

const C = { grass: 0x6fa84a, grass2: 0x86bb55, dirt: 0x8a5f3a, stone: 0x9a9488, stone2: 0x7f7a70, water: 0x38a3c9, wood: 0x7b4f2a, roof: 0xc4543a, roof2: 0x3b6e8f, wall: 0xe9dcc0, leaf: 0x3f8a4a, leaf2: 0x5fa53c, gold: 0xf2b632, sand: 0xe0c98b, slime: 0x79d36b, red: 0xd8443a, ink: 0x2a2433, blue: 0x3a7fd6, pur: 0x7a54c8 };

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x9fc9e0, fog: 0.0016, exp: 1.08, bloom: [0.18, 0.5, 0.95] });
  envStrips(r, scene, [[30, 6, 0xffe2b0, 3, 0, 14, 8], [6, 24, 0x9fd8ff, 1.6, -14, 2, 6], [6, 24, 0xffb07a, 2, 14, 2, 4]], 0x8a7a70);
  const rnd = mulberry(600);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 24, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, vertexShader: "varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: "varying vec3 v;void main(){float h=clamp(v.y*.8+.42,0.,1.);vec3 a=vec3(1.,.66,.36);vec3 b=vec3(.42,.76,.95);vec3 c=vec3(.14,.45,.85);vec3 s=h<.5?mix(a,b,h/.5):mix(b,c,(h-.5)/.5);gl_FragColor=vec4(s,1.);}" }));
  scene.add(sky);
  scene.add(new THREE.HemisphereLight(0xcfe6ff, 0xa97c55, 1.65));
  const sun = new THREE.DirectionalLight(0xffe0ae, 3.6);
  sun.position.set(-70, 80, 60); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004;
  Object.assign(sun.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, far: 320 });
  scene.add(sun);

  // voxel buffer: every static block goes into one instanced mesh
  const V = [];
  const put = (x, y, z, c) => V.push([x, y, z, c]);
  const fill = (x0, y0, z0, x1, y1, z1, c) => { for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) put(x, y, z, typeof c === "function" ? c(x, y, z) : c); };
  const R = 46;
  const height = (x, z) => { const d = Math.hypot(x, z); const e = Math.sin(x * 0.11) * 1.5 + Math.cos(z * 0.13) * 1.5 + Math.sin((x + z) * 0.05) * 1.2; return Math.round(2 + e * Math.min(1, (R - d) / 18)); };
  const river = (x) => 4 + Math.sin(x * 0.13) * 6;
  const hMap = {};
  for (let x = -R; x <= R; x++) for (let z = -R; z <= R; z++) {
    const d = Math.hypot(x, z) + Math.sin(x * 0.3 + z * 0.2) * 2.5;
    if (d > R) continue;
    const isRiver = Math.abs(z - river(x)) < 2.4 && Math.abs(x) > 3;
    let h = height(x, z);
    if (isRiver) h = 0;
    hMap[x + "," + z] = h;
    put(x, h, z, isRiver ? C.water : (x * 3 + z * 7) % 5 === 0 ? C.grass2 : C.grass);
    const u = R - d, depth = Math.floor(2 + u * 0.55 + Math.sin(x * 0.7) * Math.cos(z * 0.6) * 3);
    for (let y = h - 1; y >= h - 2; y--) put(x, y, z, C.dirt);
    if ((x + z) % 2 === 0) for (let y = h - 3; y > -depth; y -= 2) { put(x, y, z, y < -6 ? C.stone2 : C.stone); put(x, y - 1, z, C.stone2); }
  }
  const G = (x, z) => hMap[x + "," + z] ?? 0;
  for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) put(x, 2, Math.round(river(0)) + z, C.wood); // bridge

  const house = (x, z, w, d, h, roofC) => { const y0 = G(x, z) + 1; fill(x, y0, z, x + w, y0 + h, z + d, (a, b, c) => (a === x || a === x + w || c === z || c === z + d ? ((a + b + c) % 7 === 0 ? C.sand : C.wall) : -1)); for (let i = 0; i <= Math.ceil(d / 2) + 1; i++) fill(x - 1, y0 + h + 1 + i, z + i - 1, x + w + 1, y0 + h + 1 + i, z + d - i + 1, roofC); put(x + Math.floor(w / 2), y0, z + d, C.wood); put(x + Math.floor(w / 2), y0 + 1, z + d, C.wood); put(x + 1, y0 + 2, z + d, C.blue); put(x + w - 1, y0 + 2, z + d, C.blue); };
  house(-30, -30, 8, 7, 5, C.roof); house(-16, -36, 9, 7, 6, C.roof2); house(-34, -14, 7, 7, 5, C.roof2); house(-6, -22, 7, 6, 5, C.roof); house(4, -34, 8, 7, 6, C.roof);
  const tree = (x, z) => { const y0 = G(x, z) + 1, h = 4 + Math.floor(rnd() * 3); fill(x, y0, z, x, y0 + h, z, C.wood); const c = rnd() > 0.5 ? C.leaf : C.leaf2; for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) for (let e = -2; e <= 3; e++) if (a * a + b * b + e * e < 11 && rnd() > 0.1) put(x + a, y0 + h + e, z + b, c); };
  for (let i = 0; i < 26; i++) { const a = rnd() * 6.283, d = 22 + rnd() * 20, x = Math.round(Math.cos(a) * d), z = Math.round(Math.sin(a) * d); if (Math.abs(z - river(x)) > 5 && !(x > -38 && x < 14 && z < -8 && z > -44) && !(x > 12 && z > -18 && z < 24) && !(x > -16 && x < 14 && z > 12 && z < 38)) tree(x, z); }

  // castle on the north edge
  fill(14, 3, -40, 34, 12, -24, (a, b, c) => (a === 14 || a === 34 || c === -40 || c === -24 ? C.stone : -1));
  for (const [x, z] of [[14, -40], [34, -40], [14, -24], [34, -24]]) { fill(x - 2, 3, z - 2, x + 2, 18, z + 2, C.stone2); fill(x - 3, 19, z - 3, x + 3, 19, z + 3, C.stone); for (let i = 0; i < 4; i++) fill(x - 2 + i, 20 + i, z - 2 + i, x + 2 - i, 20 + i, z + 2 - i, C.roof); }
  for (let x = 14; x <= 34; x += 2) put(x, 13, -24, C.stone2);
  fill(21, 3, -24, 27, 8, -24, C.ink);

  // arena: stone ring on the east
  const AX = 22, AZ = 6;
  for (let a = 0; a < 6.283; a += 0.05) for (let ring = 12; ring <= 15; ring++) { const x = Math.round(AX + Math.cos(a) * ring), z = Math.round(AZ + Math.sin(a) * ring); const y = 3 + (ring - 12) * 2; for (let e = 2; e <= y; e++) put(x, e, z, (x + z + e) % 3 ? C.stone : C.sand); }
  fill(AX - 11, 3, AZ - 11, AX + 11, 3, AZ + 11, (a, b, c) => (Math.hypot(a - AX, c - AZ) < 11.6 ? C.sand : -1));

  // market square: stalls with striped awnings, south-west
  const stall = (x, z, c) => { const y0 = G(x, z) + 1; fill(x, y0, z, x, y0 + 4, z, C.wood); fill(x + 6, y0, z, x + 6, y0 + 4, z, C.wood); fill(x, y0, z + 4, x, y0 + 4, z + 4, C.wood); fill(x + 6, y0, z + 4, x + 6, y0 + 4, z + 4, C.wood); fill(x - 1, y0 + 5, z - 1, x + 7, y0 + 5, z + 5, (a) => (a % 2 ? c : C.wall)); fill(x + 1, y0 + 1, z + 1, x + 5, y0 + 1, z + 3, C.wood); put(x + 2, y0 + 2, z + 2, C.gold); put(x + 4, y0 + 2, z + 2, C.blue); };
  stall(-34, 18, C.red); stall(-24, 22, C.pur); stall(-34, 28, C.blue); stall(-22, 32, C.red);

  // forge: anvil and hearth by the river, west
  const FX = -18, FZ = 4;
  fill(FX - 4, G(FX, FZ) + 1, FZ - 3, FX + 4, G(FX, FZ) + 1, FZ + 3, C.stone2);
  fill(FX - 1, G(FX, FZ) + 2, FZ, FX + 1, G(FX, FZ) + 3, FZ, C.ink);
  fill(FX - 2, G(FX, FZ) + 4, FZ, FX + 2, G(FX, FZ) + 4, FZ, C.ink);

  // dock on the far south edge, with a gate that leads off the island to the outside chain
  const OX = 8, OZ = 42;
  for (let z = OZ - 6; z <= OZ + 22; z++) for (let x = OX - 2; x <= OX + 2; x++) put(x, 2, z, z % 2 ? C.wood : C.sand);
  fill(OX - 6, 3, OZ + 22, OX - 5, 16, OZ + 22, C.blue); fill(OX + 5, 3, OZ + 22, OX + 6, 16, OZ + 22, C.blue); fill(OX - 6, 17, OZ + 22, OX + 6, 18, OZ + 22, C.blue);

  const list = V.filter((v) => v[3] !== -1);
  const box1 = new THREE.BoxGeometry(1, 1, 1);
  const chainQ = new THREE.MeshStandardMaterial({ color: 0x3a7fd6, roughness: 0.4, metalness: 0.3, emissive: 0x38d0ff, emissiveIntensity: 0.3 });
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.82, metalness: 0.02 });
  const world = new THREE.InstancedMesh(box1, mat, list.length);
  world.frustumCulled = false; world.castShadow = world.receiveShadow = true;
  const dummy = new THREE.Object3D(), col = new THREE.Color();
  list.forEach((v, i) => { dummy.position.set(v[0], v[1], v[2]); dummy.updateMatrix(); world.setMatrixAt(i, dummy.matrix); world.setColorAt(i, col.setHex(v[3]).offsetHSL(0, 0, ((v[0] * 7 + v[2] * 13 + v[1] * 3) % 7) * 0.004)); });
  scene.add(world);

  // dynamic voxel sprites: built from a list of [x,y,z,color], each a small group
  const sprite = (cells, s = 1) => { const g = new THREE.Group(); const byC = {}; for (const c of cells) (byC[c[3]] ??= []).push(c); for (const k in byC) { const m = new THREE.InstancedMesh(box1, new THREE.MeshStandardMaterial({ color: +k, roughness: 0.65, metalness: +k === C.gold ? 0.5 : 0 }), byC[k].length); byC[k].forEach((c, i) => { dummy.position.set(c[0], c[1], c[2]); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); }); m.castShadow = true; m.frustumCulled = false; g.add(m); } g.scale.setScalar(s); return g; };
  const heroCells = (arm, tunic) => { const c = []; for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) { for (let y = 3; y <= 5; y++) c.push([x, y, z, y === 5 ? 0x5a3a24 : 0xf0c8a0]); c.push([x, 6, z, 0x5a3a24]); for (let y = 1; y <= 2; y++) c.push([x, y, z, tunic]); } c.push([-1, 4, 2, C.ink], [1, 4, 2, C.ink]); c.push([-1, 0, 0, C.ink], [1, 0, 0, C.ink]); if (arm) for (let y = 1; y <= 7; y++) c.push([2, y + 1, 1, y > 2 ? 0xd9e2ea : C.wood]); return c; };
  const hero = sprite(heroCells(true, C.red), 0.62); scene.add(hero);
  const slimes = []; for (let i = 0; i < 4; i++) { const c = []; for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) for (let y = 0; y <= 3; y++) if (x * x + z * z + y * y / 2 < 7) c.push([x, y, z, C.slime]); c.push([-1, 2, 3, C.ink], [1, 2, 3, C.ink]); const g = sprite(c, 0.62); scene.add(g); slimes.push(g); }
  const shopper = sprite(heroCells(false, C.blue), 0.58); shopper.position.set(-21, G(-21, 21) + 1, 26); scene.add(shopper);
  const fighter = sprite(heroCells(true, C.pur), 0.62); scene.add(fighter);
  const matCube = sprite([[0, 0, 0, C.pur]], 1.3); scene.add(matCube);
  const gearCells = []; for (let y = 0; y < 8; y++) gearCells.push([0, y, 0, y < 2 ? C.wood : 0xd9e2ea]); gearCells.push([-1, 2, 0, C.gold], [1, 2, 0, C.gold]);
  const gear = sprite(gearCells, 0.9); scene.add(gear);
  const stallItem = gear.clone(); scene.add(stallItem);
  const queue = []; for (let i = 0; i < 8; i++) { const m = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.7, 1.7), chainQ); b.castShadow = true; m.add(b); m.position.set(FX + 8, G(FX, FZ) + 2 + i * 2, FZ - 1); scene.add(m); queue.push(m); }
  const medals = []; for (let i = 0; i < 18; i++) { const m = sprite([[0, 0, 0, C.gold]], 1.2); scene.add(m); medals.push(m); }

  // the chain: blocks hanging under the island; every block joins as time passes. Honest visual for "one block per ~10 s".
  const chainN = 30;
  const chainM = new THREE.MeshStandardMaterial({ color: 0x2a3a58, roughness: 0.3, metalness: 0.7, emissive: 0x38d0ff, emissiveIntensity: 0.4 });
  const blocks = [];
  for (let i = 0; i < chainN; i++) { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), chainM); g.add(m); g.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color: 0x8fe8ff }))); const a = i * 0.5 + 1.2, R0 = 20 + i * 0.75; g.position.set(Math.cos(a) * R0, -20 - i * 2.2, Math.sin(a) * R0); scene.add(g); blocks.push(g); }

  // coin pile: a tower of NCG. Its height is a scale gag, then it collapses to its dollar worth.
  const coinM = new THREE.MeshStandardMaterial({ color: C.gold, metalness: 0.75, roughness: 0.3 });
  const pile = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.6, 1.6, 0.55, 14), coinM, 720); pile.frustumCulled = false; pile.castShadow = true; scene.add(pile);
  const PX = -2, PZ = 24;
  const pileS = []; for (let i = 0; i < 720; i++) { const a = rnd() * 6.283, d = Math.sqrt(rnd()) * (7.5 - (i / 720) * 6.8); pileS.push([PX + Math.cos(a) * d, 3 + (i / 720) * 15, PZ + Math.sin(a) * d, rnd() * 0.4, rnd()]); }

  const glow = pts(scene, 240, { color: 0xfff0b0, size: 0.5, opacity: 0.9 });
  const glowS = []; for (let i = 0; i < 240; i++) glowS.push([(rnd() - 0.5) * 100, 3 + rnd() * 26, (rnd() - 0.5) * 100, rnd() * 6, 0.2 + rnd() * 0.4]);
  const clouds = []; const cloudM = new THREE.MeshStandardMaterial({ color: 0xfff2dc, roughness: 1 }); for (let i = 0; i < 16; i++) { const g = new THREE.Group(); for (let k = 0; k < 8; k++) { const b = new THREE.Mesh(box1, cloudM); b.scale.set(9 + rnd() * 14, 3 + rnd() * 4, 7 + rnd() * 9); b.position.set((rnd() - 0.5) * 26, (rnd() - 0.5) * 3, (rnd() - 0.5) * 12); g.add(b); } const a = (i / 16) * 6.283; g.position.set(Math.cos(a) * 130, -18 + rnd() * 52, Math.sin(a) * 130); scene.add(g); clouds.push(g); }

  const craftT = AT["s3:Crafting"], blokT = AT["s3:blok"], shopT = AT["s4:Shop"], soldT = AT["s4:laku"], medT = AT["s5:medali"], stakeT = AT["s5:Staking"], wncgT = AT["s6:WNCG"], feeT = AT["s6:biaya"], countT = AT["s7:empat"], worthT = AT["s7:lima"], arena = K.s5;
  const land = { cx: 0, cz: 0 };
  // Each key frames one landmark: subject base at about two thirds of the frame, inside the empty band under the panel.
  const camT = track([
    [0, -74, 8, 16, -50, 7.6, 5],
    [K.s1e - 1, -10, 70, 150, 0, -6, -6],
    [K.s2 + 1, 18, 62, 118, 0, 5, -8],
    [K.s2e - 0.4, -46, 26, 84, -22, 8, -24],
    [K.s3 + 1.6, 2, 15, 33, -16, 7, 4],
    [K.s3e - 0.3, -9, 14, 33, -15, 6.6, 4],
    [K.s4 + 1.4, -46, 15, 62, -28, 8.2, 27],
    [K.s4e - 0.4, -18, 14, 66, -26, 7.6, 26],
    [K.s5 + 1.2, 4, 20, 50, 22, 8.5, 6],
    [K.s5e - 0.5, 44, 20, 46, 22, 8, 6],
    [K.s6 + 1.4, 26, 18, 96, 8, 8, 52],
    [K.s6e - 0.4, -10, 20, 104, 8, 8, 56],
    [K.s7 + 1.2, -20, 22, 70, PX, 11, PZ],
    [worthT, -8, 15, 62, PX, 8, PZ],
    [K.s7e, 8, 13, 56, PX, 6.6, PZ],
    [K.s8 + 1.2, 44, 80, 120, 0, 3, -2],
    [K.end, -30, 106, 158, 0, -2, -2],
    [K.dur, -40, 112, 168, 0, -3, -2],
  ]);
  const hop = (t, sp, h) => Math.abs(Math.sin(t * sp)) * h;
  const heroPath = (t) => {
    if (t < K.s3 - 0.2) return [-50 + Math.sin(t * 0.2) * 1, G(-50, 5) + 1, 5, 0.9];
    if (t < K.s4 - 0.2) return [FX - 6, G(FX, FZ) + 2, FZ + 2, 1.0];
    if (t < K.s5 - 0.2) return [-29, G(-29, 22) + 1, 24, 0.2];
    if (t < K.s6 - 0.2) return [AX - 5, 4, AZ, 1.57];
    if (t < K.s7 - 0.2) return [OX, 3, OZ + 8 + ramp(t, K.s6, K.s6e) * 12, 3.14];
    return [PX + 6, G(PX + 6, PZ + 7) + 1, PZ + 7, -0.5];
  };

  return (t) => {
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.5) * 0.5, c[1] + Math.sin(t * 0.7) * 0.25, c[2]);
    cam.lookAt(c[3], c[4], c[5]);

    const hp = heroPath(t);
    const fight = t < K.s3 - 0.3;
    hero.position.set(hp[0], hp[1] + hop(t, fight ? 6 : 3, fight ? 0.9 : 0.25), hp[2]);
    hero.rotation.y = hp[3] + (fight ? Math.sin(t * 6) * 0.35 : 0);
    fighter.position.set(AX + 5, 4 + hop(t, 5, 0.6), AZ); fighter.rotation.y = -1.57;
    shopper.position.y = G(-21, 21) + 1 + hop(t + 1, 3, 0.2);

    // slimes wander by the hero in the opening, get bonked, drop a material cube
    const dieT = AT["s1:Setiap"] + 0.3;
    slimes.forEach((s, i) => {
      const a = i * 1.57 + t * 0.6, alive = 1 - ramp(t, dieT + i * 1.4, dieT + i * 1.4 + 0.25);
      const x = -46 + Math.cos(a) * (6 + i), z = 5 + Math.sin(a) * (4 + i);
      s.position.set(x, G(Math.round(x), Math.round(z)) + 1 + hop(t + i, 4, 1.1), z);
      s.scale.setScalar(Math.max(0.001, 0.62 * alive * (t < K.s3 ? 1 : 0)));
      s.rotation.y = -a;
    });
    matCube.position.set(-46, 7 + Math.sin(t * 2) * 0.5, 3); matCube.rotation.y = t * 1.5;
    matCube.scale.setScalar(Math.max(0.001, back((t - dieT) / 0.4) * 1.3 * (1 - ramp(t, K.s1e - 1.4, K.s1e - 1))));

    // craft: gear rises from the anvil as blocks stack beside it
    const made = ramp(t, craftT, K.s3e - 1);
    gear.position.set(FX, G(FX, FZ) + 5 + made * 2, FZ);
    gear.rotation.y = t * 1.3;
    gear.scale.setScalar(Math.max(0.001, 0.9 * ramp(t, craftT + 2.6, craftT + 3.4) * (1 - ramp(t, K.s4 - 0.3, K.s4))));
    stallItem.position.set(-22, G(-22, 26) + 8 + Math.sin(t * 2) * 0.4, 25);
    stallItem.rotation.y = t;
    stallItem.scale.setScalar(Math.max(0.001, 0.9 * ramp(t, shopT - 0.3, shopT + 0.4) * (1 - ramp(t, soldT, soldT + 0.3))));

    queue.forEach((m, i) => m.scale.setScalar(Math.max(0.0001, back((t - blokT - i * 0.45) / 0.3) * (1 - ramp(t, K.s4 - 0.3, K.s4)))));

    // medals fall into the arena, then fly to fighters in proportion
    medals.forEach((m, i) => {
      const a = medT + i * 0.11, u = clamp01((t - a) / 0.8);
      const toH = i % 3 === 0;
      const ang = (i / 18) * 6.283 + t * 0.7;
      m.position.set(AX + Math.cos(ang) * (6 + (i % 5)), 22 - 14 * eout(u), AZ + Math.sin(ang) * (6 + (i % 5)));
      m.rotation.y = t * 3 + i;
      m.scale.setScalar(u > 0 && t < K.s6 - 0.2 ? 1.2 : 0.0001);
    });

    // chain: visible blocks equal elapsed time at one per ~3 s of film so the growth reads on a phone; the panel states the real figure
    const shown = Math.floor(t / 3);
    blocks.forEach((b, i) => { const u = clamp01((t + 30 - i * 3) / 0.5); b.scale.setScalar(Math.max(0.0001, back(u))); b.rotation.y = i * 0.4 + t * 0.08; });
    chainM.emissiveIntensity = 0.45 + 0.25 * Math.max(0, Math.sin(t * 2));

    // pile: rises on the big number, collapses on the honest conversion
    const up = ramp(t, countT - 0.2, countT + 1.4), down = ramp(t, worthT - 0.1, worthT + 1.1);
    const hN = up * (1 - down * 0.93);
    for (let i = 0; i < 720; i++) { const s = pileS[i], fr = i / 720; const show = fr < hN; dummy.position.set(s[0], show ? s[1] : -90, s[2]); dummy.rotation.set(s[3], s[4] * 6, s[3] * 0.5); dummy.scale.setScalar(show ? 1 : 0.0001); dummy.updateMatrix(); pile.setMatrixAt(i, dummy.matrix); }
    pile.instanceMatrix.needsUpdate = true;

    const gi = glow.pos;
    for (let i = 0; i < 240; i++) { const g = glowS[i]; gi[i * 3] = g[0] + Math.sin(t * g[4] + g[3]) * 2; gi[i * 3 + 1] = g[1] + Math.sin(t * g[4] * 1.3 + g[3]) * 1.6; gi[i * 3 + 2] = g[2] + Math.cos(t * g[4] + g[3]) * 2; }
    glow.commit();
    clouds.forEach((g, i) => { g.position.x += 0; g.rotation.y = 0; g.position.y += Math.sin(t * 0.3 + i) * 0.004; });
    comp.render();
  };
}
