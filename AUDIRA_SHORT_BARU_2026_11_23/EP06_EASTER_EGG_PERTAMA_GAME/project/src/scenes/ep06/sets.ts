// EP06 sets, painted once into albedo (material + value) and relit per frame.
// Set coordinates are art px (8 screen px each); the visible frame at rest is 0..135 × 0..240.
// Subjects stay above art row 160 so the caption band (1290–1540 = art 161–192) never covers them;
// art rows 192–240 are filled with near-layer props (no empty bottoms).
//   secretRoom() A/D2/OUT  brick chamber: wall text recess (back), stone floor + the gray dot (mid), rubble (near)
//   warehouse()  B         cartridge boxes on shelves (back), stamping table + blank-label box (mid), crates (near)
//   devDesk()    C         night window + shelf (back), desk + CRT + lamp (mid), manuals + cable (near)
//   mazeMap()    D         top-down castle map: black castle, catacomb, gold castle, corridor (one layer)
//   teenRoom()   E1        wallpaper + poster + window (back), wood TV + console (mid), rug + cartridges (near)
//   office()     E2        daylight blinds + whiteboard (back), director's desk (mid), plant + chair (near)
//   museum()     F         dark gallery wall with two framed panels + spots (back), timeline rail (mid), rope posts (near)
import { rng } from "../../kits/pixelstory/core/noise.ts";
import { createAlbedo, painter } from "../../kits/pixelstory/environment/albedo.ts";
import { books, deskLamp, floor, keyboard, mug, nightWindow, pothos, rug, shelf } from "../../kits/pixelstory/environment/props.ts";

type P = ReturnType<typeof painter>;

/** Brick wall: running bond, dark mortar, a few lighter bricks. */
const bricks = (p: P, x0: number, y0: number, w: number, h: number, seed: number, base = 0.3) => {
  const r = rng(seed);
  for (let y = y0; y < y0 + h; y++) p.hline(x0, y, w, "stone", { val: base + ((y - y0) / h) * 0.1, jitter: 0.06, seed: y + seed });
  for (let row = 0, y = y0; y < y0 + h; y += 6, row++) {
    p.hline(x0, y, w, "stone", { val: base * 0.42 });
    for (let x = x0 + (row % 2 ? 6 : 0); x < x0 + w; x += 12) {
      p.vline(x, y + 1, 5, "stone", { val: base * 0.42 });
      if (r() < 0.18) p.rect(x + 1, y + 1, 11, 5, "stone", { val: base + 0.1, jitter: 0.05, seed: x * 7 + y });
      p.hline(x + 1, y + 1, 11, "stone", { val: base + 0.08, ny: -1 });
    }
  }
};

/** Stone floor tiles that grow toward the camera, dithered. */
const tiles = (p: P, x0: number, y0: number, w: number, h: number, seed: number, mat: "stone" | "plaster" = "stone", base = 0.34) => {
  let y = y0;
  let k = 0;
  while (y < y0 + h) {
    const th = 3 + Math.floor(k * 1.2);
    for (let yy = 0; yy < th && y + yy < y0 + h; yy++) p.hline(x0, y + yy, w, mat, { val: base + (k * 0.012) + (yy === 0 ? 0.05 : 0), jitter: 0.07, seed: seed + y + yy });
    p.hline(x0, y, w, mat, { val: base * 0.5 });
    const step = 10 + k * 3;
    for (let x = x0 + ((k * 5) % step); x < x0 + w; x += step) p.vline(x, y, th, mat, { val: base * 0.5 });
    for (let yy = 1; yy < th; yy += 2) for (let x = x0 + (yy % 4); x < x0 + w; x += 4) p.put(x, y + yy, mat, { val: base - 0.05 });
    y += th;
    k++;
  }
};

/** Generic game box: coloured body, top rim, blank paper label band (no names, no logos). */
const box = (p: P, x: number, y: number, w: number, h: number, mat: "book1" | "book2" | "book3" | "teal", v = 0.6) => {
  p.rect(x, y, w, h, mat, { val: v, jitter: 0.04, seed: x * 3 + y });
  p.hline(x, y, w, mat, { val: v + 0.25, ny: -1 });
  p.rect(x + 1, y + Math.floor(h * 0.55), w - 2, Math.max(2, Math.floor(h * 0.18)), "paper", { val: 0.78 });
  p.vline(x + w - 1, y, h, mat, { val: v - 0.25 });
};

