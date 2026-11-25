// INSPECT: a black studio with one generic display rifle on a turntable, its finish painted procedurally; no Counter-Strike assets. Prop only, shown as a collectible.
// The camera makes slow macro passes along the object, with hard shutter cuts between acts. Scale and curve points match the cited figures.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, std } from "./lib3d.js";

const AMB = 0xff7a1a, BLUEG = 0x2e7dff;

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(1080, 1920, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.15;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07080a);
  scene.fog = new THREE.FogExp2(0x07080a, 0.012);
  const rnd = mulberry(442);
  const cam = new THREE.PerspectiveCamera(30, 1080 / 1920, 0.1, 400);

  // env: soft strip lights reflected by metal, generated in-scene so no HDR file is needed
  const pm = new THREE.PMREMGenerator(r);
  const envS = new THREE.Scene();
  envS.background = new THREE.Color(0x050608);
  const strip = (w, h, c, i, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); envS.add(m); };
  strip(20, 3, 0xffffff, 7, 0, 12, 6); strip(3, 20, 0xffd8b0, 4, -14, 2, 6); strip(3, 20, 0xb8d4ff, 4, 14, 2, 4); strip(30, 2, 0xffffff, 2, 0, -8, 8);
  scene.environment = pm.fromScene(envS, 0.03).texture;

  const key = new THREE.SpotLight(0xfff1dd, 2400, 110, 0.62, 0.6, 1.6);
  key.position.set(-10, 26, 18); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  const rim = new THREE.SpotLight(AMB, 1100, 110, 0.8, 0.8, 1.6); rim.position.set(16, 10, -18);
  scene.add(key, key.target, rim, rim.target, new THREE.HemisphereLight(0x3a4e70, 0x0a0a0a, 1.1));

  const floor = new THREE.Mesh(new THREE.CircleGeometry(120, 64), new THREE.MeshStandardMaterial({ color: 0x0b0d10, roughness: 0.42, metalness: 0.7 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -7; floor.receiveShadow = true;
  scene.add(floor);
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(8, 8.6, 1.4, 64), new THREE.MeshStandardMaterial({ color: 0x15181c, roughness: 0.3, metalness: 0.85 }));
  plinth.position.y = -6.3; plinth.receiveShadow = plinth.castShadow = true;
  scene.add(plinth);

  // finishes: painted on canvas. "BLUE" is a pattern with drifting cloud marks, "PLAIN" is bare gunmetal, "EMBER" for the crash.
  const cloud = (g, w, h, cols, seed, n) => { const q = mulberry(seed); for (let i = 0; i < n; i++) { const x = q() * w, y = q() * h, R = 20 + q() * 130; const gr = g.createRadialGradient(x, y, 2, x, y, R); const c = cols[Math.floor(q() * cols.length)]; gr.addColorStop(0, c); gr.addColorStop(1, c + "00"); g.fillStyle = gr; g.fillRect(x - R, y - R, R * 2, R * 2); } };
  const blueGem = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = "#1553C7"; g.fillRect(0, 0, w, h); cloud(g, w, h, ["#0A2F8A", "#3A9BFF", "#6FC4FF", "#102A6A"], 661, 260); });
  const plainT = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = "#30343A"; g.fillRect(0, 0, w, h); const q = mulberry(9); for (let i = 0; i < 2200; i++) { g.fillStyle = `rgba(${q() > 0.5 ? "255,255,255" : "0,0,0"},${q() * 0.05})`; g.fillRect(q() * w, q() * h, 2 + q() * 60, 1); } });
  const emberT = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = "#1A1110"; g.fillRect(0, 0, w, h); cloud(g, w, h, ["#FF7A1A", "#FFB547", "#6E1C08", "#2A0F08"], 77, 240); });
  for (const tx of [blueGem, plainT, emberT]) { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(0.14, 0.14); }
  const finish = new THREE.MeshPhysicalMaterial({ map: blueGem, metalness: 0.55, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.4 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x15171a, metalness: 0.75, roughness: 0.45 });
  const wood = new THREE.MeshStandardMaterial({ map: canvasTex(512, 128, (g, w, h) => { g.fillStyle = "#5A3218"; g.fillRect(0, 0, w, h); const q = mulberry(3); for (let i = 0; i < 180; i++) { g.strokeStyle = `rgba(20,8,0,${q() * 0.4})`; g.beginPath(); const y = q() * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + q() * 12, w * 0.7, y - q() * 12, w, y + q() * 6); g.stroke(); } }), roughness: 0.55 });

  // display rifle silhouette, generic, extruded from a 2D profile
  const shape = (pts, depth, mat, x = 0, y = 0, z = 0) => { const s = new THREE.Shape(); pts.forEach(([a, b], i) => (i ? s.lineTo(a, b) : s.moveTo(a, b))); const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2 }); g.translate(0, 0, -depth / 2); const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = true; return m; };
  const rifle = new THREE.Group();
  rifle.add(shape([[-4.5, 0.9], [4.2, 0.9], [4.6, 0.3], [4.2, -0.7], [-4.3, -0.7]], 1.0, finish));                 // receiver
  rifle.add(shape([[-4.5, 0.55], [-11.2, 0.15], [-11.4, -1.7], [-10.2, -1.9], [-4.5, -0.5]], 0.95, wood));          // stock
  rifle.add(shape([[4.2, 0.55], [10.2, 0.45], [10.3, -0.35], [4.3, -0.5]], 0.95, wood));                             // handguard
  rifle.add(shape([[-2.9, -0.6], [-0.9, -0.6], [-1.5, -3.3], [-3.3, -3.0]], 0.8, wood));                             // grip
  rifle.add(shape([[0.5, -0.65], [3, -0.65], [4.4, -4.4], [3.6, -5.4], [2, -4.8]], 0.8, finish));                    // magazine
  const bar = (rt, len, x, y, mat = dark) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rt, len, 20), mat); m.rotation.z = Math.PI / 2; m.position.set(x, y, 0); m.castShadow = true; rifle.add(m); return m; };
  bar(0.26, 9, 14, 0.25); bar(0.38, 1.3, 18.8, 0.25); bar(0.16, 7.5, 9, 1.05, dark);
  rifle.add(shape([[17.9, 0.5], [18.2, 1.3], [18.6, 1.3], [18.6, 0.5]], 0.15, dark));
  rifle.add(shape([[1.4, 0.9], [2.7, 1.5], [3.4, 1.5], [3.4, 0.9]], 0.25, dark));
  rifle.scale.setScalar(0.62);
  rifle.position.set(-2.4, 0.9, 0);
  const pivot = new THREE.Group(); pivot.add(rifle); pivot.position.y = 0;
  scene.add(pivot);

  // workshop wall: instanced tiles. 442 lit, of a field that stands for 151,133 (one tile is 100 entries, stated on screen)
  const TN = 1512;
  const tiles = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, toneMapped: false }), TN);
  tiles.frustumCulled = false;
  scene.add(tiles);
  const td = [];
  for (let i = 0; i < TN; i++) { const c = 36, x = (i % c - c / 2) * 0.72, y = (Math.floor(i / c) - 21) * 0.72; td.push({ x, y, d: rnd() }); tiles.setColorAt(i, new THREE.Color(0x1d2228)); }
  const lucky = Math.floor(rnd() * TN);
  const mkLucky = new THREE.Color(0xffc24a);

  // coins of creator share, drop on "25"
  const share = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.16, 0.9), new THREE.MeshStandardMaterial({ color: 0xffb547, metalness: 1, roughness: 0.3 }), 100);
  share.frustumCulled = false; share.castShadow = true;
  scene.add(share);

  // price chart: 3D ribbon made of bars, Pricempire points: 10.4 peak, crash, 6.5 a year later (the path between points is drawn straight and labelled illustrative in docs)
  const BARS = 60;
  const chart = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 1, 0.5), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.4 }), BARS);
  chart.frustumCulled = false; chart.castShadow = true;
  scene.add(chart);
  const val = (u) => (u < 0.5 ? 6 + 4.4 * Math.pow(u / 0.5, 2.2) : u < 0.56 ? 10.4 - (10.4 - 7.8) * ((u - 0.5) / 0.06) : 7.8 - (7.8 - 6.5) * ((u - 0.56) / 0.44));

  // knives from the trade-up: 5 red cards fall in, a knife pops out, then hundreds of knives flood the frame
  const blade = new THREE.Shape(); blade.moveTo(0, 0); blade.lineTo(2.6, 0.06); blade.quadraticCurveTo(3.8, 0.1, 4.4, 0.75); blade.quadraticCurveTo(2.9, 0.75, 0, 0.64); blade.lineTo(0, 0);
  const bladeG = new THREE.ExtrudeGeometry(blade, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1 });
  const hand = new THREE.BoxGeometry(2.1, 0.62, 0.3); hand.translate(-1, 0.3, 0.04);
  const merged = new THREE.Group();
  const KN = 340;
  const knB = new THREE.InstancedMesh(bladeG, new THREE.MeshStandardMaterial({ color: 0x9aa4ae, metalness: 0.55, roughness: 0.5 }), KN), knH = new THREE.InstancedMesh(hand, new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.5, metalness: 0.4 }), KN);
  knB.frustumCulled = knH.frustumCulled = false;
  knB.castShadow = true;
  merged.add(knB, knH);
  scene.add(merged);
  const kd = []; for (let i = 0; i < KN; i++) kd.push({ a: rnd() * 6.28, R: 2 + rnd() * 8, h: -6.2 + rnd() * 16, sp: rnd() * 2 + 0.6, d: rnd(), ry: rnd() * 6, rz: rnd() * 6 });
  const cards = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, 3.2, 0.1), new THREE.MeshStandardMaterial({ color: 0xc81e2a, emissive: 0x5a0a10, emissiveIntensity: 1.2, roughness: 0.4 }), 5);
  cards.frustumCulled = false;
  scene.add(cards);
  const hero = new THREE.Group();
  const heroB = new THREE.Mesh(bladeG, new THREE.MeshStandardMaterial({ color: 0xb9c3cc, metalness: 0.7, roughness: 0.38 }));
  const heroH = new THREE.Mesh(hand, new THREE.MeshStandardMaterial({ color: 0x25180e, roughness: 0.5 }));
  hero.add(heroB, heroH); hero.scale.setScalar(1.6); scene.add(hero);

  // gavel-like legal slab for the lawsuit beat: a plain document stack, no logos
  const docs = new THREE.Group(); scene.add(docs);
  for (let i = 0; i < 16; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(6, 0.1, 8), new THREE.MeshStandardMaterial({ color: i % 5 === 0 ? 0xcfd3d6 : 0xe9e6dd, roughness: 0.8 })); m.position.set(Math.sin(i * 3.1) * 0.15, -5.5 + i * 0.1, Math.cos(i * 2.3) * 0.12); m.rotation.y = Math.sin(i) * 0.03; m.castShadow = true; docs.add(m); }

  // macro passes; values: camera x,y,z then target x,y,z. Hard cuts at act changes come from the HTML shutter, so the camera may jump behind it.
  const passes = [
    [0, K.s1e + 0.1, [[-2, 1, 60, 0, 0.8, 0], [2, 1, 54, 0, 0.8, 0]]],
    [K.s2 - 0.1, K.s2e + 0.1, [[-1.5, 0, 34, 0, 0, -6], [1.5, 0, 31, 0, 0, -6]]],
    [K.s3 - 0.1, K.s3e + 0.1, [[-3, 1, 60, 0, 0, 0], [3, 1, 56, 0, 0, 0]]],
    [K.s4 - 0.1, K.s4e + 0.1, [[6, 2, 42, 1.5, 0.5, 0], [-2, 2, 34, 0, 0, 0]]],
    [K.s5 - 0.1, K.s5e + 0.1, [[-2, 0.2, 17, -0.6, 0.2, 0], [1, 1.2, 14, 0.2, 0.8, 0]]],
    [K.s6 - 0.1, K.s6e + 0.1, [[-1, 1, 36, 0, -0.6, 0], [1.5, 1.5, 32, 0, -0.2, 0]]],
    [K.s7 - 0.1, K.s7e + 0.1, [[-2, 0.5, 54, 0, 0.4, 0], [2, 0.5, 50, 0, 0.4, 0]]],
    [K.s8 - 0.1, K.dur, [[3, 1, 54, 0, 0.8, 0], [-3, 1, 62, 0, 0.8, 0]]],
  ];
  const camAt = (t) => {
    for (const [a, b, [p, q]] of passes) {
      if (t >= a && t <= b) { const u = (t - a) / (b - a); const k = u * u * (3 - 2 * u) * 0.35 + u * 0.65; return p.map((v, i) => v + (q[i] - v) * k); }
    }
    return passes[0][2][0];
  };

  const composer = new EffectComposer(r);
  composer.addPass(new RenderPass(scene, cam));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(540, 960), 0.14, 0.4, 0.94));
  composer.addPass(new OutputPass());
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), p = new THREE.Vector3(), c3 = new THREE.Color();
  const pose = (im, i, x, y, z, rx, ry, rz, s) => { e.set(rx, ry, rz); q.setFromEuler(e); sc.setScalar(s); p.set(x, y, z); m.compose(p, q, sc); im.setMatrixAt(i, m); };

  return function draw(t) {
    const [cx, cy, cz, lx, ly, lz] = camAt(t);
    cam.position.set(cx, cy, cz);
    cam.lookAt(lx, ly, lz);
    key.target.position.set(0, 0, 0);

    // finish changes with the act: bare during Workshop review, blue gem as the sale, ember in the crash
    const skin = t >= K.s6 ? emberT : t >= K.s2 && t < K.s3 ? plainT : blueGem;
    if (finish.map !== skin) { finish.map = skin; finish.needsUpdate = true; }

    // turntable, slowed in the macro passes
    const rifleOn = !(t >= K.s2 && t < K.s3) && !(t >= AT["s6:pisau"] && t < K.s8);
    pivot.visible = rifleOn;
    pivot.rotation.set(0, Math.sin(t * 0.33) * 0.42, 1.08);
    rim.color.setHex(t >= K.s6 ? AMB : t < K.s2 ? BLUEG : 0xdde6ff);

    // Workshop wall: tiles flood on "karya"; on "442" every tile goes dark but a few pinpoints
    const wallOn = t >= K.s2 - 0.1 && t < K.s3;
    tiles.visible = wallOn;
    if (wallOn) {
      const fill = clamp01((t - AT["s2:karya"] + 0.4) / 1.4), cull = ramp(t, AT["s2:442"] - 0.1, AT["s2:442"] + 0.5);
      for (let i = 0; i < TN; i++) {
        const d = td[i], on = fill > d.d;
        const isLucky = i % 378 === 7;
        pose(tiles, i, d.x, d.y, -6, 0, 0, 0, on ? 1 : 0.001);
        c3.setHSL(0.58, 0.1, 0.13);
        if (isLucky) c3.lerp(mkLucky, cull); else c3.multiplyScalar(1 - 0.55 * cull);
        tiles.setColorAt(i, c3);
      }
      tiles.instanceMatrix.needsUpdate = true; tiles.instanceColor.needsUpdate = true;
    }

    // 25 of 100 gold plates drop to the creator's side, the others stay dark
    const shOn = t >= K.s3 - 0.1 && t < K.s4;
    share.visible = shOn;
    if (shOn) {
      const tk = AT["s3:25"];
      for (let i = 0; i < 100; i++) {
        const col = i % 10, row = Math.floor(i / 10), s = 1;
        const isC = i < 25;
        const u = isC ? eout((t - tk - i * 0.016) / 0.5) : 0;
        pose(share, i, -2.6 + col * 0.98 + (isC ? 0 : 0.0) - 2.2, isC ? 11 - u * (11 - (-5.5 + row * 0.19)) : -5.4 + row * 0.19 - 40 * (t < tk ? 0 : 0), 2 + row * 0.1 - (isC ? 0 : 4) , 0, 0, 0, s);
      }
      share.instanceMatrix.needsUpdate = true;
    }

    // trade-up: cards fall into a line, a knife appears, then knives flood in; the chart's crash mirrors it
    const crash = AT["s6:Valve"];
    const onK = t >= K.s6 - 0.1 && t < K.s7;
    cards.visible = onK; hero.visible = onK; merged.visible = onK;
    if (onK) {
      for (let i = 0; i < 5; i++) {
        const u = eout((t - AT["s6:lima"] - i * 0.09) / 0.42), fuse = ramp(t, AT["s6:pisau"] - 0.12, AT["s6:pisau"] + 0.08);
        pose(cards, i, (i - 2) * 2.5 * (1 - fuse), 13 - u * 13.4 + fuse * 0, 0.1 * i, 0, 0, 0, Math.max(0.001, 1 - fuse));
      }
      cards.instanceMatrix.needsUpdate = true;
      const hs = eout((t - AT["s6:pisau"]) / 0.3);
      hero.scale.setScalar(Math.max(0.001, hs * 2.5));
      hero.position.set(-1.4, -0.2, 2);
      hero.rotation.set(0.2, t * 0.7, 0.4);
      const flood = clamp01((t - AT["s6:Barang"]) / 2.0);
      for (let i = 0; i < KN; i++) {
        const d = kd[i], on = flood > d.d;
        const yy = d.h + (on ? 0 : 60);
        const f = eout((flood - d.d) / 0.2);
        pose(knB, i, Math.cos(d.a) * d.R, 22 - (22 - yy) * f, Math.sin(d.a) * d.R - 12, d.ry * f, d.rz + t * d.sp * 0.3, d.ry, on ? 1 : 0.001);
        pose(knH, i, Math.cos(d.a) * d.R, 22 - (22 - yy) * f, Math.sin(d.a) * d.R - 12, d.ry * f, d.rz + t * d.sp * 0.3, d.ry, on ? 1 : 0.001);
      }
      knB.instanceMatrix.needsUpdate = knH.instanceMatrix.needsUpdate = true;
    }

    // the 10.4 to 6.5 bar chart, drawn on "puncak"; red once it passes the peak
    const onC = t >= K.s7 - 0.1 && t < K.s8;
    chart.visible = onC; docs.visible = onC;
    if (onC) {
      const draw = clamp01((t - AT["s7:puncak"] + 0.2) / 3.0);
      for (let i = 0; i < BARS; i++) {
        const u = i / (BARS - 1), hgt = val(u) * 1.2, on = eout((draw - u) * 8);
        const h = Math.max(0.001, hgt * on);
        m.makeScale(1, h, 1).setPosition((u - 0.5) * 14, -6.5 + h / 2, -2);
        chart.setMatrixAt(i, m);
        chart.setColorAt(i, c3.set(u <= 0.5 ? 0x2e7dff : 0xff3b1f));
      }
      chart.instanceMatrix.needsUpdate = true; chart.instanceColor.needsUpdate = true;
      const fall = eout((t - AT["s7:Februari"]) / 0.32);
      docs.position.set(3.2, 36 - fall * 36, 5); docs.scale.setScalar(0.5);
      docs.rotation.y = 0.3;
    }
    composer.render();
  };
}
