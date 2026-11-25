// BROADCASTFORGE overlay — broadcast graphics package laid out on the 1080 × 1920 layout canvas.
//
// Render it through FilmScene's `overlay` prop (or any wrapper that scales a 1080 × 1920 layer with
// useFormat().scale): every number below is a layout pixel, so Preview 540 and Final 1080 match.
// Safe zone: nothing above y 180 or below y 1540 (platform UI covers the top 180 px and bottom 380 px).
// Text is ≥ 36 px. In 16:9 the layer is 1920 × 1080; the same blocks pin to the top and bottom edges.

import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { BROADCASTFORGE_PALETTE as C } from "../lib/palette";
import { computeBroadcastForgeState } from "../core/motion";

export interface MarketIndexItem {
  symbol: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface BroadcastForgeOverlayProps {
  f: number;
  channelName?: string;
  category?: string;
  headline?: string;
  subHeadline?: string;
  location?: string;
  clock?: string;
  tickerItems?: string[];
  marketIndices?: MarketIndexItem[];
  showPipCorrespondent?: boolean;
  correspondent?: string;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

export const BroadcastForgeOverlay: React.FC<BroadcastForgeOverlayProps> = ({
  f,
  channelName = "AUDIRA NEWS",
  category = "BREAKING NEWS",
  headline = "GLOBAL TECH SUMMIT SIGNS AI SAFETY ACCORD",
  subHeadline = "42 delegations agree one standard for computing governance.",
  location = "GENEVA // SUMMIT DESK",
  clock = "15:20 WIB",
  tickerItems = [
    "TECH ACCORD RATIFIED BY 42 NATIONS",
    "AI SAFETY FRAMEWORK LOCKED FOR 2027",
    "RENEWABLE COMPUTE GRIDS UP 300% IN SEA",
  ],
  marketIndices = [
    { symbol: "IHSG", value: "7,342", change: "+1.24%", isPositive: true },
    { symbol: "NASDAQ", value: "18,920", change: "+0.65%", isPositive: true },
    { symbol: "CRUDE", value: "$76.40", change: "-0.42%", isPositive: false },
  ],
  showPipCorrespondent = true,
  correspondent = "DR. H. ARISANDI",
}) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const top = fmt.safe.top + 12;
  const bottom = H - fmt.safe.bottom; // lowest pixel any block may touch
  const side = fmt.isWide ? 96 : 60;
  const { liveBadgePulse, tickerScrollPx, stingerOpacity, waveformLevels } = computeBroadcastForgeState(f);

  // Build-in: top bar at 0.2 s, lower third wipes in at 0.8 s, ticker at 1.2 s, PIP at 1.6 s.
  const topIn = easeOut((f - 12) / 24);
  const l3In = easeOut((f - 48) / 30);
  const tickIn = easeOut((f - 72) / 24);
  const pipIn = easeOut((f - 96) / 30);

  const tickerH = 64;
  const tickerY = bottom - tickerH;
  const l3Bottom = tickerY - 14;

  const tickerText = [...tickerItems, ...marketIndices.map((m) => `${m.symbol} ${m.value} ${m.change}`)].join("   ●   ");
  // Text is ~22 px per char at 36 px Space Grotesk; loop on the width of one copy.
  const loopW = (tickerText.length + 5) * 21;
  const scroll = tickerScrollPx % loopW;

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none", fontFamily: DISPLAY.body }}>
      {/* Opening stinger flash */}
      <div style={{ position: "absolute", inset: 0, background: C.breakingRed, opacity: stingerOpacity * 0.55 }} />

      {/* Top bar: LIVE bug + channel + clock */}
      <div
        style={{
          position: "absolute",
          left: side,
          right: side,
          top,
          display: "flex",
          alignItems: "center",
          gap: 18,
          opacity: topIn,
          transform: `translateY(${(1 - topIn) * -30}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: C.breakingRed,
            padding: "6px 20px 8px",
            borderRadius: 6,
            boxShadow: `0 0 ${24 * liveBadgePulse}px rgba(211,47,47,0.8)`,
          }}
        >
          <div style={{ width: 16, height: 16, borderRadius: 8, background: C.headlineWhite, opacity: 0.4 + liveBadgePulse * 0.6 }} />
          <span style={{ fontFamily: DISPLAY.condensed, fontSize: 44, color: C.headlineWhite, letterSpacing: 2, lineHeight: 1 }}>LIVE</span>
        </div>
        <span style={{ fontFamily: DISPLAY.condensed, fontSize: 44, color: C.headlineWhite, letterSpacing: 2, lineHeight: 1 }}>{channelName}</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: DISPLAY.grotesk, fontWeight: 600, fontSize: 38, color: C.cyanAccent }}>{clock}</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: side,
          top: top + 78,
          fontFamily: DISPLAY.grotesk,
          fontWeight: 600,
          fontSize: 36,
          color: C.liveAmber,
          letterSpacing: 1,
          opacity: topIn,
        }}
      >
        {location}
      </div>

      {/* Field correspondent PIP (top right, clear of the anchor) */}
      {showPipCorrespondent ? (
        <div
          style={{
            position: "absolute",
            right: side,
            top: top + 150,
            width: 330,
            padding: "16px 20px 18px",
            background: C.plateDark,
            border: `3px solid ${C.cyanAccent}`,
            borderRadius: 10,
            opacity: pipIn,
            transform: `translateX(${(1 - pipIn) * 60}px)`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: DISPLAY.condensed, fontSize: 40, color: C.cyanAccent, letterSpacing: 1 }}>FIELD FEED</span>
            <span style={{ fontFamily: DISPLAY.grotesk, fontWeight: 700, fontSize: 36, color: "#FF7A70" }}>
              <span style={{ opacity: liveBadgePulse }}>●</span> REC
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 64, margin: "12px 0" }}>
            {[...waveformLevels, ...waveformLevels.slice(0, 4)].map((lvl, i) => (
              <div key={i} style={{ flex: 1, height: `${Math.round(lvl * 100)}%`, background: i % 3 === 1 ? C.liveAmber : C.cyanAccent, borderRadius: 3 }} />
            ))}
          </div>
          <div style={{ fontFamily: DISPLAY.grotesk, fontWeight: 600, fontSize: 36, color: C.tickerText, lineHeight: 1.1 }}>{correspondent}</div>
        </div>
      ) : null}

      {/* Lower third: category strip + headline plate */}
      <div
        style={{
          position: "absolute",
          left: side,
          right: side,
          bottom: H - l3Bottom,
          clipPath: `inset(0 ${(1 - l3In) * 100}% 0 0)`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: C.breakingRed,
            padding: "8px 22px 10px",
            fontFamily: DISPLAY.condensed,
            fontSize: 44,
            color: C.headlineWhite,
            letterSpacing: 3,
            lineHeight: 1,
          }}
        >
          {category}
        </div>
        <div style={{ background: C.plateDark, borderLeft: `10px solid ${C.cyanAccent}`, padding: "18px 26px 22px" }}>
          <div style={{ fontFamily: DISPLAY.condensed, fontSize: 64, lineHeight: 1.08, color: C.headlineWhite, letterSpacing: 0.5 }}>{headline}</div>
          <div style={{ fontSize: 36, lineHeight: 1.3, color: C.tickerText, marginTop: 10, fontWeight: 500 }}>{subHeadline}</div>
        </div>
      </div>

      {/* Ticker (ends exactly at the bottom safe line) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          width: W,
          top: tickerY,
          height: tickerH,
          display: "flex",
          alignItems: "center",
          background: "#0A1220",
          borderTop: `3px solid ${C.breakingRed}`,
          opacity: tickIn,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: "0 0 auto",
            height: "100%",
            display: "flex",
            alignItems: "center",
            padding: `0 22px 0 ${side}px`,
            background: C.liveAmber,
            fontFamily: DISPLAY.condensed,
            fontSize: 38,
            color: C.studioVoid,
            letterSpacing: 2,
            zIndex: 1,
          }}
        >
          FLASH
        </div>
        {/* A marquee is clipped by design: the layout probe skips it (data-layout-ignore). */}
        <div data-layout-ignore style={{ position: "relative", flex: 1, height: "100%", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              height: "100%",
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
              transform: `translateX(${-scroll}px)`,
              fontFamily: DISPLAY.grotesk,
              fontWeight: 600,
              fontSize: 36,
              color: C.tickerText,
            }}
          >
            {tickerText}
            {"   ●   "}
            {tickerText}
          </div>
        </div>
      </div>
    </div>
  );
};
