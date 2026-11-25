import React from 'react';
import {Easing} from 'remotion';
import {drawOn, lerp, Pose, rnd, roughLine, roughRect, useFrame} from '../shared';
import {halusDissolve, HalusDefs, halusDrift, halusLevel, useHalus} from '../../lib/halus';
import {
  BOARD, Bunting, ChalkDefs, ChalkLine, ChalkText, chalkW, clamp01, Clock, DustSpecks, eout, HEAD, hold, KidLook, OLW, PAP, Reveal, Room,
  Window, Wipe, WipeDust, Wiped,
} from './kit';

// PAPAN props — reusable pieces for full episodes: the classroom set (`CLASS` portrait/landscape layouts + camera
// stations, `ClassSvg`, `ClassroomBack`), board scene switching under eraser wipes (`BoardScenes`), chalk rows, the big
// close-up counting hand (thumb IK over the 12 finger segments, folding fingers), slide-up inserts (desk / notebook
// page), chalk stamps, hatch fills, stars, sun rays, cuneiform wedges, pyramids, a school bell, a chalk hand outline,
// acting helpers (talk, blinks, giggle bounce, pointer aims). Flat colours, outlines, no filters; pure f(t).

const K = PAP;
type P = [number, number];
const deg = Math.PI / 180;
const lerpP = (a: P, b: P, k: number): P => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------------------------------------------------------------- big counting hand
/** Right hand, palm towards the viewer, thumb on +x. Origin = wrist centre, fingers point up (−y). Pinky → index. */
export const HAND = {
  fingers: [
    {x: -124, y: -352, L: 150, w: 80, a: -9},
    {x: -42, y: -372, L: 192, w: 84, a: -3},
    {x: 44, y: -376, L: 206, w: 86, a: 2},
    {x: 128, y: -358, L: 184, w: 84, a: 8},
  ],
  thumbBase: [116, -196] as P, t1: 158, t2: 150, tw: 84,
};
const SEG_K = [0.2, 0.56, 0.86];
const fingerGeo = (i: number, bend = 0, fold = 0) => {
  const F = HAND.fingers[i];
  const a = (F.a + bend * 18 - fold * 4) * deg;
  const L = F.L * (1 - 0.16 * bend) * (1 - 0.6 * fold);
  return {bx: F.x, by: F.y, ux: Math.sin(a), uy: -Math.cos(a), L, w: F.w};
};
/** Hand-local centre of segment `seg` (0 = base, 1 = middle, 2 = tip) of finger i (0 pinky … 3 index). */
export const segPoint = (i: number, seg: number, bend = 0, fold = 0): P => {
  const g = fingerGeo(i, bend, fold);
  const k = SEG_K[seg];
  return [g.bx + g.ux * g.L * k, g.by + g.uy * g.L * k];
};
export const fingerTip = (i: number, bend = 0, fold = 0): P => {
  const g = fingerGeo(i, bend, fold);
  return [g.bx + g.ux * g.L, g.by + g.uy * g.L];
};
export const THUMB_REST: P = [HAND.thumbBase[0] + 96, HAND.thumbBase[1] - 196];
/** Thumb joints for a target (hand-local) blended by w (cartoon rubber stretch up to 1.22×). */
export const thumbPose = (target: P | null, w: number) => {
  const B = HAND.thumbBase;
  const T = target ? lerpP(THUMB_REST, target, clamp01(w)) : THUMB_REST;
  const dx = T[0] - B[0], dy = T[1] - B[1];
  const d = Math.max(1, Math.hypot(dx, dy));
  // cartoon thumb: stretches a little for far targets, shortens (foreshortened) for near ones so it never hairpins
  const reach = HAND.t1 + HAND.t2;
  const st = d > reach - 10 ? Math.min(1.22, d / (reach - 10)) : d < reach * 0.8 ? Math.max(0.55, d / (reach * 0.8)) : 1;
  const l1 = HAND.t1 * st, l2 = HAND.t2 * st;
  const dd = Math.min(d, l1 + l2 - 1);
  const a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd))));
  const base = Math.atan2(dy, dx);
  const J: P = [B[0] + Math.cos(base + a) * l1, B[1] + Math.sin(base + a) * l1];
  const tip: P = [B[0] + Math.cos(base) * dd, B[1] + Math.sin(base) * dd];
  return {B, J, tip};
};
const PALM = 'M -150 -6 C -184 -120 -182 -300 -164 -366 Q -150 -412 -84 -414 L 118 -406 Q 182 -398 180 -330 C 180 -250 172 -118 142 -6 Z';

