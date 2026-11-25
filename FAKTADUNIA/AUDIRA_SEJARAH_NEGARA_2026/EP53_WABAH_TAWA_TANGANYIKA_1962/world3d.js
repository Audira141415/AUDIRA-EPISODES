// EP53 WATERCOLOR: the Tanganyika laughter epidemic (1962) as a gentle storybook diorama painted on cold-press paper.
// One continuous diorama on the western shore of Lake Victoria: a mission girls' boarding school (classroom and dorm as
// dollhouse cutaways), red-earth paths through banana groves to the village of Nshamba, a bench beside the path; plus a
// separate painted map board (Tanganyika, Uganda border, Bukoba, Kashasha). Laughter is never drawn as open mouths:
// it is rose brushstroke sound-arcs beside a head and soft rose ripple rings spreading over the ground.
// Stations (pure function of t, keyed to word anchors):
//   s1 hook: classroom full of sound-arcs, rings spreading out of the school over the land
//   s2 map board (Tanganyika highlight, Kashasha pin) -> page turn -> school on the lake shore
//   s3 classroom: 3 girls, then the arcs spread desk by desk
//   s4 dorm: symptom icons (tear, restless lines, faint, breath), the teacher at the door is untouched
//   s5 the girls walk home along the path, rings follow them to Nshamba; page turn -> classroom reopened
//   s6 map board: 14 school pins, the circle around Bukoba
//   s7 a girl on a bench between the school sign and the home sign: calm explanation
//   s8 golden wide shot, rings fade into lake ripples
const FONTS = ['700 80px Fraunces', 'italic 700 80px Fraunces', '800 80px Nunito', '700 80px Nunito'];
if (document.fonts && document.fonts.load) {
  try { await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "AUDIRA Kashasha 1962"))), new Promise((r) => setTimeout(r, 15000))]); } catch (e) { /* fallback */ }
}
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, clamp01, smooth, eout, back, stage } from "./lib3d.js";
import { GEO } from "./geo.js";

const V3 = THREE.Vector3;
const PAPER = "#FAF6EF", EDGE = "#ECE4D6", GR = "#3C3733", COB = "#4E7B9C", SAGE = "#6F9779", PINE = "#3F6449", ROSE = "#D7837C", ROSED = "#B8605A", OCH = "#E8AB48", UMB = "#7B5943", EARTH = "#B8643E", CREAM = "#F6EBD6", MAUVE = "#9C7A8E", LEAF = "#7FA35E";
const SKINS = ["#7A4B31", "#8C5A3B", "#6B4029", "#946345"];
const HEAD = "Fraunces, Georgia, serif", BODY = "Nunito, 'Segoe UI', sans-serif";
const R = mulberry(1962);
const J = (a) => (R() - 0.5) * a;
const hsh = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
const ramp = (t, a, b) => smooth((t - a) / Math.max(0.001, b - a));
const win = (t, a, b, fi = 0.35, fo = 0.35) => Math.min(clamp01((t - a) / fi), 1 - clamp01((t - b) / fo));

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

// ---------- watercolor painting on canvas (same technique as the series' storybook films) ----------
let U = 1;
const hexA = (c, a) => { const n = parseInt(c.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const shade = (c, k) => { const n = parseInt(c.slice(1), 16); const f = (v) => Math.min(255, (v * k) | 0); return "#" + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, "0")).join(""); };
function bbox(q) { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of q) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; }
const P = (pts, j = 0.6) => { const q = pts.map(([x, y]) => [x + J(j), y + J(j)]); const f = (g) => { g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); }; f.bb = bbox(q); return f; };
const E = (x, y, rx, ry, rot = 0) => { const f = (g) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }; f.bb = [x - rx, y - ry, x + rx, y + ry]; return f; };
const RR = (x, y, w, h, r = 0) => { const f = (g) => { g.beginPath(); g.roundRect(x, y, w, h, r); }; f.bb = [x, y, x + w, y + h]; return f; };
const CU = (bb, fn) => { const f = (g) => { g.beginPath(); fn(g); g.closePath(); }; f.bb = bb; return f; };

function wash(g, path, col, a = 0.85) {
  const [x0, y0, x1, y1] = path.bb || [0, 0, 100, 100];
  g.save(); g.fillStyle = col; g.filter = "blur(0.8px)";
  for (let k = 0; k < 2; k++) { g.save(); g.translate(J(1.6 / U), J(1.6 / U)); g.globalAlpha = a * 0.62; path(g); g.fill(); g.restore(); }
  g.restore();
  g.save(); path(g); g.clip();
  const sz = Math.max(x1 - x0, y1 - y0), n = Math.min(70, 6 + ((x1 - x0) * (y1 - y0) * U * U) / 9000);
  for (let i = 0; i < n; i++) {
    const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0), r = sz * (0.08 + R() * 0.3), dark = R() < 0.55;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, dark ? hexA(col, 0.2) : "rgba(255,253,247,.17)"); gr.addColorStop(1, dark ? hexA(col, 0) : "rgba(255,253,247,0)");
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  g.globalAlpha = a * 0.55; g.strokeStyle = shade(col, 0.72); g.lineWidth = 2.6 / U; g.filter = "blur(0.7px)"; path(g); g.stroke();
  g.restore();
}
function pencil(g, path, w = 1.7, a = 0.72) {
  g.save(); g.strokeStyle = GR; g.lineJoin = g.lineCap = "round"; g.globalAlpha = a; g.lineWidth = w / U; path(g); g.stroke();
  g.globalAlpha = a * 0.3; g.translate(0.9 / U, -0.7 / U); path(g); g.stroke(); g.restore();
}
function margin(g, path, w = 9) { g.save(); g.fillStyle = g.strokeStyle = PAPER; g.lineJoin = "round"; g.lineWidth = w / U; path(g); g.fill(); g.stroke(); g.restore(); }
function paint(g, parts, edge = true) {
  if (edge) for (const p of parts) margin(g, p[0]);
  for (const p of parts) if (p[1]) wash(g, p[0], p[1], p[2] ?? 0.86);
  for (const p of parts) if (p[3] !== false) pencil(g, p[0], p[3] || 1.7);
}
function line(g, pts, w = 1.4, a = 0.6, col = GR) {
  g.save(); g.strokeStyle = col; g.globalAlpha = a; g.lineWidth = w / U; g.lineCap = g.lineJoin = "round"; g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x + J(0.4 / U), y + J(0.4 / U)) : g.moveTo(x, y))); g.stroke(); g.restore();
}
// painted limb: pencil edge, then pigment, then a light wet edge
function limb(g, pts, w, col) {
  const st = (lw, c, a) => { g.save(); g.strokeStyle = c; g.globalAlpha = a; g.lineWidth = lw; g.lineCap = g.lineJoin = "round"; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore(); };
  st(w + 5, PAPER, 1); st(w + 2.2 / U, GR, 0.7); st(w, col, 0.95); st(w * 0.35, "rgba(255,250,240,.6)", 0.25);
}
function txt(g, s, x, y, size, col = GR, { font = HEAD, style = "italic", weight = 700, align = "center", a = 0.92 } = {}) {
  g.save(); g.font = `${style} ${weight} ${size}px ${font}`; g.fillStyle = col; g.globalAlpha = a; g.textAlign = align; g.textBaseline = "middle"; g.fillText(s, x, y); g.restore();
}
function paperBg(g, w, h, col = PAPER) {
  g.fillStyle = col; g.fillRect(0, 0, w, h);
  for (let i = 0; i < Math.min(60000, (w * h * U * U) / 90); i++) { g.fillStyle = `rgba(110,90,70,${R() * 0.045})`; g.fillRect(R() * w, R() * h, (1 + R() * 3) / U, 1 / U); }
}
function cv(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
function tex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function paintTex(pw, ph, lw, lh, draw) { const c = cv(pw, ph), g = c.getContext("2d"); U = pw / lw; g.scale(pw / lw, ph / lh); draw(g, lw, lh); U = 1; return tex(c); }
function cutMat(map, o = {}) {
  const m = new THREE.MeshStandardMaterial({ map, transparent: true, alphaTest: 0.04, roughness: 0.95, metalness: 0, side: THREE.DoubleSide, ...o });
  return m;
}
// painted cutout plane, bottom-centred unless o.center
function cut(w, h, res, lw, lh, draw, o = {}) {
  const map = paintTex(Math.max(8, Math.round(w * res)), Math.max(8, Math.round(h * res)), lw, lh, draw);
  return cutMesh(w, h, map, o);
}
function cutMesh(w, h, map, o = {}) {
  const geo = new THREE.PlaneGeometry(w, h); if (!o.center) geo.translate(0, h / 2, 0);
  const m = new THREE.Mesh(geo, cutMat(map));
  m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map, alphaTest: 0.5 });
  m.castShadow = o.cast !== false; m.receiveShadow = true;
  return m;
}
function spriteTex(map, w, h, col) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, color: col || 0xffffff }));
  s.scale.set(w, h, 1); return s;
}

