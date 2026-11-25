import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {buildPages} from '../../components/WordCaptions';
import {lerp, p, pb, rnd, StyleFonts} from '../../styles/shared';
import {Abs, Caption, Chip, Crystal, galonPath, Glass, Headline, hexPts, K, ps, Shot, Shots, tick, tumblerPath, txt, wave} from '../../styles/cair/kit';
import {AudiraOutro} from '../../brand/AudiraOutro';
import {AudiraSignature} from '../../brand/AudiraSignature';
import rawWords from './words.json';

// EP03 · Kenapa Es Mengapung — CAIR style (liquid + liquid glass), Remotion 2D. Audio master clock: every time below
// comes from words.json (Cartesia VO tightened to 83.9 s). Nine shots, one per narration beat; each cut is a liquid sweep.
// S1 hook rock/bolt sink, ice floats · S2 wax vs water · S3 density balance ≈1 vs 0,917 · S4 freezing expands +9%, pipes burst
// · S5 molecules lock into a hexagonal lattice · S6 myth (air bubbles) + gallium/bismuth · S7 lake freezes from the top, 4 °C
// · S8 iceberg, almost 9 of 10 below water (payoff) · S9 AUDIRA glass + Earth, sign-off.

export const END = 84.2;
export const ES_SECONDS = END + 3;
const CUTS = [6.9, 18.8, 27.0, 35.4, 49.7, 59.4, 74.8, 79.1];
const IMPACTS = [34.7, 76.5];

const DISPLAY: Record<string, string> = {Audira: 'AUDIRA'};
const WORDS = (rawWords as {text: string; start: number; end: number}[]).map((w, i) => ({i, word: DISPLAY[w.text] ?? w.text, start: w.start, end: w.end}));
const PAGES = buildPages(WORDS, 6, 30, 0.45);

const WATER = K.cyan;
const ICE = {face: '#D9F4FF', top: '#FFFFFF', side: '#8FDDFF', crack: '#A9E6FF'};
const svgAbs: React.CSSProperties = {position: 'absolute', left: 0, top: 0};
const pop = (t: number, at: number) => pb(t, at - 0.05, at + 0.35);

// ---------------------------------------------------------------- shared pieces
/** Isometric ice cube, local extent y −64…60 (124 px); `clear` = bubble-free glassy ice. */
const Ice: React.FC<{x: number; y: number; s?: number; rot?: number; op?: number; clear?: boolean}> = ({x, y, s = 1, rot = 0, op = 1, clear}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${s})`} opacity={op}>
    <polygon points="-60,-40 -36,-64 64,-64 40,-40" fill={ICE.top} fillOpacity={clear ? 0.8 : 0.96} />
    <polygon points="40,-40 64,-64 64,36 40,60" fill={ICE.side} fillOpacity={clear ? 0.6 : 0.88} />
    <rect x={-60} y={-40} width={100} height={100} rx={8} fill={ICE.face} fillOpacity={clear ? 0.5 : 0.9} />
    <path d="M -60 -40 L -36 -64 L 64 -64 L 64 36 L 40 60 L -52 60 Q -60 60 -60 52 Z" fill="none" stroke="#fff" strokeWidth={3} strokeOpacity={0.9} />
    <path d="M -46 -24 L -46 36" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.85} />
    {clear ? <path d="M 22 -28 L 30 -20" stroke="#fff" strokeWidth={5} strokeLinecap="round" /> : <path d="M -12 -20 L 2 2 L -8 22 M 2 2 L 22 12" stroke={ICE.crack} strokeWidth={3} fill="none" />}
  </g>
);
/** Centre y of an Ice cube of scale s floating at water level L with ~1/10 of its height above the surface. */
const floatY = (L: number, s: number) => L + 51.6 * s;

const Rock: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = 0}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})`}>
    <path d="M -50 10 L -32 -30 L 8 -44 L 48 -20 L 54 22 L 20 46 L -32 42 Z" fill="#6E6A80" stroke="#2A2540" strokeWidth={3} />
    <path d="M -32 -30 L 8 -44 L 48 -20 L 10 -10 Z" fill="#9B97AE" />
    <circle cx={-14} cy={14} r={5} fill="#4F4A63" /><circle cx={24} cy={20} r={4} fill="#4F4A63" />
  </g>
);
const Bolt: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = 0}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})`}>
    <rect x={-12} y={-20} width={24} height={78} rx={4} fill="#8E97AA" stroke="#2A2540" strokeWidth={3} />
    {[-6, 6, 18, 30, 42].map((yy) => <line key={yy} x1={-12} y1={yy} x2={12} y2={yy + 6} stroke="#5D6578" strokeWidth={3} />)}
    <polygon points={hexPts(0, -36, 28)} fill="#B4BCCD" stroke="#2A2540" strokeWidth={3} />
    <rect x={-6} y={-20} width={5} height={70} fill="#fff" opacity={0.35} />
  </g>
);
const Bubbles: React.FC<{x0: number; x1: number; y0: number; y1: number; t: number; n?: number; seed?: number; op?: number}> = ({x0, x1, y0, y1, t, n = 7, seed = 0, op = 0.55}) => (
  <>
    {Array.from({length: n}).map((_, k) => {
      const span = y0 - y1;
      const y = y0 - ((t * (90 + rnd(k + seed) * 80) + rnd(k * 3.1 + seed) * span) % span);
      return <circle key={k} cx={lerp(x0, x1, rnd(k * 7.7 + seed)) + Math.sin(t * 2 + k) * 6} cy={y} r={4 + rnd(k * 1.3 + seed) * 8} fill="none" stroke="#fff" strokeOpacity={op} strokeWidth={3} />;
    })}
  </>
);
const Flake: React.FC<{x: number; y: number; r: number; op?: number}> = ({x, y, r, op = 0.7}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`} opacity={op} stroke="#fff" strokeWidth={Math.max(2, r / 5)} strokeLinecap="round">
    {[0, 60, 120].map((a) => <line key={a} x1={-r * Math.cos((a * Math.PI) / 180)} y1={-r * Math.sin((a * Math.PI) / 180)} x2={r * Math.cos((a * Math.PI) / 180)} y2={r * Math.sin((a * Math.PI) / 180)} />)}
  </g>
);
/** FG snowfall (faster, larger, softer than the MG). */
const Snow: React.FC<{t: number; n?: number; y0?: number; y1?: number; seed?: number}> = ({t, n = 14, y0 = 0, y1 = 1300, seed = 0}) => (
  <>
    {Array.from({length: n}).map((_, k) => {
      const span = y1 - y0;
      const y = y0 + ((t * (60 + rnd(k + seed) * 70) + rnd(k * 2.7 + seed) * span) % span);
      return <Flake key={k} x={rnd(k * 9.1 + seed) * 1080 + Math.sin(t * 0.8 + k) * 20} y={y} r={8 + rnd(k * 4.4 + seed) * 14} op={0.35 + rnd(k) * 0.4} />;
    })}
  </>
);
/** Splash at the surface after an object enters at time `at`. */
const Splash: React.FC<{x: number; L: number; t: number; at: number}> = ({x, L, t, at}) => {
  const d = t - at;
  if (d < 0 || d > 0.6) return null;
  const q = d / 0.6;
  return (
    <g>
      <ellipse cx={x} cy={L} rx={30 + 110 * q} ry={8 + 18 * q} fill="none" stroke="#fff" strokeWidth={4} opacity={1 - q} />
      {[-1, -0.5, 0.5, 1, -0.2, 0.25].map((v, k) => <circle key={k} cx={x + v * 90 * q} cy={L - 140 * d * (1 + Math.abs(v)) + 380 * d * d} r={7 - k * 0.6} fill="#fff" opacity={1 - q} />)}
    </g>
  );
};
/** Glass tumbler with sloshing water. `inner` = objects inside (drawn behind the water so the submerged part tints). */
const Cup: React.FC<{id: string; cx: number; top: number; bot: number; wt: number; wb: number; L: number; t: number; color?: string; alpha?: number; label?: string; inner?: React.ReactNode; bubbles?: boolean; slosh?: number}> = ({
  id, cx, top, bot, wt, wb, L, t, color = WATER, alpha = 0.5, label, inner, bubbles = true, slosh = 8,
}) => {
  const d = tumblerPath(cx, top, bot, wt, wb);
  return (
    <g>
      <defs><clipPath id={id}><path d={d} /></clipPath></defs>
      <ellipse cx={cx} cy={bot + 18} rx={wb / 2 + 70} ry={26} fill="#05031A" opacity={0.45} filter="url(#esSoft)" />
      <ellipse cx={cx} cy={bot + 10} rx={wb / 2 - 10} ry={10} fill={color} opacity={0.25} filter="url(#esSoft)" />
      <path d={d} fill="rgba(255,255,255,0.07)" />
      {inner}
      <g clipPath={`url(#${id})`}>
        <path d={wave(cx - wt, cx + wt, L, bot + 10, t, slosh, cx)} fill={color} fillOpacity={alpha} />
        <path d={wave(cx - wt, cx + wt, L + 14, bot + 10, t + 0.4, slosh * 0.6, cx + 3)} fill="#ffffff" fillOpacity={0.12} />
        {bubbles && <Bubbles x0={cx - wb / 2 + 30} x1={cx + wb / 2 - 30} y0={bot - 20} y1={L + 20} t={t} seed={cx} />}
      </g>
      <path d={d} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={4} />
      <path d={`M ${cx - wt / 2 + 34} ${top + 50} L ${cx - wb / 2 + 34} ${bot - 70}`} stroke="#fff" strokeOpacity={0.28} strokeWidth={14} strokeLinecap="round" />
      {label && <text x={cx} y={bot - 44} textAnchor="middle" fill="#fff" opacity={0.62} style={txt(40, 800, '#fff', {letterSpacing: 10})}>{label}</text>}
    </g>
  );
};
/** Frosted glass card that pops in at `at` and leaves at `out`. */
const Card: React.FC<{t: number; at: number; out?: number; x: number; y: number; w: number; children: React.ReactNode; pad?: string}> = ({t, at, out, x, y, w, children, pad = '22px 30px'}) => {
  const q = pop(t, at);
  const o = out === undefined ? 1 : 1 - ps(t, out, out + 0.3);
  if (q <= 0.001 || o <= 0.001) return null;
  return (
    <Abs x={x} y={y} w={w} o={Math.min(1, q * 1.4) * o} style={{transform: `translateY(${(1 - q) * 40}px) scale(${0.75 + 0.25 * q})`}}>
      <Glass style={{padding: pad, textAlign: 'center'}}>{children}</Glass>
    </Abs>
  );
};
const Row: React.FC<{y: number; children: React.ReactNode; gap?: number}> = ({y, children, gap = 18}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', gap}}>{children}</div>
);
const HL = (items: Array<{at: number; text: React.ReactNode}>, size = 56) => (t: number) => <Headline t={t} items={items} top={268} size={size} />;
const C = (c: string, s: React.ReactNode) => <span style={{color: c}}>{s}</span>;

