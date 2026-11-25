// EP11 "Kearifan Segenggam Garam" — shared world constants, palette and pure helpers (TERRARIUM style).
import * as THREE from "three";

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (k: number) => {
  const x = clamp(k);
  return x * x * (3 - 2 * x);
};

/** Seeded PRNG (mulberry32). */
export const prng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

export const PAL = {
  sky: "#C9CFB4",
  skyWarm: "#E8D6B0",
  mossA: "#5E8F3A",
  mossB: "#7DAA45",
  mossC: "#3F6E2C",
  mossD: "#93B957",
  fern: "#4E8A3A",
  fernTip: "#8CC25A",
  soil: "#3B2A1E",
  soilTop: "#4A3424",
  charcoal: "#1B1A1A",
  lake: "#3E9C96",
  lakeDeep: "#1F5E62",
  trunk: "#5A3E2A",
  pine: "#2F5E34",
  wood: "#6B4A33",
  brass: "#B8924A",
  salt: "#F7F5EE",
  cloudy: "#E4E8E0",
  stone: "#9C968A",
  glow: "#FFF6DA",
  // characters
  oldSkin: "#c89466",
  oldHair: "#e4ddd0",
  oldTop: "#efe7d4",
  oldBottom: "#7a6650",
  youngSkin: "#b47a52",
  youngHair: "#1b1411",
  youngTop: "#46637c",
  youngBottom: "#2b2f36",
} as const;

/** The big lake vessel (a wide glass cloche on a walnut plinth) and the small drinking glass. */
export const LAKE = { cx: 1.15, cz: -2.3, R: 3.15, plinthH: 0.26, soilH: 0.42, lakeR: 1.85, lakeX: 0.25, lakeZ: 0.35 } as const;
export const CUP = { x: -3.0, z: 1.15, r: 0.34, h: 0.95 } as const;

/** Soil surface height inside the lake vessel, local coords (0,0 = vessel centre). */
export const shoreY = (x: number, z: number) => {
  const base = LAKE.plinthH + LAKE.soilH;
  const d = Math.hypot(x, z);
  const rim = 1 - Math.pow(clamp(d / (LAKE.R * 0.97)), 6);
  const back = 0.55 * Math.exp(-((x + 0.4) ** 2 + (z + 1.9) ** 2) / 1.6) * rim;
  const left = 0.32 * Math.exp(-((x + 2.0) ** 2 + (z + 0.2) ** 2) / 0.9) * rim;
  const ripple = 0.03 * Math.sin(x * 2.3 + 0.4) * Math.sin(z * 2.1 + 1.1);
  const ld = Math.hypot((x - LAKE.lakeX) / 1.12, z - LAKE.lakeZ);
  const bowl = 0.22 * (1 - smooth((ld - LAKE.lakeR * 0.7) / (LAKE.lakeR * 0.45)));
  return base + back + left + ripple * rim - bowl;
};
export const WATER_Y = LAKE.plinthH + LAKE.soilH - 0.015;
export const inLake = (x: number, z: number, pad = 0) => Math.hypot((x - LAKE.lakeX) / 1.12, z - LAKE.lakeZ) < LAKE.lakeR + pad;

export const softDiscTexture = (inner = 0.0, alpha = 1) => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 62);
  grd.addColorStop(0, `rgba(255,255,255,${alpha})`);
  grd.addColorStop(Math.max(0.01, inner), `rgba(255,255,255,${alpha * 0.6})`);
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
};

/** Engraved brass plaque text (the in-world AUDIRA mark). */
export const plaqueTexture = () => {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 1024, 256);
  grd.addColorStop(0, "#8E6A2E");
  grd.addColorStop(0.45, "#D9B871");
  grd.addColorStop(1, "#9A7434");
  g.fillStyle = grd;
  g.fillRect(0, 0, 1024, 256);
  g.strokeStyle = "rgba(60,40,12,0.8)";
  g.lineWidth = 8;
  g.strokeRect(14, 14, 996, 228);
  g.fillStyle = "rgba(48,30,8,0.92)";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "600 92px Georgia, serif";
  g.fillText("A U D I R A", 512, 104);
  g.font = "italic 44px Georgia, serif";
  g.fillText("Telaga di Dalam Kaca", 512, 186);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

// ------------------------------------------------------------------------------------------------
// Stage B: the hut jar, the forest path in the lake vessel, the day cycle, and timeline helpers.

