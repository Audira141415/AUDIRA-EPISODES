// EP03 Sealand — AUDIRA Fakta Dunia. Style VISUALINVESTIGATION, Remotion 2D (React + SVG, no R3F).
// Every beat is anchored to a VO word (words.ts = Cartesia timings), never to a hand-typed second.
// Layout is authored in a 1080 × 1920 design space and scaled to the composition size.
import React, { createContext, useContext } from "react";
import {
  AbsoluteFill,
  Easing,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { AudiraSignature, signatureAnchorAt } from "../../brand/AudiraSignature.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { WORDS } from "./words.ts";

export const SEALAND_SECONDS = 91;
const OUTRO_SECONDS = 2.6;

// ---------- palette ----------
const PAPER = "#f5efe6";
const INK = "#292524";
const YEL = "#eab308";
const RED = "#dc2626";
const SEA = "#2b5d7a";
const SEA2 = "#3b7ea1";
const BLUEPRINT = "#1f4e79";

// ---------- fonts ----------
const ANTON = "AntonSL";
const GROTESK = "GroteskSL";
const SERIF = "SerifSL";
if (typeof document !== "undefined") {
  const h = delayRender("sealand fonts");
  Promise.all(
    [
      [ANTON, "fonts/Anton-Regular.ttf", "normal"],
      [GROTESK, "fonts/SpaceGrotesk-Variable.ttf", "normal"],
      [SERIF, "fonts/InstrumentSerif-Italic.ttf", "italic"],
    ].map(async ([fam, file, style]) => {
      const f = new FontFace(fam, `url(${staticFile(file)})`, { style });
      await f.load();
      (document.fonts as unknown as { add(f: FontFace): void }).add(f);
    }),
  ).then(
    () => continueRender(h),
    () => continueRender(h),
  );
}

// ---------- time helpers ----------
const W = (i: number) => WORDS[i].s;
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
const easeIO = Easing.bezier(0.65, 0, 0.35, 1);
const r = (t: number, a: number, b: number, from = 0, to = 1, e = easeOut) =>
  interpolate(t, [a, b], [from, to], { ...cl, easing: e });

const Ctx = createContext({ t: 0, fps: 30 });
const useT = () => useContext(Ctx);
const pop = (t: number, at: number, fps: number, damping = 11) =>
  t < at ? 0 : spring({ frame: (t - at) * fps, fps, config: { damping, stiffness: 180, mass: 0.7 } });

// ---------- scene table (anchored to VO words) ----------
type Cam = { s: number; x: number; y: number };
type SceneDef = { id: string; from: number; to: number; chip: string; cam: (t: number, a: number, b: number) => Cam };
const lin = (t: number, a: number, b: number, c0: Cam, c1: Cam): Cam => {
  const p = interpolate(t, [a, b], [0, 1], { ...cl, easing: easeIO });
  return { s: c0.s + (c1.s - c0.s) * p, x: c0.x + (c1.x - c0.x) * p, y: c0.y + (c1.y - c0.y) * p };
};
const keys = (t: number, k: [number, Cam][]): Cam => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) if (t <= k[i + 1][0]) return lin(t, k[i][0], k[i + 1][0], k[i][1], k[i + 1][1]);
  return k[k.length - 1][1];
};

const END_VO = SEALAND_SECONDS - OUTRO_SECONDS; // 88.4 s: outro card takes the last 2.6 s (VO ends 88.28)
const SCENES: SceneDef[] = [
  { id: "hook", from: 0, to: W(26) - 0.15, chip: "01 · KINI", cam: (t, a, b) => lin(t, a, b, { s: 1.0, x: 0, y: 20 }, { s: 1.12, x: 0, y: -10 }) },
  { id: "1943", from: W(26) - 0.15, to: W(62) - 0.15, chip: "02 · 1943", cam: (t) =>
      keys(t, [[W(26), { s: 1.02, x: 0, y: 0 }], [W(48), { s: 1.12, x: 20, y: 10 }], [W(49), { s: 1.0, x: 0, y: 0 }], [W(61) + 0.5, { s: 1.1, x: -30, y: 0 }]]) },
  { id: "1967", from: W(62) - 0.15, to: W(91) - 0.1, chip: "03 · 1967", cam: (t) =>
      keys(t, [[W(62), { s: 1.0, x: 0, y: 0 }], [W(71), { s: 1.06, x: 0, y: 10 }], [W(81), { s: 1.02, x: 0, y: 0 }], [W(90) + 0.5, { s: 1.07, x: 0, y: -20 }]]) },
  { id: "court", from: W(91) - 0.1, to: W(103) - 0.15, chip: "04 · 1968", cam: (t) =>
      keys(t, [[W(91), { s: 1.0, x: 0, y: 10 }], [W(95), { s: 1.08, x: 0, y: 30 }], [W(102) + 0.6, { s: 1.03, x: 0, y: 10 }]]) },
  { id: "1978", from: W(103) - 0.15, to: W(144) - 0.15, chip: "05 · 1978", cam: (t) =>
      keys(t, [
        [W(103), { s: 1.0, x: 0, y: 0 }],
        [W(113), { s: 1.06, x: -40, y: 10 }],
        [W(121), { s: 1.12, x: 30, y: 30 }],
        [W(129), { s: 1.08, x: 0, y: 0 }],
        [W(138), { s: 1.0, x: 30, y: -20 }],
        [W(143) + 0.8, { s: 1.06, x: 0, y: -30 }],
      ]) },
  { id: "1987", from: W(144) - 0.15, to: W(167) - 0.15, chip: "06 · 1987", cam: (t) =>
      keys(t, [[W(144), { s: 1.0, x: 0, y: 0 }], [W(148), { s: 1.02, x: 0, y: 0 }], [W(155), { s: 1.08, x: 0, y: 10 }], [W(166) + 0.5, { s: 1.03, x: 0, y: 0 }]]) },
  { id: "lord", from: W(167) - 0.15, to: W(186) - 0.15, chip: "07 · KINI", cam: (t, a, b) => lin(t, a, b, { s: 1.0, x: 0, y: 0 }, { s: 1.1, x: 0, y: -30 }) },
  { id: "outro", from: W(186) - 0.15, to: SEALAND_SECONDS, chip: "", cam: (t, a, b) => lin(t, a, b, { s: 1.1, x: 0, y: 0 }, { s: 1.0, x: 0, y: 0 }) },
];

// ---------- primitives ----------
const Abs: React.FC<{ x: number; y: number; w?: number; h?: number; rot?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, rot = 0, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg)`, ...style }}>{children}</div>
);

const Paper: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; bg?: string; children?: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, h, rot = 0, bg = PAPER, children, style }) => (
  <Abs
    x={x}
    y={y}
    w={w}
    h={h}
    rot={rot}
    style={{
      backgroundColor: bg,
      backgroundImage: "linear-gradient(160deg, rgba(255,255,255,0.18), rgba(0,0,0,0) 40%, rgba(120,80,30,0.08))",
      boxShadow: "0 40px 70px rgba(40,18,4,0.55), 0 8px 16px rgba(40,18,4,0.38)",
      borderRadius: 6,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </Abs>
);

const Pin: React.FC<{ x: number; y: number; color?: string }> = ({ x, y, color = RED }) => (
  <div style={{ position: "absolute", left: x - 16, top: y - 16, width: 32, height: 32, borderRadius: 16, background: `radial-gradient(circle at 35% 30%, #fff8, ${color} 45%, #7f1d1d)`, boxShadow: "4px 8px 8px rgba(40,20,5,0.45)" }} />
);

