import React from 'react';
import {Frame, Pose, useFrame} from '../shared';
import {useHalus} from '../../lib/halus';
import {CH, eio, eout, HEAD, outH, PHONE, pop, SCR, StatusBar, Star, TypingBubble, TYPING_H, UI, Wallpaper} from './kit';

// CHAT kit — props + screens. Props: app icons, glyphs, avatars and the two original villains (the .apk Trojan critter
// and the hooded "penipu"). Everything flat: fills + 4–6 px #1E1E24 outlines, hard offset shadows, no gradients / blur /
// filters. Glyphs use a 100×100 viewBox and render as inline-block <svg> of `size` px. Screens (second half): the phone
// shell, the chat feed engine, notifications, lock/home/bank screens, dialogs and menus.

const K = CH;
export const PX = {
  purple: '#8C5BD6', purpleDark: '#6E43B4', teal: '#1E7A6E', tealDark: '#165E55', smsGreen: '#3BA776', blue: '#3D7DD8', orange: '#E0703C',
  navy: '#2E3A66', pink: '#F3A8B8', pinkDark: '#E07F96', cream: '#FFF6E6', shadow: '#0F1218', hood: '#262A44', hoodDark: '#1A1D33', void: '#0C0D14',
};

const Svg: React.FC<{size: number; children: React.ReactNode; vb?: string; style?: React.CSSProperties}> = ({size, children, vb = '0 0 100 100', style}) => (
  <svg width={size} height={size} viewBox={vb} style={{display: 'inline-block', verticalAlign: 'middle', overflow: 'visible', ...style}}>{children}</svg>
);

/** Gear path centred on (cx, cy). */
export const gearD = (cx: number, cy: number, r: number, teeth = 8, depth = 0.24) => {
  const pts: string[] = [];
  const n = teeth * 4;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const out = i % 4 === 1 || i % 4 === 2;
    const rr = out ? r : r * (1 - depth);
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)} ${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return `M ${pts.join(' L ')} Z`;
};

