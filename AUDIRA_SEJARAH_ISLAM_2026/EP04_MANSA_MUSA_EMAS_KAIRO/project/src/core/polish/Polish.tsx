// Object & character polish (tier 1: code only, no downloaded assets).
//
// - <RoundedBoxGeo args={[w, h, d]} />: drop-in for <boxGeometry>; bevelled edges catch light
//   the way real objects do instead of razor-sharp CG corners.
// - POLISH.*: physical material recipes for <meshPhysicalMaterial {...POLISH.clay} color={c} />
//   (clearcoat plastic, ABS bricks, clay with soft sheen, fabric, toy skin, glossy eyes).
// - useSurfaceGrain(): seeded micro-grain texture for roughness/bump maps (fingerprints in clay,
//   moulding grain in plastic). Seeded, so every render tab produces the same pixels (the textures in
//   core/materials/noiseTexture.ts are seeded too; pass a seed to vary them).
// - lifeMotion(): deterministic blink / breathe / squash-and-stretch from the 60 fps film clock.

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { prng } from "../materials/textures.ts";

export const RoundedBoxGeo: React.FC<{ args: [number, number, number]; radius?: number; segments?: number }> = ({
  args,
  radius,
  segments = 4,
}) => {
  const [w, h, d] = args;
  const r = radius ?? Math.min(w, h, d) * 0.12;
  const geo = useMemo(() => new RoundedBoxGeometry(w, h, d, segments, r), [w, h, d, segments, r]);
  return <primitive object={geo} attach="geometry" />;
};

/** Physical material recipes. Spread into <meshPhysicalMaterial> and set `color`. */
export const POLISH = {
  /** Matte-satin moulded toy plastic. */
  toyPlastic: { roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.3, metalness: 0 },
  /** Glossy ABS building bricks. */
  brickABS: { roughness: 0.3, clearcoat: 0.85, clearcoatRoughness: 0.12, metalness: 0 },
  /** Plasticine / clay: very rough with a soft sheen at grazing angles. */
  clay: { roughness: 0.9, sheen: 0.22, sheenRoughness: 0.8, sheenColor: new THREE.Color("#ffe4d2"), metalness: 0 },
  /** Cloth, felt, shirts. */
  fabric: { roughness: 0.88, sheen: 0.8, sheenRoughness: 0.45, metalness: 0 },
  /** Painted toy skin / faces. */
  toySkin: { roughness: 0.55, clearcoat: 0.2, clearcoatRoughness: 0.4, sheen: 0.2, sheenRoughness: 0.6, metalness: 0 },
  /** Bead / glass eyes with a sharp highlight. */
  glossyEye: { roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03, metalness: 0 },
  /** Cold-press paper, card, painted storybook surfaces. */
  paper: { roughness: 0.94, sheen: 0.15, sheenRoughness: 0.8, metalness: 0 },
  /** Stone, plaster, cobbles, painted timber. */
  stone: { roughness: 0.88, metalness: 0 },
} as const;

/** Seeded grain texture (0.5 ± amplitude), tiled `repeat` times. Cached per (seed, size). */
const grainCache = new Map<string, THREE.CanvasTexture>();
export function surfaceGrain(seed = 7, size = 256, amplitude = 0.22, repeat = 3): THREE.Texture {
  const key = `${seed}:${size}:${amplitude}:${repeat}`;
  const hit = grainCache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const rnd = prng(seed);
  // Two octaves of value noise: fine grain plus soft blotches (fingerprint-like in clay).
  const coarse = Array.from({ length: 16 * 16 }, () => rnd());
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = (x / size) * 16, cy = (y / size) * 16;
      const ix = Math.floor(cx) % 16, iy = Math.floor(cy) % 16;
      const fx = cx - Math.floor(cx), fy = cy - Math.floor(cy);
      const a = coarse[iy * 16 + ix], b = coarse[iy * 16 + ((ix + 1) % 16)];
      const cc = coarse[((iy + 1) % 16) * 16 + ix], dd = coarse[((iy + 1) % 16) * 16 + ((ix + 1) % 16)];
      const soft = (a * (1 - fx) + b * fx) * (1 - fy) + (cc * (1 - fx) + dd * fx) * fy;
      const v = 0.5 + (soft - 0.5) * amplitude + (rnd() - 0.5) * amplitude * 0.6;
      const p = (y * size + x) * 4;
      img.data[p] = img.data[p + 1] = img.data[p + 2] = Math.max(0, Math.min(255, v * 255));
      img.data[p + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  grainCache.set(key, tex);
  return tex;
}

/** Memoised grain for use in components. */
export const useSurfaceGrain = (seed = 7, amplitude = 0.22, repeat = 3) =>
  useMemo(() => surfaceGrain(seed, 256, amplitude, repeat), [seed, amplitude, repeat]);

/**
 * Deterministic "alive" motion from the 60 fps film clock `f`.
 * blink: 1 = open, 0 = closed (multiply eye scale Y). breathe: ±1 slow sine. squash: [sx, sy, sz].
 */
export function lifeMotion(f: number, seed = 1) {
  const t = f / 60;
  // Blink every ~3.2–4.2 s, 0.14 s long, offset by seed.
  const period = 3.2 + (seed % 5) * 0.25;
  const phase = (t + seed * 0.37) % period;
  const blinkT = phase / 0.14;
  const blink = phase < 0.14 ? Math.abs(Math.cos(blinkT * Math.PI)) * 0.9 + 0.1 : 1;
  const breathe = Math.sin(t * Math.PI * 2 * 0.28 + seed);
  const s = 1 + breathe * 0.015;
  return { blink, breathe, squash: [1 / Math.sqrt(s), s, 1 / Math.sqrt(s)] as [number, number, number] };
}
