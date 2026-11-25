// EP03 Sealand — AUDIRA Fakta Dunia. Style CHRONICLE (cinematic history documentary), Remotion 2D (React + SVG).
// One set per narrative beat (1943 → 1967 → 1968 → 1978 → 1987 → kini). Every cue is anchored to a VO word
// (words.ts = Cartesia timings). Layout authored in 1080 × 1920 and scaled to the composition size.
// Lighting doctrine (CHRONICLE memory): directional key light per set (sun / searchlight / window / lamp),
// silhouettes get a warm rim on the light side, haze between layers, FG occluders blurred, grain on top.
import React, { createContext, useContext } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { AudiraSignature, signatureAnchorAt } from "../../brand/AudiraSignature.tsx";
import { WORDS } from "./words.ts";

export const CHRONICLE_SECONDS = 91;
const OUTRO_SECONDS = 2.6;
const END_VO = CHRONICLE_SECONDS - OUTRO_SECONDS;
const W0 = 1080, H0 = 1920;

// ---------- fonts ----------
if (typeof document !== "undefined") {
  const h = delayRender("chronicle fonts");
  Promise.all(
    [
      ["Anton", "fonts/Anton-Regular.ttf"],
      ["BarlowX", "fonts/BarlowCondensed-ExtraBold.ttf"],
      ["Barlow", "fonts/BarlowCondensed-SemiBold.ttf"],
      ["Jakarta", "fonts/PlusJakartaSans_800ExtraBold.ttf"],
      ["JakartaB", "fonts/PlusJakartaSans_700Bold.ttf"],
      ["Serif", "fonts/InstrumentSerif-Italic.ttf"],
    ].map(async ([fam, file]) => {
      const f = new FontFace(fam, `url(${staticFile(file)})`);
      await f.load();
      (document.fonts as unknown as { add(f: FontFace): void }).add(f);
    }),
  ).then(() => continueRender(h), () => continueRender(h));
}

// ---------- palette ----------
const C = { cream: "#F6E9CF", gold: "#F5B54A", red: "#D9503A", blue: "#7CC4F0", ink: "#0B0C10", dim: "#C9B48E", rim: "#FFC877" };

// ---------- time helpers ----------
const T = (word: string, n = 0): number => {
  let k = 0;
  for (const w of WORDS) if (w.t === word && k++ === n) return w.s;
  throw new Error(`word not found: ${word} #${n}`);
};
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EO = Easing.bezier(0.16, 1, 0.3, 1);
const EIO = Easing.bezier(0.65, 0, 0.35, 1);
const r = (t: number, a: number, b: number, from = 0, to = 1, e = EO) => interpolate(t, [a, b], [from, to], { ...cl, easing: e });
const Ctx = createContext({ t: 0, fps: 30 });
const useT = () => useContext(Ctx);
const pop = (t: number, at: number, fps: number, damping = 12) =>
  t < at ? 0 : spring({ frame: (t - at) * fps, fps, config: { damping, stiffness: 190, mass: 0.75 } });
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// =====================================================================================
// SET PIECES
// =====================================================================================
type Mood = { top: string; mid: string; low: string; sun: string; fog: string; sea1: string; sea2: string; sea3: string };
const MOODS: Record<string, Mood> = {
  dusk: { top: "#1C2436", mid: "#A9532F", low: "#F0A65A", sun: "#FFE0A0", fog: "#E08C52", sea1: "#3A2A2E", sea2: "#22202A", sea3: "#121218" },
  war: { top: "#05080F", mid: "#16233A", low: "#3A4A66", sun: "#D8E6FF", fog: "#30405C", sea1: "#18243A", sea2: "#0F1828", sea3: "#080C16" },
  grey: { top: "#3A4552", mid: "#7D8790", low: "#C9C2AE", sun: "#FFF4D8", fog: "#B8B2A0", sea1: "#56606A", sea2: "#3C454F", sea3: "#262D36" },
  fogdawn: { top: "#5D6670", mid: "#9A9C98", low: "#D8CDB4", sun: "#FFF0CC", fog: "#CFC7B2", sea1: "#6F7578", sea2: "#545B60", sea3: "#3A4046" },
  gold: { top: "#2B2038", mid: "#B85E34", low: "#FFBF6A", sun: "#FFF2C4", fog: "#F0A35E", sea1: "#5A3A32", sea2: "#352428", sea3: "#1A1418" },
  storm: { top: "#06070B", mid: "#1E1A24", low: "#4A3630", sun: "#FFB070", fog: "#3A2C2C", sea1: "#1E1C22", sea2: "#131217", sea3: "#09090C" },
  bluehour: { top: "#0A1026", mid: "#2E3866", low: "#D27E62", sun: "#FFC9A0", fog: "#6A5A7A", sea1: "#262A44", sea2: "#181C30", sea3: "#0C0E1A" },
  morning: { top: "#2E4A66", mid: "#8FA2AE", low: "#F2D2A0", sun: "#FFF6DA", fog: "#E6CDA6", sea1: "#3F5A6C", sea2: "#2C4252", sea3: "#1A2A36" },
};

const Sky: React.FC<{ id: string; m: Mood; sx: number; sy: number; sr?: number }> = ({ id, m, sx, sy, sr = 230 }) => (
  <svg width={W0} height={H0} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={m.top} />
        <stop offset="0.5" stopColor={m.mid} />
        <stop offset="0.72" stopColor={m.low} />
        <stop offset="1" stopColor={m.low} />
      </linearGradient>
      <radialGradient id={`sun${id}`}>
        <stop offset="0" stopColor={m.sun} stopOpacity="1" />
        <stop offset="0.22" stopColor={m.sun} stopOpacity="0.55" />
        <stop offset="1" stopColor={m.sun} stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width={W0} height={H0} fill={`url(#sky${id})`} />
    <circle cx={sx} cy={sy} r={sr * 2.6} fill={`url(#sun${id})`} />
    <circle cx={sx} cy={sy} r={sr * 0.3} fill={m.sun} opacity={0.92} />
  </svg>
);

// Cloud banks: soft layered ellipses lit from below by the key light.
const Clouds: React.FC<{ y: number; color: string; lit: string; seed: number; drift?: number; opacity?: number }> = ({ y, color, lit, seed, drift = 6, opacity = 0.85 }) => {
  const { t } = useT();
  const R = rng(seed);
  const els: React.ReactNode[] = [];
  for (let i = 0; i < 9; i++) {
    const cx = ((R() * 1400 + t * drift * (0.6 + R())) % 1500) - 210;
    const cy = y + R() * 160;
    const rx = 160 + R() * 220, ry = 34 + R() * 40;
    els.push(
      <g key={i}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={color} />
        <ellipse cx={cx} cy={cy + ry * 0.55} rx={rx * 0.85} ry={ry * 0.35} fill={lit} opacity={0.55} />
      </g>,
    );
  }
  return <svg width={W0} height={H0} style={{ position: "absolute", inset: 0, opacity, filter: "blur(3px)" }}>{els}</svg>;
};

const GodRays: React.FC<{ x: number; y: number; color: string; from: number; to: number; len?: number; n?: number; opacity?: number; id: string }> = ({ x, y, color, from, to, len = 2200, n = 7, opacity = 0.32, id }) => {
  const { t } = useT();
  const beams: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a0 = from + ((to - from) * i) / n + Math.sin(t * 0.4 + i) * 1.2;
    const a1 = a0 + ((to - from) / n) * 0.45;
    const p = (a: number) => `${x + Math.cos((a * Math.PI) / 180) * len},${y + Math.sin((a * Math.PI) / 180) * len}`;
    beams.push(<polygon key={i} points={`${x},${y} ${p(a0)} ${p(a1)}`} fill={`url(#gr${id})`} opacity={0.5 + 0.5 * Math.sin(t * 0.7 + i * 1.7) ** 2} />);
  }
  return (
    <svg width={W0} height={H0} style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity, filter: "blur(6px)" }}>
      <defs>
        <radialGradient id={`gr${id}`} cx={x} cy={y} r={len} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={color} stopOpacity="0.95" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {beams}
    </svg>
  );
};

const Fog: React.FC<{ color: string; y: number; h?: number; opacity?: number }> = ({ color, y, h = 380, opacity = 0.5 }) => (
  <div style={{ position: "absolute", left: 0, width: W0, top: y - h / 2, height: h, background: `linear-gradient(180deg, transparent, ${color}, transparent)`, opacity }} />
);

const wavePath = (y0: number, amp: number, len: number, ph: number, bottom: number) => {
  let d = `M-20,${bottom} L-20,${y0}`;
  for (let x = -20; x <= W0 + 20; x += 14) d += ` L${x},${(y0 + Math.sin(x / len + ph) * amp + Math.sin(x / (len * 0.43) - ph * 1.3) * amp * 0.45).toFixed(1)}`;
  return d + ` L${W0 + 20},${bottom} Z`;
};

// Sea: three wave bands + sun glint column under the key light.
const Sea: React.FC<{ m: Mood; y: number; glintX: number; seed?: number; glint?: number }> = ({ m, y, glintX, seed = 5, glint = 1 }) => {
  const { t } = useT();
  const R = rng(seed);
  const dashes: React.ReactNode[] = [];
  for (let i = 0; i < 46; i++) {
    const yy = y + 20 + Math.pow(R(), 1.4) * 520;
    const spread = 40 + (yy - y) * 0.55;
    const x = glintX + (R() - 0.5) * 2 * spread;
    const w = 14 + R() * 50 * (1 + (yy - y) / 400);
    const a = 0.25 + 0.75 * Math.abs(Math.sin(t * (1.5 + R() * 2) + i));
    dashes.push(<rect key={i} x={x - w / 2} y={yy} width={w} height={3 + (yy - y) / 160} rx={2} fill={m.sun} opacity={a * 0.8 * glint} />);
  }
  // specular sparkles: tiny 4-point stars twinkling on the glint column
  for (let i = 0; i < 10; i++) {
    const yy = y + 30 + R() * 300;
    const x = glintX + (R() - 0.5) * (60 + (yy - y) * 0.9);
    const k = Math.max(0, Math.sin(t * (2.2 + R() * 2) + i * 2.1)) ** 3;
    const s = 6 + 16 * k;
    dashes.push(<path key={`sp${i}`} d={`M${x - s},${yy} L${x},${yy - 2} L${x + s},${yy} L${x},${yy + 2} Z M${x},${yy - s * 0.7} L${x + 2},${yy} L${x},${yy + s * 0.7} L${x - 2},${yy} Z`} fill="#FFFFFF" opacity={k * 0.9 * glint} />);
  }
  return (
    <svg width={W0} height={H0} style={{ position: "absolute", inset: 0 }}>
      <path d={wavePath(y, 6, 40, t * 1.2, H0)} fill={m.sea1} />
      <path d={wavePath(y + 140, 10, 60, -t * 1.6 + 1, H0)} fill={m.sea2} />
      {dashes}
      <path d={wavePath(y + 340, 16, 80, t * 1.9 + 2, H0)} fill={m.sea3} />
      <path d={wavePath(y + 340, 16, 80, t * 1.9 + 2, y + 352).replace(/ Z$/, "")} fill="none" stroke={m.sun} strokeWidth={3} opacity={0.35 * glint} />
    </svg>
  );
};

