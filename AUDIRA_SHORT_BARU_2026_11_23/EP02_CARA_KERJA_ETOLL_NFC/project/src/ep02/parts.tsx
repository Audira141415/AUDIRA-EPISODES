import React from 'react';
import {B, HEAD, MONO, Pt, isoAt, poly, seg} from '../bp/styles/blueprint/kit';
import {drawOn, lerp, p, pb, pio} from '../bp/styles/shared';

// EP02 e-Toll / NFC — shared drawing parts for the BLUEPRINT 2D film (1080×1920 sheet units).
// Lessons from TUBUH (EP33): every scene gets radial light, glow on fields/currents, contact shadows,
// gradient faces, BG/MG/FG parallax and a camera that never stops.

export const W = 1080;
export const H = 1920;

// ---------- defs (once per sheet) ----------
export const Defs: React.FC = () => (
  <defs>
    <radialGradient id="bgR" cx="50%" cy="42%" r="75%">
      <stop offset="0" stopColor="#1A5BA3" />
      <stop offset="0.55" stopColor="#0E3A6B" />
      <stop offset="1" stopColor="#051A33" />
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="46%" r="72%">
      <stop offset="0.6" stopColor="#020E1E" stopOpacity="0" />
      <stop offset="1" stopColor="#020E1E" stopOpacity="0.78" />
    </radialGradient>
    <radialGradient id="shadowR">
      <stop offset="0" stopColor="#010A16" stopOpacity="0.62" />
      <stop offset="0.6" stopColor="#010A16" stopOpacity="0.28" />
      <stop offset="1" stopColor="#010A16" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="hotR">
      <stop offset="0" stopColor="#FFF6C8" stopOpacity="1" />
      <stop offset="0.35" stopColor={B.yellow} stopOpacity="0.75" />
      <stop offset="1" stopColor={B.yellow} stopOpacity="0" />
    </radialGradient>
    <radialGradient id="cyanR">
      <stop offset="0" stopColor="#DDF6FF" stopOpacity="0.9" />
      <stop offset="0.4" stopColor={B.cyan} stopOpacity="0.45" />
      <stop offset="1" stopColor={B.cyan} stopOpacity="0" />
    </radialGradient>
    <linearGradient id="gTop" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#2F74C2" />
      <stop offset="1" stopColor="#174A82" />
    </linearGradient>
    <linearGradient id="gLeft" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#1A5596" />
      <stop offset="1" stopColor="#0F3A6A" />
    </linearGradient>
    <linearGradient id="gRight" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#0E3563" />
      <stop offset="1" stopColor="#071F3E" />
    </linearGradient>
    <linearGradient id="gCard" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#3A84D2" />
      <stop offset="0.5" stopColor="#1E5DA4" />
      <stop offset="1" stopColor="#133F75" />
    </linearGradient>
    <linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#FFE58A" />
      <stop offset="1" stopColor="#C99A1E" />
    </linearGradient>
    <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#0A2C55" />
      <stop offset="1" stopColor="#164E8E" />
    </linearGradient>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="7" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="glowBig" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="18" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="fgBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" />
    </filter>
    <linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity="0" />
      <stop offset="0.35" stopColor="#fff" stopOpacity="0.8" />
      <stop offset="1" stopColor="#fff" stopOpacity="1" />
    </linearGradient>
    <mask id="floorM" maskUnits="userSpaceOnUse" x="0" y="1520" width="1080" height="400"><rect x={0} y={1520} width={1080} height={400} fill="url(#floorFade)" /></mask>
    <linearGradient id="hazeTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#7FD8FF" stopOpacity="0.10" />
      <stop offset="0.45" stopColor="#7FD8FF" stopOpacity="0" />
    </linearGradient>
    <pattern id="gmin" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M 36 0 L 0 0 0 36" fill="none" stroke="#fff" strokeOpacity="0.07" /></pattern>
    <pattern id="gmaj" width="180" height="180" patternUnits="userSpaceOnUse"><path d="M 180 0 L 0 0 0 180" fill="none" stroke="#fff" strokeOpacity="0.15" strokeWidth="1.5" /></pattern>
    <pattern id="hatch" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="18" stroke={B.line2} strokeWidth="2" strokeOpacity=".5" /></pattern>
  </defs>
);

