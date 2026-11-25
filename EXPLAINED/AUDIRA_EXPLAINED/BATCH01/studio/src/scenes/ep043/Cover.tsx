// EP043 cover: "Kok Air Kran Jadi Cokelat?" in WATERCOLOR (storybook watercolour on cold-press paper).
// A paper-diorama Indonesian kitchen: tap pours kopi-susu water into a glass beside a clear one;
// the wall is torn open to show the supply pipe running out to a brown river under rain clouds.
// Everything is a pure function of useCurrentFrame() plus fixed seeds (no Math.random).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const W = 1080;
export const H = 1920;

export const C = {
  paper: "#F7F0E3",
  graphite: "#3C3733",
  wallWash: "#EAD3A8",
  sky: "#BFD5DF",
  skyLow: "#F1E6D0",
  cloud: "#7F90A1",
  hillFar: "#8BA7A2",
  hillMid: "#7C9F78",
  field: "#B2C38A",
  river: "#A57548",
  riverLight: "#D6B48C",
  roof: "#C4664A",
  pine: "#3F6449",
  sage: "#6F9779",
  steel: "#6F8796",
  steelLight: "#C9D6DC",
  rust: "#A0603A",
  chrome: "#9FB0BA",
  chromeDark: "#5D7180",
  wood: "#C99D66",
  woodDark: "#93693F",
  cabinet: "#8EAE95",
  tile: "#D5E2E0",
  kopi: "#B08155",
  kopiDark: "#7A5234",
  foam: "#E6D2B4",
  clear: "#A9CDE0",
  chili: "#C8432F",
  stone: "#6E6A66",
  ochre: "#E8AB48",
  umber: "#7B5943",
};

// --- deterministic helpers -------------------------------------------------------------
export const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export type P = [number, number];

/** Catmull-Rom sample through points. */
export const spline = (pts: P[], per = 12): P[] => {
  const out: P[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < per; s++) {
      const t = s / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

/** Closed ribbon polygon around a centreline with interpolated widths. */
export const ribbon = (pts: P[], w0: number, w1: number): string => {
  const L: P[] = [];
  const R: P[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const w = (w0 + (w1 - w0) * (i / (pts.length - 1))) / 2;
    L.push([p[0] + nx * w, p[1] + ny * w]);
    R.push([p[0] - nx * w, p[1] - ny * w]);
  });
  return "M" + [...L, ...R.reverse()].map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L") + " Z";
};

export const poly = (pts: P[], close = false) =>
  "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L") + (close ? " Z" : "");

/** Torn-paper outline of a rounded rectangle. */
export const tornRect = (x0: number, y0: number, x1: number, y1: number, seed: number, amp = 11, step = 22): string => {
  const r = mulberry32(seed);
  const pts: P[] = [];
  const edge = (ax: number, ay: number, bx: number, by: number) => {
    const len = Math.hypot(bx - ax, by - ay);
    const n = Math.max(2, Math.round(len / step));
    const nx = -(by - ay) / len;
    const ny = (bx - ax) / len;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const j = (r() - 0.5) * 2 * amp + Math.sin(t * 9 + seed) * amp * 0.6;
      pts.push([ax + (bx - ax) * t + nx * j, ay + (by - ay) * t + ny * j]);
    }
  };
  edge(x0, y0 + 40, x0 + 260, y0 - 6);
  edge(x0 + 260, y0 - 6, x1, y0 + 24);
  edge(x1, y0 + 24, x1 - 14, y1);
  edge(x1 - 14, y1, x0 + 12, y1 - 18);
  edge(x0 + 12, y1 - 18, x0, y0 + 40);
  return poly(pts, true);
};

