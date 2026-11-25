// EP03 Sealand — HISTORYMAP pieces (pure SVG, 1080 × 1920 design space). Palette and light model follow the
// HISTORYMAP gold episode (EP16): night chart table, navy ink sea, faded gold graticule, warm parchment land, red routes.
// Every illustrated object is lit by ONE key light from the top-left: long soft cast shadow down-right, a warm rim on
// the lit edge, darker core on the far side, plus surface texture (concrete streaks, rust, rivets, cloth folds).
// Deterministic: seeded hash only, no Math.random.
import React from "react";
import { LANDS, LAND_GB } from "./hmGeo.ts";

export const C = {
  navy: "#141B28", navy2: "#1E2A3C", navy3: "#2A3A52", gold: "#C9A45C", goldHi: "#E8C778", coast: "#8A6A33",
  parch: "#D9C49A", parch2: "#BFA46E", red: "#E0393E", redDk: "#9E2328", cream: "#F4E9D0", ink: "#0E121A",
  sea: "#1C3550", seaLt: "#2F5878", seaDk: "#0F1F33", foam: "#D8E4E8", sand: "#C8A56A", sandDk: "#8E7040",
  concrete: "#8F8A80", concreteLt: "#B8B2A4", concreteDk: "#5E5A53", rust: "#9A5A32", rim: "#FFD28A", skin: "#D9A27C",
  wood: "#6B4A2E", woodDk: "#3E2A19", band: "#3B6B8A", blueTag: "#7CC4F0",
};

