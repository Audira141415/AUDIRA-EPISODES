// INNERWORKS 2D pieces for EP15 (pure SVG, 1080 × 1920 design space).
// Cutaway look: warm tuff section faces with grain, dark carved cavities with inner shadow, cyan section lines.
// No Math.random: seeded hash only.
import React from "react";

export const C = {
  studio: "#e8eeeb", studio2: "#d3ddd9", cyan: "#00b8d4", cyanLt: "#8fe6f3", orange: "#ff7a3d", red: "#e2483d",
  ink: "#1d2b33", inkSoft: "#4c5c64", chip: "rgba(244,247,246,.93)",
  t1: "#e9c9a0", t2: "#d9ad7c", t3: "#c48d5e", t4: "#9c6a43", t5: "#7a4f33",
  cav: "#4a3426", cav2: "#2a1d16", lamp: "#ffb35c", grass: "#b9b27a", sky: "#cfe6ee",
  ash: "#c9c3ba", ashDk: "#8f8a84", water: "#2f8fb8", goat: "#f2ece0", stone: "#efe0c4",
};

export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ease = (v: number) => { const x = clamp01(v); return x * x * (3 - 2 * x); };
export const easeOut = (v: number) => 1 - Math.pow(1 - clamp01(v), 3);
export const easeIn = (v: number) => Math.pow(clamp01(v), 3);
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const pulse = (t: number, a: number, len = 0.5) => { const k = (t - a) / len; return k < 0 || k > 1 ? 0 : Math.sin(Math.PI * k); };

const toRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
export const mix = (hex: string, to: string, k: number) => {
  const a = toRgb(hex), b = toRgb(to);
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * clamp01(k)).toString(16).padStart(2, "0")).join("");
};

/** Piecewise smooth keyframes [time, value]. */
/** Keyframes with monotone Hermite (harmonic-mean tangents): eases in at the first key and out at the
 *  last, but keeps moving through interior keys that continue in the same direction (no parked camera). */
export const keys = (t: number, k: [number, number][]) => {
  if (t <= k[0][0]) return k[0][1];
  const n = k.length;
  const d = (i: number) => (k[i + 1][1] - k[i][1]) / (k[i + 1][0] - k[i][0]);
  const m = (i: number) => {
    if (i === 0 || i === n - 1) return 0;
    const a = d(i - 1), b = d(i);
    return a * b <= 0 ? 0 : 2 / (1 / a + 1 / b);
  };
  for (let i = 0; i < n - 1; i++) {
    const [a, va] = k[i], [b, vb] = k[i + 1];
    if (t <= b) {
      const h = b - a, u = (t - a) / h, u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * va + (u3 - 2 * u2 + u) * h * m(i) + (-2 * u3 + 3 * u2) * vb + (u3 - u2) * h * m(i + 1);
    }
  }
  return k[n - 1][1];
};

export const cam = (s: number, ox: number, oy: number, tx = 0, ty = 0, rot = 0) =>
  `translate(${ox + tx},${oy + ty}) rotate(${rot}) scale(${s}) translate(${-ox},${-oy})`;

/** Carved chamber: flat floor, curved walls, vaulted ceiling. */
export const vault = (x: number, y: number, w: number, h: number) =>
  `M${x},${y + h} L${x},${y + h * 0.42} C${x},${y + h * 0.04} ${x + w * 0.18},${y} ${x + w / 2},${y} C${x + w * 0.82},${y} ${x + w},${y + h * 0.04} ${x + w},${y + h * 0.42} L${x + w},${y + h} Z`;
