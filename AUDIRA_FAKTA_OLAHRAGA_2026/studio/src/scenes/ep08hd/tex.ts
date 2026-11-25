// EP08 HD2D canvas textures: sprite slabs (colour + silhouette), court, net, crowd, wood floor, sign boards.
// All textures are low-resolution canvases sampled with NearestFilter so the pixel grid survives the 3D light.
import * as THREE from "three";
import { rasterize, type Palette, type Sprite } from "../../kits/pixelstory/pixel/sprite.ts";
import { hash } from "../../kits/pixelstory/core/noise.ts";

const nearest = (c: HTMLCanvasElement, srgb = true) => {
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
};
const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d")! };
};

// ---------------------------------------------------------------- sprites
type Pair = { color: THREE.Texture; sil: THREE.Texture };
const spriteCache = new WeakMap<Sprite, WeakMap<Palette, Pair>>();
/** Colour texture + white silhouette (for the rim and the dark back plate) of one sprite in one palette. */
export const spriteTex = (s: Sprite, pal: Palette): Pair => {
  let byPal = spriteCache.get(s);
  if (!byPal) spriteCache.set(s, (byPal = new WeakMap()));
  const hit = byPal.get(pal);
  if (hit) return hit;
  const rgba = new Uint8ClampedArray(rasterize(s, pal));
  const a = canvas(s.w, s.h);
  a.g.putImageData(new ImageData(rgba, s.w, s.h), 0, 0);
  const sil = new Uint8ClampedArray(rgba.length);
  for (let i = 0; i < rgba.length; i += 4) {
    sil[i] = sil[i + 1] = sil[i + 2] = 255;
    sil[i + 3] = rgba[i + 3];
  }
  const b = canvas(s.w, s.h);
  b.g.putImageData(new ImageData(sil, s.w, s.h), 0, 0);
  const pair = { color: nearest(a.c), sil: nearest(b.c) };
  byPal.set(pal, pair);
  return pair;
};

// ---------------------------------------------------------------- generic cache
const cache = new Map<string, THREE.Texture>();
const once = (key: string, make: () => THREE.Texture) => {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key)!;
};

/** Badminton court, 4.0 × 8.8 units at 20 px/unit (length along +y of the canvas = +z in the world). */
export const courtTex = (tone: "green" | "blue" = "green") =>
  once(`court-${tone}`, () => {
    const W = 80;
    const H = 176;
    const { c, g } = canvas(W, H);
    const base = tone === "green" ? ["#1F6A4A", "#23744F"] : ["#1E4E86", "#22588F"];
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        g.fillStyle = hash(x * 13 + y * 71) > 0.5 ? base[0] : base[1];
        g.fillRect(x, y, 1, 1);
      }
    g.fillStyle = "#F3EEE2";
    const line = (x: number, y: number, w: number, h: number) => g.fillRect(x, y, w, h);
    line(0, 0, W, 1); line(0, H - 1, W, 1); line(0, 0, 1, H); line(W - 1, 0, 1, H); // doubles outer
    line(6, 0, 1, H); line(W - 7, 0, 1, H); // singles side lines
    line(0, 88 - 39, W, 1); line(0, 88 + 39, W, 1); // short service lines (1.98 m from the net)
    line(0, 15, W, 1); line(0, H - 16, W, 1); // doubles long service lines
    line(40, 0, 1, 88 - 39); line(40, 88 + 39, 1, H - 88 - 39); // centre lines
    return nearest(c);
  });

/** Court roughness: worn sheen lanes (smoother where players slide) + pixel noise, so the spot reads as a moving highlight. */
export const courtRoughTex = () =>
  once("court-rough", () => {
    const W = 40;
    const H = 88;
    const { c, g } = canvas(W, H);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const lane = Math.exp(-(((x - 20) / 9) ** 2)) * 0.35 + Math.exp(-(((y - 44) / 30) ** 2)) * 0.15;
        const v = Math.round(255 * Math.min(1, Math.max(0, 0.72 - lane + (hash(x * 31 + y * 17) - 0.5) * 0.3)));
        g.fillStyle = `rgb(${v},${v},${v})`;
        g.fillRect(x, y, 1, 1);
      }
    return nearest(c, false);
  });

