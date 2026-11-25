// One scene, two formats. The composition size decides the format (width > height = wide); scenes
// stay authored for 9:16 and adapt through these helpers:
//
//   const fmt = useFormat();          // { kind, layout, safe, ... } for 2D layers
//   <FormatFov />                     // inside a ThreeCanvas, after the camera rig: converts the
//                                     // rig's portrait fov for 16:9 (Finish and Stage3D include it)
//   wideFov(38)                        // the same conversion as a pure function
//
// Why the fov changes: three.js fov is vertical. A 9:16 shot is framed so the subject fills the
// frame's width; with the same vertical fov in 16:9 the subject would fill the frame's height and
// look 3x larger, cropping its top and bottom. wideFov keeps the subject at the same share of the
// frame by making the 16:9 height cover what the 9:16 width covered, plus a little headroom.

import React, { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useVideoConfig } from "remotion";
import type { PerspectiveCamera } from "three";
import { HEIGHT, WIDE_HEIGHT, WIDE_WIDTH, WIDTH } from "./frame.ts";

export type FormatKind = "short" | "wide";

/** Margins in layout pixels that text and key action must stay inside. */
export type SafeArea = { top: number; bottom: number; left: number; right: number };

export const SAFE: Record<FormatKind, SafeArea> = {
  // Platform UI covers the top 180 px and the bottom 380 px of a 1080 × 1920 short.
  short: { top: 180, bottom: 380, left: 60, right: 60 },
  // 16:9: 5% title-safe on the sides, and room above YouTube's player controls at the bottom.
  wide: { top: 60, bottom: 120, left: 96, right: 96 },
};

/** Headroom so a subject framed edge to edge in 9:16 does not touch the 16:9 frame edges. */
const WIDE_HEADROOM = 1.3;

/** Vertical fov for 16:9 that shows what `fov` showed across the width of a 9:16 frame. */
export function wideFov(fov: number): number {
  const half = (fov * Math.PI) / 360;
  return (Math.atan(Math.tan(half) * (WIDTH / HEIGHT) * WIDE_HEADROOM) * 360) / Math.PI;
}

export function formatOf(width: number, height: number): FormatKind {
  return width > height ? "wide" : "short";
}

export function useFormat() {
  const { width, height } = useVideoConfig();
  const kind = formatOf(width, height);
  const layout = kind === "wide" ? { width: WIDE_WIDTH, height: WIDE_HEIGHT } : { width: WIDTH, height: HEIGHT };
  return {
    kind,
    isWide: kind === "wide",
    /** Size the 2D layer is laid out at before scaling to the render size. */
    layout,
    /** Render pixels per layout pixel. */
    scale: width / layout.width,
    safe: SAFE[kind],
    /** Convert an fov authored for 9:16 to this format. */
    fov: (fov: number) => (kind === "wide" ? wideFov(fov) : fov),
  };
}

// Last fov this component wrote per camera, so it converts each new rig value exactly once.
const applied = new WeakMap<object, number>();

/**
 * Put inside a ThreeCanvas after the camera rig. In a wide composition it converts the fov the
 * rig set this frame; in a short composition it does nothing. Rigs that set fov every frame and
 * rigs that set it once both work: a value it already converted is left alone.
 */
export const FormatFov: React.FC<{ frame?: number }> = ({ frame }) => {
  const { camera, size } = useThree();
  const wide = size.width > size.height;
  useLayoutEffect(() => {
    if (!wide) return;
    const cam = camera as PerspectiveCamera;
    if (!cam.isPerspectiveCamera) return;
    if (applied.get(cam) === cam.fov) return;
    cam.fov = wideFov(cam.fov);
    applied.set(cam, cam.fov);
    cam.updateProjectionMatrix();
  });
  void frame;
  return null;
};