export const circle = (x: number, y: number, r: number) => `M${x - r},${y} a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 ${-r * 2},0 Z`;
export const rrect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r},${y} h${w - 2 * r} q${r},0 ${r},${r} v${h - 2 * r} q0,${r} ${-r},${r} h${-(w - 2 * r)} q${-r},0 ${-r},${-r} v${-(h - 2 * r)} q0,${-r} ${r},${-r} Z`;

export const Defs: React.FC = () => (
  <defs>
    <filter id="blur8" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="8" /></filter>
    <filter id="blur18" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="18" /></filter>
    <filter id="blur40" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="40" /></filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={2} seed={11} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.32  0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0.9 -0.32" />
      <feComposite in2="SourceGraphic" operator="in" />
    </filter>
    <filter id="mottle" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.011 0.02" numOctaves={3} seed={4} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.28  0 0 0 0 0.14  0 0 0 1.3 -0.55" />
      <feComposite in2="SourceGraphic" operator="in" />
    </filter>
    <linearGradient id="cavG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={C.cav2} />
      <stop offset="0.7" stopColor={C.cav} />
      <stop offset="1" stopColor="#5c4231" />
    </linearGradient>
    <linearGradient id="tuffG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={C.t1} />
      <stop offset="0.35" stopColor={C.t2} />
      <stop offset="0.75" stopColor={C.t3} />
      <stop offset="1" stopColor={C.t4} />
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0.6">
      <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
      <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity="0.16" />
    </linearGradient>
    <radialGradient id="lampG">
      <stop offset="0" stopColor={C.lamp} stopOpacity="0.85" />
      <stop offset="1" stopColor={C.lamp} stopOpacity="0" />
    </radialGradient>
    <radialGradient id="cyanG">
      <stop offset="0" stopColor={C.cyanLt} stopOpacity="0.9" />
      <stop offset="1" stopColor={C.cyan} stopOpacity="0" />
    </radialGradient>
    <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="14" stroke="#7a4f33" strokeWidth="1.2" strokeOpacity="0.16" />
    </pattern>
  </defs>
);

/** Studio backdrop with soft key light and faint blueprint grid. */
export const Studio: React.FC<{ id: string; top?: string; bottom?: string; grid?: boolean }> = ({ id, top = "#f1f5f3", bottom = C.studio2, grid = true }) => (
  <g>
    <defs>
      <linearGradient id={`st-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
      <radialGradient id={`key-${id}`} cx="0.3" cy="0.18" r="0.7">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect x={-400} y={-400} width={1880} height={2720} fill={`url(#st-${id})`} />
    <rect x={-400} y={-400} width={1880} height={2720} fill={`url(#key-${id})`} />
    {grid ? (
      <g stroke={C.cyan} strokeOpacity={0.09} strokeWidth={1.4}>
        {Array.from({ length: 30 }, (_, i) => <line key={`v${i}`} x1={-360 + i * 72} y1={-400} x2={-360 + i * 72} y2={2320} />)}
        {Array.from({ length: 38 }, (_, i) => <line key={`h${i}`} x1={-400} y1={-360 + i * 72} x2={1480} y2={-360 + i * 72} />)}
      </g>
    ) : null}
  </g>
);

/** Strata lines across a section face (local coords, width w, height h). */
export const Strata: React.FC<{ w: number; h: number; seed?: number; n?: number }> = ({ w, h, seed = 1, n = 14 }) => (
  <g fill="none">
    {Array.from({ length: n }, (_, i) => {
      const y = ((i + 0.5) / n) * h + (hash(seed + i) - 0.5) * 16;
      const a1 = 6 + hash(seed * 3 + i) * 10, a2 = 4 + hash(seed * 5 + i) * 8;
      const pts = Array.from({ length: 13 }, (_, k) => {
        const x = (k / 12) * w;
        return `${x.toFixed(1)},${(y + Math.sin(k * 0.9 + i) * a1 * 0.5 + Math.sin(k * 2.3 + seed) * a2 * 0.35).toFixed(1)}`;
      });
      const band = i % 2 === 0;
      return (
        <g key={i}>
          {band ? <polygon points={`${pts.join(" ")} ${w},${(y + h / n * 0.55).toFixed(1)} 0,${(y + h / n * 0.55).toFixed(1)}`} fill={hash(i + seed * 9) > 0.5 ? C.t4 : "#fff1dc"} fillOpacity={hash(i + seed * 9) > 0.5 ? 0.16 : 0.14} /> : null}
          <polyline points={pts.join(" ")} stroke="#fff3df" strokeOpacity={0.45} strokeWidth={2.2} transform="translate(0,-2.5)" />
          <polyline points={pts.join(" ")} stroke={C.t5} strokeOpacity={0.38 + hash(i + seed) * 0.2} strokeWidth={2.2 + hash(i * 7 + seed) * 2.4} />
        </g>
      );
    })}
  </g>
);

