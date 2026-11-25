// EP45 shared sprites — generic red-and-white hero (no real face, no crest) lifting a generic two-handled cup.
// Drawn as flat regions, finished with the kit's sel-out + form shading (finish(fillSprite(), SPEC)).
import { blank, type Palette, type Sprite } from "../../kits/pixelstory/pixel/sprite.ts";
import { finish, type FillSpec, type Material } from "../../kits/pixelstory/pixel/finish.ts";
import { mixHex } from "../../kits/pixelstory/core/palette.ts";

export const fillSprite = (): Sprite => {
  const W = 34;
  const H = 80;
  const s = blank(W, H);
  const set = (x: number, y: number, c: string) => {
    if (x >= 0 && y >= 0 && x < W && y < H) s.cells[y * W + x] = c;
  };
  const rect = (x: number, y: number, w: number, h: number, c: string) => {
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) set(x + xx, y + yy, c);
  };
  const ell = (cx: number, cy: number, rx: number, ry: number, c: string) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
        if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) set(x, y, c);
  };
  const thick = (x0: number, y0: number, x1: number, y1: number, t: number, c: string) => {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      const y = y0 + ((y1 - y0) * i) / n;
      rect(Math.round(x - t / 2), Math.round(y - t / 2), t, t, c);
    }
  };
  // cup: bowl, rim, big-ear handles, stem, base
  ell(17, 8, 7.5, 7, "g");
  rect(9, 0, 17, 2, "g");
  rect(10, 2, 15, 5, "g");
  for (const side of [-1, 1]) {
    const hx = side < 0 ? 4 : 27;
    rect(hx, 3, 3, 11, "g");
    rect(side < 0 ? hx + 2 : hx - 2, 2, 3, 2, "g");
    rect(side < 0 ? hx + 2 : hx - 2, 13, 3, 2, "g");
    rect(hx + (side < 0 ? 1 : 1), 5, 1, 7, "."); // hollow of the ear
  }
  rect(15, 15, 5, 4, "g");
  rect(12, 19, 11, 3, "G");
  // arms raised: forearm skin up to the hands gripping the base, red sleeve at the shoulder
  thick(8, 40, 10, 22, 4, "k");
  thick(26, 40, 24, 22, 4, "k");
  thick(8, 40, 9, 34, 5, "r");
  thick(26, 40, 25, 34, 5, "r");
  rect(9, 19, 4, 4, "k");
  rect(22, 19, 4, 4, "k");
  // head tilted up with a gap under the cup, hair, neck — no facial features
  ell(17, 32, 4.5, 5, "k");
  rect(13, 27, 9, 2, "h");
  set(12, 29, "h");
  set(22, 29, "h");
  rect(15, 36, 5, 2, "k");
  // shirt: red with white collar and white side panels
  for (let y = 38; y < 57; y++) {
    const half = y < 41 ? 8 + (y - 38) : 10 - Math.floor((y - 41) / 8);
    rect(17 - half, y, half * 2 + 1, 1, "r");
  }
  rect(15, 38, 5, 1, "w");
  set(16, 39, "w");
  set(18, 39, "w");
  set(17, 40, "w");
  rect(8, 43, 1, 13, "w");
  rect(26, 43, 1, 13, "w");
  // shorts
  rect(9, 57, 17, 7, "w");
  rect(17, 61, 1, 3, ".");
  // legs, socks with a white band, boots
  rect(11, 64, 5, 4, "k");
  rect(19, 64, 5, 4, "k");
  rect(11, 68, 5, 1, "w");
  rect(19, 68, 5, 1, "w");
  rect(11, 69, 5, 7, "r");
  rect(19, 69, 5, 7, "r");
  rect(10, 76, 6, 3, "b");
  rect(19, 76, 6, 3, "b");
  return s;
};

