// INNERWORKS 2D pieces for EP11 (pure SVG, 1080 × 1920 design space).
// Bright cutaway studio: mint casing, brass/steel rollers with metal gradients, cyan cut lines.
// No Math.random: seeded hash only. The banknote is generic (no portrait, no BI design replica).
import React from "react";

export const K = {
  paper: "#e8eeeb", floor: "#dfe7e3", mint: "#79dcb4", mintDk: "#4fb58f", mintLt: "#cdeee0",
  plinth: "#f4f6f5", brass: "#d4a537", brassDk: "#9c7417", steel: "#a7b3c2", steelDk: "#6b7888",
  orange: "#ff7a3d", orangeTx: "#c2410c", cyan: "#00b8d4", cyanTx: "#06697a", ink: "#1d2b33",
  uv: "#6d4aff", uvGlow: "#6fb6ff", ir: "#8a1c2b", mag: "#3949ab", ok: "#16a34a", bad: "#dc2626",
  chip: "rgba(244,247,246,0.93)", copper: "#c8743a",
};

export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ease = (v: number) => { const x = clamp01(v); return x * x * (3 - 2 * x); };
/** ease-out expo (entrances) */
export const expo = (v: number) => { const x = clamp01(v); return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x); };
/** ease-in expo (exits) */
export const expoIn = (v: number) => { const x = clamp01(v); return x <= 0 ? 0 : Math.pow(2, 10 * x - 10); };
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** pop 0→1 with a small overshoot (≤ 1.06) */
export const pop = (t: number, a: number, d = 0.35) => {
  const x = clamp01((t - a) / d);
  return x <= 0 ? 0 : expo(x) + 0.05 * Math.sin(Math.PI * x);
};

export const Defs: React.FC = () => (
  <defs>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="14" /></filter>
    <filter id="soft4" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4" /></filter>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="26" /></filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={11} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.16  0 0 0 0 0.18  0 0 0 0.5 -0.18" />
    </filter>
    <linearGradient id="mintBody" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#9be8c8" />
      <stop offset="0.45" stopColor={K.mint} />
      <stop offset="1" stopColor="#5fc79e" />
    </linearGradient>
    <linearGradient id="brassV" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#8a6514" />
      <stop offset="0.3" stopColor="#f3d27a" />
      <stop offset="0.42" stopColor="#fff2c4" />
      <stop offset="0.6" stopColor={K.brass} />
      <stop offset="1" stopColor="#7d5c12" />
    </linearGradient>
    <linearGradient id="steelV" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#5f6b7a" />
      <stop offset="0.3" stopColor="#d9e1ea" />
      <stop offset="0.42" stopColor="#ffffff" />
      <stop offset="0.6" stopColor={K.steel} />
      <stop offset="1" stopColor="#56616e" />
    </linearGradient>
    <linearGradient id="steelH" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#eef2f6" />
      <stop offset="0.15" stopColor="#ffffff" />
      <stop offset="0.5" stopColor={K.steel} />
      <stop offset="1" stopColor="#5f6b7a" />
    </linearGradient>
    <radialGradient id="brassR" cx="0.38" cy="0.32" r="0.75">
      <stop offset="0" stopColor="#fff2c4" />
      <stop offset="0.35" stopColor="#f0cd6f" />
      <stop offset="0.8" stopColor={K.brass} />
      <stop offset="1" stopColor="#7d5c12" />
    </radialGradient>
    <radialGradient id="steelR" cx="0.38" cy="0.32" r="0.75">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="0.4" stopColor="#cfd8e2" />
      <stop offset="1" stopColor="#5f6b7a" />
    </radialGradient>
    <pattern id="brush" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="1" fill="#000" opacity="0.06" />
    </pattern>
    {/* directional key light from upper-left: lit face → shade side */}
    <linearGradient id="bodyShade" x1="0" y1="0" x2="1" y2="0.25">
      <stop offset="0" stopColor="#ffffff" stopOpacity="0.32" />
      <stop offset="0.3" stopColor="#ffffff" stopOpacity="0" />
      <stop offset="0.7" stopColor="#0d1a20" stopOpacity="0.08" />
      <stop offset="1" stopColor="#0d1a20" stopOpacity="0.34" />
    </linearGradient>
    <linearGradient id="panelShade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#ffffff" stopOpacity="0.45" />
      <stop offset="0.35" stopColor="#ffffff" stopOpacity="0" />
      <stop offset="1" stopColor="#0d1a20" stopOpacity="0.2" />
    </linearGradient>
    <linearGradient id="wallShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#9fb0aa" stopOpacity="0.55" />
      <stop offset="0.55" stopColor="#9fb0aa" stopOpacity="0.08" />
      <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="floorShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#0d1a20" stopOpacity="0.14" />
      <stop offset="0.25" stopColor="#0d1a20" stopOpacity="0" />
      <stop offset="1" stopColor="#ffffff" stopOpacity="0.4" />
    </linearGradient>
    <linearGradient id="keyShade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#fffdf2" stopOpacity="0.16" />
      <stop offset="0.45" stopColor="#fffdf2" stopOpacity="0" />
      <stop offset="1" stopColor="#0d1a20" stopOpacity="0.22" />
    </linearGradient>
    <radialGradient id="vignette" cx="0.45" cy="0.4" r="0.8">
      <stop offset="0.55" stopColor="#0d1a20" stopOpacity="0" />
      <stop offset="1" stopColor="#0d1a20" stopOpacity="0.42" />
    </radialGradient>
  </defs>
);

