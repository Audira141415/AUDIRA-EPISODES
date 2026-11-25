// EP05 2D layers in SKETCHFORGE dress: paper cards with pencil borders, one vermilion accent.
// All sizes are in 1080-wide units and multiplied by k = width / 1080 (preview 540 / final 1080).
import React from "react";
import { SKETCH_PALETTE as P } from "../../kits/sketchforge/lib/palette.ts";

export const HAND = "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive";
export const MONO = "'Courier New', monospace";

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
/** Typewriter: characters revealed linearly over [a, b]. */
export const typed = (text: string, t: number, a: number, b: number) => text.slice(0, Math.round(text.length * ramp(t, a, b)));

/** A hand-drawn rectangle outline (two wobbly passes) as SVG, sized to its parent. */
export const PencilFrame: React.FC<{ w: number; h: number; k: number; color?: string; seed?: number; width?: number }> = ({ w, h, k, color = P.graphite, seed = 1, width = 3 }) => {
  const j = (n: number) => Math.sin(seed * 12.9898 + n * 78.233) * 3;
  const d = (o: number) =>
    `M ${-6 + j(1 + o)} ${2 + j(2 + o)} L ${w + 5 + j(3 + o)} ${j(4 + o)} M ${w + j(5 + o)} ${-5 + j(6 + o)} L ${w + 2 + j(7 + o)} ${h + 6 + j(8 + o)} M ${w + 6 + j(9 + o)} ${h + j(10 + o)} L ${-4 + j(11 + o)} ${h + 2 + j(12 + o)} M ${j(13 + o)} ${h + 5 + j(14 + o)} L ${2 + j(15 + o)} ${-6 + j(16 + o)}`;
  return (
    <svg width={w * k} height={h * k} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <path d={d(0)} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" opacity={0.9} />
      <path d={d(20)} stroke={color} strokeWidth={width * 0.6} fill="none" strokeLinecap="round" opacity={0.5} />
    </svg>
  );
};

const paperBg = (base = P.paperWhite) =>
  `repeating-linear-gradient(0deg, rgba(90,91,97,0.05) 0px, rgba(90,91,97,0.05) 1px, transparent 1px, transparent 6px), ${base}`;

/** Paper card at an absolute position (1080 units). */
export const Card: React.FC<{ x: number; y: number; w: number; h: number; k: number; o?: number; rot?: number; dy?: number; seed?: number; base?: string; accent?: boolean; children?: React.ReactNode; scale?: number }> = ({
  x, y, w, h, k, o = 1, rot = 0, dy = 0, seed = 1, base = P.paperWhite, accent = false, children, scale = 1,
}) =>
  o <= 0.001 ? null : (
    <div
      style={{
        position: "absolute",
        left: x * k,
        top: (y + dy) * k,
        width: w * k,
        height: h * k,
        opacity: o,
        transform: `rotate(${rot}deg) scale(${scale})`,
        transformOrigin: "50% 50%",
        background: paperBg(base),
        boxShadow: `0 ${10 * k}px ${28 * k}px rgba(0,0,0,0.42)`,
        borderLeft: accent ? `${8 * k}px solid ${P.accent}` : undefined,
      }}
    >
      <PencilFrame w={w} h={h} k={k} seed={seed} />
      {children}
    </div>
  );

/** Text inside a card, positioned in card-local 1080 units. */
export const T: React.FC<{ x: number; y: number; k: number; size: number; font?: string; color?: string; weight?: number; w?: number; children?: React.ReactNode; spacing?: number; lh?: number; align?: "left" | "center" }> = ({
  x, y, k, size, font = HAND, color = P.graphite, weight = 700, w, children, spacing = 0, lh = 1.2, align = "left",
}) => (
  <div style={{ position: "absolute", left: x * k, top: y * k, width: w ? w * k : undefined, fontFamily: font, fontSize: size * k, fontWeight: weight, color, letterSpacing: spacing * k, lineHeight: lh, whiteSpace: w ? "normal" : "nowrap", textAlign: align }}>
    {children}
  </div>
);

