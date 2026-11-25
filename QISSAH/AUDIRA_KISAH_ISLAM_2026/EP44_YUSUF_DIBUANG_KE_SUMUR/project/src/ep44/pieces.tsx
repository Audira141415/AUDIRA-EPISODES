// PAPERWORLD paper pieces (pure SVG, 1080 × 1920 design space). Base pieces from gold EP18; EP44 Yusuf pieces at the end.
// Lighting rule (jury lessons EP04/EP08): one key light from upper-left. Every card throws a LONG directional
// cast shadow (down-right) onto the layer behind it + a tight contact shadow, has a pale cut edge, a face
// gradient (lit side → shade side) and a cream rim on the lit edge. No Math.random: seeded hash only.
import React from "react";

export const C = {
  ivory: "#F6EFE4", snow: "#FBF7F0", snowSh: "#D9DCEB", skyIce: "#BFD9EA", lav: "#9C9BD0", lavDk: "#6F6CA8",
  night: "#4E4A86", aurora: "#8FE0C4", auroraPk: "#F2A7C3", coral: "#E2574C", red: "#E2574C", mustard: "#E8A93A",
  gold: "#F2B75B", peach: "#F4C9A8", earth: "#8A6448", earthDk: "#6B4A33", perma: "#7E9DB4", permaDk: "#5F7F98",
  ice: "#CFE8F2", teal: "#3FA7A0", turq: "#4FD1C5", wood: "#7A5236", iron: "#6E6A66", ink: "#2A2233",
  rock: "#8E8A9E", rockDk: "#6E6A82", house: ["#E2574C", "#E8A93A", "#3FA7A0", "#B5523B", "#4F7FC0", "#8FC28A", "#D9799A"],
  coat: "#33406B",
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
    {noShadow ? null : <path d={d} fill={SHADOW} transform={`translate(${30 * depth},${40 * depth})`} filter="url(#pshadow)" />}
    {noShadow ? null : <path d={d} fill={CONTACT} transform={`translate(${6 * depth},${8 * depth})`} filter="url(#pcontact)" />}
    <path d={d} fill={edge ?? mix(fill, "#ffffff", 0.5)} transform={`translate(${3 * depth},${4 * depth})`} />
    <path d={d} fill={fill} />
    {light ? <path d={d} fill="url(#plight)" /> : null}
    {light ? <path d={d} fill="none" stroke="#FFF6E2" strokeOpacity={0.75} strokeWidth={2.6} transform="translate(-1.4,-1.8)" /> : null}
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

/** Rolling snow drift band (top edge y), cut-paper. */
export const Drift: React.FC<{ y: number; seed: number; col?: string; amp?: number; depth?: number }> = ({ y, seed, col = C.snow, amp = 40, depth = 1 }) => {
  let d = `M-200,2200 L-200,${y}`;
  for (let x = -200; x <= 1300; x += 30) {
    const v = Math.sin(x / 210 + seed) * amp + Math.sin(x / 83 + seed * 2.3) * amp * 0.3;
    d += ` L${x},${(y + v).toFixed(1)}`;
  }
  d += " L1300,2200Z";
  return <P d={d} fill={col} depth={depth} edge="#FFFFFF" />;
};

/** Jagged mountain, base at y=0, centred on x=0. Snow cap from the top down to `cap` of the height. */
export const Mountain: React.FC<{ w: number; h: number; seed: number; col?: string; cap?: number; depth?: number }> = ({ w, h, seed, col = C.rock, cap = 0.45, depth = 1 }) => {
  const n = 9;
  const pts: [number, number][] = [[-w / 2, 0]];
  for (let i = 1; i < n; i++) {
    const x = -w / 2 + (w * i) / n;
    const k = 1 - Math.abs(x) / (w / 2);
    pts.push([x + (hash(seed + i) - 0.5) * 30, -h * Math.pow(k, 0.85) * (0.78 + 0.22 * hash(seed + i * 3.1))]);
  }
  pts.push([w / 2, 0]);
  const d = "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" L") + "Z";
  const capY = (y: number) => y < -h * (1 - cap);
  const capPts = pts.filter((p) => capY(p[1]));
  let capD = "";
  if (capPts.length >= 2) {
    const first = capPts[0], last = capPts[capPts.length - 1];
    const zig = Array.from({ length: 7 }, (_, i) => {
      const x = lerp(last[0] + 20, first[0] - 20, i / 6);
      return `${x.toFixed(1)},${(-h * (1 - cap) + (i % 2 ? 22 : -10)).toFixed(1)}`;
    });
    capD = "M" + capPts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" L") + " L" + zig.join(" L") + "Z";
  }
  return (
    <g>
      <P d={d} fill={col} depth={depth} />
      <path d={`M${pts[4][0]},${pts[4][1]} L${pts[4][0] + 60},0`} stroke={mix(col, "#000000", 0.18)} strokeWidth={3} opacity={0.5} />
      {capD ? <P d={capD} fill={C.snow} depth={0.35 * depth} edge="#FFFFFF" /> : null}
    </g>
  );
};

