// EP06 2D layers in RETROWAVE: CRT terminal windows, neon step badges, pixel cursor, warning cards.
// All sizes are in 1080-wide design pixels and multiplied by k = width / 1080.
import React from "react";
import { RETROWAVE_PALETTE as P } from "../../kits/retrowave/lib/palette.ts";

export const PIX = "'VTThreeTwoThree', monospace";
export const DISPLAY = "'Kanit', sans-serif";
export const VIOLET = "#7A2BFF";
export const INK = "#0C081A";
export const PANEL = "rgba(20,10,46,0.9)";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const sm = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
export const outBack = (x: number, s = 1.7) => {
  const c = s + 1;
  return x <= 0 ? 0 : 1 + c * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
};
/** fade-in/out window */
export const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => sm((t - a) / fi) * (1 - sm((t - (b - fo)) / fo));
export const typed = (text: string, t: number, a: number, b: number) => text.slice(0, Math.round(text.length * ramp(t, a, b)));
/** hot highlight around a tap time: on from tt-0.1, fades after tt+0.6 */
export const hotAt = (t: number, tt: number, hold = 0.6) => (t >= tt - 0.1 ? Math.max(0, 1 - Math.max(0, t - tt - hold) / 0.4) : 0);

export const glow = (c: string, r = 14) => `0 0 ${r}px ${c}`;

/** Neon CRT window with a gradient title bar and three status lamps. */
export const Win: React.FC<{ x: number; y: number; w: number; h: number; k: number; title: string; children?: React.ReactNode; accent?: string }> = ({ x, y, w, h, k, title, children, accent = P.neonMagenta }) => (
  <div style={{ position: "absolute", left: x * k, top: y * k, width: w * k, height: h * k, borderRadius: 26 * k, background: PANEL, border: `${3 * k}px solid ${accent}`, boxShadow: `0 0 ${30 * k}px rgba(255,0,127,0.45), inset 0 0 ${40 * k}px rgba(122,43,255,0.25)`, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 66 * k, background: `linear-gradient(90deg, ${accent}, ${VIOLET})` }} />
    <div style={{ position: "absolute", left: 26 * k, top: 8 * k, fontFamily: PIX, fontSize: 44 * k, color: INK, letterSpacing: 2 * k }}>{title}</div>
    {[P.synthCyan, P.sunsetAmber, P.phosphorGreen].map((c, i) => (
      <div key={i} style={{ position: "absolute", right: (28 + i * 34) * k, top: 22 * k, width: 22 * k, height: 22 * k, borderRadius: "50%", background: c }} />
    ))}
    <div style={{ position: "absolute", left: 0, top: 66 * k, right: 0, bottom: 0 }}>{children}</div>
    {/* scanlines inside the window */}
    <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) ${2 * k}px, transparent ${2 * k}px, transparent ${5 * k}px)`, pointerEvents: "none" }} />
  </div>
);

/** Pill button with neon outline; `hot` 0..1 lights it up. */
export const Btn: React.FC<{ x: number; y: number; w: number; h: number; k: number; label: React.ReactNode; hot?: number; color?: string; size?: number; solid?: boolean }> = ({ x, y, w, h, k, label, hot = 0, color = P.synthCyan, size = 40, solid = false }) => (
  <div
    style={{
      position: "absolute",
      left: x * k,
      top: y * k,
      width: w * k,
      height: h * k,
      borderRadius: 16 * k,
      border: `${3 * k}px solid ${color}`,
      background: solid ? color : hot > 0 ? `rgba(0,246,255,${0.25 * hot})` : "rgba(12,8,26,0.6)",
      color: solid ? INK : hot > 0.5 ? "#FFFFFF" : color,
      fontFamily: PIX,
      fontSize: size * k,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      whiteSpace: "nowrap",
      transform: `scale(${1 + hot * 0.05})`,
      boxShadow: hot > 0.3 ? `0 0 ${24 * k}px ${color}` : `0 0 ${8 * k}px rgba(0,246,255,0.35)`,
    }}
  >
    {label}
  </div>
);

/** Retro pixel arrow cursor with a tap ripple. */
export const Cursor: React.FC<{ x: number; y: number; k: number; press: number; ripple: number; o?: number }> = ({ x, y, k, press, ripple, o = 1 }) => (
  <div style={{ position: "absolute", left: x * k, top: y * k, opacity: o, pointerEvents: "none" }}>
    {ripple > 0 && ripple < 1 && (
      <div style={{ position: "absolute", left: -60 * ripple * k, top: -60 * ripple * k, width: 120 * ripple * k, height: 120 * ripple * k, borderRadius: "50%", border: `${4 * k}px solid ${P.synthCyan}`, opacity: 1 - ripple }} />
    )}
    <svg width={64 * k} height={80 * k} viewBox="0 0 16 20" style={{ transform: `scale(${1 - press * 0.15})`, transformOrigin: "0 0", filter: `drop-shadow(0 0 ${8 * k}px ${P.neonMagenta})`, shapeRendering: "crispEdges" }}>
      <path d="M0 0h2v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v2H8v1h1v2h1v2H9v1H7v-1H6v-2H5v-2H4v1H3v1H2v1H0z" fill={P.neonMagenta} />
      <path d="M2 2h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1H7v1h1v2h1v2H8v-2H7v-2H6v-1H5v1H4v1H3v1H2z" fill="#FFFFFF" />
    </svg>
  </div>
);

/** Big neon step number + title; header area starts at y 262 (below the AUDIRA signature). */
export const StepHeader: React.FC<{ n: number; title: React.ReactNode; sub?: string; k: number; t: number; a: number; b: number }> = ({ n, title, sub, k, t, a, b }) => {
  const o = win(t, a, b, 0.3, 0.25);
  if (o <= 0) return null;
  const pop = outBack(ramp(t, a, a + 0.45));
  return (
    <div style={{ position: "absolute", left: 64 * k, top: 262 * k, right: 60 * k, display: "flex", alignItems: "center", gap: 28 * k, opacity: o }}>
      <div style={{ width: 150 * k, height: 150 * k, flex: "none", borderRadius: 24 * k, background: `linear-gradient(160deg, ${P.neonMagenta}, ${VIOLET})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 900, fontSize: 124 * k, color: "#FFFFFF", textShadow: `0 ${5 * k}px 0 #3a0a5c`, boxShadow: `0 0 ${34 * k}px rgba(255,0,127,0.8)`, transform: `scale(${pop}) rotate(${(1 - pop) * -12}deg)` }}>
        {n}
      </div>
      <div style={{ transform: `translateX(${(1 - sm(ramp(t, a, a + 0.4))) * 40 * k}px)` }}>
        <div style={{ fontFamily: PIX, fontSize: 40 * k, letterSpacing: 4 * k, color: P.synthCyan, textShadow: glow("rgba(0,246,255,0.8)", 12 * k) }}>LANGKAH {n}</div>
        <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 800, fontSize: 60 * k, lineHeight: 1.04, color: "#FFFFFF", textShadow: `0 0 ${18 * k}px rgba(255,0,127,0.75), 0 ${4 * k}px 0 #3a0a5c` }}>{title}</div>
        {sub && <div style={{ fontFamily: PIX, fontSize: 38 * k, color: P.sunsetAmber, marginTop: 4 * k }}>{sub}</div>}
      </div>
    </div>
  );
};

