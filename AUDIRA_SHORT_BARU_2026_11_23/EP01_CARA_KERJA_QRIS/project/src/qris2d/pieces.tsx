// BONGKAR pieces for EP01 Cara Kerja QRIS (pure SVG, 1080 × 1920 design space).
// Based on the EP12 gold (studio grey, black label chips with red dot + leader), plus a directional
// key light (upper left), darker right faces and a white rim on every layer edge (EP12 lighting fix).
// No Math.random: seeded hash only.
import React from "react";

export const C = {
  bgTop: "#eceef0", bgBot: "#dddbd6", ink: "#1e1f22", chip: "#1b1b1c", red: "#c0141c", orange: "#ef9420",
  metalLt: "#bfc2c6", metalDk: "#80858b", glass: "#cfe3ee", oled: "#15171c",
  grey: "#6b6e73", white: "#ffffff", green: "#2e9e5b", paper: "#f7f7f5",
  issuer: "#2f5d9e", acq: "#6a4aa0", gpn: "#c0141c", rack: "#2a2d33", wood: "#b07a4a", land: "#d9d4c8",
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
  return 1 - Math.exp(-6 * x) * Math.cos(7 * x);
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
      <stop offset="0" stopColor="#eef0f2" /><stop offset="0.35" stopColor={C.metalLt} />
      <stop offset="0.6" stopColor={C.metalDk} /><stop offset="1" stopColor="#c9cbcf" />
    </linearGradient>
    <linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#f4f9fc" stopOpacity="0.9" /><stop offset="0.5" stopColor={C.glass} stopOpacity="0.55" />
      <stop offset="1" stopColor="#a9c8d8" stopOpacity="0.7" />
    </linearGradient>
    <linearGradient id="screenG" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stopColor="#262a33" /><stop offset="1" stopColor="#0d0f13" />
    </linearGradient>
    {/* key light sheen on top faces: bright upper-left corner fading out */}
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#ffffff" stopOpacity="0.6" /><stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="sideShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#000000" stopOpacity="0.04" /><stop offset="1" stopColor="#000000" stopOpacity="0.34" />
    </linearGradient>
  </defs>
);

export const Contact: React.FC<{ x: number; y: number; rx: number; ry: number; o?: number }> = ({ x, y, rx, ry, o = 0.22 }) => (
  // key light from upper left → shadow falls to the lower right
  <ellipse cx={x + rx * 0.12} cy={y + ry * 0.25} rx={rx} ry={ry} fill={`rgba(30,25,20,${Math.min(0.5, o * 1.6)})`} filter="url(#blur20)" />
);

/** Black chip label with red dot at the anchor and a thin leader line (BONGKAR signature). Box kept in x 48–1032. */
export const Label: React.FC<{ x: number; y: number; ax: number; ay: number; text: string; k?: number; size?: number; dark?: boolean; side?: "l" | "r" }> = ({ x, y, ax, ay, text, k = 1, size = 40, dark = true, side }) => {
  if (k <= 0) return null;
  const w = text.length * size * 0.6 + size * 1.1;
  const h = size * 1.7;
  const left = side ? side === "l" : x < ax;
  const bx = Math.max(90, Math.min(990 - w, left ? x - w : x));
  const ex = left ? bx + w : bx;
  return (
    <g opacity={clamp01(k * 1.5)}>
      <line x1={ex} y1={y} x2={lerp(ex, ax, clamp01(k))} y2={lerp(y, ay, clamp01(k))} stroke={C.chip} strokeWidth={3} />
      <circle cx={ax} cy={ay} r={9 * clamp01(k)} fill={C.red} stroke={C.white} strokeWidth={3} />
      <g transform={`translate(${bx + w / 2},${y}) scale(${0.85 + 0.15 * clamp01(k)}) translate(${-w / 2},0)`}>
        <rect x={4} y={-h / 2 + 6} width={w} height={h} rx={10} fill="rgba(0,0,0,.2)" filter="url(#blur8)" />
        <rect x={0} y={-h / 2} width={w} height={h} rx={10} fill={dark ? C.chip : C.white} />
        <text x={w / 2} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={size} fill={dark ? C.white : C.ink}>{text}</text>
      </g>
    </g>
  );
};

