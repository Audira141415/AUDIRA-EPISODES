// PLUSHFORGE fabrics, all procedural canvas textures (seeded, cached, no photos):
// - plushMaps(): short pile (thousands of tiny combed strokes, light tips and dark roots) with the
//   sewn panel seams of a sphere drawn in uv: a dark pinched groove plus cross stitches in thread.
// - feltMaps(): matte felt with curly fibres (patches, pads, noses).
// - quiltMaps(): the patchwork blanket, one colour/print per quilted square, quilting stitches on
//   every valley line.
// - pillowMaps(): teal cotton with cream dots and AUDIRA embroidered in satin stitch.
// Each returns a colour map and a bump map from the same strokes, so stitches are raised and seams sink.

import * as THREE from "three";
import { prng } from "../../../core/materials/textures.ts";
import { PLUSH, PLUSH_PALETTE as P, type PlushName } from "./palette.ts";

type Maps = { map: THREE.Texture; bump: THREE.Texture };
const cache = new Map<string, Maps>();

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
};
const shade = (hex: string, k: number) => {
  const c = new THREE.Color(hex);
  if (k > 0) c.lerp(new THREE.Color("#ffffff"), k);
  else c.lerp(new THREE.Color("#000000"), -k);
  return `#${c.getHexString()}`;
};
const toTex = (c: HTMLCanvasElement, color: boolean, flipY = true) => {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  t.flipY = flipY;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
};
const empty = (): Maps => ({ map: new THREE.Texture(), bump: new THREE.Texture() });

/** Pile: short combed strokes, tips lighter than roots. Drawn into both the map and the bump. */
function pile(ctx: CanvasRenderingContext2D, bctx: CanvasRenderingContext2D, base: string, w: number, h: number, seed: number, count: number, dir = Math.PI / 2) {
  const r = prng(seed);
  for (let i = 0; i < count; i++) {
    const x = r() * w, y = r() * h;
    const a = dir + (r() - 0.5) * 0.9 + 0.45 * Math.sin(x * 0.011 + seed) * Math.cos(y * 0.013);
    const len = 2.5 + r() * 4.5;
    const k = (r() - 0.45) * 0.28;
    ctx.strokeStyle = shade(base, k);
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.1 + r() * 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
    const g = Math.round(128 + k * 260);
    bctx.strokeStyle = `rgb(${g},${g},${g})`;
    bctx.globalAlpha = 0.6;
    bctx.lineWidth = 1.2;
    bctx.beginPath();
    bctx.moveTo(x, y);
    bctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    bctx.stroke();
  }
  ctx.globalAlpha = 1;
  bctx.globalAlpha = 1;
}

/** A sewn seam along a line: dark pinched groove, then cross stitches every `step` px. */
function seamLine(ctx: CanvasRenderingContext2D, bctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, thread: string, step = 13) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const ux = (x1 - x0) / len, uy = (y1 - y0) / len;
  const nx = -uy, ny = ux;
  // Groove: a soft dark band (colour) and a deep valley (bump).
  for (const [c, wdt, col, a] of [
    [ctx, 9, "#000000", 0.16],
    [ctx, 4, "#000000", 0.22],
    [bctx, 14, "#000000", 0.35],
    [bctx, 7, "#000000", 0.5],
  ] as const) {
    c.strokeStyle = col;
    c.globalAlpha = a;
    c.lineWidth = wdt;
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1, y1);
    c.stroke();
  }
  ctx.globalAlpha = 1;
  bctx.globalAlpha = 1;
  // Cross stitches, slanted, pulling the two panels together.
  for (let s = step * 0.5; s < len; s += step) {
    const cx = x0 + ux * s, cy = y0 + uy * s;
    const ax = cx - nx * 5 - ux * 2, ay = cy - ny * 5 - uy * 2;
    const bx = cx + nx * 5 + ux * 2, by = cy + ny * 5 + uy * 2;
    ctx.strokeStyle = thread;
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    bctx.strokeStyle = "#f0f0f0";
    bctx.lineWidth = 2.6;
    bctx.lineCap = "round";
    bctx.beginPath();
    bctx.moveTo(ax, ay);
    bctx.lineTo(bx, by);
    bctx.stroke();
  }
}

