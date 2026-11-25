import React from 'react';
import {lerp, useFrame} from '../shared';
import {clamp01, eio, eout, headOf, lin, measure, NGK, NUM, P, Pose, pop, popIO} from './kit';

// ANGKA props for full episodes. All flat: solid fills, hard flat shade bands, ink outlines. No gradients/blur/filters.
// World props are anchored at their bottom centre on the ground (x, y = ground) unless stated.
// Screen-space pieces (EqLane, TitleWords) centre themselves on the frame (portrait 1080 / landscape 1920 wide).
const K = NGK;
export const SHADE = {bg: '#CFC6B4', mustard: '#C49400', coral: '#C9443A', blue: '#2A5FCC', teal: '#178C80', ink: '#0B0B0E', lcd: '#DDE4D0'};
const f = (v: number) => v.toFixed(2);

// =====================================================================================================================
// Giant flat calculator. Keys are ledges the figure can stand on (key top = calcKey().top + press·10).
export const CALC = {w: 760, h: 900, r: 54, keyW: 150, keyH: 96, colGap: 26, rowGap: 22, rowTop: 260, disp: {x: -340, y: 40, w: 680, h: 180}};
export const CALC_KEYS = [['C', '±', '%', '÷'], ['7', '8', '9', '×'], ['4', '5', '6', '−'], ['1', '2', '3', '+'], ['0', '0', '.', '=']];
export type CalcKey = {id: string; x: number; y: number; w: number; h: number; mx: number; top: number};
/** Geometry of one key for a calculator standing at (cx, by). */
export const calcKey = (cx: number, by: number, id: string): CalcKey => {
  for (let r = 0; r < CALC_KEYS.length; r++) {
    const row = CALC_KEYS[r];
    const c = row.indexOf(id);
    if (c < 0) continue;
    const span = row.filter((k) => k === id).length;
    const x = cx - 339 + c * (CALC.keyW + CALC.colGap);
    const w = span * CALC.keyW + (span - 1) * CALC.colGap;
    const y = by - CALC.h + CALC.rowTop + r * (CALC.keyH + CALC.rowGap);
    return {id, x, y, w, h: CALC.keyH, mx: x + w / 2, top: y};
  }
  throw new Error(`no calculator key ${id}`);
};
const keyColors = (id: string): [string, string, string] => {
  if ('÷×−+'.includes(id)) return [K.mustard, SHADE.mustard, K.ink];
  if (id === '=') return [K.coral, SHADE.coral, K.bg];
  if ('C±%'.includes(id)) return [K.blue, SHADE.blue, K.bg];
  return [K.bg, SHADE.bg, K.ink];
};
export const Calculator: React.FC<{
  cx: number; by: number; display: string; press?: (id: string) => number; err?: number; face?: number; mood?: number; look?: P; lid?: number;
  sx?: number; sy?: number; rot?: number; dots?: number;
}> = ({cx, by, display, press = () => 0, err = 0, face = 0, mood = 0, look = [0, 0], lid = 0, sx = 1, sy = 1, rot = 0, dots = 0}) => {
  const top = by - CALC.h;
  const D = CALC.disp;
  const dy = top + D.y;
  const seen = new Set<string>();
  const ex = look[0] * 14, ey = look[1] * 10;
  return (
    <g transform={`translate(${f(cx)} ${f(by)}) rotate(${f(rot)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${f(-cx)} ${f(-by)})`}>
      <rect x={cx - CALC.w / 2} y={top} width={CALC.w} height={CALC.h} rx={CALC.r} fill={K.ink} />
      <rect x={cx - CALC.w / 2 + 22} y={by - 34} width={CALC.w - 44} height={14} rx={7} fill={SHADE.ink} />
      {/* display */}
      <rect x={cx + D.x} y={dy} width={D.w} height={D.h} rx={22} fill={err > 0.5 ? K.coral : SHADE.lcd} />
      {face < 0.5 && (
        <g opacity={1}>
          {err > 0.5 ? (
            <text x={cx} y={dy + 128} fontFamily={NUM} fontWeight={800} fontSize={112} textAnchor="middle" fill={K.bg} letterSpacing={8}
              transform={`translate(${cx} ${dy + 90}) scale(${(1 - face * 2).toFixed(3)}) translate(${-cx} ${-(dy + 90)})`}>ERROR</text>
          ) : (
            <text x={cx + 300} y={dy + 134} fontFamily={NUM} fontWeight={500} fontSize={124} textAnchor="end" fill={K.ink}>
              {display}
              {dots > 0 && <tspan fill={K.ink}>{'.'.repeat(Math.min(3, Math.floor(dots)))}</tspan>}
            </text>
          )}
        </g>
      )}
      {face > 0 && (() => {
        const s = Math.min(1, face);
        const cy = dy + 96;
        return (
          <g transform={`translate(${cx} ${cy}) scale(${s.toFixed(4)})`}>
            {[-1, 1].map((d) => (
              <g key={d}>
                <ellipse cx={d * 112 + ex} cy={ey} rx={22} ry={Math.max(3, 30 * (1 - lid))} fill={K.ink} />
                <path d={`M ${d * 158 + ex} ${-52 + ey - mood * 4} L ${d * 70 + ex} ${-40 + ey + mood * 22}`} stroke={K.ink} strokeWidth={14} strokeLinecap="round" />
              </g>
            ))}
            <path d={`M ${-34 + ex * 0.6} ${58} Q ${ex * 0.6} ${40 - mood * 8} ${34 + ex * 0.6} ${58}`} stroke={K.ink} strokeWidth={12} strokeLinecap="round" fill="none" />
          </g>
        );
      })()}
      {/* keys */}
      {CALC_KEYS.flatMap((row) => row).map((id) => {
        if (seen.has(id)) return null;
        seen.add(id);
        const k = calcKey(cx, by, id);
        const p = clamp01(press(id));
        const [fc, sc, tc] = keyColors(id);
        const faceH = CALC.keyH - 12;
        return (
          <g key={id}>
            <rect x={k.x} y={k.y + 10 * p} width={k.w} height={faceH + 12 - 10 * p} rx={18} fill={sc} />
            <rect x={k.x} y={k.y + 10 * p} width={k.w} height={faceH} rx={18} fill={fc} />
            <text x={k.mx} y={k.y + 10 * p + faceH * 0.5 + 22} fontFamily={NUM} fontWeight={700} fontSize={62} textAnchor="middle" fill={tc}>{id}</text>
          </g>
        );
      })}
    </g>
  );
};