/** Pumice/lapilli inclusions and chisel marks on a tuff section face (deterministic). */
export const Inclusions: React.FC<{ w: number; h: number; seed?: number }> = ({ w, h, seed = 1 }) => {
  const n = Math.round((w * h) / 5200);
  const m = Math.round((w * h) / 26000);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = hash(seed * 13 + i * 3.1) * w, y = hash(seed * 7 + i * 5.7) * h;
        const r = 2.2 + hash(i * 11 + seed) * 6.5;
        const dark = hash(i * 17 + seed * 2) > 0.62;
        return (
          <g key={i}>
            <ellipse cx={x} cy={y + 1.5} rx={r * 1.25} ry={r * 0.8} fill="#5a3a22" opacity={dark ? 0 : 0.22} />
            <ellipse cx={x} cy={y} rx={r * 1.25} ry={r * 0.8} fill={dark ? "#7d5a40" : "#f6e6cc"} opacity={dark ? 0.55 : 0.75} transform={`rotate(${(hash(i + seed) - 0.5) * 50},${x},${y})`} />
          </g>
        );
      })}
      {Array.from({ length: m }, (_, i) => {
        const x = hash(seed * 23 + i * 2.3) * w, y = hash(seed * 29 + i * 4.1) * h;
        const a = (hash(i * 31 + seed) - 0.5) * 70 - 20, L = 14 + hash(i * 37 + seed) * 18;
        return (
          <g key={`c${i}`} transform={`translate(${x},${y}) rotate(${a})`} strokeLinecap="round">
            <path d={`M0,0 q${L / 2},-4 ${L},0`} stroke="#6b4a33" strokeOpacity={0.45} strokeWidth={2.4} fill="none" />
            <path d={`M0,8 q${L / 2},-4 ${L},0`} stroke="#6b4a33" strokeOpacity={0.35} strokeWidth={2} fill="none" />
            <path d={`M0,-2 q${L / 2},-4 ${L},0`} stroke="#fff3df" strokeOpacity={0.4} strokeWidth={1.4} fill="none" />
          </g>
        );
      })}
    </g>
  );
};

/**
 * Ground slab cutaway: front section face (w × h) at (x, y) with a perspective top face and right side face.
 * children draw inside the front face (cavities etc.) in local coords.
 */