/** Header block: red kicker, black title. */
export const Header: React.FC<{ kicker: string; title: string; k?: number; size?: number }> = ({ kicker, title, k = 1, size = 74 }) => (
  <g opacity={k} transform={`translate(0,${(1 - k) * -20})`}>
    <text x={540} y={262} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} letterSpacing={6} fill={C.red}>{kicker}</text>
    <text x={540} y={346} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={C.ink}>{title}</text>
  </g>
);

// ── Isometric ──────────────────────────────────────────────────────────────────────────
export type Iso = { cx: number; cy: number; s: number };
export const isoP = (o: Iso, x: number, y: number, z: number): [number, number] => [
  o.cx + (x - y) * 0.866 * o.s,
  o.cy + (x + y) * 0.5 * o.s - z * o.s,
];
export const poly = (pts: [number, number][]) => "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("L") + "Z";

/** Matrix for the top face (plan coords → screen) at height z. */
export const topMatrix = (o: Iso, z: number, px = 0, py = 0) => {
  const [ox, oy] = isoP(o, px, py, z);
  return `matrix(${0.866 * o.s},${0.5 * o.s},${-0.866 * o.s},${0.5 * o.s},${ox},${oy})`;
};
/** Left face (plane y = y1), local u along +x, v downward from z. */
export const leftMatrix = (o: Iso, x0: number, y1: number, z: number) => {
  const [ox, oy] = isoP(o, x0, y1, z);
  return `matrix(${0.866 * o.s},${0.5 * o.s},0,${o.s},${ox},${oy})`;
};
/** Right face (plane x = x1), local u along −y (reads left→right), v downward from z. */
export const rightMatrix = (o: Iso, x1: number, y1: number, z: number) => {
  const [ox, oy] = isoP(o, x1, y1, z);
  return `matrix(${0.866 * o.s},${-0.5 * o.s},0,${o.s},${ox},${oy})`;
};

/** Lit box: plan centre (px,py), size w×d, height h, bottom z. Left face mid, right face dark (key light upper left). */
export const Box: React.FC<{
  o: Iso; px?: number; py?: number; w: number; d: number; h: number; z?: number; col: string; topCol?: string;
  shadow?: boolean; opacity?: number; children?: React.ReactNode; glow?: number;
}> = ({ o, px = 0, py = 0, w, d, h, z = 0, col, topCol, shadow, opacity = 1, children, glow = 0 }) => {
  const x0 = px - w / 2, x1 = px + w / 2, y0 = py - d / 2, y1 = py + d / 2;
  const T = (x: number, y: number) => isoP(o, x, y, z + h);
  const B = (x: number, y: number) => isoP(o, x, y, z);
  const top = topCol ?? mix(col, "#ffffff", 0.22);
  const leftF = col;
  const rightF = mix(col, "#000000", 0.45);
  const topPath = poly([T(x0, y0), T(x1, y0), T(x1, y1), T(x0, y1)]);
  return (
    <g opacity={opacity}>
      {shadow ? <path d={poly([B(x0, y0), B(x1, y0), B(x1, y1), B(x0, y1)])} fill="rgba(30,25,20,.26)" transform={`translate(${18 * o.s},${16 * o.s})`} filter="url(#blur8)" /> : null}
      {glow > 0 ? <path d={topPath} fill="none" stroke={C.orange} strokeWidth={10} opacity={glow} filter="url(#glow)" /> : null}
      <path d={poly([T(x1, y0), T(x1, y1), B(x1, y1), B(x1, y0)])} fill={rightF} />
      <path d={poly([T(x1, y0), T(x1, y1), B(x1, y1), B(x1, y0)])} fill="url(#sideShade)" />
      <path d={poly([T(x0, y1), T(x1, y1), B(x1, y1), B(x0, y1)])} fill={leftF} />
      <path d={poly([T(x0, y1), T(x1, y1), B(x1, y1), B(x0, y1)])} fill="url(#sideShade)" />
      <path d={topPath} fill={top} />
      <path d={topPath} fill="url(#sheen)" />
      {/* rim: the two edges facing the light read bright, the front corner gets a thin specular line */}
      <path d={`M${T(x0, y1).join(",")}L${T(x0, y0).join(",")}L${T(x1, y0).join(",")}`} fill="none" stroke="#ffffff" strokeOpacity={0.9} strokeWidth={2.5} />
      <path d={`M${T(x0, y1).join(",")}L${T(x1, y1).join(",")}L${T(x1, y0).join(",")}`} fill="none" stroke="#ffffff" strokeOpacity={0.45} strokeWidth={2} />
      <path d={`M${T(x1, y1).join(",")}L${B(x1, y1).join(",")}`} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={2} />
      {children}
    </g>
  );
};