// =====================================================================================================================
/** A counting block (bottom centre at x,y). */
export const BLOCK = 76;
export const Block: React.FC<{x: number; y: number; s?: number; rot?: number; color?: string; shade?: string}> = ({x, y, s = 1, rot = 0, color = K.mustard, shade = SHADE.mustard}) => {
  if (s <= 0.001) return null;
  const b = BLOCK;
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${s.toFixed(4)})`}>
      <rect x={-b / 2} y={-b} width={b} height={b} rx={10} fill={shade} />
      <rect x={-b / 2} y={-b} width={b} height={b - 12} rx={10} fill={color} />
      <rect x={-b / 2 + 12} y={-b + 12} width={16} height={6} rx={3} fill={K.bg} opacity={0.6} />
    </g>
  );
};

/** "( )" bracket basket (bottom centre at x,y). Inner floor at y − 14. */
export const BASKET = {w: 230, h: 170};
export const Basket: React.FC<{x: number; y: number; q?: number; color?: string; sx?: number; sy?: number}> = ({x, y, q = 1, color = K.ink, sx = 1, sy = 1}) => {
  if (q <= 0.001) return null;
  const {w, h} = BASKET;
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${(q * sx).toFixed(4)} ${(q * sy).toFixed(4)})`} stroke={color} strokeWidth={14} strokeLinecap="round" fill="none">
      <path d={`M ${-w / 2 + 6} ${-h} Q ${-w / 2 - 34} ${-h / 2} ${-w / 2 + 6} -6`} />
      <path d={`M ${w / 2 - 6} ${-h} Q ${w / 2 + 34} ${-h / 2} ${w / 2 - 6} -6`} />
      <path d={`M ${-w / 2 + 14} -7 L ${w / 2 - 14} -7`} strokeWidth={10} />
    </g>
  );
};
/** Where block i of 3 rests inside a basket at x (bottom-centre points). */
export const basketSpot = (x: number, ground: number, i: number): P => [x + [-40, 40, 0][i], ground - 12 - (i === 2 ? BLOCK : 0)];

