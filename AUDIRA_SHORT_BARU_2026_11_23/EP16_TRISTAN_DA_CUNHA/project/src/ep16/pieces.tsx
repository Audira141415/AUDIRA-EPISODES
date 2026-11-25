// HISTORYMAP pieces for EP16 (pure SVG, 1080 × 1920 design space). Night chart-table palette:
// navy ink sea + faded gold graticule, warm parchment land, red routes. Illustrations share the palette and are lit by
// one key light from the top-left (cast shadow down-right + light gradient). No Math.random: seeded hash only.
import React from "react";
import { LANDS, K, proj } from "./geo";

export const C = {
  navy: "#141B28", navy2: "#1E2A3C", navy3: "#2A3A52", gold: "#C9A45C", goldHi: "#E8C778", coast: "#8A6A33",
  parch: "#D9C49A", parch2: "#BFA46E", olive: "#6F7B4A", oliveDk: "#4A5434", oliveLt: "#97A266", red: "#E0393E",
  redDk: "#9E2328", cream: "#F4E9D0", stone: "#8C8577", stoneLt: "#B9B1A0", roofRed: "#B8463A", roofGrn: "#4F6B4A",
  lava: "#FF7A2E", ash: "#5B5550", ink: "#0E121A", sea: "#1C3550", seaLt: "#2F5878", foam: "#D8E4E8",
};

export const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ease = (v: number) => { const x = clamp01(v); return x * x * (3 - 2 * x); };
export const easeOut = (v: number) => 1 - Math.pow(1 - clamp01(v), 3);
export const expoOut = (v: number) => { const x = clamp01(v); return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); };
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const toRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
export const mix = (a: string, b: string, k: number) => {
  const x = toRgb(a), y = toRgb(b);
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, "0")).join("");
};
export const circle = (cx: number, cy: number, r: number) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0Z`;
export const ellipse = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0Z`;

export const SHADOW = "rgba(4,6,12,.55)";

export const Defs: React.FC = () => (
  <defs>
    <filter id="cast" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10" /></filter>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="26" /></filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
    <linearGradient id="keylit" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#FFE2A8" stopOpacity="0.34" />
      <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
      <stop offset="1" stopColor="#000000" stopOpacity="0.42" />
    </linearGradient>
    <filter id="mottle" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={3} seed={7} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.12  0 0 0 0.55 -0.12" />
      <feComposite in2="SourceAlpha" operator="in" />
    </filter>
  </defs>
);

/** One lit shape: soft cast shadow (key light top-left) + face + light gradient. */
export const P: React.FC<{ d: string; fill: string; depth?: number; light?: boolean; noShadow?: boolean; opacity?: number; stroke?: string; sw?: number }> = ({ d, fill, depth = 1, light = true, noShadow, opacity, stroke, sw = 3 }) => (
  <g opacity={opacity}>
    {noShadow ? null : <path d={d} fill={SHADOW} transform={`translate(${18 * depth},${24 * depth})`} filter="url(#cast)" />}
    <path d={d} fill={fill} stroke={stroke} strokeWidth={stroke ? sw : 0} strokeLinejoin="round" />
    {light ? <path d={d} fill="url(#keylit)" /> : null}
  </g>
);

/** Composite object with one shared cast shadow: draw(null) = real colours, draw(col) = shadow pass. */
export const Lit: React.FC<{ draw: (c: string | null) => React.ReactNode; depth?: number }> = ({ draw, depth = 1 }) => (
  <g>
    <g transform={`translate(${18 * depth},${24 * depth})`} filter="url(#cast)">{draw(SHADOW)}</g>
    {draw(null)}
  </g>
);

// ── Map ─────────────────────────────────────────────────────────────────────────────────
export type Cam = { cx: number; cy: number; s: number; rot?: number };
export const camT = (c: Cam) => `translate(540,960) rotate(${c.rot ?? 0}) scale(${c.s}) translate(${-c.cx},${-c.cy})`;
export const toScreen = (c: Cam, p: [number, number]): [number, number] => [540 + (p[0] - c.cx) * c.s, 960 + (p[1] - c.cy) * c.s];
export const lerpCam = (a: Cam, b: Cam, k: number): Cam => {
  // zoom interpolates in log space so the motion feels even
  const s = Math.exp(lerp(Math.log(a.s), Math.log(b.s), k));
  return { cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), s, rot: lerp(a.rot ?? 0, b.rot ?? 0, k) };
};