/** Bank building: base box + window grid + columns + roof slab. Sign is screen-aligned (readable). */
export const Bank: React.FC<{ o: Iso; px: number; py: number; col: string; sign: string; k?: number; glow?: number; w?: number; h?: number }> = ({ o, px, py, col, sign, k = 1, glow = 0, w = 220, h = 230 }) => {
  if (k <= 0) return null;
  const d = 170;
  const hh = h * easeOut(k);
  const x0 = px - w / 2, y1 = py + d / 2, x1 = px + w / 2;
  const rows = 4, cols = 4;
  const winL: React.ReactNode[] = [];
  const winR: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = hash(r * 7 + c * 3 + px) > 0.45 ? 1 : 0.35;
      const u = 22 + c * ((w - 44) / cols), v = 40 + r * ((h - 70) / rows);
      if (v + 26 < hh) winL.push(<rect key={`l${r}${c}`} x={u} y={hh - h + v} width={(w - 44) / cols - 14} height={26} fill={lit > 0.5 ? "#ffe8b8" : "#9fb4c8"} opacity={0.9} />);
      const u2 = 18 + c * ((d - 36) / cols);
      if (v + 26 < hh) winR.push(<rect key={`r${r}${c}`} x={u2} y={hh - h + v} width={(d - 36) / cols - 12} height={26} fill={lit > 0.5 ? "#e8c98a" : "#6f8297"} opacity={0.85} />);
    }
  }
  const [sx, sy] = isoP(o, px, py, hh + 60);
  return (
    <g>
      <Box o={o} px={px} py={py} w={w + 40} d={d + 40} h={14} col="#c9c6bf" shadow />
      <Box o={o} px={px} py={py} w={w} d={d} h={hh} z={14} col={col} glow={glow}>
        <g transform={leftMatrix(o, x0, y1, 14 + hh)}>{winL}</g>
        <g transform={rightMatrix(o, x1, y1, 14 + hh)}>{winR}</g>
        {/* entrance */}
        <g transform={leftMatrix(o, x0, y1, 14)}>
          <rect x={w / 2 - 26} y={-56} width={52} height={56} fill="#24262b" />
          <rect x={w / 2 - 26} y={-56} width={52} height={8} fill="#ffffff" opacity={0.5} />
        </g>
      </Box>
      <Box o={o} px={px} py={py} w={w + 20} d={d + 20} h={16} z={14 + hh} col={mix(col, "#000000", 0.25)} />
      <g opacity={ramp(k, 0.6, 1)} transform={`translate(${sx},${sy})`}>
        <rect x={-sign.length * 13 - 26} y={-30} width={sign.length * 26 + 52} height={58} rx={10} fill={C.white} stroke={col} strokeWidth={4} />
        <circle cx={-sign.length * 13 - 8} cy={-1} r={7} fill={C.red} />
        <text x={8} y={11} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={col}>{sign}</text>
        <line x1={0} y1={28} x2={0} y2={46} stroke={C.chip} strokeWidth={4} />
      </g>
    </g>
  );
};

/** Server rack (switching): tall dark box with blinking LED rows on the left face. */
export const Rack: React.FC<{ o: Iso; px: number; py: number; t: number; active?: number; k?: number; seed?: number }> = ({ o, px, py, t, active = 0, k = 1, seed = 1 }) => {
  if (k <= 0) return null;
  const w = 70, d = 70, h = 170 * easeOut(k);
  const leds: React.ReactNode[] = [];
  for (let r = 0; r < 7; r++) {
    const v = 18 + r * 21;
    if (v + 8 > h) continue;
    leds.push(<rect key={`u${r}`} x={6} y={-h + v} width={w - 12} height={14} rx={2} fill="#3a3e46" />);
    for (let c = 0; c < 3; c++) {
      const on = Math.sin(t * (5 + c) + r * 1.7 + seed * 2.3 + c) > 0.1;
      leds.push(<circle key={`d${r}${c}`} cx={14 + c * 9} cy={-h + v + 7} r={2.6} fill={on ? (active > 0.5 ? C.orange : "#58d38a") : "#1a1c20"} />);
    }
  }
  return (
    <g>
      <Box o={o} px={px} py={py} w={w} d={d} h={h} col={C.rack} topCol="#4a4f58" shadow glow={active * 0.9}>
        <g transform={leftMatrix(o, px - w / 2, py + d / 2, h)}><g transform={`translate(0,${h})`}>{leds}</g></g>
      </Box>
    </g>
  );
};

