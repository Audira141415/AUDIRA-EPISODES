// EP06 CRT rasters (96 × 128 px, nearest filter). Our own game "KASTIL PIKSEL": no real game art, logos or sprites.
import { ARCADE_PALETTE as P } from "../../../kits/arcadecrt/lib/palette";
import { SPRITE, SPRITE_COLORS } from "../../../kits/arcadecrt/core/game";
import type { Draw } from "./Cab";

export const RAINBOW = ["#FF2E88", "#FF8A1F", "#FFD23F", "#5CFF7A", "#2EF2FF", "#7A2DFF"];
// Smooth hue blend, 1.2 colour steps per second: the old 6 Hz hard step strobed the whole D2 wall (qa_video LONCAT, photosensitivity).
const hex = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
export const rainbow = (t: number, off = 0) => {
  const x = t * 1.2 + off, i = Math.floor(x), f = x - i;
  const a = hex(RAINBOW[i % RAINBOW.length]), b = hex(RAINBOW[(i + 1) % RAINBOW.length]);
  return "#" + a.map((v, k) => Math.round(v + (b[k] - v) * f).toString(16).padStart(2, "0")).join("");
};
const DOT = "#B8BEC8";

const sky = (ctx: CanvasRenderingContext2D, col = P.gameSky) => {
  ctx.fillStyle = col;
  ctx.fillRect(0, 0, 96, 128);
};
const text = (ctx: CanvasRenderingContext2D, s: string, x: number, y: number, col: string, size = 8, align: CanvasTextAlign = "center") => {
  ctx.fillStyle = col;
  ctx.font = `bold ${size}px monospace`;
  ctx.textAlign = align;
  ctx.fillText(s, x, y);
  ctx.textAlign = "left";
};
export const sprite = (ctx: CanvasRenderingContext2D, x: number, y: number) =>
  SPRITE.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      if (row[i] === ".") continue;
      ctx.fillStyle = SPRITE_COLORS[row[i]];
      ctx.fillRect(Math.round(x + i), Math.round(y + j), 1, 1);
    }
  });
const hud = (ctx: CanvasRenderingContext2D, left: string, right: string) => {
  text(ctx, left, 3, 9, P.white, 8, "left");
  text(ctx, right, 93, 9, P.cyan, 8, "right");
};
// maze walls (8 px cells) — a corridor room seen top-down
const MAZE = [
  "XXXXXXXXXXXX",
  "X..........X",
  "X.XXXX.XXX.X",
  "X.X......X.X",
  "X.X.XXXX.X.X",
  "X...X..X...X",
  "XXX.X..X.XXX",
  "X...X..X...X",
  "X.XXX..XXX.X",
  "X..........X",
  "X.XXXXXXXX.X",
  "X..........X",
  "XXXXX..XXXXX",
  "XXXXXXXXXXXX",
];
const maze = (ctx: CanvasRenderingContext2D, col: string, top = 14) =>
  MAZE.forEach((row, j) => {
    for (let i = 0; i < row.length; i++)
      if (row[i] === "X") {
        ctx.fillStyle = col;
        ctx.fillRect(i * 8, top + j * 8, 8, 8);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(i * 8, top + j * 8 + 6, 8, 2);
      }
  });

/** Hook: the maze, one blinking gray pixel, then a row of hidden letters. */
export const drawHook = (nameAt: number): Draw => (ctx, t) => {
  sky(ctx, "#0C0826");
  maze(ctx, P.brick);
  hud(ctx, "1UP 000000", "HI 001980");
  if (Math.floor(t * 3) % 2 === 0 || t > 2.4) {
    ctx.fillStyle = DOT;
    ctx.fillRect(44, 62, 1, 1);
  }
  // pulse ring around the pixel
  const r = 3 + ((t * 6) % 6);
  ctx.strokeStyle = P.yellow;
  ctx.lineWidth = 1;
  ctx.strokeRect(44.5 - r, 62.5 - r, r * 2, r * 2);
  sprite(ctx, 14, 92);
  if (t >= nameAt) {
    const n = Math.min(7, Math.floor((t - nameAt) * 10));
    text(ctx, "?".repeat(n), 48, 82, rainbow(t), 9);
  }
};

/** Cartridge box art: GAME, the maker's line wiped (erase 0..1), red strike when struck. */
export const drawBox = (erase: (t: number) => number, struck: (t: number) => boolean, hue: string): Draw => (ctx, t) => {
  sky(ctx, "#140A2E");
  ctx.fillStyle = hue;
  ctx.fillRect(12, 16, 72, 96);
  ctx.fillStyle = "#0B0820";
  ctx.fillRect(16, 20, 64, 52);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = RAINBOW[i];
    ctx.fillRect(22 + i * 11, 58 - i * 6, 8, 8 + i * 6);
  }
  text(ctx, "GAME", 48, 34, P.yellow, 12);
  text(ctx, "BY:", 18, 88, P.white, 8, "left");
  const e = erase(t);
  ctx.fillStyle = P.white;
  for (let i = 0; i < 5; i++) if (i / 5 >= e) ctx.fillRect(38 + i * 8, 82, 6, 7);
  if (struck(t)) {
    ctx.fillStyle = "#FF2E3E";
    ctx.fillRect(14, 84, 68, 3);
    text(ctx, "X", 48, 108, "#FF2E3E", 12);
  }
};

