import React from "react";
import { useVideoConfig } from "remotion";
import { PAINT as P } from "../lib/palette.ts";
import { layerAt, LAYERS } from "../core/motion.ts";

const SWATCHES = [P.zenith, P.grass, P.leafShadow, P.scarf, P.cloak];

/**
 * A canvas-coloured painter's chip (from y = 262 px): "LUKIS · LAPIS 3/5", the layer name, and a
 * row of five paint swatches that fill in as the layers go on. Authored at 1080×1920, scaled by height.
 */
export const PainterlyOverlay: React.FC<{ t: number; title?: string }> = ({ t, title = "LUKIS" }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  const L = layerAt(t);
  const fade = Math.min(1, t / 0.4);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div style={{ position: "absolute", top: 262 * s, left: 64 * s, opacity: fade }}>
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 16 * s, background: P.hudCanvas,
            padding: `${12 * s}px ${24 * s}px ${12 * s}px ${20 * s}px`,
            borderRadius: `${14 * s}px ${6 * s}px ${16 * s}px ${8 * s}px`,
            boxShadow: `0 ${8 * s}px ${24 * s}px rgba(30,24,40,0.28)`,
            borderLeft: `${7 * s}px solid ${P.accent}`,
          }}
        >
          <span style={{ color: P.hudInk, fontWeight: 700, fontSize: 32 * s, letterSpacing: 3 * s }}>{title}</span>
          <span style={{ color: P.hudDim, fontSize: 32 * s }}>·</span>
          <span style={{ color: P.hudInk, fontWeight: 600, fontSize: 32 * s, letterSpacing: 3 * s, fontVariantNumeric: "tabular-nums" }}>
            LAPIS {L.index + 1}/{LAYERS.length}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 * s, marginTop: 12 * s, marginLeft: 4 * s }}>
          {SWATCHES.map((c, i) => {
            const on = i <= L.index;
            return (
              <div
                key={i}
                style={{
                  width: 34 * s, height: 20 * s, background: c, opacity: on ? 1 : 0.28,
                  borderRadius: `${10 * s}px ${4 * s}px ${9 * s}px ${5 * s}px`,
                  transform: `rotate(${(i % 2 ? -1 : 1) * 4}deg) scale(${on ? 1 : 0.85})`,
                  boxShadow: on ? `0 ${2 * s}px ${6 * s}px rgba(0,0,0,0.25)` : "none",
                }}
              />
            );
          })}
          <span style={{ color: "rgba(255,248,232,0.95)", fontWeight: 700, fontSize: 32 * s, letterSpacing: 3 * s, marginLeft: 6 * s, textShadow: `0 ${2 * s}px ${8 * s}px rgba(20,16,30,0.55)` }}>
            {L.name}
          </span>
        </div>
      </div>
    </div>
  );
};