export const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ease = (v: number) => { const x = clamp01(v); return x * x * (3 - 2 * x); };
export const easeOut = (v: number) => 1 - Math.pow(1 - clamp01(v), 3);
export const expoOut = (v: number) => { const x = clamp01(v); return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); };
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ellipse = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0Z`;
export const circle = (cx: number, cy: number, r: number) => ellipse(cx, cy, r, r);

export const SHADOW = "rgba(4,6,12,.55)";

export const Defs: React.FC = () => (
  <defs>
    <filter id="cast" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10" /></filter>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="26" /></filter>
    <filter id="blur6" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" /></filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
    <linearGradient id="keylit" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#FFE2A8" stopOpacity="0.34" />
      <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
      <stop offset="1" stopColor="#000000" stopOpacity="0.42" />
    </linearGradient>
    {/* cylinder shading, light from the left */}
    <linearGradient id="cyl" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#FFE2A8" stopOpacity="0.45" />
      <stop offset="0.22" stopColor="#ffffff" stopOpacity="0.12" />
      <stop offset="0.6" stopColor="#000" stopOpacity="0.15" />
      <stop offset="1" stopColor="#000" stopOpacity="0.6" />
    </linearGradient>
    <filter id="mottle" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={3} seed={7} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.12  0 0 0 0.55 -0.12" />
      <feComposite in2="SourceAlpha" operator="in" />
    </filter>
    {/* concrete / steel grit inside the shape */}
    <filter id="grit" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.09 0.025" numOctaves={3} seed={11} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.09  0 0 0 0 0.07  0 0 0 0.9 -0.28" />
      <feComposite in2="SourceAlpha" operator="in" />
    </filter>
    <filter id="cloth" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.25 0.05" numOctaves={2} seed={5} />
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 -0.15" />
      <feComposite in2="SourceAlpha" operator="in" />
    </filter>
  </defs>
);

/** Composite object with one shared cast shadow: draw(null) = real colours, draw(col) = shadow pass. */
export const Lit: React.FC<{ draw: (c: string | null) => React.ReactNode; depth?: number }> = ({ draw, depth = 1 }) => (
  <g>
    <g transform={`translate(${18 * depth},${24 * depth})`} filter="url(#cast)">{draw(SHADOW)}</g>
    {draw(null)}
  </g>
);

/** Rim pass: the silhouette shifted toward the key light, in warm rim colour, drawn under the object. */
export const Rimmed: React.FC<{ draw: (c: string | null) => React.ReactNode; rim?: string; px?: number; shadow?: boolean }> = ({ draw, rim = C.rim, px = 4, shadow = true }) => (
  <g>
    {shadow ? <g transform="translate(16,22)" filter="url(#cast)">{draw(SHADOW)}</g> : null}
    <g transform={`translate(${-px},${-px * 0.7})`}>{draw(rim)}</g>
    {draw(null)}
  </g>
);

// ── Map ─────────────────────────────────────────────────────────────────────────────────
export type Cam = { cx: number; cy: number; s: number; rot?: number };
export const camT = (c: Cam) => `translate(540,960) rotate(${c.rot ?? 0}) scale(${c.s}) translate(${-c.cx},${-c.cy})`;
export const toScreen = (c: Cam, p: readonly [number, number]): [number, number] => [540 + (p[0] - c.cx) * c.s, 960 + (p[1] - c.cy) * c.s];
export const lerpCam = (a: Cam, b: Cam, k: number): Cam => {
  const s = Math.exp(lerp(Math.log(a.s), Math.log(b.s), k));
  return { cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), s, rot: lerp(a.rot ?? 0, b.rot ?? 0, k) };
};

const WISPS: [number, number, number][] = [[100, 420, 260], [900, 1500, 320], [600, 260, 200], [1300, 1180, 280]];

/** Territorial-water band around Britain at `nm` nautical miles: tinted water + red limit line. */
export const Territory: React.FC<{ nm: number; u: number; op?: number; line?: string }> = ({ nm, u, op = 1, line = C.red }) => {
  const d = nm * 1.852 * 2;
  return (
    <g fill="none" strokeLinejoin="round" opacity={op}>
      <path d={LAND_GB} stroke={line} strokeWidth={d + 7 * u} strokeDasharray={`${18 * u} ${10 * u}`} />
      <path d={LAND_GB} stroke="#22476A" strokeWidth={d} />
      <path d={LAND_GB} stroke={C.blueTag} strokeOpacity={0.16} strokeWidth={d} />
    </g>
  );
};

/** Navigation-chart map. `under` = world-space layer under the land (water bands), children = on top of land. */
export const MapView: React.FC<{ cam: Cam; t: number; children?: React.ReactNode; under?: React.ReactNode; dim?: number }> = ({ cam, t, children, under, dim = 0 }) => {
  const u = 1 / cam.s;
  const lon = Array.from({ length: 31 }, (_, i) => -900 + i * 68.7);
  const lat = Array.from({ length: 21 }, (_, i) => -1000 + i * 111.2);
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
        <g stroke={C.gold} strokeOpacity={0.2} strokeWidth={1.6 * u}>
          {lon.map((x) => <line key={`x${x}`} x1={x} x2={x} y1={-1100} y2={1300} />)}
          {lat.map((y) => <line key={`y${y}`} x1={-1000} x2={1200} y1={y} y2={y} />)}
        </g>
        {LANDS.map((d, i) => (
          <g key={`w${i}`} fill="none" stroke={C.gold}>
            <path d={d} strokeWidth={30 * u} strokeOpacity={0.05} />
            <path d={d} strokeWidth={14 * u} strokeOpacity={0.09} />
          </g>
        ))}
        {under}
        {LANDS.map((d, i) => <path key={`s${i}`} d={d} fill={SHADOW} transform={`translate(${12 * u},${16 * u})`} />)}
        {LANDS.map((d, i) => (
          <g key={`l${i}`}>
            <path d={d} fill="url(#landG)" />
            <path d={d} fill="#000" filter="url(#mottle)" opacity={0.9} />
            <path d={d} fill="none" stroke={C.coast} strokeWidth={3 * u} strokeLinejoin="round" />
          </g>
        ))}
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
      <g filter="url(#soft)">
        {WISPS.map(([bx, by, w], i) => {
          const x = ((bx - cam.cx * cam.s * 0.35 + t * 14 + 3000) % 1500) - 210;
          const y = by - ((cam.cy * cam.s * 0.08) % 200);
          return <ellipse key={i} cx={x} cy={y} rx={w} ry={w * 0.22} fill="#E9E4D6" opacity={0.2} />;
        })}
      </g>
      {[360, 720].map((x) => <g key={x}><rect x={x - 1} y={0} width={2} height={1920} fill="#000" opacity={0.22} /><rect x={x + 1} y={0} width={3} height={1920} fill="#FFF3D8" opacity={0.08} /></g>)}
      {[640, 1280].map((y) => <g key={y}><rect x={0} y={y - 1} width={1080} height={2} fill="#000" opacity={0.22} /><rect x={0} y={y + 1} width={1080} height={3} fill="#FFF3D8" opacity={0.08} /></g>)}
      {dim > 0 ? <rect width={1080} height={1920} fill={C.ink} opacity={dim} /> : null}
      <Compass x={910} y={1220} t={t} />
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

/** Self-drawing route (world space). `k` 0..1 = how much is drawn. */
export const Route: React.FC<{ from: readonly [number, number]; to: readonly [number, number]; bend?: number; k: number; u: number; col?: string; w?: number }> = ({ from, to, bend = 0.2, k, u, col = C.red, w = 7 }) => {
  if (k <= 0) return null;
  const mx = (from[0] + to[0]) / 2 - (to[1] - from[1]) * bend;
  const my = (from[1] + to[1]) / 2 + (to[0] - from[0]) * bend;
  const d = `M${from[0]},${from[1]} Q${mx},${my} ${to[0]},${to[1]}`;
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]) * 1.15;
  const kk = clamp01(k);
  // arrowhead at the drawn tip (quadratic bezier point + tangent)
  const qx = (1 - kk) * (1 - kk) * from[0] + 2 * (1 - kk) * kk * mx + kk * kk * to[0];
  const qy = (1 - kk) * (1 - kk) * from[1] + 2 * (1 - kk) * kk * my + kk * kk * to[1];
  const tx = 2 * (1 - kk) * (mx - from[0]) + 2 * kk * (to[0] - mx);
  const ty = 2 * (1 - kk) * (my - from[1]) + 2 * kk * (to[1] - my);
  const a = (Math.atan2(ty, tx) * 180) / Math.PI;
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke="rgba(0,0,0,.5)" strokeWidth={(w + 6) * u} transform={`translate(${4 * u},${6 * u})`} pathLength={1} strokeDasharray={`${kk} 1`} />
      <path d={d} stroke={col} strokeWidth={w * u} pathLength={1} strokeDasharray={`${kk} 1`} />
      <path d={d} stroke={C.ink} strokeOpacity={0.35} strokeWidth={w * 0.3 * u} strokeDasharray={`${len * 0.012} ${len * 0.012}`} />
      <path d="M0,0 L-30,-17 L-22,0 L-30,17Z" fill={col} stroke="none" transform={`translate(${qx},${qy}) rotate(${a}) scale(${u * 1.2})`} />
    </g>
  );
};

/** Pulsing place dot (world space). */
export const Dot: React.FC<{ p: readonly [number, number]; u: number; t: number; col?: string; r?: number }> = ({ p, u, t, col = C.goldHi, r = 11 }) => {
  const k = (t * 0.8) % 1;
  return (
    <g transform={`translate(${p[0]},${p[1]})`}>
      <circle r={(r + 34 * k) * u} fill="none" stroke={col} strokeWidth={3 * u} opacity={1 - k} />
      <circle r={(r + 4) * u} fill={C.ink} />
      <circle r={r * u} fill={col} />
    </g>
  );
};

/** Sealand as a tiny fort icon on the chart (screen-size constant). */
export const FortPin: React.FC<{ p: readonly [number, number]; u: number; t: number; col?: string; size?: number }> = ({ p, u, t, col = C.red, size = 1 }) => {
  const k = (t * 0.7) % 1;
  const s = u * size;
  return (
    <g transform={`translate(${p[0]},${p[1]}) scale(${s})`}>
      <circle r={30 + 60 * k} fill="none" stroke={col} strokeWidth={4} opacity={1 - k} />
      <circle r={30} fill={C.ink} opacity={0.85} />
      <rect x={-18} y={-10} width={36} height={12} fill={C.concreteLt} />
      <rect x={-14} y={2} width={9} height={14} fill={C.concrete} />
      <rect x={5} y={2} width={9} height={14} fill={C.concrete} />
      <rect x={4} y={-28} width={3} height={18} fill={C.cream} />
      <path d="M7,-28 h14 v9 h-14z" fill={col} />
    </g>
  );
};

// ── Sky / sea ──────────────────────────────────────────────────────────────────────────
export const Sky: React.FC<{ top?: string; mid?: string; glow?: string; horizon?: number; id: string; sunX?: number }> = ({ top = C.navy, mid = C.navy3, glow = "#E3A35A", horizon = 1150, id, sunX = 0.22 }) => (
  <g>
    <defs>
      <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset={String(horizon / 1920 - 0.1)} stopColor={mid} />
        <stop offset={String(horizon / 1920)} stopColor={glow} />
        <stop offset="1" stopColor={glow} />
      </linearGradient>
      <radialGradient id={`sun-${id}`} cx={String(sunX)} cy={String(horizon / 1920 - 0.02)} r="0.55">
        <stop offset="0" stopColor="#FFD08A" stopOpacity="0.6" />
        <stop offset="1" stopColor="#FFD08A" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill={`url(#sky-${id})`} />
    <rect width={1080} height={1920} fill={`url(#sun-${id})`} />
  </g>
);

