// EP22 sets, painted once into albedo (material + value) and relit per frame.
// Set coordinates are art px (8 screen px each); the visible frame at rest is 0..135 × 0..240.
// Subjects stay above art row 160 so the caption band (1290–1540 = art 161–192) never covers them;
// art rows 192–240 are filled with bright near-layer props (no empty dark bottoms: PIXELSTORY lesson EP05/EP06).
//   bedroom()     A / OUT  night window + poster (back), bed + nightstand + lamp (mid), blanket fold + slippers (near)
//   toyShop()     B        pegboard of digital eggs + shop sign (back), glass counter + till (mid), queue floor (near)
//   classroom()   D        chalkboard + daylight window (back), school desks (mid), front desk + books (near)
//   petCemetery() D2       dusk sky + hills (back), small graves + flowers (mid), bright grass (near)
//   stage()       E1       red curtain (back), stage floor + trophy stand (mid), podium (front), audience seats (near)
//   warehouse()   E2       copied from EP06: unsold boxes on shelves
//   office()      F        copied from EP06: daylight office
import { rng } from "../../kits/pixelstory/core/noise.ts";
import { createAlbedo, painter } from "../../kits/pixelstory/environment/albedo.ts";
import { deskLamp, floor, nightWindow, pothos, rug } from "../../kits/pixelstory/environment/props.ts";

type P = ReturnType<typeof painter>;

/** Generic box: coloured body, top rim, blank paper label band (no names, no logos). */
const box = (p: P, x: number, y: number, w: number, h: number, mat: "book1" | "book2" | "book3" | "teal", v = 0.6) => {
  p.rect(x, y, w, h, mat, { val: v, jitter: 0.04, seed: x * 3 + y });
  p.hline(x, y, w, mat, { val: v + 0.25, ny: -1 });
  p.rect(x + 1, y + Math.floor(h * 0.55), w - 2, Math.max(2, Math.floor(h * 0.18)), "paper", { val: 0.78 });
  p.vline(x + w - 1, y, h, mat, { val: v - 0.25 });
};

/** Tiny painted digital egg (for the shop pegboard and shelves): oval shell, dark LCD, hook. */
type EggMat = "book1" | "book2" | "teal" | "ivoryLit" | "paper";
const miniEgg = (p: P, cx: number, cy: number, mat: EggMat, seed: number) => {
  p.vline(cx, cy - 7, 2, "metal", { val: 0.7 });
  p.disc(cx, cy, 3.6, mat, { val: 0.62, jitter: 0.04, seed });
  p.hline(cx - 2, cy - 3, 4, mat, { val: 0.92, ny: -1 });
  p.rect(cx - 1, cy - 1, 3, 2, "teal", { val: 0.75, emit: 0.25 });
  p.put(cx, cy + 2, mat, { val: 0.3 });
};

