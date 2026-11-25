// EP09 (CINESTORY): drop-in replacement for ToyPerson using the CINESTORY character rig (fabric, skin sheen,
// stylized generic faces). Same props as the ToyPerson calls in EP09 so the scenes stay unchanged.
// Generic people only: no likeness of the real athletes.
import React from "react";
import { Character } from "./Character.tsx";
import { lookSpec } from "./looks.ts";
import { restPose, walkCycle, type Pose } from "./pose.ts";

type V3 = [number, number, number];
export type CinePose = "stand" | "walk" | "sit" | "cheer" | "wave";
export type CineLook = { top?: string; bottom?: string; cap?: string; tee?: boolean; hairStyle?: number; outfit?: string };

/** World height of a person ≈ 1.8 m × S; matches the old toy figure next to the 2 m sled. */
export const PERSON_SCALE = 0.6;
const SKINS = ["#7a4a30", "#6a3f28", "#8a5636", "#5c3622", "#9a6440"];
const HAIR = ["crop", "bald", "crop", "messy"] as const;

const poseFor = (name: CinePose, f: number, seed: number): Pose => {
  const t = f / 60;
  const p = restPose();
  const swing = Math.sin(t * 7 + seed);
  if (name === "walk") return walkCycle(p, t * 0.95 + seed * 0.37, 1);
  if (name === "cheer") {
    p.armL = { ...p.armL, sw: 2.75 + 0.12 * swing, ab: 0.35, el: 0.35 };
    p.armR = { ...p.armR, sw: 2.75 - 0.12 * swing, ab: 0.35, el: 0.35 };
    p.handL = p.handR = { curl: 1, index: 1, thumb: 0.8 };
    p.face = { ...p.face, mouth: 0.9, open: 0.45, browUp: 0.6 };
    p.chest = [-0.08, 0, 0];
    p.hipY = 0.02 * Math.max(0, swing);
  } else if (name === "wave") {
    p.armR = { ...p.armR, sw: 2.3, ab: 0.55, el: 0.7 + 0.25 * swing, wr: [0, 0, 0.3 * swing] };
    p.handR = { curl: 0, index: 0, thumb: 0 };
    p.face = { ...p.face, mouth: 0.7, open: 0.15 };
  } else if (name === "sit") {
    p.hipY = -0.46;
    p.legL = { ...p.legL, sw: 1.45, kn: 1.5, an: 0.1 };
    p.legR = { ...p.legR, sw: 1.35, kn: 1.45, an: 0.1 };
    p.spine = [0.18, 0, 0];
    p.armL = { ...p.armL, sw: 0.5, el: 1.1 };
    p.armR = { ...p.armR, sw: 0.5, el: 1.1 };
    p.face = { ...p.face, mouth: -0.4, browIn: 0.7 };
  }
  return p;
};

export const CinePerson: React.FC<{ f: number; seed?: number; pose?: CinePose; look?: CineLook; position?: V3; heading?: number }> = ({ f, seed = 1, pose = "stand", look = {}, position = [0, 0, 0], heading = 0 }) => {
  const spec = React.useMemo(
    () =>
      lookSpec(`ep09-${seed}`, "pemuda", {
        skin: SKINS[seed % SKINS.length],
        hairStyle: look.cap ? "crop" : HAIR[seed % HAIR.length],
        top: look.tee ? "tee" : "jacket",
        topColor: look.top ?? "#2b3f66",
        trim: look.cap ?? "#eceae4",
        legs: look.bottom ?? "#2c2f36",
        feet: "shoe",
        sandal: "#1a1a1a",
        cap: look.cap,
        scale: 1,
        face: { jaw: 0.35 + (seed % 5) * 0.1, cheek: 0.45, nose: 0.4 + (seed % 3) * 0.1, brow: 0.55, chin: 0.45 },
      }),
    [seed, look.top, look.bottom, look.cap, look.tee],
  );
  const p = poseFor(pose, f, seed);
  const sitDrop = pose === "sit" ? -(0.96 + p.hipY) * PERSON_SCALE : 0;
  return (
    <group position={[position[0], position[1] + sitDrop, position[2]]} rotation={[0, heading, 0]} scale={PERSON_SCALE}>
      <Character pose={p} spec={spec} t={f / 60} />
    </group>
  );
};
