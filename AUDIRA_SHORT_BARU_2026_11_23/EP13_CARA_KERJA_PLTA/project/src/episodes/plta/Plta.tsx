import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {buildPages} from '../../components/WordCaptions';
import {lerp, p, pio, rnd, StyleFonts} from '../../styles/shared';
import {B, Caption, Dim, Drift, GridBg, HEAD, MONO, Pt, BreakMark} from '../../styles/blueprint/kit';
import {AudiraOutro} from '../../brand/AudiraOutro';
import {AudiraSignature} from '../../brand/AudiraSignature';
import {along, Bulb, Card, COPPER, Defs, Drop, Flow, fmt, Heading, Monas, pathOf, pop, popIO, Runner, SheetWipe, spin, Stamp, Tag, TitleBlock, Tower, useBpFonts} from './parts';
import rawWords from './words.json';

// EP13 · Cara Kerja PLTA — BLUEPRINT style. Audio master clock: every time below comes from words.json
// (Cartesia VO, 85.59 s). Ten drawing sheets, one per narration beat; each cut is a sheet sliding up.
// S1 hook drop→bulb · S2 Citarum map, 3 dams · S3 dam section, head · S4 penstock 362,4 m · S5 Francis turbine >95%
// · S6 generator · S7 transformer 500 kV + grid · S8 Cirata 8 units 1.000 MW (payoff) · S9 water cycle · S10 city lights.

export const END = 85.9;
export const PLTA_SECONDS = END + 3;
const CUTS = [7.1, 14.2, 26.0, 36.9, 46.1, 56.8, 66.1, 75.1, 80.7];
const PAYOFF = 69.95;

const DISPLAY: Record<string, string> = {Audira: 'AUDIRA'};
const WORDS = (rawWords as {text: string; start: number; end: number}[]).map((w, i) => ({i, word: DISPLAY[w.text] ?? w.text, start: w.start, end: w.end}));
const PAGES = buildPages(WORDS, 7, 38, 0.45);

const Sheet: React.FC<{id: string; t: number; from: number; to: number; i: number; n: string; title: string; hud?: React.ReactNode; children: React.ReactNode}> = ({
  id, t, from, to, i, n, title, hud, children,
}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <Defs />
    <rect width={1080} height={1920} fill={B.bg} />
    {/* depth: BG grid drifts at half rate, MG drawing lifts off the paper with a soft shadow, FG drafting tools blur past faster */}
    <Drift t={t} from={from} to={to} i={i} fy={980} amount={0.4}>
      <GridBg id={id} />
    </Drift>
    <Drift t={t} from={from} to={to} i={i} fy={980}>
      <g filter="url(#lift)">{children}</g>
    </Drift>
    <Drift t={t} from={from} to={to} i={i + 3} fy={1700} amount={1.6}>
      <DraftTools />
    </Drift>
    <rect width={1080} height={1920} fill="url(#key)" />
    <rect width={1080} height={1920} fill="url(#vig)" />
    <TitleBlock n={n} title={title} q={p(t, from, from + 0.4)} />
    {hud}
  </svg>
);

/** Foreground layer: a T-square ruler and set square resting on the sheet, out of focus, below the caption band. */
const DraftTools: React.FC = () => (
  <g filter="url(#fgBlur)" opacity={0.8}>
    <g transform="translate(0 -40) rotate(-4 540 1640)">
      <rect x={-60} y={1600} width={1200} height={58} fill={B.face2} stroke={B.cyan} strokeWidth={3} />
      {Array.from({length: 40}).map((_, k) => (
        <line key={k} x1={-40 + k * 30} y1={1600} x2={-40 + k * 30} y2={1600 + (k % 5 === 0 ? 26 : 14)} stroke={B.line2} strokeWidth={2} />
      ))}
    </g>
    <path d="M 860 1700 L 1140 1700 L 1140 1420 Z" fill={B.face2} fillOpacity={0.6} stroke={B.cyan} strokeWidth={3} />
    <path d="M 950 1660 L 1100 1660 L 1100 1510 Z" fill={B.bg} stroke={B.line2} strokeWidth={2} />
  </g>
);

// ================================================================ S1 HOOK — a falling drop lights a bulb
const S1: React.FC<{t: number}> = ({t}) => {
  const per = 0.75;
  const k = (t - 0.6) / per;
  const u = ((k % 1) + 1) % 1;
  const on = p(t, 3.5, 3.75);
  return (
    <Sheet id="g1" t={t} from={0} to={CUTS[0]} i={0} n="01" title="PROLOG"
      hud={<>
        <Heading text="AIR JATUH" t={t} at={0.1} y={390} size={124} />
        <Heading text="= LISTRIK?" t={t} at={2.55} y={520} size={112} color={B.yellow} />
        <Tag x={540} y={612} text="AUDIRA EXPLAINED" q={pop(t, 5.7)} color={B.cyan} size={38} />
        <Stamp x={800} y={880} text="KOK BISA?" q={popIO(t, 3.95, 7.2)} size={58} rot={-8} />
      </>}>
      <line x1={540} y1={670} x2={540} y2={930} stroke={B.line2} strokeWidth={3} strokeDasharray="14 12" opacity={p(t, 0.2, 0.8)} />
      <Dim a={[380, 670]} b={[380, 930]} text="TINGGI" q={p(t, 0.8, 1.5)} offset={-22} />
      {t > 0.6 && <Drop x={540} y={lerp(690, 925, u * u)} s={1.1} />}
      {t > 1.35 && <ellipse cx={540} cy={940} rx={30 + 70 * u} ry={8 + 16 * u} fill="none" stroke={B.cyan} strokeWidth={4} opacity={1 - u} />}
      <Bulb cx={540} cy={1060} r={120} q={p(t, 0.0, 1.2)} on={on} t={t} />
    </Sheet>
  );
};

