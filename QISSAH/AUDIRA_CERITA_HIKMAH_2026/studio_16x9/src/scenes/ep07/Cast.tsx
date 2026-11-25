// EP07 cast on the episode copy of ToyPerson (Person7: moods, speech mouth, receives shadows).
// Jack: pale shirt that reads in the dark. Bobby: traffic policeman, dark uniform, white belt,
// peaked cap with badge, a stern face (never the built-in smile).
import React from "react";
import { ToyPerson, poseAt, LEG_LENGTH, type Look, type Pose, type PoseName } from "./Person7";
import { POLISH } from "../../core/polish/Polish.tsx";
import type { V3 } from "./layout";

export const JACK_LOOK: Partial<Look> = {
  skin: "#d09a6c", hair: "#1b1411", top: "#d6d2c8", bottom: "#24252a", outfit: "casual", hairStyle: 0, build: 1.0, height: 1.0,
};
export const BOBBY_LOOK: Partial<Look> = {
  skin: "#b47a52", hair: "#1b1411", top: "#3b3a37", bottom: "#1d1e22", outfit: "casual", hairStyle: 3, build: 1.08, height: 1.02,
};

const PoliceCap: React.FC = () => (
  <group position={[0, 0.085, 0]}>
    <mesh position={[0, 0.045, 0]}>
      <cylinderGeometry args={[0.135, 0.125, 0.07, 24]} />
      <meshPhysicalMaterial {...POLISH.fabric} color="#24252a" />
    </mesh>
    <mesh position={[0, 0.09, -0.005]} scale={[1, 0.28, 1.08]}>
      <sphereGeometry args={[0.15, 24, 12]} />
      <meshPhysicalMaterial {...POLISH.fabric} color="#2b2c31" />
    </mesh>
    <mesh position={[0, 0.02, 0.11]} rotation={[0.35, 0, 0]} scale={[1, 0.12, 0.6]}>
      <sphereGeometry args={[0.12, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#060607" roughness={0.12} metalness={0.3} />
    </mesh>
    <mesh position={[0, 0.07, 0.135]}>
      <circleGeometry args={[0.025, 16]} />
      <meshStandardMaterial color="#e8dfc8" metalness={1} roughness={0.25} />
    </mesh>
  </group>
);

/** Hand-keyed poses for this story, built on the core "stand"/"sit" base. */
export type ActName = PoseName | "armsOpen" | "write" | "gesture" | "drive" | "holdNote" | "bow" | "lookAround" | "whistle" | "handOut";
export const actPose = (act: ActName, f: number, seed: number): { pose: PoseName; over?: Pose } => {
  const t = f / 60;
  const stand = poseAt("stand", f, seed);
  const sit = poseAt("sit", f, seed);
  const seated: Pose = { ...sit, lh: [-1.45, 0, 0.06], lk: 1.4, rh: [-1.45, 0, -0.06], rk: 1.4 };
  switch (act) {
    case "armsOpen":
      return { pose: "stand", over: { ...stand, head: [-0.05, 0, 0], ls: [-0.35, 0, 1.15], le: -0.25, rs: [-0.35, 0, -1.15], re: -0.25 } };
    case "write":
      return { pose: "stand", over: { ...stand, head: [0.42, 0, 0], ls: [-1.05, 0.2, 0.25], le: -0.95, rs: [-0.95, -0.2, -0.3], re: -1.15 + Math.sin(t * 9) * 0.08 } };
    case "gesture": {
      const g = Math.sin(t * 3.1);
      return { pose: "stand", over: { ...stand, rs: [-0.55 + g * 0.12, 0, -0.25], re: -1.0 + g * 0.25, ls: [-0.2, 0, 0.2], le: -0.5 } };
    }
    case "handOut":
      return { pose: "stand", over: { ...stand, rs: [-1.15, 0, -0.15], re: -0.25 } };
    case "drive":
      return { pose: "sit", over: { ...seated, head: [0.02, Math.sin(t * 0.7) * 0.06, 0], ls: [-1.05, 0, 0.18], le: -0.55, rs: [-1.05, 0, -0.18], re: -0.55 } };
    case "holdNote":
      return { pose: "sit", over: { ...seated, head: [0.42, 0, 0], ls: [-0.85, 0, 0.22], le: -1.35, rs: [-0.85, 0, -0.22], re: -1.35 } };
    case "bow":
      return { pose: "stand", over: { ...stand, head: [0.5, 0, 0], spine: [0.08, 0, 0], ls: [0, 0, 0.08], rs: [0, 0, -0.08] } };
    case "lookAround":
      return { pose: "stand", over: { ...stand, head: [0, Math.sin(t * 1.4) * 0.8, 0] } };
    case "whistle":
      return { pose: "stand", over: { ...stand, head: [-0.08, 0.2, 0], rs: [-0.15, 0, -2.5], re: -0.35 + Math.sin(t * 10) * 0.3, ls: [-1.2, 0, 0.2], le: -1.9 } };
    default:
      return { pose: act };
  }
};

export const Figure: React.FC<{
  who: "jack" | "bobby";
  f: number;
  act?: ActName;
  position: V3;
  heading: number;
  scale?: number;
  mood?: "smile" | "stern" | "sad" | "shock";
  talk?: number;
}> = ({ who, f, act = "stand", position, heading, scale = 1.65, mood, talk = 0 }) => {
  const look = who === "jack" ? JACK_LOOK : BOBBY_LOOK;
  const seed = who === "jack" ? 21 : 34;
  const { pose, over } = actPose(act, f, seed);
  const p = over ?? poseAt(pose, f, seed);
  const s = scale * (look.height ?? 1);
  return (
    <group>
      <ToyPerson
        f={f} seed={seed} pose={pose} poseOverride={over} look={look} position={position} heading={heading} scale={scale}
        mood={mood ?? (who === "bobby" ? "stern" : "smile")} talk={talk}
        hat={who === "bobby" ? <PoliceCap /> : undefined}
      />
      {who === "bobby" && (
        <group position={position} rotation={[0, heading, 0]} scale={s}>
          <group position={[0, p.lift, 0]} rotation={p.body}>
            <mesh position={[0, 0.03, 0]}>
              <cylinderGeometry args={[0.112 * (look.build ?? 1), 0.112 * (look.build ?? 1), 0.035, 24]} />
              <meshStandardMaterial color="#e9e6de" roughness={0.4} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
};

export { LEG_LENGTH };