/** Jagged snow line across the lower roof band (right → left). */
const jag2 = (w: number, h: number, roofH: number) => {
  const xr = (w / 2 + 14) * 0.62, y = -h - roofH * 0.38;
  return Array.from({ length: 9 }, (_, i) => `${(xr - (2 * xr * i) / 8).toFixed(1)},${(y + (i % 2 ? 12 : 0)).toFixed(1)}`).join(" L");
};

/** Colourful Longyearbyen house, feet at 0,0. Snow on the roof, lit windows. */
export const House: React.FC<{ w?: number; h?: number; col: string; seed?: number; lit?: number; sign?: string }> = ({ w = 150, h = 130, col, seed = 1, lit = 1, sign }) => {
  const roofH = h * 0.55;
  const winCols = w > 160 ? 3 : 2;
  const wins = Array.from({ length: winCols * 2 }, (_, i) => {
    const cx = -w / 2 + (w / (winCols + 1)) * ((i % winCols) + 1);
    const cy = -h + 28 + Math.floor(i / winCols) * (h * 0.42);
    return { cx, cy, on: hash(seed * 13 + i) > 0.25 };
  });
  return (
    <g>
      <Layered depth={0.9} draw={(o) => (
        <g>
          <path d={rect(-w / 2, -h, w, h)} fill={o ?? col} />
          <path d={`M${-w / 2 - 14},${-h} L0,${-h - roofH} L${w / 2 + 14},${-h}Z`} fill={o ?? mix(col, "#2A1A30", 0.35)} />
        </g>
      )} />
      <path d={rect(-w / 2, -h, w, h)} fill="url(#plight)" />
      <path d={`M${w * 0.12},${-h} L${w * 0.12},0`} stroke={mix(col, "#ffffff", 0.28)} strokeWidth={2} opacity={0.7} />
      <path d={`M${-w / 2},${-h} L${-w / 2},0`} stroke="#FFF6E2" strokeWidth={3} opacity={0.6} />
      <P d={`M${-w / 2 - 18},${-h + 2} L0,${-h - roofH - 6} L${w / 2 + 18},${-h + 2}Z`} fill={C.snow} depth={0.25} edge="#FFFFFF" />
      <path d={`M${-w / 2 - 14},${-h} L${w / 2 + 14},${-h} L${(w / 2 + 14) * 0.62},${-h - roofH * 0.38} L${jag2(w, h, roofH)} Z`} fill={mix(col, "#2A1A30", 0.35)} />
      <path d={`M${-w / 2 - 18},${-h + 4} L${w / 2 + 18},${-h + 4}`} stroke={C.snow} strokeWidth={9} strokeLinecap="round" />
      {wins.map((wn, i) => (
        <g key={i}>
          {wn.on && lit > 0 ? <path d={circle(wn.cx, wn.cy + 14, 30)} fill={C.gold} opacity={0.42 * lit} filter="url(#pglow)" /> : null}
          <path d={rect(wn.cx - 13, wn.cy, 26, 30)} fill={wn.on ? mix("#7A6A8E", "#FFD978", lit) : "#5A5478"} stroke={mix(col, "#ffffff", 0.6)} strokeWidth={3} />
          <path d={`M${wn.cx},${wn.cy} L${wn.cx},${wn.cy + 30}`} stroke={mix(col, "#ffffff", 0.6)} strokeWidth={2} />
        </g>
      ))}
      {sign ? (
        <g transform={`translate(0,${-h - roofH * 0.05})`}>
          <Layered depth={0.4} draw={(o) => <path d={rect(-w * 0.62, -64, w * 1.24, 56)} fill={o ?? C.ivory} />} />
          <path d={rect(-w * 0.62, -64, w * 1.24, 8)} fill={C.coral} />
          <text x={0} y={-20} textAnchor="middle" fontFamily="Anton" fontSize={36} fill={C.ink} letterSpacing={2}>{sign}</text>
        </g>
      ) : null}
    </g>
  );
};

