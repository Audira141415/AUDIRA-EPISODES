// EP14 BUILDFORGE: Brasília assembles itself on red cerrado earth at golden hour.
// Two stations on one plateau: M, a survey map of Brazil laid on the ground (coast vs interior), and
// C, the city site: bulldozers clear the cerrado, the plan is drawn as a cross of axes, cranes raise
// generic modernist forms, the artificial lake fills over the first workers' village, then housing spreads.
// Every state is a function of story time S(t); the hook replays the whole build as a time-lapse.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, stage, pts, back, smooth } from "./lib3d.js";
import { GEO } from "./geo.js";

const RED = "#B5472B", CONC = "#ECE9E2", SKY = "#5E9ED6", GRN = "#009C3B", YEL = "#FFDF00", INK = "#1F2326";

// Hermite track with harmonic-mean tangents: never overshoots a key.
function track(keys) {
  keys.sort((a, b) => a[0] - b[0]);
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
const lerpKeys = (keys, t) => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i]; return va + (vb - va) * (t - a) / (b - a); } return keys[keys.length - 1][1]; };

// merge simple geometries into one with a colour attribute (for instanced figures)
function mergeCol(parts) {
  const P = [], N = [], C = [];
  for (const [geo, col, x, y, z] of parts) {
    const g = geo.index ? geo.toNonIndexed() : geo; g.translate(x, y, z);
    const c = new THREE.Color(col), p = g.attributes.position.array, nn = g.attributes.normal.array;
    for (let i = 0; i < p.length; i++) { P.push(p[i]); N.push(nn[i]); }
    for (let i = 0; i < p.length / 3; i++) C.push(c.r, c.g, c.b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(C, 3));
  return g;
}

export function create(canvas, K, AT) {
  const A = (k) => AT[k];
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xeec192, fog: 0.0011, exp: 1.0, bloom: [0.12, 0.4, 0.92] });
  const rnd = mulberry(1960);
  const hemi = new THREE.HemisphereLight(0xbcd8f2, 0x8a3a22, 0.95);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffcf96, 2.2);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -120, right: 120, top: 120, bottom: -120, near: 1, far: 500 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);

  // ---------- sky ----------
  const sky = new THREE.Mesh(new THREE.SphereGeometry(820, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color("#4C8CCB") }, mid: { value: new THREE.Color("#A9CBE6") }, hor: { value: new THREE.Color("#F6C68E") } },
    vertexShader: "varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform vec3 top,mid,hor;varying vec3 vP;void main(){float y=max(vP.y,0.);vec3 c=mix(hor,mid,smoothstep(0.,.18,y));c=mix(c,top,smoothstep(.18,.7,y));float s=pow(max(dot(vP,normalize(vec3(-.62,.3,.72))),0.),40.);c+=vec3(1.,.8,.5)*s*.35;gl_FragColor=vec4(c,1.);}",
  }));
  scene.add(sky);

  const add = (geo, mat, x, y, z, parent = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  const B = (w, h, d, mat, x, y, z, p) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p);
  const sm = (color, rough = 0.85, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
  const dmy = new THREE.Object3D(); dmy.rotation.order = "YXZ";
  const setI = (m, i, x, y, z, yaw = 0, s = 1, sy = s) => { dmy.position.set(x, y, z); dmy.rotation.set(0, yaw, 0); dmy.scale.set(Math.max(1e-4, s), Math.max(1e-4, sy), Math.max(1e-4, s)); dmy.updateMatrix(); m.setMatrixAt(i, dmy.matrix); };
  const inst = (geo, mat, n, shadow = true) => { const m = new THREE.InstancedMesh(geo, mat, n); m.castShadow = shadow; m.receiveShadow = true; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); return m; };

  // ---------- canvas labels redrawn when fonts arrive ----------
  const labels = [];
  let fontsOk = false;
  const label = (w, h, paint, rep) => { const tx = canvasTex(w, h, paint, rep); labels.push([tx, paint]); return tx; };

  // ---------- terrain: red cerrado plateau, lake basin east of the city ----------
  const X0 = -600; // map station
  const SPINE = [[[88, -125], [96, -60], [104, -10], [100, 30], [110, 80], [96, 130]], [[100, 30], [62, 86], [0, 104], [-50, 112]], [[96, -60], [52, -92], [-8, -106], [-60, -112]]];
  const segD = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], u = clamp01(((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz)); return Math.hypot(x - a[0] - dx * u, z - a[1] - dz * u); };
  const lakeD = (x, z) => { let d = 1e9, arm = 0; SPINE.forEach((pl, k) => { for (let i = 0; i < pl.length - 1; i++) { const v = segD(x, z, pl[i], pl[i + 1]); if (v < d) { d = v; arm = k; } } }); return [d, arm]; };
  const H = (x, z) => {
    const [d, arm] = lakeD(x, z), R = arm ? 19 : 27;
    let h = -6 * smooth(1 - d / R) - 0.7 * smooth(1 - d / 2.6);
    const far = clamp01((Math.max(Math.abs(x - 10), Math.abs(z)) - 85) / 60) * clamp01((Math.hypot(x - X0, z) - 90) / 60) * clamp01((d - 30) / 30);
    h += far * (2.2 * Math.sin(x * 0.021 + 1) * Math.cos(z * 0.017) + 1.2 * Math.sin(x * 0.05 + z * 0.04));
    return h;
  };
  const tg = new THREE.PlaneGeometry(1700, 1100, 340, 220); tg.rotateX(-Math.PI / 2); tg.translate(-250, 0, 0);
  { const p = tg.attributes.position, col = []; const c0 = new THREE.Color(RED), c1 = new THREE.Color("#8E3520"), c2 = new THREE.Color("#C8693F"), c3 = new THREE.Color("#6A5A34"), q = mulberry(5);
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), h = H(x, z); p.setY(i, h); const n = 0.5 + 0.5 * Math.sin(x * 0.13 + Math.cos(z * 0.11) * 2) * Math.cos(z * 0.07); const c = c0.clone().lerp(c1, 0.35 * n + 0.15 * q()).lerp(c2, h < -0.5 ? 0 : 0.25 * (1 - n)); if (h < -1) c.lerp(c3, clamp01(-h / 6) * 0.35); col.push(c.r, c.g, c.b); }
    tg.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); tg.computeVertexNormals(); }
  const soil = canvasTex(512, 512, (g, w) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, w); const q = mulberry(3); for (let i = 0; i < 14000; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "60,20,10" : "255,230,200"},${q() * 0.12})`; g.fillRect(q() * w, q() * w, 1 + q() * 2.5, 1 + q() * 2.5); } }, [140, 90]);
  const ground = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ vertexColors: true, map: soil, roughness: 0.97 }));
  ground.receiveShadow = true; scene.add(ground);

  // cerrado shrubs: twisted little trees with olive crowns
  const shrubG = mergeCol([[new THREE.CylinderGeometry(0.12, 0.18, 1.2, 5), "#5A3B26", 0, 0.6, 0], [new THREE.SphereGeometry(0.9, 7, 5), "#6E7A3A", 0.1, 1.5, 0], [new THREE.SphereGeometry(0.6, 6, 4), "#7F8A44", -0.5, 1.3, 0.3]]);
  const NS = 1500, shrubs = inst(shrubG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, flatShading: true }), NS);
  const shrubP = [];
  while (shrubP.length < NS) {
    const x = -250 + rnd() * 450, z = -170 + rnd() * 340;
    const ox = rnd() < 0.3 ? X0 + (rnd() - 0.5) * 300 : null;
    const X = ox ?? x, Z = ox !== null ? (rnd() - 0.5) * 300 : z;
    if (Math.abs(X - X0) < 64 && Math.abs(Z) < 64) continue;
    if (H(X, Z) < -0.4) continue;
    const inSite = Math.abs(X - 4) < 76 && Math.abs(Z) < 64;
    shrubP.push([X, Z, 0.7 + rnd() * 0.9, rnd() * 6, inSite]);
  }

  // ======================= STATION M: survey map of Brazil =======================
  const MS = 110, CW = 2048;
  const PJ = (lon, lat) => [(lon + 53) * 2.1, -(lat + 14) * 2.2];
  const PX = (lon, lat) => { const [x, z] = PJ(lon, lat); return [(x / MS + 0.5) * CW, (z / MS + 0.5) * CW]; };
  const BR = GEO.find((c) => c.name === "Brazil").rings.reduce((a, b) => (b.length > a.length ? b : a));
  const ringPath = (g, ring) => { g.beginPath(); ring.forEach(([lo, la], i) => { const [x, y] = PX(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); };
  const mapCanvas = document.createElement("canvas"); mapCanvas.width = mapCanvas.height = CW;
  const paintMap = (g, w) => {
    g.fillStyle = "#3F82B5"; g.fillRect(0, 0, w, w);
    g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = 3; for (let y = 10; y < w; y += 26) { g.beginPath(); for (let x = 0; x <= w; x += 24) g.lineTo(x, y + Math.sin(x * 0.015 + y) * 4); g.stroke(); }
    for (const c of GEO) for (const ring of c.rings) { ringPath(g, ring); g.fillStyle = c.name === "Brazil" ? "#E0C192" : "#D3CCBD"; g.fill(); g.strokeStyle = "rgba(60,50,40,.35)"; g.lineWidth = 2; g.stroke(); }
    g.save(); ringPath(g, BR); g.clip();
    // green forest north and along the coast, red cerrado in the middle
    const [ax, ay] = PX(-60, -3); let gr = g.createRadialGradient(ax, ay, 40, ax, ay, 700); gr.addColorStop(0, "rgba(70,120,60,.75)"); gr.addColorStop(1, "rgba(70,120,60,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w);
    const [cx, cy] = PX(-48, -15); gr = g.createRadialGradient(cx, cy, 30, cx, cy, 520); gr.addColorStop(0, "rgba(181,71,43,.75)"); gr.addColorStop(1, "rgba(181,71,43,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w);
    g.lineWidth = 70; g.strokeStyle = "rgba(60,120,70,.45)"; ringPath(g, BR); g.stroke();
    const q = mulberry(9); for (let i = 0; i < 2600; i++) { const [x, y] = [q() * w, q() * w]; g.fillStyle = `rgba(90,60,30,${q() * 0.12})`; g.fillRect(x, y, 3, 3); }
    g.restore();
    g.lineWidth = 5; g.strokeStyle = "#3B2A1E"; ringPath(g, BR); g.stroke();
    const L = (txt, lon, lat, font, col, sp = 6) => { const [x, y] = PX(lon, lat); g.save(); g.font = font; g.letterSpacing = sp + "px"; g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, x, y); g.restore(); };
    L("BRASIL", -56, -9, "800 92px Montserrat, Arial, sans-serif", "rgba(60,30,20,.55)", 26);
    L("SAMUDRA ATLANTIK", -33, -27, "700 46px Montserrat, Arial, sans-serif", "rgba(255,255,255,.75)", 10);
    L("Rio de Janeiro", -41.2, -24.6, "700 44px 'Work Sans', Arial, sans-serif", INK, 1);
    L("PEDALAMAN", -48.5, -12.4, "800 40px Montserrat, Arial, sans-serif", "rgba(255,255,255,.92)", 10);
    // cartouche with the site board style
    g.fillStyle = "rgba(236,233,226,.95)"; g.fillRect(60, w - 230, 640, 170); g.fillStyle = RED; g.fillRect(60, w - 230, 18, 170);
    g.fillStyle = INK; g.font = "800 44px Montserrat, Arial, sans-serif"; g.letterSpacing = "4px"; g.textBaseline = "middle"; g.fillText("PETA SURVEI", 104, w - 180);
    g.font = "500 30px 'Work Sans', Arial, sans-serif"; g.letterSpacing = "1px"; g.fillText("pesisir vs pedalaman · ilustrasi", 104, w - 118);
    g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, w - 20);
  };
  paintMap(mapCanvas.getContext("2d"), CW);
  const mkTex = () => { const t = new THREE.CanvasTexture(mapCanvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const mapTx = mkTex(), capTx = mkTex();
  capTx.wrapS = capTx.wrapT = THREE.RepeatWrapping; capTx.repeat.set(1 / MS, 1 / MS); capTx.offset.set(0.5, 0.5);
  labels.push([{ set needsUpdate(v) { mapTx.needsUpdate = capTx.needsUpdate = v; }, image: mapCanvas }, (g, w) => paintMap(g, w)]);
  B(MS + 4, 0.8, MS + 4, sm("#D9D4C9"), X0, 0.1, 0);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(MS, MS), new THREE.MeshStandardMaterial({ map: mapTx, roughness: 0.9 }));
  plate.rotation.x = -Math.PI / 2; plate.position.set(X0, 0.52, 0); plate.receiveShadow = true; scene.add(plate);
  const shape = new THREE.Shape(BR.map(([lo, la]) => { const [x, z] = PJ(lo, la); return new THREE.Vector2(x, -z); }));
  const exG = new THREE.ExtrudeGeometry(shape, { depth: 0.9, bevelEnabled: false });
  const brazil = new THREE.Mesh(exG, [new THREE.MeshStandardMaterial({ map: capTx, roughness: 0.9 }), sm("#8E4A2E")]);
  brazil.rotation.x = -Math.PI / 2; brazil.position.set(X0, 0.53, 0); brazil.castShadow = brazil.receiveShadow = true; scene.add(brazil);
  const MT = 1.45; // top of the Brazil slab
  const MP = (lon, lat) => { const [x, z] = PJ(lon, lat); return [X0 + x, z]; };
  // coastal cities: clusters of towers (population and wealth on the coast)
  const winT = canvasTex(64, 128, (g, w, h) => { g.fillStyle = "#F1EEE7"; g.fillRect(0, 0, w, h); g.fillStyle = "#4C6A7C"; for (let y = 6; y < h; y += 12) g.fillRect(6, y, w - 12, 6); }, [1, 1]);
  const towerM = new THREE.MeshStandardMaterial({ map: winT, roughness: 0.6 });
  const tG = new THREE.BoxGeometry(1, 1, 1); tG.translate(0, 0.5, 0);
  const CITIES = [[-43.2, -22.9, 5.5, 14], [-46.6, -23.5, 6.5, 14], [-38.5, -13.0, 3.6, 9], [-34.9, -8.05, 3.2, 8], [-38.5, -3.7, 2.8, 7], [-48.5, -1.4, 2.4, 6], [-51.2, -30.0, 3.0, 8], [-40.3, -20.3, 2.4, 6], [-49.3, -25.4, 2.4, 6]];
  const coastT = []; CITIES.forEach(([lo, la, hm, n], ci) => { const [x, z] = MP(lo, la); for (let k = 0; k < n; k++) coastT.push([x + (rnd() - 0.5) * 3.2, z + (rnd() - 0.5) * 2.6, 0.5 + rnd() * 0.5, hm * (0.35 + rnd() * 0.65), ci, k]); });
  const coastM = inst(tG, towerM, coastT.length);
  const coinM = inst(new THREE.CylinderGeometry(0.55, 0.55, 0.16, 18), sm("#D8A23A", 0.35, { metalness: 0.55 }), 60);
  const coinSp = [MP(-43.2, -22.9), MP(-46.6, -23.5), MP(-38.5, -13)].map(([x, z], i) => [x + 2.4, z + (i === 0 ? 2.2 : 1.6)]);
  // Rio pin (old capital)
  const pinRio = new THREE.Group(); add(new THREE.CylinderGeometry(0.09, 0.09, 3.4, 8), sm("#333"), 0, 1.7, 0, pinRio); add(new THREE.SphereGeometry(0.62, 16, 12), sm(SKY, 0.4), 0, 3.6, 0, pinRio);
  { const [x, z] = MP(-43.2, -22.9); pinRio.position.set(x, MT, z); scene.add(pinRio); }
  // target in the interior
  const [TX, TZ] = MP(-47.9, -15.8);
  const tgtG = new THREE.Group(); tgtG.position.set(TX, MT + 0.05, TZ); scene.add(tgtG);
  const ringMs = [];
  [[3.4, RED], [2.4, "#ffffff"], [1.4, RED]].forEach(([rr, c], i) => { const m = new THREE.Mesh(new THREE.RingGeometry(rr - 0.45, rr, 48), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, side: THREE.DoubleSide, transparent: true })); m.rotation.x = -Math.PI / 2; m.position.y = 0.04 + i * 0.01; tgtG.add(m); ringMs.push(m); });
  const dot = add(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 20), sm(RED, 0.5), 0, 0.15, 0, tgtG);
  // 1827 arrow: coast to interior
  const [RX, RZ] = MP(-43.2, -22.9);
  const arcC = new THREE.QuadraticBezierCurve3(new THREE.Vector3(RX, MT + 0.6, RZ), new THREE.Vector3((RX + TX) / 2 + 2, MT + 9, (RZ + TZ) / 2 + 1), new THREE.Vector3(TX + 1.1, MT + 1.4, TZ + 1.4));
  const arrowG = new THREE.TubeGeometry(arcC, 80, 0.32, 8, false);
  const arrow = add(arrowG, sm("#ffffff", 0.5), 0, 0, 0); arrow.castShadow = true;
  const head = add(new THREE.ConeGeometry(0.8, 1.8, 14), sm("#ffffff", 0.5), TX + 1.1, MT + 1.4, TZ + 1.4);
  { const tn = arcC.getTangent(1); head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tn); }
  // 1891: the central plateau block (the future federal district)
  const df = new THREE.Group(); df.position.set(TX, MT, TZ); scene.add(df);
  const dfB = add(new THREE.BoxGeometry(5.4, 1, 3.2), sm("#A9432A"), 0, 0.5, 0, df);
  for (const [w, d, x, z] of [[5.6, 0.18, 0, 1.6], [5.6, 0.18, 0, -1.6], [0.18, 3.4, 2.7, 0], [0.18, 3.4, -2.7, 0]]) add(new THREE.BoxGeometry(w, 0.12, d), sm("#ffffff", 0.5), x, 1.04, z, df);

  // ======================= STATION C: the city site =======================
  const mConc = sm(CONC, 0.82), mConc2 = sm("#DCD7CD", 0.85), mAsph = sm("#3E3A38", 0.9), mLawn = sm("#6F8B3F", 0.95), mGlass = sm("#3D5C6A", 0.25, { metalness: 0.35 }), mWood = sm("#8A5A35", 0.9), mTin = sm("#9C7458", 0.7, { metalness: 0.2 });
  // cleared ground decal grows behind the bulldozers
  const clearT = canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, w * 0.3, w / 2, w / 2, w * 0.5); gr.addColorStop(0, "rgba(214,138,96,1)"); gr.addColorStop(1, "rgba(214,138,96,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); const q = mulberry(2); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(120,50,30,${q() * 0.2})`; g.fillRect(q() * w, q() * w, 2, 6); } });
  const clear = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ map: clearT, transparent: true, depthWrite: false, roughness: 1 }));
  clear.rotation.x = -Math.PI / 2; clear.position.y = 0.05; clear.receiveShadow = true; scene.add(clear);

  // bulldozers
  const dozers = [-34, 0, 34].map((z) => { const G = new THREE.Group(); B(4, 1.6, 2.6, sm("#D99A1E", 0.6), 0, 1.3, 0, G); B(1.6, 1.4, 2.2, sm("#C68A18", 0.6), -0.8, 2.7, 0, G); B(4.4, 0.7, 0.7, sm("#2E2B29"), 0, 0.4, 1.4, G); B(4.4, 0.7, 0.7, sm("#2E2B29"), 0, 0.4, -1.4, G); B(0.4, 1.6, 3.6, sm("#55504A", 0.5, { metalness: 0.4 }), 2.6, 0.8, 0, G); G.position.z = z; scene.add(G); return G; });
  const dust = pts(scene, 260, { color: 0xd79a72, size: 2.6, add: false, opacity: 0.45 });
  const dSeed = [...Array(260)].map(() => [rnd(), rnd(), rnd(), rnd()]);

  // site board with the AUDIRA plate (part of the world, not an overlay)
  const boardT = label(1024, 512, (g, w, h) => {
    g.fillStyle = CONC; g.fillRect(0, 0, w, h);
    g.fillStyle = RED; g.fillRect(0, 0, w, 120);
    g.fillStyle = "#fff"; g.font = "800 66px Montserrat, Arial, sans-serif"; g.letterSpacing = "6px"; g.textBaseline = "middle"; g.fillText("PROYEK IBU KOTA BARU", 40, 62);
    g.fillStyle = INK; g.font = "800 92px Montserrat, Arial, sans-serif"; g.letterSpacing = "3px"; g.fillText("BRASÍLIA", 40, 210);
    g.font = "500 40px 'Work Sans', Arial, sans-serif"; g.letterSpacing = "1px"; g.fillText("Dataran Tinggi Brasil · ±1.000 m dpl", 40, 300);
    for (let x = 0; x < w; x += 56) { g.fillStyle = YEL; g.beginPath(); g.moveTo(x, 360); g.lineTo(x + 28, 360); g.lineTo(x + 8, 400); g.lineTo(x - 20, 400); g.fill(); }
    g.fillStyle = INK; g.fillRect(0, 400, w, 112);
    g.fillStyle = "#fff"; g.font = "800 58px Montserrat, Arial, sans-serif"; g.letterSpacing = "14px"; g.fillText("AUDIRA", 40, 458);
    g.fillStyle = "rgba(255,255,255,.7)"; g.font = "500 30px 'Work Sans', Arial, sans-serif"; g.letterSpacing = "2px"; g.fillText("ilustrasi sejarah · Agus Dwi R.", 420, 460);
  });
  const board = new THREE.Group(); board.position.set(-40, 0, 16); board.rotation.y = -0.55; scene.add(board);
  for (const x of [-4.2, 4.2]) B(0.35, 6.5, 0.35, mWood, x, 3.25, -0.1, board);
  add(new THREE.BoxGeometry(10, 5, 0.25), [mWood, mWood, mWood, mWood, new THREE.MeshStandardMaterial({ map: boardT, roughness: 0.8 }), mWood], 0, 5.2, 0, board);

  // survey stakes along the future axes
  const AX0 = -58, AX1 = 66, CROSS = 4;
  const wingX = (z) => CROSS + (z * z) / 150;
  const stakeP = [];
  for (let x = AX0; x <= AX1; x += 8) stakeP.push([x, 1.6, 0]);
  for (let z = -52; z <= 52; z += 8) if (Math.abs(z) > 3) stakeP.push([wingX(z), 1.6, z]);
  const stakeG = mergeCol([[new THREE.BoxGeometry(0.22, 2.2, 0.22), "#C9A47A", 0, 1.1, 0], [new THREE.BoxGeometry(0.9, 0.5, 0.05), "#F05A28", 0.45, 1.9, 0]]);
  const stakes = inst(stakeG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 }), stakeP.length);

  // plan lines: the cross of axes (white survey tape), then roads
  const axisLine = B(1, 0.14, 2.6, sm("#ffffff", 0.6, { emissive: 0x332a20 }), 0, 0.12, 0);
  const NW = 70, wingSeg = [];
  for (let i = 0; i < NW; i++) { const z0 = -54 + (108 * i) / NW, z1 = -54 + (108 * (i + 1)) / NW, x0 = wingX(z0), x1 = wingX(z1); wingSeg.push([(x0 + x1) / 2, (z0 + z1) / 2, Math.hypot(x1 - x0, z1 - z0) + 0.15, Math.atan2(x1 - x0, z1 - z0), Math.abs((z0 + z1) / 2) / 54]); }
  const wLine = inst(new THREE.BoxGeometry(2.6, 0.14, 1), sm("#ffffff", 0.6, { emissive: 0x332a20 }), NW, false);
  const wRoad = inst(new THREE.BoxGeometry(1, 0.1, 1), mAsph, NW, false);
  const axisRoad = new THREE.Group(); scene.add(axisRoad);
  const aLen = AX1 - AX0;
  B(aLen, 0.1, 2.6, mAsph, (AX0 + AX1) / 2, 0.07, 4.2, axisRoad); B(aLen, 0.1, 2.6, mAsph, (AX0 + AX1) / 2, 0.07, -4.2, axisRoad); B(aLen - 20, 0.08, 5.6, mLawn, (AX0 + AX1) / 2 - 8, 0.06, 0, axisRoad);

  // cockpit: plaza, platform with saucer and dome, twin towers with a bridge
  const plaza = B(12, 0.3, 30, sm("#DCD6CB", 0.8), 62, 0.15, 0);
  const platform = B(9, 1.8, 26, mConc, 50, 0.9, 0);
  const saucerG = new THREE.LatheGeometry([[0.4, 0], [1.6, 0.25], [3.0, 0.9], [4.2, 1.9], [4.6, 2.5], [4.4, 2.55], [3.9, 2.0], [2.8, 1.15], [1.4, 0.45], [0.3, 0.3]].map(([x, y]) => new THREE.Vector2(x, y)), 40);
  const saucer = add(saucerG, mConc, 50, 1.8, -6.5);
  const domeG = new THREE.SphereGeometry(3.6, 36, 12, 0, Math.PI * 2, 0, Math.PI / 2); domeG.scale(1, 0.62, 1);
  const dome = add(domeG, mConc, 50, 1.8, 6.5);
  const NF = 22, FH = 1.0;
  const floorG = new THREE.BoxGeometry(2.2, FH * 0.32, 6.2); floorG.translate(0, FH * 0.16, 0);
  const glassG = new THREE.BoxGeometry(2.0, FH * 0.68, 6.0); glassG.translate(0, FH * 0.32 + FH * 0.34, 0);
  const tFloor = inst(floorG, mConc, NF * 2), tGlass = inst(glassG, mGlass, NF * 2);
  const TWX = 56, TWZ = [-2.3, 2.3];
  const bridge = B(2.2, 2.4, 2.4, mConc, TWX, 0, 0);
  // ministries along the axis
  const minP = []; for (const s of [-1, 1]) for (let k = 0; k < 8; k++) minP.push([27 + k * 2.3, s * 13.5]);
  const minG = new THREE.BoxGeometry(1.4, 8.5, 7); minG.translate(0, 4.25, 0);
  const minM = new THREE.MeshStandardMaterial({ map: canvasTex(64, 256, (g, w, h) => { g.fillStyle = "#EFECE5"; g.fillRect(0, 0, w, h); g.fillStyle = "#58737F"; for (let y = 8; y < h; y += 16) g.fillRect(0, y, w, 9); }), roughness: 0.6 });
  const mins = inst(minG, minM, minP.length);
  // cathedral: a crown of curved ribs
  const CAX = 22, CAZ = -15, NR = 16;
  const ribPts = [[5, 0], [3.6, 3], [2.1, 6.5], [2.2, 8.5], [3.2, 10.5], [4.1, 12]];
  const ribs = [];
  for (let i = 0; i < NR; i++) { const a = (i / NR) * Math.PI * 2; const c = new THREE.CatmullRomCurve3(ribPts.map(([rr, y]) => new THREE.Vector3(rr * Math.cos(a), y, rr * Math.sin(a)))); ribs.push(add(new THREE.TubeGeometry(c, 30, 0.34, 6, false), mConc, CAX, 0, CAZ)); }
  const cGlass = add(new THREE.LatheGeometry(ribPts.map(([x, y]) => new THREE.Vector2(x * 0.97, y)), 32), new THREE.MeshStandardMaterial({ color: "#8CC3E8", roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }), CAX, 0, CAZ);
  cGlass.castShadow = false;

  // tower cranes (red and white) with AUDIRA plates on the counterweights
  const latT = canvasTex(64, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "#fff"; g.lineWidth = 7; g.strokeRect(3, 0, w - 6, h); for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(3, y); g.lineTo(w - 3, y + 32); g.stroke(); g.beginPath(); g.moveTo(3, y); g.lineTo(w - 3, y); g.stroke(); } }, [1, 8]);
  const latM = new THREE.MeshStandardMaterial({ color: RED, map: latT, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6 });
  const plateT = label(512, 128, (g, w, h) => { g.fillStyle = INK; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.font = "800 78px Montserrat, Arial, sans-serif"; g.letterSpacing = "14px"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", w / 2 + 7, h / 2 + 3); });
  const plateM = new THREE.MeshStandardMaterial({ map: plateT, roughness: 0.6 });
  const crane = (x, z, Hm, jl) => {
    const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
    B(3, 1, 3, mConc2, 0, 0.5, 0, G);
    const mast = add(new THREE.BoxGeometry(1.2, 1, 1.2), latM, 0, 0, 0, G); mast.geometry.translate(0, 0.5, 0);
    const top = new THREE.Group(); G.add(top);
    B(jl, 0.9, 0.9, latM, jl / 2, 0.45, 0, top); B(7, 0.9, 0.9, latM, -3.5, 0.45, 0, top);
    add(new THREE.BoxGeometry(2.2, 1.9, 1.6), [mConc2, mConc2, mConc2, mConc2, plateM, plateM], -6.2, -0.3, 0, top);
    B(1.4, 1.3, 1.3, sm("#F2F0EA", 0.5), 0.6, -0.7, 0.9, top); add(new THREE.ConeGeometry(0.7, 3, 4), latM, 0, 2.2, 0, top);
    const trolley = B(1.1, 0.4, 1.1, sm("#333"), 8, -0.2, 0, top);
    const cable = B(0.07, 1, 0.07, sm("#222"), 0, 0, 0); cable.castShadow = false; cable.geometry.translate(0, -0.5, 0);
    const hook = B(0.5, 0.7, 0.5, sm(YEL, 0.5), 0, 0, 0);
    return { G, mast, top, trolley, cable, hook, Hm, jl, x, z };
  };
  const crA = crane(44, -17, 30, 16), crB = crane(44, 17, 30, 16), crC = crane(61, 9, 33, 12), crD = crane(30, -27, 24, 16);
  const cranes = [crA, crB, crC, crD];
  const aim = (c, tx, tz, hy, s) => {
    const dx = tx - c.x, dz = tz - c.z, yaw = -Math.atan2(dz, dx), rr = Math.min(c.jl - 0.6, Math.max(2, Math.hypot(dx, dz)));
    c.top.rotation.y = yaw; c.trolley.position.x = rr;
    const topY = c.Hm * s, hx = c.x + Math.cos(-yaw) * rr, hz = c.z + Math.sin(-yaw) * rr;
    c.cable.position.set(hx, topY - 0.4, hz); c.cable.scale.y = Math.max(0.01, topY - 0.4 - hy - 0.35);
    c.hook.position.set(hx, hy, hz);
    return [hx, hz];
  };

  // flags at the plaza
  const flagT = canvasTex(300, 210, (g, w, h) => { g.fillStyle = GRN; g.fillRect(0, 0, w, h); g.fillStyle = YEL; g.beginPath(); g.moveTo(w / 2, 18); g.lineTo(w - 22, h / 2); g.lineTo(w / 2, h - 18); g.lineTo(22, h / 2); g.fill(); g.fillStyle = "#1F3A93"; g.beginPath(); g.arc(w / 2, h / 2, 50, 0, 7); g.fill(); });
  const flagGeo = new THREE.PlaneGeometry(3.2, 2.2, 16, 6); flagGeo.translate(1.6, 0, 0);
  const flagBase = Float32Array.from(flagGeo.attributes.position.array);
  const flags = [-6, 0, 6].map((z) => { B(0.18, 10, 0.18, sm("#cfcfcf", 0.4, { metalness: 0.6 }), 66, 5, z); const f = add(flagGeo, new THREE.MeshStandardMaterial({ map: flagT, side: THREE.DoubleSide, roughness: 0.8 }), 66, 1, z); return f; });
  const conf = pts(scene, 420, { color: 0xffffff, size: 0.55, add: false, opacity: 1 });
  const cSeed = [...Array(420)].map((_, i) => { const c = new THREE.Color([GRN, YEL, "#ffffff"][i % 3]); conf.col[i * 3] = c.r; conf.col[i * 3 + 1] = c.g; conf.col[i * 3 + 2] = c.b; return [rnd(), rnd(), rnd(), rnd()]; });

  // workers' village in the future lake bed
  const huts = [];
  const hutG = mergeCol([[new THREE.BoxGeometry(2.2, 1.7, 1.8), "#8A5A35", 0, 0.85, 0], [new THREE.CylinderGeometry(0.01, 1.6, 1.0, 4), "#9C7458", 0, 2.2, 0], [new THREE.BoxGeometry(0.5, 1.1, 0.05), "#3A2618", 0.3, 0.55, 0.92]]);
  for (let i = 0; i < 80 && huts.length < 16; i++) { const x = 100 + (rnd() - 0.5) * 18, z = -6 + (rnd() - 0.5) * 22; if (huts.some((h) => Math.hypot(h[0] - x, h[1] - z) < 3.4)) continue; if (lakeD(x, z)[0] < 3) continue; huts.push([x, z, H(x, z), rnd() * 3]); }
  const hutM = inst(hutG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, flatShading: true }), huts.length);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(320, 300), new THREE.MeshStandardMaterial({ color: "#3C82B4", roughness: 0.18, metalness: 0.15, transparent: true, opacity: 0.92 }));
  water.rotation.x = -Math.PI / 2; water.position.set(60, -6.6, 0); scene.add(water);

  // workers (pekerja): tiny figures with hard hats
  const wkG = mergeCol([[new THREE.BoxGeometry(0.42, 0.55, 0.28), "#2C4C7A", 0, 0.28, 0], [new THREE.BoxGeometry(0.5, 0.6, 0.32), "#2F5F8F", 0, 0.85, 0], [new THREE.SphereGeometry(0.2, 8, 6), "#8A5A3C", 0, 1.32, 0], [new THREE.SphereGeometry(0.24, 8, 4, 0, 6.3, 0, 1.6), YEL, 0, 1.38, 0]]);
  const NWK = 150, wk = inst(wkG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 }), NWK);
  const SPOTS = [[50, 0, 9], [56, 0, 5], [30, 0, 16], [22, -15, 6], [62, 0, 8], [10, 0, 22], [-20, 0, 20]];
  const wkP = [...Array(NWK)].map((_, i) => { if (i < 34) { const h = huts[i % huts.length]; return [h[0] + (rnd() - 0.5) * 6, h[1] + (rnd() - 0.5) * 6, 1, rnd() * 6]; } const s = SPOTS[i % SPOTS.length]; return [s[0] + (rnd() - 0.5) * s[2] * 1.4, s[1] + (rnd() - 0.5) * s[2] * 2, 0, rnd() * 6]; });

  // superquadras and trees along the wings
  const sqP = [], trP = [];
  for (const side of [-1, 1]) for (let z = 8; z <= 52; z += 4.2) for (const off of [-15, -9, 8, 14]) {
    const zz = side * z, x = wingX(zz) + off, d = z / 52; sqP.push([x, zz + (rnd() - 0.5), d + rnd() * 0.15]);
    for (let k = 0; k < 2; k++) trP.push([x + (rnd() - 0.5) * 5, zz + 2 + (rnd() - 0.5) * 1.5, d + rnd() * 0.2]);
  }
  const sqG = new THREE.BoxGeometry(4, 2.6, 1.3); sqG.translate(0, 1.9, 0);
  const sqM = new THREE.MeshStandardMaterial({ map: canvasTex(128, 64, (g, w, h) => { g.fillStyle = "#EEEBE4"; g.fillRect(0, 0, w, h); g.fillStyle = "#5B7682"; for (let y = 14; y < h - 4; y += 13) g.fillRect(4, y, w - 8, 6); g.fillStyle = "#8a8580"; g.fillRect(0, 0, w, 12); }), roughness: 0.7 });
  const sqs = inst(sqG, sqM, sqP.length);
  const trG = mergeCol([[new THREE.CylinderGeometry(0.12, 0.15, 1.2, 5), "#5A3B26", 0, 0.6, 0], [new THREE.SphereGeometry(1.1, 8, 6), "#4F7A35", 0, 1.8, 0]]);
  const trees = inst(trG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, flatShading: true }), trP.length);

  // ---------- story clock ----------
  const c1 = A("s2:Sebelumnya") - 0.25, c2 = K.s4 - 0.12;
  const sJan = A("s4:Janjinya"), sMul = A("s4:memulai"), sCos = A("s5:Costa"), sPes = A("s5:pesawat"), sSum = A("s5:sumbu"), sArs = A("s5:Arsitek");
  const s21 = A("s6:21"), sDan = A("s6:Danau"), sTen = A("s6:tenggelam"), sKini = A("s7:Kini"), sJuta = A("s7:juta");
  const HOOK = [[0, sSum + 1.6], [3.2, s21 + 0.6], [4.4, sTen + 0.8], [5.3, sJuta + 0.6]];
  const story = (t) => (t < c1 + 0.01 ? lerpKeys(HOOK, t) : t);
  const BS = sArs - 0.2, BE = s21; // build window
  const bw = (a, b) => BS + (BE - BS) * a, bu = (S, a, b) => clamp01((S - bw(a)) / (bw(b) - bw(a)));

  // ---------- camera ----------
  const M = (x, y, z, lx, ly, lz) => [X0 + x, y, z, X0 + lx, ly, lz];
  const keys = [
    [0, 4, 30, 62, 44, 8, 0], [3.2, 16, 38, 66, 50, 10, 0], [5.2, -12, 70, 98, 42, 4, 0], [c1 - 0.01, -26, 86, 108, 42, 3, 0],
    [c1, ...M(2, 182, 118, 2, 0, 4)],
    [A("s2:Rio") + 0.3, ...M(20, 78, 74, 17, 0, 14)],
    [A("s2:penduduk"), ...M(30, 96, 86, 23, 0, 6)],
    [K.s3, ...M(22, 86, 80, 16, 0, 8)],
    [A("s3:1827") + 0.4, ...M(22, 56, 58, 16, 0, 10)],
    [A("s3:Konstitusi"), ...M(16, 44, 46, 12, 0, 6)],
    [A("s3:dataran") + 0.5, ...M(16, 40, 44, 10.7, 1, 4)],
    [A("s3:Tapi"), ...M(14, 46, 50, 10.7, 1, 4)],
    [c2 - 0.01, ...M(6, 58, 62, 10, 0, 4)],
    [c2, -70, 8, 40, -20, 3, 0],
    [A("s4:Juscelino"), -64, 10, 32, -15, 3, 0],
    [sJan, -56, 17, 48, -10, 2, 0],
    [sMul, -44, 28, 62, -2, 1, 2],
    [K.s5 + 0.6, -60, 13, 44, -38, 5, 13],
    [A("s5:sayembara") + 0.4, -52, 20, 52, -34, 4, 10],
    [sCos, -168, 238, 4, 4, 0, 0],
    [A("s5:badannya"), -160, 244, 10, 6, 0, 0],
    [sArs + 1.9, 8, 34, 60, 44, 8, 0],
    [A("s5:putihnya"), 14, 40, 64, 46, 10, 0],
    [K.s6, 22, 48, 68, 46, 10, -2],
    [s21, 28, 20, 48, 54, 9, 0],
    [A("s6:diresmikan") + 0.5, 34, 26, 54, 60, 6, 2],
    [sDan + 1, 58, 34, 62, 98, -3, 2],
    [sTen, 80, 18, 38, 101, -4, -2],
    [K.s6e, 78, 22, 44, 100, -3, -2],
    [A("s7:UNESCO"), 30, 82, 122, 40, 0, 0],
    [sKini, -28, 128, 150, 24, 0, 0],
    [sJuta, -66, 168, 152, 20, 0, 0],
    [K.s8, -86, 186, 140, 20, 0, 0],
    [K.end, -150, 268, 62, 20, 0, 0],
    [K.dur, -156, 276, 56, 20, 0, 0],
  ];
  const camT = track(keys);
  const tgt = new THREE.Vector3();

  return (t) => {
    if (!fontsOk && document.fonts && document.fonts.check("800 40px Montserrat") && document.fonts.check("500 30px 'Work Sans'")) { fontsOk = true; for (const [tx, paint] of labels) { const c = tx.image, g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); paint(g, c.width, c.height); tx.needsUpdate = true; } }
    const S = story(t);
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.4, c[1] + Math.sin(t * 0.29) * 0.3, c[2] + Math.cos(t * 0.31) * 0.35);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    sun.position.set(tgt.x - 70, 58, tgt.z + 80); sun.target.position.copy(tgt);

    // ---- map station ----
    const onMap = t >= c1 - 0.1 && t < c2 + 0.1;
    coastT.forEach(([x, z, w, h, ci, k], i) => { const a = ci === 0 ? A("s2:Rio") - 0.2 : A("s2:penduduk") - 0.6 + ci * 0.12; const u = onMap ? back(clamp01((t - a - k * 0.04) / 0.45)) : 0; setI(coastM, i, x, MT, z, 0.3 * ci, w, h * u); });
    coastM.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < 60; i++) { const sp = coinSp[i % 3], k = Math.floor(i / 3), a = A("s2:kekayaan") - 0.3 + k * 0.05 + (i % 3) * 0.1; const u = onMap && t > a ? 1 : 0; setI(coinM, i, sp[0] + Math.sin(k) * 0.08, MT + 0.08 + k * 0.17 + (1 - eout(clamp01((t - a) / 0.2))) * 2, sp[1], k, u, u); }
    coinM.instanceMatrix.needsUpdate = true;
    pinRio.scale.setScalar(Math.max(1e-4, onMap ? back(clamp01((t - A("s2:Rio") + 0.1) / 0.4)) : 0));
    const tu = back(clamp01((t - A("s3:pedalaman") + 0.2) / 0.45)), grey = ramp(t, A("s3:Tapi"), A("s3:dibangun"));
    tgtG.scale.setScalar(Math.max(1e-4, tu)); ringMs.forEach((m, i) => { m.scale.setScalar(1 + 0.06 * Math.sin(t * 4 - i)); m.material.opacity = 1 - 0.55 * grey; });
    dot.material.color.set(RED).lerp(new THREE.Color("#8a7a70"), grey);
    const au = clamp01((t - A("s3:muncul")) / 1.4);
    arrowG.setDrawRange(0, Math.floor(eout(au) * arrowG.index.count / 6) * 6); arrow.visible = au > 0; head.visible = au >= 1; head.scale.setScalar(Math.max(1e-4, back(clamp01((t - A("s3:muncul") - 1.4) / 0.3))));
    const dfu = eout(ramp(t, A("s3:mewajibkan") - 0.2, A("s3:dataran") + 0.4));
    df.visible = dfu > 0.001; df.scale.set(1, Math.max(1e-3, dfu), 1);

    // ---- site ----
    // bulldozers clear the cerrado
    const front = -78 + 160 * clamp01((S - sJan) / (sMul + 0.6 - sJan));
    dozers.forEach((G, i) => { const x = front - i * 3; const on = S > sJan - 0.3 && S < sMul + 1.6; G.visible = on; G.position.x = x + Math.max(0, S - sMul - 0.6) * 16; G.position.y = Math.abs(Math.sin(t * 14 + i)) * 0.06; });
    const cw = Math.max(0.01, front + 78), cl = S >= sMul + 0.6 ? 1 : 0;
    clear.scale.set(cl ? 160 : cw, 132, 1); clear.position.x = cl ? 2 : -78 + cw / 2; clear.visible = S > sJan;
    shrubP.forEach(([x, z, s, ry, inSite], i) => { let u = 1; if (inSite) u = S < sJan ? 1 : 1 - clamp01((front - x) / 3); setI(shrubs, i, x, H(x, z), z, ry, s * u, s * u); });
    shrubs.instanceMatrix.needsUpdate = true;
    const dp = dust.pos; const dOn = S > sJan && S < sMul + 1.2;
    for (let i = 0; i < 260; i++) { const q = dSeed[i], life = (t * 0.7 + q[0]) % 1; dp[i * 3] = front - 3 - life * 10 + q[2] * 2; dp[i * 3 + 1] = dOn ? 0.5 + life * 5 : -60; dp[i * 3 + 2] = [-34, 0, 34][i % 3] + (q[1] - 0.5) * 6; }
    dust.commit(); dust.m.opacity = 0.42 * (1 - ramp(S, sMul + 0.6, sMul + 1.2));
    board.scale.setScalar(Math.max(1e-4, back(clamp01((S - sMul + 0.4) / 0.5))));
    // stakes
    const paved = ramp(S, sSum, sSum + 1.4);
    stakeP.forEach(([x, , z], i) => { const u = back(clamp01((S - sMul - i * 0.03) / 0.3)) * (1 - paved); setI(stakes, i, x, 0, z, 0.4, u, u); });
    stakes.instanceMatrix.needsUpdate = true;
    // plan lines
    const al = eout(clamp01((S - sCos + 0.2) / 1.6)), wl = eout(clamp01((S - sPes + 0.6) / 1.4));
    axisLine.scale.set(Math.max(0.01, aLen * al), 1, 1 + 2.2 * ramp(S, sSum - 0.1, sSum + 0.4) * (1 - paved)); axisLine.position.x = AX0 + (aLen * al) / 2; axisLine.visible = al > 0 && paved < 1;
    const rw = ramp(S, sSum + 0.3, sSum + 1.8);
    wingSeg.forEach(([x, z, L, yaw, d], i) => { const on = d <= wl ? 1 : 0; setI(wLine, i, x, 0.12, z, yaw, on * (1 - paved), on * (1 - paved)); dmy.scale.set(on ? 1 - paved * 0.999 : 1e-4, 1, on ? L : 1e-4); dmy.updateMatrix(); wLine.setMatrixAt(i, dmy.matrix); dmy.position.y = 0.06; dmy.scale.set(rw > 0 ? 3 * rw : 1e-4, 1, L); dmy.updateMatrix(); wRoad.setMatrixAt(i, dmy.matrix); });
    wLine.instanceMatrix.needsUpdate = wRoad.instanceMatrix.needsUpdate = true;
    axisRoad.scale.set(1, 1, Math.max(1e-3, rw)); axisRoad.visible = rw > 0;
    // buildings
    const pl = eout(bu(S, 0.0, 0.12)); plaza.scale.set(1, Math.max(1e-3, pl), Math.max(1e-3, pl)); plaza.visible = pl > 0;
    const pf = eout(bu(S, 0.05, 0.2)); platform.scale.set(1, Math.max(1e-3, pf), 1); platform.position.y = 0.9 * pf; platform.visible = pf > 0;
    for (let tw = 0; tw < 2; tw++) for (let k = 0; k < NF; k++) { const a = bw(0.12 + 0.62 * (k / NF) + tw * 0.03), u = clamp01((S - a) / 0.22); const y = k * FH + (1 - eout(u)) * 2; setI(tFloor, tw * NF + k, TWX, y, TWZ[tw], 0, u > 0 ? 1 : 0, u > 0 ? 1 : 0); setI(tGlass, tw * NF + k, TWX, y, TWZ[tw], 0, u > 0 ? 1 : 0, u > 0 ? 1 : 0); }
    tFloor.instanceMatrix.needsUpdate = tGlass.instanceMatrix.needsUpdate = true;
    minP.forEach(([x, z], i) => { const u = eout(bu(S, 0.1 + (i % 8) * 0.06, 0.32 + (i % 8) * 0.06)); setI(mins, i, x, 0, z, 0, u > 0 ? 1 : 0, u); });
    mins.instanceMatrix.needsUpdate = true;
    // crane cycle
    const cu = eout(clamp01((S - BS + 0.4) / 0.8)) * (1 - eout(clamp01((S - s21 - 0.4) / 1.2)));
    cranes.forEach((cr, i) => { cr.G.visible = cr.top.visible = cr.cable.visible = cr.hook.visible = cu > 0.01; cr.mast.scale.y = Math.max(0.01, cr.Hm * cu); cr.top.position.y = cr.Hm * cu; });
    const sau = bu(S, 0.38, 0.56), dmu = bu(S, 0.5, 0.68), bru = bu(S, 0.78, 0.92);
    const hang = (u) => (u <= 0 ? 1 : 1 - eout(u));
    { const y = 1.8 + 20 * hang(sau); saucer.position.y = y; saucer.visible = sau > 0; aim(crA, 50, -6.5, sau > 0 && sau < 1 ? y + 3.2 : crA.Hm * cu - 8 + Math.sin(t * 0.5) * 2, cu); if (!(sau > 0 && sau < 1)) crA.top.rotation.y = 1.2 + t * 0.12; }
    { const y = 1.8 + 20 * hang(dmu); dome.position.y = y; dome.visible = dmu > 0; aim(crB, 50, 6.5, dmu > 0 && dmu < 1 ? y + 2.9 : crB.Hm * cu - 8, cu); if (!(dmu > 0 && dmu < 1)) crB.top.rotation.y = -1.6 - t * 0.1; }
    { const y = 15 + 14 * hang(bru); bridge.position.y = y; bridge.visible = bru > 0; aim(crC, TWX, 0, bru > 0 && bru < 1 ? y + 1.6 : crC.Hm * cu - 8, cu); if (!(bru > 0 && bru < 1)) crC.top.rotation.y = 2.4 + t * 0.09; }
    let ribActive = -1;
    ribs.forEach((m, i) => { const u = bu(S, 0.2 + 0.5 * (i / NR), 0.2 + 0.5 * (i / NR) + 0.06); m.visible = u > 0; m.position.y = 12 * hang(u); if (u > 0 && u < 1) ribActive = i; });
    if (ribActive >= 0) { const a = (ribActive / NR) * Math.PI * 2; aim(crD, CAX + 4 * Math.cos(a), CAZ + 4 * Math.sin(a), 12 + ribs[ribActive].position.y, cu); } else { aim(crD, CAX, CAZ, crD.Hm * cu - 8, cu); crD.top.rotation.y = 0.7 + t * 0.11; }
    // cranes park their hooks when idle (yaw set after aim keeps the hook under the old trolley, so tuck it)
    for (const cr of cranes) { if (cr.hook.position.y > cr.Hm * cu - 9) { const yaw = cr.top.rotation.y, rr = cr.trolley.position.x; const hx = cr.x + Math.cos(-yaw) * rr, hz = cr.z + Math.sin(-yaw) * rr; cr.cable.position.x = cr.hook.position.x = hx; cr.cable.position.z = cr.hook.position.z = hz; } }
    cGlass.material.opacity = 0.42 * bu(S, 0.74, 0.86);
    // flags and confetti
    const fu = eout(clamp01((S - s21) / 1.3));
    flags.forEach((f, i) => { f.position.y = 1 + 7.6 * fu; f.visible = S > s21 - 0.1; });
    { const pa = flagGeo.attributes.position; for (let i = 0; i < pa.count; i++) { const x = flagBase[i * 3], y = flagBase[i * 3 + 1]; pa.setZ(i, Math.sin(x * 1.6 - t * 5 + y * 0.4) * 0.22 * (x / 3.2)); } pa.needsUpdate = true; flagGeo.computeVertexNormals(); }
    const cp = conf.pos;
    for (let i = 0; i < 420; i++) { const q = cSeed[i], tt = S - s21 - 0.4 - q[3] * 0.6; const on = tt > 0 && tt < 4.2; cp[i * 3] = 58 + q[0] * 14 + Math.sin(t * 3 + i) * 0.6; cp[i * 3 + 1] = on ? 22 - tt * (3 + q[2] * 3) : -60; cp[i * 3 + 2] = -12 + q[1] * 24 + Math.cos(t * 2.4 + i) * 0.6; }
    conf.commit();
    // village, lake
    huts.forEach(([x, z, h, ry], i) => { const u = back(clamp01((S - sMul - 0.2 - i * 0.06) / 0.35)); setI(hutM, i, x, h, z, ry, u, u); });
    hutM.instanceMatrix.needsUpdate = true;
    water.position.y = -6.65 + 5.9 * smooth(clamp01((S - sDan + 0.2) / (sTen + 0.8 - sDan + 0.2)));
    // workers
    wkP.forEach(([x, z, vil, ph], i) => {
      const on = vil ? S > sMul && S < sDan + 0.2 : S > sMul + 0.4 && S < s21 + 0.6;
      const xx = x + Math.sin(t * 0.5 + ph) * 1.6, zz = z + Math.cos(t * 0.43 + ph) * 1.6, yaw = Math.atan2(Math.cos(t * 0.5 + ph), -Math.sin(t * 0.43 + ph));
      const y = vil ? H(xx, zz) : (Math.abs(xx - 50) < 4.4 && Math.abs(zz) < 13 ? 1.8 * pf : 0.05);
      setI(wk, i, xx, y + Math.abs(Math.sin(t * 9 + ph)) * 0.06, zz, yaw, on ? 1 : 0, on ? 1 : 0);
    });
    wk.instanceMatrix.needsUpdate = true;
    // superquadras: a first ring with the build, the rest as the city grows
    const grow = (d) => (d < 0.35 ? bu(S, 0.6 + d, 0.75 + d) : clamp01((S - sKini - (d - 0.35) * 3.4) / 0.4));
    sqP.forEach(([x, z, d], i) => { const u = eout(grow(d)); setI(sqs, i, x, 0, z, Math.atan2(1, z / 75) * 0 + (z > 0 ? -0.25 : 0.25) * Math.abs(z) / 52, u > 0 ? 1 : 0, u); });
    trP.forEach(([x, z, d], i) => { const u = back(clamp01(grow(d) * 1.4 - 0.3)); setI(trees, i, x, 0, z, i, u, u); });
    sqs.instanceMatrix.needsUpdate = trees.instanceMatrix.needsUpdate = true;
    comp.render();
  };
}
