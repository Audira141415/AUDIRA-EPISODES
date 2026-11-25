import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, Easing} from 'remotion';
import {CaptionPage} from '../../components/WordCaptions';
import {display, drawOn, lerp, pageAt, Pose, rnd, useFrame} from '../shared';
import {halusDrift, halusIdle, useHalus} from '../../lib/halus';

// PAPAN style kit (v1.15, look #24) — the Indonesian edu-cartoon maths classroom: warm flat room, a big green chalkboard
// whose chalk writes itself character by character (dry chalk = two offset copies + a precomputed board-coloured grain,
// no filters), a felt eraser that wipes the board as the scene transition (flat dusty streaks), a batik teacher with a
// pointer (2-bone IK to any board point), chibi SD-uniform students who gasp / wonder / raise hands / write, chalk
// thought clouds, and thumbnail-style bold white titles + captions with a dark outline. Flat colours only: no
// gradients, blur, glows or SVG filters. Everything is a pure function of time t (seconds).
// One classroom world in world coordinates (`CLASS.portrait` / `CLASS.landscape`, `useClass()`), drawn inside
// `<ClassSvg>` under the shared `World` camera; board content is board-local (0,0)-(960,1100) under `translate(boardX 0)`.
// Fonts: 'Pap Chalk' (Kalam 700) for everything written on the board, 'Pap Head' (Baloo 2 400–800) for titles/captions.
// HALUS (v1.16, level 'full'): wrap <World> in <PapanStage t starts={[camera-move starts]} end> (slow drift composed with the
// camera stations; starts = your camera moves so each drift change hides under a move), then <HalusLightDiv ink={PAP.ol}>
// after it; inserts take papanInsert() (zoom-dissolve instead of the slide-up). ClassSvg holds the HalusDefs; Teacher, Kid,
// TeacherDesk and BoardBack add their own soft shadows / idle. The felt-eraser wipe (BoardScenes) stays the board change.

export const PAP = {
  board: '#2F6B4F', band: '#3A7A5C', dust: '#4C8A6A', frame: '#A0673A', frameDark: '#7E4E2A', frameLight: '#B87A48',
  white: '#F4F1E8', yellow: '#F7D774', pink: '#F59AA6', blue: '#9AD3F0',
  wall: '#F2E3C6', wallShade: '#E9D6B2', wainscot: '#E2C79A', trim: '#C99E68', floor: '#C98E5B', plank: '#B47A49',
  desk: '#D9A066', deskTop: '#E9B97F', deskShade: '#BC8350', sky: '#9ED6F2', cloud: '#FFFFFF', leaf: '#7CB66A', leafDark: '#5E9A50',
  ol: '#3B2A20', capOl: '#2B1D14', red: '#C8102E', redDark: '#A30D25', shirt: '#FFFFFF', shirtShade: '#E3E1DA',
  batik: '#7A3E1D', motif: '#D9A25E', pants: '#4A4F5C', pantsShade: '#3C404B', hair: '#2B211C', blush: '#F2A08A', mouth: '#8A2E2E',
  tongue: '#E8737B', paper: '#FFFDF6', pointer: '#D8B072', felt: '#6F6A66', grey: '#9A958C',
};
const K = PAP;
export const CHALK = "'Pap Chalk', cursive";
export const HEAD = "'Pap Head', sans-serif";
export const OLW = 8; // character outline width (world px) ≈ 5 px on screen in the wide shot

// ---------- motion ----------
const OUTC = Easing.out(Easing.cubic);
const INOUT = Easing.inOut(Easing.quad);
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lin = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const eio = (t: number, a: number, b: number) => INOUT(lin(t, a, b));
export const eout = (t: number, a: number, b: number) => OUTC(lin(t, a, b));
/** 0 → 1.12 → 1 pop (seconds). */
export const pop = (t: number, at: number, d = 0.36) => {
  if (t <= at) return 0;
  const k = (t - at) / d;
  if (k >= 1) return 1;
  if (k < 0.58) return 1.12 * OUTC(k / 0.58);
  return lerp(1.12, 1, INOUT((k - 0.58) / 0.42));
};
/** pop in at `at`, swell + shrink out at `out`. */
export const popIO = (t: number, at: number, out?: number, d = 0.36) => {
  const q = pop(t, at, d);
  if (out === undefined || t <= out) return q;
  const k = clamp01((t - out) / 0.26);
  return q * (k < 0.3 ? lerp(1, 1.08, k / 0.3) : lerp(1.08, 0, Easing.in(Easing.cubic)((k - 0.3) / 0.7)));
};
/** hold a value 0→1 between [a, b] with eased ramps of length r. */
export const hold = (t: number, a: number, b: number, r = 0.25) => Math.min(eio(t, a, a + r), 1 - eio(t, b, b + r));
/** eyelid 0→1→0 over 0.11 s at each blink time */
export const lidAt = (t: number, times: number[]) => {
  for (const b of times) {
    const k = (t - b) / 0.11;
    if (k > 0 && k < 1) return Math.sin(k * Math.PI);
  }
  return 0;
};
/** squash pulse [sx, sy] after an impact */
export const squash = (t: number, at: number, amt = 0.14, dur = 0.4): [number, number] => {
  const k = (t - at) / dur;
  const s = k > 0 && k < 1 ? Math.sin(k * Math.PI * 2) * amt * (1 - k) : 0;
  return [1 + s, 1 - s];
};

// ---------- fonts / measuring ----------
const FONTS = ["700 100px 'Pap Chalk'", "800 60px 'Pap Head'", "700 40px 'Pap Head'"];
export const usePapFonts = () => {
  const [handle] = useState(() => delayRender('papan fonts'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all(FONTS.map((f) => document.fonts.load(f))).then(() => setReady(true)).catch(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready) continueRender(handle);
  }, [ready, handle]);
  return ready;
};
let mctx: CanvasRenderingContext2D | null = null;
const mcache = new Map<string, number>();
export const measure = (text: string, font: string) => {
  const key = `${font}|${text}`;
  const hit = mcache.get(key);
  if (hit !== undefined) return hit;
  if (!mctx) mctx = document.createElement('canvas').getContext('2d');
  if (!mctx) return text.length * 40;
  mctx.font = font;
  const w = mctx.measureText(text).width;
  if (document.fonts.check(font)) mcache.set(key, w);
  return w;
};
export const chalkW = (text: string, size: number) => measure(text, `700 ${size}px 'Pap Chalk'`);

// ---------- chalk ----------
/** Board-coloured grain tile (precomputed, static) laid over every chalk mark → dry, dusty chalk. */
const GRAIN = Array.from({length: 22}, (_, i) => ({x: rnd(i * 3.1 + 1) * 96, y: rnd(i * 5.7 + 2) * 96, r: 2.2 + rnd(i * 9.3 + 3) * 1.6}));
export const ChalkDefs: React.FC = () => (
  <defs>
    <pattern id="pap-grain" width={96} height={96} patternUnits="userSpaceOnUse">
      {GRAIN.map((g, i) => <circle key={i} cx={g.x} cy={g.y} r={g.r} fill={K.board} opacity={0.75} />)}
    </pattern>
    <pattern id="pap-batik" width={72} height={72} patternUnits="userSpaceOnUse" patternTransform="scale(1.35)">
      <rect width={72} height={72} fill={K.batik} />
      {[[0, 0], [72, 0], [0, 72], [72, 72], [36, 36]].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          {[45, 135, 225, 315].map((a) => <ellipse key={a} cx={0} cy={-15} rx={7} ry={12} fill={K.motif} transform={`rotate(${a})`} />)}
          <circle r={4} fill={K.batik} />
        </g>
      ))}
    </pattern>
  </defs>
);