// ---------------------------------------------------------------- bedroom (A, OUT)
export const BED = {
  FLOOR: 152,
  BED_TOP: 134,
  WIN: { x: 2, y: 18, w: 50, h: 58 },
  POSTER: { x: 60, y: 26, w: 26, h: 34 },
  STAND: { x: 100, y: 120, w: 32 },
  DRAWER: { x: 104, y: 129, w: 24, h: 8 },
  KID: { x: 84, y: 152 },
};
export const bedroom = () => {
  const back = createAlbedo(260, 240, -60, -70);
  const b = painter(back);
  // wallpaper with a soft vertical stripe
  for (let y = -70; y < BED.FLOOR; y++) b.hline(-60, y, 260, "plaster", { val: 0.42 + (y / 230) * 0.1, jitter: 0.04, seed: 4 });
  for (let x = -60; x < 200; x += 9) b.vline(x, -70, BED.FLOOR + 70, "plaster", { val: 0.36 });
  for (let x = -56; x < 200; x += 9) for (let y = -66; y < BED.FLOOR; y += 9) b.put(x, y, "ivoryLit", { val: 0.55 });
  b.rect(-60, BED.FLOOR - 8, 260, 8, "woodDark", { val: 0.5, ny: -1 });
  nightWindow(b, BED.WIN.x, BED.WIN.y, BED.WIN.w, BED.WIN.h, 22);
  // generic space poster (no characters)
  const Po = BED.POSTER;
  b.rect(Po.x, Po.y, Po.w, Po.h, "sky", { val: 0.26 });
  b.rect(Po.x, Po.y, Po.w, 2, "paper", { val: 0.85 });
  b.disc(Po.x + 13, Po.y + 17, 6, "amberLamp", { val: 0.7, emit: 0.3 });
  b.ring(Po.x + 13, Po.y + 17, 9, "paper", { val: 0.7 });
  for (const [sx, sy] of [[Po.x + 4, Po.y + 6], [Po.x + 21, Po.y + 9], [Po.x + 5, Po.y + 29], [Po.x + 22, Po.y + 28]]) b.put(sx, sy, "ivoryLit", { val: 0.95, emit: 0.5 });
  floor(b, -60, BED.FLOOR, 260, 90, 29);

  const mid = createAlbedo(260, 150, -60, 70);
  const m = painter(mid);
  // bed: headboard left, mattress, checked blanket, pillow
  m.rect(-50, 100, 10, BED.FLOOR - 100, "wood", { val: 0.55, jitter: 0.05, seed: 2 });
  m.hline(-50, 100, 10, "wood", { val: 0.85, ny: -1 });
  m.rect(-40, BED.BED_TOP, 128, 6, "ivoryLit", { val: 0.62, ny: -1 });
  for (let y = BED.BED_TOP - 4; y < BED.BED_TOP + 10; y++)
    for (let x = -40; x < 86; x++) {
      const check = (Math.floor((x + 40) / 6) + Math.floor((y - BED.BED_TOP) / 5)) % 2;
      m.put(x, y, check ? "teal" : "ivoryLit", { val: check ? 0.62 : 0.78, jitter: 0.03, seed: x * 7 + y });
    }
  m.hline(-40, BED.BED_TOP - 4, 126, "ivoryLit", { val: 0.95, ny: -1 });
  m.rect(-40, BED.BED_TOP + 10, 126, BED.FLOOR - BED.BED_TOP - 10, "woodDark", { val: 0.32 });
  m.shade(-40, BED.BED_TOP + 10, 126, 2, 0.5);
  m.disc(-26, BED.BED_TOP - 7, 6, "ivoryLit", { val: 0.85 });
  m.rect(-32, BED.BED_TOP - 8, 22, 6, "ivoryLit", { val: 0.86, ny: -1 });
  // nightstand + lamp
  const S = BED.STAND;
  m.rect(S.x, S.y, S.w, 3, "wood", { val: 0.72, ny: -1 });
  m.rect(S.x + 1, S.y + 3, S.w - 2, BED.FLOOR - S.y - 3, "wood", { val: 0.5, jitter: 0.05, seed: 8 });
  const D = BED.DRAWER;
  m.rect(D.x, D.y, D.w, D.h, "wood", { val: 0.62 });
  m.hline(D.x, D.y, D.w, "wood", { val: 0.82, ny: -1 });
  m.shade(D.x, D.y + D.h, D.w, 1, 0.5);
  m.rect(S.x + 1, BED.FLOOR - 6, S.w - 2, 2, "woodDark", { val: 0.28 });
  const lamp = deskLamp(m, S.x + 22, S.y);
  // a book and an alarm clock on the stand
  m.rect(S.x + 3, S.y - 3, 10, 3, "book1", { val: 0.6, ny: -1 });
  m.disc(S.x + 8, S.y - 6, 2.5, "book2", { val: 0.7 });

  const near = createAlbedo(260, 80, -60, 184);
  const n = painter(near);
  // fallen blanket fold across the floor (bright, textured) + slippers
  for (let y = 196; y < 240; y++) {
    const x0 = -60 + Math.round(Math.sin(y * 0.21) * 4);
    for (let x = x0; x < 200 - (y - 196); x++) {
      const check = (Math.floor((x + 60) / 9) + Math.floor((y - 196) / 7)) % 2;
      n.put(x, y, check ? "teal" : "ivoryLit", { val: (check ? 0.58 : 0.74) + (y - 196) * 0.002, jitter: 0.04, seed: x + y * 13 });
    }
  }
  for (let k = 0; k < 4; k++) n.line(-60, 200 + k * 10, 100 - k * 10, 198 + k * 11, "ivoryLit", { val: 0.42 });
  for (const sx of [128, 146]) {
    n.disc(sx, 222, 6, "book1", { val: 0.6 });
    n.hline(sx - 5, 217, 10, "book1", { val: 0.85, ny: -1 });
  }
  rug(n, 150, 236, 40, 6);
  return { back, mid, near, lamp };
};

