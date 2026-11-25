// HD2D sprite slab: a pixel sprite standing upright in the lit 3D diorama.
//   front plane  colour texture (Nearest), lit by the scene (standard material) + a little emissive so it never goes muddy
//   back plate   dark silhouette 0.03 behind: gives the slab a visible thickness at grazing angles
//   rim plate    pale #BFD4FF silhouette 0.045 behind, 4 % larger: the HD2D edge light
//   contact      soft shadow disc on the floor + a real cast shadow (alphaTest carries into the shadow map)
import React, { useMemo } from "react";
import * as THREE from "three";
import type { Palette, Sprite } from "../../kits/pixelstory/pixel/sprite.ts";
import { shadowTex, spriteTex } from "./tex.ts";

type V3 = [number, number, number];
export type Anchor = { x: number; y: number };

export const Slab: React.FC<{
  s: Sprite;
  pal: Palette;
  anchor: Anchor;
  /** World height of the whole sprite canvas. */
  height: number;
  position: V3;
  /** Face this point (camera xz); ignored when yaw is given. */
  face?: [number, number];
  yaw?: number;
  flip?: boolean;
  /** Lift off the floor (jumps); the contact shadow stays on the floor and shrinks. */
  lift?: number;
  rim?: string;
  glow?: number;
  shadow?: number;
  children?: React.ReactNode;
}> = ({ s, pal, anchor, height, position, face, yaw, flip, lift = 0, rim = "#BFD4FF", glow = 0.35, shadow = 1, children }) => {
  const tex = spriteTex(s, pal);
  const px = height / s.h;
  const w = s.w * px;
  const cx = ((s.w - 1) / 2 - anchor.x) * px * (flip ? -1 : 1);
  const cy = (anchor.y - (s.h - 1) / 2) * px + px / 2;
  const ry = yaw ?? (face ? Math.atan2(face[0] - position[0], face[1] - position[2]) : 0);
  const sx = flip ? -1 : 1;
  const mats = useMemo(
    () => ({
      front: new THREE.MeshStandardMaterial({ map: tex.color, emissiveMap: tex.color, emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: glow, roughness: 0.85, metalness: 0, alphaTest: 0.5, side: THREE.DoubleSide }),
      back: new THREE.MeshStandardMaterial({ map: tex.sil, color: "#1A1418", roughness: 1, alphaTest: 0.5, side: THREE.DoubleSide }),
      rim: new THREE.MeshBasicMaterial({ map: tex.sil, color: rim, alphaTest: 0.5, side: THREE.DoubleSide, toneMapped: false }),
      shadow: new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, opacity: 0.8 * shadow }),
    }),
    [tex, rim, glow, shadow],
  );
  const shrink = 1 / (1 + lift * 0.9);
  return (
    <group position={position}>
      {shadow > 0 ? (
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[w * 0.55 * shrink + 0.25, w * 0.32 * shrink + 0.14, 1]} material={mats.shadow}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ) : null}
      <group rotation={[0, ry, 0]} position={[0, lift, 0]}>
        <mesh position={[cx, cy, 0]} scale={[sx, 1, 1]} material={mats.front} castShadow>
          <planeGeometry args={[w, height]} />
        </mesh>
        <mesh position={[cx, cy, -0.03]} scale={[sx, 1, 1]} material={mats.back}>
          <planeGeometry args={[w, height]} />
        </mesh>
        <mesh position={[cx, cy, -0.045]} scale={[sx * 1.04, 1.03, 1]} material={mats.rim}>
          <planeGeometry args={[w, height]} />
        </mesh>
        {children}
      </group>
    </group>
  );
};

/** World offset (relative to the slab origin, before yaw) of the top-most opaque pixel in the right half: the raised hand. */
export const handTop = (s: Sprite, anchor: Anchor, height: number, flip = false): V3 => {
  const px = height / s.h;
  for (let y = 0; y < s.h; y++)
    for (let x = s.w - 1; x >= Math.floor(s.w / 2) - 2; x--)
      if (s.cells[y * s.w + x] !== ".") return [(x - anchor.x) * px * (flip ? -1 : 1), (anchor.y - y) * px + px / 2, 0.02];
  return [0, height, 0.02];
};
