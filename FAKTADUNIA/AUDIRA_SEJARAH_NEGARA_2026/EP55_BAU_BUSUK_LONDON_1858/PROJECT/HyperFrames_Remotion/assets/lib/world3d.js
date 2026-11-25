// EP55 INNERWORKS: the Great Stink, London 1858, as a cutaway model of the Thames bank.
// One diorama block on a dark studio table. The river runs into depth (−z = downstream, east). The front face
// (z = 0) is a cross-section: soil strata, the brown river in section, old sewers, a cesspit leaking toward the
// Broad Street well, and later Bazalgette's egg-shaped intercepting sewer inside the new embankment.
// North bank (x<0): a generic Gothic parliament (not a copy) with river-side curtains; terraced houses; a pumping
// station with a rocking beam engine. South bank (x>0): houses and the hand pump. Stink = greenish heat-haze ribbons.
// Stations (pure function of t, keyed to word anchors):
//   s1  hook: the parliament tower beside the steaming brown river, stink ribbons curling into the windows
//   s2  high establishing; houses multiply (1 → 3 juta); old outfalls pour sewage into the Thames
//   s3  low over the river inside the miasma; cholera 1831
//   s4  the hand pump: section shows cesspit leaking into the well water; the handle is lifted off
//   s5  July heat: the river bubbles, ribbons thicken and lean into the parliament; curtains soaked in lime chloride
//   s6  a bill floats up beside the tower and gets stamped; a stack of sovereigns rises (£3 juta)
//   s7  the embankment rises out of the river with the egg sewer inside; x-ray network lights up; pumps rock; river clears
//   s8  pull back to the whole model on its plinth (AUDIRA plaque); clean river, sewer still flowing
const FONTS = ['900 80px "Playfair Display"', '900 80px Archivo', '800 80px Archivo', '700 80px "IBM Plex Mono"'];
if (document.fonts && document.fonts.load) {
  try { await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "AUDIRA 1858 SUNGAI"))), new Promise((r) => setTimeout(r, 15000))]); } catch (e) { /* fallback */ }
}

import * as THREE from "./three.module.js";
import { mulberry, clamp01, smooth, back, canvasTex, stage, pts, envStrips } from "./lib3d.js";

const V3 = THREE.Vector3;
const SANS = 'Archivo, "Segoe UI", sans-serif', MONO = '"IBM Plex Mono", Consolas, monospace', SERIF = '"Playfair Display", Georgia, serif';

// monotone Hermite through time keys [t, ...values], never overshoots
function track(keys) {
  keys = keys.slice().sort((a, b) => a[0] - b[0]);
  const n = keys.length;
  const tan = keys.map((k, i) => k.map((v, j) => {
    if (j === 0 || i === 0 || i === n - 1) return 0;
    const a = keys[i - 1], b = keys[i + 1], d0 = (v - a[j]) / Math.max(0.001, k[0] - a[0]), d1 = (b[j] - v) / Math.max(0.001, b[0] - k[0]);
    return d0 * d1 <= 0 ? 0 : 2 / (1 / d0 + 1 / d1);
  }));
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0; while (keys[i + 1][0] < t) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1[0] - k0[0], u = (t - k0[0]) / h, u2 = u * u, u3 = u2 * u;
    return k0.slice(1).map((_, jj) => { const j = jj + 1; return (2 * u3 - 3 * u2 + 1) * k0[j] + (u3 - 2 * u2 + u) * h * tan[i][j] + (-2 * u3 + 3 * u2) * k1[j] + (u3 - u2) * h * tan[i + 1][j]; });
  };
}
const win = (t, a, b, fi = 0.35, fo = 0.35) => Math.min(clamp01((t - a) / fi), 1 - clamp01((t - b) / fo));
const hsh = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

