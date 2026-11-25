// EP03 film: canvas HUD textures for 3D labels (bar labels, agency nodes). System fonts only.
import * as THREE from "three";

const cache = new Map<string, THREE.CanvasTexture>();
function canvasTex(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void): THREE.Texture {
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

const panel = (ctx: CanvasRenderingContext2D, w: number, h: number, color: string) => {
  ctx.fillStyle = "rgba(6,14,28,0.9)";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, w - 8, h - 8);
  ctx.fillStyle = color;
  ctx.fillRect(4, 4, 18, h - 8);
};

/** Bar label: big number + two short lines (scope, period). */
export const labelTexture = (big: string, l1: string, l2: string, color: string) =>
  canvasTex(`lab|${big}|${l1}|${l2}`, 1136, 800, (ctx, w, h) => {
    panel(ctx, w, h, color);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f0f8ff";
    ctx.font = "700 250px 'Bahnschrift', 'Arial Narrow', Arial, sans-serif";
    ctx.fillText(big, w / 2, 300);
    ctx.fillStyle = color;
    ctx.font = "700 112px 'Bahnschrift', 'Arial Narrow', Arial, sans-serif";
    ctx.fillText(l1, w / 2, 490);
    ctx.fillStyle = "#d0f7ff";
    ctx.fillText(l2, w / 2, 660);
  });

/** Agency node plate: plain text name (no logo). */
export const nodeTexture = (text: string, color: string) =>
  canvasTex(`node|${text}|${color}`, 880, 400, (ctx, w, h) => {
    panel(ctx, w, h, color);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#f0f8ff";
    ctx.font = "700 210px 'Bahnschrift', 'Arial Narrow', Arial, sans-serif";
    ctx.fillText(text, w / 2 + 10, h / 2 + 8);
  });