// =====================================================================================================================
/** Revolving-door operator: a card on a pole that spins about the vertical axis; front glyph / back glyph. */
export const Door: React.FC<{x: number; y: number; ang: number; front?: string; back?: string; q?: number; sy?: number; h?: number; size?: number}> = ({
  x, y, ang, front = '÷', back = '×', q = 1, sy = 1, h = 360, size = 220,
}) => {
  if (q <= 0.001) return null;
  const c = Math.cos((ang * Math.PI) / 180);
  const w = Math.max(16, Math.abs(c) * size);
  const glyph = c >= 0 ? front : back;
  const cy = -h + 30 + size / 2;
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${q.toFixed(4)} ${(q * sy).toFixed(4)})`}>
      <rect x={-7} y={-h} width={14} height={h} rx={7} fill={K.ink} />
      <circle cx={0} cy={-h} r={14} fill={K.ink} />
      <rect x={-34} y={-14} width={68} height={14} rx={5} fill={K.ink} />
      <rect x={-w / 2} y={cy - size / 2} width={w} height={size} rx={22} fill={K.ink} />
      <rect x={-w / 2 + 9} y={cy - size / 2 + 9} width={Math.max(0, w - 18)} height={size - 18} rx={16} fill={K.paper2} />
      {Math.abs(c) > 0.08 && (
        <g transform={`translate(0 ${cy}) scale(${Math.abs(c).toFixed(4)} 1)`}>
          <text x={0} y={0.36 * size * 0.86} fontFamily={NUM} fontWeight={600} fontSize={size * 0.86} textAnchor="middle" fill={K.ink}>{glyph}</text>
        </g>
      )}
    </g>
  );
};

// =====================================================================================================================
// "× 0" press machine. Numbers go in through the funnel (top-left), get flattened on the bed in the window,
// and leave as small zeros from the slot (front, bottom-right).
export const MACH = {
  w: 460, h: 430,
  funnel: {cx: -150, top: -536, topW: 220, botW: 80, bot: -430},
  win: {x: -200, y: -400, w: 400, h: 214}, bed: -192, ramW: 300, ramH: 44, ramUp: -392, ramDown: -236,
  slot: {x: 140, y: -112, w: 70, h: 72},
  housing: {x: -40, y: -484, w: 200, h: 54},
};
export const Machine: React.FC<{
  x: number; y: number; ram: number; sx?: number; sy?: number; rot?: number; lamp?: string; chamber?: React.ReactNode; label?: boolean; q?: number; plateFlip?: number;
}> = ({x, y, ram, sx = 1, sy = 1, rot = 0, lamp = K.mustard, chamber, label = true, q = 1}) => {
  if (q <= 0.001) return null;
  const M = MACH;
  const ramTop = lerp(M.ramUp, M.ramDown, ram);
  const fu = M.funnel;
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${(sx * q).toFixed(4)} ${(sy * q).toFixed(4)})`}>
      {/* housing + rod top */}
      <rect x={M.housing.x} y={M.housing.y} width={M.housing.w} height={M.housing.h + 20} rx={12} fill={K.ink} />
      <circle cx={M.housing.x + M.housing.w - 34} cy={M.housing.y + 26} r={15} fill={lamp} />
      {/* body */}
      <rect x={-M.w / 2} y={-M.h} width={M.w} height={M.h} rx={28} fill={K.ink} />
      <rect x={-M.w / 2 + 20} y={-30} width={M.w - 40} height={14} rx={7} fill={SHADE.ink} />
      {/* window + chamber */}
      <rect x={M.win.x} y={M.win.y} width={M.win.w} height={M.win.h} rx={14} fill={K.paper2} />
      <rect x={M.win.x + 16} y={M.bed} width={M.win.w - 32} height={10} rx={4} fill={K.muted} />
      {chamber}
      {/* ram */}
      <rect x={-15} y={M.win.y} width={30} height={Math.max(0, ramTop - M.win.y)} fill={K.blue} />
      <rect x={-M.ramW / 2} y={ramTop} width={M.ramW} height={M.ramH} rx={8} fill={K.blue} />
      <rect x={-M.ramW / 2} y={ramTop + M.ramH - 10} width={M.ramW} height={10} rx={4} fill={SHADE.blue} />
      {/* funnel */}
      <polygon points={`${fu.cx - fu.topW / 2},${fu.top} ${fu.cx + fu.topW / 2},${fu.top} ${fu.cx + fu.botW / 2},${fu.bot} ${fu.cx - fu.botW / 2},${fu.bot}`} fill={K.mustard} />
      <rect x={fu.cx - fu.topW / 2 - 10} y={fu.top - 16} width={fu.topW + 20} height={18} rx={6} fill={SHADE.mustard} />
      {/* plate */}
      <rect x={-200} y={-172} width={320} height={130} rx={14} fill={K.bg} />
      {label && (
        <text x={-40} y={-66} fontFamily={NUM} fontWeight={700} fontSize={120} textAnchor="middle">
          <tspan fill={K.ink}>×</tspan>
          <tspan fill={K.coral}>0</tspan>
        </text>
      )}
      <rect x={M.slot.x} y={M.slot.y} width={M.slot.w} height={M.slot.h} rx={10} fill={SHADE.ink} />
      <rect x={M.slot.x} y={M.slot.y} width={M.slot.w} height={10} rx={4} fill={K.mustard} />
    </g>
  );
};

