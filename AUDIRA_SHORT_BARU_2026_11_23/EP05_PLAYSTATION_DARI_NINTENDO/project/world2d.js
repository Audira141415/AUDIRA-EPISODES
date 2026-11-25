// EP05 PlayStation lahir dari pembatalan Nintendo. ARCADECRT: 16-bit game world drawn into a 180x270 buffer,
// shown on the curved CRT of an AUDIRA arcade cabinet (nearest-neighbour, scanlines, glow). Every value is a pure function of t (seek-safe, no Math.random).
// Generic designs only: no real logos, consoles or likenesses; product names are plain pixel text.

// Anchors used only in this file (build-video.mjs passes them as extraAt).
export const ANCHORS = [
  "s1:dipermalukan", "s1:seratus",
  "s2:meminta", "s2:CD", "s2:Sony#2", "s2:kaset", "s2:CD#2", "s2:Play",
  "s3:merancang", "s3:chip", "s3:Kelak", "s3:Bapak",
  "s4:hak", "s4:Keuntungan", "s4:Bos", "s4:takut",
  "s5:bangga", "s5:Keesokan", "s5:Philips",
  "s6:dipermalukan", "s6:dua", "s6:Bosnya", "s6:memutuskan", "s6:konsol", "s6:dipimpin",
  "s7:Totalnya", "s7:tembus", "s7:seratus",
  "s8:tidak", "s8:Satu", "s8:batal", "s8:lahirlah", "s8:Ikuti",
];

const INK = "#1a1020", NIGHT = "#2b1d3a", PLUM = "#4a2c4f", BRICK = "#8a3b3b", ORG = "#e07a3a", AMB = "#f2b84b",
  CRM = "#f6e7c1", TEAL = "#2f6f73", MINT = "#6fc3a8", G1 = "#d8d2c8", G2 = "#b8b0a8", G3 = "#6b6470", RED = "#d94141",
  BLUE = "#4a6fb5", DAWN = "#f08a5d", WH = "#fff6e8", NAVY = "#1d2a4a", WOOD = "#9a5f36", WOOD2 = "#5a3420",
  BEIGE = "#e3d5b8", SKIN = "#d9a273", PINK = "#ff6fa8";

