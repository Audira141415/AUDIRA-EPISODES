// PAPERWORLD paper pieces for EP46 Iblis Menolak Sujud (pure SVG, 1080 × 1920 design space).
// Lighting rule (jury lessons): one key light from upper-left. Every card throws a LONG directional cast shadow
// (down-right) + a tight contact shadow, has a pale cut edge, a face gradient and a cream rim on the lit edge.
// Adab: no face or figure of Adam (clay + light), angels = faceless light pillars, Iblis = paper flame + shadow.
// No Math.random: seeded hash only.
import React from "react";

export const C = {
  ivory: "#F6EFE4", paper: "#FFF6E6", indigo: "#2B2550", indigo2: "#4A3F7A", dusk: "#6B4C8C",
  gold: "#F2C46B", dawn: "#F7D9A8", peach: "#F4C2A0", flame: "#E2572B", ember: "#F59A3A", ash: "#2A1838",
  clay: "#A0704C", clayDk: "#7A5236", clayLt: "#D2A57A", teal: "#5E9C8F", tealDk: "#3F7A70", leaf: "#8DBA7A",
  river: "#7FB6D6", coral: "#D9483F", red: "#D9483F", ink: "#221B2E", wood: "#7A5236",
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

export const SHADOW = "rgba(34,22,56,.34)";
export const CONTACT = "rgba(28,18,46,.30)";

export const PaperDefs: React.FC = () => (
  <defs>
    <filter id="pshadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7" /></filter>
    <filter id="pcontact" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5" /></filter>
    <filter id="psoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22" /></filter>
    <filter id="pglow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="14" /></filter>
    <filter id="pdof" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" /></filter>
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
    {noShadow ? null : <path d={d} fill={SHADOW} transform={`translate(${32 * depth},${42 * depth})`} filter="url(#pshadow)" />}
    {noShadow ? null : <path d={d} fill={CONTACT} transform={`translate(${6 * depth},${8 * depth})`} filter="url(#pcontact)" />}
    <path d={d} fill={edge ?? mix(fill, "#ffffff", 0.5)} transform={`translate(${3 * depth},${4 * depth})`} />
    <path d={d} fill={fill} />
    {light ? <path d={d} fill="url(#plight)" /> : null}
    {light ? <path d={d} fill="none" stroke="#FFF6E2" strokeOpacity={0.75} strokeWidth={3.4} transform="translate(-1.4,-1.8)" /> : null}
  </g>
);

/** Composite paper object: draw(null) = real colours, draw(color) = everything in that colour (shadow pass). */
export const Layered: React.FC<{ draw: (c: string | null) => React.ReactNode; depth?: number }> = ({ draw, depth = 1 }) => (
  <g>
    <g transform={`translate(${26 * depth},${36 * depth})`} filter="url(#pshadow)">{draw(SHADOW)}</g>
    <g transform={`translate(${5 * depth},${7 * depth})`} filter="url(#pcontact)">{draw(CONTACT)}</g>
    <g transform={`translate(${2.5 * depth},${3.5 * depth})`} opacity={0.6}>{draw("#FFF6E6")}</g>
    {draw(null)}
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

/** Hill band: top edge around y, filled to the bottom. */
export const hill = (y: number, amp: number, seed: number, x0 = -200, x1 = 1280, bottom = 2200) => {
  let d = `M${x0},${bottom} L${x0},${y}`;
  for (let x = x0; x <= x1; x += 30) {
    const v = Math.sin(x / 230 + seed) * amp + Math.sin(x / 97 + seed * 2.3) * amp * 0.28;
    d += ` L${x},${(y + v).toFixed(1)}`;
  }
  return d + ` L${x1},${bottom}Z`;
};

export const Hill: React.FC<{ y: number; amp?: number; seed: number; col: string; depth?: number }> = ({ y, amp = 40, seed, col, depth = 1 }) => (
  <P d={hill(y, amp, seed)} fill={col} depth={depth} />
);

/** Soft pool of light (screen blend). */
export const LightPool: React.FC<{ x: number; y: number; rx: number; ry: number; col?: string; op?: number }> = ({ x, y, rx, ry, col = "#FFE7B0", op = 0.6 }) => (
  <path d={ellipse(x, y, rx, ry)} fill={col} opacity={op} filter="url(#psoft)" style={{ mixBlendMode: "screen" }} />
);

/** Light shafts from the upper-left key light. */
export const Rays: React.FC<{ x?: number; y?: number; op?: number; col?: string; t?: number; a0?: number }> = ({ x = -80, y = -40, op = 0.22, col = "#FFF1CC", t = 0, a0 = 0.62 }) => (
  <g opacity={op} style={{ mixBlendMode: "screen" }}>
    {[0, 1, 2, 3].map((i) => {
      const a = a0 + i * 0.13 + Math.sin(t * 0.3 + i) * 0.015;
      const L = 2600, wdt = 0.035 + (i % 2) * 0.02;
      const p1 = [x + Math.cos(a - wdt) * L, y + Math.sin(a - wdt) * L], p2 = [x + Math.cos(a + wdt) * L, y + Math.sin(a + wdt) * L];
      return <path key={i} d={`M${x},${y} L${p1[0]},${p1[1]} L${p2[0]},${p2[1]}Z`} fill={col} filter="url(#pglow)" />;
    })}
  </g>
);

/** Cut-paper stars (4-point) twinkling. */
export const Stars: React.FC<{ t: number; n?: number; h?: number; y0?: number }> = ({ t, n = 40, h = 900, y0 = 200 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = hash(i * 3.3) * 1080, y = y0 + hash(i * 7.1) * h, r = 4 + hash(i) * 7;
      const op = 0.45 + 0.5 * Math.abs(Math.sin(t * 1.3 + i));
      return <path key={i} d={`M${x},${y - r} L${x + r * 0.28},${y - r * 0.28} L${x + r},${y} L${x + r * 0.28},${y + r * 0.28} L${x},${y + r} L${x - r * 0.28},${y + r * 0.28} L${x - r},${y} L${x - r * 0.28},${y - r * 0.28}Z`} fill="#FFF3D6" opacity={op} />;
    })}
  </g>
);

