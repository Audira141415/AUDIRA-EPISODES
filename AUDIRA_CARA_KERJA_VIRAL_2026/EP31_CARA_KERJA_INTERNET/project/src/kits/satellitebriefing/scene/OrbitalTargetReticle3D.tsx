import React, { useMemo } from "react";
import * as THREE from "three";
import { computeSatelliteBriefingState } from "../core/motion";
import { SATELLITEBRIEFING_PALETTE as C } from "../lib/palette";
import { SceneText } from "../../../core/polish/Drei";

type V3 = [number, number, number];

/** Targets sit on the plateau tops (main block top y 0.766, second block top y 0.466). */
export const TARGETS: { name: string; pos: V3; lockAt: number }[] = [
  { name: "TARGET ALPHA", pos: [-0.45, 0.77, -0.15], lockAt: 1.5 },
  { name: "BRAVO", pos: [0.85, 0.47, 0.45], lockAt: 3.5 },
  { name: "CHARLIE", pos: [-1.6, 0.77, 0.15], lockAt: 5.5 },
];

const Label: React.FC<{ text: string; pos: V3; amber: boolean; left?: boolean }> = ({ text, pos, amber, left }) => {
  const w = 0.16 + text.length * 0.12;
  return (
    <group position={[pos[0] + (left ? -1 : 1) * (0.14 + w / 2), pos[1] + (left ? 0.95 : 0.7), pos[2]]}>
      <mesh>
        <planeGeometry args={[w, 0.32]} />
        <meshBasicMaterial color="#0A0E12" transparent opacity={0.9} />
      </mesh>
      <SceneText font="sans" fontSize={0.19} letterSpacing={0.06} color={amber ? C.readingAmber : C.vectorWhite} anchorX="center" anchorY="middle" position={[0, 0, 0.005]}>
        {text}
      </SceneText>
    </group>
  );
};

/** Dashed ground vector between two targets, drawn in over `p` (0..1). */
const Vector: React.FC<{ a: V3; b: V3; color: string; p: number }> = ({ a, b, color, p }) => {
  const geo = useMemo(() => {
    const end = new THREE.Vector3(...a).lerp(new THREE.Vector3(...b), Math.max(0.001, p));
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), end]);
    return g;
  }, [a, b, p]);
  const line = useMemo(() => {
    const l = new THREE.Line(geo, new THREE.LineDashedMaterial({ color, dashSize: 0.08, gapSize: 0.06 }));
    l.computeLineDistances();
    return l;
  }, [geo, color]);
  return <primitive object={line} />;
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const OrbitalTargetReticle3D: React.FC<{ f: number }> = ({ f }) => {
  const state = computeSatelliteBriefingState(f);
  const t = f / 60;
  const lifted = (p: V3): V3 => [p[0], p[1] + 0.02, p[2]];

  return (
    <group>
      {TARGETS.map(({ name, pos, lockAt }, idx) => {
        const on = clamp01((t - lockAt) / 0.4);
        const s = (1.6 - 0.6 * on) * state.reticlePulse;
        return (
          <group key={idx}>
            <group position={pos}>
              <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]} scale={[s, s, 1]} position={[0, 0.01, 0]}>
                <ringGeometry args={[0.26, 0.31, 4]} />
                <meshBasicMaterial color={C.readingAmber} transparent opacity={0.25 + 0.75 * on} />
              </mesh>
              <mesh position={[0, 0.35, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.7, 8]} />
                <meshBasicMaterial color={C.vectorWhite} />
              </mesh>
              <mesh position={[0, 0.72, 0]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshBasicMaterial color={C.vectorWhite} />
              </mesh>
            </group>
            {/* always mounted (SceneText syncs once in a worker); hidden until the lock. CHARLIE label
                to the RIGHT of its reticle (left=false): placing it left at world x≈-2.24 caused left-edge crop. */}
            <group visible={on > 0.01}>
              <Label text={name} pos={pos} amber={idx === 0} left={false} />
            </group>
          </group>
        );
      })}
      <Vector a={lifted(TARGETS[0].pos)} b={lifted(TARGETS[1].pos)} color={C.readingAmber} p={clamp01((t - 3.5) / 1.2)} />
      <Vector a={lifted(TARGETS[0].pos)} b={lifted(TARGETS[2].pos)} color={C.claimBlue} p={clamp01((t - 5.5) / 1.2)} />
    </group>
  );
};
