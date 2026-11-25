import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, Easing} from 'remotion';
import {CaptionPage} from '../../components/WordCaptions';
import {display, lerp, pageAt, rnd, spline, useFrame} from '../shared';
import {halusDrift, halusLevel, HalusLightDiv, useHalus, zoomAbout} from '../../lib/halus';

// TUBUH style kit (look #21) — the "what happens inside your body" cartoon genre, fully FLAT.
// Soft pink body world (walls with rounded folds, scalloped lining, plasma tubes), cute cell / germ characters with
// big white eyes + eyelid blinks + squash-and-stretch, square-bracket labels, an outside cartoon person with an iris
// cutaway, word-synced captions with a red active-word pill. No gradients, glows, blur or SVG filters anywhere:
// depth comes from hard crescent shading bands, 5 px outlines and parallax. Self-contained: react, remotion, ../shared.
// Files: kit.tsx (palette, motion, faces, base cast, labels, captions) · props.tsx (episode cast + props, the four sets
// TongueSet / NerveSet / SkinSet / OutsideSet, the camera Cam/camAt/camT/toScreen/framed, Svg, Dive + LobeWipe).
// Fonts: 'Tub Head' (Baloo 2) + 'Tub Text' (Nunito) from StyleFonts. Landscape: Caption, Svg, sets, Dive and LobeWipe
// read useFrame(); cameras put the world pose at the frame centre via framed(cam, fr) — see STYLES.md TUBUH → Landscape.
// HALUS (v1.16, level 'full' by default — the only exception to "no filters": ink soft shadows + blurred fg bumps):
// wrap each scene's SET in <g transform={tubScene(t, {i, from, to, W, H}).transform}> (slow drift on top of the camera;
// screen labels like [LIDAH] stay outside), map a Dive hole through sc.pt() and r0 · sc.z; Dive + LobeWipe stay the
// scene changes (signature). Svg carries the HalusDefs; draw <TubLight /> over the scene, under Caption.

export const TUB = {
  wall: '#F28B9B', fold: '#E2667C', dark: '#B8475D', lining: '#FFC4CC', plasma: '#FFE3B8', plasmaDeep: '#FBD3A4',
  blood: '#E8404B', bloodShade: '#C8303E', bloodHi: '#FF6F78', dimple: '#D23443', blush: '#FF8C96',
  cyto: '#FFB38A', cytoShade: '#F0966B', cytoHi: '#FFCBAE',
  green: '#6CCB4C', greenShade: '#4FA637', greenSpot: '#58B23C',
  purple: '#8F5BD6', purpleShade: '#7143BB', purpleSpot: '#7D4CC6',
  white: '#FFFFFF', whiteShade: '#E9DDE6', ink: '#4A1E2C',
  cloak: '#D02C40', cloakShade: '#A81F33', gold: '#FFC93C', goldShade: '#E9A52A',
  cap: '#C98B4E', capShade: '#A86C35', lens: '#CFEFFF', sweat: '#BFE9FF',
  sky: '#8ED1E6', skyBand: '#A3DCEC', skin: '#F2B48C', skinShade: '#DE9670', hair: '#3B2230', shirt: '#2FB3A3', shirtShade: '#25968A',
  ghost: '#F9CBA8',
};
const T = TUB;
export const HEAD = "'Tub Head', sans-serif";
export const TEXT = "'Tub Text', sans-serif";
export const OUTLINE = 5;

// ---------- motion ----------
const OUTC = Easing.out(Easing.cubic);
const INOUT = Easing.inOut(Easing.quad);
const INC = Easing.in(Easing.cubic);
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lin = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const eio = (t: number, a: number, b: number) => INOUT(lin(t, a, b));
export const eout = (t: number, a: number, b: number) => OUTC(lin(t, a, b));
export const ein = (t: number, a: number, b: number) => INC(lin(t, a, b));
/** Pop: 0 → 1.14 → 1. */
export const pop = (t: number, at: number, d = 0.36) => {
  if (t <= at) return 0;
  const k = (t - at) / d;
  if (k >= 1) return 1;
  if (k < 0.58) return 1.14 * OUTC(k / 0.58);
  return lerp(1.14, 1, INOUT((k - 0.58) / 0.42));
};
/** Pop in at `at`, shrink away at `out`. */
export const popIO = (t: number, at: number, out?: number, d = 0.36) => {
  const q = pop(t, at, d);
  if (out === undefined || t <= out) return q;
  const k = clamp01((t - out) / 0.26);
  return q * (k < 0.3 ? lerp(1, 1.08, k / 0.3) : lerp(1.08, 0, INC((k - 0.3) / 0.7)));
};
/** Squash pulse after an impact: [sx, sy]. */
export const squash = (t: number, at: number, amt = 0.16, dur = 0.45): [number, number] => {
  const k = (t - at) / dur;
  const s = k > 0 && k < 1 ? Math.sin(k * Math.PI * 2) * amt * (1 - k) : 0;
  return [1 + s, 1 - s];
};
/** Deterministic eyelid closure 0→1→0 (0.11 s) on a per-character rhythm. */
export const blink = (t: number, seed: number) => {
  if (t < 0.4) return 0;
  const per = 2.3 + rnd(seed) * 1.5;
  const ph = (t + rnd(seed + 1) * per) % per;
  return ph < 0.11 ? Math.sin((ph / 0.11) * Math.PI) : 0;
};
/** Gentle breathing [sx, sy] + bob (px). */
export const breathe = (t: number, seed: number, amt = 0.018) => {
  const s = Math.sin(t * 3.1 + seed * 1.7);
  return {sx: 1 + s * amt, sy: 1 - s * amt, bob: Math.sin(t * 2.4 + seed) * 5};
};

// ---------- HALUS (v1.16) ----------
/** Drift for scene i on screen from `from` to `to` (s): transform for the set group (undefined when HALUS is off), plus
 *  pt() mapping an un-drifted screen point to where it is drawn and the zoom z (for Dive holes). */
