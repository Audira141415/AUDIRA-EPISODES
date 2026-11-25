// EP20 Angry Birds: game ke-52 Rovio. PIXELSTORY: 16-bit world drawn into a 180x270 buffer, shown full-frame
// (view 135x240, x8 nearest). Every value is a pure function of t (seek-safe, no Math.random).
// Generic designs only: round angry birds and green blob pigs drawn here, no official characters, logos or likenesses.

// Anchors used only in this file (build-video.mjs passes them as extraAt).
export const ANCHORS = [
  "s1:51", "s1:hit", "s1:Lalu", "s1:game#2+0.6", "s1:menyelamatkan",
  "s2:Rovio", "s2:Finlandia", "s2:mahasiswa", "s2:2003", "s2:Bertahun-tahun", "s2:pesanan",
  "s3:bangkrut", "s3:menyusut", "s3:12", "s3:Uangnya", "s3:satu",
  "s4:menggambar", "s4:marah", "s4:sayap", "s4:kaki", "s4:Musuhnya", "s4:babi", "s4:konon", "s4:flu",
  "s5:tarik", "s5:lepaskan", "s5:robohkan", "s5:Digarap", "s5:bulan", "s5:membengkak", "s5:€100.000",
  "s6:11", "s6:Angry", "s6:US$0,99", "s6:Februari", "s6:nomor", "s6:Inggris", "s6:Amerika",
  "s7:menembus", "s7:1", "s7:5", "s7:Filmnya", "s7:US$352", "s7:Tahun", "s7:2023", "s7:Sega", "s7:€706",
  "s8:sia-sia", "s8:latihan", "s8:mencoba", "s8:Tulis", "s8:AUDIRA",
];

const INK = "#1a1020", NIGHT = "#2b1d3a", PLUM = "#4a2c4f", NAVY = "#1d2a4a", TEAL = "#2f6f73", MINT = "#6fc3a8",
  GRASS = "#5fae4a", GRASS2 = "#3d7a34", PIG = "#8fd14f", PIG2 = "#4f8a2f", SNOUT = "#b8e67c", RED = "#d94141", RED2 = "#9c2a33",
  ORG = "#e07a3a", AMB = "#f2b84b", GOLD = "#ffd34d", CRM = "#f6e7c1", WH = "#fff6e8", SKY = "#7fb6e6", SKY2 = "#c8e3f2",
  WOOD = "#9a5f36", WOOD2 = "#5a3420", G1 = "#d8d2c8", G2 = "#b8b0a8", G3 = "#6b6470", BLUE = "#4a6fb5", DAWN = "#f08a5d",
  BRICK = "#8a3b3b", YEL = "#f5d33b", SKIN = "#d9a273", GLASS = "#9fd8ee", BOARD = "#2e4a3a";

const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const FONT = {
  A: "25755", B: "65656", C: "34443", D: "65556", E: "74647", F: "74644", G: "34553", H: "55755", I: "72227", J: "11152",
  K: "55655", L: "44447", M: "57755", N: "65555", O: "25552", P: "65644", Q: "25563", R: "65655", S: "34216", T: "72222",
  U: "55557", V: "55552", W: "55775", X: "55255", Y: "55222", Z: "71247", 0: "75557", 1: "26227", 2: "61247", 3: "61216",
  4: "55711", 5: "74616", 6: "34757", 7: "71122", 8: "75757", 9: "75716", ".": "00002", ",": "00024", "+": "02720",
  "-": "00700", ":": "02020", "!": "22202", "?": "61202", "/": "11244", " ": "00000", "€": "34643", "$": "36236", "#": "57575",
};