/** Aurora curtains: soft gradient ribbons that sway with t. */
export const Aurora: React.FC<{ t: number; y?: number; op?: number; pink?: boolean }> = ({ t, y = 520, op = 1, pink }) => (
  <g opacity={op} style={{ mixBlendMode: "screen" }}>
    <defs>
      <linearGradient id={`aur${pink ? "p" : "g"}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={pink ? C.auroraPk : C.aurora} stopOpacity="0" />
        <stop offset="0.55" stopColor={pink ? C.auroraPk : C.aurora} stopOpacity="0.75" />
        <stop offset="1" stopColor={C.aurora} stopOpacity="0" />
      </linearGradient>
    </defs>
    {[0, 1, 2].map((i) => {
      let top = `M-100,${y + i * 70}`;
      for (let x = -100; x <= 1200; x += 40) top += ` L${x},${(y + i * 70 + Math.sin(x / 190 + t * 0.6 + i * 1.7) * 60 - 120 * Math.sin((x + i * 300) / 700)).toFixed(1)}`;
      return <path key={i} d={`${top} L1200,${y + 380 + i * 60} L-100,${y + 380 + i * 60}Z`} fill={`url(#aur${pink ? "p" : "g"})`} opacity={0.55 - i * 0.12} />;
    })}
  </g>
);

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

/** Faceless paper figure in a parka, 100 units tall, feet at 0,0. */
export type Pose = "stand" | "walk" | "carry" | "raise" | "dig";
export const Figure: React.FC<{ pose?: Pose; color?: string; step?: number; armRot?: number; tool?: boolean }> = ({ pose = "stand", color = C.coat, step = 0, armRot = 0, tool }) => {
  const draw = (o: string | null) => {
    const body = o ?? color;
    const crease = o ?? mix(color, "#ffffff", 0.3);
    const trim = o ?? "#F1E6D2";
    const sw = 7;
    const legL = 2 * step, legR = -2 * step;
    return (
      <g>
        <path d={circle(0, -90, 10)} fill={body} />
        <path d="M-10,-94 Q0,-104 10,-94 L9,-88 Q0,-95 -9,-88Z" fill={trim} />
        <path d="M-12,-80 L12,-80 L15,-42 L-15,-42 Z" fill={body} />
        <path d={`M-12,-44 L12,-44 L11,-24 L${8 + legR},0 L${2 + legR},0 L1,-24 L-1,-24 L${-2 + legL},0 L${-8 + legL},0 L-11,-24 Z`} fill={o ?? mix(color, "#000000", 0.2)} />
        <path d="M0,-78 L1,-44" stroke={crease} strokeWidth={1.8} fill="none" opacity={o ? 0 : 0.8} />
        <path d="M-15,-43 L15,-43" stroke={trim} strokeWidth={3} />
        {pose === "stand" || pose === "walk" ? (
          <path d={`M-12,-76 L${-17 - step * 3},-54 L${-16 - step * 3},-44 M12,-76 L${17 + step * 3},-54 L${16 + step * 3},-44`} stroke={body} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ) : null}
        {pose === "carry" ? (
          <path d="M-12,-76 L-24,-64 L-34,-62 M12,-76 L24,-64 L34,-62" stroke={body} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ) : null}
        {pose === "raise" ? (
          <g>
            <path d="M-12,-76 L-17,-54 L-16,-44" stroke={body} strokeWidth={sw} strokeLinecap="round" fill="none" />
            <g transform={`rotate(${armRot},12,-76)`}>
              <path d="M12,-76 L24,-96 L28,-112" stroke={body} strokeWidth={sw} strokeLinecap="round" fill="none" />
              {tool ? <path d="M28,-112 L32,-132" stroke={o ?? C.red} strokeWidth={6} strokeLinecap="round" /> : null}
            </g>
          </g>
        ) : null}
        {pose === "dig" ? (
          <g transform={`rotate(${armRot},0,-70)`}>
            <path d="M-12,-76 L4,-58 L18,-52 M12,-76 L20,-60 L24,-50" stroke={body} strokeWidth={sw} strokeLinecap="round" fill="none" />
            <path d="M-6,-92 L40,-10" stroke={o ?? C.wood} strokeWidth={4} />
            <path d="M34,-20 L52,-6 L42,8 L28,-2Z" fill={o ?? C.iron} />
          </g>
        ) : null}
      </g>
    );
  };
  return <Layered draw={draw} depth={0.5} />;
};

export const Cross: React.FC<{ h?: number; col?: string }> = ({ h = 120, col = C.wood }) => (
  <Layered depth={0.5} draw={(o) => (
    <g>
      <path d={rect(-7, -h, 14, h)} fill={o ?? col} />
      <path d={rect(-30, -h * 0.78, 60, 13)} fill={o ?? mix(col, "#ffffff", 0.08)} />
      <path d={rect(-9, -h - 6, 18, 8)} fill={o ?? C.snow} />
    </g>
  )} />
);

