import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CaptionPage} from '../../components/WordCaptions';
import {lerp, useFrame} from '../shared';
import {Caption, eio, eout, Label, Mood, pop, popIO, QMark, squash, TUB, TubLight, tubScene, useTubFonts} from './kit';
import {
  AlarmBoard, BrainChar, Cam, camAt, Cobek, Courier, Dive, Eater, EaterMouth, FireCard, framed, Guard, Hill, LobeWipe, NerveDoor, NerveSet, NV,
  OilBlob, OutsideSet, Shout, Stamp, Svg, Tempe, TG, toScreen, TongueSet,
} from './props';

// TUBUH StyleGallery demo (7 s QA sheet, never a delivery) — the look's signature moves in one run:
// an outside cartoon eater bites tempe + sambal, the face flushes in hard bands and flat flames pop ("KEBAKAR?!") →
// iris dive into the open mouth → the pink tongue world (papilla hills, teeth on the horizon, a daylight slit) where the
// [TRPV1] guard stands at its nerve door; the capsaicin oil-blob with a FAKE flame hat hops on, the door is forced,
// the guard shouts "PANAS!" → a fleshy LobeWipe up into the brain room: alarm board, panicking brain, courier with the
// fire card stamped PALSU. Square-bracket labels throughout; captions with the red active-word pill.
// Landscape (Look-TUBUH-Wide): same worlds, framed() puts each camera pose mid-frame; the eater sits left of centre
// with the title on the right, the alarm board moves left of the brain. Flat colours only.
// HALUS (v1.16): each set drifts (tubScene) under its screen labels; the Dive hole is mapped through the drift; Dive and
// LobeWipe are kept; TubLight over the scene, Caption on top.

type P2 = [number, number];
const fakePage = (text: string, start: number, end: number): CaptionPage[] => {
  const ws = text.split(' ').map((word, i) => ({i, word, start: start + i * 0.28, end: start + i * 0.28 + 0.24}));
  return [{start, end, words: ws}];
};
const PAGES = [
  ...fakePage('Makan sambal pedes...', 0.1, 1.35), ...fakePage('kok kebakar?!', 1.4, 2.25), ...fakePage('Di lidah ada', 2.35, 3.05),
  ...fakePage('penjaga TRPV1.', 3.1, 3.75), ...fakePage('Kapsaisin nempel...', 3.8, 4.6), ...fakePage('pintunya kebuka!', 4.65, 5.45),
  ...fakePage('Otak panik:', 5.6, 6.2), ...fakePage('ada api!', 6.25, 7.0),
];

// ---- clock (s)
const DIVE: P2 = [1.95, 2.6]; // outside mouth → tongue
const WIPE: P2 = [5.45, 5.95]; // tongue → brain room
const HOP0 = 3.75, STICK = 4.25, OPEN = 4.7;

// ---- outside (same world as the reference episode)
const HEADP: P2 = [460, 700];
const HR = 210;
const MOUTH: P2 = [HEADP[0], HEADP[1] + HR * 0.52];
const COBEK: P2 = [780, 1335];
const RREST: P2 = [390, 470], RDIP: P2 = [400, 545], RMOUTH: P2 = [128, 112], RLOW: P2 = [360, 452], LREST: P2 = [-330, 585];

const track = (t: number, keys: Array<[number, P2]>): P2 => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, p0] = keys[i], [t1, p1] = keys[i + 1];
    if (t < t1) {
      const q = eio(t, t0, t1);
      return [lerp(p0[0], p1[0], q), lerp(p0[1], p1[1], q)];
    }
  }
  return keys[keys.length - 1][1];
};
const arc = (q: number, a: P2, b: P2, hop: number): P2 => [lerp(a[0], b[0], q), lerp(a[1], b[1], q) - Math.sin(q * Math.PI) * hop];

const outCam = (t: number, wide: boolean): Cam =>
  camAt(t, wide ? {x: 660, y: 1040, s: 0.82} : {x: 520, y: 945, s: 1.15}, [{from: 1.55, to: DIVE[0], x: MOUTH[0], y: MOUTH[1], s: 2.2}]);

