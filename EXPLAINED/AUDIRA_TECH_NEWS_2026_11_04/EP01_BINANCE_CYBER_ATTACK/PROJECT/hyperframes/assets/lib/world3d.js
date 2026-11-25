// CHAIN OF CUSTODY: the 3D world of EP01. render(t) is a pure function of film time.
// Geometry is illustrative: the rack hall stands in for "Binance infrastructure" in general,
// and the wallet graph carries the reported count (about 12,000) but not on-chain positions.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";

const W = 1080, H = 1920;
const BLUE = new THREE.Color("#2FA8FF"), RED = new THREE.Color("#FF2E3F"), ICE = new THREE.Color("#DCEFFF"), DIM = new THREE.Color("#0B2A44");

function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (x) => { x = clamp01(x); return x * x * x * (x * (6 * x - 15) + 10); };
const ramp = (t, a, b) => smooth((t - a) / (b - a));

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 8;
  if (repeat) { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(repeat[0], repeat[1]); }
  return tx;
}

// Catmull-Rom over non-uniform time keys, so the camera never stops at a key.
function track(keys) {
  const n = keys.length;
  const tan = keys.map((k, i) => {
    const a = keys[Math.max(0, i - 1)], b = keys[Math.min(n - 1, i + 1)];
    return k.map((_, j) => (j === 0 ? 0 : (b[j] - a[j]) / Math.max(0.001, b[0] - a[0])));
  });
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0;
    while (keys[i + 1][0] < t) i++;
    const a = keys[i], b = keys[i + 1], h = b[0] - a[0], u = (t - a[0]) / h;
    const u2 = u * u, u3 = u2 * u;
    const out = [];
    for (let j = 1; j < a.length; j++) {
      out.push((2 * u3 - 3 * u2 + 1) * a[j] + (u3 - 2 * u2 + u) * h * tan[i][j] + (-2 * u3 + 3 * u2) * b[j] + (u3 - u2) * h * tan[i + 1][j]);
    }
    return out;
  };
}

