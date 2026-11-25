// EP22 sprites — generic stylised people (no faces, no likeness), finished with the kit's sel-out + form shading.
//   kidSide():   child sitting on the bed edge, side view facing right, head bowed, hands at the lap (holds the egg device)
//   kidBack():   pupil seen from behind at a school desk (head + shoulders + arms on the desk)
//   headBack():  audience / queue head + shoulders from behind
//   person():    side view standing adult facing left, arm forward (Ig Nobel podium, office)
// The digital egg device itself is drawn in HTML (Film.tsx EggDev) so its LCD can animate.
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
  const ell = (cx: number, cy: number, rx: number, ry: number, c: string) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) set(x, y, c);
  };
  const thick = (x0: number, y0: number, x1: number, y1: number, t: number, c: string) => {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
    for (let i = 0; i <= n; i++) rect(Math.round(x0 + ((x1 - x0) * i) / n - t / 2 + 0.5), Math.round(y0 + ((y1 - y0) * i) / n - t / 2 + 0.5), t, t, c);
  };
  return { s, rect, ell, thick };
};

/** Side view facing right, seated, head bowed toward the hands. */
export const kidSide = (): Sprite => {
  const { s, rect, ell, thick } = drawer(28, 42);
  ell(12, 9, 6, 6, "h"); // hair, back of the head
  ell(15, 11, 4, 4.5, "k"); // featureless face, bowed
  rect(9, 4, 8, 3, "h");
  rect(12, 15, 4, 2, "k"); // neck
  for (let y = 16; y < 29; y++) rect(7, y, 11 - (y > 24 ? 1 : 0), 1, (y - 16) % 4 === 0 ? "w" : "r"); // striped shirt
  thick(15, 18, 21, 24, 3, "r"); // arm to the lap
  rect(20, 23, 3, 3, "k"); // hands
  rect(6, 28, 15, 4, "p"); // thighs on the bed edge
  thick(19, 31, 20, 38, 4, "p"); // shins down
  rect(18, 38, 6, 3, "b");
  return s;
};
export const KID_SIDE_ANCHOR = { x: 13, y: 40 };
/** Hands, relative to the anchor in sprite px (where the device is held). */
export const KID_HANDS = { x: 9, y: -16 };

/** Pupil from behind: head, shoulders, elbows on the desk. */
export const kidBack = (): Sprite => {
  const { s, rect, ell, thick } = drawer(24, 26);
  ell(12, 7, 5, 5.5, "h");
  rect(10, 12, 5, 2, "k");
  for (let y = 14; y < 26; y++) {
    const half = y < 17 ? 6 + (y - 14) : 9;
    rect(12 - half, y, half * 2 + 1, 1, "r");
  }
  rect(9, 14, 7, 2, "w"); // collar
  thick(3, 17, 1, 25, 3, "r");
  thick(21, 17, 23, 25, 3, "r");
  return s;
};
export const KID_BACK_ANCHOR = { x: 12, y: 25 };

/** Head and shoulders from behind (audience, queue). */
export const headBack = (): Sprite => {
  const { s, rect, ell } = drawer(18, 16);
  ell(9, 6, 4.5, 5, "h");
  for (let y = 10; y < 16; y++) rect(9 - (4 + (y - 10)), y, (4 + (y - 10)) * 2 + 1, 1, "r");
  return s;
};
export const HEAD_ANCHOR = { x: 9, y: 15 };

/** Side view facing left, standing; right arm forward (holding something at the hand). */
export const person = (): Sprite => {
  const { s, rect, ell, thick } = drawer(26, 52);
  ell(14, 7, 4, 4.5, "h");
  ell(11, 9, 2.4, 3.2, "k");
  rect(12, 12, 3, 2, "k");
  rect(9, 14, 10, 14, "r"); // jacket
  rect(9, 14, 2, 8, "w"); // shirt front
  rect(9, 28, 10, 2, "p");
  rect(10, 30, 4, 16, "p");
  rect(14, 30, 4, 16, "P");
  rect(7, 46, 7, 3, "b");
  rect(13, 46, 6, 3, "b");
  thick(16, 16, 17, 26, 3, "r"); // far arm
  thick(12, 16, 7, 22, 3, "r");
  thick(7, 22, 3, 22, 3, "k");
  return s;
};
export const PERSON_ANCHOR = { x: 13, y: 49 };
export const PERSON_HAND = { x: -10, y: -27 };