const outScene = (t: number, fr: {W: number; H: number}) => tubScene(t, {i: 0, from: 0, to: DIVE[0], W: fr.W, H: fr.H});
const Outside: React.FC<{t: number}> = ({t}) => {
  const fr = useFrame();
  const {wide} = fr;
  const cam = framed(outCam(t, wide), fr);
  const hR = track(t, [[0, RREST], [0.25, RREST], [0.5, RDIP], [0.72, RDIP], [0.95, [380, 420]], [1.12, RMOUTH], [1.26, RMOUTH], [1.5, RLOW]]);
  const rotR = lerp(-2, 16, eio(t, 0.25, 0.5)) - 22 * eio(t, 0.72, 1.12);
  const mouth: EaterMouth = t < 1.1 ? 'closed' : t < 1.32 ? 'chew' : t < 1.62 ? 'fire' : 'O';
  const open = mouth === 'O' ? lerp(0.7, 1.3, eout(t, 1.62, DIVE[0])) : 0.8;
  const flush = t < 1.3 ? 0 : t < 1.38 ? 1 : t < 1.46 ? 2 : 3;
  const mood: Mood = t < 1.32 ? 'happy' : 'shock';
  return (
    <Svg>
      <g transform={outScene(t, fr).transform}>
      <OutsideSet t={t} cam={cam} front={(
        <g>
          <Cobek x={COBEK[0]} y={COBEK[1]} dip={eio(t, 0.45, 0.65) * (1 - eio(t, 0.9, 1.3))} />
          <Label x={COBEK[0] + (wide ? 250 : 0)} y={COBEK[1] - (wide ? 160 : 250)} text="[SAMBAL]" size={66} q={popIO(t, 0.15, 1.4)} rot={-4} />
        </g>
      )}>
        <g transform={`translate(${HEADP[0]} ${HEADP[1]})`}>
          <Eater t={t} r={HR} mood={mood} look={t < 0.6 ? [0.3, 0.6] : t < 1.1 ? [0.7, 0.8] : [0, 0]} flush={flush} mouth={mouth} open={open}
            sweat={pop(t, 1.55)} flames={pop(t, 1.4, 0.4)} steam={pop(t, 1.45, 0.5)} handR={hR} handL={LREST}
            itemR={<g transform="translate(-18 0)"><Tempe rot={rotR} bitten={t > 1.2} sauce={eout(t, 0.52, 0.7)} s={0.9} /></g>} />
        </g>
      </OutsideSet>
      </g>
      <Label x={fr.pick(540, 1500)} y={fr.pick(250, 300)} text="KEBAKAR?!" size={fr.pick(130, 120)} q={popIO(t, 1.4, 1.58)} fill={TUB.gold} rot={-3} />
      {wide && <QMark x={1660} y={520} q={popIO(t, 1.45, 1.58)} size={110} rot={12} />}
    </Svg>
  );
};

// ---- tongue
const G = TG.G;
const DOOR = {x: 470, w: 200, h: 290};
const GX = 800, GR = 105, GY = G - GR * 1.07;
const STUCK: P2 = [650, G - 64];
const BLOB0: P2 = [1180, G - 64];
const HILLS: Hill[] = [{x: -950, w: 480, h: 360, tone: 0}, {x: -330, w: 520, h: 430, tone: 1}, {x: 470, w: 620, h: 520}, {x: 1700, w: 560, h: 440}, {x: 2350, w: 480, h: 360, tone: 1}];
const MINI = [{door: -330, guard: -170}, {door: 1700, guard: 1860}];
const tongueCam = (t: number, wide: boolean): Cam => camAt(t, {x: 560, y: 1040, s: 0.72}, [
  {from: 2.55, to: 3.3, x: wide ? 760 : 720, y: 1150, s: wide ? 1.1 : 1.25},
  {from: HOP0, to: STICK, x: wide ? 760 : 700, y: 1160, s: wide ? 1.15 : 1.3},
]);