/** Tall glass jar holding the old man's hut (to the left of the drinking glass on the table). */
export const HUT = { cx: -7.4, cz: -1.0, r: 1.6, wallH: 2.7, floor: 0.62 } as const;
/** Ground height inside the hut jar, local coords. A low hill rises behind the hut. */
export const hutGround = (x: number, z: number) => {
  const d = Math.hypot(x, z);
  const rim = 1 - Math.pow(clamp(d / (HUT.r * 0.96)), 6);
  const hill = 0.3 * Math.exp(-((x + 0.3) ** 2 + (z + 1.0) ** 2) / 0.5) * rim;
  const ripple = 0.015 * Math.sin(x * 4.1 + 0.7) * Math.sin(z * 3.3);
  return HUT.floor + hill + ripple * rim;
};
/** Hut layout (jar-local): the hut sits back-left, a porch with two benches and a low table in front. */
export const HUTSET = {
  hut: [-0.25, -0.55] as [number, number],
  table: [0.12, 0.28] as [number, number],
  oldSeat: [-0.2, 0.28] as [number, number],
  youngSeat: [0.44, 0.28] as [number, number],
  seatH: 0.13,
  tableH: 0.1,
  door: [-0.25, -0.12] as [number, number],
};
/** Path into the hut jar from the front glass (where the young man enters). */
export const HUT_PATH: [number, number][] = [[1.05, 1.05], [0.85, 0.75], [0.62, 0.5], [0.5, 0.36]];

/** Forest path inside the lake vessel (vessel-local), from the back-right woods down to the shore. */
export const LAKE_PATH: [number, number][] = [[-0.5, -2.55], [-1.55, -2.0], [-2.35, -1.05], [-2.55, 0.25], [-2.2, 1.45], [-1.55, 2.2]];

export const polyAt = (pts: [number, number][], k: number): [number, number] => {
  const seg = pts.length - 1;
  const u = clamp(k) * seg;
  const i = Math.min(seg - 1, Math.floor(u));
  const f = u - i;
  return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)];
};
export const polyDist = (pts: [number, number][], x: number, z: number) => {
  let best = 1e9;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i];
    const [bx, bz] = pts[i + 1];
    const dx = bx - ax, dz = bz - az;
    const k = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz));
    best = Math.min(best, Math.hypot(x - (ax + dx * k), z - (az + dz * k)));
  }
  return best;
};
/** A point on the lake rim: angle around the lake centre and distance in the ellipse metric. */
export const lakeEdge = (a: number, ld: number): [number, number] => [LAKE.lakeX + Math.cos(a) * ld * 1.12, LAKE.lakeZ + Math.sin(a) * ld];
/** Where the figures stand, kneel and sit on the shore (vessel-local). */
export const SHORE = {
  old: lakeEdge(1.95, 2.2),
  young: lakeEdge(2.2, 2.3),
  kneel: lakeEdge(2.2, 2.08),
  sitOld: lakeEdge(1.88, 2.24),
  sitYoung: lakeEdge(2.12, 2.24),
  saltTarget: lakeEdge(1.95, 1.25),
  stir: lakeEdge(1.95, 1.8),
};
/** Clear spots (no moss, trees) around the figures and the path. */
export const CLEAR: [number, number, number][] = [
  [...SHORE.old, 0.2], [...SHORE.young, 0.2], [...SHORE.kneel, 0.16], [...SHORE.sitOld, 0.2], [...SHORE.sitYoung, 0.2],
];

// ---- timeline ----
export type Clip = { id: string; who: string; text: string; start: number; end: number; words: { w: string; s: number; e: number }[] };

// ---- day cycle: cold morning -> bright noon at the lake -> dusk for the lesson -> night at home ----
type Day = { sky: string; sun: string; sunI: number; amb: number; hemi: number; night: number; wall: number };
export const DAYS: Record<string, Day> = {
  morning: { sky: "#CED6C8", sun: "#FFD6A8", sunI: 2.3, amb: 0.5, hemi: 0.5, night: 0, wall: 1 },
  noon: { sky: "#D3E1DF", sun: "#FFF4E0", sunI: 2.9, amb: 0.62, hemi: 0.55, night: 0, wall: 1.05 },
  dusk: { sky: "#D9A271", sun: "#FF9A58", sunI: 2.1, amb: 0.42, hemi: 0.4, night: 0.12, wall: 0.85 },
  night: { sky: "#141C30", sun: "#93ABFF", sunI: 0.7, amb: 0.2, hemi: 0.18, night: 1, wall: 0.22 },
};
export const dayAt = (keys: [number, Day][], t: number) => {
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
  const [ta, a] = keys[i];
  const [tb, b] = keys[i + 1];
  const k = smooth((t - ta) / Math.max(0.001, tb - ta));
  const c = (x: string, y: string) => new THREE.Color(x).lerp(new THREE.Color(y), k);
  return {
    sky: c(a.sky, b.sky),
    sun: c(a.sun, b.sun),
    sunI: lerp(a.sunI, b.sunI, k),
    amb: lerp(a.amb, b.amb, k),
    hemi: lerp(a.hemi, b.hemi, k),
    night: lerp(a.night, b.night, k),
    wall: lerp(a.wall, b.wall, k),
  };
};
