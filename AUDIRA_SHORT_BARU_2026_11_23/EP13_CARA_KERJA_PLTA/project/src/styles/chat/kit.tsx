import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, Easing} from 'remotion';
import {CaptionPage} from '../../components/WordCaptions';
import {display, Frame, lerp, pageAt, useFrame} from '../shared';
import {halusDrift, halusIdle, useHalus} from '../../lib/halus';

// CHAT style kit (v1.15, look #22) — the "texting story" Short: an ORIGINAL generic chat app ("Obrol": no WhatsApp /
// iMessage look) on a phone panel over a flat cartoon bedroom with a reacting character. Fully flat: no gradients,
// glows, blur or SVG filters. Depth = hard flat shadows (0-blur offsets), outlines and layered parallax.
// kit.tsx = palette, motion helpers, fonts, icons, bubbles/typing/pills, caption, the character rig and the bedroom set;
// props.tsx = app icons, glyphs, avatars, hands/cursors, Trojan + Penipu, and the screens (phone shell, feed engine,
// notifications, lock/home/bank screens, dialogs). Landscape: phoneAnchor(fr) + roomPlace(fr) + Caption read the frame.
// HALUS (v1.16, level 'full'): wrap the room <svg> + <HalusLightDiv> + <PhoneShell> in <ChatStage t starts={[scene starts]}
// end> (gentle 0.5 drift of the WHOLE phone+room picture, never inside the feed; scene starts = your cutaway/tilt times so
// the drift changes under a phone move). Keep Reveal, cards and Caption outside it. Put <HalusDefs ink={CH.bezel}> in the
// room svg and draw <ChatRoomShadows> around the heroine; PhoneShell adds its own soft shadow, Febri/Rani its idle.

export const CH = {
  bar: '#1F2430', barSub: '#AEB4C2', paper: '#EDE7DD', pattern: '#E3DCD0', inB: '#FFFFFF', outB: '#FFCF4A', text: '#2A2A2A',
  time: '#8A8F99', tick: '#3BA776', bezel: '#121418', ink: '#1E1E24', inputBg: '#F6F2EA', line: '#DDD5C7', bShadow: '#D3CABB',
  outShadow: '#E2B12F', red: '#E5484D', redDark: '#BF3A3F', green: '#3BA776', yellow: '#FFCF4A',
  // bedroom
  wall: '#2B2F5E', wallDark: '#242851', frame: '#3A3F78', glass: '#1A1D45', moon: '#F6E7B0', curtain: '#D9604F', curtainFold: '#BD4E40',
  wood: '#6E4A3C', woodLight: '#7E5646', pillow: '#E4DEF2', pillowShade: '#CEC6E3', blanket: '#3FA7A0', blanketBand: '#37928C', paperW: '#F4F1EA',
  // character
  skin: '#F5C7A1', skinShade: '#E8AE86', blush: '#F39A8A', hair: '#2A2240', pj: '#E8705C', pjDot: '#F29A88', mouth: '#7A2E3A', sweat: '#9FD3F2',
  // romulus
  rSkin: '#EDB98E', rBeard: '#6B4226', gold: '#F2B731', goldDark: '#D9951F', toga: '#F4EBDD', rBg: '#B8433A',
};
const K = CH;
export const UI = "'Chat UI', sans-serif";
export const HEAD = "'Chat Head', sans-serif";

/** Sender colours (names + mini avatars). */
export const MONTH: Record<string, string> = {
  JANUARI: '#3D7DD8', FEBRUARI: '#E8705C', MARET: '#8C5BD6', APRIL: '#2E9E8F', MEI: '#E0703C', JUNI: '#2E9E8F',
  JULI: '#E0703C', AGUSTUS: '#D64F6E', SEPTEMBER: '#5E8C2E', OKTOBER: '#C9971C', NOVEMBER: '#4F6BD6', DESEMBER: '#3BA776',
};

// ---------- motion ----------
const OUTC = Easing.out(Easing.cubic);
const INOUT = Easing.inOut(Easing.cubic);
const INC = Easing.in(Easing.cubic);
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lin = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const eio = (t: number, a: number, b: number) => INOUT(lin(t, a, b));
export const eout = (t: number, a: number, b: number) => OUTC(lin(t, a, b));
export const ein = (t: number, a: number, b: number) => INC(lin(t, a, b));
/** Pop 0 → 1.1 → 1 starting at `at` (seconds). */
export const pop = (t: number, at: number, d = 0.34) => {
  if (t <= at) return 0;
  const k = (t - at) / d;
  if (k >= 1) return 1;
  if (k < 0.6) return 1.1 * OUTC(k / 0.6);
  return lerp(1.1, 1, INOUT((k - 0.6) / 0.4));
};
/** Damped low-frequency kick (≈1.4 Hz, one swing) for tilts / punches: 0 → +1 → −0.3 → 0. */
export const kick = (t: number, at: number, dur = 0.7) => {
  const k = (t - at) / dur;
  if (k <= 0 || k >= 1) return 0;
  return Math.sin(k * Math.PI * 2) * (1 - k) * (1 - k) * 1.6;
};
/** Squash pair after an impact. */
export const squash = (t: number, at: number, amt = 0.1, dur = 0.42): [number, number] => {
  const k = (t - at) / dur;
  const s = k > 0 && k < 1 ? Math.sin(k * Math.PI * 2) * amt * (1 - k) : 0;
  return [1 + s, 1 - s];
};
/** Eyelid 0→1→0 over 0.12 s at each blink time. */
export const lidAt = (t: number, times: number[]) => {
  for (const b of times) {
    const k = (t - b) / 0.12;
    if (k > 0 && k < 1) return Math.sin(k * Math.PI);
  }
  return 0;
};

// ---------- fonts ----------
const FONTS = ["800 58px 'Chat Head'", "500 38px 'Chat UI'", "800 38px 'Chat UI'", "600 26px 'Chat UI'"];
export const useChatFonts = () => {
  const [handle] = useState(() => delayRender('chat fonts'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all(FONTS.map((f) => document.fonts.load(f))).then(() => setReady(true)).catch(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready) continueRender(handle);
  }, [ready, handle]);
  return ready;
};