export const tubScene = (t: number, o: {i: number; from: number; to: number; W: number; H: number; fx?: number; fy?: number; amount?: number}) => {
  if (halusLevel('TUBUH') === 'off') return {transform: undefined as string | undefined, z: 1, pt: (p: [number, number]): [number, number] => p};
  const {z, px} = halusDrift(t, o.from, o.to, o.i, o.amount ?? 1);
  const fx = o.fx ?? o.W / 2, fy = o.fy ?? o.H * 0.46;
  return {transform: zoomAbout(z, fx, fy, px) as string | undefined, z, pt: ([x, y]: [number, number]): [number, number] => [fx + px + z * (x - fx), fy + z * (y - fy)]};
};
/** HALUS full: soft top light + vignette over the scene (null when off). Draw after the scene, before Caption. */
export const TubLight: React.FC<{strength?: number}> = ({strength = 0.8}) => (useHalus('TUBUH').full ? <HalusLightDiv ink={TUB.ink} strength={strength} /> : null);

// ---------- fonts ----------
const FONTS = ["800 80px 'Tub Head'", "900 60px 'Tub Text'"];
export const useTubFonts = () => {
  const [handle] = useState(() => delayRender('tubuh fonts'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all(FONTS.map((f) => document.fonts.load(f))).then(() => setReady(true)).catch(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready) continueRender(handle);
  }, [ready, handle]);
  return ready;
};

// ---------- geometry ----------
const rad = (d: number) => (d * Math.PI) / 180;
/** Crescent band inside a circle of radius r, from angle a0 to a1 (deg, SVG angles), thickness k·r. */
export const crescent = (r: number, a0: number, a1: number, k: number) => {
  const d = rad(a1 - a0);
  const x0 = Math.cos(rad(a0)) * r, y0 = Math.sin(rad(a0)) * r, x1 = Math.cos(rad(a1)) * r, y1 = Math.sin(rad(a1)) * r;
  const c = 2 * r * Math.sin(d / 2);
  const s = Math.max(1, r * (1 - k) - r * Math.cos(d / 2));
  const R = (c * c) / 4 / (2 * s) + s / 2;
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R.toFixed(1)} ${R.toFixed(1)} 0 0 0 ${x0.toFixed(1)} ${y0.toFixed(1)} Z`;
};
/** Smooth wobbly blob (closed) around the origin. */
export const blobPath = (r: number, lobes: number, amp: number, phase = 0, n = 40) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + amp * Math.sin(a * lobes + phase));
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  return spline(pts, true);
};
/** Rounded mound (a hill) standing on y=0, width w, height h. */
export const moundPath = (w: number, h: number) =>
  `M ${-w / 2} 0 C ${-w / 2} ${-h * 0.5} ${-w * 0.36} ${-h} 0 ${-h} C ${w * 0.36} ${-h} ${w / 2} ${-h * 0.5} ${w / 2} 0 Z`;

// ---------- face parts ----------
export type Mood = 'happy' | 'sad' | 'shock' | 'smug' | 'jealous' | 'sneaky' | 'curious' | 'cheer';
export const LID: Record<Mood, number> = {happy: 0, sad: 0.32, shock: 0, smug: 0.45, jealous: 0.42, sneaky: 0.35, curious: 0.1, cheer: 0};

/** One cartoon eye: white, pupil, eyelid (body colour, clipped), outline. */
export const Eye: React.FC<{id: string; x: number; y: number; rx: number; ry: number; look?: [number, number]; lid?: number; tilt?: number; body: string; pupil?: number}> = ({
  id, x, y, rx, ry, look = [0, 0], lid = 0, tilt = 0, body, pupil = 0.42,
}) => {
  const h = ry * 2 * clamp01(lid);
  const ly = y - ry + h;
  return (
    <g>
      <clipPath id={id}><ellipse cx={x} cy={y} rx={rx} ry={ry} /></clipPath>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={T.white} />
      <circle cx={x + look[0] * rx * 0.42} cy={y + look[1] * ry * 0.42} r={rx * pupil} fill={T.ink} />
      <circle cx={x + look[0] * rx * 0.42 - rx * 0.14} cy={y + look[1] * ry * 0.42 - rx * 0.16} r={rx * 0.13} fill={T.white} />
      {h > 0.5 && (
        <g clipPath={`url(#${id})`}>
          <g transform={`rotate(${tilt} ${x} ${ly})`}>
            <rect x={x - rx * 1.6} y={y - ry * 2.2} width={rx * 3.2} height={ly - (y - ry * 2.2)} fill={body} />
            <line x1={x - rx * 1.6} y1={ly} x2={x + rx * 1.6} y2={ly} stroke={T.ink} strokeWidth={4.5} />
          </g>
        </g>
      )}
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="none" stroke={T.ink} strokeWidth={4.5} />
    </g>
  );
};

