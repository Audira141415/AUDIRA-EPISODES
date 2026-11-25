import React from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, interpolateColors, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {buildPages} from '../../components/WordCaptions';
import {AudiraOutro} from '../../brand/AudiraOutro';
import {AudiraSignature} from '../../brand/AudiraSignature';
import rawWords from './words.json';
import {
  Balance, Big, Bolt, Bunting, Candle, Card, Cloche, Cloud, Crescent, Defs, Desk, eio, eo, Finish, Gold, Hill, House, IconBread, IconCheck,
  IconEye, IconHeart, InkLines, K, Kicker, Lantern, lerp, Light, Medallion, MiniSky, Motes, Page, pop, Quill, Quote, rnd, Robed, Seal, shade,
  Shelves, Star, Svg, Table, win,
} from './parts';

// EP07 · Hidangan dari Langit (QS Al-Ma'idah 112–115) — AUDIRA QISSAH, MANUSCRIPT 2D (illuminated codex, walnut desk, candlelight).
// Audio master clock: all times below are word times from words.json (Cartesia VO 81.64 s). Outro card 82.0–85.0.
// Adab: Nabi Isa AS is only ever golden light; the Hawariyyun are faceless robed figures; page text is abstract ink strokes.
// Shot plan (each beat a different scale / angle): desk object close-ups (hook, balance, lesson) alternate with
// full-bleed miniature pages (sky, question, doa, festival, answer), a lectern codex, an unrolling scroll and a
// medallion page the camera travels across. The camera never stops.

export const HIDANGAN_SECONDS = 85;
const END = 82.0;
const DISPLAY: Record<string, string> = {'Qissah.': 'QISSAH.', AUDIRA: 'AUDIRA', 'Al-Maidah,': "Al-Ma'idah,", alam: "a'lam."};
const WORDS = (rawWords as {text: string; start: number; end: number}[]).map((w, i) => ({i, word: DISPLAY[w.text] ?? w.text, start: w.start, end: w.end}));
const PAGES = buildPages(WORDS, 4, 24, 0.45);

// scene windows [in, out] (s); neighbours overlap 0.5 s for the cross-dissolve (unchanged from the VO lock)
const S = {
  hook: [0, 13.75], book: [13.5, 21.0], hawari: [20.75, 23.95], dialog: [23.7, 39.6], four: [39.35, 48.6],
  doa: [48.35, 60.95], answer: [60.7, 70.2], ulama: [69.95, 74.75], lesson: [74.5, END + 0.4],
} as const;
type Win = readonly [number, number];
const vis = (t: number, w: Win) => t >= w[0] && t < w[1];
const alpha = (t: number, w: Win) => (w[0] === 0 ? 1 - eio(t, w[1] - 0.5, w[1]) : win(t, w[0], w[1], 0.5));

const Cam: React.FC<{s: number; x?: number; y?: number; r?: number; shake?: number; children: React.ReactNode}> = ({s, x = 0, y = 0, r = 0, shake = 0, children}) => (
  <g transform={`translate(${540 + x + shake} ${960 + y}) rotate(${r}) scale(${s}) translate(-540 -960)`}>{children}</g>
);
const Layer: React.FC<{op?: number; children: React.ReactNode}> = ({op = 1, children}) =>
  op <= 0.001 ? null : <AbsoluteFill style={{opacity: op}}><Svg><Defs />{children}</Svg></AbsoluteFill>;
const Room: React.FC = () => <rect x={-400} y={-400} width={1880} height={2720} fill="url(#wallGrad)" />;
/** rubric heading written on a page */
const Rubric: React.FC<{x: number; y: number; size?: number; children: React.ReactNode; anchor?: 'start' | 'middle'; color?: string}> = ({x, y, size = 48, children, anchor = 'middle', color = K.rubric}) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily="Hid Head" fontWeight={800} fontSize={size} fill={color} stroke={K.ink} strokeWidth={2.5} paintOrder="stroke" letterSpacing={3}>{children}</text>
);