// ================================================================ S1 HOOK — rock and bolt sink, ice floats
const S1L = 820;
const fallY = (t: number, t0: number, hover: number, land: number, bottom: number, dur = 0.75) => {
  if (t < t0) return hover + Math.sin(t * 2.4 + t0) * 8;
  if (t < t0 + 0.3) return lerp(hover, land, ((t - t0) / 0.3) ** 2);
  return lerp(land, bottom, p(t, t0 + 0.3, t0 + 0.3 + dur));
};
const iceDrop = (t: number, t0: number, hover: number, fy: number) => {
  if (t < t0) return hover + Math.sin(t * 2.4) * 8;
  if (t < t0 + 0.3) return lerp(hover, fy, ((t - t0) / 0.3) ** 2);
  const d = t - t0 - 0.3;
  return fy + 260 * Math.exp(-2.6 * d) * Math.sin(5.5 * d);
};
const S1 = (t: number) => {
  const fy = floatY(S1L, 1.15);
  const iy = iceDrop(t, 3.25, 450, fy);
  return (
    <>
      <svg width={1080} height={1920} style={svgAbs}>
        <Cup id="s1a" cx={290} top={600} bot={1240} wt={380} wb={320} L={S1L} t={t}
          inner={<>
            <Rock x={250} y={fallY(t, 0.15, 450, S1L, 1182)} rot={t > 0.45 ? 8 : -4} />
            <Bolt x={348} y={fallY(t, 1.3, 440, S1L, 1196)} rot={lerp(0, 82, p(t, 1.6, 2.4))} />
          </>} />
        <Cup id="s1b" cx={790} top={600} bot={1240} wt={380} wb={320} L={S1L} t={t} label="AUDIRA"
          inner={<Ice x={790} y={iy} s={1.15} rot={Math.sin(t * 1.6) * 4} />} />
        <Splash x={250} L={S1L} t={t} at={0.45} />
        <Splash x={348} L={S1L} t={t} at={1.6} />
        <Splash x={790} L={S1L} t={t} at={3.55} />
      </svg>
      <Abs x={100} w={380} y={985} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
        <Chip t={t} at={1.1} text="batu: tenggelam" color={K.pink} size={32} />
        <Chip t={t} at={2.4} text="besi: tenggelam" color={K.pink} size={32} />
      </Abs>
      <Abs x={600} w={380} y={655} style={{display: 'flex', justifyContent: 'center'}}>
        <Chip t={t} at={5.6} text="es: mengapung" icon={<Crystal />} size={34} />
      </Abs>
    </>
  );
};
const S1H = HL([
  {at: -1, text: <span>BATU {C(K.pink, 'TENGGELAM')}</span>},
  {at: 1.45, text: <span>BESI {C(K.pink, 'TENGGELAM')}</span>},
  {at: 2.7, text: <span>TAPI ES…</span>},
  {at: 5.15, text: <span>ES {C(K.cyan, 'MENGAPUNG')}</span>},
  {at: 6.2, text: C(K.amber, 'KENAPA?')},
], 64);