const Tongue: React.FC<{t: number}> = ({t}) => {
  const fr = useFrame();
  const cam = framed(tongueCam(t, fr.wide), fr);
  const doorOpen = eout(t, OPEN, OPEN + 0.3);
  const rattle = t > STICK + 0.1 && t < OPEN ? Math.sin((t - STICK) * 16) * 3 : 0;
  // guard
  let gMood: Mood = 'happy', look: P2 = [Math.sin(t * 1.3) * 0.6, 0.1], armR = -25, armL = -25, mega = 0, open = 1, rot = 0;
  let [sx, sy] = squash(t, 2.9, 0.14);
  if (t > 2.9 && t < HOP0) { gMood = 'smug'; armR = 80; look = [0, 0]; }
  else if (t >= HOP0 && t < STICK) { gMood = 'happy'; look = [-1, -0.2]; armL = 20; }
  else if (t >= STICK && t < OPEN) { gMood = 'shock'; look = [-0.9, 0.5]; armL = 60; armR = 60; rot = -4 + Math.sin((t - STICK) * 9) * 2.5; }
  else if (t >= OPEN) { gMood = 'shock'; mega = eout(t, OPEN, OPEN + 0.25); open = 1.25 + 0.1 * Math.sin(t * 6); armR = 10; look = [0.3, -0.1]; [sx, sy] = squash(t, OPEN + 0.1, 0.12); }
  // capsaicin blob: walks in from the right, hops onto the door, forces it
  const inQ = eout(t, 3.0, 3.6);
  const hop = eio(t, HOP0, STICK);
  const bp: P2 = hop > 0 ? arc(hop, [BLOB0[0] - 60, BLOB0[1]], STUCK, 300) : [lerp(BLOB0[0] + 500, BLOB0[0], inQ), BLOB0[1] - Math.abs(Math.sin(t * 9)) * 10 * (inQ < 1 ? 1 : 0)];
  const [bsx, bsy] = t > STICK ? squash(t, STICK, 0.22, 0.5) : [1, 1];
  const forcing = t > STICK + 0.15 && t < OPEN + 0.1;
  return (
    <Svg>
      <g transform={tubScene(t, {i: 1, from: DIVE[0], to: WIPE[1], W: fr.W, H: fr.H}).transform}>
      <TongueSet t={t} cam={cam} hills={HILLS}>
        {MINI.map((m, i) => (
          <g key={i}>
            <NerveDoor x={m.door} y={G} w={130} h={190} open={0} />
            <Guard id={`dmg${i}`} t={t} x={m.guard} y={G - 56 * 1.07} r={56} seed={30 + i} mood="happy" look={[i ? -0.5 : 0.5, 0]} />
          </g>
        ))}
        <NerveDoor x={DOOR.x} y={G} w={DOOR.w} h={DOOR.h} open={doorOpen} rattle={rattle} />
        <Guard id="dguard" t={t} x={GX} y={GY} r={GR} seed={3} mood={gMood} look={look} armL={armL} armR={armR} mega={mega} mouthOpen={open} rot={rot} sx={sx} sy={sy} />
        {t > 3.0 && (
          <OilBlob id="dblob" t={t} x={bp[0]} y={bp[1]} r={60} seed={5} mood={t > OPEN ? 'smug' : 'sneaky'} look={forcing ? [-1, -0.4] : [-0.8, 0.2]}
            armL={forcing ? 57 : -20} armLen={forcing ? 1.95 : 0.55} armR={-20} sx={(t > STICK ? 0.86 : 1) * bsx} sy={(t > STICK ? 1.06 : 1) * bsy}
            rot={hop > 0 && hop < 1 ? -Math.sin(hop * Math.PI) * 25 : 0} hat={pop(t, 3.15)} ground={G} />
        )}
        <Shout x={GX + 150} y={GY - 255} text="PANAS!" size={62} q={pop(t, OPEN + 0.08)} rot={-6} />
        <Label x={GX} y={GY - 230} text="[TRPV1]" size={66} q={popIO(t, 2.9, OPEN - 0.1)} fill={TUB.gold} rot={-3} />
        <Label x={fr.pick(1100, BLOB0[0] - 10)} y={fr.pick(G - 470, G - 250)} text="[KAPSAISIN]" size={fr.pick(52, 60)} q={popIO(t, 3.3, HOP0 + 0.2)} fill="#FFC07A" rot={-4} anchor={fr.pick('end', 'middle')} />
        <Label x={DOOR.x} y={G - DOOR.h - 120} text="[KEBUKA!]" size={60} q={pop(t, OPEN + 0.05)} fill={TUB.gold} rot={-4} />
      </TongueSet>
      </g>
      <Label x={fr.cx} y={fr.pick(300, 140)} text="[LIDAH]" size={fr.pick(96, 84)} q={popIO(t, 2.45, 3.6)} />
    </Svg>
  );
};

