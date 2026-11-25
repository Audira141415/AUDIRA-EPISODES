// EP04 — invented, generic blocky-game thumbnails (16:9) for the CRT wall.
// All art is original: simple blocks, no real game art, no logos. Seeded, no Math.random.
import * as THREE from "three";
import { ARCADE_PALETTE as P } from "../../kits/arcadecrt/lib/palette";
import { rng } from "../../kits/arcadecrt/core/motion";

export type ThumbKind = "hero" | "obby" | "tycoon" | "race" | "robux" | "default" | "tower" | "pets";

export const THUMB = { w: 384, h: 216 };

type Ctx = CanvasRenderingContext2D;

/** Tiny blocky avatar drawn with rects (feet at x, y). */
const figure = (ctx: Ctx, x: number, y: number, s: number, torso = "#0d69ac", legs = "#a4bd47", armsUp = false) => {
  ctx.fillStyle = legs;
  ctx.fillRect(x - s, y - 2 * s, 0.95 * s, 2 * s);
  ctx.fillRect(x + 0.05 * s, y - 2 * s, 0.95 * s, 2 * s);
  ctx.fillStyle = torso;
  ctx.fillRect(x - s, y - 4 * s, 2 * s, 2 * s);
  ctx.fillStyle = "#f5cd30";
  if (armsUp) {
    ctx.fillRect(x - 2 * s, y - 6 * s, 0.95 * s, 2.2 * s);
    ctx.fillRect(x + 1.05 * s, y - 6 * s, 0.95 * s, 2.2 * s);
  } else {
    ctx.fillRect(x - 2 * s, y - 4 * s, 0.95 * s, 2 * s);
    ctx.fillRect(x + 1.05 * s, y - 4 * s, 0.95 * s, 2 * s);
  }
  ctx.fillRect(x - 0.6 * s, y - 5.3 * s, 1.2 * s, 1.2 * s);
  ctx.fillStyle = "#1b1b1f";
  ctx.fillRect(x - 0.35 * s, y - 4.95 * s, 0.18 * s, 0.25 * s);
  ctx.fillRect(x + 0.17 * s, y - 4.95 * s, 0.18 * s, 0.25 * s);
};

const block = (ctx: Ctx, x: number, y: number, w: number, h: number, top: string, side: string) => {
  ctx.fillStyle = side;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = top;
  ctx.fillRect(x, y, w, Math.max(3, h * 0.28));
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(x, y + h - 3, w, 3);
};

const outlined = (ctx: Ctx, text: string, x: number, y: number, size: number, fill: string, stroke: string) => {
  ctx.font = `900 ${size}px 'Arial Black', Impact, sans-serif`;
  ctx.lineJoin = "round";
  ctx.lineWidth = size * 0.22;
  ctx.strokeStyle = stroke;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
};

