// FilmScene — the "batteries included" 3D scene wrapper.
//
// Combines Stage3D + PoseCamera + Finish into one component so you can't forget
// any of the 7 essentials (camera, environment, lighting, post, composition).
//
// Usage (minimal — everything has sensible defaults):
//
//   <FilmScene frame={frame} shot={currentShot} background="#1a1a2e">
//     <group position={[0, 0, 0]}>
//       <MyObject />
//     </group>
//   </FilmScene>
//
// Usage (full):
//
//   <FilmScene
//     frame={frame}
//     shot={{ pos: [15, 8, 30], target: [0, 0, 0], fov: 28 }}
//     background="#06170f"
//     profile={COLOR_PROFILES.CYBER_NEON_VOID}
//     hdri="studio"
//     exposure={1.1}
//     envIntensity={0.6}
//     ao
//     overlay={(scale) => <Subtitle ... />}
//   >
//     <BeatSwitch active={beatIdx}>
//       <group>{/* beat 0 */}</group>
//       <group>{/* beat 1 */}</group>
//     </BeatSwitch>
//   </FilmScene>

import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PCFShadowMap } from "three";
import { fontReady } from "../type/fonts.ts";
import { FormatFov, useFormat } from "../film/format.ts";
import { PoseCamera } from "../camera/PoseCamera.tsx";
import { Finish, type HdriName } from "../render/Finish.tsx";
import type { ColorGradeProfile } from "../render/FinishingPresets.ts";

export type FilmShot = {
  pos: readonly [number, number, number];
  target: readonly [number, number, number];
  fov?: number;
  roll?: number;
};

export const FilmScene: React.FC<{
  /** Current Remotion frame number (needed by Finish for grain animation). */
  frame: number;
  /** Camera pose for this frame. Defaults to [0, 12, 45] looking at origin, fov 28. */
  shot?: FilmShot;
  /** 3D scene contents: meshes, groups, lights. */
  children: React.ReactNode;
  /** Background colour (passed to Finish for opaque backdrop). */
  background?: string;
  /** Finish color grade profile. */
  profile?: ColorGradeProfile;
  /** HDRI environment for reflections. Default "studio". */
  hdri?: HdriName;
  /** Exposure. Default 1 (0.82 for light backgrounds). */
  exposure?: number;
  /** Environment reflection intensity. Default 0.55. */
  envIntensity?: number;
  /** Environment rotation in radians. */
  envRotation?: number;
  /** Enable ambient occlusion. Default true. */
  ao?: boolean;
  aoRadius?: number;
  /** Depth of field: focus distance. 0 = disabled. */
  focus?: number;
  aperture?: number;
  maxBlur?: number;
  /** 2D overlay (subtitles, HUD, captions). Rendered on top at layout size. */
  overlay?: (scale: number) => React.ReactNode;
  /** 0…1 fade to fadeColor over everything. */
  fade?: number;
  fadeColor?: string;
  /** Camera clip planes. Default 1 / 900 (world scale ~10 units); use near 0.05 for desk-scale scenes. */
  near?: number;
  far?: number;
  /** Finish post chain. Pass false when the kit runs its own EffectComposer. */
  post?: boolean;
}> = ({
  frame,
  shot,
  children,
  background = "#e9e6e0",
  profile,
  hdri = "studio",
  exposure,
  envIntensity,
  envRotation,
  ao = true,
  aoRadius,
  focus,
  aperture,
  maxBlur,
  overlay,
  fade = 0,
  fadeColor = "#ece9e3",
  near = 1,
  far = 900,
  post = true,
}) => {
  const { width, height } = useVideoConfig();
  const fmt = useFormat();
  const [handle] = useState(() => delayRender("font"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    fontReady().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);

  const defaultShot: FilmShot = { pos: [0, 12, 45], target: [0, 0, 0], fov: 28 };
  const s = shot ?? defaultShot;

  return (
    <AbsoluteFill style={{ backgroundColor: background }}>
      {ready ? (
        <>
          <ThreeCanvas
            width={width}
            height={height}
            shadows={{ type: PCFShadowMap }}
            dpr={1.5}
            gl={{ antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
            camera={{ fov: s.fov ?? 28, near, far, position: [...s.pos] }}
          >
            <PoseCamera position={s.pos} target={s.target} fov={s.fov ?? 28} roll={s.roll} />
            {children}
            <Finish
              frame={frame}
              background={background}
              profile={profile}
              hdri={hdri}
              exposure={exposure}
              envIntensity={envIntensity}
              envRotation={envRotation}
              ao={ao}
              aoRadius={aoRadius}
              focus={focus}
              aperture={aperture}
              maxBlur={maxBlur}
              post={post}
            />
            <FormatFov />
          </ThreeCanvas>
          {overlay ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: fmt.layout.width,
                height: fmt.layout.height,
                transform: `scale(${fmt.scale})`,
                transformOrigin: "0 0",
              }}
            >
              {overlay(fmt.scale)}
            </div>
          ) : null}
        </>
      ) : null}
      {fade > 0 ? <AbsoluteFill style={{ backgroundColor: fadeColor, opacity: fade }} /> : null}
    </AbsoluteFill>
  );
};