export const Sea: React.FC<{ y: number; t: number; col?: string; light?: string; bottom?: number }> = ({ y, t, col = C.sea, light = C.seaLt, bottom = 1960 }) => (
  <g>
    <rect x={-40} y={y} width={1160} height={bottom - y} fill={col} />
    <rect x={-40} y={y} width={1160} height={50} fill={light} opacity={0.55} />
    {Array.from({ length: 9 }, (_, i) => {
      const yy = y + 30 + i * i * 9 + i * 22;
      if (yy > bottom) return null;
      const off = ((t * (14 + i * 3) + hash(i) * 400) % 220) - 220;
      return (
        <path key={i} d={Array.from({ length: 8 }, (_, j) => `M${off + j * 220},${yy} q55,-${6 + i} 110,0`).join("")}
          stroke={C.foam} strokeOpacity={0.12 + i * 0.02} strokeWidth={2 + i * 0.4} fill="none" />
      );
    })}
  </g>
);

/** Near foreground wave crests (blurred) that fill the bottom third. */
export const FGWaves: React.FC<{ t: number; y?: number; col?: string }> = ({ t, y = 1600, col = "#10243A" }) => (
  <g filter="url(#blur6)">
    {[0, 1, 2].map((i) => {
      const yy = y + i * 110;
      const off = ((t * (40 + i * 18) + i * 170) % 360) - 360;
      const d = `M-40,1960 L-40,${yy} ` + Array.from({ length: 6 }, (_, j) => `Q${off + j * 360 + 90},${yy - 50 - i * 10} ${off + j * 360 + 180},${yy} T${off + j * 360 + 360},${yy}`).join(" ") + " L1120,1960Z";
      return (
        <g key={i}>
          <path d={d} fill={col} opacity={0.75 + i * 0.1} />
          <path d={`M${off - 360},${yy - 4} ` + Array.from({ length: 6 }, (_, j) => `Q${off + j * 360 + 90},${yy - 54 - i * 10} ${off + j * 360 + 180},${yy - 4}`).join(" M")} stroke={C.foam} strokeOpacity={0.25} strokeWidth={4} fill="none" />
        </g>
      );
    })}
  </g>
);