type BigHandProps = {
  x: number; y: number; s?: number; mirror?: boolean; skin?: string; shade?: string;
  /** per finger (pinky → index): counting bend 0..1, fold 0..1 */
  bend?: number[]; fold?: number[];
  thumbTarget?: P | null; thumbW?: number; thumbFold?: number; thumbHi?: number;
  /** highlighted segments: [finger, seg, amount 0..1] */
  hi?: Array<[number, number, number]>;
};
/** The close-up counting hand (insert shots). Shirt cuff below the wrist. */
export const BigHand: React.FC<BigHandProps> = ({x, y, s = 1, mirror, skin = '#F1C6A0', shade = '#DDA77F', bend = [0, 0, 0, 0], fold = [0, 0, 0, 0], thumbTarget = null, thumbW = 0, thumbFold = 0, thumbHi = 0, hi = []}) => {
  const geos = HAND.fingers.map((_, i) => fingerGeo(i, bend[i] ?? 0, fold[i] ?? 0));
  const palmC: P = [-6, -226];
  const th = thumbFold > 0.001 ? thumbPose(lerpP(thumbTarget ?? THUMB_REST, palmC, thumbFold), Math.max(thumbW, thumbFold)) : thumbPose(thumbTarget, thumbW);
  const seg = (g: ReturnType<typeof fingerGeo>, k0: number, k1: number) =>
    `M ${(g.bx + g.ux * g.L * k0).toFixed(1)} ${(g.by + g.uy * g.L * k0).toFixed(1)} L ${(g.bx + g.ux * g.L * k1).toFixed(1)} ${(g.by + g.uy * g.L * k1).toFixed(1)}`;
  const crease = (g: ReturnType<typeof fingerGeo>, k: number) => {
    const cx = g.bx + g.ux * g.L * k, cy = g.by + g.uy * g.L * k;
    const px = -g.uy, py = g.ux; // perpendicular
    const h = g.w * 0.3;
    return `M ${(cx - px * h).toFixed(1)} ${(cy - py * h).toFixed(1)} Q ${(cx + g.ux * 6).toFixed(1)} ${(cy + g.uy * 6).toFixed(1)} ${(cx + px * h).toFixed(1)} ${(cy + py * h).toFixed(1)}`;
  };
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(mirror ? -s : s).toFixed(4)} ${s.toFixed(4)})`}>
      {/* sleeve cuff */}
      <rect x={-196} y={-30} width={392} height={1400} rx={30} fill={K.shirt} stroke={K.ol} strokeWidth={OLW} />
      <rect x={-196} y={-30} width={392} height={70} rx={24} fill={K.shirtShade} stroke={K.ol} strokeWidth={OLW} />
      <rect x={-112} y={-60} width={224} height={60} fill={skin} stroke={K.ol} strokeWidth={OLW} />
      <g fill="none" strokeLinecap="round">
        {geos.map((g, i) => <path key={i} d={seg(g, -0.2, 1)} stroke={K.ol} strokeWidth={g.w + OLW * 2} />)}
      </g>
      <path d={PALM} fill={skin} stroke={K.ol} strokeWidth={OLW} strokeLinejoin="round" />
      <g fill="none" strokeLinecap="round">
        {geos.map((g, i) => <path key={i} d={seg(g, -0.25, 1)} stroke={skin} strokeWidth={g.w} />)}
        {geos.map((g, i) => (fold[i] ?? 0) > 0.25 ? <path key={`k${i}`} d={seg(g, 0.72, 1)} stroke={shade} strokeWidth={g.w * 0.86} opacity={clamp01(((fold[i] ?? 0) - 0.25) * 3)} /> : null)}
        {hi.map(([fi, sg, a], j) => {
          if (a <= 0.01) return null;
          const g = geos[fi];
          const k0 = [0.02, 0.4, 0.72][sg], k1 = [0.38, 0.7, 0.98][sg];
          return <path key={`h${j}`} d={seg(g, k0 + 0.03, k1 - 0.03)} stroke={K.yellow} strokeWidth={g.w * 0.72 * a} />;
        })}
        {geos.map((g, i) => (
          <g key={`c${i}`} stroke={K.ol} strokeWidth={5}>
            {(fold[i] ?? 0) < 0.5 && <path d={crease(g, 0.38)} />}
            {(fold[i] ?? 0) < 0.5 && <path d={crease(g, 0.7)} />}
          </g>
        ))}
        {/* palm lines */}
        <path d="M -120 -250 Q -20 -290 120 -300" stroke={shade} strokeWidth={7} />
        <path d="M -128 -176 Q -10 -200 74 -150" stroke={shade} strokeWidth={7} />
        <path d="M 60 -40 Q 20 -150 70 -280" stroke={shade} strokeWidth={7} />
      </g>
      {/* thumb */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={`M ${th.B[0]} ${th.B[1]} L ${th.J[0].toFixed(1)} ${th.J[1].toFixed(1)} L ${th.tip[0].toFixed(1)} ${th.tip[1].toFixed(1)}`} stroke={K.ol} strokeWidth={HAND.tw + OLW * 2} />
        <path d={`M ${th.B[0] - 40} ${th.B[1] + 70} L ${th.B[0]} ${th.B[1]} L ${th.J[0].toFixed(1)} ${th.J[1].toFixed(1)} L ${th.tip[0].toFixed(1)} ${th.tip[1].toFixed(1)}`} stroke={skin} strokeWidth={HAND.tw} />
        {thumbHi > 0.01 && <circle cx={th.tip[0]} cy={th.tip[1]} r={HAND.tw * 0.5 + 16} stroke={K.yellow} strokeWidth={10 * thumbHi} />}
      </g>
    </g>
  );
};
/** Hand-local → insert coords for a BigHand placed at (x, y, s, mirror). */
export const handToScreen = (p: P, x: number, y: number, s: number, mirror?: boolean): P => [x + (mirror ? -1 : 1) * p[0] * s, y + p[1] * s];

/** Numbered disc (pops in) — segment counter labels. */
export const CountDisc: React.FC<{x: number; y: number; n: string; q: number; r?: number; bg?: string}> = ({x, y, n, q, r = 34, bg = K.paper}) =>
  q <= 0.001 ? null : (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${q.toFixed(3)})`}>
      <circle r={r} fill={bg} stroke={K.ol} strokeWidth={6} />
      <text y={r * 0.36} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={r * 1.12} fill={K.ol}>{n}</text>
    </g>
  );

