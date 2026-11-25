import React, {useMemo} from 'react';
import {lerp, rnd, useFrame} from '../shared';
import type {Frame} from '../shared';
import {Arm, blink, blobPath, breathe, Brows, clamp01, crescent, Eye, HEAD, LID, moundPath, Mood, Mouth, OUTLINE, Sweat, TUB} from './kit';
import {HalusDefs, halusIdle, SoftShadow, useHalus} from '../../lib/halus';

// TUBUH kit, part 2 — reusable cast + props for full episodes, then the sets (worlds with parallax layers), the camera
// and the look's own transitions (Dive iris/arch cutaway, LobeWipe). Everything flat: hard shading bands, 5 px ink
// outlines, no gradients / blur / filters. Origins are documented per piece. World coordinates are authored on a
// 1080×1920 sheet (world point 540/960 = the portrait screen centre); landscape reuses the same worlds (they extend far
// past the sheet) and only moves the screen centre: framed(cam, fr) — see the camera section below.

const T = TUB;
const rad = (d: number) => (d * Math.PI) / 180;

/** Extra palette for the full-episode cast (body world stays TUB). */
export const TUBX = {
  guard: '#8FD3F4', guardShade: '#6DB9E2', navy: '#2E4A8C', navyShade: '#22386B', silver: '#D9DEE8',
  oil: '#FF9A2E', oilShade: '#E87A12', oilHi: '#FFC07A', flame: '#FF5A36', flameIn: '#FFC93C', stick: '#8A5A3B',
  chili: '#E5302F', chiliShade: '#BF2024', stem: '#4FA637', stemShade: '#3B8A28',
  courier: '#FFD23F', courierShade: '#EDB21C', bag: '#A86C35',
  brain: '#F7A1B5', brainShade: '#E57F99', brainFold: '#D96A88', brainHi: '#FFC4D2',
  milk: '#FFFFFF', milkShade: '#E6E9F2', milkDeep: '#D5DAE6',
  water: '#7CCBF2', waterShade: '#5AB2E3', waterDeep: '#3E95CC', ice: '#E4F6FF',
  fire: '#E8404B', helmet: '#E8404B', helmetShade: '#C8303E',
  stone: '#6E6566', stoneShade: '#544C4E', stoneHi: '#8A8183', sambal: '#D7262B', sambalShade: '#A9171F', seed: '#FFD38A',
  tempe: '#D9A05B', tempeShade: '#B97F3E', bean: '#F3D29A',
  wood: '#C98B4E', woodShade: '#A86C35', woodDark: '#8C5528',
  palate: '#B8475D', palateRidge: '#A33D53', gum: '#E2667C', tooth: '#FFFFFF', toothShade: '#E9DDE6',
  glass: '#E8F7FF', glassShade: '#C9E8F7', cold: '#5AB2E3', hot: '#E8404B',
  door: '#FFC93C', doorShade: '#E9A52A', tunnel: '#4A1E2C', tunnelRing: '#6A2C40',
  board: '#E8404B', boardShade: '#C8303E', button: '#E8404B',
  skinFlush: ['#F2B48C', '#F5A08A', '#F28678', '#EA6A66'], skinFlushShade: ['#DE9670', '#E48272', '#DE6A62', '#D04E50'],
  epi: '#F2B48C', epiShade: '#DE9670', epiDeep: '#C97F5C',
};
const X = TUBX;

// ======================================================================= generic cute body
export type BlobbyProps = {
  id: string; t: number; x: number; y: number; r: number; seed: number; mood: Mood;
  look?: [number, number]; armL?: number; armR?: number; sx?: number; sy?: number; rot?: number;
  body: string; shade: string; hi?: string; hand?: string; shape?: 'circle' | 'blob';
  feet?: 'stub' | 'run' | 'none'; run?: number; wink?: number; lidMin?: number; mouthOpen?: number; blush?: boolean; arms?: boolean;
  back?: React.ReactNode; front?: React.ReactNode; overFace?: React.ReactNode; eyeScale?: number; armLen?: number; noBreath?: boolean;
  /** HALUS full: world y of the ground under it → soft contact shadow there (shrinks as it hops). Default: a standing
   *  character with feet gets one under its feet; false = never (floating cells). */ ground?: number | false;
};
/** Soft contact shadow for a cell at (x, y) with foot depth `foot`·r below its centre (HALUS full only). */
const CellShadow: React.FC<{x: number; y: number; r: number; foot: number; ground?: number | false; on: boolean}> = ({x, y, r, foot, ground, on}) => {
  if (!on || ground === false) return null;
  const gy = ground ?? y + r * foot;
  const k = Math.max(0.25, Math.min(1, 1 - (gy - (y + r * foot)) / (r * 3)));
  return <SoftShadow cx={x} cy={gy} rx={r * 0.9 * k} ry={r * 0.14 * k} op={0.3 * k} ink={T.ink} />;
};
/** Generic flat cell character (origin = body centre). `back` / `front` / `overFace` slots draw in local coords. */
export const Blobby: React.FC<BlobbyProps> = ({
  id, t, x, y, r, seed, mood, look = [0, 0], armL = -20, armR = -20, sx = 1, sy = 1, rot = 0, body, shade, hi, hand, shape = 'circle',
  feet = 'stub', run = 0, wink = 0, lidMin = 0, mouthOpen = 1, blush = true, arms = true, back, front, overFace, eyeScale = 1, armLen = 0.55, noBreath = false, ground,
}) => {
  const halus = useHalus('TUBUH').full; // HALUS full: idle squash + small sway, soft contact shadow
  const idle = halusIdle(t, seed, halus && !noBreath);
  const br = noBreath ? {sx: 1, sy: 1, bob: 0} : breathe(t, seed, 0.022);
  const lid = Math.max(LID[mood], blink(t, seed), lidMin);
  const er = r * 0.21 * eyeScale, ex = r * 0.31, ey = -r * 0.12;
  const outline = shape === 'blob' ? blobPath(r, 6, 0.035, t * 0.9 + seed) : '';
  const inner = shape === 'blob' ? blobPath(r * 0.9, 6, 0.035, t * 0.9 + seed) : '';
  const lw = Math.max(6, r * 0.085);
  const legs = feet === 'run'
    ? [-1, 1].map((s) => {
      const ph = run + (s > 0 ? Math.PI : 0);
      const fx = s * r * 0.22 + Math.sin(ph) * r * 0.42, fy = r * 1.18 - Math.max(0, Math.cos(ph)) * r * 0.2;
      return (
        <g key={s}>
          <path d={`M ${s * r * 0.25} ${r * 0.7} L ${fx} ${fy}`} stroke={T.ink} strokeWidth={lw} strokeLinecap="round" />
          <ellipse cx={fx + r * 0.06} cy={fy + r * 0.02} rx={r * 0.17} ry={r * 0.1} fill={shade} stroke={T.ink} strokeWidth={4} />
        </g>
      );
    })
    : feet === 'stub'
      ? [-1, 1].map((s) => <ellipse key={s} cx={s * r * 0.4} cy={r * 0.94} rx={r * 0.24} ry={r * 0.13} fill={shade} stroke={T.ink} strokeWidth={4.5} />)
      : null;
  return (
    <>
    <CellShadow x={x} y={y} r={r} foot={feet === 'run' ? 1.26 : 1.07} ground={ground === undefined && feet === 'none' ? false : ground} on={halus} />
    <g transform={`translate(${x} ${y + br.bob}) rotate(${rot + idle.head * 0.4}) scale(${sx * br.sx * idle.sx} ${sy * br.sy * idle.sy})`}>
      {back}
      {legs}
      {arms && <Arm side={-1} x={-r * 0.9} y={r * 0.16} len={r * armLen} ang={armL} w={lw} hand={hand ?? body} />}
      {arms && <Arm side={1} x={r * 0.9} y={r * 0.16} len={r * armLen} ang={armR} w={lw} hand={hand ?? body} />}
      {shape === 'circle' ? (
        <g>
          <circle r={r} fill={body} />
          <path d={crescent(r, -15, 150, 0.15)} fill={shade} />
          {hi && <path d={crescent(r, 200, 255, 0.1)} fill={hi} />}
          <circle r={r} fill="none" stroke={T.ink} strokeWidth={OUTLINE} />
        </g>
      ) : (
        <g>
          <path d={outline} fill={shade} />
          <path d={inner} fill={body} transform={`translate(${-r * 0.07} ${-r * 0.08})`} />
          {hi && <ellipse cx={-r * 0.45} cy={-r * 0.5} rx={r * 0.16} ry={r * 0.09} transform={`rotate(-35 ${-r * 0.45} ${-r * 0.5})`} fill={hi} />}
          <path d={outline} fill="none" stroke={T.ink} strokeWidth={OUTLINE} />
        </g>
      )}
      {blush && <circle cx={-r * 0.55} cy={r * 0.1} r={r * 0.1} fill={T.blush} />}
      {blush && <circle cx={r * 0.55} cy={r * 0.1} r={r * 0.1} fill={T.blush} />}
      <Eye id={`${id}l`} x={-ex} y={ey} rx={er * 0.86} ry={er} look={look} lid={lid} body={body} />
      <Eye id={`${id}r`} x={ex} y={ey} rx={er * 0.86} ry={er} look={look} lid={Math.max(lid, wink)} body={body} />
      <Brows mood={mood} ex={ex} ey={ey} er={er} />
      <Mouth mood={mood} y={r * 0.2} w={r * 0.3} open={mouthOpen} />
      {overFace}
      {front}
    </g>
    </>
  );
};