// ── Fort (Roughs Tower) ────────────────────────────────────────────────────────────────
/**
 * Side elevation of the Maunsell naval fort. Origin = sea level, centre. Scale 1 ≈ 440 px wide deck.
 * Above water: two concrete towers, steel deck, huts, mast, gun. Below water (y > 0): towers continue to a pontoon
 * base (drawn so the cross-section scenes can show it sitting on the sandbank). `under` hides the underwater part.
 */
export const Fort: React.FC<{ flag?: number; rust?: number; lights?: number; under?: boolean; helipad?: boolean; t?: number; gun?: boolean; lift?: number }> = ({ flag = 0, rust = 0.4, lights = 0, under = false, helipad = false, t = 0, gun = true, lift = 0 }) => {
  const towers = [-115, 115];
  const tw = 96;
  const draw = (c: string | null) => (
    <g>
      {under ? <rect x={-280} y={210} width={560} height={70} rx={8} fill={c ?? C.concreteDk} /> : null}
      {towers.map((x) => <rect key={x} x={x - tw / 2} y={-262} width={tw} height={under ? 472 : 262} fill={c ?? C.concrete} />)}
      <g transform={`translate(0,${-lift})`}>
      <rect x={-235} y={-300} width={470} height={42} fill={c ?? "#5B5148"} />
      <rect x={-250} y={-310} width={500} height={14} fill={c ?? "#3F3832"} />
      <rect x={-200} y={-388} width={170} height={80} fill={c ?? "#A69C8A"} />
      <rect x={10} y={-370} width={150} height={62} fill={c ?? "#8E8474"} />
      <path d="M-210,-388 L-115,-418 L-20,-388Z" fill={c ?? "#6E3E2C"} />
      {gun ? <path d={`${ellipse(150, -372, 40, 26)} M150,-380 L245,-420 L250,-410 L156,-370Z`} fill={c ?? "#4C4A44"} /> : null}
      <rect x={-140} y={-560} width={8} height={174} fill={c ?? "#2C2A27"} />
      <path d="M-178,-520 L-96,-520 M-170,-480 L-104,-480" stroke={c ?? "#2C2A27"} strokeWidth={5} />
      </g>
    </g>
  );
  return (
    <g>
      <Lit depth={1.1} draw={draw} />
      {/* tower shading + concrete grit + rust streaks */}
      {towers.map((x, i) => (
        <g key={x}>
          <rect x={x - tw / 2} y={-262} width={tw} height={under ? 472 : 262} fill="url(#cyl)" />
          <rect x={x - tw / 2} y={-262} width={tw} height={under ? 472 : 262} fill="#000" filter="url(#grit)" />
          {Array.from({ length: 5 }, (_, j) => (
            <rect key={j} x={x - tw / 2 + 10 + hash(i * 9 + j) * (tw - 20)} y={-250 + hash(j + 3) * 30} width={3 + hash(j) * 4} height={60 + hash(j * 7 + i) * 140} fill={C.rust} opacity={rust * (0.35 + hash(j + i) * 0.4)} />
          ))}
          {[-200, -120, -40].map((y) => <rect key={y} x={x - tw / 2} y={y} width={tw} height={4} fill="#000" opacity={0.25} />)}
          <rect x={x - tw / 2} y={-262} width={5} height={under ? 472 : 262} fill={C.rim} opacity={0.55} />
        </g>
      ))}
      <g transform={`translate(0,${-lift})`}>
      {/* deck girder rivets + rim */}
      {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={-226 + i * 21.5} cy={-279} r={3.2} fill="#2A241F" />)}
      <rect x={-235} y={-300} width={470} height={42} fill="url(#keylit)" />
      <rect x={-250} y={-310} width={500} height={4} fill={C.rim} opacity={0.7} />
      {/* huts: lit faces + windows */}
      <rect x={-200} y={-388} width={170} height={80} fill="url(#keylit)" />
      <rect x={-200} y={-388} width={170} height={80} fill="#000" filter="url(#grit)" opacity={0.6} />
      <rect x={10} y={-370} width={150} height={62} fill="url(#keylit)" />
      {[-178, -128, -78].map((x) => <rect key={x} x={x} y={-370} width={30} height={26} fill={lights > 0 ? "#F6D58C" : "#2B3340"} opacity={lights > 0 ? 0.4 + 0.6 * lights : 1} />)}
      {[34, 84].map((x) => <rect key={x} x={x} y={-354} width={30} height={22} fill={lights > 0 ? "#F6D58C" : "#2B3340"} opacity={lights > 0 ? 0.4 + 0.6 * lights : 1} />)}
      <rect x={-200} y={-388} width={4} height={80} fill={C.rim} opacity={0.6} />
      {/* railing */}
      <path d={`M-250,-312 L-250,-336 M250,-312 L250,-336 M-250,-336 L-200,-336 M160,-336 L250,-336`} stroke="#2C2A27" strokeWidth={4} />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={170 + i * 14} y={-336} width={3} height={24} fill="#2C2A27" />)}
      {helipad ? <rect x={-30} y={-316} width={60} height={6} fill="#E9E2CF" /> : null}
      {/* flag: Sealand red / white diagonal / black */}
      {flag > 0 ? <SealandFlag x={-132} y={-560 + (1 - flag) * 150} w={110} t={t} /> : null}
      </g>
      {/* waterline foam */}
      {towers.map((x) => <path key={x} d={ellipse(x, 0, tw * 0.75, 10)} fill={C.foam} opacity={0.45} />)}
    </g>
  );
};

