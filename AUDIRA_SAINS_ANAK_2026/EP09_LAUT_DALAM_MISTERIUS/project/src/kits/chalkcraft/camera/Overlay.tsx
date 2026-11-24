// CHALKCRAFT overlay — formula + lesson card on the 1080 × 1920 layout canvas (render it through
// FilmScene's `overlay`). Text ≥ 36 px, inside y 180…1540.
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { CHALK_PALETTE as C } from "../lib/palette";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const ChalkOverlay: React.FC<{ f: number; formula?: string; title?: string; body?: string }> = ({
  f,
  formula = "iℏ ∂Ψ/∂t = ĤΨ",
  title = "Persamaan Schrödinger",
  body = "Garis kapur memetakan peluang posisi elektron di sekitar inti atom.",
}) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? 96 : 64;
  const top = fmt.safe.top + 20;
  const bottom = H - fmt.safe.bottom;
  const write = clamp01((f - 20) / 50);
  const card = clamp01((f - 70) / 30);
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: side,
          top,
          fontFamily: DISPLAY.serif,
          fontStyle: "italic",
          fontSize: 76,
          color: C.chalkAmber,
          textShadow: "0 0 2px rgba(255,209,102,0.6), 0 4px 18px rgba(0,0,0,0.8)",
          clipPath: `inset(-20px ${(1 - write) * 100}% -20px -20px)`,
        }}
      >
        {formula}
      </div>
      <div
        style={{
          position: "absolute",
          left: side,
          right: side,
          bottom: H - bottom + 10,
          padding: "26px 30px 30px",
          background: "rgba(22,25,29,0.86)",
          borderLeft: `8px solid ${C.chalkCyan}`,
          borderRadius: 6,
          opacity: card,
          transform: `translateY(${(1 - card) * 40}px)`,
        }}
      >
        <div style={{ fontFamily: DISPLAY.serif, fontSize: 72, lineHeight: 1.05, color: C.chalkWhite }}>{title}</div>
        <div style={{ marginTop: 12, fontFamily: DISPLAY.body, fontWeight: 500, fontSize: 38, lineHeight: 1.3, color: "#cfd6de" }}>{body}</div>
      </div>
    </div>
  );
};
