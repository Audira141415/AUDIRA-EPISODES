// WORLDFORGE overlay — a quiet place card on the format's layout canvas (1080 × 1920 short,
// 1920 × 1080 wide, via useFormat()), scaled to the render size. Text ≥ 36 px, inside the safe
// area (below the top 180 px / above the bottom 380 px of a short). It wipes in with a clip, never
// an opacity fade, so the text keeps full contrast on every frame it is visible.
import React from "react";
import { useFormat } from "../../core/film/format.ts";
import { DISPLAY } from "../../core/type/displayFonts.ts";
import { WORLDFORGE_PALETTE as C } from "./lib/palette.ts";

const ease = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

export const WorldforgeOverlay: React.FC<{
  /** Seconds since the film started (the card is timed in seconds, so it works at any fps). */
  t: number;
  mark?: string;
  title?: string;
  body?: string;
}> = ({ t, mark = "WORLDFORGE · DUNIA 3D", title = "Benteng di Atas Bukit", body = "Medan, langit, dan batu, dibangun dari nol." }) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? fmt.safe.left : 72;
  const top = fmt.safe.top + 24;
  const bottom = fmt.safe.bottom + 10;
  const a = ease((t - 0.1) / 0.45);
  const b = ease((t - 0.35) / 0.55);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `scale(${fmt.scale})`, transformOrigin: "0 0", pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: side - 24, top, padding: "14px 24px", background: "rgba(255,248,236,0.9)", borderRadius: 4, clipPath: `inset(0 ${(1 - a) * 100}% 0 0)`, fontFamily: DISPLAY.grotesk, fontWeight: 600, fontSize: 38, letterSpacing: 6, color: "#3b3122", whiteSpace: "nowrap" }}>
        {mark}
      </div>
      <div style={{ position: "absolute", left: side - 32, width: Math.min(W - 2 * (side - 32), 940), bottom, boxSizing: "border-box", padding: "28px 32px 32px", background: "rgba(255,248,236,0.92)", borderRadius: 4, clipPath: `inset(${(1 - b) * 100}% 0 0 0)`, transform: `translateY(${(1 - b) * 24}px)` }}>
        <div style={{ width: 140 * b, height: 4, background: C.dryEarth, marginBottom: 22 }} />
        <div style={{ fontFamily: DISPLAY.serif, fontSize: 88, lineHeight: 1.0, color: "#231d14" }}>{title}</div>
        <div style={{ marginTop: 16, fontFamily: DISPLAY.body, fontWeight: 500, fontSize: 38, lineHeight: 1.35, color: "#4d4334" }}>{body}</div>
      </div>
    </div>
  );
};
