// EP29 cover (COMICFORGE): "Penalti Panenka 1976".
// Single dramatic comic panel: Antonín Panenka chips the penalty in Euro 1976 final.
// Keeper Sepp Maier dives left; ball arcs slowly over the center.
// Different from EP09 (two panels, 1986 Arg vs Eng): single wide panel, daytime stadium,
// Czech red vs West Germany grey, action-arc trajectory, "PANENKA!" burst.
// No real faces. Facts: Euro 1976 final, Czechoslovakia vs West Germany, penalty shootout.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { COMIC_PALETTE as P } from "../../kits/comicforge/lib/palette.ts";
import { rng } from "../../kits/comicforge/core/motion.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });

const W = 1080;
const H = 1920;

// CMYK palette extensions for Czech and German kits
const CZECH_RED = "#CE1126";
const CZECH_WHITE = "#F7F3E9";
const GER_GREY = "#8A9BB0";
const FIELD_GREEN = "#2F9C4A";
const FIELD_STRIPE = "#288A41";
const GOAL_WHITE = "#EEF2F6";

/** Procedural halftone dot pattern */
const DotPattern: React.FC<{ id: string; color: string; cell: number; r: number }> = ({ id, color, cell, r }) => (
  <pattern id={id} width={cell} height={cell} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <circle cx={cell / 2} cy={cell / 2} r={r} fill={color} />
  </pattern>
);