export const Slab: React.FC<{ x: number; y: number; w: number; h: number; seed?: number; top?: string; depth?: number; children?: React.ReactNode; id: string }> = ({
  x, y, w, h, seed = 3, top = C.grass, depth = 70, children, id,
}) => {
  const dx = depth, dy = -depth * 0.7;
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <clipPath id={`slab-${id}`}><rect x={0} y={0} width={w} height={h} /></clipPath>
      </defs>
      <ellipse cx={w / 2 + 30} cy={h + 26} rx={w * 0.62} ry={46} fill="#1d2b33" opacity={0.28} filter="url(#blur18)" />
      {/* right side face */}
      <path d={`M${w},0 L${w + dx},${dy} L${w + dx},${h + dy} L${w},${h} Z`} fill={C.t4} />
      <path d={`M${w},0 L${w + dx},${dy} L${w + dx},${h + dy} L${w},${h} Z`} fill="#000" opacity={0.18} />
      {/* top face */}
      <path d={`M0,0 L${w},0 L${w + dx},${dy} L${dx},${dy} Z`} fill={top} />
      <path d={`M0,0 L${w},0 L${w + dx},${dy} L${dx},${dy} Z`} fill="url(#sheen)" />
      {/* front section face */}
      <rect x={0} y={0} width={w} height={h} fill="url(#tuffG)" />
      <g clipPath={`url(#slab-${id})`}>
        <rect x={0} y={0} width={w} height={h} fill="#fff" filter="url(#mottle)" opacity={0.55} />
        <rect x={0} y={0} width={w} height={h} fill="#fff" filter="url(#grain)" opacity={0.8} />
        <Strata w={w} h={h} seed={seed} n={Math.max(6, Math.round(h / 70))} />
        <Inclusions w={w} h={h} seed={seed} />
        <rect x={0} y={0} width={w} height={h} fill="url(#hatch)" />
        {children}
      </g>
      <rect x={0} y={0} width={w} height={h} fill="none" stroke={C.cyan} strokeWidth={3} />
      <path d={`M0,0 L${dx},${dy} L${w + dx},${dy} L${w + dx},${h + dy}`} fill="none" stroke={C.cyan} strokeOpacity={0.55} strokeWidth={2} />
      <line x1={0} y1={-1.5} x2={w} y2={-1.5} stroke="#fff" strokeOpacity={0.7} strokeWidth={2.5} />
    </g>
  );
};

/** Carved cavity: dark interior with inner shadow, warm floor bounce, cyan section outline. */
export const Cavity: React.FC<{ d: string; glow?: [number, number, number]; outline?: boolean; opacity?: number }> = ({ d, glow, outline = true, opacity = 1 }) => (
  <g opacity={opacity}>
    <path d={d} fill="url(#cavG)" />
    {glow ? <ellipse cx={glow[0]} cy={glow[1]} rx={glow[2]} ry={glow[2] * 0.7} fill="url(#lampG)" /> : null}
    <path d={d} fill="none" stroke="#1a110c" strokeOpacity={0.55} strokeWidth={10} transform="translate(0,5)" />
    <path d={d} fill="none" stroke="#f7dcb4" strokeOpacity={0.5} strokeWidth={2.5} transform="translate(0,-2)" />
    {outline ? <path d={d} fill="none" stroke={C.cyan} strokeWidth={2.4} strokeOpacity={0.85} /> : null}
  </g>
);

/** Small oil lamp with flicker. */
export const Lamp: React.FC<{ x: number; y: number; t: number; s?: number; ph?: number }> = ({ x, y, t, s = 1, ph = 0 }) => {
  const f = 1 + 0.12 * Math.sin(t * 13 + ph) + 0.06 * Math.sin(t * 29 + ph * 2);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <circle r={46 * f} fill="url(#lampG)" />
      <path d="M-12,0 q12,10 24,0 l-4,-6 h-16 z" fill={C.t4} />
      <path d={`M0,-6 q-6,-8 0,${-18 * f} q6,10 0,18 z`} fill={C.lamp} />
    </g>
  );
};

/** Pictogram person. y = feet. pose: stand | walk | crouch | push | swing */
export const Person: React.FC<{ x: number; y: number; s?: number; col?: string; pose?: "stand" | "walk" | "crouch" | "push"; t?: number; ph?: number; glow?: number; helmet?: boolean }> = ({
  x, y, s = 1, col = C.ink, pose = "stand", t = 0, ph = 0, glow = 0, helmet,
}) => {
  const step = pose === "walk" || pose === "crouch" ? Math.sin(t * 7 + ph) : 0;
  const lean = pose === "crouch" ? 38 : pose === "push" ? -22 : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {glow > 0 ? <circle cx={0} cy={-55} r={70} fill="url(#cyanG)" opacity={glow} /> : null}
      <rect x={-12 + step * 5} y={-36} width={10} height={36} rx={5} fill={col} transform={`rotate(${step * 14},-7,-36)`} />
      <rect x={2 - step * 5} y={-36} width={10} height={36} rx={5} fill={col} transform={`rotate(${-step * 14},7,-36)`} />
      <g transform={`rotate(${lean},0,-34)`}>
        <rect x={-14} y={-80} width={28} height={48} rx={13} fill={col} />
        {pose === "push" ? <rect x={-34} y={-74} width={36} height={10} rx={5} fill={col} /> : null}
        <circle cx={0} cy={-95} r={14} fill={col} />
        {helmet ? <path d="M-16,-98 a16,16 0 0,1 32,0 z" fill={C.red} /> : null}
      </g>
    </g>
  );
};

