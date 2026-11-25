// AE-065 VINTAGEFORGE: seeded canvas textures (parchment, copper-plate hatching, ashlar stone,
// water strokes, engraved brass). All seeded, so every render tab draws the same pixels.
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";

export const INK = "#2b1b10";
export const PAL = {
  parchment: "#efe2c4",
  parchmentLight: "#f6ecd6",
  stone: "#d9c6a0",
  stoneDark: "#b99c70",
  wood: "#a8743f",
  iron: "#4a3a2c",
  terracotta: "#b85a3f",
  gold: "#c5a059",
  verdigris: "#52796f",
  ink: INK,
} as const;

const cache = new Map<string, THREE.CanvasTexture>();
const make = (key: string, size: number, draw: (ctx: CanvasRenderingContext2D, rnd: () => number) => void, seed: number) => {
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return new THREE.CanvasTexture(undefined as unknown as HTMLCanvasElement);
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  draw(ctx, prng(seed));
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
};

const blotches = (ctx: CanvasRenderingContext2D, rnd: () => number, size: number, n: number, a: number) => {
  for (let i = 0; i < n; i++) {
    const x = rnd() * size, y = rnd() * size, r = 20 + rnd() * size * 0.25;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(120,80,40,${a * rnd()})`);
    g.addColorStop(1, "rgba(120,80,40,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
};

const hatchLines = (ctx: CanvasRenderingContext2D, rnd: () => number, size: number, spacing: number, angle: number, alpha: number, w = 1.4) => {
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate(angle);
  ctx.strokeStyle = INK;
  for (let o = -size; o < size; o += spacing * (0.8 + rnd() * 0.4)) {
    ctx.globalAlpha = alpha * (0.6 + rnd() * 0.4);
    ctx.lineWidth = w * (0.7 + rnd() * 0.6);
    ctx.beginPath();
    const y0 = o + (rnd() - 0.5) * 2;
    ctx.moveTo(-size, y0);
    ctx.lineTo(size, y0 + (rnd() - 0.5) * 3);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
};

/** Parchment with copper-plate hatching. density 0 = clean paper, 1 = light, 2 = cross-hatched. */
export const hatchTex = (base: string, density: 0 | 1 | 2 | 3, seed = 3) =>
  make(`hatch:${base}:${density}:${seed}`, 512, (ctx, rnd) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 512, 512);
    blotches(ctx, rnd, 512, 14, 0.12);
    if (density >= 1) hatchLines(ctx, rnd, 512, 11, -Math.PI / 4, 0.32);
    if (density >= 2) hatchLines(ctx, rnd, 512, 13, Math.PI / 4, 0.28);
    if (density >= 3) hatchLines(ctx, rnd, 512, 7, 0, 0.3);
  }, seed);

/** Section-cut fill: terracotta wash with dense 45° engraving lines (the classic cut-face hatch). */
export const sectionTex = () =>
  make("section", 256, (ctx, rnd) => {
    ctx.fillStyle = "#c9785a";
    ctx.fillRect(0, 0, 256, 256);
    blotches(ctx, rnd, 256, 8, 0.2);
    hatchLines(ctx, rnd, 256, 7, -Math.PI / 4, 0.55, 1.6);
  }, 11);

/** Ashlar masonry: staggered courses of blocks, inked joints, a few hatched blocks. */
export const stoneTex = (seed = 5) =>
  make(`stone:${seed}`, 512, (ctx, rnd) => {
    ctx.fillStyle = PAL.stone;
    ctx.fillRect(0, 0, 512, 512);
    blotches(ctx, rnd, 512, 18, 0.16);
    const rows = 8, rh = 512 / rows;
    for (let r = 0; r < rows; r++) {
      let x = r % 2 ? -40 : 0;
      while (x < 512) {
        const w = 70 + rnd() * 60;
        if (rnd() < 0.35) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(x, r * rh, w, rh);
          ctx.clip();
          hatchLines(ctx, rnd, 512, 9, -Math.PI / 4, 0.18, 1.1);
          ctx.restore();
        }
        ctx.strokeStyle = INK;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, r * rh + 1, w - 2, rh - 2);
        ctx.globalAlpha = 1;
        x += w;
      }
    }
  }, seed);

/** River surface: parchment with engraved horizontal water lines and ripple arcs. */
export const waterTex = () =>
  make("water2", 512, (ctx, rnd) => {
    ctx.fillStyle = "#eadcba";
    ctx.fillRect(0, 0, 512, 512);
    blotches(ctx, rnd, 512, 10, 0.1);
    ctx.strokeStyle = INK;
    for (let y = 4; y < 512; y += 9 + rnd() * 4) {
      let x = rnd() * 40;
      while (x < 512) {
        const w = 30 + rnd() * 120;
        ctx.globalAlpha = 0.25 + rnd() * 0.35;
        ctx.lineWidth = 1.2 + rnd() * 1.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + w / 2, y + (rnd() - 0.5) * 4, x + w, y);
        ctx.stroke();
        x += w + 10 + rnd() * 40;
      }
    }
    for (let i = 0; i < 26; i++) {
      const x = rnd() * 512, y = rnd() * 512, w = 30 + rnd() * 40;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y + w, w, -Math.PI * 0.72, -Math.PI * 0.28);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, 21);

/** Sailcloth: parchment canvas with vertical seam lines and a reef band. */
export const sailTex = () =>
  make("sail", 256, (ctx, rnd) => {
    ctx.fillStyle = "#f2e6c9";
    ctx.fillRect(0, 0, 256, 256);
    blotches(ctx, rnd, 256, 6, 0.14);
    ctx.strokeStyle = INK;
    for (let x = 0; x <= 256; x += 32) {
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (rnd() - 0.5) * 3, 256);
      ctx.stroke();
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 5, 0);
      ctx.lineTo(x + 5, 256);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 2;
    for (const y of [40, 48]) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
    for (let x = 12; x < 256; x += 22) {
      ctx.beginPath();
      ctx.arc(x, 44, 2.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, 31);

/** Engraved brass plate with a name in serif capitals. */
export const plateTex = (text: string, sub: string, fit = false) =>
  make(`plate:${text}:${sub}${fit ? ":fit" : ""}`, 512, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 512, 512);
    g.addColorStop(0, "#e2c27a");
    g.addColorStop(0.5, "#c5a059");
    g.addColorStop(1, "#9a7a3a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = "#5a3d1a";
    ctx.lineWidth = 10;
    ctx.strokeRect(16, 16, 480, 480);
    ctx.lineWidth = 3;
    ctx.strokeRect(34, 34, 444, 444);
    ctx.fillStyle = "#3a2410";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let size = 128;
    ctx.font = `bold ${size}px 'Palatino Linotype', 'Book Antiqua', Georgia, serif`;
    // fit=true: shrink until the name sits inside the inner frame with a margin (film close-up)
    while (fit && ctx.measureText(text).width > 360 && size > 40) {
      size -= 4;
      ctx.font = `bold ${size}px 'Palatino Linotype', 'Book Antiqua', Georgia, serif`;
    }
    ctx.fillText(text, 256, fit ? 236 : 230);
    ctx.font = "italic 44px 'Palatino Linotype', Georgia, serif";
    ctx.fillText(sub, 256, 350);
  }, 1);
