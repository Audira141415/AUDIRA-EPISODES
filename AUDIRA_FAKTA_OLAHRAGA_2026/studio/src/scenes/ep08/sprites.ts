// EP08 sprites (copied from EP01) — generic stylised players (no real faces, no crests), finished with the kit's sel-out + form shading.
//   heroSmash(): Indonesian player seen from behind at the top of a jump smash (white kit, red shoulder band)
//   rival():     small far-court player in a red kit, facing the camera (featureless at this size)
//   shuttle():   shuttlecock (cork + feather skirt)
import { blank, type Palette, type Sprite } from "../../kits/pixelstory/pixel/sprite.ts";
import type { FillSpec, Material } from "../../kits/pixelstory/pixel/finish.ts";

const drawer = (W: number, H: number) => {
  const s = blank(W, H);
  const set = (x: number, y: number, c: string) => {
    if (x >= 0 && y >= 0 && x < W && y < H) s.cells[y * W + x] = c;
  };
  const rect = (x: number, y: number, w: number, h: number, c: string) => {
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) set(x + xx, y + yy, c);
  };
  const ell = (cx: number, cy: number, rx: number, ry: number, c: string, hollow = 0) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
        if (d <= 1 && (!hollow || d >= hollow)) set(x, y, c);
      }
  };
  const thick = (x0: number, y0: number, x1: number, y1: number, t: number, c: string) => {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
    for (let i = 0; i <= n; i++) rect(Math.round(x0 + ((x1 - x0) * i) / n - t / 2 + 0.5), Math.round(y0 + ((y1 - y0) * i) / n - t / 2 + 0.5), t, t, c);
  };
  return { s, set, rect, ell, thick };
};

export const HERO_W = 46;
export const HERO_H = 92;
/** Back view, jump smash: racket cocked high on the right, left arm pointing at the shuttle. `skirt=false`: short hair + shorts (Owi). */
export const heroSmash = (skirt = true): Sprite => {
  const { s, set, rect, ell, thick } = drawer(HERO_W, HERO_H);
  // racket: head (frame ring + strings), throat, handle into the right hand
  ell(38, 8, 4.5, 7, "m", 0.62);
  ell(38, 8, 3.2, 5.6, "s");
  thick(37, 15, 35, 22, 2, "m");
  // right arm (viewer right): shoulder -> elbow -> hand, white sleeve at the shoulder
  thick(29, 40, 33, 31, 4, "k");
  thick(33, 31, 34, 23, 3, "k");
  thick(28, 40, 31, 35, 5, "w");
  // left arm up towards the shuttle
  thick(13, 40, 9, 31, 4, "k");
  thick(9, 31, 6, 22, 3, "k");
  thick(14, 40, 11, 35, 5, "w");
  // head from behind: all hair, a low bun, neck
  ell(21, 30, 5, 5.5, "h");
  if (skirt) ell(21, 23.5, 2.6, 2.2, "h");
  rect(19, 35, 5, 3, "k");
  // shirt: white with the red shoulder band, slight taper
  for (let y = 37; y < 62; y++) {
    const half = y < 40 ? 7 + (y - 37) : 9 - Math.floor((y - 40) / 9);
    rect(21 - half, y, half * 2 + 1, 1, y < 41 ? "r" : "w");
  }
  if (skirt) {
    // skirt: white pleats flaring, red hem
    for (let y = 62; y < 71; y++) {
      const half = 8 + Math.floor((y - 62) / 3);
      rect(21 - half, y, half * 2 + 1, 1, y === 70 ? "r" : "w");
    }
    for (let x = 15; x <= 27; x += 4) set(x, 66, "v");
  } else {
    // shorts: straight white legs with a red side stripe and a shadowed crotch gap
    rect(13, 62, 17, 4, "w");
    rect(13, 66, 7, 5, "w");
    rect(23, 66, 7, 5, "w");
    rect(20, 66, 3, 5, "v");
    rect(13, 62, 1, 9, "r");
    rect(29, 62, 1, 9, "r");
  }
  // legs: left straight, right knee lifted (airborne)
  rect(15, 71, 4, 14, "k");
  thick(25, 71, 28, 79, 4, "k");
  thick(28, 79, 26, 84, 4, "k");
  rect(15, 84, 4, 2, "w");
  rect(24, 83, 4, 2, "w");
  rect(14, 86, 6, 3, "b");
  rect(23, 85, 6, 3, "b");
  return s;
};
export const HERO_ANCHOR = { x: 21, y: HERO_H - 1 };