/** Flat label pill (head font, outline) — insert / screen labels. */
export const Pill: React.FC<{x: number; y: number; text: string; q: number; size?: number; bg?: string; fg?: string; rot?: number}> = ({x, y, text, q, size = 64, bg = K.yellow, fg = K.ol, rot = 0}) => {
  if (q <= 0.001) return null;
  const w = text.length * size * 0.58 + size * 0.9;
  const h = size * 1.32;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot}) scale(${q.toFixed(3)})`}>
      <rect x={-w / 2} y={-h / 2 + size * 0.1} width={w} height={h} rx={h / 2} fill={K.ol} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={bg} stroke={K.ol} strokeWidth={7} />
      <text y={size * 0.36} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={size} fill={fg}>{text}</text>
    </g>
  );
};

// ---------------------------------------------------------------- inserts
/** Slide-up insert panel (screen space W×H, h = frame height: 1920 portrait, 1080 landscape): rises from the bottom over
 *  [inA, inA+0.4], leaves upward over [outA, outA+0.4]. null = not on screen. */
export const insertY = (t: number, inA: number, outA: number, d = 0.4, h = 1920) => {
  if (t < inA || t > outA + d) return null;
  if (t < inA + d) return h * (1 - Easing.out(Easing.cubic)(clamp01((t - inA) / d)));
  if (t < outA) return 0;
  return -h * Easing.in(Easing.cubic)(clamp01((t - outA) / d));
};
/** v1.16 insert state: HALUS off → the classic slide-up/leave-up (`y` from insertY, opacity 1, z 1); HALUS on → the
 *  insert zoom-dissolves in over [inA, inA + 0.44] and fades out over [outA, outA + d] (y 0 while shown). Spread it into
 *  <InsertPanel {...papanInsert(t, IN, OUT, 0.4, fr.H)}>. */
export const papanInsert = (t: number, inA: number, outA: number, d = 0.4, h = 1920): {y: number | null; opacity?: number; z?: number} => {
  if (halusLevel('PAPAN') === 'off') return {y: insertY(t, inA, outA, d, h)};
  if (t < inA || t > outA + d) return {y: null};
  const dz = halusDissolve(t, inA + 0.16, null, 'whip');
  const out = 1 - Easing.inOut(Easing.cubic)(clamp01((t - outA) / d));
  const drift = halusDrift(t, inA, outA, 1, 0.6).z; // slow pull-back while the insert holds
  return {y: 0, opacity: dz.opacity * out, z: dz.z * drift * (1 + 0.05 * (1 - out))};
};
/** Screen-space insert panel (full frame, slides on `y` from insertY) with a dark edge so it reads as a card over the room.
 *  `opacity` / `z` (from papanInsert) = the HALUS zoom-dissolve about the frame centre. */
export const InsertPanel: React.FC<{y: number | null; opacity?: number; z?: number; children: React.ReactNode}> = ({y, opacity, z, children}) => {
  const {W, H} = useFrame();
  if (y === null) return null;
  const fx = W / 2, fy = H / 2;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, zIndex: 30, overflow: 'hidden', ...(opacity !== undefined ? {opacity} : {})}}>
      <g transform={z !== undefined ? `translate(${fx} ${fy}) scale(${z.toFixed(5)}) translate(${-fx} ${(y - fy).toFixed(1)})` : `translate(0 ${y.toFixed(1)})`}>
        <rect x={-10} y={-18} width={W + 20} height={H + 36} fill={PAP.ol} />
        {children}
      </g>
    </svg>
  );
};
/** Desk-top background (wood) for a hand close-up. */
export const DeskTop: React.FC = () => (
  <g>
    <rect x={-200} y={-200} width={3600} height={2400} fill={K.deskTop} />
    {[180, 520, 900, 1330, 1720].map((y, i) => (
      <path key={i} d={`M -200 ${y} C 400 ${y - 30} 900 ${y + 40} 1600 ${y} S 2800 ${y - 30} 3400 ${y + 10}`} stroke={K.desk} strokeWidth={10} fill="none" />
    ))}
    <rect x={-200} y={-200} width={3600} height={24} fill={K.deskShade} />
  </g>
);
/** Lined notebook page (screen space). */
export const NotebookPage: React.FC<{x?: number; y?: number; w?: number; h?: number; rot?: number}> = ({x = 70, y = 180, w = 940, h = 1500, rot = -2}) => (
  <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
    <rect x={x + 10} y={y + 16} width={w} height={h} rx={14} fill={K.ol} />
    <rect x={x} y={y} width={w} height={h} rx={14} fill={K.paper} stroke={K.ol} strokeWidth={OLW} />
    {Array.from({length: Math.floor((h - 160) / 86)}, (_, i) => (
      <line key={i} x1={x + 10} x2={x + w - 10} y1={y + 160 + i * 86} y2={y + 160 + i * 86} stroke={K.blue} strokeWidth={4} />
    ))}
    <line x1={x + 150} x2={x + 150} y1={y + 6} y2={y + h - 6} stroke={K.pink} strokeWidth={5} />
    {[0.18, 0.5, 0.82].map((k) => <circle key={k} cx={x + 60} cy={y + h * k} r={22} fill={K.deskTop} stroke={K.ol} strokeWidth={5} />)}
  </g>
);
/** Pencil-holding hand (sleeve from the lower right) whose pencil tip is at (x, y). */
export const PencilHand: React.FC<{x: number; y: number; skin?: string; s?: number}> = ({x, y, skin = '#E2AE82', s = 1}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})`}>
    {/* sleeve (white shirt) from the hand down-right off the page, with a cuff seam */}
    <path d="M 96 60 L 640 620" stroke={K.ol} strokeWidth={168} strokeLinecap="round" />
    <path d="M 96 60 L 640 620" stroke={K.shirt} strokeWidth={152} strokeLinecap="round" />
    <path d="M 118 176 L 214 82" stroke={K.ol} strokeWidth={6} strokeLinecap="round" />
    <path d="M 96 60 L 166 132" stroke={skin} strokeWidth={96} strokeLinecap="round" />
    {/* pencil: tip at the origin, leaning up-right through the fist */}
    <g transform="rotate(-25)">
      <path d="M 0 0 L 34 -13 L 34 13 Z" fill={K.deskTop} stroke={K.ol} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 0 0 L 12 -4.6 L 12 4.6 Z" fill={K.ol} />
      <rect x={34} y={-13} width={170} height={26} fill={K.yellow} stroke={K.ol} strokeWidth={5} />
      <rect x={204} y={-13} width={26} height={26} rx={6} fill={K.pink} stroke={K.ol} strokeWidth={5} />
    </g>
    <circle cx={76} cy={20} r={58} fill={skin} stroke={K.ol} strokeWidth={OLW} />
    <circle cx={44} cy={-14} r={22} fill={skin} stroke={K.ol} strokeWidth={6} />
    <path d="M 50 44 Q 74 58 104 46" stroke={K.ol} strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);

