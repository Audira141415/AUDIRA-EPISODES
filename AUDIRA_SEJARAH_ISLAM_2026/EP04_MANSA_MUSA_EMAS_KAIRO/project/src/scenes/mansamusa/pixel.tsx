// HD-2D pixel sprites: a character map becomes one merged mesh of tiny vertex-coloured voxels,
// so the sprite is a crisp 2D pixel image that still receives real 3D light and casts a shadow.
// Built in useMemo (no effects), so every render tab produces the same geometry.

import React, { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type SpriteMap = { rows: string[]; pal: Record<string, string> };

export function spriteGeometry(map: SpriteMap, px: number, depth = 0.7): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const h = map.rows.length;
  const w = Math.max(...map.rows.map((r) => r.length));
  const c = new THREE.Color();
  map.rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const col = map.pal[ch];
      if (!col) return;
      const g = new THREE.BoxGeometry(px, px, px * depth);
      g.translate((x - (w - 1) / 2) * px, (h - 1 - y) * px + px / 2, 0);
      c.set(col).convertSRGBToLinear();
      const n = g.attributes.position.count;
      const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) arr.set([c.r, c.g, c.b], i * 3);
      g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
      parts.push(g);
    });
  });
  const merged = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  return merged;
}

export const PixelSprite: React.FC<{
  map: SpriteMap;
  px?: number;
  position?: [number, number, number];
  rotationY?: number;
  flip?: boolean;
  bob?: number;
}> = ({ map, px = 0.035, position = [0, 0, 0], rotationY = 0, flip = false, bob = 0 }) => {
  const geo = useMemo(() => spriteGeometry(map, px), [map, px]);
  return (
    <group position={[position[0], position[1] + bob, position[2]]} rotation={[0, rotationY, 0]} scale={[flip ? -1 : 1, 1, 1]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.82} metalness={0} />
      </mesh>
    </group>
  );
};

// ---- Sprite maps. Every figure is faceless: seen from behind or as a wrapped silhouette. ----

const ROBE = { t: "#F1E8D4", T: "#B9A47E", r: "#3B5C8C", R: "#2A4268", s: "#5A3A22", g: "#F2B935", G: "#B97F17" };

/** Pilgrim walking away from the camera (back view, head wrapped, no face). */
export const PILGRIM_BACK: SpriteMap = {
  pal: ROBE,
  rows: [
    "..ttt..",
    ".ttttt.",
    ".ttttt.",
    "..TTT..",
    ".rrrrr.",
    "rrRrRrr",
    "rrRrRrr",
    "rrRrRrr",
    "rrrRrrr",
    ".rrRrr.",
    ".rrrrr.",
    ".rr.rr.",
    ".ss.ss.",
  ],
};

/** Second robe colour for crowd variety. */
export const PILGRIM_BACK_WHITE: SpriteMap = {
  pal: { ...ROBE, r: "#EFE6D2", R: "#CDBF9F", t: "#F7F1E2", T: "#D8CBAA" },
  rows: PILGRIM_BACK.rows,
};

/** Porter from behind carrying a gold sack on the shoulder. */
export const PORTER_BACK: SpriteMap = {
  pal: { ...ROBE, r: "#7A4A2A", R: "#5C341C" },
  rows: [
    "....GGG.",
    "...GgggG",
    ".ttGgggG",
    "tTTTGGG.",
    "tTTT....",
    "rrrrr...",
    "rRrRrr..",
    "rRrRrr..",
    "rrRrrr..",
    "rrRrrr..",
    ".rrrr...",
    ".r..r...",
    ".s..s...",
  ],
};

/** Camel in profile, loaded with gold bags, a wrapped rider on top (no facial detail). */
export const CAMEL_GOLD: SpriteMap = {
  pal: {
    b: "#B98552", B: "#8E5F35", d: "#5E3D21", g: "#F2B935", G: "#B97F17", c: "#9C2F2A", C: "#6E1F1C",
    t: "#E9DCC0", T: "#C9B793", r: "#2E4C7A",
  },
  rows: [
    "...............tt.....",
    "..............tTTt....",
    "..............rrrr....",
    "..bb.........crrrrc...",
    ".bbbb.......GccccccG..",
    ".bBb.......GggCccCggG.",
    "..bb.......GgggbbbgggG",
    "..bb......bbGGbbbbGGb.",
    "..bbb...bbbbbbbbbbbbbb",
    "...bbbbbbbbbbbbbbbbbbB",
    "....bbbbbbbbbbbbbbbbB.",
    "......BbbbbbbbbbbbbB..",
    ".......Bb..b....b.Bb..",
    ".......b...b....b..b..",
    ".......b...b....b..b..",
    ".......b...b....b..b..",
    ".......d...d....d..d..",
  ],
};

/** A hand seen from the side (sleeve + fist), no body, no face. Used for writing and holding. */
export const HAND_SIDE: SpriteMap = {
  pal: { k: "#8A5A3A", K: "#6A4128", s: "#E9DCC0", S: "#C9B793" },
  rows: [
    "..kkk...",
    ".kkkkk..",
    "kkKkkkk.",
    "kkkkkkkk",
    ".kkkkkk.",
    "..kkkk..",
    "..sSss..",
    "..sSss..",
    "..sSss..",
  ],
};

/** Darker hand for the Catalan Atlas tableau (only a hand, never a person). */
export const HAND_DARK: SpriteMap = {
  pal: { ...HAND_SIDE.pal, k: "#4A2E1E", K: "#33200F", s: "#9C2F2A", S: "#6E1F1C" },
  rows: HAND_SIDE.rows,
};

/** Court official from behind: red robe, white wrapped head, no face. */
export const OFFICIAL_BACK: SpriteMap = {
  pal: { ...ROBE, r: "#8C2A26", R: "#5E1A18", t: "#F4EEDC", T: "#CFC3A2", g: "#F2B935" },
  rows: PILGRIM_BACK.rows,
};

/** Official in green for variety. */
export const OFFICIAL_BACK_GREEN: SpriteMap = {
  pal: { ...ROBE, r: "#2F6B4A", R: "#1E4A32", t: "#F4EEDC", T: "#CFC3A2" },
  rows: PILGRIM_BACK.rows,
};
