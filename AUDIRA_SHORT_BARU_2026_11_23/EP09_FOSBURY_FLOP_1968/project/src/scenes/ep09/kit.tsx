// EP09 Fosbury Flop — 2D CHRONICLE building blocks (SVG/CSS only, no WebGL).
// Silhouette documentary: black figures with a coloured contour, warm directional light, haze, grain.
// Design space: 1080 × 1920. Safe zone: top 180 px, bottom 380 px.
import React from "react";
import { staticFile } from "remotion";
import { Sky, Stadium, Track, MOODS, Mood } from "./set";

export const C = {
  board0: "#2a1a12",
  board1: "#120c09",
  frame: "#2b2118",
  chalk: "#f6e9cf",
  chalkDim: "rgba(246,233,207,0.32)",
  ink: "#0b0c10",
  yellow: "#f5b54a",
  red: "#d9503a",
  blue: "#6ec8ff",
  gold: "#f5b54a",
  silver: "#c9ced6",
  foam: "#4a7ca8",
};
export { MOODS };
export type { Mood };

export const FONT_CSS = `
@font-face { font-family: Anton; src: url(${staticFile("fonts/Anton-Regular.ttf")}); }
@font-face { font-family: SpaceGrotesk; src: url(${staticFile("fonts/SpaceGrotesk-Variable.ttf")}); font-weight: 300 700; }
@font-face { font-family: Manrope; src: url(${staticFile("fonts/manrope-latin-600-normal.woff2")}); font-weight: 600; }
`;
export const HEAD = "Anton, Impact, sans-serif";
export const UI = "SpaceGrotesk, Arial, sans-serif";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOut = (x: number) => { const v = clamp01(x); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
/** 0→1 eased between a and b (seconds). */
export const ramp = (t: number, a: number, b: number) => easeOut((t - a) / (b - a));
export const rampIO = (t: number, a: number, b: number) => easeInOut((t - a) / (b - a));
/** Back-out pop 0→1 (slight overshoot). */
export const pop = (t: number, a: number, d = 0.35) => {
  const x = clamp01((t - a) / d);
  const c1 = 1.70158, c3 = c1 + 1;
  return x <= 0 ? 0 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
/** Scene window alpha with short cross-fades. */
export const win = (t: number, a: number, b: number, f = 0.3) => clamp01(Math.min((t - a) / f + 1, (b - t) / f + 1));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// Deterministic hash noise for chalk jitter
export const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** CHRONICLE set: warm sky with a low sun on one side, stadium bowl + crowd, god-rays, haze, terracotta apron.
 * The sun sits off-centre (sunX) so the light is directional; figures get the rim on that side. */
export const Backdrop: React.FC<{ t: number; mood: keyof typeof MOODS; sunX?: number; horizon?: number; rays?: number }> = ({ t, mood, sunX = 820, horizon = 1060, rays = 0.42 }) => {
  const m = MOODS[mood];
  const dx = Math.sin(t * 0.11) * 10;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: m.top }}>
      <div style={{ position: "absolute", inset: -40, transform: `translateX(${dx * 0.4}px)` }}>
        <Sky mood={m} sunX={sunX} sunY={horizon - 330} sunR={190} />
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${dx}px)` }}>
        <Stadium y0={horizon - 300} y1={horizon} mood={m} seed={9} blur={1.5} rays={rays} rayX={sunX} />
      </div>
      <Track yH={horizon} lanes={8} color="#6e3420" line="#f1e3c8" scroll={t * 0.03} />
      {/* warm light pool where the sun lands + cool shadow on the far side (directional key) */}
      <div style={{ position: "absolute", left: 0, top: horizon, width: 1080, height: 1920 - horizon,
        background: `radial-gradient(ellipse 60% 40% at ${(sunX / 1080) * 100}% 18%, ${m.sun}55, transparent 70%), linear-gradient(90deg, rgba(10,8,14,${sunX > 540 ? 0.55 : 0}) 0%, transparent 55%, rgba(10,8,14,${sunX > 540 ? 0 : 0.55}) 100%)` }} />
    </div>
  );
};

/** Top HUD strip (broadcast style), stays inside the top area; brand AUDIRA lives in the scene. */
export const Hud: React.FC<{ t: number; tag: string; code: string }> = ({ t, tag, code }) => {
  const k = ramp(t, 0.1, 0.7);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 196, height: 64, display: "flex", alignItems: "center", gap: 14,
      opacity: k, transform: `translateY(${(1 - k) * -30}px)`, fontFamily: UI, fontWeight: 700 }}>
      <div style={{ background: "#b8321f", color: "#fff", padding: "8px 16px", borderRadius: 10, fontSize: 36, letterSpacing: 1 }}>AUDIRA</div>
      <div style={{ background: C.yellow, color: C.ink, padding: "8px 16px", borderRadius: 10, fontSize: 36 }}>SPORT FACTS</div>
      <div style={{ flex: 1 }} />
      <div style={{ border: `3px solid ${C.chalk}`, color: C.chalk, padding: "8px 14px", borderRadius: 10, fontSize: 36, letterSpacing: 2 }}>{code}</div>
      {/* final r2: tight line box so the tag ends above the card top (was top 72 + default line height, clipped by card edge) */}
      <div style={{ position: "absolute", left: 0, top: 60, color: C.yellow, fontSize: 36, letterSpacing: 2, whiteSpace: "nowrap", lineHeight: 1, background: "rgba(14,9,6,0.6)", padding: "2px 10px", borderRadius: 6 }}>● {tag}</div>
    </div>
  );
};

/** Card on the board: paper/slate plate with drop shadow. */
/** Paper/chalk grain overlay so cards read as printed paper, not flat fills. */
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0 0.12  0 0 0 0.16 0"/></filter><rect width="240" height="240" filter="url(%23n)"/></svg>').replace(/%2523/g, '%23')}")`;
export const Card: React.FC<{ x: number; y: number; w: number; k: number; rot?: number; bg?: string; children: React.ReactNode; style?: React.CSSProperties }> =
  ({ x, y, w, k, rot = 0, bg = C.chalk, children, style }) => (
    <div style={{ position: "absolute", left: x, top: y, width: w, transform: `translateY(${(1 - k) * 60}px) rotate(${rot}deg) scale(${0.9 + 0.1 * k})`,
      opacity: clamp01(k * 1.5), backgroundColor: bg, backgroundImage: GRAIN, borderRadius: 18, boxShadow: "0 22px 40px rgba(0,0,0,0.45), 0 4px 0 rgba(0,0,0,0.25)", ...style }}>
      {children}
    </div>
  );

