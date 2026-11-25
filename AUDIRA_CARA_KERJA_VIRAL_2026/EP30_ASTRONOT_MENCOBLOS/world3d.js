// EP30 ASTRONOT MENCOBLOS. PAPERWORLD look: a hand-cut paper planet diorama on navy card stock.
// The Earth is a thick paper drum (ocean face with cut-paper continents, a sand + grass land strip on its rim) standing
// in front of a layered paper sky with gold card stars. Tiny paper buildings stand radially on the rim: the county
// election office (left), Mission Control Houston (centre), the White Sands dish in a paper desert (right). A paper
// space station hangs above on a dashed orbit; its open habitat module shows three generic suited astronauts (visors
// down) in their sleeping booths. A paper relay satellite (TDRS) hangs higher up (not to scale). The ballot travels as
// a sealed envelope (up) and as a folded paper plane (down) along dashed paper paths.
// Every value is a pure function of t (seeded PRNG only, no accumulated state). Camera roll follows the planet's radius.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { ShaderPass } from "./ShaderPass.js";
import { OutputPass } from "./OutputPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, ramp, clamp01, canvasTex, track, back } from "./lib3d.js";

const W = 1080, H = 1920;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const win = (t, a, b, fi = 0.4, fo = 0.4) => ramp(t, a - fi, a + fi) * (1 - ramp(t, b - fo, b + fo));
const PAL = {
  ivory: "#f3ead9", ivoryL: "#faf4e8", ivoryS: "#e5d8c1", coral: "#e3806a", coralD: "#c4614f", coralL: "#f0a892",
  mint: "#9dd1bb", mintD: "#6eaa93", mintL: "#cbe8da", gold: "#e7b54a", goldD: "#c38f2b", goldL: "#f2d58e",
  cobalt: "#5f7cb6", cobaltD: "#435e95", cobaltL: "#9eb2da", brown: "#7d5843", brownD: "#523729", ink: "#3b2a22",
  navy: "#26325a", navyD: "#1c2547", wax: "#b5382f", sand: "#ead2a0",
};

// ---------- paper stock: seeded grain albedo + fibre relief (kit recipe, 512 tile) ----------
let GR = null;
function grain() {
  if (GR) return GR;
  const S = 512, rnd = mulberry(20261103);
  const noise = (cells) => {
    const lat = new Float32Array(cells * cells).map(() => rnd()), out = new Float32Array(S * S), k = cells / S;
    for (let y = 0; y < S; y++) {
      const fy = y * k, y0 = Math.floor(fy), ty = fy - y0, sy = ty * ty * (3 - 2 * ty), r0 = (y0 % cells) * cells, r1 = ((y0 + 1) % cells) * cells;
      for (let x = 0; x < S; x++) {
        const fx = x * k, x0 = Math.floor(fx), tx = fx - x0, sx = tx * tx * (3 - 2 * tx), c0 = x0 % cells, c1 = (x0 + 1) % cells;
        const a = lat[r0 + c0] + (lat[r0 + c1] - lat[r0 + c0]) * sx, b = lat[r1 + c0] + (lat[r1 + c1] - lat[r1 + c0]) * sx;
        out[y * S + x] = a + (b - a) * sy;
      }
    }
    return out;
  };
  const m1 = noise(4), m2 = noise(12), m3 = noise(40), fine = noise(200);
  const fc = document.createElement("canvas"); fc.width = fc.height = S;
  const g = fc.getContext("2d"); g.fillStyle = "rgb(128,128,128)"; g.fillRect(0, 0, S, S); g.lineCap = "round";
  for (let i = 0; i < 2600; i++) {
    const x = rnd() * S, y = rnd() * S, len = 4 + rnd() ** 2 * 26, a = rnd() * 6.283, bend = (rnd() - 0.5) * 0.9, light = rnd() < 0.62, al = 0.05 + rnd() * 0.11;
    g.strokeStyle = light ? `rgba(255,255,255,${al})` : `rgba(0,0,0,${al * 0.8})`; g.lineWidth = 0.5 + rnd();
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
      g.beginPath(); g.moveTo(x + ox, y + oy);
      g.quadraticCurveTo(x + ox + Math.cos(a + bend) * len * 0.5, y + oy + Math.sin(a + bend) * len * 0.5, x + ox + Math.cos(a) * len, y + oy + Math.sin(a) * len); g.stroke();
    }
  }
  const fib = g.getImageData(0, 0, S, S).data;
  const make = (fn) => {
    const c = document.createElement("canvas"); c.width = c.height = S;
    const cx = c.getContext("2d"), img = cx.createImageData(S, S);
    for (let i = 0; i < S * S; i++) { const v = Math.max(0, Math.min(255, Math.round(fn(i) * 255))); img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
    cx.putImageData(img, 0, 0); return c;
  };
  const alb = make((i) => 0.965 + ((m1[i] - 0.5) * 0.5 + (m2[i] - 0.5) * 0.35 + (m3[i] - 0.5) * 0.15) * 0.06 + ((fib[i * 4] - 128) / 128) * 0.05 + (fine[i] - 0.5) * 0.03);
  const bmp = make((i) => 0.5 + ((fib[i * 4] - 128) / 128) * 0.35 + (fine[i] - 0.5) * 0.35 + (m3[i] - 0.5) * 0.2);
  const tex = (c, srgb, rep) => {
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep);
    t.anisotropy = 8; t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; return t;
  };
  // "w": world-unit UVs (extrusions, tile ~6 units). "u": 0..1 UVs (lathes, spheres, boxes).
  GR = { w: { a: tex(alb, true, 1 / 6), b: tex(bmp, false, 1 / 6) }, u: { a: tex(alb, true, 1.5), b: tex(bmp, false, 1.5) } };
  return GR;
}
// Screen-space bump divides by derivatives; guard edge-on slivers so no NaN reaches the bloom.
const SAFE_BUMP = THREE.ShaderChunk.bumpmap_pars_fragment
  .replace("vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );", "vec3 dX = dFdx( surf_pos.xyz );\n\t\tvec3 dY = dFdy( surf_pos.xyz );\n\t\tif ( dot( dX, dX ) < 1e-14 || dot( dY, dY ) < 1e-14 ) return surf_norm;\n\t\tvec3 vSigmaX = normalize( dX );")
  .replace("vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );", "vec3 vSigmaY = normalize( dY );")
  .replace("return normalize( abs( fDet ) * surf_norm - vGrad );", "vec3 pn = abs( fDet ) * surf_norm - vGrad;\n\t\tfloat l2 = dot( pn, pn );\n\t\treturn l2 > 1e-12 ? pn * inversesqrt( l2 ) : surf_norm;");
const CORE = new THREE.Color("#fff9ee");
const MC = new Map();
function paper(color, o = {}) {
  const k = [color, o.edge ? 1 : 0, o.uv ? 1 : 0, o.em || "", o.ei ?? 1, o.ds ? 1 : 0, o.back ? 1 : 0, o.relief || 1].join("|");
  if (!o.nocache && MC.has(k)) return MC.get(k);
  const G = grain()[o.uv ? "u" : "w"];
  const col = new THREE.Color(PAL[color] || color);
  if (o.edge) col.lerp(CORE, 0.34);
  const m = new THREE.MeshStandardMaterial({ color: col, map: G.a, bumpMap: G.b, bumpScale: (o.edge ? 0.35 : 0.9) * (o.relief || 1), roughness: 0.93, metalness: 0, envMapIntensity: 0.25, side: o.ds ? THREE.DoubleSide : o.back ? THREE.BackSide : THREE.FrontSide });
  if (o.em) { m.emissive = new THREE.Color(PAL[o.em] || o.em); m.emissiveIntensity = o.ei ?? 1; }
  m.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace("#include <bumpmap_pars_fragment>", SAFE_BUMP); };
  m.customProgramCacheKey = () => "paper-safe-bump";
  if (!o.nocache) MC.set(k, m);
  return m;
}
const pair = (c, o = {}) => [paper(c, o), paper(c, { ...o, edge: true })];