/** Mouth at (0, y), width w. */
export const Mouth: React.FC<{mood: Mood; y: number; w: number; tongue?: string; open?: number}> = ({mood, y, w, tongue = T.blush, open = 1}) => {
  const sw = Math.max(4.5, w * 0.11);
  if (mood === 'shock' || mood === 'cheer') {
    const ry = w * (mood === 'shock' ? 0.42 : 0.3) * open, rx = w * (mood === 'shock' ? 0.3 : 0.42);
    return (
      <g>
        {mood === 'shock'
          ? <ellipse cx={0} cy={y + ry * 0.4} rx={rx} ry={Math.max(2, ry)} fill={T.ink} />
          : <path d={`M ${-rx} ${y} Q 0 ${y + ry * 2.4} ${rx} ${y} Z`} fill={T.ink} stroke={T.ink} strokeWidth={sw * 0.6} strokeLinejoin="round" />}
        <ellipse cx={0} cy={y + ry * (mood === 'shock' ? 0.9 : 0.85)} rx={rx * 0.55} ry={Math.max(1, ry * 0.35)} fill={tongue} />
      </g>
    );
  }
  if (mood === 'sad') return <path d={`M ${-w / 2} ${y + w * 0.18} Q 0 ${y - w * 0.22} ${w / 2} ${y + w * 0.18}`} stroke={T.ink} strokeWidth={sw} fill="none" strokeLinecap="round" />;
  if (mood === 'jealous') return <path d={`M ${-w / 2} ${y + w * 0.06} q ${w / 6} ${-w * 0.14} ${w / 3} 0 t ${w / 3} 0 t ${w / 3} 0`} stroke={T.ink} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  if (mood === 'smug') return <path d={`M ${-w / 2} ${y + w * 0.02} Q ${w * 0.1} ${y + w * 0.3} ${w / 2} ${y - w * 0.16}`} stroke={T.ink} strokeWidth={sw} fill="none" strokeLinecap="round" />;
  if (mood === 'sneaky') {
    return (
      <g>
        <path d={`M ${-w * 0.6} ${y - w * 0.05} Q 0 ${y + w * 0.62} ${w * 0.6} ${y - w * 0.05} Z`} fill={T.ink} stroke={T.ink} strokeWidth={sw * 0.6} strokeLinejoin="round" />
        <path d={`M ${-w * 0.48} ${y + w * 0.02} L ${w * 0.48} ${y + w * 0.02} L ${w * 0.42} ${y + w * 0.15} L ${-w * 0.42} ${y + w * 0.15} Z`} fill={T.white} />
      </g>
    );
  }
  if (mood === 'curious') return <ellipse cx={w * 0.08} cy={y + w * 0.05} rx={w * 0.14} ry={w * 0.12} fill={T.ink} />;
  return <path d={`M ${-w / 2} ${y - w * 0.04} Q 0 ${y + w * 0.4} ${w / 2} ${y - w * 0.04}`} stroke={T.ink} strokeWidth={sw} fill="none" strokeLinecap="round" />;
};

/** Brows for a mood (eyes at ±ex, y ey, eye radius er). */
export const Brows: React.FC<{mood: Mood; ex: number; ey: number; er: number}> = ({mood, ex, ey, er}) => {
  const sw = Math.max(4.5, er * 0.22);
  const by = ey - er * 1.45;
  if (mood === 'sad') return <g>{[-1, 1].map((s) => <path key={s} d={`M ${s * (ex - er * 0.7)} ${by - er * 0.25} L ${s * (ex + er * 0.7)} ${by + er * 0.2}`} stroke={T.ink} strokeWidth={sw} strokeLinecap="round" />)}</g>;
  if (mood === 'jealous' || mood === 'sneaky') return <g>{[-1, 1].map((s) => <path key={s} d={`M ${s * (ex - er * 0.8)} ${by + er * 0.35} L ${s * (ex + er * 0.7)} ${by - er * 0.15}`} stroke={T.ink} strokeWidth={sw} strokeLinecap="round" />)}</g>;
  if (mood === 'shock') return <g>{[-1, 1].map((s) => <path key={s} d={`M ${s * (ex - er * 0.7)} ${by - er * 0.2} Q ${s * ex} ${by - er * 0.6} ${s * (ex + er * 0.7)} ${by - er * 0.2}`} stroke={T.ink} strokeWidth={sw} fill="none" strokeLinecap="round" />)}</g>;
  if (mood === 'smug') return <g>{[-1, 1].map((s) => <path key={s} d={`M ${s * (ex - er * 0.7)} ${by + (s < 0 ? -er * 0.2 : er * 0.15)} L ${s * (ex + er * 0.7)} ${by + (s < 0 ? -er * 0.05 : -er * 0.25)}`} stroke={T.ink} strokeWidth={sw} strokeLinecap="round" />)}</g>;
  if (mood === 'curious') return <g><path d={`M ${-(ex + er * 0.7)} ${by - er * 0.1} L ${-(ex - er * 0.7)} ${by - er * 0.1}`} stroke={T.ink} strokeWidth={sw} strokeLinecap="round" /><path d={`M ${ex - er * 0.7} ${by - er * 0.15} Q ${ex} ${by - er * 0.7} ${ex + er * 0.7} ${by - er * 0.3}`} stroke={T.ink} strokeWidth={sw} fill="none" strokeLinecap="round" /></g>;
  return null;
};

/** Stick arm with a round hand; ang 0 = straight out sideways, + = raised. */
export const Arm: React.FC<{side: -1 | 1; x: number; y: number; len: number; ang: number; w: number; hand: string}> = ({side, x, y, len, ang, w, hand}) => {
  const a = rad(-ang);
  const ex = x + side * Math.cos(a) * len, ey = y + Math.sin(a) * len;
  const mx = x + side * Math.cos(a) * len * 0.55, my = y + Math.sin(a) * len * 0.55 + len * 0.12;
  return (
    <g>
      <path d={`M ${x} ${y} Q ${mx} ${my} ${ex} ${ey}`} stroke={T.ink} strokeWidth={w} fill="none" strokeLinecap="round" />
      <circle cx={ex} cy={ey} r={w * 1.05} fill={hand} stroke={T.ink} strokeWidth={4} />
    </g>
  );
};

// ---------- props ----------
/** One day-bubble (plasma ball with a flat highlight). */
export const DayBubble: React.FC<{x: number; y: number; r: number; s?: number; sw?: number}> = ({x, y, r, s = 1, sw = 3.5}) =>
  s <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={r} fill={T.plasma} stroke={T.ink} strokeWidth={sw} />
      <circle cx={-r * 0.32} cy={-r * 0.32} r={r * 0.26} fill={T.white} />
    </g>
  );

/** 7-column grid positions for n day-dots (calendar rows), centred on (0,0). */
export const dotGrid = (n: number, step: number) => {
  const rows = Math.ceil(n / 7);
  return Array.from({length: n}, (_, i) => {
    const row = Math.floor(i / 7), col = i % 7;
    return {x: (col - 3) * step, y: (row - (rows - 1) / 2) * step, row};
  });
};

