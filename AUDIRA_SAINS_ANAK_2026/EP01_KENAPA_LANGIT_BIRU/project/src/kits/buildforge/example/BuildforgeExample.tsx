// BUILDFORGE technical example — a garden pavilion assembled piece by piece in true 3D (10 s at any fps).
// World, construction clock, camera rig, finishing chain and stage labels, all from src/kits/buildforge.
// It is a technical check and a starting point, not a story: never reuse it as a buyer's film.

import React, { useLayoutEffect, useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useThree } from "@react-three/fiber";
import { NeutralToneMapping } from "three";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { FONT } from "../../../core/type/fonts.ts";
import { shotAt } from "../camera/director.ts";
import { StageLabel } from "../labels/StageLabel.tsx";
import { Post } from "../render/Post.tsx";
import { createWorld, sunLook } from "../world/createWorld.ts";
import { SITE, pavilionComponents } from "./pavilion.ts";
import { CLOCK, EXAMPLE_SECONDS, LENS, RIG, STAGES_S, WINDOWS, terrainAt } from "./sequence.ts";

export const BUILDFORGE_EXAMPLE_SECONDS = EXAMPLE_SECONDS;

const SUN: [number, number, number] = [-0.78, 0.46, -0.32];
const DAYLIGHT = sunLook(SUN);

/** Trees already standing around the site: [x, z, height]. Keep the camera's final view clear. */
const WILD: [number, number, number][] = [
  [-11, -16, 8], [-2, -19, 9], [8, -17, 7.5], [16, -14, 8.5], [-19, -12, 7], [21, -2, 8], [-22, 3, 7.5], [24, 9, 9],
];

const World: React.FC<{ frame: number; fps: number; exposure: number }> = ({ frame, fps, exposure }) => {
  const { gl, scene } = useThree();
  const world = useMemo(
    () =>
      createWorld(gl, scene, {
        components: pavilionComponents(),
        windows: WINDOWS,
        site: SITE,
        terrainAt,
        trees: WILD,
        sunDir: SUN,
        shadowSize: 22,
      }),
    [gl, scene],
  );
  const c = (frame / fps) * CLOCK;
  useLayoutEffect(() => {
    world.update(c, DAYLIGHT);
    gl.toneMapping = NeutralToneMapping;
    gl.toneMappingExposure = exposure;
  }, [world, c, gl, exposure]);
  const shot = useMemo(() => shotAt(RIG, c, LENS), [c]);
  return (
    <>
      <primitive object={world.root} />
      <Post shot={shot} frame={frame} aoRadius={0.45} />
    </>
  );
};

export const BuildforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = (frame / fps) * CLOCK;
  const shot = useMemo(() => shotAt(RIG, c, LENS), [c]);
  const stages = STAGES_S.map((s) => ({ ...s, from: Math.round(s.from * fps), to: Math.round(s.to * fps) }));
  return (
    <FilmScene
      frame={frame}
      shot={{ pos: shot.pos, target: shot.target, fov: shot.fov, roll: shot.roll }}
      background="#e8eef0"
      post={false}
      hdri="sky"
      envIntensity={0.45}
      near={0.4}
      far={2500}
      overlay={() => <StageLabel stages={stages} frame={frame} fps={fps} font={FONT} ink="#22292c" soft="#56636a" accent="#0e7a67" />}
    >
      <World frame={frame} fps={fps} exposure={shot.exposure} />
    </FilmScene>
  );
};
