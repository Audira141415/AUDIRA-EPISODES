import React from "react";
import * as THREE from "three";
import { RoundedBoxGeo, POLISH, lifeMotion } from "../../core/polish/Polish.tsx";

/**
 * BlockAvatar — blocky R6-style game avatar shared by all 5 episodes of AUDIRA_ROBLOX_MAP_BARU_2026.
 * Proportions in "studs" (1 unit = 1 stud): head 1.2, torso 2×2×1, arms and legs 1×2×1, total height ≈ 5.3.
 * Origin = between the feet on the ground. Use `scale` to size it in your scene.
 * Classic default colours (yellow skin, blue torso, green legs); override any of them with `colors`.
 * Poses are driven by frame `f` (60 fps base) so they animate in the film; on a still, pick a frame that reads.
 */
export type AvatarPose = "stand" | "wave" | "run" | "jump" | "cheer" | "point" | "think" | "type" | "sit";

export type AvatarColors = { skin: string; torso: string; legs: string; face: string };
export const CLASSIC: AvatarColors = { skin: "#f5cd30", torso: "#0d69ac", legs: "#a4bd47", face: "#1b1b1f" };

type Rot = [number, number, number];
type PoseState = { lArm: Rot; rArm: Rot; lLeg: Rot; rLeg: Rot; head: Rot; torso: Rot; lift: number };

const D = Math.PI / 180;

export function avatarPose(name: AvatarPose, f: number, seed = 1): PoseState {
  const t = f / 60 + seed * 0.37;
  const z: Rot = [0, 0, 0];
  const base: PoseState = { lArm: z, rArm: z, lLeg: z, rLeg: z, head: z, torso: z, lift: 0 };
  switch (name) {
    case "stand": {
      const s = Math.sin(t * 1.6) * 3 * D;
      return { ...base, lArm: [s, 0, -4 * D], rArm: [-s, 0, 4 * D], head: [0, Math.sin(t * 0.7) * 8 * D, 0] };
    }
    case "wave": {
      const w = Math.sin(t * 9) * 22 * D;
      return { ...base, rArm: [0, 0, 150 * D + w], lArm: [0, 0, -6 * D], head: [0, 0, 6 * D] };
    }
    case "run": {
      const s = Math.sin(t * 10);
      return {
        ...base,
        lArm: [s * 60 * D, 0, 0], rArm: [-s * 60 * D, 0, 0],
        lLeg: [-s * 55 * D, 0, 0], rLeg: [s * 55 * D, 0, 0],
        torso: [-8 * D, 0, 0], lift: Math.abs(Math.cos(t * 10)) * 0.35,
      };
    }
    case "jump": {
      const h = Math.max(0, Math.sin(t * 3.2));
      return {
        ...base,
        lArm: [0, 0, -160 * D], rArm: [0, 0, 160 * D],
        lLeg: [25 * D, 0, 0], rLeg: [-15 * D, 0, 0], lift: 1.2 + h * 1.4,
      };
    }
    case "cheer": {
      const b = Math.sin(t * 8) * 12 * D;
      return { ...base, lArm: [0, 0, -165 * D + b], rArm: [0, 0, 165 * D - b], lift: Math.abs(Math.sin(t * 4)) * 0.4 };
    }
    case "point":
      return { ...base, rArm: [-90 * D, 0, 10 * D], lArm: [0, 0, -6 * D], head: [0, -10 * D, 0] };
    case "think":
      return { ...base, rArm: [-140 * D, 0, -30 * D], lArm: [-40 * D, 0, 20 * D], head: [6 * D, 0, 10 * D] };
    case "type": {
      const k = Math.sin(t * 14) * 6 * D;
      return { ...base, lArm: [-75 * D + k, 0, 12 * D], rArm: [-75 * D - k, 0, -12 * D], head: [12 * D, 0, 0] };
    }
    case "sit":
      return { ...base, lLeg: [-90 * D, 0, 0], rLeg: [-90 * D, 0, 0], lArm: [-30 * D, 0, 0], rArm: [-30 * D, 0, 0], lift: -1 };
  }
}