// ---------- characters ----------
/** The 31 day-slot positions on a blood cell's rim (unit radius), slot 0 at the top, clockwise. */
export const RING: [number, number][] = Array.from({length: 31}, (_, i) => {
  const an = ((-90 + 6 + i * (360 / 31)) * Math.PI) / 180;
  return [Math.cos(an) * 0.8, Math.sin(an) * 0.8];
});
export type CellProps = {
  id: string; t: number; x: number; y: number; r: number; seed: number; mood: Mood;
  look?: [number, number]; armL?: number; armR?: number; dots?: number; dotScale?: (i: number, row: number) => number;
  tag?: string; sx?: number; sy?: number; rot?: number; arms?: boolean;
};
/** Red blood cell character: biconcave dimple holding its day-dots, big eyes, little arms. Origin = centre. */
export const BloodCell: React.FC<CellProps> = ({id, t, x, y, r, seed, mood, look = [0, 0], armL = -20, armR = -20, dots = 0, dotScale, tag, sx = 1, sy = 1, rot = 0, arms = true}) => {
  const br = breathe(t, seed);
  const lid = Math.max(LID[mood], blink(t, seed));
  const er = r * 0.2;
  const ex = r * 0.3, ey = -r * 0.2;
  return (
    <g transform={`translate(${x} ${y + br.bob}) rotate(${rot}) scale(${sx * br.sx} ${sy * br.sy})`}>
      {arms && <Arm side={-1} x={-r * 0.9} y={r * 0.12} len={r * 0.5} ang={armL} w={Math.max(7, r * 0.075)} hand={T.blood} />}
      {arms && <Arm side={1} x={r * 0.9} y={r * 0.12} len={r * 0.5} ang={armR} w={Math.max(7, r * 0.075)} hand={T.blood} />}
      <circle r={r} fill={T.blood} />
      <path d={crescent(r, -15, 150, 0.15)} fill={T.bloodShade} />
      <path d={crescent(r, 195, 260, 0.1)} fill={T.bloodHi} />
      {/* 31 day-slots round the rim (the biconcave ring); filled slots hold day-bubbles, empty ones show a socket */}
      {dots > 0 && RING.map(([cx, cy], i) => <circle key={`s${i}`} cx={cx * r} cy={cy * r} r={r * 0.042} fill={T.bloodShade} />)}
      {dots > 0 && RING.map(([cx, cy], i) => {
        const s = i < dots ? (dotScale ? dotScale(i, 0) : 1) : 0;
        return s > 0.01 ? <DayBubble key={i} x={cx * r} y={cy * r} r={r * 0.055} s={s} sw={Math.max(1.6, r * 0.014)} /> : null;
      })}
      <circle r={r} fill="none" stroke={T.ink} strokeWidth={OUTLINE} />
      <circle cx={-r * 0.5} cy={r * 0.06} r={r * 0.09} fill={T.blush} />
      <circle cx={r * 0.5} cy={r * 0.06} r={r * 0.09} fill={T.blush} />
      <Eye id={`${id}l`} x={-ex} y={ey} rx={er * 0.86} ry={er} look={look} lid={lid} tilt={mood === 'sad' ? -10 : mood === 'jealous' ? 6 : 0} body={T.blood} />
      <Eye id={`${id}r`} x={ex} y={ey} rx={er * 0.86} ry={er} look={look} lid={lid} tilt={mood === 'sad' ? 10 : mood === 'jealous' ? -6 : 0} body={T.blood} />
      <Brows mood={mood} ex={ex} ey={ey} er={er} />
      <Mouth mood={mood} y={r * 0.08} w={r * 0.32} tongue={T.blush} />
      {tag && (
        <g transform={`translate(0 ${-r - r * 0.42})`}>
          <rect x={-r * 0.62} y={-r * 0.24} width={r * 1.24} height={r * 0.48} rx={r * 0.2} fill={T.white} stroke={T.ink} strokeWidth={4} />
          <text x={0} y={r * 0.13} textAnchor="middle" fill={T.ink} style={{fontFamily: HEAD, fontWeight: 800, fontSize: r * 0.36}}>{tag}</text>
        </g>
      )}
    </g>
  );
};

/** Knobbed virus spikes around radius r (drawn behind the body). */
const Spikes: React.FC<{r: number; n: number; color: string; wig: number; len?: number; skipBottom?: boolean}> = ({r, n, color, wig, len = 0.3, skipBottom = false}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const a = (i / n) * Math.PI * 2 + wig;
      const deg = (((a * 180) / Math.PI) % 360 + 360) % 360;
      if (skipBottom && deg > 40 && deg < 140) return null;
      const x0 = Math.cos(a) * r * 0.85, y0 = Math.sin(a) * r * 0.85;
      const x1 = Math.cos(a) * r * (1 + len), y1 = Math.sin(a) * r * (1 + len);
      return (
        <g key={i}>
          <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={T.ink} strokeWidth={Math.max(6, r * 0.09)} strokeLinecap="round" />
          <circle cx={x1} cy={y1} r={Math.max(7, r * 0.12)} fill={color} stroke={T.ink} strokeWidth={4} />
        </g>
      );
    })}
  </g>
);

