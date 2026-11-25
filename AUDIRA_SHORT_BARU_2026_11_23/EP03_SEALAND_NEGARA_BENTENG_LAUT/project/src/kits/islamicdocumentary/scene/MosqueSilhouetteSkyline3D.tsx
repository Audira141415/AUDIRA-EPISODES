import React from "react";
import { RoundedBoxGeo, useSurfaceGrain } from "../../../core/polish/Polish.tsx";
import { SceneText } from "../../../core/polish/Drei.tsx";
import { computeIslamicDocumentaryState } from "../core/motion";
import { ISLAMICDOCUMENTARY_PALETTE as C } from "../lib/palette";
import { GILT, SANDSTONE } from "../lib/materials";

/** One minaret: tapered sandstone shaft, two balconies and a gilt finial. Rises out of the floor. */
const Minaret: React.FC<{ x: number; reveal: number }> = ({ x, reveal }) => {
  const h = 2.5;
  return (
    <group position={[x, -(1 - reveal) * (h + 0.6), 0.45]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.14, h, 16]} />
        <meshPhysicalMaterial color={C.desertSand} {...SANDSTONE} />
      </mesh>
      {[0.62, 0.86].map((k) => (
        <mesh key={k} position={[0, h * k, 0]} castShadow>
          <cylinderGeometry args={[0.19, 0.16, 0.07, 16]} />
          <meshPhysicalMaterial color="#d8c393" {...SANDSTONE} />
        </mesh>
      ))}
      <mesh position={[0, h + 0.17, 0]} castShadow>
        <coneGeometry args={[0.13, 0.34, 16]} />
        <meshPhysicalMaterial color={C.royalGold} {...GILT} />
      </mesh>
    </group>
  );
};

/** Sandstone floor, the prayer-hall block with its gilt dome, and two minarets — they rise out of the floor. */
export const MosqueSilhouetteSkyline3D: React.FC<{ f: number }> = ({ f }) => {
  const state = computeIslamicDocumentaryState(f);
  const sand = useSurfaceGrain(11, 0.2, 6);
  const glow = state.dawn;
  const rise = -(1 - state.domeReveal) * 1.9; // 1.9 > finial top (1.69), so nothing pokes out before the rise

  return (
    <group>
      {/* Sandstone court (opaque, so the rising pieces come out of it) */}
      <mesh position={[0, -1.5, 0]} receiveShadow>
        <boxGeometry args={[30, 3, 30]} />
        <meshPhysicalMaterial color="#b9a476" {...SANDSTONE} roughnessMap={sand} bumpMap={sand} bumpScale={0.6} />
      </mesh>

      {/* Prayer hall: drum and gilt dome */}
      <group position={[0, rise, 0.75]}>
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[1.7, 0.6, 0.9]} radius={0.03} />
          <meshPhysicalMaterial color={C.desertSand} {...SANDSTONE} />
        </mesh>
        <mesh position={[0, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.52, 0.56, 0.24, 32]} />
          <meshPhysicalMaterial color="#d8c393" {...SANDSTONE} />
        </mesh>
        <mesh position={[0, 0.84, 0]} scale={[1, 1.18, 1]} castShadow>
          <sphereGeometry args={[0.55, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color={C.royalGold} {...GILT} emissive={C.royalGold} emissiveIntensity={glow * 0.25} />
        </mesh>
        <mesh position={[0, 1.58, 0]} castShadow>
          <coneGeometry args={[0.05, 0.22, 12]} />
          <meshPhysicalMaterial color={C.royalGold} {...GILT} />
        </mesh>
        {/* Arched windows on the hall front */}
        {[-0.55, -0.18, 0.18, 0.55].map((x) => (
          <mesh key={x} position={[x, 0.3, 0.452]}>
            <planeGeometry args={[0.16, 0.3]} />
            <meshPhysicalMaterial {...SANDSTONE} color="#3a2a12" emissive="#ffb347" emissiveIntensity={0.25 + glow * 1.2} />
          </mesh>
        ))}
        {/* Carved inscription band on the hall: the AUDIRA mark inside the world */}
        <SceneText font="sans" position={[0, 0.54, 0.452]} fontSize={0.06} color={C.royalGold} anchorX="center" anchorY="middle" letterSpacing={0.3}>
          AUDIRA · BAITUL HIKMAH
        </SceneText>
      </group>

      <Minaret x={-1.45} reveal={state.minaretReveal} />
      <Minaret x={1.45} reveal={state.minaretReveal} />
    </group>
  );
};
