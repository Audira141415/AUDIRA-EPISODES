// FREE MODEL VIRUS (GLITCHFORGE): a clean white asset gallery where a blocky avatar shops for free models.
// When a hidden script wakes, the feed corrupts (RGB split, tears, macroblocks, datamosh, signal lost) and snaps clean once the scripts are disabled.
// Illustration only: own icons, own simplified editor panels, no platform assets. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, std, box, cyl, stage, avatar, runPose, restPose, envStrips } from "./lib3d.js";
import { gstate } from "./gsched.js";

const P = { studio: 0xe8e9ee, pearl: 0xf6f4f1, red: 0xff1e56, green: 0x2bff88, blue: 0x1e6bff, cyan: 0x00e5ff, ink: 0x0b0c10, leaf: 0x6fd39a, trunk: 0xc7a07a };
const MONO = "'Courier New', monospace", SANS = "'Segoe UI', Arial, sans-serif";
const X = [0, 36, 72, 108, 144, 180, 216, 256];

const GlitchShader = {
  uniforms: { tDiffuse: { value: null }, uSeed: { value: 0 }, uSplit: { value: 0 }, uTear: { value: 0 }, uBlock: { value: 0 }, uMosh: { value: 0 }, uSort: { value: 0 }, uLost: { value: 0 }, uRes: { value: new THREE.Vector2(1080, 1920) } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uSeed, uSplit, uTear, uBlock, uMosh, uSort, uLost; uniform vec2 uRes; varying vec2 vUv;
    float hash(vec2 p){ p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }
    float luma(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
    void main(){
      vec2 uv = vUv;
      float row = floor(uv.y * 64.0);
      if (hash(vec2(row, uSeed)) < uTear * 0.32) uv.x += (hash(vec2(row, uSeed + 1.7)) - 0.5) * 0.22 * uTear;
      vec2 blk = floor(uv * vec2(8.0, 14.0));
      if (hash(blk + uSeed) < uBlock * 0.28) uv += (vec2(hash(blk + uSeed + 3.1), hash(blk + uSeed + 5.3)) - 0.5) * 0.16 * uBlock;
      vec2 mb = floor(uv * vec2(12.0, 21.0));
      float mosh = step(hash(mb + floor(uSeed * 0.25)), uMosh * 0.55);
      if (mosh > 0.5) { vec2 dir = normalize(vec2(hash(mb + 11.0) - 0.5, hash(mb + 17.0) - 0.5) + 1e-4); uv -= dir * 0.09 * uMosh; vec2 q = vec2(72.0, 128.0); uv = (floor(uv * q) + 0.5) / q; }
      uv = clamp(uv, 0.001, 0.999);
      float s = uSplit * 0.022;
      vec3 c; c.r = texture2D(tDiffuse, uv + vec2(s, 0.0)).r; c.g = texture2D(tDiffuse, uv).g; c.b = texture2D(tDiffuse, uv - vec2(s, s * 0.35)).b;
      float col = floor(uv.x * uRes.x / 4.0);
      if (hash(vec2(col, floor(uSeed * 0.5))) < uSort * 0.45) {
        vec3 best = c; float bl = luma(c);
        for (int i = 1; i < 14; i++) { vec3 sc = texture2D(tDiffuse, uv + vec2(0.0, float(i) * 0.014 * uSort)).rgb; float l = luma(sc); if (l > bl && l > 0.55) { best = sc; bl = l; } }
        c = mix(c, best * vec3(1.05, 0.95, 1.1), 0.9);
      }
      if (mosh > 0.5) c = floor(c * 6.0) / 6.0 * mix(vec3(1.0), vec3(0.85, 1.1, 1.15), hash(mb));
      if (uLost > 0.0) {
        float bar = floor(vUv.x * 7.0); vec3 b = vec3(0.9);
        if (bar == 1.0) b = vec3(0.9, 0.9, 0.1); if (bar == 2.0) b = vec3(0.1, 0.9, 0.9); if (bar == 3.0) b = vec3(0.1, 0.9, 0.1);
        if (bar == 4.0) b = vec3(0.9, 0.1, 0.9); if (bar == 5.0) b = vec3(0.9, 0.1, 0.1); if (bar == 6.0) b = vec3(0.1, 0.1, 0.9);
        float snow = hash(floor(vUv * uRes / 3.0) + uSeed * 7.0);
        vec3 lostC = vUv.y > 0.32 ? mix(b, vec3(snow), 0.35) : vec3(snow * 0.8);
        c = mix(c, lostC, uLost);
      }
      float unstable = clamp(uSplit + uTear + uLost, 0.0, 1.0);
      c *= 1.0 - unstable * 0.12 * step(0.5, fract(vUv.y * uRes.y / 3.0));
      gl_FragColor = vec4(c, 1.0);
    }`,
};

// canvas that repaints only when its state key changes (key derives from t, so seeking stays exact)
function dyn(w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  let key = null;
  return { tex, paint(k, fn) { if (k === key) return; key = k; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); fn(g, w, h); tex.needsUpdate = true; } };
}
const screen = (w, h, tex) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, transparent: true }));
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
const SCR = "#$%&@!?/|{}[]<>=+*~^xZQkWvJ";
const scramble = (n, seed) => { let s = ""; for (let i = 0; i < n; i++) { const v = Math.sin((seed * 31.7 + i * 7.13) * 12.9898) * 43758.5453; s += SCR[Math.floor((v - Math.floor(v)) * SCR.length)]; } return s; };

// own icon set for asset cards
function icon(g, kind, cx, cy, s) {
  g.save(); g.translate(cx, cy); g.scale(s, s); g.lineJoin = "round"; g.lineCap = "round";
  if (kind === "tree") { g.fillStyle = "#c7a07a"; g.fillRect(-9, 8, 18, 34); g.fillStyle = "#4fc283"; g.beginPath(); g.arc(0, -6, 30, 0, 7); g.arc(-20, 8, 18, 0, 7); g.arc(20, 8, 18, 0, 7); g.fill(); }
  if (kind === "car") { g.fillStyle = "#1e6bff"; rr(g, -40, -6, 80, 26, 8); g.fill(); rr(g, -22, -24, 42, 22, 8); g.fill(); g.fillStyle = "#cfe4ff"; rr(g, -15, -19, 28, 12, 3); g.fill(); g.fillStyle = "#0b0c10"; g.beginPath(); g.arc(-22, 22, 10, 0, 7); g.arc(22, 22, 10, 0, 7); g.fill(); }
  if (kind === "house") { g.fillStyle = "#f6f4f1"; g.strokeStyle = "#0b0c10"; g.lineWidth = 4; g.fillRect(-30, -4, 60, 44); g.strokeRect(-30, -4, 60, 44); g.fillStyle = "#ff1e56"; g.beginPath(); g.moveTo(-40, -2); g.lineTo(0, -38); g.lineTo(40, -2); g.closePath(); g.fill(); g.fillStyle = "#0b0c10"; g.fillRect(-8, 16, 16, 24); }
  if (kind === "sword") { g.rotate(-0.75); g.fillStyle = "#c9cdd6"; g.beginPath(); g.moveTo(-5, -44); g.lineTo(0, -54); g.lineTo(5, -44); g.lineTo(5, 14); g.lineTo(-5, 14); g.fill(); g.fillStyle = "#0b0c10"; g.fillRect(-18, 14, 36, 7); g.fillStyle = "#ffc61a"; g.fillRect(-4, 21, 8, 18); }
  if (kind === "sound") { g.fillStyle = "#0b0c10"; g.fillRect(-34, -10, 14, 20); g.beginPath(); g.moveTo(-20, -10); g.lineTo(-2, -26); g.lineTo(-2, 26); g.lineTo(-20, 10); g.fill(); g.strokeStyle = "#00b8d4"; g.lineWidth = 6; [14, 26, 38].forEach((r) => { g.beginPath(); g.arc(-2, 0, r, -0.8, 0.8); g.stroke(); }); }
  g.restore();
}
const KINDS = [["tree", "MODEL"], ["car", "MODEL"], ["house", "MODEL"], ["sword", "MODEL"], ["sound", "AUDIO"]];
function cardTex(kind, tag, verified) {
  return canvasTex(256, 300, (g, w, h) => {
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h); g.strokeStyle = "#c9cbd3"; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
    g.fillStyle = "#eef0f4"; g.fillRect(18, 18, w - 36, 180); icon(g, kind, w / 2, 108, 1.55);
    g.fillStyle = "#0b0c10"; g.font = `700 30px ${MONO}`; g.fillText(tag, 20, 240);
    g.fillStyle = "#0e9f5a"; rr(g, 20, 254, 108, 32, 8); g.fill(); g.fillStyle = "#fff"; g.font = `700 20px ${MONO}`; g.fillText("GRATIS", 30, 277);
    if (verified) { g.fillStyle = "#1e6bff"; g.beginPath(); g.arc(214, 270, 18, 0, 7); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 5; g.beginPath(); g.moveTo(205, 270); g.lineTo(212, 278); g.lineTo(224, 262); g.stroke(); }
  });
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0xc4c7cf, exp: 1.0, bloom: [0.02, 0.2, 0.99] });
  const gp = new ShaderPass(GlitchShader); comp.addPass(gp);
  envStrips(r, scene, [[6, 6, 0xffffff, 2.2, 0, 5, 0], [2.5, 6, 0xffffff, 1.6, 5, 1, 1], [2, 5, P.cyan, 1.4, -5, 1, -1], [3, 4, P.red, 1.2, 0, 0.5, -5]], 0x9a9ea8);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9fa3ad, 0.62));
  const key = new THREE.DirectionalLight(0xffffff, 3.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 120 }); key.shadow.bias = -0.0006; key.shadow.radius = 6;
  scene.add(key, key.target);
  const cyanL = new THREE.DirectionalLight(P.cyan, 0.55), redL = new THREE.DirectionalLight(P.red, 0.45); scene.add(cyanL, cyanL.target, redL, redL.target);
  const rnd = mulberry(6801);
  const pearl = () => new THREE.MeshPhysicalMaterial({ color: P.pearl, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08, iridescence: 0.5, iridescenceIOR: 1.35 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xd9dde6, metalness: 1, roughness: 0.08 });
  const inkM = std(P.ink, 0.4);

  // white cyclorama hall: floor, cove, back wall
  const studioM = std(0xd8dae0, 0.85);
  // backdrop falloff: the wall darkens upward, the floor darkens toward the back and slightly toward the lens
  const wallT = canvasTex(64, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#7d818b"); gr.addColorStop(0.7, "#bfc2ca"); gr.addColorStop(1, "#d8dae0"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const floorT = canvasTex(64, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#c3c6ce"); gr.addColorStop(0.36, "#f1f2f5"); gr.addColorStop(0.62, "#e6e8ec"); gr.addColorStop(1, "#b9bcc5"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const blobT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(10,12,18,.62)"); gr.addColorStop(0.45, "rgba(10,12,18,.3)"); gr.addColorStop(1, "rgba(10,12,18,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const blob = (sx, sz, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false, toneMapped: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.renderOrder = 1; scene.add(m); return m; };
  // out-of-focus foreground: soft dark stand pole and a blurred chrome bead near the lens at each station
  const poleT = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "rgba(30,32,40,0)"); gr.addColorStop(0.5, "rgba(30,32,40,.88)"); gr.addColorStop(1, "rgba(30,32,40,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); const v = g.createLinearGradient(0, 0, 0, h); v.addColorStop(0, "rgba(0,0,0,1)"); v.addColorStop(0.12, "rgba(0,0,0,0)"); g.globalCompositeOperation = "destination-out"; g.fillStyle = v; g.fillRect(0, 0, w, h); });
  const bokT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w * 0.42, w * 0.4, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(0.35, "rgba(150,156,170,.75)"); gr.addColorStop(0.8, "rgba(90,95,108,.55)"); gr.addColorStop(1, "rgba(90,95,108,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const fgM = (map) => new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false });
  X.forEach((x, i) => {
    const sd = i % 2 ? 1 : -1;
    const pole = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 13), fgM(poleT)); pole.position.set(x + sd * 3.5, 5.3, 15); pole.renderOrder = 5; scene.add(pole);
    const bk = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), fgM(bokT)); bk.position.set(x - sd * 3.2, 1.0, 16); bk.renderOrder = 5; scene.add(bk);
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(420, 80), std(0xffffff, 0.8, 0, { map: floorT })); floor.rotation.x = -Math.PI / 2; floor.position.set(130, 0, 14); floor.receiveShadow = true; scene.add(floor);
  const cove = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 420, 24, 1, true, Math.PI, Math.PI / 2), studioM); cove.rotation.z = Math.PI / 2; cove.position.set(130, 5, -20); cove.receiveShadow = true; scene.add(cove);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(420, 60), std(0xffffff, 0.9, 0, { map: wallT })); wall.position.set(130, 34, -25); wall.receiveShadow = true; scene.add(wall);
  // studio dressing between stations: light stands, softboxes, chrome beads, cyan floor rings
  const beads = [];
  X.forEach((x, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(7.2, 0.05, 8, 120), new THREE.MeshBasicMaterial({ color: P.cyan, toneMapped: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.03, 0.5); scene.add(ring);
    const sx = x + 18;
    cyl(0.07, 0.07, 11, 8, std(0x5a5d66, 0.5, 0.6), sx, 5.5, -9);
    const sb = box(3.2, 4.2, 0.4, std(0xffffff, 0.3, 0, { emissive: 0xffffff, emissiveIntensity: 0.6 }), sx, 11.5, -9); sb.rotation.y = 0.5;
    for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.45 + rnd() * 0.3, 24, 16), chrome); scene.add(b); beads.push({ b, x: x + (k - 1) * 6.5 + rnd() * 2, y: 7 + rnd() * 3, z: -6 - rnd() * 4, ph: rnd() * 6.28 }); }
  });

  // reusable pieces
  const leafM = new THREE.MeshPhysicalMaterial({ color: P.leaf, roughness: 0.3, clearcoat: 0.8, flatShading: true });
  const trunkM = std(P.trunk, 0.55);
  function tree(s, lm = leafM) {
    const G = new THREE.Group(); const cn = [];
    cyl(0.35 * s, 0.5 * s, 2.6 * s, 12, trunkM, 0, 1.3 * s, 0, G);
    [[0, 3.6, 0, 1.6], [-0.95, 3.0, 0.3, 1.1], [0.95, 3.1, -0.2, 1.15], [0.1, 4.6, 0.1, 1.0]].forEach(([x, y, z, rd]) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(rd * s, 1), lm); m.position.set(x * s, y * s, z * s); m.castShadow = true; G.add(m); cn.push(m); });
    return { G, cn };
  }
  function ghost(G, color) {
    const c = G.clone(true); const m = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.8, depthWrite: false, toneMapped: false });
    c.traverse((o) => { if (o.isMesh) { o.material = m; o.castShadow = false; } }); c.visible = false; return c;
  }
  function plate(w, d, x, z, lbl) {
    const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
    const studs = canvasTex(512, 512, (g, W, H) => { g.fillStyle = "#f7f7f9"; g.fillRect(0, 0, W, H); g.strokeStyle = "#dfe1e7"; g.lineWidth = 2; for (let i = 0; i <= 16; i++) { g.beginPath(); g.moveTo((i * W) / 16, 0); g.lineTo((i * W) / 16, H); g.stroke(); g.beginPath(); g.moveTo(0, (i * H) / 16); g.lineTo(W, (i * H) / 16); g.stroke(); } });
    const top = new THREE.MeshPhysicalMaterial({ map: studs, roughness: 0.3, clearcoat: 0.6 });
    const side = canvasTex(1024, 64, (g, W, H) => { g.fillStyle = "#eceef2"; g.fillRect(0, 0, W, H); if (lbl) { g.fillStyle = "#0b0c10"; g.font = `700 34px ${MONO}`; g.fillText(lbl, 24, 44); } g.fillStyle = "#00e5ff"; g.fillRect(0, H - 6, W, 6); });
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.5, d), [std(0xeceef2, 0.4), std(0xeceef2, 0.4), top, std(0xeceef2, 0.4), new THREE.MeshStandardMaterial({ map: side, roughness: 0.4 }), std(0xeceef2, 0.4)]);
    m.position.y = 0.25; m.castShadow = m.receiveShadow = true; G.add(m); return G;
  }
  const cubeTex = canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#0b0c10"; g.fillRect(0, 0, w, h); g.strokeStyle = "#fff"; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = "#fff"; g.font = `700 54px ${MONO}`; g.textAlign = "center"; g.fillText("</>", w / 2, 84); });
  const cubeG = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const scriptCube = (col) => { const m = new THREE.Mesh(cubeG, new THREE.MeshBasicMaterial({ map: cubeTex, color: col, toneMapped: false })); scene.add(m); return m; };

  // the hero
  const phys = (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.15 });
  const H = avatar({ skin: 0xf3e2c4, shirt: P.blue, pants: 0x2a2d36, make: phys }); scene.add(H.G);
  const hBlob = blob(3.6, 2.4, 0, 0, 0);

  // ---------- s1: the free tree drops into the map and something leaks out ----------
  const P1 = plate(11, 8, X[0], 0.5, "AUDIRA ASSET LAB  //  MAP KAMU");
  const T1 = tree(1.0); T1.G.position.set(X[0] + 2.0, 0.5, 0); scene.add(T1.G);
  const T1r = ghost(T1.G, P.red), T1c = ghost(T1.G, P.cyan); scene.add(T1r, T1c);
  const dragT = canvasTex(512, 96, (g, w, h) => { g.fillStyle = "rgba(11,12,16,.9)"; rr(g, 4, 8, w - 8, h - 16, 16); g.fill(); g.fillStyle = "#2bff88"; g.font = `700 40px ${MONO}`; g.fillText("+ Pohon (gratis)", 28, 62); });
  const dragL = screen(4.2, 0.79, dragT); scene.add(dragL);
  const tagMain = canvasTex(512, 128, (g, w, h) => { g.fillStyle = "#0b0c10"; rr(g, 4, 10, w - 8, h - 20, 20); g.fill(); g.fillStyle = "#ff1e56"; g.font = `700 52px ${MONO}`; g.fillText("<Script>", 28, 64); g.fillStyle = "#fff"; g.font = `700 40px ${MONO}`; g.fillText("virus?", 300, 64); g.fillStyle = "#8a8f9c"; g.font = `700 22px ${MONO}`; g.fillText("tersembunyi di dalam model", 28, 102); });
  const tagGhost = canvasTex(512, 128, (g, w, h) => { g.fillStyle = "#fff"; g.font = `700 52px ${MONO}`; g.fillText("<Script>", 28, 64); g.font = `700 40px ${MONO}`; g.fillText("virus?", 300, 64); });
  const tag = screen(5.2, 1.3, tagMain), tagR = screen(5.2, 1.3, tagGhost), tagC = screen(5.2, 1.3, tagGhost);
  tagR.material.color.set(P.red); tagC.material.color.set(P.cyan); tagR.material.opacity = tagC.material.opacity = 0.8; tagR.renderOrder = tagC.renderOrder = 2;
  scene.add(tag, tagR, tagC);

  // ---------- s2: wall of asset cards, one click into the map ----------
  const CW = 2.3, CH = 2.7, cards = [];
  for (let rI = 0; rI < 3; rI++) for (let c = 0; c < 4; c++) {
    const [kind, tg] = KINDS[(rI * 4 + c) % 5];
    const m = new THREE.Mesh(new THREE.BoxGeometry(CW, CH, 0.12), [inkM, inkM, inkM, inkM, new THREE.MeshBasicMaterial({ map: cardTex(kind, tg, false), toneMapped: false }), inkM]);
    m.castShadow = true; scene.add(m); cards.push({ m, x: X[1] + (c - 1.5) * 2.65, y: 4.6 + (2 - rI) * 3.0, kind, d: Math.hypot(c - 1.5, rI - 1) });
  }
  const NT = 640, tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(1.1, 1.3, 0.06), std(0xdcdee5, 0.5), NT); tiles.frustumCulled = false; scene.add(tiles);
  const tilePos = [];
  for (let i = 0; tilePos.length < NT && i < 5000; i++) { const x = (rnd() - 0.5) * 70, y = 1 + rnd() * 26; if (Math.abs(x) < 6.2 && y > 2.5 && y < 12.8) continue; tilePos.push([X[1] + x, y, -19.5 - rnd() * 1.5, Math.hypot(x, y - 8) / 30]); }
  const P2 = plate(6, 5, X[1] + 2.4, 5.5, "");
  const house = new THREE.Group(); scene.add(house);
  box(2.4, 1.8, 2.0, pearl(), 0, 0.9, 0, house); const roof = new THREE.Mesh(new THREE.ConeGeometry(1.95, 1.3, 4), std(P.red, 0.35)); roof.rotation.y = Math.PI / 4; roof.position.y = 2.45; roof.castShadow = true; house.add(roof); box(0.6, 1.0, 0.05, inkM, 0, 0.5, 1.02, house);
  const arrowShape = new THREE.Shape(); [[0, 0], [0, -1.6], [0.42, -1.2], [0.7, -1.85], [0.95, -1.75], [0.68, -1.1], [1.2, -1.1]].forEach(([x, y], i) => (i ? arrowShape.lineTo(x, y) : arrowShape.moveTo(x, y)));
  const cursor = new THREE.Mesh(new THREE.ShapeGeometry(arrowShape), new THREE.MeshBasicMaterial({ color: P.ink, toneMapped: false })); scene.add(cursor);

  // ---------- s3: x-ray tree, scripts inside, one cable reaches outside ----------
  const xM = new THREE.MeshPhysicalMaterial({ color: 0xbfe9d0, transparent: true, opacity: 0.22, roughness: 0.2, depthWrite: false });
  const T3 = tree(1.55, xM); T3.G.position.set(X[2] - 0.6, 0, 0); scene.add(T3.G);
  const edgeM = new THREE.LineBasicMaterial({ color: 0x0e9f5a, transparent: true, opacity: 0.7 });
  T3.cn.forEach((m) => { const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), edgeM); e.position.copy(m.position); T3.G.add(e); });
  const nA = scriptCube(0xffffff), nB = scriptCube(0x9aa0ab);
  nA.position.set(X[2] - 1.5, 5.0, 0.5); nB.position.set(X[2] + 0.4, 6.2, 0.3);
  const doorG = new THREE.Group(); doorG.position.set(X[2] - 5.2, 0, 2.0); scene.add(doorG);
  box(0.3, 3.4, 0.3, inkM, -0.95, 1.7, 0, doorG); box(0.3, 3.4, 0.3, inkM, 0.95, 1.7, 0, doorG); box(2.2, 0.3, 0.3, inkM, 0, 3.4, 0, doorG);
  const hinge = new THREE.Group(); hinge.position.set(-0.8, 0, 0); doorG.add(hinge); box(1.6, 3.1, 0.12, pearl(), 0.8, 1.6, 0, hinge);
  const spk = new THREE.Group(); spk.position.set(X[2] - 5.2, 4.4, 2.0); scene.add(spk);
  box(1.0, 1.0, 0.7, inkM, 0, 0, 0, spk); const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.2, 0.2, 20), chrome); cone.rotation.x = Math.PI / 2; cone.position.z = 0.4; spk.add(cone);
  const rings = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.04, 6, 40), new THREE.MeshBasicMaterial({ color: 0x0e9f5a, transparent: true, toneMapped: false })); m.position.z = 0.5; spk.add(m); return m; });
  const ext = new THREE.Group(); ext.position.set(X[2] + 4.0, 8.6, -4); scene.add(ext);
  const qT = canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#0b0c10"; g.fillRect(0, 0, w, h); g.fillStyle = "#ff1e56"; g.font = `700 92px ${MONO}`; g.textAlign = "center"; g.fillText("?", w / 2, 96); });
  const extBox = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), new THREE.MeshBasicMaterial({ map: qT, toneMapped: false })); ext.add(extBox);
  const extG1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), new THREE.MeshBasicMaterial({ color: P.red, wireframe: true, toneMapped: false })), extG2 = extG1.clone(); extG2.material = new THREE.MeshBasicMaterial({ color: P.cyan, wireframe: true, toneMapped: false }); ext.add(extG1, extG2);
  const extLbl = canvasTex(512, 96, (g, w) => { g.fillStyle = "#ff1e56"; g.font = `700 44px ${MONO}`; g.textAlign = "center"; g.fillText("ASET LUAR", w / 2, 60); });
  const extL = screen(3.2, 0.6, extLbl); extL.position.set(0, -1.6, 0); ext.add(extL);
  const tube = (pts, col, rad = 0.07) => { const cv = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))); const m = new THREE.Mesh(new THREE.TubeGeometry(cv, 80, rad, 6), new THREE.MeshBasicMaterial({ color: col, toneMapped: false })); m.geometry.setDrawRange(0, 0); scene.add(m); return { m, cv, n: m.geometry.index.count }; };
  const cDoor = tube([[X[2] - 1.5, 5.0, 0.5], [X[2] - 3.4, 4.6, 1.4], [X[2] - 5.2, 3.6, 2.0]], 0x0e9f5a);
  const cSpk = tube([[X[2] - 1.5, 5.0, 0.5], [X[2] - 3.4, 5.4, 1.4], [X[2] - 5.2, 4.9, 2.0]], 0x0e9f5a);
  const cExt = tube([[X[2] + 0.4, 6.2, 0.3], [X[2] + 2.6, 8.4, -0.5], [X[2] + 3.2, 9.6, -2.4], [X[2] + 4.0, 8.6, -4]], P.red, 0.09);
  const pulses = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), new THREE.MeshBasicMaterial({ color: P.red, toneMapped: false })); scene.add(m); return m; });

  // ---------- s4: Creator Store rules board ----------
  const B4 = dyn(720, 860); const board = screen(7.2, 8.6, B4.tex); board.position.set(X[3] + 0.6, 5.0, 0); scene.add(board);
  box(7.5, 8.9, 0.3, inkM, X[3] + 0.6, 5.0, -0.2); cyl(0.12, 0.12, 0.8, 8, chrome, X[3] + 0.6, 0.4, -0.2);
  const stampT = canvasTex(512, 256, (g, w, h) => { g.strokeStyle = "#ff1e56"; g.lineWidth = 14; rr(g, 12, 12, w - 24, h - 24, 26); g.stroke(); g.fillStyle = "#ff1e56"; g.textAlign = "center"; g.font = `900 46px ${SANS}`; g.fillText("CREATOR STORE", w / 2, 104); g.font = `900 70px ${SANS}`; g.fillText("DILARANG", w / 2, 186); });
  const stamp = screen(4.4, 2.2, stampT); scene.add(stamp);

  // ---------- s5: scrambled code vs clean code ----------
  const B5a = dyn(560, 700), B5b = dyn(560, 700);
  const slabA = screen(5.0, 6.25, B5a.tex), slabB = screen(5.0, 6.25, B5b.tex);
  const sA = new THREE.Group(), sB = new THREE.Group(); sA.position.set(X[4] - 2.6, 7.6, -0.5); sB.position.set(X[4] + 2.6, 7.6, -0.5); sA.scale.setScalar(0.86); sA.rotation.y = 0.28; sB.rotation.y = -0.28; scene.add(sA, sB);
  sA.add(slabA); sB.add(slabB); box(5.3, 6.55, 0.25, inkM, 0, 0, -0.15, sA); box(5.3, 6.55, 0.25, std(0xd9dde6, 0.3, 0.3), 0, 0, -0.15, sB);

  // ---------- s6: asset info card + suspicious tree ----------
  const B6 = dyn(640, 860); const info = screen(6.0, 8.06, B6.tex); info.position.set(X[5] + 1.6, 6.0, -0.4); info.rotation.y = -0.12; scene.add(info);
  const infoBk = box(6.3, 8.36, 0.2, inkM, X[5] + 1.6, 6.0, -0.6); infoBk.rotation.y = -0.12;
  const T6 = tree(0.45); T6.G.position.set(X[5] - 1.6, 1.0, 4.4); scene.add(T6.G); cyl(1.0, 1.1, 1.0, 40, pearl(), X[5] - 1.6, 0.5, 4.4);
  const swarm = Array.from({ length: 14 }, (_, i) => ({ m: scriptCube(0xff1e56), a: (i / 14) * 6.283, rad: 1.6 + (i % 3) * 0.45, y: 2.2 + (i % 4) * 0.55, sp: 0.9 + (i % 5) * 0.12 }));
  swarm.forEach((s) => s.m.scale.setScalar(0.5));

  // ---------- s7: drawn Explorer with context menu + Toolbox filter ----------
  const B7 = dyn(640, 820); const expl = screen(6.0, 7.7, B7.tex); expl.position.set(X[6] + 0.4, 5.0, -0.4); scene.add(expl); box(6.3, 8.0, 0.2, inkM, X[6] + 0.4, 5.0, -0.6);
  const B7t = dyn(640, 640); const tbox = screen(6.0, 6.0, B7t.tex); tbox.position.set(X[6] + 10.5, 4.4, -0.4); scene.add(tbox); box(6.3, 6.3, 0.2, inkM, X[6] + 10.5, 4.4, -0.6);
  const T7 = tree(0.55); T7.G.position.set(X[6] + 3.6, 0, 3.0); scene.add(T7.G);
  const c7 = [0, 1, 2].map((i) => ({ m: scriptCube(0xff1e56), a: i * 2.09 })); c7.forEach((c) => c.m.scale.setScalar(0.45));

  // ---------- s8: the checked tree goes into the map ----------
  const P8 = plate(11, 8, X[7], 0.5, "AUDIRA ASSET LAB  //  DICEK");
  const part = new THREE.Group(); part.position.set(X[7], 0, -4.6); scene.add(part);
  box(15, 10, 0.6, std(0xf4f5f8, 0.7), 0, 5.0, 0, part);
  const signT = canvasTex(1024, 160, (g, w, h) => { g.fillStyle = "#0b0c10"; g.fillRect(0, 0, w, h); g.fillStyle = "#2bff88"; g.fillRect(0, 0, 18, h); g.fillStyle = "#fff"; g.font = `900 92px ${SANS}`; g.fillText("AUDIRA", 60, 112); g.fillStyle = "#c9cbd3"; g.font = `700 50px ${MONO}`; g.fillText("ASSET LAB", 470, 108); });
  const sign = screen(9.6, 1.5, signT); sign.position.set(-0.4, 8.3, 0.32); part.add(sign);
  const T8 = tree(1.0); scene.add(T8.G);
  const house8 = house.clone(true); house8.position.set(X[7] - 3.4, 0.5, -1.5); house8.scale.setScalar(0.8); scene.add(house8);
  const okT = canvasTex(512, 96, (g, w, h) => { g.fillStyle = "#0e9f5a"; rr(g, 4, 8, w - 8, h - 16, 18); g.fill(); g.fillStyle = "#fff"; g.font = `700 44px ${MONO}`; g.fillText("✓ script dicek", 36, 62); });
  const okL = screen(3.8, 0.71, okT); scene.add(okL);

  blob(3.6, 3.0, X[0] + 2.0, 0.52, 0); blob(14, 11, X[0], 0.02, 0.5); blob(14, 11, X[7], 0.02, 0.5); blob(8, 7, X[1] + 2.4, 0.02, 5.5);
  blob(5, 4, X[2] - 0.6, 0.02, 0); blob(3.4, 2, X[2] - 5.2, 0.02, 2.0); blob(9, 2.4, X[3] + 0.6, 0.02, 0.2); blob(3.2, 3.2, X[5] - 1.6, 0.02, 4.4);
  blob(8, 2, X[5] + 1.6, 0.02, -0.3); blob(8, 2, X[6] + 0.4, 0.02, -0.3); blob(8, 2, X[6] + 10.5, 0.02, -0.3); blob(2.8, 2.6, X[6] + 3.6, 0.02, 3.0); blob(17, 3, X[7], 0.02, -4.2);
  const t8Blob = blob(3.6, 3.0, X[7] + 2.4, 0.52, 0.2);
  // ---------- camera: px py pz lx ly lz ----------
  const st = (x, cx, cy, cz, lx, ly, lz) => [x + cx, cy, cz, x + lx, ly, lz];
  const c0 = track([
    [0, ...st(X[0], -1.2, 7.7, 34.1, 0.2, 4.5, 0)], [AT["s1:virus"], ...st(X[0], 0.6, 7.0, 30.5, 0.8, 4.8, 0)], [K.s1e - 0.3, ...st(X[0], 1.2, 7.3, 29.8, 0.9, 4.9, 0)],
    [K.s2 + 0.25, ...st(X[1], -1.5, 9.8, 38.3, 0, 7.3, 0)], [AT["s2:klik"], ...st(X[1], 0.4, 9.3, 36.9, 0.6, 6.9, 0)], [K.s2e - 0.3, ...st(X[1], 1.6, 8.4, 34.1, 1.2, 6.1, 1)],
    [K.s3 + 0.25, ...st(X[2], -1.0, 8.1, 36.9, -0.6, 6.1, 0)], [AT["s3:menunggu"], ...st(X[2], 0.8, 8.4, 35.5, 0, 6.5, 0)], [K.s3e - 0.3, ...st(X[2], 2.0, 9.1, 36.9, 0.8, 6.9, -1)],
    [K.s4 + 0.25, ...st(X[3], -1.4, 7.0, 31.2, 0, 5.3, 0)], [K.s4e - 0.3, ...st(X[3], 1.0, 6.6, 29.1, 0.3, 5.3, 0)],
    [K.s5 + 0.25, ...st(X[4], 0.0, 7.7, 31.2, 0, 6.3, 0)], [AT["s5:Kode"], ...st(X[4], -0.8, 7.5, 29.8, -0.6, 6.3, 0)], [K.s5e - 0.3, ...st(X[4], 0.8, 7.3, 29.8, 0.6, 6.3, 0)],
    [K.s6 + 0.25, ...st(X[5], -1.0, 7.3, 31.2, -0.6, 5.6, 0)], [K.s6e - 0.3, ...st(X[5], 0.8, 6.8, 29.8, -0.6, 5.6, 0)],
    [K.s7 + 0.25, ...st(X[6], -1.0, 7.0, 30.5, 0.6, 5.3, 0)], [AT["s7:Scripts"] + 1.4, ...st(X[6], 0.6, 6.8, 29.8, 1.6, 5.2, 0)], [AT["s7:Kamu"] + 0.4, ...st(X[6], 8.8, 6.8, 29.8, 8.6, 4.9, 0)], [K.s7e - 0.3, ...st(X[6], 9.6, 6.6, 28.4, 9.2, 4.9, 0)],
    [K.s8 + 0.25, ...st(X[7], 1.2, 7.5, 32.7, 0.4, 5.1, 0)], [K.end, ...st(X[7], -1.0, 8.0, 35.5, -0.2, 5.1, 0)], [K.dur, ...st(X[7], -1.4, 8.2, 36.9, -0.2, 5.1, 0)],
  ]);

  // ---------- avatar spots per scene: x, z, rotY ----------
  const spots = [[X[0] - 2.8, 0.6, 0.45], [X[1] - 3.4, 4.2, 0.5], [X[2] + 3.6, 2.6, -0.5], [X[3] - 3.6, 2.8, 0.4], [X[4], 2.4, 0], [X[5] - 4.6, 2.4, 0.5], [X[6] - 3.6, 2.6, 0.45], [X[7] - 0.6, 0.6, 0]];
  const sk = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"];
  const dummy = new THREE.Object3D(), tmp = new THREE.Vector3();
  const grey = new THREE.Color(0x8d929c), redC = new THREE.Color(P.red), wht = new THREE.Color(0xffffff), grnC = new THREE.Color(0x2bff88);

  return (t) => {
    const g = gstate(t, K, AT);
    const u = gp.uniforms; u.uSeed.value = g.seed; u.uSplit.value = g.split; u.uTear.value = g.tear; u.uBlock.value = g.block; u.uMosh.value = g.mosh; u.uSort.value = g.sort; u.uLost.value = g.lost;
    const st12 = Math.floor(t * 12), jit = (k) => { const v = Math.sin((st12 + k) * 91.7) * 43758.5; return v - Math.floor(v) - 0.5; };
    const p = c0(t); cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]);
    key.position.set(p[3] + 18, 22, p[5] + 12); key.target.position.set(p[3], 0, p[5]);
    cyanL.position.set(p[3] - 20, 8, p[5] - 10); cyanL.target.position.set(p[3], 3, p[5]); redL.position.set(p[3] + 20, 6, p[5] - 10); redL.target.position.set(p[3], 3, p[5]);
    beads.forEach((b) => b.b.position.set(b.x + Math.sin(t * 0.4 + b.ph) * 0.6, b.y + Math.sin(t * 0.7 + b.ph) * 0.5, b.z));

    // ---- avatar: walks between stations during the glitch cuts ----
    let si = 0; for (let i = 0; i < 8; i++) if (t >= K[sk[i]] - 0.2) si = i;
    let ax = spots[si][0], az = spots[si][1], ry = spots[si][2], moving = false;
    if (si > 0) { const k = ramp(t, K[sk[si]] - 0.2, K[sk[si]] + 0.7); if (k < 1) { const a = spots[si - 1]; ax = a[0] + (ax - a[0]) * k; az = a[1] + (az - a[1]) * k; ry = k < 0.85 ? Math.PI / 2 : spots[si][2]; moving = true; } }
    let ay = 0; if (si === 0 || si === 7) ay = 0.5;
    restPose(H); H.head.rotation.set(0, 0, 0);
    if (moving) runPose(H, t * 12);
    else if (si === 0) {
      if (t < AT["s1:berguna"]) { H.armL.rotation.x = H.armR.rotation.x = -2.3 + Math.sin(t * 3) * 0.1; }
      if (t >= AT["s1:virus"]) { const k = ramp(t, AT["s1:virus"], AT["s1:virus"] + 0.3); ax -= 0.8 * k; H.armL.rotation.z = -2.2 * k; H.armR.rotation.z = 2.2 * k; ry = 0.45 + 0.3 * k; }
    } else if (si === 1) {
      H.head.rotation.y = 0.2; const k = ramp(t, AT["s2:klik"] - 0.3, AT["s2:klik"]) * (1 - ramp(t, AT["s2:map"], AT["s2:map"] + 0.4)); H.armR.rotation.x = -2.4 * k;
      if (t > AT["s2:Banyak"]) { ry = 0; H.armR.rotation.z = (2.4 + Math.sin(t * 8) * 0.3) * ramp(t, AT["s2:Banyak"], AT["s2:Banyak"] + 0.3) * (1 - ramp(t, K.s2e - 0.5, K.s2e - 0.2)); }
    } else if (si === 2) {
      H.head.rotation.y = -0.3; if (t > AT["s3:memanggil"]) { const k = ramp(t, AT["s3:memanggil"], AT["s3:memanggil"] + 0.3); H.armL.rotation.z = -2.0 * k; H.armR.rotation.z = 2.0 * k; ax += 0.5 * k; H.head.rotation.x = -0.4 * k; }
    } else if (si === 3) {
      H.head.rotation.x = -0.12; if (t > AT["s4:diacak"] && t < AT["s4:diacak"] + 1.4) H.head.rotation.y = Math.sin((t - AT["s4:diacak"]) * 14) * 0.45;
      if (t > AT["s4:require"] && t < AT["s4:Kode"]) H.armR.rotation.x = -1.6;
    } else if (si === 4) {
      const look = t < AT["s5:Kode"] ? -0.7 : 0.7; H.head.rotation.y = look * ramp(t, K.s5 + 0.4, K.s5 + 0.8);
      if (t > AT["s5:dipercaya"]) H.armR.rotation.z = 2.4 + Math.sin(t * 7) * 0.3;
    } else if (si === 5) {
      if (t > AT["s6:segitiga"] && t < AT["s6:banyak"]) { H.armR.rotation.x = -1.5; H.armR.rotation.z = 0.25; }
      if (t > AT["s6:banyak"]) { const k = ramp(t, AT["s6:banyak"], AT["s6:banyak"] + 0.3); H.armL.rotation.z = -2.2 * k; H.armR.rotation.z = 2.2 * k; ry = 0.5 - 0.6 * k; }
    } else if (si === 6) {
      if (t > AT["s7:Klik"] && t < AT["s7:Modelnya"]) { H.armR.rotation.x = -1.6; H.armR.rotation.z = 0.2; }
      if (t > AT["s7:Kamu"]) { ax += 8.2 * ramp(t, AT["s7:Kamu"], AT["s7:Kamu"] + 1.2); if (t < AT["s7:Kamu"] + 1.2) runPose(H, t * 12); else H.armR.rotation.x = -1.4; }
    } else if (si === 7) {
      const drop = AT["s8:dicek"];
      if (t < drop) { H.armL.rotation.x = H.armR.rotation.x = -3.0; }
      if (t > AT["s8:Kamu"]) { H.armR.rotation.z = 2.6 + Math.sin(t * 7) * 0.4; }
    }
    H.G.position.set(ax, ay, az); H.G.rotation.y = ry; hBlob.position.set(ax, ay + 0.02, az); hBlob.scale.setScalar(moving ? 0.8 : 1);

    // ---- s1 ----
    const land = AT["s1:berguna"], vir = AT["s1:virus"];
    const fall = 1 - eout(clamp01(t / land));
    T1.G.position.set(X[0] + 2.0, 0.5 + fall * 2.6 + (t > land && t < land + 0.35 ? Math.sin((t - land) / 0.35 * Math.PI) * 0.35 : 0), 0);
    T1.G.rotation.z = fall * 0.12;
    dragL.visible = t < land + 0.4; dragL.position.set(X[0] + 2.4, 2.2 + fall * 2.6, 1.8);
    const flick = t > AT["s1:Tapi"] && t < K.s1e && g.hud > 0.25;
    T1r.visible = T1c.visible = flick; if (flick) { T1r.position.copy(T1.G.position).x += 0.35 * g.split + 0.2; T1c.position.copy(T1.G.position).x -= 0.35 * g.split + 0.2; T1r.rotation.copy(T1.G.rotation); T1c.rotation.copy(T1.G.rotation); }
    const tg = Math.max(0.78 * ramp(t, AT["s1:Tapi"] - 0.1, AT["s1:Tapi"] + 0.3), ramp(t, vir - 0.15, vir + 0.35));
    tag.visible = tagR.visible = tagC.visible = tg > 0 && t < K.s2;
    tag.position.set(X[0] + 2.0 + tg * 0.4, 3.8 + tg * 2.6, 1.6); tag.scale.setScalar(0.4 + 0.6 * back(tg, 2));
    const sp = 0.12 + g.split * 0.35;
    tagR.position.copy(tag.position).add(tmp.set(sp + jit(1) * 0.1, jit(2) * 0.08, 0.02)); tagC.position.copy(tag.position).add(tmp.set(-sp + jit(3) * 0.1, jit(4) * 0.08, 0.02)); tagR.scale.copy(tag.scale); tagC.scale.copy(tag.scale);

    // ---- s2 ----
    const jt = AT["s2:jutaan"], kl = AT["s2:klik"], ms = AT["s2:masuk"];
    cards.forEach((c, i) => {
      const k = back(clamp01((t - K.s2 + 0.1 - c.d * 0.12) / 0.4), 1.8);
      const isHouse = c.kind === "house" && i === 2;
      const pulse = isHouse ? Math.max(0, 1 - Math.abs(t - kl) / 0.25) * 0.15 : 0;
      c.m.position.set(c.x, c.y, -3 + (1 - k) * -2); c.m.scale.setScalar(Math.max(0.001, k) * (1 + pulse)); c.m.rotation.y = Math.sin(t * 0.6 + i) * 0.04;
      c.m.visible = t > K.s2 - 0.5 && t < K.s3 + 0.2;
    });
    tilePos.forEach(([x, y, z, d], i) => { const k = clamp01((t - jt - d * 1.4) / 0.3); dummy.position.set(x, y, z); dummy.scale.setScalar(k > 0 && t < K.s3 + 0.5 ? back(k, 2) : 0.0001); dummy.updateMatrix(); tiles.setMatrixAt(i, dummy.matrix); });
    tiles.instanceMatrix.needsUpdate = true;
    const hc = cards[2]; const fly = ramp(t, kl + 0.15, ms + 0.3);
    const from = [hc.x, hc.y, -2.6], to = [X[1] + 2.4, 0.5, 5.5];
    house.visible = t > kl + 0.15 && t < K.s3 + 0.3;
    house.position.set(from[0] + (to[0] - from[0]) * fly, from[1] + (to[1] - from[1]) * fly + Math.sin(fly * Math.PI) * 2.5, from[2] + (to[2] - from[2]) * fly);
    house.scale.setScalar(0.35 + 0.65 * fly); house.rotation.y = (1 - fly) * 2.5 - 0.3;
    const cu = ramp(t, AT["s2:Tinggal"], kl);
    cursor.visible = t > K.s2 + 0.6 && t < ms + 0.6;
    cursor.position.set(X[1] + 4.5 + (hc.x - X[1] - 4.5) * cu + 0.2, 1.5 + (hc.y - 1.5) * cu - 0.1, -2.0); cursor.scale.setScalar(t > kl && t < kl + 0.15 ? 0.85 : 1);

    // ---- s3 ----
    const mv = AT["s3:bergerak"], sd = AT["s3:suara"], call = AT["s3:memanggil"], lu = AT["s3:luar"];
    const draw = (c, k) => c.m.geometry.setDrawRange(0, Math.floor(c.n * clamp01(k) / 6) * 6);
    draw(cDoor, ramp(t, AT["s3:wajar"], mv)); draw(cSpk, ramp(t, AT["s3:memutar"] - 0.3, sd)); draw(cExt, ramp(t, call, lu));
    hinge.rotation.y = -1.25 * ramp(t, mv, mv + 0.5) * (1 - ramp(t, mv + 2.2, mv + 2.7));
    rings.forEach((m, i) => { const ph = ((t - sd) / 0.8 + i / 3) % 1; m.visible = t > sd && t < K.s3e; m.scale.setScalar(1 + ph * 1.6); m.material.opacity = 1 - ph; });
    nA.material.color.copy(t > AT["s3:wajar"] ? grnC : wht); nA.rotation.set(t * 0.5, t * 0.7, 0);
    const wake = ramp(t, AT["s3:menunggu"], AT["s3:menunggu"] + 0.6);
    nB.material.color.copy(grey).lerp(redC, wake); nB.rotation.set(0, t * (0.3 + wake * 2), 0); nB.scale.setScalar(1 + (t > AT["s3:menunggu"] ? Math.abs(Math.sin(t * 6)) * 0.15 : 0));
    nB.position.x = X[2] + 0.4 + (g.hud > 0.3 ? jit(5) * 0.3 : 0);
    const ek = back(ramp(t, AT["s3:aset"] - 0.6, AT["s3:aset"]), 2);
    ext.visible = ek > 0.01 && t < K.s4 + 0.2; ext.scale.setScalar(Math.max(0.01, ek)); ext.rotation.set(t * 0.4, t * 0.6, 0);
    extG1.position.x = 0.25 + g.split * 0.6; extG2.position.x = -0.25 - g.split * 0.6;
    pulses.forEach((m, i) => { const ph = (t - lu) / 0.9 - i * 0.25; m.visible = ph > 0 && ph < 1 && t < K.s3e + 0.1; if (m.visible) m.position.copy(cExt.cv.getPoint(1 - ph)); });
    const infect = ramp(t, lu, lu + 0.6);
    edgeM.color.set(0x0e9f5a).lerp(redC, infect);

    // ---- s4 ----
    const scr = Math.floor(t * 12);
    const rq = AT["s4:require"], ls = AT["s4:loadstring"], da = AT["s4:diacak"], lg = AT["s4:larangan"];
    const rows = [["require(assetId)", "memuat aset dari jauh", rq], ["loadstring( ... )", "menjalankan kode dari teks", ls], ["kode diacak", null, da]];
    const vis = rows.map((rw) => (t > rw[2] - 0.2 ? 1 : 0));
    const rk = vis.join("") + (t > da ? scr % 997 : "s") + (t > lg ? 1 : 0) + (t > AT["s4:jauh"] ? "j" : "");
    if (t > K.s4 - 1 && t < K.s5 + 1) B4.paint(rk, (c, w, h) => {
      c.fillStyle = "#ffffff"; c.fillRect(0, 0, w, h);
      c.fillStyle = "#0b0c10"; c.fillRect(0, 0, w, 92); c.fillStyle = "#2bff88"; c.fillRect(0, 0, 14, 92);
      c.fillStyle = "#fff"; c.font = `700 40px ${MONO}`; c.fillText("CREATOR STORE", 40, 60);
      c.fillStyle = "#0b0c10"; c.font = `900 84px ${SANS}`; c.fillText("ATURAN ASET", 40, 196);
      c.fillStyle = "#ff1e56"; c.fillRect(40, 220, 220, 10);
      rows.forEach(([code, sub, ta], i) => {
        if (!vis[i]) return; const y = 300 + i * 180;
        c.fillStyle = "#f1f2f5"; c.fillRect(40, y, w - 80, 150);
        const txt = i === 2 && t > da ? scramble(14, scr + 3) : code;
        c.fillStyle = "#0b0c10"; c.font = `700 46px ${MONO}`; c.fillText(txt, 70, y + 70);
        c.fillStyle = "#5a5d66"; c.font = `600 30px ${SANS}`; c.fillText(sub || "supaya tidak terbaca", 70, y + 122);
        c.strokeStyle = "#ff1e56"; c.lineWidth = 12; c.lineCap = "round"; c.beginPath(); c.moveTo(w - 120, y + 40); c.lineTo(w - 70, y + 110); c.moveTo(w - 70, y + 40); c.lineTo(w - 120, y + 110); c.stroke();
      });
    });
    const sk4 = clamp01((t - lg) / 0.2);
    stamp.visible = t > lg && t < K.s5 + 0.3; stamp.position.set(X[3] + 2.4, 1.6, 0.4); stamp.rotation.z = -0.18; stamp.scale.setScalar(1 + (1 - sk4) * 0.9); stamp.material.opacity = sk4;

    // ---- s5 ----
    const s5on = t > K.s5 - 1 && t < K.s6 + 1, kd = AT["s5:Kode"];
    if (s5on) {
      B5a.paint("a" + (scr % 997) + (t > AT["s5:memastikan"] ? 1 : 0), (c, w, h) => {
        c.fillStyle = "#0b0c10"; c.fillRect(0, 0, w, h); c.font = `700 30px ${MONO}`;
        for (let i = 0; i < 13; i++) { const n = 8 + ((i * 7 + 3) % 15); c.fillStyle = i % 4 === 1 ? "#ff1e56" : i % 3 === 0 ? "#00e5ff" : "#c9cbd3"; c.fillText(scramble(n, scr * 13 + i), 30 + (i % 3) * 18, 70 + i * 44); }
        if (t > AT["s5:memastikan"]) { c.fillStyle = "#ff1e56"; c.fillRect(0, h - 120, w, 120); c.fillStyle = "#fff"; c.font = `900 40px ${SANS}`; c.fillText("TIDAK BISA", 30, h - 70); c.fillText("DIPASTIKAN", 30, h - 26); }
      });
      const okK = t > AT["s5:rapi"] ? 1 : 0, lines = Math.floor(clamp01((t - kd) / 1.4) * 7);
      B5b.paint("b" + lines + okK, (c, w, h) => {
        c.fillStyle = "#ffffff"; c.fillRect(0, 0, w, h); c.font = `700 25px ${MONO}`;
        const L = [["-- Pintu sederhana", "#0e9f5a"], ["local pintu = script.Parent", "#0b0c10"], ["local buka = false", "#0b0c10"], ["", ""], ["pintu.Touched:Connect(function()", "#1e6bff"], ["  buka = not buka", "#0b0c10"], ["  pintu.CanCollide = not buka", "#0b0c10"], ["end)", "#1e6bff"]];
        L.slice(0, lines + 1).forEach(([s, col], i) => { c.fillStyle = col; c.fillText(s, 26, 70 + i * 48); });
        if (okK) { c.fillStyle = "#0e9f5a"; c.fillRect(0, h - 120, w, 120); c.fillStyle = "#fff"; c.font = `900 40px ${SANS}`; c.fillText("✓ RAPI & TERBUKA", 30, h - 70); c.font = `700 30px ${SANS}`; c.fillText("mudah dipercaya", 30, h - 28); }
      });
    }
    sB.visible = t > kd - 0.3; sB.scale.setScalar(0.86 * (back(ramp(t, kd - 0.3, kd + 0.2), 1.8) || 0.001));
    sA.position.x = X[4] - 2.6 + (g.hud > 0.2 && t < kd ? jit(7) * 0.4 : 0);

    // ---- s6 ----
    const s6 = { a: AT["s6:segitiga"], b: AT["s6:vertex"], c: AT["s6:script"], d: AT["s6:banyak"] };
    if (t > K.s6 - 1 && t < K.s7 + 1) {
      const f = (a) => Math.round(clamp01((t - a) / 0.6) * 20) / 20;
      const fa = f(s6.a), fb = f(s6.b), fc = f(s6.c), bad = t > s6.d ? 1 : 0;
      B6.paint([fa, fb, fc, bad, bad ? scr % 2 : 0].join(), (c, w, h) => {
        c.fillStyle = "#fff"; c.fillRect(0, 0, w, h);
        c.fillStyle = "#0b0c10"; c.fillRect(0, 0, w, 84); c.fillStyle = "#00e5ff"; c.fillRect(0, 0, 14, 84); c.fillStyle = "#fff"; c.font = `700 36px ${MONO}`; c.fillText("HALAMAN ASET", 36, 56);
        c.fillStyle = "#eef0f4"; c.fillRect(36, 112, 230, 230); icon(c, "tree", 151, 228, 2.4);
        c.fillStyle = "#0b0c10"; c.font = `900 48px ${SANS}`; c.fillText("Pohon", 292, 176); c.fillStyle = "#5a5d66"; c.font = `600 30px ${SANS}`; c.fillText("free model", 292, 222);
        c.fillStyle = "#0e9f5a"; rr(c, 292, 252, 130, 40, 10); c.fill(); c.fillStyle = "#fff"; c.font = `700 24px ${MONO}`; c.fillText("GRATIS", 306, 280);
        [["SEGITIGA", fa, 0.42, "#1e6bff"], ["VERTEX", fb, 0.5, "#1e6bff"], ["SCRIPT", fc, 0.94, bad ? "#ff1e56" : "#1e6bff"]].forEach(([lb, k, full, col], i) => {
          const y = 400 + i * 130; c.fillStyle = "#0b0c10"; c.font = `700 36px ${MONO}`; c.fillText(lb, 36, y);
          c.fillStyle = "#eef0f4"; c.fillRect(36, y + 22, w - 72, 46); c.fillStyle = col; c.fillRect(36, y + 22, (w - 72) * full * k, 46);
        });
        if (bad) { c.fillStyle = "#ff1e56"; c.fillRect(36, 760, w - 72, 70); c.fillStyle = "#fff"; c.font = `900 40px ${SANS}`; c.fillText("SCRIPT: BANYAK  ⚠", 60 + (scr % 2) * 4, 808); }
      });
    }
    swarm.forEach((s, i) => {
      const k = back(clamp01((t - s6.d - i * 0.04) / 0.4), 2); s.m.visible = k > 0.01 && t < K.s7 + 0.3;
      const a = s.a + t * s.sp; s.m.position.set(X[5] - 1.6 + Math.cos(a) * s.rad * 0.8 * k, 0.6 + s.y * k + Math.sin(t * 2 + i) * 0.15, 4.4 + Math.sin(a) * s.rad * 0.8 * k); s.m.rotation.set(t, t * 1.3, 0); s.m.scale.setScalar(0.5 * Math.max(0.01, k));
    });

    // ---- s7 ----
    const kn = AT["s7:kanan"], ds = AT["s7:Disable"], sc = AT["s7:Scripts"], fy = AT["s7:menyaring"];
    if (t > K.s7 - 1 && t < K.s8 + 1) {
      const menu = t > kn && t < sc + 0.15 ? 1 : 0, hi = t > ds ? 1 : 0, off = t > sc ? 1 : 0, sel = t > AT["s7:modelnya"] ? 1 : 0;
      B7.paint([menu, hi, off, sel].join(), (c, w, h) => {
        c.fillStyle = "#fbfbfc"; c.fillRect(0, 0, w, h);
        c.fillStyle = "#0b0c10"; c.fillRect(0, 0, w, 80); c.fillStyle = "#fff"; c.font = `700 36px ${MONO}`; c.fillText("EXPLORER", 30, 52);
        const R = [["Workspace", 0, "#0b0c10"], ["Baseplate", 1, "#0b0c10"], ["PohonGratis", 1, "#0b0c10"], ["Batang", 2, "#5a5d66"], ["Daun", 2, "#5a5d66"], ["Script", 2, "s"], ["Script", 2, "s"], ["Script", 2, "s"]];
        R.forEach(([n, ind, col], i) => {
          const y = 140 + i * 72;
          if (i === 2 && sel) { c.fillStyle = "#d6e4ff"; c.fillRect(10, y - 46, w - 20, 64); }
          const x = 34 + ind * 44;
          if (col === "s") { c.fillStyle = off ? "#b8bcc6" : "#ff1e56"; c.fillRect(x, y - 30, 30, 30); c.fillStyle = off ? "#9aa0ab" : "#0b0c10"; c.font = `700 34px ${MONO}`; c.fillText(n + (off ? "  (mati)" : ""), x + 46, y - 4); if (off) { c.strokeStyle = "#9aa0ab"; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 46, y - 16); c.lineTo(x + 170, y - 16); c.stroke(); } }
          else { c.fillStyle = i === 2 ? "#1e6bff" : "#c9cbd3"; c.fillRect(x, y - 30, 30, 30); c.fillStyle = col; c.font = `700 34px ${MONO}`; c.fillText(n, x + 46, y - 4); }
        });
        if (menu) {
          const mx0 = 250, my0 = 300; c.fillStyle = "rgba(11,12,16,.25)"; c.fillRect(mx0 + 10, my0 + 10, 360, 300); c.fillStyle = "#fff"; c.fillRect(mx0, my0, 360, 300); c.strokeStyle = "#0b0c10"; c.lineWidth = 4; c.strokeRect(mx0, my0, 360, 300);
          ["Duplikat", "Ganti nama", "Disable Scripts", "Hapus"].forEach((it, i) => { const y = my0 + 20 + i * 70; if (i === 2 && hi) { c.fillStyle = "#1e6bff"; c.fillRect(mx0 + 6, y, 348, 62); } c.fillStyle = i === 2 && hi ? "#fff" : i === 2 ? "#0b0c10" : "#5a5d66"; c.font = `${i === 2 ? 800 : 600} 32px ${SANS}`; c.fillText(it, mx0 + 26, y + 42); });
        }
      });
      const on = t > fy ? 1 : 0;
      B7t.paint("t" + on, (c, w, h) => {
        c.fillStyle = "#fbfbfc"; c.fillRect(0, 0, w, h); c.fillStyle = "#0b0c10"; c.fillRect(0, 0, w, 80); c.fillStyle = "#fff"; c.font = `700 36px ${MONO}`; c.fillText("TOOLBOX", 30, 52);
        c.fillStyle = "#eef0f4"; rr(c, 24, 100, w - 48, 60, 30); c.fill(); c.fillStyle = "#5a5d66"; c.font = `600 30px ${SANS}`; c.fillText("pohon", 60, 141);
        c.fillStyle = on ? "#1e6bff" : "#fff"; c.strokeStyle = "#1e6bff"; c.lineWidth = 4; rr(c, 24, 180, 420, 56, 28); c.fill(); c.stroke(); c.fillStyle = on ? "#fff" : "#1e6bff"; c.font = `800 28px ${SANS}`; c.fillText((on ? "✓ " : "") + "Kreator terverifikasi", 46, 218);
        for (let i = 0; i < 6; i++) { const ok = i % 3 !== 1, x = 24 + (i % 3) * 200, y = 262 + Math.floor(i / 3) * 186; c.globalAlpha = on && !ok ? 0.18 : 1; c.fillStyle = "#fff"; c.fillRect(x, y, 184, 170); c.strokeStyle = "#c9cbd3"; c.lineWidth = 4; c.strokeRect(x, y, 184, 170); icon(c, i % 2 ? "house" : "tree", x + 92, y + 82, 1.2); if (on && ok) { c.fillStyle = "#1e6bff"; c.beginPath(); c.arc(x + 156, y + 30, 18, 0, 7); c.fill(); c.strokeStyle = "#fff"; c.lineWidth = 5; c.beginPath(); c.moveTo(x + 147, y + 30); c.lineTo(x + 154, y + 38); c.lineTo(x + 166, y + 22); c.stroke(); } c.globalAlpha = 1; }
      });
    }
    c7.forEach((c, i) => {
      const a = c.a + (t < sc ? t * 1.4 : sc * 1.4); const fall = Math.max(0, t - sc);
      c.m.position.set(X[6] + 3.6 + Math.cos(a) * 1.4, Math.max(0.23, 3.2 + Math.sin(t * 2 + i) * 0.2 * (t < sc ? 1 : 0) - 9 * fall * fall), 3.0 + Math.sin(a) * 1.4);
      c.m.material.color.copy(t > sc ? grey : redC); c.m.rotation.set(t < sc ? t : sc, t < sc ? t * 1.2 : sc * 1.2, 0);
    });

    // ---- s8 ----
    const dk = AT["s8:dicek"];
    const pl = ramp(t, dk - 0.2, dk + 0.4);
    const hx = H.G.position.x;
    T8.G.position.set(hx + (X[7] + 2.4 - hx) * pl, t < dk - 0.2 ? 5.6 : 0.5 + (1 - pl) * 5.1 + Math.sin(pl * Math.PI) * 1.2, 0.6 + (0.2 - 0.6) * pl);
    T8.G.scale.setScalar(t < dk - 0.2 ? 0.6 : 0.6 + 0.4 * pl);
    T8.G.visible = t > K.s8 - 0.2;
    t8Blob.visible = pl > 0.6; okL.visible = t > dk + 0.3; okL.position.set(X[7] + 2.6, 6.9, 0.8); okL.scale.setScalar(back(ramp(t, dk + 0.3, dk + 0.6), 2));

    comp.render();
  };
}
