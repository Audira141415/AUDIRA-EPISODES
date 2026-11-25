// PAPERWORLD paper pieces for EP60 Panama (pure SVG, 1080 × 1920 design space).
// Base helpers copied from EP18 Svalbard (gold, jury 4.17). Lighting rule: one key light from upper-left; every card
// throws a LONG cast shadow (down-right) + a tight contact shadow, pale cut edge, face gradient, cream rim.
// No Math.random: seeded hash only.
import React from "react";

export const C = {
  ivory: "#F6EFE4", paper: "#FFF6E6", sky: "#BFE3E8", skyWarm: "#F7E2C4", carib: "#3FA7A0", turq: "#4FD1C5",
  pacific: "#4F7FC0", pacificDk: "#3B5F99", leaf: "#5E9E5A", leafLt: "#8FC28A", leafDk: "#3F7448", laterite: "#B5523B",
  earth: "#8A6448", earthDk: "#6B4A33", concrete: "#C9C1B4", concreteDk: "#A39A8C", gold: "#F2B75B", red: "#E2574C",
  coral: "#E2574C", mustard: "#E8A93A", peach: "#F4C9A8", land: "#E9D9B6", landDk: "#D4BE93", wood: "#7A5236",
  iron: "#6E6A66", ink: "#2A2233", coat: "#3B5F99", night: "#3E4A6E", rain: "#9FB8C8", net: "#F4F1EA",
  box: ["#E2574C", "#E8A93A", "#3FA7A0", "#4F7FC0", "#8FC28A", "#D9799A", "#B5523B"],
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

// ── Panama objects ───────────────────────────────────────────────────────────────

/** Layered paper water: 3 sheets of waves with a top surface line at y. */
export const Water: React.FC<{ y: number; t: number; col?: string; amp?: number; x0?: number; x1?: number; bottom?: number }> = ({ y, t, col = C.carib, amp = 10, x0 = -160, x1 = 1240, bottom = 2100 }) => (
  <g>
    <P d={wave(y, amp, 260, t * 1.6, x0, x1, bottom)} fill={mix(col, "#ffffff", 0.25)} depth={0.4} light={false} />
    <P d={wave(y + 26, amp * 0.8, 210, -t * 1.3 + 1, x0, x1, bottom)} fill={col} depth={0.5} />
    <P d={wave(y + 62, amp * 0.6, 320, t * 1.1 + 2, x0, x1, bottom)} fill={mix(col, "#1A3050", 0.2)} depth={0.5} light={false} />
    <path d={waveLine(y + 6, amp * 0.6, 150, t * 2, x0 + 40, x1 - 40)} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.5} strokeDasharray="30 46" />
  </g>
);

/** Paper cargo ship, waterline at y=0, centred on x=0, ~420 long. */
export const Ship: React.FC<{ s?: number; name?: string; liner?: boolean; boxes?: number }> = ({ s = 1, name, liner, boxes = 7 }) => (
  <g transform={`scale(${s})`}>
    <Layered depth={0.8} draw={(o) => (
      <g>
        <path d="M-220,-70 L210,-70 L250,-110 L262,-110 L236,0 L-196,0 L-230,-60Z" fill={o ?? (liner ? "#F4F1EA" : C.red)} />
        <path d="M-226,-34 L246,-34 L240,-10 L-206,-10Z" fill={o ?? (liner ? C.ink : "#3B3346")} />
        {liner ? (
          <g>
            <path d={rect(-150, -150, 260, 80)} fill={o ?? "#FBF7F0"} />
            <path d={rect(-110, -200, 170, 50)} fill={o ?? "#FBF7F0"} />
            <path d={rect(-40, -270, 46, 70)} fill={o ?? C.mustard} />
            <path d={rect(-40, -270, 46, 14)} fill={o ?? C.ink} />
          </g>
        ) : (
          <g>
            {Array.from({ length: boxes }, (_, i) => (
              <path key={i} d={rect(-170 + i * 50, -70 - 46 - (i % 3 === 1 ? 46 : 0), 46, 46 + (i % 3 === 1 ? 46 : 0))} fill={o ?? C.box[(i * 3) % 7]} />
            ))}
            <path d={rect(-214, -170, 46, 100)} fill={o ?? "#FBF7F0"} />
            <path d={rect(-224, -186, 66, 18)} fill={o ?? C.ink} />
          </g>
        )}
      </g>
    )} />
    {liner ? Array.from({ length: 8 }, (_, i) => <path key={i} d={circle(-130 + i * 30, -112, 7)} fill="#5E7FA8" />) : null}
    {name ? <text x={0} y={-44} textAnchor="middle" fontFamily="Anton" fontSize={30} fill={liner ? C.paper : C.paper} letterSpacing={3}>{name}</text> : null}
  </g>
);