export const RIVAL_W = 16;
export const RIVAL_H = 32;
export const rival = (): Sprite => {
  const { s, rect, ell, thick } = drawer(RIVAL_W, RIVAL_H);
  ell(8, 4, 2.6, 3, "k");
  rect(5, 1, 7, 2, "h");
  rect(7, 7, 3, 1, "k");
  rect(4, 8, 9, 9, "r");
  thick(4, 9, 1, 15, 2, "k");
  thick(12, 9, 14, 4, 2, "k");
  thick(14, 4, 15, 0, 1, "m");
  rect(4, 17, 9, 4, "w");
  rect(5, 21, 2, 7, "k");
  rect(10, 21, 2, 7, "k");
  rect(4, 28, 4, 2, "b");
  rect(9, 28, 4, 2, "b");
  return s;
};
export const RIVAL_ANCHOR = { x: 8, y: RIVAL_H - 1 };

export const shuttle = (): Sprite => {
  const { s, rect, set } = drawer(5, 6);
  rect(0, 0, 5, 1, "s");
  rect(1, 1, 3, 2, "s");
  set(0, 1, "s");
  set(4, 1, "s");
  rect(1, 3, 3, 1, "v");
  rect(1, 4, 3, 2, "c");
  return s;
};

const mat = (base: string, shade: string, light: string, out: string): Material => ({ base, shade, light, out });
export const SPEC: Record<string, FillSpec> = {
  k: { mat: mat("k", "K", "l", "u"), region: "skin" },
  h: { mat: mat("h", "H", "j", "n"), region: "hair" },
  r: { mat: mat("r", "R", "q", "x"), region: "red" },
  w: { mat: mat("w", "v", "W", "z"), region: "white" },
  v: { mat: mat("v", "z", "w", "z"), region: "white" },
  b: { mat: mat("b", "b", "B", "b"), region: "shoe" },
  m: { mat: mat("m", "M", "W", "z"), region: "racket" },
  s: { mat: mat("s", "v", "W", "z"), region: "strings" },
  c: { mat: mat("c", "C", "y", "o"), region: "cork" },
};
export const PAL: Palette = {
  k: "#D9A07A", K: "#A0684A", l: "#F2C49E", u: "#4A2418",
  h: "#1E1416", H: "#0E0A0C", j: "#3A2A2E", n: "#060405",
  r: "#D02A30", R: "#86141C", q: "#F25A54", x: "#3A0A10",
  w: "#F5EEDF", v: "#BCAF98", W: "#FFFFFF", z: "#3E3430",
  b: "#E8E2D6", B: "#FFFFFF",
  m: "#C8C2B8", M: "#6E6860",
  s: "#E9E4DA",
  c: "#C99A5A", C: "#8A6232", y: "#F0C88A", o: "#3A2410",
};
/** Rival kit: red shirt, white shorts — same palette keys, different reds. */
export const RIVAL_PAL: Palette = { ...PAL, r: "#B8222E", R: "#6E1018", q: "#E2464A" };

// ---------------------------------------------------------------- film sprites (EP01 scenes B–F)
//   side(pose, hair):  side view facing right, 24 × 48. "ready" / "smash" / "wave"; hair "bun" (Susi) or "short" (Alan)
//   sitter():          side view sitting on a bed edge, head bowed (night before the final)
//   standBack():       back view standing on the podium, medal ribbon at the neck
//   openCar():         open parade car, side view
export type SidePose = "ready" | "smash" | "wave" | "stand";
export const SIDE_W = 24;
export const SIDE_H = 48;
export const side = (pose: SidePose, hair: "bun" | "short" = "bun"): Sprite => {
  const { s, rect, ell, thick } = drawer(SIDE_W, SIDE_H);
  const o = 4; // headroom for the raised racket
  ell(12, 6 + o, 4, 4.5, "h");
  if (hair === "bun") ell(8, 3 + o, 2, 2, "h");
  ell(14.5, 7.5 + o, 2.2, 3, "k"); // featureless side of the face
  rect(11, 10 + o, 3, 2, "k");
  rect(8, 12 + o, 9, 12, "w");
  rect(8, 12 + o, 9, 2, "r");
  if (hair === "bun") {
    for (let y = 24; y < 29; y++) rect(7 - Math.floor((y - 24) / 3), y + o, 11 + Math.floor((y - 24) / 3) * 2, 1, y === 28 ? "r" : "w");
  } else rect(8, 24 + o, 9, 5, "w");
  const bent = pose === "ready" || pose === "smash";
  if (bent) {
    thick(10, 29 + o, 8, 36 + o, 3, "k");
    thick(8, 36 + o, 9, 41 + o, 3, "k");
    thick(15, 29 + o, 17, 36 + o, 3, "k");
    thick(17, 36 + o, 16, 41 + o, 3, "k");
    rect(7, 41 + o, 4, 2, "b");
    rect(15, 41 + o, 5, 2, "b");
  } else {
    rect(9, 29 + o, 3, 12, "k");
    rect(13, 29 + o, 3, 12, "k");
    rect(8, 41 + o, 4, 2, "b");
    rect(13, 41 + o, 5, 2, "b");
  }
  thick(9, 14 + o, 7, 22 + o, 2, "k"); // far arm
  if (pose === "ready") {
    thick(16, 14 + o, 19, 19 + o, 2, "k");
    thick(19, 19 + o, 21, 14 + o, 2, "k");
    thick(21, 14 + o, 22, 10 + o, 1, "m");
    ell(22, 5 + o, 2.5, 3.5, "m", 0.55);
    ell(22, 5 + o, 1.6, 2.6, "s");
  } else if (pose === "smash") {
    thick(15, 13 + o, 17, 6 + o, 2, "k");
    thick(17, 6 + o, 18, 1 + o, 2, "k");
    thick(18, 1 + o, 21, -1 + o, 1, "m");
    ell(21, -4 + o + 1, 3, 2.4, "m", 0.55);
  } else if (pose === "wave") {
    thick(16, 14 + o, 18, 8 + o, 2, "k");
    thick(18, 8 + o, 19, 2 + o, 2, "k");
    rect(18, 0 + o, 3, 3, "k");
  } else {
    thick(15, 14 + o, 16, 23 + o, 2, "k");
  }
  return s;
};
export const SIDE_ANCHOR = { x: 12, y: SIDE_H - 2 };