// ================================================================ S1 HOOK
// A 0–5: low close-up on the desk — a brass cloche by candlelight; the lid lifts and gold light spills out.
// B 5–13.7: an illuminated page fills the frame — gold sky, the table comes down on gold cords over a domed town.
const Hook: React.FC<{t: number}> = ({t}) => {
  const bB = eio(t, 4.6, 5.3);
  const lift = lerp(0, 70, eo(t, 1.3, 3.0));
  const ty = lerp(-300, 900, eio(t, 5.0, 8.8));
  return (
    <>
      <Layer>
        <Cam s={lerp(1.0, 1.16, eio(t, 0, 5.3))} y={lerp(0, 70, eio(t, 0, 5.3))} r={lerp(0, -2.5, eio(t, 0, 5.3))}>
          <Room />
          <Shelves y0={40} rows={2} op={0.5} />
          <Desk y0={1060} seed={1} />
          <Candle x={880} y={1150} s={1.0} t={t} h={380} />
          <Cloche x={470} y={1200} s={1.45} t={t} lift={lift} glow={eo(t, 1.3, 3.2)} />
          {Array.from({length: 12}, (_, i) => {
            const life = (t * 0.45 + i / 12) % 1;
            return <path key={i} d="M0 -12 L4 -4 L12 0 L4 4 L0 12 L-4 4 L-12 0 L-4 -4 Z" fill="url(#gold)" opacity={(1 - life) * eo(t, 1.6, 2.4)}
              transform={`translate(${470 + Math.sin(i * 2.1) * (80 + life * 240)} ${1060 - life * 520}) scale(${1 + (i % 3) * 0.5})`} />;
          })}
          <Seal x={150} y={1470} s={0.95} rot={-14} />
          <Motes t={t} x={600} y={800} />
          <Finish x={820} y={760} />
        </Cam>
      </Layer>
      <Layer op={bB}>
        <Cam s={lerp(1.3, 1.0, eio(t, 4.8, 13.5))} y={lerp(-120, 0, eio(t, 4.8, 13))} r={lerp(-3, 1.5, eio(t, 4.8, 13.5))}>
          <Room />
          <Desk y0={-400} seed={2} />
          <Page id="hk" x={40} y={110} w={1000} h={1560} rot={-1.5}>
            <MiniSky id="skyHook" top="#5A3214" low="#E5B163" x={40} y={110} w={1000} h={1560} />
            <g opacity={eo(t, 5.0, 6.6)}>
              {Array.from({length: 22}, (_, i) => {
                const a = (i / 22) * Math.PI * 2 + t * 0.05;
                return <path key={i} d={`M540 380 L${540 + Math.cos(a) * 1200} ${380 + Math.sin(a) * 1200} L${540 + Math.cos(a + 0.07) * 1200} ${380 + Math.sin(a + 0.07) * 1200} Z`} fill="#FFE7A6" opacity={0.18} />;
              })}
              <circle cx={540} cy={380} r={180} fill="url(#glow)" style={{mixBlendMode: 'screen'}} />
            </g>
            <Cloud x={lerp(260, 150, eo(t, 5, 9))} y={470} s={1.0} />
            <Cloud x={lerp(830, 930, eo(t, 5, 9))} y={330} s={0.85} />
            <Cloud x={lerp(760, 880, eo(t, 5, 9))} y={700} s={0.7} />
            <Hill y={1160} fill={K.ochre} amp={50} ph={0.4} />
            {[0, 1, 2, 3, 4].map((i) => <House key={i} x={560 + i * 92} y={1200} w={78} h={70 + (i % 2) * 50} fill={[K.parchDk, K.cream, '#D9B78A', K.parch, '#C9A878'][i]} dome={i % 2 === 1} />)}
            <Hill y={1280} fill={K.olive} amp={55} ph={2.0} />
            <Hill y={1440} fill={shade(K.olive, -0.3)} amp={40} ph={3.1} />
            <Table x={540} y={ty} s={0.95} t={t} glow={0.75} strings={1} rot={Math.sin(t * 1.7) * 7 * (1 - eio(t, 7.6, 9.2))} />
            {/* illuminated cartouche: the channel name lives on the page */}
            <g opacity={eo(t, 9.3, 10.1)} transform={`translate(270 ${1370 + (1 - eo(t, 9.3, 10.1)) * 40})`}>
              <path d="M-190 -64 L190 -64 Q 220 0 190 64 L-190 64 Q -220 0 -190 -64 Z" fill={K.oxblood} stroke="url(#gold)" strokeWidth={8} filter="url(#dss)" />
              <text y={4} textAnchor="middle" fontFamily="Hid Head" fontWeight={800} fontSize={54} fill="url(#gold)" stroke={K.ink} strokeWidth={1.5}>AUDIRA</text>
              <text y={44} textAnchor="middle" fontFamily="Hid Head" fontWeight={700} fontSize={26} letterSpacing={8} fill={K.goldLt}>QISSAH</text>
            </g>
          </Page>
          <Finish x={540} y={420} dark={0.4} />
        </Cam>
      </Layer>
      <Card q={pop(t, 0.35, 0.6) * (1 - eio(t, 4.6, 5.0))} top={200} width={900}>
        <Kicker>KISAH DALAM AL-QUR'AN</Kicker>
        <Gold size={96}>HIDANGAN<br />DARI LANGIT</Gold>
      </Card>
      <Card q={pop(t, 5.6) * (1 - eio(t, 12.9, 13.4))} top={200} width={880} tone="parch" rot={-1}>
        <Kicker color={K.rubric}>SURAH KE-5</Kicker>
        <Big size={50}>QS AL-MA'IDAH · 112–115</Big>
      </Card>
    </>
  );
};

// ================================================================ S2 LECTERN CODEX (surah ke-5)
// Starts tight on the gilded "5", pulls back to the whole spread, then glides down to the ayat ribbons.
const BookScene: React.FC<{t: number}> = ({t}) => {
  const ayat = Math.round(lerp(112, 115, eio(t, 17.0, 19.6)));
  const pull = eio(t, 13.6, 16.2);
  const down = eio(t, 16.6, 19.8);
  const gild = eo(t, 13.8, 14.8);
  return (
    <Layer>
      <Cam s={lerp(1.75, 1.0, pull) + down * 0.12} x={lerp(320, 0, pull)} y={lerp(260, 0, pull) - down * 220} r={lerp(-4, -1, pull)}>
        <Room />
        <Shelves y0={-60} rows={3} op={0.8} />
        {/* lectern */}
        <path d="M120 1640 L960 1640 L1010 1700 L70 1700 Z" fill={K.walnutDk} stroke={K.ink} strokeWidth={4} />
        <path d="M470 1700 L610 1700 L640 2200 L440 2200 Z" fill={K.walnut} stroke={K.ink} strokeWidth={4} />
        <path d="M60 640 L1020 640 L1060 1650 L20 1650 Z" fill={K.oxblood} stroke={K.ink} strokeWidth={5} filter="url(#ds)" />
        {/* open codex: left page = gilded initial, right page = surah name */}
        <Page id="bkL" x={80} y={600} w={470} h={1000} inset={40} rot={1} border={false}>
          <g transform={`translate(${130} ${660})`}>
            <rect width={220} height={240} fill={K.rubric} stroke={K.ink} strokeWidth={4} />
            <rect x={12} y={12} width={196} height={216} fill="none" stroke="url(#gold)" strokeWidth={6} />
            <path d="M20 20 q 40 60 0 120 M200 220 q -40 -60 0 -120" stroke={K.goldLt} strokeWidth={4} fill="none" opacity={0.7} />
            <text x={110} y={196} textAnchor="middle" fontFamily="Hid Head" fontWeight={800} fontSize={210} fill="url(#gold)" stroke={K.ink} strokeWidth={4} opacity={0.35 + 0.65 * gild}>5</text>
          </g>
          <rect x={130 + 220 * gild} y={660} width={30} height={240} fill="#FFF6D0" opacity={0.6 * (1 - gild)} style={{mixBlendMode: 'screen'}} />
          <InkLines x={370} y={700} w={140} rows={6} gap={36} seed={3} />
          <InkLines x={130} y={960} w={380} rows={14} gap={36} seed={5} />
        </Page>
        <Page id="bkR" x={530} y={600} w={470} h={1000} inset={40} rot={-1} border={false}>
          <Rubric x={765} y={730} size={62}>AL-MA'IDAH</Rubric>
          <text x={765} y={800} textAnchor="middle" fontFamily="Hid Text" fontStyle="italic" fontWeight={700} fontSize={50} fill={K.ink} opacity={eo(t, 15.2, 15.7)}>= "hidangan"</text>
          <path d="M600 830 L930 830" stroke="url(#gold)" strokeWidth={6} />
          <InkLines x={590} y={880} w={350} rows={10} gap={36} seed={8} q={eo(t, 14.5, 18)} />
          <g transform="translate(765 1330)">
            <Table x={0} y={0} s={0.5} t={t} glow={0.4} />
          </g>
          <text x={765} y={1500} textAnchor="middle" fontFamily="Hid Head" fontWeight={800} fontSize={46} fill={K.ink} opacity={eo(t, 16.7, 17.1)}>AYAT 112 → <tspan fill={K.rubric}>{ayat}</tspan></text>
        </Page>
        <path d="M540 610 L540 1600" stroke={K.goldDk} strokeWidth={6} opacity={0.6} />
        {/* ayat ribbons hanging from the spine */}
        {[112, 113, 114, 115].map((n, i) => {
          const q = pop(t, 16.7 + i * 0.25);
          const on = ayat === n && t > 16.7;
          const x = 380 + i * 110;
          const len = 260 + i * 30 + (on ? 40 : 0) * q;
          return (
            <g key={n} opacity={q}>
              <path d={`M${x} 1600 L${x} ${1600 + len} L${x + 40} ${1580 + len} L${x + 80} ${1600 + len} L${x + 80} 1600 Z`} fill={on ? 'url(#gold)' : K.rubric} stroke={K.ink} strokeWidth={3} filter="url(#dss)" />
              <text x={x + 40} y={1600 + len - 50} textAnchor="middle" fontFamily="Hid Head" fontWeight={800} fontSize={40} fill={on ? K.ink : K.cream} transform={`rotate(-90 ${x + 40} ${1600 + len - 64})`}>{n}</text>
            </g>
          );
        })}
        <Finish x={260} y={560} />
      </Cam>
      {/* FG candle, out of focus, parallax */}
      <g transform={`translate(${lerp(-60, 40, eio(t, 13.5, 21))} 0)`}>
        <Candle x={40} y={2050} s={1.7} t={t} h={420} blur />
      </g>
    </Layer>
  );
};