/** Concrete lock wall block (front face), with a sign. x,y = top-left. */
export const Wall: React.FC<{ x: number; y: number; w: number; h: number; sign?: string }> = ({ x, y, w, h, sign }) => (
  <g>
    <P d={rect(x, y, w, h)} fill={C.concrete} depth={1} />
    {Array.from({ length: Math.floor(h / 70) }, (_, i) => (
      <path key={i} d={`M${x + 8},${y + 60 + i * 70} L${x + w - 8},${y + 60 + i * 70}`} stroke={C.concreteDk} strokeWidth={3} opacity={0.6} />
    ))}
    {sign ? (
      <g transform={`translate(${x + w / 2},${y + 34})`}>
        <Layered depth={0.4} draw={(o) => <path d={rect(-150, -30, 300, 66)} fill={o ?? C.paper} />} />
        <path d={rect(-150, -30, 300, 10)} fill={C.red} />
        <text x={0} y={26} textAnchor="middle" fontFamily="Anton" fontSize={44} fill={C.ink} letterSpacing={6}>{sign}</text>
      </g>
    ) : null}
  </g>
);

/** Miter lock gate leaf, hinge at 0,0, extends right by w; open 0 closed → 1 folded. */
export const GateLeaf: React.FC<{ w: number; h: number; open: number; flip?: boolean }> = ({ w, h, open, flip }) => {
  const ww = w * (1 - 0.82 * open);
  return (
    <g transform={flip ? "scale(-1,1)" : undefined}>
      <Layered depth={0.7} draw={(o) => (
        <g>
          <path d={rect(0, -h, ww, h)} fill={o ?? "#6E6A66"} />
          {Array.from({ length: 5 }, (_, i) => <path key={i} d={rect(0, -h + 20 + i * (h / 5), ww, 10)} fill={o ?? "#8A857E"} />)}
          <path d={rect(0, -h - 14, ww, 14)} fill={o ?? C.mustard} />
        </g>
      )} />
    </g>
  );
};

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

/** Forest band: row of trees along y. */
export const Forest: React.FC<{ y: number; seed: number; n?: number; scale?: number; col?: string; t?: number }> = ({ y, seed, n = 9, scale = 1, col = C.leaf, t = 0 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = -60 + (1200 / (n - 1)) * i + (hash(seed + i) - 0.5) * 60;
      const hh = (200 + hash(seed * 3 + i) * 140) * scale;
      return (
        <g key={i} transform={`translate(${x},${y + hash(seed + i * 2) * 30})`}>
          {hash(seed + i * 5) > 0.7 ? <Palm h={hh * 1.2} t={t} seed={i} /> : <Tree h={hh} seed={seed + i} col={hash(i + seed) > 0.5 ? col : mix(col, "#1E3A20", 0.18)} />}
        </g>
      );
    })}
  </g>
);

/** Mosquito, centred 0,0, ~60 wide. */
export const Mosquito: React.FC<{ t: number; s?: number; seed?: number }> = ({ t, s = 1, seed = 0 }) => {
  const flap = Math.sin(t * 60 + seed) * 0.5 + 0.5;
  return (
    <g transform={`scale(${s})`}>
      <path d={ellipse(-6, -10, 14, 6 + flap * 6)} fill="#FFFFFF" opacity={0.7} transform="rotate(-25)" />
      <path d={ellipse(8, -10, 14, 6 + flap * 6)} fill="#FFFFFF" opacity={0.7} transform="rotate(25)" />
      <path d="M-22,4 L18,-2" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      <path d={circle(22, -4, 6)} fill={C.ink} />
      <path d="M26,-4 L42,4" stroke={C.ink} strokeWidth={2} />
      {[-12, -2, 8].map((x, i) => <path key={i} d={`M${x},2 L${x - 8},18 M${x},2 L${x + 6},18`} stroke={C.ink} strokeWidth={1.6} />)}
    </g>
  );
};