// ---------------------------------------------------------------- secret room (A, D2, OUT)
export const ROOM = { FLOOR: 130, TEXT: { x: 8, y: 70, w: 119, h: 36 }, DOT: { x: 67, y: 148 }, PLAQUE: { x: 45, y: 113, w: 45, h: 9 } };
export const secretRoom = () => {
  const back = createAlbedo(260, 220, -60, -70);
  const b = painter(back);
  bricks(b, -60, -70, 260, ROOM.FLOOR + 70, 6, 0.28);
  // recess for the wall text: deep frame, dark panel
  const T = ROOM.TEXT;
  b.rect(T.x - 3, T.y - 3, T.w + 6, T.h + 6, "stone", { val: 0.12 });
  b.rect(T.x, T.y, T.w, T.h, "sky", { val: 0.08 });
  b.hline(T.x - 3, T.y + T.h + 3, T.w + 6, "stone", { val: 0.55, ny: -1 });
  // brass plaque for the AUDIRA label (text drawn in HTML)
  const Q = ROOM.PLAQUE;
  b.rect(Q.x, Q.y, Q.w, Q.h, "metal", { val: 0.55 });
  b.hline(Q.x, Q.y, Q.w, "metal", { val: 0.85, ny: -1 });
  b.shade(Q.x, Q.y + Q.h, Q.w, 1, 0.5);
  // pillars
  for (const px of [-14, 140]) {
    b.rect(px, -70, 10, ROOM.FLOOR + 70, "stone", { val: 0.38, jitter: 0.05, seed: px });
    b.vline(px, -70, ROOM.FLOOR + 70, "stone", { val: 0.55, nx: -1 });
    b.vline(px + 9, -70, ROOM.FLOOR + 70, "stone", { val: 0.18 });
  }
  b.rect(-60, ROOM.FLOOR - 3, 260, 3, "stone", { val: 0.45, ny: -1 });

  const mid = createAlbedo(260, 110, -60, ROOM.FLOOR);
  const m = painter(mid);
  tiles(m, -60, ROOM.FLOOR, 260, 110, 17);
  m.shade(-60, ROOM.FLOOR, 260, 3, 0.5);

  const near = createAlbedo(260, 70, -60, 190);
  const n = painter(near);
  // rubble from the broken wall + the near floor lip, out of focus
  const r = rng(91);
  for (let k = 0; k < 16; k++) {
    const x = -50 + Math.floor(r() * 240);
    const y = 206 + Math.floor(r() * 26);
    n.rect(x, y, 6 + Math.floor(r() * 6), 4 + Math.floor(r() * 3), "stone", { val: 0.3 + r() * 0.15 });
    n.hline(x, y, 6, "stone", { val: 0.55, ny: -1 });
  }
  n.rect(-60, 230, 260, 30, "stone", { val: 0.18 });
  return { back, mid, near };
};

// ---------------------------------------------------------------- warehouse (B)
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
  // hero box: big, blank label band where the maker's name would be
  const B = WH.BOX;
  m.rect(B.x, B.y, B.w, B.h, "book1", { val: 0.6, jitter: 0.04, seed: 5 });
  m.hline(B.x, B.y, B.w, "book1", { val: 0.9, ny: -1 });
  m.vline(B.x + B.w - 1, B.y, B.h, "book1", { val: 0.3 });
  m.rect(B.x + 3, B.y + 4, B.w - 6, 12, "sky",{ val: 0.16 });
  m.rect(B.x + 3, B.y + 20, B.w - 6, 9, "paper", { val: 0.82 });
  // stack of boxes left, ink pad + stamp right
  for (let k = 0; k < 3; k++) box(m, 10 + k * 2, WH.TABLE - 14 - k * 13, 26, 13, k % 2 ? "book3" : "book2", 0.55);
  m.rect(104, WH.TABLE - 3, 16, 3, "sky", { val: 0.25 });
  m.rect(106, WH.TABLE - 4, 12, 1, "book1", { val: 0.4 });

  const near = createAlbedo(300, 80, -80, 188);
  const n = painter(near);
  for (const [cx, cy, w] of [[-40, 200, 54], [94, 206, 60]] as const) {
    n.rect(cx, cy, w, 40, "woodDark", { val: 0.42, jitter: 0.06, seed: cx + 99 });
    n.hline(cx, cy, w, "wood", { val: 0.7, ny: -1 });
    n.line(cx, cy, cx + w, cy + 40, "woodDark", { val: 0.25 });
    n.line(cx + w, cy, cx, cy + 40, "woodDark", { val: 0.25 });
  }
  n.rect(-80, 236, 300, 30, "woodDark", { val: 0.2 });
  return { back, mid, near };
};

