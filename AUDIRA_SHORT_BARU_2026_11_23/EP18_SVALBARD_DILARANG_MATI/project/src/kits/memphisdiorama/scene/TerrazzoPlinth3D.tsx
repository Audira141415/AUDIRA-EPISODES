import React from "react";
import { MEMPHISDIORAMA_PALETTE as C } from "../lib/palette";
import { POLISH, RoundedBoxGeo } from "../../../core/polish/Polish.tsx";
import { prng } from "../../../core/materials/textures.ts";

const CHIP_COLORS = [C.coralPink, C.skyBlue, C.canaryYellow, C.mintGreen, C.paperWarm];

// Seeded terrazzo chips (same layout every render tab).
const CHIPS = (() => {
  const r = prng(4242);
  r(); r(); r();
  return Array.from({ length: 46 }, (_, i) => ({
    x: (r() - 0.5) * 4.6,
    z: (r() - 0.5) * 3.2,
    rot: r() * Math.PI,
    s: 0.06 + r() * 0.1,
    tri: i % 3 === 0,
    color: CHIP_COLORS[i % CHIP_COLORS.length],
  }));
})();

/** Charcoal terrazzo tabletop plinth (dark, so the candy-coloured objects pop off it) on a paper floor; the hard violet slab is the Memphis drop shadow. */
export const TerrazzoPlinth3D: React.FC<{ f: number }> = () => (
  <group>
    <mesh position={[0, -0.52, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshPhysicalMaterial {...POLISH.paper} color={C.paperWarm} />
    </mesh>
    {/* Hard cool-purple drop-shadow slab */}
    <mesh position={[0.35, -0.5, -0.3]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[5.0, 3.6]} />
      <meshBasicMaterial color={C.shadowPurple} />
    </mesh>
    <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[5.0, 0.5, 3.6]} radius={0.06} />
      <meshPhysicalMaterial {...POLISH.stone} color="#2E2B45" roughness={0.45} clearcoat={0.5} clearcoatRoughness={0.3} />
    </mesh>
    {CHIPS.map((c, i) => (
      <mesh key={i} position={[c.x, 0.004, c.z]} rotation={[-Math.PI / 2, 0, c.rot]}>
        {c.tri ? <circleGeometry args={[c.s, 3]} /> : <circleGeometry args={[c.s * 0.8, 7]} />}
        <meshStandardMaterial color={c.color} roughness={0.5} />
      </mesh>
    ))}
  </group>
);
