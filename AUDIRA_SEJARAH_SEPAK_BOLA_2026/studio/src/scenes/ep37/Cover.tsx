// EP37 Cover (TRADINGTERMINAL): "Chelsea — Revolusi Abramovich 2003"
// Visual: dark trading terminal — Abramovich's £80m acquisition as a bull trade,
// debt → Mourinho → 21 trophies, candlestick chart of a club transformed.
// Pure 2D (no ThreeCanvas). TRADINGTERMINAL palette.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "700", "800"] });

// TRADINGTERMINAL palette
const VOID = "#06080B";
const PANEL = "#0E131A";
const BULL = "#00E676";
const BEAR = "#FF1744";
const AMBER = "#FFB300";
const CYAN = "#00E5FF";
const GRID = "rgba(255,255,255,0.08)";
// Chelsea blue (episode accent, not in kit palette)
const CHELSEA_BLUE = "#034694";

const W = 1080;
const H = 1920;

// Mini candlestick bars representing Chelsea's trophy trajectory
const CANDLES = [
  { y: 0.72, h: 0.06, bull: false },  // Debt era pre-2003
  { y: 0.68, h: 0.08, bull: false },
  { y: 0.55, h: 0.14, bull: true },   // Abramovich buys (July 2003)
  { y: 0.38, h: 0.18, bull: true },   // Mourinho arrives 2004
  { y: 0.22, h: 0.17, bull: true },   // PL title 2005
  { y: 0.14, h: 0.09, bull: true },   // PL title 2006
  { y: 0.18, h: 0.07, bull: false },  // CL near miss
  { y: 0.10, h: 0.09, bull: true },   // CL 2012 Drogba
];

const CW = 56; // candle width
const GAP = 24;
const CHART_H = 420;
const CHART_W = W - 112;
const CHART_Y = 580;

