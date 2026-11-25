import React from "react";
import { useVideoConfig } from "remotion";
import { ChainTiming, EVENTS, filmTime } from "../core/chain";
import { clamp01 } from "../core/motion";
import { CHAINREACTION_PALETTE as P } from "../lib/palette";

// Small step chip: which link of the chain is firing. Authored at 1080×1920, scaled by height;
// starts at y = 262 px (below the AudiraSignature start position and the 180 px top band).
export const ChainreactionOverlay: React.FC<{ t: number; timing: ChainTiming; title?: string }> = ({ t, timing, title = "REAKSI BERANTAI" }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  const steps = EVENTS;
  let cur = -1;
  steps.forEach((e, i) => { if (filmTime(e.m, timing) <= t) cur = i; });
  const fadeIn = clamp01((t - 0.2) / 0.5);
  const label = cur >= 0 ? steps[cur].label : "SIAP";
  const pop = cur >= 0 ? clamp01((t - filmTime(steps[cur].m, timing)) / 0.18) : 1;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif" }}>
      <div style={{ position: "absolute", top: 262 * s, left: 64 * s, opacity: fadeIn }}>
        <div style={{ fontSize: 32 * s, letterSpacing: 6 * s, fontWeight: 700, color: P.accent, marginBottom: 12 * s }}>{title}</div>
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 14 * s, background: P.chip, borderRadius: 999,
            padding: `${12 * s}px ${22 * s}px`, color: P.ink, fontWeight: 800, fontSize: 32 * s, letterSpacing: 2 * s,
            transform: `scale(${0.92 + 0.08 * pop})`, transformOrigin: "left center",
          }}
        >
          <span style={{ color: P.accent }}>{String(Math.max(0, cur + 1)).padStart(2, "0")}</span>
          <span>{label}</span>
        </div>
        <div style={{ display: "flex", gap: 8 * s, marginTop: 14 * s }}>
          {steps.map((e, i) => (
            <div key={e.name} style={{ width: (i === cur ? 34 : 12) * s, height: 8 * s, borderRadius: 4 * s, background: i <= cur ? P.accent : P.inkDim, opacity: i <= cur ? 1 : 0.35 }} />
          ))}
        </div>
      </div>
    </div>
  );
};
