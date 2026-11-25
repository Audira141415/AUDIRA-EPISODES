// EP08 film sets (copied from EP01, adapted) beyond the cover arena, painted once into albedo (material + value) and relit per frame.
// Set coordinates are art px (8 screen px each); the visible frame at rest is 0..135 × 0..240.
// Subjects stand above art row 160 (screen 1280) so the caption band (1290–1540) never covers them.
//   room()      B   athlete's room at night: plaster wall + window (back), bed + nightstand + clock (mid), racket bag (near)
//   sideCourt() C/E2 the final court from the side: crowd + ad boards (back), floor + court + net post (mid), judge chair (near)
//   netClose()  D   net-height close-up: dark stands (back), far court (mid), net mesh (netLayer), floor lip (near)
//   podium()    E1  ceremony hall: dark wall + flagpole (back), three-tier podium (mid), photographers' heads (near)
//   jakarta(m)  C2/OUT Jakarta: sky + towers (back), crowd + street (mid), near crowd (near). C2 = dawn courtyard (no Monas, flagpole), OUT = HUT RI night with Monas
import { rng } from "../../kits/pixelstory/core/noise.ts";
import { createAlbedo, painter } from "../../kits/pixelstory/environment/albedo.ts";
import { floor, nightWindow } from "../../kits/pixelstory/environment/props.ts";

type P = ReturnType<typeof painter>;

/** Crowd texture: jersey reds, skin/ivory, a few Merah Putih flags held up. */
const crowd = (p: P, x0: number, y0: number, w: number, h: number, seed: number, flags = 5, step = 2) => {
  p.rect(x0, y0, w, h, "stone", { val: 0.3 });
  const r = rng(seed);
  for (let y = y0 + 1; y < y0 + h - 1; y += step)
    for (let x = x0; x < x0 + w; x++) {
      const v = r();
      if (v < 0.3) p.put(x, y, "book1", { val: 0.72 + r() * 0.3 });
      else if (v < 0.55) p.put(x, y, "ivoryLit", { val: 0.5 + r() * 0.25 });
      else if (v < 0.68) p.put(x, y, "plaster", { val: 0.5 });
    }
  for (let k = 0; k < flags; k++) {
    const fx = x0 + 2 + Math.floor(r() * (w - 12));
    const fy = y0 + 1 + Math.floor(r() * Math.max(1, h - 8));
    p.rect(fx, fy, 8, 3, "book1", { val: 0.95 });
    p.rect(fx, fy + 3, 8, 3, "ivoryLit", { val: 0.92 });
    p.vline(fx - 1, fy, 9, "metal", { val: 0.5 });
  }
  p.shade(x0, y0, w, 2, 0.55);
};

