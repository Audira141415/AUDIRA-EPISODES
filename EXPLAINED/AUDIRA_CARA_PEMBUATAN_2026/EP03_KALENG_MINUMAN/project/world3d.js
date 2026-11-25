// EP03 KALENG MINUMAN / SATISFYFORGE. One seamless pastel cyclorama with seven stations along +x:
// hero turntable (x=0), coil + lube (X1), cupping press + nested cup stack (X2), vertical bodymaker with cut-away
// redraw/ironing rings (X3), finishing belt trim > wash > print > oven > spray > neck > flange > fill + seam (BELT),
// pressure cut-away (X5), scale + wall slice + can pyramid (X6). Every can is one live lathe whose profile morphs
// disc > cup > tall wall > dome > neck, so metal visibly stretches and thins. Brushed aluminium reflects a baked pastel
// environment (envStrips), never black. Illustration only: no brands, no real labels. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, clamp01, smooth, ramp, eout, back, canvasTex, track, stage, envStrips } from "./lib3d.js";

const P = { floor: "#F2C4B8", wall: "#C9BBEE", plinth: "#F4D6CE", pink: "#FF8DB6", peach: "#FFC9A3", butter: "#FFD96A", mint: "#6FD8B0", sky: "#7FC0F5", lilac: "#A98BF0", ink: "#4B3F5C", cream: "#FFF1DE", hot: "#F2558F" };
const FONT = "'Baloo 2', 'Trebuchet MS', Arial, sans-serif";
const PI = Math.PI, TAU = PI * 2;
const lerp = (a, b, u) => a + (b - a) * u;
const fr = (x) => x - Math.floor(x);
const PT = 0.3;
const X1 = 7, X2 = 13, X3 = 19.5, B0 = 24.5, B1 = 40.6, X5 = 45.5, X6 = 51.5;
const BED = 1.05, Y0 = 3.5, NY0 = Y0 + 0.07, DIE_Y = 0.57, TRAV = NY0 - DIE_Y, HB = Y0 + 2.5, BY = 0.62;

// ---------- can profiles (r, y), resampled to the same point count so any two can be blended ----------
const NP = 48;
function res(poly) {
  const L = [0];
  for (let i = 1; i < poly.length; i++) L.push(L[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
  const tot = L[L.length - 1], out = [];
  let k = 0;
  for (let i = 0; i < NP; i++) {
    const s = (tot * i) / (NP - 1);
    while (k < poly.length - 2 && L[k + 1] < s) k++;
    const u = (s - L[k]) / Math.max(1e-6, L[k + 1] - L[k]);
    out.push([lerp(poly[k][0], poly[k + 1][0], u), lerp(poly[k][1], poly[k + 1][1], u)]);
  }
  return out;
}
const domeBase = [[0, 0.13], [0.18, 0.115], [0.3, 0.06], [0.36, 0.012], [0.4, 0], [0.44, 0.03], [0.45, 0.1]];
const PR = {
  DISC: res([[0, 0], [0.95, 0], [0.95, 0.015]]),
  CUP: res([[0, 0], [0.55, 0], [0.62, 0.07], [0.62, 0.44]]),
  REDRAW: res([[0, 0], [0.4, 0], [0.45, 0.05], [0.45, 0.8]]),
  TALL: res([[0, 0], [0.4, 0], [0.45, 0.05], [0.45, 1.78]]),
  DOME: res([...domeBase, [0.45, 1.78]]),
  TRIM: res([...domeBase, [0.45, 1.62]]),
  NECK: res([...domeBase, [0.45, 1.4], [0.43, 1.49], [0.395, 1.56], [0.385, 1.62]]),
  FLANGE: res([...domeBase, [0.45, 1.4], [0.43, 1.49], [0.395, 1.56], [0.385, 1.615], [0.412, 1.635]]),
};
const mixP = (a, b, u) => (u <= 0 ? a : u >= 1 ? b : a.map((p, i) => [lerp(p[0], b[i][0], u), lerp(p[1], b[i][1], u)]));
// chain [[u, PROFILE], ...] evaluated at u
function chain(list, u) {
  if (u <= list[0][0]) return list[0][1];
  for (let i = 0; i < list.length - 1; i++) if (u < list[i + 1][0]) return mixP(list[i][1], list[i + 1][1], smooth((u - list[i][0]) / (list[i + 1][0] - list[i][0])));
  return list[list.length - 1][1];
}

// live lathe: NP profile points x NS segments; ears = wavy rim left by deep drawing
function lathe(NS = 72, th0 = 0, thL = TAU) {
  const nV = NP * (NS + 1), pos = new Float32Array(nV * 3), uv = new Float32Array(nV * 2), idx = [];
  for (let j = 0; j <= NS; j++) for (let i = 0; i < NP; i++) { const v = j * NP + i; uv[v * 2] = j / NS; uv[v * 2 + 1] = i / (NP - 1); }
  for (let j = 0; j < NS; j++) for (let i = 0; i < NP - 1; i++) { const a = j * NP + i, b = (j + 1) * NP + i; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  const full = thL > 6.28;
  let key = "";
  g.setProf = (prof, ears = 0, rs = 1) => {
    const k = prof === g._p && ears === g._e && rs === g._r;
    if (k) return;
    g._p = prof; g._e = ears; g._r = rs;
    for (let j = 0; j <= NS; j++) {
      const th = th0 + (thL * j) / NS, s = Math.sin(th), c = Math.cos(th), w4 = 0.5 + 0.5 * Math.cos(4 * th);
      for (let i = 0; i < NP; i++) {
        const v = j * NP + i, f = i / (NP - 1), r = prof[i][0] * rs;
        const y = prof[i][1] + ears * (0.02 + 0.075 * w4) * clamp01((f - 0.86) / 0.14);
        pos[v * 3] = r * s; pos[v * 3 + 1] = y; pos[v * 3 + 2] = r * c;
      }
    }
    g.attributes.position.needsUpdate = true;
    g.computeVertexNormals();
    if (full) { const n = g.attributes.normal.array; for (let i = 0; i < NP; i++) { const a = i * 3, b = (NS * NP + i) * 3; for (let q = 0; q < 3; q++) { const m = (n[a + q] + n[b + q]) / 2; n[a + q] = n[b + q] = m; } } }
    g.computeBoundingSphere();
  };
  void key;
  return g;
}

// ---------- small builders (rounded boxes like the kit) ----------
const geoCache = {};
function rgeo(w, h, d, r = 0.04, seg = 4) {
  const key = [w, h, d, r, seg].join("_");
  if (geoCache[key]) return geoCache[key];
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const iw = w - 2 * r, ih = h - 2 * r, e = 0.0005, s = new THREE.Shape();
  s.moveTo(-iw / 2 + e, -ih / 2); s.lineTo(iw / 2 - e, -ih / 2); s.quadraticCurveTo(iw / 2, -ih / 2, iw / 2, -ih / 2 + e);
  s.lineTo(iw / 2, ih / 2 - e); s.quadraticCurveTo(iw / 2, ih / 2, iw / 2 - e, ih / 2); s.lineTo(-iw / 2 + e, ih / 2);
  s.quadraticCurveTo(-iw / 2, ih / 2, -iw / 2, ih / 2 - e); s.lineTo(-iw / 2, -ih / 2 + e); s.quadraticCurveTo(-iw / 2, -ih / 2, -iw / 2 + e, -ih / 2);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(1e-3, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: seg, curveSegments: 2 });
  g.translate(0, 0, -Math.max(1e-3, d - 2 * r) / 2); g.computeVertexNormals();
  return (geoCache[key] = g);
}
const candy = (c, rough = 0.36, extra = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: rough, clearcoat: 0.6, clearcoatRoughness: 0.25, ...extra });
function mesh(geo, mat, x = 0, y = 0, z = 0, parent, cast = true) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; if (parent) parent.add(m); return m; }
const rb = (w, h, d, r, mat, x, y, z, parent) => mesh(rgeo(w, h, d, r), mat, x, y, z, parent);
const cy = (rt, rbm, h, mat, x, y, z, parent, seg = 40) => mesh(new THREE.CylinderGeometry(rt, rbm, h, seg), mat, x, y, z, parent);
function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function pill(text, { bg = "#ffffff", fg = P.ink, h = 0.2, dot = null, border = null } = {}) {
  const c0 = document.createElement("canvas").getContext("2d"); c0.font = `800 64px ${FONT}`;
  const tw = c0.measureText(text).width, H = 112, W = Math.ceil(tw + (dot ? 130 : 90));
  const tx = canvasTex(W, H, (g) => {
    g.clearRect(0, 0, W, H); rrect(g, 4, 4, W - 8, H - 8, (H - 8) / 2); g.fillStyle = bg; g.fill();
    if (border) { g.lineWidth = 6; g.strokeStyle = border; g.stroke(); }
    if (dot) { g.fillStyle = dot; g.beginPath(); g.arc(52, H / 2, 14, 0, 7); g.fill(); }
    g.fillStyle = fg; g.font = `800 64px ${FONT}`; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(text, dot ? 84 : 45, H / 2 + 5);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry((h * W) / H, h), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, toneMapped: false }));
  m.renderOrder = 5;
  return m;
}

