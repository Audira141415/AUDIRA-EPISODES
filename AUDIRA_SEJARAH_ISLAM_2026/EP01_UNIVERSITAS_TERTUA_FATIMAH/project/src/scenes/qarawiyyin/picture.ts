// EP01 mosaic "cartoons". One 6 x 9 panel of tesserae re-lays itself into a new picture for each
// part of the story (the kit's flip wave, Tesserae.tsx):
//   DOOR     Moorish horseshoe arch framing the iron library door (four gold lock plates) + "859"
//   MOSQUE   plan of the first mosque: prayer hall with aisles, courtyard with fountain, entrance
//   MAP      Kairouan (east) to Fez (west), a dotted gold route along the coast
//   HALAQAH  the mosque plan with a rosette in the courtyard where the study circle sits
//   LIBRARY  rows of manuscript spines around a band with "1349"
//   ROSETTE  a large eight-point star medallion with "1963"
// Each tessera samples the picture at its centre and turns along the nearest contour (andamento).
// Picture v axis = world -z (top of the image is far). No figures, no Qur'anic or Arabic text: only
// architecture, iron, geometry and western digits.
import * as THREE from "three";
import { MOSAIC_PALETTE as K } from "../../kits/mosaicforge/lib/palette.ts";
import { mulberry32 } from "../../kits/mosaicforge/core/motion.ts";

export const PANEL = { w: 6, h: 9, pitch: 0.085 };

export const P = {
  ...K,
  zelligeGreen: "#1E6A4C",
  zelligeGreenDeep: "#134A36",
  iron: "#5E554D",
  ironDark: "#4A423B",
  ironStrap: "#77706A",
  rivet: "#C9B99A",
  sand: "#C99A62",
  sandDark: "#A97B48",
};

/** Horseshoe arch: circle of radius R above narrower straight jambs. */
export const ARCH = { cx: 0, cy: 0.8, R: 1.98, jamb: 1.66, sill: -3.45, band: 0.4 };
/** Lock plates (picture coords), one row of four. The 3D keys hover above these. */
export const LOCKS: [number, number][] = [
  [-1.05, -0.75],
  [-0.35, -0.75],
  [0.35, -0.75],
  [1.05, -0.75],
];

/** Mosque plan (picture coords): outer wall rectangle, hall/courtyard split, fountain, entrance. */
export const PLAN = { x0: -2.3, x1: 2.3, v0: -3.7, v1: 3.5, split: 0.4, fountain: [0, -1.6] as [number, number], gate: 0.42 };
/** Halaqah centre (picture coords) = the courtyard fountain. */
export const RING = { u: 0, v: -1.6, r: 0.92 };
/** Map nodes (picture coords). */
export const MAP = { kairouan: [1.85, 0.75] as [number, number], fez: [-1.85, -0.55] as [number, number] };
/** Rosette centre for the 1963/outro picture. */
export const ROSE = { u: 0, v: -0.4 };

/** Signed distance to the arch opening (negative inside). */
export const archSdf = (u: number, v: number) => {
  const circle = Math.hypot(u - ARCH.cx, v - ARCH.cy) - ARCH.R;
  const dx = Math.abs(u) - ARCH.jamb;
  const rect = Math.max(dx, ARCH.sill - v, v - ARCH.cy);
  return Math.min(circle, rect);
};

const c = (hex: string, k = 1) => new THREE.Color(hex).multiplyScalar(k);

