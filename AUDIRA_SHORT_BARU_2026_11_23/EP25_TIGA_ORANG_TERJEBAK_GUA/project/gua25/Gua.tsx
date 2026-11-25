import React from 'react';
import {AbsoluteFill, continueRender, delayRender, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {buildPages, type CaptionPage} from '../../components/WordCaptions';
import {AudiraOutro} from '../../brand/AudiraOutro';
import {AudiraSignature} from '../../brand/AudiraSignature';
import {rnd} from '../../styles/shared';
import rawWords from './words.json';

// EP25 · Tiga Orang Terjebak di Gua (HR Bukhari 2272, HR Muslim 2743) — AUDIRA QISSAH, INKSTORY 2D.
// Style round 3 (HIKAYAT and ISLAMICDOCUMENTARY failed the jury, G21). Shan shui ink painting on rice paper with
// cinnabar seals. Audio master clock: every time below is a word time from words.json (Cartesia VO 80.02 s).
// Outro card 80.4–84.0. Adab: no figure of the Prophet ﷺ, no female figure (mother and cousin are told only by
// objects: sleeping mats, a closed door). The three men and the worker are small faceless ink figures.
// Each cave beat has its own set and angle (jury r2): cliff outside (hook), wide valley (kejadian), inside by the
// lamp (doa), macro of the crack (gua1), low side angle with a light beam (gua2), sunrise outside (payoff).

export const GUA_SECONDS = 84;
const END = 80.4;

// ---------------------------------------------------------------- palette (kit INKSTORY)
const P = {
  paper: '#EFE6D0', paper2: '#E4D8BC', ink: '#17140F', ink2: '#3A352C', inkMid: '#6B6355', inkLight: '#A39A88',
  cinnabar: '#B0342A', cinnabar2: '#D9573F', glow: '#FFE9B8', lampWarm: '#F2B866',
};
const HEAD = "'Ink Head', serif";
const TEXT = "'Ink Text', sans-serif";
const BRUSH = "'Ink Brush', cursive";

// ---------------------------------------------------------------- timing helpers
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const IO = Easing.inOut(Easing.cubic);
const IN = Easing.bezier(0.7, 0, 0.84, 0);
const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);
const eo = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...clamp, easing: OUT});
const eio = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...clamp, easing: IO});
const ein = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...clamp, easing: IN});
const pop = (t: number, a: number, d = 0.45) => interpolate(t, [a, a + d], [0, 1], {...clamp, easing: BACK});
const lerp = (a: number, b: number, q: number) => a + (b - a) * q;
const win = (t: number, a: number, b: number, f = 0.35) => Math.min(eo(t, a, a + f), 1 - eio(t, b - f, b));
const shakeAt = (t: number, at: number[], amp = 14, dur = 0.45) =>
  at.reduce((s, a) => (t >= a && t < a + dur ? s + Math.sin((t - a) * 95) * amp * (1 - (t - a) / dur) : s), 0);

// ---------------------------------------------------------------- words / captions
const DISPLAY: Record<string, string> = {Audira: 'AUDIRA', 'Qissah.': 'QISSAH.'};
const WORDS = (rawWords as {text: string; start: number; end: number}[]).map((w, i) => ({i, word: DISPLAY[w.text] ?? w.text, start: w.start, end: w.end}));
const PAGES = buildPages(WORDS, 4, 24, 0.45);
const pageAt = (t: number, pages: CaptionPage[]) => pages.find((p, i) => t >= p.start - 0.1 && t < (pages[i + 1]?.start ?? p.end + 0.6) - 0.1 && t < p.end + 0.6);