/** Olympic surround mat: two-tone blue pixel weave with a darker border band (fills the floor around the court). */
export const apronTex = () =>
  once("apron", () => {
    const W = 64;
    const H = 96;
    const { c, g } = canvas(W, H);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const edge = x < 3 || x > W - 4 || y < 3 || y > H - 4;
        const weave = (x + y) % 4 < 2;
        const n = hash(x * 7 + y * 53);
        g.fillStyle = edge ? "#0F1E3A" : n > 0.92 ? "#3A6AA8" : weave ? "#21457A" : "#1C3C6C";
        g.fillRect(x, y, 1, 1);
      }
    return nearest(c);
  });

/** Net mesh with the white top band. */
export const netTex = () =>
  once("net", () => {
    const { c, g } = canvas(64, 16);
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 64; x++) {
        const on = x % 3 === 0 || y % 3 === 0;
        g.fillStyle = on ? "rgba(20,22,26,0.92)" : "rgba(0,0,0,0)";
        g.fillRect(x, y, 1, 1);
      }
    g.fillStyle = "#F3EEE2";
    g.fillRect(0, 0, 64, 2);
    return nearest(c);
  });

/** Crowd riser: rows of pixel heads and shirts, a few red-white flags. */
export const crowdTex = (seed = 1, rows = 6, flags = true) =>
  once(`crowd-${seed}-${rows}-${flags}`, () => {
    const W = 192;
    const H = rows * 8;
    const { c, g } = canvas(W, H);
    g.fillStyle = "#14121A";
    g.fillRect(0, 0, W, H);
    const shirts = ["#D02A30", "#F1EBDD", "#2E5A8A", "#F2C230", "#3A3A48", "#B8222E", "#E9E2D2"];
    for (let r = 0; r < rows; r++)
      for (let i = 0; i < W / 4; i++) {
        const h = hash(seed * 97 + r * 131 + i * 7);
        if (h < 0.12) continue;
        const x = i * 4 + (r % 2) * 2;
        const y = r * 8 + 1;
        g.fillStyle = shirts[Math.floor(hash(seed + r * 17 + i * 3) * shirts.length)];
        g.fillRect(x, y + 3, 3, 4);
        g.fillStyle = h > 0.6 ? "#C98E68" : "#8A5A3E";
        g.fillRect(x, y, 3, 3);
        g.fillStyle = "#1A1214";
        g.fillRect(x, y, 3, 1);
        if (flags && h > 0.93) {
          g.fillStyle = "#D02A30";
          g.fillRect(x + 1, y - 3, 5, 2);
          g.fillStyle = "#F5EEDF";
          g.fillRect(x + 1, y - 1, 5, 2);
        }
      }
    return nearest(c);
  });