const DRAW: Record<ThumbKind, (ctx: Ctx, r: () => number) => void> = {
  hero: (ctx, r) => {
    const { w, h } = THUMB;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#1B4DFF");
    g.addColorStop(0.55, "#2EC8FF");
    g.addColorStop(1, "#B6F4FF");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // sun + rays
    ctx.fillStyle = "rgba(255,240,150,0.35)";
    for (let k = 0; k < 10; k++) {
      ctx.beginPath();
      ctx.moveTo(300, 52);
      const a = (k / 10) * Math.PI * 2;
      ctx.lineTo(300 + Math.cos(a) * 260, 52 + Math.sin(a) * 260);
      ctx.lineTo(300 + Math.cos(a + 0.18) * 260, 52 + Math.sin(a + 0.18) * 260);
      ctx.fill();
    }
    ctx.fillStyle = P.yellow;
    ctx.beginPath();
    ctx.arc(300, 52, 30, 0, Math.PI * 2);
    ctx.fill();
    // clouds
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    for (const [cx, cy] of [[60, 50], [170, 30], [250, 110]]) {
      ctx.fillRect(cx, cy, 46, 12);
      ctx.fillRect(cx + 10, cy - 8, 26, 10);
    }
    // floating islands
    const isl = (x: number, y: number, wd: number) => {
      block(ctx, x, y, wd, 22, "#5CFF7A", "#9A5B2E");
      ctx.fillStyle = "#6E3E1C";
      ctx.fillRect(x + wd * 0.2, y + 22, wd * 0.6, 10);
      ctx.fillRect(x + wd * 0.4, y + 32, wd * 0.2, 8);
    };
    isl(18, 150, 110);
    isl(160, 112, 70);
    isl(258, 160, 110);
    // coins
    ctx.fillStyle = P.yellow;
    for (let i = 0; i < 6; i++) ctx.fillRect(140 + i * 22, 84 - Math.sin(i * 0.8) * 18, 8, 12);
    // jump arc leaving the frame (the hero has jumped out of the screen)
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(70, 150);
    ctx.quadraticCurveTo(200, 10, 360, 200);
    ctx.stroke();
    ctx.setLineDash([]);
    figure(ctx, 70, 150, 6, "#0d69ac", "#a4bd47");
    void r;
  },
  obby: (ctx, r) => {
    const { w, h } = THUMB;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#2A0A3D");
    g.addColorStop(1, "#FF4A1F");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#FF8A1F";
    ctx.fillRect(0, 176, w, 40);
    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = r() > 0.5 ? "#FFD23F" : "#FF2E1F";
      ctx.fillRect(r() * w, 176 + r() * 30, 8, 4);
    }
    for (let i = 0; i < 5; i++) block(ctx, 20 + i * 74, 150 - i * 20, 44, 14, "#2EF2FF", "#7A2DFF");
    figure(ctx, 262, 70, 5.5, "#FF2E88", "#120A33");
  },
  tycoon: (ctx, r) => {
    const { w, h } = THUMB;
    ctx.fillStyle = "#8FE3FF";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#3DBB4A";
    ctx.fillRect(0, 150, w, 66);
    for (let i = 0; i < 6; i++) {
      const bh = 50 + r() * 90;
      block(ctx, 20 + i * 60, 150 - bh, 46, bh, "#E8E8F0", ["#4A6CFF", "#FF8A1F", "#9AA3B5"][i % 3]);
      ctx.fillStyle = "#FFF6B0";
      for (let k = 0; k < bh / 18 - 1; k++) ctx.fillRect(28 + i * 60, 150 - bh + 12 + k * 18, 10, 8);
    }
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 186, w, 10);
    figure(ctx, 190, 186, 5);
  },
  race: (ctx, r) => {
    const { w, h } = THUMB;
    ctx.fillStyle = "#FF9E5E";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#2E8B3E";
    ctx.fillRect(0, 100, w, 116);
    ctx.fillStyle = "#3A3A46";
    ctx.beginPath();
    ctx.moveTo(170, 100);
    ctx.lineTo(214, 100);
    ctx.lineTo(380, 216);
    ctx.lineTo(4, 216);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    for (let k = 0; k < 5; k++) ctx.fillRect(190 - k * 2, 110 + k * 22, 4 + k * 2, 12);
    block(ctx, 120, 160, 70, 30, "#FF2E1F", "#B21010");
    block(ctx, 220, 130, 50, 22, "#2EF2FF", "#1A6AA0");
    void r;
  },
  robux: (ctx, r) => {
    const { w, h } = THUMB;
    ctx.fillStyle = "#FFD23F";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#FF8A1F";
    for (let k = 0; k < 14; k++) {
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      const a = (k / 14) * Math.PI * 2;
      ctx.lineTo(w / 2 + Math.cos(a) * 300, h / 2 + Math.sin(a) * 300);
      ctx.lineTo(w / 2 + Math.cos(a + 0.2) * 300, h / 2 + Math.sin(a + 0.2) * 300);
      ctx.fill();
    }
    ctx.textAlign = "center";
    outlined(ctx, "ROBUX!", w / 2, 110, 74, "#FFFFFF", "#D01818");
    outlined(ctx, "PLAY NOW", w / 2, 178, 42, "#FFFFFF", "#111111");
    void r;
  },
  default: (ctx) => {
    const { w, h } = THUMB;
    ctx.fillStyle = "#7C7F86";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#A6A9B0";
    ctx.fillRect(132, 58, 120, 96);
    ctx.fillStyle = "#7C7F86";
    ctx.beginPath();
    ctx.moveTo(144, 144);
    ctx.lineTo(180, 100);
    ctx.lineTo(206, 128);
    ctx.lineTo(222, 112);
    ctx.lineTo(242, 144);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(222, 80, 10, 0, Math.PI * 2);
    ctx.fill();
  },
  tower: (ctx, r) => {
    const { w, h } = THUMB;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#120A33");
    g.addColorStop(1, "#7A2DFF");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const cols = ["#FF2E88", "#2EF2FF", "#FFD23F", "#5CFF7A", "#FF8A1F"];
    for (let i = 0; i < 9; i++) block(ctx, 150 + (r() - 0.5) * 30, 196 - i * 22, 84, 20, cols[i % 5], "#241050");
    figure(ctx, 190, 0 + 196 - 9 * 22 + 2, 4.5, "#FFD23F", "#2E2E2E", true);
  },
  pets: (ctx, r) => {
    const { w, h } = THUMB;
    ctx.fillStyle = "#FFC2E2";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#8EF2C4";
    ctx.fillRect(0, 160, w, 56);
    const cols = ["#FFFFFF", "#FFD23F", "#7FD8FF", "#C79BFF"];
    for (let i = 0; i < 4; i++) {
      const x = 60 + i * 86, y = 150 - r() * 16, s = 26 + r() * 12;
      ctx.fillStyle = cols[i];
      ctx.fillRect(x - s, y - s * 1.4, s * 2, s * 1.4);
      ctx.fillRect(x - s * 0.9, y - s * 1.8, s * 0.5, s * 0.5);
      ctx.fillRect(x + s * 0.4, y - s * 1.8, s * 0.5, s * 0.5);
      ctx.fillStyle = "#1b1b1f";
      ctx.fillRect(x - s * 0.5, y - s, 6, 8);
      ctx.fillRect(x + s * 0.3, y - s, 6, 8);
    }
  },
};