const Limb: React.FC<{ pos: [number, number, number]; rot: Rot; color: string; grain?: THREE.Texture; top?: number }> = ({ pos, rot, color, grain, top = 0 }) => (
  // Pivot `top` studs below the limb top (arms: 0.5, inside the shoulder; legs: 0, at the hip). Limb is 2 studs long.
  <group position={pos} rotation={rot}>
    <mesh position={[0, top - 1, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[0.98, 2, 0.98]} radius={0.1} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color={color} roughnessMap={grain} />
    </mesh>
  </group>
);

export const BlockAvatar: React.FC<{
  f: number;
  pose?: AvatarPose;
  seed?: number;
  colors?: Partial<AvatarColors>;
  /** Optional emissive accent on the torso (e.g. for neon kits). */
  torsoEmissive?: string;
  grain?: THREE.Texture;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  /** Extra element held in the right hand (rendered at the hand position). */
  rightHand?: React.ReactNode;
}> = ({ f, pose = "stand", seed = 1, colors, torsoEmissive, grain, position, rotation, scale = 1, rightHand }) => {
  const c = { ...CLASSIC, ...colors };
  const p = avatarPose(pose, f, seed);
  const life = lifeMotion(f, seed);
  const eyeY = life.blink;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[0, 4 + p.lift, 0]} rotation={p.torso}>
        {/* torso: centre at y=-1 relative to shoulder line (shoulder line at y=4 world) */}
        <mesh position={[0, -1, 0]} castShadow receiveShadow scale={life.squash}>
          <RoundedBoxGeo args={[2, 2, 1]} radius={0.1} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color={c.torso} roughnessMap={grain} emissive={torsoEmissive ?? "#000"} emissiveIntensity={torsoEmissive ? 0.25 : 0} />
        </mesh>
        {/* head */}
        <group position={[0, 0.05, 0]} rotation={p.head}>
          <mesh position={[0, 0.62, 0]} castShadow>
            <RoundedBoxGeo args={[1.2, 1.2, 1.2]} radius={0.38} segments={6} />
            <meshPhysicalMaterial {...POLISH.toySkin} color={c.skin} roughnessMap={grain} />
          </mesh>
          {/* face: two eyes + smile on the +z face */}
          {[-0.22, 0.22].map((x) => (
            <mesh key={x} position={[x, 0.74, 0.605]} scale={[0.09, 0.15 * eyeY, 0.03]}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshPhysicalMaterial {...POLISH.glossyEye} color={c.face} />
            </mesh>
          ))}
          <mesh position={[0, 0.5, 0.6]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.24, 0.035, 8, 24, Math.PI * 0.8]} />
            <meshStandardMaterial color={c.face} roughness={0.5} />
          </mesh>
        </group>
        {/* arms (pivot 0.5 below the shoulder line, inside the arm, like the real R6 joint) */}
        <Limb pos={[-1.5, -0.5, 0]} rot={p.lArm} color={c.skin} grain={grain} top={0.5} />
        <group position={[1.5, -0.5, 0]} rotation={p.rArm}>
          <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
            <RoundedBoxGeo args={[0.98, 2, 0.98]} radius={0.1} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color={c.skin} roughnessMap={grain} />
          </mesh>
          {rightHand ? <group position={[0, -1.6, 0]}>{rightHand}</group> : null}
        </group>
        {/* legs (pivot at hip, y=-2 relative to shoulder) */}
        <Limb pos={[-0.5, -2, 0]} rot={p.lLeg} color={c.legs} grain={grain} />
        <Limb pos={[0.5, -2, 0]} rot={p.rLeg} color={c.legs} grain={grain} />
      </group>
    </group>
  );
};
