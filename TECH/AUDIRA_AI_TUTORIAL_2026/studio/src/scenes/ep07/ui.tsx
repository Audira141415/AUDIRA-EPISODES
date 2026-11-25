// EP07 2D layers in ISOCRAFT comic dress: paper cards with thick ink borders and hard offset
// shadows, Bangers headlines with ink stroke, Barlow Condensed UI text, yellow/coral/mint spots.
// All sizes are in 1080-wide units multiplied by k = width / 1080.
import React from "react";
import { ISOCRAFT_PALETTE as P } from "../../kits/isocraft/lib/palette.ts";

export const INK = P.inkBlack;
export const PAPER = "#FFFDF6";
export const BANG = "'Bangers'";
export const BC = "'Barlow Condensed'";
export const MONO = "'Courier New', monospace";
export { P };

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
export const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.25) => sm((t - a) / fi) * (1 - sm((t - (b - fo)) / fo));
export const typed = (text: string, t: number, a: number, b: number) => text.slice(0, Math.round(text.length * ramp(t, a, b)));
type Wd = { w: string; s: number; e: number };
/** Typewriter locked to spoken words: each word types in during its own VO span. */
export const typedWords = (words: Wd[], t: number) => {
  let out = "";
  for (const w of words) {
    if (t < w.s) break;
    const n = Math.max(1, Math.round(w.w.length * ramp(t, w.s, Math.min(w.e, w.s + 0.35))));
    out += (out ? " " : "") + w.w.slice(0, n);
  }
  return out;
};

export const inkBox = (k: number, bg = PAPER, sh = 10, bw = 5, r = 18): React.CSSProperties => ({
  background: bg,
  border: `${bw * k}px solid ${INK}`,
  borderRadius: r * k,
  boxShadow: `${sh * k}px ${sh * k}px 0 ${INK}`,
  boxSizing: "border-box",
});

export const Tag: React.FC<{ k: number; children: React.ReactNode; bg?: string; size?: number }> = ({ k, children, bg = P.accentYellow, size = 34 }) => (
  <div style={{ display: "inline-block", ...inkBox(k, bg, 6, 4, 10), padding: `${6 * k}px ${18 * k}px ${4 * k}px`, fontFamily: BC, fontWeight: 800, fontSize: size * k, letterSpacing: 3 * k, color: INK }}>{children}</div>
);

