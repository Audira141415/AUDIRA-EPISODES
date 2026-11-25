// EP19 sprites: a generic coder seen from behind (no face, no likeness of a real person) and a chair.
import { blank, type Palette, type Sprite } from "../../kits/pixelstory/pixel/sprite.ts";

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
  return { s, set, rect, ell };
};

export const CODER_PAL: Palette = {
  h: "#1A0E10", // hair
  H: "#3A2420", // hair rim
  t: "#4A2B2E", // t-shirt
  T: "#6B3A38", // shirt light
  k: "#8A5A44", // neck / arms
  c: "#2A1512", // chair back
  C: "#47231A", // chair light
};

/** Seated, from behind, arms forward to the keyboard. Anchor bottom-centre of the chair. */
export const coderBack = (): Sprite => {
  const { s, rect, ell } = drawer(36, 56);
  // head + hair (short, messy top)
  ell(18, 10, 7, 8, "h");
  ell(14, 4, 3, 2, "h");
  ell(21, 3, 3, 2, "h");
  for (let y = 4; y < 16; y++) s.cells[y * 36 + 24] = "H";
  rect(15, 17, 6, 3, "k");
  // shoulders + back of shirt
  for (let y = 20; y < 40; y++) {
    const half = y < 24 ? 9 + (y - 20) : 13 - Math.floor((y - 24) / 6);
    rect(18 - half, y, half * 2, 1, "t");
  }
  for (let y = 21; y < 38; y++) s.cells[y * 36 + 29] = "T";
  // elbows going forward (out to the sides)
  rect(2, 26, 4, 8, "t");
  rect(30, 26, 4, 8, "t");
  rect(3, 33, 3, 3, "k");
  rect(30, 33, 3, 3, "k");
  // chair back
  rect(6, 36, 24, 14, "c");
  rect(6, 36, 24, 1, "C");
  rect(16, 50, 4, 6, "c");
  return s;
};
export const CODER_ANCHOR = { x: 18, y: 55 };
