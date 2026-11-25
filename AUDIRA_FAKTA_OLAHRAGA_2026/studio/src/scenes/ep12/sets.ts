// EP12 sets. Painted with the kit's albedo painter, relit with per-scene colour ramps (the kit's ramps are all warm; ice
// and each arena need their own hue), plus a per-row perspective ice floor (16-bit style). Art px; frame = 135 × 240.
import { hexToRgb, type RGB } from "../../kits/pixelstory/core/palette.ts";
import { bayer, hash, hash2, rng } from "../../kits/pixelstory/core/noise.ts";
import { createAlbedo, MATERIALS, painter, type Albedo } from "../../kits/pixelstory/environment/albedo.ts";
import type { Light } from "../../kits/pixelstory/lighting/relight.ts";
import { RAMPS, type RampName } from "../../kits/pixelstory/core/palette.ts";

export type Ramp = RGB[];
/** 8 steps through the given colours. */
export const ramp = (...hex: string[]): Ramp => {
  const c = hex.map(hexToRgb);
  return Array.from({ length: 8 }, (_, i) => {
    const x = (i / 7) * (c.length - 1), k = Math.min(c.length - 2, Math.floor(x)), f = x - k;
    return [0, 1, 2].map((j) => c[k][j] + (c[k + 1][j] - c[k][j]) * f) as RGB;
  });
};
export type Ramps = Partial<Record<RampName, Ramp>>;

export const relit = (a: Albedo, lights: Light[], ambient: number, over: Ramps, dither = 0.3): Uint8ClampedArray => {
  const out = new Uint8ClampedArray(a.w * a.h * 4);
  const R: Ramp[] = [[], ...MATERIALS.map((m) => over[m] ?? (RAMPS[m] as readonly string[]).map(hexToRgb))];
  const band = dither * 0.5;
  for (let y = 0; y < a.h; y++)
    for (let x = 0; x < a.w; x++) {
      const i = y * a.w + x;
      if (!a.mat[i]) continue;
      const sx = x + a.ox + 0.5, sy = y + a.oy + 0.5;
      let L = ambient;
      for (const l of lights) {
        const dx = l.x - sx, dy = l.y - sy, d2 = dx * dx + dy * dy;
        let c = l.i / (1 + (d2 / (l.r * l.r)) * 3);
        if (l.kind === "cone") {
          let diff = Math.atan2(-dy, -dx) - l.angle;
          diff = Math.abs(Math.atan2(Math.sin(diff), Math.cos(diff)));
          const e = l.spread * 1.7;
          c *= diff <= l.spread ? 1 : diff >= e ? 0.08 : 0.08 + 0.92 * (1 - (diff - l.spread) / (e - l.spread)) ** 2;
        }
        L += c;
      }
      const rp = R[a.mat[i]], f = Math.max(0, Math.min(7, (a.val[i] * L + a.emit[i]) * 7));
      let k = Math.floor(f);
      const fr = f - k;
      if (fr >= 0.5 + band || (fr > 0.5 - band && (fr - 0.5 + band) / (2 * band) > bayer(x + a.ox, y + a.oy))) k++;
      const c = rp[Math.min(7, k)], o = i * 4;
      out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; out[o + 3] = 255;
    }
  return out;
};

