// EP05 HUD on the 1080 × 1920 overlay. Chips/stamps/cards sit between y 236 and ~1240 (above the karaoke band at
// 1290–1540) and above the subject; labels ≥ 34 px; stamps ≤ 860 px wide, no rotation in action shots.
import React from "react";
import { F_CAPTION, F_LABEL, F_STAMP } from "./chronicle/fonts.ts";
import { AMBER, CRIMSON, DIM, IVORY } from "./chronicle/Overlay.tsx";
import { clamp, pop, seg, win } from "./timing.ts";

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

/** Foreman's record: 40–0 · 37 KO, then a crack turns it into 40–1. */
export const Record: React.FC<{ t: number; a: number; crack: number; b: number; y: number }> = ({ t, a, crack, b, y }) => {
  const v = win(t, a, b, 0.25, 0.3);
  if (v <= 0) return null;
  const c = seg(t, crack, crack + 0.3);
  const shake = t > crack && t < crack + 0.35 ? Math.sin(t * 90) * 10 * (1 - (t - crack) / 0.35) : 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: v, transform: `translateX(${shake}px)` }}>
      <div style={{ fontFamily: F_LABEL, fontWeight: 800, fontSize: 44, letterSpacing: 8, color: IVORY, opacity: 0.9 }}>GEORGE FOREMAN · REKOR</div>
      <div style={{ position: "relative", display: "inline-block", fontFamily: F_STAMP, fontSize: 230, lineHeight: 1, color: c > 0.5 ? CRIMSON : IVORY, letterSpacing: 4, textShadow: "0 8px 34px rgba(0,0,0,0.6)" }}>
        {c > 0.5 ? "40–1" : "40–0"}
        {c > 0 && (
          <svg width={520} height={240} style={{ position: "absolute", left: "50%", top: 0, marginLeft: -260, opacity: c }}>
            <path d="M250 0 L232 70 L268 104 L226 160 L256 240" stroke={IVORY} strokeWidth={7} fill="none" />
            <path d="M268 104 L330 120 M232 70 L170 60" stroke={IVORY} strokeWidth={4} fill="none" />
          </svg>
        )}
      </div>
      <div style={{ fontFamily: F_LABEL, fontWeight: 800, fontSize: 52, letterSpacing: 6, color: AMBER, marginTop: 4, opacity: seg(t, a + 0.4, a + 0.8) }}>
        {c > 0.5 ? "KALAH PERTAMA" : "37 KO · BELUM PERNAH KALAH"}
      </div>
    </div>
  );
};

/** Wall calendar: 25 SEP crossed out, flips to 30 OKT. */
export const Calendar: React.FC<{ t: number; a: number; flip: number; b: number; y: number }> = ({ t, a, flip, b, y }) => {
  const v = win(t, a, b, 0.25, 0.3);
  if (v <= 0) return null;
  const x = seg(t, a + 0.35, a + 0.7);
  const f = seg(t, flip, flip + 0.35);
  const Page: React.FC<{ d: string; m: string; crossed?: number; color?: string }> = ({ d, m, crossed = 0, color = INKBG }) => (
    <div style={{ position: "relative", width: 300, background: "#efe4cf", boxShadow: "0 12px 40px rgba(0,0,0,0.55)", textAlign: "center" }}>
      <div style={{ background: CRIMSON, color: IVORY, fontFamily: F_LABEL, fontWeight: 800, fontSize: 52, letterSpacing: 6, padding: "6px 0" }}>{m} 1974</div>
      <div style={{ fontFamily: F_STAMP, fontSize: 170, lineHeight: 1.05, color }}>{d}</div>
      {crossed > 0 && (
        <svg width={300} height={250} style={{ position: "absolute", left: 0, top: 50 }}>
          <path d={`M30 30 L${30 + 240 * crossed} ${30 + 180 * crossed}`} stroke={CRIMSON} strokeWidth={14} strokeLinecap="round" />
          <path d={`M270 30 L${270 - 240 * crossed} ${30 + 180 * crossed}`} stroke={CRIMSON} strokeWidth={14} strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", alignItems: "center", gap: 40, opacity: v }}>
      <div style={{ transform: `scale(${1 - 0.18 * f})`, opacity: 1 - 0.4 * f }}><Page d="25" m="SEP" crossed={x} /></div>
      <div style={{ fontFamily: F_STAMP, fontSize: 110, color: IVORY, opacity: f }}>→</div>
      <div style={{ opacity: f, transform: `translateX(${(1 - f) * 60}px)` }}><Page d="30" m="OKT" /></div>
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

/** Foreman's energy bar draining (0..1), with the round tag in the same header row; `bar` fades the meter in. */
export const EnergyBar: React.FC<{ t: number; a: number; b: number; level: number; y?: number; tag?: string; bar?: number }> = ({ t, a, b, level, y = 360, tag, bar = 1 }) => {
  const v = win(t, a, b, 0.25, 0.3);
  if (v <= 0) return null;
  const L = clamp(level);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: y, opacity: v }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, fontFamily: F_LABEL, fontWeight: 800, fontSize: 56, letterSpacing: 4, color: IVORY, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}>
        {tag && <span style={{ color: INKBG, background: IVORY, padding: "4px 18px 2px", textShadow: "none", boxShadow: "0 6px 24px rgba(0,0,0,0.5)" }}>{tag}</span>}
        <span style={{ opacity: bar }}>TENAGA FOREMAN</span>
        <span style={{ marginLeft: "auto", opacity: bar, color: L < 0.35 ? CRIMSON : IVORY }}>{Math.round(L * 100)}%</span>
      </div>
      <div style={{ height: 30, marginTop: 12, opacity: bar, background: "rgba(18,13,11,0.7)", border: `3px solid ${IVORY}` }}>
        <div style={{ width: `${L * 100}%`, height: "100%", background: L < 0.35 ? CRIMSON : "#ff7a5c" }} />
      </div>
    </div>
  );
};

/** Referee count 1..10, one number per beat between a and b. */
export const Count: React.FC<{ t: number; a: number; b: number; end: number; y: number }> = ({ t, a, b, end, y }) => {
  if (t < a || t > end) return null;
  const step = (b - a) / 9;
  const i = Math.min(9, Math.floor((t - a) / step));
  const local = t - (a + i * step);
  const s = 1.25 - 0.25 * clamp(local / 0.18);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: win(t, a, end, 0.1, 0.3) }}>
      <div style={{ fontFamily: F_LABEL, fontWeight: 800, fontSize: 46, letterSpacing: 8, color: IVORY, opacity: 0.85 }}>HITUNGAN WASIT</div>
      <div style={{ fontFamily: F_STAMP, fontSize: 210, lineHeight: 1, color: i === 9 ? AMBER : IVORY, transform: `scale(${s})`, textShadow: "0 8px 34px rgba(0,0,0,0.6)" }}>{i + 1}</div>
    </div>
  );
};