/** Small paper lantern (calm remembrance), foot at 0,0. */
export const Lantern: React.FC<{ glow: number; t: number; seed?: number }> = ({ glow, t, seed = 0 }) => (
  <g>
    <path d={circle(0, -40, 46)} fill={C.gold} opacity={0.5 * glow * (0.85 + 0.15 * Math.sin(t * 3 + seed))} filter="url(#pglow)" />
    <Layered depth={0.35} draw={(o) => (
      <g>
        <path d="M-18,-70 L18,-70 L22,-14 L-22,-14Z" fill={o ?? mix("#C9A97A", "#FFE7A8", glow)} />
        <path d={rect(-24, -14, 48, 10)} fill={o ?? C.wood} />
        <path d={rect(-14, -78, 28, 8)} fill={o ?? C.wood} />
      </g>
    )} />
  </g>
);

/** Flag on a pole, pole foot at 0,0. kind: fr | us | pa. */
export const Flag: React.FC<{ kind: "fr" | "us" | "pa"; t: number; h?: number; lift?: number; w?: number }> = ({ kind, t, h = 360, lift = 1, w = 170 }) => {
  const fh = w * 0.64;
  const top = -h + (1 - lift) * (h - fh - 20);
  const wav = (x: number) => Math.sin(x / 40 + t * 4) * 6 * (x / w);
  const quad = (x0: number, x1: number, y0: number, y1: number) =>
    `M${x0},${top + y0 + wav(x0)} L${x1},${top + y0 + wav(x1)} L${x1},${top + y1 + wav(x1)} L${x0},${top + y1 + wav(x0)}Z`;
  return (
    <g>
      <P d={rect(-5, -h - 10, 10, h + 10)} fill={C.iron} depth={0.5} />
      <path d={circle(0, -h - 14, 9)} fill={C.gold} />
      <Layered depth={0.5} draw={(o) => (
        <g>
          {kind === "fr" ? (
            <g>
              <path d={quad(6, 6 + w / 3, 0, fh)} fill={o ?? "#2F5BA8"} />
              <path d={quad(6 + w / 3, 6 + (2 * w) / 3, 0, fh)} fill={o ?? "#FBF7F0"} />
              <path d={quad(6 + (2 * w) / 3, 6 + w, 0, fh)} fill={o ?? C.red} />
            </g>
          ) : null}
          {kind === "us" ? (
            <g>
              {Array.from({ length: 7 }, (_, i) => <path key={i} d={quad(6, 6 + w, (i * fh) / 7, ((i + 1) * fh) / 7)} fill={o ?? (i % 2 ? "#FBF7F0" : C.red)} />)}
              <path d={quad(6, 6 + w * 0.42, 0, fh * 0.54)} fill={o ?? "#2F4C8A"} />
            </g>
          ) : null}
          {kind === "pa" ? (
            <g>
              <path d={quad(6, 6 + w / 2, 0, fh / 2)} fill={o ?? "#FBF7F0"} />
              <path d={quad(6 + w / 2, 6 + w, 0, fh / 2)} fill={o ?? C.red} />
              <path d={quad(6, 6 + w / 2, fh / 2, fh)} fill={o ?? "#2F5BA8"} />
              <path d={quad(6 + w / 2, 6 + w, fh / 2, fh)} fill={o ?? "#FBF7F0"} />
            </g>
          ) : null}
        </g>
      )} />
      {kind === "us" ? Array.from({ length: 6 }, (_, i) => <path key={i} d={circle(20 + (i % 3) * 22, top + 16 + Math.floor(i / 3) * 26, 4)} fill="#FBF7F0" />) : null}
      {kind === "pa" ? (
        <g>
          <path d={circle(6 + w / 4, top + fh / 4 + wav(w / 4), 12)} fill="#2F5BA8" />
          <path d={circle(6 + (3 * w) / 4, top + (3 * fh) / 4 + wav((3 * w) / 4), 12)} fill={C.red} />
        </g>
      ) : null}
    </g>
  );
};

