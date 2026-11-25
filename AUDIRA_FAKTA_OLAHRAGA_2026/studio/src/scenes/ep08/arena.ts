// EP08 shared set (copied from EP01) — PIXELSTORY indoor badminton arena, Rio 2016 (generic: no real venue signage).
// Painted once into albedo layers (back / court / near) and relit per frame.
// Set coordinates are art px on the 1080 × 1920 stage (8 screen px per art px → 135 × 240).
import { rng } from "../../kits/pixelstory/core/noise.ts";
import { createAlbedo, painter } from "../../kits/pixelstory/environment/albedo.ts";

export const COURT_GREEN = "#2BD46A";
export const ROOF_Y = 58;
export const BOARD_Y = 116;
export const FLOOR_Y = 124;
export const BASE_Y = 128; // far baseline
export const NET_Y = 150; // net foot line
export const HERO = { x: 60, y: 190 };
export const RIVAL = { x: 40, y: 136 };
export const SPOT = { x: 62, y: 2 };
export const RIM = { x: 128, y: 30 };

export type P = ReturnType<typeof painter>;

/** Half width of the court at screen row y (simple perspective, centre x 67.5). */
export const courtHalf = (y: number) => 34 + (y - BASE_Y) * 0.46;
export const CX = 67.5;

const lightBank = (p: P, x: number, y: number, cols: number) => {
  const w = cols * 3 + 1;
  p.rect(x - w / 2, y - 1, w, 5, "metal", { val: 0.28 });
  for (let c = 0; c < cols; c++) p.rect(x - w / 2 + 1 + c * 3, y, 2, 2, "ivoryLit", { val: 1, emit: 0.95 });
};

