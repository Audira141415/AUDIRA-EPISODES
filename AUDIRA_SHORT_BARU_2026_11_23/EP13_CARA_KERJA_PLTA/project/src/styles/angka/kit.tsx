import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, Easing} from 'remotion';
import {CaptionPage} from '../../components/WordCaptions';
import {display, lerp, pageAt, rnd, useFrame} from '../shared';

// ANGKA style kit (v1.15, look #23) — the "stick figure vs maths" genre, fully FLAT on off-white paper.
// Garis (teal stick figure, 2-bone IK limbs, dot eyes with eyelid blink, one hair curl), the same rig recoloured
// as cartoon Romulus (laurel of 4 strokes + ink cloak triangle), numbers as heavy solid objects (squash on landing,
// ground dents), operator props (− blade, + hammer, ? hook), serif "I" columns, a ground line that dents under
// weight, and a caption whose mustard underline bar slides word to word.
// Long-episode motion (ground-anchored camera, keyframes, pose sequencing, jumps, sitting, text measuring) is in the
// second half of this file. Props for full episodes (calculator, × 0 press, baskets, stamp …) live in ./props.
// No gradients, glows, blur or SVG filters anywhere. Self-contained: react, remotion, ../shared.
// Portrait and landscape: the camera helpers take the frame width (gcamTransform(c, G, fr.W), viewX(c, m, fr.W)),
// Caption reads useFrame(); every world prop is placed by you in world coordinates.
// HALUS (v1.16, level drift): wrap the WORLD group — <g transform={gcamTransform(…)}> — in
// <HScene look="ANGKA" t from to i fx={W / 2} fy={H * 0.47}> from ../../lib/halus (scene i alternates push-in / pull-back
// on top of gcam). EqLane, TitleWords and Caption stay outside it (locked). The paper bg is the comp background, so no
// edge ever shows. {halus:'off'} → HScene renders its children unchanged.

export const NGK = {
  bg: '#F4F1EA', band: '#E9E3D6', shadow: '#D9D1C1', ink: '#1C1C22', soft: '#8C877C',
  teal: '#1FB5A6', coral: '#FF5A4E', mustard: '#F2B705', blue: '#3A7BFF', muted: '#B3A994', paper2: '#EEE9DD',
};
const K = NGK;
/** 'Ngk Num' = Inter variable 100–900 (registered by <StyleFonts />); 'Geo Text' is the same Inter file. */
export const NUM = "'Ngk Num', 'Geo Text', sans-serif";

// ---------- motion ----------
const OUTC = Easing.out(Easing.cubic);
const INOUT = Easing.inOut(Easing.cubic);
const INC = Easing.in(Easing.quad);
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lin = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const eio = (t: number, a: number, b: number) => INOUT(lin(t, a, b));
export const eout = (t: number, a: number, b: number) => OUTC(lin(t, a, b));
export const ein = (t: number, a: number, b: number) => INC(lin(t, a, b));
export const smooth = (q: number) => q * q * (3 - 2 * q);
export const frac = (v: number) => v - Math.floor(v);
/** Pop 0 → 1.12 → 1. */
export const pop = (t: number, at: number, d = 0.34) => {
  if (t <= at) return 0;
  const k = (t - at) / d;
  if (k >= 1) return 1;
  if (k < 0.58) return 1.12 * OUTC(k / 0.58);
  return lerp(1.12, 1, INOUT((k - 0.58) / 0.42));
};
/** Pop in at `at`, shrink out at `out`. */
export const popIO = (t: number, at: number, out?: number, d = 0.34) => {
  const q = pop(t, at, d);
  if (out === undefined || t <= out) return q;
  const k = clamp01((t - out) / 0.24);
  return q * (k < 0.3 ? lerp(1, 1.08, k / 0.3) : lerp(1.08, 0, INC((k - 0.3) / 0.7)));
};
/** Landing squash: [sx, sy] after an impact at `at` (sy < 1 first, springs back). */
export const land = (t: number, at: number, amt = 0.2, dur = 0.5): [number, number] => {
  const k = (t - at) / dur;
  if (k <= 0 || k >= 1) return [1, 1];
  const s = Math.cos(k * Math.PI * 2.2) * amt * (1 - k) * (1 - k) * Math.min(1, (k * dur) / 0.04);
  return [1 + s * 0.6, 1 - s];
};
/** Eyelid 0→1→0 over 0.11 s at each blink time. */
export const lidAt = (t: number, times: number[]) => {
  for (const b of times) {
    const k = (t - b) / 0.11;
    if (k > 0 && k < 1) return Math.sin(k * Math.PI);
  }
  return 0;
};
/** Quadratic fall (gravity) from y0 to y1 between a and b. */
export const fall = (t: number, a: number, b: number, y0: number, y1: number) => lerp(y0, y1, Math.pow(lin(t, a, b), 2));