const Stamp: React.FC<{ at: number; x: number; y: number; text: string; size?: number; rot?: number; color?: string }> = ({ at, x, y, text, size = 84, rot = -9, color = RED }) => {
  const { t, fps } = useT();
  if (t < at) return null;
  const p = pop(t, at, fps, 9);
  const s = interpolate(p, [0, 1], [2.3, 1]);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`,
        opacity: Math.min(1, (t - at) * 9) * 0.92,
        color,
        border: `${Math.round(size * 0.08)}px solid ${color}`,
        outline: `${Math.round(size * 0.03)}px solid ${color}`,
        outlineOffset: Math.round(size * 0.06),
        fontFamily: ANTON,
        fontSize: size,
        lineHeight: 1.05,
        padding: "0.06em 0.32em",
        letterSpacing: "0.05em",
        borderRadius: 14,
        whiteSpace: "nowrap",
        background: "rgba(250,246,238,0.94)",
        textAlign: "center",
      }}
    >
      {text}
    </div>
  );
};

/** Kinetic HUD data card: drops in on its word, the big value can count. */
const Callout: React.FC<{ at: number; until?: number; x: number; y: number; big: string | ((t: number) => string); small: string; accent?: string; rot?: number; size?: number }> = ({ at, until = 1e9, x, y, big, small, accent = YEL, rot = -2, size = 104 }) => {
  const { t, fps } = useT();
  if (t < at - 0.05 || t > until) return null;
  const p = pop(t, at, fps, 10);
  const val = typeof big === "function" ? big(t) : big;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translateY(${(1 - p) * 60}px) rotate(${rot + (1 - p) * 6}deg) scale(${0.6 + 0.4 * p})`,
        transformOrigin: "left top",
        opacity: Math.min(1, p * 1.6),
        background: INK,
        color: PAPER,
        padding: "18px 30px 20px 34px",
        borderLeft: `14px solid ${accent}`,
        borderRadius: 10,
        boxShadow: "0 22px 40px rgba(30,15,5,0.5)",
      }}
    >
      <div style={{ fontFamily: ANTON, fontSize: size, lineHeight: 1.2, color: accent, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>{val}</div>
      <div style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: 36, letterSpacing: "0.06em", marginTop: 10, whiteSpace: "nowrap" }}>{small}</div>
    </div>
  );
};

/** Small ink label tag with a pointer line. */
const Tag: React.FC<{ at: number; until?: number; x: number; y: number; text: string; color?: string; bg?: string; size?: number; rot?: number }> = ({ at, until = 1e9, x, y, text, color = INK, bg = YEL, size = 40, rot = 0 }) => {
  const { t, fps } = useT();
  if (t < at || t > until) return null;
  const p = pop(t, at, fps, 12);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${p})`,
        background: bg,
        color,
        fontFamily: GROTESK,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "0.08em",
        padding: "8px 18px",
        borderRadius: 6,
        whiteSpace: "nowrap",
        boxShadow: "0 10px 18px rgba(30,15,5,0.35)",
      }}
    >
      {text}
    </div>
  );
};

const Mark: React.FC<{ at: number; dur?: number; children: React.ReactNode }> = ({ at, dur = 0.6, children }) => {
  const { t } = useT();
  const p = r(t, at, at + dur);
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(transparent 12%, rgba(234,179,8,0.8) 12%, rgba(234,179,8,0.8) 90%, transparent 90%)`,
        backgroundSize: `${p * 100}% 100%`,
        backgroundRepeat: "no-repeat",
      }}
    >
      {children}
    </span>
  );
};

/** Red string between two board points, drawn on its word. */
const RedString: React.FC<{ at: number; x1: number; y1: number; x2: number; y2: number }> = ({ at, x1, y1, x2, y2 }) => {
  const { t } = useT();
  const p = r(t, at, at + 0.6);
  if (p <= 0) return null;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + 40;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
      <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} stroke="#b91c1c" strokeWidth={5} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} style={{ filter: "drop-shadow(3px 6px 3px rgba(40,20,5,0.35))" }} />
    </svg>
  );
};

// ---------- illustrations ----------
const SealandFlag: React.FC<{ w?: number }> = ({ w = 84 }) => {
  const h = w * 0.62;
  return (
    <g>
      <rect width={w} height={h} fill="#fff" />
      <polygon points={`0,0 ${w * 0.74},0 0,${h * 0.74}`} fill={RED} />
      <polygon points={`${w},${h * 0.26} ${w},${h} ${w * 0.26},${h}`} fill="#111" />
      <rect width={w} height={h} fill="none" stroke="#0003" strokeWidth={1.5} />
    </g>
  );
};

const Crown: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = "#f59e0b" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-50,20 L-56,-30 L-28,-4 L0,-42 L28,-4 L56,-30 L50,20 Z" fill={color} stroke="#7c2d12" strokeWidth={4} strokeLinejoin="round" />
    <rect x={-52} y={18} width={104} height={14} rx={4} fill={color} stroke="#7c2d12" strokeWidth={4} />
    <circle cx={0} cy={-46} r={7} fill={RED} />
    <circle cx={-56} cy={-34} r={6} fill={RED} />
    <circle cx={56} cy={-34} r={6} fill={RED} />
  </g>
);

/** Maunsell sea fort (Roughs Tower), side view, 600 × 600 box, base at y 600. */
const Fort: React.FC<{ flag?: number; sil?: string; red?: number }> = ({ flag = 1, sil, red = 0 }) => {
  const { t } = useT();
  const c = (col: string) => sil ?? col;
  const fy = 24 + (1 - flag) * 110;
  const wave = Math.sin(t * 6) * 5;
  return (
    <g>
      <defs>
        <linearGradient id="tower" x1="0" x2="1">
          <stop offset="0" stopColor={c("#6f737a")} />
          <stop offset="0.35" stopColor={c("#c9ccd0")} />
          <stop offset="0.7" stopColor={c("#7b7f86")} />
          <stop offset="1" stopColor={c("#45484d")} />
        </linearGradient>
      </defs>
      {/* towers */}
      {[175, 355].map((x) => (
        <g key={x}>
          <rect x={x} y={250} width={70} height={350} fill="url(#tower)" />
          {[320, 390, 460, 530].map((y) => (
            <rect key={y} x={x} y={y} width={70} height={5} fill={c("#3f4246")} opacity={0.5} />
          ))}
        </g>
      ))}
      {/* deck + railing */}
      <rect x={128} y={222} width={344} height={32} fill={c("#4a4744")} />
      <rect x={128} y={252} width={344} height={8} fill={c("#2e2b29")} />
      <rect x={128} y={196} width={344} height={4} fill={c("#3a3735")} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={132 + i * 30} y={196} width={4} height={28} fill={c("#3a3735")} />
      ))}
      {/* main building */}
      <rect x={160} y={140} width={280} height={84} fill={c("#8d9299")} />
      <rect x={160} y={140} width={280} height={10} fill={c("#5e6268")} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={178 + i * 44} y={168} width={24} height={30} fill={c("#2b2f36")} />
      ))}
      <rect x={330} y={98} width={92} height={44} fill={c("#a0a5ab")} />
      <rect x={344} y={110} width={20} height={20} fill={c("#2b2f36")} />
      {/* radio mast */}
      <g stroke={c("#3b3f45")} strokeWidth={5} fill="none">
        <line x1={200} y1={140} x2={212} y2={30} />
        <line x1={232} y1={140} x2={218} y2={30} />
        <line x1={204} y1={110} x2={228} y2={110} />
        <line x1={207} y1={80} x2={224} y2={80} />
        <line x1={210} y1={52} x2={221} y2={52} />
      </g>
      {/* flag pole + Sealand flag */}
      <rect x={298} y={10} width={5} height={132} fill={c("#2e2b29")} />
      {!sil ? (
        <g transform={`translate(304 ${fy}) skewY(${wave * 0.6})`}>
          <SealandFlag w={88} />
        </g>
      ) : null}
      {red > 0 ? <rect x={120} y={90} width={360} height={510} fill={RED} opacity={red * 0.35} style={{ mixBlendMode: "multiply" }} /> : null}
    </g>
  );
};

const wavePath = (w: number, y0: number, amp: number, len: number, phase: number, bottom: number) => {
  let d = `M0,${bottom} L0,${y0}`;
  for (let x = 0; x <= w; x += 12) d += ` L${x},${(y0 + Math.sin(x / len + phase) * amp + Math.sin(x / (len * 0.47) - phase * 1.3) * amp * 0.4).toFixed(1)}`;
  return d + ` L${w},${bottom} Z`;
};

