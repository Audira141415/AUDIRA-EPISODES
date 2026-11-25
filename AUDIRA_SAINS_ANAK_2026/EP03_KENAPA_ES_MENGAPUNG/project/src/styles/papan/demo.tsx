import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CaptionPage} from '../../components/WordCaptions';
import {camera, roughEllipse, roughLine, useFrame, World} from '../shared';
import {
  Arm, BoardBack, Bulb, Caption, ChalkLine, ChalkText, eio, Eraser, eraserFor, hold, Kid, KID_ARMS, lerpArm, lidAt, Mark, mirrorArm, Mood, PAP, PapanStage,
  pop, popIO, squash, Teacher, teacherLocal, TeacherDesk, Title, Tray, usePapFonts, Wipe, Desk,
} from './kit';
import {
  aimAt, BigHand, BoardScenes, blinkTimes, boardPt, bump, CHECK, ClassroomBack, ClassSvg, CountDisc, DeskTop, handToScreen, InsertPanel, papanInsert,
  KID_LOOKS, Pill, segPoint, SpeechCloud, useClass,
} from './props';
import {HalusLightDiv, useHalus} from '../../lib/halus';

// PAPAN StyleGallery demo (8 s QA sheet, never a delivery) — the look's signature moves in one take: the whole class,
// the board already writing "1 jam = 60 menit" while the batik teacher points; Dodi's hand shoots up with a chalk
// cloud "KENAPA NGGAK 100?" → camera pushes into the board → the felt eraser sweeps three rows and "60 gampang dibagi"
// appears behind it: ÷2 … ÷30 written and circled on the pointer taps, "semua bulat ✓" → back to the class (aha bulb,
// title slam) → a slide-up insert: the counting hand, the thumb walking the finger segments 1…6, "12 RUAS".
// Landscape (Look-PAPAN-Wide) uses CLASS.landscape: a wider room, kids spread left/right, board station with the board
// left of centre and the teacher beside it, the insert hand left with pills on the right. Flat colours only.
// HALUS (v1.16): PapanStage drifts the classroom on top of the camera stations (starts on the push/pull moves), soft
// shadows under teacher/desk/board, idle on teacher + kids, light over the room, the insert zoom-dissolves in; the eraser
// wipe stays the board change; Title + Caption stay still.

const fakePage = (text: string, start: number, end: number): CaptionPage[] => {
  const ws = text.split(' ').map((word, i) => ({i, word, start: start + i * 0.26, end: start + i * 0.26 + 0.22}));
  return [{start, end, words: ws}];
};
const PAGES = [...fakePage('1 jam 60 menit.', 0.1, 1.55), ...fakePage('Kenapa nggak 100?', 1.6, 2.7), ...fakePage('Karena 60', 2.8, 3.5),
  ...fakePage('gampang dibagi.', 3.55, 4.6), ...fakePage('Semua hasilnya bulat!', 4.7, 5.95), ...fakePage('Coba hitung ruas jarimu.', 6.1, 8.0)];

const WIPE: Wipe = {at: 2.72, dur: 0.55};
const PUSH0 = 1.95, PUSH1 = 2.6, PULL0 = 5.15, PULL1 = 5.8;
const INS = 6.0;
const DIVS = [2, 3, 4, 5, 6, 10, 12, 15, 20, 30];
const DIV_T = DIVS.map((_, i) => 3.3 + i * 0.15);
const cell = (i: number) => ({x: 112 + (i % 5) * 184, y: i < 5 ? 590 : 836});

