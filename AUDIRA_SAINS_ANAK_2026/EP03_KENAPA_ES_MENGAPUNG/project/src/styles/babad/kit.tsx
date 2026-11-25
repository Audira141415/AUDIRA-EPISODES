import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {CaptionPage} from '../../components/WordCaptions';
import {display, lerp, p, pb, pio, Pose, rnd, spline, useFrame} from '../shared';
import {halusDissolve, halusDrift, halusIdle, halusLevel, SoftShadow, useHalus, zoomAbout} from '../../lib/halus';

// BABAD (working name) — 2D history-cartoon look: chibi round-head characters in period costume (helmets, armour,
// togas, shields), thick warm-ink outlines + one flat cel-shade tone, painted-flat layered landscapes with NO outlines
// (depth by lighter far colours, never blur), armies built from many small characters, and thumbnail-style chunky
// outlined title words. Flat colour only: no gradients, no glows, no blur. All artwork original.
// HALUS (v1.16, level 'full' by default): stack scenes with babadScene() — whip pan when HALUS is off, zoom-dissolve +
// slow drift when on; draw each scene's picture in <g transform={sc.transform} opacity={sc.opacity}> and its titles /
// ribbons / caption in a second group <g transform={sc.hud} opacity={sc.hudOpacity}> (still when on). Tokoh gets idle
// squash + head sway and a soft ink contact shadow; the only blur in the look is that shadow (artwork stays flat).

export const BB = {
  ink: '#2A211D',
  head: '#FFFAF2', headSh: '#E9DDCC', blush: '#F5B3A2', tongue: '#E5636B',
  sky: '#8CCDEB', sky2: '#B3DDF0', cloud: '#FFFFFF', cloudSh: '#D8ECF5',
  hillFar: '#B9D8AC', hillFar2: '#A6CD97', hillMid: '#8DC171', grass: '#73B652', grassSh: '#5A9C41', grassHi: '#92CC6C',
  cypress: '#5E9A55', cypressFar: '#8BBE80',
  dirt: '#D4B07C', dirtSh: '#BC9562', road: '#E0C597',
  stone: '#E6DBC6', stoneSh: '#C9BA9E', stoneLine: '#B3A386',
  wood: '#A6743F', woodSh: '#7F5631', woodHi: '#C08C56',
  metal: '#CDD3DB', metalSh: '#9CA6B3', metalHi: '#F1F4F7',
  red: '#D8433B', redSh: '#AC2F2B', gold: '#F5BF36', goldSh: '#CD9522',
  blue: '#4472C2', blueSh: '#30589A', green: '#4E9E4A', greenSh: '#3B7D38', purple: '#7E52A3', purpleSh: '#603C80',
  cream: '#F6ECD6', creamSh: '#DFCFAE', parch: '#F2E0B5', parchSh: '#D9C28F', parchLine: '#B89A62',
  canvas: '#EBDDBC', canvasSh: '#DBC89E',
  night: '#25324F', night2: '#2E3D60', night3: '#384A70', nightHill: '#1B2640', nightHill2: '#22304D', star: '#FFF1C2', moon: '#F7EBC8', moonSh: '#E3D3A6',
  flame: '#FFB12E', flameHi: '#FFE07A', flameSh: '#F0702A',
  dawn: '#FCE6B6', dawn2: '#F9D697', sun: '#FFF4D2',
  boot: '#5C3D27', pants: '#6E4C34', sweat: '#9BD9F2', white: '#FFFFFF',
};
const K = BB.ink;
export const HEAD = "'Babad Head', sans-serif";
export const UI = "'Babad UI', sans-serif";

/** Look fonts (SIL OFL, in public/fonts): Lilita One for titles/captions, Nunito Black for small labels. */
export const BabadFonts: React.FC = () => {
  const [handle] = useState(() => delayRender('babad fonts'));
  useEffect(() => {
    const faces = [
      new FontFace('Babad Head', `url('${staticFile('fonts/LilitaOne-Regular.ttf')}') format('truetype')`),
      new FontFace('Babad UI', `url('${staticFile('fonts/Nunito-Var.ttf')}') format('truetype')`, {weight: '200 1000'}),
    ];
    Promise.all(faces.map((f) => f.load().then((ff) => document.fonts.add(ff))))
      .catch(() => undefined)
      .then(() => continueRender(handle));
  }, [handle]);
  return null;
};

// ---------- geometry ----------
type Pt = [number, number];
const f1 = (n: number) => n.toFixed(1);
/** Rounded-rect path with per-corner radii [tl, tr, br, bl]. */
export const rp = (x: number, y: number, w: number, h: number, r: number | [number, number, number, number]) => {
  const [tl, tr, br, bl] = typeof r === 'number' ? [r, r, r, r] : r;
  return `M ${x + tl} ${y} H ${x + w - tr} Q ${x + w} ${y} ${x + w} ${y + tr} V ${y + h - br} Q ${x + w} ${y + h} ${x + w - br} ${y + h} H ${x + bl} Q ${x} ${y + h} ${x} ${y + h - bl} V ${y + tl} Q ${x} ${y} ${x + tl} ${y} Z`;
};
/** Polygon with rounded corners (radius per corner or one for all). */
export const roundPoly = (pts: Pt[], r: number | number[]) => {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const P = pts[i], A = pts[(i - 1 + n) % n], B = pts[(i + 1) % n];
    const da = Math.hypot(A[0] - P[0], A[1] - P[1]), db = Math.hypot(B[0] - P[0], B[1] - P[1]);
    const rr = Math.min(Array.isArray(r) ? r[i] : r, da / 2, db / 2);
    const s: Pt = [P[0] + ((A[0] - P[0]) / da) * rr, P[1] + ((A[1] - P[1]) / da) * rr];
    const e: Pt = [P[0] + ((B[0] - P[0]) / db) * rr, P[1] + ((B[1] - P[1]) / db) * rr];
    d += `${i ? 'L' : 'M'} ${f1(s[0])} ${f1(s[1])} Q ${f1(P[0])} ${f1(P[1])} ${f1(e[0])} ${f1(e[1])} `;
  }
  return d + 'Z';
};
export const star = (cx: number, cy: number, n: number, r1: number, r2: number, rot = 0) => {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? r2 : r1;
    d += `${i ? 'L' : 'M'} ${f1(cx + Math.cos(a) * r)} ${f1(cy + Math.sin(a) * r)} `;
  }
  return d + 'Z';
};
/** Part of a circle below a horizontal chord at y (for masks/bandanas). */
const capBelow = (cx: number, cy: number, R: number, y: number) => {
  const dx = Math.sqrt(Math.max(0, R * R - (y - cy) * (y - cy)));
  return `M ${f1(cx - dx)} ${y} L ${f1(cx + dx)} ${y} A ${R} ${R} 0 ${y < cy ? 1 : 0} 1 ${f1(cx - dx)} ${y} Z`;
};

// ---------- character rig ("tokoh") ----------
export type HatName = 'none' | 'hair' | 'galea' | 'laurel' | 'hood' | 'crown' | 'blangkon' | 'kuluk' | 'morion' | 'dutch';
/** a named classic or a lego spec (any period, see HatSpec) */
export type Hat = HatName | HatSpec;
export type Mood = 'neutral' | 'smug' | 'happy' | 'grin' | 'shock' | 'sad' | 'angry' | 'scared' | 'proud';
export type GarbName = 'tunic' | 'lorica' | 'toga' | 'jawa' | 'royal' | 'doublet';
/** a named classic or a lego spec (any period, see GarbSpec) */
export type Garb = GarbName | GarbSpec;
export type Outfit = {
  garb: Garb; col: string; colSh: string;
  hat: Hat; hatCol?: string; hatSh?: string; crest?: string; crestSh?: string; hairCol?: string;
  cape?: string; capeSh?: string; sash?: string; emblem?: string; emblemCol?: string; belt?: string;
  pants?: string; boot?: string; head?: string; headSh?: string; mask?: string;
  /** batik kain (jawa/royal): base + motif colour */ kain?: string; kainSh?: string; motif?: string;
  collar?: 'band' | 'ruff'; beard?: 'mustache' | 'goatee'; bandolier?: boolean; keris?: boolean; sleeve?: string; feather?: string;
};
export type Shield = {kind: 'scutum' | 'round'; col: string; colSh: string; rim?: string; label?: string; labelCol?: string};

export const blinkAt = (t: number, seed: number) => {
  const per = 2.8 + rnd(seed) * 1.9;
  const k = (t + rnd(seed + 1) * per) % per;
  return k < 0.11 ? Math.max(0.06, Math.abs(k - 0.055) / 0.055) : 1;
};

const EY = -374; // eye line
const BROW = -412;
const MY = -330; // mouth line