// =====================================================================================================================
/** Padlock with two ink straps crossing a number (lock centre at x,y). */
export const Lock: React.FC<{x: number; y: number; q?: number; sx?: number; sy?: number; strapW?: number; strapH?: number; straps?: number}> = ({
  x, y, q = 1, sx = 1, sy = 1, strapW = 220, strapH = 210, straps = 1,
}) => {
  if (q <= 0.001) return null;
  return (
    <g>
      {straps > 0 && (
        <g stroke={K.ink} strokeWidth={16} strokeLinecap="round" opacity={1}>
          <path d={`M ${f(x - strapW / 2 * straps)} ${f(y - strapH * 0.55)} L ${f(x + strapW / 2 * straps)} ${f(y + strapH * 0.2)}`} />
          <path d={`M ${f(x + strapW / 2 * straps)} ${f(y - strapH * 0.55)} L ${f(x - strapW / 2 * straps)} ${f(y + strapH * 0.2)}`} />
        </g>
      )}
      <g transform={`translate(${f(x)} ${f(y)}) scale(${(q * sx).toFixed(4)} ${(q * sy).toFixed(4)})`}>
        <path d="M -34 -40 L -34 -78 A 34 34 0 0 1 34 -78 L 34 -40" stroke={K.ink} strokeWidth={18} fill="none" />
        <rect x={-62} y={-50} width={124} height={100} rx={16} fill={K.mustard} />
        <rect x={-62} y={30} width={124} height={20} rx={8} fill={SHADE.mustard} />
        <circle cx={0} cy={-8} r={12} fill={K.ink} />
        <rect x={-5} y={-4} width={10} height={26} rx={4} fill={K.ink} />
      </g>
    </g>
  );
};

