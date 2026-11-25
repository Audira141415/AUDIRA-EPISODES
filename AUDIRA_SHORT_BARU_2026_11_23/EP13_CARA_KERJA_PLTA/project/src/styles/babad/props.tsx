import React from 'react';
import {lerp, p, pb, rnd, spline} from '../shared';
import {BB, HEAD, rp, roundPoly, UI} from './kit';
import {SoftShadow, useHalus} from '../../lib/halus';

// BABAD world props for history episodes (all original flat artwork, ink outlines on foreground pieces only).
// Origins: standing objects = bottom centre; held props = the hand.
const K = BB.ink;
type Pt = [number, number];

// ---------- held props (origin = hand) ----------
export const Keris: React.FC<{sw?: number}> = ({sw = 7}) => (
  <g>
    <path d="M -6 -40 Q 8 -70 -6 -100 Q -20 -130 -4 -160 Q 10 -190 -2 -230 L 2 -232 Q 18 -190 8 -160 Q -6 -130 8 -100 Q 22 -70 8 -40 Z" fill={BB.metal} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    <path d={rp(-26, -46, 52, 14, 6)} fill={BB.gold} stroke={K} strokeWidth={sw * 0.8} />
    <path d="M -10 -32 Q -18 0 -6 26 L 8 26 Q 18 0 10 -32 Z" fill={BB.woodSh} stroke={K} strokeWidth={sw * 0.8} strokeLinejoin="round" />
  </g>
);
/** Matchlock musket, muzzle up; `fire` 0..1 puffs smoke + flash at the muzzle. */
export const Musket: React.FC<{sw?: number; fire?: number}> = ({sw = 7, fire = 0}) => (
  <g>
    <rect x={-7} y={-300} width={14} height={300} rx={6} fill="#4A4A52" stroke={K} strokeWidth={sw} />
    <path d="M -16 -40 L 16 -40 L 26 90 Q 0 110 -26 90 Z" fill={BB.wood} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    <path d={rp(-14, -120, 28, 80, 8)} fill={BB.wood} stroke={K} strokeWidth={sw} />
    {fire > 0 && fire < 1 && (
      <g>
        <path d={`M 0 -300 L ${-26 * (1 - fire)} -${330 + 40 * fire} L 0 -${360 + 60 * fire * 0} L ${26 * (1 - fire)} -${330 + 40 * fire} Z`} fill={BB.flameHi} stroke={K} strokeWidth={sw * 0.6} opacity={fire < 0.35 ? 1 : 0} />
        {[0, 1, 2].map((i) => {
          const r = (30 + i * 16) * Math.sin(Math.PI * Math.min(1, fire * 1.1)) ;
          return <circle key={i} cx={(i - 1) * 34 * fire} cy={-320 - fire * (90 + i * 40)} r={Math.max(0, r)} fill="#EDEAE4" stroke={K} strokeWidth={sw * 0.6} />;
        })}
      </g>
    )}
  </g>
);
export const Spyglass: React.FC<{sw?: number}> = ({sw = 7}) => (
  <g transform="rotate(-80)">
    <path d={rp(-12, -40, 24, 120, 8)} fill={BB.goldSh} stroke={K} strokeWidth={sw} />
    <path d={rp(-16, -110, 32, 80, 8)} fill={BB.gold} stroke={K} strokeWidth={sw} />
    <ellipse cx={0} cy={-112} rx={16} ry={6} fill={BB.sky2} stroke={K} strokeWidth={sw * 0.7} />
  </g>
);
export const TorchHeld: React.FC<{t: number; sw?: number; seed?: number}> = ({t, sw = 7, seed = 1}) => {
  const w = Math.sin(t * 7 + seed) * 6;
  return (
    <g>
      <rect x={-10} y={-160} width={20} height={190} rx={8} fill={BB.wood} stroke={K} strokeWidth={sw} />
      <path d={`M -26 -160 Q -36 -220 ${w} -290 Q 10 -250 22 -258 Q 40 -210 26 -160 Z`} fill={BB.flameSh} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M -14 -164 Q -18 -208 ${w * 0.6} -250 Q 10 -222 14 -164 Z`} fill={BB.flame} />
    </g>
  );
};
export const Bucket: React.FC<{sw?: number}> = ({sw = 7}) => (
  <g>
    <path d="M -60 -90 L 60 -90 L 46 0 L -46 0 Z" fill={BB.wood} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    {[-60, -28].map((y) => <line key={y} x1={-56 + (y + 90) * 0.15} y1={y} x2={56 - (y + 90) * 0.15} y2={y} stroke={K} strokeWidth={sw * 0.8} />)}
    <path d="M -58 -90 Q 0 -170 58 -90" stroke={K} strokeWidth={sw} fill="none" />
  </g>
);
/** Cartoon poop swirl (origin = bottom centre). */
export const Poop: React.FC<{sw?: number; s?: number; face?: boolean}> = ({sw = 7, s = 1, face}) => (
  <g transform={`scale(${s})`}>
    <path d={rp(-60, -40, 120, 40, 20)} fill="#8A5A2E" stroke={K} strokeWidth={sw / s} />
    <path d={rp(-44, -72, 88, 36, 18)} fill="#8A5A2E" stroke={K} strokeWidth={sw / s} />
    <path d="M -24 -70 Q 0 -120 20 -100 Q 30 -86 26 -70 Z" fill="#8A5A2E" stroke={K} strokeWidth={sw / s} strokeLinejoin="round" />
    <path d="M -40 -18 Q 0 -8 40 -18" stroke="#6E451F" strokeWidth={sw / s} fill="none" />
    {face && (
      <g>
        <circle cx={-18} cy={-26} r={5} fill={K} />
        <circle cx={18} cy={-26} r={5} fill={K} />
      </g>
    )}
  </g>
);
/** Wavy stink lines rising above (x, y). */
export const Stink: React.FC<{t: number; x: number; y: number; s?: number; col?: string}> = ({t, x, y, s = 1, col = '#8DBB4A'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-40, 0, 40].map((dx, i) => {
      const ph = t * 4 + i * 2;
      return <path key={i} d={`M ${dx} 0 q ${12 * Math.sin(ph)} -25 0 -50 q ${-12 * Math.sin(ph)} -25 0 -50`} stroke={col} strokeWidth={10} fill="none" strokeLinecap="round" />;
    })}
  </g>
);
export const Fly: React.FC<{t: number; cx: number; cy: number; r?: number; seed?: number}> = ({t, cx, cy, r = 60, seed = 1}) => {
  const a = t * (3 + rnd(seed) * 2) + seed;
  const x = cx + Math.cos(a) * r, y = cy + Math.sin(a * 1.3) * r * 0.6;
  const flap = Math.abs(Math.sin(t * 18 + seed)) * 6 + 6;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={-6} cy={-8} rx={9} ry={flap} fill="#fff" stroke={K} strokeWidth={3} />
      <ellipse cx={6} cy={-8} rx={9} ry={flap} fill="#fff" stroke={K} strokeWidth={3} />
      <circle cx={0} cy={0} r={8} fill={K} />
    </g>
  );
};
export const Mosquito: React.FC<{t: number; x: number; y: number; s?: number; seed?: number; flip?: boolean}> = ({t, x, y, s = 1, seed = 1, flip}) => {
  const flap = Math.abs(Math.sin(t * 20 + seed)) * 14 + 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (flip ? -1 : 1)} ${s})`}>
      <ellipse cx={-6} cy={-26} rx={12} ry={flap} fill="#E8F4FA" stroke={K} strokeWidth={4} transform="rotate(-20 -6 -26)" />
      <ellipse cx={10} cy={-26} rx={12} ry={flap} fill="#E8F4FA" stroke={K} strokeWidth={4} transform="rotate(20 10 -26)" />
      <ellipse cx={0} cy={0} rx={30} ry={11} fill="#5A4636" stroke={K} strokeWidth={4} />
      <circle cx={-32} cy={-4} r={11} fill="#5A4636" stroke={K} strokeWidth={4} />
      <line x1={-42} y1={-2} x2={-74} y2={10} stroke={K} strokeWidth={4} strokeLinecap="round" />
      <circle cx={-35} cy={-7} r={3.5} fill="#fff" />
      {[-12, 2, 16].map((lx) => <path key={lx} d={`M ${lx} 8 l -8 22`} stroke={K} strokeWidth={3} strokeLinecap="round" />)}
    </g>
  );
};

