// EP08 felt puppets: needle-felted wool people for "Mata Cinta Kopi Asin".
// Built from FELTCRAFT <Fuzzy> parts (felt base + fuzz shells), with what makes a figure read as a
// person (core/polish/Person.tsx rules): a head with a face, shoulders wider than the waist, arms
// that bend at the elbow, skin a different colour from the clothes. Seated pose (for the café
// table) or standing. Faces +z, feet on y = 0. Puppets pose on twos (stepT) like stop-motion.

import React, { useMemo } from "react";
import * as THREE from "three";
import { Fuzzy, SPHERE } from "../../kits/feltcraft/scene/Fuzzy";
import { beadMaterial, feltMaterial, yarnMaterial } from "../../kits/feltcraft/lib/materials";
import { mulberry32 } from "../../kits/feltcraft/core/motion";

type V3 = [number, number, number];

export type PuppetLook = {
  skin: string;
  hair: string;
  top: string;
  topTrim: string;
  bottom: string;
  shoe: string;
  cheek: string;
  hairStyle: "short" | "long";
  flower?: string;
  glasses?: boolean;
};

/** Arm: yaw swings it sideways (+ toward the puppet's centre line for the left arm), lift raises it forward, elbow bends the forearm up. */
export type ArmPose = { yaw: number; lift: number; elbow: number; roll?: number };

export type PuppetPose = {
  seated: boolean;
  headYaw: number;
  headPitch: number;
  headRoll: number;
  armL: ArmPose; // puppet's own left (+x)
  armR: ArmPose; // puppet's own right (-x)
  /** 0..1 extra blush on the felt cheeks. */
  blush: number;
  /** 1 = open, 0 = closed. */
  eyes: number;
  mouth: "smile" | "small" | "flat" | "o";
  /** Brows: >0 worried (inner ends up). */
  worry: number;
  lean: number;
  /** Walk cycle phase in radians (standing only); undefined = legs still. */
  walk?: number;
  /** 0..1 tear beads on the cheeks. */
  tears?: number;
};

export const DEFAULT_POSE: PuppetPose = {
  seated: true,
  headYaw: 0,
  headPitch: 0,
  headRoll: 0,
  armL: { yaw: 0, lift: 0.2, elbow: 0.4 },
  armR: { yaw: 0, lift: 0.2, elbow: 0.4 },
  blush: 0,
  eyes: 1,
  mouth: "smile",
  worry: 0,
  lean: 0,
};

const THREAD = "#3A2418";
const UPPER = 0.2;
const FORE = 0.19;

/** Soft hair: a fuzzy felt base plus loops of wound yarn (curls) over the scalp, no hard cap line. */
const YarnHair: React.FC<{ color: string; seed: number }> = ({ color, seed }) => {
  const mat = useMemo(() => yarnMaterial(color), [color]);
  const curls = useMemo(() => {
    const r = mulberry32(seed);
    const out: { p: V3; rot: V3; s: number }[] = [];
    for (let i = 0; i < 46; i++) {
      // points on the upper/back scalp (avoid the face: z front only above the brow)
      const th = r() * Math.PI * 2;
      const ph = Math.acos(1 - r() * 1.15); // from the crown down
      const n = new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th));
      if (n.z > 0.35 && n.y < 0.55) continue;
      if (n.y < -0.1) continue;
      const p = n.clone().multiply(new THREE.Vector3(0.178, 0.188, 0.17)).add(new THREE.Vector3(0, 0.035, -0.012));
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
      const e = new THREE.Euler().setFromQuaternion(q);
      out.push({ p: [p.x, p.y, p.z], rot: [e.x, e.y, e.z + r() * 3], s: 0.8 + r() * 0.5 });
    }
    return out;
  }, [seed]);
  return (
    <group>
      <Fuzzy geometry={SPHERE} color={color} position={[0, 0.045, -0.02]} scale={[0.172, 0.16, 0.162]} shells={3} spacing={0.05} />
      {curls.map((c, i) => (
        <mesh key={i} material={mat} position={c.p} rotation={c.rot} scale={c.s} castShadow>
          <torusGeometry args={[0.022, 0.0105, 6, 14]} />
        </mesh>
      ))}
    </group>
  );
};

const Arm: React.FC<{ side: 1 | -1; a: ArmPose; look: PuppetLook; hand?: React.ReactNode }> = ({ side, a, look, hand }) => (
  <group position={[side * 0.215, 0.99, 0.0]} rotation={[0, side * -a.yaw, 0]}>
    <group rotation={[-a.lift, 0, side * (0.12 + (a.roll ?? 0))]}>
      <Fuzzy geometry={SPHERE} color={look.top} position={[0, -UPPER / 2, 0]} scale={[0.058, UPPER / 2 + 0.03, 0.058]} shells={2} spacing={0.05} />
      <group position={[0, -UPPER, 0]} rotation={[-a.elbow, 0, 0]}>
        <Fuzzy geometry={SPHERE} color={look.top} position={[0, -FORE / 2, 0]} scale={[0.05, FORE / 2 + 0.025, 0.05]} shells={2} spacing={0.05} />
        {/* cuff stitch */}
        <mesh position={[0, -FORE + 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.05, 0.007, 6, 18]} />
          <meshStandardMaterial color={look.topTrim} roughness={1} />
        </mesh>
        <group position={[0, -FORE - 0.035, 0]}>
          <Fuzzy geometry={SPHERE} color={look.skin} scale={[0.047, 0.055, 0.04]} shells={1} spacing={0.05} />
          {hand}
        </group>
      </group>
    </group>
  </group>
);

