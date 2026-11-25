// CHRONICLE 2D, badminton sets for EP29 (Rudy Hartono): indoor hall (reuses the gym Arena with a
// green court floor), side-on court in perspective with net, shuttlecock with trail, generic trophy.
// Seeded, deterministic, no Math.random.
import React from "react";
import { Arena } from "./gym";

export const COURT_GREEN = "#1E5A3A";

export const Hall: React.FC<{ floorY?: number; spot?: number; spotX?: number; seed?: number; tiers?: [number, number] }> = ({ floorY = 1250, spot = 1, spotX = 540, seed = 29, tiers = [640, 1150] }) => (
  // slight blur = shallow depth of field on the stands; the court is drawn sharp on top
  <div style={{ position: "absolute", inset: 0, filter: "blur(2.5px)" }}>
    <Arena floorY={floorY} spot={spot} spotX={spotX} seed={seed} tiers={tiers} floor={COURT_GREEN} />
  </div>
);

// Side-on court: near edge yN (wide), far edge yF (narrow). Net plane at cx.
export const Court: React.FC<{ yN: number; yF: number; cx?: number; half?: number; netH?: number; line?: string; net?: boolean }> = ({ yN, yF, cx = 540, half = 520, netH = 300, line = "#F1E9D6", net = true }) => {
  const k = 0.72; // far edge scale
  const xN = (u: number) => cx + u * half; // u in [-1, 1]
  const xF = (u: number) => cx + u * half * k;
  const yAt = (v: number) => yF + (yN - yF) * v; // v 0 far, 1 near
  const xAt = (u: number, v: number) => cx + u * half * (k + (1 - k) * v);
  const lineAcross = (u: number, key: string) => <line key={key} x1={xF(u)} y1={yF} x2={xN(u)} y2={yN} stroke={line} strokeWidth={4} opacity={0.85} />;
  const lineAlong = (v: number, key: string) => <line key={key} x1={xAt(-1, v)} y1={yAt(v)} x2={xAt(1, v)} y2={yAt(v)} stroke={line} strokeWidth={3 + v * 2} opacity={0.85} />;
  return (
    <g>
      <path d={`M${xF(-1)},${yF} L${xF(1)},${yF} L${xN(1)},${yN} L${xN(-1)},${yN} Z`} fill="#256B45" />
      <path d={`M${xF(-1)},${yF} L${xF(1)},${yF} L${xN(1)},${yN} L${xN(-1)},${yN} Z`} fill="url(#courtShade)" />
      <defs>
        <linearGradient id="courtShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.35" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[-1, -0.86, -0.23, 0.23, 0.86, 1].map((u, i) => lineAcross(u, `a${i}`))}
      {[0, 0.08, 0.92, 1].map((v, i) => lineAlong(v, `l${i}`))}
      <line x1={xAt(-1, 0.5)} y1={yAt(0.5)} x2={xAt(-0.23, 0.5)} y2={yAt(0.5)} stroke={line} strokeWidth={4} opacity={0.85} />
      <line x1={xAt(0.23, 0.5)} y1={yAt(0.5)} x2={xAt(1, 0.5)} y2={yAt(0.5)} stroke={line} strokeWidth={4} opacity={0.85} />
      {net ? <Net cx={cx} yN={yN} yF={yF} h={netH} /> : null}
    </g>
  );
};

