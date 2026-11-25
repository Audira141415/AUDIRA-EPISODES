// EP04 film textures: the hero screen (redrawn per frame by beat), the Moments phone screen,
// thumbnail versions (personalisation), and 3D label faces. Original UI only, seeded, no Math.random.
import * as THREE from "three";
import { ARCADE_PALETTE as P } from "../../kits/arcadecrt/lib/palette";
import { THUMB, drawFigure, drawOutlined, drawThumb } from "./thumbTextures.ts";

type Ctx = CanvasRenderingContext2D;

const mkTex = (c: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  return t;
};

/** A live canvas texture that a draw function repaints every frame. */
export const liveCanvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { canvas: c, ctx: c.getContext("2d")!, tex: mkTex(c) };
};

// ---------------------------------------------------------------------------------------------
export type HeroMode = "thumb" | "feed" | "spec" | "video" | "trend" | "moment";

const card = (ctx: Ctx, x: number, y: number, w: number, kind: Parameters<typeof drawThumb>[1], seed: number, dim: number) => {
  const h = (w * 9) / 16;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(w / THUMB.w, h / THUMB.h);
  drawThumb(ctx, kind, seed);
  ctx.restore();
  if (dim > 0) {
    ctx.fillStyle = `rgba(20,20,28,${dim})`;
    ctx.fillRect(x, y, w, h);
  }
};

/**
 * Hero screen. `k` = beat progress 0..1 where a beat has an internal reveal
 * (feed tick, video progress, personal touch, winner glow). `t` = seconds.
 */
