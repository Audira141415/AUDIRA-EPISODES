// INNERWORKS overlay — cutaway title, RPM readout and part legend on the 1080 × 1920 layout canvas
// (render it through FilmScene's `overlay`, which scales it with useFormat()). Labels 32 px, key
// text ≥ 36 px, everything inside y 180…1540. Dark ink on light chips for the bright studio look.

import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { seg, ease, rpmAt } from "../core/motion";
import { INNERWORKS_PALETTE as P } from "../lib/palette";

const CHIP: React.CSSProperties = { background: "rgba(244,247,246,0.93)", borderRadius: 12, boxShadow: "0 6px 20px rgba(20,40,40,0.12)" };

const PARTS = [
  { name: "RODA PENGGERAK · 24T", color: P.brassGear, at: 200 },
  { name: "PINION · 15T", color: P.hardenedShaft, at: 200 },
  { name: "RODA OUTPUT · 30T", color: P.brassGear, at: 200 },
];

export const InnerworksOverlay: React.FC<{ f: number }> = ({ f }) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? 96 : 60;
  const top = fmt.safe.top;
  const bottom = H - fmt.safe.bottom;
  const intro = seg(f, 0, 30, ease.smooth);
  const rpm = Math.round(rpmAt(f) / 10) * 10;
  const section = seg(f, 90, 120, ease.smooth) * (1 - seg(f, 260, 290, ease.smooth));
  const legendIn = seg(f, PARTS[0].at - 10, PARTS[0].at + 10, ease.smooth);

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none", color: P.inkText }}>
      <div style={{ position: "absolute", left: side, right: side, top, opacity: intro, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ ...CHIP, padding: "18px 26px" }}>
          <div style={{ fontFamily: DISPLAY.grotesk, fontWeight: 600, fontSize: 36, letterSpacing: 4, color: "#06697a" }}>INNERWORKS // 05</div>
          <div style={{ fontFamily: DISPLAY.condensed, fontSize: 72, lineHeight: 1.05, letterSpacing: 1 }}>DI DALAM GEARBOX</div>
        </div>
        <div style={{ ...CHIP, padding: "14px 20px", textAlign: "right", fontFamily: DISPLAY.grotesk }}>
          <div style={{ fontSize: 36, color: "#4a5961" }}>RPM</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: "#c2410c" }}>{rpm}</div>
        </div>
      </div>

      {section > 0.5 ? (
        <div style={{ position: "absolute", right: side, top: top + 230, ...CHIP, padding: "10px 18px", border: `2px solid ${P.xrayCyan}`, fontFamily: DISPLAY.grotesk, fontSize: 36, fontWeight: 600, color: "#06697a" }}>
          ▸ POTONGAN B-B
        </div>
      ) : null}

      <div style={{ position: "absolute", right: side, bottom: H - bottom + 10, ...CHIP, transform: `translateX(${(1 - legendIn) * 760}px)`, padding: "18px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
        {PARTS.map((p) => {
          return (
            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: DISPLAY.grotesk, fontWeight: 600, fontSize: 36 }}>
              <span style={{ width: 22, height: 22, borderRadius: 11, background: p.color, border: "2px solid rgba(0,0,0,0.15)" }} />
              {p.name}
            </div>
          );
        })}
        <div style={{ marginTop: 6, fontFamily: DISPLAY.grotesk, fontSize: 36, color: "#4a5961" }}>RASIO 24 : 30 → putaran output 0,8×</div>
      </div>
    </div>
  );
};
