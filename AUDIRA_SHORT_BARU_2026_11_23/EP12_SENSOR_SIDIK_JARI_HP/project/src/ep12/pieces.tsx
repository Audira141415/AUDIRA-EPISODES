// BONGKAR pieces for EP12 (pure SVG, 1080 × 1920 design space). Studio-grey exploded views,
// black label chips with red dot + leader line. No Math.random: seeded hash only.
import React from "react";

export const C = {
  bgTop: "#eceef0", bgBot: "#dddbd6", ink: "#1e1f22", chip: "#1b1b1c", red: "#c0141c", orange: "#ef9420",
  metalLt: "#bfc2c6", metalDk: "#80858b", glass: "#cfe3ee", oled: "#15171c", pix: "#3ad0ff",
  skin: "#e9b796", skinDk: "#c98d6c", ridge: "#b9785a", grey: "#6b6e73", white: "#ffffff", green: "#2e9e5b", paper: "#f7f7f5",
};
export const FONT = "Plus Jakarta Sans";

export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ease = (v: number) => { const x = clamp01(v); return x * x * (3 - 2 * x); };
export const easeOut = (v: number) => 1 - Math.pow(1 - clamp01(v), 4);
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** Spring-ish pop 0→1 with small overshoot. */
export const pop = (t: number, a: number, d = 0.6) => {
  const x = clamp01((t - a) / d);
  if (x <= 0) return 0;
  return 1 - Math.exp(-6 * x) * Math.cos(7 * x) * (1 - x * 0.0);
};

const toRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
export const mix = (hex: string, to: string, k: number) => {
  const a = toRgb(hex), b = toRgb(to);
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, "0")).join("");
};

export const Defs: React.FC = () => (
  <defs>
    <filter id="blur8" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="8" /></filter>
    <filter id="blur20" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="20" /></filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#e4e6e9" /><stop offset="0.35" stopColor={C.metalLt} />
      <stop offset="0.6" stopColor={C.metalDk} /><stop offset="1" stopColor="#d3d5d8" />
    </linearGradient>
    <linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#eef6fb" stopOpacity="0.85" /><stop offset="0.5" stopColor={C.glass} stopOpacity="0.55" />
      <stop offset="1" stopColor="#a9c8d8" stopOpacity="0.7" />
    </linearGradient>
    <linearGradient id="skinG" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stopColor="#f2c7a8" /><stop offset="1" stopColor={C.skinDk} />
    </linearGradient>
    <linearGradient id="screenG" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stopColor="#262a33" /><stop offset="1" stopColor="#0d0f13" />
    </linearGradient>
  </defs>
);

