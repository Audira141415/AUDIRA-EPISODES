// EP07 procedural canvas textures (seeded, cached): window facades, glow sprites, wet-road
// reflection streaks, painted sign lettering. No downloaded images.
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";

const cache = new Map<string, THREE.Texture>();
const make = (key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) => {
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
};

/** Facade with a grid of windows; `lit` share are warm tungsten, a few have blinds. Emissive map. */
export const facadeTex = (seed: number, cols: number, rows: number, lit = 0.22) =>
  make(`facade:${seed}:${cols}:${rows}:${lit}`, cols * 32, rows * 40, (ctx) => {
    const r = prng(seed * 31 + 5);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, cols * 32, rows * 40);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const on = r() < lit;
        const v = on ? 0.55 + r() * 0.45 : 0.03 + r() * 0.03;
        const warm = on ? [255, 222, 170] : [120, 130, 150];
        ctx.fillStyle = `rgb(${(warm[0] * v) | 0},${(warm[1] * v) | 0},${(warm[2] * v) | 0})`;
        ctx.fillRect(x * 32 + 7, y * 40 + 8, 18, 24);
        if (on && r() < 0.5) {
          // venetian blinds in the lit window
          ctx.fillStyle = "rgba(0,0,0,0.55)";
          for (let k = 0; k < 6; k++) ctx.fillRect(x * 32 + 7, y * 40 + 9 + k * 4, 18, 2);
        }
      }
    }
  });

/** Soft round glow for sprites (white, tint with material colour). */
export const glowTex = () =>
  make("glow", 128, 128, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.18, "rgba(255,255,255,0.55)");
    g.addColorStop(0.5, "rgba(255,255,255,0.12)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  });

/** Long vertical smear for a light's reflection on wet asphalt (bright at the top = near the light). */
export const streakTex = () =>
  make("streak", 64, 256, (ctx) => {
    for (let y = 0; y < 256; y++) {
      const k = y / 255;
      const a = Math.pow(1 - k, 1.6);
      const g = ctx.createLinearGradient(0, 0, 64, 0);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.5, `rgba(255,255,255,${a})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, y, 64, 1);
    }
    // broken by ripples
    const r = prng(77);
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(0,0,0,${0.3 + r() * 0.5})`;
      ctx.fillRect(0, r() * 256, 64, 1 + r() * 3);
    }
  });

/** Painted lettering on a dark board (for in-world signs). */
export const signTex = (text: string, opts: { bg?: string; fg?: string; font?: string; w?: number; h?: number; border?: boolean } = {}) => {
  const { bg = "#15161a", fg = "#efe6d2", font = "700 120px Georgia, serif", w = 1024, h = 256, border = true } = opts;
  return make(`sign:${text}:${bg}:${fg}:${font}:${w}:${h}`, w, h, (ctx) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    if (border) {
      ctx.strokeStyle = fg;
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 8;
      ctx.strokeRect(14, 14, w - 28, h - 28);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = fg;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const spaced = text.split("").join(String.fromCharCode(8202));
    ctx.fillText(spaced, w / 2, h / 2 + 6);
  });
};

/** Bobby's handwritten note: cream paper, faint ruling, ink in `font`. `paras` = text visible so far
 *  (one string per paragraph); the last word can be partly inked (`inkLast` 0..1). Cached per state. */
export const NOTE_W = 900, NOTE_H = 1240;
export const noteTex = (paras: string[], inkLastRaw: number, font: string, fontReady: boolean) => {
  const inkLast = Math.round(inkLastRaw * 4) / 4;
  const key = `note:${paras.join("|")}:${inkLast}:${font}:${fontReady}`;
  // keep only the current note state in memory (each one is a 900x1240 canvas)
  for (const [k, tex] of cache) if (k.startsWith("note:") && k !== key) { tex.dispose(); cache.delete(k); }
  return make(key, NOTE_W, NOTE_H, (ctx) => {
    const r = prng(611);
    ctx.fillStyle = "#e9e1cf";
    ctx.fillRect(0, 0, NOTE_W, NOTE_H);
    // paper mottling
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(120,100,70,${r() * 0.05})`;
      ctx.fillRect(r() * NOTE_W, r() * NOTE_H, 2 + r() * 30, 2 + r() * 30);
    }
    ctx.strokeStyle = "rgba(90,110,140,0.22)";
    ctx.lineWidth = 2;
    for (let y = 150; y < NOTE_H - 40; y += 62) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(NOTE_W - 40, y);
      ctx.stroke();
    }
    ctx.fillStyle = "#1d2433";
    ctx.font = `46px ${font}`;
    ctx.textBaseline = "alphabetic";
    let y = 140;
    const maxW = NOTE_W - 120;
    paras.forEach((para, pi) => {
      const words = para.split(" ").filter(Boolean);
      let line = "";
      let x0 = 60;
      const flush = (txt: string, last: boolean) => {
        if (last && pi === paras.length - 1 && inkLast < 1) {
          // the word being written: draw it clipped left-to-right
          const w = ctx.measureText(txt).width;
          const prefix = txt.slice(0, txt.lastIndexOf(" ") + 1);
          const pw = ctx.measureText(prefix).width;
          ctx.save();
          ctx.beginPath();
          ctx.rect(x0, y - 60, pw + (w - pw) * inkLast, 80);
          ctx.clip();
          ctx.fillText(txt, x0, y);
          ctx.restore();
        } else ctx.fillText(txt, x0, y);
        y += 62;
      };
      words.forEach((w, i) => {
        const test = line ? `${line} ${w}` : w;
        if (ctx.measureText(test).width > maxW && line) {
          flush(line, false);
          line = w;
        } else line = test;
        if (i === words.length - 1) flush(line, true);
      });
      y += 18;
      x0 = 60;
    });
  });
};