const CODE = ["LDA #$1F", "STA ROOM", "JSR DRAW", "LDX DOT", "CMP #$00", "BNE WALL", "INC ROOM", "JMP LOOP", "STA COLR", "RTS"];
/** Programmer's screen: scrolling code → secret room "W.R." → "1980". */
export const drawDev = (roomAt: number, relAt: number): Draw => (ctx, t) => {
  sky(ctx, "#041410");
  if (t >= relAt) {
    text(ctx, "RILIS", 48, 44, P.phosphorGreen, 9);
    text(ctx, "1980", 48, 72, P.yellow, 22);
    sprite(ctx, 42, 92);
    return;
  }
  if (t >= roomAt) {
    ctx.fillStyle = rainbow(t, 1);
    ctx.fillRect(14, 34, 68, 4);
    ctx.fillRect(14, 86, 68, 4);
    ctx.fillRect(14, 34, 4, 56);
    ctx.fillRect(78, 34, 4, 56);
    text(ctx, "W.R.", 48, 66, rainbow(t), 14);
    text(ctx, "RAHASIA", 48, 108, P.phosphorGreen, 8);
    return;
  }
  const n = Math.floor(t * 3);
  for (let i = 0; i < 11; i++) text(ctx, CODE[(n + i) % CODE.length], 6, 18 + i * 10, P.phosphorGreen, 8, "left");
  if (Math.floor(t * 3) % 2 === 0) {
    ctx.fillStyle = P.phosphorGreen;
    ctx.fillRect(6, 120, 6, 2);
  }
};

/** Secret room as seen on the CRT (teen's screen). */
export const drawSecret: Draw = (ctx, t) => {
  sky(ctx, "#0A0620");
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = rainbow(t, i);
    ctx.fillRect(0, 14 + i * 2, 96, 2);
    ctx.fillRect(0, 112 - i * 2, 96, 2);
  }
  text(ctx, "CREATED", 48, 56, rainbow(t, 2), 10);
  text(ctx, "BY", 48, 68, rainbow(t, 3), 10);
  text(ctx, "W.R.", 48, 84, rainbow(t, 4), 12);
  sprite(ctx, 70, 92);
  ctx.fillStyle = DOT;
  ctx.fillRect(83, 99, 1, 1);
};

/** Striped egg icon (Atari's easter-egg policy). */
export const drawEgg = (seed: number): Draw => (ctx, t) => {
  sky(ctx, "#120A33");
  hud(ctx, "BONUS", "EGG");
  const cy = 66 + Math.sin(t * 3 + seed) * 3;
  for (let y = -26; y <= 26; y++) {
    const half = Math.round(18 * Math.sqrt(Math.max(0, 1 - (y / 26) ** 2)) * (y < 0 ? 0.88 : 1));
    ctx.fillStyle = RAINBOW[(Math.floor((y + 26) / 9) + seed) % RAINBOW.length];
    ctx.fillRect(48 - half, Math.round(cy + y), half * 2, 1);
  }
  text(ctx, "EASTER EGG", 48, 112, P.yellow, 8);
};

/** 1973: an anonymous lunar lander over a jagged surface (generic shape, not game art). */
export const drawLander: Draw = (ctx, t) => {
  sky(ctx, "#05040C");
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = P.white;
    ctx.fillRect((i * 37) % 96, 14 + ((i * 53) % 60), 1, 1);
  }
  ctx.strokeStyle = P.white;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const pts = [0, 100, 14, 92, 22, 104, 36, 96, 50, 108, 62, 98, 76, 102, 96, 90];
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.stroke();
  const y = 40 + ((t * 8) % 30);
  ctx.strokeRect(44, y, 8, 6);
  ctx.beginPath();
  ctx.moveTo(44, y + 6);
  ctx.lineTo(41, y + 11);
  ctx.moveTo(52, y + 6);
  ctx.lineTo(55, y + 11);
  ctx.stroke();
  text(ctx, "1973", 48, 124, P.white, 9);
};

/** 1980: the secret room in small, with the year. */
export const draw1980: Draw = (ctx, t) => {
  drawSecret(ctx, t);
  ctx.fillStyle = "#0A0620";
  ctx.fillRect(0, 114, 96, 14);
  text(ctx, "1980", 48, 124, P.yellow, 9);
};

/** Outro: attract mode with PRESS START. */
export const drawAttract: Draw = (ctx, t) => {
  sky(ctx, "#0C0826");
  maze(ctx, "#3E1592");
  text(ctx, "EASTER", 48, 52, P.yellow, 12);
  text(ctx, "EGG", 48, 68, P.yellow, 12);
  if (Math.floor(t * 2) % 2 === 0) text(ctx, "PRESS START", 48, 96, P.orange, 8);
  ctx.fillStyle = DOT;
  ctx.fillRect(44, 80, 1, 1);
};
