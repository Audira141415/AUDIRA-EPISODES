// EP03 broadcast graphics (BROADCASTFORGE language): LIVE bug, duration clock, TV score bug, ticker.
// Laid out on the 1080 × 1920 canvas. Safe zone: nothing above y 236 or below y 1540.
import React from "react";
import { B } from "./palette.ts";
import { DISPLAY } from "./fonts.ts";

const font = (size: number, weight = 800, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: `${DISPLAY}, Manrope, sans-serif`,
  fontWeight: weight,
  fontSize: size,
  lineHeight: 1,
  ...extra,
});

export const LiveBug: React.FC<{ day: string; pulse?: number; top?: number }> = ({ day, pulse = 1, top = 250 }) => (
  <div style={{ position: "absolute", left: 60, top, display: "flex", alignItems: "stretch", height: 64, boxShadow: "0 8px 24px rgba(0,0,0,0.45)" }}>
    <div style={{ background: B.breakingRed, color: B.white, display: "flex", alignItems: "center", gap: 12, padding: "0 22px", ...font(40) }}>
      <span style={{ width: 16, height: 16, borderRadius: 8, background: B.white, opacity: 0.55 + 0.45 * pulse }} />
      LIVE
    </div>
    <div style={{ background: B.plate, color: B.liveAmber, display: "flex", alignItems: "center", padding: "0 22px", letterSpacing: "0.04em", ...font(36, 600) }}>{day}</div>
  </div>
);

export const DurationClock: React.FC<{ value: string; label?: string; top?: number }> = ({ value, label = "DURASI", top = 250 }) => (
  <div style={{ position: "absolute", right: 60, top, height: 64, display: "flex", alignItems: "center", gap: 14, background: B.plate, padding: "0 22px", borderBottom: `4px solid ${B.cyan}`, boxShadow: "0 8px 24px rgba(0,0,0,0.45)" }}>
    <span style={{ color: B.ticker, opacity: 0.8, ...font(34, 600) }}>{label}</span>
    <span style={{ color: B.cyan, fontVariantNumeric: "tabular-nums", ...font(44) }}>{value}</span>
  </div>
);

type Row = { name: string; sets: (number | string)[]; serving?: boolean; winner?: boolean };

export const ScoreBug: React.FC<{ rows: Row[]; left?: number; top: number; highlightLast?: boolean; title?: string }> = ({ rows, left = 60, top, highlightLast = true, title }) => (
  <div style={{ position: "absolute", left, top, boxShadow: "0 12px 32px rgba(0,0,0,0.5)" }}>
    {title ? (
      <div style={{ background: B.broadcastNavy, color: B.ticker, padding: "10px 18px", letterSpacing: "0.08em", borderTop: `4px solid ${B.breakingRed}`, ...font(34, 600) }}>{title}</div>
    ) : null}
    {rows.map((r, i) => (
      <div key={r.name} style={{ display: "flex", alignItems: "stretch", height: 70, background: B.plate, borderTop: i ? "2px solid rgba(255,255,255,0.08)" : "none" }}>
        <div style={{ width: 210, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", color: B.white, ...font(42, r.winner ? 800 : 600) }}>
          {r.name}
          {r.serving ? <span style={{ width: 14, height: 14, borderRadius: 7, background: "#d7f03a" }} /> : null}
        </div>
        {r.sets.map((s, j) => {
          const last = highlightLast && j === r.sets.length - 1;
          return (
            <div
              key={j}
              style={{
                width: last ? 92 : 54,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: last ? B.white : "rgba(236,239,244,0.82)",
                background: last ? (r.winner ? B.breakingRed : "rgba(211,47,47,0.45)") : "transparent",
                fontVariantNumeric: "tabular-nums",
                ...font(last ? 48 : 40, last ? 800 : 600),
              }}
            >
              {s}
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

export const Ticker: React.FC<{ label: string; text: string; offset?: number; top?: number }> = ({ label, text, offset = 0, top = 1468 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, height: 64, display: "flex", background: B.plate, borderTop: `3px solid ${B.breakingRed}`, overflow: "hidden" }}>
    <div style={{ background: B.breakingRed, color: B.white, display: "flex", alignItems: "center", padding: "0 24px", zIndex: 1, ...font(36) }}>{label}</div>
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 24 - offset, top: 0, height: 64, display: "flex", alignItems: "center", whiteSpace: "nowrap", color: B.ticker, letterSpacing: "0.03em", ...font(36, 600) }}>{text}</div>
    </div>
  </div>
);

/** Big broadcast headline: kicker, hero line, cyan rule, sub line. Centred, starts at `top`. */
export const Headline: React.FC<{ kicker: string; hero: string; sub?: string; top: number; heroSize?: number; align?: "center" | "left" }> = ({ kicker, hero, sub, top, heroSize = 260, align = "center" }) => (
  <div style={{ position: "absolute", left: align === "left" ? 60 : 0, right: align === "left" ? undefined : 0, top, textAlign: align }}>
    <div style={{ display: "inline-block", background: B.plateSoft, color: B.liveAmber, padding: "10px 22px", letterSpacing: "0.12em", ...font(40, 600) }}>{kicker}</div>
    <div style={{ color: B.white, marginTop: 14, textShadow: "0 10px 40px rgba(0,0,0,0.65), 0 2px 0 rgba(0,0,0,0.4)", letterSpacing: "0.01em", ...font(heroSize) }}>{hero}</div>
    <div style={{ width: 360, height: 8, background: B.cyan, margin: align === "left" ? "16px 0 0" : "16px auto 0", boxShadow: `0 0 24px ${B.cyan}` }} />
    {sub ? <div style={{ display: "inline-block", marginTop: 18, color: B.white, background: B.plateSoft, padding: "10px 22px", letterSpacing: "0.04em", ...font(52, 600) }}>{sub}</div> : null}
  </div>
);