const Sea: React.FC<{ w: number; y: number; h: number; back?: string; front?: string; foam?: boolean }> = ({ w, y, h, back = SEA, front = SEA2, foam = true }) => {
  const { t } = useT();
  return (
    <g>
      <path d={wavePath(w, y, 9, 38, t * 1.6, y + h)} fill={back} />
      <path d={wavePath(w, y + 26, 11, 52, -t * 2.1 + 1, y + h)} fill={front} opacity={0.92} />
      {foam ? <path d={wavePath(w, y + 26, 11, 52, -t * 2.1 + 1, y + 34).replace(/ Z$/, "")} fill="none" stroke="#e0f2fe" strokeWidth={4} opacity={0.6} /> : null}
    </g>
  );
};

const Gull: React.FC<{ x: number; y: number; s?: number; ph?: number; color?: string }> = ({ x, y, s = 1, ph = 0, color = "#3f3f46" }) => {
  const { t } = useT();
  const f = Math.sin(t * 9 + ph) * 10;
  return <path transform={`translate(${x} ${y}) scale(${s})`} d={`M-26,${f} Q-13,-14 0,0 Q13,-14 26,${f}`} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" />;
};

const Heli: React.FC<{ color?: string }> = ({ color = INK }) => {
  const { t } = useT();
  const rot = Math.sin(t * 40) * 60;
  return (
    <g fill={color}>
      <ellipse cx={0} cy={0} rx={46} ry={26} />
      <rect x={30} y={-8} width={80} height={12} rx={6} />
      <rect x={104} y={-24} width={8} height={30} />
      <rect x={-4} y={-38} width={8} height={14} />
      <rect x={-rot - 6} y={-44} width={2 * Math.abs(rot) + 12} height={6} rx={3} />
      <rect x={-30} y={26} width={60} height={5} />
      <rect x={-22} y={20} width={5} height={10} />
      <rect x={16} y={20} width={5} height={10} />
      <ellipse cx={-22} cy={-4} rx={16} ry={12} fill="#bfdbfe" opacity={0.9} />
    </g>
  );
};

const Plane: React.FC<{ color?: string; s?: number }> = ({ color = INK, s = 1 }) => (
  <g fill={color} transform={`scale(${s})`}>
    <path d="M-60,0 Q-40,-9 50,-6 Q66,0 50,6 Q-40,9 -60,0 Z" />
    <path d="M0,-4 L-24,-46 L-10,-46 L22,-4 Z" />
    <path d="M0,4 L-24,46 L-10,46 L22,4 Z" />
    <path d="M-50,-2 L-62,-22 L-54,-22 L-40,-2 Z" />
  </g>
);

const Ship: React.FC<{ color?: string }> = ({ color = INK }) => (
  <g fill={color}>
    <path d="M-90,0 L90,0 L70,30 L-80,30 Z" />
    <rect x={-50} y={-30} width={70} height={30} />
    <rect x={-30} y={-52} width={34} height={22} />
    <rect x={30} y={-20} width={8} height={20} />
  </g>
);

const Person: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = INK }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
    <circle cx={0} cy={-62} r={30} />
    <path d="M-62,40 Q-60,-22 0,-24 Q60,-22 62,40 Z" />
  </g>
);

const DE: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 72 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width={w} height={w * 0.6} fill="#111" />
    <rect y={w * 0.2} width={w} height={w * 0.2} fill="#dd0000" />
    <rect y={w * 0.4} width={w} height={w * 0.2} fill="#ffce00" />
  </g>
);
const NL: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 72 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width={w} height={w * 0.6} fill="#21468b" />
    <rect width={w} height={w * 0.4} fill="#fff" />
    <rect width={w} height={w * 0.2} fill="#ae1c28" />
  </g>
);

// ---------- map (coast + territorial-sea bands), 900 × 760 box, 1 mile = 36 px ----------
const MILE = 36;
const coastX = (y: number) => 230 + Math.sin(y / 95) * 26 + Math.sin(y / 37 + 1) * 8 + (y > 520 ? (y - 520) * 0.35 : 0);
const FORT_Y = 380;
const FORT_X = coastX(FORT_Y) + 7 * MILE;
const bandPath = (miles: number) => {
  let d = "";
  for (let y = 0; y <= 760; y += 10) d += `${y === 0 ? "M" : " L"}${(coastX(y) + miles * MILE).toFixed(1)},${y}`;
  return d;
};
const landPath = () => {
  let d = "M0,0";
  for (let y = 0; y <= 760; y += 10) d += ` L${coastX(y).toFixed(1)},${y}`;
  return d + " L0,760 Z";
};

const SeaMap: React.FC<{ miles: number; zoneAt: number; fortRed?: number; ruler?: number }> = ({ miles, zoneAt, fortRed = 0, ruler = 0 }) => {
  const { t } = useT();
  const zp = r(t, zoneAt, zoneAt + 0.8);
  let zone = "";
  for (let y = 0; y <= 760; y += 10) zone += `${y === 0 ? "M" : " L"}${coastX(y).toFixed(1)},${y}`;
  for (let y = 760; y >= 0; y -= 10) zone += ` L${(coastX(y) + miles * MILE).toFixed(1)},${y}`;
  zone += " Z";
  const pulse = 1 + Math.sin(t * 6) * 0.08;
  return (
    <svg viewBox="0 0 900 760" width="100%" height="100%">
      <defs>
        <pattern id="hatch" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="16" height="16" fill="rgba(220,38,38,0.10)" />
          <rect width="5" height="16" fill="rgba(220,38,38,0.22)" />
        </pattern>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M60,0 L0,0 0,60" fill="none" stroke="#1e3a5f22" strokeWidth={2} />
        </pattern>
      </defs>
      <rect width={900} height={760} fill="#d8e6ee" />
      <rect width={900} height={760} fill="url(#grid)" />
      {[60, 120, 180].map((o, i) => (
        <path key={o} d={bandPath(o / MILE)} stroke="#2b5d7a33" strokeWidth={2} fill="none" strokeDasharray={i === 1 ? "2 10" : "none"} />
      ))}
      <path d={zone} fill="url(#hatch)" opacity={zp} />
      <path d={bandPath(miles)} stroke={RED} strokeWidth={6} fill="none" strokeDasharray="22 12" opacity={zp} />
      <path d={landPath()} fill="#e8dcc4" stroke="#6b5b45" strokeWidth={4} />
      <path d={landPath()} fill="none" stroke="#b9a582" strokeWidth={14} opacity={0.35} />
      {[
        ["SUFFOLK", 40, 170],
        ["ESSEX", 40, 640],
      ].map(([n, x, y]) => (
        <text key={n as string} x={x as number} y={y as number} fontFamily={GROTESK} fontWeight={700} fontSize={40} fill="#6b5b45" letterSpacing={2}>
          {n}
        </text>
      ))}
      {[
        ["Felixstowe", 300],
        ["Harwich", 480],
      ].map(([n, y]) => (
        <g key={n as string}>
          <circle cx={coastX(y as number) - 22} cy={y as number} r={9} fill={INK} />
          <text x={coastX(y as number) - 40} y={(y as number) + 12} textAnchor="end" fontFamily={GROTESK} fontWeight={700} fontSize={38} fill={INK}>
            {n}
          </text>
        </g>
      ))}
      <text x={860} y={90} textAnchor="end" fontFamily={GROTESK} fontWeight={700} fontSize={40} fill="#2b5d7a" letterSpacing={2}>
        LAUT UTARA
      </text>
      {ruler > 0 ? (
        <g opacity={Math.min(1, ruler * 2)}>
          <line x1={coastX(FORT_Y)} y1={FORT_Y + 60} x2={coastX(FORT_Y) + 7 * MILE * ruler} y2={FORT_Y + 60} stroke={INK} strokeWidth={5} />
          {Array.from({ length: Math.floor(7 * ruler) + 1 }, (_, i) => (
            <line key={i} x1={coastX(FORT_Y) + i * MILE} y1={FORT_Y + 48} x2={coastX(FORT_Y) + i * MILE} y2={FORT_Y + 72} stroke={INK} strokeWidth={4} />
          ))}
        </g>
      ) : null}
      <g transform={`translate(${FORT_X} ${FORT_Y}) scale(${pulse})`}>
        <circle r={30} fill={fortRed > 0.5 ? RED : YEL} opacity={0.35} />
        <rect x={-14} y={-14} width={28} height={28} fill={fortRed > 0.5 ? RED : INK} stroke="#fff" strokeWidth={4} />
      </g>
      <text x={FORT_X + 40} y={FORT_Y - 22} fontFamily={ANTON} fontSize={38} fill={INK}>
        SEALAND
      </text>
    </svg>
  );
};