/** Closed coffin, lying, centred 0,0, ~200 wide. */
export const Coffin: React.FC<{ frost?: number }> = ({ frost = 0 }) => (
  <g>
    <Layered depth={0.5} draw={(o) => (
      <g>
        <path d="M-100,-22 L-70,-36 L95,-36 L110,-22 L110,22 L95,36 L-70,36 L-100,22Z" fill={o ?? "#9A6B47"} />
        <path d="M-90,-14 L-66,-25 L90,-25 L100,-14 L100,-4 L-90,-4Z" fill={o ?? "#B98458"} />
        <path d="M-10,-30 L-10,30 M-40,0 L20,0" stroke={o ?? "#6E4A2F"} strokeWidth={6} />
      </g>
    )} />
    {frost > 0 ? (
      <g opacity={frost}>
        <path d="M-100,-22 L-70,-36 L95,-36 L110,-22 L110,22 L95,36 L-70,36 L-100,22Z" fill={C.ice} opacity={0.55} />
        {Array.from({ length: 8 }, (_, i) => {
          const x = -90 + i * 26, y = (i % 2 ? -30 : 30);
          return <path key={i} d={`M${x},${y} l8,${y > 0 ? 14 : -14} l8,${y > 0 ? -14 : 14}`} stroke="#FFFFFF" strokeWidth={3} fill="none" />;
        })}
      </g>
    ) : null}
  </g>
);

/** Ice crystal (six-arm), size r. */
export const Crystal: React.FC<{ r: number; op?: number }> = ({ r, op = 1 }) => (
  <g opacity={op} stroke="#FFFFFF" strokeWidth={Math.max(2, r * 0.12)} strokeLinecap="round">
    {[0, 60, 120].map((a) => <path key={a} d={`M${-r},0 L${r},0 M${-r * 0.55},${-r * 0.25} L${-r * 0.75},0 L${-r * 0.55},${r * 0.25} M${r * 0.55},${-r * 0.25} L${r * 0.75},0 L${r * 0.55},${r * 0.25}`} transform={`rotate(${a})`} />)}
  </g>
);

export const Tent: React.FC<{ glow?: number }> = ({ glow = 1 }) => (
  <g>
    <path d={ellipse(0, -60, 220, 120)} fill={C.gold} opacity={0.45 * glow} filter="url(#psoft)" />
    <Layered depth={0.9} draw={(o) => (
      <g>
        <path d="M-180,0 L-20,-210 L170,0Z" fill={o ?? "#E8A93A"} />
        <path d="M-20,-210 L-20,0 L60,0Z" fill={o ?? "#C9852A"} />
        <path d="M-40,0 L-20,-90 L0,0Z" fill={o ?? "#FFE7A8"} />
      </g>
    )} />
    <path d="M-20,-210 L-20,-240" stroke={C.wood} strokeWidth={6} />
  </g>
);

export const Magnifier: React.FC<{ r?: number }> = ({ r = 90 }) => (
  <Layered depth={0.6} draw={(o) => (
    <g>
      <path d={`M${r * 0.7},${r * 0.7} L${r * 1.8},${r * 1.8}`} stroke={o ?? C.wood} strokeWidth={r * 0.28} strokeLinecap="round" />
      <path d={circle(0, 0, r)} fill={o ?? "#DDF1F7"} />
      <path d={circle(0, 0, r)} fill="none" stroke={o ?? C.iron} strokeWidth={r * 0.16} />
      <path d={`M${-r * 0.5},${-r * 0.35} Q${-r * 0.3},${-r * 0.65} ${r * 0.05},${-r * 0.6}`} stroke={o ?? "#FFFFFF"} strokeWidth={r * 0.1} fill="none" strokeLinecap="round" />
    </g>
  )} />
);

/** Paper virus icon (generic spiky ball), r. */
export const VirusIcon: React.FC<{ r?: number; col?: string }> = ({ r = 40, col = "#9C9BD0" }) => (
  <Layered depth={0.35} draw={(o) => (
    <g>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <path key={i} d={circle(Math.cos(a) * r * 1.25, Math.sin(a) * r * 1.25, r * 0.18)} fill={o ?? mix(col, "#000000", 0.15)} />;
      })}
      <path d={circle(0, 0, r)} fill={o ?? col} />
    </g>
  )} />
);