/** Kinetic data callout: big number + label, pops in. */
export const Callout: React.FC<{ x: number; y: number; t: number; at: number; big: string; label: string; color?: string; size?: number; out?: number }> =
  ({ x, y, t, at, big, label, color = C.yellow, size = 150, out = 1e9 }) => {
    const k = pop(t, at, 0.4) * (1 - ramp(t, out, out + 0.35));
    if (k <= 0.001) return null;
    return (
      <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${k})`, textAlign: "center", opacity: clamp01(k * 2) }}>
        <div style={{ fontFamily: HEAD, fontSize: size, lineHeight: 1, color, textShadow: "0 8px 0 rgba(0,0,0,0.35)" }}>{big}</div>
        <div style={{ marginTop: 10, display: "inline-block", background: C.ink, color: C.chalk, fontFamily: UI, fontWeight: 700, fontSize: 36, padding: "8px 18px", borderRadius: 10, letterSpacing: 1 }}>{label}</div>
      </div>
    );
  };

/** Chip label (small, ≥ 34 px text). */
export const Chip: React.FC<{ x: number; y: number; k: number; text: string; bg?: string; fg?: string; size?: number; anchor?: "c" | "l" }> =
  ({ x, y, k, text, bg = C.ink, fg = C.chalk, size = 38, anchor = "c" }) => k <= 0.001 ? null : (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(${anchor === "c" ? "-50%" : "0"},-50%) scale(${0.8 + 0.2 * k})`, opacity: k,
      background: bg, color: fg, fontFamily: UI, fontWeight: 700, fontSize: size, padding: "10px 20px", borderRadius: 12, whiteSpace: "nowrap",
      boxShadow: "0 10px 20px rgba(0,0,0,0.35)" }}>{text}</div>
  );

