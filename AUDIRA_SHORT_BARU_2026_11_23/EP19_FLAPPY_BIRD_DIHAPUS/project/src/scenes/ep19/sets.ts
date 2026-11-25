// EP19 sets, painted once into albedo (material + value) and relit per frame. Art px (8 screen px each);
// visible frame at rest 0..135 × 0..240. Subjects above art row 160 (caption band 1290–1540 screen px).
//   deskSet()    A / D1 / OUT  night desk: wall + window + shelf (back), desk + phone on a stand + coin jar + lamp (mid), keyboard (near)
//   roomSet()    B / D2        small Hanoi room: wall + rooftop window with cables (back), desk + laptop + coder from behind (mid), chair + floor (near)
//   citySet()    C1            city at dusk: towers (back), giant chart billboard + street (mid), crowd with phones (near)
//   storeSet()   E1            app shop wall: shelves of app boxes with one empty slot (back/mid), counter (near)
//   auctionSet() E2            gallery: dark wall (back), pedestal + glass case + velvet cushion (mid), rope barrier (near)
import { rng } from "../../kits/pixelstory/core/noise.ts";
import { createAlbedo, painter } from "../../kits/pixelstory/environment/albedo.ts";
import { books, desk, deskLamp, floor, keyboard, mug, nightWindow, shelf } from "../../kits/pixelstory/environment/props.ts";

// ---------------------------------------------------------------- desk (A, D1, OUT)
/** Phone body and its screen (art px). The screen itself is drawn in HTML on top. */
export const DESK = {
  TOP: 160,
  PHONE: { x: 40, y: 64, w: 54, h: 96 },
  SCREEN: { x: 43, y: 72, w: 48, h: 80 },
  JAR: { x: 102, y: 132, w: 22, h: 28 },
  LAMP: { x: 128, y: 160 },
  WIN: { x: -2, y: 18, w: 34, h: 50 },
};
export const deskSet = () => {
  const back = createAlbedo(240, 320, -50, -70);
  const b = painter(back);
  for (let y = -70; y < DESK.TOP; y++) b.hline(-50, y, 240, "plaster", { val: 0.36 + (y / 200) * 0.12, jitter: 0.05, seed: 7 });
  const w = DESK.WIN;
  nightWindow(b, w.x, w.y, w.w, w.h, 19);
  shelf(b, 98, 52, 40);
  books(b, 100, 52, 34, 4, ["jar"]);
  // a pinned pixel-art sketch of the bird on paper
  b.rect(100, 70, 16, 14, "paper", { val: 0.75, jitter: 0.04, seed: 3 });
  b.disc(108, 77, 3.5, "amberLamp", { val: 0.75 });
  b.put(110, 76, "ivoryLit", { val: 1 });
  floor(b, -50, DESK.TOP, 240, 90, 21);

  const mid = createAlbedo(240, 140, -50, 40);
  const m = painter(mid);
  desk(m, -50, DESK.TOP, 240, 250);
  const P0 = DESK.PHONE;
  // stand: a bent wire cradle behind the phone
  m.rect(P0.x + 18, P0.y + P0.h - 4, 18, 4, "metal", { val: 0.55 });
  m.hline(P0.x + 14, DESK.TOP - 1, 26, "metal", { val: 0.8, ny: -1 });
  // phone body: dark rounded slab, lit top edge, side button
  m.rect(P0.x, P0.y + 2, P0.w, P0.h - 4, "metal", { val: 0.22 });
  m.rect(P0.x + 2, P0.y, P0.w - 4, P0.h, "metal", { val: 0.22 });
  m.hline(P0.x + 2, P0.y, P0.w - 4, "metal", { val: 0.7, ny: -1 });
  m.vline(P0.x, P0.y + 2, P0.h - 4, "metal", { val: 0.45 });
  m.rect(P0.x + P0.w, P0.y + 20, 1, 8, "metal", { val: 0.6 });
  m.rect(P0.x + 22, P0.y + 3, 10, 2, "sky", { val: 0.08 });
  const S = DESK.SCREEN;
  m.rect(S.x, S.y, S.w, S.h, "screen", { val: 0.06 });
  // coin jar (glass: rim, outline, faint fill)
  const J = DESK.JAR;
  for (let y = J.y; y < J.y + J.h; y++) {
    m.put(J.x, y, "ivoryLit", { val: 0.45 });
    m.put(J.x + J.w - 1, y, "ivoryLit", { val: 0.55 });
  }
  m.rect(J.x + 1, J.y + 2, J.w - 2, J.h - 2, "sky", { val: 0.18 });
  m.rect(J.x - 1, J.y - 2, J.w + 2, 3, "metal", { val: 0.65, ny: -1 });
  m.hline(J.x, J.y + J.h - 1, J.w, "ivoryLit", { val: 0.6 });
  mug(m, 2, DESK.TOP);
  const lamp = deskLamp(m, DESK.LAMP.x, DESK.LAMP.y);

  const near = createAlbedo(240, 80, -50, 190);
  const n = painter(near);
  keyboard(n, -20, 206, 120);
  n.rect(-20, 210, 120, 8, "metal", { val: 0.25 });
  n.rect(-50, 226, 240, 40, "woodDark", { val: 0.22 });
  return { back, mid, near, bulb: lamp.bulb, lampAngle: lamp.angle };
};