// ---------------------------------------------------------------- chalk pieces
/** Chalk stamp: rough box + text that slams in (1.4 → 1) at `at`. Board-local. */
export const ChalkStamp: React.FC<{t: number; at: number; x: number; y: number; text: string; size?: number; color?: string; rot?: number; id: string}> = ({t, at, x, y, text, size = 90, color = K.pink, rot = -8, id}) => {
  if (t < at) return null;
  const k = clamp01((t - at) / 0.26);
  const sc = k < 1 ? lerp(1.45, 1, Easing.out(Easing.back(2.2))(k)) : 1;
  const w = chalkW(text, size) + size * 0.7, h = size * 1.3;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc.toFixed(3)})`}>
      <ChalkLine t={t} d={roughRect(-w / 2, -h / 2, w, h, at * 7, 5)} at={-99} color={color} w={10} />
      <ChalkLine t={t} d={roughRect(-w / 2 + 14, -h / 2 + 12, w - 28, h - 24, at * 7 + 3, 4)} at={-99} color={color} w={5} />
      <ChalkText id={`st-${id}`} t={t} x={0} y={size * 0.36} text={text} size={size} at={-99} color={color} />
    </g>
  );
};
export const CHECK = (x: number, y: number, s = 1) => `M ${x - 40 * s} ${y} L ${x - 10 * s} ${y + 32 * s} L ${x + 52 * s} ${y - 44 * s}`;

/** Diagonal chalk hatching that fills `clip` (board-local path) line by line between at and at+dur. */
export const Hatch: React.FC<{t: number; id: string; clip: string; box: [number, number, number, number]; at: number; dur?: number; color?: string; gap?: number; w?: number}> = ({t, id, clip, box, at, dur = 0.5, color = K.yellow, gap = 26, w = 7}) => {
  if (t < at) return null;
  const [x0, y0, x1, y1] = box;
  // irregular spacing (0.7–1.3 × gap, seeded): a perfectly regular stripe period strobes under camera moves
  const span = x1 - x0 + (y1 - y0);
  const offs: number[] = [];
  for (let o = 0, i = 0; o < span; i++) {
    offs.push(o);
    o += gap * (0.7 + 0.6 * rnd(i * 7.3 + id.length * 3.1));
  }
  const n = offs.length;
  return (
    <g>
      <defs><clipPath id={`pap-h-${id}`}><path d={clip} /></clipPath></defs>
      <g clipPath={`url(#pap-h-${id})`}>
        {Array.from({length: n}, (_, i) => {
          const c = x0 - (y1 - y0) + offs[i];
          return <ChalkLine key={i} t={t} d={roughLine([c, y1], [c + (y1 - y0), y0], i * 3 + 1, 3)} at={at + (i / n) * dur * 0.7} dur={dur * 0.3} color={color} w={w} />;
        })}
      </g>
    </g>
  );
};
/** Pie wedge path between clock angles a0..a1 (deg, 0 = 12 o'clock, clockwise). */
export const wedgePath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const pt = (a: number) => `${(cx + Math.sin(a * deg) * r).toFixed(1)} ${(cy - Math.cos(a * deg) * r).toFixed(1)}`;
  return `M ${cx} ${cy} L ${pt(a0)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${pt(a1)} Z`;
};
export const starPath = (x: number, y: number, r: number, rot = 0) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = (i * 36 + rot - 90) * deg, rr = i % 2 ? r * 0.45 : r;
    d += `${i ? 'L' : 'M'} ${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)} `;
  }
  return d + 'Z';
};
/** Crescent moon (two arcs). */
export const crescentPath = (x: number, y: number, r: number) =>
  `M ${x + r * 0.2} ${y - r} A ${r} ${r} 0 1 0 ${x + r * 0.2} ${y + r} A ${r * 0.78} ${r * 0.78} 0 1 1 ${x + r * 0.2} ${y - r} Z`;
