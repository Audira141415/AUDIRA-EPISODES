import React from 'react';
import {AbsoluteFill, getInputProps, interpolate, Easing} from 'remotion';
import project from '../project.json';

/**
 * HALUS (v1.16) — the "smooth, expensive" layer, shared by every look.
 *
 *   level 'drift' (every look): the picture never freezes — each scene drifts slowly (push-in on even scenes, gentle
 *                 pull-back on odd ones) about its focus point. Captions, HUD chips and title cards stay still.
 *   level 'full'  (illustrated looks with a cast — HALUS_FULL below): drift + soft blurred contact shadows under
 *                 characters/props, soft panel shadows, a light top-light + vignette, blurred foreground props for depth,
 *                 livelier idle on characters, and zoom-dissolve for looks whose scene change is a plain whip/drop.
 *   level 'off'   the look exactly as before v1.16.
 *
 * Choice: src/project.json "halus": "auto" (default — level by look) | "full" | "drift" | "off"
 * ("pakai halus" → "full", "tanpa halus"/"flat" → "off"). Render input props {halus: "..."} override it (used by the
 * before/after sheets). Flat colours stay flat: shading here is only soft light/shadow in the ink colour, never glow,
 * never coloured gradients. Signature transitions (PAPAN eraser, CAIR wave-flood, LEMPUNG dough-slap, …) stay theirs.
 */
export type HalusLevel = 'off' | 'drift' | 'full';
export const HALUS_FULL = ['MINIATUR', 'FLATLIFE', 'MABAR', 'BABAD', 'SEMESTA', 'TUBUH', 'CHAT', 'PAPAN'];

const norm = (v: unknown): HalusLevel | 'auto' => {
  if (v === false || v === 'off' || v === 'flat' || v === 'none') return 'off';
  if (v === true || v === 'full' || v === 'on') return 'full';
  if (v === 'drift') return 'drift';
  return 'auto';
};
const choice = (): HalusLevel | 'auto' => {
  let ip: Record<string, unknown> = {};
  try { ip = (getInputProps() ?? {}) as Record<string, unknown>; } catch { ip = {}; }
  if (ip.halus !== undefined) return norm(ip.halus);
  return norm((project as {halus?: unknown}).halus);
};
/** HALUS level for a look id (upper-case, as in references/STYLES.md). Pure: callable anywhere, no context needed. */
export const halusLevel = (look: string): HalusLevel => {
  const c = choice();
  if (c !== 'auto') return c;
  return HALUS_FULL.includes(look.toUpperCase()) ? 'full' : 'drift';
};
export const useHalus = (look: string) => {
  const level = halusLevel(look);
  return {level, drift: level !== 'off', full: level === 'full'};
};

const INOUT = Easing.inOut(Easing.cubic);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lin = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const io = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...clamp, easing: INOUT});

/**
 * Slow drift for scene `i` that is on screen from `a` to `b` (seconds). Returns zoom + small horizontal pan.
 * Even scenes push in 1.000→1.055, odd scenes pull back 1.06→1.015; every third scene also pans ±14 px.
 * `amount` scales it (0.5 for busy UI screens, 1.5 for wide empty landscapes). One continuous camera shot = one `i`
 * (changing `i` mid-shot pops the zoom); a new `i` belongs at a cut or transition.
 */
export const halusDrift = (t: number, a: number, b: number, i = 0, amount = 1) => {
  // open-ended last scene (b huge/unknown) → drift over a typical 6 s instead of standing still
  const end = b - a > 120 ? a + 6 : Math.max(a + 1, b);
  const k = lin(t, a, end);
  const z0 = i % 2 ? 0.06 : 0, z1 = i % 2 ? 0.015 : 0.055;
  const px = (i % 3 === 1 ? 1 : i % 3 === 2 ? -1 : 0) * (-14 + 28 * k) * amount;
  // extra zoom so the pan never uncovers an edge (focus point is ≥ 500 px from every edge in both formats)
  const z = 1 + (z0 + (z1 - z0) * k) * amount + Math.abs(px) / 500;
  return {z, px};
};

/**
 * Zoom-dissolve for a scene that starts at `at`: fades in over 0.44 s (from at − 0.16) while settling from a slight
 * zoom; the scene underneath keeps pushing (pass the NEXT scene's start as `nextAt` to get its exit zoom).
 * kind 'drop' = stronger zoom (for what used to be a drop/fall-in transition).
 */
export const halusDissolve = (t: number, at: number | null, nextAt: number | null = null, kind: 'whip' | 'drop' = 'whip') => {
  const qIn = at === null ? 1 : io(t, at - 0.16, at + 0.28);
  const zIn = 1 + (kind === 'drop' ? 0.14 : 0.08) * (1 - qIn);
  const qOut = nextAt === null ? 0 : io(t, nextAt - 0.16, nextAt + 0.28);
  return {opacity: qIn, z: zIn * (1 + 0.05 * qOut)};
};

/** SVG transform string: scale `z` about (fx, fy) plus a horizontal pan. */
export const zoomAbout = (z: number, fx: number, fy: number, px = 0) => `translate(${fx + px} ${fy}) scale(${z}) translate(${-fx} ${-fy})`;

