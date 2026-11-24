import React from "react";
import { useVideoConfig } from "remotion";
import { ORIGAMI_PALETTE as P } from "../lib/palette.ts";
import { hudStep, STEPS } from "../core/motion.ts";

/**
 * A slate chip (from y = 262 px) naming the fold: "LIPAT · LANGKAH 5/9" with the fold name under
 * it and nine diamond ticks that fill as each fold is pressed flat. Authored at 1080×1920, scaled
 * by height.
 */
export const OrigamiforgeOverlay: React.FC<{ t: number; title?: string }> = ({ t, title = "LIPAT" }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  const st = hudStep(t);
  const fade = Math.min(1, t / 0.35);
  const n = STEPS.length;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div style={{ position: "absolute", top: 262 * s, left: 64 * s, opacity: fade }}>
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 16 * s, background: P.chip, borderRadius: 8 * s,
            padding: `${12 * s}px ${24 * s}px`, borderLeft: `${6 * s}px solid ${P.accent}`,
            boxShadow: `0 ${8 * s}px ${24 * s}px rgba(0,0,0,0.3)`,
          }}
        >
          <span style={{ color: P.accent, fontWeight: 700, fontSize: 32 * s, letterSpacing: 3 * s }}>{title}</span>
          <span style={{ color: P.hudDim, fontSize: 32 * s }}>·</span>
          <span style={{ color: P.hud, fontWeight: 600, fontSize: 32 * s, letterSpacing: 2 * s, fontVariantNumeric: "tabular-nums" }}>
            {st.done ? `SELESAI ${n}/${n}` : `LANGKAH ${st.index}/${n}`}
          </span>
        </div>
        <div style={{ marginTop: 12 * s, color: P.hud, fontSize: 32 * s, letterSpacing: 3 * s, fontWeight: 600, textShadow: `0 ${2 * s}px ${8 * s}px rgba(0,0,0,0.55)` }}>
          {st.name}
        </div>
        <div style={{ display: "flex", gap: 8 * s, marginTop: 12 * s }}>
          {Array.from({ length: n }, (_, i) => {
            const on = st.done || i < st.index - 1;
            const cur = !st.done && i === st.index - 1;
            return (
              <div
                key={i}
                style={{
                  width: 30 * s, height: 30 * s, transform: "rotate(45deg) scale(0.62)",
                  background: on ? P.accent : cur ? "rgba(224,87,63,0.45)" : "rgba(245,238,226,0.16)",
                  border: `${2 * s}px solid ${on || cur ? P.accent : "rgba(245,238,226,0.3)"}`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