/** GPN hub: round iso platform with red/white top. */
export const Hub: React.FC<{ o: Iso; px: number; py: number; t: number; k?: number; glow?: number }> = ({ o, px, py, t, k = 1, glow = 0 }) => {
  if (k <= 0) return null;
  const r = 130 * easeOut(k), h = 46;
  const [cx, cyTop] = isoP(o, px, py, h);
  const [, cyBot] = isoP(o, px, py, 0);
  const rx = r * 0.866 * o.s * 1.414, ry = r * 0.5 * o.s * 1.414;
  return (
    <g>
      <ellipse cx={cx + 16} cy={cyBot + 18} rx={rx} ry={ry} fill="rgba(30,25,20,.25)" filter="url(#blur8)" />
      <path d={`M${cx - rx},${cyTop} L${cx - rx},${cyBot} A${rx},${ry} 0 0,0 ${cx + rx},${cyBot} L${cx + rx},${cyTop}Z`} fill="#8e1016" />
      <path d={`M${cx},${cyBot + ry} A${rx},${ry} 0 0,0 ${cx + rx},${cyBot} L${cx + rx},${cyTop} A${rx},${ry} 0 0,1 ${cx},${cyTop + ry}Z`} fill="rgba(0,0,0,.25)" />
      <ellipse cx={cx} cy={cyTop} rx={rx} ry={ry} fill={C.gpn} />
      <ellipse cx={cx} cy={cyTop} rx={rx * 0.72} ry={ry * 0.72} fill={C.white} />
      <ellipse cx={cx - rx * 0.25} cy={cyTop - ry * 0.3} rx={rx * 0.5} ry={ry * 0.35} fill="#ffffff" opacity={0.35} />
      <path d={`M${cx - rx},${cyTop} A${rx},${ry} 0 0,1 ${cx + rx * 0.2},${cyTop - ry}`} fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.8} />
      {glow > 0 ? <ellipse cx={cx} cy={cyTop} rx={rx} ry={ry} fill="none" stroke={C.orange} strokeWidth={10} opacity={glow * (0.6 + 0.4 * Math.sin(t * 8))} filter="url(#glow)" /> : null}
      <text x={cx} y={cyTop + 16} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={50 * easeOut(k)} fill={C.gpn}>GPN</text>
    </g>
  );
};

// ── QR code (procedural, not scannable) ─────────────────────────────────────────────────
const QR_CACHE = new Map<number, string>();
export const qrPath = (seed: number, n = 25) => {
  const hit = QR_CACHE.get(seed);
  if (hit) return hit;
  const finder = (i: number, j: number) => {
    const inF = (a: number, b: number) => i >= a && i < a + 7 && j >= b && j < b + 7;
    for (const [a, b] of [[0, 0], [0, n - 7], [n - 7, 0]] as const) {
      if (inF(a, b)) {
        const di = i - a, dj = j - b;
        return di === 0 || di === 6 || dj === 0 || dj === 6 || (di >= 2 && di <= 4 && dj >= 2 && dj <= 4) ? 1 : 0;
      }
      if (i >= a - 1 && i <= a + 7 && j >= b - 1 && j <= b + 7) return 0;
    }
    return -1;
  };
  let d = "";
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const f = finder(i, j);
      const on = f >= 0 ? f === 1 : i === 6 || j === 6 ? (i + j) % 2 === 0 : hash(seed * 31 + i * 97 + j * 13) > 0.52;
      if (on) d += `M${j},${i}h1v1h-1z`;
    }
  }
  QR_CACHE.set(seed, d);
  return d;
};
export const QR: React.FC<{ x: number; y: number; size: number; seed?: number; col?: string; bg?: string; scan?: number }> = ({ x, y, size, seed = 7, col = C.ink, bg = C.white, scan = -1 }) => {
  const q = size / 29;
  return (
    <g transform={`translate(${x - size / 2},${y - size / 2})`}>
      <rect width={size} height={size} rx={size * 0.04} fill={bg} />
      <g transform={`translate(${2 * q},${2 * q}) scale(${q})`}><path d={qrPath(seed)} fill={col} /></g>
      {scan >= 0 && scan <= 1 ? <rect x={0} y={scan * size - 3} width={size} height={6} fill={C.orange} opacity={0.9} filter="url(#glow)" /> : null}
    </g>
  );
};

