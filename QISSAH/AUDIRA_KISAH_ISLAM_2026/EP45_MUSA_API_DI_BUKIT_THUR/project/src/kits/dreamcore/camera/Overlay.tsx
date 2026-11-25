// DREAMCORE overlay — soft dream-journal HUD on the layout canvas (1080 × 1920, or 1920 × 1080
// wide) via `useFormat()`. Render it through FilmScene's `overlay`. Every text ≥ 36 px, inside the
// safe area (9:16: y 180…1540). The scene is pale pastel, so every text sits on its own plate:
// plum text on milk-white plates, white text only on the plum pill.
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { DREAM_PALETTE } from "../lib/palette";
import { smooth } from "../core/motion";

const MONO = "'Consolas', 'Courier New', monospace";
/** Milk plate + deep plum ink: ≥ 7:1 on the plate whatever pastel sits behind it. */
const PLATE = "rgba(255, 250, 252, 0.88)";
const INK = "#3E2D58";
const ACCENT_INK = "#A8336E"; // darker hudAccent pink, readable on the milk plate
const PILL = "rgba(98, 52, 104, 0.86)";

/** Dream-journal HUD: timestamp pill, kit badge, title plate, caption plate, credit. */
export const DreamcoreOverlay: React.FC<{ t: number; title?: [string, string] }> = ({ t, title = ["The Pool That", "Leads Outside"] }) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? 96 : 64;
  const top = fmt.safe.top + 24;
  const bottom = fmt.safe.bottom + 24;
  const fade = smooth(0.2, 1.2, t);
  const payoff = smooth(9.0, 9.8, t);
  const clock = `03:${String(17 + Math.floor(t / 4)).padStart(2, "0")} AM`;
  const shadow = "0 10px 34px rgba(150, 110, 190, 0.28)";

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none", fontFamily: DISPLAY.grotesk, color: INK, opacity: fade }}>
      <div style={{ position: "absolute", top, left: side, right: side }}>
        {/* row 1: timestamp pill (left), kit badge (right) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 36, letterSpacing: 2, color: "#FFFFFF", background: PILL, padding: "8px 20px", borderRadius: 30 }}>☾ DREAM LOG {clock}</div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 36, letterSpacing: 2, color: ACCENT_INK, background: PLATE, border: `2px solid ${DREAM_PALETTE.hudAccent}`, padding: "8px 20px", borderRadius: 30 }}>DREAMCORE</div>
        </div>
        {/* row 2: title on its own plate */}
        <div style={{ display: "inline-block", marginTop: 18, background: PLATE, borderRadius: 28, padding: "18px 30px 22px", boxShadow: shadow }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.02, letterSpacing: -1 }}>
            {title[0]}
            <br />
            {title[1]}
          </div>
        </div>
      </div>

      {/* caption plate + credit (ends above the bottom safe band) */}
      <div style={{ position: "absolute", left: side, right: side, bottom, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
        <div style={{ maxWidth: fmt.isWide ? 900 : 680, background: PLATE, borderRadius: 24, padding: "20px 28px", boxShadow: shadow }}>
          <div style={{ fontSize: 42, lineHeight: 1.25, fontWeight: 500 }}>
            {payoff > 0.5 ? "The stairs go up. The door is open. Nobody is waiting." : "You have been here before. You just can't remember when."}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 36, color: ACCENT_INK, marginTop: 12 }}>NO EXITS · SKY INDOORS</div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 36, color: "#FFFFFF", background: PILL, padding: "8px 16px", borderRadius: 20, whiteSpace: "nowrap" }}>AUDIRA</div>
      </div>
    </div>
  );
};
