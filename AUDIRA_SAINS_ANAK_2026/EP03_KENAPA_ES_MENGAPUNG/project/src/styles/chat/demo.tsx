import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CaptionPage} from '../../components/WordCaptions';
import {camera, lerp, Move, Pose, useFrame} from '../shared';
import {
  BedBack, Blanket, Bubble, Caption, CH, ChatRoomShadows, ChatStage, eio, ein, eout, Expr, kick, lidAt, lin, Pill, pop, Rani, Reveal, RoomBack, roomPlace,
  roomXf, SCR, ShockMarks, squash, StatusBar, useChatFonts,
} from './kit';
import {HalusDefs, HalusLightDiv, useHalus} from '../../lib/halus';
import {
  ChatFeed, ChatInput, ContactBar, FeedItem, feedLayout, FILE_H, FileBubble, FileGlyph, Finger, FlowerAvatar, GrowClip, LockGlyph, LockScreen, Notif,
  ObrolIcon, PhoneShell, RingOn, SYS_H, TapRing, textH, UnknownCard,
} from './props';

// CHAT StyleGallery demo (6 s QA sheet, never a delivery) — the look's signature moves in one take: a heads-up
// notification on the lock screen ("Tidak dikenal") → tap → the chat grows out of it → typing dots → bubble pops on the
// voice → the attachment card, its ".apk" turns red with a drawn ring and the phone kicks → cutaway: the phone tilts away
// and the character reacts (shock + reveal word) → a warning system pill → a finger taps Blokir → lock badge + blocked
// strip. Portrait: the phone covers the bedroom, cutaways drop it off the bottom. Landscape (Look-CHAT-Wide): phone on
// the right (phoneAnchor), bedroom + character on the left two-thirds (roomPlace), caption over the left column; the
// cutaway slides the phone right and pushes in on the character.
// HALUS (v1.16): ChatStage drifts the whole phone + room picture (scene starts on the cutaway moves), soft ink shadows
// (headboard, blanket edge, under the phone), light between room and phone; Reveal + Caption stay still.

const fakePage = (text: string, start: number, end: number): CaptionPage[] => {
  const ws = text.split(' ').map((word, i) => ({i, word, start: start + i * 0.26, end: start + i * 0.26 + 0.22}));
  return [{start, end, words: ws}];
};
const PAGES = [...fakePage('Jam 11 malam,', 0.1, 0.92), ...fakePage('ada chat masuk.', 0.95, 1.9), ...fakePage('Isinya undangan nikah…', 1.95, 2.88),
  ...fakePage('tapi ujungnya .APK!', 2.92, 4.2), ...fakePage('Jangan dibuka,', 4.3, 5.05), ...fakePage('langsung blokir!', 5.1, 6.0)];

const NUM = '+62 8xx-xxxx-xx17';
const B = 14; // bezel: overlay coords = screen coords + B
const NOTIF = 0.25, TAP0 = 0.72, GROW0 = 0.8, GROW1 = 1.15;
const TYPE1 = 1.2, SALAM = 1.72, TYPE2 = 2.0, FILE = 2.45, APK = 3.02;
const CUT_OUT = 3.22, HIT = 3.45, CUT_BACK = 4.12, CUT_D = 0.38;
const WARN = 4.62, BLOKIR = 5.3;
const NOTIF_Y = 470;
const bump = (t: number, a: number, b: number) => Math.sin(Math.PI * lin(t, a, b));
const press = (t: number, at: number) => bump(t, at - 0.07, at + 0.16);

const ITEMS: FeedItem[] = [
  {key: 'date', at: -1, h: 44, gap: 20, align: 'center', node: () => <Pill kind="date">HARI INI</Pill>},
  {key: 'sys', at: -1, h: SYS_H, gap: 26, align: 'center', node: (t) => <UnknownCard num={NUM} hi={bump(t, 4.35, 5.0)} press={press(t, BLOKIR)} blocked={t > BLOKIR + 0.06 ? 1 : 0} />},
  {key: 'salam', at: SALAM, typeAt: TYPE1, h: textH(2), gap: 26, align: 'in', node: () => <Bubble side="in" lines={['Assalamualaikum,', 'kami harap kehadirannya.']} time="23:00" />},
  {key: 'file', at: FILE, typeAt: TYPE2, h: FILE_H, gap: 26, align: 'in', node: (t) => {
    const red = t > APK - 0.03;
    return (
      <div style={{transform: `scale(${(1 + 0.05 * bump(t, APK - 0.05, APK + 0.45)).toFixed(4)})`}}>
        <FileBubble w={680} time="23:00" size="6,6 MB · APK" glyph={<FileGlyph size={100} ext="APK" band={red ? CH.red : '#9AA0AA'} />}
          lines={['Undangan Pernikahan', 'Digital']}
          ext={<span style={{position: 'relative', display: 'inline-block', color: red ? '#FFFFFF' : '#6B6F78', background: red ? CH.red : 'transparent', borderRadius: 8, padding: red ? '0 6px' : 0, marginLeft: red ? 12 : 0}}>
            .apk
            <span style={{position: 'absolute', left: -14, top: -10, width: 96, height: 60}}><RingOn q={eout(t, APK, APK + 0.35)} w={96} h={60} color={CH.yellow} /></span>
          </span>} />
      </div>
    );
  }},
  {key: 'warn', at: WARN, h: 52, gap: 22, align: 'center', node: () => <Pill kind="warn">File .apk = memasang aplikasi</Pill>},
  {key: 'blk', at: BLOKIR + 0.14, h: 52, gap: 22, align: 'center', node: () => <Pill kind="dark"><LockGlyph size={30} color="#FFFFFF" body={CH.bar} />Kamu memblokir nomor ini</Pill>},
];
const FEED_H = SCR.h - SCR.status - SCR.bar - SCR.input;
const FEED_TOP = SCR.status + SCR.bar;