// ================================================================ S2 CITARUM — schematic river, three dams
const RIVER: Pt[] = [[230, 560], [430, 650], [330, 780], [600, 860], [470, 990], [760, 1080], [620, 1200], [820, 1290]];
const DAMS = [
  {pt: RIVER[2], seg: [RIVER[1], RIVER[2]], name: 'SAGULING', at: 10.56, tag: [790, 740] as Pt},
  {pt: RIVER[4], seg: [RIVER[3], RIVER[4]], name: 'CIRATA', at: 11.94, tag: [840, 950] as Pt},
  {pt: RIVER[6], seg: [RIVER[5], RIVER[6]], name: 'JATILUHUR', at: 12.96, tag: [290, 1130] as Pt},
];
const S2: React.FC<{t: number}> = ({t}) => {
  const bank = p(t, 7.3, 8.9);
  return (
    <Sheet id="g2" t={t} from={CUTS[0]} to={CUTS[1]} i={1} n="02" title="SUNGAI CITARUM"
      hud={<>
        <Heading text="SUNGAI CITARUM" sub="JAWA BARAT · SKEMA" t={t} at={7.3} y={330} size={92} />
        <Card x={540} y={436} w={640} h={92} q={popIO(t, 9.4, 14.6)} accent={B.yellow}>
          <text x={320} y={66} textAnchor="middle" fill={B.yellow} style={{fontFamily: HEAD, fontWeight: 700, fontSize: 58}}>DIBENDUNG 3×</text>
        </Card>
      </>}>
      <path d={pathOf(RIVER)} fill="none" stroke={B.line} strokeWidth={54} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - bank} />
      <path d={pathOf(RIVER)} fill="none" stroke={B.face2} strokeWidth={46} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - bank} />
      <path d={pathOf(RIVER)} fill="none" stroke={B.cyan} strokeWidth={6} strokeLinejoin="round" strokeDasharray="22 30" strokeDashoffset={-t * 110} opacity={p(t, 8.3, 8.9)} />
      <Tag x={130} y={560} text="HULU" q={pop(t, 8.0)} size={32} color={B.line2} />
      <Tag x={930} y={1290} text="HILIR" q={pop(t, 8.6)} size={32} color={B.line2} />
      {DAMS.map((d, i) => {
        const q = pop(t, d.at - 0.1);
        const a = Math.atan2(d.seg[1][1] - d.seg[0][1], d.seg[1][0] - d.seg[0][0]) * 180 / Math.PI;
        const up = along([d.seg[0], d.seg[1]], 0.55);
        return (
          <g key={i}>
            <ellipse cx={up[0]} cy={up[1]} rx={86 * Math.min(1, q)} ry={50 * Math.min(1, q)} fill={B.cyan} fillOpacity={0.28} stroke={B.cyan} strokeWidth={3} transform={`rotate(${a} ${up[0]} ${up[1]})`} />
            <rect x={-60} y={-13} width={120} height={26} fill={B.line} transform={`translate(${d.pt[0]} ${d.pt[1]}) rotate(${a + 90}) scale(${Math.min(1.2, q)})`} />
            <g opacity={Math.min(1, q)}>
              <circle cx={d.pt[0] + 46} cy={d.pt[1] - 44} r={24} fill={B.yellow} />
              <text x={d.pt[0] + 46} y={d.pt[1] - 34} textAnchor="middle" fill={B.deep} style={{fontFamily: MONO, fontWeight: 700, fontSize: 28}}>{i + 1}</text>
            </g>
            <Tag a={d.pt} x={d.tag[0]} y={d.tag[1]} text={d.name} q={pop(t, d.at)} size={40} color={B.yellow} />
          </g>
        );
      })}
    </Sheet>
  );
};