// ---------- storybook people: head with a simple calm face, shoulders wider than hips, bent elbows and knees ----------
// pose: "desk" (hands on the desk), "sit" (hands in lap), "stand", "walk"
function person(g, o) {
  const skin = o.skin, dress = o.dress, hair = o.hair || "#2C2220", pose = o.pose || "stand", man = o.man;
  const lowSkirt = man ? 0 : (pose === "sit" ? 168 : 178);
  // legs (two segments, knees bent)
  const legCol = man ? (o.pants || "#55606B") : skin;
  if (pose === "sit") {
    limb(g, [[42, 150], [38, 176], [40, 236]], 8.5, legCol); limb(g, [[58, 150], [62, 176], [60, 236]], 8.5, legCol);
  } else if (pose === "walk") {
    limb(g, [[44, 150], [37, 196], [31, 238]], 8.5, legCol); limb(g, [[56, 150], [61, 196], [58, 238]], 8.5, legCol);
  } else {
    limb(g, [[44, 150], [41, 196], [43, 238]], 8.5, legCol); limb(g, [[56, 150], [59, 196], [57, 238]], 8.5, legCol);
  }
  const shoe = o.shoe || "#4A3A30";
  const fx = pose === "walk" ? [[30, 242], [59, 242]] : [[41, 242], [60, 242]];
  paint(g, fx.map(([x, y]) => [E(x, y, 7, 3.6), shoe, 0.95, 1]), false);
  // torso + skirt or trousers
  const parts = [];
  if (!man) parts.push([CU([24, 112, 76, lowSkirt + 2], (q) => { q.moveTo(37, 114); q.bezierCurveTo(33, 140, 27, 160, 24, lowSkirt); q.quadraticCurveTo(50, lowSkirt + 7, 76, lowSkirt); q.bezierCurveTo(73, 160, 67, 140, 63, 114); }), dress, 0.88]);
  else parts.push([P([[36, 118], [64, 118], [65, 160], [35, 160]]), o.pants || "#55606B", 0.9]);
  parts.push([P([[29, 72], [71, 72], [64, 122], [36, 122]]), shade(dress, 0.92), 0.9]); // shoulders 42 wide, waist 28
  if (o.wrap) parts.push([P([[30, 76], [70, 74], [66, 98], [34, 104]]), o.wrap, 0.88, 1.2]);
  paint(g, parts);
  if (o.kanga) { for (let y = 128; y < lowSkirt - 4; y += 9) line(g, [[30 + (y - 120) * 0.12, y], [70 - (y - 120) * 0.12, y + J(2)]], 1.6, 0.45, o.kanga); }
  if (!man && o.collar !== false) paint(g, [[P([[42, 72], [58, 72], [50, 84]]), "#FFFDF7", 0.95, 1]]);
  if (o.belt) paint(g, [[RR(36, 116, 28, 5, 2), o.belt, 0.9, false]]);
  // arms: upper arm in sleeve colour, bent elbow, forearm in skin
  const sl = shade(dress, 0.86);
  const arm = (s) => {
    const sx = 50 + s * 20;
    let el, hd;
    if (pose === "desk") { el = [50 + s * 24, 108]; hd = [50 + s * 9, 128]; }
    else if (pose === "sit") { el = [50 + s * 25, 112]; hd = [50 + s * 8, 140]; }
    else if (pose === "walk") { el = [50 + s * 23, 106 + s * 4]; hd = [50 + s * 17, 134 - s * 8]; }
    else { el = [50 + s * 24, 108]; hd = [50 + s * 19, 136]; }
    if (o.carry && s === 1) { el = [74, 104]; hd = [62, 92]; }
    limb(g, [[sx, 78], el], 8.5, sl);
    limb(g, [el, hd], 7.2, skin);
    paint(g, [[E(hd[0], hd[1], 3.8, 3.8), skin, 0.95, 1]], false);
  };
  arm(-1); arm(1);
  if (o.carry) paint(g, [[RR(52, 76, 22, 16, 4), o.carry, 0.92, 1.2]]);
  // neck, head, hair, face
  paint(g, [[RR(45, 58, 10, 16, 3), skin, 0.95, 1.1]]);
  if (o.hairBack) paint(g, [[E(50, 44, 16, 16), hair, 0.9, 1.2]]);
  paint(g, [[E(50, 47, 12.5, 14), skin, 0.95]]);
  if (o.headwrap) paint(g, [[CU([36, 26, 64, 46], (q) => { q.moveTo(37, 44); q.quadraticCurveTo(36, 26, 50, 25); q.quadraticCurveTo(66, 26, 63, 44); q.quadraticCurveTo(50, 38, 37, 44); }), o.headwrap, 0.92, 1.2]]);
  else if (o.bun) paint(g, [[E(50, 37, 13, 6.5), hair, 0.92, 1.1], [E(50, 29, 6, 5), hair, 0.92, 1.1]]);
  else paint(g, [[CU([37, 30, 63, 44], (q) => { q.moveTo(37.5, 44); q.quadraticCurveTo(36, 30, 50, 30.5); q.quadraticCurveTo(64, 30, 62.5, 44); q.quadraticCurveTo(50, 38, 37.5, 44); }), hair, 0.92, 1.1]]);
  // face: two dot eyes, a soft closed mouth, warm cheeks (never an open laughing mouth)
  g.save(); g.fillStyle = "#231A16"; g.globalAlpha = 0.9;
  for (const x of [45.2, 54.8]) { g.beginPath(); g.ellipse(x, 48, 1.35, 1.6, 0, 0, 6.3); g.fill(); }
  g.restore();
  line(g, [[47.4, 54.4], [50, 55.4], [52.6, 54.4]], 1.0, 0.65, "#4A2A22");
  wash(g, E(43.5, 52, 2.6, 1.6), ROSE, 0.42); wash(g, E(56.5, 52, 2.6, 1.6), ROSE, 0.42);
  if (o.glasses) { line(g, [[41, 48], [45, 46], [49, 48]], 0.9, 0.7); line(g, [[51, 48], [55, 46], [59, 48]], 0.9, 0.7); }
  // skirt folds
  if (!man) for (const x of [36, 50, 64]) line(g, [[x + (x - 50) * 0.05, 126], [x + (x - 50) * 0.4, lowSkirt - 3]], 1.0, 0.3);
}
const PW = 100, PH = 250;
function personTex(o) { return paintTex(220, 550, PW, PH, (g) => person(g, o)); }

// banana plant, mango tree, grass tufts
function banana(g, lw, lh, seed) {
  const q = mulberry(seed);
  const cx = lw / 2, base = lh - 4, top = lh * 0.45;
  paint(g, [[P([[cx - 8, base], [cx - 5, top], [cx + 5, top], [cx + 8, base]]), "#8C8A55", 0.9, 1.4]]);
  for (let y = top + 10; y < base; y += 14) line(g, [[cx - 6, y], [cx + 6, y + 3]], 0.9, 0.35);
  const n = 7 + Math.floor(q() * 3);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * 2.7 + (q() - 0.5) * 0.25, L = lh * (0.34 + q() * 0.14), droop = 0.35 + q() * 0.4;
    const ex = cx + Math.cos(a) * L, ey = top + Math.sin(a) * L + L * droop * Math.abs(Math.cos(a));
    const mx = cx + Math.cos(a) * L * 0.55, my = top + Math.sin(a) * L * 0.6 - L * 0.08;
    const wd = 11 + q() * 5, nx = -Math.sin(a) * wd, ny = Math.cos(a) * wd;
    const col = [LEAF, SAGE, "#93B56A", PINE][Math.floor(q() * 4)];
    const leaf = CU([Math.min(cx, ex) - 20, Math.min(top, ey) - 20, Math.max(cx, ex) + 20, Math.max(top, ey) + 20], (g2) => { g2.moveTo(cx, top); g2.quadraticCurveTo(mx + nx, my + ny, ex, ey); g2.quadraticCurveTo(mx - nx, my - ny, cx, top); });
    paint(g, [[leaf, col, 0.86, 1.3]], false);
    line(g, [[cx, top], [mx, my], [ex, ey]], 1.1, 0.5, PINE);
    for (let k = 0; k < 3; k++) { const u = 0.3 + q() * 0.6; const px = cx + (ex - cx) * u, py = top + (ey - top) * u; line(g, [[px, py], [px + nx * 0.8, py + ny * 0.8]], 0.8, 0.35, PAPER); }
  }
  if (q() < 0.6) { paint(g, [[E(cx + 10, top + 30, 9, 13), "#9DB45C", 0.9, 1.1], [E(cx + 12, top + 48, 5, 7), MAUVE, 0.9, 1]], false); }
}
function mango(g, lw, lh) {
  const cx = lw / 2;
  paint(g, [[P([[cx - 9, lh - 3], [cx - 5, lh * 0.5], [cx + 5, lh * 0.5], [cx + 9, lh - 3]]), UMB, 0.9, 1.3]]);
  const parts = [];
  for (let k = 0; k < 7; k++) parts.push([E(cx + J(lw * 0.5), lh * (0.3 + R() * 0.18), lw * (0.2 + R() * 0.1), lh * (0.14 + R() * 0.06)), [PINE, SAGE, "#5F8A57"][k % 3], 0.85, 1.2]);
  paint(g, parts, false);
}