// ---------------------------------------------------------------- toy shop, Japan 1996 (B)
export const SHOP = {
  FLOOR: 160,
  COUNTER: 124,
  PEG: { x: -2, y: 22, w: 140, h: 76 },
  SIGN: { x: 16, y: 2, w: 104, h: 14 },
  HERO: { x: 68, y: 66 },
};
const EGG_MATS: EggMat[] = ["book1", "teal", "book2", "ivoryLit", "paper"];
export const toyShop = () => {
  const back = createAlbedo(300, 250, -80, -70);
  const b = painter(back);
  for (let y = -70; y < SHOP.FLOOR; y++) b.hline(-80, y, 300, "plaster", { val: 0.5 + (y / 230) * 0.08, jitter: 0.04, seed: 6 });
  // sign board (lettering in HTML)
  const Sg = SHOP.SIGN;
  b.rect(Sg.x - 2, Sg.y - 2, Sg.w + 4, Sg.h + 4, "wood", { val: 0.5 });
  b.rect(Sg.x, Sg.y, Sg.w, Sg.h, "book1", { val: 0.6 });
  b.hline(Sg.x, Sg.y, Sg.w, "book1", { val: 0.85, ny: -1 });
  // pegboard with rows of digital eggs on hooks
  const Pg = SHOP.PEG;
  b.rect(Pg.x - 2, Pg.y - 2, Pg.w + 4, Pg.h + 4, "wood", { val: 0.55, ny: -1 });
  b.rect(Pg.x, Pg.y, Pg.w, Pg.h, "paper", { val: 0.6, jitter: 0.03, seed: 9 });
  for (let y = Pg.y + 2; y < Pg.y + Pg.h; y += 4) for (let x = Pg.x + 2; x < Pg.x + Pg.w; x += 4) b.put(x, y, "paper", { val: 0.38 });
  const r = rng(52);
  for (let row = 0; row < 5; row++)
    for (let col = 0; col < 12; col++) {
      const cx = Pg.x + 7 + col * 11 + (row % 2 ? 5 : 0);
      const cy = Pg.y + 9 + row * 14;
      if (Math.abs(cx - SHOP.HERO.x) < 9 && Math.abs(cy - SHOP.HERO.y) < 12) continue; // the hero hangs here (HTML)
      if (cx > Pg.x + Pg.w - 4) continue;
      miniEgg(b, cx, cy, EGG_MATS[Math.floor(r() * EGG_MATS.length)], row * 31 + col);
    }
  // side shelves of boxed eggs beyond the pegboard
  for (const ux of [-74, 144]) for (const sy of [30, 62, 94]) {
    b.rect(ux, sy, 54, 3, "wood", { val: 0.6, ny: -1 });
    for (let x = ux + 2; x < ux + 50; x += 9) box(b, x, sy - 14, 8, 14, (["book1", "teal", "book2"] as const)[(x + sy) % 3], 0.6);
  }
  // paper lanterns / bunting along the top
  for (let x = -76; x < 216; x += 8) b.poly([[x, -8], [x + 6, -8], [x + 3, -3]], (["book1", "book2", "teal"] as const)[((x + 80) / 8) % 3], { val: 0.75 });
  b.hline(-80, -9, 300, "paper", { val: 0.6 });
  floor(b, -80, SHOP.FLOOR, 300, 90, 25);

  const mid = createAlbedo(280, 120, -70, 100);
  const m = painter(mid);
  // glass display counter: wood top, glass front showing boxed eggs, base
  const C0 = SHOP.COUNTER;
  for (let k = 0; k < 4; k++) m.rect(-70, C0 + k, 280, 1, "wood", { val: 0.68 + k * 0.03, ny: -1, jitter: 0.05, seed: 60 + k });
  m.rect(-70, C0 + 4, 280, 24, "sky", { val: 0.3 });
  for (let x = -66; x < 206; x += 12) box(m, x, C0 + 12, 10, 14, (["book1", "teal", "book2"] as const)[((x + 66) / 12) % 3], 0.62);
  for (let k = 0; k < 24; k += 1) m.put(-60 + k * 11, C0 + 6 + (k % 3), "ivoryLit", { val: 0.95 }); // glass glints
  m.line(-40, C0 + 26, -20, C0 + 6, "ivoryLit", { val: 0.7 });
  m.line(100, C0 + 26, 118, C0 + 6, "ivoryLit", { val: 0.7 });
  m.rect(-70, C0 + 28, 280, SHOP.FLOOR - C0 - 28, "woodDark", { val: 0.42 });
  m.hline(-70, C0 + 28, 280, "wood", { val: 0.7, ny: -1 });
  // cash register (right), bag stack (left)
  m.rect(108, C0 - 14, 24, 14, "metal", { val: 0.55, jitter: 0.04, seed: 4 });
  m.hline(108, C0 - 14, 24, "metal", { val: 0.85, ny: -1 });
  m.rect(112, C0 - 20, 14, 6, "metal", { val: 0.45 });
  m.rect(114, C0 - 19, 10, 3, "teal", { val: 0.8, emit: 0.4 });
  for (let k = 0; k < 3; k++) for (let j = 0; j < 4; j++) m.rect(110 + j * 5, C0 - 11 + k * 3, 3, 2, "paper", { val: 0.8 });
  m.rect(4, C0 - 8, 18, 8, "paper", { val: 0.8, ny: -1 });
  m.rect(6, C0 - 12, 14, 4, "book1", { val: 0.6 });

  const near = createAlbedo(300, 70, -80, 190);
  const n = painter(near);
  for (let y = 190; y < 260; y++) n.hline(-80, y, 300, "wood", { val: 0.5 + ((y - 190) / 70) * 0.12, jitter: 0.06, seed: y * 5 });
  for (let y = 192; y < 260; y += 7) n.hline(-80, y, 300, "woodDark", { val: 0.35 });
  return { back, mid, near };
};