// ---------- fonts ----------
const FONTS = [400, 500, 600, 700, 800, 900].flatMap((w) => [`${w} 100px 'Ngk Num'`, `${w} 100px 'Geo Text'`]);
/** Holds the frame until Inter has loaded (render <StyleFonts /> once in the composition). */
export const useNgkFonts = () => {
  const [handle] = useState(() => delayRender('angka fonts'));
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
export type P = [number, number];
export const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
export const rot = (v: P, deg: number): P => {
  const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  return [v[0] * c - v[1] * s, v[0] * s + v[1] * c];
};
export const lerpP = (a: P, b: P, q: number): P => [lerp(a[0], b[0], q), lerp(a[1], b[1], q)];
/** Point on a cubic bezier. */
export const bez = (p0: P, p1: P, p2: P, p3: P, q: number): P => {
  const u = 1 - q;
  return [
    u * u * u * p0[0] + 3 * u * u * q * p1[0] + 3 * u * q * q * p2[0] + q * q * q * p3[0],
    u * u * u * p0[1] + 3 * u * u * q * p1[1] + 3 * u * q * q * p2[1] + q * q * q * p3[1],
  ];
};
/** 2-bone IK: joint between root a and target b, bend side s (+1/−1). */
export const ik = (a: P, b: P, l1: number, l2: number, s: number): P => {
  let dx = b[0] - a[0], dy = b[1] - a[1];
  let d = Math.hypot(dx, dy) || 0.001;
  const maxD = l1 + l2 - 0.5;
  if (d > maxD) { dx *= maxD / d; dy *= maxD / d; d = maxD; }
  const ux = dx / d, uy = dy / d;
  const x = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  return [a[0] + ux * x - uy * h * s, a[1] + uy * x + ux * h * s];
};

// ---------- the rig ----------
export const RIG = {torso: 82, sho: 72, r: 26, gap: 9, up: 48, fore: 47, thigh: 57, shin: 57, hipH: 108, stroke: 12};
export type Pose = {
  hip: P; lean: number; tilt: number; face: 1 | -1;
  hands: [P, P]; feet: [P, P];
  look: P; elb: [number, number]; kn: [number, number];
  floor: number | null; glare: number;
};
export const shoulderOf = (hip: P, lean: number): P => add(hip, rot([0, -RIG.sho], lean));
export const lerpPose = (a: Pose, b: Pose, q: number): Pose => ({
  hip: lerpP(a.hip, b.hip, q), lean: lerp(a.lean, b.lean, q), tilt: lerp(a.tilt, b.tilt, q), face: q < 0.5 ? a.face : b.face,
  hands: [lerpP(a.hands[0], b.hands[0], q), lerpP(a.hands[1], b.hands[1], q)],
  feet: [lerpP(a.feet[0], b.feet[0], q), lerpP(a.feet[1], b.feet[1], q)],
  look: lerpP(a.look, b.look, q), elb: q < 0.5 ? a.elb : b.elb, kn: q < 0.5 ? a.kn : b.kn,
  floor: a.floor === null || b.floor === null ? (q < 0.5 ? a.floor : b.floor) : lerp(a.floor, b.floor, q), glare: lerp(a.glare, b.glare, q),
});
type Opt = Partial<Pick<Pose, 'tilt' | 'look' | 'elb' | 'kn' | 'floor' | 'glare'>>;
/** Build a pose: hands in face-local coords relative to the shoulder (x forward), feet absolute. */
export const mk = (hip: P, lean: number, face: 1 | -1, handsLocal: [P, P], feet: [P, P], o: Opt = {}): Pose => {
  const sh = shoulderOf(hip, lean);
  return {
    hip, lean, face, tilt: o.tilt ?? 0, look: o.look ?? [0, 0], glare: o.glare ?? 0,
    hands: [add(sh, [face * handsLocal[0][0], handsLocal[0][1]]), add(sh, [face * handsLocal[1][0], handsLocal[1][1]])],
    feet, elb: o.elb ?? [face, face], kn: o.kn ?? [-face, -face], floor: o.floor === undefined ? feet[0][1] : o.floor,
  };
};
/** Same but hands absolute. */
export const mkAbs = (hip: P, lean: number, face: 1 | -1, hands: [P, P], feet: [P, P], o: Opt = {}): Pose => ({
  hip, lean, face, tilt: o.tilt ?? 0, look: o.look ?? [0, 0], glare: o.glare ?? 0, hands, feet,
  elb: o.elb ?? [face, face], kn: o.kn ?? [-face, -face], floor: o.floor === undefined ? feet[0][1] : o.floor,
});
export const ARMS = {
  down: [[-12, 86], [14, 84]] as [P, P],
  hips: [[-30, 52], [30, 54]] as [P, P],
  up: [[-26, -88], [30, -86]] as [P, P],
  flail: [[-60, -60], [64, -50]] as [P, P],
};
/** Standing on `floor` at x. */
export const stand = (x: number, floor: number, face: 1 | -1, t: number, hands: [P, P] = ARMS.down, o: Opt & {lean?: number; dy?: number; stance?: number} = {}) => {
  const br = Math.sin(t * Math.PI * 2 * 0.45) * 2;
  const st = o.stance ?? 17;
  const hip: P = [x, floor - RIG.hipH + br + (o.dy ?? 0)];
  return mk(hip, o.lean ?? 0, face, [[hands[0][0], hands[0][1] - br * 0.5], [hands[1][0], hands[1][1] - br * 0.5]], [[x - face * st, floor], [x + face * (st + 2), floor]], o);
};
/** Run/walk cycle at x (moving toward +face). Feet stay planted because phase follows distance. */
export const runCycle = (x: number, floorAt: (x: number) => number, face: 1 | -1, o: {stride?: number; lift?: number; lean?: number; bob?: number; carry?: P; swing?: number} & Opt = {}) => {
  const L = o.stride ?? 170;
  const ph = (x * face) / L;
  const fl = floorAt(x);
  const bob = (o.bob ?? 7) * (0.5 - 0.5 * Math.cos(4 * Math.PI * ph));
  const hip: P = [x, fl - RIG.hipH + 6 - bob];
  const foot = (i: number): P => {
    const u = frac(ph + i * 0.5);
    if (u < 0.5) {
      const fx = x + face * L * (0.25 - u);
      return [fx, floorAt(fx)];
    }
    const v = (u - 0.5) / 0.5;
    const fx = x + face * L * (-0.25 + 0.5 * smooth(v));
    return [fx, floorAt(fx) - Math.sin(Math.PI * v) * (o.lift ?? 34)];
  };
  const sw = o.swing ?? 44;
  const arm = (i: number): P => {
    const a = Math.sin(2 * Math.PI * (ph + i * 0.5));
    return [-a * sw, 62 - Math.abs(a) * 12];
  };
  const hands: [P, P] = o.carry ? [arm(0), o.carry] : [arm(0), arm(1)];
  return mk(hip, o.lean ?? 10, face, hands, [foot(1), foot(0)], {elb: [-face, -face], ...o, floor: fl});
};

/** A stick figure (Garis or Romulus) drawn from a pose. */
export const Figure: React.FC<{pose: Pose; color: string; lid?: number; kind?: 'garis' | 'romulus' | 'plain'; cloak?: number; behind?: React.ReactNode; front?: React.ReactNode}> = ({
  pose, color, lid = 0, kind = 'garis', cloak = 0, behind, front,
}) => {
  const {hip, lean, tilt, face, hands, feet, look, elb, kn, glare} = pose;
  const sh = shoulderOf(hip, lean);
  const neck = add(hip, rot([0, -RIG.torso], lean));
  const hc = add(neck, rot([0, -(RIG.gap + RIG.r)], lean + tilt));
  const knees = [ik(hip, feet[0], RIG.thigh, RIG.shin, kn[0]), ik(hip, feet[1], RIG.thigh, RIG.shin, kn[1])];
  const elbows = [ik(sh, hands[0], RIG.up, RIG.fore, elb[0]), ik(sh, hands[1], RIG.up, RIG.fore, elb[1])];
  const limb = (a: P, j: P, b: P) => `M ${a[0].toFixed(1)} ${a[1].toFixed(1)} L ${j[0].toFixed(1)} ${j[1].toFixed(1)} L ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  // hands reach at most the arm length, so draw to the clamped point
  const reach = (a: P, b: P, L: number): P => {
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return d <= L - 0.5 ? b : [a[0] + ((b[0] - a[0]) * (L - 0.5)) / d, a[1] + ((b[1] - a[1]) * (L - 0.5)) / d];
  };
  const hR = [reach(sh, hands[0], RIG.up + RIG.fore), reach(sh, hands[1], RIG.up + RIG.fore)];
  const fR = [reach(hip, feet[0], RIG.thigh + RIG.shin), reach(hip, feet[1], RIG.thigh + RIG.shin)];
  const sw = RIG.stroke;
  const ey = 5.2 * (1 - lid * 0.86) * (1 - glare * 0.45);
  const eyeOff = (k: number): P => add(hc, rot([face * (k ? 15 : 2) + look[0] * 6, -2 + look[1] * 6 + glare * 2], lean + tilt));
  const curlBase = add(hc, rot([-face * 5, -RIG.r - sw / 2 + 1], lean + tilt));
  const cr = (dx: number, dy: number) => add(curlBase, rot([face * dx, dy], lean + tilt));
  const c1 = cr(-2, -12), c2 = cr(12, -18), c3 = cr(13, -8), c4 = cr(13, -2), c5 = cr(4, -2), c6 = cr(6, -9);
  const curl = `M ${curlBase[0]} ${curlBase[1]} C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${c3[0]} ${c3[1]} C ${c4[0]} ${c4[1]} ${c5[0]} ${c5[1]} ${c6[0]} ${c6[1]}`;
  // Romulus: cloak triangle behind the body, laurel of 4 strokes
  const back = -face;
  const flut = Math.sin(cloak * Math.PI * 2 * 0.6) * 6;
  const cloakPts = kind === 'romulus'
    ? [add(sh, rot([face * 8, -10], lean)), add(sh, rot([back * 20, -6], lean)), add(hip, rot([back * (70 + flut), 64], lean)), add(hip, rot([back * 4, 46], lean))]
    : null;
  return (
    <g>
      {cloakPts && <polygon points={cloakPts.map((p) => p.join(',')).join(' ')} fill={K.ink} strokeLinejoin="round" stroke={K.ink} strokeWidth={4} />}
      {behind}
      <g stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={limb(hip, knees[0], fR[0])} />
        <path d={limb(hip, knees[1], fR[1])} />
        <path d={`M ${hip[0]} ${hip[1]} L ${neck[0]} ${neck[1]}`} />
        <path d={limb(sh, elbows[0], hR[0])} />
        <path d={limb(sh, elbows[1], hR[1])} />
      </g>
      <circle cx={hc[0]} cy={hc[1]} r={RIG.r} fill={K.bg} stroke={color} strokeWidth={sw} />
      {kind === 'garis' && <path d={curl} stroke={color} strokeWidth={7} strokeLinecap="round" fill="none" />}
      {kind === 'romulus' && [-58, -22, 22, 58].map((a, i) => {
        const p0 = add(hc, rot([0, -(RIG.r + 9)], lean + tilt + a));
        const p1 = add(hc, rot([0, -(RIG.r + 24)], lean + tilt + a + (a < 0 ? -14 : 14)));
        return <path key={i} d={`M ${p0[0]} ${p0[1]} L ${p1[0]} ${p1[1]}`} stroke={K.mustard} strokeWidth={8} strokeLinecap="round" />;
      })}
      {[0, 1].map((k) => {
        const e = eyeOff(k);
        return <ellipse key={k} cx={e[0]} cy={e[1]} rx={5.2} ry={Math.max(1.1, ey)} fill={K.ink} />;
      })}
      {front}
    </g>
  );
};
/** Hard flat shadow ellipse on a surface. */
export const Shadow: React.FC<{x: number; y: number; w: number; h?: number}> = ({x, y, w, h = 9}) =>
  w <= 1 ? null : <ellipse cx={x} cy={y + 2} rx={w / 2} ry={h} fill={K.shadow} />;
export const figShadow = (pose: Pose) => {
  if (pose.floor === null) return null;
  const above = Math.max(0, pose.floor - RIG.hipH - pose.hip[1]);
  const w = Math.max(0, 96 - above * 0.18);
  return {x: pose.hip[0], y: pose.floor, w};
};

// ---------- maths objects ----------
/** A number/symbol as a solid object, anchored at its baseline centre, squash around the baseline. */
export const Num: React.FC<{x: number; y: number; text: string; size: number; weight?: number; color?: string; sx?: number; sy?: number; rot?: number; anchor?: 'start' | 'middle' | 'end'; ls?: number}> = ({
  x, y, text, size, weight = 500, color = K.ink, sx = 1, sy = 1, rot: r = 0, anchor = 'middle', ls = 0,
}) => (
  <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)})`}>
    <text x={0} y={0} fontFamily={NUM} fontWeight={weight} fontSize={size} fill={color} textAnchor={anchor} letterSpacing={ls} style={{fontVariantNumeric: 'lining-nums'}}>{text}</text>
  </g>
);
/** "−" blade: flat rounded bar with hard ends. Centre at (x,y). */
export const Blade: React.FC<{x: number; y: number; angle: number; len?: number; th?: number; color?: string}> = ({x, y, angle, len = 210, th = 34, color = K.coral}) => (
  <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(2)})`}>
    <rect x={-len / 2} y={-th / 2} width={len} height={th} rx={5} fill={color} />
    <rect x={-len / 2 + 14} y={-th / 2 + 7} width={len - 60} height={5} rx={2} fill={K.bg} opacity={0.55} />
  </g>
);
/** "+" hammer gripped at the end of its lower arm (grip point = x,y). */
export const Plus: React.FC<{x: number; y: number; angle: number; s?: number; color?: string}> = ({x, y, angle, s = 1, color = K.mustard}) => (
  <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(2)}) scale(${s})`}>
    <rect x={-15} y={-150} width={30} height={150} rx={4} fill={color} />
    <rect x={-60} y={-105} width={120} height={30} rx={4} fill={color} />
    <rect x={-9} y={-20} width={18} height={20} rx={3} fill={K.ink} />
  </g>
);
/** Giant "?" built from strokes (geometry known exactly). Origin = bottom of the dot. Hook tip at (−95·k, −270·k). */
export const QHOOK = {tipX: -95, tipY: -270, top: -382, half: 112, k: 1.5};
export const Hook: React.FC<{x: number; y: number; k?: number; sx?: number; sy?: number; color?: string}> = ({x, y, k = QHOOK.k, sx = 1, sy = 1, color = K.mustard}) => (
  <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${(sx * k).toFixed(4)} ${(sy * k).toFixed(4)})`}>
    <path d="M -95 -270 A 95 95 0 0 1 95 -270 Q 95 -218 38 -188 Q 0 -168 0 -132 L 0 -74" stroke={color} strokeWidth={34} fill="none" strokeLinecap="butt" />
    <circle cx={0} cy={-24} r={24} fill={color} />
  </g>
);
/** A coral day tile ("29", "30", "31" — the days February lacks). */
export const Chip: React.FC<{x: number; y: number; label: string; rot?: number; s?: number; w?: number; h?: number}> = ({x, y, label, rot: r = 0, s = 1, w = 84, h = 52}) => (
  <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)}) scale(${s.toFixed(4)})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill={K.coral} />
    <text x={0} y={h * 0.25} fontFamily={NUM} fontWeight={800} fontSize={h * 0.72} fill={K.bg} textAnchor="middle">{label}</text>
  </g>
);
/** Serif capital "I" as a Roman column (line-drawn). Bottom centre at (x,y). */
export const IColumn: React.FC<{x: number; y: number; h: number; q: number; color?: string; fill?: string}> = ({x, y, h, q, color = K.ink, fill = K.bg}) => {
  if (q <= 0) return null;
  const H = h * q;
  const sw = 46, cw = 92, ch = 24;
  return (
    <g stroke={color} strokeWidth={8} strokeLinejoin="round" fill={fill}>
      <rect x={x - sw / 2} y={y - H + ch} width={sw} height={Math.max(0, H - 2 * ch)} />
      <rect x={x - cw / 2} y={y - ch} width={cw} height={ch} />
      <rect x={x - cw / 2} y={y - H} width={cw} height={ch} />
      {H > 120 && <path d={`M ${x - 8} ${y - H + ch + 18} L ${x - 8} ${y - ch - 18} M ${x + 8} ${y - H + ch + 18} L ${x + 8} ${y - ch - 18}`} stroke={color} strokeWidth={4} opacity={0.45} />}
    </g>
  );
};
/** Flat 4-point star (crown glint). */
export const Glint: React.FC<{x: number; y: number; r: number; rot?: number}> = ({x, y, r, rot: a = 0}) => {
  if (r <= 0.5) return null;
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const rr = i % 2 === 0 ? r : r * 0.3;
    const an = ((i * 45 + a) * Math.PI) / 180;
    pts.push(`${(x + Math.sin(an) * rr).toFixed(1)},${(y - Math.cos(an) * rr).toFixed(1)}`);
  }
  return <polygon points={pts.join(' ')} fill={K.mustard} />;
};
/** Flat dust puffs after a landing. */
export const Puff: React.FC<{x: number; y: number; t: number; at: number; s?: number}> = ({x, y, t, at, s = 1}) => {
  const k = (t - at) / 0.42;
  if (k <= 0 || k >= 1) return null;
  const r = (i: number) => (10 + i * 3) * s * Math.sin(Math.PI * Math.min(1, k * 1.1)) * (1 - k * 0.4);
  return (
    <g fill={K.shadow}>
      {[-1, 1].map((d) =>
        [0, 1, 2].map((i) => <circle key={`${d}${i}`} cx={x + d * (22 + i * 20 + k * 40) * s} cy={y - 6 - i * 4 - k * 10} r={Math.max(0, r(2 - i))} />),
      )}
    </g>
  );
};

// ---------- ground (dents under weight) ----------
export type Dent = {x: number; w: number; depth: (t: number) => number};
export type Impact = {t: number; x: number; amp: number; w: number};
export const dentAt = (x: number, t: number, dents: Dent[], impacts: Impact[]) => {
  let d = 0;
  for (const dn of dents) {
    const e = (x - dn.x) / dn.w;
    if (Math.abs(e) < 3) d += dn.depth(t) * Math.exp(-e * e);
  }
  for (const im of impacts) {
    const tau = t - im.t;
    if (tau <= 0 || tau > 0.9) continue;
    const e = (x - im.x) / im.w;
    if (Math.abs(e) > 3.2) continue;
    d += im.amp * (1 - Math.exp(-tau / 0.03)) * Math.exp(-4.5 * tau) * Math.cos(2 * Math.PI * 2.6 * tau) * Math.exp(-e * e);
  }
  return d;
};
export const groundPath = (x0: number, x1: number, y: number, f: (x: number) => number, step = 16) => {
  let d = '';
  for (let x = x0; x <= x1 + step; x += step) d += `${d ? ' L' : 'M'} ${x.toFixed(0)} ${(y + f(x)).toFixed(2)}`;
  return d;
};

// ---------- captions: Inter 700, ink, mustard underline that slides word to word ----------
/** Bottom caption. Default top: portrait 1600 (the episode uses 1560 over the floor band), landscape H − 205. */
export const Caption: React.FC<{t: number; pages: CaptionPage[]; top?: number; size?: number}> = ({t, pages, top, size = 60}) => {
  const fr = useFrame();
  const pg = pageAt(t, pages);
  if (!pg) return null;
  const inQ = eout(t, pg.start - 0.08, pg.start + 0.1);
  const side = fr.pick(64, fr.safe.side);
  return (
    <div style={{position: 'absolute', left: side, right: side, top: top ?? fr.pick(1600, fr.H - 205), display: 'flex', justifyContent: 'center', zIndex: 50}}>
      <div style={{fontFamily: NUM, fontWeight: 700, fontSize: size, lineHeight: 1.2, color: K.ink, textAlign: 'center', maxWidth: fr.captionW,
        opacity: inQ, transform: `translateY(${(1 - inQ) * 14}px)`}}>
        {pg.words.map((w, i) => {
          const next = pg.words[i + 1];
          const end = next ? next.start : Math.max(w.end + 0.15, pg.end);
          const grow = eout(t, w.start - 0.02, w.start + 0.09);
          const gone = next ? eout(t, next.start - 0.02, next.start + 0.09) : 0;
          const on = t >= w.start - 0.02 && t < end + 0.09;
          const said = t >= w.start - 0.02;
          const sx = on ? (gone > 0 ? 1 - gone : grow) : 0;
          const origin = gone > 0 ? 'right' : 'left';
          return (
            <React.Fragment key={i}>
              <span style={{position: 'relative', display: 'inline-block', opacity: said ? 1 : 0.34}}>
                <span style={{position: 'absolute', left: -4, right: -4, bottom: 2, height: 16, background: K.mustard, borderRadius: 3,
                  transform: `scaleX(${sx.toFixed(4)})`, transformOrigin: origin}} />
                <span style={{position: 'relative'}}>{display(w.word)}</span>
              </span>
              {i < pg.words.length - 1 ? ' ' : ''}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ---------- screen titles ----------
/** Coral tag with hard flat offset shadow. */
export const Tag: React.FC<{x: number; y: number; text: string; q: number; rot?: number; size?: number; color?: string; textColor?: string}> = ({
  x, y, text, q, rot: r = -2, size = 70, color = K.coral, textColor = K.bg,
}) => {
  if (q <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${r}deg) scale(${q})`, zIndex: 40}}>
      <div style={{position: 'relative'}}>
        <div style={{position: 'absolute', inset: 0, transform: 'translate(10px, 10px)', background: K.ink, borderRadius: 10}} />
        <div style={{position: 'relative', background: color, borderRadius: 10, padding: `${size * 0.16}px ${size * 0.42}px`, fontFamily: NUM, fontWeight: 800,
          fontSize: size, letterSpacing: size * 0.02, color: textColor, whiteSpace: 'nowrap', lineHeight: 1.05}}>{text}</div>
      </div>
    </div>
  );
};
export const seeded = rnd;

