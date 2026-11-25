// MOSAICFORGE overlay — excavation-catalogue HUD on the layout canvas (1080 × 1920 or 1920 × 1080;
// render it through FilmScene's `overlay`). Every text ≥ 36 px, inside the format's safe area
// (9:16: y 180…1540, sides 60).
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { MOSAIC_PALETTE } from "../lib/palette";
import { MOSAIC_DONE, seatedFraction, smooth } from "../core/motion";
import { TESSERAE_COUNT } from "../scene/TesseraeField3D";

/** Panel kicker, title, style chip + credit, caption with the tesserae counter. */
export const MosaicforgeOverlay: React.FC<{
  t: number;
  kicker?: string;
  title?: string;
  captionBefore?: string;
  captionAfter?: string;
  materials?: string;
}> = ({
  t,
  kicker = "◆ OPUS TESSELLATUM · PANEL IX",
  title = "The Sun-Bird",
  captionBefore = "One tessera at a time, set into wet lime.",
  captionAfter = "Thousands of single-colour stones. Step back, and they become a bird.",
  materials = "LAPIS · TERRACOTTA · GOLD SMALTI",
}) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.safe.left;
  const top = fmt.safe.top + 20;
  const bottom = fmt.safe.bottom + 24;
  const fade = smooth(0.2, 1.0, t);
  const set = Math.round(seatedFraction(t) * TESSERAE_COUNT);
  const done = smooth(MOSAIC_DONE, MOSAIC_DONE + 0.6, t);
  const shadow = "0 3px 16px rgba(0,0,0,0.8)";

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none", color: "#FBF1DF", opacity: fade }}>
      <div style={{ position: "absolute", top, left: side, right: fmt.isWide ? W - side - 900 : side }}>
        <div style={{ display: "inline-block", background: MOSAIC_PALETTE.hudInk, padding: "6px 14px", fontFamily: DISPLAY.grotesk, fontWeight: 600, fontSize: 36, letterSpacing: 3, color: MOSAIC_PALETTE.hudGold, whiteSpace: "nowrap" }}>
          {kicker}
        </div>
        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
          <div style={{ fontFamily: DISPLAY.serif, fontSize: 104, lineHeight: 1.0, textShadow: shadow }}>{title}</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, paddingTop: 12 }}>
            <div style={{ border: `2px solid ${MOSAIC_PALETTE.hudGold}`, background: MOSAIC_PALETTE.hudInk, padding: "8px 18px", borderRadius: 3, fontFamily: DISPLAY.grotesk, fontWeight: 700, fontSize: 36, letterSpacing: 3, color: MOSAIC_PALETTE.hudGold, whiteSpace: "nowrap" }}>
              MOSAICFORGE · 60
            </div>
            <div style={{ background: MOSAIC_PALETTE.hudInk, padding: "4px 12px", fontFamily: DISPLAY.body, fontWeight: 600, fontSize: 36, whiteSpace: "nowrap" }}>Creator: AUDIRA</div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: side,
          bottom,
          width: fmt.isWide ? 860 : W - side * 2,
          boxSizing: "border-box",
          background: MOSAIC_PALETTE.hudInk,
          borderLeft: `6px solid ${MOSAIC_PALETTE.terracotta}`,
          padding: "20px 28px 22px",
        }}
      >
        {/* one caption at a time (dips through 0 at the swap), so no two texts ever overlap */}
        <div style={{ fontFamily: DISPLAY.serif, fontSize: 50, lineHeight: 1.15, opacity: Math.abs(done * 2 - 1) }}>{done < 0.5 ? captionBefore : captionAfter}</div>
        <div style={{ fontFamily: DISPLAY.grotesk, fontWeight: 600, fontSize: 36, letterSpacing: 2, color: MOSAIC_PALETTE.hudGold, marginTop: 14 }}>
          TESSERAE SET {set.toLocaleString("en-US")} / {TESSERAE_COUNT.toLocaleString("en-US")}
        </div>
        <div style={{ fontFamily: DISPLAY.grotesk, fontWeight: 500, fontSize: 36, letterSpacing: 2, color: "rgba(251,241,223,0.85)", marginTop: 4 }}>{materials}</div>
      </div>
    </div>
  );
};