// ================================================================ S2b HAWARIYYUN — a long scroll unrolls across the desk
const ROBES = [K.oxblood, K.olive, K.umber, K.ochre, K.rubric, '#7A5A2A'];
const Hawari: React.FC<{t: number}> = ({t}) => {
  const un = eio(t, 20.8, 21.9);
  const sx = lerp(60, 1020, un);
  return (
    <>
      <Layer>
        <Cam s={1.08} x={lerp(110, -110, eio(t, 20.75, 23.95))} r={-7}>
          <Room />
          <Desk y0={-500} seed={3} />
          <Candle x={900} y={520} s={0.7} t={t} h={260} />
          <clipPath id="scrollClip"><rect x={60} y={560} width={Math.max(1, sx - 60)} height={760} /></clipPath>
          <g clipPath="url(#scrollClip)">
            <Page id="sc" x={40} y={600} w={1000} h={680} inset={34} border={false}>
              <MiniSky id="skyHaw" top="#E8C483" low="#F3DDA8" x={40} y={600} w={1000} h={680} />
              <circle cx={820} cy={800} r={80} fill="url(#gold)" stroke={K.goldDk} strokeWidth={3} />
              <Hill y={1090} fill={K.ochre} amp={30} ph={1} />
              {Array.from({length: 12}, (_, i) => {
                const q = eo(t, 21.0 + i * 0.1, 21.6 + i * 0.1);
                const x = 110 + i * 76, y = 1170 + (i % 2) * 22;
                return <g key={i} opacity={q}><Robed x={x + (1 - q) * 40} y={y} s={0.5} t={t} seed={i} fill={ROBES[i % ROBES.length]} /></g>;
              })}
              <Hill y={1190} fill={K.olive} amp={14} ph={0.3} />
              <Rubric x={170} y={700} size={60} anchor="start">HAWARIYYUN</Rubric>
              <text x={170} y={756} fontFamily="Hid Text" fontStyle="italic" fontWeight={700} fontSize={42} fill={K.ink}>dua belas murid setia</text>
            </Page>
          </g>
          {/* the two rolled ends */}
          {[60, sx].map((x, i) => (
            <g key={i} filter="url(#ds)">
              <rect x={x - 34} y={570} width={68} height={740} rx={30} fill={K.parchDk} stroke={K.ink} strokeWidth={4} />
              <rect x={x - 14} y={570} width={18} height={740} fill={K.parchLt} opacity={0.6} />
              <rect x={x - 22} y={540} width={44} height={40} rx={8} fill="url(#brass)" stroke={K.ink} strokeWidth={3} />
              <rect x={x - 22} y={1300} width={44} height={40} rx={8} fill="url(#brass)" stroke={K.ink} strokeWidth={3} />
            </g>
          ))}
          <Motes t={t} x={600} y={800} />
          <Finish x={860} y={500} />
        </Cam>
      </Layer>
      <Card q={pop(t, 21.3)} top={210} width={840}>
        <Kicker>MURID SETIA</Kicker>
        <Gold size={70}>NABI ISA AS</Gold>
      </Card>
    </>
  );
};

