// EP04 GAME BOY PERANG TELUK / PRECISION. One long seamless product studio: a camera-locked gradient sweep, an invisible
// shadow-catcher floor and six stations along +x (turntable, mailer box, tech bench, magazine easel, museum plinth + crate,
// final pair). The hero is an ORIGINAL grey handheld (no logos) whose front face morphs between pristine and melted with t.
// Key and cool rim follow the camera target so they always shape the console. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, clamp01, smooth, ramp, eout, back, canvasTex, track, std, box, cyl, stage, pts, envStrips } from "./lib3d.js";

const PI = Math.PI, HP = PI / 2;
const lerp = (a, b, u) => a + (b - a) * u;

// deterministic value noise
const hsh = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
function vnoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hsh(ix, iy), b = hsh(ix + 1, iy), c = hsh(ix, iy + 1), d = hsh(ix + 1, iy + 1);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
}
const fbm = (x, y) => (vnoise(x, y) + 0.5 * vnoise(x * 2.03, y * 2.03) + 0.25 * vnoise(x * 4.1, y * 4.1)) / 1.75;

// piecewise smooth keyframes [t, ...v]: holds between equal keys, never overshoots, teleports with a 0.01 s gap
function kf(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    const n = keys.length;
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0;
    while (keys[i + 1][0] < t) i++;
    const a = keys[i], b = keys[i + 1], u = smooth((t - a[0]) / Math.max(1e-4, b[0] - a[0]));
    return a.slice(1).map((v, j) => lerp(v, b[j + 1], u));
  };
}

// ---------- console ----------
const CW = 1.0, CH = 1.6, CD = 0.3, CR = 0.075;
const PX = (x) => ((x + 0.5) / 1.0) * 512, PY = (y) => ((0.8 - y) / 1.6) * 820;
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