export type GermProps = {
  id: string; t: number; x: number; y: number; r: number; seed: number; mood: Mood; kind?: 'green' | 'purple';
  look?: [number, number]; armL?: number; armR?: number; mask?: boolean; sx?: number; sy?: number; rot?: number; sack?: number; sackFill?: number;
};
/** Germ / virus character (green or purple), optional burglar mask and a stolen-days sack (sack = 0..1 scale). */
export const Germ: React.FC<GermProps> = ({id, t, x, y, r, seed, mood, kind = 'green', look = [0, 0], armL = 10, armR = 10, mask = false, sx = 1, sy = 1, rot = 0, sack = 0, sackFill = 0}) => {
  const br = breathe(t, seed, 0.03);
  const body = kind === 'green' ? T.green : T.purple, shade = kind === 'green' ? T.greenShade : T.purpleShade, spot = kind === 'green' ? T.greenSpot : T.purpleSpot;
  const knob = kind === 'green' ? T.purple : T.green;
  const lid = Math.max(LID[mood], blink(t, seed));
  const er = r * 0.24, ex = r * 0.32, ey = -r * 0.16;
  return (
    <g transform={`translate(${x} ${y + br.bob}) rotate(${rot}) scale(${sx * br.sx} ${sy * br.sy})`}>
      <Spikes r={r} n={9} color={knob} wig={Math.sin(t * 2.2 + seed) * 0.06 + seed} />
      {sack > 0.01 && (
        <g transform={`translate(${r * 1.02} ${-r * 0.78}) scale(${sack * 1.25}) rotate(18)`}>
          <path d={`M ${-r * 0.5} ${-r * 0.1} Q ${-r * 0.85} ${r * 0.9} 0 ${r * 0.92} Q ${r * 0.85} ${r * 0.9} ${r * 0.5} ${-r * 0.1} Z`} fill={T.purple} stroke={T.ink} strokeWidth={4.5} strokeLinejoin="round" />
          {Array.from({length: Math.round(sackFill * 3)}).map((_, i) => <DayBubble key={i} x={(i - 1) * r * 0.24} y={-r * 0.16 - (i % 2) * r * 0.1} r={r * 0.13} />)}
          <rect x={-r * 0.36} y={-r * 0.16} width={r * 0.72} height={r * 0.16} rx={r * 0.06} fill={T.purpleShade} stroke={T.ink} strokeWidth={4} />
          <text x={0} y={r * 0.5} textAnchor="middle" fill={T.white} style={{fontFamily: HEAD, fontWeight: 800, fontSize: r * 0.3}}>HARI</text>
        </g>
      )}
      <Arm side={-1} x={-r * 0.95} y={r * 0.12} len={r * 0.85} ang={armL} w={Math.max(7, r * 0.1)} hand={body} />
      <Arm side={1} x={r * 0.95} y={r * 0.12} len={r * 0.85} ang={armR} w={Math.max(7, r * 0.1)} hand={body} />
      <circle r={r} fill={body} />
      <path d={crescent(r, -10, 150, 0.16)} fill={shade} />
      <circle cx={-r * 0.5} cy={r * 0.42} r={r * 0.13} fill={spot} />
      <circle cx={r * 0.5} cy={-r * 0.62} r={r * 0.09} fill={spot} />
      <circle cx={r * 0.12} cy={r * 0.62} r={r * 0.08} fill={spot} />
      <circle r={r} fill="none" stroke={T.ink} strokeWidth={OUTLINE} />
      {mask && <rect x={-r * 0.78} y={ey - er * 1.25} width={r * 1.56} height={er * 2.5} rx={er * 1.1} fill={T.ink} />}
      <Eye id={`${id}l`} x={-ex} y={ey} rx={er * 0.86} ry={er} look={look} lid={lid} tilt={mood === 'sneaky' ? 12 : 0} body={mask ? T.ink : body} />
      <Eye id={`${id}r`} x={ex} y={ey} rx={er * 0.86} ry={er} look={look} lid={lid} tilt={mood === 'sneaky' ? -12 : 0} body={mask ? T.ink : body} />
      {!mask && <Brows mood={mood} ex={ex} ey={ey} er={er} />}
      <Mouth mood={mood} y={r * 0.3} w={r * 0.34} />
    </g>
  );
};

