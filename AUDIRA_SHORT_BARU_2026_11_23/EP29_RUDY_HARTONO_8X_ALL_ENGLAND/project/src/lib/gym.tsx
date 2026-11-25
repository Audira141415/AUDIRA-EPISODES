// CHRONICLE 2D, gymnastics sets for EP27 (Montreal 1976): indoor arena, uneven bars, beam,
// 3-digit dot scoreboard, gymnast rig (Figure rotated around the hands). Seeded, no Math.random.
import React from "react";
import { useCurrentFrame } from "remotion";
import { Figure, Pose } from "./fig";
import { H, Mood, rng, Stadium, W } from "./set";

export const ARENA: Mood = { top: "#05070D", mid: "#121B2E", low: "#2A3550", sun: "#FFE6B0", fog: "#22304A" };

// Indoor arena: dark roof, truss, spotlight cones, crowd tiers, competition floor in perspective.
export const Arena: React.FC<{ floorY?: number; spot?: number; spotX?: number; seed?: number; tiers?: [number, number]; floor?: string }> = ({ floorY = 1250, spot = 1, spotX = 540, seed = 21, tiers = [640, 1150], floor = "#1F4E7A" }) => {
  const f = useCurrentFrame();
  const r = rng(seed);
  const truss: React.ReactNode[] = [];
  for (let i = 0; i < 14; i++) {
    const x = i * 84 - 20;
    truss.push(<path key={i} d={`M${x},150 L${x + 42},230 L${x + 84},150`} stroke="#2E3A52" strokeWidth={3} fill="none" />);
  }
  const lamps = [160, 380, 700, 920].map((x, i) => {
    const flick = 0.85 + 0.15 * Math.sin(f / 9 + i * 2.1);
    return <circle key={x} cx={x} cy={232} r={16} fill="#FFF1CC" opacity={flick} />;
  });
  const dust: React.ReactNode[] = [];
  for (let i = 0; i < 26; i++) {
    const x0 = spotX - 160 + r() * 320, y0 = 300 + r() * 900, sp = 0.2 + r() * 0.5;
    const y = ((y0 - f * sp) % 900 + 900) % 900 + 300;
    dust.push(<circle key={i} cx={x0 + Math.sin(f / 50 + i) * 12} cy={y} r={1.5 + r() * 2.5} fill="#FFF1CC" opacity={0.25 * spot} />);
  }
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="arenaBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={ARENA.top} />
            <stop offset="0.5" stopColor={ARENA.mid} />
            <stop offset="1" stopColor="#0A0E18" />
          </linearGradient>
          <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE9B8" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFE9B8" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="pool">
            <stop offset="0" stopColor="#FFE2A0" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFE2A0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#arenaBg)" />
        <rect y={140} width={W} height={12} fill="#1B2436" />
        {truss}
        {lamps}
      </svg>
      <Stadium y0={tiers[0]} y1={tiers[1]} mood={ARENA} seed={seed} banners={false} ink="#03050A" />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={floor} stopOpacity="0.55" />
            <stop offset="1" stopColor={floor} />
          </linearGradient>
        </defs>
        <path d={`M-200,${floorY} L${W + 200},${floorY} L${W + 600},${H} L-600,${H} Z`} fill="url(#floorG)" />
        <rect y={floorY - 6} width={W} height={8} fill="#C9B48A" opacity={0.6} />
        <path d={`M${spotX - 60},230 L${spotX + 60},230 L${spotX + 380},${floorY + 120} L${spotX - 380},${floorY + 120} Z`} fill="url(#cone)" opacity={0.8 * spot} style={{ mixBlendMode: "screen" }} />
        <ellipse cx={spotX} cy={floorY + 140} rx={460} ry={110} fill="url(#pool)" opacity={spot} />
        {dust}
      </svg>
    </>
  );
};

