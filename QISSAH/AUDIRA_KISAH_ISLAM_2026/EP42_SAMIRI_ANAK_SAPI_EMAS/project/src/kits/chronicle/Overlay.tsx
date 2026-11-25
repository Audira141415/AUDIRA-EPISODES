// CHRONICLE 2D layer, laid out on a 1080 × 1920 frame (or 1920 × 1080 for 16:9) and scaled to the render size.
//   <Captions>  word-by-word VO captions; *starred* words are the keywords (bold, warm ivory)
//   <DateStamp> big condensed date that lands with a small rise + crimson rule under it
//   <NameTag>   NAME in condensed caps + role in italic serif (characters, kingdoms, places)
//   <Counter>   a number that rolls from → to (people, metres, years), with a unit and a label
//   <Cite>      top-of-frame source line ("Sumber: …") for a claim on screen
//   <MapPin> / <MapLabel> / <RouteLine>  map annotations placed from projected 3D points

import React from "react";
import { F_CAPTION, F_CITE, F_LABEL, F_STAMP } from "./fonts.ts";

export const IVORY = "#f4ead8";
export const DIM = "rgba(244,234,216,0.62)";
export const CRIMSON = "#d8432f";
export const AMBER = "#ffb547";

const c01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lin = (s: number, a: number, b: number) => c01((s - a) / (b - a));
const out3 = (x: number) => 1 - Math.pow(1 - c01(x), 3);
/** fade in over [a, a+i], out over [b-o, b] */
const window_ = (s: number, a: number, b: number, i = 0.3, o = 0.3) => Math.min(lin(s, a, a + i), 1 - lin(s, b - o, b));

/** Layout canvas: 1080 × 1920 for vertical films, 1920 × 1080 for 16:9 (the overlay is laid out on it and scaled). */
export type Canvas = { W: number; H: number; land: boolean };
export const canvasFor = (width: number, height: number): Canvas => {
  const land = width > height;
  const W = land ? 1920 : 1080;
  return { W, H: Math.round((W * height) / width), land };
};
export const CanvasCtx = React.createContext<Canvas>({ W: 1080, H: 1920, land: false });
export const useCanvas = () => React.useContext(CanvasCtx);

export const Frame: React.FC<{ width: number; height: number; children: React.ReactNode }> = ({ width, height, children }) => {
  const c = canvasFor(width, height);
  return (
    <CanvasCtx.Provider value={c}>
      <div style={{ position: "absolute", left: 0, top: 0, width: c.W, height: c.H, transform: `scale(${width / c.W})`, transformOrigin: "0 0", pointerEvents: "none" }}>{children}</div>
    </CanvasCtx.Provider>
  );
};

// ------------------------------------------------------------------ captions
export type Word = { w: string; t: number; key?: boolean };
/** Parse "Kata *kunci* lain" with a start/end time into evenly paced words (until real VO timings exist). */
export const pace = (text: string, t0: number, t1: number): Word[] => {
  const raw = text.split(/\s+/).filter(Boolean);
  const weights = raw.map((w) => 0.6 + w.replace(/[*,.]/g, "").length * 0.08 + (/[,.]$/.test(w) ? 0.35 : 0));
  const tot = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  return raw.map((w, i) => {
    const t = t0 + ((t1 - t0) * acc) / tot;
    acc += weights[i];
    return { w: w.replace(/\*/g, ""), t, key: /^\*.*\*[,.!?]?$/.test(w) };
  });
};