// ---------- geometry helpers ----------
const sh = {
  rect(w, h, r = 0) {
    const s = new THREE.Shape();
    if (!r) { s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2); s.lineTo(-w / 2, h / 2); s.closePath(); return s; }
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  },
  circle(r, x = 0, y = 0) { const s = new THREE.Shape(); s.absarc(x, y, r, 0, Math.PI * 2, false); return s; },
  holeRect(w, h, x, y) { const p = new THREE.Path(); p.moveTo(x - w / 2, y - h / 2); p.lineTo(x - w / 2, y + h / 2); p.lineTo(x + w / 2, y + h / 2); p.lineTo(x + w / 2, y - h / 2); p.closePath(); return p; },
  cloud(w, bumps, seed) {
    const R = mulberry(seed), s = new THREE.Shape(); s.moveTo(-w / 2, 0);
    for (let i = 0; i < bumps; i++) { const cx = -w / 2 + (w * (i + 0.5)) / bumps, r = (w / bumps) * (0.62 + 0.3 * R()) * (i === 0 || i === bumps - 1 ? 0.8 : 1.1); s.absarc(cx, r * 0.35, r, Math.PI, 0, true); }
    s.lineTo(w / 2, 0); s.closePath(); return s;
  },
  blob(r, seed) {
    const R = mulberry(seed), p1 = R() * 6, p2 = R() * 6, a1 = 0.18 + 0.12 * R(), a2 = 0.1 + 0.1 * R(), s = new THREE.Shape();
    for (let i = 0; i <= 48; i++) { const a = (i / 48) * Math.PI * 2, rr = r * (1 + a1 * Math.sin(3 * a + p1) + a2 * Math.sin(5 * a + p2)); i ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.8) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.8); }
    return s;
  },
  star(r1, r2, n = 5) { const s = new THREE.Shape(); for (let i = 0; i < n * 2; i++) { const a = Math.PI / 2 + (i * Math.PI) / n, r = i % 2 ? r2 : r1; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } s.closePath(); return s; },
  poly(pts) { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return s; },
};
function extrude(shape, depth, bevel = 0) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 20 });
  g.translate(0, 0, -depth / 2); g.computeVertexNormals(); return g;
}
function mesh(geo, mat, parent, x = 0, y = 0, z = 0, cast = true) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true;
  if (parent) parent.add(m); return m;
}
const cut = (shape, depth, color, parent, x, y, z, o) => mesh(extrude(shape, depth), pair(color, o), parent, x, y, z);
function rboxGeo(w, h, d, r) {
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const g = extrude(sh.rect(w - 2 * r, h - 2 * r, 0), Math.max(0.001, d - 2 * r), r);
  return g;
}
const rbox = (w, h, d, r, color, parent, x, y, z, o) => mesh(rboxGeo(w, h, d, r), pair(color, o), parent, x, y, z);
function cylGeo(rt, rb, h, seg = 24, hang = false) { const g = new THREE.CylinderGeometry(rt, rb, h, seg); if (hang) g.translate(0, -h / 2, 0); return g; }
function lathe(prof, seg = 40) { const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.001), y)), seg); g.computeVertexNormals(); return g; }
// printed card: canvas drawn label on a thin paper card
function printTex(w, h, draw) { return canvasTex(w, h, draw); }
function label(text, { w = 512, h = 128, bg = PAL.ivoryL, fg = PAL.ink, font = "bold 64px Georgia, serif", border = PAL.brown, sub = null, subFont = "600 34px Arial, sans-serif" } = {}) {
  return printTex(w, h, (c) => {
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    if (border) { c.strokeStyle = border; c.lineWidth = Math.max(4, h * 0.05); c.strokeRect(c.lineWidth, c.lineWidth, w - 2 * c.lineWidth, h - 2 * c.lineWidth); }
    c.fillStyle = fg; c.textAlign = "center"; c.textBaseline = "middle"; c.font = font;
    c.fillText(text, w / 2, sub ? h * 0.38 : h / 2);
    if (sub) { c.font = subFont; c.fillText(sub, w / 2, h * 0.74); }
  });
}
function card(tex, w, h, parent, x, y, z, edge = "brown") {
  const g = new THREE.Group(); g.position.set(x, y, z);
  mesh(extrude(sh.rect(w + 0.08, h + 0.08, 0.03), 0.05), pair(edge), g, 0, 0, -0.03);
  const f = mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92, envMapIntensity: 0.25 }), g, 0, 0, 0.005, false);
  f.receiveShadow = true;
  if (parent) parent.add(g); return g;
}
function ballotTex(filled) {
  return printTex(256, 340, (c) => {
    c.fillStyle = "#fbf6ea"; c.fillRect(0, 0, 256, 340);
    c.fillStyle = PAL.ink; c.font = "bold 30px Georgia, serif"; c.textAlign = "center"; c.fillText("SURAT SUARA", 128, 46);
    c.fillRect(24, 62, 208, 3);
    for (let i = 0; i < 4; i++) {
      const y = 92 + i * 60; c.strokeStyle = PAL.ink; c.lineWidth = 4; c.strokeRect(30, y, 34, 34);
      c.fillStyle = "#c9bba0"; c.fillRect(80, y + 8, 140, 7); c.fillRect(80, y + 22, 100, 6);
      if (filled && i === 1) { c.strokeStyle = "#2e5aa8"; c.lineWidth = 7; c.beginPath(); c.moveTo(34, y + 16); c.lineTo(46, y + 30); c.lineTo(70, y - 4); c.stroke(); }
    }
  });
}