// ================================================================ S3 DIALOG
const Dialog: React.FC<{t: number}> = ({t}) => {
  const aB = win(t, 29.4, 35.45, 0.45);
  const aC = eo(t, 35.0, 35.5);
  const tilt = lerp(-0.6, 0.85, eio(t, 37.2, 38.7)) + Math.sin(t * 3) * 0.04;
  const qDraw = eio(t, 25.4, 26.6);
  return (
    <>
      {/* A · the question: tight on a miniature — followers look up at the light; a quill writes a gold "?" in the margin */}
      <Layer>
        <Cam s={lerp(1.06, 1.18, eio(t, 23.7, 29.6))} x={lerp(60, -40, eio(t, 23.7, 29.6))} r={lerp(2, 0, eio(t, 23.7, 29.6))}>
          <Room />
          <Page id="dq" x={-60} y={60} w={1200} h={1800} rot={0}>
            <MiniSky id="skyDlg" top="#4A2812" low="#D9A05A" x={-60} y={60} w={1200} h={1800} />
            {Array.from({length: 8}, (_, i) => <House key={i} x={-40 + i * 150 + rnd(i) * 20} y={1180} w={118} h={150 + rnd(i + 4) * 180} fill={[K.parchDk, '#D9B78A', K.cream, '#C9A878'][i % 4]} dome={i % 3 === 1} />)}
            <Hill y={1180} fill="#A8743A" amp={20} ph={0.6} />
            <Light x={820} y={780} s={0.8} t={t} op={eo(t, 23.8, 24.8)} />
            {[0, 1, 2, 3, 4].map((i) => <Robed key={i} x={120 + i * 115} y={1560 + (i % 2) * 36} s={1.0 - (i % 2) * 0.08} t={t} seed={i + 20} fill={ROBES[i]} up={0.8} bow={-0.35} />)}
            {/* gold question mark drawn by the quill */}
            <text x={330} y={1010} textAnchor="middle" fontFamily="Hid Head" fontWeight={800} fontSize={300} fill="url(#gold)" stroke={K.ink} strokeWidth={5}
              strokeDasharray={1400} strokeDashoffset={1400 * (1 - qDraw)} fillOpacity={eo(t, 26.2, 26.8)}>?</text>
          </Page>
          <Finish x={820} y={760} />
        </Cam>
        <g transform={`translate(${lerp(140, 0, qDraw)} ${lerp(80, 0, qDraw)})`} opacity={eo(t, 24.6, 25.2)}>
          <Quill x={380 + Math.sin(t * 8) * 10 * (qDraw < 1 ? 1 : 0)} y={1000} s={1.05} rot={8} />
        </g>
      </Layer>
      {/* B · the answer: an illuminated frontispiece — the light inside a gold horseshoe arch, followers bow at its foot */}
      <Layer op={aB}>
        <Cam s={lerp(1.22, 1.0, eio(t, 29.4, 35.4))} y={lerp(180, -30, eio(t, 29.4, 35.4))}>
          <Room />
          <Page id="fr" x={30} y={60} w={1020} h={1800} fill={K.oxblood}>
            <rect x={30} y={60} width={1020} height={1800} fill={K.oxblood} />
            {Array.from({length: 60}, (_, i) => <circle key={i} cx={90 + (i % 10) * 100 + (Math.floor(i / 10) % 2) * 50} cy={130 + Math.floor(i / 10) * 300} r={10} fill="url(#gold)" opacity={0.35} />)}
            <path d="M180 1500 L180 760 Q 180 420 540 400 Q 900 420 900 760 L900 1500 Z" fill="url(#gold)" stroke={K.ink} strokeWidth={6} />
            <path d="M230 1500 L230 770 Q 230 470 540 452 Q 850 470 850 770 L850 1500 Z" fill="#3A140C" stroke={K.ink} strokeWidth={4} />
            <Light x={540} y={880} s={1.15} t={t} />
            <path d="M120 1500 L960 1500 L960 1560 L120 1560 Z" fill="url(#gold)" stroke={K.ink} strokeWidth={4} />
            {[0, 1, 2, 3].map((i) => <Robed key={i} x={[150, 300, 780, 930][i]} y={1560} s={0.95} t={t} seed={i + 40} fill={ROBES[i + 1]} bow={i < 2 ? 0.7 : -0.7} />)}
          </Page>
          <Finish x={540} y={880} dark={0.45} />
        </Cam>
      </Layer>
      {/* C · Ibnu Katsir: a brass balance on the desk — the asked-for dish on one pan, the weight of the trial on the other */}
      <Layer op={aC}>
        <Cam s={lerp(1.0, 1.1, eio(t, 35.0, 39.6))} x={lerp(40, -40, eio(t, 35.0, 39.6))} r={lerp(-1, 1.5, eio(t, 35.0, 39.6))}>
          <Room />
          <Shelves y0={0} rows={2} op={0.45} />
          <Desk y0={1250} seed={4} />
          <Candle x={850} y={1290} s={0.85} t={t} h={330} />
          {/* closed tafsir volume, spine label */}
          <g filter="url(#ds)">
            <rect x={-40} y={1100} width={330} height={170} fill={K.olive} stroke={K.ink} strokeWidth={4} />
            <rect x={-40} y={1120} width={330} height={10} fill="url(#gold)" /><rect x={-40} y={1240} width={330} height={10} fill="url(#gold)" />
            <text x={130} y={1203} textAnchor="middle" fontFamily="Hid Head" fontWeight={800} fontSize={40} fill="url(#gold)" stroke={K.ink} strokeWidth={1}>IBNU KATSIR</text>
          </g>
          <Balance x={540} y={1290} s={1.05} tilt={tilt}
            left={<g transform="translate(0 -4) scale(0.36)"><Cloche x={0} y={0} s={1} t={t} glow={0.4} /></g>}
            right={<g filter="url(#dss)"><path d="M-90 -6 L90 -6 L66 -150 L-66 -150 Z" fill="#2A170C" stroke={K.gold} strokeWidth={3} /><rect x={-24} y={-184} width={48} height={40} rx={12} fill="#2A170C" stroke={K.gold} strokeWidth={3} />
              <text y={-58} textAnchor="middle" fontFamily="Hid Head" fontWeight={800} fontSize={40} fill="url(#gold)">UJIAN</text></g>} />
          <Motes t={t} x={700} y={900} />
          <Finish x={820} y={850} />
        </Cam>
      </Layer>
      <Card q={win(t, 25.95, 29.55, 0.35)} top={210} width={920} tone="parch">
        <Kicker color={K.rubric}>HAWARIYYUN BERTANYA · QS 5:112</Kicker>
        <Quote size={66}>"Sanggupkah Tuhanmu menurunkan hidangan dari langit kepada kami?"</Quote>
      </Card>
      <Card q={win(t, 29.65, 35.2, 0.35)} top={200} width={900}>
        <Kicker>JAWABAN NABI ISA AS</Kicker>
        <Gold size={74}>BERTAKWALAH<br />KEPADA ALLAH</Gold>
        <div style={{fontFamily: 'Hid Text', fontStyle: 'italic', fontWeight: 700, fontSize: 48, marginTop: 10, opacity: eo(t, 32.9, 33.4)}}>jika kalian benar-benar beriman</div>
      </Card>
      <Card q={win(t, 35.25, 39.7, 0.35)} top={200} width={880} tone="parch" rot={-1}>
        <Kicker color={K.rubric}>TAFSIR IBNU KATSIR</Kicker>
        <div style={{fontFamily: 'Hid Text', fontWeight: 700, fontSize: 52, lineHeight: 1.1}}>Beliau khawatir permintaan itu</div>
        <Big size={74} color={K.rubric}>MENJADI UJIAN</Big>
      </Card>
    </>
  );
};

