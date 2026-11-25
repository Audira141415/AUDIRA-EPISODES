// BACKROOMS overlay — VHS camcorder HUD on the layout canvas (1080 × 1920 or 1920 × 1080), rendered
// through FilmScene's `overlay`, which scales it with useFormat(). Text ≥ 36 px,
// everything inside the safe area (9:16: y 180…1540).
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { BACKROOMS_PALETTE as C } from "../lib/palette";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const CHIP: React.CSSProperties = { background: "rgba(8,8,6,0.66)", padding: "2px 12px" };

export const BackroomsOverlay: React.FC<{ f: number }> = ({ f }) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? 96 : 64;
  const top = fmt.safe.top + 16;
  const bottom = fmt.safe.bottom + 10;
  const t = f / 60;
  const s = Math.floor(t);
  const tc = `02:14:${String(9 + s).padStart(2, "0")}`;
  const blink = Math.floor(f / 30) % 2 === 0;
  const titleIn = clamp01((t - 0.4) / 0.5);
  const quoteIn = clamp01((t - 1.4) / 0.5) * (1 - clamp01((t - 8.0) / 0.3));
  const payIn = clamp01((t - 9.3) / 0.3);

  const vignetteOp = clamp01(1 - t / 1.2) * 0.65;

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none", color: "#F2EFD8" }}>
      {/* Tape scanlines */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 5px)" }} />
      {/* Top vignette: dims the ceiling glow so the title reads in the first second */}
      {vignetteOp > 0.01 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: H * 0.45, background: "linear-gradient(180deg, rgba(8,8,6,0.9) 0%, transparent 100%)", opacity: vignetteOp }} />
      ) : null}

      <div style={{ position: "absolute", left: side, right: side, top, display: "flex", justifyContent: "space-between", fontFamily: DISPLAY.pixel, fontSize: 36 }}>
        <span style={CHIP}>
          <span style={{ color: C.alarmRed, opacity: blink ? 1 : 0.15 }}>●</span> REC
        </span>
        <span style={CHIP}>SP {tc}</span>
      </div>
      <div style={{ position: "absolute", left: side, top: top + 62, fontFamily: DISPLAY.pixel, fontSize: 36, ...CHIP }}>SEP 14 1996</div>
      <div style={{ position: "absolute", right: side, top: top + 62, fontFamily: DISPLAY.grotesk, fontWeight: 700, fontSize: 36, letterSpacing: 2, border: "2px solid #F2EFD8", padding: "4px 14px", background: "rgba(8,8,6,0.66)" }}>
        LIMINAL // 39
      </div>
      <div style={{ position: "absolute", left: side, right: side, top: top + 130, opacity: titleIn, fontFamily: DISPLAY.condensed, fontSize: 96, lineHeight: 1.0, letterSpacing: 1, textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
        LEVEL 0 THRESHOLD
      </div>

      <div style={{ position: "absolute", left: side, right: side, bottom, opacity: quoteIn, background: "rgba(8,8,6,0.78)", borderLeft: `6px solid ${C.wallpaperYellow}`, padding: "20px 26px" }}>
        <div style={{ fontFamily: DISPLAY.body, fontSize: 40, fontWeight: 600, lineHeight: 1.3 }}>Ruang kosong kuning, karpet basah, dan dengung lampu neon tanpa ujung.</div>
        <div style={{ fontFamily: DISPLAY.pixel, fontSize: 36, marginTop: 10, color: "rgba(242,239,216,0.85)" }}>VHS HI-8 · 30FPS STEP</div>
      </div>
      <div style={{ position: "absolute", left: side, right: side, bottom, opacity: payIn, background: "rgba(20,4,4,0.8)", borderLeft: `6px solid ${C.alarmRed}`, padding: "20px 26px" }}>
        <div style={{ fontFamily: DISPLAY.condensed, fontSize: 110, lineHeight: 1.0, color: "#FF5A5A" }}>LAMPU MATI.</div>
        <div style={{ fontFamily: DISPLAY.body, fontSize: 40, fontWeight: 600, lineHeight: 1.3, marginTop: 6 }}>Yang tersisa hanya tanda EXIT di ujung lorong.</div>
      </div>
    </div>
  );
};