// Shape rendered twice: a rim copy shifted toward the light, then the dark body on top.
const Rimmed: React.FC<{ dx: number; dy?: number; rim?: string; body?: string; rimOpacity?: number; children: (fill: string) => React.ReactNode }> = ({ dx, dy = 0, rim = C.rim, body = C.ink, rimOpacity = 0.9, children }) => (
  <g>
    <g transform={`translate(${dx} ${dy})`} opacity={rimOpacity} style={{ filter: "blur(1.2px)" }}>{children(rim)}</g>
    {children(body)}
  </g>
);

/** Maunsell sea fort (Roughs Tower) silhouette; local box 600 × 600, base at y 600. */
const FortShape: React.FC<{ fill: string; flag?: number; mast?: boolean; lit?: string; rust?: boolean; tex?: boolean }> = ({ fill, flag = 0, mast = true, lit, rust, tex }) => {
  const { t } = useT();
  const wave = Math.sin(t * 6) * 4;
  return (
    <g fill={fill}>
      <rect x={175} y={250} width={70} height={400} />
      <rect x={355} y={250} width={70} height={400} />
      <rect x={128} y={222} width={344} height={38} />
      <rect x={128} y={194} width={344} height={6} />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={132 + i * 30} y={194} width={5} height={30} />)}
      <rect x={160} y={140} width={280} height={86} />
      <rect x={330} y={98} width={92} height={46} />
      {mast ? (
        <g stroke={fill} strokeWidth={6} fill="none">
          <line x1={200} y1={140} x2={212} y2={20} />
          <line x1={232} y1={140} x2={218} y2={20} />
          <line x1={204} y1={110} x2={228} y2={110} />
          <line x1={207} y1={78} x2={224} y2={78} />
          <line x1={210} y1={48} x2={221} y2={48} />
        </g>
      ) : null}
      <rect x={298} y={0} width={6} height={142} />
      {lit ? Array.from({ length: 6 }, (_, i) => <rect key={`w${i}`} x={178 + i * 44} y={168} width={24} height={30} fill={lit} opacity={0.55 + 0.35 * Math.sin(t * 2 + i)} />) : null}
      {rust ? [190, 370].map((x) => <rect key={x} x={x} y={300} width={18} height={260} fill="#6B3A22" opacity={0.35} />) : null}
      {tex ? (
        <g>
          {/* weathered concrete: pour seams, panel lines, rivet rows, rust streaks */}
          {[175, 355].map((x) => (
            <g key={`p${x}`}>
              {Array.from({ length: 7 }, (_, i) => <rect key={i} x={x} y={290 + i * 52} width={70} height={2.5} fill="#4A4238" opacity={0.75} />)}
              <rect x={x + 52} y={262} width={10} height={380} fill="#3A332B" opacity={0.6} />
              {Array.from({ length: 9 }, (_, i) => <circle key={`r${i}`} cx={x + 12} cy={280 + i * 40} r={3} fill="#6A5C48" opacity={0.8} />)}
              <path d={`M${x + 20},262 Q${x + 26},330 ${x + 18},420 L${x + 30},420 Q${x + 36},330 ${x + 32},262 Z`} fill="#7A4024" opacity={0.5} />
            </g>
          ))}
          {Array.from({ length: 3 }, (_, i) => <rect key={`h${i}`} x={160} y={150 + i * 24} width={280} height={2} fill="#4A4238" opacity={0.7} />)}
          {Array.from({ length: 7 }, (_, i) => <rect key={`v${i}`} x={160 + i * 46} y={140} width={2} height={86} fill="#4A4238" opacity={0.55} />)}
          {[200, 290, 390].map((x, i) => <path key={`s${i}`} d={`M${x},226 L${x + 8},226 L${x + 5},${262 + i * 14} L${x + 2},${262 + i * 14} Z`} fill="#8A4A26" opacity={0.6} />)}
          <rect x={128} y={232} width={344} height={3} fill="#5A5044" opacity={0.8} />
        </g>
      ) : null}
      {flag > 0 ? (
        <g transform={`translate(304 ${4 + (1 - flag) * 100}) skewY(${wave * 0.6})`}>
          <rect width={92} height={58} fill="#F4F1EA" />
          <polygon points="0,0 68,0 0,43" fill="#C8102E" />
          <polygon points="92,15 92,58 24,58" fill="#111" />
        </g>
      ) : null}
    </g>
  );
};

const Fort: React.FC<{ x: number; y: number; s: number; dx?: number; flag?: number; lit?: string; rust?: boolean; mast?: boolean; rim?: string }> = ({ x, y, s, dx = -6, flag = 0, lit, rust, mast, rim }) => (
  <svg width={W0} height={H0} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    <g transform={`translate(${x} ${y}) scale(${s}) translate(-300 -600)`}>
      <Rimmed dx={dx} rim={rim}>{(f) => <FortShape fill={f} flag={f === C.ink ? flag : 0} lit={f === C.ink ? lit : undefined} rust={f === C.ink && rust} mast={mast} tex={f === C.ink} />}</Rimmed>
    </g>
  </svg>
);

const Gulls: React.FC<{ seed: number; y: number; n?: number; color?: string }> = ({ seed, y, n = 5, color = C.ink }) => {
  const { t } = useT();
  const R = rng(seed);
  return (
    <svg width={W0} height={H0} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: n }, (_, i) => {
        const sp = 18 + R() * 30, x0 = R() * W0, yy = y + R() * 220, s = 0.6 + R() * 0.8, ph = R() * 6;
        const x = ((x0 + t * sp) % (W0 + 200)) - 100;
        const f = Math.sin(t * 8 + ph) * 10;
        return <path key={i} transform={`translate(${x} ${yy + Math.sin(t + ph) * 8}) scale(${s})`} d={`M-26,${f} Q-13,-14 0,0 Q13,-14 26,${f}`} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" />;
      })}
    </svg>
  );
};

const PlaneShape: React.FC<{ fill: string }> = ({ fill }) => (
  <g fill={fill}>
    <path d="M-70,0 Q-46,-11 58,-7 Q78,0 58,7 Q-46,11 -70,0 Z" />
    <path d="M0,-5 L-26,-58 L-10,-58 L24,-5 Z" />
    <path d="M0,5 L-26,58 L-10,58 L24,5 Z" />
    <path d="M-58,-2 L-72,-26 L-62,-26 L-46,-2 Z" />
    <rect x={-20} y={-60} width={14} height={8} />
    <rect x={-20} y={52} width={14} height={8} />
  </g>
);

const HeliShape: React.FC<{ fill: string; t: number }> = ({ fill, t }) => {
  const rot = Math.sin(t * 40) * 80;
  return (
    <g fill={fill}>
      <ellipse cx={0} cy={0} rx={58} ry={32} />
      <rect x={36} y={-10} width={110} height={15} rx={7} />
      <rect x={138} y={-34} width={10} height={40} />
      <rect x={-5} y={-48} width={10} height={18} />
      <rect x={-rot - 8} y={-54} width={2 * Math.abs(rot) + 16} height={7} rx={3} />
      <rect x={-40} y={34} width={80} height={6} />
      <rect x={-28} y={26} width={6} height={12} />
      <rect x={22} y={26} width={6} height={12} />
    </g>
  );
};

const ShipShape: React.FC<{ fill: string; s?: number }> = ({ fill, s = 1 }) => (
  <g fill={fill} transform={`scale(${s})`}>
    <path d="M-170,0 L170,0 L138,52 L-150,52 Z" />
    <rect x={-90} y={-52} width={130} height={52} />
    <rect x={-60} y={-96} width={64} height={44} />
    <rect x={60} y={-34} width={14} height={34} />
    <rect x={-30} y={-150} width={8} height={56} />
  </g>
);

const TugShape: React.FC<{ fill: string }> = ({ fill }) => (
  <g fill={fill}>
    <path d="M-90,0 L90,0 Q80,34 60,36 L-74,36 Z" />
    <rect x={-40} y={-40} width={70} height={40} />
    <rect x={-10} y={-80} width={20} height={40} />
  </g>
);

// Human silhouettes (local origin = feet centre, height ≈ 360).
type Pose = "stand" | "point" | "rifle" | "kneel" | "bound" | "flag" | "hands";
const FigureShape: React.FC<{ fill: string; pose: Pose; coat?: boolean }> = ({ fill, pose, coat }) => {
  const legs = pose === "kneel" ? "M-40,-130 L-60,-20 L-20,-20 L-6,-110 Z M10,-130 L70,-80 L60,0 L30,0 L36,-60 L-4,-100 Z" : "M-38,-170 L-46,0 L-14,0 L-2,-140 L8,-140 L18,0 L50,0 L40,-170 Z";
  const y0 = pose === "kneel" ? 90 : 0;
  return (
    <g fill={fill} transform={`translate(0 ${y0})`}>
      <path d={legs} />
      <path d={coat ? "M-56,-172 Q-60,-300 0,-306 Q60,-300 56,-172 L64,-110 L-64,-110 Z" : "M-52,-168 Q-58,-296 0,-302 Q58,-296 52,-168 Z"} />
      <circle cx={0} cy={-338} r={34} />
      {pose === "stand" ? <path d="M-50,-290 L-70,-160 L-52,-158 L-34,-270 Z M50,-290 L70,-160 L52,-158 L34,-270 Z" /> : null}
      {pose === "point" ? <path d="M-50,-290 L-70,-160 L-52,-158 L-34,-270 Z M44,-292 L190,-330 L194,-312 L48,-262 Z" /> : null}
      {pose === "rifle" ? <path d="M-50,-290 L-68,-180 L-30,-200 L60,-250 L210,-262 L212,-246 L70,-232 L-26,-176 Z M44,-292 L70,-230 L52,-226 L34,-270 Z" /> : null}
      {pose === "bound" ? <path d="M-50,-290 L-40,-180 L40,-180 L50,-290 L34,-280 L20,-196 L-20,-196 L-34,-280 Z" /> : null}
      {pose === "kneel" ? <path d="M-50,-290 L-40,-190 L40,-190 L50,-290 Z" /> : null}
      {pose === "flag" ? <path d="M-50,-290 L-70,-160 L-52,-158 L-34,-270 Z M44,-292 L96,-430 L114,-424 L58,-270 Z" /> : null}
      {pose === "hands" ? <path d="M-50,-290 L-70,-160 L-52,-158 L-34,-270 Z M44,-290 L150,-250 L148,-232 L46,-262 Z" /> : null}
    </g>
  );
};