// ================================================================ S3 DAM SECTION — head, energy in height
const faceX = (y: number) => 560 + ((1250 - y) / 590) * 70;
const S3: React.FC<{t: number}> = ({t}) => {
  const yW = lerp(1240, 720, pio(t, 14.9, 16.6));
  const dq = p(t, 14.4, 15.4);
  const wave = Array.from({length: 13}, (_, i) => {
    const x = 60 + (i / 12) * (faceX(yW) - 60);
    return [x, yW + Math.sin(t * 3 + i * 0.9) * 5] as Pt;
  });
  const hiT = p(t, 21.84, 22.1), hiD = p(t, 23.44, 23.7), hiL = p(t, 24.95, 25.2);
  return (
    <Sheet id="g3" t={t} from={CUTS[1]} to={CUTS[2]} i={2} n="03" title="BENDUNGAN"
      hud={<>
        <Heading text="BENDUNGAN" sub="POTONGAN MELINTANG" t={t} at={14.4} y={330} size={96} />
        <Card x={540} y={430} w={900} h={170} q={popIO(t, 17.3, 21.4)} kicker="ENERGINYA TERSIMPAN DI">
          <text x={450} y={140} textAnchor="middle" fill={B.yellow} style={{fontFamily: HEAD, fontWeight: 700, fontSize: 76}}>KETINGGIAN</text>
        </Card>
        <Card x={540} y={430} w={940} h={170} q={pop(t, 21.45)} kicker="MAKIN BESAR LISTRIKNYA">
          <text x={470} y={138} textAnchor="middle" style={{fontFamily: HEAD, fontWeight: 700, fontSize: 60}}>
            <tspan fill={hiL > 0 ? B.yellow : B.line}>LISTRIK</tspan>
            <tspan fill={B.line2}> ∝ </tspan>
            <tspan fill={hiT > 0 ? B.yellow : B.line}>TINGGI</tspan>
            <tspan fill={B.line2}> × </tspan>
            <tspan fill={hiD > 0 ? B.cyan : B.line}>DEBIT</tspan>
          </text>
        </Card>
      </>}>
      <rect x={60} y={1250} width={960} height={70} fill="url(#earth)" opacity={dq} />
      <line x1={60} y1={1250} x2={1020} y2={1250} {...{stroke: B.line, strokeWidth: 4}} opacity={dq} />
      {/* reservoir */}
      <path d={`${pathOf(wave)} L ${faceX(yW)} ${yW} L 560 1250 L 60 1250 Z`} fill={B.cyan} fillOpacity={0.22} />
      <path d={pathOf(wave)} fill="none" stroke={B.cyan} strokeWidth={4} />
      {/* dam */}
      <path d="M 560 1250 L 630 660 L 690 660 L 780 1250 Z" fill={B.face1} stroke={B.line} strokeWidth={5} strokeLinejoin="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - dq} />
      <path d="M 560 1250 L 630 660 L 690 660 L 780 1250 Z" fill="url(#hatchC)" opacity={p(t, 14.8, 15.5)} />
      {/* tailwater */}
      <path d="M 780 1236 Q 900 1228 1020 1236 L 1020 1250 L 780 1250 Z" fill={B.cyan} fillOpacity={0.3} opacity={dq} />
      <Dim a={[880, 720]} b={[880, 1232]} text="TINGGI JATUH" q={p(t, 16.2, 17.0)} color={B.yellow} offset={-24} />
      <Tag x={960} y={640} text="HEAD" q={pop(t, 16.4)} size={34} color={B.yellow} />
      {/* height arrow bouncing on TINGGI */}
      {hiT > 0 && <path d={`M 300 ${700 - 40 * Math.abs(Math.sin(t * 4))} l -40 60 l 26 0 l 0 70 l 28 0 l 0 -70 l 26 0 Z`} fill={B.yellow} opacity={hiT} />}
      <Flow pts={[[160, 1210], [560, 1215], [790, 1238], [1020, 1240]]} t={t} start={23.4} n={18} speed={0.6} r={9} />
      {hiL > 0 && <Bulb cx={960} cy={1010} r={46} q={1} on={hiL} t={t} />}
    </Sheet>
  );
};

// ================================================================ S4 PENSTOCK — 362,4 m drop at Saguling
const PIPE: Pt[] = [[370, 770], [860, 1205]];
const S4: React.FC<{t: number}> = ({t}) => {
  const pq = p(t, 26.3, 27.9);
  const ang = Math.atan2(PIPE[1][1] - PIPE[0][1], PIPE[1][0] - PIPE[0][0]);
  const nx = -Math.sin(ang) * 22, ny = Math.cos(ang) * 22;
  const h = lerp(0, 362.4, pio(t, 32.2, 34.1));
  return (
    <Sheet id="g4" t={t} from={CUTS[2]} to={CUTS[3]} i={3} n="04" title="PIPA PESAT"
      hud={<>
        <Heading text="DARI DASAR WADUK" t={t} at={26.2} y={330} size={84} out={29.1} />
        <Heading text="PIPA PESAT" sub="PENSTOCK" t={t} at={29.2} y={330} size={100} color={B.cyan} />
        <Card x={540} y={420} w={900} h={232} q={pop(t, 30.4)} kicker="PLTA SAGULING · TINGGI JATUH" accent={B.yellow}>
          <text x={30} y={168} fill={B.yellow} style={{fontFamily: HEAD, fontWeight: 700, fontSize: 120}}>{fmt(h, 1)}<tspan fontSize={64}> m</tspan></text>
          {[0, 1, 2].map((i) => (
            <g key={i} opacity={pop(t, 35.2 + i * 0.12)}>
              <Monas x={660 + i * 82} base={205} h={128} q={p(t, 35.2 + i * 0.12, 35.6 + i * 0.12)} color={i === 2 ? B.line2 : B.line} />
            </g>
          ))}
          <text x={870} y={60} textAnchor="end" fill={B.line} opacity={pop(t, 35.5)} style={{fontFamily: MONO, fontWeight: 600, fontSize: 30}}>≈ 2,7× MONAS</text>
        </Card>
      </>}>
      {/* reservoir + dam */}
      <path d="M 60 720 L 330 720 L 330 820 L 60 820 Z" fill={B.cyan} fillOpacity={0.22} opacity={p(t, 26.0, 26.5)} />
      <path d={`M 60 ${720 + Math.sin(t * 3) * 4} Q 200 ${712 + Math.sin(t * 3 + 1) * 6} 330 720`} fill="none" stroke={B.cyan} strokeWidth={4} />
      <rect x={330} y={680} width={44} height={160} fill={B.face1} stroke={B.line} strokeWidth={4} />
      <Tag a={[310, 800]} x={170} y={900} text="INTAKE" q={pop(t, 27.1)} size={30} color={B.cyan} />
      {/* penstock: two walls */}
      <path d={`M ${PIPE[0][0] + nx} ${PIPE[0][1] + ny} L ${PIPE[1][0] + nx} ${PIPE[1][1] + ny}`} fill="none" stroke={B.line} strokeWidth={5} pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - pq} />
      <path d={`M ${PIPE[0][0] - nx} ${PIPE[0][1] - ny} L ${PIPE[1][0] - nx} ${PIPE[1][1] - ny}`} fill="none" stroke={B.line} strokeWidth={5} pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - pq} />
      <Flow pts={PIPE} t={t} start={27.2} n={22} speed={lerp(0.35, 0.9, p(t, 27.2, 31.5))} r={10} />
      {/* powerhouse */}
      <g opacity={p(t, 27.6, 28.3)}>
        <rect x={830} y={1160} width={170} height={120} fill={B.face1} stroke={B.line} strokeWidth={4} />
        <path d="M 820 1160 L 915 1110 L 1010 1160" fill="none" stroke={B.line} strokeWidth={4} />
        <Runner cx={915} cy={1222} R={40} rot={spin(t, 27.6, 30, 300)} q={1} />
      </g>
      <Tag x={820} y={1080} text="PEMBANGKIT" q={pop(t, 28.0)} size={28} color={B.line} anchor="end" />
      <rect x={60} y={1290} width={960} height={30} fill="url(#earth)" />
      <Dim a={[1030, 720]} b={[1030, 1205]} text="362,4 m" q={p(t, 32.2, 34.1)} color={B.yellow} offset={-22} />
    </Sheet>
  );
};