// ---------- Athlete figure (magnet cut-out look) ----------
export type Pose = Record<"neck" | "head" | "lK" | "lF" | "rK" | "rF" | "lE" | "lH" | "rE" | "rH", [number, number]>;
export const POSES: Record<string, Pose> = {
  run: { neck: [8, -72], head: [14, -98], lK: [22, 38], lF: [8, 84], rK: [-14, 40], rF: [-36, 72], lE: [24, -46], lH: [36, -24], rE: [-10, -42], rH: [-24, -20] },
  take: { neck: [2, -74], head: [4, -100], lK: [26, -14], lF: [30, 34], rK: [-6, 44], rF: [-10, 90], lE: [18, -94], lH: [26, -120], rE: [-14, -92], rH: [-12, -120] },
  scissors: { neck: [-4, -72], head: [-6, -98], lK: [40, -18], lF: [82, -24], rK: [-18, 38], rF: [-6, 82], lE: [22, -50], lH: [44, -40], rE: [-30, -50], rH: [-48, -34] },
  straddle: { neck: [-64, 8], head: [-90, 16], lK: [36, -34], lF: [74, -26], rK: [28, 40], rF: [34, 84], lE: [-56, 44], lH: [-62, 76], rE: [-40, 46], rH: [-30, 74] },
  flop: { neck: [56, 24], head: [80, 40], lK: [-46, 20], lF: [-74, 54], rK: [-50, 16], rF: [-80, 48], lE: [36, 42], lH: [14, 56], rE: [42, 36], rH: [20, 52] },
  clear: { neck: [44, 46], head: [62, 66], lK: [-34, -22], lF: [-50, -66], rK: [-38, -26], rF: [-56, -70], lE: [30, 62], lH: [10, 74], rE: [36, 58], rH: [16, 70] },
  land: { neck: [52, 4], head: [78, 2], lK: [-30, -40], lF: [-60, -72], rK: [-34, -36], rF: [-66, -66], lE: [60, -24], lH: [80, -44], rE: [56, -30], rH: [74, -50] },
};
export const mixPose = (a: Pose, b: Pose, k: number): Pose => {
  const o = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((j) => { o[j] = [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)]; });
  return o;
};
/** Centre of mass estimate (segment-weighted) relative to hip. */
export const com = (p: Pose): [number, number] => {
  const seg: [[number, number], [number, number], number][] = [
    [[0, 0], p.neck, 0.5], [p.neck, p.head, 0.08], [[0, 0], p.lK, 0.1], [p.lK, p.lF, 0.06], [[0, 0], p.rK, 0.1], [p.rK, p.rF, 0.06],
    [p.neck, p.lE, 0.03], [p.lE, p.lH, 0.02], [p.neck, p.rE, 0.03], [p.rE, p.rH, 0.02]];
  let x = 0, y = 0, m = 0;
  for (const [a, b, w] of seg) { x += (a[0] + b[0]) / 2 * w; y += (a[1] + b[1]) / 2 * w; m += w; }
  return [x / m, y / m];
};

/** CHRONICLE silhouette: solid black body, coloured contour (`jersey` = contour colour), soft rim glow from the
 * sun side (upper right) and a long floor shadow. Ghost = faint onion-skin. */
