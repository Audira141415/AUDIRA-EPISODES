// Procedural paper and studio surfaces: washi with long kozo fibres and a printed traditional
// pattern (seigaiha waves, asanoha hemp leaf, kikko hexagons), a slate cutting mat with a grid,
// a pale ash tabletop, and the AUDIRA tent card print. Canvas textures, seeded, cached per render.
// No photo textures, no Math.random.

import * as THREE from "three";
import { WASHI, ORIGAMI_PALETTE as P, type Pattern, type Washi } from "./palette.ts";

const hash = (x: number, y: number, s: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return h - Math.floor(h);
};
export function noise2(x: number, y: number, s = 0): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy, s), b = hash(ix + 1, iy, s), c = hash(ix, iy + 1, s), d = hash(ix + 1, iy + 1, s);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
export const fbm = (x: number, y: number, s = 0, oct = 4) => {
  let v = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    v += amp * noise2(x * f, y * f, s + i * 13);
    f *= 2.03;
    amp *= 0.5;
  }
  return v;
};
/** Park-Miller generator: deterministic in every render tab. */
export const rng = (seed: number) => {
  let s = Math.max(1, Math.floor(seed * 9973) % 2147483647);
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

const canvas = (size: number) => {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return c;
};
const toTex = (c: HTMLCanvasElement, srgb: boolean) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
};

/** Mottled base: low-frequency cloudiness of handmade paper. */
function mottle(g: CanvasRenderingContext2D, size: number, hex: string, seed: number, amount: number) {
  // canvas pixels are sRGB: read the hex directly (THREE.Color would hand back linear values)
  const n = parseInt(hex.slice(1), 16);
  const base = { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
  const img = g.createImageData(size, size);
  const step = 2; // half resolution then smoothed by the fibres on top
  for (let j = 0; j < size; j += step) {
    for (let i = 0; i < size; i += step) {
      const x = i / size, y = j / size;
      const m = (fbm(x * 5, y * 5, seed) - 0.5) * amount + (noise2(x * 90, y * 90, seed + 3) - 0.5) * amount * 0.35;
      for (let dj = 0; dj < step; dj++) for (let di = 0; di < step; di++) {
        const o = ((j + dj) * size + (i + di)) * 4;
        img.data[o] = Math.max(0, Math.min(255, (base.r + m) * 255));
        img.data[o + 1] = Math.max(0, Math.min(255, (base.g + m) * 255));
        img.data[o + 2] = Math.max(0, Math.min(255, (base.b + m * 0.9) * 255));
        img.data[o + 3] = 255;
      }
    }
  }
  g.putImageData(img, 0, 0);
}

/** Long kozo fibres: thin curved strands, lighter on the colour map and raised on the bump map. */
function fibres(g: CanvasRenderingContext2D, size: number, seed: number, color: string, alpha: number, count: number) {
  const r = rng(seed + 0.5);
  g.save();
  g.lineCap = "round";
  for (let i = 0; i < count; i++) {
    const x = r() * size, y = r() * size;
    const a = r() * Math.PI * 2;
    const len = size * (0.015 + r() * 0.06);
    const bend = (r() - 0.5) * len * 0.8;
    g.strokeStyle = color;
    g.globalAlpha = alpha * (0.35 + r() * 0.65);
    g.lineWidth = size / 1024 * (0.5 + r() * 1.3);
    g.beginPath();
    g.moveTo(x, y);
    const mx = x + Math.cos(a) * len * 0.5 - Math.sin(a) * bend, my = y + Math.sin(a) * len * 0.5 + Math.cos(a) * bend;
    g.quadraticCurveTo(mx, my, x + Math.cos(a) * len, y + Math.sin(a) * len);
    g.stroke();
  }
  g.restore();
}

/** A traditional repeating print, drawn in `ink` over the face colour. */
function printPattern(g: CanvasRenderingContext2D, size: number, pattern: Pattern, ink: string, seed: number) {
  g.save();
  g.strokeStyle = ink;
  g.fillStyle = ink;
  g.globalAlpha = 0.5;
  const lw = size / 512;
  if (pattern === "seigaiha") {
    const R = size / 14;
    for (let row = -1; row < size / (R * 0.5) + 2; row++) {
      for (let col = -1; col < size / (R * 2) + 2; col++) {
        const cx = col * R * 2 + (row % 2 ? R : 0);
        const cy = row * R * 0.5;
        // concentric arcs; draw from back to front so each wave covers the one behind
        g.globalAlpha = 1;
        g.fillStyle = "rgba(0,0,0,0)";
        for (let k = 0; k < 4; k++) {
          const rr = R * (1 - k * 0.24);
          g.beginPath();
          g.arc(cx, cy, rr, Math.PI, 0);
          g.lineWidth = lw * (k === 0 ? 1.6 : 1.1);
          g.globalAlpha = 0.5 - k * 0.06;
          g.stroke();
        }
      }
    }
  } else if (pattern === "asanoha") {
    const s = size / 10, hgt = s * Math.sqrt(3) / 2;
    g.lineWidth = lw;
    for (let row = -1; row < size / hgt + 1; row++) {
      for (let col = -1; col < size / s + 1; col++) {
        const ox = col * s + (row % 2 ? s / 2 : 0), oy = row * hgt;
        const tri = [[ox, oy], [ox + s, oy], [ox + s / 2, oy + hgt]];
        const tri2 = [[ox + s / 2, oy + hgt], [ox + s * 1.5, oy + hgt], [ox + s, oy]];
        for (const t of [tri, tri2]) {
          const cx = (t[0][0] + t[1][0] + t[2][0]) / 3, cy = (t[0][1] + t[1][1] + t[2][1]) / 3;
          g.beginPath();
          for (const [px, py] of t) { g.moveTo(cx, cy); g.lineTo(px, py); }
          g.moveTo(t[0][0], t[0][1]); g.lineTo(t[1][0], t[1][1]); g.lineTo(t[2][0], t[2][1]); g.closePath();
          g.stroke();
        }
      }
    }
  } else {
    const s = size / 16;
    g.lineWidth = lw * 1.2;
    for (let row = -1; row < size / (s * 1.5) + 1; row++) {
      for (let col = -1; col < size / (s * Math.sqrt(3)) + 1; col++) {
        const cx = col * s * Math.sqrt(3) + (row % 2 ? (s * Math.sqrt(3)) / 2 : 0), cy = row * s * 1.5;
        for (const k of [1, 0.62]) {
          g.beginPath();
          for (let i = 0; i <= 6; i++) {
            const a = Math.PI / 6 + (i * Math.PI) / 3;
            const px = cx + Math.cos(a) * s * 0.92 * k, py = cy + Math.sin(a) * s * 0.92 * k;
            if (i) g.lineTo(px, py); else g.moveTo(px, py);
          }
          g.stroke();
        }
      }
    }
  }
  g.restore();
  // print is slightly uneven: knock some ink back out with paper-coloured speckle
  const r = rng(seed + 9);
  g.save();
  for (let i = 0; i < 900; i++) {
    g.globalAlpha = 0.12 + r() * 0.2;
    g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.25)";
    const x = r() * size, y = r() * size, w = 1 + r() * 3;
    g.fillRect(x, y, w, w * 0.6);
  }
  g.restore();
}