/** Cream haze band — only between BG and MG (never on the near ground). */
export const Haze: React.FC<{ y: number; h?: number; op?: number; col?: string }> = ({ y, h = 260, op = 0.45, col = "#F7EBD6" }) => (
  <path d={rect(-200, y, 1480, h)} fill={col} opacity={op} filter="url(#psoft)" />
);

/** Foreground DOF plane (blur 9) for the lower corners. */
export const FG: React.FC<{ children: React.ReactNode; op?: number }> = ({ children, op = 1 }) => (
  <g filter="url(#pdof)" opacity={op}>{children}</g>
);

export const Cloud: React.FC<{ x: number; y: number; r: number; seed: number; col?: string; depth?: number }> = ({ x, y, r, seed, col = C.paper, depth = 0.7 }) => (
  <g transform={`translate(${x},${y})`}>
    <P d={blob(r, seed, 11, 0.16, 1.7, 0.62)} fill={col} depth={depth} edge="#FFFFFF" />
    <P d={blob(r * 0.62, seed + 3, 9, 0.14, 1.4, 0.7)} fill={mix(col, "#ffffff", 0.3)} depth={depth * 0.4} edge="#FFFFFF" />
  </g>
);

// ── Iblis: layered paper flame, no face ─────────────────────────────────────────────
const tongue = (w: number, h: number, sw: number) =>
  `M${-w},0 C${(-w * 1.05).toFixed(1)},${(-h * 0.35).toFixed(1)} ${(-w * 0.35 + sw * 0.5).toFixed(1)},${(-h * 0.55).toFixed(1)} ${sw.toFixed(1)},${(-h).toFixed(1)} C${(w * 0.35 + sw * 0.5).toFixed(1)},${(-h * 0.55).toFixed(1)} ${(w * 1.05).toFixed(1)},${(-h * 0.35).toFixed(1)} ${w},0 Q0,${(w * 0.3).toFixed(1)} ${-w},0Z`;