export const Plane: React.FC = () => (
  <Layered depth={0.7} draw={(o) => (
    <g>
      <path d="M-170,-6 C-120,-34 120,-34 170,-10 C190,-2 190,14 170,16 L-150,18 C-176,16 -186,4 -170,-6Z" fill={o ?? "#F4F1EA"} />
      <path d="M-150,-8 L-196,-74 L-168,-74 L-110,-12Z" fill={o ?? C.red} />
      <path d="M-30,6 L40,6 L-10,70 L-50,70Z" fill={o ?? "#D9D4CB"} />
      <path d="M-120,0 L150,0" stroke={o ?? C.red} strokeWidth={8} />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={circle(-60 + i * 36, -12, 7)} fill={o ?? "#5E7FA8"} />)}
      <path d="M176,-30 L184,30" stroke={o ?? C.iron} strokeWidth={6} strokeLinecap="round" />
    </g>
  )} />
);

export const Urn: React.FC = () => (
  <Layered depth={0.8} draw={(o) => (
    <g>
      <path d="M-70,0 L70,0 L60,-20 C110,-90 100,-170 50,-200 L50,-220 L-50,-220 L-50,-200 C-100,-170 -110,-90 -60,-20Z" fill={o ?? "#5E7FC0"} />
      <path d="M-60,-232 L60,-232 L54,-216 L-54,-216Z" fill={o ?? "#3F5E9A"} />
      <path d="M-20,-250 C-20,-270 20,-270 20,-250Z" fill={o ?? "#3F5E9A"} />
      <path d="M-84,-110 C-40,-96 40,-96 84,-110" stroke={o ?? C.gold} strokeWidth={10} fill="none" />
    </g>
  )} />
);

/** Polar bear walking right, ~400 wide, feet at y=0. */
export const Bear: React.FC<{ t: number }> = ({ t }) => {
  const sw = Math.sin(t * 4);
  return (
    <Layered depth={0.9} draw={(o) => {
      const body = o ?? "#F3ECDD";
      const shade = o ?? "#DCD2C0";
      const leg = (x: number, ph: number, c: string) => (
        <g transform={`rotate(${ph * 12},${x},-90)`}><path d={`M${x - 24},-100 L${x + 24},-100 L${x + 22},-6 L${x + 32},0 L${x - 24},0Z`} fill={c} /></g>
      );
      return (
        <g>
          {leg(-120, -sw, shade)}
          {leg(90, sw, shade)}
          <path d="M-190,-120 C-200,-200 -100,-236 10,-226 C90,-220 150,-196 175,-150 C185,-130 180,-110 160,-96 L-170,-80 C-190,-90 -192,-104 -190,-120Z" fill={body} />
          <path d="M150,-170 C190,-190 240,-178 262,-150 C272,-136 266,-124 250,-122 L180,-118Z" fill={body} />
          <path d={circle(176, -182, 14)} fill={body} />
          <path d={circle(266, -144, 7)} fill={o ?? C.ink} />
          <path d="M-60,-220 C-20,-200 40,-200 90,-212" stroke={o ?? "#FFFFFF"} strokeWidth={6} fill="none" opacity={0.8} />
          {leg(-80, sw, body)}
          {leg(130, -sw, body)}
          <path d="M-40,-200 L-30,-110" stroke={o ?? "#E3D9C6"} strokeWidth={3} />
        </g>
      );
    }} />
  );
};

/** Triangular warning sign with a bear silhouette. Post foot at 0,0. */
export const BearSign: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <Layered depth={0.8} draw={(o) => (
      <g>
        <path d={rect(-8, -260, 16, 260)} fill={o ?? C.iron} />
        <path d="M0,-470 L130,-250 L-130,-250Z" fill={o ?? C.red} />
        <path d="M0,-440 L105,-266 L-105,-266Z" fill={o ?? "#FFF6E2"} />
        <path d="M-70,-290 C-72,-320 -40,-336 0,-334 C30,-333 52,-322 60,-306 L80,-302 C86,-298 84,-292 78,-292 L56,-292 L52,-284 L40,-284 L40,-294 L-36,-294 L-38,-284 L-54,-284 L-56,-292Z" fill={o ?? C.ink} />
      </g>
    )} />
  </g>
);

/** Hand flare glow (red), centred 0,0. */
export const FlareGlow: React.FC<{ t: number; s?: number }> = ({ t, s = 1 }) => (
  <g transform={`scale(${s})`} style={{ mixBlendMode: "screen" }}>
    <path d={circle(0, 0, 90 + Math.sin(t * 17) * 8)} fill="#FF6A4A" opacity={0.45} filter="url(#psoft)" />
    <path d={circle(0, 0, 26 + Math.sin(t * 23) * 4)} fill="#FFD7A8" opacity={0.95} filter="url(#pcontact)" />
  </g>
);

