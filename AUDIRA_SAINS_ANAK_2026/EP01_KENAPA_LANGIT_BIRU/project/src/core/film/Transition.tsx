// Scene transitions for Remotion compositions.
//
// Wraps a child in a transition effect based on normalised progress (0→1).
// Use with interpolate() from Remotion, or pass frame/fps + duration.
//
//   <Transition type="fade" progress={fadeProgress}>{children}</Transition>
//   <Transition type="wipeRight" frame={frame} fps={fps} startSec={4.5} durSec={0.6}>
//     <NextScene />
//   </Transition>

import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp, smootherstep } from "../motion/easing.ts";

export type TransitionType =
  | "fade"
  | "wipeRight"
  | "wipeLeft"
  | "wipeUp"
  | "wipeDown"
  | "zoomIn"
  | "zoomOut"
  | "blur"
  | "slideRight"
  | "slideUp";

export type TransitionProps = {
  children: React.ReactNode;
  type?: TransitionType;
  /** 0 = fully hidden, 1 = fully visible. Overrides frame-based timing. */
  progress?: number;
  /** If no progress, compute from frame. */
  frame?: number;
  fps?: number;
  /** Start time in seconds. */
  startSec?: number;
  /** Duration in seconds (default 0.5). */
  durSec?: number;
  /** Transition colour for fade/wipe backgrounds. */
  color?: string;
  /** Apply easing (default true). */
  ease?: boolean;
};

export const Transition: React.FC<TransitionProps> = ({
  children,
  type = "fade",
  progress: progressOverride,
  frame,
  fps,
  startSec = 0,
  durSec = 0.5,
  color = "#000000",
  ease = true,
}) => {
  let raw: number;
  if (progressOverride !== undefined) {
    raw = progressOverride;
  } else if (frame !== undefined && fps) {
    const t = frame / fps;
    raw = clamp((t - startSec) / durSec);
  } else {
    raw = 1;
  }
  const p = ease ? smootherstep(raw) : clamp(raw);

  if (p <= 0) return null;
  if (p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;

  const style = transitionStyle(type, p, color);

  return (
    <AbsoluteFill style={style.wrapper}>
      <div style={style.inner}>{children}</div>
    </AbsoluteFill>
  );
};

type Styles = { wrapper: React.CSSProperties; inner: React.CSSProperties };

function transitionStyle(type: TransitionType, p: number, color: string): Styles {
  const full: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "hidden" };

  switch (type) {
    case "fade":
      return { wrapper: { ...full, opacity: p }, inner: full };

    case "wipeRight":
      return { wrapper: { ...full, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }, inner: full };
    case "wipeLeft":
      return { wrapper: { ...full, clipPath: `inset(0 0 0 ${(1 - p) * 100}%)` }, inner: full };
    case "wipeUp":
      return { wrapper: { ...full, clipPath: `inset(0 0 ${(1 - p) * 100}% 0)` }, inner: full };
    case "wipeDown":
      return { wrapper: { ...full, clipPath: `inset(${(1 - p) * 100}% 0 0 0)` }, inner: full };

    case "zoomIn": {
      const scale = 0.5 + p * 0.5;
      return { wrapper: { ...full, opacity: p }, inner: { ...full, transform: `scale(${scale})`, transformOrigin: "center" } };
    }
    case "zoomOut": {
      const scale = 1.5 - p * 0.5;
      return { wrapper: { ...full, opacity: p }, inner: { ...full, transform: `scale(${scale})`, transformOrigin: "center" } };
    }

    case "blur": {
      const blur = (1 - p) * 20;
      return { wrapper: { ...full, opacity: p, filter: `blur(${blur}px)` }, inner: full };
    }

    case "slideRight": {
      const x = (1 - p) * 100;
      return { wrapper: full, inner: { ...full, transform: `translateX(${x}%)` } };
    }
    case "slideUp": {
      const y = (1 - p) * 100;
      return { wrapper: full, inner: { ...full, transform: `translateY(${y}%)` } };
    }

    default:
      return { wrapper: { ...full, opacity: p }, inner: full };
  }
}

/** Convenience: compute exit progress (1→0) for the outgoing scene. */
export function exitProgress(frame: number, fps: number, endSec: number, durSec = 0.5): number {
  const t = frame / fps;
  return 1 - clamp((t - (endSec - durSec)) / durSec);
}