/** Cuneiform: vertical wedge (= 1) and corner wedge (= 10), chalk outline paths. */
export const wedgeOne = (x: number, y: number, s = 1) => `M ${x - 14 * s} ${y} L ${x + 14 * s} ${y} L ${x} ${y + 18 * s} Z M ${x} ${y + 18 * s} L ${x} ${y + 54 * s}`;
export const wedgeTen = (x: number, y: number, s = 1) => `M ${x + 26 * s} ${y - 24 * s} L ${x - 6 * s} ${y} L ${x + 26 * s} ${y + 24 * s} M ${x - 6 * s} ${y} L ${x + 8 * s} ${y - 10 * s} L ${x + 8 * s} ${y + 10 * s} Z`;
/** Chalk outline of the counting hand (hand-local coords, for a board drawing) + its 8 creases. */
export const handOutline = () => {
  const fingers = HAND.fingers.map((F, i) => {
    const g = fingerGeo(i);
    const tx = g.bx + g.ux * g.L, ty = g.by + g.uy * g.L;
    const px = -g.uy * F.w * 0.5, py = g.ux * F.w * 0.5;
    return `M ${(g.bx - px).toFixed(1)} ${(g.by - py + 10).toFixed(1)} L ${(tx - px).toFixed(1)} ${(ty - py).toFixed(1)} A ${F.w / 2} ${F.w / 2} 0 0 1 ${(tx + px).toFixed(1)} ${(ty + py).toFixed(1)} L ${(g.bx + px).toFixed(1)} ${(g.by + py + 10).toFixed(1)}`;
  });
  const th = thumbPose(null, 0);
  const thumb = `M ${th.B[0] + 34} ${th.B[1] + 60} Q ${th.J[0] + 50} ${th.J[1] + 10} ${th.tip[0] + 36} ${th.tip[1] - 6} A 42 42 0 0 0 ${th.tip[0] - 40} ${th.tip[1] - 20} Q ${th.J[0] - 40} ${th.J[1] - 30} ${th.B[0] - 26} ${th.B[1] - 40}`;
  const palm = 'M -150 -6 C -184 -120 -182 -300 -164 -352 M 142 -6 C 160 -70 166 -120 160 -150';
  const creases = HAND.fingers.flatMap((F, i) => {
    const g = fingerGeo(i);
    return [0.38, 0.7].map((k) => {
      const cx = g.bx + g.ux * g.L * k, cy = g.by + g.uy * g.L * k;
      return `M ${(cx - F.w * 0.32).toFixed(1)} ${cy.toFixed(1)} L ${(cx + F.w * 0.32).toFixed(1)} ${cy.toFixed(1)}`;
    });
  });
  return {outline: [palm, ...fingers, thumb].join(' '), creases: creases.join(' ')};
};
/** Pyramid (chalk) with a few brick courses: apex (x, y), half-base hw, height h. */
export const pyramidPath = (x: number, y: number, hw: number, h: number) => {
  let d = `M ${x - hw} ${y + h} L ${x} ${y} L ${x + hw} ${y + h} Z M ${x} ${y} L ${x + hw * 0.28} ${y + h}`;
  for (let i = 1; i < 4; i++) {
    const yy = y + (h * i) / 4, ww = (hw * i) / 4;
    d += ` M ${(x - ww).toFixed(1)} ${yy.toFixed(1)} L ${(x + ww).toFixed(1)} ${yy.toFixed(1)}`;
  }
  return d;
};