/** Seed Vault portal: concrete wedge sticking out of the slope, glowing panel. Base centre at 0,0. */
export const VaultDoor: React.FC<{ glow: number; t: number; open?: number }> = ({ glow, t, open = 0 }) => (
  <g>
    <path d={ellipse(0, -260, 360 + glow * 80, 300 + glow * 60)} fill={C.turq} opacity={0.35 * glow} filter="url(#psoft)" style={{ mixBlendMode: "screen" }} />
    <Layered depth={1.2} draw={(o) => (
      <g>
        <path d="M-150,0 L-150,-420 L-110,-470 L110,-470 L150,-420 L150,0Z" fill={o ?? "#A9A3A8"} />
        <path d="M-150,-420 L-110,-470 L110,-470 L150,-420Z" fill={o ?? "#C9C3C4"} />
        <path d={rect(-86, -400, 172, 230)} fill={o ?? mix("#3A6E80", C.turq, glow)} />
        <path d={rect(-56, -160, 112, 160)} fill={o ?? "#4A4652"} />
      </g>
    )} />
    {Array.from({ length: 6 }, (_, i) => (
      <path key={i} d={rect(-86 + (i % 3) * 58, -400 + Math.floor(i / 3) * 116, 56, 112)} fill="#E6FFFB" opacity={(0.25 + 0.55 * glow) * (0.6 + 0.4 * Math.sin(t * 2 + i * 1.3))} />
    ))}
    <path d={rect(-56 + open * 2, -160, 112 - open * 4, 160)} fill={C.turq} opacity={open * 0.9} />
  </g>
);

/** Seed box with label. */
export const SeedBox: React.FC<{ col: string; label?: string; w?: number }> = ({ col, label, w = 150 }) => (
  <g>
    <Layered depth={0.5} draw={(o) => (
      <g>
        <path d={rect(-w / 2, -100, w, 100)} fill={o ?? col} />
        <path d={rect(-w / 2, -100, w, 16)} fill={o ?? mix(col, "#000000", 0.18)} />
        <path d={rect(-w * 0.32, -70, w * 0.64, 40)} fill={o ?? "#FFF6E2"} />
      </g>
    )} />
    {label ? <text x={0} y={-39} textAnchor="middle" fontFamily="Anton" fontSize={28} fill={C.ink} letterSpacing={1}>{label}</text> : null}
  </g>
);

export const Thermometer: React.FC<{ level: number }> = ({ level }) => (
  <Layered depth={0.7} draw={(o) => (
    <g>
      <path d="M-34,-420 C-34,-460 34,-460 34,-420 L34,-60 C70,-36 64,30 0,34 C-64,30 -70,-36 -34,-60Z" fill={o ?? "#FFF6E2"} />
      <path d={`M-14,${-60 - 330 * level} L14,${-60 - 330 * level} L14,-40 L-14,-40Z`} fill={o ?? C.turq} />
      <path d={circle(0, -6, 32)} fill={o ?? C.turq} />
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M34,${-90 - i * 48} L58,${-90 - i * 48}`} stroke={o ?? C.ink} strokeWidth={4} />)}
    </g>
  )} />
);

// ── EP44 Yusuf (QS Yusuf 4–20) pieces ─────────────────────────────────────────────────
export const Y = {
  night: "#2E2A62", nightLt: "#4E4A86", lav: "#9C9BD0", sand: "#E9C99A", sandDk: "#C99A63", sandLt: "#F3DDB6",
  stone: "#A89A8A", stoneDk: "#7E7064", hole: "#120E24", gold: "#F2B75B", goldLt: "#FFE3A3", terra: "#C2643F",
  robeY: "#8FB8D8", robeA: "#E8DCC4", robeB: ["#8A6448", "#6E7A4A", "#7A5A6E", "#94704A", "#5E6E8A"], ink: "#2A2233",
};

/** Five-point star path centred on cx,cy. */
export const star5 = (cx: number, cy: number, R: number, r = R * 0.45) =>
  "M" + Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r : R;
    return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }).join(" L") + "Z";

/** Glowing paper star (5-point), centred 0,0. */
export const Star5: React.FC<{ R?: number; glow?: number; col?: string }> = ({ R = 34, glow = 1, col = Y.gold }) => (
  <g>
    <path d={circle(0, 0, R * 2.1)} fill={Y.goldLt} opacity={0.35 * glow} filter="url(#pglow)" style={{ mixBlendMode: "screen" }} />
    <P d={star5(0, 0, R)} fill={col} depth={0.35} />
    <path d={`M0,${-R * 0.95} L0,${R * 0.35}`} stroke="#FFF6E2" strokeWidth={2} opacity={0.6} />
  </g>
);

/** Crescent moon, bulging left, centred 0,0. */
export const Moon: React.FC<{ r?: number; glow?: number }> = ({ r = 70, glow = 1 }) => (
  <g>
    <path d={circle(0, 0, r * 1.8)} fill="#FFF1C9" opacity={0.3 * glow} filter="url(#psoft)" style={{ mixBlendMode: "screen" }} />
    <P d={`M0,${-r} A${r},${r} 0 1,0 0,${r} A${r * 0.58},${r} 0 1,1 0,${-r}Z`} fill="#FFF1C9" depth={0.5} />
  </g>
);

/** Paper sun disc with rays, centred 0,0. */
export const SunDisc: React.FC<{ r?: number; glow?: number; t?: number }> = ({ r = 70, glow = 1, t = 0 }) => (
  <g>
    <path d={circle(0, 0, r * 2.2)} fill={Y.goldLt} opacity={0.38 * glow} filter="url(#psoft)" style={{ mixBlendMode: "screen" }} />
    <g transform={`rotate(${t * 6})`}>
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M${-r * 0.12},${-r * 1.18} L0,${-r * 1.5} L${r * 0.12},${-r * 1.18}Z`} fill="#F7C46A" transform={`rotate(${i * 30})`} />
      ))}
    </g>
    <P d={circle(0, 0, r)} fill="#F5B04A" depth={0.5} />
  </g>
);