// ======================================================================= cast
/** TRPV1 — the tongue's little security guard: blue cell, navy cap with gold badge, whistle, name tag, optional megaphone. */
export const Guard: React.FC<Omit<BlobbyProps, 'body' | 'shade'> & {mega?: number; megaAng?: number}> = ({mega = 0, megaAng = -12, ...p}) => {
  const r = p.r;
  const cap = (
    <g>
      <path d={`M ${-r * 0.88} ${-r * 0.42} Q ${-r * 0.9} ${-r * 1.18} 0 ${-r * 1.2} Q ${r * 0.9} ${-r * 1.18} ${r * 0.88} ${-r * 0.42} Z`} fill={X.navy} stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      <path d={`M ${r * 0.35} ${-r * 1.1} Q ${r * 0.8} ${-r * 0.95} ${r * 0.86} ${-r * 0.5} L ${r * 0.6} ${-r * 0.5} Q ${r * 0.6} ${-r * 0.9} ${r * 0.3} ${-r * 1.08} Z`} fill={X.navyShade} />
      <path d={`M ${-r * 0.96} ${-r * 0.46} Q 0 ${-r * 0.62} ${r * 0.96} ${-r * 0.46} L ${r * 0.98} ${-r * 0.3} Q 0 ${-r * 0.46} ${-r * 0.98} ${-r * 0.3} Z`} fill={X.navyShade} stroke={T.ink} strokeWidth={4.5} strokeLinejoin="round" />
      <path d={`M ${-r * 0.7} ${-r * 0.34} Q 0 ${-r * 0.5} ${r * 0.7} ${-r * 0.34} Q ${r * 0.5} ${-r * 0.2} 0 ${-r * 0.22} Q ${-r * 0.5} ${-r * 0.2} ${-r * 0.7} ${-r * 0.34} Z`} fill={T.ink} />
      <path d={`M 0 ${-r * 1.0} L ${r * 0.16} ${-r * 0.88} L ${r * 0.11} ${-r * 0.66} L ${-r * 0.11} ${-r * 0.66} L ${-r * 0.16} ${-r * 0.88} Z`} fill={T.gold} stroke={T.ink} strokeWidth={4} strokeLinejoin="round" />
    </g>
  );
  const tag = (
    <g>
      {/* whistle on a cord + name tag */}
      <path d={`M ${-r * 0.5} ${r * 0.52} Q ${-r * 0.2} ${r * 0.86} ${r * 0.08} ${r * 0.7}`} stroke={T.ink} strokeWidth={4} fill="none" />
      <g transform={`translate(${r * 0.12} ${r * 0.7}) rotate(-12)`}>
        <rect x={-r * 0.03} y={-r * 0.08} width={r * 0.26} height={r * 0.16} rx={r * 0.07} fill={X.silver} stroke={T.ink} strokeWidth={4} />
        <circle cx={r * 0.17} cy={0} r={r * 0.04} fill={T.ink} />
      </g>
      <g transform={`translate(${-r * 0.44} ${r * 0.56}) rotate(-8)`}>
        <rect x={-r * 0.25} y={-r * 0.1} width={r * 0.5} height={r * 0.2} rx={r * 0.05} fill={T.white} stroke={T.ink} strokeWidth={3.5} />
        <text x={0} y={r * 0.065} textAnchor="middle" fill={X.navy} style={{fontFamily: HEAD, fontWeight: 800, fontSize: r * 0.15}}>TRPV1</text>
      </g>
    </g>
  );
  const megaEl = mega > 0.01 ? (
    <g transform={`translate(${r * 0.62} ${r * 0.16}) rotate(${megaAng}) scale(${mega})`}>
      <path d={`M 0 ${-r * 0.13} L ${r * 0.78} ${-r * 0.38} Q ${r * 0.86} 0 ${r * 0.78} ${r * 0.38} L 0 ${r * 0.13} Z`} fill={T.blood} stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      <path d={`M ${r * 0.3} ${-r * 0.22} L ${r * 0.44} ${-r * 0.26} L ${r * 0.44} ${r * 0.26} L ${r * 0.3} ${r * 0.22} Z`} fill={T.white} />
      <ellipse cx={r * 0.8} cy={0} rx={r * 0.08} ry={r * 0.38} fill={T.bloodShade} stroke={T.ink} strokeWidth={4.5} />
      <rect x={-r * 0.12} y={-r * 0.1} width={r * 0.16} height={r * 0.2} rx={r * 0.05} fill={T.ink} />
    </g>
  ) : null;
  return <Blobby {...p} body={X.guard} shade={X.guardShade} hi="#B8E6FB" overFace={<>{tag}{cap}</>} front={megaEl} />;
};

/** KAPSAISIN — slippery orange oil-blob with a FAKE flame hat (paper flame on a stick, on a headband). */
export const OilBlob: React.FC<Omit<BlobbyProps, 'body' | 'shade'> & {hat?: number; hatTilt?: number}> = ({hat = 1, hatTilt = 0, ...p}) => {
  const r = p.r;
  const fl = 1 + Math.sin(p.t * 6.5 + p.seed) * 0.05;
  const hatEl = hat > 0.01 ? (
    <g transform={`translate(${r * 0.05} ${-r * 0.78}) rotate(${hatTilt - 6}) scale(${hat})`}>
      <path d={`M ${-r * 0.06} ${-r * 0.1} L ${-r * 0.04} ${-r * 0.5} L ${r * 0.04} ${-r * 0.5} L ${r * 0.06} ${-r * 0.1} Z`} fill={X.stick} stroke={T.ink} strokeWidth={3.5} />
      <g transform={`translate(0 ${-r * 0.42}) scale(1 ${fl})`}>
        <path d={`M 0 ${-r * 0.78} C ${r * 0.18} ${-r * 0.5} ${r * 0.5} ${-r * 0.42} ${r * 0.42} ${-r * 0.08} C ${r * 0.38} ${r * 0.1} ${r * 0.18} ${r * 0.16} 0 ${r * 0.16} C ${-r * 0.22} ${r * 0.16} ${-r * 0.42} ${r * 0.08} ${-r * 0.44} ${-r * 0.12} C ${-r * 0.46} ${-r * 0.34} ${-r * 0.3} ${-r * 0.42} ${-r * 0.24} ${-r * 0.6} C ${-r * 0.12} ${-r * 0.42} ${-r * 0.06} ${-r * 0.52} 0 ${-r * 0.78} Z`} fill={X.flame} stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
        <path d={`M 0 ${-r * 0.4} C ${r * 0.14} ${-r * 0.24} ${r * 0.24} ${-r * 0.16} ${r * 0.2} ${-r * 0.02} C ${r * 0.16} ${r * 0.08} ${-r * 0.16} ${r * 0.08} ${-r * 0.2} ${-r * 0.04} C ${-r * 0.22} ${-r * 0.16} ${-r * 0.08} ${-r * 0.22} 0 ${-r * 0.4} Z`} fill={X.flameIn} />
      </g>
      <path d={`M ${-r * 0.6} ${r * 0.02} Q 0 ${-r * 0.14} ${r * 0.6} ${r * 0.02} L ${r * 0.62} ${r * 0.14} Q 0 ${-r * 0.02} ${-r * 0.62} ${r * 0.14} Z`} fill={T.bloodShade} stroke={T.ink} strokeWidth={4} strokeLinejoin="round" />
    </g>
  ) : null;
  return <Blobby {...p} body={X.oil} shade={X.oilShade} hi={X.oilHi} shape="blob" feet="none" overFace={hatEl} />;
};

/** CABAI — a red chilli character lying on its side, tip to the left. Origin = fat part centre. */
export const Chili: React.FC<{id: string; t: number; x: number; y: number; r: number; mood: Mood; look?: [number, number]; sx?: number; sy?: number; rot?: number}> = ({
  id, t, x, y, r, mood, look = [0, 0], sx = 1, sy = 1, rot = 0,
}) => {
  const br = breathe(t, 7, 0.015);
  const lid = Math.max(LID[mood], blink(t, 7));
  const body = `M ${r * 1.1} ${-r * 0.62} C ${r * 0.2} ${-r * 0.82} ${-r * 0.9} ${-r * 0.55} ${-r * 1.85} ${r * 0.42} C ${-r * 0.8} ${r * 0.22} ${r * 0.3} ${r * 0.7} ${r * 1.1} ${r * 0.55} Q ${r * 1.4} 0 ${r * 1.1} ${-r * 0.62} Z`;
  const shade = `M ${-r * 1.85} ${r * 0.42} C ${-r * 0.8} ${r * 0.22} ${r * 0.3} ${r * 0.7} ${r * 1.1} ${r * 0.55} Q ${r * 1.28} ${r * 0.3} ${r * 1.25} ${r * 0.05} C ${r * 0.6} ${r * 0.4} ${-r * 0.6} ${r * 0.1} ${-r * 1.85} ${r * 0.42} Z`;
  const er = r * 0.17, ex = r * 0.22, ey = -r * 0.18;
  return (
    <g transform={`translate(${x} ${y + br.bob}) rotate(${rot}) scale(${sx * br.sx} ${sy * br.sy})`}>
      <path d={body} fill={X.chili} />
      <path d={shade} fill={X.chiliShade} />
      <path d={`M ${-r * 0.2} ${-r * 0.52} Q ${r * 0.3} ${-r * 0.66} ${r * 0.7} ${-r * 0.6}`} stroke="#FF7F7A" strokeWidth={r * 0.08} fill="none" strokeLinecap="round" />
      <path d={body} fill="none" stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      {/* stem cap */}
      <path d={`M ${r * 1.02} ${-r * 0.7} Q ${r * 1.5} ${-r * 0.55} ${r * 1.5} 0 Q ${r * 1.5} ${r * 0.55} ${r * 1.02} ${r * 0.62} Q ${r * 1.2} 0 ${r * 1.02} ${-r * 0.7} Z`} fill={X.stem} stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      <path d={`M ${r * 1.45} 0 Q ${r * 1.8} ${-r * 0.05} ${r * 1.9} ${-r * 0.45}`} stroke={T.ink} strokeWidth={r * 0.2} fill="none" strokeLinecap="round" />
      <path d={`M ${r * 1.45} 0 Q ${r * 1.8} ${-r * 0.05} ${r * 1.9} ${-r * 0.45}`} stroke={X.stem} strokeWidth={r * 0.11} fill="none" strokeLinecap="round" />
      <circle cx={-r * 0.12} cy={r * 0.06} r={r * 0.08} fill="#FF8C96" />
      <circle cx={r * 0.6} cy={r * 0.04} r={r * 0.08} fill="#FF8C96" />
      <Eye id={`${id}l`} x={-ex + r * 0.26} y={ey} rx={er * 0.86} ry={er} look={look} lid={lid} body={X.chili} />
      <Eye id={`${id}r`} x={ex + r * 0.26} y={ey} rx={er * 0.86} ry={er} look={look} lid={lid} body={X.chili} />
      <g transform={`translate(${r * 0.26} 0)`}>
        <Brows mood={mood} ex={ex} ey={ey} er={er} />
        <Mouth mood={mood} y={r * 0.14} w={r * 0.24} />
      </g>
    </g>
  );
};

/** SINYAL — the courier: yellow cell, red cap with a bolt, satchel; runs (run = phase) and can hold up a card. */
export const Courier: React.FC<Omit<BlobbyProps, 'body' | 'shade'>> = (p) => {
  const r = p.r;
  const cap = (
    <g>
      <path d={`M ${-r * 0.86} ${-r * 0.4} Q ${-r * 0.86} ${-r * 1.14} 0 ${-r * 1.16} Q ${r * 0.86} ${-r * 1.14} ${r * 0.86} ${-r * 0.4} Z`} fill={T.blood} stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      <path d={`M ${r * 0.5} ${-r * 0.5} Q ${r * 1.3} ${-r * 0.6} ${r * 1.36} ${-r * 0.36} Q ${r * 0.9} ${-r * 0.26} ${r * 0.5} ${-r * 0.36} Z`} fill={T.bloodShade} stroke={T.ink} strokeWidth={4.5} strokeLinejoin="round" />
      <path d={`M ${r * 0.06} ${-r * 1.02} L ${-r * 0.16} ${-r * 0.7} L ${0} ${-r * 0.7} L ${-r * 0.08} ${-r * 0.46} L ${r * 0.2} ${-r * 0.8} L ${r * 0.04} ${-r * 0.8} Z`} fill={T.gold} stroke={T.ink} strokeWidth={3.5} strokeLinejoin="round" />
    </g>
  );
  const bag = (
    <g>
      <path d={`M ${-r * 0.7} ${-r * 0.5} L ${r * 0.62} ${r * 0.56}`} stroke={T.ink} strokeWidth={r * 0.16} strokeLinecap="round" />
      <path d={`M ${-r * 0.7} ${-r * 0.5} L ${r * 0.62} ${r * 0.56}`} stroke={X.bag} strokeWidth={r * 0.09} strokeLinecap="round" />
      <rect x={r * 0.4} y={r * 0.42} width={r * 0.52} height={r * 0.4} rx={r * 0.08} fill={X.bag} stroke={T.ink} strokeWidth={4.5} />
      <path d={`M ${r * 0.4} ${r * 0.56} L ${r * 0.92} ${r * 0.56}`} stroke={T.ink} strokeWidth={4} />
    </g>
  );
  return <Blobby {...p} body={X.courier} shade={X.courierShade} hi="#FFE680" overFace={<>{bag}{cap}</>} />;
};

/** KASEIN — round white milk-protein character with a cream swirl on top. */
export const Casein: React.FC<Omit<BlobbyProps, 'body' | 'shade'>> = (p) => {
  const r = p.r;
  const swirl = (
    <path d={`M ${-r * 0.1} ${-r * 0.96} Q ${-r * 0.05} ${-r * 1.35} ${r * 0.25} ${-r * 1.3} Q ${r * 0.42} ${-r * 1.2} ${r * 0.24} ${-r * 1.08} Q ${r * 0.12} ${-r * 1.02} ${r * 0.16} ${-r * 0.94}`} fill={T.white} stroke={T.ink} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round" />
  );
  return <Blobby {...p} body={X.milk} shade={X.milkShade} hand={X.milk} back={swirl} />;
};