const Figure: React.FC<{ x: number; y: number; s: number; pose: Pose; dx?: number; flip?: boolean; coat?: boolean; rim?: string; body?: string; sway?: number }> = ({ x, y, s, pose, dx = -7, flip, coat, rim, body, sway = 0 }) => {
  const { t } = useT();
  const b = Math.sin(t * 1.3 + x) * sway;
  return (
    <svg width={W0} height={H0} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${b})`}>
        <Rimmed dx={flip ? -dx : dx} rim={rim} body={body}>{(f) => <FigureShape fill={f} pose={pose} coat={coat} />}</Rimmed>
      </g>
    </svg>
  );
};

// Blurred foreground occluder (railing / rope post) — sells depth.
const FGRail: React.FC<{ y: number; color?: string; accent?: string }> = ({ y, color = "#050506", accent = C.rim }) => (
  <svg width={W0} height={H0} style={{ position: "absolute", inset: 0, filter: "blur(5px)" }}>
    <rect x={-20} y={y} width={W0 + 40} height={26} fill={color} />
    <rect x={-20} y={y} width={W0 + 40} height={4} fill={accent} opacity={0.5} />
    {[-10, 300, 640, 980].map((x) => <rect key={x} x={x} y={y} width={70} height={H0 - y} fill={color} />)}
    {[-10, 300, 640, 980].map((x) => <rect key={`a${x}`} x={x + 60} y={y} width={6} height={H0 - y} fill={accent} opacity={0.35} />)}
  </svg>
);

const Stars: React.FC<{ seed: number }> = ({ seed }) => {
  const { t } = useT();
  const R = rng(seed);
  return (
    <svg width={W0} height={H0} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={R() * W0} cy={R() * 760} r={1 + R() * 2.2} fill="#FFFFFF" opacity={0.3 + 0.5 * Math.abs(Math.sin(t * (0.8 + R()) + i))} />)}
    </svg>
  );
};

// Dust motes drifting through the key light.
const Motes: React.FC<{ seed: number; color: string; n?: number; y0?: number; y1?: number }> = ({ seed, color, n = 40, y0 = 200, y1 = 1500 }) => {
  const { t } = useT();
  const R = rng(seed);
  return (
    <svg width={W0} height={H0} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
      {Array.from({ length: n }, (_, i) => {
        const x = (R() * W0 + t * (6 + R() * 14)) % W0;
        const y = y0 + ((R() * (y1 - y0) - t * (4 + R() * 10)) % (y1 - y0) + (y1 - y0)) % (y1 - y0);
        return <circle key={i} cx={x} cy={y} r={1.5 + R() * 3} fill={color} opacity={0.25 + 0.5 * Math.abs(Math.sin(t + i))} />;
      })}
    </svg>
  );
};

// Near foreground for sea sets (lower third, y > 1500): close wave crest with key-light foam,
// spray, and a riveted railing post of the observer's boat, softly blurred.
const FGSea: React.FC<{ rim: string; side?: "l" | "r"; seed?: number }> = ({ rim, side = "l", seed = 7 }) => {
  const { t } = useT();
  const R = rng(seed);
  const px = side === "l" ? 34 : W0 - 124;
  const bx = side === "l" ? 34 : W0 - 330;
  const crest = (x: number) => 1660 + Math.sin(x / 90 + t * 2.2) * 22 + Math.sin(x / 37 - t * 2.9) * 9;
  const spray = Array.from({ length: 22 }, (_, i) => {
    const x0 = R() * W0, ph = R(), sp = 0.8 + R() * 0.7;
    const p = (t * sp + ph) % 1;
    return <circle key={i} cx={x0 + p * 40} cy={crest(x0) - Math.sin(p * Math.PI) * (50 + R() * 70)} r={3 + R() * 5} fill={rim} opacity={(1 - p) * 0.75} />;
  });
  let crestD = "";
  for (let x = -20; x <= W0 + 20; x += 12) crestD += `${x === -20 ? "M" : "L"}${x},${crest(x).toFixed(1)} `;
  return (
    <svg width={W0} height={H0} style={{ position: "absolute", inset: 0 }}>
      <g style={{ filter: "blur(2.5px)" }}>
        <path d={`${crestD} L${W0 + 20},${H0} L-20,${H0} Z`} fill="#06070A" />
        <path d={crestD} fill="none" stroke={rim} strokeWidth={5} opacity={0.7} />
        <path d={crestD} fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0.35} transform="translate(0 8)" />
        {spray}
      </g>
      <g style={{ filter: "blur(5px)" }}>
        <rect x={px} y={1480} width={90} height={H0 - 1480} fill="#040405" />
        <rect x={side === "l" ? px + 80 : px} y={1480} width={8} height={H0 - 1480} fill={rim} opacity={0.55} />
        <rect x={bx} y={1540} width={296} height={22} fill="#040405" />
        <rect x={bx} y={1540} width={296} height={4} fill={rim} opacity={0.6} />
        {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={px + 45} cy={1600 + i * 40} r={6} fill={rim} opacity={0.45} />)}
      </g>
    </svg>
  );
};

// Near foreground for desk sets (charts, certificate): brass dividers + pencil, blurred.
const FGDesk: React.FC<{ brass?: string }> = ({ brass = "#C8963E" }) => {
  const { t } = useT();
  const o = Math.sin(t * 0.6) * 6;
  return (
    <svg width={W0} height={H0} style={{ position: "absolute", inset: 0, filter: "blur(4px)" }}>
      <rect x={0} y={1760} width={W0} height={160} fill="#0A0604" opacity={0.85} />
      <g transform={`translate(${820 + o} 1560) rotate(18)`}>
        <path d="M0,0 L-70,330 L-56,332 L6,20 Z" fill={brass} />
        <path d="M0,0 L70,330 L56,332 L-6,20 Z" fill="#8A6424" />
        <circle cx={0} cy={0} r={22} fill={brass} stroke="#5A3E12" strokeWidth={5} />
      </g>
      <g transform={`translate(${140 - o} 1700) rotate(-14)`}>
        <rect x={0} y={0} width={420} height={30} rx={6} fill="#D4A43A" />
        <rect x={0} y={0} width={420} height={6} fill="#FFE6A0" opacity={0.6} />
        <path d="M420,0 L470,15 L420,30 Z" fill="#E8C89A" />
        <path d="M455,10 L470,15 L455,20 Z" fill="#222" />
        <rect x={-40} y={0} width={40} height={30} rx={4} fill="#B04A3A" />
      </g>
    </svg>
  );
};

// =====================================================================================
// HUD (CHRONICLE overlays)
// =====================================================================================
const DateStamp: React.FC<{ at: number; small: string; big: string; top?: number; color?: string; size?: number; until?: number }> = ({ at, small, big, top: top0 = 360, color = C.gold, size = 132, until = 999 }) => {
  const { t } = useT();
  const sig = signatureAnchorAt("sealand-ep03", t);
  const top = top0 + (sig === 0 || sig === 3 ? 80 : 0); // keep clear of the top-corner signature (y ≈ 221)
  const a = r(t, at, at + 0.5) * r(t, until, until + 0.3, 1, 0);
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", top, left: 0, width: W0, textAlign: "center", opacity: a, transform: `translateY(${(1 - a) * -30}px)` }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 22, fontFamily: "BarlowX", fontSize: 46, letterSpacing: 8, color: C.cream, textShadow: "0 3px 14px rgba(0,0,0,.8)" }}>
        <span style={{ width: 110 * a, height: 3, background: color }} />{small}<span style={{ width: 110 * a, height: 3, background: color }} />
      </div>
      <div style={{ fontFamily: "Anton", fontSize: size, lineHeight: 1.05, color, textShadow: "0 6px 30px rgba(0,0,0,.7)", letterSpacing: 2 }}>{big}</div>
    </div>
  );
};

const Counter: React.FC<{ at: number; to: number; label: string; top?: number; suffix?: string; prefix?: string; color?: string; size?: number; thousands?: boolean; until?: number }> = ({ at, to, label, top = 380, suffix = "", prefix = "", color = C.gold, size = 200, thousands, until = 999 }) => {
  const { t, fps } = useT();
  const a = r(t, at, at + 0.35) * r(t, until, until + 0.3, 1, 0);
  if (a <= 0) return null;
  const p = r(t, at, at + 0.9, 0, 1, Easing.out(Easing.cubic));
  const pp = pop(t, at + 0.9, fps);
  const v = Math.round(to * p).toString().replace(/\B(?=(\d{3})+(?!\d))/g, thousands ? "." : "");
  return (
    <div style={{ position: "absolute", top, left: 0, width: W0, textAlign: "center", opacity: a }}>
      <div style={{ fontFamily: "Anton", fontSize: size, lineHeight: 1, color, transform: `scale(${0.9 + 0.1 * pp})`, textShadow: "0 8px 40px rgba(0,0,0,.7)" }}>{prefix}{v}{suffix}</div>
      <div style={{ display: "inline-block", marginTop: 14, padding: "8px 26px", background: "rgba(11,12,16,.8)", border: `2px solid ${color}`, fontFamily: "BarlowX", fontSize: 46, letterSpacing: 4, color: C.cream }}>{label}</div>
    </div>
  );
};

const Card: React.FC<{ at: number; top: number; title: string; lines?: string[]; color?: string; width?: number; until?: number }> = ({ at, top, title, lines = [], color = C.gold, width = 880, until = 999 }) => {
  const { t } = useT();
  const a = r(t, at, at + 0.45) * r(t, until, until + 0.3, 1, 0);
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", top, left: (W0 - width) / 2, width, boxSizing: "border-box", opacity: a, transform: `translateY(${(1 - a) * 40}px)`, background: "rgba(11,12,16,.84)", borderLeft: `12px solid ${color}`, padding: "24px 34px", boxShadow: "0 20px 60px rgba(0,0,0,.55)" }}>
      <div style={{ fontFamily: "Anton", fontSize: 70, color, lineHeight: 1.06 }}>{title}</div>
      {lines.map((l, i) => <div key={i} style={{ fontFamily: "JakartaB", fontSize: 44, color: C.cream, marginTop: 8, lineHeight: 1.25 }}>{l}</div>)}
    </div>
  );
};

const NameTag: React.FC<{ at: number; x: number; y: number; name: string; sub?: string; color?: string; align?: "left" | "right"; until?: number; maxW?: number }> = ({ at, x, y, name, sub, color = C.gold, align = "left", until = 999, maxW }) => {
  const { t } = useT();
  const a = r(t, at, at + 0.4) * r(t, until, until + 0.3, 1, 0);
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", left: align === "left" ? x : undefined, right: align === "right" ? W0 - x : undefined, top: y, maxWidth: maxW, opacity: a, textAlign: align, background: "rgba(11,12,16,.86)", padding: "10px 22px 14px", boxShadow: "0 12px 30px rgba(0,0,0,.45)" }}>
      <div style={{ height: 5, width: 90 * a, background: color, marginLeft: align === "right" ? "auto" : 0, marginBottom: 6 }} />
      <div style={{ fontFamily: "BarlowX", fontSize: 60, color: C.cream, letterSpacing: 2, lineHeight: 1.05 }}>{name}</div>
      {sub ? <div style={{ fontFamily: "BarlowX", fontSize: 54, color, letterSpacing: 3, lineHeight: 1.08 }}>{sub}</div> : null}
    </div>
  );
};

const Stamp: React.FC<{ at: number; x: number; y: number; text: string; color?: string; rot?: number; size?: number; until?: number }> = ({ at, x, y, text, color = C.red, rot = -8, size = 88, until = 999 }) => {
  const { t, fps } = useT();
  const p = pop(t, at, fps, 10);
  if (p <= 0 || t >= until) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${interpolate(p, [0, 1], [2.2, 1])})`, opacity: Math.min(1, p * 1.6), border: `8px solid ${color}`, color, fontFamily: "Anton", fontSize: size, padding: "4px 30px", letterSpacing: 3, background: "rgba(11,12,16,.55)", whiteSpace: "nowrap", boxShadow: `0 0 40px ${color}55` }}>{text}</div>
  );
};