// soft contact shadow
let BLOB;
function blob(w, d = w * 0.4, a = 0.3) {
  if (!BLOB) { const c = cv(128, 128), g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, "rgba(70,40,25,1)"); gr.addColorStop(1, "rgba(70,40,25,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); BLOB = tex(c); }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: BLOB, transparent: true, opacity: a, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.015; return m;
}

// ---------- post: paper fibre, pigment edge pooling ----------
const PAPERPASS = {
  uniforms: { tDiffuse: { value: null }, amt: { value: 1 } },
  vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
  fragmentShader: `uniform sampler2D tDiffuse;uniform float amt;varying vec2 vUv;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float L(vec3 c){return dot(c,vec3(.3,.59,.11));}
void main(){vec2 px=vUv*vec2(1080.,1920.);
vec2 w=vec2(n(px*.018),n(px*.018+9.))-.5;vec2 uv=vUv+w*.0018*amt;
vec4 c=texture2D(tDiffuse,uv);vec2 e=vec2(1.6/1080.,1.6/1920.);
float gx=L(texture2D(tDiffuse,uv+vec2(e.x,0.)).rgb)-L(texture2D(tDiffuse,uv-vec2(e.x,0.)).rgb);
float gy=L(texture2D(tDiffuse,uv+vec2(0.,e.y)).rgb)-L(texture2D(tDiffuse,uv-vec2(0.,e.y)).rgb);
float ed=clamp(length(vec2(gx,gy))*2.2,0.,1.);
c.rgb*=1.-.2*ed*amt;
float fib=n(px*.45)*.45+n(px*1.3)*.3+n(px*.08)*.25;
c.rgb*=mix(1.,.95+.08*fib,amt);
gl_FragColor=c;}`,
};

// ================= WORLD =================
export function create(canvas, K, AT) {
  const A = (k) => { const v = AT[k] !== undefined ? AT[k] : K[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const { r, scene, cam, comp } = stage(canvas, { bg: "#EFE7DA", exp: 0.85, bloom: [0.08, 0.5, 0.94], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.85;
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.25;
  comp.insertPass(new ShaderPass(PAPERPASS), 2);
  cam.near = 0.1; cam.far = 600; cam.updateProjectionMatrix();
  // sky: painted gradient, never a flat cream background
  scene.background = paintTex(270, 480, 270, 480, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#B7CAD6"); gr.addColorStop(0.45, "#E4DDCF"); gr.addColorStop(0.75, "#F3E3C8"); gr.addColorStop(1, "#EBD6B8");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) { const x = R() * w, y = R() * h * 0.5, rr = 20 + R() * 50; const q = g.createRadialGradient(x, y, 0, x, y, rr); q.addColorStop(0, "rgba(255,252,244,.35)"); q.addColorStop(1, "rgba(255,252,244,0)"); g.fillStyle = q; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  });
  const hemi = new THREE.HemisphereLight(0xfff4e2, 0xd9c09a, 1.45); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffeccc, 2.2);
  sun.position.set(-22, 34, 26); sun.target.position.set(4, 0, 2);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 5; sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 40, bottom: -40, near: 1, far: 140 });
  scene.add(sun, sun.target);
  const std = (color, rough = 0.9, ex = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...ex });
  const add = (o, x, y, z, p = scene) => { o.position.set(x, y, z); p.add(o); return o; };
  const boxM = (w, h, d, mat, x, y, z, p = scene) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.castShadow = m.receiveShadow = true; return add(m, x, y, z, p); };

  // ---------- ground (x -60..70, z -9..40), 10 canvas units per metre ----------
  const GX0 = -60, GZ0 = -9, GW = 130, GD = 49, GU = 10;
  const gx = (x) => (x - GX0) * GU, gz = (z) => (z - GZ0) * GU;
  const PATH_HOME = [[0, 4.5], [3, 7.5], [8, 9.2], [13, 9.6], [18, 8.6], [22, 7.2], [25.5, 6.5]];
  const PATH_DORM = [[-6.5, 4.2], [-10, 4.6], [-14, 4.2]];
  {
    const map = paintTex(2600, 980, GW * GU, GD * GU, (g, lw, lh) => {
      paperBg(g, lw, lh, "#EFE4CC");
      // grass washes
      for (let i = 0; i < 140; i++) { const x = R() * lw, y = 30 + R() * (lh - 30); wash(g, E(x, y, 40 + R() * 90, 20 + R() * 40, J(0.6)), [SAGE, LEAF, "#A8B878", "#C9C08A"][i % 4], 0.32 + R() * 0.2); }
      // sandy shore at the far edge
      wash(g, P([[0, 0], [lw, 0], [lw, 34], [lw * 0.7, 46], [lw * 0.4, 38], [0, 48]], 4), "#E6D2A6", 0.85);
      // compounds of red earth
      wash(g, E(gx(0), gz(1.5), 105, 62), "#C48A64", 0.38);
      wash(g, E(gx(-17), gz(1.5), 85, 55), "#C48A64", 0.34);
      wash(g, E(gx(26), gz(4), 110, 70), "#C48A64", 0.36);
      wash(g, E(gx(12), gz(10), 30, 16), EARTH, 0.45);
      const road = (pts, w) => {
        for (const [lwid, col, a] of [[w + 8, shade(EARTH, 0.85), 0.18], [w, "#C48A64", 0.42], [w * 0.4, "#DDA77F", 0.3]]) {
          g.save(); g.strokeStyle = col; g.globalAlpha = a; g.lineWidth = lwid; g.lineCap = g.lineJoin = "round"; g.filter = "blur(1px)"; g.beginPath();
          pts.forEach(([x, z], i) => (i ? g.lineTo(gx(x) + J(3), gz(z) + J(3)) : g.moveTo(gx(x), gz(z)))); g.stroke(); g.restore();
        }
      };
      road(PATH_HOME, 16); road(PATH_DORM, 13); road([[26, 6], [40, 14], [60, 30]], 14); road([[0, 4.5], [-1, 9]], 12);
      // grass tufts
      for (let i = 0; i < 1600; i++) { const x = R() * lw, y = 40 + R() * (lh - 40); const c = R() < 0.5 ? PINE : SAGE; line(g, [[x, y], [x - 2, y - 5 - R() * 4]], 1, 0.35, c); line(g, [[x + 1, y], [x + 3, y - 4 - R() * 4]], 1, 0.3, c); }
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(GW, GD), std(0xffffff, 0.96, { map }));
    m.rotation.x = -Math.PI / 2; m.position.set(GX0 + GW / 2, 0, GZ0 + GD / 2); m.receiveShadow = true; scene.add(m);
  }
  // lake + far shore
  {
    const map = paintTex(2600, 700, 2600, 700, (g, lw, lh) => {
      paperBg(g, lw, lh, "#E4EBEC");
      for (let i = 0; i < 6; i++) wash(g, P([[-10, lh * i / 6 - 10], [lw + 10, lh * i / 6 - 20], [lw + 10, lh * (i + 1.4) / 6], [-10, lh * (i + 1.3) / 6]], 8), COB, 0.18 + 0.05 * i);
      for (let i = 0; i < 520; i++) { const x = R() * lw, y = R() * lh, L = 12 + R() * 40; line(g, [[x, y], [x + L * 0.5, y - 1.5], [x + L, y]], 1.6, 0.4 + R() * 0.3, i % 3 ? "#FFFFFF" : shade(COB, 0.8)); }
    });
    const lake = new THREE.Mesh(new THREE.PlaneGeometry(260, 70), std(0xffffff, 0.85, { map }));
    lake.rotation.x = -Math.PI / 2; lake.position.set(5, -0.02, -44); lake.receiveShadow = true; scene.add(lake);
    const hills = cut(240, 30, 11, 2400, 300, (g, lw, lh) => {
      for (let k = 0; k < 3; k++) {
        const base = lh * (0.55 + k * 0.15), amp = 40 - k * 9, col = [MAUVE, COB, SAGE][k];
        const pts = [[0, lh]]; for (let x = 0; x <= lw; x += 40) pts.push([x, base - amp * (0.5 + 0.5 * Math.sin(x * 0.004 + k * 2) * Math.sin(x * 0.0017 + k))]); pts.push([lw, lh]);
        wash(g, P(pts, 3), col, 0.35 + k * 0.12);
      }
    }, { cast: false });
    add(hills, 5, -8, -82);
  }

  // ---------- building parts (dollhouse cutaway: front wall and front roof slope removed) ----------
  const wallTex = (w, h, o) => paintTex(Math.round(w * 60), Math.round(h * 60), w * 20, h * 20, (g, lw, lh) => {
    paperBg(g, lw, lh, "#F3EAD8");
    wash(g, RR(0, 0, lw, lh), CREAM, 0.6);
    wash(g, RR(0, lh * 0.78, lw, lh * 0.22), OCH, 0.55);
    line(g, [[0, lh * 0.78], [lw, lh * 0.78]], 1.3, 0.55);
    for (const wx of o.win || []) {
      const x = wx * lw, ww = 24, wh = 26, y = lh * 0.22;
      paint(g, [[RR(x - ww / 2, y, ww, wh, 1), "#9DB5C4", 0.85, 1.3]]);
      line(g, [[x, y], [x, y + wh]], 1.2, 0.6); line(g, [[x - ww / 2, y + wh / 2], [x + ww / 2, y + wh / 2]], 1.2, 0.6);
      paint(g, [[RR(x - ww / 2 - 9, y, 8, wh, 1), COB, 0.8, 1], [RR(x + ww / 2 + 1, y, 8, wh, 1), COB, 0.8, 1]]);
    }
    if (o.door) { const x = o.door * lw; paint(g, [[RR(x - 13, lh * 0.3, 26, lh * 0.7, 2), UMB, 0.85, 1.4]]); }
    if (o.board) { paint(g, [[RR(lw * 0.18, lh * 0.2, lw * 0.64, lh * 0.42, 2), "#3E4A44", 0.95, 1.5]]); txt(g, o.board, lw / 2, lh * 0.38, 9, "#F2EFE6", { font: HEAD, a: 0.85 }); }
    if (o.sign) { paint(g, [[RR(lw * 0.2, 4, lw * 0.6, 17, 2), "#FFFBF2", 0.97, 1.3]]); txt(g, o.sign, lw / 2, 13, 9.5, ROSED, { font: HEAD }); }
    for (let i = 0; i < 12; i++) { const x = R() * lw, y = R() * lh * 0.7; line(g, [[x, y], [x + 6 + R() * 10, y + J(2)]], 0.7, 0.18); }
  });
  const roofTex = paintTex(512, 256, 256, 128, (g, lw, lh) => {
    paperBg(g, lw, lh, "#E8D2BE");
    wash(g, RR(0, 0, lw, lh), "#B86A4A", 0.6);
    for (let x = 0; x < lw; x += 6) line(g, [[x, 0], [x + J(1), lh]], 1.1, 0.28, shade("#B86A4A", 0.6));
    for (let i = 0; i < 14; i++) wash(g, E(R() * lw, R() * lh, 18 + R() * 20, 8 + R() * 10), "#8E5A44", 0.25);
  });
  const floorTex = paintTex(512, 512, 256, 256, (g, lw, lh) => { paperBg(g, lw, lh, "#E6CDB2"); wash(g, RR(0, 0, lw, lh), "#C88B66", 0.45); for (let y = 0; y < lh; y += 32) line(g, [[0, y], [lw, y + J(2)]], 0.8, 0.2); });
  function house(cx, cz, w, d, h, o) {
    const G = new THREE.Group(); G.position.set(cx, 0, cz); scene.add(G);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), std(0xffffff, 0.95, { map: floorTex })); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.03; fl.receiveShadow = true; G.add(fl);
    const wm = (tw, th, oo) => std(0xffffff, 0.95, { map: wallTex(tw, th, oo) });
    boxM(w, h, 0.22, wm(w, h, { win: o.backWin, sign: o.sign }), 0, h / 2, -d / 2, G);
    boxM(0.22, h, d, wm(d, h, { win: o.sideWin, board: o.board }), -w / 2, h / 2, 0, G);
    boxM(0.22, h, d, wm(d, h, { win: o.sideWin2 || o.sideWin, door: o.door }), w / 2, h / 2, 0, G);
    boxM(w, 0.55, 0.22, std(0xe8cf9a), 0, 0.27, d / 2, G); // low front plinth so the cutaway reads as a cut
    // back roof slope + ridge beam
    const ridgeY = h + 1.5, sl = Math.hypot(d / 2 + 0.6, 1.5);
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(w + 1.2, sl), std(0xffffff, 0.9, { map: roofTex, side: THREE.DoubleSide }));
    roof.position.set(0, h + 0.75, -d / 4 - 0.3); roof.rotation.x = -Math.PI / 2 + Math.atan2(1.5, d / 2 + 0.6); roof.castShadow = roof.receiveShadow = true; G.add(roof);
    boxM(w + 1.2, 0.18, 0.18, std(0x6b4a36), 0, ridgeY, 0, G);
    // gable triangles
    const gs = new THREE.Shape(); gs.moveTo(-d / 2, 0); gs.lineTo(0, 1.5); gs.lineTo(d / 2, 0); gs.lineTo(-d / 2, 0);
    for (const s of [-1, 1]) { const gm = new THREE.Mesh(new THREE.ShapeGeometry(gs), std(0xf1e4cc, 0.95, { side: THREE.DoubleSide })); gm.rotation.y = Math.PI / 2; gm.position.set(s * w / 2, h, 0); gm.castShadow = true; G.add(gm); }
    G.add(blob(w + 3, d + 3, 0.22));
    return G;
  }

  // ================= SCHOOL CLASSROOM at (0,0,0) =================
  const school = house(0, 0, 12, 7, 3.4, { backWin: [0.18, 0.4, 0.6, 0.82], sideWin: [0.75], board: "30 Januari 1962", door: 0.3, sign: "SEKOLAH ASRAMA PUTRI · KASHASHA" });
  const deskTex = paintTex(256, 64, 256, 64, (g, lw, lh) => { paperBg(g, lw, lh, "#D7B48A"); wash(g, RR(0, 0, lw, lh), UMB, 0.55); for (let y = 6; y < lh; y += 10) line(g, [[0, y], [lw, y + J(2)]], 0.9, 0.3); });
  const deskM = std(0xffffff, 0.9, { map: deskTex });
  const GIRLV = [];
  const dresses = [COB, COB, "#5B88A8", COB];
  for (let i = 0; i < 8; i++) GIRLV.push(personTex({ skin: SKINS[i % 4], dress: dresses[i % 4], pose: "desk", hairBack: i % 3 === 1 }));
  const GIRLS = []; // {G, m, arc, x, z, ph}
  const geoP = (h) => { const gg = new THREE.PlaneGeometry(h * 0.4, h); gg.translate(0, h / 2, 0); return gg; };
  const gGeo = geoP(1.5);
  const arcTex = paintTex(256, 128, 256, 128, (g, w, h) => {
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
      const rr = 22 + k * 15; g.save(); g.strokeStyle = "#fff"; g.globalAlpha = 0.95 - k * 0.22; g.lineWidth = 7 - k * 1.5; g.lineCap = "round"; g.filter = "blur(0.6px)";
      g.beginPath(); g.arc(w / 2 + s * 30, h / 2, rr, s > 0 ? -0.75 : Math.PI - 0.75, s > 0 ? 0.75 : Math.PI + 0.75); g.stroke(); g.restore();
    }
  });
  function makePerson(map, h, x, y, z, parent = scene, arcs = true) {
    const G = new THREE.Group(); G.position.set(x, y, z); parent.add(G);
    const m = new THREE.Mesh(h === 1.5 ? gGeo : geoP(h), cutMat(map)); m.castShadow = true; m.receiveShadow = true;
    m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map, alphaTest: 0.5 });
    G.add(m);
    let arc = null;
    if (arcs) { arc = spriteTex(arcTex, h * 1.0, h * 0.5, new THREE.Color(ROSED)); arc.position.set(0, h * 0.815, 0.05); arc.material.opacity = 0; arc.visible = false; G.add(arc); }
    return { G, m, arc, h };
  }
  {
    const rows = [-1.9, -0.2, 1.5], cols = [-4.2, -1.4, 1.4, 4.2];
    let k = 0;
    rows.forEach((z, ri) => cols.forEach((x, ci) => {
      boxM(2.3, 0.09, 0.8, deskM, x, 0.8, z);
      boxM(2.3, 0.5, 0.06, deskM, x, 0.52, z + 0.38);
      for (const s of [-1, 1]) boxM(0.07, 0.75, 0.75, deskM, x + s * 1.1, 0.4, z);
      for (const s of [-0.55, 0.55]) {
        const p = makePerson(GIRLV[k % 8], 1.5, x + s + J(0.08), 0.18, z - 0.3);
        p.k = k; p.ph = hsh(k, 3) * 6.28; GIRLS.push(p); k++;
      }
    }));
  }
  // laugh order: 3 first, then spreading desk by desk (14 of 24 by "95 of 159")
  const ORDER = [13, 14, 9, 10, 18, 5, 15, 8, 12, 17, 6, 19, 4, 11, 21, 2, 7, 16, 20, 1, 22, 0, 3, 23];
  const RANK = []; ORDER.forEach((gi, i) => (RANK[gi] = i));
  // teacher (front right, outside the arcs)
  const teacherTex = personTex({ skin: "#8A5A3E", dress: ROSED, pose: "stand", bun: true, glasses: true, collar: false, belt: OCH });

  // ================= DORM at (-17,0,0.5) =================
  const dorm = house(-17, 0.5, 10, 6, 3.2, { backWin: [0.25, 0.5, 0.75], sideWin: [0.5], sideWin2: [0.2], door: 0.72, sign: "ASRAMA" });
  const blanketTex = paintTex(256, 128, 256, 128, (g, lw, lh) => { paperBg(g, lw, lh, PAPER); wash(g, RR(0, 0, lw, lh), ROSE, 0.55); for (let x = 10; x < lw; x += 22) wash(g, RR(x, 0, 8, lh), COB, 0.4); });
  const bedM = std(0xffffff, 0.92, { map: blanketTex }), ironM = std(0x4a4440, 0.6), pillowM = std(0xfbf6ec, 0.95);
  const DG = [];
  [-19.9, -17.95, -16.05, -14.1].forEach((x, i) => {
    boxM(1.8, 0.1, 2.6, ironM, x, 0.5, -0.6);
    boxM(1.7, 0.22, 2.5, bedM, x, 0.66, -0.6);
    boxM(1.2, 0.18, 0.5, pillowM, x, 0.84, -1.6);
    for (const s of [-1, 1]) boxM(0.08, 1.0, 0.08, ironM, x + s * 0.85, 0.5, -1.9);
    const tx = personTex({ skin: SKINS[(i + 1) % 4], dress: ["#F1E2C6", "#E6D3B4", "#F4E6D0", "#EAD8BC"][i], pose: "sit", collar: false, hairBack: i % 2 === 0 });
    const p = makePerson(tx, 1.45, x, 0.12, 0.4); p.k = i; p.ph = i * 1.7; DG.push(p);
  });
  const symTex = (kind) => paintTex(128, 128, 64, 64, (g) => {
    if (kind === 0) { paint(g, [[CU([22, 8, 42, 50], (q) => { q.moveTo(32, 8); q.bezierCurveTo(40, 24, 44, 32, 42, 40); q.quadraticCurveTo(38, 50, 32, 50); q.quadraticCurveTo(22, 50, 22, 40); q.bezierCurveTo(20, 32, 26, 22, 32, 8); }), "#6FA0C8", 0.9, 1.4]], false); }
    if (kind === 1) { for (let k = 0; k < 3; k++) line(g, [[10, 16 + k * 14], [20, 10 + k * 14], [30, 18 + k * 14], [40, 10 + k * 14], [52, 17 + k * 14]], 3.2, 0.85, OCH); }
    if (kind === 2) { g.save(); g.strokeStyle = MAUVE; g.lineWidth = 3.4; g.globalAlpha = 0.9; g.beginPath(); for (let a = 0; a < 15; a += 0.2) { const rr = 2 + a * 1.7; const x = 32 + Math.cos(a) * rr, y = 32 + Math.sin(a) * rr; a ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore(); }
    if (kind === 3) { for (let k = 0; k < 3; k++) { const pts = []; for (let x = 8; x <= 56; x += 3) pts.push([x, 18 + k * 13 + Math.sin(x * 0.35 + k) * 3.5]); line(g, pts, 3, 0.85, COB); } }
  });
  const SYM = [0, 1, 2, 3].map((k) => { const s = spriteTex(symTex(k), 0.7, 0.7); s.visible = false; scene.add(s); return s; });
  const teacher = makePerson(teacherTex, 1.75, -11.2, 0, 3.9, scene, false);
  scene.add(add(blob(1.2, 0.6, 0.3), -11.2, 0.015, 3.9));
  const checkTex = paintTex(256, 120, 256, 120, (g, lw, lh) => {
    paint(g, [[RR(6, 10, lw - 12, lh - 20, 10), "#FFFCF4", 0.97, 1.4]]);
    line(g, [[24, 62], [38, 78], [62, 38]], 7, 0.9, SAGE);
    txt(g, "GURU", 150, 46, 34, GR, { font: BODY, style: "normal", weight: 800 });
    txt(g, "tidak terkena", 150, 82, 24, PINE, { font: HEAD });
  });
  const check = spriteTex(checkTex, 1.9, 0.9); check.visible = false; scene.add(check);

  // ================= VILLAGE NSHAMBA around (26,0,4) =================
  const mudTex = paintTex(512, 128, 512, 128, (g, lw, lh) => {
    paperBg(g, lw, lh, "#E2C49E"); wash(g, RR(0, 0, lw, lh), "#C08257", 0.55);
    for (let i = 0; i < 90; i++) { const x = R() * lw, y = R() * lh; line(g, [[x, y], [x + J(4), y + 6 + R() * 10]], 0.8, 0.18, "#8E5636"); }
    paint(g, [[RR(lw * 0.5 - 16, lh * 0.32, 32, lh * 0.68, 12), "#4B3326", 0.9, 1.3]]);
    wash(g, RR(0, lh * 0.86, lw, lh * 0.14), "#8E5636", 0.5);
  });
  const thatchTex = paintTex(512, 256, 512, 256, (g, lw, lh) => {
    paperBg(g, lw, lh, "#E6CC92"); wash(g, RR(0, 0, lw, lh), "#C9A25E", 0.6);
    for (let x = 0; x < lw; x += 3) line(g, [[x, 0], [x + J(3), lh]], 1, 0.22 + R() * 0.2, R() < 0.5 ? "#8C6A36" : "#F1DDA8");
    for (let y = lh * 0.3; y < lh; y += lh * 0.22) line(g, [[0, y], [lw, y + J(3)]], 1.4, 0.35, "#7A5A2C");
  });
  const HUTS = [[22, 2.5, 0.2], [28.5, 1.5, 0.8], [33, 5.5, 1.6], [20.5, 8.5, 2.6], [30, 10, 3.4], [25.5, -1.2, 4]];
  HUTS.forEach(([x, z, ry], i) => {
    const s = 0.9 + hsh(i, 2) * 0.25;
    const w = new THREE.Mesh(new THREE.CylinderGeometry(1.6 * s, 1.7 * s, 1.9 * s, 28, 1, true), std(0xffffff, 0.95, { map: mudTex, side: THREE.DoubleSide }));
    w.position.set(x, 0.95 * s, z); w.rotation.y = Math.PI + (x - 26) * 0.08; w.castShadow = w.receiveShadow = true; scene.add(w);
    const rf = new THREE.Mesh(new THREE.ConeGeometry(2.35 * s, 2.0 * s, 28, 1, true), std(0xffffff, 0.95, { map: thatchTex, side: THREE.DoubleSide }));
    rf.position.set(x, 1.9 * s + 0.95 * s, z); rf.castShadow = rf.receiveShadow = true; scene.add(rf);
    scene.add(add(blob(4.6 * s, 4.6 * s, 0.28), x, 0.015, z));
  });
  // banana groves and mango trees
  const BAN = [0, 1, 2, 3, 4].map((sd) => paintTex(360, 480, 180, 240, (g, lw, lh) => banana(g, lw, lh, 40 + sd)));
  const MANGO = paintTex(360, 420, 180, 210, (g, lw, lh) => mango(g, lw, lh));
  const banPos = [];
  for (let i = 0; i < 70; i++) {
    const x = -40 + R() * 90, z = -6 + R() * 26;
    const nearB = (Math.abs(x) < 8.5 && z > -5 && z < 6.5) || (Math.abs(x + 17) < 7 && z > -4 && z < 6) || (Math.hypot(x - 26, (z - 4) * 1.2) < 11) || (Math.abs(x - 12) < 5 && Math.abs(z - 9.5) < 3);
    let onPath = false; for (const [px, pz] of PATH_HOME.concat(PATH_DORM)) if (Math.hypot(x - px, z - pz) < 2.4) onPath = true;
    if (Math.abs(x - 1) < 3 && z > 4) onPath = true;
    if (z > 3 && x < 9 && x > -27) onPath = true;
    if (z > 10 && x > 8 && x < 17) onPath = true;
    if (z > 10 && x > 17 && x < 35) onPath = true;
    if (nearB || onPath) continue;
    banPos.push([x, z]);
  }
  for (const [x, z] of [[18, -1], [35, 1], [37, 9], [16, 3], [-8, -4.5], [9, -4.5], [-25, -2], [-27.5, 6], [-29, 2]]) banPos.push([x, z]);
  banPos.forEach(([x, z], i) => {
    const mg = i % 9 === 4, h = mg ? 4.6 : 3.4 + hsh(i, 5) * 1.4;
    const m = cutMesh(h * (mg ? 0.86 : 0.75), h, mg ? MANGO : BAN[i % 5]);
    m.position.set(x, 0, z); m.rotation.y = J(0.5); scene.add(m);
  });
  // villagers (shown from s5)
  const VIL = [];
  const vdef = [
    { skin: "#6B4029", dress: OCH, kanga: ROSED, headwrap: ROSE, pose: "stand", collar: false, wrap: OCH },
    { skin: "#8C5A3B", dress: SAGE, man: true, pants: "#55606B", pose: "stand" },
    { skin: "#7A4B31", dress: ROSE, kanga: COB, headwrap: OCH, pose: "stand", collar: false },
    { skin: "#946345", dress: "#C9A25E", man: true, pants: UMB, pose: "stand" },
    { skin: "#6B4029", dress: COB, kanga: OCH, headwrap: SAGE, pose: "stand", collar: false },
    { skin: "#8C5A3B", dress: MAUVE, kanga: CREAM, headwrap: ROSED, pose: "stand", collar: false },
    { skin: "#7A4B31", dress: COB, pose: "stand" },
    { skin: "#946345", dress: OCH, man: true, pants: "#5D564F", pose: "stand" },
  ];
  const vpos = [[24, 5.2], [27.5, 5.6], [29.8, 7], [23.2, 7.6], [26.2, 8.4], [31.2, 3.4], [21.5, 5.6], [28.6, 9.5]];
  vdef.forEach((o, i) => { const p = makePerson(personTex(o), o.man ? 1.75 : 1.65, vpos[i][0], 0, vpos[i][1]); p.ph = i * 1.3; p.G.add(blob(0.9, 0.45, 0.32)); VIL.push(p); });
  // walking girls (s5): carry small bundles home
  const WALK = [0, 1, 2, 3, 4].map((i) => { const p = makePerson(personTex({ skin: SKINS[i % 4], dress: COB, pose: "walk", carry: [OCH, ROSE, SAGE, CREAM, ROSED][i] }), 1.5, 0, 0, 5); p.G.add(blob(0.8, 0.4, 0.3)); p.ph = i * 1.9; return p; });
  const pathPt = (u) => { // arc-length-ish along PATH_HOME
    const P2 = PATH_HOME; const segs = P2.length - 1, f = clamp01(u) * segs, i = Math.min(segs - 1, Math.floor(f)), v = f - i;
    return [P2[i][0] + (P2[i + 1][0] - P2[i][0]) * v, P2[i][1] + (P2[i + 1][1] - P2[i][1]) * v];
  };

  // ================= BENCH station (12,0,9.6) =================
  const benchM = std(0xffffff, 0.9, { map: deskTex });
  boxM(2.2, 0.1, 0.55, benchM, 12, 0.6, 9.6); for (const s of [-1, 1]) boxM(0.1, 0.6, 0.5, benchM, 12 + s * 0.95, 0.3, 9.6);
  boxM(2.2, 0.5, 0.08, benchM, 12, 0.95, 9.33);
  const benchGirl = makePerson(personTex({ skin: "#7A4B31", dress: COB, pose: "sit", hairBack: true }), 1.45, 12, 0.18, 9.75);
  scene.add(add(blob(2.8, 1.2, 0.3), 12, 0.015, 9.6));
  const signTex = (a, b, col, dir) => paintTex(420, 140, 210, 70, (g, lw, lh) => {
    const pts = dir < 0 ? [[22, 8], [lw - 6, 8], [lw - 6, lh - 8], [22, lh - 8], [4, lh / 2]] : [[6, 8], [lw - 22, 8], [lw - 4, lh / 2], [lw - 22, lh - 8], [6, lh - 8]];
    paint(g, [[P(pts, 0.8), "#FFF9EE", 0.97, 1.5]]); wash(g, RR(dir < 0 ? 26 : 10, lh - 16, lw - 40, 5), col, 0.7);
    txt(g, a, lw / 2 + (dir < 0 ? 8 : -8), 26, 19, GR, { font: BODY, style: "normal", weight: 800 });
    txt(g, b, lw / 2 + (dir < 0 ? 8 : -8), 46, 15, col, { font: HEAD });
  });
  function signpost(x, z, map, ry) {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; scene.add(G);
    boxM(0.14, 1.9, 0.14, std(0x7b5943), 0, 0.95, 0, G);
    const m = cutMesh(2.1, 0.7, map, { center: true }); m.position.set(0, 1.55, 0.09); G.add(m);
    return G;
  }
  const signL = signpost(10.0, 8.5, signTex("SEKOLAH MISI", "aturan sekolah", COB, -1), 0.15);
  const signR = signpost(14.0, 8.5, signTex("RUMAH", "adat keluarga", ROSED, 1), -0.15);
  const brandM = cutMesh(1.9, 0.62, paintTex(380, 124, 190, 62, (g, lw, lh) => { paint(g, [[RR(4, 6, lw - 8, lh - 12, 4), "#FFF9EE", 0.97, 1.4]]); txt(g, "AUDIRA", lw / 2, 26, 22, ROSED, { font: BODY, style: "normal", weight: 800 }); txt(g, "kisah Kagera, 1962", lw / 2, 46, 13, GR, { font: HEAD }); }), { center: true });
  { const G = new THREE.Group(); G.position.set(4.2, 0, 7.4); G.rotation.y = 0.25; scene.add(G); boxM(0.12, 1.5, 0.12, std(0x7b5943), -0.7, 0.75, 0, G); boxM(0.12, 1.5, 0.12, std(0x7b5943), 0.7, 0.75, 0, G); brandM.position.set(0, 1.3, 0.08); G.add(brandM); }

  // ================= MAP BOARD (separate station at x=-120) =================
  const MX = -120, LON0 = 29.6, LON1 = 34.4, LAT0 = -3.5, LAT1 = 2.5, BW = 9.6, BH = 12;
  const board = new THREE.Group(); board.position.set(MX, 4.6, 0); board.rotation.x = -0.38; scene.add(board);
  const LAKE = [[31.75, -0.4], [31.8, -1.0], [31.82, -1.35], [31.7, -1.8], [31.65, -2.2], [31.9, -2.6], [32.3, -2.55], [32.6, -2.75], [32.9, -2.55], [33.2, -2.4], [33.6, -2.3], [33.85, -2.05], [33.75, -1.75], [33.9, -1.45], [34.05, -1.1], [34.3, -0.85], [34.2, -0.55], [34.65, -0.3], [34.8, -0.1], [34.4, -0.15], [34.15, 0.05], [33.95, 0.15], [33.6, 0.3], [33.2, 0.45], [32.9, 0.3], [32.6, 0.2], [32.45, 0.0], [32.3, -0.15], [32.0, -0.25]];
  const ML = 480, MH = 600;
  const mx = (lon) => ((lon - LON0) / (LON1 - LON0)) * ML, my = (lat) => ((LAT1 - lat) / (LAT1 - LAT0)) * MH;
  const bxy = (lon, lat) => [((lon - LON0) / (LON1 - LON0) - 0.5) * BW, (0.5 - (LAT1 - lat) / (LAT1 - LAT0)) * BH];
  const ringPath = (pts) => CU(bbox(pts.map(([a, b]) => [mx(a), my(b)])), (g) => pts.forEach(([a, b], i) => (i ? g.lineTo(mx(a), my(b)) : g.moveTo(mx(a), my(b)))));
  const CC = { Tanzania: "#E9B96A", Uganda: "#A9BE8E", Kenya: "#D9A99A", Rwanda: "#C6B7A6", Burundi: "#C6B7A6", "Dem. Rep. Congo": "#CBBFAA" };
  const mapTex = paintTex(1440, 1800, ML, MH, (g, lw, lh) => {
    paperBg(g, lw, lh, "#F7F0E2");
    g.save(); g.beginPath(); g.rect(0, 0, lw, lh); g.clip();
    for (const c of GEO) for (const rg of c.rings) wash(g, ringPath(rg), CC[c.name] || "#D8CCB8", 0.5);
    wash(g, ringPath(LAKE), COB, 0.72);
    for (let i = 0; i < 160; i++) { const lo = 32 + R() * 2.6, la = -2.3 + R() * 2.5; const x = mx(lo), y = my(la); line(g, [[x, y], [x + 4, y - 0.6], [x + 8, y]], 0.8, 0.35, "#FFFFFF"); }
    for (const c of GEO) for (const rg of c.rings) pencil(g, ringPath(rg), 1.1, 0.55);
    pencil(g, ringPath(LAKE), 1.3, 0.6);
    g.restore();
    txt(g, "UGANDA", mx(32.6), my(1.55), 20, "#4C6A45", { font: BODY, style: "normal", weight: 800, a: 0.85 });
    txt(g, "KENYA", mx(34.0), my(1.1), 15, "#8E5A4E", { font: BODY, style: "normal", weight: 800, a: 0.75 });
    txt(g, "RWANDA", mx(30.05), my(-2.0), 10, "#6A6058", { font: BODY, style: "normal", weight: 800, a: 0.7 });
    txt(g, "TANGANYIKA", mx(31.9), my(-3.05), 22, "#8E4E2A", { font: BODY, style: "normal", weight: 800, a: 0.9 });
    txt(g, "kini Tanzania", mx(31.9), my(-3.32), 12, "#8E4E2A", { font: HEAD, a: 0.85 });
    txt(g, "Danau Victoria", mx(33.05), my(-1.15), 18, "#FFFFFF", { font: HEAD, a: 0.95 });
    line(g, [[mx(29.9), my(-1.02)], [mx(31.0), my(-1.0)]], 0, 0); // spacing
    txt(g, "perbatasan Uganda", mx(30.55), my(-0.78), 10, "#4C6A45", { font: HEAD, a: 0.85 });
    paint(g, [[E(mx(31.81), my(-1.33), 3.2, 3.2), GR, 0.9, false]], false);
    txt(g, "Bukoba", mx(31.81) - 8, my(-1.33) + 1, 13, GR, { font: HEAD, align: "right" });
    // compass + cartouche with the brand
    paint(g, [[RR(lw - 132, lh - 66, 120, 52, 4), "#FFF9EE", 0.95, 1.3]]);
    txt(g, "PETA CAT AIR", lw - 72, lh - 50, 11, GR, { font: BODY, style: "normal", weight: 800 });
    txt(g, "AUDIRA · 1962", lw - 72, lh - 30, 14, ROSED, { font: HEAD });
    line(g, [[30, 30], [30, 60]], 1.6, 0.7); txt(g, "U", 30, 20, 13, GR, { font: BODY, style: "normal", weight: 800 });
  });
  {
    const bm = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), std(0xffffff, 0.95, { map: mapTex })); bm.receiveShadow = true; board.add(bm);
    const fr = std(0x8a6a4c, 0.8);
    boxM(BW + 0.5, 0.3, 0.25, fr, 0, BH / 2 + 0.1, -0.1, board); boxM(BW + 0.5, 0.3, 0.25, fr, 0, -BH / 2 - 0.1, -0.1, board);
    boxM(0.3, BH + 0.5, 0.25, fr, BW / 2 + 0.1, 0, -0.1, board); boxM(0.3, BH + 0.5, 0.25, fr, -BW / 2 - 0.1, 0, -0.1, board);
    boxM(40, 0.6, 26, std(0xffffff, 0.9, { map: deskTex }), MX, -1.6, 2);
  }
  // Tanganyika highlight overlay
  const tzTex = paintTex(720, 900, ML, MH, (g) => { for (const c of GEO) if (c.name === "Tanzania") for (const rg of c.rings) { wash(g, ringPath(rg), ROSE, 0.6); } wash(g, ringPath(LAKE), COB, 0.0); });
  const tzM = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), new THREE.MeshBasicMaterial({ map: tzTex, transparent: true, opacity: 0, depthWrite: false }));
  tzM.position.z = 0.01; board.add(tzM);
  const lakeCover = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), new THREE.MeshBasicMaterial({ map: paintTex(720, 900, ML, MH, (g) => wash(g, ringPath(LAKE), COB, 0.72)), transparent: true, depthWrite: false }));
  lakeCover.position.z = 0.012; lakeCover.visible = false; board.add(lakeCover);
  function pin(lon, lat, col, label) {
    const G = new THREE.Group(); const [x, y] = bxy(lon, lat); G.position.set(x, y, 0); board.add(G);
    const nd = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 8), std(0x8d8d8d, 0.4, { metalness: 0.6 })); nd.rotation.x = Math.PI / 2; nd.position.z = 0.27; nd.castShadow = true; G.add(nd);
    const hd = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), std(new THREE.Color(col), 0.5)); hd.position.z = 0.56; hd.castShadow = true; G.add(hd);
    if (label) {
      const lt = paintTex(400, 110, 200, 55, (g, lw, lh) => { paint(g, [[RR(4, 6, lw - 8, lh - 12, 6), "#FFFCF4", 0.97, 1.4]]); txt(g, label, lw / 2, lh / 2 + 1, 24, GR, { font: HEAD }); });
      const s = spriteTex(lt, 1.9, 0.52); s.position.set(0, 0.65, 0.9); G.add(s); G.lab = s;
    }
    G.scale.setScalar(0.0001); return G;
  }
  const pK = pin(31.72, -1.12, ROSED, "Kashasha");
  const pN = pin(31.55, -1.82, OCH, "Nshamba");
  const SCH = [];
  { const q = mulberry(14); let n = 0; while (SCH.length < 13 && n < 400) { n++; const lo = 30.45 + q() * 1.35, la = -2.65 + q() * 2.3; if (Math.hypot(lo - 31.81, la + 1.33) > 1.4) continue; if (lo > 31.68 && la < -0.3) continue; if (Math.hypot(lo - 31.72, la + 1.12) < 0.22 || Math.hypot(lo - 31.55, la + 1.82) < 0.2) continue; if (SCH.some((s) => Math.hypot(s.lo - lo, s.la - la) < 0.26)) continue; SCH.push({ lo, la, g: pin(lo, la, "#C9A25E") }); } }
  const ringBoardTex = paintTex(512, 512, 512, 512, (g, w) => { g.save(); g.strokeStyle = "#fff"; g.lineWidth = 9; g.setLineDash([26, 16]); g.globalAlpha = 0.95; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 12, 0, 6.3); g.stroke(); g.restore(); });
  const circ = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: ringBoardTex, color: new THREE.Color(ROSED), transparent: true, opacity: 0, depthWrite: false }));
  { const [x, y] = bxy(31.81, -1.33); circ.position.set(x, y, 0.03); circ.scale.setScalar(5.9); board.add(circ); }

  // ================= RIPPLE RINGS (laughter spreading) =================
  const ringTex = paintTex(512, 512, 512, 512, (g, w) => {
    const q = mulberry(7);
    for (let k = 0; k < 9; k++) { g.save(); g.strokeStyle = "#fff"; g.globalAlpha = 0.25 + q() * 0.35; g.lineWidth = 9 + q() * 14; g.lineCap = "round"; g.filter = "blur(1.2px)"; const a0 = q() * 6.3; g.beginPath(); g.arc(w / 2 + (q() - 0.5) * 6, w / 2 + (q() - 0.5) * 6, w / 2 - 22 - q() * 10, a0, a0 + 2.5 + q() * 3.5); g.stroke(); g.restore(); }
  });
  const POOL = [];
  for (let i = 0; i < 48; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: ringTex, color: new THREE.Color(ROSED), transparent: true, opacity: 0, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.renderOrder = 3; m.visible = false; scene.add(m); POOL.push(m);
  }
  const cRose = new THREE.Color(ROSED), cCob = new THREE.Color("#FFFFFF");
  function rings(t, list) {
    let n = 0;
    for (const s of list) {
      if (s.k < 0.01) continue;
      for (let i = 0; i < s.n; i++) {
        if (n >= POOL.length) break;
        const ph = ((t - s.t0) / s.per + i / s.n) % 1; if (t < s.t0 + (i / s.n) * 0) { /* rings born continuously */ }
        const u = ph < 0 ? ph + 1 : ph;
        const m = POOL[n++]; m.visible = true;
        m.position.set(s.x, s.y ?? 0.06, s.z); m.scale.setScalar(Math.max(0.01, s.r0 + (s.r1 - s.r0) * eout(u)));
        m.material.opacity = Math.min(1, s.k * Math.pow(1 - u, 1.1) * Math.min(1, u * 6) * (s.a ?? 1.0));
        m.material.color.copy(s.c || cRose);
      }
    }
    for (; n < POOL.length; n++) POOL[n].visible = false;
  }

  // ================= TIMING =================
  const tTurn1 = A("s2:ada") - 0.0, tTurn2 = A("s5:Ketika"), tS6 = K.s6, tS7 = K.s7;
  const laughC = (p, t) => { // classroom girls
    const rk = RANK[p.k];
    if (t < K.s2) return ramp(t, 0.15 + rk * 0.12, 0.55 + rk * 0.12);
    if (t >= K.s3 && t < K.s4 + 0.5) {
      const on = rk < 3 ? A("s3:tiga") + rk * 0.15 : rk < 14 ? A("s3:menular") + (rk - 3) * ((A("s3:sembilan") - A("s3:menular")) / 11) : 1e9;
      return ramp(t, on, on + 0.5);
    }
    if (t >= tTurn2 - 0.1 && t < tS6) { const on = rk < 9 ? A("s5:lima") + rk * 0.12 : 1e9; return ramp(t, on - 0.3, on + 0.2); }
    return 0;
  };

  // camera shots
  const look = new V3();
  const setCam = (c, roll = 0) => { cam.position.set(c[0] + Math.sin(cam.__t * 0.37) * 0.04, c[1] + Math.sin(cam.__t * 0.29) * 0.03, c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look); if (roll) cam.rotateZ(roll); };
  const S = {
    hook: track([[0, 0, 5.6, 11.6, 0, 0.55, -1.0], [A("s1:sekolah"), 0, 6.2, 13.2, 0, 0.5, -1.0], [A("s1:tertawa"), 0, 8.4, 19.5, 0, -0.6, -1.5], [K.s2, 0.3, 9.0, 21, 0, -0.7, -1.8]]),
    map: track([[K.s2 - 0.2, MX, 7.0, 25.5, MX, 5.6, 0], [A("s2:merdeka"), MX + 0.1, 6.8, 24.0, MX + 0.1, 5.5, 0], [A("s2:Kashasha"), MX - 0.5, 6.0, 19.0, MX - 0.6, 5.0, 0], [A("s2:Victoria"), MX - 1.0, 5.6, 15.5, MX - 1.0, 4.9, 0], [tTurn1, MX - 1.0, 5.6, 15.0, MX - 1.0, 4.9, 0]]),
    est: track([[tTurn1, 9.5, 6.2, 23, -1.5, 1.4, -3], [K.s3, 5.5, 5.4, 19.5, -1.0, 1.6, -2.5]]),
    cls: track([[K.s3, 0, 6.6, 13.2, 0, 0.45, -1.0], [A("s3:menular"), 0.5, 6.3, 12.4, 0.2, 0.45, -1.0], [K.s4 - 0.2, 0.2, 7.0, 14.0, 0, 0.4, -1.0]]),
    dorm: track([[K.s4 - 0.2, 0.2, 7.0, 14.0, 0, 0.4, -1.0], [A("s4:menyenangkan"), -18.6, 5.0, 12.6, -18.6, 0.55, -0.6], [A("s4:pingsan"), -17.3, 4.9, 12.4, -17.2, 0.55, -0.6], [A("s4:sesak") + 0.3, -15.4, 4.9, 12.6, -15.4, 0.55, -0.5], [A("s4:guru") - 0.5, -14.6, 5.0, 13.4, -14.4, 0.6, 0.0], [A("s4:guru") + 0.4, -12.9, 4.9, 14.2, -12.9, 0.7, 1.2], [K.s5, -12.7, 5.0, 14.6, -12.7, 0.7, 1.2]]),
    walk: track([[K.s5 - 0.2, 0, 8.5, 22.5, 0, 1.6, 0], [A("s5:Para"), 1.0, 7.6, 20.5, 0.8, 1.4, 1.0]]),
    vil: track([[A("s5:Nshamba") - 0.6, 24.5, 4.8, 20.5, 26, 0.0, 5], [tTurn2, 27, 4.6, 19.0, 26.5, 0.0, 5]]),
    re: track([[tTurn2, 0, 7.2, 14.4, 0, 0.45, -1.0], [tS6, 0, 6.5, 12.8, 0, 0.45, -1.0]]),
    map2: track([[tS6, MX - 0.4, 6.8, 23.5, MX - 0.4, 5.4, 0], [A("s6:ditutup"), MX - 1.3, 6.0, 18.5, MX - 1.4, 5.0, 0], [tS7, MX - 1.4, 5.9, 18.0, MX - 1.5, 5.0, 0]]),
    bench: track([[tS7, 12, 3.3, 23.0, 12, -0.3, 9.0], [A("s7:Di"), 12, 3.1, 21.8, 12, -0.25, 9.0], [K.s8, 12.2, 3.4, 22.6, 12, -0.3, 8.8]]),
    end: track([[K.s8, 12.2, 3.4, 22.6, 12, -0.3, 8.8], [A("s8:beres"), 9, 9, 30, 6, 1.0, 0], [A("s8:Menurut"), 6, 12.5, 36, 3, 0.5, -6], [K.end + 3, 5, 13.5, 38, 2.5, 0.4, -7]]),
  };

  return (t) => {
    cam.__t = t;
    const st = t < K.s2 ? "hook" : t < tTurn1 ? "map" : t < K.s3 ? "est" : t < K.s4 - 0.2 ? "cls" : t < K.s5 ? "dorm" : t < A("s5:Nshamba") - 0.6 ? "walk" : t < tTurn2 ? "vil" : t < tS6 ? "re" : t < tS7 ? "map2" : t < K.s8 ? "bench" : "end";
    // ----- walk follow (camera keyed to the walkers) -----
    const wu = ramp(t, A("s5:pulang"), A("s5:Nshamba") - 0.3);
    WALK.forEach((p, i) => {
      const [x, z] = pathPt(wu - i * 0.045);
      const on = t > K.s5 - 0.2 && t < tTurn2 + 0.1 && wu - i * 0.045 > -0.02;
      p.G.visible = on; if (!on) return;
      const step = Math.sin(t * 9 + i * 1.3);
      p.G.position.set(x + (i % 2 ? 0.45 : -0.45), Math.abs(step) * 0.05 * (wu < 1 ? 1 : 0), z + (i - 2) * 0.12);
      p.m.rotation.z = step * 0.03 * (wu < 1 ? 1 : 0);
    });
    if (st === "hook") setCam(S.hook(t));
    else if (st === "map") setCam(S.map(t));
    else if (st === "est") setCam(S.est(t));
    else if (st === "cls") setCam(S.cls(t));
    else if (st === "dorm") setCam(S.dorm(t));
    else if (st === "walk") {
      const a = S.walk(t);
      if (t > A("s5:Para")) { const [x, z] = pathPt(wu - 0.08), k = ramp(t, A("s5:Para"), A("s5:Para") + 1.6); const f = [x + 1.5, 4.6, z + 12.5, x + 0.5, 1.3, z - 0.5]; setCam(a.map((v, i) => v + (f[i] - v) * k)); }
      else setCam(a);
    }
    else if (st === "vil") setCam(S.vil(t));
    else if (st === "re") setCam(S.re(t));
    else if (st === "map2") setCam(S.map2(t));
    else if (st === "bench") setCam(S.bench(t));
    else setCam(S.end(t));

    // ----- classroom girls -----
    GIRLS.forEach((p) => {
      const k = laughC(p, t);
      p.arc.visible = k > 0.02;
      const pulse = 0.5 + 0.5 * Math.sin(t * 7 + p.ph);
      p.arc.material.opacity = k * (0.55 + 0.45 * pulse);
      p.arc.scale.set(p.h * 1.0 * (0.9 + 0.15 * pulse), p.h * 0.5 * (0.9 + 0.15 * pulse), 1);
      p.m.rotation.z = k * 0.025 * Math.sin(t * 11 + p.ph);
      p.G.position.y = 0.18 + k * 0.02 * Math.abs(Math.sin(t * 9 + p.ph));
    });
    // classroom empties while the school is closed (seen only in the wide compound shots of s5)
    const closed = t > A("s5:ditutup") && t < tTurn2 - 0.2;
    GIRLS.forEach((p) => (p.G.visible = !closed));
    // ----- dorm -----
    const dk = (i) => (t > K.s4 - 0.5 && t < K.s5 + 0.5 ? ramp(t, A("s4:menyenangkan") + i * 0.2, A("s4:menyenangkan") + 0.5 + i * 0.2) : 0);
    DG.forEach((p, i) => {
      const k = dk(i) * (i === 2 ? 0.5 : 1);
      p.arc.visible = k > 0.02; const pulse = 0.5 + 0.5 * Math.sin(t * 6 + p.ph);
      p.arc.material.opacity = k * (0.45 + 0.4 * pulse);
      if (i === 2) { const f = ramp(t, A("s4:pingsan"), A("s4:pingsan") + 0.7) * (t < K.s5 + 0.5 ? 1 : 0); p.G.rotation.z = f * Math.PI / 2 * 0.98; p.G.position.set(-16.05 + f * 0.75, 0.12 + f * 0.65, 0.4 - f * 1.0); }
      else p.m.rotation.z = k * 0.025 * Math.sin(t * 10 + p.ph);
    });
    const symA = ["s4:menangis", "s4:gelisah", "s4:pingsan", "s4:sesak"];
    SYM.forEach((s, i) => {
      const k = t > K.s4 && t < K.s5 ? win(t, A(symA[i]) - 0.1, K.s5 - 0.3, 0.35, 0.4) : 0;
      s.visible = k > 0.01; if (!s.visible) return;
      const px = [-19.9, -17.95, -16.05, -14.1][i], bob = Math.sin(t * 2.2 + i) * 0.06;
      s.position.set(px + (i === 2 ? 0.6 : 0), (i === 2 ? 1.55 : 1.95) + bob, (i === 2 ? -0.4 : 0.45));
      s.material.opacity = k; s.scale.setScalar(0.72 * (0.6 + 0.4 * back(clamp01(k))));
    });
    { const k = t > K.s4 && t < K.s5 + 0.3 ? win(t, A("s4:guru"), K.s5 + 0.2, 0.35, 0.3) : 0; check.visible = k > 0.01; check.material.opacity = k; check.position.set(-12.1, 2.35 + 0.05 * Math.sin(t * 2), 4.0); check.scale.set(1.9 * (0.7 + 0.3 * back(clamp01(k))), 0.9 * (0.7 + 0.3 * back(clamp01(k))), 1); }
    teacher.G.visible = t > K.s3 - 0.3 && t < K.s6;
    // ----- villagers -----
    VIL.forEach((p, i) => {
      const on = t > A("s5:Nshamba") + i * ((A("s5:terkena") - A("s5:Nshamba")) / 8);
      const k = t < tTurn2 + 0.2 && t > K.s5 ? (on ? 1 : 0) * ramp(t, A("s5:Nshamba") + i * 0.2, A("s5:Nshamba") + 0.5 + i * 0.2) : 0;
      p.arc.visible = k > 0.02; const pulse = 0.5 + 0.5 * Math.sin(t * 6.5 + p.ph); p.arc.material.opacity = k * (0.5 + 0.45 * pulse);
      p.m.rotation.z = k * 0.025 * Math.sin(t * 10 + p.ph);
    });
    WALK.forEach((p, i) => { const k = ramp(t, A("s5:wabahnya"), A("s5:wabahnya") + 0.6) * (t < tTurn2 ? 1 : 0); p.arc.visible = k > 0.02; p.arc.material.opacity = k * (0.5 + 0.4 * Math.sin(t * 6 + p.ph)); });
    // ----- bench girl: arcs fade as the explanation calms the scene -----
    { const k = t > tS7 - 0.2 && t < K.s8 + 0.5 ? (1 - ramp(t, A("s7:tubuh"), A("s7:menumpuk"))) * 0.8 : 0; benchGirl.arc.visible = k > 0.02; benchGirl.arc.material.opacity = k * (0.5 + 0.3 * Math.sin(t * 5)); benchGirl.G.position.y = 0.18 + 0.012 * Math.sin(t * 1.6); }
    { const kl = t > tS7 ? ramp(t, A("s7:aturan") - 0.3, A("s7:aturan") + 0.3) : 0, kr = t > tS7 ? ramp(t, A("s7:adat") - 0.3, A("s7:adat") + 0.3) : 0;
      signL.scale.setScalar(Math.max(0.001, t < tS7 ? 1 : back(kl))); signR.scale.setScalar(Math.max(0.001, t < tS7 ? 1 : back(kr)));
      signL.rotation.z = t > tS7 && t < K.s8 ? 0.04 * Math.sin(t * 1.3) * kl : 0; signR.rotation.z = t > tS7 && t < K.s8 ? -0.04 * Math.sin(t * 1.3 + 1) * kr : 0; }

    // ----- map board -----
    {
      const onMap = st === "map" || st === "map2";
      tzM.material.opacity = st === "map" ? ramp(t, A("s2:Tanganyika"), A("s2:Tanganyika") + 0.6) * 0.75 * (1 - ramp(t, A("s2:Kashasha") - 0.3, A("s2:Kashasha") + 0.4) * 0.6) : 0;
      lakeCover.visible = onMap;
      const kK = st === "map" ? ramp(t, A("s2:Kashasha") - 0.15, A("s2:Kashasha") + 0.35) : st === "map2" ? 1 : 0;
      pK.scale.setScalar(Math.max(0.0001, back(kK)));
      const kN = st === "map2" ? ramp(t, A("s6:orang") - 0.2, A("s6:orang") + 0.3) : 0; pN.scale.setScalar(Math.max(0.0001, back(kN)));
      SCH.forEach((s, i) => { const a = A("s6:empat") + (i / 13) * (A("s6:ditutup") - A("s6:empat")); const k = st === "map2" ? ramp(t, a - 0.1, a + 0.25) : 0; s.g.scale.setScalar(Math.max(0.0001, back(k) * 0.8)); });
      circ.material.opacity = st === "map2" ? ramp(t, A("s6:sekitar") - 0.2, A("s6:sekitar") + 0.5) * 0.8 : 0;
    }

    // ----- rings -----
    const L = [];
    const sch = { x: 0, z: 1.5, per: 2.6, n: 4, r0: 3, r1: 30, t0: 0 };
    if (st === "hook") { L.push({ ...sch, k: ramp(t, 0.3, 1.5) }); L.push({ x: 0.5, z: 0, per: 1.8, n: 3, r0: 0.5, r1: 9, t0: 0, k: ramp(t, 0.2, 1.0), y: 0.9 }); }
    if (st === "est") L.push({ ...sch, k: 0.0 });
    if (st === "cls") { L.push({ x: 1, z: 0, per: 2.2, n: 3, r0: 0.5, r1: 7 + 10 * ramp(t, A("s3:menular"), A("s3:sembilan")), t0: A("s3:tiga"), k: ramp(t, A("s3:tiga"), A("s3:tiga") + 0.6), y: 0.9 }); }
    if (st === "dorm") L.push({ x: -17, z: 0.5, per: 2.6, n: 3, r0: 1, r1: 9, t0: 0, k: ramp(t, A("s4:menyenangkan"), A("s4:menyenangkan") + 0.8) * 0.8, y: 0.9 });
    if (st === "walk" || st === "vil") {
      const [x, z] = pathPt(wu - 0.08);
      L.push({ x, z, per: 2.0, n: 3, r0: 0.8, r1: 7, t0: A("s5:wabahnya"), k: ramp(t, A("s5:wabahnya"), A("s5:wabahnya") + 0.6) * (1 - ramp(t, A("s5:Nshamba"), A("s5:Nshamba") + 1)) });
      L.push({ x: 26, z: 5, per: 2.4, n: 4, r0: 2, r1: 16, t0: A("s5:Nshamba"), k: ramp(t, A("s5:Nshamba"), A("s5:Nshamba") + 0.8) });
    }
    if (st === "re") L.push({ x: 1, z: 0, per: 2.2, n: 3, r0: 0.5, r1: 12, t0: A("s5:lima"), k: ramp(t, A("s5:lima") - 0.3, A("s5:lima") + 0.4), y: 0.9 });
    if (st === "end") { const k = ramp(t, A("s8:beres") - 0.8, A("s8:beres") + 0.5); L.push({ x: 0, z: -18, per: 4.5, n: 4, r0: 2, r1: 26, t0: 0, k, c: cCob, a: 0.6, y: 0.02 }); L.push({ ...sch, per: 4, k: 0.35 * (1 - ramp(t, A("s8:beres"), A("s8:Menurut"))) }); }
    rings(t, L);

    // ----- light: warm gold for the ending -----
    const gold = ramp(t, K.s8, A("s8:Menurut"));
    sun.color.setRGB(1, 0.925 - 0.08 * gold, 0.8 - 0.2 * gold); sun.intensity = 2.2 + 0.4 * gold;
    hemi.color.setRGB(1, 0.957 - 0.05 * gold, 0.886 - 0.12 * gold);
    comp.render();
  };
}