// ================================================================ S5 FRANCIS TURBINE — >95 %
const TC: Pt = [540, 1000];
const RS = 210, R1 = 320;
const spiralPt = (th: number, mid: boolean): Pt => {
  const rOut = R1 - (R1 - RS - 12) * (th / (Math.PI * 2));
  const r = mid ? (rOut + RS) / 2 : rOut;
  const a = -Math.PI / 2 + th;
  return [TC[0] + Math.cos(a) * r, TC[1] + Math.sin(a) * r];
};
const SPIRAL = Array.from({length: 61}, (_, i) => spiralPt((i / 60) * Math.PI * 2, false));
const WATER: Pt[] = [[40, TC[1] - (R1 + RS) / 2], ...Array.from({length: 50}, (_, i) => spiralPt((i / 49) * Math.PI * 1.7, true)), [TC[0] - 60, TC[1] - 40]];
const S5: React.FC<{t: number}> = ({t}) => {
  const rot = spin(t, 37.95, 39.7, 420);
  const cq = p(t, 37.0, 38.2);
  const pct = lerp(0, 95, pio(t, 43.9, 45.4));
  return (
    <Sheet id="g5" t={t} from={CUTS[3]} to={CUTS[4]} i={4} n="05" title="TURBIN"
      hud={<>
        <Heading text="DI UJUNG PIPA" t={t} at={37.0} y={330} size={88} out={40.6} />
        <Heading text="TURBIN FRANCIS" sub="JENIS PALING UMUM" t={t} at={40.7} y={330} size={92} color={B.cyan} />
        <Card x={540} y={440} w={900} h={200} q={pop(t, 42.9)} kicker="ENERGI AIR → PUTARAN" accent={B.yellow}>
          <text x={450} y={168} textAnchor="middle" fill={B.yellow} style={{fontFamily: HEAD, fontWeight: 700, fontSize: 118}}>&gt;{Math.round(pct)}%</text>
        </Card>
      </>}>
      {/* inlet + spiral casing */}
      <path d={`M 40 ${TC[1] - R1} L ${TC[0]} ${TC[1] - R1} M 40 ${TC[1] - RS - 4} L ${TC[0] - 70} ${TC[1] - RS - 4}`} fill="none" stroke={B.line} strokeWidth={5} pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - cq} />
      <path d={pathOf(SPIRAL)} fill="none" stroke={B.line} strokeWidth={5} pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - cq} />
      <circle cx={TC[0]} cy={TC[1]} r={RS} fill={B.face3} fillOpacity={0.6} stroke={B.line2} strokeWidth={3} opacity={cq} />
      {Array.from({length: 16}).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return <line key={i} x1={TC[0] + Math.cos(a) * (RS - 26)} y1={TC[1] + Math.sin(a) * (RS - 26)} x2={TC[0] + Math.cos(a + 0.35) * (RS - 2)} y2={TC[1] + Math.sin(a + 0.35) * (RS - 2)} stroke={B.line2} strokeWidth={4} opacity={cq} />;
      })}
      <Flow pts={WATER} t={t} start={37.8} n={34} speed={lerp(0.3, 0.75, p(t, 37.8, 39.7))} r={10} />
      <Runner cx={TC[0]} cy={TC[1]} R={165} rot={rot} q={p(t, 37.2, 38.4)} glow={0.35 * p(t, 43.9, 45.4)} />
      <Tag a={[610, 930]} x={830} y={640} text="SUDU TURBIN" q={popIO(t, 38.39, 42.8)} size={34} color={B.yellow} />
    </Sheet>
  );
};

