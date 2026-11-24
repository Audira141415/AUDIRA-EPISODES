// RAJUTFORGE technical example (12 s): crochet / amigurumi.
//
// 0.0–2.6   hook: a close-up of the hook working the open rim of a ginger cat's head, stitch by stitch
// 2.6–6.0   rounds race up the head (PUTARAN 7 → 20) as the ball unrolls; the crown closes
// 6.0–7.0   ears, safety eyes, muzzle, nose and cheeks pop on; the hook travels to the label
// 7.0–9.45  the hook couches AUDIRA in teal crochet cord on a cream crocheted label
// 9.45–12   the hook is laid down; the cat tilts its head and waves (three-quarter reveal)
//
// FilmScene handles canvas, PoseCamera, font loading, and the opaque backdrop.
// Kit keeps its own craft lighting rig (3 directional lights) and Finish profile (RAJUT_GRADE + DoF).

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { CraftTable3D } from "../scene/CraftTable3D.tsx";
import { getRajutforgeCamera, RAJUTFORGE_SECONDS } from "../camera/rig.ts";
import { RajutforgeOverlay } from "../camera/Overlay.tsx";
import { RAJUT_GRADE, RAJUT_PALETTE as P } from "../lib/palette.ts";

export const RAJUTFORGE_EXAMPLE_SECONDS = RAJUTFORGE_SECONDS;

export const RajutforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shot = getRajutforgeCamera(t);
  return (
    <FilmScene
      frame={frame}
      shot={{ pos: shot.pos, target: shot.target, fov: shot.fov }}
      background={P.bg}
      profile={RAJUT_GRADE}
      hdri="warmStudio"
      envIntensity={0.45}
      near={0.02}
      far={40}
      focus={shot.focus}
      aperture={0.0035}
      maxBlur={0.01}
      overlay={() => <RajutforgeOverlay t={t} />}
    >
      <hemisphereLight args={["#FFE6CC", "#3A2418", 0.42]} />
      {/* Warm window key from the front-left: soft shadows that model every stitch */}
      <directionalLight
        position={[-2.4, 3.0, 2.2]}
        intensity={3.0}
        color={P.key}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      {/* Cool back rim: lights the fibre fuzz around every silhouette */}
      <directionalLight position={[2.2, 2.0, -3.0]} intensity={2.2} color={P.rim} />
      <directionalLight position={[3, 0.8, 2.5]} intensity={0.45} color={P.fill} />
      <CraftTable3D t={t} />
    </FilmScene>
  );
};