/** Chunks of ≤ `max` words, breaking after punctuation; each chunk stays until the next starts. */
export const Captions: React.FC<{ s: number; words: Word[]; max?: number; y?: number; end?: number }> = ({ s, words, max: maxIn, y: yIn, end }) => {
  const C = useCanvas();
  const max = maxIn ?? (C.land ? 6 : 4);
  const y = yIn ?? (C.land ? C.H - 150 : 1430);
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= max || /[,.!?]$/.test(w.w)) { chunks.push(cur); cur = []; }
  }
  if (cur.length) chunks.push(cur);
  let ci = -1;
  for (let i = 0; i < chunks.length; i++) if (s >= chunks[i][0].t) ci = i;
  if (ci < 0) return null;
  const chunk = chunks[ci];
  const nextT = chunks[ci + 1]?.[0].t ?? (end ?? chunk[chunk.length - 1].t + 1.2);
  if (s > nextT + 0.05 && !chunks[ci + 1]) return null;
  return (
    <div style={{ position: "absolute", left: C.land ? 260 : 70, right: C.land ? 260 : 70, top: y, textAlign: "center", fontFamily: F_CAPTION, fontSize: 52, lineHeight: 1.25, letterSpacing: 0.2, textShadow: "0 2px 14px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.7)" }}>
      {chunk.map((w, i) => {
        const a = lin(s, w.t - 0.04, w.t + 0.12);
        return (
          <span key={i} style={{ opacity: 0.18 + 0.82 * a, color: w.key ? IVORY : "rgba(244,234,216,0.9)", fontWeight: w.key ? 800 : 500, display: "inline-block", transform: `translateY(${(1 - out3(a)) * 6}px)`, marginRight: 14 }}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ date stamp
export const DateStamp: React.FC<{ s: number; a: number; b: number; top: string; big: string; y?: number; size?: number }> = ({ s, a, b, top, big, y: yIn, size: sizeIn }) => {
  const C = useCanvas();
  const y = yIn ?? (C.land ? 80 : 250), size = sizeIn ?? (C.land ? 128 : 150);
  const v = window_(s, a, b, 0.35, 0.35);
  if (v <= 0) return null;
  const rule = out3(lin(s, a + 0.15, a + 0.75));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: v }}>
      <div style={{ fontFamily: F_LABEL, fontWeight: 800, fontSize: 40, letterSpacing: 9, color: IVORY, opacity: 0.85, transform: `translateY(${(1 - out3(lin(s, a, a + 0.5))) * 16}px)` }}>{top}</div>
      <div style={{ fontFamily: F_STAMP, fontSize: size, lineHeight: 1.0, color: IVORY, letterSpacing: 2, textShadow: "0 6px 30px rgba(0,0,0,0.45)", transform: `translateY(${(1 - out3(lin(s, a + 0.05, a + 0.6))) * 26}px)` }}>{big}</div>
      <div style={{ margin: "14px auto 0", width: 220 * rule, height: 7, background: CRIMSON }} />
    </div>
  );
};

// ------------------------------------------------------------------ name tag
export const NameTag: React.FC<{ s: number; a: number; b: number; name: string; role?: string; x?: number; y: number; align?: "center" | "left" }> = ({ s, a, b, name, role, x: xIn, y, align = "center" }) => {
  const C = useCanvas();
  const x = xIn ?? C.W / 2;
  const v = window_(s, a, b, 0.3, 0.3);
  if (v <= 0) return null;
  const reveal = out3(lin(s, a, a + 0.55));
  return (
    <div style={{ position: "absolute", left: align === "center" ? x - 450 : x, width: 900, top: y, textAlign: align, opacity: v }}>
      <div style={{ display: "inline-block", background: "rgba(11,12,16,0.74)", borderRadius: 14, padding: "18px 28px" }}>
      <div style={{ fontFamily: F_LABEL, fontWeight: 800, fontSize: 58, letterSpacing: 4, color: IVORY, textTransform: "uppercase", clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`, textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}>{name}</div>
      {role && <div style={{ fontFamily: F_CITE, fontStyle: "italic", fontSize: 38, color: DIM, marginTop: -2, opacity: lin(s, a + 0.3, a + 0.7), textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>{role}</div>}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ counter
const fmt = (n: number) => Math.round(n).toLocaleString("id-ID");
export const Counter: React.FC<{ s: number; a: number; b: number; from: number; to: number; roll: [number, number]; unit?: string; label?: string; y?: number; color?: string }> = ({
  s, a, b, from, to, roll, unit = "", label, y: yIn, color = IVORY,
}) => {
  const C = useCanvas();
  const y = yIn ?? (C.land ? 80 : 260);
  const v = window_(s, a, b, 0.3, 0.35);
  if (v <= 0) return null;
  const k = out3(lin(s, roll[0], roll[1]));
  const n = from + (to - from) * k;
  const done = lin(s, roll[1], roll[1] + 0.25);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: v }}>
      <div style={{ fontFamily: F_STAMP, fontSize: 168, lineHeight: 1, color, letterSpacing: 2, textShadow: "0 4px 18px rgba(0,0,0,0.85), 0 0 40px rgba(0,0,0,0.6)", transform: `scale(${1 + 0.05 * Math.sin(Math.PI * done)})` }}>
        {fmt(n)}
        <span style={{ fontSize: 84, marginLeft: 12 }}>{unit}</span>
      </div>
      {label && <div style={{ display: "inline-block", fontFamily: F_LABEL, fontWeight: 600, fontSize: 40, letterSpacing: 4, color: IVORY, marginTop: 6, textTransform: "uppercase", background: "rgba(11,12,16,0.74)", borderRadius: 14, padding: "18px 28px" }}>{label}</div>}
    </div>
  );
};

// ------------------------------------------------------------------ citation
export const Cite: React.FC<{ s: number; a: number; b: number; text: string; src: string; y?: number; quote?: boolean }> = ({ s, a, b, text, src, y: yIn, quote = false }) => {
  const C = useCanvas();
  const y = yIn ?? (C.land ? 64 : 250);
  const v = window_(s, a, b, 0.4, 0.4);
  if (v <= 0) return null;
  return (
    <div style={{ position: "absolute", left: C.land ? 200 : 90, right: C.land ? 200 : 90, top: y, textAlign: "center", opacity: v, background: "rgba(11,12,16,0.74)", borderRadius: 14, padding: "18px 28px", borderLeft: "6px solid #d4a537" }}>
      <div style={{ fontFamily: F_CITE, fontStyle: "italic", fontSize: 46, lineHeight: 1.2, color: IVORY, textShadow: "0 2px 14px rgba(0,0,0,0.6)" }}>{quote ? `“${text}”` : text}</div>
      <div style={{ fontFamily: F_LABEL, fontWeight: 600, fontSize: 36, letterSpacing: 3, color: "#e8c46a", marginTop: 10, textTransform: "uppercase" }}>{src}</div>
    </div>
  );
};

// ------------------------------------------------------------------ map annotations (positions in 0..1 screen space)
export const MapPin: React.FC<{ s: number; a: number; x: number; y: number; name: string; sub?: string; color?: string; side?: "r" | "l"; pulse?: number }> = ({
  s, a, x, y, name, sub, color = AMBER, side = "r", pulse = 0,
}) => {
  const C = useCanvas();
  const v = out3(lin(s, a, a + 0.4));
  if (v <= 0) return null;
  const X = x * C.W, Y = y * C.H;
  const pr = ((s - a) * 0.9) % 1;
  return (
    <div style={{ position: "absolute", left: X, top: Y, opacity: v }}>
      <div style={{ position: "absolute", left: -11, top: -11, width: 22, height: 22, borderRadius: 11, background: color, boxShadow: "0 0 0 4px rgba(0,0,0,0.35)" }} />
      {pulse > 0 && <div style={{ position: "absolute", left: -11 - pr * 40, top: -11 - pr * 40, width: 22 + pr * 80, height: 22 + pr * 80, borderRadius: 200, border: `3px solid ${color}`, opacity: (1 - pr) * pulse }} />}
      <div style={{ position: "absolute", top: -34, [side === "r" ? "left" : "right"]: 26, whiteSpace: "nowrap", textAlign: side === "r" ? "left" : "right" } as React.CSSProperties}>
        <div style={{ fontFamily: F_LABEL, fontWeight: 800, fontSize: 44, letterSpacing: 2, color: IVORY, textShadow: "0 2px 10px rgba(0,0,0,0.7)", clipPath: `inset(0 ${(1 - v) * 100}% 0 0)` }}>{name}</div>
        {sub && <div style={{ fontFamily: F_CITE, fontStyle: "italic", fontSize: 32, color: DIM, marginTop: -4, textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}>{sub}</div>}
      </div>
    </div>
  );
};

/** Screen-space polyline (0..1 points) drawn progressively with a bright head. */
export const RouteLine: React.FC<{ pts: { x: number; y: number }[]; progress: number; color?: string; dash?: boolean; width?: number; opacity?: number }> = ({
  pts, progress, color = AMBER, dash = false, width = 6, opacity = 1,
}) => {
  const C = useCanvas();
  if (pts.length < 2 || progress <= 0) return null;
  const P = pts.map((p) => [p.x * C.W, p.y * C.H]);
  const seg: number[] = [];
  let tot = 0;
  for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(l); tot += l; }
  const want = tot * c01(progress);
  const out: number[][] = [P[0]];
  let acc = 0;
  for (let i = 1; i < P.length; i++) {
    if (acc + seg[i - 1] >= want) {
      const u = (want - acc) / seg[i - 1];
      out.push([P[i - 1][0] + (P[i][0] - P[i - 1][0]) * u, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * u]);
      break;
    }
    out.push(P[i]);
    acc += seg[i - 1];
  }
  const d = out.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const head = out[out.length - 1];
  return (
    <svg width={C.W} height={C.H} style={{ position: "absolute", left: 0, top: 0, opacity }}>
      <path d={d} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={width + 6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ? `${width * 2.4} ${width * 2.2}` : undefined} />
      {progress < 1 && <circle cx={head[0]} cy={head[1]} r={width * 1.6} fill={IVORY} />}
    </svg>
  );
};