// =====================================================================================================================
// Long-episode motion: ground-anchored camera, keyframes, pose sequencing, jumps, sitting, text measuring.
// Pure functions only (deterministic per frame).

// ---------- camera ----------
/** Ground-anchored camera: world x `x` sits at the screen centre, the world ground line sits at screen y `gs`. */
export type GCam = {x: number; s: number; gs: number};
export type GKey = {from: number; to: number; x?: number; s?: number; gs?: number};
/** sine in-out (peak speed 1.57× average: keeps tick rulers from wagon-wheeling during pans) */
export const sio = (t: number, a: number, b: number) => 0.5 - 0.5 * Math.cos(Math.PI * lin(t, a, b));
export const gcam = (t: number, start: GCam, keys: GKey[]): GCam => {
  const c = {...start};
  for (const k of keys) {
    const q = sio(t, k.from, k.to);
    if (q <= 0) continue;
    c.x = lerp(c.x, k.x ?? c.x, q);
    c.s = lerp(c.s, k.s ?? c.s, q);
    c.gs = lerp(c.gs, k.gs ?? c.gs, q);
  }
  return c;
};
/** SVG transform of the world group. `W` = frame width (1080 portrait, 1920 landscape: pass useFrame().W). */
export const gcamTransform = (c: GCam, ground: number, W = 1080) =>
  `translate(${W / 2} ${c.gs.toFixed(2)}) scale(${c.s.toFixed(5)}) translate(${(-c.x).toFixed(2)} ${-ground})`;
