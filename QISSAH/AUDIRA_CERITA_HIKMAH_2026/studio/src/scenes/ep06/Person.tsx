// Storybook watercolour puppet (Budi, Jessica). Local frame: +Z is the front, origin at the feet.
// Soft rounded forms in flat washes, a graphite hull around the head, a face driven by the pose
// (mouth from word times, blinks, brows, tears).
import React from "react";
import * as THREE from "three";
import { hull, paint } from "./paint";
import type { V3 } from "./layout";

export type Look = {
  kind: "man" | "girl";
  skin: string;
  cheek: string;
  hair: string;
  top: string;
  bottom: string;
  shoes: string;
  accent: string;
};

export type Arm = [number, number, number]; // forward raise, outward roll, elbow bend
export type Pose = {
  pos: V3;
  yaw: number;
  hipY?: number; // pelvis height, unscaled
  thigh?: number; // 0 straight down, PI/2 forward (seated)
  knee?: number; // shin bend backward
  lean?: number; // spine pitch forward
  headYaw?: number;
  headPitch?: number;
  headTilt?: number;
  armR?: Arm;
  armL?: Arm;
  mouth?: number;
  blink?: number;
  brow?: number; // -1 sad (inner corners up) .. +1 surprised/raised .. negative values also frown with `frown`
  frown?: number;
  tear?: number; // 0..1 tear running down
  shine?: number; // wet eyes
};

type Dim = { thigh: number; shin: number; hipW: number; hipY: number; torso: number; shW: number; upper: number; fore: number; head: number; limb: number };
const DIM: Record<Look["kind"], Dim> = {
  man: { thigh: 0.45, shin: 0.43, hipW: 0.1, hipY: 0.9, torso: 0.6, shW: 0.21, upper: 0.3, fore: 0.28, head: 0.125, limb: 0.055 },
  girl: { thigh: 0.22, shin: 0.21, hipW: 0.06, hipY: 0.45, torso: 0.36, shW: 0.12, upper: 0.17, fore: 0.15, head: 0.135, limb: 0.035 },
};

export const BUDI: Look = { kind: "man", skin: "#EFCDB4", cheek: "#D99A88", hair: "#3B302B", top: "#8EA3B5", bottom: "#4A5260", shoes: "#3A3330", accent: "#5D6B78" };
export const JESSICA: Look = { kind: "girl", skin: "#F6D9C4", cheek: "#E9877C", hair: "#7A4B33", top: "#F0B54A", bottom: "#F0B54A", shoes: "#C8564A", accent: "#D7837C" };

const capsule = (r: number, len: number) => new THREE.CapsuleGeometry(r, Math.max(0.001, len), 6, 12);
const G = {
  sphere: new THREE.SphereGeometry(1, 28, 20),
  cap: new THREE.SphereGeometry(1, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.56),
  disc: new THREE.CircleGeometry(1, 20),
};
const geoCache = new Map<string, THREE.BufferGeometry>();
const cap = (r: number, len: number) => {
  const k = `${r}|${len}`;
  let g = geoCache.get(k);
  if (!g) geoCache.set(k, (g = capsule(r, len)));
  return g;
};

const Limb: React.FC<{ r: number; len: number; color: string }> = ({ r, len, color }) => (
  <mesh geometry={cap(r, len - 2 * r)} material={paint(color)} position={[0, -len / 2, 0]} castShadow />
);

const ArmRig: React.FC<{ side: 1 | -1; d: Dim; arm: Arm; look: Look; item?: React.ReactNode }> = ({ side, d, arm, look, item }) => (
  <group position={[side * d.shW, d.torso - 0.06 * (d.torso / 0.6), 0]} rotation={[-arm[0], 0, side * arm[1]]}>
    <Limb r={d.limb} len={d.upper} color={look.kind === "girl" ? look.skin : look.top} />
    <group position={[0, -d.upper, 0]} rotation={[-arm[2], 0, 0]}>
      <Limb r={d.limb * 0.9} len={d.fore} color={look.kind === "girl" ? look.skin : look.top} />
      <mesh geometry={G.sphere} material={paint(look.skin)} position={[0, -d.fore, 0]} scale={d.limb * 1.25} castShadow />
      {item ? <group position={[0, -d.fore - d.limb, 0]}>{item}</group> : null}
    </group>
  </group>
);