// ---------------------------------------------------------------- ice floor (perspective rows)
export type FloorOpts = {
  x0: number; w: number; y0: number; y1: number;
  /** Vanishing row (above y0). */
  hor: number;
  ice: Ramp;
  line?: RGB;
  /** Depth (0..1 from far to near) of painted lines and their curvature (art px of bend). */
  lines?: { v: number; w: number; c: RGB; bend?: number }[];
  pools?: { x: number; y: number; r: number; i: number }[];
  /** Colour of the boards reflected at the far edge. */
  board?: RGB;
  base?: number;
  traces?: number;
};
const vn = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const s = (a: number) => a * a * (3 - 2 * a);
  const h = (i: number, j: number) => hash2(i, j);
  const a = h(xi, yi) + (h(xi + 1, yi) - h(xi, yi)) * s(fx), b = h(xi, yi + 1) + (h(xi + 1, yi + 1) - h(xi, yi + 1)) * s(fx);
  return a + (b - a) * s(fy);
};
/** One ice frame. `scroll` in art px at the subject row (feet ~ 152): near rows move faster, far rows slower. */
export const iceFloor = (o: FloorOpts, scroll: number, feet = 152): Uint8ClampedArray => {
  const h = o.y1 - o.y0, out = new Uint8ClampedArray(o.w * h * 4);
  for (let yy = 0; yy < h; yy++) {
    const y = o.y0 + yy, d = (y + 0.5 - o.hor) / (feet - o.hor);
    const z = 1 / Math.max(0.08, d);
    const far = yy / Math.max(1, h);
    for (let x = 0; x < o.w; x++) {
      const sx = x + o.x0, u = (sx - 67) * z + scroll, v = z * 60;
      let L = (o.base ?? 0.52) + (vn(u * 0.03, v * 0.12) - 0.5) * 0.16;
      // blade scratches: long thin marks, fewer far away
      const su = u + v * 0.55, cell = Math.floor(su / 34);
      const row = Math.floor(v * 1.7 + hash(cell) * 4);
      if (d > 0.42) {
        const hh = hash2(cell, row);
        const along = su / 34 - cell;
        if (hh > 0.72 && along > hash2(row, cell) * 0.5 && along < 0.5 + hh * 0.5 && Math.abs(v * 1.7 + hash(cell) * 4 - row - 0.5) < 0.14 * z) L += 0.17;
      }
      if (o.traces) {
        const tv = v * 0.5 + Math.sin(u * 0.02) * 1.2, ti = Math.floor(tv * 1.4);
        if (hash(ti * 7 + 3) < o.traces && Math.abs(tv * 1.4 - ti - 0.5) < 0.1 * z) L += 0.24;
      }
      for (const p of o.pools ?? []) {
        const dx = (sx - p.x) / p.r, dy = (y - p.y) / (p.r * 0.42);
        L += p.i / (1 + (dx * dx + dy * dy) * 2.2);
      }
      const k0 = Math.max(0, Math.min(7, L * 7));
      let k = Math.floor(k0);
      if (k0 - k > 0.35 + 0.3 * bayer(sx, y)) k = Math.min(7, k + 1);
      let c: RGB = o.ice[k];
      if (o.board && yy < 16) {
        const f = (1 - yy / 16) * 0.55 * (hash2(Math.floor(u / 5), 1) > 0.3 ? 1 : 0.6);
        c = [c[0] + (o.board[0] - c[0]) * f, c[1] + (o.board[1] - c[1]) * f, c[2] + (o.board[2] - c[2]) * f];
      }
      for (const l of o.lines ?? []) {
        const vy = l.v + ((sx - 67) / 67) ** 2 * (l.bend ?? 0);
        if (Math.abs(far - vy) < l.w * (0.5 + far)) c = [c[0] * 0.35 + l.c[0] * 0.65, c[1] * 0.35 + l.c[1] * 0.65, c[2] * 0.35 + l.c[2] * 0.65];
      }
      const i = (yy * o.w + x) * 4;
      out[i] = c[0]; out[i + 1] = c[1]; out[i + 2] = c[2]; out[i + 3] = 255;
    }
  }
  return out;
};

