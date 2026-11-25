// MEMPHISDIORAMA overlay — Milano tag + caption card on the 1080 × 1920 layout canvas (render it
// through FilmScene's `overlay`). Text ≥ 36 px, inside y 180…1540.
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { MEMPHISDIORAMA_PALETTE as C } from "../lib/palette";

const pop = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t < 1 ? 1 - Math.pow(1 - t, 3) * Math.cos(t * 7) : 1;
};

export const MemphisDioramaOverlay: React.FC<{ f: number; kicker?: string; badge?: string; title?: string; body?: string }> = ({
  f,
  kicker = "MILANO 1981 · SOTTSASS",
  badge = "MEMPHIS #36",
  title = "Meja Terrazzo",
  body = "Bentuk geometris tebal, warna permen, bayangan ungu yang tegas.",
}) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? 96 : 60;
  const top = fmt.safe.top + 16;
  const bottom = H - fmt.safe.bottom;
  const a = pop((f - 8) / 20);
  const b = pop((f - 40) / 24);
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: side, right: side, top, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: DISPLAY.grotesk, fontWeight: 700, fontSize: 40, letterSpacing: 2, color: C.indigoInk, transform: `scale(${a})`, transformOrigin: "left center" }}>
          <span style={{ color: "#D93A40" }}>● </span>
          {kicker}
        </div>
        <div style={{ background: C.indigoInk, color: C.canaryYellow, padding: "8px 18px", fontFamily: DISPLAY.condensed, fontSize: 44, letterSpacing: 1, transform: `rotate(3deg) scale(${a})` }}>{badge}</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: side,
          right: side,
          bottom: H - bottom + 10,
          background: "#fff",
          border: `5px solid ${C.indigoInk}`,
          boxShadow: `12px 12px 0 ${C.shadowPurple}`,
          padding: "24px 30px 28px",
          transform: `scale(${0.9 + b * 0.1})`,
          transformOrigin: "left bottom",
          opacity: Math.min(1, b * 1.5),
        }}
      >
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          {[C.coralPink, C.canaryYellow, C.skyBlue, C.mintGreen].map((c) => (
            <div key={c} style={{ width: 44, height: 12, background: c }} />
          ))}
        </div>
        <div style={{ fontFamily: DISPLAY.condensed, fontSize: 92, lineHeight: 1, color: C.indigoInk, letterSpacing: 1 }}>{title}</div>
        <div style={{ marginTop: 12, fontFamily: DISPLAY.body, fontWeight: 600, fontSize: 38, lineHeight: 1.3, color: "#3b3760" }}>{body}</div>
      </div>
    </div>
  );
};
