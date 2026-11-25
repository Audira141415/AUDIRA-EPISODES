import React, { useMemo } from "react";
import * as THREE from "three";
import { computeFluidforgeState } from "../core/motion";
import { FLUIDFORGE_PALETTE } from "../lib/palette";

export const CausticRingArena3D: React.FC<{ f: number }> = ({ f }) => {
  const state = computeFluidforgeState(f);
  const glow = 1 + state.shock * 1.6;
  // Shrink rings at the payoff so they don't cross the title/caption safe area.
  const ringScale = 1 - state.coalesce * 0.22;
  const backdrop = useMemo(() => makeBackdropTexture(), []);
  return (
    <group>
      {/* Backdrop: deep violet-blue glow behind the core so the void has depth, not crushed black */}
      <mesh position={[0, 0, -9]}>
        <planeGeometry args={[34, 34]} />
        <meshBasicMaterial map={backdrop} depthWrite={false} />
      </mesh>
      {/* Outer iridescent torus rings: HDR emissive so only they and the droplets bloom.
          Group scaled down at the payoff (coalesce → 1) so the outer ring clears the HUD. */}
      <group scale={ringScale}>
      <mesh rotation={[0.6 + state.ringTilt, state.orbitAngle * 0.5, 0]}>
        <torusGeometry args={[1.85, 0.035, 24, 160]} />
        <meshStandardMaterial
          color={FLUIDFORGE_PALETTE.cyanIridescent}
          emissive={FLUIDFORGE_PALETTE.cyanIridescent}
          emissiveIntensity={0.9 * glow}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <mesh rotation={[-0.5 - state.ringTilt, -state.orbitAngle * 0.4, 0.4]}>
        <torusGeometry args={[2.25, 0.025, 24, 160]} />
        <meshStandardMaterial
          color={FLUIDFORGE_PALETTE.magentaReflect}
          emissive={FLUIDFORGE_PALETTE.magentaReflect}
          emissiveIntensity={0.8 * glow}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Thin violet inner ring (the cover's third orbit) */}
      <mesh rotation={[Math.PI / 2 + state.ringTilt * 0.5, 0, state.orbitAngle * 0.3]}>
        <torusGeometry args={[1.45, 0.018, 16, 160]} />
        <meshStandardMaterial
          color={FLUIDFORGE_PALETTE.violetDeep}
          emissive={FLUIDFORGE_PALETTE.violetDeep}
          emissiveIntensity={1.1 * glow}
          metalness={0.8}
          roughness={0.15}
        />
      </mesh>
      </group>
      {/* Gold caustic halo: a flat ring behind the core that brightens at the merge (zero-g: no floor) */}
      <mesh position={[0, 0, -1.2]}>
        <ringGeometry args={[1.3 + state.coalesce * 0.35, 1.34 + state.coalesce * 0.37, 160]} />
        <meshBasicMaterial color={FLUIDFORGE_PALETTE.causticGold} transparent opacity={0.08 + state.shock * 0.3} depthWrite={false} />
      </mesh>
    </group>
  );
};


/** Radial gradient (violet core → navy → void), drawn once; deterministic. */
function makeBackdropTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  grad.addColorStop(0, "#24195A");
  grad.addColorStop(0.4, "#151A3C");
  grad.addColorStop(0.75, "#0F1328");
  grad.addColorStop(1, "#0F1328");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