// ---------------------------------------------------------------- 90s classroom (D)
export const CLASS = {
  FLOOR: 150,
  DESK: 146,
  BOARD: { x: 4, y: 16, w: 92, h: 50 },
  WIN: { x: 104, y: 8, w: 44, h: 76 },
  PUPILS: [22, 66, 110],
  EGG: { x: 80, y: 141 },
};
export const classroom = () => {
  const back = createAlbedo(260, 240, -60, -70);
  const b = painter(back);
  for (let y = -70; y < CLASS.FLOOR; y++) b.hline(-60, y, 260, "ivoryLit", { val: 0.5 + (y / 230) * 0.08, jitter: 0.04, seed: 14 });
  b.rect(-60, 96, 260, 2, "wood", { val: 0.6, ny: -1 });
  for (let y = 98; y < CLASS.FLOOR; y++) b.hline(-60, y, 260, "teal", { val: 0.5, jitter: 0.04, seed: y });
  // chalkboard (writing in HTML)
  const Bd = CLASS.BOARD;
  b.rect(Bd.x - 3, Bd.y - 3, Bd.w + 6, Bd.h + 6, "wood", { val: 0.6, ny: -1 });
  for (let y = Bd.y; y < Bd.y + Bd.h; y++) b.hline(Bd.x, y, Bd.w, "book3", { val: 0.5 + ((y - Bd.y) / Bd.h) * 0.06, jitter: 0.05, seed: y * 3 });
  for (const [x0, y0, x1, y1] of [[Bd.x + 6, Bd.y + 40, Bd.x + 30, Bd.y + 38], [Bd.x + 50, Bd.y + 8, Bd.x + 80, Bd.y + 10]] as const) b.line(x0, y0, x1, y1, "book3", { val: 0.7 }); // smudges
  b.rect(Bd.x, Bd.y + Bd.h + 3, Bd.w, 2, "wood", { val: 0.7, ny: -1 });
  b.rect(Bd.x + 10, Bd.y + Bd.h + 2, 6, 1, "paper", { val: 0.95 });
  // daylight window
  const Wn = CLASS.WIN;
  b.rect(Wn.x - 2, Wn.y - 2, Wn.w + 4, Wn.h + 4, "ivoryLit", { val: 0.7 });
  for (let y = 0; y < Wn.h; y++) b.hline(Wn.x, Wn.y + y, Wn.w, "dusk", { val: 0.78 + (y / Wn.h) * 0.18, emit: 0.55 });
  b.vline(Wn.x + Wn.w / 2, Wn.y, Wn.h, "ivoryLit", { val: 0.75 });
  b.hline(Wn.x, Wn.y + Wn.h / 2, Wn.w, "ivoryLit", { val: 0.75 });
  // clock above the board
  b.disc(Bd.x + Bd.w / 2, -2, 5, "paper", { val: 0.9 });
  b.ring(Bd.x + Bd.w / 2, -2, 5, "metal", { val: 0.5 });
  b.vline(Bd.x + Bd.w / 2, -5, 3, "sky", { val: 0.2 });
  floor(b, -60, CLASS.FLOOR, 260, 90, 33);

  const mid = createAlbedo(260, 70, -60, 136);
  const m = painter(mid);
  // three school desks (tops at DESK), legs to the floor; pupils sit behind them (sprites drawn before this layer)
  for (const px of CLASS.PUPILS) {
    m.rect(px - 20, CLASS.DESK, 40, 3, "wood", { val: 0.72, ny: -1, jitter: 0.04, seed: px });
    m.rect(px - 19, CLASS.DESK + 3, 38, 9, "metal", { val: 0.42 });
    m.hline(px - 19, CLASS.DESK + 3, 38, "metal", { val: 0.6 });
    for (const lx of [px - 18, px + 16]) m.rect(lx, CLASS.DESK + 12, 2, 20, "metal", { val: 0.5 });
  }
  // an open notebook on the first desk
  m.rect(10, CLASS.DESK - 1, 14, 1, "paper", { val: 0.95 });

  const near = createAlbedo(260, 80, -60, 186);
  const n = painter(near);
  // the front desk, out of focus: top + book stack + pencil case
  for (let k = 0; k < 6; k++) n.rect(-60, 204 + k, 260, 1, "wood", { val: 0.66 + k * 0.02, ny: -1, jitter: 0.05, seed: 70 + k });
  n.rect(-60, 210, 260, 50, "wood", { val: 0.52, jitter: 0.05, seed: 71 });
  for (let k = 0; k < 3; k++) n.rect(96 + k, 196 - k * 5, 40 - k * 3, 5, (["book1", "teal", "book2"] as const)[k], { val: 0.66, ny: -1 });
  n.rect(-30, 199, 34, 5, "book1", { val: 0.6, ny: -1 });
  return { back, mid, near };
};