const BrandPlate: React.FC<{ x: number; y: number; scale?: number; label?: string }> = ({ x, y, scale = 1, label = "AUDIRA · FAKTA DUNIA" }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `scale(${scale})`, transformOrigin: "left top", background: "#1A120C", border: `3px solid ${C.gold}`, padding: "6px 18px", fontFamily: "BarlowX", fontSize: 38, letterSpacing: 6, color: C.gold, whiteSpace: "nowrap" }}>{label}</div>
);

// =====================================================================================
// SCENES
// =====================================================================================
const S_Hook: React.FC = () => {
  const { t, fps } = useT();
  const m = MOODS.dusk;
  const pillars = r(t, T("dua"), T("dua") + 0.5);
  const title = pop(t, T("Sealand."), fps, 11);
  const crown = pop(t, T("punya") - 0.15, fps, 9);
  return (
    <AbsoluteFill>
      <Sky id="hk" m={m} sx={330} sy={980} sr={260} />
      <Clouds y={600} color="#3A2630" lit={m.fog} seed={3} />
      <GodRays id="hk" x={330} y={980} color={m.sun} from={190} to={350} opacity={0.38} />
      <Motes seed={5} color={m.sun} n={34} y0={500} y1={1150} />
      <Fog color={m.fog} y={1040} h={300} opacity={0.45} />
      <Fort x={600} y={1210} s={1.28} dx={-8} lit="#FFD58A" flag={1} />
      {/* pillar callouts: thin gold brackets beside both towers */}
      <svg width={W0} height={H0} style={{ position: "absolute", inset: 0, opacity: pillars }}>
        {[600 - 1.28 * 90, 600 + 1.28 * 90].map((x, i) => (
          <g key={i}>
            <rect x={x - 54} y={1210 - 1.28 * 350} width={108} height={1.28 * 330 * pillars} fill="none" stroke={C.gold} strokeWidth={5} strokeDasharray="18 10" />
          </g>
        ))}
      </svg>
      <Sea m={m} y={1150} glintX={330} />
      <Gulls seed={4} y={520} n={6} />
      <FGSea rim={m.sun} side="r" seed={11} />
      {title <= 0 ? <BrandPlate x={600 - 112} y={1210 - 1.28 * 380 - 4} label="AUDIRA" /> : null}
      <Counter at={Math.max(0.3, T("empat") - 0.85)} to={400} suffix=" m²" label="LUAS SELURUH NEGARA" top={380} until={T("Namanya") - 0.25} />
      <NameTag at={T("dua")} x={70} y={1010} name="2 TIANG BETON" sub="DI LAUT UTARA" until={T("Namanya") - 0.2} />
      {title > 0 ? (
        <div style={{ position: "absolute", top: 640, left: 0, width: W0, textAlign: "center", transform: `scale(${0.7 + 0.3 * title})`, opacity: Math.min(1, title * 1.5) }}>
          <div style={{ fontFamily: "BarlowX", fontSize: 44, letterSpacing: 10, color: C.cream, textShadow: "0 3px 14px #000", marginBottom: 26 }}>KEPANGERANAN</div>
          <div style={{ fontFamily: "Anton", fontSize: 168, lineHeight: 1, color: C.gold, textShadow: "0 8px 40px rgba(0,0,0,.75)" }}>SEALAND</div>
        </div>
      ) : null}
      {crown > 0 ? (
        <svg width={W0} height={H0} style={{ position: "absolute", inset: 0 }}>
          <ellipse cx={540} cy={520} rx={190 * crown} ry={120 * crown} fill={C.gold} opacity={0.22} style={{ filter: "blur(20px)" }} />
          <g transform={`translate(540 ${560 - 50 * crown}) scale(${2.4 * crown}) rotate(${8 - 8 * crown})`}>
            <path d="M-50,20 L-56,-30 L-28,-4 L0,-42 L28,-4 L56,-30 L50,20 Z" fill={C.gold} stroke="#7A4A10" strokeWidth={4} strokeLinejoin="round" />
            <rect x={-52} y={18} width={104} height={14} rx={4} fill={C.gold} stroke="#7A4A10" strokeWidth={4} />
            <circle cx={0} cy={-46} r={7} fill={C.red} />
          </g>
        </svg>
      ) : null}
      <NameTag at={T("punya") - 0.1} x={1010} y={1000} name="PUNYA PANGERAN" sub="DAN BENDERA SENDIRI" align="right" />
    </AbsoluteFill>
  );
};

const S_1943: React.FC = () => {
  const { t } = useT();
  const m = MOODS.war;
  const a = T("Tahun") - 0.2;
  const planes = (t - T("menghalau") + 0.4) * 300;
  const flak = (i: number) => {
    const tt = (t * 1.3 + i * 0.37) % 1;
    return tt;
  };
  return (
    <AbsoluteFill>
      <Sky id="w43" m={m} sx={540} sy={1260} sr={160} />
      {/* searchlight beams from the fort */}
      {[-1, 1].map((d, i) => {
        const ang = -90 + d * (22 + Math.sin(t * 0.9 + i) * 16);
        return <GodRays key={i} id={`sl${i}`} x={540 + d * 110} y={1000} color="#E8F0FF" from={ang - 2} to={ang + 2} n={1} len={1600} opacity={0.55} />;
      })}
      <Clouds y={420} color="#0C1426" lit="#2C3E5E" seed={9} drift={10} />
      {/* bombers crossing, dropping parachute mines */}
      <svg width={W0} height={H0} style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2].map((i) => {
          const x = -200 + planes - i * 190;
          const y = 540 + i * 70;
          return (
            <g key={i}>
              <g transform={`translate(${x} ${y}) scale(${1.1 - i * 0.15})`}><PlaneShape fill="#05070C" /></g>
              {[0, 1, 2].map((k) => {
                const dropT = T("penebar") + i * 0.25 + k * 0.4;
                if (t < dropT) return null;
                const dt = t - dropT;
                const mx = -200 + (dropT - T("menghalau") + 0.4) * 300 - i * 190;
                return (
                  <g key={k} transform={`translate(${mx} ${y + 40 + dt * 140})`}>
                    <path d="M-22,0 Q0,-26 22,0 Z" fill="#C8D2E4" opacity={0.85} />
                    <line x1={-20} y1={0} x2={0} y2={30} stroke="#C8D2E4" strokeWidth={2} />
                    <line x1={20} y1={0} x2={0} y2={30} stroke="#C8D2E4" strokeWidth={2} />
                    <circle cx={0} cy={36} r={9} fill="#05070C" />
                  </g>
                );
              })}
            </g>
          );
        })}
        {Array.from({ length: 7 }, (_, i) => {
          const f = flak(i);
          if (t < a + 1) return null;
          const R = rng(30 + i);
          const x = 140 + R() * 800, y = 380 + R() * 360;
          return <circle key={i} cx={x} cy={y} r={8 + f * 46} fill="#FFD08A" opacity={(1 - f) * 0.7} />;
        })}
      </svg>
      <Fog color="#3C4C6C" y={1020} h={260} opacity={0.5} />
      <Fort x={540} y={1240} s={1.12} dx={0} rim="#BFD4FF" lit="#FFE3A0" mast={false} />
      <Sea m={m} y={1180} glintX={540} glint={0.6} />
      <FGSea rim="#BFD4FF" side="l" seed={13} />
      <DateStamp at={a + 0.1} small="PERANG DUNIA II" big="1943" />
      <NameTag at={T("Inggris")} x={70} y={980} name="HM FORT ROUGHS" sub="DIBANGUN INGGRIS" until={T("penebar") - 0.1} />
      <NameTag at={T("pesawat")} x={1010} y={980} name="PESAWAT JERMAN" sub="PENEBAR RANJAU" color={C.red} align="right" />
    </AbsoluteFill>
  );
};