/** Acrylic QRIS stand, front view. (x,y) = centre of the QR panel. Plain text "QRIS", no logo. */
export const Stand: React.FC<{ x: number; y: number; s?: number; scan?: number; seed?: number }> = ({ x, y, s = 1, scan = -1, seed = 7 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={40} cy={330} rx={260} ry={36} fill="rgba(30,25,20,.28)" filter="url(#blur20)" />
    <path d="M-150,300 L150,300 L170,335 L-170,335Z" fill="url(#metal)" />
    <rect x={-200} y={-300} width={400} height={600} rx={22} fill="#ffffff" stroke="#d8dbe0" strokeWidth={3} />
    <rect x={-200} y={-300} width={400} height={110} rx={22} fill={C.red} />
    <rect x={-200} y={-212} width={400} height={22} fill={C.red} />
    <text x={0} y={-226} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} letterSpacing={6} fill={C.white}>QRIS</text>
    <QR x={0} y={40} size={300} seed={seed} scan={scan} />
    <text x={0} y={262} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill={C.grey}>WARUNG BU SRI</text>
    {/* acrylic sheen, key light upper left */}
    <path d="M-200,-300 L-60,-300 L-200,40Z" fill="#ffffff" opacity={0.28} />
    <rect x={-200} y={-300} width={400} height={600} rx={22} fill="none" stroke="#ffffff" strokeWidth={4} opacity={0.7} />
  </g>
);

// ── Phone (front view) ───────────────────────────────────────────────────────────────
export const Phone: React.FC<{ x: number; y: number; s?: number; screen?: React.ReactNode; glow?: number; glowCol?: string; id?: string }> = ({ x, y, s = 1, screen, glow = 0, glowCol = C.orange, id = "p" }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Contact x={30} y={40} rx={250} ry={470} o={0.28} />
    <rect x={-230} y={-460} width={460} height={920} rx={64} fill="url(#metal)" />
    <rect x={-218} y={-448} width={436} height={896} rx={54} fill={C.oled} />
    <defs><clipPath id={`scr-${id}`}><rect x={-204} y={-434} width={408} height={868} rx={44} /></clipPath></defs>
    <rect x={-204} y={-434} width={408} height={868} rx={44} fill="url(#screenG)" />
    <g clipPath={`url(#scr-${id})`}>{screen}</g>
    <rect x={-60} y={-420} width={120} height={30} rx={15} fill="#050608" />
    <path d="M-204,-434 L-40,-434 L-204,300Z" fill="#fff" opacity={0.07} />
    <rect x={-230} y={-460} width={460} height={920} rx={64} fill="none" stroke="#ffffff" strokeWidth={4} opacity={0.6} />
    {glow > 0 ? <rect x={-218} y={-448} width={436} height={896} rx={54} fill="none" stroke={glowCol} strokeWidth={8} opacity={glow} filter="url(#glow)" /> : null}
  </g>
);

/** Merchant phone screen: green check + "Pembayaran berhasil" + amount. */
export const SuccessScreen: React.FC<{ k: number; amount?: string }> = ({ k, amount = "Rp25.000" }) => (
  <g>
    <rect x={-204} y={-434} width={408} height={868} fill={mix("#1c2a3e", "#f2f5f2", k)} />
    {k > 0 ? (
      <g opacity={k}>
        <Check x={0} y={-120} s={1.6 * easeOut(k)} />
        <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={C.ink}>Pembayaran</text>
        <text x={0} y={84} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={C.green}>berhasil</text>
        <text x={0} y={170} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill={C.ink}>+{amount}</text>
      </g>
    ) : null}
  </g>
);

