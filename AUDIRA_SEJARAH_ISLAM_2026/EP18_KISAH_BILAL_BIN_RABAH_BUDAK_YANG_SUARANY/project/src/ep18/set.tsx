// EP18 set helpers: parallax camera layers, laminated sky, text cut from paper.
import React from "react";
import { P, PaperDefs, wave, mix, K, C } from "./pieces";

export type Cam = { x: number; y: number; z: number };
export type SP = { t: number; lt: number };

export const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    <PaperDefs />
    {children}
  </svg>
);
/** parallax layer: k 0.35 far, 1 subject, 1.6 foreground. cam.x / cam.y = screen px the subject plane moves at z 1. */
export const L: React.FC<{ cam: Cam; k?: number; children: React.ReactNode }> = ({ cam, k = 1, children }) => (
  <g transform={`translate(540,820) scale(${(1 + (cam.z - 1) * k).toFixed(4)}) translate(${(-540 - cam.x * k).toFixed(2)},${(-820 - cam.y * k).toFixed(2)})`}>{children}</g>
);
/** sky as stacked paper sheets, top to horizon */
export const Sky: React.FC<{ cols: string[]; y0?: number; gap?: number; seed?: number; amp?: number; t?: number }> = ({ cols, y0 = 120, gap = 210, seed = 1, amp = 46, t = 0 }) => (
  <g>
    <rect x={-700} y={-700} width={2600} height={3600} fill={cols[0]} />
    <rect x={-700} y={-700} width={2600} height={3600} fill="url(#fib)" />
    {cols.slice(1).map((c, i) => <P key={i} d={wave(y0 + gap * i, amp, seed + i * 2.1 + t * 0.05 * (i % 2 ? 1 : -1), 2600, -700, 1800)} fill={c} depth={0.34} th={0.8} shade={null} rim={0.45} />)}
  </g>
);
export const Txt: React.FC<{ x: number; y: number; s: number; col?: string; children: string; ls?: number; rot?: number; sh?: boolean }> = ({ x, y, s, col = C.ink, children, ls = 2, rot = 0, sh }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`} style={{ fontFamily: "Anton", fontSize: s, letterSpacing: ls }} textAnchor="middle">
    {sh ? <text data-layout-ignore x={3} y={4} fill={mix(col, "#000000", 0.6)} opacity={0.6}>{children}</text> : null}
    <text fill={col}>{children}</text>
  </g>
);
/** paper arrow along a quadratic arc */
export const Arrow: React.FC<{ x0: number; x1: number; y: number; h: number; k: number; col: string }> = ({ x0, x1, y, h, k, col }) => {
  if (k <= 0) return null;
  const n = 18, pt = (u: number) => [x0 + (x1 - x0) * u, y - 4 * h * u * (1 - u)];
  const pts = Array.from({ length: n + 1 }, (_, i) => pt((i / n) * k));
  const [a, b] = [pts[n - 1], pts[n]], ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  const d = "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" L");
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={d} stroke="rgba(30,14,8,.4)" strokeWidth={26} transform="translate(12,18)" filter="url(#pct)" />
      <path d={d} stroke={mix(col, "#1A0C06", 0.5)} strokeWidth={26} transform="translate(3,5)" />
      <path d={d} stroke={col} strokeWidth={26} />
      <path d={d} stroke="#FFF3D0" strokeWidth={4} transform="translate(-4,-7)" opacity={0.7} />
      <g transform={`translate(${b[0].toFixed(1)},${b[1].toFixed(1)}) rotate(${ang.toFixed(1)})`}><K d="M-10,-42 L52,0 L-10,42Z" fill={col} /></g>
    </g>
  );
};
