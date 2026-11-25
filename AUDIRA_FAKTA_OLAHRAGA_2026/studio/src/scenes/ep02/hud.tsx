// EP02 HUD (VINTAGEFORGE): museum labels and tickets in parchment + aged brass, typewriter text.
// Layout in 1080×1920 px, scaled by <Frame> for preview sizes. Safe zones: top ≥ 236, karaoke band
// y 1290–1540 kept free of cards, bottom 380 px clear. Labels ≥ 34 px. Max 2 cards at once.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadRye } from "@remotion/google-fonts/Rye";
import { loadFont as loadElite } from "@remotion/google-fonts/SpecialElite";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { VP } from "./RoadSet.tsx";
import { clamp, lerp, seg } from "./timing.ts";

export const RYE = loadRye().fontFamily;
export const ELITE = loadElite().fontFamily;
export const PLAYFAIR = loadPlayfair("italic", { weights: ["400", "700"] }).fontFamily;
const INK = VP.engravingBrown;
const GOLD = VP.agedGold;
const PAPER = VP.parchmentSepia;
const RUST = "#8e2f1f";

export const Frame: React.FC<{ width: number; height: number; children: React.ReactNode }> = ({ width, children }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0" }}>{children}</div>
  </AbsoluteFill>
);

/** In 0→1 over 0.3 s from a, out over 0.25 s before b. Returns {o, s} (opacity, scale). */
const inOut = (t: number, a: number, b: number) => {
  if (t < a || t > b) return { o: 0, s: 1 };
  const i = clamp((t - a) / 0.3), o = clamp((b - t) / 0.25);
  const s = i < 0.6 ? lerp(0.9, 1.05, i / 0.6) : lerp(1.05, 1, (i - 0.6) / 0.4);
  return { o: Math.min(i * 1.6, o, 1), s };
};
const Pos: React.FC<{ t: number; a: number; b: number; y: number; x?: number; align?: "center" | "left"; children: React.ReactNode }> = ({ t, a, b, y, x = 64, align = "center", children }) => {
  const { o, s } = inOut(t, a, b);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: y, left: align === "center" ? 0 : x, right: align === "center" ? 0 : undefined, display: "flex", justifyContent: align === "center" ? "center" : "flex-start", opacity: o, transform: `scale(${s})`, transformOrigin: align === "center" ? "50% 0" : "0 0" }}>
      {children}
    </div>
  );
};

const paper: React.CSSProperties = {
  background: "rgba(243,234,214,0.95)",
  border: `3px solid ${GOLD}`,
  outline: `1px solid ${GOLD}`,
  outlineOffset: -10,
  boxShadow: "0 10px 26px rgba(30,20,10,0.45)",
  color: INK,
};

/** Museum ticket card: big line + optional small line. */
export const Card: React.FC<{ t: number; a: number; b: number; y: number; text: string; sub?: string; size?: number; tone?: "paper" | "ink" | "gold" }> = ({ t, a, b, y, text, sub, size = 56, tone = "paper" }) => {
  const bg = tone === "ink" ? { background: "rgba(30,22,14,0.92)", color: PAPER, border: `3px solid ${GOLD}` } : tone === "gold" ? { background: GOLD, color: INK, border: `3px solid ${INK}` } : {};
  return (
    <Pos t={t} a={a} b={b} y={y}>
      <div style={{ ...paper, ...bg, padding: "18px 36px 20px", textAlign: "center", maxWidth: 920 }}>
        <div style={{ fontFamily: ELITE, fontSize: size, lineHeight: 1.05, letterSpacing: 1 }}>{text}</div>
        {sub && <div style={{ fontFamily: ELITE, fontSize: Math.max(34, size * 0.55), marginTop: 6, opacity: 0.85 }}>{sub}</div>}
      </div>
    </Pos>
  );
};

/** Name card: engraved name + role line, left-aligned. */
export const NameCard: React.FC<{ t: number; a: number; b: number; y: number; name: string; role: string }> = ({ t, a, b, y, name, role }) => (
  <Pos t={t} a={a} b={b} y={y} align="left">
    <div style={{ ...paper, padding: "14px 30px 16px", borderLeft: `14px solid ${RUST}` }}>
      <div style={{ fontFamily: RYE, fontSize: 64, lineHeight: 1 }}>{name}</div>
      <div style={{ fontFamily: ELITE, fontSize: 38, marginTop: 8 }}>{role}</div>
    </div>
  </Pos>
);