// ---------- props ----------
function astronaut(seed) {
  const g = new THREE.Group();
  const suit = paper("ivory", { uv: true }), suitS = paper("ivoryS", { uv: true }), glove = paper("#c3c9d4", { uv: true });
  const visorM = new THREE.MeshStandardMaterial({ color: "#c99a3c", metalness: 0.75, roughness: 0.22, envMapIntensity: 1.3 });
  const ap = (geo, mat, par, x, y, z) => mesh(geo, mat, par, x, y, z);
  mesh(rboxGeo(0.62, 0.56, 0.36, 0.12), pair("ivory"), g, 0, 0.36, 0);
  mesh(rboxGeo(0.42, 0.24, 0.3, 0.09), pair("ivoryS"), g, 0, 0.04, 0);
  mesh(rboxGeo(0.5, 0.52, 0.2, 0.07), pair("#d9dde4"), g, 0, 0.4, -0.27);
  ap(cylGeo(0.16, 0.17, 0.07), suitS, g, 0, 0.68, 0);
  const patch = mesh(new THREE.CircleGeometry(0.07, 20), paper(seed % 2 ? "coral" : "cobalt", { uv: true }), g, -0.14, 0.48, 0.181, false);
  patch.receiveShadow = true;
  mesh(new THREE.PlaneGeometry(0.2, 0.05), paper("cobaltD", { uv: true }), g, 0.13, 0.5, 0.181, false);
  const head = new THREE.Group(); head.position.set(0, 0.92, 0.01); g.add(head);
  ap(new THREE.SphereGeometry(0.26, 28, 20), suit, head, 0, 0, 0);
  ap(new THREE.SphereGeometry(0.262, 28, 16, Math.PI / 2 - 0.95, 1.9, 0.62, 1.15), visorM, head, 0, -0.01, 0.012);
  const arm = (sx) => {
    const sh_ = new THREE.Group(); sh_.position.set(sx * 0.34, 0.56, 0); g.add(sh_);
    ap(new THREE.SphereGeometry(0.11, 16, 12), suit, sh_, 0, 0, 0);
    ap(cylGeo(0.09, 0.085, 0.3, 16, true), suit, sh_, 0, 0, 0);
    const el = new THREE.Group(); el.position.set(0, -0.3, 0); sh_.add(el);
    ap(cylGeo(0.082, 0.075, 0.27, 16, true), suit, el, 0, 0, 0);
    ap(cylGeo(0.088, 0.088, 0.05, 16), suitS, el, 0, -0.24, 0);
    const hand = new THREE.Group(); hand.position.set(0, -0.31, 0); el.add(hand);
    ap(new THREE.SphereGeometry(0.085, 14, 10), glove, hand, 0, 0, 0);
    return { sh: sh_, el, hand };
  };
  const leg = (sx) => {
    const hp = new THREE.Group(); hp.position.set(sx * 0.12, -0.04, 0); g.add(hp);
    ap(cylGeo(0.105, 0.095, 0.36, 16, true), suit, hp, 0, 0, 0);
    const kn = new THREE.Group(); kn.position.set(0, -0.36, 0); hp.add(kn);
    ap(new THREE.SphereGeometry(0.095, 14, 10), suit, kn, 0, 0, 0);
    ap(cylGeo(0.092, 0.085, 0.34, 16, true), suit, kn, 0, 0, 0);
    mesh(rboxGeo(0.18, 0.13, 0.28, 0.05), pair("#d9dde4"), kn, 0, -0.38, 0.05);
    return { hp, kn };
  };
  return { g, head, aL: arm(-1), aR: arm(1), lL: leg(-1), lR: leg(1) };
}
function pose(a, p) {
  a.aL.sh.rotation.set(p.lsx ?? -0.5, 0, p.lsz ?? -0.25); a.aL.el.rotation.x = p.le ?? -0.9;
  a.aR.sh.rotation.set(p.rsx ?? -0.5, 0, p.rsz ?? 0.25); a.aR.el.rotation.x = p.re ?? -0.9;
  a.lL.hp.rotation.set(p.lh ?? -1.2, 0, -0.08); a.lL.kn.rotation.x = p.lk ?? 1.3;
  a.lR.hp.rotation.set(p.rh ?? -1.1, 0, 0.08); a.lR.kn.rotation.x = p.rk ?? 1.2;
  a.head.rotation.set(p.hx ?? 0, p.hy ?? 0, 0);
}
function building(b) {
  const g = new THREE.Group();
  mesh(new THREE.BoxGeometry(b.w, b.h, b.d), paper(b.wall, { uv: true }), g, 0, b.h / 2, 0);
  const fs = sh.rect(b.w + 0.06, b.h);
  fs.holes = [];
  const cw = (b.w - 0.5) / b.cols;
  const wy = (j) => b.h - 0.8 - j * 0.85;
  for (let i = 0; i < b.cols; i++) for (let j = 0; j < b.rows; j++) fs.holes.push(sh.holeRect(cw * 0.5, 0.5, -b.w / 2 + 0.25 + cw * (i + 0.5), wy(j) - b.h / 2));
  mesh(new THREE.PlaneGeometry(b.w - 0.1, b.h - 0.1), paper(b.win, { uv: true, em: b.glow ? "goldL" : null, ei: b.glow || 0 }), g, 0, b.h / 2, b.d / 2 + 0.01, false);
  cut(fs, 0.08, b.wall, g, 0, b.h / 2, b.d / 2 + 0.07);
  for (let i = 0; i < b.cols; i++) for (let j = 0; j < b.rows; j++) rbox(cw * 0.62, 0.08, 0.14, 0.03, b.trim, g, -b.w / 2 + 0.25 + cw * (i + 0.5), wy(j) - 0.29, b.d / 2 + 0.14);
  rbox(b.w + 0.3, 0.2, b.d + 0.3, 0.06, b.trim, g, 0, b.h + 0.1, 0);
  if (b.gable) { const r = cut(sh.poly([[-b.w / 2 - 0.25, 0], [b.w / 2 + 0.25, 0], [0, b.gable]]), b.d + 0.1, b.roof, g, 0, b.h + 0.2, 0); }
  if (b.door) { cut(sh.rect(0.78, 1.25, 0.08), 0.06, b.door, g, b.doorX || 0, 0.63, b.d / 2 + 0.14); rbox(1.1, 0.12, 0.3, 0.04, b.trim, g, b.doorX || 0, 1.32, b.d / 2 + 0.16); }
  return g;
}
function dish(r, depth) {
  const g = new THREE.Group(), prof = [];
  for (let i = 0; i <= 16; i++) { const x = (i / 16) * r; prof.push([x, (x * x) / (4 * (r * r / (4 * depth)))]); }
  const m = mesh(lathe(prof, 48), paper("ivoryL", { uv: true, ds: true }), g, 0, 0, 0);
  mesh(new THREE.TorusGeometry(r, 0.05, 8, 48), paper("goldL", { uv: true }), g, 0, depth, 0).rotation.x = Math.PI / 2;
  const feed = v3(0, depth + r * 0.78, 0);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2, b0 = v3(Math.cos(a) * r * 0.9, depth * 0.85, Math.sin(a) * r * 0.9), dd = feed.clone().sub(b0), s0 = mesh(cylGeo(0.03, 0.03, dd.length(), 6), paper("brown", { uv: true }), g, 0, 0, 0); s0.position.copy(b0).addScaledVector(dd, 0.5); s0.quaternion.setFromUnitVectors(v3(0, 1, 0), dd.normalize()); }
  mesh(cylGeo(0.12, 0.18, 0.3, 12), paper("coral", { uv: true }), g, 0, feed.y, 0);
  return g;
}
function envelope() {
  const g = new THREE.Group();
  rbox(3.2, 2.1, 0.08, 0.04, "ivoryL", g, 0, 0, 0);
  cut(sh.poly([[-1.58, 1.02], [1.58, 1.02], [0, -0.1]]), 0.03, "ivoryS", g, 0, 0, 0.07);
  cut(sh.poly([[-1.58, -1.02], [0, 0.15], [-1.58, 0.95]]), 0.02, "ivory", g, 0, 0, 0.06);
  cut(sh.poly([[1.58, -1.02], [0, 0.15], [1.58, 0.95]]), 0.02, "ivory", g, 0, 0, 0.06);
  card(label("SURAT SUARA", { w: 512, h: 96, font: "bold 52px Georgia, serif", bg: PAL.ivoryL, border: null }), 1.5, 0.28, g, -0.6, -0.75, 0.1, "ivoryS");
  const seal = new THREE.Group(); seal.position.set(0, -0.05, 0.14); g.add(seal);
  const sb = mesh(new THREE.CylinderGeometry(0.46, 0.5, 0.12, 28), paper(PAL.wax, { uv: true }), seal, 0, 0, 0); sb.rotation.x = Math.PI / 2;
  const lockT = printTex(256, 256, (c) => {
    c.fillStyle = PAL.wax; c.fillRect(0, 0, 256, 256); c.strokeStyle = "#7d1f19"; c.lineWidth = 10; c.beginPath(); c.arc(128, 128, 112, 0, 6.283); c.stroke();
    c.fillStyle = "#f2d58e"; c.fillRect(78, 116, 100, 78); c.lineWidth = 16; c.strokeStyle = "#f2d58e"; c.beginPath(); c.arc(128, 116, 32, Math.PI, 0); c.stroke();
    c.fillStyle = "#7d1f19"; c.beginPath(); c.arc(128, 148, 11, 0, 6.283); c.fill(); c.fillRect(123, 150, 10, 26);
  });
  mesh(new THREE.CircleGeometry(0.42, 32), new THREE.MeshStandardMaterial({ map: lockT, roughness: 0.6, envMapIntensity: 0.5 }), seal, 0, 0, 0.065, false);
  return { g, seal };
}
function keyMesh(color = "gold") {
  const g = new THREE.Group();
  const bow = sh.circle(0.32); bow.holes = [(() => { const p = new THREE.Path(); p.absarc(0, 0, 0.13, 0, Math.PI * 2, true); return p; })()];
  cut(bow, 0.07, color, g, 0, 0, 0);
  cut(sh.rect(1.0, 0.13), 0.07, color, g, 0.78, 0, 0);
  cut(sh.rect(0.12, 0.2), 0.07, color, g, 1.08, -0.15, 0);
  cut(sh.rect(0.12, 0.14), 0.07, color, g, 1.24, -0.12, 0);
  return g;
}
function planeGeo() {
  const p = [0.62, 0, 0, -0.45, 0.02, 0.4, -0.45, 0.02, 0, 0.62, 0, 0, -0.45, 0.02, 0, -0.45, 0.02, -0.4, 0.62, 0, 0, -0.45, -0.15, 0, -0.45, 0.02, 0];
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); g.computeVertexNormals(); return g;
}

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 0.82;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.1, 2000);
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const s = K;
  const E = {
    k400: A_("s1:400", 2.4), kepala: A_("s1:kepala", 4), pulang: A_("s1:pulang", 6.3),
    tiga2: A_("s2:Tiga", s.s2 + 2.6), stasiun2: A_("s2:Stasiun", s.s2 + 4), memilih: A_("s2:memilih", s.s2 + 6.5), kabin: A_("s2:kabin", s.s2 + 7.6),
    dimulai: A_("s3:Dimulai", s.s3), terbang: A_("s3:terbang", s.s3 + 2), meminta: A_("s3:meminta", s.s3 + 3), warga: A_("s3:warga", s.s3 + 4.6), bab: A_("s3:Bab", s.s3 + 7.6), texas: A_("s3:Texas", s.s3 + 9.6), terdaftar: A_("s3:terdaftar", s.s3 + 11.5),
    siapkan: A_("s4:menyiapkan", s.s4 + 1.5), enkrip: A_("s4:terenkripsi", s.s4 + 3.6), mission4: A_("s4:Mission", s.s4 + 4.7), houston: A_("s4:Houston", s.s4 + 5.7), kirim4: A_("s4:mengirimnya", s.s4 + 6.3), stasiun4: A_("s4:stasiun", s.s4 + 7.5), kunci: A_("s4:kunci", s.s4 + 8.4),
    isi: A_("s5:mengisinya", s.s5 + 0.8), jalur: A_("s5:Jalur", s.s5 + 2.4), naik: A_("s5:naik", s.s5 + 4.9), tdrs: A_("s5:TDRS", s.s5 + 6.6), turun: A_("s5:turun", s.s5 + 7.6), white: A_("s5:White", s.s5 + 8.9), mexico: A_("s5:Mexico", s.s5 + 10), lewat: A_("s5:lewat", s.s5 + 10.6), mission5: A_("s5:Mission", s.s5 + 11), petugas5: A_("s5:petugas", s.s5 + 12.6),
    memutar: A_("s6:memutar", s.s6 + 0.6), melaju: A_("s6:melaju", s.s6 + 1.8), antena: A_("s6:antena", s.s6 + 5.4), menit: A_("s6:menit", s.s6 + 7.4), satelit: A_("s6:Satelit", s.s6 + 8), geo: A_("s6:geostasioner", s.s6 + 9.4), selalu: A_("s6:selalu", s.s6 + 13.4), melihat2: A_("s6:melihatnya#2", s.s6 + 14),
    total: A_("s7:Total", s.s7), k72: A_("s7:72.000", s.s7 + 1.6), seperempat: A_("s7:seperempat", s.s7 + 4.4), isinya: A_("s7:Isinya", s.s7 + 5.6), terkunci: A_("s7:terkunci", s.s7 + 6.5), hanya: A_("s7:hanya", s.s7 + 7.4), petugas7: A_("s7:petugas", s.s7 + 8.7), buka: A_("s7:membukanya", s.s7 + 10),
    sejauh: A_("s8:Sejauh", s.s8), minta: A_("s8:minta", s.s8 + 3), kirim8: A_("s8:kirim", s.s8 + 3.8), rahasia: A_("s8:rahasia", s.s8 + 4.3),
  };

  const S = new THREE.Scene();
  S.background = new THREE.Color(PAL.navyD);
  S.add(cam);
  const pm = new THREE.PMREMGenerator(r);
  S.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  pm.dispose();

  // ---------- light: warm key from the upper left (shadow follows the shot), cool fill, warm hemisphere ----------
  const key = new THREE.DirectionalLight("#fff1dc", 1.25);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03; key.shadow.radius = 4;
  S.add(key, key.target);
  const KD = v3(-0.5, 0.72, 0.48).normalize();
  const fill = new THREE.DirectionalLight("#e2e9f6", 0.32); fill.position.set(0.7, 0.2, 0.7); S.add(fill);
  S.add(new THREE.HemisphereLight("#fdf6ea", "#5a5058", 0.42));

  // ---------- layered paper sky ----------
  const BG = new THREE.Group(); S.add(BG);
  mesh(new THREE.PlaneGeometry(900, 900), paper("navy", { uv: true }), BG, 0, 0, -190, false);
  const neb = [["#2f3d6b", -120, 60, 120, 11], ["#34467a", 90, -40, 140, 12], ["#3a4c80", -40, 150, 100, 13], ["#2b3963", 130, 130, 90, 14], ["#33427a", -150, -110, 110, 15]];
  neb.forEach(([c, x, y, w, sd], i) => cut(sh.cloud(w, 5, sd), 0.6, c, BG, x, y, -170 + i * 4, {}));
  {
    const R = mulberry(77), n = 170, sg = extrude(sh.star(0.9, 0.38), 0.15);
    const st1 = new THREE.InstancedMesh(sg, pair("goldL"), n), st2 = new THREE.InstancedMesh(sg, pair("ivoryL"), n);
    const d = new THREE.Object3D();
    for (let i = 0; i < n * 2; i++) {
      const z = -60 - R() * 100, sc = (0.5 + R() * 1.3) * (1 + (-z - 60) / 80);
      d.position.set((R() - 0.5) * (300 + -z * 1.6), -80 + R() * (260 + -z), z); d.rotation.set(0, 0, R() * 6); d.scale.setScalar(sc); d.updateMatrix();
      (i < n ? st1 : st2).setMatrixAt(i % n, d.matrix);
    }
    BG.add(st1, st2);
  }

  // ---------- the paper planet ----------
  const R0 = 30, C = v3(0, -30, 0), RIM = R0 + 0.35, DEP = 14;
  const rimPt = (f, h = 0, z = 0) => v3(C.x + (RIM + h) * Math.sin(f), C.y + (RIM + h) * Math.cos(f), z);
  const onRim = (o, f, h = 0, z = 0) => { o.position.copy(rimPt(f, h, z)); o.rotation.z = -f; return o; };
  const EARTH = new THREE.Group(); EARTH.position.copy(C); S.add(EARTH);
  const drum = new THREE.CylinderGeometry(R0, R0, DEP, 160, 1); drum.rotateX(Math.PI / 2);
  mesh(drum, [paper("cobalt", { uv: true }), paper("cobalt", { uv: true }), paper("cobalt", { uv: true })], EARTH, 0, 0, 0);
  // ocean rings printed on the face + cut-paper continents
  mesh(extrude((() => { const a = sh.circle(R0 - 1.2); a.holes = [(() => { const p = new THREE.Path(); p.absarc(0, 0, R0 - 2.4, 0, 6.283, true); return p; })()]; return a; })(), 0.06), pair("cobaltL"), EARTH, 0, 0, DEP / 2 + 0.03);
  const cont = [[-14, 12, 8, 3, "mint"], [10, 15, 6.5, 4, "mintD"], [16, -4, 7, 5, "goldL"], [-8, -10, 9, 6, "mint"], [-20, -8, 4, 7, "mintD"], [3, 0, 4.5, 8, "goldL"], [6, -20, 5, 9, "mint"], [-3, 21, 4, 10, "goldL"]];
  cont.forEach(([x, y, rr, sd, c]) => { cut(sh.blob(rr, sd), 0.16, c, EARTH, x, y, DEP / 2 + 0.12); cut(sh.blob(rr * 0.55, sd + 50), 0.12, c === "goldL" ? "gold" : "mintL", EARTH, x + rr * 0.15, y + rr * 0.1, DEP / 2 + 0.26); });
  // atmosphere halo layers behind the drum
  const ring = (a, b) => { const s0 = sh.circle(b); s0.holes = [(() => { const p = new THREE.Path(); p.absarc(0, 0, a, 0, 6.283, true); return p; })()]; return s0; };
  cut(ring(R0 - 0.5, R0 + 2.4), 0.1, "#7f9bd0", EARTH, 0, 0, -DEP / 2 - 0.3);
  cut(ring(R0 + 2.3, R0 + 3.8), 0.1, "#5b72a8", EARTH, 0, 0, -DEP / 2 - 0.6);
  // land strip on the rim: sand base, grass on the Texas side, desert on the New Mexico side
  const sector = (r1, r2, f1, f2) => { const s0 = new THREE.Shape(); s0.absarc(0, 0, r2, Math.PI / 2 - f1, Math.PI / 2 - f2, true); s0.absarc(0, 0, r1, Math.PI / 2 - f2, Math.PI / 2 - f1, false); s0.closePath(); return s0; };
  cut(sector(R0 - 0.3, RIM - 0.1, -0.5, 0.5), DEP + 0.6, "sand", EARTH, 0, 0, 0);
  cut(sector(RIM - 0.12, RIM, -0.5, 0.06), DEP + 0.5, "#86bfa6", EARTH, 0, 0, 0);
  cut(sector(RIM - 0.12, RIM, 0.06, 0.5), DEP + 0.5, "#dcc08a", EARTH, 0, 0, 0);
  // limb clouds: in front of the face just under the rim and a row behind the buildings
  const CL = new THREE.Group(); S.add(CL);
  [[-0.42, -1.2, 7.6, 7, 21], [-0.1, -1.6, 7.9, 5.5, 22], [0.25, -1.3, 7.5, 6.5, 23], [0.47, -1.0, 7.2, 5, 24], [-0.3, 1.0, -5.5, 6, 25], [0.02, 1.6, -6, 7, 26], [0.33, 1.2, -5.5, 5.5, 27], [-0.55, 0.5, -3, 5, 28]]
    .forEach(([f, h, z, w, sd], i) => { const c0 = cut(sh.cloud(w, 4, sd), 0.12, i % 2 ? "ivory" : "#e2d6c0", CL, 0, 0, 0); onRim(c0, f, h, z); c0.userData = { f, h, z, ph: i }; });

  // foreground paper bushes along the front edge of the land strip (texture for the near band in ground close-ups)
  { const R = mulberry(303); for (let i = 0; i < 30; i++) { const f = -0.49 + i * 0.033 + (R() - 0.5) * 0.01, w = 0.7 + R() * 0.8, desert = f > 0.06;
      const c = desert ? (R() < 0.5 ? "#c9a96a" : "mintD") : (R() < 0.4 ? "mintD" : R() < 0.7 ? "#5f9a80" : "mint");
      const b = cut(sh.cloud(w, 3, 400 + i), 0.08, c, S, 0, 0, 0); b.scale.set(1, 0.55 + R() * 0.35, 1); onRim(b, f, -0.02, 5.4 + R() * 1.2); } }
  // ---------- ground stations ----------
  const F = { booklet: -0.36, clerk: -0.24, walker: -0.16, mcc: -0.07, ws: 0.17 };
  const clerk = building({ w: 3.4, h: 2.6, d: 2.6, wall: "coralL", roof: "cobalt", trim: "ivoryL", win: "brownD", cols: 3, rows: 1, door: "cobaltD", gable: 1.0, glow: 0.25 });
  card(label("PETUGAS PEMILU", { w: 640, h: 120, font: "bold 66px Georgia, serif" }), 2.1, 0.4, clerk, 0, 3.12, 1.42);
  onRim(clerk, F.clerk, 0, 0); S.add(clerk);
  const bbox = new THREE.Group(); clerk.add(bbox); bbox.position.set(1.15, 0, 2.0);
  rbox(0.75, 0.7, 0.6, 0.05, "ivoryL", bbox, 0, 0.35, 0); rbox(0.8, 0.08, 0.65, 0.03, "cobaltD", bbox, 0, 0.72, 0); rbox(0.36, 0.02, 0.08, 0.01, "ink", bbox, 0, 0.77, 0);
  const sgn = new THREE.Group(); onRim(sgn, F.clerk - 0.036, 0, 2.3); S.add(sgn);
  mesh(cylGeo(0.04, 0.04, 0.8, 8), paper("brown", { uv: true }), sgn, -0.45, 0.4, 0); mesh(cylGeo(0.04, 0.04, 0.8, 8), paper("brown", { uv: true }), sgn, 0.45, 0.4, 0); card(label("HARRIS COUNTY", { w: 512, h: 150, font: "bold 58px Georgia, serif", sub: "TEXAS" }), 1.2, 0.36, sgn, 0, 0.82, 0.06);
  const mcc = building({ w: 4.2, h: 3.0, d: 3.0, wall: "cobaltL", roof: "cobaltD", trim: "ivoryL", win: "brownD", cols: 4, rows: 1, door: "coral", glow: 0.45 });
  rbox(0.1, 0.5, 0.1, 0.03, "brown", mcc, -1.0, 3.35, 1.0); rbox(0.1, 0.5, 0.1, 0.03, "brown", mcc, 1.0, 3.35, 1.0);
  card(label("MISSION CONTROL", { w: 720, h: 150, font: "bold 64px Georgia, serif", sub: "HOUSTON" }), 2.9, 0.6, mcc, 0, 3.75, 1.06);
  card(label("AUDIRA", { w: 400, h: 110, font: "bold 70px Georgia, serif", bg: PAL.goldL, border: PAL.brownD }), 0.95, 0.26, mcc, 1.35, 1.3, 1.62);
  const mdish = dish(0.55, 0.22); mdish.position.set(-1.5, 3.45, -0.8); mdish.rotation.z = 0.3; mcc.add(mdish);
  mesh(cylGeo(0.05, 0.08, 0.35, 8), paper("brown", { uv: true }), mcc, -1.5, 3.3, -0.8);
  onRim(mcc, F.mcc, 0, 0); S.add(mcc);
  // White Sands: paper dunes, big dish on a pedestal
  const WS = new THREE.Group(); onRim(WS, F.ws, 0, 0); S.add(WS);
  [[-1.6, -3.2, 6, 31, "goldL"], [1.8, -3.6, 5, 32, "sand"], [0.2, -4.4, 8, 33, "#e3c48a"]].forEach(([x, z, w, sd, c]) => cut(sh.cloud(w, 3, sd), 0.12, c, WS, x, -0.05, z));
  mesh(cylGeo(0.35, 0.55, 1.6, 16), paper("ivoryS", { uv: true }), WS, 0, 0.8, 0);
  rbox(1.0, 0.5, 0.9, 0.1, "ivoryL", WS, 0, 1.75, 0);
  const bigDish = dish(1.9, 0.62); bigDish.position.set(0, 2.1, 0); bigDish.rotation.set(0.15, 0, 0.42); WS.add(bigDish);
  const wsS = new THREE.Group(); wsS.position.set(1.8, 0, 2.0); WS.add(wsS);
  mesh(cylGeo(0.05, 0.05, 1.2, 8), paper("brown", { uv: true }), wsS, 0, 0.6, 0); card(label("WHITE SANDS", { w: 560, h: 160, font: "bold 64px Georgia, serif", sub: "NEW MEXICO" }), 1.45, 0.42, wsS, 0, 1.3, 0.06);
  // yucca and paper trees
  const tree = (f, z, c, hh, kind) => {
    const g = new THREE.Group(); onRim(g, f, 0, z); S.add(g);
    mesh(cylGeo(0.07, 0.09, hh * 0.45, 8), paper("brown", { uv: true }), g, 0, hh * 0.22, 0);
    if (kind === "round") cut(sh.circle(hh * 0.33), 0.1, c, g, 0, hh * 0.68, 0); else cut(sh.poly([[-hh * 0.3, hh * 0.3], [hh * 0.3, hh * 0.3], [0, hh * 1.05]]), 0.1, c, g, 0, 0, 0);
    const b2 = kind === "round" ? cut(sh.circle(hh * 0.33), 0.1, c, g, 0, hh * 0.68, 0) : cut(sh.poly([[-hh * 0.3, hh * 0.3], [hh * 0.3, hh * 0.3], [0, hh * 1.05]]), 0.1, c, g, 0, 0, 0);
    b2.rotation.y = Math.PI / 2;
  };
  tree(-0.44, -1, "mintD", 2.2, "cone"); tree(-0.465, 1.2, "mint", 1.6, "round"); tree(-0.12, -1.6, "mint", 1.9, "round"); tree(-0.005, -0.8, "mintD", 2.1, "cone");
  tree(0.03, 1.8, "mint", 1.3, "round"); tree(0.27, -0.5, "mintD", 1.2, "cone"); tree(0.31, 1.6, "mintD", 0.9, "cone"); tree(0.38, -1.5, "mint", 1.1, "cone");
  // the law booklet (pops open at "Bab")
  const BK = new THREE.Group(); onRim(BK, F.booklet, 0, 1.6); S.add(BK);
  const bkL = new THREE.Group(), bkR = new THREE.Group(); BK.add(bkL, bkR);
  rbox(1.15, 1.5, 0.06, 0.03, "cobaltD", bkL, -0.58, 0.75, 0); card(label("UU PEMILU", { w: 400, h: 300, font: "bold 64px Georgia, serif", sub: "TEXAS", subFont: "bold 60px Georgia, serif", border: null }), 0.95, 0.7, bkL, -0.58, 0.85, 0.05, "ivoryS");
  rbox(1.15, 1.5, 0.06, 0.03, "cobaltD", bkR, 0.58, 0.75, 0); card(label("BAB 106", { w: 400, h: 300, font: "bold 92px Georgia, serif", border: null, fg: PAL.wax }), 0.95, 0.7, bkR, 0.58, 0.85, 0.05, "ivoryS");
  // pre-flight astronaut on Earth with the request form
  const walker = astronaut(3); walker.g.scale.setScalar(1.25); S.add(walker.g);
  pose(walker, { lh: 0, lk: 0, rh: 0, rk: 0, lsx: 0.1, lsz: -0.2, le: -0.2, rsx: -0.9, rsz: 0.15, re: -0.7, hy: -0.4 });
  onRim(walker.g, F.walker, 1.08, 1.4); walker.g.rotation.y = -0.5;
  const form = card(label("FORMULIR", { w: 300, h: 380, font: "bold 52px Georgia, serif", sub: "minta surat suara", subFont: "600 30px Arial, sans-serif" }), 0.42, 0.53, S, 0, 0, 0, "ivoryS");

  // ---------- the paper space station ----------
  const ISS = new THREE.Group(); S.add(ISS);
  const issIn = new THREE.Group(); ISS.add(issIn);
  const shell = (rr, len, open, matO, matI) => {
    const gO = new THREE.CylinderGeometry(rr, rr, len, 48, 1, true, open, Math.PI * 2 - 2 * open); gO.rotateZ(Math.PI / 2);
    mesh(gO, matO, issIn, 0, 0, 0); const gI = gO.clone(); mesh(gI, matI, issIn, 0, 0, 0).material = matI; return gO;
  };
  const mO = paper("ivoryL", { uv: true }), mI = paper("mintL", { uv: true, back: true });
  shell(1.75, 7.2, 0.95, mO, mI);
  // band trims and opening lips
  for (const x of [-3.5, -1.15, 1.15, 3.5]) { const b = new THREE.CylinderGeometry(1.8, 1.8, 0.14, 48, 1, true, 0.95, Math.PI * 2 - 1.9); b.rotateZ(Math.PI / 2); mesh(b, paper("goldL", { uv: true, ds: true }), issIn, x, 0, 0); }
  for (const sg of [1, -1]) rbox(7.3, 0.1, 0.1, 0.03, "gold", issIn, 0, sg * 1.75 * Math.sin(0.95), 1.75 * Math.cos(0.95));
  for (const x of [-3.6, 3.6]) { const cap = mesh(new THREE.CircleGeometry(1.75, 40), paper("ivoryS", { uv: true, ds: true }), issIn, x, 0, 0); cap.rotation.y = Math.PI / 2; }
  // booths: back panels, dividers, sleeping bags, label
  const BX = [-2.3, 0, 2.3], BC = ["coralL", "cobaltL", "goldL"];
  BX.forEach((x, i) => { cut(sh.rect(2.0, 2.3, 0.12), 0.05, BC[i], issIn, x, -0.05, -1.2); rbox(0.75, 1.5, 0.12, 0.1, i === 1 ? "cobalt" : i === 0 ? "coral" : "gold", issIn, x - 0.62, -0.15, -1.1); });
  const divS = new THREE.Shape(); for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2; let px = 1.66 * Math.cos(a); const py = 1.66 * Math.sin(a); px = Math.max(px, -0.55); i ? divS.lineTo(px, py) : divS.moveTo(px, py); }
  for (const x of [-1.15, 1.15]) { const d = mesh(extrude(divS, 0.07), pair("ivory"), issIn, x, 0, 0); d.rotation.y = Math.PI / 2; }
  card(label("AUDIRA", { w: 400, h: 110, font: "bold 70px Georgia, serif", bg: PAL.goldL, border: PAL.brownD }), 0.78, 0.21, issIn, 0, 1.0, -1.17);
  const crew = BX.map((x, i) => { const a = astronaut(i); a.g.position.set(x + (i === 1 ? 0.25 : 0.1), -0.45, -0.25); issIn.add(a.g); return a; });
  const bTexE = ballotTex(false), bTexF = ballotTex(true);
  const ballots = crew.map((a, i) => { const b = mesh(new THREE.PlaneGeometry(0.34, 0.45), new THREE.MeshStandardMaterial({ map: bTexE, roughness: 0.9, side: THREE.DoubleSide, envMapIntensity: 0.25 }), a.aR.hand, 0.05, -0.16, 0.1, false); b.rotation.set(-0.5, 0.2, 0); return b; });
  // laptop (centre booth)
  const LT = new THREE.Group(); LT.position.set(-0.42, -0.05, 0.42); LT.rotation.set(0.15, 0.95, 0.1); issIn.add(LT);
  rbox(0.66, 0.04, 0.46, 0.015, "#8d93a0", LT, 0, 0, 0);
  const lid = new THREE.Group(); lid.position.set(0, 0.02, -0.22); lid.rotation.x = -0.25; LT.add(lid);
  rbox(0.66, 0.46, 0.03, 0.015, "#8d93a0", lid, 0, 0.23, 0);
  const scrM = new THREE.MeshStandardMaterial({ map: bTexE, roughness: 0.6, emissive: new THREE.Color("#ffffff"), emissiveMap: bTexE, emissiveIntensity: 0.35, envMapIntensity: 0.25 });
  mesh(new THREE.PlaneGeometry(0.4, 0.4 * 340 / 256 * 0.75), scrM, lid, 0, 0.23, 0.017, false);
  // keys for each astronaut (s4 "kunci akses")
  const keys = crew.map((a, i) => { const k = keyMesh(); k.scale.setScalar(0.32); k.position.set(BX[i] + 0.55, 0.65, 0.3); issIn.add(k); return k; });
  // outside: truss, nodes, solar wings, radiators
  rbox(19, 0.42, 0.42, 0.08, "goldD", ISS, 0, 2.35, -0.6); rbox(0.5, 0.75, 0.5, 0.1, "ivoryS", ISS, 0, 1.9, -0.6);
  for (const x of [-4.6, 4.6]) { const n = mesh(cylGeo(1.15, 1.15, 2.2, 32), paper("ivoryS", { uv: true }), ISS, x, 0, -0.1); n.rotation.z = Math.PI / 2; mesh(cylGeo(1.2, 1.2, 0.12, 32), paper("goldL", { uv: true }), n, 0, 0.9, 0); mesh(cylGeo(1.2, 1.2, 0.12, 32), paper("goldL", { uv: true }), n, 0, -0.9, 0); }
  const wingT = printTex(128, 384, (c) => { c.fillStyle = "#4a66a3"; c.fillRect(0, 0, 128, 384); c.strokeStyle = "#e7b54a"; c.lineWidth = 3; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32, 384); c.stroke(); } for (let j = 0; j <= 12; j++) { c.beginPath(); c.moveTo(0, j * 32); c.lineTo(128, j * 32); c.stroke(); } });
  const wingM = new THREE.MeshStandardMaterial({ map: wingT, roughness: 0.75, metalness: 0.1, envMapIntensity: 0.4, side: THREE.DoubleSide });
  for (const x of [-8.6, -6.5, 6.5, 8.6]) for (const sg of [1, -1]) {
    const wg = new THREE.Group(); wg.position.set(x, 2.35 + sg * 3.05, -0.9); wg.rotation.y = x < 0 ? 0.25 : -0.25; ISS.add(wg);
    mesh(extrude(sh.rect(1.75, 5.4), 0.05), pair("goldD"), wg, 0, 0, -0.04);
    mesh(new THREE.PlaneGeometry(1.65, 5.3), wingM, wg, 0, 0, 0.005, false);
  }
  for (const x of [-2.6, 2.6]) { const rd = rbox(1.6, 0.05, 2.6, 0.02, "ivoryL", ISS, x, 3.0, -1.8); rd.rotation.x = 0.4; }
  // nadir node + docked generic crew capsule + hanging radiators (fill the lower third under the booths)
  const nad = mesh(cylGeo(0.95, 0.95, 2.2, 32), paper("ivoryS", { uv: true }), ISS, 0.9, -2.6, -0.5);
  mesh(cylGeo(1.0, 1.0, 0.12, 32), paper("goldL", { uv: true }), ISS, 0.9, -1.9, -0.5); mesh(cylGeo(1.0, 1.0, 0.12, 32), paper("goldL", { uv: true }), ISS, 0.9, -3.3, -0.5);
  mesh(cylGeo(0.55, 0.55, 0.35, 24), paper("#c3c9d4", { uv: true }), ISS, 0.9, -3.85, -0.5);
  mesh(lathe([[0.001, 0], [0.75, 0.05], [1.2, 0.9], [1.25, 1.05], [0.6, 1.15], [0.001, 1.15]], 40), paper("ivoryL", { uv: true }), ISS, 0.9, -5.2, -0.5).rotation.x = 0;
  mesh(cylGeo(1.27, 1.27, 0.14, 40), paper("cobaltD", { uv: true }), ISS, 0.9, -4.12, -0.5);
  card(label("AUDIRA", { w: 400, h: 110, font: "bold 70px Georgia, serif", bg: PAL.goldL, border: PAL.brownD }), 0.7, 0.19, ISS, 0.9, -4.7, 0.62);
  for (const sx of [-1, 1]) { const rd2 = new THREE.Group(); rd2.position.set(0.9 + sx * 2.6, -2.9, -0.9); ISS.add(rd2); mesh(cylGeo(0.05, 0.05, 1.2, 6), paper("brown", { uv: true }), rd2, -sx * 0.9, 0.2, 0).rotation.z = Math.PI / 2;
    rbox(1.5, 2.6, 0.06, 0.03, "ivoryL", rd2, 0, 0, 0); for (let k = 0; k < 5; k++) rbox(1.5, 0.05, 0.1, 0.02, "goldL", rd2, 0, -1.0 + k * 0.5, 0.05); }
  const issDish = dish(0.38, 0.14); issDish.position.set(1.8, 2.6, -0.6); issDish.rotation.z = -0.6; ISS.add(issDish);

  // ---------- relay satellite (TDRS) ----------
  const FT = 0.08, RT = 62;
  const T0 = v3(C.x + RT * Math.sin(FT), C.y + RT * Math.cos(FT), 0);
  const TD = new THREE.Group(); TD.position.copy(T0); TD.rotation.z = -FT; S.add(TD);
  rbox(1.7, 1.7, 1.7, 0.2, "gold", TD, 0, 0, 0);
  card(label("TDRS", { w: 300, h: 120, font: "bold 80px Georgia, serif", bg: PAL.goldL }), 1.0, 0.4, TD, 0, 0.35, 0.88);
  for (const sx of [-1, 1]) {
    mesh(cylGeo(0.06, 0.06, 1.0, 8), paper("brown", { uv: true }), TD, sx * 1.15, -0.4, 0).rotation.z = sx * 0.9;
    const d = dish(1.25, 0.42); d.position.set(sx * 1.65, -1.05, 0); d.rotation.set(Math.PI, 0, sx * 0.25); TD.add(d);
    const wg = new THREE.Group(); wg.position.set(sx * 3.4, 0.35, -0.3); TD.add(wg);
    mesh(extrude(sh.rect(3.0, 1.25), 0.05), pair("goldD"), wg, 0, 0, -0.04); mesh(new THREE.PlaneGeometry(2.9, 1.15), wingM, wg, 0, 0, 0.005, false);
    mesh(cylGeo(0.05, 0.05, 1.0, 8), paper("brown", { uv: true }), TD, sx * 1.4, 0.35, -0.3).rotation.z = Math.PI / 2;
  }

  // ---------- dashed paper paths ----------
  const dashGeo = rboxGeo(0.5, 0.13, 0.07, 0.03);
  function dashPath(pts, n, scale = 1) {
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    const mat = paper("goldL", { em: "gold", ei: 0.0, nocache: true }), matE = paper("goldL", { edge: true });
    const im = new THREE.InstancedMesh(dashGeo, [mat, matE], n); im.frustumCulled = false; im.castShadow = false; S.add(im);
    const P = [], Q = [], d = new THREE.Object3D(), X = v3(1, 0, 0);
    for (let i = 0; i < n; i++) { const u = (i + 0.5) / n; P.push(curve.getPointAt(u)); Q.push(new THREE.Quaternion().setFromUnitVectors(X, curve.getTangentAt(u).normalize())); }
    return {
      curve, mat, im,
      set(rev, glow = 0, pulse = -1) {
        mat.emissiveIntensity = glow; im.visible = rev > 0.002;
        for (let i = 0; i < n; i++) {
          const u = (i + 0.5) / n, on = clamp01((rev - u) * n * 0.6), bump = pulse >= 0 ? Math.exp(-((u - pulse) ** 2) / 0.002) * 0.8 : 0;
          d.position.copy(P[i]); d.quaternion.copy(Q[i]); d.scale.setScalar(Math.max(0.0001, on * scale * (1 + bump))); d.updateMatrix(); im.setMatrixAt(i, d.matrix);
        }
        im.instanceMatrix.needsUpdate = true;
      },
    };
  }
  const F0 = -0.03, RI = 40;
  const I0 = v3(C.x + RI * Math.sin(F0), C.y + RI * Math.cos(F0), 0);
  const IL = (x, y, z) => v3(x, y, z).applyAxisAngle(v3(0, 0, 1), -F0).add(I0); // ISS-local to world at rest
  const ruler = dashPath([rimPt(0.0, 0.3, 3.2), rimPt(0.0, 6, 3.2), IL(1.3, -1.9, 3.2)], 24);
  const upP = dashPath([rimPt(F.mcc - 0.035, 3.7, 0.4), rimPt(-0.06, 7, 3), IL(0.4, -1.9, 1.6)], 28);
  const pA = [IL(0.3, 0.2, 2.3), IL(2.5, 4, 4), v3(T0.x - 3, T0.y - 12, 3.5), T0.clone().add(v3(-0.6, -1.6, 1.2))];
  const pB = [T0.clone().add(v3(0.6, -1.6, 1.2)), v3(T0.x + 3, T0.y - 14, 4), rimPt(F.ws + 0.02, 9, 3), rimPt(F.ws, 3.1, 0.6)];
  const gpts = []; for (let i = 0; i <= 24; i++) { const f = F.ws - 0.02 - (i / 24) * (F.ws - 0.02 - F.clerk - 0.01); gpts.push(rimPt(f, 0.12 + 0.35 * Math.abs(Math.sin(i * 0.55)) * 0, 2.6)); }
  const segA = dashPath(pA, 46), segB = dashPath(pB, 46), segC = dashPath(gpts, 40, 0.8);
  const rulerTag = card(label("400 km", { w: 360, h: 130, font: "bold 84px Georgia, serif", bg: PAL.goldL, border: PAL.brownD }), 1.9, 0.68, S, 0, 0, 0);
  rulerTag.position.copy(rimPt(0.0, 7.2, 3.4)).add(v3(1.6, 0, 0)); rulerTag.rotation.z = 0;

  // ---------- orbit ring + visibility fans (s6) ----------
  const orbit = new THREE.InstancedMesh(rboxGeo(0.9, 0.18, 0.08, 0.04), [paper("ivoryL", { em: "ivoryL", ei: 0.15 }), paper("ivoryL", { edge: true })], 120);
  { const d = new THREE.Object3D(); for (let i = 0; i < 120; i++) { const a = (i / 120) * Math.PI * 2; d.position.set(C.x + RI * Math.sin(a), C.y + RI * Math.cos(a), -0.5); d.rotation.set(0, 0, -a); d.updateMatrix(); orbit.setMatrixAt(i, d.matrix); } }
  orbit.frustumCulled = false; S.add(orbit);
  const fanMat = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, side: THREE.DoubleSide });
  const fan = (apex, f1, f2, rad, mat, z) => {
    const pts = [apex.x, apex.y, z]; const N = 24;
    for (let i = 0; i <= N; i++) { const f = f1 + ((f2 - f1) * i) / N; pts.push(C.x + rad * Math.sin(f), C.y + rad * Math.cos(f), z); }
    const idx = []; for (let i = 1; i <= N; i++) idx.push(0, i, i + 1);
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, mat); m.renderOrder = 2; S.add(m); return m;
  };
  const WSV = 0.13, TDV = 1.2;
  const fanG = fan(rimPt(F.ws, 2.8, 0), F.ws - WSV, F.ws + WSV, RI, fanMat("#f2d58e", 0.3), -0.8);
  const fanT = fan(T0, FT - TDV, FT + TDV, RI, fanMat("#cbe8da", 0.22), -1.2);
  const linkMat = new THREE.MeshStandardMaterial({ color: "#f2d58e", emissive: new THREE.Color("#f2b84a"), emissiveIntensity: 4.5, roughness: 0.5 });
  const link = (m) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1, 8), m); l.frustumCulled = false; S.add(l); return l; };
  const linkG = link(linkMat), linkT = link(linkMat);
  const placeLink = (l, a, b, on) => { l.visible = on > 0.02; if (!l.visible) return; const d = b.clone().sub(a), len = d.length(); l.position.copy(a).addScaledVector(d, 0.5); l.quaternion.setFromUnitVectors(v3(0, 1, 0), d.normalize()); l.scale.set(on, len, on); };

  // ---------- travellers: envelope (up), paper plane (down), hero envelope with two keys (s7) ----------
  const ENV = envelope(); S.add(ENV.g);
  const HERO = envelope(); S.add(HERO.g);
  const kA = keyMesh("gold"), kB = keyMesh("coral"); HERO.g.add(kA, kB);
  const PL = new THREE.Group(); S.add(PL);
  mesh(planeGeo(), new THREE.MeshStandardMaterial({ color: "#fbf6ea", roughness: 0.9, side: THREE.DoubleSide, envMapIntensity: 0.25 }), PL, 0, 0, 0);
  const plSeal = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 16), paper(PAL.wax, { uv: true }), PL, -0.1, 0.05, 0);

  // plane schedule (pure in t)
  const segs = [
    { c: segA, a: E.naik - 0.35, b: E.tdrs + 0.15 },
    { c: segB, a: E.turun - 0.1, b: E.white + 0.55 },
    { c: segC, a: E.white + 0.75, b: E.petugas5 + 0.35 },
  ];
  const race = { a: E.seperempat - 0.15, b: E.seperempat + 0.6 };
  const tq = new THREE.Quaternion(), X1 = v3(1, 0, 0);
  function planePose(t) {
    // teaser in s1: out of the module and down toward the Earth
    if (t > E.pulang - 0.4 && t < s.s1e + 0.6) {
      const u = ramp(t, E.pulang - 0.4, s.s1e + 0.4), p = IL(0.3, -0.3, 1.8).lerp(IL(3.2, -6.5, 7), u); p.y += Math.sin(u * Math.PI) * 1.2;
      return { p, dir: v3(0.45, -0.8, 0.4).normalize(), vis: 1 - ramp(t, s.s1e + 0.1, s.s1e + 0.6), sc: 0.8 };
    }
    for (const sg of segs) if (t >= sg.a && t <= sg.b) { const u = ramp(t, sg.a, sg.b) * 0.999; return { p: sg.c.curve.getPointAt(u), dir: sg.c.curve.getTangentAt(u), vis: 1, sc: sg.c === segC ? 0.75 : 1.1 }; }
    if (t > race.a && t < race.b) {
      const u = ramp(t, race.a, race.b) * 2.999, k = Math.floor(u), f = u - k, c = [segA, segB, segC][k];
      return { p: c.curve.getPointAt(Math.min(0.999, f)), dir: c.curve.getTangentAt(Math.min(0.999, f)), vis: 1, sc: 1.2 };
    }
    return { vis: 0 };
  }

  // ---------- camera (keys on scene/word anchors; roll follows the planet radius) ----------
  const RP = (f, h, z) => { const p = rimPt(f, h, z); return [p.x, p.y, p.z]; };
  const L3 = (p) => [p.x, p.y, p.z];
  const cK = [
    [0, ...L3(IL(0.75, 0.35, 6.6)), ...L3(IL(0.1, 0.15, 0))],
    [E.k400 - 0.3, ...L3(IL(1.6, -0.5, 20)), ...L3(IL(0.6, -2.2, 0))],
    [E.kepala + 0.6, 1.5, 5.5, 77, 0.3, 6.1, 0],
    [s.s1e, 0.8, 6.0, 70, -0.2, 6.4, 0],
    [s.s2 + 0.5, ...L3(IL(3.5, 1.0, 26)), ...L3(IL(0.2, 0.8, 0))],
    [E.tiga2, ...L3(IL(1.3, 0.85, 16.2)), ...L3(IL(0, 0.65, 0))],
    [E.kabin, ...L3(IL(-1.6, 0.4, 12.5)), ...L3(IL(-0.4, 0.25, 0))],
    [s.s2e + 0.1, ...L3(IL(-1.5, -4, 22)), ...L3(IL(-0.8, -5, 0))],
    [s.s3 + 0.8, ...RP(-0.17, 8, 25), ...RP(-0.19, 2.6, 0)],
    [E.meminta, ...RP(-0.214, 3.9, 18.2), ...RP(-0.216, 1.95, 0)],
    [E.bab - 0.8, ...RP(-0.222, 3.7, 17.6), ...RP(-0.22, 1.9, 0)],
    [E.bab + 0.4, ...RP(-0.3, 3.9, 21.5), ...RP(-0.3, 1.85, 0)],
    [s.s3e, ...RP(-0.27, 4.2, 22), ...RP(-0.265, 1.9, 0)],
    [E.siapkan, ...RP(-0.152, 5.2, 26.5), ...RP(-0.15, 2.15, 0)],
    [E.houston + 0.4, ...RP(-0.142, 5.3, 26), ...RP(-0.14, 2.25, 0)],
    [E.stasiun4, ...L3(IL(1.8, -3.5, 28)), ...L3(IL(0.2, -2.6, 0))],
    [E.kunci + 0.3, ...L3(IL(1.1, 0.8, 15)), ...L3(IL(0, 0.5, 0))],
    [s.s4e + 0.1, ...L3(IL(1.1, 0.5, 8.5)), ...L3(IL(0.1, 0.1, 0))],
    [E.isi + 0.4, ...L3(IL(1.2, 0.45, 5.4)), ...L3(IL(0.05, -0.05, 0))],
    [E.naik - 0.3, ...L3(IL(2.4, 1.6, 15)), ...L3(IL(1.2, 2.4, 0))],
    [E.tdrs + 0.2, T0.x - 2.4, T0.y - 1.6, 24, T0.x - 1.0, T0.y + 0.7, 0],
    [E.turun + 0.4, T0.x + 0.5, T0.y - 16, 34, T0.x + 0.6, T0.y - 17.5, 0],
    [E.white + 0.55, ...RP(F.ws - 0.03, 6.8, 23), ...RP(F.ws - 0.02, 3.0, 0)],
    [E.mission5 + 0.3, ...RP(F.mcc + 0.015, 4.3, 15.5), ...RP(F.mcc, 1.9, 0)],
    [E.petugas5 + 0.4, ...RP(F.clerk + 0.03, 4.1, 15), ...RP(F.clerk, 1.8, 0)],
    [s.s5e + 0.1, ...RP(-0.13, 10, 36), ...RP(-0.12, 5, 0)],
    [E.melaju, 2.0, 15.5, 129, 1.5, 13.5, 0],
    [E.satelit, 1.4, 15, 126, 1.5, 13.6, 0],
    [s.s6e, 0.8, 15.5, 122, 1.5, 13.8, 0],
    [E.total + 0.4, 3.2, 12.5, 104, 2.6, 11.5, 0],
    [E.seperempat + 0.7, 3.0, 12.3, 100, 2.6, 11.6, 0],
    [E.isinya + 0.5, 2.7, 15.6, 56, 2.5, 15.3, 40],
    [E.buka + 0.3, 2.4, 15.5, 54.8, 2.5, 15.3, 40],
    [s.s8 + 0.6, 2.2, 13, 70, 1.8, 11, 0],
    [E.kirim8, 1.5, 5.5, 77, 0.3, 6.1, 0],
    [K.end + 0.6, 0.9, 6.0, 72, -0.3, 6.5, 0],
  ];
  // keep keys strictly increasing even if the estimated anchors crowd together
  for (let i = 1; i < cK.length; i++) if (cK[i][0] <= cK[i - 1][0] + 0.25) cK[i][0] = cK[i - 1][0] + 0.25;
  const camAt = track(cK);

  // ---------- post: NaN guard -> soft bloom -> neutral tone map -> warm paper grade ----------
  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  const QV = "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}";
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } }, vertexShader: QV,
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);bvec4 n=isnan(c);bvec4 f=isinf(c);if(any(n)||any(f))c=vec4(0.,0.,0.,1.);gl_FragColor=clamp(c,0.,16.);}" })));
  comp.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.3, 0.35, 2.6));
  comp.addPass(new OutputPass());
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } }, vertexShader: QV,
    fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;
      float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,1.06);c=c*vec3(1.03,1.0,.95)+vec3(.012,.006,0.)*(1.-l);
      gl_FragColor=vec4(clamp(c,0.,1.),1.);}` })));

  const up = v3(0, 1, 0), tmp = v3(0, 0, 0);
  return (t) => {
    // ----- camera -----
    const c = camAt(t);
    if (t > E.isinya - 0.6 && t < s.s8 + 0.8) c[2] = Math.max(c[2], 54.5); // no Hermite overshoot into the hero envelope
    cam.position.set(c[0] + 0.04 * Math.sin(t * 0.7), c[1] + 0.035 * Math.sin(t * 0.53 + 1), c[2]);
    const tg = v3(c[3], c[4], c[5]);
    up.copy(tg).sub(C).setZ(0).normalize(); if (!(up.lengthSq() > 0.5)) up.set(0, 1, 0);
    cam.up.copy(up); cam.lookAt(tg); cam.updateMatrixWorld(true);
    const dist = cam.position.distanceTo(tg);
    const ss = Math.max(7, Math.min(70, dist * 0.42));
    key.position.copy(tg).addScaledVector(KD, 120); key.target.position.copy(tg); key.target.updateMatrixWorld();
    const sc_ = key.shadow.camera; sc_.left = -ss; sc_.right = ss; sc_.top = ss; sc_.bottom = -ss; sc_.near = 1; sc_.far = 260; sc_.updateProjectionMatrix();
    BG.position.set(cam.position.x * 0.35, cam.position.y * 0.35, 0);

    // ----- ISS: rest above the Earth, two fast laps in s6, smaller in the diagram shots -----
    const lap = ramp(t, E.melaju, E.menit + 0.2) + ramp(t, E.satelit + 0.3, E.melihat2 + 0.5);
    const fI = F0 + lap * Math.PI * 2;
    const wide = Math.max(ramp(t, s.s5e - 0.4, E.melaju), 0) * (1 - ramp(t, E.isinya - 0.3, E.isinya + 0.6));
    const wide8 = ramp(t, s.s8, E.kirim8) * 0;
    const scI = 1 - 0.5 * wide - wide8;
    ISS.position.set(C.x + RI * Math.sin(fI), C.y + RI * Math.cos(fI), 0);
    ISS.rotation.set(0.03 * Math.sin(t * 0.4), 0.05 * Math.sin(t * 0.31), -fI);
    ISS.scale.setScalar(scI);
    crew.forEach((a, i) => {
      const bob = Math.sin(t * 0.9 + i * 2.1);
      a.g.position.y = -0.45 + 0.05 * bob; a.g.rotation.set(0.05 * bob, i === 1 ? -0.75 : 0.35 * (i - 1), 0.04 * Math.sin(t * 0.7 + i));
      const typing = i === 1 ? win(t, E.isi - 0.3, E.jalur, 0.3, 0.3) : 0;
      pose(a, { lsx: -0.75 - 0.35 * typing + 0.05 * bob, le: -1.1 + 0.12 * Math.sin(t * 9) * typing, rsx: -1.1 + 0.08 * bob - 0.2 * typing, rsz: 0.35, re: -1.0 + 0.1 * Math.sin(t * 8 + 1) * typing, lh: -1.25 + 0.06 * bob, lk: 1.35, rh: -1.0, rk: 1.15, hy: i === 1 ? -0.1 : 0.1 * Math.sin(t * 0.5 + i), hx: 0.15 });
      ballots[i].visible = !(i === 1 && t > E.jalur - 0.3 && t < s.s8);
      ballots[i].material.map = t > E.isi + 0.8 && t < s.s7 + 30 ? bTexF : bTexE;
    });
    scrM.map = scrM.emissiveMap = t > E.isi + 0.9 ? bTexF : bTexE;
    keys.forEach((k, i) => { const on = win(t, E.kunci + 0.15 * i, s.s5 + 1.5, 0.25, 0.4); k.visible = on > 0.01; k.scale.setScalar(0.001 + 0.32 * back(on, 2)); k.rotation.set(0, t * 1.4 + i, 0.3); });

    // ----- ground: walker + request form + booklet -----
    walker.g.visible = t > s.s2e - 1 && t < s.s4e;
    const fu = ramp(t, E.meminta, E.meminta + 1.4);
    const dest = rimPt(F.clerk + 0.012, 0.85, 1.55);
    const fStart = rimPt(F.walker - 0.012, 1.45, 1.9);
    form.visible = t > s.s3 - 0.5 && t < E.bab + 1.0 && walker.g.visible;
    form.position.copy(fStart).lerp(dest, fu); form.position.add(up.clone().multiplyScalar(Math.sin(fu * Math.PI) * 1.0));
    form.quaternion.copy(cam.quaternion); form.rotateZ(0.2 * Math.sin(t * 2) + fu * 0.6); form.scale.setScalar(1 - 0.7 * ramp(t, E.meminta + 1.2, E.meminta + 1.6));
    const bkO = back(ramp(t, E.bab - 0.25, E.bab + 0.45), 1.4);
    BK.visible = t > E.bab - 0.4; BK.scale.setScalar(0.001 + Math.min(1, bkO * 1.2));
    bkL.rotation.y = (1 - bkO) * 1.4; bkR.rotation.y = -(1 - bkO) * 1.4;

    // ----- envelope (s4): pops at the clerk, sealed, rolls to Mission Control, rises to the station -----
    const eOn = t > E.siapkan - 0.3 && t < E.stasiun4 + 0.5;
    ENV.g.visible = eOn;
    if (eOn) {
      let p;
      const a1 = ramp(t, E.mission4 - 0.1, E.houston + 0.5), a2 = ramp(t, E.kirim4 - 0.1, E.stasiun4 + 0.2);
      if (a2 > 0) p = upP.curve.getPointAt(Math.min(0.999, a2));
      else { const f = F.clerk + 0.012 + a1 * (F.mcc - 0.035 - F.clerk - 0.012); p = rimPt(f, 1.3 + Math.abs(Math.sin(a1 * Math.PI * 3)) * 0.5 + a1 * 2.0 * ramp(t, E.houston, E.kirim4), 2.0); }
      ENV.g.position.copy(p);
      ENV.g.quaternion.copy(cam.quaternion); ENV.g.rotateZ(0.08 * Math.sin(t * 2.3));
      ENV.g.scale.setScalar((0.001 + 0.58 * back(ramp(t, E.siapkan - 0.2, E.siapkan + 0.35), 1.6)) * (1 - 0.8 * ramp(t, E.stasiun4 - 0.1, E.stasiun4 + 0.5)));
      const sl = ramp(t, E.enkrip - 0.05, E.enkrip + 0.18); ENV.seal.scale.setScalar(0.001 + (sl < 1 ? 2.2 - 1.2 * sl : 1)); ENV.seal.visible = t > E.enkrip - 0.1;
    }
    upP.set(ramp(t, E.kirim4 - 0.3, E.stasiun4), 1.2, -1);
    if (t > E.kunci + 0.5) upP.set(1 - ramp(t, E.kunci + 0.5, E.kunci + 1.5), 0.3);

    // ----- ruler (s1) -----
    const rOn = win(t, E.k400 - 0.2, s.s1e + 0.2, 0.3, 0.4);
    ruler.set(rOn > 0.01 ? ramp(t, E.k400 - 0.3, E.k400 + 0.7) * rOn : 0, 0.35);
    rulerTag.visible = rOn > 0.02; rulerTag.scale.setScalar(0.001 + back(ramp(t, E.k400, E.k400 + 0.4)) * rOn);
    rulerTag.quaternion.copy(cam.quaternion);

    // ----- route segments: revealed behind the plane in s5, all glowing in s7, faint in s8 -----
    const raceOn = win(t, E.total - 0.2, E.isinya + 0.2, 0.3, 0.5), fade8 = ramp(t, s.s8, s.s8 + 1.2) * (1 - ramp(t, K.end + 0.3, K.end + 1));
    segs.forEach((sg) => {
      const rv = Math.max(ramp(t, sg.a, sg.b), 0) * (1 - ramp(t, s.s5e + 0.3, s.s6 + 1.0));
      const all = Math.max(raceOn, 0.6 * fade8);
      let pulse = -1;
      if (t > race.a && t < race.b) { const u = ramp(t, race.a, race.b) * 3, k = [segA, segB, segC].indexOf(sg.c); pulse = u - k; if (pulse < 0 || pulse > 1) pulse = -1; }
      sg.c.set(Math.max(rv, all), 0.6 + 3.2 * raceOn, pulse);
    });

    // ----- paper plane -----
    const pp = planePose(t);
    PL.visible = pp.vis > 0.01;
    if (PL.visible) {
      PL.position.copy(pp.p); tq.setFromUnitVectors(X1, pp.dir.clone().normalize()); PL.quaternion.copy(tq); PL.rotateX(0.25 * Math.sin(t * 3));
      PL.scale.setScalar(pp.sc * Math.max(0.001, pp.vis) * (1 + 0.6 * wide));
    }

    // ----- s6 orbit diagram -----
    const dOn = win(t, E.memutar - 0.2, s.s6e + 0.3, 0.5, 0.6);
    orbit.visible = dOn > 0.02; orbit.scale.setScalar(1);
    orbit.material[0].emissiveIntensity = 0.15 * dOn;
    const gOn = dOn * ramp(t, E.antena - 0.4, E.antena + 0.3);
    const tOn = dOn * ramp(t, E.satelit - 0.2, E.geo);
    fanG.visible = gOn > 0.02; fanG.material.opacity = 0.32 * gOn;
    fanT.visible = tOn > 0.02; fanT.material.opacity = 0.22 * tOn;
    const dw = Math.atan2(Math.sin(fI - F.ws), Math.cos(fI - F.ws)), dt_ = Math.atan2(Math.sin(fI - FT), Math.cos(fI - FT));
    const seenG = clamp01((WSV - Math.abs(dw)) / 0.03), seenT = clamp01((TDV - Math.abs(dt_)) / 0.08);
    placeLink(linkG, rimPt(F.ws, 3.0, 0.6), ISS.position, 0.9 * gOn * seenG * ramp(t, E.melaju, E.melaju + 0.5));
    placeLink(linkT, T0, ISS.position, 0.9 * tOn * seenT);
    fanG.material.color.set(seenG > 0.5 && gOn > 0.1 ? "#ffd37a" : "#f2d58e");

    // ----- hero envelope and keys (s7) -----
    const hOn = win(t, E.isinya - 0.2, s.s8 + 1.4, 0.35, 0.5);
    HERO.g.visible = hOn > 0.01;
    if (HERO.g.visible) {
      HERO.g.position.set(2.5, 16.0 - 2.5 * ramp(t, s.s8 + 0.2, s.s8 + 1.6), 40 - 6 * ramp(t, s.s8 + 0.2, s.s8 + 1.6));
      HERO.g.quaternion.copy(cam.quaternion); HERO.g.rotateZ(-0.06 + 0.03 * Math.sin(t * 1.3)); HERO.g.rotateX(0.06 * Math.sin(t * 0.9));
      HERO.g.scale.setScalar(0.001 + back(hOn, 1.3));
      const lockP = ramp(t, E.terkunci - 0.1, E.terkunci + 0.25); HERO.seal.scale.setScalar(0.001 + (lockP < 1 ? 2.4 - 1.4 * lockP : 1)); HERO.seal.visible = t > E.terkunci - 0.15;
      const ka = back(ramp(t, E.hanya - 0.2, E.hanya + 0.5), 1.3), kb = back(ramp(t, E.petugas7 - 0.2, E.petugas7 + 0.5), 1.3);
      kA.visible = ka > 0.01; kB.visible = kb > 0.01;
      kA.position.set(-1.95 - 2.0 * (1 - ka), -0.3, 0.3); kA.rotation.set(0.3 * Math.sin(t * 1.5), 0, 0.06 * Math.sin(t * 2)); kA.scale.setScalar(0.55 * Math.max(0.001, ka));
      kB.position.set(1.95 + 2.0 * (1 - kb), -0.3, 0.3); kB.rotation.set(0.3 * Math.sin(t * 1.5 + 1), Math.PI, 0.06 * Math.sin(t * 2 + 1)); kB.scale.setScalar(0.55 * Math.max(0.001, kb));
    }

    // ----- clouds drift a little on the limb -----
    CL.children.forEach((c0) => { const u = c0.userData; onRim(c0, u.f + 0.004 * Math.sin(t * 0.15 + u.ph), u.h + 0.08 * Math.sin(t * 0.4 + u.ph), u.z); });

    comp.render();
  };
}
