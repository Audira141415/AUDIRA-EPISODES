// EP12 sprites: an articulated skater drawn natively on the art grid (no scaled mixels), plus standing figures.
// Every body is a stack of tapered capsules; each pixel keeps its surface normal, so a key light gives real volume in
// 6 ramp steps, seams get contact shadow, and edges get a sel-out outline or a rim. No faces: helmet, visor, plain skin.
import { hexToRgb, type RGB } from "../../kits/pixelstory/core/palette.ts";

type V = [number, number];
/** outline, dark, shade, base, light, highlight */
const R6 = (...h: string[]): RGB[] => h.map(hexToRgb);
export const MATS = {
  green: R6("#03140c", "#0a3a22", "#0f6a38", "#17a04f", "#3fd077", "#b6f7c4"),
  gold: R6("#2a1604", "#6b3a08", "#b56d10", "#f0ae22", "#ffd75a", "#fff3b8"),
  red: R6("#1e0509", "#4f0c16", "#8f1622", "#cf2a34", "#f0605c", "#ffc2b0"),
  blue: R6("#060c22", "#102457", "#1b4294", "#2f6bd0", "#62a0f2", "#cfe4ff"),
  white: R6("#1a1d28", "#4a5268", "#8089a2", "#c3cbdc", "#eef2fa", "#ffffff"),
  violet: R6("#12061e", "#2e1150", "#532286", "#7f3cbc", "#b070e6", "#e6c8ff"),
  orange: R6("#220b02", "#5a2207", "#9a3f0c", "#e0681a", "#ff9a48", "#ffe0b4"),
  black: R6("#050508", "#0e0f16", "#1a1c28", "#2a2d3e", "#4a5068", "#8e98b8"),
  skin: R6("#2c130c", "#6b3a26", "#a5664a", "#d99a74", "#f2c49e", "#ffe6cc"),
  hair: R6("#120a06", "#2c1a0e", "#52341a", "#8a5e2c", "#b98a48", "#e6c078"),
  visor: R6("#04060c", "#0a1422", "#142c4a", "#2a5c8e", "#7ac0ee", "#f0fcff"),
  steel: R6("#10141c", "#3a4454", "#6e7c90", "#aebccc", "#e2ecf6", "#ffffff"),
  coat: R6("#1c2430", "#4a5a6c", "#8296a8", "#bccad6", "#e6eef4", "#ffffff"),
  sheet: R6("#12303a", "#2c6472", "#4f93a0", "#86c2c8", "#bce4e4", "#f0ffff"),
} as const;
export type Mat = keyof typeof MATS;
const NAMES = Object.keys(MATS) as Mat[];
const IDX = Object.fromEntries(NAMES.map((n, i) => [n, i + 1])) as Record<Mat, number>;

export type Cap = { a: V; b: V; r0: number; r1: number; m: Mat; k?: number; band?: [number, number, Mat]; stripe?: [number, number, Mat] };
export type Key = {
  /** Direction light comes FROM (x right, y down, z to camera). */
  dir: [number, number, number];
  amb: number;
  key: number;
  rimDir: V;
  rim: string;
  rimAmt: number;
  tint?: RGB;
};
export const KEY0: Key = { dir: [0.35, -0.8, 0.5], amb: 0.3, key: 0.78, rimDir: [-1, -1], rim: "#CFE8FF", rimAmt: 0.75 };
export type Img = { w: number; h: number; ox: number; oy: number; px: Uint8ClampedArray };

