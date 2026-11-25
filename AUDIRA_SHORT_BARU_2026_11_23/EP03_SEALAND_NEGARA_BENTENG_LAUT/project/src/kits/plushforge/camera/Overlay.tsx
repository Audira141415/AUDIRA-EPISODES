import React from "react";
import { useVideoConfig } from "remotion";
import { PLUSH_PALETTE as P } from "../lib/palette.ts";
import { STITCH, stageAt, stitchesDone } from "../core/motion.ts";

/**
 * A sewn-on fabric label (from y = 262 px): cream cotton, a dashed running-stitch border, the stitch
 * counter JAHITAN n/6, six thread dashes that fill in, and the stage
 * (MENDARAT → MEMANTUL → MELAMBAI → BERPELUKAN → MENJAHIT → SIAP DIPELUK).
 * Authored at 1080×1920, scaled by height.
 */
export const PlushforgeOverlay: React.FC<{ t: number; title?: string }> = ({ t, title = "BONEKA" }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  const done = stitchesDone(t);
  const fade = Math.min(1, t / 0.4);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "'Trebuchet MS', 'Arial Rounded MT Bold', Verdana, sans-serif" }}>
      <div style={{ position: "absolute", top: 262 * s, left: 64 * s, opacity: fade, transform: "rotate(-1.2deg)", transformOrigin: "left top" }}>
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 16 * s, background: P.chip, borderRadius: 14 * s,
            padding: `${14 * s}px ${26 * s}px`, outline: `${3 * s}px dashed ${P.accent}`, outlineOffset: -9 * s,
            boxShadow: `0 ${8 * s}px ${22 * s}px rgba(0,0,0,0.35)`,
          }}
        >
          <span style={{ color: P.accent, fontWeight: 800, fontSize: 32 * s, letterSpacing: 2 * s }}>{title}</span>
          <span style={{ color: P.hudDim, fontSize: 32 * s }}>·</span>
          <span style={{ color: P.hud, fontWeight: 700, fontSize: 32 * s, letterSpacing: 2 * s, fontVariantNumeric: "tabular-nums" }}>
            JAHITAN {done}/{STITCH.n}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 * s, marginTop: 14 * s, marginLeft: 6 * s }}>
          {Array.from({ length: STITCH.n }, (_, i) => (
            <div
              key={i}
              style={{
                width: 34 * s, height: 7 * s, borderRadius: 99, transform: "rotate(-14deg)",
                background: i < done ? P.threadCream : "rgba(250,241,226,0.22)",
                boxShadow: i < done ? `0 ${2 * s}px ${4 * s}px rgba(0,0,0,0.35)` : "none",
              }}
            />
          ))}
          <span style={{ color: "rgba(250,241,226,0.92)", fontWeight: 700, fontSize: 32 * s, letterSpacing: 3 * s, marginLeft: 8 * s, textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
            {stageAt(t)}
          </span>
        </div>
      </div>
    </div>
  );
};
