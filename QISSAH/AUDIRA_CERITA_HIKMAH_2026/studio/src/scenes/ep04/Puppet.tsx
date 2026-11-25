// Villager puppet for PERSAUDARAAN, derived from the PAPERWORLD PaperCharacter rig (copied here, not edited in the kit).
// Additions: short cropped hair or a bob, peci / iket headgear, moustache, a mouth that opens with the
// spoken word times, a sitting pose, a rice sack carried on the shoulder, a lantern in the other hand and tears.
// Front faces +z, feet on the origin, 6.3 units tall at scale 1.

import React from "react";
import { S } from "../../kits/paperworld/geometry/shapes.ts";
import { Cut, Hinge, type V3 } from "../../kits/paperworld/components/Paper.tsx";

export type Pose = {
  walk: number;
  stride: number;
  lean: number;
  headTilt: number;
  headNod: number;
  look: [number, number];
  blink: number;
  /** [left, right] raise outward (rad). */
  armOut: [number, number];
  /** [left, right] swing forward (rad). */
  armFwd: [number, number];
  /** 0 closed .. 1 wide (from mouthOf). */
  talk: number;
  smile: number;
  /** 0 standing .. 1 sitting on a low step. */
  sit: number;
  /** Sack on the right shoulder. */
  carry: number;
  /** 0..1 lantern in the left hand (also its glow). */
  lantern: number;
  tears: number;
  time: number;
};

export const rest = (p: Partial<Pose> = {}): Pose => ({
  walk: 0, stride: 0, lean: 0, headTilt: 0, headNod: 0, look: [0, 0], blink: 0, armOut: [0, 0], armFwd: [0, 0],
  talk: 0, smile: 0.5, sit: 0, carry: 0, lantern: 0, tears: 0, time: 0, ...p,
});

export type Look = {
  coat: string; coatDeep: string; collar: string; trim: string; legs: string; shoes: string;
  hair: string; skin: string; ink: string; cheek: string;
  hairStyle: "short" | "bob";
  hat?: "peci" | "iket" | "kerudung" | null;
  hatColor?: string;
  moustache?: boolean;
};