/** Buyer phone screen: camera frame → amount → pay button. stage 0..1 scan, 1..2 amount, 2..3 pressed. */
export const PayScreen: React.FC<{ stage: number; amount?: string }> = ({ stage, amount = "Rp25.000" }) => {
  const scanK = clamp01(stage);
  const amountK = ramp(stage, 1, 1.3);
  const press = ramp(stage, 2, 2.15) * (1 - ramp(stage, 2.3, 2.5));
  return (
    <g>
      <rect x={-204} y={-434} width={408} height={868} fill="#f4f5f7" />
      {amountK < 1 ? (
        <g opacity={1 - amountK}>
          <rect x={-204} y={-434} width={408} height={868} fill="#2a2e36" />
          <QR x={0} y={-40} size={250} seed={7} scan={scanK < 1 ? scanK : -1} />
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => (
            <path key={i} d={`M${a * 150},${-40 + b * 110} v${-b * -40} M${a * 150},${-40 + b * 150} h${-a * 40}`} stroke={C.orange} strokeWidth={8} fill="none" transform={`translate(0,${b * 0})`} />
          ))}
          <text x={0} y={200} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={32} fill="#ffffff">Arahkan ke kode QR</text>
        </g>
      ) : null}
      {amountK > 0 ? (
        <g opacity={amountK}>
          <text x={0} y={-300} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill={C.grey}>Bayar ke</text>
          <text x={0} y={-250} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill={C.ink}>WARUNG BU SRI</text>
          <rect x={-170} y={-170} width={340} height={130} rx={18} fill="#ffffff" stroke="#d6d9de" strokeWidth={3} />
          <text x={0} y={-82} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={66} fill={C.ink}>{amount}</text>
          <g transform={`translate(0,${200}) scale(${1 - press * 0.08})`}>
            <rect x={-160} y={-48} width={320} height={96} rx={48} fill={press > 0 ? "#a10f16" : C.red} />
            <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#ffffff">BAYAR</text>
          </g>
        </g>
      ) : null}
    </g>
  );
};

export const Check: React.FC<{ x: number; y: number; s?: number; col?: string }> = ({ x, y, s = 1, col = C.green }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={44} fill={col} />
    <path d="M-20,2 L-5,18 L22,-14" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

/** Money packet travelling along the route. */
export const Packet: React.FC<{ x: number; y: number; s?: number; col?: string; text?: string }> = ({ x, y, s = 1, col = C.orange, text = "Rp" }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-50} y={-30} width={100} height={60} rx={16} fill={col} opacity={0.55} filter="url(#glow)" />
    <rect x={-44} y={-26} width={88} height={52} rx={14} fill={col} />
    <rect x={-44} y={-26} width={88} height={18} rx={10} fill="#ffffff" opacity={0.28} />
    <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={col === C.orange ? C.ink : "#ffffff"}>{text}</text>
  </g>
);