export type PlushOpts = { fabric: PlushName; seed?: number; gores?: number; phase?: number; equator?: boolean; stitches?: boolean };

/**
 * Plush maps for a seamSphere() with the same `gores`, `phase` and `equator`. Canvas is 2:1 so the
 * pile is isotropic on a sphere (u spans 2πr, v spans πr).
 */
export function plushMaps({ fabric, seed = 3, gores = 0, phase = 0, equator = false, stitches = true }: PlushOpts): Maps {
  const key = `plush:${fabric}:${seed}:${gores}:${phase}:${equator}:${stitches}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return empty();
  const W = 1024, H = 512;
  const F = PLUSH[fabric];
  const [c, ctx] = canvas(W, H);
  const [b, bctx] = canvas(W, H);
  ctx.fillStyle = F.base;
  ctx.fillRect(0, 0, W, H);
  bctx.fillStyle = "#808080";
  bctx.fillRect(0, 0, W, H);
  pile(ctx, bctx, F.base, W, H, seed * 31 + 7, 26000);
  const thread = stitches ? F.thread : "rgba(0,0,0,0)";
  for (let k = 0; k < gores; k++) {
    const x = (((k / gores + phase) % 1) + 1) % 1 * W;
    for (const dx of [-W, 0, W]) if (x + dx > -20 && x + dx < W + 20) seamLine(ctx, bctx, x + dx, 14, x + dx, H - 14, thread);
  }
  if (equator) seamLine(ctx, bctx, 0, H / 2, W, H / 2, thread);
  const out = { map: toTex(c, true), bump: toTex(b, false) };
  cache.set(key, out);
  return out;
}

/** Matte felt: curly fibres, low contrast. */
export function feltMaps(base: string, seed = 5): Maps {
  const key = `felt:${base}:${seed}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return empty();
  const S = 256;
  const [c, ctx] = canvas(S, S);
  const [b, bctx] = canvas(S, S);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  bctx.fillStyle = "#808080";
  bctx.fillRect(0, 0, S, S);
  const r = prng(seed * 17 + 3);
  for (let i = 0; i < 2600; i++) {
    const x = r() * S, y = r() * S, rad = 2 + r() * 5, a0 = r() * Math.PI * 2;
    const k = (r() - 0.5) * 0.16;
    ctx.strokeStyle = shade(base, k);
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(x, y, rad, a0, a0 + 1.5 + r() * 2);
    ctx.stroke();
    const g = Math.round(128 + k * 300);
    bctx.strokeStyle = `rgb(${g},${g},${g})`;
    bctx.globalAlpha = 0.55;
    bctx.beginPath();
    bctx.arc(x, y, rad, a0, a0 + 1.5 + r() * 2);
    bctx.stroke();
  }
  const out = { map: toTex(c, true), bump: toTex(b, false) };
  cache.set(key, out);
  return out;
}

/**
 * Patchwork quilt for a grid of `cols` × `rows` squares (uv 0..1 across the blanket, flipY off so
 * canvas row 0 is v = 0). Prints: plain, gingham, dots, tiny flowers. Quilting stitches on every line.
 */