// ---------------------------------------------------------------- Hanoi room (B, D2)
export const ROOM = {
  TOP: 150,
  WIN: { x: 6, y: 14, w: 58, h: 66 },
  LAPTOP: { x: 72, y: 116, w: 44, h: 30 },
  CODER: { x: 46, y: 176 },
  POSTER: { x: 104, y: 40, w: 26, h: 34 },
};
export const roomSet = () => {
  const back = createAlbedo(240, 320, -50, -70);
  const b = painter(back);
  for (let y = -70; y < ROOM.TOP; y++) b.hline(-50, y, 240, "plaster", { val: 0.32 + (y / 220) * 0.1, jitter: 0.06, seed: 11 });
  // water stain + exposed wiring along the ceiling (small, old room)
  b.hline(-50, -2, 240, "woodDark", { val: 0.45 });
  for (let x = -50; x < 190; x++) b.put(x, 2 + Math.round(Math.sin(x * 0.18) * 1.5), "metal", { val: 0.35 });
  const w = ROOM.WIN;
  nightWindow(b, w.x, w.y, w.w, w.h, 41);
  // overhead cables crossing the window (Hanoi street view)
  for (const [y0, y1] of [[w.y + 10, w.y + 22], [w.y + 16, w.y + 12], [w.y + 26, w.y + 30]] as const) b.line(w.x + 3, y0, w.x + w.w - 4, y1, "sky", { val: 0.05 });
  // poster frame (AUDIRA label drawn in HTML)
  const po = ROOM.POSTER;
  b.rect(po.x, po.y, po.w, po.h, "frame", { val: 0.35 });
  b.rect(po.x + 2, po.y + 2, po.w - 4, po.h - 4, "book1", { val: 0.45 });
  b.disc(po.x + 13, po.y + 15, 5, "amberLamp", { val: 0.7 });
  floor(b, -50, ROOM.TOP, 240, 100, 33);

  const mid = createAlbedo(240, 140, -50, 80);
  const m = painter(mid);
  desk(m, 20, ROOM.TOP, 130, 240);
  const L = ROOM.LAPTOP;
  // laptop open, screen facing the coder (we look over the shoulder: the screen faces us)
  m.rect(L.x - 2, L.y - 2, L.w + 4, L.h + 4, "metal", { val: 0.35 });
  m.hline(L.x - 2, L.y - 2, L.w + 4, "metal", { val: 0.7, ny: -1 });
  m.rect(L.x, L.y, L.w, L.h, "screen", { val: 0.06 });
  m.poly([[L.x - 6, ROOM.TOP], [L.x + L.w + 6, ROOM.TOP], [L.x + L.w + 2, L.y + L.h + 2], [L.x - 2, L.y + L.h + 2]], "metal", { val: 0.5, ny: -1 });
  // noodle bowl + chopsticks, stacked papers
  m.rect(126, ROOM.TOP - 5, 12, 5, "paper", { val: 0.7 });
  m.hline(125, ROOM.TOP - 6, 14, "paper", { val: 0.95, ny: -1 });
  m.line(128, ROOM.TOP - 12, 136, ROOM.TOP - 6, "wood", { val: 0.8 });
  m.rect(28, ROOM.TOP - 4, 18, 4, "paper", { val: 0.65 });

  const near = createAlbedo(240, 80, -50, 186);
  const n = painter(near);
  n.rect(-50, 226, 240, 40, "woodDark", { val: 0.2 });
  n.rect(20, 210, 50, 6, "woodDark", { val: 0.35 });
  return { back, mid, near };
};

