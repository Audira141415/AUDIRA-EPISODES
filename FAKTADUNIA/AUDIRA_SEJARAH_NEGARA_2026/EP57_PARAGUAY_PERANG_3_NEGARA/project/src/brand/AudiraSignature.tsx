// AUDIRA moving signature — small, semi-transparent ownership mark that changes position over time,
// so a re-uploader cannot remove it with one crop or one blur box.
//
// Copy into a project as src/brand/AudiraSignature.tsx and place it as the LAST child of the film's
// root <AbsoluteFill> (above the 3D canvas and HUD, below nothing):
//
//   <AudiraSignature seed="ep05-rantai-foto" />
//
// The handle line comes from src/brand/channel.json, written from the series' channel by
// `npm run channel` (also run by check-env and render:final). Leave `handle` out: a typed handle
// that differs from the channel turns qa:gate red (rule 08). Copy channel.json and channelOf.ts along
// with this file. A project with films for several channels marks each film: <AudiraSignature seed="…" code="TECH" />.
//
// Rules it follows (CLAUDE.md, Identitas & Branding Contract):
// - small (≈2.6% of the frame's short side) and 32% opacity: not a large static watermark;
// - always inside the safe zone (9:16: top 180 px, bottom 380 px; 16:9: title-safe sides, top 60 px,
//   above the subtitle band and player controls) so platform UI never hides it;
// - jumps between 4 anchors every `cycleSeconds`, in an order derived from `seed` (differs per episode);
// - hidden during the last `outroSeconds`, where the AUDIRA outro card already carries the brand;
// - deterministic: everything comes from useCurrentFrame()/useVideoConfig().

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { channelOf } from "./channelOf";

type Anchor = { x: number; y: number; align: "left" | "right" };

// Fractions of a 1080 × 1920 frame. y stays between 180 px (top safe) and 1540 px (top of the
// bottom 380 px safe band), and avoids the karaoke subtitle band (≈1290–1540 px).
const ANCHORS: Anchor[] = [
  { x: 0.94, y: 0.115, align: "right" }, // top-right, just under the top safe line
  { x: 0.06, y: 0.62, align: "left" }, // left, above the subtitle band
  { x: 0.94, y: 0.45, align: "right" }, // right, mid frame
  { x: 0.06, y: 0.115, align: "left" }, // top-left
];

// 16:9 long-form (1920 × 1080): inside 5% title-safe sides and the 60 px top margin, above the
// subtitle band (≈860–960 px) and YouTube's player controls (bottom 120 px).
const ANCHORS_WIDE: Anchor[] = [
  { x: 0.95, y: 0.07, align: "right" }, // top-right
  { x: 0.05, y: 0.66, align: "left" }, // left, above the subtitle band
  { x: 0.95, y: 0.42, align: "right" }, // right, mid frame
  { x: 0.05, y: 0.07, align: "left" }, // top-left
];

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

/** Anchor order for this episode: a seeded permutation, repeated for the whole film. */
const orderFor = (seed: string) => {
  const idx = ANCHORS.map((_, i) => i);
  let h = hash(seed);
  for (let i = idx.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    const j = h % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
};

export const AudiraSignature: React.FC<{
  /** Episode id or slug; changes the anchor order per episode. */
  seed: string;
  /** Main mark. */
  text?: string;
  /** Channel code for this film when the project holds films for several channels (e.g. "TECH"). Default: the series' channel. */
  code?: string;
  /** Second line. Default: the channel handle from src/brand/channel.json; do not type it by hand. */
  handle?: string;
  opacity?: number;
  /** Seconds before the mark moves to the next anchor. */
  cycleSeconds?: number;
  /** Seconds at the end of the film where the mark is hidden (outro card). */
  outroSeconds?: number;
  color?: string;
}> = ({
  seed,
  text = "AUDIRA",
  code,
  handle: handleProp,
  opacity = 0.32,
  cycleSeconds = 18,
  outroSeconds = 3,
  color = "#ffffff",
}) => {
  const handle = handleProp ?? (channelOf(code).handle || undefined);
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const order = orderFor(seed);
  const cycle = Math.floor(t / cycleSeconds);
  const anchors = width > height ? ANCHORS_WIDE : ANCHORS; // 16:9 long-form or 9:16 short
  const anchor = anchors[order[cycle % order.length]];
  const local = t - cycle * cycleSeconds;

  // Fade out/in around each jump, and fade out before the outro card.
  const fadeIn = interpolate(local, [0, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(local, [cycleSeconds - 0.5, cycleSeconds], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outroStart = (durationInFrames / fps) - outroSeconds;
  const outro = interpolate(t, [outroStart - 0.4, outroStart], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const first = cycle === 0 ? 1 : fadeIn; // visible from frame 0
  const alpha = opacity * Math.min(first, fadeOut) * outro;
  if (alpha <= 0.001) return null;

  // Slow drift (±6 px) so the mark is never pixel-identical between frames.
  // Sized from the short side, so the mark is the same size in 9:16 and 16:9 (≈28 px at 1080).
  const short = Math.min(width, height);
  const drift = Math.sin(t * 0.7 + hash(seed) % 7) * 6 * (short / 1080);
  const size = Math.round(short * 0.026);

  return (
    <AbsoluteFill data-layout-ignore style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: anchor.y * height,
          left: anchor.align === "left" ? anchor.x * width + drift : undefined,
          right: anchor.align === "right" ? (1 - anchor.x) * width - drift : undefined,
          textAlign: anchor.align,
          opacity: alpha,
          color,
          fontFamily: "'Space Grotesk', Manrope, system-ui, sans-serif",
          lineHeight: 1.1,
          textShadow: "0 1px 3px rgba(0,0,0,0.55)",
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ fontSize: size, fontWeight: 700, letterSpacing: size * 0.22 }}>{text}</div>
        {handle ? <div style={{ fontSize: size * 0.62, fontWeight: 500, letterSpacing: size * 0.06 }}>{handle}</div> : null}
      </div>
    </AbsoluteFill>
  );
};