// ---------------------------------------------------------------- crisp digits from a real typeface
// The Stage A seven-segment "8" read like a "B". Digits are now rasterised from a heavy system
// typeface on a canvas and sampled per tessera, so the counters of 8 / 9 / 6 / 3 stay round.
type Mask = (u: number, v: number) => boolean;
const maskCache = new Map<string, Mask>();
export const textMask = (text: string, cu: number, cv: number, h: number): Mask => {
  const key = `${text}|${cu}|${cv}|${h}`;
  const hit = maskCache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return () => false;
  const H = 200;
  const cv2 = document.createElement("canvas");
  const g = cv2.getContext("2d")!;
  const font = `900 ${H}px "Arial Black", "Segoe UI Black", Arial, sans-serif`;
  g.font = font;
  const tw = Math.ceil(g.measureText(text).width) + 20;
  cv2.width = tw;
  cv2.height = Math.round(H * 0.86);
  g.font = font;
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  g.fillText(text, tw / 2, cv2.height - 8);
  const data = g.getImageData(0, 0, cv2.width, cv2.height).data;
  const w = (h * cv2.width) / cv2.height;
  const m: Mask = (u, v) => {
    const x = Math.floor(((u - cu) / w + 0.5) * cv2.width);
    const y = Math.floor((0.5 - (v - cv) / h) * cv2.height);
    if (x < 0 || y < 0 || x >= cv2.width || y >= cv2.height) return false;
    return data[(y * cv2.width + x) * 4] > 110;
  };
  maskCache.set(key, m);
  return m;
};
export const textWidth = (text: string, h: number) => {
  if (typeof document === "undefined") return h * text.length * 0.7;
  const g = document.createElement("canvas").getContext("2d")!;
  g.font = `900 200px "Arial Black", "Segoe UI Black", Arial, sans-serif`;
  return ((g.measureText(text).width + 20) / (200 * 0.86)) * h;
};

/** Eight-point zellige star (union of two squares) on a lattice. */
const zellige = (u: number, v: number, cell = 0.9) => {
  const x = ((u % cell) + cell * 1.5) % cell - cell / 2;
  const y = ((v % cell) + cell * 1.5) % cell - cell / 2;
  const r = cell * 0.3;
  const sq = Math.max(Math.abs(x), Math.abs(y)) - r;
  const dia = (Math.abs(x) + Math.abs(y)) / Math.SQRT2 - r;
  return { star: Math.min(sq, dia), centre: Math.hypot(x, y), ang: Math.atan2(y, x) };
};
/** Eight-point star SDF centred at the origin (radius r). */
const star8 = (x: number, y: number, r: number) => {
  const sq = Math.max(Math.abs(x), Math.abs(y)) - r;
  const dia = (Math.abs(x) + Math.abs(y)) / Math.SQRT2 - r;
  return Math.min(sq, dia);
};

export type Sample = { color: THREE.Color; gold: boolean; rot: number; part: string; s?: number };
type Pic = (u: number, v: number, rnd: () => number) => Sample;

/** Kit border shared by every picture: terracotta frame, cream stepped key, gold fillet. */
const border = (u: number, v: number, j: number): Sample | null => {
  const W = PANEL.w / 2;
  const H = PANEL.h / 2;
  const edge = Math.min(W - Math.abs(u), H - Math.abs(v));
  if (edge < 0.1) return { color: c(P.terracottaDark, j), gold: false, rot: 0, part: "border" };
  if (edge < 0.28) {
    const along = Math.abs(u) > W - 0.3 ? v : u;
    const key = Math.floor((along + 10) / 0.27) % 2 === 0;
    const inner = edge > 0.19;
    return { color: key !== inner ? c(P.cream, j) : c(P.terracotta, j), gold: false, rot: 0, part: "border" };
  }
  if (edge < 0.36) return { color: c(P.gold, j), gold: true, rot: 0, part: "border" };
  return null;
};

const zelligeField = (u: number, v: number, j: number): Sample => {
  const z = zellige(u, v);
  if (z.star < -0.05) {
    if (z.centre < 0.1) return { color: c(P.gold, j), gold: true, rot: z.ang, part: "star-centre" };
    return { color: c(P.zelligeGreen, j), gold: false, rot: z.ang + Math.PI / 4, part: "star" };
  }
  if (z.star < 0.03) return { color: c(P.zelligeGreenDeep, j), gold: false, rot: z.ang, part: "star-edge" };
  return { color: c(P.cream, j), gold: false, rot: 0, part: "field" };
};

