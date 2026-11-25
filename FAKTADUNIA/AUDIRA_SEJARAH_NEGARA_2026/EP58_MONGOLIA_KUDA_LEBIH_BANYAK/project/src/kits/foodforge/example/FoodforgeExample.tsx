import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { TabletopSet3D } from "../scene/TabletopSet3D";
import { RamenBowl3D } from "../scene/RamenBowl3D";
import { SteamWisps3D } from "../scene/SteamWisps3D";
import { getFoodforgeCamera } from "../camera/rig";
import { FoodforgeOverlay } from "../camera/Overlay";
import { computeFoodState } from "../core/motion";
import { FOODFORGE_PALETTE as P } from "../lib/palette";

export const FOODFORGE_EXAMPLE_SECONDS = 12;

export const FoodforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const st = computeFoodState(f);
  const cam = getFoodforgeCamera(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={P.backdrop}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      hdri="warmStudio"
      exposure={0.9}
      envIntensity={0.45}
      ao
      near={0.05}
      far={60}
      overlay={() => <FoodforgeOverlay f={f} />}
    >
      <ambientLight intensity={0.12} color={P.keyWarm} />
      {/* warm softbox key, front-right */}
      <directionalLight
        position={[2.6, 4.2, 3.2]}
        intensity={2.3}
        color={P.keyWarm}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0004}
        shadow-radius={4}
      />
      {/* hot backlight rim: makes steam and glaze edges glow */}
      <spotLight position={[-1.8, 3.4, -3.2]} angle={0.55} penumbra={0.9} intensity={34} decay={1.6} color={P.rimWarm} />
      <directionalLight position={[3, 1.4, -3]} intensity={0.9} color={P.rimWarm} />
      {/* cool kicker for separation on the left */}
      <directionalLight position={[-4, 1.5, 1.5]} intensity={0.35} color={P.fillCool} />

      <TabletopSet3D f={f} />
      <RamenBowl3D t={st.t} lift={st.lift} chopIn={st.chopIn} />
      <SteamWisps3D t={st.t} steam={st.steam} />
    </FilmScene>
  );
};