/** Rasterise capsules (units, y down, origin on the ground) at u art px per unit. */
export const raster = (caps: Cap[], u: number, K: Key): Img => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const c of caps)
    for (const [p, r] of [[c.a, c.r0], [c.b, c.r1]] as [V, number][]) {
      x0 = Math.min(x0, (p[0] - r) * u); x1 = Math.max(x1, (p[0] + r) * u);
      y0 = Math.min(y0, (p[1] - r) * u); y1 = Math.max(y1, (p[1] + r) * u);
    }
  const ox = Math.floor(x0) - 2, oy = Math.floor(y0) - 2;
  const w = Math.ceil(x1) + 3 - ox, h = Math.ceil(y1) + 3 - oy;
  const mat = new Uint8Array(w * h), part = new Int16Array(w * h), val = new Float32Array(w * h);
  const n0 = Math.hypot(...K.dir);
  const L = K.dir.map((v) => v / n0);
  caps.forEach((c, ci) => {
    const ax = c.a[0] * u - ox, ay = c.a[1] * u - oy, bx = c.b[0] * u - ox, by = c.b[1] * u - oy;
    const dx = bx - ax, dy = by - ay, d2 = dx * dx + dy * dy || 1e-6, len = Math.sqrt(d2);
    const rm = Math.max(c.r0, c.r1) * u + 1;
    for (let y = Math.max(0, Math.floor(Math.min(ay, by) - rm)); y < Math.min(h, Math.max(ay, by) + rm); y++)
      for (let x = Math.max(0, Math.floor(Math.min(ax, bx) - rm)); x < Math.min(w, Math.max(ax, bx) + rm); x++) {
        const px = x + 0.5 - ax, py = y + 0.5 - ay;
        const t = Math.max(0, Math.min(1, (px * dx + py * dy) / d2));
        const r = Math.max(0.55, (c.r0 + (c.r1 - c.r0) * t) * u);
        const ex = px - dx * t, ey = py - dy * t, d = Math.hypot(ex, ey);
        if (d > r) continue;
        const nx = ex / r, ny = ey / r, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        const diff = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
        const perp = (px * -dy + py * dx) / len / r;
        let m = c.m;
        if (c.band && t > c.band[0] && t < c.band[1]) m = c.band[2];
        if (c.stripe && perp > c.stripe[0] && perp < c.stripe[1]) m = c.stripe[2];
        const i = y * w + x;
        mat[i] = IDX[m];
        part[i] = ci + 1;
        val[i] = (K.amb + K.key * diff) * (c.k ?? 1);
      }
  });
  const px = new Uint8ClampedArray(w * h * 4);
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : part[y * w + x]);
  const rx = Math.sign(K.rimDir[0]), ry = Math.sign(K.rimDir[1]);
  const rim = hexToRgb(K.rim);
  const T = K.tint ?? [255, 255, 255];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x, o = i * 4;
      let rgb: RGB;
      if (!mat[i]) {
        const j = at(x, y + 1) ? i + w : at(x, y - 1) ? i - w : at(x - 1, y) ? i - 1 : at(x + 1, y) ? i + 1 : -1;
        if (j < 0) continue;
        rgb = MATS[NAMES[mat[j] - 1]][0];
        px[o] = (rgb[0] * T[0]) / 255; px[o + 1] = (rgb[1] * T[1]) / 255; px[o + 2] = (rgb[2] * T[2]) / 255; px[o + 3] = 255;
        continue;
      }
      let v = val[i];
      const p = part[i];
      if (at(x - 1, y) > p || at(x + 1, y) > p || at(x, y - 1) > p) v *= 0.62;
      const ramp = MATS[NAMES[mat[i] - 1]];
      rgb = ramp[Math.max(1, Math.min(5, 1 + Math.round(v * 3.7)))];
      let R = (rgb[0] * T[0]) / 255, G = (rgb[1] * T[1]) / 255, B = (rgb[2] * T[2]) / 255;
      if (!at(x + rx, y) || !at(x, y + ry)) {
        const k = K.rimAmt * (!at(x + rx, y) && !at(x, y + ry) ? 1 : 0.7);
        R += (rim[0] - R) * k; G += (rim[1] - G) * k; B += (rim[2] - B) * k;
      }
      px[o] = R; px[o + 1] = G; px[o + 2] = B; px[o + 3] = 255;
    }
  return { w, h, ox, oy, px };
};