/* ---------- shapes ---------- */
const coat = S.path("ep4-coat", (s) => {
  s.moveTo(-1.0, 1.12);
  s.lineTo(1.0, 1.12);
  s.quadraticCurveTo(1.1, 1.12, 1.06, 1.3);
  s.lineTo(0.78, 3.12);
  s.quadraticCurveTo(0.74, 3.42, 0.44, 3.42);
  s.lineTo(-0.44, 3.42);
  s.quadraticCurveTo(-0.74, 3.42, -0.78, 3.12);
  s.lineTo(-1.06, 1.3);
  s.quadraticCurveTo(-1.1, 1.12, -1.0, 1.12);
});
const hem = S.rectC(2.08, 0.26, 0.05);
const placket = S.rect(0.16, 2.0, 0.04);
const belt = S.rectC(1.86, 0.2, 0.05);
const collarL = S.poly("ep4-collarL", [[-0.04, 2.95], [-0.46, 3.42], [-0.02, 3.42]]);
const collarR = S.poly("ep4-collarR", [[0.04, 2.95], [0.02, 3.42], [0.46, 3.42]]);
const leg = S.rect(0.42, 1.3, 0.12);
const shoe = S.rectC(0.6, 0.26, 0.12);
const sleeve = S.path("ep4-sleeve", (s) => {
  s.moveTo(-0.21, 0.05);
  s.quadraticCurveTo(0, 0.24, 0.21, 0.05);
  s.lineTo(0.24, -1.18);
  s.quadraticCurveTo(0, -1.3, -0.24, -1.18);
  s.closePath();
});
const cuff = S.rectC(0.5, 0.14, 0.06);
const hand = S.circle(0.2);
const neck = S.rect(0.46, 0.5, 0.1);
const head = S.circle(1.12);
const shortBack = S.path("ep4-shortBack", (s) => {
  s.moveTo(-1.2, 4.45);
  s.absarc(0, 4.75, 1.24, Math.PI + 0.25, -0.25, true);
  s.lineTo(1.2, 4.45);
  s.closePath();
});
const shortFringe = S.path("ep4-shortFringe", (s) => {
  s.moveTo(-1.14, 4.95);
  s.absarc(0, 4.78, 1.17, Math.PI - 0.15, 0.15, true);
  s.bezierCurveTo(0.9, 5.3, 0.55, 5.42, 0.25, 5.3);
  s.bezierCurveTo(0.0, 5.42, -0.4, 5.48, -0.7, 5.3);
  s.bezierCurveTo(-0.95, 5.2, -1.05, 5.1, -1.14, 4.95);
});
const bobBack = S.path("ep4-bob", (s) => {
  s.moveTo(-1.3, 4.0);
  s.quadraticCurveTo(-1.36, 3.86, -1.1, 3.86);
  s.lineTo(1.1, 3.86);
  s.quadraticCurveTo(1.36, 3.86, 1.3, 4.0);
  s.lineTo(1.28, 4.82);
  s.absarc(0, 4.82, 1.28, 0, Math.PI, false);
  s.lineTo(-1.3, 4.0);
});
const bobFringe = S.path("ep4-bobFringe", (s) => {
  s.moveTo(-1.16, 4.7);
  s.absarc(0, 4.8, 1.18, Math.PI + 0.08, -0.08, true);
  s.bezierCurveTo(0.95, 5.05, 0.55, 5.25, 0.3, 5.12);
  s.bezierCurveTo(0.05, 5.0, -0.2, 5.28, -0.45, 5.08);
  s.bezierCurveTo(-0.75, 4.86, -0.95, 4.95, -1.16, 4.7);
});
const peci = S.path("ep4-peci", (s) => {
  s.moveTo(-1.02, 5.18);
  s.lineTo(1.02, 5.18);
  s.lineTo(0.96, 5.86);
  s.quadraticCurveTo(0, 5.98, -0.96, 5.86);
  s.closePath();
});
const iket = S.rectC(2.34, 0.34, 0.08);
const iketKnot = S.poly("ep4-knot", [[0, 0], [0.55, 0.32], [0.62, -0.05], [0.5, -0.5], [0.12, -0.12]]);
const kerudung = S.path("ep4-kerudung", (s) => {
  s.moveTo(-1.42, 3.5);
  s.lineTo(1.42, 3.5);
  s.quadraticCurveTo(1.5, 4.4, 1.32, 4.9);
  s.absarc(0, 4.78, 1.34, 0.1, Math.PI - 0.1, false);
  s.quadraticCurveTo(-1.5, 4.4, -1.42, 3.5);
});
const moustache = S.path("ep4-moustache", (s) => {
  s.moveTo(-0.42, 4.24);
  s.quadraticCurveTo(-0.2, 4.44, 0, 4.36);
  s.quadraticCurveTo(0.2, 4.44, 0.42, 4.24);
  s.quadraticCurveTo(0.2, 4.3, 0, 4.26);
  s.quadraticCurveTo(-0.2, 4.3, -0.42, 4.24);
});
const eye = S.ellipse(0.11, 0.17);
const glint = S.circle(0.04);
const brow = S.rectC(0.34, 0.07, 0.03);
const cheek = S.circle(0.16);
const smileShape = S.path("ep4-smile", (s) => {
  s.moveTo(-0.17, 0.04);
  s.quadraticCurveTo(0, -0.16, 0.17, 0.04);
  s.quadraticCurveTo(0, -0.07, -0.17, 0.04);
});
const mouthO = S.ellipse(0.12, 0.12);
const mouthFlat = S.rectC(0.26, 0.05, 0.025);
const tear = S.path("ep4-tear", (s) => {
  s.moveTo(0, 0.14);
  s.quadraticCurveTo(0.09, 0, 0.06, -0.06);
  s.absarc(0, -0.06, 0.06, 0, Math.PI, true);
  s.quadraticCurveTo(-0.09, 0, 0, 0.14);
});

/* ---------- props ---------- */
const sackShape = S.path("ep4-sack", (s) => {
  s.moveTo(-0.8, 0.12);
  s.quadraticCurveTo(-0.9, 0, -0.62, 0);
  s.lineTo(0.62, 0);
  s.quadraticCurveTo(0.9, 0, 0.8, 0.12);
  s.quadraticCurveTo(0.98, 0.8, 0.62, 1.32);
  s.lineTo(0.3, 1.42);
  s.lineTo(0.42, 1.72);
  s.lineTo(0.1, 1.6);
  s.lineTo(-0.1, 1.6);
  s.lineTo(-0.42, 1.72);
  s.lineTo(-0.3, 1.42);
  s.lineTo(-0.62, 1.32);
  s.quadraticCurveTo(-0.98, 0.8, -0.8, 0.12);
});
const sackTie = S.rectC(0.72, 0.13, 0.05);
const sackBand = S.rectC(1.5, 0.1, 0.03);

