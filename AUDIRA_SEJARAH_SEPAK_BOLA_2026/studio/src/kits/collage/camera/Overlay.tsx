import React from "react";
import { useVideoConfig } from "remotion";
import { stepTime } from "../../../core/film/craft.ts";
import { clamp01 } from "../core/motion.ts";
import { COLLAGE_PALETTE as P } from "../lib/palette.ts";

export type CollageBeat = { at: number; label: string };

/**
 * A torn label tag (top left, from y = 262 px, under the signature start band) that names the beat.
 * It changes on twelves like the pieces. Authored at 1080×1920, scaled by height.
 */
export const CollageOverlay: React.FC<{ t: number; beats: CollageBeat[]; title?: string }> = ({ t, beats, title = "KOLASE" }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  const ts = stepTime(t, 12);
  let cur = 0;
  beats.forEach((b, i) => { if (b.at <= ts) cur = i; });
  const fade = clamp01((t - 0.3) / 0.4);
  const tilt = ((cur % 3) - 1) * 1.4;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 262 * s, left: 60 * s, opacity: fade, transform: `rotate(${tilt}deg)`, transformOrigin: "left top" }}>
        <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 24 * s, color: P.hudDim, marginBottom: 8 * s }}>{title}</div>
        <div
          style={{
            background: P.chip, color: P.hud, fontFamily: "'Courier New', monospace", fontWeight: 700,
            fontSize: 30 * s, letterSpacing: 3 * s, padding: `${10 * s}px ${20 * s}px`,
            clipPath: "polygon(0 6%, 4% 0, 97% 3%, 100% 40%, 98% 100%, 3% 95%, 0 60%)",
          }}
        >
          <span style={{ color: P.accent }}>{String(cur + 1).padStart(2, "0")} </span>
          {beats[cur]?.label}
        </div>
      </div>
    </div>
  );
};
