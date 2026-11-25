// EP36 SINGAPURA MERDEKA 1965: HISTORYMAP. A warm documentary map of the Malay Peninsula on an archive desk.
// Units: 1 unit = 10 km on the map (equirectangular around 103.6 E, 3.85 N; x east, z south), desk y = 0.
// Land is extruded cream paper with seeded gaussian relief (hillshade + contours), the sea is a dark blue chart with
// engraved coast lines. Singapore island is its own extruded piece (sgG) that lifts and slides apart across the
// Johor Strait. Sabah and Sarawak sit on a pinned inset card so the 1963 federation's 14 states are all on the desk.
//   s1 flash-forward: Singapore lifts off the map, SELAT JOHOR, 9 AGUSTUS 1965, a 1965 microphone at the map edge
//   s2 1963 wide: federation tint + outline, 14 brass pins drop, Singapore 581,5 km² / 1,82 juta
//   s3 two party boards rise at the south edge, a glowing crack runs along the strait, KERUSUHAN RAS 1964
//   s4 archive folder on a lectern at the west edge (ARSIP AUDIRA), tent cards Goh Keng Swee / Tun Razak,
//      15 JULI 1965, a dashed route Singapore - Kuala Lumpur, RAHASIA stamp and red ribbon
//   s5 vote board 126-0 (gavel), Singapore separates for real, its flag rises, the radio dial lights at 10.00
//   s6 faceless TV press table (name card, microphones, bowed silhouette), the film goes black-and-white
//   s7 the folder opens: DIUSIR? is struck, DIRUNDINGKAN is stamped; Malaysia's flag rises beside Singapore's
//   s8 wide pull-back: Singapore stands on its own.
// Everything is a pure function of t.

const FONTS = ['700 80px "Playfair Display"', 'italic 700 80px "Playfair Display"', '500 80px "IBM Plex Mono"', '600 80px "IBM Plex Mono"', '600 80px "IBM Plex Sans"', '700 80px "IBM Plex Sans"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "SINGAPURA 1965 AUDIRA ²"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* system fallback */ }
}

import * as THREE from "./three.module.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, eout, clamp01, smooth, canvasTex, stage, pts } from "./lib3d.js";
import { GEO } from "./geo.js";

const SERIF = '"Playfair Display", Georgia, serif', MONO = '"IBM Plex Mono", Consolas, monospace', SANS = '"IBM Plex Sans", Arial, sans-serif';
const SEA = "#17324A", LANDC = "#E8DCC0", RED = "#D7263D", FED = "#2A4D8F", GOLD = "#E0B85A", INK = "#2A2118", CREAM = "#F3EAD4";

// ---------- projection ----------
const LON0 = 103.6, LAT0 = 3.85, KZ = 11.1, KX = 11.1 * Math.cos((LAT0 * Math.PI) / 180);
const P = (lon, lat) => [(lon - LON0) * KX, -(lat - LAT0) * KZ];
const X0 = -46, X1 = 42, Z0 = -38, Z1 = 38, SW = X1 - X0, SH = Z1 - Z0;
const ramp = (t, a, b) => smooth((t - a) / (b - a));
const win = (t, a, b, fi = 0.4, fo = 0.4) => Math.min(clamp01((t - a) / fi), 1 - clamp01((t - b) / fo));

function clipRect(ring, x0, z0, x1, z1) {
  let out = ring;
  const edges = [[(p) => p[0] >= x0, (a, b) => [x0, a[1] + (b[1] - a[1]) * (x0 - a[0]) / (b[0] - a[0])]],
    [(p) => p[0] <= x1, (a, b) => [x1, a[1] + (b[1] - a[1]) * (x1 - a[0]) / (b[0] - a[0])]],
    [(p) => p[1] >= z0, (a, b) => [a[0] + (b[0] - a[0]) * (z0 - a[1]) / (b[1] - a[1]), z0]],
    [(p) => p[1] <= z1, (a, b) => [a[0] + (b[0] - a[0]) * (z1 - a[1]) / (b[1] - a[1]), z1]]];
  for (const [inside, cut] of edges) {
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const a = inp[(i + inp.length - 1) % inp.length], b = inp[i];
      if (inside(b)) { if (!inside(a)) out.push(cut(a, b)); out.push(b); } else if (inside(a)) out.push(cut(a, b));
    }
    if (!out.length) break;
  }
  return out;
}
function chaikin(r, n) {
  for (let k = 0; k < n; k++) {
    const o = [];
    for (let i = 0; i < r.length; i++) { const a = r[i], b = r[(i + 1) % r.length]; o.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]); }
    r = o;
  }
  return r;
}
function inPoly(x, z, r) {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, zi] = r[i], [xj, zj] = r[j]; if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c; }
  return c;
}

// main-sheet land (Borneo goes to the inset card)
const LAND = { mal: [], other: [] }, BORNEO = [];
let SGR = null;
for (const c of GEO) {
  for (const r0 of c.rings) {
    const r = r0[0][0] === r0[r0.length - 1][0] && r0[0][1] === r0[r0.length - 1][1] ? r0.slice(0, -1) : r0;
    const minLon = Math.min(...r.map((p) => p[0]));
    if (c.name === "Singapore") { SGR = chaikin(r.map(([lo, la]) => P(lo, la)), 3); continue; }
    if (minLon > 108.6) { BORNEO.push({ name: c.name, r }); continue; }
    const pr = clipRect(r.map(([lo, la]) => P(lo, la)), X0 + 0.25, Z0 + 0.25, X1 - 0.25, Z1 - 0.25);
    if (pr.length < 3) continue;
    (c.name === "Malaysia" ? LAND.mal : LAND.other).push(pr);
  }
}
const SGC = SGR.reduce((s, p) => [s[0] + p[0] / SGR.length, s[1] + p[1] / SGR.length], [0, 0]);
const PEN = LAND.mal.reduce((a, b) => (b.length > a.length ? b : a));

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