/** ROMULUS as the king germ: purple virus, gold laurel crown, red cloak with white trim, curled moustache. */
export const KingGerm: React.FC<{id: string; t: number; x: number; y: number; r: number; mood: Mood; look?: [number, number]; armL?: number; armR?: number; sx?: number; sy?: number; holdBubble?: boolean}> = ({
  id, t, x, y, r, mood, look = [0, 0], armL = 20, armR = 40, sx = 1, sy = 1, holdBubble = true,
}) => {
  const br = breathe(t, 31, 0.022);
  const lid = Math.max(LID[mood], blink(t, 31));
  const er = r * 0.22, ex = r * 0.3, ey = -r * 0.12;
  const sway = Math.sin(t * 2.1) * 2;
  return (
    <g transform={`translate(${x} ${y + br.bob}) scale(${sx * br.sx} ${sy * br.sy})`}>
      {/* cloak behind: drapes from the shoulders, curved hem resting at y = 1.08 r */}
      <g transform={`rotate(${sway * 0.5})`}>
        <path d={`M ${-r * 0.7} ${-r * 0.5} C ${-r * 1.25} ${-r * 0.1} ${-r * 1.42} ${r * 0.6} ${-r * 1.32} ${r * 0.98} Q ${-r * 1.3} ${r * 1.08} ${-r * 1.18} ${r * 1.08} L ${r * 1.18} ${r * 1.08} Q ${r * 1.3} ${r * 1.08} ${r * 1.32} ${r * 0.98} C ${r * 1.42} ${r * 0.6} ${r * 1.25} ${-r * 0.1} ${r * 0.7} ${-r * 0.5} Z`} fill={T.cloak} />
        <path d={`M ${r * 1.0} ${-r * 0.1} C ${r * 1.3} ${r * 0.35} ${r * 1.38} ${r * 0.7} ${r * 1.32} ${r * 0.98} Q ${r * 1.3} ${r * 1.08} ${r * 1.18} ${r * 1.08} L ${r * 0.9} ${r * 1.08} C ${r * 1.08} ${r * 0.7} ${r * 1.08} ${r * 0.3} ${r * 1.0} ${-r * 0.1} Z`} fill={T.cloakShade} />
        <path d={`M ${-r * 0.7} ${-r * 0.5} C ${-r * 1.25} ${-r * 0.1} ${-r * 1.42} ${r * 0.6} ${-r * 1.32} ${r * 0.98} Q ${-r * 1.3} ${r * 1.08} ${-r * 1.18} ${r * 1.08} L ${r * 1.18} ${r * 1.08} Q ${r * 1.3} ${r * 1.08} ${r * 1.32} ${r * 0.98} C ${r * 1.42} ${r * 0.6} ${r * 1.25} ${-r * 0.1} ${r * 0.7} ${-r * 0.5} Z`} fill="none" stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      </g>
      <Spikes r={r} n={11} color={T.green} wig={0.3 + Math.sin(t * 1.8) * 0.04} len={0.24} skipBottom />
      <Arm side={-1} x={-r * 0.9} y={r * 0.25} len={r * 0.48} ang={armL} w={Math.max(8, r * 0.08)} hand={T.purple} />
      <circle r={r} fill={T.purple} />
      <path d={crescent(r, -10, 150, 0.15)} fill={T.purpleShade} />
      <circle cx={-r * 0.55} cy={r * 0.38} r={r * 0.11} fill={T.purpleSpot} />
      <circle cx={r * 0.58} cy={r * 0.48} r={r * 0.08} fill={T.purpleSpot} />
      <circle r={r} fill="none" stroke={T.ink} strokeWidth={OUTLINE} />
      {/* white fur collar */}
      <path d={`M ${-r * 0.82} ${r * 0.5} Q 0 ${r * 1.02} ${r * 0.82} ${r * 0.5} L ${r * 0.7} ${r * 0.78} Q 0 ${r * 1.22} ${-r * 0.7} ${r * 0.78} Z`} fill={T.white} stroke={T.ink} strokeWidth={4.5} strokeLinejoin="round" />
      {[-0.45, -0.15, 0.15, 0.45].map((k, i) => <circle key={i} cx={k * r} cy={r * (0.86 + (Math.abs(k) < 0.2 ? 0.1 : 0))} r={r * 0.035} fill={T.ink} />)}
      <Eye id={`${id}l`} x={-ex} y={ey} rx={er * 0.86} ry={er} look={look} lid={lid} tilt={8} body={T.purple} />
      <Eye id={`${id}r`} x={ex} y={ey} rx={er * 0.86} ry={er} look={look} lid={lid} tilt={-8} body={T.purple} />
      <Brows mood={mood} ex={ex} ey={ey} er={er} />
      {/* curled moustache + smirk */}
      <path d={`M 0 ${r * 0.18} q ${-r * 0.2} ${-r * 0.08} ${-r * 0.36} ${r * 0.02} q ${-r * 0.1} ${r * 0.08} ${-r * 0.02} ${r * 0.12}`} stroke={T.ink} strokeWidth={Math.max(6, r * 0.06)} fill="none" strokeLinecap="round" />
      <path d={`M 0 ${r * 0.18} q ${r * 0.2} ${-r * 0.08} ${r * 0.36} ${r * 0.02} q ${r * 0.1} ${r * 0.08} ${r * 0.02} ${r * 0.12}`} stroke={T.ink} strokeWidth={Math.max(6, r * 0.06)} fill="none" strokeLinecap="round" />
      <Mouth mood={mood === 'smug' ? 'smug' : mood} y={r * 0.34} w={r * 0.26} />
      {/* right arm holding a stolen day-bubble */}
      <Arm side={1} x={r * 0.9} y={r * 0.2} len={r * 0.46} ang={armR} w={Math.max(8, r * 0.08)} hand={T.purple} />
      {holdBubble && <DayBubble x={r * 0.9 + Math.cos(rad(-armR)) * r * 0.46 + r * 0.12} y={r * 0.2 + Math.sin(rad(-armR)) * r * 0.46 - r * 0.2} r={r * 0.2} />}
      {/* gold laurel wreath hugging the top of the head */}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <path d={`M ${sd * r * 0.06} ${-r * 0.97} A ${r * 0.97} ${r * 0.97} 0 0 ${sd > 0 ? 1 : 0} ${sd * r * 0.8} ${-r * 0.55}`} stroke={T.ink} strokeWidth={Math.max(9, r * 0.075)} fill="none" strokeLinecap="round" />
          <path d={`M ${sd * r * 0.06} ${-r * 0.97} A ${r * 0.97} ${r * 0.97} 0 0 ${sd > 0 ? 1 : 0} ${sd * r * 0.8} ${-r * 0.55}`} stroke={T.goldShade} strokeWidth={Math.max(4, r * 0.035)} fill="none" strokeLinecap="round" />
          {[0, 1, 2, 3, 4].map((j) => {
            const an = -90 + sd * (12 + j * 12);
            const ca = rad(an);
            const px = Math.cos(ca) * r * 0.97, py = Math.sin(ca) * r * 0.97;
            const out = j % 2 ? 1.0 : -1.0;
            const lx = px + Math.cos(ca) * r * 0.1 * out, ly = py + Math.sin(ca) * r * 0.1 * out;
            return <ellipse key={j} cx={lx} cy={ly} rx={r * 0.075} ry={r * 0.16} fill={j % 2 ? T.gold : T.goldShade} stroke={T.ink} strokeWidth={4} transform={`rotate(${an + 90 + sd * 50 * out} ${lx} ${ly})`} />;
          })}
        </g>
      ))}
      <circle cx={0} cy={-r * 0.97} r={r * 0.08} fill={T.blood} stroke={T.ink} strokeWidth={4} />
    </g>
  );
};