/** Sweat-gland firefighter: little light-blue cell with a red helmet; optional hose nozzle aimed at `aim` degrees. */
export const Firefighter: React.FC<Omit<BlobbyProps, 'body' | 'shade'> & {nozzle?: number; aim?: number}> = ({nozzle = 0, aim = -60, ...p}) => {
  const r = p.r;
  const helmet = (
    <g>
      <path d={`M ${-r * 1.22} ${-r * 0.42} Q ${-r * 1.2} ${-r * 0.56} ${-r * 0.86} ${-r * 0.56} L ${r * 0.86} ${-r * 0.56} Q ${r * 1.2} ${-r * 0.56} ${r * 1.22} ${-r * 0.42} Q 0 ${-r * 0.3} ${-r * 1.22} ${-r * 0.42} Z`} fill={X.helmetShade} stroke={T.ink} strokeWidth={4.5} strokeLinejoin="round" />
      <path d={`M ${-r * 0.82} ${-r * 0.52} Q ${-r * 0.86} ${-r * 1.24} 0 ${-r * 1.26} Q ${r * 0.86} ${-r * 1.24} ${r * 0.82} ${-r * 0.52} Z`} fill={X.helmet} stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      <path d={`M 0 ${-r * 1.24} L 0 ${-r * 0.56}`} stroke={X.helmetShade} strokeWidth={r * 0.12} />
      <path d={`M ${-r * 0.2} ${-r * 0.96} L ${r * 0.2} ${-r * 0.96} L ${r * 0.16} ${-r * 0.62} L 0 ${-r * 0.54} L ${-r * 0.16} ${-r * 0.62} Z`} fill={T.gold} stroke={T.ink} strokeWidth={3.5} strokeLinejoin="round" />
    </g>
  );
  const noz = nozzle > 0.01 ? (
    <g transform={`translate(${r * 0.7} ${r * 0.1}) rotate(${aim}) scale(${nozzle})`}>
      <rect x={0} y={-r * 0.14} width={r * 0.7} height={r * 0.28} rx={r * 0.08} fill={X.silver} stroke={T.ink} strokeWidth={4} />
      <rect x={r * 0.62} y={-r * 0.2} width={r * 0.18} height={r * 0.4} rx={r * 0.06} fill={T.gold} stroke={T.ink} strokeWidth={4} />
    </g>
  ) : null;
  return <Blobby {...p} body={T.sweat} shade="#93D0EE" overFace={helmet} front={noz} />;
};

/** OTAK — cute brain character (bumpy pink blob with folds, eyes, arms, stub feet). Origin = centre; size ~2.5r × 2r. */
export const BrainChar: React.FC<Omit<BlobbyProps, 'body' | 'shade' | 'shape'>> = (p) => {
  const {r} = p;
  const lid = Math.max(LID[p.mood], blink(p.t, p.seed), p.lidMin ?? 0);
  const br = breathe(p.t, p.seed, 0.018);
  const halus = useHalus('TUBUH').full;
  const idle = halusIdle(p.t, p.seed, halus);
  const out = blobPath(r, 13, 0.035, 0.6);
  const inner = blobPath(r * 0.9, 13, 0.035, 0.6);
  const er = r * 0.2, ex = r * 0.32, ey = r * 0.05;
  const lw = Math.max(7, r * 0.06);
  const folds = [
    `M ${-r * 0.82} ${-r * 0.25} q ${r * 0.12} ${-r * 0.24} ${r * 0.3} ${-r * 0.16} q ${r * 0.12} ${-r * 0.24} ${r * 0.32} ${-r * 0.14}`,
    `M ${r * 0.18} ${-r * 0.62} q ${r * 0.14} ${-r * 0.16} ${r * 0.32} ${-r * 0.06} q ${r * 0.16} ${r * 0.02} ${r * 0.26} ${r * 0.16}`,
    `M ${-r * 0.5} ${-r * 0.7} q ${r * 0.1} ${r * 0.14} ${r * 0.28} ${r * 0.08}`,
    `M ${r * 0.52} ${-r * 0.2} q ${r * 0.16} ${-r * 0.02} ${r * 0.3} ${r * 0.14}`,
    `M ${-r * 0.9} ${r * 0.32} q ${r * 0.14} ${-r * 0.1} ${r * 0.26} ${r * 0.04}`,
    `M ${r * 0.66} ${r * 0.42} q ${r * 0.1} ${-r * 0.16} ${r * 0.26} ${-r * 0.12}`,
  ];
  return (
    <>
    <CellShadow x={p.x} y={p.y} r={r * 1.25} foot={0.92 / 1.25} ground={p.ground} on={halus} />
    <g transform={`translate(${p.x} ${p.y + br.bob}) rotate(${(p.rot ?? 0) + idle.head * 0.4}) scale(${(p.sx ?? 1) * br.sx * idle.sx} ${(p.sy ?? 1) * br.sy * idle.sy})`}>
      {p.back}
      {[-1, 1].map((s) => <ellipse key={s} cx={s * r * 0.42} cy={r * 0.8} rx={r * 0.22} ry={r * 0.12} fill={X.brainShade} stroke={T.ink} strokeWidth={4.5} />)}
      {(p.arms ?? true) && <Arm side={-1} x={-r * 1.05} y={r * 0.2} len={r * 0.5} ang={p.armL ?? -20} w={lw} hand={X.brain} />}
      {(p.arms ?? true) && <Arm side={1} x={r * 1.05} y={r * 0.2} len={r * 0.5} ang={p.armR ?? -20} w={lw} hand={X.brain} />}
      <g transform="scale(1.22 0.92)">
        <path d={out} fill={X.brainShade} />
        <path d={inner} fill={X.brain} transform={`translate(${-r * 0.06} ${-r * 0.08})`} />
        {folds.map((d, i) => <path key={i} d={d} stroke={X.brainFold} strokeWidth={r * 0.07} fill="none" strokeLinecap="round" />)}
        <path d={`M 0 ${-r * 0.98} Q ${-r * 0.06} ${-r * 0.72} 0 ${-r * 0.5}`} stroke={X.brainFold} strokeWidth={r * 0.07} fill="none" strokeLinecap="round" />
        <ellipse cx={-r * 0.5} cy={-r * 0.56} rx={r * 0.14} ry={r * 0.07} transform={`rotate(-25 ${-r * 0.5} ${-r * 0.56})`} fill={X.brainHi} />
        <path d={out} fill="none" stroke={T.ink} strokeWidth={OUTLINE} />
      </g>
      <circle cx={-r * 0.62} cy={r * 0.28} r={r * 0.1} fill={T.blush} />
      <circle cx={r * 0.62} cy={r * 0.28} r={r * 0.1} fill={T.blush} />
      <Eye id={`${p.id}l`} x={-ex} y={ey} rx={er * 0.86} ry={er} look={p.look ?? [0, 0]} lid={lid} body={X.brain} />
      <Eye id={`${p.id}r`} x={ex} y={ey} rx={er * 0.86} ry={er} look={p.look ?? [0, 0]} lid={Math.max(lid, p.wink ?? 0)} body={X.brain} />
      <Brows mood={p.mood} ex={ex} ey={ey} er={er} />
      <Mouth mood={p.mood} y={r * 0.34} w={r * 0.26} open={p.mouthOpen ?? 1} />
      {p.overFace}
      {p.front}
    </g>
    </>
  );
};