// ================================================================ S4 FOUR REASONS — a medallion page; the camera travels to each roundel
const REASONS = [
  {at: 41.55, label: 'INGIN MEMAKANNYA', Icon: IconBread, c: K.olive, r: -3},
  {at: 42.6, label: 'HATI TENTERAM', Icon: IconHeart, c: K.rubric, r: 3},
  {at: 44.13, label: 'YAKIN ISA BENAR', Icon: IconCheck, c: K.umber, r: -4},
  {at: 46.53, label: 'MENJADI SAKSI', Icon: IconEye, c: K.oxblood, r: 9},
];
const POS = [[300, 640], [780, 760], [300, 1220], [780, 1340]];
const Four: React.FC<{t: number}> = ({t}) => {
  let fx = 540, fy = 990, rr = 0, zs = 1.0;
  REASONS.forEach((r, i) => {
    const k = eio(t, r.at - 0.15, r.at + 0.65);
    fx = lerp(fx, POS[i][0], k);
    fy = lerp(fy, POS[i][1] + (i === 3 ? 140 : 0), k);
    rr = lerp(rr, r.r, k);
    zs = lerp(zs, i === 3 ? 1.6 : 1.3, k);
  });
  return (
    <>
      <Layer>
        <Cam s={zs} x={-zs * (fx - 540)} y={-80 - zs * (fy - 960)} r={rr}>
          <Room />
          <Desk y0={-500} seed={5} />
          <Page id="fo" x={0} y={160} w={1080} h={1600} rot={0}>
            <rect x={0} y={160} width={1080} height={1600} fill="url(#parch)" />
            <path d="M300 640 C 520 640 560 760 780 760 M780 760 C 520 900 500 1100 300 1220 M300 1220 C 520 1220 560 1340 780 1340" stroke="url(#gold)" strokeWidth={8} fill="none" opacity={0.75} />
            <Rubric x={540} y={300} size={56}>EMPAT ALASAN · QS 5:113</Rubric>
            {REASONS.map((r, i) => {
              const q = pop(t, r.at, 0.5);
              const base = eo(t, 39.8 + i * 0.15, 40.4 + i * 0.15);
              // smooth emphasis hand-off between medallions (no 1-frame dim snap)
              const nx = REASONS[i + 1];
              const em = eio(t, r.at - 0.15, r.at + 0.35) * (nx ? 1 - eio(t, nx.at - 0.15, nx.at + 0.35) : 1);
              const dim = lerp(1, 0.3 + 0.7 * em, eio(t, REASONS[0].at - 0.15, REASONS[0].at + 0.35));
              return (
                <g key={i} opacity={base * dim}>
                  <Medallion x={POS[i][0]} y={POS[i][1]} s={0.92} field={r.c} label={r.label} n={i + 1} q={q} on={em > 0.01} g={em}><r.Icon /></Medallion>
                </g>
              );
            })}
          </Page>
          <Finish x={fx} y={fy - 200} dark={0.6} />
        </Cam>
        <g transform={`translate(${-(fx - 540) * 0.35} ${-(fy - 990) * 0.25})`}>
          <Candle x={1040} y={2150} s={1.6} t={t} h={480} blur />
        </g>
      </Layer>
      <Card q={pop(t, 39.75) * (1 - eio(t, 41.3, 41.7))} top={200} width={700}>
        <Kicker>QS 5:113</Kicker>
        <Gold size={86}>4 ALASAN</Gold>
      </Card>
    </>
  );
};

