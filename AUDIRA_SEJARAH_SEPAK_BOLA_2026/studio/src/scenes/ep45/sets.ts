// EP45 film sets beyond the cover stadium, painted once into albedo (material + value) and relit per frame.
// Set coordinates are art px (8 screen px each); the visible frame at rest is 0..135 × 0..240.
//   room()  B  living room 1992: plank wall, night window, wall calendar (back), TV on a cabinet (mid), plant (near)
//   pitch() C  afternoon group-stage pitch seen from the side: stands (back), pitch + two goals (mid), touchline (near)
//   goal()  D/E2 night goal from behind the penalty taker: stands (back), goal + box (mid), turf lip (near)
import { rng } from "../../kits/pixelstory/core/noise.ts";
import { createAlbedo, painter } from "../../kits/pixelstory/environment/albedo.ts";
import { floor, nightWindow, plankWall, pothos } from "../../kits/pixelstory/environment/props.ts";

type P = ReturnType<typeof painter>;

// ---------------------------------------------------------------- room (B)
export const ROOM = {
  TV: { x: 30, y: 92, w: 74, h: 58 },
  SCREEN: { x: 35, y: 97, w: 52, h: 46 },
  CAL: { x: 92, y: 52, w: 24, h: 30 },
  LAMP: { x: 128, y: 112 },
};
export const room = () => {
  const back = createAlbedo(200, 330, -22, -75);
  const b = painter(back);
  plankWall(b, -22, -75, 200, 255, { mat: "wood", base: 0.42, seed: 1992 });
  b.rect(-22, 176, 200, 4, "woodDark", { val: 0.5, ny: -1 }); // skirting board
  floor(b, -22, 180, 200, 75, 31);
  nightWindow(b, 2, 38, 34, 46, 11);
  // wall calendar: paper sheet, red header band, day grid; text is drawn over it
  const c = ROOM.CAL;
  b.put(c.x + c.w / 2, c.y - 2, "metal", { val: 0.9 });
  b.line(c.x + c.w / 2, c.y - 2, c.x + 3, c.y, "metal", { val: 0.5 });
  b.line(c.x + c.w / 2, c.y - 2, c.x + c.w - 4, c.y, "metal", { val: 0.5 });
  b.rect(c.x, c.y, c.w, c.h, "paper", { val: 0.82, jitter: 0.04, seed: 5 });
  b.rect(c.x, c.y, c.w, 7, "book1", { val: 0.85 });
  for (let k = 1; k < 4; k++) b.hline(c.x + 1, c.y + 9 + k * 5, c.w - 2, "paper", { val: 0.55 });
  b.shade(c.x + 1, c.y + c.h, c.w, 1, 0.5);
  // floor lamp: warm practical on the right
  const L = ROOM.LAMP;
  b.poly([[L.x - 7, L.y], [L.x + 7, L.y], [L.x + 4, L.y - 9], [L.x - 4, L.y - 9]], "amberLamp", { val: 0.75, emit: 0.55 });
  b.vline(L.x, L.y, 66, "metal", { val: 0.5 });
  b.rect(L.x - 5, L.y + 66, 10, 2, "metal", { val: 0.4 });

  const mid = createAlbedo(150, 110, -8, 70);
  const m = painter(mid);
  // cabinet
  m.rect(20, 150, 94, 28, "woodDark", { val: 0.52, jitter: 0.05, seed: 2 });
  m.hline(20, 150, 94, "wood", { val: 0.8, ny: -1 });
  m.vline(67, 152, 25, "woodDark", { val: 0.25 });
  m.rect(24, 178, 4, 6, "woodDark", { val: 0.3 });
  m.rect(106, 178, 4, 6, "woodDark", { val: 0.3 });
  m.shade(20, 184, 94, 2, 0.4);
  // CRT: deep body, bezel, glass, knob panel, rabbit ears
  const T = ROOM.TV;
  const S = ROOM.SCREEN;
  m.rect(T.x, T.y, T.w, T.h, "frame", { val: 0.34, jitter: 0.03, seed: 9 });
  m.hline(T.x, T.y, T.w, "frame", { val: 0.6, ny: -1 });
  m.rect(S.x - 2, S.y - 2, S.w + 4, S.h + 4, "metal", { val: 0.22 });
  m.rect(S.x, S.y, S.w, S.h, "screen", { val: 0.3, emit: 0.18 });
  m.rect(S.x + S.w + 4, S.y + 2, 11, S.h - 4, "metal", { val: 0.3 });
  m.disc(S.x + S.w + 9, S.y + 10, 3, "metal", { val: 0.7 });
  m.disc(S.x + S.w + 9, S.y + 22, 3, "metal", { val: 0.7 });
  for (let k = 0; k < 5; k++) m.hline(S.x + S.w + 6, S.y + 31 + k * 2, 7, "metal", { val: 0.15 });
  m.line(T.x + T.w / 2, T.y, T.x + T.w / 2 - 14, T.y - 22, "metal", { val: 0.75 });
  m.line(T.x + T.w / 2, T.y, T.x + T.w / 2 + 14, T.y - 22, "metal", { val: 0.75 });
  m.disc(T.x + T.w / 2, T.y - 1, 2, "metal", { val: 0.5 });

  const near = createAlbedo(200, 80, -30, 190);
  const n = painter(near);
  pothos(n, -14, 258, 7, 22);
  // sofa arm silhouette, bottom right
  n.rect(102, 214, 60, 50, "book1", { val: 0.24 });
  n.disc(104, 218, 8, "book1", { val: 0.28 });
  return { back, mid, near };
};

