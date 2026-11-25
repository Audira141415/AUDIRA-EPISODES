// DATAPHYSICAL overlay — museum-label HUD on the layout canvas (1080 × 1920 or 1920 × 1080), rendered
// through FilmScene's `overlay`, which scales it with useFormat(). Text ≥ 36 px,
// everything inside the safe area (9:16: y 180…1540).
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { DATAPHYSICAL_PALETTE as C } from "../lib/palette";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const PANEL: React.CSSProperties = { background: "rgba(14,15,18,0.82)", borderLeft: `6px solid ${C.focalOrange}`, padding: "20px 26px" };

export const DataPhysicalOverlay: React.FC<{ f: number }> = ({ f }) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? 96 : 64;
  const top = fmt.safe.top + 16;
  const bottom = fmt.safe.bottom + 10;
  const t = f / 60;
  const headIn = clamp01((t - 0.2) / 0.5);
  const quoteIn = clamp01((t - 1.2) / 0.5) * (1 - clamp01((t - 7.6) / 0.3));
  const payIn = clamp01((t - 8.1) / 0.3);
  const pct = Math.round(54 * clamp01((t - 7.4) / 1.8));

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none", color: "#ECEFF4" }}>
      <div style={{ position: "absolute", left: side, right: side, top, opacity: headIn, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
        <div>
          <div style={{ fontFamily: DISPLAY.grotesk, fontSize: 36, fontWeight: 700, letterSpacing: 3, color: C.brassGold, background: "rgba(8,10,14,0.78)", padding: "4px 12px", display: "inline-block" }}>● SCULPTURAL TELEMETRY</div>
          <div style={{ fontFamily: DISPLAY.condensed, fontSize: 88, lineHeight: 1.0, marginTop: 8, letterSpacing: 1, textShadow: "0 4px 18px rgba(0,0,0,0.6)" }}>Q4 CAPEX MONOLITH</div>
        </div>
        <div style={{ fontFamily: DISPLAY.grotesk, fontSize: 36, fontWeight: 700, letterSpacing: 2, padding: "8px 16px", border: `2px solid ${C.focalOrange}`, background: "rgba(14,15,18,0.82)", whiteSpace: "nowrap", flexShrink: 0 }}>
          DATA PHYSICAL // 37
        </div>
      </div>

      {/* Before the payoff: the museum label. After it: the record figure. */}
      <div style={{ position: "absolute", left: side, right: side, bottom, opacity: quoteIn, ...PANEL, maxHeight: H * 0.14 }}>
        <div style={{ fontFamily: DISPLAY.body, fontSize: 40, fontWeight: 600, lineHeight: 1.3 }}>
          Setiap kolom adalah satu unit yang bisa dihitung, dibubut dari aluminium.
        </div>
        <div style={{ fontFamily: DISPLAY.grotesk, fontSize: 36, letterSpacing: 2, color: "rgba(236,239,244,0.85)", marginTop: 10 }}>WALNUT · ALUMINIUM · KUNINGAN</div>
      </div>
      <div style={{ position: "absolute", left: side, right: side, bottom, opacity: payIn, ...PANEL, maxHeight: H * 0.18, transform: `translateY(${(1 - payIn) * 30}px)` }}>
        <div style={{ fontFamily: DISPLAY.condensed, fontSize: 110, lineHeight: 0.95, color: "#FF7A3D" }}>+{pct}%</div>
        <div style={{ fontFamily: DISPLAY.body, fontSize: 38, fontWeight: 600, lineHeight: 1.3, marginTop: 4 }}>Belanja modal Q4 menembus benchmark.</div>
      </div>
    </div>
  );
};