/** Wooden floor planks (repeat set by the caller). */
export const woodTex = (light = false) =>
  once(`wood-${light}`, () => {
    const { c, g } = canvas(32, 32);
    const tones = light ? ["#9A6A42", "#A8764A", "#8E6038"] : ["#5A3A26", "#64412A", "#4E3220"];
    for (let r = 0; r < 4; r++) {
      const off = Math.floor(hash(r * 5) * 32);
      for (let x = 0; x < 32; x++)
        for (let y = 0; y < 8; y++) {
          g.fillStyle = tones[Math.floor(hash(r * 33 + x * 3 + y * 101) * 3)];
          g.fillRect(x, r * 8 + y, 1, 1);
        }
      g.fillStyle = "#2A1A10";
      g.fillRect(0, r * 8 + 7, 32, 1);
      g.fillRect((off + 16) % 32, r * 8, 1, 7);
    }
    const t = nearest(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });

/** Paving / courtyard tiles. */
export const paveTex = (night = false) =>
  once(`pave-${night}`, () => {
    const { c, g } = canvas(32, 32);
    const tones = night ? ["#3A3A46", "#34343F", "#40404C"] : ["#B8AE9A", "#AEA48E", "#C2B8A4"];
    for (let y = 0; y < 32; y++)
      for (let x = 0; x < 32; x++) {
        g.fillStyle = x % 8 === 0 || y % 8 === 0 ? (night ? "#22222A" : "#8E846F") : tones[Math.floor(hash(x * 7 + y * 53) * 3)];
        g.fillRect(x, y, 1, 1);
      }
    const t = nearest(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });

/** Grass. */
export const grassTex = () =>
  once("grass", () => {
    const { c, g } = canvas(32, 32);
    const tones = ["#3E7A3A", "#468442", "#36703A", "#4E8E46"];
    for (let y = 0; y < 32; y++)
      for (let x = 0; x < 32; x++) {
        g.fillStyle = tones[Math.floor(hash(x * 17 + y * 29) * 4)];
        g.fillRect(x, y, 1, 1);
      }
    const t = nearest(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });

/** Sign board: pixel-font text on a flat colour (chunky because the canvas is small). */
export const signTex = (text: string, bg: string, fg: string, w = 96, h = 16, size = 12) =>
  once(`sign-${text}-${bg}-${fg}-${w}-${h}-${size}`, () => {
    const { c, g } = canvas(w, h);
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = fg;
    g.font = `bold ${size}px "Courier New", monospace`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, w / 2, h / 2 + 1);
    // threshold so the letters stay crisp pixels
    const img = g.getImageData(0, 0, w, h);
    const fgc = fg.match(/\w\w/g)!.map((x) => parseInt(x, 16));
    const bgc = bg.match(/\w\w/g)!.map((x) => parseInt(x, 16));
    for (let i = 0; i < img.data.length; i += 4) {
      const d = Math.abs(img.data[i] - fgc[0]) + Math.abs(img.data[i + 1] - fgc[1]) + Math.abs(img.data[i + 2] - fgc[2]);
      const e = Math.abs(img.data[i] - bgc[0]) + Math.abs(img.data[i + 1] - bgc[1]) + Math.abs(img.data[i + 2] - bgc[2]);
      const src = d < e ? fgc : bgc;
      img.data[i] = src[0];
      img.data[i + 1] = src[1];
      img.data[i + 2] = src[2];
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return nearest(c);
  });

/** Lit windows of a building facade. */
export const windowsTex = (seed: number, night: boolean, cols = 8, rows = 12) =>
  once(`win-${seed}-${night}-${cols}-${rows}`, () => {
    const { c, g } = canvas(cols * 4, rows * 4);
    g.fillStyle = night ? "#1A1C2A" : "#C9BBA0";
    g.fillRect(0, 0, cols * 4, rows * 4);
    for (let r = 0; r < rows; r++)
      for (let k = 0; k < cols; k++) {
        const h = hash(seed * 31 + r * 13 + k * 7);
        g.fillStyle = night ? (h > 0.45 ? (h > 0.85 ? "#FFE3A0" : "#F2B860") : "#262A3C") : h > 0.5 ? "#5C7894" : "#47607A";
        g.fillRect(k * 4 + 1, r * 4 + 1, 2, 2);
      }
    return nearest(c);
  });

/** Soft round contact shadow (alpha falls off to the rim). */
export const shadowTex = () =>
  once("shadow", () => {
    const { c, g } = canvas(64, 64);
    const grd = g.createRadialGradient(32, 32, 2, 32, 32, 31);
    grd.addColorStop(0, "rgba(4,4,8,0.85)");
    grd.addColorStop(0.55, "rgba(4,4,8,0.45)");
    grd.addColorStop(1, "rgba(4,4,8,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
  });

/** Night sky gradient with pixel stars (B window, OUT backdrop). */
export const skyTex = (kind: "night" | "dawn") =>
  once(`sky-${kind}`, () => {
    const { c, g } = canvas(64, 96);
    const stops = kind === "night" ? ["#05070F", "#0E1530", "#26244A"] : ["#7FA8D8", "#BCD2E6", "#F4D8B0"];
    const grd = g.createLinearGradient(0, 0, 0, 96);
    grd.addColorStop(0, stops[0]);
    grd.addColorStop(0.6, stops[1]);
    grd.addColorStop(1, stops[2]);
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 96);
    if (kind === "night")
      for (let i = 0; i < 70; i++) {
        g.fillStyle = hash(i * 3) > 0.7 ? "#FFF3D0" : "#9FB0E0";
        g.fillRect(Math.floor(hash(i * 11) * 64), Math.floor(hash(i * 23) * 60), 1, 1);
      }
    return nearest(c);
  });
