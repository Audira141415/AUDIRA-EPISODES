import React from 'react';
import {Easing, interpolate, staticFile} from 'remotion';

// EP07 Hidangan dari Langit — MANUSCRIPT drawing kit (illuminated codex on a walnut desk, candlelight). SVG 2D.
// Adab: no faces; the prophet is shown only as golden light; page "text" is abstract ink strokes, never pseudo-Arabic.
// Palette contract (motion memory): warm amber / candle only. No blue, purple or cyan in light or material.
// Lighting contract: one warm key (candle / window) from the upper-left or from the candle in shot; every object on the
// desk casts a soft shadow down-right (#ds), a deep vignette closes the frame, parchment carries fibre texture.

export const K = {
  bg: '#140A05', wall: '#23140B', walnut: '#5A3519', walnutDk: '#2E1A0C', walnutLt: '#83532B',
  parch: '#EBD7AE', parchDk: '#C49F67', parchLt: '#F8EBCB', ink: '#2A170C', inkSoft: '#4A2E1A',
  gold: '#D9A944', goldLt: '#F7DB84', goldDk: '#8A611E', brass: '#B9853A', rubric: '#A3301C', oxblood: '#5E1A12',
  olive: '#7A5E24', ochre: '#B8782A', umber: '#6B4423', wax: '#8E1E18', cream: '#FBEFD2', sage: '#9C7F45',
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const IO = Easing.inOut(Easing.cubic);
const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);
export const eo = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...clamp, easing: OUT});
export const eio = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...clamp, easing: IO});
export const pop = (t: number, a: number, d = 0.45) => interpolate(t, [a, a + d], [0, 1], {...clamp, easing: BACK});
export const lerp = (a: number, b: number, q: number) => a + (b - a) * q;
export const rnd = (s: number) => {
  const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** in at a, out at b (fade), 0..1 */
export const win = (t: number, a: number, b: number, f = 0.35) => Math.min(eo(t, a, a + f), 1 - eio(t, b - f, b));
/** lighten (f>0) or darken (f<0) a #rrggbb colour */
export const shade = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

export const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>{children}</svg>
);

export const Defs: React.FC = () => (
  <defs>
    <filter id="ds" x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx={22} dy={26} stdDeviation={16} floodColor="#080302" floodOpacity={0.78} /></filter>
    <filter id="dss" x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx={7} dy={9} stdDeviation={5} floodColor="#120804" floodOpacity={0.6} /></filter>
    <filter id="blurFG" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={9} /></filter>
    <filter id="blurBG" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={5} /></filter>
    <radialGradient id="glow"><stop offset="0" stopColor="#FFF4C8" stopOpacity={1} /><stop offset="0.35" stopColor="#FFC964" stopOpacity={0.55} /><stop offset="1" stopColor="#E89A3A" stopOpacity={0} /></radialGradient>
    <radialGradient id="halo"><stop offset="0" stopColor="#FFD98A" stopOpacity={0.55} /><stop offset="0.5" stopColor="#E8963A" stopOpacity={0.16} /><stop offset="1" stopColor="#E8963A" stopOpacity={0} /></radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stopColor="#FFF0B4" /><stop offset="0.32" stopColor="#E7B54C" /><stop offset="0.55" stopColor="#9A6A1E" /><stop offset="0.78" stopColor="#F2CD6A" /><stop offset="1" stopColor="#A9741F" /></linearGradient>
    <radialGradient id="brass" cx="0.32" cy="0.25" r="0.85"><stop offset="0" stopColor="#FFF0B8" /><stop offset="0.2" stopColor="#E2AE52" /><stop offset="0.62" stopColor="#8C5E1E" /><stop offset="1" stopColor="#3E260C" /></radialGradient>
    <radialGradient id="parch" cx="0.42" cy="0.38" r="0.8"><stop offset="0" stopColor={K.parchLt} /><stop offset="0.6" stopColor={K.parch} /><stop offset="1" stopColor={K.parchDk} /></radialGradient>
    <radialGradient id="pageBurn" cx="0.45" cy="0.42" r="0.75"><stop offset="0.6" stopColor="#5A3212" stopOpacity={0} /><stop offset="1" stopColor="#5A3212" stopOpacity={0.55} /></radialGradient>
    <radialGradient id="wax" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#D0503A" /><stop offset="0.55" stopColor={K.wax} /><stop offset="1" stopColor="#3E0A06" /></radialGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF1C0" stopOpacity={0.9} /><stop offset="1" stopColor="#FFC964" stopOpacity={0} /></linearGradient>
    <radialGradient id="vig" cx="0.5" cy="0.44" r="0.78"><stop offset="0.5" stopColor="#0A0402" stopOpacity={0} /><stop offset="1" stopColor="#0A0402" stopOpacity={0.82} /></radialGradient>
    <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#120804" /><stop offset="1" stopColor="#2E1A0C" /></linearGradient>
  </defs>
);

