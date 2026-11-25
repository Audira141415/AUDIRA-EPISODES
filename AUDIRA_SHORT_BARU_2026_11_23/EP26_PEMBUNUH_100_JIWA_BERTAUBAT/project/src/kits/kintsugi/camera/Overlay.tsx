// KINTSUGI overlay — quiet editorial type on the 1080 × 1920 layout canvas (render it through
// FilmScene's `overlay`). Text ≥ 36 px, inside y 180…1540.
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { KINTSUGI_PALETTE as C } from "../lib/palette";

const ease = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

export const KintsugiOverlay: React.FC<{ f: number; title?: string; body?: string; mark?: string }> = ({
  f,
  title = "Keindahan dalam Retakan",
  body = "Wabi-sabi: retak disambung emas, sejarahnya tidak disembunyikan.",
  mark = "金継ぎ · KINTSUGI",
}) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? 96 : 72;
  const top = fmt.safe.top + 24;
  const bottom = H - fmt.safe.bottom;
  const a = ease((f - 20) / 50);
  const b = ease((f - 90) / 60);
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }}>
      <div style={{ position: "absolute", right: side, top, fontFamily: DISPLAY.serif, fontSize: 44, letterSpacing: 6, color: "#7a5214", opacity: a }}>{mark}</div>
      <div style={{ position: "absolute", left: side - 32, right: side - 32, bottom: H - bottom + 10, padding: "28px 32px 32px", background: "rgba(247,244,236,0.9)", borderRadius: 4, opacity: b, transform: `translateY(${(1 - b) * 24}px)` }}>
        <div style={{ width: 120 * b, height: 4, background: C.pureGoldLeaf, marginBottom: 22 }} />
        <div style={{ fontFamily: DISPLAY.serif, fontSize: 92, lineHeight: 1.0, color: "#1d1a17" }}>{title}</div>
        <div style={{ marginTop: 16, fontFamily: DISPLAY.body, fontWeight: 500, fontSize: 38, lineHeight: 1.35, color: "#4d4640" }}>{body}</div>
      </div>
    </div>
  );
};