// ---------- camera + parallax ----------
export type Cam = {s: number; x: number; y: number; fx: number; fy: number};
/** Continuous camera for scene i: eased move from a→b plus a slow two-axis drift, so no frame is ever still. */
export const camFor = (t: number, from: number, to: number, i: number, a: Partial<Cam>, b: Partial<Cam>): Cam => {
  const q = pio(t, from - 0.3, to + 0.3);
  const d = {s: 1, x: 0, y: 0, fx: W / 2, fy: 900};
  const A = {...d, ...a};
  const Bc = {...d, ...a, ...b};
  return {
    s: lerp(A.s, Bc.s, q) * (1 + 0.02 * Math.sin(t * 1.1 + i)),
    x: lerp(A.x, Bc.x, q) + Math.sin(t * 0.85 + i * 1.7) * 30,
    y: lerp(A.y, Bc.y, q) + Math.cos(t * 0.75 + i * 2.3) * 22,
    fx: lerp(A.fx, Bc.fx, q),
    fy: lerp(A.fy, Bc.fy, q),
  };
};
/** Transform for a parallax layer at depth d (BG 0.4, MG 1, FG 1.6). */
export const layer = (c: Cam, d: number) => {
  const s = 1 + (c.s - 1) * d;
  return `translate(${(c.fx + c.x * d).toFixed(2)} ${(c.fy + c.y * d).toFixed(2)}) scale(${s.toFixed(4)}) translate(${-c.fx} ${-c.fy})`;
};

export const Grid: React.FC<{c: Cam}> = ({c}) => (
  <g transform={layer(c, 0.4)}>
    <rect x={-500} y={-600} width={W + 1000} height={H + 1200} fill="url(#gmin)" />
    <rect x={-500} y={-600} width={W + 1000} height={H + 1200} fill="url(#gmaj)" />
  </g>
);

/** Foreground ruler / drafting triangle drifting past (blurred, depth 1.6). */
export const FgRuler: React.FC<{c: Cam; t: number; y: number; flip?: boolean; seed?: number}> = ({c, t, y, flip, seed = 0}) => {
  const x = ((flip ? -1 : 1) * (t * 38 + seed * 200)) % 1600;
  const x0 = flip ? 1200 + x : -500 + x;
  const ticks: string[] = [];
  for (let k = 0; k <= 40; k++) ticks.push(`M ${x0 + k * 22} ${y} l 0 ${k % 5 === 0 ? 34 : 18}`);
  return (
    <g transform={layer(c, 1.6)} filter="url(#fgBlur)" opacity={0.5}>
      <rect x={x0 - 10} y={y - 6} width={900} height={70} rx={6} fill="#CFE6FF" fillOpacity={0.1} stroke={B.line2} strokeOpacity={0.7} strokeWidth={3} />
      <path d={ticks.join(' ')} stroke={B.line2} strokeWidth={3} strokeOpacity={0.8} />
    </g>
  );
};

/** Text-free drafting-table floor under the caption (1540-1920): perspective grid that scrolls with the camera,
 *  a horizon glow and blurred drafting tools drifting in the FG. Fills the band without adding text. */
export const Floor: React.FC<{c: Cam; t: number}> = ({c, t}) => {
  const top = 1545, bot = 1920, vx = 540 + c.x * 0.6, vy = 1180;
  const v: string[] = [];
  for (let k = -12; k <= 12; k++) {
    const xb = 540 + k * 150 + c.x * 1.6;
    const f = (top - vy) / (bot - vy);
    v.push(`M ${(vx + (xb - vx) * f).toFixed(1)} ${top} L ${xb.toFixed(1)} ${bot}`);
  }
  const h: string[] = [];
  const ph = (t * 0.35) % 1;
  for (let k = 0; k < 9; k++) {
    const u = (k + ph) / 9; // 0 far -> 1 near
    const y = top + (bot - top) * u * u;
    h.push(`M 0 ${y.toFixed(1)} L ${W} ${y.toFixed(1)}`);
  }
  const rot = -18 + Math.sin(t * 0.4) * 6;
  const sx = 880 + Math.sin(t * 0.3) * 40 - c.x * 1.6;
  return (
    <g pointerEvents="none">
      <g mask="url(#floorM)">
        <rect x={0} y={top} width={W} height={bot - top} fill="#04152B" fillOpacity={0.55} />
        <path d={v.join(' ')} stroke={B.line2} strokeWidth={2} strokeOpacity={0.4} />
        <path d={h.join(' ')} stroke={B.line2} strokeWidth={2} strokeOpacity={0.35} />
      </g>
      <ellipse cx={540} cy={top + 10} rx={620} ry={46} fill="url(#cyanR)" opacity={0.28} />
      <g transform={`translate(${sx} 1790) rotate(${rot})`} filter="url(#fgBlur)" opacity={0.55}>
        <path d="M -230 120 L 230 120 L -230 -150 Z" fill="#CFE6FF" fillOpacity={0.08} stroke={B.line2} strokeWidth={5} />
        <path d="M -170 85 L 70 85 L -170 -55 Z" fill="none" stroke={B.line2} strokeWidth={4} />
      </g>
      <g transform={`translate(${170 - c.x * 1.6 + Math.sin(t * 0.5) * 30} 1720) rotate(${8 + Math.sin(t * 0.35) * 5})`} filter="url(#fgBlur)" opacity={0.45}>
        <circle r={110} fill="none" stroke={B.line2} strokeWidth={6} />
        <path d="M -110 0 A 110 110 0 0 1 110 0 Z" fill="#CFE6FF" fillOpacity={0.07} />
      </g>
    </g>
  );
};