type CTProps = {
  id: string; t: number; x: number; y: number; text: string; size: number; color?: string; at: number; cps?: number;
  anchor?: 'start' | 'middle' | 'end';
  /** board-coloured grain over the chalk (off for chalk on the wall / pencil) */
  grain?: boolean;
  /** dark outline under the letters (chalk that ran off the board onto the wall) */
  outline?: boolean;
  /** the faint offset copy that makes chalk look dry (off for pencil) */
  double?: boolean;
  /** draw the leading tip dot while writing */
  tip?: boolean;
};
/** Chalk text that writes itself left→right, char by char (eased per char = handwriting rhythm), chalk tip leading. */
export const ChalkText: React.FC<CTProps> = ({id, t, x, y, text, size, color = K.white, at, cps = 16, anchor = 'middle', grain = true, outline = false, double = true, tip = true}) => {
  if (t < at) return null;
  const W = chalkW(text, size);
  const x0 = anchor === 'middle' ? x - W / 2 : anchor === 'end' ? x - W : x;
  const n = text.length;
  const k = (t - at) * cps;
  const done = k >= n;
  let rx = W;
  let f = 1;
  if (!done) {
    const i = Math.floor(k);
    f = k - i;
    const a = chalkW(text.slice(0, i), size), b = chalkW(text.slice(0, i + 1), size);
    rx = a + (b - a) * INOUT(f);
  }
  const cid = `pap-ct-${id}`;
  const common = {x: x0, y, fontFamily: CHALK, fontWeight: 700, fontSize: size};
  return (
    <g>
      {!done && (
        <defs>
          <clipPath id={cid}><rect x={x0 - size * 0.3} y={y - size * 1.25} width={rx + size * 0.3} height={size * 1.8} /></clipPath>
        </defs>
      )}
      <g clipPath={done ? undefined : `url(#${cid})`}>
        {outline && <text {...common} fill={K.ol} stroke={K.ol} strokeWidth={size * 0.13} strokeLinejoin="round">{text}</text>}
        {double && <text {...common} fill={color} opacity={0.35} transform="translate(3 -2.5)">{text}</text>}
        <text {...common} fill={color} opacity={outline ? 1 : 0.9}>{text}</text>
        {grain && <text {...common} fill="url(#pap-grain)">{text}</text>}
      </g>
      {!done && tip && <circle cx={x0 + rx} cy={y - size * 0.32 + Math.sin(k * 1.7) * size * 0.14} r={Math.max(5, size * 0.055)} fill={color} stroke={outline ? K.ol : undefined} strokeWidth={outline ? 4 : undefined} />}
    </g>
  );
};

/** x of the writing tip of a ChalkText (same maths) — for a hand/pencil that follows the writing. */
export const chalkTipX = (t: number, x: number, text: string, size: number, at: number, cps = 16, anchor: 'start' | 'middle' | 'end' = 'middle') => {
  const W = chalkW(text, size);
  const x0 = anchor === 'middle' ? x - W / 2 : anchor === 'end' ? x - W : x;
  const k = Math.max(0, (t - at) * cps);
  if (k >= text.length) return x0 + W;
  const i = Math.floor(k);
  const a = chalkW(text.slice(0, i), size), b = chalkW(text.slice(0, i + 1), size);
  return x0 + a + (b - a) * INOUT(k - i);
};

/** Chalk stroke (rough path) drawn on between at and at+dur. */
export const ChalkLine: React.FC<{t: number; d: string; at: number; dur?: number; color?: string; w?: number}> = ({t, d, at, dur = 0.3, color = K.white, w = 8}) => {
  if (t < at) return null;
  const q = eout(t, at, at + dur);
  const dash = q >= 1 ? {} : drawOn(q);
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={color} strokeWidth={w} opacity={0.35} transform="translate(3 -2.5)" {...dash} />
      <path d={d} stroke={color} strokeWidth={w} opacity={0.9} {...dash} />
      <path d={d} stroke="url(#pap-grain)" strokeWidth={w} {...dash} />
    </g>
  );
};

/** Arrow head path at (x, y) pointing along angle deg. */
export const arrowHead = (x: number, y: number, deg: number, s = 30) => {
  const a = (deg * Math.PI) / 180;
  const p = (da: number) => `${(x - Math.cos(a + da) * s).toFixed(1)} ${(y - Math.sin(a + da) * s).toFixed(1)}`;
  return `M ${p(0.5)} L ${x.toFixed(1)} ${y.toFixed(1)} L ${p(-0.5)}`;
};

// ---------- the board ----------
export const BOARD = {w: 960, h: 1100, fw: 36};
/** Frame + flat surface + light band. Board-local coords (0,0)-(960,1100). */
export const BoardBack: React.FC = () => {
  const {w, h, fw} = BOARD;
  const halus = useHalus('PAPAN').full;
  return (
    <g>
      {halus && <rect x={-fw - 6} y={-fw - 6} width={w + fw * 2 + 12} height={h + fw * 2 + 12} rx={10} fill={K.ol} filter="url(#hl-drop)" />}
      <rect x={-fw - 6} y={-fw - 6} width={w + fw * 2 + 12} height={h + fw * 2 + 12} rx={10} fill={K.ol} />
      <rect x={-fw} y={-fw} width={w + fw * 2} height={h + fw * 2} rx={6} fill={K.frame} />
      <rect x={-fw} y={-fw} width={w + fw * 2} height={12} fill={K.frameLight} />
      <rect x={-10} y={-10} width={w + 20} height={h + 20} fill={K.frameDark} />
      <rect x={0} y={0} width={w} height={h} fill={K.board} />
      <path d={`M ${w * 0.52} 0 L ${w * 0.78} 0 L ${w * 0.36} ${h} L ${w * 0.1} ${h} Z`} fill={K.band} />
      <path d={`M ${w * 0.84} 0 L ${w * 0.9} 0 L ${w * 0.48} ${h} L ${w * 0.42} ${h} Z`} fill={K.band} />
    </g>
  );
};
/** Chalk tray with sticks (board-local, under the board). */
export const Tray: React.FC = () => {
  const {w, h, fw} = BOARD;
  const y = h + fw;
  return (
    <g>
      <rect x={-fw - 30} y={y - 6} width={w + fw * 2 + 60} height={40} rx={8} fill={K.ol} />
      <rect x={-fw - 24} y={y} width={w + fw * 2 + 48} height={28} rx={5} fill={K.frame} />
      <rect x={-fw - 24} y={y} width={w + fw * 2 + 48} height={9} fill={K.frameLight} />
      {[[90, K.white], [150, K.yellow], [196, K.pink], [242, K.blue]].map(([cx, c], i) => (
        <rect key={i} x={(cx as number) - 22} y={y - 17} width={46} height={17} rx={7} fill={c as string} stroke={K.ol} strokeWidth={5} transform={`rotate(${[-4, 3, -2, 5][i]} ${cx} ${y - 8})`} />
      ))}
    </g>
  );
};