// ---------- standing objects (origin = bottom centre) ----------
export const Barrel: React.FC<{sw?: number; label?: string; empty?: boolean; tip?: number}> = ({sw = 7, label, empty, tip = 0}) => (
  <g transform={`rotate(${tip} 70 0)`}>
    <path d="M -70 -170 Q -88 -85 -70 0 L 70 0 Q 88 -85 70 -170 Z" fill={BB.wood} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    <path d="M 30 -170 Q 50 -85 30 0 L 70 0 Q 88 -85 70 -170 Z" fill={BB.woodSh} />
    {[-140, -30].map((y) => <path key={y} d={`M ${-76} ${y} Q 0 ${y + 8} 76 ${y}`} stroke="#5A5A62" strokeWidth={sw * 2} fill="none" />)}
    <path d="M -70 -170 Q -88 -85 -70 0 L 70 0 Q 88 -85 70 -170 Z" fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    <ellipse cx={0} cy={-170} rx={70} ry={18} fill={empty ? '#3A2A1E' : '#2A2A2E'} stroke={K} strokeWidth={sw} />
    {label && <text x={0} y={-72} textAnchor="middle" fill={K} style={{fontFamily: HEAD, fontSize: 40}}>{label}</text>}
  </g>
);
export const Ladder: React.FC<{h: number; sw?: number; w?: number}> = ({h, sw = 7, w = 90}) => (
  <g>
    {[-w / 2, w / 2].map((x) => <rect key={x} x={x - 9} y={-h} width={18} height={h} rx={6} fill={BB.woodHi} stroke={K} strokeWidth={sw} />)}
    {Array.from({length: Math.floor(h / 70)}, (_, i) => <rect key={i} x={-w / 2} y={-50 - i * 70} width={w} height={12} rx={4} fill={BB.wood} stroke={K} strokeWidth={sw * 0.7} />)}
  </g>
);
export const Cow: React.FC<{t: number; sw?: number; seed?: number}> = ({t, sw = 7, seed = 1}) => {
  const chew = Math.sin(t * 6 + seed) * 3;
  return (
    <g>
      {[-70, -30, 40, 80].map((x, i) => <rect key={x} x={x - 12} y={-80} width={24} height={80} rx={8} fill={i % 2 ? '#E9DFCF' : '#F6EFE4'} stroke={K} strokeWidth={sw} />)}
      <path d={rp(-110, -190, 220, 130, 60)} fill="#F6EFE4" stroke={K} strokeWidth={sw} />
      <path d="M -40 -186 Q -10 -150 -50 -110 Q -80 -130 -70 -176 Z" fill="#6B4A33" />
      <path d="M 50 -176 Q 80 -150 60 -90 Q 30 -110 30 -160 Z" fill="#6B4A33" />
      <path d={rp(-110, -190, 220, 130, 60)} fill="none" stroke={K} strokeWidth={sw} />
      <path d="M 104 -150 Q 130 -110 120 -90" stroke={K} strokeWidth={sw} fill="none" strokeLinecap="round" />
      <g transform={`translate(-120 ${-196 + chew})`}>
        <path d="M -40 -10 L -66 -40 L -30 -30 Z M 40 -10 L 66 -40 L 30 -30 Z" fill="#E9DFCF" stroke={K} strokeWidth={sw * 0.8} strokeLinejoin="round" />
        <ellipse cx={0} cy={0} rx={52} ry={46} fill="#F6EFE4" stroke={K} strokeWidth={sw} />
        <ellipse cx={0} cy={26} rx={40} ry={24} fill="#F2B6A8" stroke={K} strokeWidth={sw} />
        <circle cx={-12} cy={26} r={5} fill={K} />
        <circle cx={12} cy={26} r={5} fill={K} />
        <circle cx={-20} cy={-12} r={7} fill={K} />
        <circle cx={20} cy={-12} r={7} fill={K} />
      </g>
    </g>
  );
};
export const Coconut: React.FC<{x: number; y: number; r?: number; sw?: number; rot?: number}> = ({x, y, r = 34, sw = 6, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle cx={0} cy={0} r={r} fill="#8A5A30" stroke={K} strokeWidth={sw} />
    <path d={`M ${-r * 0.6} ${-r * 0.2} Q 0 ${-r * 0.7} ${r * 0.6} ${-r * 0.3}`} stroke="#6B4222" strokeWidth={sw} fill="none" />
    {[[-0.25, 0.25], [0.15, 0.3], [-0.05, 0.55]].map(([a, b], i) => <circle key={i} cx={a * r} cy={b * r} r={r * 0.1} fill="#4A2E16" />)}
  </g>
);
/** A triangular heap of coconuts; `q` 0..1 reveals rows bottom-up. */
export const CoconutPile: React.FC<{rows?: number; r?: number; q?: number; sw?: number}> = ({rows = 5, r = 34, q = 1, sw = 6}) => {
  const out: React.ReactNode[] = [];
  let k = 0;
  for (let row = 0; row < rows; row++) {
    const n = rows - row;
    for (let i = 0; i < n; i++) {
      const at = k / ((rows * (rows + 1)) / 2);
      k++;
      if (q <= 0 || at > q) continue;
      out.push(<Coconut key={`${row}_${i}`} x={(i - (n - 1) / 2) * r * 2} y={-r - row * r * 1.7} r={r} sw={sw} rot={rnd(row * 9 + i) * 60} />);
    }
  }
  return <g>{out}</g>;
};
/** Javanese rice barn on stilts. `fire` 0..1 swaps to charred colours. */
export const Lumbung: React.FC<{sw?: number; burnt?: number}> = ({sw = 7, burnt = 0}) => {
  const roof = burnt > 0.5 ? '#4A3A2E' : '#C79A52', roofSh = burnt > 0.5 ? '#2F2620' : '#A87F3E';
  const wall = burnt > 0.5 ? '#5A4636' : BB.woodHi;
  const halus = useHalus('BABAD').full;
  return (
    <g>
      {halus && <SoftShadow cx={0} cy={4} rx={190} ry={22} op={0.28} ink={K} />}
      {[-110, -40, 40, 110].map((x) => <rect key={x} x={x - 12} y={-190} width={24} height={190} fill={BB.woodSh} stroke={K} strokeWidth={sw} />)}
      {[-110, 110].map((x) => <ellipse key={x} cx={x} cy={-190} rx={30} ry={12} fill={BB.stone} stroke={K} strokeWidth={sw * 0.8} />)}
      <path d={rp(-150, -220, 300, 34, 6)} fill={BB.wood} stroke={K} strokeWidth={sw} />
      <path d="M -130 -220 L -150 -360 L 150 -360 L 130 -220 Z" fill={wall} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      {[-80, -20, 40, 100].map((x) => <line key={x} x1={x} y1={-222} x2={x * 1.08} y2={-356} stroke={BB.woodSh} strokeWidth={sw * 0.7} />)}
      <path d="M -210 -340 Q -150 -380 -120 -470 Q -40 -620 0 -630 Q 40 -620 120 -470 Q 150 -380 210 -340 Q 0 -310 -210 -340 Z" fill={roof} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M 30 -620 Q 110 -520 150 -400 Q 170 -366 210 -340 Q 160 -334 120 -332 Q 110 -480 30 -620 Z" fill={roofSh} />
      {[-150, -90, -30, 30, 90].map((x, i) => <path key={x} d={`M ${x} ${-334 - rnd(i) * 6} L ${x * 0.35} ${-560}`} stroke={roofSh} strokeWidth={sw * 0.6} />)}
      <path d="M -210 -340 Q -150 -380 -120 -470 Q -40 -620 0 -630 Q 40 -620 120 -470 Q 150 -380 210 -340 Q 0 -310 -210 -340 Z" fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  );
};
/** Cluster of flat flames (origin = base centre); w = width of the fire. */
export const Flames: React.FC<{t: number; w?: number; h?: number; seed?: number; q?: number; sw?: number}> = ({t, w = 300, h = 300, seed = 1, q = 1, sw = 6}) => {
  if (q <= 0.01) return null;
  const n = Math.max(3, Math.round(w / 105));
  return (
    <g transform={`scale(${q})`}>
      {Array.from({length: n}, (_, i) => {
        const x = (i / (n - 1) - 0.5) * w;
        const hh = h * (0.55 + rnd(seed + i) * 0.45) * (1 + Math.sin(t * (5 + rnd(i) * 3) + i) * 0.1);
        const ww = (w / n) * 1.9;
        const lean = Math.sin(t * 3 + i + seed) * 14;
        return (
          <g key={i}>
            <path d={`M ${x - ww / 2} 0 Q ${x - ww * 0.6} ${-hh * 0.5} ${x + lean} ${-hh} Q ${x + ww * 0.6} ${-hh * 0.5} ${x + ww / 2} 0 Z`} fill={BB.flameSh} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
            <path d={`M ${x - ww * 0.3} 0 Q ${x - ww * 0.35} ${-hh * 0.4} ${x + lean * 0.7} ${-hh * 0.72} Q ${x + ww * 0.35} ${-hh * 0.4} ${x + ww * 0.3} 0 Z`} fill={BB.flame} />
            <path d={`M ${x - ww * 0.14} 0 Q ${x - ww * 0.16} ${-hh * 0.22} ${x + lean * 0.4} ${-hh * 0.42} Q ${x + ww * 0.16} ${-hh * 0.22} ${x + ww * 0.14} 0 Z`} fill={BB.flameHi} />
          </g>
        );
      })}
    </g>
  );
};
/** Rising smoke puffs (grow, drift, shrink — no opacity flicker). */
export const Smoke: React.FC<{t: number; x: number; y: number; n?: number; r?: number; rise?: number; col?: string; seed?: number}> = ({t, x, y, n = 6, r = 60, rise = 500, col = '#6E6A72', seed = 1}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const per = 2.4;
      const k = ((t + (i / n) * per + rnd(seed + i)) % per) / per;
      const rr = r * Math.sin(Math.PI * k) * (0.7 + rnd(seed + i * 2) * 0.6);
      return <circle key={i} cx={x + Math.sin(k * 3 + i) * 40 + k * 60} cy={y - k * rise} r={rr} fill={col} />;
    })}
  </g>
);
/** Javanese jong: curved hull + two slanted rectangular sails (origin = waterline centre). */
export const Jong: React.FC<{t: number; sw?: number; sail?: string; seed?: number}> = ({t, sw = 7, sail = '#E9D9B4', seed = 1}) => {
  const bob = Math.sin(t * 2 + seed) * 6, roll = Math.sin(t * 1.6 + seed) * 2;
  return (
    <g transform={`translate(0 ${bob}) rotate(${roll})`}>
      {[-60, 70].map((x, i) => (
        <g key={x}>
          <rect x={x - 8} y={-420 + i * 40} width={16} height={400 - i * 40} fill={BB.woodSh} stroke={K} strokeWidth={sw} />
          <path d={`M ${x + 6} ${-400 + i * 40} L ${x + 150} ${-430 + i * 40} L ${x + 120} ${-130} L ${x + 6} ${-110} Z`} fill={sail} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
          {[0.33, 0.66].map((k) => <line key={k} x1={x + 6} y1={lerp(-400 + i * 40, -110, k)} x2={lerp(x + 150, x + 120, k)} y2={lerp(-430 + i * 40, -130, k)} stroke={BB.parchLine} strokeWidth={sw * 0.7} />)}
        </g>
      ))}
      <path d="M -260 -110 Q -250 -40 -180 0 L 200 0 Q 270 -40 290 -120 L 240 -100 L -210 -100 Z" fill={BB.wood} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M -230 -70 L 260 -78" stroke={BB.woodSh} strokeWidth={sw} />
      <path d="M 120 -100 L 240 -100 L 290 -120 Q 270 -40 200 0 L 150 0 Q 190 -50 120 -100 Z" fill={BB.woodSh} />
      <path d="M -260 -110 Q -250 -40 -180 0 L 200 0 Q 270 -40 290 -120 L 240 -100 L -210 -100 Z" fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  );
};
/** Flat sea band with gently moving wave crests. */
export const Sea: React.FC<{t: number; y: number; x0?: number; x1?: number; col?: string; crest?: string}> = ({t, y, x0 = -2000, x1 = 3200, col = '#5DB2D8', crest = '#8ED0EA'}) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={3000} fill={col} />
    {Array.from({length: 4}, (_, r) => {
      const yy = y + 50 + r * 110;
      const off = ((t * (30 + r * 10)) % 240) - 240;
      let d = '';
      for (let x = x0 + off + (r % 2) * 120; x < x1; x += 240) d += `M ${x} ${yy} q 30 -18 60 0 `;
      return <path key={r} d={d} stroke={crest} strokeWidth={10} fill="none" strokeLinecap="round" />;
    })}
  </g>
);
/** VOC flag: orange / white / blue with the VOC monogram, waving (origin = pole top). */
export const FlagVOC: React.FC<{t: number; w?: number; h?: number; sw?: number; pole?: number}> = ({t, w = 260, h = 170, sw = 7, pole = 420}) => {
  const wave = (x: number, row: number) => Math.sin(t * 4 - x / 60 + row) * 10 * (x / w);
  const band = (y0: number, y1: number, c: string) => {
    let d = `M 0 ${y0}`;
    for (let x = 0; x <= w; x += w / 8) d += ` L ${x} ${y0 + wave(x, 0)}`;
    for (let x = w; x >= 0; x -= w / 8) d += ` L ${x} ${y1 + wave(x, 0)}`;
    return <path d={d + ' Z'} fill={c} />;
  };
  let outline = `M 0 0`;
  for (let x = 0; x <= w; x += w / 8) outline += ` L ${x} ${wave(x, 0)}`;
  for (let x = w; x >= 0; x -= w / 8) outline += ` L ${x} ${h + wave(x, 0)}`;
  return (
    <g>
      <rect x={-8} y={-20} width={16} height={pole} rx={6} fill={BB.woodSh} stroke={K} strokeWidth={sw} />
      <circle cx={0} cy={-24} r={14} fill={BB.gold} stroke={K} strokeWidth={sw * 0.8} />
      <g transform="translate(8 0)">
        {band(0, h / 3, '#E9772E')}
        {band(h / 3, (h * 2) / 3, '#FFFFFF')}
        {band((h * 2) / 3, h, '#2F4F9A')}
        <text x={w / 2} y={h / 2 + 22 + wave(w / 2, 0)} textAnchor="middle" fill={K} style={{fontFamily: HEAD, fontSize: 62, letterSpacing: 2}}>VOC</text>
        <path d={outline + ' Z'} fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      </g>
    </g>
  );
};
/** Tall Javanese banner (umbul-umbul) — origin = pole foot. */
export const Umbul: React.FC<{t: number; h?: number; col?: string; col2?: string; sw?: number; seed?: number}> = ({t, h = 700, col = BB.gold, col2 = BB.red, sw = 7, seed = 1}) => {
  const sway = (k: number) => Math.sin(t * 3 + seed - k * 3) * 24 * k;
  let d = `M 8 ${-h + 20}`;
  for (let k = 0; k <= 1; k += 0.1) d += ` L ${8 + 40 + sway(k)} ${-h + 20 + k * h * 0.6}`;
  for (let k = 1; k >= 0; k -= 0.1) d += ` L ${8 + sway(k) * 0.6} ${-h + 20 + k * h * 0.6}`;
  return (
    <g>
      <rect x={-8} y={-h} width={16} height={h} rx={6} fill={BB.wood} stroke={K} strokeWidth={sw} />
      <path d={d + ' Z'} fill={col} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M 8 ${-h + 20} L ${48 + sway(0.05)} ${-h + 26} L ${44 + sway(0.25)} ${-h + 20 + h * 0.15} L 8 ${-h + 20 + h * 0.15} Z`} fill={col2} stroke={K} strokeWidth={sw * 0.7} strokeLinejoin="round" />
      <circle cx={0} cy={-h - 10} r={14} fill={BB.gold} stroke={K} strokeWidth={sw * 0.8} />
    </g>
  );
};
/** Batavia-style fortress wall with merlons (top edge at `top`, ground at `bottom`). */
export const FortWall: React.FC<{x0: number; x1: number; top: number; bottom: number; sw?: number; seed?: number; col?: string; sh?: string}> = ({
  x0, x1, top, bottom, sw = 7, seed = 3, col = '#E6DCC8', sh = '#C8B99C',
}) => {
  const mer = 90;
  let d = `M ${x0} ${bottom} L ${x0} ${top}`;
  for (let x = x0; x < x1; x += mer * 2) d += ` L ${x} ${top - 60} L ${Math.min(x1, x + mer)} ${top - 60} L ${Math.min(x1, x + mer)} ${top} L ${Math.min(x1, x + mer * 2)} ${top}`;
  d += ` L ${x1} ${bottom} Z`;
  return (
    <g>
      <path d={d} fill={col} />
      {Array.from({length: Math.ceil((bottom - top) / 80)}, (_, r) => (
        <line key={r} x1={x0} y1={top + 40 + r * 80} x2={x1} y2={top + 40 + r * 80} stroke={sh} strokeWidth={sw * 0.8} />
      ))}
      {Array.from({length: Math.ceil((x1 - x0) / 170)}, (_, i) => {
        const r = Math.floor(rnd(seed + i) * 4);
        return <rect key={i} x={x0 + i * 170 + rnd(seed + i * 3) * 60} y={top + 50 + r * 80} width={90} height={60} rx={6} fill={sh} />;
      })}
      <rect x={x0} y={top + 8} width={x1 - x0} height={22} fill={sh} />
      <path d={d} fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  );
};
export const Throne: React.FC<{sw?: number}> = ({sw = 7}) => (
  <g>
    <path d="M -190 0 L -170 -260 L 170 -260 L 190 0 Z" fill={BB.red} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    <path d="M -150 -240 Q -160 -520 0 -600 Q 160 -520 150 -240 Z" fill={BB.gold} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    <path d="M -110 -260 Q -116 -480 0 -540 Q 116 -480 110 -260 Z" fill={BB.red} stroke={K} strokeWidth={sw * 0.8} strokeLinejoin="round" />
    <path d="M 60 -510 Q 150 -470 150 -240 L 110 -260 Q 116 -460 60 -510 Z" fill={BB.goldSh} />
    {[-130, 130].map((x) => <circle key={x} cx={x} cy={-270} r={26} fill={BB.gold} stroke={K} strokeWidth={sw} />)}
    <path d={rp(-200, -280, 400, 50, 14)} fill={BB.goldSh} stroke={K} strokeWidth={sw} />
  </g>
);
/** Joglo hall interior backdrop (pillars + stepped roof beams + floor), screen-space 1080 wide around cx. */
export const JogloHall: React.FC<{cx?: number; floor?: number}> = ({cx = 540, floor = 1500}) => (
  <g>
    <rect x={cx - 2000} y={-2000} width={4000} height={6000} fill="#7A4E2E" />
    <path d={`M ${cx - 2000} ${floor - 1500} L ${cx} ${floor - 1900} L ${cx + 2000} ${floor - 1500} L ${cx + 2000} ${floor - 1180} L ${cx} ${floor - 1500} L ${cx - 2000} ${floor - 1180} Z`} fill="#5E3B22" />
    {[-1, 1].map((sd) => [0, 1, 2].map((k) => (
      <path key={`${sd}_${k}`} d={`M ${cx + sd * (260 + k * 330)} ${floor - 1240 + k * 70} L ${cx + sd * (520 + k * 330)} ${floor - 1170 + k * 70}`} stroke="#4A2E1A" strokeWidth={26} />
    )))}
    <rect x={cx - 2000} y={floor - 300} width={4000} height={300} fill="#8F6038" />
    {[-1, 1].map((sd) => [0, 1].map((k) => {
      const x = cx + sd * (300 + k * 380);
      return (
        <g key={`${sd}_${k}`}>
          <rect x={x - 34} y={floor - 1300} width={68} height={1000} fill="#9A6A3C" />
          <rect x={x + 6} y={floor - 1300} width={28} height={1000} fill="#7E5530" />
          <rect x={x - 46} y={floor - 330} width={92} height={40} fill="#B98E5C" />
          <rect x={x - 40} y={floor - 1250} width={80} height={30} fill={BB.gold} />
        </g>
      );
    }))}
    <rect x={cx - 2000} y={floor} width={4000} height={3000} fill="#C9A16A" />
    {Array.from({length: 18}, (_, i) => <line key={i} x1={cx - 2000 + i * 240} y1={floor} x2={cx - 2000 + i * 240 - 120} y2={floor + 3000} stroke="#B48B56" strokeWidth={8} />)}
  </g>
);
/** Row of Dutch stepped-gable houses (no outline: background layer). */
export const DutchHouses: React.FC<{x: number; y: number; n?: number; s?: number; seed?: number}> = ({x, y, n = 5, s = 1, seed = 2}) => {
  const cols = ['#C46A4A', '#D9B07A', '#A9604A', '#E3CDA6', '#8E5A44'];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {Array.from({length: n}, (_, i) => {
        const w = 180, h = 300 + rnd(seed + i) * 120, hx = i * 190;
        const c = cols[i % cols.length];
        const steps = `M ${hx} 0 L ${hx} ${-h} L ${hx + 20} ${-h} L ${hx + 20} ${-h - 40} L ${hx + 45} ${-h - 40} L ${hx + 45} ${-h - 80} L ${hx + 70} ${-h - 80} L ${hx + 70} ${-h - 120} L ${hx + w - 70} ${-h - 120} L ${hx + w - 70} ${-h - 80} L ${hx + w - 45} ${-h - 80} L ${hx + w - 45} ${-h - 40} L ${hx + w - 20} ${-h - 40} L ${hx + w - 20} ${-h} L ${hx + w} ${-h} L ${hx + w} 0 Z`;
        return (
          <g key={i}>
            <path d={steps} fill={c} />
            {[0, 1].map((r) => [0, 1].map((cc) => <rect key={`${r}${cc}`} x={hx + 30 + cc * 80} y={-h + 40 + r * 110} width={46} height={70} fill="#F4EBDA" />))}
            <rect x={hx + 70} y={-110} width={40} height={110} fill="#5A3B26" />
          </g>
        );
      })}
    </g>
  );
};
/** Gold portrait frame (inner w×h at origin top-left). */
export const Frame: React.FC<{w: number; h: number; sw?: number}> = ({w, h, sw = 7}) => (
  <g>
    <path d={rp(-30, -30, w + 60, h + 60, 10)} fill={BB.gold} stroke={K} strokeWidth={sw} />
    <path d={rp(-14, -14, w + 28, h + 28, 6)} fill={BB.goldSh} stroke={K} strokeWidth={sw * 0.6} />
    {[[-30, -30], [w + 30, -30], [-30, h + 30], [w + 30, h + 30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={18} fill={BB.gold} stroke={K} strokeWidth={sw} />)}
  </g>
);
/** Tear-off wall calendar page. */
export const Calendar: React.FC<{month: string; year?: string; sw?: number}> = ({month, year, sw = 7}) => (
  <g>
    <path d={rp(-180, -220, 360, 440, 18)} fill="#fff" stroke={K} strokeWidth={sw} />
    <path d={rp(-180, -220, 360, 110, [18, 18, 0, 0])} fill={BB.red} stroke={K} strokeWidth={sw} />
    {[-110, -40, 40, 110].map((x) => <rect key={x} x={x - 8} y={-246} width={16} height={50} rx={8} fill={BB.metalSh} stroke={K} strokeWidth={sw * 0.7} />)}
    <text x={0} y={-140} textAnchor="middle" fill="#fff" style={{fontFamily: HEAD, fontSize: 64, letterSpacing: 2}}>{month}</text>
    {year && <text x={0} y={60} textAnchor="middle" fill={K} style={{fontFamily: HEAD, fontSize: 120}}>{year}</text>}
    {Array.from({length: 3}, (_, r) => Array.from({length: 7}, (_, c) => <rect key={`${r}${c}`} x={-150 + c * 43} y={100 + r * 34} width={30} height={22} rx={4} fill={BB.stone} />))}
  </g>
);
/** Clay pot (kendil) — `empty` shows a dark mouth; origin = bottom. */
export const Kendil: React.FC<{sw?: number; empty?: boolean}> = ({sw = 7, empty}) => (
  <g>
    <path d="M -50 -170 Q -130 -120 -100 -40 Q -80 0 0 0 Q 80 0 100 -40 Q 130 -120 50 -170 Z" fill="#B5663E" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    <path d="M 40 -164 Q 120 -120 96 -40 Q 80 -6 30 -2 Q 90 -60 40 -164 Z" fill="#94502F" />
    <path d="M -50 -170 Q -130 -120 -100 -40 Q -80 0 0 0 Q 80 0 100 -40 Q 130 -120 50 -170 Z" fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    <ellipse cx={0} cy={-172} rx={62} ry={18} fill={empty ? '#3A2418' : '#F7F3EA'} stroke={K} strokeWidth={sw} />
  </g>
);

// ---------- map of Java (lon/lat traced by hand, stylised) ----------
const JAVA: Array<[number, number]> = [
  [105.2, -6.75], [105.6, -6.2], [105.9, -6.0], [106.5, -6.0], [106.8, -6.1], [107.3, -5.95], [107.9, -6.2], [108.3, -6.3], [108.55, -6.7],
  [109.1, -6.85], [109.7, -6.85], [110.2, -6.9], [110.45, -6.95], [110.7, -6.5], [111.0, -6.4], [111.5, -6.6], [112.0, -6.85], [112.6, -6.9],
  [112.75, -7.2], [113.5, -7.7], [114.4, -7.75], [114.45, -8.4], [114.3, -8.7], [113.5, -8.35], [112.5, -8.4], [111.5, -8.25], [110.5, -8.1],
  [109.5, -7.75], [108.7, -7.75], [107.8, -7.6], [106.5, -7.4], [105.8, -6.95],
];
export const MAP_K = 110;
export const geo = (lon: number, lat: number): Pt => [(lon - 105) * MAP_K, (-lat - 5.6) * MAP_K];
export const PLACES = {
  batavia: geo(106.82, -6.13), cirebon: geo(108.56, -6.72), tegal: geo(109.14, -6.87), mataram: geo(110.4, -7.85), karawang: geo(107.3, -6.3),
  // v1.13 (East Java, 13th c.)
  singasari: geo(112.66, -7.89), kediri: geo(112.01, -7.82), tarik: geo(112.43, -7.45), tuban: geo(112.05, -6.9),
};
export const javaPath = () => spline(JAVA.map(([lo, la]) => geo(lo, la)), true);
/** Route Mataram → Tegal → Cirebon → Batavia (screen-local), drawn 0..1. */
export const ROUTE: Pt[] = [PLACES.mataram, geo(109.9, -7.4), PLACES.tegal, PLACES.cirebon, geo(107.9, -6.45), PLACES.karawang, PLACES.batavia];
export const JavaMap: React.FC<{t: number; route?: number; sw?: number; sea?: string}> = ({route = 0, sw = 7, sea = '#9ED3EC'}) => {
  const W = 9.6 * MAP_K, H = 3.6 * MAP_K;
  const d = spline(ROUTE);
  return (
    <g>
      <path d={rp(-60, -60, W + 120, H + 120, 30)} fill={sea} stroke={K} strokeWidth={sw} />
      {Array.from({length: 5}, (_, i) => <path key={i} d={`M ${40 + i * 210} ${H + 10} q 20 -12 40 0 q 20 12 40 0`} stroke="#C4E6F4" strokeWidth={6} fill="none" />)}
      <path d={javaPath()} fill={BB.parch} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      {[[110.45, -7.55], [111.1, -7.65], [112.6, -7.9], [108.0, -7.2], [107.6, -6.95]].map(([lo, la], i) => {
        const [x, y] = geo(lo, la);
        return <path key={i} d={`M ${x - 26} ${y + 14} L ${x} ${y - 22} L ${x + 26} ${y + 14} Z`} fill={BB.parchSh} />;
      })}
      {route > 0 && <path d={d} pathLength={1} strokeDasharray={`${route} 2`} stroke={BB.red} strokeWidth={sw * 1.6} fill="none" strokeLinecap="round" />}
      {route > 0 && <path d={d} pathLength={1} strokeDasharray={`0.012 0.018`} stroke={BB.parch} strokeWidth={sw * 0.5} fill="none" opacity={route > 0.98 ? 1 : 0} />}
    </g>
  );
};
/** Map pin with a label (origin = point). */
export const Pin: React.FC<{q: number; label: string; col?: string; sw?: number; below?: boolean; size?: number}> = ({q, label, col = BB.red, sw = 7, below, size = 46}) => {
  if (q <= 0.001) return null;
  const s = pb(q, 0, 1);
  return (
    <g transform={`scale(${s})`}>
      <path d="M 0 0 Q -30 -40 -30 -62 A 30 30 0 1 1 30 -62 Q 30 -40 0 0 Z" fill={col} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      <circle cx={0} cy={-64} r={11} fill="#fff" stroke={K} strokeWidth={sw * 0.6} />
      <text x={0} y={below ? 56 : -110} textAnchor="middle" fill="#fff" stroke={K} strokeWidth={size * 0.22} paintOrder="stroke" strokeLinejoin="round" style={{fontFamily: HEAD, fontSize: size}}>{label}</text>
    </g>
  );
};
/** Big rounded counter plate e.g. "10.000" with a small caption line under it. */
export const Plate: React.FC<{t: number; at: number; x: number; y: number; big: string; small?: string; col?: string; s?: number}> = ({t, at, x, y, big, small, col = BB.gold, s = 1}) => {
  if (t < at) return null;
  const q = pb(t, at, at + 0.3);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * q}) rotate(${(1 - q) * -8})`}>
      <text x={0} y={18} textAnchor="middle" fill={K} stroke={K} strokeWidth={34} strokeLinejoin="round" style={{fontFamily: HEAD, fontSize: 170}}>{big}</text>
      <text x={0} y={0} textAnchor="middle" fill={col} stroke={K} strokeWidth={34} paintOrder="stroke" strokeLinejoin="round" style={{fontFamily: HEAD, fontSize: 170}}>{big}</text>
      {small && <text x={0} y={90} textAnchor="middle" fill="#fff" stroke={K} strokeWidth={14} paintOrder="stroke" strokeLinejoin="round" style={{fontFamily: UI, fontWeight: 900, fontSize: 52, letterSpacing: 3}}>{small}</text>}
    </g>
  );
};
export const roundTo = (n: number) => Math.round(n).toLocaleString('id-ID');
export const reveal = (t: number, a: number, b: number) => p(t, a, b);
export {roundPoly};