// ---------------------------------------------------------------- room (B)
export const ROOM = { BED_TOP: 154, FLOOR: 172, CLOCK: { x: 101, y: 126, w: 22, h: 9 }, LAMP: { x: 120, y: 118 }, WIN: { x: 6, y: 52, w: 42, h: 54 }, SIT: { x: 62, y: 172 } };
export const room = () => {
  const back = createAlbedo(220, 330, -40, -70);
  const b = painter(back);
  for (let y = -70; y < ROOM.FLOOR; y++) b.hline(-40, y, 220, "plaster", { val: 0.42 + (y / 200) * 0.12, jitter: 0.05, seed: 3 });
  b.rect(-40, ROOM.FLOOR - 4, 220, 4, "woodDark", { val: 0.5, ny: -1 });
  floor(b, -40, ROOM.FLOOR, 220, 90, 31);
  const w = ROOM.WIN;
  nightWindow(b, w.x, w.y, w.w, w.h, 92);
  // Barcelona skyline in the window: low blocks + one tower, a few lit windows
  const r = rng(7);
  for (let x = w.x + 3; x < w.x + w.w - 3; x += 4) {
    const h = 6 + Math.floor(r() * 12);
    b.rect(x, w.y + w.h - 3 - h, 4, h, "sky", { val: 0.12 });
    if (r() < 0.6) b.put(x + 1, w.y + w.h - 3 - h + 2, "amberLamp", { val: 0.8, emit: 0.7 });
  }
  b.rect(w.x + 28, w.y + w.h - 34, 3, 31, "sky", { val: 0.1 });
  b.disc(w.x + 10, w.y + 12, 3, "ivoryLit", { val: 0.9, emit: 0.8 }); // moon
  b.vline(w.x + w.w / 2, w.y + 3, w.h - 6, "woodDark", { val: 0.45 });
  // Merah Putih pennant pinned above the bed, and a training schedule sheet
  b.rect(58, 96, 22, 6, "book1", { val: 0.9 });
  b.rect(58, 102, 22, 6, "ivoryLit", { val: 0.85 });
  b.shade(58, 108, 22, 1, 0.5);
  b.rect(86, 84, 14, 18, "paper", { val: 0.75, jitter: 0.04, seed: 13 });
  for (let k = 0; k < 5; k++) b.hline(88, 88 + k * 3, 10, "paper", { val: 0.45 });

  const mid = createAlbedo(180, 90, -20, 110);
  const m = painter(mid);
  // bed: frame, mattress, pillow, blanket
  m.rect(0, ROOM.BED_TOP + 8, 92, 10, "woodDark", { val: 0.45, jitter: 0.04, seed: 4 });
  m.rect(2, ROOM.BED_TOP + 18, 4, 4, "woodDark", { val: 0.3 });
  m.rect(86, ROOM.BED_TOP + 18, 4, 4, "woodDark", { val: 0.3 });
  m.rect(0, ROOM.BED_TOP, 92, 8, "paper", { val: 0.72, jitter: 0.04, seed: 5 });
  m.rect(4, ROOM.BED_TOP - 6, 20, 6, "ivoryLit", { val: 0.7 });
  m.rect(28, ROOM.BED_TOP - 1, 64, 9, "book3", { val: 0.6, jitter: 0.06, seed: 6 });
  m.shade(0, ROOM.BED_TOP + 22, 92, 2, 0.5);
  // nightstand + clock + lamp
  m.rect(98, 136, 28, 36, "woodDark", { val: 0.5, jitter: 0.04, seed: 8 });
  m.hline(98, 136, 28, "wood", { val: 0.8, ny: -1 });
  m.hline(100, 152, 24, "woodDark", { val: 0.25 });
  const c = ROOM.CLOCK;
  m.rect(c.x, c.y, c.w, c.h, "frame", { val: 0.3 });
  m.rect(c.x + 1, c.y + 1, c.w - 2, c.h - 2, "screen", { val: 0.15, emit: 0.1 });
  const L = ROOM.LAMP;
  m.poly([[L.x - 6, L.y], [L.x + 6, L.y], [L.x + 3, L.y - 8], [L.x - 3, L.y - 8]], "amberLamp", { val: 0.8, emit: 0.6 });
  m.vline(L.x, L.y, 18, "metal", { val: 0.6 });
  m.rect(L.x - 4, 134, 8, 2, "metal", { val: 0.5 });

  const near = createAlbedo(220, 80, -40, 190);
  const n = painter(near);
  // racket bag on the floor, two racket heads poking out
  n.rect(-30, 214, 64, 22, "book1", { val: 0.5, jitter: 0.05, seed: 9 });
  n.hline(-30, 214, 64, "book1", { val: 0.8, ny: -1 });
  n.ring(10, 207, 6, "metal", { val: 0.7 });
  n.ring(22, 205, 6, "metal", { val: 0.6 });
  return { back, mid, near };
};