// ---------- icons (drawn, no emoji fonts) ----------
export const CalIcon: React.FC<{size: number; head?: string; body?: string; label?: string; num?: string; stroke?: string}> = ({
  size, head = K.red, body = '#FFFFFF', label, num, stroke = K.ink,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block'}}>
    <rect x={10} y={16} width={80} height={76} rx={14} fill={body} stroke={stroke} strokeWidth={6} />
    <path d="M 13 40 L 13 30 Q 13 19 24 19 L 76 19 Q 87 19 87 30 L 87 40 Z" fill={head} />
    <line x1={10} y1={40} x2={90} y2={40} stroke={stroke} strokeWidth={6} />
    <rect x={10} y={16} width={80} height={76} rx={14} fill="none" stroke={stroke} strokeWidth={6} />
    <line x1={32} y1={8} x2={32} y2={24} stroke={stroke} strokeWidth={8} strokeLinecap="round" />
    <line x1={68} y1={8} x2={68} y2={24} stroke={stroke} strokeWidth={8} strokeLinecap="round" />
    {label && <text x={50} y={36} textAnchor="middle" fontFamily={UI} fontWeight={900} fontSize={15} fill="#FFFFFF">{label}</text>}
    {num ? <text x={50} y={81} textAnchor="middle" fontFamily={UI} fontWeight={900} fontSize={38} fill={K.text}>{num}</text>
      : [0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={26 + c * 18} y={50 + r * 13} width={12} height={8} rx={2} fill={stroke} opacity={0.75} />))}
  </svg>
);

/** Crying face (replaces 😭). */
export const CryFace: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'inline-block', verticalAlign: 'middle'}}>
    <circle cx={50} cy={50} r={44} fill="#FFC93C" stroke={K.ink} strokeWidth={6} />
    <path d="M 24 40 Q 33 32 42 40" stroke={K.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
    <path d="M 58 40 Q 67 32 76 40" stroke={K.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
    <path d="M 27 44 L 27 86" stroke="#4FB3F0" strokeWidth={9} strokeLinecap="round" />
    <path d="M 73 44 L 73 86" stroke="#4FB3F0" strokeWidth={9} strokeLinecap="round" />
    <path d="M 36 74 Q 50 58 64 74 Z" fill={K.mouth} stroke={K.ink} strokeWidth={5} strokeLinejoin="round" />
  </svg>
);
/** Cool face with sunglasses (replaces 😎). */
export const CoolFace: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'inline-block', verticalAlign: 'middle'}}>
    <circle cx={50} cy={50} r={44} fill="#FFC93C" stroke={K.ink} strokeWidth={6} />
    <path d="M 14 38 L 86 38 L 82 46 Q 78 60 64 58 Q 54 56 52 46 L 48 46 Q 46 56 36 58 Q 22 60 18 46 Z" fill={K.ink} />
    <path d="M 34 70 Q 52 82 68 68" stroke={K.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
  </svg>
);
export const WarnIcon: React.FC<{size: number; color?: string; mark?: string}> = ({size, color = '#FFFFFF', mark = K.red}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'inline-block', verticalAlign: 'middle'}}>
    <path d="M 50 8 L 94 88 L 6 88 Z" fill={color} stroke={color} strokeWidth={10} strokeLinejoin="round" />
    <rect x={44} y={34} width={12} height={30} rx={5} fill={mark} />
    <circle cx={50} cy={75} r={7} fill={mark} />
  </svg>
);
/** Double read ticks. */
export const Ticks: React.FC<{color: string}> = ({color}) => (
  <svg width={34} height={20} viewBox="0 0 34 20" style={{display: 'inline-block', verticalAlign: 'middle'}}>
    <path d="M 2 11 L 8 17 L 20 3" stroke={color} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 14 13 L 18 17 L 31 3" stroke={color} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const PhoneIcon: React.FC<{size: number; color: string; down?: boolean}> = ({size, color, down}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block', transform: down ? 'rotate(135deg)' : undefined}}>
    <path d="M 26 14 L 40 14 L 46 34 L 36 42 Q 44 58 58 64 L 66 54 L 86 60 L 86 74 Q 86 86 74 86 Q 40 84 18 56 Q 12 40 14 26 Q 16 14 26 14 Z" fill={color} />
  </svg>
);
export const Star: React.FC<{x: number; y: number; r: number; fill: string}> = ({x, y, r, fill}) => (
  <path d={`M ${x} ${y - r} Q ${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q ${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q ${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q ${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z`} fill={fill} />
);

// ---------- avatars ----------
export const MonthAvatar: React.FC<{name: string; size: number}> = ({name, size}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, background: MONTH[name] ?? K.time, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontFamily: UI, fontWeight: 800, fontSize: size * 0.3, color: '#FFFFFF', letterSpacing: -0.5, flexShrink: 0}}>
    {name.slice(0, 3)}
  </div>
);
export const GroupAvatar: React.FC<{size: number}> = ({size}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, background: K.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
    <CalIcon size={size * 0.64} label="12" />
  </div>
);

/** Romulus — a generic legendary Roman king, cartoon (laurel crown, beard, toga). Round avatar. */
export const RomulusFace: React.FC<{size: number; brow?: number; bg?: string; ring?: string}> = ({size, brow = 0, bg = K.rBg, ring}) => {
  const leaves = Array.from({length: 9}, (_, i) => {
    const a = 200 + i * 17.5;
    const r = 58;
    const x = Math.cos((a * Math.PI) / 180) * r, y = -6 + Math.sin((a * Math.PI) / 180) * r * 0.78;
    return <ellipse key={i} cx={x} cy={y} rx={8} ry={17} fill={i % 2 ? K.goldDark : K.gold} stroke={K.ink} strokeWidth={3} transform={`rotate(${a + 90 + (i < 4 ? -30 : i > 4 ? 30 : 0)} ${x} ${y})`} />;
  });
  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200" style={{display: 'block'}}>
      <defs><clipPath id={`rom-c-${size}`}><circle cx={0} cy={0} r={96} /></clipPath></defs>
      <g clipPath={`url(#rom-c-${size})`}>
        <rect x={-100} y={-100} width={200} height={200} fill={bg} />
        {/* toga + cloak */}
        <path d="M -96 100 Q -90 52 -40 44 L 40 44 Q 90 52 96 100 Z" fill="#8E2F2A" stroke={K.ink} strokeWidth={4} />
        <path d="M -60 100 Q -50 56 -10 50 L 52 100 Z" fill={K.toga} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={-34} cy={64} r={8} fill={K.gold} stroke={K.ink} strokeWidth={3} />
        {/* neck + head */}
        <rect x={-16} y={22} width={32} height={30} fill={K.rSkin} stroke={K.ink} strokeWidth={4} />
        <ellipse cx={0} cy={-6} rx={46} ry={52} fill={K.rSkin} stroke={K.ink} strokeWidth={4} />
        <path d="M -46 -2 Q -48 50 0 56 Q 48 50 46 -2 Q 36 18 24 14 Q 0 22 -24 14 Q -36 18 -46 -2 Z" fill={K.rBeard} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
        <path d="M -18 22 Q 0 14 18 22 Q 0 30 -18 22 Z" fill="#4A2D1A" />
        <path d="M -44 -24 Q -40 -62 0 -60 Q 40 -62 44 -24 Q 30 -42 0 -42 Q -30 -42 -44 -24 Z" fill={K.rBeard} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
        {/* eyes + brows (smug) */}
        <ellipse cx={-17} cy={-8} rx={5} ry={6.5} fill={K.ink} />
        <ellipse cx={17} cy={-8} rx={5} ry={6.5} fill={K.ink} />
        <path d={`M -28 ${-22 - brow} L -8 ${-18 - brow * 0.4}`} stroke={K.ink} strokeWidth={6} strokeLinecap="round" />
        <path d={`M 28 ${-24 - brow} L 8 ${-18 - brow * 0.4}`} stroke={K.ink} strokeWidth={6} strokeLinecap="round" />
        <path d="M -4 -4 Q 6 8 -2 12" stroke="#B9835F" strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* laurel */}
        {leaves}
      </g>
      <circle cx={0} cy={0} r={96} fill="none" stroke={ring ?? K.ink} strokeWidth={ring ? 8 : 4} />
    </svg>
  );
};

