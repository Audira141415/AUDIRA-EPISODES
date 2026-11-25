// RETROWAVE overlay — VHS HUD + neon title on the 1080 × 1920 layout canvas (render it through
// FilmScene's `overlay`, which scales it with useFormat()). Text ≥ 36 px, inside y 180…1540.
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { RETROWAVE_PALETTE as C } from "../lib/palette";

/** Dark VHS backing so the HUD stays readable when the sun rises behind it. */
const HUD_CHIP: React.CSSProperties = { background: "rgba(12,8,26,0.72)", padding: "2px 12px" };

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const RetrowaveOverlay: React.FC<{ f: number; title?: string; subtitle?: string }> = ({
  f,
  title = "RETROWAVE 1986",
  subtitle = "Grid neon tanpa ujung menuju matahari senja.",
}) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? 96 : 64;
  const top = fmt.safe.top + 16;
  const bottom = H - fmt.safe.bottom;
  const s = Math.floor(f / 60);
  const tc = `00:24:${String(19 + s).padStart(2, "0")}`;
  const titleIn = clamp01((f - 30) / 30);
  const subIn = clamp01((f - 60) / 30);
  const blink = Math.floor(f / 30) % 2 === 0;

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }}>
      {/* Scanlines */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0 2px, transparent 2px 5px)" }} />
      <div style={{ position: "absolute", left: side, right: side, top, display: "flex", justifyContent: "space-between", fontFamily: DISPLAY.pixel, fontSize: 40, color: C.phosphorGreen, textShadow: "0 0 10px rgba(57,255,20,0.6)" }}>
        <span style={HUD_CHIP}>{blink ? "PLAY ▶" : "PLAY  "}</span>
        <span style={HUD_CHIP}>{tc}</span>
      </div>
      <div style={{ position: "absolute", left: side, top: top + 60, fontFamily: DISPLAY.pixel, fontSize: 36, color: C.chromeSilver, ...HUD_CHIP }}>SP · HI-FI</div>

      <div style={{ position: "absolute", left: side, right: side, bottom: H - bottom + 10 }}>
        <div
          style={{
            fontFamily: DISPLAY.condensed,
            fontSize: 132,
            lineHeight: 0.95,
            fontStyle: "italic",
            color: "#FFE3F2",
            letterSpacing: 2,
            textShadow: `0 0 18px ${C.neonMagenta}, 0 0 46px ${C.neonMagenta}, 6px 6px 0 #3a0a4a`,
            transform: `skewX(-8deg) translateX(${(1 - titleIn) * -80}px)`,
            opacity: titleIn,
          }}
        >
          {title}
        </div>
        <div style={{ marginTop: 18, fontFamily: DISPLAY.grotesk, fontWeight: 500, fontSize: 40, lineHeight: 1.25, color: C.synthCyan, opacity: subIn, textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
};