export const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0Z`;

export const Contact: React.FC<{ x: number; y: number; rx: number; ry: number; o?: number }> = ({ x, y, rx, ry, o = 0.22 }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`rgba(30,25,20,${o})`} filter="url(#blur20)" />
);

/** Black chip label with red dot at the anchor and a thin leader line (BONGKAR signature). */
export const Label: React.FC<{ x: number; y: number; ax: number; ay: number; text: string; k?: number; size?: number; dark?: boolean }> = ({ x, y, ax, ay, text, k = 1, size = 40, dark = true }) => {
  if (k <= 0) return null;
  const w = text.length * size * 0.6 + size * 1.1;
  const h = size * 1.7;
  const left = x < ax;
  const bx = Math.max(48, Math.min(1032 - w, left ? x - w : x));
  const ex = left ? bx + w : bx;
  return (
    <g opacity={clamp01(k * 1.5)}>
      <line x1={ex} y1={y} x2={lerp(ex, ax, clamp01(k))} y2={lerp(y, ay, clamp01(k))} stroke={C.chip} strokeWidth={3} />
      <circle cx={ax} cy={ay} r={9 * clamp01(k)} fill={C.red} stroke={C.white} strokeWidth={3} />
      <g transform={`translate(${bx + w / 2},${y}) scale(${0.85 + 0.15 * clamp01(k)}) translate(${-w / 2},0)`}>
        <rect x={3} y={-h / 2 + 5} width={w} height={h} rx={10} fill="rgba(0,0,0,.18)" filter="url(#blur8)" />
        <rect x={0} y={-h / 2} width={w} height={h} rx={10} fill={dark ? C.chip : C.white} />
        <g style={{ backgroundColor: dark ? C.chip : C.white }}>
          <text x={w / 2} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={size} fill={dark ? C.white : C.ink} style={{ color: dark ? C.white : C.ink }}>{text}</text>
        </g>
      </g>
    </g>
  );
};

/** Header block: red kicker, black title, optional counter "1 / 3 cara". */
export const Header: React.FC<{ kicker: string; title: string; n?: number; k?: number }> = ({ kicker, title, n, k = 1 }) => (
  <g opacity={k} transform={`translate(0,${(1 - k) * -20})`}>
    <text x={540} y={232} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} letterSpacing={6} fill={C.red} style={{ color: C.red }}>{kicker}</text>
    <text x={540} y={318} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={76} fill={C.ink} style={{ color: C.ink }}>{title}</text>
    {n ? (
      <text x={540} y={408} textAnchor="middle" fontFamily={FONT} fill={C.ink} style={{ color: C.ink }}>
        <tspan fontWeight={800} fontSize={72}>{n}</tspan>
        <tspan fontWeight={500} fontSize={40} fill={C.grey}> / 3 cara</tspan>
      </text>
    ) : null}
  </g>
);

// ── Fingerprint: procedural whorl, same seed = same finger everywhere ──────────────────
/** Ridge field value in [-1,1]; > 0 = ridge. Used for dot maps and ridge lines alike. */
export const ridgeField = (dx: number, dy: number, gap: number) => {
  const r = Math.sqrt((dx / 0.8) ** 2 + (dy / 1.04) ** 2);
  const a = Math.atan2(dy, dx);
  return Math.sin((r / gap) * Math.PI * 2 + 0.9 * Math.sin(2 * a + 0.4) + 0.5 * Math.sin(3 * a));
};

type Ring = { d: string; gapA: number; gapB: number; k: number };
const RING_CACHE = new Map<string, Ring[]>();
export const fingerRings = (n: number, gap: number, seed: number): Ring[] => {
  const key = `${n}-${gap}-${seed}`;
  const hit = RING_CACHE.get(key);
  if (hit) return hit;
  const out: Ring[] = [];
  for (let k = 1; k <= n; k++) {
    const hasGap = hash(seed + k * 3.1) > 0.35;
    const g0 = hash(seed + k * 9.7) * Math.PI * 2;
    const gl = hasGap ? 0.25 + hash(seed + k * 1.3) * 0.5 : 0;
    const pts: string[] = [];
    const steps = 48 + k * 4;
    for (let i = 0; i <= steps; i++) {
      const a = g0 + gl + (i / steps) * (Math.PI * 2 - gl);
      const r = k * gap * (1 + 0.07 * Math.sin(3 * a + k * 0.7) + 0.04 * Math.sin(5 * a + k));
      let y = Math.sin(a) * r * 1.08;
      const x = Math.cos(a) * r * 0.8;
      if (k > n * 0.55 && y > 0) y = y * (1 - 0.25 * ((k - n * 0.55) / n)); // flatter bottom = loop-like
      pts.push(`${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    out.push({ d: pts.join(""), gapA: g0, gapB: g0 + gl, k });
  }
  RING_CACHE.set(key, out);
  return out;
};

/** Ridge endings / bifurcations: fixed positions in finger space (unit = gap). */
export const MINUTIAE: { x: number; y: number; kind: "end" | "fork" }[] = [
  { x: -3.6, y: -4.2, kind: "end" }, { x: 4.4, y: -2.2, kind: "fork" }, { x: -5.6, y: 2.4, kind: "fork" },
  { x: 2.2, y: 5.6, kind: "end" }, { x: 6.0, y: 3.4, kind: "end" }, { x: -1.6, y: 7.4, kind: "fork" },
  { x: 0.8, y: -7.2, kind: "end" }, { x: -7.0, y: -1.4, kind: "end" },
];

