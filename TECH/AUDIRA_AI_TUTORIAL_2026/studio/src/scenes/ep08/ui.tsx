// EP08 2D layers in TOONFORGE dress: thick ink outlines, hard offset shadows, Bangers headlines,
// a generic cel-shaded phone UI (no real logos), a toon pointing finger, manga speed lines,
// comic speech bubbles with waveforms, warning panels and karaoke captions.
import React from "react";
import { loadFont as loadBangers } from "@remotion/google-fonts/Bangers";
import { loadFont as loadDela } from "@remotion/google-fonts/DelaGothicOne";
import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";
import { TOON_PALETTE as TP } from "../../kits/toonforge/lib/palette.ts";
import { hash } from "../../kits/toonforge/core/noise.ts";
import TL from "./timeline.json";

export const bangers = loadBangers("normal", { weights: ["400"], subsets: ["latin"] });
export const dela = loadDela("normal", { weights: ["400"], subsets: ["latin"] });
export const nunito = loadNunito("normal", { weights: ["800", "900"], subsets: ["latin"] });
export const BANG = bangers.fontFamily;
export const DELA = dela.fontFamily;
export const NUN = nunito.fontFamily;

export const INK = TP.inkOutline;
export const CYAN = "#3ff0ff";
export const YEL = "#ffd23f";
export const PINK = TP.sakuraPink;
export const RED = TP.crimsonImpact;
export const ORANGE = "#ff9f1c";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const sm = (x: number) => x * x * (3 - 2 * x);
export const outBack = (x: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
/** fade in over [a,a+i], out over [b-o,b] */
export const win = (t: number, a: number, b: number, i = 0.25, o = 0.25) => Math.min(sm(ramp(t, a, a + i)), 1 - sm(ramp(t, b - o, b)));

export const stroke = (w: number, c = INK) => ({ WebkitTextStroke: `${w}px ${c}`, paintOrder: "stroke fill" }) as React.CSSProperties;

// ---------------------------------------------------------------------------------------------
/** Manga concentration lines; `o` opacity, (cx, cy) focus in 1080-space. */
export const SpeedLines: React.FC<{ f: number; o: number; cx?: number; cy?: number; inner?: number; color?: string }> = ({ f, o, cx = 540, cy = 960, inner = 520, color = "#ffffff" }) => {
  if (o <= 0.01) return null;
  const step = Math.floor(f / 4);
  const wedges = [];
  for (let i = 0; i < 130; i++) {
    const a = (i / 130) * Math.PI * 2 + (hash(i * 3.1 + step) - 0.5) * 0.03;
    const r1 = inner + hash(i * 7.7 + step) * 380;
    const r2 = 1700;
    const wdt = 0.004 + hash(i * 1.9) * 0.01;
    const p = (r: number, da: number) => `${cx + Math.cos(a + da) * r},${cy + Math.sin(a + da) * r}`;
    wedges.push(<polygon key={i} points={`${p(r1, 0)} ${p(r2, wdt)} ${p(r2, -wdt)}`} />);
  }
  return (
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
      <g fill={color} opacity={0.62 * o}>{wedges}</g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
/** Headline block (top-left, y >= 262). */
export const Headline: React.FC<{ k: number; o: number; kicker?: string; lines: string[]; sub?: string; color?: string; tilt?: number }> = ({ k, o, kicker, lines, sub, color = "#fff", tilt = -3 }) => {
  if (o <= 0.01) return null;
  const pop = outBack(clamp01(o));
  return (
    <div style={{ position: "absolute", left: 64 * k, right: 48 * k, top: 262 * k, opacity: clamp01(o * 1.4), transformOrigin: "left top", transform: `translateX(${(1 - pop) * -60 * k}px)` }}>
      {kicker && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12 * k, background: INK, color: "#fff", fontFamily: DELA, fontSize: 30 * k, letterSpacing: 5 * k, padding: `${8 * k}px ${20 * k}px ${10 * k}px`, borderBottom: `${6 * k}px solid ${RED}`, transform: "skewX(-8deg)" }}>
          <span style={{ width: 14 * k, height: 14 * k, borderRadius: 7 * k, background: CYAN, display: "inline-block" }} />
          {kicker}
        </div>
      )}
      <div style={{ transform: `rotate(${tilt}deg) skewX(-6deg)`, transformOrigin: "left top", marginTop: (kicker ? 22 : 0) * k }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: BANG, fontSize: (i === lines.length - 1 ? 150 : 118) * k, lineHeight: 0.95, color: i === lines.length - 1 ? color : "#fff", letterSpacing: 2 * k, ...stroke(12 * k), textShadow: `${9 * k}px ${9 * k}px 0 ${i === lines.length - 1 ? PINK : INK}` }}>
            {l}
          </div>
        ))}
        {sub && (
          <div style={{ display: "inline-block", marginTop: 14 * k, background: "#fff", border: `${5 * k}px solid ${INK}`, boxShadow: `${7 * k}px ${7 * k}px 0 ${INK}`, padding: `${6 * k}px ${18 * k}px`, fontFamily: NUN, fontWeight: 900, fontSize: 40 * k, color: INK }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
/** Comic speech bubble with mic/speaker badge and a live waveform. */
export const VoiceBubble: React.FC<{ k: number; x: number; y: number; w: number; o: number; t: number; who: "you" | "ai"; level: number; tail: "left" | "right"; jagged?: boolean; label?: string }> = ({ k, x, y, w, o, t, who, level, tail, jagged = false, label }) => {
  if (o <= 0.01) return null;
  const s = outBack(clamp01(o));
  const h = 170;
  const accent = who === "you" ? ORANGE : CYAN;
  const bars = 11;
  const shape = jagged
    ? (() => {
        const pts: string[] = [];
        const n = 22;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          const r = i % 2 ? 1 : 1.14;
          pts.push(`${50 + Math.cos(a) * 50 * r}% ${50 + Math.sin(a) * 50 * r}%`);
        }
        return `polygon(${pts.join(",")})`;
      })()
    : undefined;
  return (
    <div style={{ position: "absolute", left: x * k, top: y * k, width: w * k, height: h * k, opacity: clamp01(o * 1.5), transform: `scale(${s})`, transformOrigin: tail === "left" ? "10% 100%" : "90% 100%" }}>
      {/* tail */}
      <svg width={70 * k} height={70 * k} viewBox="0 0 70 70" style={{ position: "absolute", top: (h - 14) * k, [tail === "left" ? "left" : "right"]: 50 * k } as React.CSSProperties}>
        <polygon points={tail === "left" ? "0,0 46,0 6,64" : "24,0 70,0 64,64"} fill="#fff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <rect x={tail === "left" ? 3 : 27} y={-6} width={40} height={10} fill="#fff" />
      </svg>
      <div style={{ position: "absolute", inset: 0, background: jagged ? INK : "transparent", clipPath: shape, transform: jagged ? "scale(1.06)" : undefined }} />
      <div style={{ position: "absolute", inset: 0, background: "#fff", border: jagged ? undefined : `${6 * k}px solid ${INK}`, borderRadius: jagged ? 0 : 90 * k, clipPath: shape, boxShadow: jagged ? undefined : `${8 * k}px ${8 * k}px 0 ${INK}`, display: "flex", alignItems: "center", padding: `0 ${30 * k}px`, gap: 18 * k }}>
        <div style={{ width: 100 * k, height: 100 * k, borderRadius: 50 * k, background: accent, border: `${5 * k}px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {who === "you" ? <MicIcon k={k} /> : <SpeakerIcon k={k} />}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 * k, flex: 1, justifyContent: "center" }}>
          {Array.from({ length: bars }, (_, i) => {
            const env = Math.sin(((i + 0.5) / bars) * Math.PI);
            const wob = 0.45 + 0.55 * Math.abs(Math.sin(t * (7 + i * 0.9) + i * 1.3));
            const hh = 14 + env * 92 * (0.15 + 0.85 * level * wob);
            return <div key={i} style={{ width: 18 * k, height: hh * k, borderRadius: 9 * k, background: level < 0.05 ? "#b9bccb" : i % 2 ? accent : who === "you" ? "#ffbf5c" : "#21c8e6", border: `${4 * k}px solid ${INK}` }} />;
          })}
        </div>
      </div>
      {label && (
        <div style={{ position: "absolute", top: -50 * k, [tail === "left" ? "left" : "right"]: 20 * k, background: INK, color: "#fff", fontFamily: NUN, fontWeight: 900, fontSize: 30 * k, padding: `${4 * k}px ${16 * k}px`, transform: "skewX(-8deg)", borderBottom: `${5 * k}px solid ${accent}` } as React.CSSProperties}>
          {label}
        </div>
      )}
    </div>
  );
};

export const MicIcon: React.FC<{ k: number; c?: string }> = ({ k, c = "#fff" }) => (
  <svg width={58 * k} height={58 * k} viewBox="0 0 58 58">
    <rect x={19} y={4} width={20} height={32} rx={10} fill={c} stroke={INK} strokeWidth={4} />
    <path d="M11 26 a18 18 0 0 0 36 0" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <line x1={29} y1={44} x2={29} y2={53} stroke={INK} strokeWidth={5} strokeLinecap="round" />
  </svg>
);
export const SpeakerIcon: React.FC<{ k: number }> = ({ k }) => (
  <svg width={60 * k} height={60 * k} viewBox="0 0 60 60">
    <path d="M8 22 h12 l14 -12 v40 l-14 -12 h-12 z" fill="#fff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M41 20 q8 10 0 20 M47 13 q14 17 0 34" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
  </svg>
);
export const CamIcon: React.FC<{ s: number; c?: string }> = ({ s, c = INK }) => (
  <svg width={s} height={s} viewBox="0 0 40 40">
    <rect x={3} y={11} width={24} height={18} rx={4} fill="none" stroke={c} strokeWidth={4} />
    <path d="M27 17 l10 -5 v16 l-10 -5 z" fill={c} />
  </svg>
);
export const ScreenIcon: React.FC<{ s: number; c?: string }> = ({ s, c = INK }) => (
  <svg width={s} height={s} viewBox="0 0 40 40">
    <rect x={9} y={3} width={22} height={34} rx={4} fill="none" stroke={c} strokeWidth={4} />
    <path d="M20 26 v-12 M14 19 l6 -6 l6 6" fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const WarnIcon: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s} viewBox="0 0 100 100">
    <path d="M50 6 L96 90 H4 Z" fill={YEL} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <rect x={44} y={34} width={12} height={32} rx={6} fill={INK} />
    <circle cx={50} cy={77} r={7} fill={INK} />
  </svg>
);

// ---------------------------------------------------------------------------------------------
/** Toon pointing hand. Tip of the index finger is at (x, y). */
export const Finger: React.FC<{ k: number; x: number; y: number; press: number; ripple: number; o: number }> = ({ k, x, y, press, ripple, o }) => {
  if (o <= 0.01) return null;
  const s = 1 - press * 0.12;
  return (
    <>
      {ripple > 0 && ripple < 1 && (
        <div style={{ position: "absolute", left: (x - 70 * ripple - 10) * k, top: (y - 70 * ripple - 10) * k, width: (140 * ripple + 20) * k, height: (140 * ripple + 20) * k, borderRadius: "50%", border: `${8 * (1 - ripple) * k}px solid ${YEL}`, boxShadow: `0 0 0 ${4 * (1 - ripple) * k}px ${INK}`, opacity: 1 - ripple }} />
      )}
      <svg
        width={170 * k}
        height={230 * k}
        viewBox="0 0 170 230"
        style={{ position: "absolute", left: (x - 30) * k, top: (y - 6) * k, opacity: o, transform: `scale(${s}) rotate(-14deg)`, transformOrigin: "30px 6px", filter: `drop-shadow(${8 * k}px ${10 * k}px 0 rgba(10,10,15,0.55))` }}
      >
        <g stroke={INK} strokeWidth={7} strokeLinejoin="round" fill="#f1c7a6">
          <rect x={12} y={4} width={38} height={110} rx={19} />
          <path d="M14 96 C 6 140, 18 200, 70 222 L 132 222 C 160 190, 162 150, 150 112 C 146 98, 128 96, 124 108 C 122 94, 104 90, 98 104 C 96 90, 76 88, 72 102 L 50 96 Z" />
          <rect x={20} y={10} width={22} height={16} rx={7} fill="#fff1e6" strokeWidth={4} />
        </g>
        <rect x={60} y={196} width={90} height={34} fill="#ff9f1c" stroke={INK} strokeWidth={7} />
      </svg>
    </>
  );
};

// ---------------------------------------------------------------------------------------------
/** Big step numeral + label column left of the phone. */
export const StepTag: React.FC<{ k: number; n: number; lines: string[]; o: number; x?: number; y?: number; size?: number }> = ({ k, n, lines, o, x = 56, y = 300, size = 1 }) => {
  if (o <= 0.01) return null;
  const pop = outBack(clamp01(o));
  return (
    <div style={{ position: "absolute", left: x * k, top: y * k, opacity: clamp01(o * 1.5), transform: `scale(${(0.6 + 0.4 * pop) * size}) rotate(-4deg)`, transformOrigin: "left top" }}>
      <div style={{ fontFamily: DELA, fontSize: 28 * k, letterSpacing: 4 * k, color: "#fff", background: INK, padding: `${4 * k}px ${14 * k}px`, display: "inline-block", borderBottom: `${5 * k}px solid ${RED}` }}>LANGKAH</div>
      <div style={{ fontFamily: BANG, fontSize: 290 * k, lineHeight: 0.85, color: YEL, ...stroke(16 * k), textShadow: `${12 * k}px ${12 * k}px 0 ${PINK}` }}>{n}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: BANG, fontSize: 60 * k, lineHeight: 1.0, color: "#fff", ...stroke(9 * k), textShadow: `${5 * k}px ${5 * k}px 0 ${INK}`, whiteSpace: "nowrap" }}>
          {l}
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Karaoke captions: ink pill, white words, active word yellow with a small bounce.
type W = { w: string; s: number; e: number };
type Phrase = { s: number; e: number; lines: W[][] };
const PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  for (const c of TL.clips as { words: W[] }[]) {
    const ws = c.words;
    const groups = Math.ceil(ws.length / 6);
    const base = Math.floor(ws.length / groups), extra = ws.length % groups;
    let i = 0;
    for (let g = 0; g < groups; g++) {
      const n = base + (g < extra ? 1 : 0);
      const words = ws.slice(i, i + n);
      i += n;
      const cut = Math.ceil(words.length / 2);
      const lines = words.length <= 4 ? [words] : [words.slice(0, cut), words.slice(cut)];
      out.push({ s: words[0].s, e: words[words.length - 1].e, lines });
    }
  }
  out.forEach((p, j) => {
    const next = out[j + 1];
    p.e = next ? Math.min(next.s, p.e + 0.6) : p.e + 0.6;
  });
  return out;
})();

export const Captions: React.FC<{ t: number; k: number; hideAfter: number }> = ({ t, k, hideAfter }) => {
  if (t >= hideAfter) return null;
  const ph = PHRASES.find((p) => t >= p.s - 0.08 && t < p.e);
  if (!ph) return null;
  const inK = sm(ramp(t, ph.s - 0.08, ph.s + 0.1));
  const H = ph.lines.length === 1 ? 100 : 172;
  const bottom = 1530;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: (bottom - H) * k, display: "flex", justifyContent: "center", opacity: inK, transform: `translateY(${(1 - inK) * 14 * k}px)` }}>
      <div style={{ background: INK, border: `${5 * k}px solid #fff`, boxShadow: `${9 * k}px ${9 * k}px 0 ${PINK}`, borderRadius: 26 * k, padding: `${10 * k}px ${30 * k}px ${12 * k}px`, maxWidth: 980 * k, transform: "rotate(-1deg)" }}>
        {ph.lines.map((line, li) => (
          <div key={li} style={{ display: "flex", flexWrap: "nowrap", whiteSpace: "nowrap", justifyContent: "center", gap: 20 * k, lineHeight: 1.18 }}>
            {line.map((w, wi) => {
              const active = t >= w.s && t < w.e + 0.05;
              const b = active ? Math.sin(ramp(t, w.s, w.s + 0.22) * Math.PI) : 0;
              const big = line.reduce((n, x) => n + x.w.length, 0) > 24;
              return (
                <span key={wi} style={{ fontFamily: NUN, fontWeight: 900, fontSize: (big ? 46 : 52) * k, color: active ? YEL : "#fff", display: "inline-block", transform: `translateY(${-b * 7 * k}px) scale(${1 + b * 0.04})` }}>
                  {w.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