export const sitter = (): Sprite => {
  const { s, rect, ell, thick } = drawer(22, 30);
  ell(11, 7, 4, 4.5, "h");
  ell(8, 4, 2, 2, "h");
  ell(13, 9, 2.2, 2.6, "k");
  rect(6, 11, 8, 10, "w");
  rect(6, 11, 8, 2, "r");
  thick(12, 13, 17, 19, 2, "k"); // forearms on the knees
  rect(6, 20, 12, 4, "w");
  thick(17, 22, 17, 27, 3, "k");
  rect(15, 27, 5, 2, "b");
  return s;
};
export const SITTER_ANCHOR = { x: 17, y: 28 };

export const standBack = (skirt = true): Sprite => {
  const { s, rect, ell, thick } = drawer(26, 56);
  ell(13, 8, 5, 5.5, "h");
  if (skirt) ell(13, 2.5, 2.5, 2, "h");
  rect(11, 13, 5, 3, "k");
  rect(10, 14, 7, 1, "r"); // medal ribbon round the neck
  for (let y = 16; y < 34; y++) {
    const half = y < 19 ? 6 + (y - 16) : 8 - Math.floor((y - 19) / 8);
    rect(13 - half, y, half * 2 + 1, 1, y < 19 ? "r" : "w");
  }
  thick(5, 18, 4, 31, 3, "k");
  thick(21, 18, 22, 31, 3, "k");
  if (skirt) {
    for (let y = 34; y < 41; y++) {
      const half = 7 + Math.floor((y - 34) / 3);
      rect(13 - half, y, half * 2 + 1, 1, y === 40 ? "r" : "w");
    }
  } else {
    rect(6, 34, 15, 3, "w");
    rect(6, 37, 6, 4, "w");
    rect(15, 37, 6, 4, "w");
    rect(6, 34, 1, 7, "r");
    rect(20, 34, 1, 7, "r");
  }
  rect(9, 41, 3, 11, "k");
  rect(14, 41, 3, 11, "k");
  rect(8, 52, 5, 3, "b");
  rect(14, 52, 5, 3, "b");
  return s;
};
export const STAND_ANCHOR = { x: 13, y: 54 };

export const openCar = (): Sprite => {
  const { s, rect, ell, thick } = drawer(52, 20);
  rect(4, 8, 44, 6, "w");
  rect(2, 10, 48, 4, "w");
  rect(2, 12, 48, 1, "r");
  rect(6, 6, 12, 2, "w"); // rear deck
  thick(36, 4, 39, 8, 1, "s"); // windscreen
  rect(46, 9, 4, 2, "c"); // headlamp
  ell(11, 15, 3.5, 3.5, "h");
  ell(41, 15, 3.5, 3.5, "h");
  ell(11, 15, 1.3, 1.3, "m");
  ell(41, 15, 1.3, 1.3, "m");
  return s;
};
export const CAR_ANCHOR = { x: 26, y: 19 };