// ================================================================ S2 WAX vs WATER
const Packing: React.FC<{x: number; y: number; dense: boolean; t: number; color: string}> = ({x, y, dense, t, color}) => (
  <g>
    <rect x={x} y={y} width={360} height={230} rx={34} fill="rgba(255,255,255,0.08)" stroke="#fff" strokeOpacity={0.35} strokeWidth={3} />
    {Array.from({length: dense ? 24 : 12}).map((_, k) => {
      const cx = dense ? x + 45 + (k % 6) * 54 : x + 40 + rnd(k * 3.3) * 280 + Math.sin(t * 2 + k) * 10;
      const cy = dense ? y + 52 + Math.floor(k / 6) * 44 : y + 40 + rnd(k * 5.1) * 150 + Math.cos(t * 1.7 + k) * 10;
      return <circle key={k} cx={cx} cy={cy} r={17} fill={color} stroke="#fff" strokeOpacity={0.5} strokeWidth={2} />;
    })}
  </g>
);
const S2 = (t: number) => {
  const slide = ps(t, 16.6, 17.4);
  const wx = lerp(540, 320, slide);
  const chunkY = t < 13.6 ? -200 : t < 14.4 ? lerp(560, 905, ((t - 13.6) / 0.8) ** 2) : lerp(905, 1160, p(t, 14.4, 15.6));
  const ent = lerp(1400, 780, slide);
  const packQ = pop(t, 11.0);
  return (
    <>
      <svg width={1080} height={1920} style={svgAbs}>
        <g opacity={Math.min(1, packQ)} transform={`translate(0 ${(1 - Math.min(1, packQ)) * 40})`}>
          <Packing x={110} y={420} dense={false} t={t} color={K.amber} />
          <Packing x={610} y={420} dense t={t} color="#D9801A" />
          <text x={290} y={700} textAnchor="middle" fill={'#fff'} style={txt(44, 800, '#fff')}>cair</text>
          <text x={790} y={700} textAnchor="middle" fill={'#FFD38A'} style={txt(44, 800, '#FFD38A')}>padat: rapat</text>
        </g>
        <g transform={`translate(${wx - 540} 0)`}>
          <Cup id="s2a" cx={540} top={760} bot={1250} wt={400} wb={340} L={900} t={t} color={K.amber} alpha={0.82} bubbles={false} slosh={6}
            inner={t > 13.6 ? <g transform={`translate(540 ${chunkY.toFixed(1)}) rotate(${lerp(-10, 6, p(t, 14.4, 15.6))})`}>
              <rect x={-70} y={-48} width={140} height={96} rx={18} fill="#C9700F" stroke="#7A3D05" strokeWidth={3} />
              <rect x={-58} y={-40} width={116} height={18} rx={9} fill="#FFD38A" opacity={0.7} />
            </g> : null} />
          <Splash x={540} L={900} t={t} at={14.4} />
          <text x={540} y={1300} textAnchor="middle" opacity={1 - slide * 0.2} fill={K.amber} style={txt(34, 700, K.amber)}>LILIN</text>
        </g>
        {slide > 0.001 && (
          <g transform={`translate(${ent - 780} 0)`}>
            <Cup id="s2b" cx={780} top={760} bot={1250} wt={360} wb={300} L={900} t={t}
              inner={<Ice x={780} y={floatY(900, 1.0) + Math.sin(t * 2) * 4} s={1.0} rot={Math.sin(t * 1.4) * 4} />} />
            <text x={780} y={1300} textAnchor="middle" fill={K.cyan} style={txt(34, 700, K.cyan)}>AIR</text>
          </g>
        )}
      </svg>
      <Row y={710}>
        <Chip t={t} at={15.0} out={16.5} text="lilin padat: tenggelam" color={K.amber} size={34} />
      </Row>
      <Abs x={560} w={440} y={700} style={{display: 'flex', justifyContent: 'center'}}>
        <Chip t={t} at={17.0} text="es: mengapung" icon={<Crystal />} size={34} />
      </Abs>
    </>
  );
};
const S2H = HL([
  {at: 7.0, text: <span>AUDIRA SAINS {C(K.amber, '·')} KEANEHAN AIR</span>},
  {at: 10.2, text: <span>BIASANYA: {C(K.amber, 'PADAT TENGGELAM')}</span>},
  {at: 16.7, text: <span>AIR: {C(K.cyan, 'KEBALIKANNYA')}</span>},
], 52);

