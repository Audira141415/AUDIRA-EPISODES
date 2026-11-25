// EP11 PULAU RUN x MANHATTAN (SATELLITEBRIEFING). One vector globe, 1 unit = 1 km, R = 6371. Two satellite feeds:
// feed A watches Manhattan, feed B watches Run. The hook and payoff split the frame between them (two cameras, one scene);
// in between feed B descends on Banda, flies the great circle to New York, and feed A takes over for Breda.
// Banda and New York get hand-drawn local patches (Natural Earth 50m has neither Run nor the Hudson). Everything is a function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, smooth, canvasTex, stage } from "./lib3d.js";
import { GEO } from "./geo.js";

const R = 6371, D2R = Math.PI / 180;
const AMB = "#FFBE55", COLD = "#9FD3FF", CORAL = "#FF7A59", NUT = "#7CD992", GREY = "#AEB8BB";
const RUN = [-4.55, 129.68], MAN = [40.78, 286.03], MAN2 = [40.738, 286.008];
const PX = (2 * Math.tan(19 * D2R)) / 1920;

const toV = (lat, lon, h = 0, o = new THREE.Vector3()) => {
  const ph = (lon + 180) * D2R, th = (90 - lat) * D2R, r = R + h;
  return o.set(-r * Math.cos(ph) * Math.sin(th), r * Math.cos(th), r * Math.sin(ph) * Math.sin(th));
};
function frame(lat, lon) {
  const n = toV(lat, lon, 0).normalize();
  const no = toV(lat + 0.01, lon, 0).sub(toV(lat - 0.01, lon, 0)).normalize();
  const e = new THREE.Vector3().crossVectors(no, n).normalize();
  no.crossVectors(n, e).normalize();
  return { n, e, no };
}
// Local east/north km frame on the tangent plane (sits above the sphere everywhere else, so no z-fight).
function localGroup(lat0, lon0, h) {
  const { n, e, no } = frame(lat0, lon0);
  const g = new THREE.Group();
  const m = new THREE.Matrix4().makeBasis(e, n, no.clone().negate());
  m.setPosition(toV(lat0, lon0, h));
  g.matrixAutoUpdate = false; g.matrix.copy(m); g.updateMatrixWorld(true);
  const kx = 111.32 * Math.cos(lat0 * D2R), ky = 110.57;
  g.userData.ll = (lat, lon) => [(lon - lon0) * kx, (lat - lat0) * ky];
  return g;
}
// Monotone cubic over time keys (no overshoot across 4 decades of altitude).
function track(keys) {
  const n = keys.length, m = keys[0].length, sl = [];
  for (let i = 0; i < n - 1; i++) sl.push(keys[i].map((v, j) => (j ? (keys[i + 1][j] - v) / Math.max(0.001, keys[i + 1][0] - keys[i][0]) : 0)));
  const tan = keys.map((k, i) => k.map((_, j) => { if (!j || i === 0 || i === n - 1) return 0; const a = sl[i - 1][j], b = sl[i][j]; return a * b <= 0 ? 0 : (2 * a * b) / (a + b); }));
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0; while (keys[i + 1][0] < t) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1[0] - k0[0], u = (t - k0[0]) / h, u2 = u * u, u3 = u2 * u, o = [];
    for (let j = 1; j < m; j++) o.push((2 * u3 - 3 * u2 + 1) * k0[j] + (u3 - 2 * u2 + u) * h * tan[i][j] + (-2 * u3 + 3 * u2) * k1[j] + (u3 - u2) * h * tan[i + 1][j]);
    return o;
  };
}
const pip = (p, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c; } return c; };
function blob(cx, cy, a, b, rot, seed, n = 40, rough = 0.12) {
  const q = mulberry(seed), ph = [q() * 6, q() * 6, q() * 6], o = [];
  for (let i = 0; i < n; i++) {
    const th = (i / n) * Math.PI * 2;
    const k = 1 + rough * (Math.sin(3 * th + ph[0]) * 0.6 + Math.sin(5 * th + ph[1]) * 0.3 + Math.sin(9 * th + ph[2]) * 0.2);
    const x = Math.cos(th) * a * k, y = Math.sin(th) * b * k;
    o.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
  }
  return o;
}

