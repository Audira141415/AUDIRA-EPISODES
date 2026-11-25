import React from "react";
import { useVideoConfig } from "remotion";
import { BRONZE_PALETTE as P } from "../lib/palette.ts";
import { MONUMENT, patinaAt, polishAt, stageAt, tempAt } from "../core/motion.ts";

/**
 * A dark cast-iron chip (from y = 262 px) naming the stage and its reading:
 * COR PERUNGGU · 1100°C → BONGKAR CETAKAN → PENDINGINAN (°C falling) → POLES % → PATINA % → MONUMEN.
 * The gauge turns from molten orange to verdigris as the story moves on. Authored at 1080×1920,
 * scaled by height.
 */
export const BronzeforgeOverlay: React.FC<{ t: number; title?: string }> = ({ t, title = "PERUNGGU" }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  const stage = stageAt(t);
  const temp = tempAt(t);
  let value: string;
  let gauge: number;
  let color = P.molten;
  if (stage === "COR PERUNGGU" || stage === "BONGKAR CETAKAN" || stage === "PENDINGINAN") {
    value = `${temp}°C`;
    gauge = (temp - 20) / 1080;
  } else if (stage === "POLES") {
    value = `${Math.round(polishAt(t) * 100)}%`;
    gauge = polishAt(t);
    color = P.accent;
  } else if (stage === "PATINA") {
    value = `${Math.round(patinaAt(t) * 100)}%`;
    gauge = patinaAt(t);
    color = P.patina;
  } else {
    value = "AUDIRA";
    gauge = 1;
    color = P.patina;
  }
  const fade = Math.min(1, t / 0.4);
  const mon = Math.min(1, Math.max(0, (t - MONUMENT) / 0.5));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div style={{ position: "absolute", top: 262 * s, left: 64 * s, opacity: fade }}>
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 18 * s, background: P.chip, borderRadius: 8 * s,
            padding: `${12 * s}px ${24 * s}px`, border: `${2 * s}px solid ${color}88`,
            boxShadow: `0 ${8 * s}px ${24 * s}px rgba(0,0,0,0.4)`,
          }}
        >
          <span style={{ color, fontWeight: 700, fontSize: 32 * s, letterSpacing: 3 * s }}>{title}</span>
          <span style={{ color: P.hud, fontWeight: 600, fontSize: 32 * s, letterSpacing: 3 * s }}>{stage}</span>
          <span style={{ color: P.hudDim, fontWeight: 600, fontSize: 32 * s, fontVariantNumeric: "tabular-nums" }}>{value}</span>
        </div>
        <div style={{ width: 380 * s, height: 8 * s, marginTop: 12 * s, background: "rgba(244,230,210,0.16)", borderRadius: 99 }}>
          <div style={{ width: `${Math.round(Math.min(1, Math.max(0, gauge)) * 100)}%`, height: "100%", background: color, borderRadius: 99 }} />
        </div>
        <div style={{ marginTop: 14 * s, color: P.hudDim, fontSize: 32 * s, letterSpacing: 4 * s, opacity: mon }}>COR · POLES · PATINA</div>
      </div>
    </div>
  );
};