/** Distant skyline behind iso scenes (BG depth plane, hatched, low contrast). */
export const Skyline: React.FC<{c: Cam; y: number; q?: number}> = ({c, y, q = 1}) => {
  const hs = [120, 190, 90, 240, 150, 210, 110, 170, 260, 130, 200, 100];
  return (
    <g transform={layer(c, 0.5)} opacity={0.4 * q}>
      {hs.map((h, i) => {
        const x = -200 + i * 130;
        return <rect key={i} x={x} y={y - h} width={110} height={h} fill="url(#hatch)" stroke={B.line2} strokeWidth={2} strokeOpacity={0.6} />;
      })}
      <path d={`M -300 ${y} L ${W + 300} ${y}`} stroke={B.line2} strokeWidth={2} strokeOpacity={0.6} />
    </g>
  );
};

// ---------- solids ----------
export const Shadow: React.FC<{cx: number; cy: number; rx: number; ry: number; o?: number}> = ({cx, cy, rx, ry, o = 1}) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#shadowR)" opacity={o} />
);

type Iso = ReturnType<typeof isoAt>;
/** Iso box with gradient faces (light from top-left), white edges drawn on, hidden edges dashed. */
export const Solid: React.FC<{iso: Iso; x0: number; x1: number; y0: number; y1: number; z0: number; z1: number; q: number; stroke?: string; top?: string; sw?: number}> = ({
  iso, x0, x1, y0, y1, z0, z1, q, stroke = B.line, top = 'url(#gTop)', sw = 3,
}) => {
  if (q <= 0) return null;
  const b = [iso(x0, y0, z0), iso(x1, y0, z0), iso(x1, y1, z0), iso(x0, y1, z0)];
  const tp = [iso(x0, y0, z1), iso(x1, y0, z1), iso(x1, y1, z1), iso(x0, y1, z1)];
  const f = p(q, 0.4, 1);
  return (
    <g>
      <g opacity={f}>
        <path d={poly([b[1], b[2], tp[2], tp[1]])} fill="url(#gRight)" />
        <path d={poly([b[2], b[3], tp[3], tp[2]])} fill="url(#gLeft)" />
        <path d={poly(tp)} fill={top} />
      </g>
      <g fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
        <path d={poly(tp)} {...drawOn(p(q, 0, 0.6))} />
        <path d={`${seg(b[1], b[2])} ${seg(b[2], b[3])} ${seg(b[1], tp[1])} ${seg(b[2], tp[2])} ${seg(b[3], tp[3])}`} {...drawOn(p(q, 0.2, 0.9))} />
      </g>
      <path d={`${seg(b[0], b[1])} ${seg(b[0], b[3])} ${seg(b[0], tp[0])}`} fill="none" stroke={B.line2} strokeWidth={1.5} strokeDasharray="8 8" opacity={0.45 * f} />
    </g>
  );
};