// ================================================================ S5 DOA
// A 48.4–53.7: night miniature — gold stars, the light over a hill, followers kneel, sparks of prayer rise.
// B 53.5–61: "hari raya bagi kami dan generasi sesudah kami" — a festival page: generations around the table, bunting, lamps.
const DOA = [
  {at: 53.7, text: 'HARI RAYA', sub: 'bagi kami & generasi sesudah kami'},
  {at: 57.03, text: 'TANDA KEKUASAAN-MU', sub: ''},
  {at: 58.95, text: 'PEMBERI REZEKI TERBAIK', sub: ''},
];
const CROWD = [
  {x: 110, s: 0.78}, {x: 200, s: 0.45}, {x: 270, s: 0.64}, {x: 345, s: 0.4}, {x: 735, s: 0.42}, {x: 805, s: 0.68}, {x: 885, s: 0.47}, {x: 970, s: 0.8},
];
const Doa: React.FC<{t: number}> = ({t}) => {
  const bB = eio(t, 53.3, 53.9);
  const di = DOA.reduce((a, d, i) => (t >= d.at ? i : a), 0);
  return (
    <>
      <Layer>
        <Cam s={lerp(1.12, 1.0, eio(t, 48.4, 53.8))} y={lerp(120, 0, eio(t, 48.4, 53.8))} r={lerp(2, -1, eio(t, 48.4, 53.8))}>
          <Room />
          <Page id="dn" x={-40} y={40} w={1160} h={1840}>
            <MiniSky id="skyDoa" top="#1E1006" low="#5A3416" x={-40} y={40} w={1160} h={1840} />
            {[[130, 300, 26], [320, 520, 20], [760, 260, 30], [930, 520, 22], [560, 180, 18], [460, 700, 16], [880, 820, 14], [200, 760, 14]].map(([x, y, r], i) => <Star key={i} x={x} y={y} r={r} t={t} />)}
            <Crescent x={230} y={420} r={66} />
            <Hill y={1130} fill="#4A2E14" amp={40} ph={1.5} />
            <path d="M-200 1380 Q 540 1110 1280 1380 L1280 2300 L-200 2300 Z" fill="#6B4423" stroke={K.ink} strokeWidth={4} />
            {Array.from({length: 18}, (_, i) => {
              const life = (t * 0.35 + i / 18) % 1;
              return <circle key={i} cx={540 + Math.sin(i * 2.3 + t) * (40 + life * 140)} cy={1080 - life * 760} r={4 + (i % 3) * 2} fill={K.goldLt} opacity={(1 - life) * eo(t, 49.7, 51)} />;
            })}
            <Light x={540} y={1060} s={0.72} t={t} />
            {[[190, 1520], [330, 1560], [750, 1560], [890, 1520]].map(([x, y], i) => <Robed key={i} x={x} y={y} s={0.82} t={t} seed={i + 60} fill={ROBES[i + 2]} kneel bow={x < 540 ? 0.5 : -0.5} />)}
          </Page>
          <Finish x={540} y={1000} dark={0.5} />
        </Cam>
      </Layer>
      <Layer op={bB}>
        <Cam s={lerp(1.14, 1.0, eio(t, 53.5, 60.9))} x={lerp(-40, 30, eio(t, 53.5, 60.9))} r={lerp(-2, 1, eio(t, 53.5, 60.9))}>
          <Room />
          <Page id="fe" x={-40} y={40} w={1160} h={1840}>
            <MiniSky id="skyFest" top="#C9853A" low="#F3D79A" x={-40} y={40} w={1160} h={1840} />
            <g opacity={0.6 + 0.35 * eo(t, 57.0, 58.0)}>
              {Array.from({length: 24}, (_, i) => {
                const a = (i / 24) * Math.PI * 2 + t * 0.04;
                return <path key={i} d={`M540 1000 L${540 + Math.cos(a) * 1400} ${1000 + Math.sin(a) * 1400} L${540 + Math.cos(a + 0.08) * 1400} ${1000 + Math.sin(a + 0.08) * 1400} Z`} fill="#FFF0C0" opacity={0.2} />;
              })}
            </g>
            {/* pavilion arches */}
            {[-1, 1].map((sd) => <path key={sd} d={`M${540 + sd * 260} 1240 L${540 + sd * 260} 760 Q ${540 + sd * 260} 620 ${540 + sd * 400} 610 Q ${540 + sd * 540} 620 ${540 + sd * 540} 760 L${540 + sd * 540} 1240 Z`} fill={K.oxblood} stroke="url(#gold)" strokeWidth={10} />)}
            <Bunting x0={-60} x1={1140} y={700} sag={70} t={t} />
            <Lantern x={200} y={880} s={0.95} t={t} />
            <Lantern x={880} y={880} s={0.95} t={t} />
            <Hill y={1240} fill={K.olive} amp={12} ph={0.8} />
            <ellipse cx={540} cy={1250} rx={520} ry={200} fill="url(#glow)" opacity={0.5} style={{mixBlendMode: 'screen'}} />
            {CROWD.slice(0, 4).map((c, i) => <Robed key={i} x={c.x} y={1330} s={c.s} t={t} seed={i + 70} fill={ROBES[i]} />)}
            <Table x={540} y={1170} s={0.85} t={t} glow={0.6} food={eo(t, 58.9, 59.6)} />
            {CROWD.slice(4).map((c, i) => <Robed key={i} x={c.x} y={1330} s={c.s} t={t} seed={i + 80} fill={ROBES[(i + 3) % ROBES.length]} />)}
          </Page>
          <Finish x={540} y={1000} dark={0.4} />
        </Cam>
      </Layer>
      <Card q={pop(t, 48.6) * (1 - eio(t, 53.2, 53.6))} top={210} width={880}>
        <Kicker>DOA NABI ISA AS · QS 5:114</Kicker>
        <Quote size={58}>"Ya Tuhan kami, turunkanlah hidangan dari langit..."</Quote>
      </Card>
      {/* one card at a time: the newest line replaces the last (no stacked cards over the page) */}
      {DOA.map((d, i) => (
        <Card key={i} q={pop(t, d.at) * (i === di ? 1 : 0)} top={200} width={880} tone={i === 0 ? 'dark' : 'parch'} rot={i % 2 ? 1 : -1}>
          {i === 0 ? <Gold size={78}>{d.text}</Gold> : <Big size={i === 2 ? 58 : 62} color={K.rubric}>{d.text}</Big>}
          {d.sub && <div style={{fontFamily: 'Hid Text', fontStyle: 'italic', fontWeight: 700, fontSize: 46, opacity: eo(t, 54.7, 55.2)}}>{d.sub}</div>}
        </Card>
      ))}
    </>
  );
};

