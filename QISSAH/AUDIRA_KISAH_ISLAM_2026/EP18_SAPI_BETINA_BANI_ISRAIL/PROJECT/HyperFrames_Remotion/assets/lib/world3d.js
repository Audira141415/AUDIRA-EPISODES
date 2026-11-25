// EP18 SAPI BETINA BANI ISRAIL. MOSAICFORGE: a courtyard floor of glazed tesserae under warm Mediterranean light.
// Every figure is a mosaic of small glazed tiles (InstancedMesh, frustumCulled=false), each tile slightly tilted so the
// glaze catches the sun. Tiles change state by flipping over (a 0.36 s half-turn that swaps colour at the edge-on point).
// Depiction: Nabi Musa never appears; his presence is a staff motif inlaid in the bottom border of each mosaic panel,
// which glows when he speaks. People are faceless robed mosaic figures (hooded, no features). No corpse is shown:
// the hidden secret of 2:72-73 is a dark veil in a mural that flips to light. The cow is never slaughtered on screen:
// it glows, lowers into the floor and becomes a gold inlay.
// Zones along -z: A medallion (z 0), B crowd (z -24), C herd (z -48..-62), D mural wall (z -92),
// E heart-stone + rock + spring (z -112), F path puzzle (z -123) and the AUDIRA cartouche (z -131.6).
// Every value is a pure function of t (seek-safe). Tile sets only rewrite their buffers when their state can change.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, track, stage, pts, envStrips, canvasTex } from "./lib3d.js";

const PI = Math.PI;
const sstep = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, u) => a + (b - a) * u;

// ---------- 5x7 bitmap font for tile lettering
const FONT = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
};
function drawText(g, str, x, y, col) {
  g.fillStyle = col;
  for (const ch of str) { const gl = FONT[ch]; for (let j = 0; j < 7; j++) for (let i = 0; i < 5; i++) if (gl[j][i] === "1") g.fillRect(x + i, y + j, 1, 1); x += 6; }
}

// ---------- raster: draw in cell units, sample the centre of each cell
function raster(cols, rows, draw, px = 6) {
  const c = document.createElement("canvas");
  c.width = cols * px; c.height = rows * px;
  const g = c.getContext("2d");
  g.scale(px, px);
  draw(g);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const out = new Array(cols * rows).fill(null);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const k = ((j * px + (px >> 1)) * c.width + i * px + (px >> 1)) * 4;
    if (d[k + 3] > 128) out[j * cols + i] = new THREE.Color().setRGB(d[k] / 255, d[k + 1] / 255, d[k + 2] / 255, THREE.SRGBColorSpace);
  }
  return out;
}
// Dark outline tesserae around a cut-out figure, as in classical floor mosaics.
function outline(cells, cols, rows, k = 0.42) {
  const out = cells.slice();
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const c = cells[j * cols + i]; if (!c) continue;
    const e = (ii, jj) => ii < 0 || jj < 0 || ii >= cols || jj >= rows || !cells[jj * cols + ii];
    if (e(i - 1, j) || e(i + 1, j) || e(i, j - 1) || e(i, j + 1)) out[j * cols + i] = c.clone().multiplyScalar(k);
  }
  return out;
}

// ---------- tile sets
const FL = 0.36, DROP = 0.55;
const _m = new THREE.Matrix4(), _r = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
class TileSet {
  constructor(scene, opt = {}) { this.scene = scene; this.opt = opt; this.T = []; this.O = []; }
  owner(M0, dyn = null, windows = []) { this.O.push({ M0, dyn, windows, M: new THREE.Matrix4() }); return this.O.length - 1; }
  add(o, x, y, s, d, c0, ev, ta, rnd, extra) {
    this.T.push({ o, x, y, s, d, c0, ev: ev || [], ta: ta ?? null, rx: (rnd() - 0.5) * 0.11, ry: (rnd() - 0.5) * 0.11, j: 0.92 + rnd() * 0.14, b: 0, bd: 0, ...(extra || {}) });
  }
  build() {
    const n = this.T.length;
    const mat = new THREE.MeshStandardMaterial({ roughness: this.opt.rough ?? 0.28, metalness: 0.02, envMapIntensity: this.opt.env ?? 0.9 });
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, n);
    im.frustumCulled = false; im.castShadow = this.opt.shadow ?? true; im.receiveShadow = true;
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
    im.instanceColor.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(im); this.im = im;
    const W = [];
    for (const tl of this.T) { for (const e of tl.ev) W.push([e.t, e.t + FL]); if (tl.ta !== null) W.push([tl.ta, tl.ta + DROP]); }
    for (const o of this.O) W.push(...o.windows);
    W.sort((a, b) => a[0] - b[0]);
    const M = [];
    for (const w of W) { const l = M[M.length - 1]; if (l && w[0] <= l[1] + 0.02) l[1] = Math.max(l[1], w[1]); else M.push([w[0], w[1]]); }
    this.W = M; this.key = NaN;
  }
  update(t) {
    let key = 0, inside = false;
    for (const [a, b] of this.W) { if (t >= a - 0.002 && t <= b + 0.002) { inside = true; break; } if (t > b) key++; }
    if (!inside && key === this.key) return;
    this.key = inside ? NaN : key;
    const st = this.O.map((o) => {
      const s = o.dyn ? o.dyn(t) : {};
      o.M.makeTranslation(0, s.dy || 0, 0).multiply(o.M0);
      if (s.ry) o.M.multiply(_r.makeRotationY(s.ry));
      return s;
    });
    const arr = this.im.instanceMatrix.array, carr = this.im.instanceColor.array;
    for (let i = 0; i < this.T.length; i++) {
      const tl = this.T[i], s = st[tl.o], O = this.O[tl.o];
      let c = tl.c0, cp = tl.c0, p = 1;
      for (const e of tl.ev) { if (t >= e.t) { cp = c; c = e.c; p = (t - e.t) / FL; } else break; }
      let ang = 0, col = c;
      if (p < 1) { ang = sstep(p) * PI; col = p < 0.5 ? cp : c; }
      let sc = 1, lift = 0, spin = 0;
      if (tl.ta !== null) {
        const u = (t - tl.ta) / DROP;
        if (u <= 0) sc = 1e-4; else if (u < 1) { const e2 = eout(u); sc = 0.35 + 0.65 * e2; lift = (1 - e2) * 0.7; spin = (1 - e2) * PI; }
      }
      const bl = s.bulge || 0;
      _e.set(tl.rx * (1 + bl * 1.6), tl.ry * (1 + bl * 1.6) + ang + spin, 0);
      _q.setFromEuler(_e);
      const d = tl.d + bl * tl.bd;
      _p.set(tl.x, tl.y, d / 2 + lift + bl * tl.b);
      _s.set(tl.s * sc, tl.s * sc, d * sc);
      _m.compose(_p, _q, _s).premultiply(O.M);
      _m.toArray(arr, i * 16);
      const g = (s.glow ?? 1) * tl.j;
      carr[i * 3] = col.r * g; carr[i * 3 + 1] = col.g * g; carr[i * 3 + 2] = col.b * g;
    }
    this.im.instanceMatrix.needsUpdate = true; this.im.instanceColor.needsUpdate = true;
  }
}
// Adds a raster as tiles. Standing figures: local x right, y up (bottom at 0). opts.center centres y too (floor inlays).
function addRaster(set, o, cells, cols, rows, pitch, rnd, opts = {}) {
  const res = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const c = cells[j * cols + i]; if (!c) continue;
    const x = (i - (cols - 1) / 2) * pitch * (opts.mirror ? -1 : 1);
    const y = opts.center ? ((rows - 1) / 2 - j) * pitch : (rows - 1 - j + 0.5) * pitch;
    const info = { i, j, x, y, c };
    set.add(o, x, y, opts.s ?? pitch * 0.86, opts.d ?? 0.05, c, opts.ev ? opts.ev(info) : null, opts.ta ? opts.ta(info) : null, rnd, opts.extra ? opts.extra(info) : null);
    res.push(info);
  }
  return res;
}
const flat = (x, z, y = 0.004) => new THREE.Matrix4().makeTranslation(x, y, z).multiply(new THREE.Matrix4().makeRotationX(-PI / 2));
const stand = (x, z, sc = 1, y = 0) => new THREE.Matrix4().makeTranslation(x, y, z).multiply(new THREE.Matrix4().makeScale(sc, sc, sc));
const col = (h) => new THREE.Color(h);