/** SVG scene wrapper: drift (+ optional dissolve) applied to the PICTURE only. Put captions/HUD outside it. */
export const HScene: React.FC<{
  look: string; t: number; from: number; to: number; i?: number; fx: number; fy: number; amount?: number;
  at?: number | null; nextAt?: number | null; kind?: 'whip' | 'drop'; children: React.ReactNode;
}> = ({look, t, from, to, i = 0, fx, fy, amount = 1, at = null, nextAt = null, kind = 'whip', children}) => {
  const h = useHalus(look);
  if (!h.drift) return <>{children}</>;
  const {z, px} = halusDrift(t, from, to, i, amount);
  const d = at !== null || nextAt !== null ? halusDissolve(t, at, nextAt, kind) : {opacity: 1, z: 1};
  return <g opacity={d.opacity} transform={zoomAbout(z * d.z, fx, fy, px)}>{children}</g>;
};

/** HTML/CSS version of HScene for looks built from divs (AbsoluteFill layers). */
export const HSceneDiv: React.FC<{
  look: string; t: number; from: number; to: number; i?: number; fx?: string; fy?: string; amount?: number;
  at?: number | null; nextAt?: number | null; kind?: 'whip' | 'drop'; children: React.ReactNode; style?: React.CSSProperties;
}> = ({look, t, from, to, i = 0, fx = '50%', fy = '47%', amount = 1, at = null, nextAt = null, kind = 'whip', children, style}) => {
  const h = useHalus(look);
  // off → no wrapper at all, so stacking and blend modes are exactly as before
  if (!h.drift) return <>{children}</>;
  const {z, px} = halusDrift(t, from, to, i, amount);
  const d = at !== null || nextAt !== null ? halusDissolve(t, at, nextAt, kind) : {opacity: 1, z: 1};
  return (
    <AbsoluteFill style={{...style, opacity: d.opacity, transformOrigin: `${fx} ${fy}`, transform: `translateX(${px}px) scale(${z * d.z})`}}>
      {children}
    </AbsoluteFill>
  );
};

const INK = '#1B1438';
/**
 * Filter/gradient defs for the full layer. Put ONCE inside each root <svg> that uses them (ids are fixed: hl-soft,
 * hl-drop, hl-fg, hl-vig, hl-light; pass `ink` to tint the shadows with the look's own ink colour).
 */
export const HalusDefs: React.FC<{ink?: string}> = ({ink = INK}) => (
  <defs>
    <filter id="hl-soft" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation={12} /></filter>
    <filter id="hl-drop" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx={0} dy={22} stdDeviation={20} floodColor={ink} floodOpacity={0.3} /></filter>
    <filter id="hl-fg" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={9} /></filter>
    <radialGradient id="hl-vig" cx="50%" cy="46%" r="72%">
      <stop offset="0.55" stopColor={ink} stopOpacity={0} />
      <stop offset="1" stopColor={ink} stopOpacity={0.3} />
    </radialGradient>
    <linearGradient id="hl-light" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.1} />
      <stop offset="0.35" stopColor="#FFFFFF" stopOpacity={0} />
      <stop offset="0.75" stopColor={ink} stopOpacity={0} />
      <stop offset="1" stopColor={ink} stopOpacity={0.14} />
    </linearGradient>
  </defs>
);

/** soft top light + darker floor + edge vignette (SVG). Draw over the picture, under captions/HUD. */
export const HalusLight: React.FC<{w: number; h: number; strength?: number}> = ({w, h, strength = 1}) => (
  <g style={{pointerEvents: 'none'}} opacity={strength}>
    <rect x={0} y={0} width={w} height={h} fill="url(#hl-light)" />
    <rect x={0} y={0} width={w} height={h} fill="url(#hl-vig)" />
  </g>
);
/** same light for div-built looks */
export const HalusLightDiv: React.FC<{ink?: string; strength?: number}> = ({ink = INK, strength = 1}) => {
  const a = (o: number) => Math.round(o * 255 * strength).toString(16).padStart(2, '0');
  return (
    <AbsoluteFill style={{pointerEvents: 'none',
      background: `radial-gradient(ellipse 72% 72% at 50% 46%, ${ink}00 55%, ${ink}${a(0.3)} 100%), linear-gradient(180deg, #FFFFFF${a(0.1)} 0%, #FFFFFF00 35%, ${ink}00 75%, ${ink}${a(0.14)} 100%)`}} />
  );
};

/** soft blurred contact shadow (needs HalusDefs). Replaces a hard flat ellipse under a character or prop. */
export const SoftShadow: React.FC<{cx: number; cy: number; rx: number; ry: number; op?: number; ink?: string}> = ({cx, cy, rx, ry, op = 0.3, ink = INK}) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={ink} opacity={op} filter="url(#hl-soft)" />
);

/** idle "alive" motion for characters at full level: squash/stretch from the feet + small head sway (degrees). */
export const halusIdle = (t: number, seed: number, full: boolean) => {
  if (!full) return {sx: 1, sy: 1, head: 0, breathe: 1};
  const b = Math.sin(t * 3.1 + seed);
  return {sx: 1 - b * 0.006, sy: 1 + b * 0.012, head: Math.sin(t * 1.35 + seed * 1.7) * 2.2, breathe: 2.3};
};