// grade: NaN guard, desaturation + scanlines for the 1965 TV beat, warm lift
const GRADE = {
  uniforms: { tDiffuse: { value: null }, sat: { value: 1 }, tv: { value: 0 } },
  vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
  fragmentShader: `uniform sampler2D tDiffuse;uniform float sat,tv;varying vec2 vUv;
void main(){vec4 c=texture2D(tDiffuse,vUv);if(any(isnan(c))||any(isinf(c)))c=vec4(0.,0.,0.,1.);
c.rgb=max(c.rgb,vec3(0.));float l=dot(c.rgb,vec3(.2126,.7152,.0722));vec3 bw=vec3(l)*vec3(1.02,1.,.94);
c.rgb=mix(bw,c.rgb,sat);float sl=.5+.5*sin(vUv.y*1920.*3.14159/2.6);c.rgb*=1.-tv*.10*sl;
vec2 d=vUv-.5;c.rgb*=1.-tv*.55*dot(d,d)*2.;gl_FragColor=c;}`,
};

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x120c08, exp: 1.0, bloom: [0.16, 0.4, 0.9], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  cam.near = 0.3; cam.far = 1600; cam.setViewOffset(1080, 1920, 0, -110, 1080, 1920); cam.updateProjectionMatrix();
  scene.background = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#0A0705"); gr.addColorStop(0.5, "#17100A"); gr.addColorStop(1, "#24170D"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.fog = new THREE.Fog(0x1a110a, 260, 620);
  const grade = new ShaderPass(GRADE); comp.insertPass(grade, 1); bp.threshold = 1.8;

  // ---------- lights: warm desk lamp key, soft fill, cool rim ----------
  scene.add(new THREE.HemisphereLight(0xfff0dc, 0x2a1c12, 0.7));
  const key = new THREE.DirectionalLight(0xffe0b4, 2.5);
  key.position.set(-70, 130, 95); key.target.position.set(-5, 0, 20);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -95, right: 95, top: 95, bottom: -95, near: 20, far: 420 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.05; key.shadow.radius = 3;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xa9c4ff, 0.7); rim.position.set(80, 50, -120); scene.add(rim);

  const std = (c, ro = 0.6, me = 0, ex = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: ro, metalness: me, ...ex });
  const add = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const basic = (o = {}) => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, ...o });
  const fibers = (g, w, h, seed, n, a = 0.05) => { const q = mulberry(seed); for (let i = 0; i < n; i++) { const v = q() < 0.5 ? "255,250,235" : "60,40,20"; g.fillStyle = `rgba(${v},${a * (0.3 + q() * 0.7)})`; g.fillRect(q() * w, q() * h, 1 + q() * 3, 1 + q() * 1.2); } };
  const fit = (g, s, font, px, maxW) => { let f = px; g.font = font(f); while (g.measureText(s).width > maxW && f > 12) { f -= 2; g.font = font(f); } return f; };
  function rbox(w, h, d, rr = 0.3, bev = 0.08) {
    const s = new THREE.Shape(), x = -w / 2 + bev, y = -h / 2 + bev, W = w - 2 * bev, H = h - 2 * bev, q = Math.min(rr, W / 2, H / 2);
    s.moveTo(x + q, y); s.lineTo(x + W - q, y); s.quadraticCurveTo(x + W, y, x + W, y + q); s.lineTo(x + W, y + H - q); s.quadraticCurveTo(x + W, y + H, x + W - q, y + H);
    s.lineTo(x + q, y + H); s.quadraticCurveTo(x, y + H, x, y + H - q); s.lineTo(x, y + q); s.quadraticCurveTo(x, y, x + q, y);
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.01, d - 2 * bev), bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 6 });
    g.translate(0, 0, -(d - 2 * bev) / 2); g.computeVertexNormals(); return g;
  }
  // a textured face plane (canvas) placed on a prop
  const face = (w, h, cw, paint, mo = {}) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), std(0xffffff, mo.ro ?? 0.8, 0, { map: canvasTex(cw, Math.round((cw * h) / w), paint), ...mo.ex }));

  // ---------- desk: dark walnut ----------
  const wood = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#3A2416"; g.fillRect(0, 0, w, h);
    const q = mulberry(5);
    for (let i = 0; i < 260; i++) { const y = q() * h, a = 0.03 + q() * 0.08, dark = q() < 0.6; g.strokeStyle = dark ? `rgba(20,10,4,${a})` : `rgba(150,96,58,${a})`; g.lineWidth = 1 + q() * 4; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.006 + i) * 6 + (q() - 0.5) * 2); g.stroke(); }
    fibers(g, w, h, 6, 20000, 0.05);
  }, [6, 6]);
  add(new THREE.PlaneGeometry(1100, 1100), std(0xffffff, 0.55, 0, { map: wood, envMapIntensity: 0.6 }), 0, -0.16, 0).rotation.x = -Math.PI / 2;

  // an older sheet under the map, slightly rotated
  const under = add(new THREE.BoxGeometry(SW + 8, 0.08, SH + 6), std(0xcdb88f, 0.9, 0, { map: canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#CDB88F"; g.fillRect(0, 0, w, h); fibers(g, w, h, 8, 9000, 0.08); }) }), -1.5, -0.12, 1.5);
  under.rotation.y = 0.035;

  // ---------- sea chart ----------
  const CW = 2048, CH = Math.round((CW * SH) / SW);
  const P2 = (x, z) => [((x - X0) / SW) * CW, ((z - Z0) / SH) * CH];
  const path = (g, ring) => { g.beginPath(); ring.forEach(([x, z], i) => { const [px, py] = P2(x, z); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); };
  const allMain = [...LAND.mal, ...LAND.other, SGR];
  const seaTex = canvasTex(CW, CH, (g, w, h) => {
    const gr = g.createRadialGradient(w * 0.55, h * 0.5, 50, w * 0.55, h * 0.5, w * 0.8);
    gr.addColorStop(0, "#21486A"); gr.addColorStop(0.6, SEA); gr.addColorStop(1, "#0F2234");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // engraved coast water-lines, outermost first
    g.lineJoin = "round";
    for (let k = 7; k >= 1; k--) {
      for (const rg of allMain) { path(g, rg); g.strokeStyle = `rgba(220,206,170,${0.07 + 0.035 * (8 - k)})`; g.lineWidth = k * 9; g.stroke(); }
      for (const rg of allMain) { path(g, rg); g.strokeStyle = k === 7 ? "#1A3B57" : "#1B3D5A"; g.lineWidth = k * 9 - 3; g.stroke(); }
    }
    fibers(g, w, h, 11, 120000, 0.045);
    // graticule
    g.strokeStyle = "rgba(225,210,175,.18)"; g.lineWidth = 2; g.setLineDash([10, 8]);
    for (let la = 1; la <= 7; la++) { const [, pz] = P2(0, P(LON0, la)[1]); g.beginPath(); g.moveTo(0, pz); g.lineTo(w, pz); g.stroke(); }
    for (let lo = 100; lo <= 107; lo++) { const [px] = P2(P(lo, LAT0)[0], 0); g.beginPath(); g.moveTo(px, 0); g.lineTo(px, h); g.stroke(); }
    g.setLineDash([]);
    g.font = `500 26px ${MONO}`; g.fillStyle = "rgba(232,220,192,.6)"; g.textBaseline = "middle";
    for (let la = 1; la <= 7; la++) { const [, pz] = P2(0, P(LON0, la)[1]); g.textAlign = "left"; g.fillText(`${la}°U`, 62, pz - 16); g.textAlign = "right"; g.fillText(`${la}°U`, w - 62, pz - 16); }
    for (let lo = 100; lo <= 107; lo++) { const [px] = P2(P(lo, LAT0)[0], 0); g.textAlign = "center"; g.fillText(`${lo}°T`, px, 70); g.fillText(`${lo}°T`, px, h - 70); }
    // double frame
    g.strokeStyle = "rgba(232,220,192,.55)"; g.lineWidth = 5; g.strokeRect(36, 36, w - 72, h - 72); g.lineWidth = 2; g.strokeRect(50, 50, w - 100, h - 100);
    // sea names
    const sname = (s, lo, la, rot, size) => { const [px, py] = P2(...P(lo, la)); g.save(); g.translate(px, py); g.rotate(rot); g.font = `italic 700 ${size}px ${SERIF}`; g.fillStyle = "rgba(225,212,180,.62)"; g.textAlign = "center"; g.fillText(s, 0, 0); g.restore(); };
    sname("Selat Melaka", 100.55, 3.35, -0.85, 46);
    sname("Laut Cina Selatan", 105.9, 5.0, 0, 50);
    // cartouche with the archive's name
    const [cx, cy] = P2(27, -2);
    g.save(); g.translate(cx, cy);
    g.fillStyle = "rgba(232,220,192,.92)"; g.fillRect(-300, -120, 600, 240);
    g.strokeStyle = "#5a4630"; g.lineWidth = 4; g.strokeRect(-288, -108, 576, 216); g.lineWidth = 1.5; g.strokeRect(-280, -100, 560, 200);
    g.fillStyle = INK; g.textAlign = "center"; g.font = `700 46px ${SERIF}`; g.fillText("PERSEKUTUAN MALAYSIA", 0, -42);
    g.font = `600 30px ${MONO}`; g.fillStyle = "#6b4f2e"; g.fillText("16 SEPTEMBER 1963", 0, 8);
    g.font = `italic 700 30px ${SERIF}`; g.fillStyle = "#8a2a20"; g.fillText("Peta Arsip AUDIRA", 0, 58);
    g.restore();
    // compass rose
    const [ox, oy] = P2(33, 14), R = 70;
    g.save(); g.translate(ox, oy); g.strokeStyle = "rgba(232,220,192,.6)"; g.lineWidth = 2.5;
    g.beginPath(); g.arc(0, 0, R, 0, 7); g.stroke(); g.beginPath(); g.arc(0, 0, R * 0.7, 0, 7); g.stroke();
    for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4, l = k % 2 ? R * 0.55 : R * 1.2; g.fillStyle = k === 0 ? "rgba(215,38,61,.9)" : "rgba(232,220,192,.6)"; g.beginPath(); g.moveTo(Math.sin(a) * l, -Math.cos(a) * l); g.lineTo(Math.sin(a + 0.35) * 13, -Math.cos(a + 0.35) * 13); g.lineTo(Math.sin(a - 0.35) * 13, -Math.cos(a - 0.35) * 13); g.closePath(); g.fill(); }
    g.font = `700 34px ${SERIF}`; g.fillStyle = "rgba(240,228,200,.85)"; g.textAlign = "center"; g.fillText("U", 0, -R * 1.5); g.restore();
    // honest scale bar: 100 km = 10 units
    const [s0x, sy] = P2(23, 34), [s1x] = P2(33, 34);
    g.fillStyle = "rgba(232,220,192,.8)"; g.fillRect(s0x, sy, (s1x - s0x) / 2, 10); g.strokeStyle = "rgba(232,220,192,.8)"; g.lineWidth = 2; g.strokeRect(s0x, sy, s1x - s0x, 10);
    g.font = `500 24px ${MONO}`; g.textAlign = "center"; g.fillText("0", s0x, sy - 18); g.fillText("100 km", s1x, sy - 18);
  });
  add(new THREE.BoxGeometry(SW, 0.14, SH), [std(0xd9c9a4, 0.9), std(0xd9c9a4, 0.9), std(0xffffff, 0.82, 0, { map: seaTex, envMapIntensity: 0.5 }), std(0xd9c9a4, 0.9), std(0xd9c9a4, 0.9), std(0xd9c9a4, 0.9)], (X0 + X1) / 2, -0.07, (Z0 + Z1) / 2);

  // ---------- land relief: seeded gaussian bumps -> hillshade, contours, bump map ----------
  const HW = 1024, HH = Math.round((HW * SH) / SW), HT = new Float32Array(HW * HH);
  const landRings = [...LAND.mal, ...LAND.other, SGR];
  const onLand = (x, z) => landRings.some((rg) => inPoly(x, z, rg));
  const bumps = [], bq = mulberry(361);
  const [ta, tb] = [P(101.0, 6.2), P(103.0, 2.4)]; // Titiwangsa spine
  for (let i = 0; i < 34; i++) { const u = i / 33, x = ta[0] + (tb[0] - ta[0]) * u + (bq() - 0.5) * 5, z = ta[1] + (tb[1] - ta[1]) * u + (bq() - 0.5) * 5; if (onLand(x, z)) bumps.push([x, z, 2.2 + bq() * 2.6, 0.6 + bq() * 0.6]); }
  for (let i = 0; i < 900 && bumps.length < 190; i++) { const x = X0 + bq() * SW, z = Z0 + bq() * SH; if (onLand(x, z)) bumps.push([x, z, 0.9 + bq() * 2.4, 0.15 + bq() * 0.45]); }
  const px2w = SW / HW;
  for (const [bx, bz, s, a] of bumps) {
    const R = s * 3, i0 = Math.max(0, Math.floor((bx - R - X0) / px2w)), i1 = Math.min(HW - 1, Math.ceil((bx + R - X0) / px2w));
    const j0 = Math.max(0, Math.floor((bz - R - Z0) / px2w)), j1 = Math.min(HH - 1, Math.ceil((bz + R - Z0) / px2w)), k2 = 1 / (2 * s * s);
    for (let j = j0; j <= j1; j++) { const z = Z0 + (j + 0.5) * px2w, dz = (z - bz) ** 2; for (let i = i0; i <= i1; i++) { const x = X0 + (i + 0.5) * px2w; HT[j * HW + i] += a * Math.exp(-((x - bx) ** 2 + dz) * k2); } }
  }
  const lc = document.createElement("canvas"); lc.width = HW; lc.height = HH;
  const hc = document.createElement("canvas"); hc.width = HW; hc.height = HH;
  { const g = lc.getContext("2d"), gh = hc.getContext("2d"), im = g.createImageData(HW, HH), ih = gh.createImageData(HW, HH), q = mulberry(17);
    for (let j = 0; j < HH; j++) for (let i = 0; i < HW; i++) {
      const k = j * HW + i, h0 = HT[k], hx = HT[j * HW + Math.min(HW - 1, i + 1)] - HT[j * HW + Math.max(0, i - 1)], hz = HT[Math.min(HH - 1, j + 1) * HW + i] - HT[Math.max(0, j - 1) * HW + i];
      let sh = 0.5 + (hx * 0.75 + hz * 0.75) * -3.2 * -1; sh = Math.max(0, Math.min(1, 0.55 - (hx + hz) * 5.5));
      const lev = Math.floor(h0 / 0.16), ct = h0 > 0.05 && (lev !== Math.floor(HT[j * HW + Math.min(HW - 1, i + 1)] / 0.16) || lev !== Math.floor(HT[Math.min(HH - 1, j + 1) * HW + i] / 0.16)) ? 0.8 : 1;
      const el = Math.min(1, h0 / 1.4), n = 0.97 + q() * 0.06;
      const f = (0.84 + 0.32 * sh) * ct * n;
      im.data[k * 4] = Math.min(255, (232 - 18 * el) * f); im.data[k * 4 + 1] = Math.min(255, (220 - 30 * el) * f); im.data[k * 4 + 2] = Math.min(255, (192 - 46 * el) * f); im.data[k * 4 + 3] = 255;
      const hv = Math.min(255, 40 + h0 * 150); ih.data[k * 4] = ih.data[k * 4 + 1] = ih.data[k * 4 + 2] = hv; ih.data[k * 4 + 3] = 255;
    }
    g.putImageData(im, 0, 0); gh.putImageData(ih, 0, 0); }
  const landTex = canvasTex(2048, Math.round((2048 * SH) / SW), (g, w, h) => {
    g.imageSmoothingEnabled = true; g.drawImage(lc, 0, 0, w, h); fibers(g, w, h, 23, 90000, 0.05);
    const lname = (s, lo, la, rot, size, sp = 0.18) => { const [x, z] = P(lo, la), px = ((x - X0) / SW) * w, py = ((z - Z0) / SH) * h; g.save(); g.translate(px, py); g.rotate(rot); g.font = `italic 700 ${size}px ${SERIF}`; g.fillStyle = "rgba(92,66,40,.55)"; g.textAlign = "center"; g.letterSpacing = `${sp}em`; g.fillText(s, 0, 0); g.restore(); };
    lname("SUMATRA", 100.1, 1.3, -0.75, 44);
    lname("THAILAND", 100.8, 6.85, 0, 40);
    lname("SEMENANJUNG MALAYA", 102.3, 4.4, -1.1, 40, 0.12);
  });
  const hTex = new THREE.CanvasTexture(hc);
  for (const tx of [landTex, hTex]) { tx.repeat.set(1 / SW, 1 / SH); tx.offset.set(-X0 / SW, Z1 / SH); tx.wrapS = tx.wrapT = THREE.ClampToEdgeWrapping; }
  const capMal = std(0xffffff, 0.78, 0, { map: landTex, bumpMap: hTex, bumpScale: 3 });
  const capOth = std(0xd2c9b8, 0.82, 0, { map: landTex, bumpMap: hTex, bumpScale: 3 });
  const sideM = std(0xc9b48a, 0.85);
  const shapeOf = (ring) => { const s = new THREE.Shape(); ring.forEach(([x, z], i) => (i ? s.lineTo(x, -z) : s.moveTo(x, -z))); return s; };
  const LH = 0.34;
  const extr = (rings, d = LH, bev = 0.05) => { const g = new THREE.ExtrudeGeometry(rings.map(shapeOf), { depth: d, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 2, curveSegments: 1 }); g.rotateX(-Math.PI / 2); return g; };
  add(extr(LAND.mal), [capMal, sideM]);
  add(extr(LAND.other), [capOth, sideM]);
  const tube = (pts3, rad, mat, closed = false, segs = 400) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts3, closed), segs, rad, 6, closed), mat);
  // federation outline (s2)
  const fedMat = basic({ color: 0x7fa6ff, opacity: 0 });
  const fedLine = tube(PEN.map(([x, z]) => new THREE.Vector3(x, LH + 0.12, z)), 0.16, fedMat, true, 900); scene.add(fedLine);

  // ---------- Singapore piece ----------
  const sgG = new THREE.Group(); sgG.position.set(SGC[0], 0, SGC[1]); scene.add(sgG);
  const sgLocal = SGR.map(([x, z]) => [x - SGC[0], z - SGC[1]]);
  const sgTex = canvasTex(512, 512, (g, w, h) => { g.drawImage(lc, ((SGC[0] - 3 - X0) / SW) * HW, ((SGC[1] - 3 - Z0) / SH) * HH, (6 / SW) * HW, (6 / SH) * HH, 0, 0, w, h); fibers(g, w, h, 29, 9000, 0.06); });
  sgTex.repeat.set(1 / 6, 1 / 6); sgTex.offset.set(0.5, 0.5);
  const capSG = std(0xffffff, 0.7, 0, { map: sgTex });
  const sgSide = std(0xb33a3a, 0.7);
  const sgMesh = add(extr([sgLocal], LH + 0.08, 0.06), [capSG, sgSide], 0, 0, 0, sgG);
  const sgLineMat = basic({ color: 0xff4a5c, opacity: 0 });
  const sgLine = tube(sgLocal.map(([x, z]) => new THREE.Vector3(x, LH + 0.2, z)), 0.07, sgLineMat, true, 200); sgG.add(sgLine);
  // Singapore's own base card (it stands alone from s5)
  const baseMat = std(0xf0e4c8, 0.85, 0, { transparent: true, opacity: 0 });
  const sgBase = add(new THREE.CylinderGeometry(3.2, 3.2, 0.12, 48), baseMat, 0, 0, 0, sgG); sgBase.scale.set(1.05, 1, 0.62);
  const baseRim = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.06, 6, 64), basic({ color: 0xd7263d, opacity: 0 })); baseRim.rotation.x = Math.PI / 2; baseRim.scale.set(1.05, 0.62, 1); sgG.add(baseRim);

  // strait border line (red, s5 onwards) along the Johor Strait
  const strait = [[103.58, 1.43], [103.66, 1.455], [103.74, 1.462], [103.82, 1.468], [103.9, 1.44], [103.98, 1.43], [104.06, 1.41]].map(([lo, la]) => { const [x, z] = P(lo, la); return new THREE.Vector3(x, 0.08, z); });
  const strMat = basic({ color: 0xff3b4e, opacity: 0 });
  const strLine = tube(strait, 0.09, strMat, false, 120); scene.add(strLine);

  // ---------- crack (s3): jagged ribbon with a glowing edge, revealed along its length ----------
  const crackPts = [[103.5, 1.47], [103.62, 1.452], [103.72, 1.462], [103.82, 1.466], [103.92, 1.44], [104.02, 1.42], [104.1, 1.3], [104.12, 1.12], [104.08, 0.9], [104.15, 0.62], [104.12, 0.45]].map(([lo, la]) => P(lo, la));
  const crack = (() => {
    const q = mulberry(64), V = [], U = [], S = [], I = [];
    const dense = [];
    for (let i = 0; i < crackPts.length - 1; i++) { const [ax, az] = crackPts[i], [bx, bz] = crackPts[i + 1]; for (let k = 0; k < 10; k++) { const u = k / 10; dense.push([ax + (bx - ax) * u, az + (bz - az) * u]); } }
    dense.push(crackPts[crackPts.length - 1]);
    let L = 0; const acc = [0];
    for (let i = 1; i < dense.length; i++) { L += Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]); acc.push(L); }
    dense.forEach(([x, z], i) => {
      const a = dense[Math.max(0, i - 1)], b = dense[Math.min(dense.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l;
      const j = (q() - 0.5) * 0.35, w = 0.12 + q() * 0.16;
      for (const s of [-1, 1]) { V.push(x + nx * (j + s * w), 0.06, z + nz * (j + s * w)); U.push(acc[i] / L); S.push(s); }
      if (i) { const o = (i - 1) * 2; I.push(o, o + 1, o + 2, o + 1, o + 3, o + 2); }
    });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(V, 3)); g.setAttribute("au", new THREE.Float32BufferAttribute(U, 1)); g.setAttribute("as", new THREE.Float32BufferAttribute(S, 1)); g.setIndex(I);
    const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { prog: { value: 0 }, glow: { value: 1 }, op: { value: 1 } },
      vertexShader: "attribute float au,as;varying float vU,vS;void main(){vU=au;vS=as;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader: "uniform float prog,glow,op;varying float vU,vS;void main(){if(vU>prog)discard;float c=1.-smoothstep(0.,.55,abs(vS));vec3 col=mix(vec3(2.4,.55,.22)*glow,vec3(.05,.02,.01),c);float tip=smoothstep(prog-.03,prog,vU);col+=vec3(3.,1.2,.5)*tip;gl_FragColor=vec4(col,op*(.55+.45*c));}" });
    const mesh = new THREE.Mesh(g, m); mesh.renderOrder = 4; scene.add(mesh); return m;
  })();

  // riot pulse rings around Singapore (s3)
  const rings = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 64), basic({ color: 0xff4a3a, opacity: 0, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.set(SGC[0], 0.5, SGC[1]); scene.add(m); return m; });

  // ---------- inset card: Sabah & Sarawak ----------
  const INS = 0.27, ILON = 114.3, ILAT = 4.0, IW = 30, IH = 21;
  const PI_ = (lo, la) => [(lo - ILON) * KX * INS, -(la - ILAT) * KZ * INS];
  const insG = new THREE.Group(); insG.position.set(24, 0.32, -25); insG.rotation.y = -0.035; scene.add(insG);
  const ICW = 1400, ICH = Math.round((ICW * IH) / IW), IP = (x, z) => [(x / IW + 0.5) * ICW, (z / IH + 0.5) * ICH];
  const ipath = (g, r) => { g.beginPath(); r.forEach(([lo, la], i) => { const [px, py] = IP(...PI_(lo, la)); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); };
  const insetPaint = (fedOnly) => (g, w, h) => {
    if (fedOnly) { g.clearRect(0, 0, w, h); for (const b of BORNEO) if (b.name === "Malaysia") { ipath(g, b.r); g.fillStyle = "rgba(90,130,230,.55)"; g.fill(); g.strokeStyle = "rgba(150,185,255,.95)"; g.lineWidth = 6; g.stroke(); } return; }
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#1E4566"); gr.addColorStop(1, "#15304A"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.lineJoin = "round";
    for (let k = 5; k >= 1; k--) { for (const b of BORNEO) { ipath(g, b.r); g.strokeStyle = `rgba(220,206,170,${0.08 + 0.04 * (6 - k)})`; g.lineWidth = k * 8; g.stroke(); } for (const b of BORNEO) { ipath(g, b.r); g.strokeStyle = "#1B3D5A"; g.lineWidth = k * 8 - 3; g.stroke(); } }
    for (const b of BORNEO) { ipath(g, b.r); g.fillStyle = b.name === "Malaysia" ? "#E8DCC0" : "#CFC6B2"; g.fill(); g.strokeStyle = "rgba(90,66,40,.7)"; g.lineWidth = 2.5; g.stroke(); }
    fibers(g, w, h, 41, 40000, 0.05);
    g.font = `italic 700 34px ${SERIF}`; g.fillStyle = "rgba(92,66,40,.6)"; g.textAlign = "center"; { const [px, py] = IP(...PI_(113.6, 0.9)); g.fillText("KALIMANTAN", px, py); }
    g.fillStyle = "rgba(10,20,30,.78)"; g.fillRect(0, 0, w, 92); g.font = `700 50px ${SERIF}`; g.fillStyle = "#F0E4C8"; g.textAlign = "left"; g.fillText("SABAH · SARAWAK", 34, 62);
    g.font = `500 28px ${MONO}`; g.textAlign = "right"; g.fillStyle = "#E0B85A"; g.fillText("bergabung 1963", w - 34, 58);
    g.strokeStyle = "rgba(232,220,192,.8)"; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20);
  };
  add(new THREE.BoxGeometry(IW, 0.12, IH), [std(0xe7d8b5, 0.9), std(0xe7d8b5, 0.9), std(0xffffff, 0.8, 0, { map: canvasTex(ICW, ICH, insetPaint(false)) }), std(0xe7d8b5, 0.9), std(0xe7d8b5, 0.9), std(0xe7d8b5, 0.9)], 0, 0, 0, insG);
  const insFedMat = basic({ map: canvasTex(ICW, ICH, insetPaint(true)), opacity: 0 });
  const insFed = new THREE.Mesh(new THREE.PlaneGeometry(IW, IH), insFedMat); insFed.rotation.x = -Math.PI / 2; insFed.position.y = 0.075; insG.add(insFed);
  const brass = std(0xc9a14a, 0.3, 1, { envMapIntensity: 1.1 });
  for (const [x, z] of [[-IW / 2 + 1.2, -IH / 2 + 1.2], [IW / 2 - 1.2, -IH / 2 + 1.2]]) { add(new THREE.SphereGeometry(0.45, 16, 12), brass, x, 0.35, z, insG); }

  // ---------- 14 state pins ----------
  const STATES = [[100.2, 6.44], [100.37, 6.12], [100.33, 5.41], [101.08, 4.6], [102.24, 6.13], [103.14, 5.33], [103.33, 3.82], [101.69, 3.14], [101.94, 2.73], [102.25, 2.19], [103.76, 1.6]];
  const pinHead = std(0x3e66c4, 0.25, 0.1, { envMapIntensity: 1.2 }), pinRed = std(0xd7263d, 0.25, 0.1, { envMapIntensity: 1.2 });
  const needleG = new THREE.CylinderGeometry(0.06, 0.02, 1.8, 8); needleG.translate(0, 0.9, 0);
  const mkPin = (mat, parent) => { const g = new THREE.Group(); add(needleG, brass, 0, 0, 0, g); add(new THREE.SphereGeometry(0.62, 18, 14), mat, 0, 1.9, 0, g); parent.add(g); return g; };
  const pins = STATES.map(([lo, la]) => { const [x, z] = P(lo, la); const g = mkPin(pinHead, scene); g.position.set(x, LH, z); return g; });
  { const [x, z] = PI_(116.07, 5.98); const g = mkPin(pinHead, insG); g.position.set(x, 0.06, z); pins.push(g); }
  { const [x, z] = PI_(110.35, 1.55); const g = mkPin(pinHead, insG); g.position.set(x, 0.06, z); pins.push(g); }
  const sgPin = mkPin(pinRed, sgG); sgPin.position.set(0.3, LH + 0.08, 0.2);
  pins.splice(11, 0, sgPin); // 14 pins, Singapore 12th

  // ---------- paper tags (3D, raised, facing camera, cream halo) ----------
  const haloTex = canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 10, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,244,220,.95)"); gr.addColorStop(0.55, "rgba(255,240,210,.45)"); gr.addColorStop(1, "rgba(255,240,210,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const inkMat = std(0x2a2118, 0.8);
  const cylG = new THREE.CylinderGeometry(1, 1, 1, 6);
  const tags = [];
  const camUp = new THREE.Vector3(), tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  function tag(title, sub, accent, w, anchor, lift, wfn) {
    const Wc = 1024, Hc = sub ? 340 : 230;
    const tex = canvasTex(Wc, Hc, (g, cw, ch) => {
      g.fillStyle = CREAM; g.fillRect(0, 0, cw, ch); fibers(g, cw, ch, title.length * 7, 6000, 0.06);
      g.fillStyle = accent; g.fillRect(0, 0, 34, ch);
      g.strokeStyle = "rgba(42,33,24,.45)"; g.lineWidth = 4; g.strokeRect(46, 12, cw - 58, ch - 24);
      g.textAlign = "left"; g.textBaseline = "middle"; g.fillStyle = INK;
      fit(g, title, (f) => `700 ${f}px ${SERIF}`, sub ? 128 : 140, cw - 140); g.fillText(title, 82, sub ? ch * 0.37 : ch * 0.53);
      if (sub) { fit(g, sub, (f) => `600 ${f}px ${MONO}`, 62, cw - 140); g.fillStyle = "#6b4a28"; g.fillText(sub, 84, ch * 0.77); }
    });
    const h = (w * Hc) / Wc;
    const G = new THREE.Group(); scene.add(G);
    const front = std(0xffffff, 0.75, 0, { map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.22 });
    const side = std(0xe9dcbc, 0.8, 0);
    const card = new THREE.Mesh(new THREE.BoxGeometry(w, h, Math.max(0.04, w * 0.012)), [side, side, side, side, front, side]); card.castShadow = true; card.renderOrder = 11; G.add(card);
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.5, h * 2.1), basic({ map: haloTex, opacity: 0 })); halo.position.z = -0.08; halo.renderOrder = 10; G.add(halo);
    const str = new THREE.Mesh(cylG, inkMat); scene.add(str);
    const o = { G, update(t) {
      const v = wfn(t); G.visible = str.visible = v > 0.01; if (!G.visible) return;
      const a = typeof anchor === "function" ? anchor() : anchor;
      camUp.set(0, 1, 0).applyQuaternion(cam.quaternion);
      G.quaternion.copy(cam.quaternion);
      G.position.set(a.x, a.y + lift * (0.8 + 0.2 * eout(v)), a.z);
      G.scale.setScalar(Math.max(0.001, eout(v)));
      halo.material.opacity = 0.45 * v;
      tmpB.copy(G.position).addScaledVector(camUp, -h * 0.5 * G.scale.x);
      tmpA.copy(a); const L = tmpA.distanceTo(tmpB);
      str.position.copy(tmpA).add(tmpB).multiplyScalar(0.5); str.quaternion.setFromUnitVectors(Y, tmpB.clone().sub(tmpA).normalize());
      const rr = w * 0.006; str.scale.set(rr, L, rr);
    } };
    tags.push(o); return o;
  }
  const sgTop = () => new THREE.Vector3(sgG.position.x, sgG.position.y + LH + 0.1, sgG.position.z);
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

  // ---------- props ----------
  const chrome = std(0xd9dde2, 0.18, 1, { envMapIntensity: 1.3 });
  const blackPl = std(0x111214, 0.35, 0.2);
  function mic(x, z, h = 5, ry = 0, tilt = 0.25, p = scene) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; p.add(g);
    add(new THREE.CylinderGeometry(1.1, 1.3, 0.3, 32), blackPl, 0, 0.15, 0, g);
    add(new THREE.CylinderGeometry(0.09, 0.09, h, 10), chrome, 0, h / 2, 0, g);
    const head = new THREE.Group(); head.position.y = h; head.rotation.x = tilt; g.add(head);
    const grille = canvasTex(256, 256, (c, w) => { c.fillStyle = "#c8ccd2"; c.fillRect(0, 0, w, w); c.strokeStyle = "rgba(20,22,26,.6)"; c.lineWidth = 3; for (let i = 0; i < w; i += 9) { c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } });
    add(new THREE.CapsuleGeometry(0.55, 0.9, 8, 20), std(0xffffff, 0.3, 0.9, { map: grille, envMapIntensity: 1.2 }), 0, 0.75, 0, head);
    add(new THREE.TorusGeometry(0.62, 0.07, 8, 28), chrome, 0, 0.75, 0, head).rotation.y = Math.PI / 2;
    return g;
  }
  mic(9, 41.5, 5.5, -0.35, 0.3);

  // party boards (s3)
  function easelBoard(x, z, ry, w, h, paint) {
    const root = new THREE.Group(); root.position.set(x, 0, z); root.rotation.y = ry; scene.add(root);
    const piv = new THREE.Group(); root.add(piv);
    const fr = add(rbox(w + 0.6, h + 0.6, 0.35, 0.2, 0.06), std(0x5a3a22, 0.5), 0, h / 2 + 0.6, 0, piv);
    const f = face(w, h, 1024, paint); f.position.set(0, h / 2 + 0.6, 0.19); f.castShadow = true; piv.add(f);
    add(new THREE.BoxGeometry(0.3, h * 0.9, 0.3), std(0x4a2f1b, 0.6), 0, h * 0.45, -1.4, root).rotation.x = -0.32;
    return { root, piv };
  }
  const partyPaint = (head, color, sub) => (g, w, h) => {
    g.fillStyle = CREAM; g.fillRect(0, 0, w, h); fibers(g, w, h, head.length * 5, 9000, 0.06);
    g.fillStyle = color; g.fillRect(0, 0, w, h * 0.42);
    g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; fit(g, head, (f) => `700 ${f}px ${SERIF}`, 150, w - 80); g.fillText(head, w / 2, h * 0.22);
    g.fillStyle = INK; fit(g, sub[0], (f) => `600 ${f}px ${SANS}`, 70, w - 90); g.fillText(sub[0], w / 2, h * 0.6);
    g.fillStyle = "#6b4a28"; fit(g, sub[1], (f) => `500 ${f}px ${MONO}`, 50, w - 90); g.fillText(sub[1], w / 2, h * 0.8);
    g.strokeStyle = "rgba(42,33,24,.5)"; g.lineWidth = 8; g.strokeRect(14, 14, w - 28, h - 28);
  };
  const bFed = easelBoard(-2, 41.5, 0.1, 8, 5.4, partyPaint("PEMERINTAH FEDERAL", FED, ["Aliansi", "Kuala Lumpur"]));
  const bPap = easelBoard(13.5, 41.5, -0.1, 8, 5.4, partyPaint("PAP", RED, ["Partai Lee Kuan Yew", "Singapura"]));

  // vote board + gavel (s5)
  const vote = easelBoard(21, 31, -0.2, 11, 8, () => {});
  const vc = document.createElement("canvas"); vc.width = 1024; vc.height = 745;
  const vTex = new THREE.CanvasTexture(vc); vTex.colorSpace = THREE.SRGBColorSpace; vTex.anisotropy = 8;
  vote.piv.children[1].material.map = vTex; vote.piv.children[1].material.needsUpdate = true;
  let vLast = "";
  const paintVote = (a, b) => {
    const k = a + "|" + b; if (k === vLast) return; vLast = k;
    const g = vc.getContext("2d"), w = vc.width, h = vc.height;
    g.fillStyle = "#1F2A27"; g.fillRect(0, 0, w, h); fibers(g, w, h, 90, 12000, 0.05);
    g.strokeStyle = "rgba(240,228,200,.6)"; g.lineWidth = 6; g.strokeRect(20, 20, w - 40, h - 40);
    g.fillStyle = "#F0E4C8"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 64px ${SERIF}`; g.fillText("DEWAN RAKYAT", w / 2, 92);
    g.font = `600 40px ${MONO}`; g.fillStyle = GOLD; g.fillText("9 AGUSTUS 1965", w / 2, 160);
    g.fillStyle = "rgba(240,228,200,.35)"; g.fillRect(w / 2 - 2, 220, 4, h - 270);
    g.font = `600 44px ${SANS}`; g.fillStyle = "#F0E4C8"; g.fillText("SETUJU", w / 4, 250); g.fillText("MENOLAK", (3 * w) / 4, 250);
    g.font = `700 260px ${SERIF}`; g.fillStyle = GOLD; g.fillText(a, w / 4, 480); g.fillStyle = "#F0E4C8"; g.fillText(b, (3 * w) / 4, 480);
    g.font = `500 30px ${MONO}`; g.fillStyle = "rgba(240,228,200,.7)"; g.fillText("pemisahan Singapura", w / 2, h - 70);
    vTex.needsUpdate = true;
  };
  paintVote("–", "–");
  const gavelRoot = new THREE.Group(); gavelRoot.position.set(13.2, 0, 35.5); gavelRoot.rotation.y = 0.5; scene.add(gavelRoot);
  const darkWood = std(0x4a2c18, 0.45, 0, { map: wood });
  add(new THREE.CylinderGeometry(1.5, 1.6, 0.6, 32), darkWood, 0, 0.3, 0, gavelRoot);
  const gav = new THREE.Group(); gav.position.set(-3.2, 0.9, 0); gavelRoot.add(gav);
  add(new THREE.CylinderGeometry(0.16, 0.2, 4.2, 12), darkWood, 2.1, 0, 0, gav).rotation.z = Math.PI / 2;
  const gh = add(new THREE.CylinderGeometry(0.6, 0.6, 2.0, 24), darkWood, 3.6, 0.4, 0, gav); gh.rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.64, 0.64, 0.18, 24), brass, 3.6, 0.4, 0.95, gav).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.64, 0.64, 0.18, 24), brass, 3.6, 0.4, -0.95, gav).rotation.x = Math.PI / 2;

  // radio + clock (s5)
  const radio = new THREE.Group(); radio.position.set(-24, 0, 45); radio.rotation.y = 0.28; scene.add(radio);
  const radWood = std(0x7a4a26, 0.42, 0, { map: wood, envMapIntensity: 0.8 });
  add(rbox(7.4, 4.8, 3.0, 0.9, 0.18), radWood, 0, 2.4, 0, radio);
  const dialMat = std(0xffffff, 0.5, 0, { emissive: 0xffb050, emissiveIntensity: 0 });
  const rf = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 3.9), dialMat);
  rf.position.set(0, 2.45, 1.52); radio.add(rf);
  { const g2 = canvasTex(1024, 605, (g, w, h) => {
    g.fillStyle = "#3a2414"; g.fillRect(0, 0, w, h);
    for (let y = 30; y < h - 30; y += 7) for (let x = 30; x < w * 0.56; x += 7) { g.fillStyle = (x + y) % 14 ? "#b89a6c" : "#8d7350"; g.fillRect(x, y, 6, 6); }
    g.fillStyle = "#f2e2b8"; g.fillRect(w * 0.6, h * 0.16, w * 0.36, h * 0.42);
    g.strokeStyle = "#5a3a1e"; g.lineWidth = 3; for (let i = 0; i <= 20; i++) { const x = w * 0.62 + i * (w * 0.32) / 20; g.beginPath(); g.moveTo(x, h * 0.42); g.lineTo(x, h * (i % 5 ? 0.48 : 0.52)); g.stroke(); }
    g.fillStyle = "#3a2414"; g.font = `600 34px ${MONO}`; g.textAlign = "center"; g.fillText("RADIO", w * 0.78, h * 0.25); g.font = `500 24px ${MONO}`; g.fillText("SINGAPURA", w * 0.78, h * 0.34);
    g.fillStyle = "#c0281e"; g.fillRect(w * 0.73, h * 0.37, 6, h * 0.17);
  }); dialMat.map = g2; dialMat.emissiveMap = g2; dialMat.needsUpdate = true; }
  for (const kx of [1.4, 2.6]) add(new THREE.CylinderGeometry(0.42, 0.46, 0.4, 24), std(0x2a1a10, 0.4), kx, 0.95, 1.6, radio).rotation.x = Math.PI / 2;
  const clock = new THREE.Group(); clock.position.set(-17.2, 0, 46); clock.rotation.y = 0.12; scene.add(clock);
  add(new THREE.BoxGeometry(3.6, 0.5, 1.6), darkWood, 0, 0.25, 0, clock);
  const cface = new THREE.Mesh(new THREE.CircleGeometry(1.6, 48), std(0xffffff, 0.6, 0, { map: canvasTex(512, 512, (g, w) => {
    g.fillStyle = "#F4ECD8"; g.beginPath(); g.arc(w / 2, w / 2, w / 2, 0, 7); g.fill(); g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 52px ${SERIF}`;
    for (let k = 1; k <= 12; k++) { const a = (k / 12) * Math.PI * 2; g.fillText(String(k), w / 2 + Math.sin(a) * w * 0.38, w / 2 - Math.cos(a) * w * 0.38); }
  }) }));
  cface.position.set(0, 2.3, 0.26); clock.add(cface);
  add(new THREE.TorusGeometry(1.65, 0.16, 12, 48), brass, 0, 2.3, 0.2, clock);
  add(new THREE.CylinderGeometry(1.7, 1.7, 0.4, 48), darkWood, 0, 2.3, 0, clock).rotation.x = Math.PI / 2;
  const hand = (len, wd) => { const g = new THREE.Group(); g.position.set(0, 2.3, 0.32); const m = new THREE.Mesh(new THREE.BoxGeometry(wd, len, 0.04), std(0x1a140e, 0.5)); m.position.y = len / 2; g.add(m); clock.add(g); return g; };
  const hH = hand(0.85, 0.12), hM = hand(1.25, 0.08);

  // magnifier + telegram, archive ambience
  const mag = new THREE.Group(); mag.position.set(36, 0.35, 44); mag.rotation.set(-Math.PI / 2 + 0.08, 0, 0.6); scene.add(mag);
  add(new THREE.TorusGeometry(3, 0.24, 12, 64), brass, 0, 0, 0, mag);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(3, 48), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.16, envMapIntensity: 1.5, clearcoat: 1 })); mag.add(lens);
  add(new THREE.CylinderGeometry(0.32, 0.4, 5, 16), darkWood, 0, -5.6, 0, mag);
  const tele = add(new THREE.BoxGeometry(9, 0.05, 6.4), std(0xffffff, 0.9, 0, { map: canvasTex(900, 640, (g, w, h) => {
    g.fillStyle = "#EDE3CB"; g.fillRect(0, 0, w, h); fibers(g, w, h, 77, 8000, 0.07);
    g.fillStyle = "#7a2a1e"; g.font = `700 64px ${SERIF}`; g.fillText("TELEGRAM", 50, 100); g.fillRect(50, 120, w - 100, 4);
    g.fillStyle = "rgba(42,33,24,.45)"; const q = mulberry(4); for (let y = 190; y < h - 50; y += 46) g.fillRect(50, y, 200 + q() * (w - 320), 16);
  }) }), -11, 0.03, 50);
  tele.rotation.y = 0.22;

  // ---------- archive folder on a lectern (west edge) ----------
  const F = V3(-37, 0, 11);
  const lect = new THREE.Shape(); lect.moveTo(-4.6, 0.3); lect.lineTo(4.6, 0.3); lect.lineTo(4.6, 6.2); lect.closePath();
  const lg = new THREE.ExtrudeGeometry(lect, { depth: 16, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 2 }); lg.rotateY(Math.PI / 2); lg.translate(-8, 0, 0);
  add(lg, std(0x3d2414, 0.5, 0, { map: wood }), F.x, -0.3, F.z);
  const folder = new THREE.Group(); folder.position.set(F.x, 3.08, F.z + 0.1); folder.rotation.x = -1.0; scene.add(folder);
  const manila = (seed, extra) => (g, w, h) => { g.fillStyle = "#DDB86A"; g.fillRect(0, 0, w, h); fibers(g, w, h, seed, 26000, 0.07); g.strokeStyle = "rgba(120,80,30,.35)"; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20); if (extra) extra(g, w, h); };
  add(new THREE.BoxGeometry(14, 10, 0.12), std(0xd8d0c0, 0.8, 0, { map: canvasTex(700, 500, manila(3)) }), 0, 0, 0, folder);
  const tab = add(new THREE.BoxGeometry(5.2, 1.3, 0.12), std(0xffffff, 0.8, 0, { map: canvasTex(520, 130, (g, w, h) => { manila(9)(g, w, h); g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 64px ${SANS}`; g.letterSpacing = "0.12em"; g.fillText("AUDIRA", w / 2, h / 2 + 2); }) }), 3.6, 5.6, 0, folder);
  const pageTex = canvasTex(1300, 920, (g, w, h) => {
    g.fillStyle = "#F4EFE3"; g.fillRect(0, 0, w, h); fibers(g, w, h, 12, 15000, 0.05);
    g.fillStyle = INK; g.font = `700 66px ${MONO}`; g.fillText("ALBATROSS FILE", 70, 120);
    g.font = `500 34px ${MONO}`; g.fillStyle = "#5b4630"; g.fillText("Goh Keng Swee · arsip 1965", 72, 180);
    g.fillRect(70, 205, w - 140, 3);
    const q = mulberry(31); g.fillStyle = "rgba(42,33,24,.32)"; for (let y = 262; y < h - 80; y += 42) g.fillRect(72, y, 300 + q() * (w - 450), 14);
  });
  add(new THREE.BoxGeometry(13.4, 9.4, 0.5), [std(0xf0e9d8, 0.9), std(0xf0e9d8, 0.9), std(0xf0e9d8, 0.9), std(0xf0e9d8, 0.9), std(0xcfc8bc, 0.85, 0, { map: pageTex }), std(0xf0e9d8, 0.9)], 0.2, -0.1, 0.32, folder);
  const stampMat = basic({ map: canvasTex(900, 240, (g, w, h) => { g.strokeStyle = "#C21D2E"; g.lineWidth = 14; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = "#C21D2E"; g.textAlign = "center"; g.textBaseline = "middle"; fit(g, "DIRUNDINGKAN", (f) => `700 ${f}px ${SANS}`, 150, w - 80); g.fillText("DIRUNDINGKAN", w / 2, h / 2 + 4); const q = mulberry(2); g.globalCompositeOperation = "destination-out"; for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(0,0,0,${0.3 + q() * 0.6})`; g.fillRect(q() * w, q() * h, 2 + q() * 4, 2 + q() * 3); } }), opacity: 0 });
  const stampImp = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.4), stampMat); stampImp.position.set(1.0, -1.4, 0.6); stampImp.rotation.z = 0.12; folder.add(stampImp);
  // the rubber stamp tool
  const stampTool = new THREE.Group(); folder.add(stampTool);
  add(new THREE.BoxGeometry(6, 1.8, 0.6), std(0x3a2414, 0.5), 1.0, -1.4, 0.3, stampTool);
  add(new THREE.BoxGeometry(6.2, 2.0, 0.2), std(0x8a1a22, 0.7), 1.0, -1.4, 0.0, stampTool);
  add(new THREE.CylinderGeometry(0.7, 0.9, 3, 20), std(0x6a3a1c, 0.45), 1.0, -1.4, 2.0, stampTool).rotation.x = Math.PI / 2;
  add(new THREE.SphereGeometry(1.1, 20, 16), std(0x6a3a1c, 0.45), 1.0, -1.4, 3.7, stampTool);
  // front cover on a hinge (left spine)
  const hinge = new THREE.Group(); hinge.position.set(-7, 0, 0.62); folder.add(hinge);
  const coverTex = canvasTex(1400, 1000, manila(5, (g, w, h) => {
    g.fillStyle = INK; g.font = `600 44px ${MONO}`; g.fillText("ARSIP AUDIRA · No. 36", 80, 110);
    g.fillStyle = "rgba(42,33,24,.85)"; g.fillRect(80, 300, w - 160, 170); g.fillStyle = "#F4EAD2"; g.font = `700 66px ${SERIF}`; g.textAlign = "center"; g.fillText("PERUNDINGAN PEMISAHAN", w / 2, 410);
    g.fillStyle = INK; g.font = `600 48px ${MONO}`; g.fillText("KUALA LUMPUR · 1965", w / 2, 560);
  }));
  const cover = add(new THREE.BoxGeometry(14, 10, 0.12), [std(0xddb86a, 0.8), std(0xddb86a, 0.8), std(0xddb86a, 0.8), std(0xddb86a, 0.8), std(0xd8d0c0, 0.78, 0, { map: coverTex }), std(0xd2ab5c, 0.85)], 7, 0, 0, hinge);
  const rahMat = basic({ map: canvasTex(800, 240, (g, w, h) => { g.strokeStyle = "#C21D2E"; g.lineWidth = 14; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = "#C21D2E"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 150px ${SANS}`; g.fillText("RAHASIA", w / 2, h / 2 + 6); const q = mulberry(8); g.globalCompositeOperation = "destination-out"; for (let i = 0; i < 1300; i++) { g.fillStyle = `rgba(0,0,0,${0.3 + q() * 0.6})`; g.fillRect(q() * w, q() * h, 2 + q() * 4, 2 + q() * 3); } }), opacity: 0 });
  const rah = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.9), rahMat); rah.position.set(10, -3.3, 0.08); rah.rotation.z = -0.1; hinge.add(rah);
  // red ribbon tie
  const ribMat = std(0xb01e2a, 0.55, 0, { transparent: true, opacity: 0 });
  const ribH = add(new THREE.BoxGeometry(14.3, 0.45, 1.2), ribMat, 0.2, 1.2, 0.3, folder), ribV = add(new THREE.BoxGeometry(0.45, 10.3, 1.2), ribMat, 3.2, 0, 0.3, folder);
  const knot = add(new THREE.TorusGeometry(0.6, 0.2, 10, 24), ribMat, 3.2, 1.2, 0.95, folder);
  // sticky note "DIUSIR?" on the cover
  const note = add(new THREE.BoxGeometry(4.8, 3.2, 0.06), std(0xffffff, 0.8, 0, { map: canvasTex(480, 320, (g, w, h) => { g.fillStyle = "#F2D45C"; g.fillRect(0, 0, w, h); fibers(g, w, h, 55, 3000, 0.07); g.fillStyle = "#2a2118"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `italic 700 104px ${SERIF}`; g.fillText("DIUSIR?", w / 2, h / 2 + 6); }) }), 10.4, 2.6, 0.12, hinge);
  note.rotation.z = 0.06;
  const strike = add(new THREE.BoxGeometry(4.6, 0.26, 0.03), std(0xc21d2e, 0.6, 0, { emissive: 0x6a0a10, emissiveIntensity: 0.4 }), 10.4, 2.6, 0.17, hinge);
  strike.rotation.z = 0.12;
  // tent name cards
  function tent(x, z, ry, l1, l2, color) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
    const tex = canvasTex(1024, 380, (c, w, h) => { c.fillStyle = CREAM; c.fillRect(0, 0, w, h); fibers(c, w, h, l1.length * 3, 5000, 0.06); c.fillStyle = color; c.fillRect(0, h - 40, w, 40); c.fillStyle = INK; c.textAlign = "center"; c.textBaseline = "middle"; fit(c, l1, (f) => `700 ${f}px ${SERIF}`, 120, w - 80); c.fillText(l1, w / 2, h * 0.36); c.fillStyle = "#6b4a28"; fit(c, l2, (f) => `600 ${f}px ${MONO}`, 56, w - 80); c.fillText(l2, w / 2, h * 0.7); });
    const fr = add(new THREE.BoxGeometry(8.4, 3.1, 0.06), [std(0xe9dcbc, 0.8), std(0xe9dcbc, 0.8), std(0xe9dcbc, 0.8), std(0xe9dcbc, 0.8), std(0xffffff, 0.75, 0, { map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.15 }), std(0xe9dcbc, 0.8)], 0, 1.5, 0.45, g); fr.rotation.x = -0.3;
    const bk = add(new THREE.BoxGeometry(8.4, 3.1, 0.06), std(0xe9dcbc, 0.8), 0, 1.5, -0.45, g); bk.rotation.x = 0.3;
    return g;
  }
  const tGoh = tent(-42, 20.5, 0.18, "GOH KENG SWEE", "Menteri Singapura", RED);
  const tRaz = tent(-32, 20.8, -0.12, "TUN RAZAK", "Kuala Lumpur", FED);

  // route Singapore -> Kuala Lumpur (s4)
  const [klx, klz] = P(101.69, 3.14);
  const routeCurve = new THREE.QuadraticBezierCurve3(V3(SGC[0], LH + 0.3, SGC[1]), V3((SGC[0] + klx) / 2 + 2, 9, (SGC[1] + klz) / 2 + 3), V3(klx, LH + 0.3, klz));
  const routeMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { prog: { value: 0 }, op: { value: 0 } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform float prog,op;varying vec2 vUv;void main(){if(vUv.x>prog)discard;float d=step(.45,fract(vUv.x*26.));gl_FragColor=vec4(vec3(2.2,1.55,.6),op*d);}" });
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(routeCurve, 120, 0.2, 6, false), routeMat));

  // ---------- flags ----------
  function flagMesh(w, h, paint) {
    const geo = new THREE.PlaneGeometry(w, h, 24, 10); geo.translate(w / 2, 0, 0);
    const base = geo.attributes.position.array.slice();
    const m = new THREE.Mesh(geo, std(0xffffff, 0.7, 0, { map: canvasTex(900, Math.round((900 * h) / w), paint), side: THREE.DoubleSide }));
    m.castShadow = true;
    m.wave = (t, amp) => { const p = geo.attributes.position.array; for (let i = 0; i < p.length; i += 3) { const x = base[i]; p[i + 2] = Math.sin(x * 1.7 - t * 3.2 + base[i + 1] * 0.6) * amp * (x / w); } geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); };
    return m;
  }
  const star = (g, cx, cy, n, ro, ri, rot = -Math.PI / 2) => { g.beginPath(); for (let i = 0; i < n * 2; i++) { const r2 = i % 2 ? ri : ro, a = rot + (i * Math.PI) / n; i ? g.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2) : g.moveTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); } g.closePath(); g.fill(); };
  const sgFlagPaint = (g, w, h) => {
    g.fillStyle = "#EF3340"; g.fillRect(0, 0, w, h / 2); g.fillStyle = "#FFFFFF"; g.fillRect(0, h / 2, w, h / 2);
    const cx = w * 0.2, cy = h * 0.25, R = h * 0.16;
    g.fillStyle = "#fff"; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill(); g.fillStyle = "#EF3340"; g.beginPath(); g.arc(cx + R * 0.32, cy, R * 0.9, 0, 7); g.fill();
    g.fillStyle = "#fff"; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5; star(g, cx + R * 0.42 + Math.cos(a) * R * 0.48, cy + Math.sin(a) * R * 0.48, 5, R * 0.17, R * 0.07); }
  };
  const myFlagPaint = (g, w, h) => {
    const s = h / 14; for (let i = 0; i < 14; i++) { g.fillStyle = i % 2 ? "#FFFFFF" : "#CC0001"; g.fillRect(0, i * s, w, s + 1); }
    const cw = w / 2, ch = s * 8; g.fillStyle = "#010066"; g.fillRect(0, 0, cw, ch);
    const cx = cw * 0.36, cy = ch / 2, R = ch * 0.36; g.fillStyle = "#FFCC00"; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill(); g.fillStyle = "#010066"; g.beginPath(); g.arc(cx + R * 0.24, cy, R * 0.82, 0, 7); g.fill();
    g.fillStyle = "#FFCC00"; star(g, cw * 0.66, cy, 14, ch * 0.3, ch * 0.13);
  };
  function pole(x, z, hgt, parent) {
    const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
    add(new THREE.CylinderGeometry(0.07, 0.09, hgt, 10), brass, 0, hgt / 2, 0, g);
    add(new THREE.SphereGeometry(0.2, 12, 10), brass, 0, hgt + 0.1, 0, g);
    add(new THREE.CylinderGeometry(0.5, 0.6, 0.25, 20), darkWood, 0, 0.12, 0, g);
    return g;
  }
  const sgPole = pole(-0.9, -0.3, 5, sgG); sgPole.position.y = LH + 0.08;
  const sgFlag = flagMesh(3.6, 2.4, sgFlagPaint); sgPole.add(sgFlag);
  const [mjx, mjz] = P(103.62, 1.62);
  const myPole = pole(mjx, mjz, 5, scene); myPole.position.y = LH;
  const myFlag = flagMesh(3.6, 1.8, myFlagPaint); myPole.add(myFlag);

  // ---------- TV press-conference table (s6), off the map to the south-west ----------
  const T = V3(-46, 0, 66);
  const press = new THREE.Group(); press.position.copy(T); scene.add(press);
  add(new THREE.BoxGeometry(26, 13, 0.5), std(0x2b2f36, 0.85, 0, { map: canvasTex(1024, 512, (g, w, h) => { g.fillStyle = "#2b2f36"; g.fillRect(0, 0, w, h); fibers(g, w, h, 70, 12000, 0.05); for (let x = 0; x < w; x += 64) { g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(x, 0, 18, h); } g.fillStyle = "rgba(230,225,215,.5)"; g.font = `600 40px ${MONO}`; g.textAlign = "center"; g.fillText("9 AGUSTUS 1965", w / 2, 70); }) }), 0, 6.5, -6.5, press);
  add(new THREE.BoxGeometry(14, 0.35, 4.6), std(0x3a2a1c, 0.45, 0, { map: wood }), 0, 4.2, 0, press);
  add(new THREE.BoxGeometry(14.2, 3.9, 0.12), std(0x24324a, 0.9), 0, 2.15, 2.25, press);
  for (const lx of [-6.4, 6.4]) add(new THREE.BoxGeometry(0.4, 4.1, 4), std(0x2a1c12, 0.6), lx, 2.05, 0, press);
  // faceless silhouette, seated, head slightly bowed
  const suit = std(0x17181c, 0.85), skinD = std(0x1e1b1a, 0.9);
  const sil = new THREE.Group(); sil.position.set(0, 0, -2.6); press.add(sil);
  add(new THREE.CapsuleGeometry(1.25, 2.0, 8, 20), suit, 0, 5.6, 0, sil).scale.set(1.25, 1, 0.75);
  add(new THREE.CylinderGeometry(0.35, 0.42, 0.7, 14), skinD, 0, 7.55, 0, sil);
  const headG = new THREE.Group(); headG.position.set(0, 7.85, 0); sil.add(headG);
  add(new THREE.SphereGeometry(0.85, 24, 18), skinD, 0, 0.75, 0.05, headG).scale.set(0.92, 1.1, 0.98);
  for (const s of [-1, 1]) { const a = add(new THREE.CapsuleGeometry(0.38, 1.8, 6, 12), suit, s * 1.55, 5.7, 0.7, sil); a.rotation.x = -1.0; a.rotation.z = s * 0.2; }
  add(new THREE.BoxGeometry(2.6, 0.3, 1.2), skinD, 0, 4.5, 1.5, sil);
  const nameCard = tent(0, 0, 0, "LEE KUAN YEW", "Perdana Menteri Singapura", RED); press.add(nameCard); nameCard.position.set(0, 4.37, 1.3); nameCard.scale.setScalar(0.62);
  for (const [mx, mr, lab] of [[-3.6, 0.35, "TV"], [-1.8, 0.15, "RADIO"], [1.8, -0.15, "PERS"], [3.6, -0.35, "TV"]]) {
    const m = mic(mx, 0.6, 2.4, mr, -0.55, press); m.position.y = 4.37; m.scale.setScalar(0.62);
    const pl = face(1.6, 0.6, 256, (g, w, h) => { g.fillStyle = "#e9e4da"; g.fillRect(0, 0, w, h); g.fillStyle = "#111"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 60px ${SANS}`; g.fillText(lab, w / 2, h / 2 + 2); });
    pl.position.set(0, 1.9, 0.8); m.add(pl);
  }
  const glass = add(new THREE.CylinderGeometry(0.4, 0.34, 1.2, 24, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.25, side: THREE.DoubleSide, envMapIntensity: 1.6 }), 5.4, 4.98, 0.8, press);
  // TV camera on a tripod in the foreground
  const tvc = new THREE.Group(); tvc.position.set(-4.4, 0, 14); tvc.rotation.y = 0.35; press.add(tvc);
  for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2; const l = add(new THREE.CylinderGeometry(0.1, 0.13, 7.2, 8), blackPl, Math.sin(a) * 1.3, 3.3, Math.cos(a) * 1.3, tvc); l.rotation.set(Math.cos(a) * 0.36, 0, -Math.sin(a) * 0.36); }
  add(rbox(2.6, 2.6, 4.2, 0.3, 0.1), std(0x1c1d20, 0.45, 0.4), 0, 7.6, 0, tvc);
  add(new THREE.CylinderGeometry(0.75, 0.9, 2.2, 24), blackPl, 0, 7.6, -3.0, tvc).rotation.x = Math.PI / 2;
  const tally = add(new THREE.SphereGeometry(0.22, 12, 10), std(0xff2a2a, 0.3, 0, { emissive: 0xff1a1a, emissiveIntensity: 0 }), 0.9, 9.0, -1.6, tvc);
  const pKey = new THREE.SpotLight(0xfff2e0, 0, 0, 0.42, 0.5, 0); pKey.position.set(T.x - 10, 22, T.z + 18); pKey.target.position.set(T.x, 5, T.z - 1); pKey.castShadow = true; pKey.shadow.mapSize.set(1024, 1024); scene.add(pKey, pKey.target);
  const pRim = new THREE.SpotLight(0xbcd2ff, 0, 0, 0.35, 0.6, 0); pRim.position.set(T.x + 6, 16, T.z - 14); pRim.target.position.set(T.x, 7, T.z - 2.6); scene.add(pRim, pRim.target);

  // dust motes in the lamp light
  const ND = 220, dust = pts(scene, ND, { color: 0xffe2b0, size: 0.35, add: true, opacity: 0.5 });
  const dq = mulberry(91), dB = []; for (let i = 0; i < ND; i++) dB.push([-60 + dq() * 110, 2 + dq() * 30, -10 + dq() * 80, dq() * 6.3, 0.2 + dq() * 0.5]);

  // ---------- tags ----------
  tag("SELAT JOHOR", "", "#6b4a28", 4.0, V3(0.6, 0.2, 26.4), 3.0, (t) => Math.max(win(t, A("s1:merdeka") + 0.5, A("s1:Ini") - 0.1, 0.4, 0.3), win(t, A("s5:pemisahan"), A("s5:Proklamasi"))));
  tag("SINGAPURA", "9 AGUSTUS 1965", RED, 5.4, sgTop, 2.9, (t) => win(t, A("s1:Ini") - 0.1, K.s2 + 0.2, 0.4, 0.3));
  tag("MALAYSIA", "16 SEPTEMBER 1963", FED, 22, V3(-12, LH, -4), 9, (t) => win(t, A("s2:Malaysia") - 0.2, A("s2:terkecil") - 0.2));
  tag("SINGAPURA", "", RED, 14, sgTop, 7, (t) => win(t, A("s2:Singapura") - 0.1, A("s2:terkecil") - 0.2));
  tag("SABAH", "", FED, 7, () => insG.localToWorld(V3(...[PI_(116.07, 5.98)[0], 0.1, PI_(116.07, 5.98)[1]])), 4.5, (t) => win(t, A("s2:bergabung") + 0.6, A("s2:terkecil") - 0.2));
  tag("SARAWAK", "", FED, 7, () => insG.localToWorld(V3(PI_(110.35, 1.55)[0], 0.1, PI_(110.35, 1.55)[1])), 4.5, (t) => win(t, A("s2:bergabung") + 0.8, A("s2:terkecil") - 0.2));
  tag("SINGAPURA", "581,5 km² · terkecil", RED, 6.2, () => sgTop().add(V3(-1.6, 0, 0)), 4.6, (t) => win(t, A("s2:terkecil") + 0.2, K.s2e));
  tag("1,82 JUTA", "penduduk terbanyak", RED, 5.2, () => sgTop().add(V3(2.2, 0, 0.6)), 2.2, (t) => win(t, A("s2:penduduknya"), K.s2e));
  tag("KERUSUHAN RAS", "1964", RED, 5.6, sgTop, 2.8, (t) => win(t, A("s3:kerusuhan") - 0.1, K.s3e + 0.2));
  tag("KUALA LUMPUR", "pertemuan rahasia", FED, 6.8, V3(klx, LH, klz), 4.6, (t) => win(t, A("s4:Kuala") - 0.2, A("s4:dirahasiakan")));
  tag("SINGAPURA", "merdeka · 9 AGUSTUS 1965", RED, 6.4, sgTop, 3.6, (t) => win(t, A("s5:Singapura"), A("s5:radio") - 0.6));
  tag("RADIO SINGAPURA", "pukul 10.00", GOLD, 6.4, V3(-24, 5.2, 45), 3.4, (t) => win(t, A("s5:radio") - 0.1, K.s5e + 0.3));
  tag("DIAKUI PERTAMA", "oleh Malaysia", FED, 6.4, V3((mjx + SGC[0]) / 2 - 0.6, 5, (mjz + SGC[1]) / 2 + 1), 2.6, (t) => win(t, A("s7:pertama") - 0.3, K.s7e + 0.3));
  tag("SINGAPURA", "berdiri sendiri sejak 1965", RED, 16, sgTop, 7.5, (t) => win(t, A("s8:lahir"), K.dur));
  tag("MALAYSIA", "", FED, 16, V3(-12, LH, -4), 7, (t) => win(t, A("s8:perpisahan"), K.dur));

  // ---------- camera keys [t, tx, ty, tz, dist, elevation°, azimuth°] ----------
  const sgx = SGC[0] + 0.4, sgz = SGC[1] + 0.8;
  const camT = track([
    [0, sgx, 0.5, sgz, 46, 50, 8], [A("s1:merdeka"), sgx, 0.6, sgz, 38, 46, 3], [A("s1:Singapura"), sgx + 0.2, 0.6, sgz + 0.2, 31, 42, -2], [K.s1e, sgx + 0.2, 0.6, sgz + 0.2, 29, 40, -4],
    [K.s2 + 1.0, 0, 0.3, 18, 90, 54, -2], [A("s2:Singapura") + 0.4, -3, 0, 3, 205, 60, 0], [A("s2:bagian"), -3, 0, 3, 196, 60, 0],
    [A("s2:penduduknya") + 0.2, sgx + 0.3, 0.6, sgz - 4, 46, 46, 0], [K.s2e, sgx + 0.3, 0.6, sgz - 4, 43, 45, 3],
    [K.s3 + 0.9, 5.5, 1.5, 34, 64, 27, -4], [A("s3:1964"), 5.5, 1.2, 33, 60, 28, -2], [A("s3:kerusuhan") + 0.4, sgx, 0.6, sgz, 36, 42, 0], [K.s3e, sgx, 0.6, sgz, 33, 44, 2],
    [K.s4 + 0.9, -16, 3, 22, 76, 44, -6], [A("s4:menteri"), -36.5, 3.6, 15, 50, 30, -4], [A("s4:Tun") + 0.3, -36, 3.4, 15, 50, 31, 2],
    [A("s4:Kuala") + 0.6, -25, 2, 12.5, 64, 40, 8], [A("s4:perpisahan") + 0.2, -24, 2, 13, 68, 42, 10], [A("s4:dirahasiakan") + 0.1, -36.5, 3.6, 14.5, 46, 30, -2], [K.s4e, -36.5, 3.6, 14.5, 43, 29, -4],
    [K.s5 + 1.4, -6, 3, 27, 82, 44, 0], [A("s5:suara"), 19.5, 4.4, 32, 41, 15, 10], [A("s5:nol") + 0.2, 19, 4.4, 32, 39, 16, 8],
    [A("s5:Singapura") + 0.3, 3.5, 1.5, 26, 46, 36, -2], [A("s5:radio") + 0.2, -18.5, 2, 39.5, 56, 30, -10],
    [K.s6 + 0.6, -30, 6, 55, 62, 22, -4], [A("s6:Lee"), T.x, 5.2, T.z + 0.5, 38, 9, 0], [K.s6e, T.x, 5.2, T.z + 0.5, 31, 8, 0],
    [K.s7 + 1.0, -40, 5, 36, 66, 32, -4], [A("s7:diusir"), -36.2, 3.8, 14.5, 46, 30, -2], [A("s7:dirundingkan") + 0.5, -36.2, 3.6, 14.5, 42, 30, 0],
    [A("s7:Malaysia") + 0.3, -17, 3, 22, 62, 36, 4], [A("s7:mengakui") + 0.3, sgx - 0.6, 2.5, sgz - 1.2, 36, 34, 2], [K.s7e, sgx - 0.6, 2.5, sgz - 1.2, 34, 34, 4],
    [A("s8:minggu"), -3, 0, 4, 200, 58, 0], [K.dur, -3, 0, 4, 212, 60, 0],
  ]);
  const tgt = new THREE.Vector3();

  return function draw(t) {
    const [tx, ty, tz, d, el, az] = camT(t);
    const e = (el * Math.PI) / 180, a = (az * Math.PI) / 180;
    tgt.set(tx, ty, tz);
    cam.position.set(tx + d * Math.cos(e) * Math.sin(a), ty + d * Math.sin(e), tz + d * Math.cos(e) * Math.cos(a));
    cam.lookAt(tgt);
    const camD = d;

    // federation tint + outline (s2), then a softer tint for the rest
    const fed = win(t, A("s2:Malaysia") - 0.3, K.s3, 0.7, 0.8);
    capMal.color.setRGB(1 - 0.2 * fed, 1 - 0.13 * fed, 1 - 0.02 * fed);
    fedMat.opacity = 0.9 * fed; insFedMat.opacity = fed;

    // Singapore separation: hook flash-forward (s1, rewinds at s2), then for real at s5
    const hk = ramp(t, A("s1:merdeka") - 0.2, A("s1:merdeka") + 1.5) * (1 - ramp(t, K.s2 - 0.1, K.s2 + 1.1));
    const mn = ramp(t, A("s5:nol") - 0.1, A("s5:Singapura") + 0.4);
    const sp = Math.max(hk, mn), settle = ramp(t, A("s5:Singapura") + 0.4, A("s5:Singapura") + 1.8);
    sgG.position.set(SGC[0] + 0.3 * sp, (1.0 - 0.45 * settle) * sp + 1.9 * Math.sin(Math.PI * sp), SGC[1] + 1.4 * sp);
    sgG.rotation.set(0.05 * Math.sin(Math.PI * sp), -0.08 * sp, -0.06 * Math.sin(Math.PI * sp));
    sgMesh.position.y = 0.12 * settle; sgPole.position.y = LH + 0.08 + 0.12 * settle; sgPin.position.y = LH + 0.08 + 0.12 * settle;
    baseMat.opacity = settle; sgBase.visible = baseRim.visible = settle > 0.01; sgBase.position.y = 0.06; baseRim.position.y = 0.12; baseRim.material.opacity = settle;
    sgLineMat.opacity = Math.max(0.95 * hk, 0.95 * mn, 0.35 * win(t, A("s3:kerusuhan") - 0.2, K.s3e));
    const red = Math.max(win(t, A("s3:kerusuhan") - 0.1, K.s3e, 0.3, 0.6) * (0.55 + 0.45 * Math.sin(t * 9)), 0.0);
    capSG.color.setRGB(1, 1 - 0.35 * red - 0.1 * mn, 1 - 0.38 * red - 0.12 * mn);
    strMat.opacity = 0.9 * Math.max(ramp(t, A("s5:pemisahan"), A("s5:nol")), win(t, A("s1:merdeka"), K.s2, 0.5, 0.5));

    // crack (s3)
    crack.uniforms.prog.value = ramp(t, A("s3:memburuk") - 0.2, A("s3:berselisih") + 0.6);
    crack.uniforms.op.value = 1 - ramp(t, K.s4 + 0.5, K.s4 + 1.6);
    crack.uniforms.glow.value = 0.7 + 0.5 * win(t, A("s3:kerusuhan") - 0.2, K.s3e) * (0.6 + 0.4 * Math.sin(t * 7));
    rings.forEach((m, i) => { const ph = ((t - A("s3:kerusuhan")) / 1.4 + i / 3) % 1, on = win(t, A("s3:kerusuhan") - 0.1, K.s3e - 0.1, 0.2, 0.4); const s = 2.5 + ph * 7; m.scale.set(s, s, s); m.material.opacity = on * (1 - ph) * 0.8; m.visible = on > 0.01; });

    // party boards rise for s3, fold away in s4
    const boardUp = (b, ta) => { const u = ramp(t, ta - 0.1, ta + 0.6) * (1 - ramp(t, A("s3:1964") + 0.6, A("s3:kerusuhan") + 0.2)); b.piv.rotation.x = -(1 - u) * Math.PI / 2 - 0.16 * u; b.root.visible = u > 0.01; b.root.scale.setScalar(0.4 + 0.6 * u); };
    boardUp(bPap, A("s3:Partai")); boardUp(bFed, A("s3:federal"));

    // pins: drop in one by one in s2, then stay; scaled with camera distance
    const p0 = A("s2:bergabung") - 0.3, p1 = A("s2:bagian");
    const ps = Math.max(0.4, Math.min(1.35, camD / 120));
    pins.forEach((g, i) => { const ti = p0 + ((p1 - p0) * i) / 13, u = clamp01((t - ti) / 0.45), on = t >= K.s2 - 0.01 ? 1 : 0; g.visible = u > 0 && on > 0; g.scale.setScalar(ps * (0.7 + 0.3 * eout(u))); g.children.forEach((c) => (c.position.y = c.userData.y0 ?? (c.userData.y0 = c.position.y))); g.children.forEach((c) => (c.position.y = c.userData.y0 + 5 * (1 - eout(u)))); });

    // s4: folder stage
    const tieU = ramp(t, A("s4:Perundingan") - 0.1, A("s4:Perundingan") + 0.5) * (1 - ramp(t, A("s7:arsip") - 0.6, A("s7:arsip") - 0.1));
    ribMat.opacity = tieU; ribH.visible = ribV.visible = knot.visible = tieU > 0.01; ribH.scale.x = 0.3 + 0.7 * tieU;
    const rs = ramp(t, A("s4:dirahasiakan") - 0.05, A("s4:dirahasiakan") + 0.2); rahMat.opacity = rs; rah.scale.setScalar(1 + 0.5 * (1 - rs));
    const gohU = ramp(t, A("s4:Goh") - 0.2, A("s4:Goh") + 0.4), razU = ramp(t, A("s4:Tun") - 0.2, A("s4:Tun") + 0.4);
    const tOut = 1 - ramp(t, K.s5, K.s5 + 0.6);
    tGoh.scale.setScalar(Math.max(0.001, eout(gohU) * tOut)); tRaz.scale.setScalar(Math.max(0.001, eout(razU) * tOut));
    routeMat.uniforms.prog.value = ramp(t, A("s4:menemui") - 0.2, A("s4:Kuala") + 0.4); routeMat.uniforms.op.value = win(t, A("s4:menemui") - 0.3, K.s5 + 0.6, 0.3, 0.8);

    // s5: votes, gavel, flag, radio, clock
    const nv = Math.round(126 * eout(clamp01((t - A("s5:seratus")) / Math.max(0.3, A("s5:enam") - A("s5:seratus")))));
    paintVote(t < A("s5:seratus") - 0.05 ? "–" : String(nv), t < A("s5:nol") - 0.05 ? "–" : "0");
    const vU = ramp(t, K.s5 - 0.2, K.s5 + 1.6); vote.piv.rotation.x = -(1 - vU) * Math.PI / 2 - 0.12 * vU; vote.root.visible = vU > 0.01;
    const gn = A("s5:nol"), gr1 = ramp(t, gn - 0.7, gn - 0.2), gd = ramp(t, gn - 0.2, gn - 0.02);
    gav.rotation.z = 0.15 + 0.9 * gr1 * (1 - gd);
    const flagUp = ramp(t, A("s5:kemerdekaan") - 0.2, A("s5:kemerdekaan") + 1.2);
    sgPole.visible = flagUp > 0.01; sgPole.scale.y = Math.max(0.01, flagUp); sgFlag.position.y = 4.9 - 1.2; sgFlag.wave(t, 0.22);
    const myUp = ramp(t, A("s7:Malaysia") - 0.1, A("s7:Malaysia") + 1.3);
    myPole.visible = myUp > 0.01; myPole.scale.y = Math.max(0.01, myUp); myFlag.position.y = 4.9 - 1.0; myFlag.wave(t + 1.3, 0.2);
    const radOn = ramp(t, A("s5:radio") - 0.4, A("s5:radio") + 0.3);
    dialMat.emissiveIntensity = 0.9 * radOn;
    const mm = -3 * (1 - ramp(t, A("s5:radio") - 1.0, A("s5:sepuluh")));
    hM.rotation.z = -((mm / 60) * Math.PI * 2); hH.rotation.z = -((10 + mm / 60) / 12) * Math.PI * 2;

    // s6: TV press conference, quiet, black and white
    const tvw = win(t, K.s6 + 0.4, K.s6e - 0.2, 1.0, 0.8);
    grade.uniforms.sat.value = 1 - 0.92 * tvw; grade.uniforms.tv.value = tvw;
    pKey.intensity = 2.0 * tvw + 0.2; pRim.intensity = 4.0 * tvw; tally.material.emissiveIntensity = 3 * tvw;
    headG.rotation.x = 0.18 + 0.16 * ramp(t, A("s6:menahan"), A("s6:terdiam") + 0.6);
    key.intensity = 2.5 - 1.1 * tvw;
    bp.strength = 0.07 * (1 - 0.5 * tvw);

    // s7: archive opens
    strike.scale.x = Math.max(0.001, ramp(t, A("s7:Tapi") - 0.1, A("s7:Tapi") + 0.35)); strike.visible = strike.scale.x > 0.01;
    const open = ramp(t, A("s7:arsip") - 0.1, A("s7:dibuka") + 0.6);
    hinge.rotation.y = -2.55 * open;
    const sh = A("s7:dirundingkan"), down = ramp(t, sh - 0.55, sh - 0.05), up = ramp(t, sh + 0.25, sh + 0.9);
    stampTool.visible = t > sh - 1.0 && t < sh + 1.1; stampTool.position.z = 0.35 + 6 * (1 - down) + 6 * up; stampTool.position.y = 0;
    stampMat.opacity = ramp(t, sh - 0.06, sh + 0.05) * 0.95;

    // dust
    for (let i = 0; i < ND; i++) { const b = dB[i]; dust.pos[i * 3] = b[0] + Math.sin(t * 0.13 * b[4] + b[3]) * 3; dust.pos[i * 3 + 1] = b[1] + Math.sin(t * 0.21 + b[3] * 2) * 1.5; dust.pos[i * 3 + 2] = b[2] + Math.cos(t * 0.11 * b[4] + b[3]) * 3; }
    dust.commit(); dust.m.opacity = 0.45 * (1 - tvw);

    for (const tg of tags) tg.update(t);
    comp.render();
  };
}