/** candle key light: warm pool around (x,y) + darkness elsewhere, fibre texture, deep vignette */
export const Finish: React.FC<{x?: number; y?: number; r?: number; dark?: number}> = ({x = 300, y = 500, r = 1100, dark = 0.55}) => (
  <>
    <radialGradient id={`key${x}_${y}`} cx={x / 1080} cy={y / 1920} r={r / 1500} gradientUnits="objectBoundingBox">
      <stop offset="0" stopColor="#FFD58A" stopOpacity={0.22} /><stop offset="0.45" stopColor="#FFB050" stopOpacity={0} /><stop offset="1" stopColor="#0A0402" stopOpacity={dark} />
    </radialGradient>
    <rect x={0} y={0} width={1080} height={1920} fill={`url(#key${x}_${y})`} style={{mixBlendMode: 'multiply'}} />
    <rect x={0} y={0} width={1080} height={1920} fill={`url(#key${x}_${y})`} opacity={0.5} style={{mixBlendMode: 'screen'}} />
    <image href={staticFile('hidangan07/paper.png')} x={-200} y={-200} width={1480} height={2320} preserveAspectRatio="none" opacity={0.5} style={{mixBlendMode: 'soft-light'}} />
    <rect x={-200} y={-200} width={1480} height={2320} fill="url(#vig)" />
  </>
);

/** floating dust motes catching the warm light */
export const Motes: React.FC<{t: number; x?: number; y?: number; n?: number; spread?: number}> = ({t, x = 540, y = 800, n = 18, spread = 520}) => (
  <g style={{mixBlendMode: 'screen'}}>
    {Array.from({length: n}, (_, i) => {
      const life = (t * 0.06 + rnd(i)) % 1;
      const px = x + (rnd(i + 3) - 0.5) * spread * 2 + Math.sin(t * 0.7 + i) * 20;
      const py = y + (rnd(i + 7) - 0.5) * spread * 1.6 - life * 160;
      return <circle key={i} cx={px} cy={py} r={2 + rnd(i + 11) * 3} fill="#FFE2A0" opacity={Math.sin(life * Math.PI) * 0.7} />;
    })}
  </g>
);

/** walnut desk surface from y0 down, with grain and a lit front edge */
export const Desk: React.FC<{y0: number; seed?: number; tone?: string}> = ({y0, seed = 0, tone = K.walnut}) => (
  <g>
    <linearGradient id={`desk${seed}`} x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor={shade(tone, 0.12)} /><stop offset="1" stopColor={shade(tone, -0.45)} /></linearGradient>
    <rect x={-300} y={y0} width={1680} height={2400 - y0} fill={`url(#desk${seed})`} />
    {Array.from({length: 26}, (_, i) => {
      const yy = y0 + 14 + i * (20 + rnd(i + seed) * 26);
      const a = 4 + rnd(i * 3 + seed) * 10, ph = rnd(i + 9 + seed) * 6;
      const d = Array.from({length: 18}, (_, k) => `${k ? 'L' : 'M'}${-300 + k * 100} ${(yy + Math.sin(k * 0.7 + ph) * a).toFixed(1)}`).join(' ');
      return <path key={i} d={d} stroke={i % 3 ? shade(tone, -0.35) : shade(tone, 0.2)} strokeWidth={i % 4 ? 2 : 4} fill="none" opacity={0.45} />;
    })}
    <rect x={-300} y={y0} width={1680} height={6} fill={shade(tone, 0.45)} opacity={0.6} />
  </g>
);

/** dark library wall with blurred book spines (background depth) */
export const Shelves: React.FC<{y0?: number; rows?: number; op?: number}> = ({y0 = 60, rows = 2, op = 0.75}) => (
  <g filter="url(#blurBG)" opacity={op}>
    {Array.from({length: rows}, (_, r) => (
      <g key={r}>
        <rect x={-300} y={y0 + r * 430 + 380} width={1680} height={34} fill={K.walnutDk} />
        {Array.from({length: 18}, (_, i) => {
          const w = 44 + rnd(i + r * 20) * 40, h = 260 + rnd(i * 7 + r) * 110;
          const x = -200 + i * 82 + rnd(i + 5) * 10;
          const c = [K.oxblood, K.olive, K.umber, '#7A4A1C', '#3E2A16'][(i + r) % 5];
          return (
            <g key={i}>
              <rect x={x} y={y0 + r * 430 + 380 - h} width={w} height={h} fill={c} />
              <rect x={x} y={y0 + r * 430 + 400 - h} width={w} height={8} fill={K.gold} opacity={0.7} />
              <rect x={x} y={y0 + r * 430 + 340} width={w} height={6} fill={K.gold} opacity={0.6} />
            </g>
          );
        })}
      </g>
    ))}
  </g>
);

/** candle in a brass holder; origin = base of holder. Flame flickers, halo lights the scene. */
export const Candle: React.FC<{x: number; y: number; s: number; t: number; h?: number; bend?: number; blur?: boolean}> = ({x, y, s, t, h = 300, bend = 0, blur}) => {
  const fl = Math.sin(t * 9) * 0.5 + Math.sin(t * 13.7) * 0.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter={blur ? 'url(#blurFG)' : undefined}>
      <ellipse cx={0} cy={-h - 60} rx={520 + fl * 20} ry={520 + fl * 20} fill="url(#halo)" style={{mixBlendMode: 'screen'}} />
      <g filter="url(#dss)">
        <path d="M-110 0 Q -110 -30 -60 -36 L60 -36 Q 110 -30 110 0 Z" fill="url(#brass)" />
        <rect x={-48} y={-70} width={96} height={36} rx={8} fill="url(#brass)" />
        <rect x={-44} y={-70 - h} width={88} height={h} rx={6} fill="#EFE0BE" />
        <rect x={-44} y={-70 - h} width={30} height={h} fill="#FFF6E0" opacity={0.6} />
        <path d={`M-44 ${-70 - h} q 10 40 0 70 q -8 -30 -4 -70 Z M30 ${-70 - h} q 12 60 4 100 q -10 -50 -14 -100 Z`} fill="#F6E9C8" />
      </g>
      <line x1={0} y1={-70 - h} x2={0} y2={-92 - h} stroke={K.ink} strokeWidth={4} />
      <g transform={`translate(0 ${-88 - h}) rotate(${bend + fl * 3}) scale(${1 + fl * 0.06} ${1 + fl * 0.1})`}>
        <ellipse cx={0} cy={-30} rx={70} ry={90} fill="url(#glow)" opacity={0.9} />
        <path d="M0 10 Q -26 -20 0 -86 Q 26 -20 0 10 Z" fill="#FFB43C" />
        <path d="M0 4 Q -13 -18 0 -56 Q 13 -18 0 4 Z" fill="#FFF4CC" />
      </g>
    </g>
  );
};

