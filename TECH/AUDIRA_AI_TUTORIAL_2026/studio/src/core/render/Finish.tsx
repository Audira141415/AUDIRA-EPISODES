// Finishing layer for kits that drive their own camera rig: adds the starter's proven finishing
// chain (Post: ground-truth AO → bloom → tone mapping → grade with vignette and fine grain),
// a studio reflection environment, and an opaque background.
//
// Put it inside the kit's <ThreeCanvas>, after the kit's own camera rig:
//
//   <Finish frame={frame} background="#06170f" profile={COLOR_PROFILES.CYBER_NEON_VOID} />
//
// Why each part exists (motion-memory GLOBAL):
// - metal and glass need an environment to reflect, or they render black;
// - the composer renders into its own target, so the kit's CSS background behind a transparent
//   canvas is lost: pass the same colour as `background`;
// - depth of field is off by default (kits do not expose a focus distance); pass focus/aperture/
//   maxBlur to enable it for a specific shot;
// - additive or volumetric meshes (beams, halos, glows) belong on FX_LAYER, or ground-truth AO
//   can corrupt the frame; set `ao={false}` for kits built mostly from additive lines.

import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, staticFile } from "remotion";
import {
  Color,
  EquirectangularReflectionMapping,
  NeutralToneMapping,
  PMREMGenerator,
  type PerspectiveCamera,
  type WebGLRenderTarget,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { Post, type Shot } from "./Post.tsx";
import { COLOR_PROFILES, type ColorGradeProfile } from "./FinishingPresets.ts";

/** CC0 HDR environments in public/hdri (see public/hdri/README.md). */
export const HDRI = {
  studio: "hdri/studio_small_09_1k.hdr",
  warmStudio: "hdri/brown_photostudio_02_1k.hdr",
  sky: "hdri/kloofendal_48d_partly_cloudy_puresky_1k.hdr",
} as const;
export type HdriName = keyof typeof HDRI;

export const Finish: React.FC<{
  frame: number;
  /**
   * Solid colour matching the kit's AbsoluteFill background. Omit it when the scene already sets
   * its own background (`<color attach="background">`, possibly animated): Finish then leaves
   * scene.background alone. Not for CSS gradients: a gradient behind the canvas is lost.
   */
  background?: string;
  profile?: ColorGradeProfile;
  exposure?: number;
  /** Studio reflections for metal/glass; intensity 0 disables. */
  envIntensity?: number;
  /**
   * Real photographed reflections instead of the procedural RoomEnvironment (whose box lights show
   * up as squares on glossy surfaces). Loaded before the first frame renders; falls back to
   * RoomEnvironment if the file cannot be read.
   */
  hdri?: HdriName;
  /** Turn the HDRI around the vertical axis (radians) to place its key light. */
  envRotation?: number;
  ao?: boolean;
  aoRadius?: number;
  focus?: number;
  aperture?: number;
  maxBlur?: number;
}> = ({
  frame,
  background,
  profile = COLOR_PROFILES.DOCUMENTARY_WARM,
  exposure = 1,
  envIntensity = 0.55,
  hdri,
  envRotation = 0,
  ao = true,
  aoRadius = 0.3,
  focus = 10,
  aperture = 0,
  maxBlur = 0,
}) => {
  const { gl, scene, camera, advance } = useThree();

  useLayoutEffect(() => {
    if (background === undefined) return;
    const prev = scene.background;
    scene.background = new Color(background);
    return () => {
      scene.background = prev;
    };
  }, [scene, background]);

  useLayoutEffect(() => {
    if (envIntensity <= 0) return;
    const pm = new PMREMGenerator(gl);
    let rt: WebGLRenderTarget | null = null;
    let disposed = false;
    const apply = (target: WebGLRenderTarget) => {
      rt = target;
      scene.environment = target.texture;
      scene.environmentIntensity = envIntensity;
      scene.environmentRotation.set(0, envRotation, 0);
    };
    const useRoom = () => {
      const room = new RoomEnvironment();
      apply(pm.fromScene(room, 0.04));
      room.dispose();
    };

    if (!hdri) {
      useRoom();
    } else {
      // Hold the render until the HDR is decoded, so no frame is drawn with missing reflections.
      const handle = delayRender(`Loading HDRI ${hdri}`);
      new HDRLoader().load(
        staticFile(HDRI[hdri]),
        (tex) => {
          if (!disposed) {
            tex.mapping = EquirectangularReflectionMapping;
            apply(pm.fromEquirectangular(tex));
            // The HDR arrives after this frame was already drawn (frameloop "never"):
            // redraw it with the new reflections before Remotion captures it.
            advance(performance.now());
          }
          tex.dispose();
          continueRender(handle);
        },
        undefined,
        () => {
          if (!disposed) {
            useRoom();
            advance(performance.now());
          }
          continueRender(handle);
        },
      );
    }
    return () => {
      disposed = true;
      scene.environment = null;
      rt?.dispose();
      pm.dispose();
    };
  }, [gl, scene, envIntensity, hdri, envRotation, advance]);

  useLayoutEffect(() => {
    gl.toneMapping = NeutralToneMapping;
    gl.toneMappingExposure = exposure;
  }, [gl, exposure, frame]);

  const cam = camera as PerspectiveCamera;
  const shot = useMemo<Shot>(
    () => ({ pos: [0, 0, 0], target: [0, 0, 0], fov: cam.fov ?? 35, focus, aperture, maxBlur, exposure }),
    [cam.fov, focus, aperture, maxBlur, exposure],
  );

  return <Post shot={shot} frame={frame} ao={ao} aoRadius={aoRadius} profile={profile} />;
};