const Eye: React.FC<{x: number; bl: number; big: boolean; lx: number; ly: number; lid: boolean; head: string; sw: number}> = ({x, bl, big, lx, ly, lid, head, sw}) => {
  const ex = x + lx * 10, ey = EY + ly * 7;
  if (big) {
    return (
      <g transform={`translate(0 ${ey}) scale(1 ${Math.max(0.15, bl)}) translate(0 ${-ey})`}>
        <ellipse cx={x} cy={ey} rx={24} ry={29} fill="#fff" stroke={K} strokeWidth={sw} />
        <circle cx={x + lx * 9} cy={ey + ly * 9} r={8} fill={K} />
      </g>
    );
  }
  if (bl < 0.22) return <path d={`M ${ex - 15} ${ey} Q ${ex} ${ey + 8} ${ex + 15} ${ey}`} stroke={K} strokeWidth={sw * 1.15} fill="none" strokeLinecap="round" />;
  return (
    <g transform={`translate(0 ${ey}) scale(1 ${bl}) translate(0 ${-ey})`}>
      <ellipse cx={ex} cy={ey} rx={13} ry={19} fill={K} />
      <circle cx={ex - 4} cy={ey - 7} r={5} fill="#fff" />
      {lid && (
        <g>
          <rect x={ex - 17} y={ey - 24} width={34} height={20} fill={head} />
          <path d={`M ${ex - 17} ${ey - 3} L ${ex + 17} ${ey - 6}`} stroke={K} strokeWidth={sw} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

const BROWS: Record<Mood, [number, number]> = {
  // [outer dy, inner dy] (negative = up)
  neutral: [0, 0], smug: [0, 0], happy: [-4, -8], grin: [-4, -8], shock: [-16, -20], sad: [6, -14], angry: [-10, 14], scared: [2, -18], proud: [-6, -6],
};
const Brow: React.FC<{side: -1 | 1; mood: Mood; sw: number; raise: number}> = ({side, mood, sw, raise}) => {
  let [o, i] = BROWS[mood];
  if (mood === 'smug' && side > 0) { o = -12; i = -6; }
  if (mood === 'smug' && side < 0) { o = 4; i = 6; }
  const x0 = side * 64, x1 = side * 22;
  return <path d={`M ${x0} ${BROW + o - raise} L ${x1} ${BROW + i - raise}`} stroke={K} strokeWidth={sw * 1.7} strokeLinecap="round" />;
};

const Mouth: React.FC<{mood: Mood; sw: number; talk: number}> = ({mood, sw, talk}) => {
  const open = 1 + talk * 0.45;
  const sc = (node: React.ReactNode) => <g transform={`translate(0 ${MY - 6}) scale(1 ${open}) translate(0 ${-(MY - 6)})`}>{node}</g>;
  switch (mood) {
    case 'happy':
      return sc(<g><path d={`M -30 ${MY - 6} Q 0 ${MY + 42} 30 ${MY - 6} Z`} fill={K} stroke={K} strokeWidth={sw} strokeLinejoin="round" /><ellipse cx={0} cy={MY + 12} rx={12} ry={7} fill={BB.tongue} /></g>);
    case 'grin':
      return sc(<g><path d={`M -40 ${MY - 10} Q 0 ${MY + 48} 40 ${MY - 10} Z`} fill={K} stroke={K} strokeWidth={sw} strokeLinejoin="round" /><path d={`M -34 ${MY - 8} H 34 L 31 ${MY + 4} Q 0 ${MY + 8} -31 ${MY + 4} Z`} fill="#fff" /></g>);
    case 'shock':
      return sc(<ellipse cx={0} cy={MY + 10} rx={15} ry={20} fill={K} />);
    case 'scared':
      return <path d={`M -28 ${MY + 4} q 7 -9 14 0 t 14 0 t 14 0 t 14 0`} stroke={K} strokeWidth={sw * 1.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    case 'sad':
      return <path d={`M -22 ${MY + 14} Q 0 ${MY - 8 - talk * 6} 22 ${MY + 14}`} stroke={K} strokeWidth={sw * 1.3} fill="none" strokeLinecap="round" />;
    case 'angry':
      return <g><path d={rp(-28, MY - 8, 56, 24, 8)} fill="#fff" stroke={K} strokeWidth={sw} /><line x1={-28} y1={MY + 4} x2={28} y2={MY + 4} stroke={K} strokeWidth={sw * 0.7} /></g>;
    case 'smug':
      return <path d={`M -26 ${MY - 2} Q 4 ${MY + 14} 32 ${MY - 14}`} stroke={K} strokeWidth={sw * 1.3} fill="none" strokeLinecap="round" />;
    case 'proud':
      return <path d={`M -24 ${MY - 6} Q 0 ${MY + 18} 24 ${MY - 6}`} stroke={K} strokeWidth={sw * 1.3} fill="none" strokeLinecap="round" />;
    default:
      return <path d={`M -16 ${MY + 2} Q 0 ${MY + 6 + talk * 6} 16 ${MY + 2}`} stroke={K} strokeWidth={sw * 1.2} fill="none" strokeLinecap="round" />;
  }
};

const HAIR = 'M -122 -400 Q -132 -470 -60 -496 Q 0 -514 60 -496 Q 132 -470 122 -400 Q 104 -432 64 -430 Q 22 -448 -18 -430 Q -70 -444 -102 -420 Z';

const HatBack: React.FC<{o: Outfit; sw: number}> = ({o, sw}) =>
  typeof o.hat === 'object' ? <HatLegoBack hs={o.hat} sw={sw} /> : o.hat === 'hood' ? <circle cx={0} cy={-378} r={140} fill={o.hatCol ?? BB.boot} stroke={K} strokeWidth={sw} /> : null;

const HatFront: React.FC<{o: Outfit; sw: number; t: number}> = ({o, sw, t}) => {
  if (typeof o.hat === 'object') return <HatLego hs={o.hat} o={o} sw={sw} t={t} />;
  const hair = o.hairCol ?? '#5B3A24';
  if (o.hat === 'galea') {
    const m = o.hatCol ?? BB.metal, ms = o.hatSh ?? BB.metalSh;
    const cheek = (sd: -1 | 1) => (
      <path d={`M ${sd * 134} -420 L ${sd * 100} -420 Q ${sd * 94} -372 ${sd * 102} -336 Q ${sd * 116} -320 ${sd * 130} -334 Q ${sd * 140} -376 ${sd * 134} -420 Z`} fill={m} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    );
    return (
      <g>
        {o.crest && (
          <g>
            <rect x={-9} y={-530} width={18} height={30} fill={ms} stroke={K} strokeWidth={sw * 0.8} />
            <path d="M -92 -512 Q -86 -600 0 -604 Q 86 -600 92 -512 Z" fill={o.crest} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
            <path d="M 40 -596 Q 84 -584 90 -516 L 60 -516 Q 60 -566 40 -596 Z" fill={o.crestSh ?? BB.redSh} />
            {[-54, -27, 0, 27, 54].map((x) => <line key={x} x1={x} y1={-520} x2={x * 1.08} y2={-588 + Math.abs(x) * 0.25} stroke={K} strokeWidth={sw * 0.45} />)}
            <path d="M -92 -512 Q -86 -600 0 -604 Q 86 -600 92 -512 Z" fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
          </g>
        )}
        <path d="M -128 -420 Q -130 -506 0 -510 Q 130 -506 128 -420 Z" fill={m} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M 58 -496 Q 122 -476 124 -424 L 86 -424 Q 88 -466 58 -496 Z" fill={ms} />
        <path d="M -92 -456 Q -80 -484 -42 -494" stroke={BB.metalHi} strokeWidth={sw * 1.5} fill="none" strokeLinecap="round" />
        <path d="M -128 -420 Q -130 -506 0 -510 Q 130 -506 128 -420 Z" fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
        <path d={rp(-138, -444, 276, 28, 14)} fill={ms} stroke={K} strokeWidth={sw} />
        {cheek(-1)}
        {cheek(1)}
      </g>
    );
  }
  if (o.hat === 'hood') {
    const c = o.hatCol ?? BB.boot;
    return (
      <g>
        <path d="M -126 -396 Q -122 -504 0 -516 Q 122 -504 126 -396 Q 64 -428 0 -426 Q -64 -428 -126 -396 Z" fill={c} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
        {o.mask && <path d={capBelow(0, -374, 122, -354)} fill={o.mask} stroke={K} strokeWidth={sw} strokeLinejoin="round" />}
      </g>
    );
  }
  if (o.hat === 'hair') return <path d={HAIR} fill={hair} stroke={K} strokeWidth={sw} strokeLinejoin="round" />;
  if (o.hat === 'blangkon') {
    const c = o.hatCol ?? '#5A3B22', cs = o.hatSh ?? '#3E2716';
    const D = 'M -126 -382 Q -132 -470 -60 -500 Q 0 -516 60 -500 Q 132 -470 126 -382 Q 112 -394 104 -410 Q 60 -430 0 -430 Q -60 -430 -104 -410 Q -112 -394 -126 -382 Z';
    return (
      <g>
        <path d={D} fill={c} />
        <path d="M 60 -500 Q 132 -470 126 -382 Q 112 -394 104 -410 Q 100 -462 60 -500 Z" fill={cs} />
        {[-470, -446, -422].map((yy, r) =>
          [-84, -52, -20, 12, 44, 76].map((xx) => {
            const x = xx + (r % 2) * 16;
            if (Math.abs(x) > 96 - (yy < -460 ? 30 : 0)) return null;
            return <path key={`${r}_${xx}`} d={`M ${x - 9} ${yy + 7} Q ${x} ${yy - 4} ${x + 9} ${yy - 7}`} stroke={o.motif ?? '#C99A4B'} strokeWidth={sw * 0.75} fill="none" strokeLinecap="round" />;
          }),
        )}
        <path d="M -34 -430 L 0 -408 L 34 -430" stroke={K} strokeWidth={sw * 0.8} fill={cs} strokeLinejoin="round" />
        <path d={D} fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      </g>
    );
  }
  if (o.hat === 'kuluk') {
    const c = o.hatCol ?? '#24315C', cs = o.hatSh ?? '#18213F';
    return (
      <g>
        <path d="M -104 -436 L -84 -586 Q -80 -640 0 -644 Q 80 -640 84 -586 L 104 -436 Z" fill={c} />
        <path d="M 46 -436 L 40 -638 Q 80 -630 84 -586 L 104 -436 Z" fill={cs} />
        {[-52, -18, 18, 52].map((x) => <path key={x} d={`M ${x * 1.15} -470 L ${x * 0.82} -612`} stroke={BB.goldSh} strokeWidth={sw * 0.9} strokeLinecap="round" />)}
        <path d="M -104 -436 L -84 -586 Q -80 -640 0 -644 Q 80 -640 84 -586 L 104 -436 Z" fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
        <path d={rp(-112, -470, 224, 38, 10)} fill={BB.gold} stroke={K} strokeWidth={sw} />
        {[-72, -36, 0, 36, 72].map((x) => <circle key={x} cx={x} cy={-451} r={6} fill={BB.goldSh} />)}
        <path d="M 0 -606 L 34 -556 L 0 -504 L -34 -556 Z" fill={BB.gold} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
        <circle cx={0} cy={-556} r={11} fill={BB.red} stroke={K} strokeWidth={sw * 0.6} />
        <circle cx={0} cy={-650} r={14} fill={BB.gold} stroke={K} strokeWidth={sw * 0.8} />
      </g>
    );
  }
  if (o.hat === 'morion') {
    const m = o.hatCol ?? BB.metal, ms = o.hatSh ?? BB.metalSh;
    return (
      <g>
        <path d="M -78 -494 Q 0 -612 78 -494 Z" fill={m} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M 20 -566 Q 60 -540 78 -494 L 40 -494 Q 36 -530 20 -566 Z" fill={ms} />
        <path d="M -112 -428 Q -114 -510 0 -514 Q 114 -510 112 -428 Z" fill={m} />
        <path d="M 56 -500 Q 112 -480 112 -430 L 76 -430 Q 78 -474 56 -500 Z" fill={ms} />
        <path d="M -82 -462 Q -72 -488 -36 -498" stroke={BB.metalHi} strokeWidth={sw * 1.5} fill="none" strokeLinecap="round" />
        <path d="M -112 -428 Q -114 -510 0 -514 Q 114 -510 112 -428 Z" fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M -182 -414 Q -176 -456 -128 -438 L 128 -438 Q 176 -456 182 -414 Q 152 -400 120 -414 L -120 -414 Q -152 -400 -182 -414 Z" fill={ms} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
        {[-90, -45, 0, 45, 90].map((x) => <circle key={x} cx={x} cy={-426} r={5} fill={BB.metalHi} stroke={K} strokeWidth={sw * 0.4} />)}
      </g>
    );
  }
  if (o.hat === 'dutch') {
    const c = o.hatCol ?? '#2B2622', band = o.hatSh ?? '#8A6A3A';
    return (
      <g>
        <ellipse cx={0} cy={-440} rx={196} ry={36} fill={c} stroke={K} strokeWidth={sw} />
        <path d="M -88 -444 L -80 -586 Q 0 -602 80 -586 L 88 -444 Q 0 -432 -88 -444 Z" fill={c} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M -88 -444 L -86 -476 Q 0 -488 86 -476 L 88 -444 Q 0 -432 -88 -444 Z" fill={band} stroke={K} strokeWidth={sw * 0.8} strokeLinejoin="round" />
        <path d="M -150 -446 Q -60 -470 40 -462" stroke="#4A433C" strokeWidth={sw * 1.4} fill="none" strokeLinecap="round" />
        {o.feather && <path d="M 70 -470 Q 170 -540 128 -640 Q 150 -560 92 -478 Z" fill={o.feather} stroke={K} strokeWidth={sw * 0.8} strokeLinejoin="round" />}
      </g>
    );
  }
  if (o.hat === 'laurel' || o.hat === 'crown') {
    const sway = Math.sin(t * 2.6) * 2;
    return (
      <g>
        <path d={HAIR} fill={hair} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
        {o.hat === 'laurel' &&
          Array.from({length: 11}, (_, i) => {
            const a = Math.PI * (1.08 + (i / 10) * 0.84);
            const x = Math.cos(a) * 128, y = -392 + Math.sin(a) * 92;
            const rot = (a * 180) / Math.PI + 90 + (i < 5 ? -28 : i > 5 ? 28 : 0) + sway;
            return <ellipse key={i} cx={x} cy={y} rx={27} ry={12} fill={i % 2 ? '#5FA650' : '#7EC163'} stroke={K} strokeWidth={sw * 0.7} transform={`rotate(${rot} ${x} ${y})`} />;
          })}
        {o.hat === 'crown' && <Crown sw={sw} />}
      </g>
    );
  }
  return null;
};

/** Gold crown sitting on the head top (origin = head-local). */
export const Crown: React.FC<{sw: number}> = ({sw}) => (
  <g>
    <path d="M -84 -478 L -96 -562 L -48 -520 L 0 -584 L 48 -520 L 96 -562 L 84 -478 Z" fill={BB.gold} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    <path d="M 40 -514 L 48 -520 L 96 -562 L 84 -478 L 52 -478 Z" fill={BB.goldSh} />
    <path d="M -84 -478 L -96 -562 L -48 -520 L 0 -584 L 48 -520 L 96 -562 L 84 -478 Z" fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    <path d={rp(-90, -498, 180, 34, 10)} fill={BB.goldSh} stroke={K} strokeWidth={sw} />
    <circle cx={0} cy={-481} r={11} fill={BB.red} stroke={K} strokeWidth={sw * 0.7} />
    {[-50, 50].map((x) => <circle key={x} cx={x} cy={-481} r={8} fill={BB.blue} stroke={K} strokeWidth={sw * 0.6} />)}
    {[-96, 0, 96].map((x, i) => <circle key={x} cx={x} cy={[-566, -590, -566][i]} r={10} fill={BB.gold} stroke={K} strokeWidth={sw * 0.7} />)}
  </g>
);

const TORSO: Pt[] = [[-74, -262], [74, -262], [90, -92], [-90, -92]];
const TORSO_MAIN: Pt[] = [[-74, -262], [-74 + 148 * 0.68, -262], [-90 + 180 * 0.68, -92], [-90, -92]];
const hwAt = (y: number) => lerp(74, 90, (y + 262) / 170);

// ---------- costume lego (v1.13) ----------
// Any period costume is ASSEMBLED, not drawn: Outfit.hat and Outfit.garb take a spec object as well as the named classics
// above. Parts are front views in head-local coords (head circle r 120 at (0,-374); hat band line y = -430). Ready
// combinations live in costumes.tsx (COSTUMES + costume()). Research the period first (casting sheet), then pick parts.

/** Darker tone of a #RRGGBB colour (cel shade when no explicit shade colour is given). */
export const shade = (hex: string, k = 0.78) => {
  const n = parseInt(hex.slice(1, 7), 16);
  const c = (v: number) => Math.round(v * k);
  return '#' + ((1 << 24) | (c((n >> 16) & 255) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).slice(1).toUpperCase();
};

export type HatSpec = {
  /** crown silhouette — dome: helmet, felt cap, pith/steel helmet (+brim) · cyl: shako, peci, kepi, top hat (taper) ·
   * cone: pointed cap, makuta, caping (big w, small h) · cap: soft field cap · wrap: turban · bun: hair knot/gelung ·
   * crescent: bicorne worn sideways · none: headband only (band + tail) */
  shape: 'dome' | 'cyl' | 'cone' | 'cap' | 'wrap' | 'bun' | 'crescent' | 'none';
  col: string; sh?: string;
  /** crown height above the band line (px) · width factor (1 = head) · cyl top/bottom width ratio (>1 flares out) */
  h?: number; w?: number; taper?: number;
  /** brim reach beyond the crown (px) */ brim?: number; brimCol?: string;
  /** band at the crown base (crescent: edge trim) */ band?: string;
  /** rolled fur brim at the base */ fur?: string;
  /** front visor colour */ peak?: string;
  top?: 'pom' | 'plume' | 'feather' | 'spike' | 'tassel' | 'horns' | 'crest' | 'jewel'; topCol?: string;
  badge?: 'disc' | 'star' | 'plate' | 'diamond'; badgeCol?: string;
  /** hangs behind the head — cloth neck flaps, fur ear flaps, layered neck guard, long veil */
  flaps?: 'cloth' | 'fur' | 'layered' | 'veil'; flapCol?: string;
  /** cloth tail hanging at the back right (turban, headband knot) */ tail?: string;
  /** hair cap under the hat (Outfit.hairCol) */ hair?: boolean;
  /** metal highlight stroke */ shine?: boolean;
};

export type GarbSpec = {
  /** shirt (tunic, jacket, jubah top) · coat (adds coat skirts over trousers) · bare (bare chest, bare arms) */
  top: 'shirt' | 'coat' | 'bare';
  /** pants (legs show, Outfit.pants) · kain (wrap cloth, Outfit.kain + motif = batik) · robe (long; Outfit.kain or top
   * colour) · hakama (pleated split skirt) · skirt (short, legs show) */
  lower: 'pants' | 'kain' | 'robe' | 'hakama' | 'skirt';
  /** armour / quilting drawn over the top */ pattern?: 'lamellar' | 'mail' | 'plates' | 'quilt'; patternCol?: string;
  /** front opening: center line, vee neck, wrap (diagonal overlap: deel, kimono, beskap) — trim colours it */
  open?: 'center' | 'vee' | 'wrap'; trim?: string;
  /** coloured front facings (plastron) */ lapel?: string;
  buttons?: string; double?: boolean;
  /** X crossbelts (18th–19th c. infantry) */ cross?: string;
  /** belt buckle (belt colour = Outfit.belt) */ buckle?: string;
  epaulettes?: string;
  /** wide collar necklace (kalung) · upper-arm bands (kelat bahu) · cuffs · robe hem trim */
  necklace?: string; armlet?: string; cuff?: string; hem?: string;
  /** colour stripes on the left upper arm, top first (e.g. ['#D8433B', '#FFFFFF'] merah putih) */ armband?: string[];
  bareArms?: boolean;
};

const YB = -430;
const HAT_H: Record<HatSpec['shape'], number> = {dome: 95, cyl: 150, cone: 150, cap: 78, wrap: 108, bun: 0, crescent: 95, none: 0};
const hatGeo = (hs: HatSpec) => {
  const w = hs.w ?? (hs.shape === 'wrap' ? 1.1 : 1);
  const cw = 126 * w, H = hs.h ?? HAT_H[hs.shape];
  const top = YB - H;
  switch (hs.shape) {
    case 'dome':
      return {cw, H, top, L: -cw, d: `M ${f1(-cw)} ${YB} C ${f1(-cw)} ${f1(YB - H * 1.33)} ${f1(cw)} ${f1(YB - H * 1.33)} ${f1(cw)} ${YB} Z`};
    case 'cap':
      return {cw, H, top, L: -cw, d: roundPoly([[-cw, YB], [-cw * 0.84, top], [cw * 0.84, top], [cw, YB]], [4, 44, 44, 4])};
    case 'cyl': {
      const tp = hs.taper ?? 1;
      return {cw, H, top, L: -cw * Math.max(1, tp), d: roundPoly([[-cw, YB], [-cw * tp, top], [cw * tp, top], [cw, YB]], [4, 16, 16, 4])};
    }
    case 'cone':
      return {cw, H, top, L: -cw, d: roundPoly([[-cw, YB], [0, top], [cw, YB]], [6, 12, 6])};
    case 'wrap':
      return {
        cw, H, top, L: -cw * 1.08,
        d: `M ${f1(-cw)} ${YB + 6} C ${f1(-cw * 1.16)} ${f1(YB - H * 0.6)} ${f1(-cw * 0.6)} ${top} 0 ${top} C ${f1(cw * 0.6)} ${top} ${f1(cw * 1.16)} ${f1(YB - H * 0.6)} ${f1(cw)} ${YB + 6} Q 0 ${YB - 14} ${f1(-cw)} ${YB + 6} Z`,
      };
    case 'crescent': {
      const W = cw * 1.7;
      return {
        cw: W, H, top: YB + 2 - H * 1.2, L: -W,
        d: `M ${f1(-W)} ${YB + 8} C ${f1(-W * 0.55)} ${f1(YB - H * 1.6)} ${f1(W * 0.55)} ${f1(YB - H * 1.6)} ${f1(W)} ${YB + 8} Q 0 ${YB - 26} ${f1(-W)} ${YB + 8} Z`,
      };
    }
    case 'bun':
      return {cw, H: 0, top: -574, L: -cw, d: ''};
    default:
      return {cw: 114, H: 0, top: YB - 20, L: -114, d: ''};
  }
};

const HatTop: React.FC<{hs: HatSpec; cw: number; H: number; top: number; sw: number; t: number}> = ({hs, cw, H, top, sw, t}) => {
  const tc = hs.topCol ?? BB.gold;
  const sway = Math.sin(t * 2.6) * 3;
  switch (hs.top) {
    case 'pom':
      return <circle cx={0} cy={top - 16} r={24} fill={tc} stroke={K} strokeWidth={sw} />;
    case 'plume':
      return (
        <g>
          <path d={`M 0 ${top + 8} C -38 ${top - 40} -22 ${top - 124} ${f1(sway)} ${top - 154} C 22 ${top - 124} 38 ${top - 40} 0 ${top + 8} Z`} fill={tc} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
          <path d={`M 0 ${top} Q ${f1(sway * 0.5)} ${top - 70} ${f1(sway)} ${top - 140}`} stroke={shade(tc)} strokeWidth={sw * 0.8} fill="none" strokeLinecap="round" />
        </g>
      );
    case 'feather': {
      const x0 = cw * 0.42, y0 = YB - H * 0.5;
      return <path d={`M ${f1(x0)} ${f1(y0)} Q ${f1(x0 + 104)} ${f1(y0 - 74 + sway)} ${f1(x0 + 60)} ${f1(y0 - 176)} Q ${f1(x0 + 82)} ${f1(y0 - 92)} ${f1(x0 + 20)} ${f1(y0 - 6)} Z`} fill={tc} stroke={K} strokeWidth={sw * 0.8} strokeLinejoin="round" />;
    }
    case 'spike':
      return (
        <g>
          <path d={`M -13 ${top + 6} L -13 ${top - 18} L 0 ${top - 76} L 13 ${top - 18} L 13 ${top + 6} Z`} fill={hs.topCol ?? BB.metal} stroke={K} strokeWidth={sw * 0.8} strokeLinejoin="round" />
          <path d={rp(-22, top - 22, 44, 18, 8)} fill={shade(hs.topCol ?? BB.metal)} stroke={K} strokeWidth={sw * 0.7} />
        </g>
      );
    case 'tassel':
      return (
        <g>
          {[-2, -1, 0, 1, 2].map((k) => (
            <path key={k} d={`M ${k * 5} ${top - 2} Q ${f1(k * 20)} ${top - 8} ${f1(k * cw * 0.16)} ${f1(top + H * 0.26)}`} stroke={tc} strokeWidth={sw * 1.5} fill="none" strokeLinecap="round" />
          ))}
          <circle cx={0} cy={top - 10} r={16} fill={tc} stroke={K} strokeWidth={sw * 0.8} />
        </g>
      );
    case 'horns':
      return (
        <g>
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M ${f1(sd * cw * 0.55)} ${f1(YB - H * 0.35)} C ${f1(sd * cw * 1.2)} ${f1(YB - H * 0.3)} ${f1(sd * cw * 1.5)} ${f1(YB - H * 0.9)} ${f1(sd * cw * 1.25)} ${f1(YB - H * 1.6)} C ${f1(sd * cw * 1.18)} ${f1(YB - H * 1.0)} ${f1(sd * cw * 0.95)} ${f1(YB - H * 0.78)} ${f1(sd * cw * 0.5)} ${f1(YB - H * 0.72)} Z`} fill={hs.topCol ?? BB.cream} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
          ))}
        </g>
      );
    case 'crest': {
      const cwc = Math.min(cw, 130) * 0.74;
      return (
        <g>
          <path d={`M ${f1(-cwc)} ${top + 14} Q ${f1(-cwc)} ${top - 84} 0 ${top - 90} Q ${f1(cwc)} ${top - 84} ${f1(cwc)} ${top + 14} Z`} fill={tc} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
          {[-0.5, -0.25, 0, 0.25, 0.5].map((k) => <line key={k} x1={f1(k * cwc)} y1={top + 4} x2={f1(k * cwc * 1.1)} y2={f1(top - 72 + Math.abs(k) * 30)} stroke={K} strokeWidth={sw * 0.45} />)}
        </g>
      );
    }
    case 'jewel':
      return (
        <g>
          <path d={`M 0 ${top - 54} L 20 ${top - 24} L 0 ${top + 6} L -20 ${top - 24} Z`} fill={tc} stroke={K} strokeWidth={sw * 0.8} strokeLinejoin="round" />
          <circle cx={0} cy={top - 24} r={8} fill={BB.red} stroke={K} strokeWidth={sw * 0.5} />
        </g>
      );
    default:
      return null;
  }
};

const Badge: React.FC<{kind: NonNullable<HatSpec['badge']>; x: number; y: number; col: string; sw: number}> = ({kind, x, y, col, sw}) => {
  if (kind === 'star') return <path d={star(x, y, 5, 25, 11)} fill={col} stroke={K} strokeWidth={sw * 0.7} strokeLinejoin="round" />;
  if (kind === 'plate') return <path d={roundPoly([[x - 30, y - 32], [x + 30, y - 32], [x + 34, y + 6], [x, y + 40], [x - 34, y + 6]], 8)} fill={col} stroke={K} strokeWidth={sw * 0.7} />;
  if (kind === 'diamond') return <path d={roundPoly([[x, y - 28], [x + 22, y], [x, y + 28], [x - 22, y]], 5)} fill={col} stroke={K} strokeWidth={sw * 0.7} />;
  return (
    <g>
      <circle cx={x} cy={y} r={22} fill={col} stroke={K} strokeWidth={sw * 0.7} />
      <circle cx={x} cy={y} r={10} fill={shade(col)} />
    </g>
  );
};

/** Lego hat, front layer (drawn over the face). */
const HatLego: React.FC<{hs: HatSpec; o: Outfit; sw: number; t: number}> = ({hs, o, sw, t}) => {
  const {cw, H, top, L, d} = hatGeo(hs);
  const c = hs.col, cs = hs.sh ?? shade(hs.col);
  const hair = o.hairCol ?? '#5B3A24';
  const brimRx = (hs.shape === 'crescent' ? 126 * (hs.w ?? 1) : cw) + (hs.brim ?? 0);
  const badgeX = hs.shape === 'crescent' ? -cw * 0.4 : 0;
  const badgeY = hs.shape === 'bun' ? -500 : hs.shape === 'none' ? YB - 2 : hs.shape === 'crescent' ? YB - H * 0.62 : hs.shape === 'cone' ? YB - H * 0.32 : hs.shape === 'cyl' ? YB - H * 0.5 : YB - H * 0.42;
  const wrapHW = (y: number) => cw * 1.04 * Math.sqrt(Math.max(0, 1 - ((YB - y) / (H * 1.02)) ** 2));
  const pw = Math.min(cw, 130) * 0.9;
  return (
    <g>
      {(hs.hair || hs.shape === 'bun') && <path d={HAIR} fill={hair} stroke={K} strokeWidth={sw} strokeLinejoin="round" />}
      {hs.brim ? <ellipse cx={0} cy={YB - 6} rx={brimRx} ry={Math.max(18, brimRx * 0.15)} fill={hs.brimCol ?? cs} stroke={K} strokeWidth={sw} /> : null}
      {hs.shape === 'bun' && (
        <g>
          <circle cx={0} cy={-528} r={46 * (hs.w ?? 1)} fill={hair} stroke={K} strokeWidth={sw} />
          <path d={`M -26 -552 Q -14 -566 6 -568`} stroke={shade(hair, 1.35)} strokeWidth={sw * 1.2} fill="none" strokeLinecap="round" />
          {hs.band && <path d={rp(-44, -502, 88, 24, 10)} fill={hs.band} stroke={K} strokeWidth={sw * 0.8} />}
        </g>
      )}
      {d && (
        <g>
          <path d={d} fill={cs} />
          <path d={d} fill={c} transform={`translate(${f1(L)} 0) scale(0.7 1) translate(${f1(-L)} 0)`} />
          {hs.shape === 'wrap' &&
            [0, 1, 2, 3].map((i) => {
              const y1 = YB - 4 - i * 26, y2 = y1 - 36;
              if (wrapHW(y2) < 30) return null;
              return <path key={i} d={`M ${f1(-wrapHW(y1) * 0.92)} ${y1} Q 0 ${y1 - 2} ${f1(wrapHW(y2) * 0.92)} ${y2}`} stroke={K} strokeWidth={sw * 0.6} fill="none" strokeLinecap="round" />;
            })}
          {hs.shine && <path d={`M ${f1(-cw * 0.7)} ${f1(YB - H * 0.28)} Q ${f1(-cw * 0.58)} ${f1(YB - H * 0.7)} ${f1(-cw * 0.24)} ${f1(YB - H * 0.86)}`} stroke={BB.metalHi} strokeWidth={sw * 1.5} fill="none" strokeLinecap="round" />}
          {hs.shape === 'crescent' && hs.band && <path d={d} fill="none" stroke={hs.band} strokeWidth={sw * 1.6} transform={`translate(0 ${YB}) scale(0.92) translate(0 ${-YB})`} />}
          <path d={d} fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
        </g>
      )}
      {hs.band && hs.shape === 'none' && <path d={rp(-118, YB - 40, 236, 42, 16)} fill={hs.band} stroke={K} strokeWidth={sw} />}
      {hs.band && hs.shape !== 'none' && hs.shape !== 'bun' && hs.shape !== 'crescent' && <path d={rp(-cw - 4, YB - 26, cw * 2 + 8, 28, 8)} fill={hs.band} stroke={K} strokeWidth={sw * 0.8} />}
      {hs.fur && (
        <g>
          <path d={rp(-cw - 16, YB - 34, cw * 2 + 32, 46, 23)} fill={hs.fur} stroke={K} strokeWidth={sw} />
          {Array.from({length: Math.floor((cw * 2) / 26)}, (_, i) => {
            const x = -cw + 8 + i * 26;
            return <path key={i} d={`M ${f1(x - 8)} ${YB - 8} q 8 9 16 0`} stroke={shade(hs.fur!)} strokeWidth={sw * 0.7} fill="none" strokeLinecap="round" />;
          })}
        </g>
      )}
      {hs.peak && <path d={`M ${f1(-pw)} ${YB + 2} Q 0 ${YB + 40} ${f1(pw)} ${YB + 2} Q 0 ${YB + 16} ${f1(-pw)} ${YB + 2} Z`} fill={hs.peak} stroke={K} strokeWidth={sw} strokeLinejoin="round" />}
      {hs.badge && <Badge kind={hs.badge} x={badgeX} y={badgeY} col={hs.badgeCol ?? BB.gold} sw={sw} />}
      <HatTop hs={hs} cw={cw} H={H} top={top} sw={sw} t={t} />
    </g>
  );
};

/** Lego hat, back layer (drawn behind the head). */
const HatLegoBack: React.FC<{hs: HatSpec; sw: number}> = ({hs, sw}) => {
  const {cw} = hatGeo(hs);
  const hw = hs.shape === 'crescent' ? 126 * (hs.w ?? 1) : cw;
  const fc = hs.flapCol ?? hs.fur ?? hs.col;
  return (
    <g>
      {hs.flaps === 'cloth' && [-1, 1].map((sd) => (
        <g key={sd}>
          <path d={roundPoly([[sd * hw * 0.6, YB], [sd * (hw + 6), YB], [sd * (hw + 30), -294], [sd * hw * 0.6, -294]], 6)} fill={fc} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
          <line x1={sd * (hw - 4)} y1={YB + 14} x2={sd * (hw + 12)} y2={-300} stroke={shade(fc)} strokeWidth={sw * 0.8} />
        </g>
      ))}
      {hs.flaps === 'fur' && [-1, 1].map((sd) => <path key={sd} d={rp(sd * (hw - 6) - 30, YB - 10, 60, 120, 28)} fill={fc} stroke={K} strokeWidth={sw} />)}
      {hs.flaps === 'layered' && (
        <g>
          <path d={roundPoly([[-hw - 2, YB - 6], [hw + 2, YB - 6], [hw + 72, -294], [-hw - 72, -294]], [6, 6, 14, 14])} fill={fc} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
          {[0.3, 0.55, 0.8].map((k) => {
            const y = lerp(YB - 6, -294, k), x = hw + 2 + 70 * k;
            return <line key={k} x1={-x} y1={y} x2={x} y2={y} stroke={K} strokeWidth={sw * 0.6} />;
          })}
        </g>
      )}
      {hs.flaps === 'veil' && <path d={roundPoly([[-hw - 6, YB - 10], [hw + 6, YB - 10], [hw + 40, -236], [-hw - 40, -236]], [10, 10, 20, 20])} fill={fc} stroke={K} strokeWidth={sw} strokeLinejoin="round" />}
      {hs.tail && (
        <path d={`M ${f1(hw * 0.62)} ${YB - 24} C ${f1(hw * 0.98)} ${YB + 10} ${f1(hw + 52)} -340 ${f1(hw + 36)} -276 L ${f1(hw + 4)} -284 C ${f1(hw + 14)} -338 ${f1(hw * 0.82)} ${YB + 18} ${f1(hw * 0.5)} ${YB - 8} Z`} fill={hs.tail} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      )}
    </g>
  );
};

/** Far-army hat silhouette: fill only, no outline (far layers never carry ink). */
export const HatSil: React.FC<{hs: HatSpec; col?: string}> = ({hs, col}) => {
  const {cw, top, d} = hatGeo(hs);
  const c = col ?? hs.col;
  const brimRx = (hs.shape === 'crescent' ? 126 * (hs.w ?? 1) : cw) + (hs.brim ?? 0);
  return (
    <g fill={c}>
      {hs.brim ? <ellipse cx={0} cy={YB - 6} rx={brimRx} ry={Math.max(18, brimRx * 0.15)} /> : null}
      {hs.shape === 'bun' ? <g><path d={HAIR} /><circle cx={0} cy={-528} r={46} /></g> : d ? <path d={d} /> : <path d={rp(-116, YB - 16, 232, 32, 14)} />}
      {hs.fur && <path d={rp(-cw - 16, YB - 34, cw * 2 + 32, 46, 23)} fill={hs.fur} />}
      {(hs.top === 'pom' || hs.top === 'tassel') && <circle cx={0} cy={top - 14} r={24} fill={hs.topCol ?? c} />}
      {hs.top === 'plume' && <ellipse cx={0} cy={top - 70} rx={24} ry={76} fill={hs.topCol ?? c} />}
      {hs.top === 'spike' && <path d={`M -14 ${top + 4} L 0 ${top - 76} L 14 ${top + 4} Z`} />}
    </g>
  );
};

/** Garb lego: details over the torso (pattern, opening, facings, buttons, crossbelts, belt, necklace). */
const GarbTop: React.FC<{gs: GarbSpec; o: Outfit; sw: number; over?: boolean}> = ({gs, o, sw, over}) => {
  const pc = gs.patternCol ?? K;
  const rows = (y0: number, y1: number, step: number) => Array.from({length: Math.floor((y1 - y0) / step) + 1}, (_, i) => y0 + i * step);
  const trimStripe = (dd: string) => (
    <g>
      <path d={dd} stroke={K} strokeWidth={sw * 3.4} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d={dd} stroke={gs.trim ?? BB.gold} strokeWidth={sw * 2.2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );
  if (over) {
    // drawn over sashes / bandoliers
    return gs.necklace ? (
      <g>
        <path d="M -70 -262 Q 0 -164 70 -262 Q 0 -236 -70 -262 Z" fill={gs.necklace} stroke={K} strokeWidth={sw * 0.7} strokeLinejoin="round" />
        {[-0.6, -0.3, 0, 0.3, 0.6].map((k) => {
          const u = (k * 60 + 70) / 140;
          return <circle key={k} cx={k * 60} cy={-262 + 122 * u * (1 - u)} r={k === 0 ? 9 : 5} fill={k === 0 ? BB.red : shade(gs.necklace!)} />;
        })}
      </g>
    ) : null;
  }
  return (
    <g>
      {gs.top === 'bare' && (
        // skin cues so a bare chest never reads as a white shirt: two chest arcs + a navel
        <g stroke={K} strokeWidth={sw * 0.5} fill="none" strokeLinecap="round">
          {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 12} -196 Q ${sd * 36} -178 ${sd * 56} -200`} />)}
          <path d="M -6 -146 Q 0 -140 6 -146" />
        </g>
      )}
      {gs.pattern === 'lamellar' &&
        rows(-238, -112, 24).map((y) => {
          const hw = hwAt(y) - 10;
          return (
            <g key={y}>
              <line x1={-hw} y1={y} x2={hw} y2={y} stroke={pc} strokeWidth={sw * 0.55} />
              {Array.from({length: Math.floor((hw * 2) / 18)}, (_, i) => <line key={i} x1={-hw + 9 + i * 18} y1={y} x2={-hw + 9 + i * 18} y2={y + 20} stroke={pc} strokeWidth={sw * 0.4} />)}
            </g>
          );
        })}
      {gs.pattern === 'mail' &&
        rows(-236, -110, 18).map((y, r) => {
          const hw = hwAt(y) - 12;
          return Array.from({length: Math.floor((hw * 2) / 20)}, (_, i) => {
            const x = -hw + 10 + i * 20 + (r % 2) * 10;
            return x > hw ? null : <path key={`${y}_${i}`} d={`M ${x - 9} ${y} Q ${x} ${y + 10} ${x + 9} ${y}`} stroke={pc} strokeWidth={sw * 0.45} fill="none" />;
          });
        })}
      {gs.pattern === 'plates' && rows(-226, -118, 30).map((y) => <path key={y} d={`M ${f1(-hwAt(y) + 3)} ${y} Q 0 ${y + 12} ${f1(hwAt(y) - 3)} ${y}`} stroke={pc} strokeWidth={sw * 0.6} fill="none" />)}
      {gs.pattern === 'quilt' && [-54, -27, 27, 54].map((x) => <line key={x} x1={x} y1={-250} x2={x * 1.15} y2={-100} stroke={pc} strokeWidth={sw * 0.4} />)}
      {gs.lapel && [-1, 1].map((sd) => <path key={sd} d={roundPoly([[sd * 48, -262], [sd * 8, -262], [sd * 8, -122], [sd * 40, -122]], 4)} fill={gs.lapel} stroke={K} strokeWidth={sw * 0.6} />)}
      {gs.open === 'center' && (gs.trim ? trimStripe('M 0 -256 L 0 -104') : <line x1={0} y1={-254} x2={0} y2={-100} stroke={K} strokeWidth={sw * 0.5} />)}
      {gs.open === 'vee' && (gs.trim ? trimStripe('M -40 -262 L 0 -208 L 40 -262') : <path d="M -36 -262 L 0 -214 L 36 -262" stroke={K} strokeWidth={sw * 0.6} fill="none" />)}
      {gs.open === 'wrap' && trimStripe('M -42 -258 L 50 -152 L 50 -100')}
      {gs.buttons &&
        (gs.double || gs.lapel ? [-22, 22] : [gs.open === 'wrap' ? 64 : 0]).map((x) =>
          [-232, -204, -176, -148].map((y) => <circle key={`${x}_${y}`} cx={x} cy={y} r={6} fill={gs.buttons} stroke={K} strokeWidth={sw * 0.4} />),
        )}
      {gs.cross && (
        <g>
          {[-1, 1].map((sd) => <path key={sd} d={roundPoly([[sd * -74, -262], [sd * -46, -262], [sd * 90, -128], [sd * 90, -100]], 5)} fill={gs.cross} stroke={K} strokeWidth={sw * 0.6} strokeLinejoin="round" />)}
          <circle cx={0} cy={-204} r={15} fill={gs.buckle ?? BB.metal} stroke={K} strokeWidth={sw * 0.6} />
        </g>
      )}
      {o.belt && <path d={rp(-hwAt(-118) + 2, -122, hwAt(-118) * 2 - 4, 20, 4)} fill={o.belt} stroke={K} strokeWidth={sw * 0.7} />}
      {o.belt && gs.buckle && !gs.cross && <path d={rp(-14, -125, 28, 26, 5)} fill={gs.buckle} stroke={K} strokeWidth={sw * 0.7} />}
    </g>
  );
};

/** Garb lego: lower body (kain / robe / hakama / skirt, or coat skirts over trousers). Drawn before the torso. */
const GarbLower: React.FC<{gs: GarbSpec; o: Outfit; sw: number}> = ({gs, o, sw}) => {
  if (gs.lower === 'pants') {
    if (gs.top !== 'coat') return null;
    return (
      <g>
        <path d={roundPoly([[-90, -114], [-6, -114], [-12, -54], [-98, -62]], [4, 4, 8, 12])} fill={o.col} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
        <path d={roundPoly([[90, -114], [6, -114], [12, -54], [98, -62]], [4, 4, 8, 12])} fill={o.colSh} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      </g>
    );
  }
  const lc = o.kain ?? o.col, ls = o.kainSh ?? (o.kain ? shade(o.kain) : o.colSh);
  const bot = gs.lower === 'skirt' ? -60 : -24, wb = gs.lower === 'skirt' ? 98 : 104;
  const shape = roundPoly([[-90, -110], [90, -110], [wb, bot], [-wb, bot]], [4, 4, 16, 16]);
  return (
    <g>
      <path d={shape} fill={ls} />
      <path d={roundPoly([[-90, -110], [40, -110], [48, bot], [-wb, bot]], [4, 0, 0, 16])} fill={lc} />
      {gs.lower === 'kain' && o.motif && [-90, -66, -42].map((yy, r) =>
        [-74, -44, -14, 16, 46, 76].map((xx) => {
          const x = xx + (r % 2) * 14;
          if (Math.abs(x) > 82) return null;
          return <path key={`${r}_${xx}`} d={`M ${x - 9} ${yy + 8} Q ${x} ${yy - 4} ${x + 9} ${yy - 8}`} stroke={o.motif} strokeWidth={sw * 0.7} fill="none" strokeLinecap="round" />;
        }),
      )}
      {gs.lower === 'kain' && [-46, 4].map((xx) => <path key={xx} d={`M ${xx} -100 Q ${xx + 6} -64 ${xx - 2} -30`} stroke={K} strokeWidth={sw * 0.5} fill="none" strokeLinecap="round" />)}
      {(gs.lower === 'hakama' || gs.lower === 'skirt') && [-62, -32, 32, 62].map((xx) => <line key={xx} x1={xx} y1={-106} x2={xx * 1.12} y2={bot + 2} stroke={K} strokeWidth={sw * 0.45} />)}
      {gs.lower === 'hakama' && <line x1={0} y1={-72} x2={0} y2={bot} stroke={K} strokeWidth={sw * 0.8} />}
      {gs.lower === 'robe' && gs.open === 'wrap' && <path d={`M 50 -112 L 56 ${bot + 2}`} stroke={gs.trim ?? BB.gold} strokeWidth={sw * 2.2} fill="none" />}
      {gs.hem && <path d={rp(-wb + 2, bot - 18, wb * 2 - 4, 18, [0, 0, 14, 14])} fill={gs.hem} />}
      <path d={shape} fill="none" stroke={K} strokeWidth={sw} />
    </g>
  );
};

/** Garb lego: bands on the arm (drawn inside the rotated arm group, sleeve-local coords). */
const ArmTrim: React.FC<{gs: GarbSpec; side: -1 | 1; sw: number}> = ({gs, side, sw}) => (
  <g>
    {gs.armlet && <path d={rp(-22, 16, 44, 16, 6)} fill={gs.armlet} stroke={K} strokeWidth={sw * 0.6} />}
    {gs.armband && side < 0 && gs.armband.map((c, i) => <rect key={i} x={-21} y={12 + i * 15} width={42} height={15} fill={c} stroke={K} strokeWidth={sw * 0.5} />)}
    {gs.cuff && <path d={rp(-22, 74, 44, 20, 6)} fill={gs.cuff} stroke={K} strokeWidth={sw * 0.6} />}
  </g>
);

/** Round-head chibi character. Origin = between the feet; ~510 px tall at s=1 (crest adds ~100). Arm angles in degrees,
 * 0 = hanging, 90 = straight out sideways, 160 = up. `holdR` is drawn in the right hand, kept upright (+holdRRot). */
export const Tokoh: React.FC<{
  t: number; x: number; y: number; s?: number; o: Outfit; mood?: Mood; armL?: number; armR?: number; legs?: number; lean?: number;
  sx?: number; sy?: number; seed?: number; lx?: number; ly?: number; talk?: number; sweat?: boolean; tear?: number; headTilt?: number;
  flip?: boolean; holdR?: React.ReactNode; holdRRot?: number; holdL?: React.ReactNode; holdLRot?: number; shield?: Shield; brow?: number; noBlink?: boolean;
  /** load carried on top of the head (origin = head top), drawn over the hat */ onHead?: React.ReactNode;
  /** walk cycle (v1.13): step −1..1 lifts one foot (use walk()), hop = body lift in px at s 1 */ step?: number; hop?: number;
}> = ({
  t, x, y, s = 1, o, mood = 'neutral', armL = 6, armR = 6, legs = 0, lean = 0, sx = 1, sy = 1, seed = 1, lx = 0, ly = 0, talk = 0,
  sweat, tear = 0, headTilt = 0, flip, holdR, holdRRot = 0, holdL, holdLRot = 0, shield, brow = 0, noBlink, onHead, step = 0, hop = 0,
}) => {
  const sw = 7 / s;
  const head = o.head ?? BB.head, headSh = o.headSh ?? BB.headSh;
  // HALUS full (v1.16): idle squash/stretch from the feet + head sway + livelier breathing bob, soft contact shadow
  const halus = useHalus('BABAD').full;
  const idle = halusIdle(t, seed, halus);
  sx *= idle.sx;
  sy *= idle.sy;
  headTilt += idle.head;
  const bob = Math.sin(t * 3 + seed * 1.7) * 2.5 * (halus ? 1.6 : 1);
  const bl = noBlink || mood === 'proud' ? 1 : blinkAt(t, seed);
  const capeSway = Math.sin(t * 2.2 + seed) * 8;
  const textFlip = flip ? -1 : 1;
  const sleeve = o.col;
  const arm = (side: -1 | 1, ang: number, hold?: React.ReactNode, holdRot = 0) => {
    const a = side < 0 ? ang : -ang;
    return (
      <g transform={`translate(${side * 70} -238) rotate(${a})`}>
        <path d={rp(-20, -16, 40, 132, 20)} fill={sleeveCol} stroke={K} strokeWidth={sw} />
        {gs && <ArmTrim gs={gs} side={side} sw={sw} />}
        {hold && <g transform={`translate(0 116) rotate(${-a - lean + holdRot})`}>{hold}</g>}
        <circle cx={0} cy={116} r={24} fill={head} stroke={K} strokeWidth={sw} />
      </g>
    );
  };
  const lift = (side: -1 | 1) => Math.max(0, side * step) * 34;
  const leg = (side: -1 | 1) => (
    <g transform={step ? `translate(0 ${-lift(side)}) rotate(${side * legs} ${side * 30} -100)` : `rotate(${side * legs} ${side * 30} -100)`}>
      <path d={rp(side < 0 ? -52 : 12, -108, 40, 96, 14)} fill={o.pants ?? BB.pants} stroke={K} strokeWidth={sw} />
      <ellipse cx={side * 34} cy={-12} rx={33} ry={17} fill={o.boot ?? BB.boot} stroke={K} strokeWidth={sw} />
    </g>
  );
  const gs = typeof o.garb === 'object' ? o.garb : null;
  const isRobe = gs ? gs.lower === 'kain' || gs.lower === 'robe' || gs.lower === 'hakama' : o.garb === 'toga' || o.garb === 'jawa' || o.garb === 'royal';
  const bare = gs?.top === 'bare';
  const sleeveCol = gs && (gs.bareArms ?? bare) ? head : o.sleeve ?? sleeve;
  const yBelt = -122;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * sx * (flip ? -1 : 1)} ${s * sy}) rotate(${lean})`}>
      {halus ? <SoftShadow cx={0} cy={2} rx={122} ry={20} op={0.32} ink={K} /> : <ellipse cx={0} cy={0} rx={104} ry={15} fill={K} opacity={0.16} />}
      {o.cape && (
        <path d={`M -66 -252 Q -112 -150 ${-122 + capeSway} -36 L ${118 + capeSway} -36 Q 108 -150 66 -252 Z`} fill={o.cape} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      )}
      {!isRobe && leg(-1)}
      {!isRobe && leg(1)}
      {isRobe && [-1, 1].map((sd) => <ellipse key={sd} cx={sd * 34} cy={-12 - (step ? lift(sd as -1 | 1) : 0)} rx={33} ry={17} fill={o.boot ?? BB.boot} stroke={K} strokeWidth={sw} />)}
      <g transform={`translate(0 ${hop ? bob - hop : bob})`}>
        {o.garb === 'lorica' && (
          <g>
            {Array.from({length: 6}, (_, i) => (
              <path key={i} d={rp(-88 + i * 29.5, -110, 27, 58, [2, 2, 10, 10])} fill={i % 2 ? o.colSh : o.col} stroke={K} strokeWidth={sw * 0.7} />
            ))}
          </g>
        )}
        {gs && <GarbLower gs={gs} o={o} sw={sw} />}
        {!gs && isRobe && (
          <g>
            <path d={roundPoly([[-90, -110], [90, -110], [104, -24], [-104, -24]], [4, 4, 16, 16])} fill={o.kainSh ?? o.colSh} stroke={K} strokeWidth={sw} />
            <path d={roundPoly([[-90, -110], [40, -110], [50, -24], [-104, -24]], [4, 0, 0, 16])} fill={o.kain ?? o.col} />
            {o.kain && [-90, -66, -42].map((yy, r) =>
              [-74, -44, -14, 16, 46, 76].map((xx) => {
                const x = xx + (r % 2) * 14;
                if (Math.abs(x) > 82) return null;
                return <path key={`${r}_${xx}`} d={`M ${x - 9} ${yy + 8} Q ${x} ${yy - 4} ${x + 9} ${yy - 8}`} stroke={o.motif ?? BB.ink} strokeWidth={sw * 0.7} fill="none" strokeLinecap="round" />;
              }),
            )}
            {o.kain && [24, 40, 56].map((xx) => <line key={xx} x1={xx} y1={-108} x2={xx - 6} y2={-26} stroke={K} strokeWidth={sw * 0.5} />)}
            {[-46, 4].map((xx) => <path key={xx} d={`M ${xx} -100 Q ${xx + 6} -64 ${xx - 2} -30`} stroke={K} strokeWidth={sw * 0.5} fill="none" strokeLinecap="round" />)}
            <path d={roundPoly([[-90, -110], [90, -110], [104, -24], [-104, -24]], [4, 4, 16, 16])} fill="none" stroke={K} strokeWidth={sw} />
          </g>
        )}
        {/* torso */}
        <path d={roundPoly(TORSO, [34, 34, 22, 22])} fill={bare ? headSh : o.garb === 'lorica' ? BB.metalSh : o.colSh} />
        <path d={roundPoly(TORSO_MAIN, [34, 0, 0, 22])} fill={bare ? head : o.garb === 'lorica' ? BB.metal : o.col} />
        {gs && <GarbTop gs={gs} o={o} sw={sw} />}
        {o.garb === 'lorica' && (
          <g>
            <path d="M -40 -262 Q 0 -232 40 -262 Z" fill={o.col} stroke={K} strokeWidth={sw * 0.7} strokeLinejoin="round" />
            {[-222, -190, -158, -126].map((yy) => (
              <path key={yy} d={`M ${-hwAt(yy) + 3} ${yy} Q 0 ${yy + 12} ${hwAt(yy) - 3} ${yy}`} stroke={K} strokeWidth={sw * 0.6} fill="none" />
            ))}
          </g>
        )}
        {o.sash && (
          <path d={roundPoly([[-70, -262], [-26, -262], [90, -136], [90, -96]], 6)} fill={o.sash} stroke={K} strokeWidth={sw * 0.8} strokeLinejoin="round" />
        )}
        {o.garb === 'royal' && (
          <g>
            <path d="M -40 -262 Q 0 -230 40 -262" stroke={BB.gold} strokeWidth={sw * 1.2} fill="none" />
            {[-236, -206, -176, -146].map((yy, i) => <circle key={yy} cx={-6 + i * 14} cy={yy} r={7} fill={BB.gold} stroke={K} strokeWidth={sw * 0.5} />)}
            <path d={rp(-hwAt(-112) + 2, -116, hwAt(-112) * 2 - 4, 20, 4)} fill={BB.gold} stroke={K} strokeWidth={sw * 0.7} />
          </g>
        )}
        {o.garb === 'jawa' && (
          <g>
            <path d="M -36 -262 L 0 -214 L 36 -262" stroke={K} strokeWidth={sw * 0.6} fill="none" />
            <path d={rp(-hwAt(-118) + 2, -122, hwAt(-118) * 2 - 4, 22, 4)} fill={o.belt ?? BB.red} stroke={K} strokeWidth={sw * 0.7} />
          </g>
        )}
        {o.garb === 'doublet' && (
          <g>
            <line x1={0} y1={-250} x2={0} y2={-96} stroke={K} strokeWidth={sw * 0.5} />
            {[-224, -194, -164, -134].map((yy) => <circle key={yy} cx={0} cy={yy} r={6} fill={BB.goldSh} stroke={K} strokeWidth={sw * 0.4} />)}
            <path d={rp(-hwAt(-118) + 2, -122, hwAt(-118) * 2 - 4, 18, 4)} fill={o.belt ?? BB.boot} stroke={K} strokeWidth={sw * 0.7} />
          </g>
        )}
        {o.bandolier && (
          <g>
            <path d={roundPoly([[-74, -262], [-44, -262], [90, -120], [90, -94]], 6)} fill={BB.boot} stroke={K} strokeWidth={sw * 0.7} strokeLinejoin="round" />
            {[0.2, 0.4, 0.6, 0.8].map((k) => <rect key={k} x={lerp(-60, 86, k) - 9} y={lerp(-262, -108, k) + 6} width={18} height={26} rx={5} fill={BB.wood} stroke={K} strokeWidth={sw * 0.5} />)}
          </g>
        )}
        {o.garb === 'tunic' && (
          <g>
            <path d={rp(-hwAt(yBelt) + 2, yBelt, hwAt(yBelt) * 2 - 4, 20, 4)} fill={o.belt ?? BB.boot} stroke={K} strokeWidth={sw * 0.7} />
            <path d={rp(-14, yBelt - 3, 28, 26, 5)} fill={BB.gold} stroke={K} strokeWidth={sw * 0.7} />
          </g>
        )}
        {o.emblem && (
          <g transform={`translate(0 -190) scale(${textFlip} 1)`}>
            <text x={0} y={22} textAnchor="middle" fill={o.emblemCol ?? BB.gold} stroke={K} strokeWidth={sw * 1.3} paintOrder="stroke" strokeLinejoin="round" style={{fontFamily: HEAD, fontSize: 70}}>{o.emblem}</text>
          </g>
        )}
        {gs && <GarbTop gs={gs} o={o} sw={sw} over />}
        <path d={roundPoly(TORSO, [34, 34, 22, 22])} fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
        {o.keris && (
          <g>
            <path d="M 46 -132 Q 100 -158 150 -130 Q 100 -118 46 -132 Z" fill={BB.woodHi} stroke={K} strokeWidth={sw * 0.8} strokeLinejoin="round" />
            <path d="M 70 -140 L 76 -196 Q 92 -212 96 -190 L 88 -138 Z" fill={BB.woodSh} stroke={K} strokeWidth={sw * 0.8} strokeLinejoin="round" />
          </g>
        )}
        {o.collar === 'band' && <path d="M -66 -264 L 66 -264 L 46 -224 L 0 -238 L -46 -224 Z" fill="#fff" stroke={K} strokeWidth={sw * 0.8} strokeLinejoin="round" />}
        {/* arms + shield */}
        {arm(-1, armL, holdL, holdLRot)}
        {shield && <ShieldG sh={shield} sw={sw} flip={textFlip} />}
        {arm(1, armR, holdR, holdRRot)}
        {gs?.epaulettes && [-1, 1].map((sd) => (
          <g key={sd}>
            {[-24, -12, 0, 12, 24].map((dx) => <path key={dx} d={rp(sd * 70 + dx - 4, -252, 8, 26, 4)} fill={gs.epaulettes} stroke={K} strokeWidth={sw * 0.4} />)}
            <ellipse cx={sd * 70} cy={-256} rx={36} ry={16} fill={gs.epaulettes} stroke={K} strokeWidth={sw * 0.8} />
          </g>
        ))}
        {o.garb === 'lorica' && [-1, 1].map((sd) => (
          <path key={sd} d={`M ${sd * 70 - 42} -230 A 42 32 0 0 1 ${sd * 70 + 42} -230 Z`} fill={BB.metal} stroke={K} strokeWidth={sw * 0.8} strokeLinejoin="round" />
        ))}
        {o.cape && [-1, 1].map((sd) => <circle key={sd} cx={sd * 56} cy={-250} r={14} fill={BB.gold} stroke={K} strokeWidth={sw * 0.7} />)}
        {o.collar === 'ruff' && (
          <g>
            <ellipse cx={0} cy={-258} rx={124} ry={38} fill="#fff" stroke={K} strokeWidth={sw} />
            {Array.from({length: 14}, (_, i) => {
              const a = (i / 14) * Math.PI * 2;
              return <line key={i} x1={Math.cos(a) * 40} y1={-258 + Math.sin(a) * 12} x2={Math.cos(a) * 118} y2={-258 + Math.sin(a) * 34} stroke={K} strokeWidth={sw * 0.45} />;
            })}
          </g>
        )}
        {/* head */}
        <g transform={`rotate(${headTilt} 0 -252)`}>
          <HatBack o={o} sw={sw} />
          <circle cx={0} cy={-374} r={120} fill={headSh} />
          <circle cx={-14} cy={-384} r={103} fill={head} />
          <circle cx={0} cy={-374} r={120} fill="none" stroke={K} strokeWidth={sw} />
          {(mood === 'happy' || mood === 'grin' || mood === 'proud') && [-1, 1].map((sd) => <ellipse key={sd} cx={sd * 72} cy={-334} rx={17} ry={10} fill={BB.blush} />)}
          {mood === 'proud'
            ? [-42, 42].map((ex) => <path key={ex} d={`M ${ex - 16} ${EY + 4} Q ${ex} ${EY - 14} ${ex + 16} ${EY + 4}`} stroke={K} strokeWidth={sw * 1.2} fill="none" strokeLinecap="round" />)
            : [-42, 42].map((ex) => (
                <Eye key={ex} x={ex} bl={bl} big={mood === 'shock' || mood === 'scared'} lx={lx} ly={ly} lid={mood === 'smug'} head={head} sw={sw} />
              ))}
          {!(o.hat === 'hood' && o.mask) && <Mouth mood={mood} sw={sw} talk={talk} />}
          {o.beard === 'goatee' && <path d="M -22 -294 Q 0 -238 22 -294 Q 0 -280 -22 -294 Z" fill={o.hairCol ?? '#5B3A24'} stroke={K} strokeWidth={sw * 0.7} strokeLinejoin="round" />}
          {o.beard && (
            <path d="M 0 -350 Q -24 -366 -54 -348 Q -30 -338 0 -342 Q 30 -338 54 -348 Q 24 -366 0 -350 Z" fill={o.hairCol ?? '#5B3A24'} stroke={K} strokeWidth={sw * 0.7} strokeLinejoin="round" />
          )}
          <HatFront o={o} sw={sw} t={t} />
          <Brow side={-1} mood={mood} sw={sw} raise={brow} />
          <Brow side={1} mood={mood} sw={sw} raise={brow} />
          {sweat && <path d="M 104 -452 Q 84 -416 104 -404 Q 124 -416 104 -452 Z" fill={BB.sweat} stroke={K} strokeWidth={sw * 0.8} />}
          {tear > 0 && [-1, 1].map((sd) => (
            <path key={sd} d={`M ${sd * 46} ${EY + 18 + tear * 44} q -11 18 0 24 q 11 -6 0 -24 Z`} fill={BB.sweat} stroke={K} strokeWidth={sw * 0.7} />
          ))}
          {onHead && <g transform="translate(0 -480)">{onHead}</g>}
        </g>
      </g>
    </g>
  );
};

/** Walk / run cycle for Tokoh (v1.13): spread into its props — <Tokoh {...walk(t, 2.4, i)} … />. rate = steps per
 * second; run = bigger arm swing + hop. The character still faces the camera; move x yourself. */
export const walk = (t: number, rate = 2.2, seed = 0, run = false) => {
  const ph = (t * rate + seed * 0.37) * Math.PI;
  const st = Math.sin(ph);
  const sw = run ? 46 : 20;
  return {step: st, armL: (run ? 30 : 6) + sw * Math.max(0, -st), armR: (run ? 30 : 6) + sw * Math.max(0, st), hop: Math.abs(Math.cos(ph)) * (run ? 30 : 12)};
};

/** Speech bubble (v1.13): white rounded bubble with an ink outline and a tail toward the speaker; '\n' breaks lines.
 * Pops in at `at`, out at `out`. (x, y) = bubble centre. */
export const Bubble: React.FC<{t: number; at: number; out?: number; x: number; y: number; text: string; size?: number; tail?: 'left' | 'right' | 'down'; col?: string; ink?: string; hot?: string}> = ({
  t, at, out = 999, x, y, text, size = 56, tail = 'down', col = '#fff', ink = K, hot,
}) => {
  const halus = useHalus('BABAD').full; // soft drop shadow under the bubble (HALUS full; needs HalusDefs)
  if (t < at || t > out + 0.2) return null;
  const q = pb(t, at, at + 0.25) * (1 - p(t, out, out + 0.18));
  const lines = text.split('\n');
  const w = Math.max(...lines.map((l) => l.length)) * size * 0.56 + 90, h = lines.length * size * 1.12 + 56;
  const tx = tail === 'left' ? -w * 0.28 : tail === 'right' ? w * 0.28 : 0;
  const tip = tail === 'left' ? -w * 0.42 : tail === 'right' ? w * 0.42 : 0;
  const body = rp(-w / 2, -h / 2, w, h, Math.min(46, h / 2));
  const tailD = `M ${tx - 34} ${h / 2 - 6} L ${tip} ${h / 2 + 64} L ${tx + 34} ${h / 2 - 6} Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${q}) rotate(${Math.sin((t - at) * 3) * 1.2})`}>
      {halus && <path d={body} fill={K} filter="url(#hl-drop)" />}
      <path d={tailD} fill={col} stroke={ink} strokeWidth={9} strokeLinejoin="round" />
      <path d={body} fill={col} stroke={ink} strokeWidth={9} />
      <path d={`M ${tx - 28} ${h / 2 - 4.5} L ${tx + 28} ${h / 2 - 4.5}`} stroke={col} strokeWidth={10} />
      {lines.map((l, i) => (
        <text key={i} x={0} y={(i - (lines.length - 1) / 2) * size * 1.12 + size * 0.36} textAnchor="middle" fill={i === lines.length - 1 && hot ? hot : ink} style={{fontFamily: HEAD, fontSize: size}}>{l}</text>
      ))}
    </g>
  );
};

/** Cartoon brawl cloud (v1.13): a dust ball that churns with fists, boots and stars poking out — the house way to show a
 * fight or an ambush without violence. (x, y) = centre. */
export const FightCloud: React.FC<{t: number; at: number; out?: number; x: number; y: number; r?: number; seed?: number; col?: string; limb?: string; boot?: string}> = ({
  t, at, out = 999, x, y, r = 220, seed = 1, col = '#F1E7D2', limb = BB.head, boot = BB.boot,
}) => {
  if (t < at || t > out + 0.35) return null;
  const q = pb(t, at, at + 0.3) * (1 - p(t, out, out + 0.3));
  const k = t - at;
  const puffs = Array.from({length: 9}, (_, i) => {
    const a = (i / 9) * Math.PI * 2 + k * 2.4 + seed;
    const rr = r * (0.55 + 0.12 * Math.sin(k * 9 + i * 1.7));
    return [Math.cos(a) * r * 0.48, Math.sin(a) * r * 0.36, rr * 0.62] as const;
  });
  const sticks = Array.from({length: 6}, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + Math.sin(k * 7 + i * 2.1 + seed) * 0.45 + seed;
    const ext = (1.05 + 0.28 * Math.sin(k * 13 + i * 3)) * r;
    return {a, ext, foot: i % 2 === 1};
  });
  return (
    <g transform={`translate(${x} ${y}) scale(${q}) translate(${Math.sin(k * 31) * 6} ${Math.cos(k * 27) * 5})`}>
      {sticks.map(({a, ext, foot}, i) => (
        <g key={i} transform={`rotate(${(a * 180) / Math.PI})`}>
          <path d={rp(0, -20, ext, 40, 20)} fill={foot ? BB.pants : limb} stroke={K} strokeWidth={8} />
          {foot ? <ellipse cx={ext} cy={0} rx={36} ry={24} fill={boot} stroke={K} strokeWidth={8} /> : <circle cx={ext} cy={0} r={30} fill={limb} stroke={K} strokeWidth={8} />}
        </g>
      ))}
      {puffs.map(([px, py, pr], i) => <circle key={i} cx={px} cy={py} r={pr} fill={col} stroke={K} strokeWidth={9} />)}
      {puffs.map(([px, py, pr], i) => <circle key={'f' + i} cx={px} cy={py} r={pr - 4.5} fill={col} />)}
      <ellipse cx={0} cy={0} rx={r * 0.62} ry={r * 0.5} fill={col} />
      {[0, 1, 2].map((i) => {
        const kk = ((k * 1.6 + i / 3) % 1);
        const a = seed * 2 + i * 2.1;
        return <path key={'s' + i} d={star(Math.cos(a) * r * (0.5 + kk * 0.7), -r * 0.2 - kk * r * 0.9, 5, 34 * (1 - kk * 0.5), 15 * (1 - kk * 0.5), kk * 3)} fill={BB.gold} stroke={K} strokeWidth={6} strokeLinejoin="round" />;
      })}
    </g>
  );
};

export type Charger = {o: Outfit; hold?: React.ReactNode; holdRot?: number};
/** A rank charging across the ground (v1.13): n characters run from x0 toward x1 between `at` and `at + dur`, kicking dust,
 * staggered in depth. Two Charges toward one point + a FightCloud at the meeting point = a clash. */
export const Charge: React.FC<{t: number; at: number; dur?: number; x0: number; x1: number; y: number; s?: number; n?: number; gap?: number; depth?: number; who: Charger[]; flip?: boolean; seed?: number; mood?: Mood; rate?: number}> = ({
  t, at, dur = 1.2, x0, x1, y, s = 0.5, n = 5, gap = 150, depth = 40, who, flip, seed = 1, mood = 'angry', rate = 3.6,
}) => {
  const dir = x1 > x0 ? 1 : -1;
  const k = p(t, at, at + dur);
  const moving = k > 0 && k < 1;
  const men = Array.from({length: n}, (_, i) => {
    const row = i % 2, col = Math.floor(i / 2);
    const off = -dir * (col * gap + row * gap * 0.5) + (rnd(seed + i * 3.1) - 0.5) * gap * 0.4;
    return {i, row, off, yy: y - row * depth, c: who[(i + seed) % who.length]};
  }).sort((A, B) => A.yy - B.yy);
  // fixed slots (man × 3) so every puff keeps its index — Dust sizes puffs by index
  const puffs: Array<{at: number; x: number; y: number}> = men.flatMap(() => [0, 1, 2].map(() => ({at: -99, x: 0, y: 0})));
  const dusty = t > at && t < at + dur + 0.6;
  if (dusty) {
    const tick = Math.floor((Math.min(t, at + dur) - at) * 5);
    men.forEach((m, mi) => {
      for (let j = 0; j < 3; j++) {
        const n5 = tick - j;
        const ts = at + n5 / 5;
        if (ts < at) continue;
        puffs[mi * 3 + (n5 % 3)] = {at: ts, x: lerp(x0, x1, p(ts, at, at + dur)) + m.off - dir * 90 * s, y: m.yy};
      }
    });
  }
  return (
    <g>
      {dusty && <Dust t={t} trail={puffs} r={60 * s} />}
      {men.map(({i, off, yy, c}) => {
        const g = moving ? walk(t, rate, i + seed, true) : {step: 0, armL: 6, armR: 6, hop: 0};
        return (
          <Tokoh key={i} t={t} x={lerp(x0, x1, k) + off} y={yy} s={s} o={c.o} seed={seed * 7 + i} flip={flip ?? dir < 0} mood={mood} lean={moving ? dir * 6 : 0}
            holdR={c.hold} holdRRot={c.holdRot ?? 0} {...g} armR={c.hold ? (moving ? 70 : 24) : g.armR} />
        );
      })}
    </g>
  );
};

const ShieldG: React.FC<{sh: Shield; sw: number; flip: number}> = ({sh, sw, flip}) => {
  const label = sh.label && (
    <g transform={`scale(${flip} 1)`}>
      <text x={0} y={30} textAnchor="middle" fill={sh.labelCol ?? BB.gold} stroke={K} strokeWidth={sw * 1.4} paintOrder="stroke" strokeLinejoin="round" style={{fontFamily: HEAD, fontSize: sh.label.length > 3 ? 64 : 88}}>{sh.label}</text>
    </g>
  );
  if (sh.kind === 'round') {
    return (
      <g transform="translate(-40 -168)">
        <circle cx={0} cy={0} r={104} fill={sh.colSh} />
        <circle cx={-12} cy={-8} r={88} fill={sh.col} />
        <circle cx={0} cy={0} r={86} fill="none" stroke={sh.rim ?? BB.gold} strokeWidth={sw * 1.2} />
        <circle cx={0} cy={0} r={104} fill="none" stroke={K} strokeWidth={sw} />
        {label ?? <circle cx={0} cy={0} r={24} fill={BB.metal} stroke={K} strokeWidth={sw} />}
      </g>
    );
  }
  return (
    <g transform="translate(-36 -166)">
      <path d={rp(-80, -116, 160, 232, 22)} fill={sh.colSh} />
      <path d={rp(-80, -116, 128, 232, [22, 0, 0, 22])} fill={sh.col} />
      <path d={rp(-66, -102, 132, 204, 12)} fill="none" stroke={sh.rim ?? BB.gold} strokeWidth={sw * 1.1} />
      <path d={rp(-80, -116, 160, 232, 22)} fill="none" stroke={K} strokeWidth={sw} />
      {label}
    </g>
  );
};

// ---------- held props (origin = hand) ----------
export const Spear: React.FC<{len?: number; sw?: number}> = ({len = 520, sw = 7}) => (
  <g>
    <rect x={-8} y={-len * 0.62} width={16} height={len} rx={8} fill={BB.wood} stroke={K} strokeWidth={sw} />
    <path d={`M 0 ${-len * 0.62 - 92} L 22 ${-len * 0.62 - 20} L 0 ${-len * 0.62 + 4} L -22 ${-len * 0.62 - 20} Z`} fill={BB.metal} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
  </g>
);
export const Magnifier: React.FC<{sw?: number}> = ({sw = 7}) => (
  <g transform="rotate(-25)">
    <rect x={-12} y={-20} width={24} height={110} rx={12} fill={BB.wood} stroke={K} strokeWidth={sw} />
    <circle cx={0} cy={-100} r={78} fill={BB.sky2} stroke={K} strokeWidth={sw} />
    <circle cx={0} cy={-100} r={66} fill="none" stroke={BB.gold} strokeWidth={sw * 1.4} />
    <path d="M -40 -130 Q -26 -152 2 -158" stroke="#fff" strokeWidth={sw * 1.6} fill="none" strokeLinecap="round" />
  </g>
);
export const Sack: React.FC<{r?: number; label?: string; col?: string; sw?: number; labelCol?: string}> = ({r = 90, label, col = '#C9A46A', sw = 7, labelCol = K}) => (
  <g>
    <path d={`M ${-r * 0.42} ${-r * 1.62} L ${-r * 0.22} ${-r * 1.28} Q ${-r * 1.1} ${-r * 1.05} ${-r} ${-r * 0.3} Q ${-r * 0.9} 0 0 0 Q ${r * 0.9} 0 ${r} ${-r * 0.3} Q ${r * 1.1} ${-r * 1.05} ${r * 0.22} ${-r * 1.28} L ${r * 0.42} ${-r * 1.62} Z`} fill={col} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    <path d={`M ${r * 0.5} ${-r * 1.0} Q ${r * 0.98} ${-r * 0.7} ${r * 0.8} ${-r * 0.2}`} stroke="#A9854C" strokeWidth={sw * 2.2} fill="none" strokeLinecap="round" />
    <path d={rp(-r * 0.36, -r * 1.36, r * 0.72, r * 0.16, r * 0.06)} fill={BB.boot} stroke={K} strokeWidth={sw * 0.8} />
    {label && <text x={0} y={-r * 0.42} textAnchor="middle" fill={labelCol} style={{fontFamily: HEAD, fontSize: r * 0.78}}>{label}</text>}
  </g>
);
/** Wooden day tablet with a number. */
export const Tablet: React.FC<{label: string; s?: number; rot?: number; sw?: number}> = ({label, s = 1, rot = 0, sw = 7}) => (
  <g transform={`rotate(${rot}) scale(${s})`}>
    <path d={rp(-46, -58, 92, 116, 14)} fill={BB.woodSh} />
    <path d={rp(-46, -58, 78, 116, [14, 0, 0, 14])} fill={BB.woodHi} />
    <path d={rp(-46, -58, 92, 116, 14)} fill="none" stroke={K} strokeWidth={sw / s} />
    <text x={0} y={20} textAnchor="middle" fill={K} style={{fontFamily: HEAD, fontSize: 58}}>{label}</text>
  </g>
);
export const Basket: React.FC<{sw?: number}> = ({sw = 7}) => (
  <g>
    <path d="M -92 -120 L 92 -120 L 74 0 L -74 0 Z" fill="#C79A5C" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    {[-80, -40, 0].map((yy) => <path key={yy} d={`M ${-88 + (yy + 120) * 0.0} ${yy} L ${88} ${yy}`} stroke="#9C7440" strokeWidth={sw * 0.8} />)}
    {[-50, 0, 50].map((xx) => <line key={xx} x1={xx} y1={-116} x2={xx * 0.82} y2={-4} stroke="#9C7440" strokeWidth={sw * 0.8} />)}
    <path d="M -92 -120 L 92 -120 L 74 0 L -74 0 Z" fill="none" stroke={K} strokeWidth={sw} strokeLinejoin="round" />
    <path d={rp(-100, -132, 200, 24, 12)} fill="#B4874B" stroke={K} strokeWidth={sw} />
  </g>
);

// ---------- painted world (no outlines on far layers) ----------
export const Cloud: React.FC<{x: number; y: number; s?: number; col?: string; sh?: string}> = ({x, y, s = 1, col = BB.cloud, sh = BB.cloudSh}) => {
  const C = [[-110, 0, 58], [-40, -36, 76], [50, -26, 68], [122, 6, 50]];
  const shape = (dy: number, c: string) => (
    <g fill={c}>
      {C.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy + dy} r={r} />)}
      <path d={rp(-168, dy - 4, 340, 60, 30)} />
    </g>
  );
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{shape(14, sh)}{shape(0, col)}</g>;
};

/** Smooth rolling band from x0..x1 at baseline y (bumps up by amp), filled down to y+4000. */
export const Hills: React.FC<{y: number; amp: number; col: string; seed?: number; x0?: number; x1?: number; step?: number}> = ({y, amp, col, seed = 1, x0 = -2000, x1 = 3200, step = 260}) => {
  const pts: Pt[] = [];
  for (let x = x0, i = 0; x <= x1; x += step, i++) pts.push([x, y - rnd(seed + i * 1.37) * amp]);
  const d = spline(pts) + ` L ${x1} ${y + 4000} L ${x0} ${y + 4000} Z`;
  return <path d={d} fill={col} />;
};
export const Cypress: React.FC<{x: number; y: number; h: number; col?: string; sh?: string; trunk?: string}> = ({x, y, h, col = BB.cypress, sh, trunk = BB.woodSh}) => {
  const w = h * 0.17;
  return (
    <g>
      <rect x={x - w * 0.12} y={y - h * 0.12} width={w * 0.24} height={h * 0.12} fill={trunk} />
      <path d={`M ${x} ${y - h * 0.08} Q ${x - w * 1.25} ${y - h * 0.5} ${x} ${y - h} Q ${x + w * 1.25} ${y - h * 0.5} ${x} ${y - h * 0.08} Z`} fill={col} />
      {sh && <path d={`M ${x} ${y - h * 0.08} Q ${x + w * 1.25} ${y - h * 0.5} ${x} ${y - h} Q ${x + w * 0.5} ${y - h * 0.5} ${x} ${y - h * 0.08} Z`} fill={sh} />}
    </g>
  );
};
/** Distant town: small houses with terracotta roofs (flat, no outline). */
export const TownFar: React.FC<{x: number; y: number; s?: number; wall?: string; roof?: string; seed?: number; n?: number}> = ({x, y, s = 1, wall = '#EADFC9', roof = '#D9977A', seed = 3, n = 7}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({length: n}, (_, i) => {
      const w = 70 + rnd(seed + i) * 60, h = 50 + rnd(seed + i * 2) * 60;
      const hx = i * 78 - (n * 78) / 2 + rnd(seed + i * 3) * 20;
      const yy = -h - (i % 2) * 14;
      return (
        <g key={i}>
          <rect x={hx} y={yy} width={w} height={h + 20} fill={wall} />
          <path d={`M ${hx - 8} ${yy} L ${hx + w / 2} ${yy - 30} L ${hx + w + 8} ${yy} Z`} fill={roof} />
          <rect x={hx + w * 0.4} y={yy + h * 0.4} width={w * 0.2} height={h * 0.3} fill={roof} opacity={0.55} />
        </g>
      );
    })}
  </g>
);
export const Tufts: React.FC<{x0: number; x1: number; y: number; n: number; seed?: number; col?: string; s?: number}> = ({x0, x1, y, n, seed = 2, col = BB.grassSh, s = 1}) => (
  <g fill={col}>
    {Array.from({length: n}, (_, i) => {
      const x = lerp(x0, x1, rnd(seed + i * 1.9)), yy = y + rnd(seed + i * 2.3) * 120;
      const k = s * (0.7 + rnd(seed + i) * 0.6);
      return <path key={i} d={`M ${x - 22 * k} ${yy} L ${x - 10 * k} ${yy - 30 * k} L ${x - 2 * k} ${yy - 8 * k} L ${x + 8 * k} ${yy - 40 * k} L ${x + 12 * k} ${yy - 8 * k} L ${x + 24 * k} ${yy - 26 * k} L ${x + 22 * k} ${yy} Z`} />;
    })}
  </g>
);
/** Stone wall band with block courses (outlined top edge only). */
export const StoneWall: React.FC<{x0: number; x1: number; top: number; bottom: number; course?: number; seed?: number; sw?: number}> = ({x0, x1, top, bottom, course = 70, seed = 1, sw = 6}) => {
  const rows = Math.ceil((bottom - top) / course);
  return (
    <g>
      <rect x={x0} y={top} width={x1 - x0} height={bottom - top} fill={BB.stone} />
      {Array.from({length: rows}, (_, r) => {
        const yy = top + r * course;
        const off = (r % 2) * 70;
        const xs: number[] = [];
        for (let x = x0 - off; x < x1; x += 120 + rnd(seed + r * 7 + x) * 60) xs.push(x);
        return (
          <g key={r}>
            <line x1={x0} y1={yy} x2={x1} y2={yy} stroke={BB.stoneLine} strokeWidth={sw * 0.8} />
            {xs.map((x, i) => (
              <g key={i}>
                <line x1={x} y1={yy} x2={x} y2={Math.min(bottom, yy + course)} stroke={BB.stoneLine} strokeWidth={sw * 0.8} />
                {rnd(seed + r * 13 + i) > 0.7 && <rect x={x + 10} y={yy + 10} width={60} height={course - 20} rx={6} fill={BB.stoneSh} />}
              </g>
            ))}
          </g>
        );
      })}
      <rect x={x0} y={top - 26} width={x1 - x0} height={30} fill={BB.stoneSh} stroke={K} strokeWidth={sw} />
    </g>
  );
};
/** Round thatched hut (Iron-Age Palatine style). Origin = ground centre. */
export const Hut: React.FC<{x: number; y: number; s?: number; sw?: number; seed?: number}> = ({x, y, s = 1, sw = 6, seed = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={rp(-120, -150, 240, 150, [6, 6, 0, 0])} fill="#D9B98A" stroke={K} strokeWidth={sw / s} />
    <path d={rp(40, -150, 80, 150, [0, 6, 0, 0])} fill="#C5A372" />
    <path d={rp(-120, -150, 240, 150, [6, 6, 0, 0])} fill="none" stroke={K} strokeWidth={sw / s} />
    <path d={rp(-34, -100, 68, 100, [30, 30, 0, 0])} fill={BB.woodSh} stroke={K} strokeWidth={sw / s} />
    <path d="M -156 -136 Q -40 -330 0 -336 Q 40 -330 156 -136 Q 0 -116 -156 -136 Z" fill="#C79A52" stroke={K} strokeWidth={sw / s} strokeLinejoin="round" />
    <path d="M 40 -316 Q 90 -250 156 -136 Q 110 -128 70 -126 Q 60 -230 40 -316 Z" fill="#A87F3E" />
    {[-90, -40, 10, 60].map((xx, i) => <path key={xx} d={`M ${xx} ${-140 - rnd(seed + i) * 6} L ${xx * 0.3} -300`} stroke="#9C743A" strokeWidth={sw * 0.6 / s} />)}
    <path d="M -156 -136 Q -40 -330 0 -336 Q 40 -330 156 -136 Q 0 -116 -156 -136 Z" fill="none" stroke={K} strokeWidth={sw / s} strokeLinejoin="round" />
  </g>
);
export const Torch: React.FC<{x: number; y: number; t: number; s?: number; seed?: number; sw?: number}> = ({x, y, t, s = 1, seed = 1, sw = 6}) => {
  const w1 = Math.sin(t * 7 + seed) * 6, w2 = Math.sin(t * 5.3 + seed * 2) * 5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -16 0 L 16 0 L 8 120 L -8 120 Z" fill={BB.wood} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      <path d={rp(-26, -14, 52, 26, 8)} fill={BB.woodSh} stroke={K} strokeWidth={sw} />
      <path d={`M -30 -12 Q -40 -70 ${-4 + w1} ${-150 + w2} Q 8 -110 24 -120 Q 44 -60 30 -12 Z`} fill={BB.flameSh} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M -18 -14 Q -24 -60 ${2 + w2} ${-112 + w1} Q 10 -84 18 -90 Q 30 -50 20 -14 Z`} fill={BB.flame} />
      <path d={`M -8 -16 Q -10 -44 ${4 + w1 * 0.6} -70 Q 14 -42 10 -16 Z`} fill={BB.flameHi} />
    </g>
  );
};
export const Rays: React.FC<{cx: number; cy: number; r?: number; n?: number; rot?: number; col?: string}> = ({cx, cy, r = 1600, n = 16, rot = 0, col = '#fff'}) => {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = rot + (i / n) * Math.PI * 2, a1 = a0 + Math.PI / n;
    d += `M ${cx} ${cy} L ${f1(cx + Math.cos(a0) * r)} ${f1(cy + Math.sin(a0) * r)} L ${f1(cx + Math.cos(a1) * r)} ${f1(cy + Math.sin(a1) * r)} Z `;
  }
  return <path d={d} fill={col} />;
};