/** Final score card with the AUDIRA header. */
export const ScoreCard: React.FC<{ t: number; a: number; b: number; y: number }> = ({ t, a, b, y }) => {
  const v = win(t, a, b, 0.35, 0.35);
  if (v <= 0) return null;
  const row = (label: string, value: string, k: number, color = IVORY) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 34px", borderTop: "2px solid rgba(244,234,216,0.18)", opacity: seg(t, a + k, a + k + 0.3) }}>
      <span style={{ fontFamily: F_LABEL, fontWeight: 700, fontSize: 46, letterSpacing: 4, color: DIM }}>{label}</span>
      <span style={{ fontFamily: F_LABEL, fontWeight: 800, fontSize: 46, letterSpacing: 3, color }}>{value}</span>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 110, right: 110, top: y, opacity: v, background: "rgba(18,13,11,0.82)", boxShadow: "0 18px 60px rgba(0,0,0,0.55)", border: `3px solid ${AMBER}` }}>
      <div style={{ background: AMBER, color: INKBG, fontFamily: F_STAMP, fontSize: 64, letterSpacing: 6, textAlign: "center", padding: "10px 0 4px" }}>AUDIRA · FAKTA OLAHRAGA</div>
      <div style={{ fontFamily: F_LABEL, fontWeight: 800, fontSize: 44, letterSpacing: 6, color: IVORY, textAlign: "center", padding: "18px 0 8px" }}>30 OKT 1974 · KINSHASA</div>
      {row("PEMENANG", "MUHAMMAD ALI", 0.2, AMBER)}
      {row("HASIL", "KO · RONDE 8", 0.4)}
      {row("WAKTU", "2:58", 0.6)}
      {row("GELAR", "JUARA DUNIA LAGI", 0.8, AMBER)}
    </div>
  );
};

/** Teaser card for the next episode. */
export const Teaser: React.FC<{ t: number; a: number; b: number; y: number }> = ({ t, a, b, y }) => {
  const v = win(t, a, b, 0.3, 0.3);
  if (v <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: y, textAlign: "center", opacity: v, transform: `translateY(${(1 - seg(t, a, a + 0.4)) * 30}px)`, background: "rgba(18,13,11,0.78)", border: `3px solid ${AMBER}`, padding: "26px 0 30px", boxShadow: "0 18px 60px rgba(0,0,0,0.5)" }}>
      <div style={{ fontFamily: F_LABEL, fontWeight: 800, fontSize: 46, letterSpacing: 10, color: AMBER }}>EPISODE BERIKUTNYA</div>
      <div style={{ fontFamily: F_STAMP, fontSize: 104, lineHeight: 1.02, color: IVORY, marginTop: 6, textShadow: "0 8px 30px rgba(0,0,0,0.6)" }}>FAKTA OLAHRAGA<br />LEBIH GILA LAGI</div>
      <div style={{ fontFamily: F_CAPTION, fontWeight: 700, fontSize: 44, color: IVORY, opacity: 0.85, marginTop: 12 }}>@AudiraSportFacts</div>
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

/** Crimson edge pulse (the cut eye). */
export const RedPulse: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const k = (t - at) / 0.7;
  if (k < 0 || k > 1) return null;
  return <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 260px 60px rgba(216,67,47,${0.75 * (1 - k)})` }} />;
};
