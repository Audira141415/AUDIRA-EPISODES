// EP45 shared set — the PIXELSTORY night stadium painted once into albedo layers (back / pitch / near).
// Used by the cover and the film. Set coordinates are art px on the 1080 × 1920 stage (8 screen px per art px → 135 × 240).
import { rng } from "../../kits/pixelstory/core/noise.ts";
import { createAlbedo, painter } from "../../kits/pixelstory/environment/albedo.ts";

export const PITCH_GREEN = "#2BD46A";

export const ROOF_Y = 70;
export const BOARD_Y = 128;
export const PITCH_Y = 137;
export const HERO = { x: 67, y: 192 };
export const FLOOD = { x: 9, y: 14 };
export const RIM = { x: 128, y: 30 };
export const CUP = { x: HERO.x, y: HERO.y - 71 };

export type P = ReturnType<typeof painter>;

export const ellipseRing = (p: P, cx: number, cy: number, rx: number, ry: number, o: Parameters<P["put"]>[3]) => {
  const n = Math.ceil(Math.PI * 2 * Math.max(rx, ry) * 1.4);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    p.put(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, "ivoryLit", o);
  }
};

export const floodTower = (p: P, x: number, y: number, cols: number, rows: number, postH: number) => {
  // lattice post
  p.rect(x - 2, y + rows * 3 + 1, 4, postH, "metal", { val: 0.42 });
  for (let k = 0; k < postH; k += 4) p.line(x - 2, y + rows * 3 + 1 + k, x + 1, y + rows * 3 + 4 + k, "metal", { val: 0.6 });
  // lamp bank: a frame of lamps, each an emitting cell
  const w = cols * 3 + 1;
  p.rect(x - w / 2, y - 1, w, rows * 3 + 2, "metal", { val: 0.3 });
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) p.rect(x - w / 2 + 1 + c * 3, y + r * 3, 2, 2, "ivoryLit", { val: 1, emit: 0.95 });
};

export const buildSet = () => {
  // ---- back layer: sky, roof, two tiers of red/white crowd, floodlight towers
  const back = createAlbedo(175, 150, -20, -10);
  const b = painter(back);
  for (let y = -10; y < ROOF_Y + 2; y++) b.hline(-20, y, 175, "sky", { val: 0.32 + (y / ROOF_Y) * 0.4, jitter: 0.06, seed: 3 });
  const stars = rng(45);
  for (let i = 0; i < 28; i++) {
    const sx = Math.floor(stars() * 175) - 20;
    const sy = Math.floor(stars() * 40) - 8;
    b.put(sx, sy, "ivoryLit", { val: 0.35 + stars() * 0.25 });
  }
  // roof: dark steel canopy with a lit fascia edge
  b.rect(-20, ROOF_Y, 175, 6, "metal", { val: 0.35 });
  b.hline(-20, ROOF_Y + 5, 175, "metal", { val: 0.75 });
  for (let x = -16; x < 155; x += 22) b.rect(x, ROOF_Y + 6, 2, 30, "metal", { val: 0.45 });
  // crowd tiers
  const crowd = (y0: number, h: number, seed: number) => {
    b.rect(-20, y0, 175, h, "stone", { val: 0.32 });
    const r = rng(seed);
    for (let y = y0 + 1; y < y0 + h - 1; y += 2)
      for (let x = -20; x < 155; x++) {
        const v = r();
        if (v < 0.36) b.put(x, y, "book1", { val: 0.75 + r() * 0.3 });
        else if (v < 0.58) b.put(x, y, "ivoryLit", { val: 0.55 + r() * 0.25 });
        else if (v < 0.72) b.put(x, y, "plaster", { val: 0.55 });
      }
    // a few flags: red with a white cross, waving above heads (generic, no crest)
    for (let k = 0; k < 4; k++) {
      const fx = 2 + Math.floor(r() * 130);
      const fy = y0 + 1 + Math.floor(r() * (h - 8));
      b.rect(fx, fy, 7, 5, "book1", { val: 0.9 });
      b.vline(fx + 2, fy, 5, "ivoryLit", { val: 0.9 });
      b.hline(fx, fy + 2, 7, "ivoryLit", { val: 0.9 });
    }
    b.shade(-20, y0, 175, 2, 0.55);
  };
  crowd(ROOF_Y + 6, 26, 92);
  b.rect(-20, ROOF_Y + 32, 175, 3, "stone", { val: 0.55 }); // concourse lip
  crowd(ROOF_Y + 35, BOARD_Y - ROOF_Y - 35, 1992);
  floodTower(b, FLOOD.x, FLOOD.y - 6, 5, 3, 40);
  floodTower(b, RIM.x, RIM.y - 4, 3, 2, 30);

  // ---- pitch layer: ad boards, mown stripes in perspective, halfway line, centre circle
  const pitch = createAlbedo(175, 120, -20, BOARD_Y - 4);
  const p = painter(pitch);
  p.rect(-20, BOARD_Y, 175, 9, "woodDark", { val: 0.32 });
  p.hline(-20, BOARD_Y, 175, "metal", { val: 0.8 });
  // board panels: alternating red / dark, the brand panel stays dark so its text reads
  for (let x = -20, i = 0; x < 155; x += 34, i++) p.rect(x + 1, BOARD_Y + 1, 32, 7, i % 2 ? "book1" : "screen", { val: i % 2 ? 0.7 : 0.4 });
  for (let y = PITCH_Y; y < BOARD_Y + 116; y++) {
    const depth = (y - PITCH_Y) / 100;
    const band = Math.floor(Math.sqrt(Math.max(0, y - PITCH_Y)) * 1.6) % 2;
    p.hline(-20, y, 175, "leaf", { val: 0.62 + band * 0.1 + depth * 0.08, jitter: 0.07, seed: y });
  }
  p.shade(-20, PITCH_Y, 175, 3, 0.55); // contact shadow under the boards
  p.hline(-20, HERO.y, 175, "ivoryLit", { val: 0.6 });
  ellipseRing(p, HERO.x, HERO.y, 34, 9, { val: 0.6 });
  p.disc(HERO.x, HERO.y, 1, "ivoryLit", { val: 0.7 });
  // hero contact shadow, thrown away from the floodlight (down-right)
  for (let y = 0; y < 5; y++) p.shade(HERO.x - 7 + y, HERO.y - 1 + y, 18, 1, 0.45 + y * 0.1);

  // ---- near layer: photographers' heads and a lens, out of focus at the bottom corners
  const near = createAlbedo(175, 50, -20, 200);
  const n = painter(near);
  for (const [cx, cy, r] of [[-4, 226, 13], [14, 232, 11], [118, 230, 12], [138, 224, 14]] as const) {
    n.disc(cx, cy, r, "woodDark", { val: 0.22 });
    n.rect(cx - r - 2, cy + r - 4, r * 2 + 4, 20, "woodDark", { val: 0.18 });
  }
  n.rect(100, 212, 12, 9, "metal", { val: 0.35 });
  n.disc(98, 216, 4, "metal", { val: 0.5 });
  return { back, pitch, near };
};
