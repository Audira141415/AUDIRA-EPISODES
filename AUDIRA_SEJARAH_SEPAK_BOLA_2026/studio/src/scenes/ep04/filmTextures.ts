// EP04 film: extra canvas textures (gap plaques, film banner, shelf strips, PSG plaques, football).
// Seeded, system serif fonts only (same rules as coverTextures.ts).
import { prng } from "../../core/materials/textures.ts";
import { canvasTex } from "./coverTextures.ts";

function brass(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, dark = false) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, dark ? "#6E5A36" : "#B8924A");
  g.addColorStop(0.5, dark ? "#8A7346" : "#D9B76A");
  g.addColorStop(1, dark ? "#5E4C2E" : "#A07C38");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const r = prng(seed);
  for (let i = 0; i < h * 1.4; i++) {
    ctx.fillStyle = `rgba(${r() > 0.5 ? "255,240,200" : "80,55,20"},${0.04 + r() * 0.06})`;
    ctx.fillRect(0, r() * h, w, 1);
  }
  ctx.strokeStyle = "rgba(60,40,12,0.8)";
  ctx.lineWidth = Math.max(3, h * 0.035);
  ctx.strokeRect(h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12);
}

function engrave(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, ink = "#2A1C0A", align: CanvasTextAlign = "center") {
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255,236,180,0.5)";
  ctx.fillText(text, x, y + 3);
  ctx.fillStyle = ink;
  ctx.fillText(text, x, y);
}

/** Tarnished plaque for the empty plinths of the 32-year drought. */
export const gapPlaque = () =>
  canvasTex("gap-plaque", 512, 192, (ctx, w, h) => {
    brass(ctx, w, h, 1967, true);
    engrave(ctx, "—", w / 2, h / 2, "bold 110px Georgia, 'Times New Roman', serif", "#2A1C0A");
  });

/** Back-wall banner for the film: same as the cover's, with a larger AUDIRA line. */
export const filmBanner = () =>
  canvasTex("film-banner", 768, 1280, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, "#2A1440");
    g.addColorStop(0.5, "#4A2675");
    g.addColorStop(1, "#2A1440");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const r = prng(404);
    for (let i = 0; i < 2200; i++) {
      ctx.fillStyle = `rgba(${r() > 0.5 ? "190,150,255" : "10,0,20"},${0.03 + r() * 0.05})`;
      ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 4 + r() * 18);
    }
    ctx.strokeStyle = "#D8B25E";
    ctx.lineWidth = 14;
    ctx.strokeRect(36, 36, w - 72, h - 72);
    ctx.lineWidth = 4;
    ctx.strokeRect(62, 62, w - 124, h - 124);
    ctx.fillStyle = "#E4C276";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 132px Georgia, 'Times New Roman', serif";
    ctx.fillText("REAL", w / 2, h * 0.22);
    ctx.fillText("MADRID", w / 2, h * 0.33);
    ctx.font = "bold 64px Georgia, 'Times New Roman', serif";
    ctx.fillText("1956 — 2024", w / 2, h * 0.44);
    ctx.fillRect(w * 0.3, h * 0.13, w * 0.4, 6);
    ctx.fillRect(w * 0.3, h * 0.5, w * 0.4, 6);
    ctx.font = "bold 84px Georgia, 'Times New Roman', serif";
    ctx.fillText("KOLEKSI", w / 2, h * 0.6);
    ctx.fillText("AUDIRA", w / 2, h * 0.68);
  });

/** Long brass strip on the front edge of a trophy shelf. */
export const tierStrip = (key: string, text: string, accent: string[]) =>
  canvasTex(`tier-${key}`, 2048, 96, (ctx, w, h) => {
    brass(ctx, w, h, key.length * 31);
    // club colour chips (generic colours, no crest)
    ctx.font = "bold 58px Georgia, 'Times New Roman', serif";
    const tw = ctx.measureText(text).width;
    const x0 = w / 2 - (tw + accent.length * 34 + 16) / 2;
    accent.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(x0 + i * 34, 20, 30, h - 40);
    });
    engrave(ctx, text, x0 + accent.length * 34 + 16, h / 2 + 2, "bold 58px Georgia, 'Times New Roman', serif", "#2A1C0A", "left");
  });

export const psgPlaque = (year: number) =>
  canvasTex(`psg-${year}`, 512, 192, (ctx, w, h) => {
    ctx.fillStyle = "#0B2A5B";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#DA1A32";
    ctx.fillRect(w * 0.44, 0, w * 0.12, h);
    ctx.strokeStyle = "#D8B25E";
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = "#F4F1EA";
    ctx.font = "bold 74px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`PSG ${year}`, w / 2, h / 2 + 3);
  });

/** Classic panelled football, as an equirect map (generic). */
export const ballTexture = () =>
  canvasTex("ball", 512, 256, (ctx, w, h) => {
    ctx.fillStyle = "#F2EFE8";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1C1A1E";
    const r = prng(1960);
    const pent = (cx: number, cy: number, s: number, sx: number) => {
      ctx.beginPath();
      for (let k = 0; k < 5; k++) {
        const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
        ctx.lineTo(cx + Math.cos(a) * s * sx, cy + Math.sin(a) * s);
      }
      ctx.closePath();
      ctx.fill();
    };
    pent(w * 0.5, h * 0.06, 18, 4);
    pent(w * 0.5, h * 0.94, 18, 4);
    for (let i = 0; i < 5; i++) {
      pent((i / 5) * w + w * 0.1, h * 0.36, 26, 1.1);
      pent((i / 5) * w + w * 0.0, h * 0.64, 26, 1.1);
    }
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = `rgba(80,70,60,${0.03 + r() * 0.04})`;
      ctx.fillRect(r() * w, r() * h, 2, 2);
    }
  });

/** Engraved brass name plaque for the era steles (no likeness of real people). */
export const namePlaque = (key: string, l1: string, l2: string, l3: string) =>
  canvasTex(`name-${key}`, 512, 640, (ctx, w, h) => {
    brass(ctx, w, h, key.length * 97);
    engrave(ctx, l1, w / 2, h * 0.24, "bold 62px Georgia, 'Times New Roman', serif");
    engrave(ctx, l2, w / 2, h * 0.42, "bold 78px Georgia, 'Times New Roman', serif");
    ctx.fillStyle = "rgba(60,40,12,0.8)";
    ctx.fillRect(w * 0.25, h * 0.55, w * 0.5, 5);
    engrave(ctx, l3, w / 2, h * 0.7, "bold 48px Georgia, 'Times New Roman', serif");
  });