/** Felt eraser seen from the front (wooden back + felt rim). Centre origin, 170×64 at s = 1. */
export const Eraser: React.FC<{x: number; y: number; rot?: number; s?: number; sx?: number; sy?: number}> = ({x, y, rot = 0, s = 1, sx = 1, sy = 1}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${(s * sx).toFixed(3)} ${(s * sy).toFixed(3)})`}>
    <rect x={-85} y={-32} width={170} height={64} rx={14} fill={K.felt} stroke={K.ol} strokeWidth={6} />
    <rect x={-78} y={-32} width={156} height={44} rx={12} fill={K.frame} stroke={K.ol} strokeWidth={6} />
    <rect x={-70} y={-26} width={140} height={10} rx={5} fill={K.frameLight} />
    <rect x={-40} y={-16} width={80} height={16} rx={6} fill={K.frameDark} />
  </g>
);

// Eraser sweep: three horizontal passes (L→R, R→L, L→R) across the board, eraser standing tall.
export const ROWS = 3;
export type Wipe = {at: number; dur: number};
const rowH = BOARD.h / ROWS;
const EH = 300; // eraser footprint height while sweeping (170 long side × 1.76)
/** Wipe progress → eraser centre + current row. */
export const sweepPos = (u: number) => {
  const r = Math.min(ROWS - 1, Math.floor(u * ROWS));
  const ur = clamp01(u * ROWS - r);
  const turn = r < ROWS - 1 ? 0.8 : 1;
  const k = INOUT(clamp01(ur / turn));
  const dir = r % 2 === 0 ? 1 : -1;
  const x0 = dir > 0 ? -90 : BOARD.w + 90, x1 = dir > 0 ? BOARD.w + 90 : -90;
  // at the end of a row the eraser slides down to the next row (no jump)
  const down = r < ROWS - 1 ? INOUT(clamp01((ur - turn) / (1 - turn))) : 0;
  return {x: lerp(x0, x1, k), y: rowH * (r + 0.5 + down), r, dir, k};
};
/** Clip-path rects of the content NOT yet wiped (board-local). */
export const wipeRemain = (t: number, w: Wipe): string => {
  const u = (t - w.at) / w.dur;
  if (u <= 0) return `M -200 -200 H ${BOARD.w + 200} V ${BOARD.h + 300} H -200 Z`;
  if (u >= 1) return 'M 0 0 Z';
  const {x, r, dir} = sweepPos(u);
  const half = 50;
  let d = '';
  const y0 = r === 0 ? -200 : rowH * r, y1 = r === ROWS - 1 ? BOARD.h + 300 : rowH * (r + 1);
  if (dir > 0) d += `M ${x - half} ${y0} H ${BOARD.w + 200} V ${y1} H ${x - half} Z `;
  else d += `M -200 ${y0} H ${x + half} V ${y1} H -200 Z `;
  if (r < ROWS - 1) d += `M -200 ${rowH * (r + 1)} H ${BOARD.w + 200} V ${BOARD.h + 300} H -200 Z`;
  return d;
};
/** Clip-path of the board area already wiped (board-local) — new chalk is revealed only behind the eraser. */
export const wipeDone = (t: number, w: Wipe): string => {
  const u = (t - w.at) / w.dur;
  const full = `M -200 -200 H ${BOARD.w + 200} V ${BOARD.h + 300} H -200 Z`;
  if (u >= 1) return full;
  if (u <= 0) return 'M 0 0 Z';
  const {x, r, dir} = sweepPos(u);
  const half = 50;
  let d = '';
  const y0 = r === 0 ? -200 : rowH * r, y1 = r === ROWS - 1 ? BOARD.h + 300 : rowH * (r + 1);
  if (r > 0) d += `M -200 -200 H ${BOARD.w + 200} V ${rowH * r} H -200 Z `;
  if (dir > 0) d += `M -200 ${y0} H ${x - half} V ${y1} H -200 Z`;
  else d += `M ${x + half} ${y0} H ${BOARD.w + 200} V ${y1} H ${x + half} Z`;
  return d;
};
/** Old board content, clipped away by the eraser while wipe `w` runs (gone after it). */
export const Wiped: React.FC<{t: number; id: string; w?: Wipe; children: React.ReactNode}> = ({t, id, w, children}) => {
  if (!w || t <= w.at) return <g>{children}</g>;
  if (t >= w.at + w.dur) return null;
  return (
    <g>
      <defs><clipPath id={`pap-w-${id}`}><path d={wipeRemain(t, w)} /></clipPath></defs>
      <g clipPath={`url(#pap-w-${id})`}>{children}</g>
    </g>
  );
};
/** New board content: while wipe `w` runs it is visible only where the eraser has already passed. */
export const Reveal: React.FC<{t: number; id: string; w?: Wipe; children: React.ReactNode}> = ({t, id, w, children}) => {
  if (!w || t >= w.at + w.dur) return <g>{children}</g>;
  if (t <= w.at) return null;
  return (
    <g>
      <defs><clipPath id={`pap-r-${id}`}><path d={wipeDone(t, w)} /></clipPath></defs>
      <g clipPath={`url(#pap-r-${id})`}>{children}</g>
    </g>
  );
};
export type EraserState = {x: number; y: number; rot: number; s: number; sx: number; sy: number};
export const ERASER_REST: EraserState = {x: 800, y: 1104, rot: 0, s: 1, sx: 1, sy: 1};
const SWEEP_S = 1.76;
const eArc = (A: EraserState, B: EraserState, k: number, lift = 160): EraserState => ({
  x: lerp(A.x, B.x, k), y: lerp(A.y, B.y, k) - Math.sin(k * Math.PI) * lift, rot: lerp(A.rot, B.rot, k), s: lerp(A.s, B.s, k), sx: 1, sy: 1,
});
/** Generic felt-eraser choreography for a list of wipes: hops off the tray, sweeps 3 rows, flips back and lands with a squash. */
export const eraserFor = (t: number, wipes: Wipe[], rest: EraserState = ERASER_REST): EraserState => {
  for (const w of wipes) {
    if (t < w.at - 0.36 || t > w.at + w.dur + 0.8) continue;
    const start: EraserState = {x: -90, y: sweepPos(0).y, rot: 90, s: SWEEP_S, sx: 1, sy: 1};
    if (t < w.at) return eArc(rest, start, eio(t, w.at - 0.36, w.at), 90);
    if (t < w.at + w.dur) {
      const p = sweepPos((t - w.at) / w.dur);
      return {x: p.x, y: p.y, rot: 90 + p.dir * 9 * Math.sin(p.k * Math.PI), s: SWEEP_S, sx: 1, sy: 1};
    }
    const end = sweepPos(1);
    const land = w.at + w.dur + 0.42;
    if (t < land) return eArc({x: end.x, y: end.y, rot: 90, s: SWEEP_S, sx: 1, sy: 1}, {...rest, rot: 360}, eio(t, w.at + w.dur, land), 140);
    const [sx, sy] = squash(t, land, 0.22, 0.36);
    return {...rest, sx, sy};
  }
  return rest;
};

// precomputed streaks inside each row (flat dusty bands left by the felt)
const STREAKS = Array.from({length: ROWS}, (_, r) =>
  Array.from({length: 3}, (_, i) => {
    const h = 60 + rnd(r * 7 + i * 3) * 70;
    return {
      y: rowH * r + rowH * (0.2 + i * 0.3) + (rnd(r * 11 + i) - 0.5) * 30, h,
      x0: rnd(r * 13 + i * 5) * 120, x1: BOARD.w - rnd(r * 17 + i * 3) * 160, a: 0.32 + rnd(r * 5 + i) * 0.3, sk: (rnd(r * 3 + i * 9) - 0.5) * 40,
    };
  }),
);
/** Dust streaks behind the eraser; fade to a faint smudge that stays until `until`. */
export const WipeDust: React.FC<{t: number; w: Wipe; until: number}> = ({t, w, until}) => {
  const u = (t - w.at) / w.dur;
  if (u <= 0 || t > until) return null;
  const cur = u < 1 ? sweepPos(u) : null;
  const fade = lerp(1, 0.2, eout(t, w.at + w.dur, w.at + w.dur + 0.8));
  return (
    <g opacity={fade}>
      {STREAKS.map((row, r) => {
        let xa = -999, xb = 9999;
        if (cur) {
          if (r > cur.r) return null;
          if (r === cur.r) {
            if (cur.dir > 0) xb = cur.x;
            else xa = cur.x;
          }
        }
        return row.map((s, i) => {
          const a0 = Math.max(s.x0, xa), a1 = Math.min(s.x1, xb);
          if (a1 - a0 < 4) return null;
          return <rect key={`${r}-${i}`} x={a0} y={s.y - s.h / 2} width={a1 - a0} height={s.h} rx={s.h / 2} fill={K.dust} opacity={s.a} transform={`rotate(${(s.sk * 0.04).toFixed(2)} ${(a0 + a1) / 2} ${s.y})`} />;
        });
      })}
    </g>
  );
};
/** Falling chalk dust specks from the eraser (deterministic). */
export const DustSpecks: React.FC<{t: number; w: Wipe}> = ({t, w}) => {
  if (t < w.at || t > w.at + w.dur + 1.2) return null;
  return (
    <g>
      {Array.from({length: 16}, (_, i) => {
        const born = w.at + (i / 16) * w.dur;
        const age = t - born;
        if (age < 0 || age > 1.0) return null;
        const p0 = sweepPos((born - w.at) / w.dur);
        const vx = (rnd(i * 3.3 + w.at) - 0.5) * 120;
        const x = p0.x + (rnd(i * 1.7) - 0.5) * 60 + vx * age;
        const y = p0.y + EH * 0.3 + 380 * age * age + 40 * age;
        if (y > BOARD.h - 6 || x < 6 || x > BOARD.w - 6) return null;
        return <circle key={i} cx={x} cy={y} r={4 + rnd(i * 2.9) * 4} fill={K.white} opacity={0.55 * (1 - age)} />;
      })}
    </g>
  );
};