/** Sealand flag (red upper hoist, black lower fly, white diagonal), waving. Origin = top of hoist. */
export const SealandFlag: React.FC<{ x: number; y: number; w: number; t: number }> = ({ x, y, w, t }) => {
  const h = w * 0.62;
  const wv = (k: number) => Math.sin(t * 5 + k * 3) * w * 0.05 * k;
  const pts = (yy: number) => [0, 0.33, 0.66, 1].map((k) => `${x + k * w},${y + yy + wv(k)}`);
  const top = pts(0), bot = pts(h);
  const outline = `M${top.join(" L")} L${[...bot].reverse().join(" L")}Z`;
  return (
    <g>
      <defs><clipPath id={`fl${Math.round(x)}${Math.round(w)}`}><path d={outline} /></clipPath></defs>
      <g clipPath={`url(#fl${Math.round(x)}${Math.round(w)})`}>
        <rect x={x - 5} y={y - 20} width={w + 10} height={h + 40} fill="#111" />
        <path d={`M${x - 5},${y - 20} L${x + w + 5},${y - 20} L${x - 5},${y + h + 20}Z`} fill="#C8202A" />
        <path d={`M${x + w + 5},${y - 20 - h * 0.1} L${x - 5},${y + h + 20 - h * 0.1}`} stroke="#F4F1EA" strokeWidth={h * 0.2} transform={`translate(0,${h * 0.06})`} />
      </g>
      <path d={outline} fill="url(#keylit)" />
    </g>
  );
};