export function quiltMaps(cols: number, rows: number, seed = 11): Maps {
  const key = `quilt:${cols}:${rows}:${seed}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return empty();
  const cs = 128;
  const W = cols * cs, H = rows * cs;
  const [c, ctx] = canvas(W, H);
  const [b, bctx] = canvas(W, H);
  bctx.fillStyle = "#808080";
  bctx.fillRect(0, 0, W, H);
  const r = prng(seed);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const col = P.quilt[(i * 3 + j * 2 + Math.floor(r() * 2)) % P.quilt.length];
      const x = i * cs, y = j * cs;
      ctx.fillStyle = col;
      ctx.fillRect(x, y, cs, cs);
      const print = (i + j * 2) % 4;
      if (print === 1) {
        // gingham
        ctx.fillStyle = shade(col, 0.22);
        ctx.globalAlpha = 0.45;
        for (let g = 0; g < cs; g += 16) {
          ctx.fillRect(x + g, y, 8, cs);
          ctx.fillRect(x, y + g, cs, 8);
        }
        ctx.globalAlpha = 1;
      } else if (print === 2) {
        // dots
        ctx.fillStyle = shade(col, 0.55);
        for (let gy = 8; gy < cs; gy += 18) for (let gx = 8 + ((gy / 18) % 2) * 9; gx < cs; gx += 18) {
          ctx.beginPath();
          ctx.arc(x + gx, y + gy, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (print === 3) {
        // tiny five-petal flowers
        for (let n = 0; n < 7; n++) {
          const fx = x + 14 + r() * (cs - 28), fy = y + 14 + r() * (cs - 28);
          ctx.fillStyle = shade(col, 0.6);
          for (let p = 0; p < 5; p++) {
            const a = (p / 5) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(fx + Math.cos(a) * 4, fy + Math.sin(a) * 4, 3, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = P.embroidery;
          ctx.beginPath();
          ctx.arc(fx, fy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
  // Cotton weave over everything.
  for (let y = 0; y < H; y += 3) {
    ctx.fillStyle = y % 6 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";
    ctx.fillRect(0, y, W, 1);
    bctx.fillStyle = y % 6 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    bctx.fillRect(0, y, W, 1);
  }
  for (let x = 0; x < W; x += 3) {
    ctx.fillStyle = x % 6 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)";
    ctx.fillRect(x, 0, 1, H);
  }
  // Quilting: running stitches along every cell line (the geometry pinches here too).
  const run = (x0: number, y0: number, x1: number, y1: number) => {
    for (const [cc, col, wd] of [[ctx, P.quiltThread, 3], [bctx, "#ffffff", 3.5]] as const) {
      cc.strokeStyle = col;
      cc.lineWidth = wd;
      cc.lineCap = "round";
      cc.setLineDash([11, 9]);
      cc.beginPath();
      cc.moveTo(x0, y0);
      cc.lineTo(x1, y1);
      cc.stroke();
      cc.setLineDash([]);
    }
  };
  for (let i = 0; i <= cols; i++) run(i * cs, 0, i * cs, H);
  for (let j = 0; j <= rows; j++) run(0, j * cs, W, j * cs);
  const out = { map: toTex(c, true, false), bump: toTex(b, false, false) };
  cache.set(key, out);
  return out;
}

/** Satin-stitch embroidery of `text` centred at (cx, cy): slanted thread bands clipped to the letters. */
function satin(ctx: CanvasRenderingContext2D, bctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, size: number, W: number, H: number) {
  const font = `900 ${size}px "Arial Rounded MT Bold", "Trebuchet MS", Verdana, sans-serif`;
  const [m, mctx] = canvas(W, H);
  mctx.font = font;
  mctx.textAlign = "center";
  mctx.textBaseline = "middle";
  (mctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${Math.round(size * 0.08)}px`;
  mctx.fillStyle = "#fff";
  mctx.fillText(text, cx, cy);
  const stripes = (base: string, light: string, dark: string) => {
    const [s, sctx] = canvas(W, H);
    sctx.fillStyle = base;
    sctx.fillRect(0, 0, W, H);
    sctx.lineWidth = 2;
    for (let x = -H; x < W + H; x += 4) {
      sctx.strokeStyle = (x / 4) % 2 ? light : dark;
      sctx.beginPath();
      sctx.moveTo(x, 0);
      sctx.lineTo(x + H * 0.45, H);
      sctx.stroke();
    }
    sctx.globalCompositeOperation = "destination-in";
    sctx.drawImage(m, 0, 0);
    return s;
  };
  // Raised thread casts a soft shadow onto the cotton.
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 4;
  ctx.drawImage(stripes(P.embroidery, shade(P.embroidery, 0.3), P.embroideryShade), 0, 0);
  ctx.restore();
  bctx.drawImage(stripes("#d8d8d8", "#ffffff", "#b0b0b0"), 0, 0);
  // Split-stitch outline.
  for (const [cc, col, wd] of [[ctx, P.embroideryShade, 3], [bctx, "#e8e8e8", 3]] as const) {
    cc.font = font;
    cc.textAlign = "center";
    cc.textBaseline = "middle";
    (cc as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${Math.round(size * 0.08)}px`;
    cc.strokeStyle = col;
    cc.lineWidth = wd;
    cc.setLineDash([6, 3]);
    cc.strokeText(text, cx, cy);
    cc.setLineDash([]);
  }
}

/** Pillow front: teal cotton, cream dots, a running-stitch frame and AUDIRA in satin stitch. flipY off. */
export function pillowMaps(seed = 4): Maps {
  const key = `pillow:${seed}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return empty();
  const W = 1024, H = 560;
  const [c, ctx] = canvas(W, H);
  const [b, bctx] = canvas(W, H);
  ctx.fillStyle = P.pillow;
  ctx.fillRect(0, 0, W, H);
  bctx.fillStyle = "#808080";
  bctx.fillRect(0, 0, W, H);
  const r = prng(seed);
  // Weave and slub.
  for (let i = 0; i < 9000; i++) {
    const x = r() * W, y = r() * H, k = (r() - 0.5) * 0.12;
    ctx.fillStyle = shade(P.pillow, k);
    ctx.fillRect(x, y, 3 + r() * 5, 1);
  }
  ctx.fillStyle = P.pillowDot;
  for (let y = 22; y < H; y += 44) for (let x = 22 + ((y / 44) % 2) * 22; x < W; x += 44) {
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Embroidered panel behind the word: a darker oval with a running-stitch border.
  ctx.fillStyle = shade(P.pillow, -0.3);
  ctx.beginPath();
  ctx.ellipse(W / 2, H / 2, 330, 130, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const [cc, col] of [[ctx, P.threadCream], [bctx, "#ffffff"]] as const) {
    cc.strokeStyle = col;
    cc.lineWidth = 4;
    cc.lineCap = "round";
    cc.setLineDash([14, 10]);
    cc.beginPath();
    cc.ellipse(W / 2, H / 2, 312, 114, 0, 0, Math.PI * 2);
    cc.stroke();
    cc.setLineDash([]);
  }
  satin(ctx, bctx, "AUDIRA", W / 2, H / 2 + 6, 132, W, H);
  // Two small embroidered hearts either side.
  for (const sx of [-1, 1]) {
    const hx = W / 2 + sx * 380, hy = H / 2;
    ctx.fillStyle = "#E77B78";
    ctx.beginPath();
    for (let s = 0; s <= 64; s++) {
      const a = (s / 64) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(a), 3), y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
      if (s === 0) ctx.moveTo(hx + x * 1.6, hy - y * 1.6);
      else ctx.lineTo(hx + x * 1.6, hy - y * 1.6);
    }
    ctx.fill();
  }
  const out = { map: toTex(c, true, false), bump: toTex(b, false, false) };
  cache.set(key, out);
  return out;
}

/** Faint striped wallpaper with a small diamond motif. */
export function wallpaperMap(): THREE.Texture {
  const key = "wall";
  const hit = cache.get(key);
  if (hit) return hit.map;
  if (typeof document === "undefined") return new THREE.Texture();
  const [c, ctx] = canvas(256, 256);
  ctx.fillStyle = P.wall;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = P.stripe;
  for (let x = 0; x < 256; x += 64) ctx.fillRect(x, 0, 22, 256);
  ctx.fillStyle = "rgba(255,220,180,0.06)";
  for (let y = 16; y < 256; y += 64) for (let x = 43; x < 256; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, y - 6);
    ctx.lineTo(x + 5, y);
    ctx.lineTo(x, y + 6);
    ctx.lineTo(x - 5, y);
    ctx.fill();
  }
  const out = { map: toTex(c, true), bump: new THREE.Texture() };
  cache.set(key, out);
  return out.map;
}

/** Physical material recipe for plush: rough base, strong pale sheen at grazing angles (the pile). */
export const plushFinish = (fabric: PlushName) => ({
  roughness: 0.93,
  metalness: 0,
  sheen: 1,
  sheenRoughness: 0.42,
  sheenColor: new THREE.Color(PLUSH[fabric].sheen),
});
/** Felt: fully matte with a faint fibre sheen (no glossy pile). */
export const feltFinish = { roughness: 1, metalness: 0, sheen: 0.25, sheenRoughness: 0.9 } as const;