// ---------------------------------------------------------------- skater (profile, facing right)
export type Kit = { suit: Mat; trim: Mat; helmet: Mat; boot?: Mat };
export const HERO: Kit = { suit: "green", trim: "gold", helmet: "gold" };
export const RIVAL: Record<"red" | "blue" | "white" | "violet" | "orange", Kit> = {
  red: { suit: "red", trim: "white", helmet: "red" },
  blue: { suit: "blue", trim: "white", helmet: "white" },
  white: { suit: "white", trim: "red", helmet: "blue" },
  violet: { suit: "violet", trim: "orange", helmet: "violet" },
  orange: { suit: "orange", trim: "black", helmet: "black" },
};
export type Pose = { hip: V; torso: number; hd: V; fa: number; hN: V; hF: V; aN: V; aF: V; fN: number; fF: number; rot: number };
const rad = (d: number) => (d * Math.PI) / 180;
export const POSE: Record<string, Pose> = {
  // speed-skating tuck: back flat, near arm on the back
  glide: { hip: [-8, -42], torso: -20, hd: [12, -6], fa: 4, hN: [-25, 2], hF: [6, 27], aN: [4, -8], aF: [-40, -13], fN: 0, fF: 24, rot: 0 },
  push: { hip: [-6, -40], torso: -18, hd: [12, -6], fa: 4, hN: [12, 26], hF: [-25, 4], aN: [-40, -13], aF: [6, -8], fN: 24, fF: 0, rot: 0 },
  tuck: { hip: [-8, -36], torso: -14, hd: [12, -6], fa: 4, hN: [-26, 1], hF: [10, 24], aN: [2, -8], aF: [-8, -8], fN: 0, fF: 0, rot: 0 },
  // corner: inside hand on the ice, crossover legs
  lean: { hip: [-12, -38], torso: -6, hd: [12, -6], fa: 6, hN: [10, 31], hF: [-24, -8], aN: [12, -8], aF: [-40, -9], fN: -4, fF: 12, rot: 0 },
  cross: { hip: [-12, -37], torso: -8, hd: [12, -6], fa: 6, hN: [8, 31], hF: [-22, -12], aN: [-28, -10], aF: [14, -8], fN: 10, fF: 0, rot: 0 },
  start: { hip: [-10, -46], torso: -38, hd: [10, -9], fa: -2, hN: [8, 29], hF: [-22, 16], aN: [14, -8], aF: [-30, -9], fN: -6, fF: 14, rot: 0 },
  stand: { hip: [-2, -58], torso: -84, hd: [3, -14], fa: 0, hN: [-3, 32], hF: [8, 31], aN: [3, -8], aF: [-8, -8], fN: 0, fF: 0, rot: 0 },
  raise: { hip: [-4, -56], torso: -80, hd: [2, -14], fa: -12, hN: [10, -31], hF: [-16, -28], aN: [10, -8], aF: [-18, -9], fN: 0, fF: 10, rot: 0 },
  knees: { hip: [-12, -50], torso: -42, hd: [10, -5], fa: 26, hN: [6, 26], hF: [10, 25], aN: [2, -8], aF: [-8, -8], fN: 0, fF: 0, rot: 0 },
  // thrown backward: blades up
  fall: { hip: [0, -22], torso: 214, hd: [-10, -8], fa: -70, hN: [-14, -28], hF: [12, -28], aN: [38, -44], aF: [44, -18], fN: -50, fF: -30, rot: 0 },
  // sliding on the back, legs first (moving right)
  slide: { hip: [4, -11], torso: 186, hd: [-12, -5], fa: -60, hN: [-20, -20], hF: [4, -30], aN: [46, -24], aF: [50, -10], fN: -60, fF: -70, rot: 0 },
  // prone slide, head first
  prone: { hip: [-6, -11], torso: -6, hd: [12, -2], fa: 10, hN: [30, 6], hF: [26, -12], aN: [-50, -20], aF: [-52, -9], fN: 100, fF: 80, rot: 0 },
  // tumbling: one leg whipping forward
  trip: { hip: [-4, -34], torso: 10, hd: [11, 0], fa: 24, hN: [26, 14], hF: [24, -16], aN: [-34, -40], aF: [-46, -18], fN: 70, fF: 40, rot: 0 },
};
const mixV = (a: V, b: V, k: number): V => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const mixN = (a: number, b: number, k: number) => a + (b - a) * k;
export const mixPose = (a: Pose, b: Pose, k: number): Pose => ({
  hip: mixV(a.hip, b.hip, k), torso: mixN(a.torso, b.torso, k), hd: mixV(a.hd, b.hd, k), fa: mixN(a.fa, b.fa, k),
  hN: mixV(a.hN, b.hN, k), hF: mixV(a.hF, b.hF, k), aN: mixV(a.aN, b.aN, k), aF: mixV(a.aF, b.aF, k), fN: mixN(a.fN, b.fN, k), fF: mixN(a.fF, b.fF, k), rot: mixN(a.rot, b.rot, k),
});
/** Two-bone IK; bend +1 puts the joint on the facing side. Returns joint and clamped end. */
const ik = (a: V, e: V, l1: number, l2: number, bend: number): [V, V] => {
  let dx = e[0] - a[0], dy = e[1] - a[1];
  let d = Math.hypot(dx, dy) || 1e-6;
  const max = l1 + l2 - 0.2;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  const x = (d * d + l1 * l1 - l2 * l2) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  const ux = dx / d, uy = dy / d;
  return [[a[0] + ux * x + uy * h * bend, a[1] + uy * x - ux * h * bend], [a[0] + dx, a[1] + dy]];
};
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
const turn = (v: V, deg: number): V => {
  const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
  return [v[0] * c - v[1] * s, v[0] * s + v[1] * c];
};