/** White blood cell detective: lumpy white cell, deerstalker cap, magnifying glass. Origin = centre. */
export const Detective: React.FC<{id: string; t: number; x: number; y: number; r: number; mood: Mood; look?: [number, number]; lens?: number; armL?: number; sx?: number; sy?: number; rot?: number}> = ({
  id, t, x, y, r, mood, look = [0, 0], lens = 20, armL = -10, sx = 1, sy = 1, rot = 0,
}) => {
  const br = breathe(t, 17, 0.02);
  const lid = Math.max(LID[mood], blink(t, 17));
  const body = blobPath(r, 7, 0.045, t * 0.8);
  const shade = blobPath(r * 0.93, 7, 0.045, t * 0.8);
  const er = r * 0.22, ex = r * 0.3, ey = -r * 0.08;
  const la = rad(-lens);
  const hx = r * 0.86 + Math.cos(la) * r * 0.55, hy = r * 0.15 + Math.sin(la) * r * 0.55;
  return (
    <g transform={`translate(${x} ${y + br.bob}) rotate(${rot}) scale(${sx * br.sx} ${sy * br.sy})`}>
      <Arm side={-1} x={-r * 0.88} y={r * 0.2} len={r * 0.5} ang={armL} w={Math.max(8, r * 0.08)} hand={T.white} />
      <path d={body} fill={T.whiteShade} />
      <path d={shade} fill={T.white} transform={`translate(${-r * 0.06} ${-r * 0.07})`} />
      <path d={body} fill="none" stroke={T.ink} strokeWidth={OUTLINE} />
      {/* lobed nucleus hint */}
      {[-0.28, 0, 0.28].map((k, i) => <circle key={i} cx={k * r} cy={r * 0.52 - Math.abs(k) * r * 0.2} r={r * 0.13} fill="#E7D8F6" />)}
      <circle cx={-r * 0.56} cy={r * 0.12} r={r * 0.09} fill={T.blush} />
      <circle cx={r * 0.56} cy={r * 0.12} r={r * 0.09} fill={T.blush} />
      <Eye id={`${id}l`} x={-ex} y={ey} rx={er * 0.86} ry={er} look={look} lid={lid} body={T.white} />
      <Eye id={`${id}r`} x={ex} y={ey} rx={er * 0.86} ry={er} look={look} lid={lid} body={T.white} />
      <Brows mood={mood} ex={ex} ey={ey} er={er} />
      <Mouth mood={mood} y={r * 0.24} w={r * 0.24} />
      {/* deerstalker cap */}
      <g transform={`translate(0 ${-r * 0.78})`}>
        <path d={`M ${-r * 0.62} ${r * 0.12} Q ${-r * 0.62} ${-r * 0.5} 0 ${-r * 0.52} Q ${r * 0.62} ${-r * 0.5} ${r * 0.62} ${r * 0.12} Z`} fill={T.cap} stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
        <path d={`M ${-r * 0.3} ${-r * 0.43} Q 0 ${-r * 0.05} ${r * 0.3} ${-r * 0.43}`} stroke={T.capShade} strokeWidth={r * 0.06} fill="none" />
        <path d={`M ${-r * 0.62} ${r * 0.04} L ${r * 0.62} ${r * 0.04} L ${r * 0.64} ${r * 0.16} L ${-r * 0.64} ${r * 0.16} Z`} fill={T.capShade} stroke={T.ink} strokeWidth={4} strokeLinejoin="round" />
        <path d={`M ${r * 0.5} ${r * 0.12} Q ${r * 0.98} ${r * 0.1} ${r * 0.9} ${r * 0.26} Q ${r * 0.7} ${r * 0.24} ${r * 0.42} ${r * 0.18} Z`} fill={T.cap} stroke={T.ink} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={0} cy={-r * 0.52} r={r * 0.07} fill={T.capShade} stroke={T.ink} strokeWidth={4} />
      </g>
      {/* magnifier arm */}
      <path d={`M ${r * 0.86} ${r * 0.15} L ${hx} ${hy}`} stroke={T.ink} strokeWidth={Math.max(8, r * 0.08)} strokeLinecap="round" />
      <g transform={`translate(${hx} ${hy}) rotate(${-lens + 30})`}>
        <rect x={-r * 0.06} y={-r * 0.06} width={r * 0.36} height={r * 0.12} rx={r * 0.05} fill={T.capShade} stroke={T.ink} strokeWidth={4} transform={`rotate(180)`} />
        <circle cx={r * 0.34} cy={0} r={r * 0.3} fill={T.lens} stroke={T.ink} strokeWidth={r * 0.07} />
        <path d={crescent(r * 0.22, 200, 260, 0.35)} transform={`translate(${r * 0.34} 0)`} fill={T.white} />
      </g>
      <circle cx={hx} cy={hy} r={Math.max(8, r * 0.085)} fill={T.white} stroke={T.ink} strokeWidth={4} />
    </g>
  );
};

/** Outside cartoon person (bust), head centre (0,0), head radius r. Cutaway drawn by the caller. */
export const Person: React.FC<{t: number; r: number; mood: Mood; look?: [number, number]}> = ({t, r, mood, look = [0, 0]}) => {
  const br = breathe(t, 5, 0.008);
  const lid = Math.max(LID[mood], blink(t, 5));
  const er = r * 0.15, ex = r * 0.34, ey = r * 0.08;
  return (
    <g transform={`translate(0 ${br.bob * 0.6})`}>
      {/* torso */}
      <path d={`M ${-r * 1.55} ${r * 3.4} Q ${-r * 1.5} ${r * 1.15} ${-r * 0.5} ${r * 1.02} L ${r * 0.5} ${r * 1.02} Q ${r * 1.5} ${r * 1.15} ${r * 1.55} ${r * 3.4} Z`} fill={T.shirt} stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      <path d={`M ${r * 0.9} ${r * 1.25} Q ${r * 1.4} ${r * 1.4} ${r * 1.5} ${r * 3.4} L ${r * 1.2} ${r * 3.4} Q ${r * 1.15} ${r * 1.6} ${r * 0.85} ${r * 1.3} Z`} fill={T.shirtShade} />
      <rect x={-r * 0.24} y={r * 0.8} width={r * 0.48} height={r * 0.32} fill={T.skinShade} stroke={T.ink} strokeWidth={OUTLINE} />
      <path d={`M ${-r * 0.42} ${r * 1.04} Q 0 ${r * 1.38} ${r * 0.42} ${r * 1.04}`} fill={T.skin} stroke={T.ink} strokeWidth={OUTLINE} />
      {/* ears */}
      {[-1, 1].map((s) => <ellipse key={s} cx={s * r * 0.98} cy={r * 0.12} rx={r * 0.16} ry={r * 0.22} fill={T.skin} stroke={T.ink} strokeWidth={OUTLINE} />)}
      {/* head */}
      <circle r={r} fill={T.skin} />
      <path d={crescent(r, -20, 140, 0.12)} fill={T.skinShade} />
      <circle r={r} fill="none" stroke={T.ink} strokeWidth={OUTLINE} />
      {/* hair */}
      <path d={`M ${-r * 0.98} ${-r * 0.05} Q ${-r * 1.08} ${-r * 1.05} ${-r * 0.05} ${-r * 1.08} Q ${r * 0.95} ${-r * 1.1} ${r * 1.0} ${-r * 0.12} Q ${r * 0.8} ${-r * 0.52} ${r * 0.3} ${-r * 0.56} Q ${r * 0.12} ${-r * 0.4} ${-r * 0.1} ${-r * 0.58} Q ${-r * 0.6} ${-r * 0.55} ${-r * 0.98} ${-r * 0.05} Z`} fill={T.hair} stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      <circle cx={-r * 0.5} cy={r * 0.36} r={r * 0.11} fill={T.blush} />
      <circle cx={r * 0.5} cy={r * 0.36} r={r * 0.11} fill={T.blush} />
      <Eye id="psl" x={-ex} y={ey} rx={er * 0.86} ry={er} look={look} lid={lid} body={T.skin} />
      <Eye id="psr" x={ex} y={ey} rx={er * 0.86} ry={er} look={look} lid={lid} body={T.skin} />
      <Brows mood={mood} ex={ex} ey={ey} er={er} />
      <path d={`M ${-r * 0.04} ${r * 0.22} q ${r * 0.08} ${r * 0.1} 0 ${r * 0.16}`} stroke={T.skinShade} strokeWidth={6} fill="none" strokeLinecap="round" />
      <Mouth mood={mood} y={r * 0.5} w={r * 0.2} />
    </g>
  );
};