// ---------- scene builders (size themselves: portrait 1080×1920 or landscape 1920×1080 via useFrame) ----------
/**
 * v1.16 scene stack: where scene i (on screen from `from`, next scene at `nextFrom`) is at time t.
 * HALUS off → the classic whip pan (translateX ±(W + 100), 0.24 s, the scene mounted ±0.15 s around the cut).
 * HALUS on (default for BABAD) → zoom-dissolve + slow drift about (fx, fy); the HUD (titles, ribbons, caption) stays
 * still: the outgoing HUD fades out just before the cut, the incoming one fades in just after it. Use:
 *   const A = babadScene(t, {i: 0, from: 0, nextFrom: CUT, W, H}); if (A.show) …
 *   <g transform={A.transform} opacity={A.opacity}><g clipPath>picture</g></g>
 *   <g transform={A.hud} opacity={A.hudOpacity}><g clipPath>Title · Ribbon · BabadCaption</g></g>
 * Impact punch() offsets go inside both groups. Put <HalusDefs ink={BB.ink} /> once in the svg (when useHalus('BABAD').full).
 */
export const babadScene = (t: number, o: {i: number; from: number; nextFrom?: number | null; W: number; H: number; fx?: number; fy?: number; amount?: number}) => {
  const {i, from, nextFrom = null, W, H} = o;
  if (halusLevel('BABAD') !== 'off') {
    const fx = o.fx ?? W / 2, fy = o.fy ?? H * 0.47;
    const start = i === 0 ? -1 : from - 0.16;
    const end = nextFrom === null ? 1e9 : nextFrom + 0.3;
    const {z, px} = halusDrift(t, start, end, i, o.amount ?? 1);
    const d = halusDissolve(t, i === 0 ? null : from, nextFrom);
    // HUD hand-off: the outgoing scene's titles/caption are gone by the cut, the incoming ones fade in after it (no doubles)
    const hudOpacity = (i === 0 ? 1 : pio(t, from, from + 0.28)) * (nextFrom === null ? 1 : 1 - pio(t, nextFrom - 0.16, nextFrom));
    return {show: t > start && t < end, transform: zoomAbout(z * d.z, fx, fy, px), opacity: d.opacity, hud: '', hudOpacity};
  }
  const D = W + 100;
  const q = (a: number) => pio(t, a - 0.12, a + 0.12);
  const tx = (i > 0 ? D * (1 - q(from)) : 0) - (nextFrom !== null ? D * q(nextFrom) : 0);
  const show = (i === 0 || t > from - 0.15) && (nextFrom === null || t < nextFrom + 0.15);
  const tr = `translate(${tx} 0)`;
  return {show, transform: tr, opacity: 1, hud: tr, hudOpacity: 1};
};
/** SVG camera group: world point (pose.x, pose.y) lands at the frame centre. */
export const Cam: React.FC<{pose: Pose; children: React.ReactNode}> = ({pose, children}) => {
  const fr = useFrame();
  return <g transform={`translate(${fr.cx} ${fr.cy}) rotate(${pose.r}) scale(${pose.s}) translate(${-pose.x} ${-pose.y})`}>{children}</g>;
};
/** Clouds drifting right and wrapping around the frame; list = [x, y, scale][]. */
export const Clouds: React.FC<{t: number; list: number[][]; drift?: number}> = ({t, list, drift = 9}) => {
  const {W} = useFrame();
  return <g>{list.map(([x, y, s], i) => <Cloud key={i} x={x + ((t * drift * (1 + i * 0.15)) % (W + 1320)) - 300} y={y} s={s} />)}</g>;
};
/** Impact punch for a scene offset: one damped ~6 Hz wobble per impact (a 14 Hz shake reads as blinking at 60 fps). */
export const punch = (t: number, impacts: number[], amp = 12, dur = 0.35) => {
  let x = 0, y = 0;
  impacts.forEach((at, i) => {
    const k = t - at;
    if (k < 0 || k > dur) return;
    const fall = (1 - k / dur) ** 2;
    x += Math.sin(k * Math.PI * 2 * 6 + i) * amp * fall;
    y += Math.sin(k * Math.PI * 2 * 5 + i * 3) * amp * 0.6 * fall;
  });
  return {x, y};
};
/** Day landscape: sky, drifting clouds, far hills + cypresses, mid hills, grass with tufts. `ground` = grass line. */
export const Field: React.FC<{t: number; ground?: number; sky?: string; grass?: string; seed?: number}> = ({t, ground, sky = BB.sky, grass = BB.grass, seed = 1}) => {
  const fr = useFrame();
  const g = ground ?? fr.pick(1250, 680);
  const clouds = fr.pick([[80, 300, 0.85], [760, 200, 0.7], [1150, 470, 0.9], [420, 620, 0.55]], [[120, 150, 0.7], [700, 90, 0.55], [1250, 210, 0.75], [1750, 110, 0.6]]);
  const trees = fr.pick([[40, g - 140, 200], [980, g - 150, 230]], [[60, g - 140, 190], [1380, g - 150, 210], [1860, g - 140, 200]]);
  return (
    <g>
      <rect x={-3000} y={-3000} width={7000} height={7000} fill={sky} />
      <Clouds t={t} list={clouds} />
      <Hills y={g - 120} amp={130} col={BB.hillFar} seed={seed + 2} />
      {trees.map(([x, y, h], i) => <Cypress key={i} x={x} y={y} h={h} col={BB.cypressFar} />)}
      <Hills y={g - 30} amp={70} col={BB.hillMid} seed={seed + 7} />
      <rect x={-3000} y={g} width={7000} height={3000} fill={grass} />
      <Tufts x0={-200} x1={fr.W + 220} y={g + 30} n={fr.pick(30, 50)} seed={seed + 4} />
    </g>
  );
};
/** Night landscape: stars, moon, two dark hill bands, dark grass. No glow, no gradient. */
export const Night: React.FC<{ground?: number}> = ({ground}) => {
  const fr = useFrame();
  const g = ground ?? fr.pick(1450, 800);
  const sw = fr.W + 220, sh = fr.pick(820, 520);
  const [mx, my] = fr.pick([860, 300], [1600, 170]);
  return (
    <g>
      <rect x={-3000} y={-3000} width={7000} height={7000} fill={BB.night} />
      {Array.from({length: fr.pick(36, 48)}, (_, i) => <circle key={i} cx={rnd(i * 3.1) * sw - 110} cy={rnd(i * 5.7) * sh - 40} r={3 + rnd(i * 1.9) * 4} fill={BB.star} />)}
      <circle cx={mx} cy={my} r={72} fill={BB.moonSh} />
      <circle cx={mx - 12} cy={my - 10} r={64} fill={BB.moon} />
      <Hills y={g - 250} amp={150} col={BB.nightHill2} seed={31} />
      <Hills y={g - 100} amp={90} col={BB.nightHill} seed={37} />
      <rect x={-3000} y={g} width={7000} height={3000} fill="#2B3F3A" />
      <Tufts x0={-200} x1={fr.W + 220} y={g + 20} n={fr.pick(24, 40)} seed={4} col="#22332F" />
    </g>
  );
};
/** Dense far army: rows of tiny round heads with caps and spears (cheap shapes, no rig). cols = body colours, cap = headwear colour (null = bare). */
export const ArmyFar: React.FC<{t: number; y0: number; rows: number; dy?: number; s0?: number; ds?: number; x0?: number; x1?: number; seed?: number; cheer?: number; cols?: string[]; cap?: string | null;
  /** lego hat silhouette instead of the skull cap · what every soldier holds */ hat?: HatSpec; pole?: 'spear' | 'bamboo' | 'gun' | 'none';
}> = ({
  t, y0, rows, dy = 46, s0 = 0.16, ds = 0.025, x0 = -60, x1, seed = 1, cheer = 0, cols = ['#3F5E3B', '#5E4A7A', '#7A4A30', '#2F5A66'], cap = '#5A3B22', hat, pole = 'spear',
}) => {
  const fr = useFrame();
  const xe = x1 ?? fr.W + 60;
  return (
    <g>
      {Array.from({length: rows}, (_, r) => {
        const k = s0 + r * ds;
        const step = 300 * k;
        const y = y0 + r * dy;
        const n = Math.ceil((xe - x0) / step) + 1;
        return (
          <g key={r}>
            {Array.from({length: n}, (_, i) => {
              const x = x0 + i * step + (r % 2) * step * 0.5 + (rnd(seed + r * 31 + i) - 0.5) * step * 0.3;
              const hop = cheer ? -Math.abs(Math.sin(t * 7 + i + r)) * 18 * k * cheer : 0;
              return (
                <g key={i} transform={`translate(${x} ${y + hop}) scale(${k})`}>
                  {pole === 'spear' && <line x1={110} y1={-120} x2={110} y2={-640} stroke={BB.woodSh} strokeWidth={14} />}
                  {pole === 'spear' && <path d="M 110 -700 L 126 -640 L 94 -640 Z" fill={BB.metal} />}
                  {pole === 'bamboo' && <path d="M 102 -110 L 118 -110 L 118 -660 L 102 -700 Z" fill="#8FAE4E" />}
                  {pole === 'gun' && <path d="M 104 -140 L 116 -140 L 116 -600 L 110 -660 L 104 -600 Z" fill="#3A2E28" />}
                  <path d={rp(-90, -270, 180, 180, 40)} fill={cols[(i + r) % cols.length]} />
                  <circle cx={0} cy={-370} r={120} fill={BB.head} />
                  {hat ? <HatSil hs={hat} /> : cap && <path d="M -122 -380 Q -128 -470 0 -500 Q 128 -470 122 -380 Q 60 -420 0 -420 Q -60 -420 -122 -380 Z" fill={cap} />}
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
};
/** Name ribbon: red banner with gold text and notched tails; unrolls at `at`, rolls up at `out`. */
export const Ribbon: React.FC<{t: number; at: number; out?: number; x: number; y: number; text: string; w?: number; size?: number; col?: string}> = ({t, at, out = 999, x, y, text, w, size = 64, col = BB.red}) => {
  if (t < at || t > out + 0.2) return null;
  const q = pb(t, at, at + 0.3) * (1 - p(t, out, out + 0.2));
  const width = w ?? text.length * size * 0.56 + 120;
  return (
    <g transform={`translate(${x} ${y}) scale(${q} 1)`}>
      {[-1, 1].map((sd) => (
        <path key={sd} d={`M ${sd * (width / 2 - 20)} ${-size * 0.5} L ${sd * (width / 2 + 60)} ${-size * 0.5} L ${sd * (width / 2 + 30)} ${size * 0.2} L ${sd * (width / 2 + 60)} ${size * 0.9} L ${sd * (width / 2 - 20)} ${size * 0.9} Z`} fill={BB.redSh} stroke={K} strokeWidth={7} strokeLinejoin="round" />
      ))}
      <path d={rp(-width / 2, -size * 0.7, width, size * 1.4, 12)} fill={col} stroke={K} strokeWidth={7} />
      <text x={0} y={size * 0.34} textAnchor="middle" fill={BB.gold} stroke={K} strokeWidth={size * 0.16} paintOrder="stroke" strokeLinejoin="round" style={{fontFamily: HEAD, fontSize: size, letterSpacing: 2}}>{text}</text>
    </g>
  );
};
/** Rounded label tag with a solid drop shadow (MALARIA, KOLERA, 10.000…); pops in at `at`. */
export const Tag: React.FC<{t: number; at: number; x: number; y: number; text: string; col: string; rot?: number; size?: number; ink?: string}> = ({t, at, x, y, text, col, rot = -6, size = 70, ink = K}) => {
  if (t < at) return null;
  const q = pb(t, at, at + 0.28);
  const w = text.length * size * 0.6 + 70;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${q})`}>
      <path d={rp(-w / 2, -size * 0.75, w, size * 1.5, size * 0.3)} fill={K} transform="translate(0 12)" />
      <path d={rp(-w / 2, -size * 0.75, w, size * 1.5, size * 0.3)} fill={col} stroke={K} strokeWidth={8} />
      <text x={0} y={size * 0.34} textAnchor="middle" fill={ink} style={{fontFamily: HEAD, fontSize: size, letterSpacing: 2}}>{text}</text>
    </g>
  );
};

// ---------- motion graphics ----------
/** Thumbnail-style chunky title word: slams in at `at` (big → 1 with overshoot), shrinks out at `out`. */
export const Title: React.FC<{t: number; at: number; out?: number; x: number; y: number; text: string; size?: number; col?: string; rot?: number; anchor?: 'start' | 'middle' | 'end'}> = ({
  t, at, out = 999, x, y, text, size = 150, col = '#fff', rot = -3, anchor = 'middle',
}) => {
  if (t < at || t > out + 0.2) return null;
  const q = p(t, at, at + 0.16);
  const settle = Math.sin(Math.min(1, (t - at - 0.16) / 0.22) * Math.PI) * (t > at + 0.16 ? 0.05 : 0);
  const o = p(t, out, out + 0.18);
  const sc = lerp(1.7, 1, q) * (1 - settle) * (1 - o);
  const st = {fontFamily: HEAD, fontSize: size, letterSpacing: 1} as const;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot + (1 - q) * 6}) scale(${sc})`} opacity={Math.min(1, q * 2.5)}>
      <text x={0} y={size * 0.1} textAnchor={anchor} fill={K} stroke={K} strokeWidth={size * 0.2} strokeLinejoin="round" style={st}>{text}</text>
      <text x={0} y={0} textAnchor={anchor} fill={col} stroke={K} strokeWidth={size * 0.2} paintOrder="stroke" strokeLinejoin="round" style={st}>{text}</text>
    </g>
  );
};
/** Red rubber stamp: slams from 2.2× to 1×. */
export const Stamp: React.FC<{t: number; at: number; x: number; y: number; text: string; size?: number; rot?: number; col?: string; w?: number}> = ({t, at, x, y, text, size = 90, rot = -12, col = BB.red, w}) => {
  if (t < at) return null;
  const q = p(t, at, at + 0.12, (k) => k * k);
  const width = w ?? text.length * size * 0.6 + size * 0.8;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${lerp(2.2, 1, q)})`} opacity={Math.min(1, q * 3)}>
      <path d={rp(-width / 2, -size * 0.78, width, size * 1.4, size * 0.16)} fill="none" stroke={col} strokeWidth={size * 0.11} />
      <path d={rp(-width / 2 + size * 0.14, -size * 0.64, width - size * 0.28, size * 1.12, size * 0.1)} fill="none" stroke={col} strokeWidth={size * 0.04} />
      <text x={0} y={size * 0.34} textAnchor="middle" fill={col} style={{fontFamily: HEAD, fontSize: size, letterSpacing: 2}}>{text}</text>
    </g>
  );
};
/** Red chunky pointer arrow; tip at (x, y), pointing along `rot` (0 = down). Pops in with q 0..1 and bobs. */
export const Pointer: React.FC<{x: number; y: number; t: number; q: number; rot?: number; s?: number; col?: string}> = ({x, y, t, q, rot = 0, s = 1, col = BB.red}) => {
  if (q <= 0.001) return null;
  const bob = Math.sin(t * 6) * 10;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) translate(0 ${-bob}) scale(${s * q})`}>
      <path d="M 0 0 L -64 -78 L -26 -78 L -34 -230 Q 0 -246 34 -230 L 26 -78 L 64 -78 Z" fill={col} stroke={K} strokeWidth={9} strokeLinejoin="round" />
      <path d="M 20 -228 L 26 -78 L 64 -78 L 40 -52 L 14 -90 Z" fill={BB.redSh} />
      <path d="M 0 0 L -64 -78 L -26 -78 L -34 -230 Q 0 -246 34 -230 L 26 -78 L 64 -78 Z" fill="none" stroke={K} strokeWidth={9} strokeLinejoin="round" />
    </g>
  );
};
/** Question mark that pops (with overshoot) and wobbles. */
export const QMark: React.FC<{t: number; at: number; out: number; x: number; y: number; s?: number; col?: string; text?: string}> = ({t, at, out, x, y, s = 1, col = BB.gold, text = '?'}) => {
  if (t < at || t > out + 0.2) return null;
  const q = pb(t, at, at + 0.25) * (1 - p(t, out, out + 0.18));
  const wob = Math.sin((t - at) * 5) * 8;
  return (
    <g transform={`translate(${x} ${y}) rotate(${wob}) scale(${s * q})`}>
      <text x={0} y={0} textAnchor="middle" fill={col} stroke={K} strokeWidth={22} paintOrder="stroke" strokeLinejoin="round" style={{fontFamily: HEAD, fontSize: 170}}>{text}</text>
    </g>
  );
};
/** Dust puffs kicked up behind a runner (no opacity flicker: circles grow then shrink). */
export const Dust: React.FC<{t: number; trail: Array<{at: number; x: number; y: number}>; r?: number}> = ({t, trail, r = 40}) => (
  <g>
    {trail.map((d, i) => {
      const k = (t - d.at) / 0.6;
      if (k < 0 || k > 1) return null;
      const rr = r * Math.sin(k * Math.PI) * (0.8 + rnd(i) * 0.4);
      const cx = d.x + k * 40, cy = d.y - k * 26;
      return (
        <g key={i}>
          {[[-0.7, 0.2, 0.62], [0, -0.25, 0.8], [0.75, 0.15, 0.55]].map(([ox, oy, rs], j) => (
            <circle key={j} cx={cx + ox * rr} cy={cy + oy * rr} r={rr * rs} fill={BB.cream} stroke={K} strokeWidth={4} />
          ))}
          {[[-0.7, 0.2, 0.62], [0, -0.25, 0.8], [0.75, 0.15, 0.55]].map(([ox, oy, rs], j) => (
            <circle key={'f' + j} cx={cx + ox * rr} cy={cy + oy * rr} r={Math.max(0, rr * rs - 3)} fill={BB.cream} />
          ))}
        </g>
      );
    })}
  </g>
);
/** Flat confetti pieces (gold/red/white). */
export const Confetti: React.FC<{t: number; at: number; x: number; y: number; n?: number; spread?: number; seed?: number}> = ({t, at, x, y, n = 26, spread = 900, seed = 1}) => {
  const k = t - at;
  if (k < 0 || k > 2.6) return null;
  const cols = [BB.gold, BB.red, '#fff', BB.blue, BB.green];
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const a = -Math.PI / 2 + (rnd(seed + i) - 0.5) * 2.4;
        const v = spread * (0.6 + rnd(seed + i * 3) * 0.6);
        const px = x + Math.cos(a) * v * k * 0.9;
        const py = y + Math.sin(a) * v * k + 1100 * k * k;
        const rot = (rnd(seed + i * 7) - 0.5) * 720 * k;
        const sc = 1 - p(t, at + 1.8, at + 2.6);
        return <rect key={i} x={px - 10 * sc} y={py - 16 * sc} width={20 * sc} height={32 * sc} rx={4} fill={cols[i % cols.length]} stroke={K} strokeWidth={4} transform={`rotate(${rot} ${px} ${py})`} />;
      })}
    </g>
  );
};

