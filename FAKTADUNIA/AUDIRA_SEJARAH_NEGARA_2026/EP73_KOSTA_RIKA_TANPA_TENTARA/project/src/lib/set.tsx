// CHRONICLE 2D sets: warm lit skies, fog layers, stadium bowl + crowd, track, city, grain. All seeded (no Math.random).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const W = 1080, H = 1920;

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Mood = { top: string; mid: string; low: string; sun: string; fog: string };
export const MOODS: Record<string, Mood> = {
  dusk: { top: "#1B2A3A", mid: "#C8683A", low: "#F3B262", sun: "#FFE2A0", fog: "#E89A5A" },
  noon: { top: "#3D5872", mid: "#B98A5A", low: "#EBCB8E", sun: "#FFF3D2", fog: "#D8B486" },
  night: { top: "#070B14", mid: "#1D2B44", low: "#3E4E6A", sun: "#BFD4FF", fog: "#2B3A55" },
  amber: { top: "#24140C", mid: "#7A3E1C", low: "#D88A40", sun: "#FFD58A", fog: "#B8642E" },
  steel: { top: "#0E1218", mid: "#2E3540", low: "#5A6470", sun: "#D6DEE8", fog: "#48525E" },
  gold: { top: "#2A1A2E", mid: "#D2753C", low: "#FFC86E", sun: "#FFF0C0", fog: "#F0A860" },
};