/** Studio backdrop: cream wall, floor, soft key light. */
export const Studio: React.FC<{ floorY?: number; tint?: string }> = ({ floorY = 1360, tint }) => (
  <g>
    <rect x={-400} y={-400} width={1880} height={2720} fill={tint ?? K.paper} />
    <rect x={-400} y={-400} width={1880} height={floorY + 400} fill="url(#ep11grid)" />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-400 + i * 240} y={-400} width={3} height={floorY + 400} fill="#1d2b33" opacity={0.06} />)}
    {/* far wall layer: recessed darker panels behind the set (depth) */}
    <rect x={-400} y={-400} width={1880} height={floorY + 400} fill="url(#wallShade)" />
    {[-260, 180, 620, 1060].map((x, i) => (
      <g key={`fw${i}`}>
        <rect x={x} y={floorY - 980} width={340} height={900} rx={24} fill="#b9c8c2" opacity={0.35} />
        <rect x={x} y={floorY - 980} width={340} height={14} rx={7} fill="#fff" opacity={0.5} />
        <rect x={x + 340 - 22} y={floorY - 980} width={22} height={900} rx={10} fill="#0d1a20" opacity={0.07} />
      </g>
    ))}
    <rect x={-400} y={floorY - 70} width={1880} height={70} fill="#cdd8d4" />
    <rect x={-400} y={floorY - 70} width={1880} height={6} fill="#fff" opacity={0.7} />
    <rect x={-400} y={floorY} width={1880} height={2720 - floorY} fill={K.floor} />
    <rect x={-400} y={floorY} width={1880} height={2720 - floorY} fill="url(#floorShade)" />
    <rect x={-400} y={floorY - 4} width={1880} height={8} fill="#fff" opacity={0.6} />
    {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${540 + (i - 6) * 70},${floorY} L${540 + (i - 6) * 260},${floorY + 1200}`} stroke="#1d2b33" strokeWidth={2} opacity={0.06} />)}
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-400} y={floorY + 30 + i * i * 22} width={1880} height={2} fill="#1d2b33" opacity={0.06} />)}
    <ellipse cx={420} cy={420} rx={760} ry={620} fill="#fff" opacity={0.55} filter="url(#glow)" />
    <ellipse cx={540} cy={floorY + 40} rx={700} ry={90} fill="#fff" opacity={0.35} filter="url(#soft)" />
  </g>
);

/** Rotating roller seen end-on (side cutaway). */
export const RollerEnd: React.FC<{ x: number; y: number; r: number; a: number; kind?: "brass" | "steel" }> = ({ x, y, r, a, kind = "brass" }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={r + 4} fill="rgba(29,43,51,.25)" transform="translate(4,8)" filter="url(#soft4)" />
    <circle r={r} fill={kind === "brass" ? "url(#brassR)" : "url(#steelR)"} stroke={kind === "brass" ? K.brassDk : K.steelDk} strokeWidth={2} />
    <g transform={`rotate(${a})`}>
      {[0, 60, 120, 180, 240, 300].map((d) => (
        <rect key={d} x={-2} y={-r * 0.82} width={4} height={r * 0.28} rx={2} fill={kind === "brass" ? K.brassDk : K.steelDk} opacity={0.55} transform={`rotate(${d})`} />
      ))}
    </g>
    <circle r={r * 0.32} fill={K.orange} stroke="#b4501f" strokeWidth={2} />
    <circle r={r * 0.1} fill="#fff" opacity={0.8} transform={`translate(${-r * 0.08},${-r * 0.08})`} />
  </g>
);

/** Roller seen from above: a cylinder crossing the paper path (vertical bar). */
export const RollerTop: React.FC<{ x: number; y: number; w: number; h: number; phase: number; kind?: "brass" | "steel" }> = ({ x, y, w, h, phase, kind = "brass" }) => (
  <g>
    <rect x={x - w / 2 + 6} y={y - h / 2 + 10} width={w} height={h} rx={w / 2} fill="rgba(29,43,51,.28)" filter="url(#soft4)" />
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={w / 2} fill={kind === "brass" ? "url(#brassV)" : "url(#steelV)"} />
    <clipPath id={`rc${Math.round(x)}${Math.round(y)}`}><rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={w / 2} /></clipPath>
    <g clipPath={`url(#rc${Math.round(x)}${Math.round(y)})`}>
      {Array.from({ length: 14 }, (_, i) => {
        const yy = y - h / 2 + ((i * 26 + phase) % (h + 26)) - 13;
        return <rect key={i} x={x - w / 2} y={yy} width={w} height={3} fill="#000" opacity={0.1} />;
      })}
    </g>
    <rect x={x - w / 2} y={y - h / 2 - 8} width={w} height={14} rx={6} fill={K.orange} />
    <rect x={x - w / 2} y={y + h / 2 - 6} width={w} height={14} rx={6} fill={K.orange} />
  </g>
);

export const Gear: React.FC<{ x: number; y: number; r: number; a: number; teeth?: number; fill?: string }> = ({ x, y, r, a, teeth = 12, fill = "url(#brassR)" }) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const ang = (i / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.84;
    const a2 = ang + Math.PI / (teeth * 2);
    pts.push(`${(Math.cos(ang) * rr).toFixed(1)},${(Math.sin(ang) * rr).toFixed(1)}`);
    pts.push(`${(Math.cos(a2) * rr).toFixed(1)},${(Math.sin(a2) * rr).toFixed(1)}`);
  }
  return (
    <g transform={`translate(${x},${y}) rotate(${a})`}>
      <polygon points={pts.join(" ")} fill="rgba(29,43,51,.25)" transform="translate(5,8)" />
      <polygon points={pts.join(" ")} fill={fill} stroke={K.brassDk} strokeWidth={2} />
      <circle r={r * 0.45} fill="none" stroke={K.brassDk} strokeWidth={3} opacity={0.5} />
      <circle r={r * 0.2} fill={K.orange} />
    </g>
  );
};

