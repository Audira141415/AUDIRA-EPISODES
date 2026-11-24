// PAPERWORLD overlay — a small cut-card title label on the 1080 × 1920 layout canvas (16:9: 1920 × 1080).
// Laid out in layout pixels via useFormat() and scaled to the render size by <OverlayLayer>.
// Text ≥ 36 px, inside the safe area (short: y 180…1540). Time `s` is in seconds.
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { PALETTE } from "../tokens";

const ease = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** Wraps any overlay at layout size and scales it to the render size (same contract as FilmScene `overlay`). */
export const OverlayLayer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fmt = useFormat();
  return (
    <div style={{ position: "absolute", inset: 0, width: fmt.layout.width, height: fmt.layout.height, transform: `scale(${fmt.scale})`, transformOrigin: "0 0", pointerEvents: "none" }}>
      {children}
    </div>
  );
};

/** A label like a card tag pinned to the diorama: ivory card, ink type, a coral tab. Pops in with one small overshoot. */
export const PaperworldOverlay: React.FC<{ s: number; title?: string; body?: string }> = ({
  s,
  title = "PAPERWORLD",
  body = "Desa kertas bangun pagi ini.",
}) => {
  const fmt = useFormat();
  const side = fmt.isWide ? fmt.safe.left : 64;
  const top = fmt.safe.top + 24;
  const a = ease((s - 0.4) / 0.6);
  const pop = a < 1 ? a * (1 + 0.08 * Math.sin(a * Math.PI)) : 1;
  const b = ease((s - 0.9) / 0.6);
  return (
    <div
      style={{
        position: "absolute",
        left: side,
        top,
        opacity: a,
        transform: `rotate(-1.5deg) scale(${0.92 + 0.08 * pop})`,
        transformOrigin: "0 0",
        padding: "22px 30px 24px",
        background: PALETTE.ivoryLight,
        borderRadius: 6,
        boxShadow: "0 6px 0 rgba(82,55,41,0.18), 0 14px 24px rgba(82,55,41,0.16)",
      }}
    >
      <div style={{ position: "absolute", left: 30, top: -10, width: 84, height: 20, background: PALETTE.coral, borderRadius: 3 }} />
      <div style={{ fontFamily: DISPLAY.serif, fontSize: 72, lineHeight: 1, letterSpacing: 3, color: PALETTE.ink }}>{title}</div>
      <div style={{ marginTop: 12, fontFamily: DISPLAY.body, fontWeight: 600, fontSize: 38, lineHeight: 1.3, color: PALETTE.brownDeep, opacity: b }}>{body}</div>
    </div>
  );
};
