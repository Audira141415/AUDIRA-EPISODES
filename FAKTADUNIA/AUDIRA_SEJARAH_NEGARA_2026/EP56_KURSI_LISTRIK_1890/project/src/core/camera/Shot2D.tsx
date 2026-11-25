// Per-shot 2D camera for Remotion 2D films (no Three.js). Moves the world, not the HUD.
//
// Why: a parked 2D layout scores audit:camera 3 and medianSpeed ~0.015 (gate G13 needs >= 0.04).
// EP30 Miracle on Ice wrapped every scene in this camera (push-in + drift Y + roll + sinus sway X)
// and went to audit:camera 5, medianSpeed 0.055. Promoted from motion memory GLOBAL "camera", 2026-11-23.
//
// Usage (times in seconds of the film, or of the enclosing <Sequence>):
//   <Shot2D a={0} b={8.3} hud={<Card .../>}>      <Background/><Figures/>      </Shot2D>
//   <Shot2D a={8.3} b={16.7} push={[1.06, 1.1]} swayX={0} shake={[12.4]}>...</Shot2D>
// The shot fades in over `fade` seconds and keeps drawing `fade` seconds past `b`, so back-to-back
// shots crossfade. A single-scene template passes `always` so it stays mounted with no fade.

import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const EO = Easing.bezier(0.33, 0, 0.2, 1);

export interface Shot2DProps {
  /** Shot start, seconds. */
  a: number;
  /** Shot end, seconds. */
  b: number;
  /** Push-in scale from -> to over the shot (default [1, 1.08]). */
  push?: [number, number];
  /** Vertical drift over the shot in px (default 70). Negative drifts up. */
  driftY?: number;
  /** Roll reached at the end of the shot in degrees (default 1.6). Negative rolls the other way. */
  rollDeg?: number;
  /** Sinus sway amplitude on X in px (default 34). */
  swayX?: number;
  /** Sway period in seconds (default 6). */
  swayPeriod?: number;
  /** Times (s) of 0.5 s impact shakes. */
  shake?: number[];
  /** Crossfade length in seconds (default 0.25). */
  fade?: number;
  /** Keep mounted outside [a, b + fade] (for a single-scene template). */
  always?: boolean;
  /** Overlay that stays put (only follows shakes at half strength). */
  hud?: React.ReactNode;
  children: React.ReactNode;
}

export const Shot2D: React.FC<Shot2DProps> = ({
  a,
  b,
  push = [1, 1.08],
  driftY = 70,
  rollDeg = 1.6,
  swayX = 34,
  swayPeriod = 6,
  shake = [],
  fade = 0.25,
  always = false,
  hud,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  if (!always && (t < a || t >= b + fade)) return null;

  const k = (v0: number, v1: number) =>
    interpolate(t, [a, b + fade], [v0, v1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const op = always ? 1 : interpolate(t, [a, a + fade], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const sh = shake.reduce((m, at) => Math.max(m, t >= at && t < at + 0.5 ? 1 - (t - at) / 0.5 : 0), 0);
  const jx = Math.sin(t * 73) * 18 * sh;
  const jy = Math.cos(t * 61) * 14 * sh;

  const x = Math.sin(((t - a) / swayPeriod) * Math.PI * 2) * swayX + jx;
  const y = k(0, driftY) + jy;
  const roll = k(0, rollDeg);
  // Never show the frame edge: cover the translation and the rotated corners.
  const rad = (Math.abs(roll) * Math.PI) / 180;
  const cover =
    Math.cos(rad) + (Math.max(width, height) / Math.min(width, height)) * Math.sin(rad) +
    2.2 * Math.max(Math.abs(x) / width, Math.abs(y) / height);
  const s = Math.max(k(push[0], push[1]), cover);

  return (
    <AbsoluteFill style={{ opacity: op }}>
      <AbsoluteFill
        style={{
          transform: `translate(${x}px,${y}px) rotate(${roll}deg) scale(${s})`,
          transformOrigin: "50% 55%",
        }}
      >
        {children}
      </AbsoluteFill>
      {hud ? <AbsoluteFill style={{ transform: `translate(${jx * 0.5}px,${jy * 0.5}px)` }}>{hud}</AbsoluteFill> : null}
    </AbsoluteFill>
  );
};