// ---------------- Indonesia silhouette (schematic, ~200 × 60 box centred at 0,0) ----------------
const ISLANDS = [
  "M-98,-22 L-80,-26 L-60,-6 L-52,8 L-62,10 L-84,-6 Z",
  "M-50,14 L-18,16 L-14,21 L-48,20 Z",
  "M-10,20 L14,19 L16,23 L-10,24 Z",
  "M-40,-20 L-14,-28 L-4,-14 L-12,4 L-34,4 L-42,-8 Z",
  "M4,-20 L14,-22 L12,-10 L22,-8 L14,-4 L18,8 L10,6 L6,-6 Z",
  "M48,-14 L80,-10 L96,0 L94,16 L70,14 L56,2 L46,-6 Z",
];
export const IndoMap: React.FC<{ fill: string; opacity?: number; scale?: number; glow?: boolean }> = ({ fill, opacity = 1, scale = 1, glow }) => (
  <g transform={`scale(${scale})`} opacity={opacity}>
    {glow ? <g filter="url(#soft4)">{ISLANDS.map((d, i) => <path key={i} d={d} fill={fill} transform="scale(1.06)" />)}</g> : null}
    {ISLANDS.map((d, i) => <path key={i} d={d} fill={fill} />)}
    <circle cx={32} cy={-8} r={3} fill={fill} />
    <circle cx={36} cy={4} r={2.5} fill={fill} />
  </g>
);