/** Point along a polyline at fraction u (0..1), by length. */
export const along = (pts: [number, number][], u: number): [number, number] => {
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); total += l; }
  let d = clamp01(u) * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) { const k = seg[i] ? d / seg[i] : 0; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; }
    d -= seg[i];
  }
  return pts[pts.length - 1];
};
/** Route line (grooved track) drawn up to fraction k. */
export const Route: React.FC<{ pts: [number, number][]; k?: number; dash?: boolean; col?: string }> = ({ pts, k = 1, dash, col = C.chip }) => {
  if (k <= 0) return null;
  const d = "M" + pts.map((p) => p.join(",")).join("L");
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return (
    <g>
      <path d={d} fill="none" stroke="rgba(30,25,20,.18)" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" transform="translate(6,8)" filter="url(#blur8)" strokeDasharray={`${total * k} ${total}`} />
      <path d={d} fill="none" stroke="#ffffff" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${total * k} ${total}`} />
      <path d={d} fill="none" stroke={col} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ? "14 16" : `${total * k} ${total}`} opacity={dash ? clamp01(k * 2) : 1} />
    </g>
  );
};

// ── Warung (front view) ──────────────────────────────────────────────────────────────
export const Warung: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode }> = ({ x, y, s = 1, children }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={40} cy={430} rx={520} ry={40} fill="rgba(30,25,20,.22)" filter="url(#blur20)" />
    {/* back wall + shelves */}
    <rect x={-460} y={-380} width={920} height={560} fill="#e6dccb" />
    <rect x={-460} y={-380} width={920} height={560} fill="url(#sheen)" />
    {[-250, -110, 30].map((sy, i) => (
      <g key={i}>
        <rect x={-420} y={sy} width={840} height={14} fill={C.wood} />
        {Array.from({ length: 12 }).map((_, j) => (
          <rect key={j} x={-400 + j * 68} y={sy - 56 - (hash(i * 13 + j) * 20)} width={46} height={56 + hash(i * 13 + j) * 20} rx={6} fill={["#e0a43c", "#c0141c", "#2f5d9e", "#2e9e5b", "#f2e6c9"][(i + j) % 5]} opacity={0.9} />
        ))}
      </g>
    ))}
    {/* awning */}
    <path d="M-500,-440 L500,-440 L470,-370 L-470,-370Z" fill={C.red} />
    {Array.from({ length: 10 }).map((_, i) => (
      <path key={i} d={`M${-500 + i * 100 + 50},-440 L${-500 + i * 100 + 100},-440 L${-470 + i * 94 + 94},-370 L${-470 + i * 94 + 47},-370Z`} fill="#ffffff" />
    ))}
    <path d="M-500,-440 L500,-440" stroke="#ffffff" strokeWidth={4} opacity={0.8} />
    {/* counter */}
    <rect x={-480} y={180} width={960} height={40} fill="#cfa477" />
    <rect x={-480} y={180} width={960} height={8} fill="#ffffff" opacity={0.6} />
    <rect x={-460} y={220} width={920} height={200} fill={C.wood} />
    <rect x={-460} y={220} width={920} height={200} fill="url(#sideShade)" />
    {children}
  </g>
);

export const Person: React.FC<{ x: number; y: number; s?: number; col?: string }> = ({ x, y, s = 1, col = C.ink }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle cx={0} cy={-34} r={13} fill={col} />
    <path d="M-18,-16 Q0,-24 18,-16 L22,22 L-22,22Z" fill={col} />
  </g>
);
export const Shop: React.FC<{ x: number; y: number; s?: number; col?: string }> = ({ x, y, s = 1, col = C.ink }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-24,-22 L24,-22 L28,-8 L-28,-8Z" fill={C.red} />
    <rect x={-22} y={-8} width={44} height={30} fill={col} />
    <rect x={-7} y={4} width={14} height={18} fill="#ffffff" opacity={0.85} />
  </g>
);

// ── Indonesia (stylised outline, west → east, box ≈ 1000 × 420) ────────────────────────
export const ISLANDS: [number, number][][] = [
  [[40, 40], [110, 70], [190, 150], [250, 230], [272, 272], [240, 282], [170, 222], [100, 152], [50, 92]],
  [[282, 300], [360, 305], [440, 318], [522, 330], [530, 346], [440, 348], [350, 338], [286, 322]],
  [[545, 345], [572, 342], [576, 354], [548, 356]],
  [[592, 348], [682, 350], [692, 362], [596, 362]],
  [[330, 110], [400, 60], [470, 70], [502, 130], [482, 210], [420, 250], [360, 232], [330, 170]],
  [[560, 120], [622, 110], [602, 140], [576, 150], [592, 180], [642, 170], [602, 200], [592, 250], [570, 252], [565, 200], [545, 170], [550, 130]],
  [[680, 160], [700, 156], [704, 176], [684, 180]],
  [[712, 210], [740, 206], [744, 226], [716, 230]],
  [[780, 160], [860, 150], [960, 200], [985, 260], [960, 320], [880, 300], [830, 250], [790, 210], [760, 190]],
];
export const Indonesia: React.FC<{ x: number; y: number; s?: number; k?: number }> = ({ x, y, s = 1, k = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={clamp01(k * 1.4)}>
    {ISLANDS.map((p, i) => <path key={`s${i}`} d={poly(p)} fill="#a9a395" transform="translate(5,9)" strokeLinejoin="round" />)}
    {ISLANDS.map((p, i) => <path key={`l${i}`} d={poly(p)} fill={C.land} stroke="#ffffff" strokeWidth={2.5} strokeLinejoin="round" />)}
  </g>
);