// ---------- drawings (cell units)
function drawCow(g, v) {                     // side profile facing right in a 36 x 24 cell box
  const sag = v.age === "o" ? 1 : 0, hd = v.age === "o" ? 1.3 : 0;
  g.fillStyle = v.col;
  const legs = [8.4, 11.4, 23, 26];
  for (const lx of legs) g.fillRect(lx, 13, 2.2, 8.4);
  g.beginPath(); g.ellipse(17, 10.6, 11, 5.6, 0, 0, 2 * PI); g.fill();
  if (sag) { g.save(); g.globalCompositeOperation = "destination-out"; g.beginPath(); g.ellipse(16, 4.1, 6.5, 1.5, 0, 0, 2 * PI); g.fill(); g.restore(); }
  g.beginPath(); g.moveTo(24, 6.2); g.lineTo(30, 6.4 + hd); g.lineTo(31.6, 11.4 + hd); g.lineTo(26, 14.4); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(31.6, 9.2 + hd, 2.6, 3.4, -0.5, 0, 2 * PI); g.fill();
  g.strokeStyle = v.col; g.lineWidth = 1.0; g.beginPath(); g.moveTo(6.6, 8); g.quadraticCurveTo(4.6, 12, 5.3, 17.4); g.stroke();
  g.fillStyle = v.dark; g.fillRect(4.5, 16.8, 1.8, 2.4);
  g.save(); g.globalCompositeOperation = "source-atop";
  g.fillStyle = v.light; g.beginPath(); g.ellipse(15, 7.2, 8, 2.0, 0, 0, 2 * PI); g.fill();
  g.fillStyle = v.dark; g.fillRect(5, 14.6, 25, 1.6);
  if (v.spots) { g.fillStyle = v.spots; for (const [x, y, a, b] of [[12.5, 8.4, 3.2, 2.4], [20.5, 12.2, 2.6, 1.9], [8.6, 12.4, 1.9, 1.7], [24.8, 8.2, 1.6, 1.8], [27.5, 12.5, 1.4, 1.2]]) { g.beginPath(); g.ellipse(x, y, a, b, 0.3, 0, 2 * PI); g.fill(); } }
  g.restore();
  g.fillStyle = v.muz; g.beginPath(); g.ellipse(33.3, 11.8 + hd, 1.8, 1.6, -0.4, 0, 2 * PI); g.fill();
  g.fillStyle = v.dark; g.beginPath(); g.ellipse(29.2, 6.6 + hd, 1.6, 0.85, 0.5, 0, 2 * PI); g.fill();
  if (v.age !== "y") { g.strokeStyle = "#efe4c8"; g.lineWidth = 0.95; g.beginPath(); g.moveTo(30.6, 6.4 + hd); g.quadraticCurveTo(31.6, 3.9 + hd, 33.6, 3.7 + hd); g.stroke(); }
  g.fillStyle = "#231b16"; for (const lx of legs) g.fillRect(lx, 20.4, 2.2, 1.2);
  g.fillRect(31.3, 8.3 + hd, 0.95, 0.95);
  if (v.mark === "p") {                        // wooden plough yoke over the neck and a trace line
    g.fillStyle = "#5b3a1c"; g.fillRect(24.6, 3.4, 7.2, 1.5); g.fillRect(25.6, 4.6, 1.1, 4.2); g.fillRect(29.6, 4.6, 1.1, 4.0);
    g.strokeStyle = "#3d2612"; g.lineWidth = 0.7; g.beginPath(); g.moveTo(25, 5.4); g.lineTo(2.2, 9.4); g.stroke();
  }
  if (v.mark === "w") {                        // rope harness and a blue water bucket at the flank
    g.strokeStyle = "#d6bd86"; g.lineWidth = 0.7; g.beginPath(); g.moveTo(25, 7.2); g.lineTo(16.8, 13.4); g.stroke();
    g.fillStyle = "#2a73ad"; g.fillRect(14.6, 13.6, 4.4, 4.6); g.fillStyle = "#8fd6f2"; g.fillRect(14.6, 13.6, 4.4, 1.0);
  }
}
function drawPerson(g, v) {                  // faceless robed figure, front view, 14 x 28 cells
  g.fillStyle = v.robe;
  g.beginPath(); g.moveTo(3.4, 10.2); g.lineTo(10.6, 10.2); g.lineTo(12.6, 27.6); g.lineTo(1.4, 27.6); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(7, 11, 4.6, 2.1, 0, 0, 2 * PI); g.fill();
  g.fillStyle = v.fold; g.fillRect(6.5, 13, 1, 14.6);
  g.fillStyle = v.sash; g.fillRect(2.7, 16.4, 8.6, 1.3);
  g.fillStyle = v.cloth;
  g.beginPath(); g.moveTo(3.6, 6); g.lineTo(10.4, 6); g.lineTo(11.4, 12); g.lineTo(2.6, 12); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(7, 5.6, 3.0, 3.7, 0, 0, 2 * PI); g.fill();
  g.fillStyle = v.shade; g.beginPath(); g.ellipse(7, 6.6, 1.7, 2.2, 0, 0, 2 * PI); g.fill();   // hood shadow, no features
  g.fillStyle = v.band; g.fillRect(4.2, 3.5, 5.6, 0.9);
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0xd29a62, fog: 0.0055, exp: 1.0, bloom: [0.42, 0.5, 0.86], shadow: true });
  r.localClippingEnabled = true;
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(1818);
  envStrips(r, scene, [[60, 10, 0xfff0d8, 2.4, 0, 40, -10], [40, 8, 0x9cc4ff, 1.3, -40, 14, 10], [30, 6, 0xffb070, 1.6, 40, 8, 20], [50, 6, 0xffe6c0, 1.0, 0, -10, 30]], 0x2a1e18);

  // ---------- timing
  const tTerp = A("s1:terpanjang"), tSapi1 = A("s1:sapi"), tAsk = A("s1:bertanya");
  const tMusa = A("s2:Musa"), tSapi2 = A("s2:sapi"), tJawab = A("s2:Jawab"), tEjek = A("s2:mengejek");
  const tJ3 = A("s3:Jawabnya"), tTua = A("s3:tua"), tMuda = A("s3:muda"), tTengah = A("s3:pertengahan"), tKuning = A("s3:Kuning");
  const tJ4 = A("s4:Jawabnya"), tBajak = A("s4:membajak"), tAiri = A("s4:mengairi"), tBelang = A("s4:belang");
  const tSetiap = A("s5:Setiap"), tAkhir = A("s5:Akhirnya"), tSembelih = A("s5:menyembelihnya");
  const tBunuh = A("s6:pembunuhan"), tTuduh = A("s6:dituduhkan"), tPukul = A("s6:pukullah"), tBagian = A("s6:bagian"), tSingkap = A("s6:sembunyikan");
  const tHati = A("s7:hati"), tKeras = A("s7:keras"), tBatu = A("s7:batu"), tKeras2 = A("s7:keras#2"), tPadahal = A("s7:Padahal"), tBelah = A("s7:terbelah"), tPancar = A("s7:memancarkan");
  const tSimple = A("s8:sederhana"), tHard = A("s8:mempersulitnya"), tMudah = A("s8:mudah"), tRumit = A("s8:rumit"), tKisah = A("s8:Kisah");

  // ---------- lights and moods
  const hemi = new THREE.HemisphereLight(0xc4d4ee, 0x9a6a48, 0.9); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe2b8, 2.6);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 200 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(sun); scene.add(sun.target);
  const glowL = new THREE.PointLight(0xffc860, 0, 16, 1.6); scene.add(glowL);
  const waterL = new THREE.PointLight(0x8fe0ff, 0, 12, 1.6); scene.add(waterL);
  const ST = {
    GOLD: { sun: col(0xffd49a), si: 2.7, hs: col(0xc4d4ee), hi: 0.85, bg: col(0xc98e58), exp: 1.02, az: -35, el: 40 },
    MORN: { sun: col(0xffe4bf), si: 2.8, hs: col(0xc8dcf2), hi: 0.95, bg: col(0xd6ab7c), exp: 1.0, az: -30, el: 46 },
    NOON: { sun: col(0xfff0da), si: 3.0, hs: col(0xcfe0f4), hi: 1.0, bg: col(0xdcc29a), exp: 0.97, az: -22, el: 52 },
    DUSK: { sun: col(0xc8b0e0), si: 1.3, hs: col(0x6878b0), hi: 0.6, bg: col(0x2c2a44), exp: 1.08, az: 28, el: 26 },
    STONE: { sun: col(0xe2e6ec), si: 2.1, hs: col(0xb4bcc8), hi: 0.78, bg: col(0x868a92), exp: 1.0, az: -40, el: 40 },
    SPRING: { sun: col(0xfff2dc), si: 2.7, hs: col(0xc4e0ee), hi: 0.95, bg: col(0xb9cac6), exp: 1.0, az: -40, el: 42 },
    SUNSET: { sun: col(0xffae6a), si: 2.5, hs: col(0x9aa4d0), hi: 0.78, bg: col(0xb8703f), exp: 1.08, az: -50, el: 34 },
  };
  const MOOD = [[0, "GOLD"], [K.s2 - 0.4, "GOLD"], [K.s2 + 1.2, "MORN"], [K.s3 - 0.3, "MORN"], [K.s3 + 1.2, "NOON"], [K.s6 - 0.4, "NOON"], [K.s6 + 1.4, "DUSK"],
    [tSingkap, "DUSK"], [K.s7 + 0.6, "STONE"], [tPadahal, "STONE"], [tPancar + 0.8, "SPRING"], [K.s8, "SPRING"], [K.s8 + 2.5, "SUNSET"], [K.dur, "SUNSET"]];
  const M = { sun: new THREE.Color(), hs: new THREE.Color(), bg: new THREE.Color() };
  const sunDir = new THREE.Vector3();
  function mood(t) {
    let i = 0; while (i < MOOD.length - 2 && MOOD[i + 1][0] <= t) i++;
    const a = ST[MOOD[i][1]], b = ST[MOOD[i + 1][1]];
    const u = sstep((t - MOOD[i][0]) / Math.max(0.001, MOOD[i + 1][0] - MOOD[i][0]));
    for (const k of ["sun", "hs", "bg"]) M[k].copy(a[k]).lerp(b[k], u);
    for (const k of ["si", "hi", "exp", "az", "el"]) M[k] = a[k] + (b[k] - a[k]) * u;
    const az = M.az * PI / 180, el = M.el * PI / 180;
    sunDir.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
    return M;
  }

  // ---------- floor: four canvas-textured planes of grouted tesserae (background pattern) + a ground beyond
  const C3 = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255];
  const CREAM = C3(0xe8dcc2), SAND = C3(0xd9c09a), TERRA = C3(0xb4532f), LAPIS = C3(0x27457a), GOLDC = C3(0xc9a23a), DEEP = C3(0x1d3460), RIM = C3(0x8c3b26), FIELD = C3(0xd2bc96);
  const FR = [[-8.5, 8.5, -17.6, -29.5], [-10.5, 10.5, -46.5, -62], [-10, 10, -104, -134]];
  function patt(x, z) {
    const ax = Math.abs(x);
    if (ax > 14.2) return RIM;
    if (ax > 12.6) {
      if (ax < 12.85 || ax > 13.95) return GOLDC;
      const zz = (((z % 1.2) + 1.2) % 1.2) - 0.6, xx = ax - 13.4;
      return Math.abs(xx) + Math.abs(zz) < 0.42 ? CREAM : LAPIS;
    }
    if (z < -19.0 && z > -20.2 && x > -7.6 && x < -1.4) return (Math.abs(z + 19.6) > 0.5 || x < -7.4 || x > -1.6) ? GOLDC : CREAM;   // staff cartouche
    for (const [x0, x1, zn, zf] of FR) {
      if (x >= x0 - 1 && x <= x1 + 1 && z <= zn + 1 && z >= zf - 1) {
        const dIn = Math.min(x - (x0 - 1), x1 + 1 - x, zn + 1 - z, z - (zf - 1));
        if (dIn < 1) { if (dIn < 0.2 || dIn > 0.8) return GOLDC; return ((Math.floor(x * 2) + Math.floor(z * 2)) & 1) ? TERRA : DEEP; }
        const dg = ((((x + z) % 1.5) + 1.5) % 1.5);
        return dg < 0.25 ? SAND : FIELD;
      }
    }
    const u = ((((x + 3) % 6) + 6) % 6) - 3, v = (((z % 6) + 6) % 6) - 3;
    const sq = Math.max(Math.abs(u), Math.abs(v)), dm = (Math.abs(u) + Math.abs(v)) / Math.SQRT2;
    const inStar = sq < 1.9 || dm < 1.9, inCore = sq < 1.5 || dm < 1.5;   // 8-point star = union of two squares
    if (u * u + v * v < 0.3) return LAPIS;
    if (inStar && !inCore) return TERRA;
    if (inStar) return SAND;
    if (Math.abs(u) > 2.6 && Math.abs(v) > 2.6) return LAPIS;
    return CREAM;
  }
  const SEG = 37, FW = 30, TW = 1536, TH = Math.round(TW * SEG / FW), PPU = TW / FW, PT = 0.25;
  const frnd = mulberry(77);
  for (let s = 0; s < 4; s++) {
    const z0 = 12 - s * SEG;
    const tex = canvasTex(TW, TH, (g) => {
      g.fillStyle = "#5c5044"; g.fillRect(0, 0, TW, TH);
      const nx = Math.round(FW / PT), nz = Math.round(SEG / PT), px = PT * PPU;
      for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
        const x = -FW / 2 + (i + 0.5) * PT, z = z0 - SEG + (j + 0.5) * PT;   // canvas row 0 maps to the far edge
        const c = patt(x, z), k = 0.9 + frnd() * 0.16;
        g.fillStyle = `rgb(${Math.min(255, c[0] * k) | 0},${Math.min(255, c[1] * k) | 0},${Math.min(255, c[2] * k) | 0})`;
        const jx = (frnd() - 0.5) * 1.2, jy = (frnd() - 0.5) * 1.2;
        g.fillRect(i * px + 1.4 + jx, j * px + 1.4 + jy, px - 2.8, px - 2.8);
      }
    });
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(FW, SEG), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0, envMapIntensity: 0.5 }));
    fl.rotation.x = -PI / 2; fl.position.set(0, 0, z0 - SEG / 2); fl.receiveShadow = true; scene.add(fl);
  }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ color: 0x7a4a32, roughness: 0.95 }));
  ground.rotation.x = -PI / 2; ground.position.set(0, -0.02, -60); ground.receiveShadow = true; scene.add(ground);

  // colonnade framing the courtyard
  const stoneM = new THREE.MeshStandardMaterial({ color: 0xe6d8bc, roughness: 0.7 });
  const NCOL = 22;
  const colG = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.42, 0.5, 7.4, 16), stoneM, NCOL * 2);
  const capG = new THREE.InstancedMesh(new THREE.BoxGeometry(1.3, 0.45, 1.3), stoneM, NCOL * 2);
  colG.frustumCulled = capG.frustumCulled = false; colG.castShadow = capG.castShadow = true;
  for (let k = 0; k < NCOL; k++) for (const sx of [-1, 1]) {
    const i = k * 2 + (sx > 0 ? 1 : 0), z = 10 - k * 7;
    colG.setMatrixAt(i, _m.makeTranslation(sx * 15.8, 3.7, z)); capG.setMatrixAt(i, _m.makeTranslation(sx * 15.8, 7.6, z));
  }
  scene.add(colG, capG);
  for (const sx of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, NCOL * 7), new THREE.MeshStandardMaterial({ color: 0xc98f5e, roughness: 0.8 })); b.position.set(sx * 15.8, 8.35, 10 - (NCOL - 1) * 3.5); b.castShadow = true; scene.add(b); }

  // sky dome (seen over the mural and in the high shots)
  const SU = { uTop: { value: new THREE.Color(0x5d7fb8) }, uHor: { value: new THREE.Color() } };
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(600, 24, 12), new THREE.ShaderMaterial({
    uniforms: SU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD;void main(){vD=normalize((modelMatrix*vec4(position,1.)).xyz-cameraPosition);gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 uTop,uHor;varying vec3 vD;void main(){float e=normalize(vD).y;gl_FragColor=vec4(mix(uHor,uTop,smoothstep(-.02,.5,e)),1.);}`,
  })));

  const sets = [];
  const mk = (opt) => { const s = new TileSet(scene, opt); sets.push(s); return s; };

  // ---------- A: medallion "Al-Baqarah" (floor inlay, tiles rain in from the centre)
  const MED = mk({});
  const GOLDCOW = { col: "#E3B126", dark: "#9a6c12", light: "#F6D669", muz: "#F3D27A", age: "m" };
  const medCells = raster(80, 80, (g) => {
    const ring = (rr, c) => { g.fillStyle = c; g.beginPath(); g.arc(40, 40, rr, 0, 2 * PI); g.fill(); };
    ring(39.6, "#C9A23A"); ring(38.2, "#B4532F"); ring(37, "#27457A");
    g.fillStyle = "#EADFC6"; for (let k = 0; k < 40; k++) { const a = k / 40 * 2 * PI; g.fillRect(40 + Math.cos(a) * 35 - 0.6, 40 + Math.sin(a) * 35 - 0.6, 1.2, 1.2); }
    ring(33, "#D4AA3E"); ring(31.8, "#1B3462");
    g.fillStyle = "#24427A"; for (let k = 0; k < 12; k++) { const a = k / 12 * 2 * PI; g.save(); g.translate(40 + Math.cos(a) * 27, 40 + Math.sin(a) * 27); g.rotate(PI / 4); g.fillRect(-1.2, -1.2, 2.4, 2.4); g.restore(); }
    g.save(); g.translate(40 - 18 * 1.48, 40 - 12 * 1.48 + 1); g.scale(1.48, 1.48); drawCow(g, GOLDCOW); g.restore();
  }, 5);
  const medCow = raster(80, 80, (g) => { g.save(); g.translate(40 - 18 * 1.48, 40 - 12 * 1.48 + 1); g.scale(1.48, 1.48); drawCow(g, { ...GOLDCOW, col: "#fff", dark: "#fff", light: "#fff", muz: "#fff" }); g.restore(); }, 5);
  const oMed = MED.owner(flat(0, 0));
  addRaster(MED, oMed, medCells, 80, 80, 0.12, rnd, {
    center: true, d: 0.06,
    ta: ({ i, j }) => { const dx = i - 39.5, dy = j - 39.5; return -1.2 + Math.hypot(dx, dy) / 40 * 2.2 + ((Math.atan2(dy, dx) / (2 * PI) + 1) % 1) * 0.22; },
    ev: ({ i, j, c }) => medCow[j * 80 + i] ? [{ t: tSapi1 + (i / 80) * 0.45, c: c.clone().multiplyScalar(1.45) }] : null,
  });
  // name band below the medallion
  const NAME = "AL-BAQARAH";
  const nameCells = raster(64, 11, (g) => {
    g.fillStyle = "#C9A23A"; g.fillRect(0, 0, 64, 11); g.fillStyle = "#1B3462"; g.fillRect(1, 1, 62, 9);
    drawText(g, NAME, 3, 2, "#F2D27A");
  }, 6);
  const oName = MED.owner(flat(0, -6.0));
  addRaster(MED, oName, nameCells, 64, 11, 0.13, rnd, { center: true, d: 0.06, ta: ({ i }) => 1.15 + i * 0.018 });
  // question marks rising around the medallion on "bertanya"
  const QS = [[-5.9, -3.6], [5.9, -3.2], [-6.2, 0.2], [6.1, 0.6], [-5.8, 3.6], [5.9, 3.9], [-4.4, 5.8], [4.5, 5.9]];
  const qCells = raster(7, 9, (g) => { g.fillStyle = "#3a1a10"; g.fillRect(0, 0, 7, 9); drawText(g, "?", 1, 1, "#E06A3C"); }, 6);
  QS.forEach(([x, z], k) => {
    const o = MED.owner(flat(x, z));
    addRaster(MED, o, qCells, 7, 9, 0.13, rnd, { center: true, d: 0.07, ta: ({ i, j }) => tAsk - 0.1 + k * 0.09 + (i + j) * 0.012 });
  });
  MED.build();

  // ---------- staff motif (Musa's presence) in the bottom border of a panel; glows when he speaks
  const staffCells = outline(raster(46, 9, (g) => {
    g.strokeStyle = "#7a4e2a"; g.lineWidth = 1.7; g.lineCap = "round";
    g.beginPath(); g.moveTo(2, 5.5); g.lineTo(37, 5.5); g.quadraticCurveTo(43.5, 5.5, 43, 2.2); g.quadraticCurveTo(42.4, 0.9, 40.6, 1.6); g.stroke();
    g.strokeStyle = "#a4703f"; g.lineWidth = 0.5; g.beginPath(); g.moveTo(3, 5.1); g.lineTo(36, 5.1); g.stroke();
    g.fillStyle = "#E8C14A"; g.fillRect(1.2, 4.5, 2, 2); g.fillRect(19, 4.6, 1.2, 1.8);
  }, 6), 46, 9, 0.6);
  const STAFF = mk({});
  const bump = (t, a, w = 1.6) => { const u = (t - a) / w; return u > 0 && u < 1 ? Math.sin(u * PI) : 0; };
  const staffAt = [[[-4.5, -19.6], [tMusa]], [[-6.2, -46.0], [tJ3, tJ4]]];
  for (const [[x, z], times] of staffAt) {
    const o = STAFF.owner(flat(x, z, 0.004), (t) => ({ glow: 1 + 1.6 * Math.max(...times.map((a) => bump(t, a - 0.2, 2.2))) }), times.map((a) => [a - 0.2, a + 2.0]));
    addRaster(STAFF, o, staffCells, 46, 9, 0.11, rnd, { center: true, d: 0.07 });
  }
  STAFF.build();

  // ---------- B: crowd of faceless figures
  const CROWD = mk({});
  const ROBES = [["#3f5a8a", "#2f4670"], ["#a8743a", "#86592a"], ["#6f7f45", "#566434"], ["#9a4a32", "#7a3826"], ["#b9a27a", "#978260"], ["#5a4a6a", "#463a54"]];
  const CLOTH = ["#e7dcc4", "#d9cba8", "#efe6d2", "#c9b48a"];
  const crowdPos = [];
  for (let rr = 0; rr < 4; rr++) for (let c = 0; c < 6; c++) crowdPos.push([-5.6 + c * 2.25 + (rr % 2) * 1.1 - 0.55 + (rnd() - 0.5) * 0.4, -20.6 - rr * 1.75 + (rnd() - 0.5) * 0.3]);
  crowdPos.forEach(([x, z], k) => {
    const [robe, fold] = ROBES[k % 6], cl = CLOTH[(k * 7) % 4];
    const cells = outline(raster(14, 28, (g) => drawPerson(g, { robe, fold, sash: k % 3 ? "#d9b25a" : "#e7dcc4", cloth: cl, shade: new THREE.Color(cl).multiplyScalar(0.62).getStyle(), band: "#7a3a26" }), 6), 14, 28, 0.5);
    const side = k % 2 ? 1 : -1, sc = 0.95 + rnd() * 0.13;
    const o = CROWD.owner(stand(x, z, sc), (t) => ({ ry: side * 0.42 * sstep((t - tEjek) / 0.5) * (1 - sstep((t - K.s3 + 0.2) / 0.6)), dy: 0.05 * Math.sin(PI * clamp01((t - tEjek - k * 0.03) / 0.5)) }), [[tEjek - 0.05, tEjek + 1.2], [K.s3 - 0.3, K.s3 + 0.5]]);
    addRaster(CROWD, o, cells, 14, 28, 0.095, rnd, { d: 0.05 });
  });
  CROWD.build();
  // gold cow inlay in front of the crowd: the command
  const INLAY = mk({ shadow: false });
  const cowMask = (v) => outline(raster(36, 24, (g) => drawCow(g, v), 6), 36, 24, 0.5);
  const inlayCells = cowMask({ col: "#E7B52C", dark: "#a8761a", light: "#F7DC74", muz: "#F5D886", age: "m" });
  addRaster(INLAY, INLAY.owner(flat(2.4, -18.9)), inlayCells, 36, 24, 0.1, rnd, { center: true, d: 0.05, ta: ({ i, j }) => tSapi2 - 0.1 + i * 0.022 + (j % 3) * 0.02 });

  // ---------- C: the herd
  const HERD = "oY oB oK oW oG oR oT oY yY yY yB yB yK yW yR yT yG mY* mYp mYp mYw mYs mB mB mK mK mW mR mT mG".split(" ");
  const COLS = { Y: ["#F2C230", "#B88A12", "#FBE07A"], B: ["#8A5530", "#5e3a1f", "#a8703f"], K: ["#3a322c", "#221c18", "#5a4e44"], W: ["#ECE4D4", "#b9ae98", "#ffffff"], G: ["#9C978E", "#6e6a63", "#bcb7ad"], R: ["#A9442D", "#73301f", "#c86a4c"], T: ["#C49A62", "#8f6c40", "#dcbb88"] };
  const STAGES = [tTua, tMuda, tKuning, tBajak, tAiri, tBelang];
  const filterT = (h) => h[0] === "o" ? tTua : h[0] === "y" ? tMuda : h[1] !== "Y" ? tKuning : h[2] === "p" ? tBajak : h[2] === "w" ? tAiri : h[2] === "s" ? tBelang : null;
  const slots = [];
  for (let rr = 0; rr < 6; rr++) for (let c = 0; c < 5; c++) slots.push([(c - 2) * 3.35 + (rr % 2 ? 0.8 : -0.8), -48.9 - rr * 2.2]);
  const FINAL_SLOT = 12;                         // row 2, col 2
  const order = slots.map((_, i) => i).filter((i) => i !== FINAL_SLOT);
  const hr = mulberry(2671);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(hr() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const HERDSET = mk({});
  const GREYS = [col(0x8d8a84), col(0x7b7872), col(0x9a968e), col(0x6f6c67)];
  const [FX, FZ] = slots[FINAL_SLOT];
  let oi = 0;
  HERD.forEach((h, k) => {
    const isFinal = h.includes("*");
    const [x, z] = isFinal ? slots[FINAL_SLOT] : slots[order[oi++]];
    const [c0, dk, lt] = COLS[h[1]];
    const age = h[0], sc = age === "y" ? 0.6 : age === "o" ? 1.0 : 0.86;
    let base = new THREE.Color(c0);
    if (age === "o") base.lerp(new THREE.Color(0x7d7468), 0.22);
    const v = { col: base.getStyle(), dark: dk, light: age === "o" ? base.getStyle() : lt, muz: h[1] === "K" ? "#5a4e44" : "#e9c9a6", age, mark: h[2] === "p" || h[2] === "w" ? h[2] : null,
      spots: h[2] === "s" ? "#F6F1E4" : (h === "oW" || h === "yW") ? "#6a4a2e" : null };
    const cells = outline(raster(36, 24, (g) => drawCow(g, v), 6), 36, 24, 0.45);
    const tf = filterT(h), mirror = hr() < 0.45;
    const surv = STAGES.filter((s) => tf === null || s < tf);
    const win = surv.map((s) => [s + 0.5, s + 1.7]);
    if (tf !== null) win.push([tf, tf + 1.9]);
    if (isFinal) win.push([tSetiap - 0.4, tSetiap + 1], [tAkhir - 0.3, tSembelih + 3.4]);
    const o = HERDSET.owner(stand(x, z, sc), (t) => {
      let glow = 1, dy = 0;
      for (const s of surv) { const u = (t - s - 0.55) / 1.1; if (u > 0 && u < 1) glow += 0.32 * Math.sin(u * PI); }
      if (tf !== null) dy = -(2.6 * sc + 0.3) * sstep((t - tf - 0.55) / 1.1);
      if (isFinal) {
        glow += 0.22 * ramp(t, tSetiap - 0.3, tSetiap + 0.8) + 0.25 * ramp(t, tAkhir - 0.2, tAkhir + 0.6);
        dy = -2.6 * sstep((t - tSembelih - 0.3) / 2.0);
      }
      return { glow, dy };
    }, win);
    addRaster(HERDSET, o, cells, 36, 24, 0.095, rnd, {
      d: 0.05, mirror,
      ev: ({ x: lx, c }) => tf === null ? null : [{ t: tf + 0.05 + clamp01((mirror ? -lx : lx) / 3.6 + 0.5) * 0.4, c: GREYS[Math.floor(rnd() * 4)].clone().lerp(c, 0.12) }],
    });
  });
  HERDSET.build();
  // the gold inlay left where the last cow lowered into the floor
  addRaster(INLAY, INLAY.owner(flat(FX, FZ + 0.9)), inlayCells, 36, 24, 0.1, rnd, { center: true, d: 0.05, ta: ({ i, j }) => tSembelih + 0.7 + i * 0.022 + (j % 3) * 0.02 });
  INLAY.build();

  // ---------- D: mural wall, two faceless figures accusing each other, a veiled secret that flips to light
  const MW = 120, MH = 86, MP = 0.12, MZ = -91.7, MY = 0.7;
  const VC = [60, 40];
  const muralBase = raster(MW, MH, (g) => {
    g.fillStyle = "#1f3a66"; g.fillRect(0, 0, MW, MH);
    g.fillStyle = "#2c4c80"; for (let y = 4; y < MH; y += 8) for (let x = 4 + ((y / 8) % 2) * 4; x < MW; x += 8) { g.save(); g.translate(x, y); g.rotate(PI / 4); g.fillRect(-0.9, -0.9, 1.8, 1.8); g.restore(); }
    g.fillStyle = "#e8dcc2"; for (let y = 8; y < MH; y += 16) for (let x = 8 + ((y / 16) % 2) * 8; x < MW; x += 16) g.fillRect(x, y, 1, 1);
    g.fillStyle = "#d8bf8f"; g.fillRect(0, 73, MW, 13); g.fillStyle = "#b9965e"; g.fillRect(0, 73, MW, 1.2);
    g.fillStyle = "#6f7f45"; for (let x = 2; x < MW; x += 6) g.fillRect(x, 79, 3, 1);
    for (const [cx, robe, cloth, shade] of [[34, "#b8873a", "#e7dcc4", "#8e8470"], [86, "#6f7f45", "#d9cba8", "#857a60"]]) {
      g.fillStyle = robe; g.beginPath(); g.moveTo(cx - 5, 35); g.lineTo(cx + 5, 35); g.lineTo(cx + 7, 74); g.lineTo(cx - 7, 74); g.closePath(); g.fill();
      g.beginPath(); g.ellipse(cx, 36, 6, 2.6, 0, 0, 2 * PI); g.fill();
      g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(cx - 0.5, 40, 1, 33);
      g.fillStyle = cloth; g.beginPath(); g.moveTo(cx - 3.6, 29); g.lineTo(cx + 3.6, 29); g.lineTo(cx + 4.8, 37); g.lineTo(cx - 4.8, 37); g.closePath(); g.fill();
      g.beginPath(); g.ellipse(cx, 28.6, 3.6, 4.4, 0, 0, 2 * PI); g.fill();
      g.fillStyle = shade; g.beginPath(); g.ellipse(cx, 29.6, 2.1, 2.7, 0, 0, 2 * PI); g.fill();
    }
    g.fillStyle = "#C9A23A"; g.fillRect(0, 0, MW, 3); g.fillRect(0, MH - 3, MW, 3); g.fillRect(0, 0, 3, MH); g.fillRect(MW - 3, 0, 3, MH);
    g.fillStyle = "#B4532F"; g.fillRect(3, 3, MW - 6, 2); g.fillRect(3, MH - 5, MW - 6, 2); g.fillRect(3, 3, 2, MH - 6); g.fillRect(MW - 5, 3, 2, MH - 6);
  }, 4);
  const armMask = raster(MW, MH, (g) => {
    g.strokeStyle = "#fff"; g.lineCap = "round"; g.lineWidth = 3.2;
    g.beginPath(); g.moveTo(37, 40); g.lineTo(46.5, 36.5); g.stroke(); g.lineWidth = 1.2; g.beginPath(); g.moveTo(46.5, 36.5); g.lineTo(49.6, 35.8); g.stroke();
    g.lineWidth = 3.2; g.beginPath(); g.moveTo(83, 40); g.lineTo(73.5, 36.5); g.stroke(); g.lineWidth = 1.2; g.beginPath(); g.moveTo(73.5, 36.5); g.lineTo(70.4, 35.8); g.stroke();
  }, 4);
  const inVeil = (i, j) => ((i - VC[0]) / 10.5) ** 2 + ((j - VC[1]) / 12.5) ** 2 < 1;
  const MUR = mk({});
  const DARK = [col(0x15131f), col(0x1d1a2a), col(0x231f30), col(0x100e18)];
  const oMur = MUR.owner(stand(0, MZ, 1, MY));
  addRaster(MUR, oMur, muralBase, MW, MH, MP, rnd, {
    d: 0.05,
    ev: ({ i, j, c }) => {
      const dx = i - VC[0], dy = j - VC[1], dist = Math.hypot(dx, dy);
      if (inVeil(i, j)) {
        const lc = new THREE.Color(0xfff4cc).lerp(new THREE.Color(0xf0b030), clamp01(dist / 13) * 0.9);
        return [{ t: tBunuh + dist * 0.03, c: DARK[(i * 7 + j * 3) % 4] }, { t: tSingkap - 0.1 + dist * 0.03, c: lc.multiplyScalar(1.12) }];
      }
      if (armMask[j * MW + i]) { const left = i < 60, along = left ? i - 37 : 83 - i; return [{ t: tTuduh + along * 0.022, c: new THREE.Color(left ? 0xb8873a : 0x6f7f45).multiplyScalar(1.05) }]; }
      const a = Math.atan2(dy, dx), ray = Math.abs(Math.sin(a * 4)) < 0.16, figZone = Math.abs(i - 34) < 9 || Math.abs(i - 86) < 9;
      if (ray && dist < 30 && j < 73 && j > 4 && i > 4 && i < MW - 5 && !figZone) return [{ t: tSingkap + 0.35 + dist * 0.025, c: new THREE.Color(0xf6d98a).lerp(c, clamp01((dist - 14) / 16)) }];
      return null;
    },
  });
  MUR.build();
  const slab = new THREE.Mesh(new THREE.BoxGeometry(MW * MP + 1.0, MH * MP + 1.0, 0.5), stoneM); slab.position.set(0, MY + MH * MP / 2, MZ - 0.25); slab.castShadow = slab.receiveShadow = true; scene.add(slab);
  const corn = new THREE.Mesh(new THREE.BoxGeometry(MW * MP + 1.8, 0.55, 1.2), new THREE.MeshStandardMaterial({ color: 0xc98f5e, roughness: 0.75 })); corn.position.set(0, MY + MH * MP + 0.75, MZ - 0.2); corn.castShadow = true; scene.add(corn);
  const VEIL_W = new THREE.Vector3(0, MY + (MH - 1 - VC[1] + 0.5) * MP, MZ + 0.3);
  // the gold tile (a part of the cow) that travels to the veil
  const gTile = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.08), new THREE.MeshStandardMaterial({ color: 0xffd34a, emissive: 0xffb020, emissiveIntensity: 1.6, roughness: 0.25 }));
  scene.add(gTile);
  const tFly0 = tPukul + 0.2, tFly1 = tBagian + 0.55;

  // ---------- E: heart that turns to stone, and the rock that splits for water
  const HEART = mk({});
  const HC = 40, HR = 36, HP = 0.12, HX = -3.3, HZ = -112, HYB = 0.6;
  const heartCells = raster(HC, HR, (g) => {
    const gr = g.createLinearGradient(6, 4, 30, 32); gr.addColorStop(0, "#e66a52"); gr.addColorStop(0.5, "#c03a30"); gr.addColorStop(1, "#86221e");
    g.fillStyle = gr; g.beginPath(); g.arc(12, 12, 9, PI, 0); g.arc(28, 12, 9, PI, 0); g.lineTo(20, 34); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(3, 12.5); g.lineTo(37, 12.5); g.lineTo(20, 34); g.closePath(); g.fill();
  }, 6);
  const heartOut = heartCells.map((c, k) => { if (!c) return null; const i = k % HC, j = (k / HC) | 0; const e = (ii, jj) => ii < 0 || jj < 0 || ii >= HC || jj >= HR || !heartCells[jj * HC + ii]; return e(i - 1, j) || e(i + 1, j) || e(i, j - 1) || e(i, j + 1) ? new THREE.Color(0xd9a93a) : c; });
  const oHeart = HEART.owner(stand(HX, HZ, 1, HYB), (t) => ({ bulge: sstep((t - tBatu) / 1.2), glow: 1 + 0.4 * bump(t, tHati - 0.1, 1.0) - 0.12 * sstep((t - tKeras2) / 0.6) }), [[tHati - 0.1, tHati + 0.9], [tBatu, tBatu + 1.2], [tKeras2, tKeras2 + 0.6]]);
  addRaster(HEART, oHeart, heartOut, HC, HR, HP, rnd, {
    d: 0.06,
    ev: ({ i, j }) => { const dist = Math.hypot(i - 20, j - 18); return [{ t: tKeras + (22 - dist) * 0.025, c: GREYS[(i * 3 + j * 5) % 4].clone() }, { t: tKeras2 + rnd() * 0.3, c: GREYS[(i + j) % 4].clone().multiplyScalar(0.72) }]; },
    extra: ({ i, j }) => { const dn = Math.hypot((i - 20) / 20, (j - 16) / 18); return { b: Math.max(0, 1 - dn * dn) * 0.55, bd: 0.04 + rnd() * 0.14 }; },
  });
  HEART.build();
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.6, 1.0), new THREE.MeshStandardMaterial({ color: 0xa8946f, roughness: 0.8 })); plinth.position.set(HX, 0.3, HZ + 0.1); plinth.castShadow = plinth.receiveShadow = true; scene.add(plinth);

  const RX = 3.9, RZ = -112.6;
  const rockGeo = new THREE.IcosahedronGeometry(1, 2);
  { const p = rockGeo.attributes.position; for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k), z = p.getZ(k); const n = 1 + 0.16 * Math.sin(x * 5.1 + y * 3.3) * Math.cos(z * 4.7 - y * 2.1) + 0.08 * Math.sin(x * 11 + z * 9); p.setXYZ(k, x * n, y * n, z * n); } rockGeo.computeVertexNormals(); }
  const clipL = new THREE.Plane(new THREE.Vector3(-1, 0, 0), RX), clipR = new THREE.Plane(new THREE.Vector3(1, 0, 0), -RX);
  const rockMat = (cp) => new THREE.MeshStandardMaterial({ color: 0x8c867c, roughness: 0.9, flatShading: true, side: THREE.DoubleSide, clippingPlanes: [cp], clipShadows: true });
  const rockL = new THREE.Mesh(rockGeo, rockMat(clipL)), rockR = new THREE.Mesh(rockGeo, rockMat(clipR));
  for (const m of [rockL, rockR]) { m.scale.set(2.2, 1.9, 1.8); m.castShadow = m.receiveShadow = true; scene.add(m); }
  const crack = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 3.2), new THREE.MeshBasicMaterial({ color: 0xbff4ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  crack.position.set(RX, 1.7, RZ + 1.75); scene.add(crack);

  // water channel: raised sand tiles that flip to water as the stream passes
  const CH = mk({ shadow: false });
  const chPts = [[RX, -110.6], [3.4, -107.8], [1.6, -105.4], [-0.6, -103.6], [-1.6, -101], [-1.2, -98.2]];
  const chLen = [0]; for (let k = 1; k < chPts.length; k++) chLen.push(chLen[k - 1] + Math.hypot(chPts[k][0] - chPts[k - 1][0], chPts[k][1] - chPts[k - 1][1]));
  const chAt = (s) => { let k = 1; while (k < chPts.length - 1 && chLen[k] < s) k++; const u = clamp01((s - chLen[k - 1]) / (chLen[k] - chLen[k - 1])); const a = chPts[k - 1], b = chPts[k]; const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz); return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), -dz / l, dx / l]; };
  const oCh = CH.owner(flat(0, 0));           // flat owner: local (x, y) lies at world (x, -y)
  const tWater = tPancar - 0.1;
  const WATERS = [col(0x2f8fc0), col(0x4fb3d6), col(0x7fd3ea), col(0x3aa0c8)];
  for (let s = 0; s < chLen[chLen.length - 1]; s += 0.15) for (let w = -3; w <= 3; w++) {
    const [x, z, nx, nz] = chAt(s), px = x + nx * w * 0.15, pz = z + nz * w * 0.15;
    const edge = Math.abs(w) === 3;
    CH.add(oCh, px, -pz, 0.13, 0.06, edge ? col(0xb08a5a) : col(0xcdb48c), edge ? [] : [{ t: tWater + 0.5 + s / 3.4 + rnd() * 0.08, c: WATERS[Math.floor(rnd() * 4)].clone() }], null, rnd);
  }
  CH.build();

  // ---------- F: straight path vs the winding path, and the AUDIRA cartouche
  const PATH = mk({ shadow: false });
  const PZ = -123.2;
  const oStr = PATH.owner(flat(0, 0), (t) => ({ glow: 1 + 0.6 * bump(t, tMudah - 0.1, 1.2) }), [[tMudah - 0.1, tMudah + 1.1]]);
  const oMaz = PATH.owner(flat(0, 0), (t) => ({ glow: 1 + 0.5 * bump(t, tRumit - 0.1, 1.2) }), [[tRumit - 0.1, tRumit + 1.1]]);
  const PCOL = col(0xe0d0ae);
  for (let x = -7; x <= 7.001; x += 0.2) for (const dz of [-0.1, 0.1]) {
    PATH.add(oStr, x, -(PZ + dz), 0.17, 0.06, PCOL, [{ t: tSimple + (x + 7) * 0.035, c: col(0xf2c230).multiplyScalar(1.2) }, { t: tHard + 0.2 + (x + 7) * 0.02, c: col(0xb7a681) }], null, rnd);
  }
  const maze = [[-7, PZ], [-7, PZ + 2.4], [-4.6, PZ + 2.4], [-4.6, PZ - 2.6], [-2.2, PZ - 2.6], [-2.2, PZ + 2.4], [0.2, PZ + 2.4], [0.2, PZ - 2.6], [2.6, PZ - 2.6], [2.6, PZ + 2.4], [5, PZ + 2.4], [5, PZ - 2.6], [7, PZ - 2.6], [7, PZ]];
  let arc = 0;
  for (let k = 1; k < maze.length; k++) {
    const [ax, az] = maze[k - 1], [bx, bz] = maze[k], l = Math.hypot(bx - ax, bz - az);
    for (let s = 0; s < l; s += 0.2) {
      const x = lerp(ax, bx, s / l), z = lerp(az, bz, s / l);
      if (Math.abs(z - PZ) < 0.2 && k !== 1 && k !== maze.length - 1) { arc += 0.2; continue; }
      PATH.add(oMaz, x, -z, 0.17, 0.06, PCOL, [{ t: tHard + (arc + s) * 0.012, c: col(0xc8553d).multiplyScalar(1.15) }], null, rnd);
    }
    arc += l;
  }
  PATH.build();
  const CART = mk({ shadow: false });
  const cartCells = raster(46, 13, (g) => {
    g.fillStyle = "#C9A23A"; g.fillRect(0, 0, 46, 13); g.fillStyle = "#1B3462"; g.fillRect(1, 1, 44, 11);
    g.fillStyle = "#B4532F"; g.fillRect(2, 2, 42, 0.8); g.fillRect(2, 10.2, 42, 0.8);
    g.fillStyle = "#D4AA3E"; for (const x of [3.4, 41.6]) { g.save(); g.translate(x, 6.5); g.rotate(PI / 4); g.fillRect(-1.1, -1.1, 2.2, 2.2); g.restore(); }
    drawText(g, "AUDIRA", 6, 3, "#F2D27A");
  }, 6);
  addRaster(CART, CART.owner(flat(0, -131.6)), cartCells, 46, 13, 0.12, rnd, { center: true, d: 0.06 });
  CART.build();

  // ---------- particles: sunbeam motes, reveal sparks, water spray, final-cow halo
  const MOTES = 520, mSeed = Array.from({ length: MOTES }, () => [rnd(), rnd(), rnd(), rnd()]);
  const motes = pts(scene, MOTES, { color: 0xffe2b0, size: 0.07, add: true, opacity: 0.8 });
  const SPK = 160, sSeed = Array.from({ length: SPK }, () => [rnd(), rnd(), rnd()]);
  const spark = pts(scene, SPK, { color: 0xfff0b0, size: 0.16, add: true });
  const WN = 420, wSeed = Array.from({ length: WN }, () => [rnd(), rnd(), rnd(), rnd()]);
  const water = pts(scene, WN, { color: 0xbfefff, size: 0.12, add: true, opacity: 0.9 });
  const TRN = 26; const trail = pts(scene, TRN, { color: 0xffd060, size: 0.22, add: true });
  const haloTex = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, "rgba(255,236,170,1)"); gr.addColorStop(0.4, "rgba(255,200,90,.45)"); gr.addColorStop(1, "rgba(255,180,60,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
  scene.add(halo);

  // ---------- camera: [t, px, py, pz, lx, ly, lz]
  const CAM = [
    [0, 0, 9.5, 5.0, 0, 0, -0.6],
    [2.4, 0.3, 16, 9.5, 0, 0, -2],
    [K.s1e - 0.3, 0.6, 22, 13, 0.1, 0, -3.2],
    [K.s2 + 1.7, 0, 13.5, -0.6, 0, 0.6, -19.8],
    [tJawab, -0.6, 13, -2.5, 0, 0.6, -20.8],
    [K.s2e, 0.4, 13.5, -3.3, 0, 0.6, -21.2],
    [K.s3 + 1.5, 0, 32, -20, 0, 0.8, -52],
    [K.s3e, -0.8, 30, -22, 0, 0.8, -52],
    [K.s4e, 0.6, 21, -31.5, -0.4, 0.8, -52.5],
    [tSetiap + 1.6, FX * 0.6, 8.8, FZ + 11.5, FX, 1.1, FZ],
    [tSembelih, FX * 0.5, 9.2, FZ + 11, FX, 0.9, FZ],
    [K.s5e, FX * 0.4, 11.5, FZ + 11.2, FX, 0, FZ - 0.4],
    [K.s6 + 1.8, 0, 6.6, -63.5, 0, 5.7, -92],
    [tSingkap, 0, 6.4, -66.5, 0, 5.9, -92],
    [K.s6e - 0.3, 0, 9.5, -77, 0, 6.6, -92],
    [K.s7 + 1.0, -1.2, 14, -94, -1.8, 2.6, -111],
    [tKeras, -2.6, 7.4, -97.5, -3.3, 2.4, -112],
    [tKeras2 + 0.5, -2.8, 7.2, -98.2, -3.3, 2.4, -112],
    [tBelah, 2.4, 6.6, -99.5, 3.6, 1.6, -112.4],
    [K.s7e, 1.6, 8.6, -96.8, 2.0, 0.6, -108],
    [K.s8 + 2.6, 0, 22, -106, 0, 0, -125.5],
    [tRumit + 0.5, 0, 23, -107, 0, 0, -126],
    [tKisah + 1.0, 0, 11.2, -121.6, 0, 0, -131.6],
    [K.dur, 0, 10.6, -122.4, 0, 0, -131.9],
  ];
  const camT = track(CAM);
  const look = new THREE.Vector3();

  return (t) => {
    const m = mood(t);
    scene.background.copy(m.bg); scene.fog.color.copy(m.bg); r.toneMappingExposure = m.exp;
    SU.uHor.value.copy(m.bg);
    sun.color.copy(m.sun); sun.intensity = m.si; hemi.color.copy(m.hs); hemi.intensity = m.hi;
    const c = camT(t);
    cam.position.set(c[0], c[1], c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look); cam.updateMatrixWorld();
    sun.target.position.copy(look); sun.position.copy(look).addScaledVector(sunDir, 80); sun.target.updateMatrixWorld();

    for (const s of sets) s.update(t);

    // glow light follows the subject that is lit
    let gl = 0; const gp = new THREE.Vector3();
    const st1 = Math.max(bump(t, tMusa - 0.2, 2.2)), st2 = Math.max(bump(t, tJ3 - 0.2, 2.2), bump(t, tJ4 - 0.2, 2.2));
    if (st1 > 0) { gl = 6 * st1; gp.set(-4.5, 1.2, -19.6); }
    else if (st2 > 0) { gl = 6 * st2; gp.set(-6.2, 1.2, -46); }
    else if (t > K.s5 && t < K.s6) { gl = 4 * ramp(t, tSetiap - 0.3, tSetiap + 0.8) * (1 - 0.5 * ramp(t, tSembelih + 0.5, tSembelih + 3)); gp.set(FX, 2.2, FZ + 2.2); }
    else if (t > K.s6 && t < K.s7 + 0.6) { gl = 5 * ramp(t, tSingkap - 0.1, tSingkap + 0.8) + 4 * bump(t, tFly1 - 0.1, 0.8); gp.copy(VEIL_W).setZ(MZ + 2.5); }
    glowL.intensity = gl; glowL.position.copy(gp);

    // final cow halo
    const hOn = t > K.s5 - 0.5 && t < K.s6 ? ramp(t, tSetiap - 0.2, tSetiap + 0.8) * (1 - sstep((t - tSembelih - 0.3) / 2.0)) : 0;
    halo.material.opacity = 0.35 * hOn; halo.position.set(FX, 1.1, FZ - 0.3); halo.scale.setScalar(5.2 + 0.2 * Math.sin(t * 2));

    // gold tile flight to the veil
    const fu = (t - tFly0) / (tFly1 - tFly0);
    const P0 = [2.6, 1.6, -67.5];
    if (fu > 0 && fu < 1.05) {
      const u = sstep(Math.min(1, fu));
      gTile.visible = true;
      gTile.position.set(lerp(P0[0], VEIL_W.x, u), lerp(P0[1], VEIL_W.y, u) + Math.sin(u * PI) * 1.6, lerp(P0[2], VEIL_W.z + 0.05, u));
      gTile.rotation.set(t * 5, t * 7, 0); gTile.scale.setScalar(fu > 1 ? 1 - (fu - 1) * 20 : 1);
    } else gTile.visible = false;
    for (let k = 0; k < TRN; k++) {
      const uu = Math.min(1, fu) - k * 0.012;
      if (fu <= 0 || fu > 1.02 || uu < 0) { trail.pos[k * 3 + 1] = -99; continue; }
      const u = sstep(uu);
      trail.pos[k * 3] = lerp(P0[0], VEIL_W.x, u); trail.pos[k * 3 + 1] = lerp(P0[1], VEIL_W.y, u) + Math.sin(u * PI) * 1.6; trail.pos[k * 3 + 2] = lerp(P0[2], VEIL_W.z, u);
      const v = 1 - k / TRN; trail.col[k * 3] = v; trail.col[k * 3 + 1] = v * 0.8; trail.col[k * 3 + 2] = v * 0.35;
    }
    trail.commit();

    // reveal sparks (and a small burst where the tile lands)
    for (let k = 0; k < SPK; k++) {
      const s = sSeed[k];
      const life = ((t - tSingkap) * (0.3 + s[1] * 0.3) + s[0]) % 1;
      const on = t > tSingkap - 0.1 && t < K.s7 + 0.5 ? ramp(t, tSingkap - 0.1, tSingkap + 0.5) * (1 - ramp(t, K.s7 - 0.6, K.s7 + 0.4)) : 0;
      const a = s[2] * 2 * PI, rr = 0.6 + life * 3.2;
      spark.pos[k * 3] = VEIL_W.x + Math.cos(a) * rr; spark.pos[k * 3 + 1] = on > 0.01 ? VEIL_W.y + Math.sin(a) * rr * 1.1 : -99; spark.pos[k * 3 + 2] = MZ + 0.5 + s[1] * 0.6;
      const v = on * Math.sin(life * PI); spark.col[k * 3] = v; spark.col[k * 3 + 1] = v * 0.9; spark.col[k * 3 + 2] = v * 0.55;
    }
    spark.commit();

    // sunbeam motes drifting through the whole courtyard (fixed in the world, so they parallax)
    const mOn = 1 - 0.7 * (t > K.s6 + 1 && t < tSingkap ? 1 : 0);
    for (let k = 0; k < MOTES; k++) {
      const s = mSeed[k];
      const x = (s[0] - 0.5) * 22 + Math.sin(t * 0.21 + k) * 0.5, z = 10 - s[1] * 146 + Math.cos(t * 0.17 + k * 1.3) * 0.5;
      const y = 0.4 + ((s[2] * 7 + t * (0.05 + s[3] * 0.08)) % 7);
      motes.pos[k * 3] = x; motes.pos[k * 3 + 1] = y; motes.pos[k * 3 + 2] = z;
      const v = mOn * (0.35 + 0.65 * Math.pow(Math.max(0, Math.sin(t * (0.6 + s[3]) + k)), 3));
      motes.col[k * 3] = v; motes.col[k * 3 + 1] = v * 0.86; motes.col[k * 3 + 2] = v * 0.62;
    }
    motes.commit();

    // rock: crack line, halves part, water springs and flows along the channel
    const cr = ramp(t, tBelah - 0.05, tBelah + 0.35), gap = 0.26 * sstep((t - tBelah - 0.3) / 0.8);
    rockL.position.set(RX - gap, 1.45, RZ); rockR.position.set(RX + gap, 1.45, RZ);
    clipL.constant = RX - gap; clipR.constant = -(RX + gap);
    crack.material.opacity = cr * (0.45 + 0.08 * Math.sin(t * 9)); crack.scale.set(1 + gap * 2.5, 0.4 + 0.5 * cr, 1);
    waterL.position.set(RX, 1.8, RZ + 2.4); waterL.intensity = 7 * cr * (t < K.s8 + 6 ? 1 : 0.6);
    const won = t > tWater ? ramp(t, tWater, tWater + 0.5) : 0, total = chLen[chLen.length - 1];
    for (let k = 0; k < WN; k++) {
      const s = wSeed[k];
      if (won <= 0) { water.pos[k * 3 + 1] = -99; continue; }
      const u = ((t - tWater) * (0.55 + s[1] * 0.25) + s[0]) % 1;
      let x, y, z;
      if (u < 0.25) { const v = u / 0.25; x = RX + (s[2] - 0.5) * 0.3 * v; y = 1.9 + Math.sin(v * PI) * 0.7 - v * 1.8; z = RZ + 1.6 + v * 1.6; }
      else {
        const sAl = ((u - 0.25) / 0.75) * total;
        const front = (t - tWater - 0.5) * 3.4;
        if (sAl > front) { water.pos[k * 3 + 1] = -99; continue; }
        const [cx, cz, nx, nz] = chAt(sAl); const w = (s[3] - 0.5) * 0.8;
        x = cx + nx * w; z = cz + nz * w; y = 0.1 + 0.04 * Math.sin(t * 6 + k);
      }
      water.pos[k * 3] = x; water.pos[k * 3 + 1] = y; water.pos[k * 3 + 2] = z;
      const v = won * (0.55 + 0.45 * Math.pow(Math.max(0, Math.sin(t * 5 + k * 1.7)), 4));
      water.col[k * 3] = v * 0.75; water.col[k * 3 + 1] = v * 0.95; water.col[k * 3 + 2] = v;
    }
    water.commit();

    comp.render();
  };
}