/** A year band: gold smalti digits on lapis, umber rule above and below. */
const yearBand = (u: number, v: number, j: number, text: string, cv: number, h: number, halfW: number): Sample | null => {
  if (Math.abs(u) > halfW || Math.abs(v - cv) > h / 2 + 0.13) return null;
  if (Math.abs(v - cv) > h / 2 + 0.06) return { color: c(P.umber, j), gold: false, rot: 0, part: "year-rule" };
  if (textMask(text, 0, cv, h)(u, v)) return { color: c(P.goldPale, j), gold: true, rot: 0, part: "year" };
  return { color: c(P.lapisDeep, j), gold: false, rot: 0, part: "year-bg" };
};

// ---------------------------------------------------------------- DOOR (hook, cover, payoff)
const door: Pic = (u, v, rnd) => {
  const j = 0.9 + rnd() * 0.18;
  const b = border(u, v, j);
  if (b) return b;
  const a = archSdf(u, v);
  const eps = 0.02;
  const contour = Math.atan2(archSdf(u, v + eps) - archSdf(u, v - eps), archSdf(u + eps, v) - archSdf(u - eps, v));
  if (a < -0.06) {
    for (const [lu, lv] of LOCKS) if (Math.hypot(u - lu, (v - lv) * 0.82) < 0.3) return { color: c(P.umber, j), gold: false, rot: 0, part: "plate-bed" };
    for (const sv of [-2.75, -1.75, 0.35, 1.6]) {
      const d = Math.abs(v - sv);
      if (d < 0.15) {
        const rivet = Math.abs(((u + 10) % 0.42) - 0.21) < 0.05 && d < 0.06;
        return { color: rivet ? c(P.rivet, j) : c(P.ironStrap, j), gold: false, rot: 0, part: "strap" };
      }
    }
    if (Math.abs(u) < 0.045) return { color: c(P.umber, 0.8), gold: false, rot: Math.PI / 2, part: "seam" };
    const plank = Math.abs((((u + 10) % 0.58) + 0.58) % 0.58 - 0.29) > 0.25;
    return { color: c(plank ? P.ironDark : P.iron, j * (0.92 + rnd() * 0.12)), gold: false, rot: Math.PI / 2, part: "door" };
  }
  if (a < 0.04) return { color: c(P.umber, j), gold: false, rot: contour, part: "outline" };
  if (a < ARCH.band) {
    if (v > -0.15) {
      const ang = Math.atan2(v - ARCH.cy, u - ARCH.cx);
      const k = Math.floor((ang + Math.PI) / (Math.PI / 11)) % 2 === 0;
      return { color: c(k ? P.terracotta : P.cream, j), gold: false, rot: ang, part: "voussoir" };
    }
    return { color: c(P.cream, j * 0.95), gold: false, rot: Math.PI / 2, part: "jamb" };
  }
  if (a < ARCH.band + 0.09) return { color: c(P.gold, j), gold: true, rot: contour, part: "fillet" };
  if (a < ARCH.band + 0.16) return { color: c(P.umber, j), gold: false, rot: contour, part: "outline" };
  const yb = yearBand(u, v, j, "859", 3.74, 0.66, 1.25);
  if (yb) return yb;
  return zelligeField(u, v, j);
};