// ---------------------------------------------------------------- pet cemetery at dusk (D2)
export const CEM = { HORIZON: 112, GROUND: 140, GRAVE: { x: 56, y: 100, w: 26, h: 40 }, EGG: { x: 69, y: 134 }, SUN: { x: 104, y: 70 } };
export const petCemetery = () => {
  const back = createAlbedo(300, 260, -80, -70);
  const b = painter(back);
  for (let y = -70; y < CEM.HORIZON + 10; y++) {
    const k = (y + 70) / (CEM.HORIZON + 80);
    b.hline(-80, y, 300, "dusk", { val: 0.25 + k * 0.7, emit: 0.35 + k * 0.3 });
    if (y % 2) for (let x = -80 + (y % 4); x < 220; x += 4) b.put(x, y, "dusk", { val: 0.2 + k * 0.7, emit: 0.3 + k * 0.3 });
  }
  b.disc(CEM.SUN.x, CEM.SUN.y, 12, "amberLamp", { val: 1, emit: 1 });
  // two hill bands
  for (let x = -80; x < 220; x++) {
    const h1 = CEM.HORIZON - 14 - Math.round(Math.sin(x * 0.045) * 8 + Math.sin(x * 0.11) * 3);
    b.vline(x, h1, CEM.HORIZON + 20 - h1, "mesa", { val: 0.42 });
    const h2 = CEM.HORIZON - 2 - Math.round(Math.sin(x * 0.07 + 2) * 5);
    b.vline(x, h2, CEM.HORIZON + 20 - h2, "leaf", { val: 0.45 });
  }
  for (let x = -80; x < 220; x += 3) b.put(x, CEM.HORIZON - 14 - Math.round(Math.sin(x * 0.045) * 8 + Math.sin(x * 0.11) * 3), "dusk", { val: 0.95, emit: 0.5 });

  const mid = createAlbedo(300, 150, -80, 100);
  const m = painter(mid);
  for (let y = CEM.HORIZON + 6; y < 250; y++) m.hline(-80, y, 300, "leaf", { val: 0.55 + ((y - CEM.HORIZON) / 140) * 0.25, jitter: 0.08, seed: y * 7 });
  const r = rng(41);
  // small graves at different depths
  for (const [gx, gy, gw, gh] of [[-30, 124, 12, 14], [10, 128, 10, 12], [112, 126, 12, 14], [150, 130, 10, 11], [-60, 132, 10, 10]] as const) {
    m.rect(gx, gy, gw, gh, "stone", { val: 0.6, jitter: 0.05, seed: gx });
    m.disc(gx + gw / 2, gy, gw / 2, "stone", { val: 0.6 });
    m.hline(gx, gy - Math.floor(gw / 2) + 1, gw, "stone", { val: 0.9, ny: -1 });
    m.vline(gx + gw - 1, gy, gh, "stone", { val: 0.35 });
    m.put(gx + 2, gy + gh, "book1", { val: 0.8 });
    m.put(gx + gw - 3, gy + gh, "book2", { val: 0.85 });
  }
  // hero grave
  const G = CEM.GRAVE;
  m.rect(G.x, G.y, G.w, G.h, "stone", { val: 0.68, jitter: 0.04, seed: 3 });
  m.disc(G.x + G.w / 2, G.y, G.w / 2, "stone", { val: 0.68 });
  m.hline(G.x + 3, G.y - G.w / 2 + 1, G.w - 6, "stone", { val: 0.95, ny: -1 });
  m.vline(G.x, G.y - 4, G.h + 4, "stone", { val: 0.9, nx: -1 });
  m.vline(G.x + G.w - 1, G.y, G.h, "stone", { val: 0.38 });
  m.rect(G.x - 4, G.y + G.h - 2, G.w + 8, 4, "mesa", { val: 0.5 });
  // flowers around the hero grave
  for (let k = 0; k < 14; k++) {
    const fx = G.x - 10 + Math.floor(r() * (G.w + 20));
    const fy = G.y + G.h - 2 + Math.floor(r() * 8);
    m.vline(fx, fy, 3, "leaf", { val: 0.8 });
    m.put(fx, fy - 1, (["book1", "book2", "ivoryLit"] as const)[k % 3], { val: 0.9 });
  }

  const near = createAlbedo(300, 80, -80, 186);
  const n = painter(near);
  for (let y = 186; y < 266; y++) n.hline(-80, y, 300, "leaf", { val: 0.72 + ((y - 186) / 80) * 0.15, jitter: 0.1, seed: y * 3 });
  for (let k = 0; k < 140; k++) {
    const x = -80 + Math.floor(r() * 300);
    const y = 192 + Math.floor(r() * 60);
    n.line(x, y, x + Math.floor(r() * 5) - 2, y - 6 - Math.floor(r() * 6), "leaf", { val: 0.95 });
  }
  for (let k = 0; k < 10; k++) n.disc(-70 + k * 30 + Math.floor(r() * 10), 200 + Math.floor(r() * 30), 1.6, (["book1", "book2", "ivoryLit"] as const)[k % 3], { val: 0.9 });
  return { back, mid, near };
};