export const skaterCaps = (p: Pose, kit: Kit): Cap[] => {
  const S = add(p.hip, [Math.cos(rad(p.torso)) * 32, Math.sin(rad(p.torso)) * 32]);
  const out: Cap[] = [];
  const bent = p.torso < -100 || p.torso > 100 ? -1 : 1;
  const leg = (a: V, f: number, k: number) => {
    const hip = p.hip;
    const [kn, an] = ik(hip, a, 27, 26, 1);
    const at = (v: V) => add(an, turn(v, f));
    out.push({ a: at([-11, 6.6]), b: at([17, 6.6]), r0: 0.95, r1: 0.95, m: "steel", k: 1.25 * k });
    out.push({ a: at([-5, 4]), b: at([-5, 6]), r0: 1.4, r1: 1.2, m: "steel", k });
    out.push({ a: at([9, 4]), b: at([9, 6]), r0: 1.4, r1: 1.2, m: "steel", k });
    out.push({ a: kn, b: an, r0: 6, r1: 3.9, m: kit.suit, k, band: [0.72, 1, kit.trim] });
    out.push({ a: at([-3, 1]), b: at([10, 2.4]), r0: 4.1, r1: 2.6, m: kit.boot ?? "black", k });
    out.push({ a: hip, b: kn, r0: 9.4, r1: 6.1, m: kit.suit, k, stripe: [-0.28, 0.12, kit.trim] });
  };
  const arm = (h: V, k: number) => {
    const [el, hd] = ik(S, add(S, h), 17.5, 16.5, -1 * bent);
    out.push({ a: S, b: el, r0: 5.2, r1: 4, m: kit.suit, k, band: [0.45, 0.8, kit.trim] });
    out.push({ a: el, b: hd, r0: 4, r1: 2.9, m: kit.suit, k });
    out.push({ a: hd, b: add(hd, turn([2, 0], 0)), r0: 3.4, r1: 3, m: kit.trim, k });
  };
  arm(p.hF, 0.6);
  leg(p.aF, p.fF, 0.6);
  const back = add(p.hip, [Math.cos(rad(p.torso)) * 20, Math.sin(rad(p.torso)) * 20]);
  out.push({ a: p.hip, b: back, r0: 9.6, r1: 10.6, m: kit.suit, stripe: [-0.05, 0.3, kit.trim] });
  out.push({ a: back, b: S, r0: 10.6, r1: 8, m: kit.suit, stripe: [-0.05, 0.3, kit.trim] });
  const H = add(S, p.hd);
  const face = (v: V) => add(H, turn(v, p.fa));
  out.push({ a: S, b: H, r0: 4.6, r1: 4.2, m: "skin", k: 0.8 });
  out.push({ a: face([3, 4]), b: face([4.5, 4.4]), r0: 4.8, r1: 4.2, m: "skin" });
  out.push({ a: face([-2.2, -1.4]), b: face([1.2, -2.2]), r0: 8.6, r1: 7.6, m: kit.helmet, stripe: [-0.18, 0.14, kit.suit] });
  out.push({ a: face([4.4, 1.2]), b: face([8, 1.5]), r0: 2.7, r1: 2.1, m: "visor", k: 1.25 });
  leg(p.aN, p.fN, 1);
  arm(p.hN, 1);
  if (p.rot) for (const c of out) { c.a = add(p.hip, turn([c.a[0] - p.hip[0], c.a[1] - p.hip[1]], p.rot)); c.b = add(p.hip, turn([c.b[0] - p.hip[0], c.b[1] - p.hip[1]], p.rot)); }
  return out;
};
/** Skating cycle 0..1: glide → tuck → push → tuck. */
export const stride = (ph: number, corner = false): Pose => {
  const k = ((ph % 1) + 1) % 1;
  const seq = corner ? [POSE.lean, POSE.cross, POSE.lean] : [POSE.glide, POSE.tuck, POSE.push, POSE.tuck, POSE.glide];
  const n = seq.length - 1, x = k * n, i = Math.min(n - 1, Math.floor(x)), f = x - i;
  return mixPose(seq[i], seq[i + 1], f * f * (3 - 2 * f));
};