export const mat = (base: string, shade: string, light: string, out: string): Material => ({ base, shade, light, out });
export const SPEC: Record<string, FillSpec> = {
  g: { mat: mat("g", "G", "y", "o"), region: "cup" },
  G: { mat: mat("G", "o", "g", "o"), region: "cup" },
  k: { mat: mat("k", "K", "l", "u"), region: "skin" },
  h: { mat: mat("h", "H", "h", "n"), region: "hair" },
  r: { mat: mat("r", "R", "q", "x"), region: "shirt" },
  w: { mat: mat("w", "v", "W", "z"), region: "white" },
  b: { mat: mat("b", "b", "B", "b"), region: "boot" },
};
export const HERO_PAL: Palette = {
  g: "#E9B347", G: "#A8701E", y: "#FFEBA8", o: "#4A2A10",
  k: "#DDA07A", K: "#A9694A", l: "#F2C49E", u: "#4A2418",
  h: "#6E4220", H: "#4A2A14", n: "#24130A",
  r: "#C8202E", R: "#82121E", q: "#F0504C", x: "#3A0A10",
  w: "#F3E6CC", v: "#B9A688", W: "#FFF8E8", z: "#4A3A30",
  b: "#22161A", B: "#4A3A3E",
};

// ---------------------------------------------------------------- film sprites (generic players, no faces, no crests)

type Draw = ReturnType<typeof drawer>;
const drawer = (W: number, H: number) => {
  const s = blank(W, H);
  const set = (x: number, y: number, c: string) => {
    if (x >= 0 && y >= 0 && x < W && y < H) s.cells[y * W + x] = c;
  };
  const rect = (x: number, y: number, w: number, h: number, c: string) => {
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) set(x + xx, y + yy, c);
  };
  const ell = (cx: number, cy: number, rx: number, ry: number, c: string) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
        if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) set(x, y, c);
  };
  const thick = (x0: number, y0: number, x1: number, y1: number, t: number, c: string) => {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
    for (let i = 0; i <= n; i++) rect(Math.round(x0 + ((x1 - x0) * i) / n - t / 2 + 0.5), Math.round(y0 + ((y1 - y0) * i) / n - t / 2 + 0.5), t, t, c);
  };
  return { s, set, rect, ell, thick };
};