/** Kicker + chrome/neon headline block (hook, konteks, outro). */
export const Headline: React.FC<{ kicker: string; children: React.ReactNode; k: number; t: number; a: number; b: number; size?: number; top?: number }> = ({ kicker, children, k, t, a, b, size = 110, top = 262 }) => {
  const o = win(t, a, b, 0.3, 0.25);
  if (o <= 0) return null;
  const rise = sm(ramp(t, a, a + 0.45));
  return (
    <div style={{ position: "absolute", left: 64 * k, right: 60 * k, top: top * k, opacity: o, transform: `translateY(${(1 - rise) * 30 * k}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * k, fontFamily: PIX, fontSize: 44 * k, letterSpacing: 5 * k, color: P.synthCyan, textShadow: glow("rgba(0,246,255,0.8)", 12 * k) }}>
        <span style={{ width: 18 * k, height: 18 * k, background: P.neonMagenta, boxShadow: glow("#FF007F", 12 * k), display: "inline-block" }} />
        {kicker}
      </div>
      <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 900, fontSize: size * k, lineHeight: 1.0, marginTop: 8 * k, color: "#FFFFFF", textShadow: `0 0 ${24 * k}px rgba(255,0,127,0.85), 0 ${6 * k}px 0 #3a0a5c` }}>{children}</div>
    </div>
  );
};

export const Hl: React.FC<{ c?: string; children: React.ReactNode }> = ({ c = P.neonMagenta, children }) => <span style={{ color: c }}>{children}</span>;

/** Warning / info card with a hazard stripe. */
export const WarnCard: React.FC<{ x: number; y: number; w: number; k: number; t: number; a: number; b: number; kicker: string; children: React.ReactNode; icon?: string; color?: string }> = ({ x, y, w, k, t, a, b, kicker, children, icon = "!", color = P.sunsetAmber }) => {
  const o = win(t, a, b, 0.3, 0.25);
  if (o <= 0) return null;
  const pop = outBack(ramp(t, a, a + 0.4), 1.3);
  return (
    <div style={{ position: "absolute", left: x * k, top: y * k, width: w * k, opacity: o, transform: `scale(${0.85 + 0.15 * pop})`, transformOrigin: "50% 0%" }}>
      <div style={{ borderRadius: 22 * k, background: PANEL, border: `${4 * k}px solid ${color}`, boxShadow: `0 0 ${28 * k}px ${color}88`, overflow: "hidden" }}>
        <div style={{ height: 20 * k, background: `repeating-linear-gradient(45deg, ${color} 0 ${18 * k}px, ${INK} ${18 * k}px ${36 * k}px)` }} />
        <div style={{ display: "flex", gap: 24 * k, padding: `${22 * k}px ${30 * k}px ${26 * k}px` }}>
          <div style={{ width: 84 * k, height: 84 * k, flex: "none", borderRadius: "50%", background: color, color: INK, fontFamily: DISPLAY, fontWeight: 900, fontSize: 62 * k, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
          <div>
            <div style={{ fontFamily: PIX, fontSize: 40 * k, letterSpacing: 3 * k, color }}>{kicker}</div>
            <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 800, fontSize: 52 * k, lineHeight: 1.08, color: "#FFFFFF" }}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