// ================================================================ S6 GENERATOR — rotating magnet, copper coils
const GC: Pt = [540, 890];
const S6: React.FC<{t: number}> = ({t}) => {
  const rot = spin(t, 46.3, 47.6, 240);
  const gq = p(t, 46.3, 47.5);
  const field = p(t, 52.18, 52.6);
  const flowOn = t > 53.3;
  return (
    <Sheet id="g6" t={t} from={CUTS[4]} to={CUTS[5]} i={5} n="06" title="GENERATOR"
      hud={<>
        <Heading text="GENERATOR" sub="POROS → MAGNET → KUMPARAN" t={t} at={46.4} y={330} size={100} />
        <Card x={540} y={430} w={900} h={130} q={pop(t, 52.2)} kicker="MEDAN MAGNET BERUBAH">
          <path d={Array.from({length: 61}, (_, i) => `${i ? 'L' : 'M'} ${400 + i * 7.8} ${80 + Math.sin(i * 0.32 - t * 9) * 30}`).join(' ')} fill="none" stroke={B.yellow} strokeWidth={5} />
        </Card>
        <Stamp x={540} y={1190} text="LISTRIK!" q={pop(t, 54.92, 0.3)} size={88} rot={-6} color={B.yellow} />
      </>}>
      {/* stator */}
      <circle cx={GC[0]} cy={GC[1]} r={300} fill={B.face3} stroke={B.line} strokeWidth={5} pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - gq} />
      <circle cx={GC[0]} cy={GC[1]} r={232} fill={B.bg} stroke={B.line2} strokeWidth={3} opacity={gq} />
      {Array.from({length: 18}).map((_, i) => {
        const a = (i / 18) * 360;
        const lit = flowOn ? 0.5 + 0.5 * Math.sin(t * 10 - i * 0.9) : 0;
        return (
          <g key={i} transform={`translate(${GC[0]} ${GC[1]}) rotate(${a}) translate(266 0)`} opacity={p(t, 46.6 + i * 0.03, 47.0 + i * 0.03)}>
            <rect x={-24} y={-17} width={48} height={34} rx={6} fill={lit > 0.6 ? B.yellow : COPPER} stroke={B.line} strokeWidth={2.5} />
            <line x1={-14} y1={-17} x2={-14} y2={17} stroke={B.deep} strokeWidth={2} />
            <line x1={0} y1={-17} x2={0} y2={17} stroke={B.deep} strokeWidth={2} />
            <line x1={14} y1={-17} x2={14} y2={17} stroke={B.deep} strokeWidth={2} />
          </g>
        );
      })}
      {/* rotor */}
      <g transform={`translate(${GC[0]} ${GC[1]}) rotate(${rot})`} opacity={p(t, 46.8, 47.6)}>
        {[0, 1, 2, 3].map((k) => {
          const a0 = (k * Math.PI) / 2 + 0.08, a1 = ((k + 1) * Math.PI) / 2 - 0.08;
          const r0 = 46, r1 = 206;
          const d = `M ${Math.cos(a0) * r0} ${Math.sin(a0) * r0} L ${Math.cos(a0) * r1} ${Math.sin(a0) * r1} A ${r1} ${r1} 0 0 1 ${Math.cos(a1) * r1} ${Math.sin(a1) * r1} L ${Math.cos(a1) * r0} ${Math.sin(a1) * r0} A ${r0} ${r0} 0 0 0 ${Math.cos(a0) * r0} ${Math.sin(a0) * r0} Z`;
          const am = (a0 + a1) / 2;
          return (
            <g key={k}>
              <path d={d} fill={k % 2 ? B.cyan : B.red} fillOpacity={0.45} stroke={B.line} strokeWidth={3} />
              <text x={Math.cos(am) * 135} y={Math.sin(am) * 135 + 22} textAnchor="middle" fill={B.line} style={{fontFamily: HEAD, fontWeight: 700, fontSize: 64}}>{k % 2 ? 'S' : 'N'}</text>
              {field > 0 && <path d={`M ${Math.cos(am - 0.3) * 210} ${Math.sin(am - 0.3) * 210} Q ${Math.cos(am + Math.PI / 4) * 290} ${Math.sin(am + Math.PI / 4) * 290} ${Math.cos(am + Math.PI / 2 + 0.3) * 210} ${Math.sin(am + Math.PI / 2 + 0.3) * 210}`}
                fill="none" stroke={B.cyan} strokeWidth={3.5} strokeDasharray="10 10" strokeDashoffset={-t * 60} opacity={field} />}
            </g>
          );
        })}
        <circle r={40} fill={B.deep} stroke={B.line} strokeWidth={4} />
      </g>
      {/* shaft + turbine below */}
      <rect x={528} y={1190} width={24} height={40} fill={B.line2} opacity={gq} />
      <Runner cx={540} cy={1268} R={44} rot={rot} q={gq} />
      <Tag a={[540, 1240]} x={300} y={1268} text="POROS" q={popIO(t, 46.5, 49.2)} size={32} color={B.line} />
      <Tag a={[470, 820]} x={190} y={612} text="MAGNET" q={popIO(t, 49.34, 54.8)} size={36} color={B.red} />
      <Tag a={[720, 700]} x={790} y={612} text="KUMPARAN TEMBAGA" q={popIO(t, 50.87, 54.8)} size={32} color={COPPER} />
      {/* output cable + electrons */}
      <path d="M 840 890 L 1000 890 L 1000 1300" fill="none" stroke={B.line} strokeWidth={6} opacity={gq} />
      <Flow pts={[[840, 890], [1000, 890], [1000, 1300]]} t={t} start={53.3} n={14} speed={0.9} r={9} color={B.yellow} />
    </Sheet>
  );
};

