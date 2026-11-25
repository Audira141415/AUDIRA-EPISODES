// EP10 2D layers in FILMNOIR dress: case-file cards (near-black, cream typewriter/serif text),
// tungsten amber for "hot", stamp red for delete. Sizes are 1080-wide units times k = width / 1080.
import React from "react";
import { FILMNOIR_PALETTE as NP } from "../../kits/filmnoir/lib/palette.ts";

export const SERIF = "'Times New Roman', Georgia, serif";
export const MONO = "'Courier New', Courier, monospace";
export const AMBER = NP.streetLightTungsten;
export const RED = "#E0313F";
export const CREAM = "#F2EBDD";
export const INK = "#0B0D10";
export const DIM = "rgba(242,235,221,0.55)";

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
/** 0 -> 1 -> 0 visibility window with soft edges. */
export const win = (t: number, a: number, b: number, fi = 0.35, fo = 0.3) => sm((t - a) / fi) * (1 - sm((t - (b - fo)) / fo));
/** Typewriter reveal over [a, b]. */
export const typed = (text: string, t: number, a: number, b: number) => text.slice(0, Math.round(text.length * ramp(t, a, b)));
/** Highlight that flashes on at tt and settles after ~1 s. */
export const hotAt = (t: number, tt: number) => (t >= tt - 0.12 ? Math.max(0, 1 - Math.max(0, t - tt - 0.7) / 0.4) : 0);

export const T: React.FC<{ x: number; y: number; k: number; size: number; color?: string; font?: string; weight?: number; w?: number; lh?: number; ls?: number; children: React.ReactNode }> = ({
  x, y, k, size, color = CREAM, font = SERIF, weight = 700, w, lh = 1.15, ls = 0, children,
}) => (
  <div style={{ position: "absolute", left: x * k, top: y * k, width: w ? w * k : undefined, fontFamily: font, fontWeight: weight, fontSize: size * k, lineHeight: lh, color, letterSpacing: ls * k, whiteSpace: w ? "normal" : "nowrap" }}>
    {children}
  </div>
);

/** Typewriter case-file headline block: mono kicker + serif headline, top-left (y >= 262). */
export const Headline: React.FC<{ t: number; k: number; a: number; b: number; kicker: string; size?: number; top?: number; children: React.ReactNode }> = ({ t, k, a, b, kicker, size = 96, top = 268, children }) => {
  const o = win(t, a, b, 0.3, 0.3);
  if (o <= 0) return null;
  const rise = 1 - sm(ramp(t, a, a + 0.5));
  return (
    <div style={{ position: "absolute", left: 60 * k, top: top * k, width: 960 * k, opacity: o, transform: `translateY(${rise * 26 * k}px)` }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28 * k, letterSpacing: 6 * k, color: AMBER }}>{typed(kicker, t, a, a + 0.5)}</div>
      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: size * k, lineHeight: 1.0, color: CREAM, marginTop: 12 * k, textShadow: `0 ${4 * k}px ${22 * k}px rgba(0,0,0,0.95)` }}>{children}</div>
    </div>
  );
};

export const Accent: React.FC<{ children: React.ReactNode; red?: boolean }> = ({ children, red }) => <span style={{ color: red ? RED : AMBER }}>{children}</span>;

/** Big step number + title bar above the UI panel (y 262..450). */
export const StepHeader: React.FC<{ n: number; title: string; sub: string; k: number; t: number; a: number; b: number }> = ({ n, title, sub, k, t, a, b }) => {
  const o = win(t, a, b, 0.3, 0.25);
  if (o <= 0) return null;
  const pop = outBack(ramp(t, a, a + 0.4));
  return (
    <div style={{ position: "absolute", left: 50 * k, top: 272 * k, width: 980 * k, opacity: o, display: "flex", alignItems: "center", gap: 24 * k }}>
      <div style={{ flex: "none", width: 150 * k, height: 150 * k, borderRadius: "50%", background: AMBER, color: INK, fontFamily: SERIF, fontWeight: 900, fontSize: 112 * k, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop})`, boxShadow: `0 0 ${40 * k}px rgba(255,227,160,0.35)` }}>{n}</div>
      <div style={{ transform: `translateX(${(1 - sm(ramp(t, a + 0.05, a + 0.45))) * -30 * k}px)` }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24 * k, letterSpacing: 5 * k, color: AMBER }}>LANGKAH {n}</div>
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 58 * k, lineHeight: 1.02, color: CREAM, textShadow: `0 ${3 * k}px ${14 * k}px rgba(0,0,0,0.9)` }}>{title}</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 32 * k, color: DIM, marginTop: 4 * k }}>{sub}</div>
      </div>
    </div>
  );
};

/** Warning / fact card: red-edged case-file slip with a round stamp icon. */
export const WarnCard: React.FC<{ t: number; k: number; a: number; b: number; kicker: string; top?: number; icon?: string; children: React.ReactNode }> = ({ t, k, a, b, kicker, top = 268, icon = "!", children }) => {
  const o = win(t, a, b, 0.3, 0.3);
  if (o <= 0) return null;
  const pop = outBack(ramp(t, a, a + 0.4));
  return (
    <div style={{ position: "absolute", left: 48 * k, top: top * k, width: 984 * k, opacity: o, transform: `scale(${0.88 + 0.12 * pop}) rotate(-0.6deg)`, transformOrigin: "0 0", display: "flex", gap: 22 * k, alignItems: "flex-start", background: "rgba(10,11,14,0.92)", border: `${2 * k}px solid rgba(242,235,221,0.18)`, borderLeft: `${10 * k}px solid ${RED}`, boxShadow: `0 ${12 * k}px ${30 * k}px rgba(0,0,0,0.7)`, padding: `${20 * k}px ${26 * k}px`, boxSizing: "border-box" }}>
      <div style={{ flex: "none", width: 92 * k, height: 92 * k, borderRadius: "50%", border: `${5 * k}px solid ${RED}`, color: RED, fontFamily: SERIF, fontWeight: 900, fontSize: 62 * k, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(-8deg)` }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24 * k, letterSpacing: 4 * k, color: RED }}>{kicker}</div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 48 * k, lineHeight: 1.15, color: CREAM, marginTop: 6 * k }}>{children}</div>
      </div>
    </div>
  );
};

