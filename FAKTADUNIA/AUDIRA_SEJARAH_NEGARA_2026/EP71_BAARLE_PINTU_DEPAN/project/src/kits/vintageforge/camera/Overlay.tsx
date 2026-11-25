// VINTAGEFORGE overlay — engraved-plate captions on the 1080 × 1920 layout canvas (render it through
// FilmScene's `overlay`). Text ≥ 36 px, inside y 180…1540.
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { VINTAGE_PALETTE as C } from "../lib/palette";

const ease = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

export const VintageOverlay: React.FC<{ f: number; plate?: string; title?: string; body?: string }> = ({
  f,
  plate = "Figura Machina · Anno MDCLXXII",
  title = "Mekanika Langit",
  body = "Cincin kuningan memetakan gerak matahari dan bintang di sekitar bumi.",
}) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? 96 : 64;
  const top = fmt.safe.top + 20;
  const bottom = H - fmt.safe.bottom;
  const a = ease((f - 15) / 45);
  const b = ease((f - 70) / 50);
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: side, right: side, top, padding: "10px 22px 12px", background: "rgba(243,234,214,0.94)", borderBottom: `3px double ${C.engravingBrown}`, opacity: a }}>
        <span style={{ fontFamily: DISPLAY.serif, fontStyle: "italic", fontSize: 44, color: C.engravingBrown }}>{plate}</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: side,
          right: side,
          bottom: H - bottom + 10,
          padding: "26px 32px 30px",
          background: "rgba(243,234,214,0.92)",
          border: `3px solid ${C.agedGold}`,
          outline: `1px solid ${C.engravingBrown}`,
          outlineOffset: -10,
          opacity: b,
          transform: `translateY(${(1 - b) * 30}px)`,
        }}
      >
        <div style={{ fontFamily: DISPLAY.serif, fontSize: 88, lineHeight: 1, color: C.engravingBrown }}>{title}</div>
        <div style={{ marginTop: 14, fontFamily: DISPLAY.serif, fontStyle: "italic", fontSize: 42, lineHeight: 1.25, color: C.ironGallInk }}>{body}</div>
      </div>
    </div>
  );
};