// ---------------------------------------------------------------- room props
/** Wall school bell; ring 0..1 envelope makes it swing (≈5 Hz, damped by the caller's envelope). */
export const SchoolBell: React.FC<{x: number; y: number; t: number; ring: number; s?: number}> = ({x, y, t, ring, s = 1}) => {
  const swing = Math.sin(t * Math.PI * 2 * 5) * 14 * ring;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-16} y={-70} width={32} height={40} rx={6} fill={K.frameDark} stroke={K.ol} strokeWidth={6} />
      <g transform={`rotate(${swing.toFixed(2)} 0 -34)`}>
        <path d="M -70 50 Q -70 -40 0 -40 Q 70 -40 70 50 L 84 64 L -84 64 Z" fill={K.yellow} stroke={K.ol} strokeWidth={OLW} strokeLinejoin="round" />
        <path d="M 30 -24 Q 54 -8 56 40" stroke={K.paper} strokeWidth={10} fill="none" strokeLinecap="round" />
        <circle cx={-swing * 1.4} cy={74} r={16} fill={K.frameDark} stroke={K.ol} strokeWidth={6} />
      </g>
      {ring > 0.05 && [-1, 1].map((sd) => (
        <g key={sd} stroke={K.ol} strokeWidth={8} strokeLinecap="round" opacity={clamp01(ring * 2)}>
          <path d={`M ${sd * 104} -10 Q ${sd * 122} 10 ${sd * 104} 30`} fill="none" />
          <path d={`M ${sd * 132} -26 Q ${sd * 158} 10 ${sd * 132} 46`} fill="none" />
        </g>
      ))}
    </g>
  );
};

/** Chalk cloud bubble in paper colour (thought / question) with dark chalk text lines. */
export const SpeechCloud: React.FC<{x: number; y: number; q: number; w: number; h: number; lines: Array<{text: string; size: number; color?: string}>; tail: P; t: number; at: number; seed?: number}> = ({x, y, q, w, h, lines, tail, t, at, seed = 5}) => {
  if (q <= 0.001) return null;
  const n = 12;
  const pts: P[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd(seed + i * 2) * 0.12;
    pts.push([Math.cos(a) * w * 0.4, Math.sin(a) * h * 0.36]);
  }
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} `;
  pts.forEach((p, i) => {
    const qq = pts[(i + 1) % n];
    const r = (Math.hypot(qq[0] - p[0], qq[1] - p[1]) / 2) * (1.02 + rnd(seed + i) * 0.12);
    d += `A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${qq[0].toFixed(1)} ${qq[1].toFixed(1)} `;
  });
  const tot = lines.reduce((s, l) => s + l.size * 1.05, 0);
  let yy = -tot / 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${q.toFixed(3)})`}>
      {[0.25, 0.5, 0.75].map((k, j) => (
        <circle key={j} cx={lerp(tail[0], 0, k * 0.6)} cy={lerp(tail[1], 0, k * 0.6)} r={(14 + j * 9) * clamp01(q * 1.4 - (2 - j) * 0.15)} fill={K.paper} stroke={K.ol} strokeWidth={7} />
      ))}
      <path d={d + 'Z'} fill={K.paper} stroke={K.ol} strokeWidth={8} strokeLinejoin="round" />
      {lines.map((l, i) => {
        yy += l.size * 1.05;
        return <ChalkText key={i} id={`cl${seed}-${i}`} t={t} x={0} y={yy - l.size * 0.28} text={l.text} size={l.size} at={at + i * 0.25} cps={20} color={l.color ?? K.ol} grain={false} double={false} />;
      })}
    </g>
  );
};


// ---------------------------------------------------------------- classroom set (portrait + landscape)
type Spot = {x: number; y: number; s: number};
/** One classroom layout in world coordinates + its camera stations (shared `camera()` poses: (x, y) lands at the frame
 *  centre). Board content is board-local (0,0)-(960,1100) placed at world x = boardX, y = 0. */