// ---------- room ----------
/** Thought / chalk cloud path centred at 0,0 (w×h), bumpy rim. */
export const cloudPath = (w: number, h: number, n = 11, seed = 3) => {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd(seed + i * 2) * 0.12;
    pts.push([Math.cos(a) * w * 0.4, Math.sin(a) * h * 0.36]);
  }
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} `;
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % n];
    const r = (Math.hypot(q[0] - p[0], q[1] - p[1]) / 2) * (1.02 + rnd(seed + i) * 0.12);
    d += `A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${q[0].toFixed(1)} ${q[1].toFixed(1)} `;
  });
  return d + 'Z';
};

export const Bunting: React.FC<{y: number; x0: number; x1: number}> = ({y, x0, x1}) => {
  const n = 16;
  const sag = 60;
  const pt = (k: number) => [lerp(x0, x1, k), y + Math.sin(k * Math.PI) * sag] as const;
  return (
    <g>
      <path d={`M ${x0} ${y} Q ${(x0 + x1) / 2} ${y + sag * 2} ${x1} ${y}`} stroke={K.ol} strokeWidth={6} fill="none" />
      {Array.from({length: n}, (_, i) => {
        const [ax, ay] = pt((i + 0.15) / n), [bx, by] = pt((i + 0.85) / n);
        const mx = (ax + bx) / 2, my = (ay + by) / 2 + 90;
        return <path key={i} d={`M ${ax} ${ay} L ${bx} ${by} L ${mx} ${my} Z`} fill={i % 2 ? K.shirt : K.red} stroke={K.ol} strokeWidth={6} strokeLinejoin="round" />;
      })}
    </g>
  );
};

export const Clock: React.FC<{x: number; y: number; r?: number; hourDeg?: number; minDeg?: number; secDeg?: number}> = ({x, y, r = 80, hourDeg = 300, minDeg = 60, secDeg}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r + 10} fill={K.red} stroke={K.ol} strokeWidth={OLW} />
    <circle r={r - 6} fill={K.paper} stroke={K.ol} strokeWidth={5} />
    {Array.from({length: 12}, (_, i) => (
      <line key={i} x1={0} y1={-(r - 18)} x2={0} y2={-(r - 30)} stroke={K.ol} strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * 30})`} />
    ))}
    <line x1={0} y1={0} x2={0} y2={-(r - 34)} stroke={K.ol} strokeWidth={9} strokeLinecap="round" transform={`rotate(${hourDeg.toFixed(2)})`} />
    <line x1={0} y1={0} x2={0} y2={-(r - 22)} stroke={K.ol} strokeWidth={7} strokeLinecap="round" transform={`rotate(${minDeg.toFixed(2)})`} />
    {secDeg !== undefined && (
      <g transform={`rotate(${secDeg.toFixed(2)})`}>
        <line x1={0} y1={r * 0.22} x2={0} y2={-(r - 16)} stroke={K.red} strokeWidth={4} strokeLinecap="round" />
      </g>
    )}
    <circle r={8} fill={K.ol} />
  </g>
);

export const Window: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-14} y={-14} width={w + 28} height={h + 28} rx={10} fill={K.paper} stroke={K.ol} strokeWidth={OLW} />
    <rect x={0} y={0} width={w} height={h} fill={K.sky} stroke={K.ol} strokeWidth={6} />
    <path d={`M ${w * 0.1} ${h * 0.3} q 30 -50 80 -20 q 40 -30 70 10 q 30 0 30 30 h -180 z`} fill={K.cloud} />
    <circle cx={w * 0.2} cy={h * 0.95} r={w * 0.42} fill={K.leaf} stroke={K.ol} strokeWidth={6} />
    <circle cx={w * 0.85} cy={h * 1.02} r={w * 0.38} fill={K.leafDark} stroke={K.ol} strokeWidth={6} />
    <rect x={0} y={h} width={w} height={14} fill={K.paper} />
    <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke={K.paper} strokeWidth={18} />
    <line x1={0} y1={h * 0.48} x2={w} y2={h * 0.48} stroke={K.paper} strokeWidth={18} />
    <rect x={0} y={0} width={w} height={h} fill="none" stroke={K.ol} strokeWidth={6} />
  </g>
);

/** Classroom back wall + floor in world coords (wall to y = floorY), from x0 to x1 (landscape rooms are wider). */
export const Room: React.FC<{floorY: number; x0?: number; x1?: number}> = ({floorY, x0 = -1300, x1 = 1300}) => {
  const w = x1 - x0;
  return (
    <g>
      <rect x={x0} y={-900} width={w} height={floorY + 900} fill={K.wall} />
      <rect x={x0} y={floorY - 190} width={w} height={190} fill={K.wainscot} />
      <rect x={x0} y={floorY - 196} width={w} height={16} fill={K.trim} />
      <rect x={x0} y={floorY} width={w} height={2600} fill={K.floor} />
      <rect x={x0} y={floorY} width={w} height={10} fill={K.ol} />
      {[90, 230, 420, 680, 1010].map((dy, i) => <rect key={i} x={x0} y={floorY + dy} width={w} height={7} fill={K.plank} />)}
    </g>
  );
};

/** Teacher's desk (front panel + top + books + apple), origin = top centre. */
export const TeacherDesk: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    {/* HALUS full (v1.16): soft contact shadow where the desk meets the floor */}
    <DeskShadow />
    {/* books */}
    {[[-250, -40, 170, 40, K.band], [-238, -78, 150, 38, K.red], [-246, -112, 160, 34, K.yellow]].map(([bx, by, bw, bh, c], i) => (
      <rect key={i} x={bx as number} y={by as number} width={bw as number} height={bh as number} rx={5} fill={c as string} stroke={K.ol} strokeWidth={6} />
    ))}
    {/* pencil cup */}
    <rect x={150} y={-90} width={60} height={90} rx={6} fill={K.blue} stroke={K.ol} strokeWidth={6} />
    <line x1={168} y1={-90} x2={160} y2={-140} stroke={K.yellow} strokeWidth={12} strokeLinecap="round" />
    <line x1={190} y1={-90} x2={200} y2={-132} stroke={K.red} strokeWidth={12} strokeLinecap="round" />
    <circle cx={60} cy={-34} r={34} fill={K.red} stroke={K.ol} strokeWidth={6} />
    <path d="M 60 -66 q 4 -18 18 -22" stroke={K.ol} strokeWidth={6} fill="none" strokeLinecap="round" />
    <rect x={-340} y={0} width={680} height={40} rx={8} fill={K.deskTop} stroke={K.ol} strokeWidth={OLW} />
    <rect x={-320} y={40} width={640} height={290} fill={K.desk} stroke={K.ol} strokeWidth={OLW} />
    <rect x={-316} y={44} width={632} height={34} fill={K.deskShade} />
    <rect x={-120} y={120} width={240} height={70} rx={8} fill={K.deskTop} stroke={K.ol} strokeWidth={6} />
  </g>
);

const DeskShadow: React.FC = () =>
  useHalus('PAPAN').full ? <ellipse cx={0} cy={326} rx={372} ry={30} fill={K.ol} opacity={0.32} filter="url(#hl-soft)" /> : null;