const mat = (base: string, shade: string, light: string, out: string): Material => ({ base, shade, light, out });
export const SPEC: Record<string, FillSpec> = {
  k: { mat: mat("k", "K", "l", "u"), region: "skin" },
  h: { mat: mat("h", "H", "j", "n"), region: "hair" },
  r: { mat: mat("r", "R", "q", "x"), region: "shirt" },
  w: { mat: mat("w", "v", "W", "z"), region: "white" },
  p: { mat: mat("p", "P", "i", "e"), region: "pants" },
  P: { mat: mat("P", "e", "p", "e"), region: "pants" },
  b: { mat: mat("b", "b", "B", "z"), region: "shoe" },
};
const BASE: Palette = {
  k: "#D9A07A", K: "#A0684A", l: "#F2C49E", u: "#4A2418",
  h: "#2A1A14", H: "#140C0A", j: "#4A3020", n: "#0A0605",
  r: "#B0652A", R: "#6E3A16", q: "#E08A44", x: "#2A1208",
  w: "#EEE6D6", v: "#B8AC96", W: "#FFFFFF", z: "#2E2622",
  p: "#3A3F55", P: "#23273A", i: "#5A6080", e: "#0E1018",
  b: "#2A2226", B: "#5A4E50",
};
/** Child in pyjamas: soft blue stripes. */
export const KID_PAL: Palette = { ...BASE, r: "#4F7FC0", R: "#2A4A80", q: "#86B0E8", x: "#0E1A34", p: "#5A6AA0", P: "#3A4878", i: "#8090C8" };
/** School uniform: white shirt (r = white), Japanese-style. */
export const PUPIL_PALS: Palette[] = [
  { ...BASE, r: "#E8E2D4", R: "#A8A08E", q: "#FFFFFF", x: "#3A342C", w: "#2A3A6A", v: "#1A2448", W: "#4A5A9A" },
  { ...BASE, r: "#2F4A7A", R: "#1A2C4C", q: "#5070A8", x: "#0A1228", h: "#3A2418" },
  { ...BASE, r: "#E8E2D4", R: "#A8A08E", q: "#FFFFFF", x: "#3A342C", w: "#9A2F35", v: "#5A141A", W: "#C24C50", h: "#1E1410" },
];
/** Queue / audience: bright jackets so the bottom of the frame reads. */
export const CROWD_PALS: Palette[] = [
  { ...BASE, r: "#C8443C", R: "#7A2420", q: "#F07060", x: "#2A0A08" },
  { ...BASE, r: "#3FB7A8", R: "#1F6B66", q: "#8FE6D8", x: "#0E3330", h: "#4A2E1E" },
  { ...BASE, r: "#E8A23A", R: "#9A6418", q: "#FFD27A", x: "#3A2408" },
  { ...BASE, r: "#7A5AD8", R: "#44308A", q: "#A88CFF", x: "#160E30", h: "#1A120E" },
  { ...BASE, r: "#E8E2D4", R: "#A8A08E", q: "#FFFFFF", x: "#3A342C", h: "#5A3A24" },
];
/** Podium speaker: dark suit. */
export const SUIT_PAL: Palette = { ...BASE, r: "#2E3346", R: "#181B28", q: "#4A5270", x: "#08090E" };
/** Office worker: teal cardigan. */
export const OFFICE_PAL: Palette = { ...BASE, r: "#3F8F86", R: "#205650", q: "#7FD0C4", x: "#0A2422", h: "#4A2E1E" };