// ---------------------------------------------------------------- side court (C, E2)
export const SIDE = { BOARD_Y: 104, FLOOR: 112, COURT_T: 126, FEET: 158, NET_X: 67, NET_TOP: 96 };
export const sideCourt = () => {
  const back = createAlbedo(260, 150, -60, -30);
  const b = painter(back);
  for (let y = -30; y < 26; y++) b.hline(-60, y, 260, "sky", { val: 0.14 + (y / 26) * 0.12, jitter: 0.05, seed: 12 });
  for (let x = -60; x < 200; x += 20) {
    b.line(x, -26, x + 10, 14, "metal", { val: 0.3 });
    b.line(x + 20, -26, x + 10, 14, "metal", { val: 0.3 });
  }
  b.hline(-60, 14, 260, "metal", { val: 0.45 });
  for (const lx of [10, 67, 124]) {
    b.rect(lx - 8, 2, 16, 4, "metal", { val: 0.3 });
    for (let k = 0; k < 5; k++) b.rect(lx - 7 + k * 3, 3, 2, 2, "ivoryLit", { val: 1, emit: 0.95 });
  }
  b.rect(-60, 26, 260, 3, "metal", { val: 0.4 });
  crowd(b, -60, 29, 260, 34, 1992, 8);
  b.rect(-60, 63, 260, 3, "stone", { val: 0.5 });
  crowd(b, -60, 66, 260, SIDE.BOARD_Y - 66, 4, 6);

  const mid = createAlbedo(260, 150, -60, SIDE.BOARD_Y - 2);
  const m = painter(mid);
  m.rect(-60, SIDE.BOARD_Y, 260, 8, "woodDark", { val: 0.3 });
  m.hline(-60, SIDE.BOARD_Y, 260, "metal", { val: 0.8 });
  for (let x = -60, i = 0; x < 200; x += 40, i++) m.rect(x + 1, SIDE.BOARD_Y + 1, 38, 6, i % 2 ? "book1" : "screen", { val: i % 2 ? 0.7 : 0.38 });
  for (let y = SIDE.FLOOR; y < 250; y++) m.hline(-60, y, 260, "wood", { val: 0.5 + ((y - SIDE.FLOOR) / 120) * 0.14, jitter: 0.06, seed: y });
  for (let x = -60; x < 200; x += 9) m.vline(x, SIDE.FLOOR, 140, "wood", { val: 0.4 });
  for (let y = SIDE.FLOOR + 6; y < 250; y += 11) for (let x = -60 + ((y * 5) % 9); x < 200; x += 18) m.hline(x, y, 3, "woodDark", { val: 0.5 });
  m.shade(-60, SIDE.FLOOR, 260, 3, 0.55);
  // green court seen low from the side: a band with its near and far lines
  for (let y = SIDE.COURT_T; y < SIDE.FEET + 8; y++) m.hline(-12, y, 158, "leaf", { val: 0.72 + ((y - SIDE.COURT_T) / 40) * 0.1, jitter: 0.05, seed: y * 7 });
  for (let y = SIDE.COURT_T + 1; y < SIDE.FEET + 7; y += 2) for (let x = -12 + (y % 4); x < 146; x += 4) m.put(x, y, "leaf", { val: 0.6 });
  m.hline(-12, SIDE.COURT_T, 158, "ivoryLit", { val: 0.8 });
  m.hline(-12, SIDE.FEET + 7, 158, "ivoryLit", { val: 0.85 });
  m.line(-12, SIDE.COURT_T, -12, SIDE.FEET + 7, "ivoryLit", { val: 0.85 });
  m.line(145, SIDE.COURT_T, 145, SIDE.FEET + 7, "ivoryLit", { val: 0.85 });
  // net seen edge-on: post, a narrow mesh band, white tape
  const X = SIDE.NET_X;
  m.rect(X - 1, SIDE.NET_TOP, 2, SIDE.FEET + 4 - SIDE.NET_TOP, "metal", { val: 0.75 });
  for (let y = SIDE.NET_TOP + 2; y < SIDE.NET_TOP + 22; y++) for (let x = X - 3; x <= X + 3; x++) if ((x + y) % 2 === 0) m.put(x, y, "metal", { val: 0.3 });
  m.hline(X - 3, SIDE.NET_TOP, 7, "ivoryLit", { val: 0.95 });
  m.shade(X - 4, SIDE.FEET + 4, 10, 2, 0.4);

  const near = createAlbedo(260, 80, -60, 200);
  const n = painter(near);
  // umpire's chair (right) and the near board edge, out of focus
  n.rect(126, 196, 4, 48, "metal", { val: 0.45 });
  n.rect(118, 192, 22, 6, "woodDark", { val: 0.35 });
  n.rect(-60, 232, 260, 30, "woodDark", { val: 0.22 });
  // players' bench with towels and shuttle tubes across the lower third, out of focus
  n.rect(-60, 206, 175, 6, "wood", { val: 0.55 });
  n.hline(-60, 206, 175, "wood", { val: 0.85, ny: -1 });
  for (const lx of [-50, 40, 100]) n.rect(lx, 212, 4, 22, "metal", { val: 0.4 });
  n.rect(-34, 198, 22, 8, "ivoryLit", { val: 0.7 });
  n.rect(30, 199, 18, 7, "book1", { val: 0.7 });
  for (let k = 0; k < 4; k++) { n.rect(66 + k * 7, 192, 5, 14, "book3", { val: 0.5 }); n.disc(68 + k * 7, 192, 2.5, "ivoryLit", { val: 0.6 }); }
  return { back, mid, near };
};

