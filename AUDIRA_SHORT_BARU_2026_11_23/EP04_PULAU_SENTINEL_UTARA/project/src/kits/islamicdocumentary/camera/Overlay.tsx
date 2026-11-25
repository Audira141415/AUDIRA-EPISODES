// ISLAMICDOCUMENTARY overlay — documentary title card on the layout canvas (1080 × 1920 or
// 1920 × 1080), rendered through FilmScene's `overlay`, which scales it with useFormat().
// Text ≥ 36 px, everything inside the safe area (9:16: y 180…1540).
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { ISLAMICDOCUMENTARY_PALETTE as C } from "../lib/palette";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const PANEL: React.CSSProperties = { background: "rgba(10,18,32,0.84)", borderLeft: `6px solid ${C.royalGold}`, padding: "20px 26px" };

export const IslamicDocumentaryOverlay: React.FC<{ f: number }> = ({ f }) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? 96 : 64;
  const top = fmt.safe.top + 16;
  const bottom = fmt.safe.bottom + 10;
  const t = f / 60;
  const headIn = clamp01((t - 0.2) / 0.6);
  const quoteIn = clamp01((t - 1.4) / 0.6) * (1 - clamp01((t - 8.2) / 0.3));
  const payIn = clamp01((t - 8.6) / 0.3);

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none", color: "#F4ECD8" }}>
      <div style={{ position: "absolute", left: side, right: side, top, opacity: headIn }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
          <div style={{ fontFamily: DISPLAY.grotesk, fontSize: 36, fontWeight: 700, letterSpacing: 3, color: C.royalGold, background: "rgba(8,10,14,0.78)", padding: "4px 12px", display: "inline-block" }}>● BAGHDAD · ABAD KE-9</div>
          <div style={{ fontFamily: DISPLAY.grotesk, fontSize: 36, fontWeight: 700, letterSpacing: 2, padding: "6px 14px", border: `2px solid ${C.royalGold}`, background: "rgba(10,18,32,0.84)" }}>DOKUMENTER // 43</div>
        </div>
        <div style={{ fontFamily: DISPLAY.serif, fontSize: 92, lineHeight: 1.0, marginTop: 12, textShadow: "0 4px 18px rgba(0,0,0,0.7)" }}>Era Keemasan Ilmu Pengetahuan</div>
      </div>

      <div style={{ position: "absolute", left: side, right: side, bottom, opacity: quoteIn, ...PANEL }}>
        <div style={{ fontFamily: DISPLAY.body, fontSize: 40, fontWeight: 600, lineHeight: 1.3 }}>Di kota bundar Baghdad, naskah sains dunia diterjemahkan dan disalin ulang.</div>
        <div style={{ fontFamily: DISPLAY.grotesk, fontSize: 36, letterSpacing: 2, marginTop: 10, color: "rgba(244,236,216,0.85)" }}>GEOMETRI GIRIH · TANPA FIGUR</div>
      </div>
      <div style={{ position: "absolute", left: side, right: side, bottom, opacity: payIn, ...PANEL, transform: `translateY(${(1 - payIn) * 30}px)` }}>
        <div style={{ fontFamily: DISPLAY.serif, fontSize: 104, lineHeight: 1.0, color: C.royalGold }}>Baitul Hikmah</div>
        <div style={{ fontFamily: DISPLAY.body, fontSize: 40, fontWeight: 600, lineHeight: 1.3, marginTop: 6 }}>Rumah Kebijaksanaan, pusat ilmu dunia pada masa al-Ma'mun.</div>
      </div>
    </div>
  );
};