const Caption: React.FC<{t: number}> = ({t}) => {
  const pg = pageAt(t, PAGES);
  if (!pg) return null;
  const q = eo(t, pg.start - 0.1, pg.start + 0.12);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1352, display: 'flex', justifyContent: 'center', opacity: q}}>
      <div style={{padding: '14px 44px', borderRadius: 6, background: 'rgba(239,230,208,.95)', border: `3px solid ${P.ink}`, boxShadow: '0 10px 24px rgba(23,20,15,.35)',
        fontFamily: TEXT, fontWeight: 800, fontSize: 54, lineHeight: 1.15, textAlign: 'center', maxWidth: 940, wordSpacing: '0.12em'}}>
        {pg.words.map((w, i) => {
          const on = t >= w.start - 0.04 && t < w.end + 0.1;
          const said = t >= w.start - 0.04;
          return (
            <React.Fragment key={i}>
              <span style={{display: 'inline-block', color: on ? P.cinnabar : said ? P.ink : P.inkMid, transform: on ? 'scale(1.04)' : undefined}}>{w.word}</span>
              {i < pg.words.length - 1 ? ' ' : ''}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- geometry
type Pt = [number, number];
const polyD = (pts: Pt[]) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')} Z`;
const lineD = (pts: Pt[]) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}`;
const blob = (r: number, n: number, seed: number, jit = 0.08): Pt[] =>
  Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + (rnd(seed + i * 3.1) - 0.5) * 2 * jit);
    return [Math.cos(a) * rr, Math.sin(a) * rr] as Pt;
  });
/** Irregular rock cave mouth: jagged low dome standing on `base`. */
const mouthPts = (cx: number, base: number, hw: number, h: number, seed = 2): Pt[] => {
  const n = 9;
  const pts: Pt[] = [[cx - hw, base]];
  for (let i = 1; i < n; i++) {
    const a = Math.PI - (i / n) * Math.PI;
    const j = 1 + (rnd(seed + i * 4.7) - 0.5) * 0.24;
    pts.push([cx + Math.cos(a) * hw * j, base - Math.sin(a) * h * j]);
  }
  pts.push([cx + hw, base]);
  return pts;
};

// animals: side profiles, feet at y 0 (ink-wash body, brush fur, back highlight)
const CAMEL: Pt[] = [[-200, -250], [-150, -320], [-90, -350], [-40, -312], [0, -336], [60, -300], [110, -280], [150, -330], [168, -420], [200, -446], [244, -434], [252, -412], [212, -402], [190, -320], [160, -258], [140, -200], [150, 0], [126, 0], [110, -168], [60, -178], [52, 0], [28, 0], [20, -180], [-80, -180], [-88, 0], [-112, 0], [-126, -182], [-158, 0], [-182, 0], [-190, -200]];
const COW: Pt[] = [[-200, -230], [-176, -268], [100, -280], [150, -300], [172, -332], [182, -300], [232, -290], [252, -240], [222, -200], [172, -200], [150, -140], [150, 0], [126, 0], [116, -120], [60, -120], [56, 0], [32, 0], [26, -120], [-120, -120], [-124, 0], [-148, 0], [-160, -120], [-180, 0], [-200, 0], [-204, -150], [-232, -130], [-226, -200]];
const GOAT: Pt[] = [[-110, -150], [-90, -180], [60, -190], [90, -230], [100, -276], [116, -236], [142, -222], [152, -190], [122, -170], [92, -150], [86, -90], [86, 0], [68, 0], [60, -80], [-50, -80], [-54, 0], [-72, 0], [-80, -90], [-104, -110], [-126, -170]];

// ---------------------------------------------------------------- svg defs
const Defs: React.FC = () => (
  <defs>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} />
      <feColorMatrix values="0 0 0 0 0.36  0 0 0 0 0.28  0 0 0 0 0.17  0.55 0 0 0 -0.12" />
    </filter>
    <filter id="inkEdge" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={3} seed={7} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={16} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="inkEdgeStrong" x="-15%" y="-15%" width="130%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={3} seed={11} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={13} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={10} /></filter>
    <filter id="bleed" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={2.2} /></filter>
    <linearGradient id="peakG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={P.ink} stopOpacity={0.92} /><stop offset="0.45" stopColor={P.ink2} stopOpacity={0.45} /><stop offset="1" stopColor={P.inkMid} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="cliffG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={P.ink} stopOpacity={0.95} /><stop offset="0.45" stopColor={P.inkMid} stopOpacity={0.92} /><stop offset="1" stopColor={P.ink2} stopOpacity={0.96} />
    </linearGradient>
    <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={P.paper} stopOpacity={0} /><stop offset="0.5" stopColor={P.paper} stopOpacity={0.92} /><stop offset="1" stopColor={P.paper} stopOpacity={0} />
    </linearGradient>
    <radialGradient id="rockG" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stopColor="#CFC6B2" /><stop offset="0.5" stopColor="#7A7262" /><stop offset="1" stopColor="#2A251E" />
    </radialGradient>
    <radialGradient id="rockDark" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stopColor={P.inkMid} /><stop offset="0.55" stopColor={P.ink2} /><stop offset="1" stopColor={P.ink} />
    </radialGradient>
    <linearGradient id="robeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={P.ink2} /><stop offset="1" stopColor={P.ink} /></linearGradient>
    <linearGradient id="beastG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={P.inkMid} /><stop offset="0.55" stopColor={P.ink2} /><stop offset="1" stopColor={P.ink} />
    </linearGradient>
    <radialGradient id="lampGlow"><stop offset="0" stopColor={P.glow} stopOpacity={1} /><stop offset="0.35" stopColor={P.lampWarm} stopOpacity={0.55} /><stop offset="1" stopColor={P.lampWarm} stopOpacity={0} /></radialGradient>
    <radialGradient id="sunGlow"><stop offset="0" stopColor={P.cinnabar2} stopOpacity={0.75} /><stop offset="0.4" stopColor={P.glow} stopOpacity={0.45} /><stop offset="1" stopColor={P.glow} stopOpacity={0} /></radialGradient>
    <radialGradient id="caveDark" cx="0.5" cy="0.75" r="0.8"><stop offset="0" stopColor={P.ink2} /><stop offset="1" stopColor={P.ink} /></radialGradient>
    <radialGradient id="shadow"><stop offset="0" stopColor={P.ink} stopOpacity={0.55} /><stop offset="1" stopColor={P.ink} stopOpacity={0} /></radialGradient>
    <linearGradient id="dawnWash" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={P.cinnabar2} stopOpacity={0.35} /><stop offset="0.45" stopColor={P.glow} stopOpacity={0.3} /><stop offset="1" stopColor={P.glow} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="nightWash" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={P.ink2} stopOpacity={0.6} /><stop offset="1" stopColor={P.ink2} stopOpacity={0.1} />
    </linearGradient>
    <linearGradient id="beam" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={P.glow} stopOpacity={0.85} /><stop offset="1" stopColor={P.lampWarm} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8A6B48" /><stop offset="1" stopColor="#5A4430" /></linearGradient>
    <radialGradient id="vig" cx="0.5" cy="0.45" r="0.78"><stop offset="0.55" stopColor="#5A4A30" stopOpacity={0} /><stop offset="1" stopColor="#3A2E1C" stopOpacity={0.42} /></radialGradient>
  </defs>
);

const Svg: React.FC<{children: React.ReactNode; shake?: number; bg?: string}> = ({children, shake = 0, bg = P.paper}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, transform: shake ? `translate(${shake}px, ${shake * 0.4}px)` : undefined}}>
    <Defs />
    <rect x={-200} y={-200} width={1480} height={2320} fill={bg} />
    {children}
    <rect x={0} y={0} width={1080} height={1920} filter="url(#grain)" opacity={0.55} />
    <rect x={-200} y={-200} width={1480} height={2320} fill="url(#vig)" />
  </svg>
);

/** Slow push-in per scene (continuous camera). */
const Drift: React.FC<{t: number; from: number; to: number; i: number; zoom?: number; zoomTo?: number; origin?: string; children: React.ReactNode}> = ({t, from, to, i, zoom = 1, zoomTo, origin = '50% 52%', children}) => {
  const p = eio(t, from, to);
  const dir = i % 2 ? 1 : -1;
  const z = zoomTo === undefined ? zoom * (1.02 + 0.06 * p) : lerp(zoom, zoomTo, p);
  return <AbsoluteFill style={{transform: `scale(${z}) translate(${dir * 10 * p}px, ${-14 * p}px)`, transformOrigin: origin}}>{children}</AbsoluteFill>;
};

// ---------------------------------------------------------------- ink building blocks
/** Axe-cut texture strokes (cun) scattered in a box. */
const Cun: React.FC<{x0: number; y0: number; x1: number; y1: number; n: number; seed: number; color?: string; op?: number; w?: number}> = ({x0, y0, x1, y1, n, seed, color = P.ink, op = 0.45, w = 4}) => (
  <g opacity={op} stroke={color} fill="none" strokeLinecap="round">
    {Array.from({length: n}, (_, i) => {
      const x = x0 + rnd(seed + i * 1.3) * (x1 - x0);
      const y = y0 + rnd(seed + i * 2.9 + 1) * (y1 - y0);
      const len = 36 + rnd(seed + i * 5.1) * 90;
      const lean = (rnd(seed + i * 7.7) - 0.5) * 0.6;
      return <path key={i} d={`M${x.toFixed(1)} ${y.toFixed(1)} q${(-len * (0.15 + lean)).toFixed(1)} ${(len * 0.5).toFixed(1)} ${(-len * (0.35 + lean)).toFixed(1)} ${len.toFixed(1)}`} strokeWidth={w * (0.6 + rnd(seed + i * 3.3) * 0.9)} />;
    })}
  </g>
);

/** Shan shui peak range: dark ridge fading into mist, brush ridge line, cun strokes under each summit. */
const Peak: React.FC<{pts: Pt[]; base: number; tone?: number; seed?: number}> = ({pts, base, tone = 1, seed = 1}) => {
  const d = polyD([[pts[0][0], base], ...pts, [pts[pts.length - 1][0], base]]);
  return (
    <g opacity={tone} filter="url(#inkEdge)">
      <path d={d} fill="url(#peakG)" />
      <path d={lineD(pts)} fill="none" stroke={P.ink} strokeWidth={5} strokeLinejoin="round" />
      {pts.slice(1, -1).map(([x, y], i) => (
        <Cun key={i} x0={x - 50} y0={y + 20} x1={x + 50} y1={y + (base - y) * 0.45} n={5} seed={seed * 13 + i * 7} color={P.ink} op={0.5} w={4} />
      ))}
    </g>
  );
};

const Mist: React.FC<{y: number; h: number; op?: number}> = ({y, h, op = 1}) => <rect x={-200} y={y} width={1480} height={h} fill="url(#mist)" opacity={op} />;

/** Faceted ink boulder (not round): blob n=10 jit .2, facet strokes, texture dots on top, brush outline. */
const Rock: React.FC<{x: number; y: number; r: number; seed: number; rot?: number; op?: number; dark?: boolean}> = ({x, y, r, seed, rot = 0, op = 1, dark}) => {
  const pts = blob(r, 10, seed, 0.2);
  const c: Pt = [-r * 0.2, -r * 0.25];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={op}>
      <path d={polyD(pts)} fill={dark ? 'url(#rockDark)' : 'url(#rockG)'} filter="url(#inkEdge)" />
      <g stroke={P.ink2} strokeWidth={Math.max(3, r * 0.022)} opacity={0.6} fill="none" strokeLinecap="round">
        {[1, 4, 6, 8].map((k) => <path key={k} d={`M${c[0].toFixed(1)} ${c[1].toFixed(1)} L${(pts[k][0] * 0.9).toFixed(1)} ${(pts[k][1] * 0.9).toFixed(1)}`} />)}
      </g>
      <Cun x0={-r * 0.1} y0={-r * 0.1} x1={r * 0.7} y1={r * 0.5} n={7} seed={seed + 40} color={P.ink} op={0.45} w={Math.max(3, r * 0.025)} />
      {Array.from({length: 7}, (_, i) => (
        <circle key={i} cx={(rnd(seed + i * 2.1) - 0.5) * r * 1.1} cy={-r * (0.55 + rnd(seed + i * 4.3) * 0.3)} r={Math.max(3, r * 0.035)} fill={P.ink} opacity={0.8} />
      ))}
      <path d={polyD(pts)} fill="none" stroke={P.ink} strokeWidth={Math.max(4, r * 0.03)} filter="url(#inkEdge)" />
    </g>
  );
};

/** Dry-brush hatching: broken, tapered ink strokes inside a box plus a paper-white rim stroke on the lit side (jury r1 material). */
const DryBrush: React.FC<{x0: number; y0: number; x1: number; y1: number; n: number; seed: number; vertical?: boolean; rim?: string}> = ({x0, y0, x1, y1, n, seed, vertical = true, rim}) => (
  <g fill="none" strokeLinecap="round" filter="url(#inkEdge)">
    {Array.from({length: n}, (_, i) => {
      const u = (i + 0.5) / n + (rnd(seed + i * 1.7) - 0.5) * 0.08;
      const a = 0.08 + rnd(seed + i * 3.1) * 0.18;
      const b = 0.72 + rnd(seed + i * 4.7) * 0.25;
      const bend = (rnd(seed + i * 5.3) - 0.5) * 0.18;
      const d = vertical
        ? `M${lerp(x0, x1, u).toFixed(1)} ${lerp(y0, y1, a).toFixed(1)} Q${lerp(x0, x1, u + bend).toFixed(1)} ${lerp(y0, y1, (a + b) / 2).toFixed(1)} ${lerp(x0, x1, u + bend * 0.4).toFixed(1)} ${lerp(y0, y1, b).toFixed(1)}`
        : `M${lerp(x0, x1, a).toFixed(1)} ${lerp(y0, y1, u).toFixed(1)} Q${lerp(x0, x1, (a + b) / 2).toFixed(1)} ${lerp(y0, y1, u + bend).toFixed(1)} ${lerp(x0, x1, b).toFixed(1)} ${lerp(y0, y1, u + bend * 0.4).toFixed(1)}`;
      const w = 3 + rnd(seed + i * 6.1) * 6;
      const dash = `${(30 + rnd(seed + i) * 60).toFixed(0)} ${(6 + rnd(seed + i * 2) * 14).toFixed(0)} ${(14 + rnd(seed + i * 3) * 30).toFixed(0)} ${(4 + rnd(seed + i * 4) * 10).toFixed(0)}`;
      return <path key={i} d={d} stroke={i % 3 === 2 ? P.inkMid : P.ink} strokeWidth={w} strokeDasharray={dash} opacity={0.5 + rnd(seed + i * 8.3) * 0.3} />;
    })}
    {rim && <path d={rim} stroke={P.paper2} strokeWidth={5} strokeDasharray="46 10 20 8" opacity={0.75} />}
  </g>
);

type Pose = 'stand' | 'walk' | 'kneel';
/** Faceless robed man in brush ink. Feet at (x, y). `pray` 0..1 raises the arms (kneel pose seen from behind). */
const Figure: React.FC<{x: number; y: number; s?: number; pose?: Pose; dir?: number; t?: number; ph?: number; bowl?: boolean; op?: number; pray?: number}> = ({
  x, y, s = 1, pose = 'stand', dir = 1, t = 0, ph = 0, bowl = false, op = 1, pray = 0,
}) => {
  if (op <= 0) return null;
  if (pose === 'kneel') {
    const hx = lerp(-60, -104, pray);
    const hy = lerp(-90, -214, pray);
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
        <ellipse cy={4} rx={124} ry={16} fill="url(#shadow)" />
        {pray > 0.05 && [1, -1].map((m) => (
          <g key={m}>
            <path d={`M${-56 * m} -150 Q${(hx - 10) * m} -150 ${hx * m} ${hy}`} stroke={P.ink} strokeWidth={30} fill="none" strokeLinecap="round" />
            <path d={`M${-56 * m} -150 Q${(hx - 10) * m} -150 ${hx * m} ${hy}`} stroke={P.inkMid} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6} />
            <ellipse cx={hx * m} cy={hy - 14} rx={12} ry={18} fill={P.ink2} transform={`rotate(${-14 * m} ${hx * m} ${hy - 14})`} />
          </g>
        ))}
        <path d="M0 -246 C-28 -246 -40 -224 -40 -200 C-40 -184 -48 -172 -70 -160 Q-106 -120 -112 -6 Q0 10 112 -6 Q106 -120 70 -160 C48 -172 40 -184 40 -200 C40 -224 28 -246 0 -246 Z" fill="url(#robeG)" stroke={P.ink} strokeWidth={7} filter="url(#inkEdgeStrong)" />
        <DryBrush x0={-92} y0={-170} x1={92} y1={-14} n={9} seed={5} rim="M-38 -222 C-40 -190 -60 -172 -84 -150 Q-100 -110 -104 -20" />
        <path d="M0 -240 Q4 -200 0 -170 Q6 -90 0 -12 M-56 -118 Q-66 -62 -72 -14 M58 -116 Q68 -62 74 -14" stroke={P.inkMid} strokeWidth={4} fill="none" opacity={0.7} />
        <path d="M-40 -196 Q0 -176 40 -196" stroke={P.inkMid} strokeWidth={5} fill="none" opacity={0.8} />
        <path d="M-64 -150 Q-40 -166 -14 -168" stroke={P.inkLight} strokeWidth={6} fill="none" opacity={0.55} strokeLinecap="round" />
      </g>
    );
  }
  const walk = pose === 'walk';
  const st = walk ? Math.sin(t * 7 + ph) : 0;
  const bob = walk ? -Math.abs(Math.cos(t * 7 + ph)) * 5 : 0;
  const sw = st * 10;
  return (
    <g transform={`translate(${x} ${y + bob * s}) scale(${s * dir} ${s})`} opacity={op}>
      <ellipse cy={4} rx={84} ry={12} fill="url(#shadow)" />
      {walk ? (
        <>
          <path d={`M-8 -60 L${(-8 + st * 26).toFixed(1)} 0`} stroke={P.ink} strokeWidth={14} strokeLinecap="round" />
          <path d={`M8 -60 L${(8 - st * 26).toFixed(1)} 0`} stroke={P.ink} strokeWidth={14} strokeLinecap="round" />
        </>
      ) : (
        <path d="M-32 0 L-8 0 M8 0 L34 0" stroke={P.ink} strokeWidth={12} strokeLinecap="round" />
      )}
      <path d={`M0 -312 C-26 -312 -36 -292 -36 -270 C-36 -252 -42 -240 -58 -230 Q-74 -216 -72 -190 Q-68 -110 ${-66 + sw} -22 Q0 -12 ${66 + sw} -22 Q68 -110 72 -190 Q74 -216 58 -230 C42 -240 36 -252 36 -270 C36 -292 26 -312 0 -312 Z`} fill="url(#robeG)" stroke={P.ink} strokeWidth={7} filter="url(#inkEdgeStrong)" />
      <DryBrush x0={-58} y0={-230} x1={58} y1={-28} n={7} seed={9} rim="M-30 -282 C-34 -262 -40 -246 -60 -232 Q-74 -210 -70 -150 Q-68 -90 -64 -30" />
      <path d="M8 -292 C26 -292 30 -270 28 -252 C24 -238 14 -236 8 -240 C2 -256 0 -276 8 -292 Z" fill={P.ink} />
      <path d={`M-6 -226 Q-12 -110 ${-18 + sw} -30 M24 -200 Q30 -100 ${36 + sw} -30`} stroke={P.inkMid} strokeWidth={4} fill="none" opacity={0.7} />
      <path d="M-62 -226 Q-40 -244 -20 -246" stroke={P.inkLight} strokeWidth={6} fill="none" opacity={0.55} strokeLinecap="round" />
      <path d="M-58 -150 Q0 -136 58 -150" stroke={P.inkMid} strokeWidth={9} fill="none" />
      {bowl ? (
        <>
          <path d="M40 -222 Q66 -190 80 -158" stroke={P.ink} strokeWidth={24} fill="none" strokeLinecap="round" />
          <g transform="translate(94 -150)">
            <path d="M-40 0 Q0 36 40 0 Z" fill={P.inkMid} stroke={P.ink} strokeWidth={4} />
            <ellipse rx={40} ry={8} fill={P.paper} stroke={P.ink} strokeWidth={3} />
          </g>
        </>
      ) : (
        <path d={`M42 -222 Q${58 - st * 20} -170 ${44 - st * 30} -118`} stroke={P.ink} strokeWidth={22} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
};

/** Clay oil lamp with a warm flame and glow. */
const Lamp: React.FC<{x: number; y: number; s?: number; t: number; glowR?: number; op?: number}> = ({x, y, s = 1, t, glowR = 240, op = 1}) => {
  const fl = 1 + 0.07 * Math.sin(t * 9) + 0.05 * Math.sin(t * 23);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <circle cx={90} cy={-70} r={glowR * fl} fill="url(#lampGlow)" opacity={0.8} />
      <ellipse cx={10} cy={8} rx={100} ry={14} fill="url(#shadow)" />
      <path d="M-60 0 Q-66 -30 -30 -38 L40 -38 Q80 -40 96 -56 Q92 -24 56 -8 Q30 0 0 0 Z" fill={P.inkMid} stroke={P.ink} strokeWidth={4} />
      <path d="M-46 -26 Q-36 -34 -10 -34 L40 -34" stroke={P.lampWarm} strokeWidth={4} fill="none" opacity={0.7} strokeLinecap="round" />
      <g transform="translate(92 -62)">
        <path d={`M0 0 C-14 -16 -10 ${-44 * fl} 0 ${-62 * fl} C10 ${-44 * fl} 14 -16 0 0 Z`} fill={P.lampWarm} />
        <path d={`M0 -2 C-6 -10 -5 ${-26 * fl} 0 ${-36 * fl} C5 ${-26 * fl} 6 -10 0 -2 Z`} fill={P.glow} />
      </g>
    </g>
  );
};

const Grass: React.FC<{x: number; y: number; s?: number; seed?: number; t?: number; color?: string}> = ({x, y, s = 1, seed = 0, t = 0, color = P.ink}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} fill="none" strokeLinecap="round">
    {Array.from({length: 7}, (_, i) => {
      const a = (i - 3) * 0.24 + (rnd(seed + i) - 0.5) * 0.2;
      const h = 60 + rnd(seed + i * 2) * 70;
      const sway = Math.sin(t * 1.6 + i + seed) * 4;
      const x0 = (i - 3) * 6;
      return <path key={i} d={`M${x0} 0 Q${(x0 + Math.sin(a) * h * 0.5).toFixed(1)} ${(-h * 0.55).toFixed(1)} ${(x0 + Math.sin(a) * h + sway).toFixed(1)} ${(-h).toFixed(1)}`} strokeWidth={5 - (i % 2) * 1.5} />;
    })}
  </g>
);

const Pine: React.FC<{x: number; y: number; s?: number; op?: number}> = ({x, y, s = 1, op = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <path d="M0 0 Q-24 -200 10 -380 Q34 -520 -10 -660" stroke={P.ink} strokeWidth={24} fill="none" filter="url(#inkEdge)" strokeLinecap="round" />
    <path d="M6 -300 Q80 -330 150 -320 M-4 -470 Q-80 -500 -140 -480 M2 -590 Q60 -620 120 -610" stroke={P.ink} strokeWidth={10} fill="none" strokeLinecap="round" />
    {([[150, -330, 1], [-140, -490, 2], [120, -620, 3], [-10, -680, 4], [40, -420, 5]] as [number, number, number][]).map(([bx, by, sd]) => (
      <g key={sd} transform={`translate(${bx} ${by}) scale(1.7 0.45)`}>
        <path d={polyD(blob(70, 12, sd * 9, 0.32))} fill={P.ink} opacity={0.88} filter="url(#inkEdge)" />
      </g>
    ))}
  </g>
);

/** Cinnabar seal stamp "AUDIRA / QISSAH" (brand inside the painting). */
const SealStamp: React.FC<{x: number; y: number; q: number; s?: number; rot?: number}> = ({x, y, q, s = 1, rot = -4}) => {
  if (q <= 0) return null;
  const k = Math.min(1, q);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * (1.35 - 0.35 * k)})`} opacity={Math.min(1, q * 2)}>
      <rect x={-100} y={-100} width={200} height={200} rx={10} fill={P.cinnabar} filter="url(#inkEdge)" />
      <rect x={-84} y={-84} width={168} height={168} fill="none" stroke={P.paper} strokeWidth={4} opacity={0.85} filter="url(#inkEdge)" />
      <text y={-12} textAnchor="middle" fontFamily={HEAD} fontWeight={700} fontSize={50} letterSpacing={2} fill={P.paper}>AUDIRA</text>
      <text y={50} textAnchor="middle" fontFamily={HEAD} fontWeight={700} fontSize={46} letterSpacing={2} fill={P.paper}>QISSAH</text>
    </g>
  );
};

