// EP03 film overlays (timed, BROADCASTFORGE language). Each takes the film clock `t` and a window [a, b).
// Labels ≥ 36 px; everything inside y 236…1540.
import React from "react";
import { B } from "./palette.ts";
import { DISPLAY } from "./fonts.ts";

const font = (size: number, weight = 800): React.CSSProperties => ({ fontFamily: `${DISPLAY}, Manrope, sans-serif`, fontWeight: weight, fontSize: size, lineHeight: 1 });
const cl = (v: number) => Math.min(1, Math.max(0, v));
const sm = (k: number) => {
  const x = cl(k);
  return x * x * (3 - 2 * x);
};
/** Pop-in after a (small overshoot), fade before b. */
const popK = (t: number, a: number, b: number) => {
  if (t < a || t > b) return { o: 0, s: 0.9 };
  const i = cl((t - a) / 0.22);
  const back = 1 + 2.2 * (i - 1) ** 3 + 1.2 * (i - 1) ** 2;
  const out = sm((b - t) / 0.18);
  return { o: Math.min(i * 1.6, out, 1), s: (0.86 + 0.14 * back) * (0.96 + 0.04 * out) };
};
type Tone = "red" | "cyan" | "amber";
const GLASS = "linear-gradient(160deg, rgba(34,46,66,0.86) 0%, rgba(10,16,26,0.90) 55%, rgba(6,10,18,0.94) 100%)";
const accentOf = (tone: Tone) => (tone === "red" ? B.breakingRed : tone === "amber" ? B.liveAmber : B.cyan);

/** Kinetic data callout: kicker + big value + optional sub line. */
export const Callout: React.FC<{ t: number; a: number; b: number; top: number; kicker?: string; value: string; sub?: string; size?: number; tone?: Tone; align?: "center" | "left" | "right" }> = ({ t, a, b, top, kicker, value, sub, size = 120, tone = "cyan", align = "center" }) => {
  const { o, s } = popK(t, a, b);
  if (o <= 0) return null;
  const accent = accentOf(tone);
  const pos: React.CSSProperties = align === "center" ? { left: 0, right: 0, textAlign: "center" } : align === "left" ? { left: 60 } : { right: 60, textAlign: "right" };
  return (
    <div style={{ position: "absolute", top, ...pos, opacity: o, transform: `scale(${s})`, transformOrigin: align === "center" ? "50% 0" : align === "left" ? "0 0" : "100% 0" }}>
      <div style={{ display: "inline-block", background: GLASS, backdropFilter: "blur(14px) saturate(1.3)", padding: "18px 34px 22px", borderLeft: `10px solid ${accent}`, border: "1px solid rgba(255,255,255,0.16)", borderLeftWidth: 10, borderLeftColor: accent, boxShadow: `0 16px 40px rgba(0,0,0,0.55), 0 0 28px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.22)`, textAlign: "left" }}>
        {kicker ? <div style={{ color: accent, letterSpacing: "0.1em", ...font(40, 600) }}>{kicker}</div> : null}
        <div style={{ color: B.white, marginTop: kicker ? 10 : 0, fontVariantNumeric: "tabular-nums", ...font(size) }}>{value}</div>
        {sub ? <div style={{ color: B.ticker, marginTop: 12, letterSpacing: "0.03em", ...font(42, 600) }}>{sub}</div> : null}
      </div>
    </div>
  );
};

/** Small broadcast chip. */
export const Chip: React.FC<{ t: number; a: number; b: number; top: number; left?: number; right?: number; text: string; tone?: Tone | "navy" }> = ({ t, a, b, top, left, right, text, tone = "navy" }) => {
  const { o, s } = popK(t, a, b);
  if (o <= 0) return null;
  const bg = tone === "navy" ? B.broadcastNavy : tone === "cyan" ? "#00869b" : accentOf(tone);
  return (
    <div style={{ position: "absolute", top, left, right, opacity: o, transform: `scale(${s})`, transformOrigin: left !== undefined ? "0 50%" : "100% 50%", background: bg, color: tone === "amber" ? "#111" : B.white, padding: "12px 24px", letterSpacing: "0.06em", boxShadow: "0 10px 28px rgba(0,0,0,0.5)", borderLeft: tone === "navy" ? `8px solid ${B.cyan}` : undefined, ...font(42, 800) }}>
      {text}
    </div>
  );
};

