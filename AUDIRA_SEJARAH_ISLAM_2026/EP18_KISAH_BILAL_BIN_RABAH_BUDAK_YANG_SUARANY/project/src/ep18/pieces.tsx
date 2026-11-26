// EP18 Bilal bin Rabah — PAPERWORLD paper pieces (pure SVG, 1080 × 1920 design space).
// One key light from the upper-left: long cast shadow down-right, laminated card wall, pale cut edge, lit rim, fibre texture
// that travels with each card. Adab: no Prophet in any form, companions are faceless paper silhouettes, no Arabic script.
// No Math.random: seeded hash only.
import React from "react";
import { staticFile } from "remotion";

export const C = {
  ivory: "#F3E6CC", paper: "#FFF7E8", sun: "#FFF4DE", sand: "#D9A866", sandLt: "#EBC88F", sandDk: "#B9803F",
  terracotta: "#B4573A", terraDk: "#7E3524", indigo: "#25304F", indigo2: "#3E4C7A", gold: "#E3A93B", goldLt: "#F8D680",
  ink: "#2A1E17", teal: "#2F6B62", leaf: "#6F8F4E", leafDk: "#47663A", stone: "#8C8378", stoneDk: "#5C544C", brown: "#6E4A33",
  skin: "#4A2E22", lavender: "#8C82B8", rose: "#E7A08A", mud: "#D8B48A",
};

export const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ease = (v: number) => { const x = clamp01(v); return x * x * (3 - 2 * x); };
export const easeOut = (v: number) => 1 - Math.pow(1 - clamp01(v), 3);
export const back = (v: number) => { const x = clamp01(v) - 1; return 1 + 2.4 * x * x * x + 1.4 * x * x; };
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
export const mix = (hex: string, to: string, k: number) => {
  if (!hex.startsWith("#") || !to.startsWith("#")) return hex;
  const a = rgb(hex), b = rgb(to);
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, "0")).join("");
};
const f1 = (v: number) => v.toFixed(1);

export const PaperDefs: React.FC = () => (
  <defs>
    <filter id="psh" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8" /></filter>
    <filter id="pct" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5" /></filter>
    <filter id="psoft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="30" /></filter>
    <filter id="pglow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="14" /></filter>
    <filter id="pdof" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" /></filter>
    <linearGradient id="plight" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#FFF4DC" stopOpacity="0.36" /><stop offset="0.42" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#24120A" stopOpacity="0.32" />
    </linearGradient>
    <linearGradient id="pdown" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#FFF4DC" stopOpacity="0.22" /><stop offset="0.3" stopColor="#24120A" stopOpacity="0" /><stop offset="1" stopColor="#24120A" stopOpacity="0.42" />
    </linearGradient>
    <pattern id="fib" width="512" height="512" patternUnits="userSpaceOnUse"><image href={staticFile("tex/fibre.png")} width="512" height="512" /></pattern>
    <pattern id="krf" width="640" height="640" patternUnits="userSpaceOnUse"><image href={staticFile("tex/kraft.png")} width="640" height="640" /></pattern>
    <pattern id="corr" width="9" height="12" patternUnits="userSpaceOnUse"><path d="M0,0 h9 v12 h-9Z" fill="#000" opacity="0.14" /><path d="M2,0 h3 v12 h-3Z" fill="#fff" opacity="0.28" /></pattern>
  </defs>
);

type PProps = { d: string; fill: string; depth?: number; th?: number; tex?: "fib" | "krf" | null; noShadow?: boolean; opacity?: number; shade?: "diag" | "down" | null; rim?: number; edge?: string };
/** One paper card: long cast shadow, contact shadow, laminated side wall, pale cut edge, face, fibre, light, rim. */
export const P: React.FC<PProps> = ({ d, fill, depth = 1, th = 1, tex = "fib", noShadow, opacity, shade = "diag", rim = 0.7, edge }) => {
  const steps = Math.max(1, Math.round(th * 2));
  return (
    <g opacity={opacity}>
      {noShadow ? null : <path d={d} fill="rgba(38,20,12,.36)" transform={`translate(${30 * depth},${40 * depth})`} filter="url(#psh)" />}
      {noShadow ? null : <path d={d} fill="rgba(30,16,10,.34)" transform={`translate(${8 * depth},${11 * depth})`} filter="url(#pct)" />}
      {Array.from({ length: steps }, (_, i) => {
        const k = steps - i;
        return <path key={i} d={d} fill={i % 2 ? mix(fill, "#000000", 0.36) : mix(fill, "#20100A", 0.5)} transform={`translate(${2.75 * k},${3.75 * k})`} />;
      })}
      <path d={d} fill={edge ?? mix(fill, "#FFF8EA", 0.62)} transform="translate(1.6,2.2)" />
      <path d={d} fill={fill} />
      {tex ? <path d={d} fill={`url(#${tex})`} /> : null}
      {shade ? <path d={d} fill={shade === "down" ? "url(#pdown)" : "url(#plight)"} /> : null}
      {rim ? <path d={d} fill="none" stroke="#FFF6E2" strokeOpacity={rim} strokeWidth={3} transform="translate(-1.3,-1.7)" /> : null}
    </g>
  );
};
/** Small flat card for parts of a figure or prop: wall + face + fibre + rim, short contact shadow only. */
export const K: React.FC<{ d: string; fill: string; sh?: number; rim?: number }> = ({ d, fill, sh = 1, rim = 0.5 }) => (
  <g>
    {sh ? <path d={d} fill="rgba(30,14,8,.38)" transform={`translate(${6 * sh},${9 * sh})`} filter="url(#pct)" /> : null}
    <path d={d} fill={mix(fill, "#1A0C06", 0.45)} transform="translate(2.4,3.4)" />
    <path d={d} fill={fill} />
    <path d={d} fill="url(#fib)" />
    <path d={d} fill="url(#plight)" />
    <path d={d} fill="none" stroke="#FFF6E2" strokeOpacity={rim} strokeWidth={2} transform="translate(-0.8,-1)" />
  </g>
);