// ---------- persistent desk ----------
const Desk: React.FC = () => {
  const { t } = useT();
  const dx = Math.sin(t * 0.21) * 14, dy = Math.cos(t * 0.17) * 10;
  return (
    <AbsoluteFill style={{ background: "#a8743f" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${dx}px, ${dy}px) scale(1.04)`,
          background: [
            "repeating-linear-gradient(91deg, rgba(92,52,18,0.16) 0 3px, transparent 3px 23px)",
            "repeating-linear-gradient(89.3deg, rgba(255,226,180,0.10) 0 2px, transparent 2px 47px)",
            "repeating-linear-gradient(90deg, transparent 0 260px, rgba(70,38,12,0.30) 260px 263px, transparent 263px 360px)",
            "linear-gradient(180deg, #b98048, #9c6533)",
          ].join(","),
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 48% at 50% 40%, rgba(255,240,205,0.55), rgba(255,220,170,0.12) 55%, rgba(50,24,6,0.38) 100%)" }} />
      {/* coffee ring + paper clips: desk life in the margins */}
      <div style={{ position: "absolute", left: 820 + dx * 1.3, top: 1240 + dy, width: 210, height: 210, borderRadius: 105, border: "10px solid rgba(90,45,15,0.22)" }} />
      <div style={{ position: "absolute", left: 40 + dx * 1.3, top: 1180 + dy, width: 90, height: 30, borderRadius: 15, border: "5px solid #9ca3af", transform: "rotate(-24deg)" }} />
    </AbsoluteFill>
  );
};

/** Foreground depth: blurred pencil + magnifier drifting against the camera. */
const Foreground: React.FC = () => {
  const { t } = useT();
  const dx = -Math.sin(t * 0.21) * 40, dy = -Math.cos(t * 0.17) * 26;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: -60 + dx, top: 1560 + dy, width: 520, height: 34, borderRadius: 8, background: "linear-gradient(180deg,#facc15,#ca8a04)", transform: "rotate(-14deg)", filter: "blur(5px)", boxShadow: "0 30px 40px rgba(30,15,5,0.4)" }} />
      <div style={{ position: "absolute", left: 790 + dx * 1.2, top: 1600 + dy, width: 330, height: 330, borderRadius: 165, border: "26px solid #3f2a18", background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.4), rgba(200,220,240,0.12) 60%)", filter: "blur(6px)" }} />
    </AbsoluteFill>
  );
};

/** In-world brand: the case-folder tab. */
const FolderTab: React.FC<{ chip: string }> = ({ chip }) => {
  const { t, fps } = useT();
  const p = pop(t, 0.1, fps, 14);
  // The moving signature's top-right anchor sits on this chip: hide the chip while it is there.
  const sigAt = (x: number) => signatureAnchorAt("sealand-ep03", x) === 0;
  const chipVis = sigAt(t) ? 0 : Math.min(1, sigAt(t + 0.5) ? (Math.ceil(t / 18) * 18 - t) / 0.5 : 1, sigAt(t - 0.5) ? (t - Math.floor(t / 18) * 18) / 0.5 : 1);
  return (
    <>
      <div style={{ position: "absolute", left: 46, top: 196, transform: `translateY(${(1 - p) * -120}px) rotate(-1.2deg)`, background: "#e9c98b", borderRadius: "16px 16px 4px 4px", padding: "14px 30px", boxShadow: "0 14px 24px rgba(40,20,5,0.4)", fontFamily: GROTESK, fontWeight: 700, fontSize: 38, letterSpacing: "0.1em", color: INK }}>
        AUDIRA // BERKAS SEALAND
      </div>
      {chip && chipVis > 0 ? (
        <div style={{ position: "absolute", right: 46, top: 200, opacity: chipVis, transform: `translateY(${(1 - p) * -120}px) rotate(1.5deg)`, background: INK, color: YEL, borderRadius: 8, padding: "10px 20px", fontFamily: GROTESK, fontWeight: 700, fontSize: 38, letterSpacing: "0.04em" }}>
          {chip}
        </div>
      ) : null}
    </>
  );
};

// ---------- karaoke captions (local, full width, gap 0.4em) ----------
type Chunk = { words: { t: string; s: number; e: number }[]; s: number; e: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Chunk["words"] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const len = cur.reduce((n, x) => n + x.t.length + 1, 0);
    const nextLen = i < WORDS.length - 1 ? WORDS[i + 1].t.length : 0;
    const brk = /[.,?!]$/.test(w.t) || cur.length >= 4 || len + nextLen > 30 || i === WORDS.length - 1;
    if (brk) {
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
  const next = CHUNKS[idx + 1];
  if (!next && t > ch.e + 1.2) return null;
  const inP = r(t, ch.s - 0.12, ch.s + 0.08);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, bottom: 392, display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.12em 0.4em",
          maxWidth: 1000,
          background: "rgba(41,37,36,0.92)",
          borderRadius: 18,
          padding: "16px 26px 20px",
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 58,
          lineHeight: 1.18,
          color: PAPER,
          transform: `translateY(${(1 - inP) * 16}px)`,
          boxShadow: "0 18px 36px rgba(30,15,5,0.45)",
        }}
      >
        {ch.words.map((w, i) => {
          const active = t >= w.s - 0.03 && t < w.e + 0.05;
          const said = t >= w.s - 0.03;
          return (
            <span
              key={i}
              style={{
                padding: "0 0.12em",
                borderRadius: 8,
                background: active ? YEL : "transparent",
                color: active ? INK : said ? PAPER : "rgba(245,239,230,0.6)",
                transform: active ? "scale(1.04)" : "none",
                display: "inline-block",
              }}
            >
              {w.t.replace(/[,]$/, "")}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- scenes ----------
const S1Hook: React.FC = () => {
  const { t, fps } = useT();
  const crown = pop(t, W(25), fps, 9);
  const circ = r(t, W(13), W(14) + 0.3);
  return (
    <>
      <Paper x={100} y={330} w={880} h={800} rot={-2} bg="#fbf8f2">
        <div style={{ position: "absolute", left: 30, top: 30, right: 30, bottom: 110, overflow: "hidden", background: "linear-gradient(180deg,#c9d6de,#efe6d3 70%)" }}>
          <svg viewBox="0 0 820 660" width="100%" height="100%">
            <circle cx={640} cy={150} r={70} fill="#fde68a" opacity={0.7} />
            <Gull x={140 + t * 18} y={120} s={0.9} />
            <Gull x={230 + t * 15} y={170} s={0.7} ph={1.4} />
            <g transform="translate(110 40) scale(1.0)">
              <Fort />
              {crown > 0 ? (
                <g transform={`translate(348 ${-10 - crown * 18}) scale(${crown * 0.75})`}>
                  <Crown x={0} y={0} />
                </g>
              ) : null}
              {circ > 0 ? (
                <g fill="none" stroke={RED} strokeWidth={7}>
                  <ellipse cx={210} cy={430} rx={70} ry={150} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - circ} />
                  <ellipse cx={390} cy={430} rx={70} ry={150} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - circ} />
                </g>
              ) : null}
            </g>
            <Sea w={820} y={520} h={140} />
          </svg>
        </div>
        <div style={{ position: "absolute", left: 40, bottom: 26, fontFamily: SERIF, fontStyle: "italic", fontSize: 54, color: INK }}>Exhibit A — Roughs Tower</div>
        <div style={{ position: "absolute", right: 40, bottom: 36, fontFamily: GROTESK, fontWeight: 700, fontSize: 38, color: "#78716c", letterSpacing: "0.06em" }}>LAUT UTARA</div>
      </Paper>
      <Pin x={540} y={346} />
      <Callout at={W(5)} x={70} y={1150} big={(tt) => `±${Math.round(r(tt, W(5), W(8), 0, 400))} m²`} small="LUAS SELURUH NEGARA" />
      <Tag at={W(13)} x={770} y={980} text="2 TIANG BETON" bg={RED} color="#fff" rot={3} />
      <Callout at={W(19) + 0.2} x={600} y={1170} big="SEALAND" small="NAMA NEGARANYA" accent={RED} size={76} rot={2} />
      <Stamp at={W(22)} x={300} y={600} text="NEGARA?" size={96} rot={-10} />
      <Tag at={W(25)} x={760} y={430} text="PUNYA PANGERAN" bg={YEL} rot={4} />
    </>
  );
};

const S2Fort1943: React.FC = () => {
  const { t } = useT();
  // tug tows the pontoon in, then it sinks onto the sandbank
  const tow = r(t, W(38) - 0.2, W(43), 0, 1, easeIO);
  const sink = r(t, W(44), W(47) + 0.2, 0, 1, easeIO);
  const fx = -200 + tow * 260;
  const fy = 0 + sink * 160;
  const bubbles = t > W(44) && t < W(48) + 0.6;
  const planeX = r(t, W(33) - 0.3, W(37) + 0.6, -200, 980, (x) => x);
  const mapIn = r(t, W(49) - 0.35, W(49) + 0.25);
  const ruler = r(t, W(49), W(53));
  return (
    <>
      <Paper x={60} y={300} w={960} h={800} rot={1.2} bg={BLUEPRINT} style={{ backgroundImage: "none" }}>
        <svg viewBox="0 0 960 1010" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ backgroundColor: BLUEPRINT }}>
          <defs>
            <pattern id="bpgrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40,0 L0,0 0,40" fill="none" stroke="#ffffff1c" strokeWidth={2} />
            </pattern>
          </defs>
          <rect width={960} height={1010} fill={BLUEPRINT} />
          <rect width={960} height={1010} fill="url(#bpgrid)" />
          <rect x={20} y={118} width={920} height={774} fill="none" stroke="#ffffffaa" strokeWidth={3} />
          {mapIn < 0.3 ? (
            <>
          <text x={920} y={190} textAnchor="end" fontFamily={ANTON} fontSize={64} fill="#fff" style={{ color: "#fff" }} letterSpacing={2}>HM FORT ROUGHS</text>
          <text x={920} y={244} textAnchor="end" fontFamily={GROTESK} fontWeight={700} fontSize={40} fill="#bfdbfe" style={{ color: "#bfdbfe" }} letterSpacing={3}>ARSIP AUDIRA · 1943</text>
            </>
          ) : null}
          {/* German minelayer plane + tracers */}
          <g transform={`translate(${planeX} 330)`} opacity={t < W(38) ? 1 : r(t, W(38), W(38) + 0.4, 1, 0)}>
            <Plane color="#fca5a5" s={1.1} />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={-40 - i * 70} cy={40 + ((t * 2 + i) % 1) * 80} r={10} fill="none" stroke="#fca5a5" strokeWidth={4} />
            ))}
          </g>
          {t > W(33) && t < W(38) ? (
            <g stroke={YEL} strokeWidth={4} strokeDasharray="12 14" strokeDashoffset={-t * 300}>
              <line x1={480} y1={560} x2={planeX} y2={330} />
            </g>
          ) : null}
          {/* water line + seabed */}
          <line x1={20} y1={520} x2={940} y2={520} stroke="#7dd3fc" strokeWidth={4} strokeDasharray="20 10" />
                    <path d="M20,790 Q300,740 480,712 Q680,730 940,790 L940,890 L20,890 Z" fill="#fde68a33" stroke="#fde68a" strokeWidth={3} />
          {mapIn <= 0 ? <text x={60} y={862} fontFamily={GROTESK} fontWeight={700} fontSize={40} fill="#fde68a" style={{ color: "#fde68a" }} letterSpacing={2}>GOSONG PASIR</text> : null}
          {/* tug */}
          <g transform={`translate(${fx + 520 - sink * 200} ${508}) scale(0.7)`} opacity={1 - sink}>
            <Ship color="#e0f2fe" />
          </g>
          {tow > 0 && sink < 1 ? <line x1={fx + 450} y1={520} x2={fx + 460 - sink * 140} y2={510} stroke="#e0f2fe" strokeWidth={3} /> : null}
          {/* fort + pontoon, line drawing */}
          <g transform={`translate(${fx + 120} ${fy + 120}) scale(0.62)`} style={{ filter: "drop-shadow(0 0 2px #fff)" }}>
            <Fort sil="#dbeafe" />
            <rect x={110} y={600} width={380} height={90} fill="#12324f" stroke="#fff" strokeWidth={4} />
            <text x={300} y={660} textAnchor="middle" fontFamily={GROTESK} fontWeight={700} fontSize={64} fill="#fff" style={{ color: "#fff" }} opacity={r(tow, 0.3, 0.45)}>PONTON</text>
          </g>
          {bubbles
            ? Array.from({ length: 10 }, (_, i) => (
                <circle key={i} cx={fx + 220 + (i % 5) * 40} cy={700 - (((t - W(44)) * 160 + i * 37) % 260)} r={6 + (i % 3) * 3} fill="none" stroke="#e0f2fe" strokeWidth={3} />
              ))
            : null}
        </svg>
      </Paper>
      <Callout at={W(27)} until={W(35) - 0.1} x={70} y={1130} big="1943" small="INGGRIS MEMBANGUN BENTENG" />
      <Tag at={W(35)} until={W(43)} x={540} y={1220} text="PESAWAT JERMAN PENEBAR RANJAU" bg={RED} color="#fff" size={38} />
      <Tag at={W(44)} until={W(49) - 0.3} x={740} y={1230} text="DITENGGELAMKAN" bg={YEL} size={44} rot={-4} />
      {/* map card slides over the blueprint */}
      {mapIn > 0 ? (
        <Paper x={70 + (1 - mapIn) * 1100} y={310} w={940} h={790} rot={-1.5}>
          <div style={{ position: "absolute", left: 20, top: 20, right: 20, height: 680 }}>
            <SeaMap miles={3} zoneAt={W(56)} ruler={ruler} />
          </div>
          <div style={{ position: "absolute", left: 30, bottom: 22, fontFamily: GROTESK, fontSize: 40, color: INK, fontWeight: 600 }}>
            Batas laut Inggris 1943: <Mark at={W(60)}>3 mil laut</Mark>
          </div>
        </Paper>
      ) : null}
      <Callout at={W(49) + 0.1} x={560} y={1130} big={(tt) => `${Math.round(r(tt, W(49), W(53), 0, 7))} MIL LAUT`} small="DARI PANTAI SUFFOLK" size={84} rot={2} />
      <Callout at={W(56)} x={60} y={1130} big="BATAS 3 MIL" small="BENTENG DI LUARNYA" accent={RED} size={80} />
    </>
  );
};

const S3Board1967: React.FC = () => {
  const { t } = useT();
  const flag = r(t, W(77), W(80), 0, 1, easeIO);
  const sepia = r(t, W(71), W(77), 1, 0);
  const shot = t > W(85) && t < W(91);
  const flash = shot ? Math.max(0, Math.sin((t - W(85)) * 22)) : 0;
  const card68 = r(t, W(82) - 0.35, W(82) + 0.3);
  return (
    <>
      {card68 < 1 ? (
      <>
      {/* fort polaroid */}
      <Paper x={50} y={340} w={520} h={620} rot={-3} bg="#fbf8f2">
        <div style={{ position: "absolute", left: 22, top: 22, right: 22, bottom: 90, overflow: "hidden", background: "linear-gradient(180deg,#b7c4cc,#e7dcc6)", filter: `sepia(${sepia}) contrast(${1 - sepia * 0.1})` }}>
          <svg viewBox="0 0 600 580" width="100%" height="100%">
            <Gull x={90 + (t - W(62)) * 25} y={90} s={0.8} />
            <Gull x={160 + (t - W(62)) * 20} y={140} s={0.6} ph={2} />
            <g transform="translate(20 -10) scale(0.92)">
              <Fort flag={flag} />
            </g>
            <Sea w={600} y={480} h={110} />
          </svg>
        </div>
        <div style={{ position: "absolute", left: 26, bottom: 20, fontFamily: SERIF, fontStyle: "italic", fontSize: 46, color: INK }}>{t < W(77) ? "1956 — kosong" : "1967 — diduduki"}</div>
      </Paper>
      <Pin x={310} y={356} />
      <Stamp at={W(64)} x={330} y={600} text="DITINGGALKAN" size={60} rot={-14} />
      {/* Roy Bates dossier with pirate-radio mast */}
      <Paper x={600} y={370} w={420} h={580} rot={2.5}>
        <svg viewBox="0 0 420 580" width="100%" height="100%">
          <rect x={30} y={30} width={360} height={290} fill="#d6d3d1" />
          <Person x={170} y={318} s={1.7} color="#57534e" />
          {[0, 1, 2].map((i) => {
            const k = (t * 0.9 + i / 3) % 1;
            return <circle key={i} cx={330} cy={80} r={14 + k * 70} fill="none" stroke={RED} strokeWidth={4} opacity={(1 - k) * (t > W(74) ? 1 : 0.2)} />;
          })}
          <path d="M330,78 L306,300 M330,78 L354,300 M312,240 L348,240 M318,170 L342,170" stroke={INK} strokeWidth={6} fill="none" />
          <text x={30} y={392} fontFamily={ANTON} fontSize={62} fill={INK}>ROY BATES</text>
          <text x={30} y={446} fontFamily={GROTESK} fontWeight={700} fontSize={38} fill="#57534e">PEMILIK RADIO</text>
          <text x={30} y={494} fontFamily={GROTESK} fontWeight={700} fontSize={38} fill="#57534e">BAJAK LAUT</text>
        </svg>
      </Paper>
      <Pin x={810} y={388} />
      <RedString at={W(71)} x1={310} y1={356} x2={810} y2={388} />
      <Tag at={W(74)} until={W(82)} x={780} y={990} text="RADIO BAJAK LAUT" bg={RED} color="#fff" />
      <Callout at={W(68)} until={W(82) - 0.3} x={60} y={1130} big="2 SEP 1967" small="PROKLAMASI SEBUAH NEGARA" size={96} />
      <Stamp at={W(80)} x={560} y={790} text="KEPANGERANAN SEALAND" size={56} rot={-6} />
      </>
      ) : null}
      {/* 1968 warning-shot card slides up over the board */}
      {card68 > 0 ? (
        <Paper x={50} y={330 + (1 - card68) * 1500} w={980} h={800} rot={-1}>
          <svg viewBox="0 0 980 800" width="100%" height="100%">
            <rect width={980} height={540} fill="#dbe7ee" />
            <g transform="translate(40 70) scale(0.66)">
              <Fort />
            </g>
            <g transform={`translate(${760 - Math.min(1, Math.max(0, t - W(89))) * 30} 430)`}>
              <Ship color="#334155" />
            </g>
            {shot ? (
              <g stroke={YEL} strokeWidth={6} strokeDasharray="14 16" strokeDashoffset={-t * 400} fill="none">
                <path d="M340,200 Q520,90 700,370" />
                <path d="M340,220 Q540,160 690,400" />
              </g>
            ) : null}
            {flash > 0.5 ? <circle cx={340} cy={205} r={36 * flash} fill="#fde047" /> : null}
            <Sea w={980} y={460} h={80} />
            <text x={40} y={620} fontFamily={ANTON} fontSize={62} fill={INK}>1968 · TEMBAKAN PERINGATAN</text>
            <text x={40} y={686} fontFamily={GROTESK} fontWeight={600} fontSize={38} fill="#57534e">Michael Bates menembak ke arah</text>
            <text x={40} y={738} fontFamily={GROTESK} fontWeight={600} fontSize={38} fill="#57534e">kapal perawatan pelampung Inggris</text>
          </svg>
        </Paper>
      ) : null}
      <Tag at={W(84)} x={720} y={1180} text="PUTRA ROY: MICHAEL" bg={YEL} />
    </>
  );
};

const S4Court: React.FC = () => {
  const lines = [
    "SHIRE HALL, CHELMSFORD — 25 OKTOBER 1968",
    "Perkara: Regina v. P. R. Bates & M. R. Bates",
    "Dakwaan: senjata api & tembakan peringatan",
    "Pertimbangan: Roughs Tower ±7 mil dari pantai;",
  ];
  return (
    <>
      <Paper x={90} y={320} w={900} h={760} rot={-0.8}>
        <div style={{ position: "absolute", left: 50, top: 44, right: 50 }}>
          <div style={{ fontFamily: ANTON, fontSize: 92, color: INK, lineHeight: 1 }}>PENGADILAN ESSEX</div>
          <div style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: 34, color: "#78716c", letterSpacing: "0.14em", marginTop: 8 }}>PUTUSAN · 1968</div>
          <div style={{ height: 6, background: INK, margin: "26px 0 30px" }} />
          {lines.map((l) => (
            <div key={l} style={{ fontFamily: GROTESK, fontSize: 36, color: "#44403c", lineHeight: 1.45 }}>{l}</div>
          ))}
          <div style={{ fontFamily: GROTESK, fontSize: 40, fontWeight: 700, color: INK, lineHeight: 1.4, marginTop: 12 }}>
            <Mark at={W(95)} dur={1.2}>benteng berada di luar wilayah Inggris</Mark>
          </div>
          <div style={{ fontFamily: GROTESK, fontSize: 36, color: "#44403c", lineHeight: 1.45, marginTop: 8 }}>(di luar batas laut 3 mil), maka pengadilan</div>
          <div style={{ fontFamily: GROTESK, fontSize: 36, color: "#44403c", lineHeight: 1.45 }}>tidak berwenang mengadili perkara ini.</div>
        </div>
      </Paper>
      <Pin x={540} y={338} />
      <Callout at={W(93)} until={W(98) - 0.1} x={60} y={1120} big="ESSEX" small="PENGADILAN INGGRIS" size={76} rot={-2} />
      <Stamp at={W(98)} x={520} y={1150} text="DI LUAR YURISDIKSI" size={62} rot={-5} />
      <Stamp at={W(102)} x={640} y={1300} text="KASUS GUGUR" size={84} rot={5} color="#b91c1c" />
    </>
  );
};

const S5Coup1978: React.FC = () => {
  const { t } = useT();
  const cx = 470, cy = 640; // fort on the tactical board
  const plane = r(t, W(105), W(109) + 0.4, 0, 1, easeIO);
  const heli = r(t, W(115), W(122), 0, 1, easeIO);
  const heliBack = r(t, W(129), W(131) + 0.6, 0, 1, easeIO);
  const hx = 900 - heli * 230 + heliBack * 380, hy = 1060 - heli * 360 - heliBack * 300;
  const taken = t >= W(122) && t < W(130);
  const retaken = t >= W(130);
  const arrow = r(t, W(115), W(118));
  const back = r(t, W(129), W(131));
  return (
    <>
      <Paper x={50} y={300} w={980} h={1040} rot={0.6} bg="#f3ede1">
        <svg viewBox="0 0 980 1040" width="100%" height="100%">
          <defs>
            <pattern id="tgrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M50,0 L0,0 0,50" fill="none" stroke="#1e3a5f1e" strokeWidth={2} />
            </pattern>
          </defs>
          <rect width={980} height={1040} fill="url(#tgrid)" />
          <text x={40} y={80} fontFamily={ANTON} fontSize={64} fill={INK}>OPERASI 1978</text>
          <text x={42} y={128} fontFamily={GROTESK} fontWeight={700} fontSize={38} fill="#78716c" letterSpacing={2}>SKETSA TAKTIS</text>
          {/* sea ring + fort, top view */}
          <circle cx={cx} cy={cy} r={170} fill="#bcd6e3" />
          <circle cx={cx} cy={cy} r={170} fill="none" stroke={SEA} strokeWidth={3} strokeDasharray="10 10" strokeDashoffset={t * 20} />
          <rect x={cx - 90} y={cy - 50} width={180} height={100} fill={taken ? RED : "#57534e"} stroke={INK} strokeWidth={6} />
          <circle cx={cx - 50} cy={cy} r={26} fill="#a8a29e" stroke={INK} strokeWidth={4} />
          <circle cx={cx + 50} cy={cy} r={26} fill="#a8a29e" stroke={INK} strokeWidth={4} />
          <text x={cx} y={cy + 100} textAnchor="middle" fontFamily={ANTON} fontSize={44} fill={INK}>SEALAND</text>
          {/* Roy leaves for Austria */}
          {plane > 0 ? (
            <g>
              <path d={`M${cx},${cy - 60} Q${cx - 200},${cy - 260} 200,330`} stroke={INK} strokeWidth={4} strokeDasharray="12 10" fill="none" pathLength={1} strokeDashoffset={0} opacity={0.6} />
              <g transform={`translate(${cx - plane * (cx - 200)} ${cy - 60 - plane * (cy - 330)}) rotate(-130) scale(0.7)`}>
                <Plane color={INK} />
              </g>
              <text x={60} y={200} fontFamily={GROTESK} fontWeight={700} fontSize={40} fill={INK} opacity={plane}>ROY → AUSTRIA</text>
            </g>
          ) : null}
          {/* mercenary attack arrow */}
          {arrow > 0 ? (
            <path d={`M920,1000 Q${cx + 360},${cy + 300} ${cx + 110},${cy + 60}`} stroke={RED} strokeWidth={14} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - arrow} strokeLinecap="round" />
          ) : null}
          {arrow > 0.95 ? <polygon points={`${cx + 96},${cy + 46} ${cx + 160},${cy + 64} ${cx + 118},${cy + 104}`} fill={RED} /> : null}
          {back > 0 ? (
            <path d={`M${cx + 120},${cy - 40} Q${cx + 300},${cy - 260} 930,180`} stroke="#15803d" strokeWidth={14} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - back} strokeLinecap="round" />
          ) : null}
          {heli > 0 && heliBack < 1 ? (
            <g transform={`translate(${hx} ${hy}) scale(1.1)`}>
              <Heli color={retaken ? "#57534e" : INK} />
            </g>
          ) : null}
          {t >= W(118) ? <DE x={700} y={890} w={86} /> : null}
          {t >= W(120) ? <NL x={800} y={890} w={86} /> : null}
          {t >= W(118) && t < W(138) ? <text x={940} y={1000} textAnchor="end" fontFamily={GROTESK} fontWeight={700} fontSize={38} fill={INK}>TENTARA BAYARAN</text> : null}
          {/* hostage marker */}
          {t >= W(125) ? (
            <g transform={`translate(${cx - 300} ${cy + 180})`}>
              <circle r={64} fill={retaken ? "#dcfce7" : "#fee2e2"} stroke={retaken ? "#15803d" : RED} strokeWidth={8} />
              <Person x={0} y={40} s={0.6} color={INK} />
              <text y={116} textAnchor="middle" fontFamily={ANTON} fontSize={44} fill={INK}>MICHAEL</text>
              <text y={160} textAnchor="middle" fontFamily={GROTESK} fontWeight={700} fontSize={38} fill={retaken ? "#15803d" : RED}>{retaken ? "BEBAS" : "DISANDERA"}</text>
            </g>
          ) : null}
        </svg>
      </Paper>
      <Callout at={W(104)} until={W(113) - 0.2} x={60} y={1150} big="1978" small="KUDETA DI LAUT" accent={RED} />
      {/* Achenbach dossier */}
      {t >= W(113) - 0.1 ? (
        <Paper x={640 + r(t, W(113) - 0.1, W(113) + 0.4, 500, 0)} y={440} w={370} h={430} rot={3}>
          <svg viewBox="0 0 360 420" width="100%" height="100%">
            <rect x={30} y={30} width={300} height={220} fill="#d6d3d1" />
            <Person x={180} y={240} s={1.4} color="#57534e" />
            <text x={30} y={306} fontFamily={ANTON} fontSize={48} fill={INK}>A. ACHENBACH</text>
            <text x={30} y={352} fontFamily={GROTESK} fontWeight={700} fontSize={38} fill="#57534e">"PERDANA</text>
            <text x={30} y={396} fontFamily={GROTESK} fontWeight={700} fontSize={38} fill="#57534e">MENTERI"</text>
          </svg>
        </Paper>
      ) : null}
      <Stamp at={W(137)} x={825} y={575} text="MAKAR" size={84} rot={-12} />
      {/* German diplomat */}
      {t >= W(138) ? (
        <Paper x={560 + r(t, W(138), W(139), 520, 0)} y={1060} w={450} h={250} rot={-2}>
          <svg viewBox="0 0 440 250" width="100%" height="100%">
            <rect x={30} y={70} width={150} height={110} rx={12} fill="#78350f" />
            <rect x={80} y={46} width={50} height={30} rx={8} fill="none" stroke="#78350f" strokeWidth={10} />
            <DE x={200} y={60} w={80} />
            <text x={200} y={160} fontFamily={ANTON} fontSize={46} fill={INK}>DIPLOMAT</text>
            <text x={200} y={210} fontFamily={ANTON} fontSize={46} fill={INK}>JERMAN</text>
          </svg>
        </Paper>
      ) : null}
      <Stamp at={W(143)} x={380} y={1200} text="NEGOSIASI" size={64} rot={-6} color="#1d4ed8" />
    </>
  );
};

const S6Map1987: React.FC = () => {
  const { t } = useT();
  const grow = r(t, W(148), W(154) + 0.3, 3, 12, easeIO);
  const swallowed = grow >= 7 ? 1 : 0;
  return (
    <>
      <Paper x={60} y={300} w={960} h={800} rot={-1}>
        <div style={{ position: "absolute", left: 20, top: 20, right: 20, height: 680 }}>
          <SeaMap miles={grow} zoneAt={W(144) - 0.2} fortRed={swallowed} />
        </div>
        <div style={{ position: "absolute", left: 34, bottom: 24, fontFamily: GROTESK, fontSize: 40, color: INK, fontWeight: 600 }}>
          Laut teritorial Inggris: <Mark at={W(152)}>{Math.round(grow)} mil laut</Mark>
        </div>
      </Paper>
      <Callout at={W(146)} until={W(152) - 0.1} x={60} y={1140} big="1987" small="INGGRIS MEMPERLUAS LAUT" />
      <Callout at={W(152)} until={W(162) - 0.1} x={280} y={1140} big={() => `3 → ${Math.round(grow)} MIL`} small="BATAS LAUT BARU" accent={RED} size={86} rot={2} />
      <Tag at={W(159)} x={640} y={470} text="KINI DI PERAIRAN INGGRIS" bg={RED} color="#fff" size={40} rot={-4} />
      <Stamp at={W(162)} x={540} y={1220} text="0 NEGARA MENGAKUI" size={86} rot={-5} />
    </>
  );
};

const S7Lord: React.FC = () => {
  const { t, fps } = useT();
  const seal = pop(t, W(177), fps, 8);
  const price = r(t, W(180), W(184), 0, 560, (x) => x);
  const locked = t >= W(184);
  const tagIn = pop(t, W(179), fps, 10);
  return (
    <>
      <Paper x={80} y={330} w={920} h={840} rot={1.5} bg="#fbf3dc">
        <div style={{ position: "absolute", inset: 26, border: "6px double #92400e", borderRadius: 8 }} />
        <div style={{ position: "absolute", inset: 46, border: "2px solid #b4530988", borderRadius: 4 }} />
        <svg viewBox="0 0 920 880" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <g transform="translate(460 210)">
            <path d="M-80,-90 L80,-90 L80,10 Q80,80 0,110 Q-80,80 -80,10 Z" fill="#fff" stroke="#92400e" strokeWidth={6} />
            <clipPath id="shield">
              <path d="M-74,-84 L74,-84 L74,10 Q74,74 0,102 Q-74,74 -74,10 Z" />
            </clipPath>
            <g clipPath="url(#shield)" transform="translate(-74 -84) scale(1.76)">
              <SealandFlag w={84} />
            </g>
            <Crown x={0} y={-130} s={0.7} />
          </g>
          <text x={460} y={420} textAnchor="middle" fontFamily={GROTESK} fontWeight={700} fontSize={40} fill="#92400e" letterSpacing={3}>SERTIFIKAT GELAR</text>
          <text x={460} y={540} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize={120} fill={INK}>Lord of Sealand</text>
          <text x={460} y={620} textAnchor="middle" fontFamily={GROTESK} fontSize={38} fill="#57534e">untuk: ______________</text>
          <line x1={120} y1={740} x2={420} y2={740} stroke="#57534e" strokeWidth={3} />
          <text x={120} y={790} fontFamily={SERIF} fontStyle="italic" fontSize={42} fill="#57534e">Kepangeranan Sealand</text>
        </svg>
        {seal > 0 ? (
          <div style={{ position: "absolute", left: 640, top: 640, width: 170, height: 170, borderRadius: 85, transform: `scale(${interpolate(seal, [0, 1], [1.8, 1])})`, background: "radial-gradient(circle at 40% 35%, #ef4444, #991b1b 70%)", boxShadow: "0 12px 20px rgba(60,10,10,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 64, color: "#fecaca" }}>
            S
          </div>
        ) : null}
      </Paper>
      <Tag at={W(173)} until={W(179)} x={540} y={1240} text="KAMU BISA JADI BANGSAWAN" bg={YEL} rot={-2} />
      {tagIn > 0 ? (
        <div style={{ position: "absolute", left: 90, top: 1170, transform: `rotate(${-6 + Math.sin(t * 3) * 2}deg) scale(${tagIn})`, transformOrigin: "30px 50%" }}>
          <div style={{ background: locked ? YEL : PAPER, color: INK, fontFamily: ANTON, fontSize: 108, padding: "10px 46px 14px 70px", borderRadius: "16px 60px 60px 16px", boxShadow: "0 22px 40px rgba(30,15,5,0.5)", border: `6px solid ${INK}`, position: "relative" }}>
            <div style={{ position: "absolute", left: 22, top: "50%", width: 26, height: 26, marginTop: -13, borderRadius: 13, background: "#a8743f", border: `4px solid ${INK}` }} />
            <div style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: 38, letterSpacing: "0.06em", lineHeight: 1.3 }}>GELAR LORD MULAI</div>
            Rp {Math.round(price)}.000
          </div>
        </div>
      ) : null}
      {locked ? <Stamp at={W(184)} x={850} y={1300} text="RESMI DIJUAL" size={52} rot={10} color="#15803d" /> : null}
    </>
  );
};

const S8Outro: React.FC = () => {
  const { t, fps } = useT();
  const a = W(186) - 0.15;
  const sunY = r(t, a, END_VO, 820, 900);
  const q1 = pop(t, W(186), fps, 11);
  const q2 = pop(t, W(188), fps, 11);
  const shop = pop(t, W(192), fps, 10);
  const bubble = pop(t, W(194), fps, 10);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <defs>
          <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b2f63" />
            <stop offset="0.45" stopColor="#c2410c" />
            <stop offset="0.62" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#dusk)" />
        <circle cx={700} cy={sunY} r={150} fill="#fde68a" opacity={0.9} />
        <Gull x={200 + (t - a) * 30} y={520} s={1.1} color="#1c1917" />
        <Gull x={320 + (t - a) * 24} y={600} s={0.8} ph={1.2} color="#1c1917" />
        <g transform="translate(140 470) scale(1.35)">
          <Fort sil="#1c1917" />
          {shop > 0 ? (
            <g transform={`translate(400 260) scale(${shop})`}>
              <foreignObject x={-10} y={-70} width={190} height={60}>
                <div style={{ width: 190, height: 60, boxSizing: "border-box", backgroundColor: YEL, border: "4px solid #1c1917", borderRadius: 8, color: "#1c1917", fontFamily: ANTON, fontSize: 36, lineHeight: "52px", textAlign: "center" }}>SUVENIR</div>
              </foreignObject>
            </g>
          ) : null}
        </g>
        <Sea w={1080} y={1250} h={700} back="#1e293b" front="#334155" />
      </svg>
      <div style={{ position: "absolute", left: 60, top: 250, transform: `translateX(${(1 - q1) * -200}px)`, opacity: q1, fontFamily: ANTON, fontSize: 116, color: PAPER, lineHeight: 1, textShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
        NEGARA SUNGGUHAN?
      </div>
      <div style={{ position: "absolute", right: 60, top: 372, transform: `translateX(${(1 - q2) * 200}px)`, opacity: q2, fontFamily: ANTON, fontSize: 116, color: YEL, lineHeight: 1, textAlign: "right", textShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
        ATAU BENTENG TUA?
      </div>
      {bubble > 0 ? (
        <div style={{ position: "absolute", left: 140, top: 1200, transform: `scale(${bubble})`, transformOrigin: "left bottom", background: PAPER, color: INK, borderRadius: 30, padding: "20px 36px", fontFamily: GROTESK, fontWeight: 700, fontSize: 44, boxShadow: "0 18px 34px rgba(0,0,0,0.45)" }}>
          Tulis pendapatmu di komentar
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1100, textAlign: "center", fontFamily: GROTESK, fontWeight: 700, fontSize: 40, letterSpacing: "0.2em", color: "#fde68a", opacity: r(t, W(198), W(199)) }}>
        AUDIRA · FAKTA DUNIA
      </div>
    </AbsoluteFill>
  );
};

const SCENE_VIEW: Record<string, React.FC> = {
  hook: S1Hook,
  "1943": S2Fort1943,
  "1967": S3Board1967,
  court: S4Court,
  "1978": S5Coup1978,
  "1987": S6Map1987,
  lord: S7Lord,
  outro: S8Outro,
};

// ---------- director ----------
const Shell: React.FC<{ def: SceneDef; first: boolean; last: boolean }> = ({ def, first, last }) => {
  const { t } = useT();
  const dur = def.to - def.from;
  const lt = t - def.from;
  const whipIn = first ? 1 : r(lt, 0, 0.34);
  const whipOut = last ? 0 : r(lt, dur - 0.24, dur, 0, 1, Easing.in(Easing.cubic));
  const c = def.cam(t, def.from, def.to);
  const driftX = Math.sin(t * 0.5) * 8, driftY = Math.cos(t * 0.43) * 6;
  const off = (1 - whipIn) * 760 - whipOut * 760;
  const blur = (1 - whipIn) * 16 + whipOut * 16;
  const View = SCENE_VIEW[def.id];
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${c.x + driftX + off}px, ${c.y + driftY}px) scale(${c.s})`,
        transformOrigin: "540px 820px",
        filter: blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : undefined,
      }}
    >
      <View />
    </AbsoluteFill>
  );
};