// --- filters ------------------------------------------------------------------------------
export const Wash: React.FC<{ id: string; seed: number; disp: number; freq?: number; rim?: number; gran?: number; blotch?: [number, number]; region?: Region }> = ({
  id,
  seed,
  disp,
  freq = 0.012,
  rim = 3,
  gran = 0.05,
  blotch = [1.1, 0.3],
  region = COVER_REGION,
}) => (
  <filter id={id} filterUnits="userSpaceOnUse" x={region[0]} y={region[1]} width={region[2]} height={region[3]} colorInterpolationFilters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={3} seed={seed} result="n1" />
    <feDisplacementMap in="SourceGraphic" in2="n1" scale={disp} xChannelSelector="R" yChannelSelector="G" result="d" />
    <feMorphology in="d" operator="erode" radius={rim} result="er" />
    <feComposite in="d" in2="er" operator="out" result="rim" />
    <feColorMatrix in="rim" type="matrix" values="0.62 0 0 0 0  0 0.6 0 0 0  0 0 0.6 0 0  0 0 0 0.85 0" result="rimDark" />
    <feTurbulence type="fractalNoise" baseFrequency={gran} numOctaves={2} seed={seed + 5} result="n2" />
    <feColorMatrix in="n2" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${blotch[0]} 0 0 0 ${blotch[1]}`} result="blotch" />
    <feComposite in="d" in2="blotch" operator="in" result="dv" />
    <feMerge>
      <feMergeNode in="dv" />
      <feMergeNode in="rimDark" />
    </feMerge>
  </filter>
);

type Region = [number, number, number, number];
const COVER_REGION: Region = [-60, -60, W + 120, H + 120];

export const Defs: React.FC<{ region?: Region }> = ({ region = COVER_REGION }) => (
  <defs>
    <Wash id="wcBig" seed={3} disp={26} freq={0.008} rim={4} gran={0.02} region={region} />
    <Wash id="wcFlat" seed={17} disp={20} freq={0.008} rim={3} gran={0.012} blotch={[0.55, 0.6]} region={region} />
    <Wash id="wc" seed={7} disp={14} rim={3} region={region} />
    <Wash id="wcSoft" seed={13} disp={7} freq={0.02} rim={2} gran={0.08} region={region} />
    <Wash id="wcFine" seed={21} disp={4} freq={0.035} rim={1.5} gran={0.12} region={region} />
    <filter id="pencil" filterUnits="userSpaceOnUse" x={region[0]} y={region[1]} width={region[2]} height={region[3]}>
      <feTurbulence type="fractalNoise" baseFrequency={0.04} numOctaves={2} seed={31} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={3.5} xChannelSelector="R" yChannelSelector="G" result="d" />
      <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={1} seed={33} result="g" />
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.6 0 0 0 0.05" result="ga" />
      <feComposite in="d" in2="ga" operator="in" />
    </filter>
    <filter id="tear" filterUnits="userSpaceOnUse" x={region[0]} y={region[1]} width={region[2]} height={region[3]}>
      <feTurbulence type="fractalNoise" baseFrequency={0.09} numOctaves={3} seed={41} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={9} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="blur6" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation={6} />
    </filter>
    <filter id="blur14" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation={14} />
    </filter>
    <filter id="paperShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx={0} dy={7} stdDeviation={7} floodColor="#4a3424" floodOpacity={0.28} />
    </filter>
    <filter id="grain" filterUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
      <feTurbulence type="fractalNoise" baseFrequency={0.75} numOctaves={4} seed={5} />
      <feColorMatrix type="matrix" values="0.32 0 0 0 0.72  0.32 0 0 0 0.7  0.32 0 0 0 0.66  0 0 0 0 1" />
    </filter>
    <filter id="cockle" filterUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
      <feTurbulence type="fractalNoise" baseFrequency={0.0035} numOctaves={3} seed={9} />
      <feColorMatrix type="matrix" values="0.22 0 0 0 0.84  0.22 0 0 0 0.82  0.22 0 0 0 0.79  0 0 0 0 1" />
    </filter>
    <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={C.sky} />
      <stop offset="1" stopColor={C.skyLow} />
    </linearGradient>
    <linearGradient id="kopiG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#BC9064" />
      <stop offset="0.55" stopColor={C.kopi} />
      <stop offset="1" stopColor={C.kopiDark} />
    </linearGradient>
    <linearGradient id="clearG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#CFE5EF" />
      <stop offset="1" stopColor="#9CC4DA" />
    </linearGradient>
    <linearGradient id="chromeG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor={C.chromeDark} />
      <stop offset="0.35" stopColor="#DCE5EA" />
      <stop offset="0.6" stopColor={C.chrome} />
      <stop offset="1" stopColor={C.chromeDark} />
    </linearGradient>
    <radialGradient id="sunG" cx="0.85" cy="0.3" r="0.7">
      <stop offset="0" stopColor="#FFE7B5" stopOpacity={0.55} />
      <stop offset="1" stopColor="#FFE7B5" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75">
      <stop offset="0.6" stopColor="#6b4a2c" stopOpacity={0} />
      <stop offset="1" stopColor="#6b4a2c" stopOpacity={0.22} />
    </radialGradient>
  </defs>
);

// --- scene pieces -------------------------------------------------------------------------
export const REVEAL = tornRect(64, 520, 1016, 1010, 77);

export const RIVER_C = spline([
  [470, 655],
  [600, 668],
  [740, 700],
  [880, 760],
  [950, 860],
  [1040, 960],
]);

export const PIPE_C = spline([
  [150, 1030],
  [152, 900],
  [205, 862],
  [380, 838],
  [540, 805],
  [660, 778],
  [722, 764],
]);

export const Landscape: React.FC<{ f: number }> = ({ f }) => {
  const rain = mulberry32(501);
  const drops = Array.from({ length: 46 }, () => [90 + rain() * 420, 560 + rain() * 70, 30 + rain() * 40] as const);
  const trees = mulberry32(611);
  const treeSpots: P[] = [
    [96, 712], [130, 700], [520, 690], [560, 700], [612, 704], [700, 682], [890, 700], [960, 712], [990, 730], [300, 690],
  ];
  return (
    <g>
      <rect x={0} y={480} width={W} height={560} fill="url(#skyG)" filter="url(#wcBig)" />
      {/* warm sun break on the right, rain on the left: upstream rain feeds the brown river */}
      <circle cx={900} cy={600} r={150} fill="#FFE2A6" opacity={0.6} filter="url(#blur14)" />
      <g filter="url(#wc)" opacity={0.85}>
        <ellipse cx={210} cy={575} rx={150} ry={48} fill={C.cloud} />
        <ellipse cx={330} cy={560} rx={130} ry={55} fill="#8C9BAA" />
        <ellipse cx={440} cy={585} rx={110} ry={38} fill={C.cloud} />
        <ellipse cx={120} cy={590} rx={90} ry={32} fill="#93A2AF" />
      </g>
      <g filter="url(#pencil)" stroke="#5B6B78" strokeWidth={2} opacity={0.55}>
        {drops.map(([x, y, l], i) => (
          <line key={i} x1={x} y1={y + 30} x2={x - l * 0.3} y2={y + 30 + l} />
        ))}
      </g>
      <path d="M0,672 C120,610 230,640 330,618 C450,592 560,640 680,615 C800,592 920,630 1080,600 L1080,760 L0,760 Z" fill={C.hillFar} opacity={0.82} filter="url(#wcBig)" />
      <path d="M0,705 C150,668 260,690 400,672 C520,656 640,690 760,676 C880,664 980,690 1080,676 L1080,1040 L0,1040 Z" fill={C.hillMid} opacity={0.85} filter="url(#wc)" />
      <path d="M0,760 C200,730 420,750 640,736 C820,724 960,746 1080,740 L1080,1040 L0,1040 Z" fill={C.field} opacity={0.9} filter="url(#wc)" />
      {/* village on the far bank */}
      <g filter="url(#wcSoft)">
        {[
          [330, 676, 34], [372, 682, 28], [420, 672, 30], [820, 690, 26], [856, 696, 22],
        ].map(([x, y, s], i) => (
          <g key={i}>
            <rect x={x - s / 2} y={y - s * 0.55} width={s} height={s * 0.55} fill="#F2E5CC" />
            <path d={`M${x - s * 0.62},${y - s * 0.5} L${x},${y - s * 0.95} L${x + s * 0.62},${y - s * 0.5} Z`} fill={C.roof} />
          </g>
        ))}
      </g>
      {/* the brown, kopi-susu river */}
      <path d={ribbon(RIVER_C.map(([x, y]) => [x, y + 6] as P), 22, 206)} fill={C.umber} opacity={0.55} filter="url(#wc)" />
      <path d={ribbon(RIVER_C, 16, 190)} fill={C.river} opacity={0.95} filter="url(#wc)" />
      <path d={ribbon(RIVER_C.map(([x, y]) => [x - 6, y - 10] as P), 5, 64)} fill="#C9A47A" opacity={0.75} filter="url(#wcSoft)" />
      <g filter="url(#pencil)" stroke={C.riverLight} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.9}>
        {[0.2, 0.32, 0.44, 0.55, 0.64, 0.72, 0.8, 0.87, 0.94].map((t, i) => {
          const p = RIVER_C[Math.floor(t * (RIVER_C.length - 1))];
          const w = 10 + t * 34;
          const o = Math.sin(f / 12 + i) * 4 + (i % 2 ? -1 : 1) * t * 40;
          return (
            <g key={i}>
              <path d={`M${p[0] - w + o},${p[1] + 2} q${w * 0.25},-7 ${w * 0.5},0 q${w * 0.25},7 ${w * 0.5},0`} />
              <path d={`M${p[0] - w * 0.4 - o},${p[1] + 12 + t * 14} q${w * 0.2},-5 ${w * 0.4},0`} strokeWidth={2} opacity={0.7} />
            </g>
          );
        })}
      </g>
      {/* small wooden perahu so the brown band reads as a river */}
      <g filter="url(#wcFine)" transform={`translate(44 ${-6 + Math.sin(f / 10) * 1.5})`}>
        <path d="M842,846 C858,866 912,868 934,850 Z" fill={C.umber} stroke={C.graphite} strokeWidth={2} />
        <line x1={888} y1={852} x2={888} y2={812} stroke={C.graphite} strokeWidth={2.5} />
        <path d="M890,814 L914,846 L890,846 Z" fill="#F4ECDD" />
        <path d="M836,872 q20,-5 40,0 q20,5 40,0 q20,-5 30,0" stroke={C.riverLight} strokeWidth={3} fill="none" />
      </g>
      {treeSpots.map(([x, y], i) => {
        const s = 22 + trees() * 18;
        return (
          <g key={i} filter="url(#wcSoft)">
            <rect x={x - 2.5} y={y - 4} width={5} height={14} fill={C.umber} />
            <ellipse cx={x} cy={y - s * 0.55} rx={s * 0.62} ry={s * 0.7} fill={i % 2 ? C.pine : C.sage} opacity={0.92} />
          </g>
        );
      })}
      {/* coconut palm near the house, Indonesian cue */}
      <g filter="url(#wcSoft)">
        <path d="M262,860 C268,800 262,760 276,712" stroke={C.umber} strokeWidth={7} fill="none" />
        {[[-70, -10], [-50, 22], [10, 30], [60, 12], [64, -18], [-10, -34]].map(([dx, dy], i) => (
          <path key={i} d={`M276,712 Q${276 + dx * 0.5},${712 + dy - 22} ${276 + dx},${712 + dy}`} stroke={C.pine} strokeWidth={9} fill="none" strokeLinecap="round" />
        ))}
      </g>
      {/* intake hut on the near bank */}
      <g filter="url(#wcSoft)">
        <rect x={706} y={732} width={56} height={36} fill="#E9DCC4" />
        <path d="M698,736 L734,712 L770,736 Z" fill={C.umber} />
        <path d="M760,756 C790,754 800,744 806,722" stroke={C.steel} strokeWidth={8} fill="none" strokeLinecap="round" />
      </g>
      <Pipe />
    </g>
  );
};

export const Pipe: React.FC = () => {
  const n = PIPE_C.length;
  const width = (i: number) => 40 - (i / (n - 1)) * 30;
  const segs = PIPE_C.slice(0, -1).map((p, i) => [p, PIPE_C[i + 1], width(i)] as const);
  const bands = [0.12, 0.3, 0.46, 0.6, 0.72, 0.83, 0.92];
  return (
    <g>
      {/* shadow on the ground */}
      <path d={poly(PIPE_C.map(([x, y]) => [x + 6, y + 18] as P))} stroke="#4f5a3a" strokeOpacity={0.3} strokeWidth={22} fill="none" filter="url(#blur6)" />
      {/* support posts */}
      <g filter="url(#wcSoft)">
        {[0.38, 0.5, 0.62, 0.74, 0.86].map((t, i) => {
          const p = PIPE_C[Math.floor(t * (n - 1))];
          const w = width(Math.floor(t * (n - 1)));
          return <rect key={i} x={p[0] - 3} y={p[1]} width={6} height={w * 0.9 + 6} fill={C.umber} />;
        })}
      </g>
      <g filter="url(#wcSoft)" strokeLinecap="round" fill="none">
        {segs.map(([a, b, w], i) => (
          <line key={`o${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.graphite} strokeWidth={w + 5} />
        ))}
        {segs.map(([a, b, w], i) => (
          <line key={`f${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.steel} strokeWidth={w} />
        ))}
        {segs.map(([a, b, w], i) => (
          <line key={`h${i}`} x1={a[0] - w * 0.18} y1={a[1] - w * 0.22} x2={b[0] - w * 0.18} y2={b[1] - w * 0.22} stroke={C.steelLight} strokeWidth={w * 0.22} />
        ))}
      </g>
      <g filter="url(#wcFine)">
        {bands.map((t, i) => {
          const k = Math.floor(t * (n - 1));
          const p = PIPE_C[k];
          const q = PIPE_C[Math.min(n - 1, k + 1)];
          const ang = (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI;
          const w = width(k);
          return (
            <rect
              key={i}
              x={p[0] - w * 0.18}
              y={p[1] - w * 0.62}
              width={w * 0.36}
              height={w * 1.24}
              rx={2}
              fill={i % 3 === 1 ? C.rust : "#56697A"}
              transform={`rotate(${ang + 0} ${p[0]} ${p[1]})`}
            />
          );
        })}
      </g>
    </g>
  );
};

export const Wall: React.FC = () => {
  const r = mulberry32(919);
  const tiles: React.ReactNode[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = -1; col < 12; col++) {
      const x = col * 100 + (row % 2) * 50;
      const y = 1012 + row * 60;
      const tint = r();
      tiles.push(
        <rect key={`${row}-${col}`} x={x + 3} y={y + 3} width={94} height={54} rx={4} fill={tint > 0.75 ? "#C4D7D6" : C.tile} opacity={0.75 + tint * 0.25} />,
      );
    }
  }
  return (
    <g>
      <rect x={-80} y={-80} width={W + 160} height={1360} fill={C.wallWash} opacity={0.75} filter="url(#wcFlat)" />
      <g filter="url(#wcSoft)">{tiles}</g>
      <g filter="url(#pencil)" stroke={C.graphite} strokeWidth={1.6} opacity={0.45} fill="none">
        {[0, 1, 2, 3, 4].map((row) => (
          <line key={row} x1={0} y1={1012 + row * 60} x2={W} y2={1012 + row * 60} />
        ))}
      </g>
    </g>
  );
};

export const RevealHole: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <clipPath id="revealClip">
      <path d={REVEAL} />
    </clipPath>
    <g clipPath="url(#revealClip)">
      <Landscape f={f} />
      {/* inner shadow: the wall paper sits in front of the view */}
      <path d={REVEAL} fill="none" stroke="#3b2816" strokeOpacity={0.45} strokeWidth={40} filter="url(#blur14)" />
    </g>
    {/* deckled torn rim of the wall sheet */}
    <path d={REVEAL} fill="none" stroke="#FCF8EF" strokeWidth={14} filter="url(#tear)" />
    <path d={REVEAL} fill="none" stroke={C.graphite} strokeWidth={1.6} opacity={0.4} filter="url(#pencil)" transform="translate(0,-8) scale(1)" />
  </g>
);

export const Counter: React.FC = () => {
  return (
    <g>
      {/* counter shadow on the wall */}
      <rect x={0} y={1236} width={W} height={30} fill="#5a3f28" opacity={0.25} filter="url(#blur6)" />
      <g filter="url(#paperShadow)">
        <path d="M-20,1248 L1100,1248 L1100,1318 L-20,1318 Z" fill={C.wood} filter="url(#wc)" />
      </g>
      <g filter="url(#pencil)" stroke={C.woodDark} strokeWidth={2} opacity={0.6} fill="none">
        <path d="M0,1268 C200,1262 420,1272 700,1264 C860,1260 980,1270 1080,1266" />
        <path d="M0,1292 C260,1298 540,1288 800,1294 C920,1296 1020,1290 1080,1292" />
      </g>
      <g filter="url(#paperShadow)">
        <rect x={-80} y={1316} width={1240} height={700} fill={C.cabinet} filter="url(#wcFlat)" />
      </g>
      <rect x={-20} y={1316} width={1120} height={26} fill="#5a3f28" opacity={0.22} filter="url(#blur6)" />
      <g filter="url(#pencil)" stroke={C.graphite} strokeWidth={2.2} opacity={0.55} fill="none">
        <rect x={60} y={1372} width={460} height={500} rx={8} />
        <rect x={560} y={1372} width={460} height={500} rx={8} />
        <rect x={90} y={1402} width={400} height={440} rx={6} opacity={0.6} />
        <rect x={590} y={1402} width={400} height={440} rx={6} opacity={0.6} />
      </g>
      <g filter="url(#wcFine)">
        <rect x={472} y={1560} width={14} height={70} rx={7} fill={C.ochre} />
        <rect x={594} y={1560} width={14} height={70} rx={7} fill={C.ochre} />
      </g>
    </g>
  );
};

export const Towel: React.FC = () => {
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 4; c++) {
      if ((r + c) % 2 === 0) cells.push(<rect key={`${r}${c}`} x={120 + c * 34} y={1336 + r * 34} width={34} height={34} fill={C.chili} opacity={0.7} />);
    }
  }
  return (
    <g filter="url(#paperShadow)">
      <g filter="url(#wcSoft)">
        <path d="M112,1318 C130,1312 240,1312 262,1318 L270,1576 C220,1586 160,1584 116,1578 Z" fill="#F8EFE2" />
        <clipPath id="towelClip">
          <path d="M112,1318 C130,1312 240,1312 262,1318 L270,1576 C220,1586 160,1584 116,1578 Z" />
        </clipPath>
        <g clipPath="url(#towelClip)">{cells}</g>
      </g>
      <path d="M104,1318 L272,1318" stroke={C.woodDark} strokeWidth={10} strokeLinecap="round" filter="url(#wcFine)" />
    </g>
  );
};

export const GLASS_A = { cx: 420, rim: 952, bot: 1286, rt: 122, rb: 98, water: 1012 };
export const GLASS_B = { cx: 760, rim: 1040, bot: 1282, rt: 98, rb: 80, water: 1080 };

export const glassBody = (g: typeof GLASS_A) =>
  `M${g.cx - g.rt},${g.rim} L${g.cx - g.rb},${g.bot} A${g.rb},16 0 0 0 ${g.cx + g.rb},${g.bot} L${g.cx + g.rt},${g.rim} Z`;
export const halfAt = (g: typeof GLASS_A, y: number) => g.rt + ((g.rb - g.rt) * (y - g.rim)) / (g.bot - g.rim);
export const waterBody = (g: typeof GLASS_A) => {
  const hw = halfAt(g, g.water);
  return `M${g.cx - hw},${g.water} L${g.cx - g.rb},${g.bot} A${g.rb},16 0 0 0 ${g.cx + g.rb},${g.bot} L${g.cx + hw},${g.water} Z`;
};

export const Glass: React.FC<{ g: typeof GLASS_A; murky: boolean; f: number }> = ({ g, murky, f }) => {
  const hw = halfAt(g, g.water);
  const hasWater = g.bot - g.water > 40;
  const r = mulberry32(murky ? 1301 : 1409);
  const specks = Array.from({ length: murky ? 70 : 10 }, () => {
    const y = g.water + 20 + r() * (g.bot - g.water - 20);
    const w = halfAt(g, y) - 10;
    return [g.cx + (r() * 2 - 1) * w, y, 1.5 + r() * (murky ? 4 : 2.5), r()] as const;
  });
  return (
    <g>
      {/* cast shadow + tinted caustic on the counter */}
      <ellipse cx={g.cx + 40} cy={g.bot + 10} rx={g.rb + 46} ry={20} fill="#4a3424" opacity={0.25} filter="url(#blur6)" />
      <ellipse cx={g.cx + 60} cy={g.bot + 12} rx={g.rb * 0.7} ry={10} fill={murky ? "#C08A50" : "#BFE3F2"} opacity={0.75} filter="url(#blur6)" />
      {/* glass back wall */}
      <path d={glassBody(g)} fill="#E6EFF2" opacity={0.35} filter="url(#wcSoft)" />
      {/* water */}
      {hasWater && <path d={waterBody(g)} fill={murky ? "url(#kopiG)" : "url(#clearG)"} opacity={murky ? 0.96 : 0.8} filter="url(#wcSoft)" />}
      {hasWater && murky && (
        <g filter="url(#wcFine)">
          {/* swirling silt clouds */}
          <path d={`M${g.cx - hw + 20},${g.water + 70} C${g.cx - 30},${g.water + 30} ${g.cx + 40},${g.water + 120} ${g.cx + hw - 24},${g.water + 80}`} stroke="#D7B58E" strokeWidth={16} fill="none" opacity={0.55} />
          <path d={`M${g.cx - hw + 30},${g.water + 160} C${g.cx},${g.water + 120} ${g.cx + 20},${g.water + 200} ${g.cx + hw - 30},${g.water + 150}`} stroke="#8E6340" strokeWidth={14} fill="none" opacity={0.5} />
          {/* settled sediment */}
          <ellipse cx={g.cx} cy={g.bot - 6} rx={g.rb - 8} ry={14} fill="#5E3E26" opacity={0.7} />
        </g>
      )}
      <g opacity={hasWater ? 1 : 0}>
        {specks.map(([x, y, s, k], i) => (
          <circle key={i} cx={x} cy={y} r={s} fill={murky ? (k > 0.5 ? "#5E3E26" : "#D9BA94") : "#FFFFFF"} opacity={murky ? 0.75 : 0.85} />
        ))}
      </g>
      {/* surface */}
      {hasWater && <ellipse cx={g.cx} cy={g.water} rx={hw} ry={15} fill={murky ? C.foam : "#DDF0F8"} opacity={0.95} filter="url(#wcFine)" />}
      {hasWater && murky && (
        <g filter="url(#wcFine)">
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2 + f * 0.02;
            return <circle key={i} cx={g.cx + Math.cos(a) * hw * 0.72} cy={g.water + Math.sin(a) * 9} r={4 + (i % 3) * 2} fill="#F6EBDA" opacity={0.9} />;
          })}
        </g>
      )}
      {/* glass walls, rim, thick base */}
      <path d={glassBody(g)} fill="none" stroke={C.graphite} strokeWidth={2.4} opacity={0.75} filter="url(#pencil)" />
      <ellipse cx={g.cx} cy={g.rim} rx={g.rt} ry={20} fill="none" stroke={C.graphite} strokeWidth={2.4} opacity={0.75} filter="url(#pencil)" />
      <ellipse cx={g.cx} cy={g.rim} rx={g.rt - 5} ry={16} fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={0.8} />
      <path d={`M${g.cx - g.rb + 4},${g.bot - 14} A${g.rb - 4},14 0 0 0 ${g.cx + g.rb - 4},${g.bot - 14}`} stroke="#FFFFFF" strokeWidth={5} fill="none" opacity={0.55} filter="url(#wcFine)" />
      {/* highlights */}
      <g filter="url(#wcFine)" stroke="#FFFFFF" strokeLinecap="round" fill="none">
        <line x1={g.cx - g.rt + 26} y1={g.rim + 30} x2={g.cx - g.rb + 22} y2={g.bot - 34} strokeWidth={12} opacity={0.75} />
        <line x1={g.cx - g.rt + 50} y1={g.rim + 40} x2={g.cx - g.rb + 42} y2={g.rim + 140} strokeWidth={5} opacity={0.6} />
        <line x1={g.cx + g.rt - 22} y1={g.rim + 50} x2={g.cx + g.rb - 18} y2={g.bot - 60} strokeWidth={4} opacity={0.5} />
      </g>
    </g>
  );
};

export const SPOUT: P = [420, 790];

export const Faucet: React.FC = () => (
  <g>
    {/* shadow of faucet on the tiles */}
    <path d="M275,1250 L275,800 C275,640 440,640 446,780" stroke="#4a3424" strokeOpacity={0.18} strokeWidth={44} fill="none" filter="url(#blur14)" />
    <ellipse cx={250} cy={1262} rx={62} ry={16} fill="#4a3424" opacity={0.3} filter="url(#blur6)" />
    <g filter="url(#wcSoft)">
      <ellipse cx={250} cy={1256} rx={54} ry={16} fill={C.chromeDark} />
      <rect x={214} y={1210} width={72} height={46} rx={10} fill="url(#chromeG)" />
      <path d="M250,1220 L250,800 C250,620 420,620 420,780" stroke={C.graphite} strokeWidth={46} fill="none" strokeLinecap="butt" />
      <path d="M250,1220 L250,800 C250,620 420,620 420,780" stroke={C.chromeDark} strokeWidth={40} fill="none" />
      <path d="M244,1220 L244,800 C244,628 414,628 414,780" stroke={C.chrome} strokeWidth={26} fill="none" />
      <path d="M240,1200 L240,806 C240,660 360,632 400,690" stroke="#F4F8FA" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.9} />
      {/* spout tip */}
      <rect x={396} y={772} width={48} height={24} rx={6} fill={C.chromeDark} stroke={C.graphite} strokeWidth={2} />
      <rect x={402} y={776} width={14} height={16} rx={3} fill="#E9F0F3" opacity={0.8} />
      {/* lever */}
      <path d="M250,1040 L172,990" stroke={C.graphite} strokeWidth={22} strokeLinecap="round" />
      <path d="M250,1040 L172,990" stroke={C.chrome} strokeWidth={16} strokeLinecap="round" />
      <circle cx={250} cy={1040} r={20} fill="url(#chromeG)" stroke={C.graphite} strokeWidth={2} />
    </g>
  </g>
);

const lerpHex = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
};

/** len: 0..1 how far the stream has fallen; mix: 0 kopi-susu .. 1 clear. Defaults = cover. */
export const Stream: React.FC<{ f: number; len?: number; mix?: number; bottom?: number }> = ({ f, len = 1, mix = 0, bottom }) => {
  if (len <= 0) return null;
  const top = SPOUT[1] + 4;
  const full = bottom ?? GLASS_A.water;
  const bot = top + (full - top) * Math.min(1, len);
  const kopi = lerpHex(C.kopi, "#B9DCEC", mix);
  const light = lerpHex("#E4C9A4", "#F2FAFD", mix);
  const dark = lerpHex(C.kopiDark, "#7FAFC8", mix);
  const pts: P[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    pts.push([SPOUT[0] + Math.sin(t * 7 + f * 0.4) * 2.5 * t, top + (bot - top) * t]);
  }
  const r = mulberry32(1777);
  const drops = Array.from({ length: 14 }, () => {
    const a = Math.PI + r() * Math.PI;
    const d = 30 + r() * 70;
    return [SPOUT[0] + Math.cos(a) * d * 1.4, bot - 8 + Math.sin(a) * d * 0.55, 3 + r() * 6] as const;
  });
  return (
    <g>
      <path d={ribbon(pts, 26, 20)} fill={kopi} filter="url(#wcFine)" />
      <path d={ribbon(pts.map(([x, y]) => [x - 5, y] as P), 7, 4)} fill={light} opacity={0.85} filter="url(#wcFine)" />
      <path d={ribbon(pts.map(([x, y]) => [x + 7, y] as P), 4, 3)} fill={dark} opacity={0.6} filter="url(#wcFine)" />
      <g filter="url(#wcFine)">
        {len >= 1 && <ellipse cx={SPOUT[0]} cy={bot} rx={46} ry={11} fill={lerpHex("#F6EBDA", "#FFFFFF", mix)} opacity={0.9} />}
        {len >= 1 &&
          drops.map(([x, y, s], i) => (
            <circle key={i} cx={x} cy={y} r={s} fill={i % 3 ? kopi : light} opacity={0.9} />
          ))}
      </g>
    </g>
  );
};

export const Cobek: React.FC = () => (
  <g filter="url(#paperShadow)">
    <g filter="url(#wcSoft)">
      <path d="M842,1262 C846,1320 900,1344 968,1344 C1036,1344 1090,1320 1094,1262 Z" fill={C.stone} />
      <ellipse cx={968} cy={1262} rx={126} ry={26} fill="#8A847E" />
      <ellipse cx={968} cy={1264} rx={106} ry={18} fill="#5E5955" />
      {[[920, 1252, -20], [950, 1246, 15], [990, 1250, -8], [1020, 1256, 30], [968, 1258, 5]].map(([x, y, a], i) => (
        <g key={i} transform={`rotate(${a} ${x} ${y})`}>
          <path d={`M${x - 30},${y} C${x - 20},${y - 12} ${x + 22},${y - 10} ${x + 32},${y + 2} C${x + 20},${y + 6} ${x - 18},${y + 8} ${x - 30},${y} Z`} fill={C.chili} />
          <path d={`M${x + 30},${y} l10,-6`} stroke={C.pine} strokeWidth={4} strokeLinecap="round" />
        </g>
      ))}
      <ellipse cx={936} cy={1262} rx={12} ry={9} fill="#F3EAD9" />
      <path d="M1010,1240 L1072,1150" stroke="#7F7A74" strokeWidth={26} strokeLinecap="round" />
    </g>
  </g>
);

export const Title: React.FC<{ f: number }> = ({ f }) => {
  const o = Math.min(1, f / 8);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 196, textAlign: "center", opacity: o }}>
      <div
        style={{
          fontFamily: "Georgia, 'Palatino Linotype', serif",
          fontSize: 28,
          letterSpacing: 9,
          color: C.umber,
          fontWeight: 700,
        }}
      >
        AUDIRA EXPLAINED
      </div>
      <div
        style={{
          marginTop: 18,
          fontFamily: "Georgia, 'Palatino Linotype', serif",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 108,
          lineHeight: 1.04,
          color: "#2C2723",
          letterSpacing: -1,
        }}
      >
        Kok Air Kran
        <br />
        Jadi <span style={{ color: "#8A5530" }}>Cokelat?</span>
      </div>
    </div>
  );
};

export const Ep043CoverArt: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Defs />
        <rect x={0} y={0} width={W} height={H} fill={C.paper} />
        <Wall />
        <rect x={0} y={0} width={W} height={1300} fill="url(#sunG)" />
        {/* brush swash under the title */}
        <path d="M250,430 C420,404 680,412 860,426 C880,440 860,452 840,452 C640,440 420,440 262,456 C236,452 236,436 250,430 Z" fill={C.ochre} opacity={0.55} filter="url(#wc)" />
        <g filter="url(#paperShadow)">
          <RevealHole f={f} />
        </g>
        <Counter />
        <Towel />
        <Faucet />
        <Glass g={GLASS_B} murky={false} f={f} />
        <Glass g={GLASS_A} murky f={f} />
        <Stream f={f} />
        <Cobek />
        {/* kopi-susu drips running off the counter edge */}
        <g filter="url(#wcFine)">
          <ellipse cx={500} cy={1300} rx={70} ry={9} fill={C.kopi} opacity={0.75} />
          <path d="M520,1300 C522,1330 518,1352 522,1372 C526,1384 514,1386 514,1372 C512,1350 510,1326 512,1300 Z" fill={C.kopi} opacity={0.85} />
          <path d="M548,1302 C549,1318 547,1330 549,1340 C551,1348 543,1349 543,1340 C542,1328 542,1316 543,1302 Z" fill={C.kopi} opacity={0.85} />
          <ellipse cx={518} cy={1408 + (f % 30) * 0.8} rx={6} ry={8} fill={C.kopi} opacity={0.85} />
        </g>
        {/* paper texture over everything */}
        <rect x={0} y={0} width={W} height={H} filter="url(#cockle)" style={{ mixBlendMode: "multiply" }} />
        <rect x={0} y={0} width={W} height={H} filter="url(#grain)" style={{ mixBlendMode: "multiply" }} opacity={0.55} />
        <rect x={0} y={0} width={W} height={H} fill="url(#vig)" />
      </svg>
      <Title f={f} />
    </AbsoluteFill>
  );
};