// ── paths ──────────────────────────────────────────────────────────────────────────────
export const circle = (cx: number, cy: number, r: number) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0Z`;
export const ellipse = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0Z`;
export const rect = (x: number, y: number, w: number, h: number) => `M${x},${y} L${x + w},${y} L${x + w},${y + h} L${x},${y + h}Z`;
export const poly = (pts: [number, number][]) => "M" + pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join(" L") + "Z";
/** hand-cut (angular) blob */
export const rock = (r: number, seed: number, n = 11, j = 0.16, sx = 1, sy = 1) => poly(Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2 + (hash(seed + i * 3.7) - 0.5) * 0.28;
  const rr = r * (1 + (hash(seed + i * 7.3) - 0.5) * 2 * j);
  return [Math.cos(a) * rr * sx, Math.sin(a) * rr * sy] as [number, number];
}));
export const blob = (r: number, seed: number, n = 12, j = 0.14, sx = 1, sy = 1) => {
  const p = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2, rr = r * (1 + (hash(seed + i * 7.3) - 0.5) * 2 * j);
    return [Math.cos(a) * rr * sx, Math.sin(a) * rr * sy];
  });
  return p.map((q, i) => {
    const nx = p[(i + 1) % n], pv = p[(i + n - 1) % n];
    return (i ? "" : `M${f1((pv[0] + q[0]) / 2)},${f1((pv[1] + q[1]) / 2)}`) + ` Q${f1(q[0])},${f1(q[1])} ${f1((q[0] + nx[0]) / 2)},${f1((q[1] + nx[1]) / 2)}`;
  }).join("") + "Z";
};
export const wave = (y: number, amp: number, seed: number, bottom = 2400, x0 = -320, x1 = 1400) => {
  let d = `M${x0},${bottom} L${x0},${y}`;
  for (let x = x0; x <= x1; x += 28) d += ` L${x},${f1(y + Math.sin(x / 230 + seed) * amp + Math.sin(x / 97 + seed * 2.3) * amp * 0.28)}`;
  return d + ` L${x1},${bottom}Z`;
};
export const arch = (x: number, y: number, w: number, h: number) => `M${x},${y} L${x},${y - h + w / 2} A${w / 2},${w / 2} 0 0,1 ${x + w},${y - h + w / 2} L${x + w},${y}Z`;

// ── light ──────────────────────────────────────────────────────────────────────────────
export const Pool: React.FC<{ x: number; y: number; rx: number; ry: number; col?: string; op?: number }> = ({ x, y, rx, ry, col = "#FFE7B0", op = 0.55 }) => (
  <path d={ellipse(x, y, rx, ry)} fill={col} opacity={op} filter="url(#psoft)" style={{ mixBlendMode: "screen" }} />
);
export const Rays: React.FC<{ x?: number; y?: number; op?: number; col?: string; t?: number; a0?: number; n?: number; step?: number }> = ({ x = -80, y = -40, op = 0.22, col = "#FFF1CC", t = 0, a0 = 0.62, n = 4, step = 0.13 }) => (
  <g opacity={op} style={{ mixBlendMode: "screen" }}>
    {Array.from({ length: n }, (_, i) => {
      const a = a0 + i * step + Math.sin(t * 0.3 + i) * 0.015, L = 2800, w = 0.03 + (i % 2) * 0.025;
      return <path key={i} d={`M${x},${y} L${f1(x + Math.cos(a - w) * L)},${f1(y + Math.sin(a - w) * L)} L${f1(x + Math.cos(a + w) * L)},${f1(y + Math.sin(a + w) * L)}Z`} fill={col} filter="url(#pglow)" />;
    })}
  </g>
);
export const Haze: React.FC<{ y: number; h?: number; op?: number; col?: string }> = ({ y, h = 240, op = 0.45, col = "#F7EBD6" }) => (
  <path d={rect(-320, y, 1720, h)} fill={col} opacity={op} filter="url(#psoft)" />
);
export const FG: React.FC<{ children: React.ReactNode; op?: number }> = ({ children, op = 1 }) => <g filter="url(#pdof)" opacity={op}>{children}</g>;

