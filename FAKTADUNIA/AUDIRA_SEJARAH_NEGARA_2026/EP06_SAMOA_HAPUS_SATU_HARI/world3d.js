// EP06 GLASSCRAFT + TIMEFORGE: a Pacific globe at tropical dawn. Samoa sits on top of the globe (local frame: x east, -z north, y up),
// the International Date Line is a glowing light curtain that slides west in 1892 and back east in 2011. Frosted-glass calendar pages,
// a glass day-dial, a trading schooner, trade arcs to Australia and New Zealand, and the Friday page that shatters at midnight.
// Everything is a pure function of t. Original illustration: no portraits, no real document scans.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, stage, pts, envStrips } from "./lib3d.js";
import { GEO as WORLD } from "./geo-world.js";
import { GEO as LOCAL } from "./geo-samoa.js";

const R = 60, LON_S = -172, LAT_S = -13.8, D2R = Math.PI / 180;
const AROT = (LAT_S - 90) * D2R, CA = Math.cos(AROT), SA = Math.sin(AROT);
const TEAL = "#19B6B0", DEEP = "#0B3A5B", CORAL = "#FF6F59", SAND = "#F3E3C3", SRED = "#CE1126", SBLUE = "#002B7F";
const SORA = "Sora, sans-serif", MONO = '"DM Mono", monospace';
const PX = (2 * Math.tan((38 / 2) * D2R)) / 1920;

// lon/lat to world: the globe is rotated so Samoa (172W, 13.8S) is the top of the sphere at the origin.
function sph(lon, lat, h = 0) {
  const L = ((((lon - LON_S) % 360) + 540) % 360 - 180) * D2R, P = lat * D2R, r = R + h;
  const x = r * Math.cos(P) * Math.sin(L), y = r * Math.sin(P), z = r * Math.cos(P) * Math.cos(L);
  return [x, y * CA - z * SA - R, y * SA + z * CA];
}
const V3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);