export const drawHero = (ctx: Ctx, mode: HeroMode, t: number, k: number) => {
  const { w, h } = THUMB;
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  if (mode === "thumb" || mode === "spec") {
    drawThumb(ctx, "hero", 1);
    if (mode === "spec") {
      // safe-area grid + corner marks
      ctx.strokeStyle = `rgba(255,255,255,${0.55 * k})`;
      ctx.lineWidth = 1;
      for (let i = 1; i < 16; i++) {
        ctx.beginPath();
        ctx.moveTo((w * i) / 16, 0);
        ctx.lineTo((w * i) / 16, h);
        ctx.stroke();
      }
      for (let j = 1; j < 9; j++) {
        ctx.beginPath();
        ctx.moveTo(0, (h * j) / 9);
        ctx.lineTo(w, (h * j) / 9);
        ctx.stroke();
      }
      ctx.strokeStyle = P.yellow;
      ctx.lineWidth = 6;
      const m = 6, L = 34;
      for (const [cx, cy, sx, sy] of [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]]) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + sy * L);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + sx * L, cy);
        ctx.stroke();
      }
    }
  } else if (mode === "feed") {
    // our own "home" feed: header + a row of recommended cards; the custom thumbnail gets a tick
    ctx.fillStyle = "#0E0B24";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1C1640";
    ctx.fillRect(0, 0, w, 34);
    ctx.fillStyle = P.white;
    ctx.font = "900 20px 'Arial Black', Impact, sans-serif";
    ctx.fillText("BERANDA", 12, 25);
    ctx.fillStyle = P.cyan;
    ctx.font = "700 15px 'Courier New', monospace";
    ctx.fillText("REKOMENDASI UNTUKMU", 12, 58);
    const cw = 172;
    card(ctx, 12, 70, cw, "hero", 1, 0);
    card(ctx, 200, 70, cw, "tower", 5, 0.15);
    card(ctx, 12 + 0, 70 + 102, cw * 0.5, "pets", 3, 0.3);
    card(ctx, 106, 172, cw * 0.5, "obby", 4, 0.3);
    card(ctx, 200, 172, cw * 0.5, "race", 6, 0.3);
    card(ctx, 294, 172, cw * 0.5, "tycoon", 7, 0.3);
    // highlight + tick on the custom thumbnail
    ctx.strokeStyle = P.phosphorGreen;
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 70, cw, (cw * 9) / 16);
    if (k > 0) {
      const s = Math.min(1, k * 2);
      ctx.fillStyle = P.phosphorGreen;
      ctx.beginPath();
      ctx.arc(160, 86, 16 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#0E0B24";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(152, 86);
      ctx.lineTo(158, 93);
      ctx.lineTo(169, 79);
      ctx.stroke();
    }
  } else if (mode === "video") {
    // the same world, now playing: the little avatar runs and jumps along the islands
    drawThumb(ctx, "hero", 1);
    // repaint the start island area to hide the static figure, then draw a moving one
    const run = (t * 0.45) % 1;
    const x = 40 + run * 300;
    const y = 150 - Math.sin(run * Math.PI) * 90;
    ctx.fillStyle = "rgba(46,200,255,0.0)";
    drawFigure(ctx, x, y, 6, "#0d69ac", "#a4bd47", true);
    // progress bar
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, h - 16, w, 16);
    ctx.fillStyle = "#FF2E1F";
    ctx.fillRect(0, h - 16, w * k, 6);
    // play badge for the first moment, then the muted speaker icon
    if (k < 0.08) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = P.white;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 12, h / 2 - 20);
      ctx.lineTo(w / 2 + 22, h / 2);
      ctx.lineTo(w / 2 - 12, h / 2 + 20);
      ctx.fill();
    }
  } else if (mode === "trend") {
    // a trend-style thumbnail; the "personal touch" (k) adds our own hero, border and sticker
    drawThumb(ctx, "obby", 11);
    if (k > 0) {
      ctx.globalAlpha = Math.min(1, k * 1.5);
      ctx.strokeStyle = P.magenta;
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, w - 10, h - 10);
      drawFigure(ctx, 110, 190, 13, P.cyan, "#a4bd47", true);
      // star sticker
      ctx.fillStyle = P.yellow;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2 + t * 0.6;
        const r = i % 2 ? 16 : 38;
        const px = 300 + Math.cos(a) * r, py = 62 + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  } else if (mode === "moment") {
    // "the best moment of your map": hero mid-jump, big, with motion streaks
    drawThumb(ctx, "hero", 1);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (let i = 0; i < 6; i++) ctx.fillRect(120 - i * 16, 120 + i * 9, 50, 4);
    drawFigure(ctx, 210, 182, 16, "#0d69ac", "#a4bd47", true);
    if (k > 0) {
      ctx.globalAlpha = k;
      ctx.strokeStyle = P.yellow;
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, w - 10, h - 10);
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
};

// ---------------------------------------------------------------------------------------------
// Moments phone screen (portrait 216 × 384): tabs, a playing gameplay clip, a big MAIN button.
export const PHONE = { w: 216, h: 384 };
export const drawPhone = (ctx: Ctx, t: number, press: number) => {
  const { w, h } = PHONE;
  ctx.fillStyle = "#0E0B24";
  ctx.fillRect(0, 0, w, h);
  // tabs
  ctx.font = "700 17px 'Courier New', monospace";
  ctx.fillStyle = "#77739A";
  ctx.fillText("BERANDA", 12, 28);
  ctx.fillStyle = P.white;
  ctx.font = "900 19px 'Arial Black', Impact, sans-serif";
  ctx.fillText("MOMENTS", 112, 29);
  ctx.fillStyle = P.cyan;
  ctx.fillRect(112, 36, 94, 4);
  // clip
  ctx.save();
  ctx.translate(0, 52);
  ctx.scale(w / THUMB.w * 1.0, 1.25);
  ctx.translate(-((t * 30) % 60), 0);
  drawThumb(ctx, "obby", 21);
  ctx.restore();
  ctx.fillStyle = "#0E0B24";
  ctx.fillRect(0, 52 + 270, w, h);
  const run = (t * 0.5) % 1;
  drawFigure(ctx, 30 + run * 160, 250 - Math.sin(run * Math.PI) * 70, 7, P.magenta, "#120A33", true);
  // MAIN button
  const s = 1 - 0.08 * press;
  const bw = 150 * s, bh = 46 * s;
  ctx.fillStyle = press > 0.05 ? P.yellow : P.phosphorGreen;
  ctx.fillRect(w / 2 - bw / 2, 330 - bh / 2, bw, bh);
  ctx.fillStyle = "#0E0B24";
  ctx.font = "900 26px 'Arial Black', Impact, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("▶ MAIN", w / 2, 340);
  ctx.textAlign = "left";
};

