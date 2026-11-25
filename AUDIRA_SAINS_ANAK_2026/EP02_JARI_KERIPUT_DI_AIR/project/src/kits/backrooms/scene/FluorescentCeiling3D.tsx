import React from "react";
import { SceneText } from "../../../core/polish/Drei.tsx";
import { computeBackroomsState, TUBES_Z } from "../core/motion";
import { BACKROOMS_PALETTE as C } from "../lib/palette";
import { RoundedBoxGeo } from "../../../core/polish/Polish.tsx";
import { PLASTIC } from "../lib/materials";

/** Four fluorescent troffers (each with its own light) and the red EXIT sign over the far doorway. */
export const FluorescentCeiling3D: React.FC<{ f: number }> = ({ f }) => {
  const state = computeBackroomsState(f);
  const exitGlow = 1.2 + state.blackout * 2.2;

  return (
    <group>
      {TUBES_Z.map((z, i) => {
        const k = state.tubes[i];
        return (
          <group key={i} position={[0, 2.66, z]}>
            {/* housing */}
            <mesh position={[0, 0.02, 0]}>
              <RoundedBoxGeo args={[1.0, 0.04, 0.55]} radius={0.01} />
              <meshPhysicalMaterial color="#B9B39A" {...PLASTIC} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.9, 0.45]} />
              <meshPhysicalMaterial {...PLASTIC} color={k > 0.05 ? C.fluorescentWhite : "#6d6a5c"} emissive={C.fluorescentWhite} emissiveIntensity={k * 1.6} />
            </mesh>
            <pointLight position={[0, -0.25, 0]} color={C.fluorescentWhite} intensity={k * 2.4} distance={6} decay={1.4} />
          </group>
        );
      })}

      {/* EXIT sign above the far doorway: the one light that never goes out */}
      <group position={[0, 2.25, -5.3]}>
        <mesh>
          <RoundedBoxGeo args={[0.62, 0.24, 0.06]} radius={0.015} />
          <meshPhysicalMaterial {...PLASTIC} color="#1a0606" emissive={C.alarmRed} emissiveIntensity={0.35} />
        </mesh>
        <SceneText font="sans" position={[0, 0, 0.035]} fontSize={0.15} color="#ffd6d6" anchorX="center" anchorY="middle" letterSpacing={0.12}>
          EXIT
        </SceneText>
        <pointLight position={[0, -0.2, 0.4]} color={C.alarmRed} intensity={exitGlow} distance={4.5} decay={1.5} />
      </group>
    </group>
  );
};