/** Rubber stamp imprint (centre x,y). q: 0→1 slam (scale 1.6 → 1). */
export const Stamp: React.FC<{x: number; y: number; lines: string[]; q: number; rot?: number; size?: number; color?: string; w?: number}> = ({
  x, y, lines, q, rot = -7, size = 92, color = K.coral, w = 860,
}) => {
  if (q <= 0.001) return null;
  const s = q < 1 ? lerp(1.55, 1, eout(q, 0, 1)) : 1;
  const h = lines.length * size * 1.08 + 70;
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${s.toFixed(4)})`} opacity={q < 0.15 ? q / 0.15 : 1}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} fill={K.bg} stroke={color} strokeWidth={16} />
      <rect x={-w / 2 + 20} y={-h / 2 + 20} width={w - 40} height={h - 40} rx={10} fill="none" stroke={color} strokeWidth={6} />
      {lines.map((l, i) => (
        <text key={i} x={0} y={-h / 2 + 35 + size * 0.92 + i * size * 1.08} fontFamily={NUM} fontWeight={900} fontSize={size} textAnchor="middle" fill={color} letterSpacing={size * 0.04}>{l}</text>
      ))}
    </g>
  );
};

/** Prohibition road sign on a post (bottom of post at x,y). */
/** `hang`: no post — the board hangs on two ropes from above (pivot = board top centre, swings with `rot`). */
export const RuleSign: React.FC<{x: number; y: number; q: number; rot?: number; text?: string[]; cross?: number; hang?: boolean}> = ({x, y, q, rot = 0, text = ['DILARANG', 'BAGI 0'], cross = 0, hang = false}) => {
  if (q <= 0.001) return null;
  return (
    <g transform={hang ? `translate(${f(x)} ${f(y - 690)}) rotate(${f(rot)}) scale(${q.toFixed(4)}) translate(0 690)` : `translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${q.toFixed(4)})`}>
      {hang ? (
        <g stroke={K.muted} strokeWidth={8}>
          <path d="M -150 -690 L -150 -3200" />
          <path d="M 150 -690 L 150 -3200" />
        </g>
      ) : <rect x={-12} y={-430} width={24} height={430} rx={8} fill={K.muted} />}
      <rect x={-260} y={-690} width={520} height={300} rx={24} fill={K.bg} stroke={K.ink} strokeWidth={12} />
      <g transform="translate(-160 -540)">
        <circle cx={0} cy={0} r={74} fill={K.bg} stroke={K.coral} strokeWidth={20} />
        <text x={0} y={22} fontFamily={NUM} fontWeight={800} fontSize={66} textAnchor="middle" fill={K.ink}>÷0</text>
        <path d="M -52 -52 L 52 52" stroke={K.coral} strokeWidth={20} strokeLinecap="butt" />
      </g>
      {text.map((s, i) => (
        <text key={i} x={90} y={-556 + i * 66} fontFamily={NUM} fontWeight={900} fontSize={i === 0 ? 46 : 60} textAnchor="middle" fill={i === 0 ? K.coral : K.ink}>{s}</text>
      ))}
      {cross > 0 && (
        <g stroke={K.ink} strokeWidth={30} strokeLinecap="round">
          <path d={`M -280 -700 L ${f(-280 + 560 * clamp01(cross * 2))} ${f(-700 + 330 * clamp01(cross * 2))}`} />
          {cross > 0.5 && <path d={`M 280 -700 L ${f(280 - 560 * clamp01(cross * 2 - 1))} ${f(-700 + 330 * clamp01(cross * 2 - 1))}`} />}
        </g>
      )}
    </g>
  );
};

/** Striped A-frame barrier (bottom centre at x,y). */
export const Barrier: React.FC<{x: number; y: number; q?: number; rot?: number; w?: number; id?: string}> = ({x, y, q = 1, rot = 0, w = 380, id = 'bar'}) => {
  if (q <= 0.001) return null;
  const bh = 74, top = -190;
  const stripes: string[] = [];
  for (let i = -2; i < w / 52 + 2; i++) {
    const x0 = -w / 2 + i * 52;
    stripes.push(`${x0},${top + bh} ${x0 + 26},${top + bh} ${x0 + 26 + bh * 0.6},${top} ${x0 + bh * 0.6},${top}`);
  }
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${q.toFixed(4)})`}>
      <defs>
        <clipPath id={`${id}-clip`}><rect x={-w / 2} y={top} width={w} height={bh} rx={10} /></clipPath>
      </defs>
      {[-1, 1].map((d) => (
        <g key={d}>
          <path d={`M ${d * (w / 2 - 50)} ${top + bh - 4} L ${d * (w / 2 - 20)} 0`} stroke={K.ink} strokeWidth={16} strokeLinecap="round" />
          <path d={`M ${d * (w / 2 - 50)} ${top + bh - 4} L ${d * (w / 2 - 92)} 0`} stroke={K.ink} strokeWidth={16} strokeLinecap="round" />
        </g>
      ))}
      <rect x={-w / 2} y={top} width={w} height={bh} rx={10} fill={K.bg} />
      <g clipPath={`url(#${id}-clip)`}>
        {stripes.map((pts, i) => <polygon key={i} points={pts} fill={K.coral} />)}
      </g>
      <rect x={-w / 2} y={top} width={w} height={bh} rx={10} fill="none" stroke={K.ink} strokeWidth={8} />
    </g>
  );
};