export function create(canvas, K, AT) {
  const A = (k) => { const v = AT[k]; if (v == null) { console.error("missing anchor", k); return 0; } return v; };
  const { r, scene, cam, comp } = stage(canvas, { bg: 0xe9d6dc, exp: 1.0, bloom: [0.05, 0.45, 0.99] });
  canvas.style.filter = "contrast(1.16) saturate(1.1)"; r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.08;
  r.shadowMap.type = THREE.VSMShadowMap;
  // pastel softboxes baked into the environment: brushed aluminium reflects blush and lilac, never black
  // dark env base + bright strips = high-contrast MIRROR on polished aluminium (bright uniform base reads as matte clay)
  envStrips(r, scene, [[8, 3, 0xfff6ee, 3.2, -3, 7, 5], [0.7, 12, 0xffffff, 18.0, 6.5, 2, 3.2], [1.4, 1.4, 0xffffff, 22.0, 5, 8, 4], [2.4, 9, 0xffd3e6, 2.0, -7, 2, -2], [9, 2.5, 0xd9ccff, 1.7, 0, -4, 6], [6, 6, 0xc9bbee, 1.1, 0, 3, -9], [10, 3, 0xf6d7cf, 1.2, 0, -6, -2]], 0x322a44);
  scene.environmentIntensity = 1.25;
  const nanPass = new ShaderPass({ uniforms: { tDiffuse: { value: null } }, vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(any(isnan(c))||any(isinf(c)))c=vec4(0.,0.,0.,1.);gl_FragColor=clamp(c,0.,64.);}" });
  comp.insertPass(nanPass, 1);

  const hemi = new THREE.HemisphereLight(0xe9f0ff, 0xf6d7cf, 0.26); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff1e6, 4.2); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 40 }); key.shadow.radius = 10; key.shadow.blurSamples = 16; key.shadow.bias = -0.0006;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xffcfe6, 3.3); scene.add(rim, rim.target);

  // ---------- seamless sweep ----------
  const sweepGeo = (() => {
    const W = 80, seg = 90, g = new THREE.PlaneGeometry(W, 1, 1, seg), pos = g.attributes.position, col = [];
    const cdeep = new THREE.Color("#C98A8E"), cf = new THREE.Color(P.floor), cw = new THREE.Color(P.wall), R = 3, fl = 13, arc = (PI / 2) * R, wl = 16, tot = fl + arc + wl;
    for (let i = 0; i < pos.count; i++) {
      const s = (pos.getY(i) + 0.5) * tot; let y = 0, z = 0;
      if (s < fl) z = 9 - s; else if (s < fl + arc) { const a = (s - fl) / R; z = -4 - Math.sin(a) * R; y = R - Math.cos(a) * R; } else { z = -4 - R; y = R + (s - fl - arc); }
      pos.setXYZ(i, pos.getX(i) + 26, y, z);
      const k = THREE.MathUtils.smoothstep(s, fl - 2, fl + arc + 3); const c = cf.clone().lerp(cw, k).lerp(cdeep, (1 - THREE.MathUtils.smoothstep(s, 2, 10)) * 0.75); col.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
  })();
  const sweep = new THREE.Mesh(sweepGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, side: THREE.DoubleSide })); sweep.receiveShadow = true; scene.add(sweep);
  // ---------- far backdrop: hazy factory silhouettes (atmospheric falloff toward the lilac wall) ----------
  {
    const wallC = new THREE.Color(P.wall), inkC = new THREE.Color(P.ink), rb2 = mulberry(7707);
    const haze = (k) => new THREE.MeshBasicMaterial({ color: wallC.clone().lerp(inkC, k), fog: false });
    const far = haze(0.26), mid = haze(0.4);
    for (let x = -10; x < 66; x += 7.5) {
      const z = -5.0 - rb2() * 0.5, sa = Math.min(1, -(z - 0.5 + 4) / 3), y = 3 - 3 * Math.sqrt(1 - sa * sa) + 0.35;
      // distant conveyor: long rail + legs
      mesh(new THREE.BoxGeometry(6.6, 0.22, 0.4), far, x + 3.2, y + 1.05, z - 0.5, scene, false);
      for (let l = 0; l < 4; l++) mesh(new THREE.BoxGeometry(0.12, 1.4, 0.12), far, x + 0.6 + l * 1.8, y + 0.35, z - 0.5, scene, false);
      // stacked can pyramids sitting on it
      const n = 3 + Math.floor(rb2() * 3);
      for (let r = 0; r < n; r++) for (let c = 0; c <= r; c++) {
        const cx = x + 1.2 + (c - r / 2) * 0.42 + rb2() * 0.05, cyy = y + 1.16 + (n - 1 - r) * 0.64 + 0.3;
        mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.6, 20), mid, cx, cyy, z - 0.2 + r * 0.02, scene, false);
      }
      // tall hopper tower
      if (rb2() > 0.4) { mesh(new THREE.CylinderGeometry(0.55, 0.2, 1.2, 24), far, x + 5.2, y + 3.2, z - 0.9, scene, false); mesh(new THREE.BoxGeometry(0.16, 3.0, 0.16), far, x + 5.2, y + 1.3, z - 0.9, scene, false); }
    }
  }
  const rnd = mulberry(3303), decoCols = [P.pink, P.mint, P.butter, P.lilac, P.sky, P.peach];
  for (let i = 0; i < 20; i++) {
    const x = -8 + i * 3.1 + (rnd() - 0.5) * 0.8, z = -4.2 - rnd() * 0.6, s = 0.3 + rnd() * 0.38, kind = i % 3;
    const geo = kind === 0 ? new THREE.SphereGeometry(s * 0.5, 28, 14, 0, TAU, 0, PI / 2) : kind === 1 ? new THREE.ConeGeometry(s * 0.42, s * 1.3, 4) : new THREE.TorusGeometry(s * 0.38, s * 0.15, 14, 36);
    if (Math.abs(x - X3) < 4.0 || Math.abs(x - X2) < 3.2 || Math.abs(x - X5) < 3.2 || Math.abs(x - X6) < 3.4) continue;
    const d = mesh(geo, candy(decoCols[i % 6], 0.5), x, kind === 1 ? s * 0.65 : kind === 2 ? s * 0.53 : 0, z, scene); d.rotation.y = rnd() * 6; if (kind === 2) d.rotation.x = 0.2;
  }
  const plinth = (x, z, R, col = P.plinth) => cy(R, R + 0.04, PT, candy(col, 0.5), x, PT / 2, z, scene, 72);

  // ---------- materials ----------
  const brushed = canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = "#e9ecf1"; g.fillRect(0, 0, w, h);
    const R = mulberry(77);
    for (let i = 0; i < 1400; i++) { const x = R() * w, a = 0.008 + R() * 0.022; g.fillStyle = R() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(90,96,110,${a})`; g.fillRect(x, 0, 1 + R() * 1.5, h); }
  });
  const alu = new THREE.MeshPhysicalMaterial({ color: 0xf2f3f7, map: brushed, metalness: 1, roughness: 0.025, envMapIntensity: 2.6, side: THREE.DoubleSide });
  const deco = canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = "#B9A4F4"; g.fillRect(0, 0, w, h);
    const band = (y0, amp, col, th) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, y0); for (let x = 0; x <= w; x += 8) g.lineTo(x, y0 + amp * Math.sin((x / w) * TAU * 4)); g.lineTo(w, y0 + th); for (let x = w; x >= 0; x -= 8) g.lineTo(x, y0 + th + amp * Math.sin((x / w) * TAU * 4 + 0.6)); g.closePath(); g.fill(); };
    band(110, 18, "#FF8DB6", 70); band(205, 14, "#FFF6F0", 26); band(255, 16, "#6FD8B0", 80); band(360, 12, "#FFD96A", 40);
    g.fillStyle = "rgba(255,255,255,.85)"; const R = mulberry(19);
    for (let i = 0; i < 70; i++) { g.beginPath(); g.arc(R() * w, 30 + R() * 60, 3 + R() * 5, 0, 7); g.fill(); }
    g.font = "800 46px 'Baloo 2', Arial"; g.textAlign = "center"; g.fillStyle = "#ffffff";
    for (let k = 0; k < 2; k++) g.fillText("AUDIRA", w * (0.25 + k * 0.5), 445);
  });
  const printed = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: deco, metalness: 0.55, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.12, side: THREE.DoubleSide });
  const coatM = candy("#E5D8FF", 0.4, { side: THREE.DoubleSide });
  const liquidM = candy(P.mint, 0.15, { emissive: new THREE.Color(P.mint), emissiveIntensity: 0.15 });
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xf2f4f8, metalness: 1, roughness: 0.05, envMapIntensity: 2.4 });

  const lidGeo = new THREE.LatheGeometry([[0, 0.03], [0.3, 0.03], [0.32, 0.0], [0.35, 0.0], [0.37, 0.045], [0.395, 0.06], [0.405, 0.035]].map(([a, b]) => new THREE.Vector2(a, b)), 64);
  function makeLid(parent) {
    const G = new THREE.Group(); parent.add(G);
    mesh(lidGeo, alu, 0, 0, 0, G);
    rb(0.3, 0.025, 0.13, 0.012, chrome, 0.06, 0.05, 0, G);
    cy(0.03, 0.03, 0.03, chrome, -0.05, 0.045, 0, G, 16);
    return G;
  }
  // a live can = metal lathe + optional coat + liquid + lid
  function makeCan(parent, { NS = 72, th0 = 0, thL = TAU, coat = false } = {}) {
    const G = new THREE.Group(); parent.add(G);
    const g = lathe(NS, th0, thL);
    const m = mesh(g, alu, 0, 0, 0, G);
    let cm = null, cg = null;
    if (coat) { cg = lathe(NS, th0, thL); cm = mesh(cg, coatM, 0, 0, 0, G, false); cm.visible = false; }
    const liq = mesh(new THREE.CircleGeometry(0.37, 40), liquidM, 0, 1.5, 0, G, false); liq.rotation.x = -PI / 2; liq.visible = false;
    const lid = makeLid(G); lid.visible = false;
    return { G, g, m, cm, cg, liq, lid, set(prof, ears = 0) { g.setProf(prof, ears); if (cm && cm.visible) cg.setProf(prof, ears, 0.965); } };
  }

  // ======================= ST0 hero turntable (x=0) =======================
  plinth(0, 0, 2.0);
  const tt = cy(1.35, 1.38, 0.08, candy(P.cream, 0.35), 0, PT + 0.04, 0, scene, 72);
  const ttRing = mesh(new THREE.TorusGeometry(1.36, 0.02, 10, 120), candy(P.mint, 0.3), 0, PT + 0.08, 0, scene); ttRing.rotation.x = PI / 2;
  const HG = new THREE.Group(); HG.position.set(0, PT + 0.08, 0); scene.add(HG);
  const H0 = makeCan(HG);
  const scanM = new THREE.MeshBasicMaterial({ color: 0x9ff3d3, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const scan = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.018, 10, 90), scanM); scan.rotation.x = PI / 2; HG.add(scan);
  const scanDisc = new THREE.Mesh(new THREE.RingGeometry(0.46, 0.7, 72), new THREE.MeshBasicMaterial({ color: 0xc6fbe6, transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide })); scanDisc.rotation.x = -PI / 2; HG.add(scanDisc);

  // ======================= ST1 coil + lube (X1) =======================
  plinth(X1 + 0.6, 0, 2.6);
  const CC = BED + 1.1;
  const coilG = new THREE.Group(); coilG.position.set(X1, CC, 0); scene.add(coilG);
  const ends = canvasTex(512, 512, (g, w) => { g.fillStyle = "#dfe3ea"; g.fillRect(0, 0, w, w); for (let i = 0; i < 70; i++) { g.strokeStyle = i % 2 ? "rgba(120,126,140,.35)" : "rgba(255,255,255,.7)"; g.lineWidth = 2; g.beginPath(); g.arc(w / 2, w / 2, 90 + i * 2.35, 0, 7); g.stroke(); } g.fillStyle = "#FFF6F0"; g.beginPath(); g.arc(w / 2, w / 2, 88, 0, 7); g.fill(); g.fillStyle = P.hot; g.font = "800 40px 'Baloo 2', Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", w / 2, w / 2 + 2); });
  const coilM = new THREE.MeshPhysicalMaterial({ color: 0xe6e9ee, map: brushed, metalness: 1, roughness: 0.06, envMapIntensity: 2.4 });
  const endM = new THREE.MeshPhysicalMaterial({ map: ends, metalness: 0.6, roughness: 0.35 });
  const coil = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.2, 96), [coilM, endM, endM]); coil.rotation.x = PI / 2; coil.castShadow = true; coilG.add(coil);
  for (const z of [-1.25, 1.25]) { rb(0.35, CC + 0.1, 0.18, 0.05, candy(P.lilac, 0.35), X1, (CC + 0.1) / 2, z, scene); cy(0.16, 0.16, 0.12, candy(P.pink, 0.3), X1, CC, z + Math.sign(z) * 0.08, scene).rotation.x = PI / 2; }
  // the strip: brushed streaks scroll with the feed
  const stripTex = canvasTex(512, 128, (g, w, h) => { g.fillStyle = "#e7eaef"; g.fillRect(0, 0, w, h); const R = mulberry(5); for (let i = 0; i < 260; i++) { g.fillStyle = R() > 0.5 ? "rgba(255,255,255,.35)" : "rgba(100,106,120,.18)"; g.fillRect(0, R() * h, w, 1 + R()); } for (let i = 0; i < 6; i++) { g.fillStyle = "rgba(120,126,140,.25)"; g.fillRect((i * w) / 6, 0, 3, h); } }, [3, 1]);
  const stripM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: stripTex, metalness: 1, roughness: 0.15 });
  const strip = mesh(new THREE.BoxGeometry(X2 - 0.95 - X1, 0.02, 2.0), stripM, (X1 + X2 - 0.95) / 2, BED + 0.01, 0, scene);
  for (let i = 0; i < 4; i++) { const x = X1 + 1.4 + i * 1.15; cy(0.07, 0.07, 2.3, chrome, x, BED - 0.07, 0, scene, 20).rotation.x = PI / 2; rb(0.18, BED - 0.07, 0.14, 0.04, candy(P.mint, 0.4), x, (BED - 0.07) / 2, 1.18, scene); rb(0.18, BED - 0.07, 0.14, 0.04, candy(P.mint, 0.4), x, (BED - 0.07) / 2, -1.18, scene); }
  // lube nozzles + oil film
  const NZX = X1 + 2.6;
  rb(0.16, 1.4, 0.16, 0.05, candy(P.butter, 0.35), NZX, BED + 1.4, -1.25, scene);
  rb(0.16, 0.16, 2.5, 0.05, candy(P.butter, 0.35), NZX, BED + 2.05, 0, scene);
  const nozz = [-0.6, 0, 0.6].map((z) => { cy(0.08, 0.035, 0.22, candy(P.pink, 0.3), NZX, BED + 1.86, z, scene, 20); return z; });
  const dropM = candy(P.mint, 0.08, { transmission: 0, emissive: new THREE.Color(P.mint), emissiveIntensity: 0.2 });
  const drops = [];
  nozz.forEach((z) => { for (let k = 0; k < 3; k++) { const d = mesh(new THREE.SphereGeometry(0.045, 16, 10), dropM, NZX, 0, z, scene, false); d.scale.y = 1.35; drops.push({ d, z, k }); } });
  const film = mesh(new THREE.PlaneGeometry(X2 - 0.95 - NZX, 1.8), new THREE.MeshPhysicalMaterial({ color: P.mint, transparent: true, opacity: 0.22, roughness: 0.05, clearcoat: 1, depthWrite: false }), (NZX + X2 - 0.95) / 2, BED + 0.025, 0, scene, false); film.rotation.x = -PI / 2;
  // lid line, behind: its own small belt
  rb(5.2, 0.5, 0.5, 0.06, candy(P.sky, 0.4), X1 + 1.0, 0.25 + PT * 0, -2.4, scene);
  const lidLine = [];
  for (let i = 0; i < 7; i++) { const L = makeLid(scene); L.scale.setScalar(0.8); lidLine.push(L); }

  // ======================= ST2 cupping press (X2) =======================
  plinth(X2 + 0.6, 0.2, 2.6);
  const pressM = candy(P.pink, 0.34), pressM2 = candy(P.lilac, 0.34);
  for (const s of [-1, 1]) rb(0.55, BED - 0.12 - PT, 2.0, 0.08, pressM2, X2 + s * 0.88, PT + (BED - 0.12 - PT) / 2, 0, scene);
  for (const s of [-1, 1]) rb(0.5, 0.12, 2.0, 0.04, candy(P.cream, 0.3), X2 + s * 0.9, BED - 0.06, 0, scene);
  const die = mesh(new THREE.TorusGeometry(0.69, 0.07, 16, 80), chrome, X2, BED - 0.04, 0, scene); die.rotation.x = PI / 2;
  for (const s of [-1, 1]) cy(0.13, 0.13, 2.1, chrome, X2 + s * 0.88, BED + 1.05, -0.75, scene, 24);
  rb(2.3, 0.55, 0.9, 0.1, pressM, X2, BED + 2.1, -0.55, scene);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.3), new THREE.MeshBasicMaterial({ map: canvasTex(520, 120, (g, w, h) => { g.fillStyle = "#FFF6F0"; rrect(g, 0, 0, w, h, 50); g.fill(); g.fillStyle = P.ink; g.font = "800 62px 'Baloo 2', Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("PRES CAKRAM", w / 2, h / 2 + 4); }), transparent: true, toneMapped: false }));
  plate.position.set(X2, BED + 2.1, -0.09); plate.visible = false; scene.add(plate);
  const ram = new THREE.Group(); scene.add(ram);
  rb(1.5, 0.4, 1.3, 0.08, candy(P.butter, 0.35), 0, 0.5, 0, ram);
  cy(0.6, 0.6, 0.3, chrome, 0, 0.15, 0, ram, 48);
  // skeleton strip after the press: holes where blanks were cut
  const holeTex = canvasTex(256, 256, (g, w) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, w); g.fillStyle = "#000"; g.beginPath(); g.arc(w / 2, w / 2, w * 0.45, 0, 7); g.fill(); }, [1, 1]);
  const skelM = new THREE.MeshPhysicalMaterial({ color: 0xe6e9ee, map: brushed, alphaMap: holeTex, alphaTest: 0.5, metalness: 1, roughness: 0.25, side: THREE.DoubleSide });
  const SKL = 2.1;
  const skel = mesh(new THREE.PlaneGeometry(SKL, 2.0), skelM, X2 + 0.95 + SKL / 2, BED + 0.012, 0, scene); skel.rotation.x = -PI / 2;
  const pressCan = makeCan(scene, { NS: 64 });
  const CUPG = lathe(64); CUPG.setProf(PR.CUP);
  const STK = { x: X2 + 1.95, z: 0.7 }, NPIT = 0.11, NMAX = 14;
  rb(0.9, 0.06, 0.9, 0.03, candy(P.mint, 0.4), STK.x, PT + 0.03, STK.z, scene);
  const stack = []; for (let i = 0; i < NMAX; i++) stack.push(mesh(CUPG, alu, STK.x, PT + 0.06 + i * NPIT, STK.z, scene));
  const flyCup = mesh(CUPG, alu, 0, 0, 0, scene);
  const T3 = K.s3 - 0.3, PER3 = 0.75, T3E = K.s4 + 0.6;
  const n3 = (t) => Math.max(0, Math.min(Math.floor((T3E - T3) / PER3), Math.floor((t - T3) / PER3)));
  const sheetPos = (t) => { if (t < T3) return 0.28 * t; const n = n3(t), f = t < T3 + (n + 1) * PER3 && t < T3E ? fr((t - T3) / PER3) : 0; return 0.28 * T3 + SKL * (n + smooth((f - 0.72) / 0.25)); };

  // ======================= ST3 bodymaker, vertical, rings cut open toward camera (X3) =======================
  plinth(X3, 0, 2.3);
  rb(1.3, DIE_Y - PT, 1.3, 0.08, candy(P.lilac, 0.35), X3, PT + (DIE_Y - PT) / 2, 0, scene);
  const domeDie = mesh(new THREE.SphereGeometry(0.2, 32, 12, 0, TAU, 0, 0.9), chrome, X3, DIE_Y - 0.14, 0, scene);
  rb(1.7, 0.9, 1.6, 0.14, candy(P.pink, 0.35), X3, HB + 0.45, -0.35, scene);
  const nameP = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.42), new THREE.MeshBasicMaterial({ map: canvasTex(600, 168, (g, w, h) => { g.fillStyle = "#FFF6F0"; rrect(g, 0, 0, w, h, 60); g.fill(); g.fillStyle = P.hot; g.font = "800 60px 'Baloo 2', Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA · BADAN", w / 2, h / 2 + 4); }), transparent: true, toneMapped: false }));
  nameP.position.set(X3, HB + 0.45, 0.46); scene.add(nameP);
  const RINGS = [[Y0, P.lilac, 0.47], [Y0 - 0.4, P.mint, 0.455], [Y0 - 0.65, P.butter, 0.452], [Y0 - 0.9, P.pink, 0.45]];
  const CUT0 = 0.35, CUTW = 1.9, phS = CUT0 + CUTW / 2, phL = TAU - CUTW;
  const ringGlow = [];
  RINGS.forEach(([y, c, ri], k) => {
    const prof = [[ri, -0.07], [0.86, -0.07], [0.86, 0.07], [ri, 0.07], [ri, -0.07]].map(([a, b]) => new THREE.Vector2(a, b));
    const m = mesh(new THREE.LatheGeometry(prof, 72, phS, phL), candy(c, 0.3, { side: THREE.DoubleSide }), X3, y, 0, scene);
    for (const ph of [phS, phS + phL]) { const cap = mesh(new THREE.PlaneGeometry(0.86 - ri, 0.14), candy(c, 0.3, { side: THREE.DoubleSide }), X3 + Math.sin(ph) * (ri + 0.86) / 2, y, Math.cos(ph) * (ri + 0.86) / 2, scene); cap.rotation.y = ph - PI / 2; }
    const arm = rb(0.12, 0.1, 1.0, 0.03, candy(P.ink, 0.4), X3 - 0.55, y, -0.85, scene); arm.rotation.y = -0.5;
    ringGlow.push(m);
  });
  const rod = cy(0.405, 0.405, 1, chrome, X3, 0, 0, scene, 48);
  const bodyCan = makeCan(scene, { NS: 72 });
  // transfer tube to the belt
  rb(3.0, 0.9, 1.3, 0.3, candy(P.sky, 0.35), (X3 + 0.9 + B0) / 2 + 0.2, PT + 0.45, 0, scene);

  // ======================= ST4 finishing belt (B0..B1) =======================
  const beltTex = canvasTex(256, 64, (g, w, h) => { g.fillStyle = "#86DDBD"; g.fillRect(0, 0, w, h); g.fillStyle = "#6FD8B0"; for (let i = 0; i < 8; i++) g.fillRect(i * 32, 0, 14, h); }, [24, 1]);
  const beltTop = mesh(new THREE.PlaneGeometry(B1 - B0, 1.1), new THREE.MeshStandardMaterial({ map: beltTex, roughness: 0.6 }), (B0 + B1) / 2, BY + 0.002, 0, scene, false); beltTop.rotation.x = -PI / 2;
  rb(B1 - B0 + 0.4, BY, 1.3, 0.12, candy(P.cream, 0.4), (B0 + B1) / 2, BY / 2, 0, scene);
  const ST = { trim: B0 + 2.0, wash: B0 + 4.0, print: B0 + 6.0, oven: B0 + 8.0, spray: B0 + 9.8, neck: B0 + 11.5, flange: B0 + 12.8, fill: B0 + 14.3 };
  // trimmer: spinning blade + bin of curly rims
  const blade = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 40), chrome, ST.trim, BY + 1.62, -0.85, scene);
  cy(0.06, 0.06, 1.7, candy(P.lilac, 0.4), ST.trim, BY + 0.85, -0.85, scene, 16);
  const bin = rb(0.9, 0.5, 0.8, 0.12, candy(P.pink, 0.35), ST.trim + 0.2, 0.25, 1.3, scene);
  const curlM = new THREE.MeshPhysicalMaterial({ color: 0xe6e9ee, metalness: 1, roughness: 0.25 });
  for (let i = 0; i < 9; i++) { const c = mesh(new THREE.TorusGeometry(0.3, 0.02, 6, 40), curlM, ST.trim + 0.2 + (rnd() - 0.5) * 0.5, 0.52 + rnd() * 0.08, 1.3 + (rnd() - 0.5) * 0.4, scene); c.rotation.set(PI / 2 + (rnd() - 0.5) * 0.6, rnd() * 3, 0); }
  const fallRing = mesh(new THREE.TorusGeometry(0.45, 0.02, 6, 48), curlM, 0, 0, 0, scene); fallRing.visible = false;
  // tunnel housings (wash, oven, neck, flange)
  const tunnel = (x, w, h, col, label, glow) => {
    const G = new THREE.Group(); G.position.set(x, 0, 0); scene.add(G);
    rb(w, 0.25, 1.5, 0.1, candy(col, 0.35), 0, BY + h, 0, G);
    for (const z of [-0.68, 0.68]) rb(w, h, 0.14, 0.06, candy(col, 0.35, glow ? { transparent: true, opacity: 0.55 } : {}), 0, BY + h / 2, z, G);
    if (glow) { const gl = mesh(new THREE.BoxGeometry(w - 0.1, 0.05, 1.2), new THREE.MeshBasicMaterial({ color: 0xffb08a, toneMapped: false }), 0, BY + h - 0.15, 0, G, false); gl.castShadow = false; }
    const l = pill(label, { h: 0.2, bg: "#fff", dot: col }); l.position.set(0, BY + h + 0.32, 0.2); G.add(l);
    return G;
  };
  tunnel(ST.wash, 1.1, 2.0, P.sky, "CUCI", false);
  tunnel(ST.oven, 1.3, 2.1, P.peach, "OVEN", true);
  tunnel(ST.neck, 0.8, 2.0, P.lilac, "LEHER", false);
  tunnel(ST.flange, 0.7, 2.0, P.butter, "BIBIR", false);
  const bubbles = []; for (let i = 0; i < 18; i++) bubbles.push({ m: mesh(new THREE.SphereGeometry(0.05 + rnd() * 0.05, 14, 10), candy("#ffffff", 0.05, { transparent: true, opacity: 0.6 }), 0, 0, 0, scene, false), a: rnd(), b: rnd(), c: rnd() });
  // printer: four colour rollers + blanket roller
  const rollers = [P.pink, P.lilac, P.mint, P.butter].map((c, i) => cy(0.22, 0.22, 1.9, candy(c, 0.3), ST.print - 0.75 + i * 0.5, BY + 1.0, -1.15, scene, 32));
  const blanket = cy(0.42, 0.42, 1.9, candy(P.cream, 0.45), ST.print, BY + 1.0, -0.68, scene, 48);
  // spray lance
  const lance = new THREE.Group(); lance.position.set(ST.spray, 0, 0); scene.add(lance);
  rb(0.5, 0.3, 0.5, 0.08, candy(P.pink, 0.35), 0, BY + 2.6, 0, lance);
  const lanceRod = cy(0.04, 0.04, 1.2, chrome, 0, BY + 1.9, 0, lance, 16);
  const mist = []; for (let i = 0; i < 16; i++) mist.push({ m: mesh(new THREE.SphereGeometry(0.035, 10, 8), candy("#E5D8FF", 0.2, { transparent: true, opacity: 0.8 }), 0, 0, 0, scene, false), a: rnd(), b: rnd() });
  // filler + lid magazine + seaming chuck
  rb(0.6, 0.35, 0.6, 0.1, candy(P.mint, 0.35), ST.fill - 0.4, BY + 2.7, 0, scene);
  const streamM = new THREE.MeshPhysicalMaterial({ color: P.mint, roughness: 0.1, transparent: true, opacity: 0.85 });
  const stream = mesh(new THREE.CylinderGeometry(0.04, 0.04, 1, 12), streamM, ST.fill - 0.4, 0, 0, scene, false);
  for (let i = 0; i < 6; i++) { const L = makeLid(scene); L.position.set(ST.fill + 0.6, BY + 2.25 + i * 0.07, 0); }
  cy(0.46, 0.46, 0.5, candy(P.lilac, 0.3, { transparent: true, opacity: 0.35 }), ST.fill + 0.6, BY + 2.45, 0, scene, 40);
  const chuck = cy(0.3, 0.3, 0.25, candy(P.pink, 0.3), ST.fill + 0.6, BY + 2.05, 0, scene, 32);
  const seamRoll = cy(0.1, 0.1, 0.12, chrome, ST.fill + 1.08, BY + 1.62, 0, scene, 20);
  // exit housing
  rb(0.7, 2.3, 1.5, 0.2, candy(P.sky, 0.35), B1 + 0.1, 1.15, 0, scene);
  rb(0.7, 2.3, 1.5, 0.2, candy(P.sky, 0.35), B0 - 0.1, 1.15, 0, scene);
  const NB = 17, BSP = 1.0, BV = 0.55;
  const belt = []; for (let i = 0; i < NB; i++) belt.push(makeCan(scene, { NS: 56, coat: true }));
  const beltState = (x) => {
    const u = (s, w = 0.3) => smooth((x - s + w / 2) / w);
    let prof = chain([[0, PR.DOME], [ST.trim - 0.2, PR.DOME], [ST.trim + 0.1, PR.TRIM], [ST.neck - 0.25, PR.TRIM], [ST.neck + 0.25, PR.NECK], [ST.flange - 0.15, PR.NECK], [ST.flange + 0.15, PR.FLANGE]], x);
    return { prof, ears: 1 - u(ST.trim, 0.3), printed: x > ST.print, coat: x > ST.spray + 0.1, fill: x > ST.fill - 0.25, lid: x > ST.fill + 0.45 };
  };

  // ======================= ST5 why: cut-away can, lid, pressure, tyre, gauge (X5) =======================
  plinth(X5 + 0.6, 0, 2.6);
  const WG = new THREE.Group(); WG.position.set(X5, PT, 0); WG.scale.setScalar(1.25); scene.add(WG);
  const whyCan = makeCan(WG, { NS: 64, th0: 0.55 + 0.9, thL: TAU - 1.8, coat: true });
  whyCan.cm.visible = true; whyCan.set(PR.FLANGE);
  whyCan.m.material = printed;
  const thickBand = mesh(new THREE.CylinderGeometry(0.458, 0.458, 0.32, 64, 1, true, 0.55 + 0.9, TAU - 1.8), candy(P.mint, 0.3, { side: THREE.DoubleSide, emissive: new THREE.Color(P.mint), emissiveIntensity: 0.3 }), 0, 0.16, 0, WG, false);
  const whyLid = makeLid(WG);
  const arrows = [];
  const arM = candy(P.hot, 0.3, { emissive: new THREE.Color(P.hot), emissiveIntensity: 0.25 });
  for (let i = 0; i < 14; i++) {
    const th = 0.55 + 0.9 + 0.3 + (i % 7) * ((TAU - 2.4) / 6), y = i < 7 ? 0.55 : 1.05;
    const m = mesh(new THREE.ConeGeometry(0.05, 0.14, 12), arM, 0, 0, 0, WG, false);
    arrows.push({ m, th, y, kind: "wall" });
  }
  for (let i = 0; i < 3; i++) { const m = mesh(new THREE.ConeGeometry(0.05, 0.14, 12), arM, 0, 0, 0, WG, false); arrows.push({ m, th: 0, y: 0.2, x: (i - 1) * 0.18, kind: "base" }); }
  const TY = new THREE.Group(); TY.position.set(X5 + 2.35, PT + 1.07, 0.2); TY.rotation.y = -0.35; scene.add(TY);
  const tyre = mesh(new THREE.TorusGeometry(0.75, 0.32, 24, 64), candy("#5A4E6E", 0.6), 0, 0, 0, TY);
  const hub = cy(0.45, 0.45, 0.36, candy(P.plinth, 0.3), 0, 0, 0, TY, 40); hub.rotation.x = PI / 2;
  const gauge = new THREE.Group(); gauge.position.set(X5 - 1.75, PT + 1.25, 0.3); gauge.rotation.y = 0.35; scene.add(gauge);
  cy(0.06, 0.06, 0.95, candy(P.ink, 0.4), 0, -0.47, -0.08, gauge, 12);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.5, 64), new THREE.MeshStandardMaterial({ roughness: 0.5, map: canvasTex(512, 512, (g, w) => {
    g.fillStyle = "#FFF6F0"; g.beginPath(); g.arc(w / 2, w / 2, w / 2, 0, 7); g.fill();
    g.lineWidth = 34; g.strokeStyle = "#6FD8B0"; g.beginPath(); g.arc(w / 2, w / 2, 200, PI * 0.75, PI * 0.75 + PI * 1.5 * 0.6); g.stroke(); g.strokeStyle = "#FF8DB6"; g.beginPath(); g.arc(w / 2, w / 2, 200, PI * 0.75 + PI * 1.5 * 0.6, PI * 2.25); g.stroke();
    g.fillStyle = "#4B3F5C"; g.font = "800 44px 'Baloo 2', Arial"; g.textAlign = "center"; g.textBaseline = "middle";
    for (let i = 0; i <= 8; i += 2) { const a = PI * 0.75 + (PI * 1.5 * i) / 8; g.fillText(String(i), w / 2 + Math.cos(a) * 150, w / 2 + Math.sin(a) * 150); }
    g.font = "800 40px 'Baloo 2', Arial"; g.fillText("BAR", w / 2, w / 2 + 120);
  }) }));
  gauge.add(face);
  mesh(new THREE.TorusGeometry(0.5, 0.04, 12, 64), chrome, 0, 0, 0, gauge);
  const needle = new THREE.Group(); needle.position.z = 0.02; gauge.add(needle);
  rb(0.04, 0.38, 0.02, 0.01, candy(P.hot, 0.3), 0, 0.17, 0, needle);
  cy(0.05, 0.05, 0.04, chrome, 0, 0, 0.02, gauge, 16).rotation.x = PI / 2;

  // ======================= ST6 payoff: scale, wall slice, pyramid, loop morph (X6) =======================
  plinth(X6 + 1.6, 0, 3.4);
  const scl = new THREE.Group(); scl.position.set(X6, PT, 0.3); scene.add(scl);
  rb(1.3, 0.22, 1.1, 0.1, candy(P.plinth, 0.3), 0, 0.11, 0, scl);
  cy(0.55, 0.55, 0.04, chrome, 0, 0.24, -0.05, scl, 48);
  const dispC = document.createElement("canvas"); dispC.width = 320; dispC.height = 96;
  const dispT = new THREE.CanvasTexture(dispC); dispT.colorSpace = THREE.SRGBColorSpace;
  const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.186), new THREE.MeshBasicMaterial({ map: dispT, toneMapped: false })); disp.position.set(0, 0.12, 0.556); scl.add(disp);
  const drawDisp = (on) => { if (dispC._on === on) return; dispC._on = on; const g = dispC.getContext("2d"); g.fillStyle = "#3D3550"; g.fillRect(0, 0, 320, 96); g.fillStyle = on ? "#9ff3d3" : "#6c6386"; g.font = "800 58px 'Baloo 2', Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(on ? "13–15 g" : "0 g", 160, 52); dispT.needsUpdate = true; };
  const scaleCan = makeCan(scl, { NS: 64 }); scaleCan.G.position.y = 0.26; scaleCan.set(PR.FLANGE); scaleCan.m.material = printed;
  // magnified wall slice vs two magazine pages
  const SL = new THREE.Group(); SL.position.set(X6 + 1.75, PT, 0.55); SL.rotation.y = -0.3; scene.add(SL);
  rb(1.6, 0.12, 0.9, 0.05, candy(P.lilac, 0.35), 0, 0.06, 0, SL);
  const pageT = canvasTex(256, 320, (g, w, h) => { g.fillStyle = "#fffdf8"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(75,63,92,.35)"; for (let i = 0; i < 16; i++) g.fillRect(24, 30 + i * 17, (i % 5 === 4 ? 120 : 200), 6); g.fillStyle = "#FF8DB6"; g.fillRect(24, 8, 120, 12); });
  const pages = [0, 1].map((k) => { const m = rb(0.05, 0.95, 0.75, 0.01, new THREE.MeshStandardMaterial({ color: 0xffffff, map: pageT, roughness: 0.8 }), -0.42 + k * 0.08, 0.6, 0, SL); return m; });
  const wallS = rb(0.07, 0.95, 0.75, 0.01, new THREE.MeshPhysicalMaterial({ color: 0xe6e9ee, map: brushed, metalness: 1, roughness: 0.25 }), 0.42, 0.6, 0, SL);
  const lens = mesh(new THREE.TorusGeometry(0.66, 0.03, 14, 64), candy(P.pink, 0.3), 0, 0.62, 0.42, SL);
  // pyramid of finished cans: 4-3-2-1
  const PYG = new THREE.Group(); PYG.position.set(X6 + 3.9, PT, -0.6); PYG.scale.setScalar(0.62); scene.add(PYG);
  const finGeo = lathe(56); finGeo.setProf(PR.FLANGE);
  const pyr = [];
  [4, 3, 2, 1].forEach((n, row) => { for (let i = 0; i < n; i++) { const G = new THREE.Group(); G.position.set((i - (n - 1) / 2) * 0.93, row * 1.69, 0); PYG.add(G); mesh(finGeo, printed, 0, 0, 0, G); const L = makeLid(G); L.position.y = 1.6; pyr.push({ G, row, i, n }); } });
  // loop morph: disc becomes a can again
  const LG = new THREE.Group(); LG.position.set(X6 + 1.6, PT, 1.6); scene.add(LG);
  cy(0.95, 0.98, 0.06, candy(P.cream, 0.35), 0, 0.03, 0, LG, 64);
  const loopCan = makeCan(LG, { NS: 72 }); loopCan.G.position.y = 0.06;

  // ---------- labels in the world ----------
  const tags = [];
  const tag = (m, ranges, posFn) => { scene.add(m); tags.push({ m, ranges, posFn }); };
  tag(pill("1 CAKRAM ALUMINIUM", { h: 0.22, dot: P.mint }), [[A("s1:cakram") - 0.1, K.s1e + 0.4]], () => [0, PT + 0.55, 1.2]);
  tag(pill("JALUR BADAN", { h: 0.2, dot: P.pink }), [[A("s2:jalur") - 0.2, K.s2e]], () => [X1 + 2.3, BED + 0.45, 1.25]);
  tag(pill("JALUR TUTUP", { h: 0.2, dot: P.sky }), [[A("s2:terpisah") - 0.3, K.s2e]], () => [X1 + 2.3, 1.05, -2.3]);
  tag(pill("DILUMASI", { h: 0.2, bg: P.mint, fg: "#fff" }), [[A("s2:dilumasi") - 0.2, K.s2e + 0.4]], () => [NZX, BED + 2.45, 0.4]);
  tag(pill("SELEBAR TELAPAK TANGAN", { h: 0.19, dot: P.butter }), [[A("s3:selebar") - 0.1, A("s3:lalu")]], () => [X2, BED + 0.4, 1.4]);
  tag(pill("MANGKUK PENDEK", { h: 0.2, dot: P.lilac }), [[A("s3:mangkuk") - 0.1, K.s3e + 0.2]], () => [STK.x - 0.7, PT + 1.55, STK.z + 0.1]);
  tag(pill("CINCIN TARIK", { h: 0.17, dot: P.lilac }), [[A("s4:tarik") - 0.25, A("s4:kubah")]], () => [X3 - 0.5, Y0 - 0.02, 0.95]);
  tag(pill("3 CINCIN SETRIKA", { h: 0.17, dot: P.mint }), [[A("s4:setrika") - 0.4, A("s4:kubah")]], () => [X3 + 0.85, Y0 - 1.25, 0.6]);
  tag(pill("KUBAH", { h: 0.2, bg: P.hot, fg: "#fff" }), [[A("s4:kubah") - 0.1, A("s4:Semua") - 0.2]], () => [X3 + 0.95, DIE_Y + 0.2, 0.55]);
  tag(pill("TEPI BERGELOMBANG", { h: 0.17, dot: P.pink }), [[A("s5:bergelombang") - 0.2, A("s5:dicuci")]], () => [ST.trim - 1.05, BY + 2.05, 0.2]);
  tag(pill("4 WARNA", { h: 0.2, dot: P.butter }), [[A("s5:empat") - 0.2, A("s5:dipanggang")]], () => [ST.print, BY + 2.15, 0.2]);
  tag(pill("LAPISAN DALAM", { h: 0.18, dot: P.lilac }), [[A("s5:disemprot") - 0.2, A("s5:Lehernya")]], () => [ST.spray + 0.35, BY + 1.6, 0.9]);
  tag(pill("2× GULUNG", { h: 0.2, bg: P.hot, fg: "#fff" }), [[A("s5:gulungan") - 0.4, K.s5e + 0.5]], () => [ST.fill + 0.6, BY + 3.05, 0.3]);
  tag(pill("TUTUP LEBIH KECIL", { h: 0.19, dot: P.sky }), [[A("s6:diameternya") - 0.2, A("s6:Dasar")]], () => [X5 + 0.1, PT + 3.25, 0.3]);
  tag(pill("DINDING BAWAH LEBIH TEBAL", { h: 0.16, dot: P.mint }), [[A("s6:dinding") - 0.2, A("s6:Kaleng")]], () => [X5 + 0.1, PT + 0.12, 1.1]);
  tag(pill("±6 BAR", { h: 0.22, bg: P.hot, fg: "#fff" }), [[A("s6:6") - 0.1, K.s6e]], () => [X5 - 1.75, PT + 2.05, 0.6]);
  tag(pill("BAN MOBIL ×3", { h: 0.2, dot: P.ink }), [[A("s6:ban") - 0.3, K.s6e]], () => [X5 + 2.35, PT + 2.25, 0.3]);
  tag(pill("±0,1 mm", { h: 0.22, bg: P.hot, fg: "#fff" }), [[A("s7:milimeter") - 0.3, K.s7e]], () => [X6 + 2.3, PT + 1.35, 0.9]);
  tag(pill("2 HALAMAN MAJALAH", { h: 0.17, dot: P.butter }), [[A("s7:majalah") - 0.3, K.s7e]], () => [X6 + 1.25, PT + 1.4, 0.75]);
  tag(pill("AUDIRA · TANPA SAMBUNGAN", { h: 0.2, dot: P.mint }), [[A("s8:sambungan") - 0.3, K.dur]], () => [X6 + 3.9, PT + 0.45, 1.4]);

  // ---------- foreground blobs (DOM) ----------
  const fgs = [...document.querySelectorAll(".fg")].map((e) => ({ e, k: +e.dataset.k, x: +e.dataset.x }));

  // ---------- timing ----------
  const tSamb = A("s1:sambungan"), tSel = A("s1:Seluruh"), tCak = A("s1:cakram");
  const heroProf = (t) => chain([[tSel + 0.3, PR.FLANGE], [A("s1:dulu"), PR.DOME], [A("s1:cuma") + 0.1, PR.TALL], [A("s1:satu") + 0.2, PR.CUP], [tCak + 0.35, PR.DISC]], t);
  // bodymaker slow demo stroke
  const tCupIn0 = K.s4 - 0.2, tCupIn1 = A("s4:pembentuk") + 0.3;
  const tRod0 = A("s4:Batang"), tD0 = A("s4:melewati"), tD1 = A("s4:dasarnya"), tDome0 = A("s4:ditekan") - 0.1, tDome1 = A("s4:kubah") + 0.1;
  const tRet = A("s4:kubah") + 0.3, tEj = A("s4:Semua") - 0.3, tFast = A("s4:Semua") + 0.3, PERF = 0.6, tFastE = K.s5 + 0.9;
  function bodyState(t) {
    // returns { nose, d, dome, cupY, cupX, show, canX, phaseFast }
    if (t >= tFast && t < tFastE + PERF) {
      const n = Math.floor((t - tFast) / PERF), p = fr((t - tFast) / PERF);
      if (tFast + n * PERF >= tFastE) return { nose: HB - 0.1, d: 0, dome: 1, show: false, canX: X3 };
      if (p < 0.15) return { nose: HB - 0.1 - (HB - 0.1 - NY0) * smooth(p / 0.15), d: 0, dome: 0, show: true, cupDrop: 1 - smooth(p / 0.12), canX: X3 };
      if (p < 0.55) { const d = smooth((p - 0.15) / 0.4); return { nose: NY0 - TRAV * d, d, dome: smooth((p - 0.5) / 0.05), show: true, canX: X3 }; }
      if (p < 0.72) return { nose: lerp(DIE_Y, HB - 0.1, smooth((p - 0.55) / 0.17)), d: 1, dome: 1, show: true, canX: X3, free: true };
      return { nose: HB - 0.1, d: 1, dome: 1, show: true, canX: X3 + 2.6 * smooth((p - 0.72) / 0.28), free: true };
    }
    if (t < tCupIn1) return { nose: HB - 0.1, d: 0, dome: 0, show: t > tCupIn0, cupIn: smooth((t - tCupIn0) / (tCupIn1 - tCupIn0)), canX: X3 };
    if (t < tD0) return { nose: lerp(HB - 0.1, NY0, smooth((t - tRod0) / (tD0 - tRod0))), d: 0, dome: 0, show: true, canX: X3 };
    if (t < tRet) { const d = smooth((t - tD0) / (tD1 - tD0)); return { nose: NY0 - TRAV * d, d, dome: smooth((t - tDome0) / (tDome1 - tDome0)), show: true, canX: X3 }; }
    return { nose: lerp(DIE_Y, HB - 0.1, smooth((t - tRet) / 0.7)), d: 1, dome: 1, show: t < tEj + 0.6, canX: X3 + 2.6 * smooth((t - tEj) / 0.6), free: true };
  }
  const bodyProf = (d, dome) => { const a = d < 0.2 ? mixP(PR.CUP, PR.REDRAW, smooth(d / 0.2)) : mixP(PR.REDRAW, PR.TALL, smooth((d - 0.2) / 0.8)); return dome > 0 ? mixP(a, PR.DOME, dome) : a; };

  // ---------- camera: orbit keys from scene and word anchors ----------
  const D2R = PI / 180;
  const O = (t, tx, ty, tz, d, az, el) => [t, tx + d * Math.cos(el * D2R) * Math.sin(az * D2R), ty + d * Math.sin(el * D2R), tz + d * Math.cos(el * D2R) * Math.cos(az * D2R), tx, ty, tz];
  const camT = track([
    O(0, 0, 1.6, 0, 11.0, 22, 12), O(tSamb + 0.3, 0, 1.58, 0, 10.6, 14, 14), O(tSel, 0, 1.55, 0, 10.6, 8, 17), O(tCak, 0, 0.95, 0, 7.8, 2, 30), O(K.s1e, 0.4, 0.95, 0, 8.0, -4, 28),
    O(K.s2 + 0.7, X1 + 1.8, 1.8, -0.3, 13.0, 26, 18), O(A("s2:terpisah") + 0.3, X1 + 1.6, 1.5, -0.9, 13.4, 32, 26), O(A("s2:gulungan"), X1 + 1.0, 1.8, 0, 11.6, 28, 16), O(A("s2:dilumasi"), NZX + 0.4, 1.5, 0, 8.4, 22, 22), O(K.s2e, NZX + 1.4, 1.5, 0, 8.8, 20, 20),
    O(K.s3 + 0.5, X2 + 0.2, 1.95, 0.3, 9.4, 16, 12), O(A("s3:cakram"), X2 + 0.1, 2.0, 0.3, 9.0, 12, 13), O(A("s3:menekannya"), X2 + 0.2, 1.95, 0.4, 8.8, 14, 12), O(A("s3:Ratusan"), X2 + 1.1, 1.85, 0.6, 10.2, 20, 13), O(K.s3e, X2 + 1.3, 1.85, 0.6, 10.4, 24, 14),
    O(K.s4 + 0.8, X3 - 0.4, Y0 + 0.4, 0, 8.6, 16, 10), O(A("s4:pembentuk"), X3 - 0.2, Y0 + 0.1, 0, 7.2, 18, 8), O(tD0, X3, Y0 - 0.2, 0, 6.8, 20, 6), O(A("s4:setrika"), X3, Y0 - 0.6, 0, 7.6, 22, 4),
    O(A("s4:memanjang"), X3, 2.1, 0, 8.4, 24, 4), O(A("s4:dasarnya"), X3, 1.25, 0, 8.6, 24, 6), O(A("s4:kubah"), X3 + 0.2, 0.75, 0.2, 6.4, 26, 6), O(A("s4:Semua"), X3 + 0.4, 2.6, 0, 11.5, 22, 10), O(K.s4e, X3 + 1.4, 2.5, 0, 12.5, 18, 11),
    O(K.s5 + 0.6, ST.trim - 0.4, 1.15, 0, 8.1, 18, 14), O(A("s5:dipotong"), ST.trim, 1.15, 0, 7.3, 16, 15), O(A("s5:dicuci"), ST.wash, 1.10, 0, 7.9, 16, 14), O(A("s5:dicetak") + 0.4, ST.print, 1.10, 0, 7.4, 14, 15), O(A("s5:dipanggang"), ST.oven, 1.5, 0, 8.9, 16, 14),
    O(A("s5:disemprot"), ST.spray, 1.20, 0, 6.9, 14, 32), O(A("s5:dipersempit"), ST.neck + 0.4, 1.30, 0, 7.1, 16, 16), O(A("s5:ditekuk"), ST.flange + 0.3, 1.30, 0, 6.9, 14, 16), O(A("s5:diisi"), ST.fill, 1.40, 0, 7.3, 14, 18), O(A("s5:gulungan"), ST.fill + 0.6, 1.50, 0, 6.9, 16, 16), O(K.s5e, ST.fill + 0.8, 1.50, 0, 7.3, 18, 16),
    O(K.s6 + 0.9, X5, 2.1, 0, 11.0, 18, 12), O(A("s6:Tutup"), X5, 2.3, 0, 10.4, 14, 12), O(A("s6:logam"), X5, 2.0, 0, 10.6, 10, 10), O(A("s6:Dasar"), X5, 1.3, 0, 9.4, 8, 12), O(A("s6:tekanan"), X5, 1.4, 0, 10.0, 6, 12),
    O(A("s6:6"), X5 + 0.1, 1.55, 0, 12.2, 0, 10), O(A("s6:ban"), X5 + 0.5, 1.55, 0, 12.6, -4, 10), O(K.s6e, X5 + 0.7, 1.55, 0, 12.8, -6, 10),
    O(K.s7 + 0.8, X6 + 0.9, 1.3, 0.3, 9.0, 14, 12), O(A("s7:milimeter"), X6 + 1.5, 1.1, 0.5, 6.6, 8, 12), O(A("s7:majalah"), X6 + 1.3, 1.1, 0.5, 7.0, 14, 13), O(A("s7:Kaleng"), X6 + 0.1, 1.35, 0.3, 8.2, 18, 14), O(K.s7e, X6 + 0.4, 1.35, 0.3, 8.6, 22, 14),
    O(K.s8 + 0.4, X6 + 1.6, 1.0, 1.6, 7.6, 12, 22), O(A("s8:jadilah"), X6 + 1.6, 1.15, 1.6, 7.8, 16, 18), O(A("s8:Ikuti"), X6 + 3.2, 2.35, 0.2, 14.0, 12, 13), O(K.dur, X6 + 3.4, 2.4, 0.1, 14.8, 16, 14),
  ]);

  const sync = (c, t) => {
    // bodyState-independent helpers for belt cans
    const x = B0 + fr((c * BSP + BV * t) / (NB * BSP)) * NB * BSP;
    return x;
  };

  return (t) => {
    const p = camT(t); cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]);
    key.position.set(p[3] - 3.8, 7.6, p[5] + 5.0); key.target.position.set(p[3], 0, p[5]);
    rim.position.set(p[3] + 4.2, 3.6, p[5] - 4.5); rim.target.position.set(p[3], 0.8, p[5]);
    for (const f of fgs) { let xx = f.x - cam.position.x * f.k * 95; xx = ((xx + 400) % 1880 + 1880) % 1880 - 400; f.e.style.transform = `translate3d(${xx.toFixed(1)}px,${(Math.sin(t * 0.3 + f.k) * 14).toFixed(1)}px,0)`; }
    for (const g of tags) {
      let s = 0;
      for (const [a, b] of g.ranges) s = Math.max(s, back(clamp01((t - a) / 0.35), 1.8) * (1 - smooth((t - b + 0.25) / 0.25)));
      g.m.visible = s > 0.01; if (g.m.visible) { const q = g.posFn(t); g.m.position.set(q[0], q[1], q[2]); g.m.quaternion.copy(cam.quaternion); g.m.scale.setScalar(Math.max(0.01, s)); }
    }

    // ST0 hero: printed can with lid spins, seamless scan, then rewinds into a flat disc
    HG.rotation.y = t * 0.55; tt.rotation.y = t * 0.55;
    const near0 = t < K.s2 + 1.5;
    if (near0) {
      H0.set(heroProf(t), 0);
      const pm = t < tSel + 0.15;
      H0.m.material = pm ? printed : alu;
      const lu = smooth((t - tSel + 0.1) / 0.5);
      H0.lid.visible = lu < 0.99; H0.lid.position.set(0, 1.6 + lu * 1.6, 0); H0.lid.rotation.y = lu * 2;
      const sc = clamp01((t - A("s1:tidak") + 0.1) / (tSamb + 0.6 - A("s1:tidak")));
      const so = Math.sin(PI * sc) * (t < tSamb + 0.7 ? 1 : 0);
      scan.position.y = 0.08 + sc * 1.55; scanM.opacity = so * 0.95; scan.visible = so > 0.01;
      scanDisc.position.y = scan.position.y; scanDisc.material.opacity = so * 0.35; scanDisc.visible = so > 0.01;
    }

    // ST1 coil: unrolls with the strip, lube drops, lid line runs
    const sp = sheetPos(t);
    coil.rotation.y = -sp / 1.1;
    stripTex.offset.x = -sp / ((X2 - 0.95 - X1) / 3);
    for (const d of drops) { const u = fr(t * 1.6 + d.k / 3 + d.z * 0.37); d.d.position.y = BED + 1.72 - u * 1.65; d.d.visible = u < 0.98; }
    lidLine.forEach((L, i) => { const u = fr(t * 0.13 + i / 7); L.position.set(X1 - 1.4 + u * 4.8, 0.52, -2.4); L.rotation.y = t * 0.6 + i; L.visible = u > 0.02 && u < 0.98; });

    // ST2 press stroke
    let ramY = BED + 1.1, cupVis = false;
    const n = n3(t), inStroke = t >= T3 && t < T3E && t < T3 + (n + 1) * PER3 + 1e-6;
    const ph = t >= T3 && t < T3E ? fr((t - T3) / PER3) : 0;
    if (t >= T3 && t < T3E) {
      ramY = BED + 1.1 - 1.1 * (ph < 0.3 ? 0 : ph < 0.5 ? smooth((ph - 0.3) / 0.2) : ph < 0.62 ? 1 : 1 - smooth((ph - 0.62) / 0.25));
      // blank appears on contact, is drawn into the die as a cup
      const u = smooth((ph - 0.47) / 0.15);
      if (ph > 0.44 && ph < 0.72) { cupVis = true; pressCan.set(mixP(PR.DISC, PR.CUP, u), 0); pressCan.G.position.set(X2, BED + 0.012 - 0.44 * u, 0); pressCan.G.rotation.set(0, 0, 0); }
    }
    ram.position.set(X2, Math.max(ramY, BED + 0.012 + (cupVis ? 0 : 0)), 0);
    pressCan.G.visible = cupVis;
    // nested cup stack + the cup in flight
    const done = n3(t) + (t >= T3E ? 0 : 0);
    const cnt = Math.min(NMAX, t < T3 ? 0 : done);
    stack.forEach((m, i) => (m.visible = i < cnt));
    const fly = t >= T3 && t < T3E && ph >= 0.72 && cnt < NMAX;
    flyCup.visible = fly;
    if (fly) { const u = smooth((ph - 0.72) / 0.28); flyCup.position.set(lerp(X2, STK.x, u), lerp(BED - 0.44, PT + 0.06 + cnt * NPIT, u) + Math.sin(PI * u) * 0.35, lerp(0, STK.z, u)); }
    skelM.alphaMap.offset.x = -sp / SKL + 0.5;
    void inStroke;

    // ST3 bodymaker
    const bs = bodyState(t);
    rod.position.set(X3, (bs.nose + HB) / 2, 0); rod.scale.y = Math.max(0.01, HB - bs.nose);
    bodyCan.G.visible = !!bs.show && t > K.s3e - 1 && t < K.s5 + 2.5;
    if (bodyCan.G.visible) {
      if (bs.cupIn !== undefined) { const u = bs.cupIn; bodyCan.set(PR.CUP, 0); bodyCan.G.position.set(lerp(X3 - 3.4, X3, smooth(clamp01(u * 1.3))), Y0 + 0.07 + 0.95 * (1 - smooth(clamp01((u - 0.7) / 0.3))), 0); }
      else if (bs.cupDrop !== undefined) { bodyCan.set(PR.CUP, 0); bodyCan.G.position.set(X3, NY0 + 0.9 * bs.cupDrop, 0); }
      else { bodyCan.set(bodyProf(bs.d, bs.dome), bs.d > 0.25 ? clamp01((bs.d - 0.25) / 0.5) : 0); bodyCan.G.position.set(bs.canX, bs.free ? DIE_Y : bs.nose, 0); }
      bodyCan.G.visible = bodyCan.G.position.x < X3 + 2.45;
    }
    const passing = bs.d > 0 && bs.d < 1;
    RINGS.forEach(([y], k) => { const m = ringGlow[k]; const near = passing && Math.abs(bs.nose + 0.6 - y) < 0.6 ? 1 : 0; m.material.emissive = m.material.emissive || new THREE.Color(); m.material.emissive.set(near ? 0xffffff : 0x000000); m.material.emissiveIntensity = near * 0.18; });
    domeDie.scale.y = 1;

    // ST4 belt
    beltTex.offset.x = -BV * t / ((B1 - B0) / 24);
    const nearBelt = cam.position.x > B0 - 6 && cam.position.x < B1 + 6;
    for (let c = 0; c < NB; c++) {
      const can = belt[c], x = sync(c, t);
      const vis = nearBelt && x > B0 + 0.05 && x < B1 - 0.05;
      can.G.visible = vis; if (!vis) continue;
      const s = beltState(x);
      can.G.position.set(x, BY, 0);
      can.G.rotation.y = x > ST.fill + 0.45 ? (x - ST.fill) * 9 : 0;
      can.m.material = s.printed ? printed : alu;
      if (can.cm) can.cm.visible = s.coat;
      can.set(s.prof, s.ears);
      can.liq.visible = s.fill; can.liq.position.y = 1.45;
      can.lid.visible = s.lid; can.lid.position.y = 1.6 + 0.02;
    }
    blade.rotation.y = t * 9;
    rollers.forEach((m, i) => (m.rotation.y = t * 4 * (i % 2 ? -1 : 1)));
    blanket.rotation.y = -t * 2.2;
    // falling rim scrap: one per can passing the trimmer
    const ftr = fr((BV * t - (ST.trim - B0)) / BSP);
    fallRing.visible = nearBelt && ftr < 0.6;
    if (fallRing.visible) { const u = ftr / 0.6; fallRing.position.set(ST.trim + 0.2 * u, BY + 1.62 - u * (BY + 1.1), 0.0 + u * 1.3); fallRing.rotation.set(PI / 2 + u * 1.2, u * 2, 0); }
    bubbles.forEach((b) => { const u = fr(t * (0.5 + b.c * 0.5) + b.a); b.m.position.set(ST.wash + (b.b - 0.5) * 0.9, BY + 0.2 + u * 1.7, (b.c - 0.5) * 1.0); b.m.visible = nearBelt; });
    const lu = fr((BV * t - (ST.spray - B0)) / BSP);
    lanceRod.position.y = BY + 1.9 - 0.7 * Math.sin(PI * clamp01(lu / 0.5)) * (lu < 0.5 ? 1 : 0);
    mist.forEach((m, i) => { const u = fr(t * 2.2 + m.a); m.m.visible = nearBelt && lu < 0.5; m.m.position.set(ST.spray + Math.cos(i * 2.4) * 0.3 * u, BY + 1.3 - u * 0.9, Math.sin(i * 2.4) * 0.3 * u); });
    const fu = fr((BV * t - (ST.fill - 0.4 - B0)) / BSP);
    stream.visible = nearBelt && fu < 0.45; stream.scale.y = 0.9; stream.position.y = BY + 2.05;
    chuck.rotation.y = t * 12; seamRoll.rotation.y = t * 20;

    // ST5 why
    WG.rotation.y = 0.15 * Math.sin(t * 0.4) - 0.1;
    const lidHover = ramp(t, A("s6:Tutup") - 0.4, A("s6:Tutup") + 0.3);
    whyLid.position.set(0, 1.62 + 1.0 * lidHover * (1 - ramp(t, A("s6:Dasar") - 0.3, A("s6:Dasar") + 0.4)), 0);
    whyLid.rotation.y = t * 0.8;
    thickBand.material.emissiveIntensity = 0.1 + 0.5 * ramp(t, A("s6:dinding") - 0.2, A("s6:dinding") + 0.4);
    const pr = ramp(t, A("s6:tekanan") - 0.4, A("s6:tekanan") + 0.3);
    arrows.forEach((a, i) => {
      const pul = 0.5 + 0.5 * Math.sin(t * 6 - i * 0.7), o = 0.38 + 0.06 * pul * pr;
      a.m.visible = pr > 0.02 && t < K.s7 + 0.5;
      if (a.kind === "wall") { a.m.position.set(Math.sin(a.th) * (o - 0.05), a.y, Math.cos(a.th) * (o - 0.05)); a.m.rotation.set(0, 0, 0); a.m.lookAt(WG.localToWorld(new THREE.Vector3(Math.sin(a.th) * 2, a.y, Math.cos(a.th) * 2))); a.m.rotateX(PI / 2); }
      else { a.m.position.set(a.x, 0.22 + 0.04 * pul, 0.12); a.m.rotation.set(PI, 0, 0); }
      a.m.scale.setScalar(Math.max(0.01, pr));
    });
    { const v = 6 * eout(clamp01((t - A("s6:6") + 0.6) / 0.8)); needle.rotation.z = -(0.75 * PI + 1.5 * PI * v / 8) - PI / 2; }
    tyre.rotation.z = t * 0.2;

    // ST6 payoff
    drawDisp(t > A("s7:13") - 0.1);
    scaleCan.G.position.y = 0.26 - 0.015 * ramp(t, A("s7:Kaleng") - 0.2, A("s7:Kaleng") + 0.2);
    lens.rotation.z = t * 0.3;
    const lp = chain([[A("s8:cakram") - 0.2, PR.DISC], [A("s8:langkah"), PR.CUP], [A("s8:detik"), PR.TALL], [A("s8:jadilah"), PR.DOME], [A("s8:kaleng"), PR.FLANGE]], t);
    if (t > K.s7e - 1) { loopCan.set(lp, 0); loopCan.m.material = t > A("s8:kaleng") + 0.1 ? printed : alu; loopCan.lid.visible = t > A("s8:tanpa"); loopCan.lid.position.y = 1.6 + 0.6 * (1 - smooth((t - A("s8:tanpa")) / 0.4)); }
    LG.rotation.y = t * 0.5;
    pyr.forEach((q, k) => { const t0 = A("s8:Ikuti") - 0.9 + k * 0.09, u = smooth(clamp01((t - t0) / 0.45)); q.G.visible = t >= t0; q.G.position.y = q.row * 1.69 + (1 - u) * 1.6; q.G.scale.setScalar(Math.max(0.01, back(u, 1.4))); });

    comp.render();
  };
}
