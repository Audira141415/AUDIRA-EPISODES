// Athlete = ToyPerson in a team kit, driven by a sport action (poses.ts).
//
//   <Athlete f={f} action="dribble" team={TEAMS.harbour} number={10} position={p} heading={h} />
//   <Athlete f={f} action="kick" u={seg(t, 2.0, 2.8)} team={TEAMS.harbour} number={9} ... />
//   <Athlete f={f} action="keeperDive" u={k} side={-1} team={TEAMS.valley} keeper ... />
//   <Athlete f={f} action="serve" u={k} rightHand={<Racket kind="tennis" />} ... />

import React from "react";
import { ToyPerson, type Look } from "../polish/Person.tsx";
import { sportPose, type Action } from "./poses.ts";
import type { Team } from "./specs.ts";

type V3 = [number, number, number];

export const Athlete: React.FC<{
  f: number;
  action: Action;
  /** One-shot progress 0..1 (ignored by cyclic actions). */
  u?: number;
  seed?: number;
  /** -1 mirrors the action (left foot, dive right, left-handed). */
  side?: 1 | -1;
  team?: Team;
  /** Goalkeeper shirt colour from the team. */
  keeper?: boolean;
  number?: number;
  position?: V3;
  heading?: number;
  scale?: number;
  look?: Partial<Look>;
  rightHand?: React.ReactNode;
  leftHand?: React.ReactNode;
  shadows?: boolean;
}> = ({ f, action, u = 0, seed = 1, side = 1, team, keeper = false, number, position = [0, 0, 0], heading = 0, scale = 1, look, rightHand, leftHand, shadows = true }) => {
  const { pose, offset } = sportPose(action, { f, u, seed, side });
  // Offset is in the figure's own frame and units: rotate by heading, scale by size.
  const c = Math.cos(heading);
  const s = Math.sin(heading);
  const k = scale;
  const p: V3 = [position[0] + (offset[0] * c + offset[2] * s) * k, position[1] + offset[1] * k, position[2] + (-offset[0] * s + offset[2] * c) * k];
  const kit: Partial<Look> = team
    ? { top: keeper ? team.keeper : team.top, bottom: team.bottom, socks: keeper ? team.keeper : team.socks, shoes: team.shoes }
    : {};
  return (
    <ToyPerson
      f={f}
      seed={seed}
      outfit="sport"
      poseOverride={pose}
      look={{ hairStyle: seed % 3 === 0 ? 1 : 0, height: 1, ...kit, number, ...look }}
      position={p}
      heading={heading}
      scale={scale}
      shadows={shadows}
      rightHand={rightHand}
      leftHand={leftHand}
    />
  );
};
