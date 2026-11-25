// Procedural printed paper for COLLAGE: every "photo" is drawn in greys, then re-printed as a
// one-ink halftone (dots sized by darkness, screen at 15°) on off-white stock, with a torn edge
// and a white fibre rim. Seeded, built once per piece: the same pixels in every render tab.

import * as THREE from "three";
import { mulberry32 } from "../../../core/film/craft.ts";

export type PaperKind = "sky" | "city" | "crowd" | "news" | "sun" | "kraft" | "plain" | "tape";

export type PaperSpec = {
  kind: PaperKind;
  seed: number;
  /** aspect w / h of the piece */
  aspect: number;
  /** ink for halftones and news, colour for plain / kraft */
  ink: string;
  /** stock colour under the ink */
  stock?: string;
  /** headline for "news" pieces */
  headline?: string;
  /** torn on these sides (top, right, bottom, left); false = a straight scissor cut */
  torn?: [boolean, boolean, boolean, boolean];
};

const RES = 1024;

/** Jagged outline of a rectangle: fine tear noise plus a slow wave, per side. */
function tornOutline(w: number, h: number, inset: number, amp: number, rand: () => number, torn: [boolean, boolean, boolean, boolean]) {
  const pts: [number, number][] = [];
  const side = (x0: number, y0: number, x1: number, y1: number, nx: number, ny: number, rough: boolean) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(2, Math.round(len / 6));
    const ph = rand() * 6.28, f = 2 + rand() * 3;
    for (let i = 0; i < n; i++) {
      const u = i / n;
      const off = rough ? (rand() - 0.5) * amp + Math.sin(u * f * Math.PI + ph) * amp * 0.9 : (rand() - 0.5) * 0.6;
      pts.push([x0 + (x1 - x0) * u + nx * off, y0 + (y1 - y0) * u + ny * off]);
    }
  };
  side(inset, inset, w - inset, inset, 0, 1, torn[0]);
  side(w - inset, inset, w - inset, h - inset, -1, 0, torn[1]);
  side(w - inset, h - inset, inset, h - inset, 0, -1, torn[2]);
  side(inset, h - inset, inset, inset, 1, 0, torn[3]);
  return pts;
}

const pathOf = (ctx: CanvasRenderingContext2D, pts: [number, number][]) => {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
};

/** Grey "photograph" drawn into a canvas (white = paper, black = full ink). */
function drawPhoto(g: CanvasRenderingContext2D, kind: PaperKind, w: number, h: number, rand: () => number) {
  g.fillStyle = "#fff";
  g.fillRect(0, 0, w, h);
  if (kind === "sky") {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#5a5a5a");
    grad.addColorStop(0.7, "#cfcfcf");
    grad.addColorStop(1, "#f2f2f2");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.filter = "blur(18px)";
    for (let i = 0; i < 9; i++) {
      const cx = rand() * w, cy = h * (0.15 + rand() * 0.55), r = w * (0.08 + rand() * 0.12);
      g.fillStyle = "#fafafa";
      for (let k = 0; k < 5; k++) {
        g.beginPath();
        g.arc(cx + (k - 2) * r * 0.55, cy + Math.sin(k * 1.7) * r * 0.2, r * (0.6 + 0.4 * Math.sin(k + i)), 0, Math.PI * 2);
        g.fill();
      }
    }
    g.filter = "none";
    // a flock of birds as dark ticks
    g.strokeStyle = "#202020";
    g.lineWidth = 5;
    for (let i = 0; i < 7; i++) {
      const x = w * (0.55 + rand() * 0.35), y = h * (0.12 + rand() * 0.25), s = 14 + rand() * 12;
      g.beginPath();
      g.moveTo(x - s, y - s * 0.3);
      g.quadraticCurveTo(x - s * 0.4, y - s * 0.6, x, y);
      g.quadraticCurveTo(x + s * 0.4, y - s * 0.6, x + s, y - s * 0.3);
      g.stroke();
    }
  } else if (kind === "city") {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#d8d8d8");
    grad.addColorStop(1, "#9a9a9a");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    for (let layer = 0; layer < 3; layer++) {
      let x = -20;
      const shade = [150, 90, 35][layer];
      while (x < w) {
        const bw = 40 + rand() * 110, bh = h * (0.25 + rand() * (0.35 + layer * 0.12)) * (1 - layer * 0.12);
        g.fillStyle = `rgb(${shade},${shade},${shade})`;
        g.fillRect(x, h - bh, bw, bh);
        if (layer === 2) {
          g.fillStyle = "#e8e8e8";
          for (let wy = h - bh + 18; wy < h - 20; wy += 26)
            for (let wx = x + 10; wx < x + bw - 14; wx += 20) if (rand() < 0.45) g.fillRect(wx, wy, 8, 12);
        }
        x += bw + rand() * 12;
      }
    }
  } else if (kind === "crowd") {
    g.fillStyle = "#bdbdbd";
    g.fillRect(0, 0, w, h);
    // rows of heads and shoulders, darker toward the front
    for (let row = 0; row < 6; row++) {
      const y = h * (0.2 + row * 0.15), r = 26 + row * 9, c = 170 - row * 26;
      for (let x = -r + rand() * r; x < w + r; x += r * (1.6 + rand() * 0.5)) {
        g.fillStyle = `rgb(${c},${c},${c})`;
        g.beginPath();
        g.ellipse(x, y + r * 1.9, r * 1.35, r * 1.1, 0, Math.PI, 0);
        g.fill();
        g.beginPath();
        g.arc(x, y, r * 0.72, 0, Math.PI * 2);
        g.fill();
        if (rand() < 0.25) {
          // a raised arm with a placard
          g.fillRect(x + r * 0.6, y - r * 2.4, r * 0.25, r * 2.2);
          g.fillRect(x + r * 0.1, y - r * 3.4, r * 1.3, r * 1.0);
        }
      }
    }
  } else if (kind === "sun") {
    const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grad.addColorStop(0, "#000");
    grad.addColorStop(0.72, "#2a2a2a");
    grad.addColorStop(0.74, "#fff");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  }
}