export const Fingerprint: React.FC<{
  x: number; y: number; s?: number; n?: number; gap?: number; color?: string; sw?: number; reveal?: number; seed?: number; pores?: boolean; emboss?: boolean;
}> = ({ x, y, s = 1, n = 14, gap = 22, color = C.ridge, sw = 9, reveal = 1, seed = 12, pores, emboss }) => {
  const rings = fingerRings(n, gap, seed);
  const shown = Math.ceil(n * clamp01(reveal));
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {emboss
        ? rings.slice(0, shown).map((r) => <path key={`e${r.k}`} d={r.d} transform="translate(-3,-4)" fill="none" stroke="#fff3e8" strokeWidth={sw} strokeLinecap="round" opacity={0.7} />)
        : null}
      {emboss
        ? rings.slice(0, shown).map((r) => <path key={`s${r.k}`} d={r.d} transform="translate(4,6)" fill="none" stroke="#6d3d28" strokeWidth={sw} strokeLinecap="round" opacity={0.35} />)
        : null}
      {rings.slice(0, shown).map((r) => (
        <path key={r.k} d={r.d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      ))}
      {pores
        ? rings.slice(0, shown).flatMap((r) =>
            [0, 1, 2, 3].map((j) => {
              const a = r.gapB + (j + 0.5 + hash(r.k * 5 + j)) * 1.3;
              const rr = r.k * gap;
              return <circle key={`p${r.k}-${j}`} cx={Math.cos(a) * rr * 0.8} cy={Math.sin(a) * rr * 1.04} r={sw * 0.22} fill="#fbe3d2" />;
            }),
          )
        : null}
    </g>
  );
};

/** Pad of a fingertip seen from the front (skin oval + fingerprint), used inside a clipPath. */
export const FingerPad: React.FC<{ x: number; y: number; w: number; h: number; id: string; reveal?: number; color?: string; pores?: boolean; emboss?: boolean; gap?: number; seed?: number }> = ({ x, y, w, h, id, reveal = 1, color = C.ridge, pores, emboss, gap = 20, seed = 12 }) => (
  <g>
    <defs>
      <clipPath id={`pad-${id}`}><ellipse cx={x} cy={y} rx={w / 2} ry={h / 2} /></clipPath>
    </defs>
    <ellipse cx={x + 16} cy={y + 26} rx={w / 2} ry={h / 2} fill="rgba(30,25,20,.25)" filter="url(#blur20)" />
    <ellipse cx={x} cy={y} rx={w / 2} ry={h / 2} fill="url(#skinG)" />
    <g clipPath={`url(#pad-${id})`}>
      <Fingerprint x={x} y={y + h * 0.04} n={Math.round(h / gap / 1.7)} gap={gap} sw={gap * 0.42} reveal={reveal} color={color} pores={pores} emboss={emboss} seed={seed} />
    </g>
    <ellipse cx={x - w * 0.18} cy={y - h * 0.26} rx={w * 0.16} ry={h * 0.08} fill="#fff" opacity={0.22} />
  </g>
);

// ── Isometric slabs ─────────────────────────────────────────────────────────────────────
export type Iso = { cx: number; cy: number; s: number };
export const isoP = (o: Iso, x: number, y: number, z: number): [number, number] => [
  o.cx + (x - y) * 0.866 * o.s,
  o.cy + (x + y) * 0.5 * o.s - z * o.s,
];
const poly = (pts: [number, number][]) => "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("L") + "Z";

/** Slab centred on (0,0) in plan, w along x, d along y, thickness h, bottom at z. */
export const Slab: React.FC<{ o: Iso; w: number; d: number; h: number; z: number; top: string; side?: string; opacity?: number; children?: React.ReactNode; shadow?: boolean }> = ({ o, w, d, h, z, top, side, opacity = 1, children, shadow }) => {
  const x0 = -w / 2, x1 = w / 2, y0 = -d / 2, y1 = d / 2;
  const T = (x: number, y: number) => isoP(o, x, y, z + h);
  const B = (x: number, y: number) => isoP(o, x, y, z);
  const sd = side ?? (top.startsWith("#") ? mix(top, "#000000", 0.28) : C.metalDk);
  return (
    <g opacity={opacity}>
      {shadow ? <path d={poly([B(x0, y0), B(x1, y0), B(x1, y1), B(x0, y1)])} fill="rgba(30,25,20,.2)" transform={`translate(0,${14 * o.s})`} filter="url(#blur8)" /> : null}
      <path d={poly([T(x1, y0), T(x1, y1), B(x1, y1), B(x1, y0)])} fill={sd} />
      <path d={poly([T(x0, y1), T(x1, y1), B(x1, y1), B(x0, y1)])} fill={sd.startsWith("#") ? mix(sd, "#000000", 0.15) : sd} />
      <path d={poly([T(x0, y0), T(x1, y0), T(x1, y1), T(x0, y1)])} fill={top} />
      <path d={poly([T(x0, y0), T(x1, y0), T(x1, y1), T(x0, y1)])} fill="none" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={2} />
      {children}
    </g>
  );
};

