import React from "react";
import { useVideoConfig } from "remotion";
import { INFLATABLE_PALETTE as P } from "../lib/palette.ts";

/**
 * A puffy pill chip (from y = 262 px) with a pressure gauge that fills each time a toy inflates.
 * Authored at 1080×1920, scaled by height.
 */
export const InflatableOverlay: React.FC<{ t: number; pops: number[]; title?: string; label?: string }> = ({ t, pops, title = "TIUP!", label = "MAINAN ANGIN" }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  const done = pops.filter((p) => p <= t).length;
  const last = Math.max(-1, ...pops.filter((p) => p <= t));
  const bump = last >= 0 ? Math.exp(-(t - last) * 8) : 0;
  const fade = Math.min(1, t / 0.4);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif" }}>
      <div style={{ position: "absolute", top: 262 * s, left: 64 * s, opacity: fade }}>
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 16 * s, background: P.chip, borderRadius: 999,
            padding: `${12 * s}px ${26 * s}px`, boxShadow: `0 ${8 * s}px ${24 * s}px rgba(122,61,99,0.25)`,
            transform: `scale(${1 + 0.08 * bump})`, transformOrigin: "left center",
          }}
        >
          <span style={{ color: P.accent, fontWeight: 900, fontSize: 34 * s }}>{title}</span>
          <span style={{ color: P.hud, fontWeight: 700, fontSize: 24 * s, letterSpacing: 3 * s }}>{label}</span>
          <span style={{ color: P.hudDim, fontWeight: 700, fontSize: 24 * s }}>{String(done).padStart(2, "0")}/{String(pops.length).padStart(2, "0")}</span>
        </div>
        <div style={{ display: "flex", gap: 6 * s, marginTop: 12 * s, marginLeft: 10 * s }}>
          {pops.map((p, i) => (
            <div key={i} style={{ width: 16 * s, height: 16 * s, borderRadius: 99, background: p <= t ? P.letters[i % P.letters.length] : "rgba(58,35,64,0.15)" }} />
          ))}
        </div>
      </div>
    </div>
  );
};