// ---------------------------------------------------------------- city at dusk (C1)
export const CITY = { BOARD: { x: 8, y: 52, w: 120, h: 92 }, STREET: 164 };
export const citySet = () => {
  const back = createAlbedo(300, 260, -80, -70);
  const b = painter(back);
  for (let y = -70; y < 150; y++) b.hline(-80, y, 300, "dusk", { val: 0.3 + (y / 150) * 0.5, jitter: 0.04, seed: 51 });
  const r = rng(53);
  for (let x = -80; x < 220; x += 10) {
    const h = 40 + Math.floor(r() * 70);
    b.rect(x, 150 - h, 9, h, "stone", { val: 0.14 + r() * 0.08 });
    for (let k = 0; k < 8; k++) if (r() < 0.55) b.put(x + 2 + Math.floor(r() * 5), 150 - h + 3 + Math.floor(r() * (h - 6)), "amberLamp", { val: 0.85, emit: 0.6 });
  }
  for (let y = 150; y < 190; y++) b.hline(-80, y, 300, "stone", { val: 0.3, jitter: 0.05, seed: y });

  const mid = createAlbedo(300, 200, -80, 30);
  const m = painter(mid);
  const B = CITY.BOARD;
  // billboard frame, scaffold legs, lamp row
  m.rect(B.x - 3, B.y - 3, B.w + 6, B.h + 6, "metal", { val: 0.4 });
  m.hline(B.x - 3, B.y - 3, B.w + 6, "metal", { val: 0.8, ny: -1 });
  m.rect(B.x, B.y, B.w, B.h, "screen", { val: 0.05 });
  for (const lx of [B.x + 20, B.x + B.w - 22]) {
    m.rect(lx, B.y + B.h + 3, 4, CITY.STREET - B.y - B.h - 3, "metal", { val: 0.35 });
    m.line(lx, B.y + B.h + 6, lx + 12, CITY.STREET - 2, "metal", { val: 0.3 });
  }
  for (let x = B.x; x < B.x + B.w; x += 12) m.rect(x + 4, B.y - 6, 4, 3, "amberLamp", { val: 0.9, emit: 0.7 });
  for (let y = CITY.STREET; y < 230; y++) m.hline(-80, y, 300, "stone", { val: 0.36 + ((y - CITY.STREET) / 70) * 0.1, jitter: 0.05, seed: y * 3 });
  for (let x = -80; x < 220; x += 16) m.rect(x, CITY.STREET + 10, 8, 1, "ivoryLit", { val: 0.55 });

  const near = createAlbedo(300, 90, -80, 176);
  const n = painter(near);
  // crowd heads looking at their phones
  const q = rng(57);
  for (let x = -76; x < 216; x += 9) {
    const hy = 190 + Math.floor(q() * 8);
    n.disc(x, hy, 4, "sky", { val: 0.22 + q() * 0.08 });
    n.rect(x - 6, hy + 4, 12, 40, "sky", { val: 0.2 });
  }
  return { back, mid, near };
};