const S_Ponton: React.FC = () => {
  const { t } = useT();
  const m = MOODS.grey;
  const tow = r(t, T("Pontonnya") - 0.2, T("sengaja"), -420, 0, EIO);
  const sink = r(t, T("ditenggelamkan"), T("pasir,") + 0.2, 0, 1, EIO);
  const splash = r(t, T("ditenggelamkan") + 0.1, T("ditenggelamkan") + 1.2);
  const fx = 620 + tow;
  const fy = 1150 + 120 * sink;
  return (
    <AbsoluteFill>
      <Sky id="pt" m={m} sx={860} sy={620} sr={180} />
      <Clouds y={430} color="#56616C" lit="#E8DCC0" seed={12} drift={8} />
      <GodRays id="pt" x={860} y={560} color={m.sun} from={95} to={160} opacity={0.3} />
      <Fog color={m.fog} y={1030} h={260} opacity={0.5} />
      {/* pontoon hull under the fort */}
      <svg width={W0} height={H0} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(${fx} ${fy}) rotate(${sink * -3})`}>
          <rect x={-260} y={-20} width={520} height={110} fill="#14161A" />
          <rect x={-260} y={-20} width={520} height={6} fill={m.sun} opacity={0.45} />
        </g>
      </svg>
      <Fort x={fx} y={fy - 10} s={0.95} dx={7} mast={false} />
      {/* tugs + tow lines */}
      <svg width={W0} height={H0} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {[[fx + 470, 1150, 1], [fx + 380, 1230, 0.8]].map(([x, y, s], i) => (
          <g key={i}>
            <line x1={fx + 250} y1={fy + 10} x2={x - 80 * s} y2={y + 10} stroke="#14161A" strokeWidth={4} opacity={1 - sink} />
            <g transform={`translate(${x + sink * 60} ${y + Math.sin(t * 2 + i) * 5}) scale(${s})`}><Rimmed dx={6}>{(f) => <TugShape fill={f} />}</Rimmed></g>
          </g>
        ))}
        {splash > 0 && splash < 1 ? Array.from({ length: 16 }, (_, i) => {
          const R = rng(70 + i);
          const ang = Math.PI * (0.1 + R() * 0.8);
          const d = splash * (120 + R() * 200);
          return <circle key={i} cx={fx + Math.cos(ang) * d * (R() > 0.5 ? 1 : -1) * 1.6} cy={fy - Math.sin(ang) * d + splash * splash * 260} r={6 + R() * 10} fill="#E8EEF2" opacity={1 - splash} />;
        }) : null}
      </svg>
      <Sea m={m} y={1180} glintX={860} />
      <Motes seed={14} color={m.sun} n={28} y0={500} y1={1150} />
      <FGSea rim={m.sun} side="r" seed={15} />
      <Card at={T("ditenggelamkan")} top={380} title="DITENGGELAMKAN" lines={["sengaja, di atas gosong pasir"]} width={820} until={T("tujuh") - 0.3} />
      <Counter at={T("tujuh")} to={7} label="MIL LAUT DARI PANTAI" top={380} />
    </AbsoluteFill>
  );
};

// Sepia nautical chart lit by a desk lamp from the upper left.
const ChartBase: React.FC<{ dark?: boolean; id: string }> = ({ dark, id }) => {
  const paper = dark ? "#0E1A26" : "#D9C49A";
  const ink = dark ? "#5FA7D6" : "#3A2410";
  const land = dark ? "#1A2632" : "#B89B6A";
  return (
    <>
    <svg width={W0} height={H0} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id={`lamp${id}`} cx="0.22" cy="0.18" r="0.95">
          <stop offset="0" stopColor={dark ? "#3A6E96" : "#FFF0C8"} stopOpacity={dark ? 0.35 : 0.85} />
          <stop offset="1" stopColor="#000" stopOpacity={dark ? 0.7 : 0.6} />
        </radialGradient>
      </defs>
      <rect width={W0} height={H0} fill={paper} />
      {/* contour lines */}
      {Array.from({ length: 14 }, (_, i) => (
        <path key={i} d={`M-40,${300 + i * 110} C300,${260 + i * 118} 700,${360 + i * 100} 1120,${300 + i * 112}`} stroke={ink} strokeWidth={1.5} fill="none" opacity={0.25} />
      ))}
      {/* coastline (Suffolk/Essex) on the left */}
      <path d="M-20,180 L150,240 Q230,420 180,560 Q120,700 210,860 Q290,1000 200,1150 Q140,1280 230,1420 L250,1760 L-20,1760 Z" fill={land} stroke={ink} strokeWidth={4} />
      <circle cx={232} cy={1030} r={8} fill={ink} />
      {/* compass rose */}
      <g transform="translate(900 720)" opacity={0.7}>
        <circle r={70} fill="none" stroke={ink} strokeWidth={2} />
        <path d="M0,-90 L12,0 L0,90 L-12,0 Z" fill={ink} />
        <path d="M-90,0 L0,12 L90,0 L0,-12 Z" fill={ink} opacity={0.6} />
      </g>
      <rect width={W0} height={H0} fill={`url(#lamp${id})`} />
    </svg>
    {/* place names as HTML on their own paper chip so the layout auditor reads the real background */}
    <div style={{ position: "absolute", left: 50, top: 760, transform: "rotate(-90deg)", transformOrigin: "left top", background: land, color: ink, fontFamily: "BarlowX", fontSize: 44, letterSpacing: 6, padding: "0 10px" }}>INGGRIS</div>
    <div style={{ position: "absolute", left: 250, top: 1008, background: land, color: ink, fontFamily: "BarlowX", fontSize: 50, padding: "0 10px", letterSpacing: 1 }}>Harwich</div>
    </>
  );
};

// distances in px from the coastline anchor (x ≈ 220 at y 1030): 1 mil = 70 px
const MI = 70, COAST_X = 220, FORT_Y = 1030;
const Zone: React.FC<{ miles: number; color: string; fill: string; label?: string; glow?: boolean }> = ({ miles, color, fill, glow }) => (
  <svg width={W0} height={H0} style={{ position: "absolute", inset: 0 }}>
    <path d={`M-20,200 Q${COAST_X + miles * MI * 0.9},420 ${COAST_X + miles * MI},${FORT_Y} Q${COAST_X + miles * MI * 0.95},1500 -20,1760 Z`} fill={fill} stroke={color} strokeWidth={6} strokeDasharray="22 12" style={glow ? { filter: `drop-shadow(0 0 14px ${color})` } : undefined} />
  </svg>
);

const FortDot: React.FC<{ miles: number; color: string; label: string; pulse?: number }> = ({ miles, color, label, pulse = 0 }) => {
  const { t } = useT();
  const x = COAST_X + miles * MI;
  return (
    <>
      <svg width={W0} height={H0} style={{ position: "absolute", inset: 0 }}>
        <circle cx={x} cy={FORT_Y} r={30 + 30 * ((t * 1.2) % 1)} fill="none" stroke={color} strokeWidth={4} opacity={(1 - ((t * 1.2) % 1)) * (0.6 + pulse)} />
        <circle cx={x} cy={FORT_Y} r={18} fill={color} stroke={C.ink} strokeWidth={4} />
      </svg>
      <div style={{ position: "absolute", left: Math.min(x - 200, W0 - 460), top: FORT_Y - 130, fontFamily: "BarlowX", fontSize: 46, color, background: "rgba(11,12,16,.75)", padding: "4px 16px", letterSpacing: 2 }}>{label}</div>
    </>
  );
};

const S_Chart: React.FC = () => {
  const { t } = useT();
  const z = r(t, T("tiga"), T("tiga") + 0.8);
  const ruler = r(t, T("Saat") - 0.1, T("Saat") + 1.0, 0, 1, EIO);
  return (
    <AbsoluteFill>
      <ChartBase id="c1" />
      <div style={{ opacity: z }}><Zone miles={3 * z} color="#8A2A1A" fill="rgba(138,42,26,.18)" /></div>
      <svg width={W0} height={H0} style={{ position: "absolute", inset: 0 }}>
        {/* measuring ruler coast → fort */}
        <line x1={COAST_X} y1={FORT_Y + 90} x2={COAST_X + 7 * MI * ruler} y2={FORT_Y + 90} stroke="#3A2410" strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => (i <= 7 * ruler ? <line key={i} x1={COAST_X + i * MI} y1={FORT_Y + 72} x2={COAST_X + i * MI} y2={FORT_Y + 108} stroke="#3A2410" strokeWidth={4} /> : null))}
      </svg>
      <FortDot miles={7} color={C.red} label="BENTENG · 7 MIL" />
      <div style={{ position: "absolute", left: COAST_X + 3 * MI - 60, top: FORT_Y + 160, opacity: z, fontFamily: "Anton", fontSize: 64, color: "#8A2A1A", transform: "rotate(-90deg)", transformOrigin: "left top" }}>BATAS 3 MIL</div>
      <DateStamp at={T("Saat") - 0.1} small="SAAT ITU" big="BATAS LAUT 3 MIL" size={108} color="#7A2A16" />
      <Card at={T("tiga") + 0.3} top={1180} title="DI LUAR BATAS" lines={["benteng berdiri di laut lepas"]} width={760} color="#B5452E" />
      <FGDesk />
    </AbsoluteFill>
  );
};

const S_Abandon: React.FC = () => {
  const m = MOODS.fogdawn;
  return (
    <AbsoluteFill>
      <Sky id="ab" m={m} sx={760} sy={760} sr={150} />
      <GodRays id="ab" x={760} y={720} color={m.sun} from={110} to={170} opacity={0.3} />
      <Fog color={m.fog} y={900} h={500} opacity={0.6} />
      <Fort x={500} y={1220} s={1.18} dx={6} rust mast />
      <Fog color={m.fog} y={1120} h={260} opacity={0.55} />
      <Sea m={m} y={1170} glintX={760} glint={0.5} />
      <Gulls seed={21} y={600} n={4} color="#3A3A3A" />
      <Motes seed={22} color={m.sun} n={26} y0={450} y1={1100} />
      <FGSea rim={m.sun} side="l" seed={23} />
      <DateStamp at={T("Perang") - 0.1} small="1945" big="PERANG USAI" size={120} color={C.cream} />
      <Stamp at={T("ditinggalkan.")} x={540} y={780} text="DITINGGALKAN" size={92} />
    </AbsoluteFill>
  );
};

