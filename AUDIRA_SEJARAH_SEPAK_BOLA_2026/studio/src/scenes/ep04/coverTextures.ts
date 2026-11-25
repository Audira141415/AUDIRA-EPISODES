// EP04 cover: canvas textures (brass year plaques, purple banner, AUDIRA plaque).
// Seeded only, system serif fonts only, so every render tab draws the same pixels.
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

const cache = new Map<string, THREE.CanvasTexture>();
export function canvasTex(key: string, w: number, h: number, draw: Draw): THREE.Texture {
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
}

/** Brushed brass with soft wear, seeded. */
function brass(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#B8924A");
  g.addColorStop(0.5, "#D9B76A");
  g.addColorStop(1, "#A07C38");
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

/** Engraved text: dark fill with a light lower edge so it reads as cut into the metal. */
function engrave(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, ink = "#2A1C0A") {
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255,236,180,0.55)";
  ctx.fillText(text, x, y + 3);
  ctx.fillStyle = ink;
  ctx.fillText(text, x, y);
}

export const yearPlaque = (year: number) =>
  canvasTex(`year-${year}`, 512, 192, (ctx, w, h) => {
    brass(ctx, w, h, year);
    engrave(ctx, String(year), w / 2, h / 2 + 4, "bold 120px Georgia, 'Times New Roman', serif");
  });

export const heroPlaque = () =>
  canvasTex("hero-plaque", 1024, 460, (ctx, w, h) => {
    brass(ctx, w, h, 15);
    engrave(ctx, "REAL MADRID", w / 2, h * 0.3, "bold 128px Georgia, 'Times New Roman', serif");
    engrave(ctx, "2024  ·  GELAR KE-15", w / 2, h * 0.6, "bold 72px Georgia, 'Times New Roman', serif");
    engrave(ctx, "KOLEKSI AUDIRA", w / 2, h * 0.83, "bold 42px Georgia, 'Times New Roman', serif", "#4A3414");
  });

export const audiraPlaque = () =>
  canvasTex("audira-plaque", 768, 160, (ctx, w, h) => {
    brass(ctx, w, h, 77);
    engrave(ctx, "AUDIRA  ·  KOLEKSI EROPA", w / 2, h / 2 + 2, "bold 64px Georgia, 'Times New Roman', serif");
  });

/** Purple velvet banner with gilt border and the club name (text only, no crest). */
export const bannerTexture = () =>
  canvasTex("banner", 768, 1280, (ctx, w, h) => {
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
    ctx.fillText("REAL", w / 2, h * 0.36);
    ctx.fillText("MADRID", w / 2, h * 0.48);
    ctx.font = "bold 64px Georgia, 'Times New Roman', serif";
    ctx.fillText("1956 — 2024", w / 2, h * 0.62);
    // laurel dashes (generic ornament, not a crest)
    ctx.fillRect(w * 0.3, h * 0.27, w * 0.4, 6);
    ctx.fillRect(w * 0.3, h * 0.7, w * 0.4, 6);
    ctx.font = "bold 46px Georgia, 'Times New Roman', serif";
    ctx.fillText("KOLEKSI AUDIRA", w / 2, h * 0.82);
  });
