// EP01 canvas textures: desk wood, the glowing prompt screen, the AUDIRA brick print.
// Seeded only (prng) and system/loaded fonts only, so every render tab draws the same pixels.
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

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Warm oak desk planks with seeded grain lines. */
export const woodTexture = () =>
  canvasTex("wood", 1024, 1024, (ctx, w, h) => {
    const r = prng(23);
    const planks = 6;
    const ph = h / planks;
    for (let i = 0; i < planks; i++) {
      const base = 0.85 + r() * 0.2;
      ctx.fillStyle = `rgb(${Math.round(128 * base)},${Math.round(84 * base)},${Math.round(46 * base)})`;
      ctx.fillRect(0, i * ph, w, ph);
      for (let g = 0; g < 46; g++) {
        const y0 = i * ph + r() * ph;
        ctx.strokeStyle = `rgba(${r() < 0.5 ? "60,34,14" : "170,120,72"},${0.08 + r() * 0.16})`;
        ctx.lineWidth = 1 + r() * 2.5;
        ctx.beginPath();
        ctx.moveTo(0, y0);
        for (let x = 0; x <= w; x += 64) ctx.lineTo(x, y0 + Math.sin(x * 0.006 + g) * (2 + r() * 5));
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(25,12,4,0.55)";
      ctx.fillRect(0, i * ph, w, 3);
    }
  });

/** The AI prompt screen (our own UI, not a copy of any real app). */
export const promptTexture = () =>
  canvasTex("prompt", 1400, 880, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#0E2A3A");
    g.addColorStop(1, "#071520");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // header
    ctx.fillStyle = "#7FE7FF";
    ctx.font = "800 64px 'Segoe UI', Arial, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText("✦ BUAT DENGAN AI", 70, 60);
    // prompt field
    roundRect(ctx, 60, 180, w - 120, 380, 36);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#39D2FF";
    ctx.stroke();
    ctx.fillStyle = "#F4FAFF";
    ctx.font = "700 74px 'Segoe UI', Arial, sans-serif";
    const lines = ["bikin obby lava,", "kastil & arena balap", "dari balok"];
    lines.forEach((s, i) => ctx.fillText(s, 110, 220 + i * 100));
    // caret
    ctx.fillStyle = "#FFD23F";
    ctx.fillRect(110 + ctx.measureText(lines[2]).width + 14, 424, 10, 80);
    // button
    roundRect(ctx, w - 560, 620, 500, 180, 90);
    const bg = ctx.createLinearGradient(w - 560, 0, w - 60, 0);
    bg.addColorStop(0, "#FFC83A");
    bg.addColorStop(1, "#FF8A1F");
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.fillStyle = "#1B1206";
    ctx.font = "900 84px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("BUAT ▶", w - 470, 662);
    // little brick icons on the left of the button
    const cols = ["#E53935", "#1E88E5", "#43A047", "#FDD835"];
    cols.forEach((c, i) => {
      roundRect(ctx, 80 + i * 120, 660, 96, 64, 12);
      ctx.fillStyle = c;
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.arc(80 + i * 120 + 28, 650, 16, 0, Math.PI * 2);
      ctx.arc(80 + i * 120 + 68, 650, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c;
    });
  });

/** "AUDIRA" printed tile for the front of a white brick. */
export const audiraTexture = () =>
  canvasTex("audira", 1024, 200, (ctx, w, h) => {
    ctx.fillStyle = "#F4F4F0";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#14532D";
    ctx.font = "900 132px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUDIRA", w / 2, h / 2 + 6);
  });

/** Soft round glow sprite. */
export const glowTexture = () =>
  canvasTex("glow", 256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

export type SignLine = { text: string; size: number; color?: string; weight?: number };

/** Printed brick tile: rounded colour panel with centred lines of bold text. */
export const signTexture = (key: string, w: number, h: number, bg: string, lines: SignLine[], fg = "#FFFFFF") =>
  canvasTex(`sign-${key}`, w, h, (ctx, W, H) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    // soft inner frame so the print reads as a moulded tile
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = Math.round(H * 0.025);
    roundRect(ctx, H * 0.05, H * 0.05, W - H * 0.1, H - H * 0.1, H * 0.08);
    ctx.stroke();
    const total = lines.reduce((a, l) => a + l.size * 1.12, 0);
    let y = (H - total) / 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (const l of lines) {
      ctx.fillStyle = l.color ?? fg;
      ctx.font = `${l.weight ?? 900} ${l.size}px 'Segoe UI', Arial, sans-serif`;
      let size = l.size;
      while (ctx.measureText(l.text).width > W * 0.9 && size > 10) {
        size -= 4;
        ctx.font = `${l.weight ?? 900} ${size}px 'Segoe UI', Arial, sans-serif`;
      }
      ctx.fillText(l.text, W / 2, y + (l.size - size) / 2);
      y += l.size * 1.12;
    }
  });

/** Outro screen on the same tablet: next-episode teaser. */
export const outroScreenTexture = () =>
  canvasTex("prompt-outro", 1400, 880, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#0E2A3A");
    g.addColorStop(1, "#071520");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.textBaseline = "top";
    ctx.fillStyle = "#7FE7FF";
    ctx.font = "800 64px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("\u2726 EPISODE BERIKUTNYA", 70, 60);
    ctx.fillStyle = "#F4FAFF";
    ctx.font = "900 92px 'Segoe UI', Arial, sans-serif";
    ["kenapa map baru", "bisa viral dalam", "90 hari?"].forEach((s, i) => ctx.fillText(s, 70, 200 + i * 116));
    roundRect(ctx, w - 620, 640, 560, 180, 90);
    const bg = ctx.createLinearGradient(w - 620, 0, w - 60, 0);
    bg.addColorStop(0, "#FFC83A");
    bg.addColorStop(1, "#FF8A1F");
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.fillStyle = "#1B1206";
    ctx.font = "900 78px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("IKUTI AUDIRA", w - 590, 686);
  });

/** Tablet screen with no small text (used while other boards carry the beat). */
export const blankScreenTexture = () =>
  canvasTex("prompt-blank", 700, 440, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#0E2A3A");
    g.addColorStop(1, "#071520");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#7FE7FF";
    ctx.font = "800 200px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\u2726", w / 2, h / 2);
  });