const FLAME_COLS = ["#9E2A1C", "#D9482A", "#EE7430", "#F59A3A", "#F9C658", "#FFE9A8"];

/** Paper flame, base at 0,0. pride grows it taller. dim fades it toward ash. */
export const Flame: React.FC<{ t: number; s?: number; pride?: number; dim?: number; glow?: number }> = ({ t, s = 1, pride = 0, dim = 0, glow = 1 }) => {
  const W = 120, H = 380 * (1 + 0.4 * pride);
  return (
    <g transform={`scale(${s})`}>
      <path d={ellipse(0, -H * 0.42, H * 0.72, H * 0.8)} fill="#FF8A3A" opacity={0.5 * glow * (1 - dim)} filter="url(#psoft)" style={{ mixBlendMode: "screen" }} />
      {FLAME_COLS.map((col, k) => {
        const f = 1 - k * 0.15;
        const h = H * (0.32 + 0.68 * f) * (1 + 0.05 * Math.sin(t * 7 + k * 1.7));
        const w = W * f;
        const sw = Math.sin(t * 2.3 + k * 0.9) * 16 * f;
        const c = mix(col, "#3A2A44", dim * 0.8);
        return (
          <g key={k}>
            {k < 3 ? [-1, 1].map((sd) => (
              <g key={sd} transform={`translate(${sd * w * 0.78},6)`}>
                <P d={tongue(w * 0.42, h * 0.55, Math.sin(t * 3.1 + k + sd) * 12)} fill={c} depth={k === 0 ? 0.8 : 0.2} noShadow={k > 0} />
              </g>
            )) : null}
            <P d={tongue(w, h, sw)} fill={c} depth={k === 0 ? 1 : 0.25} noShadow={k > 0} edge={k === 0 ? "#F7B48A" : undefined} />
          </g>
        );
      })}
    </g>
  );
};

/** Long dark shadow on the ground, from 0,0 toward +y (toward the camera). */
export const LongShadow: React.FC<{ len: number; w?: number; skew?: number; op?: number }> = ({ len, w = 90, skew = 0, op = 0.55 }) => (
  <path d={`M${-w},0 L${w},0 L${w * 2.2 + skew},${len} L${-w * 2.2 + skew},${len}Z`} fill={C.ash} opacity={op} filter="url(#pshadow)" />
);

// ── Angels: faceless light pillars of tracing paper ────────────────────────────────────
/** Pillar of light, base at 0,0. bow 0 = upright, 1 = bowed in sujud toward dir. */
export const Pillar: React.FC<{ h?: number; w?: number; bow?: number; dir?: number; glow?: number; t?: number; seed?: number; col?: string }> = ({ h = 420, w = 50, bow = 0, dir = 1, glow = 1, t = 0, seed = 0, col = "#FFF3D6" }) => {
  const b = clamp01(bow);
  const tipX = dir * h * 0.8 * b, tipY = -h * (1 - 0.84 * b);
  const cx = dir * h * 0.08 * b, cy = -h * (0.66 - 0.06 * b);
  const N = 14;
  const L: string[] = [], R: string[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const x = 2 * (1 - u) * u * cx + u * u * tipX + Math.sin(t * 1.3 + seed + u * 2) * 4 * u;
    const y = 2 * (1 - u) * u * cy + u * u * tipY;
    const dx = 2 * (1 - u) * cx + 2 * u * (tipX - cx), dy = 2 * (1 - u) * cy + 2 * u * (tipY - cy);
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const ww = w * (1 - 0.5 * u) * 0.5 * (i === N ? 0.98 : 1);
    L.push(`${(x + nx * ww).toFixed(1)},${(y + ny * ww).toFixed(1)}`);
    R.push(`${(x - nx * ww).toFixed(1)},${(y - ny * ww).toFixed(1)}`);
  }
  const d = `M${L.join(" L")} L${R.reverse().join(" L")}Z`;
  return (
    <g>
      <path d={d} fill={C.gold} opacity={0.55 * glow} filter="url(#pglow)" style={{ mixBlendMode: "screen" }} />
      <P d={d} fill={col} depth={0.55} edge="#FFFFFF" opacity={0.92} />
      <path d={`M0,-6 Q${cx},${cy} ${tipX},${tipY}`} stroke="#FFFFFF" strokeWidth={w * 0.12} fill="none" opacity={0.7} strokeLinecap="round" />
      <path d={circle(tipX, tipY, w * 0.42)} fill="#FFFBEF" opacity={0.85 * glow} filter="url(#pcontact)" />
    </g>
  );
};