const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const FONT = {
  A: "25755", B: "65656", C: "34443", D: "65556", E: "74647", F: "74644", G: "34553", H: "55755", I: "72227", J: "11152",
  K: "55655", L: "44447", M: "57755", N: "65555", O: "25552", P: "65644", Q: "25563", R: "65655", S: "34216", T: "72222",
  U: "55557", V: "55552", W: "55775", X: "55255", Y: "55222", Z: "71247", 0: "75557", 1: "26227", 2: "61247", 3: "61216",
  4: "55711", 5: "74616", 6: "34757", 7: "71122", 8: "75757", 9: "75716", ".": "00002", ",": "00024", "+": "02720",
  "-": "00700", ":": "02020", "!": "22202", "?": "61202", "/": "11244", " ": "00000",
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
  const hash = (n) => { let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16; return (x >>> 0) / 4294967296; };

  // ---- pixel primitives ----
  // ARCADECRT: light and shade are alpha-blended (smooth), not Bayer-dithered (jury read dither as noise).
  function bl(i, v, a) {
    if (a >= 1) { U[i] = v; return; }
    const o = U[i], ia = 1 - a;
    U[i] = (0xff000000 | ((((o >>> 16) & 255) * ia + ((v >>> 16) & 255) * a) << 16) | ((((o >>> 8) & 255) * ia + ((v >>> 8) & 255) * a) << 8) | (((o & 255) * ia + (v & 255) * a) | 0)) >>> 0;
  }
  function px(x, y, c) { x = Math.floor(x); y = Math.floor(y); if (x >= 0 && y >= 0 && x < BW && y < BH) U[y * BW + x] = C(c); }
  function R(x, y, w, h, c) {
    const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y));
    const x1 = Math.min(BW, Math.round(x + w)), y1 = Math.min(BH, Math.round(y + h)), v = C(c);
    for (let yy = y0; yy < y1; yy++) U.fill(v, yy * BW + x0, yy * BW + Math.max(x0, x1));
  }
  function D(x, y, w, h, c, f) {
    if (f <= 0) return;
    const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y));
    const x1 = Math.min(BW, Math.round(x + w)), y1 = Math.min(BH, Math.round(y + h)), v = C(c), a = Math.min(1, f);
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) bl(yy * BW + xx, v, a);
  }
  function G(x, y, w, h, c1, c2) { R(x, y, w, h, c1); for (let i = 0; i < h; i++) D(x, y + i, w, 1, c2, i / Math.max(1, h - 1)); }
  function circ(cx, cy, r, c, f = 1) {
    for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) {
      if (dx * dx + dy * dy <= r * r + r * 0.6) {
        const xx = Math.round(cx + dx), yy = Math.round(cy + dy);
        if (f >= 1) px(xx, yy, c); else if (xx >= 0 && yy >= 0 && xx < BW && yy < BH) bl(yy * BW + xx, C(c), f);
      }
    }
  }
  function ring(cx, cy, r, c) {
    for (let a = 0; a < 64; a++) px(Math.round(cx + Math.cos(a / 64 * 6.2832) * r), Math.round(cy + Math.sin(a / 64 * 6.2832) * r), c);
  }
  function line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let e = dx + dy;
    for (let i = 0; i < 400; i++) { px(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
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
  // dithered elliptical light pool: strength f at the centre, falling to 0 at the rim
  function pool(cx, cy, rx, ry, c, f) {
    if (f <= 0) return;
    const v = C(c), y0 = Math.max(0, Math.floor(cy - ry)), y1 = Math.min(BH, Math.ceil(cy + ry));
    const x0 = Math.max(0, Math.floor(cx - rx)), x1 = Math.min(BW, Math.ceil(cx + rx));
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) {
      const dx = (xx - cx) / rx, dy = (yy - cy) / ry, d = dx * dx + dy * dy;
      if (d < 1) bl(yy * BW + xx, v, Math.min(1, f * (1 - d)));
    }
  }
  // light cone from (x,y0) widening to half-width w1 at y1
  function cone(x, y0, y1, w0, w1, c, f) { for (let y = y0; y < y1; y++) { const k = (y - y0) / (y1 - y0), h = w0 + (w1 - w0) * k; D(x - h, y, h * 2, 1, c, f * (1 - 0.5 * k)); } }
  // darken toward the edges of the view so the lit subject reads first
  function vignette(cx, cy, z, f) {
    const v = C(INK), rx = 70 / z, ry = 124 / z;
    for (let yy = 0; yy < BH; yy++) for (let xx = 0; xx < BW; xx++) {
      const dx = (xx - cx) / rx, dy = (yy - cy) / ry, d = Math.sqrt(dx * dx + dy * dy), s = f * (d - 0.82) / 0.4;
      if (s > 0) bl(yy * BW + xx, v, Math.min(1, s));
    }
  }
  // dark floor that keeps going under the caption band instead of a flat block
  function under(y0, seed = 21) { boards(y0, BH, WOOD2, INK, seed); D(0, y0, BW, BH - y0, INK, 0.6); }

  // ---- props ----
  function boards(y0, y1, c1, c2, seed = 0) {
    R(0, y0, BW, y1 - y0, c1);
    for (let y = y0; y < y1; y += 5) {
      R(0, y, BW, 1, c2);
      const off = (hash(y + seed) * 30) | 0;
      for (let x = off; x < BW; x += 30) R(x, y, 1, 5, c2);
    }
    D(0, y0, BW, y1 - y0, c2, 0.12);
    for (let i = 0; i < y1 - y0; i++) D(0, y0 + i, BW, 1, INK, 0.35 * i / (y1 - y0));
  }
  // generic disc console, bottom-centre (cx, by)
  function gconsole(cx, by, w, h, glow = 0) {
    const x = Math.round(cx - w / 2), y = by - h;
    if (glow > 0) { for (let r = 3; r > 0; r--) D(x - r * 3, y - r * 3, w + r * 6, h + r * 6, AMB, glow * 0.18 * (4 - r)); }
    R(x, y + 1, w, h - 1, G1); R(x + 1, y, w - 2, 1, G1);
    R(x + 1, y + 1, w - 2, 2, WH);
    R(x, by - 3, w, 3, G2); R(x + 1, by - 1, w - 2, 1, G3);
    R(x + 2, by - 5, w - 4, 1, TEAL);
    const lr = Math.max(3, Math.round(h * 0.32));
    circ(x + Math.round(w * 0.32), y + Math.round(h * 0.45), lr, G2); ring(x + Math.round(w * 0.32), y + Math.round(h * 0.45), lr, G3);
    circ(x + Math.round(w * 0.32), y + Math.round(h * 0.45), 1, G3);
    circ(x + Math.round(w * 0.7), y + Math.round(h * 0.42), 1.2, G3); circ(x + Math.round(w * 0.84), y + Math.round(h * 0.42), 1.2, G3);
    R(x + w - 5, by - 8, 2, 1, glow > 0 ? MINT : AMB);
  }
  // 16-bit style console stacked on a CD add-on, bottom-centre
  function combo(cx, by, label = 0) {
    const x = Math.round(cx - 30);
    R(x, by - 13, 60, 13, G3); R(x, by - 13, 60, 1, G2); R(x, by - 1, 60, 1, INK);
    R(x + 6, by - 9, 34, 1, INK); R(x + 50, by - 9, 3, 1, MINT);
    const y = by - 28, x2 = Math.round(cx - 27);
    R(x2, y + 1, 54, 14, BEIGE); R(x2 + 1, y, 52, 1, BEIGE); R(x2 + 1, y + 1, 52, 2, WH);
    R(x2 + 14, y + 3, 26, 2, INK);
    circ(x2 + 7, y + 9, 1.5, RED); circ(x2 + 47, y + 9, 1.5, RED);
    R(x2 + 18, y + 10, 18, 2, G2);
    if (label > 0) { const c = label > 0.5 ? AMB : CRM; TC("PLAY STATION", cx, by - 7, c, 1); }
  }
  function disc(cx, cy, r, t) {
    circ(cx, cy, r, G1); ring(cx, cy, r, G2); circ(cx, cy, r * 0.25, INK);
    const a = t * 5; px(cx + Math.cos(a) * r * 0.6, cy + Math.sin(a) * r * 0.6, AMB); px(cx + Math.cos(a + 0.3) * r * 0.65, cy + Math.sin(a + 0.3) * r * 0.65, MINT);
    px(cx + Math.cos(a + 3.2) * r * 0.6, cy + Math.sin(a + 3.2) * r * 0.6, WH);
  }
  function cart(x, y) {
    R(x, y, 14, 16, G2); R(x + 2, y + 3, 10, 8, CRM); R(x + 3, y + 5, 8, 1, RED); R(x + 3, y + 7, 6, 1, G3);
    for (let i = 0; i < 4; i++) R(x + 2 + i * 3, y + 13, 2, 3, G3);
  }
  function box(x, y, w = 8, h = 6) { R(x, y, w, h, G1); R(x, y, w, 1, WH); R(x, y + h - 2, w, 1, TEAL); R(x + w - 1, y, 1, h, G2); }
  // person, feet at (x,y), 7x14 units scaled by s
  function person(x, y, s, o = {}) {
    const sk = o.sil ? o.sil : SKIN, sh = o.sil || o.shirt || BLUE, pa = o.sil || o.pants || NAVY, hr = o.sil || o.hair || INK;
    const P = (c, r, w, h, col) => R(x + (c - 3.5) * s, y - 14 * s + r * s, w * s, h * s, col);
    const hb = o.bow ? 1.2 : 0; // bowed head: sinks into the shoulders, hair shows more than face
    P(2, hb, 3, 4 - hb * 0.4, sk); P(1.6, -0.4 + hb, 3.8, 1.4 + hb, hr);
    if (o.glasses && !o.sil) { P(2, 1.6 + hb, 3, 0.8, INK); }
    P(1, 4, 5, 6, sh);
    if (o.armUp) { P(5.6, 0.6, 1.2, 4.4, sh); P(5.6, 0, 1.2, 0.8, sk); } else if (o.handOut) { P(5.6, 4.2, 3, 1.2, sh); P(8.6, 4.2, 0.9, 1.2, sk); } else { P(5.6, 4.2, 1.2, 5, sh); P(5.6, 9, 1.2, 0.8, sk); }
    if (o.handOutL) { P(-2, 4.2, 3, 1.2, sh); P(-2.6, 4.2, 0.9, 1.2, sk); } else { P(-0.2, 4.2, 1.2, 5, sh); P(-0.2, 9, 1.2, 0.8, sk); }
    P(1.6, 10, 1.6, 3.4, pa); P(3.8, 10, 1.6, 3.4, pa); P(1.4, 13.2, 2, 0.8, INK); P(3.6, 13.2, 2, 0.8, INK);
    // rim light: 1 art px edge on the lit side(s); o.rimSide 1 = right, -1 = left, 0 = both
    if (o.rim) {
      const Q = (c, r, h) => R(x + (c - 3.5) * s, y - 14 * s + r * s, 1, h * s, o.rim);
      const sd = o.rimSide ?? 1;
      if (sd >= 0) { Q(5 - 1 / s, 0, 4); Q(6.8 - 1 / s, o.armUp ? 0.6 : 4.2, 5); Q(5.4 - 1 / s, 10, 3.4); }
      if (sd <= 0) { Q(2, 0, 4); Q(-0.2, 4.2, 5); Q(1.6, 10, 3.4); }
      R(x + (2 - 3.5) * s, y - 14 * s, 3 * s, 1, o.rim);
    }
  }
  function plate(s, cx, y, bg = CRM, fg = INK) { const w = tw(s) + 6; R(cx - w / 2, y, w, 9, WOOD2); R(cx - w / 2 + 1, y + 1, w - 2, 7, bg); TC(s, cx, y + 2, fg); }
  function note(x, y, c) { R(x, y + 4, 2, 2, c); R(x + 1, y, 1, 5, c); R(x + 2, y, 2, 1, c); }

  // ---- scenes ----
  function sc1(t) {
    R(0, 0, BW, BH, NIGHT);
    for (let x = 0; x < BW; x++) { const f = x % 9; R(x, 0, 1, 160, f < 2 ? INK : f < 5 ? PLUM : BRICK); }
    D(0, 0, BW, 70, INK, 0.5); D(0, 70, BW, 30, INK, 0.25);
    R(0, 0, BW, 26, BRICK); for (let x = 5; x < BW; x += 10) circ(x, 26, 5, BRICK); R(0, 24, BW, 1, AMB);
    // event banner over the stage
    R(36, 76, 108, 16, INK); R(37, 77, 106, 14, NAVY); TC("PAMERAN GAME", 90, 81, CRM);
    boards(160, 206, WOOD, WOOD2, 1); R(0, 160, BW, 2, "#c27a48"); under(206, 2);
    const dp = A("s1:dipermalukan"), red = t >= dp, rp = E(t, dp, 0.4);
    const lc = red ? RED : CRM;
    // spotlight from the rig onto the presenter
    cone(128, 26, 160, 4, 40, lc, 0.2 + 0.12 * rp);
    pool(116, 161, 60, 9, lc, 0.6);
    // pedestal + console
    R(54, 132, 42, 28, BRICK); R(54, 132, 42, 2, AMB); D(54, 144, 42, 16, INK, 0.35);
    R(63, 140, 24, 8, WOOD2); TC("100+", 75, 141, AMB);
    const glow = t >= A("s1:seratus") && !red ? 0.6 + 0.3 * Math.sin(t * 6) : 0.2;
    gconsole(75, 132 + Math.sin(t * 2), 38, 14, glow);
    if (!red) for (let i = 0; i < 8; i++) {
      const ph = (t * 1.6 + i * 0.37) % 1, a = i / 8 * 6.28 + 0.4;
      if (ph < 0.55) plus(Math.round(75 + Math.cos(a) * 30), Math.round(112 + Math.sin(a) * 14), ph < 0.25 ? WH : AMB, ph < 0.25 ? 2 : 1);
    }
    // Sony presenter: proud, then head bowed under a red light, sweat drops
    person(128, 164, 2.8, { shirt: BLUE, pants: INK, handOutL: !red, bow: red, rim: red ? RED : CRM, rimSide: -1 });
    plate("SONY", 128, 112, WH, BLUE);
    if (red) {
      for (let i = 0; i < 2; i++) { const ph = ((t - dp) * 1.4 + i * 0.5) % 1; R(140 + i * 3, 128 + ph * 14, 1, 2, "#8fd3ff"); }
      if (rp > 0.3) T("!", 104, 104, RED, 3, INK);
    }
    // audience in the foreground: calm, then pointing and laughing
    for (let i = 0; i < 15; i++) {
      const x = 4 + i * 12 + (i % 2) * 4, bob = Math.round(red ? Math.sin(t * 12 + i) * 1.5 : Math.sin(t * 2 + i) * 0.6);
      const y = 194 + (i % 3) * 6 + bob;
      circ(x, y, 6, INK); R(x - 9, y + 5, 18, 40, INK);
      R(x - 3, y - 6, 6, 1, red ? RED : PLUM);
      if (red && i % 2 === 0) { line(x + 5, y + 6, x + 12, y - 7, INK); line(x + 6, y + 6, x + 13, y - 7, INK); px(x + 13, y - 8, SKIN); }
    }
    if (red && rp > 0.3) for (let i = 0; i < 5; i++) {
      const ph = (t * 2.4 + i * 0.37) % 1;
      T("HA!", 8 + i * 34, 176 - Math.round(ph * 8), i % 2 ? WH : AMB, 1, INK);
    }
  }

  function sc2a(t) {
    G(0, 0, BW, 176, BLUE, DAWN);
    circ(142, 70, 9, AMB); D(128, 56, 28, 28, AMB, 0.2);
    for (let i = 0; i < 4; i++) { const x = ((i * 53 + t * 3) % 220) - 30, y = 40 + i * 13; R(x, y, 26, 4, CRM); R(x + 5, y - 3, 14, 3, CRM); D(x, y + 3, 26, 1, G2, 0.5); }
    // left building
    R(20, 74, 62, 102, "#c9a77c"); R(20, 74, 62, 3, BRICK); D(20, 77, 62, 99, WOOD, 0.15);
    R(26, 94, 50, 13, RED); R(27, 95, 48, 11, WH); TC("NINTENDO", 51, 98, RED);
    // right building
    R(98, 62, 62, 114, "#3c4f7a"); R(98, 62, 62, 3, NAVY); D(98, 65, 62, 111, NAVY, 0.2);
    R(108, 86, 42, 16, BLUE); R(109, 87, 40, 14, WH); TC("SONY", 129, 89, BLUE, 2);
    for (let y = 112; y < 166; y += 10) {
      for (let x = 26; x < 78; x += 9) R(x, y, 5, 6, hash(x * 7 + y) > 0.45 ? AMB : NAVY);
      for (let x = 104; x < 156; x += 9) R(x, y, 5, 6, hash(x * 5 + y * 3) > 0.5 ? AMB : INK);
    }
    R(44, 160, 14, 16, WOOD2); R(122, 160, 14, 16, INK);
    R(0, 176, BW, 8, G2); R(0, 184, BW, 86, G3); D(0, 184, BW, 86, INK, 0.3);
    for (let x = ((-t * 6) % 24); x < BW; x += 24) R(x, 222, 12, 2, CRM);
    const m = io(t, K.s2 + 0.2, A("s2:meminta") - K.s2 - 0.1);
    const met = t >= A("s2:meminta");
    person(52 + 31 * m, 186, 2, { shirt: RED, pants: NAVY, handOut: met });
    person(128 - 31 * m, 186, 2, { shirt: BLUE, pants: INK, handOutL: met });
    if (met) { const p = E(t, A("s2:meminta"), 0.3); if (p > 0.1) for (let i = 0; i < 4; i++) plus(90 + Math.cos(i * 1.57 + t * 2) * 8 * p, 150 + Math.sin(i * 1.57 + t * 2) * 6 * p, AMB, 1); }
    if (t >= A("s2:CD")) { const p = E(t, A("s2:CD"), 0.25); const y = 128 - 4 * p; R(58, y, 22, 16, INK); R(59, y + 1, 20, 14, WH); R(64, y + 16, 3, 3, INK); disc(69, y + 8, 5, t); }
  }

  function sc2b(t) {
    R(0, 0, BW, BH, TEAL); D(0, 0, BW, 160, NAVY, 0.4);
    for (let y = 6; y < 156; y += 7) for (let x = 3; x < BW; x += 7) px(x, y, "#245357");
    R(24, 100, 132, 3, WOOD); R(24, 103, 132, 1, WOOD2);
    box(32, 92, 10, 8); box(44, 94, 8, 6); cart(130, 84);
    boards(160, 200, WOOD, WOOD2, 3); R(0, 160, BW, 2, "#c27a48"); under(200, 4);
    // hanging lab lamp: cone onto the prototype, warm pool on the desk
    R(89, 0, 2, 62, INK); R(78, 62, 24, 6, G3); R(80, 62, 20, 1, G2); R(82, 68, 16, 1, AMB);
    cone(90, 69, 160, 8, 46, CRM, 0.16);
    pool(90, 161, 58, 9, AMB, 0.55); pool(90, 120, 40, 40, AMB, 0.12);
    // foreground: controller + cable left, cartridge stack right
    const fy = 182;
    R(14, fy, 34, 12, INK); R(16, fy + 1, 30, 10, G3); circ(22, fy + 6, 3, INK); circ(40, fy + 5, 1.5, RED); circ(44, fy + 7, 1.5, RED); R(15, fy, 32, 1, AMB);
    line(47, fy + 4, 60, fy - 6, INK); line(60, fy - 6, 66, fy - 14, INK);
    for (let i = 0; i < 3; i++) { R(140 - i, 176 - i * 8, 26, 8, i % 2 ? G3 : G2); R(140 - i, 176 - i * 8, 26, 1, AMB); R(146 - i, 178 - i * 8, 12, 4, CRM); }
    const lab = t >= A("s2:Play") ? 0.3 + 0.7 * ((t * 3) % 1 < 0.6 ? 1 : 0) : 0;
    combo(90, 160, lab);
    const kc = A("s2:kaset"), ci = E(t, kc, 0.5);
    const cy = t < kc ? 108 + Math.sin(t * 3) * 2 : 108 + (124 - 108) * ci;
    const cxp = t < kc ? 46 : 46 + (83 - 46) * ci;
    cart(cxp - 7, cy - 8);
    const dc = A("s2:CD#2"), di = E(t, dc, 0.5);
    if (di < 1) { const dx = 130 + (90 - 130) * di, dy = (t < dc ? 112 + Math.sin(t * 3 + 1) * 2 : 112 + (151 - 112) * di); disc(dx, dy, 8 - 4 * di, t); }
    else R(66, 151, 34, 1, MINT);
    if (t >= A("s2:Play")) for (let i = 0; i < 6; i++) { const ph = (t * 2 + i * 0.29) % 1; if (ph < 0.5) plus(62 + i * 11, 120 - (i % 2) * 8, WH, 1); }
  }

  function sc3(t) {
    R(0, 0, BW, BH, NAVY); D(0, 0, BW, 170, INK, 0.35);
    R(118, 50, 34, 42, INK); R(120, 52, 30, 38, "#24335e"); circ(140, 62, 5, CRM); R(134, 52, 1, 38, INK); R(120, 70, 30, 1, INK);
    for (let i = 0; i < 3; i++) { R(24, 104 + i * 18, 40, 2, WOOD2); for (let j = 0; j < 5; j++) R(26 + j * 8, 97 + i * 18, 6, 7, [G3, BRICK, TEAL, G2, PLUM][(i + j) % 5]); }
    // moonlight shaft from the window onto the floor
    for (let y = 92; y < 166; y++) { const k = (y - 92) / 74; D(120 - 40 * k, y, 30, 1, "#8fa3d6", 0.14 * (1 - 0.6 * k)); }
    pool(66, 150, 46, 36, AMB, 0.22);
    person(66, 178, 3, { shirt: CRM, pants: NAVY, glasses: true, hair: INK, rim: AMB, rimSide: -1 });
    // lamp (left of the engineer, lights his face and the bench)
    R(26, 150, 2, 16, G3); R(26, 148, 14, 2, G3); R(36, 145, 9, 5, AMB); R(37, 150, 7, 1, WH);
    cone(40, 151, 166, 4, 24, AMB, 0.34);
    boards(166, 206, WOOD, WOOD2, 5); R(0, 166, BW, 2, "#c27a48"); under(206, 6);
    pool(52, 167, 46, 6, AMB, 0.6); pool(112, 167, 34, 5, MINT, t >= A("s3:chip") ? 0.45 : 0);
    // foreground: stool back + coiled cable
    R(6, 184, 4, 40, INK); R(6, 184, 26, 4, INK); R(28, 184, 4, 40, INK); R(7, 185, 24, 1, WOOD);
    for (let i = 0; i < 3; i++) ring(156, 196 + i * 2, 9 - i, INK);
    plate("KUTARAGI", 66, 157);
    // circuit board
    R(88, 152, 50, 14, "#1f5b3a"); for (let i = 0; i < 6; i++) { R(90, 154 + i * 2, 46, 1, i % 2 ? "#2e7d4f" : "#1f5b3a"); }
    for (let i = 0; i < 5; i++) R(92 + i * 9, 153, 1, 12, MINT);
    const on = t >= A("s3:chip");
    const pulse = on ? 0.5 + 0.4 * Math.sin(t * 8) : 0;
    if (on) for (let r = 3; r > 0; r--) D(108 - r * 3, 151 - r * 3, 12 + r * 6, 10 + r * 6, AMB, pulse * 0.15 * (4 - r));
    R(108, 154, 10, 8, INK); for (let i = 0; i < 4; i++) { R(109 + i * 2.5, 152, 1, 2, G2); R(109 + i * 2.5, 162, 1, 2, G2); }
    if (on) {
      for (let i = 0; i < 6; i++) { const ph = ((t - A("s3:chip")) * 0.7 + i / 6) % 1; note(110 + Math.sin(ph * 8 + i) * 10 + (i % 3) * 4 - 4, 148 - ph * 46, ph < 0.8 ? (i % 2 ? AMB : MINT) : PLUM); }
    }
    if (t >= A("s3:Bapak")) {
      const p = E(t, A("s3:Bapak"), 0.35);
      const sx = 66, sy = 126 - 6 * p;
      for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28 + t; line(sx, sy, sx + Math.cos(a) * 10 * p, sy + Math.sin(a) * 10 * p, i % 2 ? AMB : CRM); }
      R(sx - 3, sy - 1, 7, 3, AMB); R(sx - 1, sy - 3, 3, 7, AMB); px(sx, sy, WH);
    }
  }

  function sc4a(t) {
    // negotiation room: two companies across one table, the contract between them
    R(0, 0, BW, BH, "#3a2230");
    for (let x = 0; x < BW; x += 12) R(x, 0, 1, 176, WOOD2);
    D(0, 0, BW, 176, INK, 0.35);
    R(60, 40, 60, 44, INK); G(62, 42, 56, 40, PLUM, DAWN); R(89, 42, 2, 40, INK); R(62, 61, 56, 2, INK);
    R(89, 0, 2, 28, INK); R(80, 28, 20, 6, G3); R(82, 34, 16, 1, AMB);
    cone(90, 35, 150, 6, 56, CRM, 0.16);
    boards(176, 206, WOOD2, INK, 7); under(206, 8);
    const hk = A("s4:hak"), kk = A("s4:Keuntungan");
    // negotiators: feet ~12 art px below the table top so they read as seated behind it
    person(40, 162, 2.6, { shirt: RED, pants: INK, rim: AMB, rimSide: 1, handOut: t < hk });
    person(140, 162, 2.6, { shirt: BLUE, pants: NAVY, rim: AMB, rimSide: -1, handOutL: t >= hk });
    
    pool(90, 150, 74, 10, AMB, 0.5);
    R(12, 150, 156, 6, WOOD); R(12, 150, 156, 1, "#c27a48"); R(12, 156, 156, 22, WOOD2); D(12, 156, 156, 22, INK, 0.3);
    R(16, 178, 4, 10, INK); R(160, 178, 4, 10, INK);
    plate("NINTENDO", 40, 163); plate("SONY", 140, 163, WH, BLUE);
    // the contract: flat on the table, then it rises as a scroll naming the clause
    const p = E(t, hk, 0.55);
    if (t < hk) { R(72, 147, 36, 4, CRM); R(74, 148, 26, 1, G3); line(104, 146, 112, 141, INK); }
    else {
      const w = 24 + 58 * p, h = 5 + 21 * p, sy = 146 - 38 * p, x0 = 90 - w / 2;
      D(x0 + 3, sy + 3, w, h, INK, 0.5);
      R(x0, sy, w, h, CRM); R(x0 - 2, sy - 2, w + 4, 3, "#e2cf9e"); R(x0 - 2, sy + h - 1, w + 4, 3, "#e2cf9e");
      if (p > 0.8) {
        TC("HAK GAME CD", 90, sy + 6, RED); TC("MILIK SONY", 90, sy + 15, INK);
        for (let i = 0; i < 4; i++) R(137 - i, sy + h + 2 + i, 1 + i * 2, 1, RED);
        pool(140, 130, 26, 30, RED, 0.18 * p);
      }
    }
    if (t >= kk) {
      const n = Math.floor(E(t, kk, 2) * 18);
      for (let i = 0; i < n; i++) { const x = 122 + (i % 6) * 5, y = 147 - Math.floor(i / 6) * 3; circ(x, y, 2, AMB); px(x - 1, y - 1, WH); }
      for (let i = 0; i < 4; i++) { const ph = ((t - kk) * 1.2 + i / 4) % 1; circ(84 + ph * 48, 146 - Math.sin(ph * 3.14) * 22, 2, AMB); }
    }
    // foreground: inkwell + quill bottom-left
    R(10, 190, 18, 14, INK); R(12, 188, 14, 3, G3); R(13, 190, 12, 1, AMB);
    line(20, 188, 8, 160, CRM); line(21, 188, 9, 160, G1);
  }

  function sc4b(t) {
    R(0, 0, BW, BH, BRICK); D(0, 0, BW, BH, INK, 0.55);
    R(28, 40, 124, 92, INK); G(31, 43, 118, 86, RED, DAWN);
    for (let i = 0; i < 12; i++) { const h = 10 + hash(i) * 26, x = 31 + i * 10; R(x, 129 - h, 9, h, PLUM); if (hash(i + 9) > 0.5) R(x + 3, 129 - h + 4, 2, 2, AMB); }
    R(89, 43, 2, 86, INK); R(31, 85, 118, 2, INK);
    const tk = A("s4:takut");
    // chair + silhouette
    R(70, 112, 40, 56, "#5a2a36"); R(72, 114, 36, 54, "#6e3442"); circ(90, 112, 18, "#5a2a36");
    pool(90, 90, 60, 50, DAWN, 0.25);
    person(90, 176, 3.2, { sil: INK, rim: DAWN, rimSide: 0 });
    if (t >= tk) {
      const p = E(t, tk, 0.3);
      R(80, 108, 7, 1, RED); R(93, 108, 7, 1, RED); px(86, 107, RED); px(93, 107, RED);
      const cy = 82 - 4 * p;
      circ(84, cy, 7, G3, p); circ(94, cy - 2, 8, G3, p); circ(103, cy, 6, G3, p);
      if (p > 0.6 && (t * 4) % 1 < 0.5) { line(92, cy + 6, 89, cy + 12, AMB); line(89, cy + 12, 93, cy + 12, AMB); line(93, cy + 12, 90, cy + 18, AMB); }
    }
    boards(168, 200, WOOD2, INK, 9); R(0, 168, BW, 2, WOOD);
    plate("YAMAUCHI", 90, 176);
    under(200, 10);
  }

  function crowd(y0, t, dir = 0, n = 15, rim = null) {
    for (let i = 0; i < n; i++) {
      const x = 2 + i * 12 + (i % 2) * 5 + dir * 6 * (i % 3 === 0 ? 1 : 0.6), y = y0 + (i % 3) * 7 + Math.round(Math.sin(t * 2 + i) * 0.6);
      const c = i % 4 === 0 ? PLUM : INK;
      circ(x, y, 5, c); R(x - 8, y + 4, 16, 30, c);
      if (rim) { R(x - 2, y - 5, 5, 1, rim); px(x - 4, y - 4, rim); px(x + 4, y - 4, rim); R(x - 8, y + 4, 4, 1, rim); R(x + 4, y + 4, 4, 1, rim); }
      if (dir) px(x + dir * 3, y - 1, G3);
    }
  }

  function sc5a(t) {
    R(0, 0, BW, BH, NIGHT); R(0, 30, BW, 3, G3); for (let x = 4; x < BW; x += 8) { line(x, 30, x + 4, 34, G3); circ(x, 36, 1, AMB); }
    R(0, 40, BW, 128, PLUM); D(0, 40, BW, 128, INK, 0.45);
    for (let k = 0; k < 2; k++) { const sx = k ? 150 : 30; for (let y = 36; y < 160; y++) { const f = (y - 36) / 124; D(sx + (90 - sx) * f - 3 - 8 * f, y, 6 + 16 * f, 1, CRM, 0.12); } }
    R(46, 96, 88, 22, RED); R(48, 98, 84, 18, "#b52f3a"); TC("CES 1991", 90, 102, CRM, 2, INK);
    R(46, 92, 1, 4, G3); R(133, 92, 1, 4, G3);
    R(20, 160, 140, 12, G3); R(20, 160, 140, 2, G1); R(20, 170, 140, 2, INK);
    R(78, 146, 24, 14, G2); R(78, 146, 24, 2, G1);
    pool(90, 150, 70, 26, CRM, 0.35);
    combo(90, 146, 1);
    person(126, 160, 2.2, { shirt: BLUE, pants: INK, armUp: t >= A("s5:bangga"), rim: CRM, rimSide: 0 });
    boards(172, 200, G3, NIGHT, 11); under(200, 12);
    crowd(198, t, 0, 15, PLUM);
    for (let i = 0; i < 9; i++) { const ph = Math.floor(t * 7 + i * 3.3); if (hash(ph * 13 + i) > 0.82) { const x = 12 + i * 18, y = 190 + (i % 3) * 6; plus(x, y, WH, 3); R(x - 1, y - 1, 3, 3, WH); } }
  }

  function sc5b(t) {
    G(0, 0, BW, 120, DAWN, AMB); circ(148, 70, 10, CRM); D(132, 54, 32, 32, WH, 0.15);
    for (let x = 0; x < BW; x += 30) R(x, 0, 3, 120, INK);
    R(0, 118, BW, 50, PLUM); D(0, 118, BW, 50, INK, 0.3);
    // morning light through the hall windows, falling on the new stage
    for (let k = 0; k < 4; k++) for (let y = 120; y < 162; y++) { const f = (y - 120) / 42; D(30 + k * 30 + 26 * f, y, 10, 1, CRM, 0.16 * (1 - f * 0.5)); }
    // dim Sony stage on the left
    R(18, 150, 50, 10, G3); R(30, 138, 22, 12, G2); gconsole(41, 138, 22, 8, 0); D(14, 120, 58, 42, INK, 0.55);
    R(24, 151, 34, 8, G3); TC("SONY", 41, 153, G2);
    // new stage on the right (kept inside the 135-px-wide view)
    const ph = A("s5:Philips");
    pool(112, 148, 42, 16, AMB, 0.45);
    R(78, 88, 68, 26, BLUE); R(80, 90, 64, 22, WH); TC("NINTENDO", 112, 93, RED); TC("+ PHILIPS", 112, 102, BLUE);
    R(80, 150, 64, 12, G1); R(80, 150, 64, 2, WH); R(80, 160, 64, 2, G3);
    person(97, 150, 2, { shirt: RED, pants: INK, armUp: true, rim: AMB }); person(128, 150, 2, { shirt: BLUE, pants: NAVY, armUp: t >= ph, rim: AMB });
    if (t >= ph) for (let i = 0; i < 26; i++) { const tt = (t - ph) * 30 + hash(i) * 40; const x = 80 + hash(i + 3) * 64 + Math.sin(tt * 0.1 + i) * 3, y = 116 + (tt % 40); R(x, y, 2, 2, [RED, AMB, MINT, BLUE][i % 4]); }
    boards(162, 200, G2, G3, 13); under(200, 14);
    crowd(196, t, 1, 15, AMB);
  }

  function sc6(t) {
    R(0, 0, BW, BH, NAVY); D(0, 0, BW, BH, PLUM, 0.25);
    const lt = [A("s6:dipermalukan"), A("s6:dipermalukan", 2.6), A("s6:memutuskan", 0.05)];
    let flash = 0; for (const l of lt) if (t >= l && t < l + 0.16) flash = 1;
    R(40, 34, 100, 82, INK); R(43, 37, 94, 76, flash ? "#8fa3d6" : NIGHT);
    for (let i = 0; i < 28; i++) { const x = 43 + ((i * 37 + t * 70) % 94), y = 37 + ((i * 23 + t * 160) % 76); line(x, y, x - 2, y + 5, "#5d6fa3"); }
    if (flash) { line(104, 37, 98, 60, WH); line(98, 60, 108, 66, WH); line(108, 66, 100, 96, WH); }
    R(89, 37, 2, 76, INK); R(43, 74, 94, 2, INK);
    // prototype stack
    const n = Math.floor(E(t, A("s6:dua"), 1.8) * 144);
    const slam = A("s6:memutuskan"), sj = t >= slam && t < slam + 0.25 ? Math.round(Math.sin((t - slam) * 40) * 1.5) : 0;
    for (let i = 0; i < n; i++) { const c = i % 9, r = Math.floor(i / 9), x = 26 + c * 6, y = 159 - r * 4 + (c % 2 ? sj : 0); R(x, y, 5, 3, G3); R(x, y, 5, 1, G2); px(x + 1, y + 1, (i * 7) % 5 ? TEAL : AMB); }
    // window light falling on the table (stronger on each lightning flash)
    pool(90, 166, 60, 10, "#8fa3d6", flash ? 0.8 : 0.32);
    pool(52, 140, 34, 26, AMB, 0.18);
    // Ohga
    const bo = A("s6:Bosnya");
    if (t >= bo) {
      const rise = E(t, bo, 0.5);
      const up = t < slam;
      person(134, 174 - 8 * (1 - rise), 3, { sil: INK, armUp: up && t > bo + 0.6, rim: flash ? WH : "#8fa3d6", rimSide: 0 });
      if (t >= slam && t < slam + 0.5) { for (let i = 0; i < 5; i++) line(144 + i * 3, 158, 148 + i * 5, 150 - i, AMB); }
    }
    boards(164, 204, WOOD2, INK, 15); R(0, 164, BW, 2, WOOD);
    const kb = A("s6:konsol");
    if (t >= kb) {
      const p = E(t, kb, 0.6), w = 70 * p;
      R(90 - w / 2, 168, w, 30, BLUE); D(90 - w / 2, 168, w, 30, NAVY, 0.15);
      for (let x = 0; x < w; x += 6) R(90 - w / 2 + x, 168, 1, 30, "#6b8ad0");
      if (p > 0.9) { const x = 70, y = 176; R(x, y, 40, 1, WH); R(x, y + 14, 40, 1, WH); R(x, y, 1, 14, WH); R(x + 39, y, 1, 14, WH); ring(x + 12, y + 7, 4, WH); R(x + 26, y + 6, 2, 2, WH); R(x + 31, y + 6, 2, 2, WH); }
    }
    if (bo <= t) plate("OHGA", 134, 118);
    under(204, 16);
    if (t >= A("s6:dipimpin")) { const p = E(t, A("s6:dipimpin"), 0.4); person(58, 186 - 6 * p, 2.4, { shirt: CRM, glasses: true, rim: "#8fa3d6" }); plate("KUTARAGI", 58, 135); }
    // foreground: backs of two board members' heads
    for (const [hx, hy] of [[20, 214], [160, 210]]) { circ(hx, hy, 11, INK); R(hx - 16, hy + 8, 32, 40, INK); R(hx - 4, hy - 11, 9, 1, "#5d6fa3"); }
    if (flash) D(0, 0, BW, BH, CRM, 0.18);
  }

  function sc7(t) {
    G(0, 0, BW, 150, NIGHT, PLUM);
    for (let i = 0; i < 30; i++) { const x = hash(i) * BW, y = hash(i + 50) * 80; if ((t * 2 + hash(i + 9) * 3) % 3 > 0.4) px(x, y, CRM); }
    for (let i = 0; i < 9; i++) { const w = 18 + hash(i + 1) * 10, h = 40 + hash(i + 2) * 50, x = i * 21 - 4; R(x, 150 - h, w, h, i % 2 ? INK : "#22152c"); for (let y = 150 - h + 4; y < 146; y += 6) for (let xx = x + 3; xx < x + w - 3; xx += 5) if (hash(xx * 3 + y * 7) > 0.6) R(xx, y, 2, 3, hash(xx + y) > 0.5 ? AMB : MINT); }
    // neon AUDIRA TECH
    const nf = (t * 5) % 7 < 0.3 ? 0.4 : 1;
    R(36, 94, 64, 15, INK); R(37, 95, 62, 13, "#1c0f22"); TC("AUDIRA TECH", 68, 99, nf > 0.5 ? PINK : PLUM); D(34, 92, 68, 19, PINK, 0.08 * nf);
    // fireworks
    // fireworks for the 100-million milestone: big bursts, repeating until the cut
    const fs = A("s7:tembus") - 0.15;
    if (t >= fs) for (let k = 0; k < 5; k++) {
      const a = (t - fs - k * 0.3) % 1.8; if (t - fs - k * 0.3 < 0 || a > 1.5) continue;
      const cx = [70, 124, 96, 46, 140][k], cy = [76, 64, 54, 60, 88][k], r = 5 + a * 26, c = [AMB, MINT, RED, PINK, CRM][k];
      if (a < 0.25) pool(cx, cy, 30, 30, c, 0.3 * (1 - a / 0.25));
      for (let i = 0; i < 22; i++) { const an = i / 22 * 6.28, x = cx + Math.cos(an) * r, y = cy + Math.sin(an) * r + a * a * 6; R(x, y, 2, 2, a < 1.1 ? c : PLUM); px(cx + Math.cos(an) * r * 0.65, cy + Math.sin(an) * r * 0.65 + a * a * 4, WH); }
    }
    // shop
    R(60, 112, 96, 74, "#3a2a3e"); R(60, 112, 96, 3, INK);
    for (let x = 60; x < 156; x += 8) { R(x, 116, 4, 8, RED); R(x + 4, 116, 4, 8, CRM); } R(60, 124, 96, 2, INK);
    R(66, 132, 52, 40, CRM); D(66, 132, 52, 40, AMB, 0.3); R(66, 132, 52, 1, INK);
    const tk = A("s7:Totalnya"), nb = 6 + Math.floor(E(t, tk, 2.4) * 30);
    for (let i = 0; i < nb; i++) { const c = i % 6, r = Math.floor(i / 6); box(68 + c * 8, 164 - r * 6, 8, 6); }
    R(124, 136, 26, 50, INK); R(126, 138, 22, 48, "#4b3651"); D(126, 138, 22, 48, AMB, 0.2);
    // date board
    R(34, 132, 32, 20, WOOD2); R(35, 133, 30, 18, CRM); TC("3.12", 50, 135, RED); TC("1994", 50, 143, INK); R(38, 152, 2, 30, WOOD2); R(60, 152, 2, 30, WOOD2);
    R(0, 186, BW, 4, G2); R(0, 190, BW, 80, "#2a2233"); D(0, 190, BW, 80, INK, 0.4);
    // warm storefront spill across the pavement and the queue
    pool(92, 190, 74, 22, AMB, 0.5); pool(92, 150, 44, 30, AMB, 0.15);
    const qv = t - K.s7;
    const cols = [RED, BLUE, TEAL, ORG, PLUM, MINT, BRICK, AMB];
    for (let i = 0; i < 9; i++) { const x = 116 - i * 13 + Math.min(10, qv * 0.8) - (i % 2); person(x, 188 + Math.round(Math.sin(t * 3 + i) * 0.5), 1.9, { shirt: cols[i % 8], pants: i % 2 ? INK : NAVY, hair: i % 3 ? INK : WOOD2, rim: AMB }); }
  }

  function sc8(t) {
    const sun = E(t, A("s8:lahirlah"), 2);
    R(0, 0, BW, BH, NIGHT);
    G(90, 0, 90, 168, PLUM, DAWN); if (sun > 0) D(90, 0, 90, 168, AMB, sun * 0.45);
    circ(130, 128 - 40 * sun, 16, AMB); circ(130, 128 - 40 * sun, 11, CRM);
    for (let i = 0; i < 10; i++) { const a = i / 10 * 3.14 + 3.14; line(130 + Math.cos(a) * 20, 128 - 40 * sun + Math.sin(a) * 20, 130 + Math.cos(a) * (30 + 8 * sun), 128 - 40 * sun + Math.sin(a) * (30 + 8 * sun), AMB); }
    // dusty attic left
    R(0, 0, 90, 168, "#251a30"); D(0, 0, 90, 168, PLUM, 0.2);
    R(22, 140, 62, 3, WOOD2); R(26, 143, 2, 25, WOOD2); R(78, 143, 2, 25, WOOD2);
    R(28, 126, 48, 14, G3); R(28, 126, 48, 1, G2); R(34, 131, 28, 1, INK); D(28, 126, 48, 14, "#8d8478", 0.3);
    line(22, 100, 40, 126, G2); line(22, 112, 34, 126, G2); line(22, 100, 22, 140, G2); line(28, 108, 22, 116, G2);
    for (let i = 0; i < 12; i++) { const y = 100 + ((hash(i) * 60 + t * 3) % 60), x = 10 + hash(i + 5) * 70; px(x, y, G3); }
    if (t >= A("s8:tidak")) { const p = E(t, A("s8:tidak"), 0.25); R(34, 150 - 3 * p, 38, 14, RED); R(35, 151 - 3 * p, 36, 12, CRM); TC("TIDAK", 53, 152 - 3 * p, RED); TC("RILIS", 53, 158 - 3 * p, INK); }
    // giant console right
    gconsole(130, 166, 56, 22, 0.4 + 0.6 * sun);
    boards(166, 206, WOOD2, INK, 17); R(0, 166, BW, 2, WOOD); under(206, 18); pool(130, 160, 50, 12, AMB, 0.3 + 0.4 * sun);
    // torn contract
    const bt = A("s8:batal"), ik = A("s8:Ikuti");
    if (t >= A("s8:Satu") && t < ik + 0.2) {
      const sp = E(t, bt, 0.6) * 30, rot = E(t, bt, 0.6);
      const fade = t > ik ? 1 - (t - ik) / 0.2 : 1;
      if (fade > 0) {
        R(68 - sp, 80 + rot * 6, 22, 30, CRM); R(90 + sp, 80 + rot * 10, 22, 30, CRM);
        for (let i = 0; i < 4; i++) { R(71 - sp, 88 + i * 5 + rot * 6, 16, 1, G3); R(93 + sp, 88 + i * 5 + rot * 10, 16, 1, G3); }
        for (let y = 0; y < 30; y += 2) { px(89 - sp + (y % 4 ? 1 : 0), 80 + y + rot * 6, CRM); }
      }
    }
    if (t >= ik) { const p = E(t, ik, 0.35); const y = 98 + 6 * (1 - p); R(60, y, 60, 16, INK); R(61, y + 1, 58, 14, NAVY); TC("AUDIRA TECH", 90, y + 5, (t * 3) % 1 < 0.8 ? AMB : CRM); R(60, y + 15, 60, 1, AMB); }
  }

  // ---- director: draws one scene into the buffer, returns the in-game camera ----
  const S2B = A("s2:Sony#2"), S4B = A("s4:Bos"), S5B = A("s5:Keesokan");
  const CHAP = [K.s2, K.s3, K.s4, K.s5, K.s6, K.s7, K.s8], SUBS = [S2B, S4B, S5B];
  function shake(t, at, dur, amp) { const d = t - at; return d >= 0 && d < dur ? Math.sin(d * 55) * amp * (1 - d / dur) : 0; }
  function scene(t) {
    let cam;
    if (t < K.s2) {
      sc1(t); const e = io(t, 0, K.s2);
      cam = { x: 94, y: 140 + 4 * e, z: 1 + 0.14 * e }; cam.x += shake(t, A("s1:dipermalukan"), 0.4, 1.5);
    } else if (t < S2B) { sc2a(t); const e = io(t, K.s2, S2B - K.s2); cam = { x: 84 + 12 * e, y: 132, z: 1.05 + 0.05 * e }; }
    else if (t < K.s3) { sc2b(t); const e = io(t, S2B, K.s3 - S2B); cam = { x: 90, y: 138, z: 1.12 + 0.1 * e }; }
    else if (t < K.s4) {
      sc3(t); const a = io(t, A("s3:merancang"), A("s3:chip") + 0.6 - A("s3:merancang")), b = io(t, A("s3:Kelak"), 0.8);
      const k = a * (1 - b); cam = { x: 90 + 20 * k, y: 140 + 12 * k, z: 1.15 + 0.22 * k };
    } else if (t < S4B) { sc4a(t); const e = io(t, K.s4, S4B - K.s4); cam = { x: 90, y: 130 - 6 * e, z: 1.08 + 0.06 * e }; cam.y += shake(t, A("s4:hak"), 0.3, 1.2); }
    else if (t < K.s5) { sc4b(t); const e = io(t, S4B, K.s5 - S4B); cam = { x: 90, y: 132 - 4 * e, z: 1.02 + 0.14 * e }; }
    else if (t < S5B) { sc5a(t); const e = io(t, K.s5, S5B - K.s5); cam = { x: 84 + 10 * e, y: 138, z: 1.14 - 0.04 * e }; }
    else if (t < K.s6) { sc5b(t); const e = io(t, S5B, K.s6 - S5B); cam = { x: 88 + 2 * e, y: 134, z: 1.0 + 0.04 * e }; cam.y += shake(t, A("s5:Philips"), 0.35, 1.2); }
    else if (t < K.s7) {
      sc6(t); const e = io(t, A("s6:konsol"), 1.4);
      cam = { x: 90, y: 134 + 18 * e, z: 1.04 + 0.12 * e };
      cam.x += shake(t, A("s6:dipermalukan"), 0.3, 1.2) + shake(t, A("s6:memutuskan"), 0.4, 2);
    } else if (t < K.s8) {
      sc7(t); const e = io(t, K.s7, A("s7:tembus") - K.s7), f = io(t, A("s7:tembus"), 1.2);
      cam = { x: 78 + 12 * e, y: 140 - 12 * f, z: 1.14 - 0.14 * f };
    } else { sc8(t); const e = io(t, K.s8, K.end - K.s8); cam = { x: 92, y: 138 - 4 * e, z: 1.16 - 0.16 * e }; }
    vignette(cam.x, cam.y - 6, cam.z, 0.35);
    return cam;
  }
  // channel-change static at each chapter cut (full) and at in-chapter cuts (light)
  function channel(t) {
    let amt = 0;
    for (const c of CHAP) { const d = Math.abs(t - c); if (d < 0.16) amt = Math.max(amt, 1 - d / 0.16); }
    for (const c of SUBS) { const d = Math.abs(t - c); if (d < 0.1) amt = Math.max(amt, 0.6 * (1 - d / 0.1)); }
    if (amt <= 0) return;
    const fr = Math.floor(t * 30);
    for (let i = 0; i < U.length; i++) { const h = hash(i * 7 + fr * 104729); if (h < amt) { const g = (30 + 200 * hash(i + fr * 31)) | 0; U[i] = (0xff000000 | (g << 16) | (g << 8) | g) >>> 0; } }
    const by = (fr * 37) % BH; R(0, by, BW, 3, WH); D(0, by + 3, BW, 8, G1, 0.4 * amt);
  }

  // ---- ARCADECRT cabinet: room + cabinet painted once, the game buffer shown on a curved CRT ----
  const SR = { x: 110, y: 350, w: 860, h: 900 };
  function PT(c, s, x, y, k, col) {
    c.fillStyle = col; s = s.toUpperCase();
    for (let i = 0; i < s.length; i++) { const gph = FONT[s[i]] || FONT[" "]; for (let r = 0; r < 5; r++) { const bits = +gph[r]; for (let q = 0; q < 3; q++) if (bits & (4 >> q)) c.fillRect(x + (i * 4 + q) * k, y + r * k, k, k); } }
  }
  const PTC = (c, s, cx, y, k, col) => PT(c, s, Math.round(cx - (s.length * 4 * k - k) / 2), y, k, col);
  function paintStage(c) {
    let g = c.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, "#0a0612"); g.addColorStop(0.6, "#140a22"); g.addColorStop(1, "#07040c");
    c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
    for (const [x0, col] of [[-300, "#39e6ff"], [1000, "#ff4fd8"]]) {
      c.fillStyle = "#120a1e"; c.fillRect(x0, 260, 380, 1360);
      const sg = c.createLinearGradient(0, 420, 0, 1100); sg.addColorStop(0, col); sg.addColorStop(1, "#1a0f2e");
      c.globalAlpha = 0.35; c.fillStyle = sg; c.fillRect(x0 + 40, 420, 300, 640);
      c.globalAlpha = 0.5; c.fillStyle = col; c.fillRect(x0 + 30, 300, 320, 70); c.globalAlpha = 1;
    }
    g = c.createLinearGradient(0, 1700, 0, 1920); g.addColorStop(0, "#1c1030"); g.addColorStop(1, "#05030a"); c.fillStyle = g; c.fillRect(0, 1700, 1080, 220);
    for (let y = 1710; y < 1920; y += 26) { c.fillStyle = "rgba(255,79,216,0.06)"; c.fillRect(0, y, 1080, 2); }
    g = c.createLinearGradient(90, 0, 990, 0); g.addColorStop(0, "#120a20"); g.addColorStop(0.5, "#241540"); g.addColorStop(1, "#120a20");
    c.fillStyle = g; c.fillRect(90, 90, 900, 1610);
    c.save(); c.shadowBlur = 30; c.lineWidth = 8;
    c.shadowColor = c.strokeStyle = "#39e6ff"; c.beginPath(); c.moveTo(96, 96); c.lineTo(96, 1694); c.stroke();
    c.shadowColor = c.strokeStyle = "#ff4fd8"; c.beginPath(); c.moveTo(984, 96); c.lineTo(984, 1694); c.stroke(); c.restore();
    // bezel
    c.beginPath(); c.roundRect(SR.x - 44, SR.y - 44, SR.w + 88, SR.h + 88, 70); c.fillStyle = "#06030a"; c.fill();
    c.strokeStyle = "#3a2758"; c.lineWidth = 6; c.stroke();
    // glossy bezel plastic: room neon reflected on the rim (cyan left, magenta right, soft top sheen)
    c.save(); c.beginPath(); c.roundRect(SR.x - 44, SR.y - 44, SR.w + 88, SR.h + 88, 70); c.clip();
    g = c.createLinearGradient(SR.x - 44, 0, SR.x + 30, 0); g.addColorStop(0, "rgba(57,230,255,0.35)"); g.addColorStop(1, "rgba(57,230,255,0)"); c.fillStyle = g; c.fillRect(SR.x - 44, SR.y - 44, 74, SR.h + 88);
    g = c.createLinearGradient(SR.x + SR.w + 44, 0, SR.x + SR.w - 30, 0); g.addColorStop(0, "rgba(255,79,216,0.35)"); g.addColorStop(1, "rgba(255,79,216,0)"); c.fillStyle = g; c.fillRect(SR.x + SR.w - 30, SR.y - 44, 74, SR.h + 88);
    g = c.createLinearGradient(0, SR.y - 44, 0, SR.y + 4); g.addColorStop(0, "rgba(255,255,255,0.22)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(SR.x - 44, SR.y - 44, SR.w + 88, 48);
    c.restore();
    c.beginPath(); c.roundRect(SR.x - 6, SR.y - 6, SR.w + 12, SR.h + 12, 62); c.strokeStyle = "#000"; c.lineWidth = 10; c.stroke();
    // control panel sits low (1560+), under the caption band; decor only
    c.beginPath(); c.moveTo(100, 1560); c.lineTo(980, 1560); c.lineTo(1010, 1820); c.lineTo(70, 1820); c.closePath();
    g = c.createLinearGradient(0, 1560, 0, 1820); g.addColorStop(0, "#3a2160"); g.addColorStop(1, "#170c28"); c.fillStyle = g; c.fill();
    c.fillStyle = "#6b4ba0"; c.fillRect(100, 1560, 880, 6);
    c.fillStyle = "#050308"; c.beginPath(); c.ellipse(300, 1730, 72, 26, 0, 0, 6.2832); c.fill();
    c.fillStyle = "#1c1c22"; c.fillRect(291, 1650, 18, 80);
    g = c.createRadialGradient(286, 1626, 6, 300, 1640, 44); g.addColorStop(0, "#ffb0b0"); g.addColorStop(0.35, "#ff4f4f"); g.addColorStop(1, "#8a1020");
    c.fillStyle = g; c.beginPath(); c.arc(300, 1640, 44, 0, 6.2832); c.fill();
    for (const [col, x, y] of [["#ff4f4f", 560, 1650], ["#ffd34d", 690, 1630], ["#39e6ff", 820, 1650], ["#6fe36f", 560, 1745], ["#ff4fd8", 690, 1725], ["#f6f6f6", 820, 1745]]) {
      c.fillStyle = "#050308"; c.beginPath(); c.ellipse(x, y + 10, 46, 34, 0, 0, 6.2832); c.fill();
      g = c.createRadialGradient(x - 12, y - 12, 4, x, y, 36); g.addColorStop(0, "#ffffff"); g.addColorStop(0.3, col); g.addColorStop(1, "#1a0f2e");
      c.fillStyle = g; c.beginPath(); c.arc(x, y, 36, 0, 6.2832); c.fill();
    }
  }
  // marquee: brand of the cabinet, drawn unzoomed so it is never cut by the camera (below the 180 px top safe line)
  function paintMarquee(c) {
    const g = c.createLinearGradient(0, 192, 0, 300); g.addColorStop(0, "#2a0f3a"); g.addColorStop(1, "#140822"); c.fillStyle = g; c.fillRect(150, 192, 780, 108);
    c.strokeStyle = "#ffd34d"; c.lineWidth = 4; c.strokeRect(156, 198, 768, 96);
    c.save(); c.shadowColor = "#ff8a00"; c.shadowBlur = 24; PTC(c, "AUDIRA TECH", 540, 210, 10, "#ffd34d"); c.restore();
    PTC(c, "ARCADE - EP 05", 540, 268, 4, "#39e6ff");
  }
  function paintFx(c) {
    const w = SR.w, h = SR.h;
    c.fillStyle = "rgba(0,0,0,0.22)"; for (let y = 0; y < h; y += 4) c.fillRect(0, y + 2, w, 2);
    let g = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.36, w / 2, h / 2, Math.max(w, h) * 0.74);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.55)"); c.fillStyle = g; c.fillRect(0, 0, w, h);
    g = c.createLinearGradient(0, 0, w * 0.6, h * 0.5); g.addColorStop(0, "rgba(255,255,255,0.10)"); g.addColorStop(0.45, "rgba(255,255,255,0.02)"); g.addColorStop(0.5, "rgba(255,255,255,0)");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  }
  const stage = document.createElement("canvas"); stage.width = 1080; stage.height = 1920; paintStage(stage.getContext("2d"));
  const fx = document.createElement("canvas"); fx.width = SR.w; fx.height = SR.h; paintFx(fx.getContext("2d"));
  const mq = document.createElement("canvas"); mq.width = 1080; mq.height = 320; paintMarquee(mq.getContext("2d"));
  const glo = document.createElement("canvas"); glo.width = 40; glo.height = 43; const gc = glo.getContext("2d");

  return function draw(t) {
    const cam = scene(t);
    channel(t);
    b.putImageData(img, 0, 0);
    const vw = 150 / cam.z, vh = vw * SR.h / SR.w;
    const sx = Math.max(0, Math.min(BW - vw, cam.x - vw / 2)), sy = Math.max(0, Math.min(BH - vh, cam.y - vh / 2));
    // cabinet camera: hook dives in, each chapter is a slow push-in toward the CRT, cuts breathe out, outro pulls back
    const dive = io(t, 0.15, 1.7), out = io(t, A("s8:Ikuti", 0.2), 2.2);
    const cs = [0, ...CHAP]; let ci = 0; while (ci + 1 < cs.length && t >= cs[ci + 1]) ci++;
    const c0 = cs[ci], c1 = ci + 1 < cs.length ? cs[ci + 1] : K.outro || c0 + 12, pr = cl((t - c0) / Math.max(1, c1 - c0));
    let Z = 0.94 + 0.06 * dive + 0.07 * (pr * pr * (3 - 2 * pr)); Z -= (Z - 0.94) * out;
    for (const c of CHAP) { const d = t - c; if (d > -0.5 && d < 0.6) Z -= 0.05 * Math.sin(Math.PI * (d + 0.5) / 1.1); }
    const ox = 540 + 14 * Math.sin(t * 0.23 + ci), oy = 800;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = "#05030a"; ctx.fillRect(0, 0, 1080, 1920);
    ctx.setTransform(Z, 0, 0, Z, ox - 540 * Z, oy - 800 * Z);
    ctx.imageSmoothingEnabled = true; ctx.drawImage(stage, 0, 0);
    gc.imageSmoothingEnabled = true; gc.clearRect(0, 0, 40, 43); gc.drawImage(buf, sx, sy, vw, vh, 0, 0, 40, 43);
    ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.45; ctx.drawImage(glo, SR.x - 90, SR.y - 90, SR.w + 180, SR.h + 180);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    ctx.save(); ctx.beginPath(); ctx.roundRect(SR.x, SR.y, SR.w, SR.h, 56); ctx.clip();
    ctx.imageSmoothingEnabled = false; ctx.drawImage(buf, sx, sy, vw, vh, SR.x, SR.y, SR.w, SR.h);
    ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.1; ctx.drawImage(buf, sx, sy, vw, vh, SR.x + 5, SR.y, SR.w, SR.h);
    ctx.imageSmoothingEnabled = true; ctx.globalAlpha = 0.18; ctx.drawImage(glo, SR.x, SR.y, SR.w, SR.h);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    const ry = ((t * 140) % (SR.h + 200)) - 200; ctx.fillStyle = "rgba(255,255,255,0.035)"; ctx.fillRect(SR.x, SR.y + ry, SR.w, 140);
    ctx.drawImage(fx, SR.x, SR.y);
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(mq, 0, 0);
  };
}