// ---------------------------------------------------------------- arena pieces (180 px wide, tileable)
export const TILE = 180;
type P = ReturnType<typeof painter>;
const person = (p: P, x: number, y: number, r: () => number, up: boolean, val: number) => {
  const m = (["book1", "plaster", "teal", "stone"] as RampName[])[Math.floor(r() * 4)];
  p.rect(x - 2, y + 2, 6, 6, m, { val: val * (0.75 + r() * 0.4) });
  p.rect(x - 1, y - 2, 4, 4, "leaf", { val: val * (0.8 + r() * 0.3) });
  if (up) { p.rect(x - 3, y - 4, 1, 6, m, { val }); p.rect(x + 4, y - 5, 1, 7, m, { val }); }
};
/** Stands + roof truss with lamps. `crowd` 0 = empty seats. */
export const standsTile = (o: { seed: number; crowd: number; top: number; bot: number; lamps?: number[]; cheer?: number; windows?: boolean }) => {
  const a = createAlbedo(TILE, o.bot + 70, 0, -70);
  const p = painter(a), r = rng(o.seed);
  for (let y = -70; y < o.bot; y++) p.hline(0, y, TILE, "sky", { val: 0.3 + ((y + 70) / (o.bot + 70)) * 0.42 });
  // truss
  for (const ty of [-34, 6]) {
    p.rect(0, ty, TILE, 2, "metal", { val: 0.5 });
    p.rect(0, ty + 9, TILE, 2, "metal", { val: 0.36 });
    for (let x = 0; x < TILE; x += 12) { p.line(x, ty + 2, x + 6, ty + 9, "metal", { val: 0.4 }); p.line(x + 6, ty + 9, x + 12, ty + 2, "metal", { val: 0.4 }); }
  }
  for (const lx of o.lamps ?? [30, 90, 150]) {
    p.rect(lx - 9, 17, 18, 5, "metal", { val: 0.3 });
    p.rect(lx - 8, 20, 16, 4, "ivoryLit", { val: 1, emit: 0.9 });
  }
  if (o.windows) for (let x = 6; x < TILE; x += 30) { p.rect(x, 28, 24, 26, "amberLamp", { val: 0.7, emit: 0.5 }); p.rect(x + 11, 28, 2, 26, "metal", { val: 0.2 }); p.rect(x, 40, 24, 1, "metal", { val: 0.2 }); }
  // tiers
  let row = 0;
  for (let y = o.top; y < o.bot; y += 10, row++) {
    const lit = 0.34 + 0.5 * ((y - o.top) / Math.max(1, o.bot - o.top));
    p.rect(0, y, TILE, 10, "stone", { val: lit * 0.52 });
    p.hline(0, y, TILE, "metal", { val: lit * 0.8 });
    for (let x = 4 + (row % 2) * 4; x < TILE - 2; x += 9) {
      if (r() < o.crowd) person(p, x + Math.floor(r() * 2), y + 2, r, r() < (o.cheer ?? 0.12), lit);
      else p.rect(x - 2, y + 4, 6, 5, "plaster", { val: lit * 0.45 });
    }
  }
  return a;
};
/** Padded boards: thick pads with seams, rail, shading. */
export const boardsTile = (top: number, bot: number, seg = 30) => {
  const a = createAlbedo(TILE, bot - top + 4, 0, top - 4);
  const p = painter(a);
  p.rect(0, top - 4, TILE, 4, "metal", { val: 0.9 });
  p.hline(0, top - 4, TILE, "ivoryLit", { val: 1, emit: 0.2 });
  for (let x = 0; x < TILE; x++) {
    const s = x % seg, m: RampName = Math.floor(x / seg) % 2 ? "paper" : "frame";
    const bulge = Math.sin((s / seg) * Math.PI);
    for (let y = top; y < bot; y++) {
      const f = (y - top) / (bot - top);
      p.put(x, y, m, { val: (s < 1 ? 0.22 : 0.36 + 0.42 * bulge) * (1 - f * 0.35) + (f < 0.12 ? 0.18 : 0) });
    }
  }
  p.rect(0, bot - 3, TILE, 3, "ivoryLit", { val: 0.55 });
  return a;
};