// ── Adam: clay mound (topographic kraft layers), no figure, no face ───────────────────
export const ClayMound: React.FC<{ s?: number; glow?: number; t?: number; seed?: number }> = ({ s = 1, glow = 1, t = 0, seed = 11 }) => (
  <g transform={`scale(${s})`}>
    <path d={ellipse(0, -120, 380, 260)} fill={C.gold} opacity={0.5 * glow} filter="url(#psoft)" style={{ mixBlendMode: "screen" }} />
    {Array.from({ length: 6 }, (_, j) => {
      const r = 270 * (1 - j * 0.14);
      return (
        <g key={j} transform={`translate(${Math.sin(seed + j) * 10},${-j * 44})`}>
          <P d={blob(r, seed + j * 5, 16, 0.07, 1, 0.4)} fill={mix(C.clayDk, C.clayLt, j / 5)} depth={j === 0 ? 1 : 0.35} noShadow={j > 0} />
          <path d={`M${-r * 0.6},${r * 0.05} Q0,${r * 0.16} ${r * 0.55},${r * 0.04}`} stroke={mix(C.clayDk, "#000000", 0.15)} strokeWidth={2.4} fill="none" opacity={0.45} />
        </g>
      );
    })}
    <path d={ellipse(-30, -250, 120, 40)} fill="#FFE7B0" opacity={0.55 * glow * (0.85 + 0.15 * Math.sin(t * 2))} filter="url(#pglow)" style={{ mixBlendMode: "screen" }} />
  </g>
);