/** Rubber stamp, slammed beside the subject (never over it). */
export const Stamp: React.FC<{ t: number; a: number; b: number; top: number; left?: number; right?: number; text: string; rot?: number; size?: number }> = ({ t, a, b, top, left, right, text, rot = -6, size = 74 }) => {
  if (t < a || t > b) return null;
  const k = cl((t - a) / 0.16);
  const sc = 1.6 - 0.6 * sm(k);
  const o = Math.min(k * 2, sm((b - t) / 0.18));
  return (
    <div style={{ position: "absolute", top, left, right, opacity: o, transform: `rotate(${rot}deg) scale(${sc})`, border: `8px solid ${B.breakingRed}`, color: B.breakingRed, background: "rgba(10,12,16,0.78)", padding: "8px 22px", letterSpacing: "0.06em", whiteSpace: "nowrap", ...font(size) }}>
      {text}
    </div>
  );
};

/** Count-up ace counter. */
export const Counter: React.FC<{ t: number; a: number; b: number; dur?: number; to: number; top: number; left?: number; right?: number; label: string; dim?: boolean }> = ({ t, a, b, dur = 0.7, to, top, left, right, label, dim }) => {
  const { o, s } = popK(t, a, b);
  if (o <= 0) return null;
  const n = Math.round(to * sm((t - a) / dur));
  return (
    <div style={{ position: "absolute", top, left, right, opacity: o * (dim ? 0.8 : 1), transform: `scale(${s})`, transformOrigin: left !== undefined ? "0 0" : "100% 0", background: GLASS, backdropFilter: "blur(14px)", padding: "16px 30px", borderTop: `8px solid ${dim ? "rgba(236,239,244,0.5)" : B.cyan}`, boxShadow: "0 16px 40px rgba(0,0,0,0.55)" }}>
      <div style={{ color: dim ? B.ticker : B.cyan, letterSpacing: "0.08em", ...font(40, 600) }}>{label}</div>
      <div style={{ color: B.white, fontVariantNumeric: "tabular-nums", textShadow: dim ? "none" : `0 0 30px ${B.cyan}`, ...font(dim ? 120 : 168) }}>{n}</div>
      <div style={{ color: B.ticker, opacity: 0.85, letterSpacing: "0.1em", ...font(36, 600) }}>ACE</div>
    </div>
  );
};