// ================================================================ S7 TRANSFORMER 500 kV + transmission grid
const WIRE: Pt[] = [[560, 760], [700, 970], [940, 998], [1080, 1006]];
const S7: React.FC<{t: number}> = ({t}) => {
  const cq = p(t, 57.0, 58.0);
  const kv = lerp(0, 500, pio(t, 60.4, 61.3));
  const tw = p(t, 61.9, 62.8);
  return (
    <Sheet id="g7" t={t} from={CUTS[5]} to={CUTS[6]} i={6} n="07" title="TRAFO & JARINGAN"
      hud={<>
        <Heading text="BELUM CUKUP" sub="UNTUK PERJALANAN JAUH" t={t} at={56.95} y={330} size={96} color={B.red} out={59.65} />
        <Heading text="TRAFO" t={t} at={59.72} y={330} size={104} color={B.cyan} />
        <Card x={540} y={400} w={900} h={186} q={pop(t, 59.9)} kicker="TEGANGAN DINAIKKAN" accent={B.yellow}>
          <text x={450} y={160} textAnchor="middle" fill={B.yellow} style={{fontFamily: HEAD, fontWeight: 700, fontSize: 112}}>{Math.round(kv)}<tspan fontSize={70}> kV</tspan></text>
        </Card>
        {['JAWA', 'MADURA', 'BALI'].map((s, i) => (
          <Tag key={s} x={[220, 540, 860][i]} y={650} text={s} q={pop(t, [63.56, 64.1, 64.91][i])} size={40} color={B.yellow} />
        ))}
      </>}>
      {/* core */}
      <path d="M 140 700 L 560 700 L 560 1020 L 140 1020 Z M 240 790 L 240 930 L 460 930 L 460 790 Z" fill={B.face1} fillRule="evenodd" stroke={B.line} strokeWidth={4} opacity={cq} />
      <path d="M 140 700 L 560 700 L 560 1020 L 140 1020 Z" fill="url(#hatchC)" opacity={0.5 * cq} />
      {Array.from({length: 4}).map((_, i) => <ellipse key={i} cx={190} cy={770 + i * 60} rx={72} ry={16} fill="none" stroke={COPPER} strokeWidth={9} opacity={p(t, 57.3 + i * 0.1, 57.6 + i * 0.1)} />)}
      {Array.from({length: 13}).map((_, i) => <ellipse key={i} cx={510} cy={728 + i * 22} rx={72} ry={12} fill="none" stroke={kv > 50 ? B.yellow : COPPER} strokeWidth={7} opacity={p(t, 57.5 + i * 0.05, 57.8 + i * 0.05)} />)}
      <text x={190} y={1070} textAnchor="middle" fill={B.line2} opacity={p(t, 59.9, 60.3)} style={{fontFamily: MONO, fontWeight: 600, fontSize: 30}}>PRIMER</text>
      <text x={510} y={1070} textAnchor="middle" fill={B.yellow} opacity={p(t, 60.0, 60.4)} style={{fontFamily: MONO, fontWeight: 600, fontSize: 30}}>SEKUNDER</text>
      {/* input from generator */}
      <path d="M 40 860 L 118 860" stroke={B.line} strokeWidth={6} opacity={cq} />
      <Flow pts={[[40, 860], [118, 860]]} t={t} start={57.0} n={3} speed={0.5} r={7} color={B.yellow} />
      {/* weak line + break (before the transformer steps up) */}
      <g opacity={1 - p(t, 59.5, 59.9)}>
        <path d="M 580 860 L 1040 860" stroke={B.line2} strokeWidth={4} strokeDasharray="12 12" opacity={p(t, 57.4, 57.9)} />
        <BreakMark x={810} y={860} w={120} q={p(t, 58.3, 58.7)} />
        <Tag x={810} y={950} text="TERLALU LEMAH" q={pop(t, 58.4)} size={32} color={B.red} />
      </g>
      {/* towers + wires */}
      <rect x={560} y={1250} width={500} height={50} fill="url(#earth)" opacity={tw} />
      <Tower x={700} base={1250} h={330} q={tw} />
      <Tower x={940} base={1250} h={300} q={p(t, 62.2, 63.0)} />
      <path d={`M ${WIRE[0][0]} ${WIRE[0][1]} Q 640 900 ${WIRE[1][0]} ${WIRE[1][1]} Q 820 1010 ${WIRE[2][0]} ${WIRE[2][1]} L ${WIRE[3][0]} ${WIRE[3][1]}`} fill="none" stroke={B.line} strokeWidth={3} opacity={tw} />
      <Flow pts={WIRE} t={t} start={62.0} n={12} speed={1.1} r={9} color={B.yellow} />
    </Sheet>
  );
};