const RX = 740, RY = 1420, RS = 1.55; // low, close framing (differs from the hook wide shot)
const S_Roy: React.FC = () => {
  const { t, fps } = useT();
  const m = MOODS.gold;
  const boat = r(t, T("Lalu") - 0.2, T("mendudukinya") + 0.4, -300, 0, EIO);
  const flag = r(t, T("memproklamasikan"), T("Sealand.", 1), 0, 1, EIO);
  const waves = t > T("radio") ? (t - T("radio")) : -1;
  const rayIn = pop(t, T("Kepangeranan"), fps);
  return (
    <AbsoluteFill>
      <Sky id="ry" m={m} sx={250} sy={900} sr={240} />
      <Clouds y={560} color="#4A2A36" lit={m.fog} seed={33} />
      <GodRays id="ry" x={250} y={900} color={m.sun} from={200} to={360} opacity={0.36 + 0.2 * rayIn} />
      <Fog color={m.fog} y={1020} h={280} opacity={0.4} />
      {/* radio waves from mast */}
      {waves >= 0 ? (
        <svg width={W0} height={H0} style={{ position: "absolute", inset: 0 }}>
          {[0, 1, 2, 3].map((i) => {
            const p = ((waves * 0.8 + i * 0.25) % 1);
            return <circle key={i} cx={RX - RS * 85} cy={RY - RS * 580} r={30 + p * 360} fill="none" stroke={C.gold} strokeWidth={5} opacity={(1 - p) * 0.8} />;
          })}
        </svg>
      ) : null}
      <Fort x={RX} y={RY} s={RS} dx={-9} flag={flag} lit="#FFD58A" />
      {/* Roy on the deck */}
      <Figure x={RX - RS * 122} y={RY - RS * 378} s={0.38 * RS / 1.15} pose={t > T("memproklamasikan") ? "point" : "stand"} coat dx={-8} />
      <svg width={W0} height={H0} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${200 + boat} ${RY + 40 + Math.sin(t * 2) * 6}) scale(1.1)`}><Rimmed dx={-6}>{(f) => <TugShape fill={f} />}</Rimmed></g>
      </svg>
      <Sea m={m} y={RY - 30} glintX={250} />
      <Motes seed={34} color={m.sun} n={30} y0={500} y1={1300} />
      <FGSea rim={m.sun} side="l" seed={35} />
      <DateStamp at={T("2") - 0.05} small="2 SEPTEMBER" big="1967" until={T("Roy") - 0.1} />
      <NameTag at={T("Roy")} x={60} y={900} maxW={440} name="ROY BATES" sub="PEMILIK RADIO BAJAK LAUT" until={T("Kepangeranan") - 0.2} />
      <Card at={T("Kepangeranan")} top={380} title="KEPANGERANAN SEALAND" lines={["diproklamasikan di atas benteng"]} width={900} />
    </AbsoluteFill>
  );
};

const S_Shots: React.FC = () => {
  const { t } = useT();
  const m = MOODS.storm;
  const fire = T("tembakan");
  return (
    <AbsoluteFill>
      <Sky id="sh" m={m} sx={860} sy={1040} sr={120} />
      <Clouds y={420} color="#121016" lit="#5A3A30" seed={44} drift={14} />
      <Fog color={m.fog} y={1060} h={240} opacity={0.5} />
      <Fort x={300} y={1230} s={0.95} dx={7} rim="#FFB070" lit="#FFC070" />
      <svg width={W0} height={H0} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(${860 - (t - T("Setahun")) * 18} ${1150 + Math.sin(t * 1.6) * 6})`}><Rimmed dx={-6} rim="#FFB070">{(f) => <ShipShape fill={f} s={0.85} />}</Rimmed></g>
        {/* warning tracers: arc from fort deck to water in front of the ship */}
        {[0, 0.28, 0.56, 0.84].map((d, i) => {
          const p = (t - fire - d) / 0.55;
          if (p < 0 || p > 1.4) return null;
          const x0 = 400, y0 = 1230 - 0.95 * 360, x1 = 700, y1 = 1170;
          const pc = Math.min(p, 1);
          const x = x0 + (x1 - x0) * pc, y = y0 + (y1 - y0) * pc - Math.sin(pc * Math.PI) * 120;
          return (
            <g key={i}>
              {p < 0.15 ? <circle cx={x0} cy={y0} r={40} fill="#FFE2A0" opacity={0.9} /> : null}
              {p <= 1 ? <line x1={x - 40} y1={y + 8} x2={x} y2={y} stroke="#FFD27A" strokeWidth={7} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 10px #FFB040)" }} /> : null}
              {p > 1 ? <ellipse cx={x1} cy={y1 - (p - 1) * 200} rx={18} ry={60 * (p - 1) + 10} fill="#E8EEF2" opacity={1.4 - p} /> : null}
            </g>
          );
        })}
      </svg>
      <Sea m={m} y={1180} glintX={860} glint={0.5} />
      <FGSea rim="#FFB070" side="r" seed={45} />
      <DateStamp at={T("Setahun") - 0.05} small="SETAHUN KEMUDIAN" big="1968" />
      <NameTag at={T("putranya")} x={70} y={1250} name="MICHAEL BATES" sub="PUTRA ROY" until={T("kapal") - 0.1} />
      <NameTag at={T("kapal")} x={1010} y={1250} name="KAPAL INGGRIS" sub="TEMBAKAN PERINGATAN" color={C.red} align="right" />
    </AbsoluteFill>
  );
};

const S_Court: React.FC = () => {
  const { t, fps } = useT();
  const hit = pop(t, T("memutuskan,"), fps, 8);
  const gavelRot = t < T("memutuskan,") ? -40 + Math.sin(t * 3) * 6 : -40 + 40 * Math.min(1, (t - T("memutuskan,")) * 8);
  return (
    <AbsoluteFill>
      <svg width={W0} height={H0} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="wall" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3A2418" />
            <stop offset="1" stopColor="#140C08" />
          </linearGradient>
        </defs>
        <rect width={W0} height={H0} fill="url(#wall)" />
        {/* wood panelling */}
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={i * 140} y={820} width={130} height={500} fill="#2A180E" stroke="#4A2C18" strokeWidth={4} />)}
        {/* tall windows on the left — the key light (below the date stamp) */}
        {[60, 280].map((x) => (
          <g key={x}>
            <path d={`M${x},990 L${x},780 Q${x + 80},680 ${x + 160},780 L${x + 160},990 Z`} fill="#FFE8B8" opacity={0.92} />
            <rect x={x + 76} y={720} width={8} height={270} fill="#2A1A10" />
            <rect x={x} y={870} width={160} height={8} fill="#2A1A10" />
          </g>
        ))}
        {/* judge bench */}
        <rect x={140} y={1000} width={800} height={340} fill="#1A0F08" />
        <rect x={140} y={1000} width={800} height={14} fill="#C88A4A" opacity={0.7} />
        {/* royal crest disc */}
        <circle cx={850} cy={560} r={100} fill="#2A1A10" stroke="#C88A4A" strokeWidth={6} />
        <text x={850} y={585} textAnchor="middle" fontFamily="Anton" fontSize={70} fill="#C88A4A" style={{ color: "#C88A4A" }}>ESSEX</text>
      </svg>
      <GodRays id="ct" x={-260} y={560} color="#FFE2A8" from={5} to={35} n={5} opacity={0.42} />
      <Motes seed={55} color="#FFE2A8" n={50} y0={300} y1={1300} />
      <Figure x={540} y={1060} s={0.62} pose="stand" coat dx={8} rim="#FFD9A0" />
      {/* gavel */}
      <svg width={W0} height={H0} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(800 990) rotate(${gavelRot})`}>
          <rect x={-8} y={-150} width={16} height={150} fill="#5A3418" />
          <rect x={-50} y={-190} width={100} height={50} rx={10} fill="#7A4A22" stroke="#C88A4A" strokeWidth={3} />
        </g>
        {hit > 0 && hit < 1 ? <circle cx={800} cy={995} r={30 + 120 * hit} fill="none" stroke="#FFE2A8" strokeWidth={6} opacity={1 - hit} /> : null}
      </svg>
      <FGRail y={1340} accent="#C88A4A" />
      <DateStamp at={T("pengadilan")} small="PENGADILAN ESSEX" big="1968" />
      <Card at={T("luar")} top={1110} title="DI LUAR WILAYAH INGGRIS" lines={["pengadilan tak berwenang"]} width={900} />
      <Stamp at={T("gugur.")} x={540} y={780} text="KASUS GUGUR" size={96} />
    </AbsoluteFill>
  );
};

const S_Coup: React.FC = () => {
  const { t } = useT();
  const m = MOODS.war;
  const planeX = r(t, T("pergi"), T("Austria,") + 1.2, 300, 1300, EIO);
  const heli = r(t, T("mengirim"), T("Mereka") + 0.2, -260, 360, EIO);
  const spot = t > T("mengirim") + 0.3 ? 1 : 0;
  return (
    <AbsoluteFill>
      <Sky id="cp" m={m} sx={900} sy={520} sr={90} />
      <Clouds y={380} color="#0A1220" lit="#3A5070" seed={61} drift={18} />
      <svg width={W0} height={H0} style={{ position: "absolute", inset: 0 }}>
        {/* moon rim */}
        <circle cx={900} cy={520} r={70} fill="#E8F0FF" opacity={0.85} />
        {/* Roy leaving: small plane heading east */}
        <g transform={`translate(${planeX} ${470 - (planeX - 300) * 0.1}) scale(0.6)`} opacity={r(t, T("Austria,") + 1.0, T("Austria,") + 1.6, 1, 0)}><PlaneShape fill="#0A0E16" /></g>
      </svg>
      {spot ? (
        <svg width={W0} height={H0} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
          <defs>
            <linearGradient id="spotb" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F4F8FF" stopOpacity="0.75" />
              <stop offset="1" stopColor="#F4F8FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`${heli},${780} ${heli - 40},${780} ${380 - 200},${1240} ${380 + 230},${1240}`} fill="url(#spotb)" style={{ filter: "blur(6px)" }} />
        </svg>
      ) : null}
      <Fog color="#2C3C58" y={1080} h={260} opacity={0.5} />
      <Fort x={380} y={1260} s={0.9} dx={0} rim="#BFD4FF" lit="#FFE3A0" />
      <svg width={W0} height={H0} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(${heli} ${760 + Math.sin(t * 2) * 10}) scale(1.1)`}><Rimmed dx={0} dy={-5} rim="#BFD4FF">{(f) => <HeliShape fill={f} t={t} />}</Rimmed></g>
      </svg>
      <Sea m={m} y={1200} glintX={900} glint={0.45} />
      {/* Alexander Achenbach: on a launch in the moonlight, pointing at the fort he sends men to seize */}
      {t > T("perdana") - 0.3 ? (
        <div style={{ position: "absolute", inset: 0, opacity: r(t, T("perdana") - 0.3, T("perdana") + 0.3), transform: `translateX(${r(t, T("perdana") - 0.3, T("Alexander") + 0.4, 160, 0, EIO)}px)` }}>
          <svg width={W0} height={H0} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <g transform={`translate(820 ${1360 + Math.sin(t * 2) * 6}) scale(1.25)`}><Rimmed dx={-6} rim="#BFD4FF">{(f) => <TugShape fill={f} />}</Rimmed></g>
          </svg>
          <Figure x={830} y={1356 + Math.sin(t * 2) * 6} s={0.78} pose="point" coat flip dx={-8} rim="#DCE8FF" />
        </div>
      ) : null}
      <FGSea rim="#BFD4FF" side="l" seed={63} />
      <DateStamp at={T("Tahun", 1)} small="AGUSTUS" big="1978" until={T("tentara") - 0.2} />
      <NameTag at={T("Roy", 1)} x={60} y={1290} name="ROY KE AUSTRIA" sub="BENTENG DITINGGAL" until={T("perdana") - 0.25} />
      <NameTag at={T("perdana")} x={1010} y={760} name="ACHENBACH" sub="ALEXANDER · PM SEALAND" color={C.red} align="right" maxW={520} until={T("Mereka") - 0.25} />
      <Card at={T("tentara")} top={420} title="TENTARA BAYARAN" lines={["dari Jerman & Belanda"]} width={760} color={C.red} />
    </AbsoluteFill>
  );
};