/** Rubber stamp, no rotation (action scenes), ≤ 860 px wide. Lands with a small overshoot. */
export const Stamp: React.FC<{ t: number; a: number; b: number; y: number; text: string; size?: number; color?: string }> = ({ t, a, b, y, text, size = 96, color = RUST }) => {
  if (t < a || t > b) return null;
  const k = clamp((t - a) / 0.18);
  const s = k < 1 ? lerp(1.6, 1, k) : 1;
  const o = Math.min(k * 2, clamp((b - t) / 0.25));
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o * 0.92 }}>
      <div style={{ transform: `scale(${s})`, maxWidth: 860, border: `10px double ${color}`, padding: "10px 34px 14px", color, fontFamily: RYE, fontSize: size, lineHeight: 1, textAlign: "center", background: "rgba(243,234,214,0.55)", mixBlendMode: "multiply" }}>
        {text}
      </div>
    </div>
  );
};

/** Hook title (cover typography, fades out). */
export const HookTitle: React.FC<{ o: number }> = ({ o }) =>
  o <= 0 ? null : (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(42,27,14,0.86) 0%, rgba(42,27,14,0.62) 22%, rgba(42,27,14,0) 40%)" }} />
      <div style={{ position: "absolute", left: 64, right: 64, top: 236, borderTop: `3px solid ${GOLD}`, borderBottom: `1px solid ${GOLD}`, height: 7 }} />
      <div style={{ position: "absolute", left: 64, right: 64, top: 262, display: "flex", justifyContent: "space-between", fontFamily: ELITE, fontSize: 36, letterSpacing: 2, color: GOLD }}>
        <span>FAKTA OLAHRAGA #02</span>
        <span style={{ color: PAPER }}>1904</span>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 322, textShadow: "0 6px 24px rgba(0,0,0,0.55)" }}>
        <div style={{ fontFamily: RYE, fontSize: 136, lineHeight: 0.98, color: PAPER }}>MARATON</div>
        <div style={{ fontFamily: RYE, fontSize: 104, lineHeight: 1.02, color: GOLD }}>PALING KACAU</div>
      </div>
    </div>
  );

/** Brass thermometer filling to 32 °C. */
export const Thermometer: React.FC<{ t: number; a: number; b: number; y: number }> = ({ t, a, b, y }) => {
  const k = seg(t, a + 0.1, a + 1.1);
  const v = Math.round(lerp(20, 32, k));
  return (
    <Pos t={t} a={a} b={b} y={y}>
      <div style={{ ...paper, display: "flex", alignItems: "center", gap: 26, padding: "16px 34px" }}>
        <div style={{ position: "relative", width: 34, height: 220, borderRadius: 17, border: `5px solid ${GOLD}`, background: "#efe6d2" }}>
          <div style={{ position: "absolute", bottom: 4, left: 5, right: 5, height: `${lerp(20, 92, k)}%`, background: RUST, borderRadius: 10 }} />
          <div style={{ position: "absolute", bottom: -26, left: -14, width: 52, height: 52, borderRadius: 26, background: RUST, border: `5px solid ${GOLD}` }} />
        </div>
        <div>
          <div style={{ fontFamily: RYE, fontSize: 120, lineHeight: 1 }}>{v} °C</div>
          <div style={{ fontFamily: ELITE, fontSize: 38 }}>PUKUL 15.00 · SIANG TERPANAS</div>
        </div>
      </div>
    </Pos>
  );
};