/** Starburst impact shape (SVG polygon). */
const burstPoints = (cx: number, cy: number, spikes: number, rOut: number, rIn: number, seed: number): string => {
  const r = rng(seed);
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const rad = i % 2 === 0 ? rOut * (0.78 + r() * 0.3) : rIn * (0.88 + r() * 0.18);
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad * 0.72).toFixed(1)}`);
  }
  return pts.join(" ");
};

/** Stick-figure footballer for comic panels (no real likenesses). */
const Footballer: React.FC<{
  x: number; y: number; scale: number;
  shirtColor: string; shortsColor: string;
  lean?: number;
  armLAngle?: number; armRAngle?: number;
  legLAngle?: number; legRAngle?: number;
  diving?: boolean;
}> = ({ x, y, scale, shirtColor, shortsColor, lean = 0, armLAngle = -0.6, armRAngle = 0.6, legLAngle = 0.3, legRAngle = -0.3, diving }) => {
  const s = scale;
  const lw = s * 7;
  const sk = P.skin;
  const boot = P.ink;
  const inkS = `${s * 4}px ${P.ink}`;

  if (diving) {
    // Keeper diving left — body horizontal, arms stretched up-left
    return (
      <g transform={`translate(${x},${y}) scale(${s})`} style={{ WebkitTextStroke: inkS } as React.CSSProperties}>
        {/* body horizontal */}
        <rect x={-56} y={-18} width={112} height={36} rx={18} fill={shirtColor} stroke={P.ink} strokeWidth={4} />
        {/* head */}
        <circle cx={-66} cy={-14} r={22} fill={sk} stroke={P.ink} strokeWidth={4} />
        {/* gloves/hands up-left */}
        <line x1={-50} y1={-18} x2={-78} y2={-62} stroke={shirtColor} strokeWidth={lw} strokeLinecap="round" />
        <circle cx={-80} cy={-66} r={14} fill="#FFE100" stroke={P.ink} strokeWidth={3} />
        {/* other arm trailing */}
        <line x1={50} y1={-10} x2={80} y2={18} stroke={shirtColor} strokeWidth={lw} strokeLinecap="round" />
        <circle cx={82} cy={20} r={12} fill="#FFE100" stroke={P.ink} strokeWidth={3} />
        {/* legs */}
        <rect x={-24} y={18} width={22} height={52} rx={10} fill={shortsColor} stroke={P.ink} strokeWidth={3} />
        <rect x={6} y={18} width={22} height={52} rx={10} fill={shortsColor} stroke={P.ink} strokeWidth={3} />
        {/* boots */}
        <ellipse cx={-14} cy={72} rx={16} ry={10} fill={boot} stroke={P.ink} strokeWidth={3} />
        <ellipse cx={16} cy={72} rx={16} ry={10} fill={boot} stroke={P.ink} strokeWidth={3} />
      </g>
    );
  }

  // Upright footballer with lean and arm/leg positions
  return (
    <g transform={`translate(${x},${y}) rotate(${lean * (180 / Math.PI)})`}>
      {/* torso */}
      <rect x={-s * 14} y={-s * 28} width={s * 28} height={s * 36} rx={s * 10} fill={shirtColor} stroke={P.ink} strokeWidth={s * 3.5} />
      {/* shorts */}
      <rect x={-s * 12} y={s * 8} width={s * 24} height={s * 20} rx={s * 7} fill={shortsColor} stroke={P.ink} strokeWidth={s * 3} />
      {/* head */}
      <circle cx={0} cy={-s * 42} r={s * 18} fill={sk} stroke={P.ink} strokeWidth={s * 3.5} />
      {/* left arm */}
      <line
        x1={-s * 14} y1={-s * 18}
        x2={-s * 14 + Math.sin(armLAngle) * s * 36} y2={-s * 18 + Math.cos(armLAngle) * s * 36}
        stroke={shirtColor} strokeWidth={lw} strokeLinecap="round"
      />
      {/* right arm */}
      <line
        x1={s * 14} y1={-s * 18}
        x2={s * 14 + Math.sin(armRAngle) * s * 36} y2={-s * 18 + Math.cos(armRAngle) * s * 36}
        stroke={shirtColor} strokeWidth={lw} strokeLinecap="round"
      />
      {/* left leg */}
      <line
        x1={-s * 8} y1={s * 28}
        x2={-s * 8 + Math.sin(legLAngle) * s * 44} y2={s * 28 + Math.cos(legLAngle) * s * 44}
        stroke={shortsColor} strokeWidth={lw * 1.1} strokeLinecap="round"
      />
      {/* right leg */}
      <line
        x1={s * 8} y1={s * 28}
        x2={s * 8 + Math.sin(legRAngle) * s * 44} y2={s * 28 + Math.cos(legRAngle) * s * 44}
        stroke={shortsColor} strokeWidth={lw * 1.1} strokeLinecap="round"
      />
      {/* boots */}
      <ellipse
        cx={-s * 8 + Math.sin(legLAngle) * s * 44} cy={s * 28 + Math.cos(legLAngle) * s * 44 + s * 8}
        rx={s * 14} ry={s * 9} fill={boot} stroke={P.ink} strokeWidth={s * 2.5}
      />
      <ellipse
        cx={s * 8 + Math.sin(legRAngle) * s * 44} cy={s * 28 + Math.cos(legRAngle) * s * 44 + s * 8}
        rx={s * 14} ry={s * 9} fill={boot} stroke={P.ink} strokeWidth={s * 2.5}
      />
    </g>
  );
};

/** Football (simple comic-style sphere with pentagons). */
const Ball: React.FC<{ cx: number; cy: number; r: number }> = ({ cx, cy, r }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={GOAL_WHITE} stroke={P.ink} strokeWidth={3} />
    {/* 5 black pentagons approximated as circles */}
    {[[0, 0], [-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]].map(([dx, dy], i) => (
      <circle key={i} cx={cx + dx * r} cy={cy + dy * r} r={r * 0.22} fill={P.ink} />
    ))}
  </g>
);

/** Goalpost frame. */
const Goalpost: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="none" stroke={GOAL_WHITE} strokeWidth={6} />
    {/* net lines */}
    {Array.from({ length: 8 }, (_, i) => (
      <line key={`v${i}`} x1={x + (i + 1) * (w / 9)} y1={y} x2={x + (i + 1) * (w / 9)} y2={y + h} stroke={GOAL_WHITE} strokeWidth={1.5} opacity={0.6} />
    ))}
    {Array.from({ length: 5 }, (_, i) => (
      <line key={`h${i}`} x1={x} y1={y + (i + 1) * (h / 6)} x2={x + w} y2={y + (i + 1) * (h / 6)} stroke={GOAL_WHITE} strokeWidth={1.5} opacity={0.6} />
    ))}
  </g>
);

/** Ball trajectory arc: parabolic chip over the center. */
const BallArc: React.FC<{ startX: number; startY: number; endX: number; endY: number; apexY: number; dotR: number; color: string }> = ({
  startX, startY, endX, endY, apexY, dotR, color,
}) => {
  const midX = (startX + endX) / 2;
  const pathD = `M ${startX},${startY} Q ${midX},${apexY} ${endX},${endY}`;
  return (
    <g>
      <path d={pathD} fill="none" stroke={color} strokeWidth={4} strokeDasharray="18 10" opacity={0.85} />
      {/* ball at apex */}
      <Ball cx={midX} cy={apexY} r={dotR} />
    </g>
  );
};

/** Speed lines radiating from keeper dive. */
const SpeedLines: React.FC<{ cx: number; cy: number; count?: number }> = ({ cx, cy, count = 10 }) => {
  const r = rng(707);
  return (
    <g opacity={0.65}>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + r() * 0.1 - Math.PI / 2;
        const len = 60 + r() * 80;
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * 30}
            y1={cy + Math.sin(a) * 30}
            x2={cx + Math.cos(a) * (30 + len)}
            y2={cy + Math.sin(a) * (30 + len)}
            stroke={P.yellow}
            strokeWidth={3 + r() * 3}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

const Cover: React.FC = () => {
  const { width: W2, height: H2 } = useVideoConfig();

  // Panel layout: occupies most of the frame
  const PX = 40;
  const PY = 600;
  const PW2 = W - 80;
  const PH2 = 1050;

  // Kick-taker: Panenka, left side, run-up complete, standing foot planted
  const PANENKA_X = PX + 220;
  const PANENKA_Y = PY + PH2 - 180;

  // Keeper: right side, diving hard left (screen-left = Maier's dive direction)
  const KEEPER_X = PX + PW2 - 120;
  const KEEPER_Y = PY + 420;

  // Goal: top-right of panel
  const GOAL_X = PX + 480;
  const GOAL_Y = PY + 90;
  const GOAL_W = PW2 - 480 + 40;
  const GOAL_H = 280;

  // Ball arc: from Panenka's feet, up over center, into goal
  const BALL_START_X = PANENKA_X + 60;
  const BALL_START_Y = PANENKA_Y - 60;
  const BALL_END_X = GOAL_X + GOAL_W / 2;
  const BALL_END_Y = GOAL_Y + GOAL_H / 2;
  const BALL_APEX_Y = PY + 50;

  // "PANENKA!" burst: upper left of panel
  const BURST_CX = PX + 290;
  const BURST_CY = PY + 310;

  return (
    <AbsoluteFill style={{ background: P.skyTop }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <DotPattern id="ep29page" color="#3A2A7A" cell={24} r={6.5} />
          <DotPattern id="ep29field" color={FIELD_STRIPE} cell={48} r={14} />
          <DotPattern id="ep29sky" color="#4A56B0" cell={18} r={4} />
          <clipPath id="ep29panel">
            <polygon points={`${PX},${PY} ${PX + PW2},${PY} ${PX + PW2},${PY + PH2 - 50} ${PX},${PY + PH2}`} />
          </clipPath>
        </defs>

        {/* Page background: night-blue with dot screen */}
        <rect width={W} height={H} fill={P.skyTop} />
        <rect width={W} height={H} fill="url(#ep29page)" opacity={0.5} />

        {/* Panel: daytime stadium scene */}
        <g clipPath="url(#ep29panel)">
          {/* sky gradient */}
          <defs>
            <linearGradient id="ep29skyGrad" x1="0" y1={PY} x2="0" y2={PY + PH2} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#87CEEB" />
              <stop offset="0.4" stopColor="#C8E8F8" />
              <stop offset="1" stopColor={FIELD_GREEN} />
            </linearGradient>
          </defs>
          <rect x={PX} y={PY} width={PW2} height={PH2} fill="url(#ep29skyGrad)" />
          {/* halftone on sky */}
          <rect x={PX} y={PY} width={PW2} height={PH2 * 0.45} fill="url(#ep29sky)" opacity={0.3} />

          {/* pitch — lower half */}
          <rect x={PX} y={PY + PH2 * 0.5} width={PW2} height={PH2 * 0.5} fill={FIELD_GREEN} />
          <rect x={PX} y={PY + PH2 * 0.5} width={PW2} height={PH2 * 0.5} fill="url(#ep29field)" opacity={0.25} />

          {/* penalty arc line */}
          <path
            d={`M ${PX + 50},${PY + PH2 * 0.72} Q ${PX + PW2 / 2},${PY + PH2 * 0.58} ${PX + PW2 - 50},${PY + PH2 * 0.72}`}
            fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={3}
          />
          {/* penalty spot */}
          <circle cx={PX + PW2 / 2} cy={PY + PH2 * 0.74} r={6} fill="rgba(255,255,255,0.75)" />

          {/* goalpost */}
          <Goalpost x={GOAL_X} y={GOAL_Y} w={GOAL_W} h={GOAL_H} />

          {/* keeper diving LEFT — far right of panel, body flying left */}
          <SpeedLines cx={KEEPER_X - 60} cy={KEEPER_Y + 20} count={9} />
          <Footballer
            x={KEEPER_X - 80}
            y={KEEPER_Y}
            scale={1.0}
            shirtColor={GER_GREY}
            shortsColor="#2A2E3A"
            diving
          />

          {/* ball arc */}
          <BallArc
            startX={BALL_START_X}
            startY={BALL_START_Y}
            endX={BALL_END_X}
            endY={BALL_END_Y}
            apexY={BALL_APEX_Y}
            dotR={22}
            color={P.yellow}
          />

          {/* Panenka — left side, standing, kicking leg follow-through */}
          <Footballer
            x={PANENKA_X}
            y={PANENKA_Y}
            scale={1.1}
            shirtColor={CZECH_RED}
            shortsColor="#1A1A2E"
            lean={0.18}
            armLAngle={-1.1}
            armRAngle={0.9}
            legLAngle={-0.45}
            legRAngle={-1.6}
          />

          {/* "PANENKA!" burst */}
          <polygon
            points={burstPoints(BURST_CX, BURST_CY, 14, 220, 155, 1976)}
            fill={P.ink}
            transform={`translate(8,8)`}
          />
          <polygon
            points={burstPoints(BURST_CX, BURST_CY, 14, 220, 155, 1976)}
            fill={P.red}
            stroke={P.ink}
            strokeWidth={6}
          />
          <polygon
            points={burstPoints(BURST_CX, BURST_CY, 12, 170, 125, 1978)}
            fill={P.yellow}
          />
          <text
            x={BURST_CX}
            y={BURST_CY + 24}
            textAnchor="middle"
            fill={P.red}
            style={{
              fontFamily: ANTON,
              fontSize: 86,
              WebkitTextStroke: `5px ${P.ink}`,
              paintOrder: "stroke fill",
            } as React.CSSProperties}
            transform={`rotate(-8,${BURST_CX},${BURST_CY})`}
          >
            PANENKA!
          </text>
        </g>

        {/* Panel ink border */}
        <polygon
          points={`${PX},${PY} ${PX + PW2},${PY} ${PX + PW2},${PY + PH2 - 50} ${PX},${PY + PH2}`}
          fill="none"
          stroke={P.ink}
          strokeWidth={8}
          strokeLinejoin="miter"
        />

        {/* Top section: lettering above panel */}
        {/* kicker bar */}
        <rect x={56} y={188} width={440} height={50} fill={P.ink} />
        <text x={76} y={224} fill="#2BD46A" style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 5 } as React.CSSProperties}>
          SEJARAH SEPAK BOLA #29
        </text>

        {/* AUDIRA badge */}
        <rect x={624} y={188} width={400} height={50} fill={P.yellow} stroke={P.ink} strokeWidth={4} />
        <rect x={630} y={194} width={388} height={38} fill={P.yellow} />
        <polygon points="628,193 1023,193 1023,237 628,237" fill="none" stroke={P.ink} strokeWidth={2} />
        <text x={824} y={226} textAnchor="middle" fill={P.ink} style={{ fontFamily: ANTON, fontSize: 36, letterSpacing: 3 } as React.CSSProperties}>
          AUDIRA
        </text>

        {/* Headline */}
        <text
          x={52}
          y={360}
          fill={CZECH_WHITE}
          style={{ fontFamily: ANTON, fontSize: 148, letterSpacing: -2 } as React.CSSProperties}
          paint-order="stroke fill"
          stroke={P.ink}
          strokeWidth={6}
        >
          PENALTI
        </text>
        <text
          x={52}
          y={500}
          fill={P.yellow}
          style={{ fontFamily: ANTON, fontSize: 100, letterSpacing: 2 } as React.CSSProperties}
          paint-order="stroke fill"
          stroke={P.ink}
          strokeWidth={5}
        >
          PANENKA 1976
        </text>

        {/* Bottom caption bar */}
        <rect x={PX} y={PY + PH2 + 36} width={PW2} height={132} fill={P.ink} />
        <text x={76} y={PY + PH2 + 92} fill={P.yellow} style={{ fontFamily: MONO, fontWeight: 800, fontSize: 32, letterSpacing: 1 } as React.CSSProperties}>
          Cekoslowakia vs Jerman Barat
        </text>
        <text x={76} y={PY + PH2 + 136} fill={P.newsprint} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 1 } as React.CSSProperties}>
          Final Euro 1976 · Chip dari titik penalti
        </text>

        {/* Score badges */}
        <rect x={56} y={H - 230} width={180} height={68} fill={CZECH_RED} stroke={P.ink} strokeWidth={4} />
        <text x={148} y={H - 184} textAnchor="middle" fill={CZECH_WHITE} style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28 } as React.CSSProperties}>
          🇨🇿 CZE
        </text>
        <rect x={260} y={H - 230} width={120} height={68} fill={P.newsprint} stroke={P.ink} strokeWidth={4} />
        <text x={320} y={H - 184} textAnchor="middle" fill={P.ink} style={{ fontFamily: ANTON, fontSize: 36 } as React.CSSProperties}>
          5–3
        </text>
        <rect x={404} y={H - 230} width={180} height={68} fill="#000000" stroke={P.ink} strokeWidth={4} />
        <text x={494} y={H - 184} textAnchor="middle" fill="#FFD700" style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28 } as React.CSSProperties}>
          GER 🇩🇪
        </text>
        <text x={56} y={H - 136} fill={P.newsprint} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 1 } as React.CSSProperties}>
          Penalti terakhir · Menit 90+6
        </text>
      </svg>
    </AbsoluteFill>
  );
};

export { Cover };