/** Student desk, origin = top-front edge centre (kid sits behind it). */
export const Desk: React.FC<{x: number; y: number; s?: number; notebook?: boolean; closed?: boolean}> = ({x, y, s = 1, notebook, closed}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-270} y={-24} width={540} height={44} rx={10} fill={K.deskTop} stroke={K.ol} strokeWidth={OLW} />
    <rect x={-250} y={20} width={500} height={640} fill={K.desk} stroke={K.ol} strokeWidth={OLW} />
    <rect x={-246} y={24} width={492} height={40} fill={K.deskShade} />
    <rect x={-200} y={140} width={400} height={16} rx={8} fill={K.deskShade} />
    {notebook && closed && (
      <g>
        <path d="M -120 -12 L 110 -12 L 98 -44 L -108 -44 Z" fill={K.red} stroke={K.ol} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -116 -18 H 106" stroke={K.paper} strokeWidth={5} />
      </g>
    )}
    {notebook && !closed && (
      <g>
        <path d="M -150 -12 L -10 -12 L 0 -40 L -134 -40 Z" fill={K.paper} stroke={K.ol} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 0 -12 L 140 -12 L 124 -40 L 0 -40 Z" fill={K.paper} stroke={K.ol} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -120 -26 H -24 M 18 -26 H 110" stroke={K.blue} strokeWidth={4} />
      </g>
    )}
  </g>
);

// ---------- characters ----------
type P = [number, number];
export type HandKind = 'ball' | 'open' | 'thumb' | 'one';
/** Hand at H (forearm from E): ball fist, open 5-finger fan, thumbs-up or one raised finger (digits point up). */
export const handShape = (E: P, H: P, skin: string, r: number, kind: HandKind = 'ball') => {
  const dx = H[0] - E[0], dy = H[1] - E[1];
  const dl = Math.hypot(dx, dy) || 1;
  const base = Math.atan2(dy / dl, dx / dl);
  const digit = (ang: number, len: number, w: number, from: P = H) => {
    const tip: P = [from[0] + Math.cos(ang) * len, from[1] + Math.sin(ang) * len];
    return [
      <path key={`o${ang}`} d={`M ${from[0].toFixed(1)} ${from[1].toFixed(1)} L ${tip[0].toFixed(1)} ${tip[1].toFixed(1)}`} stroke={K.ol} strokeWidth={w + OLW * 1.6} />,
      <path key={`s${ang}`} d={`M ${from[0].toFixed(1)} ${from[1].toFixed(1)} L ${tip[0].toFixed(1)} ${tip[1].toFixed(1)}`} stroke={skin} strokeWidth={w} />,
    ];
  };
  let digits: React.ReactNode[] = [];
  if (kind === 'open') {
    const outs = [-0.62, -0.22, 0.12, 0.46].map((o) => digit(base + o, r * 1.55, r * 0.5));
    const th = digit(base + 1.25, r * 1.2, r * 0.52);
    digits = [...outs.map((d) => d[0]), th[0], ...outs.map((d) => d[1]), th[1]];
  } else if (kind === 'thumb' || kind === 'one') {
    const d = digit(-Math.PI / 2, r * 1.75, r * 0.56, [H[0] + (kind === 'thumb' ? -r * 0.35 : r * 0.1), H[1] - r * 0.2]);
    digits = [d[0], d[1]];
  }
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {digits}
      <circle cx={H[0]} cy={H[1]} r={r} fill={skin} stroke={K.ol} strokeWidth={OLW * 0.8} />
    </g>
  );
};
const limb = (S: P, E: P, H: P, sleeve: string, skin: string, w: number, sleeveTo = 1, hand: HandKind = 'ball') => {
  const M: P = [lerp(S[0], E[0], sleeveTo), lerp(S[1], E[1], sleeveTo)];
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M ${S[0]} ${S[1]} L ${E[0]} ${E[1]} L ${H[0]} ${H[1]}`} stroke={K.ol} strokeWidth={w + OLW * 2} />
      <path d={`M ${E[0]} ${E[1]} L ${H[0]} ${H[1]}`} stroke={skin} strokeWidth={w} />
      <path d={`M ${S[0]} ${S[1]} L ${M[0]} ${M[1]}`} stroke={sleeve} strokeWidth={w + 6} />
      {handShape(E, H, skin, w * 0.62, hand)}
    </g>
  );
};
const lerpP = (a: P, b: P, k: number): P => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
export type Arm = {S: P; E: P; H: P};
export const lerpArm = (a: Arm, b: Arm, k: number): Arm => ({S: lerpP(a.S, b.S, k), E: lerpP(a.E, b.E, k), H: lerpP(a.H, b.H, k)});
const mirror = (a: Arm): Arm => ({S: [-a.S[0], a.S[1]], E: [-a.E[0], a.E[1]], H: [-a.H[0], a.H[1]]});

/** Eyelid covering the top fraction L of an ellipse eye (rx, ry) at 0,0. */
const lidPath = (rx: number, ry: number, L: number) => {
  const th = Math.acos(Math.max(-1, Math.min(1, 1 - 2 * L)));
  let d = '';
  for (let i = 0; i <= 12; i++) {
    const a = -th + (2 * th * i) / 12;
    d += `${i ? 'L' : 'M'} ${(Math.sin(a) * rx).toFixed(1)} ${(-Math.cos(a) * ry).toFixed(1)} `;
  }
  return d + 'Z';
};

export type Mood = 'smile' | 'grin' | 'o' | 'flat' | 'worry';
type FaceProps = {skin: string; mood: Mood; lid: number; look: P; brow: number; browTilt?: number; eyeR?: P; eyeY?: number; eyeX?: number; mouthY?: number; talk?: number};
/** Eyes / brows / blush / mouth in head-local coords (head centre 0,0). */
const Face: React.FC<FaceProps> = ({skin, mood, lid, look, brow, browTilt = 0, eyeR = [15, 21], eyeY = 5, eyeX = 48, mouthY = 62, talk = 0}) => {
  const big = mood === 'o' ? 1.18 : 1;
  const [rx, ry] = [eyeR[0] * big, eyeR[1] * big];
  return (
    <g>
      <circle cx={-eyeX - 34} cy={eyeY + 42} r={17} fill={K.blush} />
      <circle cx={eyeX + 34} cy={eyeY + 42} r={17} fill={K.blush} />
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${sd * eyeX + look[0] * 7} ${eyeY + look[1] * 6})`}>
          <ellipse rx={rx} ry={ry} fill={K.ol} />
          <circle cx={rx * 0.32} cy={-ry * 0.38} r={rx * 0.36} fill={K.shirt} />
          {lid > 0.02 && <path d={lidPath(rx + 3, ry + 3, lid)} fill={skin} />}
          {lid > 0.5 && <line x1={-rx - 2} y1={-ry - 3 + (ry + 3) * 2 * lid} x2={rx + 2} y2={-ry - 3 + (ry + 3) * 2 * lid} stroke={K.ol} strokeWidth={5} strokeLinecap="round" />}
        </g>
      ))}
      {[-1, 1].map((sd) => {
        const by = eyeY - 44 - brow * 14 + sd * browTilt * 6;
        return <path key={sd} d={`M ${sd * (eyeX - 20)} ${by + 2} Q ${sd * eyeX} ${by - 9} ${sd * (eyeX + 20)} ${by + 3 - (mood === 'worry' ? -8 : 0)}`} stroke={K.ol} strokeWidth={7} fill="none" strokeLinecap="round" />;
      })}
      <g transform={`translate(0 ${mouthY})`}>
        {mood === 'smile' && talk < 0.15 && <path d="M -26 -6 Q 0 18 26 -6" stroke={K.ol} strokeWidth={7} fill="none" strokeLinecap="round" />}
        {(mood === 'grin' || (mood === 'smile' && talk >= 0.15)) && (
          <g>
            <path d={`M -30 -8 Q 0 -6 30 -8 Q 26 ${14 + 24 * (mood === 'grin' ? 1 : talk)} 0 ${16 + 24 * (mood === 'grin' ? 1 : talk)} Q -26 ${14 + 24 * (mood === 'grin' ? 1 : talk)} -30 -8 Z`} fill={K.mouth} stroke={K.ol} strokeWidth={6} strokeLinejoin="round" />
            <path d="M -14 14 Q 0 6 14 14 Q 0 22 -14 14 Z" fill={K.tongue} opacity={mood === 'grin' || talk > 0.5 ? 1 : 0} />
          </g>
        )}
        {mood === 'o' && <ellipse cx={0} cy={6} rx={17} ry={23} fill={K.mouth} stroke={K.ol} strokeWidth={6} />}
        {mood === 'flat' && <path d="M -22 4 Q -11 -4 0 4 Q 11 12 22 4" stroke={K.ol} strokeWidth={7} fill="none" strokeLinecap="round" />}
        {mood === 'worry' && <path d="M -22 10 Q 0 -6 22 10" stroke={K.ol} strokeWidth={7} fill="none" strokeLinecap="round" />}
      </g>
    </g>
  );
};