// ---------- app icons (rounded squares) ----------
const AppTile: React.FC<{size: number; bg: string; children: React.ReactNode; shadow?: string}> = ({size, bg, children, shadow}) => (
  <Svg size={size}>
    <rect x={4} y={9} width={92} height={88} rx={24} fill={shadow ?? K.ink} opacity={shadow ? 1 : 0.35} />
    <rect x={4} y={3} width={92} height={90} rx={24} fill={bg} stroke={K.ink} strokeWidth={4} />
    {children}
  </Svg>
);
/** "Obrol" — the episode's fictional chat app (yellow, speech bubble). */
export const ObrolIcon: React.FC<{size: number}> = ({size}) => (
  <AppTile size={size} bg={K.yellow}>
    <path d="M 24 30 Q 24 22 32 22 L 68 22 Q 76 22 76 30 L 76 56 Q 76 64 68 64 L 44 64 L 30 76 L 32 64 Q 24 64 24 56 Z" fill={K.bar} />
    {[38, 50, 62].map((x) => <circle key={x} cx={x} cy={43} r={4.5} fill={K.yellow} />)}
  </AppTile>
);
/** The scam app: a generic box with a gear (no OS mascot). */
export const GearBox: React.FC<{size: number; bg?: string}> = ({size, bg = PX.purple}) => (
  <AppTile size={size} bg={bg}>
    <path d={gearD(50, 48, 28)} fill="#FFFFFF" stroke={K.ink} strokeWidth={3.5} strokeLinejoin="round" />
    <circle cx={50} cy={48} r={9} fill={bg} stroke={K.ink} strokeWidth={3.5} />
  </AppTile>
);
export const SmsIcon: React.FC<{size: number}> = ({size}) => (
  <AppTile size={size} bg={PX.smsGreen}>
    <rect x={20} y={26} width={60} height={42} rx={8} fill="#FFFFFF" stroke={K.ink} strokeWidth={3.5} />
    <path d="M 22 30 L 50 52 L 78 30" stroke={K.ink} strokeWidth={3.5} fill="none" strokeLinejoin="round" />
  </AppTile>
);
export const BankIcon: React.FC<{size: number}> = ({size}) => (
  <AppTile size={size} bg={PX.teal}>
    <path d="M 18 40 L 50 20 L 82 40 Z" fill="#FFFFFF" stroke={K.ink} strokeWidth={3.5} strokeLinejoin="round" />
    {[28, 44, 58, 72].map((x) => <rect key={x} x={x - 4} y={43} width={8} height={24} fill="#FFFFFF" stroke={K.ink} strokeWidth={3} />)}
    <rect x={18} y={68} width={64} height={9} rx={2} fill="#FFFFFF" stroke={K.ink} strokeWidth={3.5} />
  </AppTile>
);
export const CameraIcon: React.FC<{size: number}> = ({size}) => (
  <AppTile size={size} bg="#4A5068">
    <rect x={20} y={32} width={60} height={42} rx={9} fill="#FFFFFF" stroke={K.ink} strokeWidth={3.5} />
    <rect x={36} y={24} width={20} height={10} rx={3} fill="#FFFFFF" stroke={K.ink} strokeWidth={3.5} />
    <circle cx={50} cy={53} r={12} fill="#4A5068" stroke={K.ink} strokeWidth={3.5} />
  </AppTile>
);
export const GalleryIcon: React.FC<{size: number}> = ({size}) => (
  <AppTile size={size} bg={PX.pink}>
    <rect x={20} y={24} width={60} height={50} rx={8} fill="#FFFFFF" stroke={K.ink} strokeWidth={3.5} />
    <path d="M 24 70 L 40 48 L 52 62 L 60 54 L 76 70 Z" fill={PX.pinkDark} />
    <circle cx={64} cy={38} r={6} fill={K.yellow} />
  </AppTile>
);
export const NoteIcon: React.FC<{size: number}> = ({size}) => (
  <AppTile size={size} bg="#F2B731">
    <rect x={26} y={20} width={48} height={60} rx={6} fill="#FFFFFF" stroke={K.ink} strokeWidth={3.5} />
    {[36, 48, 60].map((y) => <rect key={y} x={34} y={y} width={32} height={5} rx={2} fill={K.ink} />)}
  </AppTile>
);
export const ClockIcon: React.FC<{size: number}> = ({size}) => (
  <AppTile size={size} bg={K.bar}>
    <circle cx={50} cy={49} r={26} fill="#FFFFFF" stroke={K.ink} strokeWidth={3.5} />
    <path d="M 50 32 L 50 49 L 62 56" stroke={K.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
  </AppTile>
);
export const SettingsIcon: React.FC<{size: number}> = ({size}) => (
  <AppTile size={size} bg="#8A8F99">
    <path d={gearD(50, 48, 26, 8, 0.22)} fill="#FFFFFF" stroke={K.ink} strokeWidth={3.5} strokeLinejoin="round" />
    <circle cx={50} cy={48} r={9} fill="#8A8F99" stroke={K.ink} strokeWidth={3.5} />
  </AppTile>
);

// ---------- glyphs ----------
/** Document with a folded corner and a coloured type band (".APK", "JPG", "PDF"). */
export const FileGlyph: React.FC<{size: number; ext: string; band?: string}> = ({size, ext, band = K.red}) => (
  <Svg size={size}>
    <path d="M 22 6 L 62 6 L 82 26 L 82 94 L 22 94 Z" fill={K.ink} transform="translate(4 4)" opacity={0.3} />
    <path d="M 22 6 L 62 6 L 82 26 L 82 94 L 22 94 Z" fill="#FFFFFF" stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 62 6 L 62 26 L 82 26" fill="#E9E3D7" stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
    <rect x={12} y={54} width={60} height={26} rx={6} fill={band} stroke={K.ink} strokeWidth={3.5} />
    <text x={42} y={73} textAnchor="middle" fontFamily={UI} fontWeight={900} fontSize={17} fill="#FFFFFF" letterSpacing={0.5}>{ext}</text>
  </Svg>
);
export const LockGlyph: React.FC<{size: number; color?: string; body?: string}> = ({size, color = K.ink, body = '#FFFFFF'}) => (
  <Svg size={size}>
    <path d="M 32 46 L 32 32 Q 32 14 50 14 Q 68 14 68 32 L 68 46" stroke={color} strokeWidth={10} fill="none" />
    <rect x={20} y={42} width={60} height={46} rx={10} fill={body} stroke={color} strokeWidth={7} />
    <circle cx={50} cy={62} r={6} fill={color} />
    <rect x={47} y={62} width={6} height={14} rx={3} fill={color} />
  </Svg>
);
export const TrashGlyph: React.FC<{size: number; color?: string; lid?: number}> = ({size, color = K.red, lid = 0}) => (
  <Svg size={size}>
    <g transform={`rotate(${(-lid * 28).toFixed(2)} 22 26)`}>
      <rect x={18} y={20} width={64} height={10} rx={4} fill={color} stroke={K.ink} strokeWidth={4} />
      <rect x={40} y={12} width={20} height={10} rx={3} fill={color} stroke={K.ink} strokeWidth={4} />
    </g>
    <path d="M 24 34 L 76 34 L 70 90 L 30 90 Z" fill={color} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
    {[40, 50, 60].map((x) => <line key={x} x1={x} y1={44} x2={x} y2={80} stroke={K.ink} strokeWidth={4} strokeLinecap="round" />)}
  </Svg>
);
export const CheckGlyph: React.FC<{size: number; bg?: string}> = ({size, bg = K.green}) => (
  <Svg size={size}>
    <circle cx={50} cy={50} r={44} fill={bg} stroke={K.ink} strokeWidth={5} />
    <path d="M 28 52 L 44 67 L 73 36" stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
export const XGlyph: React.FC<{size: number; bg?: string}> = ({size, bg = K.red}) => (
  <Svg size={size}>
    <circle cx={50} cy={50} r={44} fill={bg} stroke={K.ink} strokeWidth={5} />
    <path d="M 33 33 L 67 67 M 67 33 L 33 67" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
  </Svg>
);
export const NoGlyph: React.FC<{size: number}> = ({size}) => (
  <Svg size={size}>
    <circle cx={50} cy={50} r={40} fill="#FFFFFF" stroke={K.red} strokeWidth={12} />
    <line x1={22} y1={22} x2={78} y2={78} stroke={K.red} strokeWidth={12} />
  </Svg>
);
export const BoxGlyph: React.FC<{size: number}> = ({size}) => (
  <Svg size={size}>
    <path d="M 14 34 L 50 18 L 86 34 L 86 74 L 50 90 L 14 74 Z" fill="#D9A066" stroke={K.ink} strokeWidth={4.5} strokeLinejoin="round" />
    <path d="M 14 34 L 50 50 L 86 34 M 50 50 L 50 90" stroke={K.ink} strokeWidth={4.5} fill="none" strokeLinejoin="round" />
    <path d="M 31 26 L 67 42 L 67 56" stroke="#F4F1EA" strokeWidth={7} fill="none" />
  </Svg>
);
export const BillGlyph: React.FC<{size: number}> = ({size}) => (
  <Svg size={size}>
    <path d="M 22 8 L 78 8 L 78 92 L 70 86 L 62 92 L 54 86 L 46 92 L 38 86 L 30 92 L 22 86 Z" fill="#FFFFFF" stroke={K.ink} strokeWidth={4.5} strokeLinejoin="round" />
    {[24, 38, 52].map((y) => <rect key={y} x={32} y={y} width={y === 52 ? 20 : 36} height={6} rx={3} fill={K.ink} />)}
    <rect x={32} y={66} width={36} height={10} rx={3} fill={K.red} />
  </Svg>
);
export const TicketGlyph: React.FC<{size: number}> = ({size}) => (
  <Svg size={size}>
    <rect x={14} y={18} width={72} height={66} rx={8} fill="#FFFFFF" stroke={K.ink} strokeWidth={4.5} />
    <rect x={14} y={18} width={72} height={18} rx={6} fill={PX.navy} stroke={K.ink} strokeWidth={4.5} />
    <circle cx={34} cy={58} r={11} fill={K.yellow} stroke={K.ink} strokeWidth={4} />
    {[50, 62].map((y) => <rect key={y} x={50} y={y} width={26} height={6} rx={3} fill={K.ink} />)}
  </Svg>
);
export const BallotGlyph: React.FC<{size: number}> = ({size}) => (
  <Svg size={size}>
    <rect x={30} y={10} width={40} height={36} rx={4} fill="#FFFFFF" stroke={K.ink} strokeWidth={4.5} />
    <path d="M 40 28 L 47 35 L 60 20" stroke={K.red} strokeWidth={5} fill="none" strokeLinecap="round" />
    <rect x={14} y={38} width={72} height={52} rx={6} fill="#B8BCC8" stroke={K.ink} strokeWidth={4.5} />
    <rect x={30} y={38} width={40} height={7} fill={K.ink} />
  </Svg>
);
export const EnvelopeGlyph: React.FC<{size: number; color?: string}> = ({size, color = '#FFFFFF'}) => (
  <Svg size={size}>
    <rect x={10} y={24} width={80} height={56} rx={8} fill={color} stroke={K.ink} strokeWidth={4.5} />
    <path d="M 12 28 L 50 56 L 88 28" stroke={K.ink} strokeWidth={4.5} fill="none" strokeLinejoin="round" />
    <path d="M 50 38 Q 42 30 38 36 Q 34 44 50 52 Q 66 44 62 36 Q 58 30 50 38 Z" fill={K.red} />
  </Svg>
);
export const PhotoGlyph: React.FC<{size: number}> = ({size}) => (
  <Svg size={size}>
    <rect x={10} y={18} width={80} height={64} rx={10} fill="#FFFFFF" stroke={K.ink} strokeWidth={4.5} />
    <path d="M 16 76 L 38 46 L 54 64 L 64 54 L 84 76 Z" fill={PX.teal} />
    <circle cx={68} cy={36} r={8} fill={K.yellow} stroke={K.ink} strokeWidth={3} />
  </Svg>
);
export const PinGlyph: React.FC<{size: number}> = ({size}) => (
  <Svg size={size}>
    <path d="M 50 94 Q 18 56 18 38 A 32 32 0 0 1 82 38 Q 82 56 50 94 Z" fill={K.red} stroke={K.ink} strokeWidth={4.5} />
    <circle cx={50} cy={38} r={12} fill="#FFFFFF" stroke={K.ink} strokeWidth={4} />
  </Svg>
);
export const HeartGlyph: React.FC<{size: number; color?: string}> = ({size, color = K.red}) => (
  <Svg size={size}>
    <path d="M 50 86 Q 10 58 12 34 Q 14 14 34 14 Q 46 14 50 28 Q 54 14 66 14 Q 86 14 88 34 Q 90 58 50 86 Z" fill={color} stroke={K.ink} strokeWidth={5} strokeLinejoin="round" />
  </Svg>
);

/** A red X drawn on in two strokes (q 0→1). Place inside an absolutely positioned box of w×h. */
export const CrossOut: React.FC<{q: number; w: number; h: number; color?: string; sw?: number}> = ({q, w, h, color = K.red, sw = 12}) => {
  if (q <= 0.001) return null;
  const a = Math.min(1, q * 2), b = Math.max(0, q * 2 - 1);
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <line x1={0} y1={0} x2={w * a} y2={h * a} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      {b > 0.001 && <line x1={w} y1={0} x2={w - w * b} y2={h * b} stroke={color} strokeWidth={sw} strokeLinecap="round" />}
    </svg>
  );
};
/** Hand-drawn-free flat ring drawn on clockwise (q 0→1) around a w×h box (ellipse). */
export const RingOn: React.FC<{q: number; w: number; h: number; color?: string; sw?: number}> = ({q, w, h, color = K.red, sw = 8}) => {
  if (q <= 0.001) return null;
  const rx = w / 2, ry = h / 2;
  const n = 64, m = Math.max(2, Math.round(n * q));
  const pts = Array.from({length: m + 1}, (_, i) => {
    const a = -Math.PI * 0.62 + (i / n) * Math.PI * 2.08;
    return `${(rx + Math.cos(a) * rx).toFixed(1)} ${(ry + Math.sin(a) * ry).toFixed(1)}`;
  });
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d={`M ${pts.join(' L ')}`} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ---------- avatars ----------
/** The scammer's profile photo: a pretty flower (round). */
export const FlowerAvatar: React.FC<{size: number}> = ({size}) => (
  <Svg size={size} style={{flexShrink: 0}}>
    <circle cx={50} cy={50} r={48} fill="#F7D6DC" />
    <path d="M 50 96 L 50 62" stroke={PX.smsGreen} strokeWidth={6} />
    <ellipse cx={64} cy={80} rx={12} ry={6} fill={PX.smsGreen} transform="rotate(-30 64 80)" />
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx={50} cy={28} rx={12} ry={17} fill={a % 144 ? '#FFFFFF' : PX.pink} stroke={K.ink} strokeWidth={3} transform={`rotate(${a} 50 46)`} />
    ))}
    <circle cx={50} cy={46} r={10} fill={K.yellow} stroke={K.ink} strokeWidth={3} />
    <circle cx={50} cy={50} r={48} fill="none" stroke={K.ink} strokeWidth={3} />
  </Svg>
);
/** Unknown-contact grey avatar. */
export const UnknownAvatar: React.FC<{size: number}> = ({size}) => (
  <Svg size={size} style={{flexShrink: 0}}>
    <circle cx={50} cy={50} r={48} fill="#B8BCC8" />
    <circle cx={50} cy={40} r={16} fill="#FFFFFF" />
    <path d="M 20 86 Q 22 62 50 62 Q 78 62 80 86 Z" fill="#FFFFFF" />
  </Svg>
);
/** Dita — the real friend (bun hair, teal backdrop). */
export const FriendAvatar: React.FC<{size: number}> = ({size}) => (
  <Svg size={size} style={{flexShrink: 0}}>
    <defs><clipPath id={`fr-${size}`}><circle cx={50} cy={50} r={48} /></clipPath></defs>
    <g clipPath={`url(#fr-${size})`}>
      <rect x={0} y={0} width={100} height={100} fill="#7CC7B8" />
      <path d="M 14 104 Q 16 76 50 74 Q 84 76 86 104 Z" fill="#F2B731" stroke={K.ink} strokeWidth={3} />
      <circle cx={50} cy={20} r={13} fill="#5A3A2E" stroke={K.ink} strokeWidth={3} />
      <ellipse cx={50} cy={48} rx={23} ry={25} fill={K.skin} stroke={K.ink} strokeWidth={3} />
      <path d="M 27 46 Q 26 22 50 22 Q 74 22 73 46 Q 64 32 50 32 Q 36 32 27 46 Z" fill="#5A3A2E" stroke={K.ink} strokeWidth={3} strokeLinejoin="round" />
      <circle cx={41} cy={50} r={3.4} fill={K.ink} /><circle cx={59} cy={50} r={3.4} fill={K.ink} />
      <path d="M 42 59 Q 50 66 58 59" stroke={K.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
      <ellipse cx={34} cy={58} rx={5} ry={3} fill={K.blush} /><ellipse cx={66} cy={58} rx={5} ry={3} fill={K.blush} />
    </g>
    <circle cx={50} cy={50} r={48} fill="none" stroke={K.ink} strokeWidth={3} />
  </Svg>
);

// ---------- hands + cursor (DOM, positioned by the fingertip) ----------
/** Pointing hand; (x, y) = fingertip. rot 0 = pointing up, arm coming from below. press 0..1 shortens toward the tip. */
export const Finger: React.FC<{x: number; y: number; rot?: number; skin?: string; sleeve?: string; press?: number; scale?: number; arm?: number}> = ({
  x, y, rot = 0, skin = K.skin, sleeve = K.pj, press = 0, scale = 1, arm = 520,
}) => (
  <svg width={10} height={10} style={{position: 'absolute', left: x, top: y, overflow: 'visible', zIndex: 70}}>
    <g transform={`rotate(${rot}) scale(${(scale * (1 - press * 0.06)).toFixed(4)}) translate(0 ${(press * 10).toFixed(2)})`}>
      <path d={`M -64 ${150} L 64 ${150} L 58 ${150 + arm} L -58 ${150 + arm} Z`} fill={sleeve} stroke={K.ink} strokeWidth={5} strokeLinejoin="round" />
      <rect x={-62} y={140} width={124} height={34} rx={10} fill="#FFFFFF" stroke={K.ink} strokeWidth={5} />
      <path d="M -54 78 Q -58 60 -40 56 L 46 56 Q 62 58 58 80 L 54 128 Q 52 146 34 146 L -36 146 Q -54 146 -56 128 Z" fill={skin} stroke={K.ink} strokeWidth={5} strokeLinejoin="round" />
      <rect x={-18} y={0} width={36} height={92} rx={18} fill={skin} stroke={K.ink} strokeWidth={5} />
      <path d="M -10 14 Q 0 8 10 14" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
      <path d="M -50 80 Q -28 72 -18 82 M 18 84 Q 34 74 50 84" stroke={K.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  </svg>
);
/** Expanding tap ring at (x, y), k 0→1. */
export const TapRing: React.FC<{x: number; y: number; k: number; color?: string}> = ({x, y, k, color = K.yellow}) => {
  if (k <= 0 || k >= 1) return null;
  const r = 20 + k * 70;
  return <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `${(8 * (1 - k) + 2).toFixed(1)}px solid ${color}`,
    boxSizing: 'border-box', opacity: 1 - k, zIndex: 69}} />;
};
/** The remote "ghost" cursor: hollow arrow with a red outline + a tiny antenna badge. (x, y) = tip. */
export const GhostCursor: React.FC<{x: number; y: number; press?: number; q?: number}> = ({x, y, press = 0, q = 1}) => (
  q <= 0.001 ? null : (
    <svg width={10} height={10} style={{position: 'absolute', left: x, top: y, overflow: 'visible', zIndex: 72}}>
      <g transform={`scale(${(q * (1 - press * 0.12)).toFixed(4)})`}>
        <path d="M 6 8 L 6 98 L 30 76 L 46 112 L 64 104 L 48 70 L 80 68 Z" fill={K.ink} transform="translate(6 7)" opacity={0.35} />
        <path d="M 0 0 L 0 90 L 24 68 L 40 104 L 58 96 L 42 62 L 74 60 Z" fill="#FFFFFF" stroke={K.red} strokeWidth={7} strokeLinejoin="round" />
        <g transform="translate(70 92)">
          <circle cx={0} cy={0} r={22} fill={K.red} stroke={K.ink} strokeWidth={4} />
          <path d="M -8 6 Q 0 -6 8 6 M -13 1 Q 0 -16 13 1" stroke="#FFFFFF" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <circle cx={0} cy={8} r={3.5} fill="#FFFFFF" />
        </g>
      </g>
    </svg>
  )
);

