// HD2D surface textures: seeded canvas colour maps (cobbles, ashlar stone, timber planks, roof
// shingles). Grey-scale with a slight warm/cool drift, so the material `color` still sets the palette
// tone and the map adds stones, mortar joints and wood grain. The same texture doubles as the bump
// map (dark mortar = recessed). Seeded and cached, so every render tab paints the same pixels.
import * as THREE from "three";
import { prng } from "../../../core/materials/textures.ts";

type Kind = "cobble" | "ashlar" | "plank" | "shingle";
const cache = new Map<string, THREE.Texture>();

const tone = (rnd: () => number, lo: number, hi: number, warm = 0) => {
  const v = lo + (hi - lo) * rnd();
  const d = (rnd() - 0.5) * 0.08 + warm;
  const c = (x: number) => Math.round(Math.max(0, Math.min(1, x)) * 255);
  return `rgb(${c(v + d)},${c(v)},${c(v - d)})`;
};

const speckle = (ctx: CanvasRenderingContext2D, rnd: () => number, size: number, n: number, alpha: number) => {
  for (let i = 0; i < n; i++) {
    const g = rnd() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${g},${g},${g},${alpha * rnd()})`;
    ctx.fillRect(rnd() * size, rnd() * size, 1 + rnd() * 2, 1 + rnd() * 2);
  }
};

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
};

const paint: Record<Kind, (ctx: CanvasRenderingContext2D, rnd: () => number, S: number) => void> = {
  // rounded setts in offset rows, dark mortar
  cobble: (ctx, rnd, S) => {
    ctx.fillStyle = "rgb(58,58,62)";
    ctx.fillRect(0, 0, S, S);
    const rows = 8;
    const h = S / rows;
    for (let r = 0; r < rows; r++) {
      let x = r % 2 ? -h * 0.5 : 0;
      while (x < S) {
        const w = h * (0.8 + rnd() * 0.6);
        ctx.fillStyle = tone(rnd, 0.62, 0.98);
        roundRect(ctx, x + 3, r * h + 3, w - 6, h - 6, h * 0.3);
        // wrap the last stone so the tile repeats seamlessly
        if (x + w > S) roundRect(ctx, x - S + 3, r * h + 3, w - 6, h - 6, h * 0.3);
        x += w;
      }
    }
    speckle(ctx, rnd, S, 2600, 0.18);
  },
  // dressed stone courses (house walls)
  ashlar: (ctx, rnd, S) => {
    // soft joints: the walls frame the hero, so they stay calmer than the cobbles
    ctx.fillStyle = "rgb(105,105,108)";
    ctx.fillRect(0, 0, S, S);
    const rows = 7;
    const h = S / rows;
    for (let r = 0; r < rows; r++) {
      let x = -rnd() * h;
      while (x < S) {
        const w = h * (1.3 + rnd() * 1.1);
        ctx.fillStyle = tone(rnd, 0.78, 1, 0.02);
        ctx.fillRect(x + 2.5, r * h + 2.5, w - 5, h - 5);
        if (x + w > S) ctx.fillRect(x - S + 2.5, r * h + 2.5, w - 5, h - 5);
        // chipped top edge highlight
        ctx.fillStyle = "rgba(255,255,255,0.10)";
        ctx.fillRect(x + 2.5, r * h + 2.5, w - 5, 3);
        x += w;
      }
    }
    speckle(ctx, rnd, S, 3200, 0.16);
  },
  // horizontal timber planks with grain streaks
  plank: (ctx, rnd, S) => {
    const rows = 6;
    const h = S / rows;
    for (let r = 0; r < rows; r++) {
      ctx.fillStyle = tone(rnd, 0.7, 0.95, 0.04);
      ctx.fillRect(0, r * h, S, h);
      for (let i = 0; i < 22; i++) {
        const y = r * h + rnd() * h;
        ctx.strokeStyle = `rgba(30,18,10,${0.12 + rnd() * 0.2})`;
        ctx.lineWidth = 1 + rnd() * 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(S * 0.3, y + (rnd() - 0.5) * 6, S * 0.7, y + (rnd() - 0.5) * 6, S, y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(20,12,8,0.75)";
      ctx.fillRect(0, r * h, S, 3);
    }
    speckle(ctx, rnd, S, 1200, 0.12);
  },
  // overlapping roof shingles in offset rows
  shingle: (ctx, rnd, S) => {
    ctx.fillStyle = "rgb(50,46,44)";
    ctx.fillRect(0, 0, S, S);
    const rows = 10;
    const h = S / rows;
    for (let r = 0; r < rows; r++) {
      const w = h * 1.1;
      for (let x = r % 2 ? -w / 2 : 0; x < S; x += w) {
        ctx.fillStyle = tone(rnd, 0.6, 0.95, 0.03);
        roundRect(ctx, x + 2, r * h + 1, w - 4, h * 1.05, h * 0.25);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(x + 2, r * h + h - 3, w - 4, 3);
      }
    }
    speckle(ctx, rnd, S, 1500, 0.12);
  },
};

/** Seeded colour/bump map for an HD2D surface, tiled `repeat` times. */
export function hd2dTexture(kind: Kind, repeat: [number, number] = [1, 1], seed = 35): THREE.Texture {
  const key = `${kind}:${repeat.join("x")}:${seed}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return new THREE.Texture();
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  paint[kind](ctx, prng(seed * 97 + kind.length), S);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
}