const GRAT_LON = Array.from({ length: 15 }, (_, i) => -90 + i * 10);
const WISPS: [number, number, number][] = [[100, 420, 260], [900, 1500, 320], [600, 260, 200], [1300, 1180, 280]];
const GRAT_LAT = Array.from({ length: 13 }, (_, i) => 60 - i * 10);

/** Navigation-chart map. Children are drawn in world space on top of the land. */
export const MapView: React.FC<{ cam: Cam; t: number; children?: React.ReactNode; dim?: number; tint?: string }> = ({ cam, t, children, dim = 0, tint }) => {
  const u = 1 / cam.s;
  const [x0] = proj(-100, 0), [x1] = proj(45, 0);
  const [, y0] = proj(0, 68), [, y1] = proj(0, -55);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <Defs />
      <defs>
        <radialGradient id="seaG" cx="0.42" cy="0.38" r="0.9">
          <stop offset="0" stopColor="#34476A" />
          <stop offset="0.55" stopColor={C.navy2} />
          <stop offset="1" stopColor="#0C111B" />
        </radialGradient>
        <linearGradient id="landG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.parch} />
          <stop offset="1" stopColor={C.parch2} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#seaG)" />
      <g transform={camT(cam)}>
        {/* graticule */}
        <g stroke={C.gold} strokeOpacity={0.2} strokeWidth={1.6 * u}>
          {GRAT_LON.map((lo) => { const [x] = proj(lo, 0); return <line key={lo} x1={x} x2={x} y1={y0} y2={y1} />; })}
          {GRAT_LAT.map((la) => { const [, y] = proj(0, la); return <line key={la} x1={x0} x2={x1} y1={y} y2={y} strokeOpacity={la === 0 ? 0.42 : undefined} />; })}
        </g>
        {/* water lines along the coast */}
        {LANDS.map((d, i) => (
          <g key={`w${i}`} fill="none" stroke={C.gold}>
            <path d={d} strokeWidth={30 * u} strokeOpacity={0.05} />
            <path d={d} strokeWidth={14 * u} strokeOpacity={0.09} />
          </g>
        ))}
        {/* land: cast shadow, parchment face, mottle, coast line */}
        {LANDS.map((d, i) => <path key={`s${i}`} d={d} fill={SHADOW} transform={`translate(${12 * u},${16 * u})`} />)}
        {LANDS.map((d, i) => (
          <g key={`l${i}`}>
            <path d={d} fill={tint ?? "url(#landG)"} />
            <path d={d} fill="#000" filter="url(#mottle)" opacity={0.9} />
            <path d={d} fill="none" stroke={C.coast} strokeWidth={3 * u} strokeLinejoin="round" />
          </g>
        ))}
        {/* sea labels */}
        {children}
      </g>
      <defs>
        <radialGradient id="lamp" cx="0.46" cy="0.44" r="0.5">
          <stop offset="0" stopColor="#FFE6B8" stopOpacity="0.34" />
          <stop offset="0.6" stopColor="#FFE6B8" stopOpacity="0.08" />
          <stop offset="1" stopColor="#FFE6B8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#lamp)" style={{ mixBlendMode: "screen" }} />
      {/* foreground cloud wisps, parallax faster than the chart */}
      <g filter="url(#soft)">
        {WISPS.map(([bx, by, w], i) => {
          const x = ((bx - cam.cx * cam.s * 0.35 + t * 14 + 3000) % 1500) - 210;
          const y = by - cam.cy * cam.s * 0.08 % 200;
          return <ellipse key={i} cx={x} cy={y} rx={w} ry={w * 0.22} fill="#E9E4D6" opacity={0.2} />;
        })}
      </g>
      {/* map fold creases */}
      {[360, 720].map((x) => <g key={x}><rect x={x - 1} y={0} width={2} height={1920} fill="#000" opacity={0.22} /><rect x={x + 1} y={0} width={3} height={1920} fill="#FFF3D8" opacity={0.08} /></g>)}
      {[640, 1280].map((y) => <g key={y}><rect x={0} y={y - 1} width={1080} height={2} fill="#000" opacity={0.22} /><rect x={0} y={y + 1} width={1080} height={3} fill="#FFF3D8" opacity={0.08} /></g>)}
      {dim > 0 ? <rect width={1080} height={1920} fill={C.ink} opacity={dim} /> : null}
      <Compass x={900} y={1210} t={t} />
    </svg>
  );
};

