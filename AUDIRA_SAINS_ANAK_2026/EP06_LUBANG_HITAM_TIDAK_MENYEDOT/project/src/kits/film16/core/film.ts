// FILM16 film mechanics: everything a 16mm camera and projector add on top of the image, as pure
// functions of the film frame (24 per second). The same frame gives the same grain tile, weave offset,
// flicker, specks and light leak in every render tab.

import { mulberry32 } from "../../../core/film/craft.ts";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const win = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

/** Film cadence. The film is delivered at 60 fps; picture still changes 24 times a second. 0 = off. */
export const CADENCE = 24;
export const filmFrame = (t: number, cadence = CADENCE) => (cadence > 0 ? Math.floor(t * cadence + 1e-6) : Math.round(t * 60));
export const filmTime = (t: number, cadence = CADENCE) => (cadence > 0 ? filmFrame(t, cadence) / cadence : t);

const rnd = (n: number, salt: number) => mulberry32(n * 7919 + salt * 104729)();

/** Gate weave: the frame drifts a fraction of a pixel (authored px at 1080 wide) and rolls a hair. */
export function weave(n: number) {
  // slow wander plus per-frame jitter: a real gate is neither still nor random
  const slowX = Math.sin(n * 0.21) * 0.9 + Math.sin(n * 0.057 + 1.3) * 0.7;
  const slowY = Math.sin(n * 0.17 + 2.1) * 1.1 + Math.sin(n * 0.043) * 0.6;
  return { x: slowX + (rnd(n, 1) - 0.5) * 1.2, y: slowY + (rnd(n, 2) - 0.5) * 1.6, rot: (rnd(n, 3) - 0.5) * 0.03 };
}

/** Exposure flicker, ±2.5 %. */
export const flicker = (n: number) => 1 + (rnd(n, 4) - 0.5) * 0.05 + Math.sin(n * 0.9) * 0.008;

/** Which grain tile and where (tiles are pre-made; picking one per frame makes the grain dance). */
export const grainPick = (n: number, tiles: number) => ({ tile: Math.floor(rnd(n, 5) * tiles), ox: rnd(n, 6), oy: rnd(n, 7) });

export type Speck = { x: number; y: number; r: number; dark: boolean };
export type Hair = { x: number; y: number; len: number; bend: number; rot: number };

/** Dust on the print: most frames have none, some one to three specks, rarely a hair. */
export function dirt(n: number): { specks: Speck[]; hair: Hair | null } {
  const r = mulberry32(n * 31 + 9);
  const specks: Speck[] = [];
  if (r() < 0.38) {
    const k = 1 + Math.floor(r() * 3);
    for (let i = 0; i < k; i++) specks.push({ x: r(), y: r(), r: 1.5 + r() * 4, dark: r() < 0.8 });
  }
  const hair = r() < 0.045 ? { x: 0.15 + r() * 0.7, y: 0.15 + r() * 0.7, len: 40 + r() * 90, bend: (r() - 0.5) * 60, rot: r() * 360 } : null;
  return { specks, hair };
}

/** End of the roll: a light leak washes in from one edge, flashes, then the film runs out to black. */
export function runOut(t: number, start: number) {
  const leak = smooth(win(t, start, start + 0.7));
  const flash = Math.max(0, 1 - Math.abs(t - (start + 0.75)) / 0.12);
  const black = smooth(win(t, start + 0.85, start + 1.2));
  return { leak, flash, black };
}

/** Grain tiles: neutral grey noise, slightly clumped (film grain is not pixel-sized white noise). */
export function makeGrainTiles(count = 6, size = 256): string[] {
  if (typeof document === "undefined") return [];
  const out: string[] = [];
  for (let k = 0; k < count; k++) {
    const r = mulberry32(400 + k);
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d")!;
    const img = g.createImageData(size, size);
    const base = new Float32Array(size * size);
    for (let i = 0; i < base.length; i++) base[i] = r();
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const i = y * size + x;
        // 3-tap blur clumps the grain
        const v = (base[i] * 2 + base[y * size + ((x + 1) % size)] + base[((y + 1) % size) * size + x]) / 4;
        const c8 = Math.round(128 + (v - 0.5) * 255 * 0.9);
        img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = c8;
        img.data[i * 4 + 3] = 255;
      }
    g.putImageData(img, 0, 0);
    out.push(c.toDataURL("image/png"));
  }
  return out;
}
