// Clay cast for EP03: one quadruped puppet (puppy, old dog, horse, cow, sheep, cat), the hen and the farmer.
// Every pose value comes from the caller; the caller already quantises time to 12 fps for stop-motion.
import React from "react";
import type * as THREE from "three";
import { C, bead, capsule, clay, cyl, lump } from "./clay";
import type { V3 } from "./layout";

type MP = { g: THREE.BufferGeometry; m: THREE.Material; p?: V3; s?: V3 | number; r?: V3; shadow?: boolean };
export const M: React.FC<MP> = ({ g, m, p = [0, 0, 0], s = 1, r = [0, 0, 0], shadow = true }) => (
  <mesh geometry={g} material={m} position={p} scale={typeof s === "number" ? [s, s, s] : s} rotation={r} castShadow={shadow} receiveShadow />
);

/* ---------------- quadruped ---------------- */

export type QuadSpec = {
  bodyLen: number; bodyR: number; bodyY: number;
  legLen: number; legR: number; legX: number; legZ: number;
  neckLen: number; neckR: number; neckTilt: number;
  headR: number; head: V3; snoutLen: number; snoutR: number;
  ear: "flop" | "point" | "horse" | "cow" | "sheep"; earSize: number;
  tail: "wag" | "whip" | "tuft" | "stub";
  body: string; belly: string; leg: string; foot: string; snout: string; ear2: string; nose: string;
  eyeR: number; eyeX: number; seed: number;
};
export type QuadPose = {
  walk?: number; move?: number; puff?: number; squash?: number; hop?: number;
  headPitch?: number; headYaw?: number; headRoll?: number; mouth?: number; blink?: boolean;
  wag?: number; tailUp?: number; earDroop?: number; sit?: number; lie?: number; brow?: number; lick?: number;
};

const Eye: React.FC<{ r: number; blink: boolean; x: number; look?: number }> = ({ r, blink, x, look = 0 }) => (
  <group position={[x, 0, 0]}>
    <M g={lump(9, 0.01, 18)} m={clay(C.white, 0, 0.35)} s={blink ? [r * 1.1, r * 0.18, r * 0.7] : [r, r, r * 0.8]} />
    {blink ? null : <M g={lump(10, 0, 14)} m={bead()} p={[look * r * 0.25, 0, r * 0.62]} s={r * 0.55} shadow={false} />}
    {blink ? null : <M g={lump(11, 0, 10)} m={clay("#ffffff", 0, 0.1)} p={[look * r * 0.25 + r * 0.18, r * 0.2, r * 0.95]} s={r * 0.15} shadow={false} />}
  </group>
);

