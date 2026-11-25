// PASIRFORGE technical example (12 s): a sand sculpture on a beach at golden hour, built and unbuilt
// by time.
//
// 0.0–5.0   hook + forming: grains lift off a heap and arc onto the rising lid; the plinth (with
//           AUDIRA carved in front), the penyu and the candi-like gate climb out of the sand
// 5.0–6.6   finished: crisp carved edges, trowel marks, low raking sun
// 6.6–11.7  erosion: edges round and sag, crowns crumble, clumps avalanche and grains trickle into
//           an apron at the base, wind strips a veil of dust off the tops
// 10.25–12  a swash runs up the beach to the plinth under a wide golden-hour reveal

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { SandMonument3D } from "../scene/SandMonument3D.tsx";
import { getPasirforgeCamera, PASIRFORGE_SECONDS } from "../camera/rig.ts";
import { PasirforgeOverlay } from "../camera/Overlay.tsx";
import { PASIR_GRADE, PASIR_PALETTE as P, sunDir } from "../lib/palette.ts";

export const PASIRFORGE_EXAMPLE_SECONDS = PASIRFORGE_SECONDS;

export const PasirforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shot = getPasirforgeCamera(t);
  const sun = sunDir(t);
  const late = t / 12;
  const sunPos: [number, number, number] = [sun[0] * 14, sun[1] * 14, sun[2] * 14];
  return (
    <FilmScene
      frame={frame}
      shot={{ pos: shot.pos, target: shot.target, fov: shot.fov, roll: shot.roll }}
      background={P.bg}
      profile={PASIR_GRADE}
      hdri="sky"
      envIntensity={0.3}
      near={0.03}
      far={800}
      focus={shot.focus}
      aperture={0}
      maxBlur={0}
      overlay={() => <PasirforgeOverlay t={t} />}
    >
      <hemisphereLight args={["#8FAEE0", "#B9845A", 0.7 - late * 0.12]} />
      {/* Low golden sun from the left: rakes across the carved front, long shadows to the right */}
      <directionalLight
        position={sunPos}
        intensity={3.6 - late * 0.6}
        color={late > 0.6 ? "#FFA85E" : P.sun}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
      {/* Cool sky bounce from the right and a warm sea bounce from behind */}
      <directionalLight position={[6, 4, 5]} intensity={0.32} color={P.fill} />
      <directionalLight position={[0, 1.5, -8]} intensity={0.45} color="#FFC9A0" />
      <fog attach="fog" args={[P.horizon, 40, 260]} />
      <SandMonument3D t={t} />
    </FilmScene>
  );
};
