// ZANZIBAR 1896: one continuous descent from an East Africa naval chart onto Zanzibar harbour, then the bombardment.
// Units: 1 = 10 m. North is -z, the sea is -x, the palace seafront runs along z at x ~ 0. Everything is a function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, std, box, cyl, stage, pts, envStrips } from "./lib3d.js";
import { GEO } from "./geo-ea.js";

const LON0 = 39.1847, LAT0 = -6.16, KX = 11068, KY = 11057;
const AMBER = 0xffbe55, CRIM = 0xd2283a, COLD = 0xe8f1f6, SEA = 0x0b2a33, FOGC = 0x1f383d;
// Monotone cubic over time keys: the scale jumps here span 5 orders of magnitude, so tangents are limited to avoid overshoot.
function track(keys) {
  const n = keys.length, m = keys[0].length;
  const sl = [];
  for (let i = 0; i < n - 1; i++) sl.push(keys[i].map((v, j) => (j ? (keys[i + 1][j] - v) / Math.max(0.001, keys[i + 1][0] - keys[i][0]) : 0)));
  const tan = keys.map((k, i) => k.map((_, j) => { if (!j) return 0; if (i === 0 || i === n - 1) return 0; const a = sl[i - 1][j], b = sl[i][j]; return a * b <= 0 ? 0 : (2 * a * b) / (a + b); }));
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0; while (keys[i + 1][0] < t) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1[0] - k0[0], u = (t - k0[0]) / h, u2 = u * u, u3 = u2 * u;
    const o = []; for (let j = 1; j < m; j++) o.push((2 * u3 - 3 * u2 + 1) * k0[j] + (u3 - 2 * u2 + u) * h * tan[i][j] + (-2 * u3 + 3 * u2) * k1[j] + (u3 - u2) * h * tan[i + 1][j]);
    return o;
  };
}
const PX = (2 * Math.tan((38 / 2) * Math.PI / 180)) / 1920;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: FOGC, fog: 0.001, exp: 1.12, bloom: [0.42, 0.5, 0.84] });
  envStrips(r, scene, [[30, 4, 0xffc080, 1.4, 14, 2, 0], [30, 8, 0x6f9aa8, 0.9, -14, 10, 0], [40, 3, 0xffffff, 0.3, 0, 16, 0]], 0x0a1418);
  const rnd = mulberry(1896);
  const A = (k) => AT[k] ?? K[k];

  // ---------- coast geometry: Unguja is smoothed and shifted so its west coast passes through x = 0 at z = 0 ----------
  const raw = (lon, lat) => [(lon - LON0) * KX, -(lat - LAT0) * KY];
  const chaikin = (pts, n) => { for (let k = 0; k < n; k++) { const o = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; o.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); } pts = o; } return pts; };
  const tz = GEO.find((c) => c.name === "Tanzania");
  const unguja = tz.rings.find((rg) => rg.some((p) => Math.abs(p[0] - 39.3) < 0.3 && Math.abs(p[1] + 6.1) < 0.3));
  const ung = chaikin(unguja.map((p) => raw(p[0], p[1])), 3);
  const coastAt = (z0) => { let best = 1e9; for (let i = 0; i < ung.length; i++) { const a = ung[i], b = ung[(i + 1) % ung.length]; if ((a[1] - z0) * (b[1] - z0) <= 0 && a[1] !== b[1]) { const x = a[0] + (b[0] - a[0]) * (z0 - a[1]) / (b[1] - a[1]); if (Math.abs(x) < 3000 && x < best) best = x; } } return best; };
  const XC = coastAt(0), SLOPE = (coastAt(-120) - coastAt(120)) / -240;
  const P = (lon, lat) => { const p = raw(lon, lat); return [p[0] - XC, p[1]]; };
  const coast = (z) => SLOPE * z;

  // ---------- sky dome + sea ----------
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(0x07161c) }, hor: { value: new THREE.Color(FOGC) }, sun: { value: new THREE.Color(0xffa95a) }, sd: { value: new THREE.Vector3(0.85, 0.12, 0.5).normalize() }, k: { value: 1 } },
    vertexShader: "varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform vec3 top,hor,sun,sd;uniform float k;varying vec3 vD;void main(){float h=vD.y;vec3 c=mix(hor,top,smoothstep(0.,.42,h));float s=max(0.,dot(vD,sd));c+=sun*k*(pow(s,6.)*.55+pow(s,60.)*1.4)*(1.-smoothstep(-.02,.35,h));if(h<0.)c=hor;gl_FragColor=vec4(c,1.);}",
  }));
  dome.frustumCulled = false; dome.renderOrder = -20; scene.add(dome);
  const seaBig = new THREE.Mesh(new THREE.PlaneGeometry(8e6, 8e6), new THREE.MeshBasicMaterial({ color: SEA, depthWrite: false }));
  seaBig.rotation.x = -Math.PI / 2; seaBig.position.y = -0.4; seaBig.renderOrder = -10; scene.add(seaBig);
  const ripT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#7f8f92"; g.fillRect(0, 0, w, h); const q = mulberry(9); for (let i = 0; i < 900; i++) { const v = 110 + q() * 90; g.strokeStyle = `rgba(${v},${v + 10},${v + 12},${0.25 + q() * 0.3})`; g.lineWidth = 1 + q() * 2; const x = q() * w, y = q() * h, l = 10 + q() * 40; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 3, x + l, y); g.stroke(); } }, [140, 140]);
  const alphaT = canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, w * 0.2, w / 2, w / 2, w / 2); gr.addColorStop(0, "#fff"); gr.addColorStop(1, "#000"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const waterM = new THREE.MeshStandardMaterial({ color: 0x1d5864, map: ripT, alphaMap: alphaT, transparent: true, roughness: 0.85, metalness: 0.0 });
  const water = new THREE.Mesh(new THREE.CircleGeometry(1800, 64), waterM);
  water.rotation.x = -Math.PI / 2; water.receiveShadow = true; scene.add(water);

  // ---------- chart: land fills, coast lines, graticule ----------
  const landM = new THREE.MeshBasicMaterial({ color: 0x3a4541, transparent: true, depthWrite: false, depthTest: false });
  const tzM = new THREE.MeshBasicMaterial({ color: 0x3a4541, transparent: true, depthWrite: false, depthTest: false });
  const lineM = new THREE.LineBasicMaterial({ color: 0xd9cda6, transparent: true, opacity: 0.6, depthWrite: false, depthTest: false });
  const gratM = new THREE.LineBasicMaterial({ color: AMBER, transparent: true, opacity: 0.16, depthWrite: false, depthTest: false });
  const chart = new THREE.Group(); scene.add(chart);
  for (const c of GEO) for (const rg of c.rings) {
    if (rg === unguja) continue;
    const pp = rg.map((p) => P(p[0], p[1]));
    const sh = new THREE.Shape(pp.map((p) => new THREE.Vector2(p[0], -p[1])));
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), c.name === "Tanzania" ? tzM : landM);
    m.rotation.x = -Math.PI / 2; m.position.y = 0.2; m.renderOrder = 1; chart.add(m);
    const lg = new THREE.BufferGeometry().setFromPoints(pp.map((p) => new THREE.Vector3(p[0], 1.3, p[1])));
    const l = new THREE.LineLoop(lg, lineM); l.renderOrder = 3; chart.add(l);
  }
  for (let lon = 26; lon <= 54; lon += 2) { const a = P(lon, 8), b = P(lon, -18); const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(a[0], 1.5, a[1]), new THREE.Vector3(b[0], 1.5, b[1])]), gratM); l.renderOrder = 2; chart.add(l); }
  for (let lat = -18; lat <= 8; lat += 2) { const a = P(26, lat), b = P(54, lat); const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(a[0], 1.5, a[1]), new THREE.Vector3(b[0], 1.5, b[1])]), gratM); l.renderOrder = 2; chart.add(l); }

  // Unguja itself is solid ground the palace stands on, so the coast matches from 700 km up down to the seawall.
  const islandM = std(0x5d625a, 0.95, 0);
  const ish = new THREE.Shape(ung.map((p) => new THREE.Vector2(p[0] - XC, -p[1])));
  const island = new THREE.Mesh(new THREE.ExtrudeGeometry(ish, { depth: 1, bevelEnabled: false, curveSegments: 1 }), islandM);
  island.rotation.x = -Math.PI / 2; island.receiveShadow = true; scene.add(island);
  const islLineM = new THREE.LineBasicMaterial({ color: COLD, transparent: true, opacity: 0, depthWrite: false });
  const islLine = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ung.map((p) => new THREE.Vector3(p[0] - XC, 1.6, p[1]))), islLineM); islLine.renderOrder = 4; scene.add(islLine);

  // ---------- screen-sized labels (canvas sprites). Repainted once the web fonts are ready. ----------
  const paints = [];
  function label(text, { size = 30, family = '"IBM Plex Mono"', weight = 600, color = "#FFBE55", bg = null, anchor = [0, 0.5] } = {}) {
    const c = document.createElement("canvas"), g = c.getContext("2d");
    const font = `${weight} ${size}px ${family}`;
    g.font = font; const w = Math.ceil(g.measureText(text).width * 1.18) + 28, h = Math.ceil(size * 1.5);
    c.width = w; c.height = h;
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({ map: tex, sizeAttenuation: false, depthTest: false, depthWrite: false, transparent: true, fog: false, opacity: 0 });
    const s = new THREE.Sprite(mat); s.renderOrder = 60; s.center.set(anchor[0], anchor[1]);
    const paint = () => { g.clearRect(0, 0, w, h); g.font = font; g.textBaseline = "middle"; const tw = g.measureText(text).width; if (bg) { g.fillStyle = bg; g.fillRect(0, 2, tw + 24, h - 4); } g.lineJoin = "round"; if (!bg) { g.lineWidth = 6; g.strokeStyle = "rgba(4,14,18,.9)"; g.strokeText(text, 12, h / 2); } g.fillStyle = color; g.fillText(text, 12, h / 2); tex.needsUpdate = true; };
    paint(); paints.push(paint); s.scale.set(w * PX, h * PX, 1); scene.add(s); return s;
  }
  let fontsOK = false;
  try { document.fonts.load('700 40px Oswald'); document.fonts.load('600 30px "IBM Plex Mono"'); } catch (e) { }
  const at3 = (s, x, y, z) => { s.position.set(x, y, z); return s; };
  const L = {
    africa: at3(label("AFRIKA TIMUR", { size: 50, family: "Oswald", weight: 700, color: "#C9D4D6", anchor: [0.5, 0.5] }), ...[P(34.2, -10.2)].map((p) => [p[0], 2, p[1]])[0]),
    tanz: at3(label("TANZANIA", { size: 40, family: "Oswald", weight: 700, color: "#C9D4D6", anchor: [0.5, 0.5] }), ...[P(35.4, -5.6)].map((p) => [p[0], 2, p[1]])[0]),
    kenya: at3(label("KENYA", { size: 30, family: "Oswald", weight: 700, color: "#B9C4C4", anchor: [0.5, 0.5] }), ...[P(37.9, 0.4)].map((p) => [p[0], 2, p[1]])[0]),
    ocean: at3(label("SAMUDRA HINDIA", { size: 30, color: "#9FC6CC", anchor: [0.5, 0.5] }), ...[P(44.5, -6.5)].map((p) => [p[0], 2, p[1]])[0]),
    zanz: at3(label("ZANZIBAR", { size: 40, family: "Oswald", weight: 700, color: "#FFBE55" }), ...[P(39.75, -6.0)].map((p) => [p[0], 2, p[1]])[0]),
    unguja: at3(label("PULAU UNGUJA", { size: 28, color: "#FFBE55", anchor: [1, 0.5] }), ...[P(39.13, -6.33)].map((p) => [p[0], 2, p[1]])[0]),
    deoa: at3(label("AFRIKA TIMUR JERMAN", { size: 32, family: "Oswald", weight: 700, color: "#C9D4D6", anchor: [0, 0.5] }), ...[P(38.85, -6.8)].map((p) => [p[0], 2, p[1]])[0]),
    cons: at3(label("KONSULAT JERMAN", { size: 26, color: "#FFBE55" }), 30, 4, -14),
    khalid: label("◆ KHALID", { size: 26, color: "#FF6070" }),
    palace: at3(label("KOMPLEKS ISTANA", { size: 28, color: "#FFBE55", anchor: [0.5, 0] }), 7, 8.2, 0),
  };
  const shipNames = ["HMS ST GEORGE", "HMS PHILOMEL", "HMS RACOON", "HMS THRUSH", "HMS SPARROW"];

  // ---------- reticle + radar sweep (screen-constant, depth-test off) ----------
  const ret = new THREE.Group(); scene.add(ret);
  const retM = new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, depthTest: false, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.94, 1, 64), retM); ring.rotation.x = -Math.PI / 2; ring.renderOrder = 55; ret.add(ring);
  const ring2 = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.45, 48), retM); ring2.rotation.x = -Math.PI / 2; ring2.renderOrder = 55; ret.add(ring2);
  for (let i = 0; i < 4; i++) { const tk = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.34), retM); tk.rotation.x = -Math.PI / 2; tk.rotation.z = i * Math.PI / 2; tk.position.set(Math.sin(i * Math.PI / 2) * 1.12, 0, Math.cos(i * Math.PI / 2) * 1.12); tk.renderOrder = 55; ret.add(tk); }
  const sweepT = canvasTex(256, 256, (g, w) => { for (let i = 0; i < 90; i++) { const a0 = -i * 0.012; g.fillStyle = `rgba(255,190,85,${0.32 * (1 - i / 90)})`; g.beginPath(); g.moveTo(w / 2, w / 2); g.arc(w / 2, w / 2, w / 2, a0 - 0.013, a0); g.closePath(); g.fill(); } });
  const sweep = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: sweepT, transparent: true, depthTest: false, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  sweep.rotation.x = -Math.PI / 2; sweep.renderOrder = 54; ret.add(sweep);
  const pulseM = new THREE.MeshBasicMaterial({ color: CRIM, transparent: true, depthTest: false, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const pulses = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48), pulseM.clone()); m.rotation.x = -Math.PI / 2; m.renderOrder = 53; scene.add(m); return m; });

  // escape route: palace, consulate, then by sea to the German mainland
  const dar = P(39.29, -6.82);
  const route = []; const rp = [[2, 0], [30, -14], [-40, 10], [-900, 900], [dar[0] - 2500, dar[1] - 2600], [dar[0] - 300, dar[1] - 200]];
  const rc = new THREE.CatmullRomCurve3(rp.map((p) => new THREE.Vector3(p[0], 3, p[1])), false, "centripetal");
  for (let i = 0; i <= 300; i++) route.push(rc.getPoint(i / 300));
  const routeG = new THREE.BufferGeometry().setFromPoints(route);
  const routeL = new THREE.Line(routeG, new THREE.LineDashedMaterial({ color: AMBER, dashSize: 260, gapSize: 160, transparent: true, depthTest: false, fog: false }));
  routeL.computeLineDistances(); routeL.renderOrder = 56; scene.add(routeL);

  // ---------- harbour: lights ----------
  const hemi = new THREE.HemisphereLight(0x7fa6b0, 0x2a1d12, 1.25); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffb36b, 2.6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; scene.add(sun, sun.target);

  // ---------- Stone Town: whitewashed blocks inland of the palace ----------
  const houseM = std(0xb9b3a3, 0.9, 0);
  const houses = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), houseM, 520);
  const dm = new THREE.Object3D(); let hn = 0;
  for (let i = 0; i < 4000 && hn < 520; i++) {
    const z = -90 + rnd() * 180, x = coast(z) + 12 + Math.pow(rnd(), 0.8) * 120;
    if (Math.abs(z) < 12 && x < coast(z) + 16) continue;
    const s = 1.4 + rnd() * 2.2, h = 0.7 + rnd() * 1.4;
    dm.position.set(x, 1 + h / 2, z); dm.scale.set(s, h, s * (0.8 + rnd() * 0.6)); dm.rotation.set(0, (rnd() - 0.5) * 0.3, 0); dm.updateMatrix();
    houses.setMatrixAt(hn++, dm.matrix);
  }
  houses.count = hn; houses.castShadow = houses.receiveShadow = true; scene.add(houses);
  const seawall = box(1.0, 1.2, 220, std(0x7a7365, 0.9), 0, 0.45, 0, scene); seawall.rotation.y = Math.atan(SLOPE);
  // palms along the front
  const palmM = std(0x3d4a2c, 0.9), trunkM = std(0x5a4a38, 0.9);
  for (let i = 0; i < 16; i++) { const z = -26 + i * 3.6 + (rnd() - 0.5), x = coast(z) + 1.0 + rnd() * 0.6; if (Math.abs(z) < 11) continue; const tr = cyl(0.06, 0.09, 2.2, 6, trunkM, x, 2.1, z, scene); tr.rotation.z = (rnd() - 0.5) * 0.3; for (let k = 0; k < 6; k++) { const f = box(1.4, 0.04, 0.32, palmM, x + Math.cos(k) * 0.6, 3.2, z + Math.sin(k) * 0.6, scene); f.rotation.set(0, -k, -0.35); } }

  // ---------- palace complex: three adjoining buildings, mostly wood ----------
  const woodM = std(0x4a3a2a, 0.85, 0);
  const roofM = std(0x6a6a64, 0.7, 0.3);
  const halls = [];
  function hall(z, w, d, h, floors, roof, wallHex) {
    const g = new THREE.Group(); g.position.set(coast(z) + 3.6 + w / 2, 1, z); scene.add(g);
    const wallM = std(wallHex, 0.88, 0, { emissive: new THREE.Color(0xff5a1a), emissiveIntensity: 0 });
    box(w, h, d, wallM, 0, h / 2, 0, g);
    const colG = new THREE.CylinderGeometry(0.05, 0.05, 1, 6);
    const per = []; const st = 0.62;
    for (let x = -w / 2 - 0.3; x <= w / 2 + 0.31; x += st) per.push([x, -d / 2 - 0.3], [x, d / 2 + 0.3]);
    for (let zz = -d / 2 - 0.3 + st; zz < d / 2 + 0.3; zz += st) per.push([-w / 2 - 0.3, zz], [w / 2 + 0.3, zz]);
    const fh = h / floors;
    const cols = new THREE.InstancedMesh(colG, woodM, per.length * floors); let ci = 0;
    for (let f = 0; f < floors; f++) {
      box(w + 0.75, 0.09, d + 0.75, woodM, 0, (f + 1) * fh - 0.045, 0, g);
      box(w + 0.7, 0.16, 0.04, woodM, 0, f * fh + 0.45, -d / 2 - 0.36, g); box(w + 0.7, 0.16, 0.04, woodM, 0, f * fh + 0.45, d / 2 + 0.36, g);
      box(0.04, 0.16, d + 0.7, woodM, -w / 2 - 0.36, f * fh + 0.45, 0, g);
      for (const [x, zz] of per) { dm.position.set(x, f * fh + fh / 2, zz); dm.scale.set(1, fh, 1); dm.rotation.set(0, 0, 0); dm.updateMatrix(); cols.setMatrixAt(ci++, dm.matrix); }
    }
    cols.castShadow = true; g.add(cols);
    // window rows on the sea face
    const winM = new THREE.MeshStandardMaterial({ color: 0x1a1612, emissive: new THREE.Color(0xff8a3a), emissiveIntensity: 0 });
    for (let f = 0; f < floors; f++) for (let k = 0; k < Math.floor(d / 0.9); k++) { const wi = box(0.03, fh * 0.45, 0.4, winM, -w / 2 - 0.02, f * fh + fh * 0.5, -d / 2 + 0.6 + k * 0.9, g); wi.castShadow = false; }
    if (roof === "hip") { const rf = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.3, 1.0, 4), roofM); rf.rotation.y = Math.PI / 4; rf.scale.set(w / d, 1, 1); rf.position.y = h + 0.5; rf.castShadow = true; g.add(rf); }
    else { box(w + 0.2, 0.3, d + 0.2, roofM, 0, h + 0.15, 0, g); }
    const o = { g, wallM, winM, w, d, h }; halls.push(o); return o;
  }
  const HOW = hall(0, 4.6, 5.8, 2.8, 3, "flat", 0xd3cab4);
  const PAL = hall(-7.2, 4.2, 5.2, 2.1, 2, "flat", 0xc8bfa8);
  const HAR = hall(7.0, 4.0, 4.6, 1.8, 2, "hip", 0xcfc4ab);
  // House of Wonders clock tower, sea-facing
  const tower = new THREE.Group(); tower.position.set(-HOW.w / 2 + 0.7, HOW.h, 0); HOW.g.add(tower);
  box(1.15, 1.9, 1.15, HOW.wallM, 0, 0.95, 0, tower);
  for (const y of [0.6, 1.3]) box(1.35, 0.07, 1.35, woodM, 0, y, 0, tower);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.9, 4), roofM); cap.rotation.y = Math.PI / 4; cap.position.y = 2.35; tower.add(cap);
  const faceM = new THREE.MeshStandardMaterial({ color: 0xf2ead6, emissive: 0xffe0a0, emissiveIntensity: 0.25 });
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.36, 24), faceM); face.rotation.y = -Math.PI / 2; face.position.set(-0.59, 1.5, 0); tower.add(face);
  const handM = new THREE.MeshBasicMaterial({ color: 0x14100c });
  const hh = box(0.02, 0.22, 0.04, handM, -0.6, 1.5 + 0.08, 0, tower); hh.castShadow = false;
  const mh = box(0.02, 0.04, 0.3, handM, -0.61, 1.5, 0.12, tower); mh.castShadow = false;
  // walkways tying the three together
  box(0.6, 0.12, 2.2, woodM, coast(-3.6) + 5.2, 2.6, -3.6, scene); box(0.6, 0.12, 2.0, woodM, coast(3.6) + 5.2, 2.3, 3.6, scene);
  // flagstaff on the palace, sea side
  const staffBase = new THREE.Vector3(PAL.g.position.x - PAL.w / 2 + 0.6, 1 + PAL.h + 0.3, PAL.g.position.z);
  const staffLow = cyl(0.045, 0.06, 1.3, 8, std(0xd8d2c4, 0.6), staffBase.x, staffBase.y + 0.65, staffBase.z, scene);
  const staffPiv = new THREE.Group(); staffPiv.position.set(staffBase.x, staffBase.y + 1.3, staffBase.z); scene.add(staffPiv);
  cyl(0.035, 0.045, 1.4, 8, std(0xd8d2c4, 0.6), 0, 0.7, 0, staffPiv);
  const flagGeo = new THREE.PlaneGeometry(1.25, 0.8, 12, 6); flagGeo.translate(0.625, 0, 0);
  const flagM = new THREE.MeshStandardMaterial({ color: CRIM, side: THREE.DoubleSide, roughness: 0.8, emissive: 0x3a0508, emissiveIntensity: 0.4 });
  const flag = new THREE.Mesh(flagGeo, flagM); flag.castShadow = true; staffPiv.add(flag);
  const flagBase = flagGeo.attributes.position.array.slice();

  // defenders on the seafront: dots of people for scale, sultan side
  const defM = std(0x8a2a30, 0.9);
  const defs = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.06, 0.2, 5), defM, 460);
  const defP = [];
  for (let i = 0; i < 460; i++) { const z = -13 + rnd() * 26, x = coast(z) + 0.7 + rnd() * 2.6; defP.push([x, 1.1, z, rnd()]); }
  scene.add(defs); defs.castShadow = true;

  // ---------- ships ----------
  function hullGeo(Lh, B, H) {
    const s = new THREE.Shape(); s.moveTo(-Lh / 2, -B * 0.36); s.quadraticCurveTo(-Lh / 2 - B * 0.18, 0, -Lh / 2, B * 0.36); s.lineTo(Lh * 0.16, B / 2); s.quadraticCurveTo(Lh * 0.42, B * 0.44, Lh / 2, 0); s.quadraticCurveTo(Lh * 0.42, -B * 0.44, Lh * 0.16, -B / 2); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: H, bevelEnabled: false, curveSegments: 8 }); g.rotateX(-Math.PI / 2); return g;
  }
  const deckM = std(0x8b7a60, 0.85), bootM = std(0x22272c, 0.6, 0.3), mastM = std(0x3a3128, 0.8), funM = std(0xc9b27c, 0.6, 0.2), gunM = std(0x2e3236, 0.4, 0.8);
  function ship({ Lh, B, H, hullHex, band, funnels, masts, x, z, yaw = Math.PI / 2 }) {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = yaw; scene.add(G);
    const R = new THREE.Group(); G.add(R);
    const hullM = std(hullHex, 0.55, 0.2);
    const hull = new THREE.Mesh(hullGeo(Lh, B, H), [deckM, hullM]); hull.position.y = -H * 0.45; hull.castShadow = hull.receiveShadow = true; R.add(hull);
    const boot = new THREE.Mesh(hullGeo(Lh * 1.012, B * 1.04, 0.14), bootM); boot.position.y = -0.04; R.add(boot);
    if (band) { const bd = new THREE.Mesh(hullGeo(Lh * 1.006, B * 1.02, 0.08), std(band, 0.5)); bd.position.y = H * 0.36; R.add(bd); }
    const top = H * 0.55;
    box(Lh * 0.34, 0.42, B * 0.56, std(hullHex, 0.6, 0.1), -Lh * 0.02, top + 0.21, 0, R);
    box(Lh * 0.1, 0.32, B * 0.7, std(0xdfe6ea, 0.6), Lh * 0.17, top + 0.55, 0, R);
    funnels.forEach((fx) => cyl(B * 0.13, B * 0.15, 1.1, 10, funM, fx * Lh, top + 0.95, 0, R));
    masts.forEach((mx) => { cyl(0.04, 0.06, 3.2, 6, mastM, mx * Lh, top + 1.6, 0, R); box(0.05, 0.05, B * 1.1, mastM, mx * Lh, top + 2.5, 0, R); });
    const muzzles = [];
    for (const gx of [-0.3, 0.05, 0.3]) { const gun = cyl(0.06, 0.07, 0.8, 8, gunM, gx * Lh, top + 0.14, B * 0.5, R); gun.rotation.x = Math.PI / 2; muzzles.push(new THREE.Vector3(gx * Lh, top + 0.14, B * 0.5 + 0.45)); }
    return { G, R, muzzles, top };
  }
  const shipDefs = [
    { Lh: 11, B: 1.8, H: 1.4, hullHex: 0xc9d1d6, band: 0x2b3238, funnels: [-0.08, 0.06], masts: [0.3, -0.3], x: -40, z: 2 },
    { Lh: 8.5, B: 1.4, H: 1.15, hullHex: 0xc2cbd1, band: 0x2b3238, funnels: [0.02], masts: [0.3, -0.28], x: -35, z: -15 },
    { Lh: 7.2, B: 1.15, H: 1.0, hullHex: 0xbdc6cc, band: 0x2b3238, funnels: [0.0], masts: [0.3, -0.25], x: -30, z: -32 },
    { Lh: 5.4, B: 0.95, H: 0.85, hullHex: 0xc5ced3, band: 0x2b3238, funnels: [0.02], masts: [0.28, -0.25], x: -26, z: 22 },
    { Lh: 5.4, B: 0.95, H: 0.85, hullHex: 0xc5ced3, band: 0x2b3238, funnels: [0.02], masts: [0.28, -0.25], x: -20, z: -14 },
  ];
  const ships = shipDefs.map((d) => ship(d));
  const glas = ship({ Lh: 6.4, B: 1.0, H: 0.8, hullHex: 0xf0ede4, band: CRIM, funnels: [0.04], masts: [0.3, -0.3], x: -10, z: -1.5 });
  const gflag = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.38), flagM); gflag.position.set(-0.3 * 6.4, glas.top + 2.85, 0.32); glas.R.add(gflag);
  scene.updateMatrixWorld(true);
  const muzW = ships.map((s) => s.muzzles.map((m) => s.G.localToWorld(m.clone())));
  const shipLab = ships.map((s, i) => at3(label(shipNames[i], { size: 24, color: "#E8F1F6", anchor: [0.5, 0] }), s.G.position.x, 4.4, s.G.position.z));
  const glasLab = at3(label("HHS GLASGOW", { size: 26, color: "#FF6070", anchor: [0.5, 0] }), glas.G.position.x, 3.9, glas.G.position.z);
  const defLab = at3(label("± 2.800 PENJAGA", { size: 24, color: "#FF6070", anchor: [0.5, 1] }), coast(-11) + 2, 1.6, -11);

  // ---------- shot targets and particles ----------
  const tgBase = (tg, sd) => {
    const q = mulberry(sd + 11); const j = () => (q() - 0.5);
    if (tg === 0) return [HOW.g.position.x - 1.5 + j() * 2, 1 + HOW.h * (0.3 + q() * 0.6), j() * 5];
    if (tg === 1) return [PAL.g.position.x - 1 + j() * 2, 1 + PAL.h * (0.3 + q() * 0.6), PAL.g.position.z + j() * 4];
    if (tg === 2) return [HAR.g.position.x - 1 + j() * 2, 1 + HAR.h * (0.3 + q() * 0.6), HAR.g.position.z + j() * 3.6];
    if (tg === 3) return [glas.G.position.x + j() * 0.8, 0.9, glas.G.position.z + j() * 4];
    if (tg === 4) return [staffBase.x, staffBase.y + 1.3, staffBase.z];
    const z = j() * 22; return [coast(z) + 1.5, 1.2, z];
  };
  const SH = (K.shots || []).map(([ts, si, tg, sd]) => ({ ts, si, tg, sd, m: muzW[si][sd % 3], p: tgBase(tg, sd) }));
  const flash = pts(scene, 60, { color: 0xffd896, size: 1.5 });
  const trc = pts(scene, 240, { color: 0xffe9b8, size: 0.45 });
  const boom = pts(scene, 640, { color: 0xff8a3a, size: 1.2 });
  const gsm = pts(scene, 420, { color: 0xaab2b4, size: 3.4, add: false, opacity: 0.32 });
  const fire = pts(scene, 1000, { color: 0xff7a28, size: 0.95 });
  const smk = pts(scene, 700, { color: 0x2c2a28, size: 7, add: false, opacity: 0.42 });
  const seeds = []; for (let i = 0; i < 1200; i++) seeds.push([rnd(), rnd(), rnd(), rnd(), rnd()]);
  const impL = new THREE.PointLight(0xff8a3a, 0, 40, 1.6); scene.add(impL);
  const muzL = new THREE.PointLight(0xffd090, 0, 60, 1.6); scene.add(muzL);
  const fireL1 = new THREE.PointLight(0xff6a20, 0, 40, 1.5); fireL1.position.set(PAL.g.position.x - 2, 4, PAL.g.position.z); scene.add(fireL1);
  const fireL2 = new THREE.PointLight(0xff6a20, 0, 40, 1.5); fireL2.position.set(HAR.g.position.x - 2, 3.6, HAR.g.position.z + 1); scene.add(fireL2);

  // ---------- camera: [t, target x, target z, log10 distance, pitch deg, yaw deg, target y] ----------
  const p1 = P(37.6, -4.6), p2 = P(38.3, -5.6), p3 = P(38.7, -6.2), p4 = P(39.3, -6.12), p5 = P(39.25, -6.13), pR = P(39.2, -6.62), pS = P(39.22, -6.6);
  const camT = track([
    [0, p1[0], p1[1], 5.95, 74, 0, 0],
    [K.s1e, p2[0] * 0.6 + p1[0] * 0.4, p2[1] * 0.6 + p1[1] * 0.4, 5.82, 72, 0, 0],
    [A("s2:Zanzibar"), p2[0], p2[1], 5.62, 70, 0, 0],
    [A("s2:Tanzania"), p3[0], p3[1], 5.25, 66, -4, 0],
    [A("s2:1890"), p4[0], p4[1], 4.62, 62, -8, 0],
    [K.s2e, p5[0], p5[1], 4.35, 58, -16, 0],
    [A("s3:1896"), 0, 0, 3.55, 50, -34, 0],
    [A("s3:Sultan"), 2, 0, 2.62, 38, -52, 1],
    [A("s3:Khalid"), 6, 0, 1.92, 18, -66, 2.2],
    [A("s3:masuk") + 0.6, 4, -5.5, 1.58, 11, -76, 4],
    [A("s4:2.800"), 3, -2, 1.9, 24, -100, 1.6],
    [A("s4:pelabuhan"), -14, -2, 2.13, 25, -128, 0.6],
    [A("s4:membidik"), -16, 0, 2.12, 22, -136, 0.6],
    [A("s4:Ultimatumnya"), 4, 0, 1.92, 9, -96, 2],
    [A("s4:sembilan"), 4, 0, 1.84, 7.5, -90, 2],
    [A("s5:dua"), 2, 1, 1.86, 10, -86, 2],
    [A("s5:menembak"), -2, 2, 1.85, 14, -70, 1.6],
    [A("s5:Istana"), 6, -1, 1.64, 14, -64, 2.4],
    [A("s5:terbakar"), 6, 0, 1.62, 17, -54, 2.4],
    [A("s5:Kapal"), -8, -1.5, 1.66, 22, -38, 0.8],
    [A("s5:ditenggelamkan"), -9, -1.5, 1.62, 21, -30, 0.4],
    [A("s6:Bendera") + 0.3, -2, -4.5, 1.62, 10, -60, 2.4],
    [A("s6:jatuh") + 0.7, staffBase.x, staffBase.z + 1, 1.52, 10, -80, staffBase.y - 0.2],
    [A("s6:berhenti") + 0.5, 0, 0, 2.0, 22, -100, 1.5],
    [A("s6:38"), -6, 0, 2.14, 28, -110, 1],
    [A("s6:Korban"), -8, 0, 2.2, 30, -118, 1],
    [K.s6e, -8, 3, 2.2, 32, -104, 1],
    [A("s7:konsulat"), 16, -7, 2.0, 40, -84, 1],
    [A("s7:daratan"), 14, -10, 3.2, 55, -60, 0],
    [A("s7:daratan") + 0.9, pR[0], pR[1], 4.52, 60, -30, 0],
    [A("s7:mengangkat"), pS[0], pS[1], 4.5, 64, -16, 0],
    [K.s7e, pS[0], pS[1], 4.42, 62, -10, 0],
    [A("s8:lelucon"), 0, 0, 2.7, 42, -60, 0],
    [A("s8:timpangnya"), -10, 0, 2.2, 26, -96, 1],
    [K.end, -8, 0, 2.28, 30, -102, 1],
    [K.dur, -8, 0, 2.33, 32, -104, 1],
  ]);

  const hudAlt = document.getElementById("hudalt");
  const fmtN = (v, d) => v.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });
  const tFire = A("s5:meriam"), tBurn = A("s5:Istana"), tBurnt = A("s5:terbakar"), tGl = A("s5:ditenggelamkan"), tFall = A("s6:jatuh"), tCease = A("s6:berhenti");
  const tFlagUp = A("s3:masuk"), tLima = A("s4:lima");
  const V = new THREE.Vector3();

  return (t) => {
    if (!fontsOK) { try { if (document.fonts.check('700 40px Oswald') && document.fonts.check('600 30px "IBM Plex Mono"')) { paints.forEach((f) => f()); fontsOK = true; } } catch (e) { fontsOK = true; } }
    // camera
    const c = camT(t);
    const D = Math.pow(10, c[2]), pit = c[3] * Math.PI / 180, yaw = c[4] * Math.PI / 180;
    let shake = 0;
    for (const s of SH) { const dt = t - s.ts; if (dt > 0 && dt < 1.2) shake += 0.5 * Math.exp(-dt * 7); const di = dt - 0.5; if (di > 0 && di < 1.2) shake += 0.35 * Math.exp(-di * 6); }
    shake *= D * 0.004;
    const tx = c[0] + Math.sin(t * 0.21) * D * 0.012, tzz = c[1] + Math.cos(t * 0.17) * D * 0.012;
    cam.position.set(tx + Math.sin(yaw) * Math.cos(pit) * D + Math.sin(t * 43) * shake, c[5] + Math.sin(pit) * D + Math.sin(t * 57) * shake, tzz + Math.cos(yaw) * Math.cos(pit) * D);
    cam.near = Math.max(0.05, D * 0.02); cam.far = D * 70; cam.updateProjectionMatrix();
    cam.lookAt(tx, c[5], tzz);
    scene.fog.density = 0.04 / D;
    dome.position.copy(cam.position); dome.scale.setScalar(cam.far * 0.8);
    const lD = Math.log10(D);
    const harb = 1 - ramp(lD, 2.6, 3.4); // 1 when we are down at the harbour

    // chart layers fade as we approach the water, and come back for the escape map
    lineM.opacity = 0.6 * ramp(lD, 2.9, 3.6);
    gratM.opacity = 0.16 * ramp(lD, 3.6, 4.4);
    landM.opacity = tzM.opacity = ramp(lD, 2.4, 3.2);
    const tzHi = ramp(t, A("s2:Tanzania") - 0.2, A("s2:Tanzania") + 0.6) * (1 - ramp(t, A("s2:1890"), A("s2:1890") + 1.5));
    tzM.color.setHex(0x3a4541).lerp(new THREE.Color(0x7a6a3c), tzHi);
    waterM.opacity = harb; water.visible = harb > 0.01; chart.visible = landM.opacity > 0.01 || lineM.opacity > 0.01;
    ripT.offset.set(t * 0.004, t * 0.0025);
    // island tint: sultanate, then outlined cold white under the protectorate, then grey when it stops being sovereign
    const prot = ramp(t, A("s2:protektorat") - 0.2, A("s2:protektorat") + 0.6);
    const lost = ramp(t, A("s7:mengangkat"), A("s7:berdaulat") + 0.5);
    islandM.color.setHex(0x5d625a).lerp(new THREE.Color(0x7a3a3c), 0.55 * (1 - harb) * (1 - lost)).lerp(new THREE.Color(0x6c747a), lost * (1 - harb));
    islLineM.opacity = (0.35 + 0.65 * prot) * (1 - harb) * (t > K.s2 - 0.5 ? 1 : 0.4);

    // labels
    const lab = (s, o) => { s.material.opacity = clamp01(o); s.visible = o > 0.01; };
    const mapV = ramp(lD, 4.6, 5.0);
    lab(L.africa, mapV * (1 - ramp(t, A("s2:1890") - 0.5, A("s2:1890"))));
    lab(L.tanz, mapV * ramp(t, A("s2:Tanzania") - 0.3, A("s2:Tanzania")));
    lab(L.kenya, mapV * 0.8);
    lab(L.ocean, ramp(lD, 4.3, 4.8) * 0.9);
    lab(L.zanz, ramp(lD, 4.5, 4.8) * ramp(t, A("s2:Zanzibar") - 0.3, A("s2:Zanzibar") + 0.1));
    lab(L.unguja, ramp(lD, 3.7, 4.0) * (1 - ramp(lD, 4.6, 4.9)) * (t < K.s3 ? 1 : 0));
    lab(L.deoa, ramp(t, A("s7:daratan") - 0.4, A("s7:daratan") + 0.2) * (1 - ramp(t, K.s8, K.s8 + 0.8)));
    lab(L.cons, ramp(t, K.s7 - 0.2, K.s7 + 0.3) * (1 - ramp(lD, 3.3, 3.7)) * (t < K.s8 ? 1 : 0));
    lab(L.palace, ramp(t, A("s3:Khalid") - 0.2, A("s3:Khalid") + 0.2) * (1 - ramp(t, tLima - 0.6, tLima)));
    shipLab.forEach((s, i) => lab(s, ramp(t, tLima + i * 0.16, tLima + i * 0.16 + 0.25) * (1 - ramp(t, tFire - 0.6, tFire - 0.2))));
    lab(glasLab, ramp(t, tLima + 0.9, tLima + 1.2) * (1 - ramp(t, A("s4:Ultimatumnya") - 0.3, A("s4:Ultimatumnya"))) + ramp(t, A("s5:Kapal") - 0.2, A("s5:Kapal") + 0.2) * (1 - ramp(t, tGl + 1.5, tGl + 2.2)));
    lab(defLab, ramp(t, A("s4:2.800") - 0.1, A("s4:2.800") + 0.3) * (1 - ramp(t, tLima - 0.4, tLima)));

    // reticle sits on Zanzibar on the chart, then on the palace while we descend
    const retOn = (t < K.s3 + 2.5 ? 1 : 0) * (1 - ramp(lD, 2.6, 3.0)) + ramp(t, A("s7:konsulat"), A("s7:daratan")) * (1 - ramp(t, K.s7e, K.s7e + 0.6)) * ramp(lD, 3.2, 3.6);
    retM.opacity = 0.85 * clamp01(retOn); sweep.material.opacity = clamp01(retOn);
    ret.visible = retOn > 0.01;
    const zc = P(39.33, -6.13);
    const toTown = ramp(t, A("s2:1890") + 1.5, K.s2e);
    ret.position.set(zc[0] * (1 - toTown), 3, zc[1] * (1 - toTown));
    ret.scale.setScalar(D * (t > K.s7 ? 0.04 : 0.085) * (1 + 0.05 * Math.sin(t * 5)));
    sweep.rotation.z = -t * 2.4;
    pulses.forEach((m, i) => { const ph = (t * 0.6 + i / 3) % 1; m.position.set(zc[0] * (1 - toTown), 2, zc[1] * (1 - toTown)); m.scale.setScalar(D * (0.02 + 0.11 * ph)); m.material.opacity = (1 - ph) * 0.8 * (t < K.s2 + 1 ? 1 : 0) * ramp(lD, 4.5, 5); m.visible = m.material.opacity > 0.01; });
    // escape route draws itself
    const rU = 0.2 * ramp(t, K.s7, A("s7:konsulat")) + 0.8 * ramp(t, A("s7:konsulat"), A("s7:daratan") + 1.4);
    routeG.setDrawRange(0, Math.floor(301 * rU)); routeL.visible = rU > 0 && t < K.s8 + 0.6; routeL.material.opacity = 1 - ramp(t, K.s8, K.s8 + 0.6);
    routeL.material.dashSize = D * 0.012; { const hp = route[Math.min(300, Math.floor(300 * rU))]; L.khalid.position.copy(hp); lab(L.khalid, (rU > 0.02 ? 1 : 0) * (1 - ramp(t, K.s7e - 0.4, K.s7e))); } routeL.material.gapSize = D * 0.008;

    // light follows the harbour; dawn sun low in the east
    sun.position.set(70, 34, 45); sun.target.position.set(0, 0, 0);
    const sc = sun.shadow.camera; sc.left = sc.bottom = -60; sc.right = sc.top = 60; sc.near = 1; sc.far = 200; sc.updateProjectionMatrix();
    const smog = ramp(t, tBurn, tCease + 4);
    sun.intensity = 2.6 - 0.9 * smog; hemi.intensity = 1.25 - 0.3 * smog;
    dome.material.uniforms.k.value = 1 - 0.45 * smog;

    // flag: raised by Khalid's men, shot away on the word
    const up = ramp(t, tFlagUp - 0.3, tFlagUp + 1.4);
    flag.position.y = -1.25 + 1.2 * up; flag.visible = up > 0.02;
    const fall = clamp01((t - tFall + 0.15) / 0.9);
    staffPiv.rotation.z = -1.7 * fall * fall;
    staffPiv.position.y = staffBase.y + 1.3 - 1.0 * fall * fall;
    const fp = flagGeo.attributes.position;
    for (let i = 0; i < fp.count; i++) { const x = flagBase[i * 3]; fp.array[i * 3 + 2] = Math.sin(t * 5.5 - x * 4) * 0.09 * x + Math.sin(t * 3.1 + flagBase[i * 3 + 1] * 3) * 0.03 * x; fp.array[i * 3 + 1] = flagBase[i * 3 + 1] - x * x * 0.04 * (1 + fall * 2); }
    fp.needsUpdate = true;

    // defenders: visible until the shelling sends them inland
    const scat = ramp(t, tFire, tFire + 3);
    defP.forEach((d, i) => { const g = scat > d[3] ? 0 : 1; dm.position.set(d[0] + 6 * scat, d[1], d[2] + Math.sin(i) * scat); dm.scale.setScalar(g); dm.rotation.set(0, 0, 0); dm.updateMatrix(); defs.setMatrixAt(i, dm.matrix); });
    defs.instanceMatrix.needsUpdate = true;

    // ships ride the swell; Glasgow is hit, rolls and settles with her masts above water
    ships.forEach((s, i) => { s.R.position.y = Math.sin(t * 0.8 + i * 1.7) * 0.04; s.R.rotation.x = Math.sin(t * 0.6 + i) * 0.015; });
    const sink = ramp(t, tGl - 0.5, tGl + 2.8);
    glas.R.position.y = Math.sin(t * 0.9) * 0.04 - 1.15 * sink; glas.R.rotation.x = 0.42 * sink; glas.R.rotation.z = 0.08 * sink;

    // burning: palace, harem, then the House of Wonders; afterwards they smoulder and partly cave in
    const after = 1 - 0.65 * ramp(t, tCease + 2, tCease + 9);
    const bP = ramp(t, tBurn, tBurnt) * after, bH = ramp(t, tBurnt - 0.6, tBurnt + 1.2) * after, bW = 0.6 * ramp(t, tBurnt, tBurnt + 2.5) * after, bG = ramp(t, A("s5:Glasgow") - 0.4, A("s5:Glasgow") + 0.3) * (1 - sink);
    const char = ramp(t, tBurnt - 0.5, tCease + 1);
    const flick = 0.8 + 0.2 * Math.sin(t * 13) + 0.1 * Math.sin(t * 29);
    [[PAL, bP, 1], [HAR, bH, 1], [HOW, bW, 0.55]].forEach(([H, b, ch]) => { H.wallM.emissiveIntensity = 0.55 * b * flick; H.winM.emissiveIntensity = 2.2 * b * flick; H.wallM.color.setHex(H === HOW ? 0xd3cab4 : H === PAL ? 0xc8bfa8 : 0xcfc4ab).lerp(new THREE.Color(0x2a2420), char * ch * 0.85); });
    const cave = ramp(t, A("s6:Bendera") - 0.8, tCease + 1.5);
    PAL.g.scale.y = 1 - 0.42 * cave; PAL.g.rotation.x = 0.06 * cave; HAR.g.scale.y = 1 - 0.38 * cave; HAR.g.rotation.z = -0.05 * cave;
    fireL1.intensity = 160 * bP * flick; fireL2.intensity = 140 * bH * flick;

    // shells
    let fi = 0, ti = 0, bi = 0, gi = 0, mz = 0, im = 0;
    const F = flash.pos, Tr = trc.pos, B_ = boom.pos, Bc = boom.col, G_ = gsm.pos;
    for (const s of SH) {
      const dt = t - s.ts; if (dt < 0 || dt > 7) continue;
      const m = s.m, p = s.p;
      if (dt < 0.18 && fi < 60) { for (let k = 0; k < 3 && fi < 60; k++) { const q = seeds[(s.sd + k) % 1200]; F[fi * 3] = m.x + (q[0] - 0.5) * 0.4 + 0.5 * k * 0.6; F[fi * 3 + 1] = m.y + (q[1] - 0.5) * 0.3; F[fi * 3 + 2] = m.z + (q[2] - 0.5) * 0.4; fi++; } mz = Math.max(mz, 1 - dt / 0.18); if (mz === 1 - dt / 0.18) muzL.position.copy(m); }
      if (dt < 0.5) for (let k = 0; k < 6 && ti < 240; k++) { const u = clamp01(dt / 0.5 - k * 0.035); Tr[ti * 3] = m.x + (p[0] - m.x) * u; Tr[ti * 3 + 1] = m.y + (p[1] - m.y) * u + Math.sin(Math.PI * u) * 1.6; Tr[ti * 3 + 2] = m.z + (p[2] - m.z) * u; ti++; }
      const di = dt - 0.5;
      if (di > 0 && di < 1.1) { for (let k = 0; k < 24 && bi < 640; k++) { const q = seeds[(s.sd * 7 + k) % 1200]; const a = q[0] * 6.283, e = q[1] * 1.4, rr = (0.4 + q[2] * 2.2) * eout(di / 0.7); B_[bi * 3] = p[0] + Math.cos(a) * Math.cos(e) * rr; B_[bi * 3 + 1] = p[1] + Math.sin(e) * rr - 1.2 * di * di; B_[bi * 3 + 2] = p[2] + Math.sin(a) * Math.cos(e) * rr; const f = 1 - di / 1.1; Bc[bi * 3] = f; Bc[bi * 3 + 1] = 0.55 * f * f; Bc[bi * 3 + 2] = 0.2 * f * f * f; bi++; } if (di < 0.35) { im = Math.max(im, 1 - di / 0.35); impL.position.set(p[0] - 1, p[1] + 0.5, p[2]); } }
      for (let k = 0; k < 5 && gi < 420; k++) { const q = seeds[(s.sd * 3 + k) % 1200]; const u = clamp01(dt / 7); G_[gi * 3] = m.x + (q[0] - 0.5) * 1.2 + u * 3; G_[gi * 3 + 1] = m.y + 0.2 + u * 2.5 + q[1] * 0.4; G_[gi * 3 + 2] = m.z + (q[2] - 0.5) * 1.2 + u * 6 + 0.3; gi++; }
    }
    for (; fi < 60; fi++) F[fi * 3 + 1] = -1e4;
    for (; ti < 240; ti++) Tr[ti * 3 + 1] = -1e4;
    for (; bi < 640; bi++) B_[bi * 3 + 1] = -1e4;
    for (; gi < 420; gi++) G_[gi * 3 + 1] = -1e4;
    flash.commit(); trc.commit(); boom.commit(); gsm.commit();
    muzL.intensity = 280 * mz; impL.intensity = 300 * im;

    // fire and smoke columns from whatever is burning
    const em = [[PAL, bP, 1.0], [HAR, bH, 0.9], [HOW, bW, 0.7], [null, bG, 0.22]];
    const Fp = fire.pos, Fc = fire.col, Sp = smk.pos;
    for (let i = 0; i < 1000; i++) {
      const q = seeds[i], e = em[i % 4], w = e[1];
      const life = (q[0] + t * (0.7 + q[1] * 0.6)) % 1;
      if (w * e[2] < q[2] * 0.9 + 0.05) { Fp[i * 3 + 1] = -1e4; continue; }
      let bx, by, bz, sx, sz;
      if (e[0]) { const H = e[0]; bx = H.g.position.x; by = 1 + H.h * H.g.scale.y; bz = H.g.position.z; sx = H.w; sz = H.d; } else { bx = glas.G.position.x; by = 0.6 + glas.R.position.y; bz = glas.G.position.z; sx = 1; sz = 5; }
      Fp[i * 3] = bx + (q[3] - 0.5) * sx + life * 0.6; Fp[i * 3 + 1] = by - 0.6 + q[4] * 0.8 + life * (1.8 + q[1] * 1.5); Fp[i * 3 + 2] = bz + (q[4] - 0.5) * sz + life * 1.2;
      const f = (1 - life) * flick; Fc[i * 3] = f; Fc[i * 3 + 1] = 0.45 * f * (1 - life * 0.5); Fc[i * 3 + 2] = 0.12 * f;
    }
    fire.commit();
    for (let i = 0; i < 700; i++) {
      const q = seeds[i + 300], e = em[i % 3], w = Math.max(e[1], 0.4 * char * (e[0] === HOW ? 0.5 : 1));
      if (w < q[2] * 0.95 + 0.04 || t < tBurn - 0.2) { Sp[i * 3 + 1] = -1e4; continue; }
      const H = e[0], life = (q[0] + t * (0.06 + q[1] * 0.05)) % 1;
      Sp[i * 3] = H.g.position.x + (q[3] - 0.5) * H.w + life * 8; Sp[i * 3 + 1] = 1 + H.h + life * 26 + q[4] * 2; Sp[i * 3 + 2] = H.g.position.z + (q[4] - 0.5) * H.d + life * 28;
    }
    smk.commit();
    smk.m.opacity = 0.42 * ramp(t, tBurn, tBurn + 1.5);

    // HUD altitude readout (km), written into the HTML layer
    if (hudAlt) { const km = cam.position.y / 100; hudAlt.textContent = "ALT " + (km >= 10 ? fmtN(km, 0) : fmtN(km, 2)) + " KM"; }
    bp.strength = 0.42 + 0.08 * clamp01(mz + im);
    comp.render();
  };
}
