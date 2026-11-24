import React from "react";
import { useVideoConfig } from "remotion";
import { PASIR_PALETTE as P } from "../lib/palette.ts";
import { clockAt, stageAt } from "../core/motion.ts";

/**
 * A sun-bleached chip (from y = 262 px): PATUNG PASIR · TERBENTUK 80% → TERKIKIS 34% → OMBAK DATANG,
 * a beach clock that runs through the last hour of daylight, and a gauge that fills with sand while
 * the form rises and drains (turning coral) as it erodes. Authored at 1080×1920, scaled by height.
 */
export const PasirforgeOverlay: React.FC<{ t: number; title?: string }> = ({ t, title = "PATUNG PASIR" }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  const st = stageAt(t);
  const pct = Math.round(st.pct * 100);
  const fill = st.eroding ? 1 - st.pct : st.pct;
  const fade = Math.min(1, t / 0.4);
  const col = st.eroding ? P.erode : P.accent;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif" }}>
      <div style={{ position: "absolute", top: 262 * s, left: 64 * s, opacity: fade }}>
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 16 * s, background: P.chip, borderRadius: 999,
            padding: `${12 * s}px ${26 * s}px`, border: `${2 * s}px solid rgba(255,214,160,0.5)`,
            boxShadow: `0 ${8 * s}px ${26 * s}px rgba(60,30,10,0.3)`, backdropFilter: "blur(6px)",
          }}
        >
          <span style={{ color: P.hud, fontWeight: 800, fontSize: 32 * s, letterSpacing: 3 * s }}>{title}</span>
          <span style={{ width: 6 * s, height: 6 * s, borderRadius: 99, background: col }} />
          <span style={{ color: col, fontWeight: 700, fontSize: 32 * s, letterSpacing: 3 * s }}>{st.label}</span>
          {st.label !== "OMBAK DATANG" && (
            <span style={{ color: P.hud, fontWeight: 700, fontSize: 32 * s, fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 * s, marginTop: 14 * s, marginLeft: 6 * s }}>
          <div style={{ width: 300 * s, height: 8 * s, background: "rgba(255,244,226,0.22)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${fill * 100}%`, height: "100%", background: col, borderRadius: 99 }} />
          </div>
          <span style={{ color: P.hudDim, fontWeight: 600, fontSize: 32 * s, letterSpacing: 2 * s, fontVariantNumeric: "tabular-nums", textShadow: "0 1px 6px rgba(60,30,10,0.5)" }}>
            PANTAI · {clockAt(t)}
          </span>
        </div>
      </div>
    </div>
  );
};
