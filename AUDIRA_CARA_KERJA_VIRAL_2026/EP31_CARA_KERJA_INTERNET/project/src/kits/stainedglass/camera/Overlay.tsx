// STAINEDGLASS overlay — illuminated-manuscript HUD on the 1080 × 1920 layout canvas (render it through
// FilmScene's `overlay`): chapter kicker, serif title, pane counter, caption. Text ≥ 36 px, inside
// y 180…1540 (top 180 / bottom 380 safe).
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { STAINED_PALETTE } from "../lib/palette";
import { assembled, smooth } from "../core/motion";

const TOTAL_PANES = 273; // 216 diamond quarries + 57 rose segments

export const StainedglassOverlay: React.FC<{ t: number; title?: [string, string] }> = ({ t, title = ["The Window of", "First Light"] }) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.safe.left;
  const fade = smooth(0.2, 1.0, t);
  const set = Math.round(assembled(t) * TOTAL_PANES);
  const payoff = smooth(9.0, 9.8, t);
  const mono = DISPLAY.grotesk;

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none", fontFamily: DISPLAY.serif, color: "#FBF3E2", opacity: fade }}>
      <div style={{ position: "absolute", top: fmt.safe.top + 16, left: side, right: side, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
        <div>
          <div style={{ fontFamily: mono, fontWeight: 600, fontSize: 36, letterSpacing: 3, color: STAINED_PALETTE.inkGold, marginBottom: 6, textShadow: "0 2px 10px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.9)" }}>✦ NAVE WINDOW III</div>
          <div style={{ fontSize: 78, fontStyle: "italic", lineHeight: 1.0, whiteSpace: "nowrap", textShadow: "0 3px 18px rgba(0,0,0,0.85), 0 0 4px rgba(0,0,0,0.9)" }}>
            {title[0]}
            <br />
            {title[1]}
          </div>
        </div>
        <div style={{ border: `2px solid ${STAINED_PALETTE.inkGold}`, background: STAINED_PALETTE.parchment, padding: "10px 18px", borderRadius: 4, fontFamily: mono, fontWeight: 700, fontSize: 36, letterSpacing: 2, color: STAINED_PALETTE.inkGold, whiteSpace: "nowrap" }}>
          STAINEDGLASS // 58
        </div>
      </div>

      <div style={{ position: "absolute", left: side, right: side, bottom: fmt.safe.bottom + 16, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
        <div style={{ maxWidth: 860, background: STAINED_PALETTE.parchment, border: "1.5px solid rgba(232,199,122,0.55)", borderRadius: 6, padding: "18px 26px" }}>
          <div style={{ fontSize: 50, fontStyle: "italic", lineHeight: 1.15 }}>
            {payoff > 0.5 ? "“Each pane holds one colour. The story appears when the sun walks through.”" : "“Piece by piece, the glazier sets colour into lead.”"}
          </div>
          <div style={{ fontFamily: mono, fontWeight: 600, fontSize: 36, letterSpacing: 1, color: STAINED_PALETTE.inkGold, marginTop: 10 }}>
            PANES SET {String(set).padStart(3, "0")} / {TOTAL_PANES}
          </div>
        </div>
        <div style={{ fontFamily: mono, fontWeight: 600, fontSize: 36, color: "#FBF3E2", background: STAINED_PALETTE.parchment, padding: "6px 14px", borderRadius: 4 }}>Creator: AUDIRA</div>
      </div>
    </div>
  );
};