const Screen: React.FC<{t: number}> = ({t}) => {
  const grow = eio(t, GROW0, GROW1);
  const typing = (t >= TYPE1 && t < SALAM) || (t >= TYPE2 && t < FILE);
  const blocked = eio(t, BLOKIR + 0.06, BLOKIR + 0.36);
  const nq = pop(t, NOTIF, 0.36);
  return (
    <>
      {t < GROW1 + 0.02 && (
        <LockScreen time="23:00" date="Sabtu malam">
          {nq > 0.001 && (
            <div style={{position: 'absolute', left: 20, top: NOTIF_Y, transform: `translateY(${((1 - Math.min(1, nq)) * -40).toFixed(1)}px) scale(${nq.toFixed(4)})`, transformOrigin: '50% 0%'}}>
              <Notif icon={<ObrolIcon size={40} />} app="Obrol" avatar={<FlowerAvatar size={84} />} title={NUM}
                body={<span>Mengirim pesan dan <b style={{color: CH.text}}>1 file</b></span>}
                tag={<span style={{display: 'inline-block', background: CH.red, color: '#FFFFFF', fontWeight: 800, borderRadius: 12, padding: '4px 12px', fontSize: 22}}>Tidak dikenal</span>} />
            </div>
          )}
        </LockScreen>
      )}
      {t >= GROW0 && (
        <GrowClip q={grow} from={{x: 20, y: NOTIF_Y, w: SCR.w - 40, h: 214, r: 36}}>
          <ChatFeed t={t} items={ITEMS} />
          <ContactBar avatar={<FlowerAvatar size={80} />} title={NUM} sub={typing ? 'sedang mengetik…' : blocked > 0.5 ? 'diblokir' : 'online'} subHot={typing}
            titleHi={bump(t, 4.35, 5.0)} lock={pop(t, BLOKIR + 0.1, 0.32)} />
          <ChatInput blocked={blocked} />
          <StatusBar time="23:00" />
        </GrowClip>
      )}
    </>
  );
};

const Overlay: React.FC<{t: number}> = ({t}) => {
  const out: React.ReactNode[] = [];
  // tap the notification
  if (t > 0.4 && t < 1.2) {
    const tip = {x: 430 + B, y: NOTIF_Y + 120 + B};
    const k1 = eio(t, 0.4, TAP0), k2 = eio(t, 0.86, 1.18);
    out.push(<Finger key="f0" x={lerp(lerp(470, tip.x, k1), 560, k2)} y={lerp(lerp(1500, tip.y, k1), 1650, k2)} rot={-8} press={press(t, TAP0 + 0.04)} />);
    out.push(<TapRing key="r0" x={tip.x} y={tip.y} k={lin(t, TAP0 + 0.02, TAP0 + 0.42)} />);
  }
  // tap Blokir on the unknown-number card (row position from the feed engine)
  if (t > 4.75) {
    const row = feedLayout(ITEMS, BLOKIR, FEED_H).find((r) => r.it.key === 'sys');
    const tip = {x: (SCR.w - 700) / 2 + 24 + 150 + B, y: FEED_TOP + (row?.y ?? 86) + 20 + 84 + 20 + 40 + B};
    const k1 = eio(t, 4.75, BLOKIR - 0.06), k2 = eio(t, BLOKIR + 0.2, 5.8);
    out.push(<Finger key="f1" x={lerp(lerp(tip.x + 60, tip.x, k1), tip.x + 160, k2)} y={lerp(lerp(1650, tip.y, k1), 1700, k2)} rot={-12} press={press(t, BLOKIR)} />);
    out.push(<TapRing key="r1" x={tip.x} y={tip.y} k={lin(t, BLOKIR, BLOKIR + 0.4)} color={CH.red} />);
  }
  return <>{out}</>;
};

