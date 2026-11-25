// EP09 2D layers in LIDARFORGE dress: dark survey-glass panels with cyan corner brackets, mono readouts,
// amber measurement accents. All sizes are 1080-wide units multiplied by k = width / 1080.
import React from "react";
import { LIDAR_PALETTE as P } from "../../kits/lidarforge/lib/palette.ts";

export const MONO = "'JetBrains Mono', monospace";
export const GROT = "'Space Grotesk', sans-serif";
export const CYAN = P.laserScanFront;
export const AMBER = P.measurementAccent;
export const INK = P.hudReadout;
export const GLASS = "rgba(5,14,20,0.86)";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const sm = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
export const outBack = (x: number, s = 1.7) => {
  const c = clamp01(x) - 1;
  return 1 + (s + 1) * c * c * c + s * c * c;
};
export const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => sm((t - a) / fi) * (1 - sm((t - (b - fo)) / fo));
export const typed = (text: string, t: number, a: number, b: number) => text.slice(0, Math.round(text.length * ramp(t, a, b)));

/** Cyan corner brackets (survey frame) sized to the parent. */
export const Brackets: React.FC<{ k: number; color?: string; len?: number; w?: number }> = ({ k, color = CYAN, len = 34, w = 4 }) => {
  const s = (pos: React.CSSProperties): React.CSSProperties => ({ position: "absolute", width: len * k, height: len * k, ...pos });
  const b = `${w * k}px solid ${color}`;
  return (
    <>
      <div style={s({ left: -2 * k, top: -2 * k, borderLeft: b, borderTop: b })} />
      <div style={s({ right: -2 * k, top: -2 * k, borderRight: b, borderTop: b })} />
      <div style={s({ left: -2 * k, bottom: -2 * k, borderLeft: b, borderBottom: b })} />
      <div style={s({ right: -2 * k, bottom: -2 * k, borderRight: b, borderBottom: b })} />
    </>
  );
};

/** Glass HUD panel at absolute 1080-unit position. */
export const Panel: React.FC<{ x: number; y: number; w: number; h: number; k: number; children?: React.ReactNode; style?: React.CSSProperties; t?: number }> = ({ x, y, w, h, k, children, style, t = 0 }) => (
  <div style={{ position: "absolute", left: x * k, top: y * k, width: w * k, height: h * k, ...style }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `repeating-linear-gradient(0deg, rgba(0,240,255,0.035) 0px, rgba(0,240,255,0.035) ${1 * k}px, transparent ${1 * k}px, transparent ${5 * k}px), ${GLASS}`,
        border: `${2 * k}px solid rgba(0,240,255,0.35)`,
        boxShadow: `0 0 ${40 * k}px rgba(0,240,255,0.12), 0 ${12 * k}px ${40 * k}px rgba(0,0,0,0.6)`,
        backdropFilter: "blur(6px)",
      }}
    />
    {/* slow scan line across the glass */}
    <div style={{ position: "absolute", left: 0, right: 0, top: `${((t * 18) % 100).toFixed(2)}%`, height: 2 * k, background: "linear-gradient(90deg, transparent, rgba(0,240,255,0.35), transparent)" }} />
    <Brackets k={k} />
    {children}
  </div>
);

export const T: React.FC<{ x: number; y: number; k: number; size: number; font?: string; color?: string; weight?: number; w?: number; children?: React.ReactNode; spacing?: number; lh?: number }> = ({
  x, y, k, size, font = GROT, color = INK, weight = 700, w, children, spacing = 0, lh = 1.18,
}) => (
  <div style={{ position: "absolute", left: x * k, top: y * k, width: w ? w * k : undefined, fontFamily: font, fontSize: size * k, fontWeight: weight, color, letterSpacing: spacing * k, lineHeight: lh, whiteSpace: w ? "normal" : "nowrap" }}>
    {children}
  </div>
);

