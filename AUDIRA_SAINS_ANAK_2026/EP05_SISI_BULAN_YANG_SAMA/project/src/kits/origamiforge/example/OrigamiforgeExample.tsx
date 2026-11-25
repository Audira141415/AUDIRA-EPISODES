// ORIGAMIFORGE technical example (12 s): one square of washi folds into a crane.
//
// 0.1–1.4   hook: the diagonal valley-folds over and opens again, leaving the crease
// 1.5–3.0   kite folds: both edges to the diagonal (the printed side appears)
// 3.05–4.45 fold in half, then the paper stands up on its spine
// 4.55–6.3  outside-reverse folds: tail, neck, head
// 6.4–7.15  wings fold out; the crane starts to flap
// 7.5–8.7   the AUDIRA tent card folds up beside it
// 9.5–12    the crane lifts off the mat under a high three-quarter reveal

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { Studio3D } from "../scene/Studio3D.tsx";
import { getOrigamiforgeCamera, ORIGAMIFORGE_SECONDS } from "../camera/rig.ts";
import { OrigamiforgeOverlay } from "../camera/Overlay.tsx";
import { ORIGAMI_GRADE, ORIGAMI_PALETTE as P } from "../lib/palette.ts";

export const ORIGAMIFORGE_EXAMPLE_SECONDS = ORIGAMIFORGE_SECONDS;

export const OrigamiforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shot = getOrigamiforgeCamera(t);
  return (
    <FilmScene
      frame={frame}
      shot={{ pos: shot.pos, target: shot.target, fov: shot.fov, roll: shot.roll }}
      background={P.bg}
      profile={ORIGAMI_GRADE}
      hdri="studio"
      envIntensity={0.35}
      near={0.02}
      far={40}
      focus={shot.focus}
      aperture={0.0016}
      maxBlur={0.004}
      overlay={() => <OrigamiforgeOverlay t={t} />}
    >
      <hemisphereLight args={["#FFF1DE", "#3A3634", 0.75]} />
      {/* Soft window key from the front left: long, clean shadows that model every fold */}
      <directionalLight
        position={[-2.0, 3.0, 1.7]}
        intensity={4.2}
        color={P.key}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-1.4}
        shadow-camera-right={1.4}
        shadow-camera-top={1.4}
        shadow-camera-bottom={-1.4}
        shadow-bias={-0.0002}
        shadow-normalBias={0.004}
      />
      <directionalLight position={[2.5, 1.6, 2.2]} intensity={0.7} color={P.fill} />
      {/* Cool rim from behind: lights the cut edges and lifts the crane off the backdrop */}
      <directionalLight position={[1.8, 1.8, -2.6]} intensity={1.3} color={P.rim} />
      <pointLight position={[0, 1.6, -1.2]} intensity={1.2} distance={3} color="#FFD9AE" />
      <Studio3D t={t} />
    </FilmScene>
  );
};
