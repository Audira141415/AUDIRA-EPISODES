// EP11 HUD on the 1080 × 1920 overlay. Chips/stamps/cards sit between y 236 and ~1240 (above the karaoke band at
// 1290–1540) and above the subject; labels ≥ 34 px; stamps ≤ 860 px wide, no rotation in action shots.
import React from "react";
import { F_LABEL, F_STAMP } from "./chronicle/fonts.ts";
import { AMBER, IVORY } from "./chronicle/Overlay.tsx";
import { clamp, pop, win } from "./timing.ts";

const INKBG = "#120d0b";

/** Small solid chip (label ≥ 40 px). */
export const Chip: React.FC<{ t: number; a: number; b: number; text: string; color?: string; y: number; dark?: boolean }> = ({ t, a, b, text, color = AMBER, y, dark = true }) => {
  const v = win(t, a, b, 0.2, 0.3);
  if (v <= 0) return null;
  const s = pop(t, a);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: v }}>
      <span style={{ display: "inline-block", maxWidth: 860, fontFamily: F_LABEL, fontWeight: 800, fontSize: 48, letterSpacing: 4, color: dark ? INKBG : IVORY, background: dark ? color : "rgba(18,13,11,0.72)", border: dark ? "none" : `3px solid ${color}`, padding: "10px 28px 8px", boxShadow: "0 8px 30px rgba(0,0,0,0.45)", transform: `scale(${s || 1})` }}>{text}</span>
    </div>
  );
};

/** Big stamp word(s), Anton, crimson rule; width ≤ 860. */
export const Stamp: React.FC<{ t: number; a: number; b: number; text: string; sub?: string; color?: string; y: number; size?: number }> = ({ t, a, b, text, sub, color = IVORY, y, size = 128 }) => {
  const v = win(t, a, b, 0.15, 0.3);
  if (v <= 0) return null;
  const k = clamp((t - a) / 0.22);
  const sc = 1.35 - 0.35 * (1 - Math.pow(1 - k, 3));
  return (
    <div style={{ position: "absolute", left: 110, right: 110, top: y, textAlign: "center", opacity: v }}>
      <div style={{ fontFamily: F_STAMP, fontSize: size, lineHeight: 1, color, letterSpacing: 2, textShadow: "0 8px 34px rgba(0,0,0,0.6)", transform: `scale(${sc})` }}>{text}</div>
      {sub && <div style={{ fontFamily: F_LABEL, fontWeight: 700, fontSize: 48, letterSpacing: 6, color: IVORY, opacity: 0.9, marginTop: 10, textShadow: "0 2px 14px rgba(0,0,0,0.6)" }}>{sub}</div>}
    </div>
  );
};

/** Label + big value (a time, a ratio, a score) that lands with a pop. */
export const BigValue: React.FC<{ t: number; a: number; b: number; label: string; value: string; color?: string; y: number; note?: string; size?: number }> = ({ t, a, b, label, value, color = IVORY, y, note, size = 190 }) => {
  const v = win(t, a, b, 0.25, 0.3);
  if (v <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: v }}>
      <div style={{ fontFamily: F_LABEL, fontWeight: 800, fontSize: 46, letterSpacing: 8, color: IVORY, opacity: 0.88, textShadow: "0 2px 14px rgba(0,0,0,0.6)" }}>{label}</div>
      <div style={{ fontFamily: F_STAMP, fontSize: size, lineHeight: 1, color, letterSpacing: 3, textShadow: "0 8px 34px rgba(0,0,0,0.55)", transform: `scale(${pop(t, a) || 1})` }}>{value}</div>
      {note && <div style={{ fontFamily: F_LABEL, fontWeight: 700, fontSize: 58, color: IVORY, opacity: 0.85, marginTop: 4, textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>{note}</div>}
    </div>
  );
};

/** Round tag, top-left inside the safe zone. */
export const RoundTag: React.FC<{ t: number; a: number; b: number; text: string; y?: number }> = ({ t, a, b, text, y = 250 }) => {
  const v = win(t, a, b, 0.2, 0.25);
  if (v <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 70, top: y, opacity: v, fontFamily: F_LABEL, fontWeight: 800, fontSize: 54, letterSpacing: 6, color: INKBG, background: IVORY, padding: "6px 22px 4px", boxShadow: "0 6px 24px rgba(0,0,0,0.5)" }}>
      {text}
    </div>
  );
};

/** Full-frame flash (white for floodlights, crimson for the cut eye). */
export const Flash: React.FC<{ t: number; at: number; color?: string; dur?: number; max?: number }> = ({ t, at, color = "#fff6e6", dur = 0.35, max = 0.85 }) => {
  const k = (t - at) / dur;
  if (k < 0 || k > 1) return null;
  return <div style={{ position: "absolute", inset: 0, background: color, opacity: max * Math.pow(1 - k, 2), mixBlendMode: "screen" }} />;
};

/** Ink dip at a cut: black in over 0.1 s before, out over 0.16 s after. */
export const InkCut: React.FC<{ t: number; cuts: number[] }> = ({ t, cuts }) => {
  let o = 0;
  for (const c of cuts) {
    if (t >= c - 0.1 && t < c) o = Math.max(o, (t - (c - 0.1)) / 0.1);
    if (t >= c && t < c + 0.16) o = Math.max(o, 1 - (t - c) / 0.16);
  }
  if (o <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, background: "#050302", opacity: o * 0.9 }} />;
};

// ---------------------------------------------------------------- foreground layer: soft black grass or spectators under the caption
const rnd = (i: number) => { const x = Math.sin(i * 127.1) * 43758.5; return x - Math.floor(x); };
export const NearLayer: React.FC<{ t: number; kind?: "grass" | "crowd" }> = ({ t, kind }) => {
  if (!kind) return null;
  const dx = -26 * t;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, filter: "blur(3px)" }}>
      <g transform={`translate(${dx} 0)`} fill="#0b0706">
        {kind === "grass" && Array.from({ length: 150 }, (_, i) => {
          const x = -80 + i * 12 + rnd(i) * 10, edge = Math.abs((x + dx - 540) / 540), h = 60 + 110 * rnd(i + 3) + 150 * Math.min(1, edge * edge);
          const sway = 10 * Math.sin(t * 1.7 + i * 0.4) + 34 * (rnd(i + 9) - 0.5);
          return <path key={i} d={`M${x - 9} 1930 Q${x - 4} ${1930 - h * 0.6} ${x + sway} ${1930 - h} Q${x + 8} ${1930 - h * 0.55} ${x + 10} 1930 Z`} />;
        })}
        {kind === "crowd" && Array.from({ length: 12 }, (_, i) => {
          const x = -60 + i * 150 + rnd(i) * 50, bob = 7 * Math.sin(t * 2.6 + i * 1.9), y = 1752 + 70 * rnd(i + 5) + bob - 60 * Math.min(1, Math.abs((x + dx - 540) / 620));
          return <g key={i}><ellipse cx={x} cy={y} rx={44} ry={54} /><path d={`M${x - 108} 1930 Q${x - 104} ${y + 72} ${x - 36} ${y + 58} L${x + 36} ${y + 58} Q${x + 104} ${y + 72} ${x + 108} 1930 Z`} />{rnd(i + 21) > 0.5 && <path d={`M${x - 62} ${y - 22} L${x + 62} ${y - 22} L${x + 62} ${y - 34} L${x + 38} ${y - 36} L${x + 34} ${y - 74} L${x - 34} ${y - 74} L${x - 38} ${y - 36} L${x - 62} ${y - 34} Z`} />}</g>;
        })}
      </g>
    </svg>
  );
};