// ---------------------------------------------------------------- awards stage (E1)
export const STG = { FLOOR: 150, PODIUM: { x: 78, y: 112, w: 32, h: 38 }, SPEAKER: { x: 100, y: 150 }, TROPHY: { x: 34, y: 112 } };
export const stage = () => {
  const back = createAlbedo(300, 240, -80, -70);
  const b = painter(back);
  // red curtain with folds
  for (let x = -80; x < 220; x++) {
    const f = (Math.sin(x * 0.42) + 1) / 2;
    b.vline(x, -60, STG.FLOOR + 60, "book1", { val: 0.42 + f * 0.42, jitter: 0.03, seed: x });
  }
  for (let x = -80; x < 220; x++) b.vline(x, -70, 12, "book2", { val: 0.7 + ((Math.sin(x * 0.3) + 1) / 2) * 0.2 });
  for (let x = -80; x < 220; x += 6) b.poly([[x, -58], [x + 6, -58], [x + 3, -53]], "book2", { val: 0.85 });
  // stage floor
  for (let y = STG.FLOOR; y < 190; y++) b.hline(-80, y, 300, "wood", { val: 0.55 + ((y - STG.FLOOR) / 40) * 0.15, jitter: 0.06, seed: y });
  for (let y = STG.FLOOR + 3; y < 190; y += 5) b.hline(-80, y, 300, "woodDark", { val: 0.4 });
  b.hline(-80, STG.FLOOR, 300, "wood", { val: 0.9, ny: -1 });

  const mid = createAlbedo(120, 60, 0, 100);
  const m = painter(mid);
  // trophy stand (the trophy itself is HTML)
  const T = STG.TROPHY;
  m.rect(T.x - 8, T.y, 16, STG.FLOOR - T.y, "paper", { val: 0.65, jitter: 0.04, seed: 5 });
  m.hline(T.x - 8, T.y, 16, "paper", { val: 0.95, ny: -1 });
  m.vline(T.x + 7, T.y, STG.FLOOR - T.y, "paper", { val: 0.4 });

  // podium sits in front of the speaker sprite
  const podium = createAlbedo(50, 50, 70, 108);
  const pd = painter(podium);
  const Pd = STG.PODIUM;
  pd.rect(Pd.x - 2, Pd.y, Pd.w + 4, 4, "wood", { val: 0.75, ny: -1 });
  pd.rect(Pd.x, Pd.y + 4, Pd.w, Pd.h - 4, "woodDark", { val: 0.5, jitter: 0.04, seed: 12 });
  pd.vline(Pd.x, Pd.y + 4, Pd.h - 4, "woodDark", { val: 0.75, nx: -1 });
  pd.vline(Pd.x + Pd.w - 1, Pd.y + 4, Pd.h - 4, "woodDark", { val: 0.3 });
  pd.rect(Pd.x + 6, Pd.y + 10, Pd.w - 12, 10, "book2", { val: 0.75 });
  pd.line(Pd.x + 10, Pd.y, Pd.x + 16, Pd.y - 8, "metal", { val: 0.7 }); // microphone
  pd.disc(Pd.x + 16, Pd.y - 9, 1.5, "metal", { val: 0.8 });

  const near = createAlbedo(300, 80, -80, 186);
  const n = painter(near);
  // audience seat backs (heads are sprites above this)
  for (let y = 214; y < 266; y++) n.hline(-80, y, 300, "book1", { val: 0.45 + ((y - 214) / 52) * 0.1, jitter: 0.05, seed: y });
  for (let x = -76; x < 220; x += 26) {
    n.rect(x, 210, 22, 8, "book1", { val: 0.72, jitter: 0.04, seed: x });
    n.hline(x, 210, 22, "book1", { val: 0.95, ny: -1 });
  }
  return { back, mid, podium, near };
};