/** abstract manuscript lines (ink strokes, deliberately not a real or pseudo-Arabic script) */
export const InkLines: React.FC<{x: number; y: number; w: number; rows: number; gap?: number; seed?: number; q?: number; color?: string; sw?: number}> = ({x, y, w, rows, gap = 34, seed = 0, q = 1, color = K.inkSoft, sw = 3}) => (
  <g opacity={0.75}>
    {Array.from({length: rows}, (_, r) => {
      const len = w * (r === rows - 1 ? 0.55 : 0.88 + rnd(r + seed) * 0.12) * Math.max(0, Math.min(1, q * rows - r));
      if (len <= 2) return null;
      let d = `M${x} ${y + r * gap}`;
      for (let k = 0; k * 12 < len; k++) d += ` q 6 ${-8 - rnd(k + r * 31 + seed) * 10} 12 0`;
      return <path key={r} d={d} stroke={r % 5 === 0 ? K.rubric : color} strokeWidth={sw} fill="none" strokeLinecap="round" />;
    })}
  </g>
);

/** parchment page with deckled shadow, fibre texture, burned edges and a double gold-leaf border; children are clipped inside */
export const Page: React.FC<{id: string; x: number; y: number; w: number; h: number; rot?: number; inset?: number; border?: boolean; children?: React.ReactNode; fill?: string}> = ({id, x, y, w, h, rot = 0, inset = 56, border = true, children, fill}) => (
  <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
    <clipPath id={`pc${id}`}><rect x={x + inset} y={y + inset} width={w - inset * 2} height={h - inset * 2} /></clipPath>
    <rect x={x} y={y} width={w} height={h} rx={6} fill={fill ?? 'url(#parch)'} filter="url(#ds)" />
    <image href={staticFile('hidangan07/paper.png')} x={x} y={y} width={w} height={h} preserveAspectRatio="none" opacity={0.55} style={{mixBlendMode: 'multiply'}} />
    <g clipPath={`url(#pc${id})`}>{children}</g>
    {border && (
      <g>
        <rect x={x + inset - 14} y={y + inset - 14} width={w - inset * 2 + 28} height={h - inset * 2 + 28} fill="none" stroke="url(#gold)" strokeWidth={9} />
        <rect x={x + inset - 1} y={y + inset - 1} width={w - inset * 2 + 2} height={h - inset * 2 + 2} fill="none" stroke={K.ink} strokeWidth={3} />
        <rect x={x + inset - 26} y={y + inset - 26} width={w - inset * 2 + 52} height={h - inset * 2 + 52} fill="none" stroke={K.rubric} strokeWidth={2} opacity={0.8} />
        {[[x + inset - 14, y + inset - 14], [x + w - inset + 14, y + inset - 14], [x + inset - 14, y + h - inset + 14], [x + w - inset + 14, y + h - inset + 14]].map(([cx, cy], i) => (
          <g key={i}><circle cx={cx} cy={cy} r={20} fill="url(#gold)" stroke={K.ink} strokeWidth={2} /><circle cx={cx} cy={cy} r={8} fill={K.rubric} /></g>
        ))}
      </g>
    )}
    <rect x={x} y={y} width={w} height={h} rx={6} fill="url(#pageBurn)" />
  </g>
);

/** miniature-painting sky (warm only), inside a page */
export const MiniSky: React.FC<{id: string; top: string; low: string; x?: number; y?: number; w?: number; h?: number}> = ({id, top, low, x = -200, y = -200, w = 1480, h = 2320}) => (
  <>
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={low} /></linearGradient>
    <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
  </>
);

/** Persian-miniature style gold ribbon cloud with an ink outline */
export const Cloud: React.FC<{x: number; y: number; s: number; op?: number; fill?: string}> = ({x, y, s, op = 1, fill = K.goldLt}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <path d="M-160 20 Q -170 -30 -120 -36 Q -110 -80 -60 -70 Q -40 -110 10 -92 Q 50 -120 90 -84 Q 140 -96 150 -50 Q 196 -40 180 6 Q 150 40 100 22 Q 60 50 10 26 Q -40 52 -80 26 Q -130 50 -160 20 Z"
      fill={fill} stroke={K.goldDk} strokeWidth={4} />
    <path d="M-110 -10 Q -80 -40 -40 -20 M0 -50 Q 40 -70 70 -40 M90 -10 Q 120 -30 150 -6" stroke={K.goldDk} strokeWidth={3} fill="none" opacity={0.7} />
  </g>
);

