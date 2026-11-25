// EP06 sprites — generic stylised people (no faces, no likeness), finished with the kit's sel-out + form shading.
//   devBack():   programmer seen from behind, seated in an office chair (Warren Robinett as a generic figure)
//   teenBack():  teenager seen from behind, sitting cross-legged with a joystick (the 15-year-old finder)
//   director():  side view standing figure with shirt and tie, holding a pixel egg (Steve Wright as a generic figure)
//   egg():       striped pixel egg
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

/** Back view, seated: shaggy 70s hair, shirt with a collar, elbows out to the keyboard, chair back and base. */
export const devBack = (): Sprite => {
  const { s, rect, ell, thick } = drawer(34, 56);
  ell(17, 9, 6, 7, "h");
  rect(12, 12, 11, 4, "h"); // hair over the collar
  rect(15, 15, 5, 2, "k");
  for (let y = 16; y < 34; y++) {
    const half = y < 20 ? 8 + (y - 16) : 11 - Math.floor((y - 20) / 7);
    rect(17 - half, y, half * 2 + 1, 1, "r");
  }
  rect(14, 16, 7, 2, "w"); // collar
  thick(6, 20, 3, 30, 4, "r");
  thick(28, 20, 31, 30, 4, "r");
  thick(3, 30, 7, 33, 3, "k");
  thick(31, 30, 27, 33, 3, "k");
  // chair: backrest over the lower back, seat edge, stem, star base
  rect(8, 30, 19, 12, "m");
  rect(9, 31, 17, 1, "s");
  rect(5, 42, 25, 3, "m");
  rect(16, 45, 3, 6, "m");
  thick(8, 52, 26, 52, 2, "m");
  rect(7, 53, 3, 2, "b");
  rect(25, 53, 3, 2, "b");
  return s;
};
export const DEV_ANCHOR = { x: 17, y: 54 };

/** Back view, cross-legged on the floor, joystick held in front (stick tip visible over the shoulder). */
export const teenBack = (): Sprite => {
  const { s, rect, ell, thick } = drawer(28, 34);
  ell(14, 7, 5, 5.5, "h");
  rect(12, 12, 5, 2, "k");
  for (let y = 14; y < 26; y++) {
    const half = y < 17 ? 6 + (y - 14) : 8;
    rect(14 - half, y, half * 2 + 1, 1, (y - 14) % 3 === 0 ? "w" : "r");
  }
  thick(6, 16, 4, 23, 3, "r");
  thick(22, 16, 24, 23, 3, "r");
  thick(24, 4, 23, 12, 1, "m"); // joystick shaft over the right shoulder
  ell(24, 3, 1.6, 1.6, "r");
  // crossed legs (jeans) spreading out at the bottom
  rect(4, 26, 20, 4, "p");
  thick(2, 30, 12, 31, 3, "p");
  thick(26, 30, 16, 31, 3, "p");
  rect(0, 30, 3, 2, "b");
  rect(25, 30, 3, 2, "b");
  return s;
};
export const TEEN_ANCHOR = { x: 14, y: 32 };

/** Side view facing left: shirt and tie, trousers, right arm forward holding an egg. */
export const director = (holding = true): Sprite => {
  const { s, rect, ell, thick } = drawer(28, 54);
  const o = 2;
  ell(15, 6 + o, 4, 4.5, "h");
  ell(11.5, 8 + o, 2.4, 3.2, "k"); // featureless side of the face
  rect(13, 11 + o, 3, 2, "k");
  rect(10, 13 + o, 10, 14, "w");
  rect(10, 13 + o, 2, 9, "r"); // tie, seen from the side
  rect(10, 27 + o, 10, 2, "p");
  rect(11, 29 + o, 4, 16, "p");
  rect(15, 29 + o, 4, 16, "P");
  rect(8, 45 + o, 7, 3, "b");
  rect(14, 45 + o, 6, 3, "b");
  thick(17, 15 + o, 18, 25 + o, 3, "w"); // far arm
  if (holding) {
    thick(13, 15 + o, 8, 21 + o, 3, "w");
    thick(8, 21 + o, 4, 21 + o, 3, "k");
  } else thick(13, 15 + o, 12, 26 + o, 3, "w");
  return s;
};
export const DIR_ANCHOR = { x: 14, y: 50 };
/** Where the held egg sits relative to the anchor (sprite px). */
export const DIR_HAND = { x: -11, y: -28 };

export const egg = (): Sprite => {
  const { s, rect, ell } = drawer(9, 11);
  ell(4, 5.5, 3.6, 4.8, "g");
  rect(1, 4, 7, 1, "t");
  rect(1, 7, 7, 1, "t");
  rect(2, 5, 1, 1, "r");
  rect(5, 6, 1, 1, "r");
  return s;
};
export const EGG_ANCHOR = { x: 4, y: 10 };

const mat = (base: string, shade: string, light: string, out: string): Material => ({ base, shade, light, out });
export const SPEC: Record<string, FillSpec> = {
  k: { mat: mat("k", "K", "l", "u"), region: "skin" },
  h: { mat: mat("h", "H", "j", "n"), region: "hair" },
  r: { mat: mat("r", "R", "q", "x"), region: "shirt" },
  w: { mat: mat("w", "v", "W", "z"), region: "white" },
  p: { mat: mat("p", "P", "i", "e"), region: "pants" },
  P: { mat: mat("P", "e", "p", "e"), region: "pants" },
  b: { mat: mat("b", "b", "B", "z"), region: "shoe" },
  m: { mat: mat("m", "M", "W", "z"), region: "metal" },
  s: { mat: mat("s", "v", "W", "z"), region: "light" },
  g: { mat: mat("g", "G", "y", "o"), region: "egg" },
  t: { mat: mat("t", "T", "a", "A"), region: "teal" },
};
const BASE: Palette = {
  k: "#D9A07A", K: "#A0684A", l: "#F2C49E", u: "#4A2418",
  h: "#3A2418", H: "#1E120C", j: "#5E3C26", n: "#0E0806",
  r: "#B0652A", R: "#6E3A16", q: "#E08A44", x: "#2A1208",
  w: "#EEE6D6", v: "#B8AC96", W: "#FFFFFF", z: "#2E2622",
  p: "#3A3F55", P: "#23273A", i: "#5A6080", e: "#0E1018",
  b: "#2A2226", B: "#5A4E50",
  m: "#4A4048", M: "#26202A",
  s: "#8A8088",
  g: "#F3E6CC", G: "#BCA88A", y: "#FFFFFF", o: "#3E3430",
  t: "#3FB7A8", T: "#1F6B66", a: "#8FE6D8", A: "#0E3330",
};
/** Programmer: rust 70s shirt, brown hair. */
export const DEV_PAL: Palette = { ...BASE };
/** Teen: blue-and-cream striped shirt, jeans. */
export const TEEN_PAL: Palette = { ...BASE, r: "#2F6FB0", R: "#183C66", q: "#5A9AD8", x: "#0A1830", h: "#5A3420", H: "#2E1A10", j: "#7E5236", p: "#34406A", P: "#1E2642", i: "#56649A" };
/** Director: white shirt, dark-red tie, charcoal trousers. */
export const DIR_PAL: Palette = { ...BASE, r: "#9A2F35", R: "#5A141A", q: "#C24C50", x: "#22080A", h: "#2A1E18" };
export const EGG_PAL: Palette = { ...BASE, r: "#E8892E", R: "#9A5418", q: "#F4B860" };
