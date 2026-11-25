// PLUSHFORGE technical example (12 s): plush fabric toys (boneka kain) on a cosy bed.
//
// 0.0–1.1   hook: the honey bear drops into frame and lands with a soft squash, the quilt dents
// 1.25–2.3  the lilac bunny tumbles in beside it and rebounds
// 2.5–4.4   soft hops: crouch, stretch, land, ears and heads jiggle on springs
// 4.5–6.45  both wave (outer arms), ears flop
// 6.5–8.6   they hug (turn in, arms round, stuffing presses), then sit close in a side hug
// 8.85–10.5 the needle sews the last seam of the bear's felt heart: JAHITAN 6/6
// 10.55–12  pull out to a high three-quarter reveal: quilt, pillows, AUDIRA embroidered pillow
//
// FilmScene handles canvas, PoseCamera, font loading, and the opaque backdrop.
// Kit keeps its own craft lighting rig (5 lights) and Finish profile (PLUSH_GRADE + DoF).

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { Bedroom3D } from "../scene/Bedroom3D.tsx";
import { getPlushforgeCamera, PLUSHFORGE_SECONDS } from "../camera/rig.ts";
import { PlushforgeOverlay } from "../camera/Overlay.tsx";
import { PLUSH_GRADE, PLUSH_PALETTE as P } from "../lib/palette.ts";

export const PLUSHFORGE_EXAMPLE_SECONDS = PLUSHFORGE_SECONDS;

export const PlushforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shot = getPlushforgeCamera(t);
  return (
    <FilmScene
      frame={frame}
      shot={{ pos: shot.pos, target: shot.target, fov: shot.fov }}
      background={P.bg}
      profile={PLUSH_GRADE}
      hdri="warmStudio"
      envIntensity={0.45}
      near={0.02}
      far={40}
      focus={shot.focus}
      aperture={0.0018}
      maxBlur={0.006}
      overlay={() => <PlushforgeOverlay t={t} />}
    >
      <hemisphereLight args={["#FFE6CC", "#2A2030", 0.38]} />
      {/* Warm lamp key from the front left: soft shadows under the toys */}
      <directionalLight
        position={[-2.0, 2.8, 2.4]}
        intensity={2.3}
        color={P.key}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-1.8}
        shadow-camera-right={1.8}
        shadow-camera-top={1.8}
        shadow-camera-bottom={-1.8}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      {/* Moonlight rim from behind right: makes the plush pile glow at the edges */}
      <directionalLight position={[2.2, 1.9, -2.6]} intensity={1.7} color={P.rim} />
      <directionalLight position={[2.6, 1.0, 2.0]} intensity={0.35} color={P.fill} />
      <pointLight position={[0, 0.85, -1.05]} intensity={1.2} distance={2.6} decay={2} color={P.bulb} />
      <pointLight position={[-1.75, 0.35, -0.75]} intensity={1.6} distance={2.4} decay={2} color="#FFC98A" />
      <Bedroom3D t={t} />
    </FilmScene>
  );
};
