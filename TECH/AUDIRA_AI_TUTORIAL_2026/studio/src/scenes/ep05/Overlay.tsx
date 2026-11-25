import React from "react";
import { SKETCH_PALETTE as P } from "../../kits/sketchforge/lib/palette.ts";

const HAND = "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive";
const MONO = "'Courier New', monospace";

/** Cover typography: kicker + handwritten headline top-left (y >= 262), caption card above the 380 px bottom safe zone. */
export const Ep05Overlay: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const s = height / 1920;
  return (
    <div style={{ position: "absolute", inset: 0, width, height, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 56 * s,
          top: 262 * s,
          background: "rgba(38,38,42,0.84)",
          padding: `${16 * s}px ${26 * s}px ${20 * s}px`,
          borderLeft: `${7 * s}px solid ${P.accent}`,
          boxShadow: `0 ${8 * s}px ${24 * s}px rgba(0,0,0,0.35)`,
        }}
      >
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26 * s, letterSpacing: 5 * s, color: P.paper }}>AUDIRA AI TUTORIAL</div>
        <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 92 * s, lineHeight: 1.08, color: P.paperWhite, marginTop: 8 * s, textShadow: `0 ${3 * s}px ${10 * s}px rgba(0,0,0,0.55)` }}>
          BELAJAR
          <br />
          TANPA <span style={{ color: P.accent }}>NYONTEK</span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 56 * s,
          bottom: 400 * s,
          background: "rgba(251,247,239,0.95)",
          borderLeft: `${7 * s}px solid ${P.accent}`,
          padding: `${14 * s}px ${22 * s}px`,
          boxShadow: `0 ${6 * s}px ${18 * s}px rgba(0,0,0,0.3)`,
        }}
      >
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20 * s, letterSpacing: 3 * s, color: P.accentDeep }}>MODE GUIDED LEARNING</div>
        <div style={{ fontFamily: HAND, fontSize: 36 * s, lineHeight: 1.3, color: P.graphite, marginTop: 4 * s }}>AI membimbing langkah demi langkah.</div>
      </div>
    </div>
  );
};
