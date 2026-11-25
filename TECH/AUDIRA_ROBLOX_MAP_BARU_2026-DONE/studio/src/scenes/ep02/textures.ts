// EP02 canvas textures: engraved brass plaques, acrylic tags, walnut grain, gallery wall.
// Seeded only (prng), bundled fonts only (fonts.ts must be ready before the first call).
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";
import { DISPLAY, TEXT } from "./fonts.ts";

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

const cache = new Map<string, THREE.Texture>();
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

/** Horizontal brushing streaks (machined metal), seeded. */
function brush(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, light: string, dark: string) {
  const r = prng(seed);
  for (let i = 0; i < h * 0.9; i++) {
    ctx.strokeStyle = r() > 0.5 ? light : dark;
    ctx.globalAlpha = 0.05 + r() * 0.08;
    ctx.lineWidth = 0.6 + r() * 1.4;
    const y = r() * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y + (r() - 0.5) * 3);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export type PlaqueLine = { text: string; size: number; font?: "display" | "text"; weight?: number; color?: string; track?: number };

/**
 * Engraved plaque: base colour, brushed, bevel frame, centred lines (engraved = dark fill + light
 * lower lip so it reads as cut into the metal).
 */
export function plaque(key: string, w: number, h: number, base: string, ink: string, lines: PlaqueLine[], seed = 5, frame = true) {
  return canvasTex(key, w, h, (ctx) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    brush(ctx, w, h, seed, "#ffffff", "#000000");
    if (frame) {
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 6;
      ctx.strokeRect(14, 14, w - 28, h - 28);
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, w - 40, h - 40);
    }
    const total = lines.reduce((s, l) => s + l.size * 1.12, 0);
    let y = (h - total) / 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (const l of lines) {
      const fam = l.font === "display" ? DISPLAY : TEXT;
      ctx.font = `${l.weight ?? 700} ${l.size}px "${fam}"`;
      if ("letterSpacing" in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = `${l.track ?? 0}px`;
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillText(l.text, w / 2, y + 2);
      ctx.fillStyle = l.color ?? ink;
      ctx.fillText(l.text, w / 2, y);
      y += l.size * 1.12;
    }
  });
}

/** Dark walnut end-grain/face grain, seeded. */
export const walnutTexture = () =>
  canvasTex("ep02-walnut", 1024, 512, (ctx, w, h) => {
    ctx.fillStyle = "#2A1B14";
    ctx.fillRect(0, 0, w, h);
    const r = prng(41);
    for (let i = 0; i < 260; i++) {
      const y0 = r() * h;
      const amp = 2 + r() * 10;
      const ph = r() * 10;
      ctx.strokeStyle = r() > 0.5 ? `rgba(92,60,38,${0.15 + r() * 0.3})` : `rgba(10,6,4,${0.2 + r() * 0.35})`;
      ctx.lineWidth = 0.6 + r() * 2.4;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 16) {
        const y = y0 + Math.sin(x * 0.006 + ph) * amp + Math.sin(x * 0.021 + ph * 2) * amp * 0.3;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  });

/** Gallery back wall: soft pool of light around the sculpture, dark falloff. */
export const wallTexture = () =>
  canvasTex("ep02-wall", 1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = "#16171A";
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w * 0.52, h * 0.55, 20, w * 0.52, h * 0.55, w * 0.62);
    g.addColorStop(0, "#4A4740");
    g.addColorStop(0.45, "#2A2A2C");
    g.addColorStop(1, "#141518");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const r = prng(77);
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = `rgba(255,255,255,${r() * 0.025})`;
      ctx.fillRect(r() * w, r() * h, 1.5, 1.5);
    }
  });
