// PAPERWORLD paper pieces for EP43 Pemilik Dua Kebun (pure SVG, 1080 × 1920 design space).
// Base helpers copied from EP18 Svalbard (gold, jury 4.17). Lighting rule: one key light from upper-left; every card
// throws a LONG cast shadow (down-right) + a tight contact shadow, pale cut edge, face gradient, cream rim.
// No Math.random: seeded hash only.
import React from "react";

export const C = {
  ivory: "#F6EFE4", paper: "#FFF6E6", sky: "#BFE3E8", skyWarm: "#F7E2C4", carib: "#3FA7A0", turq: "#4FD1C5",
  leaf: "#5E9E5A", leafLt: "#8FC28A", leafDk: "#3F7448", vine: "#6FA65A", grape: "#6B3F8C", grapeLt: "#9A6BBF", grapeDk: "#4A2A66",
  earth: "#8A6448", earthDk: "#6B4A33", gold: "#F2B75B", red: "#C9483E", mustard: "#E8A93A", ochre: "#C99A4A", straw: "#E6C77E",
  land: "#E9D9B6", landDk: "#D4BE93", wood: "#7A5236", woodLt: "#A07850", stone: "#D8CBB4", stoneDk: "#B3A38A",
  ink: "#2A2233", robe: "#5B3A7A", robeTrim: "#E2B65A", ivoryRobe: "#EDE2CC", storm: "#5E6B80", stormDk: "#3E4758",
  dusk: "#E9B59A", night: "#3E4A6E", rain: "#9FB8C8", teal: "#2F7C86",
};

export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ease = (v: number) => { const x = clamp01(v); return x * x * (3 - 2 * x); };
export const easeOut = (v: number) => 1 - Math.pow(1 - clamp01(v), 3);
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const toRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
export const mix = (hex: string, to: string, k: number) => {
  if (!hex.startsWith("#") || !to.startsWith("#")) return hex;
  const a = toRgb(hex), b = toRgb(to);
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, "0")).join("");
};

export const SHADOW = "rgba(38,28,62,.34)";
export const CONTACT = "rgba(30,20,50,.30)";

export const PaperDefs: React.FC = () => (
  <defs>
    <filter id="pshadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7" /></filter>
    <filter id="pcontact" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5" /></filter>
    <filter id="psoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22" /></filter>
    <filter id="pglow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="14" /></filter>
    <filter id="pdof" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9" /></filter>
    <filter id="pfiberF" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.22" numOctaves={2} seed={11} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.34  0 0 0 1.4 -0.55" />
    </filter>
    <pattern id="pfiber" patternUnits="userSpaceOnUse" width="360" height="360">
      <rect width="360" height="360" fill="#fff" />
      <rect width="360" height="360" filter="url(#pfiberF)" />
    </pattern>
    <linearGradient id="plight" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#FFF4DC" stopOpacity="0.34" />
      <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
      <stop offset="1" stopColor="#1A1030" stopOpacity="0.26" />
    </linearGradient>
  </defs>
);

/** One paper card: long cast shadow + contact shadow + cut edge + face + light gradient + lit rim. */
export const P: React.FC<{ d: string; fill: string; edge?: string; depth?: number; light?: boolean; noShadow?: boolean; opacity?: number }> = ({ d, fill, edge, depth = 1, light = true, noShadow, opacity }) => (
  <g opacity={opacity}>
    {noShadow ? null : <path d={d} fill={SHADOW} transform={`translate(${34 * depth},${46 * depth})`} filter="url(#pshadow)" />}
    {noShadow ? null : <path d={d} fill={CONTACT} transform={`translate(${6 * depth},${8 * depth})`} filter="url(#pcontact)" />}
    {/* cardstock thickness: dark side wall (away from key light) + pale fresh-cut edge */}
    <path d={d} fill={mix(fill, "#3A2614", 0.42)} transform={`translate(${5.5 * depth},${7.5 * depth})`} />
    <path d={d} fill={edge ?? mix(fill, "#ffffff", 0.5)} transform={`translate(${2.6 * depth},${3.6 * depth})`} />
    <path d={d} fill={fill} />
    {light ? <path d={d} fill="url(#plight)" /> : null}
    {light ? <path d={d} fill="url(#pfiber)" opacity={0.55} style={{ mixBlendMode: "multiply" }} /> : null}
    {light ? <path d={d} fill="none" stroke="#FFF8E6" strokeOpacity={0.9} strokeWidth={3.4} transform="translate(-1.8,-2.4)" /> : null}
  </g>
);