// ================================================================ S6 ANSWER + WARNING
// 60.7–63.4: inside the page — clouds part, the table comes down a gold beam, two big followers look up (FG).
// 63.4–70.2: the camera pulls back to the desk: ink floods the page into a storm, the candle gutters, gold lightning.
const Answer: React.FC<{t: number}> = ({t}) => {
  const part = eo(t, 61.0, 62.1);
  const storm = eio(t, 63.4, 65.0);
  const back = eio(t, 63.3, 65.6);
  const sh = t > 65.6 && t < 66.3 ? Math.sin(t * 90) * 10 * (1 - (t - 65.6) / 0.7) : 0;
  const flash = Math.max(0, 1 - Math.abs(t - 62.05) / 0.2);
  const bolt = Math.max(0, 1 - Math.abs(t - 65.75) / 0.25) + Math.max(0, 1 - Math.abs(t - 67.9) / 0.25);
  return (
    <>
      <Layer>
        <Cam s={lerp(1.32, 0.66, back) + 0.04 * eio(t, 65.6, 70)} x={lerp(-40, -70, back)} y={lerp(90, -150, back)} r={lerp(5, -5, back)} shake={sh}>
          <Room />
          <Desk y0={-600} seed={6} />
          <Candle x={1260} y={1500} s={1.3} t={t} h={420} bend={storm * -28} />
          <Page id="an" x={-20} y={40} w={1120} h={1840}>
            <MiniSky id="skyAns" top="#6B3A14" low="#EBC278" x={-20} y={40} w={1120} h={1840} />
            {/* storm ink wash */}
            <rect x={-20} y={40} width={1120} height={1840} fill="#2A0E08" opacity={storm * 0.82} />
            {Array.from({length: 7}, (_, i) => <circle key={i} cx={100 + i * 160} cy={300 + rnd(i) * 300} r={lerp(0, 260 + rnd(i + 3) * 120, storm)} fill="#1A0804" opacity={0.55} />)}
            <circle cx={540} cy={560} r={300} fill="url(#glow)" opacity={part * (1 - storm * 0.8)} style={{mixBlendMode: 'screen'}} />
            {[-1, 1].map((sd) => (
              <g key={sd}>
                {[0, 1, 2].map((i) => <Cloud key={i} x={540 + sd * (170 + i * 150 + part * 300 - storm * 240)} y={300 + i * 160} s={1.15 - i * 0.15} fill={interpolateColors(storm, [0.3, 0.7], [K.goldLt, '#4A2216'])} />)}
              </g>
            ))}
            <path d="M320 40 L760 40 L860 1080 L220 1080 Z" fill="url(#beam)" opacity={part * (1 - storm)} />
            <Table x={540} y={lerp(lerp(-300, 980, eio(t, 61.0, 62.4)), 640, storm)} s={lerp(1.35, 0.45, storm)} t={t} glow={1 - storm * 0.7} strings={1 - storm} rot={storm * -8} />
            <Hill y={1320} fill={interpolateColors(storm, [0.3, 0.7], [K.ochre, '#4A1E12'])} amp={50} ph={0.7} />
            <Hill y={1470} fill={interpolateColors(storm, [0.3, 0.7], [K.olive, '#2E1008'])} amp={50} ph={2.6} />
            {Array.from({length: 26}, (_, i) => {
              const y = ((t * 900 + rnd(i) * 2000) % 2000) - 200;
              return <rect key={i} x={rnd(i + 5) * 1080} y={y} width={5} height={70} rx={3} fill={K.parchDk} opacity={0.5 * storm} transform={`rotate(12 ${rnd(i + 5) * 1080} ${y})`} />;
            })}
            <Bolt x={260} y={340} s={1.1} op={bolt * storm} />
            <Bolt x={830} y={280} s={0.9} op={Math.max(0, 1 - Math.abs(t - 67.9) / 0.25) * storm} />
            <rect x={-20} y={40} width={1120} height={1840} fill="#FFF4D0" opacity={flash * 0.35} />
          </Page>
          <Finish x={lerp(540, 900, back)} y={lerp(560, 900, back)} dark={lerp(0.4, 0.7, back)} />
        </Cam>
      </Layer>
      <Card q={win(t, 61.95, 63.55, 0.25)} top={210} width={900} tone="parch">
        <Kicker color={K.rubric}>ALLAH BERFIRMAN · QS 5:115</Kicker>
        <Big size={72}>"AKU AKAN<br />MENURUNKANNYA"</Big>
      </Card>
      <Card q={win(t, 63.5, 70.3, 0.35)} top={200} width={920} tone="rubric">
        <Kicker color="#F2B7A0">PERINGATAN</Kicker>
        <div style={{fontFamily: 'Hid Text', fontWeight: 700, fontSize: 56, lineHeight: 1.1}}>Siapa yang kafir sesudahnya:</div>
        <Gold size={60}>AZAB YANG TAK PERNAH DITIMPAKAN KEPADA SIAPA PUN</Gold>
      </Card>
    </>
  );
};

// ================================================================ S7 ULAMA — an open codex: two opinions on facing pages, two scholars in FG
const Ulama: React.FC<{t: number}> = ({t}) => {
  const lft = eo(t, 70.3, 70.8), rgt = eo(t, 70.6, 71.1);
  return (
    <>
      <Layer>
        <Cam s={lerp(1.12, 1.0, eio(t, 70, 74.7))} x={lerp(-60, 40, eio(t, 70, 74.7))} r={lerp(-5, -2, eio(t, 70, 74.7))}>
          <Room />
          <Desk y0={-500} seed={7} />
          <path d="M40 470 L1040 470 L1060 1500 L20 1500 Z" fill={K.umber} stroke={K.ink} strokeWidth={5} filter="url(#ds)" />
          <Page id="ul" x={60} y={440} w={490} h={1030} inset={36} rot={1} border={false}>
            <g opacity={lft}>
              <Rubric x={305} y={560} size={58}>TURUN</Rubric>
              <MiniSky id="skyUlL" top="#E5B163" low="#F3DDA8" x={100} y={600} w={410} h={560} />
              <Table x={305} y={940} s={0.55} t={t} glow={0.5} strings={1} />
              <Hill y={1080} fill={K.olive} amp={14} />
              <InkLines x={110} y={1220} w={390} rows={6} gap={34} seed={11} />
            </g>
          </Page>
          <Page id="ur" x={530} y={440} w={490} h={1030} inset={36} rot={-1} border={false}>
            <g opacity={rgt}>
              <Rubric x={775} y={540} size={44}>TIDAK JADI</Rubric>
              <Rubric x={775} y={590} size={44}>TURUN</Rubric>
              <MiniSky id="skyUlR" top="#B8782A" low="#E9CF98" x={570} y={620} w={410} h={540} />
              <path d="M775 1080 Q 760 900 775 720" stroke={K.ink} strokeWidth={4} strokeDasharray="14 12" fill="none" />
              <Table x={775} y={lerp(900, 760, eio(t, 71, 73))} s={lerp(0.45, 0.3, eio(t, 71, 73))} t={t} glow={0.2} />
              <Hill y={1080} fill={K.ochre} amp={14} ph={1} />
              <InkLines x={580} y={1220} w={390} rows={6} gap={34} seed={13} />
            </g>
          </Page>
          <path d="M540 450 L540 1480" stroke={K.goldDk} strokeWidth={6} opacity={0.6} />
          <Candle x={1000} y={420} s={0.6} t={t} h={240} />
          <Finish x={900} y={300} />
        </Cam>
      </Layer>
      <Card q={pop(t, 70.25)} top={200} width={880}>
        <Gold size={66}>ULAMA BERBEDA PENDAPAT</Gold>
      </Card>
      <Card q={pop(t, 73.5)} top={1180} width={560} tone="parch" rot={2}>
        <Quote size={64}>Wallahu a'lam</Quote>
      </Card>
    </>
  );
};

