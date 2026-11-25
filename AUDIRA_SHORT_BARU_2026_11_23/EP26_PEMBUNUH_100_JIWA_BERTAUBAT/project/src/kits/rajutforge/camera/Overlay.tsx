import React from "react";
import { useVideoConfig } from "remotion";
import { RAJUT_PALETTE as P } from "../lib/palette.ts";
import { hudState } from "../core/motion.ts";

/**
 * A soft fabric tag (from y = 262 px) with a stitched (dashed) border: RAJUT · PUTARAN 12/20 →
 * MERAKIT → HURUF 3/6 → SELESAI, and a row of stitch marks that fills like a gauge.
 * Authored at 1080×1920, scaled by height.
 */
export const RajutforgeOverlay: React.FC<{ t: number; title?: string }> = ({ t, title = "RAJUT" }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  const h = hudState(t);
  const fade = Math.min(1, t / 0.4);
  const marks = 20;
  const lit = Math.round(Math.min(1, h.k) * marks);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif" }}>
      <div style={{ position: "absolute", top: 262 * s, left: 64 * s, opacity: fade }}>
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 16 * s, background: P.chip, borderRadius: 22 * s,
            padding: `${12 * s}px ${26 * s}px`, outline: `${2.5 * s}px dashed ${P.stitch}`, outlineOffset: -8 * s,
            boxShadow: `0 ${8 * s}px ${24 * s}px rgba(0,0,0,0.35)`,
          }}
        >
          <span style={{ color: P.accent, fontWeight: 800, fontSize: 32 * s, letterSpacing: 3 * s }}>{title}</span>
          <span style={{ color: P.hudDim, fontSize: 32 * s }}>·</span>
          <span style={{ color: P.hud, fontWeight: 700, fontSize: 32 * s, letterSpacing: 3 * s }}>{h.stage}</span>
          <span style={{ color: P.hud, fontWeight: 700, fontSize: 32 * s, letterSpacing: 1 * s, fontVariantNumeric: "tabular-nums" }}>{h.count}</span>
        </div>
        <div style={{ display: "flex", gap: 6 * s, marginTop: 14 * s, marginLeft: 10 * s }}>
          {Array.from({ length: marks }, (_, i) => (
            <svg key={i} width={14 * s} height={16 * s} viewBox="0 0 14 16" style={{ opacity: i < lit ? 1 : 0.28 }}>
              <path d="M2 2 L7 14 L12 2" fill="none" stroke={i < lit ? P.accent : P.hud} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
};