const Face: React.FC<{ look: Look; r: number; p: Pose }> = ({ look, r, p }) => {
  const girl = look.kind === "girl";
  const eyeX = r * (girl ? 0.36 : 0.34);
  const eyeY = r * (girl ? 0.0 : 0.12);
  const blink = p.blink ?? 0;
  const brow = p.brow ?? 0;
  const mouth = p.mouth ?? 0;
  const z = r * 0.94;
  const tear = p.tear ?? 0;
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh geometry={G.sphere} material={paint("#2C2624")} position={[s * eyeX, eyeY, z * 0.97]} scale={[r * (girl ? 0.13 : 0.1), r * (girl ? 0.16 : 0.11) * Math.max(0.08, 1 - blink), r * 0.06]} />
          {girl || (p.shine ?? 0) > 0 ? (
            <mesh geometry={G.sphere} position={[s * eyeX + r * 0.04, eyeY + r * 0.05, z * 1.0]} scale={r * (0.035 + 0.03 * (p.shine ?? 0)) * Math.max(0, 1 - blink * 1.5)}>
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
          ) : null}
          <mesh
            geometry={G.sphere}
            material={paint(look.hair)}
            position={[s * eyeX, eyeY + r * (0.27 + 0.08 * Math.max(0, brow)), z * 0.93]}
            rotation={[0, 0, s * (0.35 * (p.frown ?? 0) - 0.35 * Math.max(0, -brow))]}
            scale={[r * 0.17, r * 0.035, r * 0.04]}
          />
          <mesh geometry={G.disc} position={[s * r * 0.55, -r * 0.24, z * 0.86]} rotation={[0, s * 0.55, 0]} scale={r * 0.2}>
            <meshBasicMaterial color={look.cheek} transparent opacity={girl ? 0.6 : 0.28} />
          </mesh>
        </group>
      ))}
      {tear > 0.01 && tear < 0.99 ? (
        <mesh geometry={G.sphere} position={[eyeX * 1.05, eyeY - r * 0.12 - tear * r * 0.55, z * 0.98]} scale={[r * 0.05, r * 0.075, r * 0.05]}>
          <meshBasicMaterial color="#cfe6f5" transparent opacity={0.85} toneMapped={false} />
        </mesh>
      ) : null}
      {/* nose */}
      <mesh geometry={G.sphere} material={paint(look.kind === "girl" ? "#EFC2A8" : "#E2B49B")} position={[0, -r * 0.1, z * 1.02]} scale={r * (girl ? 0.07 : 0.1)} />
      {/* mouth */}
      <mesh geometry={G.sphere} material={paint("#7A3B36")} position={[0, -r * (girl ? 0.36 : 0.42), z * 0.93]} scale={[r * (0.13 + 0.03 * mouth), r * (0.025 + 0.15 * mouth), r * 0.05]} />
    </group>
  );
};