// ======================================================================= outside person (eats, flushes, drinks)
export type EaterMouth = 'closed' | 'chew' | 'O' | 'fire' | 'smile' | 'grin';
export type EaterProps = {
  t: number; r: number; mood: Mood; look?: [number, number]; flush?: number; mouth?: EaterMouth; open?: number;
  sweat?: number; drip?: number; flames?: number; steam?: number;
  handR: [number, number]; handL: [number, number]; itemR?: React.ReactNode; itemL?: React.ReactNode; itemLFront?: boolean;
};
/** Outside cartoon person (head centre = origin, head radius r), with two posable arms holding items. */
export const Eater: React.FC<EaterProps> = ({t, r, mood, look = [0, 0], flush = 0, mouth = 'closed', open = 1, sweat = 0, drip = 0, flames = 0, steam = 0, handR, handL, itemR, itemL}) => {
  const br = breathe(t, 5, 0.008);
  const lid = Math.max(LID[mood], blink(t, 5));
  const lv = Math.max(0, Math.min(3, Math.floor(flush + 1e-6)));
  const skin = X.skinFlush[lv], skinS = X.skinFlushShade[lv];
  const er = r * 0.15, ex = r * 0.34, ey = r * 0.06;
  const my = r * 0.52;
  const arm = (side: -1 | 1, hand: [number, number], item?: React.ReactNode) => {
    const sx0 = side * r * 1.02, sy0 = r * 1.36;
    const ex1 = (sx0 + hand[0]) / 2 + side * r * 0.42, ey1 = Math.max(sy0, hand[1]) + r * 0.45;
    const d = `M ${sx0} ${sy0} Q ${ex1} ${ey1} ${hand[0]} ${hand[1]}`;
    return (
      <g>
        <path d={d} stroke={T.ink} strokeWidth={r * 0.34 + 10} fill="none" strokeLinecap="round" />
        <path d={d} stroke={T.shirt} strokeWidth={r * 0.34} fill="none" strokeLinecap="round" />
        {item && <g transform={`translate(${hand[0]} ${hand[1]})`}>{item}</g>}
        <circle cx={hand[0]} cy={hand[1]} r={r * 0.15} fill={skin} stroke={T.ink} strokeWidth={OUTLINE} />
      </g>
    );
  };
  const mouthEl = (() => {
    const w = r * 0.22;
    if (mouth === 'O') {
      const rr = r * 0.13 * open;
      return <g><ellipse cx={0} cy={my} rx={rr} ry={rr * 1.05} fill={T.ink} /><ellipse cx={0} cy={my + rr * 0.55} rx={rr * 0.6} ry={rr * 0.3} fill={T.blush} /></g>;
    }
    if (mouth === 'fire') {
      const h = r * 0.3 * open, ww = r * 0.27;
      return (
        <g>
          <path d={`M ${-ww} ${my - h * 0.35} Q 0 ${my - h * 0.55} ${ww} ${my - h * 0.35} Q ${ww * 1.05} ${my + h * 0.7} 0 ${my + h * 0.72} Q ${-ww * 1.05} ${my + h * 0.7} ${-ww} ${my - h * 0.35} Z`} fill={T.ink} stroke={T.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M ${-ww * 0.8} ${my - h * 0.36} Q 0 ${my - h * 0.52} ${ww * 0.8} ${my - h * 0.36} L ${ww * 0.74} ${my - h * 0.16} Q 0 ${my - h * 0.28} ${-ww * 0.74} ${my - h * 0.16} Z`} fill={T.white} />
          <ellipse cx={0} cy={my + h * 0.48} rx={ww * 0.55} ry={h * 0.2} fill="#FF6F78" />
        </g>
      );
    }
    if (mouth === 'chew') {
      const k = 0.5 + 0.5 * Math.sin(t * 13);
      return <ellipse cx={0} cy={my} rx={w * 0.55} ry={Math.max(3, w * 0.08 + w * 0.16 * k)} fill={T.ink} />;
    }
    if (mouth === 'grin') return <Mouth mood="cheer" y={my - r * 0.02} w={r * 0.32} open={open} />;
    if (mouth === 'smile') return <path d={`M ${-w * 0.7} ${my - w * 0.1} Q 0 ${my + w * 0.55} ${w * 0.7} ${my - w * 0.1}`} stroke={T.ink} strokeWidth={7} fill="none" strokeLinecap="round" />;
    return <Mouth mood={mood === 'shock' ? 'curious' : mood} y={my} w={w} />;
  })();
  const fl = flames > 0.01 ? ([[-1, 0.4, -0.08, -38], [-1, 0.36, 0.13, -72], [1, 0.4, -0.08, 38], [1, 0.36, 0.13, 72], [-1, 0.22, -0.2, -14], [1, 0.22, -0.2, 14]] as const).map(([sd, dx, dy, rot], i) => {
    const s = flames * (0.88 + 0.12 * Math.sin(t * 7 + i * 1.7)) * (i > 3 ? 0.7 : 1);
    return (
      <g key={i} transform={`translate(${sd * dx * r} ${my + dy * r}) rotate(${rot}) scale(${s * r * 0.0068})`}>
        <path d="M 0 -30 C 10 -16 17 -9 14 5 C 12 14 5 17 0 17 C -7 17 -14 13 -14 4 C -14 -7 -6 -12 0 -30 Z" fill={X.flame} stroke={T.ink} strokeWidth={4.5} strokeLinejoin="round" />
        <path d="M 0 -7 C 5 0 8 4 6 9 C 4 13 -4 13 -6 9 C -7 5 -4 0 0 -7 Z" fill={X.flameIn} />
      </g>
    );
  }) : null;
  const wisps = steam > 0.01 ? [-0.5, 0, 0.5].map((k, i) => {
    const ph = ((t * 0.9 + i * 0.33) % 1);
    const yy = -r * 1.1 - ph * r * 0.75;
    const s = steam * (1 - ph * 0.55);
    return (
      <path key={i} d={`M 0 0 q ${r * 0.1} ${-r * 0.1} 0 ${-r * 0.2} q ${-r * 0.1} ${-r * 0.1} 0 ${-r * 0.2}`} transform={`translate(${k * r + Math.sin(t * 2 + i) * r * 0.04} ${yy}) scale(${s})`}
        stroke={T.white} strokeWidth={r * 0.09} fill="none" strokeLinecap="round" opacity={Math.min(1, ph / 0.15, (1 - ph) / 0.2)} />
    );
  }) : null;
  return (
    <g transform={`translate(0 ${br.bob * 0.6})`}>
      {wisps}
      {/* torso */}
      <path d={`M ${-r * 1.55} ${r * 3.4} Q ${-r * 1.5} ${r * 1.15} ${-r * 0.5} ${r * 1.02} L ${r * 0.5} ${r * 1.02} Q ${r * 1.5} ${r * 1.15} ${r * 1.55} ${r * 3.4} Z`} fill={T.shirt} stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      <path d={`M ${r * 0.9} ${r * 1.25} Q ${r * 1.4} ${r * 1.4} ${r * 1.5} ${r * 3.4} L ${r * 1.2} ${r * 3.4} Q ${r * 1.15} ${r * 1.6} ${r * 0.85} ${r * 1.3} Z`} fill={T.shirtShade} />
      <rect x={-r * 0.24} y={r * 0.8} width={r * 0.48} height={r * 0.32} fill={skinS} stroke={T.ink} strokeWidth={OUTLINE} />
      <path d={`M ${-r * 0.42} ${r * 1.04} Q 0 ${r * 1.38} ${r * 0.42} ${r * 1.04}`} fill={skin} stroke={T.ink} strokeWidth={OUTLINE} />
      {[-1, 1].map((s) => <ellipse key={s} cx={s * r * 0.98} cy={r * 0.12} rx={r * 0.16} ry={r * 0.22} fill={skin} stroke={T.ink} strokeWidth={OUTLINE} />)}
      <circle r={r} fill={skin} />
      <path d={crescent(r, -20, 140, 0.12)} fill={skinS} />
      <circle r={r} fill="none" stroke={T.ink} strokeWidth={OUTLINE} />
      <path d={`M ${-r * 0.98} ${-r * 0.05} Q ${-r * 1.08} ${-r * 1.05} ${-r * 0.05} ${-r * 1.08} Q ${r * 0.95} ${-r * 1.1} ${r * 1.0} ${-r * 0.12} Q ${r * 0.8} ${-r * 0.52} ${r * 0.3} ${-r * 0.56} Q ${r * 0.12} ${-r * 0.4} ${-r * 0.1} ${-r * 0.58} Q ${-r * 0.6} ${-r * 0.55} ${-r * 0.98} ${-r * 0.05} Z`} fill={T.hair} stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      {/* cheeks: posterized flush rings */}
      {[-1, 1].map((s) => (
        <g key={s}>
          {lv >= 2 && <circle cx={s * r * 0.5} cy={r * 0.34} r={r * 0.2} fill="#F26070" />}
          <circle cx={s * r * 0.5} cy={r * 0.34} r={r * (lv >= 1 ? 0.14 : 0.11)} fill={lv >= 1 ? '#F0485A' : T.blush} />
        </g>
      ))}
      <Eye id="eatl" x={-ex} y={ey} rx={er * 0.86} ry={er} look={look} lid={lid} body={skin} />
      <Eye id="eatr" x={ex} y={ey} rx={er * 0.86} ry={er} look={look} lid={lid} body={skin} />
      <Brows mood={mood} ex={ex} ey={ey} er={er} />
      <path d={`M ${-r * 0.04} ${r * 0.2} q ${r * 0.08} ${r * 0.1} 0 ${r * 0.16}`} stroke={skinS} strokeWidth={6} fill="none" strokeLinecap="round" />
      {drip > 0.01 && (
        <path d={`M ${-r * 0.05} ${r * 0.36} Q ${r * 0.04} ${r * 0.38 + r * 0.22 * drip} 0 ${r * 0.42 + r * 0.3 * drip} Q ${-r * 0.1} ${r * 0.42 + r * 0.3 * drip} ${-r * 0.1} ${r * 0.36 + r * 0.2 * drip} Z`}
          fill={T.sweat} stroke={T.ink} strokeWidth={4.5} strokeLinejoin="round" />
      )}
      {mouthEl}
      {fl}
      {[[-0.86, -0.2, 0], [0.84, -0.3, 0.5]].map(([sx0, sy0, off], i) => {
        const ph = (t * 0.55 + off) % 1;
        const k = Math.min(1, ph * 6) * Math.min(1, (1 - ph) * 5);
        return <Sweat key={i} x={sx0 * r} y={sy0 * r + ph * r * 0.3} s={sweat * k * (i ? 0.85 : 1)} />;
      })}
      {arm(-1, handL, itemL)}
      {arm(1, handR, itemR)}
    </g>
  );
};

// ======================================================================= props
/** Cobek (stone mortar) with sambal + ulekan. Origin = bottom centre, width ~2.2s·100. */
export const Cobek: React.FC<{x: number; y: number; s?: number; dip?: number}> = ({x, y, s = 1, dip = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {useHalus('TUBUH').full && <SoftShadow cx={10} cy={4} rx={190} ry={22} op={0.3} ink={T.ink} />}
    <ellipse cx={0} cy={-4} rx={150} ry={20} fill={X.stoneShade} />
    <path d="M -165 -92 Q -150 6 0 6 Q 150 6 165 -92 Z" fill={X.stone} stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
    <path d="M 90 -20 Q 140 -40 160 -88 L 165 -92 Q 152 0 30 4 Q 70 -6 90 -20 Z" fill={X.stoneShade} />
    <ellipse cx={0} cy={-92} rx={165} ry={34} fill={X.stoneHi} stroke={T.ink} strokeWidth={OUTLINE} />
    <ellipse cx={0} cy={-88} rx={138} ry={24} fill={X.sambalShade} />
    <ellipse cx={-6} cy={-92} rx={126} ry={19} fill={X.sambal} />
    {[[-80, -94], [-40, -88], [10, -97], [55, -90], [92, -95], [-100, -88], [30, -86]].map(([a, b], i) => <ellipse key={i} cx={a} cy={b} rx={6} ry={4} fill={X.seed} />)}
    {[[-60, -100, 20], [70, -99, -15]].map(([a, b, r], i) => <path key={i} d={`M ${a - 16} ${b} q 16 -10 32 0`} transform={`rotate(${r} ${a} ${b})`} stroke="#3B8A28" strokeWidth={7} fill="none" strokeLinecap="round" />)}
    {dip > 0 && <ellipse cx={-30} cy={-92} rx={36 * dip} ry={8 * dip} fill={X.sambalShade} />}
    {/* ulekan (pestle) */}
    <g transform="translate(-100 -118) rotate(-36)">
      <rect x={-26} y={-120} width={52} height={150} rx={26} fill={X.stone} stroke={T.ink} strokeWidth={OUTLINE} />
      <rect x={6} y={-112} width={14} height={130} rx={7} fill={X.stoneShade} />
      <ellipse cx={0} cy={22} rx={26} ry={12} fill={X.sambal} />
    </g>
  </g>
);

/** Fried tempe slice held by its right end (origin = grip point). bitten: 0..1 removes the left corner. */
export const Tempe: React.FC<{rot?: number; bitten?: boolean; sauce?: number; s?: number}> = ({rot = 0, bitten = false, sauce = 0, s = 1}) => {
  const d = bitten
    ? 'M 20 -34 L -96 -34 Q -112 -30 -110 -14 A 16 16 0 0 0 -112 4 A 15 15 0 0 0 -104 26 Q -100 34 -90 34 L 20 34 Q 30 34 30 24 L 30 -24 Q 30 -34 20 -34 Z'
    : 'M 20 -34 L -130 -34 Q -140 -34 -140 -24 L -140 24 Q -140 34 -130 34 L 20 34 Q 30 34 30 24 L 30 -24 Q 30 -34 20 -34 Z';
  return (
    <g transform={`rotate(${rot}) scale(${s})`}>
      <path d={d} fill={X.tempe} stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      <path d={bitten ? 'M -96 22 L 20 22 L 20 34 L -90 34 Z' : 'M -134 22 L 20 22 L 20 34 L -130 34 Z'} fill={X.tempeShade} />
      {[[-80, -14], [-50, 6], [-20, -16], [0, 8], [-110, 6], [-64, -18], [-30, 12]].filter(([a]) => !bitten || a > -95).map(([a, b], i) => <ellipse key={i} cx={a} cy={b} rx={8} ry={6} fill={X.bean} />)}
      {sauce > 0.01 && !bitten && <path d="M -140 -26 Q -150 0 -140 26 L -112 26 Q -104 12 -114 0 Q -104 -12 -112 -26 Z" fill={X.sambal} stroke={T.ink} strokeWidth={4} strokeLinejoin="round" transform={`translate(-150 0) scale(${sauce} 1) translate(150 0)`} />}
      <path d={d} fill="none" stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
    </g>
  );
};

/** Flat thermometer. Origin = bulb centre. level/threshold 0..1 of the tube; h = tube height. */
export const Thermo: React.FC<{x: number; y: number; level: number; color: string; h?: number; w?: number; mark?: number; q?: number; rot?: number}> = ({x, y, level, color, h = 520, w = 64, mark, q = 1, rot = 0}) => {
  if (q <= 0.01) return null;
  const br = w * 0.95;
  const top = -h, base = -br * 0.6;
  const ly = lerp0(base, top + w * 0.5, level);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${q})`}>
      <path d={`M ${-w / 2} ${base} L ${-w / 2} ${top + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${w / 2} ${top + w / 2} L ${w / 2} ${base}`} fill={T.white} stroke={T.ink} strokeWidth={OUTLINE + 3} />
      <circle r={br} fill={T.white} stroke={T.ink} strokeWidth={OUTLINE + 3} />
      <rect x={-w / 2 + 2} y={base - 6} width={w - 4} height={12} fill={T.white} />
      <rect x={-w * 0.22} y={ly} width={w * 0.44} height={base - ly + 4} rx={w * 0.2} fill={color} />
      <circle r={br * 0.72} fill={color} />
      <circle cx={-br * 0.25} cy={-br * 0.25} r={br * 0.18} fill={T.white} />
      {Array.from({length: 9}).map((_, i) => {
        const yy = lerp0(base - 20, top + w, i / 8);
        return <line key={i} x1={w / 2 - 4} y1={yy} x2={w / 2 - (i % 2 ? 14 : 22)} y2={yy} stroke={T.ink} strokeWidth={4} strokeLinecap="round" />;
      })}
      {mark !== undefined && (
        <g>
          <line x1={-w * 0.9} y1={lerp0(base, top + w * 0.5, mark)} x2={w * 0.9} y2={lerp0(base, top + w * 0.5, mark)} stroke={T.ink} strokeWidth={14} strokeLinecap="round" />
          <line x1={-w * 0.9} y1={lerp0(base, top + w * 0.5, mark)} x2={w * 0.9} y2={lerp0(base, top + w * 0.5, mark)} stroke={T.gold} strokeWidth={6} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};
const lerp0 = (a: number, b: number, k: number) => a + (b - a) * k;
/** Thermometer bar y (relative to bulb) for a level, matching Thermo geometry. */
export const thermoY = (level: number, h = 520, w = 64) => lerp0(-w * 0.95 * 0.6, -h + w * 0.5, level);

/** Cartoon flame icon (origin = centre, ~size tall). */
export const FireIcon: React.FC<{x: number; y: number; size: number; q: number; t?: number}> = ({x, y, size, q, t = 0}) =>
  q <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${(q * size) / 100} ${(q * size * (1 + Math.sin(t * 6) * 0.03)) / 100})`}>
      <path d="M 0 -52 C 14 -30 40 -24 36 6 C 33 30 18 44 0 44 C -20 44 -36 30 -36 8 C -36 -12 -22 -18 -16 -34 C -8 -22 -4 -30 0 -52 Z" fill={X.flame} stroke={T.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 0 -6 C 8 4 18 10 16 22 C 14 32 6 36 0 36 C -9 36 -16 30 -16 20 C -16 10 -6 6 0 -6 Z" fill={X.flameIn} />
    </g>
  );

/** "No" sign (red ring + slash) drawn over something. */
export const NoSign: React.FC<{x: number; y: number; r: number; q: number}> = ({x, y, r, q}) =>
  q <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${q})`}>
      <circle r={r} fill="none" stroke={T.ink} strokeWidth={r * 0.26} />
      <line x1={-r * 0.7} y1={-r * 0.7} x2={r * 0.7} y2={r * 0.7} stroke={T.ink} strokeWidth={r * 0.26} strokeLinecap="round" />
      <circle r={r} fill="none" stroke={T.blood} strokeWidth={r * 0.16} />
      <line x1={-r * 0.7} y1={-r * 0.7} x2={r * 0.7} y2={r * 0.7} stroke={T.blood} strokeWidth={r * 0.16} strokeLinecap="round" />
    </g>
  );

/** Drinking glass (origin = bottom centre). fill: liquid level 0..1; kind water (ice) or milk. */
export const Glass: React.FC<{x?: number; y?: number; fill: number; kind: 'water' | 'milk'; s?: number; rot?: number}> = ({x = 0, y = 0, fill, kind, s = 1, rot = 0}) => {
  const W0 = 62, W1 = 78, H = 210;
  const ly = -H * 0.9 * fill;
  const liquid = kind === 'milk' ? X.milk : X.water;
  const liquidS = kind === 'milk' ? X.milkShade : X.waterShade;
  const xAt = (yy: number) => lerp0(W0, W1, -yy / H);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={`M ${-W0} 0 L ${-W1} ${-H} L ${W1} ${-H} L ${W0} 0 Z`} fill={X.glass} />
      {fill > 0.01 && <path d={`M ${-W0 + 6} -6 L ${-xAt(ly) + 6} ${ly} L ${xAt(ly) - 6} ${ly} L ${W0 - 6} -6 Z`} fill={liquid} />}
      {fill > 0.01 && <path d={`M ${W0 * 0.35} -6 L ${xAt(ly) * 0.45} ${ly} L ${xAt(ly) - 6} ${ly} L ${W0 - 6} -6 Z`} fill={liquidS} />}
      {fill > 0.01 && <path d={`M ${-xAt(ly) + 6} ${ly} L ${xAt(ly) - 6} ${ly}`} stroke={kind === 'milk' ? X.milkDeep : X.waterDeep} strokeWidth={6} />}
      {kind === 'water' && fill > 0.15 && [[-26, ly + 30, 12], [18, ly + 22, -10], [-4, ly + 62, 6]].map(([a, b, r], i) => (
        <rect key={i} x={a - 22} y={b - 22} width={44} height={44} rx={10} transform={`rotate(${r} ${a} ${b})`} fill={X.ice} stroke={T.ink} strokeWidth={4} />
      ))}
      <path d={`M ${-W1 + 22} ${-H + 18} L ${-W0 + 18} -18`} stroke={T.white} strokeWidth={12} strokeLinecap="round" />
      <path d={`M ${-W0} 0 L ${-W1} ${-H} L ${W1} ${-H} L ${W0} 0 Z`} fill="none" stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
    </g>
  );
};

/** Jagged shout balloon with text (origin = centre). */
export const Shout: React.FC<{x: number; y: number; text: string; size: number; q: number; rot?: number; fill?: string; color?: string}> = ({x, y, text, size, q, rot = 0, fill = T.gold, color = T.blood}) => {
  if (q <= 0.01) return null;
  const w = size * text.length * 0.36 + size * 0.9, h = size * 1.6;
  const n = 18;
  const pts = Array.from({length: n * 2}, (_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2;
    const k = i % 2 ? 0.8 : 1.0;
    return `${(Math.cos(a) * w * 0.56 * k).toFixed(1)},${(Math.sin(a) * h * 0.56 * k).toFixed(1)}`;
  }).join(' ');
  const st = {fontFamily: HEAD, fontWeight: 800, fontSize: size, letterSpacing: size * 0.02} as const;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${q})`}>
      <polygon points={pts} fill={fill} stroke={T.ink} strokeWidth={OUTLINE + 1} strokeLinejoin="round" />
      <text x={0} y={size * 0.36} textAnchor="middle" fill={color} stroke={T.ink} strokeWidth={size * 0.16} strokeLinejoin="round" paintOrder="stroke" style={st}>{text}</text>
    </g>
  );
};

/** Rubber stamp (rotated outlined box + text). */
export const Stamp: React.FC<{x: number; y: number; text: string; size: number; q: number; rot?: number; color?: string}> = ({x, y, text, size, q, rot = -12, color = T.blood}) => {
  if (q <= 0.01) return null;
  const w = size * text.length * 0.62 + size * 0.7, h = size * 1.35;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${q})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={size * 0.18} fill={T.white} stroke={color} strokeWidth={size * 0.14} />
      <text x={0} y={size * 0.36} textAnchor="middle" fill={color} style={{fontFamily: HEAD, fontWeight: 800, fontSize: size, letterSpacing: size * 0.06}}>{text}</text>
    </g>
  );
};

/** Card with a doodled flame (the courier's "fire" message). Origin = centre, width w. */
export const FireCard: React.FC<{x: number; y: number; w: number; q: number; rot?: number; t?: number}> = ({x, y, w, q, rot = 0, t = 0}) =>
  q <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${q})`}>
      <rect x={-w / 2} y={-w * 0.66} width={w} height={w * 1.32} rx={w * 0.08} fill={T.white} stroke={T.ink} strokeWidth={OUTLINE} />
      <rect x={-w / 2 + w * 0.08} y={-w * 0.56} width={w * 0.84} height={w * 0.12} rx={w * 0.04} fill={T.blood} />
      <text x={0} y={-w * 0.465} textAnchor="middle" fill={T.white} style={{fontFamily: HEAD, fontWeight: 800, fontSize: w * 0.1}}>DARURAT</text>
      <FireIcon x={0} y={w * 0.12} size={w * 0.62} q={1} t={t} />
    </g>
  );