// ---------------------------------------------------------------- net close-up (D)
export const NETC = { TAPE: 100, BOT: 140, FAR_FEET: 128, NEAR_FEET: 160 };
export const netClose = () => {
  const back = createAlbedo(220, 150, -40, -30);
  const b = painter(back);
  for (let y = -30; y < 20; y++) b.hline(-40, y, 220, "sky", { val: 0.1 + (y / 20) * 0.1, jitter: 0.05, seed: 21 });
  crowd(b, -40, 20, 220, 70, 1988, 7);
  b.rect(-40, 90, 220, 6, "woodDark", { val: 0.3 });
  for (let x = -40, i = 0; x < 180; x += 44, i++) b.rect(x + 1, 91, 42, 4, i % 2 ? "book1" : "screen", { val: i % 2 ? 0.7 : 0.38 });

  const mid = createAlbedo(220, 160, -40, 94);
  const m = painter(mid);
  for (let y = 96; y < 250; y++) m.hline(-40, y, 220, "wood", { val: 0.46 + ((y - 96) / 150) * 0.16, jitter: 0.08, seed: y });
  for (let x = -40; x < 180; x += 9) m.vline(x, 96, 154, "wood", { val: 0.4 });
  for (let y = 104; y < 250; y++) {
    const h = 70 + (y - 104) * 0.9;
    m.hline(Math.round(67 - h), y, Math.round(h * 2), "leaf", { val: 0.68 + ((y - 104) / 140) * 0.14, jitter: 0.05, seed: y * 3 });
  }
  for (let y = 105; y < 250; y += 2) for (let x = Math.round(67 - 70 - (y - 104) * 0.9) + (y % 4); x < 67 + 70 + (y - 104) * 0.9; x += 4) m.put(x, y, "leaf", { val: 0.58 + ((y - 104) / 140) * 0.1 });
  m.hline(-40, 112, 220, "ivoryLit", { val: 0.7 });

  // the net on its own layer so the far player stands behind it
  const net = createAlbedo(220, 60, -40, NETC.TAPE - 4);
  const t = painter(net);
  for (let y = NETC.TAPE + 2; y < NETC.BOT; y++) for (let x = -40; x < 180; x++) if ((x + y) % 3 === 0) t.put(x, y, "metal", { val: 0.26 });
  t.rect(-40, NETC.TAPE, 220, 2, "ivoryLit", { val: 0.95 });
  t.rect(-4, NETC.TAPE - 2, 3, NETC.BOT - NETC.TAPE + 6, "metal", { val: 0.7 });
  t.rect(136, NETC.TAPE - 2, 3, NETC.BOT - NETC.TAPE + 6, "metal", { val: 0.7 });

  const near = createAlbedo(220, 70, -40, 200);
  const n = painter(near);
  n.rect(-40, 226, 220, 40, "woodDark", { val: 0.24 });
  n.rect(-36, 204, 10, 30, "book3", { val: 0.4 }); // shuttle tube
  n.disc(-31, 204, 5, "ivoryLit", { val: 0.5 });
  return { back, mid, net, near };
};

// ---------------------------------------------------------------- podium (E1)
export const POD = { TOP: 150, POLE_X: 100, POLE_TOP: 46, POLE_BOT: 122, X: 62 };
export const podium = () => {
  const back = createAlbedo(220, 330, -40, -60);
  const b = painter(back);
  for (let y = -60; y < 130; y++) b.hline(-40, y, 220, "sky", { val: 0.1 + (y / 130) * 0.14, jitter: 0.05, seed: 31 });
  crowd(b, -40, 92, 220, 30, 1971, 4, 3);
  b.rect(-40, 122, 220, 4, "metal", { val: 0.4 });
  // three flagpoles; only the centre-right one carries a flag (drawn in HTML so it can rise)
  for (const px of [POD.POLE_X - 18, POD.POLE_X, POD.POLE_X + 18]) {
    b.vline(px, POD.POLE_TOP, POD.POLE_BOT - POD.POLE_TOP, "metal", { val: px === POD.POLE_X ? 0.8 : 0.45 });
    b.disc(px, POD.POLE_TOP - 1, 1, "metal", { val: 0.9 });
  }
  b.rect(-40, 126, 220, 140, "stone", { val: 0.22 });

  const mid = createAlbedo(200, 120, -30, 120);
  const m = painter(mid);
  const tier = (x: number, y: number, w: number, v: number) => {
    m.rect(x, y, w, 200 - y, "plaster", { val: v, jitter: 0.03, seed: x });
    m.hline(x, y, w, "ivoryLit", { val: 0.9, ny: -1 });
    m.shade(x + w, y, 2, 200 - y, 0.5);
  };
  tier(POD.X - 46, POD.TOP + 18, 30, 0.5);
  tier(POD.X + 20, POD.TOP + 26, 30, 0.45);
  tier(POD.X - 16, POD.TOP, 36, 0.62);
  m.rect(-30, 200, 200, 40, "woodDark", { val: 0.3 });

  const near = createAlbedo(220, 70, -40, 196);
  const n = painter(near);
  // photographers' heads and lenses, out of focus
  for (const [hx, hy] of [[-6, 222], [26, 228], [118, 224]] as const) {
    n.disc(hx, hy, 10, "sky", { val: 0.3 });
    n.rect(hx + 6, hy - 4, 12, 6, "metal", { val: 0.4 });
  }
  n.rect(-40, 232, 220, 40, "sky", { val: 0.25 });
  return { back, mid, near };
};