// ================================================================ S8 LESSON — high oblique on the desk: the cloche opened, the food, the AUDIRA seal
const Lesson: React.FC<{t: number}> = ({t}) => (
  <>
    <Layer>
      <Cam s={lerp(1.0, 1.14, eio(t, 74.5, 82))} x={lerp(30, -30, eio(t, 74.5, 82))} r={lerp(-9, -6, eio(t, 74.5, 82))}>
        <Room />
        <Desk y0={-600} seed={8} tone={K.walnutLt} />
        {/* morning light shafts through a window, warm */}
        {[0, 1, 2].map((i) => <path key={i} d={`M${-200 + i * 220} -200 L${40 + i * 220} -200 L${700 + i * 220} 2200 L${420 + i * 220} 2200 Z`} fill="#FFE2A0" opacity={0.1} style={{mixBlendMode: 'screen'}} />)}
        <Page id="ls" x={100} y={160} w={760} h={560} rot={-6} inset={36} border={false}>
          <InkLines x={150} y={240} w={660} rows={13} gap={34} seed={17} />
        </Page>
        <Cloche x={470} y={1120} s={1.35} t={t} food={1} lidAside />
        <Candle x={920} y={760} s={0.8} t={t} h={280} />
        <Seal x={800} y={1400} s={1.25} rot={10} />
        <Motes t={t} x={400} y={900} />
        <Finish x={220} y={300} dark={0.45} />
      </Cam>
    </Layer>
    <Card q={pop(t, 74.6)} top={200} width={900}>
      <Kicker>PELAJARAN</Kicker>
      <Gold size={68}>NIKMAT BESAR</Gold>
      <div style={{opacity: eo(t, 77.1, 77.6), transform: `translateY(${(1 - eo(t, 77.1, 77.6)) * 20}px)`}}>
        <Big size={46} color="#E2B35A">=</Big>
        <Big size={66} color="#F2B7A0">TANGGUNG JAWAB BESAR</Big>
      </div>
    </Card>
  </>
);

const SCENES: [Win, React.FC<{t: number}>][] = [
  [S.hook, Hook], [S.book, BookScene], [S.hawari, Hawari], [S.dialog, Dialog], [S.four, Four],
  [S.doa, Doa], [S.answer, Answer], [S.ulama, Ulama], [S.lesson, Lesson],
];

// ---- captions (karaoke on a dark leather strip with a gold rule, inside the 380 px bottom safe zone)
const Captions: React.FC<{t: number}> = ({t}) => {
  const page = PAGES.find((p) => t >= p.start - 0.08 && t < p.end);
  if (!page || t > END) return null;
  const q = interpolate(t, [page.start - 0.08, page.start + 0.1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top: 1400, left: 60, right: 60, display: 'flex', justifyContent: 'center', opacity: q, transform: `translateY(${(1 - q) * 14}px)`}}>
      <div style={{fontFamily: 'Hid UI', fontWeight: 900, fontSize: 62, lineHeight: 1.16, textAlign: 'center', padding: '14px 34px', borderRadius: 6,
        background: '#1A0E07EE', color: '#F6E7C4', maxWidth: 960, border: '2px solid #D9A94499', boxShadow: '0 16px 30px #000000AA'}}>
        {page.words.map((w, k) => {
          const next = page.words[k + 1];
          const on = t >= w.start && t < (next ? next.start : w.end + 0.25);
          return (
            <span key={w.i} style={{color: on ? '#F7D06A' : undefined, display: 'inline-block', transform: `scale(${on ? 1.04 : 1})`, opacity: t >= w.start - 0.02 ? 1 : 0.55,
              marginRight: k < page.words.length - 1 ? '0.4em' : 0}}>
              {w.word.replace(/[.,;:?]+$/, '')}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const useFonts = () => {
  const [handle] = React.useState(() => delayRender('fonts'));
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const faces = [
      new FontFace('Hid Head', `url(${staticFile('fonts/Cinzel-Var.ttf')})`, {weight: '400 900'}),
      new FontFace('Hid Text', `url(${staticFile('fonts/CormorantGaramond-Var.ttf')})`, {weight: '300 700'}),
      new FontFace('Hid UI', `url(${staticFile('fonts/Nunito-Var.ttf')})`, {weight: '200 1000'}),
    ];
    Promise.all(faces.map((f) => f.load().then((ff) => document.fonts.add(ff))))
      .then(() => { setReady(true); continueRender(handle); })
      .catch(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  return ready;
};

export const Hidangan: React.FC = () => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const ready = useFonts();
  const tt = Math.min(t, END + 0.39);
  return (
    <AbsoluteFill style={{background: K.bg, overflow: 'hidden'}}>
      {ready && (
        <>
          {SCENES.filter(([w]) => vis(tt, w)).map(([w, Scene], i) => (
            <AbsoluteFill key={i} style={{opacity: alpha(tt, w)}}><Scene t={tt} /></AbsoluteFill>
          ))}
          {/* global finish: candle flicker warmth + vellum tooth over every page */}
          <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'soft-light', opacity: 0.55 + 0.06 * Math.sin(t * 9.1) * Math.sin(t * 3.7),
            background: 'radial-gradient(ellipse 75% 55% at 62% 38%, #FFD9A0 0%, #C98A3A 45%, #2A1206 100%)'}} />
          <AbsoluteFill style={{pointerEvents: 'none', backgroundImage: `url(${staticFile('hidangan07/paper.png')})`, backgroundSize: '1080px 1920px', mixBlendMode: 'overlay', opacity: 0.22}} />
          <Captions t={t} />
        </>
      )}
      <AudiraOutro seconds={HIDANGAN_SECONDS - END} channel="AUDIRA QISSAH" handle="@AUDIRAQISSAH" />
      <AudiraSignature seed="hidangan-dari-langit-ep07" handle="@AUDIRAQISSAH" />
    </AbsoluteFill>
  );
};