// ---------------------------------------------------------------- MOSQUE plan (context, main)
const mosquePlan = (u: number, v: number, j: number, rnd: () => number, courtyard?: (u: number, v: number) => Sample | null): Sample => {
  const inX = u > PLAN.x0 && u < PLAN.x1;
  const inV = v > PLAN.v0 && v < PLAN.v1;
  const wall = 0.13;
  // ground outside the walls: sun-baked earth in two tones
  if (!inX || !inV) {
    const band = Math.floor((u * 0.8 + v * 1.3 + 20) / 0.5) % 2 === 0;
    return { color: c(band ? P.sand : P.sandDark, j), gold: false, rot: 0.6, part: "ground" };
  }
  const dEdge = Math.min(u - PLAN.x0, PLAN.x1 - u, v - PLAN.v0, PLAN.v1 - v);
  const gate = v - PLAN.v0 < wall && Math.abs(u) < PLAN.gate;
  if (dEdge < wall && !gate) return { color: c(P.terracottaDark, j), gold: false, rot: 0, part: "wall" };
  // qibla wall niche (mihrab): a small gold arch on the far wall, abstract
  if (Math.abs(u) < 0.22 && v > PLAN.v1 - 0.42) return { color: c(P.gold, j), gold: true, rot: 0, part: "mihrab" };
  if (v > PLAN.split) {
    if (Math.abs(v - PLAN.split) < 0.07) return { color: c(P.terracotta, j), gold: false, rot: 0, part: "arcade" };
    // prayer hall: aisles of carpet parallel to the qibla wall, pillar bases on a grid
    const px = ((u - PLAN.x0) % 0.575) - 0.2875;
    const pv = ((v - PLAN.split) % 0.62) - 0.31;
    if (Math.hypot(px, pv) < 0.07) return { color: c(P.cream, j), gold: false, rot: 0, part: "pillar" };
    const aisle = Math.floor((v - PLAN.split) / 0.31) % 2 === 0;
    return { color: c(aisle ? P.lapis : P.lapisDeep, j * (0.95 + rnd() * 0.08)), gold: false, rot: 0, part: "hall" };
  }
  if (courtyard) {
    const s = courtyard(u, v);
    if (s) return s;
  }
  // courtyard: fountain star and a cream/terracotta paving grid
  const [fu, fv] = PLAN.fountain;
  const f = star8(u - fu, v - fv, 0.42);
  if (f < -0.16) return { color: c(P.lapisLight, j), gold: false, rot: Math.atan2(v - fv, u - fu), part: "water" };
  if (f < -0.06) return { color: c(P.lapis, j), gold: false, rot: Math.atan2(v - fv, u - fu), part: "water" };
  if (f < 0.04) return { color: c(P.gold, j), gold: true, rot: Math.atan2(v - fv, u - fu), part: "fountain" };
  const paving = (Math.floor((u + 10) / 0.34) + Math.floor((v + 10) / 0.34)) % 2 === 0;
  return { color: c(paving ? P.cream : P.bone, j * 0.96), gold: false, rot: 0, part: "court" };
};
const mosque: Pic = (u, v, rnd) => {
  const j = 0.9 + rnd() * 0.18;
  return border(u, v, j) ?? mosquePlan(u, v, j, rnd);
};

// ---------------------------------------------------------------- HALAQAH (explanation)
const halaqah: Pic = (u, v, rnd) => {
  const j = 0.9 + rnd() * 0.18;
  return (
    border(u, v, j) ??
    mosquePlan(u, v, j, rnd, (x, y) => {
      const dx = x - RING.u, dy = y - RING.v;
      const r = Math.hypot(dx, dy);
      if (r > 1.42) return null;
      const ang = Math.atan2(dy, dx);
      const s = star8(dx, dy, 0.3);
      if (s < 0) return { color: c(P.gold, j), gold: true, rot: ang, part: "rose-centre" };
      if (r < 0.62) return { color: c(Math.floor((ang + Math.PI) / (Math.PI / 8)) % 2 ? P.terracotta : P.cream, j), gold: false, rot: ang, part: "rose" };
      if (r < 0.7) return { color: c(P.umber, j), gold: false, rot: ang + Math.PI / 2, part: "rose-rule" };
      if (r < 1.2) return { color: c(P.zelligeGreen, j * (0.92 + rnd() * 0.1)), gold: false, rot: ang + Math.PI / 2, part: "ring" };
      if (r < 1.3) return { color: c(P.gold, j), gold: true, rot: ang + Math.PI / 2, part: "ring-fillet" };
      return { color: c(P.umber, j), gold: false, rot: ang + Math.PI / 2, part: "ring-rule" };
    })
  );
};

