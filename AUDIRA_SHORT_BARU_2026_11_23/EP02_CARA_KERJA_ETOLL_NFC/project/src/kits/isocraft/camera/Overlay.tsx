// ISOCRAFT overlay — tag chips + caption card on the 1080 × 1920 layout canvas (render it through
// FilmScene's `overlay`). Text ≥ 36 px, inside y 180…1540.
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { ISOCRAFT_PALETTE as C } from "../lib/palette";

const ease = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return 1 - Math.pow(1 - t, 3);
};

export const IsoOverlay: React.FC<{ f: number; tag?: string; mode?: string; title?: string; body?: string }> = ({
  f,
  tag = "ISOCRAFT #21",
  mode = "CUTAWAY",
  title = "Isi Mixer Dapur",
  body = "Kulit tembus pandang: motor, poros, dan roda gigi bekerja bersama.",
}) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? 96 : 60;
  const top = fmt.safe.top + 16;
  const bottom = H - fmt.safe.bottom;
  const a = ease((f - 10) / 24);
  const b = ease((f - 50) / 30);
  const chip: React.CSSProperties = { border: `4px solid ${C.inkBlack}`, padding: "8px 18px", fontFamily: DISPLAY.grotesk, fontWeight: 700, fontSize: 38, color: C.inkBlack, boxShadow: `5px 5px 0 ${C.inkBlack}` };
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: side, top, display: "flex", gap: 18, opacity: a, transform: `translateY(${(1 - a) * -20}px)` }}>
        <div style={{ ...chip, background: C.accentYellow }}>{tag}</div>
        <div style={{ ...chip, background: "#fff" }}>{mode}</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: side,
          right: side,
          bottom: H - bottom + 10,
          background: "#fff",
          border: `4px solid ${C.inkBlack}`,
          boxShadow: `8px 8px 0 ${C.shadowBlue}`,
          padding: "24px 30px 28px",
          opacity: b,
          transform: `translateY(${(1 - b) * 40}px)`,
        }}
      >
        <div style={{ fontFamily: DISPLAY.grotesk, fontWeight: 700, fontSize: 72, lineHeight: 1.05, color: C.inkBlack }}>{title}</div>
        <div style={{ marginTop: 12, fontFamily: DISPLAY.body, fontWeight: 500, fontSize: 38, lineHeight: 1.3, color: "#34383d" }}>{body}</div>
      </div>
    </div>
  );
};