const S_Hostage: React.FC = () => {
  const { t } = useT();
  const back = T("Michael");
  const dawn = r(t, back - 0.2, back + 0.8);
  const night = MOODS.storm, day = MOODS.morning;
  return (
    <AbsoluteFill>
      <Sky id="hn" m={night} sx={540} sy={1000} sr={100} />
      <div style={{ position: "absolute", inset: 0, opacity: dawn }}>
        <Sky id="hd" m={day} sx={880} sy={820} sr={200} />
        <GodRays id="hd" x={880} y={820} color={day.sun} from={150} to={230} opacity={0.4} />
      </div>
      {/* fort deck floor + railing (we are standing on the fort) */}
      <svg width={W0} height={H0} style={{ position: "absolute", inset: 0 }}>
        <rect x={0} y={1180} width={W0} height={740} fill="#101114" />
        <rect x={0} y={1180} width={W0} height={8} fill={dawn > 0.5 ? day.sun : "#FFB070"} opacity={0.5} />
        <rect x={0} y={1040} width={W0} height={10} fill="#101114" />
        {Array.from({ length: 14 }, (_, i) => <rect key={i} x={i * 80} y={1040} width={8} height={140} fill="#101114" />)}
      </svg>
      {dawn < 0.5 ? (
        <>
          <Figure x={330} y={1180} s={0.55} pose="rifle" dx={7} rim="#FFB070" />
          <Figure x={540} y={1180} s={0.5} pose="bound" dx={7} rim="#FFB070" />
          <Figure x={780} y={1180} s={0.57} pose="rifle" flip dx={7} rim="#FFB070" />
        </>
      ) : (
        <>
          <Figure x={420} y={1180} s={0.6} pose="rifle" dx={-8} rim={day.sun} />
          <Figure x={760} y={1180} s={0.55} pose="kneel" flip dx={-8} rim={day.sun} />
        </>
      )}
      <FGRail y={1420} accent={dawn > 0.5 ? day.sun : "#FFB070"} />
      <Stamp at={T("menyandera")} x={540} y={520} text="MICHAEL DISANDERA" size={80} rot={-5} until={T("Michael") - 0.15} />
      <Card at={back} top={380} title="DIREBUT KEMBALI" lines={["Michael menahan Achenbach"]} width={820} until={T("atas", 2) - 0.1} />
      <Stamp at={T("makar.")} x={540} y={560} text="TUDUHAN MAKAR" size={88} rot={6} />
      <NameTag at={T("menahan")} x={1010} y={800} name="ACHENBACH" sub="DITAHAN" color={C.red} align="right" />
    </AbsoluteFill>
  );
};

const S_Diplomat: React.FC = () => {
  const { t } = useT();
  const m = MOODS.morning;
  const boat = r(t, T("Jerman", 2) - 0.2, T("bernegosiasi.") , -340, 0, EIO);
  return (
    <AbsoluteFill>
      <Sky id="dp" m={m} sx={820} sy={820} sr={220} />
      <Clouds y={520} color="#5A6E80" lit="#F2D2A0" seed={77} />
      <GodRays id="dp" x={820} y={820} color={m.sun} from={150} to={230} opacity={0.35} />
      <Fog color={m.fog} y={1060} h={260} opacity={0.45} />
      <Fort x={610} y={1205} s={0.68} dx={6} flag={1} />
      <svg width={W0} height={H0} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(${320 + boat} ${1250 + Math.sin(t * 2) * 6})`}><Rimmed dx={7} rim={m.sun}>{(f) => <TugShape fill={f} />}</Rimmed></g>
      </svg>
      <Figure x={330 + boat} y={1215} s={0.3} pose="hands" coat dx={7} rim={m.sun} />
      <Sea m={m} y={1190} glintX={820} />
      <Motes seed={78} color={m.sun} n={26} y0={500} y1={1150} />
      <FGSea rim={m.sun} side="r" seed={79} />
      <DateStamp at={T("Jerman", 2)} small="JERMAN TURUN TANGAN" big="DIPLOMAT" size={120} until={T("bernegosiasi.") - 0.5} />
      <Card at={T("bernegosiasi.") - 0.3} top={400} title="NEGOSIASI" lines={["demi tahanan Achenbach"]} width={720} />
    </AbsoluteFill>
  );
};

const S_1987: React.FC = () => {
  const { t, fps } = useT();
  const grow = r(t, T("menjadi"), T("mil.", 1) + 0.4, 3, 12, EIO);
  const swallowed = grow > 7;
  const zero = pop(t, T("tak"), fps);
  return (
    <AbsoluteFill>
      <ChartBase id="c2" dark />
      <Zone miles={grow} color={C.blue} fill="rgba(124,196,240,.16)" glow />
      <FortDot miles={7} color={swallowed ? C.red : C.gold} label={swallowed ? "SEALAND · DI DALAM" : "SEALAND"} pulse={swallowed ? 0.4 : 0} />
      <div style={{ position: "absolute", left: Math.min(COAST_X + grow * MI - 70, 900), top: 1380, fontFamily: "Anton", fontSize: 64, color: C.blue, transform: "rotate(-90deg)", transformOrigin: "left top", textShadow: "0 0 18px rgba(124,196,240,.6)" }}>{Math.round(grow)} MIL</div>
      <DateStamp at={T("tahun", 0)} small="LAUT TERITORIAL INGGRIS" big="1987" />
      <Counter at={T("dua", 1)} to={12} suffix=" MIL" label="BATAS BARU" top={660} color={C.blue} size={130} />
      {zero > 0 ? (
        <div style={{ position: "absolute", top: 1120, left: 140, width: 800, textAlign: "center", transform: `scale(${0.8 + 0.2 * zero})`, opacity: Math.min(1, zero * 1.4), background: "rgba(11,12,16,.86)", border: `4px solid ${C.red}`, padding: "18px 0" }}>
          <div style={{ fontFamily: "Anton", fontSize: 120, color: C.red, lineHeight: 1 }}>0 NEGARA</div>
          <div style={{ fontFamily: "BarlowX", fontSize: 50, color: C.cream, letterSpacing: 4 }}>YANG MENGAKUI SEALAND</div>
        </div>
      ) : null}
      <FGDesk brass="#8FB4D0" />
    </AbsoluteFill>
  );
};

const S_Lord: React.FC = () => {
  const { t, fps } = useT();
  const cert = r(t, T("Meski") - 0.04, T("kamu") + 0.4, 0, 1, EIO);
  const price = r(t, T("lima"), T("rupiah."), 0, 560, Easing.out(Easing.cubic));
  const seal = pop(t, T("Lord"), fps, 9);
  return (
    <AbsoluteFill>
      <svg width={W0} height={H0} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2A170C" />
            <stop offset="1" stopColor="#120904" />
          </linearGradient>
        </defs>
        <rect width={W0} height={H0} fill="url(#wood)" />
        {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M0,${i * 90 + 20} Q540,${i * 90 + 40} 1080,${i * 90 + 10}`} stroke="#3A2214" strokeWidth={3} fill="none" opacity={0.6} />)}
      </svg>
      <GodRays id="ld" x={1200} y={-100} color="#FFE2A8" from={110} to={140} n={4} opacity={0.4} />
      <div style={{ position: "absolute", left: 120, top: 600 + (1 - cert) * 500, width: 840, height: 780, transform: `rotate(${-3 + cert * 1.5}deg)`, background: "linear-gradient(160deg, #F6E6C2, #E2C890 60%, #C9A868)", boxShadow: "0 50px 80px rgba(0,0,0,.65), 0 10px 20px rgba(0,0,0,.4)", border: "10px double #8A5A22", boxSizing: "border-box", padding: "60px 60px", textAlign: "center", opacity: cert }}>
        <div style={{ fontFamily: "BarlowX", fontSize: 40, letterSpacing: 10, color: "#6A4214" }}>PRINCIPALITY OF SEALAND</div>
        <div style={{ fontFamily: "Serif", fontSize: 76, color: "#3A2208", marginTop: 40, lineHeight: 1.05 }}>Gelar Bangsawan</div>
        <div style={{ fontFamily: "Anton", fontSize: 150, color: "#5A2E0A", lineHeight: 1.05, marginTop: 20 }}>LORD</div>
        <div style={{ height: 4, background: "#8A5A22", margin: "30px 80px" }} />
        <div style={{ fontFamily: "JakartaB", fontSize: 46, color: "#5A3A14" }}>gelar suvenir, bukan pengakuan negara</div>
        {seal > 0 ? (
          <div style={{ position: "absolute", right: 70, bottom: 60, width: 150, height: 150, borderRadius: 75, transform: `scale(${interpolate(seal, [0, 1], [1.8, 1])})`, background: "radial-gradient(circle at 40% 35%, #E2463A, #8A1A14 70%)", boxShadow: "0 12px 20px rgba(60,10,10,.5)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton", fontSize: 64, color: "#FFD6C8" }}>S</div>
        ) : null}
      </div>
      <Motes seed={88} color="#FFE2A8" n={36} />
      <FGDesk />
      <DateStamp at={T("Meski")} small="KINI" big="JADI BANGSAWAN?" size={112} />
      {t >= T("lima") ? (
        <div style={{ position: "absolute", top: 1180, left: 0, width: W0, textAlign: "center" }}>
          <span style={{ display: "inline-block", background: "rgba(11,12,16,.88)", border: `4px solid ${C.gold}`, padding: "10px 40px", fontFamily: "Anton", fontSize: 110, color: C.gold, transform: "rotate(-2deg)" }}>Rp {Math.round(price)}.000</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const S_CTA: React.FC = () => {
  const { t, fps } = useT();
  const m = MOODS.bluehour;
  const a = T("Negara");
  const sunY = r(t, a, END_VO, 1080, 1130);
  const q1 = pop(t, T("Negara"), fps, 11);
  const q2 = pop(t, T("atau"), fps, 11);
  const shop = pop(t, T("toko"), fps, 10);
  const bubble = pop(t, T("Tulis"), fps, 10);
  return (
    <AbsoluteFill>
      <Sky id="cta" m={m} sx={760} sy={sunY} sr={260} />
      <Stars seed={98} />
      <Clouds y={600} color="#1A2040" lit={m.fog} seed={99} opacity={0.7} />
      <GodRays id="cta" x={760} y={sunY} color={m.sun} from={200} to={340} opacity={0.3} />
      <Fog color={m.fog} y={1090} h={260} opacity={0.4} />
      <Fort x={360} y={1250} s={1.0} dx={8} flag={1} lit="#FFD58A" />
      {shop > 0 ? (
        <div style={{ position: "absolute", left: 360 - 150, top: 1250 - 470, transform: `scale(${shop}) rotate(${Math.sin(t * 3) * 3}deg)`, transformOrigin: "50% 0", background: C.gold, border: `5px solid ${C.ink}`, padding: "4px 22px", fontFamily: "Anton", fontSize: 50, color: C.ink, boxShadow: "0 10px 24px rgba(0,0,0,.5)" }}>TOKO SUVENIR</div>
      ) : null}
      <Sea m={m} y={1190} glintX={760} />
      <Gulls seed={101} y={700} n={4} />
      <FGSea rim={m.sun} side="r" seed={102} />
      <BrandPlate x={560} y={1120} scale={0.8} />
      <div style={{ position: "absolute", left: 70, top: 380, transform: `translateX(${(1 - q1) * -200}px)`, opacity: q1, fontFamily: "Anton", fontSize: 112, color: C.cream, lineHeight: 1, textShadow: "0 8px 30px rgba(0,0,0,.6)" }}>NEGARA SUNGGUHAN?</div>
      <div style={{ position: "absolute", right: 70, top: 510, transform: `translateX(${(1 - q2) * 200}px)`, opacity: q2, fontFamily: "Anton", fontSize: 112, color: C.gold, lineHeight: 1, textAlign: "right", textShadow: "0 8px 30px rgba(0,0,0,.6)" }}>ATAU BENTENG TUA?</div>
      {bubble > 0 ? (
        <div style={{ position: "absolute", left: 120, top: 1250, transform: `scale(${bubble})`, transformOrigin: "left top", background: C.cream, color: C.ink, borderRadius: 30, padding: "18px 36px", fontFamily: "Jakarta", fontSize: 46, boxShadow: "0 18px 34px rgba(0,0,0,.45)" }}>💬 Tulis pendapatmu di komentar</div>
      ) : null}
    </AbsoluteFill>
  );
};

// =====================================================================================
// DIRECTOR
// =====================================================================================
type Cam = { s: number; x: number; y: number };
type SceneDef = { id: string; from: number; to: number; c0: Cam; c1: Cam; View: React.FC };
const SCENES: SceneDef[] = [
  { id: "hook", from: 0, to: T("Tahun") - 0.2, c0: { s: 1.0, x: 0, y: 0 }, c1: { s: 1.12, x: -20, y: -10 }, View: S_Hook },
  { id: "1943", from: T("Tahun") - 0.2, to: T("Pontonnya") - 0.2, c0: { s: 1.12, x: 0, y: 20 }, c1: { s: 1.0, x: 0, y: 0 }, View: S_1943 },
  { id: "ponton", from: T("Pontonnya") - 0.2, to: T("Saat") - 0.2, c0: { s: 1.0, x: 30, y: 0 }, c1: { s: 1.1, x: -20, y: 10 }, View: S_Ponton },
  { id: "chart", from: T("Saat") - 0.2, to: T("Perang") - 0.2, c0: { s: 1.1, x: 40, y: 0 }, c1: { s: 1.0, x: 0, y: 0 }, View: S_Chart },
  { id: "abandon", from: T("Perang") - 0.2, to: T("Lalu") - 0.2, c0: { s: 1.0, x: 0, y: 0 }, c1: { s: 1.1, x: 20, y: 0 }, View: S_Abandon },
  { id: "roy", from: T("Lalu") - 0.2, to: T("Setahun") - 0.2, c0: { s: 1.0, x: 0, y: 0 }, c1: { s: 1.14, x: -40, y: 30 }, View: S_Roy },
  { id: "shots", from: T("Setahun") - 0.2, to: T("Tapi") - 0.2, c0: { s: 1.1, x: -20, y: 0 }, c1: { s: 1.0, x: 20, y: 0 }, View: S_Shots },
  { id: "court", from: T("Tapi") - 0.2, to: T("Tahun", 1) - 0.2, c0: { s: 1.0, x: 0, y: 0 }, c1: { s: 1.1, x: 0, y: 20 }, View: S_Court },
  { id: "coup", from: T("Tahun", 1) - 0.2, to: T("Mereka") - 0.2, c0: { s: 1.0, x: 30, y: 0 }, c1: { s: 1.1, x: -20, y: 0 }, View: S_Coup },
  { id: "hostage", from: T("Mereka") - 0.2, to: T("Jerman", 2) - 0.2, c0: { s: 1.0, x: 0, y: 0 }, c1: { s: 1.12, x: 0, y: 30 }, View: S_Hostage },
  { id: "diplomat", from: T("Jerman", 2) - 0.2, to: T("Tapi", 1) - 0.2, c0: { s: 1.08, x: 0, y: 0 }, c1: { s: 1.0, x: -20, y: 0 }, View: S_Diplomat },
  { id: "1987", from: T("Tapi", 1) - 0.2, to: T("Meski") - 0.04, c0: { s: 1.0, x: 0, y: 0 }, c1: { s: 1.08, x: 0, y: 0 }, View: S_1987 },
  { id: "lord", from: T("Meski") - 0.04, to: T("Negara") - 0.2, c0: { s: 1.0, x: 0, y: 0 }, c1: { s: 1.1, x: 0, y: -20 }, View: S_Lord },
  { id: "cta", from: T("Negara") - 0.2, to: CHRONICLE_SECONDS, c0: { s: 1.1, x: 0, y: 0 }, c1: { s: 1.0, x: 0, y: 0 }, View: S_CTA },
];
const XF = 0.35; // cross-dissolve length

const Shot: React.FC<{ def: SceneDef; first: boolean }> = ({ def, first }) => {
  const { t } = useT();
  const p = interpolate(t, [def.from, def.to], [0, 1], { ...cl, easing: EIO });
  const c = { s: def.c0.s + (def.c1.s - def.c0.s) * p, x: def.c0.x + (def.c1.x - def.c0.x) * p, y: def.c0.y + (def.c1.y - def.c0.y) * p };
  const sway = { x: Math.sin(t * 0.55) * 9, y: Math.cos(t * 0.47) * 7, r: Math.sin(t * 0.33) * 0.35 };
  const a = first ? 1 : r(t, def.from, def.from + XF, 0, 1, EIO);
  const View = def.View;
  return (
    <AbsoluteFill style={{ opacity: a, transform: `translate(${c.x + sway.x}px, ${c.y + sway.y}px) scale(${c.s + (1 - a) * 0.06}) rotate(${sway.r}deg)`, transformOrigin: "540px 900px" }}>
      <View />
    </AbsoluteFill>
  );
};

// karaoke captions
type Chunk = { words: { t: string; s: number; e: number }[]; s: number; e: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Chunk["words"] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const len = cur.reduce((n, x) => n + x.t.length + 1, 0);
    const nextLen = i < WORDS.length - 1 ? WORDS[i + 1].t.length : 0;
    if (/[.,?!]$/.test(w.t) || cur.length >= 4 || len + nextLen > 28 || i === WORDS.length - 1) {
      out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
      cur = [];
    }
  });
  return out;
})();