/** Pencil cursor; tip at (x, y) in 1080 units, `press` 0..1 squashes it and fires a ripple. */
export const PencilCursor: React.FC<{ x: number; y: number; k: number; press: number; ripple: number; o?: number }> = ({ x, y, k, press, ripple, o = 1 }) => (
  <>
    {ripple > 0 && ripple < 1 && (
      <div
        style={{
          position: "absolute",
          left: (x - 50 * ripple) * k,
          top: (y - 50 * ripple) * k,
          width: 100 * ripple * k,
          height: 100 * ripple * k,
          borderRadius: "50%",
          border: `${5 * k}px solid ${P.accent}`,
          opacity: 1 - ripple,
        }}
      />
    )}
    <svg
      width={150 * k}
      height={150 * k}
      viewBox="0 0 150 150"
      style={{ position: "absolute", left: x * k, top: y * k, opacity: o, overflow: "visible", transform: `translate(${-4 * k}px, ${-4 * k}px) scale(${1 - press * 0.12})`, transformOrigin: "0 0", filter: `drop-shadow(${6 * k}px ${10 * k}px ${6 * k}px rgba(0,0,0,0.45))` }}
    >
      <g transform="rotate(-45 0 0) translate(0 0)">
        <polygon points="0,0 -11,30 11,30" fill={P.wood} />
        <polygon points="0,0 -4,11 4,11" fill={P.graphite} />
        <rect x={-11} y={30} width={22} height={86} fill={P.accent} />
        <rect x={-11} y={30} width={7} height={86} fill={P.accentDeep} opacity={0.5} />
        <rect x={-11} y={116} width={22} height={12} fill="#B9BBC0" />
        <rect x={-11} y={128} width={22} height={14} rx={4} fill="#F2B9A6" />
      </g>
    </svg>
  </>
);

/** Big circled step number + instruction, top-left, under the AudiraSignature band (y >= 262). */
export const StepHeader: React.FC<{ n: number; title: string; sub?: string; k: number; t: number; a: number; b: number }> = ({ n, title, sub, k, t, a, b }) => {
  const o = win(t, a, b, 0.3, 0.25);
  if (o <= 0) return null;
  const pop = outBack(ramp(t, a, a + 0.45));
  return (
    <div style={{ position: "absolute", left: 48 * k, top: 268 * k, opacity: o, display: "flex", alignItems: "center", gap: 22 * k }}>
      <div
        style={{
          width: 132 * k,
          height: 132 * k,
          borderRadius: "50%",
          background: P.accent,
          color: P.paperWhite,
          fontFamily: HAND,
          fontWeight: 700,
          fontSize: 96 * k,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${pop}) rotate(${(1 - pop) * -30}deg)`,
          boxShadow: `0 ${8 * k}px ${20 * k}px rgba(0,0,0,0.45)`,
          border: `${5 * k}px solid ${P.paperWhite}`,
          flex: "none",
        }}
      >
        {n}
      </div>
      <div style={{ background: "rgba(38,38,42,0.86)", padding: `${12 * k}px ${22 * k}px`, borderLeft: `${6 * k}px solid ${P.accent}`, maxWidth: 800 * k, transform: `translateX(${(1 - sm(ramp(t, a + 0.1, a + 0.5))) * -40 * k}px)` }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24 * k, letterSpacing: 4 * k, color: P.accentGlow }}>LANGKAH {n}</div>
        <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 46 * k, lineHeight: 1.15, color: P.paperWhite }}>{title}</div>
        {sub && <div style={{ fontFamily: HAND, fontSize: 30 * k, color: P.paper, opacity: 0.85 }}>{sub}</div>}
      </div>
    </div>
  );
};

/** Dark headline card like the cover (kicker + handwritten line), top-left. */
export const NoteCard: React.FC<{ kicker: string; children: React.ReactNode; k: number; t: number; a: number; b: number; size?: number; top?: number }> = ({ kicker, children, k, t, a, b, size = 64, top = 268 }) => {
  const o = win(t, a, b);
  if (o <= 0) return null;
  const sl = 1 - sm(ramp(t, a, a + 0.5));
  return (
    <div
      style={{
        position: "absolute",
        left: 48 * k,
        top: top * k,
        maxWidth: 940 * k,
        opacity: o,
        transform: `translateY(${sl * -30 * k}px)`,
        background: "rgba(38,38,42,0.86)",
        padding: `${14 * k}px ${26 * k}px ${18 * k}px`,
        borderLeft: `${7 * k}px solid ${P.accent}`,
        boxShadow: `0 ${8 * k}px ${24 * k}px rgba(0,0,0,0.35)`,
      }}
    >
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24 * k, letterSpacing: 5 * k, color: P.paper }}>{kicker}</div>
      <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: size * k, lineHeight: 1.12, color: P.paperWhite, marginTop: 6 * k, textShadow: `0 ${3 * k}px ${10 * k}px rgba(0,0,0,0.55)` }}>{children}</div>
    </div>
  );
};

export const Accent: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: P.accent }}>{children}</span>;