// ---- brain room
const FLOOR = NV.FLOOR;
const BRR = 205, CR = 70;
const BRAIN: P2 = [780, FLOOR - BRR * 0.92];
const COUR: P2 = [330, FLOOR - CR * 1.07];
const Brain: React.FC<{t: number}> = ({t}) => {
  const fr = useFrame();
  const {wide} = fr;
  const cam = framed(camAt(t, wide ? {x: 470, y: 1010, s: 0.95} : {x: 600, y: 1040, s: 1.12}, [{from: 6.3, to: 7.0, s: wide ? 1.02 : 1.2}]), fr);
  const [bsx, bsy] = squash(t, 6.0, 0.1);
  const hand: P2 = [COUR[0] + CR * 1.175, COUR[1] - CR * 0.316];
  const board = wide ? {x: -60, y: 900, w: 640, size: 72} : {x: 610, y: 560, w: 800, size: 84};
  return (
    <Svg>
      <g transform={tubScene(t, {i: 2, from: WIPE[0], to: 7, W: fr.W, H: fr.H}).transform}>
      <NerveSet t={t} cam={cam}>
        <AlarmBoard x={board.x} y={board.y} w={board.w} lines={['ADA API', 'DI MULUT!']} q={pop(t, 5.95)} t={t} lit={t > 5.95 ? 1 : 0} size={board.size} />
        <BrainChar id="dbrain" t={t} x={BRAIN[0]} y={BRAIN[1]} r={BRR} seed={8} mood={t < 5.95 ? 'curious' : 'shock'} look={[-0.6, 0.3]}
          armL={lerp(-20, 110, eout(t, 6.0, 6.3))} armR={lerp(-20, 110, eout(t, 6.0, 6.3))} sx={bsx} sy={bsy} />
        <Courier id="dcour" t={t} x={COUR[0]} y={COUR[1]} r={CR} seed={12} mood={t < 6.2 ? 'shock' : 'smug'} look={[0.8, -0.3]} feet="stub" armR={60} armL={-20} />
        <FireCard x={hand[0] + 24} y={hand[1] - 78} w={140} q={pop(t, 5.75)} rot={8 + Math.sin(t * 3) * 2} t={t} />
        <Stamp x={hand[0] + 24} y={hand[1] - 66} text="PALSU" size={36} q={pop(t, 6.4, 0.3)} rot={-16} />
        <Label x={BRAIN[0]} y={BRAIN[1] - BRR - 40} text="[OTAK]" size={58} q={pop(t, 6.1)} />
      </NerveSet>
      </g>
    </Svg>
  );
};

export const TubuhDemo: React.FC = () => {
  const fr = useFrame();
  const t = useCurrentFrame() / useVideoConfig().fps;
  const ready = useTubFonts();
  if (!ready) return <AbsoluteFill style={{background: TUB.wall}} />;
  let scene: React.ReactNode;
  if (t < DIVE[0]) scene = <Outside t={t} />;
  else if (t < DIVE[1]) {
    const c0 = framed(outCam(DIVE[0], fr.wide), fr);
    const d0 = outScene(DIVE[0], fr); // the outer scene is frozen at DIVE[0] → its drift then
    scene = <Dive q={eio(t, DIVE[0], DIVE[1])} hole={d0.pt(toScreen(c0, MOUTH[0], MOUTH[1]))} r0={HR * 0.13 * 1.3 * c0.s * 0.95 * d0.z} outer={<Outside t={DIVE[0]} />} inner={<Tongue t={t} />} />;
  } else if (t < WIPE[0]) scene = <Tongue t={t} />;
  else if (t < WIPE[1]) scene = <LobeWipe q={eio(t, WIPE[0], WIPE[1])} a={<Tongue t={t} />} b={<Brain t={t} />} />;
  else scene = <Brain t={t} />;
  return (
    <AbsoluteFill style={{background: TUB.wall, overflow: 'hidden'}}>
      {scene}
      <TubLight />
      <Caption t={t} pages={PAGES} />
    </AbsoluteFill>
  );
};