export const Sealand: React.FC<{ cover?: boolean }> = ({ cover }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = cover ? 10.6 : frame / fps;
  const k = width / 1080;
  const idx = SCENES.findIndex((s) => t >= s.from && t < s.to);
  const def = SCENES[Math.max(0, idx)];
  const outro = def.id === "outro";
  return (
    <Ctx.Provider value={{ t, fps }}>
      <AbsoluteFill style={{ background: "#9c6533", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0", overflow: "hidden" }}>
          <Desk />
          <Shell key={def.id} def={def} first={idx === 0} last={outro} />
          {!outro ? <Foreground /> : null}
          {!outro ? <FolderTab chip={def.chip} /> : null}
          {cover ? <CoverTitle /> : <Karaoke />}
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 88% 66% at 50% 45%, transparent 55%, rgba(30,12,2,0.64))", pointerEvents: "none" }} />
        </div>
        {cover ? null : <AudiraOutro seconds={OUTRO_SECONDS} code="FAKTADUNIA" />}
        {cover ? null : <AudiraSignature seed="sealand-ep03" code="FAKTADUNIA" outroSeconds={OUTRO_SECONDS} />}
      </AbsoluteFill>
    </Ctx.Provider>
  );
};

const CoverTitle: React.FC = () => (
  <div style={{ position: "absolute", left: -30, right: -30, top: 1150, textAlign: "left", background: INK, borderTop: `14px solid ${YEL}`, borderRadius: 0, padding: "40px 90px 60px", boxShadow: "0 30px 60px rgba(30,12,2,0.6)", transform: "rotate(-1deg)" }}>
    <div style={{ display: "inline-block", background: RED, color: "#fff", fontFamily: GROTESK, fontWeight: 700, fontSize: 34, letterSpacing: "0.14em", padding: "8px 20px", borderRadius: 6 }}>FAKTA DUNIA</div>
    <div style={{ fontFamily: ANTON, fontSize: 118, lineHeight: 1.04, color: PAPER, marginTop: 16 }}>
      NEGARA 400 m²
      <br />
      DI ATAS <span style={{ color: YEL }}>BENTENG</span>
    </div>
  </div>
);

export const SealandCover: React.FC = () => <Sealand cover />;