/** Rubber stamp slammed onto the frame. */
export const Stamp: React.FC<{ t: number; k: number; at: number; until: number; x: number; y: number; text: string; size?: number; rot?: number }> = ({ t, k, at, until, x, y, text, size = 96, rot = -9 }) => {
  if (t < at || t > until) return null;
  const s = ramp(t, at, at + 0.18);
  const scale = 1.8 - 0.8 * sm(s);
  const o = s * (1 - sm(ramp(t, until - 0.3, until)));
  return (
    <div style={{ position: "absolute", left: x * k, top: y * k, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${scale})`, opacity: o, border: `${8 * k}px solid ${RED}`, padding: `${6 * k}px ${26 * k}px`, color: RED, fontFamily: SERIF, fontWeight: 900, fontSize: size * k, letterSpacing: 4 * k, whiteSpace: "nowrap", background: "rgba(10,8,8,0.35)", mixBlendMode: "screen" }}>
      {text}
    </div>
  );
};

/** Noir pointer: a cream arrow with ink outline; press squash + amber ripple. */
export const Pointer: React.FC<{ x: number; y: number; k: number; press: number; ripple: number }> = ({ x, y, k, press, ripple }) => (
  <>
    {ripple > 0 && ripple < 1 && (
      <div style={{ position: "absolute", left: (x - 40 - ripple * 30) * k, top: (y - 40 - ripple * 30) * k, width: (80 + ripple * 60) * k, height: (80 + ripple * 60) * k, borderRadius: "50%", border: `${4 * k}px solid ${AMBER}`, opacity: 1 - ripple }} />
    )}
    <svg width={70 * k} height={90 * k} viewBox="0 0 70 90" style={{ position: "absolute", left: x * k, top: y * k, transform: `scale(${1 - press * 0.15})`, transformOrigin: "0 0", filter: `drop-shadow(0 ${6 * k}px ${8 * k}px rgba(0,0,0,0.7))` }}>
      <path d="M 2 2 L 2 70 L 18 55 L 30 84 L 42 79 L 30 51 L 52 51 Z" fill={CREAM} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    </svg>
  </>
);

/** Button in the dossier UI. */
export const Btn: React.FC<{ x: number; y: number; w: number; h: number; k: number; label: string; hot?: number; danger?: boolean; size?: number }> = ({ x, y, w, h, k, label, hot = 0, danger = false, size = 30 }) => {
  const c = danger ? RED : AMBER;
  return (
    <div style={{ position: "absolute", left: x * k, top: y * k, width: w * k, height: h * k, borderRadius: 10 * k, border: `${3 * k}px solid ${hot > 0.3 ? c : "rgba(242,235,221,0.4)"}`, background: hot > 0 ? (danger ? `rgba(224,49,63,${0.25 * hot})` : `rgba(255,227,160,${0.18 * hot})`) : "rgba(255,255,255,0.04)", color: hot > 0.3 ? c : CREAM, fontFamily: MONO, fontWeight: 700, fontSize: size * k, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + hot * 0.04})`, boxShadow: hot > 0.5 ? `0 0 ${24 * k}px ${danger ? "rgba(224,49,63,0.45)" : "rgba(255,227,160,0.35)"}` : undefined, whiteSpace: "nowrap" }}>
      {label}
    </div>
  );
};

/** Dark dossier panel (absolute, 1080 units) with paper grain and a cream hairline. */
export const Panel: React.FC<{ x: number; y: number; w: number; h: number; k: number; children: React.ReactNode }> = ({ x, y, w, h, k, children }) => (
  <div style={{ position: "absolute", left: x * k, top: y * k, width: w * k, height: h * k, background: `repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 5px), rgba(14,16,20,0.95)`, border: `${2 * k}px solid rgba(242,235,221,0.28)`, borderRadius: 18 * k, boxShadow: `0 ${18 * k}px ${50 * k}px rgba(0,0,0,0.8), inset 0 0 ${60 * k}px rgba(0,0,0,0.6)`, overflow: "hidden" }}>
    {children}
  </div>
);