/** Desaturate + darken in place: the "sinking", ignored thumbnail. */
const dimPixels = (ctx: Ctx, grey: number, dark: number) => {
  const { w, h } = THUMB;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const l = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
    d[i] = (d[i] + (l - d[i]) * grey) * dark;
    d[i + 1] = (d[i + 1] + (l - d[i + 1]) * grey) * dark;
    d[i + 2] = (d[i + 2] + (l - d[i + 2]) * grey + 6) * dark;
  }
  ctx.putImageData(img, 0, 0);
};

const cache = new Map<string, THREE.CanvasTexture>();
/** Thumbnail texture. grey 0..1 = desaturation, dark 0..1 = brightness multiplier. */
export const thumbTexture = (kind: ThumbKind, seed: number, grey = 0, dark = 1): THREE.CanvasTexture => {
  const key = `${kind}-${seed}-${grey}-${dark}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = THUMB.w;
  c.height = THUMB.h;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  DRAW[kind](ctx, rng(seed));
  if (grey > 0 || dark < 1) dimPixels(ctx, grey, dark);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  cache.set(key, t);
  return t;
};

/** Small plate texture for the hero monitor: AUDIRA brand badge. */
export const badgeTexture = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 96;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#0A0816";
    ctx.fillRect(0, 0, 512, 96);
    ctx.strokeStyle = P.magenta;
    ctx.lineWidth = 6;
    ctx.strokeRect(5, 5, 502, 86);
    ctx.textBaseline = "middle";
    ctx.font = "900 54px 'Arial Black', Impact, sans-serif";
    ctx.fillStyle = P.magenta;
    ctx.fillText("AUDIRA", 26, 50);
    ctx.font = "700 34px 'Courier New', monospace";
    ctx.fillStyle = P.cyan;
    ctx.textAlign = "right";
    ctx.fillText("CH-04", 488, 50);
    t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };
})();

/** Small tag under a dim screen: e.g. "DEFAULT". */
const tagCache = new Map<string, THREE.CanvasTexture>();
export const tagTexture = (text: string, color: string) => {
  const key = text + color;
  const hit = tagCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#06050C";
  ctx.fillRect(0, 0, 256, 64);
  ctx.font = "700 36px 'Courier New', monospace";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 34);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  tagCache.set(key, t);
  return t;
};

/** Draw a thumbnail kind straight into a 384×216 context (for per-frame canvases). */
export const drawThumb = (ctx: CanvasRenderingContext2D, kind: ThumbKind, seed: number) => DRAW[kind](ctx, rng(seed));
export const drawFigure = figure;
export const drawOutlined = outlined;