export type KidLook = {skin: string; hair: 'spike' | 'bob' | 'buzz'; bow?: string};
export const KID_ARMS = {
  rest: {S: [-128, -170], E: [-170, -70], H: [-112, -28]} as Arm,
  cheek: {S: [-128, -170], E: [-186, -240], H: [-108, -318]} as Arm,
  raise: {S: [-128, -172], E: [-196, -340], H: [-214, -560]} as Arm,
  write: {S: [-128, -170], E: [-150, -60], H: [-40, -36]} as Arm,
  chin: {S: [-128, -170], E: [-140, -60], H: [-60, -240]} as Arm,
};
export const mirrorArm = mirror;
type KidProps = {
  t: number; x: number; y: number; s?: number; look: KidLook; mood?: Mood; lid?: number; eyes?: P; brow?: number; browTilt?: number;
  armL: Arm; armR: Arm; tilt?: number; lean?: number; bobPhase?: number; pencil?: boolean; armLFront?: boolean; armRFront?: boolean; sy?: number;
  /** hand shapes (default ball fists) */
  handL?: HandKind; handR?: HandKind;
  /** extra body bob (px, e.g. laughing) */
  bob?: number;
};
/** Chibi student in Indonesian SD uniform (white shirt, red tie; red bottoms hidden by the desk). Origin = desk-top centre. */
export const Kid: React.FC<KidProps> = ({t, x, y, s = 1, look, mood = 'smile', lid = 0, eyes = [0, 0], brow = 0, browTilt = 0, armL, armR, tilt = 0, lean = 0, bobPhase = 0, pencil, armLFront = true, armRFront = true, sy = 1, handL = 'ball', handR = 'ball', bob = 0}) => {
  // HALUS full (v1.16): idle squash/stretch from the desk top + small head sway (identity when HALUS is off)
  const idle = halusIdle(t, bobPhase + 1, useHalus('PAPAN').full);
  sy *= idle.sy;
  tilt += idle.head;
  const sxI = idle.sx;
  const breathe = Math.sin(t * 2.4 + bobPhase) * 5 + bob;
  const skin = look.skin;
  const hy = -372;
  const arm = (a: Arm, pen?: boolean, hand: HandKind = 'ball') => (
    <g>
      {limb(a.S, a.E, a.H, K.shirt, skin, 44, 0.45, hand)}
      {pen && (
        <g transform={`translate(${a.H[0]} ${a.H[1]}) rotate(-35)`}>
          <rect x={-8} y={-74} width={16} height={70} fill={K.yellow} stroke={K.ol} strokeWidth={5} />
          <path d="M -8 -4 L 0 14 L 8 -4 Z" fill={K.deskTop} stroke={K.ol} strokeWidth={5} strokeLinejoin="round" />
        </g>
      )}
    </g>
  );
  const hairBack = look.hair === 'bob' && (
    <g>
      <path d="M -168 70 Q -180 -175 0 -178 Q 180 -175 168 70 Q 160 130 118 118 L -118 118 Q -160 130 -168 70 Z" fill={K.hair} stroke={K.ol} strokeWidth={OLW} />
    </g>
  );
  const hairFront =
    look.hair === 'spike' ? (
      <path d="M -142 12 Q -150 -150 0 -152 Q 150 -150 142 12 Q 130 -58 74 -76 L 56 -46 L 26 -88 L -6 -52 L -38 -92 L -62 -54 Q -118 -62 -142 12 Z" fill={K.hair} stroke={K.ol} strokeWidth={OLW} strokeLinejoin="round" />
    ) : look.hair === 'bob' ? (
      <path d="M -146 6 Q -146 -152 0 -154 Q 146 -152 146 6 Q 110 -66 44 -74 Q 8 -56 -30 -80 Q -104 -70 -146 6 Z" fill={K.hair} stroke={K.ol} strokeWidth={OLW} strokeLinejoin="round" />
    ) : (
      <g>
        <path d="M -134 -18 Q -136 -142 0 -144 Q 136 -142 134 -18 Q 84 -96 0 -100 Q -84 -96 -134 -18 Z" fill={K.hair} stroke={K.ol} strokeWidth={OLW} strokeLinejoin="round" />
        <path d="M 6 -142 q 20 -40 52 -26" stroke={K.ol} strokeWidth={9} fill="none" strokeLinecap="round" />
      </g>
    );
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sxI === 1 ? s : (s * sxI).toFixed(4)} ${(s * sy).toFixed(4)})`}>
      <g transform={`translate(${lean.toFixed(1)} ${breathe.toFixed(1)})`}>
        {!armLFront && arm(armL, false, handL)}
        {!armRFront && arm(armR, false, handR)}
        {/* torso */}
        <path d="M -156 40 L -146 -150 Q -138 -222 -64 -228 L 64 -228 Q 138 -222 146 -150 L 156 40 Z" fill={K.shirt} stroke={K.ol} strokeWidth={OLW} strokeLinejoin="round" />
        <path d="M 96 -224 Q 138 -214 144 -150 L 152 40 L 104 40 Z" fill={K.shirtShade} />
        <rect x={-30} y={-262} width={60} height={50} fill={skin} stroke={K.ol} strokeWidth={OLW} />
        <path d="M -62 -228 L -4 -228 L -30 -178 Z M 62 -228 L 4 -228 L 30 -178 Z" fill={K.shirt} stroke={K.ol} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -14 -224 L 14 -224 L 10 -196 L -10 -196 Z" fill={K.red} stroke={K.ol} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -10 -196 L 10 -196 L 18 -60 L 0 -40 L -18 -60 Z" fill={K.red} stroke={K.ol} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 62 -120 H 112 V -80 H 62 Z" fill="none" stroke={K.shirtShade} strokeWidth={6} />
        {armLFront && arm(armL, false, handL)}
        {/* head */}
        <g transform={`rotate(${tilt.toFixed(2)} 0 -250)`}>
          <g transform={`translate(0 ${hy})`}>
            {hairBack}
            <circle cx={-134} cy={14} r={28} fill={skin} stroke={K.ol} strokeWidth={OLW} />
            <circle cx={134} cy={14} r={28} fill={skin} stroke={K.ol} strokeWidth={OLW} />
            <circle r={138} fill={skin} stroke={K.ol} strokeWidth={OLW} />
            {hairFront}
            {look.bow && (
              <g transform="translate(118 -78) rotate(20)">
                <path d="M 0 0 L -30 -22 L -30 22 Z M 0 0 L 30 -22 L 30 22 Z" fill={look.bow} stroke={K.ol} strokeWidth={6} strokeLinejoin="round" />
                <circle r={11} fill={look.bow} stroke={K.ol} strokeWidth={5} />
              </g>
            )}
            <Face skin={skin} mood={mood} lid={lid} look={eyes} brow={brow} browTilt={browTilt} eyeY={18} mouthY={76} />
          </g>
        </g>
        {armRFront && arm(armR, pencil, handR)}
      </g>
    </g>
  );
};

export type TeacherProps = {
  t: number; x: number; y: number; s?: number; mood?: Mood; lid?: number; eyes?: P; brow?: number; talk?: number;
  /** pointer target in teacher-local coords, weight 0..1 (0 = arm resting) */
  aim?: P; aimW?: number; shrug?: number; nod?: number; tilt?: number; tap?: number;
  /** free right arm pose (teacher-local) blended in with weight rW, and its hand shape */
  rArm?: Arm; rW?: number; rHand?: HandKind;
  /** extra body bob in px (laughing) */
  bounce?: number;
};
/** Teacher right-arm poses (teacher-local). */
export const TEACH_ARMS = {
  up: {S: [150, -770], E: [262, -650], H: [286, -836]} as Arm, // forearm up: thumbs-up / one finger / open palm
  wave: {S: [150, -770], E: [290, -700], H: [330, -900]} as Arm,
  head: {S: [150, -770], E: [270, -900], H: [150, -1066]} as Arm, // scratching the back of the head
  palm: {S: [150, -770], E: [250, -620], H: [330, -700]} as Arm, // open palm offered to the class
};
const TS: P = [-150, -770]; // left shoulder (screen-left, board side)
const L1 = 200, L2 = 190, PTR = 440;
/** 2-bone arm reaching so a pointer of length PTR touches `target` (clamped). */
export const pointerArm = (S: P, target: P, tap = 0) => {
  const dx = target[0] - S[0], dy = target[1] - S[1];
  const d = Math.hypot(dx, dy) || 1;
  const ux = dx / d, uy = dy / d;
  const hd = Math.max(120, Math.min(L1 + L2 - 12, d - PTR + tap));
  const H: P = [S[0] + ux * hd, S[1] + uy * hd];
  const a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + hd * hd - L2 * L2) / (2 * L1 * hd))));
  const base = Math.atan2(uy, ux);
  const ang = base - a; // elbow bends downward for a left-pointing arm
  const E: P = [S[0] + Math.cos(ang) * L1, S[1] + Math.sin(ang) * L1];
  const altE: P = [S[0] + Math.cos(base + a) * L1, S[1] + Math.sin(base + a) * L1];
  return {S, E: E[1] > altE[1] ? E : altE, H, u: [ux, uy] as P};
};
/** Teacher: batik shirt (2-colour kawung pattern), glasses, moustache, pointer stick. Origin = between the feet. */
export const Teacher: React.FC<TeacherProps> = ({t, x, y, s = 1, mood = 'smile', lid = 0, eyes = [0, 0], brow = 0, talk = 0, aim = [-600, -900], aimW = 1, shrug = 0, nod = 0, tilt = 0, tap = 0, rArm, rW = 0, rHand = 'ball', bounce = 0}) => {
  // HALUS full (v1.16): idle squash/stretch from the feet + head sway, soft contact shadow. The pointer target is
  // pre-divided by the squash so the stick still lands exactly on its board point.
  const halus = useHalus('PAPAN').full;
  const idle = halusIdle(t, 3.7, halus);
  aim = [aim[0] / idle.sx, aim[1] / idle.sy];
  tilt += idle.head;
  const breathe = Math.sin(t * 2.1) * 6 + bounce;
  const skin = '#E3A877';
  const sh = shrug * 24;
  // left arm (holds pointer)
  const pa = pointerArm([TS[0], TS[1] - sh], aim, tap);
  const restL: Arm = {S: [TS[0], TS[1] - sh], E: [-196, -590], H: [-188, -446]};
  const shrugL: Arm = {S: [TS[0], TS[1] - sh], E: [-282, -640], H: [-330, -790]};
  let L: Arm = lerpArm(restL, {S: pa.S, E: pa.E, H: pa.H}, aimW);
  L = lerpArm(L, shrugL, shrug);
  // blend the pointer DIRECTION by angle (a vector lerp collapses mid-swing and whips the stick round)
  const restU: P = [0.05, 1], shrugU: P = [0.15, 0.99];
  const angOf = (v: P) => Math.atan2(v[1], v[0]);
  const lerpAng = (a: number, b: number, k: number) => {
    let d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return a + d * k;
  };
  const ang = lerpAng(lerpAng(angOf(restU), angOf(pa.u), aimW), angOf(shrugU), shrug);
  const u: P = [Math.cos(ang), Math.sin(ang)];
  const restR: Arm = {S: [150, -770 - sh], E: [214, -600], H: [168, -478]};
  const shrugR: Arm = {S: [150, -770 - sh], E: [232, -640], H: [214, -800]};
  let R = lerpArm(restR, shrugR, shrug);
  if (rArm && rW > 0) R = lerpArm(R, {S: R.S, E: rArm.E, H: rArm.H}, rW);
  const ptrTip: P = [L.H[0] + u[0] * PTR, L.H[1] + u[1] * PTR];
  const ptrBack: P = [L.H[0] - u[0] * 40, L.H[1] - u[1] * 40];
  const headTilt = tilt + nod;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${halus ? `${(s * idle.sx).toFixed(4)} ${(s * idle.sy).toFixed(4)}` : s})`}>
      {halus && <ellipse cx={0} cy={-10} rx={175} ry={30} fill={K.ol} opacity={0.32} filter="url(#hl-soft)" />}
      {/* legs + shoes */}
      <rect x={-84} y={-430} width={74} height={400} rx={10} fill={K.pants} stroke={K.ol} strokeWidth={OLW} />
      <rect x={10} y={-430} width={74} height={400} rx={10} fill={K.pants} stroke={K.ol} strokeWidth={OLW} />
      <rect x={52} y={-426} width={28} height={392} fill={K.pantsShade} />
      <ellipse cx={-56} cy={-18} rx={62} ry={26} fill={K.hair} stroke={K.ol} strokeWidth={OLW} />
      <ellipse cx={56} cy={-18} rx={62} ry={26} fill={K.hair} stroke={K.ol} strokeWidth={OLW} />
      <g transform={`translate(0 ${breathe.toFixed(1)})`}>
        {/* torso (batik) */}
        <path d={`M -170 -380 L -178 -${690 + sh} Q -172 -${800 + sh} -84 -${806 + sh} L 84 -${806 + sh} Q 172 -${800 + sh} 178 -${690 + sh} L 170 -380 Z`} fill="url(#pap-batik)" stroke={K.ol} strokeWidth={OLW} strokeLinejoin="round" />
        <path d={`M 120 -${800 + sh} Q 172 -${796 + sh} 176 -${690 + sh} L 168 -382 L 128 -382 Z`} fill={K.ol} opacity={0.22} />
        <rect x={-34} y={-872} width={68} height={74} fill={skin} stroke={K.ol} strokeWidth={OLW} />
        <path d={`M -70 -${806 + sh} L 0 -742 L 70 -${806 + sh} L 34 -${818 + sh} L 0 -790 L -34 -${818 + sh} Z`} fill={K.batik} stroke={K.ol} strokeWidth={6} strokeLinejoin="round" />
        {[-700, -620, -540, -460].map((by) => <circle key={by} cx={0} cy={by} r={7} fill={K.paper} stroke={K.ol} strokeWidth={4} />)}
        {/* right arm (behind nothing) */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={`M ${R.S[0]} ${R.S[1]} L ${R.E[0]} ${R.E[1]} L ${R.H[0]} ${R.H[1]}`} stroke={K.ol} strokeWidth={60} />
          <path d={`M ${R.S[0]} ${R.S[1]} L ${R.E[0]} ${R.E[1]} L ${R.H[0]} ${R.H[1]}`} stroke="url(#pap-batik)" strokeWidth={44} />
        </g>
        {handShape(R.E, R.H, skin, 30, rW > 0.5 ? rHand : 'ball')}
        {/* head */}
        <g transform={`rotate(${headTilt.toFixed(2)} 0 -850)`}>
          <g transform="translate(0 -968)">
            <circle cx={-118} cy={10} r={26} fill={skin} stroke={K.ol} strokeWidth={OLW} />
            <circle cx={118} cy={10} r={26} fill={skin} stroke={K.ol} strokeWidth={OLW} />
            <ellipse rx={122} ry={130} fill={skin} stroke={K.ol} strokeWidth={OLW} />
            <path d="M -126 -6 Q -134 -150 6 -150 Q 132 -146 126 -6 Q 110 -80 40 -92 Q -40 -64 -110 -60 Q -122 -40 -126 -6 Z" fill={K.hair} stroke={K.ol} strokeWidth={OLW} strokeLinejoin="round" />
            <Face skin={skin} mood={mood} lid={lid} look={eyes} brow={brow} eyeR={[11, 14]} eyeY={6} eyeX={46} mouthY={74} talk={talk} />
            {/* glasses */}
            <g fill="none" stroke={K.ol} strokeWidth={7}>
              <circle cx={-46} cy={6} r={34} />
              <circle cx={46} cy={6} r={34} />
              <path d="M -12 2 Q 0 -6 12 2 M -80 0 L -116 -6 M 80 0 L 116 -6" />
            </g>
            <path d="M -44 52 Q -22 38 0 50 Q 22 38 44 52 Q 22 62 0 56 Q -22 62 -44 52 Z" fill={K.hair} stroke={K.ol} strokeWidth={4} />
            <path d="M -4 22 Q 8 34 -2 42" stroke={K.ol} strokeWidth={6} fill="none" strokeLinecap="round" />
          </g>
        </g>
        {/* left arm + pointer */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={`M ${ptrBack[0]} ${ptrBack[1]} L ${ptrTip[0]} ${ptrTip[1]}`} stroke={K.ol} strokeWidth={26} />
          <path d={`M ${ptrBack[0]} ${ptrBack[1]} L ${ptrTip[0]} ${ptrTip[1]}`} stroke={K.pointer} strokeWidth={13} />
          <circle cx={ptrTip[0]} cy={ptrTip[1]} r={10} fill={K.red} stroke={K.ol} strokeWidth={5} />
          <path d={`M ${L.S[0]} ${L.S[1]} L ${L.E[0]} ${L.E[1]} L ${L.H[0]} ${L.H[1]}`} stroke={K.ol} strokeWidth={60} />
          <path d={`M ${L.S[0]} ${L.S[1]} L ${L.E[0]} ${L.E[1]} L ${L.H[0]} ${L.H[1]}`} stroke="url(#pap-batik)" strokeWidth={44} />
          <circle cx={L.H[0]} cy={L.H[1]} r={30} fill={skin} stroke={K.ol} strokeWidth={6} />
        </g>
      </g>
    </g>
  );
};
/** World point of the teacher's pointer tip given the same props (for planning). */
export const teacherLocal = (world: P, tx: number, ty: number, s: number): P => [(world[0] - tx) / s, (world[1] - ty) / s];