export type PaperTex = { face: THREE.CanvasTexture; back: THREE.CanvasTexture; bump: THREE.CanvasTexture };
const paperCache = new Map<string, PaperTex>();

/** Face (printed), back (plain) and a shared fibre bump map for one washi sheet. */
export function washiTextures(kind: Washi, seed = 1, size = 1024): PaperTex {
  const key = `${kind}:${seed}:${size}`;
  const hit = paperCache.get(key);
  if (hit) return hit;
  const W = WASHI[kind];
  const face = canvas(size), back = canvas(size), bump = canvas(size);
  const gf = face.getContext("2d")!, gk = back.getContext("2d")!, gb = bump.getContext("2d")!;
  mottle(gf, size, W.face, seed, 0.06);
  printPattern(gf, size, W.pattern as Pattern, W.ink, seed);
  fibres(gf, size, seed, "#ffffff", 0.16, 1600);
  mottle(gk, size, W.back, seed + 4, 0.035);
  fibres(gk, size, seed + 4, "#ffffff", 0.32, 1800);
  fibres(gk, size, seed + 7, "#b8a888", 0.08, 500);
  gb.fillStyle = "#808080";
  gb.fillRect(0, 0, size, size);
  fibres(gb, size, seed, "#d8d8d8", 0.55, 1600);
  fibres(gb, size, seed + 4, "#c0c0c0", 0.4, 1800);
  const out = { face: toTex(face, true), back: toTex(back, true), bump: toTex(bump, false) };
  paperCache.set(key, out);
  return out;
}