const Rain: React.FC<{t: number; op: number}> = ({t, op}) => (
  <g opacity={op} stroke={P.ink2} strokeWidth={2.5} strokeLinecap="round">
    {Array.from({length: 70}, (_, i) => {
      const x0 = rnd(i) * 1400 - 160;
      const sp = 900 + rnd(i + 5) * 500;
      const y = ((t * sp + rnd(i + 9) * 2200) % 2200) - 200;
      return <line key={i} x1={x0 + y * 0.12} y1={y} x2={x0 + y * 0.12 + 10} y2={y + 64} opacity={0.18 + rnd(i + 2) * 0.3} />;
    })}
  </g>
);

/** Ink splash dust when stone hits stone. */
const Dust: React.FC<{t: number; at: number; x: number; y: number; w?: number}> = ({t, at, x, y, w = 1}) => {
  if (t < at || t > at + 1.0) return null;
  const k = eo(t, at, at + 0.95);
  return (
    <g filter="url(#bleed)">
      {Array.from({length: 12}, (_, i) => (
        <circle key={i} cx={x + (i - 5.5) * 34 * w * (0.5 + k)} cy={y - k * 120 * rnd(i) + k * k * 140} r={(8 + rnd(i + 1) * 12) * w} fill={P.inkMid} opacity={(1 - k) * 0.7} />
      ))}
    </g>
  );
};

/** Foreground plane: dark ink rocks in the bottom corners plus brush grass (fills the lower third, jury r1/r2). */
const FgInk: React.FC<{t: number; dark?: boolean}> = ({t, dark}) => (
  <g>
    <Rock x={60} y={1870} r={250} seed={31} dark={dark} />
    <Rock x={1020} y={1890} r={220} seed={47} dark={dark} />
    <Grass x={270} y={1770} s={1.3} seed={3} t={t} />
    <Grass x={340} y={1820} s={1} seed={9} t={t} />
    <Grass x={790} y={1800} s={1.2} seed={14} t={t} />
    <Grass x={720} y={1850} s={0.9} seed={21} t={t} />
  </g>
);

const Footprints: React.FC<{t: number; from: number; dur: number; x0: number; x1: number; y: number}> = ({t, from, dur, x0, x1, y}) => (
  <g>
    {Array.from({length: 8}, (_, i) => {
      const k = i / 7;
      const q = eo(t, from + k * dur, from + k * dur + 0.2);
      return <ellipse key={i} cx={lerp(x0, x1, k)} cy={y + (i % 2 ? 16 : -16)} rx={20} ry={9} fill={P.ink2} opacity={q * 0.55} />;
    })}
  </g>
);

// ---------------------------------------------------------------- HUD (HTML, laid out at 1080×1920)
// Max two plates per frame; titles start below the signature's top slot (y 221).
const TitleBlock: React.FC<{q: number; kicker?: string; title: string; size?: number; dark?: boolean; top?: number}> = ({q, kicker, title, size = 84, dark, top = 286}) => (
  <div style={{position: 'absolute', left: 80, right: 80, top, textAlign: 'center', opacity: Math.min(1, q * 1.4), transform: `translateY(${(1 - q) * 26}px)`}}>
    {kicker && (
      <div style={{display: 'inline-block', padding: '4px 22px 8px', marginBottom: 10, background: P.cinnabar, fontFamily: BRUSH, fontSize: 44, color: P.paper, transform: 'rotate(-1.5deg)'}}>{kicker}</div>
    )}
    <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: size, lineHeight: 1.0, color: dark ? P.paper : P.ink,
      textShadow: dark ? '0 4px 18px rgba(0,0,0,.8)' : '0 0 18px rgba(239,230,208,.95), 0 0 6px rgba(239,230,208,.9)'}}>{title}</div>
  </div>
);

/** Paper slip with the cinnabar left bar. */
const Panel: React.FC<{q: number; top: number; w?: number; children: React.ReactNode}> = ({q, top, w = 820, children}) => (
  <div style={{position: 'absolute', left: (1080 - w) / 2, width: w, top, opacity: Math.min(1, q * 1.5), transform: `scale(${0.92 + 0.08 * Math.min(1, q)})`, transformOrigin: '50% 0'}}>
    <div style={{background: 'rgba(239,230,208,.96)', borderLeft: `10px solid ${P.cinnabar}`, outline: `2px solid ${P.ink}`, padding: '16px 30px', boxShadow: '0 12px 26px rgba(23,20,15,.35)', textAlign: 'center'}}>{children}</div>
  </div>
);
const PText: React.FC<{size?: number; color?: string; children: React.ReactNode}> = ({size = 44, color = P.ink, children}) => <div style={{fontFamily: TEXT, fontWeight: 700, fontSize: size, color, lineHeight: 1.15}}>{children}</div>;
const PBig: React.FC<{size?: number; color?: string; children: React.ReactNode}> = ({size = 110, color = P.cinnabar, children}) => <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: size, color, lineHeight: 1}}>{children}</div>;