// ---------------------------------------------------------------- standing figures (front or back), warm-up suit
export type FigOpts = { suit?: Mat; trim?: Mat; hat?: Mat; back?: boolean; arms?: "down" | "up" | "hips" | "point" | "medal"; k?: number; coat?: boolean; skates?: boolean; medal?: boolean; breathe?: number };
export const figure = (o: FigOpts = {}): Cap[] => {
  const suit = o.suit ?? "green", trim = o.trim ?? "gold", hat = o.hat ?? "gold", b = o.breathe ?? 0;
  const c: Cap[] = [];
  for (const s of [-1, 1]) {
    c.push({ a: [7 * s, -5], b: [9.5 * s, -2.4], r0: 4, r1: 2.6, m: o.skates ? "black" : "white" });
    c.push({ a: [6.4 * s, -50], b: [7.6 * s, -28], r0: 7.6, r1: 6, m: suit });
    c.push({ a: [7.6 * s, -28], b: [7.4 * s, -8], r0: 6, r1: 4.6, m: suit });
    c.push({ a: [9.6 * s, -48], b: [9.6 * s, -10], r0: 1.2, r1: 1, m: trim });
  }
  if (o.coat) c.push({ a: [0, -56], b: [0, -32], r0: 12, r1: 13.5, m: suit });
  c.push({ a: [0, -52], b: [0, -72 - b], r0: 9.6, r1: 11.5, m: suit });
  c.push({ a: [-9, -75 - b], b: [9, -75 - b], r0: 6.4, r1: 6.4, m: suit });
  c.push({ a: [-9, -66 - b], b: [9, -66 - b], r0: 1.5, r1: 1.5, m: trim });
  for (const s of [-1, 1]) {
    const sh: V = [13.5 * s, -76 - b];
    const hand: V = o.arms === "up" ? [24 * s, -112] : o.arms === "hips" ? [11 * s, -52] : o.arms === "point" && s > 0 ? [38, -96] : o.arms === "medal" && s > 0 ? [2, -64] : [16.5 * s, -44];
    const [el, hd] = ik(sh, hand, 17.5, 16.5, o.arms === "hips" || o.arms === "medal" ? -s : o.arms === "up" ? s * 0.6 : s * 0.4);
    c.push({ a: sh, b: el, r0: 5.4, r1: 4.4, m: suit });
    c.push({ a: el, b: hd, r0: 4.4, r1: 3.3, m: suit });
    c.push({ a: hd, b: hd, r0: 3.5, r1: 3.5, m: "skin" });
  }
  c.push({ a: [0, -80 - b], b: [0, -88 - b], r0: 4.4, r1: 4.4, m: "skin", k: 0.8 });
  c.push({ a: [0, -94 - b], b: [0, -90 - b], r0: 8, r1: 6.6, m: o.back ? "hair" : "skin" });
  c.push({ a: [0, -97 - b], b: [0, -99 - b], r0: 8.6, r1: 7.4, m: hat, stripe: [-0.12, 0.2, trim] });
  if (!o.back) c.push({ a: [-6.5, -93.5 - b], b: [6.5, -93.5 - b], r0: 1.6, r1: 1.6, m: hat, k: 0.6 });
  if (o.medal) {
    c.push({ a: [-6, -80 - b], b: [0, -64 - b], r0: 1.3, r1: 1.3, m: "blue" });
    c.push({ a: [6, -80 - b], b: [0, -64 - b], r0: 1.3, r1: 1.3, m: "blue" });
    c.push({ a: [0, -61 - b], b: [0, -61 - b], r0: 5.4, r1: 5.4, m: "gold", k: 1.2 });
  }
  if (o.k) for (const x of c) x.k = (x.k ?? 1) * o.k;
  return c;
};

/** Patient on a bed: head left on the pillow, blanket over the chest, right thigh exposed (stitches drawn by the set). */
export const patient = (): Cap[] => [
  { a: [-48, -6], b: [-40, -6], r0: 8, r1: 8, m: "white" },
  { a: [-38, -12], b: [-37, -11], r0: 8, r1: 7.6, m: "skin" },
  { a: [-42, -14], b: [-40, -16], r0: 7.4, r1: 6, m: "hair" },
  { a: [-26, -9], b: [2, -9], r0: 9, r1: 9.5, m: "sheet" },
  { a: [-24, -15], b: [-6, -8], r0: 4.2, r1: 3.2, m: "sheet" },
  { a: [0, -8], b: [46, -5], r0: 9, r1: 6, m: "sheet", k: 0.75 },
  { a: [4, -14], b: [28, -25], r0: 8.6, r1: 7.2, m: "skin" },
  { a: [28, -25], b: [48, -9], r0: 6.8, r1: 4.6, m: "skin" },
  { a: [48, -9], b: [52, -12], r0: 4, r1: 3, m: "skin" },
];
