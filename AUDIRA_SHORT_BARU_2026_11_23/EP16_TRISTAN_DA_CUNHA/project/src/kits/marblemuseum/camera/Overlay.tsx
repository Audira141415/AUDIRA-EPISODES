// MARBLEMUSEUM overlay — museum HUD on the layout canvas (1080 × 1920 or 1920 × 1080; render it
// through FilmScene's `overlay`). Every text ≥ 36 px, inside the format's safe area
// (9:16: y 180…1540, sides 60).
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { MARBLE_PALETTE } from "../lib/palette";
import { labelIn, smooth } from "../core/motion";

/** Museum HUD: gallery kicker, serif title, style chip + credit, wall-label card, hook caption. */
export const MarblemuseumOverlay: React.FC<{
  t: number;
  kicker?: string;
  title?: string;
  titleItalic?: string;
  caption?: string;
  objectNo?: string;
  objectTitle?: string;
  objectLine?: string;
  objectQuote?: string;
}> = ({
  t,
  kicker = "GALLERY IV · CLASSICAL SCULPTURE",
  title = "Hall of",
  titleItalic = "Thinkers",
  caption = "Some faces were carved to outlive their names.",
  objectNo = "OBJECT 061",
  objectTitle = "Bust of an Unknown Thinker",
  objectLine = "Statuary marble, carved in the classical manner",
  objectQuote = "“Stone keeps every idea the chisel was patient enough to find.”",
}) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.safe.left;
  const top = fmt.safe.top + 20;
  const bottom = fmt.safe.bottom + 24;
  const fade = smooth(0.2, 1.0, t);
  const card = labelIn(t);
  const cardW = fmt.isWide ? 760 : W - side * 2;
  const shadow = "0 3px 18px rgba(0,0,0,0.75)";

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none", color: "#F7F1E6" }}>
      {/* top: kicker row, then title (left) + chip and credit (right) */}
      <div style={{ position: "absolute", top, left: side, right: fmt.isWide ? W - side - 900 : side, opacity: fade }}>
        <div style={{ fontFamily: DISPLAY.grotesk, fontWeight: 600, fontSize: 36, letterSpacing: 4, color: MARBLE_PALETTE.hudGilt, textShadow: shadow, whiteSpace: "nowrap" }}>{kicker}</div>
        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
          <div style={{ fontFamily: DISPLAY.serif, fontSize: 104, lineHeight: 0.98, textShadow: shadow }}>
            {title}
            <br />
            <span style={{ fontStyle: "italic" }}>{titleItalic}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, paddingTop: 10 }}>
            <div style={{ border: `2px solid ${MARBLE_PALETTE.hudGilt}`, background: "rgba(18,8,7,0.78)", padding: "8px 18px", fontFamily: DISPLAY.grotesk, fontWeight: 700, fontSize: 36, letterSpacing: 3, color: MARBLE_PALETTE.hudGilt, whiteSpace: "nowrap" }}>
              MARBLEMUSEUM · 61
            </div>
            <div style={{ background: "rgba(18,8,7,0.6)", padding: "4px 12px", fontFamily: DISPLAY.body, fontWeight: 600, fontSize: 36, color: "#F7F1E6", whiteSpace: "nowrap" }}>Creator: AUDIRA</div>
          </div>
        </div>
      </div>

      {/* hook caption, gives way to the label card */}
      <div
        style={{
          position: "absolute",
          left: side,
          bottom,
          maxWidth: fmt.isWide ? 900 : W - side * 2,
          opacity: fade * (1 - card),
          padding: "14px 22px",
          background: "rgba(18,8,7,0.62)",
          borderLeft: `4px solid ${MARBLE_PALETTE.hudGilt}`,
          fontFamily: DISPLAY.serif,
          fontStyle: "italic",
          fontSize: 50,
          lineHeight: 1.15,
        }}
      >
        {caption}
      </div>

      {/* museum wall label */}
      <div
        style={{
          position: "absolute",
          left: side,
          bottom,
          width: cardW,
          boxSizing: "border-box",
          background: MARBLE_PALETTE.card,
          color: MARBLE_PALETTE.cardInk,
          padding: "24px 30px 26px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
          opacity: card,
          transform: `translateY(${(1 - card) * 24}px)`,
        }}
      >
        <div style={{ fontFamily: DISPLAY.grotesk, fontWeight: 600, fontSize: 36, letterSpacing: 3, color: "#6A5A45" }}>{objectNo}</div>
        <div style={{ fontFamily: DISPLAY.serif, fontSize: 60, lineHeight: 1.05, margin: "6px 0 10px" }}>{objectTitle}</div>
        <div style={{ fontFamily: DISPLAY.body, fontWeight: 500, fontSize: 36, lineHeight: 1.35, color: "#3B342D" }}>{objectLine}</div>
        <div style={{ fontFamily: DISPLAY.serif, fontStyle: "italic", fontSize: 40, lineHeight: 1.25, color: "#3B342D", marginTop: 8 }}>{objectQuote}</div>
      </div>
    </div>
  );
};