/** "Celah batu" meter: how far the boulder has moved, counted in amal (1/3, 2/3, 3/3). */
const Meter: React.FC<{q: number; k: number; label: string; top?: number}> = ({q, k, label, top = 490}) => (
  <div style={{position: 'absolute', left: 150, width: 780, top, opacity: q, transform: `translateY(${(1 - q) * 20}px)`}}>
    <div style={{background: 'rgba(239,230,208,.95)', border: `3px solid ${P.ink}`, padding: '12px 26px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: TEXT, fontWeight: 800, fontSize: 36, color: P.ink, letterSpacing: 2}}>
        <span>CELAH BATU</span><span style={{color: P.cinnabar}}>{label}</span>
      </div>
      <div style={{marginTop: 8, height: 22, display: 'flex', gap: 6}}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{flex: 1, background: P.paper2, border: `2px solid ${P.ink}`}}>
            <div style={{width: `${Math.max(0, Math.min(1, k * 3 - i)) * 100}%`, height: '100%', background: P.cinnabar}} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ================================================================ S1 HOOK 0–7.2 · outside the cliff at night
const HOOK_CLIFF = 'M-100 760 L120 700 L300 820 L420 900 L700 880 L900 720 L1180 560 L1180 1400 L-100 1400 Z';
const HOOK_MOUTH = polyD(mouthPts(540, 1250, 200, 300, 2));
const Hook: React.FC<{t: number}> = ({t}) => {
  const p = ein(t, 1.4, 3.67);
  const bx = lerp(1260, 540, p);
  const by = lerp(720, 1050, p) - Math.sin(p * Math.PI) * 60;
  const settle = t > 3.67 ? Math.sin(eo(t, 3.67, 4.3) * Math.PI) * 14 * (1 - eo(t, 3.67, 4.3)) : 0;
  const sh = shakeAt(t, [3.67], 18, 0.55);
  const fire = 1 - eo(t, 3.4, 3.8);
  return (
    <>
      <Drift t={t} from={0} to={7.45} i={0}>
        <Svg shake={sh}>
          <rect x={-100} y={-100} width={1280} height={1300} fill="url(#nightWash)" opacity={0.55} />
          <circle cx={230} cy={640} r={50} fill={P.paper} opacity={0.85} />
          <circle cx={230} cy={640} r={130} fill="url(#lampGlow)" opacity={0.25} />
          <Peak pts={[[-100, 820], [80, 560], [200, 640], [330, 470], [470, 620], [600, 520], [760, 640], [900, 500], [1180, 700]]} base={980} tone={0.35} seed={1} />
          <Mist y={690} h={280} />
          <g filter="url(#inkEdge)">
            <path d={HOOK_CLIFF} fill="url(#cliffG)" />
            <path d="M-100 760 L120 700 L300 820 L420 900 L700 880 L900 720 L1180 560" fill="none" stroke={P.ink} strokeWidth={7} />
          </g>
          <clipPath id="hookCliff"><path d={HOOK_CLIFF} /></clipPath>
          <g clipPath="url(#hookCliff)">
            <Cun x0={-60} y0={760} x1={1140} y1={1340} n={60} seed={11} color={P.ink} op={0.55} w={5} />
            <Cun x0={-60} y0={760} x1={1140} y1={1340} n={30} seed={23} color={P.inkLight} op={0.35} w={4} />
          </g>
          {/* the cave mouth with the three men inside by a small fire */}
          <path d={HOOK_MOUTH} fill="url(#caveDark)" />
          <circle cx={540} cy={1200} r={170} fill="url(#lampGlow)" opacity={0.55 * fire} />
          <path d="M520 1240 Q530 1200 540 1180 Q552 1205 560 1240 Z" fill={P.lampWarm} opacity={fire} />
          {[470, 540, 610].map((x, i) => <Figure key={i} x={x} y={1250} s={0.5} pose="kneel" op={fire} />)}
          <path d={HOOK_MOUTH} fill="none" stroke={P.ink} strokeWidth={9} filter="url(#inkEdge)" />
          {/* the boulder rolls down the cliff and seals the mouth */}
          <Rock x={bx} y={by + settle} r={220} seed={7} rot={-p * 320} />
          <Dust t={t} at={3.67} x={540} y={1270} w={1.4} />
          {/* ledge in front of the cave */}
          <path d="M-100 1290 Q300 1262 540 1282 Q800 1302 1180 1272 L1180 1530 L-100 1530 Z" fill={P.inkLight} opacity={0.6} filter="url(#inkEdge)" />
          <path d="M-100 1290 Q300 1262 540 1282 Q800 1302 1180 1272" fill="none" stroke={P.ink} strokeWidth={6} filter="url(#inkEdge)" />
          <Cun x0={0} y0={1300} x1={1080} y1={1500} n={22} seed={51} op={0.4} />
          <Mist y={1440} h={200} op={0.8} />
          <SealStamp x={880} y={1150} q={eo(t, 4.2, 4.6)} s={0.72} />
          <Rain t={t} op={0.7} />
          <FgInk t={t} dark />
        </Svg>
      </Drift>
      <TitleBlock q={eo(t, 0.35, 0.9)} kicker="HR Bukhari · HR Muslim" title="Tiga Orang di Gua" size={90} />
    </>
  );
};

// ================================================================ S2 SUMBER 7.2–11.8 · hanging scroll above the ink table
const Sumber: React.FC<{t: number}> = ({t}) => {
  const nB = Math.round(lerp(1, 2272, eo(t, 10.1, 10.7)));
  const intro = 1 - eo(t, 9.85, 10.15);
  const nM = Math.round(lerp(0, 2743, eo(t, 10.75, 11.35)));
  const reveal = eio(t, 7.3, 8.9);
  const yb = lerp(600, 1330, reveal);
  const sway = Math.sin(t * 1.3) * 0.6;
  return (
    <>
      <Drift t={t} from={7.2} to={12.05} i={1}>
        <Svg bg={P.paper2}>
          <rect x={-100} y={-100} width={1280} height={1600} fill={P.paper} opacity={0.5} />
          <g transform={`rotate(${sway} 540 560)`}>
            <line x1={540} y1={470} x2={540} y2={560} stroke={P.ink} strokeWidth={4} />
            <path d="M500 560 L540 470 L580 560" stroke={P.ink} strokeWidth={4} fill="none" />
            <clipPath id="scrollClip"><rect x={200} y={560} width={680} height={yb - 560} /></clipPath>
            <g clipPath="url(#scrollClip)">
              <rect x={220} y={570} width={640} height={760} fill="#C9B48A" />
              <rect x={260} y={600} width={560} height={700} fill={P.paper} />
              <clipPath id="scrollPaint"><rect x={280} y={620} width={520} height={250} /></clipPath>
              <g clipPath="url(#scrollPaint)">
                <Peak pts={[[260, 860], [340, 700], [420, 760], [520, 650], [620, 760], [700, 690], [820, 840]]} base={900} tone={0.75} seed={4} />
                <Mist y={780} h={120} />
              </g>
              <g opacity={intro}>
                <text x={540} y={990} textAnchor="middle" fontFamily={BRUSH} fontSize={66} fill={P.cinnabar}>kisah sahih</text>
                <text x={540} y={1090} textAnchor="middle" fontFamily={HEAD} fontWeight={700} fontSize={70} fill={P.ink}>Tiga Orang</text>
                <text x={540} y={1170} textAnchor="middle" fontFamily={HEAD} fontWeight={700} fontSize={70} fill={P.ink}>di Dalam Gua</text>
              </g>
              <g opacity={1 - intro}>
                <text x={540} y={950} textAnchor="middle" fontFamily={TEXT} fontWeight={800} fontSize={38} letterSpacing={4} fill={P.inkMid}>HR BUKHARI</text>
                <text x={540} y={1050} textAnchor="middle" fontFamily={HEAD} fontWeight={700} fontSize={104} fill={P.ink}>{nB}</text>
              </g>
              <g opacity={eo(t, 10.7, 10.9)}>
                <text x={540} y={1110} textAnchor="middle" fontFamily={TEXT} fontWeight={800} fontSize={38} letterSpacing={4} fill={P.inkMid}>HR MUSLIM</text>
                <text x={540} y={1210} textAnchor="middle" fontFamily={HEAD} fontWeight={700} fontSize={104} fill={P.ink}>{nM}</text>
              </g>
              <SealStamp x={740} y={1245} q={eo(t, 11.0, 11.3)} s={0.32} />
            </g>
            <rect x={196} y={548} width={688} height={22} rx={10} fill="url(#wood)" stroke={P.ink} strokeWidth={3} />
            <rect x={196} y={yb - 8} width={688} height={26} rx={12} fill="url(#wood)" stroke={P.ink} strokeWidth={3} />
            <circle cx={190} cy={yb + 5} r={18} fill={P.ink} /><circle cx={890} cy={yb + 5} r={18} fill={P.ink} />
          </g>
          {/* the ink table: inkstone, brush, water bowl */}
          <path d="M20 1420 L1060 1420 L1100 1490 L-20 1490 Z" fill="url(#wood)" stroke={P.ink} strokeWidth={5} filter="url(#inkEdge)" />
          <rect x={-20} y={1490} width={1120} height={70} fill="#4A3828" stroke={P.ink} strokeWidth={4} />
          <rect x={60} y={1560} width={46} height={260} fill="#4A3828" stroke={P.ink} strokeWidth={4} />
          <rect x={974} y={1560} width={46} height={260} fill="#4A3828" stroke={P.ink} strokeWidth={4} />
          <rect x={-100} y={1700} width={1280} height={300} fill={P.inkLight} opacity={0.35} />
          {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={-100} y1={1730 + i * 44} x2={1180} y2={1730 + i * 44} stroke={P.ink2} strokeWidth={2} opacity={0.35} />)}
          <rect x={180} y={1378} width={200} height={54} rx={10} fill={P.ink} />
          <ellipse cx={250} cy={1394} rx={48} ry={11} fill={P.ink2} />
          <path d="M470 1408 L760 1380" stroke="#6E5236" strokeWidth={14} strokeLinecap="round" />
          <path d="M760 1380 Q800 1372 826 1378 Q800 1392 760 1386 Z" fill={P.ink} />
          <path d="M860 1420 Q860 1362 920 1362 Q980 1362 980 1420 Z" fill={P.inkMid} stroke={P.ink} strokeWidth={4} />
          <ellipse cx={920} cy={1364} rx={60} ry={10} fill={P.paper2} stroke={P.ink} strokeWidth={3} />
          {/* lower third: a sheet on the floor being written with a floating brush (no figure) */}
          <g transform="translate(540 1745) rotate(-3)">
            <rect x={-420} y={-120} width={840} height={240} fill={P.paper} stroke={P.ink} strokeWidth={4} filter="url(#inkEdge)" />
            <rect x={-440} y={-130} width={30} height={260} rx={8} fill="url(#wood)" stroke={P.ink} strokeWidth={3} />
            <rect x={410} y={-130} width={30} height={260} rx={8} fill="url(#wood)" stroke={P.ink} strokeWidth={3} />
            {(() => {
              const strokes = ['M-360 -40 Q-300 -90 -240 -30 T-120 -40', 'M-80 -70 L-80 60 M-130 -10 L-30 -10', 'M10 -60 Q80 -100 130 -20 Q80 40 20 50', 'M180 -70 Q220 0 180 70 M240 -60 Q300 -10 360 -60 M250 40 L360 40'];
              const wp = eio(t, 7.6, 11.6) * strokes.length;
              const cur = Math.min(strokes.length - 1, Math.floor(wp));
              const bx = [-150, -80, 70, 270][cur] + Math.sin(t * 9) * 26;
              const by = -10 + Math.cos(t * 7) * 30;
              return (
                <>
                  {strokes.map((d, i) => {
                    const k = Math.max(0, Math.min(1, wp - i));
                    return <path key={i} d={d} stroke={P.ink} strokeWidth={16} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} filter="url(#inkEdge)" />;
                  })}
                  <g transform={`translate(${bx} ${by - 40}) rotate(28)`} opacity={t < 11.7 ? 1 : 1 - eo(t, 11.7, 12)}>
                    <path d="M0 -230 L0 -30" stroke="#6E5236" strokeWidth={16} strokeLinecap="round" />
                    <path d="M-12 -34 Q0 30 0 40 Q0 30 12 -34 Z" fill={P.ink} />
                  </g>
                </>
              );
            })()}
          </g>
        </Svg>
      </Drift>
      <TitleBlock q={eo(t, 7.4, 7.9)} kicker="dari Ibnu Umar r.a." title="Kisah dari Rasulullah ﷺ" size={72} />
    </>
  );
};