const BoardA: React.FC<{t: number}> = ({t}) => (
  <g>
    <ChalkText id="da1" t={t} x={480} y={250} text="1 jam = 60 menit" size={104} at={-0.25} cps={9.5} />
    <ChalkLine t={t} d={roughEllipse(584, 214, 82, 66, 13, 0.05)} at={1.5} dur={0.3} color={PAP.yellow} w={8} />
    <ChalkText id="da2" t={t} x={480} y={470} text="kenapa nggak" size={66} at={1.0} cps={18} color={PAP.blue} />
    <ChalkText id="da3" t={t} x={480} y={720} text="100 ?" size={210} at={1.65} cps={11} color={PAP.pink} />
    <ChalkLine t={t} d={roughLine([170, 790], [790, 794], 51, 5)} at={2.25} dur={0.25} color={PAP.pink} w={8} />
  </g>
);
const BoardB: React.FC<{t: number}> = ({t}) => (
  <g>
    <ChalkText id="db1" t={t} x={470} y={276} text="60" size={230} at={2.78} cps={8} color={PAP.yellow} />
    <ChalkText id="db2" t={t} x={690} y={270} text="?" size={160} at={3.0} cps={6} color={PAP.pink} />
    <ChalkText id="db3" t={t} x={480} y={398} text="gampang dibagi!" size={66} at={3.05} cps={22} />
    {DIVS.map((n, i) => {
      const c = cell(i);
      return (
        <g key={n}>
          <ChalkText id={`dd${i}`} t={t} x={c.x} y={c.y} text={`÷${n}`} size={92} at={DIV_T[i] - 0.06} cps={16} />
          <ChalkLine t={t} d={roughEllipse(c.x, c.y - 32, 80, 62, 50 + i, 0.05)} at={DIV_T[i] + 0.16} dur={0.24} color={PAP.yellow} w={8} />
          <ChalkText id={`dr${i}`} t={t} x={c.x} y={c.y + 100} text={`${60 / n}`} size={60} at={4.75 + i * 0.05} cps={18} color={PAP.yellow} />
        </g>
      );
    })}
    <ChalkText id="db4" t={t} x={440} y={1060} text="semua bulat" size={86} at={4.9} cps={18} color={PAP.yellow} />
    <ChalkLine t={t} d={CHECK(760, 1022, 1.1)} at={5.5} dur={0.22} color={PAP.yellow} w={11} />
  </g>
);

const AHA = {S: [-128, -170], E: [-236, -250], H: [-262, -420]} as Arm; // "aha!" finger up at shoulder height
const COUNT = [[3, 2], [3, 1], [3, 0], [2, 2], [2, 1], [2, 0]].map(([f, s], k) => ({f, s, at: 6.55 + k * 0.17}));

const HandInsert: React.FC<{t: number; wide: boolean}> = ({t, wide}) => {
  const HA = wide ? {x: 700, y: 1210, s: 1.3} : {x: 540, y: 1560, s: 1.75};
  const bend = [0, 0, 0, 0];
  COUNT.forEach((c) => {
    bend[c.f] = Math.max(bend[c.f], hold(t, c.at - 0.12, c.at + 0.06, 0.08) * 0.8);
  });
  let target: [number, number] = segPoint(COUNT[0].f, COUNT[0].s, 0);
  for (let k = 0; k < COUNT.length; k++) {
    const c = COUNT[k], prev = COUNT[k - 1];
    if (t < c.at + 0.02 || k === COUNT.length - 1) {
      const p1 = segPoint(c.f, c.s, bend[c.f]);
      if (!prev) target = p1;
      else {
        const p0 = segPoint(prev.f, prev.s, bend[prev.f]);
        const q = eio(t, c.at - 0.12, c.at - 0.01);
        target = [p0[0] + (p1[0] - p0[0]) * q, p0[1] + (p1[1] - p0[1]) * q];
      }
      break;
    }
  }
  const tw = eio(t, COUNT[0].at - 0.4, COUNT[0].at - 0.06);
  const hi = COUNT.map((c) => [c.f, c.s, eio(t, c.at, c.at + 0.12)] as [number, number, number]);
  const toS = (p: [number, number]) => handToScreen(p, HA.x, HA.y, HA.s);
  const label = wide ? {x: 1420, y1: 380, y2: 600} : {x: 540, y1: 260, y2: 400};
  return (
    <g>
      <DeskTop />
      <BigHand x={HA.x} y={HA.y} s={HA.s} bend={bend} thumbTarget={target} thumbW={tw} hi={hi} />
      {COUNT.map((c, k) => {
        const [x, y] = toS(segPoint(c.f, c.s, bend[c.f]));
        return <CountDisc key={k} x={x} y={y} n={`${k + 1}`} q={pop(t, c.at, 0.2)} r={wide ? 24 : 32} />;
      })}
      <Pill x={label.x} y={label.y1} text="3 RUAS × 4 JARI" q={popIO(t, 6.3, undefined, 0.3)} size={wide ? 58 : 60} bg={PAP.paper} />
      <Pill x={label.x} y={label.y2} text="12 RUAS" q={pop(t, 7.45, 0.3)} size={wide ? 110 : 96} />
    </g>
  );
};