// ---------- chat building blocks ----------
export const BUB = {padT: 16, nameH: 34, line: 48, foot: 30, padB: 12, r: 28, maxW: 560, fs: 38};
export const inH = (lines: number) => BUB.padT + BUB.nameH + lines * BUB.line + BUB.foot + BUB.padB;
export const outH = (lines: number) => BUB.padT + lines * BUB.line + BUB.foot + BUB.padB;
export const TYPING_H = 76;

/** Original tail: a small comic-balloon pointer under the bubble, slanting toward the speaker. */
const Tail: React.FC<{side: 'in' | 'out'; fill: string; shadow: string}> = ({side, fill, shadow}) => (
  <svg width={30} height={22} viewBox="0 0 30 22" style={{position: 'absolute', bottom: -18, [side === 'in' ? 'left' : 'right']: 22, overflow: 'visible',
    transform: side === 'out' ? 'scaleX(-1)' : undefined}}>
    <path d="M 2 -6 L 28 -6 L 4 20 Q 0 22 1 17 Z" fill={shadow} transform="translate(0 4)" />
    <path d="M 2 -6 L 28 -6 L 4 20 Q 0 22 1 17 Z" fill={fill} />
  </svg>
);

export const Bubble: React.FC<{side: 'in' | 'out'; name?: string; lines: React.ReactNode[]; time: string; read?: boolean; bold?: boolean; children?: React.ReactNode}> = ({
  side, name, lines, time, read = false, bold = false, children,
}) => {
  const fill = side === 'in' ? K.inB : K.outB;
  const shadow = side === 'in' ? K.bShadow : K.outShadow;
  const h = side === 'in' && name ? inH(lines.length) : outH(lines.length);
  return (
    <div style={{position: 'relative', display: 'inline-block', background: fill, borderRadius: BUB.r, height: h, padding: `${BUB.padT}px 26px ${BUB.padB}px 26px`,
      boxShadow: `0 4px 0 ${shadow}`, boxSizing: 'border-box', minWidth: 200}}>
      {name && <div style={{fontFamily: UI, fontWeight: 700, fontSize: 26, lineHeight: `${BUB.nameH}px`, color: MONTH[name] ?? '#C9971C', whiteSpace: 'nowrap'}}>{name === 'ROMULUS' ? 'Romulus' : name.charAt(0) + name.slice(1).toLowerCase()}</div>}
      {lines.map((ln, i) => (
        <div key={i} style={{fontFamily: UI, fontWeight: bold ? 800 : 500, fontSize: BUB.fs, lineHeight: `${BUB.line}px`, color: K.text, whiteSpace: 'nowrap', letterSpacing: -0.4}}>{ln}</div>
      ))}
      <div style={{height: BUB.foot, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, fontFamily: UI, fontWeight: 500, fontSize: 22, color: K.time}}>
        {time}{side === 'out' && <Ticks color={read ? K.tick : K.time} />}
      </div>
      <Tail side={side} fill={fill} shadow={shadow} />
      {children}
    </div>
  );
};

/** Typing indicator: three dots in a smooth travelling wave (2.2 Hz, never blinking). */
export const TypingBubble: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 12, height: TYPING_H, padding: '0 30px', background: K.inB,
    borderRadius: BUB.r, boxShadow: `0 4px 0 ${K.bShadow}`, boxSizing: 'border-box'}}>
    {[0, 1, 2].map((i) => {
      const w = Math.sin(t * Math.PI * 2 * 2.2 - i * 0.95);
      return <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: '#8A8F99',
        transform: `translateY(${(-Math.max(0, w) * 9).toFixed(2)}px)`}} />;
    })}
    <Tail side="in" fill={K.inB} shadow={K.bShadow} />
  </div>
);

export const Pill: React.FC<{kind: 'dark' | 'warn' | 'date' | 'join'; children: React.ReactNode}> = ({kind, children}) => {
  const bg = kind === 'warn' ? K.red : kind === 'date' ? '#DDD5C7' : kind === 'join' ? '#FFFFFF' : K.bar;
  const fg = kind === 'warn' ? '#FFFFFF' : kind === 'date' ? '#6B6F78' : kind === 'join' ? K.text : '#FFFFFF';
  const sh = kind === 'warn' ? K.redDark : kind === 'date' ? '#CFC6B6' : kind === 'join' ? K.bShadow : '#0F1218';
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: kind === 'date' ? '8px 22px' : '10px 26px', borderRadius: 26, background: bg,
      boxShadow: `0 4px 0 ${sh}`, fontFamily: UI, fontWeight: kind === 'date' ? 700 : 600, fontSize: kind === 'date' ? 22 : 27, color: fg, whiteSpace: 'nowrap',
      letterSpacing: kind === 'date' ? 1.5 : -0.2}}>
      {children}
    </div>
  );
};

