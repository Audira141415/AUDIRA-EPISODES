import React from "react";
import { HERO_Z, computeHd2dState } from "../core/motion";
import { HD2D_PALETTE } from "../lib/palette";
import { POLISH } from "../../../core/polish/Polish.tsx";

const RIM_COLOR = "#BFD4FF";
/** Sprite silhouette parts [x, y, w, h]: boots (0, 1), tunic, scarf, head, hair. */
const RIM_PARTS: [number, number, number, number][] = [
  [-0.12, 0.12, 0.14, 0.22],
  [0.12, 0.12, 0.14, 0.22],
  [0, 0.42, 0.42, 0.42],
  [0.08, 0.62, 0.52, 0.14],
  [0, 0.84, 0.36, 0.32],
  [0, 1.02, 0.42, 0.16],
];

/**
 * Flat 16-bit hero: thin slabs (depth 0.06–0.08) on the 8 fps step clock, lit by real 3D light.
 * Walks (stepped) to the lantern, legs alternating; amber embers rise past; contact shadow below.
 */
export const PixelHeroBillboard3D: React.FC<{ f: number }> = ({ f }) => {
  const state = computeHd2dState(f);
  const stride = state.walking ? (state.spriteStepFrame % 2 === 0 ? 0.05 : -0.05) : 0;
  const emberCount = 5 + Math.round(state.wake * 7);

  return (
    <group>
      <group position={[state.heroX, 0.02 + state.heroBobY, HERO_Z]}>
        {/* Contact shadow disc */}
        <mesh position={[0, 0.005 - state.heroBobY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.38, 24]} />
          <meshBasicMaterial color="#05070B" transparent opacity={0.85} />
        </mesh>

        {/* Moon-rim outline: a slightly larger pale backer behind each slab, so the navy tunic
            separates from the navy walls (HD-2D sprites carry a light rim; ~7 px at 1080 wide) */}
        {RIM_PARTS.map(([x, y, w, h], i) => (
          <mesh key={`rim${i}`} position={[x, y + (i < 2 ? (i === 0 ? stride : -stride) : 0), -0.045]}>
            <planeGeometry args={[w + 0.08, h + 0.08]} />
            <meshBasicMaterial color={RIM_COLOR} transparent opacity={0.95} toneMapped={false} />
          </mesh>
        ))}

        {/* Boots (alternate on the step clock while walking) */}
        <mesh position={[-0.12, 0.12 + stride, 0]} castShadow>
          <boxGeometry args={[0.14, 0.22, 0.06]} />
          <meshStandardMaterial color="#3B2314" roughness={0.9} />
        </mesh>
        <mesh position={[0.12, 0.12 - stride, 0]} castShadow>
          <boxGeometry args={[0.14, 0.22, 0.06]} />
          <meshStandardMaterial color="#3B2314" roughness={0.9} />
        </mesh>
        {/* Tunic */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.42, 0.42, 0.07]} />
          <meshPhysicalMaterial {...POLISH.fabric} color="#1F3A60" />
        </mesh>
        {/* Scarlet scarf: the one warm-red focal point */}
        <mesh position={[0.08, 0.62, 0.03]} castShadow>
          <boxGeometry args={[0.52, 0.14, 0.08]} />
          <meshPhysicalMaterial {...POLISH.fabric} color={HD2D_PALETTE.heroScarlet} emissive={HD2D_PALETTE.heroScarlet} emissiveIntensity={0.25} />
        </mesh>
        {/* Head + hair */}
        <mesh position={[0, 0.84, 0]} castShadow>
          <boxGeometry args={[0.36, 0.32, 0.07]} />
          <meshPhysicalMaterial {...POLISH.toySkin} color="#F3C6A5" />
        </mesh>
        <mesh position={[0, 1.02, 0.01]} castShadow>
          <boxGeometry args={[0.42, 0.16, 0.08]} />
          <meshStandardMaterial color="#D99B52" roughness={0.85} />
        </mesh>
        {/* Pixel eyes */}
        {[-0.08, 0.08].map((x) => (
          <mesh key={x} position={[x, 0.86, 0.04]}>
            <boxGeometry args={[0.05, 0.05, 0.01]} />
            <meshBasicMaterial color="#1B1410" />
          </mesh>
        ))}
      </group>

      {/* Floating golden torch embers around the lantern; more of them when the town wakes */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh
          key={i}
          visible={i < emberCount}
          position={[
            -0.9 + (i % 6) * 0.3 + Math.sin(f * 0.04 + i) * 0.1,
            0.3 + ((state.emberRiseY * (1 + state.wake * 0.6) + i * 0.37) % 2.4),
            0.75 - (i % 3) * 0.3,
          ]}
        >
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshBasicMaterial color={[2.2, 1.5, 0.5]} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};
