// GLITCHFORGE overlay — broadcast HUD on the 1080 × 1920 layout canvas (render it through FilmScene's
// `overlay`). Text ≥ 36 px, inside y 180…1540. The RGB split on the title is a text-shadow on ONE
// text node (no duplicate copies), and the signal chips sit on solid ink so they stay readable while
// the feed breaks behind them.
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { GLITCH_PALETTE as P } from "../lib/palette";
import { BEAT, GlitchState } from "../core/motion";

const tc = (t: number) => {
  const fr = Math.floor((t % 1) * 60);
  return `00:00:${String(Math.floor(t)).padStart(2, "0")}:${String(fr).padStart(2, "0")}`;
};

export const GlitchforgeOverlay: React.FC<{ s: GlitchState; title?: string }> = ({ s, title = "DATA ROT" }) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.safe.left;
  const top = fmt.safe.top + 16;
  const bottom = fmt.safe.bottom + 16;
  const t = s.t;
  const inK = Math.min(1, t / 0.5);
  const err = s.hud > 0.35;
  // the HUD only jitters on error steps, a few px, so it reads as a glitch and not as shake
  const jx = err ? (((s.seed * 37) % 7) - 3) * 2 * s.hud : 0;
  const status = s.lost > 0 ? "NO SIGNAL" : t >= BEAT.snap ? "SIGNAL RESTORED" : err ? `ERR 0x${Math.floor(s.seed * 211).toString(16).toUpperCase().padStart(4, "0")}` : "SIGNAL OK";
  const statusColor = s.lost > 0 || err ? P.signalRed : P.signalGreen;
  const quote = t < BEAT.creep[0] ? "A perfect object. A perfect feed." : t < BEAT.lost[0] ? "Then the data starts to remember the wrong frames." : t < BEAT.snap ? "…" : "Snap. Clean again, but you saw what's underneath.";
  const split = err ? 6 * s.hud : 0;
  const chip: React.CSSProperties = {
    background: P.ink,
    color: "#FFFFFF",
    fontFamily: DISPLAY.grotesk,
    fontWeight: 700,
    fontSize: 36,
    letterSpacing: 2,
    padding: "8px 16px",
    whiteSpace: "nowrap",
  };
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none", opacity: inK }}>
      <div style={{ position: "absolute", left: side, right: side, top, display: "flex", justifyContent: "space-between", alignItems: "flex-start", transform: `translateX(${jx}px)` }}>
        <div>
          <div style={{ ...chip, display: "inline-block" }}>
            <span style={{ color: P.signalRed }}>●</span> REC · {tc(t)}
          </div>
          <div
            style={{
              fontFamily: DISPLAY.condensed,
              fontSize: 132,
              lineHeight: 1.0,
              marginTop: 14,
              color: P.ink,
              maxWidth: 480,
              textShadow: split > 0 ? `${split}px 0 0 ${P.signalRed}, ${-split}px ${split * 0.3}px 0 ${P.cyan}` : "none",
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          <div style={{ ...chip, borderLeft: `6px solid ${P.signalGreen}` }}>GLITCHFORGE // 68</div>
          <div style={{ ...chip, color: statusColor }}>{status}</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: side, right: side, bottom, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: "rgba(255,255,255,0.94)", borderLeft: `8px solid ${P.signalRed}`, padding: "18px 24px", maxWidth: 860, boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}>
          <div style={{ fontFamily: DISPLAY.body, fontWeight: 700, fontSize: 42, lineHeight: 1.2, color: P.ink }}>{quote}</div>
          <div style={{ fontFamily: DISPLAY.grotesk, fontWeight: 600, fontSize: 36, letterSpacing: 1, color: "#4A4D56", marginTop: 8 }}>RGB SPLIT · MACROBLOCK · DATAMOSH</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={chip}>BITRATE {s.lost > 0 ? "0.0" : (48 - 40 * Math.min(1, s.hud)).toFixed(1)} Mb/s</span>
          <span style={chip}>Creator: AUDIRA</span>
        </div>
      </div>
    </div>
  );
};