function sphereGrid(lon0, lon1, lat0, lat1, nx, ny, h) {
  const pos = [], nor = [], uv = [], idx = [];
  for (let j = 0; j <= ny; j++) {
    const lat = lat1 - ((lat1 - lat0) * j) / ny;
    for (let i = 0; i <= nx; i++) {
      const lon = lon0 + ((lon1 - lon0) * i) / nx, p = sph(lon, lat, h);
      pos.push(...p);
      const n = new THREE.Vector3(p[0], p[1] + R, p[2]).normalize();
      nor.push(n.x, n.y, n.z);
      uv.push(i / nx, 1 - j / ny);
    }
  }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

// Hermite camera track, harmonic-mean tangents: never overshoots a station; two keys 1 ms apart make a clean cut.
function track(keys) {
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

function dyn(w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
  return { g: c.getContext("2d"), tx, c };
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x0b3a5b, fog: 0.004, exp: 1.0, bloom: [0.32, 0.5, 0.9] });
  scene.fog.color = new THREE.Color("#E9B7A3");
  cam.far = 1600; cam.setViewOffset(1080, 1920, 0, -70, 1080, 1920); cam.updateProjectionMatrix();
  envStrips(r, scene, [[40, 6, 0xffb48a, 2.2, 30, 3, -10], [30, 10, 0x6fd6d0, 1.2, -30, 14, 6], [40, 3, 0xffffff, 1.0, 0, 26, 0]], 0x0b2a3c);
  const rnd = mulberry(2011);

  const hemi = new THREE.HemisphereLight(0xa9e4ec, 0x0b3a5b, 1.0); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffc6a0, 2.0); scene.add(key, key.target);

  // ---------- sky dome (follows the camera) ----------
  const sunDir = new THREE.Vector3(1, -0.2, -0.3).normalize();
  const skyM = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { sunDir: { value: sunDir }, top: { value: new THREE.Color(DEEP) }, mid: { value: new THREE.Color("#2F8FA0") }, hor: { value: new THREE.Color("#FFB89A") }, low: { value: new THREE.Color("#0A2C44") }, glow: { value: new THREE.Color(CORAL) } },
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 sunDir,top,mid,hor,low,glow; varying vec3 vD;
      void main(){ vec3 d=normalize(vD); float y=d.y;
        vec3 c=mix(hor,mid,smoothstep(-0.02,0.32,y)); c=mix(c,top,smoothstep(0.3,0.8,y));
        c=mix(c,low,smoothstep(-0.02,-0.45,y));
        float s=max(dot(d,normalize(sunDir)),0.0);
        c+=glow*pow(s,14.0)*0.4+vec3(1.0,0.85,0.7)*pow(s,200.0)*0.35;
        gl_FragColor=vec4(c,1.0); }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1400, 48, 24), skyM); sky.renderOrder = -10; scene.add(sky);

  // ---------- globe texture (equirectangular), Samoa area left to the hi-res patch ----------
  const inPatch = (ring) => ring.every(([lo, la]) => lo > -176 && lo < -166 && la > -17 && la < -6);
  const GW = 4096, GH = 2048, EX = (lo) => ((lo + 180) / 360) * GW, EY = (la) => ((90 - la) / 180) * GH;
  const globeT = canvasTex(GW, GH, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#0A2F4A"); gr.addColorStop(0.42, "#0F4C6E"); gr.addColorStop(0.5, "#11567A"); gr.addColorStop(0.58, "#0F4C6E"); gr.addColorStop(1, "#0A2F4A");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const q = mulberry(5);
    for (let i = 0; i < 900; i++) { const x = q() * w, y = q() * h, rad = 20 + q() * 120, s = g.createRadialGradient(x, y, 0, x, y, rad); s.addColorStop(0, `rgba(25,182,176,${0.03 + q() * 0.05})`); s.addColorStop(1, "rgba(25,182,176,0)"); g.fillStyle = s; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
    g.strokeStyle = "rgba(255,255,255,.07)"; g.lineWidth = 1.4;
    for (let lo = -180; lo <= 180; lo += 10) { g.beginPath(); g.moveTo(EX(lo), 0); g.lineTo(EX(lo), h); g.stroke(); }
    for (let la = -80; la <= 80; la += 10) { g.beginPath(); g.moveTo(0, EY(la)); g.lineTo(w, EY(la)); g.stroke(); }
    const rings = [];
    for (const c of WORLD) for (const ring of c.rings) if (!inPatch(ring)) rings.push(ring);
    const path = () => { g.beginPath(); for (const ring of rings) ring.forEach(([lo, la], i) => (i ? g.lineTo(EX(lo), EY(la)) : g.moveTo(EX(lo), EY(la)))); };
    g.lineJoin = "round";
    path(); g.strokeStyle = "rgba(25,182,176,.18)"; g.lineWidth = 22; g.stroke(); g.strokeStyle = "rgba(25,182,176,.32)"; g.lineWidth = 9; g.stroke();
    path(); g.fillStyle = SAND; g.fill("evenodd"); g.fill();
    g.save(); path(); g.clip();
    for (let i = 0; i < 1600; i++) { const x = q() * w, y = q() * h, rad = 10 + q() * 50, s = g.createRadialGradient(x, y, 0, x, y, rad); s.addColorStop(0, `rgba(120,160,110,${0.08 + q() * 0.12})`); s.addColorStop(1, "rgba(120,160,110,0)"); g.fillStyle = s; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
    g.restore();
    path(); g.strokeStyle = "rgba(255,250,240,.85)"; g.lineWidth = 1.6; g.stroke();
  });
  globeT.anisotropy = 8;
  const globe = new THREE.Mesh(sphereGrid(-180, 180, -90, 90, 360, 180, 0), new THREE.MeshStandardMaterial({ map: globeT, roughness: 0.62, metalness: 0.0 }));
  scene.add(globe);

  // hi-res patch: Samoa, American Samoa, Tokelau (atolls drawn larger than life so they read on screen)
  const P0 = [-176, -166, -17, -6], PW = 2560, PH = 2816;
  const PXp = (lo) => ((lo - P0[0]) / (P0[1] - P0[0])) * PW, PYp = (la) => ((P0[3] - la) / (P0[3] - P0[2])) * PH;
  const patchT = canvasTex(PW, PH, (g, w, h) => {
    const q = mulberry(9);
    // soft wave glints
    g.strokeStyle = "rgba(255,255,255,.035)"; g.lineWidth = 2;
    for (let i = 0; i < 700; i++) { const x = q() * w, y = q() * h, l = 20 + q() * 60; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 4, x + l, y); g.stroke(); }
    const isl = [];
    for (const c of LOCAL) for (const ring of c.rings) isl.push({ name: c.name, pts: ring.map(([lo, la]) => [PXp(lo), PYp(la)]) });
    // Nukunonu is missing from the 50m data: a small atoll ring at its real position
    const nk = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; nk.push([PXp(-171.83 + Math.cos(a) * 0.05), PYp(-9.17 + Math.sin(a) * 0.035)]); }
    isl.push({ name: "New Zealand", pts: nk });
    for (const s of isl) if (s.name === "New Zealand") { // atolls: enlarge around their centre
      const cx = s.pts.reduce((a, p) => a + p[0], 0) / s.pts.length, cy = s.pts.reduce((a, p) => a + p[1], 0) / s.pts.length;
      s.pts = s.pts.map(([x, y]) => [cx + (x - cx) * 3.2, cy + (y - cy) * 3.2]); s.atoll = true;
    }
    const smoothPath = (p) => { g.beginPath(); const n = p.length; const m = (i) => [(p[i % n][0] + p[(i + 1) % n][0]) / 2, (p[i % n][1] + p[(i + 1) % n][1]) / 2]; g.moveTo(...m(0)); for (let i = 1; i <= n; i++) g.quadraticCurveTo(p[i % n][0], p[i % n][1], ...m(i)); g.closePath(); };
    // lagoon halo
    g.save(); g.filter = "blur(26px)";
    for (const s of isl) { smoothPath(s.pts); g.strokeStyle = "rgba(25,182,176,.55)"; g.lineWidth = s.atoll ? 40 : 70; g.stroke(); }
    g.filter = "blur(8px)";
    for (const s of isl) { smoothPath(s.pts); g.strokeStyle = "rgba(120,230,220,.75)"; g.lineWidth = s.atoll ? 14 : 24; g.stroke(); }
    g.restore();
    for (const s of isl) {
      smoothPath(s.pts);
      if (s.atoll) { g.strokeStyle = SAND; g.lineWidth = 7; g.stroke(); g.fillStyle = "rgba(60,200,195,.55)"; g.fill(); continue; }
      g.fillStyle = SAND; g.fill();
      g.save(); g.clip();
      const xs = s.pts.map((p) => p[0]), ys = s.pts.map((p) => p[1]);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2, rad = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2;
      const gr = g.createRadialGradient(cx, cy, rad * 0.1, cx, cy, rad * 0.95);
      gr.addColorStop(0, "#3F7F5E"); gr.addColorStop(0.55, "#6FA071"); gr.addColorStop(1, "rgba(111,160,113,0)"); g.fillStyle = gr; g.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
      for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(30,80,50,${0.1 + q() * 0.2})`; const a = q() * 6.28, d = q() * rad * 0.8; g.beginPath(); g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.6, 2 + q() * 5, 0, 7); g.fill(); }
      g.restore();
      smoothPath(s.pts); g.strokeStyle = "rgba(255,252,244,.95)"; g.lineWidth = 3; g.stroke();
    }
  });
  const patch = new THREE.Mesh(sphereGrid(P0[0], P0[1], P0[2], P0[3], 80, 88, 0.012), new THREE.MeshStandardMaterial({ map: patchT, transparent: true, depthWrite: false, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
  patch.renderOrder = 1; scene.add(patch);

  // atmosphere rim for the high shots
  const atmM = new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { c1: { value: new THREE.Color(TEAL) }, c2: { value: new THREE.Color("#FFB89A") }, k: { value: 1 } },
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 c1,c2; uniform float k; varying vec3 vN; varying vec3 vV; void main(){ float d=-dot(vN,vV); float a=pow(clamp(d/0.28,0.0,1.0),1.6)*k; gl_FragColor=vec4(mix(c2,c1,clamp(d*3.0,0.0,1.0))*a*0.9,1.0); }`,
  });
  const atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.04, 96, 48), atmM); atm.position.set(0, -R, 0); scene.add(atm);

  // ---------- places ----------
  const APIA = sph(-171.76, -13.83), TUT = sph(-170.7, -14.3), TOK = sph(-171.8, -9.1), BNE = sph(153.0, -27.5), AKL = sph(174.8, -36.9);

  // ---------- labels (screen-sized sprites), repainted once web fonts are ready ----------
  const paints = [];
  function label(text, { size = 30, color = "#FFFFFF", bg = "rgba(11,58,91,.72)", border = "rgba(255,255,255,.55)", family = SORA, weight = 700 } = {}) {
    const c = document.createElement("canvas"), g = c.getContext("2d");
    const font = `${weight} ${size}px ${family}`;
    g.font = font; const w = Math.ceil(g.measureText(text).width * 1.12) + 56, h = Math.ceil(size * 1.9);
    c.width = w; c.height = h;
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({ map: tex, sizeAttenuation: false, depthTest: false, depthWrite: false, transparent: true, fog: false, opacity: 0 });
    const s = new THREE.Sprite(mat); s.renderOrder = 60; s.center.set(0.5, 0);
    const paint = () => { g.clearRect(0, 0, w, h); rr(g, 3, 3, w - 6, h - 6, (h - 6) / 2); g.fillStyle = bg; g.fill(); g.lineWidth = 2; g.strokeStyle = border; g.stroke(); g.font = font; g.letterSpacing = "2px"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = color; g.fillText(text, w / 2, h / 2 + 2); tex.needsUpdate = true; };
    paint(); paints.push(paint); s.scale.set(w * PX, h * PX, 1); scene.add(s); return s;
  }
  const at3 = (s, p, dy = 0) => { s.position.set(p[0], p[1] + dy, p[2]); return s; };
  const L = {
    samoa: at3(label("SAMOA"), APIA, 0.28),
    samoaW: at3(label("SAMOA"), APIA, 2.4),
    asam: at3(label("SAMOA AMERIKA", { size: 26 }), TUT, 0.28),
    tok: at3(label("TOKELAU", { bg: "rgba(255,111,89,.85)" }), TOK, 0.55),
    aus: at3(label("AUSTRALIA"), BNE, 1.2),
    nz: at3(label("SELANDIA BARU"), AKL, 1.2),
    apia: at3(label("APIA", { size: 26 }), APIA, 0.18),
    idl: label("GARIS TANGGAL INTERNASIONAL", { size: 24, bg: "rgba(255,111,89,.88)", border: "rgba(255,255,255,.8)" }),
    west: label("BARAT: HARI LEBIH DULU", { size: 22, family: MONO, weight: 500 }),
    east: label("TIMUR: HARI BELAKANGAN", { size: 22, family: MONO, weight: 500 }),
  };

  // ---------- markers ----------
  const ringM = (col) => new THREE.MeshBasicMaterial({ color: col, transparent: true, depthWrite: false, opacity: 0, side: THREE.DoubleSide, fog: false });
  const marker = (p, col) => { const m = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 64), ringM(col)); m.rotation.x = -Math.PI / 2; m.position.set(p[0], p[1] + 0.03, p[2]); m.renderOrder = 5; scene.add(m); return m; };
  const mkS = marker(APIA, CORAL), mkS2 = marker(APIA, CORAL), mkT = marker(TOK, CORAL), mkA = marker(BNE, TEAL), mkN = marker(AKL, TEAL);

  // ---------- date line: light curtain + bright core, morphs between the 1892-2011 shape (west of Samoa) and the outside shape ----------
  // lon east-positive (0..360) so the antimeridian is continuous
  const OUTSIDE = [[180, 40], [180, 5], [180, -4], [189.4, -9.6], [188.9, -12.5], [188.9, -15.2], [187.5, -17], [187.5, -45], [180, -51], [180, -70]];
  const INSIDE = [[180, 40], [180, 5], [180, -4], [180, -9.6], [180, -12.5], [180, -15.2], [187.5, -17], [187.5, -45], [180, -51], [180, -70]];
  const NSUB = 40, NP = (OUTSIDE.length - 1) * NSUB + 1;
  const linePts = (m) => {
    const o = [];
    for (let s = 0; s < OUTSIDE.length - 1; s++) for (let k = 0; k < (s === OUTSIDE.length - 2 ? NSUB + 1 : NSUB); k++) {
      const u = k / NSUB, a0 = OUTSIDE[s], a1 = OUTSIDE[s + 1], b0 = INSIDE[s], b1 = INSIDE[s + 1];
      const lo0 = a0[0] + (b0[0] - a0[0]) * m, lo1 = a1[0] + (b1[0] - a1[0]) * m;
      o.push([lo0 + (lo1 - lo0) * u, a0[1] + (a1[1] - a0[1]) * u]);
    }
    return o;
  };
  const curG = new THREE.BufferGeometry(), curPos = new Float32Array(NP * 2 * 3), curCol = new Float32Array(NP * 2 * 3), curIdx = [];
  for (let i = 0; i < NP - 1; i++) { const a = i * 2; curIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  curG.setAttribute("position", new THREE.BufferAttribute(curPos, 3)); curG.setAttribute("color", new THREE.BufferAttribute(curCol, 3)); curG.setIndex(curIdx);
  const curtain = new THREE.Mesh(curG, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  curtain.frustumCulled = false; curtain.renderOrder = 8; scene.add(curtain);
  const coreG = new THREE.BufferGeometry(), corePos = new Float32Array(NP * 2 * 3), coreCol = new Float32Array(NP * 2 * 3);
  coreG.setAttribute("position", new THREE.BufferAttribute(corePos, 3)); coreG.setAttribute("color", new THREE.BufferAttribute(coreCol, 3)); coreG.setIndex(curIdx);
  const core = new THREE.Mesh(coreG, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  core.frustumCulled = false; core.renderOrder = 9; scene.add(core);
  const cCor = new THREE.Color(CORAL), cTeal = new THREE.Color(TEAL), cW = new THREE.Color("#FFE3D6");
  const runner = pts(scene, 40, { color: 0xffd2c4, size: 0.5, opacity: 0.9 });
  function drawLine(morph, prog, H, wid, glow, t) {
    const P = linePts(morph), up = new THREE.Vector3();
    let dmin = 1e9; for (let i = 0; i < NP; i += 4) { const p = sph(P[i][0], P[i][1], 0); dmin = Math.min(dmin, Math.hypot(p[0] - cam.position.x, p[2] - cam.position.z)); }
    const cf = 0.32 * clamp01((dmin - 1.2) / 4), kf = 0.35 + 0.65 * clamp01((dmin - 0.8) / 3);
    const lim = prog * (NP - 1);
    for (let i = 0; i < NP; i++) {
      const p = sph(P[i][0], P[i][1], 0.04), q = sph(P[Math.min(NP - 1, i + 1)][0], P[Math.min(NP - 1, i + 1)][1], 0.04), q0 = sph(P[Math.max(0, i - 1)][0], P[Math.max(0, i - 1)][1], 0.04);
      up.set(p[0], p[1] + R, p[2]).normalize();
      const tx = q[0] - q0[0], ty = q[1] - q0[1], tz = q[2] - q0[2];
      const side = new THREE.Vector3(tx, ty, tz).cross(up).normalize();
      const vis = clamp01(lim - i + 1), fade = glow * vis * (0.75 + 0.25 * Math.sin(i * 0.21 - t * 3.0));
      curPos.set([p[0], p[1], p[2], p[0] + up.x * H, p[1] + up.y * H, p[2] + up.z * H], i * 6);
      curCol.set([cCor.r * cf * fade, cCor.g * cf * fade, cCor.b * cf * fade, 0, 0, 0], i * 6);
      corePos.set([p[0] - side.x * wid, p[1] - side.y * wid, p[2] - side.z * wid, p[0] + side.x * wid, p[1] + side.y * wid, p[2] + side.z * wid], i * 6);
      const cc = cW.clone().lerp(cCor, 0.35);
      const ff = fade * kf; coreCol.set([cc.r * ff, cc.g * ff, cc.b * ff, cc.r * ff, cc.g * ff, cc.b * ff], i * 6);
    }
    curG.attributes.position.needsUpdate = curG.attributes.color.needsUpdate = coreG.attributes.position.needsUpdate = coreG.attributes.color.needsUpdate = true;
    for (let k = 0; k < 40; k++) {
      const u = ((k / 40 + t * 0.035) % 1) * prog, i = Math.floor(u * (NP - 1)), p = sph(P[i][0], P[i][1], 0.05 + H * (0.15 + 0.5 * ((k * 7) % 10) / 10));
      runner.pos.set(p, k * 3); runner.col.set([cW.r * glow, cW.g * glow, cW.b * glow], k * 3);
    }
    runner.m.size = H * 0.12; runner.commit();
    return P;
  }

  // ---------- glass ----------
  const glassM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, roughness: 0.3, thickness: 0.5, ior: 1.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, attenuationColor: new THREE.Color("#c8f1ec"), attenuationDistance: 3, envMapIntensity: 1.2, transparent: true, opacity: 1 });
  const slabGeo = (w, h, d = 0.05, rad = 0.12) => {
    const s = new THREE.Shape(); const x = -w / 2, y = -h / 2;
    s.moveTo(x + rad, y); s.lineTo(x + w - rad, y); s.quadraticCurveTo(x + w, y, x + w, y + rad); s.lineTo(x + w, y + h - rad); s.quadraticCurveTo(x + w, y + h, x + w - rad, y + h); s.lineTo(x + rad, y + h); s.quadraticCurveTo(x, y + h, x, y + h - rad); s.lineTo(x, y + rad); s.quadraticCurveTo(x, y, x + rad, y);
    const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 8 });
    g.translate(0, 0, -d / 2); return g;
  };

  // calendar page: glass slab + frosted face; hinge at the top edge so it can tear upward
  const PW3 = 1.7, PH3 = 2.1;
  function paintPage(g, w, h, o) {
    g.clearRect(0, 0, w, h);
    rr(g, 6, 6, w - 12, h - 12, 44);
    const fr = g.createLinearGradient(0, 0, w, h); fr.addColorStop(0, "rgba(255,255,255,.62)"); fr.addColorStop(0.5, "rgba(240,250,250,.42)"); fr.addColorStop(1, "rgba(220,240,242,.5)");
    g.fillStyle = fr; g.fill(); g.lineWidth = 4; g.strokeStyle = "rgba(255,255,255,.9)"; g.stroke();
    g.save(); rr(g, 6, 6, w - 12, h - 12, 44); g.clip();
    g.fillStyle = o.accent; g.fillRect(0, 0, w, 150);
    g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(0, 150, w, 6);
    g.restore();
    for (const x of [w * 0.28, w * 0.72]) { g.beginPath(); g.arc(x, 40, 16, 0, 7); g.fillStyle = "rgba(11,58,91,.55)"; g.fill(); }
    g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `500 54px ${MONO}`; g.letterSpacing = "6px"; g.fillStyle = "#FFFFFF"; g.fillText(o.top, w / 2, 96);
    g.letterSpacing = "0px"; g.font = `800 330px ${SORA}`; g.fillStyle = DEEP; g.fillText(o.big, w / 2, h * 0.53);
    g.font = `700 92px ${SORA}`; g.letterSpacing = "8px"; g.fillStyle = o.dayCol || CORAL; g.fillText(o.day, w / 2, h * 0.83);
    if (o.badge) { g.font = `500 40px ${MONO}`; g.letterSpacing = "4px"; const tw = g.measureText(o.badge).width + 50; rr(g, (w - tw) / 2, h * 0.9, tw, 64, 32); g.fillStyle = o.badgeBg || DEEP; g.fill(); g.fillStyle = "#fff"; g.fillText(o.badge, w / 2, h * 0.9 + 34); }
  }
  function page(o, scale = 1) {
    const root = new THREE.Group(), hinge = new THREE.Group(), body = new THREE.Group();
    root.add(hinge); hinge.position.y = (PH3 / 2) * scale; hinge.add(body); body.position.y = (-PH3 / 2) * scale; body.scale.setScalar(scale);
    const slab = new THREE.Mesh(slabGeo(PW3, PH3), glassM.clone()); body.add(slab);
    const d = dyn(640, 790); const faceM = new THREE.MeshBasicMaterial({ map: d.tx, transparent: true, depthWrite: false, toneMapped: false, fog: false });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(PW3, PH3), faceM); face.position.z = 0.06; face.renderOrder = 20; body.add(face);
    const paint = () => { paintPage(d.g, 640, 790, o); d.tx.needsUpdate = true; }; paint(); paints.push(paint);
    scene.add(root);
    return { root, hinge, body, slab, face, faceM, tex: d.tx, set(a) { root.visible = a > 0.002; faceM.opacity = a; slab.material.opacity = Math.min(1, a * 1.4); } };
  }
  const CAL = [-3.4, 3.5, 2.2], CAL92 = [-7.4, 3.2, 0.9], DIAL = [3.8, 3.1, 2.0];
  const pgFri = page({ top: "DES 2011", big: "30", day: "JUMAT", accent: CORAL });
  const pgThu = page({ top: "DES 2011", big: "29", day: "KAMIS", accent: TEAL });
  const pgSat = page({ top: "DES 2011", big: "31", day: "SABTU", accent: TEAL });
  const pg92a = page({ top: "JULI 1892", big: "4", day: "SENIN", accent: SBLUE, dayCol: SRED });
  const pg92b = page({ top: "JULI 1892", big: "4", day: "SENIN", accent: SBLUE, dayCol: SRED, badge: "LAGI", badgeBg: SRED });
  const pgS25 = page({ top: "DES", big: "25", day: "NATAL", accent: TEAL, badge: "SAMOA", badgeBg: SBLUE }, 0.22);
  const pgA24 = page({ top: "DES", big: "24", day: "MASIH", dayCol: DEEP, accent: "#7A8C99", badge: "SAMOA AMERIKA", badgeBg: "#5B6B78" }, 0.22);

  // cracks over the Friday page (s1 hook, s8 ghost)
  const crackT = canvasTex(640, 790, (g, w, h) => {
    const q = mulberry(30); g.strokeStyle = "rgba(255,255,255,.95)"; g.lineCap = "round";
    const cx = w * 0.52, cy = h * 0.5;
    for (let k = 0; k < 14; k++) { let x = cx, y = cy, a = (k / 14) * 6.283 + q() * 0.3; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 9; s++) { a += (q() - 0.5) * 0.7; const l = 30 + q() * 50; x += Math.cos(a) * l; y += Math.sin(a) * l; g.lineTo(x, y); g.lineWidth = 4 - s * 0.35; } g.stroke(); }
    for (let k = 1; k <= 3; k++) { g.lineWidth = 2.5; g.beginPath(); for (let i = 0; i <= 18; i++) { const a = (i / 18) * 6.283, rad = k * 80 + q() * 22; i ? g.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad) : g.moveTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); } g.stroke(); }
  });
  const crackM = new THREE.MeshBasicMaterial({ map: crackT, transparent: true, depthWrite: false, toneMapped: false, opacity: 0, fog: false });
  const crack = new THREE.Mesh(new THREE.PlaneGeometry(PW3, PH3), crackM); crack.position.z = 0.075; crack.renderOrder = 21; pgFri.body.add(crack);

  // shards: jittered grid over the Friday face, two triangles per cell
  const SX = 6, SY = 7, grid = [];
  for (let j = 0; j <= SY; j++) for (let i = 0; i <= SX; i++) { const edge = i === 0 || j === 0 || i === SX || j === SY; grid.push([(i / SX - 0.5 + (edge ? 0 : (rnd() - 0.5) * 0.11)) * PW3, (j / SY - 0.5 + (edge ? 0 : (rnd() - 0.5) * 0.09)) * PH3]); }
  const shardM = new THREE.MeshBasicMaterial({ map: pgFri.tex, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, fog: false });
  const shardEdgeM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, roughness: 0.15, thickness: 0.2, ior: 1.4, transparent: true, side: THREE.DoubleSide, envMapIntensity: 1.5 });
  const shards = [], shardRoot = new THREE.Group(); scene.add(shardRoot);
  for (let j = 0; j < SY; j++) for (let i = 0; i < SX; i++) {
    const a = grid[j * (SX + 1) + i], b = grid[j * (SX + 1) + i + 1], c = grid[(j + 1) * (SX + 1) + i], d = grid[(j + 1) * (SX + 1) + i + 1];
    for (const tri of [[a, b, d], [a, d, c]]) {
      const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(tri.flatMap((p) => [p[0] - cx, p[1] - cy, 0]), 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(tri.flatMap((p) => [p[0] / PW3 + 0.5, p[1] / PH3 + 0.5]), 2));
      const m = new THREE.Mesh(g, shardM); m.renderOrder = 22;
      const e = new THREE.Mesh(g, shardEdgeM); e.position.z = -0.02; m.add(e);
      shardRoot.add(m);
      const dx = cx - 0.05, dy = cy - 0.05, dl = Math.hypot(dx, dy) + 0.2;
      shards.push({ m, cx, cy, vx: (dx / dl) * (1.4 + rnd() * 1.8), vy: (dy / dl) * (1.2 + rnd() * 1.6) + 0.9, vz: 0.8 + rnd() * 2.6, wx: (rnd() - 0.5) * 9, wy: (rnd() - 0.5) * 9, wz: (rnd() - 0.5) * 7, lag: Math.hypot(cx, cy) * 0.06 });
    }
  }
  const sparks = pts(scene, 160, { color: 0xffe6da, size: 0.07, opacity: 1 });
  const sparkSeed = Array.from({ length: 160 }, () => [rnd() - 0.5, rnd() - 0.5, rnd(), rnd()]);

  // ---------- glass day-dial ----------
  const dial = new THREE.Group(); dial.position.set(...DIAL); scene.add(dial);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.1, 96), glassM.clone()); disc.rotation.x = Math.PI / 2; dial.add(disc);
  const rimM = new THREE.MeshStandardMaterial({ color: 0xeafcff, emissive: new THREE.Color(TEAL), emissiveIntensity: 0.45, roughness: 0.2, metalness: 0.6, transparent: true });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.57, 0.035, 16, 160), rimM); dial.add(rim);
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.8 })); hub.position.z = 0.1; dial.add(hub);
  const dd = dyn(1024, 1024);
  const dialFaceM = new THREE.MeshBasicMaterial({ map: dd.tx, transparent: true, depthWrite: false, toneMapped: false, fog: false });
  const dialFace = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), dialFaceM); dialFace.position.z = 0.07; dialFace.renderOrder = 20; dial.add(dialFace);
  let dialKey = "";
  function paintDial(s) {
    const k = JSON.stringify(s); if (k === dialKey) return; dialKey = k;
    const g = dd.g, W = 1024, c = W / 2; g.clearRect(0, 0, W, W);
    const gr = g.createRadialGradient(c, c - 120, 40, c, c, 500); gr.addColorStop(0, "rgba(255,255,255,.5)"); gr.addColorStop(1, "rgba(215,240,242,.32)");
    g.beginPath(); g.arc(c, c, 492, 0, 7); g.fillStyle = gr; g.fill();
    const ang = (h) => (h / 24) * Math.PI * 2 - Math.PI / 2;
    if (s.arc > 0) { g.beginPath(); g.arc(c, c, 420, ang(s.h1), ang(s.h1 + s.arc), false); g.lineWidth = 34; g.lineCap = "round"; g.strokeStyle = "rgba(255,111,89,.9)"; g.stroke(); }
    for (let i = 0; i < 24; i++) {
      const a = ang(i), r0 = i % 6 === 0 ? 452 : 466;
      g.beginPath(); g.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0); g.lineTo(c + Math.cos(a) * 486, c + Math.sin(a) * 486); g.lineWidth = i % 6 === 0 ? 7 : 3; g.strokeStyle = DEEP; g.stroke();
      if (i % 3 === 0) { g.font = `500 40px ${MONO}`; g.fillStyle = DEEP; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(i).padStart(2, "0"), c + Math.cos(a) * 372, c + Math.sin(a) * 372); }
    }
    const hand = (h, col, len, wd, lab) => {
      const a = ang(h); g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.cos(a) * len, c + Math.sin(a) * len); g.lineWidth = wd; g.lineCap = "round"; g.strokeStyle = col; g.stroke();
      if (lab) { g.font = `700 30px ${SORA}`; const tx = c + Math.cos(a) * (len - 90), ty = c + Math.sin(a) * (len - 90); const tw = g.measureText(lab).width + 30; rr(g, tx - tw / 2, ty - 24, tw, 48, 24); g.fillStyle = col; g.fill(); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(lab, tx, ty + 1); }
    };
    if (s.h2 !== undefined) hand(s.h2, TEAL, 330, 16, s.l2);
    hand(s.h1, CORAL, 300, 20, s.l1);
    g.textAlign = "center"; g.textBaseline = "middle";
    rr(g, c - 190, c + 70, 380, 150, 30); g.fillStyle = "rgba(11,58,91,.86)"; g.fill();
    g.font = `800 ${s.big.length > 6 ? 70 : 84}px ${SORA}`; g.fillStyle = "#fff"; g.fillText(s.big, c, c + 135);
    if (s.sub) { g.font = `500 30px ${MONO}`; g.letterSpacing = "3px"; g.fillStyle = DEEP; g.fillText(s.sub, c, c + 260); g.letterSpacing = "0px"; }
    dd.tx.needsUpdate = true;
  }

  // ---------- schooner (1892) ----------
  const ship = new THREE.Group(); scene.add(ship);
  {
    const hs = new THREE.Shape(); hs.moveTo(-0.5, 0.06); hs.lineTo(0.56, 0.06); hs.quadraticCurveTo(0.42, -0.08, 0.3, -0.1); hs.lineTo(-0.42, -0.1); hs.quadraticCurveTo(-0.52, -0.04, -0.5, 0.06);
    const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(hs, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 }), new THREE.MeshStandardMaterial({ color: 0x3b2a20, roughness: 0.6 }));
    hull.position.z = -0.09; ship.add(hull);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.025, 0.225), new THREE.MeshStandardMaterial({ color: 0xf3e3c3, roughness: 0.5 })); stripe.position.set(0.02, 0.035, 0); ship.add(stripe);
    const mastM = new THREE.MeshStandardMaterial({ color: 0x5a3b26, roughness: 0.6 });
    const sailM = new THREE.MeshStandardMaterial({ color: 0xf7ecd6, roughness: 0.75, side: THREE.DoubleSide, emissive: 0xffb48a, emissiveIntensity: 0.12 });
    for (const [mx, mh] of [[-0.14, 0.78], [0.2, 0.68]]) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, mh, 8), mastM); m.position.set(mx, 0.06 + mh / 2, 0); ship.add(m);
      const sg = new THREE.PlaneGeometry(0.3, mh * 0.72, 8, 8); const p = sg.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.04 * Math.sin((p.getX(i) / 0.3 + 0.5) * Math.PI)); sg.computeVertexNormals();
      const s = new THREE.Mesh(sg, sailM); s.position.set(mx - 0.16, 0.12 + mh * 0.4, 0); ship.add(s);
    }
    const jib = new THREE.BufferGeometry(); jib.setAttribute("position", new THREE.Float32BufferAttribute([0.22, 0.68, 0, 0.62, 0.08, 0, 0.24, 0.12, 0], 3)); jib.computeVertexNormals();
    ship.add(new THREE.Mesh(jib, sailM));
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.055), new THREE.MeshBasicMaterial({ color: 0xce1126, side: THREE.DoubleSide })); flag.position.set(-0.19, 0.86, 0); ship.add(flag);
    ship.scale.setScalar(0.9);
  }
  const wake = pts(scene, 90, { color: 0xffffff, size: 0.035, opacity: 0.6 });
  const SHIP0 = sph(-171.95, -14.18), SHIP1 = sph(-171.55, -14.2);

  // ---------- trade arcs ----------
  function arcCurve(to, lift) {
    const a = [-171.76, -13.83], P = [];
    const tl = [to[0] < 0 ? to[0] + 360 : to[0], to[1]], al = [a[0] + 360, a[1]];
    for (let i = 0; i <= 60; i++) { const u = i / 60; P.push(V3(sph(al[0] + (tl[0] - al[0]) * u, al[1] + (tl[1] - al[1]) * u, 0.1 + lift * Math.sin(Math.PI * u)))); }
    return new THREE.CatmullRomCurve3(P);
  }
  const arcM = (c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const cA = arcCurve([153.0, -27.5], 5), cN = arcCurve([174.8, -36.9], 3.5);
  const tubeA = new THREE.Mesh(new THREE.TubeGeometry(cA, 200, 0.16, 8), arcM(TEAL)), tubeN = new THREE.Mesh(new THREE.TubeGeometry(cN, 200, 0.16, 8), arcM(TEAL));
  scene.add(tubeA, tubeN);
  const cargo = pts(scene, 24, { color: 0xffe0c8, size: 0.9, opacity: 1 });

  // ---------- atmosphere: clouds, glints, floating glass chips ----------
  const cloudT = canvasTex(256, 256, (g, w) => { const q = mulberry(4); for (let i = 0; i < 22; i++) { const x = 60 + q() * 136, y = 100 + q() * 60, rad = 30 + q() * 50, s = g.createRadialGradient(x, y, 0, x, y, rad); s.addColorStop(0, "rgba(255,255,255,.55)"); s.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = s; g.fillRect(0, 0, w, w); } });
  const clouds = [];
  const near = (p) => [CAL, CAL92, DIAL, [0, 0.5, 0], [0.8, 0.5, 0.3], TOK].some((s) => Math.hypot(p[0] - s[0], p[2] - s[2]) < 2.6 && Math.abs(p[1] - s[1]) < 2.2);
  for (let i = 0; i < 40; i++) {
    const hi = i >= 26, x = hi ? -50 + rnd() * 80 : -16 + rnd() * 28, z = hi ? -40 + rnd() * 80 : -12 + rnd() * 18, y = hi ? 8 + rnd() * 10 : 0.4 + rnd() * 1.6;
    if (!hi && near([x, y, z])) continue;
    const m = new THREE.SpriteMaterial({ map: cloudT, transparent: true, depthWrite: false, color: new THREE.Color("#FFE9DC"), opacity: hi ? 0.16 : 0.22, fog: true });
    const s = new THREE.Sprite(m); const sc = hi ? 14 + rnd() * 16 : 2 + rnd() * 3; s.scale.set(sc, sc * 0.32, 1); s.position.set(x, y, z); scene.add(s); clouds.push({ s, x, sp: 0.03 + rnd() * 0.05 });
  }
  const glint = pts(scene, 220, { color: 0xbff4ef, size: 0.06, opacity: 0.9 });
  const gl0 = Array.from({ length: 220 }, () => [-12 + rnd() * 20, 0.5 + rnd() * 6, -6 + rnd() * 14, rnd() * 6.28]);
  const chips = [];
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(slabGeo(0.35 + rnd() * 0.5, 0.35 + rnd() * 0.6, 0.03, 0.08), glassM);
    const base = [-10 + rnd() * 18, 1.5 + rnd() * 5, -3 + rnd() * 8];
    if (near(base)) { i--; continue; }
    m.position.set(...base); scene.add(m); chips.push({ m, base, ph: rnd() * 6.28 });
  }

  // ---------- sun ----------
  const sunT = canvasTex(256, 256, (g, w) => { const s = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); s.addColorStop(0, "rgba(255,246,228,1)"); s.addColorStop(0.18, "rgba(255,214,170,.95)"); s.addColorStop(0.4, "rgba(255,140,100,.35)"); s.addColorStop(1, "rgba(255,111,89,0)"); g.fillStyle = s; g.fillRect(0, 0, w, w); });
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunT, transparent: true, depthWrite: false, fog: false, color: new THREE.Color(0.9, 0.85, 0.8) })); sun.scale.set(55, 55, 1); scene.add(sun);

  // ---------- timing ----------
  const tGaris = A("s2:garis"), tGaris2 = A("s2:Garis"), tBerganti = A("s2:berganti");
  const t92 = A("s3:1892"), tPed = A("s3:pedagang"), tKing = A("s3:Mālietoa"), tMakai = A("s3:memakai"), tCara = A("s3:Caranya"), tSenin = A("s3:Senin"), tUlang = A("s3:diulang"), tMerdeka = A("s3:kemerdekaan");
  const tAus = A("s4:Australia"), tNz = A("s4:Selandia"), tTing = A("s4:Tertinggal"), tJam = A("s4:21"), tHari = A("s4:hari"), tEmpat = A("s4:empat");
  const tTui = A("s5:Tuilaepa"), tKamis = A("s5:Kamis"), tTepat = A("s5:tepat"), tMid = A("s5:malam") + 0.3, tLomp = A("s5:melompat"), tSabtu = A("s5:Sabtu");
  const tZona = A("s6:Zona"), tMinus = A("s6:minus"), tPlus = A("s6:plus"), tTok = A("s6:Tokelau"), tIkut = A("s6:ikut");
  const tS7 = K.s7, tNatal = A("s7:Natal"), tKini = A("s7:Kini"), tMulang = A("s8:mengulang"), tHapus = A("s8:menghapus");

  const v = (p, d) => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
  const key6 = (t, p, l) => [t, ...p, ...l];
  const ISL = [0.75, 0.2, 0.2];
  const camT = track([
    key6(0, v(CAL, [0.7, 0.9, 10.6]), v(CAL, [0, -0.35, 0])),
    key6(A("s1:ada"), v(CAL, [-0.4, 0.75, 9.4]), v(CAL, [0, -0.3, 0])),
    key6(K.s2 + 1.6, [5, 56, 74], [-2, -8, 2]),
    key6(tGaris, [4, 46, 60], [-1, -6, 1]),
    key6(tGaris2, [3, 22, 30], [0.2, -1.5, 0.8]),
    key6(K.s2e - 0.1, [1.7, 6.8, 9.2], [0.6, 0, 0.3]),
    key6(t92 + 0.6, [1.1, 2.6, 4.6], [0.1, 0, 0.3]),
    key6(tPed + 0.3, [0.5, 1.7, 4.7], [-0.1, 0.46, 0.45]),
    key6(tKing + 0.4, [-0.9, 1.6, 4.5], [0.0, 0.46, 0.45]),
    key6(tMakai, [-1.6, 6, 10], [-2.4, 0, 0]),
    key6(tCara - 0.4, [-3.6, 15, 21], [-3.6, -0.5, -1.5]),
    key6(tCara, v(CAL92, [1.0, 1.4, 14.5]), v(CAL92, [0, 0.2, 0])),
    key6(tUlang, v(CAL92, [-0.3, 1.0, 13.6]), v(CAL92, [0, 0.2, 0])),
    key6(K.s3e, v(CAL92, [0.6, 0.8, 13.0]), v(CAL92, [0, 0.2, 0])),
    key6(K.s4 + 1.2, [-6, 34, 42], [-9, -6, 8]),
    key6(tAus, [-7, 70, 78], [-11, -12, 12]),
    key6(tTing - 0.05, [-8, 74, 82], [-11, -12, 12]),
    key6(tTing, v(DIAL, [0.9, 1.0, 16.8]), v(DIAL, [0, -0.1, 0])),
    key6(K.s4e, v(DIAL, [-0.4, 0.6, 15.6]), v(DIAL, [0, -0.1, 0])),
    key6(K.s5, [1.6, 2.8, 4.4], [0.25, 0, 0.15]),
    key6(tKamis - 0.05, [-0.7, 2.2, 4.0], [0.25, 0, 0.15]),
    key6(tKamis, v(CAL, [0.6, 0.7, 10.6]), v(CAL, [0, -0.1, 0])),
    key6(tMid, v(CAL, [0.1, 0.45, 9.4]), v(CAL, [0, -0.1, 0])),
    key6(tSabtu, v(CAL, [-0.3, 0.4, 9.8]), v(CAL, [0, -0.1, 0])),
    key6(K.s6 + 1.2, v(CAL, [-0.2, 2.6, 13]), v(CAL, [1.5, -1.5, -3])),
    key6(tZona - 0.05, v(CAL, [-0.1, 2.8, 13.5]), v(CAL, [1.7, -1.6, -3])),
    key6(tZona, v(DIAL, [0.8, 0.9, 16.8]), v(DIAL, [0, -0.1, 0])),
    key6(tTok - 0.05, v(DIAL, [-0.4, 0.5, 15.6]), v(DIAL, [0, -0.1, 0])),
    key6(tTok, v(TOK, [1.1, 4.6, 7.4]), v(TOK, [0.5, 0, 0.9])),
    key6(K.s6e, v(TOK, [0.4, 3.8, 6.2]), v(TOK, [0.5, 0, 0.9])),
    key6(tS7, v(ISL, [-0.1, 2.0, 4.9]), [0.75, 0.32, 0.2]),
    key6(tKini - 0.2, v(ISL, [0.2, 1.7, 4.3]), [0.75, 0.32, 0.2]),
    key6(tKini + 1.6, [-1.6, 1.3, 2.6], [3, -0.2, -0.6]),
    key6(K.s7e, [-2.0, 1.4, 2.8], [3, 0.1, -0.6]),
    key6(K.s8, [-5.8, 3.2, 21], [-5.8, 2.6, 1.4]),
    key6(K.end - 2.5, [-5.5, 3.6, 22], [-5.8, 2.5, 1.4]),
    key6(K.dur, [-3, 26, 40], [-4, 0, 0]),
  ]);
  const tgt = new THREE.Vector3();

  // sunrise: the sun sits below the horizon until Samoa greets the new day
  const sunAt = (t) => { const e = -0.42 + 0.33 * ramp(t, tKini - 0.4, tKini + 3.2); return new THREE.Vector3(Math.cos(e) * 0.83, Math.sin(e), -0.56 * Math.cos(e)).normalize(); };

  let fontsOK = false;
  try { document.fonts.load(`800 60px Sora`); document.fonts.load(`500 40px "DM Mono"`); } catch (e) { }

  return (t) => {
    if (!fontsOK) { try { if (document.fonts.check("800 60px Sora") && document.fonts.check('500 40px "DM Mono"')) { paints.forEach((f) => f()); dialKey = ""; fontsOK = true; } } catch (e) { fontsOK = true; } }
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.08 * (1 + c[1] * 0.05), c[1] + Math.sin(t * 0.29) * 0.05 * (1 + c[1] * 0.05), c[2] + Math.cos(t * 0.31) * 0.08);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    const alt = cam.position.y;
    const camD = cam.position.distanceTo(tgt);
    sky.position.copy(cam.position);
    scene.fog.density = 0.016 / (1 + alt * 0.35);
    atm.visible = alt > 12; atmM.uniforms.k.value = ramp(alt, 12, 40);

    // sun and light
    const sd = sunAt(t); sunDir.copy(sd).add(new THREE.Vector3(0, 0.1, 0)).normalize();
    sun.position.set(sd.x * 600, sd.y * 600, sd.z * 600).add(new THREE.Vector3(cam.position.x, 0, cam.position.z));
    key.position.set(cam.position.x + sd.x * 100, Math.max(8, sd.y * 100 + 30), cam.position.z + sd.z * 100); key.target.position.copy(tgt);
    const dawn = ramp(t, tKini, tKini + 3);
    key.intensity = 1.6 - 0.5 * dawn; hemi.intensity = 0.95 + 0.1 * dawn;

    // date line state: outside Samoa -> inside (1892) -> outside (2011)
    const morph = ramp(t, tMakai, A("s3:Amerika#2") + 0.9) * (1 - ramp(t, tLomp, tSabtu + 0.9));
    const prog = t < K.s2 ? 0 : ramp(t, tGaris - 0.2, tGaris + 1.6);
    const H = 0.4 + Math.min(camD, 60) * 0.06, wid = 0.012 + camD * 0.0024;
    const glow = 0.85 + 0.6 * Math.exp(-Math.max(0, t - tGaris2) * 1.5) * (t > tGaris2 ? 1 : 0) + 0.5 * (ramp(t, tLomp, tLomp + 0.3) - ramp(t, tSabtu + 0.5, tSabtu + 1.6));
    const P = drawLine(morph, prog, H, wid, glow * (t < K.s2 ? 0 : 1), t);
    curtain.visible = core.visible = t > K.s2;
    // labels on the line
    const li = Math.floor(NP * 0.335), lp = sph(P[li][0], P[li][1], 0);
    const idlOn = ramp(t, tGaris + 0.6, tGaris + 1.0) * (1 - ramp(t, K.s3 - 0.3, K.s3));
    L.idl.position.set(lp[0], lp[1] + H * 0.9, lp[2] - 2); L.idl.material.opacity = 0 * idlOn;
    const sideOn = ramp(t, tBerganti - 0.5, tBerganti) * (1 - ramp(t, K.s3 - 0.3, K.s3));
    const lb = sph(P[li][0], P[li][1], 0);
    L.west.position.set(lb[0] - 1.7, lb[1] + 0.35, lb[2] + 1.6); L.east.position.set(lb[0] + 1.9, lb[1] + 0.35, lb[2] + 1.6);
    L.west.center.set(1, 0); L.east.center.set(0, 0);
    L.west.material.opacity = L.east.material.opacity = sideOn;

    // place labels and markers
    const pulse = (t * 1.3) % 1;
    const sOn = ramp(t, A("s2:Samoa"), A("s2:Samoa") + 0.4) * (1 - ramp(t, K.s3 + 0.5, K.s3 + 0.9)) + 0;
    L.samoa.material.opacity = sOn * (alt < 14 ? 1 : 0); L.samoaW.material.opacity = (ramp(t, A("s2:Samoa"), A("s2:Samoa") + 0.4) * (1 - ramp(t, tGaris2, tGaris2 + 0.4)) + ramp(t, K.s4 + 0.6, K.s4 + 1) * (1 - ramp(t, tTing - 0.3, tTing))) * (alt >= 14 ? 1 : 0);
    L.samoaW.position.y = APIA[1] + alt * 0.04;
    L.asam.material.opacity = ramp(t, K.s2e - 1.2, K.s2e - 0.8) * (1 - ramp(t, K.s3, K.s3 + 0.3));
    L.apia.material.opacity = ramp(t, K.s5 + 0.2, K.s5 + 0.6) * (1 - ramp(t, tKamis - 0.3, tKamis)) + ramp(t, tPed, tPed + 0.4) * (1 - ramp(t, tMakai - 0.3, tMakai));
    L.tok.material.opacity = ramp(t, tTok + 0.2, tTok + 0.6) * (1 - ramp(t, K.s7 - 0.3, K.s7));
    L.tok.position.y = TOK[1] + 0.55 + 0.35 * Math.max(0, Math.sin(Math.PI * clamp01((t - tIkut) / 0.6)));
    L.aus.material.opacity = ramp(t, tAus, tAus + 0.4) * (1 - ramp(t, tTing - 0.3, tTing));
    L.nz.material.opacity = ramp(t, tNz, tNz + 0.4) * (1 - ramp(t, tTing - 0.3, tTing));
    L.aus.position.y = BNE[1] + 1.2; L.nz.position.y = AKL[1] + 1.2;
    const mk = (m, on, size, ph = 0) => { const u = (pulse + ph) % 1; m.material.opacity = on * (1 - u) * 0.9; m.scale.setScalar(size * (0.3 + u)); };
    const sz = camD * 0.035;
    mk(mkS, sOn + ramp(t, K.s4 + 0.6, K.s4 + 1) * (1 - ramp(t, tTing - 0.3, tTing)) + ramp(t, K.s5, K.s5 + 0.4) * (1 - ramp(t, tKamis - 0.3, tKamis)), sz);
    mk(mkS2, sOn * 0.6, sz, 0.5);
    mk(mkT, ramp(t, tTok, tTok + 0.4) * (1 - ramp(t, K.s7 - 0.3, K.s7)), sz * 0.9);
    mk(mkA, ramp(t, tAus, tAus + 0.3) * (1 - ramp(t, tTing - 0.3, tTing)), sz * 0.8);
    mk(mkN, ramp(t, tNz, tNz + 0.3) * (1 - ramp(t, tTing - 0.3, tTing)), sz * 0.8, 0.3);

    // trade arcs
    const aA = ramp(t, tAus - 0.2, tAus + 1.0), aN = ramp(t, tNz - 0.2, tNz + 1.0), arcOff = 1 - ramp(t, tTing - 0.3, tTing);
    tubeA.geometry.setDrawRange(0, Math.floor(aA * 200) * 48); tubeN.geometry.setDrawRange(0, Math.floor(aN * 200) * 48);
    tubeA.material.opacity = tubeN.material.opacity = 0.85 * arcOff; tubeA.visible = tubeN.visible = t > K.s4 && t < tTing;
    for (let k = 0; k < 24; k++) {
      const cv = k % 2 ? cA : cN, on = (k % 2 ? aA : aN) >= 1 ? arcOff : 0, u = ((k / 24) * 2 + t * 0.22) % 1, p = cv.getPoint(u);
      cargo.pos.set([p.x, p.y, p.z], k * 3); cargo.col.set([on, on * 0.85, on * 0.7], k * 3);
    }
    cargo.m.size = camD * 0.012; cargo.commit();

    // ---- pages ----
    const bob = (pg, base, ph, amp = 0.06) => { pg.root.position.set(base[0], base[1] + Math.sin(t * 0.9 + ph) * amp, base[2]); pg.root.rotation.set(Math.sin(t * 0.6 + ph) * 0.04, Math.sin(t * 0.45 + ph) * 0.12, Math.sin(t * 0.7 + ph) * 0.02); };
    // Friday: hook, then the midnight shatter, then a ghost in the outro
    const s1Fade = 1 - 0.82 * ramp(t, A("s1:ada"), A("s1:ada") + 0.6);
    let fA = 0;
    if (t < K.s2 + 1.6) fA = ramp(t, -1, 0.2) * s1Fade * (1 - ramp(t, K.s2 + 0.2, K.s2 + 0.8));
    else if (t < tMid) fA = ramp(t, tTepat - 0.35, tTepat + 0.15);
    else if (t > K.s8 - 0.3) fA = 0.22 * ramp(t, K.s8 - 0.3, K.s8 + 0.5);
    pgFri.set(fA); bob(pgFri, [CAL[0], CAL[1], CAL[2] - 0.12], 0.3);
    crackM.opacity = t < K.s2 + 2 ? ramp(t, A("s1:tidak"), A("s1:ada") + 0.3) : t > K.s8 - 0.3 ? 1 : 0;
    crack.scale.setScalar(t < K.s2 + 2 ? 0.4 + 0.6 * eout((t - A("s1:tidak")) / 1.0) : 1);
    pgFri.hinge.rotation.x = 0;

    // Thursday on top, torn upward at "tepat"
    const thA = ramp(t, tKamis - 0.1, tKamis + 0.35) * (1 - ramp(t, tTepat + 0.2, tTepat + 0.75));
    pgThu.set(thA); bob(pgThu, [CAL[0], CAL[1], CAL[2] + 0.02], 0.3);
    const tear = eout((t - tTepat) / 0.6) * (t > tTepat ? 1 : 0);
    pgThu.hinge.rotation.x = -2.3 * tear; pgThu.root.position.y += 0.5 * tear; pgThu.root.position.x += 1.6 * tear; pgThu.root.position.z += 1.2 * tear; pgThu.root.rotation.z -= 0.5 * tear;
    pgThu.root.position.y += 0.6 * (1 - eout((t - tKamis) / 0.45));

    // Saturday lands after the shards clear
    const saIn = eout((t - tSabtu + 0.15) / 0.55);
    const saA = t < K.s8 - 0.3 ? ramp(t, tSabtu - 0.15, tSabtu + 0.2) : 0;
    pgSat.set(saA * (1 - ramp(t, K.s6 + 2.2, K.s6 + 2.8)) + (t > K.s8 - 0.3 ? 0 : 0)); bob(pgSat, [CAL[0], CAL[1] + 0.8 * (1 - saIn), CAL[2] + 0.04], 0.3);

    // shards
    const ts = t - tMid;
    shardRoot.visible = ts > 0 && ts < 2.6;
    if (shardRoot.visible) {
      shardRoot.position.copy(pgFri.root.position); shardRoot.rotation.copy(pgFri.root.rotation);
      shardM.opacity = 1 - ramp(ts, 0.9, 2.3); shardEdgeM.opacity = shardM.opacity;
      for (const s of shards) {
        const u = Math.max(0, ts - s.lag), e = 1 - Math.exp(-u * 2.2);
        s.m.position.set(s.cx + (s.vx * e) / 1.1, s.cy + (s.vy * e) / 1.1 - 0.9 * u * u * 0.5, 0.05 + (s.vz * e) / 1.3);
        s.m.rotation.set(s.wx * e * 0.5, s.wy * e * 0.5, s.wz * e * 0.5);
        s.m.scale.setScalar(1 - 0.6 * ramp(ts, 1.1, 2.4));
      }
    }
    for (let k = 0; k < 160; k++) {
      const [a, b, sp, ph] = sparkSeed[k], u = Math.max(0, ts - ph * 0.3), on = ts > 0 ? clamp01(1 - u / 1.8) : 0, e = 1 - Math.exp(-u * 2.5);
      sparks.pos.set([CAL[0] + a * 0.8 + a * 3.4 * e * sp, CAL[1] + b + b * 2.6 * e * sp - 0.5 * u * u * 0.4, CAL[2] + 0.2 + sp * 2.4 * e], k * 3);
      sparks.col.set([on, on * 0.92, on * 0.86], k * 3);
    }
    sparks.commit();

    // 1892 pages: one, then the same Monday again
    const a92 = ramp(t, tCara - 0.2, tCara + 0.3) * (1 - ramp(t, K.s4 - 0.1, K.s4 + 0.6)) + 0.7 * ramp(t, K.s8 - 0.2, K.s8 + 0.4);
    const dup = eout((t - tUlang) / 0.7) * (t > tUlang ? 1 : 0) * (t < K.s8 - 0.2 ? 1 : 0) + (t > K.s8 - 0.2 ? 1 : 0);
    pg92a.set(a92); bob(pg92a, [CAL92[0] - 1.0 * dup, CAL92[1], CAL92[2]], 1.1);
    pg92b.set(a92 * clamp01(dup * 3)); bob(pg92b, [CAL92[0] + 1.0 * dup, CAL92[1] + 0.05, CAL92[2] + 0.05 - 0.1 * (1 - dup)], 1.4);
    pg92b.root.rotation.z += 0.08 * (1 - dup);

    // s7: island date tags
    const tagA = ramp(t, A("s7:Samoa") - 0.2, A("s7:Samoa") + 0.3) * (1 - ramp(t, tKini - 0.2, tKini + 0.4));
    const tagB = ramp(t, A("s7:Amerika") - 0.2, A("s7:Amerika") + 0.3) * (1 - ramp(t, tKini - 0.2, tKini + 0.4));
    pgS25.set(tagA); bob(pgS25, [APIA[0] - 0.1, 0.5, APIA[2] + 0.05], 0.2, 0.02);
    pgA24.set(tagB); bob(pgA24, [TUT[0] + 0.12, 0.5, TUT[2] + 0.05], 1.2, 0.02);
    const nat = ramp(t, tNatal - 0.1, tNatal + 0.4);
    pgS25.root.scale.setScalar(1 + 0.18 * nat * Math.exp(-Math.max(0, t - tNatal) * 2.5) + 0.06 * nat);

    // ---- dial ----
    const dOn = ramp(t, tTing - 0.05, tTing + 0.4) * (1 - ramp(t, K.s5 - 0.3, K.s5)) + ramp(t, tZona - 0.05, tZona + 0.4) * (1 - ramp(t, tTok - 0.3, tTok));
    dial.visible = dOn > 0.01; dial.scale.setScalar(0.85 + 0.15 * eout(dOn));
    dialFaceM.opacity = dOn; disc.material.opacity = Math.min(1, dOn * 1.4); rimM.opacity = dOn;
    dial.rotation.set(Math.sin(t * 0.5) * 0.05, Math.sin(t * 0.4) * 0.14, 0); dial.position.y = DIAL[1] + Math.sin(t * 0.8) * 0.05;
    if (t < K.s5) {
      const g21 = 21 * eout((t - tJam) / 1.2) * (t > tJam ? 1 : 0);
      paintDial({ h1: 9, h2: 9 + Math.round(g21 * 4) / 4, arc: Math.round(g21 * 4) / 4, l1: "SAMOA", l2: g21 > 2 ? "AUS/NZ" : "", big: g21 > 0.2 ? `${Math.round(g21)} JAM` : "SELISIH", sub: t > tEmpat ? "4 HARI KERJA SAMA" : "TERTINGGAL" });
    } else {
      const sp = eout((t - tMinus - 0.2) / (tPlus - tMinus + 0.6)) * (t > tMinus + 0.2 ? 1 : 0), off = Math.round(-11 + 24 * sp);
      const lab = off < 0 ? `UTC−${-off}` : `UTC+${off}`;
      paintDial({ h1: 9 + Math.round(24 * sp * 4) / 4, arc: Math.round(24 * sp * 4) / 4, l1: "SAMOA", big: lab, sub: sp > 0.98 ? "JAM SAMA, TANGGAL +1" : "ZONA WAKTU" });
    }

    // ---- ship ----
    const shOn = ramp(t, K.s3 - 0.4, K.s3 + 0.3) * (1 - ramp(t, tMakai + 0.6, tMakai + 1.2));
    ship.visible = shOn > 0.01;
    const su = clamp01((t - K.s3 + 1) / 9), sx = SHIP0[0] + (SHIP1[0] - SHIP0[0]) * su, sz2 = SHIP0[2] + (SHIP1[2] - SHIP0[2]) * su;
    ship.position.set(sx, 0.02 + Math.sin(t * 2.1) * 0.008, sz2); ship.rotation.set(Math.sin(t * 1.7) * 0.03, -0.05, Math.sin(t * 1.3) * 0.04);
    for (let k = 0; k < 90; k++) { const a = (k / 90) * 1.2, x = sx - 0.45 - a * 0.45, side = k % 2 ? 1 : -1, w = a * 0.25 * side; wake.pos.set([x, 0.02, sz2 + w + Math.sin(k * 3.1 + t) * 0.01], k * 3); const on = shOn * (1 - a / 1.2) * 0.8; wake.col.set([on, on, on], k * 3); }
    wake.commit();

    // ---- atmosphere ----
    for (const cl of clouds) cl.s.position.x = cl.x + t * cl.sp;
    for (let k = 0; k < 220; k++) { const [x, y, z, ph] = gl0[k]; glint.pos.set([x + Math.sin(t * 0.3 + ph) * 0.3, y + Math.sin(t * 0.5 + ph) * 0.2, z], k * 3); const tw = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2 + ph * 3)); glint.col.set([0.75 * tw, 0.95 * tw, 0.93 * tw], k * 3); }
    glint.commit();
    for (const ch of chips) { ch.m.position.set(ch.base[0] + Math.sin(t * 0.2 + ch.ph) * 0.3, ch.base[1] + Math.sin(t * 0.5 + ch.ph) * 0.25, ch.base[2]); ch.m.rotation.set(t * 0.15 + ch.ph, t * 0.21 + ch.ph, 0); }

    // bloom stays calm, a short lift at the shatter and the sunrise
    bp.strength = 0.3 + 0.25 * Math.exp(-Math.max(0, ts) * 3) * (ts > 0 ? 1 : 0);
    comp.render();
  };
}