/** Paper sound ring: flat cut-card annulus at 0,0 (matte, fibre, pale cut edge, drop shadow; jury r1: stroked rings read as glossy tubes). k 0..1 = life. */
export const Ring: React.FC<{ k: number; r0?: number; r1: number; w?: number; sy?: number; col?: string }> = ({ k, r0 = 40, r1, w = 26, sy = 1, col = C.gold }) => {
  if (k <= 0 || k >= 1) return null;
  const r = lerp(r0, r1, easeOut(k)), op = Math.min(1, k * 6) * (1 - ease(ramp(k, 0.55, 1)));
  const ww = Math.max(3, w * (1 - 0.55 * k));
  const ri = Math.max(1, r - ww / 2), ro = r + ww / 2;
  const d = ellipse(0, 0, ro, ro * sy) + " " + ellipse(0, 0, ri, ri * sy);
  const face = mix(col, "#F3E6CC", 0.18);
  return (
    <g opacity={op}>
      <path d={d} fillRule="evenodd" fill="rgba(40,20,10,.30)" transform="translate(12,17)" filter="url(#pct)" />
      <path d={d} fillRule="evenodd" fill={mix(col, "#3A1C06", 0.5)} transform="translate(2.4,3.4)" />
      <path d={d} fillRule="evenodd" fill={mix(col, "#FFF8EA", 0.6)} transform="translate(1.2,1.6)" />
      <path d={d} fillRule="evenodd" fill={face} />
      <path d={d} fillRule="evenodd" fill="url(#fib)" />
    </g>
  );
};
/** repeated rings from time t0 on */
export const Rings: React.FC<{ t: number; t0: number; every?: number; n?: number; life?: number; r1: number; r0?: number; w?: number; sy?: number; col?: string }> = ({ t, t0, every = 0.75, n = 6, life = 2.1, r1, r0, w, sy, col }) => (
  <g>{Array.from({ length: n }, (_, i) => <Ring key={i} k={(t - t0 - i * every) / life} r1={r1} r0={r0} w={w} sy={sy} col={col} />)}</g>
);

// ── landscape ──────────────────────────────────────────────────────────────────────────
/** Laminated ground: three wave sheets, darker toward the viewer. */
export const Ground: React.FC<{ y: number; amp?: number; seed: number; cols: string[]; gap?: number; depth?: number }> = ({ y, amp = 26, seed, cols, gap = 90, depth = 0.8 }) => (
  <g>{cols.map((c, i) => <P key={i} d={wave(y + gap * i * (1 + i * 0.25), amp * (1 + i * 0.2), seed + i * 1.7)} fill={c} depth={depth} th={1.4} tex="krf" shade={i === cols.length - 1 ? "down" : "down"} />)}</g>
);
/** Faceted paper peaks with lit left face, dark right face, and strata tears. */
export const Peaks: React.FC<{ peaks: [number, number, number][]; base: number; col: string; seed: number; depth?: number; strata?: number; snow?: string }> = ({ peaks, base, col, seed, depth = 0.9, strata = 4 }) => (
  <g>
    {peaks.map(([x, y, w], i) => {
      const h = base - y, s = seed + i * 11;
      const j = (k: number, a: number) => (hash(s + k) - 0.5) * a;
      const L: [number, number][] = [[x - w, base], [x - w * 0.72 + j(1, 30), base - h * 0.34], [x - w * 0.42 + j(2, 34), base - h * 0.55 + j(3, 30)], [x - w * 0.2 + j(4, 20), base - h * 0.86], [x, y]];
      const R: [number, number][] = [[x + w * 0.16 + j(5, 20), base - h * 0.88], [x + w * 0.4 + j(6, 30), base - h * 0.6 + j(7, 30)], [x + w * 0.66 + j(8, 34), base - h * 0.32], [x + w, base]];
      const mid: [number, number][] = [[x + 14 + j(9, 20), base - h * 0.7], [x - w * 0.1 + j(10, 30), base - h * 0.45], [x + w * 0.08 + j(11, 40), base - h * 0.2], [x - w * 0.02, base]];
      return (
        <g key={i}>
          <P d={poly([...L, ...R])} fill={col} depth={depth} th={1.2} tex="krf" shade="diag" />
          <path d={poly([[x, y], ...R, ...mid.slice().reverse()])} fill={mix(col, "#2A1430", 0.34)} opacity={0.75} />
          <path d={poly([[x, y], ...R, ...mid.slice().reverse()])} fill="url(#fib)" />
          <path d={`M${[[x, y], ...mid].map((p) => p.map(f1).join(",")).join(" L")}`} fill="none" stroke="#FFF3DC" strokeOpacity={0.4} strokeWidth={2.4} />
          {Array.from({ length: strata }, (_, q) => {
            const u = 0.18 + q * 0.17, yy = base - h * (1 - u) * 0.86, ww = w * (0.1 + u * 0.62);
            return <path key={q} d={`M${f1(x - ww)},${f1(yy + j(20 + q, 26))} q${f1(ww * 0.4)},${f1(-18 + j(30 + q, 20))} ${f1(ww * 0.75)},${f1(6)} t${f1(ww * 0.22)},${f1(4)}`} fill="none" stroke={mix(col, "#1E0E0A", 0.4)} strokeOpacity={0.4} strokeWidth={3} />;
          })}
        </g>
      );
    })}
  </g>
);
/** Paper sun: stacked discs + cut rays. */
export const Sun: React.FC<{ x: number; y: number; r: number; t: number; hot?: string; rays?: boolean; glow?: number }> = ({ x, y, r, t, hot = "#FFF1C4", rays = true, glow = 0.7 }) => (
  <g transform={`translate(${x},${y})`}>
    <path d={circle(0, 0, r * 1.7)} fill={hot} opacity={glow * 0.55} filter="url(#psoft)" style={{ mixBlendMode: "screen" }} />
    {rays ? (
      <g transform={`rotate(${t * 3})`}>
        <P d={poly(Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2, q = r * (i % 2 ? 1.12 : 1.42); return [Math.cos(a) * q, Math.sin(a) * q] as [number, number]; }))} fill={mix(hot, C.gold, 0.5)} depth={0.5} />
      </g>
    ) : null}
    <P d={circle(0, 0, r)} fill={mix(hot, C.gold, 0.28)} depth={0.5} th={1.4} />
    <P d={circle(-r * 0.03, -r * 0.03, r * 0.82)} fill={mix(hot, C.gold, 0.1)} depth={0.25} />
    <P d={circle(-r * 0.05, -r * 0.05, r * 0.62)} fill={hot} depth={0.2} />
  </g>
);