export const Sky: React.FC<{ mood: Mood; sunX?: number; sunY?: number; sunR?: number }> = ({ mood, sunX = 540, sunY = 900, sunR = 260 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={mood.top} />
        <stop offset="0.55" stopColor={mood.mid} />
        <stop offset="1" stopColor={mood.low} />
      </linearGradient>
      <radialGradient id="sun">
        <stop offset="0" stopColor={mood.sun} stopOpacity="1" />
        <stop offset="0.25" stopColor={mood.sun} stopOpacity="0.55" />
        <stop offset="1" stopColor={mood.sun} stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#sky)" />
    <circle cx={sunX} cy={sunY} r={sunR * 2.4} fill="url(#sun)" />
    <circle cx={sunX} cy={sunY} r={sunR * 0.32} fill={mood.sun} opacity={0.9} />
  </svg>
);

export const Fog: React.FC<{ color: string; y: number; h?: number; opacity?: number }> = ({ color, y, h = 360, opacity = 0.55 }) => (
  <div style={{ position: "absolute", left: 0, width: W, top: y - h / 2, height: h, background: `linear-gradient(180deg, transparent, ${color}, transparent)`, opacity }} />
);

// Stadium bowl: tiers of crowd as dark bumps, rim lights. y0 = rim top, y1 = field edge.
export const Stadium: React.FC<{ y0: number; y1: number; mood: Mood; seed?: number; flash?: boolean; banners?: boolean; ink?: string }> = ({ y0, y1, mood, seed = 7, flash = true, banners = true, ink = "#0B0C10" }) => {
  const f = useCurrentFrame();
  const r = rng(seed);
  const rows = 9;
  const heads: React.ReactNode[] = [];
  for (let i = 0; i < rows; i++) {
    const t = i / (rows - 1);
    const y = y0 + 40 + (y1 - y0 - 60) * t;
    const size = 7 + 9 * t;
    const n = Math.floor(W / (size * 1.35)) + 4;
    let d = "";
    for (let j = 0; j < n; j++) {
      const x = -20 + j * size * 1.35 + r() * 4;
      const yy = y - r() * 6;
      d += `M${x - size * 0.7},${yy + size * 1.3} Q${x},${yy - size * 0.2} ${x + size * 0.7},${yy + size * 1.3} Z M${x + size * 0.42},${yy} a${size * 0.42},${size * 0.42} 0 1 0 ${-size * 0.84},0 a${size * 0.42},${size * 0.42} 0 1 0 ${size * 0.84},0 Z `;
    }
    heads.push(<path key={i} d={d} fill={ink} opacity={0.62 + 0.38 * t} />);
  }
  const flashes: React.ReactNode[] = [];
  if (flash) {
    const rf = rng(seed * 13);
    for (let i = 0; i < 18; i++) {
      const x = rf() * W, y = y0 + 40 + rf() * (y1 - y0 - 80), per = 50 + Math.floor(rf() * 90), off = Math.floor(rf() * per);
      const ph = (f + off) % per;
      const a = ph < 4 ? 1 - ph / 4 : 0;
      if (a > 0) flashes.push(<circle key={i} cx={x} cy={y} r={10 + rf() * 8} fill="#FFF6DE" opacity={a * 0.9} />);
    }
  }
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id={`bowl${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mood.fog} stopOpacity="0.5" />
          <stop offset="1" stopColor="#120E0C" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <path d={`M0,${y0 + 30} Q${W / 2},${y0 - 40} ${W},${y0 + 30} L${W},${y1} L0,${y1} Z`} fill={`url(#bowl${seed})`} />
      {/* roof / rim with columns */}
      <path d={`M0,${y0 + 28} Q${W / 2},${y0 - 44} ${W},${y0 + 28}`} stroke={mood.sun} strokeWidth={3} fill="none" opacity={0.65} />
      {Array.from({ length: 13 }).map((_, i) => {
        const x = 20 + i * 86;
        const top = y0 + 30 - 70 * Math.sin((x / W) * Math.PI);
        return <rect key={i} x={x} y={top - 54} width={14} height={60} fill={ink} />;
      })}
      {banners
        ? [140, 400, 680, 940].map((x, i) => {
            const top = y0 + 30 - 70 * Math.sin((x / W) * Math.PI) - 150;
            const sway = Math.sin(f / 22 + i) * 6;
            return (
              <g key={x}>
                <rect x={x - 2} y={top} width={5} height={100} fill={ink} />
                <path d={`M${x + 3},${top + 4} q30,${8 + sway} 60,0 l0,40 q-30,${-8 - sway} -60,0 Z`} fill={i % 2 ? "#D9C9A8" : "#B5452E"} opacity={0.9} />
              </g>
            );
          })
        : null}
      {heads}
      {flashes}
    </svg>
  );
};

// Running track in perspective: horizon at yH, near edge at bottom. curveShift bends lanes for the 200 m bend.
export const Track: React.FC<{ yH: number; lanes?: number; color?: string; line?: string; scroll?: number; curve?: number }> = ({ yH, lanes = 6, color = "#8A3B24", line = "#F1E3C8", scroll = 0, curve = 0 }) => {
  const vx = W / 2 + curve * 300;
  const near = H + 200;
  const lines: React.ReactNode[] = [];
  for (let i = 0; i <= lanes; i++) {
    const xb = -380 + ((W + 760) * i) / lanes;
    const xt = vx - 120 + (240 * i) / lanes;
    lines.push(<path key={i} d={`M${xt},${yH} Q${(xt + xb) / 2 + curve * 160},${(yH + near) / 2} ${xb},${near}`} stroke={line} strokeWidth={4 + i * 0} opacity={0.75} fill="none" />);
  }
  // distance ticks scroll towards camera
  const ticks: React.ReactNode[] = [];
  for (let k = 0; k < 10; k++) {
    const u = ((k / 10 + scroll) % 1 + 1) % 1;
    const p = Math.pow(u, 2.2);
    const y = yH + (near - yH) * p;
    const half = 120 + (W / 2 + 380 - 120) * p;
    ticks.push(<rect key={k} x={vx - half} y={y} width={half * 2} height={2 + 10 * p} fill={line} opacity={0.18 + 0.3 * p} />);
  }
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="trk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.55" />
          <stop offset="1" stopColor={color} />
        </linearGradient>
      </defs>
      <path d={`M${vx - 130},${yH} L${vx + 130},${yH} L${W + 420},${near} L-420,${near} Z`} fill="url(#trk)" />
      {ticks}
      {lines}
    </svg>
  );
};

// Film grain + vignette + gate weave: seeded per frame (deterministic).
export const Finish: React.FC<{ vignette?: number; grain?: number; warm?: string }> = ({ vignette = 0.6, grain = 0.07, warm = "#FFB060" }) => {
  const f = useCurrentFrame();
  const seed = (f * 7) % 97;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 60% at 50% 45%, transparent 45%, rgba(0,0,0,${vignette}) 100%)` }} />
      <AbsoluteFill style={{ background: warm, mixBlendMode: "soft-light", opacity: 0.18 }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: grain, mixBlendMode: "overlay" }}>
        <filter id={`gr${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter={`url(#gr${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

// City skyline (1936 New York) as layered silhouettes.
export const Skyline: React.FC<{ y: number; seed?: number; ink?: string; layer?: number; windows?: string }> = ({ y, seed = 3, ink = "#0B0C10", layer = 1, windows }) => {
  const r = rng(seed);
  let x = -40;
  const els: React.ReactNode[] = [];
  let i = 0;
  while (x < W + 40) {
    const w = 60 + r() * 110 * layer;
    const h = (180 + r() * 520) * layer;
    els.push(<rect key={`b${i}`} x={x} y={y - h} width={w} height={h + 400} fill={ink} />);
    if (r() > 0.6) els.push(<path key={`s${i}`} d={`M${x + w * 0.3},${y - h} L${x + w / 2},${y - h - 90 * layer} L${x + w * 0.7},${y - h} Z`} fill={ink} />);
    if (windows) {
      for (let wy = y - h + 30; wy < y - 20; wy += 34) for (let wx = x + 12; wx < x + w - 14; wx += 26) if (r() > 0.62) els.push(<rect key={`w${i}_${wx}_${wy}`} x={wx} y={wy} width={10} height={14} fill={windows} opacity={0.75} />);
    }
    x += w + 6;
    i++;
  }
  return <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>{els}</svg>;
};