// ---------- the card (iso, optionally rotated about its centre) ----------
export const CARD = {w: 340, h: 214, th: 6};
type CardOpts = {iso: Iso; q: number; z?: number; rot?: number; coil?: number; power?: number; chipOn?: number; layer?: 'all' | 'top' | 'coil' | 'chip' | 'bottom'; flow?: number; label?: boolean};
/** Rotated card-local point → screen. */
const cardPt = (iso: Iso, rot: number) => (x: number, y: number, z: number): Pt => {
  const cx = CARD.w / 2, cy = CARD.h / 2;
  const c = Math.cos(rot), s = Math.sin(rot);
  const dx = x - cx, dy = y - cy;
  return iso(cx + dx * c - dy * s, cy + dx * s + dy * c, z);
};
const rrect = (P: (x: number, y: number, z: number) => Pt, x0: number, y0: number, x1: number, y1: number, z: number) =>
  poly([P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)]);

export const Card: React.FC<CardOpts> = ({iso, q, z = 0, rot = 0, coil = 1, power = 0, chipOn = 0, layer: part = 'all', flow = 0, label = true}) => {
  if (q <= 0) return null;
  const P = cardPt(iso, rot);
  const {w, h, th} = CARD;
  const showSheet = part === 'all' || part === 'top' || part === 'bottom';
  const sheet = () => {
    const b = [P(0, 0, z), P(w, 0, z), P(w, h, z), P(0, h, z)];
    const tp = [P(0, 0, z + th), P(w, 0, z + th), P(w, h, z + th), P(0, h, z + th)];
    return (
      <g opacity={p(q, 0, 0.5)}>
        <path d={poly([b[0], b[1], tp[1], tp[0]])} fill="url(#gRight)" />
        <path d={poly([b[1], b[2], tp[2], tp[1]])} fill="url(#gRight)" />
        <path d={poly([b[2], b[3], tp[3], tp[2]])} fill="url(#gLeft)" />
        <path d={poly([b[3], b[0], tp[0], tp[3]])} fill="url(#gLeft)" />
        <path d={poly(tp)} fill="url(#gCard)" fillOpacity={part === 'top' ? 0.55 : 0.92} stroke={B.line} strokeWidth={3} {...drawOn(q)} />
        {part !== 'bottom' && label && (
          <text transform={`translate(${P(w * 0.62, h * 0.78, z + th)[0]} ${P(w * 0.62, h * 0.78, z + th)[1]})`} fill={B.line} opacity={0.75 * q}
            style={{color: B.line, fontFamily: MONO, fontWeight: 700, fontSize: 32, letterSpacing: 2}}>e-TOLL</text>
        )}
      </g>
    );
  };
  const coilZ = z + th + 0.5;
  const loops = [14, 24, 34, 44];
  const coilEl = (
    <g>
      {loops.map((ins, k) => (
        <path key={k} d={rrect(P, ins, ins, w - ins, h - ins, coilZ)} fill="none" stroke={power > 0.05 ? B.cyan : B.line2} strokeWidth={3}
          {...drawOn(p(coil, k * 0.12, 0.6 + k * 0.12))} filter={power > 0.05 ? 'url(#glow)' : undefined} strokeOpacity={0.75 + 0.25 * power} />
      ))}
      {power > 0.05 && loops.map((ins, k) => (
        <path key={`f${k}`} d={rrect(P, ins, ins, w - ins, h - ins, coilZ)} fill="none" stroke={B.yellow} strokeWidth={4.5}
          strokeDasharray="14 46" strokeDashoffset={-flow * 160 - k * 15} opacity={power} filter="url(#glow)" />
      ))}
    </g>
  );
  const chip = (() => {
    const x0 = 58, y0 = 72, x1 = 112, y1 = 132;
    const zc = z + th;
    const pts = [P(x0, y0, zc + 5), P(x1, y0, zc + 5), P(x1, y1, zc + 5), P(x0, y1, zc + 5)];
    const c = P((x0 + x1) / 2, (y0 + y1) / 2, zc + 5);
    return (
      <g>
        {chipOn > 0 && <circle cx={c[0]} cy={c[1]} r={60 + 50 * chipOn} fill="url(#hotR)" opacity={chipOn} />}
        <path d={poly([P(x1, y0, zc), P(x1, y1, zc), pts[2], pts[1]])} fill="#8A6A12" />
        <path d={poly([P(x1, y1, zc), P(x0, y1, zc), pts[3], pts[2]])} fill="#6E540E" />
        <path d={poly(pts)} fill="url(#gGold)" stroke="#FFF1B8" strokeWidth={2} filter={chipOn > 0.3 ? 'url(#glow)' : undefined} />
        <path d={`${seg(P(x0 + 18, y0, zc + 5), P(x0 + 18, y1, zc + 5))} ${seg(P(x0 + 36, y0, zc + 5), P(x0 + 36, y1, zc + 5))} ${seg(P(x0, y0 + 30, zc + 5), P(x1, y0 + 30, zc + 5))}`}
          stroke="#7A5A0C" strokeWidth={2} />
      </g>
    );
  })();
  return (
    <g>
      {showSheet && sheet()}
      {(part === 'all' || part === 'coil') && coil > 0 && coilEl}
      {(part === 'all' || part === 'chip') && chip}
    </g>
  );
};