/** A burlap rice sack (base on y = 0), front +z: a thick card body with a tie and a printed band. */
export const Sack: React.FC<{ position?: V3; rotation?: V3; scale?: number; tone?: number }> = ({ position, rotation, scale = 1, tone = 0 }) => {
  const body = tone ? "#c7a46c" : "#d2b07a";
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Cut shape={sackShape} color={body} edge="#e8d3a8" depth={0.62} />
      <Cut shape={sackTie} color="#8a6a3c" position={[0, 1.42, 0]} depth={0.7} />
      <Cut shape={sackBand} color="#a3542f" position={[0, 0.55, 0.32]} depth={0.02} />
      <Cut shape={sackBand} color="#a3542f" position={[0, 0.74, 0.32]} depth={0.02} />
    </group>
  );
};

const lampBody = S.rectC(0.5, 0.62, 0.08);
const lampCap = S.poly("ep4-lampcap", [[-0.34, 0], [0.34, 0], [0.12, 0.22], [-0.12, 0.22]]);
const lampBail = S.ring(0.17, 0.22);

/** Hand lantern (pelita) hanging from the hand: glow 0..1 lights the flame card and a warm point light. */
export const Lantern: React.FC<{ glow: number; position?: V3 }> = ({ glow, position }) => (
  <group position={position}>
    <Cut shape={lampBail} color="#4a3324" position={[0, -0.05, 0]} depth={0.05} />
    <Cut shape={lampCap} color="#4a3324" position={[0, -0.5, 0]} depth={0.42} />
    <Cut shape={lampBody} color="#ffd98a" position={[0, -0.84, 0]} depth={0.36} opts={{ emissive: "#ffb54a", emissiveIntensity: 0.4 + 2.6 * glow }} cast={false} />
    <Cut shape={S.rectC(0.62, 0.1, 0.03)} color="#4a3324" position={[0, -1.18, 0]} depth={0.46} />
    {glow > 0.01 ? <pointLight position={[0, -0.84, 0.5]} color="#ffb768" intensity={38 * glow} distance={16} decay={1.6} /> : null}
  </group>
);

/* ---------- the rig ---------- */

