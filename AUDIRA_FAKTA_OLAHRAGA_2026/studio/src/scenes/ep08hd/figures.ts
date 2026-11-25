// EP08 HD2D figures: pixel sprites (generic, no faces, no crests) that stand as slabs in the 3D dioramas.
// Reuses the EP08 PIXELSTORY sprites (sprites.ts) and adds the poses the jury asked for (G22):
//   cheer(hair)      side view, both arms up (match point / podium joy)
//   prayer(variant)  back view, head bowed, elbows out with raised palms (the Kemenpora ceremony crowd)
//   carrier(hair)    side view holding a torch up (OUT: Susy 1992 passes the flame to Butet 2016)
import { blank, type Palette, type Sprite } from "../../kits/pixelstory/pixel/sprite.ts";
import { finish } from "../../kits/pixelstory/pixel/finish.ts";
import { heroSmash, PAL, rival, side, sitter, SPEC, standBack, type SidePose } from "../ep08/sprites.ts";

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
  return { s, set, rect, ell, thick };
};

/** Copy of a sprite so it can be drawn over. */
const copy = (src: Sprite): Sprite => ({ w: src.w, h: src.h, cells: [...src.cells] });

/** One-pixel dark outline around every opaque pixel (for sprites that skip the finish pass). */
const outlined = (src: Sprite, key = "u"): Sprite => {
  const W = src.w + 2;
  const H = src.h + 2;
  const out = blank(W, H);
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= src.w || y >= src.h ? "." : src.cells[y * src.w + x]);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const c = at(x - 1, y - 1);
      if (c !== ".") out.cells[y * W + x] = c;
      else if ([[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dx, dy]) => at(x - 1 + dx, y - 1 + dy) !== ".")) out.cells[y * W + x] = key;
    }
  return out;
};

// ---------------------------------------------------------------- kits (palettes keyed like PAL)
/** Indonesia (white shirt, red band): PAL. */
export const INA = PAL;
/** Malaysia: dark-blue shirt, yellow band. */
export const MAS: Palette = { ...PAL, w: "#24357A", v: "#121C48", W: "#3E58A8", z: "#080C20", r: "#F2C230", R: "#A07A10", q: "#FFE070", x: "#3A2A06" };
/** Malaysia far-court front sprites (rival() uses r for the shirt). */
export const MAS_FRONT: Palette = { ...PAL, r: "#24357A", R: "#121C48", q: "#3E58A8", w: "#F2C230", v: "#A07A10" };
/** China: red shirt, yellow band. */
export const CHN: Palette = { ...PAL, w: "#C8242E", v: "#7A1018", W: "#E84A4A", z: "#3A0A10", r: "#F2C230", R: "#A07A10", q: "#FFE070", x: "#3A2A06" };
/** 1992 champion (Susy): cream retro kit with a red band. */
export const KIT_1992: Palette = { ...PAL, w: "#EDE0C2", v: "#B0A07E", W: "#FFF6E0", z: "#4A3E2C" };
/** 2016 champion (Butet): red kit with a white band. */
export const KIT_2016: Palette = { ...PAL, w: "#D02A30", v: "#86141C", W: "#F25A54", z: "#3A0A10", r: "#F5EEDF", R: "#BCAF98", q: "#FFFFFF", x: "#3E3430" };

// ---------------------------------------------------------------- sprites (finished, cached)
const memo = new Map<string, Sprite>();
const once = (key: string, make: () => Sprite) => {
  if (!memo.has(key)) memo.set(key, make());
  return memo.get(key)!;
};

export const SIDE_ANCHOR = { x: 13, y: 47 };
export const sideFig = (pose: SidePose, hair: "bun" | "short") => once(`side-${pose}-${hair}`, () => finish(side(pose, hair), SPEC));