/** Faceless robed paper figure, 100 units tall, feet at 0,0 (adab: never a face). */
export type RobePose = "stand" | "walk" | "sit" | "staff" | "reach" | "carry";
export const Robed: React.FC<{ col?: string; cloth?: string; pose?: RobePose; step?: number; armRot?: number }> = ({ col = Y.robeY, cloth, pose = "stand", step = 0, armRot = 0 }) => {
  const draw = (o: string | null) => {
    const body = o ?? col;
    const head = o ?? cloth ?? mix(col, "#ffffff", 0.45);
    const shade = o ?? mix(col, "#1A1030", 0.22);
    const crease = o ?? mix(col, "#ffffff", 0.35);
    const sit = pose === "sit";
    const hem = sit ? -18 : 0;
    const sw = 8;
    return (
      <g>
        {sit ? <path d="M-24,-30 L30,-30 L34,-6 L-26,-6Z" fill={shade} /> : null}
        <path d={`M-14,-76 L14,-76 L${22 + step * 2},${hem} L${-22 + step * 2},${hem} Z`} fill={body} />
        <path d={`M2,-74 L${12 + step * 2},${hem} L${22 + step * 2},${hem} L14,-76Z`} fill={shade} />
        {o ? null : <path d={`M-4,-70 L${-8 + step},${hem - 4} M6,-60 L${10 + step},${hem - 6}`} stroke={crease} strokeWidth={2} opacity={0.8} fill="none" />}
        <path d="M-15,-46 L15,-46" stroke={o ?? mix(col, "#000000", 0.25)} strokeWidth={4} />
        <path d={circle(0, -88, 11)} fill={o ?? mix(col, "#2A1A30", 0.55)} />
        <path d="M-13,-90 Q0,-110 13,-90 L18,-70 L-18,-70Z" fill={head} />
        {pose === "staff" ? (
          <g>
            <path d="M14,-72 L26,-52 L30,-46" stroke={body} strokeWidth={sw} strokeLinecap="round" fill="none" />
            <path d={`M32,-112 L28,${hem}`} stroke={o ?? "#7A5236"} strokeWidth={5} strokeLinecap="round" />
            <path d="M32,-112 Q42,-118 38,-104" stroke={o ?? "#7A5236"} strokeWidth={5} fill="none" strokeLinecap="round" />
          </g>
        ) : pose === "reach" ? (
          <g transform={`rotate(${armRot},12,-72)`}>
            <path d="M12,-72 L24,-94 L28,-112" stroke={body} strokeWidth={sw} strokeLinecap="round" fill="none" />
          </g>
        ) : pose === "carry" ? (
          <path d="M-12,-72 L-20,-58 L-6,-50 M12,-72 L20,-58 L6,-50" stroke={body} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ) : (
          <path d={`M-13,-72 L${-19 - step * 3},-50 L${-18 - step * 3},-40 M13,-72 L${19 + step * 3},-50 L${18 + step * 3},-40`} stroke={body} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        )}
      </g>
    );
  };
  return <Layered draw={draw} depth={0.5} />;
};