/** Pedestal block (bottom centre). Top surface at y − h. */
export const Pedestal: React.FC<{x: number; y: number; w?: number; h?: number}> = ({x, y, w = 230, h = 46}) => (
  <g>
    <rect x={x - w / 2} y={y - h} width={w} height={h} rx={8} fill={K.paper2} stroke={K.ink} strokeWidth={8} />
    <rect x={x - w / 2 + 4} y={y - 14} width={w - 8} height={10} fill={K.band} />
  </g>
);

/** Flat sweat drop (tip at x,y). */
export const Sweat: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) =>
  s <= 0.01 ? null : (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${s.toFixed(4)})`}>
      <path d="M 0 0 C 8 14 16 22 16 32 A 16 16 0 0 1 -16 32 C -16 22 -8 14 0 0 Z" fill={K.blue} />
    </g>
  );

/** Check mark (draw-on q). */
export const Check: React.FC<{x: number; y: number; q: number; s?: number; color?: string}> = ({x, y, q, s = 1, color = K.teal}) => {
  if (q <= 0.001) return null;
  const a = clamp01(q * 2), b = clamp01(q * 2 - 1);
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${s})`} stroke={color} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`M -40 0 L ${f(-40 + 30 * a)} ${f(30 * a)}`} />
      {b > 0 && <path d={`M -10 30 L ${f(-10 + 70 * b)} ${f(30 - 80 * b)}`} />}
    </g>
  );
};
/** Cross mark (draw-on q). */
export const Cross: React.FC<{x: number; y: number; q: number; s?: number; color?: string}> = ({x, y, q, s = 1, color = K.coral}) => {
  if (q <= 0.001) return null;
  const a = clamp01(q * 2), b = clamp01(q * 2 - 1);
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${s})`} stroke={color} strokeWidth={22} strokeLinecap="round" fill="none">
      <path d={`M -36 -36 L ${f(-36 + 72 * a)} ${f(-36 + 72 * a)}`} />
      {b > 0 && <path d={`M 36 -36 L ${f(36 - 72 * b)} ${f(-36 + 72 * b)}`} />}
    </g>
  );
};

/** A number with two dot eyes and little stick legs that walks (baseline centre at x,y). */
export const Critter: React.FC<{x: number; y: number; text: string; size?: number; color?: string; phase?: number; face?: 1 | -1; legs?: boolean; sx?: number; sy?: number; rot?: number}> = ({
  x, y, text, size = 120, color = K.ink, phase = 0, face = 1, legs = true, sx = 1, sy = 1, rot = 0,
}) => {
  const L = size * 0.26;
  const lift = legs ? 0 : 0;
  const capH = size * 0.73;
  const w = Math.max(size * 0.5, measure(text, size, 800));
  const swing = Math.sin(phase * Math.PI * 2);
  const leg = (dx: number, k: number) => {
    const a = swing * k * 26;
    const hx = dx, hy = 0;
    const r = (a * Math.PI) / 180;
    return `M ${f(hx)} ${f(hy)} L ${f(hx + Math.sin(r) * L)} ${f(hy + Math.cos(r) * L)} l ${f(face * 10)} 0`;
  };
  return (
    <g transform={`translate(${f(x)} ${f(y - (legs ? L : 0) - lift)}) rotate(${f(rot)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)})`}>
      {legs && (
        <g stroke={color} strokeWidth={Math.max(6, size * 0.06)} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d={leg(-w * 0.18, 1)} />
          <path d={leg(w * 0.18, -1)} />
        </g>
      )}
      <text x={0} y={0} fontFamily={NUM} fontWeight={800} fontSize={size} textAnchor="middle" fill={color}>{text}</text>
      {[-1, 1].map((d) => (
        <g key={d}>
          <circle cx={face * size * 0.08 + d * size * 0.09} cy={-capH * 0.62} r={size * 0.07} fill={K.bg} />
          <circle cx={face * size * 0.1 + d * size * 0.09} cy={-capH * 0.62} r={size * 0.035} fill={K.ink} />
        </g>
      ))}
    </g>
  );
};

/** Round glasses (+ optional mortarboard) for a stick-figure pose. */
export const ProfGear: React.FC<{pose: Pose; cap?: boolean; color?: string}> = ({pose, cap, color = K.ink}) => {
  const hc = headOf(pose);
  const a = pose.lean + pose.tilt;
  return (
    <g transform={`translate(${f(hc[0])} ${f(hc[1])}) rotate(${f(a)}) scale(${pose.face} 1)`}>
      <g stroke={color} strokeWidth={5} fill="none">
        <circle cx={2} cy={-2} r={10} />
        <circle cx={22} cy={-2} r={10} />
        <path d="M 12 -3 L 12 -3" />
      </g>
      {cap && (
        <g>
          <polygon points="-44,-34 4,-50 52,-34 4,-18" fill={K.ink} />
          <rect x={-18} y={-34} width={44} height={14} fill={K.ink} />
          <path d="M 4 -34 L 46 -30 L 46 -6" stroke={K.mustard} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

// =====================================================================================================================
// Ground ruler: the floor is a number line (ticks every 100 world px, a label every 500).
export const FloorRuler: React.FC<{x0: number; x1: number; ground: number; origin?: number}> = ({x0, x1, ground, origin = 540}) => {
  const out: React.ReactNode[] = [];
  for (let x = Math.floor((x0 - origin) / 100) * 100 + origin; x <= x1; x += 100) {
    const k = Math.round((x - origin) / 100);
    const major = k % 5 === 0;
    out.push(<rect key={`t${x}`} x={x - 3} y={ground + 3} width={6} height={major ? 30 : 16} fill={SHADE.bg} />);
    if (major) out.push(
      <text key={`l${x}`} x={x} y={ground + 74} fontFamily={NUM} fontWeight={700} fontSize={30} textAnchor="middle" fill={SHADE.bg}>{k / 5 < 0 ? `−${-k / 5}` : k / 5}</text>,
    );
  }
  return <g>{out}</g>;
};

// =====================================================================================================================
// Equation lane (screen space): one equation per state, tokens pop on their words, a mustard bar follows.
// Defaults: portrait y 1405 / size 112 (inside the floor band, above the caption), landscape y 140 / size 100 (above the
// world, under the top safe line), centred on the frame; `cx` moves it (e.g. into a landscape side column).
export type LaneTok = {s: string; at: number; c?: string; pill?: string; w?: number};
export type LaneState = {from: number; to: number; toks: LaneTok[]; size?: number};
export const EqLane: React.FC<{t: number; states: LaneState[]; y?: number; maxW?: number; cx?: number; size?: number}> = ({t, states, y: yIn, maxW: maxWIn, cx: cxIn, size: sizeIn}) => {
  const fr = useFrame();
  const y = yIn ?? fr.pick(1405, 140);
  const maxW = maxWIn ?? fr.pick(860, 1300);
  const CXL = cxIn ?? fr.cx;
  const baseSize = sizeIn ?? fr.pick(112, 100);
  return (
    <g>
      {states.map((st, si) => {
        if (t < st.from - 0.01 || t > st.to + 0.3) return null;
        const base = st.size ?? baseSize;
        const gap = 0.26;
        const raw = st.toks.map((k) => (k.pill ? measure(k.s, 1, 800) * 0.62 + 0.5 : measure(k.s, 1, 600)));
        const total = raw.reduce((a, b) => a + b, 0) + gap * (st.toks.length - 1);
        const size = Math.min(base, maxW / total);
        let x = CXL - (total * size) / 2;
        const out = t > st.to ? clamp01((t - st.to) / 0.24) : 0;
        const outS = out > 0 ? (out < 0.3 ? lerp(1, 1.06, out / 0.3) : lerp(1.06, 0, eio(out, 0.3, 1))) : 1;
        let head = CXL - (total * size) / 2;
        const nodes = st.toks.map((k, i) => {
          const w = raw[i] * size;
          const cx = x + w / 2;
          x += w + gap * size;
          const q = pop(t, k.at, 0.3) * outS;
          if (t >= k.at) head = Math.max(head, lerp(cx - w / 2, cx + w / 2, eout(t, k.at, k.at + 0.2)));
          if (q <= 0.001) return null;
          if (k.pill) {
            const ph = size * 0.92;
            return (
              <g key={i} transform={`translate(${f(cx)} ${f(y - size * 0.36)}) scale(${q.toFixed(4)})`}>
                <rect x={-w / 2} y={-ph / 2} width={w} height={ph} rx={ph * 0.22} fill={k.pill} />
                <text x={0} y={size * 0.62 * 0.36} fontFamily={NUM} fontWeight={800} fontSize={size * 0.62} textAnchor="middle" fill={k.c ?? K.bg} letterSpacing={2}>{k.s}</text>
              </g>
            );
          }
          return (
            <g key={i} transform={`translate(${f(cx)} ${f(y)}) scale(${q.toFixed(4)})`}>
              <text x={0} y={0} fontFamily={NUM} fontWeight={600} fontSize={size} textAnchor="middle" fill={k.c ?? K.ink}>{k.s}</text>
            </g>
          );
        });
        const left = CXL - (total * size) / 2;
        const barW = Math.max(0, head - left) * outS;
        return (
          <g key={si}>
            {barW > 1 && <rect x={left} y={y + 26} width={barW} height={10} rx={4} fill={K.mustard} />}
            {nodes}
          </g>
        );
      })}
    </g>
  );
};

// Title words (screen space HTML): each word pops on its cue; whole block pops out at `out`.
export type TitleWord = {s: string; at: number; c?: string};
export type TitleLine = {words: TitleWord[]; size: number; y: number};
export const TitleWords: React.FC<{t: number; lines: TitleLine[]; out: number; outD?: number; z?: number}> = ({t, lines, out, outD = 0.3, z = 30}) => {
  if (t > out + outD) return null;
  const k = t > out ? clamp01((t - out) / outD) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: z, pointerEvents: 'none'}}>
      {lines.map((ln, li) => (
        <div key={li} style={{position: 'absolute', left: 64, right: 64, top: ln.y - ln.size * 1.1, height: ln.size * 1.2, display: 'flex', justifyContent: 'center',
          alignItems: 'flex-end', gap: ln.size * 0.24, transform: `translateY(${(-80 * eio(k, 0, 1)).toFixed(1)}px)`, opacity: 1 - eio(k, 0.2, 1)}}>
          {ln.words.map((w, wi) => {
            const q = pop(t, w.at, 0.32);
            return (
              <span key={wi} style={{fontFamily: NUM, fontWeight: 800, fontSize: ln.size, lineHeight: 1, color: w.c ?? K.ink, letterSpacing: ln.size * 0.01,
                display: 'inline-block', transform: `scale(${q.toFixed(4)})`, transformOrigin: '50% 80%', whiteSpace: 'nowrap'}}>{w.s}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Helper for one-off pop-in/out of world props. */
export const qIO = (t: number, at: number, out?: number, d = 0.34) => popIO(t, at, out, d);
export const between = (t: number, a: number, b: number) => t >= a && t < b;
export const lin01 = lin;