/** Points split bar. */
export const SplitBar: React.FC<{ t: number; a: number; b: number; top: number; rows: { name: string; value: number; color: string }[] }> = ({ t, a, b, top, rows }) => {
  const { o } = popK(t, a, b);
  if (o <= 0) return null;
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <div style={{ position: "absolute", top, left: 60, right: 60, opacity: o, background: GLASS, backdropFilter: "blur(14px)", padding: "22px 28px", boxShadow: `0 16px 40px rgba(0,0,0,0.55), 0 0 26px ${B.liveAmber}44, inset 0 1px 0 rgba(255,255,255,0.2)`, borderTop: `6px solid ${B.liveAmber}` }}>
      <div style={{ color: B.liveAmber, letterSpacing: "0.1em", marginBottom: 16, ...font(40, 600) }}>TOTAL POIN DIMENANGKAN</div>
      {rows.map((r, i) => {
        const k = sm((t - a - i * 0.35) / 0.8);
        return (
          <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 18, marginTop: i ? 14 : 0 }}>
            <div style={{ width: 190, color: B.white, ...font(50, 800) }}>{r.name}</div>
            <div style={{ flex: 1, height: 58, background: "rgba(255,255,255,0.06)", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(r.value / max) * 100 * k}%`, background: r.color }} />
            </div>
            <div style={{ width: 130, textAlign: "right", color: B.white, fontVariantNumeric: "tabular-nums", ...font(62, 800) }}>{Math.round(r.value * k)}</div>
          </div>
        );
      })}
    </div>
  );
};

/** Next-episode teaser. */
export const Teaser: React.FC<{ t: number; a: number; b: number; top: number; ep: string; title: string }> = ({ t, a, b, top, ep, title }) => {
  const { o, s } = popK(t, a, b);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o, transform: `scale(${s})` }}>
      <div style={{ display: "flex", alignItems: "stretch", boxShadow: "0 16px 40px rgba(0,0,0,0.55)" }}>
        <div style={{ background: B.breakingRed, color: B.white, padding: "16px 26px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, ...font(52) }}>
          <span style={{ ...font(36, 600), opacity: 0.9 }}>BERIKUTNYA</span>
          {ep}
        </div>
        <div style={{ background: B.plate, color: B.white, padding: "16px 30px", display: "flex", alignItems: "center", borderBottom: `6px solid ${B.cyan}`, ...font(66) }}>{title}</div>
      </div>
    </div>
  );
};

/** Broadcast stinger at each cut: red + cyan bars sweep across. */
export const Stinger: React.FC<{ t: number; cuts: number[] }> = ({ t, cuts }) => {
  const c = cuts.find((x) => t >= x - 0.18 && t < x + 0.22);
  if (c === undefined) return null;
  const k = (t - (c - 0.18)) / 0.4;
  const x = -1400 + k * 2800;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: -300, bottom: -300, left: x, width: 520, background: B.breakingRed, transform: "skewX(-14deg)", opacity: 0.95 }} />
      <div style={{ position: "absolute", top: -300, bottom: -300, left: x + 540, width: 90, background: B.cyan, transform: "skewX(-14deg)", opacity: 0.9 }} />
    </div>
  );
};

/** White flash on impact. */
export const Flash: React.FC<{ t: number; at: number; dur?: number; max?: number }> = ({ t, at, dur = 0.35, max = 0.8 }) => {
  if (t < at || t > at + dur) return null;
  return <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: max * (1 - (t - at) / dur) }} />;
};

export type CapWord = { w: string; t: number; e: number; key?: boolean };
/** Karaoke captions at y 1300: ≤ 4 words per chunk, word gap 0.42 em, active bounce ≤ 1.04. */
export const Captions: React.FC<{ t: number; words: CapWord[]; end: number }> = ({ t, words, end }) => {
  if (t > end || t < words[0].t - 0.1) return null;
  const chunks: CapWord[][] = [];
  let cur: CapWord[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= 4 || /[.,?!:]$/.test(w.w)) {
      chunks.push(cur);
      cur = [];
    }
  }
  if (cur.length) chunks.push(cur);
  const ci = chunks.findIndex((c, i) => t >= c[0].t - 0.05 && (i === chunks.length - 1 || t < chunks[i + 1][0].t - 0.05));
  if (ci < 0) return null;
  return (
    <div style={{ position: "absolute", top: 1300, left: 60, right: 60, display: "flex", justifyContent: "center", flexWrap: "wrap", columnGap: "0.42em", textAlign: "center", ...font(80, 800), lineHeight: 1.1 }}>
      {chunks[ci].map((w, i) => {
        const on = t >= w.t;
        const active = on && t < w.e + 0.05;
        const b = active ? 1 + 0.04 * Math.sin(cl((t - w.t) / 0.18) * Math.PI) : 1;
        return (
          <span key={i} style={{ display: "inline-block", transform: `scale(${b})`, color: on ? (w.key ? B.cyan : B.white) : "rgba(214,222,232,0.82)", WebkitTextStroke: "3px rgba(5,8,12,0.95)", textShadow: "0 5px 0 rgba(5,8,12,0.85), 0 10px 24px rgba(0,0,0,0.6)" }}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};