const Karaoke: React.FC = () => {
  const { t } = useT();
  if (t > END_VO + 0.05) return null;
  let idx = -1;
  for (let i = 0; i < CHUNKS.length; i++) if (t >= CHUNKS[i].s - 0.12) idx = i;
  if (idx < 0) return null;
  const ch = CHUNKS[idx];
  if (!CHUNKS[idx + 1] && t > ch.e + 1.2) return null;
  const inP = r(t, ch.s - 0.12, ch.s + 0.08);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 400, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.1em 0.4em", maxWidth: 960, background: "rgba(11,12,16,.78)", borderRadius: 12, padding: "12px 28px 16px", fontFamily: "Jakarta", fontSize: 58, lineHeight: 1.18, color: C.cream, transform: `translateY(${(1 - inP) * 14}px)`, boxShadow: "0 14px 30px rgba(0,0,0,.45)" }}>
        {ch.words.map((w, i) => {
          const active = t >= w.s - 0.03 && t < w.e + 0.05;
          const said = t >= w.s - 0.03;
          return (
            <span key={i} style={{ display: "inline-block", color: active ? C.gold : said ? C.cream : "rgba(246,233,207,.55)", transform: active ? "scale(1.04)" : "none" }}>{w.t.replace(/[,]$/, "")}</span>
          );
        })}
      </div>
    </div>
  );
};

const FilmFinish: React.FC = () => {
  const f = useCurrentFrame();
  const seed = (f * 7) % 97;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 62% at 50% 45%, transparent 48%, rgba(0,0,0,.62) 100%)" }} />
      <AbsoluteFill style={{ background: "#FFB060", mixBlendMode: "soft-light", opacity: 0.16 }} />
      <svg width={W0} height={H0} style={{ position: "absolute", inset: 0, opacity: 0.13, mixBlendMode: "overlay" }}>
        <filter id={`grn${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W0} height={H0} filter={`url(#grn${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Chronicle: React.FC<{ cover?: boolean }> = ({ cover }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = cover ? 9.2 : frame / fps;
  const k = width / W0;
  const live = SCENES.map((s, i) => ({ s, i })).filter(({ s, i }) => (t >= s.from && t < s.to + (i < SCENES.length - 1 ? XF : 0)) || (i === 0 && t < s.from));
  return (
    <Ctx.Provider value={{ t, fps }}>
      <AbsoluteFill style={{ background: "#0B0C10", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: W0, height: H0, transform: `scale(${k})`, transformOrigin: "0 0", overflow: "hidden" }}>
          {live.map(({ s, i }) => <Shot key={s.id} def={s} first={i === 0} />)}
          {cover ? <CoverTitle /> : <Karaoke />}
          <FilmFinish />
        </div>
        {cover ? null : <AudiraOutro seconds={OUTRO_SECONDS} code="FAKTADUNIA" />}
        {cover ? null : <AudiraSignature seed="sealand-ep03" code="FAKTADUNIA" outroSeconds={OUTRO_SECONDS} />}
      </AbsoluteFill>
    </Ctx.Provider>
  );
};

const CoverTitle: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 1230, padding: "36px 80px 50px", background: "linear-gradient(180deg, rgba(11,12,16,0), rgba(11,12,16,.9) 30%)" }}>
    <div style={{ display: "inline-block", background: C.red, color: "#fff", fontFamily: "BarlowX", fontSize: 40, letterSpacing: 6, padding: "6px 20px" }}>FAKTA DUNIA</div>
    <div style={{ fontFamily: "Anton", fontSize: 128, lineHeight: 1.02, color: C.cream, marginTop: 14, textShadow: "0 8px 30px rgba(0,0,0,.6)" }}>
      NEGARA 400 m²
      <br />
      DI ATAS <span style={{ color: C.gold }}>BENTENG</span>
    </div>
  </div>
);

export const ChronicleCover: React.FC = () => <Chronicle cover />;
