import * as THREE from "three";
import { mulberry32 } from "../core/motion";

// Procedural, seeded textures (no image assets): wood grain, pegboard, the AUDIRA banner.
const cache = new Map<string, THREE.CanvasTexture>();
const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

/** Long-grain wood: soft annual rings plus fine pores, grey so `color` tints it. */
export function woodGrain(seed = 11, repeat: [number, number] = [1, 1]) {
  const key = `wood${seed}${repeat}`;
  if (cache.has(key)) return cache.get(key)!;
  const W = 512, H = 512, c = canvas(W, H), g = c.getContext("2d")!, img = g.createImageData(W, H), rnd = mulberry32(seed);
  const waves = Array.from({ length: 6 }, () => ({ f: 0.004 + rnd() * 0.01, p: rnd() * 6.28, a: 6 + rnd() * 18 }));
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let warp = 0;
      for (const w of waves) warp += Math.sin(x * w.f + w.p) * w.a;
      const ring = Math.sin((y + warp) * 0.11) * 0.5 + 0.5;
      const pore = rnd() * 0.08;
      const v = 168 + ring * 52 - pore * 255 * 0.5;
      const i = (y * W + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.max(0, Math.min(255, v));
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, t);
  return t;
}

/** Pegboard: hole grid on hardboard. Returns map (colour) and bump. */
export function pegboard(repeat: [number, number] = [6, 6]) {
  const key = `peg${repeat}`;
  if (cache.has(key)) return cache.get(key)!;
  const S = 128, c = canvas(S, S), g = c.getContext("2d")!, rnd = mulberry32(77);
  const img = g.createImageData(S, S);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 196 + rnd() * 22;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  g.fillStyle = "#1a120c";
  for (const [x, y] of [[32, 32], [96, 32], [32, 96], [96, 96]]) {
    g.beginPath();
    g.arc(x, y, 6, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, t);
  return t;
}

/** Cloth banner with the brand word: brand in the scene, cannot be cropped out. */
export function bannerTexture(text: string, bg: string, fg: string) {
  const key = `banner${text}${bg}${fg}`;
  if (cache.has(key)) return cache.get(key)!;
  const W = 1024, H = 448, c = canvas(W, H), g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  // woven texture
  const rnd = mulberry32(5);
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = `rgba(0,0,0,${rnd() * 0.08})`;
    g.fillRect(rnd() * W, rnd() * H, 2, 1 + rnd() * 3);
  }
  // stitched border
  g.strokeStyle = fg;
  g.lineWidth = 6;
  g.setLineDash([22, 14]);
  g.strokeRect(28, 28, W - 56, H - 56);
  g.setLineDash([]);
  g.fillStyle = fg;
  g.font = "900 220px 'Arial Black', 'Segoe UI', sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, W / 2, H / 2 + 10);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
}

/** Transparent domino face decal with pips (two halves), seeded per domino. */
export function dominoFace(seed: number, pip: string) {
  const key = `dom${seed}${pip}`;
  if (cache.has(key)) return cache.get(key)!;
  const W = 128, H = 256, c = canvas(W, H), g = c.getContext("2d")!, rnd = mulberry32(seed);
  g.fillStyle = "rgba(0,0,0,0.28)";
  g.fillRect(12, H / 2 - 3, W - 24, 6);
  const layouts = [[], [[0.5, 0.5]], [[0.28, 0.28], [0.72, 0.72]], [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]], [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]], [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]], [[0.28, 0.22], [0.72, 0.22], [0.28, 0.5], [0.72, 0.5], [0.28, 0.78], [0.72, 0.78]]];
  g.fillStyle = pip;
  for (const half of [0, 1]) {
    const lay = layouts[1 + Math.floor(rnd() * 6)];
    for (const [px, py] of lay) {
      g.beginPath();
      g.arc(px * W, (half * 0.5 + py * 0.5) * H, 11, 0, Math.PI * 2);
      g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, t);
  return t;
}