// ---------- model dimensions ----------
const X0 = -12, X1 = 12, YB = -10, ZB = -60;          // block extents
const RL = -3, RR = 7, BED = -4.2, WL = -1.0;          // river: left wall, right wall, bed, water level
const EMB = -0.4;                                      // new embankment edge (1860s)
const EGG = { x: -1.7, y: -2.35 };                     // intercepting sewer centre in section
const eggPts = (sx = 1, cx = EGG.x, cy = EGG.y, n = 40) => {
  const P = [];
  for (let i = 0; i < n; i++) {
    const th = (i / n) * Math.PI * 2, s = Math.sin(th), c = Math.cos(th);
    const a = 0.72 * (s < 0 ? 1 - 0.38 * -s : 1);
    P.push([cx + c * a * sx, cy + (s > 0 ? 0.78 * s : 1.18 * s) * sx]);
  }
  return P;
};

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x0a1a1e, exp: 1.0, bloom: [0.08, 0.35, 0.95], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  envStrips(r, scene, [
    [14, 6, 0xffe2c4, 3.0, 8, 10, 6], [10, 3, 0xffa45c, 2.0, 12, 3, -4], [10, 4, 0x7fd6d0, 0.6, -12, 5, -6],
    [20, 2, 0xd8f0ee, 1.2, 0, 1, 12], [20, 20, 0x10262a, 0.8, 0, -10, 0]], 0x0b1416);
  scene.environmentIntensity = 0.55;
  scene.background = null;
  scene.fog = new THREE.FogExp2(0x0e2428, 0.0065);
  cam.near = 0.2; cam.far = 1600; cam.updateProjectionMatrix();

  // ---------- studio dome: teal top, warm haze horizon ----------
  const skyU = { uTop: { value: new THREE.Color(0x06171b) }, uHor: { value: new THREE.Color(0x2c4a4a) }, uSun: { value: new THREE.Color(0xffa860) }, uSunDir: { value: new V3(0.6, 0.25, 0.4).normalize() } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform vec3 uTop,uHor,uSun,uSunDir; varying vec3 vD; void main(){ float h = clamp(vD.y*0.5+0.5,0.0,1.0); vec3 c = mix(uHor,uTop,smoothstep(0.42,1.0,h)); c = mix(c*0.35,c,smoothstep(0.2,0.5,h)); float s = max(dot(normalize(vD),uSunDir),0.0); c += uSun*pow(s,6.0)*0.22; gl_FragColor = vec4(c,1.0); }",
  }));
  sky.renderOrder = -10; scene.add(sky);

  // ---------- lights: warm orange key, teal fill/rim, soft front light for the section face ----------
  const hemi = new THREE.HemisphereLight(0x7aa4a4, 0x3a2618, 0.7); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffc08a, 2.5);
  sun.position.set(34, 42, 26); sun.target.position.set(0, 0, -26);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 5, far: 160 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);
  const rim = new THREE.DirectionalLight(0x7fe0e8, 1.1); rim.position.set(-30, 22, -80); scene.add(rim);
  const front = new THREE.DirectionalLight(0xfff0e0, 0.55); front.position.set(-6, 4, 40); front.target.position.set(0, -4, 0); scene.add(front, front.target);

  const add = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const std = (color, rough = 0.6, metal = 0, ex = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...ex });
  const basic = (o = {}) => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, ...o });

  // ---------- text plates (billboards) ----------
  const labels = [];
  function plate(text, { font = SANS, weight = 900, h = 1, color = "#F1E8D8", bg = "rgba(6,18,22,.86)", bd = "#E9A84C", pad = 0.4 } = {}) {
    const CH = 160, fpx = Math.round(CH * 0.56);
    const mc = document.createElement("canvas").getContext("2d"); mc.font = `${weight} ${fpx}px ${font}`;
    const tw = mc.measureText(text).width, CW = Math.ceil(tw + CH * pad * 2);
    const tex = canvasTex(CW, CH, (g, w, hh) => {
      g.clearRect(0, 0, w, hh);
      if (bg) { g.fillStyle = bg; g.beginPath(); g.roundRect(4, 4, w - 8, hh - 8, 14); g.fill(); if (bd) { g.strokeStyle = bd; g.lineWidth = 6; g.stroke(); } }
      g.font = `${weight} ${fpx}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillStyle = color; g.fillText(text, w / 2, hh / 2 + 4);
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(h * CW / CH, h), basic({ map: tex, fog: false, toneMapped: false, depthTest: false }));
    m.renderOrder = 9; m.visible = false; scene.add(m); labels.push(m);
    return m;
  }
  const showLab = (m, k, pos, s = 1) => { m.visible = k > 0.003; if (!m.visible) return; m.material.opacity = Math.min(1, k * 1.5); m.position.copy(pos); m.quaternion.copy(cam.quaternion); m.scale.setScalar(Math.max(0.001, s * (0.6 + 0.4 * back(clamp01(k))))); };
  // leader dot + line from label to target
  const leadM = new THREE.LineBasicMaterial({ color: 0xe9a84c, transparent: true, depthTest: false, toneMapped: false });
  const leads = [];
  function leader() { const g = new THREE.BufferGeometry().setFromPoints([new V3(), new V3()]); const l = new THREE.Line(g, leadM.clone()); l.renderOrder = 8; l.visible = false; scene.add(l); leads.push(l); return l; }
  const showLead = (l, k, a, b) => { l.visible = k > 0.01; if (!l.visible) return; const p = l.geometry.attributes.position; p.setXYZ(0, a.x, a.y, a.z); p.setXYZ(1, b.x, b.y, b.z); p.needsUpdate = true; l.material.opacity = k; };

  // ================= TEXTURES =================
  const noise = (g, w, h, n, seed, cols, sz = [1, 4]) => { const q = mulberry(seed); for (let i = 0; i < n; i++) { g.fillStyle = cols[Math.floor(q() * cols.length)]; const s = sz[0] + q() * (sz[1] - sz[0]); g.fillRect(q() * w, q() * h, s, s * (0.5 + q())); } };
  // section face: mapped by shape coords, u=(x+12)/24, v=(y+10)/10 (canvas top = y 0)
  const SW = 2048, SH = 860;
  const sx = (x) => ((x - X0) / (X1 - X0)) * SW, sy = (y) => (-y / -YB) * SH;
  const strataT = canvasTex(SW, SH, (g, w, h) => {
    const band = (y0, y1, c) => { g.fillStyle = c; g.fillRect(0, sy(y0), w, sy(y1) - sy(y0)); };
    band(0, -0.55, "#4A3424"); band(-0.55, -1.9, "#6E4F33"); band(-1.9, -3.4, "#86643F"); band(-3.4, -5.6, "#8C8166"); band(-5.6, -10, "#3E4A4B");
    noise(g, w, sy(-0.55), 2500, 3, ["rgba(30,20,12,.5)", "rgba(110,80,50,.4)"]);
    noise(g, w, h, 9000, 5, ["rgba(40,26,16,.18)", "rgba(200,170,120,.12)", "rgba(0,0,0,.12)"]);
    // gravel aquifer: pebbles
    const q = mulberry(7);
    for (let i = 0; i < 1600; i++) { const x = q() * w, y = sy(-3.45) + q() * (sy(-5.55) - sy(-3.45)), rr = 2 + q() * 6; g.fillStyle = q() < 0.5 ? "rgba(170,160,135,.8)" : "rgba(95,88,70,.8)"; g.beginPath(); g.ellipse(x, y, rr * 1.3, rr, q() * 3, 0, 6.3); g.fill(); }
    // groundwater tint in the gravel
    const gw = g.createLinearGradient(0, sy(-3.4), 0, sy(-5.6)); gw.addColorStop(0, "rgba(70,140,150,.08)"); gw.addColorStop(1, "rgba(70,140,150,.32)"); g.fillStyle = gw; g.fillRect(0, sy(-3.4), w, sy(-5.6) - sy(-3.4));
    // London clay: section hatch
    g.strokeStyle = "rgba(120,150,150,.22)"; g.lineWidth = 3; for (let x = -h; x < w; x += 26) { g.beginPath(); g.moveTo(x, sy(-5.6)); g.lineTo(x + (h - sy(-5.6)), h); g.stroke(); }
    // layer boundaries + cut outline (engineering drawing)
    g.fillStyle = "rgba(10,10,8,.35)"; for (const y of [-0.55, -1.9, -3.4, -5.6]) g.fillRect(0, sy(y) - 1.5, w, 3);
    g.fillStyle = "#E9A84C"; g.fillRect(0, 0, w, 7); g.fillRect(0, h - 6, w, 6); g.fillRect(0, 0, 6, h); g.fillRect(w - 6, 0, 6, h);
    // depth ticks on the left edge
    g.fillStyle = "rgba(233,168,76,.85)"; for (let y = 0; y >= -10; y -= 1) g.fillRect(6, sy(y) - 2, y % 5 === 0 ? 40 : 22, 4);
  });
  strataT.wrapS = strataT.wrapT = THREE.RepeatWrapping; strataT.repeat.set(1 / (X1 - X0), 1 / -YB); strataT.offset.set(-X0 / (X1 - X0), 1);

  const cobT = canvasTex(512, 512, (g, w) => { g.fillStyle = "#5B544C"; g.fillRect(0, 0, w, w); const q = mulberry(21); for (let y = 0; y < w; y += 16) for (let x = (y / 16 % 2) * 12; x < w; x += 24) { const v = 0.7 + q() * 0.5; g.fillStyle = `rgb(${Math.round(110 * v)},${Math.round(100 * v)},${Math.round(88 * v)})`; g.fillRect(x + 1, y + 1, 22, 14); } }, [3, 18]);
  const houseT = canvasTex(128, 128, (g, w) => {
    g.fillStyle = "#e8e0d4"; g.fillRect(0, 0, w, w);
    const q = mulberry(31); for (let y = 0; y < w; y += 6) for (let x = (y / 6 % 2) * 6; x < w; x += 12) { const v = 0.82 + q() * 0.25; g.fillStyle = `rgba(${Math.round(150 * v)},${Math.round(120 * v)},${Math.round(100 * v)},.35)`; g.fillRect(x, y, 11, 5); }
    for (const yy of [22, 70]) for (const xx of [18, 74]) { g.fillStyle = "#f3eee6"; g.fillRect(xx - 3, yy - 3, 42, 36); g.fillStyle = "#1c2a2e"; g.fillRect(xx, yy, 36, 30); g.fillStyle = "#f3eee6"; g.fillRect(xx + 16, yy, 3, 30); g.fillRect(xx, yy + 14, 36, 3); }
  });
  const slateT = canvasTex(128, 128, (g, w) => { g.fillStyle = "#3a4548"; g.fillRect(0, 0, w, w); for (let y = 0; y < w; y += 8) { g.fillStyle = "rgba(10,16,18,.6)"; g.fillRect(0, y, w, 1.5); for (let x = (y / 8 % 2) * 6; x < w; x += 12) g.fillRect(x, y, 1.2, 8); } });
  // gothic bay: 256 px = 1.6 m wide, 880 px = 5.5 m tall; windows centred at y 3.8 and 1.6
  const bayT = canvasTex(256, 880, (g, w, h) => {
    g.fillStyle = "#D2B686"; g.fillRect(0, 0, w, h);
    noise(g, w, h, 1800, 41, ["rgba(120,90,50,.12)", "rgba(255,240,200,.1)"]);
    g.fillStyle = "rgba(90,66,36,.25)"; for (let y = 0; y < h; y += 22) g.fillRect(0, y, w, 1.5);
    g.fillStyle = "#BFA071"; g.fillRect(0, 0, 26, h); g.fillRect(w - 26, 0, 26, h);
    g.fillStyle = "rgba(255,240,210,.35)"; g.fillRect(4, 0, 6, h); g.fillStyle = "rgba(60,40,20,.35)"; g.fillRect(20, 0, 6, h);
    for (const yc of [(5.5 - 3.8) / 5.5, (5.5 - 1.6) / 5.5]) {
      const cy = yc * h, ww = 100, hh = 210, x0 = w / 2 - ww / 2, y0 = cy - hh / 2;
      g.fillStyle = "#A88A5C"; g.beginPath(); g.moveTo(x0 - 10, y0 + hh + 8); g.lineTo(x0 - 10, y0 + 40); g.quadraticCurveTo(x0 - 10, y0 - 34, w / 2, y0 - 50); g.quadraticCurveTo(x0 + ww + 10, y0 - 34, x0 + ww + 10, y0 + 40); g.lineTo(x0 + ww + 10, y0 + hh + 8); g.fill();
      const gl = g.createLinearGradient(0, y0, 0, y0 + hh); gl.addColorStop(0, "#2a4a50"); gl.addColorStop(1, "#0f1d20");
      g.fillStyle = gl; g.beginPath(); g.moveTo(x0, y0 + hh); g.lineTo(x0, y0 + 40); g.quadraticCurveTo(x0, y0 - 22, w / 2, y0 - 36); g.quadraticCurveTo(x0 + ww, y0 - 22, x0 + ww, y0 + 40); g.lineTo(x0 + ww, y0 + hh); g.fill();
      g.fillStyle = "#B99B6A"; g.fillRect(w / 2 - 3, y0 - 30, 6, hh + 30); g.fillRect(x0, y0 + hh * 0.45, ww, 5);
    }
    g.fillStyle = "#B49566"; g.fillRect(0, h * 0.5 - 6, w, 12); g.fillRect(0, 0, w, 22);
  }, [1, 1]);
  const towerT = canvasTex(256, 1024, (g, w, h) => {
    g.fillStyle = "#D6BA8A"; g.fillRect(0, 0, w, h); noise(g, w, h, 2400, 43, ["rgba(120,90,50,.12)", "rgba(255,240,200,.1)"]);
    for (let x = 0; x < w; x += 64) { g.fillStyle = "#BFA071"; g.fillRect(x, 0, 10, h); g.fillStyle = "rgba(60,40,20,.3)"; g.fillRect(x + 10, 0, 3, h); }
    for (let y = 40; y < h; y += 120) for (let x = 20; x < w; x += 64) { g.fillStyle = "#24393c"; g.beginPath(); g.moveTo(x, y + 80); g.lineTo(x, y + 18); g.quadraticCurveTo(x + 17, y - 6, x + 34, y + 18); g.lineTo(x + 34, y + 80); g.fill(); }
    g.fillStyle = "rgba(90,66,36,.3)"; for (let y = 0; y < h; y += 120) g.fillRect(0, y, w, 6);
  }, [1, 1]);
  const clockT = canvasTex(256, 256, (g, w) => {
    g.fillStyle = "#2a3436"; g.fillRect(0, 0, w, w); g.fillStyle = "#C9A35A"; g.fillRect(8, 8, w - 16, w - 16);
    g.fillStyle = "#F4EEDC"; g.beginPath(); g.arc(w / 2, w / 2, 100, 0, 6.3); g.fill();
    g.strokeStyle = "#1a1a1a"; g.lineWidth = 6; g.stroke();
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; g.fillStyle = "#1a1a1a"; g.save(); g.translate(w / 2 + Math.sin(a) * 84, w / 2 - Math.cos(a) * 84); g.rotate(a); g.fillRect(-3, -9, 6, 18); g.restore(); }
  });
  const waterFaceT = canvasTex(256, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#c9a070"); gr.addColorStop(0.5, "#8e6a3f"); gr.addColorStop(0.86, "#5a3f22"); gr.addColorStop(1, "#2e2010");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    noise(g, w, h, 1400, 51, ["rgba(60,40,20,.5)", "rgba(220,190,140,.3)", "rgba(30,24,10,.4)"], [1, 5]);
    g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(0, 0, w, 6);
  });
  const flowT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#6a4a26"; g.fillRect(0, 0, w, w); const q = mulberry(61); for (let i = 0; i < 90; i++) { g.fillStyle = q() < 0.5 ? "rgba(200,160,100,.45)" : "rgba(40,26,10,.5)"; g.fillRect(q() * w, q() * w, 3 + q() * 6, 20 + q() * 60); } }, [1, 6]);
  const dashT = canvasTex(64, 256, (g, w, h) => { g.clearRect(0, 0, w, h); for (let y = 0; y < h; y += 64) { const gr = g.createLinearGradient(0, y, 0, y + 64); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.7, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,.2)"); g.fillStyle = gr; g.fillRect(0, y, w, 64); } }, [1, 8]);

  // ================= TABLE, PLINTH, AUDIRA PLAQUE =================
  const woodT = canvasTex(1024, 1024, (g, w) => { g.fillStyle = "#2a1a12"; g.fillRect(0, 0, w, w); const q = mulberry(71); for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(${q() < 0.5 ? "70,44,28" : "20,12,8"},.45)`; g.lineWidth = 1 + q() * 3; const y = q() * w; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + (q() - 0.5) * 30, w * 0.7, y + (q() - 0.5) * 30, w, y + (q() - 0.5) * 20); g.stroke(); } }, [6, 6]);
  const table = add(new THREE.PlaneGeometry(400, 400), std(0xffffff, 0.55, 0, { map: woodT }), 0, YB - 1.4, -30); table.rotation.x = -Math.PI / 2; table.castShadow = false;
  add(new THREE.BoxGeometry(X1 - X0 + 1.4, 1.4, -ZB + 1.4), std(0x1b1410, 0.45, 0.1), 0, YB - 0.7, ZB / 2);
  {
    const pT = canvasTex(1400, 220, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#E8C27A"); gr.addColorStop(0.5, "#B98A3E"); gr.addColorStop(1, "#8A6224"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = "#5a3e14"; g.lineWidth = 8; g.strokeRect(12, 12, w - 24, h - 24);
      g.fillStyle = "#2a1c08"; g.font = `900 112px ${SERIF}`; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("AUDIRA", 54, h * 0.52);
      g.font = `700 40px ${MONO}`; g.fillText("MODEL POTONGAN · SUNGAI THAMES, LONDON 1858", 520, h * 0.38);
      g.font = `500 32px ${MONO}`; g.fillText("skala tidak sebenarnya · ilustrasi", 520, h * 0.7);
      for (const x of [34, w - 34]) { g.fillStyle = "#5a3e14"; g.beginPath(); g.arc(x, h / 2, 9, 0, 6.3); g.fill(); }
    });
    const pl = add(new THREE.BoxGeometry(11, 1.73, 0.08), [std(0x8a6224, 0.3, 0.9), std(0x8a6224, 0.3, 0.9), std(0x8a6224, 0.3, 0.9), std(0x8a6224, 0.3, 0.9), std(0xffffff, 0.32, 0.75, { map: pT }), std(0x8a6224, 0.3, 0.9)], 0, YB - 0.7, 0.74);
    pl.castShadow = false;
  }

  // ================= GROUND (extruded section) =================
  function profile(withPockets) {
    const s = new THREE.Shape();
    s.moveTo(X0, YB); s.lineTo(X1, YB); s.lineTo(X1, 0); s.lineTo(RR, 0); s.lineTo(RR, BED + 0.3); s.lineTo(RR - 0.5, BED); s.lineTo(RL + 0.5, BED); s.lineTo(RL, BED + 0.3); s.lineTo(RL, 0); s.lineTo(X0, 0); s.closePath();
    const circ = (x, y, rr) => { const p = new THREE.Path(); p.absarc(x, y, rr, 0, Math.PI * 2, true); s.holes.push(p); };
    circ(-8.2, -1.5, 0.42); circ(-5.4, -1.15, 0.32); circ(9.0, -1.3, 0.3);
    if (withPockets) {
      const rect = (a, b, c, d) => { const p = new THREE.Path(); p.moveTo(a, b); p.lineTo(a, d); p.lineTo(c, d); p.lineTo(c, b); p.closePath(); s.holes.push(p); };
      rect(10.0, -2.5, 11.4, -0.35);   // cesspit
      rect(9.5, -5.4, 9.82, -0.1);     // well shaft
    }
    return s;
  }
  const capM = std(0xffffff, 0.92, 0, { map: strataT });
  const sideM = std(0x7a6a58, 0.9);
  const gFront = new THREE.ExtrudeGeometry(profile(true), { depth: 2.5, bevelEnabled: false, curveSegments: 18 }); gFront.translate(0, 0, -2.5);
  const gBack = new THREE.ExtrudeGeometry(profile(false), { depth: -ZB - 2.5, bevelEnabled: false, curveSegments: 18 }); gBack.translate(0, 0, ZB);
  add(gFront, [capM, sideM]); add(gBack, [capM, sideM]);
  // old sewer interiors (brick tubes) with sluggish brown flow
  const brickIn = std(0x5a2e22, 0.85, 0, { side: THREE.BackSide });
  for (const [x, y, rr] of [[-8.2, -1.5, 0.42], [-5.4, -1.15, 0.32], [9.0, -1.3, 0.3]]) {
    const tb = add(new THREE.CylinderGeometry(rr, rr, -ZB, 16, 1, true), brickIn, x, y, ZB / 2); tb.rotation.x = Math.PI / 2; tb.castShadow = false;
    const f = add(new THREE.PlaneGeometry(rr * 1.5, -ZB), std(0x5a3c1e, 0.35), x, y - rr * 0.5, ZB / 2); f.rotation.x = -Math.PI / 2; f.castShadow = false;
  }
  // cobbled tops of both banks
  for (const [a, b] of [[X0, RL], [RR, X1]]) { const c = add(new THREE.PlaneGeometry(b - a, -ZB), std(0xffffff, 0.85, 0, { map: cobT }), (a + b) / 2, 0.012, ZB / 2); c.rotation.x = -Math.PI / 2; c.castShadow = false; }
  // cesspit contents, well pipe and the leak plume (front pocket only)
  const cessM = std(0x4a3216, 0.4); add(new THREE.BoxGeometry(1.4, 1.5, 2.4), cessM, 10.7, -1.85, -1.25).castShadow = false;
  add(new THREE.BoxGeometry(1.4, 0.06, 2.4), std(0x2a2a26, 0.7), 10.7, -0.1, -1.25);
  const wellPipe = add(new THREE.CylinderGeometry(0.07, 0.07, 5.6, 10), std(0x343c3a, 0.4, 0.6), 9.66, -2.75, -1.2);
  const plumeT = canvasTex(512, 512, (g, w, h) => { g.clearRect(0, 0, w, h); const q = mulberry(81); for (let i = 0; i < 70; i++) { const t = i / 70, x = w * (0.85 - 0.55 * t) + (q() - 0.5) * 60, y = h * (0.18 + 0.62 * t) + (q() - 0.5) * 60, rr = 30 + q() * 50; const gr = g.createRadialGradient(x, y, 1, x, y, rr); gr.addColorStop(0, "rgba(70,44,14,.55)"); gr.addColorStop(1, "rgba(70,44,14,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); } });
  const plume = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 5.2), basic({ map: plumeT, opacity: 0 })); plume.position.set(10.2, -2.9, 0.015); plume.renderOrder = 2; scene.add(plume);

  // ================= RIVER =================
  const WSEG = [24, 110];
  const waterG = new THREE.PlaneGeometry(1, -ZB, WSEG[0], WSEG[1]); waterG.rotateX(-Math.PI / 2); waterG.translate(0.5, 0, ZB / 2);
  const wBase = waterG.attributes.position.array.slice();
  const waterM = new THREE.MeshPhongMaterial({ color: 0x5c4224, specular: 0x5a4a36, shininess: 38 });
  const water = new THREE.Mesh(waterG, waterM); water.receiveShadow = true; scene.add(water);
  const wfM = new THREE.MeshStandardMaterial({ map: waterFaceT, roughness: 0.5, transparent: true, opacity: 0.94 });
  const wface = new THREE.Mesh(new THREE.PlaneGeometry(1, WL - BED), wfM); wface.geometry.translate(0.5, (WL + BED) / 2, 0.02); scene.add(wface);
  const cMud = new THREE.Color(0x5c4224), cClean = new THREE.Color(0x2f5a5c), cFaceMud = new THREE.Color(0xffffff), cFaceClean = new THREE.Color(0x8fb8b4);
  function setWater(t, xw0, boil, clean) {
    const p = waterG.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) {
      const u = wBase[i], z = wBase[i + 2], x = xw0 + u * (RR - xw0);
      let y = 0.05 * Math.sin(0.55 * x + 0.5 * t + z * 0.12) + 0.04 * Math.sin(0.18 * z - 0.7 * t) + 0.03 * Math.sin(0.9 * x - 0.35 * z + 1.1 * t);
      if (boil > 0) y += boil * 0.06 * Math.sin(3.1 * x + 2.3 * t) * Math.sin(2.7 * z - 1.9 * t);
      p[i] = x; p[i + 1] = WL + y; p[i + 2] = z;
    }
    waterG.attributes.position.needsUpdate = true; waterG.computeVertexNormals();
    waterM.color.copy(cMud).lerp(cClean, clean); wfM.color.copy(cFaceMud).lerp(cFaceClean, clean);
    wface.position.x = xw0; wface.scale.x = RR - xw0;
  }

  // ================= OLD OUTFALLS (pipes from both walls) + JETS =================
  const pipeM = std(0x4a2c22, 0.7);
  const OUTF = [];
  for (let i = 0; i < 7; i++) { const z = -6 - i * 8; const p = add(new THREE.CylinderGeometry(0.3, 0.3, 0.8, 14, 1, true), pipeM, RL + 0.3, -0.55, z); p.rotation.z = Math.PI / 2; const tr = add(new THREE.TorusGeometry(0.3, 0.07, 8, 16), pipeM, RL + 0.7, -0.55, z); tr.rotation.y = Math.PI / 2; OUTF.push({ x: RL + 0.7, z, s: 1, ms: [p, tr] }); }
  for (let i = 0; i < 6; i++) { const z = -10 - i * 8.5; const p = add(new THREE.CylinderGeometry(0.26, 0.26, 0.8, 14, 1, true), pipeM, RR - 0.3, -0.5, z); p.rotation.z = Math.PI / 2; add(new THREE.TorusGeometry(0.26, 0.06, 8, 16), pipeM, RR - 0.7, -0.5, z).rotation.y = Math.PI / 2; OUTF.push({ x: RR - 0.7, z, s: -1 }); }
  const JN = 46;
  const JET = pts(scene, OUTF.length * JN, { color: 0x6a4618, size: 0.34, add: false, opacity: 0.95 });

  // ================= HOUSES (instanced; population grows) =================
  const HS = [];
  { const q = mulberry(91);
    const lot = (x0, x1, z0, z1) => { for (let z = z0; z > z1; z -= 2.3) for (let x = x0; x < x1 - 1.2; x += 2.1) { if (q() < 0.12) continue; HS.push({ x: x + 0.9 + (q() - 0.5) * 0.2, z: z - 1 + (q() - 0.5) * 0.2, w: 1.6 + q() * 0.4, d: 1.7 + q() * 0.4, h: 1.8 + Math.floor(q() * 3) * 0.75, rk: q(), c: q() }); } };
    lot(-11.8, -3.6, -33, -59.5); lot(7.4, 11.9, -4.6, -59.5); lot(-11.8, -8.6, -0.6, -6.2);
  }
  for (let i = HS.length - 1; i >= 0; i--) { const h = HS[i]; if (h.x < -3.4 && h.z < -40 && h.z > -56.5) HS.splice(i, 1); }
  const NH = HS.length;
  const hBody = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), std(0xffffff, 0.85, 0, { map: houseT }), NH);
  const roofShape = new THREE.Shape(); roofShape.moveTo(-0.55, 0); roofShape.lineTo(0.55, 0); roofShape.lineTo(0, 0.55); roofShape.closePath();
  const roofG = new THREE.ExtrudeGeometry(roofShape, { depth: 1, bevelEnabled: false }); roofG.translate(0, 0, -0.5);
  const hRoof = new THREE.InstancedMesh(roofG, std(0xffffff, 0.8, 0, { map: slateT }), NH);
  const hChim = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.6, 0.22).translate(0, 0.3, 0), std(0x6e3a2a, 0.9), NH);
  for (const m of [hBody, hRoof, hChim]) { m.castShadow = m.receiveShadow = true; scene.add(m); }
  const brickCols = [0x9c5a3c, 0xb46e48, 0x8a4e36, 0xc49a6c, 0xa86a4a].map((c) => new THREE.Color(c));
  HS.forEach((h, i) => hBody.setColorAt(i, brickCols[Math.floor(h.c * brickCols.length)]));
  const dmy = new THREE.Object3D();
  function setHouses(pop) {
    HS.forEach((h, i) => {
      const k = smooth((pop - h.rk * 0.94) * 12), s = Math.max(0.0001, k);
      dmy.position.set(h.x, 0, h.z); dmy.rotation.set(0, 0, 0); dmy.scale.set(h.w, h.h * s, h.d); dmy.updateMatrix(); hBody.setMatrixAt(i, dmy.matrix);
      dmy.position.set(h.x, h.h * s, h.z); dmy.scale.set(h.w * 1.08 / 1.1 * (s > 0.001 ? 1 : 0.0001), s * 1.2, h.d * 1.04); dmy.rotation.set(0, Math.PI / 2, 0);
      dmy.scale.set(h.d * 1.04 / 1.1 * (s > 0.001 ? 1 : 0.0001), s * 1.25, h.w * 1.04); dmy.updateMatrix(); hRoof.setMatrixAt(i, dmy.matrix);
      dmy.rotation.set(0, 0, 0); dmy.position.set(h.x + h.w * 0.3, h.h * s, h.z + h.d * 0.25); dmy.scale.setScalar(s); dmy.updateMatrix(); hChim.setMatrixAt(i, dmy.matrix);
    });
    hBody.instanceMatrix.needsUpdate = hRoof.instanceMatrix.needsUpdate = hChim.instanceMatrix.needsUpdate = true;
  }

  // ================= PARLIAMENT (generic Gothic, not a copy) =================
  const PX0 = -11, PX1 = -4.6, PZ0 = -30, PZ1 = -7, PH = 5.5;
  const stoneM = std(0xcdb184, 0.8);
  add(new THREE.BoxGeometry(PX1 - PX0, PH, PZ1 - PZ0), stoneM, (PX0 + PX1) / 2, PH / 2, (PZ0 + PZ1) / 2);
  { const t1 = bayT.clone(); t1.needsUpdate = true; t1.wrapS = THREE.RepeatWrapping; t1.repeat.set((PZ1 - PZ0) / 1.6, 1);
    const f = add(new THREE.PlaneGeometry(PZ1 - PZ0, PH), std(0xffffff, 0.78, 0, { map: t1 }), PX1 + 0.012, PH / 2, (PZ0 + PZ1) / 2); f.rotation.y = Math.PI / 2;
    const t2 = bayT.clone(); t2.needsUpdate = true; t2.wrapS = THREE.RepeatWrapping; t2.repeat.set((PX1 - PX0) / 1.6, 1);
    add(new THREE.PlaneGeometry(PX1 - PX0, PH), std(0xffffff, 0.78, 0, { map: t2 }), (PX0 + PX1) / 2, PH / 2, PZ1 + 0.012); }
  { const rs = new THREE.Shape(); rs.moveTo(-(PX1 - PX0) / 2, 0); rs.lineTo((PX1 - PX0) / 2, 0); rs.lineTo(0, 1.8); rs.closePath();
    const rg = new THREE.ExtrudeGeometry(rs, { depth: PZ1 - PZ0 - 0.4, bevelEnabled: false }); rg.translate((PX0 + PX1) / 2, PH, PZ0 + 0.2);
    add(rg, std(0xffffff, 0.7, 0.2, { map: slateT })); }
  const pinM = std(0xc7a777, 0.75), goldM = std(0xd8a84a, 0.3, 0.9);
  for (let z = PZ0 + 0.4; z <= PZ1; z += 1.6) for (const x of [PX0 + 0.1, PX1 - 0.1]) { add(new THREE.BoxGeometry(0.22, 0.6, 0.22), pinM, x, PH + 0.3, z); add(new THREE.ConeGeometry(0.13, 0.6, 4), pinM, x, PH + 0.9, z); }
  // terrace parapet on the river side
  add(new THREE.BoxGeometry(0.25, 0.5, PZ1 - PZ0 + 2), stoneM, RL + 0.12, 0.25, (PZ0 + PZ1) / 2);
  // clock tower at the front river corner
  const TW = 2.2, TX = -5.9, TZ = -5.2, TH = 12;
  { const tt = towerT.clone(); tt.needsUpdate = true; tt.wrapS = tt.wrapT = THREE.RepeatWrapping; tt.repeat.set(1, 2);
    add(new THREE.BoxGeometry(TW, TH, TW), std(0xffffff, 0.78, 0, { map: tt }), TX, TH / 2, TZ);
    add(new THREE.BoxGeometry(TW + 0.4, 0.3, TW + 0.4), pinM, TX, TH + 0.15, TZ);
    add(new THREE.BoxGeometry(TW + 0.2, 2.4, TW + 0.2), std(0xc9ad7e, 0.75), TX, TH + 1.5, TZ);
    add(new THREE.BoxGeometry(TW + 0.4, 0.3, TW + 0.4), pinM, TX, TH + 2.85, TZ);
    add(new THREE.BoxGeometry(TW - 0.2, 1.2, TW - 0.2), std(0x6f8a7a, 0.6, 0.3), TX, TH + 3.6, TZ);
    const sp = add(new THREE.ConeGeometry(TW * 0.82, 4, 4), std(0x3a4f50, 0.5, 0.4), TX, TH + 6.2, TZ); sp.rotation.y = Math.PI / 4;
    add(new THREE.ConeGeometry(0.12, 1.1, 6), goldM, TX, TH + 8.7, TZ);
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { add(new THREE.BoxGeometry(0.22, 1.2, 0.22), pinM, TX + dx * (TW / 2 + 0.05), TH + 3.6, TZ + dz * (TW / 2 + 0.05)); add(new THREE.ConeGeometry(0.14, 0.7, 4), goldM, TX + dx * (TW / 2 + 0.05), TH + 4.5, TZ + dz * (TW / 2 + 0.05)); } }
  const HANDS = [];
  for (const [nx, nz, ry] of [[0, 1, 0], [1, 0, Math.PI / 2], [0, -1, Math.PI], [-1, 0, -Math.PI / 2]]) {
    const f = add(new THREE.PlaneGeometry(1.9, 1.9), std(0xffffff, 0.5, 0, { map: clockT, emissive: 0x332a18, emissiveIntensity: 0.4 }), TX + nx * (TW / 2 + 0.115), TH + 1.5, TZ + nz * (TW / 2 + 0.115)); f.rotation.y = ry; f.castShadow = false;
    const hm = std(0x161616, 0.5);
    const hh = new THREE.Group(); hh.position.copy(f.position).add(new V3(nx * 0.02, 0, nz * 0.02)); hh.rotation.y = ry; scene.add(hh);
    const mh = new THREE.Group(), hr = new THREE.Group(); hh.add(mh, hr);
    add(new THREE.BoxGeometry(0.05, 0.62, 0.02).translate(0, 0.28, 0), hm, 0, 0, 0, mh); add(new THREE.BoxGeometry(0.07, 0.42, 0.02).translate(0, 0.19, 0), hm, 0, 0, 0, hr);
    HANDS.push({ mh, hr });
  }
  // back tower + central lantern spire
  { const tt = towerT.clone(); tt.needsUpdate = true; tt.wrapS = tt.wrapT = THREE.RepeatWrapping; tt.repeat.set(1.4, 2.2);
    add(new THREE.BoxGeometry(3.2, 12.5, 3.2), std(0xffffff, 0.78, 0, { map: tt }), -8.2, 6.25, -28);
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { add(new THREE.BoxGeometry(0.4, 1.8, 0.4), pinM, -8.2 + dx * 1.55, 13.3, -28 + dz * 1.55); add(new THREE.ConeGeometry(0.24, 1.1, 4), goldM, -8.2 + dx * 1.55, 14.7, -28 + dz * 1.55); }
    add(new THREE.CylinderGeometry(0.8, 0.9, 3.2, 8), std(0xc9ad7e, 0.75), -7.8, PH + 1.6, -17.5); add(new THREE.ConeGeometry(0.85, 4, 8), std(0x3a4f50, 0.5, 0.4), -7.8, PH + 5.2, -17.5); }
  // curtains in the river-facing windows (pleated cloth, soaked later)
  const curG = new THREE.PlaneGeometry(0.56, 1.25, 10, 1);
  { const p = curG.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.05 * Math.sin(p.getX(i) * 34)); curG.computeVertexNormals(); }
  const curM = std(0xf0e6cc, 0.95, 0, { side: THREE.DoubleSide });
  const nBay = Math.floor((PZ1 - PZ0) / 1.6);
  const CUR = new THREE.InstancedMesh(curG, curM, nBay * 2); CUR.castShadow = false; scene.add(CUR);
  { let k = 0; for (let b = 0; b < nBay; b++) for (const y of [3.8, 1.6]) { dmy.position.set(PX1 + 0.04, y - 0.05, PZ0 + (b + 0.5) * ((PZ1 - PZ0) / ((PZ1 - PZ0) / 1.6)) ); dmy.rotation.set(0, Math.PI / 2, 0); dmy.scale.set(1, 1, 1); dmy.updateMatrix(); CUR.setMatrixAt(k++, dmy.matrix); } }
  const cDry = new THREE.Color(0xf0e6cc), cWet = new THREE.Color(0xa9b89a);
  const DRIP = pts(scene, 240, { color: 0xc8d8b0, size: 0.09, add: false, opacity: 0.9 });

  // ================= BROAD STREET HAND PUMP + DOCTOR FIGURE =================
  const ironM = std(0x24302c, 0.42, 0.55);
  const PUMP = new THREE.Group(); PUMP.position.set(9.66, 0, -1.2); scene.add(PUMP);
  add(new THREE.CylinderGeometry(0.75, 0.8, 0.12, 20), std(0x6a645a, 0.9), 0, 0.06, 0, PUMP);
  add(new THREE.BoxGeometry(0.5, 0.25, 0.5), ironM, 0, 0.24, 0, PUMP);
  add(new THREE.CylinderGeometry(0.15, 0.19, 1.55, 14), ironM, 0, 1.1, 0, PUMP);
  add(new THREE.SphereGeometry(0.2, 14, 10, 0, 6.3, 0, 1.6), ironM, 0, 1.88, 0, PUMP);
  add(new THREE.SphereGeometry(0.07, 10, 8), goldM, 0, 2.1, 0, PUMP);
  const spout = add(new THREE.CylinderGeometry(0.05, 0.06, 0.5, 10), ironM, -0.3, 1.25, 0, PUMP); spout.rotation.z = Math.PI / 2 - 0.4;
  const HND = new THREE.Group(); HND.position.set(0.12, 1.7, 0); PUMP.add(HND);
  add(new THREE.BoxGeometry(1.0, 0.07, 0.07).translate(0.5, 0, 0), ironM, 0, 0, 0, HND);
  add(new THREE.SphereGeometry(0.06, 8, 6), ironM, 1.0, 0, 0, HND);
  HND.rotation.z = -0.35;
  function person({ coat, trousers, skin, hat }) {
    const G = new THREE.Group(); const ad = (geo, mat, x = 0, y = 0, z = 0, p = G) => add(geo, mat, x, y, z, p);
    const cM = std(coat, 0.85), tM = std(trousers, 0.85), sM = std(skin, 0.6), hM = std(hat, 0.5, 0.1), eM = std(0x111111, 0.3);
    const limb = (x, y, z, len, rr, mat, a1, a2, len2, p = G) => { const pv = new THREE.Group(); pv.position.set(x, y, z); pv.rotation.x = a1; p.add(pv); ad(new THREE.CylinderGeometry(rr, rr * 0.85, len, 10).translate(0, -len / 2, 0), mat, 0, 0, 0, pv); ad(new THREE.SphereGeometry(rr, 10, 8), mat, 0, 0, 0, pv); const pv2 = new THREE.Group(); pv2.position.set(0, -len, 0); pv2.rotation.x = a2; pv.add(pv2); ad(new THREE.SphereGeometry(rr * 0.9, 10, 8), mat, 0, 0, 0, pv2); ad(new THREE.CylinderGeometry(rr * 0.85, rr * 0.75, len2, 10).translate(0, -len2 / 2, 0), mat, 0, 0, 0, pv2); return { pv, pv2 }; };
    const lL = limb(-0.1, 0.92, 0, 0.44, 0.075, tM, 0.12, -0.24, 0.44), lR = limb(0.1, 0.92, 0, 0.44, 0.075, tM, -0.05, -0.1, 0.44);
    for (const L of [lL, lR]) ad(new THREE.BoxGeometry(0.12, 0.08, 0.24), std(0x161210, 0.5), 0, -0.47, 0.05, L.pv2);
    ad(new THREE.CylinderGeometry(0.17, 0.25, 0.42, 12), cM, 0, 0.86, 0);              // coat skirt
    ad(new THREE.CylinderGeometry(0.27, 0.18, 0.62, 12), cM, 0, 1.3, 0);               // torso (shoulders wider than hips)
    ad(new THREE.BoxGeometry(0.1, 0.18, 0.02), std(0xf2efe6, 0.7), 0, 1.52, 0.2);       // shirt front
    for (const sx2 of [-1, 1]) ad(new THREE.SphereGeometry(0.1, 10, 8), cM, sx2 * 0.26, 1.56, 0);
    const aL = limb(-0.3, 1.55, 0, 0.32, 0.065, cM, 0.25, -0.9, 0.3), aR = limb(0.3, 1.55, 0, 0.32, 0.065, cM, -0.15, -0.5, 0.3);
    for (const a of [aL, aR]) ad(new THREE.SphereGeometry(0.055, 8, 6), sM, 0, -0.32, 0, a.pv2);
    ad(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 8), sM, 0, 1.66, 0);
    ad(new THREE.SphereGeometry(0.13, 16, 12), sM, 0, 1.8, 0).scale.set(1, 1.1, 1);
    for (const ex of [-0.045, 0.045]) ad(new THREE.SphereGeometry(0.018, 8, 6), eM, ex, 1.82, 0.12);
    ad(new THREE.BoxGeometry(0.06, 0.012, 0.01), std(0x6a3a2a, 0.6), 0, 1.745, 0.125);
    ad(new THREE.CylinderGeometry(0.19, 0.19, 0.02, 16), hM, 0, 1.93, 0); ad(new THREE.CylinderGeometry(0.12, 0.125, 0.24, 16), hM, 0, 2.05, 0);
    return G;
  }
  const SNOW = person({ coat: 0x1e2a34, trousers: 0x3a3430, skin: 0xd9a77e, hat: 0x141414 }); SNOW.position.set(10.75, 0, -0.75); SNOW.rotation.y = -Math.PI / 2 + 0.35; SNOW.scale.setScalar(1.25); scene.add(SNOW);
  // a second generic figure fetching water (period dress)
  const WOM = person({ coat: 0x6a3a3a, trousers: 0x4a2a2a, skin: 0x8a5a3c, hat: 0x5a4632 }); WOM.position.set(8.55, 0, -0.35); WOM.rotation.y = Math.PI / 2 - 0.3; WOM.scale.setScalar(1.18); scene.add(WOM);
  const BUCK = add(new THREE.CylinderGeometry(0.16, 0.12, 0.26, 12, 1, true), std(0x7a5a36, 0.8), 9.25, 0.13, -1.0);

  // ================= BILL + SOVEREIGNS (s6) =================
  const billT = canvasTex(640, 860, (g, w, h) => {
    g.fillStyle = "#EFE2C2"; g.fillRect(0, 0, w, h); noise(g, w, h, 3000, 101, ["rgba(140,110,60,.12)", "rgba(255,255,255,.2)"]);
    g.strokeStyle = "#6a4a20"; g.lineWidth = 6; g.strokeRect(24, 24, w - 48, h - 48); g.lineWidth = 2; g.strokeRect(36, 36, w - 72, h - 72);
    g.fillStyle = "#2a1c0a"; g.textAlign = "center"; g.font = `900 64px ${SERIF}`; g.fillText("UNDANG-UNDANG", w / 2, 140);
    g.font = `700 30px ${MONO}`; g.fillText("PARLEMEN INGGRIS · 1858", w / 2, 196);
    g.font = `700 34px ${SANS}`; g.fillText("PEMBERSIHAN SUNGAI THAMES", w / 2, 262);
    g.fillStyle = "rgba(42,28,10,.55)"; for (let y = 320; y < 700; y += 34) g.fillRect(80, y, w - 160 - ((y * 7) % 90), 8);
    g.fillStyle = "#2a1c0a"; g.font = `700 40px ${MONO}`; g.fillText("DANA: £3.000.000", w / 2, 760);
  });
  const DESK = new THREE.Group(); DESK.position.set(-3.95, 0, -2.4); scene.add(DESK);
  { const wd = std(0x4a2c1a, 0.55), br = std(0xd8a84a, 0.3, 0.9), gr = std(0x24503c, 0.8);
    add(new THREE.BoxGeometry(1.25, 0.08, 2.7), wd, 0, 1.0, 0, DESK); add(new THREE.BoxGeometry(1.1, 0.01, 2.5), gr, 0, 1.045, 0, DESK);
    add(new THREE.BoxGeometry(1.29, 0.04, 2.74), br, 0, 0.95, 0, DESK);
    for (const [dx, dz] of [[-0.55, -1.25], [0.55, -1.25], [-0.55, 1.25], [0.55, 1.25]]) add(new THREE.BoxGeometry(0.08, 0.95, 0.08), wd, dx, 0.475, dz, DESK);
    add(new THREE.BoxGeometry(0.06, 0.9, 0.06), wd, -0.15, 1.45, 0.75, DESK).rotation.z = 0.35; }
  const BILL = new THREE.Group(); scene.add(BILL);
  const billM = std(0xffffff, 0.85, 0, { map: billT, side: THREE.DoubleSide });
  add(new THREE.PlaneGeometry(4.2, 5.65), billM, 0, 0, 0, BILL).castShadow = false;
  add(new THREE.CylinderGeometry(0.14, 0.14, 4.5, 12), std(0x8a6a3a, 0.6), 0, 2.88, -0.05, BILL).rotation.z = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.14, 0.14, 4.5, 12), std(0x8a6a3a, 0.6), 0, -2.88, -0.05, BILL).rotation.z = Math.PI / 2;
  const stampT = canvasTex(620, 240, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "#C8261A"; g.lineWidth = 14; g.beginPath(); g.roundRect(10, 10, w - 20, h - 20, 18); g.stroke(); g.fillStyle = "#C8261A"; g.textAlign = "center"; g.font = `900 92px ${SANS}`; g.fillText("DISAHKAN", w / 2, 112); g.font = `700 46px ${MONO}`; g.fillText("2 AGUSTUS 1858", w / 2, 186); const q = mulberry(111); g.globalCompositeOperation = "destination-out"; for (let i = 0; i < 500; i++) g.fillRect(q() * w, q() * h, 2 + q() * 5, 2 + q() * 4); });
  const STAMP = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.4), basic({ map: stampT, opacity: 0, side: THREE.DoubleSide })); STAMP.position.set(0.1, -1.0, 0.03); STAMP.rotation.z = 0.12; BILL.add(STAMP);
  const NC = 36;
  const COIN = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 24), std(0xe0b04e, 0.28, 1.0), NC); COIN.castShadow = true; scene.add(COIN);

  // ================= EMBANKMENT + EGG SEWER (s7) =================
  const embShape = new THREE.Shape(); embShape.moveTo(RL, BED - 0.6); embShape.lineTo(EMB, BED - 0.6); embShape.lineTo(EMB, 0); embShape.lineTo(RL, 0); embShape.closePath();
  { const h = new THREE.Path(); const P = eggPts(); h.moveTo(P[0][0], P[0][1]); for (let i = P.length - 1; i > 0; i--) h.lineTo(P[i][0], P[i][1]); h.closePath(); embShape.holes.push(h); }
  const EW = 1024, EH = 1260, ex = (x) => ((x - RL) / (EMB - RL)) * EW, ey = (y) => ((0 - y) / (0 - (BED - 0.6))) * EH;
  const embT = canvasTex(EW, EH, (g, w, h) => {
    g.fillStyle = "#8f8a80"; g.fillRect(0, 0, w, h);
    const q = mulberry(121);
    for (let y = 0; y < h; y += 70) for (let x = (y / 70 % 2) * 60 - 60; x < w; x += 120) { const v = 0.85 + q() * 0.25; g.fillStyle = `rgb(${Math.round(150 * v)},${Math.round(146 * v)},${Math.round(136 * v)})`; g.fillRect(x + 3, y + 3, 114, 64); }
    noise(g, w, h, 3000, 123, ["rgba(0,0,0,.08)", "rgba(255,255,255,.08)"]);
    // brick ring around the egg
    const P1 = eggPts(1.32), P0 = eggPts(1.0);
    g.save(); g.beginPath(); P1.forEach(([x, y], i) => (i ? g.lineTo(ex(x), ey(y)) : g.moveTo(ex(x), ey(y)))); g.closePath(); g.clip();
    g.fillStyle = "#7a3424"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 64; i++) { const th = (i / 64) * 6.283; const [x0, y0] = eggPts(1.0, EGG.x, EGG.y, 64)[i], [x1, y1] = eggPts(1.32, EGG.x, EGG.y, 64)[i]; g.strokeStyle = "rgba(220,200,170,.65)"; g.lineWidth = 3; g.beginPath(); g.moveTo(ex(x0), ey(y0)); g.lineTo(ex(x1), ey(y1)); g.stroke(); }
    g.restore();
    g.strokeStyle = "rgba(220,200,170,.8)"; g.lineWidth = 4; for (const P of [P0, eggPts(1.16), P1]) { g.beginPath(); P.forEach(([x, y], i) => (i ? g.lineTo(ex(x), ey(y)) : g.moveTo(ex(x), ey(y)))); g.closePath(); g.stroke(); }
    g.fillStyle = "#E9A84C"; g.fillRect(0, 0, w, 10); g.fillRect(w - 8, 0, 8, h);
  });
  embT.wrapS = embT.wrapT = THREE.RepeatWrapping; embT.repeat.set(1 / (EMB - RL), 1 / (0 - (BED - 0.6))); embT.offset.set(-RL / (EMB - RL), 1);
  const embSide = canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#9a958a"; g.fillRect(0, 0, w, h); const q = mulberry(131); for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 32 - 32; x < w; x += 64) { const v = 0.82 + q() * 0.3; g.fillStyle = `rgb(${Math.round(160 * v)},${Math.round(155 * v)},${Math.round(145 * v)})`; g.fillRect(x + 2, y + 2, 60, 28); } }, [1, 1]);
  const EMBG = new THREE.Group(); scene.add(EMBG);
  const embGeo = new THREE.ExtrudeGeometry(embShape, { depth: -ZB, bevelEnabled: false, curveSegments: 24 }); embGeo.translate(0, 0, ZB);
  add(embGeo, [std(0xffffff, 0.85, 0, { map: embT }), std(0xffffff, 0.8, 0, { map: embSide })], 0, 0, 0, EMBG);
  const embTop = add(new THREE.PlaneGeometry(EMB - RL, -ZB), std(0x56604c, 0.9), (RL + EMB) / 2, 0.015, ZB / 2, EMBG); embTop.rotation.x = -Math.PI / 2;
  const flowM = std(0xffffff, 0.35, 0, { map: flowT, color: 0x9a7a52 });
  const flow = add(new THREE.PlaneGeometry(0.95, -ZB), flowM, EGG.x, EGG.y - 0.62, ZB / 2, EMBG); flow.rotation.x = -Math.PI / 2; flow.castShadow = false;
  // embankment trees + lamps
  const TREES = [];
  for (let z = -3; z > -58; z -= 4.5) { const tg = new THREE.Group(); tg.position.set(-1.6, 0, z); EMBG.add(tg); add(new THREE.CylinderGeometry(0.06, 0.08, 1, 6), std(0x4a3626, 0.9), 0, 0.5, 0, tg); add(new THREE.SphereGeometry(0.55, 12, 9), std(0x4f7a46, 0.85), 0, 1.35, 0, tg).scale.set(1, 1.15, 1); TREES.push(tg); }
  for (let z = -5.2; z > -58; z -= 9) { add(new THREE.CylinderGeometry(0.03, 0.04, 1.4, 6), ironM, EMB - 0.25, 0.7, z, EMBG); add(new THREE.SphereGeometry(0.1, 8, 6), std(0xffe6b0, 0.3, 0, { emissive: 0xffc070, emissiveIntensity: 0.8 }), EMB - 0.25, 1.45, z, EMBG); }

  // ================= PUMPING STATION (beam engine) =================
  const PSX = -9.2, PSZ = -51.5;
  const brickM = std(0x8a4a32, 0.85);
  add(new THREE.BoxGeometry(5, 5, 0.3), brickM, PSX, 2.5, PSZ - 2.5); add(new THREE.BoxGeometry(0.3, 5, 5), brickM, PSX - 2.5, 2.5, PSZ); add(new THREE.BoxGeometry(0.3, 5, 5), brickM, PSX + 2.5, 2.5, PSZ);
  add(new THREE.BoxGeometry(5.3, 0.35, 5.3), std(0xc9ad7e, 0.7), PSX, 5.15, PSZ);
  const ghost = add(new THREE.BoxGeometry(5, 5, 0.06), new THREE.MeshStandardMaterial({ color: 0x7fe0e8, transparent: true, opacity: 0.12, roughness: 0.1, depthWrite: false }), PSX, 2.5, PSZ + 2.5); ghost.castShadow = false;
  add(new THREE.CylinderGeometry(0.45, 0.6, 12, 14), brickM, PSX - 1.9, 6, PSZ - 1.9);
  add(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 14), std(0x3a2a22, 0.8), PSX - 1.9, 12.1, PSZ - 1.9);
  add(new THREE.CylinderGeometry(0.45, 0.45, 2.2, 16), std(0x46564f, 0.4, 0.6), PSX - 1.4, 1.1, PSZ);               // steam cylinder
  add(new THREE.BoxGeometry(0.3, 3.6, 0.3), std(0x3a4a44, 0.5, 0.5), PSX, 1.8, PSZ);                                // A-frame column
  const BEAM = new THREE.Group(); BEAM.position.set(PSX, 3.65, PSZ); scene.add(BEAM);
  add(new THREE.BoxGeometry(3.6, 0.28, 0.24), std(0x2a3632, 0.4, 0.7), 0, 0, 0, BEAM);
  const FLY = new THREE.Group(); FLY.position.set(PSX + 1.5, 1.4, PSZ - 0.6); scene.add(FLY);
  add(new THREE.TorusGeometry(1.0, 0.1, 10, 32), std(0x2a3632, 0.4, 0.7), 0, 0, 0, FLY);
  for (let i = 0; i < 6; i++) { const s = add(new THREE.BoxGeometry(0.06, 2, 0.06), std(0x2a3632, 0.4, 0.7), 0, 0, 0, FLY); s.rotation.z = (i / 6) * Math.PI; }
  const ROD = add(new THREE.CylinderGeometry(0.05, 0.05, 1, 8), std(0x9aa4a0, 0.3, 0.9), 0, 0, 0);

  // ================= X-RAY OVERLAYS (s7) =================
  const xr = (color, op = 0.9) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, map: dashT });
  const XR = [];
  function xline(a, b, rr, color) { const d = new V3().subVectors(b, a), L = d.length(); const m = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, L, 8, 1, true), xr(color)); m.material.map = dashT.clone(); m.material.map.needsUpdate = true; m.material.map.repeat.set(1, L / 2.2); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize()); m.renderOrder = 7; scene.add(m); return { m, a, b, L }; }
  const MAIN = [xline(new V3(EGG.x, EGG.y - 0.3, 0.2), new V3(EGG.x, EGG.y - 0.3, PSZ), 0.1, 0x4fd1c5), xline(new V3(EGG.x, EGG.y - 0.3, PSZ), new V3(PSX + 1.4, 0.6, PSZ), 0.14, 0x4fd1c5),
    xline(new V3(PSX + 1.4, 3.8, PSZ - 1.2), new V3(-4.5, 2.2, ZB - 9), 0.1, 0x4fd1c5), xline(new V3(9.0, -1.9, 0.2), new V3(9.0, -1.9, ZB - 2), 0.13, 0x4fd1c5)];
  const STREET = [];
  for (let z = -3; z > ZB + 1; z -= 5) { STREET.push(xline(new V3(X0 + 0.3, 0.08, z), new V3(RL - 0.2, 0.08, z), 0.05, 0xe9a84c)); STREET.push(xline(new V3(RR + 0.2, 0.08, z - 2), new V3(X1 - 0.3, 0.08, z - 2), 0.05, 0xe9a84c)); }
  for (const x of [-10.8, -7.6, -4.2]) STREET.push(xline(new V3(x, 0.08, -0.5), new V3(x, 0.08, ZB + 0.5), 0.05, 0xe9a84c));
  for (const x of [8.3, 11.2]) STREET.push(xline(new V3(x, 0.08, -0.5), new V3(x, 0.08, ZB + 0.5), 0.05, 0xe9a84c));
  STREET.forEach((s, i) => { s.rk = hsh(i, 9); });
  const showX = (o, k, grow) => { o.m.visible = k > 0.01 && grow > 0.01; if (!o.m.visible) return; o.m.material.opacity = k; const g2 = Math.max(0.001, grow); o.m.scale.set(1, g2, 1); o.m.position.copy(o.a).lerp(o.b, g2 * 0.5); };

  // ================= STINK RIBBONS (shader) =================
  const RB = 46, RSEG = 26;
  const rPos = [], rUv = [], rPh = [], rIdx = [];
  { const q = mulberry(141); let v0 = 0;
    for (let i = 0; i < RB; i++) {
      const x = RL + 1.4 + q() * (RR - RL - 2.6), z = -3 - q() * 55, w = 0.2 + q() * 0.22, hh = 1.5 + q() * 1.6, ph = q() * 6.28, ang = q() * 3.14;
      const ca = Math.cos(ang), sa = Math.sin(ang);
      for (let j = 0; j <= RSEG; j++) for (const s of [-0.5, 0.5]) { rPos.push(x + s * w * ca, WL + (j / RSEG) * hh, z + s * w * sa); rUv.push(s + 0.5, j / RSEG); rPh.push(ph, hh, i); }
      for (let j = 0; j < RSEG; j++) { const a = v0 + j * 2; rIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      v0 += (RSEG + 1) * 2;
    }
  }
  const rGeo = new THREE.BufferGeometry();
  rGeo.setAttribute("position", new THREE.Float32BufferAttribute(rPos, 3)); rGeo.setAttribute("uv", new THREE.Float32BufferAttribute(rUv, 2)); rGeo.setAttribute("aPh", new THREE.Float32BufferAttribute(rPh, 3)); rGeo.setIndex(rIdx);
  const rU = { uT: { value: 0 }, uA: { value: 0 }, uLean: { value: 0 }, uCol: { value: new THREE.Color(0xb5d86a) } };
  const RIB = new THREE.Mesh(rGeo, new THREE.ShaderMaterial({
    uniforms: rU, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false,
    vertexShader: `attribute vec3 aPh; uniform float uT; uniform float uLean; varying vec2 vUv; varying float vPh;
      void main(){ vUv = uv; vPh = aPh.x; vec3 p = position; float v = uv.y;
        p.x += sin(v*5.0 + uT*1.1 + aPh.x)*0.25*v + uLean*v*v*aPh.y*0.55;
        p.z += cos(v*4.0 + uT*0.8 + aPh.x*1.7)*0.4*v;
        p.y += sin(uT*0.6 + aPh.x)*0.25*v;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }`,
    fragmentShader: `uniform float uT; uniform float uA; uniform vec3 uCol; varying vec2 vUv; varying float vPh;
      void main(){ float e = sin(3.14159*vUv.x); float v = vUv.y;
        float a = uA * e * smoothstep(0.0,0.18,v) * (1.0 - smoothstep(0.55,1.0,v));
        a *= 0.55 + 0.45*sin(v*14.0 - uT*2.4 + vPh);
        vec3 c = mix(uCol, vec3(0.95,0.9,0.55), 0.35*(1.0-v));
        gl_FragColor = vec4(c, a*0.3); }`,
  }));
  RIB.renderOrder = 5; RIB.frustumCulled = false; scene.add(RIB);
  const BUB = pts(scene, 320, { color: 0xc8b070, size: 0.16, add: false, opacity: 0.85 });

  // ================= LABELS =================
  const L = {
    thames: plate("SUNGAI THAMES", { h: 1.0 }),
    out: plate("SALURAN LIMBAH LAMA", { h: 0.8, bd: "#B27A3E" }),
    mia: plate("MIASMA = BAU BUSUK?", { h: 0.9, bd: "#B5D86A", color: "#DDF0A8" }),
    pump: plate("POMPA AIR BROAD STREET", { h: 0.3 }),
    cess: plate("TANGKI SEPTIK BOCOR", { h: 0.38, bd: "#B27A3E" }),
    well: plate("SUMUR · AIR TERCEMAR", { h: 0.38, bd: "#4FD1C5" }),
    curt: plate("TIRAI + KAPUR KLORIDA", { h: 0.3 }),
    parl: plate("PARLEMEN", { h: 0.9, font: SERIF }),
    emb: plate("TANGGUL BARU", { h: 0.42 }),
    egg: plate("SELOKAN UTAMA · PENAMPANG TELUR", { h: 0.24, bd: "#4FD1C5" }),
    ps: plate("STASIUN POMPA", { h: 0.5, bd: "#4FD1C5" }),
    east: plate("KE TIMUR · JAUH DARI KOTA →", { h: 0.42, bd: "#4FD1C5", color: "#9FF0E6" }),
    coins: plate("£3 JUTA", { h: 1.1, font: MONO, weight: 700, color: "#FFE2A0" }),
  };
  const LD = { cess: leader(), well: leader(), egg: leader(), pump: leader() };

  // ================= TIME MAPS =================
  const popT = track([[0, 1], [K.s2 - 0.1, 1], [A("s2:satu") - 0.2, 0.3], [A("s2:satu") + 0.3, 0.33], [A("s2:tiga"), 0.95], [A("s2:juta#2"), 1], [K.dur, 1]]);
  const ribT = track([[0, 1.45], [K.s2 - 0.3, 1.3], [K.s2 + 0.8, 0.45], [A("s2:limbah"), 0.7], [K.s3 + 0.5, 1.0], [A("s3:mewabah"), 1.0], [K.s4 - 0.2, 0.5], [K.s4 + 1, 0.15], [K.s5 - 0.2, 0.3], [A("s5:mendidih"), 1.25], [A("s5:Tirainya"), 1.35], [K.s6, 0.6], [A("s6:Dalam"), 0.25], [K.s7, 0.5], [A("s7:dialirkan"), 0.45], [A("s7:berhenti"), 0], [K.dur, 0]]);
  const leanT = track([[0, -0.12], [K.s5 - 0.5, 0], [A("s5:parlemen"), -0.35], [A("s5:Tirainya"), -0.5], [K.s6 + 1, -0.15], [K.dur, -0.1]]);
  const embT0 = A("s7:Joseph"), embT1 = A("s7:membangun") + 1.0;
  const cleanT = (t) => smooth((t - A("s7:dialirkan")) / (A("s7:berhenti") - A("s7:dialirkan") + 0.6));

  // camera stations [cx, cy, cz, lx, ly, lz]
  const S = {
    s1: track([[0, 11, 5, 24, -4, 7.5, -10], [K.s2 - 0.12, 9.5, 5.5, 21, -4, 7.5, -10]]),
    s2: track([[K.s2 - 0.12, 30, 30, 34, -1, -2, -26], [A("s2:satu"), 27, 27, 31, -1, -2, -27], [A("s2:Toilet"), 22, 22, 26, -1, -1, -28], [A("s2:limbah") - 0.3, 8, 3, 10, -2.5, -0.8, -14], [A("s2:Thames"), 6.5, 2.6, 7, -2.5, -0.8, -16], [K.s3, 6, 2.6, 6, -2.5, -0.8, -17]]),
    s3: track([[K.s3 - 0.12, 3, 3.5, 16, 1.5, 3.5, -20], [A("s3:bau"), 2, 4, 12, 1, 4, -22], [A("s3:mewabah"), -1, 6, 14, -4, 2.5, -24], [A("s3:1831"), -6, 12, 16, -6, 1, -34], [K.s4, -6, 13, 18, -6, 1, -34]]),
    s4: track([[K.s4 - 0.12, 12.5, 1.5, 21, 10.1, -1.0, -1], [A("s4:menemukan"), 12, 0.2, 20, 10.1, -2.4, -1], [A("s4:menyebar"), 11.8, -1.5, 22, 10.2, -4.0, -1], [A("s4:tercemar"), 11.5, -2.5, 22, 10.2, -4.6, -1], [A("s4:Ia") - 0.2, 11.4, 1.6, 13, 9.9, 0.2, -1], [A("s4:pompa"), 11.2, 1.7, 12, 9.8, 0.4, -1.2], [A("s4:kematian"), 12, 0.8, 17.5, 10.1, -1.2, -1], [K.s5, 12.4, 1.0, 18.5, 10.1, -1.2, -1]]),
    s5: track([[K.s5 - 0.12, 6, 5, 14, -2, 3.2, -18], [A("s5:mendidih"), 4, 3.5, 8, -2.5, 2.5, -20], [A("s5:Gedung"), 3.5, 6, 6, -6, 4.5, -18], [A("s5:Tirainya"), 2.2, 4.2, -2, -4.6, 3, -17], [A("s5:kapur"), 1.6, 3.8, -5, -4.6, 2.9, -17], [K.s6, 1.8, 4, -4.5, -4.6, 2.9, -17]]),
    s6: track([[K.s6 - 0.12, 12, 9, 22, -3, 6.5, -10], [A("s6:mencium"), 11, 8.5, 20, -3, 6.5, -10], [A("s6:Dalam"), 3.6, 3.4, 9, -3.9, 1.5, -2.4], [A("s6:disahkan"), 2.8, 3.0, 7.4, -3.9, 1.5, -2.2], [A("s6:poundsterling"), 3.2, 2.9, 7.8, -3.9, 1.4, -2.7], [K.s7, 3.5, 2.9, 8.2, -3.9, 1.4, -2.7]]),
    s7: track([[K.s7 - 0.12, 7, 0, 18, -1.5, -2.2, -2], [A("s7:membangun"), 6.4, -0.5, 16, -1.5, -2.3, -2], [A("s7:utama"), 6, -0.8, 15, -1.6, -2.4, -3], [A("s7:seribu") - 0.4, 24, 24, 24, -2, -1, -27], [A("s7:jalan"), 22, 22, 20, -2, -1, -29], [A("s7:dialirkan"), -7.8, 6, -31, -9.2, 1.4, -51.5], [A("s7:jauh"), -6.8, 6.5, -30, -8.8, 1.4, -53], [A("s7:Wabah"), 18, 12, 14, 0, 0, -12], [K.s8, 19, 12.5, 16, 0, 0, -12]]),
    s8: track([[K.s8 - 0.12, 19, 12.5, 16, 0, 0, -12], [A("s8:melawan"), 22, 16, 28, -0.5, -1, -18], [A("s8:Tapi"), 26, 19, 36, -0.5, -1.5, -20], [A("s8:Selokan"), 6.5, -0.8, 16.5, -1.6, -2.3, -3], [A("s8:hari"), 6.1, -0.6, 15.5, -1.6, -2.3, -3.5], [A("s8:Menurut"), 28, 20, 40, -0.5, -2, -21], [K.dur, 29, 20.5, 41, -0.5, -2, -21]]),
  };
  const look = new V3();
  const setCam = (c) => { cam.position.set(c[0], c[1], c[2]); look.set(c[3], c[4], c[5]); cam.up.set(0, 1, 0); cam.lookAt(look); };
  const cSun = new THREE.Color(0xffc08a), cHot = new THREE.Color(0xff9a50), cClr = new THREE.Color(0xfff0dc);

  // ================= DRAW =================
  return function draw(t) {
    for (const l of labels) l.visible = false;
    for (const l of leads) l.visible = false;
    const sc = t < K.s2 - 0.12 ? 1 : t < K.s3 - 0.12 ? 2 : t < K.s4 - 0.12 ? 3 : t < K.s5 - 0.12 ? 4 : t < K.s6 - 0.12 ? 5 : t < K.s7 - 0.12 ? 6 : t < K.s8 - 0.12 ? 7 : 8;
    setCam(S["s" + sc](t));
    // ---------- light moods ----------
    const heat = t < K.s5 - 0.5 ? 0 : win(t, K.s5 - 0.5, K.s6 + 1, 1.2, 1.5);
    const clean = cleanT(t);
    sun.color.copy(cSun).lerp(cHot, heat).lerp(cClr, clean * 0.6);
    sun.intensity = 2.5 + 0.6 * heat;
    hemi.intensity = 0.75 + 0.1 * clean;
    skyU.uHor.value.setHex(0x2c4a4a).lerp(new THREE.Color(0x5a4426), heat * 0.8);
    // ---------- population ----------
    setHouses(popT(t)[0]);
    // ---------- embankment ----------
    const eb = smooth((t - embT0) / (embT1 - embT0));
    EMBG.visible = eb > 0.001; EMBG.position.y = (1 - eb) * (BED - 1.2);
    TREES.forEach((tg, i) => tg.scale.setScalar(Math.max(0.001, smooth((t - embT1 - i * 0.05) / 0.6))));
    flowT.offset.y = t * 0.35;
    flowM.color.setHex(0x9a7a52).lerp(new THREE.Color(0x6a7a6a), clean * 0.3);
    const xw0 = RL + (EMB - RL) * eb;
    setWater(t, xw0, heat, clean);
    // ---------- jets from the old outfalls ----------
    {
      for (const o of OUTF) if (o.ms) for (const m of o.ms) m.visible = eb < 0.35;
      const base = t < K.s2 ? 0.8 : t < K.s7 ? 1 : 1 - smooth((t - A("s7:membangun")) / 2.4);
      let n = 0;
      OUTF.forEach((o, k) => {
        const north = o.s > 0, gone = north ? eb : smooth((t - A("s7:dialirkan")) / 1.5);
        const on = base * (1 - gone) * (t > A("s2:limbah") - 1.2 || t < K.s2 ? 1 : 0.55);
        for (let i = 0; i < JN; i++, n++) {
          if (on < 0.03) { JET.pos[n * 3 + 1] = -60; continue; }
          const ph = (t * 1.2 + i / JN + hsh(k, 3)) % 1, sp = 0.9 + 0.3 * hsh(i, k);
          JET.pos[n * 3] = o.x + o.s * ph * 1.1 * sp; JET.pos[n * 3 + 1] = -0.55 - ph * ph * 1.4 + (hsh(i, 2) - 0.5) * 0.05; JET.pos[n * 3 + 2] = o.z + (hsh(i, 5) - 0.5) * 0.22;
          if (JET.pos[n * 3 + 1] < WL) JET.pos[n * 3 + 1] = -60;
          const c = on; JET.col[n * 3] = 0.42 * c + 0.1; JET.col[n * 3 + 1] = 0.28 * c + 0.06; JET.col[n * 3 + 2] = 0.1 * c + 0.03;
        }
      });
      JET.commit();
    }
    // ---------- ribbons + bubbles ----------
    rU.uT.value = t; rU.uA.value = Math.min(0.8, Math.max(0, ribT(t)[0]) * 0.7); rU.uLean.value = leanT(t)[0] * 0.35;
    RIB.visible = rU.uA.value > 0.01;
    {
      const bk = Math.max(heat, t < K.s2 ? 0.4 : 0) * (1 - clean);
      for (let i = 0; i < 320; i++) {
        if (bk < 0.02) { BUB.pos[i * 3 + 1] = -60; continue; }
        const ph = (t * (0.8 + hsh(i, 1)) + hsh(i, 2)) % 1;
        BUB.pos[i * 3] = xw0 + 0.3 + hsh(i, 3) * (RR - xw0 - 0.6); BUB.pos[i * 3 + 1] = WL + 0.02 + Math.sin(Math.PI * ph) * 0.12; BUB.pos[i * 3 + 2] = -hsh(i, 4) * 58 - 0.5;
        const c = bk * Math.sin(Math.PI * ph); BUB.col[i * 3] = 0.8 * c; BUB.col[i * 3 + 1] = 0.72 * c; BUB.col[i * 3 + 2] = 0.45 * c;
      }
      BUB.commit();
    }
    // ---------- curtains soak ----------
    const soak = smooth((t - A("s5:kapur") + 0.2) / 1.2) * (t > K.s5 ? 1 : 0);
    curM.color.copy(cDry).lerp(cWet, soak);
    {
      const dk = t > A("s5:kapur") && t < K.s6 + 0.5 ? soak : 0;
      for (let i = 0; i < 240; i++) {
        if (dk < 0.02) { DRIP.pos[i * 3 + 1] = -60; continue; }
        const b = i % nBay, row = Math.floor(i / nBay) % 2, ph = (t * 0.9 + hsh(i, 1)) % 1;
        DRIP.pos[i * 3] = PX1 + 0.08 + ph * 0.05; DRIP.pos[i * 3 + 1] = (row ? 1.6 : 3.8) - 0.7 - ph * ph * 1.4; DRIP.pos[i * 3 + 2] = PZ0 + (b + 0.5) * 1.6 + (hsh(i, 2) - 0.5) * 0.4;
        DRIP.col[i * 3] = 0.75 * dk; DRIP.col[i * 3 + 1] = 0.85 * dk; DRIP.col[i * 3 + 2] = 0.65 * dk;
      }
      DRIP.commit();
    }
    // ---------- clock hands ----------
    for (const h of HANDS) { h.mh.rotation.z = -t * 0.5; h.hr.rotation.z = -1.2 - t * 0.04; }
    // ---------- pump, handle, plume, figures ----------
    {
      const lift = smooth((t - A("s4:mencopot") + 0.1) / 1.1);
      if (t < K.s4) { HND.position.set(0.12, 1.7, 0); HND.rotation.set(0, 0, -0.35 + 0.25 * Math.sin(t * 2.4)); }
      else if (lift <= 0) { HND.position.set(0.12, 1.7, 0); HND.rotation.set(0, 0, -0.35 + 0.3 * Math.max(0, Math.sin((t - K.s4) * 3))); }
      else { HND.position.set(0.12 + lift * 0.9, 1.7 + Math.sin(Math.PI * Math.min(1, lift)) * 0.9 - lift * 1.62, lift * 0.55); HND.rotation.set(lift * 0.2, lift * 0.6, -0.35 + lift * 0.35); }
      wellPipe.material.color.setHex(0x343c3a);
      plume.material.opacity = t > K.s4 ? 0.95 * smooth((t - A("s4:air") + 0.4) / 1.2) * (1 - smooth((t - K.s7) / 2)) : 0;
      const fig = t > K.s4 - 0.5 && t < K.s5 + 0.3;
      SNOW.visible = fig; WOM.visible = t > K.s4 - 0.5 && t < K.s5 + 0.3; BUCK.visible = WOM.visible;
      WOM.position.x = t > A("s4:mencopot") ? 8.55 - smooth((t - A("s4:mencopot") - 0.6) / 2) * 1.2 : 8.55;
    }
    // ---------- bill + coins ----------
    {
      const bk = t > K.s6 - 0.2 && t < K.s7 + 0.6 ? smooth((t - A("s6:Dalam") + 0.4) / 1.0) * (1 - smooth((t - K.s7 + 0.1) / 0.6)) : 0;
      BILL.visible = bk > 0.002;
      DESK.visible = BILL.visible; DESK.scale.set(1, Math.max(0.001, bk), 1);
      BILL.position.set(-3.85, 1.06 + 0.82 * bk, -1.65); BILL.rotation.set(0, 0.62, 0); BILL.rotateX(-0.42); BILL.scale.set(Math.max(0.001, bk * 0.3), Math.max(0.001, bk * 0.3), 1);
      const st = clamp01((t - A("s6:disahkan")) / 0.18);
      STAMP.material.opacity = t > A("s6:disahkan") ? st * bk : 0; STAMP.scale.setScalar(1 + (1 - st) * 0.8);
      const ck = t > A("s6:dana") - 0.2 ? clamp01((t - A("s6:dana") + 0.2) / (A("s6:poundsterling") - A("s6:dana") + 0.2)) : 0;
      for (let i = 0; i < NC; i++) {
        const col = i % 3, lev = Math.floor(i / 3), on = ck * NC > i && bk > 0.01;
        dmy.position.set(-4.2 + col * 0.36, 1.07 + lev * 0.056, -3.25 + (col === 1 ? -0.3 : 0)); dmy.rotation.set(0.04 * hsh(i, 1), hsh(i, 2), 0.04 * hsh(i, 3)); dmy.scale.setScalar(on ? 0.45 : 0.0001); dmy.updateMatrix(); COIN.setMatrixAt(i, dmy.matrix);
      }
      COIN.instanceMatrix.needsUpdate = true;
      showLab(L.coins, ck > 0.3 ? win(t, A("s6:poundsterling") - 0.2, K.s7 - 0.3, 0.3, 0.3) * bk : 0, new V3(-3.9, 2.05, -3.4), 0.32);
    }
    // ---------- pumping station beam engine ----------
    {
      const run = t > K.s7 + 0.5 ? 1 : 0.15, ang = (t * 1.6 * run) % (Math.PI * 2);
      BEAM.rotation.z = 0.2 * Math.sin(ang); FLY.rotation.z = -ang;
      const e1 = new V3(1.8 * Math.cos(BEAM.rotation.z), 1.8 * Math.sin(BEAM.rotation.z), 0).add(BEAM.position).add(new V3(-0.3, 0, -0.6 + 0.6));
      const e2 = new V3(Math.cos(-ang) * 0.85, Math.sin(-ang) * 0.85, 0).add(FLY.position);
      ROD.position.copy(e1).add(e2).multiplyScalar(0.5); ROD.scale.y = e1.distanceTo(e2); ROD.quaternion.setFromUnitVectors(new V3(0, 1, 0), e2.clone().sub(e1).normalize());
    }
    // ---------- x-ray overlays ----------
    {
      const mk = t < K.s7 ? 0 : win(t, A("s7:utama"), K.s8 + 3, 0.6, 1.5) * 0.95;
      const mg = smooth((t - A("s7:utama")) / (A("s7:seribu") - A("s7:utama") + 0.3));
      MAIN.forEach((o, i) => { const g3 = i === 0 ? mg : i === 3 ? mg : smooth((t - A("s7:dialirkan") + 0.4 - (i - 1) * 0.5) / 1.0); showX(o, mk * (i === 2 ? win(t, A("s7:dialirkan") - 0.4, K.s8 + 3, 0.4, 1.5) : 1), g3); o.m.material.map.offset.y = -t * 0.9; });
      const sk = t < K.s7 ? 0 : win(t, A("s7:seribu") - 0.3, A("s7:dialirkan") - 0.5, 0.4, 0.5) * 0.85;
      STREET.forEach((o) => { const gg = smooth((t - A("s7:seribu") + 0.2 - o.rk * (A("s7:jalan") - A("s7:seribu"))) / 0.5); showX(o, sk, gg); o.m.material.map.offset.y = -t * 0.6; });
    }
    // ---------- labels ----------
    showLab(L.thames, t > K.s2 && t < A("s2:limbah") ? win(t, A("s2:satu"), A("s2:limbah") - 0.4, 0.4, 0.3) : 0, new V3(3, -0.2, -13), 1.2);
    
    showLab(L.out, t > K.s2 ? win(t, A("s2:limbah") + 0.2, K.s3 - 0.3, 0.4, 0.3) : 0, new V3(-0.5, 1.4, -12), 0.85);
    showLab(L.mia, t > K.s3 ? win(t, A("s3:bau") - 0.1, A("s3:mewabah"), 0.4, 0.4) : 0, new V3(-1.2, 4.6, -18), 0.8);
    if (t > K.s4 && t < K.s5) {
      const kc = win(t, A("s4:menyebar"), A("s4:Ia") - 0.7, 0.4, 0.3), kw = win(t, A("s4:air"), A("s4:Ia") - 0.7, 0.4, 0.3), kp = win(t, A("s4:Ia"), A("s4:kematian"), 0.4, 0.3);
      showLab(L.cess, kc, new V3(11.4, -3.0, 0.4), 1); showLead(LD.cess, kc, new V3(11.3, -2.85, 0.3), new V3(10.9, -1.9, 0.05));
      showLab(L.well, kw, new V3(8.6, -4.6, 0.4), 1); showLead(LD.well, kw, new V3(8.9, -4.45, 0.3), new V3(9.66, -4.8, 0.05));
      showLab(L.pump, kp, new V3(9.66, 0.32, 0.55), 1);
    }
    showLab(L.curt, t > K.s5 ? win(t, A("s5:kapur") - 0.1, K.s6 - 0.3, 0.4, 0.3) : 0, new V3(-3.7, 3.1, -14.2), 1);
    showLab(L.emb, t > K.s7 ? win(t, A("s7:membangun") + 0.4, A("s7:seratus") - 0.2, 0.4, 0.3) : 0, new V3(-1.6, 0.95, 0.6), 1);
    if (t > K.s7) { const ke = win(t, A("s7:seratus") + 0.3, A("s7:seribu") - 0.6, 0.4, 0.3); showLab(L.egg, ke, new V3(0.4, -4.9, 0.8), 1); showLead(LD.egg, ke, new V3(0.0, -4.78, 0.6), new V3(-1.6, -3.2, 0.05)); }
    showLab(L.ps, t > K.s7 ? win(t, A("s7:dialirkan") - 0.2, A("s7:Wabah") - 0.4, 0.4, 0.3) : 0, new V3(-9.2, 3.9, -48.4), 1);
    showLab(L.east, t > K.s7 ? win(t, A("s7:timur") - 0.2, A("s7:Wabah") - 0.4, 0.4, 0.3) : 0, new V3(-9.2, 0.6, -46.5), 1);
    comp.render();
  };
}
