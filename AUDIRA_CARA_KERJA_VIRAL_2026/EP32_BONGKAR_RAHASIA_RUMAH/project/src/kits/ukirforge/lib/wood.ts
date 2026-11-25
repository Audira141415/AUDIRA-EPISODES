// Procedural wood: growth rings warped by noise, fine fibres along the grain, medullary flecks and
// pores. One canvas per (species, seed, cut), cached for the render. No photo textures.
//
//   const { map, bump } = woodTexture("jati", 3);          // plank (long grain along u)
//   const end = woodTexture("jati", 3, "end");              // end grain: concentric rings

import * as THREE from "three";
import { WOOD, type Species } from "./palette.ts";

// Seeded value noise (deterministic in every render tab).
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

const rgb = (hex: string) => {
  const c = new THREE.Color(hex);
  return [c.r * 255, c.g * 255, c.b * 255];
};

export type Cut = "plank" | "end";
const cache = new Map<string, { map: THREE.CanvasTexture; bump: THREE.CanvasTexture }>();

/** Colour map and bump map for a species. Plank grain runs along u (canvas x). */
export function woodTexture(species: Species, seed = 1, cut: Cut = "plank", size = 512) {
  const key = `${species}:${seed}:${cut}:${size}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const W = WOOD[species];
  const L = rgb(W.light), D = rgb(W.dark);
  const c = document.createElement("canvas");
  const b = document.createElement("canvas");
  c.width = c.height = b.width = b.height = size;
  const g = c.getContext("2d")!, gb = b.getContext("2d")!;
  const img = g.createImageData(size, size), ib = gb.createImageData(size, size);
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const x = i / size, y = j / size;
      let r: number;
      if (cut === "end") {
        const dx = x - 0.5 + (fbm(x * 3, y * 3, seed) - 0.5) * 0.08;
        const dy = y - 0.5 + (fbm(x * 3 + 9, y * 3, seed) - 0.5) * 0.08;
        r = Math.hypot(dx, dy) * W.rings * 3.2;
      } else {
        // Rings seen from the side: stripes across v, warped along u (cathedral figure).
        const warp = (fbm(x * 1.6, y * 1.1, seed) - 0.5) * 0.9 + Math.sin(x * 3.2 + seed) * 0.05;
        r = (y + warp * 0.3) * W.rings + fbm(x * 0.6, y * 4, seed + 5) * 0.45;
      }
      const ring = r - Math.floor(r);
      // Late wood is a narrow dark band with a soft early-wood side.
      const late = Math.pow(Math.max(0, Math.sin(ring * Math.PI)), 6) * 0.55 + (ring > 0.82 ? (ring - 0.82) * 2.4 : 0);
      const fibre = cut === "end" ? noise2(x * 260, y * 260, seed) : noise2(x * 18, y * 420, seed + 2);
      const fleck = cut === "end" ? 0 : Math.pow(noise2(x * 60, y * 9, seed + 7), 8) * 0.6;
      const pore = Math.pow(noise2(x * 140, y * 340, seed + 11), 14);
      const k = Math.min(1, late * 0.85 + (fibre - 0.5) * 0.18 + 0.08 - fleck * 0.4 + pore * 0.6);
      const o = (j * size + i) * 4;
      for (let ch = 0; ch < 3; ch++) img.data[o + ch] = L[ch] + (D[ch] - L[ch]) * Math.max(0, k);
      img.data[o + 3] = 255;
      const h = 150 - late * 50 + (fibre - 0.5) * 40 - pore * 90;
      ib.data[o] = ib.data[o + 1] = ib.data[o + 2] = Math.max(0, Math.min(255, h));
      ib.data[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  gb.putImageData(ib, 0, 0);
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 8;
  const bump = new THREE.CanvasTexture(b);
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
  const out = { map, bump };
  cache.set(key, out);
  return out;
}

/** MeshPhysical recipe for oiled wood (satin) or raw cut wood (matte). */
export const woodFinish = (oiled: boolean) =>
  oiled
    ? { roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.35, sheen: 0.2, sheenRoughness: 0.6, metalness: 0 }
    : { roughness: 0.82, clearcoat: 0, sheen: 0.35, sheenRoughness: 0.8, metalness: 0 };

/** Painted wood (toys): paint over grain, the grain still shows through the bump. */
export const paintFinish = { roughness: 0.48, clearcoat: 0.55, clearcoatRoughness: 0.28, metalness: 0 };
