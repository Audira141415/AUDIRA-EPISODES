// THERMALFORGE overlay — FLIR HUD + temperature scale on the 1080 × 1920 layout canvas (render it
// through FilmScene's `overlay`). Text ≥ 36 px, inside y 180…1540.
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { THERMAL_PALETTE as C } from "../lib/palette";

const ease = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return 1 - Math.pow(1 - t, 3);
};

export const ThermalOverlay: React.FC<{ f: number; title?: string; body?: string; sensor?: string }> = ({
  f,
  title = "Disipasi Termal",
  body = "Panas mengalir dari inti silikon ke sirip pendingin, lalu naik ke udara.",
  sensor = "FLIR IR · 12-BIT",
}) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? 96 : 60;
  const top = fmt.safe.top + 16;
  const bottom = H - fmt.safe.bottom;
  const tMax = 68 + 6.6 * (Math.sin(f * 0.05) * 0.5 + 0.5);
  const a = ease((f - 10) / 24);
  const b = ease((f - 60) / 30);
  const mono: React.CSSProperties = { fontFamily: DISPLAY.grotesk, fontWeight: 600, color: C.plasmaWhite, textShadow: "0 2px 8px rgba(0,0,0,0.9)" };
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: side, right: side, top, display: "flex", justifyContent: "space-between", alignItems: "flex-start", opacity: a }}>
        <div style={{ ...mono, fontSize: 38, color: C.hudCyan }}>
          {sensor}
          <div style={{ fontSize: 36, color: C.plasmaWhite, opacity: 0.85 }}>ε 0.95 · 15–120 °C</div>
        </div>
        <div style={{ ...mono, textAlign: "right" }}>
          <div style={{ fontSize: 76, lineHeight: 1, color: C.flirYellow }}>{tMax.toFixed(1)}°C</div>
          <div style={{ fontSize: 36 }}>MAX · HOTSPOT</div>
        </div>
      </div>
      {/* Ironbow scale bar */}
      <div
        style={{
          position: "absolute",
          right: side,
          top: top + 200,
          height: 520,
          width: 26,
          background: "linear-gradient(to top, #0A0A10, #310E68, #9B1D8C, #EA5E28, #F7D038, #FFFFFF)",
          border: "2px solid rgba(255,255,255,0.7)",
          opacity: a,
        }}
      />
      <div style={{ ...mono, position: "absolute", right: side + 40, top: top + 192, fontSize: 36, opacity: a }}>120°</div>
      <div style={{ ...mono, position: "absolute", right: side + 40, top: top + 680, fontSize: 36, opacity: a }}>15°</div>
      <div
        style={{
          position: "absolute",
          left: side,
          right: side,
          bottom: H - bottom + 10,
          padding: "24px 28px 28px",
          background: "rgba(10,10,16,0.82)",
          borderLeft: `8px solid ${C.flirAmber}`,
          opacity: b,
          transform: `translateY(${(1 - b) * 40}px)`,
        }}
      >
        <div style={{ fontFamily: DISPLAY.grotesk, fontWeight: 700, fontSize: 70, lineHeight: 1.05, color: C.flirYellow }}>{title}</div>
        <div style={{ marginTop: 12, fontFamily: DISPLAY.body, fontWeight: 500, fontSize: 38, lineHeight: 1.3, color: "#ece6f5" }}>{body}</div>
      </div>
    </div>
  );
};