// ---------------------------------------------------------------- MAP (main, l05)
/** Quadratic route from Kairouan to Fez, bulging north toward the coast. */
export const routeAt = (s: number): [number, number] => {
  const [ax, ay] = MAP.kairouan, [bx, by] = MAP.fez;
  const cx = 0.1, cy = 2.25;
  const k = 1 - s;
  return [k * k * ax + 2 * k * s * cx + s * s * bx, k * k * ay + 2 * k * s * cy + s * s * by];
};
const ROUTE_PTS = Array.from({ length: 121 }, (_, i) => routeAt(i / 120));
const map: Pic = (u, v, rnd) => {
  const j = 0.9 + rnd() * 0.18;
  const b = border(u, v, j);
  if (b) return b;
  // the sea in the north with a wavy coast
  const coast = 2.75 + Math.sin(u * 1.7) * 0.22 + Math.sin(u * 4.1 + 1) * 0.08;
  if (v > coast + 0.08) {
    const wave = Math.abs(Math.sin((u + v * 0.3) * 6.5)) > 0.93;
    return { color: c(wave ? P.lapisLight : v > coast + 0.6 ? P.lapisDeep : P.lapis, j), gold: false, rot: 0, part: "sea" };
  }
  if (v > coast - 0.04) return { color: c(P.cream, j), gold: false, rot: 0, part: "shore" };
  // nodes: gold eight-point stars ringed in umber
  for (const [nu, nv] of [MAP.kairouan, MAP.fez]) {
    const s = star8(u - nu, v - nv, 0.3);
    if (s < -0.05) return { color: c(P.gold, j), gold: true, rot: Math.atan2(v - nv, u - nu), part: "node" };
    if (s < 0.05) return { color: c(P.umber, j), gold: false, rot: Math.atan2(v - nv, u - nu), part: "node-rule" };
  }
  // route: dotted gold path, s = 0 at Kairouan, 1 at Fez (revealed over time in Tesserae)
  let best = 9, bs = 0;
  for (let i = 0; i < ROUTE_PTS.length; i++) {
    const d = Math.hypot(u - ROUTE_PTS[i][0], v - ROUTE_PTS[i][1]);
    if (d < best) { best = d; bs = i / 120; }
  }
  if (best < 0.085 && Math.floor(bs * 30) % 3 !== 2) return { color: c(P.goldPale, j), gold: true, rot: 0, part: "route", s: bs };
  // Atlas ridges: terracotta chevrons in the south-west
  const ridge = v < -1.6 + u * 0.35 && v > -3.9;
  if (ridge && Math.abs(((u * 1.2 - v * 2.1 + 20) % 0.7) - 0.35) < 0.07) return { color: c(P.terracotta, j), gold: false, rot: 0.5, part: "ridge" };
  const band = Math.floor((u * 0.8 + v * 1.3 + 20) / 0.55) % 2 === 0;
  return { color: c(band ? P.sand : P.sandDark, j), gold: false, rot: 0.6, part: "land" };
};

// ---------------------------------------------------------------- LIBRARY (1349)
const library: Pic = (u, v, rnd) => {
  const j = 0.9 + rnd() * 0.18;
  const b = border(u, v, j);
  if (b) return b;
  const yb = yearBand(u, v, j, "1349", 0, 1.05, 2.45);
  if (yb) return yb;
  // shelves of manuscript spines: rows 0.9 high, umber shelf boards between them
  const row = ((v + 10) % 0.9);
  if (row < 0.1) return { color: c(P.umber, j), gold: false, rot: 0, part: "board" };
  const col = Math.floor((u + 10) / 0.17 + Math.floor((v + 10) / 0.9) * 0.37);
  const pal = [P.terracotta, P.ochre, P.terracottaDark, P.cream, P.zelligeGreen, P.lapis];
  const tone = pal[Math.abs(col * 7 + Math.floor((v + 10) / 0.9) * 3) % pal.length];
  const band = Math.abs(row - 0.5) < 0.05 && col % 3 === 0;
  return { color: c(band ? P.gold : tone, j), gold: band, rot: Math.PI / 2, part: "spine" };
};

