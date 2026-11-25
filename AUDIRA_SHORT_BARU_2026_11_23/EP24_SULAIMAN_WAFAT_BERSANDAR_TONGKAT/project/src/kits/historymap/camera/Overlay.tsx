// HISTORYMAP overlay — war-documentary HUD on the layout canvas (1080 × 1920 or 1920 × 1080), rendered
// through FilmScene's `overlay`, which scales it with useFormat(). Text ≥ 36 px,
// everything inside the safe area (9:16: y 180…1540).
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { computeHistoryMapState } from "../core/motion";
import { HISTORYMAP_PALETTE as C } from "../lib/palette";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const PANEL: React.CSSProperties = { background: "rgba(12,16,22,0.84)", padding: "20px 26px" };

export const HistoryMapOverlay: React.FC<{ f: number }> = ({ f }) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? 96 : 64;
  const top = fmt.safe.top + 16;
  const bottom = fmt.safe.bottom + 10;
  const t = f / 60;
  const { yearTick } = computeHistoryMapState(f);
  const headIn = clamp01((t - 0.2) / 0.5);
  const quoteIn = clamp01((t - 1.2) / 0.5) * (1 - clamp01((t - 8.0) / 0.3));
  const payIn = clamp01((t - 8.5) / 0.3);

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none", color: "#EEF1F5" }}>
      <div style={{ position: "absolute", left: side, right: side, top, opacity: headIn }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
          <div style={{ fontFamily: DISPLAY.grotesk, fontSize: 36, fontWeight: 700, letterSpacing: 3, color: "#FF5A66", background: "rgba(8,10,14,0.78)", padding: "4px 12px", display: "inline-block" }}>● FRONT TIMELINE</div>
          <div style={{ fontFamily: DISPLAY.grotesk, fontSize: 36, fontWeight: 700, letterSpacing: 2, padding: "6px 14px", border: `2px solid ${C.arrowRed}`, background: "rgba(12,16,22,0.84)" }}>WAR HISTORY // 42</div>
        </div>
        <div style={{ fontFamily: DISPLAY.condensed, fontSize: 84, lineHeight: 1.02, marginTop: 10, textShadow: "0 4px 18px rgba(0,0,0,0.7)" }}>ROMA MENYEBERANGI DANUBE</div>
        <div style={{ display: "inline-block", marginTop: 12, fontFamily: DISPLAY.condensed, fontSize: 72, color: C.borderGold, background: "rgba(12,16,22,0.7)", padding: "0 16px" }}>{yearTick} M</div>
      </div>

      <div style={{ position: "absolute", left: side, right: side, bottom, opacity: quoteIn, ...PANEL, borderLeft: `6px solid ${C.arrowRed}` }}>
        <div style={{ fontFamily: DISPLAY.body, fontSize: 40, fontWeight: 600, lineHeight: 1.3 }}>Legio XIII Gemina menyeberang dan menjepit Dacia dari dua sisi.</div>
        <div style={{ fontFamily: DISPLAY.grotesk, fontSize: 36, letterSpacing: 2, marginTop: 10, color: "rgba(238,241,245,0.85)" }}>TRAJANUS · PERANG DACIA 101–106 M</div>
      </div>
      <div style={{ position: "absolute", left: side, right: side, bottom, opacity: payIn, ...PANEL, borderLeft: `6px solid ${C.borderGold}`, transform: `translateY(${(1 - payIn) * 30}px)` }}>
        <div style={{ fontFamily: DISPLAY.condensed, fontSize: 104, lineHeight: 1.0, color: C.borderGold }}>SARMIZEGETUSA JATUH</div>
        <div style={{ fontFamily: DISPLAY.body, fontSize: 40, fontWeight: 600, lineHeight: 1.3, marginTop: 6 }}>Dacia menjadi provinsi Romawi, tahun 106 M.</div>
      </div>
    </div>
  );
};