/** rolling miniature hills: pigment fill, ink outline, little tufts */
export const Hill: React.FC<{y: number; fill: string; amp?: number; ph?: number}> = ({y, fill, amp = 60, ph = 0}) => {
  const pts = Array.from({length: 41}, (_, i) => {
    const x = -260 + i * 40;
    return `L${x} ${(y + Math.sin(((x + 260) / 220) * 1.3 + ph) * amp).toFixed(1)}`;
  });
  return (
    <g>
      <path d={`M-260 2300 ${pts.join(' ')} L1340 2300 Z`} fill={fill} stroke={K.ink} strokeWidth={4} />
      {Array.from({length: 9}, (_, i) => {
        const x = -60 + i * 150 + rnd(i + ph * 10) * 50;
        const yy = y + Math.sin(((x + 260) / 220) * 1.3 + ph) * amp + 30;
        return <path key={i} d={`M${x} ${yy} q -6 -20 0 -34 q 6 14 0 34 M${x + 12} ${yy} q 4 -16 14 -24`} stroke={shade(fill, -0.4)} strokeWidth={3} fill="none" />;
      })}
    </g>
  );
};

/** domed miniature house with a lit window */
export const House: React.FC<{x: number; y: number; w: number; h: number; fill: string; dome?: boolean}> = ({x, y, w, h, fill, dome}) => (
  <g stroke={K.ink} strokeWidth={3}>
    <rect x={x} y={y - h} width={w} height={h + 400} fill={fill} />
    {dome ? <path d={`M${x + w * 0.12} ${y - h} Q ${x + w / 2} ${y - h - w * 0.85} ${x + w * 0.88} ${y - h} Z`} fill={K.goldLt} />
      : <rect x={x - 6} y={y - h - 14} width={w + 12} height={14} fill={shade(fill, -0.25)} />}
    <path d={`M${x + w / 2 - 14} ${y - h + 70} l0 -26 q14 -22 28 0 l0 26 Z`} fill="#FFD27A" />
    <path d={`M${x + w / 2 - 18} ${y} l0 -46 q18 -26 36 0 l0 46 Z`} fill={shade(fill, -0.45)} />
  </g>
);