// ── the stone: stacked contour sheets ──────────────────────────────────────────────────
export const Boulder: React.FC<{ r: number; seed?: number; tone?: string; depth?: number; sy?: number }> = ({ r, seed = 7, tone = C.stone, depth = 1, sy = 0.86 }) => {
  const n = 7;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const k = i / (n - 1), q = r * (1 - k * 0.74);
        return (
          <g key={i} transform={`translate(${f1(-r * 0.2 * k)},${f1(-r * 0.24 * k)})`}>
            <P d={rock(q, seed + i * 2.1, 15 - i, 0.1, 1.06, sy)} fill={mix(mix(tone, "#2E2620", 0.42), mix(tone, "#FFF3DE", 0.5), k)} depth={i === 0 ? depth : 0.34} th={i === 0 ? 2.4 : 1.3} tex="krf" />
          </g>
        );
      })}
      {[0, 1, 2].map((i) => {
        const a = 0.4 + i * 0.75, x0 = Math.cos(a) * r * 0.25, y0 = Math.sin(a) * r * 0.2;
        return <path key={i} d={`M${f1(x0)},${f1(y0)} l${f1(r * 0.16)},${f1(r * 0.07)} l${f1(r * 0.06)},${f1(r * 0.17)} l${f1(r * 0.2)},${f1(r * 0.08)} l${f1(-r * 0.21)},${f1(-r * 0.03)} l${f1(-r * 0.09)},${f1(-r * 0.16)}Z`} fill="#2A211B" opacity={0.75} />;
      })}
    </g>
  );
};
export const Pebbles: React.FC<{ n: number; seed: number; x0: number; x1: number; y0: number; y1: number; col?: string; r?: number }> = ({ n, seed, x0, x1, y0, y1, col = C.sandDk, r = 16 }) => (
  <g>{Array.from({ length: n }, (_, i) => {
    const rr = r * (0.4 + hash(seed + i * 2.3));
    return <g key={i} transform={`translate(${f1(lerp(x0, x1, hash(seed + i * 5.1)))},${f1(lerp(y0, y1, hash(seed + i * 9.7)))})`}><K d={rock(rr, seed + i, 7, 0.2, 1.3, 0.75)} fill={mix(col, i % 2 ? "#FFF0D6" : "#3A2418", 0.22)} /></g>;
  })}</g>
);
/** paper dust / scraps flying out from 0,0 */
export const Scraps: React.FC<{ k: number; n?: number; seed?: number; reach?: number; col?: string[]; up?: number; size?: number }> = ({ k, n = 22, seed = 3, reach = 420, col = [C.sandLt, C.sand, "#FFF3DA"], up = 0.7, size = 16 }) => {
  if (k <= 0 || k >= 1) return null;
  return <g opacity={1 - ease(ramp(k, 0.6, 1))}>{Array.from({ length: n }, (_, i) => {
    const a = Math.PI * (1 + hash(seed + i)) , d = reach * (0.3 + hash(seed + i * 3.1) * 0.8) * easeOut(k);
    const x = Math.cos(a) * d, y = Math.sin(a) * d * up + k * k * 170, s = size * (0.5 + hash(seed + i * 4.7));
    return <g key={i} transform={`translate(${f1(x)},${f1(y)}) rotate(${f1(hash(seed + i * 6) * 360 + k * 220)})`}><K d={poly([[-s, -s * 0.4], [s * 0.8, -s * 0.7], [s, s * 0.5], [-s * 0.6, s * 0.6]])} fill={col[i % col.length]} sh={0.6} /></g>;
  })}</g>;
};