export const Goat: React.FC<{ x: number; y: number; s?: number; t?: number; ph?: number }> = ({ x, y, s = 1, t = 0, ph = 0 }) => {
  const nod = Math.sin(t * 2.2 + ph) * 6;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={4} cy={2} rx={44} ry={7} fill="#000" opacity={0.25} />
      {[-26, -12, 16, 30].map((lx, i) => <rect key={i} x={lx} y={-26} width={7} height={26} rx={3} fill="#cfc4b2" />)}
      <ellipse cx={2} cy={-38} rx={40} ry={20} fill={C.goat} />
      <g transform={`rotate(${nod},34,-46)`}>
        <ellipse cx={46} cy={-50} rx={13} ry={11} fill={C.goat} />
        <path d="M44,-60 q8,-14 18,-10" stroke="#8a7a66" strokeWidth={4} fill="none" />
        <circle cx={50} cy={-52} r={2.2} fill={C.ink} />
      </g>
      <ellipse cx={2} cy={-44} rx={30} ry={8} fill="#fff" opacity={0.4} />
    </g>
  );
};

/** Fairy-chimney rock cone (Cappadocia). */
export const Chimney: React.FC<{ x: number; y: number; h: number; w?: number; col?: string; cap?: boolean }> = ({ x, y, h, w = h * 0.38, col = C.t1, cap = true }) => (
  <g transform={`translate(${x},${y})`}>
    <path d={`M${-w / 2},0 C${-w * 0.42},${-h * 0.5} ${-w * 0.18},${-h * 0.92} 0,${-h} C${w * 0.18},${-h * 0.92} ${w * 0.42},${-h * 0.5} ${w / 2},0 Z`} fill={col} />
    <path d={`M0,${-h} C${w * 0.18},${-h * 0.92} ${w * 0.42},${-h * 0.5} ${w / 2},0 L${w * 0.1},0 Z`} fill="#000" opacity={0.12} />
    {cap ? <ellipse cx={0} cy={-h} rx={w * 0.32} ry={w * 0.14} fill={mix(col, "#5a3a26", 0.45)} /> : null}
    <path d={vault(-w * 0.1, -h * 0.42, w * 0.2, h * 0.12)} fill={C.cav} opacity={0.75} />
  </g>
);

/** Label chip with cyan leader line. p = 0..1 appear progress. */
export const Tag: React.FC<{ x: number; y: number; ax: number; ay: number; text: string; p: number; size?: number; accent?: string }> = ({ x, y, ax, ay, text, p, size = 40, accent = C.cyan }) => {
  if (p <= 0) return null;
  const w = text.length * size * 0.62 + 52;
  const h = size * 1.95;
  const k = easeOut(p);
  const lx = lerp(ax, x, k), ly = lerp(ay, y, k);
  return (
    <g opacity={Math.min(1, p * 2)}>
      <line x1={ax} y1={ay} x2={lx} y2={ly} stroke={accent} strokeWidth={3.5} />
      <circle cx={ax} cy={ay} r={8} fill={accent} />
      <circle cx={ax} cy={ay} r={15} fill="none" stroke={accent} strokeWidth={2.5} opacity={1 - k * 0.6} />
      <g transform={`translate(${x},${y}) scale(${0.7 + 0.3 * k})`}>
        <rect x={-w / 2 + 6} y={-h / 2 + 9} width={w} height={h} rx={14} fill="#1d2b33" opacity={0.22} filter="url(#blur8)" />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill="rgb(244,247,246)" fillOpacity={0.95} stroke={accent} strokeWidth={2.5} />
        <rect x={-w / 2} y={-h / 2} width={12} height={h} rx={6} fill={accent} />
        <text x={6} y={size * 0.36} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={size} fill={C.ink} letterSpacing={1}>{text}</text>
      </g>
    </g>
  );
};