export const FeltPuppet: React.FC<{
  look: PuppetLook;
  pose: PuppetPose;
  position?: V3;
  rotationY?: number;
  scale?: number;
  handL?: React.ReactNode;
  handR?: React.ReactNode;
}> = ({ look, pose, position = [0, 0, 0], rotationY = 0, scale = 1, handL, handR }) => {
  const bead = useMemo(beadMaterial, []);
  const cheekMat = useMemo(() => feltMaterial(look.cheek, 1), [look.cheek]);
  const threadMat = useMemo(() => new THREE.MeshStandardMaterial({ color: THREAD, roughness: 1 }), []);
  const seat = pose.seated;
  const hipY = seat ? 0.5 : 0.62;
  const lift = seat ? 0 : 0.12;
  const blush = 1 + pose.blush * 0.6;

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* legs */}
      {[-1, 1].map((s) =>
        seat ? (
          <group key={s}>
            <Fuzzy geometry={SPHERE} color={look.bottom} position={[s * 0.09, 0.5, 0.13]} scale={[0.082, 0.075, 0.2]} shells={2} spacing={0.05} />
            <Fuzzy geometry={SPHERE} color={look.bottom} position={[s * 0.09, 0.28, 0.3]} scale={[0.066, 0.21, 0.066]} shells={2} spacing={0.05} />
            <Fuzzy geometry={SPHERE} color={look.shoe} position={[s * 0.09, 0.05, 0.35]} scale={[0.07, 0.05, 0.11]} shells={1} spacing={0.05} />
          </group>
        ) : (
          <group key={s} position={[s * 0.09, 0.68, 0]} rotation={[pose.walk === undefined ? 0 : Math.sin(pose.walk) * 0.38 * s, 0, 0]}>
            <Fuzzy geometry={SPHERE} color={look.bottom} position={[0, -0.32, 0]} scale={[0.07, 0.33, 0.07]} shells={2} spacing={0.05} />
            <Fuzzy geometry={SPHERE} color={look.shoe} position={[0, -0.63, 0.04]} scale={[0.07, 0.05, 0.11]} shells={1} spacing={0.05} />
          </group>
        ),
      )}
      <group position={[0, lift, 0]} rotation={[pose.lean, 0, 0]}>
        {/* torso: waist narrower than shoulders */}
        <Fuzzy geometry={SPHERE} color={look.bottom} position={[0, hipY + 0.03, 0]} scale={[0.17, 0.09, 0.15]} shells={2} spacing={0.04} />
        <Fuzzy geometry={SPHERE} color={look.top} position={[0, 0.78, 0]} scale={[0.18, 0.24, 0.155]} spacing={0.035} />
        <Fuzzy geometry={SPHERE} color={look.top} position={[0, 0.93, 0]} scale={[0.25, 0.12, 0.165]} spacing={0.035} />
        {/* collar trim: running stitch */}
        <mesh position={[0, 1.03, 0.0]} rotation={[Math.PI / 2 - 0.15, 0, 0]}>
          <torusGeometry args={[0.085, 0.016, 8, 26]} />
          <meshPhysicalMaterial color={look.topTrim} roughness={1} sheen={1} />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => {
          const y = 0.62 + i * 0.05;
          return (
            <mesh key={i} position={[0, y, 0.158 - Math.abs(y - 0.8) * 0.12]} rotation={[0, 0, 0]}>
              <capsuleGeometry args={[0.006, 0.022, 3, 6]} />
              <meshStandardMaterial color={look.topTrim} roughness={1} />
            </mesh>
          );
        })}
        <Arm side={1} a={pose.armL} look={look} hand={handL} />
        <Arm side={-1} a={pose.armR} look={look} hand={handR} />
        {/* neck + head */}
        <Fuzzy geometry={SPHERE} color={look.skin} position={[0, 1.07, 0]} scale={[0.055, 0.06, 0.055]} shells={1} spacing={0.05} />
        <group position={[0, 1.24, 0.01]} rotation={[pose.headPitch, pose.headYaw, pose.headRoll]}>
          <Fuzzy geometry={SPHERE} color={look.skin} scale={[0.17, 0.18, 0.165]} spacing={0.03} />
          {/* ears */}
          {[-1, 1].map((s) => (
            <Fuzzy key={`ear${s}`} geometry={SPHERE} color={look.skin} position={[s * 0.165, -0.01, 0]} scale={[0.03, 0.045, 0.03]} shells={1} spacing={0.05} />
          ))}
          {/* hair cap */}
          {look.hairStyle === "short" ? (
            <YarnHair color={look.hair} seed={11} />
          ) : (
            <>
              <Fuzzy geometry={SPHERE} color={look.hair} position={[0, 0.06, -0.025]} scale={[0.182, 0.155, 0.168]} spacing={0.035} />
              <Fuzzy geometry={SPHERE} color={look.hair} position={[0.03, 0.12, 0.09]} rotation={[0.3, 0, -0.5]} scale={[0.12, 0.05, 0.08]} shells={2} spacing={0.05} />
            </>
          )}
          {look.glasses && (
            <group position={[0, 0.0, 0.165]}>
              {[-1, 1].map((g) => (
                <mesh key={g} position={[g * 0.062, 0, 0]}>
                  <torusGeometry args={[0.036, 0.0045, 6, 20]} />
                  <meshPhysicalMaterial color="#3A2A1E" roughness={0.4} />
                </mesh>
              ))}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.004, 0.04, 3, 6]} />
                <meshPhysicalMaterial color="#3A2A1E" roughness={0.4} />
              </mesh>
            </group>
          )}
          {(pose.tears ?? 0) > 0.05 &&
            [-1, 1].map((g) => (
              <mesh key={`tear${g}`} geometry={SPHERE} position={[g * 0.07, -0.03 - (pose.tears ?? 0) * 0.05, 0.158]} scale={[0.012, 0.016, 0.01]}>
                <meshPhysicalMaterial color="#BFE3F5" roughness={0.05} clearcoat={1} transmission={0.2} emissive="#7FB8D8" emissiveIntensity={0.25} />
              </mesh>
            ))}
          {look.hairStyle === "long" && (
            <>
              <Fuzzy geometry={SPHERE} color={look.hair} position={[0, -0.06, -0.09]} scale={[0.185, 0.26, 0.11]} spacing={0.035} />
              <Fuzzy geometry={SPHERE} color={look.hair} position={[0, 0.17, -0.12]} scale={[0.085, 0.08, 0.08]} spacing={0.04} />
              {[-1, 1].map((s) => (
                <Fuzzy key={`lock${s}`} geometry={SPHERE} color={look.hair} position={[s * 0.135, -0.1, -0.03]} scale={[0.04, 0.13, 0.05]} shells={2} spacing={0.05} />
              ))}
              {look.flower && (
                <group position={[0.13, 0.13, 0.04]}>
                  {Array.from({ length: 5 }, (_, i) => {
                    const a = (i / 5) * Math.PI * 2;
                    return <Fuzzy key={i} geometry={SPHERE} color={look.flower!} position={[Math.cos(a) * 0.028, Math.sin(a) * 0.028, 0.03]} scale={0.024} shells={1} spacing={0.06} />;
                  })}
                  <mesh position={[0, 0, 0.05]} scale={0.014} geometry={SPHERE}>
                    <meshPhysicalMaterial color="#F6C445" roughness={0.6} />
                  </mesh>
                </group>
              )}
            </>
          )}
          {/* eyes: glossy beads with a catch-light */}
          {[-1, 1].map((s) => (
            <group key={`eye${s}`} position={[s * 0.062, 0.0, 0.152]} scale={[1, Math.max(0.12, pose.eyes), 1]}>
              <mesh geometry={SPHERE} material={bead} scale={[0.024, 0.028, 0.016]} />
              <mesh position={[s * 0.006 + 0.004, 0.01, 0.014]} scale={0.0065} geometry={SPHERE}>
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            </group>
          ))}
          {/* brows */}
          {[-1, 1].map((s) => (
            <mesh key={`brow${s}`} position={[s * 0.064, 0.058, 0.152]} rotation={[0, 0, s * (pose.worry * 0.45 - 0.08)]} material={threadMat}>
              <capsuleGeometry args={[0.007, 0.032, 3, 6]} />
            </mesh>
          ))}
          {/* felt cheeks */}
          {[-1, 1].map((s) => (
            <mesh key={`ch${s}`} material={cheekMat} geometry={SPHERE} position={[s * 0.1, -0.05, 0.13]} rotation={[0, s * 0.55, 0]} scale={[0.036 * blush, 0.024 * blush, 0.01]} />
          ))}
          {/* embroidered mouth */}
          <group position={[0, -0.075, 0.158]} rotation={[-0.15, 0, 0]}>
            {pose.mouth === "o" ? (
              <mesh material={threadMat}>
                <torusGeometry args={[0.012, 0.005, 6, 16]} />
              </mesh>
            ) : pose.mouth === "flat" ? (
              <mesh material={threadMat} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.005, 0.03, 3, 6]} />
              </mesh>
            ) : (
              <mesh material={threadMat} rotation={[0, 0, Math.PI + (pose.mouth === "small" ? 0.6 : 0.25)]}>
                <torusGeometry args={[pose.mouth === "small" ? 0.02 : 0.03, 0.0052, 6, 20, pose.mouth === "small" ? Math.PI - 1.2 : Math.PI - 0.5]} />
              </mesh>
            )}
          </group>
        </group>
      </group>
    </group>
  );
};
