// TEXTVOYAGE overlay — manifesto chapter card on the 1080 × 1920 layout canvas (render it through
// FilmScene's `overlay`, which scales it with useFormat()). Card sits in the empty sky under the top
// safe line so the corridor below stays clear. Text ≥ 36 px, inside y 180…1540.
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { TEXTVOYAGE_PALETTE as C } from "../lib/palette";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const TextvoyageOverlay: React.FC<{ f: number; totalFrames?: number; title?: string }> = ({
  f,
  totalFrames = 480,
  title = "THE THRESHOLD OF CHANGE",
}) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? 96 : 64;
  const top = fmt.safe.top + 10;
  const cardIn = clamp01((f - 40) / 36);
  const progress = clamp01(f / totalFrames);
  const secs = Math.floor(f / 60);

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: side,
          right: side,
          top,
          background: "rgba(8,8,10,0.86)",
          borderLeft: `10px solid ${C.coreAccentGold}`,
          borderRadius: 14,
          padding: "22px 32px 20px",
          opacity: cardIn,
          transform: `translateY(${(1 - cardIn) * -40}px)`,
        }}
      >
        <div style={{ fontFamily: DISPLAY.grotesk, fontWeight: 600, fontSize: 36, letterSpacing: 4, color: C.coreAccentGold }}>TEXTVOYAGE 28 // CHAPTER 1</div>
        <div style={{ marginTop: 8, fontFamily: DISPLAY.condensed, fontSize: 72, lineHeight: 1, letterSpacing: 2, color: "#ffffff" }}>{title}</div>
        <div style={{ marginTop: 16, height: 6, background: "rgba(255,255,255,0.14)", borderRadius: 3 }}>
          <div style={{ width: `${progress * 100}%`, height: "100%", background: "#ffffff", borderRadius: 3 }} />
        </div>
        <div style={{ marginTop: 10, fontFamily: DISPLAY.grotesk, fontSize: 36, letterSpacing: 3, color: "#b8b8c0" }}>00:{String(secs).padStart(2, "0")}</div>
      </div>
    </div>
  );
};
