import React, { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { KelirStage3D } from "../scene/KelirStage3D";
import { WayangPuppets3D } from "../scene/WayangPuppets3D";
import { getWayangCamera } from "../camera/rig";
import { WayangOverlay } from "../camera/Overlay";
import { WAYANG_PALETTE as P } from "../lib/palette";

export const WAYANGFORGE_EXAMPLE_SECONDS = 12;

/** Neutral studio reflections so bronze gamelan and prada gold read as metal. */
const StudioEnv: React.FC = () => {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.18;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
};

export const WayangforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const cam = getWayangCamera(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position as [number, number, number], target: cam.target as [number, number, number], fov: cam.fov }}
      background={P.hallIndigo}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      exposure={0.9}
      envIntensity={0}
      near={0.05}
      far={60}
      overlay={() => <WayangOverlay f={f} />}
    >
      <StudioEnv />
      <color attach="background" args={[P.hallIndigo]} />
      <fog attach="fog" args={[P.hallIndigo, 7, 18]} />
      <ambientLight intensity={0.35} color="#4A3A6A" />
      <hemisphereLight args={["#3A3466", "#2A1608", 0.5]} />
      <directionalLight position={[2, 5, -6]} intensity={0.5} color="#7F8CC8" />
      <KelirStage3D f={f} />
      <WayangPuppets3D f={f} />
    </FilmScene>
  );
};
