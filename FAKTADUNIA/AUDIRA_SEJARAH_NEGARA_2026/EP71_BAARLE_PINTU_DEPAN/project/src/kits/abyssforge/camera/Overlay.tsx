// ABYSSFORGE overlay — submersible HUD on the layout canvas (1080 × 1920, or 1920 × 1080 wide) via
// `useFormat()`. Render it through FilmScene's `overlay`. Every text ≥ 36 px, inside the safe area
// (9:16: y 180…1540).
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";
import { ABYSS_PALETTE } from "../lib/palette";
import { depthMetres, smooth, zoneName } from "../core/motion";

const MONO = "'Consolas', 'Courier New', monospace";

/** Submersible HUD: dive log, title, sonar ring, depth gauge, caption, credit. */
export const AbyssforgeOverlay: React.FC<{ t: number; title?: string }> = ({ t, title = "The Light Below" }) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const side = fmt.isWide ? 96 : 64;
  const top = fmt.safe.top + 24;
  const bottom = fmt.safe.bottom + 24;
  const fade = smooth(0.1, 0.8, t);
  const m = depthMetres(t);
  const zone = zoneName(m);
  const pressure = 1 + m / 10;
  const temp = Math.max(1.6, 18 - m * 0.0075);
  const sweep = (t * 140) % 360;
  const captionIn = smooth(9.3, 10.1, t);
  const accent = captionIn > 0.5 ? ABYSS_PALETTE.hudAmber : ABYSS_PALETTE.hudCyan;

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none", color: "#E6FBFF", fontFamily: DISPLAY.grotesk, opacity: fade }}>
      {/* top block: dive log + title (left), kit badge (right) */}
      <div style={{ position: "absolute", top, left: side, right: side, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 36, letterSpacing: 3, color: ABYSS_PALETTE.hudCyan, marginBottom: 12 }}>● DIVE LOG 052</div>
          <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 0.98, letterSpacing: -2, textShadow: "0 0 28px rgba(56,246,255,0.35)" }}>
            {title.split(" ").slice(0, 2).join(" ")}
            <br />
            {title.split(" ").slice(2).join(" ")}
          </div>
        </div>
        <div style={{ border: `2px solid ${ABYSS_PALETTE.hudCyan}`, background: ABYSS_PALETTE.hudInk, padding: "10px 18px", borderRadius: 6, fontFamily: MONO, fontWeight: 700, fontSize: 36, letterSpacing: 2, color: ABYSS_PALETTE.hudCyan }}>
          ABYSSFORGE
        </div>
      </div>

      {/* right-edge sonar + depth gauge (between the safe bands) */}
      <div style={{ position: "absolute", right: side, top: fmt.isWide ? 250 : 880, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
        <svg width={200} height={200} viewBox="-100 -100 200 200">
          <defs>
            <linearGradient id="abyssSweep" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={ABYSS_PALETTE.hudCyan} stopOpacity="0" />
              <stop offset="1" stopColor={ABYSS_PALETTE.hudCyan} stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <circle r="96" fill="rgba(2,10,20,0.55)" stroke={ABYSS_PALETTE.hudCyan} strokeOpacity="0.6" strokeWidth="2" />
          {[32, 64].map((r) => (
            <circle key={r} r={r} fill="none" stroke={ABYSS_PALETTE.hudCyan} strokeOpacity="0.3" strokeWidth="1.5" />
          ))}
          <line x1="-96" y1="0" x2="96" y2="0" stroke={ABYSS_PALETTE.hudCyan} strokeOpacity="0.2" />
          <line x1="0" y1="-96" x2="0" y2="96" stroke={ABYSS_PALETTE.hudCyan} strokeOpacity="0.2" />
          <g transform={`rotate(${sweep})`}>
            <path d="M0 0 L96 0 A96 96 0 0 0 83 -48 Z" fill="url(#abyssSweep)" />
          </g>
          {/* contacts: jellies early, the big echo appears at the payoff */}
          <circle cx={-40} cy={30} r={4} fill={ABYSS_PALETTE.lumenMagenta} opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 2))} />
          <circle cx={52} cy={-22} r={3} fill={ABYSS_PALETTE.hudCyan} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 1.6))} />
          <circle cx={6} cy={58 - smooth(8, 11, t) * 40} r={4 + smooth(8.5, 10, t) * 9} fill="none" stroke={ABYSS_PALETTE.hudAmber} strokeWidth="3" opacity={smooth(8.2, 9, t)} />
        </svg>
        <div style={{ fontFamily: MONO, textAlign: "right", background: ABYSS_PALETTE.hudInk, padding: "14px 18px", borderRight: `4px solid ${ABYSS_PALETTE.hudCyan}` }}>
          <div style={{ fontSize: 72, fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>
            {Math.round(m).toLocaleString("en-US")}
            <span style={{ fontSize: 40, color: ABYSS_PALETTE.hudCyan }}> m</span>
          </div>
          <div style={{ fontSize: 36, letterSpacing: 1, color: m >= 1000 ? "#FF7FE2" : ABYSS_PALETTE.hudCyan, marginTop: 8 }}>{zone}</div>
          <div style={{ fontSize: 36, color: "#CFEFF5", marginTop: 6 }}>
            {pressure.toFixed(0)} atm · {temp.toFixed(1)}°C
          </div>
        </div>
      </div>

      {/* bottom caption + credit (ends above the bottom safe band) */}
      <div style={{ position: "absolute", left: side, right: side, bottom, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
        <div style={{ maxWidth: fmt.isWide ? 900 : 660, background: ABYSS_PALETTE.hudInk, borderLeft: `5px solid ${accent}`, padding: "20px 26px" }}>
          <div style={{ fontSize: 42, lineHeight: 1.25, fontWeight: 500 }}>
            {captionIn > 0.5 ? "Contact. Something down here makes its own light." : "Below 1,000 m no sunlight survives. Every glow is alive."}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 36, color: accent, marginTop: 12 }}>SONAR 0.4 HZ</div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 36, color: "#CFEFF5", background: ABYSS_PALETTE.hudInk, padding: "8px 14px", whiteSpace: "nowrap" }}>AUDIRA</div>
      </div>
    </div>
  );
};