// ---------- characters (SVG <g>, origin = feet centre) ----------
export type TrojanHat = 'none' | 'kurir' | 'tagihan' | 'tilang' | 'pps';
/** The .apk Trojan: the scam app's own box-with-gear icon grown little legs, a bandit mask and shifty eyes.
 *  walk = phase (radians, 0 = standing), look −1..1 = pupils left/right, lift = hop height, carry = holds the OTP slip. */
export const Trojan: React.FC<{walk?: number; look?: number; lift?: number; hat?: TrojanHat; carry?: string; lens?: number; grin?: boolean; legs?: number; sx?: number; sy?: number; lid?: number}> = ({
  walk = 0, look = 0, lift = 0, hat = 'none', carry, lens = 0, grin = true, legs = 1, sx = 1, sy = 1, lid = 0,
}) => {
  const swing = Math.sin(walk) * 26 * legs;
  const legL = 54 * legs;
  const bodyY = -legL - 4 - lift;
  const B = 136;
  return (
    <g transform={`scale(${sx.toFixed(4)} ${sy.toFixed(4)})`}>
      <ellipse cx={0} cy={2} rx={70} ry={12} fill={K.ink} opacity={0.25} />
      {/* legs */}
      {legs > 0.02 && [-1, 1].map((s) => {
        const a = (s * swing * Math.PI) / 180;
        const hx = s * 28, hy = bodyY + 4;
        const fx = hx + Math.sin(a) * legL, fy = hy + Math.cos(a) * legL - (s * Math.sin(walk) > 0 ? 6 : 0);
        return (
          <g key={s}>
            <line x1={hx} y1={hy} x2={fx} y2={fy} stroke={K.ink} strokeWidth={14} strokeLinecap="round" />
            <ellipse cx={fx + s * 6} cy={fy} rx={18} ry={9} fill={K.ink} />
          </g>
        );
      })}
      <g transform={`translate(0 ${bodyY.toFixed(2)})`}>
        {/* arms */}
        <path d={`M -64 -50 Q -96 -40 -92 ${carry || lens ? -100 : -10}`} stroke={K.ink} strokeWidth={12} fill="none" strokeLinecap="round" />
        <path d={`M 64 -50 Q 96 -40 ${carry ? 70 : 92} ${carry ? -120 : -10}`} stroke={K.ink} strokeWidth={12} fill="none" strokeLinecap="round" />
        {/* body = the app icon */}
        <rect x={-B / 2 + 6} y={-B + 8} width={B} height={B} rx={34} fill={K.ink} opacity={0.35} />
        <rect x={-B / 2} y={-B} width={B} height={B} rx={34} fill={PX.purple} stroke={K.ink} strokeWidth={5} />
        <path d={gearD(0, -40, 30)} fill="#FFFFFF" stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={0} cy={-40} r={10} fill={PX.purple} stroke={K.ink} strokeWidth={4} />
        {/* bandit mask + eyes */}
        <rect x={-B / 2 - 6} y={-118} width={B + 12} height={34} rx={14} fill={K.ink} />
        <path d={`M ${B / 2 + 4} -110 L ${B / 2 + 26} -122 L ${B / 2 + 22} -100 Z`} fill={K.ink} />
        {[-28, 28].map((ex) => (
          <g key={ex}>
            <ellipse cx={ex} cy={-101} rx={15} ry={11} fill="#FFFFFF" />
            <circle cx={ex + look * 7} cy={-100} r={6} fill={K.ink} />
            {lid > 0.01 && <rect x={ex - 16} y={-113} width={32} height={24 * lid} fill={K.ink} />}
          </g>
        ))}
        {/* grin */}
        {grin && <path d="M -26 -72 Q 0 -54 26 -72 Q 0 -64 -26 -72 Z" fill="#FFFFFF" stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />}
        {/* hats / costumes */}
        {hat === 'kurir' && (
          <g>
            <path d="M -62 -132 Q -60 -176 0 -178 Q 60 -176 62 -132 Z" fill={PX.orange} stroke={K.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d="M 30 -136 L 104 -132 Q 106 -122 96 -120 L 30 -124 Z" fill="#B85A2E" stroke={K.ink} strokeWidth={5} strokeLinejoin="round" />
            <rect x={-26} y={-168} width={40} height={18} rx={4} fill="#FFFFFF" stroke={K.ink} strokeWidth={3} />
          </g>
        )}
        {hat === 'tagihan' && (
          <g>
            {[-28, 28].map((ex) => <circle key={ex} cx={ex} cy={-101} r={20} fill="none" stroke={K.yellow} strokeWidth={6} />)}
            <line x1={-8} y1={-101} x2={8} y2={-101} stroke={K.yellow} strokeWidth={6} />
            <path d="M -12 0 L 12 0 L 8 34 L 0 46 L -8 34 Z" fill={K.red} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
            <rect x={-40} y={-148} width={80} height={14} rx={7} fill={K.ink} />
          </g>
        )}
        {hat === 'tilang' && (
          <g>
            <path d="M -60 -134 L -70 -170 Q 0 -196 70 -170 L 60 -134 Z" fill={PX.navy} stroke={K.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d="M -66 -136 L 66 -136 Q 70 -122 56 -120 L -56 -120 Q -70 -122 -66 -136 Z" fill={K.ink} />
            <path d="M 0 -176 L 10 -164 L 0 -150 L -10 -164 Z" fill={K.gold} stroke={K.ink} strokeWidth={3} />
          </g>
        )}
        {hat === 'pps' && (
          <g>
            <path d="M -52 -132 L -50 -168 Q 0 -178 50 -168 L 52 -132 Z" fill={K.ink} />
            <rect x={-52} y={-142} width={104} height={8} fill="#3A3F58" />
            <path d="M -40 -4 L 0 30 L 40 -4" stroke={K.red} strokeWidth={6} fill="none" />
            <rect x={-20} y={28} width={40} height={50} rx={6} fill="#FFFFFF" stroke={K.ink} strokeWidth={4} />
            <rect x={-12} y={38} width={24} height={14} rx={3} fill={PX.blue} />
          </g>
        )}
        {/* the copied OTP slip */}
        {carry && (
          <g transform="translate(70 -150) rotate(-8)">
            <rect x={-66} y={-34} width={132} height={60} rx={8} fill="#FFFFFF" stroke={K.ink} strokeWidth={4} />
            <text x={0} y={8} textAnchor="middle" fontFamily={UI} fontWeight={900} fontSize={28} fill={K.text} letterSpacing={1}>{carry}</text>
          </g>
        )}
        {/* magnifier */}
        {lens > 0.01 && (
          <g transform={`translate(-92 -112) scale(${lens.toFixed(4)})`}>
            <line x1={0} y1={0} x2={-14} y2={34} stroke={K.ink} strokeWidth={12} strokeLinecap="round" />
            <circle cx={8} cy={-26} r={30} fill="#CFE8F5" stroke={K.ink} strokeWidth={8} />
          </g>
        )}
      </g>
    </g>
  );
};

/** The hooded scammer (shadowy, original). Origin = feet centre, ~520 px tall. grin 0..1, holds an optional prop. */
export const Penipu: React.FC<{t: number; grin?: number; hold?: 'slip' | 'pad' | 'none'; look?: number; slip?: string; padPress?: number}> = ({
  t, grin = 0, hold = 'none', look = 0, slip, padPress = 0,
}) => {
  const br = Math.sin(t * 2.1) * 4;
  return (
    <g>
      <ellipse cx={0} cy={4} rx={150} ry={20} fill={PX.void} opacity={0.5} />
      <g transform={`translate(0 ${br.toFixed(2)})`}>
        {/* body / cloak */}
        <path d="M -150 0 Q -150 -250 -96 -300 L 96 -300 Q 150 -250 150 0 Z" fill={PX.hood} stroke={K.ink} strokeWidth={5} />
        <path d="M -40 -300 L 0 -230 L 40 -300 Z" fill={PX.hoodDark} />
        {/* hood */}
        <path d="M -128 -280 Q -150 -500 0 -510 Q 150 -500 128 -280 Q 90 -250 0 -252 Q -90 -250 -128 -280 Z" fill={PX.hood} stroke={K.ink} strokeWidth={5} />
        <path d="M -92 -300 Q -104 -456 0 -462 Q 104 -456 92 -300 Q 50 -282 0 -282 Q -50 -282 -92 -300 Z" fill={PX.void} />
        {/* eyes */}
        {[-1, 1].map((s) => (
          <path key={s} d={`M ${s * 66 + look * 8} -390 L ${s * 20 + look * 8} ${-372 + (grin * 6)} L ${s * 64 + look * 8} -368 Z`} fill="#FFFFFF" />
        ))}
        {/* grin */}
        <path d={`M -48 -334 Q 0 ${(-334 + 34 * (0.4 + grin * 0.6)).toFixed(1)} 48 -334 Q 0 ${(-334 + 14 * (0.4 + grin * 0.6)).toFixed(1)} -48 -334 Z`} fill="#FFFFFF" />
        {/* arms + prop */}
        {hold === 'pad' ? (
          <g>
            <path d="M -120 -200 Q -96 -120 -60 -126" stroke={PX.hood} strokeWidth={46} fill="none" strokeLinecap="round" />
            <path d="M 120 -200 Q 96 -120 60 -126" stroke={PX.hood} strokeWidth={46} fill="none" strokeLinecap="round" />
            <g transform="translate(0 -138)">
              <rect x={-98} y={-40} width={196} height={80} rx={40} fill="#3A3F58" stroke={K.ink} strokeWidth={5} />
              <circle cx={-52} cy={0} r={18} fill={K.ink} />
              <circle cx={44} cy={-10} r={10} fill={K.red} transform={`translate(0 ${(padPress * 3).toFixed(2)})`} />
              <circle cx={66} cy={8} r={10} fill={K.yellow} />
              <rect x={-14} y={-26} width={28} height={10} rx={4} fill={K.red} />
            </g>
          </g>
        ) : hold === 'slip' ? (
          <g>
            <path d="M -120 -200 Q -110 -120 -70 -110" stroke={PX.hood} strokeWidth={46} fill="none" strokeLinecap="round" />
            <path d="M 120 -220 Q 160 -300 132 -360" stroke={PX.hood} strokeWidth={46} fill="none" strokeLinecap="round" />
            {slip && (
              <g transform="translate(118 -410) rotate(10)">
                <rect x={-70} y={-32} width={140} height={60} rx={8} fill="#FFFFFF" stroke={K.ink} strokeWidth={4} />
                <text x={0} y={8} textAnchor="middle" fontFamily={UI} fontWeight={900} fontSize={28} fill={K.text} letterSpacing={1}>{slip}</text>
              </g>
            )}
          </g>
        ) : (
          <g>
            <path d="M -120 -200 Q -110 -120 -70 -110" stroke={PX.hood} strokeWidth={46} fill="none" strokeLinecap="round" />
            <path d="M 120 -200 Q 110 -120 70 -110" stroke={PX.hood} strokeWidth={46} fill="none" strokeLinecap="round" />
          </g>
        )}
      </g>
    </g>
  );
};

/** Flat wedding-invitation illustration (the real photo the friend sends). w×h box. */
export const WeddingArt: React.FC<{w: number; h: number; names?: string}> = ({w, h, names = 'Dita & Bayu'}) => (
  <svg width={w} height={h} viewBox="0 0 520 600" style={{display: 'block'}}>
    <rect x={0} y={0} width={520} height={600} fill="#9CCFC3" />
    <rect x={44} y={36} width={432} height={528} rx={18} fill={PX.cream} stroke={K.ink} strokeWidth={5} />
    <rect x={64} y={56} width={392} height={488} rx={12} fill="none" stroke="#D9B26A" strokeWidth={4} />
    {/* floral corners */}
    {[[64, 56, 1, 1], [456, 56, -1, 1], [64, 544, 1, -1], [456, 544, -1, -1]].map(([x, y, sx, sy], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
        <ellipse cx={34} cy={14} rx={22} ry={10} fill="#7FB07A" transform="rotate(20 34 14)" />
        <ellipse cx={14} cy={34} rx={10} ry={22} fill="#7FB07A" transform="rotate(-20 14 34)" />
        {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={22} cy={10} rx={8} ry={12} fill={i % 2 ? PX.pink : '#FFFFFF'} stroke={K.ink} strokeWidth={2.5} transform={`rotate(${a} 22 22)`} />)}
        <circle cx={22} cy={22} r={7} fill={K.yellow} stroke={K.ink} strokeWidth={2.5} />
      </g>
    ))}
    <text x={260} y={150} textAnchor="middle" fontFamily={UI} fontWeight={600} fontSize={26} fill="#8A6A3A" letterSpacing={6}>UNDANGAN</text>
    <text x={260} y={190} textAnchor="middle" fontFamily={UI} fontWeight={600} fontSize={26} fill="#8A6A3A" letterSpacing={6}>PERNIKAHAN</text>
    {/* rings */}
    <circle cx={238} cy={276} r={36} fill="none" stroke="#D9A21F" strokeWidth={11} />
    <circle cx={284} cy={276} r={36} fill="none" stroke="#E8B93A" strokeWidth={11} />
    <path d="M 284 232 L 292 222 L 300 232 L 292 242 Z" fill="#CFE8F5" stroke={K.ink} strokeWidth={2.5} />
    <text x={260} y={392} textAnchor="middle" fontFamily="'Chat Head', sans-serif" fontWeight={800} fontSize={52} fill={K.text} letterSpacing={-1}>{names}</text>
    <rect x={170} y={420} width={180} height={4} rx={2} fill="#D9B26A" />
    <text x={260} y={470} textAnchor="middle" fontFamily={UI} fontWeight={500} fontSize={24} fill="#6B5A3A">kami mengundang kamu</text>
    <text x={260} y={502} textAnchor="middle" fontFamily={UI} fontWeight={500} fontSize={24} fill="#6B5A3A">ke hari bahagia kami</text>
  </svg>
);

// ===================================================================== screens
// The phone shell (pose-driven, with an unclipped overlay layer for hands / critters that leave the phone), a generic
// chat feed engine (typing → pop, auto-scroll, delete-collapse), contact bar, attachment + image bubbles, heads-up
// notifications, lock screen, home screen, bank app, dialogs and menus. Screen space = SCR.w × SCR.h (792×1282).

// ---------- phone shell ----------
const O = {x: PHONE.w / 2, y: PHONE.h / 2};
/** Where the phone sits on the canvas at rest: its centre (cx, cy) and a base scale. Portrait = the 820×1310 panel at
 *  (130, 330), scale 1, the bedroom above/behind it. Landscape = the phone on the right (centre 1330, 540, scale 0.76,
 *  996 px tall) with the bedroom + character on the left ⅔ and the caption over the left column. A pose is relative to
 *  the anchor (pose.x/y in canvas px, pose.s multiplies the anchor scale). */
export type PhoneAnchor = {cx: number; cy: number; s: number};
export const PHONE_ANCHOR_PORTRAIT: PhoneAnchor = {cx: PHONE.x + PHONE.w / 2, cy: PHONE.y + PHONE.h / 2, s: 1};
export const PHONE_ANCHOR_LANDSCAPE: PhoneAnchor = {cx: 1330, cy: 540, s: 0.76};
export const phoneAnchor = (fr: Frame): PhoneAnchor => (fr.wide ? PHONE_ANCHOR_LANDSCAPE : PHONE_ANCHOR_PORTRAIT);
/** Phone-local point (px from the phone's top-left, bezel included) → canvas point, for a given pose (pass
 *  `phoneAnchor(fr)` on a wide frame). */
export const toGlobal = (pose: Pose, lx: number, ly: number, a: PhoneAnchor = PHONE_ANCHOR_PORTRAIT) => {
  const r = (pose.r * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r), k = pose.s * a.s;
  const dx = (lx - O.x) * k, dy = (ly - O.y) * k;
  return {x: a.cx + pose.x + dx * c - dy * s, y: a.cy + pose.y + dx * s + dy * c};
};
/** Canvas point → phone-local point. */
export const toLocal = (pose: Pose, gx: number, gy: number, a: PhoneAnchor = PHONE_ANCHOR_PORTRAIT) => {
  const r = (-pose.r * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r), k = pose.s * a.s;
  const dx = gx - a.cx - pose.x, dy = gy - a.cy - pose.y;
  return {x: O.x + (dx * c - dy * s) / k, y: O.y + (dx * s + dy * c) / k};
};

/** The phone: flat bezel + hard offset shadow, `screen` clipped to the rounded screen, `overlay` unclipped (hands, the
 *  Trojan leaving the phone). Placed at `anchor` (default: phoneAnchor of the composition's frame). */
export const PhoneShell: React.FC<{pose: Pose; screen: React.ReactNode; overlay?: React.ReactNode; dim?: number; anchor?: PhoneAnchor}> = ({pose, screen, overlay, dim = 0, anchor}) => {
  const fr = useFrame();
  const a = anchor ?? phoneAnchor(fr);
  const halus = useHalus('CHAT').full;
  return (
    <div style={{position: 'absolute', left: a.cx - O.x, top: a.cy - O.y, width: PHONE.w, height: PHONE.h, transformOrigin: `${O.x}px ${O.y}px`,
      transform: `translate(${pose.x.toFixed(2)}px, ${pose.y.toFixed(2)}px) rotate(${pose.r.toFixed(3)}deg) scale(${(pose.s * a.s).toFixed(4)})`}}>
      {/* HALUS full (v1.16): soft ink shadow under the phone (the hard offset shadow stays on top of it) */}
      {halus && <div style={{position: 'absolute', left: 10, top: 46, width: PHONE.w, height: PHONE.h, borderRadius: 64, background: K.bezel, opacity: 0.5, filter: 'blur(34px)'}} />}
      <div style={{position: 'absolute', left: 18, top: 22, width: PHONE.w, height: PHONE.h, borderRadius: 56, background: '#191C40'}} />
      <div style={{position: 'absolute', left: PHONE.w - 2, top: 260, width: 10, height: 120, borderRadius: 4, background: '#0B0C0F'}} />
      <div style={{position: 'absolute', left: -8, top: 230, width: 10, height: 80, borderRadius: 4, background: '#0B0C0F'}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: PHONE.w, height: PHONE.h, borderRadius: 56, background: K.bezel}} />
      <div style={{position: 'absolute', left: PHONE.bezel, top: PHONE.bezel, width: SCR.w, height: SCR.h, borderRadius: 44, overflow: 'hidden', background: K.paper}}>
        {screen}
        {dim > 0.001 && <div style={{position: 'absolute', inset: 0, background: K.bezel, opacity: dim}} />}
      </div>
      {overlay && <div style={{position: 'absolute', left: PHONE.bezel, top: PHONE.bezel, width: SCR.w, height: SCR.h}}>{overlay}</div>}
    </div>
  );
};