// ---------------------------------------------------------------- pitch (C)
export const PITCH = { BOARD_Y: 118, TOP: 126, GOAL_L: -26, GOAL_R: 160, GOAL_TOP: 146, GOAL_BOT: 180, LINE_Y: 182 };
export const pitch = () => {
  const back = createAlbedo(240, 170, -55, -40);
  const b = painter(back);
  for (let y = -40; y < 56; y++) b.hline(-55, y, 240, "dusk", { val: 0.5 + (y / 56) * 0.35, jitter: 0.04, seed: 7 });
  b.disc(108, 0, 9, "amberLamp", { val: 0.9, emit: 0.9 }); // low afternoon sun
  b.rect(-55, 54, 240, 5, "metal", { val: 0.45 });
  b.hline(-55, 58, 240, "metal", { val: 0.8 });
  const r = rng(11);
  b.rect(-55, 59, 240, 59, "stone", { val: 0.4 });
  for (let y = 60; y < 117; y += 2)
    for (let x = -55; x < 185; x++) {
      const v = r();
      if (v < 0.2) b.put(x, y, "book1", { val: 0.8 });
      else if (v < 0.34) b.put(x, y, "book2", { val: 0.9 });
      else if (v < 0.5) b.put(x, y, "ivoryLit", { val: 0.6 + r() * 0.2 });
      else if (v < 0.6) b.put(x, y, "book3", { val: 0.7 });
    }
  b.shade(-55, 59, 240, 3, 0.5);

  const mid = createAlbedo(290, 140, -80, 112);
  const m = painter(mid);
  m.rect(-80, PITCH.BOARD_Y, 290, 8, "woodDark", { val: 0.35 });
  for (let x = -80, i = 0; x < 210; x += 30, i++) m.rect(x + 1, PITCH.BOARD_Y + 1, 28, 6, i % 2 ? "book2" : "screen", { val: i % 2 ? 0.75 : 0.45 });
  for (let y = PITCH.TOP; y < 252; y++) {
    const band = Math.floor(Math.sqrt(Math.max(0, y - PITCH.TOP)) * 1.5) % 2;
    m.hline(-80, y, 290, "leaf", { val: 0.72 + band * 0.1 + ((y - PITCH.TOP) / 120) * 0.1, jitter: 0.06, seed: y });
  }
  m.shade(-80, PITCH.TOP, 290, 2, 0.55);
  m.hline(-80, PITCH.LINE_Y, 290, "ivoryLit", { val: 0.75 }); // the near touchline runs across the frame
  m.vline(67, PITCH.TOP, PITCH.LINE_Y - PITCH.TOP, "ivoryLit", { val: 0.6 }); // halfway line
  for (const gx of [PITCH.GOAL_L, PITCH.GOAL_R]) goalFrame(m, gx - 13, PITCH.GOAL_TOP, 26, PITCH.GOAL_BOT - PITCH.GOAL_TOP, 0.85);

  const near = createAlbedo(300, 60, -90, 205);
  const n = painter(near);
  n.rect(-90, 222, 300, 40, "leaf", { val: 0.32 });
  for (let x = -90; x < 210; x += 3) n.vline(x, 216 + ((x * 7) % 5), 8, "leaf", { val: 0.42 });
  return { back, mid, near };
};

/** Goal seen from the front: posts, bar, net grid. */
const goalFrame = (m: P, x: number, y: number, w: number, h: number, v: number) => {
  for (let yy = y + 2; yy < y + h; yy += 3) m.hline(x + 2, yy, w - 4, "ivoryLit", { val: 0.32 });
  for (let xx = x + 2; xx < x + w - 2; xx += 3) m.vline(xx, y + 2, h - 2, "ivoryLit", { val: 0.32 });
  m.rect(x, y, w, 2, "ivoryLit", { val: v });
  m.rect(x, y, 2, h, "ivoryLit", { val: v });
  m.rect(x + w - 2, y, 2, h, "ivoryLit", { val: v });
  m.shade(x, y + h, w, 2, 0.5);
};