// ================================================================ S3 KEJADIAN 11.8–17.3 · wide misty valley
const K_MAIN: Pt[] = [[-100, 1300], [150, 980], [320, 860], [480, 700], [600, 600], [700, 560], [790, 620], [900, 760], [1020, 900], [1180, 1000]];
const K_MOUTH = polyD(mouthPts(600, 1240, 72, 108, 5));
const Kejadian: React.FC<{t: number}> = ({t}) => {
  const wob = t > 14.35 && t < 14.8 ? Math.sin((t - 14.35) * 40) * 6 : 0;
  const fall = ein(t, 14.8, 16.24);
  const bx = lerp(760, 600, fall);
  const by = lerp(560, 1172, fall);
  const sh = shakeAt(t, [16.24], 16, 0.5);
  return (
    <>
      <Drift t={t} from={11.8} to={17.55} i={2}>
        <Svg shake={sh}>
          <rect x={-100} y={-100} width={1280} height={1400} fill="url(#nightWash)" opacity={0.35} />
          <Peak pts={[[-100, 900], [120, 640], [260, 720], [420, 560], [560, 690], [760, 580], [920, 700], [1180, 620]]} base={1020} tone={0.3} seed={2} />
          <Mist y={820} h={240} />
          <Peak pts={K_MAIN} base={1560} tone={0.9} seed={3} />
          <path d={K_MOUTH} fill="url(#caveDark)" />
          <path d={K_MOUTH} fill="none" stroke={P.ink} strokeWidth={5} filter="url(#inkEdge)" />
          {/* winding path up to the cave */}
          <path d="M120 1900 Q300 1700 220 1560 Q160 1440 420 1360 Q560 1310 600 1244" stroke={P.inkLight} strokeWidth={46} fill="none" opacity={0.55} filter="url(#inkEdge)" />
          <path d="M120 1900 Q300 1700 220 1560 Q160 1440 420 1360 Q560 1310 600 1244" stroke={P.paper} strokeWidth={24} fill="none" opacity={0.9} />
          <Mist y={1380} h={200} op={0.6} />
          {/* three men walk in */}
          {[0, 1, 2].map((i) => {
            const q = eio(t, 12.0 + i * 0.2, 13.9 + i * 0.15);
            const x = q < 0.5 ? lerp(230, 260, q * 2) : lerp(260, 590, (q - 0.5) * 2);
            const y = q < 0.5 ? lerp(1600, 1420, q * 2) : lerp(1420, 1244, (q - 0.5) * 2);
            return <Figure key={i} x={x - i * 34} y={y + i * 18} s={lerp(0.5, 0.28, q)} pose="walk" t={t} ph={i} op={1 - eo(t, 13.45 + i * 0.15, 13.95 + i * 0.15)} />;
          })}
          {/* the stone on the mountain shoulder falls into the mouth */}
          <Rock x={bx + wob} y={by} r={78} seed={12} rot={fall * 540 + wob} />
          <Dust t={t} at={16.24} x={600} y={1240} w={0.9} />
          <Rain t={t} op={0.55} />
          <Pine x={110} y={1920} s={1.15} />
          <Rock x={960} y={1880} r={210} seed={19} />
          <Grass x={800} y={1800} s={1.3} seed={5} t={t} />
          <Grass x={330} y={1860} s={1.1} seed={8} t={t} />
        </Svg>
      </Drift>
      <TitleBlock q={win(t, 11.95, 14.35)} kicker="umat sebelum kita" title="Berteduh di Gua" />
      <TitleBlock q={pop(t, 14.4) * (1 - eio(t, 17.0, 17.4))} kicker="sebongkah batu" title="Jatuh dari Gunung" />
      <Panel q={pop(t, 16.3) * (1 - eio(t, 17.0, 17.4))} top={560} w={660}><PText size={44}>mulut gua tertutup</PText></Panel>
    </>
  );
};

// ================================================================ S4 DOA 17.3–22.0 · inside the cave by the lamp
const Stalag: React.FC<{x: number; w: number; h: number; down?: boolean}> = ({x, w, h, down}) => (
  <path d={down ? `M${x - w} -10 Q${x - w * 0.2} ${h * 0.6} ${x} ${h} Q${x + w * 0.3} ${h * 0.5} ${x + w} -10 Z` : `M${x - w} 1930 Q${x - w * 0.3} ${1930 - h * 0.5} ${x} ${1930 - h} Q${x + w * 0.2} ${1930 - h * 0.6} ${x + w} 1930 Z`}
    fill={P.ink} filter="url(#inkEdge)" />
);
const Doa: React.FC<{t: number}> = ({t}) => {
  const pray = eo(t, 19.1, 19.8);
  return (
    <>
      <Drift t={t} from={17.3} to={22.25} i={3} zoom={1.08} origin="50% 55%">
        <Svg bg="#2A251E">
          <Cun x0={-60} y0={-40} x1={1140} y1={1200} n={70} seed={61} color={P.inkLight} op={0.16} w={5} />
          {/* the sealed mouth on the back wall */}
          <path d={polyD(mouthPts(540, 1120, 360, 520, 9))} fill={P.ink} />
          <Rock x={540} y={830} r={300} seed={7} op={0.8} />
          <rect x={-100} y={1080} width={1280} height={900} fill={P.ink2} />
          <path d="M-100 1090 Q540 1060 1180 1090" stroke={P.ink} strokeWidth={8} fill="none" filter="url(#inkEdge)" />
          <Lamp x={430} y={1112} s={0.9} t={t} glowR={420} />
          <ellipse cx={520} cy={1180} rx={520} ry={120} fill="url(#lampGlow)" opacity={0.35} />
          {/* three men kneel facing the stone, praying (seen from behind) */}
          {[250, 540, 830].map((x, i) => <Figure key={i} x={x} y={1140 + (i === 1 ? 14 : 0)} s={1.3} pose="kneel" pray={pray} />)}
          <Stalag x={60} w={170} h={520} /><Stalag x={1010} w={150} h={460} /><Stalag x={430} w={70} h={240} />
          <Stalag x={140} w={130} h={300} down /><Stalag x={930} w={110} h={240} down />
          <Rock x={240} y={1900} r={180} seed={44} dark /><Rock x={760} y={1930} r={200} seed={52} dark />
        </Svg>
      </Drift>
      <TitleBlock q={pop(t, 17.5)} kicker={t < 20.4 ? 'berdoa kepada Allah' : 'tawasul dengan amal saleh'} title="Satu Jalan Keluar" dark />
      <Meter q={eo(t, 18.0, 18.6)} k={0} label="0 / 3 AMAL" />
    </>
  );
};