// ================================================================ S8 CIRATA — 8 units, 1.000 MW (payoff)
const UNITS: Pt[] = [215, 430, 650, 865].flatMap((x) => [[x, 750], [x, 925]] as Pt[]);
const LOAD: [number, number][] = [[0, 0.55], [3, 0.5], [6, 0.6], [9, 0.74], [12, 0.78], [15, 0.74], [17, 0.86], [19, 1.0], [21, 0.95], [22, 0.86], [24, 0.6]];
const S8: React.FC<{t: number}> = ({t}) => {
  const mw = lerp(0, 1000, pio(t, 69.1, PAYOFF));
  const chart = p(t, 71.45, 72.6);
  const hx = (h: number) => 140 + (h / 24) * 800;
  const ly = (f: number) => 1285 - f * 150;
  const curve = LOAD.map(([h, f]) => [hx(h), ly(f)] as Pt);
  const flash = t > PAYOFF ? Math.max(0, 1 - (t - PAYOFF) / 0.35) : 0;
  return (
    <Sheet id="g8" t={t} from={CUTS[6]} to={CUTS[7]} i={7} n="08" title="PLTA CIRATA"
      hud={<>
        <Heading text="PLTA CIRATA" sub="8 TURBIN" t={t} at={66.5} y={330} size={100} color={B.cyan} />
        <Card x={540} y={420} w={900} h={210} q={pop(t, 68.8)} kicker="KAPASITAS ± " accent={B.yellow}>
          <text x={450} y={172} textAnchor="middle" fill={B.yellow} style={{fontFamily: HEAD, fontWeight: 700, fontSize: 124}}>{fmt(Math.round(mw / 10) * 10)}<tspan fontSize={72}> MW</tspan></text>
        </Card>
        <Stamp x={540} y={1150} text="TERBESAR DI INDONESIA" q={popIO(t, PAYOFF, 71.5)} size={52} rot={-6} />
        {flash > 0 && <rect width={1080} height={1920} fill="#FFF6D0" opacity={0.35 * flash} />}
      </>}>
      <rect x={110} y={660} width={860} height={375} fill={B.face3} fillOpacity={0.5} stroke={B.line} strokeWidth={4} pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - p(t, 66.2, 67.2)} />
      <line x1={110} y1={837} x2={970} y2={837} stroke={B.line2} strokeWidth={2} strokeDasharray="10 10" opacity={p(t, 66.8, 67.3)} />
      {UNITS.map((u, i) => {
        const lit = p(t, 67.88 + i * 0.09, 68.0 + i * 0.09);
        return (
          <g key={i}>
            <circle cx={u[0]} cy={u[1]} r={80} fill="none" stroke={B.line2} strokeWidth={3} opacity={p(t, 66.6, 67.2)} />
            <Runner cx={u[0]} cy={u[1]} R={66} rot={lit > 0 ? spin(t, 67.9 + i * 0.09, 69.0, 360) + i * 13 : i * 13} q={p(t, 66.6 + i * 0.05, 67.4 + i * 0.05)} glow={lit * (t > PAYOFF ? 0.9 : 0.55)} blades={9} />
            <text x={u[0]} y={u[1] + 108} textAnchor="middle" fill={lit > 0 ? B.yellow : B.line2} style={{fontFamily: MONO, fontWeight: 600, fontSize: 24}} opacity={p(t, 66.8, 67.3)}>{i < 0 ? '' : ''}</text>
          </g>
        );
      })}
      {UNITS.map((u, i) => (
        <text key={`n${i}`} x={u[0] + 62} y={u[1] - 58} fill={p(t, 67.88 + i * 0.09, 68.0 + i * 0.09) > 0 ? B.yellow : B.line2} style={{fontFamily: MONO, fontWeight: 700, fontSize: 28}} opacity={p(t, 66.8, 67.3)}>{i + 1}</text>
      ))}
      {/* daily load curve: peak 17–22 */}
      <g opacity={chart}>
        <line x1={140} y1={1285} x2={940} y2={1285} stroke={B.line} strokeWidth={3} />
        <rect x={hx(17)} y={1120} width={hx(22) - hx(17)} height={165} fill={B.yellow} opacity={0.22 * p(t, 72.6, 73.0)} />
        <path d={pathOf(curve)} fill="none" stroke={B.cyan} strokeWidth={5} pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - p(t, 71.6, 72.9)} />
        {[0, 6, 12, 18, 24].map((h) => <text key={h} x={hx(h)} y={1318} textAnchor="middle" fill={B.line2} style={{fontFamily: MONO, fontWeight: 600, fontSize: 28}}>{String(h).padStart(2, '0')}</text>)}
      </g>
      <Tag x={540} y={1076} text="BEBAN PUNCAK 17.00–22.00" q={pop(t, 72.9)} size={32} color={B.yellow} />
    </Sheet>
  );
};

// ================================================================ S9 WATER CYCLE — cascade of three reservoirs
const CASCADE: Pt[] = [[90, 660], [340, 662], [380, 720], [420, 800], [410, 870], [640, 900], [680, 960], [705, 1040], [700, 1110], [920, 1140], [958, 1200], [1000, 1258], [1080, 1268]];
const RES = [
  {x0: 70, x1: 360, y: 640, name: 'SAGULING', dam: 360},
  {x0: 330, x1: 660, y: 880, name: 'CIRATA', dam: 660},
  {x0: 630, x1: 940, y: 1120, name: 'JATILUHUR', dam: 940},
];
const S9: React.FC<{t: number}> = ({t}) => (
  <Sheet id="g9" t={t} from={CUTS[7]} to={CUTS[8]} i={8} n="09" title="SIKLUS AIR"
    hud={<>
      <Heading text="AIRNYA TIDAK HABIS" t={t} at={75.3} y={330} size={84} />
      <Tag x={720} y={760} text="KEMBALI KE SUNGAI" q={pop(t, 77.0)} size={34} color={B.cyan} />
      <Tag x={300} y={1110} text="DIPAKAI LAGI ↻" q={pop(t, 79.43)} size={38} color={B.yellow} />
    </>}>
    {RES.map((r, i) => {
      const q = p(t, 75.2 + i * 0.25, 75.9 + i * 0.25);
      return (
        <g key={i} opacity={q}>
          <path d={`M ${r.x0} ${r.y} L ${r.x1} ${r.y} L ${r.x1} ${r.y + 100} L ${r.x0 + 40} ${r.y + 100} Z`} fill={B.cyan} fillOpacity={0.24} />
          <path d={`M ${r.x0} ${r.y + Math.sin(t * 3 + i) * 4} Q ${(r.x0 + r.x1) / 2} ${r.y - 8 + Math.sin(t * 3 + i + 1) * 4} ${r.x1} ${r.y}`} fill="none" stroke={B.cyan} strokeWidth={4} />
          <rect x={r.dam} y={r.y - 30} width={36} height={150} fill={B.face1} stroke={B.line} strokeWidth={4} />
          <path d={`M ${r.x0 - 10} ${r.y - 40} L ${r.x0 + 40} ${r.y + 100} L ${r.dam + 36} ${r.y + 120} L ${r.dam + 90} ${r.y + 240}`} fill="none" stroke={B.line} strokeWidth={4} />
          <text x={(r.x0 + r.x1) / 2 + 20} y={r.y + 70} textAnchor="middle" fill={B.line} style={{fontFamily: MONO, fontWeight: 700, fontSize: 34, letterSpacing: 2}}>{r.name}</text>
          <Runner cx={r.dam + 70} cy={r.y + 150} R={28} rot={t * 300} q={1} />
        </g>
      );
    })}
    <Flow pts={CASCADE} t={t} start={75.4} n={34} speed={0.22} r={9} />
  </Sheet>
);