// ---------------------------------------------------------------- programmer's desk (C)
export const DEV = { DESK: 130, FLOOR: 176, CRT: { x: 70, y: 76, w: 52, h: 46 }, SCREEN: { x: 76, y: 81, w: 40, h: 31 }, WIN: { x: -22, y: 14, w: 50, h: 62 }, SEAT: { x: 54, y: 160 } };
export const devDesk = () => {
  const back = createAlbedo(260, 260, -60, -70);
  const b = painter(back);
  for (let y = -70; y < DEV.FLOOR; y++) b.hline(-60, y, 260, "plaster", { val: 0.36 + (y / 240) * 0.1, jitter: 0.05, seed: 8 });
  nightWindow(b, DEV.WIN.x, DEV.WIN.y, DEV.WIN.w, DEV.WIN.h, 44);
  shelf(b, 104, 40, 56);
  books(b, 106, 40, 52, 4, ["reel", "jar"]);
  shelf(b, 104, 70, 56);
  books(b, 106, 70, 52, 9, ["lean"]);
  // graph-paper maze sketch pinned to the wall (the game's plan)
  b.rect(40, 22, 30, 36, "paper", { val: 0.74, jitter: 0.04, seed: 12 });
  for (let k = 0; k < 6; k++) b.hline(43, 26 + k * 5, 24, "paper", { val: 0.5 });
  for (let k = 0; k < 5; k++) b.vline(44 + k * 5, 25, 30, "paper", { val: 0.55 });
  b.rect(53, 40, 5, 5, "book1", { val: 0.6 });
  b.put(64, 20, "metal", { val: 0.8 });
  floor(b, -60, DEV.FLOOR, 260, 90, 31);

  const mid = createAlbedo(240, 140, -50, 60);
  const m = painter(mid);
  for (let k = 0; k < 6; k++) m.rect(-50, DEV.DESK + k, 240, 1, "wood", { val: 0.6 + k * 0.02, ny: -1, jitter: 0.06, seed: 40 + k });
  m.rect(-50, DEV.DESK + 6, 240, 3, "woodDark", { val: 0.3 });
  m.shade(-50, DEV.DESK + 9, 240, 3, 0.5);
  m.rect(-50, DEV.DESK + 12, 240, DEV.FLOOR - DEV.DESK - 12, "woodDark", { val: 0.18 });
  // CRT terminal: deep casing, bezel, vents, foot
  const C = DEV.CRT;
  m.rect(C.x + 4, C.y + C.h, C.w - 8, DEV.DESK - C.y - C.h, "metal", { val: 0.3 });
  m.rect(C.x, C.y, C.w, C.h, "paper", { val: 0.5, jitter: 0.04, seed: 61 });
  m.hline(C.x, C.y, C.w, "paper", { val: 0.75, ny: -1 });
  m.vline(C.x + C.w - 1, C.y, C.h, "paper", { val: 0.3 });
  m.rect(DEV.SCREEN.x - 2, DEV.SCREEN.y - 2, DEV.SCREEN.w + 4, DEV.SCREEN.h + 4, "sky", { val: 0.1 });
  for (let k = 0; k < 4; k++) m.hline(C.x + C.w - 14, C.y + C.h - 7 + k * 2 - 3, 9, "paper", { val: 0.3 });
  keyboard(m, 66, DEV.DESK - 2, 40);
  mug(m, 128, DEV.DESK);
  const lamp = deskLamp(m, 14, DEV.DESK);
  // papers and a cartridge on the desk
  m.rect(-30, DEV.DESK - 1, 22, 2, "paper", { val: 0.8 });
  m.rect(-26, DEV.DESK - 3, 18, 2, "paper", { val: 0.7 });
  box(m, 30, DEV.DESK - 12, 14, 12, "book2", 0.6);

  const near = createAlbedo(260, 80, -60, 186);
  const n = painter(near);
  for (let k = 0; k < 4; k++) n.rect(96 + k * 2, 214 - k * 7, 40, 7, k % 2 ? "book3" : "paper", { val: 0.55 });
  n.line(-60, 230, 40, 212, "sky", { val: 0.3 });
  n.line(40, 212, 80, 236, "sky", { val: 0.3 });
  n.rect(-60, 236, 260, 30, "woodDark", { val: 0.2 });
  return { back, mid, near, lamp };
};