// ── Names: ivory cards with path icons (no invented script) ───────────────────────────
export type IconKind = "tree" | "star" | "river" | "bird" | "mountain";
export const IconCard: React.FC<{ kind: IconKind }> = ({ kind }) => (
  <g>
    <P d={rect(-80, -100, 160, 200)} fill={C.paper} depth={0.6} edge="#E6D6BC" />
    <path d={rect(-80, -100, 160, 14)} fill={C.gold} />
    {kind === "tree" ? (
      <g>
        <path d={rect(-9, 0, 18, 60)} fill={C.wood} />
        <P d={circle(0, -16, 46)} fill={C.leaf} depth={0.2} noShadow />
      </g>
    ) : null}
    {kind === "star" ? <P d="M0,-58 L16,-16 L60,-14 L26,12 L38,56 L0,30 L-38,56 L-26,12 L-60,-14 L-16,-16Z" fill={C.gold} depth={0.2} noShadow /> : null}
    {kind === "river" ? (
      <g fill="none" stroke={C.river} strokeWidth={12} strokeLinecap="round">
        <path d="M-56,-30 Q-28,-50 0,-30 T56,-30" />
        <path d="M-56,4 Q-28,-16 0,4 T56,4" />
        <path d="M-56,38 Q-28,18 0,38 T56,38" />
      </g>
    ) : null}
    {kind === "bird" ? <path d="M-60,10 Q-30,-40 0,4 Q30,-40 60,10" stroke={C.ink} strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
    {kind === "mountain" ? (
      <g>
        <P d="M-66,56 L-10,-50 L20,4 L36,-20 L70,56Z" fill={C.teal} depth={0.2} noShadow />
        <path d="M-10,-50 L-28,-16 L-14,-22 L-4,-12 L6,-30Z" fill="#FFFFFF" />
      </g>
    ) : null}
  </g>
);

// ── Balance: fire pan vs clay pan ─────────────────────────────────────────────────────
/** Paper balance, base at 0,0. tilt degrees (+ = left pan down). */
export const Balance: React.FC<{ t: number; tilt: number }> = ({ t, tilt }) => {
  const py = -600, arm = 330;
  const a = (tilt * Math.PI) / 180;
  const ends = [-1, 1].map((sd) => [sd * arm * Math.cos(a), py - sd * arm * Math.sin(a)] as [number, number]);
  const pan = (x: number, y: number, sd: number) => {
    const hang = 250;
    return (
      <g key={sd}>
        <path d={`M${x},${y} L${x - 120},${y + hang} M${x},${y} L${x + 120},${y + hang}`} stroke="#5A4636" strokeWidth={4} />
        <g transform={`translate(${x},${y + hang})`}>
          {sd < 0 ? <g transform="translate(0,-4)"><Flame t={t} s={0.42} /></g> : <g transform="translate(0,4)"><ClayMound s={0.38} t={t} /></g>}
          <P d={`M-150,0 L150,0 Q130,70 0,76 Q-130,70 -150,0Z`} fill={sd < 0 ? "#C98A4B" : "#C98A4B"} depth={0.7} />
          <path d={rect(-150, -6, 300, 12)} fill="#E7B877" />
          <g transform="translate(0,130)">
            <P d={rect(-92, -38, 184, 72)} fill={C.paper} depth={0.4} edge="#E6D6BC" />
            <text x={0} y={22} textAnchor="middle" fontFamily="Anton" fontSize={54} fill={sd < 0 ? C.flame : C.clayDk} letterSpacing={3}>{sd < 0 ? "API" : "TANAH"}</text>
          </g>
        </g>
      </g>
    );
  };
  return (
    <g>
      <Layered depth={1.1} draw={(o) => (
        <g>
          <path d="M-160,0 L160,0 L110,-60 L-110,-60Z" fill={o ?? "#8A6448"} />
          <path d={rect(-20, py, 40, -py - 60)} fill={o ?? C.wood} />
          <path d={circle(0, py, 34)} fill={o ?? "#C99A54"} />
        </g>
      )} />
      <g transform={`rotate(${-tilt},0,${py})`}>
        <P d={rect(-arm - 20, py - 16, 2 * arm + 40, 32)} fill="#B98458" depth={0.8} />
        <path d={`M${-arm - 20},${py - 4} L${arm + 20},${py - 4}`} stroke="#E7B877" strokeWidth={4} />
      </g>
      <path d={circle(0, py, 14)} fill="#FFE7A8" />
      {ends.map(([x, y], i) => pan(x, y, i === 0 ? -1 : 1))}
    </g>
  );
};

// ── Hourglass (respite until the Day of Resurrection) ─────────────────────────────────
export const Hourglass: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const top = -700, neck = -370, bot = -40;
  const bulb = (y0: number, y1: number) => `M-150,${y0} C-150,${(y0 + y1) / 2} -16,${y1 - (y1 - y0) * 0.1} -14,${y1} L14,${y1} C16,${y1 - (y1 - y0) * 0.1} 150,${(y0 + y1) / 2} 150,${y0}Z`;
  const yTop = lerp(-600, -420, k);
  const wTop = lerp(128, 40, k);
  return (
    <g>
      <path d={ellipse(0, -370, 300, 420)} fill={C.gold} opacity={0.35} filter="url(#psoft)" style={{ mixBlendMode: "screen" }} />
      <path d={bulb(top + 40, neck)} fill="#DCEFF5" opacity={0.42} />
      <path d={bulb(bot, neck)} fill="#DCEFF5" opacity={0.42} />
      <path d={`M${-wTop},${yTop} L${wTop},${yTop} L14,${neck} L-14,${neck}Z`} fill={C.gold} />
      <path d={rect(-3.5, neck, 7, bot - neck)} fill="#F7D47E" opacity={0.95} />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={circle(Math.sin(i * 2.1 + t * 3) * 5, neck + ((t * 260 + i * 53) % (bot - neck)), 4)} fill="#FFE9A8" />)}
      <P d={`M-150,${bot - 2} Q0,${bot - 30 - 230 * k} 150,${bot - 2}Z`} fill={C.gold} depth={0.15} noShadow />
      <path d={bulb(top + 40, neck)} fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={0.8} />
      <path d={bulb(bot, neck)} fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={0.8} />
      <path d="M-110,-560 Q-120,-470 -60,-420" stroke="#FFFFFF" strokeWidth={10} fill="none" opacity={0.6} strokeLinecap="round" />
      <Layered depth={1} draw={(o) => (
        <g>
          <path d={rect(-200, top - 10, 400, 54)} fill={o ?? "#8A5A3A"} />
          <path d={rect(-200, bot, 400, 60)} fill={o ?? "#8A5A3A"} />
          <path d={rect(-182, top + 40, 22, bot - top - 40)} fill={o ?? "#6B4A33"} />
          <path d={rect(160, top + 40, 22, bot - top - 40)} fill={o ?? "#6B4A33"} />
        </g>
      )} />
      <path d={rect(-200, top - 10, 400, 10)} fill="#C08A5C" />
      <text x={0} y={bot + 44} textAnchor="middle" fontFamily="Anton" fontSize={40} fill="#FFE7B0" letterSpacing={8}>AUDIRA</text>
    </g>
  );
};