// ================================================================ S5 AMAL 1 · bakti orang tua 22.0–36.3 · veranda at night
const Mat: React.FC<{x: number; y: number; s?: number; op?: number}> = ({x, y, s = 1, op = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <ellipse cy={8} rx={220} ry={22} fill="url(#shadow)" />
    <path d="M-200 0 L-160 -40 L190 -40 L210 0 Z" fill="#C9B48A" stroke={P.ink} strokeWidth={4} />
    <path d="M-110 -40 Q-90 -100 20 -104 Q140 -100 170 -40 Z" fill={P.inkMid} stroke={P.ink} strokeWidth={4} filter="url(#inkEdge)" />
    <path d="M-60 -70 Q20 -84 120 -60" stroke={P.ink2} strokeWidth={4} fill="none" opacity={0.7} />
    <ellipse cx={-140} cy={-56} rx={44} ry={20} fill={P.paper} stroke={P.ink} strokeWidth={3} />
  </g>
);
const Amal1: React.FC<{t: number}> = ({t}) => {
  const dawn = eio(t, 32.6, 35.0);
  const night = 1 - dawn;
  const sleep = eo(t, 30.6, 31.2);
  const a = lerp(-160, -30, eio(t, 24.0, 35.0));
  const mx = 540 + Math.cos((a * Math.PI) / 180) * 380;
  const my = 1100 + Math.sin((a * Math.PI) / 180) * 420;
  const walkQ = eio(t, 29.3, 30.4);
  const held = t >= 31.69;
  return (
    <>
      <Drift t={t} from={22.0} to={36.55} i={4}>
        <Svg>
          <rect x={-100} y={-100} width={1280} height={1400} fill={P.ink2} opacity={0.5 * night} />
          <rect x={-100} y={-100} width={1280} height={1400} fill="url(#dawnWash)" opacity={dawn} />
          <circle cx={mx} cy={my} r={dawn > 0.5 ? 70 : 52} fill={dawn > 0.5 ? P.cinnabar2 : P.paper} />
          <circle cx={mx} cy={my} r={220} fill={dawn > 0.5 ? 'url(#sunGlow)' : 'url(#lampGlow)'} opacity={0.25 + dawn * 0.6} />
          <Peak pts={[[-100, 1000], [140, 820], [300, 900], [460, 760], [640, 880], [820, 780], [1180, 940]]} base={1150} tone={0.45 + 0.1 * night} seed={6} />
          <Mist y={960} h={240} />
          {/* veranda: eaves above, posts, plank floor */}
          <path d="M-100 -100 L1180 -100 L1180 500 Q540 560 -100 500 Z" fill={P.ink} filter="url(#inkEdge)" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <line key={i} x1={-40 + i * 190} y1={440} x2={-60 + i * 190} y2={530} stroke={P.ink2} strokeWidth={10} />)}
          <rect x={90} y={480} width={48} height={800} fill={P.ink} filter="url(#inkEdge)" />
          <rect x={942} y={470} width={48} height={810} fill={P.ink} filter="url(#inkEdge)" />
          <path d="M-100 1250 L1180 1250 L1180 1940 L-100 1940 Z" fill="#CDBB94" />
          {Array.from({length: 13}, (_, i) => {
            const xb = -900 + i * 240;
            return <line key={i} x1={540 + (xb - 540) * 0.28} y1={1250} x2={xb} y2={1940} stroke={P.ink2} strokeWidth={3} opacity={0.4} />;
          })}
          {[1250, 1320, 1420, 1560, 1740].map((y, i) => <line key={i} x1={-100} y1={y} x2={1180} y2={y} stroke={P.ink2} strokeWidth={2 + i} opacity={0.35} />)}
          <rect x={-100} y={1250} width={1280} height={700} fill={P.ink} opacity={0.35 * night} />
          {/* the parents asleep: mats only, never drawn */}
          <Mat x={290} y={1640} s={1.0} op={eo(t, 24.0, 24.8)} />
          <Mat x={330} y={1800} s={1.12} op={eo(t, 24.3, 25.1)} />
          {[0, 1, 2].map((i) => {
            const k = (t * 0.5 + i / 3) % 1;
            return <text key={i} x={330 + k * 70 + i * 10} y={1540 - k * 140} fontFamily={BRUSH} fontSize={50 + i * 8} fill={night > 0.5 ? P.paper : P.ink} opacity={sleep * (1 - k) * 0.85}>z</text>;
          })}
          {/* the bowl of milk waits on a tray until he takes it */}
          {!held && (
            <g transform="translate(770 1330)" opacity={eo(t, 26.3, 26.9)}>
              <ellipse cy={6} rx={110} ry={14} fill="url(#shadow)" />
              <rect x={-90} y={-14} width={180} height={18} rx={6} fill="url(#wood)" stroke={P.ink} strokeWidth={3} />
              <path d="M-50 -14 Q0 30 50 -14 Z" transform="translate(0 -30)" fill={P.inkMid} stroke={P.ink} strokeWidth={4} />
              <ellipse cy={-44} rx={50} ry={10} fill={P.paper} stroke={P.ink} strokeWidth={3} />
            </g>
          )}
          <Figure x={lerp(1180, 770, walkQ)} y={1340} s={1.85} pose={walkQ > 0 && walkQ < 1 ? 'walk' : 'stand'} dir={-1} t={t} bowl={held} op={walkQ > 0 ? 1 : 0} />
          {held && [0, 1, 2].map((i) => {
            const k = (t * 0.6 + i / 3) % 1;
            return <path key={i} d={`M${574 + i * 18} 1040 q 10 -20 0 -40`} transform={`translate(0 ${-k * 60})`} stroke={P.paper} strokeWidth={4} fill="none" opacity={(1 - k) * 0.8} />;
          })}
          {/* the children crying at his feet: small bundles and tears */}
          {[620, 900].map((x, i) => (
            <g key={i} opacity={eo(t, 34.4, 34.8)}>
              <Figure x={x} y={1360} s={0.55} pose="kneel" />
              {[0, 1, 2].map((d) => {
                const k = ((t - 34.4) * 1.4 + d / 3 + i * 0.4) % 1;
                return <path key={d} d="M0 0 C-8 12 -8 20 0 22 C8 20 8 12 0 0 Z" transform={`translate(${x + 30} ${1230 + k * 70}) scale(1.4)`} fill={P.ink2} opacity={t > 34.4 ? (1 - k) * 0.7 : 0} />;
              })}
            </g>
          ))}
        </Svg>
      </Drift>
      <TitleBlock q={pop(t, 22.4) * (1 - eio(t, 25.9, 26.3))} kicker="AMAL 1" title="Bakti Orang Tua" dark />
      <Panel q={win(t, 26.3, 31.4)} top={500} w={700}><PText size={44}>ayah-ibu didahulukan</PText></Panel>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', opacity: Math.min(1, pop(t, 31.8) * 1.4) * (1 - eio(t, 35.9, 36.3)), fontFamily: BRUSH, fontSize: 104, color: P.glow, transform: 'rotate(-3deg)', textShadow: '0 4px 20px rgba(0,0,0,.85)'}}>sampai fajar…</div>
    </>
  );
};

// ================================================================ cave cut after amal 1 · macro of the crack
const Gua1: React.FC<{t: number}> = ({t}) => {
  const q = eo(t, 36.28, 37.2);
  const gap = lerp(0, 30, q);
  const sh = shakeAt(t, [36.28], 8, 0.6);
  const wall: Pt[] = [[-100, -100], [470, -100], [452, 260], [486, 520], [446, 820], [478, 1100], [440, 1380], [470, 1660], [450, 2020], [-100, 2020]];
  return (
    <>
      <Drift t={t} from={36.05} to={37.85} i={5} zoom={1.0}>
        <Svg bg={P.ink} shake={sh}>
          {/* light through the crack */}
          <rect x={430} y={-100} width={60 + gap} height={2120} fill={P.glow} opacity={0.2 + q * 0.7} filter="url(#soft)" />
          <polygon points={`${470 + gap / 2},300 ${490 + gap},300 ${360 + gap * 6},1920 ${-40},1920`} fill="url(#beam)" opacity={q * 0.5} />
          {/* the boulder face (right) slides away a little */}
          <g transform={`translate(${gap} 0)`}>
            <Rock x={1160} y={960} r={720} seed={7} />
          </g>
          {/* the cave wall (left) */}
          <g filter="url(#inkEdge)">
            <path d={polyD(wall)} fill="url(#rockDark)" />
            <path d={lineD(wall.slice(1, 9))} fill="none" stroke={P.ink} strokeWidth={8} />
          </g>
          <Cun x0={-60} y0={0} x1={420} y1={1900} n={40} seed={71} color={P.inkLight} op={0.3} w={5} />
          <Rock x={240} y={1880} r={220} seed={33} dark />
          <Rock x={880} y={1930} r={180} seed={36} dark />
        </Svg>
      </Drift>
      <TitleBlock q={pop(t, 36.43)} kicker="sedikit" title="Batu Bergeser" dark />
      <Meter q={eo(t, 36.15, 36.55)} k={lerp(0, 1 / 3, q)} label="1 / 3 AMAL" />
    </>
  );
};

// ================================================================ S6 AMAL 2 · menjaga diri 37.6–52.1 · village in a hard year
const DryTree: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={P.ink} fill="none" strokeLinecap="round" filter="url(#inkEdge)">
    <path d="M0 0 Q-20 -200 10 -420 Q20 -520 -30 -620" strokeWidth={26} />
    <path d="M6 -300 Q80 -360 150 -380 M120 -370 L170 -440 M-6 -420 Q-80 -470 -130 -540 M-100 -510 L-160 -520 M-20 -560 Q20 -640 60 -700" strokeWidth={9} />
  </g>
);
const Amal2: React.FC<{t: number}> = ({t}) => {
  const pouchQ = eo(t, 43.7, 44.2);
  const red = win(t, 46.2, 49.9, 0.5);
  const coins = Math.round(lerp(0, 120, eo(t, 44.12, 44.85)));
  const away = eio(t, 49.97, 51.7);
  const turned = t >= 49.97;
  return (
    <>
      <Drift t={t} from={37.6} to={52.35} i={6}>
        <Svg>
          <rect x={-100} y={-100} width={1280} height={1400} fill={P.paper2} opacity={0.7} />
          <circle cx={300} cy={760} r={70} fill={P.paper} opacity={0.9} />
          <Peak pts={[[-100, 980], [160, 800], [320, 880], [520, 760], [700, 860], [880, 790], [1180, 900]]} base={1120} tone={0.28} seed={8} />
          <Mist y={940} h={220} />
          {/* her house: a closed wooden door (she is never drawn) */}
          <g opacity={eo(t, 38.6, 39.4)}>
            <path d="M560 1000 L810 900 L1060 1000 L1040 1020 L580 1020 Z" fill={P.ink} filter="url(#inkEdge)" />
            <rect x={610} y={1010} width={400} height={240} fill={P.paper} stroke={P.ink} strokeWidth={6} filter="url(#inkEdge)" />
            <Cun x0={620} y0={1020} x1={1000} y1={1240} n={10} seed={81} op={0.25} />
            <rect x={730} y={1040} width={150} height={210} fill="url(#wood)" stroke={P.ink} strokeWidth={5} />
            {[0, 1, 2].map((i) => <line key={i} x1={768 + i * 38} y1={1044} x2={768 + i * 38} y2={1246} stroke={P.ink} strokeWidth={3} opacity={0.6} />)}
            <circle cx={860} cy={1150} r={8} fill={P.ink} />
          </g>
          <DryTree x={130} y={1270} s={1.05} />
          {/* hard year: dry, cracked ground */}
          <rect x={-100} y={1250} width={1280} height={700} fill="#D6C59E" />
          <path d="M-100 1250 Q540 1236 1180 1252" stroke={P.ink} strokeWidth={6} fill="none" filter="url(#inkEdge)" />
          <path d="M60 1330 l70 30 l-24 44 l80 22 M380 1300 l40 54 l-34 30 l50 40 M700 1340 l-56 44 l66 24 M900 1300 l30 60 l-40 40" stroke={P.ink2} strokeWidth={4} fill="none" opacity={0.6} />
          <rect x={-100} y={1250} width={1280} height={700} fill={P.cinnabar} opacity={0.16 * red} />
          <rect x={-100} y={-100} width={1280} height={1350} fill={P.cinnabar} opacity={0.12 * red} />
          {/* the pouch: tied cloth bag, gold coins spilling */}
          <g transform={`translate(600 1290) scale(${0.5 + 0.5 * pouchQ})`} opacity={pouchQ}>
            <ellipse cy={6} rx={120} ry={16} fill="url(#shadow)" />
            <path d="M-90 0 Q-124 -80 -74 -136 Q-50 -160 -34 -168 L34 -168 Q50 -160 74 -136 Q124 -80 90 0 Z" fill={P.inkMid} stroke={P.ink} strokeWidth={5} filter="url(#inkEdge)" />
            <path d="M-50 -130 Q-66 -70 -40 -10 M24 -144 Q50 -76 34 -10" stroke={P.ink} strokeWidth={5} fill="none" opacity={0.5} />
            <path d="M-38 -168 Q0 -156 38 -168 L30 -188 Q0 -178 -30 -188 Z" fill={P.cinnabar} />
          </g>
          {pouchQ > 0 && Array.from({length: 14}, (_, i) => {
            const k = eo(t, 44.12 + i * 0.05, 44.6 + i * 0.05);
            const x = 670 + rnd(i) * 150;
            const y = lerp(1180, 1300 - (i % 3) * 10, k);
            return <ellipse key={i} cx={x} cy={y} rx={22} ry={9} fill={P.lampWarm} stroke={P.ink} strokeWidth={3} opacity={k > 0 ? 1 : 0} />;
          })}
          <Figure x={lerp(330, -200, away)} y={1300} s={1.7} pose={away > 0 && away < 1 ? 'walk' : 'stand'} dir={turned ? -1 : 1} t={t} op={eo(t, 39.6, 40.2)} />
          <Footprints t={t} from={50.1} dur={1.5} x0={430} x1={-30} y={1380} />
          <Grass x={300} y={1760} s={1.1} seed={12} t={t} color={P.ink2} />
          <Grass x={840} y={1800} s={1.2} seed={17} t={t} color={P.ink2} />
          <Rock x={80} y={1880} r={230} seed={61} />
          <Rock x={1010} y={1900} r={200} seed={66} />
        </Svg>
      </Drift>
      <TitleBlock q={pop(t, 38.2) * (1 - eio(t, 41.6, 42.0))} kicker="AMAL 2" title="Menjaga Diri dari Zina" size={72} />
      <Panel q={win(t, 42.0, 43.9)} top={540} w={620}><PText size={46}>masa paceklik</PText></Panel>
      <Panel q={pop(t, 44.0) * (1 - eio(t, 47.0, 47.4))} top={520} w={620}>
        <PBig size={120}>{coins}</PBig>
        <PText size={38} color={P.inkMid}>DINAR (HR Bukhari)</PText>
      </Panel>
      <Panel q={pop(t, 48.3) * (1 - eio(t, 49.9, 50.3))} top={540} w={860}><PBig size={70} color={P.ink}>“Takutlah kepada Allah”</PBig></Panel>
      <Panel q={pop(t, 50.4) * (1 - eio(t, 51.6, 52.0))} top={540} w={720}><PText size={44}>emas itu ditinggalkan</PText></Panel>
    </>
  );
};

