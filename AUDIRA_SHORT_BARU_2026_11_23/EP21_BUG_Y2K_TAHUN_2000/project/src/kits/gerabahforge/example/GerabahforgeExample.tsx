// GERABAHFORGE technical example (12 s): Nusantara pottery from wet clay to fired, glazed piece.
//
// 0–1.0     hook: a lump of wet clay wobbles on the wheel at 240 rpm, the rib centres it
// 1.0–1.8   the lump is opened
// 1.9–4.1   three pulls raise the walls into a vase (throwing rings as real ridges)
// 4.1–5.0   the wheel spins down; the clay dries pale and matte
// 5.05–6.6  a teal glaze is poured over the shoulder and runs down in drips; the foot stays bare
// 6.9–7.85  AUDIRA is brushed on in cream slip, letter by letter
// 7.95–9.7  the kiln fires: the piece glows, then cools glossy with crackle; the foot turns terracotta
// 9.7–12    three-quarter reveal: the vase, the terracotta rack, the glowing kiln

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { Studio3D } from "../scene/Studio3D.tsx";
import { getGerabahforgeCamera, GERABAHFORGE_SECONDS } from "../camera/rig.ts";
import { GerabahforgeOverlay } from "../camera/Overlay.tsx";
import { GERABAH_GRADE, GERABAH_PALETTE as P } from "../lib/palette.ts";

export const GERABAHFORGE_EXAMPLE_SECONDS = GERABAHFORGE_SECONDS;

export const GerabahforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shot = getGerabahforgeCamera(t);
  return (
    <FilmScene
      frame={frame}
      shot={{ pos: shot.pos, target: shot.target, fov: shot.fov }}
      background={P.bg}
      profile={GERABAH_GRADE}
      hdri="warmStudio"
      envIntensity={0.7}
      ao
      near={0.02}
      far={40}
      focus={shot.focus}
      aperture={0.0016}
      maxBlur={0.005}
      overlay={() => <GerabahforgeOverlay t={t} />}
    >
      <hemisphereLight args={["#FFE2C4", "#2A1810", 0.32]} />
      {/* Window key from the front-right: soft, warm, long shadows across the floor */}
      <directionalLight
        position={[2.2, 2.8, 2.0]}
        intensity={3.0}
        color={P.key}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-1}
        shadow-bias={-0.0004}
        shadow-normalBias={0.01}
      />
      <directionalLight position={[-2.5, 1.6, 2.2]} intensity={0.45} color={P.fill} />
      {/* Back rim so the wet clay and the glaze catch an edge highlight */}
      <directionalLight position={[-0.8, 2.2, -2.5]} intensity={1.4} color="#FFC890" />
      <Studio3D t={t} />
    </FilmScene>
  );
};