export type Pose = "run0" | "run1" | "stand" | "kick";
const headTorso = (d: Draw) => {
  d.ell(7, 4, 2.6, 2.8, "k");
  d.rect(4, 1, 7, 2, "h");
  d.set(4, 3, "h");
  d.set(10, 3, "h");
  d.rect(6, 7, 3, 1, "k");
  d.rect(4, 8, 7, 8, "r");
  d.rect(4, 16, 7, 4, "s");
};
const leg = (d: Draw, hx: number, fx: number, fy: number) => {
  d.thick(hx, 20, fx, fy, 2, "k");
  d.thick(hx + (fx - hx) * 0.5, 20 + (fy - 20) * 0.5, fx, fy, 2, "r");
  d.rect(fx - 1, fy, 3, 2, "b");
};
const arm = (d: Draw, sx: number, hx: number, hy: number) => {
  d.thick(sx, 9, sx + (hx - sx) * 0.6, 9 + (hy - 9) * 0.6, 2, "r");
  d.thick(sx + (hx - sx) * 0.6, 9 + (hy - 9) * 0.6, hx, hy, 2, "k");
};
/** 14 × 28 outfield player facing right (flip for left). */
export const playerFill = (pose: Pose): Sprite => {
  const d = drawer(14, 28);
  if (pose === "run0") {
    arm(d, 4, 2, 14);
    arm(d, 10, 12, 13);
    leg(d, 5, 2, 25);
    leg(d, 9, 11, 24);
  } else if (pose === "run1") {
    arm(d, 4, 3, 13);
    arm(d, 10, 12, 14);
    leg(d, 5, 4, 25);
    leg(d, 9, 9, 25);
  } else if (pose === "kick") {
    arm(d, 4, 1, 11);
    arm(d, 10, 13, 12);
    leg(d, 5, 4, 25);
    d.thick(9, 20, 13, 22, 2, "k");
    d.rect(12, 21, 2, 2, "b");
  } else {
    arm(d, 4, 3, 16);
    arm(d, 10, 11, 16);
    leg(d, 5, 5, 25);
    leg(d, 9, 9, 25);
  }
  headTorso(d);
  return d.s;
};
/** 18 × 28 goalkeeper, arms spread, gloves. */
export const keeperStandFill = (): Sprite => {
  const d = drawer(18, 28);
  const o = 2;
  d.thick(4 + o, 9, 1, 5, 2, "r");
  d.thick(10 + o, 9, 16, 5, 2, "r");
  d.rect(0, 3, 2, 2, "w");
  d.rect(16, 3, 2, 2, "w");
  d.ell(7 + o, 4, 2.6, 2.8, "k");
  d.rect(4 + o, 1, 7, 2, "h");
  d.rect(6 + o, 7, 3, 1, "k");
  d.rect(4 + o, 8, 7, 8, "r");
  d.rect(4 + o, 16, 7, 4, "s");
  for (const [hx, fx] of [[5, 4], [9, 10]]) {
    d.thick(hx + o, 20, fx + o, 25, 2, "k");
    d.rect(fx + o - 1, 25, 3, 2, "b");
  }
  return d.s;
};
/** 32 × 14 goalkeeper at full stretch, diving to the right. */
export const keeperDiveFill = (): Sprite => {
  const d = drawer(32, 14);
  d.thick(10, 8, 2, 11, 2, "k");
  d.thick(10, 7, 1, 6, 2, "k");
  d.rect(0, 10, 2, 3, "b");
  d.rect(0, 5, 2, 3, "b");
  d.rect(10, 5, 5, 5, "s");
  d.rect(15, 4, 8, 6, "r");
  d.ell(25, 6, 2.6, 2.4, "k");
  d.rect(24, 3, 3, 2, "h");
  d.thick(22, 5, 29, 1, 2, "r");
  d.rect(29, 0, 3, 2, "w");
  return d.s;
};
export const ballFill = (): Sprite => {
  const d = drawer(3, 3);
  d.rect(0, 0, 3, 3, "w");
  d.set(1, 1, "v");
  return d.s;
};

const PLAYER_SPEC: Record<string, FillSpec> = {
  k: SPEC.k,
  h: SPEC.h,
  r: SPEC.r,
  s: { mat: mat("s", "S", "j", "m"), region: "shorts" },
  w: { mat: mat("w", "v", "W", "z"), region: "white" },
  v: { mat: mat("v", "v", "w", "z"), region: "white" },
  b: SPEC.b,
};
export const finishPlayer = (s: Sprite) => finish(s, PLAYER_SPEC);

/** Palette for a team: shirt and shorts base colours; shade/light/outline are derived. */
export const teamPal = (shirt: string, shorts: string): Palette => ({
  ...HERO_PAL,
  r: shirt, R: mixHex(shirt, "#2A0A14", 0.45), q: mixHex(shirt, "#FFF4DC", 0.35), x: mixHex(shirt, "#0D0809", 0.75),
  s: shorts, S: mixHex(shorts, "#2A0A14", 0.45), j: mixHex(shorts, "#FFF4DC", 0.35), m: mixHex(shorts, "#0D0809", 0.75),
});
export const TEAM = {
  DEN: teamPal("#C8202E", "#F3E6CC"),
  ENG: teamPal("#EDE6DA", "#24305E"),
  SWE: teamPal("#F2C230", "#2452A8"),
  FRA: teamPal("#2A4BB0", "#F3E6CC"),
  NED: teamPal("#E8742A", "#F3E6CC"),
  GER: teamPal("#EDE6DA", "#1E1A1C"),
  KEEP_DEN: teamPal("#A01828", "#1E1A1C"),
  KEEP_GER: teamPal("#3E8A52", "#1E1A1C"),
  COACH: teamPal("#2B2A33", "#2B2A33"),
} satisfies Record<string, Palette>;
