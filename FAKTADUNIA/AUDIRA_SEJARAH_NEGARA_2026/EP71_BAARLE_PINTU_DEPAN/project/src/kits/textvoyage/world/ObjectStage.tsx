// TEXTVOYAGE stage — a corridor of titanium monolith gates the camera flies through, toward giant
// block-type words that grow as the camera approaches. Gates recycle along z, so the flight never
// runs out of architecture (the earlier single gate passed the camera at ~2.7 s and left the frame empty).

import React, { useMemo } from "react";
import * as THREE from "three";
import { TEXTVOYAGE_PALETTE } from "../lib/palette";
import { MonolithType } from "./MonolithType";
import { RoundedBoxGeo, useSurfaceGrain } from "../../../core/polish/Polish";

const GATE_COUNT = 9;
const GATE_SPACING = 4.5;
const NEAR_Z = 5; // gates past this z wrap to the far end
const SPAN = GATE_COUNT * GATE_SPACING + 8;
const SPEED = 0.06; // world units per 60 fps film frame

const wrapZ = (z: number) => ((((z - NEAR_Z) % SPAN) + SPAN) % SPAN) + NEAR_Z - SPAN;

/** Far backdrop: navy void with a soft gold halo behind the words (keeps the sky off pure black). */
const Backdrop: React.FC<{ y: number; z: number }> = ({ y, z }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d")!;
    // Wider atmospheric bloom: stop at 0.55 (not 0.3) so the glow fills most of the BG
    const grad = g.createRadialGradient(256, 256, 8, 256, 256, 256);
    grad.addColorStop(0, "#504020");
    grad.addColorStop(0.55, "#2a2416");
    grad.addColorStop(1, "#14161c");
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 512);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={[0, y, z]}>
      <planeGeometry args={[60, 60]} />
      <meshBasicMaterial map={tex} fog={false} toneMapped={false} />
    </mesh>
  );
};

const Gate: React.FC<{ z: number; grain: THREE.Texture }> = ({ z, grain }) => {
  const goldGrain = useSurfaceGrain(281, 0.18, 3);
  return (
    <group position={[0, 0, z]}>
      <mesh position={[-1.7, 0.2, 0]} castShadow>
        <RoundedBoxGeo args={[0.7, 4.2, 0.7]} />
        <meshPhysicalMaterial color={TEXTVOYAGE_PALETTE.monolithTitanium} metalness={0.85} roughness={0.38} roughnessMap={grain} clearcoat={0.3} clearcoatRoughness={0.15} />
      </mesh>
      <mesh position={[1.7, 0.2, 0]} castShadow>
        <RoundedBoxGeo args={[0.7, 4.2, 0.7]} />
        <meshPhysicalMaterial color={TEXTVOYAGE_PALETTE.monolithTitanium} metalness={0.85} roughness={0.38} roughnessMap={grain} clearcoat={0.3} clearcoatRoughness={0.15} />
      </mesh>
      {/* Brushed-gold lintel: lower emissive to avoid plastic glow, add grain */}
      <mesh position={[0, 2.45, 0]} castShadow>
        <RoundedBoxGeo args={[4.1, 0.4, 0.7]} />
        <meshPhysicalMaterial
          color="#C49A28"
          emissive="#C49A28"
          emissiveIntensity={0.05}
          metalness={0.9}
          roughness={0.26}
          roughnessMap={goldGrain}
          clearcoat={0.15}
          clearcoatRoughness={0.3}
        />
      </mesh>
    </group>
  );
};

export const MonolithGateway: React.FC<{ f: number; words?: [string, string]; words2?: [string, string] }> = ({
  f,
  words = ["BEYOND", "HORIZON"],
  words2 = ["OPEN", "DOORS"],
}) => {
  const grain = useSurfaceGrain(28, 0.14, 6);
  const titanium = useSurfaceGrain(29, 0.3, 2);
  const shift = f * SPEED;
  // Words approach more slowly than the gates (0.3 instead of 0.35 to prevent HORIZON edge-touching).
  const wordZ = -18 + shift * 0.3;
  // Payoff crossfade at 5–6 s: BEYOND/HORIZON → OPEN/DOORS at the same z. One clear reveal, no depth overlap.
  const crossfade = Math.min(1, Math.max(0, (f - 310) / 24));
  const pairAlpha = 1 - crossfade;
  const revealAlpha = crossfade;

  return (
    <group>
      <Backdrop y={4.3} z={wordZ - 26} />
      {/* Polished floor that reflects the gates */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, -15]} receiveShadow>
        <planeGeometry args={[14, 60]} />
        <meshPhysicalMaterial color={TEXTVOYAGE_PALETTE.horizonMist} metalness={0.6} roughness={0.35} roughnessMap={grain} clearcoat={0.2} clearcoatRoughness={0.2} />
      </mesh>

      {/* The corridor recedes under the floating words to the vanishing point (lintels stay below the type) */}
      {Array.from({ length: GATE_COUNT }, (_, i) => wrapZ(-3 - i * GATE_SPACING + shift)).map((z, i) => (
        <Gate key={i} z={z} grain={titanium} />
      ))}

      {/* Primary word pair — fades out at 5–6 s.
          cell 0.14: words fill ~40 % frame width at payoff (jury r3: 25 % with 0.105). */}
      <MonolithType
        text={words[0]}
        cell={0.14}
        depth={0.8}
        color={TEXTVOYAGE_PALETTE.volumetricLight}
        emissive={TEXTVOYAGE_PALETTE.volumetricLight}
        emissiveIntensity={0.1}
        metalness={0.95}
        roughness={0.55}
        opacity={pairAlpha}
        position={[0, 5.5, wordZ]}
      />
      <MonolithType
        text={words[1]}
        cell={0.14}
        depth={0.8}
        color="#C49A28"
        emissive="#C49A28"
        emissiveIntensity={0.1}
        metalness={0.95}
        roughness={0.55}
        opacity={pairAlpha}
        position={[0, 4.1, wordZ]}
      />
      {/* Reveal word pair at the same z — fades in at 5–6 s (the payoff) */}
      <MonolithType
        text={words2[0]}
        cell={0.14}
        depth={0.8}
        color={TEXTVOYAGE_PALETTE.volumetricLight}
        emissive={TEXTVOYAGE_PALETTE.volumetricLight}
        emissiveIntensity={0.1}
        metalness={0.95}
        roughness={0.55}
        opacity={revealAlpha}
        position={[0, 5.5, wordZ]}
      />
      <MonolithType
        text={words2[1]}
        cell={0.14}
        depth={0.8}
        color="#C49A28"
        emissive="#C49A28"
        emissiveIntensity={0.1}
        metalness={0.95}
        roughness={0.55}
        opacity={revealAlpha}
        position={[0, 4.1, wordZ]}
      />
    </group>
  );
};