export function create(canvas, K, AT) {
  const ctx = canvas.getContext("2d");
  const BW = 180, BH = 270;
  const buf = document.createElement("canvas");
  buf.width = BW; buf.height = BH;
  const b = buf.getContext("2d");
  const img = b.createImageData(BW, BH);
  const U = new Uint32Array(img.data.buffer);
  const cc = {};
  const C = (h) => cc[h] ?? (cc[h] = (() => { const n = parseInt(h.slice(1), 16); return ((255 << 24) | ((n & 255) << 16) | (n & 0xff00) | ((n >> 16) & 255)) >>> 0; })());
  const A = (k, d = 0) => (AT[k] ?? K[k] ?? 0) + d;
  const cl = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const E = (t, a, d) => { const x = cl((t - a) / d); return 1 - Math.pow(1 - x, 3); };
  const io = (t, a, d) => { const x = cl((t - a) / d); return x * x * (3 - 2 * x); };
  const BK = (t, a, d) => { const x = cl((t - a) / d); const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const hash = (n) => { let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16; return (x >>> 0) / 4294967296; };

  // ---- pixel primitives (PIXELSTORY: shade = ordered Bayer dither, no alpha) ----
  function px(x, y, c) { x = Math.floor(x); y = Math.floor(y); if (x >= 0 && y >= 0 && x < BW && y < BH) U[y * BW + x] = C(c); }
  function R(x, y, w, h, c) {
    const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y));
    const x1 = Math.min(BW, Math.round(x + w)), y1 = Math.min(BH, Math.round(y + h)), v = C(c);
    for (let yy = y0; yy < y1; yy++) U.fill(v, yy * BW + x0, yy * BW + Math.max(x0, x1));
  }
  function D(x, y, w, h, c, f) {
    if (f <= 0) return;
    const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y));
    const x1 = Math.min(BW, Math.round(x + w)), y1 = Math.min(BH, Math.round(y + h)), v = C(c), th = f * 16;
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) if (BAY[(yy & 3) * 4 + (xx & 3)] < th) U[yy * BW + xx] = v;
  }
  function G(x, y, w, h, c1, c2) { R(x, y, w, h, c1); for (let i = 0; i < h; i++) D(x, y + i, w, 1, c2, i / Math.max(1, h - 1)); }
  function circ(cx, cy, r, c, f = 1) {
    const v = C(c);
    for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) {
      if (dx * dx + dy * dy <= r * r + r * 0.6) {
        const xx = Math.round(cx + dx), yy = Math.round(cy + dy);
        if (xx >= 0 && yy >= 0 && xx < BW && yy < BH && (f >= 1 || BAY[(yy & 3) * 4 + (xx & 3)] < f * 16)) U[yy * BW + xx] = v;
      }
    }
  }
  function ell(cx, cy, rx, ry, c) {
    for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) for (let dx = -Math.ceil(rx); dx <= Math.ceil(rx); dx++)
      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.05) px(cx + dx, cy + dy, c);
  }
  function ring(cx, cy, r, c, frac = 1) {
    const n = Math.max(24, Math.round(r * 8));
    for (let a = 0; a < n * frac; a++) px(Math.round(cx + Math.cos(a / n * 6.2832 - 1.57) * r), Math.round(cy + Math.sin(a / n * 6.2832 - 1.57) * r), c);
  }
  function line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let e = dx + dy;
    for (let i = 0; i < 500; i++) { px(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  const tw = (s, k = 1) => s.length * 4 * k - k;
  function T(s, x, y, c, k = 1, sh = null) {
    if (sh) T(s, x + k, y + k, sh, k);
    s = s.toUpperCase();
    for (let i = 0; i < s.length; i++) {
      const g = FONT[s[i]] || FONT[" "];
      for (let r = 0; r < 5; r++) { const bits = +g[r]; for (let col = 0; col < 3; col++) if (bits & (4 >> col)) R(x + (i * 4 + col) * k, y + r * k, k, k, c); }
    }
  }
  const TC = (s, cx, y, c, k = 1, sh = null) => T(s, Math.round(cx - tw(s, k) / 2), y, c, k, sh);
  function plus(x, y, c, r = 2) { R(x - r, y, r * 2 + 1, 1, c); R(x, y - r, 1, r * 2 + 1, c); }
  function pool(cx, cy, rx, ry, c, f) {
    if (f <= 0) return;
    const v = C(c), y0 = Math.max(0, Math.floor(cy - ry)), y1 = Math.min(BH, Math.ceil(cy + ry));
    const x0 = Math.max(0, Math.floor(cx - rx)), x1 = Math.min(BW, Math.ceil(cx + rx));
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) {
      const dx = (xx - cx) / rx, dy = (yy - cy) / ry, d = dx * dx + dy * dy;
      if (d < 1 && BAY[(yy & 3) * 4 + (xx & 3)] < f * (1 - d) * 16) U[yy * BW + xx] = v;
    }
  }
  function cone(x, y0, y1, w0, w1, c, f) { for (let y = y0; y < y1; y++) { const k = (y - y0) / (y1 - y0), h = w0 + (w1 - w0) * k; D(x - h, y, h * 2, 1, c, f * (1 - 0.5 * k)); } }
  function vignette(cx, cy, z, f) {
    const v = C(INK), rx = 74 / z, ry = 130 / z;
    for (let yy = 0; yy < BH; yy++) for (let xx = 0; xx < BW; xx++) {
      const dx = (xx - cx) / rx, dy = (yy - cy) / ry, s = f * (Math.sqrt(dx * dx + dy * dy) - 0.8) / 0.4;
      if (s > 0 && BAY[(yy & 3) * 4 + (xx & 3)] < s * 16) U[yy * BW + xx] = v;
    }
  }
  function boards(y0, y1, c1, c2, seed = 0) {
    R(0, y0, BW, y1 - y0, c1);
    for (let y = y0; y < y1; y += 5) {
      R(0, y, BW, 1, c2);
      const off = (hash(y + seed) * 30) | 0;
      for (let x = off; x < BW; x += 30) R(x, y, 1, 5, c2);
      for (let x = 0; x < BW; x += 7) if (hash(x * 13 + y + seed) > 0.8) px(x + 2, y + 2, c2);
    }
    for (let i = 0; i < y1 - y0; i++) D(0, y0 + i, BW, 1, INK, 0.45 * i / (y1 - y0));
  }
  // textured dark floor that continues under the caption band
  let FL = null;
  function under(y0, c1 = WOOD2, seed = 21) { boards(y0, BH, c1, INK, seed); D(0, y0, BW, BH - y0, INK, 0.5); FL = { y0, snap: U.slice(y0 * BW) }; }
  // glossy floor: dithered mirror of the set above the floor line, only on floor pixels nothing was drawn over
  function reflect(t) {
    if (!FL) return; const y0 = FL.y0;
    for (let dy = 1; y0 + dy < BH; dy++) {
      const f = 0.5 * (1 - dy / 70); if (f <= 0) break;
      const sy = y0 - 1 - Math.floor(dy * 0.9); if (sy < 0) break;
      const off = Math.round(Math.sin(dy * 0.7 + t * 3));
      for (let xx = 0; xx < BW; xx++) {
        const i = (y0 + dy) * BW + xx; if (U[i] !== FL.snap[i - y0 * BW]) continue;
        if (BAY[((y0 + dy) & 3) * 4 + (xx & 3)] < f * 16) U[i] = U[sy * BW + Math.max(0, Math.min(BW - 1, xx + off))];
      }
    }
  }
  function bricks(x0, y0, w, h, c1, c2) {
    R(x0, y0, w, h, c1);
    for (let y = y0; y < y0 + h; y += 4) { R(x0, y, w, 1, c2); for (let x = x0 + ((y / 4) % 2 ? 0 : 4); x < x0 + w; x += 8) R(x, y, 1, 4, c2); }
  }

  // ---- characters (generic) ----
  // round angry bird facing right; o.brow: angry brows, o.sq: squash, o.blink, o.col
  function bird(cx, cy, r, col = ORG, o = {}) {
    const sq = o.sq || 0, ry = r * (1 - sq), rx = r * (1 + sq * 0.6);
    // tail feathers + head tuft
    line(cx - rx, cy - 1, cx - rx - r * 0.45, cy - r * 0.35, INK); line(cx - rx, cy + 1, cx - rx - r * 0.5, cy + r * 0.05, INK);
    R(cx - 1, cy - ry - r * 0.35, 2, r * 0.4, col); R(cx + 1, cy - ry - r * 0.25, 2, r * 0.3, col);
    ell(cx, cy, rx + 1, ry + 1, INK); ell(cx, cy, rx, ry, col);
    D(cx - rx, cy - ry, rx * 2, ry * 0.7, WH, 0.12);
    ell(cx + r * 0.1, cy + ry * 0.5, rx * 0.62, ry * 0.45, o.belly || CRM);
    // eyes
    const ey = cy - ry * 0.18, er = Math.max(1.2, r * 0.24);
    if (o.blink) { R(cx + r * 0.05, ey, er * 2, 1, INK); R(cx + r * 0.55, ey, er * 2, 1, INK); }
    else {
      circ(cx + r * 0.2, ey, er, WH); circ(cx + r * 0.68, ey, er, WH);
      R(cx + r * 0.2 + (o.look ?? 0.4), ey, Math.max(1, r * 0.12), Math.max(1, r * 0.14), INK);
      R(cx + r * 0.68 + (o.look ?? 0.4), ey, Math.max(1, r * 0.12), Math.max(1, r * 0.14), INK);
    }
    if (o.brow !== false) {
      const by = ey - er - 0.5;
      for (let k = 0; k < Math.max(1, r / 5); k++) {
        line(cx - r * 0.12, by - r * 0.22 + k, cx + r * 0.42, by + r * 0.08 + k, INK);
        line(cx + r * 1.0, by - r * 0.22 + k, cx + r * 0.48, by + r * 0.08 + k, INK);
      }
    }
    // beak
    const bx = cx + r * 0.38, byk = cy + ry * 0.08, bw = r * 0.62, bh = Math.max(2, r * 0.36);
    for (let i = 0; i < bh; i++) R(bx, byk + i, bw * (1 - i / bh) + 1, 1, i < bh * 0.5 ? YEL : "#c9962a");
  }
  function pig(cx, cy, r, o = {}) {
    const sq = o.sq || 0, ry = r * (1 - sq), rx = r * (1 + sq * 0.5);
    circ(cx - r * 0.55, cy - ry * 0.85, r * 0.28, PIG2); circ(cx + r * 0.55, cy - ry * 0.85, r * 0.28, PIG2);
    ell(cx, cy, rx + 1, ry + 1, INK); ell(cx, cy, rx, ry, PIG); D(cx - rx, cy + ry * 0.3, rx * 2, ry * 0.7, PIG2, 0.4);
    D(cx - rx * 0.6, cy - ry * 0.8, rx * 0.8, ry * 0.4, WH, 0.25);
    ell(cx, cy + ry * 0.12, rx * 0.36, ry * 0.26, SNOUT); R(cx - rx * 0.18, cy + ry * 0.08, 1, 2, PIG2); R(cx + rx * 0.14, cy + ry * 0.08, 1, 2, PIG2);
    const ey = cy - ry * 0.35, er = Math.max(1, r * 0.2);
    circ(cx - r * 0.42, ey, er, WH); circ(cx + r * 0.42, ey, er, WH);
    px(cx - r * 0.42, ey, INK); px(cx + r * 0.42, ey, INK);
  }
  function person(x, y, s, o = {}) {
    const sk = o.sil ? o.sil : SKIN, sh = o.sil || o.shirt || BLUE, pa = o.sil || o.pants || NAVY, hr = o.sil || o.hair || INK;
    const P = (c, r, w, h, col) => R(x + (c - 3.5) * s, y - 14 * s + r * s, w * s, h * s, col);
    P(2, 0, 3, 4, sk); P(1.6, -0.4, 3.8, 1.4, hr);
    if (o.hat) { P(1.2, -1.4, 4.6, 1.4, o.hat); }
    P(1, 4, 5, 6, sh);
    if (o.armUp) { P(5.6, 0.6, 1.2, 4.4, sh); P(5.6, 0, 1.2, 0.8, sk); } else if (o.handOut) { P(5.6, 4.2, 3, 1.2, sh); P(8.6, 4.2, 0.9, 1.2, sk); } else { P(5.6, 4.2, 1.2, 5, sh); P(5.6, 9, 1.2, 0.8, sk); }
    P(-0.2, 4.2, 1.2, 5, sh); P(-0.2, 9, 1.2, 0.8, sk);
    const st = o.step ? Math.round(Math.sin(o.step) * 1) : 0;
    P(1.6, 10, 1.6, 3.4 + st * 0.3, pa); P(3.8, 10, 1.6, 3.4 - st * 0.3, pa); P(1.4, 13.2, 2, 0.8, INK); P(3.6, 13.2, 2, 0.8, INK);
    if (o.rim) { R(x + (5 - 3.5) * s - 1, y - 14 * s, 1, 4 * s, o.rim); R(x + (6.8 - 3.5) * s - 1, y - 14 * s + 4.2 * s, 1, 5 * s, o.rim); R(x + (2 - 3.5) * s, y - 14 * s, 3 * s, 1, o.rim); }
  }
  function plate(s, cx, y, bg = CRM, fg = INK, k = 1) { const w = tw(s, k) + 4 + 2 * k, h = 5 * k + 4; R(cx - w / 2, y, w, h, WOOD2); R(cx - w / 2 + 1, y + 1, w - 2, h - 2, bg); TC(s, cx, y + 2, fg, k); }
  // small CRT tile; mode 0 off, 1 game over (red X), 2 gold, 3 cleared (mint)
  function tile(x, y, w, h, mode, t, i) {
    R(x, y, w, h, INK); R(x + 1, y + 1, w - 2, h - 2, mode === 0 ? "#141020" : mode === 2 ? GOLD : mode === 3 ? TEAL : "#2a0f1a");
    if (mode === 1) {
      const cx = Math.round(x + w / 2) - 1, cy = Math.round(y + h / 2) - 2;
      T("X", cx - 1, cy, (Math.floor(t * 2 + i * 0.37) % 4) ? RED : DAWN);
      R(x + 2, y + h - 3, w - 4, 1, "#5a1a28");
    } else if (mode === 3) { R(x + 2, y + 2, w - 4, 1, MINT); px(x + w - 3, y + h - 3, WH); }
    R(x + 1, y + 1, w - 2, 1, mode === 2 ? WH : "#3a2a4a");
  }
  function coin(x, y, r = 2) { circ(x, y, r, GOLD); px(x - 1, y - 1, WH); if (r > 2) ring(x, y, r, "#c08a20"); }

  // ---- s1 hook: 51 game-over screens, then the golden 52nd ----
  const GX = (i) => 31 + (i % 7) * 17, GY = (i) => 74 + Math.floor(i / 7) * 12;
  function sc1(t) {
    R(0, 0, BW, BH, NIGHT); bricks(0, 0, BW, 176, "#2a1a30", "#1f1326");
    D(0, 0, BW, 60, INK, 0.5);
    pool(90, 120, 80, 70, PLUM, 0.5);
    const lit = Math.floor(E(t, A("s1:51"), A("s1:hit") - A("s1:51")) * 51);
    const hit = A("s1:hit"), la = A("s1:Lalu"), k52 = A("s1:game#2+0.6"), sv = A("s1:menyelamatkan");
    const blinkAll = t >= hit && t < hit + 0.6 && (t * 8) % 1 < 0.5;
    for (let i = 0; i < 51; i++) {
      let m = i < lit ? 1 : 0;
      if (blinkAll) m = 0;
      if (t >= sv && hash(i * 3) < E(t, sv, 1.6)) m = 3;
      tile(GX(i), GY(i), 15, 10, m, t, i);
      if (t >= la && t < sv && m === 1) D(GX(i), GY(i), 15, 10, INK, 0.5);
    }
    // the 52nd slot
    const sx0 = GX(51), sy0 = GY(51);
    if (t < la) tile(sx0, sy0, 15, 10, 0, t, 51);
    else {
      const p = BK(t, k52, 0.5), w = 15 + 33 * p, h = 10 + 22 * p, x = sx0 + 7.5 + (90 - sx0 - 7.5) * p - w / 2, y = sy0 + 5 + (118 - sy0 - 5) * p - h / 2;
      const gl = t >= k52 ? 0.5 + 0.3 * Math.sin(t * 7) : 0.4 * ((t * 4) % 1 < 0.5);
      pool(x + w / 2, y + h / 2, w, h, GOLD, gl);
      R(x - 1, y - 1, w + 2, h + 2, INK); R(x, y, w, h, GOLD); R(x + 1, y + 1, w - 2, 2, WH); R(x, y + h - 2, w, 2, "#c08a20");
      if (p > 0.6) { R(x + 3, y + 4, w - 6, h - 8, NAVY); TC("52", x + w / 2, y + 7, GOLD, 2, INK); }
      if (t >= sv) {
        const q = BK(t, sv, 0.45);
        bird(x + w / 2, y - 6 - 8 * q, 4 + 5 * q, ORG, { look: 0.8 });
        for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28 + t * 0.6; line(x + w / 2 + Math.cos(a) * 16, y - 10 + Math.sin(a) * 14, x + w / 2 + Math.cos(a) * (22 + 3 * q), y - 10 + Math.sin(a) * (20 + 3 * q), i % 2 ? GOLD : CRM); }
      }
      if (t >= k52 && t < k52 + 1.2) for (let i = 0; i < 12; i++) { const ph = ((t - k52) * 1.4 + i / 12) % 1; plus(90 + Math.cos(i * 0.52) * 30 * ph, 118 + Math.sin(i * 0.52) * 30 * ph, ph < 0.5 ? WH : GOLD, 1); }
    }
    // level banner across the top of the wall
    if (t >= k52) { const p = E(t, k52, 0.3); R(46, 148 - 4 * (1 - p), 88, 11, INK); R(47, 149 - 4 * (1 - p), 86, 9, RED); TC("LEVEL 52", 90, 151 - 4 * (1 - p), GOLD, 1, INK); }
    // desk + joystick foreground
    R(0, 170, BW, 6, WOOD); R(0, 170, BW, 1, "#c27a48"); under(176, WOOD2, 3);
    R(18, 158, 30, 12, G3); R(18, 158, 30, 1, G2); R(31, 146, 3, 12, INK); circ(32, 145, 4, RED); px(31, 143, WH);
    circ(42, 164, 2, AMB); circ(24, 164, 2, MINT);
    R(130, 160, 34, 10, NAVY); R(132, 162, 30, 6, "#141020"); D(132, 162, 30, 6, PLUM, 0.3); T("1P", 140, 162, AMB);
  }

  // ---- s2a: snowy Finnish night, the small studio ----
  function snow(t, n = 70, y0 = 0, y1 = BH, sp = 14) {
    for (let i = 0; i < n; i++) {
      const x = (hash(i) * 200 + Math.sin(t * 0.9 + i) * 4 + t * 3) % 190 - 5, y = y0 + ((hash(i + 99) * (y1 - y0) + t * (sp + hash(i + 7) * sp)) % (y1 - y0));
      px(x, y, hash(i + 3) > 0.7 ? WH : G1); if (hash(i + 11) > 0.85) px(x + 1, y, WH);
    }
  }
  function sc2a(t) {
    G(0, 0, BW, 150, NAVY, PLUM);
    for (let i = 0; i < 30; i++) { const x = hash(i + 40) * BW, y = hash(i + 80) * 70; if ((t * 1.5 + hash(i) * 3) % 3 > 0.5) px(x, y, CRM); }
    circ(148, 38, 7, CRM); circ(151, 36, 6, NAVY);
    // far rooftops
    for (let i = 0; i < 10; i++) { const w = 16 + hash(i + 5) * 12, h = 30 + hash(i + 6) * 30, x = i * 19 - 6; R(x, 150 - h, w, h, "#241a38"); for (let k = 0; k < w / 2; k++) R(x + k, 150 - h - k * 0.6, w - 2 * k, 1, "#241a38"); R(x, 150 - h, w, 1, WH); for (let y = 150 - h + 5; y < 146; y += 7) for (let xx = x + 3; xx < x + w - 3; xx += 5) if (hash(xx * 3 + y * 7) > 0.65) R(xx, y, 2, 3, AMB); }
    // the studio building
    bricks(58, 100, 64, 56, BRICK, RED2); for (let k = 0; k < 34; k++) R(56 + k, 100 - k * 0.55, 68 - 2 * k, 1, k % 3 ? NAVY : "#2a3a5c");
    R(56, 99, 68, 2, WH);
    for (const [wx, wy] of [[64, 112], [80, 112], [106, 112], [64, 132], [106, 132]]) { R(wx, wy, 10, 9, INK); R(wx + 1, wy + 1, 8, 7, AMB); R(wx + 5, wy + 1, 1, 7, WOOD2); R(wx + 1, wy + 4, 8, 1, WOOD2); }
    R(83, 132, 14, 24, WOOD2); R(84, 133, 12, 23, WOOD); px(94, 145, GOLD);
    pool(90, 160, 40, 10, AMB, 0.55);
    if (t >= A("s2:Rovio")) { const p = BK(t, A("s2:Rovio"), 0.4); plate("ROVIO", 90, 120 - 8 * (1 - p), CRM, RED, 1); }
    if (t >= A("s2:2003")) { const p = E(t, A("s2:2003"), 0.3); R(70, 89 - 3 * (1 - p), 40, 9, WOOD2); R(71, 90 - 3 * (1 - p), 38, 7, GOLD); TC("EST.2003", 90, 91 - 3 * (1 - p), INK); }
    // snowy ground with blue dither shadows + footprints
    R(0, 156, BW, BH - 156, "#7d86ad"); D(0, 156, BW, 10, WH, 0.55); D(0, 166, BW, 104, NAVY, 0.35); D(0, 190, BW, 80, NIGHT, 0.55);
    for (let i = 0; i < 14; i++) R(10 + i * 6, 172 + (i % 2) * 3, 2, 1, "#8fa3d6");
    // three students walk in
    const m = A("s2:mahasiswa"), wk = E(t, m - 0.8, 1.6);
    const cols = [[TEAL, CRM], [RED, AMB], [BLUE, WH]];
    for (let i = 0; i < 3; i++) {
      const x = -10 + (66 + i * 16) * wk + 10 * wk, y = 172;
      person(x, y, 1.6, { shirt: cols[i][0], pants: INK, hair: i === 1 ? WOOD2 : INK, hat: cols[i][1], step: wk < 1 ? t * 10 + i : 0 });
    }
    if (t >= m) { const p = E(t, m, 0.3); if (p > 0.2) for (let i = 0; i < 3; i++) plus(66 + i * 16 + 10, 142 - 4 * p, GOLD, 1); }
    snow(t, 80, 0, 200, 12);
  }

  // ---- s2b: years of client work, boxes pile up on the desk ----
  function sc2b(t) {
    R(0, 0, BW, BH, TEAL); D(0, 0, BW, 160, NAVY, 0.45);
    for (let y = 6; y < 150; y += 8) for (let x = 4; x < BW; x += 8) px(x, y, "#245357");
    // wall calendar sheets flipping (years go by)
    const yrs = ["2004", "2005", "2006", "2007", "2008"], yi = Math.min(4, Math.floor(E(t, A("s2:Bertahun-tahun"), 2.4) * 5));
    R(22, 60, 28, 26, WOOD2); R(23, 61, 26, 24, CRM); R(23, 61, 26, 6, RED); TC(yrs[yi], 36, 72, INK); R(28, 80, 16, 1, G2);
    // window with snow
    R(120, 50, 42, 34, INK); R(122, 52, 38, 30, "#3a4f7a"); snow(t, 20, 52, 82, 6); R(140, 52, 2, 30, INK); R(122, 66, 38, 2, INK);
    D(0, 0, 18, BH, INK, 0.2);
    // desk with monitors
    R(10, 140, 160, 6, WOOD); R(10, 140, 160, 1, "#c27a48"); R(10, 146, 160, 20, WOOD2);
    for (let i = 0; i < 3; i++) {
      const x = 18 + i * 34; R(x, 112, 28, 22, G3); R(x + 2, 114, 24, 17, ["#1d3a5a", "#3a1d4a", "#1d4a2a"][i]); R(x + 12, 134, 4, 6, G3);
      for (let k = 0; k < 4; k++) R(x + 4 + ((k * 5 + t * 12 * (i + 1)) % 18), 117 + k * 3, 4, 1, [AMB, MINT, RED][i]);
    }
    pool(60, 120, 60, 26, MINT, 0.25);
    // client boxes stacking up
    const n = Math.floor(E(t, A("s2:pesanan") - 1, 2.6) * 9);
    for (let i = 0; i < n; i++) {
      const c = i % 3, r = Math.floor(i / 3), x = 120 + c * 0 + (r % 2) * 2 - (c - 1) * 0, bx = 118 + (c === 0 ? 0 : c === 1 ? 24 : 12), by = 130 - r * 12 - (c === 2 ? 12 : 0);
      if (c === 2 && r > 1) continue;
      R(bx, by, 22, 11, INK); R(bx + 1, by + 1, 20, 9, ["#c9a77c", "#b88a5c", "#d6b88c"][i % 3]); R(bx + 2, by + 3, 18, 5, CRM); TC("KLIEN", bx + 11, by + 3, RED2);
      void x;
    }
    if (t >= A("s2:pesanan")) { const p = BK(t, A("s2:pesanan"), 0.35); R(110, 92 - 6 * (1 - p), 56, 11, INK); R(111, 93 - 6 * (1 - p), 54, 9, RED); TC("PESANAN", 138, 95 - 6 * (1 - p), WH); }
    // a worker from behind at the desk
    person(52, 168, 2.4, { shirt: TEAL, pants: INK, hair: WOOD2, rim: MINT });
    under(166, WOOD2, 5);
  }

  // ---- s3: 2009 crisis, storm, staff shrink 50 -> 12, one coin left ----
  function sc3(t) {
    R(0, 0, BW, BH, "#1c1528"); D(0, 0, BW, 100, INK, 0.4);
    const bk = A("s3:bangkrut"), fl = [bk, bk + 3.1, A("s3:satu") - 0.6];
    let flash = 0; for (const l of fl) if (t >= l && t < l + 0.14) flash = 1;
    R(36, 28, 108, 46, INK); R(38, 30, 104, 42, flash ? "#b7c4ea" : NAVY);
    for (let i = 0; i < 30; i++) { const x = 38 + ((i * 37 + t * 60) % 104), y = 30 + ((i * 23 + t * 150) % 42); line(x, y, x - 2, y + 4, "#5d6fa3"); }
    if (flash) { line(110, 30, 102, 50, WH); line(102, 50, 112, 54, WH); line(112, 54, 104, 72, WH); }
    R(89, 30, 2, 42, INK); R(38, 50, 104, 2, INK);
    // floor
    boards(78, 200, "#3a2a3e", "#241a2e", 31);
    pool(90, 130, 80, 50, flash ? "#b7c4ea" : PLUM, flash ? 0.6 : 0.3);
    // 50 desks; staff vanish down to 12
    const keep = (i) => hash(i * 17 + 5) < 0.24 + (i === 7 || i === 22 ? 1 : 0);
    const gone = E(t, A("s3:menyusut"), A("s3:12") - A("s3:menyusut") + 0.2);
    let kept = 0;
    for (let i = 0; i < 50; i++) {
      const c = i % 10, r = Math.floor(i / 10), x = 20 + c * 15 + (r % 2) * 3, y = 92 + r * 15;
      R(x, y + 5, 11, 3, WOOD); R(x, y + 8, 1, 4, WOOD2); R(x + 10, y + 8, 1, 4, WOOD2);
      R(x + 3, y + 1, 6, 4, G3); R(x + 4, y + 2, 4, 2, (t * 3 + i) % 2 < 1.8 ? "#3a6a8a" : MINT);
      const stays = keep(i) && kept < 12; if (stays) kept++;
      const out = !stays && hash(i * 7) < gone;
      if (!out) { circ(x + 6, y + 10, 2, [SKIN, "#c08a5a", "#e0b48a"][i % 3]); R(x + 4, y + 12, 5, 3, [BLUE, RED, TEAL, ORG][i % 4]); }
      else { R(x + 3, y + 11, 6, 2, G3); R(x + 3, y + 9, 1, 3, G3); if (t - A("s3:menyusut") < 3 && hash(i * 7) > gone - 0.08) plus(x + 6, y + 9, G2, 1); }
    }
    // the safe slides in with one coin
    const ua = A("s3:Uangnya");
    if (t >= ua) {
      const p = E(t, ua, 0.5), sy = 104 + 30 * (1 - p);
      D(0, 78, BW, 130, INK, 0.55 * p);
      R(58, sy, 64, 56, INK); R(60, sy + 2, 60, 52, G3); R(60, sy + 2, 60, 2, G2); R(62, sy + 50, 56, 2, "#4a4450");
      const op = E(t, ua + 0.5, 0.6);
      R(66, sy + 8, 48, 40, "#120c18");
      // open door swings to the left (drawn as a narrowing panel)
      const dw = 48 * (1 - op) + 6; R(66 - (48 - dw) * 0.15, sy + 8, dw, 40, G2); if (dw > 14) { ring(66 + dw / 2, sy + 28, 7, INK); circ(66 + dw / 2, sy + 28, 2, AMB); }
      const so = A("s3:satu");
      if (t >= so) { const q = BK(t, so, 0.4); pool(90, sy + 34, 20, 12, GOLD, 0.6 * q); coin(90, sy + 36 - 2 * q, 3 + q); }
      if (op > 0.9) plate("DANA 1 GAME", 90, sy + 58, CRM, INK);
    }
    under(200, "#241a2e", 33);
    if (flash) D(0, 0, BW, BH, "#b7c4ea", 0.25);
  }

  // ---- s4a: the designer draws the bird ----
  function sc4a(t) {
    R(0, 0, BW, BH, PLUM); D(0, 0, BW, BH, INK, 0.35);
    // pinned sketches on the wall
    for (let i = 0; i < 5; i++) { const x = 8 + i * 34, y = 20 + (i % 2) * 8; R(x, y, 24, 18, CRM); D(x, y, 24, 18, G2, 0.3); circ(x + 12, y + 1, 1, RED); ring(x + 12, y + 10, 4 + (i % 2), G3); }
    // lamp
    R(26, 56, 2, 30, G3); line(27, 56, 52, 48, G3); R(48, 44, 14, 7, AMB); R(50, 51, 10, 1, WH);
    cone(56, 52, 160, 5, 50, CRM, 0.25);
    // drawing board
    const by0 = 72;
    R(64, by0 - 2, 92, 84, WOOD2); R(66, by0, 88, 80, CRM); for (let x = 70; x < 154; x += 8) D(x, by0, 1, 80, G2, 0.5); for (let y = by0 + 4; y < by0 + 80; y += 8) D(66, y, 88, 1, G2, 0.5);
    pool(108, by0 + 40, 50, 44, WH, 0.3);
    const mg = A("s4:menggambar"), mr = A("s4:marah"), sy = A("s4:sayap"), kk = A("s4:kaki");
    const cx = 106, cy = by0 + 40, r = 16;
    const dp = cl((t - mg) / 1.3);
    let pen = null;
    if (t >= mg && t < mr) {
      ring(cx, cy, r, INK, dp);
      const a = dp * 6.2832 - 1.57; pen = [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
      if (dp >= 1) { const q = cl((t - mg - 1.3) / 0.8); if (q > 0.2) { ring(cx + 3, cy - 4, 3, INK); ring(cx + 11, cy - 4, 3, INK); } if (q > 0.5) { line(cx + 6, cy + 1, cx + 16, cy + 3, INK); line(cx + 6, cy + 5, cx + 14, cy + 3, INK); } if (q > 0.8) { line(cx - r, cy, cx - r - 6, cy - 4, INK); } pen = [cx + 14, cy + 3]; }
    }
    if (t >= mr) {
      const q = BK(t, mr, 0.45);
      bird(cx, cy, r * (0.85 + 0.15 * q), ORG, { sq: 0.12 * Math.sin((t - mr) * 18) * Math.max(0, 1 - (t - mr) * 2) });
      if (t < mr + 0.8) for (let i = 0; i < 8; i++) { const a = i * 0.785, d = 20 + 12 * E(t, mr, 0.8); plus(cx + Math.cos(a) * d, cy + Math.sin(a) * d, i % 2 ? RED : GOLD, 1); }
    }
    // sketched wing / legs, crossed out in red
    if (t >= sy) {
      const q = E(t, sy, 0.3);
      for (let k = 0; k < 4; k++) line(cx - 6 + k * 3, cy - 2, cx - 16 + k * 2, cy - 18 - k, G3);
      if (q > 0.5) { for (let d = 0; d < 2; d++) { line(cx - 20 + d, cy - 22, cx - 2 + d, cy - 2, RED); line(cx - 2 + d, cy - 22, cx - 20 + d, cy - 2, RED); } }
      pen = t < sy + 0.5 ? [cx - 10, cy - 12] : pen;
    }
    if (t >= kk) {
      const q = E(t, kk, 0.3);
      line(cx - 4, cy + r, cx - 6, cy + r + 10, G3); line(cx + 4, cy + r, cx + 6, cy + r + 10, G3); R(cx - 9, cy + r + 10, 5, 1, G3); R(cx + 5, cy + r + 10, 5, 1, G3);
      if (q > 0.5) for (let d = 0; d < 2; d++) { line(cx - 12 + d, cy + r - 1, cx + 12 + d, cy + r + 13, RED); line(cx + 12 + d, cy + r - 1, cx - 12 + d, cy + r + 13, RED); }
      pen = t < kk + 0.5 ? [cx, cy + r + 6] : null;
    }
    if (t >= mr && t >= kk + 0.5) pen = null;
    if (pen) { line(pen[0], pen[1], pen[0] + 10, pen[1] - 16, YEL); line(pen[0] + 1, pen[1], pen[0] + 11, pen[1] - 16, ORG); px(pen[0], pen[1], INK); }
    // desk + designer silhouette (real person: silhouette + name plate)
    R(0, 156, BW, 6, WOOD); R(0, 156, BW, 1, "#c27a48");
    person(46, 172, 3, { sil: INK, rim: AMB, handOut: true });
    plate("JAAKKO", 46, 112, CRM, INK); plate("IISALO", 46, 121, CRM, INK);
    for (let i = 0; i < 4; i++) R(6 + i * 4, 150, 2, 6, [RED, YEL, TEAL, BLUE][i]);
    under(162, WOOD2, 41);
  }

  // ---- s4b: the enemy: a green pig on the swine-flu headline ----
  function sc4b(t) {
    R(0, 0, BW, BH, WOOD2); boards(0, BH, WOOD, WOOD2, 51); D(0, 0, BW, BH, INK, 0.25);
    // newspaper
    const fl = A("s4:flu");
    R(26, 64, 132, 112, G3); R(24, 62, 132, 112, CRM); D(24, 62, 132, 112, G1, 0.35);
    TC("BERITA DUNIA", 90, 66, G3); R(28, 73, 124, 1, INK);
    const hc = t >= fl && (t * 4) % 1 < 0.7 ? RED : INK;
    TC("FLU BABI", 90, 77, hc, 2);
    if (t >= fl) R(36, 89, 108, 1, RED);
    for (let i = 0; i < 9; i++) { R(30, 96 + i * 7, 46, 1, G2); R(30, 98 + i * 7, 38 + (i % 3) * 3, 1, G2); }
    R(82, 94, 70, 56, G2); R(83, 95, 68, 54, "#e8dcc0");
    pool(117, 122, 40, 30, PIG, 0.2);
    // pig pops up out of the photo
    const bb = A("s4:babi");
    if (t >= A("s4:Musuhnya")) {
      const p = BK(t, A("s4:Musuhnya") + 0.1, 0.5), hop = Math.abs(Math.sin((t - bb) * 5)) * (t > bb ? 5 : 0);
      pig(117, 126 - 6 * p - hop, 8 + 8 * p, { sq: hop > 3 ? -0.05 : 0.08 });
    }
    // the "konon" stamp
    const kn = A("s4:konon");
    if (t >= kn) {
      const p = E(t, kn, 0.18), s = 1 + 0.6 * (1 - p);
      const w = 40 * s, h = 13 * s, x = 104 - w / 2, y = 156 - h / 2;
      for (let d = 0; d < 2; d++) { R(x - d, y - d, w + 2 * d, 1, RED); R(x - d, y + h - 1 + d, w + 2 * d, 1, RED); R(x - d, y - d, 1, h + 2 * d, RED); R(x + w - 1 + d, y - d, 1, h + 2 * d, RED); }
      if (p > 0.95) TC("KONON", 104, 154, RED, 1);
    }
    // coffee cup + pencil foreground
    circ(40, 188, 12, G1); circ(40, 188, 9, WOOD2); circ(37, 185, 2, "#7a4a2a"); ring(40, 188, 12, G3);
    line(130, 196, 170, 180, YEL); line(130, 197, 170, 181, ORG); px(129, 197, INK);
  }

  // ---- s5a: the level: pull, release, topple ----
  function sc5a(t) {
    G(0, 0, BW, 150, SKY, SKY2);
    for (let i = 0; i < 4; i++) { const x = ((i * 61 + t * 4) % 230) - 40, y = 30 + i * 14; ell(x, y, 14, 4, WH); ell(x + 8, y - 3, 8, 4, WH); }
    // hills
    for (let x = 0; x < BW; x++) { const h = 26 + Math.sin(x * 0.05) * 8 + Math.sin(x * 0.13 + 1) * 4; R(x, 162 - h, 1, h, "#8cc76a"); D(x, 162 - h, 1, 4, WH, 0.3); }
    for (let x = 0; x < BW; x++) { const h = 12 + Math.sin(x * 0.08 + 2) * 6; R(x, 162 - h, 1, h, GRASS); }
    // ground
    R(0, 160, BW, 5, GRASS); for (let x = 0; x < BW; x += 3) R(x, 158 + (x % 2), 1, 2, GRASS2);
    R(0, 165, BW, BH - 165, WOOD); for (let i = 0; i < 90; i++) R(hash(i) * BW, 166 + hash(i + 3) * 100, 2, 1, WOOD2); D(0, 175, BW, 95, WOOD2, 0.5); D(0, 210, BW, 60, INK, 0.4);
    const tk = A("s5:tarik"), lp = A("s5:lepaskan"), rb = A("s5:robohkan");
    const imp = lp + 0.95;
    // tower (wood + glass) with a pig on top
    const fall = (i) => t < imp ? 0 : E(t, imp + i * 0.05, 0.7);
    const blocks = [[124, 130, 4, 30, WOOD], [150, 130, 4, 30, WOOD], [122, 126, 34, 4, GLASS], [128, 104, 4, 22, WOOD], [146, 104, 4, 22, WOOD], [126, 100, 26, 4, WOOD], [136, 110, 6, 16, GLASS]];
    blocks.forEach(([x, y, w, h, c], i) => {
      const f = fall(i), dx = (i % 2 ? 1 : -0.4) * 14 * f + (x - 139) * 0.6 * f, dy = Math.min(160 - (y + h), (160 - y - h) * f + 0);
      const ww = f > 0.5 && h > w ? h : w, hh = f > 0.5 && h > w ? w : h;
      const yy = f > 0.5 ? 160 - hh - (i % 3) * 4 * (1 - f) : y + dy;
      R(x + dx, yy, ww, hh, INK); R(x + dx + 1, yy + 1, ww - 2, hh - 2, c); if (c === WOOD) R(x + dx + 1, yy + 1, ww - 2, 1, "#c27a48"); else px(x + dx + 1, yy + 1, WH);
    });
    if (t < rb + 0.1) pig(139, 93, 7, {});
    else if (t < rb + 0.8) { const q = (t - rb) / 0.7; for (let i = 0; i < 8; i++) circ(139 + Math.cos(i * 0.8) * 10 * q, 93 + Math.sin(i * 0.8) * 8 * q, 4 * (1 - q) + 1, i % 2 ? WH : G1); }
    if (t >= rb + 0.2) { const q = E(t, rb + 0.2, 0.6); TC("5000", 139, 80 - 10 * q, t < rb + 2.5 ? GOLD : CRM, 1, INK); }
    // slingshot
    const sx = 34, sy = 136;
    R(sx - 2, sy, 4, 24, WOOD2); R(sx - 1, sy, 2, 24, WOOD);
    line(sx, sy + 2, sx - 7, sy - 12, WOOD2); line(sx + 1, sy + 2, sx - 6, sy - 12, WOOD); line(sx, sy + 2, sx + 7, sy - 12, WOOD2); line(sx + 1, sy + 2, sx + 8, sy - 12, WOOD);
    // bird position
    let bx = sx, byy = sy - 10, flying = false;
    if (t >= tk && t < lp) { const p = E(t, tk, 0.6); bx = sx - 12 * p; byy = sy - 10 + 6 * p; }
    if (t >= lp) { const q = cl((t - lp) / (imp - lp)); flying = q < 1; bx = sx + (128 - sx) * q; byy = (sy - 10) + (108 - sy + 10) * q - 40 * Math.sin(q * Math.PI); if (q >= 1) { const r2 = E(t, imp, 0.8); bx = 128 - 20 * r2; byy = 108 + 46 * r2; } }
    // trail
    if (t >= lp) for (let k = 1; k < 14; k++) { const q = cl((t - lp) / (imp - lp)) - k * 0.06; if (q <= 0) break; const x = sx + (128 - sx) * q, y = (sy - 10) + (108 - sy + 10) * q - 40 * Math.sin(q * Math.PI); if (k % 2) R(x, y, 2, 2, WH); }
    // elastic band
    if (t < lp + 0.06) { line(sx - 7, sy - 11, bx - 3, byy, "#3a1a10"); line(sx + 8, sy - 11, bx - 3, byy + 1, "#3a1a10"); }
    else if (t < lp + 0.4) { const w = Math.sin((t - lp) * 40) * 3 * (1 - (t - lp) / 0.4); line(sx - 7, sy - 11, sx + 1, sy - 8 + w, "#3a1a10"); line(sx + 8, sy - 11, sx + 1, sy - 8 + w, "#3a1a10"); }
    bird(bx, byy, 5, ORG, { sq: flying ? -0.12 : 0 });
    if (t >= tk && t < lp) { const p = E(t, tk, 0.6); if (p > 0.5) TC("<<", sx - 26, sy - 14, WH, 1, INK); }
    // other birds waiting
    bird(16, 155, 4, YEL); bird(6, 156, 3.5, TEAL);
    // impact shards
    if (t >= imp && t < imp + 0.9) for (let i = 0; i < 12; i++) { const q = (t - imp) / 0.9, a = -2.6 + i * 0.25; R(132 + Math.cos(a) * 30 * q, 110 + Math.sin(a) * 26 * q + 30 * q * q, 2, 2, i % 3 ? GLASS : WOOD); }
  }

  // ---- s5b: 8 months on the board, cost x4 ----
  function sc5b(t) {
    R(0, 0, BW, BH, "#3a2a3e"); bricks(0, 0, BW, 170, "#3a2a3e", "#2e2032");
    R(18, 54, 144, 106, WOOD2); R(21, 57, 138, 100, BOARD); D(21, 57, 138, 100, INK, 0.2);
    for (let i = 0; i < 40; i++) px(24 + hash(i) * 132, 60 + hash(i + 9) * 94, "#4a6a5a");
    pool(90, 100, 70, 50, CRM, 0.18);
    TC("8 BULAN", 90, 62, CRM, 1);
    const dg = A("s5:Digarap"), bl = A("s5:bulan");
    for (let i = 0; i < 8; i++) {
      const c = i % 4, r = Math.floor(i / 4), x = 32 + c * 30, y = 72 + r * 18;
      R(x, y, 22, 14, CRM); R(x, y, 22, 3, RED); for (let k = 0; k < 3; k++) R(x + 3 + k * 6, y + 6, 3, 2, G2);
      const ck = dg + 0.15 + i * 0.16;
      if (t >= ck) { const q = E(t, ck, 0.15); line(x + 5, y + 8, x + 9, y + 12 * q, GRASS2); line(x + 9, y + 12, x + 9 + 9 * q, y + 4, GRASS2); line(x + 10, y + 12, x + 10 + 9 * q, y + 4, GRASS2); }
    }
    // cost stacks x4
    const mb = A("s5:membengkak"), eu = A("s5:€100.000");
    const labs = ["25K", "50K", "75K", "100K"];
    for (let i = 0; i < 4; i++) {
      const st = mb + i * 0.42; if (t < st - 0.2 && i > 0) continue;
      const h = i === 0 ? 1 : E(t, st, 0.4), n = Math.round((i + 1) * 3 * h);
      const x = 54 + i * 26;
      for (let k = 0; k < n; k++) { R(x - 6, 146 - k * 3, 12, 3, "#c08a20"); R(x - 6, 146 - k * 3, 12, 1, GOLD); px(x - 4, 146 - k * 3, WH); }
      if (h > 0.6) TC("€" + labs[i], x, 146 - n * 3 - 8, i === 3 && t >= eu ? GOLD : CRM);
    }
    if (t >= eu) { const q = E(t, eu, 0.4); for (let i = 0; i < 8; i++) { const a = i * 0.785 + t; plus(132 + Math.cos(a) * 14 * q, 120 + Math.sin(a) * 14 * q, GOLD, 1); } }
    if (t >= A("s5:membengkak") + 0.6) { const q = BK(t, A("s5:membengkak") + 0.6, 0.4); T("X4", 36, 110, RED, 2 * (q > 0.5 ? 1 : 1)); }
    R(14, 160, 152, 4, WOOD); R(30, 158, 14, 2, WH); R(48, 158, 8, 2, YEL);
    under(170, WOOD2, 61);
  }

  // ---- s6a: release: giant generic phone in a shop window ----
  function phoneScreen(x, y, w, h, t, on) {
    if (!on) { R(x, y, w, h, "#0c0a14"); line(x + 4, y + h - 4, x + w - 6, y + 6, "#2a2638"); return; }
    G(x, y, w, h * 0.7, SKY, SKY2); R(x, y + h * 0.7, w, h * 0.3, GRASS); R(x, y + h * 0.7 + 3, w, h * 0.3 - 3, WOOD);
    const sx = x + 9, sy = y + h * 0.7 - 10;
    R(sx, sy, 2, 10, WOOD2); line(sx, sy, sx - 3, sy - 5, WOOD2); line(sx + 1, sy, sx + 4, sy - 5, WOOD2);
    const q = ((t * 0.5) % 1);
    bird(sx + 2 + (w - 22) * q, sy - 5 - 18 * Math.sin(q * Math.PI), 3, ORG);
    R(x + w - 12, sy - 6, 2, 16, WOOD); R(x + w - 6, sy - 6, 2, 16, WOOD); R(x + w - 13, sy - 8, 10, 2, WOOD);
    pig(x + w - 8, sy - 12, 3.4);
  }
  function sc6a(t) {
    R(0, 0, BW, BH, NIGHT); bricks(0, 0, BW, 170, "#2a1a30", "#1f1326");
    // shop window frame
    R(12, 40, 156, 130, INK); R(15, 43, 150, 124, "#1a1430"); D(15, 43, 150, 124, PLUM, 0.35);
    for (let x = 16; x < 166; x += 6) { const ph = (x * 7 + Math.floor(t * 4)) % 3; px(x, 44, ph ? AMB : RED); }
    const ag = A("s6:Angry"), on = t >= ag;
    pool(90, 105, 60, 60, on ? SKY : PLUM, on ? 0.35 : 0.15);
    // phone
    const px0 = 62, py0 = 52, pw = 56, ph = 108;
    R(px0 - 1, py0 + 2, pw + 2, ph - 4, INK); R(px0 + 2, py0 - 1, pw - 4, ph + 2, INK);
    R(px0, py0 + 1, pw, ph - 2, "#24222e"); R(px0 + 1, py0, pw - 2, ph, "#24222e"); R(px0 + 1, py0 + 1, pw - 2, 1, G3);
    phoneScreen(px0 + 4, py0 + 10, pw - 8, ph - 24, t, on);
    R(px0 + 22, py0 + 4, 12, 2, G3); ring(px0 + pw / 2, py0 + ph - 7, 3, G3);
    if (on && t < ag + 0.3) D(px0 + 4, py0 + 10, pw - 8, ph - 24, WH, 1 - (t - ag) / 0.3);
    // calendar
    const d11 = A("s6:11");
    { const p = BK(t, d11, 0.4); const cx = 34, cy = 62 + 10 * (1 - p); R(cx - 15, cy, 30, 34, WOOD2); R(cx - 14, cy + 1, 28, 32, CRM); R(cx - 14, cy + 1, 28, 7, RED); TC("DES", cx, cy + 2, WH); TC("11", cx, cy + 11, INK, 2); TC("2009", cx, cy + 24, G3); }
    // price tag
    const pr = A("s6:US$0,99");
    if (t >= pr) {
      const p = BK(t, pr, 0.45), sw = Math.sin((t - pr) * 6) * 2 * Math.max(0, 1 - (t - pr) * 0.6);
      const x = 146 + sw, y = 110 - 18 * (1 - p);
      line(120, 96, x - 8, y, G1); R(x - 18, y, 34, 16, GOLD); R(x - 17, y + 1, 32, 14, YEL); circ(x - 14, y + 4, 1, INK); TC("$0,99", x - 1, y + 5, RED2, 1);
    }
    // display shelf + street
    R(30, 160, 120, 6, G2); R(30, 160, 120, 1, WH);
    R(0, 170, BW, 3, G3); R(0, 173, BW, BH - 173, "#2a2233"); for (let x = 0; x < BW; x += 20) R(x, 173, 1, 30, "#1f1a28");
    pool(90, 176, 70, 14, on ? SKY : AMB, 0.45); D(0, 200, BW, 70, INK, 0.5);
  }

  // ---- s6b: climbing the paid chart to #1 ----
  const STX = (k) => 14 + k * 12.5, STY = (k) => 182 - k * 8.6;
  function sc6b(t) {
    G(0, 0, BW, 200, NAVY, DAWN);
    for (let i = 0; i < 20; i++) { const x = hash(i + 4) * BW, y = hash(i + 44) * 80; if ((t * 2 + i) % 3 > 0.6) px(x, y, CRM); }
    const fb = A("s6:Februari"), nm = A("s6:nomor");
    for (let k = 0; k < 10; k++) {
      const x = STX(k), y = STY(k);
      R(x, y, 13, 200 - y, k === 9 ? "#c08a20" : k % 2 ? "#3a4f7a" : "#4a5f8a"); R(x, y, 13, 2, k === 9 ? GOLD : SKY2); R(x + 12, y, 1, 200 - y, INK);
      TC("#" + (10 - k), x + 6.5, y + 4, k === 9 ? INK : CRM);
    }
    // bird hops step to step
    const hopT = (nm - fb) / 9;
    const s = Math.min(9, Math.max(0, Math.floor((t - fb) / hopT))), fr = t < fb ? 0 : Math.min(1, ((t - fb) % hopT) / hopT);
    const s0 = Math.min(9, s), s1 = Math.min(9, s + 1), moving = t >= fb && t < nm;
    const x0 = STX(s0) + 6.5, y0 = STY(s0) - 5, x1 = STX(s1) + 6.5, y1 = STY(s1) - 5;
    const bx = moving ? x0 + (x1 - x0) * fr : t < fb ? STX(0) + 6.5 : STX(9) + 6.5;
    const by = moving ? y0 + (y1 - y0) * fr - 7 * Math.sin(fr * Math.PI) : t < fb ? STY(0) - 5 : STY(9) - 5;
    bird(bx, by, 5, ORG, { sq: moving && fr < 0.15 ? 0.15 : 0 });
    if (t >= nm) {
      const q = BK(t, nm, 0.4);
      // crown
      const cx = STX(9) + 6.5, cy = STY(9) - 15 - 3 * q;
      R(cx - 5, cy, 10, 3, GOLD); for (let i = 0; i < 3; i++) R(cx - 5 + i * 4, cy - 3, 2, 3, GOLD); px(cx, cy + 1, RED);
      for (let i = 0; i < 10; i++) { const a = i * 0.628 + t; plus(cx + Math.cos(a) * 18 * q, cy + 6 + Math.sin(a) * 14 * q, i % 2 ? GOLD : WH, 1); }
    }
    // pennants planted on the top step
    const pole = STX(9) + 12, py = STY(9);
    const ig = A("s6:Inggris"), am = A("s6:Amerika");
    if (t >= ig - 0.2) {
      R(pole, py - 26, 1, 26, G1);
      const p1 = E(t, ig, 0.35), w1 = 34 * p1; R(pole - w1, py - 26, w1, 9, RED); if (p1 > 0.9) TC("INGGRIS", pole - 17, py - 24, WH);
      if (t >= am) { const p2 = E(t, am, 0.35), w2 = 34 * p2; R(pole - w2, py - 16, w2, 9, BLUE); if (p2 > 0.9) TC("AMERIKA", pole - 17, py - 14, WH); }
    }
    R(0, 200, BW, BH - 200, "#2a2233"); boards(200, BH, "#2a2233", INK, 71);
  }

  // ---- s7a: downloads past 1 billion, then 5 billion ----
  function sc7a(t) {
    G(0, 0, BW, 160, NIGHT, PLUM);
    for (let i = 0; i < 30; i++) { const x = hash(i) * BW, y = hash(i + 50) * 70; if ((t * 2 + hash(i + 9) * 3) % 3 > 0.4) px(x, y, CRM); }
    for (let i = 0; i < 9; i++) { const w = 18 + hash(i + 1) * 10, h = 36 + hash(i + 2) * 46, x = i * 21 - 4; R(x, 160 - h, w, h, i % 2 ? INK : "#22152c"); for (let y = 160 - h + 4; y < 156; y += 6) for (let xx = x + 3; xx < x + w - 3; xx += 5) if (hash(xx * 3 + y * 7) > 0.6) R(xx, y, 2, 3, hash(xx + y) > 0.5 ? AMB : MINT); }
    const m1 = A("s7:1"), m5 = A("s7:5"), mn = A("s7:menembus");
    // phones raining from the sky
    const rate = t < m5 ? 0.6 : 1.4;
    for (let i = 0; i < 26; i++) {
      const sp = 40 + hash(i) * 30, ph = (t - K.s7) * sp * rate + hash(i + 5) * 200, y = (ph % 230) - 30, x = 8 + hash(i + 2) * 164 + Math.sin(t + i) * 2;
      if (i > 12 && t < m5) continue;
      R(x, y, 6, 10, INK); R(x + 1, y + 1, 4, 7, [SKY, MINT, GOLD, DAWN][i % 4]); px(x + 3, y + 8, G3);
    }
    // download progress bar in the sky
    const bx = 26, bw = 128, by = 92;
    R(bx - 2, by - 2, bw + 4, 14, INK); R(bx, by, bw, 10, "#1a1428");
    const f1 = E(t, mn, m1 - mn + 0.4) * 0.2, f5 = E(t, m5, 0.9) * 0.8, fill = Math.min(1, f1 + f5);
    R(bx, by, bw * fill, 10, GRASS); for (let x = 0; x < bw * fill; x += 4) R(bx + x, by, 2, 10, "#7fd16a"); R(bx, by, bw * fill, 1, WH);
    
    if (t >= m5) { const q = BK(t, m5, 0.4); TC("5 MILIAR+", 90, 118 + 4 * (1 - q), GOLD, 2, INK); }
    else if (t >= m1) TC("1 MILIAR", 90, 112, CRM, 2, INK);
    // payoff fireworks
    if (t >= m5 - 0.1) for (let k = 0; k < 4; k++) {
      const a = (t - m5 - k * 0.3) % 1.6; if (t - m5 - k * 0.3 < 0 || a > 1.3) continue;
      const cx = [52, 128, 92, 150][k], cy = [44, 50, 30, 74][k], r = 4 + a * 22, c = [GOLD, MINT, RED, SKY][k];
      for (let i = 0; i < 18; i++) { const an = i / 18 * 6.28, x = cx + Math.cos(an) * r, y = cy + Math.sin(an) * r + a * a * 6; R(x, y, 2, 2, a < 1 ? c : PLUM); }
    }
    // crowd holding phones up, pile of phones on the ground
    R(0, 160, BW, 4, G3); R(0, 164, BW, BH - 164, "#2a2233"); boards(164, BH, "#2a2233", INK, 73);
    for (let i = 0; i < 14; i++) { const x = 6 + i * 13, y = 176 + (i % 3) * 5 + Math.round(Math.sin(t * 3 + i)); circ(x, y, 5, INK); R(x - 7, y + 4, 14, 30, INK); if (t >= m1 && i % 2 === 0) { R(x + 4, y - 14, 1, 10, INK); R(x + 2, y - 20, 5, 7, INK); R(x + 3, y - 19, 3, 5, SKY); } }
  }

  // ---- s7b: the movie, US$352 million, neon AUDIRA TECH on the cinema ----
  function sc7b(t) {
    G(0, 0, BW, 170, NAVY, PLUM);
    // searchlights
    for (let k = 0; k < 2; k++) { const a = Math.sin(t * 0.8 + k * 2) * 0.5 + (k ? 0.4 : -0.4); for (let i = 0; i < 110; i++) { const x = 90 + Math.sin(a) * i * (k ? 1 : -1) * 0.9 + (k ? 30 : -30), y = 150 - i; D(x - 1 - i * 0.08, y, 2 + i * 0.16, 1, SKY2, 0.3 * (1 - i / 110)); } }
    // cinema facade
    R(22, 74, 136, 100, "#3a1a2e"); R(22, 74, 136, 2, AMB);
    for (let x = 26; x < 156; x += 10) R(x, 78, 1, 96, "#2a1224");
    // neon AUDIRA TECH sign on the roof
    const nf = (t * 5) % 7 < 0.3 ? 0.4 : 1;
    R(44, 56, 92, 15, INK); R(45, 57, 90, 13, "#1c0f22"); TC("AUDIRA TECH", 90, 61, nf > 0.5 ? "#ff6fa8" : PLUM, 1); if (nf > 0.5) D(42, 54, 96, 19, "#ff6fa8", 0.15);
    R(60, 71, 2, 3, G3); R(118, 71, 2, 3, G3);
    // marquee
    R(32, 84, 116, 26, INK); R(34, 86, 112, 22, CRM); for (let x = 34; x < 146; x += 4) { px(x, 85, (Math.floor(t * 8) + x / 4) % 2 ? GOLD : WH); px(x, 108, (Math.floor(t * 8) + x / 4) % 2 ? WH : GOLD); }
    TC("FILM BURUNG", 90, 89, G3);
    const us = A("s7:US$352");
    if (t >= us) { const n = Math.min(11, Math.floor((t - us) / 0.06) + 1); TC("US$352 JUTA".slice(0, n).padEnd(11, " "), 90, 98, RED, 1); }
    // posters with generic bird / pig
    R(30, 118, 26, 34, GOLD); R(31, 119, 24, 32, SKY); bird(43, 134, 7, ORG);
    R(124, 118, 26, 34, GOLD); R(125, 119, 24, 32, GRASS); pig(137, 134, 7);
    // doors with warm light
    R(66, 122, 48, 52, INK); R(68, 124, 20, 50, AMB); R(92, 124, 20, 50, AMB); D(68, 124, 44, 50, ORG, 0.4);
    pool(90, 176, 70, 16, AMB, 0.5);
    R(0, 174, BW, 4, G2); R(0, 178, BW, BH - 178, "#2a2233"); D(0, 178, BW, 92, INK, 0.45);
    for (let i = 0; i < 9; i++) { const x = 70 + i * 6 + (i % 2) * 2; person(x, 182 + (i % 2), 1.5, { shirt: [RED, BLUE, TEAL, ORG][i % 4], pants: INK, rim: AMB }); }
  }

  // ---- s7c: Sega buys Rovio: the treasure chest ----
  function sc7c(t) {
    R(0, 0, BW, BH, "#24182c"); bricks(0, 0, BW, 168, "#2e1f36", "#24182c");
    const sg = A("s7:Sega"), eu = A("s7:€706"), yr = A("s7:2023");
    pool(90, 120, 80, 60, GOLD, t >= sg ? 0.45 : 0.15);
    // year plaque on the wall
    if (t >= yr) { const p = BK(t, yr, 0.4); plate("2023", 90, 78 - 6 * (1 - p), GOLD, INK, 2); }
    // chest
    const op = E(t, sg, 0.6);
    const cx = 90, by = 166;
    R(cx - 32, by - 34, 64, 34, INK); R(cx - 31, by - 33, 62, 32, WOOD); for (let y = by - 30; y < by; y += 6) R(cx - 31, y, 62, 1, WOOD2);
    R(cx - 31, by - 24, 62, 3, GOLD); R(cx - 31, by - 8, 62, 3, GOLD); R(cx - 4, by - 30, 8, 10, GOLD); R(cx - 2, by - 26, 4, 4, INK);
    plate("ROVIO", cx, by - 18, CRM, RED2);
    // lid lifts and leans back
    const lh = 14, ly = by - 34 - lh * op - 2 * op;
    R(cx - 32, ly - (1 - op) * lh, 64, lh * (1 - op * 0.6) + 2, INK); R(cx - 31, ly - (1 - op) * lh + 1, 62, lh * (1 - op * 0.6), WOOD); R(cx - 31, ly - (1 - op) * lh + 2, 62, 2, GOLD);
    if (op > 0.3) {
      R(cx - 30, by - 36, 60, 4, GOLD); for (let i = 0; i < 14; i++) circ(cx - 26 + i * 4, by - 37 - (i % 3), 2, i % 2 ? GOLD : YEL);
      for (let i = 0; i < 10; i++) { const a = -1.57 + (i - 4.5) * 0.22, d = 30 + 6 * Math.sin(t * 3 + i); line(cx + Math.cos(a) * 12, by - 40 + Math.sin(a) * 6, cx + Math.cos(a) * d, by - 40 + Math.sin(a) * d, i % 2 ? GOLD : CRM); }
      for (let i = 0; i < 10; i++) { const ph = ((t - sg) * 0.9 + i / 10) % 1, dir = i % 2 ? 1 : -1; coin(cx + dir * (8 + 34 * ph) + (i % 3) * 3, by - 40 - 40 * Math.sin(ph * Math.PI) + 30 * ph, 2); }
    }
    // price tag
    if (t >= eu) { const p = BK(t, eu, 0.45); const x = 128, y = 110 - 14 * (1 - p); line(cx + 30, by - 26, x - 10, y + 6, G1); R(x - 20, y, 38, 14, GOLD); R(x - 19, y + 1, 36, 12, YEL); TC("€706 JT", x - 1, y + 4, RED2); }
    // buyer's banner
    if (t >= sg) { const p = E(t, sg, 0.3); R(40, 94 - 3 * (1 - p), 34, 12, INK); R(41, 95 - 3 * (1 - p), 32, 10, BLUE); TC("SEGA", 57, 97 - 3 * (1 - p), WH); }
    R(0, 166, BW, 4, WOOD); under(170, WOOD2, 81);
    bird(52, 160, 5, ORG); bird(126, 160, 4.5, YEL); pig(140, 161, 4.5);
  }

  // ---- s8: the 51 screens become the staircase to the 52nd ----
  const HS = [1, 2, 3, 4, 5, 6, 7, 7, 8, 8];
  const STAIR = []; HS.forEach((h, c) => { for (let j = 0; j < h; j++) STAIR.push([22 + c * 12, 166 - (j + 1) * 8.5]); });
  function sc8(t) {
    const la = A("s8:latihan"), sun = E(t, la, 3);
    G(0, 0, BW, 172, NIGHT, PLUM); if (sun > 0) { G(0, 0, BW, 172, PLUM, DAWN); D(0, 0, BW, 172, NIGHT, (1 - sun) * 0.9); }
    const sy = 150 - 70 * sun;
    circ(140, sy, 18, AMB, 0.5 + 0.5 * sun); circ(140, sy, 13, CRM, sun);
    if (sun > 0.3) for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28 + t * 0.2; line(140 + Math.cos(a) * 22, sy + Math.sin(a) * 22, 140 + Math.cos(a) * (30 + 6 * sun), sy + Math.sin(a) * (30 + 6 * sun), AMB); }
    R(0, 166, BW, 6, G3); R(0, 166, BW, 1, G2); under(172, "#2a2233", 91);
    const mv = io(t, A("s8:sia-sia") + 0.2, 1.3);
    for (let i = 0; i < 51; i++) {
      const gx = GX(i), gy = GY(i) + 2, [qx, qy] = STAIR[i];
      const x = gx + (qx - gx) * mv, y = gy + (qy - gy) * mv, w = 15 - 4 * mv, h = 10 - 1.5 * mv;
      const ss = A("s8:sia-sia"), mode = mv > 0.2 ? 3 : t >= ss && hash(i * 5) < E(t, ss, 1.0) ? 0 : 1;
      tile(x, y, w, h, mode, t, i);
    }
    // golden 52 on the top step, bird on it
    const gp = io(t, la + 0.8, 0.8);
    if (gp > 0) {
      const x = 130, y = 166 - 8 * 8.5 - 12 * gp;
      pool(x + 5, y + 4, 26, 20, GOLD, 0.6 * gp);
      R(x - 2, y - 1, 15, 11, INK); R(x - 1, y, 13, 9, GOLD); TC("52", x + 5.5, y + 2, INK);
      const mc = A("s8:mencoba"), jp = t >= mc ? Math.abs(Math.sin((t - mc) * 6)) * 6 * Math.max(0, 1 - (t - mc) * 0.5) : 0;
      if (gp > 0.6) bird(x + 5, y - 8 - jp, 6, ORG, { sq: jp < 1 && t >= mc ? 0.1 : 0 });
    }
    // brand sign + CTA board
    const tl = A("s8:Tulis");
    if (t >= tl) {
      const p = BK(t, tl, 0.4), y = 80 + 6 * (1 - p);
      R(24, y, 62, 30, WOOD2); R(25, y + 1, 60, 28, NAVY); R(54, y + 30, 2, 40, WOOD2);
      TC("AUDIRA TECH", 55, y + 5, (t * 3) % 1 < 0.8 || t > A("s8:AUDIRA") ? GOLD : CRM);
      TC("COBA", 55, y + 14, WH); TC("SEKALI LAGI", 55, y + 21, WH);
    }
  }

  // ---- director ----
  const S2B = A("s2:Bertahun-tahun"), S4B = A("s4:Musuhnya"), S5B = A("s5:Digarap"), S6B = A("s6:Februari"), S7B = A("s7:Filmnya"), S7C = A("s7:Tahun");
  const CUTS = [K.s2, S2B, K.s3, K.s4, S4B, K.s5, S5B, K.s6, S6B, K.s7, S7B, S7C, K.s8];
  function shake(t, at, dur, amp) { const d = t - at; return d >= 0 && d < dur ? Math.sin(d * 55) * amp * (1 - d / dur) : 0; }
  function scene(t) {
    FL = null;
    let cam;
    if (t < K.s2) {
      sc1(t); const e = io(t, 0, K.s2);
      cam = { x: 90, y: 128 - 4 * e, z: 1 + 0.12 * e }; cam.x += shake(t, A("s1:game#2+0.6"), 0.45, 1.8);
    } else if (t < S2B) { sc2a(t); const e = io(t, K.s2, S2B - K.s2); cam = { x: 82 + 14 * e, y: 132, z: 1.04 + 0.06 * e }; }
    else if (t < K.s3) { sc2b(t); const e = io(t, S2B, K.s3 - S2B); cam = { x: 96 + 8 * e, y: 132, z: 1.1 + 0.06 * e }; }
    else if (t < K.s4) {
      sc3(t); const e = io(t, K.s3, A("s3:Uangnya") - K.s3), f = io(t, A("s3:Uangnya"), 1.2);
      cam = { x: 90, y: 124 + 4 * e, z: 1.3 - 0.1 * e + 0.1 * f }; cam.x += shake(t, A("s3:bangkrut"), 0.35, 1.5);
    } else if (t < S4B) { sc4a(t); const e = io(t, A("s4:menggambar") - 0.4, 1.6); cam = { x: 92, y: 128, z: 1.0 + 0.06 * e }; cam.y += shake(t, A("s4:marah"), 0.3, 1.2); }
    else if (t < K.s5) { sc4b(t); const e = io(t, S4B, K.s5 - S4B); cam = { x: 92, y: 130 - 4 * e, z: 1.06 + 0.1 * e }; cam.x += shake(t, A("s4:konon"), 0.25, 1.4); }
    else if (t < S5B) {
      sc5a(t); const lp = A("s5:lepaskan"), f = io(t, lp - 0.1, 1.2);
      cam = { x: 70 + 36 * f, y: 124, z: 1.0 }; cam.x += shake(t, lp + 0.95, 0.4, 2);
    } else if (t < K.s6) { sc5b(t); const e = io(t, S5B, K.s6 - S5B); cam = { x: 90, y: 128, z: 1.08 + 0.08 * e }; }
    else if (t < S6B) { sc6a(t); const e = io(t, K.s6, S6B - K.s6); cam = { x: 90, y: 126, z: 1.04 + 0.12 * e }; }
    else if (t < K.s7) { sc6b(t); const e = io(t, S6B, A("s6:nomor") - S6B + 0.4); cam = { x: 84 + 12 * e, y: 150 - 26 * e, z: 1.08 }; }
    else if (t < S7B) { sc7a(t); const e = io(t, K.s7, S7B - K.s7); cam = { x: 90, y: 128, z: 1.14 - 0.14 * e }; cam.y += shake(t, A("s7:5"), 0.5, 2); }
    else if (t < S7C) { sc7b(t); const e = io(t, S7B, S7C - S7B); cam = { x: 90, y: 126, z: 1.0 + 0.08 * e }; }
    else if (t < K.s8) { sc7c(t); const e = io(t, S7C, K.s8 - S7C); cam = { x: 90, y: 128, z: 1.0 + 0.14 * e }; cam.y += shake(t, A("s7:Sega"), 0.3, 1.2); }
    else { sc8(t); const e = io(t, K.s8, K.end - K.s8); cam = { x: 88, y: 132 - 6 * e, z: 1.12 - 0.12 * e }; }
    reflect(t);
    if (FL) pool(cam.x, FL.y0 - 10, 80, 26, CRM, 0.12);
    vignette(cam.x, cam.y - 6, cam.z, 0.35);
    return cam;
  }

  return function draw(t) {
    const cam = scene(t);
    b.putImageData(img, 0, 0);
    const vw = 135 / cam.z, vh = 240 / cam.z;
    const sx = Math.max(0, Math.min(BW - vw, cam.x - vw / 2)), sy = Math.max(0, Math.min(BH - vh, cam.y - vh / 2));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, sx, sy, vw, vh, 0, 0, 1080, 1920);
    // INK fade through each cut
    let f = 0; for (const c of CUTS) { const d = Math.abs(t - c); if (d < 0.18) f = Math.max(f, 1 - d / 0.18); }
    if (f > 0) { ctx.fillStyle = INK; ctx.globalAlpha = f; ctx.fillRect(0, 0, 1080, 1920); ctx.globalAlpha = 1; }
  };
}