/** Tiny calendar icons scattered sparsely on the warm-paper chat wallpaper (static). */
export const Wallpaper: React.FC<{w: number; h: number}> = React.memo(({w, h}) => {
  const icons: React.ReactNode[] = [];
  let k = 0;
  for (let y = 40; y < h; y += 170) {
    for (let x = (k % 2 ? 120 : 30); x < w; x += 190) {
      icons.push(
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${((x * 7 + y * 3) % 30) - 15})`}>
          <rect x={0} y={4} width={34} height={30} rx={6} fill="none" stroke={K.pattern} strokeWidth={4} />
          <rect x={0} y={4} width={34} height={10} rx={4} fill={K.pattern} />
          <line x1={9} y1={0} x2={9} y2={8} stroke={K.pattern} strokeWidth={4} strokeLinecap="round" />
          <line x1={25} y1={0} x2={25} y2={8} stroke={K.pattern} strokeWidth={4} strokeLinecap="round" />
        </g>,
      );
    }
    k++;
  }
  return <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>{icons}</svg>;
});

// ---------- phone shell ----------
export const PHONE = {x: 130, y: 330, w: 820, h: 1310, bezel: 14};
export const SCR = {w: PHONE.w - PHONE.bezel * 2, h: PHONE.h - PHONE.bezel * 2, status: 52, bar: 124, input: 118};
export const CHAT_TOP = SCR.status + SCR.bar;
export const CHAT_H = SCR.h - CHAT_TOP - SCR.input;

export const StatusBar: React.FC<{dark?: boolean; time?: string}> = ({dark = true, time = '23:47'}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: SCR.w, height: SCR.status, background: dark ? K.bar : 'transparent', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', boxSizing: 'border-box', fontFamily: UI, fontWeight: 700, fontSize: 25, color: '#FFFFFF'}}>
    <span>{time}</span>
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 14}}>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 4}}>
        {[10, 15, 20, 25].map((h) => <div key={h} style={{width: 6, height: h, borderRadius: 2, background: '#FFFFFF'}} />)}
      </div>
      <div style={{position: 'relative', width: 46, height: 22, borderRadius: 6, border: '3px solid #FFFFFF', boxSizing: 'border-box', padding: 2}}>
        <div style={{width: '62%', height: '100%', borderRadius: 2, background: '#FFFFFF'}} />
        <div style={{position: 'absolute', right: -8, top: 5, width: 4, height: 8, borderRadius: 2, background: '#FFFFFF'}} />
      </div>
    </div>
  </div>
);

export const AppBar: React.FC<{sub: string; subHot?: boolean; members?: number}> = ({sub, subHot}) => (
  <div style={{position: 'absolute', left: 0, top: SCR.status, width: SCR.w, height: SCR.bar, background: K.bar, display: 'flex', alignItems: 'center',
    padding: '0 28px 6px 18px', boxSizing: 'border-box', gap: 16}}>
    <svg width={30} height={44} viewBox="0 0 30 44"><path d="M 22 6 L 8 22 L 22 38" stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    <GroupAvatar size={80} />
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: UI, fontWeight: 800, fontSize: 36, color: '#FFFFFF', letterSpacing: -0.5}}>
        12 BULAN <CalIcon size={34} stroke="#FFFFFF" body={K.bar} head={K.yellow} />
      </div>
      <div style={{fontFamily: UI, fontWeight: subHot ? 600 : 500, fontSize: 25, color: subHot ? K.yellow : K.barSub, whiteSpace: 'nowrap'}}>{sub}</div>
    </div>
    <div style={{width: 64, height: 64, borderRadius: 32, background: '#2C3242', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <PhoneIcon size={36} color="#FFFFFF" />
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 6, padding: '0 4px'}}>
      {[0, 1, 2].map((i) => <div key={i} style={{width: 8, height: 8, borderRadius: 4, background: '#FFFFFF'}} />)}
    </div>
  </div>
);

export const InputBar: React.FC<{text: string; typing: boolean; press: number; tail?: React.ReactNode}> = ({text, typing, press, tail}) => {
  const [sx, sy] = [1 - press * 0.16, 1 - press * 0.16];
  return (
    <div style={{position: 'absolute', left: 0, top: SCR.h - SCR.input, width: SCR.w, height: SCR.input, background: K.inputBg, borderTop: `3px solid ${K.line}`,
      boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px'}}>
      <div style={{width: 60, height: 60, borderRadius: 30, background: '#E4DDD0', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: UI, fontWeight: 500, fontSize: 46, color: '#6B6F78', lineHeight: 1}}>
        <svg width={28} height={28} viewBox="0 0 28 28"><path d="M 14 3 L 14 25 M 3 14 L 25 14" stroke="#6B6F78" strokeWidth={4} strokeLinecap="round" /></svg>
      </div>
      <div style={{flex: 1, height: 74, borderRadius: 37, background: '#FFFFFF', border: `3px solid ${K.line}`, boxSizing: 'border-box', display: 'flex',
        alignItems: 'center', padding: '0 26px', fontFamily: UI, fontWeight: typing ? 700 : 500, fontSize: 30, color: typing ? K.text : K.time, whiteSpace: 'nowrap', overflow: 'hidden'}}>
        {typing ? text : 'Ketik pesan…'}{typing && tail}
        {typing && <div style={{width: 3, height: 38, background: K.text, marginLeft: 3, borderRadius: 2}} />}
      </div>
      <div style={{width: 74, height: 74, borderRadius: 37, background: K.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `scale(${sx}, ${sy})`, boxShadow: `0 4px 0 ${K.outShadow}`}}>
        <svg width={38} height={38} viewBox="0 0 38 38"><path d="M 6 19 L 32 6 L 25 32 L 19 22 Z" fill={K.text} stroke={K.text} strokeWidth={3} strokeLinejoin="round" /></svg>
      </div>
    </div>
  );
};

// ---------- caption (VO) ----------
/** Where the VO caption sits: portrait = top band above the phone (y 158, full width); landscape = top of the left
 *  column beside the phone (x 110 → 990, y 70). Override with Caption's `top` / `box`. */
export const captionBox = (fr: Frame) => (fr.wide ? {left: 110, width: 880, top: 70} : {left: 64, width: fr.W - 128, top: 158});
export const Caption: React.FC<{t: number; pages: CaptionPage[]; top?: number; box?: {left: number; width: number; top: number}}> = ({t, pages, top, box}) => {
  const fr = useFrame();
  const b = box ?? captionBox(fr);
  const pg = pageAt(t, pages);
  if (!pg) return null;
  const q = pg.start < 0.1 ? 1 : eout(t, pg.start - 0.08, pg.start + 0.08);
  return (
    <div style={{position: 'absolute', left: b.left, width: b.width, top: top ?? b.top, display: 'flex', justifyContent: 'center', zIndex: 60}}>
      <div style={{background: K.bezel, borderRadius: 26, padding: '12px 30px 14px', fontFamily: HEAD, fontWeight: 800, fontSize: 58, lineHeight: 1.18,
        color: '#FFFFFF', textAlign: 'center', letterSpacing: -0.5, maxWidth: b.width, boxSizing: 'border-box',
        transform: `translateY(${((1 - q) * 14).toFixed(2)}px) scale(${(0.94 + 0.06 * q).toFixed(4)})`, opacity: 0.4 + 0.6 * q,
        boxShadow: `0 6px 0 #0A0B0E`}}>
        {pg.words.map((w, i) => {
          const next = pg.words[i + 1];
          const on = t >= w.start && t < (next ? next.start : pg.end + 1);
          return <React.Fragment key={w.i}><span style={{color: on ? K.yellow : '#FFFFFF', opacity: t >= w.start ? 1 : 0.5}}>{display(w.word)}</span>{i < pg.words.length - 1 ? ' ' : ''}</React.Fragment>;
        })}
      </div>
    </div>
  );
};

/** Big reveal word (Chat Head) with a hard flat shadow, popping with overshoot. */
export const Reveal: React.FC<{t: number; at: number; out: number; text: string; x: number; y: number; rot?: number; size?: number; color?: string}> = ({
  t, at, out, text, x, y, rot = -5, size = 120, color = K.yellow,
}) => {
  const q = pop(t, at, 0.36) * (1 - ein(t, out, out + 0.18));
  if (q <= 0.001) return null;
  return (
    <div style={{position: 'absolute', left: x - 500, top: y - size * 0.6, width: 1000, textAlign: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: size,
      color, letterSpacing: -2, lineHeight: 1.1, transform: `rotate(${rot}deg) scale(${q.toFixed(4)})`, textShadow: `0 9px 0 ${K.bezel}, 6px 9px 0 ${K.bezel}`,
      WebkitTextStroke: `6px ${K.bezel}`, paintOrder: 'stroke fill', zIndex: 40}}>
      {text}
    </div>
  );
};

// ---------- the reacting character (Februari, personified) ----------
export type Expr = 'look' | 'shock' | 'angry' | 'happy' | 'sleepy' | 'squint';
/** Origin = head centre. ~300 px wide head, torso down to y 640 (covered by the blanket). */
export const Febri: React.FC<{t: number; expr: Expr; lid: number; sx?: number; sy?: number; lift?: number; tilt?: number; lookDown?: number; badge?: string; yawn?: number; seed?: number}> = ({
  t, expr, lid, sx = 1, sy = 1, lift = 0, tilt = 0, lookDown = 0, badge = 'FEB', yawn = 0, seed = 1,
}) => {
  // HALUS full (v1.16): idle squash/stretch from the torso base + small head sway (identity when HALUS is off)
  const idle = halusIdle(t, seed, useHalus('CHAT').full);
  sx *= idle.sx;
  sy *= idle.sy;
  tilt += idle.head;
  const breathe = Math.sin(t * 2.2) * 4;
  const bob = Math.sin(t * 2.2 - 0.7) * 5;
  const shock = expr === 'shock', angry = expr === 'angry', happy = expr === 'happy', squint = expr === 'squint';
  const eyeRx = shock ? 38 : 33, eyeRy = shock ? 46 : 39;
  const baseLid = angry ? 0.42 : expr === 'look' ? 0.18 : expr === 'sleepy' ? 0.58 : squint ? 0.5 : 0;
  const lidQ = Math.max(baseLid, lid);
  const pupR = shock ? 9 : 15;
  const py = expr === 'look' ? 14 + lookDown * 4 : angry ? 4 : squint ? 10 : expr === 'sleepy' ? 12 : 0;
  const eye = (side: number) => {
    const cx = side * 56, cy = 30;
    if (happy) return <path key={side} d={`M ${cx - 30} ${cy + 10} Q ${cx} ${cy - 30} ${cx + 30} ${cy + 10}`} stroke={K.ink} strokeWidth={9} fill="none" strokeLinecap="round" />;
    const id = `feb-eye-${side < 0 ? 'l' : 'r'}`;
    const lidY = cy - eyeRy + lidQ * eyeRy * 2;
    if (lidQ >= 0.95) return <path key={side} d={`M ${cx - 30} ${cy + 4} Q ${cx} ${cy + 26} ${cx + 30} ${cy + 4}`} stroke={K.ink} strokeWidth={8} fill="none" strokeLinecap="round" />;
    return (
      <g key={side}>
        <defs><clipPath id={id}><ellipse cx={cx} cy={cy} rx={eyeRx} ry={eyeRy} /></clipPath></defs>
        <ellipse cx={cx} cy={cy} rx={eyeRx} ry={eyeRy} fill="#FFFFFF" />
        <g clipPath={`url(#${id})`}>
          <circle cx={cx + side * (angry ? -4 : 0) + (squint ? 12 : 0)} cy={cy + py} r={pupR} fill={K.ink} />
          <circle cx={cx + 5 + side * (angry ? -4 : 0) + (squint ? 12 : 0)} cy={cy + py - 6} r={pupR * 0.32} fill="#FFFFFF" />
          {lidQ > 0.001 && <rect x={cx - eyeRx - 4} y={cy - eyeRy - 4} width={eyeRx * 2 + 8} height={lidY - (cy - eyeRy) + 4} fill={K.skin} />}
          {lidQ > 0.001 && <line x1={cx - eyeRx} y1={lidY} x2={cx + eyeRx} y2={lidY} stroke={K.ink} strokeWidth={5} strokeLinecap="round" />}
        </g>
        <ellipse cx={cx} cy={cy} rx={eyeRx} ry={eyeRy} fill="none" stroke={K.ink} strokeWidth={4} />
      </g>
    );
  };
  const brow = (side: number) => {
    if (angry) return <path key={side} d={`M ${side * 100} -40 L ${side * 26} -10`} stroke={K.hair} strokeWidth={13} strokeLinecap="round" />;
    if (shock) return <path key={side} d={`M ${side * 92} -50 Q ${side * 58} -78 ${side * 24} -56`} stroke={K.hair} strokeWidth={11} fill="none" strokeLinecap="round" />;
    if (squint) return side < 0
      ? <path key={side} d="M -92 -54 Q -58 -80 -24 -50" stroke={K.hair} strokeWidth={11} fill="none" strokeLinecap="round" />
      : <path key={side} d="M 92 -20 L 26 -24" stroke={K.hair} strokeWidth={11} fill="none" strokeLinecap="round" />;
    if (happy) return <path key={side} d={`M ${side * 90} -40 Q ${side * 58} -58 ${side * 26} -42`} stroke={K.hair} strokeWidth={10} fill="none" strokeLinecap="round" />;
    return <path key={side} d={`M ${side * 88} -26 Q ${side * 58} -36 ${side * 28} -26`} stroke={K.hair} strokeWidth={10} fill="none" strokeLinecap="round" />;
  };
  const mouth = yawn > 0.02 ? (
    <ellipse cx={0} cy={112} rx={16 + 10 * yawn} ry={8 + 30 * yawn} fill={K.mouth} stroke={K.ink} strokeWidth={4} />
  ) : happy ? (
    <g><path d="M -40 100 Q 0 104 40 100 Q 34 146 0 146 Q -34 146 -40 100 Z" fill={K.mouth} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" /><path d="M -18 134 Q 0 124 18 134 Q 10 144 0 144 Q -10 144 -18 134 Z" fill="#E06D7A" /></g>
  ) : squint ? (
    <path d="M -24 114 L 22 104" stroke={K.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
  ) : expr === 'sleepy' ? (
    <path d="M -12 112 Q 0 116 12 112" stroke={K.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
  ) : shock ? (
    <g><ellipse cx={0} cy={114} rx={24} ry={32} fill={K.mouth} stroke={K.ink} strokeWidth={4} /><ellipse cx={0} cy={132} rx={13} ry={8} fill="#E06D7A" /></g>
  ) : angry ? (
    <g>
      <rect x={-42} y={98} width={84} height={34} rx={12} fill="#FFFFFF" stroke={K.ink} strokeWidth={4} />
      <line x1={-40} y1={115} x2={40} y2={115} stroke={K.ink} strokeWidth={3} />
      {[-20, 0, 20].map((x) => <line key={x} x1={x} y1={100} x2={x} y2={130} stroke={K.ink} strokeWidth={3} />)}
    </g>
  ) : (
    <path d="M -20 108 Q 0 116 20 108" stroke={K.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
  );
  return (
    <g transform={`translate(0 ${(breathe * 0.4 - lift).toFixed(2)}) translate(0 640) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(0 -640)`}>
      {/* torso (pyjama) */}
      <g transform={`translate(0 ${(breathe * 0.3).toFixed(2)})`}>
        <path d="M -62 150 L 62 150 Q 196 170 214 300 L 232 660 L -232 660 L -214 300 Q -196 170 -62 150 Z" fill={K.pj} stroke={K.ink} strokeWidth={4} />
        {[[-150, 260], [-90, 340], [120, 250], [160, 380], [-170, 470], [90, 560], [-60, 600]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={11} fill={K.pjDot} />)}
        <path d="M -62 150 L 0 222 L 62 150" fill="#FFFFFF" stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
        {badge !== '' && <rect x={84} y={300} width={86} height={44} rx={10} fill={K.yellow} stroke={K.ink} strokeWidth={4} />}
        {badge !== '' && <text x={127} y={331} textAnchor="middle" fontFamily={UI} fontWeight={900} fontSize={24} fill={K.text}>{badge}</text>}
      </g>
      {/* hair back */}
      <g transform={`translate(0 ${bob.toFixed(2)}) rotate(${tilt.toFixed(2)} 0 150)`}>
        <path d="M -172 -6 C -182 -150 -92 -214 0 -214 C 92 -214 182 -150 172 -6 L 178 140 Q 120 168 70 150 L -70 150 Q -120 168 -178 140 Z" fill={K.hair} stroke={K.ink} strokeWidth={4} />
        <rect x={-36} y={118} width={72} height={52} fill={K.skinShade} stroke={K.ink} strokeWidth={4} />
        <circle cx={-148} cy={34} r={30} fill={K.skin} stroke={K.ink} strokeWidth={4} />
        <circle cx={148} cy={34} r={30} fill={K.skin} stroke={K.ink} strokeWidth={4} />
        <ellipse cx={0} cy={14} rx={150} ry={156} fill={K.skin} stroke={K.ink} strokeWidth={4} />
        <ellipse cx={-96} cy={88} rx={26} ry={15} fill={K.blush} opacity={angry ? 1 : 0.85} />
        <ellipse cx={96} cy={88} rx={26} ry={15} fill={K.blush} opacity={angry ? 1 : 0.85} />
        {eye(-1)}{eye(1)}
        <path d="M -6 62 Q 4 76 -4 84" stroke={K.skinShade} strokeWidth={6} fill="none" strokeLinecap="round" />
        {mouth}
        {/* bangs */}
        <path d="M -158 12 C -172 -140 -72 -190 8 -188 C 100 -186 172 -122 158 12 L 138 -44 L 110 -16 L 92 -76 L 42 -46 L 10 -96 L -30 -48 L -78 -90 L -104 -34 L -136 -64 Z"
          fill={K.hair} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
        <g transform="translate(84 -128) rotate(-22)">
          <rect x={-30} y={-12} width={60} height={24} rx={12} fill={K.yellow} stroke={K.ink} strokeWidth={4} />
        </g>
        {brow(-1)}{brow(1)}
      </g>
      {/* arms + phone */}
      <g transform={`translate(0 ${(breathe * 0.3).toFixed(2)})`}>
        {[-1, 1].map((s) => (
          <g key={s}>
            <path d={`M ${s * 196} 250 Q ${s * 214} 420 ${s * 96} 470`} stroke={K.ink} strokeWidth={80} fill="none" strokeLinecap="round" />
            <path d={`M ${s * 196} 250 Q ${s * 214} 420 ${s * 96} 470`} stroke={K.pj} strokeWidth={72} fill="none" strokeLinecap="round" />
          </g>
        ))}
        <rect x={-82} y={352} width={164} height={214} rx={24} fill={K.yellow} stroke={K.ink} strokeWidth={4} />
        <circle cx={-46} cy={388} r={13} fill={K.ink} />
        <circle cx={-14} cy={388} r={7} fill={K.ink} />
        <ellipse cx={-84} cy={472} rx={30} ry={38} fill={K.skin} stroke={K.ink} strokeWidth={4} />
        <ellipse cx={84} cy={472} rx={30} ry={38} fill={K.skin} stroke={K.ink} strokeWidth={4} />
      </g>
    </g>
  );
};

/** Shock lines + sweat drop around the head (pop in with q). */
export const ShockMarks: React.FC<{q: number}> = ({q}) => {
  if (q <= 0.001) return null;
  return (
    <g transform={`scale(${q.toFixed(4)})`}>
      {[-1, 1].map((s) => [0, 1, 2].map((i) => {
        const a = (-150 + i * 30) * (Math.PI / 180);
        const ax = Math.cos(a) * 230 * s * -1, ay = Math.sin(a) * 230;
        const bx = Math.cos(a) * 290 * s * -1, by = Math.sin(a) * 290;
        return <line key={`${s}${i}`} x1={ax} y1={ay - 20} x2={bx} y2={by - 20} stroke={K.yellow} strokeWidth={12} strokeLinecap="round" />;
      }))}
      <path d="M 186 -84 Q 206 -50 206 -34 A 20 20 0 0 1 166 -34 Q 166 -50 186 -84 Z" fill={K.sweat} stroke={K.ink} strokeWidth={4} />
    </g>
  );
};
/** Anger vein mark. */
export const AngerMark: React.FC<{q: number}> = ({q}) => {
  if (q <= 0.001) return null;
  return (
    <g transform={`translate(150 -150) scale(${q.toFixed(4)})`}>
      {[0, 90, 180, 270].map((r) => (
        <path key={r} d="M 10 -36 Q 10 -10 36 -10" stroke={K.red} strokeWidth={13} fill="none" strokeLinecap="round" transform={`rotate(${r})`} />
      ))}
    </g>
  );
};

// ---------- bedroom backdrop (world 1080×1920; wall + blanket run wide enough for 16:9) ----------
/** Room placement on the canvas: world point (540, 880) — the character's head (Rani/Febri at translate(540 880)) —
 *  lands at (x, y) with scale s. Portrait = the room as drawn (1:1); landscape = the room on the left two-thirds,
 *  head at (540, 560), scale 0.66 (window top-left, bed + character, blanket along the bottom; the phone covers the
 *  right third). */
export type RoomPlace = {x: number; y: number; s: number};
export const roomPlace = (fr: Frame): RoomPlace => (fr.wide ? {x: 540, y: 560, s: 0.66} : {x: 540, y: 880, s: 1});
/** SVG transform for a room layer: place it, then zoom by `zoom` around the head (cutaway push-ins: back wall ×1.12,
 *  bed + character + blanket ×1.24) and shift it by dy canvas px. */
export const roomXf = (rp: RoomPlace, zoom = 1, dy = 0) =>
  `translate(${rp.x} ${(rp.y + dy).toFixed(2)}) scale(${(rp.s * zoom).toFixed(4)}) translate(-540 -880)`;

/** Back wall layer: window with the crescent moon ("bulan"), curtains, wall calendar (FEB, 28 cells), shelf, lamp. */
export const RoomBack: React.FC<{clock?: boolean}> = React.memo(({clock = false}) => (
  <g>
    <rect x={-1600} y={-800} width={4600} height={3400} fill={K.wall} />
    <rect x={-1600} y={1500} width={4600} height={1100} fill={K.wallDark} />
    {/* window */}
    <rect x={40} y={128} width={470} height={18} rx={9} fill={K.wood} stroke={K.ink} strokeWidth={4} />
    <rect x={90} y={170} width={360} height={480} rx={18} fill={K.frame} stroke={K.ink} strokeWidth={4} />
    <rect x={114} y={194} width={312} height={432} rx={8} fill={K.glass} />
    <circle cx={300} cy={330} r={70} fill={K.moon} />
    <circle cx={334} cy={304} r={62} fill={K.glass} />
    <Star x={170} y={262} r={11} fill={K.moon} />
    <Star x={392} y={470} r={9} fill={K.moon} />
    <Star x={196} y={530} r={8} fill={K.moon} />
    <Star x={396} y={232} r={7} fill={K.moon} />
    <rect x={262} y={194} width={16} height={432} fill={K.frame} />
    <rect x={114} y={402} width={312} height={16} fill={K.frame} />
    <rect x={114} y={194} width={312} height={432} rx={8} fill="none" stroke={K.ink} strokeWidth={4} />
    {/* curtains */}
    {[[58, 150], [392, 484]].map(([a, b]) => (
      <g key={a}>
        <path d={`M ${a} 140 L ${b} 140 L ${b + (a < 200 ? -6 : 6)} 720 Q ${(a + b) / 2} 740 ${a + (a < 200 ? -6 : 6)} 720 Z`} fill={K.curtain} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
        <rect x={a + 24} y={146} width={14} height={576} fill={K.curtainFold} />
        <rect x={a + 58} y={146} width={12} height={576} fill={K.curtainFold} />
      </g>
    ))}
    {/* shelf + books */}
    <rect x={96} y={866} width={250} height={18} rx={4} fill={K.wood} stroke={K.ink} strokeWidth={4} />
    {[[110, 70, '#E8705C'], [146, 86, '#FFCF4A'], [182, 64, '#3FA7A0'], [214, 78, '#8C5BD6']].map(([x, h, c]) => (
      <rect key={String(x)} x={Number(x)} y={866 - Number(h)} width={30} height={Number(h)} rx={4} fill={String(c)} stroke={K.ink} strokeWidth={4} />
    ))}
    <g transform="translate(286 866) rotate(-14)"><rect x={-14} y={-60} width={28} height={60} rx={4} fill="#F4F1EA" stroke={K.ink} strokeWidth={4} /></g>
    {clock && <WallClock x={850} y={430} r={118} hour={11} minute={0} />}
    {/* wall calendar: FEB = exactly 4 rows of 7 */}
    {!clock && <>
    <circle cx={850} cy={286} r={8} fill={K.ink} />
    <path d="M 790 312 L 850 286 L 910 312" stroke={K.ink} strokeWidth={4} fill="none" />
    <rect x={740} y={306} width={220} height={276} rx={14} fill={K.paperW} stroke={K.ink} strokeWidth={4} />
    <path d="M 742 368 L 742 320 Q 742 308 754 308 L 946 308 Q 958 308 958 320 L 958 368 Z" fill={K.red} />
    <line x1={740} y1={368} x2={960} y2={368} stroke={K.ink} strokeWidth={4} />
    <text x={850} y={352} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={36} fill="#FFFFFF">FEB</text>
    {Array.from({length: 28}, (_, i) => (
      <rect key={i} x={758 + (i % 7) * 27} y={388 + Math.floor(i / 7) * 46} width={20} height={34} rx={4} fill={i === 27 ? K.red : '#D8D2C6'} />
    ))}
    </>}
    {/* off the portrait frame, seen only in 16:9: a framed picture on the left, the bedroom door on the right */}
    <g>
      <rect x={-244} y={566} width={190} height={210} rx={10} fill={K.wallDark} transform="translate(8 10)" />
      <rect x={-244} y={566} width={190} height={210} rx={10} fill={K.wood} stroke={K.ink} strokeWidth={4} />
      <rect x={-226} y={584} width={154} height={174} rx={4} fill={K.paperW} />
      <path d="M -226 758 L -186 688 L -160 724 L -128 662 L -72 758 Z" fill={K.blanket} />
      <circle cx={-110} cy={622} r={16} fill={K.yellow} />
    </g>
    <g>
      <rect x={2290} y={600} width={290} height={880} rx={10} fill={K.wallDark} transform="translate(10 0)" />
      <rect x={2290} y={600} width={290} height={880} rx={10} fill={K.wood} stroke={K.ink} strokeWidth={4} />
      <rect x={2326} y={640} width={218} height={330} rx={8} fill={K.woodLight} />
      <rect x={2326} y={1010} width={218} height={420} rx={8} fill={K.woodLight} />
      <circle cx={2328} cy={1030} r={14} fill={K.gold} stroke={K.ink} strokeWidth={4} />
    </g>
    {/* wall lamp (flat, no glow) */}
    <rect x={966} y={680} width={16} height={90} rx={6} fill={K.wood} stroke={K.ink} strokeWidth={4} />
    <path d="M 974 700 Q 930 690 912 724" stroke={K.ink} strokeWidth={10} fill="none" strokeLinecap="round" />
    <path d="M 860 720 L 964 720 L 990 806 L 834 806 Z" fill={K.yellow} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
    <rect x={860} y={738} width={104} height={14} fill="#F2B731" />
  </g>
));

/** Flat wall clock (static hands). */
export const WallClock: React.FC<{x: number; y: number; r: number; hour: number; minute: number}> = ({x, y, r, hour, minute}) => {
  const ma = (minute / 60) * Math.PI * 2, ha = ((hour % 12) / 12 + minute / 720) * Math.PI * 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={8} cy={10} r={r} fill={K.wallDark} />
      <circle cx={0} cy={0} r={r} fill={K.paperW} stroke={K.ink} strokeWidth={6} />
      <circle cx={0} cy={0} r={r - 20} fill="none" stroke="#E2DCCF" strokeWidth={6} />
      {Array.from({length: 12}, (_, i) => {
        const a = (i / 12) * Math.PI * 2, big = i % 3 === 0;
        return <line key={i} x1={Math.sin(a) * (r - 22)} y1={-Math.cos(a) * (r - 22)} x2={Math.sin(a) * (r - (big ? 44 : 34))} y2={-Math.cos(a) * (r - (big ? 44 : 34))}
          stroke={K.ink} strokeWidth={big ? 8 : 5} strokeLinecap="round" />;
      })}
      <line x1={0} y1={0} x2={Math.sin(ha) * r * 0.48} y2={-Math.cos(ha) * r * 0.48} stroke={K.ink} strokeWidth={12} strokeLinecap="round" />
      <line x1={0} y1={0} x2={Math.sin(ma) * r * 0.7} y2={-Math.cos(ma) * r * 0.7} stroke={K.red} strokeWidth={8} strokeLinecap="round" />
      <circle cx={0} cy={0} r={10} fill={K.ink} />
    </g>
  );
};

/** Bed layer behind the character. */
export const BedBack: React.FC = React.memo(() => (
  <g>
    <path d="M 160 1540 L 160 1030 Q 160 960 230 960 L 850 960 Q 920 960 920 1030 L 920 1540 Z" fill={K.wood} stroke={K.ink} strokeWidth={4} />
    <path d="M 206 1540 L 206 1048 Q 206 1004 250 1004 L 830 1004 Q 874 1004 874 1048 L 874 1540 Z" fill={K.woodLight} />
    <rect x={290} y={1070} width={500} height={190} rx={70} fill={K.pillow} stroke={K.ink} strokeWidth={4} />
    <rect x={318} y={1210} width={444} height={22} rx={11} fill={K.pillowShade} />
  </g>
));

/** Blanket in front of the character. */
export const Blanket: React.FC = React.memo(() => (
  <g>
    <path d="M -1600 1470 L -300 1470 Q 120 1418 330 1456 Q 540 1494 760 1450 Q 960 1414 1380 1470 L 3000 1470 L 3000 2600 L -1600 2600 Z" fill={K.blanket} stroke={K.ink} strokeWidth={4} />
    <path d="M -1600 1600 L -300 1600 Q 120 1560 330 1590 Q 540 1622 760 1584 Q 960 1554 1380 1600 L 3000 1600 L 3000 1640 L 1380 1640 Q 960 1594 760 1624 Q 540 1662 330 1630 Q 120 1600 -300 1640 L -1600 1640 Z" fill={K.blanketBand} />
    <path d="M -1600 1760 L -300 1760 Q 120 1720 330 1750 Q 540 1782 760 1744 Q 960 1714 1380 1760 L 3000 1760 L 3000 1800 L 1380 1800 Q 960 1754 760 1784 Q 540 1822 330 1790 Q 120 1760 -300 1800 L -1600 1800 Z" fill={K.blanketBand} />
  </g>
));

/** The full-demo heroine is the same rig, renamed (Rani); pass badge="" to drop the FEB pocket label. */
export const Rani = Febri;

// ---------- HALUS (v1.16) ----------
/** Drift of a scene chain: scene k runs from starts[k] to starts[k + 1] (the last to `end`); consecutive drifts blend over
 *  ±0.3 s around each start so the picture never jumps (put the starts on phone tilts / cutaways). Zoom always covers the
 *  pan, so no edge is ever exposed. */
export const chatDrift = (t: number, starts: number[], end: number, amount = 0.5, W = 1080) => {
  let z = 1, px = 0;
  starts.forEach((a, k) => {
    const d = halusDrift(t, a, starts[k + 1] ?? end, k, amount);
    const w = k === 0 ? 1 : eio(t, a - 0.3, a + 0.3);
    z = lerp(z, d.z, w);
    px = lerp(px, d.px, w);
  });
  return {z: Math.max(z, 1 + (2 * Math.abs(px)) / W), px};
};
/** CHAT scene helper: the whole phone + room picture drifts gently (amount 0.5) when HALUS is on; with HALUS off it is a
 *  plain pass-through (the look exactly as v1.15). The phone-camera tilts/pushes inside stay the scene changes. */
export const ChatStage: React.FC<{t: number; starts?: number[]; end: number; amount?: number; fx?: number; fy?: number; children: React.ReactNode}> = ({
  t, starts = [0], end, amount = 0.5, fx, fy, children,
}) => {
  const fr = useFrame();
  if (!useHalus('CHAT').drift) return <>{children}</>;
  const {z, px} = chatDrift(t, starts, end, amount, fr.W);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: fr.W, height: fr.H, transformOrigin: `${fx ?? fr.W / 2}px ${fy ?? fr.H * 0.47}px`,
      transform: `translateX(${px.toFixed(2)}px) scale(${z.toFixed(5)})`}}>
      {children}
    </div>
  );
};
/** HALUS full: soft ink contact shadows for the bedroom set, in room (world) coords — `behind` goes between BedBack and the
 *  heroine (her head's soft shadow on the wall/headboard, offset away from the top-left light), `front` between the heroine and the Blanket (the blanket's edge on her pyjamas).
 *  Needs <HalusDefs> in the same svg. Renders nothing when HALUS is not 'full'. */
export const ChatRoomShadows: React.FC<{layer: 'behind' | 'front'; x?: number}> = ({layer, x = 540}) => {
  if (!useHalus('CHAT').full) return null;
  return layer === 'behind'
    ? <ellipse cx={x + 52} cy={918} rx={176} ry={150} fill={K.bezel} opacity={0.26} filter="url(#hl-soft)" />
    : <ellipse cx={x} cy={1452} rx={430} ry={22} fill={K.bezel} opacity={0.3} filter="url(#hl-soft)" />;
};