export type ClassLayout = {
  /** room wall/floor extent and the SVG world box that holds it */
  room: [number, number]; view: {x: number; y: number; w: number; h: number};
  floorY: number; boardX: number;
  clock: {x: number; y: number; r: number}; bell: Spot; windows: Array<{x: number; y: number; w: number; h: number}>;
  /** bunting strings: [y, x0, x1] */
  bunting: Array<[number, number, number]>;
  teacherDesk: {x: number; y: number}; teacher: Spot;
  /** three student desks (desk-top centre = Kid origin), left → right */
  kids: Spot[];
  cams: {
    /** whole board, chalk readable (portrait: board fills the width; landscape: board left of centre + the teacher) */
    board: Pose;
    /** the whole class: board + teacher + three kids (captions fall below the kids' heads) */
    wide: Pose;
    /** the teacher from the waist up, board edge beside him */
    teacher: Pose;
    /** the wall clock close-up (episode opener) */
    clock: Pose;
    /** one student close-up per desk (face + desk) */
    kid: Pose[];
  };
};
const pose = (x: number, y: number, s: number): Pose => ({x, y, s, r: 0});
export const CLASS: {portrait: ClassLayout; landscape: ClassLayout} = {
  portrait: {
    room: [-1300, 1300], view: {x: -1300, y: -900, w: 2600, h: 4200},
    floorY: 1560, boardX: -480,
    clock: {x: 0, y: -175, r: 95}, bell: {x: -765, y: -60, s: 0.9}, windows: [{x: -880, y: 160, w: 230, h: 560}],
    bunting: [[-400, -1180, -150], [-400, 150, 1180]],
    teacherDesk: {x: 0, y: 1330}, teacher: {x: 765, y: 1600, s: 1},
    kids: [{x: -590, y: 2330, s: 1.08}, {x: 0, y: 2390, s: 1.12}, {x: 590, y: 2330, s: 1.08}],
    cams: {
      board: pose(0, 610, 1), wide: pose(88, 1210, 0.6), teacher: pose(400, 760, 1.08), clock: pose(0, -150, 2.2),
      kid: [pose(-470, 1940, 1.4), pose(0, 1960, 1.4), pose(470, 1940, 1.4)],
    },
  },
  landscape: {
    room: [-2300, 2300], view: {x: -2300, y: -900, w: 4600, h: 4200},
    floorY: 1560, boardX: -480,
    clock: {x: -930, y: 150, r: 90}, bell: {x: -930, y: 480, s: 0.85}, windows: [{x: -1640, y: 170, w: 260, h: 560}, {x: 1300, y: 170, w: 260, h: 560}],
    bunting: [[-30, -2250, -600], [-30, 600, 2250]],
    teacherDesk: {x: 0, y: 1330}, teacher: {x: 765, y: 1600, s: 1},
    kids: [{x: -1150, y: 2042, s: 1.3}, {x: 0, y: 2060, s: 1.32}, {x: 1150, y: 2042, s: 1.3}], // nearer the camera: bigger
    cams: {
      board: pose(240, 640, 0.78), wide: pose(0, 1080, 0.46), teacher: pose(560, 900, 0.95), clock: pose(-930, 180, 1.9),
      kid: [pose(-1050, 1640, 1.0), pose(0, 1660, 1.0), pose(1050, 1640, 1.0)],
    },
  },
};
/** The classroom layout for the frame being rendered. */
export const useClass = (): ClassLayout => CLASS[useFrame().wide ? 'landscape' : 'portrait'];
/** Board-local → world point for a layout. */
export const boardPt = (L: ClassLayout, x: number, y: number): [number, number] => [x + L.boardX, y];
/** The world SVG (put it inside the shared `<World pose>`): defines the chalk grain + batik patterns and `#pap-board`. */
export const ClassSvg: React.FC<{L: ClassLayout; children: React.ReactNode}> = ({L, children}) => (
  <svg width={L.view.w} height={L.view.h} viewBox={`${L.view.x} ${L.view.y} ${L.view.w} ${L.view.h}`}
    style={{position: 'absolute', left: L.view.x, top: L.view.y, overflow: 'visible'}}>
    <ChalkDefs />
    <defs><clipPath id="pap-board"><rect x={0} y={0} width={BOARD.w} height={BOARD.h} /></clipPath></defs>
    <PapHalusDefs />
    {children}
  </svg>
);
/** HALUS full: the shared soft-shadow filters (hl-soft, hl-drop …) tinted with the PAPAN outline brown. ClassSvg includes
 *  it; add it yourself to a hand-built world <svg> (episodes that skip ClassSvg). */
export const PapHalusDefs: React.FC = () => (useHalus('PAPAN').full ? <HalusDefs ink={PAP.ol} /> : null);
/** Wall, floor, bunting, windows, school bell and the ticking wall clock of a layout (draw first). */
export const ClassroomBack: React.FC<{L: ClassLayout; t: number; ring?: number; clockMin?: number; clockHour?: number}> = ({L, t, ring = 0, clockMin = 60, clockHour = 300}) => {
  const secDeg = (Math.floor(t) + eout(t - Math.floor(t), 0, 0.12)) * 6; // a real tick: one 6° step per second
  return (
    <g>
      <Room floorY={L.floorY} x0={L.room[0]} x1={L.room[1]} />
      {L.bunting.map(([y, x0, x1], i) => <Bunting key={i} y={y} x0={x0} x1={x1} />)}
      {L.windows.map((w, i) => <Window key={i} {...w} />)}
      <SchoolBell x={L.bell.x} y={L.bell.y} s={L.bell.s} t={t} ring={ring} />
      <Clock x={L.clock.x} y={L.clock.y} r={L.clock.r} secDeg={secDeg} minDeg={clockMin + t * 0.1} hourDeg={clockHour + t * 0.008} />
    </g>
  );
};
/** The demo cast (Sari, Budi, Dodi): swap skin/hair/bow per film, never reuse the names as-is in a buyer film. */
export const KID_LOOKS: KidLook[] = [
  {skin: '#F1C6A0', hair: 'bob', bow: PAP.red},
  {skin: '#E2AE82', hair: 'spike'},
  {skin: '#C98D62', hair: 'buzz'},
];

// ---------------------------------------------------------------- board scenes under eraser wipes
/** `first` = start (s) of the scene's first chalk write. Give it: BoardScenes throws when the board would stand bare. */
export type BoardScene = {C: React.FC<{t: number}>; w0?: Wipe; w1?: Wipe; first?: number};
/** A wipe that ENDS on the next scene's first cue word (default 0.55 s sweep), so new chalk starts as the eraser leaves:
 *  `w0: wipeTo(C.at('Archimedes'))`. Never schedule a wipe early and write the new scene a second later — a bare board. */
export const wipeTo = (firstAt: number, dur = 0.55): Wipe => ({at: Math.max(0, firstAt - dur), dur});
/** Max bare-board time after a wipe ends before the scene's first chalk starts (s). */
export const BARE_BOARD_MAX = 0.25;
/** Board content (board-local, inside `translate(boardX 0)`): each scene enters behind wipe w0 (revealed only where the
 *  eraser has passed — the board is never bare) and leaves under wipe w1; dust streaks + falling specks per wipe. */