// ---------- toll gate (S1 + S6b) ----------
export const Gate: React.FC<{t: number; q: number; arm: number; carX: number; screen: string; screenHot?: number; tap?: number; labelShift?: [number, number]}> = ({t, q, arm, carX, screen, screenHot = 0, tap = -1, labelShift = [0, 0]}) => {
  const iso = isoAt(390, 880, 0.85);
  const k = 1;
  // car on the road
  const car = (x: number) => (
    <g>
      <Shadow cx={iso(x + 110, 140, 0)[0]} cy={iso(x + 110, 140, 0)[1] + 6} rx={170} ry={46} />
      <Solid iso={iso} x0={x} x1={x + 230} y0={80} y1={200} z0={14} z1={70} q={q} />
      <Solid iso={iso} x0={x + 40} x1={x + 160} y0={92} y1={188} z0={70} z1={118} q={q} top="url(#gCard)" />
      {[x + 40, x + 180].map((wx, k2) => {
        const c = iso(wx, 200, 14);
        return <ellipse key={k2} cx={c[0]} cy={c[1]} rx={22} ry={14} fill="#06182E" stroke={B.line} strokeWidth={3} opacity={q} />;
      })}
    </g>
  );
  // road band
  const road = [iso(-700, 40, 0), iso(700, 40, 0), iso(700, 240, 0), iso(-700, 240, 0)];
  const pole = iso(330, 40, 0);
  const head = iso(330, 40, 170);
  const pivot = iso(380, 20, 110);
  const ang = -lerp(0, 78, arm) * (Math.PI / 180);
  const armLen = 300;
  const armEnd = iso(380, 20 + armLen * Math.cos(-ang), 110 + armLen * Math.sin(-ang));
  return (
    <g>
      <path d={poly(road)} fill="#0A2E57" opacity={0.85 * q} stroke={B.line2} strokeWidth={2} />
      <path d={seg(iso(-700, 140, 0), iso(700, 140, 0))} stroke={B.yellow} strokeWidth={4} strokeDasharray="34 28" opacity={0.7 * q} />
      {/* booth + canopy */}
      <Shadow cx={iso(470, -60, 0)[0]} cy={iso(470, -60, 0)[1]} rx={190} ry={60} />
      <Solid iso={iso} x0={380} x1={560} y0={-150} y1={10} z0={0} z1={230} q={q} />
      <Solid iso={iso} x0={300} x1={640} y0={-200} y1={300} z0={330} z1={360} q={p(q, 0.3, 1)} />
      {[[310, -190], [610, -190], [610, 290]].map(([x, y], i) => (
        <path key={i} d={seg(iso(x, y, 0), iso(x, y, 330))} stroke={B.line} strokeWidth={4} opacity={p(q, 0.4, 1)} />
      ))}
      <text transform={`translate(${iso(545, -45, 360)[0] + labelShift[0]} ${iso(545, -45, 360)[1] + labelShift[1]})`} textAnchor="middle" fill={B.yellow} style={{color: B.yellow, fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 2}} opacity={p(q, 0.5, 1)}>GERBANG TOL · AUDIRA</text>
      {/* reader pole + head */}
      <path d={seg(pole, head)} stroke={B.line} strokeWidth={6} opacity={q} />
      <Solid iso={iso} x0={300} x1={350} y0={10} y1={60} z0={150} z1={230} q={q} />
      <g transform={`translate(${head[0] - 210} ${head[1] - 150})`}>
        <rect x={0} y={0} width={184} height={62} rx={6} fill="#04142A" stroke={screenHot > 0 ? B.yellow : B.line2} strokeWidth={3} filter={screenHot > 0 ? 'url(#glow)' : undefined} />
        <text x={92} y={42} textAnchor="middle" fill={screenHot > 0 ? B.yellow : B.cyan} style={{color: screenHot > 0 ? B.yellow : B.cyan, fontFamily: MONO, fontWeight: 700, fontSize: 30}}>{screen}</text>
      </g>
      {tap >= 0 && tap < 1 && [0, 1, 2].map((r) => {
        const qq = (tap * 1.6 - r * 0.25);
        if (qq <= 0 || qq >= 1) return null;
        return <ellipse key={r} cx={head[0] - 10} cy={head[1] - 40} rx={30 + qq * 150} ry={20 + qq * 90} fill="none" stroke={B.cyan} strokeWidth={5} opacity={1 - qq} filter="url(#glow)" />;
      })}
      {/* barrier arm */}
      <path d={seg(pivot, armEnd)} stroke={B.red} strokeWidth={14} strokeLinecap="round" opacity={q} />
      <path d={seg(pivot, armEnd)} stroke="#fff" strokeWidth={14} strokeDasharray="26 26" strokeLinecap="butt" opacity={0.85 * q} />
      <circle cx={pivot[0]} cy={pivot[1]} r={14} fill={B.line} opacity={q} />
      {car(carX)}
      {/* gentle traffic light blink */}
      <circle cx={iso(560, -150, 260)[0]} cy={iso(560, -150, 260)[1]} r={13} fill={arm > 0.5 ? '#5BEA8A' : B.red} filter="url(#glow)" opacity={q * (0.75 + 0.25 * Math.sin(t * 6))} />
      {k ? null : null}
    </g>
  );
};

