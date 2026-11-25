import React from "react";
import { useVideoConfig } from "remotion";
import { BATIK_PALETTE as P } from "../lib/palette.ts";

export type BatikStep = { at: number; label: string; note: string };

/**
 * Process chip (from y = 262 px): which step of batik tulis is on screen, with a small note.
 * Authored at 1080×1920, scaled by height. A thin wax-coloured progress line grows under it.
 */
export const BatikOverlay: React.FC<{ t: number; steps: BatikStep[]; end: number; title?: string }> = ({ t, steps, end, title = "BATIK TULIS" }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  let cur = 0;
  steps.forEach((st, i) => { if (st.at <= t) cur = i; });
  const since = t - steps[cur].at;
  const pop = Math.min(1, since / 0.25);
  const fade = Math.min(1, t / 0.5);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div style={{ position: "absolute", top: 262 * s, left: 64 * s, opacity: fade }}>
        <div style={{ fontSize: 22 * s, letterSpacing: 7 * s, color: P.accent, marginBottom: 10 * s }}>{title}</div>
        <div style={{ background: P.chip, padding: `${12 * s}px ${22 * s}px`, borderLeft: `${4 * s}px solid ${P.accent}`, transform: `translateX(${(1 - pop) * -12 * s}px)`, opacity: 0.4 + 0.6 * pop }}>
          <div style={{ color: P.hud, fontSize: 34 * s, fontWeight: 700, letterSpacing: 1.5 * s }}>{steps[cur].label}</div>
          <div style={{ color: P.hudDim, fontSize: 22 * s, fontStyle: "italic", marginTop: 4 * s }}>{steps[cur].note}</div>
        </div>
        <div style={{ marginTop: 12 * s, height: 3 * s, width: 300 * s, background: "rgba(255,243,224,0.18)" }}>
          <div style={{ height: "100%", width: `${Math.min(100, (t / end) * 100)}%`, background: P.accent }} />
        </div>
      </div>
    </div>
  );
};