export function create(canvas, K) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#02050A");
  scene.fog = new THREE.FogExp2(0x02060c, 0.03);
  const cam = new THREE.PerspectiveCamera(46, W / H, 0.05, 900);
  const rnd = mulberry(20261029);

  // ---------- rack hall ----------
  const rackTex = canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = "#0c1014"; g.fillRect(0, 0, w, h);
    for (let y = 0; y < 16; y++) {
      const yy = 8 + y * 31.5;
      g.fillStyle = y % 2 ? "#141a20" : "#10151a"; g.fillRect(10, yy, w - 20, 27);
      g.strokeStyle = "#2a333c"; g.lineWidth = 1; g.strokeRect(10.5, yy + 0.5, w - 21, 26);
      g.fillStyle = "#05070a";
      for (let x = 60; x < w - 18; x += 7) for (let v = 0; v < 3; v++) g.fillRect(x, yy + 5 + v * 7, 4, 4);
      g.fillStyle = "#39434d"; g.fillRect(16, yy + 6, 5, 15); g.fillRect(w - 22, yy + 6, 5, 15);
    }
  });
  const rackMat = new THREE.MeshStandardMaterial({ map: rackTex, metalness: 0.55, roughness: 0.46, emissiveMap: rackTex, emissive: new THREE.Color("#7fa6c9"), emissiveIntensity: 1.5 });
  const sideMat = new THREE.MeshStandardMaterial({ color: "#090c10", metalness: 0.8, roughness: 0.5 });
  const rackGeo = new THREE.BoxGeometry(1.1, 2.7, 1.9);
  const hall = new THREE.Group();
  scene.add(hall);
  const RACKS = 60, ROW = 30, PITCH = 2;
  const racks = new THREE.InstancedMesh(rackGeo, [rackMat, rackMat, sideMat, sideMat, sideMat, sideMat], RACKS);
  const m = new THREE.Matrix4();
  for (let i = 0; i < RACKS; i++) {
    const side = i % 2 ? 1 : -1, z = -Math.floor(i / 2) * PITCH;
    m.makeTranslation(side * 2.45, 1.35, z);
    racks.setMatrixAt(i, m);
  }
  hall.add(racks);

  // Status LEDs. Each flips red when the breach wave passes its z.
  const LEDS = 3000;
  const ledGeo = new THREE.BoxGeometry(0.012, 0.022, 0.05);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const leds = new THREE.InstancedMesh(ledGeo, ledMat, LEDS);
  const ledZ = new Float32Array(LEDS), ledSeed = new Float32Array(LEDS);
  for (let i = 0; i < LEDS; i++) {
    const side = rnd() < 0.5 ? -1 : 1, row = Math.floor(rnd() * ROW);
    const z = -row * PITCH - 0.9 + rnd() * 1.8, y = 0.1 + Math.floor(rnd() * 16) * 0.165;
    m.makeTranslation(side * 1.885, y + 0.05, z);
    leds.setMatrixAt(i, m);
    leds.setColorAt(i, BLUE);
    ledZ[i] = z; ledSeed[i] = rnd();
  }
  hall.add(leds);

  // Overhead strips and their floor reflection, faked with a mirrored copy under a glossy floor.
  const stripMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.11, 0.17, 0.27), toneMapped: false });
  const strips = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 0.02, 1.5), stripMat, ROW);
  for (let i = 0; i < ROW; i++) { m.makeTranslation(0, 3.25, -i * PITCH); strips.setMatrixAt(i, m); }
  hall.add(strips);
  const mirror = new THREE.Group();
  mirror.scale.y = -1;
  mirror.add(new THREE.InstancedMesh(rackGeo, sideMat, RACKS).copy(racks));
  mirror.add(new THREE.InstancedMesh(ledGeo, ledMat, LEDS));
  const mirLeds = mirror.children[1];
  for (let i = 0; i < LEDS; i++) { leds.getMatrixAt(i, m); mirLeds.setMatrixAt(i, m); mirLeds.setColorAt(i, BLUE); }
  mirror.add(new THREE.InstancedMesh(strips.geometry, stripMat, ROW).copy(strips));
  hall.add(mirror);
  const tile = canvasTex(256, 256, (g, w) => {
    g.fillStyle = "#10151b"; g.fillRect(0, 0, w, w);
    g.strokeStyle = "#232c35"; g.lineWidth = 3; g.strokeRect(0, 0, w, w);
    g.fillStyle = "#1a222a";
    for (let x = 28; x < w; x += 40) for (let y = 28; y < w; y += 40) g.fillRect(x, y, 3, 3);
  }, [12, 70]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 90), new THREE.MeshStandardMaterial({ map: tile, metalness: 0.75, roughness: 0.3, transparent: true, opacity: 0.8 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -30);
  hall.add(floor);

  // Soft haze that catches the strip light.
  const puff = canvasTex(128, 128, (g, w) => {
    const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.35, "rgba(255,255,255,.34)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, w, w);
  });
  const haze = [];
  for (let i = 0; i < 26; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: puff, color: BLUE, transparent: true, opacity: 0.045, depthWrite: false, blending: THREE.AdditiveBlending }));
    const s = 4 + rnd() * 5;
    sp.scale.set(s, s, 1);
    sp.position.set((rnd() - 0.5) * 2.4, 0.7 + rnd() * 2.2, -rnd() * 62);
    hall.add(sp); haze.push(sp);
  }

  const key = new THREE.PointLight(0x7fc4ff, 60, 34, 1.5);
  const fill = new THREE.PointLight(0x7fc4ff, 10, 18, 1.8);
  scene.add(key, fill, new THREE.AmbientLight(0x304050, 0.9));

  // ---------- the vault: the hot wallet as an object ----------
  const VZ = -68;
  const vault = new THREE.Group();
  vault.position.set(0, 2.5, VZ);
  scene.add(vault);
  const vaultBody = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.4, 3.4), new THREE.MeshStandardMaterial({ color: "#2b3540", metalness: 0.7, roughness: 0.38, emissive: "#0d1620", emissiveIntensity: 1 }));
  vault.add(vaultBody);
  const vaultEdges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(3.46, 3.46, 3.46)), new THREE.LineBasicMaterial({ color: 0xffffff, toneMapped: false }));
  vault.add(vaultEdges);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const rings = [0, 1, 2].map((i) => {
    const r = new THREE.Mesh(new THREE.TorusGeometry(2.9 + i * 0.5, 0.01, 8, 160), ringMat);
    vault.add(r);
    return r;
  });
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, wireframe: true }));
  core.position.z = 1.86;
  vault.add(core);
  const vaultFloor = new THREE.Mesh(new THREE.CircleGeometry(16, 64), new THREE.MeshStandardMaterial({ color: "#0c1117", metalness: 0.85, roughness: 0.26 }));
  vaultFloor.rotation.x = -Math.PI / 2;
  vaultFloor.position.set(0, 0.002, VZ);
  scene.add(vaultFloor);

  // ---------- transaction stream ----------
  const SN = 1700;
  const sPos = new Float32Array(SN * 3), sCol = new Float32Array(SN * 3);
  const sSeed = [];
  for (let i = 0; i < SN; i++) sSeed.push([rnd(), (rnd() - 0.5) * 2.6, 0.35 + rnd() * 2.5, 6 + rnd() * 7]);
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
  sGeo.setAttribute("color", new THREE.BufferAttribute(sCol, 3));
  const dot = puff;
  const sMat = new THREE.PointsMaterial({ size: 0.075, map: dot, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, toneMapped: false });
  const stream = new THREE.Points(sGeo, sMat);
  stream.frustumCulled = false;
  scene.add(stream);

  // ---------- laundering graph: 12,000 wallets ----------
  const G = new THREE.Vector3(0, 62, -68);
  const GN = 12000;
  const gPos = new Float32Array(GN * 3), gCol = new Float32Array(GN * 3), parent = new Int32Array(GN);
  const lPos = new Float32Array(GN * 6), lCol = new Float32Array(GN * 6);
  const dir = new THREE.Vector3(), tmpC = new THREE.Color();
  const dirs = new Float32Array(GN * 3);
  const rg = mulberry(40000);
  gPos[0] = G.x; gPos[1] = G.y; gPos[2] = G.z;
  for (let i = 1; i < GN; i++) {
    // Earlier wallets fan out to later ones, so reveal order grows outward like the reported split.
    const p = i < 11 ? 0 : Math.floor(rg() ** 0.72 * i);
    parent[i] = p;
    const dx = p === 0 ? rg() * 2 - 1 : dirs[p * 3] + (rg() - 0.5) * 0.9;
    const dy = p === 0 ? rg() * 2 - 1 : dirs[p * 3 + 1] + (rg() - 0.5) * 0.9;
    const dz = p === 0 ? rg() * 2 - 1 : dirs[p * 3 + 2] + (rg() - 0.5) * 0.9;
    dir.set(dx, dy, dz).normalize();
    dirs[i * 3] = dir.x; dirs[i * 3 + 1] = dir.y; dirs[i * 3 + 2] = dir.z;
    const len = 0.7 + rg() * 2.4;
    for (let a = 0; a < 3; a++) {
      gPos[i * 3 + a] = gPos[p * 3 + a] + [dir.x, dir.y, dir.z][a] * len;
      lPos[i * 6 + a] = gPos[p * 3 + a];
      lPos[i * 6 + 3 + a] = gPos[i * 3 + a];
    }
    const shade = 0.55 + rg() * 0.75;
    tmpC.copy(RED).multiplyScalar(shade);
    if (rg() < 0.05) tmpC.lerp(ICE, 0.65);
    gCol[i * 3] = tmpC.r; gCol[i * 3 + 1] = tmpC.g; gCol[i * 3 + 2] = tmpC.b;
    for (const off of [0, 3]) { lCol[i * 6 + off] = tmpC.r * 0.26; lCol[i * 6 + off + 1] = tmpC.g * 0.26; lCol[i * 6 + off + 2] = tmpC.b * 0.26; }
  }
  gCol[0] = 2.2; gCol[1] = 2.2; gCol[2] = 2.2;
  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute("position", new THREE.BufferAttribute(gPos, 3));
  gGeo.setAttribute("color", new THREE.BufferAttribute(gCol, 3));
  const nodes = new THREE.Points(gGeo, new THREE.PointsMaterial({ size: 0.34, map: dot, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  nodes.frustumCulled = false;
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute("position", new THREE.BufferAttribute(lPos, 3));
  lGeo.setAttribute("color", new THREE.BufferAttribute(lCol, 3));
  const edges = new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  edges.frustumCulled = false;
  scene.add(edges, nodes);

  // Frozen share: ice blocks sized by reported value, 44 of 100 blocks = US$2.85B of US$6.43B.
  const ICEN = 100;
  const iceGeo = new THREE.BoxGeometry(0.95, 0.95, 0.95);
  const iceMat = new THREE.MeshStandardMaterial({ color: "#BFE4FF", metalness: 0.15, roughness: 0.12, transparent: true, opacity: 0.86, emissive: "#2E7FC0", emissiveIntensity: 0.65 });
  const ice = new THREE.InstancedMesh(iceGeo, iceMat, ICEN);
  ice.frustumCulled = false;
  const icePos = [];
  const IC = new THREE.Vector3(-9, 58, -66);
  for (let i = 0; i < ICEN; i++) icePos.push([IC.x + ((i % 10) - 4.5) * 1.12, IC.y + Math.floor(i / 10) * 1.12, IC.z + (rnd() - 0.5) * 0.4]);
  scene.add(ice);
  const iceLight = new THREE.PointLight(0xbfe4ff, 0, 30, 1.6);
  iceLight.position.copy(IC).add(new THREE.Vector3(0, 6, 7));
  scene.add(iceLight);

  // ---------- recovery gauge: 20 discs, 19 replaced (about 95%) ----------
  const GZ = new THREE.Vector3(-62, 52, -60);
  const discs = [];
  const discGeo = new THREE.CylinderGeometry(5, 5, 0.82, 64);
  const discMatOn = new THREE.MeshStandardMaterial({ color: "#1C78D8", metalness: 0.85, roughness: 0.3, emissive: "#0F4C90", emissiveIntensity: 0.28 });
  for (let i = 0; i < 20; i++) {
    const on = new THREE.Mesh(discGeo, i < 19 ? discMatOn : new THREE.MeshBasicMaterial({ color: RED, wireframe: true, toneMapped: false, transparent: true, opacity: 0.8 }));
    on.position.set(GZ.x, GZ.y + i * 0.98, GZ.z);
    on.scale.setScalar(0.001);
    scene.add(on);
    discs.push(on);
  }
  const gaugeLight = new THREE.PointLight(0x9fd0ff, 0, 40, 1.5);
  gaugeLight.position.set(GZ.x + 8, GZ.y + 14, GZ.z + 14);
  scene.add(gaugeLight);

  // ---------- post ----------
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  composer.setPixelRatio(1);
  composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.5, 0.55, 0.78);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---------- camera ----------
  const camTrack = track([
    [0, 0, 1.55, 3, 0, 1.55, -6],
    [K.bybit, 0.1, 1.45, -24, 0, 1.5, -34],
    [K.s2, -0.15, 1.5, -30, 0, 1.6, -44],
    [K.breach, 0.25, 1.35, -40, 0, 1.8, -60],
    [K.s2e - 2, 0.2, 2.1, -56, 0, 2.5, VZ],
    [K.s3, -0.5, 2.4, -58.5, 0, 2.5, VZ],
    [K.s3 + 4.5, -7.4, 2.9, -60.8, 0, 2.5, VZ],
    [K.s4 - 0.4, -6.4, 7, -55, 0, 3.4, VZ],
    [K.s4 + 3.2, -2, 28, -46, 0, 18, VZ],
    [K.s5 - 1.2, 2, 49, -38, G.x, G.y, G.z],
    [K.s5, 2, 53, -40, G.x, G.y, G.z],
    [K.frozen, -6, 60, -46, IC.x, IC.y + 2, IC.z],
    [K.rest, 3, 63, -49, G.x, G.y, G.z],
    [K.rest + 3.2, 7, 67, -24, G.x, G.y + 2, G.z],
    [K.next, -4, 71, 2, G.x, G.y + 3, G.z - 2],
    [K.s6 - 0.45, -29, 61, -4, -50, 58, -60],
    [K.s6 + 0.6, -55, 60, -25, GZ.x, GZ.y + 7, GZ.z],
    [K.s6 + 4, -60, 61, -24, GZ.x, GZ.y + 7.4, GZ.z],
    [K.s6e - 1.4, -66, 63, -23, GZ.x, GZ.y + 8, GZ.z],
    [K.s6e - 0.2, -68, 64, -22, GZ.x + 1, GZ.y + 8.2, GZ.z],
    [K.s7, -52, 68, -2, -30, 62, -55],
    [K.s7e, -8, 74, 62, G.x, G.y + 2, G.z],
    [K.q, 5, 70, 34, G.x, G.y, G.z],
    [K.end, 0, 64, 4, G.x, G.y - 1, G.z],
    [K.dur, 0, 64, 2, G.x, G.y - 1, G.z],
  ]);
  const shakes = K.shakes;
  const tc = new THREE.Color();

  return function render(t) {
    const breachAmt = ramp(t, K.breach - 0.1, K.breach + 2.4);
    // camera
    const c = camTrack(t);
    let sx = 0, sy = 0;
    for (const [s, a] of shakes) {
      const d = t - s;
      if (d >= 0 && d < 0.46) { const k = a * (1 - d / 0.46) ** 2; sx += k * Math.sin(d * 91); sy += k * Math.cos(d * 73); }
    }
    cam.position.set(c[0] + sx, c[1] + sy, c[2]);
    cam.lookAt(c[3] + sx * 0.4, c[4] + sy * 0.4, c[5]);
    cam.rotation.z += 0.012 * Math.sin(t * 0.37);

    const inHall = 1 - ramp(t, K.s4 - 0.2, K.s4 + 3);
    scene.fog.density = 0.002 + 0.03 * inHall;
    hall.visible = t < K.s4 + 5;

    // breach wave runs through the hall from the vault toward the camera, carrying red with it
    const front = -72 + 90 * ramp(t, K.breach, K.breach + 2.2);
    if (hall.visible) {
      for (let i = 0; i < LEDS; i++) {
        const blink = Math.sin(t * (2 + ledSeed[i] * 7) + ledSeed[i] * 40) > 0.1 ? 1 : 0.25;
        const hit = ledZ[i] < front && t >= K.breach ? 1 : 0;
        tc.copy(hit ? RED : BLUE).multiplyScalar((hit ? 2.2 : 1.6) * (hit ? (Math.sin(t * 13 + ledSeed[i] * 9) > -0.1 ? 1 : 0.2) : blink));
        leds.setColorAt(i, tc);
        mirLeds.setColorAt(i, tc);
      }
      leds.instanceColor.needsUpdate = true;
      mirLeds.instanceColor.needsUpdate = true;
      stripMat.color.setRGB(0.11 + 0.26 * breachAmt, 0.17 * (1 - 0.85 * breachAmt), 0.27 * (1 - 0.8 * breachAmt));
      for (const h of haze) { h.material.color.copy(BLUE).lerp(RED, breachAmt); }
    }

    // vault
    tc.copy(BLUE).lerp(RED, breachAmt).multiplyScalar(1.5);
    vaultEdges.material.color.copy(tc);
    vaultBody.material.emissive.set("#0d1620").lerp(new THREE.Color("#4a0a12"), breachAmt);
    ringMat.color.copy(tc);
    core.material.color.copy(tc).multiplyScalar(1.3);
    rings[0].rotation.set(t * 0.31, t * 0.17, 0);
    rings[1].rotation.set(t * -0.23, 1, t * 0.2);
    rings[2].rotation.set(0.7, t * 0.27, t * -0.13);
    core.rotation.y = t * 0.8;
    vault.visible = t < K.s4 + 6;
    vaultFloor.visible = vault.visible;

    key.color.copy(BLUE).lerp(RED, breachAmt);
    fill.color.copy(key.color);
    key.position.set(c[0], Math.max(2.8, c[1] + 2.5), c[2] - 7);
    fill.position.set(c[0] * 0.5 + 1.5, 5, VZ + 7);
    key.intensity = 70 * inHall;
    fill.intensity = 150 * inHall * ramp(t, K.s2 - 2, K.s2 + 3);

    // stream: inbound to the vault until the breach, outbound after it, distance is integrated so no jump
    const sOp = 1 - ramp(t, K.s4 - 0.5, K.s4 + 1);
    stream.visible = sOp > 0.01;
    sMat.opacity = sOp;
    if (stream.visible) {
      for (let i = 0; i < SN; i++) {
        const [ph, x, y, v] = sSeed[i];
        const dist = t < K.breach ? v * t : v * K.breach - 2.6 * v * (t - K.breach);
        const u = ((ph * 80 + dist) % 80 + 80) % 80;
        sPos[i * 3] = x; sPos[i * 3 + 1] = y; sPos[i * 3 + 2] = 8 - u;
        const col = t < K.breach ? BLUE : RED;
        sCol[i * 3] = col.r * 2; sCol[i * 3 + 1] = col.g * 2; sCol[i * 3 + 2] = col.b * 2;
      }
      sGeo.attributes.position.needsUpdate = true;
      sGeo.attributes.color.needsUpdate = true;
    }

    // graph growth: a seed set while FBI speaks, full count across "12.000 dompet ... tiga setengah hari"
    const grow = 60 + 900 * ramp(t, K.s5, K.rest) + (GN - 960) * ramp(t, K.rest + 0.2, K.next - 0.2);
    const shown = Math.floor(t < K.s4 + 1 ? 0 : grow);
    nodes.visible = edges.visible = shown > 0;
    gGeo.setDrawRange(0, shown);
    lGeo.setDrawRange(0, shown * 2);
    nodes.rotation.y = edges.rotation.y = 0;

    // ice: appears at "dibekukan" and locks in place, 44 blocks
    const iceAmt = ramp(t, K.frozen - 0.2, K.frozen + 1.3);
    const iceOut = ramp(t, K.rest + 0.2, K.rest + 1.2);
    let iceShown = 0;
    for (let i = 0; i < ICEN; i++) {
      const on = i < 44 ? ramp(t, K.frozen + i * 0.018, K.frozen + i * 0.018 + 0.4) : 0;
      const s = Math.max(0.001, on * (1 - iceOut));
      m.makeScale(s, s, s).setPosition(icePos[i][0], icePos[i][1], icePos[i][2]);
      ice.setMatrixAt(i, m);
      if (on > 0) iceShown++;
    }
    ice.instanceMatrix.needsUpdate = true;
    ice.visible = iceShown > 0 && iceOut < 1;
    iceLight.intensity = 90 * iceAmt * (1 - iceOut);

    // gauge fills on "mengganti ... 95 persen"
    for (let i = 0; i < 20; i++) {
      const a = ramp(t, K.replace + i * 0.1, K.replace + i * 0.1 + 0.5);
      discs[i].scale.setScalar(Math.max(0.001, a));
      discs[i].visible = t > K.s6 - 2 && t < K.s7e + 2;
    }
    gaugeLight.intensity = 70 * ramp(t, K.s6 - 1, K.s6 + 1);

    bloom.strength = 0.42 + 0.2 * breachAmt;
    composer.render();
  };
}