// ---------------------------------------------------------------- Jakarta parade (F)
export const JKT = { STREET_T: 130, CAR_Y: 158, MONAS_X: 104 };
export const jakarta = (monas = true) => {
  const back = createAlbedo(320, 200, -90, -60);
  const b = painter(back);
  for (let y = -60; y < 118; y++) b.hline(-90, y, 320, "dusk", { val: 0.42 + (y / 118) * 0.45, jitter: 0.04, seed: 41 });
  b.disc(30, 70, 10, "amberLamp", { val: 0.95, emit: 0.9 }); // low sun
  const M = JKT.MONAS_X;
  if (monas) {
  // Monas silhouette: base, tapering obelisk, cup and flame
  b.rect(M - 18, 106, 36, 12, "stone", { val: 0.25 });
  b.rect(M - 10, 100, 20, 6, "stone", { val: 0.28 });
  b.poly([[M - 4, 100], [M + 4, 100], [M + 2, 34], [M - 2, 34]], "stone", { val: 0.3 });
  b.rect(M - 5, 31, 10, 3, "stone", { val: 0.32 });
  b.poly([[M - 2, 31], [M + 2, 31], [M, 23]], "amberLamp", { val: 1, emit: 0.85 });
  } else {
    // ceremony flagpole on a stepped plinth (the flag itself is drawn in HTML so it can rise)
    b.rect(M - 12, 108, 24, 10, "stone", { val: 0.5 });
    b.rect(M - 8, 104, 16, 4, "stone", { val: 0.55 });
    b.vline(M, 30, 74, "metal", { val: 0.85 });
    b.disc(M, 29, 1, "metal", { val: 0.95 });
  }
  // towers
  const r = rng(43);
  for (let x = -90; x < 230; x += 9) {
    if (Math.abs(x - M) < (monas ? 22 : 16)) continue;
    const h = 14 + Math.floor(r() * 30);
    b.rect(x, 118 - h, 8, h, "stone", { val: 0.16 + r() * 0.08 });
    for (let k = 0; k < 4; k++) if (r() < 0.5) b.put(x + 2 + Math.floor(r() * 4), 118 - h + 3 + Math.floor(r() * (h - 6)), "amberLamp", { val: 0.85, emit: 0.6 });
  }

  const mid = createAlbedo(340, 120, -100, 112);
  const m = painter(mid);
  crowd(m, -100, 114, 340, JKT.STREET_T - 114, 1992, 14);
  for (let y = JKT.STREET_T; y < 200; y++) m.hline(-100, y, 340, "stone", { val: 0.38 + ((y - JKT.STREET_T) / 70) * 0.1, jitter: 0.05, seed: y });
  for (let x = -100; x < 240; x += 16) m.rect(x, JKT.CAR_Y + 8, 8, 1, "ivoryLit", { val: 0.6 });
  // banner pole near the start of the route (the AUDIRA banner text is drawn over it)
  m.vline(-6, 88, 44, "metal", { val: 0.6 });
  m.vline(40, 88, 44, "metal", { val: 0.6 });
  m.rect(-6, 88, 47, 10, "book1", { val: 0.6 });

  const near = createAlbedo(340, 70, -100, 186);
  const n = painter(near);
  crowd(n, -100, 192, 340, 50, 7, 10, 3);
  return { back, mid, near };
};