// ---------- labels ----------
/** Genre label: white Baloo 800 with a dark outline and a hard flat drop (no blur). Origin = centre. */
export const Label: React.FC<{x: number; y: number; text: string; q: number; size?: number; fill?: string; rot?: number; anchor?: 'start' | 'middle' | 'end'}> = ({
  x, y, text, q, size = 64, fill = T.white, rot = 0, anchor = 'middle',
}) => {
  if (q <= 0.01) return null;
  const st = {fontFamily: HEAD, fontWeight: 800, fontSize: size, letterSpacing: size * 0.02} as const;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${q})`}>
      <text x={0} y={size * 0.36 + size * 0.09} textAnchor={anchor} fill={T.ink} stroke={T.ink} strokeWidth={size * 0.22} strokeLinejoin="round" style={st}>{text}</text>
      <text x={0} y={size * 0.36} textAnchor={anchor} fill={fill} stroke={T.ink} strokeWidth={size * 0.22} strokeLinejoin="round" paintOrder="stroke" style={st}>{text}</text>
    </g>
  );
};

// ---------- captions ----------
/** Word-synced caption: Nunito 900 white with a 12 px ink stroke, the active word in a red pill with an ink border.
 *  Portrait top 1590 (under the action, above the platform UI); landscape top H − 215 with 160 px side margins. */
export const Caption: React.FC<{t: number; pages: CaptionPage[]; y?: number}> = ({t, pages, y: yIn}) => {
  const fr = useFrame();
  const y = yIn ?? fr.pick(1590, fr.H - 215);
  const side = fr.pick(64, 160);
  const pg = pageAt(t, pages);
  if (!pg) return null;
  const q = clamp01((t - (pg.start - 0.08)) / 0.16);
  const s = 0.9 + 0.1 * Easing.out(Easing.back(2))(q);
  return (
    <div style={{position: 'absolute', left: side, right: side, top: y, display: 'flex', justifyContent: 'center', transform: `scale(${s})`, opacity: q > 0.01 ? 1 : 0}}>
      <div style={{fontFamily: TEXT, fontWeight: 900, fontSize: 62, lineHeight: 1.2, textAlign: 'center', color: T.white, WebkitTextStroke: `12px ${T.ink}`, paintOrder: 'stroke fill', letterSpacing: 0.5}}>
        {pg.words.map((w, i) => {
          // exactly one active word: from its start (−0.03 lead) until the next word's start (or the page end for the last)
          const nx = pg.words[i + 1];
          const on = t >= w.start - 0.03 && (nx ? t < nx.start - 0.03 : t < Math.max(pg.end, w.end + 0.08));
          return (
            <React.Fragment key={i}>
              <span style={{display: 'inline-block', padding: '0 14px', borderRadius: 22, background: on ? T.blood : 'transparent', border: `5px solid ${on ? T.ink : 'transparent'}`, transform: on ? 'translateY(-2px)' : 'none'}}>{display(w.word)}</span>
              {i < pg.words.length - 1 ? ' ' : ''}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/** Little "?" bubble. */
export const QMark: React.FC<{x: number; y: number; q: number; size?: number; rot?: number}> = ({x, y, q, size = 120, rot = 0}) =>
  q <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${q})`}>
      <circle r={size * 0.55} fill={T.white} stroke={T.ink} strokeWidth={OUTLINE} />
      <text x={0} y={size * 0.3} textAnchor="middle" fill={T.purple} style={{fontFamily: HEAD, fontWeight: 800, fontSize: size * 0.85}}>?</text>
    </g>
  );

/** Sweat drop. */
export const Sweat: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) =>
  s <= 0.01 ? null : <path d="M 0 -26 Q 18 4 0 14 Q -18 4 0 -26 Z" transform={`translate(${x} ${y}) scale(${s})`} fill={T.sweat} stroke={T.ink} strokeWidth={4} strokeLinejoin="round" />;

/** Seeded positions for things that must never jump between frames. */
export const seeded = (n: number, seed: number) => Array.from({length: n}, (_, i) => ({a: rnd(seed + i * 3.1), b: rnd(seed + i * 7.3), c: rnd(seed + i * 11.7)}));