// ================================================================ cave cut after amal 2 · low side angle, light beam across the men
const Gua2: React.FC<{t: number}> = ({t}) => {
  const q = eo(t, 52.09, 53.0);
  const gx = lerp(36, 90, q);
  const sh = shakeAt(t, [52.09], 8, 0.6);
  return (
    <>
      <Drift t={t} from={51.85} to={54.45} i={7} zoom={1.0}>
        <Svg bg="#221E18" shake={sh}>
          <Cun x0={-60} y0={-40} x1={1140} y1={1300} n={60} seed={91} color={P.inkLight} op={0.14} w={5} />
          {/* ceiling and left wall in silhouette */}
          <path d="M-100 -100 L1180 -100 L1180 260 Q900 380 640 330 Q360 280 120 420 L-100 520 Z" fill={P.ink} filter="url(#inkEdge)" />
          {/* the gap between the wall and the boulder, with the beam */}
          <rect x={620} y={300} width={gx} height={1060} fill={P.glow} opacity={0.85} filter="url(#soft)" />
          <polygon points={`${620},360 ${620 + gx},360 ${560 + gx * 2},1500 ${-120},1560`} fill="url(#beam)" opacity={0.55 + q * 0.2} />
          <g transform={`translate(${gx - 36} 0)`}>
            <Rock x={1040} y={940} r={460} seed={7} />
          </g>
          <path d="M-100 1340 Q540 1310 1180 1340 L1180 1960 L-100 1960 Z" fill={P.ink2} />
          <ellipse cx={330} cy={1440} rx={420} ry={80} fill="url(#lampGlow)" opacity={0.3 + q * 0.3} />
          {[200, 360, 520].map((x, i) => <Figure key={i} x={x} y={1360 + i * 6} s={1.25} pose="kneel" pray={0.6} />)}
          <Stalag x={40} w={160} h={420} /><Stalag x={980} w={150} h={360} />
          <Rock x={700} y={1930} r={200} seed={77} dark />
        </Svg>
      </Drift>
      <TitleBlock q={pop(t, 52.24)} kicker="celah masih sempit" title="Batu Bergeser" dark />
      <Meter q={eo(t, 51.95, 52.35)} k={lerp(1 / 3, 2 / 3, q)} label="2 / 3 AMAL" />
    </>
  );
};

// ================================================================ S7 AMAL 3 · amanah upah 54.2–69.4 · valley pasture
const HERD: {at: number; pts: Pt[]; x: number; s: number; box: [number, number, number, number]}[] = [
  {at: 61.94, pts: CAMEL, x: 270, s: 0.9, box: [-170, 120, -320, -200]},
  {at: 62.35, pts: COW, x: 560, s: 0.85, box: [-180, 120, -260, -140]},
  {at: 62.99, pts: GOAT, x: 800, s: 0.9, box: [-90, 70, -180, -100]},
  {at: 63.1, pts: GOAT, x: 920, s: 0.7, box: [-90, 70, -180, -100]},
];
const Amal3: React.FC<{t: number}> = ({t}) => {
  const go = eio(t, 66.9, 69.2);
  const sackQ = eo(t, 59.95, 60.5) * (1 - eo(t, 61.6, 62.0));
  const shown = HERD.filter((h, i) => i < 3 && t >= h.at).length + (t >= 63.59 ? 1 : 0);
  const leave = eio(t, 58.03, 59.7);
  const back = eio(t, 64.63, 65.9);
  return (
    <>
      <Drift t={t} from={54.2} to={69.65} i={8}>
        <Svg>
          <rect x={-100} y={-100} width={1280} height={1400} fill="url(#dawnWash)" opacity={0.45} />
          <Peak pts={[[-100, 860], [100, 620], [240, 700], [400, 540], [560, 660], [720, 560], [880, 680], [1180, 600]]} base={980} tone={0.28} seed={10} />
          <Mist y={800} h={220} />
          <Peak pts={[[-100, 1120], [180, 900], [380, 1000], [600, 860], [820, 980], [1000, 900], [1180, 1000]]} base={1260} tone={0.55} seed={11} />
          <Mist y={1080} h={220} />
          <rect x={-100} y={1290} width={1280} height={700} fill={P.paper2} />
          <path d="M-100 1292 Q540 1276 1180 1294" stroke={P.ink} strokeWidth={5} fill="none" filter="url(#inkEdge)" />
          {Array.from({length: 18}, (_, i) => <Grass key={i} x={rnd(i * 3.3) * 1080} y={1340 + rnd(i * 5.1) * 300} s={0.45 + rnd(i) * 0.3} seed={i} t={t} color={P.inkMid} />)}
          {/* the worker leaves without his wage */}
          <Figure x={lerp(400, -160, leave)} y={1330} s={1.3} pose={leave > 0 && leave < 1 ? 'walk' : 'stand'} dir={-1} t={t} op={eo(t, 56.9, 57.4) * (leave < 1 ? 1 : 0)} />
          <Footprints t={t} from={58.1} dur={1.5} x0={380} x1={-30} y={1400} />
          {/* the wage: one sack of rice (riwayat Muslim: satu faraq) */}
          {sackQ > 0 && (
            <g transform={`translate(560 1320) scale(${0.6 + 0.4 * sackQ})`} opacity={sackQ}>
              <ellipse cy={6} rx={150} ry={20} fill="url(#shadow)" />
              <path d="M-130 0 Q-170 -120 -110 -230 L-60 -260 L60 -260 L110 -230 Q170 -120 130 0 Z" fill="#D9CBA8" stroke={P.ink} strokeWidth={6} filter="url(#inkEdge)" />
              <path d="M-70 -220 Q-96 -120 -70 -20 M40 -230 Q70 -120 50 -20" stroke={P.ink2} strokeWidth={5} fill="none" opacity={0.5} />
              <path d="M-60 -260 Q0 -240 60 -260 L70 -296 Q0 -276 -70 -296 Z" fill={P.ink2} />
              {Array.from({length: 9}, (_, i) => <ellipse key={i} cx={-60 + (i % 5) * 30} cy={-300 - Math.floor(i / 5) * 14} rx={9} ry={5} fill={P.paper} stroke={P.ink} strokeWidth={2} />)}
            </g>
          )}
          {/* the wage grows into a herd in ink wash */}
          {HERD.map((h, i) => {
            const q = pop(t, h.at, 0.5);
            if (q <= 0) return null;
            const x = h.x - go * 160 + Math.sin(t * 3 + i) * 3;
            const [x0, x1, y0, y1] = h.box;
            return (
              <g key={i} transform={`translate(${x} 1330) scale(${h.s * Math.min(1, q)})`} opacity={Math.min(1, q * 1.5)}>
                <ellipse cy={6} rx={230} ry={24} fill="url(#shadow)" />
                <path d={polyD(h.pts)} fill="url(#beastG)" stroke={P.ink} strokeWidth={8} filter="url(#inkEdgeStrong)" />
                <DryBrush x0={x0 + (x1 - x0) * 0.12} y0={y0 + 30} x1={x1 - (x1 - x0) * 0.12} y1={y1 - 20} n={8} seed={i * 23 + 7} vertical={false} />
                <g stroke={P.ink} strokeLinecap="round" opacity={0.8}>
                  {Array.from({length: 14}, (_, k) => {
                    const bx = lerp(x0 + 20, x1 - 20, k / 13);
                    return <path key={k} d={`M${bx.toFixed(1)} ${(y0 + 14).toFixed(1)} q${(-10 - rnd(i + k) * 10).toFixed(1)} ${(-16 - rnd(i * 3 + k) * 14).toFixed(1)} ${(-24 - rnd(i * 5 + k) * 10).toFixed(1)} ${(-10 - rnd(i * 7 + k) * 10).toFixed(1)}`} strokeWidth={3 + rnd(i * 2 + k) * 3} fill="none" />;
                  })}
                </g>
                <ellipse cx={(x0 + x1) / 2} cy={y0 + 18} rx={(x1 - x0) * 0.4} ry={22} fill={P.paper} opacity={0.28} />
                <Cun x0={x0} y0={y0 + 20} x1={x1} y1={y1} n={9} seed={i * 17 + 3} color={P.ink} op={0.55} w={4} />
              </g>
            );
          })}
          {/* years later he returns: everything is handed over */}
          <Figure x={lerp(-160, 150, back)} y={1520} s={1.45} pose={back > 0 && back < 1 ? 'walk' : 'stand'} dir={1} t={t} op={back > 0 ? 1 : 0} />
          <Rock x={60} y={1900} r={200} seed={88} />
          <Rock x={1030} y={1890} r={190} seed={92} />
          <Grass x={860} y={1780} s={1.3} seed={31} t={t} />
          <Grass x={330} y={1840} s={1.1} seed={37} t={t} />
        </Svg>
      </Drift>
      <TitleBlock q={pop(t, 54.6) * (1 - eio(t, 56.1, 56.5))} kicker="AMAL 3" title="Amanah Upah Pekerja" size={74} />
      <Panel q={win(t, 56.5, 59.8)} top={520} w={720}><PText size={44}>upah belum diambil</PText></Panel>
      <Panel q={win(t, 59.95, 61.85)} top={520} w={720}><PText size={44}>upah: satu faraq beras</PText></Panel>
      <Panel q={eo(t, 61.9, 62.3) * (1 - eio(t, 66.4, 66.8))} top={520} w={900}>
        <PText size={36} color={P.inkMid}>upah yang dikembangkan</PText>
        <PText size={50}>{['UNTA', 'SAPI', 'KAMBING', 'BUDAK'].slice(0, Math.max(1, shown)).join(' · ')}</PText>
      </Panel>
      <Panel q={pop(t, 66.66) * (1 - eio(t, 69.0, 69.4))} top={520} w={760}><PBig size={80}>semua diserahkan</PBig></Panel>
    </>
  );
};