/** Oil drop icon (origin = centre). */
export const OilDrop: React.FC<{x: number; y: number; size: number; q: number}> = ({x, y, size, q}) =>
  q <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${(q * size) / 100})`}>
      <path d="M 0 -56 C 18 -28 40 -6 40 16 C 40 38 22 52 0 52 C -22 52 -40 38 -40 16 C -40 -6 -18 -28 0 -56 Z" fill={X.oil} stroke={T.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 18 0 C 26 12 28 22 22 32 C 16 42 6 46 -4 46 C 14 38 22 22 18 0 Z" fill={X.oilShade} />
      <ellipse cx={-16} cy={8} rx={8} ry={14} transform="rotate(20 -16 8)" fill={X.oilHi} />
    </g>
  );

/** The TRPV1 door in a papilla: arch frame, yellow leaf with round window, dark tunnel behind. Origin = bottom centre.
 *  open 0..1 swings the leaf on its left hinge. */
export const NerveDoor: React.FC<{x: number; y: number; w: number; h: number; open: number; rattle?: number}> = ({x, y, w, h, open, rattle = 0}) => {
  const hw = w / 2;
  const arch = (k: number) => `M ${-hw * k} 0 L ${-hw * k} ${-h + hw} A ${hw * k} ${hw * k} 0 0 1 ${hw * k} ${-h + hw} L ${hw * k} 0 Z`;
  const sx = 1 - 1.45 * open;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={arch(1.22)} fill={T.dark} stroke={T.ink} strokeWidth={OUTLINE} transform={`translate(0 ${-hw * 0.0}) scale(1 ${1 + (hw * 0.22) / h})`} />
      <path d={arch(1)} fill={X.tunnel} />
      {[0.78, 0.56, 0.36].map((k, i) => <path key={i} d={arch(k)} transform={`translate(0 ${-h * (1 - k) * 0.25})`} fill="none" stroke={X.tunnelRing} strokeWidth={8} />)}
      <g transform={`translate(${-hw} 0) scale(${sx} 1) rotate(${rattle}) translate(${hw} 0)`}>
        <path d={arch(1)} fill={sx > 0 ? X.door : X.doorShade} stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
        <path d={`M ${-hw * 0.7} ${-h * 0.08} L ${-hw * 0.7} ${-h * 0.42} L ${hw * 0.7} ${-h * 0.42} L ${hw * 0.7} ${-h * 0.08} Z`} fill={X.doorShade} stroke={T.ink} strokeWidth={4} />
        <circle cx={0} cy={-h + hw * 1.05} r={hw * 0.42} fill={T.lens} stroke={T.ink} strokeWidth={4.5} />
        <circle cx={hw * 0.62} cy={-h * 0.52} r={hw * 0.12} fill={T.goldShade} stroke={T.ink} strokeWidth={4} />
      </g>
      <path d={arch(1)} fill="none" stroke={T.ink} strokeWidth={OUTLINE} />
    </g>
  );
};

/** Alarm board with two siren domes (origin = centre). lit 0..1 swings the flat beams. */
export const AlarmBoard: React.FC<{x: number; y: number; w: number; lines: string[]; q: number; t: number; lit?: number; size?: number}> = ({x, y, w, lines, q, t, lit = 1, size = 84}) => {
  const halus = useHalus('TUBUH').full; // soft drop shadow under the board (HALUS full)
  if (q <= 0.01) return null;
  const h = size * 1.25 * lines.length + size * 0.7;
  const sw = Math.sin(t * 7) * 28;
  return (
    <g transform={`translate(${x} ${y}) scale(${q})`}>
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(${s * (w / 2 - 70)} ${-h / 2})`}>
          {lit > 0.01 && [-1, 1].map((b) => <path key={b} d="M 0 -40 L -60 -230 L 60 -230 Z" transform={`rotate(${b * 40 + sw * s})`} fill="#FFE07A" />)}
          <rect x={-40} y={-18} width={80} height={24} rx={6} fill={T.ink} />
          <path d="M -32 -18 Q -32 -76 0 -76 Q 32 -76 32 -18 Z" fill={T.blood} stroke={T.ink} strokeWidth={OUTLINE} />
          <path d="M -14 -30 Q -16 -58 0 -64" stroke={T.white} strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
      ))}
      {halus && <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill={T.ink} filter="url(#hl-drop)" />}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill={X.board} stroke={T.ink} strokeWidth={OUTLINE + 2} />
      <rect x={-w / 2 + 18} y={-h / 2 + 18} width={w - 36} height={h - 36} rx={18} fill="none" stroke={X.boardShade} strokeWidth={10} />
      {lines.map((ln, i) => (
        <text key={i} x={0} y={-h / 2 + size * 0.35 + size * 1.25 * (i + 0.5) + size * 0.36} textAnchor="middle" fill={T.white} stroke={T.ink} strokeWidth={size * 0.12} paintOrder="stroke" strokeLinejoin="round"
          style={{fontFamily: HEAD, fontWeight: 800, fontSize: size, letterSpacing: size * 0.02}}>{ln}</text>
      ))}
    </g>
  );
};