export const Cover: React.FC = () => (
  <AbsoluteFill style={{ width: W, height: H, background: VOID, overflow: "hidden", fontFamily: MONO }}>

    {/* Scanline grid */}
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 50 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 38 + 1} x2={W} y2={i * 38 + 1} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
      ))}
      {Array.from({ length: 18 }, (_, i) => (
        <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={H} stroke={GRID} strokeWidth={1} />
      ))}
    </svg>

    {/* Top bar: ticker */}
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 100,
      background: PANEL, borderBottom: `2px solid ${CHELSEA_BLUE}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      paddingLeft: 56, paddingRight: 56,
    }}>
      <div style={{ fontWeight: 800, fontSize: 24, color: CYAN, letterSpacing: 4 }}>
        SEJARAH SEPAK BOLA
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: BULL }} />
        <div style={{ fontWeight: 700, fontSize: 22, color: BULL, letterSpacing: 2 }}>#37</div>
      </div>
    </div>

    {/* Club header */}
    <div style={{ position: "absolute", top: 120, left: 56, right: 56 }}>
      <div style={{
        display: "inline-block",
        background: CHELSEA_BLUE,
        fontWeight: 800, fontSize: 22, letterSpacing: 6,
        color: "#FFFFFF", padding: "6px 20px", marginBottom: 12,
      }}>
        CHELSEA FC
      </div>
      <div style={{
        fontWeight: 800,
        fontSize: 148,
        lineHeight: 0.88,
        color: BULL,
        letterSpacing: -3,
        textShadow: `0 0 60px rgba(0,230,118,0.4)`,
      }}>
        REVOLUSI
      </div>
      <div style={{
        fontWeight: 800,
        fontSize: 86,
        lineHeight: 0.9,
        color: "#FFFFFF",
        letterSpacing: -1,
        marginTop: 8,
      }}>
        ABRAMOVICH 2003
      </div>
    </div>

    {/* Candlestick chart */}
    <div style={{
      position: "absolute",
      top: CHART_Y,
      left: 56,
      right: 56,
      height: CHART_H,
      background: PANEL,
      border: `1px solid rgba(0,229,255,0.2)`,
      overflow: "hidden",
    }}>
      {/* Chart label */}
      <div style={{
        position: "absolute", top: 12, left: 16,
        fontWeight: 700, fontSize: 18, color: CYAN, letterSpacing: 3, opacity: 0.8,
      }}>
        CFC:TROFI · 2000–2012 · BULL RUN
      </div>
      {/* Candles */}
      <svg width={CHART_W} height={CHART_H} style={{ position: "absolute", top: 0, left: 0 }}>
        {CANDLES.map((c, i) => {
          const x = 60 + i * (CW + GAP);
          const bodyTop = c.y * (CHART_H - 60) + 40;
          const bodyH = c.h * (CHART_H - 60);
          const wickTop = bodyTop - 18;
          const wickBot = bodyTop + bodyH + 18;
          const color = c.bull ? BULL : BEAR;
          return (
            <g key={i}>
              <line x1={x + CW / 2} y1={wickTop} x2={x + CW / 2} y2={wickBot} stroke={color} strokeWidth={2} />
              <rect x={x} y={bodyTop} width={CW} height={Math.max(4, bodyH)} fill={color} opacity={0.9} rx={2} />
            </g>
          );
        })}
        {/* Acquisition marker */}
        <line x1={60 + 2 * (CW + GAP) + CW / 2} y1={40} x2={60 + 2 * (CW + GAP) + CW / 2} y2={CHART_H - 20}
          stroke={AMBER} strokeWidth={2} strokeDasharray="8,4" />
        <text x={60 + 2 * (CW + GAP)} y={36} fill={AMBER} fontSize={16} fontFamily={MONO} fontWeight={700}>
          £80M
        </text>
        {/* Drogba 88' marker */}
        <line x1={60 + 7 * (CW + GAP) + CW / 2} y1={40} x2={60 + 7 * (CW + GAP) + CW / 2} y2={CHART_H - 20}
          stroke={BULL} strokeWidth={2} strokeDasharray="8,4" />
        <text x={60 + 7 * (CW + GAP) - 10} y={36} fill={BULL} fontSize={16} fontFamily={MONO} fontWeight={700}>
          88'
        </text>
      </svg>
    </div>

    {/* Stats terminal rows */}
    <div style={{
      position: "absolute",
      top: CHART_Y + CHART_H + 32,
      left: 56,
      right: 56,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      {[
        { label: "AKUISISI JULI 2003", value: "£ 80M HUTANG", color: BEAR },
        { label: "TROFI TOTAL", value: "21 PIALA", color: BULL },
        { label: "MOURINHO SPECIAL ONE", value: "2 × PREMIER LEAGUE", color: AMBER },
        { label: "DROGBA · CL FINAL 2012", value: "MENIT 88' GOL", color: CYAN },
      ].map((r, i) => (
        <div key={i} style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: PANEL,
          border: `1px solid ${GRID}`,
          padding: "14px 20px",
        }}>
          <div style={{ fontWeight: 700, fontSize: 22, color: "rgba(255,255,255,0.5)", letterSpacing: 2 }}>{r.label}</div>
          <div style={{ fontWeight: 800, fontSize: 26, color: r.color, letterSpacing: 1 }}>{r.value}</div>
        </div>
      ))}
    </div>

    {/* Bottom AUDIRA brand bar */}
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: 96,
      background: PANEL, borderTop: `2px solid ${CHELSEA_BLUE}`,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 20,
    }}>
      <div style={{ fontWeight: 800, fontSize: 32, color: CYAN, letterSpacing: 8 }}>AUDIRA</div>
      <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.2)" }} />
      <div style={{ fontWeight: 700, fontSize: 20, color: "rgba(255,255,255,0.4)", letterSpacing: 3 }}>TERMINAL</div>
    </div>
  </AbsoluteFill>
);
