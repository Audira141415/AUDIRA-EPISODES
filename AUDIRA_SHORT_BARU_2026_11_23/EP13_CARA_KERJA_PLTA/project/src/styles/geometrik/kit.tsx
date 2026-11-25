import React from 'react';
import {Easing} from 'remotion';
import {CaptionPage} from '../../components/WordCaptions';
import {halusDrift, useHalus} from '../../lib/halus';
import {display, p, pageAt, useFrame} from '../shared';

// GEOMETRIK style kit — Swiss/Bauhaus data editorial (grid page, primary blocks, giant condensed numbers).
// HALUS (v1.16, level 'drift'): wrap each scene's picture in <Drift t from to i> with <GridPage /> first inside it — the
// blocks stay on the grid because the grid drifts with them (GridPage bleeds whole cells sideways when HALUS is on);
// the Caption and full-frame colour flips stay outside, still. halus "off" = the v1.15 render.
export const GEOMETRIK = {paper: '#F2EEE4', ink: '#121212', red: '#E5402E', blue: '#2149A6', yellow: '#F6C21C', grey: '#D9D3C6'};
export const G = GEOMETRIK;
export const HEAD = "'Geo Head', sans-serif";
export const TEXT = "'Geo Text', sans-serif";
export const SNAP = Easing.bezier(0.7, 0, 0.2, 1);
export const ps = (t: number, a0: number, b0: number) => p(t, a0, b0, SNAP);


export const Big: React.FC<{children: React.ReactNode; size: number; color?: string; stretch?: number; weight?: number; style?: React.CSSProperties}> = ({children, size, color = G.ink, stretch = 100, weight = 900, style}) => (
  <div style={{fontFamily: HEAD, fontWeight: weight, fontStretch: `${stretch}%`, fontSize: size, lineHeight: 0.84, letterSpacing: -size * 0.02, color, ...style}}>{children}</div>
);

/**
 * Black caption bar, the spoken word on yellow. Portrait: `top` 1500 by default, 72 px side margins.
 * Landscape: bottom-anchored inside the safe area (bottom edge 134 px above the frame edge), side margins 150, max width
 * 1400, 48 px type; pass `top` to pin it yourself in either format.
 */
export const Caption: React.FC<{t: number; pages: CaptionPage[]; top?: number}> = ({t, pages, top}) => {
  const fr = useFrame();
  const pg = pageAt(t, pages);
  if (!pg) return null;
  const pop = ps(t, pg.start - 0.08, pg.start + 0.1);
  const place: React.CSSProperties = fr.wide && top === undefined ? {bottom: fr.safe.bottom + 14} : {top: top ?? 1500};
  return (
    <div style={{position: 'absolute', left: fr.pick(72, 150), right: fr.pick(72, 150), ...place, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: G.ink, padding: '16px 26px', transform: `scaleX(${0.6 + 0.4 * pop})`, opacity: pop, fontFamily: TEXT, fontWeight: 800, fontSize: fr.pick(52, 48), lineHeight: 1.2, color: '#fff', textAlign: 'center', maxWidth: fr.pick(936, 1400)}}>
        {pg.words.map((w, i) => {
          const on = t >= w.start - 0.04 && t < w.end + 0.1;
          return (
            <React.Fragment key={i}>
              <span style={{background: on ? G.yellow : 'transparent', color: on ? G.ink : t >= w.start - 0.04 ? '#fff' : '#ffffff70', padding: '0 6px'}}>{display(w.word)}</span>
              {i < pg.words.length - 1 ? ' ' : ''}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};


/**
 * Off-white page with the 90 px grid. Portrait columns start at x 72 (rows at y 60). Landscape: columns at x 60 + 90n
 * (symmetric: 60 … 1860, content snaps to x 150, 240 …) and rows at y 0 + 90n (90 … 990).
 */
export const GridPage: React.FC<{color?: string}> = ({color = GEOMETRIK.paper}) => {
  const fr = useFrame();
  // HALUS: two whole 90 px cells of sideways bleed — the lines land exactly where they were
  const b = useHalus('GEOMETRIK').drift ? 180 : 0;
  return (
    <div style={b ? {position: 'absolute', top: 0, bottom: 0, left: -b, right: -b, background: color} : {position: 'absolute', inset: 0, background: color}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: `linear-gradient(90deg, ${GEOMETRIK.ink}10 1px, transparent 1px), linear-gradient(0deg, ${GEOMETRIK.ink}10 1px, transparent 1px)`, backgroundSize: '90px 90px', backgroundPosition: fr.pick('72px 0, 0 60px', '60px 0, 0 0')}} />
    </div>
  );
};

// ---------- HALUS drift (v1.16) ----------
/** Drift strength for GEOMETRIK (big type on a strict grid: restrained). */
export const HALUS_AMOUNT = 0.7;
/** HALUS drift for scene `i` on screen from..to (s): {z, px}; {1, 0} when halus is off. */
export const drift = (t: number, from: number, to: number, i = 0, amount = HALUS_AMOUNT) =>
  useHalus('GEOMETRIK').drift ? halusDrift(t, from, to, i, amount) : {z: 1, px: 0};
/** Scene picture wrapper: slow push-in (even i) / pull-back (odd i) about (fx, fy). halus off → plain fragment. */
export const Drift: React.FC<{t: number; from: number; to: number; i?: number; amount?: number; fx?: string; fy?: string; children: React.ReactNode}> = ({
  t, from, to, i = 0, amount = HALUS_AMOUNT, fx = '50%', fy = '47%', children,
}) => {
  if (!useHalus('GEOMETRIK').drift) return <>{children}</>;
  const {z, px} = halusDrift(t, from, to, i, amount);
  return <div style={{position: 'absolute', inset: 0, transformOrigin: `${fx} ${fy}`, transform: `translateX(${px}px) scale(${z})`}}>{children}</div>;
};

// ---------- layout helpers (from the GEOMETRIK demo) ----------
export const label = (size = 30, color: string = G.ink): React.CSSProperties => ({fontFamily: TEXT, fontWeight: 800, fontSize: size, letterSpacing: size * 0.12, color});
export const Abs: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties; o?: number}> = ({x, y, children, style, o = 1}) =>
  o > 0 ? <div style={{position: 'absolute', left: x, top: y, opacity: o, ...style}}>{children}</div> : null;
export const Block: React.FC<{x: number; y: number; w: number; h: number; color: string; q: number; children?: React.ReactNode; round?: boolean; from?: 'left' | 'up' | 'scale'}> = ({x, y, w, h, color, q, children, round, from = 'scale'}) => {
  if (q <= 0) return null;
  const tf = from === 'scale' ? `scale(${q})` : from === 'left' ? `translateX(${(1 - q) * -400}px)` : `translateY(${(1 - q) * 300}px)`;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: color, borderRadius: round ? '50%' : 0, transform: tf, opacity: Math.min(1, q * 3),
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>{children}</div>
  );
};