// ---------- captions ----------
export type Hot = Record<string, string>;
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
/** 1–3 chunky words (Lilita), thick ink outline + solid drop; keywords tinted; each page pops in. */
export const BabadCaption: React.FC<{t: number; pages: CaptionPage[]; y: number; hot: Hot; size?: number; x?: number}> = ({t, pages, y, hot, size = 100, x}) => {
  const fr = useFrame();
  const maxW = fr.pick(960, 1500);
  const pg = pages.find((g) => t >= g.start - 0.06 && t < g.end);
  if (!pg) return null;
  const q = pb(t, pg.start - 0.06, pg.start + 0.1);
  const words = pg.words.map((w) => ({w: display(w.word).toUpperCase(), c: hot[norm(w.word)] ?? '#fff'}));
  const text = words.map((w) => w.w).join(' ');
  const est = text.length * size * 0.6; // Lilita caps ≈ 0.6 em; pages of ≤ 16 chars stay at full size in portrait
  const fs = est > maxW ? (size * maxW) / est : size;
  const st = {fontFamily: HEAD, fontSize: fs, letterSpacing: 1} as const;
  return (
    <g transform={`translate(${x ?? fr.cx} ${y}) scale(${lerp(0.8, 1, q)})`} opacity={Math.min(1, q * 3)}>
      <text x={0} y={fs * 0.09} textAnchor="middle" fill={K} stroke={K} strokeWidth={fs * 0.2} strokeLinejoin="round" style={st}>{text}</text>
      <text x={0} y={0} textAnchor="middle" stroke={K} strokeWidth={fs * 0.2} paintOrder="stroke" strokeLinejoin="round" style={st}>
        {words.map((w, i) => <tspan key={i} fill={w.c}>{(i ? ' ' : '') + w.w}</tspan>)}
      </text>
    </g>
  );
};