/** Pill button; `hot` 0..1 lights it cyan, `on` fills it. */
export const Btn: React.FC<{ x: number; y: number; w: number; h: number; k: number; label: React.ReactNode; hot?: number; on?: boolean; size?: number; color?: string }> = ({ x, y, w, h, k, label, hot = 0, on = false, size = 28, color = CYAN }) => (
  <div
    style={{
      position: "absolute",
      left: x * k,
      top: y * k,
      width: w * k,
      height: h * k,
      borderRadius: h * 0.5 * k,
      border: `${3 * k}px solid ${on || hot > 0.4 ? color : "rgba(241,245,249,0.45)"}`,
      background: on ? color : hot > 0 ? `rgba(0,240,255,${0.18 * hot})` : "rgba(241,245,249,0.06)",
      color: on ? "#03141a" : INK,
      fontFamily: MONO,
      fontWeight: 800,
      fontSize: size * k,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10 * k,
      transform: `scale(${1 + hot * 0.05})`,
      boxShadow: on || hot > 0.5 ? `0 0 ${24 * k}px ${color}88` : undefined,
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </div>
);

/** Blurred placeholder text line (report content stays unreadable on purpose). */
export const Blur: React.FC<{ x: number; y: number; w: number; k: number; h?: number; color?: string }> = ({ x, y, w, k, h = 14, color = "rgba(241,245,249,0.42)" }) => (
  <div style={{ position: "absolute", left: x * k, top: y * k, width: w * k, height: h * k, borderRadius: h * 0.5 * k, background: color, filter: `blur(${2.5 * k}px)` }} />
);

/** Pointer cursor with a survey reticle; tip at (x, y). */
export const Cursor: React.FC<{ x: number; y: number; k: number; press: number; ripple: number; o?: number }> = ({ x, y, k, press, ripple, o = 1 }) => (
  <>
    {ripple > 0 && ripple < 1 && (
      <>
        <div style={{ position: "absolute", left: (x - 60 * ripple) * k, top: (y - 60 * ripple) * k, width: 120 * ripple * k, height: 120 * ripple * k, borderRadius: "50%", border: `${4 * k}px solid ${CYAN}`, opacity: 1 - ripple }} />
        <div style={{ position: "absolute", left: (x - 36 * ripple) * k, top: (y - 36 * ripple) * k, width: 72 * ripple * k, height: 72 * ripple * k, border: `${3 * k}px solid ${AMBER}`, opacity: 1 - ripple, transform: "rotate(45deg)" }} />
      </>
    )}
    <svg width={90 * k} height={110 * k} viewBox="0 0 90 110" style={{ position: "absolute", left: x * k, top: y * k, opacity: o, overflow: "visible", transform: `translate(${-3 * k}px, ${-3 * k}px) scale(${1 - press * 0.14})`, transformOrigin: "0 0", filter: `drop-shadow(0 0 ${8 * k}px rgba(0,240,255,0.8)) drop-shadow(${4 * k}px ${8 * k}px ${6 * k}px rgba(0,0,0,0.6))` }}>
      <path d="M 0 0 L 0 78 L 20 60 L 34 92 L 48 86 L 34 55 L 60 55 Z" fill="#f1f5f9" stroke="#03141a" strokeWidth={5} strokeLinejoin="round" />
    </svg>
  </>
);

/** Big step number block + instruction (top-left, below the signature band at y >= 262). */
export const StepHeader: React.FC<{ n: number; title: string; sub?: string; k: number; t: number; a: number; b: number }> = ({ n, title, sub, k, t, a, b }) => {
  const o = win(t, a, b, 0.3, 0.25);
  if (o <= 0) return null;
  const pop = outBack(ramp(t, a, a + 0.45));
  return (
    <div style={{ position: "absolute", left: 48 * k, top: 268 * k, opacity: o, display: "flex", alignItems: "center", gap: 22 * k }}>
      <div style={{ position: "relative", width: 136 * k, height: 136 * k, flex: "none", transform: `scale(${pop})`, background: "rgba(0,240,255,0.12)", border: `${3 * k}px solid ${CYAN}`, boxShadow: `0 0 ${30 * k}px rgba(0,240,255,0.45)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GROT, fontWeight: 700, fontSize: 104 * k, color: CYAN, textShadow: `0 0 ${18 * k}px ${CYAN}` }}>
        {n}
        <div style={{ position: "absolute", left: 6 * k, top: 4 * k, fontFamily: MONO, fontSize: 16 * k, fontWeight: 600, color: AMBER, letterSpacing: 2 * k, textShadow: "none" }}>STEP</div>
      </div>
      <div style={{ background: GLASS, padding: `${12 * k}px ${22 * k}px`, borderLeft: `${6 * k}px solid ${AMBER}`, maxWidth: 800 * k, transform: `translateX(${(1 - sm(ramp(t, a + 0.1, a + 0.5))) * -40 * k}px)`, boxShadow: `0 ${8 * k}px ${24 * k}px rgba(0,0,0,0.5)` }}>
        <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 22 * k, letterSpacing: 5 * k, color: AMBER }}>LANGKAH {n}</div>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 46 * k, lineHeight: 1.12, color: INK }}>{title}</div>
        {sub && <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 26 * k, color: "#9fd8e3", marginTop: 4 * k }}>{sub}</div>}
      </div>
    </div>
  );
};

/** Headline card: mono kicker + Space Grotesk line, top-left. */
export const Headline: React.FC<{ kicker: React.ReactNode; children: React.ReactNode; k: number; t: number; a: number; b: number; size?: number; top?: number }> = ({ kicker, children, k, t, a, b, size = 72, top = 268 }) => {
  const o = win(t, a, b);
  if (o <= 0) return null;
  const sl = 1 - sm(ramp(t, a, a + 0.5));
  return (
    <div style={{ position: "absolute", left: 48 * k, top: top * k, maxWidth: 960 * k, opacity: o, transform: `translateY(${sl * -30 * k}px)`, background: GLASS, padding: `${16 * k}px ${28 * k}px ${20 * k}px`, borderLeft: `${7 * k}px solid ${CYAN}`, boxShadow: `0 ${8 * k}px ${28 * k}px rgba(0,0,0,0.5)` }}>
      <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 24 * k, letterSpacing: 5 * k, color: CYAN, display: "flex", alignItems: "center", gap: 12 * k }}>
        <span style={{ width: 14 * k, height: 14 * k, background: CYAN, boxShadow: `0 0 ${12 * k}px ${CYAN}`, display: "inline-block" }} />
        {kicker}
      </div>
      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: size * k, lineHeight: 1.04, color: INK, marginTop: 8 * k, letterSpacing: -1 * k }}>{children}</div>
    </div>
  );
};

/** Amber warning card with icon. */
export const WarnCard: React.FC<{ t: number; k: number; a: number; b: number; kicker: string; children: React.ReactNode; top?: number; icon?: string; color?: string }> = ({ t, k, a, b, kicker, children, top = 268, icon = "!", color = AMBER }) => {
  const o = win(t, a, b, 0.25, 0.3);
  if (o <= 0) return null;
  const pop = outBack(ramp(t, a, a + 0.4));
  const glitch = t - a < 0.18 ? Math.sin(t * 190) * 6 : 0;
  return (
    <div style={{ position: "absolute", left: 48 * k, top: top * k, width: 984 * k, opacity: o, transform: `translateX(${glitch * k}px) scale(${0.88 + 0.12 * pop})`, transformOrigin: "0 0", display: "flex", gap: 22 * k, alignItems: "center", background: GLASS, border: `${4 * k}px solid ${color}`, boxShadow: `0 0 ${30 * k}px ${color}55, 0 ${10 * k}px ${26 * k}px rgba(0,0,0,0.55)`, padding: `${18 * k}px ${24 * k}px`, boxSizing: "border-box" }}>
      <div style={{ flex: "none", width: 96 * k, height: 96 * k, background: color, color: "#04070a", fontFamily: GROT, fontWeight: 700, fontSize: icon.length > 1 ? 44 * k : 70 * k, display: "flex", alignItems: "center", justifyContent: "center", clipPath: icon === "!" ? "polygon(50% 0, 100% 100%, 0 100%)" : undefined, paddingTop: icon === "!" ? 22 * k : 0, boxSizing: "border-box" }}>{icon}</div>
      <div>
        <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 22 * k, letterSpacing: 4 * k, color }}>{kicker}</div>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 48 * k, lineHeight: 1.12, color: INK }}>{children}</div>
      </div>
    </div>
  );
};

export const Cy: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: CYAN }}>{children}</span>;
export const Am: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: AMBER }}>{children}</span>;