// ---------------------------------------------------------------------------------------------
// Thumbnail versions for personalisation: the same hero thumbnail, re-coloured / re-framed.
const versionCache = new Map<number, THREE.CanvasTexture>();
export const versionTexture = (i: number) => {
  const hit = versionCache.get(i);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = THUMB.w;
  c.height = THUMB.h;
  const ctx = c.getContext("2d")!;
  const tmp = document.createElement("canvas");
  tmp.width = THUMB.w;
  tmp.height = THUMB.h;
  drawThumb(tmp.getContext("2d")!, "hero", 1);
  ctx.filter = `hue-rotate(${[0, 70, 150, 220, 290][i % 5]}deg) saturate(1.2)`;
  const zoom = [1, 1.25, 1.1, 1.4, 1.15][i % 5];
  ctx.drawImage(tmp, -(zoom - 1) * THUMB.w * 0.3, -(zoom - 1) * THUMB.h * 0.4, THUMB.w * zoom, THUMB.h * zoom);
  ctx.filter = "none";
  drawFigure(ctx, [90, 250, 180, 300, 140][i % 5], 200, [9, 11, 13, 10, 12][i % 5], ["#0d69ac", P.magenta, P.orange, P.cyan, "#5CFF7A"][i % 5], "#a4bd47", i % 2 === 0);
  ctx.font = "900 34px 'Arial Black', Impact, sans-serif";
  ctx.textAlign = "right";
  drawOutlined(ctx, ["A", "B", "C", "D", "E"][i % 5], THUMB.w - 14, 44, 34, P.white, "#111");
  const t = mkTex(c);
  versionCache.set(i, t);
  return t;
};

// ---------------------------------------------------------------------------------------------
// 3D label faces: neon text on a dark plate. lines: [text, size, color][]
const labelCache = new Map<string, THREE.CanvasTexture>();
export const labelTexture = (lines: [string, number, string][], w = 512, h = 256, border = P.magenta) => {
  const key = JSON.stringify([lines, w, h, border]);
  const hit = labelCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0A0816";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = border;
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, w - 12, h - 12);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const total = lines.reduce((a, l) => a + l[1] * 1.15, 0);
  let y = h / 2 - total / 2;
  for (const [text, size, color] of lines) {
    y += (size * 1.15) / 2;
    ctx.font = `900 ${size}px 'Arial Black', Impact, sans-serif`;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillText(text, w / 2, y);
    y += (size * 1.15) / 2;
  }
  const t = mkTex(c);
  t.anisotropy = 8;
  labelCache.set(key, t);
  return t;
};

/** Big red stamp (transparent background). */
const stampCache = new Map<string, THREE.CanvasTexture>();
export const stampTexture = (text: string, w = 768, h = 192) => {
  const hit = stampCache.get(text);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.strokeStyle = "#FF3B3B";
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.fillStyle = "#FF3B3B";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let size = 96;
  ctx.font = `900 ${size}px 'Arial Black', Impact, sans-serif`;
  while (ctx.measureText(text).width > w - 70 && size > 30) {
    size -= 4;
    ctx.font = `900 ${size}px 'Arial Black', Impact, sans-serif`;
  }
  ctx.fillText(text, w / 2, h / 2 + 4);
  const t = mkTex(c);
  stampCache.set(text, t);
  return t;
};
