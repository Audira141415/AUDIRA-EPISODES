// LAST BANNER: one slow orbit around a fantasy castle from sunset to night. Hologram economy rails run through the courtyard, then shut off one by one. Original art, no ROHAN assets.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, std, box, cyl, stage, pts, figure, back, envStrips } from "./lib3d.js";

const RUBY = 0xe0234e, HOLO = 0x38e8ff, GOLD = 0xf5c451;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x161030, fog: 0.0042, exp: 1.12, bloom: [0.36, 0.6, 0.88] });
  envStrips(r, scene, [[30, 5, 0xffc27a, 6, 0, 10, 12], [5, 24, HOLO, 2.4, -16, 3, 6], [5, 24, 0xff5a7a, 3, 16, 3, 6], [40, 3, 0xffffff, 1.2, 0, -8, 8]]);
  const rnd = mulberry(2026);

  // sky dome: a vertical gradient that slides from sunset to night
  const skyU = { n: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 20), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
    vertexShader: "varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "varying vec3 v;uniform float n;void main(){float h=clamp(v.y*1.6+.12,0.,1.);vec3 a=mix(vec3(1.,.5,.2),vec3(.05,.07,.2),n);vec3 b=mix(vec3(.62,.2,.3),vec3(.03,.04,.13),n);vec3 c=mix(vec3(.1,.08,.26),vec3(.01,.012,.05),n);vec3 s=h<.2?mix(a,b,h/.2):mix(b,c,min(1.,(h-.2)/.4));gl_FragColor=vec4(s,1.);}" }));
  scene.add(sky);
  const hemi = new THREE.HemisphereLight(0xffb48a, 0x2a2340, 2.1); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffa766, 3.2);
  sun.position.set(-90, 46, 60); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, far: 300 });
  scene.add(sun);
  const moon = new THREE.DirectionalLight(0x7f9bff, 0); moon.position.set(60, 80, 40); scene.add(moon);

  // hill: displaced disc with grass on the slopes and stone paving in the courtyard
  const hg = new THREE.CircleGeometry(300, 96, 0, 6.2832);
  const hgp = hg.attributes.position;
  const grassT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#4b5a33"; g.fillRect(0, 0, w, h); const q = mulberry(7); for (let i = 0; i < 4000; i++) { const v = q(); g.fillStyle = v > 0.5 ? "rgba(90,115,58,.5)" : "rgba(40,50,28,.5)"; g.fillRect(q() * w, q() * h, 2 + q() * 5, 2 + q() * 5); } }, [24, 24]);
  const hill = new THREE.Mesh(new THREE.PlaneGeometry(600, 600, 120, 120), new THREE.MeshStandardMaterial({ map: grassT, roughness: 0.95 }));
  const hp = hill.geometry.attributes.position;
  for (let i = 0; i < hp.count; i++) { const x = hp.getX(i), y = hp.getY(i), d = Math.hypot(x, y); const b = d < 132 ? 0 : -(d - 132) * 0.28 + Math.sin(x * 0.05) * 3 + Math.cos(y * 0.07) * 3; hp.setZ(i, b); }
  hill.geometry.computeVertexNormals(); hill.rotation.x = -Math.PI / 2; hill.receiveShadow = true; scene.add(hill);
  const paveT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#6f675e"; g.fillRect(0, 0, w, h); const q = mulberry(3); for (let y = 0; y < h; y += 40) for (let x = (y / 40) % 2 ? -30 : 0; x < w; x += 60) { const v = 88 + q() * 44; g.fillStyle = `rgb(${v},${v - 6},${v - 14})`; g.fillRect(x + 2, y + 2, 56, 36); } }, [10, 10]);
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(130, 64), new THREE.MeshStandardMaterial({ map: paveT, roughness: 0.82 })); plaza.rotation.x = -Math.PI / 2; plaza.position.y = 0.05; plaza.receiveShadow = true; scene.add(plaza);

  // castle: curtain wall, towers, keep; every window is an instance so they can go dark one at a time
  const stoneT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#5e584f"; g.fillRect(0, 0, w, h); const q = mulberry(9); for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? -16 : 0; x < w; x += 32) { const v = 122 + q() * 20; g.fillStyle = `rgb(${v},${v - 8},${v - 20})`; g.fillRect(x + 1, y + 1, 30, 14); } }, [4, 4]);
  const stone = new THREE.MeshStandardMaterial({ map: stoneT, roughness: 0.9 });
  const roofM = std(0x7a1b33, 0.6, 0.2), goldM = std(GOLD, 0.25, 1);
  const castle = new THREE.Group(); castle.position.set(0, 0, -30); scene.add(castle);
  const tower = (x, z, rad, h, roof = true) => { cyl(rad, rad * 1.1, h, 16, stone, x, h / 2, z, castle); for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.283; box(1.1, 1.2, 1.1, stone, x + Math.cos(a) * rad, h + 0.5, z + Math.sin(a) * rad, castle); } if (roof) { const c = new THREE.Mesh(new THREE.ConeGeometry(rad * 1.25, rad * 2.3, 16), roofM); c.position.set(x, h + rad * 1.2 + 0.5, z); c.castShadow = true; castle.add(c); } };
  tower(-26, 16, 5, 25); tower(26, 16, 5, 25); tower(-26, -18, 5, 28); tower(26, -18, 5, 28);
  box(47, 15, 4, stone, 0, 7.5, 16, castle); box(4, 15, 34, stone, -26, 7.5, -1, castle); box(4, 15, 34, stone, 26, 7.5, -1, castle);
  box(20, 40, 18, stone, 0, 20, -3, castle); tower(-10, -3, 4.2, 48); tower(10, -3, 4.2, 48); tower(0, -8, 6, 60);
  const roofKeep = new THREE.Mesh(new THREE.ConeGeometry(15, 12, 4), roofM); roofKeep.rotation.y = Math.PI / 4; roofKeep.position.set(0, 46, -3); castle.add(roofKeep);
  const winM = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const winSpots = [];
  for (let i = 0; i < 46; i++) {
    const k = rnd();
    if (k < 0.4) winSpots.push([-8 + rnd() * 16, 14 + rnd() * 24, 6.2]);
    else if (k < 0.6) { const a = rnd() * 3.14; winSpots.push([-10 + Math.cos(a) * 4.3, 28 + rnd() * 18, -3 + Math.sin(a) * 4.3]); }
    else if (k < 0.8) { const a = rnd() * 3.14; winSpots.push([10 + Math.cos(a) * 4.3, 28 + rnd() * 18, -3 + Math.sin(a) * 4.3]); }
    else winSpots.push([(rnd() > 0.5 ? -1 : 1) * 26 + Math.cos(rnd() * 6) * 4, 8 + rnd() * 14, 21]);
  }
  const wins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 1.7, 0.3), winM, winSpots.length);
  wins.frustumCulled = false;
  const dummy = new THREE.Object3D();
  winSpots.forEach((w, i) => { dummy.position.set(w[0], w[1], w[2]); dummy.updateMatrix(); wins.setMatrixAt(i, dummy.matrix); wins.setColorAt(i, new THREE.Color(0xffc86a).multiplyScalar(1.5)); });
  castle.add(wins);
  const winOrder = winSpots.map((_, i) => (i * 37) % winSpots.length);
  const bannerT = canvasTex(128, 256, (g, w, h) => { g.fillStyle = "#a01836"; g.fillRect(0, 0, w, h); g.fillStyle = "#f5c451"; g.beginPath(); g.moveTo(64, 50); g.lineTo(106, 110); g.lineTo(64, 180); g.lineTo(22, 110); g.closePath(); g.fill(); g.fillStyle = "#a01836"; g.fillRect(58, 70, 12, 90); });
  const banners = [];
  for (const [x, z] of [[-16, 19], [-6, 19], [6, 19], [16, 19]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(5, 11, 6, 12), new THREE.MeshStandardMaterial({ map: bannerT, side: THREE.DoubleSide, roughness: 0.7 })); m.position.set(x, 8.4, z - 30); m.userData.base = m.geometry.attributes.position.array.slice(); m.userData.top = 8.4; scene.add(m); banners.push(m); }
  // gatehouse behind the first banners
  box(8, 10, 2, std(0x1a1414, 0.8, 0), 0, 5, 18.2, castle);

  // knight with a raised sword: the reward beat at the top of the film
  const K1 = figure(std(0x2a1a22, 0.7, 0.2), std(0x8a7446, 0.42, 0.85), std(0x4a382c, 0.7, 0), 1.25);
  K1.G.position.set(-9, 0, 40); K1.G.rotation.y = 0.5; scene.add(K1.G);
  const sw = new THREE.Group(); box(0.28, 5.2, 0.12, std(0xdfe6ee, 0.18, 1), 0, -4.2, 0, sw); box(1.4, 0.24, 0.3, goldM, 0, -1.6, 0, sw); K1.armR.add(sw);
  const capeG = new THREE.PlaneGeometry(2, 3.6, 6, 10);
  const capeB = capeG.attributes.position.array.slice();
  const cape = new THREE.Mesh(capeG, new THREE.MeshStandardMaterial({ color: 0x8f1730, roughness: 0.75, side: THREE.DoubleSide })); cape.position.set(0, 2.5, -0.8); K1.G.add(cape);

  // the three tokens. Each has its own read: a cut gem, a gem in a steel cage, a pure hologram.
  const gemM = new THREE.MeshPhysicalMaterial({ color: RUBY, emissive: RUBY, emissiveIntensity: 0.35, metalness: 0.15, roughness: 0.08, clearcoat: 1, flatShading: true });
  const makeRuby = (s) => { const m = new THREE.Mesh(new THREE.OctahedronGeometry(s, 0), gemM); m.scale.y = 1.25; m.castShadow = true; return m; };
  const makeS = (s) => { const g = new THREE.Group(); g.add(makeRuby(s * 0.8)); const c = new THREE.Mesh(new THREE.TorusGeometry(s * 1.15, s * 0.1, 8, 28), std(0xdfe3ea, 0.2, 1)); g.add(c); const c2 = c.clone(); c2.rotation.y = Math.PI / 2; g.add(c2); return g; };
  const holoM = new THREE.MeshBasicMaterial({ color: new THREE.Color(HOLO).multiplyScalar(1.25), wireframe: true });
  const makeX = (s) => { const g = new THREE.Group(); const a = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), holoM); g.add(a); const b = new THREE.Mesh(new THREE.OctahedronGeometry(s * 0.55, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(HOLO).multiplyScalar(0.9), transparent: true, opacity: 0.55 })); g.add(b); return g; };

  // three plinths in the courtyard, with the token above each
  const pl = new THREE.Group(); pl.position.set(0, 0, 44); scene.add(pl);
  const plinthM = std(0x2b2a36, 0.35, 0.8);
  const P = [[-9.5, makeRuby(2.5)], [0, makeS(2.7)], [9.5, makeX(2.9)]];
  for (const [x, g] of P) { cyl(2.4, 2.9, 3.4, 8, plinthM, x, 1.7, 0, pl); const h = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.09, 8, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(GOLD).multiplyScalar(1.3) })); h.rotation.x = Math.PI / 2; h.position.set(x, 3.42, 0); pl.add(h); g.position.set(x, 7, 0); pl.add(g); }

  // rail: a hologram arc through the courtyard. Stations: chest, RAMP ring, DEX tower.
  const railPts = [[-34, 2, 30], [-22, 3, 42], [-8, 5, 50], [8, 7, 50], [24, 9, 40], [38, 11, 26]].map((p) => new THREE.Vector3(...p));
  const curve = new THREE.CatmullRomCurve3(railPts);
  const railM = new THREE.MeshBasicMaterial({ color: new THREE.Color(HOLO).multiplyScalar(1.4), transparent: true, opacity: 1 });
  const rail = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.16, 8), railM); scene.add(rail);
  const chest = new THREE.Group(); chest.position.copy(curve.getPoint(0.04)); chest.position.y = 0; scene.add(chest);
  box(5, 3, 3.4, std(0x5a3518, 0.7, 0.1), 0, 1.5, 0, chest); box(5.2, 0.5, 3.6, goldM, 0, 3.1, 0, chest); box(0.9, 1, 0.3, goldM, 0, 2.4, 1.8, chest);
  const rampRing = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.4, 12, 48), new THREE.MeshStandardMaterial({ color: 0x18223a, metalness: 0.9, roughness: 0.2, emissive: HOLO, emissiveIntensity: 1 }));
  rampRing.position.copy(curve.getPoint(0.5)); rampRing.lookAt(curve.getPoint(0.52)); scene.add(rampRing);
  const dex = new THREE.Group(); dex.position.copy(curve.getPoint(1)); dex.position.y = 0; scene.add(dex);
  const dexM = new THREE.MeshStandardMaterial({ color: 0x151a2c, metalness: 0.85, roughness: 0.25, emissive: HOLO, emissiveIntensity: 0.16 });
  cyl(2.8, 4, 9, 6, dexM, 0, 4.5, 0, dex); cyl(2, 2.8, 5, 6, dexM, 0, 11.5, 0, dex);
  const dexH = new THREE.Mesh(new THREE.OctahedronGeometry(1.9, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(HOLO).multiplyScalar(1.4) })); dexH.position.y = 16.5; dex.add(dexH);
  const rider = makeS(2.1), riderX = makeX(2.2); scene.add(rider, riderX);
  const holoL = new THREE.PointLight(HOLO, 0, 70, 1.5); holoL.position.set(0, 12, 50); scene.add(holoL);

  // ruby heap: one billion shrinks to fifteen million. Instances fall out by order, so the pile visibly melts.
  const heapN = 900;
  const heap = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.9, 0), gemM, heapN); heap.frustumCulled = false; scene.add(heap);
  const hs = [];
  for (let i = 0; i < heapN; i++) { const u = Math.sqrt(rnd()), a = rnd() * 6.283, R0 = u * 15; const h = (1 - u) * 14 * rnd() + 0.6; hs.push([Math.cos(a) * R0, h, Math.sin(a) * R0 + 46, rnd() * 6, 0.65 + rnd() * 0.55, rnd()]); }
  const burn = pts(scene, 500, { color: 0xff7a3a, size: 0.8 });
  const burnS = []; for (let i = 0; i < 500; i++) burnS.push([rnd(), rnd(), rnd()]);

  const stars = pts(scene, 900, { color: 0xdfe8ff, size: 1.8, opacity: 0 });
  for (let i = 0; i < 900; i++) { const a = rnd() * 6.283, e = 0.15 + rnd() * 1.2, R0 = 480; stars.pos[i * 3] = Math.cos(a) * Math.cos(e) * R0; stars.pos[i * 3 + 1] = Math.sin(e) * R0; stars.pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * R0; }
  stars.commit();
  const mtn = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 5), new THREE.MeshStandardMaterial({ color: 0x2c2144, roughness: 1, flatShading: true }), 46);
  mtn.frustumCulled = false;
  for (let i = 0; i < 46; i++) { const a = (i / 46) * 6.283 + rnd() * 0.1, R0 = 300 + rnd() * 120, h = 50 + rnd() * 110; dummy.position.set(Math.cos(a) * R0, h / 2 - 50, Math.sin(a) * R0); dummy.scale.set(60 + rnd() * 70, h, 60 + rnd() * 70); dummy.rotation.set(0, rnd() * 6, 0); dummy.updateMatrix(); mtn.setMatrixAt(i, dummy.matrix); }
  scene.add(mtn);
  const motes = pts(scene, 240, { color: 0xffd9a0, size: 0.34, opacity: 0.8 });
  const moteS = []; for (let i = 0; i < 240; i++) moteS.push([(rnd() - 0.5) * 100, rnd() * 30, 10 + rnd() * 70, rnd() * 6, 0.2 + rnd() * 0.5]);
  const lone = makeX(3.4); lone.position.set(0, 26, 28); scene.add(lone);
  const loneL = new THREE.PointLight(HOLO, 0, 60, 1.5); lone.add(loneL);

  const closeHook = AT["s1:tutup"], burnT = AT["s5:Hyper"], down = AT["s6:berakhir"], srv = AT["s7:server"], dexOff = AT["s7:dihapus"], burnEnd = AT["s5:Tapi"];
  const hx = K.s5, reward = 1.1;
  const camT = track([
    [0, -3, 6, 74, -6, 4.6, 40],
    [K.s1e, -14, 6.4, 72, -7, 4.2, 40],
    [K.s2 + 1.4, -46, 22, 96, -4, 18, 0],
    [K.s2e, 50, 26, 100, 2, 19, 0],
    [K.s3 + 1.2, 6, 8, 94, 0, 6, 44],
    [K.s3e, -5, 8, 90, 0, 6, 44],
    [K.s4 + 1, -26, 10, 74, -18, 6.5, 40],
    [K.s4e - 1, 32, 15, 72, 28, 10, 34],
    [hx + 1.2, 18, 12, 92, 0, 8, 46],
    [K.s5e, -14, 9, 82, 0, 5.2, 46],
    [K.s6 + 1.4, -62, 18, 86, -2, 18, -8],
    [K.s6e, -74, 24, 40, -4, 20, -14],
    [K.s7 + 1.2, -50, 26, 84, 2, 18, -12],
    [K.s7e, 44, 22, 92, 6, 19, -10],
    [K.s8 + 1.2, 18, 26, 96, 0, 17, -18],
    [K.end, -14, 30, 110, 0, 20, -24],
    [K.dur, -18, 32, 116, 0, 22, -26],
  ]);
  const sC = new THREE.Color();
  let lastLit = -1;

  return (t) => {
    let c = camT(t);
    const fol = ramp(t, K.s4 - 0.5, K.s4 + 0.6) * (1 - ramp(t, K.s4e - 0.9, K.s5 + 0.3));
    if (fol > 0) { const u = clamp01((t - AT["s4:Jual"]) / (AT["s4:bursa"] - AT["s4:Jual"])); const p = curve.getPoint(Math.max(0.05, Math.min(0.98, u))); const f = [p.x - 3, p.y + 6, p.z + 40, p.x, p.y + 1, p.z - 2]; c = c.map((v, i) => v + (f[i] - v) * fol); }
    const sh = 0.45 * (t > closeHook ? Math.exp(-(t - closeHook) * 5) : 0);
    cam.position.set(c[0] + Math.sin(t * 57) * sh, c[1] + Math.cos(t * 43) * sh, c[2]);
    cam.lookAt(c[3], c[4], c[5]);

    // sunset to night over the film; lights follow
    const n = ramp(t, K.s5e, K.s7 + 3);
    skyU.n.value = n;
    scene.fog.color.setHex(0x3a2342).lerp(sC.setHex(0x050817), n);
    hemi.intensity = 2.1 - 1.55 * n;
    sun.intensity = 3.2 * (1 - n);
    moon.intensity = 1.1 * n;
    stars.m.opacity = n;

    // knight lifts the sword, a ruby leaps out
    const lift = ramp(t, 0.15, 0.7) * (1 - ramp(t, K.s1e, K.s2 + 0.4));
    K1.armR.rotation.x = -2.9 * lift;
    K1.armL.rotation.x = 0.3 * Math.sin(t * 2);
    const cp = capeG.attributes.position;
    for (let i = 0; i < cp.count; i++) { const u = (capeB[i * 3 + 1] + 1.8) / 3.6; cp.array[i * 3 + 2] = capeB[i * 3 + 2] - (1 - u) * (0.7 + Math.sin(t * 3 + u * 5) * 0.28); }
    cp.needsUpdate = true;
    for (const b of banners) { const p = b.geometry.attributes.position, base = b.userData.base; for (let i = 0; i < p.count; i++) p.array[i * 3 + 2] = base[i * 3 + 2] + Math.sin(t * 2.1 + base[i * 3 + 1] * 0.55 + b.position.x) * (5.5 - base[i * 3 + 1]) * 0.09; p.needsUpdate = true; b.position.y = 8.4 - 7 * ramp(t, down, down + 2.5) * (0.6 + (Math.abs(b.position.x) % 7) * 0.05); }

    // windows go out one after another once closure is announced
    const out = ramp(t, down, K.s8 + 1);
    const lit = Math.floor((1 - out) * winSpots.length);
    if (lit !== lastLit) { winSpots.forEach((_, i) => { wins.setColorAt(winOrder[i], sC.setHex(0xffc86a).multiplyScalar(i < lit ? 1.5 : 0.07)); }); wins.instanceColor.needsUpdate = true; lastLit = lit; }

    // token plinths: only in the explain act, each spinning
    pl.scale.setScalar(Math.max(0.001, eout((t - K.s3 + 0.25) / 0.5) * (1 - ramp(t, K.s4 - 0.2, K.s4 + 0.3))));
    P.forEach(([, g], i) => { g.rotation.y = t * (0.7 + i * 0.1); g.position.y = 7 + Math.sin(t * 1.3 + i * 2) * 0.35; const a = AT[["s3:RUBY", "s3:sRUBY", "s3:RUBYx"][i]]; g.scale.setScalar(Math.max(0.001, back((t - a) / 0.45))); });

    // rail: alive while the conversion path is being told; dies for good afterwards
    const rl = ramp(t, K.s4 - 0.3, K.s4 + 0.4) * (1 - ramp(t, K.s4e, K.s5 + 0.4));
    rail.scale.setScalar(rl > 0.001 ? 1 : 0.0001);
    railM.opacity = rl;
    chest.scale.setScalar(Math.max(0.001, rl));
    rampRing.scale.setScalar(Math.max(0.001, rl));
    rampRing.rotation.z = t;
    const dexOn = ramp(t, K.s4 - 0.3, K.s4 + 0.4);
    dex.scale.setScalar(Math.max(0.001, dexOn));
    const off = ramp(t, dexOff, dexOff + 0.5);
    dexM.emissiveIntensity = 0.16 * (1 - off);
    dexH.material.color.setHex(HOLO).multiplyScalar(1.4 * (1 - off) + 0.03);
    dexH.rotation.y = t;
    holoL.intensity = 240 * rl;
    const u4 = clamp01((t - AT["s4:Jual"]) / (AT["s4:bursa"] - AT["s4:Jual"]));
    const P4 = curve.getPoint(Math.max(0.03, u4));
    const isX = u4 > 0.5;
    rider.position.copy(P4); riderX.position.copy(P4); rider.position.y += 1.2; riderX.position.y += 1.2;
    rider.scale.setScalar(rl > 0.5 && !isX ? 1 : 0.0001); riderX.scale.setScalar(rl > 0.5 && isX ? 1 : 0.0001);
    rider.rotation.y = riderX.rotation.y = t * 2;

    // heap: rises in the supply act, melts on Hyper Burn down to a handful
    const h0 = ramp(t, K.s5 - 0.1, K.s5 + 0.9) * (1 - ramp(t, K.s6 - 0.2, K.s6 + 0.5));
    const melt = ramp(t, burnT, burnT + 2.6);
    for (let i = 0; i < heapN; i++) {
      const s = hs[i], gone = melt * 0.985 > s[5];
      dummy.position.set(s[0], gone ? -8 : s[1] * h0 + 0.2 - 16 * (1 - h0), s[2]);
      const k = gone ? 0.0001 : s[4] * Math.max(0.001, h0);
      dummy.scale.set(k, k * 1.25, k); dummy.rotation.set(s[3], s[3] * 2, 0); dummy.updateMatrix(); heap.setMatrixAt(i, dummy.matrix);
    }
    heap.instanceMatrix.needsUpdate = true;
    const bi = burn.pos, bOn = t > burnT - 0.1 && t < burnEnd + 0.6;
    for (let i = 0; i < 500; i++) { const a = burnS[i], life = (a[0] + t * (0.45 + a[1] * 0.6)) % 1; bi[i * 3] = bOn ? (a[1] - 0.5) * 30 * (1 - life * 0.5) : 0; bi[i * 3 + 1] = bOn ? 1 + life * 26 : -60; bi[i * 3 + 2] = bOn ? 46 + (a[2] - 0.5) * 30 * (1 - life * 0.5) : 0; }
    burn.commit();

    const mi = motes.pos;
    for (let i = 0; i < 240; i++) { const m = moteS[i]; mi[i * 3] = m[0] + Math.sin(t * m[4] + m[3]) * 3; mi[i * 3 + 1] = (m[1] + t * m[4]) % 30; mi[i * 3 + 2] = m[2] + Math.cos(t * m[4] + m[3]) * 3; }
    motes.commit();
    motes.m.opacity = 0.8 * (1 - n * 0.8);

    // what survives the game: one token over a dark castle
    const ln = back((t - K.s8 - 0.3) / 0.8);
    lone.scale.setScalar(Math.max(0.0001, ln));
    lone.rotation.y = t * 0.6;
    lone.position.y = 26 + Math.sin(t * 1.1) * 0.8;
    loneL.intensity = 160 * clamp01(ln);
    comp.render();
  };
}
