// EP03 cover: canvas-drawn HUD textures (table surface, AUDIRA plaque, glow sprites).
// Seeded only, system fonts only, so every render tab draws the same pixels.
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

const cache = new Map<string, THREE.CanvasTexture>();
function canvasTex(key: string, w: number, h: number, draw: Draw): THREE.Texture {
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
}

/** Holo-table top: dark glass with a dot matrix, lat/lon graticule and edge ticks. */
export const tableTexture = () =>
  canvasTex("table", 2048, 1024, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.55);
    g.addColorStop(0, "#0d2238");
    g.addColorStop(0.7, "#081426");
    g.addColorStop(1, "#050a16");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // dot matrix
    const r = prng(11);
    for (let y = 12; y < h; y += 22) {
      for (let x = 12; x < w; x += 22) {
        const a = 0.12 + r() * 0.1;
        ctx.fillStyle = `rgba(0,240,255,${a})`;
        ctx.fillRect(x, y, 2.5, 2.5);
      }
    }
    // graticule
    ctx.strokeStyle = "rgba(0,240,255,0.22)";
    ctx.lineWidth = 2;
    for (let i = 1; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo((i * w) / 10, 0);
      ctx.lineTo((i * w) / 10, h);
      ctx.stroke();
    }
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (i * h) / 5);
      ctx.lineTo(w, (i * h) / 5);
      ctx.stroke();
    }
    // equator, brighter
    ctx.strokeStyle = "rgba(0,240,255,0.45)";
    ctx.setLineDash([18, 12]);
    ctx.beginPath();
    ctx.moveTo(0, h * 0.4);
    ctx.lineTo(w, h * 0.4);
    ctx.stroke();
    ctx.setLineDash([]);
  });

/** Bezel plaque: the in-world AUDIRA brand tag. */
export const plaqueTexture = () =>
  canvasTex("plaque", 1600, 180, (ctx, w, h) => {
    ctx.fillStyle = "#06101f";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    // corner notches
    ctx.fillStyle = "#00f0ff";
    for (const [x, y] of [[8, 8], [w - 44, 8], [8, h - 20], [w - 44, h - 20]]) ctx.fillRect(x, y, 36, 12);
    ctx.font = "700 92px 'Consolas', 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#d0f7ff";
    ctx.fillText("AUDIRA // THREAT DESK", w / 2, h / 2 + 4);
  });

/** Soft radial glow (white core, used with a tint colour). */
export const glowTexture = () =>
  canvasTex("glow", 256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.18, "rgba(255,255,255,0.55)");
    g.addColorStop(0.5, "rgba(255,255,255,0.12)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