/** Flat "?" or "!" mark (white with dark outline), pops in. */
export const Mark: React.FC<{x: number; y: number; q: number; ch?: string; size?: number; rot?: number; color?: string}> = ({x, y, q, ch = '?', size = 150, rot = 0, color = K.shirt}) =>
  q <= 0.001 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${q.toFixed(3)})`}>
      <text x={0} y={size * 0.35} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={size} fill={color} stroke={K.ol} strokeWidth={14} paintOrder="stroke fill" strokeLinejoin="round">{ch}</text>
    </g>
  );

/** "Aha!" lightbulb (flat yellow, outline, short rays). */
export const Bulb: React.FC<{x: number; y: number; q: number}> = ({x, y, q}) =>
  q <= 0.001 ? null : (
    <g transform={`translate(${x} ${y}) scale(${q.toFixed(3)})`}>
      {[-60, -20, 20, 60, 100, -100].map((a) => (
        <line key={a} x1={0} y1={-110} x2={0} y2={-150} stroke={K.ol} strokeWidth={10} strokeLinecap="round" transform={`rotate(${a} 0 -10)`} />
      ))}
      <circle cx={0} cy={-10} r={62} fill={K.yellow} stroke={K.ol} strokeWidth={OLW} />
      <path d="M -30 -40 Q -36 -6 -14 12" stroke={K.shirt} strokeWidth={12} fill="none" strokeLinecap="round" />
      <rect x={-30} y={44} width={60} height={44} rx={8} fill={K.grey} stroke={K.ol} strokeWidth={OLW} />
      <path d="M -30 60 H 30 M -30 74 H 30" stroke={K.ol} strokeWidth={5} />
    </g>
  );

// ---------- screen-space type ----------
/** Thumbnail-style bold white title with a dark outline + hard flat drop (no blur); words pop on their cues. */
export const Title: React.FC<{t: number; words: Array<{text: string; at: number; color?: string}>; y: number; size?: number; out?: number}> = ({t, words, y, size = 116, out}) => {
  const fr = useFrame();
  const side = fr.wide ? fr.safe.side : 64;
  return (
    <div style={{position: 'absolute', left: side, right: side, top: y, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 26px', zIndex: 40}}>
      {words.map((w, i) => {
        const q = popIO(t, w.at, out, 0.32);
        return (
          <span key={i} style={{display: 'inline-block', fontFamily: HEAD, fontWeight: 800, fontSize: size, lineHeight: 1.05, color: w.color ?? K.shirt,
            WebkitTextStroke: `${Math.round(size * 0.16)}px ${K.capOl}`, paintOrder: 'stroke fill', textShadow: `0 ${Math.round(size * 0.07)}px 0 ${K.capOl}`,
            transform: `scale(${q.toFixed(3)}) rotate(${(i % 2 ? 2 : -2) * q}deg)`, opacity: q > 0.01 ? 1 : 0, letterSpacing: 1}}>{w.text}</span>
        );
      })}
    </div>
  );
};

/** Word-synced caption: Baloo 2 800, white with dark outline on a flat dark pill, active word chalk-yellow; frame-exact.
 *  Portrait top 1572 (x 64–1016); landscape top H − 196 (max 1400 px wide, centred). */
export const Caption: React.FC<{t: number; pages: CaptionPage[]; top?: number}> = ({t, pages, top}) => {
  const fr = useFrame();
  const pg = pageAt(t, pages);
  if (!pg) return null;
  const k = eout(t, pg.start - 0.08, pg.start + 0.1);
  const side = fr.wide ? (fr.W - fr.captionW) / 2 : 64;
  return (
    <div style={{position: 'absolute', left: side, right: side, top: top ?? (fr.wide ? fr.H - 196 : 1572), display: 'flex', justifyContent: 'center', zIndex: 50}}>
      {/* flat dark backing pill: keeps the caption clean over desk props (books, apple, pencil cup) */}
      <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: fr.wide ? 60 : 64, lineHeight: 1.12, textAlign: 'center', transform: `translateY(${(1 - k) * 14}px)`, background: K.capOl, borderRadius: 28, padding: '8px 30px 14px', opacity: k > 0.01 ? 1 : 0}}>
        {pg.words.map((w, i) => {
          const next = pg.words[i + 1];
          const on = t >= w.start && t < (next ? next.start : pg.end + 1);
          return (
            <React.Fragment key={i}>
              <span style={{color: on ? K.yellow : K.shirt, WebkitTextStroke: `12px ${K.capOl}`, paintOrder: 'stroke fill', textShadow: `0 5px 0 ${K.capOl}`}}>{display(w.word)}</span>
              {i < pg.words.length - 1 ? ' ' : ''}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ---------- HALUS (v1.16) ----------
/** Drift of a scene chain: scene k runs from starts[k] to starts[k + 1] (the last to `end`); drifts blend over ±0.3 s
 *  around each start, so the picture never jumps (put the starts on camera moves). Zoom always covers the pan. */
export const papanDrift = (t: number, starts: number[], end: number, amount = 1, W = 1080) => {
  let z = 1, px = 0;
  starts.forEach((a, k) => {
    const d = halusDrift(t, a, starts[k + 1] ?? end, k, amount);
    const w = k === 0 ? 1 : eio(t, a - 0.3, a + 0.3);
    z = lerp(z, d.z, w);
    px = lerp(px, d.px, w);
  });
  return {z: Math.max(z, 1 + (2 * Math.abs(px)) / W), px};
};
/** PAPAN scene helper: wrap the shared <World pose> in it. HALUS on → slow drift in screen space on top of the camera
 *  stations (push-ins / pull-backs keep working); HALUS off → pass-through, exactly v1.15. Insert panels, Title and
 *  Caption go OUTSIDE it. */
export const PapanStage: React.FC<{t: number; starts?: number[]; end: number; amount?: number; fx?: number; fy?: number; children: React.ReactNode}> = ({
  t, starts = [0], end, amount = 0.8, fx, fy, children,
}) => {
  const fr = useFrame();
  if (!useHalus('PAPAN').drift) return <>{children}</>;
  const {z, px} = papanDrift(t, starts, end, amount, fr.W);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: fr.W, height: fr.H, transformOrigin: `${fx ?? fr.W / 2}px ${fy ?? fr.H * 0.47}px`,
      transform: `translateX(${px.toFixed(2)}px) scale(${z.toFixed(5)})`}}>
      {children}
    </div>
  );
};
