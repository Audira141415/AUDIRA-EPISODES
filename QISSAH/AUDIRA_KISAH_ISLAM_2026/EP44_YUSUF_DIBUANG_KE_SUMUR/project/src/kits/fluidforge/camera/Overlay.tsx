// FLUIDFORGE overlay — lab HUD on the layout canvas (1080 × 1920, or 1920 × 1080 wide) via
// `useFormat()`. Render it through FilmScene's `overlay`. Every text ≥ 36 px, inside the safe area
// (9:16: y 180…1540).
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { FLUIDFORGE_PALETTE } from "../lib/palette";
import { computeFluidforgeState, smooth } from "../core/motion";

const MONO = "'Consolas', 'Courier New', monospace";
const INK = "rgba(6, 8, 14, 0.78)";

export const FluidforgeOverlay: React.FC<{ f: number; title?: string }> = ({ f, title = "Liquid Metal Harmonics" }) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const t = f / 60;
  const side = fmt.isWide ? 96 : 64;
  const top = fmt.safe.top + 24;
  const bottom = fmt.safe.bottom + 24;
  const fade = smooth(0.1, 0.7, t);
  const s = computeFluidforgeState(f);
  const merged = s.coalesce > 0.5;
  const accent = merged ? FLUIDFORGE_PALETTE.causticGold : FLUIDFORGE_PALETTE.cyanIridescent;
  const words = title.split(" ");
  const tension = (72.8 + s.coalesce * 410).toFixed(0);

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none", color: "#ECEFF4", fontFamily: DISPLAY.grotesk, opacity: fade }}>
      {/* top block: kicker + title (left), kit badge (right) */}
      <div style={{ position: "absolute", top, left: side, right: side, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 36, letterSpacing: 2, color: FLUIDFORGE_PALETTE.cyanIridescent, marginBottom: 12 }}>● FERROFLUID · ZERO-G</div>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 0.98, letterSpacing: -2, textShadow: "0 0 26px rgba(0,240,255,0.30)" }}>
            {words.slice(0, 2).join(" ")}
            <br />
            {words.slice(2).join(" ")}
          </div>
        </div>
        <div style={{ border: `2px solid ${FLUIDFORGE_PALETTE.cyanIridescent}`, background: INK, padding: "10px 18px", borderRadius: 6, fontFamily: MONO, fontWeight: 700, fontSize: 36, letterSpacing: 2, color: FLUIDFORGE_PALETTE.cyanIridescent, whiteSpace: "nowrap" }}>
          FLUIDFORGE
        </div>
      </div>

      {/* bottom block: telemetry chip + caption + credit (ends above the bottom safe band) */}
      <div style={{ position: "absolute", left: side, right: side, bottom, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ alignSelf: "flex-start", fontFamily: MONO, fontSize: 36, background: INK, padding: "10px 16px", borderLeft: `4px solid ${accent}`, color: accent }}>
          σ {tension} mN/m · {merged ? "MERGED" : `${8 - Math.round(s.coalesce * 8)} DROPS`}
        </div>
        <div style={{ background: INK, borderLeft: `6px solid ${accent}`, padding: "18px 22px", fontSize: 44, fontWeight: 600, lineHeight: 1.22 }}>
          {merged ? "Eight drops become one: surface tension wins." : "Surface tension holds liquid chrome in orbit."}
        </div>
        <div style={{ alignSelf: "flex-end", fontFamily: MONO, fontSize: 36, color: "rgba(236,239,244,0.82)" }}>AUDIRA · FLUIDFORGE 34</div>
      </div>
    </div>
  );
};