// ---------------------------------------------------------------- castle map (D), top-down
// One layer, wider than the frame; the camera follows the player. Rooms are our own design, not the original game's.
export const MAP = {
  BLACK: { x: -4, y: 40, w: 48, h: 34 },
  GOLD: { x: 84, y: 82, w: 48, h: 34 },
  CATA: { x: -14, y: 80, w: 70, h: 46 },
  HALL_Y: 134,
  HALL_X0: 46,
  WALL_X: 150,
  DOT: { x: 16, y: 118 },
  SECRET: { x: 153, y: 126, w: 30, h: 22 },
};
export const mazeMap = () => {
  const a = createAlbedo(300, 240, -70, 0);
  const p = painter(a);
  for (let y = 0; y < 240; y++) p.hline(-70, y, 300, "sky", { val: 0.24, jitter: 0.08, seed: y * 3 });
  for (let y = 1; y < 240; y += 2) for (let x = -70 + (y % 4); x < 230; x += 4) p.put(x, y, "sky", { val: 0.18 });
  const wall = (x: number, y: number, w: number, h: number, mat: "plaster" | "book3" | "stone" | "book2", v: number) => {
    p.rect(x, y, w, h, mat, { val: v, jitter: 0.05, seed: x + y * 9 });
    p.hline(x, y, w, mat, { val: v + 0.2, ny: -1 });
    p.shade(x, y + h, w, 1, 0.5);
  };
  // outer maze walls (warm plaster)
  for (const [x, y, w, h] of [[-60, 20, 280, 4], [-60, 20, 4, 200], [216, 20, 4, 200], [-60, 216, 280, 4], [60, 24, 4, 48], [60, 68, 70, 4], [-30, 160, 160, 4], [150, 40, 4, 80]] as const) wall(x, y, w, h, "plaster", 0.55);
  // black castle: dark keep, towers, crenellations, gate
  const B = MAP.BLACK;
  wall(B.x, B.y, B.w, B.h, "stone", 0.1);
  for (const tx of [B.x - 3, B.x + B.w - 5]) wall(tx, B.y - 6, 8, B.h + 6, "stone", 0.14);
  for (let x = B.x; x < B.x + B.w; x += 4) p.rect(x, B.y - 3, 2, 3, "stone", { val: 0.16 });
  p.rect(B.x + B.w / 2 - 5, B.y + B.h - 10, 10, 10, "sky", { val: 0.05 });
  // catacomb under the black castle: tight purple-dark maze
  const K = MAP.CATA;
  p.rect(K.x, K.y, K.w, K.h, "sky", { val: 0.14 });
  for (const [x, y, w, h] of [[K.x, K.y, K.w, 3], [K.x, K.y, 3, K.h], [K.x + K.w - 3, K.y, 3, K.h - 16], [K.x + 10, K.y + 10, 30, 3], [K.x + 10, K.y + 10, 3, 22], [K.x + 22, K.y + 22, 3, 24], [K.x + 34, K.y + 18, 22, 3], [K.x + 46, K.y + 18, 3, 18], [K.x, K.y + K.h - 3, 40, 3]] as const) wall(x, y, w, h, "book3", 0.42);
  // gold castle
  const G = MAP.GOLD;
  wall(G.x, G.y, G.w, G.h, "book2", 0.72);
  for (const tx of [G.x - 3, G.x + G.w - 5]) wall(tx, G.y - 6, 8, G.h + 6, "book2", 0.8);
  for (let x = G.x; x < G.x + G.w; x += 4) p.rect(x, G.y - 3, 2, 3, "book2", { val: 0.85 });
  p.rect(G.x + G.w / 2 - 5, G.y + G.h - 10, 10, 10, "sky", { val: 0.05 });
  // the corridor below the gold castle, ending at the east wall (the breakable wall is drawn in HTML)
  wall(MAP.HALL_X0, MAP.HALL_Y - 7, MAP.WALL_X - MAP.HALL_X0, 3, "plaster", 0.5);
  wall(MAP.HALL_X0, MAP.HALL_Y + 8, MAP.WALL_X - MAP.HALL_X0, 3, "plaster", 0.5);
  // the secret room behind the wall
  const S = MAP.SECRET;
  wall(S.x, S.y, S.w, 3, "stone", 0.3);
  wall(S.x, S.y + S.h - 3, S.w, 3, "stone", 0.3);
  wall(S.x + S.w - 3, S.y, 3, S.h, "stone", 0.3);
  p.rect(S.x, S.y + 3, S.w - 3, S.h - 6, "sky", { val: 0.08 });
  return a;
};