// ---------------------------------------------------------------- goal (D, E2)
export const GOAL = { L: 22, R: 112, TOP: 106, BOT: 168, SPOT: { x: 67, y: 200 } };
export const goal = (seed = 5) => {
  const back = createAlbedo(200, 160, -32, -20);
  const b = painter(back);
  for (let y = -20; y < 40; y++) b.hline(-32, y, 200, "sky", { val: 0.1 + (y / 40) * 0.22, jitter: 0.05, seed: 2 });
  const r = rng(seed);
  b.rect(-32, 40, 200, 80, "stone", { val: 0.28 });
  for (let y = 42; y < 118; y += 2)
    for (let x = -32; x < 168; x++) {
      const v = r();
      if (v < 0.3) b.put(x, y, "book1", { val: 0.6 + r() * 0.3 });
      else if (v < 0.5) b.put(x, y, "ivoryLit", { val: 0.45 + r() * 0.2 });
      else if (v < 0.58) b.put(x, y, "paper", { val: 0.5 });
    }
  b.shade(-32, 40, 200, 3, 0.5);
  for (const [fx, fy] of [[-8, 6], [142, 6]]) {
    b.rect(fx - 8, fy - 2, 16, 8, "metal", { val: 0.3 });
    for (let c = 0; c < 5; c++) for (let rr = 0; rr < 2; rr++) b.rect(fx - 7 + c * 3, fy + rr * 3, 2, 2, "ivoryLit", { val: 1, emit: 0.95 });
  }

  const mid = createAlbedo(220, 200, -42, 96);
  const m = painter(mid);
  m.rect(-42, 118, 220, 6, "woodDark", { val: 0.3 });
  for (let y = 124; y < 296; y++) {
    const band = Math.floor(Math.sqrt(Math.max(0, y - 124)) * 1.7) % 2;
    m.hline(-42, y, 220, "leaf", { val: 0.5 + band * 0.1 + ((y - 124) / 120) * 0.18, jitter: 0.07, seed: y });
  }
  // net: back panel grid, then side panels slanting to the posts
  for (let yy = GOAL.TOP + 4; yy < GOAL.BOT - 2; yy += 3) m.hline(GOAL.L + 8, yy - 4, GOAL.R - GOAL.L - 16, "ivoryLit", { val: 0.24 });
  for (let xx = GOAL.L + 8; xx < GOAL.R - 8; xx += 3) m.vline(xx, GOAL.TOP, GOAL.BOT - GOAL.TOP - 6, "ivoryLit", { val: 0.24 });
  for (let k = 0; k < 8; k++) {
    m.line(GOAL.L + 1, GOAL.TOP + 2 + k * 8, GOAL.L + 8, GOAL.TOP + k * 7.5, "ivoryLit", { val: 0.3 });
    m.line(GOAL.R - 2, GOAL.TOP + 2 + k * 8, GOAL.R - 9, GOAL.TOP + k * 7.5, "ivoryLit", { val: 0.3 });
  }
  m.shade(GOAL.L + 8, GOAL.BOT - 6, GOAL.R - GOAL.L - 16, 6, 0.6);
  m.rect(GOAL.L, GOAL.TOP, GOAL.R - GOAL.L, 3, "ivoryLit", { val: 0.95 });
  m.rect(GOAL.L, GOAL.TOP, 3, GOAL.BOT - GOAL.TOP, "ivoryLit", { val: 0.95 });
  m.rect(GOAL.R - 3, GOAL.TOP, 3, GOAL.BOT - GOAL.TOP, "ivoryLit", { val: 0.95 });
  // goal line, six-yard box, penalty spot
  m.hline(-42, GOAL.BOT, 220, "ivoryLit", { val: 0.7 });
  m.hline(6, GOAL.BOT + 16, 122, "ivoryLit", { val: 0.65 });
  m.line(6, GOAL.BOT + 16, 12, GOAL.BOT, "ivoryLit", { val: 0.65 });
  m.line(128, GOAL.BOT + 16, 122, GOAL.BOT, "ivoryLit", { val: 0.65 });
  m.disc(GOAL.SPOT.x, GOAL.SPOT.y, 1.4, "ivoryLit", { val: 0.8 });

  const near = createAlbedo(220, 90, -42, 222);
  const n = painter(near);
  n.rect(-42, 236, 220, 76, "leaf", { val: 0.22 });
  for (let x = -42; x < 178; x += 2) n.vline(x, 228 + ((x * 5) % 7), 10, "leaf", { val: 0.3 });
  return { back, mid, near };
};