/** Composite paper object: draw(null) = real colours, draw(color) = everything in that colour (shadow pass). */
export const Layered: React.FC<{ draw: (c: string | null) => React.ReactNode; depth?: number }> = ({ draw, depth = 1 }) => (
  <g>
    <g transform={`translate(${32 * depth},${44 * depth})`} filter="url(#pshadow)">{draw(SHADOW)}</g>
    <g transform={`translate(${5 * depth},${7 * depth})`} filter="url(#pcontact)">{draw(CONTACT)}</g>
    <g transform={`translate(${5 * depth},${7 * depth})`} opacity={0.55}>{draw("#5A4030")}</g>
    <g transform={`translate(${2.5 * depth},${3.5 * depth})`} opacity={0.75}>{draw("#FFF6E6")}</g>
    {draw(null)}
    <g opacity={0.5} style={{ mixBlendMode: "multiply" }}>{draw("url(#pfiber)")}</g>
  </g>
);

export const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0Z`;
export const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0Z`;
export const rect = (x: number, y: number, w: number, h: number) => `M${x},${y} L${x + w},${y} L${x + w},${y + h} L${x},${y + h}Z`;

/** Closed seeded blob around 0,0. */
export const blob = (r: number, seed: number, n = 12, j = 0.14, sx = 1, sy = 1) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + (hash(seed + i * 7.3) - 0.5) * 2 * j);
    pts.push([Math.cos(a) * rr * sx, Math.sin(a) * rr * sy]);
  }
  let d = "";
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    if (i === 0) { const pr = pts[n - 1]; d += `M${((pr[0] + p[0]) / 2).toFixed(1)},${((pr[1] + p[1]) / 2).toFixed(1)}`; }
    d += ` Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${((p[0] + q[0]) / 2).toFixed(1)},${((p[1] + q[1]) / 2).toFixed(1)}`;
  }
  return d + "Z";
};

export const wave = (y: number, amp: number, len: number, phase: number, x0 = -160, x1 = 1240, bottom = 2100) => {
  let d = `M${x0},${bottom} L${x0},${y}`;
  for (let x = x0; x <= x1; x += 24) d += ` L${x},${(y + Math.sin((x / len) * Math.PI * 2 + phase) * amp).toFixed(1)}`;
  return d + ` L${x1},${bottom}Z`;
};
export const waveLine = (y: number, amp: number, len: number, phase: number, x0 = -160, x1 = 1240) => {
  let d = `M${x0},${y}`;
  for (let x = x0; x <= x1; x += 24) d += ` L${x},${(y + Math.sin((x / len) * Math.PI * 2 + phase) * amp).toFixed(1)}`;
  return d;
};

/** Soft warm pool of light (screen blend). */
export const LightPool: React.FC<{ x: number; y: number; rx: number; ry: number; col?: string; op?: number }> = ({ x, y, rx, ry, col = "#FFE7B0", op = 0.6 }) => (
  <path d={ellipse(x, y, rx, ry)} fill={col} opacity={op} filter="url(#psoft)" style={{ mixBlendMode: "screen" }} />
);

/** Light shafts from the upper-left key light. */
export const Rays: React.FC<{ x?: number; y?: number; op?: number; col?: string; t?: number }> = ({ x = -80, y = -40, op = 0.22, col = "#FFF1CC", t = 0 }) => (
  <g opacity={op} style={{ mixBlendMode: "screen" }}>
    {[0, 1, 2, 3].map((i) => {
      const a = 0.62 + i * 0.13 + Math.sin(t * 0.3 + i) * 0.015;
      const L = 2600, wdt = 0.035 + (i % 2) * 0.02;
      const p1 = [x + Math.cos(a - wdt) * L, y + Math.sin(a - wdt) * L], p2 = [x + Math.cos(a + wdt) * L, y + Math.sin(a + wdt) * L];
      return <path key={i} d={`M${x},${y} L${p1[0]},${p1[1]} L${p2[0]},${p2[1]}Z`} fill={col} filter="url(#pglow)" />;
    })}
  </g>
);

export const Stars: React.FC<{ t: number; n?: number; h?: number }> = ({ t, n = 40, h = 900 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <path key={i} d={circle(hash(i * 3.3) * 1080, 200 + hash(i * 7.1) * h, 2 + hash(i) * 3)} fill="#FFF8E8" opacity={0.4 + 0.5 * Math.abs(Math.sin(t * 1.3 + i))} />
    ))}
  </g>
);

export const Snowfall: React.FC<{ t: number; n?: number; op?: number }> = ({ t, n = 50, op = 0.9 }) => (
  <g opacity={op}>
    {Array.from({ length: n }, (_, i) => {
      const x = (hash(i * 1.7) * 1180 + Math.sin(t * 0.8 + i) * 30) % 1180 - 50;
      const y = ((hash(i * 4.1) * 2000 + t * (60 + hash(i) * 60)) % 2000) - 40;
      return <path key={i} d={circle(x, y, 3 + hash(i * 9) * 5)} fill="#FFFFFF" opacity={0.85} />;
    })}
  </g>
);