export const buildArena = () => {
  // ---- back layer: dark roof with trusses and light banks, crowd tiers with red-white flags, ad boards
  const back = createAlbedo(175, 140, -20, -10);
  const b = painter(back);
  for (let y = -10; y < ROOF_Y; y++) b.hline(-20, y, 175, "sky", { val: 0.16 + (y / ROOF_Y) * 0.18, jitter: 0.05, seed: 11 });
  // roof trusses: diagonal steel lattice, barely lit
  for (let x = -20; x < 160; x += 18) {
    b.line(x, -6, x + 9, 20, "metal", { val: 0.32 });
    b.line(x + 18, -6, x + 9, 20, "metal", { val: 0.32 });
  }
  b.hline(-20, 20, 175, "metal", { val: 0.42 });
  b.hline(-20, -6, 175, "metal", { val: 0.36 });
  lightBank(b, SPOT.x, SPOT.y, 7);
  lightBank(b, 14, 10, 4);
  lightBank(b, 112, 10, 4);
  // fascia
  b.rect(-20, ROOF_Y, 175, 4, "metal", { val: 0.32 });
  b.hline(-20, ROOF_Y + 3, 175, "metal", { val: 0.7 });
  const crowd = (y0: number, h: number, seed: number) => {
    b.rect(-20, y0, 175, h, "stone", { val: 0.3 });
    const r = rng(seed);
    for (let y = y0 + 1; y < y0 + h - 1; y += 2)
      for (let x = -20; x < 155; x++) {
        const v = r();
        if (v < 0.3) b.put(x, y, "book1", { val: 0.72 + r() * 0.3 });
        else if (v < 0.55) b.put(x, y, "ivoryLit", { val: 0.5 + r() * 0.25 });
        else if (v < 0.68) b.put(x, y, "plaster", { val: 0.5 });
      }
    // red-over-white flags held above heads (Merah Putih)
    for (let k = 0; k < 5; k++) {
      const fx = 2 + Math.floor(r() * 128);
      const fy = y0 + 1 + Math.floor(r() * (h - 8));
      b.rect(fx, fy, 8, 3, "book1", { val: 0.95 });
      b.rect(fx, fy + 3, 8, 3, "ivoryLit", { val: 0.92 });
      b.vline(fx - 1, fy, 9, "metal", { val: 0.5 });
    }
    b.shade(-20, y0, 175, 2, 0.55);
  };
  crowd(ROOF_Y + 4, 24, 41);
  b.rect(-20, ROOF_Y + 28, 175, 3, "stone", { val: 0.5 });
  crowd(ROOF_Y + 31, BOARD_Y - ROOF_Y - 31, 1992);

  // ---- court layer: ad boards, wooden floor, green court mat in perspective, lines, net, far player shadow
  const court = createAlbedo(175, 130, -20, BOARD_Y - 2);
  const c = painter(court);
  c.rect(-20, BOARD_Y, 175, 8, "woodDark", { val: 0.3 });
  c.hline(-20, BOARD_Y, 175, "metal", { val: 0.8 });
  // panels: alternating red / dark; the brand panel (left) stays dark so its text reads
  for (let x = -20, i = 0; x < 155; x += 36, i++) c.rect(x + 1, BOARD_Y + 1, 34, 6, i % 2 ? "book1" : "screen", { val: i % 2 ? 0.7 : 0.38 });
  // wooden floor
  for (let y = FLOOR_Y; y < 245; y++) c.hline(-20, y, 175, "wood", { val: 0.5 + ((y - FLOOR_Y) / 120) * 0.14, jitter: 0.06, seed: y });
  for (let x = -20; x < 155; x += 9) c.vline(x, FLOOR_Y, 121, "wood", { val: 0.42 });
  c.shade(-20, FLOOR_Y, 175, 3, 0.55);
  // green court mat
  for (let y = BASE_Y - 2; y < 245; y++) {
    const h = courtHalf(y) + 3;
    c.hline(Math.round(CX - h), y, Math.round(h * 2), "leaf", { val: 0.7 + ((y - BASE_Y) / 120) * 0.1, jitter: 0.05, seed: y * 7 });
  }
  // lines: baselines, sidelines, short service lines, centre line
  const line = (y: number) => c.hline(Math.round(CX - courtHalf(y)), y, Math.round(courtHalf(y) * 2), "ivoryLit", { val: 0.85 });
  line(BASE_Y);
  line(NET_Y - 7);
  line(NET_Y + 12);
  line(236);
  for (let y = BASE_Y; y < 245; y++) {
    c.put(Math.round(CX - courtHalf(y)), y, "ivoryLit", { val: 0.85 });
    c.put(Math.round(CX + courtHalf(y)), y, "ivoryLit", { val: 0.85 });
    c.put(Math.round(CX - courtHalf(y) + 3 + (y - BASE_Y) * 0.03), y, "ivoryLit", { val: 0.7 });
    c.put(Math.round(CX + courtHalf(y) - 3 - (y - BASE_Y) * 0.03), y, "ivoryLit", { val: 0.7 });
  }
  for (let y = NET_Y + 12; y < 236; y++) c.put(Math.round(CX), y, "ivoryLit", { val: 0.8 });
  for (let y = BASE_Y; y < NET_Y - 7; y++) c.put(Math.round(CX), y, "ivoryLit", { val: 0.8 });
  // net: posts at the sidelines, dark mesh, white tape on top
  const nh = courtHalf(NET_Y) + 2;
  const nl = Math.round(CX - nh);
  const nr = Math.round(CX + nh);
  c.rect(nl - 1, NET_Y - 15, 2, 15, "metal", { val: 0.7 });
  c.rect(nr - 1, NET_Y - 15, 2, 15, "metal", { val: 0.7 });
  for (let y = NET_Y - 13; y < NET_Y - 4; y++)
    for (let x = nl + 1; x < nr; x++) if ((x + y) % 2 === 0) c.put(x, y, "metal", { val: 0.22 });
  c.hline(nl + 1, NET_Y - 14, nr - nl - 1, "ivoryLit", { val: 0.95 });
  c.shade(nl, NET_Y, nr - nl, 1, 0.35);
  // contact shadows: rival (far court) and hero, thrown down-right from the overhead spot
  for (let y = 0; y < 2; y++) c.shade(RIVAL.x - 3 + y, RIVAL.y + y, 8, 1, 0.45);
  for (let y = 0; y < 5; y++) c.shade(HERO.x - 9 + y, HERO.y - 1 + y, 22, 1, 0.45 + y * 0.1);

  // ---- near layer: out-of-focus line judge (right) and shuttle tube (left), bottom corners
  const near = createAlbedo(175, 50, -20, 200);
  const n = painter(near);
  n.rect(122, 222, 30, 34, "woodDark", { val: 0.17 });
  n.rect(126, 214, 26, 9, "woodDark", { val: 0.2 });
  n.rect(-14, 214, 9, 34, "book3", { val: 0.42 });
  n.disc(-10, 214, 5, "ivoryLit", { val: 0.5 });
  return { back, court, near };
};