/** Sepia route map: 40 km line, 7 hills, one water point in the middle. */
export const RouteMap: React.FC<{ t: number; a: number; b: number; y: number; hillsAt: number; waterAt: number }> = ({ t, a, b, y, hillsAt, waterAt }) => {
  const draw = seg(t, a, a + 1.4);
  const hills = Array.from({ length: 7 }, (_, i) => seg(t, hillsAt + i * 0.12, hillsAt + i * 0.12 + 0.25));
  const water = seg(t, waterAt, waterAt + 0.3);
  const pulse = 1 + 0.12 * Math.sin(t * 8) * water;
  return (
    <Pos t={t} a={a} b={b} y={y}>
      <div style={{ ...paper, width: 900, padding: "18px 30px 22px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: ELITE, fontSize: 40 }}>
          <span>RUTE MARATON</span>
          <span style={{ fontFamily: RYE, fontSize: 56, lineHeight: 0.8 }}>40 KM</span>
        </div>
        <svg width={840} height={200} viewBox="0 0 840 200" style={{ marginTop: 6 }}>
          {hills.map((h, i) => {
            const x = 70 + i * 110;
            return <path key={i} d={`M${x - 50} 150 Q${x} ${150 - 90 * h} ${x + 50} 150`} fill={`rgba(197,160,89,${0.35 * h})`} stroke={INK} strokeWidth={3} opacity={h} />;
          })}
          <line x1={20} y1={150} x2={20 + 800 * draw} y2={150} stroke={RUST} strokeWidth={8} strokeDasharray="22 12" />
          <circle cx={20} cy={150} r={12} fill={INK} />
          {draw > 0.98 && <circle cx={820} cy={150} r={12} fill={INK} />}
          {water > 0 && (
            <g transform={`translate(420 150) scale(${pulse * water})`}>
              <circle r={34} fill="#52796F" stroke={PAPER} strokeWidth={5} />
              <path d="M0 -20 C 10 -4, 14 4, 0 16 C -14 4, -10 -4, 0 -20 Z" fill={PAPER} />
            </g>
          )}
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: ELITE, fontSize: 42, marginTop: -4 }}>
          <span style={{ opacity: hills[6] }}>7 BUKIT</span>
          <span style={{ opacity: water, color: "#2f5a4e" }}>1 TITIK AIR RESMI · ±MIL 12</span>
        </div>
      </div>
    </Pos>
  );
};

