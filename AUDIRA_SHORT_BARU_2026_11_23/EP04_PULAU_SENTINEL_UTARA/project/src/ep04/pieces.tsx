// PAINTERLY pieces for EP04 (pure SVG, 1080 × 1920 design space). Painted-light look: warm key, cool violet cast shadow, painted rims.
// Cinematic 2D: long soft cast shadow + face + directional light gradient; cast = black silhouettes with coloured contour. No Math.random: seeded hash only.
import React from "react";

export const C = {
  ivory: "#F6EBD9", peach: "#F4C9A8", coral: "#E9806A", gold: "#F2B75B",
  cobalt: "#2F6FA3", teal: "#3FA7A0", mint: "#8FD3C1", foam: "#FFF6E6",
  forest: "#2E6B4F", leaf: "#4E9A62", leafLt: "#9ED39A", sand: "#EBCB93",
  red: "#E2574C", amber: "#E8A93A", wood: "#7A5236", iron: "#6E6A66", ink: "#2A211B",
  skin: "#2B1C2E", sepia: "#6B4A2E",
  rimGold: "#FFB45E", rimCyan: "#9FE3F0", night: "#0B1F25",
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

export const SHADOW = "rgba(62,36,96,.46)";

const rimFilter = (id: string, col: string, r: number) => (
  <filter id={id} x="-25%" y="-25%" width="150%" height="150%">
    <feMorphology in="SourceAlpha" operator="dilate" radius={r} result="d" />
    <feFlood floodColor={col} />
    <feComposite in2="d" operator="in" result="o" />
    <feGaussianBlur in="o" stdDeviation={r * 0.45} result="ob" />
    <feMerge><feMergeNode in="ob" /><feMergeNode in="SourceGraphic" /></feMerge>
  </filter>
);

export const PaperDefs: React.FC = () => (
  <defs>
    <filter id="pshadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="12" /></filter>
    <filter id="psoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22" /></filter>
    <linearGradient id="plight" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#FFD89A" stopOpacity="0.38" />
      <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
      <stop offset="1" stopColor="#3A2060" stopOpacity="0.40" />
    </linearGradient>
    {rimFilter("rim-gold", C.rimGold, 1.25)}
    {rimFilter("rim-cyan", C.rimCyan, 1.25)}
  </defs>
);

/** One lit shape: long soft cast shadow (key light top-left) + face + light gradient. */
export const P: React.FC<{ d: string; fill: string; edge?: string; depth?: number; light?: boolean; noShadow?: boolean; opacity?: number }> = ({ d, fill, depth = 1, light = true, noShadow, opacity }) => (
  <g opacity={opacity}>
    {noShadow ? null : <path d={d} fill={SHADOW} transform={`translate(${26 * depth},${34 * depth})`} filter="url(#pshadow)" />}
    <path d={d} fill={fill} />
    {light ? <path d={d} fill="url(#plight)" /> : null}
  </g>
);

/** Composite paper object: draw(null) = real colours, draw(color) = everything in that colour (shadow pass). */
export const Layered: React.FC<{ draw: (c: string | null) => React.ReactNode; depth?: number }> = ({ draw, depth = 1 }) => (
  <g>
    <g transform={`translate(${22 * depth},${30 * depth})`} filter="url(#pshadow)">{draw(SHADOW)}</g>
    {draw(null)}
  </g>
);

export const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0Z`;
export const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0Z`;

/** Closed seeded blob around 0,0. Same seed = same island shape everywhere. */
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

export const wave = (y: number, amp: number, len: number, phase: number, x0 = -120, x1 = 1200, bottom = 2100) => {
  let d = `M${x0},${bottom} L${x0},${y}`;
  for (let x = x0; x <= x1; x += 24) d += ` L${x},${(y + Math.sin((x / len) * Math.PI * 2 + phase) * amp).toFixed(1)}`;
  return d + ` L${x1},${bottom}Z`;
};
export const waveLine = (y: number, amp: number, len: number, phase: number, x0 = -120, x1 = 1200) => {
  let d = `M${x0},${y}`;
  for (let x = x0; x <= x1; x += 24) d += ` L${x},${(y + Math.sin((x / len) * Math.PI * 2 + phase) * amp).toFixed(1)}`;
  return d;
};

/** Side-view sea: strips i in `only` (0 = back). Phase from global t keeps the sea continuous across cuts. */
export const Sea: React.FC<{ y: number; t: number; cols?: string[]; amp?: number; gap?: number; only?: number[] }> = ({ y, t, cols = ["#5FA3A3", "#2F7A86", "#1D5670", "#103A50"], amp = 14, gap = 70, only }) => (
  <g>
    {cols.map((c, i) => (only && !only.includes(i) ? null : (
      <g key={i}>
        <P d={wave(y + i * gap, amp * (1 + i * 0.25), 260 + i * 70, t * (1.3 - i * 0.22) + i * 1.7)} fill={c} depth={0.6} />
        <path d={waveLine(y + i * gap, amp * (1 + i * 0.25), 260 + i * 70, t * (1.3 - i * 0.22) + i * 1.7)} stroke="#CFE8E4" strokeWidth={3} fill="none" opacity={0.35} />
      </g>
    )))}
  </g>
);

/** Side view of the island, waterline at y=0, ~760 wide. `mono` paints it as a single-tone silhouette. */
export const IslandSide: React.FC<{ mono?: string }> = ({ mono }) => {
  const f = (c: string, k = 0) => (mono ? mix(mono, "#000000", k) : c);
  const canopies = Array.from({ length: 15 }, (_, i) => {
    const x = -290 + i * 41 + (hash(i + 3) - 0.5) * 20;
    const top = -60 - 140 * (1 - Math.pow(x / 330, 2));
    const r = 30 + hash(i + 11) * 24;
    const col = [C.forest, C.leaf, C.leafLt][i % 3];
    return { x, y: top + 10, r, col };
  });
  return (
    <g>
      <P d="M-300,-30 C-250,-130 -150,-215 -20,-225 C110,-230 230,-160 300,-40 Z" fill={f(C.forest)} />
      {canopies.map((c, i) => <P key={i} d={circle(c.x, c.y, c.r)} fill={f(c.col, (i % 3) * 0.06)} depth={0.6} />)}
      <P d="M-340,-18 C-280,-95 -200,-140 -110,-150 C-30,-158 20,-115 60,-62 L80,-22Z" fill={f(C.leaf, 0.08)} />
      <P d="M10,-26 C80,-128 180,-150 250,-108 C300,-78 330,-44 345,-18 Z" fill={f(C.leaf, 0.08)} />
      <P d="M-390,12 C-300,-28 -200,-42 -100,-46 L120,-48 C230,-44 320,-28 395,12 Z" fill={f(C.sand, 0.16)} />
      {[-320, 300].map((px, k) => (
        <g key={k} transform={`translate(${px},-30) scale(${k ? -1 : 1},1)`}>
          <P d="M0,0 C-6,-40 -2,-90 14,-130 L22,-128 C8,-88 6,-40 10,0Z" fill={f(C.wood, 0.1)} depth={0.5} />
          {[-150, -110, -60, -20, 20].map((a, j) => (
            <g key={j} transform={`translate(18,-130) rotate(${a})`}>
              <P d="M0,0 C20,-14 50,-16 80,-4 C50,-6 22,-2 0,6Z" fill={f(j % 2 ? C.leaf : C.forest)} depth={0.4} light={false} edge={f(C.leafLt)} />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
};

/** Top-down island, centre 0,0, reef radius ≈ 260. */
export const IslandTop: React.FC<{ reefGlow?: number }> = ({ reefGlow = 0 }) => {
  const trees = Array.from({ length: 26 }, (_, i) => {
    const a = hash(i * 3.1) * Math.PI * 2, rr = Math.sqrt(hash(i * 5.7)) * 140;
    return { x: Math.cos(a) * rr, y: Math.sin(a) * rr, r: 18 + hash(i * 2.3) * 16, c: ["#22402F", "#2E5238", "#18301F"][i % 3] };
  });
  return (
    <g>
      <P d={blob(262, 41, 14, 0.12)} fill="#2F7F7A" depth={0.7} />
      <path d={blob(262, 41, 14, 0.12)} fill="none" stroke={C.foam} strokeWidth={6 + reefGlow * 6} strokeDasharray="18 14" opacity={0.6 + reefGlow * 0.4} />
      <P d={blob(205, 77, 12, 0.13)} fill="#C9B27A" />
      <P d={blob(178, 77, 12, 0.13)} fill="#1F4A35" />
      {trees.map((tr, i) => (
        <g key={i}>
          <P d={circle(tr.x, tr.y, tr.r)} fill={tr.c} depth={0.45} />
          <path d={circle(tr.x - tr.r * 0.28, tr.y - tr.r * 0.3, tr.r * 0.52)} fill="#9DBF7E" opacity={0.32} />
          <path d={circle(tr.x, tr.y, tr.r)} fill="none" stroke={C.rimGold} strokeWidth={2} opacity={0.35} strokeDasharray={`${tr.r * 1.6} ${tr.r * 9}`} strokeDashoffset={tr.r * 2.2} />
        </g>
      ))}
    </g>
  );
};

/** Faceless paper silhouette, 100 units tall, feet at 0,0. armRot rotates the bow/spear arm (deg). */
export type Pose = "stand" | "spear" | "bow" | "carry" | "walk";
export const Figure: React.FC<{ pose?: Pose; color?: string; hat?: boolean; armRot?: number; step?: number; ghost?: number; rim?: "gold" | "cyan" | "none" }> = ({ pose = "stand", color = C.skin, hat, armRot = 0, step = 0, ghost = 0, rim = "gold" }) => {
  const draw = (o: string | null) => {
    const body = o ?? color;
    const crease = o ?? color;
    const wood = o ?? color;
    const iron = o ?? color;
    const sw = 5.5;
    const legL = 2 * step, legR = -2 * step;
    return (
      <g>
        <path d={circle(0, -91, 7.5)} fill={body} />
        {hat ? <path d={ellipse(0, -97, 13, 3.2)} fill={o ?? "#C9A66B"} /> : null}
        {hat ? <path d="M-7,-97 Q0,-108 7,-97Z" fill={o ?? "#C9A66B"} /> : null}
        <path d="M-9,-82 L9,-82 L11,-50 L8,-46 L-8,-46 L-11,-50 Z" fill={body} />
        <path d={`M-8,-48 L8,-48 L9,-26 L${7 + legR},0 L${2 + legR},0 L1,-26 L-1,-26 L${-2 + legL},0 L${-7 + legL},0 L-9,-26 Z`} fill={body} />
        <path d="M0,-80 L1,-50" stroke={crease} strokeWidth={1.6} fill="none" opacity={o ? 0 : 0.8} />
        
        {pose === "stand" || pose === "walk" ? (
          <path d={`M-10,-78 L${-14 - step * 3},-56 L${-13 - step * 3},-44 M10,-78 L${14 + step * 3},-56 L${13 + step * 3},-44`} stroke={body} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ) : null}
        {pose === "carry" ? (
          <path d="M-10,-78 L-22,-66 L-32,-64 M10,-78 L12,-58 L10,-46" stroke={body} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ) : null}
        {pose === "spear" ? (
          <g>
            <path d="M-10,-78 L-14,-56 L-12,-46 M10,-78 L20,-70 L24,-84" stroke={body} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <g transform={`rotate(${armRot},24,-84)`}>
              <path d="M34,-150 L14,-10" stroke={wood} strokeWidth={2.6} />
              <path d="M34,-150 L30,-136 L38,-137Z" fill={iron} />
            </g>
          </g>
        ) : null}
        {pose === "bow" ? (
          <g>
            <path d="M10,-78 L14,-58 L12,-46" stroke={body} strokeWidth={sw} strokeLinecap="round" fill="none" opacity={0} />
            <g transform={`rotate(${armRot},0,-78)`}>
              <path d="M-10,-78 L-34,-77 M10,-78 L-6,-77" stroke={body} strokeWidth={sw} strokeLinecap="round" fill="none" />
              <path d="M-33,-104 Q-50,-77 -33,-50" stroke={wood} strokeWidth={3} fill="none" />
              <path d="M-33,-104 L-6,-77 L-33,-50" stroke={body} strokeWidth={1} fill="none" />
              <path d="M-6,-77 L-58,-77" stroke={wood} strokeWidth={2} />
              <path d="M-58,-77 L-50,-80.5 L-50,-73.5Z" fill={iron} />
            </g>
          </g>
        ) : null}
      </g>
    );
  };
  const lit = (
    <g>
      <g transform="translate(9,12)" filter="url(#pshadow)" opacity={0.7}>{draw(SHADOW)}</g>
      <g filter={rim === "none" ? undefined : `url(#rim-${rim})`}>{draw(null)}</g>
    </g>
  );
  return ghost > 0 ? <g opacity={1 - ghost * 0.8}>{lit}</g> : lit;
};

/** Small wooden boat, side view, deck at y=0. */
export const Boat: React.FC<{ hull?: string; stripe?: string }> = ({ hull = C.wood, stripe = C.foam }) => (
  <Layered draw={(o) => (
    <g>
      <path d="M-120,0 L125,0 L96,40 L-100,40 Z" fill={o ?? hull} />
      <path d="M-114,9 L119,9 L114,16 L-110,16Z" fill={o ?? stripe} />
      <path d="M100,-4 L118,-4 L122,0 L98,0Z" fill={o ?? C.ink} />
    </g>
  )} />
);

export const Canoe: React.FC = () => (
  <Layered draw={(o) => (
    <g>
      <path d="M-170,0 Q0,30 170,0 L150,14 Q0,44 -150,14 Z" fill={o ?? C.wood} />
      <path d="M-120,-18 L120,-18" stroke={o ?? mix(C.wood, "#000000", 0.2)} strokeWidth={5} />
      <path d="M-80,-18 L-80,6 M80,-18 L80,6" stroke={o ?? mix(C.wood, "#000000", 0.2)} strokeWidth={4} />
    </g>
  )} />
);

export const Fish: React.FC<{ col?: string }> = ({ col = C.amber }) => (
  <Layered depth={0.4} draw={(o) => (
    <g>
      <path d="M-40,0 C-20,-22 20,-22 34,0 C20,22 -20,22 -40,0Z" fill={o ?? col} />
      <path d="M30,0 L56,-18 L50,0 L56,18Z" fill={o ?? mix(col, "#000000", 0.15)} />
      <path d={circle(-22, -4, 3)} fill={o ?? C.ink} />
    </g>
  )} />
);

export const Leaf: React.FC<{ col: string; s?: number; r?: number }> = ({ col, s = 1, r = 0 }) => (
  <g transform={`rotate(${r}) scale(${s})`}>
    <P d="M0,0 C50,-90 130,-170 70,-320 C10,-220 -30,-110 0,0Z" fill={col} />
    <path d="M2,-6 C30,-100 60,-200 68,-300" stroke={mix(col, "#ffffff", 0.3)} strokeWidth={4} fill="none" />
  </g>
);

export const Tree: React.FC<{ h: number; col?: string; seed?: number }> = ({ h, col = C.leaf, seed = 1 }) => (
  <g>
    <P d={`M-14,0 L14,0 L9,${-h} L-9,${-h}Z`} fill={mix(col, "#000000", 0.35)} depth={0.7} />
    <g transform={`translate(0,${-h})`}><P d={blob(h * 0.34, seed, 10, 0.18)} fill={col} /></g>
  </g>
);

/** Helicopter, side view, ~360 wide. */
export const Heli: React.FC = () => (
  <Layered draw={(o) => (
    <g filter={o ? undefined : "url(#rim-cyan)"}>
      <path d="M-60,-10 L-260,-24 L-262,-8 L-60,14Z" fill={o ?? "#151A1E"} />
      <path d={ellipse(0, 0, 90, 52)} fill={o ?? "#1B2126"} />
      <path d="M-28,-6 L70,-6 L70,8 L-28,8Z" fill={o ?? "#2A2F33"} />
      <path d="M30,-40 C66,-34 86,-12 88,4 L40,4Z" fill={o ?? "#3E5560"} />
      <path d="M-50,60 L70,60 M-30,48 L-34,60 M40,48 L44,60" stroke={o ?? "#151A1E"} strokeWidth={6} strokeLinecap="round" />
      <path d="M-4,-52 L4,-52 L4,-62 L-4,-62Z" fill={o ?? "#151A1E"} />
      <path d={ellipse(0, -64, 190, 7)} fill={o ?? "#151A1E"} opacity={0.55} />
      <path d={circle(-258, -16, 26)} fill={o ?? "#151A1E"} opacity={0.45} />
    </g>
  )} />
);

/** Floating buoy with a paper board. */
export const Buoy: React.FC<{ label: string; w?: number }> = ({ label, w = 300 }) => (
  <g>
    <Layered draw={(o) => (
      <g>
        <path d="M-6,-60 L6,-60 L6,-150 L-6,-150Z" fill={o ?? C.wood} />
        <path d={`M${-w / 2},-250 L${w / 2},-250 L${w / 2},-160 L${-w / 2},-160Z`} fill={o ?? "#2A1F2E"} />
        <path d={`M${-w / 2 + 10},-240 L${w / 2 - 10},-240`} stroke={o ?? C.red} strokeWidth={6} />
        <path d="M-60,0 C-60,-50 60,-50 60,0 C60,20 -60,20 -60,0Z" fill={o ?? C.red} />
        <path d="M-58,-14 L58,-14 L56,-2 L-56,-2Z" fill={o ?? C.foam} />
      </g>
    )} />
    <text x={0} y={-188} textAnchor="middle" fontFamily="Anton" fontSize={44} fill={C.foam} style={{ color: C.foam }} letterSpacing={2}>{label}</text>
  </g>
);

export const Arrow: React.FC<{ tip: number }> = ({ tip }) => (
  <Layered depth={0.5} draw={(o) => (
    <g>
      <path d="M-300,0 L300,0" stroke={o ?? C.wood} strokeWidth={9} strokeLinecap="round" />
      <path d="M-300,0 L-260,-26 L-230,-26 L-262,0 L-230,26 L-260,26Z" fill={o ?? C.red} />
      <g opacity={tip} transform={`scale(${0.6 + 0.4 * tip})`}>
        <path d="M296,-26 L352,0 L296,26 L306,0Z" fill={o ?? C.iron} />
      </g>
    </g>
  )} />
);

export const Coconut: React.FC = () => (
  <Layered depth={0.4} draw={(o) => (
    <g>
      <path d={circle(0, 0, 22)} fill={o ?? "#8A5A35"} />
      <path d={circle(-6, -6, 4)} fill={o ?? "#5A3A22"} />
      <path d={circle(6, -4, 4)} fill={o ?? "#5A3A22"} />
    </g>
  )} />
);