function frontDecal() {
  return canvasTex(512, 820, (g, w, h) => {
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h);
    const R = mulberry(77);
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(0,0,0,${0.012 + R() * 0.02})`; g.fillRect(R() * w, R() * h, 1.5, 1.5); }
    // top ridge with switch slot
    g.strokeStyle = "rgba(60,62,70,.45)"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(PX(-0.46), PY(0.735)); g.lineTo(PX(0.46), PY(0.735)); g.stroke();
    g.fillStyle = "rgba(40,42,48,.55)"; g.font = "700 15px Arial"; g.textAlign = "left"; g.fillText("◀ OFF  ·  ON ▶", PX(-0.42), PY(0.765));
    // bezel
    g.fillStyle = "#4b4e58"; rr(g, PX(-0.41), PY(0.665), PX(0.41) - PX(-0.41), PY(0.0) - PY(0.665), 22); g.fill();
    g.fillStyle = "#3a3c45"; rr(g, PX(-0.39), PY(0.645), PX(0.39) - PX(-0.39), PY(0.02) - PY(0.645), 16); g.fill();
    g.fillStyle = "#2bb3a3"; g.fillRect(PX(-0.37), PY(0.628), PX(0.2) - PX(-0.37), 4);
    g.fillStyle = "#ff6a2b"; g.fillRect(PX(0.22), PY(0.628), PX(0.37) - PX(0.22), 4);
    g.fillStyle = "#26272d"; rr(g, PX(-0.255), PY(0.585), PX(0.255) - PX(-0.255), PY(0.12) - PY(0.585), 6); g.fill();
    g.fillStyle = "rgba(230,230,235,.75)"; g.font = "700 13px Arial"; g.textAlign = "center"; g.fillText("POWER", PX(-0.33), PY(0.34));
    // d-pad well, A/B well
    const well = (cx, cy, r) => { const gr = g.createRadialGradient(PX(cx), PY(cy), 2, PX(cx), PY(cy), r); gr.addColorStop(0, "rgba(0,0,0,.18)"); gr.addColorStop(0.75, "rgba(0,0,0,.08)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.beginPath(); g.arc(PX(cx), PY(cy), r, 0, 7); g.fill(); };
    well(-0.24, -0.2, 92); well(0.31, -0.15, 52); well(0.13, -0.25, 52);
    g.fillStyle = "rgba(50,50,60,.75)"; g.font = "800 22px Arial"; g.fillText("A", PX(0.33), PY(-0.27)); g.fillText("B", PX(0.15), PY(-0.37));
    g.font = "700 13px Arial"; g.fillText("SELECT", PX(-0.08), PY(-0.535)); g.fillText("START", PX(0.1), PY(-0.535));
    // speaker slots
    g.save(); g.translate(PX(0.3), PY(-0.62)); g.rotate(-0.5);
    for (let i = 0; i < 6; i++) { g.fillStyle = "#3f4048"; rr(g, -50 + i * 18, -40, 8, 80, 4); g.fill(); }
    g.restore();
    // bottom edge seam
    g.strokeStyle = "rgba(60,62,70,.25)"; g.lineWidth = 2; g.beginPath(); g.moveTo(PX(-0.46), PY(-0.76)); g.lineTo(PX(0.46), PY(-0.76)); g.stroke();
  });
}

function melt(x, y, z) {
  const f = smooth((z + 0.06) / 0.2);
  const n1 = fbm(x * 3.1 + 2, y * 3.1), n2 = fbm(x * 7 + 9, y * 7 - 3), n3 = fbm(x * 2 - 5, y * 2 + 7);
  let heat = 0.42 + 0.6 * clamp01(-x * 0.8 - y * 0.9 + 0.3) + 0.55 * (n3 - 0.5);
  const scr = Math.exp(-((x / 0.32) ** 2 + ((y - 0.34) / 0.3) ** 2));
  heat = clamp01(heat - 0.5 * scr);
  const drip = y < -0.5 ? 0.16 * heat * n2 * clamp01((-0.5 - y) / 0.3) : 0;
  const dy = -f * (0.11 * heat * (0.6 + n1) + drip);
  const dz = f * (0.085 * (n2 - 0.5) * heat * 2 - 0.045 * heat + 0.022 * heat * Math.sin(x * 19 + n1 * 7));
  const dx = f * 0.06 * (n1 - 0.5) * heat;
  return [dx, dy, dz, heat * f, n2];
}

function makeConsole(seed) {
  const G = new THREE.Group();
  const geo = new THREE.BoxGeometry(CW, CH, CD, 30, 48, 6);
  const p = geo.attributes.position, n = p.count;
  const hx = CW / 2 - CR, hy = CH / 2 - CR, hz = CD / 2 - CR;
  const P0 = new Float32Array(n * 3), P1 = new Float32Array(n * 3), N0 = new Float32Array(n * 3), C0 = new Float32Array(n * 3), C1 = new Float32Array(n * 3);
  const clean = new THREE.Color(0xcfcfca), charA = new THREE.Color(0x15110e), charB = new THREE.Color(0x5a3a22), charC = new THREE.Color(0x9b7b56);
  for (let i = 0; i < n; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const cx = Math.max(-hx, Math.min(hx, x)), cy = Math.max(-hy, Math.min(hy, y)), cz = Math.max(-hz, Math.min(hz, z));
    let nx = x - cx, ny = y - cy, nz = z - cz; const L = Math.hypot(nx, ny, nz) || 1;
    nx /= L; ny /= L; nz /= L;
    x = cx + nx * CR; y = cy + ny * CR; z = cz + nz * CR;
    P0.set([x, y, z], i * 3); N0.set([nx, ny, nz], i * 3);
    const [dx, dy, dz, h, n2] = melt(x, y, z);
    P1.set([x + dx, y + dy, z + dz], i * 3);
    const ca = clamp01(h * 1.35 + (n2 - 0.5) * 0.7);
    const cc = charA.clone().lerp(charB, clamp01(n2 * 1.6 - 0.3)).lerp(charC, clamp01((n2 - 0.62) * 3) * 0.6);
    const col = clean.clone().lerp(cc, ca);
    C0.set([clean.r, clean.g, clean.b], i * 3); C1.set([col.r, col.g, col.b], i * 3);
  }
  p.array.set(P0);
  geo.setAttribute("normal", new THREE.BufferAttribute(N0.slice(), 3));
  geo.setAttribute("color", new THREE.BufferAttribute(C0.slice(), 3));
  const mg = new THREE.BufferGeometry(); mg.setIndex(geo.index); mg.setAttribute("position", new THREE.BufferAttribute(P1, 3)); mg.computeVertexNormals();
  const N1 = mg.attributes.normal.array;
  const body = new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.35 });
  const face = body.clone(); face.map = frontDecal();
  const mesh = new THREE.Mesh(geo, [body, body, body, body, face, body]);
  mesh.castShadow = mesh.receiveShadow = true; G.add(mesh);

  // LCD
  const lc = document.createElement("canvas"); lc.width = 320; lc.height = 288;
  const lctx = lc.getContext("2d");
  const ltex = new THREE.CanvasTexture(lc); ltex.colorSpace = THREE.SRGBColorSpace;
  const scrM = new THREE.MeshStandardMaterial({ color: 0x777777, map: ltex, emissive: 0xffffff, emissiveMap: ltex, emissiveIntensity: 0.55, roughness: 0.25 });
  const parts = [];
  const part = (m, x, y, z, char = true) => { m.position.set(x, y, z); m.castShadow = true; G.add(m); const d = melt(x, y, 0.15); parts.push({ m, x, y, z, d, char, base: m.material.color ? m.material.color.clone() : null }); return m; };
  part(new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.414), scrM), 0, 0.352, 0.1515, false);
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, roughness: 0.04, metalness: 0, depthWrite: false });
  part(new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.64), glass), 0, 0.333, 0.156, false);
  const ledM = new THREE.MeshBasicMaterial({ color: 0x3a1010, toneMapped: false });
  part(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 16).rotateX(HP), ledM), -0.33, 0.4, 0.152, false);
  const dark = () => new THREE.MeshPhysicalMaterial({ color: 0x2a2b31, roughness: 0.38, clearcoat: 0.4 });
  part(new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.085, 0.05), dark()), -0.24, -0.2, 0.16);
  part(new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.27, 0.05), dark()), -0.24, -0.2, 0.16);
  const wine = () => new THREE.MeshPhysicalMaterial({ color: 0x8c2c4c, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15 });
  part(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 32).rotateX(HP), wine()), 0.31, -0.15, 0.158);
  part(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 32).rotateX(HP), wine()), 0.13, -0.25, 0.158);
  const pillM = () => new THREE.MeshPhysicalMaterial({ color: 0x5c5e66, roughness: 0.45, clearcoat: 0.3 });
  const pills = [-0.08, 0.1].map((x) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.07, 6, 12), pillM()); m.rotation.z = -1.13; return part(m, x, -0.47, 0.155); });
  // cartridge (slides along local y)
  const cart = new THREE.Group(); G.add(cart);
  const cb = box(0.56, 0.66, 0.08, std(0x8d8f95, 0.5), 0, 0, 0, cart);
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.5), new THREE.MeshStandardMaterial({ roughness: 0.6, map: canvasTex(230, 250, (g, w, h) => {
    g.fillStyle = "#e9e6dc"; g.fillRect(0, 0, w, h); g.fillStyle = "#1f3a5c"; g.fillRect(10, 10, w - 20, h - 70);
    const cols = ["#ff6a2b", "#2bb3a3", "#f2c14e", "#8c2c4c", "#a8c070"]; const R = mulberry(9);
    for (let i = 0; i < 14; i++) { g.fillStyle = cols[i % 5]; const s = 22; g.fillRect(24 + Math.floor(R() * 7) * s, 30 + Math.floor(R() * 5) * s, s - 3, s - 3); }
    g.fillStyle = "#1f3a5c"; g.font = "900 34px Arial"; g.textAlign = "center"; g.fillText("TETRIS", w / 2, h - 22);
  }) }));
  cl.position.set(0, -0.04, 0.041); cart.add(cl);
  for (let i = 0; i < 5; i++) box(0.5, 0.012, 0.01, std(0x6d6f75, 0.5), 0, 0.3 - i * 0.025, 0.042, cart);

  // falling-block LCD, a pure function of game time
  const R = mulberry(seed);
  const pieces = []; let hm = new Array(10).fill(0), cyc = 0;
  const types = [[[0, 0]], [[0, 0], [1, 0]], [[0, 0], [0, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [2, 0]]];
  for (let i = 0; i < 400; i++) {
    const ty = types[Math.floor(R() * types.length)], wdt = Math.max(...ty.map((c) => c[0])) + 1;
    const col = Math.floor(R() * (11 - wdt));
    let base = 0; for (const c of ty) base = Math.max(base, hm[col + c[0]]);
    for (const c of ty) hm[col + c[0]] = Math.max(hm[col + c[0]], base + c[1] + 1);
    pieces.push({ ty, col, row: base, shade: 1 + Math.floor(R() * 3), cyc });
    if (Math.max(...hm) >= 9) { hm = new Array(10).fill(0); cyc++; }
  }
  const SH = ["#a9c46c", "#6f8f3c", "#3e5e2a", "#1d361b"];
  const DT = 0.75, ROWS = 12;
  function drawLCD(mode, gt, bright) {
    const g = lctx, w = 320, h = 288, cs = 22, ox = 50, oy = 12;
    if (mode === "off") { g.fillStyle = "#4e5a44"; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "rgba(255,255,255,.06)"); gr.addColorStop(1, "rgba(0,0,0,.12)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); ltex.needsUpdate = true; return; }
    g.fillStyle = SH[0]; g.fillRect(0, 0, w, h);
    if (mode === "boot") {
      const y = Math.min(150, -20 + gt * 160);
      g.fillStyle = SH[3]; g.font = "900 44px Arial"; g.textAlign = "center"; g.fillText("AUDIRA", w / 2, y);
      g.fillRect(90, y + 22, 140 * clamp01(gt - 1.1), 6);
    } else {
      g.fillStyle = SH[3]; g.fillRect(ox - 6, 0, 4, h); g.fillRect(ox + cs * 10 + 2, 0, 4, h);
      const k = Math.floor(gt / DT), u = gt / DT - k;
      const cur = pieces[k % 400];
      for (let i = Math.max(0, k - 60); i < k; i++) {
        const pc = pieces[i % 400]; if (pc.cyc !== cur.cyc) continue;
        g.fillStyle = SH[pc.shade];
        for (const c of pc.ty) { const r = pc.row + c[1]; g.fillRect(ox + (pc.col + c[0]) * cs + 1, oy + (ROWS - 1 - r) * cs + 1, cs - 2, cs - 2); }
      }
      const fallRow = Math.max(cur.row, Math.floor(lerp(ROWS + 1, cur.row, clamp01(u * 1.25))));
      g.fillStyle = SH[cur.shade];
      for (const c of cur.ty) { const r = fallRow + c[1]; if (r < ROWS) g.fillRect(ox + (cur.col + c[0]) * cs + 1, oy + (ROWS - 1 - r) * cs + 1, cs - 2, cs - 2); }
      g.fillStyle = SH[2]; for (let i = 0; i < 4; i++) g.fillRect(ox + cs * 10 + 14, 30 + i * 22, 30 - i * 5, 10);
    }
    if (bright < 1) { g.fillStyle = `rgba(78,90,68,${1 - bright})`; g.fillRect(0, 0, w, h); }
    ltex.needsUpdate = true;
  }

  let lastM = -1;
  const pa = geo.attributes.position.array, na = geo.attributes.normal.array, ca = geo.attributes.color.array;
  const charPart = new THREE.Color(0x231a14);
  function setMelt(m) {
    if (Math.abs(m - lastM) < 1e-4) return; lastM = m;
    for (let i = 0; i < n * 3; i++) { pa[i] = P0[i] + (P1[i] - P0[i]) * m; na[i] = N0[i] + (N1[i] - N0[i]) * m; ca[i] = C0[i] + (C1[i] - C0[i]) * m; }
    geo.attributes.position.needsUpdate = geo.attributes.normal.needsUpdate = geo.attributes.color.needsUpdate = true;
    geo.computeBoundingSphere();
    for (const q of parts) {
      q.m.position.set(q.x + q.d[0] * m, q.y + q.d[1] * m, q.z + q.d[2] * m);
      q.m.rotation.x = (q.d[4] - 0.5) * 0.5 * m * q.d[3];
      if (q.char && q.base) q.m.material.color.copy(q.base).lerp(charPart, m * clamp01(q.d[3] * 1.2));
    }
  }
  return { G, setMelt, drawLCD, ledM, cart, pills, glass, scrM };
}

// ---------- world ----------
export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) { console.error("missing anchor " + k); return 0; } return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xe9e6e0, exp: 1.08, bloom: [0.55, 0.45, 2.2] });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.08;
  const nan = new ShaderPass({ uniforms: { tDiffuse: { value: null } }, vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(any(isnan(c))||any(isinf(c)))c=vec4(0.,0.,0.,1.);gl_FragColor=max(c,vec4(0.));}" });
  comp.insertPass(nan, 1);
  envStrips(r, scene, [[9, 9, 0xffffff, 2.4, 0, 9, 2], [2.5, 8, 0xffffff, 3.2, 7, 2, 6], [2.5, 8, 0xc4d8ff, 2.6, -7, 2, -5], [12, 3, 0xf3e8d8, 0.7, 0, -6, 0], [10, 4, 0x9a9a9a, 0.5, 0, 2, -10]], 0x1d1f24);
  scene.environmentIntensity = 0.5;
  scene.environmentRotation.y = 0.8;
  scene.background = null;
  scene.add(cam);

  // camera-locked seamless sweep
  const bgU = { top: { value: new THREE.Color() }, bot: { value: new THREE.Color() }, spot: { value: new THREE.Color() }, flash: { value: 0 } };
  const bgM = new THREE.ShaderMaterial({ uniforms: bgU, depthWrite: false, depthTest: false,
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform vec3 top,bot,spot;uniform float flash;varying vec2 vUv;void main(){vec3 c=mix(bot,top,smoothstep(0.08,0.95,vUv.y));float s=exp(-pow(length((vUv-vec2(.5,.47))*vec2(1.,1.6))/.34,2.));c=mix(c,spot,s*.85);c+=vec3(3.2,2.0,1.1)*flash*(0.4+0.6*s);gl_FragColor=vec4(max(c,vec3(0.)),1.);}" });
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(60, 100), bgM); bg.position.z = -70; bg.renderOrder = -10; bg.frustumCulled = false; cam.add(bg);
  const LIGHT = { top: new THREE.Color(0xf1efea), bot: new THREE.Color(0xd3cec5), spot: new THREE.Color(0xfbfaf6) };
  const DARK = { top: new THREE.Color(0x1d1e22), bot: new THREE.Color(0x0b0b0d), spot: new THREE.Color(0x3a3a40) };
  const EMBER = { top: new THREE.Color(0x2a1208), bot: new THREE.Color(0x0d0604), spot: new THREE.Color(0x9a3a12) };

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(300, 60), new THREE.ShadowMaterial({ opacity: 0.22 }));
  floor.rotation.x = -HP; floor.position.set(20, 0, 0); floor.receiveShadow = true; scene.add(floor);

  scene.add(new THREE.AmbientLight(0xffffff, 0.12));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 30 }); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 6;
  const rim = new THREE.DirectionalLight(0xbfd6ff, 1.4);
  const fire = new THREE.PointLight(0xff6a22, 0, 6, 1.6);
  scene.add(key, key.target, rim, rim.target, fire);

  // labels
  const tplane = (w, h, cw, ch, draw, o = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), o.basic ? new THREE.MeshBasicMaterial({ map: canvasTex(cw, ch, draw), transparent: true, toneMapped: false, depthWrite: !o.nodw }) : new THREE.MeshStandardMaterial({ map: canvasTex(cw, ch, draw), roughness: o.rough ?? 0.75, metalness: o.metal ?? 0, transparent: !!o.alpha })); return m; };
  const white = std(0xf3f2ee, 0.55), alu = std(0xd6d8dc, 0.28, 0.85), slate = std(0x2d3037, 0.6);

  // ST0 turntable
  const discTex = (r0, txt) => canvasTex(512, 512, (g, w) => { g.fillStyle = "#f4f3ef"; g.fillRect(0, 0, w, w); for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(0,0,0,${0.03 + (i % 5 === 0 ? 0.05 : 0)})`; g.lineWidth = 1.2; g.beginPath(); g.arc(w / 2, w / 2, 40 + i * 5.4, 0, 7); g.stroke(); } if (txt) { g.fillStyle = "rgba(60,60,66,.55)"; g.font = "700 22px Arial"; g.textAlign = "center"; const s = txt; for (let i = 0; i < s.length; i++) { g.save(); g.translate(w / 2, w / 2); g.rotate(-0.9 + i * 0.075); g.fillText(s[i], 0, -232); g.restore(); } } });
  const mkDisc = (x, rad, txt) => { const G = new THREE.Group(); G.position.set(x, 0, 0); scene.add(G); cyl(rad, rad * 1.02, 0.12, 96, std(0xeeeeea, 0.35, 0.1), 0, 0.06, 0, G); const top = new THREE.Mesh(new THREE.CircleGeometry(rad * 0.97, 96), new THREE.MeshStandardMaterial({ map: discTex(rad, txt), roughness: 0.4 })); top.rotation.x = -HP; top.position.y = 0.121; top.receiveShadow = true; G.add(top); const ring = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.018, 12, 128), alu); ring.rotation.x = HP; ring.position.y = 0.12; G.add(ring); return G; };
  const disc0 = mkDisc(0, 1.15, "");

  // medic silhouette + barracks panels behind ST0
  const silTex = canvasTex(512, 768, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,.92)"); gr.addColorStop(1, "rgba(236,234,229,.92)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = "#24262c";
    g.beginPath(); g.ellipse(256, 232, 112, 92, 0, PI, 0); g.lineTo(380, 248); g.lineTo(132, 248); g.closePath(); g.fill(); // helmet
    g.beginPath(); g.ellipse(256, 282, 62, 74, 0, 0, 7); g.fill(); // head
    g.fillRect(226, 330, 60, 60); // neck
    g.beginPath(); g.moveTo(90, 768); g.lineTo(104, 470); g.quadraticCurveTo(116, 392, 196, 380); g.lineTo(316, 380); g.quadraticCurveTo(396, 392, 408, 470); g.lineTo(422, 768); g.closePath(); g.fill(); // torso
    g.fillStyle = "#3a3d45"; g.fillRect(150, 400, 24, 368); g.fillRect(338, 400, 24, 368); // straps
    g.fillStyle = "#f5f5f2"; g.fillRect(392, 500, 64, 70); g.fillStyle = "#24262c"; g.font = "800 18px Arial"; g.textAlign = "center"; g.fillText("MEDIS", 424, 541);
    g.strokeStyle = "rgba(0,0,0,.12)"; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
  });
  const barTex = canvasTex(512, 768, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#2a0f06"); gr.addColorStop(0.55, "#c2481a"); gr.addColorStop(0.72, "#ff9a3c"); gr.addColorStop(1, "#1a0904"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = "#120806"; g.fillRect(0, 560, w, 208);
    for (const [x, rw] of [[40, 150], [210, 170], [395, 130]]) { g.beginPath(); g.ellipse(x + rw / 2, 560, rw / 2, 70, 0, PI, 0); g.fill(); }
    g.fillRect(470, 400, 10, 160); for (let i = 0; i < 5; i++) { g.save(); g.translate(475, 404); g.rotate(-1.2 + i * 0.6); g.beginPath(); g.ellipse(36, 0, 40, 9, 0, 0, 7); g.fill(); g.restore(); }
    const rg = g.createRadialGradient(250, 470, 4, 250, 470, 220); rg.addColorStop(0, "rgba(255,240,200,.9)"); rg.addColorStop(1, "rgba(255,120,40,0)"); g.fillStyle = rg; g.fillRect(0, 0, w, h);
  });
  const SP = new THREE.Group(); SP.position.set(1.35, 0, -1.25); SP.rotation.y = -0.28; scene.add(SP);
  const silM = new THREE.MeshBasicMaterial({ map: silTex, transparent: true, toneMapped: false, opacity: 1 });
  const barM = new THREE.MeshBasicMaterial({ map: barTex, transparent: true, toneMapped: false, opacity: 0 });
  const silP = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.85), silM); silP.position.y = 1.5; SP.add(silP);
  const barP = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.85), barM); barP.position.set(0, 1.5, 0.004); SP.add(barP);
  for (const [w, h, x, y] of [[1.98, 0.05, 0, 2.94], [1.98, 0.05, 0, 0.06], [0.05, 2.9, -0.97, 1.5], [0.05, 2.9, 0.97, 1.5]]) box(w, h, 0.06, alu, x, y, 0, SP);
  const plate = tplane(1.5, 0.36, 600, 144, (g, w, h) => { g.fillStyle = "#16171b"; g.fillRect(0, 0, w, h); g.fillStyle = "#ffffff"; g.font = "800 50px Arial"; g.textAlign = "left"; g.fillText("STEPHAN SCOGGINS", 30, 62); g.fillStyle = "#ff8a4c"; g.font = "600 34px Arial"; g.fillText("petugas medis · Perang Teluk", 30, 114); }, { rough: 0.4 });
  plate.position.set(0, 0.32, 0.08); SP.add(plate); box(1.56, 0.42, 0.05, slate, 0, 0.32, 0.05, SP);

  // ST1 mailer box (x=8)
  const kraft = (lbl) => canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#c49a6c"; g.fillRect(0, 0, w, h); const R = mulberry(5); for (let i = 0; i < 1400; i++) { g.strokeStyle = `rgba(90,60,30,${0.05 + R() * 0.08})`; g.lineWidth = 1; const x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6 + R() * 14, y + (R() - 0.5) * 3); g.stroke(); } if (lbl) lbl(g, w, h); });
  const kM = new THREE.MeshStandardMaterial({ map: kraft(), roughness: 0.9 });
  const BX = new THREE.Group(); BX.position.set(8, 0, 0); scene.add(BX);
  box(1.5, 0.05, 2.1, kM, 0, 0.025, 0, BX);
  box(1.5, 0.6, 0.05, kM, 0, 0.3, 1.025, BX); box(1.5, 0.6, 0.05, kM, 0, 0.3, -1.025, BX);
  box(0.05, 0.6, 2.1, kM, -0.725, 0.3, 0, BX); box(0.05, 0.6, 2.1, kM, 0.725, 0.3, 0, BX);
  const foamT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#f4f4f2"; g.fillRect(0, 0, w, w); for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const gr = g.createRadialGradient(x * 32 + 16 + (y % 2) * 16, y * 32 + 16, 2, x * 32 + 16 + (y % 2) * 16, y * 32 + 16, 15); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(170,175,185,.55)"); g.fillStyle = gr; g.beginPath(); g.arc(x * 32 + 16 + (y % 2) * 16, y * 32 + 16, 14, 0, 7); g.fill(); } }, [3, 4]);
  box(1.38, 0.12, 1.98, new THREE.MeshStandardMaterial({ map: foamT, roughness: 0.7 }), 0, 0.11, 0, BX);
  const boxLbl = tplane(1.3, 0.45, 780, 270, (g, w, h) => { g.fillStyle = "#fbfaf6"; g.fillRect(0, 0, w, h); g.strokeStyle = "#1d2b6b"; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = "#555"; g.font = "700 30px Arial"; g.textAlign = "left"; g.fillText("KEPADA:", 34, 58); g.fillStyle = "#111"; g.font = "800 54px Arial"; g.fillText("Majalah Nintendo Power", 34, 124); g.fillStyle = "#555"; g.font = "700 28px Arial"; g.fillText("DARI: S. Scoggins · Perang Teluk", 34, 196); g.fillStyle = "#c0392b"; g.font = "800 26px Arial"; g.fillText("PECAH BELAH · GANTI BARU", 34, 240); });
  boxLbl.position.set(0, 0.3, 1.052); BX.add(boxLbl);
  const lid = new THREE.Group(); lid.position.set(0, 0.6, -1.05); BX.add(lid);
  box(1.52, 0.045, 2.12, kM, 0, 0.022, 1.06, lid);
  const tape = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 2.14), new THREE.MeshStandardMaterial({ color: 0xd9c8a0, roughness: 0.3, transparent: true, opacity: 0.85 })); tape.rotation.x = -HP; tape.position.set(0, 0.047, 1.06); lid.add(tape);
  const stampL = tplane(0.9, 0.42, 450, 210, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "#b8321f"; g.lineWidth = 10; g.strokeRect(12, 12, w - 24, h - 24); g.fillStyle = "#b8321f"; g.font = "900 64px Arial"; g.textAlign = "center"; g.fillText("DIKIRIM", w / 2, 106); g.font = "700 30px Arial"; g.fillText("DARI MEDAN TUGAS", w / 2, 160); }, { alpha: true });
  stampL.rotation.set(-HP, 0, 0.18); stampL.position.set(0.25, 0.05, 1.5); lid.add(stampL);

  // ST2 tech bench (x=16)
  const BN = new THREE.Group(); BN.position.set(16, 0, 0); scene.add(BN);
  box(4.2, 0.56, 2.6, slate, 0, 0.28, 0, BN);
  for (const [w, d, x, z] of [[4.26, 0.06, 0, 1.3], [4.26, 0.06, 0, -1.3], [0.06, 2.6, -2.1, 0], [0.06, 2.6, 2.1, 0]]) box(w, 0.06, d, alu, x, 0.57, z, BN);
  const matT = canvasTex(1024, 640, (g, w, h) => { g.fillStyle = "#2f5e4c"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(220,240,230,.22)"; g.lineWidth = 1; for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.strokeStyle = "rgba(220,240,230,.45)"; g.lineWidth = 2; for (let x = 0; x < w; x += 160) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } g.fillStyle = "rgba(220,240,230,.6)"; g.font = "700 20px Arial"; g.fillText("AUDIRA LAB · MEJA UJI", 24, h - 20); for (let i = 0; i < 30; i++) g.fillRect(i * 32, 0, 2, 12); });
  const mat = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.2), new THREE.MeshStandardMaterial({ map: matT, roughness: 0.85 })); mat.rotation.x = -HP; mat.position.y = 0.605; mat.receiveShadow = true; BN.add(mat);
  // multimeter
  const MM = new THREE.Group(); MM.position.set(1.35, 0.6, -0.25); MM.rotation.y = -0.35; BN.add(MM);
  box(0.6, 0.14, 0.95, std(0xf2b51c, 0.45), 0, 0.07, 0, MM);
  const mmOff = canvasTex(256, 128, (g, w, h) => { g.fillStyle = "#9fae8f"; g.fillRect(0, 0, w, h); g.fillStyle = "#1c241a"; g.font = "700 76px 'Courier New'"; g.textAlign = "center"; g.fillText("0.00", w / 2, 96); });
  const mmOn = canvasTex(256, 128, (g, w, h) => { g.fillStyle = "#b9cc9e"; g.fillRect(0, 0, w, h); g.fillStyle = "#1c241a"; g.font = "700 76px 'Courier New'"; g.textAlign = "center"; g.fillText("5.02", w / 2, 96); });
  const mmScrM = new THREE.MeshStandardMaterial({ map: mmOff, roughness: 0.3 });
  const mmScr = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.22), mmScrM); mmScr.rotation.x = -HP; mmScr.position.set(0, 0.142, -0.26); MM.add(mmScr);
  cyl(0.15, 0.15, 0.04, 32, slate, 0, 0.16, 0.12, MM);
  box(0.03, 0.02, 0.14, alu, 0, 0.19, 0.12, MM);
  // sticky note
  const noteA = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#ffe36e"; g.fillRect(0, 0, w, h); g.fillStyle = "#2a2a2a"; g.font = "700 40px 'Segoe Print','Comic Sans MS',cursive"; g.textAlign = "center"; g.fillText("tidak", w / 2, 100); g.fillText("tertolong", w / 2, 156); });
  const noteB = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#ffe36e"; g.fillRect(0, 0, w, h); g.fillStyle = "#2a2a2a"; g.font = "700 40px 'Segoe Print','Comic Sans MS',cursive"; g.textAlign = "center"; g.fillText("tidak", w / 2, 100); g.fillText("tertolong", w / 2, 156); g.strokeStyle = "#c0392b"; g.lineWidth = 9; g.beginPath(); g.moveTo(28, 88); g.lineTo(228, 150); g.stroke(); g.fillStyle = "#c0392b"; g.font = "800 46px Arial"; g.fillText("MENYALA!", w / 2, 222); });
  const noteM = new THREE.MeshStandardMaterial({ map: noteA, roughness: 0.8 });
  const note = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), noteM); note.rotation.set(-HP, 0, 0.16); note.position.set(-1.25, 0.612, 0.45); BN.add(note);
  // screwdriver
  const sd = new THREE.Group(); sd.position.set(-1.2, 0.66, -0.55); sd.rotation.set(0, 0.5, HP); BN.add(sd);
  cyl(0.05, 0.05, 0.36, 20, std(0xff6a2b, 0.35), 0, 0.18, 0, sd); cyl(0.012, 0.012, 0.42, 10, alu, 0, -0.2, 0, sd);
  // probes (fixed to the console's bench pose)
  const probe = (col, a, b) => { const c = new THREE.CatmullRomCurve3([a, a.clone().lerp(b, 0.35).add(new THREE.Vector3(0, 0.25, 0.3)), a.clone().lerp(b, 0.7).add(new THREE.Vector3(0, 0.18, 0.2)), b]); const m = new THREE.Mesh(new THREE.TubeGeometry(c, 60, 0.014, 8), std(col, 0.4)); m.castShadow = true; scene.add(m); return m; };
  const prR = probe(0xc0392b, new THREE.Vector3(17.2, 0.76, -0.2), new THREE.Vector3(16.42, 0.66, 0.62));
  const prB = probe(0x1c1c1c, new THREE.Vector3(17.3, 0.76, -0.1), new THREE.Vector3(16.3, 0.66, 0.75));

  // ST3 magazine easel (x=23.8)
  const magT = canvasTex(600, 800, (g, w, h) => {
    g.fillStyle = "#f7f5ef"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#1d2b6b"; g.fillRect(0, 0, w, 120); g.fillStyle = "#ff6a2b"; g.fillRect(0, 120, w, 10);
    g.fillStyle = "#ffffff"; g.font = "900 46px Arial"; g.textAlign = "left"; g.fillText("Nintendo Power #26", 30, 78);
    g.fillStyle = "#e3e0d6"; g.fillRect(30, 160, 300, 260);
    g.fillStyle = "#6e6a62"; rr(g, 120, 185, 120, 200, 14); g.fill(); g.fillStyle = "#2a1d15"; for (const [x, y, rx, ry] of [[140, 330, 40, 34], [205, 300, 30, 50], [130, 230, 18, 24]]) { g.beginPath(); g.ellipse(x, y, rx, ry, 0.4, 0, 7); g.fill(); }
    g.fillStyle = "#8bac5a"; g.fillRect(148, 205, 64, 56);
    g.fillStyle = "#c9c5ba"; for (let i = 0; i < 11; i++) g.fillRect(350, 170 + i * 22, i % 4 === 3 ? 140 : 220, 10);
    for (let c = 0; c < 2; c++) for (let i = 0; i < 14; i++) g.fillRect(30 + c * 285, 450 + i * 22, (i * 37 + c * 11) % 5 === 0 ? 170 : 255, 10);
    g.strokeStyle = "rgba(0,0,0,.08)"; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4);
  });
  const MG = new THREE.Group(); MG.position.set(23.8, 0, -0.6); MG.rotation.y = -0.22; scene.add(MG);
  const page = new THREE.Group(); page.position.y = 1.25; page.rotation.x = -0.14; MG.add(page);
  box(1.6, 2.1, 0.05, white, 0, 0, -0.03, page);
  const pg = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.0), new THREE.MeshStandardMaterial({ map: magT, roughness: 0.65 })); pg.position.z = 0.001; page.add(pg);
  const hiM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 0.55, 0.2), transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const hi = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.235, 48), hiM); hi.scale.set(0.95, 0.42, 1); hi.position.set(0.43, 0.81, 0.012); page.add(hi);
  for (const s of [-1, 1]) { const l = cyl(0.025, 0.025, 2.4, 10, alu, s * 0.55, 1.1, -0.32, MG); l.rotation.x = -0.12; }
  box(1.7, 0.05, 0.12, alu, 0, 0.18, -0.2, MG);
  // tag for the replacement console
  const tagT = canvasTex(420, 220, (g, w, h) => { g.fillStyle = "#fbfaf6"; rr(g, 4, 4, w - 8, h - 8, 26); g.fill(); g.strokeStyle = "#ff6a2b"; g.lineWidth = 8; rr(g, 12, 12, w - 24, h - 24, 20); g.stroke(); g.fillStyle = "#555"; g.font = "800 34px Arial"; g.textAlign = "center"; g.fillText("HADIAH KHUSUS", w / 2, 92); g.fillStyle = "#c2481a"; g.font = "900 50px Arial"; g.fillText("DESERT STORM", w / 2, 160); g.fillStyle = "#ccc"; g.beginPath(); g.arc(36, 40, 12, 0, 7); g.fill(); });

  // ST4 store wall, plinth, glass, crate (x=31 / 34.6)
  const wallT = canvasTex(800, 600, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#fdfcf9"); gr.addColorStop(1, "#e9e5dc"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = "#cfcac0"; const R = mulberry(31); let x = 0; while (x < w) { const bw = 30 + R() * 60, bh = 120 + R() * 260; g.fillRect(x, h - 90 - bh, bw - 6, bh); x += bw; } g.fillStyle = "#b9b3a7"; g.fillRect(0, h - 90, w, 90); g.fillStyle = "#1d1e22"; g.font = "800 64px Arial"; g.textAlign = "center"; g.fillText("NEW YORK", w / 2, 110); g.fillStyle = "#ff6a2b"; g.fillRect(w / 2 - 60, 132, 120, 6); });
  const ST4 = new THREE.Group(); ST4.position.set(31, 0, 0); scene.add(ST4);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.45), new THREE.MeshStandardMaterial({ map: wallT, roughness: 0.8 })); wall.position.set(0, 2.0, -2.2); wall.receiveShadow = true; ST4.add(wall);
  for (const [w, h, x, y] of [[4.7, 0.06, 0, 3.72], [4.7, 0.06, 0, 0.28], [0.06, 3.5, -2.33, 2.0], [0.06, 3.5, 2.33, 2.0]]) box(w, h, 0.08, alu, x, y, -2.18, ST4);
  box(1.5, 1.4, 1.5, std(0xf1f0ec, 0.6), 0, 0.7, 0, ST4);
  box(1.56, 0.06, 1.56, alu, 0, 1.41, 0, ST4); box(1.56, 0.06, 1.56, alu, 0, 0.03, 0, ST4);
  for (const [w, h, x, y] of [[1.2, 0.04, 0, 1.22], [1.2, 0.04, 0, 0.2], [0.04, 1.06, -0.58, 0.71], [0.04, 1.06, 0.58, 0.71]]) box(w, h, 0.04, std(0xe4e2dc, 0.5), x, y, 0.76, ST4);
  const brass = tplane(1.0, 0.42, 600, 252, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#d8b878"); gr.addColorStop(0.5, "#b08d57"); gr.addColorStop(1, "#d9bd84"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = "#2b2116"; g.textAlign = "center"; g.font = "800 46px Arial"; g.fillText("GAME BOY PERANG TELUK", w / 2, 78); g.font = "600 34px Arial"; g.fillText("Toko Nintendo · New York", w / 2, 140); g.font = "800 30px Arial"; g.fillText("AUDIRA · ARSIP SEJARAH GAME", w / 2, 212); }, { rough: 0.3, metal: 0.6 });
  brass.position.set(0, 0.78, 0.785); ST4.add(brass);
  const glassM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, roughness: 0.03, depthWrite: false, side: THREE.DoubleSide });
  const GL = new THREE.Group(); ST4.add(GL);
  GL.add(new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.95, 0.9), glassM));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.25, 1.95, 0.9)), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })); GL.add(edges);
  const spot = new THREE.SpotLight(0xfff3e0, 0, 9, 0.42, 0.6, 1.2); spot.position.set(31, 5.6, 1.2); spot.target.position.set(31, 2.2, 0); scene.add(spot, spot.target);
  const coneM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.15, 1.08, 0.95), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide,
    map: canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.0, 3.2, 48, 1, true), coneM); cone.position.set(31, 4.05, 0.3); scene.add(cone);
  // crate
  const woodT = (stencil) => canvasTex(640, 480, (g, w, h) => { g.fillStyle = "#c69a63"; g.fillRect(0, 0, w, h); const R = mulberry(stencil ? 41 : 42); for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(${120 + R() * 30},${80 + R() * 20},40,.25)`; g.fillRect(0, i * 80, w, 78); g.fillStyle = "rgba(60,35,15,.5)"; g.fillRect(0, i * 80 + 77, w, 3); } for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(90,55,25,${0.08 + R() * 0.1})`; g.beginPath(); const y = R() * h; g.moveTo(R() * w, y); g.lineTo(R() * w, y + (R() - 0.5) * 4); g.stroke(); } if (stencil) { g.fillStyle = "rgba(25,25,28,.88)"; g.textAlign = "center"; g.font = "900 46px 'Arial Black',Arial"; g.fillText("KANTOR PUSAT", w / 2, 120); g.fillText("NINTENDO AMERIKA", w / 2, 180); g.font = "900 92px 'Arial Black',Arial"; g.fillText("2023", w / 2, 300); g.font = "900 34px 'Arial Black',Arial"; g.fillText("AUDIRA · PECAH BELAH", w / 2, 390); } });
  const CR8 = new THREE.Group(); CR8.position.set(34.6, 0, 0.3); scene.add(CR8);
  const wM = new THREE.MeshStandardMaterial({ map: woodT(false), roughness: 0.85 }), wS = new THREE.MeshStandardMaterial({ map: woodT(true), roughness: 0.85 });
  const crateBox = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.15, 1.35), [wM, wM, wM, wM, wS, wM]); crateBox.position.y = 0.575; crateBox.castShadow = crateBox.receiveShadow = true; CR8.add(crateBox);
  for (const s of [-1, 1]) { box(0.08, 1.19, 0.08, std(0x8a6236, 0.8), s * 0.84, 0.595, 0.68, CR8); }
  const clid = new THREE.Group(); clid.position.set(0, 1.15, -0.675); CR8.add(clid);
  box(1.74, 0.07, 1.39, wM, 0, 0.035, 0.675, clid);

  // ST5 final disc (x=40)
  mkDisc(40, 2.0, "AUDIRA · KONSOL PALING TANGGUH · AUDIRA");

  // consoles
  const H = makeConsole(1991), Nw = makeConsole(2626);
  scene.add(H.G, Nw.G);
  Nw.setMelt(0);
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.325), new THREE.MeshStandardMaterial({ map: tagT, roughness: 0.6, transparent: true }));
  const tagPiv = new THREE.Group(); tagPiv.position.set(0.5, 0.62, 0.05); Nw.G.add(tagPiv); tag.position.set(0.3, -0.25, 0); tagPiv.add(tag);
  const str = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.3, 6), std(0x555555)); str.position.set(0.12, -0.08, 0); str.rotation.z = 1.0; tagPiv.add(str);

  // particles: embers + smoke
  const EMB = 140, em = pts(scene, EMB, { color: 0xff7a2a, size: 0.06, add: true });
  for (let i = 0; i < EMB; i++) { em.col[i * 3] = 3.2; em.col[i * 3 + 1] = 1.1; em.col[i * 3 + 2] = 0.25; }
  const SMK = 60, sm = pts(scene, SMK, { color: 0x6b625a, size: 0.9, add: false, opacity: 0 });
  const rE = mulberry(404), eb = [...Array(EMB)].map(() => [rE() * 2.4 - 1.2, rE() * 1.4 - 0.7, rE(), 0.25 + rE() * 0.5, rE() * 6.28]);
  const sb = [...Array(SMK)].map(() => [rE() * 1.6 - 0.8, rE() * 1.0 - 0.5, rE(), 0.12 + rE() * 0.18]);

  // ---------- time ----------
  const tOn = A("s1:dinyalakan"), tBom = A("s3:bom"), tMenyala = A("s5:menyala"), tTetris5 = A("s5:Tetris"), tKaset = A("s5:kaset");
  const tKonsol7 = A("s7:konsol"), tTahun = A("s7:Tahun"), tDipajang = A("s7:dipajang");
  const FLAT = -HP;
  const hero = kf([
    [0, 0, 0.94, 0, -0.1, -0.32, 0],
    [A("s4:mengirim") - 0.2, 0, 0.94, 0, -0.1, -0.32, 0],
    [A("s4:konsol") + 0.3, 2.6, 1.9, 0.3, -0.7, -0.15, 0],
    [A("s4:majalah"), 8, 1.55, 0, FLAT, 0, 0],
    [A("s4:Power") + 0.15, 8, 0.33, 0, FLAT, 0, 0],
    [K.s5 + 0.3, 8, 0.33, 0, FLAT, 0, 0],
    [K.s5 + 1.3, 10.2, 1.6, 0, FLAT, 0, 0],
    [A("s5:menilai"), 16, 0.76, 0, FLAT, 0, 0],
    [K.s6 + 0.7, 16, 0.76, 0, FLAT, 0, 0],
    [K.s6 + 0.71, 31, 5.8, 0, -0.08, -0.22, 0],
    [tDipajang - 0.5, 31, 5.8, 0, -0.08, -0.22, 0],
    [tDipajang + 0.5, 31, 2.24, 0, -0.08, -0.22, 0],
    [tTahun + 0.4, 31, 2.24, 0, -0.08, -0.22, 0],
    [tKonsol7 + 0.2, 33.2, 2.9, 0.25, -0.8, -0.1, 0],
    [A("s7:dikembalikan") + 0.3, 34.6, 0.38, 0.3, FLAT, HP, 0],
    [K.s8 - 0.4, 34.6, 0.38, 0.3, FLAT, HP, 0],
    [K.s8 - 0.39, 39.3, 0.95, 0, -0.08, 0.26, 0],
  ]);
  const neu = kf([
    [0, 26.8, 0.82, 0.45, 0, -0.35, 0],
    [A("s6:mengirim") - 0.1, 26.8, 0.82, 0.45, 0, -0.35, 0],
    [A("s6:pengganti") + 0.2, 22.55, 0.82, 0.45, 0, -0.3, 0],
    [K.s8 - 0.4, 22.55, 0.82, 0.45, 0, -0.3, 0],
    [K.s8 - 0.39, 40.7, 0.95, 0, -0.08, -0.26, 0],
  ]);
  const meltAt = (t) => {
    if (t < K.s2 - 0.3) return 1;
    if (t < K.s3) return 1 - ramp(t, K.s2 - 0.3, K.s2 + 0.9);
    return ramp(t, A("s3:terbakar") - 0.5, A("s3:parah") + 0.2);
  };
  // LCD modes
  const heroLCD = (t) => {
    if (t < tOn) return ["off", 0, 1];
    if (t < K.s3 + 0.0 || t < tBom) return ["game", t - tOn, t < tOn + 0.6 ? (Math.sin(t * 90) > 0 ? 1 : 0.25) * ramp(t, tOn, tOn + 0.6) : 1];
    if (t < tMenyala) return ["off", 0, 1];
    if (t < tTetris5) return ["boot", t - tMenyala, t < tMenyala + 0.4 ? (Math.sin(t * 80) > 0 ? 1 : 0.3) : 1];
    if (t < tKonsol7 + 0.3) return ["game", t - tTetris5, 1];
    if (t < K.s8 - 0.39) return ["off", 0, 1];
    return ["game", t - K.s8 + 30, 1];
  };
  const cartY = (t) => { const outU = ramp(t, K.s5 + 0.4, K.s5 + 1.4), inU = ramp(t, tKaset - 0.5, tKaset + 0.3); return lerp(0.59, 2.2, outU * (1 - inU)); };

  const camT = track([
    [0, 0.5, 0.62, 2.35, 0.04, 0.7, 0],
    [A("s1:meleleh") + 0.3, 0.3, 0.92, 3.2, 0.0, 0.86, 0],
    [tOn + 0.2, 0.12, 1.24, 2.55, 0.0, 1.2, 0],
    [K.s1e, 0.9, 1.15, 4.6, 0.05, 0.98, 0],
    [K.s2 + 1.0, 2.7, 1.6, 5.7, 0.1, 1.25, 0],
    [A("s2:dijual"), 0.9, 1.5, 6.1, 0.0, 1.2, 0],
    [A("s2:Salah"), -1.3, 1.45, 5.9, 0.1, 1.15, 0],
    [A("s2:Stephan") + 0.4, 0.2, 1.6, 7.2, 0.55, 1.15, -0.5],
    [K.s2e, 1.1, 1.8, 7.8, 0.65, 1.3, -0.6],
    [K.s3 + 0.5, 0.7, 1.3, 5.4, 0.15, 0.95, 0],
    [A("s3:Bagian"), 0.35, 1.0, 3.4, 0.0, 0.85, 0],
    [K.s3e, -0.25, 0.86, 2.7, 0.0, 0.78, 0],
    [K.s4 + 0.7, 1.6, 2.0, 5.8, 1.6, 1.0, 0],
    [A("s4:konsol") + 0.3, 3.2, 2.4, 5.6, 2.9, 1.6, 0],
    [A("s4:majalah"), 8.0, 3.4, 5.4, 8.0, 0.75, 0],
    [A("s4:berharap"), 8.0, 3.2, 4.8, 8.0, 0.4, 0.2],
    [K.s4e, 8.6, 3.0, 4.9, 8.2, 0.45, 0.2],
    [K.s5 + 0.9, 10.6, 3.3, 5.6, 11.2, 0.9, 0],
    [A("s5:menilai"), 15.5, 3.7, 3.9, 16.0, 0.65, 0],
    [A("s5:tertolong"), 15.4, 3.3, 3.5, 15.6, 0.65, 0.2],
    [tMenyala, 16.0, 3.4, 2.2, 16.0, 0.72, -0.3],
    [A("s5:Tombol"), 16.1, 3.1, 2.6, 16.0, 0.72, 0.2],
    [tKaset, 16.15, 3.3, 1.9, 16.0, 0.75, -0.45],
    [K.s5e, 16.5, 3.0, 2.7, 16.0, 0.72, -0.2],
    [K.s6 + 0.45, 22.4, 1.7, 5.8, 23.1, 1.05, -0.2],
    [A("s6:pengganti"), 22.2, 1.35, 4.8, 22.6, 0.95, 0.15],
    [A("s6:Storm"), 23.0, 1.4, 5.0, 22.9, 0.95, 0.3],
    [A("s6:Surat"), 23.3, 1.75, 4.4, 23.6, 1.3, -0.5],
    [A("s6:edisi") - 0.2, 23.75, 1.85, 4.9, 23.75, 1.45, -0.6],
    [A("s6:edisi") + 0.9, 23.85, 1.9, 4.6, 23.8, 1.5, -0.6],
    [K.s6e, 28.9, 2.6, 7.7, 30.2, 1.75, 0],
    [K.s7 + 0.7, 30.3, 2.55, 7.7, 30.8, 1.75, 0],
    [tDipajang, 31.3, 2.5, 7.6, 31.0, 1.75, 0],
    [A("s7:York"), 31.1, 2.3, 6.9, 31.0, 1.65, 0],
    [A("s7:ketangguhannya"), 31.25, 2.6, 4.9, 31.0, 2.2, 0],
    [A("s7:berkala"), 31.0, 2.5, 4.5, 31.0, 2.25, 0],
    [tTahun + 0.3, 32.3, 2.6, 7.4, 32.7, 1.6, 0],
    [A("s7:dikembalikan"), 34.0, 2.4, 6.0, 34.4, 0.95, 0],
    [K.s7e, 34.8, 2.1, 5.0, 34.6, 0.8, 0.3],
    [K.s8 + 0.9, 38.3, 1.7, 8.0, 39.7, 0.95, 0],
    [A("s8:tetap"), 40.6, 1.6, 8.0, 40.0, 0.95, 0],
    [A("s8:Konsol#2"), 39.6, 1.45, 6.6, 39.85, 0.95, 0],
    [A("s8:Ikuti"), 40.3, 1.7, 8.2, 40.0, 0.95, 0],
    [K.end + 0.3, 40.5, 1.8, 8.7, 40.0, 1.0, 0],
  ]);

  const tg = new THREE.Vector3(), tmpC = new THREE.Color();
  const setBG = (t) => {
    const dark1 = 1 - ramp(t, K.s2 - 0.2, K.s2 + 0.9);
    const emb = ramp(t, tBom - 0.25, tBom + 0.05) * (1 - ramp(t, K.s4 - 0.1, K.s4 + 0.9));
    const pre = ramp(t, K.s3 - 0.1, tBom - 0.2) * (1 - emb) * 0.6;
    for (const k of ["top", "bot", "spot"]) {
      tmpC.copy(LIGHT[k]).lerp(DARK[k], Math.max(dark1, pre)).lerp(EMBER[k], emb);
      bgU[k].value.copy(tmpC);
    }
    const fl = t > tBom - 0.05 ? Math.exp(-(t - tBom) * 7) * (t < tBom + 1.2 ? 1 : 0) : 0;
    bgU.flash.value = fl;
    return { dark: Math.max(dark1, pre, emb), emb, fl };
  };
  const place = (C, v, t) => { C.G.position.set(v[0], v[1], v[2]); C.G.rotation.set(v[3], v[4], v[5], "YXZ"); };

  return (t) => {
    const env = setBG(t);
    // camera
    const c = camT(t);
    const shake = env.fl * 0.04;
    cam.position.set(c[0] + Math.sin(t * 61) * shake, c[1] + Math.sin(t * 47) * shake, c[2]);
    tg.set(c[3], c[4], c[5]); cam.lookAt(tg);
    // lights follow the target: key front-right-high, cool rim behind-left
    key.position.set(tg.x + 4, tg.y + 6, tg.z + 6); key.target.position.copy(tg);
    rim.position.set(tg.x - 5, tg.y + 3, tg.z - 4); rim.target.position.copy(tg);
    rim.color.setHex(0xbfd6ff).lerp(new THREE.Color(0xff8a3c), env.emb);
    rim.intensity = 1.4 + 0.8 * env.dark;
    key.intensity = 1.6 + 2.0 * env.fl;
    floor.material.opacity = 0.22 * (1 - env.dark * 0.6);

    // hero
    const hv = hero(t);
    let spin = 0;
    if (t < K.s4) spin = 2 * PI * smooth((t - K.s2) / (A("s2:Salah") - K.s2)) + (t < K.s2 ? 0.12 * Math.sin(t * 0.8) : 0);
    hv[4] += spin;
    place(H, hv, t);
    H.setMelt(meltAt(t));
    const [mode, gt, br] = heroLCD(t);
    H.drawLCD(mode, gt, br);
    H.scrM.emissiveIntensity = 0.55 + 0.45 * (1 - env.emb) * env.dark;
    H.ledM.color.setRGB(...(mode === "off" ? [0.25, 0.05, 0.05] : [4.0 * br, 0.4, 0.35]));
    H.cart.position.set(0, cartY(t), -0.07);
    H.cart.visible = H.cart.position.y < 2.0;
    const press = (a) => Math.exp(-(((t - a) / 0.12) ** 2));
    H.pills[0].position.z = 0.155 + H.pills[0].position.z * 0 - 0.025 * press(A("s5:Select"));
    H.pills[1].position.z = 0.155 - 0.025 * press(A("s5:Start"));
    if (meltAt(t) > 0.001) { H.pills[0].position.z += 0; }
    // fire light under hero during the bomb
    fire.position.set(hv[0] + 0.4, 0.4, hv[2] + 0.9);
    fire.intensity = env.emb * (6 + 3 * Math.sin(t * 13) * Math.sin(t * 7.3)) * (1 - ramp(t, K.s3e - 0.3, K.s4 + 0.6)) + env.fl * 30;

    // replacement
    const nv = neu(t);
    Nw.G.visible = t > A("s6:mengirim") - 0.6;
    place(Nw, nv, t);
    Nw.drawLCD("game", t + 7, 1);
    Nw.ledM.color.setRGB(4.0, 0.4, 0.35);
    const tg0 = A("s6:hadiah") - 0.2, tu = back(clamp01((t - tg0) / 0.4), 2.2);
    tag.visible = t > tg0; tag.scale.setScalar(Math.max(0.01, tu));
    tagPiv.rotation.z = 0.35 * Math.exp(-(t - tg0) * 1.6) * Math.sin((t - tg0) * 7) * (t > tg0 ? 1 : 0);

    // medic / barracks panel
    const pin = ramp(t, A("s2:Stephan") - 0.5, A("s2:Stephan") + 0.4), pout = ramp(t, K.s3e - 0.6, K.s4 + 0.4);
    SP.visible = pin > 0.01 && pout < 0.99;
    SP.scale.set(1, Math.max(0.01, eout(pin) * (1 - pout)), 1);
    const bx = ramp(t, tBom - 0.15, tBom + 0.35);
    barM.opacity = bx; silM.opacity = 1 - bx * 0.9; plate.visible = bx < 0.5;

    // particles
    const eo = env.emb * (1 - ramp(t, K.s3e, K.s4 + 0.7));
    em.m.opacity = eo; em.P.visible = eo > 0.01;
    if (em.P.visible) for (let i = 0; i < EMB; i++) { const b = eb[i], u = (b[2] + t * b[3]) % 1; em.pos[i * 3] = hv[0] + b[0] + 0.15 * Math.sin(t * 2 + b[4]); em.pos[i * 3 + 1] = 0.1 + u * 2.6; em.pos[i * 3 + 2] = hv[2] + b[1] + 0.1 * Math.cos(t * 1.7 + b[4]); }
    em.commit();
    const so = Math.max(eo * 0.45, (1 - ramp(t, K.s2 - 0.6, K.s2)) * 0.22);
    sm.m.opacity = so; sm.P.visible = so > 0.01;
    if (sm.P.visible) for (let i = 0; i < SMK; i++) { const b = sb[i], u = (b[2] + t * b[3]) % 1; sm.pos[i * 3] = hv[0] + b[0] * (1 + u); sm.pos[i * 3 + 1] = 0.5 + u * 2.4; sm.pos[i * 3 + 2] = hv[2] + b[1] - 0.4; }
    sm.commit();

    // mailer box lid + stamp
    const lc = ramp(t, A("s4:berharap") - 0.2, A("s4:berharap") + 0.5), lo = ramp(t, K.s5 - 0.1, K.s5 + 0.5);
    lid.rotation.x = -2.05 * (1 - lc + lo * 1);
    const st = ramp(t, A("s4:diganti") - 0.1, A("s4:diganti") + 0.12);
    stampL.visible = st > 0.01 && lo < 0.3; stampL.scale.setScalar(lerp(1.8, 1, st)); stampL.material.opacity = st;

    // bench
    const on5 = t > tMenyala;
    mmScrM.map = on5 ? mmOn : mmOff;
    const nU = back(clamp01((t - A("s5:tertolong") + 0.3) / 0.35), 2);
    note.visible = nU > 0.01; note.scale.setScalar(Math.max(0.01, nU));
    noteM.map = t > A("s5:masih") ? noteB : noteA;
    const prv = t > A("s5:menilai") && t < K.s6 + 0.7; prR.visible = prB.visible = prv;

    // magazine highlight
    hiM.opacity = ramp(t, A("s6:edisi") - 0.1, A("s6:edisi") + 0.3) * (0.7 + 0.3 * Math.sin(t * 5));
    hi.visible = hiM.opacity > 0.01;

    // museum glass, spotlight, crate lid
    const gd = ramp(t, tDipajang + 0.2, tDipajang + 1.1), gu = ramp(t, tTahun - 0.2, tTahun + 0.5);
    GL.position.set(0, 2.38 + 3.2 * (1 - gd) + 3.2 * gu, 0);
    const sl = ramp(t, A("s7:toko") - 0.2, A("s7:toko") + 0.5) * (1 - ramp(t, tTahun, tTahun + 0.6));
    spot.intensity = 26 * sl; coneM.opacity = 0.13 * sl; cone.visible = sl > 0.01;
    const cl2 = ramp(t, A("s7:kantor") - 0.3, A("s7:kantor") + 0.35);
    clid.rotation.x = -1.9 * (1 - cl2);

    comp.render();
  };
}