export const Puppet: React.FC<{ pose: Pose; look: Look; position?: V3; yaw?: number; scale?: number; visible?: boolean; mirror?: boolean }> = ({
  pose, look: C, position, yaw = 0, scale = 1, visible = true, mirror = false,
}) => {
  const ph = pose.walk * Math.PI * 2;
  const swing = Math.sin(ph) * 0.46 * pose.stride;
  const bob = ((1 - Math.cos(ph * 2)) / 2) * 0.08 * pose.stride;
  const sway = Math.sin(ph) * 0.03 * pose.stride;
  const eyeX = pose.look[0] * 0.08, eyeY = pose.look[1] * 0.06;
  const blink = Math.max(0.12, 1 - pose.blink);
  const headSec = Math.sin(ph * 2 - 0.6) * 0.025 * pose.stride;
  const sitDrop = pose.sit * 0.72;
  const legSit = -pose.sit * 1.25;
  const carry = pose.carry;
  return (
    <group position={position} rotation={[0, yaw, 0]} scale={[mirror ? -scale : scale, scale, scale]} visible={visible}>
      <group position={[0, bob - sitDrop, 0]} rotation={[pose.lean, 0, sway]}>
        {([-1, 1] as const).map((side) => (
          <Hinge key={side} at={[side * 0.3, 1.45, -0.03]} axis="x" angle={side * swing * (1 - pose.sit) + legSit}>
            <Cut shape={leg} color={C.legs} position={[side * 0.3, 0.18, -0.03]} />
            <Cut shape={shoe} color={C.shoes} position={[side * 0.31, 0.15, 0.06]} depth={0.1} />
          </Hinge>
        ))}
        <Cut shape={coat} color={C.coat} />
        <Cut shape={hem} color={C.coatDeep} position={[0, 1.28, 0.045]} depth={0.03} />
        <Cut shape={placket} color={C.trim} position={[0, 1.4, 0.045]} depth={0.03} />
        <Cut shape={belt} color={C.coatDeep} position={[0, 2.05, 0.05]} depth={0.03} />
        <Cut shape={belt} color={C.coatDeep} position={[0, 2.05, -0.05]} depth={0.03} />
        <Cut shape={collarL} color={C.collar} position={[0, 0, 0.05]} depth={0.04} />
        <Cut shape={collarR} color={C.collar} position={[0, 0, 0.05]} depth={0.04} />
        <Cut shape={neck} color={C.skin} position={[0, 3.3, -0.01]} />

        {/* sack on the right shoulder (puppet's +x), steadied by the raised right arm */}
        {carry > 0.01 ? (
          <group position={[0.92, 3.95 - (1 - carry) * 1.6, -0.12]} rotation={[0, 0, -1.45 * carry]} scale={0.9}>
            <Sack />
          </group>
        ) : null}

        {([-1, 1] as const).map((side) => {
          const i = side < 0 ? 0 : 1;
          const fwd = -side * swing * 0.85 * (1 - (i === 1 ? carry : 0)) * (1 - (i === 0 ? pose.lantern * 0.6 : 0)) + pose.armFwd[i];
          const out = pose.armOut[i] + (i === 1 ? carry * 2.55 : 0) + (i === 0 ? pose.lantern * 0.12 : 0);
          return (
            <group key={side} position={[side * 0.76, 3.18, 0.1]} rotation={[-fwd, 0, side * (0.1 + out)]}>
              <Cut shape={sleeve} color={C.coat} />
              <Cut shape={cuff} color={C.collar} position={[0, -1.12, 0.04]} depth={0.04} />
              <Cut shape={hand} color={C.skin} position={[0, -1.36, 0.02]} />
              {i === 0 && pose.lantern > 0.01 ? (
                <group rotation={[fwd, 0, -side * (0.1 + out), "ZYX"]} position={[0, -1.4, 0.05]}>
                  <Lantern glow={pose.lantern} />
                </group>
              ) : null}
            </group>
          );
        })}

        <group position={[0, 3.62, 0]} rotation={[pose.headNod + headSec, 0, pose.headTilt]}>
          <group position={[0, -3.62, 0]}>
            {C.hat === "kerudung" ? (
              <Cut shape={kerudung} color={C.hatColor ?? C.hair} position={[0, 0, -0.08]} />
            ) : C.hairStyle === "bob" ? (
              <Cut shape={bobBack} color={C.hair} position={[0, 0, -0.07]} />
            ) : (
              <Cut shape={shortBack} color={C.hair} position={[0, 0, -0.07]} />
            )}
            <Cut shape={head} color={C.skin} position={[0, 4.72, 0.03]} />
            {C.hat === "kerudung" ? (
              <Cut shape={S.frame("rect", 2.9, 2.6, "arch", 1.96, 2.06, 0.25)} color={C.hatColor ?? C.hair} position={[0, 3.62, 0.1]} depth={0.05} />
            ) : C.hairStyle === "bob" ? (
              <Cut shape={bobFringe} color={C.hair} position={[0, 0, 0.1]} />
            ) : (
              <Cut shape={shortFringe} color={C.hair} position={[0, 0, 0.1]} />
            )}
            {C.hat === "peci" ? (
              <>
                <Cut shape={peci} color={C.hatColor ?? "#26201f"} position={[0, 0, 0.14]} depth={0.05} />
                <Cut shape={peci} color={C.hatColor ?? "#26201f"} position={[0, 0, -0.13]} depth={0.05} />
              </>
            ) : null}
            {C.hat === "iket" ? (
              <>
                <Cut shape={iket} color={C.hatColor ?? "#a3542f"} position={[0, 5.12, 0.14]} depth={0.05} />
                <Cut shape={iket} color={C.hatColor ?? "#a3542f"} position={[0, 5.12, -0.12]} depth={0.05} />
                <Cut shape={iketKnot} color={C.hatColor ?? "#a3542f"} position={[0.95, 5.1, -0.16]} depth={0.04} />
              </>
            ) : null}
            {[-1, 1].map((side) => (
              <group key={side} position={[side * 0.4 + eyeX, 4.55 + eyeY, 0.08]} scale={[1, blink, 1]}>
                <Cut shape={eye} color={C.ink} depth={0.03} />
                {pose.blink < 0.5 ? <Cut shape={glint} color="#faf4e8" position={[0.035, 0.06, 0.02]} depth={0.02} /> : null}
              </group>
            ))}
            {[-1, 1].map((side) => (
              <Cut key={`b${side}`} shape={brow} color={C.hair} position={[side * 0.4, 4.86 + pose.tears * 0.03, 0.085]} rotation={[0, 0, side * (-0.12 - pose.tears * 0.25)]} depth={0.02} />
            ))}
            {[-1, 1].map((side) => (
              <Cut key={side} shape={cheek} color={C.cheek} position={[side * 0.7, 4.2, 0.075]} depth={0.02} />
            ))}
            {C.moustache ? <Cut shape={moustache} color={C.hair} position={[0, 0, 0.09]} depth={0.03} /> : null}
            {pose.talk > 0.05 ? (
              <group position={[0, 4.05, 0.085]} scale={[0.75 + pose.talk * 0.25, 0.35 + pose.talk * 0.75, 1]}>
                <Cut shape={mouthO} color={C.ink} depth={0.02} />
              </group>
            ) : pose.smile > 0.5 ? (
              <Cut shape={smileShape} color={C.ink} position={[0, 4.08, 0.08]} depth={0.02} />
            ) : (
              <Cut shape={mouthFlat} color={C.ink} position={[0, 4.06, 0.08]} depth={0.02} />
            )}
            {pose.tears > 0.02
              ? [-1, 1].map((side) => (
                  <Cut key={`t${side}`} shape={tear} color="#cfe8ff" position={[side * 0.42, 4.38 - pose.tears * 0.32, 0.1]} depth={0.03} opts={{ emissive: "#bfe0ff", emissiveIntensity: 0.6 }} cast={false} />
                ))
              : null}
          </group>
        </group>
      </group>
    </group>
  );
};