export const PapanDemo: React.FC = () => {
  const fr = useFrame();
  const {wide} = fr;
  const t = useCurrentFrame() / useVideoConfig().fps;
  const ready = usePapFonts();
  const L = useClass();
  if (!ready) return <AbsoluteFill style={{background: PAP.wall}} />;

  const WIDE = L.cams.wide, BOARDC = L.cams.board;
  const pose = camera(t, {...WIDE, s: WIDE.s * 0.97}, [
    {from: 0, to: PUSH0, s: WIDE.s},
    {from: PUSH0, to: PUSH1, ...BOARDC},
    {from: PULL0, to: PULL1, ...WIDE},
  ]);
  const er = eraserFor(t, [WIPE]);

  // teacher: points while the board writes, taps each divisor, grins + nods at "bulat"
  const TCH = L.teacher;
  const aims = [
    {a: 0.0, b: 1.55, p: boardPt(L, 560, 240)},
    {a: 1.7, b: 2.4, p: boardPt(L, 470, 690)},
    {a: 2.85, b: 3.2, p: boardPt(L, 470, 220)},
    ...DIVS.map((_, i) => ({a: DIV_T[i] - 0.1, b: (DIV_T[i + 1] ?? DIV_T[i] + 0.6) - 0.12, p: boardPt(L, cell(i).x + 66, cell(i).y + 30)})),
    {a: 4.85, b: 5.6, p: boardPt(L, 840, 1040)},
  ];
  const aim = aimAt(t, aims, boardPt(L, 480, 300));
  const tap = [...DIV_T, 5.5].reduce((s, at) => s + bump(t, at - 0.02, 0.2), 0) * 30;
  const happy = hold(t, 5.45, 99, 0.2);
  const tMood: Mood = happy > 0.5 ? 'grin' : 'smile';

  // kids: Dodi asks (hand up + cloud), everyone looks at the board, aha at the end
  const kids = L.kids.map((k, i) => {
    const lid = lidAt(t, blinkTimes(i * 1.3 + 1));
    let armL = KID_ARMS.rest, armR = mirrorArm(KID_ARMS.rest);
    let mood: Mood = 'smile', eyes: [number, number] = [[0.55, -0.7], [0.15, -0.9], [-0.35, -0.8]][i] as [number, number];
    let brow = 0, tilt = 0, sy = 1, up = 0;
    if (i === 2) {
      const r = hold(t, 0.65, 2.05, 0.2);
      up = r;
      armR = lerpArm(armR, mirrorArm(KID_ARMS.raise), r);
      sy = squash(t, 0.65, 0.08, 0.36)[1];
      if (r > 0.4) {
        mood = 'o';
        eyes = [0.7, -0.6];
        brow = 0.6;
        tilt = -4;
      }
    }
    const aha = hold(t, 5.4 + i * 0.06, 99, 0.2);
    if (aha > 0.01) {
      if (i === 1) armL = lerpArm(armL, AHA, aha);
      if (i === 0) armL = lerpArm(armL, KID_ARMS.cheek, aha);
      if (aha > 0.4) {
        mood = 'grin';
        eyes = [0, -0.5];
        brow = 0.3;
      }
    }
    return {k, look: KID_LOOKS[i], lid, armL, armR, mood, eyes, brow, tilt, sy, handL: i === 1 && aha > 0.5 ? 'one' as const : 'ball' as const, handR: up > 0.5 ? 'open' as const : 'ball' as const};
  });
  const dodi = L.kids[2], budi = L.kids[1];
  const cloud = wide ? {x: 1560, y: 1080, w: 640, h: 340, tail: [-170, 230] as [number, number]} : {x: 330, y: 1470, w: 780, h: 400, tail: [230, 320] as [number, number]};
  const ins = papanInsert(t, INS, 99, 0.4, fr.H);
  const halus = useHalus('PAPAN').full;

  return (
    <AbsoluteFill style={{background: PAP.wall, overflow: 'hidden'}}>
      <PapanStage t={t} starts={[0, PUSH0, PULL0]} end={8}>
      <World pose={pose}>
        <ClassSvg L={L}>
          <ClassroomBack L={L} t={t} />
          <g transform={`translate(${L.boardX} 0)`}>
            <BoardBack />
            <BoardScenes t={t} scenes={[{C: BoardA, w1: WIPE}, {C: BoardB, w0: WIPE}]} wipes={[WIPE]} />
            <Tray />
            <Eraser x={er.x} y={er.y} rot={er.rot} s={er.s} sx={er.sx} sy={er.sy} />
          </g>
          <TeacherDesk x={L.teacherDesk.x} y={L.teacherDesk.y} />
          <Teacher t={t} x={TCH.x} y={TCH.y} s={TCH.s} mood={tMood} lid={lidAt(t, blinkTimes(9))} eyes={aim.w > 0.5 ? [-0.8, -0.4] : [-0.4, 0.35]}
            talk={hold(t, 0.1, 1.5, 0.1) * Math.abs(Math.sin(t * 9))} aim={teacherLocal(aim.p, TCH.x, TCH.y, TCH.s)} aimW={aim.w} tap={tap}
            nod={bump(t, 5.5, 0.34) * 8} brow={happy * 0.4} />
          <SpeechCloud x={cloud.x} y={cloud.y} q={popIO(t, 0.85, 2.15, 0.34)} w={cloud.w} h={cloud.h} tail={cloud.tail} t={t} at={1.0} seed={5}
            lines={[{text: 'KENAPA NGGAK', size: 72}, {text: '100?', size: 140, color: PAP.red}]} />
          {kids.map(({k, look, lid, armL, armR, mood, eyes, brow, tilt, sy, handL, handR}, i) => (
            <g key={i}>
              <Kid t={t} x={k.x} y={k.y} s={k.s} look={look} mood={mood} lid={lid} eyes={eyes} brow={brow} armL={armL} armR={armR} tilt={tilt}
                bobPhase={i * 2.1} sy={sy} handL={handL} handR={handR} />
              <Desk x={k.x} y={k.y} s={k.s} notebook={i === 1} />
            </g>
          ))}
          <Mark x={dodi.x - 230 * dodi.s} y={dodi.y - 560 * dodi.s} q={popIO(t, 0.75, 2.0, 0.3)} ch="?" size={150} rot={-10} />
          <Bulb x={budi.x + 300 * budi.s} y={budi.y - 470 * budi.s} q={pop(t, 5.55, 0.36)} />
        </ClassSvg>
      </World>
      </PapanStage>
      {halus && <HalusLightDiv ink={PAP.ol} strength={0.8} />}
      <InsertPanel {...ins}><HandInsert t={t} wide={wide} /></InsertPanel>
      <Title t={t} y={fr.pick(1000, 556)} size={fr.pick(104, 92)} words={[{text: '60 =', at: 5.5}, {text: 'GAMPANG DIBAGI', at: 5.62, color: PAP.yellow}]} out={INS - 0.1} />
      <Caption t={t} pages={PAGES} />
    </AbsoluteFill>
  );
};