// ── people: layered, faceless, from behind ─────────────────────────────────────────────
/** tapered sleeve polygon shoulder → elbow → hand */
export const sleeve = (p: [number, number][], w0: number, w1: number) => {
  const n = (a: number[], b: number[]) => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l]; };
  const [s, e, h] = p, n0 = n(s, e), n2 = n(e, h), n1 = [(n0[0] + n2[0]) / 2, (n0[1] + n2[1]) / 2], wm = (w0 + w1) / 2;
  return poly([[s[0] + n0[0] * w0, s[1] + n0[1] * w0], [e[0] + n1[0] * wm, e[1] + n1[1] * wm], [h[0] + n2[0] * w1, h[1] + n2[1] * w1], [h[0] - n2[0] * w1, h[1] - n2[1] * w1], [e[0] - n1[0] * wm, e[1] - n1[1] * wm], [s[0] - n0[0] * w0, s[1] - n0[1] * w0]]);
};
export type Arm = [[number, number], [number, number]]; // elbow, hand
export type FigProps = { col: string; cloak?: string; wrap?: string; s?: number; armL?: Arm; armR?: Arm; lean?: number; sway?: number; shadow?: number; shLen?: number; step?: number; hands?: string; flip?: boolean; front?: boolean };
const DOWN_L: Arm = [[-104, -230], [-100, -130]], DOWN_R: Arm = [[104, -230], [100, -130]];
/** Standing paper person, feet at 0,0, ~430 tall at s=1. Back view: cloth only, no face. */
export const Fig: React.FC<FigProps> = ({ col, cloak, wrap = "#EFE2C6", s = 1, armL = DOWN_L, armR = DOWN_R, lean = 0, sway = 0, shadow = 0.42, shLen = 1, step = 0, hands = C.skin, flip }) => {
  const ck = cloak ?? mix(col, "#1A0E08", 0.22);
  const hem = (x: number) => Math.sin(x * 0.05) * 5 + step * x * 0.04;
  const robe = `M-64,-328 C-92,-220 -98,-110 -104,${f1(-4 + hem(-104))} L-62,${f1(4 + hem(-60))} L-20,${f1(-4 + hem(-20))} L26,${f1(5 + hem(26))} L66,${f1(-3 + hem(66))} L106,${f1(2 + hem(106))} C98,-110 92,-220 64,-328 Q0,-352 -64,-328Z`;
  const cl = `M-66,-330 C-112,-230 -122,-120 -124,-34 L-92,-24 L-48,-30 C-52,-140 -44,-250 -10,-336 Q-40,-342 -66,-330Z`;
  const cr = `M66,-330 C112,-230 122,-120 124,-34 L92,-24 L48,-30 C52,-140 44,-250 10,-336 Q40,-342 66,-330Z`;
  const all = `${robe} ${cl} ${cr} ${circle(0, -384, 48)} ${sleeve([[-64, -310], ...armL], 25, 34)} ${sleeve([[64, -310], ...armR], 25, 34)}`;
  return (
    <g transform={`scale(${flip ? -s : s},${s})`}>
      {shadow ? <path d={all} fill="#2A140C" opacity={shadow} transform={`matrix(1 0 ${flip ? 0.9 * shLen : -0.9 * shLen} ${-0.34 * shLen} 0 0)`} filter="url(#psh)" /> : null}
      <g transform={`rotate(${f1(lean + sway)})`}>
        <path d={all} fill="rgba(34,18,10,.34)" transform="translate(16,22)" filter="url(#psh)" />
        <K d={sleeve([[64, -310], ...armR], 25, 34)} fill={mix(col, "#1A0E08", 0.26)} />
        <K d={robe} fill={col} />
        {[-60, -22, 18, 58].map((x, i) => <path key={i} d={`M${x * 0.55},-250 Q${x * 0.8},-130 ${x},-8 L${x + 13},-8 Q${x * 0.85 + 8},-130 ${x * 0.55 + 2},-250Z`} fill="#241208" opacity={0.2} />)}
        <K d={cr} fill={mix(ck, "#1A0E08", 0.2)} />
        <K d={cl} fill={ck} />
        <path d="M-74,-300 Q-100,-180 -100,-40 M74,-300 Q98,-180 96,-40" stroke={mix(ck, "#FFF3DC", 0.45)} strokeWidth={2.6} fill="none" opacity={0.65} />
        <K d={sleeve([[-64, -310], ...armL], 25, 34)} fill={mix(col, "#FFF6E6", 0.06)} />
        {[armL, armR].map((a, i) => <g key={i} transform={`translate(${a[1][0]},${a[1][1]})`}><K d={blob(17, i + 2, 8, 0.1, 1, 1.15)} fill={hands} sh={0.4} /></g>)}
        {/* shoulder cloth + head wrap, seen from behind */}
        <K d="M-78,-318 Q-58,-352 0,-354 Q58,-352 78,-318 Q40,-288 0,-284 Q-40,-288 -78,-318Z" fill={mix(wrap, "#1A0E08", 0.2)} />
        <K d="M-40,-344 C-56,-400 -38,-436 0,-438 C38,-436 56,-400 40,-344 Q0,-326 -40,-344Z" fill={mix(wrap, "#1A0E08", 0.1)} />
        <K d="M-50,-382 Q-44,-444 0,-446 Q44,-444 50,-382 Q24,-366 0,-368 Q-26,-366 -50,-382Z" fill={wrap} />
        <path d="M-46,-396 Q0,-424 46,-400 M-38,-420 Q4,-444 34,-422 M-48,-384 Q0,-392 48,-386" stroke={mix(wrap, "#2A140C", 0.42)} strokeWidth={3} fill="none" opacity={0.7} />
        <K d="M8,-370 Q34,-340 26,-268 L4,-276 Q10,-330 -6,-366Z" fill={mix(wrap, "#FFFFFF", 0.12)} sh={0.6} />
      </g>
    </g>
  );
};
/** Seated paper person seen from behind / side, base 0,0, ~300 tall. */
export const Seated: React.FC<{ col: string; wrap?: string; s?: number; flip?: boolean; sway?: number }> = ({ col, wrap = "#EFE2C6", s = 1, flip, sway = 0 }) => {
  const body = "M-150,0 C-176,-40 -140,-92 -104,-100 C-112,-180 -84,-236 -52,-252 Q0,-268 52,-250 C92,-230 110,-160 112,-104 C164,-92 182,-38 156,0 Q0,22 -150,0Z";
  return (
    <g transform={`scale(${flip ? -s : s},${s})`}>
      <path d={body} fill="#1E100A" opacity={0.42} transform="matrix(1 0 -0.8 -0.3 0 0)" filter="url(#psh)" />
      <g transform={`rotate(${f1(sway)})`}>
        <path d={body} fill="rgba(34,18,10,.36)" transform="translate(18,20)" filter="url(#psh)" />
        <K d={body} fill={col} />
        <K d="M-150,0 C-176,-40 -140,-92 -90,-92 C-20,-84 20,-50 10,4 Q-70,14 -150,0Z" fill={mix(col, "#1A0E08", 0.16)} />
        <K d="M156,0 C182,-38 164,-92 96,-90 C40,-78 4,-48 10,6 Q90,14 156,0Z" fill={mix(col, "#1A0E08", 0.3)} />
        <path d="M-60,-236 Q-84,-160 -70,-100 M0,-252 Q-8,-170 6,-96 M62,-236 Q84,-170 78,-104" stroke="#1E100A" strokeWidth={4} fill="none" opacity={0.28} />
        <K d="M-70,-236 Q-50,-272 0,-274 Q50,-272 70,-236 Q36,-208 0,-206 Q-36,-208 -70,-236Z" fill={mix(wrap, "#1A0E08", 0.2)} />
        <K d="M-40,-264 C-56,-320 -38,-356 0,-358 C38,-356 56,-320 40,-264 Q0,-246 -40,-264Z" fill={mix(wrap, "#1A0E08", 0.1)} />
        <K d="M-50,-302 Q-44,-364 0,-366 Q44,-364 50,-302 Q24,-286 0,-288 Q-26,-286 -50,-302Z" fill={wrap} />
        <path d="M-46,-316 Q0,-344 46,-320 M-38,-340 Q4,-364 34,-342" stroke={mix(wrap, "#2A140C", 0.42)} strokeWidth={3} fill="none" opacity={0.7} />
        <K d="M8,-290 Q34,-260 26,-190 L4,-198 Q10,-250 -6,-286Z" fill={mix(wrap, "#FFFFFF", 0.12)} sh={0.6} />
      </g>
    </g>
  );
};
/** Lying paper figure (on the back, head at left, face covered by cloth), 0,0 = chest on the ground, ~760 wide. */
export const Lying: React.FC<{ s?: number; breathe?: number; sunk?: number; col?: string }> = ({ s = 1, breathe = 0, sunk = 0, col = C.ivory }) => {
  const y = (v: number) => f1(v * (1 - 0.14 * sunk) - breathe * 4);
  const robe = `M-210,0 C-226,-40 -200,${y(-96)} -120,${y(-120)} C-40,${y(-140)} 60,${y(-122)} 150,${y(-96)} C240,-80 320,-74 372,-62 L392,-28 L366,0 Q80,20 -210,0Z`;
  return (
    <g transform={`scale(${s})`}>
      <path d={ellipse(60, 18, 420, 34)} fill="#2A140C" opacity={0.5} filter="url(#psh)" />
      <g transform="translate(382,-44)"><K d="M-6,40 C-14,0 0,-44 20,-58 Q42,-60 40,-34 Q34,10 30,42Z" fill={C.skin} /></g>
      <g transform="translate(352,-40)"><K d="M-6,42 C-14,0 0,-44 20,-58 Q42,-60 40,-34 Q34,10 30,44Z" fill={mix(C.skin, "#FFE0C0", 0.12)} /></g>
      <path d={robe} fill="rgba(34,18,10,.36)" transform="translate(22,26)" filter="url(#psh)" />
      <K d={robe} fill={col} />
      <K d={`M-40,${y(-128)} C60,${y(-124)} 150,${y(-96)} 372,-62 L392,-28 L366,0 Q260,12 160,12 C120,-40 40,-80 -40,${y(-128)}Z`} fill={mix(col, "#8A6A48", 0.2)} />
      {[-150, -96, -30, 60, 140, 220, 300].map((x, i) => <path key={i} d={`M${x},${f1(-20 + (i % 2) * 10)} q${18 + i * 3},${-40 - (i % 3) * 8} ${58},${-52}`} stroke="#6E5238" strokeWidth={4} fill="none" opacity={0.4} strokeLinecap="round" />)}
      {/* rope belt */}
      <K d={`M86,${y(-114)} L116,${y(-106)} L104,6 L72,8Z`} fill={C.brown} sh={0.5} />
      {/* head wrapped in cloth, turned away */}
      <K d="M-212,-4 C-236,-60 -214,-112 -268,-124 C-330,-132 -366,-86 -356,-36 C-350,4 -300,18 -250,14Z" fill={mix("#E6D3AE", "#1A0E08", 0.1)} />
      <K d="M-226,-18 C-230,-76 -252,-118 -290,-124 C-340,-126 -364,-84 -356,-40 C-320,-60 -270,-50 -226,-18Z" fill="#EFDDB8" />
      <path d="M-352,-58 Q-300,-84 -240,-56 M-344,-86 Q-300,-108 -250,-88 M-350,-34 Q-300,-40 -236,-14" stroke="#7A5A3A" strokeWidth={4} fill="none" opacity={0.6} />
    </g>
  );
};