/** Top-down (aerial) view of the fort deck, origin = deck centre, ~520 × 300 at scale 1. */
export const FortTop: React.FC<{ t: number; lights?: number; label?: string }> = ({ t, lights = 0, label }) => (
  <g>
    {/* wake / ripples around the two towers */}
    {[0, 1, 2].map((i) => {
      const k = ((t * 0.35 + i / 3) % 1);
      return <path key={i} d={ellipse(0, 10, 300 + k * 240, 190 + k * 150)} fill="none" stroke={C.foam} strokeWidth={4} opacity={0.35 * (1 - k)} />;
    })}
    <path d={ellipse(40, 70, 330, 170)} fill="#000" opacity={0.35} filter="url(#soft)" />
    <Lit depth={1.5} draw={(c) => (
      <g>
        <rect x={-260} y={-150} width={520} height={300} fill={c ?? "#6A5F55"} />
        <rect x={-230} y={-120} width={210} height={130} fill={c ?? "#A69C8A"} />
        <rect x={40} y={-130} width={180} height={110} fill={c ?? "#8E8474"} />
      </g>
    )} />
    <rect x={-260} y={-150} width={520} height={300} fill="#000" filter="url(#grit)" opacity={0.8} />
    <rect x={-260} y={-150} width={520} height={300} fill="url(#keylit)" />
    {/* deck plates */}
    {[-170, -85, 0, 85, 170].map((x) => <rect key={x} x={x} y={-150} width={2} height={300} fill="#000" opacity={0.25} />)}
    {/* helipad on the right half */}
    <circle cx={130} cy={70} r={68} fill="#3E3A36" stroke="#E9E2CF" strokeWidth={6} />
    <path d="M106,42 h14 v22 h20 v-22 h14 v56 h-14 v-22 h-20 v22 h-14z" fill="#E9E2CF" />
    {/* hut roofs with ridge light */}
    <rect x={-230} y={-120} width={210} height={130} fill="url(#keylit)" />
    <rect x={-230} y={-120} width={210} height={6} fill={C.rim} opacity={0.7} />
    <rect x={40} y={-130} width={180} height={6} fill={C.rim} opacity={0.7} />
    <rect x={-230} y={-120} width={6} height={130} fill={C.rim} opacity={0.5} />
    {lights > 0 ? [[-200, 30], [-120, 30], [220, -40]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={10} fill="#FFD98A" opacity={lights} filter="url(#glow)" />) : null}
    <rect x={-260} y={-150} width={520} height={5} fill={C.rim} opacity={0.6} />
    <rect x={-260} y={-150} width={5} height={300} fill={C.rim} opacity={0.5} />
    {label ? <text x={-120} y={-26} textAnchor="middle" fontFamily="Anton" fontSize={34} letterSpacing={4} fill="#2A241F" opacity={0.8}>{label}</text> : null}
    <SealandFlag x={-250} y={-230} w={90} t={t} />
    <rect x={-252} y={-232} width={5} height={90} fill="#222" />
  </g>
);

// ── People (rimmed, textured, faceless) ────────────────────────────────────────────────
export type Outfit = { coat: string; trousers?: string; hat?: "beret" | "cap" | "none" | "helmet" | "wig"; prop?: "rifle" | "briefcase" | "gavel" | "none"; hair?: string };