export const BoardScenes: React.FC<{t: number; scenes: BoardScene[]; wipes: Wipe[]}> = ({t, scenes, wipes}) => {
  scenes.forEach((s, i) => {
    if (s.w0 && s.first !== undefined && s.first > s.w0.at + s.w0.dur + BARE_BOARD_MAX)
      throw new Error(`PAPAN scene ${i}: first chalk at ${s.first.toFixed(2)} s but its wipe ends at ${(s.w0.at + s.w0.dur).toFixed(2)} s — bare board. Use w0: wipeTo(first) or write a title during the wipe.`);
  });
  return (
  <g clipPath="url(#pap-board)">
    {wipes.map((w, i) => <WipeDust key={i} t={t} w={w} until={wipes[i + 1]?.at ?? 1e9} />)}
    {scenes.map((s, i) => {
      const a = s.w0 ? s.w0.at : -1e9, b = s.w1 ? s.w1.at + s.w1.dur : 1e9;
      if (t < a || t >= b) return null;
      return (
        <Wiped key={i} t={t} id={`o${i}`} w={s.w1}>
          <Reveal t={t} id={`n${i}`} w={s.w0}><s.C t={t} /></Reveal>
        </Wiped>
      );
    })}
    {wipes.map((w, i) => <DustSpecks key={i} t={t} w={w} />)}
  </g>
  );
};

/** Segment x positions for one centred chalk row (board-local). */
export const rowLayout = (segs: string[], size: number, cx = 480, gap = 28) => {
  const ws = segs.map((s) => chalkW(s, size));
  const tot = ws.reduce((a, b) => a + b, 0) + gap * (segs.length - 1);
  let x = cx - tot / 2;
  return ws.map((w) => {
    const r = {x, w};
    x += w + gap;
    return r;
  });
};
/** One centred chalk row whose segments write on their own cue words (e.g. "100" then "÷ 3 ="). For a line whose
 *  digits must line up exactly, write ONE ChalkText string instead (separately measured Kalam segments drift). */
export const ChalkRow: React.FC<{t: number; id: string; y: number; size: number; segs: Array<{text: string; at: number; color?: string; cps?: number}>; cx?: number; gap?: number}> = ({t, id, y, size, segs, cx = 480, gap = 28}) => {
  const L = rowLayout(segs.map((s) => s.text), size, cx, gap);
  return <g>{segs.map((s, i) => <ChalkText key={i} id={`${id}${i}`} t={t} x={L[i].x} y={y} text={s.text} size={size} at={s.at} cps={s.cps ?? 14} color={s.color} anchor="start" />)}</g>;
};
/** Pencil stroke (no chalk grain) drawn on — notebook inserts. */
export const PencilLine: React.FC<{t: number; d: string; at: number; dur?: number; color?: string; w?: number}> = ({t, d, at, dur = 0.3, color = '#3B3F4A', w = 9}) => {
  if (t < at) return null;
  const q = eout(t, at, at + dur);
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" {...(q >= 1 ? {} : drawOn(q))} />;
};

// ---------------------------------------------------------------- acting helpers
/** Mouth opening 0..1 while a word is spoken (teacher lip flap from words.json). */
export const talkAt = (t: number, words: Array<{start: number; end: number}>) => {
  for (const w of words) {
    if (t >= w.start && t < w.end) return Math.sin(Math.PI * clamp01((t - w.start) / Math.max(0.12, w.end - w.start)));
    if (w.start > t) break;
  }
  return 0;
};
/** 0→1→0 bump of length d after `at`. */
export const bump = (t: number, at: number, d = 0.2) => (t > at && t < at + d ? Math.sin(((t - at) / d) * Math.PI) : 0);
/** Seeded blink times (≈ every 3 s) for lidAt(t, …); different seeds = characters never blink together. */
export const blinkTimes = (seed: number, n = 40) => Array.from({length: n}, (_, k) => 0.9 + seed * 0.7 + k * 2.95 + rnd(k * 3.7 + seed) * 0.9);
/** Smooth 3 Hz giggle bounce (px, ≤ 0) — multiply by a laugh weight; never a per-frame jitter. */
export const laughBob = (t: number, ph = 0) => -(0.5 - 0.5 * Math.cos(t * Math.PI * 6 + ph)) * 11;
/** Pointer target blended from timed aims (world points): weight w → Teacher aimW, p → Teacher aim (convert to
 *  teacher-local with teacherLocal). Overlapping aims glide; outside every aim the arm rests. */
export const aimAt = (t: number, aims: Array<{a: number; b: number; p: [number, number]}>, rest: [number, number], ramp = 0.42) => {
  let sw = 0, px = 0, py = 0;
  for (const s of aims) {
    const h = hold(t, s.a - 0.22, s.b, ramp);
    if (h > 0.0005) {
      sw += h;
      px += s.p[0] * h;
      py += s.p[1] * h;
    }
  }
  return {w: Math.min(1, sw), p: (sw > 0 ? [px / sw, py / sw] : rest) as [number, number]};
};