/** Reveal a screen inside a rounded rect growing from `from` (screen px) to the full screen (q 0→1). */
export const GrowClip: React.FC<{q: number; from: {x: number; y: number; w: number; h: number; r: number}; follow?: boolean; children: React.ReactNode}> = ({q, from, follow, children}) => {
  if (q <= 0.001) return null;
  const top = from.y * (1 - q), left = from.x * (1 - q);
  const right = (SCR.w - from.x - from.w) * (1 - q), bottom = (SCR.h - from.y - from.h) * (1 - q);
  const r = from.r + (44 - from.r) * q;
  const clip = q >= 0.999 ? undefined : `inset(${top.toFixed(1)}px ${right.toFixed(1)}px ${bottom.toFixed(1)}px ${left.toFixed(1)}px round ${r.toFixed(1)}px)`;
  if (!follow) return <div style={{position: 'absolute', inset: 0, clipPath: clip}}>{children}</div>;
  // follow: the content scales with the window (an app zooming out of its icon)
  const sx = (SCR.w - left - right) / SCR.w, sy = (SCR.h - top - bottom) / SCR.h;
  return (
    <div style={{position: 'absolute', inset: 0, clipPath: clip}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: q >= 0.999 ? undefined : `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`}}>{children}</div>
    </div>
  );
};