// ---------- v1.13 era props (costume lego companions) ----------
/** Sharpened bamboo spear (bambu runcing, 1945) — origin = hand. */
export const BambuRuncing: React.FC<{len?: number; sw?: number}> = ({len = 560, sw = 7}) => {
  const top = -len * 0.66;
  return (
    <g>
      <path d={`M -10 ${len * 0.34} L 10 ${len * 0.34} L 10 ${top + 40} L -10 ${top - 30} Z`} fill="#9DBB5A" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M 2 ${len * 0.34} L 10 ${len * 0.34} L 10 ${top + 40} L 2 ${top + 14} Z`} fill="#7E9C42" />
      {[0.15, 0.45, 0.75].map((k) => <line key={k} x1={-10} y1={lerp(len * 0.34, top + 40, k)} x2={10} y2={lerp(len * 0.34, top + 40, k)} stroke={K} strokeWidth={sw * 0.7} />)}
      <path d={`M -10 ${len * 0.34} L 10 ${len * 0.34} L 10 ${top + 40} L -10 ${top - 30} Z`} fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  );
};
/** Curved sabre / dao (officers, Mongol riders) — origin = hand, blade up. */
export const Sabre: React.FC<{len?: number; sw?: number; col?: string}> = ({len = 300, sw = 7, col = BB.metal}) => (
  <g>
    <path d={`M -8 -20 Q -4 ${-len * 0.6} 34 ${-len} Q 14 ${-len * 0.55} 10 -20 Z`} fill={col} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    <path d={rp(-28, -28, 56, 14, 6)} fill={BB.gold} stroke={K} strokeWidth={sw * 0.8} />
    <path d={rp(-9, -16, 18, 56, 8)} fill={BB.woodSh} stroke={K} strokeWidth={sw * 0.8} />
  </g>
);
/** Recurve bow held upright (Mongol / steppe archers) — origin = hand. */
export const Bow: React.FC<{h?: number; sw?: number; draw?: number}> = ({h = 360, sw = 7, draw = 0}) => {
  const r = h / 2;
  return (
    <g>
      <line x1={-6 - draw * 70} y1={0} x2={-6} y2={-r + 14} stroke={K} strokeWidth={sw * 0.5} />
      <line x1={-6 - draw * 70} y1={0} x2={-6} y2={r - 14} stroke={K} strokeWidth={sw * 0.5} />
      <path d={`M -6 ${-r + 10} Q -20 ${-r - 14} -2 ${-r - 22} Q 70 ${-r * 0.5} 26 0 Q 70 ${r * 0.5} -2 ${r + 22} Q -20 ${r + 14} -6 ${r - 10} Q 46 ${r * 0.45} 14 0 Q 46 ${-r * 0.45} -6 ${-r + 10} Z`} fill={BB.wood} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      <path d={rp(4, -22, 24, 44, 8)} fill={BB.red} stroke={K} strokeWidth={sw * 0.7} />
    </g>
  );
};
/** Generic flag on a pole: horizontal colour bands top→bottom (merah putih = [red, white], Dutch tricolour =
 * [red, white, blue]), optional centred disc, optional label. Origin = flag top at the pole. */
export const Bendera: React.FC<{t: number; bands: string[]; disc?: string; label?: string; labelCol?: string; w?: number; h?: number; sw?: number; pole?: number; seed?: number}> = ({
  t, bands, disc, label, labelCol = K, w = 260, h = 170, sw = 7, pole = 420, seed = 0,
}) => {
  const wave = (x: number) => Math.sin(t * 4 - x / 60 + seed) * 10 * (x / w);
  const strip = (y0: number, y1: number) => {
    let d = `M 0 ${y0}`;
    for (let x = 0; x <= w; x += w / 8) d += ` L ${x} ${(y0 + wave(x)).toFixed(1)}`;
    for (let x = w; x >= 0; x -= w / 8) d += ` L ${x} ${(y1 + wave(x)).toFixed(1)}`;
    return d + ' Z';
  };
  const bh = h / bands.length;
  return (
    <g>
      <rect x={-8} y={-20} width={16} height={pole} rx={6} fill={BB.woodSh} stroke={K} strokeWidth={sw} />
      <circle cx={0} cy={-24} r={14} fill={BB.gold} stroke={K} strokeWidth={sw * 0.8} />
      <g transform="translate(8 0)">
        {bands.map((c, i) => <path key={i} d={strip(i * bh, (i + 1) * bh)} fill={c} />)}
        {disc && <circle cx={w / 2} cy={h / 2 + wave(w / 2)} r={h * 0.3} fill={disc} />}
        {label && <text x={w / 2} y={h / 2 + 22 + wave(w / 2)} textAnchor="middle" fill={labelCol} style={{fontFamily: HEAD, fontSize: 62, letterSpacing: 2}}>{label}</text>}
        <path d={strip(0, h)} fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      </g>
    </g>
  );
};

/** Chinese ocean junk (Yuan fleet): high stern, battened lug sails — origin = waterline centre, bow to the right. */
export const Junk: React.FC<{t: number; sw?: number; sail?: string; sailSh?: string; seed?: number; s?: number}> = ({t, sw = 7, sail = '#B5553A', sailSh = '#8E3F2A', seed = 1, s = 1}) => {
  const bob = Math.sin(t * 2 + seed) * 6, roll = Math.sin(t * 1.5 + seed) * 2;
  const mast = (x: number, h: number, w: number) => (
    <g>
      <rect x={x - 8} y={-110 - h} width={16} height={h} fill={BB.woodSh} stroke={K} strokeWidth={sw} />
      <path d={roundPoly([[x - w * 0.42, -150 - h * 0.9], [x + w * 0.58, -130 - h * 0.95], [x + w * 0.62, -140], [x - w * 0.46, -136]], 8)} fill={sail} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      <path d={roundPoly([[x + w * 0.2, -136 - h * 0.93], [x + w * 0.58, -130 - h * 0.95], [x + w * 0.62, -140], [x + w * 0.22, -138]], 4)} fill={sailSh} />
      {[0.18, 0.36, 0.54, 0.72].map((k) => (
        <line key={k} x1={x - w * 0.44} y1={lerp(-136, -150 - h * 0.9, k)} x2={x + w * 0.6} y2={lerp(-140, -130 - h * 0.95, k)} stroke={K} strokeWidth={sw * 0.6} />
      ))}
      <path d={roundPoly([[x - w * 0.42, -150 - h * 0.9], [x + w * 0.58, -130 - h * 0.95], [x + w * 0.62, -140], [x - w * 0.46, -136]], 8)} fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  );
  return (
    <g transform={`scale(${s}) translate(0 ${bob}) rotate(${roll})`}>
      {mast(-90, 300, 210)}
      {mast(90, 380, 250)}
      <path d="M -300 -170 L -230 -170 L -200 -110 L 230 -110 L 300 -150 Q 270 -40 200 0 L -190 0 Q -270 -50 -300 -170 Z" fill={BB.wood} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M 120 -110 L 230 -110 L 300 -150 Q 270 -40 200 0 L 150 0 Q 190 -60 120 -110 Z" fill={BB.woodSh} />
      <path d="M -280 -70 L 270 -76" stroke={BB.woodSh} strokeWidth={sw} />
      <circle cx={250} cy={-90} r={16} fill="#fff" stroke={K} strokeWidth={sw * 0.7} />
      <circle cx={254} cy={-90} r={7} fill={K} />
      <path d="M -300 -170 L -230 -170 L -200 -110 L 230 -110 L 300 -150 Q 270 -40 200 0 L -190 0 Q -270 -50 -300 -170 Z" fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  );
};
/** Round felt tent (ger) for an army camp — origin = bottom centre. */
export const Ger: React.FC<{sw?: number; col?: string; sh?: string; trim?: string; s?: number; fall?: number}> = ({sw = 7, col = '#EFE3C8', sh = '#D3C4A2', trim = BB.red, s = 1, fall = 0}) => (
  <g transform={`scale(${s}) translate(0 0) scale(1 ${1 - fall * 0.55}) skewX(${fall * 14})`}>
    <path d="M -230 0 L -230 -170 Q -200 -210 -60 -290 Q 0 -310 60 -290 Q 200 -210 230 -170 L 230 0 Z" fill={sh} />
    <path d="M -230 0 L -230 -170 Q -200 -210 -60 -290 Q 0 -310 40 -296 Q 40 -150 80 0 Z" fill={col} />
    <path d={rp(-232, -186, 464, 26, 8)} fill={trim} stroke={K} strokeWidth={sw * 0.8} />
    <path d={rp(-50, -140, 100, 140, [16, 16, 0, 0])} fill={trim} stroke={K} strokeWidth={sw} />
    <path d="M 0 -138 L 0 0" stroke={K} strokeWidth={sw * 0.6} />
    <path d="M -230 0 L -230 -170 Q -200 -210 -60 -290 Q 0 -310 60 -290 Q 200 -210 230 -170 L 230 0 Z" fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    <path d={rp(-24, -322, 48, 30, 10)} fill={BB.woodSh} stroke={K} strokeWidth={sw * 0.8} />
  </g>
);
/** Maja fruit (Aegle marmelos: round, hard, green-yellow) — origin = centre. bite 0..1 takes a bite out. */
export const Maja: React.FC<{r?: number; sw?: number; bite?: number}> = ({r = 60, sw = 7, bite = 0}) => (
  <g>
    <circle cx={0} cy={0} r={r} fill="#A9B84A" />
    <circle cx={-r * 0.12} cy={-r * 0.1} r={r * 0.84} fill="#C4CF5E" />
    {[[-0.3, -0.35], [0.25, 0.1], [-0.1, 0.4], [0.4, -0.3]].map(([x, y], i) => <circle key={i} cx={x * r} cy={y * r} r={r * 0.06} fill="#8E9C3C" />)}
    <path d={`M -${r * 0.35} -${r * 0.55} Q -${r * 0.1} -${r * 0.75} ${r * 0.15} -${r * 0.7}`} stroke="#E4EB9C" strokeWidth={sw * 1.2} fill="none" strokeLinecap="round" />
    {bite > 0 && <circle cx={r * 0.85} cy={-r * 0.35} r={r * 0.42 * bite} fill="#F2E3A0" stroke={K} strokeWidth={sw} />}
    <circle cx={0} cy={0} r={r} fill="none" stroke={K} strokeWidth={sw} />
    <path d={`M 0 -${r} q 4 -26 22 -34`} stroke={BB.woodSh} strokeWidth={sw * 1.3} fill="none" strokeLinecap="round" />
  </g>
);
/** Woodcutter's axe (held) — origin = hand. */
export const Kapak: React.FC<{sw?: number}> = ({sw = 7}) => (
  <g>
    <rect x={-9} y={-250} width={18} height={300} rx={8} fill={BB.wood} stroke={K} strokeWidth={sw} />
    <path d="M 8 -250 Q 90 -280 96 -200 Q 70 -190 8 -196 Z" fill={BB.metal} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
  </g>
);
/** Round-canopy tropical tree (forest, village) — origin = trunk foot. fallen 0..1 tips it over (a felled tree). */
export const Pohon: React.FC<{h?: number; sw?: number; col?: string; sh?: string; fallen?: number; seed?: number}> = ({h = 520, sw = 7, col = '#5FA650', sh = '#4A8A3E', fallen = 0, seed = 1}) => {
  const r = h * 0.3;
  const blobs = [[-0.55, 0.15, 0.62], [0.5, 0.1, 0.66], [0, -0.35, 0.78], [0.05, 0.25, 0.7]];
  return (
    <g transform={`rotate(${fallen * 84 * (seed % 2 ? 1 : -1)})`}>
      <path d={`M -${h * 0.05} 0 L -${h * 0.035} -${h * 0.62} L ${h * 0.035} -${h * 0.62} L ${h * 0.05} 0 Z`} fill={BB.woodSh} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      <g transform={`translate(0 -${h * 0.66})`}>
        {blobs.map(([x, y, k], i) => <circle key={i} cx={x * r} cy={y * r} r={k * r + sw / 2} fill={K} />)}
        {blobs.map(([x, y, k], i) => <circle key={'s' + i} cx={x * r} cy={y * r} r={k * r - sw / 2} fill={sh} />)}
        {blobs.map(([x, y, k], i) => <circle key={'c' + i} cx={x * r - k * r * 0.12} cy={y * r - k * r * 0.12} r={k * r * 0.78} fill={col} />)}
      </g>
    </g>
  );
};
/** Tribute chest (upeti) — origin = bottom centre. open 0..1 lifts the lid, gold inside. */
export const Peti: React.FC<{sw?: number; open?: number; s?: number}> = ({sw = 7, open = 0, s = 1}) => (
  <g transform={`scale(${s})`}>
    {open > 0 && [[-60, -150], [0, -170], [60, -150], [-30, -185], [35, -190]].map(([x, y], i) => <circle key={i} cx={x} cy={y + (1 - open) * 60} r={26} fill={BB.gold} stroke={K} strokeWidth={sw * 0.7} />)}
    <path d={rp(-140, -140, 280, 140, 14)} fill={BB.woodSh} />
    <path d={rp(-140, -140, 200, 140, [14, 0, 0, 14])} fill={BB.wood} />
    {[-90, 90].map((x) => <rect key={x} x={x - 10} y={-140} width={20} height={140} fill={BB.gold} stroke={K} strokeWidth={sw * 0.6} />)}
    <path d={rp(-140, -140, 280, 140, 14)} fill="none" stroke={K} strokeWidth={sw} />
    <g transform={`translate(0 -140) rotate(${-open * 28} -140 0)`}>
      <path d="M -146 0 Q -146 -80 0 -84 Q 146 -80 146 0 Z" fill={BB.wood} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      <path d={rp(-22, -18, 44, 30, 6)} fill={BB.gold} stroke={K} strokeWidth={sw * 0.7} />
    </g>
  </g>
);
/** Split gate (candi bentar) in red brick — East-Javanese / Majapahit-era entrance. Origin = gap centre at the ground;
 * gap = opening width. Inner faces are vertical (the "split"), outer faces step in by tiers. */
export const Gapura: React.FC<{h?: number; gap?: number; sw?: number; col?: string; sh?: string}> = ({h = 720, gap = 200, sw = 7, col = '#B5553A', sh = '#8E3F2A'}) => {
  const tiers = 6, w0 = 260;
  const half = (sd: -1 | 1) => {
    const pts: Array<[number, number]> = [];
    const x0 = sd * gap / 2;
    pts.push([x0, 0]);
    for (let i = 0; i < tiers; i++) {
      const y0 = -i * (h / tiers), y1 = -(i + 1) * (h / tiers);
      const w = w0 * (1 - i * 0.14);
      pts.push([x0 + sd * w, y0], [x0 + sd * w, y1 + (i === tiers - 1 ? 0 : 18)], [x0 + sd * w * 0.9, y1 + (i === tiers - 1 ? 0 : 18)]);
    }
    pts.push([x0 + sd * w0 * 0.12, -h - 40], [x0, -h - 40]);
    const d = 'M ' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ') + ' Z';
    return (
      <g key={sd}>
        <path d={d} fill={sd < 0 ? col : sh} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
        {Array.from({length: tiers}, (_, i) => {
          const y = -(i + 1) * (h / tiers) + 18, w = w0 * (1 - i * 0.14);
          return <line key={i} x1={x0} y1={y} x2={x0 + sd * w * 0.9} y2={y} stroke={K} strokeWidth={sw * 0.6} />;
        })}
        <path d={rp(sd < 0 ? x0 - 30 : x0, -h - 90, 30, 50, 8)} fill={sd < 0 ? col : sh} stroke={K} strokeWidth={sw} />
      </g>
    );
  };
  return <g>{half(-1)}{half(1)}<path d={rp(-gap / 2 - 40, -12, gap + 80, 24, 6)} fill={BB.stoneSh} stroke={K} strokeWidth={sw * 0.8} /></g>;
};