export const Net: React.FC<{ cx: number; yN: number; yF: number; h: number }> = ({ cx, yN, yF, h }) => {
  const hF = h * 0.72;
  // seen from the side the net is a thin plane; draw it slightly skewed so it reads as a net band
  const sk = 46;
  return (
    <g>
      <path d={`M${cx - sk},${yF - hF} L${cx + sk},${yN - h} L${cx + sk},${yN - h * 0.35} L${cx - sk},${yF - hF * 0.35} Z`} fill="#0B0C10" opacity={0.55} stroke="#D8D2C0" strokeOpacity={0.25} />
      {Array.from({ length: 12 }).map((_, i) => {
        const u = i / 11;
        const x = cx - sk + 2 * sk * u;
        const y0 = yF - hF + (yN - h - (yF - hF)) * u;
        const y1 = yF - hF * 0.35 + (yN - h * 0.35 - (yF - hF * 0.35)) * u;
        return <line key={i} x1={x} y1={y0} x2={x} y2={y1} stroke="#D8D2C0" strokeWidth={1.2} opacity={0.35} />;
      })}
      {Array.from({ length: 7 }).map((_, j) => {
        const f = (j + 1) / 8;
        return <line key={`h${j}`} x1={cx - sk} y1={yF - hF + hF * 0.65 * f} x2={cx + sk} y2={yN - h + h * 0.65 * f} stroke="#D8D2C0" strokeWidth={1.2} opacity={0.35} />;
      })}
      <line x1={cx - sk} y1={yF - hF} x2={cx + sk} y2={yN - h} stroke="#F6F1E4" strokeWidth={7} />
      <line x1={cx - sk} y1={yF - hF - 4} x2={cx - sk} y2={yF} stroke="#C9B48A" strokeWidth={6} />
      <line x1={cx + sk} y1={yN - h - 6} x2={cx + sk} y2={yN} stroke="#C9B48A" strokeWidth={8} />
    </g>
  );
};

// Shuttlecock: cork ball + feather cone, pointing along `dir` (deg, 0 = flying right). Optional streak trail.
export const Shuttle: React.FC<{ x: number; y: number; s?: number; dir?: number; trail?: [number, number][]; color?: string; glow?: number }> = ({ x, y, s = 1, dir = 0, trail, color = "#FFF6DF", glow = 1 }) => (
  <g>
    {trail && trail.length > 1 ? (
      <polyline points={trail.map(([a, b]) => `${a},${b}`).join(" ")} fill="none" stroke={color} strokeWidth={6 * s} strokeLinecap="round" opacity={0.35} style={{ filter: `drop-shadow(0 0 ${10 * glow}px ${color})` }} />
    ) : null}
    <g transform={`translate(${x},${y}) rotate(${dir}) scale(${s})`} style={{ filter: `drop-shadow(0 0 ${12 * glow}px ${color})` }}>
      <path d="M-4,-9 L-46,-24 L-46,24 L-4,9 Z" fill={color} opacity={0.92} />
      {[-18, -6, 6, 18].map((v) => <line key={v} x1={-6} y1={v * 0.35} x2={-46} y2={v} stroke="#B9AE95" strokeWidth={1.5} />)}
      <line x1={-30} y1={-18} x2={-30} y2={18} stroke="#B9AE95" strokeWidth={2} />
      <circle cx={2} cy={0} r={11} fill="#F3E6C4" stroke="#8F7A50" strokeWidth={2} />
    </g>
  </g>
);

// Generic two-handled cup (no real trophy likeness). Lit = gold, unlit = dim outline.
export const Trophy: React.FC<{ x: number; y: number; s?: number; lit?: number; label?: string }> = ({ x, y, s = 1, lit = 1, label }) => {
  const gold = "#F5B54A";
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <g style={lit > 0.5 ? { filter: `drop-shadow(0 0 ${18 * lit}px ${gold})` } : undefined}>
        <path d="M-44,-120 L44,-120 Q44,-50 12,-34 L12,-14 L30,0 L-30,0 L-12,-14 L-12,-34 Q-44,-50 -44,-120 Z" fill={lit > 0.5 ? gold : "#1A1610"} stroke={gold} strokeWidth={4} opacity={0.35 + 0.65 * lit} />
        <path d="M-44,-108 Q-74,-104 -64,-76 Q-56,-60 -34,-58" fill="none" stroke={gold} strokeWidth={6} opacity={0.35 + 0.65 * lit} />
        <path d="M44,-108 Q74,-104 64,-76 Q56,-60 34,-58" fill="none" stroke={gold} strokeWidth={6} opacity={0.35 + 0.65 * lit} />
        <rect x={-40} y={0} width={80} height={22} fill={lit > 0.5 ? "#8F6420" : "#14110C"} stroke={gold} strokeWidth={3} opacity={0.35 + 0.65 * lit} />
      </g>
      {label ? <text y={64} textAnchor="middle" fontFamily="Anton" fontSize={54} stroke="#05070D" strokeWidth={6} paintOrder="stroke" fill={lit > 0.5 ? "#F6E9CF" : "#6A5E48"}>{label}</text> : null}
    </g>
  );
};
