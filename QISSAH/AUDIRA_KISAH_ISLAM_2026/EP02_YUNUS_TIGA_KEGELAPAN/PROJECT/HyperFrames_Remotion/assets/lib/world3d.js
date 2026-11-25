// EP02 YUNUS. WORLDFORGE deep ocean at night: one connected world of night sky, sea, the whale's belly, a barren shore and a far city.
// The prophet is never shown. His presence is one small amber glow: in the city, on the ship, inside the fish, under the gourd vine.
// A cutaway "water face" at z = ZF turns the sea into a diorama so the three darknesses read as stacked layers.
// Every value is a pure function of t (seek-safe). Units ~ metres.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, back, clamp01, smooth, canvasTex, track, std, stage, pts, envStrips } from "./lib3d.js";

const ZF = 30;                       // cutaway face of the sea
const IP = new THREE.Vector3(0, -600, 0); // interior set (belly of the fish), far below everything
const C0x = 250, C0z = -30;          // the city (Niniwe in s2, the same city in s7)

function ground(x, z) {
  const s = smooth((x - 46) / 42);
  const n = 0.9 * Math.sin(x * 0.21) * Math.sin(z * 0.17) + 0.5 * Math.sin(x * 0.53 + z * 0.31) + 0.35 * Math.sin(z * 0.7 - x * 0.2);
  return -46 + 48 * s + Math.max(0, x - 88) * 0.022 + n * (0.6 + 0.4 * s);
}
const wave = (x, z, t, a) => a * (0.55 * Math.sin(0.09 * x + 0.8 * t) + 0.4 * Math.sin(0.13 * z - 1.1 * t + 0.045 * x) + 0.22 * Math.sin(0.23 * (x + z) + 1.7 * t) + 0.12 * Math.sin(0.5 * x - 0.37 * z + 2.6 * t));
const bump = (t, a, d) => (t < a ? 0 : Math.exp(-(t - a) / d) * (1 - Math.exp(-(t - a) / 0.08)));
const lerp3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x02050a, fog: 0.004, exp: 1.08, bloom: [0.8, 0.55, 0.7], shadow: false });
  envStrips(r, scene, [[40, 8, 0xbfd4ff, 1.1, -60, 50, 60], [200, 10, 0x0f3a4a, 0.7, 0, 4, -200], [80, 6, 0xffb070, 0.3, 200, 6, 0]], 0x020408);
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(3787);
  const V = new THREE.Vector3();
  const add = (m, p = scene) => { p.add(m); return m; };

  // ---------- lights
  const hemi = add(new THREE.HemisphereLight(0x2a4058, 0x05070a, 0.8));
  const deep = add(new THREE.HemisphereLight(0x2c9aa6, 0x02080c, 0));
  const moon = add(new THREE.DirectionalLight(0xa8bce0, 1.1)); moon.position.set(-80, 120, 90);
  const sun = add(new THREE.DirectionalLight(0xffb27a, 0)); sun.position.set(300, 40, -80);
  const flashL = add(new THREE.DirectionalLight(0xcfe0ff, 0)); flashL.position.set(20, 80, 40);

  // ---------- sky dome, stars, moon (all follow the camera)
  const skyG = new THREE.SphereGeometry(520, 40, 24);
  const skyN = skyG.attributes.position.array.slice();
  const skyC = new Float32Array(skyG.attributes.position.count * 3);
  skyG.setAttribute("color", new THREE.BufferAttribute(skyC, 3));
  const sky = add(new THREE.Mesh(skyG, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));
  sky.renderOrder = -10;
  const paintSky = (D, fl) => {
    for (let i = 0; i < skyC.length; i += 3) {
      const x = skyN[i] / 520, y = skyN[i + 1] / 520;
      const h = Math.pow(Math.max(0, y), 0.5), e = Math.max(0, x) ** 2;
      const nr = 0.010 + (0.002 - 0.010) * h, ng = 0.022 + (0.004 - 0.022) * h, nb = 0.045 + (0.012 - 0.045) * h;
      const dr = 0.04 + 0.55 * e * (1 - h), dg = 0.06 + 0.22 * e * (1 - h), db = 0.12 + 0.06 * e * (1 - h) - 0.05 * h;
      skyC[i] = nr + (dr - nr) * D + fl * 0.25 * h; skyC[i + 1] = ng + (dg - ng) * D + fl * 0.3 * h; skyC[i + 2] = nb + (db - nb) * D + fl * 0.4 * h;
    }
    skyG.attributes.color.needsUpdate = true;
  };
  const NST = 1600;
  const stars = pts(scene, NST, { color: 0xdfe8ff, size: 2.4, opacity: 1 });
  stars.m.fog = false; stars.P.renderOrder = -9;
  const stSeed = [];
  for (let i = 0; i < NST; i++) {
    const y = 0.03 + rnd() * 0.97, a = rnd() * Math.PI * 2, rr = Math.sqrt(1 - y * y);
    stars.pos[i * 3] = Math.cos(a) * rr * 480; stars.pos[i * 3 + 1] = y * 480; stars.pos[i * 3 + 2] = Math.sin(a) * rr * 480;
    stSeed.push([rnd(), rnd() * 6, 0.4 + rnd() * 0.6]);
  }
  stars.commit();
  const moonTex = canvasTex(256, 256, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, "rgba(235,240,255,1)"); gr.addColorStop(0.16, "rgba(220,230,250,1)"); gr.addColorStop(0.19, "rgba(160,185,230,.35)"); gr.addColorStop(0.5, "rgba(90,120,180,.08)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
  const moonS = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })));
  moonS.scale.setScalar(150); moonS.renderOrder = -8;
  const moonDir = new THREE.Vector3(-0.2, 0.3, -0.93).normalize();

  // ---------- sea surface (clipped at the cutaway face)
  const seaG = new THREE.PlaneGeometry(380, 380, 150, 150);
  seaG.rotateX(-Math.PI / 2); seaG.translate(-60, 0, ZF - 190);
  const seaP = seaG.attributes.position;
  const sea = add(new THREE.Mesh(seaG, new THREE.MeshStandardMaterial({ color: 0x071a26, roughness: 0.2, metalness: 0.7, side: THREE.DoubleSide })));
  sea.frustumCulled = false;

  // ---------- the cutaway water face + its waterline
  const FW = 146, FH = 47;
  const faceG = new THREE.PlaneGeometry(FW, FH, 146, 1); faceG.translate(-17, -FH / 2, ZF);
  const faceP = faceG.attributes.position;
  const faceTex = canvasTex(8, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "rgba(40,150,160,.5)"); gr.addColorStop(0.08, "rgba(12,70,88,.55)"); gr.addColorStop(0.5, "rgba(4,28,44,.68)"); gr.addColorStop(1, "rgba(1,6,12,.86)");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const faceM = new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const face = add(new THREE.Mesh(faceG, faceM)); face.renderOrder = 5; face.frustumCulled = false;
  const lineG = new THREE.BufferGeometry(); const lineA = new Float32Array(147 * 3); lineG.setAttribute("position", new THREE.BufferAttribute(lineA, 3));
  const lineM = new THREE.LineBasicMaterial({ color: 0x8ff5e6, transparent: true, fog: false });
  const wline = add(new THREE.Line(lineG, lineM)); wline.renderOrder = 6; wline.frustumCulled = false;
  const soil = add(new THREE.Mesh(new THREE.PlaneGeometry(FW, 14), new THREE.MeshBasicMaterial({ color: 0x06090d, fog: false, transparent: true })));
  soil.position.set(-17, -FH - 7, ZF);

  // ---------- terrain: sea floor, shore slope, barren land, city plateau
  const TG = new THREE.PlaneGeometry(700, 380, 240, 130); TG.rotateX(-Math.PI / 2); TG.translate(100, 0, ZF - 190);
  const tp = TG.attributes.position, tc = new Float32Array(tp.count * 3);
  for (let i = 0; i < tp.count; i++) {
    const x = tp.getX(i), z = tp.getZ(i), y = ground(x, z);
    tp.setY(i, y);
    const sand = clamp01((y + 4) / 5), dry = clamp01((x - 92) / 60);
    const c = [0.03 + 0.2 * sand, 0.05 + 0.16 * sand, 0.08 + 0.1 * sand];
    const d = [0.2, 0.15, 0.1];
    tc[i * 3] = c[0] + (d[0] - c[0]) * dry * sand; tc[i * 3 + 1] = c[1] + (d[1] - c[1]) * dry * sand; tc[i * 3 + 2] = c[2] + (d[2] - c[2]) * dry * sand;
  }
  TG.setAttribute("color", new THREE.BufferAttribute(tc, 3));
  TG.computeVertexNormals();
  add(new THREE.Mesh(TG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, flatShading: true })));
  const ROCK = std(0x3a3430, 0.95, 0, { flatShading: true });
  for (let i = 0; i < 46; i++) {
    const x = 86 + rnd() * 40, z = -30 + rnd() * 50, s = 0.3 + rnd() * 1.1;
    const m = add(new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), ROCK)); m.position.set(x, ground(x, z) + s * 0.3, z); m.rotation.set(rnd() * 3, rnd() * 3, 0);
  }

  // ---------- the great fish
  const prof = [[0, -22.6], [0.5, -22], [1.3, -19], [2.6, -14], [4.2, -8], [5.6, -1], [6.2, 5], [6.0, 11], [5.2, 16], [3.8, 19.5], [2.0, 21.5], [0, 22.6]];
  const fishGeo = new THREE.LatheGeometry(prof.map(([rr, l]) => new THREE.Vector2(rr, l)), 56);
  fishGeo.rotateZ(-Math.PI / 2); fishGeo.scale(1, 0.86, 1);
  const fishBase = fishGeo.attributes.position.array.slice();
  const fishTex = canvasTex(1024, 512, (g, w, h) => {
    for (let x = 0; x < w; x++) {
      const top = -Math.sin((2 * Math.PI * x) / w), k = smooth((top + 0.3) / 0.7);
      const cr = 112 + (34 - 112) * k, cg = 128 + (50 - 128) * k, cb = 142 + (66 - 142) * k;
      g.fillStyle = `rgb(${cr | 0},${cg | 0},${cb | 0})`; g.fillRect(x, 0, 1, h);
      if (top < -0.45 && x % 9 === 0) { g.fillStyle = "rgba(10,16,24,.55)"; g.fillRect(x, 0, 2, h * 0.55); }
    }
    const q = mulberry(5);
    for (let i = 0; i < 220; i++) { g.fillStyle = `rgba(150,160,170,${0.15 + q() * 0.25})`; g.beginPath(); g.arc(q() * w, q() * h * 0.35, 1 + q() * 3, 0, 7); g.fill(); }
  });
  const fishEm = canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = "rgb(16,34,38)"; g.fillRect(0, 0, w, h);
    const q = mulberry(11);
    for (const u of [0.02, 0.48, 0.52, 0.98]) for (let y = 30; y < h - 20; y += 14) { g.fillStyle = "rgba(80,255,230,.9)"; g.beginPath(); g.arc(u * w, y, 2.6, 0, 7); g.fill(); }
    for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(70,240,220,${0.25 + q() * 0.6})`; g.beginPath(); g.arc(q() * w, q() * h, 0.8 + q() * 1.8, 0, 7); g.fill(); }
  });
  const FISHM = new THREE.MeshStandardMaterial({ map: fishTex, emissiveMap: fishEm, emissive: 0x3dffe2, emissiveIntensity: 0.5, roughness: 0.42, metalness: 0.15, side: THREE.DoubleSide });
  const fishG = add(new THREE.Group()); fishG.rotation.order = "YZX";
  const fishBody = new THREE.Mesh(fishGeo, FISHM); fishG.add(fishBody);
  const DARKF = std(0x0b131c, 0.5);
  const fs = new THREE.Shape(); [[0, 0.6], [-2.8, 3.0], [-6.2, 7.0], [-5.4, 3.8], [-6.4, 0.3], [-6.4, -0.3], [-5.4, -3.8], [-6.2, -7.0], [-2.8, -3.0], [0, -0.6]].forEach(([x, y], i) => (i ? fs.lineTo(x, y) : fs.moveTo(x, y)));
  const flG = new THREE.ShapeGeometry(fs); flG.rotateX(Math.PI / 2);
  const fluke = new THREE.Group(); fishG.add(fluke);
  fluke.add(new THREE.Mesh(flG, new THREE.MeshStandardMaterial({ color: 0x0e1822, roughness: 0.5, side: THREE.DoubleSide, emissive: 0x3dffe2, emissiveIntensity: 0.02 })));
  for (const s of [-1, 1]) {
    const fin = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), DARKF); fin.scale.set(4.6, 0.28, 1.2); fin.position.set(9.5, -3.4, s * 5.4); fin.rotation.set(s * 0.5, s * 0.5, -0.25); fishG.add(fin);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), new THREE.MeshBasicMaterial({ color: 0x0d3a3a })); eye.position.set(16.6, -0.7, s * 4.25); fishG.add(eye);
  }
  const dors = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.2, 8), DARKF); dors.position.set(-9, 4.6, 0); dors.rotation.z = -0.6; fishG.add(dors);
  const mouthHole = new THREE.Mesh(new THREE.CircleGeometry(1, 24), new THREE.MeshBasicMaterial({ color: 0x010203, side: THREE.DoubleSide })); mouthHole.rotation.y = Math.PI / 2; fishG.add(mouthHole);
  const fishK = (() => {
    const T = (k) => A(k);
    const tsw = T("s3:menelannya");
    const p = 0.3, M = [3, -9, 6.5];
    return { tsw, M, keys: track([
      [0, -6, -24, -4, 0, 0], [7.3, 4, -24, -4, 0, 0], [18, 4, -24, -4, 0, 0],
      [24.0, -60, -30, 6.5, 0, 0.3], [25.9, -34, -23, 6.5, 0, 0.3],
      [tsw, M[0] - 22 * Math.cos(p), M[1] - 22 * Math.sin(p) + 0.45, M[2], 0, p],
      [tsw + 1.4, -8, -13, 4, 0, 0.05], [31.0, 0, -22, -4, 0, 0], [35.5, 4, -24, -4, 0, 0],
      [K.s6 - 0.1, -20, -26, -8, 0, 0], [59.6, 25, -22, -8, 0, 0.05], [61.0, 48, -7, -6, 0, 0.25], [61.4, 50, -4.6, -6, 0, 0.04],
      [63.2, 50.5, -4.8, -6, 0, 0.0], [66.5, 38, -14, -16, 2.4, -0.1], [71, 0, -24, -34, Math.PI, 0], [96, -60, -26, -50, Math.PI, 0],
    ]) };
  })();
  const jawOf = (t) => ramp(t, fishK.tsw - 0.6, fishK.tsw - 0.15) * (1 - ramp(t, fishK.tsw + 0.25, fishK.tsw + 0.8)) + ramp(t, A("s6:dilemparkan") - 0.4, A("s6:dilemparkan")) * (1 - ramp(t, A("s6:dilemparkan") + 0.7, A("s6:dilemparkan") + 1.3));
  const poseFish = (t) => {
    const f = fishK.keys(t);
    fishG.position.set(f[0], f[1], f[2]); fishG.rotation.y = f[3]; fishG.rotation.z = f[4];
    fishG.updateMatrixWorld(true);
    return f;
  };
  const fishLocal = (t, x, y, z) => { poseFish(t); return fishG.localToWorld(V.set(x, y, z)).toArray(); };

  // ---------- the glow (his presence): halo sprite, hot core, warm point light
  const glowTex = canvasTex(256, 256, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, "rgba(255,244,214,1)"); gr.addColorStop(0.1, "rgba(255,196,100,.9)"); gr.addColorStop(0.35, "rgba(255,150,50,.3)"); gr.addColorStop(1, "rgba(255,120,30,0)");
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
  const makeGlow = (dist) => {
    const G = add(new THREE.Group());
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    halo.renderOrder = 20; G.add(halo);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.72, 0.38).multiplyScalar(4), toneMapped: false, fog: false, transparent: true }));
    core.renderOrder = 21; G.add(core);
    const L = new THREE.PointLight(0xffa64d, 0, dist, 1.6); G.add(L);
    return { G, halo, core, L };
  };
  const glow = makeGlow(18), glowI = makeGlow(26);

  // ---------- interior: the belly. Ribs, membrane walls, wet floor, teal bioluminescence
  const inG = add(new THREE.Group()); inG.position.copy(IP);
  const memTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#120c1a"; g.fillRect(0, 0, w, h);
    const q = mulberry(21);
    for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(${60 + q() * 40},${30 + q() * 20},${70 + q() * 40},.5)`; g.lineWidth = 1 + q() * 3; g.beginPath(); let x = q() * w, y = q() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (q() - 0.5) * 120; y += q() * 90; g.lineTo(x, y); } g.stroke(); }
  }, [3, 4]);
  const memEm = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
    const q = mulberry(23);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(60,255,225,${0.3 + q() * 0.7})`; g.beginPath(); g.arc(q() * w, q() * h, 0.8 + q() * 2.2, 0, 7); g.fill(); }
  }, [3, 4]);
  const WALLM = new THREE.MeshStandardMaterial({ map: memTex, emissiveMap: memEm, emissive: 0x3dffe2, emissiveIntensity: 0.4, roughness: 0.45, metalness: 0.1, side: THREE.BackSide });
  const wallG = new THREE.CylinderGeometry(7.6, 7.6, 64, 48, 1, true); wallG.rotateX(Math.PI / 2);
  const wall = new THREE.Mesh(wallG, WALLM); wall.position.z = -18; inG.add(wall);
  const RIBS = [];
  for (let i = 0; i < 20; i++) {
    const m = new THREE.MeshStandardMaterial({ color: 0x4a4258, roughness: 0.35, metalness: 0.1, emissive: 0x2ab8a4, emissiveIntensity: 0.2 });
    const rib = new THREE.Mesh(new THREE.TorusGeometry(7.0, 0.34, 10, 56, Math.PI * 1.3), m);
    rib.rotation.z = -0.15 * Math.PI; rib.position.set(0, 0, 10 - i * 2.7); inG.add(rib); RIBS.push(m);
  }
  const floorG = new THREE.PlaneGeometry(15, 64, 30, 120); floorG.rotateX(-Math.PI / 2);
  { const p = floorG.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, 0.12 * Math.sin(p.getX(i) * 1.7) * Math.sin(p.getZ(i) * 0.9) + 0.03 * p.getX(i) ** 2); floorG.computeVertexNormals(); }
  const floor = new THREE.Mesh(floorG, new THREE.MeshStandardMaterial({ color: 0x0c0a14, roughness: 0.92, metalness: 0.0 })); floor.position.set(0, -5.3, -18); inG.add(floor);
  const NMO = 420;
  const motes = pts(scene, NMO, { color: 0xffc070, size: 0.09, opacity: 0.9 }); motes.m.fog = false;
  const moSeed = Array.from({ length: NMO }, () => [rnd(), rnd(), rnd(), rnd()]);
  const tealC = new THREE.Color(0x52ffe4), ambC = new THREE.Color(0xffc070);

  // ---------- city (Niniwe): mud-brick houses, wall ring with a west gate, window lights, suburbs
  const gC = ground(C0x, C0z);
  const C1 = [C0x, gC + 1.6, C0z];
  const houseG = new THREE.BoxGeometry(1, 1, 1); houseG.translate(0, 0.5, 0);
  const HOUSES = 620;
  const houses = new THREE.InstancedMesh(houseG, std(0x5e4d3d, 0.92, 0, { flatShading: true }), HOUSES + 130);
  houses.frustumCulled = false;
  const mtx = new THREE.Matrix4(), q4 = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3(), eu = new THREE.Euler();
  const LIGHTS = [];
  let hi = 0;
  for (let i = 0; i < HOUSES; i++) {
    const a = rnd() * Math.PI * 2, rr = 5 + Math.sqrt(rnd()) * 27, x = C0x + Math.cos(a) * rr, z = C0z + Math.sin(a) * rr;
    const w = 1.6 + rnd() * 2.2, d = 1.6 + rnd() * 2.2, h = 1.2 + rnd() * 2.4 + (rr < 12 ? 1.5 : 0), y = ground(x, z) - 0.2;
    eu.set(0, rnd() * 0.4, 0); q4.setFromEuler(eu);
    mtx.compose(ps.set(x, y, z), q4, sc.set(w, h, d)); houses.setMatrixAt(hi++, mtx);
    for (let k = 0; k < 3; k++) {
      const side = rnd() < 0.5 ? 1 : -1;
      LIGHTS.push({ p: [x + side * (w / 2 + 0.05) * (k % 2), y + 0.5 + rnd() * (h - 0.8), z + side * (d / 2 + 0.05) * ((k + 1) % 2)], r: rr / 80, s: rnd(), out: false });
    }
  }
  for (let i = 0; i < 130; i++) {
    const a = (i / 130) * Math.PI * 2;
    if (Math.abs(a - Math.PI) < 0.16) continue;
    const x = C0x + Math.cos(a) * 36, z = C0z + Math.sin(a) * 36;
    eu.set(0, -a, 0); q4.setFromEuler(eu);
    const tower = i % 13 === 0;
    mtx.compose(ps.set(x, ground(x, z) - 0.3, z), q4, sc.set(tower ? 3.4 : 1.6, tower ? 8 : 5, tower ? 3.4 : 1.9)); houses.setMatrixAt(hi++, mtx);
  }
  houses.count = hi; scene.add(houses);
  for (let i = 0; i < 1300; i++) {
    const a = rnd() * Math.PI * 2, rr = 40 + rnd() * 50, x = C0x + Math.cos(a) * rr, z = C0z + Math.sin(a) * rr;
    if (x < C0x - 60 && Math.abs(z - C0z) < 30) continue;
    LIGHTS.push({ p: [x, ground(x, z) + 0.6, z], r: rr / 80, s: rnd(), out: true });
  }
  const NL = LIGHTS.length;
  const cityL = pts(scene, NL, { color: 0xffd9a0, size: 1.7, opacity: 1 });
  LIGHTS.forEach((l, i) => { cityL.pos[i * 3] = l.p[0]; cityL.pos[i * 3 + 1] = l.p[1]; cityL.pos[i * 3 + 2] = l.p[2]; });
  cityL.commit();
  // the call: rings spreading over the roofs from the square
  const RINGS = [A("s2:diutus"), A("s2:kaumnya"), A("s2:Seruannya")].map((t0, i) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.62, 0.25).multiplyScalar(2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(C0x, gC + 4.5, C0z); scene.add(m);
    return { m, t0, rej: i === 2 };
  });
  // the threatened punishment: a dark storm mass that gathers over the city and is lifted away
  const CLOUD = [];
  const cloudM = std(0x14161f, 0.95, 0, { flatShading: true, transparent: true });
  for (let i = 0; i < 44; i++) {
    const m = add(new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), cloudM));
    const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * 30;
    CLOUD.push({ m, p: [C0x + Math.cos(a) * rr, gC + 24 + rnd() * 6, C0z + Math.sin(a) * rr * 0.8], s: 5 + rnd() * 6, d: [Math.cos(a), Math.sin(a)], k: rnd() });
  }

  // ---------- ship: lofted wooden hull, deck, mast, reefed sail, cargo; the pier
  const plank = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#3a2817"; g.fillRect(0, 0, w, h);
    const q = mulberry(31);
    for (let y = 0; y < h; y += 32) { g.fillStyle = `rgb(${50 + q() * 20},${34 + q() * 14},${20 + q() * 8})`; g.fillRect(0, y, w, 29); g.fillStyle = "#1a1109"; g.fillRect(0, y + 29, w, 3); for (let x = q() * 200; x < w; x += 160 + q() * 120) g.fillRect(x, y, 3, 29); }
  });
  const WOOD = std(0xffffff, 0.8, 0, { map: plank, side: THREE.DoubleSide });
  const WOODD = std(0x2a1d12, 0.85);
  const shipG = add(new THREE.Group());
  const HL = 14, NSEC = 28, PR = [[-1, 1.25], [-0.96, 0.5], [-0.85, -0.2], [-0.55, -0.85], [0, -1.1], [0.55, -0.85], [0.85, -0.2], [0.96, 0.5], [1, 1.25]];
  const hw = (u) => (u < 0.45 ? 2.4 * (0.55 + 0.45 * Math.sin((u / 0.45) * Math.PI / 2)) : Math.max(0.06, 2.4 * (1 - Math.pow((u - 0.45) / 0.55, 1.8))));
  const sheer = (u) => 1.25 + 0.9 * ((u - 0.45) / 0.55) ** 2;
  {
    const pos = [], uv = [], idx = [];
    for (let i = 0; i <= NSEC; i++) {
      const u = i / NSEC, x = -HL / 2 + u * HL, w = hw(u), d = 1.4 * (1 - 0.35 * Math.abs(u - 0.45));
      PR.forEach(([px, py], j) => { pos.push(x, py > 0 ? (py / 1.25) * sheer(u) : py * d, px * w); uv.push(u * 2, j / (PR.length - 1)); });
    }
    for (let i = 0; i < NSEC; i++) for (let j = 0; j < PR.length - 1; j++) { const a = i * PR.length + j, b = a + PR.length; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    shipG.add(new THREE.Mesh(g, WOOD));
    const ds = new THREE.Shape();
    for (let i = 0; i <= NSEC; i++) { const u = i / NSEC; const p = [-HL / 2 + u * HL, hw(u) * 0.97]; i ? ds.lineTo(...p) : ds.moveTo(...p); }
    for (let i = NSEC; i >= 0; i--) { const u = i / NSEC; ds.lineTo(-HL / 2 + u * HL, -hw(u) * 0.97); }
    const dg = new THREE.ShapeGeometry(ds); dg.rotateX(-Math.PI / 2);
    const deck = new THREE.Mesh(dg, WOOD); deck.position.y = 1.0; shipG.add(deck);
    const tr = new THREE.Mesh(new THREE.PlaneGeometry(2.4 * 0.55 * 2, 2.6), WOOD); tr.rotation.y = Math.PI / 2; tr.position.set(-HL / 2, 0.4, 0); shipG.add(tr);
  }
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 11, 10), WOODD); mast.position.set(0.8, 6.5, 0); shipG.add(mast);
  const yard = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 8, 8), WOODD); yard.rotation.x = Math.PI / 2; yard.position.set(0.8, 10.3, 0); shipG.add(yard);
  const sailG = new THREE.PlaneGeometry(7.4, 3.2, 10, 6); sailG.rotateY(Math.PI / 2);
  const sailB = sailG.attributes.position.array.slice();
  const sail = new THREE.Mesh(sailG, std(0x7d715c, 0.9, 0, { side: THREE.DoubleSide })); sail.position.set(0.95, 8.6, 0); shipG.add(sail);
  const rope = new THREE.LineBasicMaterial({ color: 0x23180f });
  const rg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.8, 11.8, 0), new THREE.Vector3(7, 2.1, 0), new THREE.Vector3(0.8, 11.8, 0), new THREE.Vector3(-7, 2.0, 0), new THREE.Vector3(0.8, 10.3, 4), new THREE.Vector3(-1, 1.3, 2.3), new THREE.Vector3(0.8, 10.3, -4), new THREE.Vector3(-1, 1.3, -2.3)]);
  shipG.add(new THREE.LineSegments(rg, rope));
  const CRATE = std(0x5a4128, 0.85), JAR = std(0x7a4a2e, 0.75);
  [[3.0, 1.6, 0.9], [3.0, 1.6, -0.9], [4.2, 1.5, 0], [3.0, 2.6, 0.2], [2.0, 1.5, 1.4], [2.0, 1.5, -1.4]].forEach(([x, y, z]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), CRATE); b.position.set(x, y, z); b.rotation.y = rnd() * 0.3; shipG.add(b); });
  const jarG = new THREE.LatheGeometry([[0, 0], [0.25, 0.05], [0.42, 0.4], [0.38, 0.85], [0.14, 1.05], [0.12, 1.25], [0.18, 1.3]].map(([a, b]) => new THREE.Vector2(a, b)), 14);
  for (let i = 0; i < 10; i++) { const j = new THREE.Mesh(jarG, JAR); j.position.set(0.2 + (i % 5) * 0.45, 1.0, (i < 5 ? 1 : -1) * (1.55 - (i % 2) * 0.1)); shipG.add(j); }
  const oar = new THREE.Mesh(new THREE.BoxGeometry(0.16, 4.2, 0.5), WOODD); oar.position.set(-7.2, 0.6, 1.3); oar.rotation.z = 0.7; shipG.add(oar);
  // lots: seven wooden sticks, one notched with an amber band
  const LOTS = [];
  const lotG = new THREE.BoxGeometry(0.95, 0.07, 0.12);
  const LOTC = new THREE.Vector3(-3.4, 1.04, 0);
  const tLot = A("s3:diundi") - 0.05;
  const markM = new THREE.MeshStandardMaterial({ color: 0x6a3a10, emissive: 0xffa040, emissiveIntensity: 0 });
  for (let i = 0; i < 7; i++) {
    const m = new THREE.Mesh(lotG, std(0x9c7a52, 0.7)); shipG.add(m);
    if (i === 3) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.085, 0.135), markM); b.position.x = 0.3; m.add(b); }
    const a = (i / 7) * Math.PI * 2 + rnd(), rr = 0.15 + rnd() * 0.45;
    LOTS.push({ m, ts: tLot + i * 0.07, x: LOTC.x + Math.cos(a) * rr, z: LOTC.z + Math.sin(a) * rr, yaw: rnd() * Math.PI, spin: Math.PI * (2 + Math.floor(rnd() * 3)), y0: 4.2 + rnd() });
  }
  const pier = add(new THREE.Group());
  { const b = new THREE.Mesh(new THREE.BoxGeometry(30, 0.3, 3), WOOD); b.position.set(73, 1.6, 7.6); pier.add(b);
    for (let x = 59; x < 88; x += 3) for (const z of [6.3, 8.9]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 30, 6), WOODD); p.position.set(x, 1.6 - 15, z); pier.add(p); } }
  const SP = [52, 0, 3.4], S0 = [0, 0, 0];
  const CUT2 = A("s3:Di") - 0.05;
  const storm = (t) => ramp(t, CUT2 - 0.05, CUT2) * (1 - ramp(t, 26.2, 28.2));
  const ampOf = (t) => 0.45 + 1.9 * storm(t);
  const poseShip = (t) => {
    const a = ampOf(t), base = t < CUT2 ? SP : S0;
    shipG.position.set(base[0], wave(base[0], base[2], t, a) * 0.85 + 0.1, base[2]);
    shipG.rotation.set(a * 0.07 * Math.sin(t * 1.3 + 0.5), 0, a * 0.05 * Math.sin(t * 0.9));
    shipG.updateMatrixWorld(true);
  };
  const shipLocal = (t, x, y, z) => { poseShip(t); return shipG.localToWorld(V.set(x, y, z)).toArray(); };

  // ---------- the gourd vine (yaqthin): dead branch frame, vines climbing, broad leaves, a few flowers
  const GBx = 96, GBz = -6, GB = [GBx, ground(GBx, GBz) + 0.55, GBz];
  const gy = GB[1] - 0.55;
  const BR = std(0x4a4038, 0.9);
  const frameC = [
    [[-2.6, 0, 1.6], [-1.6, 2.6, 0.8], [0.4, 3.3, 0.2], [2.4, 2.4, -0.6], [3.0, 0, -1.2]],
    [[-2.2, 0, -1.8], [-1.0, 2.9, -0.8], [1.0, 3.0, 0.6], [2.6, 0, 1.8]],
  ].map((pp) => new THREE.CatmullRomCurve3(pp.map(([x, y, z]) => new THREE.Vector3(GBx + x, gy + y, GBz + z))));
  frameC.forEach((c) => add(new THREE.Mesh(new THREE.TubeGeometry(c, 30, 0.09, 6), BR)));
  const VINEM = std(0x2f5a28, 0.7), LEAFM = std(0x3f7d36, 0.65, 0, { side: THREE.DoubleSide }), FLM = std(0xf0c840, 0.5, 0, { emissive: 0x7a5a00, emissiveIntensity: 0.3 });
  const lf = new THREE.Shape(); lf.moveTo(0, 0); lf.bezierCurveTo(-0.6, 0.15, -0.75, 0.85, -0.3, 1.0); lf.bezierCurveTo(-0.12, 1.05, 0, 0.9, 0, 0.85); lf.bezierCurveTo(0, 0.9, 0.12, 1.05, 0.3, 1.0); lf.bezierCurveTo(0.75, 0.85, 0.6, 0.15, 0, 0);
  const leafG = new THREE.ShapeGeometry(lf, 8);
  const VINES = [];
  const tGrow = A("s6:tumbuh");
  for (let i = 0; i < 8; i++) {
    const base = frameC[i % 2], off = (rnd() - 0.5) * 0.8, rev = i % 4 >= 2;
    const ptsV = [];
    for (let k = 0; k <= 10; k++) { const u = rev ? 1 - k / 10 : k / 10; const p = base.getPoint(u); ptsV.push(new THREE.Vector3(p.x + off + Math.sin(k * 1.7 + i) * 0.25, p.y + 0.12 + Math.sin(k * 2.1 + i) * 0.12, p.z + Math.cos(k * 1.3 + i) * 0.3)); }
    const curve = new THREE.CatmullRomCurve3(ptsV);
    const g = new THREE.TubeGeometry(curve, 60, 0.05, 5);
    const m = add(new THREE.Mesh(g, VINEM));
    const leaves = [];
    for (let u = 0.12; u < 1; u += 0.075 + rnd() * 0.03) {
      const L = add(new THREE.Mesh(leafG, LEAFM)); const p = curve.getPoint(u);
      L.position.copy(p); L.rotation.set(-1.2 + rnd() * 0.9, rnd() * 6.3, (rnd() - 0.5) * 0.8);
      leaves.push({ L, u, s: 0.75 + rnd() * 0.6 });
    }
    const flowers = [0.5, 0.85].map((u) => { const f = add(new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.22, 5), FLM)); f.position.copy(curve.getPoint(u)).add(V.set(0, 0.15, 0)); return { f, u }; });
    VINES.push({ g, m, leaves, flowers, t0: tGrow + i * 0.13, n: g.index.count / 60 });
  }

  // ---------- rain, splashes, marine snow
  const NR = 1400;
  const rainG = new THREE.BufferGeometry(); const rainA = new Float32Array(NR * 6); rainG.setAttribute("position", new THREE.BufferAttribute(rainA, 3));
  const rainM = new THREE.LineBasicMaterial({ color: 0x9fb8cc, transparent: true, opacity: 0, fog: false });
  const rain = add(new THREE.LineSegments(rainG, rainM)); rain.frustumCulled = false;
  const rSeed = Array.from({ length: NR }, () => [rnd(), rnd(), rnd()]);
  const SPL = [
    { t0: 25.42, p: [1.6, 0.2, 6.6], n: 260, c: 0xcfeaff },
    { t0: A("s6:dilemparkan") - 0.15, p: [70, 0.2, -6], n: 320, c: 0xcfeaff },
  ].map((s) => { const P = pts(scene, s.n, { color: s.c, size: 0.22, opacity: 0.9 }); P.m.fog = false; const sd = Array.from({ length: s.n }, () => [rnd() * 6.28, 2 + rnd() * 6, 3 + rnd() * 7]); return { ...s, P, sd }; });
  const NSN = 700;
  const snow = pts(scene, NSN, { color: 0x6ff0de, size: 0.12, opacity: 0.7 }); snow.m.fog = false;
  const snSeed = Array.from({ length: NSN }, () => [rnd(), rnd(), rnd(), rnd()]);

  // ---------- HTML layer tags (projected from the world)
  const tags = [["L1", () => [-16, 3.5, -10]], ["L2", () => [-16, -8, ZF]], ["L3", (t) => fishLocal(t, -4, 7, 0)]].map(([id, f]) => ({ e: document.getElementById(id), f }));
  const tagOp = (t, i) => {
    const s1 = ramp(t, A("s1:tiga") + 0.15 + i * 0.25, A("s1:tiga") + 0.5 + i * 0.25) * (1 - ramp(t, K.s2 - 0.4, K.s2 - 0.1));
    const w = [A("s4:malam"), A("s4:laut"), A("s4:perut")][i];
    const s4 = ramp(t, w, w + 0.3) * (1 - ramp(t, A("s4:berdoa") - 0.6, A("s4:berdoa") - 0.25));
    return Math.max(s1, s4);
  };

  // ---------- camera: segments of [t, px,py,pz, tx,ty,tz]; cuts sit on panel changes or the lightning
  const fk = (t, o, l = [4, 0, 0]) => { const f = fishK.keys(t); return [t, f[0] + o[0], f[1] + o[1], f[2] + o[2], f[0] + l[0], f[1] + l[1], f[2] + l[2]]; };
  const rel = (t, c, p, l) => [t, c[0] + p[0], c[1] + p[1], c[2] + p[2], c[0] + l[0], c[1] + l[1], c[2] + l[2]];
  const IPa = IP.toArray(), Cc = [C0x, gC, C0z];
  const CUT3 = A("s4:berdoa") - 0.05;
  const SEGS = [
    [0, track([
      [0, 0, 3.4, 14, -18, 30, -80], [A("s1:malam") + 0.4, 0, 3.2, 11, -16, 26, -80],
      [A("s1:lautan"), 0, 2.6, 7, 0, -3, -30], [1.95, 0, -3, 3, 0, -12, -20],
      [A("s1:ikan"), -12, -17, 14, 5, -23, -4], [A("s1:Dari"), -9, -19, 22, 3, -23, -4],
      [A("s1:tiga"), -2, -7, 95, 0, -14, 0], [5.4, 0, 1, 150, 0, -12, 0], [K.s2 - 0.05, 3, 2, 158, 0, -11.5, 0]])],
    [K.s2 - 0.05, track([
      rel(K.s2 - 0.05, Cc, [-60, 34, 70], [0, 0, -4]), rel(A("s2:Niniwe"), Cc, [-42, 40, 52], [0, 0, 0]),
      rel(A("s2:Seruannya"), Cc, [-40, 30, 50], [0, 2, 0]), rel(A("s2:pergi"), Cc, [-44, 20, 38], [-14, 2, 0]),
      rel(K.s3 - 0.05, Cc, [-66, 10, 22], [-48, 2, -2])])],
    [K.s3 - 0.05, track([[K.s3 - 0.05, 72, 8, 32, 58, 2, 6], [A("s3:muatan"), 64, 6.5, 24, 53, 2, 3], [CUT2, 62, 6, 22, 52, 2, 3]])],
    [CUT2, track([
      [CUT2, 16, 7, 20, 0, 2, 0], [A("s3:penumpang"), 9, 5.5, 11, -0.5, 1.5, 0],
      [A("s3:diundi") + 0.2, -2.6, 4.4, 4.2, -3.4, 1.0, 0], [A("s3:Yunus"), -3.0, 3.6, 3.0, -3.4, 1.0, 0],
      [A("s3:keluar"), 4, 5, 13, -0.5, 1.5, 2], [25.5, 6, 2.6, 18, 1.5, -1, 6],
      [A("s3:Seekor"), 9, -5, 22, 2, -8, 6], [A("s3:menelannya"), 10, -9, 24, -2, -11, 5], [28.2, 14, -14, 26, -2, -16, 2],
      [30.5, 16, -18, 27, 2, -22, -3], [A("s4:perut"), 10, -19, 22, 4, -23, -4],
      [A("s4:laut"), 4, -8, 80, 2, -12, 0], [A("s4:malam"), 0, 2, 155, 0, -11, 0], [A("s4:sanalah"), 0, 1.5, 150, 0, -12, 0],
      [CUT3, 3, -16, 58, 4, -22, -4]])],
    [CUT3, track([
      rel(CUT3, IPa, [0, -0.6, 17], [0, -3.6, -2]), rel(A("s4:Lā"), IPa, [0, -1.0, 13.5], [0, -3.5, -2]),
      rel(A("s4:minaẓ-ẓālimīn"), IPa, [1.4, -1.6, 9.5], [0, -3.4, -2]), rel(K.s5, IPa, [0.6, -1.5, 10], [0, -3.4, -2]),
      rel(A("s5:zalim"), IPa, [-1.2, -2.2, 7.5], [0, -3.5, -2]), rel(A("s5:menyalahkan"), IPa, [0, -1, 13], [0, -3, -3]),
      rel(A("s5:mengakui"), IPa, [0, -1.8, 9], [0, -3.5, -2]), rel(K.s6 - 0.05, IPa, [0.8, -1.4, 11], [0, -3.5, -2])])],
    [K.s6 - 0.05, track([
      fk(K.s6 - 0.05, [-14, 5, 32]), fk(A("s6:bertasbih"), [-4, 3, 30]), fk(A("s6:kebangkitan"), [10, 2, 28]), fk(A("s6:Doanya"), [12, 4, 26], [10, 4, 0]),
      [A("s6:dilemparkan"), 62, 6, 24, 80, 0, -6], [A("s6:sakit"), 84, 4.5, 12, 95, 2, -6], [A("s6:tumbuh"), 89, 4.6, 7.5, 96, 2.4, -6],
      [A("s6:menaunginya"), 88.5, 5.5, 9.5, 96, 3, -6], [K.s7 + 0.4, 84, 12, 22, 120, 5, -12],
      [A("s7:seratus"), 120, 34, 44, 240, 6, -30], [A("s7:lebih"), 160, 38, 50, 248, 5, -30], [A("s7:beriman"), 180, 32, 46, 250, 6, -30],
      [A("s7:Surah"), 184, 30, 48, 250, 14, -30], [A("s7:azab"), 192, 32, 50, 250, 18, -30], [K.s8 - 0.05, 198, 36, 54, 250, 10, -30]])],
    [K.s8 - 0.05, track([[K.s8 - 0.05, 40, 16, 22, 200, 4, -25], [A("s8:Kapan"), 52, 12, 14, 220, 6, -25], [K.dur, 62, 10, 8, 230, 6, -25]])],
  ];
  const camAt = (t) => { let s = SEGS[0]; for (const g of SEGS) if (t >= g[0]) s = g; return s[1](t); };
  const look = new THREE.Vector3();

  // ---------- glow path
  const tPergi = A("s2:pergi"), tNaik = A("s3:naik"), tKel = A("s3:keluar"), tSw = fishK.tsw, tSpit = A("s6:dilemparkan"), tUtus = A("s7:diutus");
  const glowPos = (t) => {
    if (t < K.s2 - 0.05) return fishLocal(t, 7, 0.6, 0);
    if (t < K.s3 - 0.05) { const k = eout((t - tPergi) / (K.s3 - tPergi)); const x = C0x - 64 * k, z = C0z + 3 * k; return [x, ground(x, z) + 1.6, z]; }
    if (t < tKel) { const d = shipLocal(t, -5.4, 1.6, 0.6); if (t > tNaik + 0.8) return d; const k = smooth((t - tNaik) / 0.8); return lerp3([58, 2.4, 7.6], d, k); }
    if (t < 25.42) { const k = clamp01((t - tKel) / (25.42 - tKel)); const a = shipLocal(tKel, -5.4, 1.6, 0.6), b = [1.6, 0.2, 6.6]; const p = lerp3(a, b, smooth(k)); p[1] += Math.sin(Math.PI * k) * 1.8; return p; }
    if (t < tSw) { const k = smooth((t - 25.42) / (tSw - 25.42)); return lerp3([1.6, 0.2, 6.6], fishK.M, k); }
    if (t < tSpit) {
      const kin = smooth((t - tSw) / 0.6), kout = smooth((t - (tSpit - 0.5)) / 0.5);
      const lx = 22 + (7 - 22) * kin + (22 - 7) * kout, ly = -0.5 + 1.1 * kin - 1.1 * kout;
      return fishLocal(t, lx, ly, 0);
    }
    if (t < tSpit + 1.0) { const a = fishLocal(tSpit, 22, -0.5, 0), k = smooth((t - tSpit) / 1.0); const p = lerp3(a, GB, k); p[1] += Math.sin(Math.PI * k) * 6; return p; }
    if (t < tUtus) return GB;
    const k = smooth((t - tUtus) / 1.4); const x = GBx + (C0x - GBx) * k, z = GBz + (C0z - GBz) * k;
    return [x, (k >= 1 ? C1[1] : ground(x, z) + 1.6) + Math.sin(Math.PI * k) * 8, z];
  };
  const glowInt = (t) => {
    let v = 1 + 1.4 * bump(t, A("s1:doa"), 1.2) + 0.9 * bump(t, A("s2:diutus"), 0.8) + 0.9 * bump(t, A("s2:Seruannya"), 0.8);
    if (t > tPergi && t < K.s3) v *= 0.85 + 0.3 * Math.sin(t * 23) * Math.sin(t * 7.1);
    if (t > tSpit + 0.6 && t < tUtus) v *= 0.45 + 0.08 * Math.sin(t * 9) + 0.55 * ramp(t, tGrow + 0.5, tGrow + 2.6);
    v += 1.2 * bump(t, A("s7:beriman"), 1.0);
    return v;
  };
  const doaW = ["s4:Lā", "s4:ilāha", "s4:illā", "s4:anta", "s4:subḥānaka", "s4:innī", "s4:kuntu", "s4:minaẓ-ẓālimīn"].map(A);
  const innerInt = (t) => {
    let v = 0.55;
    doaW.forEach((w) => { v += 0.13 * ramp(t, w, w + 0.4) + 0.5 * bump(t, w, 0.5); });
    v += 0.4 * ramp(t, A("s5:zalim"), A("s5:zalim") + 1.2) + 1.3 * ramp(t, A("s5:mengakui"), A("s5:mengakui") + 1.4);
    return v;
  };

  const tmpC = new THREE.Color();
  return (t) => {
    const c = camAt(t);
    const sh = 0.35 * storm(t) * (t > CUT2 && t < 25.8 ? 1 : 0);
    // the camera rides the swell during the lot close-up
    const fw = ramp(t, A("s3:penumpang") - 0.2, A("s3:diundi")) * (1 - ramp(t, A("s3:Yunus") + 0.4, tKel + 0.2));
    poseShip(t);
    const sy = fw * shipG.position.y;
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.25 + sh * Math.sin(t * 13), c[1] + sy + Math.sin(t * 0.29) * 0.18 + sh * Math.sin(t * 11.3), c[2] + Math.cos(t * 0.31) * 0.25);
    look.set(c[3], c[4] + sy, c[5]);
    cam.lookAt(look);
    const cp = cam.position;
    const inside = cp.y < -300;
    const A0 = ampOf(t);
    const under = !inside && cp.z < ZF && cp.x < 84 && cp.y < wave(cp.x, cp.z, t, A0);
    const D = ramp(t, A("s6:Doanya"), 70) * 0.72 + ramp(t, A("s7:azab"), 81) * 0.28;
    const lt = [21.0, A("s3:Undian") - 0.2, 24.3].reduce((s, a) => s + (t > a ? Math.exp(-(t - a) / 0.14) * (0.6 + 0.4 * Math.sin((t - a) * 60)) : 0), 0) * storm(t);
    const flash = Math.max(0, lt) + (t > CUT2 && t < CUT2 + 0.25 ? 1 - (t - CUT2) / 0.25 : 0);

    // fog and light by medium
    if (inside) { scene.fog.color.setRGB(0.02, 0.012, 0.03); scene.fog.density = 0.035; }
    else if (under) { scene.fog.color.setRGB(0.008, 0.05, 0.07); scene.fog.density = 0.022; }
    else { scene.fog.color.setRGB(0.01 + 0.08 * D, 0.02 + 0.06 * D, 0.04 + 0.05 * D); scene.fog.density = 0.0035 + 0.004 * storm(t); }
    scene.background = scene.fog.color;
    const faceOp = clamp01((cp.z - ZF - 2) / 25) * (inside ? 0 : 1) * (t < K.s6 ? 1 : 0);
    hemi.intensity = 0.7 + 0.6 * D + 2.2 * flash;
    deep.intensity = under ? 1.4 : faceOp > 0 ? 2.4 * faceOp : 0;
    moon.intensity = 1.0 * (1 - D) + 0.3;
    sun.intensity = 2.2 * D;
    flashL.intensity = 6 * flash;

    // sky
    sky.visible = !inside; sky.position.copy(cp);
    paintSky(D, flash * 0.6);
    stars.P.visible = !inside && !under; stars.P.position.copy(cp);
    const sDim = (1 - 0.7 * ramp(t, A("s1:malam") - 0.1, A("s1:malam") + 0.7) * (1 - ramp(t, A("s1:tiga"), A("s1:tiga") + 0.8))) * (1 - 0.6 * ramp(t, A("s4:malam") - 0.1, A("s4:malam") + 0.6) * (1 - ramp(t, CUT3, CUT3 + 0.2))) * (1 - D) * (1 - storm(t));
    for (let i = 0; i < NST; i++) { const s = stSeed[i], b = sDim * s[2] * (0.75 + 0.25 * Math.sin(t * 2.3 + s[1])); stars.col[i * 3] = 0.85 * b; stars.col[i * 3 + 1] = 0.9 * b; stars.col[i * 3 + 2] = b; }
    stars.commit();
    moonS.visible = !inside && !under; moonS.position.copy(cp).addScaledVector(moonDir, 450);
    moonS.material.opacity = (1 - 0.8 * ramp(t, A("s1:malam") - 0.1, A("s1:malam") + 0.8)) * (1 - D) * (1 - storm(t)) * 0.9 + 0.1 * (1 - D);

    // sea + face
    sea.visible = !inside;
    if (!inside) {
      for (let i = 0; i < seaP.count; i++) seaP.setY(i, wave(seaP.getX(i), seaP.getZ(i), t, A0));
      seaP.needsUpdate = true; seaG.computeVertexNormals();
    }
    sea.material.roughness = 0.2 + 0.45 * D + 0.45 * storm(t); sea.material.metalness = 0.7 - 0.35 * D;
    sea.material.color.setRGB(0.028 + 0.05 * D, 0.07 + 0.05 * D, 0.1 + 0.04 * D);
    face.visible = wline.visible = soil.visible = faceOp > 0.001;
    if (face.visible) {
      for (let i = 0; i <= 146; i++) { const x = faceP.getX(i), y = wave(x, ZF, t, A0); faceP.setY(i, y); lineA[i * 3] = x; lineA[i * 3 + 1] = y + 0.05; lineA[i * 3 + 2] = ZF; }
      faceP.needsUpdate = true; lineG.attributes.position.needsUpdate = true;
      faceM.opacity = faceOp; lineM.opacity = 0.8 * faceOp; soil.material.opacity = faceOp;
    }

    // fish
    const f = poseFish(t);
    fishG.visible = !inside;
    const sw = 1.1, ph = t * 2.2;
    const jaw = jawOf(t);
    const fp = fishGeo.attributes.position.array;
    for (let i = 0; i < fp.length; i += 3) {
      const x = fishBase[i], y = fishBase[i + 1], s = (22.6 - x) / 45.2;
      let dy = sw * 1.4 * s * s * Math.sin(ph - 3.2 * s);
      if (x > 15 && jaw > 0) { const k = Math.pow((x - 15) / 7.6, 1.5); dy += y < -0.3 ? -jaw * 2.6 * k : y > 0.3 ? jaw * 0.6 * k : 0; }
      fp[i + 1] = y + dy;
    }
    fishGeo.attributes.position.needsUpdate = true; fishGeo.computeVertexNormals();
    fluke.position.set(-22.3, sw * 1.4 * Math.sin(ph - 3.2), 0);
    fluke.rotation.z = -0.45 * Math.cos(ph - 3.2);
    mouthHole.position.set(21.6, -0.5 - jaw * 0.9, 0); mouthHole.scale.set(Math.max(0.001, jaw * 2.4), Math.max(0.001, jaw * 1.6), 1);
    mouthHole.visible = jaw > 0.01;
    const doaPulse = doaW.reduce((s, w) => s + bump(t, w, 0.6), 0);
    FISHM.emissiveIntensity = 0.45 + 0.6 * bump(t, A("s1:doa"), 1.2) + 0.5 * doaPulse + 0.8 * ramp(t, A("s5:mengakui"), K.s6) * (1 - ramp(t, K.s6, K.s6 + 6)) + 0.4 * ramp(t, A("s6:Doanya"), A("s6:Doanya") + 1);

    // glow
    const gp = glowPos(t), gi = glowInt(t);
    poseShip(t); poseFish(t);
    glow.G.position.set(gp[0], gp[1], gp[2]); glow.G.visible = !inside;
    const inFish = t < K.s2 - 0.05 || (t > tSw && t < tSpit + 0.25);
    const hot = t > tPergi && t < K.s3 ? 0.18 : 0;
    glow.halo.material.depthTest = glow.core.material.depthTest = !inFish;
    glow.halo.material.color.setRGB(1, 0.85 - hot, 0.7 - hot);
    const distC = cp.distanceTo(glow.G.position);
    const hs = (inFish ? 3.6 * Math.max(1, distC / 60) : 2.2 * Math.max(1, distC / 40)) * gi * (0.92 + 0.08 * Math.sin(t * 9.1));
    glow.halo.scale.setScalar(hs);
    glow.core.visible = !inFish; glow.core.scale.setScalar(Math.max(1, distC / 30) * (0.8 + 0.2 * gi));
    glow.L.intensity = inFish ? 0 : 16 * gi;
    glow.halo.material.opacity = inFish ? 0.7 : 0.85;

    // interior
    inG.visible = inside; glowI.G.visible = inside; motes.P.visible = inside;
    if (inside) {
      const ii = innerInt(t);
      glowI.G.position.set(IP.x, IP.y - 4.3, IP.z - 2);
      glowI.halo.scale.setScalar(Math.min(2.6, 1.1 * ii) * (0.94 + 0.06 * Math.sin(t * 8.3)));
      glowI.halo.material.opacity = 0.75;
      glowI.core.scale.setScalar(0.6 + 0.12 * ii);
      glowI.L.intensity = 14 * ii;
      wall.scale.set(1 + 0.02 * Math.sin(t * 0.9), 1 + 0.02 * Math.sin(t * 0.9 + 1), 1);
      WALLM.emissiveIntensity = 0.3 + 0.35 * doaPulse + 0.7 * ramp(t, A("s5:mengakui"), A("s5:mengakui") + 1.5);
      RIBS.forEach((m, k) => { m.emissiveIntensity = 0.22 + 0.35 * bump(t, doaW[Math.min(7, k % 8)] + k * 0.03, 0.6) + 1.1 * ramp(t, A("s5:mengakui") + k * 0.07, A("s5:mengakui") + k * 0.07 + 0.5); });
      const rate = 0.25 + 0.5 * clamp01((ii - 0.55) / 2);
      for (let i = 0; i < NMO; i++) {
        const s = moSeed[i], life = 5, ph2 = ((t * rate + s[0] * life) % life) / life;
        const a = s[1] * 6.28, rr = 0.3 + s[2] * 4 * ph2;
        motes.pos[i * 3] = IP.x + Math.cos(a + t * 0.2) * rr; motes.pos[i * 3 + 1] = IP.y - 4.5 + ph2 * 10; motes.pos[i * 3 + 2] = IP.z - 2 + Math.sin(a + t * 0.2) * rr * 0.6;
        tmpC.copy(s[3] < 0.6 ? ambC : tealC).multiplyScalar(Math.sin(Math.PI * ph2) * clamp01((ii - 0.4) / 1.2));
        motes.col[i * 3] = tmpC.r; motes.col[i * 3 + 1] = tmpC.g; motes.col[i * 3 + 2] = tmpC.b;
      }
      motes.commit();
    }

    // ship, sail, lots, pier
    const shipOn = t > K.s3 - 0.1 && t < 28.5;
    shipG.visible = shipOn && !inside; pier.visible = t < CUT2 + 0.01 && t > K.s3 - 0.2;
    if (shipOn) {
      const sp = sailG.attributes.position.array;
      for (let i = 0; i < sp.length; i += 3) { const y = sailB[i + 1], z = sailB[i + 2]; sp[i] = sailB[i] - (0.5 + 0.6 * storm(t)) * Math.cos((z / 7.4) * Math.PI) * (0.5 + 0.5 * Math.cos(((y + 1.6) / 3.2) * Math.PI)) + 0.08 * storm(t) * Math.sin(t * 9 + z); }
      sailG.attributes.position.needsUpdate = true;
      for (const L of LOTS) {
        L.m.visible = t > L.ts;
        const k = (t - L.ts) / 0.4;
        const y = k < 1 ? L.y0 - (L.y0 - 1.08) * k * k : 1.08 + 0.22 * Math.max(0, Math.sin(Math.PI * clamp01((t - L.ts - 0.4) / 0.2))) + 0.06 * Math.max(0, Math.sin(Math.PI * clamp01((t - L.ts - 0.6) / 0.12)));
        L.m.position.set(L.x, y, L.z);
        L.m.rotation.set(0, L.yaw, L.spin * (1 - eout((t - L.ts) / 0.62)));
      }
      markM.emissiveIntensity = 3.5 * ramp(t, A("s3:Undian"), A("s3:Yunus") + 0.2) * (1 - 0.85 * ramp(t, tKel - 0.3, tKel + 0.3));
    }

    // city
    for (let i = 0; i < NL; i++) {
      const L = LIGHTS[i];
      let b = 0;
      if (t < K.s3) b = (L.s < 0.3 && !L.out ? 1 : 0) * ramp(t, K.s2 - 0.5, K.s2) * (1 - (L.s > 0.03 ? ramp(t, A("s2:ditolak") + L.s * 2, A("s2:ditolak") + L.s * 2 + 0.3) : 0));
      else {
        const on = (L.out ? A("s7:lebih") - 0.3 : A("s7:seratus")) + L.r * 1.6 + L.s * 0.3;
        b = ramp(t, on, on + 0.3) * (0.55 + 0.45 * ramp(t, A("s7:beriman") + L.s * 0.4, A("s7:beriman") + L.s * 0.4 + 0.3));
      }
      b *= 0.85 + 0.15 * Math.sin(t * 3 + L.s * 40);
      cityL.col[i * 3] = b; cityL.col[i * 3 + 1] = 0.78 * b; cityL.col[i * 3 + 2] = 0.5 * b;
    }
    cityL.commit();
    for (const R of RINGS) {
      const k = (t - R.t0) / 2.2;
      let rad = 2 + 34 * eout(k), op = (1 - clamp01(k)) * (k > 0 ? 1 : 0);
      if (R.rej) { const kb = ramp(t, A("s2:ditolak"), A("s2:ditolak") + 0.8); rad = (2 + 14 * eout(k / 0.4)) * (1 - kb) + 1.5 * kb; op = (k > 0 ? 1 : 0) * (1 - ramp(t, A("s2:ditolak") + 0.5, A("s2:ditolak") + 1)); }
      R.m.visible = op > 0.01 && t < K.s3; R.m.scale.setScalar(rad); R.m.material.opacity = 0.8 * op;
    }
    const cg = ramp(t, A("s7:Surah") - 0.3, A("s7:Surah") + 1.6), cl = ramp(t, A("s7:diangkat") - 0.3, A("s7:diangkat") + 1.6);
    for (const cc of CLOUD) {
      const v = cg * (1 - cl);
      cc.m.visible = v > 0.01;
      cc.m.position.set(cc.p[0] + cc.d[0] * 30 * cl, cc.p[1] + 14 * (1 - cg) + 26 * cl + Math.sin(t * 0.6 + cc.k * 6), cc.p[2] + cc.d[1] * 24 * cl);
      cc.m.scale.set(cc.s * v, cc.s * 0.55 * v, cc.s * v);
    }
    cloudM.opacity = 1;

    // vine time-lapse
    for (const vn of VINES) {
      const g = eout((t - vn.t0) / 2.0);
      vn.m.visible = g > 0.005;
      vn.g.setDrawRange(0, Math.floor(g * 60) * vn.n);
      for (const L of vn.leaves) { const s = Math.max(0.001, back((g - L.u) / 0.18)) * L.s * (g > L.u ? 1 : 0); L.L.visible = s > 0.002; L.L.scale.setScalar(s); }
      for (const F of vn.flowers) { const s = Math.max(0.001, back((g - F.u - 0.1) / 0.15)); F.f.visible = g > F.u + 0.1; F.f.scale.setScalar(s); }
    }

    // rain
    const rv = storm(t) * (under || inside ? 0 : 1);
    rain.visible = rv > 0.01;
    if (rain.visible) {
      rainM.opacity = 0.45 * rv;
      for (let i = 0; i < NR; i++) {
        const s = rSeed[i];
        const x = cp.x + ((((s[0] * 50 - cp.x + t * 3) % 50) + 50) % 50) - 25, z = cp.z + ((((s[2] * 50 - cp.z) % 50) + 50) % 50) - 25;
        const y = cp.y + 14 - ((t * 32 + s[1] * 30) % 30);
        rainA[i * 6] = x; rainA[i * 6 + 1] = y; rainA[i * 6 + 2] = z; rainA[i * 6 + 3] = x - 0.25; rainA[i * 6 + 4] = y - 1.2; rainA[i * 6 + 5] = z;
      }
      rainG.attributes.position.needsUpdate = true;
    }
    // splashes
    for (const S of SPL) {
      const dt = t - S.t0;
      S.P.P.visible = dt > 0 && dt < 1.6 && !inside;
      if (S.P.P.visible) {
        S.sd.forEach((d, i) => { const r0 = d[1] * 0.35 * dt; S.P.pos[i * 3] = S.p[0] + Math.cos(d[0]) * r0 * 1.5; S.P.pos[i * 3 + 1] = S.p[1] + d[2] * dt - 9.8 * dt * dt; S.P.pos[i * 3 + 2] = S.p[2] + Math.sin(d[0]) * r0 * 1.5; const b = (1 - dt / 1.6) * (S.P.pos[i * 3 + 1] > -0.3 ? 1 : 0); S.P.col[i * 3] = 0.8 * b; S.P.col[i * 3 + 1] = 0.9 * b; S.P.col[i * 3 + 2] = b; });
        S.P.commit();
      }
    }
    // marine snow around the camera underwater (world-fixed, wrapped)
    snow.P.visible = under;
    if (under) {
      const W = 36;
      for (let i = 0; i < NSN; i++) {
        const s = snSeed[i], wr = (v, c) => c + ((((v - c) % W) + W) % W) - W / 2;
        snow.pos[i * 3] = wr(s[0] * W + Math.sin(t * 0.2 + s[3] * 6) * 0.6, cp.x); snow.pos[i * 3 + 1] = wr(s[1] * W - t * 0.25, cp.y); snow.pos[i * 3 + 2] = wr(s[2] * W, cp.z);
        const b = 0.35 + 0.65 * s[3]; snow.col[i * 3] = 0.3 * b; snow.col[i * 3 + 1] = b; snow.col[i * 3 + 2] = 0.9 * b;
      }
      snow.commit();
    }

    // layer tags
    tags.forEach((tg, i) => {
      if (!tg.e) return;
      const o = tagOp(t, i) * (inside ? 0 : 1);
      tg.e.style.opacity = o;
      if (o > 0) { const p = tg.f(t); V.set(p[0], p[1], p[2]).project(cam); tg.e.style.transform = `translate(${((V.x + 1) / 2) * 1080}px,${((1 - V.y) / 2) * 1920}px)`; if (V.z > 1) tg.e.style.opacity = 0; }
    });

    bp.strength = 0.75 + 0.25 * (inside ? 1 : 0);
    comp.render();
  };
}