export const Person: React.FC<{ look: Look; pose: Pose; scale?: number; torsoItem?: React.ReactNode; handR?: React.ReactNode; handL?: React.ReactNode; visible?: boolean }> = ({
  look,
  pose: p,
  scale = 1,
  torsoItem,
  handR,
  handL,
  visible = true,
}) => {
  const d = DIM[look.kind];
  const girl = look.kind === "girl";
  const hipY = p.hipY ?? d.hipY;
  const thigh = p.thigh ?? 0;
  const knee = p.knee ?? 0;
  const r = d.head;
  const neckY = d.torso + (girl ? 0.02 : 0.05);
  const headY = neckY + r * 0.95;
  return (
    <group position={p.pos} rotation={[0, p.yaw, 0]} scale={scale} visible={visible}>
      {/* legs */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * d.hipW, hipY, 0]} rotation={[-thigh, 0, 0]}>
          <Limb r={d.limb * 1.15} len={d.thigh} color={girl ? look.skin : look.bottom} />
          <group position={[0, -d.thigh, 0]} rotation={[knee, 0, 0]}>
            <Limb r={d.limb * 1.05} len={d.shin} color={girl ? look.skin : look.bottom} />
            <mesh geometry={G.sphere} material={paint(look.shoes)} position={[0, -d.shin, d.limb * 0.9]} scale={[d.limb * 1.3, d.limb * 0.8, d.limb * 2.2]} castShadow />
          </group>
        </group>
      ))}
      {/* spine */}
      <group position={[0, hipY, 0]} rotation={[p.lean ?? 0, 0, 0]}>
        {girl ? (
          <>
            {/* dress: flared skirt + bodice, with a white collar */}
            <mesh position={[0, d.torso * 0.32, 0]} material={paint(look.top)} castShadow>
              <cylinderGeometry args={[d.shW * 0.78, d.shW * 1.75, d.torso * 0.78, 24]} />
            </mesh>
            <mesh position={[0, d.torso * 0.02, 0]} material={paint("#E39A3B")}>
              <cylinderGeometry args={[d.shW * 1.76, d.shW * 1.78, 0.03, 24]} />
            </mesh>
            <mesh geometry={cap(d.shW * 0.82, d.torso * 0.25)} material={paint(look.top)} position={[0, d.torso * 0.78, 0]} castShadow />
            <mesh position={[0, d.torso * 0.98, 0.0]} rotation={[0.15, 0, 0]} material={paint("#FBF4EA")}>
              <cylinderGeometry args={[d.shW * 0.6, d.shW * 0.82, 0.04, 20]} />
            </mesh>
          </>
        ) : (
          <>
            <mesh geometry={cap(0.17, d.torso - 0.3)} material={paint(look.top)} position={[0, d.torso * 0.52, 0]} scale={[1.05, 1, 0.7]} castShadow />
            <mesh geometry={cap(0.165, 0.06)} material={paint(look.bottom)} position={[0, 0.02, 0]} scale={[1.02, 1, 0.72]} castShadow />
            {/* tie */}
            <mesh position={[0, d.torso * 0.66, 0.115]} rotation={[0.08, 0, 0]} material={paint("#3E4A63")}>
              <boxGeometry args={[0.045, 0.26, 0.012]} />
            </mesh>
          </>
        )}
        {/* neck */}
        <mesh geometry={cap(r * 0.32, 0.05)} material={paint(look.skin)} position={[0, neckY, 0]} />
        {/* head */}
        <group position={[0, headY, 0]} rotation={new THREE.Euler(p.headPitch ?? 0, p.headYaw ?? 0, p.headTilt ?? 0, "YXZ")}>
          <mesh geometry={G.sphere} material={paint(look.skin)} scale={[r, r * (girl ? 0.98 : 1.08), r * 0.98]} castShadow />
          <mesh geometry={G.sphere} material={hull()} scale={[r * 1.045, r * (girl ? 1.025 : 1.125), r * 1.025]} />
          {/* ears */}
          {[-1, 1].map((s) => (
            <mesh key={s} geometry={G.sphere} material={paint(look.skin)} position={[s * r * 0.97, -r * 0.05, 0]} scale={[r * 0.12, r * 0.2, r * 0.14]} />
          ))}
          <Face look={look} r={r} p={p} />
          {girl ? (
            <>
              <mesh geometry={G.cap} material={paint(look.hair)} scale={[r * 1.08, r * 1.12, r * 1.1]} rotation={[-0.42, 0, 0]} position={[0, r * 0.05, -r * 0.04]} castShadow />
              {/* fringe */}
              <mesh geometry={G.sphere} material={paint(look.hair)} position={[0, r * 0.62, r * 0.6]} scale={[r * 0.78, r * 0.26, r * 0.32]} />
              {[-1, 1].map((s) => (
                <group key={s} position={[s * r * 1.02, r * 0.1, -r * 0.2]}>
                  <mesh geometry={G.sphere} material={paint(look.hair)} position={[s * r * 0.25, -r * 0.35, 0]} scale={[r * 0.36, r * 0.55, r * 0.36]} castShadow />
                  <mesh geometry={G.sphere} material={paint(look.accent)} scale={[r * 0.14, r * 0.2, r * 0.26]} />
                </group>
              ))}
            </>
          ) : (
            <>
              <mesh geometry={G.cap} material={paint(look.hair)} scale={[r * 1.07, r * 1.1, r * 1.1]} rotation={[-0.62, 0, 0]} position={[0, r * 0.04, -r * 0.03]} castShadow />
              {/* glasses */}
              {[-1, 1].map((s) => (
                <mesh key={s} position={[s * r * 0.34, r * 0.12, r * 1.0]} material={paint("#2E2A28")}>
                  <torusGeometry args={[r * 0.24, r * 0.025, 6, 20]} />
                </mesh>
              ))}
              <mesh position={[0, r * 0.15, r * 1.02]} material={paint("#2E2A28")}>
                <boxGeometry args={[r * 0.2, r * 0.03, r * 0.03]} />
              </mesh>
            </>
          )}
        </group>
        <ArmRig side={1} d={d} arm={p.armR ?? [0, 0.08, 0.1]} look={look} item={handR} />
        <ArmRig side={-1} d={d} arm={p.armL ?? [0, 0.08, 0.1]} look={look} item={handL} />
        {torsoItem}
      </group>
    </group>
  );
};
