// EP10 film: canvas textures for the props that only the film uses (labels, ribbon, plaques,
// final scoreboard). Seeded only, system fonts only, cached per key (same as coverTextures).
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";
import { canvasTex } from "./coverTextures.ts";

const HEAVY = (px: number) => `900 ${px}px 'Arial Black', 'Segoe UI Black', 'Segoe UI', sans-serif`;

function speckle(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, n: number, a = 0.05) {
  const r = prng(seed);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = r() > 0.5 ? `rgba(255,255,255,${r() * a})` : `rgba(0,0,0,${r() * a})`;
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
}
function fit(ctx: CanvasRenderingContext2D, txt: string, x: number, y: number, maxW: number, px: number) {
  ctx.font = HEAVY(px);
  const m = ctx.measureText(txt).width;
  if (m > maxW) ctx.font = HEAVY(Math.floor((px * maxW) / m));
  ctx.fillText(txt, x, y);
}

/** Domino face carrying a minute (white enamel or Brazil yellow). */
export const minuteDomino = (txt: string, bg: string, ink: string, seed: number) =>
  canvasTex(`fdom-${txt}-${bg}`, 368, 560, (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, seed, 3000);
    ctx.fillStyle = ink;
    ctx.fillRect(0, 0, w, 38);
    ctx.fillRect(0, h - 38, w, 38);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    fit(ctx, txt, w / 2 + 6, h * 0.52, w * 0.9, 200);
  });

/** Painted plywood sign: dark ink on plywood, optional accent stripe. */
export const signBoard = (key: string, lines: [string, string][], w = 1024, h = 384, bg = "#D8B27E", stripe = "#2BD46A") =>
  canvasTex(`sign-${key}`, w, h, (ctx) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    const r = prng(key.length * 31 + 7);
    // wood grain
    for (let i = 0; i < 90; i++) {
      ctx.strokeStyle = `rgba(90,55,25,${0.04 + r() * 0.06})`;
      ctx.lineWidth = 1 + r() * 3;
      const y = r() * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.3, y + (r() - 0.5) * 30, w * 0.6, y + (r() - 0.5) * 30, w, y + (r() - 0.5) * 20);
      ctx.stroke();
    }
    speckle(ctx, w, h, key.length * 7, 4000);
    ctx.fillStyle = stripe;
    ctx.fillRect(0, 0, w, 26);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const n = lines.length;
    lines.forEach(([txt, col], i) => {
      ctx.fillStyle = col;
      fit(ctx, txt, w / 2, 26 + ((h - 26) * (i + 0.5)) / n, w * 0.9, Math.floor(((h - 26) / n) * 0.72));
    });
  });

/** One half of the "62 laga" ribbon (yellow cloth, green text). */
export const ribbonHalf = (txt: string, side: 0 | 1) =>
  canvasTex(`ribbon-${side}`, 1024, 200, (ctx, w, h) => {
    ctx.fillStyle = "#F7D21C";
    ctx.fillRect(0, 0, w, h);
    const r = prng(77 + side);
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = r() > 0.5 ? `rgba(255,255,255,${r() * 0.07})` : `rgba(80,60,0,${r() * 0.08})`;
      ctx.fillRect(r() * w, r() * h, 1, 2 + r() * 3);
    }
    ctx.fillStyle = "#118A3E";
    ctx.fillRect(0, 10, w, 12);
    ctx.fillRect(0, h - 22, w, 12);
    ctx.fillStyle = "#0E5F2C";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    fit(ctx, txt, w / 2, h / 2 + 4, w * 0.88, 104);
    // frayed torn end
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.globalCompositeOperation = "destination-out";
    const x0 = side === 0 ? w - 26 : 0;
    for (let y = 0; y < h; y += 10) ctx.fillRect(x0 + (side === 0 ? r() * 20 : 6 - r() * 6), y, 26, 6 + r() * 6);
    ctx.globalCompositeOperation = "source-over";
  });

/** Plaque face for the Mineirazo block (with crack) and the Maracanazo ghost. */
export const plaqueFace = (title: string, year: string, bg: string, ink: string, crack: boolean) =>
  canvasTex(`plaque-${title}`, 512, 768, (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, title.length * 17, 7000, 0.07);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 16;
    ctx.strokeRect(26, 26, w - 52, h - 52);
    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    fit(ctx, title, w / 2, h * 0.36, w * 0.82, 96);
    fit(ctx, year, w / 2, h * 0.58, w * 0.6, 150);
    if (crack) {
      const r = prng(404);
      ctx.strokeStyle = "rgba(30,20,8,0.85)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      let x = w * 0.62, y = 30;
      ctx.moveTo(x, y);
      while (y < h - 30) {
        x += (r() - 0.5) * 70;
        y += 40 + r() * 40;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  });

/** Final scoreboard LED panel: AUDIRA header, JERMAN 1 / ARGENTINA 0. */
export const finalBoardFace = () =>
  canvasTex("final-board", 1600, 640, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#15181C");
    g.addColorStop(1, "#0B0D10");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.035)";
    for (let y = 8; y < h; y += 16) for (let x = 8; x < w; x += 16) ctx.fillRect(x, y, 4, 4);
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#2BD46A";
    ctx.fillRect(0, 0, w, 168);
    ctx.fillStyle = "#08130C";
    ctx.textAlign = "left";
    ctx.font = HEAVY(112);
    ctx.fillText("AUDIRA", 56, 90);
    ctx.textAlign = "right";
    ctx.font = HEAVY(92);
    ctx.fillText("FINAL 2014", w - 56, 90);
    const row = (y: number, team: string, score: string) => {
      ctx.textAlign = "left";
      ctx.fillStyle = "#F4F1EA";
      fit(ctx, team, 64, y, 1100, 150);
      ctx.textAlign = "right";
      ctx.fillStyle = "#FFB547";
      ctx.shadowColor = "#FFB547";
      ctx.shadowBlur = 26;
      ctx.font = HEAVY(196);
      ctx.fillText(score, w - 64, y);
      ctx.shadowBlur = 0;
    };
    row(300, "JERMAN", "1");
    row(518, "ARGENTINA", "0");
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    ctx.fillRect(56, 406, w - 112, 6);
  });

/** Brass bracket label: 4 GOL · 6 MENIT. */
export const bracketLabel = () =>
  canvasTex("bracket", 1024, 300, (ctx, w, h) => {
    ctx.fillStyle = "#17110D";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#F3A712";
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = "#FFF4E6";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    fit(ctx, "4 GOL · 6 MENIT", w / 2, h / 2 + 4, w * 0.86, 150);
  });

/** Net texture: white mesh on transparent. */
export const netTex = () =>
  canvasTex(
    "net",
    256,
    256,
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(250,250,245,0.9)";
      ctx.lineWidth = 3;
      for (let i = 0; i <= 8; i++) {
        ctx.beginPath();
        ctx.moveTo((i * w) / 8, 0);
        ctx.lineTo((i * w) / 8, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, (i * h) / 8);
        ctx.lineTo(w, (i * h) / 8);
        ctx.stroke();
      }
    },
    [3, 2],
  );

export type Tex = THREE.Texture;