/** Standing figure ~300 px tall at scale 1, origin = feet. Rim on the key-light side, cloth texture, collar, hands. */
export const Figure: React.FC<{ o: Outfit; pose?: number; arm?: number; flip?: boolean; s?: number; rimCol?: string }> = ({ o, pose = 0, arm = 0, flip = false, s = 1, rimCol = C.rim }) => {
  const legL = Math.sin(pose) * 14, legR = -legL;
  const armA = -arm * 110; // raise the right arm (degrees)
  const draw = (c: string | null) => (
    <g>
      {/* legs */}
      <path d={`M-30,-140 L${-34 + legL},0 L${-8 + legL},0 L-2,-120 L2,-120 L${8 + legR},0 L${34 + legR},0 L30,-140Z`} fill={c ?? (o.trousers ?? "#2B2F36")} />
      {/* torso / coat */}
      <path d="M-52,-246 Q0,-268 52,-246 L60,-128 L-60,-128Z" fill={c ?? o.coat} />
      {/* left arm */}
      <path d="M-50,-240 L-70,-150 L-56,-146 L-36,-226Z" fill={c ?? o.coat} />
      {/* right arm (pivot at shoulder) */}
      <g transform={`rotate(${armA},46,-236)`}>
        <path d="M36,-240 L70,-150 L56,-146 L30,-222Z" fill={c ?? o.coat} />
        <circle cx={64} cy={-146} r={11} fill={c ?? C.skin} />
        {o.prop === "gavel" ? <path d="M60,-150 L60,-200 M44,-206 h34 v-18 h-34z" stroke={c ?? C.woodDk} strokeWidth={8} fill={c ?? C.wood} /> : null}
      </g>
      <circle cx={-64} cy={-146} r={11} fill={c ?? C.skin} />
      {/* head */}
      <rect x={-12} y={-268} width={24} height={20} fill={c ?? C.skin} />
      <path d={ellipse(0, -294, 30, 34)} fill={c ?? C.skin} />
      {o.hat === "beret" ? <path d="M-34,-306 Q-6,-344 34,-312 L30,-300 L-32,-298Z" fill={c ?? "#1D1F24"} /> : null}
      {o.hat === "cap" ? <path d="M-32,-304 Q0,-340 32,-304 L52,-300 L-32,-298Z" fill={c ?? "#2D3A4E"} /> : null}
      {o.hat === "helmet" ? <path d="M-36,-298 Q0,-352 36,-298Z" fill={c ?? "#3E4A36"} /> : null}
      {o.hat === "wig" ? <path d="M-38,-280 Q-44,-336 0,-334 Q44,-336 38,-280 L40,-246 L26,-250 L28,-286 Q0,-300 -28,-286 L-26,-250 L-40,-246Z" fill={c ?? "#ECE7DC"} /> : null}
      {o.hat === "none" || !o.hat ? <path d="M-30,-300 Q0,-336 30,-300 Q24,-318 0,-322 Q-24,-318 -30,-300Z" fill={c ?? (o.hair ?? "#2A1E16")} /> : null}
      {o.prop === "rifle" ? <path d="M-80,-120 L40,-250 L48,-243 L-72,-112Z" fill={c ?? "#2A2420"} /> : null}
      {o.prop === "briefcase" ? <rect x={-86} y={-150} width={46} height={36} rx={4} fill={c ?? "#4A2E1C"} /> : null}
    </g>
  );
  return (
    <g transform={`scale(${(flip ? -1 : 1) * s},${s})`}>
      <Rimmed draw={draw} rim={rimCol} px={5} />
      {/* cloth texture + shading on coat, collar, buttons */}
      <path d="M-52,-246 Q0,-268 52,-246 L60,-128 L-60,-128Z" fill="#000" filter="url(#cloth)" />
      <path d="M-52,-246 Q0,-268 52,-246 L60,-128 L-60,-128Z" fill="url(#keylit)" />
      <path d="M-18,-252 L0,-214 L18,-252" stroke="#000" strokeOpacity={0.35} strokeWidth={5} fill="none" />
      <path d="M0,-214 L0,-130" stroke="#000" strokeOpacity={0.3} strokeWidth={3} />
      {[-196, -172, -148].map((y) => <circle key={y} cx={7} cy={y} r={3.5} fill="#000" opacity={0.4} />)}
      <path d={ellipse(0, -294, 30, 34)} fill="url(#keylit)" />
    </g>
  );
};

// ── Vessels / aircraft ─────────────────────────────────────────────────────────────────
/** Harbour tug (side), origin = waterline centre, ~300 long. */
export const Tug: React.FC<{ smoke?: number; t?: number }> = ({ smoke = 1, t = 0 }) => (
  <g>
    {smoke > 0 ? [0, 1, 2, 3].map((i) => {
      const k = ((t * 0.6 + i / 4) % 1);
      return <circle key={i} cx={30 - k * 160} cy={-190 - k * 120} r={18 + k * 40} fill="#5A5652" opacity={(1 - k) * 0.5 * smoke} filter="url(#blur6)" />;
    }) : null}
    <Lit draw={(c) => (
      <g>
        <path d="M-160,-50 L150,-60 Q170,-30 140,20 L-140,20 Q-170,-10 -160,-50Z" fill={c ?? "#25313F"} />
        <path d="M-160,-50 L150,-60 L148,-44 L-158,-36Z" fill={c ?? C.red} />
        <rect x={-60} y={-130} width={120} height={76} fill={c ?? C.cream} />
        <rect x={10} y={-200} width={36} height={72} fill={c ?? "#2B2B2B"} />
        <rect x={10} y={-200} width={36} height={14} fill={c ?? C.red} />
      </g>
    )} />
    <rect x={-60} y={-130} width={120} height={76} fill="url(#keylit)" />
    {[-44, -10, 24].map((x) => <rect key={x} x={x} y={-112} width={22} height={18} fill="#2B3340" />)}
    <rect x={-60} y={-130} width={4} height={76} fill={C.rim} opacity={0.7} />
  </g>
);

/** Small 1960s motor launch, origin = waterline centre, ~260 long. */
export const Launch: React.FC = () => (
  <g>
    <Lit draw={(c) => (
      <g>
        <path d="M-130,-30 L140,-40 Q150,-10 120,16 L-110,16 Q-136,0 -130,-30Z" fill={c ?? "#E9E2CF"} />
        <path d="M-130,-30 L140,-40 L139,-30 L-129,-21Z" fill={c ?? "#2D5C80"} />
        <path d="M-40,-30 L-20,-90 L60,-90 L70,-34Z" fill={c ?? "#C9C0AC"} />
      </g>
    )} />
    <path d="M-30,-82 L-16,-82 L-26,-40 L-36,-40Z M0,-82 L50,-82 L56,-40 L-6,-40Z" fill="#2B3B50" />
    <path d="M-130,-30 L140,-40 Q150,-10 120,16 L-110,16 Q-136,0 -130,-30Z" fill="url(#keylit)" />
  </g>
);