// ---------------------------------------------------------------- warehouse (E2), copied from EP06
export const WH = { FLOOR: 172, TABLE: 140, BOX: { x: 44, y: 106, w: 48, h: 34 }, LAMPS: [20, 115] };
export const warehouse = () => {
  const back = createAlbedo(300, 260, -80, -70);
  const b = painter(back);
  for (let y = -70; y < WH.FLOOR; y++) b.hline(-80, y, 300, "plaster", { val: 0.3 + (y / 240) * 0.1, jitter: 0.05, seed: 3 });
  for (let x = -80; x < 220; x += 14) b.vline(x, -70, WH.FLOOR + 70, "plaster", { val: 0.2 });
  // three shelving units full of identical boxes
  const mats = ["book1", "book2", "book3", "teal"] as const;
  const r = rng(77);
  for (const ux of [-74, -10, 54, 118, 182]) {
    for (const sy of [0, 34, 68, 102, 136]) {
      b.rect(ux, sy, 56, 3, "metal", { val: 0.45 });
      b.hline(ux, sy, 56, "metal", { val: 0.75, ny: -1 });
      b.shade(ux, sy + 3, 56, 1, 0.5);
      if (sy === 136) continue;
      let x = ux + 2;
      const mat = mats[Math.floor(r() * mats.length)];
      while (x < ux + 50) {
        const w = 7;
        box(b, x, sy - 22, w, 22, mat, 0.45 + r() * 0.2);
        x += w + 1;
      }
    }
    b.vline(ux, -10, WH.FLOOR + 10, "metal", { val: 0.5 });
    b.vline(ux + 55, -10, WH.FLOOR + 10, "metal", { val: 0.35 });
  }
  for (const lx of WH.LAMPS) {
    b.vline(lx, -70, 56, "metal", { val: 0.4 });
    b.poly([[lx - 7, -6], [lx + 7, -6], [lx + 3, -14], [lx - 3, -14]], "metal", { val: 0.5 });
    b.hline(lx - 5, -6, 11, "amberLamp", { val: 0.9, emit: 0.85 });
  }
  floor(b, -80, WH.FLOOR, 300, 90, 23);

  const mid = createAlbedo(220, 120, -40, 90);
  const m = painter(mid);
  // stamping table
  for (let k = 0; k < 5; k++) m.rect(4, WH.TABLE + k, 128, 1, "wood", { val: 0.62 + k * 0.02, ny: -1, jitter: 0.06, seed: 40 + k });
  m.rect(4, WH.TABLE + 5, 128, 3, "woodDark", { val: 0.35 });
  for (const lx of [8, 124]) m.rect(lx, WH.TABLE + 8, 4, WH.FLOOR - WH.TABLE - 8, "woodDark", { val: 0.3 });
  m.shade(4, WH.TABLE + 8, 128, 2, 0.5);
  // hero box: big, blank label band
  const B = WH.BOX;
  m.rect(B.x, B.y, B.w, B.h, "book1", { val: 0.6, jitter: 0.04, seed: 5 });
  m.hline(B.x, B.y, B.w, "book1", { val: 0.9, ny: -1 });
  m.vline(B.x + B.w - 1, B.y, B.h, "book1", { val: 0.3 });
  m.rect(B.x + 3, B.y + 4, B.w - 6, 12, "sky", { val: 0.16 });
  m.rect(B.x + 3, B.y + 20, B.w - 6, 9, "paper", { val: 0.82 });
  // stack of boxes left, ink pad + stamp right
  for (let k = 0; k < 3; k++) box(m, 10 + k * 2, WH.TABLE - 14 - k * 13, 26, 13, k % 2 ? "book3" : "book2", 0.55);
  m.rect(104, WH.TABLE - 3, 16, 3, "sky", { val: 0.25 });
  m.rect(106, WH.TABLE - 4, 12, 1, "book1", { val: 0.4 });

  const near = createAlbedo(300, 80, -80, 188);
  const n = painter(near);
  for (const [cx, cy, w] of [[-40, 200, 54], [94, 206, 60]] as const) {
    n.rect(cx, cy, w, 40, "wood", { val: 0.58, jitter: 0.06, seed: cx + 99 });
    n.hline(cx, cy, w, "wood", { val: 0.9, ny: -1 });
    n.line(cx, cy, cx + w, cy + 40, "woodDark", { val: 0.25 });
    n.line(cx + w, cy, cx, cy + 40, "woodDark", { val: 0.25 });
  }
  n.rect(-80, 236, 300, 30, "wood", { val: 0.42, jitter: 0.06, seed: 5 });
  return { back, mid, near };
};