// ================================================================ S10 CITY LIGHTS + sign-off
const BLD = [[60, 120, 260], [190, 90, 340], [290, 150, 300], [450, 110, 350], [570, 140, 330], [720, 100, 320], [830, 170, 280]] as const;
const S10: React.FC<{t: number}> = ({t}) => {
  const k = pio(t, 82.9, 83.6);
  const on = p(t, 83.6, 83.85);
  return (
    <Sheet id="g10" t={t} from={CUTS[8]} to={END + 3} i={9} n="10" title="KOTA"
      hud={<>
        <Heading text="SAAT LAMPUMU MENYALA" t={t} at={80.9} y={330} size={74} out={84.45} />
        <Card x={540} y={380} w={840} h={170} q={pop(t, 84.5)} kicker="IKUTI" accent={B.yellow}>
          <text x={420} y={138} textAnchor="middle" fill={B.yellow} style={{fontFamily: HEAD, fontWeight: 700, fontSize: 76}}>@AudiraExplained</text>
        </Card>
      </>}>
      <rect x={40} y={1270} width={1000} height={40} fill="url(#earth)" />
      <line x1={40} y1={1270} x2={1040} y2={1270} stroke={B.line} strokeWidth={4} />
      {BLD.map(([x, w, h], bi) => {
        const q = p(t, 80.8 + bi * 0.1, 81.6 + bi * 0.1);
        const cols = Math.floor((w - 20) / 34), rows = Math.floor((h - 30) / 46);
        return (
          <g key={bi}>
            <rect x={x} y={1270 - h} width={w} height={h} fill={B.face2} fillOpacity={0.7} stroke={B.line} strokeWidth={3.5} pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - q} />
            {Array.from({length: cols * rows}).map((_, j) => {
              const c = j % cols, r = Math.floor(j / cols);
              const lit = t > 81.4 + rnd(bi * 31 + j * 7.7) * 2.2;
              return <rect key={j} x={x + 14 + c * 34} y={1270 - h + 22 + r * 46} width={18} height={26} fill={lit ? B.yellow : B.face3} opacity={q} />;
            })}
          </g>
        );
      })}
      <line x1={540} y1={470} x2={540} y2={590} stroke={B.line2} strokeWidth={3} strokeDasharray="12 10" opacity={popIO(t, 82.4, 84.2)} />
      {t > 82.9 && t < 83.65 && <Drop x={540} y={lerp(470, 595, k * k)} s={1.1} />}
      <Bulb cx={540} cy={700} r={100} q={p(t, 80.9, 81.9)} on={on} t={t} />
      <text x={540} y={960} textAnchor="middle" fill={B.cyan} opacity={p(t, 83.1, 83.6) * (1 - p(t, 84.3, 84.6))} style={{fontFamily: MONO, fontWeight: 600, fontSize: 34, letterSpacing: 2}}>AIR CITARUM</text>
    </Sheet>
  );
};

// ================================================================ film
const SCENES: React.FC<{t: number}>[] = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10];
const sceneAt = (t: number): React.ReactNode => {
  for (let i = 0; i < CUTS.length; i++) {
    const c = CUTS[i];
    if (t >= c - 0.22 && t < c + 0.26) {
      const A = SCENES[i], Bn = SCENES[i + 1];
      return <SheetWipe q={pio(t, c - 0.22, c + 0.26)} a={<A t={t} />} b={<Bn t={t} />} />;
    }
  }
  const idx = CUTS.filter((c) => t >= c).length;
  const S = SCENES[idx];
  return <S t={t} />;
};

export const Plta: React.FC<{cover?: number}> = ({cover}) => {
  const frameT = useCurrentFrame() / useVideoConfig().fps;
  const t = cover ?? frameT;
  const ready = useBpFonts();
  const sh = t > PAYOFF && t < PAYOFF + 0.5 ? (1 - (t - PAYOFF) / 0.5) * 10 : 0;
  return (
    <AbsoluteFill style={{background: B.bg, overflow: 'hidden'}}>
      <StyleFonts />
      {ready && (
        <>
          <AbsoluteFill style={{transform: `translate(${Math.sin(t * 90) * sh}px, ${Math.cos(t * 77) * sh}px)`}}>{sceneAt(Math.min(t, END))}</AbsoluteFill>
          {cover === undefined && <Caption t={t} pages={PAGES} top={1340} />}
        </>
      )}
      {cover === undefined && <AudiraOutro seconds={PLTA_SECONDS - END} />}
      {cover === undefined && <AudiraSignature seed="cara-kerja-plta-ep13" />}
    </AbsoluteFill>
  );
};