// Uneven bars: low bar + high bar on cable-stayed uprights. Returns bar positions via props.
export const BARS = { lowX: 360, highX: 720, lowY: 1020, highY: 760, foot: 1400 };
export const UnevenBars: React.FC<{ s?: number; ox?: number; oy?: number; ink?: string; rail?: string }> = ({ s = 1, ox = 0, oy = 0, ink = "#0B0C10", rail = "#E8DCC0" }) => {
  const B = BARS;
  const X = (x: number) => ox + x * s, Y = (y: number) => oy + y * s;
  const post = (x: number, top: number) => (
    <g>
      <rect x={X(x) - 9 * s} y={Y(top)} width={18 * s} height={(B.foot - top) * s} fill={ink} />
      <line x1={X(x)} y1={Y(top + 30)} x2={X(x - 170)} y2={Y(B.foot)} stroke={ink} strokeWidth={3 * s} />
      <line x1={X(x)} y1={Y(top + 30)} x2={X(x + 170)} y2={Y(B.foot)} stroke={ink} strokeWidth={3 * s} />
    </g>
  );
  return (
    <g>
      {post(B.lowX - 260, B.lowY)}
      {post(B.highX + 120, B.highY)}
      <line x1={X(B.lowX - 270)} y1={Y(B.lowY)} x2={X(B.lowX + 40)} y2={Y(B.lowY)} stroke={rail} strokeWidth={10 * s} strokeLinecap="round" />
      <line x1={X(B.highX - 40)} y1={Y(B.highY)} x2={X(B.highX + 130)} y2={Y(B.highY)} stroke={rail} strokeWidth={10 * s} strokeLinecap="round" />
      <rect x={X(B.lowX - 300)} y={Y(B.foot)} width={(B.highX - B.lowX + 520) * s} height={26 * s} fill="#2F5F8C" />
    </g>
  );
};

// Balance beam on two legs, long side towards camera.
export const Beam: React.FC<{ y?: number; x0?: number; x1?: number; ink?: string }> = ({ y = 1180, x0 = 60, x1 = 1020, ink = "#0B0C10" }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={22} rx={6} fill="#D8C7A0" />
    <rect x={x0} y={y + 18} width={x1 - x0} height={8} fill="#A8946C" />
    {[x0 + 120, x1 - 140].map((x) => (
      <g key={x}>
        <rect x={x} y={y + 26} width={20} height={210} fill={ink} />
        <rect x={x - 60} y={y + 230} width={140} height={14} fill={ink} />
      </g>
    ))}
  </g>
);

// Gymnast rig: Figure rotated about its hands (for bar work). theta 0 = hanging below the bar, 180 = handstand.
const HAND = 223; // figure units from foot to hands in armsUp
export const BarGymnast: React.FC<{ x: number; y: number; h: number; theta: number; contour?: string; glow?: number; pike?: number }> = ({ x, y, h, theta, contour = "#F5B54A", glow = 1.1, pike = 0 }) => {
  const s = h / 200;
  return (
    <g transform={`translate(${x},${y}) rotate(${theta})`}>
      <Figure x={0} y={HAND * s} h={h} pose="armsUp" contour={contour} glow={glow} angles={{ thA: pike, thB: pike, flA: 2, flB: 2, head: 0 }} />
    </g>
  );
};

export const Gymnast: React.FC<{ x: number; y: number; h: number; pose?: Pose; phase?: number; rot?: number; contour?: string; glow?: number; angles?: any; facing?: 1 | -1; opacity?: number }> = ({ x, y, h, pose = "stand", phase = 0, rot = 0, contour = "#F5B54A", glow = 1.1, angles, facing = 1, opacity = 1 }) => {
  const s = h / 200;
  // rotate about the hip (≈100 units above the foot)
  return (
    <g transform={`translate(${x},${y - 100 * s}) rotate(${rot}) translate(0,${100 * s})`}>
      <Figure x={0} y={0} h={h} pose={pose} phase={phase} contour={contour} glow={glow} angles={angles} facing={facing} opacity={opacity} />
    </g>
  );
};

// ---- 7-segment digit board (amber lamps). value e.g. "1.00"; ghost adds an empty dashed 4th cell.
const SEG: Record<string, string> = { "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcdfg", "-": "g", " ": "" };
export const Digit: React.FC<{ x: number; y: number; w: number; ch: string; on?: string; off?: string; glow?: number }> = ({ x, y, w, ch, on = "#FFB43C", off = "#2A1E10", glow = 1 }) => {
  const h = w * 1.8, t = w * 0.17;
  const segs: Record<string, [number, number, number, number]> = {
    a: [t, 0, w - 2 * t, t], d: [t, h - t, w - 2 * t, t], g: [t, h / 2 - t / 2, w - 2 * t, t],
    f: [0, t, t, h / 2 - t * 1.2], b: [w - t, t, t, h / 2 - t * 1.2], e: [0, h / 2 + t * 0.2, t, h / 2 - t * 1.2], c: [w - t, h / 2 + t * 0.2, t, h / 2 - t * 1.2],
  };
  const lit = SEG[ch] ?? "";
  return (
    <g transform={`translate(${x},${y})`}>
      {Object.entries(segs).map(([k, [sx, sy, sw, sh]]) => (
        <rect key={k} x={sx} y={sy} width={sw} height={sh} rx={t / 2} fill={lit.includes(k) ? on : off} style={lit.includes(k) ? { filter: `drop-shadow(0 0 ${10 * glow}px ${on})` } : undefined} />
      ))}
    </g>
  );
};