/** Stone well mouth seen 3/4 from above. Opening centre at 0,0, width 2*rx. */
export const WellMouth: React.FC<{ rx?: number; frame?: boolean; dark?: number }> = ({ rx = 210, frame = true, dark = 1 }) => {
  const ry = rx * 0.33, wallH = rx * 0.72;
  const front = `M${-rx},0 L${-rx * 0.96},${wallH} A${rx * 0.96},${ry} 0 0,0 ${rx * 0.96},${wallH} L${rx},0 A${rx},${ry} 0 0,1 ${-rx},0Z`;
  return (
    <g>
      {frame ? (
        <Layered depth={0.8} draw={(o) => (
          <g>
            <path d={rect(-rx * 0.92 - 12, -rx * 1.5, 24, rx * 1.5 + 10)} fill={o ?? "#7A5236"} />
            <path d={rect(rx * 0.92 - 12, -rx * 1.5, 24, rx * 1.5 + 10)} fill={o ?? "#6B4A33"} />
            <path d={rect(-rx * 1.05, -rx * 1.58, rx * 2.1, 26)} fill={o ?? "#8A6040"} />
          </g>
        )} />
      ) : null}
      {frame ? <path d={`M0,${-rx * 1.45} L0,${-ry * 0.2}`} stroke="#D9C49A" strokeWidth={4} /> : null}
      <Layered depth={1} draw={(o) => <path d={front} fill={o ?? Y.stone} />} />
      <path d={front} fill="url(#plight)" />
      {Array.from({ length: 3 }, (_, row) => Array.from({ length: 7 }, (_, i) => {
        const x = -rx + (i + (row % 2) * 0.5) * (rx * 2 / 7);
        const y = ry * 0.9 + row * (wallH / 3.2);
        return x < rx - 10 ? <path key={`${row}-${i}`} d={`M${x.toFixed(1)},${y.toFixed(1)} l0,${(wallH / 3.4).toFixed(1)}`} stroke={Y.stoneDk} strokeWidth={3} opacity={0.6} /> : null;
      }))}
      {[1, 2].map((row) => <path key={row} d={`M${-rx * 0.98},${ry * 0.6 + row * (wallH / 3.2)} A${rx},${ry} 0 0,0 ${rx * 0.98},${ry * 0.6 + row * (wallH / 3.2)}`} stroke={Y.stoneDk} strokeWidth={3} fill="none" opacity={0.6} />)}
      <path d={ellipse(0, 0, rx, ry)} fill={mix(Y.stone, "#ffffff", 0.25)} />
      <path d={ellipse(0, ry * 0.1, rx * 0.8, ry * 0.74)} fill={Y.hole} opacity={dark} />
      <path d={`M${-rx * 0.8},${ry * 0.1} A${rx * 0.8},${ry * 0.74} 0 0,1 ${rx * 0.8},${ry * 0.1}`} stroke="#3A3058" strokeWidth={10} fill="none" opacity={0.8} />
      <path d={`M${-rx},0 A${rx},${ry} 0 0,1 ${rx},0`} stroke="#FFF6E2" strokeWidth={3} fill="none" opacity={0.7} transform="translate(-1.5,-2)" />
    </g>
  );
};

/** Sand dune band (top edge y), cut paper; optional gaussian hill at peakX. */
export const Dune: React.FC<{ y: number; seed: number; col?: string; amp?: number; depth?: number; peakX?: number; peakH?: number }> = ({ y, seed, col = Y.sand, amp = 30, depth = 1, peakX, peakH = 0 }) => {
  let d = `M-200,2200 L-200,${y}`;
  for (let x = -200; x <= 1300; x += 30) {
    let v = Math.sin(x / 240 + seed) * amp + Math.sin(x / 97 + seed * 2.3) * amp * 0.25;
    if (peakX !== undefined) v -= peakH * Math.exp(-Math.pow((x - peakX) / 260, 2));
    d += ` L${x},${(y + v).toFixed(1)}`;
  }
  d += " L1300,2200Z";
  return <P d={d} fill={col} depth={depth} edge={mix(col, "#ffffff", 0.55)} />;
};

/** Blurred foreground desert brush in a bottom corner (DOF plane). */
export const FGBrush: React.FC<{ side?: "l" | "r"; y?: number; col?: string; s?: number }> = ({ side = "l", y = 1780, col = "#5E4A36", s = 1 }) => {
  const sx = side === "l" ? 1 : -1;
  const x0 = side === "l" ? -40 : 1120;
  return (
    <g filter="url(#pshadow)" opacity={0.9} transform={`translate(${x0},${y}) scale(${sx * s},${s})`}>
      <path d={blob(150, 11, 12, 0.22, 1.4, 0.8)} fill={col} />
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M${40 + i * 22},0 Q${70 + i * 30},${-150 - hash(i) * 120} ${120 + i * 34},${-210 - hash(i * 3) * 100}`} stroke={col} strokeWidth={12} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
};