// ---------- reader with field lines (S4 + S5a) ----------
export const Reader: React.FC<{cx: number; y: number; q: number; field: number; t: number; power?: number; label?: boolean}> = ({cx, y, q, field, t, power = 1, label = true}) => {
  const w = 460, h = 150;
  const loops = [90, 150, 215, 285, 360];
  const dir = Math.sin(t * 7) >= 0 ? 1 : -1; // bolak-balik
  return (
    <g>
      <Shadow cx={cx} cy={y + h + 10} rx={300} ry={44} o={q} />
      {/* field loops above the reader */}
      {field > 0 && loops.map((a, i) => {
        const hh = a * 1.25;
        const d = `M ${cx - a} ${y + 6} C ${cx - a * 1.05} ${y - hh} ${cx + a * 1.05} ${y - hh} ${cx + a} ${y + 6}`;
        const fq = p(field, i * 0.12, 0.5 + i * 0.12);
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={B.cyan} strokeWidth={3} strokeOpacity={0.35 * fq} />
            <path d={d} fill="none" stroke={B.cyan} strokeWidth={5} strokeDasharray="20 26" strokeDashoffset={dir * t * 120 + i * 9}
              opacity={fq * (0.6 + 0.4 * Math.abs(Math.sin(t * 7 + i)))} filter="url(#glow)" />
          </g>
        );
      })}
      {field > 0 && <ellipse cx={cx} cy={y - 20} rx={260} ry={120} fill="url(#cyanR)" opacity={0.55 * field * (0.75 + 0.25 * Math.sin(t * 7))} />}
      {/* body: top face + front face with gradient */}
      <path d={`M ${cx - w / 2} ${y} L ${cx + w / 2} ${y} L ${cx + w / 2 - 30} ${y - 34} L ${cx - w / 2 + 30} ${y - 34} Z`} fill="url(#gTop)" stroke={B.line} strokeWidth={3} opacity={q} />
      <rect x={cx - w / 2} y={y} width={w} height={h} rx={10} fill="url(#gLeft)" stroke={B.line} strokeWidth={3} {...drawOn(q)} />
      <rect x={cx - w / 2} y={y} width={w} height={h} rx={10} fill="url(#gLeft)" opacity={p(q, 0.4, 1)} />
      {/* cutaway coil */}
      <g opacity={p(q, 0.5, 1)}>
        {[0, 1, 2].map((r) => (
          <ellipse key={r} cx={cx} cy={y + 64} rx={150 - r * 22} ry={36 - r * 7} fill="none" stroke={power > 0 ? B.cyan : B.line2} strokeWidth={4}
            strokeDasharray={r === 0 ? undefined : '10 8'} filter={field > 0.2 ? 'url(#glow)' : undefined} />
        ))}
        {label && <text x={cx} y={y + 136} textAnchor="middle" fill={B.line} style={{color: B.line, fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 2}}>PEMBACA · KUMPARAN</text>}
      </g>
    </g>
  );
};

