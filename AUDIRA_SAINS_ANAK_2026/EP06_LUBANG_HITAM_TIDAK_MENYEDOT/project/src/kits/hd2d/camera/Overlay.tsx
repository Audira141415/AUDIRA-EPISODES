// HD2D overlay — RPG HUD on the layout canvas (1080 × 1920, or 1920 × 1080 wide) via `useFormat()`.
// Render it through FilmScene's `overlay`. Every text ≥ 40 px, inside the safe area (9:16: y 180…1540).
// The dialogue box uses the bundled pixel face (DISPLAY.pixel) at 40 px: on-style and still readable.
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { HD2D_PALETTE } from "../lib/palette";
import { computeHd2dState, smooth } from "../core/motion";

const AMBER = "#FFBE55";
const INK = "rgba(11, 14, 20, 0.84)";

export const Hd2dOverlay: React.FC<{ f: number; title?: string }> = ({ f, title = "Embergate Crossing" }) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const t = f / 60;
  const s = computeHd2dState(f);
  const side = fmt.isWide ? 96 : 64;
  const top = fmt.safe.top + 24;
  const bottom = fmt.safe.bottom + 24;
  const fade = smooth(0.1, 0.6, t);
  const line = s.wake > 0.3 ? "The town wakes. Every window answers the lantern." : t > 5.5 ? "Here, under the old lantern, the road ends." : "Night falls on Embergate. One light still burns.";
  // typewriter on the sprite step clock (RPG text box)
  const lineStart = s.wake > 0.3 ? 9.1 : t > 5.5 ? 5.6 : 0.6;
  const chars = Math.max(0, Math.floor(((s.spriteStepFrame * 7.5) / 60 - lineStart) * 40));
  const words = title.split(" ");

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none", color: "#ECEFF4", fontFamily: DISPLAY.grotesk }}>
      {/* night scrims behind the title and the dialogue box: the frame edges fall to dark like a
          miniature under a lamp, and the text sits on a calm value (they stay in from frame 0) */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 62% 40% at 50% 47%, rgba(6,8,13,0) 45%, rgba(6,8,13,0.7) 100%)", maskImage: "linear-gradient(#000 74%, transparent 88%)", WebkitMaskImage: "linear-gradient(#000 74%, transparent 88%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: fmt.isWide ? H * 0.34 : H * 0.27, background: "linear-gradient(rgba(6,8,13,0.9), rgba(6,8,13,0.55) 60%, rgba(6,8,13,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: fmt.isWide ? H * 0.42 : H * 0.36, background: "linear-gradient(rgba(6,8,13,0), rgba(6,8,13,0.72) 30%, rgba(6,8,13,0.62) 45%, rgba(6,8,13,0.12) 72%, rgba(6,8,13,0))" }} />
      <div style={{ position: "absolute", inset: 0, opacity: fade }}>
      {/* top block: kicker + title (left), badge (right) */}
      <div style={{ position: "absolute", top, left: side, right: side, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
        <div>
          <div style={{ fontFamily: DISPLAY.pixel, fontSize: 40, letterSpacing: 1, color: AMBER, marginBottom: 12 }}>● HD-2D · 2400K</div>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 0.98, letterSpacing: -2, textShadow: "0 4px 18px rgba(0,0,0,0.6)" }}>
            {words[0]}
            <br />
            {words.slice(1).join(" ")}
          </div>
        </div>
        <div style={{ border: `3px solid ${AMBER}`, background: INK, padding: "10px 18px", fontFamily: DISPLAY.pixel, fontSize: 40, color: AMBER, whiteSpace: "nowrap" }}>HD-2D</div>
      </div>

      {/* bottom: RPG dialogue box + credit (ends above the bottom safe band) */}
      <div style={{ position: "absolute", left: side, right: side, bottom, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ alignSelf: "flex-start", background: HD2D_PALETTE.heroScarlet, color: "#1A0B08", fontFamily: DISPLAY.pixel, fontSize: 40, padding: "6px 16px" }}>WANDERER</div>
        <div style={{ background: INK, border: `4px solid ${HD2D_PALETTE.mistSilver}`, outline: `4px solid ${INK}`, padding: "18px 24px", fontFamily: DISPLAY.pixel, fontSize: 40, lineHeight: 1.35, minHeight: 2 * 40 * 1.35 }}>
          {line.slice(0, chars)}
          {chars < line.length && s.spriteStepFrame % 2 === 0 ? "▌" : ""}
        </div>
        <div style={{ alignSelf: "flex-end", fontFamily: DISPLAY.pixel, fontSize: 40, color: "#ECEFF4", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>AUDIRA · HD-2D 35</div>
      </div>
      </div>
    </div>
  );
};