// ================================================================ S3 DENSITY balance
const S3 = (t: number) => {
  const a = (-7 * ps(t, 24.9, 26.0) + Math.sin(t * 1.3) * 0.6) * (Math.PI / 180);
  const P = {x: 540, y: 790};
  const end = (sgn: number) => ({x: P.x + sgn * 360 * Math.cos(a), y: P.y + sgn * 360 * Math.sin(a)});
  const L = end(-1), R = end(1);
  const pan = (e: {x: number; y: number}, kids: React.ReactNode) => (
    <g>
      <line x1={e.x} y1={e.y} x2={e.x - 90} y2={e.y + 190} stroke="#fff" strokeOpacity={0.6} strokeWidth={3} />
      <line x1={e.x} y1={e.y} x2={e.x + 90} y2={e.y + 190} stroke="#fff" strokeOpacity={0.6} strokeWidth={3} />
      <ellipse cx={e.x} cy={e.y + 194} rx={118} ry={18} fill="rgba(255,255,255,0.18)" stroke="#fff" strokeOpacity={0.7} strokeWidth={3} />
      {kids}
    </g>
  );
  const box = (x: number, y: number) => (
    <g>
      <defs><clipPath id="s3box"><rect x={x - 62} y={y - 62} width={124} height={124} rx={14} /></clipPath></defs>
      <g clipPath="url(#s3box)"><path d={wave(x - 70, x + 70, y - 46, y + 70, t, 5, 1)} fill={WATER} fillOpacity={0.8} /></g>
      <rect x={x - 62} y={y - 62} width={124} height={124} rx={14} fill="none" stroke="#fff" strokeOpacity={0.8} strokeWidth={3} />
    </g>
  );
  const iceN = tick(t);
  const esVal = lerp(0, 0.917, p(iceN, 22.5, 24.3));
  const barA = p(tick(t), 19.6, 21.5), barE = 0.917 * p(tick(t), 22.5, 24.3);
  return (
    <>
      <svg width={1080} height={1920} style={svgAbs}>
        <polygon points={`${P.x},${P.y} ${P.x - 80},1150 ${P.x + 80},1150`} fill="rgba(255,255,255,0.12)" stroke="#fff" strokeOpacity={0.55} strokeWidth={3} />
        <rect x={360} y={1148} width={360} height={30} rx={15} fill="rgba(255,255,255,0.16)" stroke="#fff" strokeOpacity={0.5} strokeWidth={3} />
        <g transform={`rotate(${((a * 180) / Math.PI).toFixed(2)} ${P.x} ${P.y})`}>
          <rect x={P.x - 380} y={P.y - 12} width={760} height={24} rx={12} fill={'#B9A6FF'} fillOpacity={0.55} stroke="#fff" strokeOpacity={0.7} strokeWidth={3} />
        </g>
        <circle cx={P.x} cy={P.y} r={20} fill={K.amber} />
        {pan(L, box(L.x, L.y + 194 - 80))}
        {pan(R, <Ice x={R.x} y={R.y + 194 - 78} s={1.05} />)}
        <ellipse cx={540} cy={1192} rx={330} ry={26} fill="#05031A" opacity={0.45} filter="url(#esSoft)" />
        <text x={L.x} y={L.y + 280} textAnchor="middle" fill={K.cyan} style={txt(46, 800, K.cyan)}>AIR</text>
        <text x={R.x} y={R.y + 280} textAnchor="middle" fill={'#fff'} style={txt(46, 800, '#fff')}>ES</text>
        <text x={540} y={1240} textAnchor="middle" opacity={p(t, 19.2, 19.8) * (1 - p(t, 24.7, 25.0))} fill={'#fff'} style={txt(40, 700, '#fff', {opacity: 0.9})}>ukuran sama</text>
      </svg>
      <Card t={t} at={19.6} x={70} y={390} w={450}>
        <div style={txt(34, 700, K.cyan, {letterSpacing: 4})}>AIR</div>
        <div style={{...txt(104, 800), fontVariantNumeric: 'tabular-nums'}}>{barA > 0.98 ? '≈ 1' : (barA).toFixed(2).replace('.', ',')}</div>
        <div style={txt(34, 500)}>g/cm³</div>
        <div style={{marginTop: 12, height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.15)'}}><div style={{width: `${barA * 100}%`, height: 16, borderRadius: 8, background: K.cyan}} /></div>
      </Card>
      <Card t={t} at={22.4} x={560} y={390} w={450}>
        <div style={txt(34, 700, '#fff', {letterSpacing: 4})}>ES</div>
        <div style={{...txt(104, 800, K.amber), fontVariantNumeric: 'tabular-nums'}}>{esVal.toFixed(3).replace('.', ',')}</div>
        <div style={txt(34, 500)}>g/cm³</div>
        <div style={{marginTop: 12, height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.15)'}}><div style={{width: `${barE * 100}%`, height: 16, borderRadius: 8, background: K.amber}} /></div>
      </Card>
      <Row y={1196}><Chip t={t} at={25.0} text="lebih ringan, jadi mengapung" icon={<Crystal />} size={36} /></Row>
    </>
  );
};
const S3H = HL([{at: 18.9, text: <span>MASSA {C(K.cyan, 'JENIS')}</span>}]);

// ================================================================ S4 FREEZING EXPANDS — bottle bulges, pipes burst
const S4 = (t: number) => {
  const f = ps(t, 28.4, 30.6), b = pb(t, 29.4, 30.8);
  const cx = 300, cy = 400 + 160 * 1.5;
  const bottle = galonPath(cx, 400, 1.5);
  const grow = ps(t, 31.3, 34.5);
  const brk = ps(t, 34.65, 35.1);
  const stress = p(t, 32.6, 34.6);
  // Bottle is the hero (big) during "membeku = memuai", then shrinks to make room for the pipes sliding in.
  const hero = 1 - ps(t, 31.0, 31.9);
  const bs = 1 + 0.32 * hero;
  const pipeIn = ps(t, 31.2, 32.2);
  const pipe = (y: number, metal: boolean, seed: number) => {
    const wall = metal ? '#8B93A6' : '#DDEBFF';
    const hl = metal ? '#D3D9E6' : '#FFFFFF';
    const half = (sgn: number) => (
      <g transform={`translate(${sgn * 36 * brk + (1 - pipeIn) * (seed ? 1100 : -1100)} ${-10 * brk * (seed ? 1 : -1)}) rotate(${sgn * 4 * brk} ${540} ${y + 40})`}>
        <g clipPath={`url(#s4half${sgn > 0 ? 'r' : 'l'})`}>
          <rect x={100} y={y + 14} width={880} height={52} fill={WATER} fillOpacity={0.35} />
          <rect x={540 - 430 * grow} y={y + 14} width={860 * grow} height={52} fill={ICE.face} fillOpacity={0.92} />
          {grow > 0.2 && <path d={`M ${540 - 300 * grow} ${y + 30} L ${540 - 200 * grow} ${y + 48} M ${540 + 120 * grow} ${y + 26} L ${540 + 240 * grow} ${y + 50}`} stroke={ICE.crack} strokeWidth={3} />}
          <rect x={100} y={y} width={880} height={18} fill={wall} fillOpacity={metal ? 1 : 0.7} />
          <rect x={100} y={y + 62} width={880} height={18} fill={wall} fillOpacity={metal ? 1 : 0.7} />
          <rect x={100} y={y} width={880} height={80} fill={`url(#${metal ? 's4metal' : 's4plastic'})`} />
          <rect x={100} y={y + 3} width={880} height={5} fill={hl} opacity={0.9} />
          <ellipse cx={100} cy={y + 40} rx={14} ry={40} fill={wall} stroke="#fff" strokeOpacity={0.5} strokeWidth={2} />
          <ellipse cx={980} cy={y + 40} rx={14} ry={40} fill={wall} stroke="#fff" strokeOpacity={0.5} strokeWidth={2} />
          <rect x={100} y={y} width={880} height={80} fill="none" stroke={K.pink} strokeWidth={4} opacity={stress * (1 - brk) * (0.5 + 0.5 * Math.sin(t * 30))} />
        </g>
      </g>
    );
    return <g>{half(-1)}{half(1)}</g>;
  };
  return (
    <>
      <svg width={1080} height={1920} style={svgAbs}>
        <defs>
          <clipPath id="s4bottle"><path d={bottle} /></clipPath>
          <clipPath id="s4halfl"><path d="M 0 0 L 540 0 L 520 900 L 560 1000 L 530 1100 L 560 1200 L 540 1920 L 0 1920 Z" /></clipPath>
          <clipPath id="s4halfr"><path d="M 540 0 L 1080 0 L 1080 1920 L 540 1920 L 560 1200 L 530 1100 L 560 1000 L 520 900 Z" /></clipPath>
          <linearGradient id="s4metal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.55} /><stop offset="0.25" stopColor="#fff" stopOpacity={0.05} />
            <stop offset="0.7" stopColor="#000" stopOpacity={0.05} /><stop offset="1" stopColor="#000" stopOpacity={0.45} />
          </linearGradient>
          <linearGradient id="s4plastic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.45} /><stop offset="0.3" stopColor="#fff" stopOpacity={0} />
            <stop offset="1" stopColor="#1B2A6B" stopOpacity={0.3} />
          </linearGradient>
          <linearGradient id="s4glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity={0.35} /><stop offset="0.45" stopColor="#fff" stopOpacity={0} />
            <stop offset="1" stopColor="#2F7FD8" stopOpacity={0.45} />
          </linearGradient>
        </defs>
        <g transform={`translate(${cx} 400) scale(${bs}) translate(${-cx} -400)`}>
        <ellipse cx={cx} cy={cy + 250} rx={200} ry={24} fill="#05031A" opacity={0.45} filter="url(#esSoft)" />
        <g transform={`translate(${cx} ${cy}) scale(${1 + 0.09 * b} ${1 + 0.03 * b}) translate(${-cx} ${-cy})`}>
          <path d={bottle} fill="rgba(255,255,255,0.07)" />
          <g clipPath="url(#s4bottle)">
            <rect x={cx - 160} y={470} width={320} height={360} fill={ICE.face} fillOpacity={0.88} />
            {f > 0.4 && <path d={`M ${cx - 60} 560 L ${cx - 20} 620 L ${cx - 50} 690 M ${cx - 20} 620 L ${cx + 40} 650 M ${cx + 70} 540 L ${cx + 50} 600`} stroke={ICE.crack} strokeWidth={4} fill="none" opacity={f} />}
            <g transform={`translate(${cx} ${cy + 40}) scale(${Math.max(0.001, 1 - f)}) translate(${-cx} ${-cy - 40})`}>
              <path d={wave(cx - 160, cx + 160, 500, 840, t, 6, 2)} fill={WATER} fillOpacity={0.85} />
            </g>
            <Bubbles x0={cx - 100} x1={cx + 100} y0={800} y1={520} t={t} n={5} op={0.5 * (1 - f)} />
            <rect x={cx - 170} y={380} width={340} height={520} fill="url(#s4glass)" />
            <rect x={cx - 120} y={430} width={20} height={380} rx={10} fill="#fff" opacity={0.45} />
            <rect x={cx - 88} y={450} width={8} height={300} rx={4} fill="#fff" opacity={0.3} />
          </g>
          <path d={bottle} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={4} />
        </g>
        </g>
        {[-1, 1].map((s) => (
          <g key={s} opacity={b > 0.05 ? Math.min(1, b) * (s < 0 ? 1 - hero : 1) : 0} transform={`translate(${cx} 400) scale(${bs}) translate(${-cx} -400)`}>
            <path d={`M ${cx + s * (150 + 40 * b)} ${cy} L ${cx + s * (210 + 40 * b)} ${cy}`} stroke={K.amber} strokeWidth={8} strokeLinecap="round" />
            <path d={`M ${cx + s * (192 + 40 * b)} ${cy - 18} L ${cx + s * (214 + 40 * b)} ${cy} L ${cx + s * (192 + 40 * b)} ${cy + 18}`} stroke={K.amber} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
        {pipe(980, true, 0)}
        {pipe(1160, false, 1)}
        {brk > 0.001 && brk < 0.999 && [0, 1].map((k) => (
          <g key={k} transform={`translate(540 ${k ? 1200 : 1020})`} opacity={1 - brk}>
            {Array.from({length: 10}).map((_, j) => {
              const ang = (j / 10) * Math.PI * 2 + k;
              return <line key={j} x1={Math.cos(ang) * 30 * brk} y1={Math.sin(ang) * 30 * brk} x2={Math.cos(ang) * 150 * brk} y2={Math.sin(ang) * 150 * brk} stroke={j % 2 ? K.pink : '#fff'} strokeWidth={7} strokeLinecap="round" />;
            })}
          </g>
        ))}
        {t > 34.65 && [0, 1, 2, 3, 4, 5].map((k) => {
          const d = t - 34.65;
          return <polygon key={k} points="0,-12 10,6 -10,8" fill={ICE.face} transform={`translate(${540 + (rnd(k) - 0.5) * 420 * d} ${1060 + (k % 2) * 160 - 260 * d + 600 * d * d}) rotate(${d * 400 * (k % 2 ? 1 : -1)})`} />;
        })}
      </svg>
      <Card t={t} at={30.1} x={560} y={470} w={420}>
        <div style={txt(120, 800, K.amber)}>+9%</div>
        <div style={txt(38, 600)}>volume saat membeku</div>
      </Card>
      <Abs x={110} y={900} o={1}><Chip t={t} at={33.35} text="pipa logam" color="#B4BCCD" size={40} /></Abs>
      <Abs x={110} y={1080} o={1}><Chip t={t} at={34.05} text="pipa plastik" color="#fff" size={40} /></Abs>
    </>
  );
};
const S4H = HL([
  {at: 27.1, text: <span>KENAPA BISA {C(K.amber, 'BEGITU?')}</span>},
  {at: 28.4, text: <span>MEMBEKU = {C(K.amber, 'MEMUAI')}</span>},
  {at: 31.2, text: <span>DORONGANNYA {C(K.pink, 'KUAT')}</span>},
  {at: 34.7, text: C(K.pink, 'PIPA PECAH!')},
]);

// ================================================================ S5 MOLECULES lock into a hexagonal lattice
const HEX_A = 96;
const LATTICE: Array<[number, number]> = (() => {
  const seen = new Map<string, [number, number]>();
  for (let row = -1; row < 8; row++) {
    for (let col = -1; col < 8; col++) {
      const cx = 180 + Math.sqrt(3) * HEX_A * (col + 0.5 * (row & 1));
      const cy = 560 + 1.5 * HEX_A * row;
      for (let k = 0; k < 6; k++) {
        const a = ((30 + 60 * k) * Math.PI) / 180;
        const x = cx + HEX_A * Math.cos(a), y = cy + HEX_A * Math.sin(a);
        if (x < 130 || x > 950 || y < 500 || y > 1170) continue;
        seen.set(`${Math.round(x)}_${Math.round(y)}`, [x, y]);
      }
    }
  }
  return [...seen.values()].sort((u, v) => u[1] - v[1] || u[0] - v[0]);
})();
const HEX_CENTERS: Array<[number, number]> = (() => {
  const out: Array<[number, number]> = [];
  for (let row = -1; row < 8; row++) for (let col = -1; col < 8; col++) {
    const cx = 180 + Math.sqrt(3) * HEX_A * (col + 0.5 * (row & 1)), cy = 560 + 1.5 * HEX_A * row;
    if (cx > 200 && cx < 880 && cy > 580 && cy < 1100) out.push([cx, cy]);
  }
  return out;
})();
const LIQUID: Array<[number, number]> = (() => {
  const n = LATTICE.length, cols = 7, rows = Math.ceil(n / cols);
  const pts: Array<[number, number]> = [];
  for (let k = 0; k < n; k++) {
    const c = k % cols, r = Math.floor(k / cols);
    pts.push([300 + c * 80 + (rnd(k * 3.1) - 0.5) * 40, 640 + (r * 440) / Math.max(1, rows - 1) + (rnd(k * 5.3) - 0.5) * 40]);
  }
  return pts.sort((u, v) => u[1] - v[1] || u[0] - v[0]);
})();
const BONDS: Array<[number, number]> = (() => {
  const out: Array<[number, number]> = [];
  LATTICE.forEach((u, i) => LATTICE.forEach((v, j) => {
    if (j > i && Math.hypot(u[0] - v[0], u[1] - v[1]) < HEX_A * 1.1) out.push([i, j]);
  }));
  return out;
})();
const HERO = (() => {
  let best = 0, bd = 1e9;
  LATTICE.forEach(([x, y], i) => { const d = Math.hypot(x - 540, y - 850); if (d < bd) { bd = d; best = i; } });
  return best;
})();
const Mol: React.FC<{x: number; y: number; ang: number; s?: number; op?: number; glow?: number}> = ({x, y, ang, s = 1, op = 1, glow = 0}) => {
  const h = (d: number) => ({x: Math.cos(((ang + d) * Math.PI) / 180) * 34, y: Math.sin(((ang + d) * Math.PI) / 180) * 34});
  const h1 = h(-52), h2 = h(52);
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})`} opacity={op}>
      {glow > 0 && <circle r={70} fill={K.amber} opacity={0.55 * glow} />}
      <circle cx={h1.x} cy={h1.y} r={15} fill="#fff" />
      <circle cx={h2.x} cy={h2.y} r={15} fill="#fff" />
      <circle r={27} fill="#FF5F7A" stroke="#fff" strokeOpacity={0.7} strokeWidth={2} />
      <circle cx={-8} cy={-9} r={7} fill="#fff" opacity={0.55} />
    </g>
  );
};
const S5 = (t: number) => {
  const lock = ps(t, 39.8, 41.4);
  const bondQ = p(t, 40.7, 41.5);
  const heroQ = p(t, 41.5, 42.0) * (1 - p(t, 44.3, 44.8));
  const cellQ = p(t, 44.4, 45.4);
  const shimmer = t > 47.4 ? Math.max(0, Math.sin((t - 47.4) * 3)) : 0;
  const hero = LATTICE[HERO];
  const nbrs = BONDS.filter(([i, j]) => i === HERO || j === HERO).map(([i, j]) => (i === HERO ? j : i));
  const back = {x: hero[0] + 26, y: hero[1] - 30};
  return (
    <svg width={1080} height={1920} style={svgAbs}>
      {HEX_CENTERS.map(([x, y], k) => (
        <polygon key={k} points={hexPts(x, y, HEX_A * 0.62)} fill={K.cyan} opacity={cellQ * (0.3 + 0.3 * shimmer * (0.5 + 0.5 * Math.sin(k * 1.7 + t * 4)))} />
      ))}
      {BONDS.map(([i, j], k) => (
        <line key={k} x1={LATTICE[i][0]} y1={LATTICE[i][1]} x2={LATTICE[j][0]} y2={LATTICE[j][1]} stroke="#BFF3FF" strokeOpacity={0.8 * bondQ * (1 - heroQ * 0.4)} strokeWidth={5} strokeDasharray="10 7" />
      ))}
      {heroQ > 0.001 && <>
        <Mol x={back.x} y={back.y} ang={-90} s={0.7} op={0.45 * heroQ} />
        <line x1={hero[0]} y1={hero[1]} x2={back.x} y2={back.y} stroke={K.amber} strokeWidth={6} strokeDasharray="10 8" opacity={heroQ} />
        {nbrs.map((j) => <line key={j} x1={hero[0]} y1={hero[1]} x2={LATTICE[j][0]} y2={LATTICE[j][1]} stroke={K.amber} strokeWidth={6} strokeDasharray="10 8" opacity={heroQ} />)}
      </>}
      {LATTICE.map(([x, y], i) => {
        const lq = LIQUID[i];
        const jx = Math.sin(t * 3.1 + i * 1.7) * 14 * (1 - lock), jy = Math.cos(t * 2.7 + i * 2.3) * 14 * (1 - lock);
        const ang = lerp(rnd(i * 4.4) * 360 + t * 70 * (i % 2 ? 1 : -1), 90 + (i % 3) * 120, lock);
        return <Mol key={i} x={lerp(lq[0], x, lock) + jx} y={lerp(lq[1], y, lock) + jy} ang={ang} s={0.95} glow={i === HERO ? heroQ : 0} />;
      })}
      <Snow t={t} n={8} y0={300} y1={1300} seed={5} />
    </svg>
  );
};
const S5O = (t: number) => (
  <>
    <Headline t={t} top={268} items={[
      {at: 35.5, text: <span>RAHASIANYA: {C(K.pink, 'MOLEKUL')}</span>},
      {at: 37.2, text: <span>AIR CAIR: {C(K.cyan, 'BERDESAKAN')}</span>},
      {at: 39.7, text: <span>MEMBEKU: {C(K.amber, 'TERKUNCI')}</span>},
      {at: 47.4, text: <span>RONGGA = {C(K.cyan, 'ES RENGGANG')}</span>},
    ]} />
    <Row y={1200}>
      <Chip t={t} at={36.3} out={40.6} text="H₂O" icon={<span style={{width: 18, height: 18, borderRadius: 9, background: '#FF5F7A', display: 'block'}} />} size={36} />
      <Chip t={t} at={40.9} out={42.6} text="ikatan hidrogen" color={K.amber} size={36} />
      <Chip t={t} at={42.75} out={44.3} text="4 tetangga" color={K.amber} size={36} />
      <Chip t={t} at={44.5} text="kisi segi enam berongga" color={K.cyan} size={36} />
    </Row>
  </>
);

// ================================================================ S6 MYTH + gallium / bismuth
const S6 = (t: number) => {
  const L = 650;
  const strike = ps(t, 50.6, 51.0);
  // "Bukan cuma air": the water + ice cross-fade into liquid gallium with a solid gallium chunk floating in it.
  const m = ps(t, 55.0, 56.0);
  const metY = floatY(L, 1.6) - 10 + Math.sin(t * 1.5) * 4;
  return (
    <>
      <svg width={1080} height={1920} style={svgAbs}>
        <defs>
          <clipPath id="s6tank"><rect x={140} y={430} width={800} height={500} rx={44} /></clipPath>
          <linearGradient id="s6metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F4F6FB" /><stop offset="0.45" stopColor="#A9B2C6" /><stop offset="0.7" stopColor="#D9DEEA" /><stop offset="1" stopColor="#6F7891" />
          </linearGradient>
          <linearGradient id="s6melt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E3E8F2" /><stop offset="1" stopColor="#7C86A0" />
          </linearGradient>
        </defs>
        <ellipse cx={540} cy={950} rx={430} ry={30} fill="#05031A" opacity={0.45} filter="url(#esSoft)" />
        <rect x={140} y={430} width={800} height={500} rx={44} fill="rgba(255,255,255,0.07)" />
        {m < 0.999 && <Ice x={540} y={floatY(L, 2.0) + Math.sin(t * 1.8) * 5} s={2.0} rot={Math.sin(t * 1.2) * 3} op={1 - m} clear />}
        {m > 0.001 && (
          <g opacity={m} transform={`translate(540 ${metY.toFixed(1)}) rotate(${(Math.sin(t * 1.1) * 3).toFixed(2)})`}>
            <polygon points="-120,-70 -40,-110 110,-90 140,-10 100,70 -60,80 -140,20" fill="url(#s6metal)" stroke="#fff" strokeOpacity={0.8} strokeWidth={3} />
            <polygon points="-40,-110 110,-90 60,-30 -60,-40" fill="#fff" opacity={0.35} />
            <path d="M -100 -40 L -20 -60" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
          </g>
        )}
        <g clipPath="url(#s6tank)">
          <path d={wave(130, 950, L, 940, t, 8, 4)} fill={WATER} fillOpacity={0.45 * (1 - m)} />
          <path d={wave(130, 950, L, 940, t, 5, 4)} fill="url(#s6melt)" fillOpacity={0.82 * m} />
          <path d={wave(130, 950, L + 14, 940, t + 0.4, 5, 7)} fill="#fff" fillOpacity={0.1 + 0.15 * m} />
        </g>
        <rect x={140} y={430} width={800} height={500} rx={44} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={4} />
        {[0, 1, 2].map((k) => {
          const q = (t * 0.8 + k / 3) % 1;
          return <path key={k} d={`M ${560 + k * 60} ${540 + k * 30} l 10 0 m -5 -5 l 0 10`} stroke="#fff" strokeWidth={4} opacity={Math.sin(q * Math.PI)} />;
        })}
      </svg>
      <Card t={t} at={50.3} out={55.0} x={130} y={990} w={820}>
        <div style={txt(34, 800, K.pink, {letterSpacing: 6})}>MITOS</div>
        {['es mengapung karena', 'gelembung udara'].map((line, k) => (
          <div key={k} style={{position: 'relative', display: 'block', width: 'fit-content', margin: '0 auto'}}>
            <div style={txt(50, 700)}>{line}</div>
            <div style={{position: 'absolute', left: -8, top: '52%', height: 9, width: `calc(${p(strike, k * 0.4, k * 0.4 + 0.6) * 100}% + 16px)`, background: K.pink, borderRadius: 5, opacity: strike > 0.001 ? 1 : 0}} />
          </div>
        ))}
      </Card>
      <Row y={1210}><Chip t={t} at={52.0} out={55.0} text="es bening pun mengapung" icon={<Crystal />} size={34} /></Row>
      {[{at: 56.6, x: 200, n: '31', s: 'Ga', name: 'Galium'}, {at: 57.2, x: 600, n: '83', s: 'Bi', name: 'Bismut'}].map((e) => (
        <Card key={e.s} t={t} at={e.at} x={e.x} y={980} w={280} pad="16px 20px 20px">
          <div style={{...txt(30, 600, '#B9A6FF'), textAlign: 'left'}}>{e.n}</div>
          <div style={txt(120, 800, K.amber)}>{e.s}</div>
          <div style={txt(36, 600)}>{e.name}</div>
        </Card>
      ))}
      <Row y={1240}><Chip t={t} at={58.2} text="ikut memuai saat membeku" color={K.amber} size={38} /></Row>
    </>
  );
};
const S6H = HL([
  {at: 49.8, text: <span>BUKAN {C(K.pink, 'GELEMBUNG')}</span>},
  {at: 54.8, text: <span>BUKAN CUMA {C(K.cyan, 'AIR')}</span>},
]);

// ================================================================ S7 LAKE — freezes from the top; what if ice sank
const BASIN = 'M 70 720 C 130 1080 320 1240 540 1245 C 760 1240 950 1080 1010 720 Z';
const Fish: React.FC<{x: number; y: number; dir: number; op: number; c?: string}> = ({x, y, dir, op, c = K.amber}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${dir} 1)`} opacity={op}>
    <ellipse rx={46} ry={22} fill={c} />
    <polygon points="-40,0 -74,-22 -74,22" fill={c} />
    <circle cx={24} cy={-6} r={5} fill={K.night} />
  </g>
);
const S7 = (t: number) => {
  const ice = ps(t, 61.6, 62.8) * (1 - ps(t, 70.2, 70.8));
  const sink = ps(t, 70.5, 73.6);
  const pinkQ = ps(t, 70.2, 70.8);
  const fishOp = p(t, 68.2, 68.7) * (1 - ps(t, 73.3, 74.1));
  return (
    <>
      <svg width={1080} height={1920} style={svgAbs}>
        <defs><clipPath id="s7basin"><path d={BASIN} /></clipPath></defs>
        <rect x={0} y={700} width={1080} height={620} fill="#1B1450" />
        <rect x={0} y={690} width={1080} height={18} fill="#EAF6FF" opacity={0.85} />
        {[[110, 700, 1], [210, 700, 0.8], [880, 700, 1.1], [980, 700, 0.85]].map(([x, y, s], k) => (
          <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
            <polygon points="0,-150 -50,0 50,0" fill="#2B2470" />
            <polygon points="0,-150 -26,-72 26,-72" fill="#EAF6FF" opacity={0.8} />
          </g>
        ))}
        <path d={BASIN} fill="#2BB8E6" />
        <g clipPath="url(#s7basin)">
          <rect x={0} y={900} width={1080} height={400} fill="#2F7FD8" />
          <rect x={0} y={1060} width={1080} height={300} fill="#3B4FBF" />
          <rect x={0} y={1160} width={1080} height={200} fill="#3E3AA6" />
          <Bubbles x0={200} x1={880} y0={1220} y1={800} t={t} n={6} seed={3} op={0.35} />
          {[0, 1, 2].map((k) => {
            const dir = k % 2 ? -1 : 1;
            const x = 540 + dir * Math.sin(t * 0.6 + k * 2) * 260;
            return <Fish key={k} x={x} y={980 + k * 70} dir={Math.cos(t * 0.6 + k * 2) * dir > 0 ? 1 : -1} op={fishOp} c={k === 1 ? K.pink : K.amber} />;
          })}
          <rect x={0} y={720} width={1080} height={50 * ice} fill={ICE.face} />
          {ice > 0.6 && <path d="M 300 722 L 330 760 L 380 742 M 640 724 L 600 762 M 760 722 L 790 750" stroke={ICE.crack} strokeWidth={4} fill="none" opacity={ice} />}
          <rect x={0} y={1250 - 460 * sink} width={1080} height={480} fill="#D7F2FF" opacity={sink > 0.001 ? 0.95 : 0} />
          {sink > 0.3 && <path d={`M 200 ${1250 - 460 * sink + 30} L 260 ${1250 - 460 * sink + 80} M 700 ${1250 - 460 * sink + 20} L 660 ${1250 - 460 * sink + 70}`} stroke={ICE.crack} strokeWidth={4} />}
          <rect x={0} y={700} width={1080} height={600} fill={K.pink} opacity={0.22 * pinkQ} />
        </g>
        <path d={BASIN} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={4} />
        <Snow t={t} n={12} y0={380} y1={720} seed={9} />
      </svg>
      <Abs x={640} y={600} o={1}><Chip t={t} at={63.7} out={70.2} text="es = selimut" icon={<Crystal />} size={34} /></Abs>
      <Card t={t} at={67.3} out={70.2} x={360} y={1100} w={360} pad="10px 20px">
        <div style={txt(30, 600, '#fff')}>dasar danau</div>
        <div style={txt(84, 800, K.amber)}>≈ 4 °C</div>
      </Card>
      <Row y={1210}><Chip t={t} at={73.7} text="kebanyakan makhluk mati" color={K.pink} size={34} /></Row>
    </>
  );
};
const S7H = HL([
  {at: 59.5, text: <span>MENYELAMATKAN {C(K.cyan, 'KEHIDUPAN')}</span>},
  {at: 61.5, text: <span>DANAU MEMBEKU {C(K.cyan, 'DARI ATAS')}</span>},
  {at: 70.2, text: <span>KALAU ES {C(K.pink, 'TENGGELAM…')}</span>},
], 54);

// ================================================================ S8 ICEBERG — almost 9 of 10 below water (payoff)
const S8 = (t: number) => {
  const pan = -300 * ps(t, 75.0, 77.0);
  const W0 = 640 + pan;
  const fill = Math.round(9 * p(tick(t, 12), 76.0, 77.6));
  return (
    <>
      <svg width={1080} height={1920} style={svgAbs}>
        <g transform={`translate(0 ${pan.toFixed(1)})`}>
          <rect x={0} y={640} width={1080} height={1400} fill="#1E5FC0" opacity={0.35} />
          <path d="M 420 640 L 470 520 L 540 440 L 600 500 L 650 560 L 700 640 Z" fill="#F4FBFF" stroke="#fff" strokeWidth={4} />
          <path d="M 540 440 L 600 500 L 560 640 L 500 640 Z" fill="#CBEFFF" />
          <path d="M 420 640 L 330 760 L 270 930 L 300 1110 L 420 1260 L 560 1310 L 720 1250 L 820 1080 L 830 880 L 760 720 L 700 640 Z" fill="#BFE9FF" fillOpacity={0.9} stroke="#fff" strokeOpacity={0.6} strokeWidth={4} />
          <path d="M 560 640 L 620 900 L 560 1310 L 720 1250 L 820 1080 L 830 880 L 760 720 L 700 640 Z" fill="#8FD3F5" fillOpacity={0.7} />
          <rect x={0} y={640} width={1080} height={1400} fill={WATER} opacity={0.18} />
          <path d={wave(-20, 1100, 640, 662, t, 6, 3)} fill="#fff" opacity={0.6} />
          <Bubbles x0={150} x1={930} y0={1350} y1={700} t={t} n={8} seed={11} op={0.35} />
        </g>
        <text x={230} y={W0 - 24} textAnchor="middle" opacity={p(t, 75.2, 75.6)} fill={'#fff'} style={txt(38, 700, '#fff')}>permukaan air</text>
      </svg>
      <Card t={t} at={75.9} x={90} y={1060} w={900} pad="18px 26px 22px">
        <div style={txt(40, 700)}>hampir {C(K.amber, '9 dari 10')} bagian di bawah air</div>
        <div style={{display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16}}>
          {Array.from({length: 10}).map((_, k) => {
            const top = k === 9;
            const on = top || k < fill;
            return <div key={k} style={{width: 66, height: 66, borderRadius: 14, border: '3px solid rgba(255,255,255,0.6)', background: on ? (top ? '#F4FBFF' : K.cyan) : 'rgba(255,255,255,0.08)', transform: `scale(${on && !top && k === fill - 1 ? 1.08 : 1})`}} />;
          })}
        </div>
      </Card>
    </>
  );
};
const S8H = (t: number) => <Headline t={t} top={268} size={56} until={75.85} items={[{at: 74.9, text: <span>DAN GUNUNG {C(K.cyan, 'ES?')}</span>}]} />;

// ================================================================ S9 SIGN-OFF — AUDIRA glass + Earth
const Earth: React.FC<{x: number; y: number; r: number; q: number; t: number}> = ({x, y, r, q, t}) => q > 0.001 ? (
  <g transform={`translate(${x} ${y}) scale(${Math.min(1.1, q)})`}>
    <circle r={r * 1.35} fill={K.cyan} opacity={0.18} />
    <defs><clipPath id="s9earth"><circle r={r} /></clipPath></defs>
    <circle r={r} fill="#2E7BE6" />
    <g clipPath="url(#s9earth)">
      <g transform={`translate(${((t * 18) % 200) - 100} 0)`}>
        {[-200, 0, 200].map((o) => <path key={o} d={`M ${o - 60} -40 q 30 -30 60 -10 q 20 30 -10 50 q -40 10 -50 -40 Z M ${o + 20} 30 q 30 -10 50 10 q -10 30 -40 20 Z`} fill="#4CD08A" />)}
      </g>
      <ellipse cx={-r * 0.3} cy={-r * 0.4} rx={r * 0.4} ry={r * 0.2} fill="#fff" opacity={0.3} />
    </g>
    <circle r={r} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={3} />
    {[0, 1, 2, 3].map((k) => {
      const a = t * 1.2 + k * 1.57;
      return <path key={k} d={`M ${Math.cos(a) * r * 1.5} ${Math.sin(a) * r * 1.5} l 8 0 m -4 -4 l 0 8`} stroke="#fff" strokeWidth={4} opacity={0.5 + 0.5 * Math.sin(t * 4 + k)} />;
    })}
  </g>
) : null;
const S9 = (t: number) => (
  <>
    <svg width={1080} height={1920} style={svgAbs}>
      <Cup id="s9a" cx={540} top={600} bot={1150} wt={430} wb={360} L={760} t={t} label="AUDIRA"
        inner={<Ice x={540} y={floatY(760, 1.3) + Math.sin(t * 2) * 5} s={1.3} rot={Math.sin(t * 1.3) * 4} />} />
      <Earth x={860} y={500} r={78} q={pb(t, 80.4, 80.9)} t={t} />
      <Snow t={t} n={8} y0={300} y1={1250} seed={21} />
    </svg>
    <Card t={t} at={82.3} x={240} y={1170} w={600} pad="14px 24px">
      <div style={txt(40, 700, K.cyan)}>ikuti</div>
      <div style={txt(64, 800)}>@AudiraSains</div>
    </Card>
  </>
);
const S9H = HL([
  {at: 79.2, text: <span>SATU SIFAT {C(K.amber, 'ANEH')} AIR</span>},
  {at: 80.6, text: <span>MENJAGA KEHIDUPAN DI {C(K.cyan, 'BUMI')}</span>},
], 50);

// ================================================================ depth: FG bokeh at the frame edges + vignette (+ the esSoft blur used by shadows)
const BOKEH = Array.from({length: 9}).map((_, k) => ({
  x: k % 2 ? 960 + rnd(k * 2.1) * 140 : -20 + rnd(k * 3.7) * 140,
  y0: rnd(k * 5.3) * 1920, r: 34 + rnd(k * 7.9) * 60, v: 18 + rnd(k * 1.9) * 26, fill: k % 3 === 0,
}));
const DepthFG: React.FC<{t: number}> = ({t}) => (
  <svg width={1080} height={1920} style={{...svgAbs, pointerEvents: 'none'}}>
    <defs>
      <filter id="esSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={10} /></filter>
      <filter id="esBokeh" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={7} /></filter>
      <radialGradient id="esVig" cx="50%" cy="45%" r="75%">
        <stop offset="0.55" stopColor="#05031A" stopOpacity={0} /><stop offset="1" stopColor="#05031A" stopOpacity={0.55} />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#esVig)" />
    {BOKEH.map((b, k) => {
      const y = ((b.y0 - t * b.v) % 2100 + 2100) % 2100 - 90;
      return b.fill
        ? <circle key={k} cx={b.x + Math.sin(t * 0.5 + k) * 14} cy={y} r={b.r} fill={K.cyan} opacity={0.16} filter="url(#esBokeh)" />
        : <circle key={k} cx={b.x + Math.sin(t * 0.5 + k) * 14} cy={y} r={b.r} fill="none" stroke="#fff" strokeWidth={6} opacity={0.22} filter="url(#esBokeh)" />;
    })}
  </svg>
);

// ================================================================ film
const SW = (i: number, colors: [string, string]) => ({at: CUTS[i] - 0.3, dur: 0.8, dir: (i % 2 ? 'down' : 'up') as 'up' | 'down', colors, seed: i * 3 + 1});
const SHOTS: Shot[] = [
  {from: 0, render: S1, bg: 'aqua', overlay: S1H},
  {from: CUTS[0], render: S2, bg: 'amber', overlay: S2H, sweep: SW(0, [K.amber, K.pink])},
  {from: CUTS[1], render: S3, bg: 'night', overlay: S3H, sweep: SW(1, [K.cyan, K.violet])},
  {from: CUTS[2], render: S4, bg: 'deep', overlay: S4H, sweep: SW(2, ['#E8F7FF', K.cyan])},
  {from: CUTS[3], render: S5, bg: 'night', overlay: S5O, sweep: SW(3, [K.violet, K.pink])},
  {from: CUTS[4], render: S6, bg: 'aqua', overlay: S6H, sweep: SW(4, [K.cyan, K.violet])},
  {from: CUTS[5], render: S7, bg: 'deep', overlay: S7H, sweep: SW(5, ['#E8F7FF', K.cyan])},
  {from: CUTS[6], render: S8, bg: 'aqua', overlay: S8H, sweep: SW(6, [K.cyan, K.violet])},
  {from: CUTS[7], render: S9, bg: 'night', overlay: S9H, sweep: SW(7, [K.violet, K.pink])},
];

export const Es: React.FC<{cover?: number}> = ({cover}) => {
  const frameT = useCurrentFrame() / useVideoConfig().fps;
  const t = cover ?? frameT;
  const hit = IMPACTS.find((a) => t > a && t < a + 0.45);
  const sh = hit !== undefined ? (1 - (t - hit) / 0.45) * 12 : 0;
  return (
    <AbsoluteFill style={{background: K.night, overflow: 'hidden'}}>
      <StyleFonts />
      <AbsoluteFill style={{transform: `translate(${Math.sin(t * 90) * sh}px, ${Math.cos(t * 77) * sh}px)`}}>
        <Shots t={Math.min(t, END)} shots={cover === undefined ? SHOTS : SHOTS.map((s) => ({...s, overlay: undefined}))} />
      </AbsoluteFill>
      <DepthFG t={t} />
      {cover !== undefined && (
        <Abs center y={240}>
          <Glass style={{padding: '26px 56px 32px', textAlign: 'center'}}>
            <div style={txt(56, 600, K.cyan, {letterSpacing: 6})}>KENAPA</div>
            <div style={txt(124, 800)}>ES MENGAPUNG?</div>
          </Glass>
        </Abs>
      )}
      {cover === undefined && <Caption t={t} pages={PAGES} top={1330} />}
      {cover === undefined && <AudiraOutro seconds={ES_SECONDS - END} />}
      {cover === undefined && <AudiraSignature seed="kenapa-es-mengapung-ep03" />}
    </AbsoluteFill>
  );
};