// ---------------------------------------------------------------- teen's room (E1)
export const TEEN = { FLOOR: 140, TV: { x: 76, y: 92, w: 40, h: 32 }, SCREEN: { x: 81, y: 96, w: 27, h: 22 }, SIT: { x: 50, y: 158 }, WIN: { x: 92, y: 10, w: 40, h: 48 } };
export const teenRoom = () => {
  const back = createAlbedo(260, 240, -60, -70);
  const b = painter(back);
  for (let y = -70; y < TEEN.FLOOR; y++) b.hline(-60, y, 260, "paper", { val: 0.42 + (y / 210) * 0.08, jitter: 0.04, seed: 5 });
  for (let x = -60; x < 200; x += 8) b.vline(x, -70, TEEN.FLOOR + 70, "paper", { val: 0.35 });
  b.rect(-60, TEEN.FLOOR - 10, 260, 10, "woodDark", { val: 0.45, ny: -1 });
  nightWindow(b, TEEN.WIN.x, TEEN.WIN.y, TEEN.WIN.w, TEEN.WIN.h, 21);
  // space poster (generic rocket), pinned
  b.rect(10, 18, 30, 40, "sky", { val: 0.2 });
  b.rect(10, 18, 30, 2, "paper", { val: 0.8 });
  b.poly([[25, 26], [29, 36], [29, 48], [21, 48], [21, 36]], "paper", { val: 0.75 });
  b.rect(19, 46, 12, 3, "book1", { val: 0.7 });
  b.rect(23, 49, 4, 4, "amberLamp", { val: 0.9, emit: 0.6 });
  for (const [sx, sy] of [[14, 24], [35, 30], [16, 50], [36, 52]]) b.put(sx, sy, "ivoryLit", { val: 0.9, emit: 0.5 });
  floor(b, -60, TEEN.FLOOR, 260, 100, 27);

  const mid = createAlbedo(240, 120, -50, 80);
  const m = painter(mid);
  // TV stand + wood-veneer TV + console with joystick on top
  m.rect(66, TEEN.TV.y + TEEN.TV.h, 60, TEEN.FLOOR - TEEN.TV.y - TEEN.TV.h, "woodDark", { val: 0.42, jitter: 0.04, seed: 3 });
  m.hline(66, TEEN.TV.y + TEEN.TV.h, 60, "wood", { val: 0.75, ny: -1 });
  const V = TEEN.TV;
  m.rect(V.x, V.y, V.w, V.h, "wood", { val: 0.5, jitter: 0.06, seed: 9 });
  m.hline(V.x, V.y, V.w, "wood", { val: 0.78, ny: -1 });
  m.rect(TEEN.SCREEN.x - 1, TEEN.SCREEN.y - 1, TEEN.SCREEN.w + 2, TEEN.SCREEN.h + 2, "sky", { val: 0.08 });
  for (let k = 0; k < 3; k++) m.disc(V.x + V.w - 4, V.y + 7 + k * 6, 1.5, "metal", { val: 0.7 });
  m.vline(V.x + 12, V.y - 8, 8, "metal", { val: 0.7 });
  m.vline(V.x + 26, V.y - 9, 9, "metal", { val: 0.7 });
  m.rect(70, TEEN.TV.y + TEEN.TV.h + 4, 26, 6, "woodDark", { val: 0.25 });
  m.rect(72, TEEN.TV.y + TEEN.TV.h + 5, 22, 2, "metal", { val: 0.55 });
  // writing desk on the left with paper and pen
  m.rect(-46, 116, 50, 4, "wood", { val: 0.68, ny: -1 });
  m.rect(-44, 120, 4, TEEN.FLOOR - 120, "woodDark", { val: 0.35 });
  m.rect(-4, 120, 4, TEEN.FLOOR - 120, "woodDark", { val: 0.35 });
  m.rect(-20, 113, 14, 3, "paper", { val: 0.9 });
  m.line(-8, 112, -3, 108, "metal", { val: 0.6 });

  const near = createAlbedo(260, 80, -60, 180);
  const n = painter(near);
  rug(n, 60, 206, 70, 14);
  const r = rng(13);
  for (let k = 0; k < 6; k++) box(n, -40 + k * 34 + Math.floor(r() * 10), 218 + Math.floor(r() * 10), 12, 8, (["book1", "book2", "teal"] as const)[k % 3], 0.5);
  n.rect(-60, 236, 260, 30, "woodDark", { val: 0.2 });
  return { back, mid, near };
};