export const cheer = (hair: "bun" | "short") =>
  once(`cheer-${hair}`, () => {
    const s = copy(side("wave", hair));
    const d = drawer(s.w, s.h);
    d.s.cells = s.cells;
    const o = 4;
    // far arm up as well (both arms raised)
    for (let y = 14 + o; y < 23 + o; y++) for (let x = 6; x < 10; x++) if (d.s.cells[y * s.w + x] === "k") d.s.cells[y * s.w + x] = ".";
    d.thick(10, 14 + o, 8, 8 + o, 2, "k");
    d.thick(8, 8 + o, 7, 2 + o, 2, "k");
    d.rect(6, 0 + o, 3, 3, "k");
    return finish(d.s, SPEC);
  });

export const carrier = (hair: "bun" | "short") =>
  once(`carrier-${hair}`, () => {
    const s = copy(side("wave", hair));
    return finish(s, SPEC);
  });

export const HERO = once("hero", () => finish(heroSmash(false), SPEC));
export const HERO_ANCHOR = { x: 22, y: 92 };
export const FRONT = once("front", () => finish(rival(), SPEC));
export const FRONT_ANCHOR = { x: 9, y: 32 };
export const SITTER = once("sitter", () => finish(sitter(), SPEC));
export const SITTER_ANCHOR = { x: 18, y: 29 };
export const backFig = (skirt: boolean) => once(`back-${skirt}`, () => finish(standBack(skirt), SPEC));
export const BACK_ANCHOR = { x: 14, y: 55 };

// ---------------------------------------------------------------- ceremony crowd (back view, praying)
export const PRAYER_ANCHOR = { x: 10, y: 42 };
/** v: 0 peci + white shirt, 1 hijab, 2 bare head + batik, 3 peci + uniform; arms: elbows out, palms raised in front of the face. */
export const prayer = (v: number) =>
  once(`prayer-${v % 4}`, () => {
    const { s, rect, ell, thick } = drawer(18, 44);
    // bowed head: low on the shoulders, no neck
    if (v % 4 === 1) {
      ell(9, 9.5, 4.6, 5, "e");
      rect(4, 12, 10, 4, "e");
    } else {
      ell(9, 9.5, 3.6, 4, "h");
      if (v % 4 !== 2) rect(5, 5, 9, 3, "p"); // peci
    }
    // torso
    rect(3, 13, 12, 14, "a");
    rect(4, 27, 10, 1, "a");
    // arms: upper arm out to the elbow, forearm back up to the raised palms
    thick(4, 14, 1, 21, 2, "a");
    thick(1, 21, 4, 15, 2, "k");
    thick(13, 14, 16, 21, 2, "a");
    thick(16, 21, 13, 15, 2, "k");
    // trousers / skirt
    if (v % 4 === 1) rect(4, 28, 10, 12, "d");
    else {
      rect(4, 28, 4, 12, "d");
      rect(10, 28, 4, 12, "d");
    }
    rect(4, 40, 4, 2, "f");
    rect(10, 40, 4, 2, "f");
    return outlined(s);
  });
export const PRAYER_PAL: Palette[] = [
  { h: "#1A1214", p: "#141012", a: "#F1EBDD", d: "#2A2E38", f: "#141012", k: "#C98E68", e: "#E9E2D2", u: "#0E0A0C" },
  { h: "#1A1214", p: "#141012", a: "#2E5A8A", d: "#1E2430", f: "#141012", k: "#C98E68", e: "#F4F0E6", u: "#0E0A0C" },
  { h: "#1A1214", p: "#141012", a: "#8A5A2E", d: "#2A2420", f: "#141012", k: "#B57E5A", e: "#E9E2D2", u: "#0E0A0C" },
  { h: "#1A1214", p: "#141012", a: "#5E6A4A", d: "#2E3424", f: "#141012", k: "#C98E68", e: "#E9E2D2", u: "#0E0A0C" },
  { h: "#1A1214", p: "#141012", a: "#F1EBDD", d: "#1E2430", f: "#141012", k: "#B57E5A", e: "#B8222E", u: "#0E0A0C" },
];
