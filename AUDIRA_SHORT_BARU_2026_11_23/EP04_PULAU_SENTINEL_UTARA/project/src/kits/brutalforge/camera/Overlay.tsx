// BRUTALFORGE overlay — black-bordered boxes with hard offset shadows on the 1080 × 1920 layout
// canvas (render it through FilmScene's `overlay`). Text ≥ 36 px, inside y 180…1540.
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { BRUTAL_PALETTE as C } from "../lib/palette";

const pop = (f: number, at: number) => {
  const t = Math.min(1, Math.max(0, (f - at) / 12));
  return t < 1 ? 1 - Math.pow(1 - t, 3) * Math.cos(t * 9) : 1; // hard overshoot, no soft fade
};

const Box: React.FC<{ bg: string; children: React.ReactNode; shadow?: number; style?: React.CSSProperties }> = ({ bg, children, shadow = 10, style }) => (
  <div style={{ background: bg, border: `6px solid ${C.inkBlack}`, boxShadow: `${shadow}px ${shadow}px 0 ${C.inkBlack}`, ...style }}>{children}</div>
);

export const BrutalOverlay: React.FC<{ f: number; title?: string; body?: string; chips?: [string, string] }> = ({
  f,
  title = "NEO-BRUTALISM 3D",
  body = "Tepi hitam tegas, warna listrik, bayangan keras. Berhenti scroll dalam satu detik.",
  chips = ["FAST & LOUD", "120 BPM"],
}) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? 96 : 60;
  const top = fmt.safe.top + 16;
  const bottom = H - fmt.safe.bottom;
  const a = pop(f, 6);
  const b = pop(f, 14);
  const c = pop(f, 26);
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: side, top, display: "flex", gap: 22 }}>
        <Box bg={C.hotPink} style={{ padding: "10px 24px", transform: `scale(${a}) rotate(-2deg)` }}>
          <span style={{ fontFamily: DISPLAY.condensed, fontSize: 52, color: C.pureWhite, letterSpacing: 1 }}>{chips[0]}</span>
        </Box>
        <Box bg={C.acidGreen} style={{ padding: "10px 22px", transform: `scale(${b}) rotate(2deg)` }}>
          <span style={{ fontFamily: DISPLAY.condensed, fontSize: 52, color: C.inkBlack, letterSpacing: 1 }}>{chips[1]}</span>
        </Box>
      </div>
      <Box
        bg={C.pureWhite}
        shadow={14}
        style={{ position: "absolute", left: side, right: side + 14, bottom: H - bottom + 14, padding: "26px 32px 30px", transform: `translateY(${(1 - c) * 60}px)`, opacity: Math.min(1, c * 2) }}
      >
        <div style={{ fontFamily: DISPLAY.condensed, fontSize: 96, lineHeight: 1, color: C.inkBlack, letterSpacing: 1 }}>{title}</div>
        <div style={{ marginTop: 14, fontFamily: DISPLAY.grotesk, fontWeight: 700, fontSize: 40, lineHeight: 1.22, color: "#1b1b1b" }}>{body}</div>
      </Box>
    </div>
  );
};