export const Figure: React.FC<{ pose: Pose; x: number; y: number; s?: number; rot?: number; ghost?: boolean; jersey?: string; showCom?: boolean }> =
  ({ pose: p, x, y, s = 1, rot = 0, ghost = false, jersey = C.gold, showCom = false }) => {
    const rim = jersey;
    const body = ghost ? "rgba(246,233,207,0.20)" : C.ink;
    const L = (a: [number, number], b: [number, number], w: number) => (
      <>
        {!ghost && <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={rim} strokeOpacity={0.8} strokeWidth={w + 5} strokeLinecap="round" />}
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={body} strokeWidth={w} strokeLinecap="round" />
        {/* sun-side shading: a warm sheen offset toward the light so limbs read as rounded, lit volumes */}
        {!ghost && <line x1={a[0] + w * 0.16} y1={a[1] - w * 0.16} x2={b[0] + w * 0.16} y2={b[1] - w * 0.16} stroke="rgba(255,196,120,0.30)" strokeWidth={w * 0.32} strokeLinecap="round" />}
      </>
    );
    const cm = com(p);
    const O: [number, number] = [0, 0];
    const limbs = (
      <>
        {L(p.neck, p.rE, 15)}{L(p.rE, p.rH, 13)}
        {L(O, p.rK, 23)}{L(p.rK, p.rF, 17)}
        {L(O, p.neck, 36)}
        {L(O, p.lK, 23)}{L(p.lK, p.lF, 17)}
        {L(p.neck, p.lE, 15)}{L(p.lE, p.lH, 13)}
        <circle cx={p.head[0]} cy={p.head[1]} r={20} fill={body} stroke={ghost ? "none" : rim} strokeWidth={ghost ? 0 : 3} />
        {!ghost && <circle cx={p.head[0] + 5} cy={p.head[1] - 5} r={9} fill="rgba(255,196,120,0.30)" />}
      </>
    );
    return (
      <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}
        style={{ filter: ghost ? undefined : `drop-shadow(5px -4px 7px ${rim}88) drop-shadow(-10px 16px 10px rgba(0,0,0,0.55))` }}>
        {limbs}
        {/* inner black pass over the contour joints so overlaps read as one solid silhouette */}
        {!ghost && (
          <g>
            <line x1={0} y1={0} x2={p.neck[0]} y2={p.neck[1]} stroke={body} strokeWidth={36} strokeLinecap="round" />
            <line x1={0} y1={0} x2={p.lK[0]} y2={p.lK[1]} stroke={body} strokeWidth={23} strokeLinecap="round" />
            <line x1={0} y1={0} x2={p.rK[0]} y2={p.rK[1]} stroke={body} strokeWidth={23} strokeLinecap="round" />
          </g>
        )}
        {showCom && (
          <g transform={`translate(${cm[0]},${cm[1]})`}>
            <circle r={26} fill="none" stroke={C.yellow} strokeWidth={3} opacity={0.6} />
            <circle r={17} fill={C.yellow} stroke={C.ink} strokeWidth={5} />
            <path d="M-17 0A17 17 0 0 1 0 -17V0Z M17 0A17 17 0 0 1 0 17V0Z" fill={C.ink} />
          </g>
        )}
      </g>
    );
  };

/** High-jump bar with standards. y = bar height on screen. */
export const Bar: React.FC<{ x1: number; x2: number; y: number; floor: number; k?: number; color?: string }> = ({ x1, x2, y, floor, k = 1, color = C.chalk }) => (
  <g opacity={k}>
    <rect x={x1 - 14} y={y - 30} width={14} height={floor - y + 30} fill="#2a2420" stroke="#f5b54a" strokeWidth={3} />
    <rect x={x2} y={y - 30} width={14} height={floor - y + 30} fill="#2a2420" stroke="#f5b54a" strokeWidth={3} />
    <rect x={x1} y={y - 6} width={x2 - x1} height={12} rx={6} fill={color} stroke={C.ink} strokeWidth={4} />
    {Array.from({ length: 6 }).map((_, i) => (
      <rect key={i} x={x1 + (i * (x2 - x1)) / 6} y={y - 6} width={(x2 - x1) / 12} height={12} fill={C.red} opacity={0.85} />
    ))}
  </g>
);

/** Hand-drawn chalk path that draws on with progress k. */
export const ChalkPath: React.FC<{ d: string; k: number; len?: number; color?: string; w?: number; dash?: boolean }> = ({ d, k, len = 2000, color = C.chalk, w = 7, dash = false }) => (
  <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"
    strokeDasharray={dash ? "18 16" : `${len}`} strokeDashoffset={dash ? 0 : len * (1 - clamp01(k))}
    style={dash ? { clipPath: `inset(0 ${100 - clamp01(k) * 100}% 0 0)` } : undefined} opacity={0.92} />
);