/** Faceless paper person (generic human, never a prophet), 100 units tall, feet at 0,0. Folded creases, cut edges. */
export const Person: React.FC<{ color?: string; step?: number; lift?: number }> = ({ color = "#3F4A78", step = 0, lift = 0 }) => (
  <Layered depth={0.5} draw={(o) => {
    const body = o ?? color;
    const crease = o ?? mix(color, "#ffffff", 0.32);
    return (
      <g>
        <path d={circle(0, -90, 10)} fill={body} />
        <path d="M-12,-80 L12,-80 L16,-40 L-16,-40Z" fill={body} />
        <path d={`M-13,-42 L13,-42 L11,-22 L${8 - 2 * step},0 L${2 - 2 * step},0 L1,-22 L-1,-22 L${-2 + 2 * step},0 L${-8 + 2 * step},0 L-11,-22Z`} fill={o ?? mix(color, "#000000", 0.22)} />
        <path d="M0,-78 L1,-42 M-6,-60 L-14,-44" stroke={crease} strokeWidth={1.8} fill="none" opacity={o ? 0 : 0.8} />
        <path d={`M-12,-76 L${-18 - lift * 6},${-54 - lift * 30} L${-16 - lift * 4},${-44 - lift * 40} M12,-76 L${18 + lift * 6},${-54 - lift * 30} L${16 + lift * 4},${-44 - lift * 40}`} stroke={body} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    );
  }} />
);

/** Creeping shadow tongue: base at 0,0, tip pointing along -y; rotate it toward the target. */
export const CreepShadow: React.FC<{ len: number; t: number; seed: number }> = ({ len, t, seed }) => (
  <g>
    <path d={tongue(70, len, Math.sin(t * 2 + seed) * 22)} fill={C.ash} opacity={0.72} filter="url(#pcontact)" />
    <path d={tongue(70, len, Math.sin(t * 2 + seed) * 22)} fill="none" stroke={C.flame} strokeWidth={4} opacity={0.75} />
    <path d={tongue(30, len * 0.7, Math.sin(t * 2.6 + seed) * 14)} fill="#5A2A3A" opacity={0.6} />
  </g>
);

/** Ribbon of light descending from (x0,y0) to (x1,y1), drawn up to progress k. */
export const LightRibbon: React.FC<{ x0: number; y0: number; x1: number; y1: number; k: number; t: number; seed: number; w?: number }> = ({ x0, y0, x1, y1, k, t, seed, w = 26 }) => {
  if (k <= 0) return null;
  const N = 24;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N * k; i++) {
    const u = i / N;
    pts.push([lerp(x0, x1, u) + Math.sin(u * 7 + t * 1.6 + seed) * 46 * (1 - u), lerp(y0, y1, u)]);
  }
  if (pts.length < 2) return null;
  const line = "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" L");
  const tip = pts[pts.length - 1];
  return (
    <g>
      <path d={line} stroke={C.gold} strokeWidth={w * 2.4} fill="none" opacity={0.4} filter="url(#pglow)" strokeLinecap="round" style={{ mixBlendMode: "screen" }} />
      <path d={line} stroke="#FFF1C8" strokeWidth={w} fill="none" strokeLinecap="round" opacity={0.95} />
      <path d={line} stroke="#FFFFFF" strokeWidth={w * 0.25} fill="none" strokeLinecap="round" opacity={0.8} />
      {pts.filter((_, i) => i % 5 === 3).map((p, i) => <path key={i} d={rect(p[0] - 12, p[1] - 8, 24, 16)} fill={C.paper} transform={`rotate(${hash(seed + i) * 40 - 20},${p[0]},${p[1]})`} />)}
      <path d={circle(tip[0], tip[1], w * 0.9)} fill="#FFFBEF" filter="url(#pcontact)" />
    </g>
  );
};

