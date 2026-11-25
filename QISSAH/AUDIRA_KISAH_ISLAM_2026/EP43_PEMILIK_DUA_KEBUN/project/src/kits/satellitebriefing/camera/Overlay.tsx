// SATELLITEBRIEFING overlay — OSINT briefing header, altitude ladder, scale bar and analyst quote on
// the 1080 × 1920 layout canvas (render it through FilmScene's `overlay`, which scales it with
// useFormat()). Labels 32 px, key text ≥ 36 px, everything inside y 180…1540.
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { SATELLITEBRIEFING_PALETTE as C } from "../lib/palette";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const CARD: React.CSSProperties = { background: "rgba(8,11,15,0.86)", borderRadius: 10 };

export const SatelliteBriefingOverlay: React.FC<{ f: number }> = ({ f }) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? 96 : 60;
  const top = fmt.safe.top;
  const bottom = H - fmt.safe.bottom;
  const t = f / 60;
  const headIn = clamp01(f / 30);
  const quoteIn = clamp01((f - 150) / 30);
  // Altitude follows the rig's descent (6.8 -> 3.54 km over 2 s).
  const alt = 6.8 * Math.pow(0.52, Math.min(1, t / 2));
  const lock = t > 8 ? "LOCK" : "SCAN";

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none", color: "#ECEFF4" }}>
      {/* Header */}
      <div style={{ position: "absolute", left: side, right: side, top, padding: "22px 28px", opacity: headIn, ...CARD }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: DISPLAY.grotesk, fontWeight: 600, fontSize: 36, letterSpacing: 3, color: C.readingAmber }}>
          <span>● SENTINEL OPTIK</span>
          <span style={{ background: C.claimBlue, color: "#fff", padding: "2px 14px", borderRadius: 18 }}>OSINT // 38</span>
        </div>
        <div style={{ marginTop: 6, fontFamily: DISPLAY.condensed, fontSize: 72, lineHeight: 1.05, letterSpacing: 1, color: "#fff" }}>STRAIT RECONNAISSANCE</div>
        <div style={{ marginTop: 4, fontFamily: DISPLAY.grotesk, fontSize: 36, letterSpacing: 2, color: "#A9B4BC" }}>
          01°16'N 104°05'E · ALT {alt.toFixed(2)} km
        </div>
      </div>

      {/* Altitude ladder moved into the header card — removed left-edge ticks that sat on the terrain */}

      {/* Status chip + scale bar */}
      <div style={{ position: "absolute", right: side, top: bottom - 330, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
        <span style={{ ...CARD, padding: "6px 16px", fontFamily: DISPLAY.grotesk, fontWeight: 700, fontSize: 36, letterSpacing: 3, color: lock === "LOCK" ? C.readingAmber : "#ECEFF4" }}>
          {lock === "LOCK" ? "◉ TARGET ALPHA" : "◌ SCANNING"}
        </span>
        <div style={{ width: 200, height: 14, borderLeft: "3px solid #fff", borderRight: "3px solid #fff", borderBottom: "3px solid #fff" }} />
        <span style={{ fontFamily: DISPLAY.grotesk, fontSize: 36, color: "#ECEFF4" }}>500 m</span>
      </div>

      {/* Analyst quote */}
      <div
        style={{
          position: "absolute",
          left: side,
          right: side,
          bottom: H - bottom + 10,
          padding: "22px 28px",
          borderLeft: `8px solid ${C.readingAmber}`,
          opacity: quoteIn,
          transform: `translateY(${(1 - quoteIn) * 30}px)`,
          ...CARD,
        }}
      >
        <div style={{ fontFamily: DISPLAY.grotesk, fontWeight: 500, fontSize: 38, lineHeight: 1.3 }}>
          "Tiga titik terkunci. Satu kapal melintasi selat."
        </div>
        <div style={{ marginTop: 8, fontFamily: DISPLAY.grotesk, fontSize: 36, letterSpacing: 2, color: "#8FA0AB" }}>RES 2.4 m/px · NADIR</div>
      </div>
    </div>
  );
};