// ── Garden objects ───────────────────────────────────────────────────────────────

/** Layered paper water: 3 sheets of waves with a top surface line at y. */
export const Water: React.FC<{ y: number; t: number; col?: string; amp?: number; x0?: number; x1?: number; bottom?: number }> = ({ y, t, col = C.carib, amp = 10, x0 = -160, x1 = 1240, bottom = 2100 }) => (
  <g>
    <P d={wave(y, amp, 260, t * 1.6, x0, x1, bottom)} fill={mix(col, "#ffffff", 0.25)} depth={0.4} light={false} />
    <P d={wave(y + 26, amp * 0.8, 210, -t * 1.3 + 1, x0, x1, bottom)} fill={col} depth={0.5} />
    <P d={wave(y + 62, amp * 0.6, 320, t * 1.1 + 2, x0, x1, bottom)} fill={mix(col, "#1A3050", 0.2)} depth={0.5} light={false} />
    <path d={waveLine(y + 6, amp * 0.6, 150, t * 2, x0 + 40, x1 - 40)} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.5} strokeDasharray="30 46" />
  </g>
);
/** Broadleaf tropical tree, foot at 0,0, height h. */
export const Tree: React.FC<{ h?: number; seed?: number; col?: string }> = ({ h = 260, seed = 1, col = C.leaf }) => (
  <g>
    <P d={`M-10,0 L-6,${-h * 0.55} L6,${-h * 0.55} L12,0Z`} fill={C.wood} depth={0.5} />
    <g transform={`translate(0,${-h * 0.68})`}><P d={blob(h * 0.34, seed, 12, 0.16, 1.15, 0.85)} fill={col} depth={0.8} /></g>
    <g transform={`translate(${-h * 0.18},${-h * 0.82})`}><P d={blob(h * 0.22, seed + 9, 10, 0.18)} fill={mix(col, "#ffffff", 0.18)} depth={0.5} /></g>
  </g>
);

/** Palm tree, foot at 0,0. */
export const Palm: React.FC<{ h?: number; t?: number; seed?: number }> = ({ h = 300, t = 0, seed = 1 }) => {
  const sway = Math.sin(t * 1.2 + seed) * 4;
  return (
    <g transform={`rotate(${sway},0,0)`}>
      <P d={`M-9,0 Q${h * 0.08},${-h * 0.5} ${h * 0.04 - 5},${-h} L${h * 0.04 + 7},${-h} Q${h * 0.1 + 10},${-h * 0.5} 10,0Z`} fill="#9A7350" depth={0.5} />
      {Array.from({ length: 6 }, (_, i) => {
        const a = -150 + i * 40 + Math.sin(t + i) * 3;
        return (
          <g key={i} transform={`translate(${h * 0.04},${-h}) rotate(${a})`}>
            <P d={`M0,0 Q${h * 0.2},${-h * 0.07} ${h * 0.36},${h * 0.04} Q${h * 0.2},${h * 0.02} 0,0Z`} fill={i % 2 ? C.leaf : C.leafDk} depth={0.4} />
          </g>
        );
      })}
    </g>
  );
};
/** Coin, centred 0,0. */
export const Coin: React.FC<{ r?: number; label?: string; spin?: number }> = ({ r = 60, label, spin = 0 }) => (
  <g transform={`scale(${Math.max(0.12, Math.abs(Math.cos(spin)))},1)`}>
    <Layered depth={0.5} draw={(o) => (
      <g>
        <path d={circle(0, 0, r)} fill={o ?? C.gold} />
        <path d={circle(0, 0, r * 0.8)} fill={o ?? "#F7C978"} />
      </g>
    )} />
    {label ? <text x={0} y={r * 0.22} textAnchor="middle" fontFamily="Anton" fontSize={r * 0.62} fill="#8A5A1C">{label}</text> : null}
  </g>
);
/** Raindrops falling diagonally. */
export const Rain: React.FC<{ t: number; n?: number; op?: number }> = ({ t, n = 70, op = 0.7 }) => (
  <g opacity={op}>
    {Array.from({ length: n }, (_, i) => {
      const x = (hash(i * 2.3) * 1300 - t * 120) % 1300;
      const y = ((hash(i * 5.7) * 2000 + t * (900 + hash(i) * 400)) % 2000) - 60;
      const xx = x < -100 ? x + 1300 : x;
      return <path key={i} d={`M${xx},${y} L${xx - 10},${y + 44}`} stroke="#E4F0F6" strokeWidth={4} strokeLinecap="round" />;
    })}
  </g>
);
