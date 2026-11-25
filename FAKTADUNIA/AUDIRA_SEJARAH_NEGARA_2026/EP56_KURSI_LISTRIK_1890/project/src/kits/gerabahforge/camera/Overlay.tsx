import React from "react";
import { useVideoConfig } from "remotion";
import { GERABAH_PALETTE as P } from "../lib/palette.ts";
import { kilnTemp, stageAt, wheelRpm } from "../core/motion.ts";

const ORDER = ["PUTAR", "KERING", "GLASIR", "LUKIS", "BAKAR", "JADI"] as const;

/**
 * A dark clay tag from y = 262 px: GERABAH · stage · live reading (wheel rpm, kiln °C), and a row
 * of six stage pips that fill as the piece moves through the studio. Authored at 1080×1920,
 * scaled by height.
 */
export const GerabahforgeOverlay: React.FC<{ t: number; title?: string }> = ({ t, title = "GERABAH" }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  const stage = stageAt(t);
  const reading =
    stage === "PUTAR" || stage === "KERING" ? `${wheelRpm(t)} RPM` : stage === "BAKAR" ? `${kilnTemp(t)}°C` : stage === "JADI" ? "1200°C" : "";
  const idx = ORDER.indexOf(stage);
  const fade = Math.min(1, t / 0.4);
  const hot = stage === "BAKAR";
  const glazey = stage === "GLASIR" || stage === "LUKIS";
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div style={{ position: "absolute", top: 262 * s, left: 64 * s, opacity: fade }}>
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 16 * s, background: P.chip, borderRadius: 12 * s,
            padding: `${12 * s}px ${24 * s}px`, border: `${2 * s}px solid ${hot ? "rgba(255,154,74,0.85)" : "rgba(255,154,74,0.45)"}`,
            boxShadow: `0 ${8 * s}px ${24 * s}px rgba(0,0,0,0.35)${hot ? `, 0 0 ${30 * s}px rgba(255,120,40,0.35)` : ""}`,
          }}
        >
          <span style={{ color: P.accent, fontWeight: 700, fontSize: 32 * s, letterSpacing: 2 * s }}>{title}</span>
          <span style={{ color: P.hudDim, fontSize: 32 * s }}>·</span>
          <span style={{ color: glazey ? P.glazeAccent : P.hud, fontWeight: 600, fontSize: 32 * s, letterSpacing: 3 * s }}>{stage}</span>
          {reading && <span style={{ color: P.hudDim, fontWeight: 600, fontSize: 32 * s, fontVariantNumeric: "tabular-nums" }}>{reading}</span>}
        </div>
        <div style={{ display: "flex", gap: 8 * s, marginTop: 12 * s }}>
          {ORDER.map((o, i) => (
            <div key={o} style={{ width: 52 * s, height: 8 * s, borderRadius: 99, background: i <= idx ? (i === 2 || i === 3 ? P.glazeAccent : P.accent) : "rgba(248,233,214,0.18)" }} />
          ))}
        </div>
      </div>
    </div>
  );
};
