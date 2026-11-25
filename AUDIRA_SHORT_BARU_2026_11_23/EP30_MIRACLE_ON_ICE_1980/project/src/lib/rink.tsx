// EP30 ice-hockey sets (CHRONICLE 2D): night arena + spotlights, perspective rink, boards with the
// in-world AUDIRA sign, bulb scoreboard (5x7 dot font), goal, puck + light trail, paper, stat bars.
// All seeded / frame-driven (no Math.random).
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { rng, W, H } from "./set";

const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return f / fps; };
const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, ...style }}>{children}</svg>
);

// Arena interior: dark roof, truss rafters, swaying spotlight cones.
export const Arena: React.FC<{ top?: string; low?: string; cones?: number; seed?: number; warm?: boolean; coneY?: number }> = ({ top = "#05070D", low = "#1A2840", cones = 4, seed = 3, warm = false, coneY = 1150 }) => {
  const t = useT();
  const r = rng(seed);
  const cx = Array.from({ length: cones }).map((_, i) => ({ x: ((i + 0.5) / cones) * W + (r() - 0.5) * 120, ph: r() * 6 }));
  const col = warm ? "#FFD58A" : "#CFE6FF";
  return (
    <Svg>
      <defs>
        <linearGradient id="ar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={low} />
        </linearGradient>
        <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={col} stopOpacity="0.55" />
          <stop offset="1" stopColor={col} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#ar)" />
      {[110, 210].map((y, k) => (
        <g key={k} opacity={0.5 - k * 0.15}>
          <rect x={0} y={y} width={W} height={6} fill="#2A3346" />
          {Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M${i * 80},${y} L${i * 80 + 40},${y + 60} L${i * 80 + 80},${y}`} stroke="#2A3346" strokeWidth={4} fill="none" />)}
          <rect x={0} y={y + 60} width={W} height={4} fill="#2A3346" />
        </g>
      ))}
      {cx.map((c, i) => {
        const sw = Math.sin(t * 0.6 + c.ph) * 140;
        return (
          <g key={i}>
            <path d={`M${c.x - 14},150 L${c.x + 14},150 L${c.x + sw + 230},${coneY} L${c.x + sw - 230},${coneY} Z`} fill="url(#cone)" opacity={0.55} />
            <circle cx={c.x} cy={150} r={16} fill={col} />
            <circle cx={c.x} cy={150} r={44} fill={col} opacity={0.18} />
          </g>
        );
      })}
    </Svg>
  );
};

// Perspective ice sheet from horizon yH to the bottom. scroll moves the markings sideways.
export const Rink: React.FC<{ yH: number; scroll?: number; warm?: boolean; marks?: boolean; glare?: number }> = ({ yH, scroll = 0, warm = false, marks = true, glare = 1 }) => {
  const h = H - yH;
  const X = (x: number, y: number) => W / 2 + (x - W / 2 + scroll) * (0.55 + 0.45 * ((y - yH) / h)) * 1.6; // widen towards the viewer
  const ice0 = warm ? "#E9DCC2" : "#9DBBD0", ice1 = warm ? "#FFF6E4" : "#E6F3FA";
  const line = (y: number, color: string, w: number) => <path d={`M${X(-2000, y)},${y} L${X(3080, y)},${y}`} stroke={color} strokeWidth={w * (0.5 + (y - yH) / h)} />;
  const vline = (x: number, color: string, w: number) => <path d={`M${X(x, yH)},${yH} L${X(x, H)},${H}`} stroke={color} strokeWidth={w} opacity={0.9} />;
  const circle = (x: number, y: number, rx: number) => { const k = 0.55 + 0.45 * ((y - yH) / h); return <ellipse cx={X(x, y)} cy={y} rx={rx * k * 1.6} ry={rx * k * 0.42} stroke="#C8463A" strokeWidth={5 * k} fill="none" />; };
  return (
    <Svg>
      <defs>
        <linearGradient id="ice" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={ice0} />
          <stop offset="1" stopColor={ice1} />
        </linearGradient>
        <radialGradient id="glare" cx="0.5" cy="0.25" r="0.6">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.55 * glare} />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={0} y={yH} width={W} height={h} fill="url(#ice)" />
      {marks ? (
        <g>
          {vline(540, "#C8463A", 12)}
          {vline(140, "#2F5FA8", 14)}
          {vline(940, "#2F5FA8", 14)}
          {circle(540, yH + h * 0.42, 150)}
          {circle(-260, yH + h * 0.62, 120)}
          {circle(1340, yH + h * 0.62, 120)}
          <circle cx={X(540, yH + h * 0.42)} cy={yH + h * 0.42} r={9} fill="#2F5FA8" />
        </g>
      ) : null}
      {line(yH + 3, "#FFFFFF", 3)}
      <rect x={0} y={yH} width={W} height={h} fill="url(#glare)" />
      {Array.from({ length: 26 }).map((_, i) => { const r = rng(90 + i); const y = yH + r() * h, x = ((r() * W * 1.4 + scroll * 1.3) % (W * 1.4)) - 150; return <path key={i} d={`M${x},${y} q${40 + r() * 80},${-6 + r() * 12} ${120 + r() * 140},${r() * 10}`} stroke="#FFFFFF" strokeWidth={1.5} opacity={0.35} fill="none" />; })}
    </Svg>
  );
};

// Dasher boards along the horizon with ad panels; the AUDIRA panel is the in-world brand.
export const Boards: React.FC<{ y: number; scroll?: number; h?: number; glass?: boolean }> = ({ y, scroll = 0, h = 74, glass = true }) => {
  const panels = ["AUDIRA · SPORT FACTS", "LAKE PLACID '80", "AUDIRA · SPORT FACTS", "HOCKEY ARENA", "AUDIRA · SPORT FACTS", "WINTER GAMES"];
  const pw = 520;
  return (
    <div style={{ position: "absolute", left: 0, top: y - h, width: W, height: h + 8, overflow: "hidden" }}>
      {glass ? <div style={{ position: "absolute", left: 0, top: -150, width: W, height: 150, background: "linear-gradient(180deg, rgba(200,230,255,0.02), rgba(200,230,255,0.10))", borderBottom: "2px solid rgba(220,240,255,.25)" }} /> : null}
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: h, background: "#F1EEE6" }} />
      {panels.concat(panels).map((p, i) => {
        const x = ((i * pw - scroll) % (pw * 12) + pw * 12) % (pw * 12) - pw;
        const brand = p.startsWith("AUDIRA");
        return (
          <div key={i} style={{ position: "absolute", left: x, top: 6, width: pw - 14, height: h - 12, background: brand ? "#14100B" : "#1F3D6E", border: brand ? "3px solid #F5B54A" : "none", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "BarlowX", fontSize: h * 0.5, letterSpacing: 5, color: brand ? "#F5B54A" : "#F1EEE6", whiteSpace: "nowrap" }}>{p}</div>
        );
      })}
      <div style={{ position: "absolute", left: 0, top: h, width: W, height: 8, background: "#E7C34A" }} />
    </div>
  );
};

// 5x7 dot-matrix glyphs (rows top->bottom, 5 bits each).
const FONT: Record<string, number[]> = {
  "0": [14, 17, 19, 21, 25, 17, 14], "1": [4, 12, 4, 4, 4, 4, 14], "2": [14, 17, 1, 2, 4, 8, 31], "3": [31, 2, 4, 2, 1, 17, 14],
  "4": [2, 6, 10, 18, 31, 2, 2], "5": [31, 16, 30, 1, 1, 17, 14], "6": [6, 8, 16, 30, 17, 17, 14], "7": [31, 1, 2, 4, 8, 8, 8],
  "8": [14, 17, 17, 14, 17, 17, 14], "9": [14, 17, 17, 15, 1, 2, 12], ":": [0, 4, 4, 0, 4, 4, 0], "-": [0, 0, 0, 31, 0, 0, 0],
  U: [17, 17, 17, 17, 17, 17, 14], S: [15, 16, 16, 14, 1, 1, 30], A: [14, 17, 17, 31, 17, 17, 17], R: [30, 17, 17, 30, 20, 18, 17],
  F: [31, 16, 16, 30, 16, 16, 16], I: [14, 4, 4, 4, 4, 4, 14], N: [17, 25, 21, 19, 17, 17, 17], " ": [0, 0, 0, 0, 0, 0, 0],
};
export const Bulbs: React.FC<{ text: string; dot?: number; color?: string; x?: number; y?: number; flicker?: number }> = ({ text, dot = 12, color = "#FFB347", x = 0, y = 0, flicker = 0 }) => {
  const g = dot * 1.35;
  return (
    <g transform={`translate(${x},${y})`}>
      {text.split("").map((ch, ci) => (FONT[ch] ?? FONT[" "]).map((row, ry) => Array.from({ length: 5 }).map((_, cx) => {
        const on = (row >> (4 - cx)) & 1;
        const px = ci * g * 6 + cx * g, py = ry * g;
        return on ? (
          <g key={`${ci}-${ry}-${cx}`}>
            <circle cx={px} cy={py} r={dot * 0.95} fill={color} opacity={0.22 * (1 - flicker)} />
            <circle cx={px} cy={py} r={dot * 0.48} fill="#FFF1C9" opacity={1 - flicker * 0.6} />
          </g>
        ) : <circle key={`${ci}-${ry}-${cx}`} cx={px} cy={py} r={dot * 0.3} fill="#2A2018" />;
      })))}
    </g>
  );
};
export const bulbWidth = (text: string, dot = 12) => text.length * dot * 1.35 * 6 - dot * 1.35;

// Scoreboard box: two team rows (name + score) and an optional clock line. Rendered as SVG in place.
export const Scoreboard: React.FC<{ cx: number; y: number; a: string; sa: number | string; b: string; sb: number | string; clock?: string; dot?: number; hitA?: number; hitB?: number }> = ({ cx, y, a, sa, b, sb, clock, dot = 12, hitA = 0, hitB = 0 }) => {
  const rowH = dot * 1.35 * 9;
  const nameW = bulbWidth("USSR", dot), scoreW = bulbWidth("10", dot);
  const w = nameW + scoreW + dot * 9;
  const rows = clock ? 3 : 2;
  const x0 = cx - w / 2;
  const row = (name: string, sc: number | string, i: number, hit: number) => (
    <g key={i}>
      <Bulbs text={name.padEnd(4, " ")} dot={dot} x={x0 + dot * 3} y={y + dot * 3 + i * rowH} color={i === 0 ? "#FFB347" : "#FFB347"} />
      <g transform={`translate(${x0 + w - dot * 3 - scoreW},${y + dot * 3 + i * rowH}) scale(${1 + hit * 0.18})`}>
        <Bulbs text={String(sc).padStart(2, " ")} dot={dot} color="#FFB347" />
      </g>
    </g>
  );
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <rect x={x0 - 10} y={y - 10} width={w + 20} height={rowH * rows + dot * 3 + 20} rx={14} fill="#3A2C1E" />
      <rect x={x0} y={y} width={w} height={rowH * rows + dot * 3} rx={8} fill="#0D0A08" stroke="#6B5236" strokeWidth={3} />
      {row(a, sa, 0, hitA)}
      {row(b, sb, 1, hitB)}
      {clock ? <Bulbs text={clock} dot={dot} x={cx - bulbWidth(clock, dot) / 2 + dot * 0.6} y={y + dot * 3 + 2 * rowH} color="#FF6A3D" /> : null}
    </svg>
  );
};

// Goal: red pipes + white net mesh, seen front-on. Origin = bottom centre.
export const Goal: React.FC<{ x: number; y: number; w?: number; shake?: number }> = ({ x, y, w = 420, shake = 0 }) => {
  const h = w * 0.55;
  const t = useT();
  const sx = Math.sin(t * 60) * shake * 6;
  return (
    <g transform={`translate(${x + sx},${y})`}>
      <path d={`M${-w / 2 + 30},${-h + 20} L${-w / 2 + 50},-6 L${w / 2 - 50},-6 L${w / 2 - 30},${-h + 20}`} fill="#DDE7EE" opacity={0.18} />
      {Array.from({ length: 14 }).map((_, i) => <path key={`v${i}`} d={`M${-w / 2 + (i * w) / 13},${-h} L${-w / 2 + 40 + (i * (w - 80)) / 13},-4`} stroke="#F4F7FA" strokeWidth={1.6} opacity={0.55} />)}
      {Array.from({ length: 7 }).map((_, i) => <path key={`h${i}`} d={`M${-w / 2 + (i * 40) / 7},${-h + (i * h) / 7} L${w / 2 - (i * 40) / 7},${-h + (i * h) / 7}`} stroke="#F4F7FA" strokeWidth={1.6} opacity={0.5} />)}
      <path d={`M${-w / 2},0 L${-w / 2},${-h} L${w / 2},${-h} L${w / 2},0`} stroke="#D9503A" strokeWidth={14} fill="none" strokeLinejoin="round" />
      <ellipse cx={0} cy={6} rx={w * 0.62} ry={18} fill="#000" opacity={0.25} />
    </g>
  );
};

// Puck with an optional light trail from (x0,y0) to (x,y).
export const Puck: React.FC<{ x: number; y: number; r?: number; trail?: [number, number]; color?: string }> = ({ x, y, r = 20, trail, color = "#9FE0FF" }) => (
  <g>
    {trail ? (
      <>
        <path d={`M${trail[0]},${trail[1]} L${x},${y}`} stroke={color} strokeWidth={r * 1.6} strokeLinecap="round" opacity={0.18} />
        <path d={`M${trail[0]},${trail[1]} L${x},${y}`} stroke="#FFFFFF" strokeWidth={r * 0.5} strokeLinecap="round" opacity={0.75} />
      </>
    ) : null}
    <ellipse cx={x} cy={y + r * 0.35} rx={r * 1.25} ry={r * 0.5} fill="#000" opacity={0.3} />
    <ellipse cx={x} cy={y} rx={r} ry={r * 0.45} fill="#111317" stroke="#3B4250" strokeWidth={2} />
    <rect x={x - r} y={y - r * 0.35} width={r * 2} height={r * 0.35} fill="#111317" />
    <ellipse cx={x} cy={y - r * 0.35} rx={r} ry={r * 0.45} fill="#1C2028" stroke="#4A5262" strokeWidth={2} />
  </g>
);

// Paper / ticker tape thrown from the stands.
export const Paper: React.FC<{ seed: number; n?: number; from?: number }> = ({ seed, n = 150, from = 0 }) => {
  const t = useT() - from;
  if (t < 0) return null;
  const r = rng(seed);
  return (
    <Svg>
      {Array.from({ length: n }).map((_, i) => {
        const x0 = r() * W, sp = 110 + r() * 170, ph = r() * 3, w = 8 + r() * 12, c = r();
        const y = -80 + (t + ph * 0.2) * sp + ph * 40 - 200 * r();
        const x = x0 + Math.sin(t * 2.2 + i) * 34;
        return <rect key={i} x={x} y={y} width={w} height={w * 2.1} fill={c > 0.66 ? "#F6E9CF" : c > 0.33 ? "#E8D9B0" : "#9FD3F5"} opacity={0.9} transform={`rotate(${(t * 140 + i * 37) % 360} ${x} ${y})`} />;
      })}
    </Svg>
  );
};

// Ice spray particles near a point (skate stop / shot).
export const Spray: React.FC<{ x: number; y: number; at: number; seed?: number; n?: number; dir?: number }> = ({ x, y, at, seed = 5, n = 26, dir = -1 }) => {
  const t = useT() - at;
  if (t < 0 || t > 1.1) return null;
  const r = rng(seed);
  return (
    <Svg>
      {Array.from({ length: n }).map((_, i) => {
        const a = (-Math.PI / 2) + dir * (0.2 + r() * 1.2), sp = 300 + r() * 500;
        const px = x + Math.cos(a) * sp * t, py = y + Math.sin(a) * sp * t + 600 * t * t;
        return <circle key={i} cx={px} cy={py} r={3 + r() * 5} fill="#F2FAFF" opacity={Math.max(0, 1 - t)} />;
      })}
    </Svg>
  );
};