export const Quad: React.FC<{ spec: QuadSpec; pose: QuadPose; back?: React.ReactNode; headTop?: React.ReactNode; mouthItem?: React.ReactNode; wool?: boolean; stripes?: boolean; spots?: boolean }> = ({
  spec: q, pose, back, headTop, mouthItem, wool, stripes, spots,
}) => {
  const walk = pose.walk ?? 0, move = pose.move ?? 0, puff = pose.puff ?? 0, sit = pose.sit ?? 0, lie = pose.lie ?? 0;
  const sq = pose.squash ?? 0;
  const sy = 1 + sq, sl = Math.sqrt(1 / Math.max(0.3, sy));
  const bodyM = clay(q.body), bellyM = clay(q.belly), legM = clay(q.leg), footM = clay(q.foot), snoutM = clay(q.snout), earM = clay(q.ear2);
  const bob = Math.abs(Math.sin(walk)) * 0.05 * move * q.bodyY;
  const torsoPitch = -sit * 0.55 + lie * 0.05;
  const drop = sit * q.legLen * 0.42 + lie * q.legLen * 0.82;
  const puffS = 1 + puff * 0.14;
  const legs: [number, number, number][] = [
    [q.legX, q.legZ, 0], [-q.legX, q.legZ, Math.PI], [q.legX, -q.legZ, Math.PI], [-q.legX, -q.legZ, 0],
  ];
  const headPitch = (pose.headPitch ?? 0) - puff * 0.35;
  const mouth = pose.mouth ?? 0;
  const brow = pose.brow ?? 0;
  const earDroop = pose.earDroop ?? 0;
  const tailUp = pose.tailUp ?? 0.5;
  const wag = pose.wag ?? 0;
  return (
    <group position={[0, (pose.hop ?? 0) - drop + bob, 0]} scale={[sl, sy, sl]}>
      {/* legs */}
      {legs.map(([x, z, ph], i) => {
        const front = z > 0;
        let rx = Math.sin(walk + ph) * 0.55 * move;
        if (!front) rx += -sit * 1.25 - lie * 1.35;
        if (front) rx += sit * 0.15 - lie * 1.35;
        return (
          <group key={i} position={[x * puffS, q.bodyY, z]} rotation={[rx, 0, 0]}>
            <M g={capsule(Math.max(0.2, (q.legLen - q.legR) / q.legR))} m={legM} p={[0, -q.legLen / 2, 0]} s={q.legR} />
            <M g={lump(30 + i, 0.03, 16)} m={footM} p={[0, -q.legLen + q.legR * 0.2, q.legR * 0.35]} s={[q.legR * 1.25, q.legR * 0.75, q.legR * 1.5]} />
          </group>
        );
      })}
      {/* torso pivots on the hips */}
      <group position={[0, q.bodyY, -q.bodyLen * 0.4]} rotation={[torsoPitch, 0, 0]}>
        <group position={[0, 0, q.bodyLen * 0.4]}>
          <group scale={[puffS, puffS * (1 + puff * 0.04), 1 + puff * 0.04]}>
            <M g={lump(q.seed, 0.03)} m={bodyM} s={[q.bodyR, q.bodyR * 0.96, q.bodyLen / 2 + q.bodyR * 0.55]} />
            <M g={lump(q.seed + 1, 0.03)} m={bellyM} p={[0, -q.bodyR * 0.22, q.bodyLen * 0.12]} s={[q.bodyR * 0.82, q.bodyR * 0.8, q.bodyLen * 0.42 + q.bodyR * 0.3]} />
            {wool
              ? Array.from({ length: 26 }, (_, i) => {
                  const a = i * 2.39996, yy = ((i % 13) / 12) * 2 - 1;
                  const rad = Math.sqrt(1 - yy * yy * 0.55);
                  return <M key={i} g={lump(50 + (i % 6), 0.06, 16)} m={clay(C.sheepWool, 1.2, 0.9)} p={[Math.cos(a) * q.bodyR * 0.82 * rad, Math.abs(yy) * q.bodyR * 0.55 + q.bodyR * 0.05, Math.sin(a) * (q.bodyLen / 2 + q.bodyR * 0.3) * 0.85 * rad]} s={q.bodyR * (0.42 + (i % 3) * 0.06)} />;
                })
              : null}
            {spots
              ? ([[0.6, 0.35, 0.2, 0.42], [-0.7, 0.2, -0.35, 0.38], [0.2, 0.7, -0.6, 0.33], [-0.4, 0.55, 0.55, 0.3]] as const).map(([x, y, z, r], i) => (
                  <M key={i} g={lump(70 + i, 0.08, 18)} m={clay(C.cowSpot, 1, 0.7)} p={[x * q.bodyR * 0.93, y * q.bodyR * 0.95, z * (q.bodyLen / 2 + q.bodyR * 0.4)]} s={[q.bodyR * r, q.bodyR * r * 0.7, q.bodyR * r * 1.2]} />
                ))
              : null}
            {stripes
              ? [-0.45, -0.1, 0.25].map((z, i) => (
                  <M key={i} g={capsule(2.4)} m={clay(q.ear2, 1, 0.75)} p={[0, q.bodyR * 0.78, z * q.bodyLen]} r={[0, 0, Math.PI / 2]} s={[q.bodyR * 0.16, q.bodyR * 0.33, q.bodyR * 0.16]} />
                ))
              : null}
            {back}
          </group>
          {/* tail */}
          <group position={[0, q.bodyR * 0.35, -(q.bodyLen / 2 + q.bodyR * 0.45)]} rotation={[-0.4 - tailUp * 0.9, Math.sin(wag * 14) * 0.7 * Math.min(1, wag * 3), 0]}>
            {q.tail === "tuft" ? (
              <>
                <M g={capsule(4)} m={bodyM} p={[0, 0, -q.bodyR * 0.5]} r={[Math.PI / 2, 0, 0]} s={[q.bodyR * 0.08, q.bodyR * 0.12, q.bodyR * 0.08]} />
                <M g={lump(80, 0.08, 14)} m={clay(q.ear2)} p={[0, 0, -q.bodyR * 1.05]} s={[q.bodyR * 0.17, q.bodyR * 0.17, q.bodyR * 0.3]} />
              </>
            ) : q.tail === "whip" ? (
              <M g={capsule(6)} m={clay(q.ear2)} p={[0, -q.bodyR * 0.4, -q.bodyR * 0.75]} r={[0.9, 0, 0]} s={[q.bodyR * 0.16, q.bodyR * 0.14, q.bodyR * 0.16]} />
            ) : q.tail === "stub" ? (
              <M g={lump(81, 0.05, 14)} m={bodyM} p={[0, 0, -q.bodyR * 0.1]} s={q.bodyR * 0.28} />
            ) : (
              <M g={capsule(3)} m={bodyM} p={[0, 0, -q.bodyR * 0.45]} r={[Math.PI / 2, 0, 0]} s={[q.bodyR * 0.13, q.bodyR * 0.13, q.bodyR * 0.13]} />
            )}
          </group>
          {/* neck + head */}
          <group position={[0, q.bodyR * 0.45 * puffS, q.bodyLen / 2 + q.bodyR * 0.2]} rotation={[-q.neckTilt + puff * 0.25, 0, 0]}>
            <M g={capsule(Math.max(0.2, q.neckLen / q.neckR))} m={bodyM} p={[0, q.neckLen / 2, 0]} s={[q.neckR * puffS, q.neckR, q.neckR]} />
            <group position={[0, q.neckLen, 0]} rotation={[q.neckTilt - puff * 0.25 + headPitch, pose.headYaw ?? 0, pose.headRoll ?? 0]}>
              <M g={lump(q.seed + 2, 0.025)} m={bodyM} s={[q.headR * q.head[0], q.headR * q.head[1], q.headR * q.head[2]]} />
              {/* snout + jaw */}
              <group position={[0, -q.headR * 0.22, q.headR * q.head[2] * 0.62]}>
                <M g={lump(q.seed + 3, 0.02)} m={snoutM} p={[0, 0.04 * q.snoutR, q.snoutLen * 0.5]} s={[q.snoutR, q.snoutR * 0.78, q.snoutLen * 0.75 + q.snoutR * 0.3]} />
                <M g={lump(12, 0.01, 16)} m={bead(q.nose)} p={[0, q.snoutR * 0.55, q.snoutLen * 1.05 + q.snoutR * 0.15]} s={[q.snoutR * 0.42, q.snoutR * 0.3, q.snoutR * 0.3]} />
                <group position={[0, -q.snoutR * 0.45, 0]} rotation={[mouth * 0.55, 0, 0]}>
                  <M g={lump(q.seed + 4, 0.02)} m={snoutM} p={[0, -q.snoutR * 0.12, q.snoutLen * 0.42]} s={[q.snoutR * 0.82, q.snoutR * 0.36, q.snoutLen * 0.68 + q.snoutR * 0.2]} />
                  {mouth > 0.05 || (pose.lick ?? 0) > 0 ? (
                    <M g={lump(13, 0.02, 14)} m={clay("#e27b86", 0.4, 0.5)} p={[0, q.snoutR * 0.08 - (pose.lick ?? 0) * q.snoutR * 0.3, q.snoutLen * 0.55 + (pose.lick ?? 0) * q.snoutR * 0.9]} s={[q.snoutR * 0.45, q.snoutR * 0.12, q.snoutLen * 0.4 + (pose.lick ?? 0) * q.snoutR * 0.5]} />
                  ) : null}
                </group>
                {mouthItem}
              </group>
              {/* eyes + brows */}
              <group position={[0, q.headR * 0.18, q.headR * q.head[2] * 0.78]}>
                <Eye r={q.eyeR} x={q.eyeX} blink={!!pose.blink} />
                <Eye r={q.eyeR} x={-q.eyeX} blink={!!pose.blink} />
                {[1, -1].map((sd) => (
                  <M key={sd} g={capsule(2.2)} m={clay(q.ear2, 0.5)} p={[sd * q.eyeX, q.eyeR * 1.35, q.eyeR * 0.15]} r={[0, 0, Math.PI / 2 + sd * (brow * 0.45)]} s={[q.eyeR * 0.22, q.eyeR * 0.32, q.eyeR * 0.22]} />
                ))}
              </group>
              {/* ears */}
              {[1, -1].map((sd) => {
                const base: V3 = [sd * q.headR * q.head[0] * 0.62, q.headR * q.head[1] * 0.62, -q.headR * 0.1];
                const e = q.earSize;
                if (q.ear === "flop")
                  return (
                    <group key={sd} position={base} rotation={[0.1, 0, sd * (0.5 + earDroop * 0.9)]}>
                      <M g={lump(90 + sd, 0.04, 16)} m={earM} p={[sd * e * 0.3, -e * 0.55, 0]} s={[e * 0.42, e * 0.85, e * 0.16]} />
                    </group>
                  );
                if (q.ear === "point")
                  return (
                    <group key={sd} position={base} rotation={[-0.15 + earDroop * 0.5, 0, sd * (-0.2 + earDroop * 1.0)]}>
                      <mesh geometry={cyl(0.001, e * 0.42, e, 4)} material={earM} position={[0, e * 0.4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow />
                    </group>
                  );
                if (q.ear === "horse")
                  return (
                    <group key={sd} position={[base[0] * 0.7, base[1], base[2] - q.headR * 0.2]} rotation={[-0.2 + earDroop * 0.7, 0, sd * (-0.25 + earDroop * 0.8)]}>
                      <M g={lump(92, 0.03, 14)} m={earM} p={[0, e * 0.5, 0]} s={[e * 0.24, e * 0.55, e * 0.16]} />
                    </group>
                  );
                // cow / sheep: sideways ears
                return (
                  <group key={sd} position={[base[0], base[1] * 0.55, base[2]]} rotation={[0, 0, sd * (-1.25 + earDroop * 0.6)]}>
                    <M g={lump(94, 0.03, 14)} m={earM} p={[0, e * 0.5, 0]} s={[e * 0.26, e * 0.55, e * 0.13]} />
                  </group>
                );
              })}
              {headTop}
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

/* ---------------- specs ---------------- */

const base = { foot: C.ink, nose: C.ink, seed: 1 };
export const PUP: QuadSpec = {
  ...base, bodyLen: 0.2, bodyR: 0.13, bodyY: 0.145, legLen: 0.12, legR: 0.045, legX: 0.075, legZ: 0.1,
  neckLen: 0.05, neckR: 0.06, neckTilt: 0.2, headR: 0.15, head: [1.05, 0.95, 0.95], snoutLen: 0.07, snoutR: 0.07,
  ear: "flop", earSize: 0.13, tail: "wag", body: C.pup, belly: C.pupLight, leg: C.pup, foot: C.pupLight, snout: C.pupLight, ear2: C.pupEar, eyeR: 0.042, eyeX: 0.06, seed: 3,
};
export const OLDDOG: QuadSpec = {
  ...base, bodyLen: 0.42, bodyR: 0.2, bodyY: 0.3, legLen: 0.26, legR: 0.06, legX: 0.11, legZ: 0.2,
  neckLen: 0.08, neckR: 0.09, neckTilt: 0.45, headR: 0.17, head: [1, 0.95, 1.05], snoutLen: 0.15, snoutR: 0.085,
  ear: "flop", earSize: 0.18, tail: "wag", body: C.oldDog, belly: C.oldDogLight, leg: C.oldDog, foot: C.oldDogLight, snout: C.oldDogLight, ear2: "#6f6964", eyeR: 0.034, eyeX: 0.07, seed: 7,
};
export const HORSE_S: QuadSpec = {
  ...base, bodyLen: 0.95, bodyR: 0.36, bodyY: 0.905, legLen: 0.85, legR: 0.1, legX: 0.2, legZ: 0.48,
  neckLen: 0.55, neckR: 0.17, neckTilt: -0.55, headR: 0.2, head: [0.85, 1, 1.15], snoutLen: 0.32, snoutR: 0.14,
  ear: "horse", earSize: 0.18, tail: "whip", body: C.horse, belly: "#a56a40", leg: C.horse, foot: C.horseDark, snout: "#b98763", ear2: C.horseDark, eyeR: 0.05, eyeX: 0.1, seed: 11,
};
export const COW_S: QuadSpec = {
  ...base, bodyLen: 0.85, bodyR: 0.4, bodyY: 0.655, legLen: 0.6, legR: 0.1, legX: 0.22, legZ: 0.42,
  neckLen: 0.18, neckR: 0.2, neckTilt: -0.1, headR: 0.25, head: [1, 0.95, 1], snoutLen: 0.14, snoutR: 0.17,
  ear: "cow", earSize: 0.2, tail: "tuft", body: C.cow, belly: C.cow, leg: C.cow, foot: C.cowSpot, snout: C.cowPink, ear2: C.cowSpot, nose: "#8a4a4a", eyeR: 0.055, eyeX: 0.12, seed: 17,
};
export const SHEEP_S: QuadSpec = {
  ...base, bodyLen: 0.45, bodyR: 0.32, bodyY: 0.37, legLen: 0.34, legR: 0.055, legX: 0.15, legZ: 0.22,
  neckLen: 0.08, neckR: 0.12, neckTilt: 0.1, headR: 0.17, head: [0.9, 1, 1.15], snoutLen: 0.08, snoutR: 0.1,
  ear: "sheep", earSize: 0.15, tail: "stub", body: C.sheepWool, belly: C.sheepWool, leg: C.sheepFace, foot: C.ink, snout: C.sheepFace, ear2: C.sheepFace, eyeR: 0.045, eyeX: 0.075, seed: 23,
};
export const CAT_S: QuadSpec = {
  ...base, bodyLen: 0.28, bodyR: 0.13, bodyY: 0.2, legLen: 0.17, legR: 0.04, legX: 0.07, legZ: 0.13,
  neckLen: 0.05, neckR: 0.07, neckTilt: 0.3, headR: 0.14, head: [1.1, 0.95, 0.9], snoutLen: 0.03, snoutR: 0.06,
  ear: "point", earSize: 0.1, tail: "whip", body: C.cat, belly: "#f6c99a", leg: C.cat, foot: "#f6c99a", snout: "#f6c99a", ear2: C.catStripe, nose: "#d9677a", eyeR: 0.04, eyeX: 0.06, seed: 29,
};

/* ---------------- props carried by animals ---------------- */

export const Sacks: React.FC = () => (
  <group position={[0, HORSE_S.bodyR * 0.85, 0]}>
    <M g={lump(101, 0.05)} m={clay(C.woodDark)} p={[0, 0.02, 0]} s={[0.3, 0.05, 0.42]} />
    {[1, -1].map((sd) => (
      <group key={sd}>
        <M g={lump(102 + sd, 0.07)} m={clay("#d4b483", 1.3)} p={[sd * 0.36, -0.18, 0.05]} s={[0.15, 0.22, 0.2]} />
        <M g={lump(104 + sd, 0.04, 12)} m={clay("#b08a5a")} p={[sd * 0.36, 0.02, 0.05]} s={[0.07, 0.05, 0.07]} />
      </group>
    ))}
    <M g={lump(106, 0.06)} m={clay("#c9a66e", 1.3)} p={[0, 0.16, -0.05]} s={[0.2, 0.12, 0.26]} />
  </group>
);

export const Horns: React.FC = () => (
  <>
    {[1, -1].map((sd) => (
      <group key={sd} position={[sd * 0.17, 0.2, -0.02]} rotation={[0, 0, sd * -0.9]}>
        <mesh geometry={cyl(0.012, 0.035, 0.16, 10)} material={clay(C.cream, 0.6)} position={[0, 0.08, 0]} castShadow />
      </group>
    ))}
    <M g={lump(110, 0.08, 14)} m={clay(C.cowSpot)} p={[0, 0.2, 0.06]} s={[0.09, 0.05, 0.07]} />
  </>
);

export const SheepTop: React.FC = () => (
  <>
    {[0, 1, 2, 3].map((i) => (
      <M key={i} g={lump(120 + i, 0.06, 14)} m={clay(C.sheepWool, 1.2, 0.9)} p={[(i - 1.5) * 0.06, 0.16 + (i % 2) * 0.03, -0.02 - (i % 2) * 0.03]} s={0.07} />
    ))}
  </>
);

export const Mane: React.FC = () => (
  <>
    {Array.from({ length: 6 }, (_, i) => (
      <M key={i} g={lump(130 + i, 0.08, 12)} m={clay(C.horseDark, 1.2)} p={[0, 0.17 - i * 0.02, -0.12 - i * 0.04]} s={[0.05, 0.08, 0.07]} />
    ))}
  </>
);

/* ---------------- hen ---------------- */

export type HenPose = { puff?: number; mouth?: number; blink?: boolean; headPitch?: number; headYaw?: number; flap?: number; peck?: number };
export const Hen: React.FC<{ pose: HenPose }> = ({ pose }) => {
  const p = pose.puff ?? 0, flap = pose.flap ?? 0, m = pose.mouth ?? 0;
  const hm = clay(C.hen, 1.1, 0.85);
  return (
    <group>
      {[1, -1].map((sd) => (
        <group key={sd} position={[sd * 0.06, 0.12, 0]}>
          <mesh geometry={cyl(0.012, 0.012, 0.13, 8)} material={clay(C.beak)} position={[0, -0.06, 0]} castShadow />
          <M g={lump(140, 0.02, 10)} m={clay(C.beak)} p={[0, -0.12, 0.03]} s={[0.035, 0.012, 0.05]} />
        </group>
      ))}
      <group position={[0, 0.27, 0]} scale={[1 + p * 0.18, 1 + p * 0.12, 1 + p * 0.1]}>
        <M g={lump(141, 0.04)} m={hm} s={[0.16, 0.15, 0.2]} />
        {/* tail feathers */}
        {[-1, 0, 1].map((i) => (
          <M key={i} g={lump(142 + i, 0.05, 12)} m={hm} p={[i * 0.04, 0.1, -0.17]} r={[-0.6, 0, i * 0.3]} s={[0.04, 0.11, 0.05]} />
        ))}
        {/* wings */}
        {[1, -1].map((sd) => (
          <group key={sd} position={[sd * 0.14, 0.02, 0]} rotation={[0, 0, sd * (0.1 + flap * 0.9)]}>
            <M g={lump(146, 0.05, 14)} m={clay("#efe4cf", 1.1)} p={[sd * 0.02, -0.02, -0.01]} s={[0.04, 0.09, 0.13]} />
          </group>
        ))}
      </group>
      <group position={[0, 0.43 + p * 0.03, 0.1]} rotation={[(pose.headPitch ?? 0) - p * 0.3 + (pose.peck ?? 0) * 1.0, pose.headYaw ?? 0, 0]}>
        <M g={lump(147, 0.03)} m={hm} s={[0.085, 0.095, 0.085]} />
        {[0, 1, 2].map((i) => (
          <M key={i} g={lump(148 + i, 0.05, 12)} m={clay(C.henComb, 0.8, 0.6)} p={[0, 0.09 + (i === 1 ? 0.015 : 0), -0.03 + i * 0.03]} s={0.03} />
        ))}
        <M g={lump(151, 0.04, 12)} m={clay(C.henComb, 0.8, 0.6)} p={[0, -0.06, 0.07]} s={[0.02, 0.035, 0.02]} />
        <group position={[0, -0.005, 0.08]}>
          <mesh geometry={cyl(0.001, 0.025, 0.06, 8)} material={clay(C.beak, 0.4)} position={[0, 0.008, 0.02]} rotation={[Math.PI / 2 - m * 0.3, 0, 0]} castShadow />
          <mesh geometry={cyl(0.001, 0.02, 0.045, 8)} material={clay("#d98d22", 0.4)} position={[0, -0.012, 0.015]} rotation={[Math.PI / 2 + m * 0.5, 0, 0]} castShadow />
        </group>
        <group position={[0, 0.02, 0.055]}>
          <Eye r={0.02} x={0.045} blink={!!pose.blink} />
          <Eye r={0.02} x={-0.045} blink={!!pose.blink} />
        </group>
      </group>
    </group>
  );
};

/* ---------------- farmer ---------------- */

export type FarmerPose = {
  walk?: number; move?: number; slump?: number; crouch?: number; sit?: number; lie?: number; roll?: number;
  headPitch?: number; headYaw?: number; mouth?: number; blink?: boolean; smile?: number;
  armR?: [number, number]; armL?: [number, number]; // [raise forward, out sideways] radians
  elbowR?: number; elbowL?: number;
};
export const Farmer: React.FC<{ pose: FarmerPose; held?: React.ReactNode }> = ({ pose, held }) => {
  const walk = pose.walk ?? 0, move = pose.move ?? 0, slump = pose.slump ?? 0, crouch = pose.crouch ?? 0, sit = pose.sit ?? 0, lie = pose.lie ?? 0;
  const legL = 0.78;
  const hipY = 0.86 - crouch * 0.3 - sit * 0.68 - lie * 0.66;
  const bob = Math.abs(Math.sin(walk)) * 0.03 * move;
  const skin = clay(C.skin, 0.8), ov = clay(C.overalls), sh = clay(C.shirt), boot = clay(C.boot, 0.8);
  const aR = pose.armR ?? [0.05, 0.12], aL = pose.armL ?? [0.05, 0.12];
  const torsoPitch = slump * 0.35 + crouch * 0.35 - lie * 1.35;
  const smile = pose.smile ?? 0;
  return (
    <group position={[0, bob, 0]}>
      {/* legs */}
      {[1, -1].map((sd) => {
        const sw = Math.sin(walk + (sd > 0 ? 0 : Math.PI)) * 0.5 * move;
        const hipRx = sw - crouch * 0.9 - sit * 1.5 - lie * 1.5;
        const knee = crouch * 1.5 + Math.max(0, -Math.sin(walk + (sd > 0 ? 0 : Math.PI))) * 0.4 * move + sit * 0.1;
        return (
          <group key={sd} position={[sd * 0.12, hipY, 0]} rotation={[hipRx, 0, sd * 0.03]}>
            <M g={capsule(3)} m={ov} p={[0, -legL * 0.25, 0]} s={[0.085, 0.07, 0.085]} />
            <group position={[0, -legL * 0.5, 0]} rotation={[knee, 0, 0]}>
              <M g={capsule(3)} m={ov} p={[0, -legL * 0.22, 0]} s={[0.08, 0.065, 0.08]} />
              <M g={lump(160 + sd, 0.04, 16)} m={boot} p={[0, -legL * 0.46, 0.05]} s={[0.085, 0.06, 0.14]} />
            </group>
          </group>
        );
      })}
      {/* torso */}
      <group position={[0, hipY, 0]} rotation={[torsoPitch, 0, pose.roll ?? 0]}>
        <M g={lump(163, 0.03)} m={ov} p={[0, 0.2, 0]} s={[0.24, 0.26, 0.17]} />
        <M g={lump(164, 0.03)} m={sh} p={[0, 0.48, 0]} s={[0.25, 0.2, 0.17]} />
        <M g={lump(165, 0.02, 14)} m={ov} p={[0, 0.34, 0.14]} s={[0.15, 0.11, 0.05]} />
        {[1, -1].map((sd) => (
          <M key={sd} g={capsule(6)} m={ov} p={[sd * 0.1, 0.45, 0.14]} r={[0.15, 0, 0]} s={[0.025, 0.03, 0.02]} />
        ))}
        {/* arms */}
        {[1, -1].map((sd) => {
          const a = sd > 0 ? aR : aL;
          const el = (sd > 0 ? pose.elbowR : pose.elbowL) ?? 0.15;
          const sw = -Math.sin(walk + (sd > 0 ? 0 : Math.PI)) * 0.45 * move;
          return (
            <group key={sd} position={[sd * 0.27, 0.58, 0]} rotation={[-(a[0] + sw), 0, sd * a[1]]}>
              <M g={capsule(3)} m={sh} p={[0, -0.14, 0]} s={[0.07, 0.06, 0.07]} />
              <group position={[0, -0.29, 0]} rotation={[-el, 0, 0]}>
                <M g={capsule(3)} m={sh} p={[0, -0.11, 0]} s={[0.06, 0.05, 0.06]} />
                <M g={lump(166 + sd, 0.04, 14)} m={skin} p={[0, -0.27, 0]} s={0.06} />
              </group>
            </group>
          );
        })}
        {held ? <group position={[0, 0.44, 0.26]}>{held}</group> : null}
        {/* head */}
        <group position={[0, 0.72, 0]} rotation={[(pose.headPitch ?? 0) + slump * 0.25, pose.headYaw ?? 0, 0]}>
          <M g={lump(168, 0.03)} m={skin} p={[0, 0.15, 0]} s={[0.17, 0.19, 0.17]} />
          <M g={lump(169, 0.04, 14)} m={skin} p={[0, 0.13, 0.17]} s={[0.05, 0.045, 0.05]} />
          {[1, -1].map((sd) => (
            <M key={sd} g={lump(170, 0.04, 12)} m={skin} p={[sd * 0.17, 0.15, 0]} s={[0.03, 0.05, 0.035]} />
          ))}
          <group position={[0, 0.2, 0.145]}>
            <Eye r={0.028} x={0.06} blink={!!pose.blink || smile > 0.7} />
            <Eye r={0.028} x={-0.06} blink={!!pose.blink || smile > 0.7} />
          </group>
          {/* moustache + mouth */}
          <M g={capsule(3)} m={clay("#5b3a26")} p={[0, 0.075, 0.165]} r={[0, 0, Math.PI / 2]} s={[0.018, 0.03, 0.018]} />
          <M g={lump(171, 0.02, 14)} m={clay("#5a2a26", 0.3, 0.5)} p={[0, 0.035, 0.155]} s={[0.04 + smile * 0.025, 0.006 + (pose.mouth ?? 0) * 0.028 + smile * 0.012, 0.02]} />
          {/* straw hat */}
          <group position={[0, 0.33, -0.05]} rotation={[-0.32, 0, 0.04]}>
            <mesh geometry={cyl(0.36, 0.38, 0.03, 32)} material={clay(C.straw, 1.6, 0.9)} castShadow receiveShadow />
            <mesh geometry={cyl(0.15, 0.18, 0.15, 24)} material={clay(C.straw, 1.6, 0.9)} position={[0, 0.08, 0]} castShadow />
            <mesh geometry={cyl(0.182, 0.182, 0.04, 24)} material={clay(C.shirt, 0.8)} position={[0, 0.03, 0]} castShadow />
          </group>
        </group>
      </group>
    </group>
  );
};