// ---------- contact bar ----------
export const ContactBar: React.FC<{avatar: React.ReactNode; title: React.ReactNode; sub: string; subHot?: boolean; titleHi?: number; lock?: number; dark?: boolean}> = ({
  avatar, title, sub, subHot, titleHi = 0, lock = 0,
}) => (
  <div style={{position: 'absolute', left: 0, top: SCR.status, width: SCR.w, height: SCR.bar, background: K.bar, display: 'flex', alignItems: 'center',
    padding: '0 28px 6px 18px', boxSizing: 'border-box', gap: 16}}>
    <svg width={30} height={44} viewBox="0 0 30 44"><path d="M 22 6 L 8 22 L 22 38" stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    <div style={{position: 'relative', width: 80, height: 80, flexShrink: 0}}>
      {avatar}
      {lock > 0.001 && (
        <div style={{position: 'absolute', right: -8, bottom: -6, width: 42, height: 42, borderRadius: 21, background: K.red, border: `4px solid ${K.bar}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${lock.toFixed(4)})`}}>
          <LockGlyph size={26} color="#FFFFFF" body={K.red} />
        </div>
      )}
    </div>
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0}}>
      <div style={{alignSelf: 'flex-start', fontFamily: UI, fontWeight: 800, fontSize: 34, color: '#FFFFFF', letterSpacing: -0.5, whiteSpace: 'nowrap',
        background: titleHi > 0.01 ? `rgba(229,72,77,${(titleHi * 0.95).toFixed(3)})` : undefined, borderRadius: 12, padding: '0 10px', marginLeft: -10}}>{title}</div>
      <div style={{fontFamily: UI, fontWeight: subHot ? 600 : 500, fontSize: 25, color: subHot ? K.yellow : K.barSub, whiteSpace: 'nowrap'}}>{sub}</div>
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 6, padding: '0 4px'}}>
      {[0, 1, 2].map((i) => <div key={i} style={{width: 8, height: 8, borderRadius: 4, background: '#FFFFFF'}} />)}
    </div>
  </div>
);