// ---------- HUD ----------
/** Kinetic data card: frame draws on, value pops with a small overshoot, label typed above. */
export const Hud: React.FC<{x: number; y: number; w: number; label: string; value: string; t: number; start: number; color?: string; size?: number; end?: number}> = ({
  x, y, w, label, value, t, start, color = B.yellow, size = 84, end = 1e9,
}) => {
  const q = p(t, start, start + 0.45);
  const out = 1 - p(t, end - 0.3, end);
  if (q <= 0 || out <= 0) return null;
  const pop = pb(t, start + 0.1, start + 0.5);
  const h = size + 86;
  return (
    <g opacity={out} transform={`translate(${x + w / 2} ${y + h / 2}) scale(${0.9 + 0.1 * pop}) translate(${-x - w / 2} ${-y - h / 2})`}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill="#061C38" fillOpacity={0.88 * q} stroke={color} strokeWidth={3} {...drawOn(q)} />
      <path d={`M ${x - 10} ${y + 24} L ${x - 10} ${y - 10} L ${x + 24} ${y - 10} M ${x + w + 10} ${y + h - 24} L ${x + w + 10} ${y + h + 10} L ${x + w - 24} ${y + h + 10}`}
        fill="none" stroke={B.cyan} strokeWidth={4} opacity={q} />
      <text x={x + 28} y={y + 46} fill={B.cyan} opacity={q} style={{color: B.cyan, fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 2}}>{label}</text>
      <text x={x + w / 2} y={y + 56 + size * 0.92} textAnchor="middle" fill={color} opacity={pop} filter="url(#glow)"
        style={{color: color, fontFamily: HEAD, fontWeight: 700, fontSize: size, letterSpacing: 1}}>{value}</text>
    </g>
  );
};

/** Big mono heading typed in (top of sheet). */
export const Title: React.FC<{x: number; y: number; text: string; t: number; start: number; size?: number; color?: string; anchor?: 'start' | 'middle'; end?: number}> = ({
  x, y, text, t, start, size = 64, color = B.line, anchor = 'middle', end = 1e9,
}) => {
  const n = Math.floor(Math.max(0, t - start) * 34);
  const out = 1 - p(t, end - 0.3, end);
  if (n <= 0 || out <= 0) return null;
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} opacity={out} style={{color: color, fontFamily: HEAD, fontWeight: 700, fontSize: size, letterSpacing: 1}}>
      {text.slice(0, n)}
    </text>
  );
};

/** Drawing-sheet title block: the AUDIRA brand inside the world. */
export const TitleBlock: React.FC<{x: number; y: number; q: number; dwg: string}> = ({x, y, q, dwg}) => {
  if (q <= 0) return null;
  const w = 560, h = 132;
  return (
    <g opacity={p(q, 0, 0.4)}>
      <rect x={x} y={y} width={w} height={h} fill="#061C38" fillOpacity={0.85} stroke={B.line} strokeWidth={3} {...drawOn(q)} />
      <path d={`M ${x} ${y + 62} L ${x + w} ${y + 62} M ${x + 318} ${y + 62} L ${x + 318} ${y + h}`} stroke={B.line2} strokeWidth={2} {...drawOn(p(q, 0.2, 1))} />
      <text x={x + 22} y={y + 46} fill={B.line} style={{color: B.line, fontFamily: HEAD, fontWeight: 700, fontSize: 36, letterSpacing: 4}}>AUDIRA EXPLAINED</text>
      <text x={x + 22} y={y + 110} fill={B.cyan} style={{color: B.cyan, fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 1}}>{dwg}</text>
      <text x={x + w - 22} y={y + 110} textAnchor="end" fill={B.line} style={{color: B.line, fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 1}}>REV A</text>
    </g>
  );
};

/** Battery icon crossed out in red. */
export const NoBattery: React.FC<{x: number; y: number; q: number; cross: number; s?: number}> = ({x, y, q, cross, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={q}>
    <rect x={-70} y={-36} width={130} height={72} rx={10} fill="none" stroke={B.line} strokeWidth={6} />
    <rect x={62} y={-16} width={14} height={32} rx={3} fill={B.line} />
    <rect x={-58} y={-24} width={30} height={48} rx={4} fill={B.red} opacity={0.8} />
    <path d="M -92 -58 L 96 58" stroke={B.red} strokeWidth={12} strokeLinecap="round" {...drawOn(cross)} filter="url(#glow)" />
  </g>
);

export {pio, p, pb, lerp};