/** world → screen for a ground-anchored camera */
export const toScreen = (c: GCam, ground: number, x: number, y: number, W = 1080): P => [W / 2 + (x - c.x) * c.s, c.gs + (y - ground) * c.s];
/** visible world x-range (+margin) */
export const viewX = (c: GCam, margin = 80, W = 1080): [number, number] => [c.x - W / 2 / c.s - margin, c.x + W / 2 / c.s + margin];

// ---------- keyframes ----------
/** Point keyframes: eases from the previous value to each key over `d` s starting at the key time. */
export const kf = (t: number, keys: Array<[number, P]>, d = 0.18): P => {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v = lerpP(v, keys[i][1], eio(t, keys[i][0], keys[i][0] + d));
  return v;
};
export const kfn = (t: number, keys: Array<[number, number]>, d = 0.18): number => {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v = lerp(v, keys[i][1], eio(t, keys[i][0], keys[i][0] + d));
  return v;
};
/** 0 → 1 → 0 hump between a and b */
export const bump = (t: number, a: number, b: number) => Math.sin(Math.PI * lin(t, a, b));

// ---------- pose sequencing ----------
export type Seg = [number, (t: number) => Pose, number?];
/** Pick the active segment; blend from the previous one over its fade time (default 0.1 s). */
export const seq = (t: number, segs: Seg[]): Pose => {
  let i = 0;
  while (i + 1 < segs.length && t >= segs[i + 1][0]) i++;
  const cur = segs[i][1](t);
  if (i === 0) return cur;
  const fade = segs[i][2] ?? 0.1;
  const q = (t - segs[i][0]) / fade;
  if (q >= 1) return cur;
  return lerpPose(segs[i - 1][1](t), cur, smooth(clamp01(q)));
};