/** Grey patrol vessel, origin = waterline centre, ~520 long. */
export const Patrol: React.FC = () => (
  <g>
    <Lit draw={(c) => (
      <g>
        <path d="M-260,-60 L250,-70 L220,26 L-232,26Z" fill={c ?? "#6E7680"} />
        <rect x={-60} y={-170} width={170} height={104} fill={c ?? "#8A929C"} />
        <rect x={-20} y={-230} width={80} height={62} fill={c ?? "#8A929C"} />
        <rect x={10} y={-320} width={10} height={92} fill={c ?? "#3A3F46"} />
        <rect x={-200} y={-100} width={60} height={40} fill={c ?? "#5B626B"} />
      </g>
    )} />
    <rect x={-60} y={-170} width={170} height={104} fill="url(#keylit)" />
    {[-40, 0, 40, 80].map((x) => <rect key={x} x={x} y={-150} width={22} height={16} fill="#2B3340" />)}
    <text x={-150} y={-12} fontFamily="Anton" fontSize={30} fill="#E9E9E9" opacity={0.85}>HMS</text>
  </g>
);

/** Helicopter side view, origin = centre, ~360 long. `rot` rotor phase. */
export const Heli: React.FC<{ t: number }> = ({ t }) => {
  const r = Math.abs(Math.sin(t * 40)) * 0.8 + 0.2;
  return (
    <g>
      <Lit depth={1.6} draw={(c) => (
        <g>
          <path d="M-110,-40 Q-60,-90 40,-80 Q110,-70 110,-10 Q100,30 20,30 L-100,30 Q-130,10 -110,-40Z" fill={c ?? "#3D4A3A"} />
          <path d="M100,-30 L280,-50 L280,-34 L104,-6Z" fill={c ?? "#3D4A3A"} />
          <path d="M268,-90 L288,-90 L284,-20 L270,-20Z" fill={c ?? "#3D4A3A"} />
          <path d="M-90,50 L80,50 M-60,30 L-70,50 M50,30 L60,50" stroke={c ?? "#222"} strokeWidth={6} />
        </g>
      )} />
      <path d="M-80,-30 Q-50,-74 20,-70 L20,-20 L-90,-10Z" fill="#9CC3D8" opacity={0.75} />
      <path d="M-110,-40 Q-60,-90 40,-80 Q110,-70 110,-10 Q100,30 20,30 L-100,30 Q-130,10 -110,-40Z" fill="url(#keylit)" />
      <rect x={-4} y={-100} width={10} height={20} fill="#222" />
      <ellipse cx={0} cy={-102} rx={230 * r} ry={7} fill="#222" opacity={0.55} />
      <circle cx={278} cy={-56} r={34} fill="#222" opacity={0.25} />
    </g>
  );
};

/** WWII twin-engine mine-laying bomber (top view, pointing right), ~200 wide at scale 1. */
export const Bomber: React.FC<{ col?: string }> = ({ col = "#2B2F2A" }) => (
  <g>
    <path d="M-80,0 L90,0 M-70,-6 L80,-6" stroke={col} strokeWidth={0} />
    <path d="M90,0 Q70,-12 -70,-9 L-90,-24 L-100,-24 L-92,0 L-100,24 L-90,24 L-70,9 Q70,12 90,0Z" fill={col} />
    <path d="M20,-6 L-20,-100 L-2,-100 L40,-6Z M20,6 L-20,100 L-2,100 L40,6Z" fill={col} />
    <rect x={2} y={-58} width={30} height={14} rx={6} fill={col} />
    <rect x={2} y={44} width={30} height={14} rx={6} fill={col} />
    <path d="M-10,-80 l8,-6 l0,12z M-10,80 l8,6 l0,-12z" fill="#E9E9E9" />
  </g>
);

/** Naval mine (sphere with horns). */
export const Mine: React.FC<{ r?: number }> = ({ r = 22 }) => (
  <g>
    {[0, 60, 120, 180, 240, 300].map((a) => <rect key={a} x={-3} y={-r - 10} width={6} height={12} fill="#1E1E1E" transform={`rotate(${a})`} />)}
    <circle r={r} fill="#2A2A2A" />
    <circle cx={-r * 0.35} cy={-r * 0.35} r={r * 0.35} fill="#6A6A6A" opacity={0.6} />
  </g>
);