/** Matrix put on the top face of a slab (plan coords → screen), for drawing details on a layer. */
export const topMatrix = (o: Iso, z: number) => {
  const [ox, oy] = isoP(o, 0, 0, z);
  const a = 0.866 * o.s, b = 0.5 * o.s, c = -0.866 * o.s, d = 0.5 * o.s;
  return `matrix(${a},${b},${c},${d},${ox},${oy})`;
};

// ── Phone (front view) ───────────────────────────────────────────────────────────────
export const Phone: React.FC<{ x: number; y: number; s?: number; screen?: React.ReactNode; glow?: number; screenBg?: string }> = ({ x, y, s = 1, screen, glow = 0, screenBg = "#15171c" }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Contact x={30} y={40} rx={250} ry={470} o={0.28} />
    <rect x={-230} y={-460} width={460} height={920} rx={64} fill="url(#metal)" />
    <rect x={-218} y={-448} width={436} height={896} rx={54} fill={C.oled} />
    <defs><clipPath id="phone-scr"><rect x={-204} y={-434} width={408} height={868} rx={44} /></clipPath></defs>
    <rect x={-204} y={-434} width={408} height={868} rx={44} fill="url(#screenG)" />
    <g clipPath="url(#phone-scr)" style={{ backgroundColor: screenBg }}>{screen}</g>
    <rect x={-60} y={-420} width={120} height={30} rx={15} fill="#050608" />
    <path d="M-150,-434 L-40,-434 L-200,300 L-204,120Z" fill="#fff" opacity={0.05} />
    {glow > 0 ? <rect x={-218} y={-448} width={436} height={896} rx={54} fill="none" stroke={C.orange} strokeWidth={6} opacity={glow} filter="url(#glow)" /> : null}
  </g>
);

/** Lock icon; open = 0..1 shackle lift. */
export const Lock: React.FC<{ x: number; y: number; s?: number; open?: number; col?: string }> = ({ x, y, s = 1, open = 0, col = C.white }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d={`M-26,0 v-24 a26,26 0 0,1 52,0 v${24 - 0}`} transform={`translate(${open * 30},${-open * 18}) rotate(${-open * 25} 26 0)`} fill="none" stroke={col} strokeWidth={10} strokeLinecap="round" />
    <rect x={-40} y={-4} width={80} height={62} rx={12} fill={col} />
    <circle cx={0} cy={24} r={8} fill={C.oled} />
  </g>
);

/** Thumb coming from below: tip at (x,y). */
export const Thumb: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-120,40 C-130,-60 -90,-130 0,-130 C90,-130 130,-60 120,40 L150,700 L-150,700Z" fill="rgba(30,25,20,.25)" transform="translate(18,26)" filter="url(#blur20)" />
    <path d="M-120,40 C-130,-60 -90,-130 0,-130 C90,-130 130,-60 120,40 L150,700 L-150,700Z" fill="url(#skinG)" />
    <path d="M-70,-40 C-70,-100 70,-100 70,-40 L62,40 C40,60 -40,60 -62,40Z" fill="#f6d9c6" stroke="#d9a587" strokeWidth={4} />
    <path d="M-100,160 C-40,185 40,185 100,160" fill="none" stroke={C.skinDk} strokeWidth={5} opacity={0.6} />
  </g>
);

export const Check: React.FC<{ x: number; y: number; s?: number; col?: string }> = ({ x, y, s = 1, col = C.green }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={44} fill={col} />
    <path d="M-20,2 L-5,18 L22,-14" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
export const Cross: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={44} fill={C.red} />
    <path d="M-17,-17 L17,17 M17,-17 L-17,17" stroke="#fff" strokeWidth={10} strokeLinecap="round" />
  </g>
);