/** Worker hut on stilts with a mosquito net and window screen, foot centre 0,0. */
export const Hut: React.FC<{ net: number; screen: number }> = ({ net, screen }) => (
  <g>
    <Layered depth={1} draw={(o) => (
      <g>
        {[-170, -60, 60, 170].map((x) => <path key={x} d={rect(x - 8, -70, 16, 70)} fill={o ?? C.wood} />)}
        <path d={rect(-200, -330, 400, 260)} fill={o ?? "#E9D2A8"} />
        <path d="M-240,-320 L0,-470 L240,-320Z" fill={o ?? "#9C5B3C"} />
        <path d={rect(-210, -84, 420, 16)} fill={o ?? C.wood} />
      </g>
    )} />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-200 + i * 50},-330 L${-200 + i * 50},-84`} stroke="#CDB386" strokeWidth={3} opacity={0.6} />)}
    <path d={rect(60, -280, 110, 110)} fill="#5A4A3A" />
    <g opacity={screen}>
      <path d={rect(60, -280, 110, 110)} fill="#DDE6EA" opacity={0.55} />
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${60 + i * 11},-280 L${60 + i * 11},-170 M60,${-280 + i * 11} L170,${-280 + i * 11}`} stroke="#FFFFFF" strokeWidth={1.4} opacity={0.8} />)}
      <path d={rect(60, -280, 110, 110)} fill="none" stroke={C.wood} strokeWidth={6} />
    </g>
    <path d={rect(-170, -200, 170, 70)} fill="#F6EFE4" />
    <path d={rect(-170, -200, 170, 14)} fill="#D9C8A8" />
    <g opacity={net}>
      <path d={`M-200,${-320} Q-85,${-336} 30,-320 L${12},-130 Q-85,${-118} -182,-130Z`} fill={C.net} opacity={0.55} />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-190 + i * 28},-320 L${-178 + i * 26},-130`} stroke="#FFFFFF" strokeWidth={2} opacity={0.8} />)}
    </g>
  </g>
);

/** Oil drum, foot at 0,0; tilt rotates around the base. */
export const Drum: React.FC<{ tilt?: number; label?: string }> = ({ tilt = 0, label }) => (
  <g transform={`rotate(${tilt},60,0)`}>
    <Layered depth={0.7} draw={(o) => (
      <g>
        <path d={rect(-60, -170, 120, 170)} fill={o ?? "#3F7448"} />
        <path d={ellipse(0, -170, 60, 16)} fill={o ?? "#55915E"} />
        {[-120, -50].map((y) => <path key={y} d={rect(-60, y, 120, 10)} fill={o ?? "#2E5636"} />)}
      </g>
    )} />
    {label ? <text x={0} y={-74} textAnchor="middle" fontFamily="Anton" fontSize={26} fill={C.paper} letterSpacing={1}>{label}</text> : null}
  </g>
);

/** Steam shovel on rails, foot at 0,0, ~360 wide; dig 0..1 swings the boom. */
export const SteamShovel: React.FC<{ dig: number; t: number }> = ({ dig, t }) => (
  <g>
    {[0, 1, 2].map((i) => (
      <path key={i} d={circle(-60 + i * 30, -120 - ((t * 60 + i * 50) % 160), 20 + ((t * 60 + i * 50) % 160) * 0.18)} fill="#EDE6DA" opacity={0.8 - ((t * 60 + i * 50) % 160) / 220} filter="url(#pcontact)" />
    ))}
    <Layered depth={1} draw={(o) => (
      <g>
        <path d={rect(-170, -40, 300, 40)} fill={o ?? C.iron} />
        {[-130, -60, 10, 80].map((x) => <path key={x} d={circle(x, -4, 18)} fill={o ?? "#3B3346"} />)}
        <path d={rect(-160, -160, 220, 120)} fill={o ?? "#2E3A55"} />
        <path d={rect(-150, -200, 150, 40)} fill={o ?? C.red} />
        <path d={rect(-110, -230, 30, 70)} fill={o ?? C.ink} />
        <g transform={`rotate(${-38 + dig * 46},40,-120)`}>
          <path d="M40,-130 L260,-200 L268,-182 L48,-110Z" fill={o ?? C.mustard} />
          <path d="M150,-170 L240,-40 L226,-32 L138,-160Z" fill={o ?? "#C9852A"} />
          <path d="M210,-50 L280,-60 L290,0 L222,10Z" fill={o ?? C.iron} />
        </g>
      </g>
    )} />
  </g>
);

/** Rail track along y from x0 to x1. */
export const Rail: React.FC<{ y: number; x0?: number; x1?: number; off?: number }> = ({ y, x0 = -100, x1 = 1180, off = 0 }) => (
  <g>
    {Array.from({ length: Math.ceil((x1 - x0) / 46) }, (_, i) => <path key={i} d={rect(x0 + i * 46 - (off % 46), y - 4, 24, 16)} fill={C.wood} />)}
    <path d={`M${x0},${y} L${x1},${y}`} stroke={C.iron} strokeWidth={6} />
  </g>
);

/** Clock tower, foot at 0,0; hands animate from `hour` (fractional, 0..12). */
export const ClockTower: React.FC<{ hour: number; glow?: number }> = ({ hour, glow = 0 }) => {
  const mA = (hour % 1) * 360, hA = (hour / 12) * 360;
  return (
    <g>
      <path d={circle(0, -620, 170)} fill={C.gold} opacity={0.4 * glow} filter="url(#psoft)" />
      <Layered depth={1.2} draw={(o) => (
        <g>
          <path d={rect(-110, -760, 220, 760)} fill={o ?? "#EADCC2"} />
          <path d="M-140,-760 L0,-900 L140,-760Z" fill={o ?? C.laterite} />
          <path d={rect(-130, -770, 260, 22)} fill={o ?? "#D4C2A0"} />
          <path d={circle(0, -620, 92)} fill={o ?? C.paper} />
          <path d={rect(-40, -140, 80, 140)} fill={o ?? "#6E4A2F"} />
        </g>
      )} />
      <path d={circle(0, -620, 92)} fill="none" stroke={C.ink} strokeWidth={8} />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={rect(-3, -706, 6, 16)} fill={C.ink} transform={`rotate(${i * 30},0,-620)`} />)}
      <path d="M0,-620 L0,-668" stroke={C.ink} strokeWidth={11} strokeLinecap="round" transform={`rotate(${hA},0,-620)`} />
      <path d="M0,-620 L0,-694" stroke={C.red} strokeWidth={6} strokeLinecap="round" transform={`rotate(${mA},0,-620)`} />
      <path d={circle(0, -620, 9)} fill={C.ink} />
      {[-400, -260].map((y) => <path key={y} d={rect(-34, y, 68, 90)} fill="#7A8FA8" stroke="#FBF7F0" strokeWidth={4} />)}
    </g>
  );
};

/** Faceless swimmer (front crawl), centred 0,0 at the water surface, heading right. */
export const Swimmer: React.FC<{ t: number }> = ({ t }) => {
  const a = t * 5;
  return (
    <Layered depth={0.4} draw={(o) => (
      <g>
        <path d="M-80,4 Q-10,-12 50,-2 L46,10 Q-10,4 -84,16Z" fill={o ?? "#C98E6A"} />
        <path d={circle(66, -6, 17)} fill={o ?? "#C98E6A"} />
        <path d="M50,-22 Q66,-30 82,-20 L80,-10 Q66,-16 52,-12Z" fill={o ?? C.red} />
        <g transform={`rotate(${(a * 57.3) % 360},34,-2)`}><path d="M34,-2 L34,-62" stroke={o ?? "#C98E6A"} strokeWidth={12} strokeLinecap="round" /></g>
        <path d={`M-80,8 L-120,${4 + Math.sin(a * 2) * 10} M-80,12 L-122,${16 - Math.sin(a * 2) * 10}`} stroke={o ?? "#C98E6A"} strokeWidth={11} strokeLinecap="round" />
      </g>
    )} />
  );
};

/** Balance scale with a coin pan, foot at 0,0. tip -1..1. */
export const Scale: React.FC<{ tip: number }> = ({ tip }) => (
  <g>
    <Layered depth={0.8} draw={(o) => (
      <g>
        <path d={rect(-80, -24, 160, 24)} fill={o ?? C.wood} />
        <path d={rect(-10, -300, 20, 280)} fill={o ?? C.gold} />
        <g transform={`rotate(${tip * 9},0,-300)`}>
          <path d={rect(-200, -308, 400, 16)} fill={o ?? C.gold} />
          {[-1, 1].map((sx) => (
            <g key={sx} transform={`translate(${sx * 190},-300) rotate(${-tip * 9})`}>
              <path d="M0,0 L-60,130 M0,0 L60,130" stroke={o ?? C.iron} strokeWidth={3} />
              <path d="M-80,130 L80,130 Q60,170 0,172 Q-60,170 -80,130Z" fill={o ?? "#C9852A"} />
            </g>
          ))}
        </g>
      </g>
    )} />
  </g>
);

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

/** Name card (real person: faceless figure + card). Centred at 0,0. */
export const NameCard: React.FC<{ name: string; role: string; op?: number }> = ({ name, role, op = 1 }) => (
  <g opacity={op}>
    <Layered depth={0.6} draw={(o) => <path d={rect(-250, -78, 500, 156)} fill={o ?? C.paper} />} />
    <path d={rect(-250, -78, 16, 156)} fill={C.red} />
    <text x={10} y={-8} textAnchor="middle" fontFamily="Anton" fontSize={54} fill={C.ink} letterSpacing={1}>{name}</text>
    <text x={10} y={50} textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize={42} fill="#5A3E2C">{role}</text>
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