// ---------------- Generic banknote ----------------
export type BillProps = {
  w?: number; h?: number; kind?: "real" | "fake";
  uv?: number; map?: number; ir?: number; irHide?: number; tape?: number; wm?: number; thread?: number; shadow?: boolean;
};
const rosette = (cx: number, cy: number, R: number, k: number) => {
  let d = "";
  for (let i = 0; i <= 120; i++) {
    const th = (i / 120) * Math.PI * 2;
    const r = R * (0.72 + 0.28 * Math.sin(k * th));
    d += `${i === 0 ? "M" : "L"}${(cx + Math.cos(th) * r).toFixed(1)},${(cy + Math.sin(th) * r).toFixed(1)}`;
  }
  return d + "Z";
};
export const Bill: React.FC<BillProps> = ({ w = 560, h = 260, kind = "real", uv = 0, map = 0, ir = 0, irHide = 0, tape = 0, wm = 0, thread = 0, shadow = true }) => {
  const real = kind === "real";
  const base = real ? "#f2d3cc" : "#f8fafd";
  const ink = real ? "#c45a52" : "#a9b8cc";
  const ink2 = real ? "#8f3b3b" : "#7d8aa3";
  const id = `${kind}${w}`;
  const wave = (k: number) => {
    let d = "";
    for (let x = -w / 2 + 30; x <= w / 2 - 30; x += 10) d += `${x === -w / 2 + 30 ? "M" : "L"}${x},${(h * 0.3 + k * 6 + Math.sin(x * 0.05 + k) * 6).toFixed(1)}`;
    return d;
  };
  return (
    <g data-layout-ignore="banknote print (artwork, not copy)">
      {shadow ? <rect x={-w / 2 + 10} y={-h / 2 + 16} width={w} height={h} rx={14} fill="rgba(29,43,51,.3)" filter="url(#soft4)" /> : null}
      {uv > 0 && !real ? <rect x={-w / 2 - 20} y={-h / 2 - 20} width={w + 40} height={h + 40} rx={30} fill="#5aa8ff" opacity={0.75 * uv} filter="url(#glow)" /> : null}
      <clipPath id={`bc${id}`}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} /></clipPath>
      <g clipPath={`url(#bc${id})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={base} />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="url(#brush)" opacity={0.5} />
        <circle cx={-w * 0.34} cy={0} r={h * 0.27} fill="#fff" opacity={0.45} />
        {/* group A: stays under IR */}
        <g fill="none" stroke={ink} strokeWidth={2} opacity={0.55}>
          {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx={-w * 0.08} cy={-h * 0.02} rx={h * 0.1 + i * 9} ry={h * 0.07 + i * 6} />)}
          {Array.from({ length: 5 }, (_, k) => <path key={k} d={wave(k)} />)}
        </g>
        <text x={-w / 2 + 34} y={-h / 2 + 62} fontFamily="Anton" fontSize={h * 0.2} fill={ink2}>100000</text>
        {/* group B: vanishes under IR */}
        <g opacity={1 - irHide}>
          <path d={rosette(w * 0.28, -h * 0.04, h * 0.28, 7)} fill="none" stroke={ink2} strokeWidth={2.5} opacity={0.7} />
          <path d={rosette(w * 0.28, -h * 0.04, h * 0.2, 9)} fill="none" stroke={ink} strokeWidth={2} opacity={0.7} />
          <path d={rosette(w * 0.28, -h * 0.04, h * 0.12, 5)} fill={ink} opacity={0.35} />
          <text x={w / 2 - 34} y={h / 2 - 26} textAnchor="end" fontFamily="Anton" fontSize={h * 0.26} fill={ink2}>100000</text>
        </g>
        <text x={-w * 0.08} y={h / 2 - 22} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={h * 0.08} letterSpacing={6} fill={ink2} opacity={0.8}>RUPIAH</text>
        {real ? <rect x={w * 0.07} y={-h / 2} width={6} height={h} fill="#7a5a4a" opacity={0.55} strokeDasharray="10 8" /> : null}
        {real && thread > 0 ? <rect x={w * 0.07 - 4} y={-h / 2} width={14} height={h} fill="#e8fbff" opacity={thread * 0.9} /> : null}
        {real && wm > 0 ? <path d={rosette(-w * 0.34, 0, h * 0.2, 6)} fill={ink2} opacity={wm * 0.4} /> : null}
        {/* UV: real paper stays dull, fake paper glows */}
        {uv > 0 ? <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={real ? "#251650" : "#8fd0ff"} opacity={(real ? 0.62 : 0.8) * uv} /> : null}
        {real && uv > 0 && map > 0 ? (
          <g transform={`translate(${-w * 0.04},${-h * 0.04}) scale(${w / 330})`}>
            <IndoMap fill="#dcff63" opacity={map * uv} glow />
          </g>
        ) : null}
        {ir > 0 ? <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#3a0d14" opacity={0.5 * ir} style={{ mixBlendMode: "multiply" }} /> : null}
        <rect x={-w / 2 + 12} y={-h / 2 + 12} width={w - 24} height={h - 24} rx={8} fill="none" stroke={ink} strokeWidth={3} opacity={uv > 0.5 && real ? 0.3 : 0.8} />
      </g>
      {tape > 0 ? (
        <g opacity={tape}>
          <rect x={-w * 0.12} y={-h / 2 - 18} width={w * 0.18} height={h + 36} fill="rgba(255,238,170,0.55)" stroke="rgba(190,160,80,.6)" strokeWidth={2} transform="rotate(6)" />
        </g>
      ) : null}
    </g>
  );
};

// ---------------- Cash-deposit machine (front view, origin = bottom centre of body) ----------------
export const Machine: React.FC<{ t: number; open?: number; slotGlow?: number; screen?: string; reject?: number }> = ({ t, open = 0, slotGlow = 0, screen = "MASUKKAN UANG", reject = 0 }) => {
  const W = 500, H = 1000;
  const rollers = [
    [-150, -700], [-60, -740], [40, -700], [130, -640], [60, -560], [-40, -520], [-140, -460], [-60, -380], [50, -360], [140, -300],
  ];
  return (
    <g>
      {/* cast shadow from the upper-left key light: leans right onto the wall, long tail on the floor */}
      <g transform="translate(70,-30) skewX(-16)" opacity={1 - open * 0.5}>
        <rect x={-W / 2} y={-H} width={W + 40} height={H} rx={36} fill="#0d1a20" opacity={0.2} filter="url(#soft)" />
      </g>
      <path d="M-200,170 L380,170 L620,120 L120,110 Z" fill="#0d1a20" opacity={0.16} filter="url(#soft)" />
      {/* plinth */}
      <ellipse cx={20} cy={180} rx={380} ry={36} fill="rgba(29,43,51,.25)" filter="url(#soft)" />
      <path d="M-330,0 L330,0 L350,-26 L-310,-26 Z" fill="#ffffff" />
      <rect x={-330} y={0} width={660} height={170} rx={10} fill={K.plinth} />
      <rect x={-330} y={0} width={660} height={170} rx={10} fill="url(#bodyShade)" />
      <rect x={-330} y={150} width={660} height={20} fill="#dfe6e3" />
      <rect x={-150} y={70} width={300} height={14} rx={7} fill={K.orange} />
      {/* body side (3/4) */}
      <path d={`M${W / 2},${-H + 30} L${W / 2 + 56},${-H + 4} L${W / 2 + 56},${-40} L${W / 2},${-4} Z`} fill={K.mintDk} />
      {/* interior (visible when open) */}
      <g opacity={open}>
        <rect x={-W / 2} y={-H} width={W} height={H} rx={36} fill={K.mintLt} />
        <rect x={-W / 2} y={-H} width={W} height={H} rx={36} fill="url(#brush)" />
        <path d={rollers.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ")} fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" />
        {rollers.map((p, i) => <RollerEnd key={i} x={p[0]} y={p[1]} r={24} a={t * 240 * (i % 2 ? 1 : -1)} kind={i % 3 === 2 ? "steel" : "brass"} />)}
        {[K.uv, K.mag, K.ir, K.brass, K.cyan].map((c, i) => (
          <g key={i}>
            <rect x={150} y={-760 + i * 80} width={70} height={46} rx={10} fill={K.ink} />
            <circle cx={185} cy={-737 + i * 80} r={12} fill={c} />
          </g>
        ))}
        <rect x={-180} y={-230} width={360} height={170} rx={16} fill={K.steel} stroke={K.steelDk} strokeWidth={3} />
        <rect x={-180} y={-230} width={360} height={170} rx={16} fill="url(#brush)" />
        <text x={0} y={-132} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={34} letterSpacing={4} fill={K.ink}>KASET UANG</text>
        <Gear x={-170} y={-860} r={46} a={t * 90} />
        <Gear x={-104} y={-814} r={30} a={-t * 140} teeth={9} />
      </g>
      {/* front casing (lifts away) */}
      <g transform={`translate(0,${-open * 140})`} opacity={1 - open}>
        <rect x={-W / 2} y={-H} width={W} height={H} rx={36} fill="url(#mintBody)" />
        <rect x={-W / 2} y={-H} width={W} height={H} rx={36} fill="url(#brush)" opacity={0.4} />
        <rect x={-W / 2 + 6} y={-H + 6} width={W - 12} height={6} rx={3} fill="#fff" opacity={0.7} />
        <rect x={-W / 2} y={-H} width={W} height={110} rx={36} fill={K.ink} opacity={0.82} />
        <text x={0} y={-H + 70} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={36} letterSpacing={8} fill="#fff">SETOR TUNAI</text>
        <rect x={-180} y={-860} width={360} height={250} rx={18} fill={K.ink} />
        <rect x={-164} y={-844} width={328} height={218} rx={10} fill="#22414d" />
        <text x={0} y={-760} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={34} fill="#bff6e4">{screen}</text>
        {[0, 1, 2].map((i) => <rect key={i} x={-120} y={-724 + i * 26} width={240 * (0.5 + 0.5 * Math.abs(Math.sin(t * 2 + i)))} height={10} rx={5} fill={K.cyan} opacity={0.6} />)}
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-170 + (i % 3) * 52} y={-580 + Math.floor(i / 3) * 40} width={42} height={30} rx={6} fill="#f4f6f5" stroke="#9bb3aa" strokeWidth={2} />)}
        <rect x={40} y={-570} width={130} height={22} rx={8} fill={K.ink} />
        <rect x={40} y={-520} width={130} height={60} rx={10} fill="#5fc79e" stroke="#3e9c78" strokeWidth={2} />
        {/* cash slot */}
        <rect x={-170} y={-414} width={340} height={58} rx={14} fill={K.orange} />
        <rect x={-150} y={-398} width={300} height={24} rx={8} fill={K.ink} />
        <rect x={-150} y={-398} width={300} height={24} rx={8} fill={reject > 0 ? K.bad : K.cyan} opacity={Math.max(slotGlow, reject) * 0.9} />
        <circle cx={150} cy={-436} r={9} fill={reject > 0 ? K.bad : K.ok} />
        {Array.from({ length: 3 }, (_, i) => <rect key={i} x={-170} y={-140 + i * 36} width={340} height={12} rx={6} fill="#3e9c78" opacity={0.35} />)}
        {/* in-world brand plate (anti-crop) */}
        <rect x={-225} y={-312} width={450} height={132} rx={20} fill={K.ink} />
        <text x={0} y={-228} textAnchor="middle" fontFamily="Anton" fontSize={46} letterSpacing={4} fill="#ffffff">AUDIRA EXPLAINED</text>
        <rect x={-80} y={-210} width={160} height={8} rx={4} fill={K.orange} />
        {/* key-light shading over the whole front + lit left rim */}
        <rect x={-W / 2} y={-H} width={W} height={H} rx={36} fill="url(#bodyShade)" style={{ pointerEvents: "none" }} />
        <rect x={-W / 2 + 4} y={-H + 40} width={8} height={H - 80} rx={4} fill="#fff" opacity={0.55} />
      </g>
      {/* ghost outline + cut lines */}
      {open > 0 ? (
        <g opacity={open}>
          <rect x={-W / 2} y={-H} width={W} height={H} rx={36} fill="none" stroke={K.cyan} strokeWidth={5} strokeDasharray="18 12" />
          <rect x={-W / 2 - 14} y={-H - 14 - open * 140} width={W + 28} height={H + 28} rx={44} fill="none" stroke={K.cyan} strokeWidth={2} opacity={0.5} />
          <path d={`M${-W / 2 - 40},${-H + 120} L${W / 2 + 70},${-H + 120}`} stroke={K.cyan} strokeWidth={3} strokeDasharray="6 8" />
        </g>
      ) : null}
    </g>
  );
};

/** Small in-scene label tag (HUD, light chip). */
export const Tag: React.FC<{ x: number; y: number; text: string; k?: number; color?: string; size?: number; dark?: boolean }> = ({ x, y, text, k = 1, color = K.cyanTx, size = 40, dark }) => {
  const w = text.length * size * 0.62 + 80;
  return (
    <g transform={`translate(${x},${y}) scale(${k})`} opacity={clamp01(k * 1.5)}>
      <rect x={-w / 2 + 4} y={-size * 1.05 + 8} width={w} height={size * 2.1} rx={16} fill="rgba(29,43,51,.22)" filter="url(#soft4)" />
      <rect x={-w / 2} y={-size * 1.05} width={w} height={size * 2.1} rx={16} fill={dark ? K.ink : K.chip} stroke={dark ? "none" : color} strokeWidth={3} />
      <text x={0} y={size * 0.33} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={size} fill={dark ? "#fff" : color}>{text}</text>
    </g>
  );
};

/** 2D camera: look at (x,y) with scale s, centred on the 1080 × 1920 frame. */
export const Cam: React.FC<{ s: number; x: number; y: number; r?: number; children: React.ReactNode }> = ({ s, x, y, r = 0, children }) => (
  <g transform={`translate(540,960) rotate(${r}) scale(${s}) translate(${-x},${-y})`}>{children}</g>
);