// ---------------------------------------------------------------- non-arena sets
export const hospital = () => {
  const back = createAlbedo(240, 330, -52, -50), p = painter(back);
  p.rect(-52, -50, 240, 200, "sky", { val: 0.66 });
  p.rect(-52, 92, 240, 58, "teal", { val: 0.6 });
  p.rect(-52, 90, 240, 2, "ivoryLit", { val: 0.8 });
  for (let x = -52; x < 188; x += 22) p.vline(x, 92, 58, "teal", { val: 0.45 });
  // window with blinds
  p.rect(76, 16, 52, 60, "metal", { val: 0.5 });
  p.rect(79, 19, 46, 54, "ivoryLit", { val: 0.9, emit: 0.35 });
  for (let y = 22; y < 73; y += 5) p.rect(79, y, 46, 2, "sky", { val: 0.75 });
  // cabinet
  p.rect(-40, 40, 34, 52, "ivoryLit", { val: 0.6 });
  p.rect(-38, 44, 14, 44, "ivoryLit", { val: 0.72 });
  p.rect(-22, 44, 14, 44, "ivoryLit", { val: 0.72 });
  p.rect(-18, 60, 6, 2, "book1", { val: 1 }); p.rect(-16, 58, 2, 6, "book1", { val: 1 });
  p.rect(-52, 150, 240, 130, "stone", { val: 0.5 });
  for (let y = 152; y < 280; y += 1) for (let x = -52; x < 188; x++) if ((Math.floor(x / 14 + (y - 150) * 0.02) + Math.floor((y - 150) / 12)) % 2) p.put(x, y, "stone", { val: 0.6 });
  // bed
  const bed = createAlbedo(170, 100, -18, 80), b = painter(bed);
  b.rect(-12, 86, 5, 66, "metal", { val: 0.8 }); b.rect(140, 106, 5, 46, "metal", { val: 0.7 });
  b.rect(-12, 86, 5, 2, "ivoryLit", { val: 1 });
  b.rect(-8, 130, 150, 12, "ivoryLit", { val: 0.85 });
  b.rect(-8, 141, 150, 4, "metal", { val: 0.6 });
  b.rect(-8, 145, 150, 7, "metal", { val: 0.28 });
  b.rect(-6, 116, 26, 15, "ivoryLit", { val: 1 });
  b.rect(-6, 128, 26, 3, "ivoryLit", { val: 0.7 });
  for (const lx of [0, 128]) { b.rect(lx, 152, 4, 6, "metal", { val: 0.4 }); b.disc(lx + 2, 159, 3, "metal", { val: 0.25 }); }
  return { back, bed };
};

/** X-ray on a lightbox: skull base + cervical spine, side view. Vertebrae come back as boxes so two can glow red. */
export const VERT: { x: number; y: number; w: number; h: number; r: number }[] = Array.from({ length: 7 }, (_, i) => {
  const k = i / 6;
  return { x: 62 + Math.sin(k * 2.4) * 7 - k * 6, y: 88 + i * 10.4, w: 15 + i * 0.7, h: 7.4, r: -6 + k * 16 };
});
export const xray = () => {
  const wall = createAlbedo(220, 320, -42, -40), p = painter(wall);
  p.rect(-42, -40, 220, 320, "sky", { val: 0.5 });
  for (let x = -42; x < 178; x += 18) p.vline(x, -40, 320, "sky", { val: 0.38 });
  p.rect(4, 46, 122, 124, "metal", { val: 0.9 });
  p.rect(8, 50, 114, 116, "teal", { val: 0.6 });
  // film glow edge
  const film = createAlbedo(110, 112, 10, 52), f = painter(film);
  for (let y = 52; y < 164; y++) for (let x = 10; x < 120; x++) {
    const d = Math.hypot((x - 62) / 62, (y - 108) / 62);
    f.put(x, y, "teal", { val: 0.46 - d * 0.22 });
  }
  // soft tissue of neck and skull
  for (let y = 52; y < 164; y++) for (let x = 10; x < 120; x++) {
    const sk = Math.hypot((x - 62) / 34, (y - 58) / 30);
    if (sk < 1) f.put(x, y, "teal", { val: 0.62 + (sk > 0.86 ? 0.26 : 0) - 0.12 * (1 - sk) + (hash2(x, y) - 0.5) * 0.03 });
    else if (y > 70) {
      const c = 66 - (y - 70) * 0.03, half = 25 + Math.max(0, (y - 128) * 0.9);
      if (Math.abs(x - c) < half) f.put(x, y, "teal", { val: 0.5 + (hash2(x, y) - 0.5) * 0.03 });
    }
  }
  // jaw
  for (let i = 0; i < 40; i++) { const k = i / 40; f.disc(92 - k * 24, 76 + Math.sin(k * 3) * 10, 4, "teal", { val: 0.8 }); }
  VERT.forEach((v) => {
    const c = Math.cos((v.r * Math.PI) / 180), s = Math.sin((v.r * Math.PI) / 180);
    const q = (dx: number, dy: number): [number, number] => [v.x + dx * c - dy * s, v.y + dx * s + dy * c];
    f.poly([q(-v.w / 2, -v.h / 2), q(v.w / 2, -v.h / 2 + 1), q(v.w / 2, v.h / 2), q(-v.w / 2, v.h / 2 - 1)], "ivoryLit", { val: 0.95 });
    f.poly([q(-v.w / 2 + 2, -1.5), q(v.w / 2 - 2, -1.5), q(v.w / 2 - 2, 1.5), q(-v.w / 2 + 2, 1.5)], "ivoryLit", { val: 0.72 });
    // spinous process at the back
    f.poly([q(-v.w / 2 - 2, -2.5), q(-v.w / 2 - 14, 2), q(-v.w / 2 - 15, 5), q(-v.w / 2 - 2, 2.5)], "ivoryLit", { val: 0.7 });
  });
  return { wall, film };
};