/* ---------- the cast ---------- */

export const KAKAK: Look = {
  coat: "#c98f3a", coatDeep: "#8a5a2a", collar: "#f1e2c2", trim: "#7a4a26", legs: "#3f4a3c", shoes: "#3a2a22",
  hair: "#2b211d", skin: "#e8bf98", ink: "#2e211b", cheek: "#e09a7c", hairStyle: "short", hat: "peci", moustache: true,
};
export const ADIK: Look = {
  coat: "#d0684b", coatDeep: "#9c4634", collar: "#f6e9cf", trim: "#f6e9cf", legs: "#33415e", shoes: "#3a2a22",
  hair: "#2f2420", skin: "#efcaa6", ink: "#2e211b", cheek: "#ec9f86", hairStyle: "short", hat: "iket", hatColor: "#e9d6a8",
};
export const ISTRI: Look = {
  coat: "#6f9f8a", coatDeep: "#4c7766", collar: "#f6e9cf", trim: "#f6e9cf", legs: "#7a4a3a", shoes: "#3a2a22",
  hair: "#2b211d", skin: "#ebc39d", ink: "#2e211b", cheek: "#ec9f86", hairStyle: "bob", hat: "kerudung", hatColor: "#e9dcc0",
};
export const ANAK: Look[] = [
  { coat: "#5f7cb6", coatDeep: "#435e95", collar: "#faf4e8", trim: "#faf4e8", legs: "#7d5843", shoes: "#3a2a22", hair: "#2b211d", skin: "#efcaa6", ink: "#2e211b", cheek: "#ec9f86", hairStyle: "short" },
  { coat: "#e7b54a", coatDeep: "#c38f2b", collar: "#faf4e8", trim: "#faf4e8", legs: "#a3542f", shoes: "#3a2a22", hair: "#2b211d", skin: "#ebc39d", ink: "#2e211b", cheek: "#ec9f86", hairStyle: "bob" },
  { coat: "#e3806a", coatDeep: "#c4614f", collar: "#faf4e8", trim: "#faf4e8", legs: "#435e95", shoes: "#3a2a22", hair: "#3a2a22", skin: "#efcaa6", ink: "#2e211b", cheek: "#ec9f86", hairStyle: "short" },
];
