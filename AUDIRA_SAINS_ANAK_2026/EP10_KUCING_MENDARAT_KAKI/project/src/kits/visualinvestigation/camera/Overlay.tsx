// VISUALINVESTIGATION overlay — forensic header + verbatim quote card on the 1080 × 1920 layout
// canvas (render it through FilmScene's `overlay`). Text ≥ 36 px, inside y 180…1540.
// Rule 15: no real faces or real organisation logos; names here are fictional.
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { VISUALINVESTIGATION_PALETTE as C } from "../lib/palette";

const AMBER = "#FFBE55";
const ease = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return 1 - Math.pow(1 - t, 3);
};

export const VisualInvestigationOverlay: React.FC<{
  f: number;
  kicker?: string;
  exhibit?: string;
  badge?: string;
  speaker?: string;
  quote?: string;
  meta?: string;
}> = ({
  f,
  kicker = "● REKONSTRUKSI SIDANG · 14:32 WIB",
  exhibit = "EXHIBIT A-04",
  badge = "FORENSIK",
  speaker = "SAKSI AHLI (DR. R. SURYADI)",
  quote = "“Metadata asli tercatat pukul 14:32 WIB di register.”",
  meta = "TERVERIFIKASI · SIAPA · APA · KAPAN",
}) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? 96 : 60;
  const top = fmt.safe.top + 16;
  const bottom = H - fmt.safe.bottom;
  const a = ease((f - 8) / 24);
  const b = ease((f - 70) / 30);
  const verified = ease((f - 300) / 20);
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none", color: "#ECEFF4" }}>
      <div style={{ position: "absolute", left: side, right: side, top, display: "flex", justifyContent: "space-between", alignItems: "flex-start", opacity: a }}>
        <div>
          <div style={{ fontFamily: DISPLAY.grotesk, fontWeight: 600, fontSize: 36, letterSpacing: 2, color: AMBER }}>{kicker}</div>
          <div style={{ fontFamily: DISPLAY.condensed, fontSize: 84, lineHeight: 1.05, letterSpacing: 1, textShadow: "0 3px 14px rgba(0,0,0,0.85)" }}>{exhibit}</div>
        </div>
        <div style={{ background: "rgba(10,12,16,0.88)", border: `3px solid ${AMBER}`, padding: "8px 18px", fontFamily: DISPLAY.grotesk, fontWeight: 700, fontSize: 36, letterSpacing: 2 }}>{badge}</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: side,
          right: side,
          bottom: H - bottom + 10,
          background: "rgba(10,12,16,0.88)",
          borderLeft: `8px solid ${AMBER}`,
          padding: "24px 28px 26px",
          opacity: b,
          transform: `translateY(${(1 - b) * 36}px)`,
        }}
      >
        <div style={{ fontFamily: DISPLAY.grotesk, fontWeight: 700, fontSize: 36, letterSpacing: 1, color: AMBER }}>{speaker}</div>
        <div style={{ marginTop: 10, fontFamily: DISPLAY.serif, fontStyle: "italic", fontSize: 54, lineHeight: 1.15, color: "#F4F1EA" }}>{quote}</div>
        <div style={{ marginTop: 14, fontFamily: DISPLAY.grotesk, fontWeight: 600, fontSize: 36, color: verified > 0.5 ? C.verifiedGreen : "#9aa3ad" }}>
          {verified > 0.5 ? "✓ " : ""}
          {meta}
        </div>
      </div>
    </div>
  );
};
