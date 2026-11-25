// TRADINGTERMINAL overlay — terminal HUD on the layout canvas (1080 × 1920, or 1920 × 1080 wide) via
// `useFormat()`. Render it through FilmScene's `overlay`. Every text ≥ 36 px, inside the safe area
// (9:16: y 180…1540). Numbers come from core/motion.ts, so the HUD and the chart always agree.
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { TRADINGTERMINAL_PALETTE as P } from "../lib/palette";
import { RESISTANCE_Y, computeTradingTerminalState, priceAt, smooth } from "../core/motion";

const MONO = "'Consolas', 'Courier New', monospace";
const INK = "rgba(6, 8, 11, 0.82)";
const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

export const TradingTerminalOverlay: React.FC<{ f: number; title?: string }> = ({ f, title = "Breakout" }) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const s = computeTradingTerminalState(f);
  const t = s.t;
  const side = fmt.isWide ? 96 : 64;
  const top = fmt.safe.top + 24;
  const bottom = fmt.safe.bottom + 24;
  const fade = smooth(0.1, 0.6, t);
  const broke = s.breakout > 0.35;
  const open = priceAt(1.2);
  const change = ((s.currentPrice - open) / open) * 100;
  const resistance = usd(priceAt(RESISTANCE_Y));

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none", color: "#ECEFF4", fontFamily: DISPLAY.grotesk, opacity: fade }}>
      {/* top block: pair kicker + title (left), live price chip (right) */}
      <div style={{ position: "absolute", top, left: side, right: side, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 36, letterSpacing: 2, color: P.neutralAmber, marginBottom: 10 }}>● BTC/USDT · 1D</div>
          <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1, letterSpacing: -2 }}>{title}</div>
        </div>
        <div style={{ textAlign: "right", fontFamily: MONO, background: INK, border: `2px solid ${broke ? P.bullGreen : P.cyanTelemetry}`, borderRadius: 6, padding: "12px 18px" }}>
          <div style={{ fontSize: 52, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.05 }}>{usd(s.currentPrice)}</div>
          <div style={{ fontSize: 36, color: change >= 0 ? P.bullGreen : P.bearRed }}>
            {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* bottom block: indicator chip + caption + credit (ends above the bottom safe band) */}
      <div style={{ position: "absolute", left: side, right: side, bottom, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 36 }}>
          <span style={{ background: INK, padding: "8px 14px", color: P.neutralAmber }}>RES {resistance}</span>
          <span style={{ background: INK, padding: "8px 14px", color: P.cyanTelemetry }}>RSI {(54 + s.breakout * 16).toFixed(0)}</span>
        </div>
        <div style={{ background: INK, borderLeft: `6px solid ${broke ? P.bullGreen : P.neutralAmber}`, padding: "16px 22px", fontSize: 44, fontWeight: 600, lineHeight: 1.2 }}>
          {broke ? "Buyers absorb the ask wall: breakout." : t > 5.2 ? "Price tests resistance and is rejected." : "Eight sessions of higher lows."}
        </div>
        <div style={{ alignSelf: "flex-end", fontFamily: MONO, fontSize: 36, color: "rgba(236,239,244,0.82)" }}>AUDIRA · TERMINAL 41</div>
      </div>
    </div>
  );
};
