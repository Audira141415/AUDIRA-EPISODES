import React from "react";
import { FILMNOIR_PALETTE as P } from "../../kits/filmnoir/lib/palette.ts";

const SERIF = "'Times New Roman', Georgia, serif";
const MONO = "'Courier New', Courier, monospace";

/** Cover typography: case-file kicker + serif headline top-left (y >= 262), fact card above the 380 px bottom safe zone. */
export const Ep10Overlay: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const s = height / 1920;
  return (
    <div style={{ position: "absolute", inset: 0, width, height, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 60 * s, top: 262 * s }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28 * s, letterSpacing: 6 * s, color: P.streetLightTungsten }}>
          ● AUDIRA AI TUTORIAL
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 900,
            fontSize: 118 * s,
            lineHeight: 0.98,
            color: "#F4EFE4",
            marginTop: 14 * s,
            letterSpacing: 1 * s,
            textShadow: `0 ${4 * s}px ${22 * s}px rgba(0,0,0,0.95)`,
          }}
        >
          CHAT AI-MU
          <br />
          <span style={{ color: P.streetLightTungsten }}>DISIMPAN?</span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 60 * s,
          right: 60 * s,
          bottom: 400 * s,
          background: "rgba(8,10,13,0.86)",
          borderLeft: `${6 * s}px solid ${P.streetLightTungsten}`,
          padding: `${18 * s}px ${26 * s}px`,
          boxShadow: `0 ${8 * s}px ${26 * s}px rgba(0,0,0,0.6)`,
        }}
      >
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22 * s, letterSpacing: 4 * s, color: P.streetLightTungsten }}>
          GEMINI APPS ACTIVITY // HAPUS AKTIVITAS
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 38 * s, lineHeight: 1.3, color: "#F1F5F9", marginTop: 8 * s }}>
          Walau dimatikan, chat tetap disimpan sampai 72 jam.
        </div>
      </div>
    </div>
  );
};