export const Compass: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x},${y}) rotate(${Math.sin(t * 0.3) * 3})`} opacity={0.75}>
    <circle r={78} fill="none" stroke={C.gold} strokeOpacity={0.45} strokeWidth={2} />
    <circle r={60} fill="none" stroke={C.gold} strokeOpacity={0.3} strokeWidth={1.5} strokeDasharray="4 6" />
    {[0, 90, 180, 270].map((a) => (
      <path key={a} transform={`rotate(${a})`} d="M0,-74 L13,0 L0,8 L-13,0Z" fill={a === 0 ? C.red : C.gold} fillOpacity={a === 0 ? 0.95 : 0.55} />
    ))}
  </g>
);

/** Self-drawing dashed route (world space). */
export const Route: React.FC<{ d: string; u: number; col?: string; w?: number; dash?: boolean }> = ({ d, u, col = C.red, w = 7, dash = true }) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke="rgba(0,0,0,.5)" strokeWidth={(w + 6) * u} transform={`translate(${4 * u},${6 * u})`} />
    <path d={d} stroke={col} strokeWidth={w * u} strokeDasharray={dash ? `${22 * u} ${12 * u}` : undefined} />
  </g>
);

export const Arrowhead: React.FC<{ p: [number, number]; q: [number, number]; u: number; col?: string }> = ({ p, q, u, col = C.red }) => {
  const a = (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI;
  return <path d="M0,0 L-30,-17 L-22,0 L-30,17Z" fill={col} transform={`translate(${q[0]},${q[1]}) rotate(${a}) scale(${u})`} />;
};

/** Pulsing gold place dot (world space). */
export const Dot: React.FC<{ p: [number, number]; u: number; t: number; col?: string; r?: number }> = ({ p, u, t, col = C.goldHi, r = 11 }) => {
  const k = (t * 0.8) % 1;
  return (
    <g transform={`translate(${p[0]},${p[1]})`}>
      <circle r={(r + 34 * k) * u} fill="none" stroke={col} strokeWidth={3 * u} opacity={1 - k} />
      <circle r={(r + 4) * u} fill={C.ink} />
      <circle r={r * u} fill={col} />
    </g>
  );
};

/** Tristan as a small olive volcano blob on the chart (world space). */
export const MapIsland: React.FC<{ p: [number, number]; u: number; size?: number }> = ({ p, u, size = 1 }) => {
  const r = Math.max(5, 9 * size);
  return (
    <g transform={`translate(${p[0]},${p[1]})`}>
      <circle r={r * 2.4 * u} fill={C.goldHi} opacity={0.14} />
      <circle r={r * 1.25 * u} fill="none" stroke={C.foam} strokeOpacity={0.5} strokeWidth={Math.max(2, r * 0.08) * u} />
      <circle cx={r * 0.25 * u} cy={r * 0.35 * u} r={r * u} fill={SHADOW} filter="url(#cast)" />
      <circle r={r * u} fill={C.olive} stroke={C.coast} strokeWidth={Math.max(2, r * 0.06) * u} />
      <circle cx={-r * 0.3 * u} cy={-r * 0.3 * u} r={r * 0.6 * u} fill={C.oliveLt} opacity={0.55} />
      <circle r={r * 0.32 * u} fill="#EDEBE2" />
      <circle r={r * 0.14 * u} fill={C.ink} />
    </g>
  );
};

// ── Illustrations (design space) ───────────────────────────────────────────────────────

/** Night-chart sky with warm horizon glow (gives the key light a source). */
export const Sky: React.FC<{ top?: string; mid?: string; glow?: string; horizon?: number; id: string }> = ({ top = C.navy, mid = C.navy3, glow = "#E3A35A", horizon = 1150, id }) => (
  <g>
    <defs>
      <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset={String(horizon / 1920 - 0.08)} stopColor={mid} />
        <stop offset={String(horizon / 1920)} stopColor={glow} />
        <stop offset="1" stopColor={glow} />
      </linearGradient>
      <radialGradient id={`sun-${id}`} cx="0.22" cy={String(horizon / 1920 - 0.02)} r="0.55">
        <stop offset="0" stopColor="#FFD08A" stopOpacity="0.55" />
        <stop offset="1" stopColor="#FFD08A" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill={`url(#sky-${id})`} />
    <rect width={1080} height={1920} fill={`url(#sun-${id})`} />
  </g>
);