let matTex: THREE.CanvasTexture | null = null;
/** Slate self-healing cutting mat: fine 1 cm grid, brighter every 5, ruler numbers on the edge. */
export function cuttingMatTexture(size = 2048): THREE.CanvasTexture {
  if (matTex) return matTex;
  const c = canvas(size);
  const g = c.getContext("2d")!;
  mottle(g, size, P.mat, 41, 0.03);
  const cells = 36; // across the mat
  const step = size / cells;
  g.strokeStyle = P.matLine;
  for (let i = 0; i <= cells; i++) {
    const major = i % 5 === 0;
    g.globalAlpha = major ? 0.42 : 0.16;
    g.lineWidth = major ? 2.2 : 1.1;
    g.beginPath(); g.moveTo(i * step, 0); g.lineTo(i * step, size); g.stroke();
    g.beginPath(); g.moveTo(0, i * step); g.lineTo(size, i * step); g.stroke();
  }
  // 45° and 60° guide lines through one corner
  g.globalAlpha = 0.2;
  g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(step * 2, size - step * 2); g.lineTo(size - step * 2, step * 2); g.stroke();
  g.beginPath(); g.moveTo(step * 2, size - step * 2); g.lineTo(step * 2 + (size - step * 4) * 0.577, step * 2); g.stroke();
  g.globalAlpha = 0.55;
  g.fillStyle = P.matLine;
  g.font = `600 ${Math.round(step * 0.42)}px Arial, sans-serif`;
  g.textAlign = "center";
  for (let i = 5; i < cells; i += 5) {
    g.fillText(String(i), i * step, step * 0.7);
    g.fillText(String(i), step * 0.6, i * step + step * 0.15);
  }
  // knife scars of a well-used mat
  const r = rng(77);
  g.strokeStyle = "#0e1a1e";
  for (let i = 0; i < 90; i++) {
    g.globalAlpha = 0.1 + r() * 0.15;
    g.lineWidth = 1;
    const x = r() * size, y = r() * size, a = r() * Math.PI, l = step * (0.5 + r() * 3);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  matTex = toTex(c, true);
  return matTex;
}

let tableTex: THREE.CanvasTexture | null = null;
/** Pale ash tabletop: long straight grain, soft figure. */
export function tableTexture(size = 1024): THREE.CanvasTexture {
  if (tableTex) return tableTex;
  const c = canvas(size);
  const g = c.getContext("2d")!;
  const img = g.createImageData(size, size);
  const L = { r: 0.79, g: 0.68, b: 0.55 }, D = { r: 0.61, g: 0.49, b: 0.37 };
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const x = i / size, y = j / size;
      const r = (y + (fbm(x * 1.4, y * 1.1, 5) - 0.5) * 0.25) * 22;
      const ring = r - Math.floor(r);
      const late = Math.pow(Math.max(0, Math.sin(ring * Math.PI)), 8) * 0.5;
      const fib = noise2(x * 14, y * 380, 9) - 0.5;
      const plank = Math.floor(y * 4);
      const k = Math.max(0, Math.min(1, late + fib * 0.16 + 0.1 + (plank % 2) * 0.05));
      const o = (j * size + i) * 4;
      img.data[o] = (L.r + (D.r - L.r) * k) * 255;
      img.data[o + 1] = (L.g + (D.g - L.g) * k) * 255;
      img.data[o + 2] = (L.b + (D.b - L.b) * k) * 255;
      img.data[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  g.strokeStyle = "rgba(60,40,25,0.5)";
  g.lineWidth = 2;
  for (let p = 1; p < 4; p++) { g.beginPath(); g.moveTo(0, (p * size) / 4); g.lineTo(size, (p * size) / 4); g.stroke(); }
  tableTex = toTex(c, true);
  return tableTex;
}

let cardTex: THREE.CanvasTexture | null = null;
/** The tent card face: cream washi with AUDIRA printed in indigo and a small fold diagram. */
export function cardTexture(size = 1024): THREE.CanvasTexture {
  if (cardTex) return cardTex;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size / 2;
  const g = c.getContext("2d")!;
  mottle(g, size, WASHI.kincha.back, 23, 0.03);
  fibres(g, size, 23, "#ffffff", 0.3, 900);
  g.fillStyle = P.print;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `700 ${Math.round(size * 0.15)}px Georgia, 'Times New Roman', serif`;
  g.save();
  g.translate(size / 2, size * 0.24);
  // letter-spaced word
  const word = "AUDIRA";
  const sp = size * 0.125;
  for (let i = 0; i < word.length; i++) g.fillText(word[i], (i - (word.length - 1) / 2) * sp, 0);
  g.restore();
  g.strokeStyle = P.print;
  g.lineWidth = size / 400;
  g.setLineDash([size / 80, size / 120]);
  g.beginPath(); g.moveTo(size * 0.2, size * 0.385); g.lineTo(size * 0.8, size * 0.385); g.stroke();
  g.setLineDash([]);
  g.font = `600 ${Math.round(size * 0.035)}px Georgia, serif`;
  g.globalAlpha = 0.8;
  g.fillText("ORIGAMI · LIPAT KERTAS", size / 2, size * 0.44);
  // the red hanko stamp
  g.globalAlpha = 0.85;
  g.fillStyle = "#C7402C";
  g.fillRect(size * 0.86, size * 0.06, size * 0.07, size * 0.07);
  g.fillStyle = "#F4ECD8";
  g.font = `700 ${Math.round(size * 0.05)}px Georgia, serif`;
  g.fillText("A", size * 0.895, size * 0.097);
  cardTex = new THREE.CanvasTexture(c);
  cardTex.colorSpace = THREE.SRGBColorSpace;
  cardTex.anisotropy = 8;
  return cardTex;
}