export const mountains = () => {
  const sky = createAlbedo(260, 330, -62, -90), p = painter(sky);
  for (let y = -90; y < 140; y++) p.hline(-62, y, 260, "dusk", { val: 0.2 + Math.max(0, (y + 90) / 230) * 0.85 });
  p.disc(96, 78, 15, "amberLamp", { val: 1, emit: 0.4 });
  for (const [y, x, w] of [[18, -30, 70], [34, 60, 90], [50, -50, 60], [8, 100, 60]] as const) { p.rect(x, y, w, 2, "dusk", { val: 1 }); p.rect(x + 8, y + 2, w - 22, 2, "dusk", { val: 0.9 }); }
  const ridge = createAlbedo(300, 130, -82, 40), m = painter(ridge);
  const peak = (x: number, s: number, amp: number, base: number, seed: number) => base - amp * (0.5 + 0.5 * Math.sin(x * s + seed)) - vn(x * 0.12 + seed, 3) * amp * 0.8;
  for (let x = -82; x < 218; x++) {
    const a = peak(x, 0.045, 24, 112, 1.4);
    for (let y = Math.round(a); y < 150; y++) {
      const snow = y < a + 12 + (hash2(x, 5) - 0.5) * 9;
      const lit = vn(x * 0.25, y * 0.09) > 0.48;
      m.put(x, y, snow ? "ivoryLit" : "mesa", { val: snow ? (lit ? 0.95 : 0.55) : lit ? 0.6 : 0.4 });
    }
    const b = peak(x, 0.08, 10, 130, 4.2);
    for (let y = Math.round(b); y < 160; y++) m.put(x, y, "mesa", { val: 0.22 });
  }
  // arena: low dome with lit windows
  const ar = createAlbedo(150, 60, -8, 104), q = painter(ar);
  for (let x = 0; x < 135; x++) {
    const t = 112 + ((x - 67) / 67) ** 2 * 18;
    for (let y = Math.round(t); y < 152; y++) q.put(x, y, "woodDark", { val: y < t + 2 ? 0.95 : 0.36 });
  }
  for (let x = 6; x < 132; x += 9) { q.rect(x, 137, 6, 9, "amberLamp", { val: 1, emit: 0.5 }); }
  q.rect(-8, 151, 150, 10, "ivoryLit", { val: 0.6 });
  // snow ground
  const gr = createAlbedo(260, 120, -62, 148), g = painter(gr);
  for (let y = 148; y < 268; y++) for (let x = -62; x < 198; x++) g.put(x, y, "ivoryLit", { val: 0.5 + vn(x * 0.05, y * 0.16) * 0.3 + (y < 151 ? 0.2 : 0) });
  for (let k = 0; k < 9; k++) { const y = 160 + k * 9, x = 67 + Math.sin(k * 1.2) * 4; g.rect(x - 5, y, 4, 3, "ivoryLit", { val: 0.28 }); g.rect(x + 3, y + 4, 4, 3, "ivoryLit", { val: 0.28 }); }
  return { sky, ridge, arena: ar, ground: gr };
};