/** Jump: hip on a quadratic arc from→to peaking near apexY; legs tuck, arms up. `from`/`to` are hip points. */
export const jump = (t: number, t0: number, t1: number, from: P, to: P, apexY: number, face: 1 | -1, floorAt: (x: number) => number, arms: [P, P] = ARMS.up) => {
  const q = lin(t, t0, t1);
  const ctrl: P = [(from[0] + to[0]) / 2, 2 * apexY - (from[1] + to[1]) / 2];
  const u = 1 - q;
  const hip: P = [u * u * from[0] + 2 * u * q * ctrl[0] + q * q * to[0], u * u * from[1] + 2 * u * q * ctrl[1] + q * q * to[1]];
  const tuck = Math.sin(Math.PI * q);
  const feet: [P, P] = [add(hip, [-face * (14 + tuck * 6), 104 - tuck * 34]), add(hip, [face * (22 + tuck * 10), 100 - tuck * 40])];
  return mk(hip, 6 * face * tuck, face, arms, feet, {floor: floorAt(hip[0]), kn: [-face, -face]});
};
/** Hip point of a figure standing on `floor` at x. */
export const hipOn = (x: number, floor: number, dy = 0): P => [x, floor - RIG.hipH + dy];
/** Crouch (anticipation / landing) while standing: `k` 0..1 bends the knees. */
export const crouch = (x: number, floor: number, face: 1 | -1, t: number, k: number, hands: [P, P] = ARMS.down, o: Parameters<typeof stand>[5] = {}) =>
  stand(x, floor, face, t, hands, {...o, dy: (o.dy ?? 0) + 30 * k, lean: (o.lean ?? 0) + 10 * k * face});