/** Re-print a grey image as one-ink halftone dots on `stock`. */
function halftone(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, w: number, h: number, ink: string, cell = 11) {
  const data = src.getContext("2d")!.getImageData(0, 0, w, h).data;
  ctx.fillStyle = ink;
  const a = (15 * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const R = Math.hypot(w, h);
  for (let v = -R; v < R; v += cell) {
    for (let u = -R; u < R; u += cell) {
      const x = w / 2 + u * ca - v * sa, y = h / 2 + u * sa + v * ca;
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const dark = 1 - data[(Math.floor(y) * w + Math.floor(x)) * 4] / 255;
      if (dark < 0.04) continue;
      ctx.beginPath();
      ctx.arc(x, y, Math.sqrt(dark) * cell * 0.62, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawNews(ctx: CanvasRenderingContext2D, w: number, h: number, ink: string, headline: string, rand: () => number) {
  const m = w * 0.08;
  ctx.fillStyle = ink;
  ctx.fillRect(m, m, w - 2 * m, 10);
  ctx.font = `700 ${Math.round(w * 0.11)}px Georgia, 'Times New Roman', serif`;
  ctx.textBaseline = "top";
  const words = headline.split(" ");
  let line = "", y = m + 30;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > w - 2 * m && line) {
      ctx.fillText(line, m, y);
      y += w * 0.12;
      line = word;
    } else line = test;
  }
  ctx.fillText(line, m, y);
  y += w * 0.15;
  ctx.fillRect(m, y, w - 2 * m, 4);
  y += 26;
  // two columns of body copy as grey lines (too small to read in the film)
  const colW = (w - 2 * m - 30) / 2;
  ctx.fillStyle = "rgba(28,26,23,0.55)";
  for (let c = 0; c < 2; c++) {
    let yy = y;
    while (yy < h - m) {
      const len = rand() < 0.12 ? colW * (0.3 + rand() * 0.4) : colW * (0.92 + rand() * 0.08);
      ctx.fillRect(m + c * (colW + 30), yy, len, 9);
      yy += rand() < 0.08 ? 34 : 19;
    }
  }
}

const CACHE = new Map<string, THREE.CanvasTexture>();

/** A torn, printed piece of paper as a texture with alpha (use alphaTest 0.5). */
export function paperTexture(spec: PaperSpec): THREE.CanvasTexture {
  const key = JSON.stringify(spec);
  const hit = CACHE.get(key);
  if (hit) return hit;
  const rand = mulberry32(spec.seed);
  const w = spec.aspect >= 1 ? RES : Math.round(RES * spec.aspect);
  const h = spec.aspect >= 1 ? Math.round(RES / spec.aspect) : RES;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const torn = spec.torn ?? [true, true, true, true];
  const amp = spec.kind === "tape" ? 10 : 16;
  const outer = tornOutline(w, h, amp, amp, rand, torn);
  const stock = spec.stock ?? "#F2EBDD";

  // fibre rim: torn paper shows the white core of the sheet
  pathOf(ctx, outer);
  ctx.fillStyle = spec.kind === "tape" ? spec.ink : "#FBF8F1";
  ctx.fill();
  if (spec.kind !== "tape") {
    const inner = tornOutline(w, h, amp + 7, amp * 0.8, rand, torn);
    ctx.save();
    pathOf(ctx, inner);
    ctx.clip();
    ctx.fillStyle = spec.kind === "kraft" || spec.kind === "plain" ? spec.ink : stock;
    ctx.fillRect(0, 0, w, h);
    if (spec.kind === "sky" || spec.kind === "city" || spec.kind === "crowd" || spec.kind === "sun") {
      const src = document.createElement("canvas");
      src.width = w;
      src.height = h;
      drawPhoto(src.getContext("2d")!, spec.kind, w, h, rand);
      halftone(ctx, src, w, h, spec.ink, spec.kind === "sun" ? 14 : 10);
    } else if (spec.kind === "news") {
      drawNews(ctx, w, h, spec.ink, spec.headline ?? "", rand);
    }
    // paper tooth: faint speckle so flat colours do not look digital
    for (let i = 0; i < (w * h) / 900; i++) {
      ctx.fillStyle = rand() < 0.5 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
      ctx.fillRect(rand() * w, rand() * h, 2, 2);
    }
    ctx.restore();
  } else {
    // tape: translucent, with fine fibres along its length
    ctx.save();
    pathOf(ctx, outer);
    ctx.clip();
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.05 + rand() * 0.08})`;
      ctx.fillRect(0, rand() * h, w, 1 + rand() * 2);
    }
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  CACHE.set(key, tex);
  return tex;
}
