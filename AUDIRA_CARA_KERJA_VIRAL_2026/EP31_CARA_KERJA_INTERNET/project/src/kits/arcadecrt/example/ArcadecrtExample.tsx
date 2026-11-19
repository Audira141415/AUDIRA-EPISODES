import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { computeArcadeState } from "../core/motion";
import { getArcadeCamera } from "../camera/rig";
import { ArcadecrtOverlay } from "../camera/Overlay";
import { ArcadeRoom3D } from "../scene/ArcadeRoom3D";
import { CrtCabinet3D } from "../scene/CrtCabinet3D";
import { PixelWorld3D } from "../scene/PixelWorld3D";
import { ARCADE_PALETTE } from "../lib/palette";

export const ARCADECRT_EXAMPLE_SECONDS = 12;

const SceneContent: React.FC<{ s: ReturnType<typeof computeArcadeState> }> = ({ s }) => (
  <>
    <color attach="background" args={[s.inside ? "#06041A" : ARCADE_PALETTE.room]} />
    {s.inside ? (
      <PixelWorld3D t={s.t} />
    ) : (
      <>
        <ambientLight intensity={0.18} color="#8A7CFF" />
        <spotLight position={[0, 5.5, 3]} angle={0.5} penumbra={0.8} intensity={14} color="#C9B8FF" distance={12} decay={2} castShadow />
        <ArcadeRoom3D t={s.t} />
        <CrtCabinet3D s={s} />
      </>
    )}
  </>
);

export const ArcadecrtExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const s = computeArcadeState(f);
  const cam = getArcadeCamera(s);
  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position as [number, number, number], target: cam.target as [number, number, number], fov: cam.fov, roll: cam.roll }}
      background={ARCADE_PALETTE.room}
      profile={COLOR_PROFILES.CYBER_NEON_VOID}
      near={0.02}
      far={250}
      overlay={() => <ArcadecrtOverlay s={s} width={1080} height={1920} />}
    >
      <SceneContent s={s} />
    </FilmScene>
  );
};
