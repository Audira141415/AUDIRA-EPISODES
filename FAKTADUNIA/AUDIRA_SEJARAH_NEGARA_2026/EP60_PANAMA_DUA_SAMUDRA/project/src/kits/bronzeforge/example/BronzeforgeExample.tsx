// BRONZEFORGE technical example (12 s): a bronze casting from pour to monument.
// Runs on FilmScene with the kit's BRONZE_GRADE colour profile and warm studio HDRI
// for convincing metal reflections.
//
// 0.0–2.75  hook: molten bronze pours from the crucible into the sand mould, sparks, glowing seam
// 2.75–3.4  the crucible lifts away, the stream's tail falls
// 3.25–4.15 the mould splits and falls away: the casting glows white-orange
// 4.2–6.2   it cools, thin wings first, to a dark as-cast skin; embers rise
// 6.0–7.6   a polishing front sweeps down: bright bronze
// 7.7–10.3  patina: brown body, verdigris spreading from the crevices, rubbed gold edges
// 10.3–12   monument: heroic low three-quarter, the AUDIRA plaque on the granite plinth

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { Foundry3D } from "../scene/Foundry3D.tsx";
import { getBronzeforgeCamera, BRONZEFORGE_SECONDS } from "../camera/rig.ts";
import { BronzeforgeOverlay } from "../camera/Overlay.tsx";
import { BRONZE_GRADE, BRONZE_PALETTE as P } from "../lib/palette.ts";

export const BRONZEFORGE_EXAMPLE_SECONDS = BRONZEFORGE_SECONDS;

export const BronzeforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shot = getBronzeforgeCamera(t);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: shot.pos, target: shot.target, fov: shot.fov }}
      background={P.bg}
      profile={BRONZE_GRADE}
      hdri="warmStudio"
      envIntensity={0.95}
      ao
      aoRadius={0.2}
      near={0.02}
      far={40}
      overlay={() => <BronzeforgeOverlay t={t} />}
    >
      <KeyLight extent={5} keyPos={[-5, 7, 3]} keyIntensity={2.0} fill={0.5} rim="#c8956c" rimIntensity={0.4} />
      <Foundry3D t={t} />
    </FilmScene>
  );
};