// ---------------------------------------------------------------- office (F), copied from EP06
export const OFF = { FLOOR: 156, DESK: 124, WIN: { x: 66, y: 6, w: 66, h: 72 }, BOARD: { x: -14, y: 22, w: 66, h: 50 }, STAND: { x: 106, y: 156 } };
export const office = () => {
  const back = createAlbedo(260, 240, -60, -70);
  const b = painter(back);
  for (let y = -70; y < OFF.FLOOR; y++) b.hline(-60, y, 260, "plaster", { val: 0.5 + (y / 230) * 0.08, jitter: 0.04, seed: 11 });
  // daylight window with blinds
  const Wn = OFF.WIN;
  b.rect(Wn.x - 2, Wn.y - 2, Wn.w + 4, Wn.h + 4, "metal", { val: 0.5 });
  for (let y = 0; y < Wn.h; y++) b.hline(Wn.x, Wn.y + y, Wn.w, "dusk", { val: 0.7 + (y / Wn.h) * 0.2, emit: 0.45 });
  for (let y = Wn.y + 3; y < Wn.y + Wn.h; y += 5) b.hline(Wn.x, y, Wn.w, "paper", { val: 0.7 });
  // whiteboard (drawing in HTML)
  const Bd = OFF.BOARD;
  b.rect(Bd.x - 2, Bd.y - 2, Bd.w + 4, Bd.h + 4, "metal", { val: 0.6 });
  b.rect(Bd.x, Bd.y, Bd.w, Bd.h, "paper", { val: 0.9, jitter: 0.02, seed: 4 });
  b.rect(Bd.x, Bd.y + Bd.h + 2, Bd.w, 2, "metal", { val: 0.5 });
  // carpet floor
  for (let y = OFF.FLOOR; y < 170; y++) b.hline(-60, y, 260, "book3", { val: 0.42 + ((y - OFF.FLOOR) / 14) * 0.08, jitter: 0.08, seed: y });
  b.rect(-60, OFF.FLOOR - 3, 260, 3, "woodDark", { val: 0.5, ny: -1 });

  const mid = createAlbedo(240, 140, -50, 90);
  const m = painter(mid);
  for (let y = 170; y < 230; y++) m.hline(-50, y, 240, "book3", { val: 0.46 + ((y - 170) / 60) * 0.06, jitter: 0.08, seed: y });
  for (let y = 171; y < 230; y += 2) for (let x = -50 + (y % 4); x < 190; x += 4) m.put(x, y, "book3", { val: 0.38 });
  // director's desk: top, modesty panel, drawers
  for (let k = 0; k < 5; k++) m.rect(-6, OFF.DESK + k, 92, 1, "woodDark", { val: 0.62 + k * 0.02, ny: -1, jitter: 0.05, seed: 50 + k });
  m.rect(-6, OFF.DESK + 5, 92, OFF.FLOOR - OFF.DESK - 5, "woodDark", { val: 0.36, jitter: 0.04, seed: 51 });
  for (let k = 0; k < 3; k++) m.hline(60, OFF.DESK + 12 + k * 9, 22, "woodDark", { val: 0.2 });
  m.rect(4, OFF.DESK - 2, 22, 2, "paper", { val: 0.85 });
  m.rect(30, OFF.DESK - 5, 12, 5, "sky", { val: 0.25 }); // phone
  m.rect(32, OFF.DESK - 7, 8, 2, "sky", { val: 0.35 });

  const near = createAlbedo(260, 80, -60, 180);
  const n = painter(near);
  pothos(n, -36, 204, 7, 20);
  n.rect(-46, 204, 22, 30, "book2", { val: 0.7 });
  n.rect(100, 196, 50, 40, "sky", { val: 0.5 }); // chair back, out of focus
  n.hline(100, 196, 50, "sky", { val: 0.8, ny: -1 });
  n.rect(-60, 236, 260, 30, "wood", { val: 0.5, jitter: 0.06, seed: 6 });
  return { back, mid, near };
};
