import React from "react";
import { useVideoConfig } from "remotion";
import { UKIR_PALETTE as P } from "../lib/palette.ts";

/**
 * A dark wooden tag (from y = 262 px) that names the stage and fills a carve gauge with each mallet
 * strike: PAHAT → MAINAN → BALUR MINYAK. Authored at 1080×1920, scaled by height.
 */
export const UkirforgeOverlay: React.FC<{ t: number; carve: number; oil: number; title?: string }> = ({ t, carve, oil, title = "UKIR KAYU" }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  const stage = oil > 0.02 ? "BALUR MINYAK" : t > 4.6 ? "MAINAN KAYU" : "PAHAT";
  const pct = Math.round((oil > 0.02 ? oil : t > 4.6 ? 1 : carve) * 100);
  const fade = Math.min(1, t / 0.4);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div style={{ position: "absolute", top: 262 * s, left: 64 * s, opacity: fade }}>
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 18 * s, background: P.chip, borderRadius: 10 * s,
            padding: `${12 * s}px ${24 * s}px`, border: `${2 * s}px solid rgba(232,176,48,0.55)`,
            boxShadow: `0 ${8 * s}px ${24 * s}px rgba(0,0,0,0.35)`,
          }}
        >
          <span style={{ color: P.accent, fontWeight: 700, fontSize: 32 * s, letterSpacing: 2 * s }}>{title}</span>
          <span style={{ color: P.hud, fontWeight: 600, fontSize: 32 * s, letterSpacing: 3 * s }}>{stage}</span>
          <span style={{ color: P.hudDim, fontWeight: 600, fontSize: 32 * s, fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
        </div>
        <div style={{ width: 360 * s, height: 8 * s, marginTop: 12 * s, background: "rgba(246,231,207,0.18)", borderRadius: 99 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: P.accent, borderRadius: 99 }} />
        </div>
      </div>
    </div>
  );
};