// ---------------------------------------------------------------- ROSETTE (1963 + outro)
const rosette: Pic = (u, v, rnd) => {
  const j = 0.9 + rnd() * 0.18;
  const b = border(u, v, j);
  if (b) return b;
  const yb = yearBand(u, v, j, "1963", 3.2, 0.9, 2.2);
  if (yb) return yb;
  const dx = u - ROSE.u, dy = v - ROSE.v;
  const r = Math.hypot(dx, dy);
  const ang = Math.atan2(dy, dx);
  const s1 = star8(dx, dy, 1.75);
  const s2 = star8(dx, dy, 1.1);
  const s3 = star8(dx, dy, 0.42);
  if (s3 < 0) return { color: c(P.gold, j), gold: true, rot: ang, part: "rose-centre" };
  if (s2 < -0.06) return { color: c(Math.floor((ang + Math.PI) / (Math.PI / 8)) % 2 ? P.lapis : P.lapisDeep, j), gold: false, rot: ang, part: "rose" };
  if (s2 < 0.04) return { color: c(P.gold, j), gold: true, rot: ang + Math.PI / 2, part: "rose-fillet" };
  if (s1 < -0.08) return { color: c(Math.floor((ang + Math.PI) / (Math.PI / 16)) % 2 ? P.zelligeGreen : P.cream, j), gold: false, rot: ang, part: "petal" };
  if (s1 < 0.04) return { color: c(P.umber, j), gold: false, rot: ang + Math.PI / 2, part: "rose-rule" };
  if (r > 0) return zelligeField(u, v, j);
  return zelligeField(u, v, j);
};

export const PICTURES = { door, mosque, map, halaqah, library, rosette } as const;
export type PicName = keyof typeof PICTURES;
export const PIC_NAMES = Object.keys(PICTURES) as PicName[];

export type TileLook = { color: THREE.Color; gold: boolean; rot: number; part: string; s: number };
export type Tile = {
  x: number;
  z: number;
  looks: Record<PicName, TileLook>;
  tilt: [number, number];
  size: number;
  seed: number;
};

/** Lay every tessera on a jittered grid and sample every picture at its centre; picture v = world -z. */
export const layTiles = (): Tile[] => {
  const rnd = mulberry32(85901);
  const tiles: Tile[] = [];
  const cols = Math.round(PANEL.w / PANEL.pitch);
  const rows = Math.round(PANEL.h / PANEL.pitch);
  for (let r = 0; r < rows; r++) {
    for (let i = 0; i < cols; i++) {
      const x = -PANEL.w / 2 + (i + 0.5) * PANEL.pitch + (rnd() - 0.5) * 0.01;
      const z = -PANEL.h / 2 + (r + 0.5) * PANEL.pitch + (rnd() - 0.5) * 0.01;
      const looks = {} as Record<PicName, TileLook>;
      const jitterRot = (rnd() - 0.5) * 0.1;
      for (const name of PIC_NAMES) {
        const sr = mulberry32(Math.floor((x + 10) * 1000) * 7919 + Math.floor((z + 10) * 1000));
        const s = PICTURES[name](x, -z, sr);
        looks[name] = { color: s.color, gold: s.gold, rot: -s.rot + jitterRot, part: s.part, s: s.s ?? 0 };
      }
      tiles.push({ x, z, looks, tilt: [(rnd() - 0.5) * 0.08, (rnd() - 0.5) * 0.08], size: 0.9 + rnd() * 0.07, seed: rnd() });
    }
  }
  return tiles;
};

export const TILE_COUNT = Math.round(PANEL.w / PANEL.pitch) * Math.round(PANEL.h / PANEL.pitch);
/** Door-leaf parts of the DOOR picture (they slide apart in the payoff). */
export const DOOR_PARTS = new Set(["door", "strap", "seam", "plate-bed"]);