/** Flow arrows along a polyline (animated dashes). */
export const Flow: React.FC<{ d: string; t: number; p: number; col?: string; w?: number; speed?: number }> = ({ d, t, p, col = C.cyan, w = 8, speed = 120 }) => {
  if (p <= 0) return null;
  return (
    <g opacity={Math.min(1, p * 1.5)}>
      <path d={d} fill="none" stroke={col} strokeOpacity={0.25} strokeWidth={w * 2.6} strokeLinecap="round" filter="url(#blur8)" />
      <path d={d} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" strokeDasharray="34 26" strokeDashoffset={-t * speed} />
    </g>
  );
};

/** Turkey outline (rough lon/lat), projected into a box. */
const TR: [number, number][] = [
  [26.0, 40.6], [26.6, 41.9], [28.0, 41.6], [29.1, 41.2], [31.2, 41.1], [33.0, 41.95], [35.0, 42.05], [36.6, 41.3], [38.3, 40.95],
  [40.2, 41.0], [41.6, 41.5], [43.4, 41.1], [44.8, 39.7], [44.4, 37.2], [42.3, 37.1], [40.1, 36.9], [38.1, 36.8], [36.7, 36.2],
  [36.0, 36.0], [35.8, 36.75], [34.6, 36.8], [33.1, 36.1], [32.0, 36.55], [30.5, 36.3], [29.2, 36.6], [28.0, 36.8], [27.3, 37.4],
  [26.4, 38.3], [26.8, 39.4], [26.1, 40.0],
];
export const projTR = (lon: number, lat: number, x: number, y: number, w: number) => {
  const sx = w / (45.2 - 25.6);
  return [x + (lon - 25.6) * sx, y + (42.3 - lat) * sx * 1.25] as const;
};
export const turkeyPath = (x: number, y: number, w: number) =>
  "M" + TR.map(([lo, la]) => projTR(lo, la, x, y, w).map((v) => v.toFixed(1)).join(",")).join(" L") + " Z";

/** Round rolling stone door. */
export const StoneDoor: React.FC<{ x: number; y: number; r: number; rot: number }> = ({ x, y, r, rot }) => (
  <g transform={`translate(${x},${y})`}>
    <ellipse cx={18} cy={r + 6} rx={r * 0.9} ry={16} fill="#000" opacity={0.35} filter="url(#blur8)" />
    <circle r={r} fill={C.t3} />
    <circle r={r} fill="#fff" filter="url(#grain)" opacity={0.6} />
    <g transform={`rotate(${rot})`}>
      {Array.from({ length: 10 }, (_, i) => (
        <line key={i} x1={r * 0.3} y1={0} x2={r * 0.92} y2={0} stroke={C.t5} strokeOpacity={0.35} strokeWidth={3} transform={`rotate(${i * 36 + hash(i) * 12})`} />
      ))}
      <circle cx={r * 0.55} cy={0} r={10} fill={C.t5} opacity={0.5} />
    </g>
    <circle r={r * 0.2} fill={C.cav2} />
    <circle r={r * 0.2} fill="none" stroke="#f7dcb4" strokeOpacity={0.5} strokeWidth={3} />
    <circle r={r - 6} fill="none" stroke="#f7dcb4" strokeOpacity={0.45} strokeWidth={5} transform="translate(-3,-4)" />
    <circle r={r} fill="none" stroke={C.cyan} strokeWidth={3} />
  </g>
);

/** Hard tuff chunk debris path. */
export const chunk = (s: number, seed: number) => {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2;
    const r = s * (0.7 + hash(seed + i) * 0.5);
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
  });
  return "M" + pts.join(" L") + " Z";
};