/** Sitting on the ground at x (knees up, hands on knees). `tired` slumps forward. */
export const sit = (x: number, floor: number, face: 1 | -1, t: number, o: {tired?: number; look?: P; breath?: number; lean?: number; hands?: [P, P]} = {}) => {
  const tired = o.tired ?? 0;
  const br = Math.sin(t * Math.PI * 2 * (0.45 + tired * 0.7)) * (2 + tired * 3) * (o.breath ?? 1);
  const hip: P = [x, floor - 30 + br * 0.3];
  const feet: [P, P] = [[x + face * 66, floor], [x + face * 92, floor]];
  const lean = face * (8 + 22 * tired) + (o.lean ?? 0) + br * face;
  const knee = (fx: number): P => [lerp(x, fx, 0.48), floor - 82];
  const k0 = knee(feet[0][0]), k1 = knee(feet[1][0]);
  const hands: [P, P] = o.hands ?? [add(k0, [face * 8, 10 + 26 * tired]), add(k1, [face * 14, 6 + 28 * tired])];
  return mkAbs(hip, lean, face, hands, feet, {look: o.look ?? [face * 0.4, 0.4 + 0.5 * tired], tilt: face * 16 * tired, floor, kn: [-face, -face], elb: [-face, -face]});
};

// ---------- figure anatomy ----------
/** Head centre of a pose (same maths as Figure). */
export const headOf = (p: Pose): P => {
  const neck = add(p.hip, rot([0, -RIG.torso], p.lean));
  return add(neck, rot([0, -(RIG.gap + RIG.r)], p.lean + p.tilt));
};
export const shoulder = (p: Pose): P => add(p.hip, rot([0, -RIG.sho], p.lean));

// ---------- text measuring (fonts are loaded by useNgkFonts before the first frame) ----------
let measureCtx: CanvasRenderingContext2D | null = null;
const measureCache = new Map<string, number>();
/** Width in px of `text` at font size `size` in the numbers font (Inter). */
export const measure = (text: string, size: number, weight = 700, family = NUM) => {
  const key = `${text}|${weight}|${family}`;
  let w = measureCache.get(key);
  if (w === undefined) {
    if (!measureCtx && typeof document !== 'undefined') measureCtx = document.createElement('canvas').getContext('2d');
    if (measureCtx) {
      measureCtx.font = `${weight} 100px ${family}`;
      w = measureCtx.measureText(text).width / 100;
    } else w = text.length * 0.6;
    measureCache.set(key, w);
  }
  return w * size;
};