// ---------- feed engine ----------
export type FeedItem = {
  key: string; at: number; typeAt?: number; h: number; gap: number; align: 'in' | 'out' | 'center';
  avatar?: React.ReactNode; goneAt?: number; extra?: {at: number; h: number}; node: (t: number) => React.ReactNode;
};
const slotOf = (it: FeedItem, t: number) => {
  const full = it.h + it.gap;
  let v: number;
  if (it.typeAt !== undefined) {
    if (t < it.typeAt) v = 0;
    else if (t < it.at) v = (TYPING_H + it.gap) * (it.typeAt < 0 ? 1 : eout(t, it.typeAt, it.typeAt + 0.26));
    else v = TYPING_H + it.gap + (full - TYPING_H - it.gap) * eout(t, it.at, it.at + 0.24);
  } else v = it.at < 0 ? full : full * eout(t, it.at - 0.02, it.at + 0.26);
  if (it.extra) v += it.extra.h * eout(t, it.extra.at, it.extra.at + 0.2);
  if (it.goneAt !== undefined) v *= 1 - eio(t, it.goneAt + 0.34, it.goneAt + 0.62);
  return v;
};
/** Layout at time t: each visible row's top (in feed px, after auto-scroll) — use for fingers / highlights. */
export const feedLayout = (items: FeedItem[], t: number, height: number, pad = 22) => {
  let y = pad;
  const rows: Array<{it: FeedItem; y: number}> = [];
  for (const it of items) {
    const s = slotOf(it, t);
    if (s > 0.01) rows.push({it, y});
    y += s;
  }
  const offset = Math.max(0, y + 20 - height);
  return rows.map((r) => ({...r, y: r.y - offset}));
};
export const ChatFeed: React.FC<{t: number; items: FeedItem[]; top?: number; height?: number; wallpaper?: boolean}> = ({
  t, items, top = SCR.status + SCR.bar, height = SCR.h - SCR.status - SCR.bar - SCR.input, wallpaper = true,
}) => {
  const rows = feedLayout(items, t, height);
  return (
    <div style={{position: 'absolute', left: 0, top, width: SCR.w, height, overflow: 'hidden', background: K.paper}}>
      {wallpaper && <Wallpaper w={SCR.w} h={height} />}
      {rows.map(({it, y: yy}) => {
        if (yy > height + 40 || yy + it.h < -60) return null;
        if (it.goneAt !== undefined && t > it.goneAt + 0.62) return null;
        const typing = it.typeAt !== undefined && t < it.at;
        const q = typing ? (it.typeAt! < 0 ? 1 : pop(t, it.typeAt!, 0.3)) : it.at < 0 ? 1 : pop(t, it.at, 0.34);
        const origin = it.align === 'in' ? '0% 100%' : it.align === 'out' ? '100% 100%' : '50% 50%';
        return (
          <div key={it.key} style={{position: 'absolute', left: 0, top: yy, width: SCR.w, padding: '0 24px', boxSizing: 'border-box', display: 'flex',
            justifyContent: it.align === 'in' ? 'flex-start' : it.align === 'out' ? 'flex-end' : 'center', alignItems: 'flex-start', gap: 14}}>
            {it.avatar && <div style={{transform: `scale(${Math.min(1, q).toFixed(4)})`, flexShrink: 0, marginTop: 4}}>{it.avatar}</div>}
            <div style={{transform: `scale(${q.toFixed(4)})`, transformOrigin: origin}}>
              {typing ? <TypingBubble t={t} /> : it.node(t)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Bottom input bar (1:1 chats) — or a "blocked" strip. */
export const ChatInput: React.FC<{text?: string; blocked?: number}> = ({text = '', blocked = 0}) => (
  <div style={{position: 'absolute', left: 0, top: SCR.h - SCR.input, width: SCR.w, height: SCR.input, background: K.inputBg, borderTop: `3px solid ${K.line}`,
    boxSizing: 'border-box', overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px', transform: `translateY(${(-blocked * SCR.input).toFixed(1)}px)`}}>
      <div style={{width: 60, height: 60, borderRadius: 30, background: '#E4DDD0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width={28} height={28} viewBox="0 0 28 28"><path d="M 14 3 L 14 25 M 3 14 L 25 14" stroke="#6B6F78" strokeWidth={4} strokeLinecap="round" /></svg>
      </div>
      <div style={{flex: 1, height: 74, borderRadius: 37, background: '#FFFFFF', border: `3px solid ${K.line}`, boxSizing: 'border-box', display: 'flex',
        alignItems: 'center', padding: '0 26px', fontFamily: UI, fontWeight: text ? 700 : 500, fontSize: 30, color: text ? K.text : K.time, whiteSpace: 'nowrap', overflow: 'hidden'}}>
        {text || 'Ketik pesan…'}
        {text && <div style={{width: 3, height: 38, background: K.text, marginLeft: 3, borderRadius: 2}} />}
      </div>
      <div style={{width: 74, height: 74, borderRadius: 37, background: K.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 0 ${K.outShadow}`}}>
        <svg width={38} height={38} viewBox="0 0 38 38"><path d="M 6 19 L 32 6 L 25 32 L 19 22 Z" fill={K.text} stroke={K.text} strokeWidth={3} strokeLinejoin="round" /></svg>
      </div>
    </div>
    <div style={{position: 'absolute', left: 0, top: SCR.input, width: SCR.w, height: SCR.input, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
      transform: `translateY(${(-blocked * SCR.input).toFixed(1)}px)`, fontFamily: UI, fontWeight: 700, fontSize: 28, color: K.red}}>
      <LockGlyph size={34} color={K.red} body={K.inputBg} /> Kamu memblokir kontak ini
    </div>
  </div>
);

// ---------- bubbles ----------
export const FILE_H = 236;
/** Incoming attachment bubble (no name: 1:1 chat). `ext` is drawn red; extra overlays via children (positioned in the card). */
export const FileBubble: React.FC<{lines: React.ReactNode[]; ext: React.ReactNode; size: string; glyph?: React.ReactNode; time: string; w?: number; children?: React.ReactNode; dl?: React.ReactNode}> = ({
  lines, ext, size, glyph, time, w = 600, children, dl,
}) => (
  <div style={{position: 'relative', width: w, height: FILE_H, background: K.inB, borderRadius: 28, boxShadow: `0 4px 0 ${K.bShadow}`, padding: '16px 16px 0', boxSizing: 'border-box'}}>
    <div style={{position: 'relative', height: 172, borderRadius: 20, background: K.inputBg, display: 'flex', alignItems: 'center', gap: 16, padding: '0 18px', boxSizing: 'border-box'}}>
      <div style={{flexShrink: 0}}>{glyph ?? <FileGlyph size={112} ext="APK" />}</div>
      <div style={{flex: 1, minWidth: 0}}>
        {lines.map((ln, i) => (
          <div key={i} style={{fontFamily: UI, fontWeight: 800, fontSize: 31, lineHeight: '40px', color: K.text, whiteSpace: 'nowrap', letterSpacing: -0.4}}>
            {ln}{i === lines.length - 1 && ext}
          </div>
        ))}
        <div style={{fontFamily: UI, fontWeight: 600, fontSize: 24, color: K.time, marginTop: 4}}>{size}</div>
      </div>
      <div style={{flexShrink: 0}}>{dl ?? <DownloadBtn />}</div>
    </div>
    <div style={{height: 46, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontFamily: UI, fontWeight: 500, fontSize: 22, color: K.time}}>{time}</div>
    {children}
  </div>
);
export const DownloadBtn: React.FC<{size?: number}> = ({size = 70}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, background: K.bar, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 40 40"><path d="M 20 6 L 20 28 M 10 19 L 20 29 L 30 19 M 8 34 L 32 34" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </div>
);
export const IMG_H = 16 + 560 + 16 + 48 + 30 + 12;
/** Incoming photo bubble (flat wedding card illustration) + a caption line. */
export const ImageBubble: React.FC<{caption: React.ReactNode; time: string; children?: React.ReactNode}> = ({caption, time, children}) => (
  <div style={{position: 'relative', width: 520, height: IMG_H, background: K.inB, borderRadius: 28, boxShadow: `0 4px 0 ${K.bShadow}`, padding: 16, boxSizing: 'border-box'}}>
    <div style={{position: 'relative', borderRadius: 18, overflow: 'hidden', width: 488, height: 560}}>
      <WeddingArt w={488} h={560} />
      {children}
    </div>
    <div style={{fontFamily: UI, fontWeight: 600, fontSize: 34, lineHeight: '48px', color: K.text, marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap'}}>{caption}</div>
    <div style={{height: 30, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontFamily: UI, fontWeight: 500, fontSize: 22, color: K.time}}>{time}</div>
  </div>
);
/** Plain text bubble without a name (1:1 chats) — height helper. */
export const textH = (lines: number) => outH(lines);

export const SYS_H = 232;
/** "Not in your contacts" system card (unknown numbers): avatar, number, warning, Blokir / Tambah buttons. */
export const UnknownCard: React.FC<{num: string; hi?: number; press?: number; blocked?: number}> = ({num, hi = 0, press = 0, blocked = 0}) => (
  <div style={{position: 'relative', width: 700, height: SYS_H, borderRadius: 28, background: '#FFFFFF', boxShadow: `0 4px 0 ${K.bShadow}`, padding: '20px 24px', boxSizing: 'border-box'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <FlowerAvatar size={84} />
      <div style={{flex: 1}}>
        <div style={{fontFamily: UI, fontWeight: 800, fontSize: 33, color: K.text, letterSpacing: -0.3}}>{num}</div>
        <div style={{alignSelf: 'flex-start', display: 'inline-block', marginTop: 4, fontFamily: UI, fontWeight: 700, fontSize: 25, color: hi > 0.5 ? '#FFFFFF' : K.red,
          background: hi > 0.01 ? `rgba(229,72,77,${hi.toFixed(3)})` : 'transparent', borderRadius: 10, padding: '2px 10px', marginLeft: -10}}>Tidak ada di kontak kamu</div>
      </div>
    </div>
    <div style={{display: 'flex', gap: 18, marginTop: 20}}>
      <div style={{flex: 1, height: 70, borderRadius: 35, border: `4px solid ${K.red}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        fontFamily: UI, fontWeight: 800, fontSize: 30, color: blocked > 0.5 ? '#FFFFFF' : K.red, background: blocked > 0.5 ? K.red : '#FFFFFF', transform: `scale(${(1 - press * 0.08).toFixed(4)})`}}>
        <LockGlyph size={30} color={blocked > 0.5 ? '#FFFFFF' : K.red} body={blocked > 0.5 ? K.red : '#FFFFFF'} />{blocked > 0.5 ? 'Diblokir' : 'Blokir'}
      </div>
      <div style={{flex: 1, height: 70, borderRadius: 35, background: K.bar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UI, fontWeight: 800, fontSize: 30,
        color: '#FFFFFF', opacity: blocked > 0.5 ? 0.35 : 1}}>+ Tambah</div>
    </div>
  </div>
);

// ---------- notifications ----------
export const Notif: React.FC<{icon: React.ReactNode; app: string; when?: string; avatar?: React.ReactNode; title: React.ReactNode; body: React.ReactNode; w?: number; tag?: React.ReactNode}> = ({
  icon, app, when = 'sekarang', avatar, title, body, w = SCR.w - 40, tag,
}) => (
  <div style={{position: 'relative', width: w, background: '#FFFFFF', borderRadius: 36, boxShadow: `0 6px 0 ${K.bShadow}`, padding: '20px 26px 24px', boxSizing: 'border-box', border: `3px solid ${K.line}`}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: UI, fontWeight: 600, fontSize: 24, color: K.time}}>
      {icon}<span style={{color: K.text, fontWeight: 700}}>{app}</span><span>· {when}</span>{tag && <span style={{marginLeft: 'auto'}}>{tag}</span>}
    </div>
    <div style={{display: 'flex', alignItems: 'flex-start', gap: 18, marginTop: 14}}>
      {avatar}
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontFamily: UI, fontWeight: 800, fontSize: 33, color: K.text, letterSpacing: -0.3, whiteSpace: 'nowrap'}}>{title}</div>
        <div style={{fontFamily: UI, fontWeight: 500, fontSize: 29, lineHeight: '38px', color: '#4A4E58', marginTop: 4}}>{body}</div>
      </div>
    </div>
  </div>
);

// ---------- lock + home screens ----------
const NightWall: React.FC = React.memo(() => (
  <svg width={SCR.w} height={SCR.h} style={{position: 'absolute', left: 0, top: 0}}>
    <rect x={0} y={0} width={SCR.w} height={SCR.h} fill={K.wall} />
    <path d={`M 0 ${SCR.h - 300} Q 200 ${SCR.h - 380} 400 ${SCR.h - 320} Q 600 ${SCR.h - 260} ${SCR.w} ${SCR.h - 340} L ${SCR.w} ${SCR.h} L 0 ${SCR.h} Z`} fill={K.wallDark} />
    <path d={`M 0 ${SCR.h - 170} Q 260 ${SCR.h - 240} 520 ${SCR.h - 180} Q 680 ${SCR.h - 150} ${SCR.w} ${SCR.h - 200} L ${SCR.w} ${SCR.h} L 0 ${SCR.h} Z`} fill={K.glass} />
    <circle cx={664} cy={452} r={56} fill={K.moon} />
    <circle cx={690} cy={432} r={49} fill={K.wall} />
    <Star x={150} y={240} r={12} fill={K.moon} /><Star x={690} y={520} r={9} fill={K.moon} /><Star x={250} y={600} r={8} fill={K.moon} /><Star x={460} y={170} r={7} fill={K.moon} />
  </svg>
));
export const LockScreen: React.FC<{time: string; date: string; children?: React.ReactNode}> = ({time, date, children}) => (
  <div style={{position: 'absolute', inset: 0}}>
    <NightWall />
    <StatusBar dark={false} time={time} />
    <div style={{position: 'absolute', left: 0, top: 120, width: SCR.w, display: 'flex', justifyContent: 'center'}}><LockGlyph size={44} color="#FFFFFF" body={K.wall} /></div>
    <div style={{position: 'absolute', left: 0, top: 176, width: SCR.w, textAlign: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: 200, lineHeight: 1, color: '#FFFFFF', letterSpacing: -4}}>{time}</div>
    <div style={{position: 'absolute', left: 0, top: 396, width: SCR.w, textAlign: 'center', fontFamily: UI, fontWeight: 600, fontSize: 34, color: K.barSub}}>{date}</div>
    {children}
  </div>
);

export type HomeApp = {id: string; label: string; icon: (s: number) => React.ReactNode};
export const HOME_APPS: HomeApp[] = [
  {id: 'obrol', label: 'Obrol', icon: (s) => <ObrolIcon size={s} />},
  {id: 'sms', label: 'Pesan', icon: (s) => <SmsIcon size={s} />},
  {id: 'cam', label: 'Kamera', icon: (s) => <CameraIcon size={s} />},
  {id: 'gal', label: 'Galeri', icon: (s) => <GalleryIcon size={s} />},
  {id: 'bank', label: 'BANK', icon: (s) => <BankIcon size={s} />},
  {id: 'note', label: 'Catatan', icon: (s) => <NoteIcon size={s} />},
  {id: 'clock', label: 'Jam', icon: (s) => <ClockIcon size={s} />},
  {id: 'set', label: 'Setelan', icon: (s) => <SettingsIcon size={s} />},
  {id: 'apk', label: 'Undangan', icon: (s) => <GearBox size={s} />},
];
export const HOME_ICON = 128;
/** Icon centre (screen px) of grid slot i (4 columns). */
export const homeSlot = (i: number) => ({x: 108 + (i % 4) * 192, y: 640 + Math.floor(i / 4) * 214});
export const HomeScreen: React.FC<{time: string; t: number; hide?: string[]; wiggle?: Record<string, number>; move?: Record<string, {dx: number; dy: number; s?: number}>; children?: React.ReactNode}> = ({
  time, hide = [], wiggle = {}, move = {}, children,
}) => (
  <div style={{position: 'absolute', inset: 0}}>
    <NightWall />
    <StatusBar dark={false} time={time} />
    <div style={{position: 'absolute', left: 52, top: 380, fontFamily: HEAD, fontWeight: 800, fontSize: 116, lineHeight: 1, color: '#FFFFFF', letterSpacing: -2}}>{time}</div>
    <div style={{position: 'absolute', left: 58, top: 500, fontFamily: UI, fontWeight: 600, fontSize: 28, color: K.barSub}}>Sabtu malam</div>
    {HOME_APPS.map((a, i) => {
      const c = homeSlot(i);
      const hidden = hide.includes(a.id);
      const mv = move[a.id];
      const w = wiggle[a.id] ?? 0;
      return (
        <div key={a.id} style={{position: 'absolute', left: c.x - 90, top: c.y - HOME_ICON / 2, width: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
          {hidden ? (
            <div style={{width: HOME_ICON - 16, height: HOME_ICON - 16, margin: 8, borderRadius: 28, border: '4px dashed #8A8FC0', boxSizing: 'border-box'}} />
          ) : (
            <div style={{transform: `translate(${(mv?.dx ?? 0).toFixed(1)}px, ${(mv?.dy ?? 0).toFixed(1)}px) rotate(${(w * 8).toFixed(2)}deg) scale(${(mv?.s ?? 1).toFixed(4)})`}}>{a.icon(HOME_ICON)}</div>
          )}
          <div style={{fontFamily: UI, fontWeight: 600, fontSize: 25, color: '#FFFFFF', whiteSpace: 'nowrap', opacity: hidden ? 0.5 : 1}}>{a.label}</div>
        </div>
      );
    })}
    <div style={{position: 'absolute', left: SCR.w / 2 - 110, top: SCR.h - 34, width: 220, height: 10, borderRadius: 5, background: '#FFFFFF', opacity: 0.8}} />
    {children}
  </div>
);

// ---------- bank app (generic, no real bank) ----------
export const fmtRp = (n: number) => 'Rp' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const BankScreen: React.FC<{t: number; balance: number; rows: Array<{at: number; label: string; amount: string}>; zero?: number; time?: string}> = ({t, balance, rows, zero = 0, time = '23:05'}) => (
  <div style={{position: 'absolute', inset: 0, background: '#EEF1EF'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: SCR.w, height: 430, background: PX.teal}} />
    <StatusBar dark={false} time={time} />
    <div style={{position: 'absolute', left: 36, top: 82, display: 'flex', alignItems: 'center', gap: 16}}>
      <BankIcon size={72} />
      <div>
        <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 42, color: '#FFFFFF', letterSpacing: 1}}>BANK</div>
        <div style={{fontFamily: UI, fontWeight: 500, fontSize: 24, color: '#BFE3DC'}}>Halo, Rani</div>
      </div>
    </div>
    <div style={{position: 'absolute', left: 32, top: 216, width: SCR.w - 64, height: 300, borderRadius: 34, background: '#FFFFFF', boxShadow: `0 6px 0 ${PX.tealDark}`, padding: '30px 34px', boxSizing: 'border-box'}}>
      <div style={{fontFamily: UI, fontWeight: 600, fontSize: 27, color: K.time}}>Saldo rekening</div>
      <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 92, lineHeight: 1.15, color: zero > 0.5 ? K.red : K.text, letterSpacing: -2, marginTop: 8,
        transform: `scale(${(1 + 0.08 * Math.sin(Math.PI * Math.min(1, zero))).toFixed(4)})`, transformOrigin: '0% 50%'}}>{fmtRp(balance)}</div>
      <div style={{display: 'flex', gap: 14, marginTop: 20}}>
        {['Transfer', 'Bayar', 'Top up'].map((l) => <div key={l} style={{padding: '8px 22px', borderRadius: 20, background: '#E3EFEC', fontFamily: UI, fontWeight: 700, fontSize: 24, color: PX.teal}}>{l}</div>)}
      </div>
    </div>
    <div style={{position: 'absolute', left: 36, top: 556, fontFamily: UI, fontWeight: 800, fontSize: 30, color: K.text}}>Mutasi terbaru</div>
    {rows.map((r, i) => {
      const q = pop(t, r.at, 0.3);
      if (q <= 0.001) return null;
      return (
        <div key={i} style={{position: 'absolute', left: 32, top: 612 + i * 128, width: SCR.w - 64, height: 108, borderRadius: 26, background: '#FFFFFF', boxShadow: `0 4px 0 #D5DBD8`,
          display: 'flex', alignItems: 'center', gap: 18, padding: '0 24px', boxSizing: 'border-box', transform: `scale(${q.toFixed(4)})`}}>
          <div style={{width: 62, height: 62, borderRadius: 31, background: '#FBE3E3', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width={34} height={34} viewBox="0 0 34 34"><path d="M 17 28 L 17 6 M 8 14 L 17 5 L 26 14" stroke={K.red} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontFamily: UI, fontWeight: 700, fontSize: 28, color: K.text}}>{r.label}</div>
            <div style={{fontFamily: UI, fontWeight: 500, fontSize: 22, color: K.time}}>ke rekening tak dikenal</div>
          </div>
          <div style={{fontFamily: UI, fontWeight: 800, fontSize: 30, color: K.red}}>{r.amount}</div>
        </div>
      );
    })}
  </div>
);

// ---------- menus, dialogs ----------
export const ContextMenu: React.FC<{items: Array<{label: string; icon?: React.ReactNode; danger?: boolean}>; hot?: number; press?: number; w?: number}> = ({items, hot = -1, press = 0, w = 360}) => (
  <div style={{width: w, borderRadius: 28, background: '#FFFFFF', boxShadow: `0 6px 0 ${K.bShadow}`, border: `3px solid ${K.line}`, overflow: 'hidden'}}>
    {items.map((it, i) => (
      <div key={it.label} style={{height: 84, display: 'flex', alignItems: 'center', gap: 18, padding: '0 28px', borderTop: i ? `3px solid ${K.paper}` : 'none',
        background: i === hot ? (it.danger ? '#FBE3E3' : K.paper) : '#FFFFFF', fontFamily: UI, fontWeight: 700, fontSize: 31, color: it.danger ? K.red : K.text,
        transform: i === hot ? `scale(${(1 - press * 0.05).toFixed(4)})` : undefined}}>
        {it.icon}{it.label}
      </div>
    ))}
  </div>
);
export const PillButton: React.FC<{label: React.ReactNode; kind: 'yes' | 'no' | 'danger'; w: number; h?: number; press?: number; fs?: number}> = ({label, kind, w, h = 92, press = 0, fs = 34}) => {
  const bg = kind === 'yes' ? K.yellow : kind === 'danger' ? K.red : '#FFFFFF';
  const sh = kind === 'yes' ? K.outShadow : kind === 'danger' ? K.redDark : K.bShadow;
  return (
    <div style={{width: w, height: h, borderRadius: h / 2, background: bg, border: kind === 'no' ? `4px solid ${K.line}` : 'none', boxSizing: 'border-box',
      boxShadow: `0 ${(5 * (1 - press)).toFixed(1)}px 0 ${sh}`, transform: `translateY(${(press * 5).toFixed(1)}px) scale(${(1 - press * 0.04).toFixed(4)})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: UI, fontWeight: 800, fontSize: fs, color: kind === 'danger' ? '#FFFFFF' : K.text, letterSpacing: 0.5}}>
      {label}
    </div>
  );
};