/** Big red panic button on a pedestal (origin = floor centre). press 0..1. */
export const PanicButton: React.FC<{x: number; y: number; s?: number; press: number; label?: string}> = ({x, y, s = 1, press, label = 'PANIK'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -70 0 L -54 -150 L 54 -150 L 70 0 Z" fill={T.whiteShade} stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
    <path d="M 20 0 L 30 -150 L 54 -150 L 70 0 Z" fill="#D4C5D0" />
    <rect x={-80} y={-170} width={160} height={30} rx={12} fill={T.gold} stroke={T.ink} strokeWidth={OUTLINE} />
    <g transform={`translate(0 ${-170 + press * 18})`}>
      <path d="M -56 0 Q -56 -66 0 -66 Q 56 -66 56 0 Z" fill={X.button} stroke={T.ink} strokeWidth={OUTLINE} />
      <path d="M -30 -20 Q -32 -48 -6 -54" stroke={T.white} strokeWidth={10} fill="none" strokeLinecap="round" />
    </g>
    {label && <text x={0} y={-60} textAnchor="middle" fill={T.ink} style={{fontFamily: HEAD, fontWeight: 800, fontSize: 30}}>{label}</text>}
  </g>
);

/** One tooth (origin = root centre on the gum line; dir 1 = stands up, -1 = hangs down). Optional cute face. */
export const Tooth: React.FC<{x: number; y: number; w: number; h: number; dir?: 1 | -1; face?: boolean; t?: number; seed?: number}> = ({x, y, w, h, dir = 1, face = false, t = 0, seed = 0}) => {
  const d = `M ${-w / 2} 0 L ${-w / 2} ${-h + w * 0.3} Q ${-w / 2} ${-h} ${-w * 0.2} ${-h} Q 0 ${-h + w * 0.08} ${w * 0.2} ${-h} Q ${w / 2} ${-h} ${w / 2} ${-h + w * 0.3} L ${w / 2} 0 Z`;
  const lid = blink(t, seed + 40);
  return (
    <g transform={`translate(${x} ${y}) scale(1 ${dir})`}>
      <path d={d} fill={X.tooth} />
      <path d={`M ${w * 0.18} 0 L ${w * 0.18} ${-h + w * 0.34} Q ${w * 0.3} ${-h + w * 0.06} ${w / 2 - 2} ${-h + w * 0.3} L ${w / 2 - 2} 0 Z`} fill={X.toothShade} />
      <path d={d} fill="none" stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      {face && (
        <g transform={`translate(${-w * 0.04} ${-h * 0.5}) scale(1 ${dir})`}>
          {[-1, 1].map((s) => <ellipse key={s} cx={s * w * 0.17} cy={0} rx={w * 0.06} ry={w * 0.08 * (1 - lid * 0.9)} fill={T.ink} />)}
          <path d={`M ${-w * 0.1} ${w * 0.13} Q 0 ${w * 0.22} ${w * 0.1} ${w * 0.13}`} stroke={T.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          {[-1, 1].map((s) => <circle key={s} cx={s * w * 0.3} cy={w * 0.1} r={w * 0.06} fill={T.blush} />)}
        </g>
      )}
    </g>
  );
};

/** Flat snowflake glyph. */
export const Snow: React.FC<{x: number; y: number; size: number; q: number; rot?: number}> = ({x, y, size, q, rot = 0}) =>
  q <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${q})`}>
      {[0, 60, 120].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <line x1={0} y1={-size} x2={0} y2={size} stroke={T.ink} strokeWidth={size * 0.3} strokeLinecap="round" />
          <line x1={0} y1={-size} x2={0} y2={size} stroke={T.white} strokeWidth={size * 0.14} strokeLinecap="round" />
        </g>
      ))}
    </g>
  );

/** Water / milk wave sheet: flat fill below a gently rolling crest at y = top (world), over x0..x1. */
export const WaveSheet: React.FC<{x0: number; x1: number; top: number; t: number; color: string; shade: string; foam?: string; amp?: number; bottom?: number; lead?: number}> = ({
  x0, x1, top, t, color, shade, foam = T.white, amp = 22, bottom = 4000, lead,
}) => {
  const pts: string[] = [];
  const step = 40;
  for (let x = x0; x <= x1 + 0.1; x += step) pts.push(`${x.toFixed(1)},${(top + Math.sin(x * 0.012 + t * 3) * amp + Math.sin(x * 0.031 - t * 2) * amp * 0.35).toFixed(1)}`);
  const crest = `M ${x0} ${bottom} L ${pts.join(' L ')} L ${x1} ${bottom} Z`;
  const pts2: string[] = [];
  for (let x = x0; x <= x1 + 0.1; x += step) pts2.push(`${x.toFixed(1)},${(top + 46 + Math.sin(x * 0.012 + t * 3 + 1) * amp * 0.7).toFixed(1)}`);
  const band = `M ${x0} ${bottom} L ${pts2.join(' L ')} L ${x1} ${bottom} Z`;
  return (
    <g>
      <path d={crest} fill={color} stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      <path d={band} fill={shade} />
      {Array.from({length: 26}).map((_, i) => {
        const bx = x0 + ((i * 263.7 + t * (i % 2 ? 40 : -30)) % Math.max(1, x1 - x0 + 400)) - 200;
        const by = top + 120 + ((i * 97) % 520);
        if (bx < x0 + 30 || bx > x1 - 30) return null;
        return i % 3 ? <path key={i} d={`M ${bx - 46} ${by} q 23 -14 46 0 q 23 14 46 0`} stroke={color} strokeWidth={9} fill="none" strokeLinecap="round" />
          : (() => { const ph = (t * 0.5 + i * 0.37) % 1; const rr = (9 + (i % 4) * 3) * Math.sin(ph * Math.PI); return rr < 1 ? null : <circle key={i} cx={bx} cy={by - ph * 70} r={rr} fill={color} stroke={T.ink} strokeWidth={3.5} />; })();
      })}
      {lead !== undefined && (
        <g>
          <path d={`M ${lead} ${top + 30} q 50 -110 150 -60 q -60 -10 -70 40 Z`} fill={color} stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
          <circle cx={lead + 120} cy={top - 70} r={14} fill={foam} stroke={T.ink} strokeWidth={4} />
          <circle cx={lead + 160} cy={top - 30} r={10} fill={foam} stroke={T.ink} strokeWidth={4} />
        </g>
      )}
    </g>
  );
};

/** Flat 4-point sparkle (origin = centre). */
export const Sparkle: React.FC<{x: number; y: number; size: number; q: number; color?: string; rot?: number}> = ({x, y, size, q, color = T.gold, rot = 0}) =>
  q <= 0.01 ? null : (
    <path d={`M 0 ${-size} Q ${size * 0.16} ${-size * 0.16} ${size} 0 Q ${size * 0.16} ${size * 0.16} 0 ${size} Q ${-size * 0.16} ${size * 0.16} ${-size} 0 Q ${-size * 0.16} ${-size * 0.16} 0 ${-size} Z`}
      transform={`translate(${x} ${y}) rotate(${rot}) scale(${q})`} fill={color} stroke={T.ink} strokeWidth={4} strokeLinejoin="round" />
  );

export const clampP = clamp01;

// ======================================================================= camera
// Cam = world pose (x, y = the world point at the screen centre, s = zoom). Optional cx/cy = that screen centre:
// omitted → 540/960 (portrait). Landscape: framed(cam, useFrame()) sets cx/cy = 960/540 so the same pose lands mid-frame
// and the wide frame simply sees more world left/right (≈ 1.78× the width, 0.56× the height of portrait at the same s).
export type Cam = {x: number; y: number; s: number; cx?: number; cy?: number};
/** Put a camera's pose at the centre of the frame being rendered (portrait leaves it unchanged). */
export const framed = (c: Cam, fr: Frame): Cam => ({...c, cx: fr.cx, cy: fr.cy});
/** SVG transform for a world layer at parallax depth k (1 = main plane). Parallax pivots on the world point 540/960. */
export const camT = (c: Cam, k = 1) => {
  const s = 1 + (c.s - 1) * k, x = 540 + (c.x - 540) * k, y = 960 + (c.y - 960) * k;
  return `translate(${c.cx ?? 540} ${c.cy ?? 960}) scale(${s.toFixed(5)}) translate(${(-x).toFixed(2)} ${(-y).toFixed(2)})`;
};
/** World point → screen point for a camera at depth k. */
export const toScreen = (c: Cam, wx: number, wy: number, k = 1): [number, number] => {
  const s = 1 + (c.s - 1) * k, x = 540 + (c.x - 540) * k, y = 960 + (c.y - 960) * k;
  return [(c.cx ?? 540) + (wx - x) * s, (c.cy ?? 960) + (wy - y) * s];
};
/** Piecewise camera: start pose, then moves easing (inout cubic, zoom in log space) toward targets. Keeps cx/cy. */
export type CamMove = {from: number; to: number} & Partial<Pick<Cam, 'x' | 'y' | 's'>>;
const io = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const camAt = (t: number, start: Cam, moves: CamMove[]): Cam => {
  let c = {...start};
  for (const m of moves) {
    const k = io(Math.max(0, Math.min(1, (t - m.from) / (m.to - m.from))));
    c = {...c, x: lerp(c.x, m.x ?? c.x, k), y: lerp(c.y, m.y ?? c.y, k), s: c.s * Math.pow((m.s ?? c.s) / c.s, k)};
  }
  return c;
};

/** Full-frame SVG layer (size of the composition being rendered). */
export const Svg: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg}) => {
  const {W, H} = useFrame();
  const halus = useHalus('TUBUH').full;
  return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'hidden', background: bg}}>{halus && <HalusDefs ink={T.ink} />}{children}</svg>;
};

// ======================================================================= TONGUE (inside the mouth)
export const TG = {G: 1350, GTOP: 1100};
export type Hill = {x: number; w: number; h: number; tone?: 0 | 1};
/** One papilla hill on the main plane (origin = base centre). */
export const Papilla: React.FC<{x: number; y: number; w: number; h: number; tone?: 0 | 1}> = ({x, y, w, h, tone = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={moundPath(w, h)} fill={tone ? T.fold : T.lining} />
    <path d={`M ${w * 0.1} 0 C ${w * 0.32} ${-h * 0.2} ${w * 0.36} ${-h * 0.75} ${w * 0.08} ${-h * 0.98} C ${w * 0.36} ${-h} ${w / 2} ${-h * 0.5} ${w / 2} 0 Z`} fill={tone ? T.dark : T.wall} />
    <ellipse cx={-w * 0.2} cy={-h * 0.72} rx={w * 0.08} ry={h * 0.05} transform={`rotate(-30 ${-w * 0.2} ${-h * 0.72})`} fill={T.white} opacity={tone ? 0 : 0.9} />
    <path d={moundPath(w, h)} fill="none" stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
  </g>
);

/** The mouth interior: palate with ridges, upper + lower teeth rows (a slit of daylight between), far papillae,
 *  the tongue ground with small papillae dots, main-plane hills, `children` on the main plane, foreground bumps.
 *  Ground line TG.GTOP, hill/character feet TG.G. The world runs x −3000…4200 so a wide frame never sees an edge. */
export const TongueSet: React.FC<{t: number; cam: Cam; hills: Hill[]; children?: React.ReactNode; behind?: React.ReactNode; over?: React.ReactNode; fg?: boolean}> = ({t, cam, hills, children, behind, over, fg = true}) => {
  const {W, H, wide} = useFrame();
  const halus = useHalus('TUBUH').full; // HALUS full: the foreground bumps go soft (depth of field)
  const geo = useMemo(() => {
    const ridges = [120, 250, 370].map((y, i) => {
      let d = `M -2400 ${y}`;
      for (let x = -2400; x < 3600; x += 160) d += ` Q ${x + 80} ${y + (i % 2 ? 34 : -34)} ${x + 160} ${y}`;
      return d;
    });
    const far = Array.from({length: 22}, (_, i) => ({x: -2200 + i * 250 + rnd(i * 3.7) * 80, w: 240 + rnd(i * 5.1) * 140, h: 110 + rnd(i * 2.3) * 90}));
    const dots: {x: number; y: number; r: number; c: number}[] = [];
    for (let row = 0; row < 16; row++) {
      const y = TG.GTOP + 40 + row * row * 9 + row * 26;
      const r = 8 + row * 2.6;
      const step = 70 + row * 18;
      for (let x = -2400 + (row % 2) * step * 0.5; x < 3600; x += step) dots.push({x: x + rnd(row * 31 + x) * 30, y: y + rnd(x * 0.3 + row) * 14, r, c: rnd(row + x * 0.7) > 0.55 ? 1 : 0});
    }
    return {ridges, far, dots};
  }, []);
  const teeth = (y: number, dir: 1 | -1, n0: number, n1: number, w: number, h: number, faces: number[]) =>
    Array.from({length: n1 - n0}, (_, k) => {
      const i = n0 + k;
      return <Tooth key={i} x={i * (w + 8)} y={y} w={w} h={h + (i % 3) * 6} dir={dir} face={faces.includes(i)} t={t} seed={i * 1.3} />;
    });
  // foreground bumps (depth 1.35): the portrait four, plus two at the far sides for the wide frame
  const bumps = wide ? [[-900, 2010, 240], [-160, 1980, 230], [1240, 2010, 250], [2000, 1990, 240], [120, 2160, 200], [980, 2190, 210]] : [[-160, 1980, 230], [1240, 2010, 250], [120, 2160, 200], [980, 2190, 210]];
  return (
    <g>
      <rect x={-10} y={-10} width={W + 20} height={H + 20} fill={X.palate} />
      {/* daylight slit between the teeth rows */}
      <g transform={camT(cam, 0.25)}>
        <rect x={-3000} y={520} width={7000} height={260} fill={T.sky} />
        <rect x={-3000} y={600} width={7000} height={40} fill={T.skyBand} />
      </g>
      <g transform={camT(cam, 0.2)}>
        <rect x={-3000} y={-3000} width={7000} height={3460} fill={X.palate} />
        {geo.ridges.map((d, i) => <path key={i} d={d} stroke={X.palateRidge} strokeWidth={22} fill="none" strokeLinecap="round" />)}
        <path d="M 540 -400 L 540 430" stroke={X.palateRidge} strokeWidth={22} strokeLinecap="round" />
        {teeth(470, -1, -20, 28, 112, 112, [])}
        <rect x={-3000} y={440} width={7000} height={40} fill={X.gum} />
        <path d="M -3000 480 L 4000 480" stroke={T.ink} strokeWidth={OUTLINE} />
      </g>
      <g transform={camT(cam, 0.35)}>
        <rect x={-3000} y={790} width={7000} height={3000} fill={T.fold} />
        {teeth(800, 1, -20, 28, 118, 128, [3, 6, 8])}
        <rect x={-3000} y={792} width={7000} height={44} fill={X.gum} />
        <path d="M -3000 792 L 4000 792" stroke={T.ink} strokeWidth={OUTLINE} />
      </g>
      <g transform={camT(cam, 0.6)}>
        <rect x={-3000} y={1000} width={7000} height={3000} fill={T.wall} />
        {geo.far.map((m, i) => (
          <g key={i} transform={`translate(${m.x} 1010)`}>
            <path d={moundPath(m.w, m.h)} fill={T.fold} />
            <path d={moundPath(m.w * 0.7, m.h * 0.86)} transform={`translate(${-m.w * 0.12} 0)`} fill={T.wall} />
            <path d={moundPath(m.w, m.h)} fill="none" stroke={T.ink} strokeWidth={4.5} strokeLinejoin="round" />
          </g>
        ))}
      </g>
      <g transform={camT(cam, 1)}>
        <path d={`M -3000 5000 L -3000 ${TG.GTOP} ${Array.from({length: 90}, (_, i) => `Q ${-3000 + i * 80 + 40} ${TG.GTOP - 26} ${-3000 + (i + 1) * 80} ${TG.GTOP}`).join(' ')} L 4200 5000 Z`}
          fill={T.wall} stroke={T.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
        {geo.dots.map((d, i) => <ellipse key={i} cx={d.x} cy={d.y} rx={d.r * 1.25} ry={d.r * 0.8} fill={d.c ? T.fold : T.lining} />)}
        {behind}
        {hills.map((h, i) => <Papilla key={i} x={h.x} y={TG.G} w={h.w} h={h.h} tone={h.tone} />)}
        {children}
      </g>
      {over}
      {fg && (
        <g transform={camT(cam, 1.35)} filter={halus ? 'url(#hl-fg)' : undefined}>
          {bumps.map(([x, y, r], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle r={r} fill={T.lining} />
              <path d={crescent(r, -10, 120, 0.2)} fill={T.wall} />
              <circle r={r} fill="none" stroke={T.ink} strokeWidth={OUTLINE} />
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

// ======================================================================= NERVE (highway to the brain room)
/** Nerve fibre (axon lane + myelin sausages) at x NX running down from the brain-room FLOOR; hatch at (NX, FLOOR). */
export const NV = {NX: 60, FLOOR: 1320, TOP: 1320, BOTTOM: 4600, W: 300};
export const NerveSet: React.FC<{t: number; cam: Cam; children?: React.ReactNode}> = ({t, cam, children}) => {
  const geo = useMemo(() => {
    const folds: string[] = [];
    for (let k = 0; k < 9; k++) {
      const y = -300 + k * 560;
      let d = `M -2400 ${y}`;
      for (let x = -2400; x < 3400; x += 120) d += ` Q ${x + 60} ${y + ((x / 120) % 2 ? 40 : -40)} ${x + 120} ${y}`;
      folds.push(d);
    }
    const segs = Array.from({length: 11}, (_, i) => NV.FLOOR + 140 + i * 300);
    return {folds, segs};
  }, []);
  const {NX, FLOOR, W} = NV;
  return (
    <g transform={camT(cam)}>
      <rect x={-3000} y={-2000} width={7000} height={8000} fill={T.wall} />
      {geo.folds.map((d, i) => <path key={i} d={d} stroke={T.fold} strokeWidth={20} fill="none" strokeLinecap="round" />)}
      {/* nerve fibre: myelin sausages along a bright axon lane */}
      <rect x={NX - W / 2 - 18} y={FLOOR} width={W + 36} height={NV.BOTTOM} fill={T.dark} />
      <rect x={NX - W / 2} y={FLOOR} width={W} height={NV.BOTTOM} fill={X.courierShade} />
      <rect x={NX - 70} y={FLOOR} width={140} height={NV.BOTTOM} fill={X.courier} />
      {Array.from({length: 40}).map((_, i) => <rect key={i} x={NX - 8} y={FLOOR + 40 + i * 120} width={16} height={60} rx={8} fill={T.white} />)}
      {geo.segs.map((y, i) => [-1, 1].map((s) => (
        <g key={`${i}${s}`}>
          <rect x={NX + s * (W / 2 - 10) - 42} y={y} width={84} height={250} rx={40} fill={T.plasma} stroke={T.ink} strokeWidth={OUTLINE} />
          <rect x={NX + s * (W / 2 - 10) + (s > 0 ? 6 : -30)} y={y + 20} width={22} height={210} rx={11} fill={T.plasmaDeep} />
        </g>
      )))}
      {/* brain-room floor with the hatch */}
      <rect x={-3000} y={FLOOR} width={NX - W / 2 + 3000 - 18} height={220} fill={T.lining} />
      <rect x={NX + W / 2 + 18} y={FLOOR} width={4000} height={220} fill={T.lining} />
      <rect x={-3000} y={FLOOR + 150} width={NX - W / 2 + 3000 - 18} height={70} fill={T.fold} />
      <rect x={NX + W / 2 + 18} y={FLOOR + 150} width={4000} height={70} fill={T.fold} />
      <path d={`M -3000 ${FLOOR} L ${NX - W / 2 - 18} ${FLOOR} M ${NX + W / 2 + 18} ${FLOOR} L 4000 ${FLOOR}`} stroke={T.ink} strokeWidth={OUTLINE} />
      <path d={`M -3000 ${FLOOR + 220} L ${NX - W / 2 - 18} ${FLOOR + 220} M ${NX + W / 2 + 18} ${FLOOR + 220} L 4000 ${FLOOR + 220}`} stroke={T.ink} strokeWidth={OUTLINE} />
      <ellipse cx={NX} cy={FLOOR} rx={W / 2 + 30} ry={34} fill={T.dark} stroke={T.ink} strokeWidth={OUTLINE} />
      <ellipse cx={NX} cy={FLOOR + 4} rx={W / 2 - 6} ry={22} fill={T.ink} />
      <path d={`M ${NX - W / 2 - 18} ${FLOOR} L ${NX - W / 2 - 18} ${NV.BOTTOM} M ${NX + W / 2 + 18} ${FLOOR} L ${NX + W / 2 + 18} ${NV.BOTTOM}`} stroke={T.ink} strokeWidth={OUTLINE} />
      {children}
      {void t}
    </g>
  );
};

// ======================================================================= SKIN (cross-section with sweat glands)
/** Skin surface at y SK.TOP with three sweat-gland pores at SK.PORES (ducts SK.DEPTH deep, coil at the bottom). */
export const SK = {TOP: 760, PORES: [250, 540, 830], DEPTH: 600};
export const ductX = (px: number, y: number) => px + Math.sin((y - SK.TOP) / 95) * 42;
/** Position on a sweat duct: s = 0 at the coil, 1 at the pore (s > 1 = above the skin). */
export const ductPos = (px: number, s: number): [number, number] => {
  const y = lerp(SK.TOP + SK.DEPTH, SK.TOP, s);
  return [s <= 1 ? ductX(px, y) : px, y];
};
export const SkinSet: React.FC<{t: number; cam: Cam; children?: React.ReactNode; under?: React.ReactNode}> = ({t, cam, children, under}) => {
  const {wide} = useFrame();
  const geo = useMemo(() => {
    const ducts = SK.PORES.map((px) => {
      const pts: string[] = [];
      for (let y = SK.TOP - 10; y <= SK.TOP + SK.DEPTH; y += 12) pts.push(`${ductX(px, y).toFixed(1)},${y}`);
      return `M ${pts.join(' L ')}`;
    });
    const fibres: string[] = [];
    for (let k = 0; k < 7; k++) {
      const y = SK.TOP + 200 + k * 140;
      let d = `M -1600 ${y}`;
      for (let x = -1600; x < 2700; x += 150) d += ` Q ${x + 75} ${y + ((x / 150) % 2 ? 30 : -30)} ${x + 150} ${y}`;
      fibres.push(d);
    }
    // fat cells: the portrait 14 (x −200…1230) + 6 more each side for the wide frame (same 110 px rhythm)
    const fat = [...Array.from({length: 14}, (_, i) => i), ...Array.from({length: 6}, (_, i) => -1 - i), ...Array.from({length: 6}, (_, i) => 14 + i)]
      .map((i) => ({x: -200 + i * 110 + rnd(i * 4.1) * 40, y: SK.TOP + 900 + rnd(i * 2.9) * 160, r: 60 + rnd(i * 7.7) * 22}));
    // scallops on the portrait 90 px grid (starts at −1000 − 9·90 so portrait frames are unchanged)
    const scallop = Array.from({length: 58}, (_, i) => `Q ${-1810 + i * 90 + 45} ${SK.TOP - 22} ${-1810 + (i + 1) * 90} ${SK.TOP}`).join(' ');
    return {ducts, fibres, fat, scallop};
  }, []);
  const twinkles = wide ? [[150, 300, 22], [930, 220, 18], [120, 560, 14], [960, 520, 14], [-280, 420, 18], [1360, 380, 20], [-420, 640, 14], [1500, 620, 14]] : [[150, 300, 22], [930, 220, 18], [120, 560, 14], [960, 520, 14]];
  return (
    <g transform={camT(cam)}>
      <rect x={-3000} y={-3000} width={7000} height={3000 + SK.TOP} fill={T.sky} />
      <circle cx={540} cy={SK.TOP - 380} r={520} fill={T.skyBand} />
      {twinkles.map(([x, y, r], i) => (
        <path key={i} d={`M ${x - r} ${y} H ${x + r} M ${x} ${y - r} V ${y + r}`} stroke={T.white} strokeWidth={9} strokeLinecap="round" transform={`rotate(${Math.sin(t * 1.5 + i) * 8} ${x} ${y})`} />
      ))}
      {under}
      <rect x={-3000} y={SK.TOP} width={7000} height={4000} fill={T.wall} />
      {geo.fibres.map((d, i) => <path key={i} d={d} stroke={T.fold} strokeWidth={16} fill="none" strokeLinecap="round" />)}
      {geo.fat.map((f, i) => (
        <g key={i}>
          <circle cx={f.x} cy={f.y} r={f.r} fill={T.plasma} stroke={T.ink} strokeWidth={4.5} />
          <path d={crescent(f.r, -10, 120, 0.2)} transform={`translate(${f.x} ${f.y})`} fill={T.plasmaDeep} />
        </g>
      ))}
      {/* epidermis band */}
      <path d={`M -1810 ${SK.TOP + 130} L -1810 ${SK.TOP} ${geo.scallop} L 3410 ${SK.TOP + 130} Z`} fill={X.epi} />
      <rect x={-1810} y={SK.TOP + 70} width={5220} height={60} fill={X.epiShade} />
      <rect x={-1810} y={SK.TOP + 118} width={5220} height={14} fill={X.epiDeep} />
      <path d={`M -1810 ${SK.TOP} ${geo.scallop}`} fill="none" stroke={T.ink} strokeWidth={OUTLINE} />
      {/* sweat glands: duct + coil */}
      {geo.ducts.map((d, i) => (
        <g key={i}>
          <path d={d} stroke={T.ink} strokeWidth={96} fill="none" strokeLinecap="round" />
          <path d={d} stroke={T.lining} strokeWidth={84} fill="none" strokeLinecap="round" />
          <path d={d} stroke={T.sweat} strokeWidth={50} fill="none" strokeLinecap="round" />
          {[[-46, 0], [40, 18], [-10, 64], [30, -36]].map(([dx, dy], k) => (
            <g key={k}>
              <circle cx={SK.PORES[i] + dx} cy={SK.TOP + SK.DEPTH + 60 + dy} r={58} fill={T.lining} stroke={T.ink} strokeWidth={OUTLINE} />
              <circle cx={SK.PORES[i] + dx} cy={SK.TOP + SK.DEPTH + 60 + dy} r={30} fill={T.sweat} />
            </g>
          ))}
          <ellipse cx={SK.PORES[i]} cy={SK.TOP - 2} rx={44} ry={14} fill={T.ink} />
        </g>
      ))}
      {children}
    </g>
  );
};

// ======================================================================= OUTSIDE (sky + table)
/** Flat sky with a pale disc and twinkles over a wooden table top at OUT.TABLE. `children` behind the table edge, `front` over it. */
export const OUT = {TABLE: 1300};
export const OutsideSet: React.FC<{t: number; cam: Cam; children?: React.ReactNode; front?: React.ReactNode}> = ({t, cam, children, front}) => {
  const {wide} = useFrame();
  const twinkles = wide ? [[110, 330, 26], [960, 420, 20], [90, 1080, 16], [990, 980, 14], [820, 180, 16], [-360, 520, 22], [1420, 300, 20], [-240, 900, 14], [1560, 760, 16]] : [[110, 330, 26], [960, 420, 20], [90, 1080, 16], [990, 980, 14], [820, 180, 16]];
  return (
    <g transform={camT(cam)}>
      <rect x={-3000} y={-3000} width={7080} height={7920} fill={T.sky} />
      <circle cx={500} cy={780} r={640} fill={T.skyBand} />
      {twinkles.map(([x, y, r], i) => (
        <path key={i} d={`M ${x - r} ${y} H ${x + r} M ${x} ${y - r} V ${y + r}`} stroke={T.white} strokeWidth={10} strokeLinecap="round" transform={`rotate(${Math.sin(t * 1.5 + i) * 8} ${x} ${y})`} />
      ))}
      {children}
      {/* table */}
      <rect x={-3000} y={OUT.TABLE} width={7080} height={70} fill={X.wood} />
      <rect x={-3000} y={OUT.TABLE + 70} width={7080} height={3000} fill={X.woodShade} />
      <path d={`M -3000 ${OUT.TABLE} L 4080 ${OUT.TABLE} M -3000 ${OUT.TABLE + 70} L 4080 ${OUT.TABLE + 70}`} stroke={T.ink} strokeWidth={OUTLINE} />
      {[OUT.TABLE + 210, OUT.TABLE + 390].map((y, i) => <path key={i} d={`M -3000 ${y} L 4080 ${y}`} stroke={X.woodDark} strokeWidth={8} />)}
      {front}
    </g>
  );
};

// ======================================================================= transitions
/** Cutaway dive: the outer scene zooms into a hole (circle or door arch) while the inner scene grows inside it.
 *  q 0 → 1 (run backwards for an iris-out). hole = screen point of the hole centre at q = 0 (use toScreen with the
 *  outer scene's camera); r0 = hole radius (circle) or half-width (arch, height h0). Both formats: the hole travels to
 *  the frame centre and the zoom is sized to cover the frame. */
export const Dive: React.FC<{q: number; hole: [number, number]; r0: number; shape?: 'circle' | 'arch'; h0?: number; zmax?: number; s0?: number;
  outer: React.ReactNode; inner: React.ReactNode; rim?: string}> = ({q, hole, r0, shape = 'circle', h0 = 0, zmax, s0 = 0.3, outer, inner, rim = T.gold}) => {
  const {W, H, cx: CX, cy: CY} = useFrame();
  if (q >= 1) return <>{inner}</>;
  if (q <= 0) return <>{outer}</>;
  const zm = zmax ?? (shape === 'circle' ? (Math.hypot(W, H) * 0.527) / r0 : Math.max((W * 1.111) / r0, (H * 1.094) / h0) * 1.15);
  const Z = Math.exp(lerp(0, Math.log(zm), q));
  const cX = lerp(hole[0], CX, q), cY = lerp(hole[1], CY, q);
  const sB = Math.exp(lerp(Math.log(s0), 0, q));
  let clip: string, rimD: string;
  if (shape === 'circle') {
    const R = r0 * Z;
    clip = `circle(${R.toFixed(2)}px at ${cX.toFixed(2)}px ${cY.toFixed(2)}px)`;
    rimD = `M ${cX - R} ${cY} A ${R} ${R} 0 1 0 ${cX + R} ${cY} A ${R} ${R} 0 1 0 ${cX - R} ${cY} Z`;
  } else {
    const w = r0 * Z, h = h0 * Z;
    const top = cY - h / 2, bot = cY + h / 2;
    rimD = `M ${cX - w} ${bot} L ${cX - w} ${top + w} A ${w} ${w} 0 0 1 ${cX + w} ${top + w} L ${cX + w} ${bot} Z`;
    clip = `path('${rimD}')`;
  }
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${cX}px, ${cY}px) scale(${Z}) translate(${-hole[0]}px, ${-hole[1]}px)`}}>{outer}</div>
      <div style={{position: 'absolute', inset: 0, clipPath: clip}}>
        <div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${cX}px, ${cY}px) scale(${sB}) translate(${-CX}px, ${-CY}px)`}}>{inner}</div>
      </div>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <path d={rimD} fill="none" stroke={T.ink} strokeWidth={22} />
        <path d={rimD} fill="none" stroke={rim} strokeWidth={11} />
      </svg>
    </>
  );
};

/** Fleshy band (dark tissue with scalloped edges) sweeping bottom → top: scene a above it, scene b below it. q 0..1. */
export const LobeWipe: React.FC<{q: number; a: React.ReactNode; b: React.ReactNode}> = ({q, a, b}) => {
  const {W: FW, H: FH} = useFrame();
  if (q <= 0) return <>{a}</>;
  if (q >= 1) return <>{b}</>;
  const H = 340;
  const n = Math.ceil(FW / 120);
  const yc = lerp(FH + H / 2 + 40, -H / 2 - 40, q);
  const edge = (y: number) => Array.from({length: n}, (_, i) => `A 60 60 0 0 1 ${(i + 1) * 120} ${y}`).join(' ');
  const top = yc - H / 2, bot = yc + H / 2;
  const R = n * 120;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 ${Math.max(0, FH - yc).toFixed(1)}px 0)`}}>{a}</div>
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(${Math.max(0, yc).toFixed(1)}px 0 0 0)`}}>{b}</div>
      <svg width={FW} height={FH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <path d={`M 0 ${top} ${edge(top)} L ${R} ${bot} ${Array.from({length: n}, (_, i) => `A 60 60 0 0 1 ${R - (i + 1) * 120} ${bot}`).join(' ')} Z`} fill={T.dark} stroke={T.ink} strokeWidth={OUTLINE} />
        <rect x={-10} y={yc - 40} width={FW + 20} height={80} fill={T.fold} />
        {Array.from({length: Math.ceil(FW / 155)}).map((_, i) => <circle key={i} cx={80 + i * 155} cy={yc} r={22} fill={T.lining} />)}
      </svg>
    </>
  );
};
