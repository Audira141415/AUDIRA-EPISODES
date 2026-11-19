// INFLATABLE technical example (12 s): glossy vinyl toys in a candy studio.
//
// 0.35–1.4  hook: a flat, empty star puffs up, stands and hops
// 1.45–3.0  a heart and a beach ball drop in and bounce; the swim ring fills; a cloud floats down
// 3.9–7.6   six balloon letters lie flat, then fill and stand up one by one: AUDIRA
// 8.3–9.4   a hop runs along the word
// 9.4–12    high three-quarter reveal of the playroom

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { Playroom3D, WORD, letterAt } from "../scene/Playroom3D.tsx";
import { getInflatableCamera, INFLATABLE_SECONDS } from "../camera/rig.ts";
import { InflatableOverlay } from "../camera/Overlay.tsx";
import { INFLATABLE_GRADE, INFLATABLE_PALETTE as P } from "../lib/palette.ts";

export const INFLATABLE_EXAMPLE_SECONDS = INFLATABLE_SECONDS;

const POPS = [0.6, 1.8, 2.4, 3.1, ...WORD.split("").map((_, i) => letterAt(i) + 0.3)];

export const InflatableExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shot = getInflatableCamera(t);
  return (
    <FilmScene
      frame={frame}
      shot={{ pos: shot.pos, target: shot.target, fov: shot.fov }}
      background={P.bg}
      profile={INFLATABLE_GRADE}
      hdri="studio"
      envIntensity={1.0}
      ao
      near={0.05}
      far={60}
      focus={shot.focus}
      aperture={0.0015}
      maxBlur={0.004}
      overlay={() => <InflatableOverlay t={t} pops={POPS} />}
    >
      <hemisphereLight args={["#FFF1F7", "#B98AAE", 0.42]} />
      {/* big soft key from the front left, cool fill from the right: candy studio */}
      <directionalLight
        position={[-3, 6, 4]}
        intensity={2.8}
        color={P.key}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
        shadow-radius={6}
      />
      <directionalLight position={[4, 3, 2]} intensity={0.55} color={P.fill} />
      {/* rim from behind: a bright edge on every toy separates it from the pink sweep */}
      <directionalLight position={[1.5, 4, -6]} intensity={1.6} color="#FFFFFF" />
      <Playroom3D t={t} />
    </FilmScene>
  );
};
