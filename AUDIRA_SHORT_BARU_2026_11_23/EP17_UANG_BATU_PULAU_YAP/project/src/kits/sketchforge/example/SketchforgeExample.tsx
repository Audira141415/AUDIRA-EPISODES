import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { computeSketchState } from "../core/motion";
import { getSketchCamera } from "../camera/rig";
import { SketchforgeOverlay } from "../camera/Overlay";
import { SketchbookDesk3D, Pencil3D } from "../scene/SketchbookDesk3D";
import { FlatSketch, LiftWire, pencilTip, useStrokes } from "../scene/HouseSketch3D";
import { ChimneySmoke, HouseSolid3D } from "../scene/HouseSolid3D";
import { SKETCH_PALETTE } from "../lib/palette";

export const SKETCHFORGE_EXAMPLE_SECONDS = 12;

/** Scene content kept as a child component because useStrokes() needs R3F context. */
const SceneContent: React.FC<{ f: number }> = ({ f }) => {
  const s = computeSketchState(f);
  const strokes = useStrokes();
  const liftY = s.lift;
  return (
    <>
      <color attach="background" args={[SKETCH_PALETTE.desk]} />
      <ambientLight intensity={0.75} color="#FFF4E6" />
      <hemisphereLight args={["#FFF6EA", "#3A3A40", 0.5]} />
      <directionalLight
        position={[4.5, 8, 5.5]}
        intensity={2.1}
        color="#FFF1DE"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
      />
      {/* cool rim from behind-left so the lifted house separates from the dark desk */}
      <directionalLight position={[-5, 3.5, -4]} intensity={0.9} color="#DDE6FF" />
      <SketchbookDesk3D />
      <FlatSketch s={s} strokes={strokes} unit={1} />
      <Pencil3D s={s} tip={pencilTip(strokes, s.draw)} />
      <group position={[0, liftY, 0]} rotation={[0, s.spin, 0]}>
        <LiftWire s={s} strokes={strokes} unit={1} />
        <HouseSolid3D s={s} liftY={liftY} />
        <ChimneySmoke s={s} />
      </group>
    </>
  );
};

export const SketchforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const s = computeSketchState(f);
  const cam = getSketchCamera(f, s.lift);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={SKETCH_PALETTE.desk}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      exposure={0.85}
      envIntensity={0.25}
      ao
      near={0.05}
      far={80}
      overlay={() => <SketchforgeOverlay f={f} width={1080} height={1920} />}
    >
      <SceneContent f={f} />
    </FilmScene>
  );
};