/** Layered sea band with drifting wave lines. */
export const Sea: React.FC<{ y: number; t: number; col?: string; light?: string }> = ({ y, t, col = C.sea, light = C.seaLt }) => (
  <g>
    <rect x={-40} y={y} width={1160} height={1960 - y} fill={col} />
    <rect x={-40} y={y} width={1160} height={60} fill={light} opacity={0.5} />
    {Array.from({ length: 9 }, (_, i) => {
      const yy = y + 40 + i * i * 9 + i * 22;
      const off = ((t * (14 + i * 3) + hash(i) * 400) % 220) - 220;
      return (
        <path key={i} d={Array.from({ length: 8 }, (_, j) => `M${off + j * 220},${yy} q55,-${6 + i} 110,0`).join("")}
          stroke={C.foam} strokeOpacity={0.12 + i * 0.02} strokeWidth={2 + i * 0.4} fill="none" />
      );
    })}
  </g>
);

/** Side view of the Tristan volcano: plateau cliffs + cone + crater. Origin = sea level centre, ~900 wide. */
export const Volcano: React.FC<{ erupt?: number; t?: number; silhouette?: string; snow?: boolean }> = ({ erupt = 0, t = 0, silhouette, snow = true }) => {
  const cone = "M-470,0 L-430,-120 L-380,-150 L-250,-170 L-170,-230 L-70,-470 L-28,-500 L28,-500 L70,-470 L170,-240 L260,-175 L390,-150 L440,-110 L480,0Z";
  const cliff = "M-470,0 L-430,-120 L-380,-150 L-250,-170 L-230,0Z";
  const ridges = [-120, -60, 0, 60, 120].map((x, i) => `M${x * 0.2},-480 Q${x * 0.9},-300 ${x * 2.4},-${170 - i * 2}`);
  if (silhouette) return <path d={cone} fill={silhouette} />;
  return (
    <g>
      <Lit depth={1.2} draw={(c) => <path d={cone} fill={c ?? C.olive} />} />
      <path d={cone} fill="url(#keylit)" />
      <path d={cliff} fill={C.oliveDk} opacity={0.75} />
      <path d="M230,0 L260,-175 L390,-150 L440,-110 L480,0Z" fill={C.oliveDk} opacity={0.6} />
      {ridges.map((d, i) => <path key={i} d={d} stroke={C.oliveDk} strokeOpacity={0.55} strokeWidth={5} fill="none" />)}
      {snow ? <path d="M-70,-470 L-28,-500 L28,-500 L70,-470 L52,-440 L20,-456 L-6,-436 L-34,-458Z" fill="#EDEBE2" opacity={0.92} /> : null}
      <path d="M-28,-500 L28,-500 L18,-488 L-18,-488Z" fill={C.ink} />
      {erupt > 0 ? (
        <g>
          <path d={`M-22,-494 Q${-60 - erupt * 40},${-600 - erupt * 120} ${-30 + Math.sin(t * 3) * 10},${-760 - erupt * 260} L${40 + Math.sin(t * 2.4) * 12},${-760 - erupt * 260} Q${70 + erupt * 40},${-600 - erupt * 120} 22,-494Z`}
            fill={C.lava} opacity={0.85 * erupt} filter="url(#glow)" />
          <path d="M-18,-490 L-60,-360 L-30,-370 L-90,-220 L-40,-240 L-120,-90" stroke={C.lava} strokeWidth={10} fill="none" opacity={erupt} strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );
};

/** Low lenticular cloud cap. */
export const Cloud: React.FC<{ x: number; y: number; w: number; o?: number }> = ({ x, y, w, o = 0.85 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <path d={ellipse(0, 0, w, w * 0.16)} fill="#DCE3E6" />
    <path d={ellipse(-w * 0.3, -w * 0.08, w * 0.45, w * 0.13)} fill="#EEF2F2" />
    <path d={ellipse(w * 0.25, w * 0.04, w * 0.5, w * 0.1)} fill="#B9C4CB" opacity={0.7} />
  </g>
);

/** 16th-century caravel, origin = waterline centre, ~420 long. */
export const Caravel: React.FC = () => (
  <Lit depth={1} draw={(c) => (
    <g>
      <path d="M-230,-40 L230,-60 L180,30 L-170,30Z" fill={c ?? "#6B4A2E"} />
      <path d="M-230,-40 L-260,-90 L-150,-70Z" fill={c ?? "#5A3D25"} />
      <path d="M170,-58 L240,-110 L250,-60Z" fill={c ?? "#5A3D25"} />
      <rect x={-8} y={-420} width={14} height={380} fill={c ?? "#3E2A19"} />
      <rect x={-148} y={-300} width={11} height={260} fill={c ?? "#3E2A19"} />
      <rect x={120} y={-330} width={11} height={280} fill={c ?? "#3E2A19"} />
      <path d="M-120,-390 Q-10,-360 110,-390 L120,-180 Q0,-150 -125,-180Z" fill={c ?? C.cream} />
      <path d="M-230,-280 L-150,-290 L-150,-120 L-245,-110Z" fill={c ?? "#E9DCC0"} />
      <path d="M125,-320 L230,-150 L125,-150Z" fill={c ?? "#E9DCC0"} />
      {c ? null : <path d="M-14,-340 h28 v80 h-28z M-44,-316 h88 v28 h-88z" fill={C.red} opacity={0.9} />}
      {c ? null : <path d="M-200,-10 L200,-24" stroke="#3E2A19" strokeWidth={6} />}
      <path d="M-2,-420 L60,-405 L-2,-392Z" fill={c ?? C.red} />
    </g>
  )} />
);

/** Faceless person silhouette with rim, origin = feet. h ≈ 260 at scale 1. */
export const Person: React.FC<{ col?: string; v?: number }> = ({ col = C.cream, v = 0 }) => {
  const w = 1 + (v % 3) * 0.06;
  return (
    <g transform={`scale(${w},1)`}>
      <path d={circle(0, -228, 30)} fill={col} />
      <path d="M-46,-188 Q0,-206 46,-188 L56,-80 L38,-80 L34,0 L8,0 L0,-70 L-8,0 L-34,0 L-38,-80 L-56,-80Z" fill={col} />
    </g>
  );
};

/** Stone cottage with roof, origin = ground centre, ~170 wide. */
export const House: React.FC<{ roof?: string; s?: number }> = ({ roof = C.roofRed, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <Lit depth={0.7} draw={(c) => (
      <g>
        <rect x={-85} y={-100} width={170} height={100} fill={c ?? C.stoneLt} />
        <path d="M-100,-96 L0,-170 L100,-96Z" fill={c ?? roof} />
        <rect x={52} y={-190} width={22} height={56} fill={c ?? C.stone} />
      </g>
    )} />
    <rect x={-85} y={-100} width={170} height={100} fill="url(#keylit)" />
    <rect x={-60} y={-70} width={34} height={30} fill="#F6D58C" />
    <rect x={20} y={-70} width={34} height={30} fill="#F6D58C" />
    <rect x={-14} y={-52} width={28} height={52} fill="#4A3A2A" />
  </g>
);

export const Lobster: React.FC = () => (
  <Lit draw={(c) => (
    <g fill={c ?? "#C8442F"}>
      <path d={ellipse(0, 0, 46, 120)} />
      <path d="M-30,-90 L-110,-190 L-80,-200 L-14,-110Z M30,-90 L110,-190 L80,-200 L14,-110Z" />
      <path d={ellipse(-118, -220, 38, 52)} />
      <path d={ellipse(118, -220, 38, 52)} />
      <path d="M-40,110 L-80,170 L0,150 L80,170 L40,110Z" />
      {[-60, -20, 20, 60].map((y) => <path key={y} d={`M-40,${y} L-110,${y + 40} M40,${y} L110,${y + 40}`} stroke={c ?? "#A9341F"} strokeWidth={10} strokeLinecap="round" />)}
    </g>
  )} />
);

export const Potato: React.FC = () => (
  <g>
    <P d="M-120,10 C-130,-70 -30,-110 50,-90 C130,-70 150,10 100,60 C40,110 -110,100 -120,10Z" fill="#C9A267" />
    {[[-50, -20], [30, -40], [60, 30], [-20, 50]].map(([x, y], i) => <path key={i} d={ellipse(x, y, 9, 6)} fill="#8E6B3A" />)}
  </g>
);

/** Postage stamp with perforated edge, mini volcano motif. */
export const Stamp: React.FC = () => {
  const perf = Array.from({ length: 9 }, (_, i) => -120 + i * 30);
  return (
    <g>
      <P d="M-130,-160 H130 V160 H-130Z" fill={C.cream} />
      {perf.map((p) => (
        <g key={p} fill={C.navy2}>
          <circle cx={p} cy={-160} r={9} /><circle cx={p} cy={160} r={9} />
          <circle cx={-130} cy={p * 1.25} r={9} /><circle cx={130} cy={p * 1.25} r={9} />
        </g>
      ))}
      <rect x={-104} y={-134} width={208} height={220} fill="#6E8FA8" />
      <path d="M-104,86 L-104,30 L-40,-10 L-10,-80 L10,-80 L40,-10 L104,30 L104,86Z" fill={C.olive} />
      <text x={0} y={128} textAnchor="middle" fontFamily="Anton" fontSize={30} fill={C.redDk}>TRISTAN</text>
    </g>
  );
};

/** Supply ship (MV), origin = waterline centre, ~460 long. */
export const Ship: React.FC = () => (
  <Lit draw={(c) => (
    <g>
      <path d="M-240,-70 L230,-70 L200,30 L-210,30Z" fill={c ?? "#2C3E57"} />
      <path d="M-240,-70 L230,-70 L224,-48 L-236,-48Z" fill={c ?? C.red} />
      <rect x={60} y={-190} width={130} height={120} fill={c ?? C.cream} />
      <rect x={90} y={-240} width={70} height={52} fill={c ?? C.cream} />
      <rect x={130} y={-290} width={24} height={52} fill={c ?? C.redDk} />
      <rect x={-200} y={-130} width={220} height={60} fill={c ?? "#B9763C"} />
      <rect x={-200} y={-130} width={70} height={60} fill={c ?? "#3F6B8E"} />
      {c ? null : [74, 104, 134, 164].map((x) => <rect key={x} x={x} y={-160} width={18} height={14} fill="#28374D" />)}
    </g>
  )} />
);

/** Small plane icon, origin centre. */
export const Plane: React.FC<{ col?: string }> = ({ col = C.cream }) => (
  <path d="M0,-120 C14,-120 18,-100 18,-80 L18,-30 L120,30 L120,56 L18,24 L18,80 L48,104 L48,124 L0,110 L-48,124 L-48,104 L-18,80 L-18,24 L-120,56 L-120,30 L-18,-30 L-18,-80 C-18,-100 -14,-120 0,-120Z" fill={col} />
);

export { K };