/** Comic headline block at the top-left (starts at y 262: AudiraSignature sits above). */
export const Headline: React.FC<{ k: number; t: number; a: number; b: number; kicker?: string; size?: number; children: React.ReactNode; kickerBg?: string }> = ({ k, t, a, b, kicker, size = 112, children, kickerBg }) => {
  if (t < a - 0.05 || t > b + 0.05) return null;
  const o = win(t, a, b, 0.22, 0.22);
  const pop = outBack(ramp(t, a, a + 0.4), 2);
  return (
    <div style={{ position: "absolute", left: 60 * k, right: 60 * k, top: 262 * k, opacity: o, transform: `translateX(${(1 - pop) * -80 * k}px)` }}>
      {kicker && <Tag k={k} bg={kickerBg}>{kicker}</Tag>}
      <div
        style={{
          fontFamily: BANG,
          fontSize: size * k,
          lineHeight: 0.98,
          marginTop: 16 * k,
          letterSpacing: 2 * k,
          color: "#FFFFFF",
          WebkitTextStroke: `${9 * k}px ${INK}`,
          paintOrder: "stroke fill",
          textShadow: `${7 * k}px ${7 * k}px 0 ${INK}`,
          transform: `skewX(-6deg) scale(${0.9 + 0.1 * pop})`,
          transformOrigin: "0% 50%",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Step header: big numbered disc + title card. */
export const StepHeader: React.FC<{ k: number; t: number; a: number; b: number; n: number; title: React.ReactNode; sub?: React.ReactNode }> = ({ k, t, a, b, n, title, sub }) => {
  if (t < a - 0.05 || t > b + 0.05) return null;
  const o = win(t, a, b, 0.2, 0.2);
  const pop = outBack(ramp(t, a, a + 0.38), 2.2);
  return (
    <div style={{ position: "absolute", left: 50 * k, top: 268 * k, display: "flex", alignItems: "center", gap: 18 * k, opacity: o }}>
      <div style={{ width: 150 * k, height: 150 * k, borderRadius: "50%", ...inkBox(k, P.accentYellow, 8, 6, 999), display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop}) rotate(${(1 - pop) * -40}deg)`, flex: "none" }}>
        <span style={{ fontFamily: BANG, fontSize: 112 * k, color: INK, marginTop: 8 * k }}>{n}</span>
      </div>
      <div style={{ ...inkBox(k, PAPER, 8, 5, 14), padding: `${12 * k}px ${24 * k}px`, transform: `translateX(${(1 - sm(ramp(t, a + 0.08, a + 0.4))) * -60 * k}px)`, maxWidth: 790 * k }}>
        <div style={{ fontFamily: BC, fontWeight: 800, fontSize: 54 * k, lineHeight: 1.0, color: INK }}>{title}</div>
        {sub && <div style={{ fontFamily: BC, fontWeight: 700, fontSize: 34 * k, lineHeight: 1.1, color: "#5b6168", marginTop: 4 * k }}>{sub}</div>}
      </div>
    </div>
  );
};

/** UI button in the stylised app (not a copy of any real product). */
export const Btn: React.FC<{ k: number; x: number; y: number; w: number; h: number; label: React.ReactNode; hot?: number; bg?: string; size?: number; dark?: boolean }> = ({ k, x, y, w, h, label, hot = 0, bg = "#FFFFFF", size = 32, dark }) => (
  <div
    style={{
      position: "absolute",
      left: x * k,
      top: y * k,
      width: w * k,
      height: h * k,
      borderRadius: (h / 2) * k,
      border: `${4 * k}px solid ${INK}`,
      background: hot > 0.5 ? P.accentYellow : bg,
      boxShadow: `${(hot > 0.5 ? 2 : 5) * k}px ${(hot > 0.5 ? 2 : 5) * k}px 0 ${INK}`,
      transform: `translate(${(hot > 0.5 ? 3 : 0) * k}px, ${(hot > 0.5 ? 3 : 0) * k}px)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: BC,
      fontWeight: 800,
      fontSize: size * k,
      color: dark ? "#FFFFFF" : INK,
      boxSizing: "border-box",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </div>
);

/** Comic arrow cursor with a click burst. Coordinates are local to the parent panel. */
export const Cursor: React.FC<{ k: number; x: number; y: number; press: number; ripple: number }> = ({ k, x, y, press, ripple }) => (
  <div style={{ position: "absolute", left: x * k, top: y * k, width: 0, height: 0, pointerEvents: "none" }}>
    {ripple > 0 && ripple < 1 && (
      <svg width={160 * k} height={160 * k} viewBox="-80 -80 160 160" style={{ position: "absolute", left: -80 * k, top: -80 * k, overflow: "visible" }}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const r0 = 26 + ripple * 30, r1 = r0 + 18 * (1 - ripple);
          return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} stroke={INK} strokeWidth={7} strokeLinecap="round" opacity={1 - ripple} />;
        })}
        <circle r={20 + ripple * 34} fill="none" stroke={P.accentYellow} strokeWidth={8} opacity={1 - ripple} />
      </svg>
    )}
    <svg width={74 * k} height={92 * k} viewBox="0 0 74 92" style={{ position: "absolute", left: -6 * k, top: -4 * k, transform: `scale(${1 - press * 0.16})`, transformOrigin: "6px 4px", overflow: "visible", filter: `drop-shadow(${5 * k}px ${5 * k}px 0 ${INK})` }}>
      <path d="M6 4 L6 72 L22 58 L34 86 L48 80 L36 53 L58 52 Z" fill="#FFFFFF" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </svg>
  </div>
);

export type Tap = { t: number; x: number; y: number; click?: boolean };
/** Cursor state along a tap list: travels during the 0.5 s before each tap, then clicks. */
export const cursorAt = (taps: Tap[], t: number) => {
  let i = 0;
  while (i < taps.length - 1 && t >= taps[i + 1].t) i++;
  const a = taps[i], b = taps[Math.min(i + 1, taps.length - 1)];
  const kk = b === a ? 0 : sm(ramp(t, b.t - 0.5, b.t - 0.04));
  const x = a.x + (b.x - a.x) * kk + Math.sin(t * 2.1) * 3;
  const y = a.y + (b.y - a.y) * kk + Math.cos(t * 1.7) * 3;
  let press = 0, ripple = 0;
  for (const tp of taps) {
    if (tp.click === false) continue;
    const d = t - tp.t;
    if (d > -0.12 && d < 0.2) press = Math.max(press, 1 - Math.abs(d - 0.03) / 0.16);
    if (d >= 0 && d < 0.5) ripple = d / 0.5;
  }
  return { x, y, press: Math.max(0, press), ripple };
};
/** Highlight that lights at a tap and fades 0.7 s later. */
export const hotAt = (t: number, at: number, hold = 0.6) => (t >= at - 0.08 ? Math.max(0, 1 - Math.max(0, t - at - hold) / 0.3) : 0);

/** Warning card (comic caution panel). */
export const WarnCard: React.FC<{ k: number; t: number; a: number; b: number; kicker: string; children: React.ReactNode; y?: number }> = ({ k, t, a, b, kicker, children, y = 270 }) => {
  if (t < a - 0.05 || t > b + 0.05) return null;
  const o = win(t, a, b, 0.2, 0.25);
  const pop = outBack(ramp(t, a, a + 0.4), 2);
  const shake = t - a < 0.5 ? Math.sin((t - a) * 60) * (1 - (t - a) / 0.5) * 5 : 0;
  return (
    <div style={{ position: "absolute", left: 60 * k, right: 60 * k, top: y * k, opacity: o, transform: `scale(${0.85 + 0.15 * pop}) rotate(${-1.2 + shake * 0.2}deg)`, transformOrigin: "50% 0%" }}>
      <div style={{ ...inkBox(k, PAPER, 12, 6, 20), overflow: "hidden" }}>
        <div style={{ background: `repeating-linear-gradient(-45deg, ${P.accentYellow} 0 ${26 * k}px, ${INK} ${26 * k}px ${52 * k}px)`, height: 22 * k, borderBottom: `${5 * k}px solid ${INK}` }} />
        <div style={{ display: "flex", alignItems: "center", gap: 24 * k, padding: `${22 * k}px ${28 * k}px ${26 * k}px` }}>
          <svg width={120 * k} height={108 * k} viewBox="0 0 120 108" style={{ flex: "none" }}>
            <path d="M60 6 L114 100 L6 100 Z" fill={P.bodyCoral} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
            <rect x={54} y={36} width={12} height={38} rx={5} fill="#FFFFFF" />
            <circle cx={60} cy={86} r={7} fill="#FFFFFF" />
          </svg>
          <div>
            <div style={{ fontFamily: BC, fontWeight: 800, fontSize: 34 * k, letterSpacing: 3 * k, color: P.bodyCoral }}>{kicker}</div>
            <div style={{ fontFamily: BC, fontWeight: 800, fontSize: 58 * k, lineHeight: 1.02, color: INK }}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