// ---------------------------------------------------------------- office (E2)
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
  n.rect(-46, 204, 22, 30, "book2", { val: 0.45 });
  n.rect(100, 196, 50, 40, "sky", { val: 0.22 }); // chair back, out of focus
  n.hline(100, 196, 50, "sky", { val: 0.4, ny: -1 });
  n.rect(-60, 236, 260, 30, "book3", { val: 0.25 });
  return { back, mid, near };
};

// ---------------------------------------------------------------- museum timeline (F)
export const MUS = { FLOOR: 148, P1: { x: 4, y: 58, w: 56, h: 50 }, P2: { x: 76, y: 58, w: 56, h: 50 }, RAIL: 122 };
export const museum = () => {
  const back = createAlbedo(280, 240, -70, -70);
  const b = painter(back);
  for (let y = -70; y < MUS.FLOOR; y++) b.hline(-70, y, 280, "plaster", { val: 0.2 + (y / 220) * 0.06, jitter: 0.04, seed: 19 });
  for (const P of [MUS.P1, MUS.P2]) {
    b.rect(P.x - 4, P.y - 4, P.w + 8, P.h + 8, "frame", { val: 0.6, jitter: 0.04, seed: P.x });
    b.hline(P.x - 4, P.y - 4, P.w + 8, "frame", { val: 0.9, ny: -1 });
    b.rect(P.x, P.y, P.w, P.h, "sky", { val: 0.08 });
    // track spot above each panel
    b.rect(P.x + P.w / 2 - 4, -20, 8, 5, "metal", { val: 0.45 });
  }
  b.rect(-70, -26, 280, 3, "metal", { val: 0.4 });
  for (let y = MUS.FLOOR; y < 170; y++) b.hline(-70, y, 280, "stone", { val: 0.3 + ((y - MUS.FLOOR) / 22) * 0.1, jitter: 0.05, seed: y });

  const mid = createAlbedo(260, 120, -60, 110);
  const m = painter(mid);
  for (let y = 170; y < 230; y++) m.hline(-60, y, 260, "stone", { val: 0.36 + ((y - 170) / 60) * 0.08, jitter: 0.05, seed: y * 3 });
  // reflections of the two panels on the polished floor
  for (const P of [MUS.P1, MUS.P2]) for (let y = 172; y < 196; y += 2) m.hline(P.x + 6, y, P.w - 12, "stone", { val: 0.5 - (y - 172) * 0.006 });
  // timeline rail with year nodes
  m.rect(-60, MUS.RAIL, 260, 3, "metal", { val: 0.65 });
  m.hline(-60, MUS.RAIL, 260, "metal", { val: 0.9, ny: -1 });
  for (const P of [MUS.P1, MUS.P2]) m.disc(P.x + P.w / 2, MUS.RAIL + 1, 3, "metal", { val: 0.85 });

  const near = createAlbedo(280, 80, -70, 180);
  const n = painter(near);
  for (const px of [-30, 50, 130]) {
    n.rect(px, 196, 5, 40, "metal", { val: 0.55 });
    n.disc(px + 2, 195, 4, "metal", { val: 0.75 });
  }
  for (const [a0, a1] of [[-30, 50], [50, 130]]) for (let x = a0 + 2; x < a1; x++) n.put(x, 200 + Math.round(Math.sin(((x - a0) / (a1 - a0)) * Math.PI) * 8), "book1", { val: 0.55 });
  n.rect(-70, 236, 280, 30, "stone", { val: 0.18 });
  return { back, mid, near };
};