// ── buildings ──────────────────────────────────────────────────────────────────────────
/** Mud-brick paper house in 3/4 view, base-left at 0,0. lit 0..1 = window glow. */
export const House: React.FC<{ w: number; h: number; d?: number; col?: string; seed?: number; lit?: number; win?: number; door?: boolean; depth?: number; parapet?: boolean; beams?: boolean }> = ({ w, h, d = 0.32, col = C.mud, seed = 1, lit = 0, win = 2, door, depth = 0.7, parapet = true, beams = true }) => {
  const dx = w * d, dy = dx * 0.42;
  const glow = mix("#4A2E22", "#FFC95A", lit);
  return (
    <g>
      <P d={poly([[w, 0], [w + dx, -dy], [w + dx, -h - dy], [w, -h]])} fill={mix(col, "#2A1020", 0.42)} depth={depth} tex="krf" />
      <P d={poly([[0, -h], [w, -h], [w + dx, -h - dy], [dx, -h - dy]])} fill={mix(col, "#FFF3DC", 0.3)} depth={0} noShadow />
      <P d={parapet ? poly([[0, 0], [0, -h - 16], ...Array.from({ length: Math.max(2, Math.round(w / 46)) }, (_, i) => { const n = Math.max(2, Math.round(w / 46)), a = (i / n) * w, b = ((i + 1) / n) * w; const top = i % 2 ? -h - 2 : -h - 20; return [[a, top], [b, top]] as [number, number][]; }).flat(), [w, 0]]) : rect(0, -h, w, h)} fill={col} depth={0.3} tex="krf" shade="diag" />
      {beams ? Array.from({ length: Math.max(2, Math.round(w / 60)) }, (_, i) => <g key={i} transform={`translate(${f1((i + 0.5) * (w / Math.max(2, Math.round(w / 60))))},${f1(-h * 0.88)})`}><K d={circle(0, 0, 6.5)} fill={C.brown} sh={0.9} /></g>) : null}
      {Array.from({ length: win }, (_, i) => {
        const ww = Math.min(46, w / (win + 1.6)), x = (w / win) * (i + 0.5) - ww / 2, y = -h * (0.52 + 0.12 * (hash(seed + i) - 0.5));
        return (
          <g key={i}>
            {lit > 0.05 ? <path d={ellipse(x + ww / 2, y - ww * 0.6, ww * 1.5, ww * 1.7)} fill="#FFC95A" opacity={0.4 * lit} filter="url(#pglow)" style={{ mixBlendMode: "screen" }} /> : null}
            <path d={arch(x - 5, y + 5, ww + 10, ww * 1.5 + 8)} fill={mix(col, "#FFF6E4", 0.42)} />
            <path d={arch(x, y, ww, ww * 1.5)} fill={mix(glow, "#1A0C06", 0.35)} />
            <path d={arch(x + 5, y, ww - 5, ww * 1.5 - 7)} fill={glow} />
            <path d={`M${x + ww / 2},${y} V${y - ww * 1.4} M${x},${y - ww * 0.6} h${ww}`} stroke={C.brown} strokeWidth={3} />
          </g>
        );
      })}
      {door ? <g><path d={arch(w * 0.36 - 5, 0, w * 0.28 + 10, h * 0.46 + 5)} fill={mix(col, "#FFF6E4", 0.42)} /><path d={arch(w * 0.36, 0, w * 0.28, h * 0.46)} fill="#3A2016" /><path d={arch(w * 0.36 + 7, 0, w * 0.28 - 7, h * 0.46 - 8)} fill={mix(C.brown, "#FFC95A", lit * 0.5)} /></g> : null}
    </g>
  );
};
/** Date palm, foot at 0,0 */
export const Palm: React.FC<{ s?: number; t?: number; seed?: number; col?: string; h?: number }> = ({ s = 1, t = 0, seed = 1, col = C.leaf, h = 360 }) => (
  <g transform={`scale(${s})`}>
    <K d={`M-16,0 C-10,${-h * 0.4} 4,${-h * 0.7} 8,${-h} L30,${-h} C26,${-h * 0.7} 16,${-h * 0.4} 18,0Z`} fill={C.brown} />
    {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-13 + i * 2.6},${f1(-h * (0.08 + i * 0.11))} l26,-6`} stroke="#3A2416" strokeWidth={4} opacity={0.5} />)}
    <g transform={`translate(18,${-h})`}>
      {[-165, -130, -95, -60, -30, 5, 40, 190].map((a, i) => {
        const r = a + Math.sin(t * 1.1 + seed + i) * 3;
        return <g key={i} transform={`rotate(${f1(r)})`}><K d="M0,-6 Q70,-46 150,-18 Q176,-6 190,26 Q150,2 120,4 L112,18 L98,4 L86,20 L72,4 L58,20 L46,4 Q20,6 0,6Z" fill={mix(col, i % 2 ? "#1A2A10" : "#FFF3C8", 0.16)} /></g>;
      })}
      {[-14, 2, 18].map((x, i) => <g key={i} transform={`translate(${x},${16 + (i % 2) * 8})`}><K d={circle(0, 0, 10)} fill="#A0602C" sh={0.4} /></g>)}
    </g>
  </g>
);
/** Plain black cube with a plain gold band (no script), base centre at 0,0. */
export const Kaaba: React.FC<{ w?: number; t?: number; light?: number }> = ({ w = 420, light = 0 }) => {
  const h = w * 1.02, sw = w * 0.34, dy = sw * 0.36;
  const x0 = -w / 2 - sw * 0.35, x1 = x0 + w, x2 = x1 + sw;
  const base = mix("#241C1A", "#5A4430", light * 0.35);
  return (
    <g>
      <path d={poly([[x0, 0], [x2, -dy], [x2 + w * 0.75, h * 0.24], [x1 + w * 0.35, h * 0.3]])} fill="#1E100A" opacity={0.45} filter="url(#psh)" />
      <P d={poly([[x0 - 20, 0], [x1 + 4, 0], [x2 + 18, -dy], [x2 + 18, -dy + 34], [x1 + 4, 36], [x0 - 20, 36]])} fill="#D9C6A4" depth={0.5} tex="krf" />
      <P d={poly([[x1, 0], [x2, -dy], [x2, -h - dy], [x1, -h]])} fill={mix(base, "#000000", 0.4)} depth={0.8} tex="krf" />
      <P d={poly([[x0, -h], [x1, -h], [x2, -h - dy], [x0 + sw, -h - dy]])} fill={mix(base, "#C9A878", 0.34)} depth={0} noShadow />
      <P d={poly([[x0, 0], [x1, 0], [x1, -h], [x0, -h]])} fill={base} depth={0.4} th={1.6} tex="krf" />
      {[0.14, 0.3, 0.5, 0.68, 0.86].map((u, i) => <path key={i} d={`M${f1(x0 + w * u)},-${f1(h)} q${6 + i * 2},${f1(h * 0.5)} ${-4 + i * 2},${f1(h * 0.98)}`} stroke="#8A7458" strokeWidth={3} fill="none" opacity={0.26} />)}
      <K d={poly([[x0, -h * 0.8], [x1, -h * 0.8], [x1, -h * 0.68], [x0, -h * 0.68]])} fill={C.gold} />
      <K d={poly([[x1, -h * 0.8], [x2, -h * 0.8 - dy], [x2, -h * 0.68 - dy], [x1, -h * 0.68]])} fill={mix(C.gold, "#2A140C", 0.4)} />
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={poly([[x0 + w * (0.03 + i * 0.1), -h * 0.74], [x0 + w * (0.06 + i * 0.1), -h * 0.765], [x0 + w * (0.09 + i * 0.1), -h * 0.74], [x0 + w * (0.06 + i * 0.1), -h * 0.715]])} fill="#FFE9A8" opacity={0.75} />)}
    </g>
  );
};
/** Domed prayer hall + minaret for the modern horizon. */
export const Minaret: React.FC<{ s?: number; lit?: number; col?: string }> = ({ s = 1, lit = 0, col = "#EFE0C4" }) => (
  <g transform={`scale(${s})`}>
    {lit > 0.02 ? <path d={ellipse(0, -330, 120, 120)} fill="#FFD36A" opacity={0.6 * lit} filter="url(#psoft)" style={{ mixBlendMode: "screen" }} /> : null}
    <K d={rect(-34, -300, 68, 300)} fill={col} />
    <K d={rect(-46, -318, 92, 26)} fill={mix(col, "#FFFFFF", 0.3)} />
    <K d={rect(-26, -380, 52, 64)} fill={mix(col, "#1A0E08", 0.1)} />
    <path d={arch(-13, -322, 26, 44)} fill={mix("#3A2A44", "#FFC44A", lit)} />
    <K d="M-34,-378 Q-30,-430 0,-462 Q30,-430 34,-378Z" fill={mix(C.teal, "#FFFFFF", 0.1)} />
    <path d="M0,-462 V-490" stroke={C.gold} strokeWidth={6} />
    <path d={arch(-11, -200, 22, 46)} fill={mix("#3A2A44", "#FFC44A", lit)} /><path d={arch(-11, -100, 22, 46)} fill={mix("#3A2A44", "#FFC44A", lit)} />
    <K d="M40,0 V-90 Q44,-180 130,-196 Q216,-180 220,-90 V0Z" fill={mix(col, "#1A0E08", 0.14)} />
    <K d="M62,-96 Q66,-196 130,-224 Q194,-196 198,-96Z" fill={mix(C.teal, "#FFFFFF", 0.04)} />
    {[66, 112, 158].map((x) => <path key={x} d={arch(x, 0, 34, 66)} fill={mix("#3A2A44", "#FFC44A", lit)} />)}
  </g>
);
export const Stars: React.FC<{ t: number; n?: number; h?: number; y0?: number; op?: number }> = ({ t, n = 40, h = 900, y0 = 100, op = 1 }) => (
  <g opacity={op}>{Array.from({ length: n }, (_, i) => {
    const x = hash(i * 3.3) * 1180 - 50, y = y0 + hash(i * 7.1) * h, r = 5 + hash(i) * 9, q = r * 0.28;
    return <path key={i} d={`M${f1(x)},${f1(y - r)} l${f1(q)},${f1(r - q)} l${f1(r - q)},${f1(q)} l${f1(-r + q)},${f1(q)} l${f1(-q)},${f1(r - q)} l${f1(-q)},${f1(-r + q)} l${f1(-r + q)},${f1(-q)} l${f1(r - q)},${f1(-q)}Z`} fill="#FFF3D6" opacity={0.4 + 0.5 * Math.abs(Math.sin(t * 1.3 + i))} />;
  })}</g>
);
export const Cloud: React.FC<{ x: number; y: number; r: number; seed: number; col?: string; depth?: number }> = ({ x, y, r, seed, col = C.paper, depth = 0.6 }) => (
  <g transform={`translate(${f1(x)},${f1(y)})`}>
    <P d={blob(r, seed, 11, 0.16, 1.8, 0.6)} fill={col} depth={depth} />
    <P d={blob(r * 0.66, seed + 3, 9, 0.14, 1.5, 0.66)} fill={mix(col, "#ffffff", 0.35)} depth={depth * 0.4} />
  </g>
);
/** Corner flowers / leaves for the DOF plane. */
export const Leaf: React.FC<{ x: number; y: number; r: number; col: string; s?: number }> = ({ x, y, r, col, s = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}><P d="M0,0 C60,-120 170,-160 260,-140 C210,-60 100,-6 0,0Z" fill={col} depth={0.6} /><path d="M10,-8 Q120,-90 240,-134" stroke="#FFF3DC" strokeWidth={4} opacity={0.4} fill="none" /></g>
);
export const Flower: React.FC<{ x: number; y: number; s?: number; col?: string; r?: number }> = ({ x, y, s = 1, col = C.rose, r = 0 }) => (
  <g transform={`translate(${f1(x)},${f1(y)}) rotate(${f1(r)}) scale(${s})`}>
    {[0, 72, 144, 216, 288].map((a) => <g key={a} transform={`rotate(${a})`}><K d="M0,0 C-22,-18 -18,-50 0,-56 C18,-50 22,-18 0,0Z" fill={col} sh={0.5} /></g>)}
    <K d={circle(0, 0, 13)} fill={C.gold} sh={0.5} />
  </g>
);