// Scoreboard: header, athlete row, 3-digit score cell "X.XX". value = 3 chars of digits, e.g. "100" → "1.00".
export const Scoreboard: React.FC<{ x: number; y: number; w?: number; digits: string; name?: string; nat?: string; num?: string; ghost?: number; blink?: number; ghostDigits?: string; header?: string }> = ({ x, y, w = 820, digits, name = "COMANECI N.", nat = "ROM", num = "73", ghost = 0, blink = 1, ghostDigits = "1000", header = "MONTRÉAL 1976 · PALANG BERTINGKAT" }) => {
  const dw = w * 0.15;
  const cellW = dw * 3 + dw * 0.9;
  const cx = x + (w - cellW) / 2 + (ghost > 0 ? dw * 0.55 : 0);
  const dy = y + 210;
  const ghostX = cx - dw * 1.25;
  return (
    <g>
      <rect x={x - 14} y={y - 14} width={w + 28} height={dw * 1.8 + 300} rx={14} fill="#15110D" stroke="#3A2E20" strokeWidth={6} />
      <rect x={x} y={y} width={w} height={dw * 1.8 + 272} rx={8} fill="#07070A" />
      <text x={x + w / 2} y={y + 58} textAnchor="middle" fontFamily="Barlow" fontSize={36} letterSpacing={6} fill="#C9B48A">{header}</text>
      <line x1={x + 30} x2={x + w - 30} y1={y + 82} y2={y + 82} stroke="#3A2E20" strokeWidth={3} />
      <text x={x + 40} y={y + 150} fontFamily="Anton" fontSize={56} fill="#FFB43C" style={{ filter: "drop-shadow(0 0 8px #FFB43C)" }}>{num}</text>
      <text x={x + 140} y={y + 150} fontFamily="Anton" fontSize={56} fill="#FFB43C" letterSpacing={3} style={{ filter: "drop-shadow(0 0 8px #FFB43C)" }}>{name}</text>
      <text x={x + w - 40} y={y + 150} textAnchor="end" fontFamily="Anton" fontSize={56} fill="#FFB43C" style={{ filter: "drop-shadow(0 0 8px #FFB43C)" }}>{nat}</text>
      {ghost > 0 ? (
        <g opacity={ghost}>
          <rect x={ghostX - 10} y={dy - 12} width={dw + 20} height={dw * 1.8 + 24} rx={8} fill="none" stroke="#D9503A" strokeWidth={5} strokeDasharray="16 12" />
          <Digit x={ghostX} y={dy} w={dw} ch={ghostDigits[0]} on="#D9503A" off="transparent" glow={0.5} />
        </g>
      ) : null}
      <g opacity={blink}>
        <Digit x={cx} y={dy} w={dw} ch={digits[0] ?? " "} />
        <circle cx={cx + dw * 1.2} cy={dy + dw * 1.72} r={dw * 0.1} fill="#FFB43C" style={{ filter: "drop-shadow(0 0 8px #FFB43C)" }} />
        <Digit x={cx + dw * 1.45} y={dy} w={dw} ch={digits[1] ?? " "} />
        <Digit x={cx + dw * 2.65} y={dy} w={dw} ch={digits[2] ?? " "} />
      </g>
    </g>
  );
};

// Judge's hand-held score card ("10").
export const JudgeCard: React.FC<{ x: number; y: number; text: string; s?: number; tilt?: number }> = ({ x, y, text, s = 1, tilt = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${tilt}) scale(${s})`}>
    <rect x={-6} y={60} width={12} height={110} fill="#0B0C10" />
    <rect x={-70} y={-50} width={140} height={110} rx={8} fill="#F6E9CF" stroke="#0B0C10" strokeWidth={5} />
    <text y={32} textAnchor="middle" fontFamily="Anton" fontSize={84} fill="#0B0C10">{text}</text>
  </g>
);