// ---------------------------------------------------------------- app shop wall (E1)
export const STORE = { SLOT: { x: 52, y: 92, w: 30, h: 30 }, COUNTER: 166 };
export const storeSet = () => {
  const back = createAlbedo(260, 320, -60, -70);
  const b = painter(back);
  for (let y = -70; y < STORE.COUNTER; y++) b.hline(-60, y, 260, "plaster", { val: 0.42 + (y / 260) * 0.1, jitter: 0.04, seed: 61 });
  const r = rng(63);
  const mats = ["book1", "book2", "book3", "teal", "amberLamp", "paper"] as const;
  // four shelves of square app boxes; one slot (centre, row 2) is empty
  for (let row = 0; row < 4; row++) {
    const y = 26 + row * 34;
    shelf(b, -56, y + 30, 250);
    for (let x = -54; x < 186; x += 34) {
      const S = STORE.SLOT;
      if (row === 2 && x === S.x - 2) continue;
      const mm = mats[Math.floor(r() * mats.length)];
      b.rect(x + 2, y, 28, 28, mm, { val: 0.55 + r() * 0.2 });
      b.hline(x + 2, y, 28, mm, { val: 0.9, ny: -1 });
      b.shade(x + 2, y + 25, 28, 3, 0.6);
      b.disc(x + 16, y + 13, 6, "ivoryLit", { val: 0.5 + r() * 0.3 });
    }
  }
  floor(b, -60, STORE.COUNTER, 260, 90, 65);

  const mid = createAlbedo(260, 100, -60, 150);
  const m = painter(mid);
  m.rect(-60, STORE.COUNTER, 260, 6, "wood", { val: 0.75, ny: -1 });
  m.rect(-60, STORE.COUNTER + 6, 260, 40, "woodDark", { val: 0.35 });

  const near = createAlbedo(260, 80, -60, 196);
  const n = painter(near);
  n.rect(-60, 222, 260, 40, "woodDark", { val: 0.2 });
  return { back, mid, near };
};

// ---------------------------------------------------------------- auction gallery (E2)
export const AUC = { CASE: { x: 40, y: 82, w: 56, h: 60 }, PED: { x: 34, y: 142, w: 68 }, FLOOR: 176 };
export const auctionSet = () => {
  const back = createAlbedo(260, 320, -60, -70);
  const b = painter(back);
  for (let y = -70; y < AUC.FLOOR; y++) b.hline(-60, y, 260, "book1", { val: 0.18 + (y / 260) * 0.08, jitter: 0.04, seed: 71 });
  // wall panelling
  for (let x = -60; x < 200; x += 26) b.vline(x, -70, AUC.FLOOR + 70, "book1", { val: 0.1 });
  floor(b, -60, AUC.FLOOR, 260, 90, 73);

  const mid = createAlbedo(260, 140, -60, 70);
  const m = painter(mid);
  const P0 = AUC.PED;
  m.rect(P0.x, P0.y, P0.w, AUC.FLOOR - P0.y, "plaster", { val: 0.62, jitter: 0.03, seed: 2 });
  m.hline(P0.x, P0.y, P0.w, "ivoryLit", { val: 0.9, ny: -1 });
  m.shade(P0.x + P0.w - 6, P0.y, 6, AUC.FLOOR - P0.y, 0.6);
  // velvet cushion
  const C0 = AUC.CASE;
  m.rect(C0.x + 6, P0.y - 8, C0.w - 12, 8, "book1", { val: 0.7, jitter: 0.06, seed: 5 });
  m.hline(C0.x + 6, P0.y - 8, C0.w - 12, "book1", { val: 1, ny: -1 });
  // glass case: frame edges only
  for (let y = C0.y; y < P0.y; y++) {
    m.put(C0.x, y, "ivoryLit", { val: 0.5 });
    m.put(C0.x + C0.w - 1, y, "ivoryLit", { val: 0.6 });
  }
  m.hline(C0.x, C0.y, C0.w, "ivoryLit", { val: 0.75 });
  m.line(C0.x + 6, C0.y + 4, C0.x + 16, C0.y + 30, "ivoryLit", { val: 0.35 });

  const near = createAlbedo(260, 90, -60, 180);
  const n = painter(near);
  // rope barrier posts
  for (const px of [-20, 150]) {
    n.rect(px, 186, 4, 40, "metal", { val: 0.6 });
    n.disc(px + 2, 186, 3, "metal", { val: 0.85 });
  }
  for (let x = -18; x < 152; x++) n.put(x, 196 + Math.round(Math.sin(((x + 18) / 170) * Math.PI) * 8), "book1", { val: 0.75 });
  n.rect(-60, 230, 260, 40, "woodDark", { val: 0.2 });
  return { back, mid, near };
};