export function create(canvas, K, AT) {
  const { r, scene, cam } = stage(canvas, { bg: 0x05090d, fog: 0, exp: 1.0, bloom: [0, 0, 1], shadow: false });
  r.toneMapping = THREE.NeutralToneMapping;
  scene.fog = null;
  const camA = cam.clone(), camB = cam;
  const A = (k) => { const v = AT[k] ?? K[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const rnd = mulberry(1667);

  // ---------- lights: a sun that rides with whichever camera renders ----------
  const hemi = new THREE.HemisphereLight(0xcfd8dc, 0x1b2228, 1.1); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1dc, 1.7); scene.add(sun, sun.target);

  // ---------- globe: deep ocean, analyst grey land, coast lines, graticule, thin atmosphere ----------
  const oceanM = new THREE.MeshLambertMaterial({ color: 0x0e2738 });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(R, 360, 180), oceanM));
  const atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.022, 96, 48), new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: "varying vec3 vN;varying vec3 vV;void main(){vec4 w=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-w.xyz);gl_Position=projectionMatrix*w;}",
    fragmentShader: "varying vec3 vN;varying vec3 vV;uniform float k;void main(){float f=pow(1.-abs(dot(vN,vV)),3.);gl_FragColor=vec4(vec3(.45,.62,.72)*f*k,1.);}",
    uniforms: { k: { value: 0.9 } },
  }));
  scene.add(atm);
  const landM = new THREE.MeshLambertMaterial({ color: 0x5a6266 });
  const coastM = new THREE.LineBasicMaterial({ color: 0xaeb8bb, transparent: true, opacity: 0.55 });
  const gratM = new THREE.LineBasicMaterial({ color: 0xffbe55, transparent: true, opacity: 0.13 });
  {
    const P = [], L = [], v = new THREE.Vector3(), w = new THREE.Vector3();
    const push = (a) => { toV(a[1], a[0], 0.25, v); P.push(v.x, v.y, v.z); };
    const sub = (a, b, c, d) => {
      const e = Math.max(Math.hypot(a[0] - b[0], a[1] - b[1]), Math.hypot(b[0] - c[0], b[1] - c[1]), Math.hypot(c[0] - a[0], c[1] - a[1]));
      if (e < 1.0 || d > 8) { push(a); push(b); push(c); return; }
      const ab = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], bc = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2], ca = [(c[0] + a[0]) / 2, (c[1] + a[1]) / 2];
      sub(a, ab, ca, d + 1); sub(ab, b, bc, d + 1); sub(ca, bc, c, d + 1); sub(ab, bc, ca, d + 1);
    };
    for (const c of GEO) for (const rg of c.rings) {
      const pts = rg.map((p) => new THREE.Vector2(p[0], p[1]));
      let tris = [];
      try { tris = THREE.ShapeUtils.triangulateShape(pts, []); } catch (e) { tris = []; }
      for (const [i, j, k] of tris) sub(rg[i], rg[j], rg[k], 0);
      for (let i = 0; i < rg.length; i++) { const a = rg[i], b = rg[(i + 1) % rg.length]; toV(a[1], a[0], 0.6, v); toV(b[1], b[0], 0.6, w); L.push(v.x, v.y, v.z, w.x, w.y, w.z); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.computeVertexNormals();
    // normals point outwards from the centre; recompute radially so lighting is smooth and winding cannot flip it
    const pa = g.attributes.position.array, na = g.attributes.normal.array;
    for (let i = 0; i < pa.length; i += 3) { v.set(pa[i], pa[i + 1], pa[i + 2]).normalize(); na[i] = v.x; na[i + 1] = v.y; na[i + 2] = v.z; }
    const land = new THREE.Mesh(g, landM); landM.side = THREE.DoubleSide; scene.add(land);
    const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(L, 3));
    scene.add(new THREE.LineSegments(lg, coastM));
    const G = [];
    for (let lon = -180; lon < 180; lon += 15) for (let lat = -80; lat < 80; lat += 2) { toV(lat, lon, 1, v); toV(lat + 2, lon, 1, w); G.push(v.x, v.y, v.z, w.x, w.y, w.z); }
    for (let lat = -75; lat <= 75; lat += 15) for (let lon = -180; lon < 180; lon += 2) { toV(lat, lon, 1, v); toV(lat, lon + 2, 1, w); G.push(v.x, v.y, v.z, w.x, w.y, w.z); }
    const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.Float32BufferAttribute(G, 3));
    scene.add(new THREE.LineSegments(gg, gratM));
  }

  // ---------- labels: canvas sprites, constant pixel size, culled by the horizon per camera ----------
  const paints = [], LB = [];
  function label(text, { size = 26, family = '"IBM Plex Mono"', weight = 600, color = AMB, bg = null, fg = null, anchor = [0, 0.5] } = {}) {
    const c = document.createElement("canvas"), g = c.getContext("2d");
    const font = `${weight} ${size}px ${family}`;
    g.font = font; const w = Math.ceil(g.measureText(text).width * 1.2) + 32, h = Math.ceil(size * 1.55);
    c.width = w; c.height = h;
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({ map: tex, sizeAttenuation: false, depthTest: false, depthWrite: false, transparent: true, opacity: 0 });
    const s = new THREE.Sprite(mat); s.renderOrder = 60; s.center.set(anchor[0], anchor[1]);
    const paint = () => { g.clearRect(0, 0, w, h); g.font = font; g.textBaseline = "middle"; const tw = g.measureText(text).width; if (bg) { g.fillStyle = bg; g.fillRect(4, 3, tw + 24, h - 6); g.fillStyle = fg || "#081218"; g.fillText(text, 16, h / 2 + 1); } else { g.lineJoin = "round"; g.lineWidth = 6; g.strokeStyle = "rgba(3,9,13,.92)"; g.strokeText(text, 16, h / 2); g.fillStyle = color; g.fillText(text, 16, h / 2); } tex.needsUpdate = true; };
    paint(); paints.push(paint); s.scale.set(w * PX, h * PX, 1); scene.add(s);
    const o = { s, o: 0 }; LB.push(o); return o;
  }
  const geoLabel = (text, lat, lon, opt) => { const o = label(text, opt); toV(lat, lon, 2, o.s.position); return o; };
  const locLabel = (grp, text, x, y, h, opt) => { const o = label(text, opt); o.s.position.set(x, h, -y).applyMatrix4(grp.matrix); return o; };
  let fontsOK = false;
  try { document.fonts.load('700 40px "Barlow Semi Condensed"'); document.fonts.load('600 26px "IBM Plex Mono"'); } catch (e) { }
  const BSC = '"Barlow Semi Condensed"';

  // sprite icons: reticle, chevron (ship), diamond pin
  const iconSprite = (draw, px, color = 0xffffff) => {
    const tex = canvasTex(256, 256, draw);
    const m = new THREE.SpriteMaterial({ map: tex, sizeAttenuation: false, depthTest: false, depthWrite: false, transparent: true, opacity: 0, color });
    const s = new THREE.Sprite(m); s.renderOrder = 58; s.scale.set(px * PX, px * PX, 1); scene.add(s);
    const o = { s, o: 0 }; LB.push(o); return o;
  };
  const drawRet = (g, w) => {
    g.strokeStyle = AMB; g.lineWidth = 6; g.beginPath(); g.arc(128, 128, 104, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 3; g.setLineDash([10, 9]); g.beginPath(); g.arc(128, 128, 70, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    g.lineWidth = 6; for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 2; g.beginPath(); g.moveTo(128 + Math.cos(a) * 90, 128 + Math.sin(a) * 90); g.lineTo(128 + Math.cos(a) * 124, 128 + Math.sin(a) * 124); g.stroke(); }
    g.lineWidth = 3; g.beginPath(); g.moveTo(116, 128); g.lineTo(140, 128); g.moveTo(128, 116); g.lineTo(128, 140); g.stroke();
  };
  const drawChev = (g) => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(128, 30); g.lineTo(205, 215); g.lineTo(128, 172); g.lineTo(51, 215); g.closePath(); g.fill(); g.strokeStyle = "rgba(0,0,0,.7)"; g.lineWidth = 10; g.stroke(); };
  const drawDia = (g) => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(128, 40); g.lineTo(200, 128); g.lineTo(128, 216); g.lineTo(56, 128); g.closePath(); g.fill(); g.strokeStyle = "rgba(0,0,0,.75)"; g.lineWidth = 12; g.stroke(); };

  // ---------- BANDA: local patch around Run (km, x east, y north) ----------
  const BA = localGroup(RUN[0], RUN[1], 0.42); scene.add(BA);
  const bandaMats = [];
  const flat = (poly, color, h, grp, opacity = 1) => {
    const sh = new THREE.Shape(poly.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2);
    const m = new THREE.MeshLambertMaterial({ color, transparent: true, opacity, depthWrite: true });
    const me = new THREE.Mesh(g, m); me.position.y = h; grp.add(me); return me;
  };
  const outline = (poly, color, h, grp, op = 0.9) => {
    const g = new THREE.BufferGeometry().setFromPoints(poly.map(([x, y]) => new THREE.Vector3(x, h, -y)));
    const l = new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: op })); grp.add(l); return l;
  };
  // sea patch: lighter shallow water with a radial alpha so it melts into the globe, plus a 1 km analyst grid
  const alphaT = canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, w * 0.15, w / 2, w / 2, w / 2); gr.addColorStop(0, "#fff"); gr.addColorStop(1, "#000"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const seaT = canvasTex(1024, 1024, (g, w) => { g.fillStyle = "#16384a"; g.fillRect(0, 0, w, w); const q = mulberry(5); for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${150 + q() * 60},${180 + q() * 40},${200},${0.03 + q() * 0.05})`; g.fillRect(q() * w, q() * w, 1 + q() * 3, 1); } });
  const bSea = new THREE.Mesh(new THREE.CircleGeometry(60, 96), new THREE.MeshLambertMaterial({ map: seaT, alphaMap: alphaT, transparent: true, depthWrite: false }));
  bSea.rotation.x = -Math.PI / 2; BA.add(bSea); bandaMats.push(bSea.material);
  const gridM = new THREE.LineBasicMaterial({ color: 0xffbe55, transparent: true, opacity: 0.07 });
  { const G = []; for (let i = -14; i <= 14; i++) { G.push(i, 0.01, -14, i, 0.01, 14, -14, 0.01, i, 14, 0.01, i); } const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(G, 3)); BA.add(new THREE.LineSegments(g, gridM)); }
  const RUNP = blob(0, 0, 1.5, 0.5, -0.12, 11, 56, 0.16);
  const isl = {
    run: RUNP, nailaka: blob(1.35, 0.95, 0.3, 0.15, 0.4, 12, 20),
    ai: blob(10.2, 2.1, 1.35, 0.9, 0.2, 13), neira: blob(24.2, 3.1, 1.3, 0.55, 0.35, 14),
    api: blob(21.3, 4.7, 1.45, 1.35, 0, 15, 40, 0.06),
  };
  { const o = [], ii = []; for (let i = 0; i <= 24; i++) { const a = (-130 + (140 * i) / 24) * D2R; o.push([26.5 + Math.cos(a) * 4.6, 1.2 + Math.sin(a) * 4.0]); ii.push([26.5 + Math.cos(a) * 3.7, 1.2 + Math.sin(a) * 3.15]); } isl.besar = o.concat(ii.reverse()); }
  const islM = {};
  for (const [k, p] of Object.entries(isl)) { islM[k] = flat(p, k === "run" ? 0x6e7a76 : 0x5d6568, 0.02, BA); outline(p, k === "run" ? 0xffbe55 : 0xaeb8bb, 0.04, BA, k === "run" ? 0.95 : 0.6); }
  // Gunung Api: a low cone so oblique views read it as a volcano
  { const c = new THREE.Mesh(new THREE.ConeGeometry(1.25, 0.65, 40, 1, true), new THREE.MeshLambertMaterial({ color: 0x575e60 })); c.position.set(21.3, 0.35, -4.7); BA.add(c); }
  // measurement frame around Run: 3 km x 1 km
  const measM = new THREE.LineDashedMaterial({ color: 0xffbe55, dashSize: 0.12, gapSize: 0.08, transparent: true, opacity: 0 });
  const meas = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([[-1.5, -0.55], [1.5, -0.55], [1.5, 0.55], [-1.5, 0.55]].map(([x, y]) => new THREE.Vector3(x, 0.06, -y))), measM);
  meas.computeLineDistances(); BA.add(meas);
  const L3 = locLabel(BA, "± 3 KM", 0, 0.62, 0.1, { size: 28, color: AMB, anchor: [0.5, 0] });
  const L1 = locLabel(BA, "± 1 KM", 1.58, 0, 0.1, { size: 24, color: AMB, anchor: [0, 0.5] });
  // nutmeg markers: points inside Run
  const NUTN = 34, nutPos = [], nutCol = new Float32Array(NUTN * 3), nutOrder = [];
  { const q = mulberry(17); while (nutPos.length < NUTN) { const x = (q() - 0.5) * 2.9, y = (q() - 0.5) * 0.95; if (pip([x, y], RUNP) && Math.abs(x) < 1.32) nutPos.push(x, 0.08, -y); } for (let i = 0; i < NUTN; i++) nutOrder.push(q()); }
  const nutG = new THREE.BufferGeometry(); nutG.setAttribute("position", new THREE.Float32BufferAttribute(nutPos, 3)); nutG.setAttribute("color", new THREE.BufferAttribute(nutCol, 3));
  const dotT = canvasTex(64, 64, (g, w) => { g.fillStyle = "#fff"; g.beginPath(); g.arc(32, 32, 18, 0, 7); g.fill(); g.strokeStyle = "rgba(0,0,0,.8)"; g.lineWidth = 6; g.stroke(); });
  const nutM = new THREE.PointsMaterial({ size: 17, sizeAttenuation: false, map: dotT, vertexColors: true, transparent: true, depthTest: false, alphaTest: 0.05 });
  const nuts = new THREE.Points(nutG, nutM); nuts.renderOrder = 50; BA.add(nuts);
  const cNut = new THREE.Color(NUT), cDead = new THREE.Color(0x3a4246);
  // English fort on the north-west shore: four-bastion star + block
  const FORT = [-0.95, 0.22];
  const fortPoly = []; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 + Math.PI / 4, rr = i % 4 === 0 ? 0.2 : 0.11; fortPoly.push([FORT[0] + Math.cos(a) * rr, FORT[1] + Math.sin(a) * rr]); }
  const fortL = outline(fortPoly, 0x9fd3ff, 0.09, BA, 0);
  const fortB = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.16), new THREE.MeshLambertMaterial({ color: 0xcfe3ef, transparent: true, opacity: 0 })); fortB.position.set(FORT[0], 0.06, -FORT[1]); BA.add(fortB);
  const LFort = locLabel(BA, "BENTENG INGGRIS · 1616", FORT[0] - 0.25, FORT[1] + 0.25, 0.1, { size: 24, color: COLD, anchor: [1, 0] });
  const LFort2 = locLabel(BA, "1620 · BENTENG JATUH", FORT[0] - 0.25, FORT[1] + 0.25, 0.1, { size: 24, color: CORAL, anchor: [1, 0] });
  // siege ring
  const ringPts = []; for (let i = 0; i <= 200; i++) { const a = (i / 200) * Math.PI * 2 + Math.PI / 2; ringPts.push(new THREE.Vector3(Math.cos(a) * 3.3, 0.07, -Math.sin(a) * 3.3)); }
  const ringG = new THREE.BufferGeometry().setFromPoints(ringPts);
  const ringL = new THREE.Line(ringG, new THREE.LineDashedMaterial({ color: 0xff7a59, dashSize: 0.25, gapSize: 0.14, transparent: true, opacity: 0 })); ringL.computeLineDistances(); BA.add(ringL);
  const voc = []; for (let i = 0; i < 10; i++) voc.push(iconSprite(drawChev, 34, 0xff7a59));
  const eng = iconSprite(drawChev, 38, 0x9fd3ff);
  const LVoc = locLabel(BA, "VOC · BLOKADE", 2.5, 2.7, 0.1, { size: 26, color: CORAL });
  const LEng = locLabel(BA, "KAPAL EIC · COURTHOPE", -1.2, -0.75, 0.1, { size: 22, color: COLD, anchor: [-0.08, 1.3] });
  const LRun = locLabel(BA, "PULAU RUN", 0.2, -0.75, 0.1, { size: 34, family: BSC, weight: 700, color: AMB, anchor: [0.5, 1] });
  const LAi = locLabel(BA, "AI", 10.2, 0.9, 0.1, { size: 22, color: GREY, anchor: [0.5, 1] });
  const LNai = locLabel(BA, "NAILAKA", 1.7, 1.1, 0.1, { size: 18, color: GREY });
  const LNeira = locLabel(BA, "BANDA NEIRA", 24.0, 2.3, 0.1, { size: 22, color: GREY, anchor: [0.5, 1] });
  const LApi = locLabel(BA, "GUNUNG API", 21.3, 6.4, 0.1, { size: 20, color: GREY, anchor: [0.5, 0] });
  const LBes = locLabel(BA, "BANDA BESAR", 24.5, -3.0, 0.1, { size: 20, color: GREY, anchor: [0.5, 1] });
  const LBel = locLabel(BA, "BELANDA", 24.0, 4.2, 0.1, { size: 30, family: BSC, weight: 700, color: CORAL, anchor: [0.5, 0] });
  const belPin = iconSprite(drawDia, 30, 0xff7a59); belPin.s.position.set(24.0, 0.1, -3.4).applyMatrix4(BA.matrix);
  const LToday = locLabel(BA, "HARI INI · PALA MASIH TUMBUH", 0, -0.72, 0.1, { size: 22, color: NUT, anchor: [0.5, 1] });

  // ---------- NEW YORK: local patch around Manhattan ----------
  const NY = localGroup(MAN[0], MAN[1] - 360, 0.42); scene.add(NY);
  const ll = NY.userData.ll;
  const LLm = (a) => a.map(([lo, la]) => ll(la, lo));
  const MANP = LLm([[-74.0165, 40.701], [-74.019, 40.708], [-74.015, 40.718], [-74.013, 40.729], [-74.0105, 40.74], [-74.0085, 40.752], [-74.003, 40.76], [-73.996, 40.77], [-73.988, 40.782], [-73.98, 40.793], [-73.971, 40.806], [-73.961, 40.82], [-73.953, 40.834], [-73.946, 40.847], [-73.939, 40.859], [-73.931, 40.87], [-73.926, 40.8775], [-73.918, 40.88], [-73.911, 40.876], [-73.915, 40.868], [-73.923, 40.859], [-73.93, 40.848], [-73.933, 40.835], [-73.9345, 40.82], [-73.934, 40.808], [-73.93, 40.798], [-73.937, 40.786], [-73.944, 40.778], [-73.953, 40.768], [-73.962, 40.756], [-73.97, 40.745], [-73.973, 40.735], [-73.972, 40.726], [-73.977, 40.713], [-73.987, 40.7095], [-73.998, 40.707], [-74.006, 40.7035], [-74.012, 40.7005]]);
  const NJ = LLm([[-74.13, 40.648], [-74.07, 40.652], [-74.05, 40.67], [-74.04, 40.69], [-74.035, 40.71], [-74.03, 40.725], [-74.026, 40.74], [-74.023, 40.755], [-74.014, 40.77], [-74.002, 40.785], [-73.99, 40.8], [-73.977, 40.817], [-73.966, 40.832], [-73.956, 40.848], [-73.947, 40.865], [-73.94, 40.885], [-73.932, 40.905], [-73.923, 40.93], [-73.915, 40.96], [-73.91, 41.08], [-74.45, 41.08], [-74.45, 40.45], [-74.27, 40.5], [-74.25, 40.6], [-74.21, 40.65]]);
  const BX = LLm([[-73.895, 41.08], [-73.9, 40.94], [-73.906, 40.91], [-73.912, 40.885], [-73.905, 40.876], [-73.91, 40.866], [-73.918, 40.857], [-73.925, 40.846], [-73.928, 40.834], [-73.929, 40.82], [-73.928, 40.808], [-73.925, 40.8], [-73.915, 40.797], [-73.9, 40.8], [-73.88, 40.803], [-73.86, 40.805], [-73.84, 40.8], [-73.82, 40.802], [-73.8, 40.81], [-73.78, 40.8], [-73.7, 40.83], [-73.62, 40.88], [-73.55, 41.08]]);
  const LI = LLm([[-73.55, 40.82], [-73.75, 40.79], [-73.8, 40.79], [-73.85, 40.785], [-73.88, 40.782], [-73.905, 40.785], [-73.918, 40.778], [-73.928, 40.772], [-73.937, 40.765], [-73.948, 40.755], [-73.955, 40.745], [-73.96, 40.735], [-73.963, 40.725], [-73.966, 40.712], [-73.975, 40.703], [-73.99, 40.7], [-73.999, 40.696], [-74.004, 40.688], [-74.012, 40.678], [-74.018, 40.668], [-74.025, 40.655], [-74.034, 40.64], [-74.04, 40.625], [-74.035, 40.607], [-74.01, 40.59], [-73.98, 40.575], [-73.94, 40.575], [-73.9, 40.565], [-73.85, 40.58], [-73.75, 40.59], [-73.55, 40.6]]);
  const SI = LLm([[-74.07, 40.645], [-74.09, 40.641], [-74.16, 40.645], [-74.2, 40.635], [-74.25, 40.54], [-74.24, 40.5], [-74.18, 40.52], [-74.1, 40.57], [-74.06, 40.6], [-74.055, 40.625]]);
  const PARK = LLm([[-73.973, 40.764], [-73.9815, 40.768], [-73.958, 40.8], [-73.9495, 40.797]]);
  const nySea = new THREE.Mesh(new THREE.CircleGeometry(70, 96), new THREE.MeshLambertMaterial({ map: seaT, alphaMap: alphaT, transparent: true, depthWrite: false })); nySea.rotation.x = -Math.PI / 2; NY.add(nySea);
  const nyLandM = [];
  for (const p of [NJ, BX, LI, SI]) { const m = flat(p, 0x545c60, 0.02, NY); nyLandM.push(m.material); outline(p, 0xaeb8bb, 0.04, NY, 0.45); }
  const manM = flat(MANP, 0x6c7477, 0.03, NY).material; const manL = outline(MANP, 0xffbe55, 0.06, NY, 0.95);
  flat(PARK, 0x3f5547, 0.035, NY);
  // generic skyline: blocks on a grid tilted with the island; taller clusters in midtown and downtown. No landmarks.
  const ang = 29 * D2R, ca = Math.cos(ang), sa = Math.sin(ang);
  const mid = ll(40.756, -73.984), fidi = ll(40.708, -74.01);
  const BLD = [];
  { const q = mulberry(1664); for (let i = -60; i <= 60; i++) for (let j = -70; j <= 70; j++) {
      const u = i * 0.26 + (q() - 0.5) * 0.04, v = j * 0.27 + (q() - 0.5) * 0.04, x = u * ca + v * sa, y = -u * sa + v * ca;
      if (!pip([x, y], MANP) || pip([x, y], PARK)) continue;
      const dm = Math.hypot(x - mid[0], y - mid[1]), df = Math.hypot(x - fidi[0], y - fidi[1]);
      const hgt = 0.025 + 0.05 * q() + 0.36 * Math.exp(-((dm / 1.3) ** 2)) * (0.35 + 0.65 * q()) + 0.3 * Math.exp(-((df / 0.7) ** 2)) * (0.35 + 0.65 * q());
      const f = 0.1 + q() * 0.08;
      BLD.push([x, y, f, f * (0.8 + q() * 0.5), hgt * 1.6, q()]);
    } }
  const bM = new THREE.MeshStandardMaterial({ color: 0x9aa4a8, roughness: 0.75, metalness: 0.1 });
  const bI = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), bM, BLD.length); NY.add(bI);
  const bCol = new THREE.Color(); BLD.forEach((b, i) => { bCol.setHex(0x8f999d).lerp(new THREE.Color(0xc9d0d3), b[5] * 0.6 + (b[4] > 0.3 ? 0.3 : 0)); bI.setColorAt(i, bCol); });
  const dmo = new THREE.Object3D();
  const LMan = locLabel(NY, "MANHATTAN", 2.6, 1.2, 0.2, { size: 34, family: BSC, weight: 700, color: AMB });
  const NAp = ll(40.703, -74.0135);
  const naPin = iconSprite(drawDia, 30, 0xff7a59); naPin.s.position.set(NAp[0], 0.1, -NAp[1]).applyMatrix4(NY.matrix);
  const LNA = locLabel(NY, "NEW AMSTERDAM · BELANDA", NAp[0] - 0.6, NAp[1], 0.1, { size: 24, color: CORAL, anchor: [1, 0.5] });
  const LNYc = locLabel(NY, "NEW YORK · INGGRIS", NAp[0] - 0.6, NAp[1], 0.1, { size: 24, color: COLD, anchor: [1, 0.5] });
  const LHud = locLabel(NY, "SUNGAI HUDSON", ll(40.8, -73.99)[0] - 0.4, ll(40.8, -73.99)[1], 0.1, { size: 18, color: "#86A9BC", anchor: [1, 0.5] });
  const LToday2 = locLabel(NY, "HARI INI · PUSAT DUNIA", 2.6, -0.2, 0.2, { size: 22, color: COLD });
  const fleet = []; for (let i = 0; i < 4; i++) fleet.push(iconSprite(drawChev, 32, 0x9fd3ff));

  // ---------- globe labels ----------
  const GL = {
    indo: geoLabel("INDONESIA", 0.5, 115.5, { size: 40, family: BSC, weight: 700, color: "#C9D2D4", anchor: [0.5, 0.5] }),
    maluku: geoLabel("MALUKU", -2.6, 127.6, { size: 30, family: BSC, weight: 700, color: "#C9D2D4", anchor: [0.5, 0.5] }),
    lautb: geoLabel("LAUT BANDA", -6.2, 127.2, { size: 24, color: "#86A9BC", anchor: [0.5, 0.5] }),
    papua: geoLabel("PAPUA", -4.6, 138.5, { size: 30, family: BSC, weight: 700, color: "#C9D2D4", anchor: [0.5, 0.5] }),
    kepb: geoLabel("KEPULAUAN BANDA", -4.55, 130.2, { size: 26, color: AMB, anchor: [0, 0.5] }),
    pac: geoLabel("SAMUDRA PASIFIK", 20, 185, { size: 30, color: "#86A9BC", anchor: [0.5, 0.5] }),
    amer: geoLabel("AMERIKA UTARA", 46, -100, { size: 40, family: BSC, weight: 700, color: "#C9D2D4", anchor: [0.5, 0.5] }),
    nyreg: geoLabel("NEW YORK", 40.9, -73.2, { size: 26, color: AMB, anchor: [0, 0.5] }),
  };
  // great-circle link Run -> Manhattan, drawn while feed B flies it
  const nR = toV(RUN[0], RUN[1], 0).normalize(), nM = toV(MAN[0], MAN[1], 0).normalize();
  const OM = Math.acos(nR.dot(nM));
  const slerp = (u, o = new THREE.Vector3()) => o.copy(nR).multiplyScalar(Math.sin((1 - u) * OM) / Math.sin(OM)).addScaledVector(nM, Math.sin(u * OM) / Math.sin(OM));
  const arcP = []; for (let i = 0; i <= 400; i++) { const u = i / 400; arcP.push(slerp(u).multiplyScalar(R + 60 + 900 * Math.sin(Math.PI * u))); }
  const arcG = new THREE.BufferGeometry().setFromPoints(arcP);
  const arcL = new THREE.Line(arcG, new THREE.LineBasicMaterial({ color: 0xffbe55, transparent: true, opacity: 0, depthWrite: false })); scene.add(arcL);

  // reticles + AUDIRA OSINT tags (part of the briefing HUD in the world)
  const retR = iconSprite(drawRet, 190), retM = iconSprite(drawRet, 190);
  retR.s.position.copy(toV(RUN[0], RUN[1], 0.6)); retM.s.position.copy(toV(MAN[0], MAN[1] - 360, 0.6));
  const tagR = label("AUDIRA OSINT · TARGET 01", { size: 20, color: AMB, anchor: [0, 1] }); tagR.s.position.copy(retR.s.position);
  const tagM = label("AUDIRA OSINT · TARGET 02", { size: 20, color: AMB, anchor: [0, 1] }); tagM.s.position.copy(retM.s.position);
  for (const o of [tagR, tagM]) o.s.center.set(0.14, 4.3);

  // ---------- cameras: [t, lat, lon, log10 km, tilt, heading, screen x, screen y] ----------
  const s6e = K.s6e, tRunW = A("s7:Run");
  const camBT = track([
    [0, ...RUN, 1.42, 0, 0, 380, 1140],
    [K.s1e, ...RUN, 1.32, 0, 0, 380, 1140],
    [A("s2:Run"), ...RUN, 1.42, 0, 0, 540, 1060],
    [A("s2:Panjangnya") - 0.3, -4.2, 129.9, 3.05, 0, 0, 540, 1060],
    [A("s2:kilometer"), ...RUN, 1.12, 0, 0, 540, 1060],
    [A("s2:penghasil"), ...RUN, 1.08, 16, -8, 540, 1080],
    [K.s2e, ...RUN, 1.1, 22, -14, 540, 1080],
    [A("s3:warga"), ...RUN, 1.25, 18, -10, 540, 1080],
    [A("s3:takut"), -4.53, 129.79, 1.9, 8, 0, 540, 1060],
    [A("s3:Belanda") + 0.4, -4.53, 129.79, 1.9, 8, 0, 540, 1060],
    [A("s3:Courthope"), ...RUN, 1.22, 14, -6, 540, 1080],
    [K.s3e, ...RUN, 1.15, 24, -12, 540, 1080],
    [A("s4:VOC"), ...RUN, 1.4, 18, -4, 540, 1080],
    [A("s4:mengepung") + 1, ...RUN, 1.43, 26, 6, 540, 1080],
    [A("s4:1620"), ...RUN, 1.38, 30, 18, 540, 1080],
    [K.s4e, ...RUN, 1.28, 18, 18, 540, 1080],
    [A("s5:Laki-laki"), ...RUN, 1.12, 6, 14, 540, 1080],
    [A("s5:ditebang"), ...RUN, 1.05, 0, 10, 540, 1080],
    [K.s5e, ...RUN, 1.02, 0, 8, 540, 1080],
    [K.s6 + 0.3, ...RUN, 1.15, 0, 4, 540, 1060],
    [K.s6 + 1.7, ...RUN, 3.9, 0, 0, 540, 1060],
    [K.s6 + 3.2, ...RUN, 4.22, 0, 0, 540, 1060],
    [K.s6 + 4.6, ...MAN, 3.55, 0, 15, 540, 1060],
    [A("s6:Amsterdam") + 0.2, ...MAN, 2.3, 0, 29, 540, 1060],
    [A("s6:Manhattan"), ...MAN, 1.86, 0, 29, 540, 1060],
    [s6e, ...MAN, 1.78, 0, 29, 540, 1060],
    [s6e + 0.01, ...RUN, 1.33, 0, 0, 540, 1160],
    [A("s8:pohon"), ...RUN, 1.3, 14, -6, 540, 1160],
    [K.dur, ...RUN, 1.27, 22, -12, 540, 1160],
  ]);
  const fly0 = K.s6 + 0.5, fly1 = A("s6:Amsterdam") - 0.3;
  const camAT = track([
    [0, ...MAN, 1.78, 0, 29, 700, 720],
    [K.s1e, ...MAN, 1.7, 0, 29, 700, 720],
    [K.s2 + 1, ...MAN, 1.7, 0, 29, 700, 720],
    [s6e, ...MAN, 1.78, 0, 29, 540, 1060],
    [A("s7:Breda"), ...MAN, 1.88, 10, 32, 540, 1060],
    [tRunW - 0.05, ...MAN, 1.9, 12, 33, 540, 1060],
    [tRunW + 0.7, ...MAN, 1.86, 14, 31, 540, 860],
    [K.s7e, ...MAN2, 1.7, 24, 29, 540, 860],
    [A("s8:jadi"), ...MAN2, 1.42, 52, 27, 540, 880],
    [A("s8:dunia"), ...MAN2, 1.34, 58, 24, 540, 880],
    [K.dur, ...MAN2, 1.3, 61, 16, 540, 880],
  ]);
  const split = (t) => {
    if (t < K.s2 - 0.35) return 960;
    if (t < s6e) return 960 * (1 - smooth((t - (K.s2 - 0.35)) / 0.65));
    if (t < tRunW - 0.1) return 1920;
    return 1920 - 920 * smooth((t - (tRunW - 0.1)) / 0.75);
  };
  const T = new THREE.Vector3(), tmp = new THREE.Vector3();
  function pose(c, p, t, flying) {
    let fr;
    if (flying) { const u = smooth((t - fly0) / (fly1 - fly0)); slerp(u, tmp); const lat = Math.asin(tmp.y) / D2R; const lon = Math.atan2(tmp.z, -tmp.x) / D2R - 180; fr = frame(lat, lon); T.copy(tmp).multiplyScalar(R); }
    else { fr = frame(p[0], p[1]); toV(p[0], p[1], 0.45, T); }
    const D = Math.pow(10, p[2]), tl = p[3] * D2R, hd = p[4] * D2R;
    const fwd = fr.no.clone().multiplyScalar(Math.cos(hd)).addScaledVector(fr.e, Math.sin(hd));
    c.position.copy(T).addScaledVector(fr.n, D * Math.cos(tl)).addScaledVector(fwd, -D * Math.sin(tl));
    c.up.copy(fwd).multiplyScalar(Math.cos(tl)).addScaledVector(fr.n, Math.sin(tl));
    c.lookAt(T);
    const hz = Math.sqrt(2 * R * D + D * D);
    c.near = Math.max(0.02, D * 0.02); c.far = hz * 1.3 + D;
    c.userData = { D, lD: p[2], sx: p[5], sy: p[6], tgt: T.clone() };
  }

  // DOM bits of the briefing HUD that depend on the cameras
  const $ = (id) => document.getElementById(id);
  const seam = $("seam"), fa = $("fa"), fb = $("fb"), lk = $("lk"), badge = $("badge"), hudloc = $("hudloc"), hudalt = $("hudalt"), mute = $("mute");
  const fmtN = (v, d) => v.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });
  const llTxt = (lat, lon) => { lon = ((lon + 540) % 360) - 180; return fmtN(Math.abs(lat), 2) + "°" + (lat < 0 ? "LS" : "LU") + " " + fmtN(Math.abs(lon), 2) + "°" + (lon < 0 ? "BB" : "BT"); };

  const sv = (o, v) => { o.o = clamp01(v); };
  const camOf = (c) => c;
  function prep(c) {
    const P = c.position;
    for (const o of LB) {
      if (o.o <= 0.01) { o.s.visible = false; continue; }
      tmp.copy(o.s.position); const up = tmp.clone().normalize();
      const vis = up.dot(tmp.sub(P).negate()) > 0;
      o.s.visible = vis; o.s.material.opacity = o.o;
    }
    sun.position.copy(c.position).addScaledVector(c.up, c.userData.D * 0.8).add(c.userData.tgt.clone().normalize().multiplyScalar(c.userData.D * 0.6 + 50));
    sun.target.position.copy(c.userData.tgt);
  }
  function view(c, top, h) {
    if (h < 1) return;
    const u = c.userData;
    c.aspect = 1080 / 1920; c.setViewOffset(1080, 1920, 540 - u.sx, 960 - (u.sy - top), 1080, h); c.updateProjectionMatrix();
    prep(c);
    r.setViewport(0, 1920 - top - h, 1080, h); r.setScissor(0, 1920 - top - h, 1080, h);
    r.render(scene, c);
  }
  r.autoClear = false;

  return (t) => {
    if (!fontsOK) { try { if (document.fonts.check('700 40px "Barlow Semi Condensed"') && document.fonts.check('600 26px "IBM Plex Mono"')) { paints.forEach((f) => f()); fontsOK = true; } } catch (e) { fontsOK = true; } }
    const S = split(t);
    const flying = t > fly0 && t < fly1;
    pose(camB, camBT(t), t, flying);
    pose(camA, camAT(t), t, false);
    const lead = S >= 1919 ? camA : camB, lD = lead.userData.lD;

    // ----- layer visibility by altitude -----
    const lowB = 1 - ramp(lD, 2.6, 3.3);
    coastM.opacity = 0.55 * ramp(lD, 1.7, 2.3) + 0.12; gratM.opacity = 0.13 * ramp(lD, 2.6, 3.4);
    BA.visible = true; NY.visible = true;
    atm.material.uniforms.k.value = 0.9 * ramp(lD, 3, 3.8);

    // ----- story states -----
    const tNut = A("s2:penghasil"), tDead0 = A("s5:semua"), tDead1 = A("s5:ditebang") + 0.5, tLive = A("s8:pohon");
    const muted = ramp(t, K.s5 + 0.3, K.s5 + 2) * (1 - ramp(t, K.s6 - 0.2, K.s6 + 0.8));
    for (let i = 0; i < NUTN; i++) {
      const born = ramp(t, tNut + nutOrder[i] * 1.6, tNut + nutOrder[i] * 1.6 + 0.2);
      const dead = ramp(t, tDead0 + nutOrder[i] * (tDead1 - tDead0 - 0.4), tDead0 + nutOrder[i] * (tDead1 - tDead0 - 0.4) + 0.35);
      const live = ramp(t, tLive + nutOrder[i] * 1.2, tLive + nutOrder[i] * 1.2 + 0.25);
      const k = born * (1 - dead) + live * dead; // alive weight
      tmp.set(cNut.r, cNut.g, cNut.b).lerp(new THREE.Vector3(cDead.r, cDead.g, cDead.b), 1 - k);
      const vis = born > 0.01 ? 1 : 0;
      nutCol[i * 3] = tmp.x * vis; nutCol[i * 3 + 1] = tmp.y * vis; nutCol[i * 3 + 2] = tmp.z * vis;
    }
    nutG.attributes.color.needsUpdate = true; nuts.visible = t > tNut;
    islM.run.material.color.setHex(0x6e7a76).lerp(new THREE.Color(0x40474a), muted);
    // measurement
    const mOn = ramp(t, A("s2:tiga") - 0.2, A("s2:tiga") + 0.4) * (1 - ramp(t, A("s2:abad"), A("s2:abad") + 0.5));
    measM.opacity = mOn; meas.visible = mOn > 0.01; sv(L3, mOn); sv(L1, mOn);
    // fort
    const fOn = ramp(t, A("s3:membangun"), A("s3:benteng") + 0.3) * (1 - ramp(t, K.s6 - 0.5, K.s6 + 0.3));
    const fell = ramp(t, A("s4:1620"), A("s4:1620") + 0.5);
    fortL.material.opacity = fOn; fortL.material.color.set(fell > 0.5 ? 0xff7a59 : 0x9fd3ff); fortB.material.opacity = fOn * (1 - 0.6 * fell);
    fortL.visible = fortB.visible = fOn > 0.01;
    fortB.scale.y = 0.2 + 0.8 * ramp(t, A("s3:membangun"), A("s3:benteng") + 0.4);
    sv(LFort, fOn * (1 - fell) * (1 - ramp(t, K.s4 - 0.3, K.s4))); sv(LFort2, fell * (1 - ramp(t, K.s5 + 0.5, K.s5 + 1.1)));
    // English ship sails in from the west
    const eu = eout((t - A("s3:tiba") + 0.9) / 1.6);
    eng.s.position.set(-6.5 + 5.2 * eu, 0.12, -0.75 + 0.2 * eu).applyMatrix4(BA.matrix); eng.s.material.rotation = -Math.PI / 2 - 0.05;
    sv(eng, ramp(t, A("s3:Kapten") - 0.2, A("s3:Kapten") + 0.2) * (1 - ramp(t, K.s4 + 1.5, K.s4 + 2.2)));
    sv(LEng, ramp(t, A("s3:tiba"), A("s3:tiba") + 0.3) * (1 - ramp(t, K.s4 - 0.4, K.s4)));
    LEng.s.position.copy(eng.s.position);
    // VOC siege ring
    const vIn = ramp(t, A("s4:VOC") - 0.2, A("s4:mengepung") + 1.2), vOut = 1 - ramp(t, K.s5 + 2.5, K.s5 + 4);
    const days = clamp01((t - A("s4:bertahan")) / (A("s4:hari") - A("s4:bertahan")));
    voc.forEach((o, i) => {
      const a0 = (i / 10) * Math.PI * 2 + (t - K.s4) * 0.05;
      const sx = 13 + i * 0.6, sy = 3 + Math.sin(i) * 2, rr = 3.3;
      const x = sx + (Math.cos(a0) * rr - sx) * eout(vIn), y = sy + (Math.sin(a0) * rr - sy) * eout(vIn);
      o.s.position.set(x, 0.12, -y).applyMatrix4(BA.matrix);
      o.s.material.rotation = a0 + Math.PI;
      sv(o, ramp(t, A("s4:VOC") - 0.3 + i * 0.05, A("s4:VOC") + i * 0.05) * vOut);
    });
    ringL.material.opacity = 0.85 * ramp(t, A("s4:mengepung") + 0.6, A("s4:mengepung") + 1.2) * vOut;
    ringG.setDrawRange(0, Math.floor(201 * (t < A("s4:bertahan") ? 1 : Math.max(0.02, days))));
    ringL.visible = ringL.material.opacity > 0.01;
    sv(LVoc, ramp(t, A("s4:mengepung"), A("s4:mengepung") + 0.4) * (1 - ramp(t, A("s4:Courthope") - 0.3, A("s4:Courthope"))));
    // labels around Banda
    const bandaLow = 1 - ramp(camB.userData.lD, 2.1, 2.5);
    const s3wide = ramp(t, A("s3:takut") - 0.6, A("s3:takut")) * (1 - ramp(t, A("s3:Kapten") - 0.4, A("s3:Kapten")));
    sv(LRun, bandaLow * ramp(t, A("s2:Run") - 0.2, A("s2:Run")) * (1 - ramp(t, A("s2:tiga") - 0.3, A("s2:tiga"))) + s3wide);
    for (const o of [LAi, LNeira, LApi, LBes]) sv(o, (1 - ramp(camB.userData.lD, 2.3, 2.6)) * ramp(camB.userData.lD, 1.5, 1.75) * (t < K.s6 ? 1 : 0));
    sv(LNai, ramp(camB.userData.lD, 0.95, 1.1) * (1 - ramp(camB.userData.lD, 1.5, 1.7)) * (t > K.s2 + 3 && t < K.s4 ? 1 : 0));
    sv(LBel, s3wide); sv(belPin, s3wide);
    sv(LToday, ramp(t, tLive + 0.3, tLive + 0.8));
    // globe labels (feed B overview and the flight)
    const gl = ramp(lD, 2.7, 3.0);
    const s2over = ramp(t, K.s2 + 0.6, K.s2 + 1.2) * (1 - ramp(t, A("s2:Panjangnya"), A("s2:Panjangnya") + 0.4));
    sv(GL.indo, gl * s2over); sv(GL.maluku, gl * s2over); sv(GL.lautb, gl * s2over); sv(GL.papua, gl * s2over); sv(GL.kepb, gl * s2over);
    const flt = ramp(t, K.s6 + 1, K.s6 + 1.6) * (1 - ramp(t, fly1 - 0.4, fly1));
    sv(GL.pac, flt * ramp(lD, 3.5, 3.8)); sv(GL.amer, flt * ramp(lD, 3.3, 3.6) * ramp(t, fly0 + 2, fly0 + 2.6)); sv(GL.nyreg, ramp(lD, 2.6, 2.9) * ramp(t, fly0 + 2.5, fly0 + 3) * (1 - ramp(t, fly1 + 0.6, fly1 + 1)));
    // arc
    const au = smooth((t - fly0) / (fly1 - fly0));
    arcG.setDrawRange(0, Math.floor(401 * au)); arcL.material.opacity = 0.9 * ramp(t, fly0, fly0 + 0.3) * (1 - ramp(t, fly1, fly1 + 0.8)); arcL.visible = arcL.material.opacity > 0.01;
    // New York
    const tNA = A("s6:Amsterdam"), tNY = A("s6:menamainya");
    sv(naPin, ramp(t, tNA - 0.5, tNA) * (1 - ramp(t, K.s7e, K.s7e + 0.5)));
    naPin.s.material.color.set(t > tNY + 0.3 ? 0x9fd3ff : 0xff7a59);
    sv(LNA, ramp(t, tNA - 0.5, tNA) * (1 - ramp(t, tNY, tNY + 0.4)));
    sv(LNYc, ramp(t, tNY + 0.2, tNY + 0.6) * (1 - ramp(t, K.s7e, K.s7e + 0.5)));
    const nyLow = 1 - ramp(lead === camA ? camA.userData.lD : camB.userData.lD, 2.2, 2.5);
    sv(LMan, nyLow * ramp(t, A("s6:Manhattan") - 0.3, A("s6:Manhattan")) * (1 - ramp(t, A("s8:Manhattan") - 0.4, A("s8:Manhattan"))) + (t < K.s2 ? 0 : 0));
    sv(LHud, nyLow * ramp(t, A("s6:Manhattan"), A("s6:Manhattan") + 0.5) * (1 - ramp(t, K.s7e - 0.5, K.s7e)));
    sv(LToday2, 0);
    const fu = eout((t - A("s6:merebut")) / 2.6);
    fleet.forEach((o, i) => { const a = NAp; o.s.position.set(a[0] + 2 + i * 0.6 - (2.2) * fu, 0.12, -(a[1] - 7 + i * 0.4 + 6.2 * fu)).applyMatrix4(NY.matrix); o.s.material.rotation = -0.3; sv(o, ramp(t, A("s6:Inggris"), A("s6:merebut")) * (1 - ramp(t, A("s6:menamainya"), A("s6:menamainya") + 0.6))); });
    // skyline rises in s8
    const tSky = A("s8:Manhattan");
    BLD.forEach((b, i) => { const g = ramp(t, tSky + b[5] * 1.2, tSky + b[5] * 1.2 + 0.9); dmo.position.set(b[0], 0.03, -b[1]); dmo.rotation.set(0, ang, 0); dmo.scale.set(b[2], Math.max(0.001, b[4] * g), b[3]); dmo.updateMatrix(); bI.setMatrixAt(i, dmo.matrix); });
    bI.instanceMatrix.needsUpdate = true; bI.visible = t > tSky;
    // reticles + AUDIRA tags
    const hook = 1 - ramp(t, K.s2 + 0.4, K.s2 + 1);
    const rB = Math.max(hook, ramp(t, A("s2:Banda") - 0.6, A("s2:Banda")) * (1 - ramp(t, A("s2:tiga") - 0.6, A("s2:tiga"))), ramp(t, tRunW, tRunW + 0.6));
    const rA = Math.max(hook, ramp(t, A("s6:Manhattan") - 0.4, A("s6:Manhattan")) * (1 - ramp(t, A("s7:Breda"), A("s7:Breda") + 0.5)), ramp(t, tRunW, tRunW + 0.6));
    sv(retR, rB * 0.95); sv(retM, rA * 0.95);
    const late = ramp(t, tRunW, tRunW + 0.6);
    const sc = 1 - 0.35 * late;
    retR.s.scale.setScalar(190 * PX * sc); retM.s.scale.setScalar(190 * PX * sc);
    retR.s.material.rotation = t * 0.35; retM.s.material.rotation = -t * 0.35;
    sv(tagR, hook); sv(tagM, Math.max(hook, late));

    // ----- render the feeds -----
    r.setScissorTest(true); r.setClearColor(0x05090d, 1);
    r.setViewport(0, 0, 1080, 1920); r.setScissor(0, 0, 1080, 1920); r.clear();
    view(camA, 0, Math.round(S));
    view(camB, Math.round(S), 1920 - Math.round(S));
    r.setScissorTest(false);

    // ----- DOM HUD -----
    if (seam) { const on = S > 2 && S < 1918; seam.style.opacity = on ? 1 : 0; seam.style.transform = `translateY(${S.toFixed(1)}px)`; seam.classList.toggle("mv", on && Math.abs(S - 960) > 2 && Math.abs(S - 1000) > 2); }
    const lkOn = Math.max(ramp(t, A("s1:ditukar") - 0.2, A("s1:ditukar") + 0.3) * (1 - ramp(t, K.s2 - 0.4, K.s2)), ramp(t, A("s8:Menurut") - 0.3, A("s8:Menurut") + 0.3));
    const both = S > 300 && S < 1700;
    const tagsOn = both && lkOn < 0.05 ? 1 : 0;
    if (fa) { fa.style.opacity = tagsOn; fa.style.top = (S - 44).toFixed(1) + "px"; }
    if (fb) { fb.style.opacity = tagsOn; fb.style.top = (S + 12).toFixed(1) + "px"; }
    if (lk) {
      const ax = camA.userData.sx, ay = camA.userData.sy, bx = camB.userData.sx, by = camB.userData.sy;
      const d = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / d, uy = (by - ay) / d, rr = 110 * sc;
      lk.setAttribute("x1", (ax + ux * rr).toFixed(1)); lk.setAttribute("y1", (ay + uy * rr).toFixed(1)); lk.setAttribute("x2", (bx - ux * rr).toFixed(1)); lk.setAttribute("y2", (by - uy * rr).toFixed(1));
      lk.style.opacity = lkOn; lk.style.strokeDashoffset = (-t * 40).toFixed(1);
      if (badge) { badge.style.opacity = lkOn; badge.style.left = ((ax + bx) / 2).toFixed(1) + "px"; badge.style.top = ((ay + by) / 2).toFixed(1) + "px"; badge.textContent = t > K.s8 ? "DITUKAR 1667 · SIAPA MENANG?" : "DITUKAR?"; }
    }
    if (hudloc) { const tg = lead.userData.tgt; const lat = Math.asin(tg.y / tg.length()) / D2R, lon = Math.atan2(tg.z, -tg.x) / D2R - 180; hudloc.textContent = (lead === camA ? "FEED A · " : "FEED B · ") + llTxt(lat, lon); }
    if (hudalt) { const km = lead.userData.D; hudalt.textContent = "ALT " + (km >= 100 ? fmtN(km, 0) : fmtN(km, 1)) + " KM"; }
    if (mute) mute.style.opacity = (0.42 * muted).toFixed(3);
  };
}