export const locker = () => {
  const back = createAlbedo(240, 330, -52, -50), p = painter(back);
  p.rect(-52, -50, 240, 210, "woodDark", { val: 0.5 });
  for (let x = -50; x < 188; x += 24) {
    p.rect(x, -20, 22, 170, "wood", { val: 0.46 });
    p.rect(x + 1, -18, 20, 2, "wood", { val: 0.8 });
    for (let k = 0; k < 4; k++) p.rect(x + 6, -8 + k * 4, 10, 1, "woodDark", { val: 0.3 });
    p.rect(x + 17, 60, 2, 8, "metal", { val: 0.9 });
  }
  p.rect(-52, 150, 240, 130, "woodDark", { val: 0.46 });
  for (let y = 150; y < 280; y += 10) p.hline(-52, y, 240, "woodDark", { val: 0.26 });
  for (const lx of [14, 67, 120]) { p.rect(lx - 10, 4, 20, 4, "amberLamp", { val: 1, emit: 0.7 }); }
  return { back };
};

export const hall = () => {
  const back = createAlbedo(240, 360, -52, -120), p = painter(back);
  for (let y = -120; y < 150; y++) p.hline(-52, y, 240, "sky", { val: 0.28 + ((y + 120) / 270) * 0.36 });
  for (let x = -46; x < 188; x += 26) { p.rect(x, -120, 12, 266, "book1", { val: 0.42 }); p.vline(x + 2, -120, 266, "book1", { val: 0.6 }); p.vline(x + 9, -120, 266, "book1", { val: 0.28 }); }
  const r = rng(77);
  for (let y = 118; y < 148; y += 8) for (let x = -50; x < 188; x += 8) person(p, x + Math.floor(r() * 3), y, r, r() < 0.3, 0.5 + r() * 0.2);
  p.rect(-52, 146, 240, 4, "metal", { val: 0.7 });
  p.rect(-52, 150, 240, 140, "stone", { val: 0.36 });
  const pod = createAlbedo(170, 90, -18, 138), q = painter(pod);
  const tier = (x: number, y: number, w: number) => {
    for (let xx = 0; xx < w; xx++) for (let yy = y; yy < 222; yy++) q.put(x + xx, yy, "frame", { val: 0.78 - (xx / w) * 0.28 - (yy - y) * 0.004 });
    q.rect(x - 1, y - 2, w + 2, 4, "ivoryLit", { val: 1, emit: 0.1 });
  };
  tier(-8, 178, 46); tier(98, 186, 46); tier(36, 160, 64);
  return { back, pod };
};

export const corridor = () => {
  const a = createAlbedo(240, 340, -52, -50), p = painter(a);
  for (let y = -50; y < 290; y++) for (let x = -52; x < 188; x++) {
    const dx = (x - 67) / 46, dy = y < 92 ? (92 - y) / 78 : (y - 92) / 60;
    const inBack = x > 4 && x < 130 && y > 24 && y < 150;
    if (inBack) p.put(x, y, "sky", { val: 0.42 + (y - 24) * 0.001 });
    else if (y >= 150) p.put(x, y, "stone", { val: 0.5 + (Math.floor((x - 67) / (6 + (y - 150) * 0.22)) % 2 ? 0.05 : 0) });
    else if (y <= 24) p.put(x, y, "sky", { val: 0.24 });
    else p.put(x, y, "sky", { val: 0.3 + 0.06 * Math.min(1, Math.abs(dx) * dy * 0.1) });
  }
  p.rect(4, 22, 127, 2, "metal", { val: 0.5 });
  p.rect(-52, 146, 240, 4, "metal", { val: 0.42 });
  for (const cx of [32, 102]) {
    p.rect(cx - 24, 48, 48, 102, "metal", { val: 0.62 });
    p.rect(cx - 21, 51, 42, 99, "metal", { val: 0.2 });
  }
  return a;
};