export const ChatDemo: React.FC = () => {
  const fr = useFrame();
  const {W, H, wide} = fr;
  const t = useCurrentFrame() / useVideoConfig().fps;
  const ready = useChatFonts();
  if (!ready) return <AbsoluteFill style={{background: CH.wall}} />;

  // phone camera: rest → push on the chat → drop away for the cutaway → back
  const AWAY: Partial<Pose> = wide ? {x: 420, y: 140, s: 0.92, r: 7} : {x: 0, y: 1010, s: 0.95, r: -5};
  const UP: Partial<Pose> = {x: 0, y: 0, s: 1, r: 0};
  const moves: Move[] = [{from: 1.3, to: 3.0, s: 1.03}, {from: CUT_OUT, to: CUT_OUT + CUT_D, ...AWAY}, {from: CUT_BACK, to: CUT_BACK + CUT_D, ...UP}, {from: 4.8, to: 5.9, s: 1.03}];
  const base = camera(t, {x: 0, y: 0, s: 1, r: 0}, moves);
  const pose: Pose = {...base, r: base.r + kick(t, APK, 0.7) * 1.4 + kick(t, BLOKIR, 0.7) * 1.1 + kick(t, NOTIF, 0.5) * 0.8};

  // bedroom + character (cutaway push-in)
  const c = eio(t, CUT_OUT, CUT_OUT + CUT_D) * (1 - eio(t, CUT_BACK, CUT_BACK + CUT_D));
  const rp0 = roomPlace(fr);
  const rp = wide ? {...rp0, x: lerp(rp0.x, 700, c)} : rp0;
  const dy = -46 * c * rp.s;
  let expr: Expr = t < NOTIF ? 'sleepy' : 'look';
  let lift = 0, tilt = 0, marks = 0;
  let [sx, sy] = [1, 1];
  if (t >= HIT && t < CUT_BACK + CUT_D) {
    expr = 'shock';
    [sx, sy] = squash(t, HIT, -0.09, 0.5);
    lift = 30 * eout(t, HIT, HIT + 0.14);
    tilt = -3 * eout(t, HIT, HIT + 0.2);
    marks = pop(t, HIT + 0.04, 0.3) * (1 - ein(t, CUT_BACK + 0.1, CUT_BACK + 0.3));
  } else if (t >= BLOKIR + 0.1) {
    expr = 'happy';
    lift = 14 * eout(t, BLOKIR + 0.1, BLOKIR + 0.3);
  } else if (t >= NOTIF && t < 1.2) {
    lift = 20 * eout(t, NOTIF, NOTIF + 0.12) * (1 - eio(t, NOTIF + 0.3, NOTIF + 0.7));
  }
  const lid = Math.max(lidAt(t, [1.6, 2.9, 4.7]), t < NOTIF ? 0.25 : 0);
  const dim = wide ? 0.18 * (1 - c) : 0.42 * (1 - c);
  const halus = useHalus('CHAT').full;

  return (
    <AbsoluteFill style={{background: CH.wall, overflow: 'hidden'}}>
      <ChatStage t={t} starts={[0, CUT_OUT, CUT_BACK]} end={6}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
          {halus && <HalusDefs ink={CH.bezel} />}
          <g transform={roomXf(rp, 1 + 0.12 * c, dy)}><RoomBack clock /></g>
          <g transform={roomXf(rp, 1 + 0.24 * c, dy)}>
            <BedBack />
            <ChatRoomShadows layer="behind" />
            <g transform="translate(540 880)">
              <Rani t={t} expr={expr} lid={lid} sx={sx} sy={sy} lift={lift} tilt={tilt} lookDown={1} badge="" />
              <g transform={`translate(0 ${(-lift).toFixed(1)})`}><ShockMarks q={marks} /></g>
            </g>
            <ChatRoomShadows layer="front" />
            <Blanket />
          </g>
          <rect x={0} y={0} width={W} height={H} fill={CH.bezel} opacity={dim.toFixed(3)} />
        </svg>
        {halus && <HalusLightDiv ink={CH.bezel} strength={0.85} />}
        <PhoneShell pose={pose} screen={<Screen t={t} />} overlay={<Overlay t={t} />} />
      </ChatStage>
      <Reveal t={t} at={HIT} out={CUT_BACK - 0.04} text=".APK?!" x={wide ? 700 : 540} y={wide ? 270 : 410} rot={-4} size={wide ? 120 : 140} />
      <Caption t={t} pages={PAGES} />
    </AbsoluteFill>
  );
};