/** Brass pocket watch ticking to 3:28:53. */
export const PocketWatch: React.FC<{ t: number; a: number; b: number; y: number }> = ({ t, a, b, y }) => {
  const k = seg(t, a, a + 0.9);
  const secs = Math.round(lerp(0, 3 * 3600 + 28 * 60 + 53, k));
  const hh = Math.floor(secs / 3600), mm = Math.floor((secs % 3600) / 60), ss = secs % 60;
  const txt = `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  const ang = (mm / 60) * 360, angH = ((hh % 12) / 12) * 360 + (mm / 60) * 30;
  return (
    <Pos t={t} a={a} b={b} y={y}>
      <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
        <svg width={260} height={290} viewBox="0 0 260 290">
          <circle cx={130} cy={22} r={16} fill="none" stroke={GOLD} strokeWidth={8} />
          <circle cx={130} cy={160} r={122} fill={GOLD} />
          <circle cx={130} cy={160} r={104} fill={PAPER} stroke={INK} strokeWidth={3} />
          {Array.from({ length: 12 }, (_, i) => {
            const r = (i / 12) * Math.PI * 2;
            return <line key={i} x1={130 + Math.sin(r) * 88} y1={160 - Math.cos(r) * 88} x2={130 + Math.sin(r) * 100} y2={160 - Math.cos(r) * 100} stroke={INK} strokeWidth={5} />;
          })}
          <line x1={130} y1={160} x2={130 + Math.sin((angH * Math.PI) / 180) * 55} y2={160 - Math.cos((angH * Math.PI) / 180) * 55} stroke={INK} strokeWidth={9} strokeLinecap="round" />
          <line x1={130} y1={160} x2={130 + Math.sin((ang * Math.PI) / 180) * 84} y2={160 - Math.cos((ang * Math.PI) / 180) * 84} stroke={RUST} strokeWidth={6} strokeLinecap="round" />
          <circle cx={130} cy={160} r={8} fill={INK} />
        </svg>
        <div style={{ ...paper, padding: "14px 30px 18px" }}>
          <div style={{ fontFamily: ELITE, fontSize: 38 }}>WAKTU JUARA</div>
          <div style={{ fontFamily: RYE, fontSize: 112, lineHeight: 1 }}>{txt}</div>
        </div>
      </div>
    </Pos>
  );
};

export const Teaser: React.FC<{ t: number; a: number; b: number; y: number }> = ({ t, a, b, y }) => (
  <Pos t={t} a={a} b={b} y={y}>
    <div style={{ ...paper, background: "rgba(30,22,14,0.93)", color: PAPER, padding: "20px 40px 24px", textAlign: "center" }}>
      <div style={{ fontFamily: ELITE, fontSize: 38, color: GOLD, letterSpacing: 3 }}>BERIKUTNYA · EP03</div>
      <div style={{ fontFamily: RYE, fontSize: 92, lineHeight: 1.05, marginTop: 6 }}>LAGA TENIS 11 JAM</div>
    </div>
  </Pos>
);

// ---------------------------------------------------------------- full-frame effects
/** Dust sweeping across the frame around each cut (2D, the carrier between scenes). */
export const DustWipe: React.FC<{ t: number; cuts: number[] }> = ({ t, cuts }) => {
  const c = cuts.find((x) => t > x - 0.45 && t < x + 0.45);
  if (c === undefined) return null;
  const k = (t - (c - 0.45)) / 0.9; // 0..1 across the cut
  const cover = Math.sin(Math.PI * k);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {Array.from({ length: 7 }, (_, i) => {
        const x = lerp(-700, 1500, k) + (i % 3) * 180 - 200;
        const y = 120 + i * 260;
        const r = 520 + (i % 2) * 160;
        return (
          <div key={i} style={{ position: "absolute", left: x - r, top: y - r * 0.7, width: r * 2, height: r * 1.4, borderRadius: "50%", opacity: cover, background: "radial-gradient(closest-side, rgba(228,206,160,0.98) 0%, rgba(222,198,150,0.85) 50%, rgba(222,198,150,0) 100%)", filter: "blur(10px)" }} />
        );
      })}
    </div>
  );
};
/** Ambient screen-space dust puffs (x, y, r, opacity in 1080 px), drifting with time. */
export const DustHaze: React.FC<{ t: number; puffs: [number, number, number, number][]; vx?: number }> = ({ t, puffs, vx = 30 }) => (
  <>
    {puffs.map(([x, y, r, o], i) => (
      <div key={i} style={{ position: "absolute", left: x - r + Math.sin(t * 0.7 + i) * 20 + t * vx * 0.2, top: y - r * 0.75 + Math.cos(t * 0.5 + i) * 10, width: r * 2, height: r * 1.5, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(236,214,170,${o}) 0%, rgba(228,204,158,${o * 0.55}) 45%, rgba(228,204,158,0) 100%)`, filter: "blur(6px)" }} />
    ))}
  </>
);
export const Flash: React.FC<{ t: number; at: number; dur?: number; max?: number; color?: string }> = ({ t, at, dur = 0.35, max = 0.85, color = "#fff8e6" }) => {
  const k = (t - at) / dur;
  if (k < 0 || k > 1) return null;
  return <div style={{ position: "absolute", inset: 0, background: color, opacity: max * (1 - k) * (1 - k) }} />;
};
/** Hallucination: pulsing hot vignette + wavering bands. */
export const HeatHaze: React.FC<{ t: number; on: number }> = ({ t, on }) => {
  if (on <= 0) return null;
  const p = 0.5 + 0.5 * Math.sin(t * 5);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: on }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) ${45 - p * 8}%, rgba(120,50,20,0.55) 100%)` }} />
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 700 + i * 120 + Math.sin(t * 3 + i) * 30, height: 50, background: "rgba(255,236,200,0.08)", filter: "blur(14px)", transform: `translateX(${Math.sin(t * 4 + i * 1.7) * 40}px)` }} />
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- karaoke captions
export type CapWord = { w: string; t: number; e: number; key: boolean };
/** Phrase-wise karaoke at y 1300 (band 1290–1540): ≤ 4 words per line, gap ≥ 0.4em, active bounce ≤ 1.04. */
export const Captions: React.FC<{ t: number; words: CapWord[]; end: number }> = ({ t, words, end }) => {
  if (t > end || t < words[0].t - 0.1) return null;
  // group into chunks of up to 4 words, broken at punctuation
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
  const chunk = chunks[ci];
  return (
    <div style={{ position: "absolute", top: 1300, left: 60, right: 60, display: "flex", justifyContent: "center", flexWrap: "wrap", columnGap: "0.42em", fontFamily: RYE, fontSize: 76, lineHeight: 1.12, textAlign: "center" }}>
      {chunk.map((w, i) => {
        const on = t >= w.t;
        const active = on && t < w.e + 0.05;
        const b = active ? 1 + 0.04 * Math.sin(clamp((t - w.t) / 0.18) * Math.PI) : 1;
        return (
          <span key={i} style={{ display: "inline-block", transform: `scale(${b})`, color: on ? (w.key ? GOLD : PAPER) : "rgba(243,234,214,0.78)", WebkitTextStroke: "2px rgba(30,20,10,0.9)", textShadow: "0 5px 0 rgba(30,20,10,0.85), 0 10px 24px rgba(0,0,0,0.55)" }}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};