/** gold radiant light — the only form the prophet ever takes. Origin = centre. */
export const Light: React.FC<{x: number; y: number; s: number; t: number; op?: number}> = ({x, y, s, t, op = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <circle r={420} fill="url(#glow)" opacity={0.75 + Math.sin(t * 2) * 0.08} style={{mixBlendMode: 'screen'}} />
    <g transform={`rotate(${t * 4})`}>
      {Array.from({length: 24}, (_, i) => {
        const a = (i / 24) * Math.PI * 2, L = i % 2 ? 230 : 300, wd = 0.06;
        return <path key={i} d={`M${Math.cos(a - wd) * 110} ${Math.sin(a - wd) * 110} L${Math.cos(a) * L} ${Math.sin(a) * L} L${Math.cos(a + wd) * 110} ${Math.sin(a + wd) * 110} Z`} fill={i % 2 ? K.goldLt : K.gold} stroke={K.goldDk} strokeWidth={2} />;
      })}
    </g>
    <circle r={118} fill="url(#gold)" stroke={K.goldDk} strokeWidth={4} />
    <circle r={84} fill="#FFF3CC" />
    <circle r={50} fill="#FFFBEB" />
  </g>
);

/** faceless robed figure in miniature pigments with an ink outline. Origin = feet centre. */
export const Robed: React.FC<{x: number; y: number; s: number; t: number; seed: number; fill: string; bow?: number; kneel?: boolean; book?: boolean; up?: number}> = ({x, y, s, t, seed, fill, bow = 0, kneel = false, book = false, up = 0}) => {
  const sway = Math.sin(t * 1.1 + seed) * 1.2;
  const h = (1 + (rnd(seed) - 0.5) * 0.12) * (kneel ? 0.66 : 1);
  const lt = shade(fill, 0.25), dk = shade(fill, -0.45);
  return (
    <g transform={`translate(${x} ${y}) scale(${s} ${s * h}) rotate(${sway + bow * 16})`} stroke={K.ink} strokeWidth={4} strokeLinejoin="round">
      <path d="M-66 0 L-54 -148 L-38 -202 L38 -202 L54 -148 L66 0 Z" fill={fill} />
      <path d="M-18 -196 L18 -196 L26 0 L-26 0 Z" fill={lt} strokeWidth={2} />
      <path d="M-66 -6 L66 -6" stroke={K.gold} strokeWidth={6} />
      <path d="M-34 -150 L-44 -6 M34 -150 L46 -6" stroke={dk} strokeWidth={3} />
      <path d="M-60 -148 L-40 -208 L40 -208 L60 -148 L30 -128 L0 -140 L-30 -128 Z" fill={shade(fill, 0.1)} />
      <g transform={`rotate(${bow * 14 - up * 12} 0 -206)`}>
        <path d="M-36 -204 L-40 -252 L-22 -292 L0 -302 L22 -292 L40 -252 L36 -204 Z" fill={K.cream} />
        <path d="M-20 -212 L-22 -254 L0 -274 L22 -254 L20 -212 Z" fill={K.ink} strokeWidth={2} />
      </g>
      {book && <path d="M-46 -120 L0 -110 L46 -120 L46 -70 L0 -60 L-46 -70 Z" fill={K.rubric} />}
    </g>
  );
};

/** brass cloche on a glazed plate (desk object). Origin = plate centre. lift = px the lid rises. */
export const Cloche: React.FC<{x: number; y: number; s: number; t: number; lift?: number; glow?: number; food?: number; lidAside?: boolean}> = ({x, y, s, t, lift = 0, glow = 0, food = 0, lidAside}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={30} cy={40} rx={300} ry={60} fill="#050201" opacity={0.6} filter="url(#blurBG)" />
    <ellipse cx={0} cy={10} rx={280} ry={70} fill="#E9DCC0" stroke={K.goldDk} strokeWidth={4} />
    <ellipse cx={0} cy={6} rx={238} ry={52} fill="#F7EEDA" />
    <ellipse cx={0} cy={6} rx={262} ry={62} fill="none" stroke="url(#gold)" strokeWidth={8} />
    {glow > 0 && <ellipse cx={0} cy={-60} rx={360} ry={260} fill="url(#glow)" opacity={glow} style={{mixBlendMode: 'screen'}} />}
    {food > 0 && <Food q={food} />}
    {!lidAside ? (
      <g transform={`translate(0 ${-lift}) rotate(${-lift * 0.08})`}>
        <path d="M-226 0 Q -230 -250 0 -262 Q 230 -250 226 0 Z" fill="url(#brass)" stroke="#3E260C" strokeWidth={4} />
        <path d="M-170 -60 Q -150 -200 -40 -226" stroke="#FFF2C0" strokeWidth={14} fill="none" opacity={0.55} strokeLinecap="round" />
        {[-120, -40, 40, 120].map((dx) => <path key={dx} d={`M${dx} -10 Q ${dx * 0.85} -150 ${dx * 0.3} -240`} stroke="#5E3E12" strokeWidth={3} fill="none" opacity={0.5} />)}
        <ellipse cx={0} cy={0} rx={230} ry={22} fill="#7A4E16" stroke="#3E260C" strokeWidth={3} />
        <ellipse cx={0} cy={-272} rx={34} ry={18} fill="url(#brass)" stroke="#3E260C" strokeWidth={3} />
        <circle cx={0} cy={-292} r={20} fill="url(#brass)" stroke="#3E260C" strokeWidth={3} />
      </g>
    ) : (
      <g transform="translate(430 -40) rotate(-62)">
        <path d="M-226 0 Q -230 -250 0 -262 Q 230 -250 226 0 Z" fill="url(#brass)" stroke="#3E260C" strokeWidth={4} />
        <ellipse cx={0} cy={0} rx={230} ry={30} fill="#5A380E" stroke="#3E260C" strokeWidth={3} />
      </g>
    )}
  </g>
);

/** bread, dates, fish and fruit on the plate (simple, warm pigments) */
export const Food: React.FC<{q: number}> = ({q}) => (
  <g opacity={q} transform={`translate(0 ${(1 - q) * -26})`} stroke={K.ink} strokeWidth={3}>
    <ellipse cx={-110} cy={-30} rx={96} ry={46} fill="#D08E45" />
    <path d="M-170 -44 Q -110 -70 -50 -44 M-150 -20 Q -110 -40 -70 -20" stroke="#8A4E18" strokeWidth={5} fill="none" />
    <path d="M10 -16 Q 80 -64 170 -24 L196 -46 L196 -2 L170 -18 Q 80 20 10 -16 Z" fill="#C9A26A" />
    <circle cx={60} cy={-34} r={5} fill={K.ink} />
    {[-30, 0, 30, -15, 15].map((dx, i) => <ellipse key={i} cx={dx + 30} cy={i < 3 ? -70 : -96} rx={20} ry={14} fill={['#7A2A14', '#A3301C', '#8E5A1A', '#6B2A12', '#B8782A'][i]} />)}
  </g>
);

/** low table (inside miniatures): cloth with rubric band and a gold dome cover. Origin = centre of the table top. */
export const Table: React.FC<{x: number; y: number; s: number; t: number; glow?: number; strings?: number; food?: number; rot?: number}> = ({x, y, s, t, glow = 0, strings = 0, food = 0, rot = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot + Math.sin(t * 1.3) * 1.2})`}>
    {glow > 0 && <ellipse cx={0} cy={-80} rx={460} ry={330} fill="url(#glow)" opacity={0.85 * glow} style={{mixBlendMode: 'screen'}} />}
    {strings > 0 && [-150, -60, 60, 150].map((sx) => <line key={sx} x1={sx * 0.4} y1={-1800} x2={sx} y2={-40} stroke={K.goldLt} strokeWidth={4} opacity={0.9 * strings} />)}
    <g stroke={K.ink} strokeWidth={4} strokeLinejoin="round">
      <rect x={-215} y={70} width={30} height={135} fill={K.walnut} />
      <rect x={185} y={70} width={30} height={135} fill={K.walnut} />
      <path d="M-255 0 L255 0 L266 74 Q 238 116 212 92 Q 170 128 128 94 Q 86 128 44 94 Q 0 128 -44 94 Q -86 128 -128 94 Q -170 128 -212 92 Q -238 116 -266 74 Z" fill={K.cream} />
      <path d="M-258 40 L258 40 L262 62 L-262 62 Z" fill={K.rubric} strokeWidth={2} />
      {[-150, -50, 50, 150].map((dx) => <path key={dx} d={`M${dx - 10} 51 l10 -9 l10 9 l-10 9 Z`} fill={K.goldLt} strokeWidth={1.5} />)}
    </g>
    {food > 0 && <g transform="scale(0.8) translate(0 -6)"><Food q={food} /></g>}
    <g opacity={food > 0 ? 1 - food : 1}>
      <path d="M-180 -4 Q -184 -170 0 -176 Q 184 -170 180 -4 Z" fill="url(#gold)" stroke={K.ink} strokeWidth={4} />
      <path d="M-130 -40 Q -110 -130 -20 -150" stroke="#FFF2C0" strokeWidth={10} fill="none" opacity={0.6} strokeLinecap="round" />
      <rect x={-196} y={-14} width={392} height={20} rx={10} fill={K.goldDk} stroke={K.ink} strokeWidth={3} />
      <circle cx={0} cy={-188} r={18} fill={K.rubric} stroke={K.ink} strokeWidth={3} />
    </g>
  </g>
);

/** wax seal stamped AUDIRA (in-world brand). Origin = centre. */
export const Seal: React.FC<{x: number; y: number; s: number; rot?: number; sub?: string}> = ({x, y, s, rot = -8, sub = 'QISSAH'}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-14 120 L-60 250 L-10 226 L20 262 L40 120 Z" fill={K.rubric} stroke={K.ink} strokeWidth={3} filter="url(#dss)" />
    <path d={Array.from({length: 16}, (_, i) => { const a = (i / 16) * Math.PI * 2, r = 132 + (i % 2 ? 10 : -6) + rnd(i) * 8; return `${i ? 'L' : 'M'}${Math.cos(a) * r} ${Math.sin(a) * r}`; }).join(' ') + ' Z'} fill="url(#wax)" filter="url(#ds)" />
    <circle r={102} fill="none" stroke="#3E0A06" strokeWidth={6} opacity={0.6} />
    <circle r={96} fill="none" stroke="#E8826A" strokeWidth={2} opacity={0.6} />
    <text y={8} textAnchor="middle" fontFamily="Hid Head" fontWeight={800} fontSize={44} fill="#F2B7A0" stroke="#3E0A06" strokeWidth={1.5} letterSpacing={2}>AUDIRA</text>
    <text y={52} textAnchor="middle" fontFamily="Hid Head" fontWeight={700} fontSize={24} letterSpacing={6} fill="#E89A80">{sub}</text>
  </g>
);

/** brass balance on the desk; tilt -1..1 (positive = right pan down) */
export const Balance: React.FC<{x: number; y: number; s: number; tilt: number; left?: React.ReactNode; right?: React.ReactNode}> = ({x, y, s, tilt, left, right}) => {
  const a = tilt * 13, rad = (a * Math.PI) / 180, L = 330;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={40} cy={170} rx={300} ry={40} fill="#050201" opacity={0.55} filter="url(#blurBG)" />
      <g stroke="#3E260C" strokeWidth={4}>
        <path d="M-190 170 L190 170 L140 120 L-140 120 Z" fill="url(#brass)" />
        <rect x={-18} y={-420} width={36} height={548} fill="url(#brass)" />
        <circle cx={0} cy={-440} r={34} fill="url(#brass)" />
        <path d="M0 -480 L-14 -520 L0 -560 L14 -520 Z" fill={K.goldLt} />
      </g>
      <g transform={`translate(0 -400) rotate(${a})`}><rect x={-L - 14} y={-12} width={L * 2 + 28} height={24} rx={12} fill="url(#gold)" stroke="#3E260C" strokeWidth={4} /></g>
      {[-1, 1].map((sd) => {
        const px = sd * Math.cos(rad) * L, py = -400 + sd * Math.sin(rad) * L;
        return (
          <g key={sd}>
            <line x1={px} y1={py} x2={px - 130} y2={py + 250} stroke={K.goldDk} strokeWidth={4} />
            <line x1={px} y1={py} x2={px + 130} y2={py + 250} stroke={K.goldDk} strokeWidth={4} />
            <g transform={`translate(${px} ${py + 250})`}>{sd < 0 ? left : right}</g>
            <path d={`M${px - 170} ${py + 250} Q ${px} ${py + 340} ${px + 170} ${py + 250} Z`} fill="url(#brass)" stroke="#3E260C" strokeWidth={4} />
          </g>
        );
      })}
    </g>
  );
};

/** illuminated roundel with a gold ring, petals, pigment field and a label banner. Origin = centre. */
export const Medallion: React.FC<{x: number; y: number; s: number; field: string; label: string; n: number; q: number; on: boolean; g?: number; children?: React.ReactNode}> = ({x, y, s, field, label, n, q, on, g, children}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {on && <circle r={330} fill="url(#glow)" opacity={0.55 * (g ?? 1)} style={{mixBlendMode: 'screen'}} />}
    <g filter="url(#dss)">
      {Array.from({length: 16}, (_, i) => {
        const a = (i / 16) * 360;
        return <path key={i} d="M0 -250 Q 26 -222 0 -196 Q -26 -222 0 -250 Z" fill={i % 2 ? K.rubric : 'url(#gold)'} stroke={K.ink} strokeWidth={2} transform={`rotate(${a})`} />;
      })}
      <circle r={200} fill="url(#gold)" stroke={K.ink} strokeWidth={4} />
      <circle r={172} fill={q > 0 ? field : shade(field, -0.5)} stroke={K.ink} strokeWidth={3} />
      <circle r={156} fill="none" stroke={K.goldLt} strokeWidth={2} strokeDasharray="6 10" />
    </g>
    <g opacity={Math.min(1, q * 2)} transform={`scale(${0.6 + 0.4 * q})`}>{children}</g>
    <g transform="translate(-180 -190)"><circle r={44} fill={K.parchLt} stroke={K.ink} strokeWidth={4} /><text y={16} textAnchor="middle" fontFamily="Hid Head" fontWeight={800} fontSize={46} fill={K.rubric}>{n}</text></g>
    <g opacity={Math.min(1, q * 2)} transform="translate(0 250)">
      <path d="M-230 -40 L230 -40 L250 0 L230 40 L-230 40 L-250 0 Z" fill={K.parchLt} stroke={K.ink} strokeWidth={4} filter="url(#dss)" />
      <text y={15} textAnchor="middle" fontFamily="Hid Head" fontWeight={800} fontSize={42} fill={K.ink}>{label}</text>
    </g>
  </g>
);

/** feather quill; origin = nib tip, pointing down-left */
export const Quill: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} filter="url(#ds)">
    <path d="M0 0 L18 -30 L30 -24 Z" fill={K.ink} />
    <path d="M22 -28 Q 200 -260 560 -640 Q 470 -380 320 -230 Q 180 -100 22 -28 Z" fill="#F3E6C8" stroke={K.goldDk} strokeWidth={3} />
    <path d="M22 -28 Q 260 -300 560 -640" stroke="#9A7A4A" strokeWidth={5} fill="none" />
    {Array.from({length: 14}, (_, i) => { const k = 0.2 + i * 0.055, px = lerp(22, 560, k), py = lerp(-28, -640, k); return <path key={i} d={`M${px} ${py} l${-60 + i * 2} ${30 - i}`} stroke="#C9B48A" strokeWidth={2} />; })}
  </g>
);

/** brass hanging lamp with a warm glow */
export const Lantern: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => (
  <g transform={`translate(${x} ${y}) rotate(${Math.sin(t * 1.4 + x) * 3}) scale(${s})`}>
    <line x1={0} y1={-500} x2={0} y2={-80} stroke={K.ink} strokeWidth={4} />
    <circle r={150} fill="url(#glow)" opacity={0.7} style={{mixBlendMode: 'screen'}} />
    <g stroke="#3E260C" strokeWidth={3}>
      <path d="M-30 -80 L30 -80 L50 -50 L-50 -50 Z" fill="url(#brass)" />
      <path d="M-50 -50 Q -70 0 -40 50 L40 50 Q 70 0 50 -50 Z" fill="#FFD27A" />
      {[-24, 0, 24].map((dx) => <path key={dx} d={`M${dx} -50 Q ${dx * 1.5} 0 ${dx} 50`} fill="none" />)}
      <path d="M-40 50 L40 50 L20 80 L-20 80 Z" fill="url(#brass)" />
    </g>
  </g>
);

export const Star: React.FC<{x: number; y: number; r: number; t: number}> = ({x, y, r, t}) => (
  <g transform={`translate(${x} ${y}) rotate(${Math.sin(t + x) * 8})`} opacity={0.75 + Math.sin(t * 3 + x) * 0.25}>
    <path d={Array.from({length: 16}, (_, i) => { const a = (i / 16) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * 0.42 : r; return `${i ? 'L' : 'M'}${Math.cos(a) * rr} ${Math.sin(a) * rr}`; }).join(' ') + ' Z'} fill="url(#gold)" stroke={K.goldDk} strokeWidth={1.5} />
  </g>
);

export const Crescent: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
  <g>
    <circle cx={x} cy={y} r={r * 2.6} fill="url(#glow)" opacity={0.35} style={{mixBlendMode: 'screen'}} />
    <path d={`M${x} ${y - r} A${r} ${r} 0 1 0 ${x} ${y + r} A${r * 0.78} ${r * 0.78} 0 1 1 ${x} ${y - r} Z`} fill="url(#gold)" stroke={K.goldDk} strokeWidth={3} transform={`rotate(-25 ${x} ${y})`} />
  </g>
);

export const Bolt: React.FC<{x: number; y: number; s: number; op: number}> = ({x, y, s, op}) => (
  <g opacity={op}>
    <ellipse cx={x} cy={y + 200} rx={300} ry={380} fill="url(#glow)" opacity={0.6} style={{mixBlendMode: 'screen'}} />
    <path d="M20 0 L-60 220 L0 220 L-50 440 L90 170 L28 170 L80 0 Z" fill="url(#gold)" stroke={K.ink} strokeWidth={4} transform={`translate(${x} ${y}) scale(${s})`} />
  </g>
);

/** gold and rubric pennants on a cord */
export const Bunting: React.FC<{x0: number; x1: number; y: number; sag: number; t: number; n?: number}> = ({x0, x1, y, sag, t, n = 11}) => (
  <g>
    <path d={`M${x0} ${y} Q ${(x0 + x1) / 2} ${y + sag * 2} ${x1} ${y}`} stroke={K.ink} strokeWidth={4} fill="none" />
    {Array.from({length: n}, (_, i) => {
      const q = (i + 0.5) / n, x = lerp(x0, x1, q), yy = y + Math.sin(q * Math.PI) * sag;
      const sw = Math.sin(t * 2 + i) * 4;
      return <path key={i} d={`M${x - 28} ${yy} L${x + 28} ${yy} L${x + sw} ${yy + 70} Z`} fill={i % 2 ? K.rubric : 'url(#gold)'} stroke={K.ink} strokeWidth={3} />;
    })}
  </g>
);

// ---- icons for the four reasons (drawn at 0,0, ~200 px; cream + gold with ink outlines)
export const IconBread: React.FC = () => (
  <g stroke={K.ink} strokeWidth={5} strokeLinejoin="round">
    <path d="M-120 40 L120 40 L100 90 L-100 90 Z" fill="url(#brass)" />
    <path d="M-110 40 Q -118 -40 -40 -56 Q 0 -86 40 -56 Q 118 -40 110 40 Z" fill="#E0A862" />
    {[-50, 0, 50].map((x) => <path key={x} d={`M${x - 18} -30 Q ${x} -52 ${x + 18} -30`} stroke="#7A4214" strokeWidth={7} fill="none" strokeLinecap="round" />)}
  </g>
);
export const IconHeart: React.FC = () => (
  <g stroke={K.ink} strokeWidth={5}>
    <path d="M0 80 C -130 -6 -118 -118 -42 -108 C -10 -104 0 -76 0 -64 C 0 -76 10 -104 42 -108 C 118 -118 130 -6 0 80 Z" fill="url(#gold)" />
    <path d="M0 44 C -80 -6 -74 -74 -28 -68 C -8 -66 0 -50 0 -42 C 0 -50 8 -66 28 -68 C 74 -74 80 -6 0 44 Z" fill={K.cream} strokeWidth={2} />
  </g>
);
export const IconCheck: React.FC = () => (
  <g stroke={K.ink} strokeWidth={5}>
    <circle r={100} fill={K.cream} />
    <path d="M-56 4 L-14 46 L62 -44 L40 -64 L-14 0 L-36 -18 Z" fill="url(#gold)" />
  </g>
);
export const IconEye: React.FC = () => (
  <g stroke={K.ink} strokeWidth={5}>
    <path d="M-130 0 Q 0 -116 130 0 Q 0 116 -130 0 Z" fill={K.cream} />
    <circle r={52} fill="url(#gold)" /><circle r={22} fill={K.ink} /><circle cx={14} cy={-14} r={9} fill="#FFF6DA" strokeWidth={0} />
  </g>
);

// ---- HUD (HTML). Two looks: 'dark' = ink-black leather with a gold double rule; 'parch' = parchment leaf with a rubric rule.
export const Card: React.FC<{q: number; top: number; children: React.ReactNode; tone?: 'dark' | 'parch' | 'rubric'; width?: number; rot?: number; left?: number}> = ({q, top, children, tone = 'dark', width = 900, rot = 0, left}) => {
  if (q <= 0.001) return null;
  const bg = tone === 'parch' ? '#EEDCB4' : tone === 'rubric' ? '#5E1A12' : '#1C110A';
  const fg = tone === 'parch' ? K.ink : '#F6E7C4';
  return (
    <div style={{position: 'absolute', left: left ?? (1080 - width) / 2, top, width, opacity: Math.min(1, q * 1.4),
      transform: `translateY(${(1 - q) * 36}px) scale(${0.94 + 0.06 * q}) rotate(${rot}deg)`, background: bg, color: fg,
      backgroundImage: `url(${staticFile('hidangan07/paper.png')})`, backgroundSize: '1080px 1920px', backgroundBlendMode: 'soft-light',
      borderRadius: 4, padding: '26px 40px', textAlign: 'center',
      border: `3px solid ${tone === 'parch' ? K.rubric : '#D9A944'}`, outline: `1.5px solid ${tone === 'parch' ? '#8A611E' : '#D9A94488'}`, outlineOffset: -12,
      boxShadow: '0 26px 40px #000000AA, 0 6px 10px #00000088'}}>
      {children}
    </div>
  );
};
export const Kicker: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = '#E2B35A'}) => (
  <div style={{fontFamily: 'Hid Head', fontWeight: 700, fontSize: 40, letterSpacing: 5, color, marginBottom: 10}}>{children}</div>
);
/** gold-leaf letters with a dark ink edge */
export const Gold: React.FC<{children: React.ReactNode; size?: number; ink?: boolean}> = ({children, size = 76, ink = true}) => (
  <div style={{fontFamily: 'Hid Head', fontWeight: 800, fontSize: size, lineHeight: 1.08, letterSpacing: 1,
    background: 'linear-gradient(180deg,#FFF3BC 0%,#EBBD55 42%,#A06E20 56%,#F3D172 78%,#C08A2E 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
    filter: ink ? 'drop-shadow(2px 2px 0 #1A0D05) drop-shadow(-1px -1px 0 #1A0D05) drop-shadow(0 8px 10px #000000aa)' : undefined}}>{children}</div>
);
export const Big: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 70, color}) => (
  <div style={{fontFamily: 'Hid Head', fontWeight: 800, fontSize: size, lineHeight: 1.06, color, letterSpacing: 0.5}}>{children}</div>
);
export const Quote: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 58}) => (
  <div style={{fontFamily: 'Hid Text', fontStyle: 'italic', fontWeight: 700, fontSize: size, lineHeight: 1.12}}>{children}</div>
);