// ================================================================ S8 PAYOFF 69.4–74.5 · sunrise outside, the stone rolls away
const PAY_CLIFF = 'M-100 900 L100 820 L260 760 L420 840 L560 980 L640 1150 L700 1360 L-100 1360 Z';
const PAY_MOUTH = polyD(mouthPts(330, 1340, 130, 200, 4));
const Payoff: React.FC<{t: number}> = ({t}) => {
  const roll = ein(t, 69.57, 70.2) * 0.25 + eio(t, 70.2, 72.6) * 0.75;
  const bx = lerp(330, 900, roll);
  const by = lerp(1230, 1440, roll) - Math.sin(roll * Math.PI) * 40;
  const flash = Math.max(0, 1 - Math.abs(t - 70.2) / 0.3);
  const light = eo(t, 70.2, 71.6);
  const sh = shakeAt(t, [70.2], 20, 0.6);
  return (
    <>
      <Drift t={t} from={69.4} to={74.75} i={9} zoom={1.15} zoomTo={1.0} origin="40% 60%">
        <Svg shake={sh}>
          <rect x={-100} y={-100} width={1280} height={1500} fill="url(#dawnWash)" opacity={0.6 + 0.4 * light} />
          <circle cx={820} cy={lerp(860, 800, light)} r={320} fill="url(#sunGlow)" opacity={0.6 + 0.4 * light} />
          <circle cx={820} cy={lerp(860, 800, light)} r={110} fill={P.cinnabar2} filter="url(#bleed)" />
          <Peak pts={[[-100, 960], [140, 760], [320, 860], [520, 720], [700, 840], [900, 740], [1180, 880]]} base={1100} tone={0.3} seed={12} />
          <Mist y={900} h={240} />
          <g filter="url(#inkEdge)">
            <path d={PAY_CLIFF} fill="url(#cliffG)" />
            <path d="M-100 900 L100 820 L260 760 L420 840 L560 980 L640 1150 L700 1360" fill="none" stroke={P.ink} strokeWidth={7} />
          </g>
          <clipPath id="payCliff"><path d={PAY_CLIFF} /></clipPath>
          <g clipPath="url(#payCliff)"><Cun x0={-60} y0={800} x1={700} y1={1340} n={36} seed={13} op={0.5} w={5} /></g>
          <path d={PAY_MOUTH} fill="url(#caveDark)" />
          <path d={PAY_MOUTH} fill={P.glow} opacity={0.45 * light} />
          <path d={PAY_MOUTH} fill="none" stroke={P.ink} strokeWidth={7} filter="url(#inkEdge)" />
          {/* slope and the bright path */}
          <path d="M-100 1350 L700 1350 Q900 1380 1180 1460 L1180 1960 L-100 1960 Z" fill={P.paper2} />
          <path d="M-100 1350 L700 1350 Q900 1380 1180 1460" stroke={P.ink} strokeWidth={6} fill="none" filter="url(#inkEdge)" />
          <path d="M330 1350 Q420 1520 600 1640 Q760 1740 820 1960" stroke={P.glow} strokeWidth={90} fill="none" opacity={0.75 * light} filter="url(#soft)" />
          {/* the boulder rolls down to the right */}
          <Rock x={bx} y={by} r={130} seed={7} rot={roll * 400} />
          <Dust t={t} at={70.2} x={420} y={1360} w={1.1} />
          {/* the three walk out toward the light */}
          {[0, 1, 2].map((i) => {
            const q = eio(t, 71.7 + i * 0.25, 74.6);
            return <Figure key={i} x={lerp(330 + i * 20, 560 + i * 110, q)} y={lerp(1340, 1640 + i * 20, q)} s={lerp(0.6, 1.15, q)} pose="walk" t={t} ph={i * 1.3} op={eo(t, 71.7 + i * 0.25, 72.0 + i * 0.25)} />;
          })}
          <Grass x={120} y={1820} s={1.4} seed={41} t={t} />
          <Grass x={220} y={1880} s={1.1} seed={43} t={t} />
          <Rock x={40} y={1900} r={200} seed={95} />
          <Grass x={980} y={1840} s={1.2} seed={47} t={t} />
        </Svg>
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 700px 900px at 40% 60%, rgba(255,233,184,0.9), rgba(255,233,184,0) 70%)', opacity: flash * 0.6, mixBlendMode: 'screen'}} />
      </Drift>
      <Meter q={eo(t, 69.5, 69.9) * (1 - eio(t, 72.6, 73.0))} k={lerp(2 / 3, 1, eo(t, 70.0, 70.6))} label={t > 70.2 ? '3 / 3 AMAL' : '2 / 3 AMAL'} />
      <TitleBlock q={pop(t, 70.25)} kicker="menuju cahaya" title="Terbuka Sepenuhnya" />
    </>
  );
};

// ================================================================ S9 PELAJARAN 74.5–80.4 · horizontal scroll with three ink icons
const Icon: React.FC<{x: number; q: number; label: string; sub: string; children: React.ReactNode}> = ({x, q, label, sub, children}) => (
  <g transform={`translate(${x} 960) scale(${0.7 + 0.3 * Math.min(1, q)})`} opacity={Math.min(1, q * 1.4)}>
    <circle r={112} fill="none" stroke={P.ink} strokeWidth={6} filter="url(#inkEdge)" />
    {children}
    <text y={182} textAnchor="middle" fontFamily={HEAD} fontWeight={700} fontSize={56} fill={P.ink}>{label}</text>
    <text y={228} textAnchor="middle" fontFamily={TEXT} fontWeight={700} fontSize={36} fill={P.inkMid}>{sub}</text>
  </g>
);
const Lesson: React.FC<{t: number}> = ({t}) => {
  const open = eio(t, 74.55, 75.4);
  const hw = lerp(40, 460, open);
  return (
    <>
      <Drift t={t} from={74.5} to={END + 0.4} i={10}>
        <Svg>
          <Peak pts={[[-100, 1560], [140, 1380], [320, 1460], [520, 1340], [720, 1450], [900, 1370], [1180, 1500]]} base={1720} tone={0.5} seed={14} />
          <Mist y={1560} h={200} />
          <clipPath id="lessonClip"><rect x={540 - hw} y={600} width={hw * 2} height={720} /></clipPath>
          <g clipPath="url(#lessonClip)">
            <rect x={80} y={620} width={920} height={680} fill="#C9B48A" />
            <rect x={110} y={650} width={860} height={620} fill={P.paper} />
            <Icon x={250} q={pop(t, 75.0)} label="BAKTI" sub="orang tua">
              <path d="M-60 -10 Q0 62 60 -10 Z" fill={P.inkMid} stroke={P.ink} strokeWidth={5} />
              <ellipse cy={-10} rx={60} ry={12} fill={P.paper} stroke={P.ink} strokeWidth={4} />
              <path d="M-14 -36 q 10 -20 0 -40 M14 -36 q 10 -20 0 -40" stroke={P.inkMid} strokeWidth={4} fill="none" />
            </Icon>
            <Icon x={540} q={pop(t, 75.6)} label="IFFAH" sub="kehormatan">
              <rect x={-46} y={-70} width={92} height={130} fill="url(#wood)" stroke={P.ink} strokeWidth={5} />
              <line x1={-16} y1={-66} x2={-16} y2={56} stroke={P.ink} strokeWidth={3} /><line x1={16} y1={-66} x2={16} y2={56} stroke={P.ink} strokeWidth={3} />
              <circle cx={30} cy={0} r={6} fill={P.ink} />
            </Icon>
            <Icon x={830} q={pop(t, 76.2)} label="AMANAH" sub="hak pekerja">
              <path d="M-50 50 Q-66 0 -42 -48 L-22 -60 L22 -60 L42 -48 Q66 0 50 50 Z" fill="#D9CBA8" stroke={P.ink} strokeWidth={5} />
              <path d="M-22 -60 Q0 -52 22 -60 L26 -74 Q0 -66 -26 -74 Z" fill={P.ink2} />
            </Icon>
            <SealStamp x={860} y={1200} q={eo(t, 79.2, 79.5)} s={0.42} rot={6} />
          </g>
          {[-1, 1].map((m) => (
            <g key={m}>
              <rect x={540 + m * hw - 14} y={598} width={28} height={724} rx={12} fill="url(#wood)" stroke={P.ink} strokeWidth={3} />
              <circle cx={540 + m * hw} cy={590} r={16} fill={P.ink} /><circle cx={540 + m * hw} cy={1330} r={16} fill={P.ink} />
            </g>
          ))}
          <FgInk t={t} />
        </Svg>
      </Drift>
      <TitleBlock q={pop(t, 74.8)} kicker="amal yang ikhlas" title="Jalan Keluar" size={96} />
      <Panel q={pop(t, 77.3) * (1 - eio(t, 78.9, 79.2))} top={470} w={780}><PText size={38} color={P.inkMid}>HR Bukhari 2272 · HR Muslim 2743</PText></Panel>
      <Panel q={pop(t, 79.2)} top={470} w={640}><PBig size={64}>AUDIRA QISSAH</PBig></Panel>
    </>
  );
};

// ---------------------------------------------------------------- director
type Win = readonly [number, number];
const S: Record<string, Win> = {
  hook: [0, 7.45], sumber: [7.2, 12.05], kejadian: [11.8, 17.55], doa: [17.3, 22.25], amal1: [22.0, 36.55],
  gua1: [36.3, 37.85], amal2: [37.6, 52.35], gua2: [52.1, 54.45], amal3: [54.2, 69.65], payoff: [69.4, 74.75], lesson: [74.5, END + 0.4],
};
const vis = (t: number, w: Win) => t >= w[0] && t < w[1];
const alpha = (t: number, w: Win) => (w[0] === 0 ? 1 - eio(t, w[1] - 0.25, w[1]) : win(t, w[0], w[1], 0.25));
const SCENES: [Win, React.FC<{t: number}>][] = [
  [S.hook, Hook], [S.sumber, Sumber], [S.kejadian, Kejadian], [S.doa, Doa], [S.amal1, Amal1], [S.gua1, Gua1],
  [S.amal2, Amal2], [S.gua2, Gua2], [S.amal3, Amal3], [S.payoff, Payoff], [S.lesson, Lesson],
];

const useFonts = () => {
  const [handle] = React.useState(() => delayRender('fonts'));
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const faces = [
      new FontFace('Ink Head', `url(${staticFile('fonts/CormorantGaramond-Var.ttf')})`, {weight: '300 700'}),
      new FontFace('Ink Text', `url(${staticFile('fonts/Manrope-Var.ttf')})`, {weight: '200 800'}),
      new FontFace('Ink Brush', `url(${staticFile('fonts/CaveatBrush-Regular.ttf')})`),
    ];
    Promise.all(faces.map((f) => f.load().then((ff) => document.fonts.add(ff))))
      .then(() => { setReady(true); continueRender(handle); })
      .catch(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  return ready;
};

export const Gua: React.FC = () => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const ready = useFonts();
  const tt = Math.min(t, END + 0.39);
  return (
    <AbsoluteFill style={{background: P.paper, overflow: 'hidden'}}>
      {ready && (
        <>
          {SCENES.filter(([w]) => vis(tt, w)).map(([w, Scene], i) => (
            <AbsoluteFill key={i} style={{opacity: alpha(tt, w)}}><Scene t={tt} /></AbsoluteFill>
          ))}
          {t < END && <Caption t={t} />}
        </>
      )}
      <AudiraOutro seconds={GUA_SECONDS - END} channel="AUDIRA QISSAH" handle="@AUDIRAQISSAH" />
      <AudiraSignature seed="tiga-orang-gua-ep25" handle="@AUDIRAQISSAH" />
    </AbsoluteFill>
  );
};
