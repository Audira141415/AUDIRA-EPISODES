// PAINTERLY technical example (12 s): a hand-painted 3D landscape at golden hour.
//
// 0–1.6     hook: low in the wind-blown grass on the painted AUDIRA sign; the traveller sets off
// 1.6–4.8   the camera swings past the sign and follows the traveller up the path to the tree
// 4.8–6.4   past the leaf-dab crown, the bay opens: sea glitter, cliff village, lighthouse
// 6.4–9.6   across the bay to the village while the lamp turns and the clouds drift
// 9.6–12    crane up and back: wide reveal of the whole painting, traveller on the crest

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { Landscape3D } from "../scene/Landscape3D.tsx";
import { getPainterlyCamera, PAINTERLY_SECONDS } from "../camera/rig.ts";
import { PainterlyOverlay } from "../camera/Overlay.tsx";
import { PAINTERLY_GRADE, PAINT as P } from "../lib/palette.ts";

export const PAINTERLY_EXAMPLE_SECONDS = PAINTERLY_SECONDS;

export const PainterlyExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shot = getPainterlyCamera(t);
  // painted shading is flat by design: no env reflections, no AO (it smears the stroke cards)
  return (
    <FilmScene
      frame={frame}
      shot={{ pos: shot.pos, target: shot.target, fov: shot.fov, roll: shot.roll }}
      background={P.bg}
      profile={PAINTERLY_GRADE}
      envIntensity={0}
      ao={false}
      near={0.03}
      far={900}
      overlay={() => <PainterlyOverlay t={t} />}
    >
      <Landscape3D t={t} />
    </FilmScene>
  );
};