/** Paper heart lantern, hanging, centre ~ (0,-130). */
export const HeartLantern: React.FC<{ t: number; glow?: number; s?: number }> = ({ t, glow = 1, s = 1 }) => {
  const heart = "M0,70 C-190,-40 -130,-230 0,-130 C130,-230 190,-40 0,70Z";
  return (
    <g transform={`scale(${s}) rotate(${Math.sin(t * 0.9) * 2.5})`}>
      <path d="M0,-180 L0,-900" stroke="#5A4636" strokeWidth={4} />
      <path d={ellipse(0, -60, 320, 300)} fill={C.ember} opacity={0.45 * glow} filter="url(#psoft)" style={{ mixBlendMode: "screen" }} />
      <P d={heart} fill="#F4B46A" depth={1} edge="#FFE1B0" />
      <path d={heart} fill="#FFE7A8" opacity={0.45 * glow * (0.85 + 0.15 * Math.sin(t * 3))} />
      {[-70, -35, 0, 35, 70].map((x, i) => <path key={i} d={`M${x * 0.3},-140 Q${x},-40 ${x * 0.1},60`} stroke="#C9783A" strokeWidth={2.6} fill="none" opacity={0.55} />)}
      <path d={rect(-36, -196, 72, 30)} fill={C.wood} />
      <path d={rect(-26, 62, 52, 22)} fill={C.wood} />
      <g transform="translate(0,-10)"><Flame t={t} s={0.12 * glow} glow={0.4} /></g>
    </g>
  );
};

/** Folded paper banner with text, centred 0,0. */
export const Banner: React.FC<{ text: string; w?: number; col?: string; size?: number }> = ({ text, w = 520, col = C.coral, size = 46 }) => (
  <g>
    <Layered depth={0.6} draw={(o) => (
      <g>
        <path d={`M${-w / 2 - 70},-20 L${-w / 2 + 6},-20 L${-w / 2 + 6},44 L${-w / 2 - 70},44 L${-w / 2 - 44},12Z`} fill={o ?? mix(col, "#000000", 0.25)} />
        <path d={`M${w / 2 + 70},-20 L${w / 2 - 6},-20 L${w / 2 - 6},44 L${w / 2 + 70},44 L${w / 2 + 44},12Z`} fill={o ?? mix(col, "#000000", 0.25)} />
        <path d={rect(-w / 2, -38, w, 70)} fill={o ?? col} />
      </g>
    )} />
    <path d={rect(-w / 2, -38, w, 8)} fill="#FFFFFF" opacity={0.3} />
    <text x={0} y={size * 0.36} textAnchor="middle" fontFamily="Anton" fontSize={size} fill={C.paper} letterSpacing={5}>{text}</text>
  </g>
);

/** Small cut-paper tree, feet at 0,0. */
export const Tree: React.FC<{ s?: number; col?: string }> = ({ s = 1, col = C.leaf }) => (
  <g transform={`scale(${s})`}>
    <Layered depth={0.5} draw={(o) => (
      <g>
        <path d={rect(-8, -60, 16, 60)} fill={o ?? C.wood} />
        <path d="M-60,-50 L0,-170 L60,-50Z" fill={o ?? col} />
        <path d="M-46,-110 L0,-200 L46,-110Z" fill={o ?? mix(col, "#ffffff", 0.15)} />
      </g>
    )} />
  </g>
);
