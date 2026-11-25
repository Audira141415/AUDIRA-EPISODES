// EP03 Sealand — AUDIRA Fakta Dunia. Style HISTORYMAP (night chart table + lit illustrated set pieces), Remotion 2D.
// Pattern follows the HISTORYMAP gold (EP16): SCENES + CALLOUTS (dark plate, red border-left, Anton), Kicker, karaoke
// chunks ≤ 4 words, overlay key-light pool + vignette + Paper multiply + Grain. Every cue is anchored to a VO word
// (words.ts = Cartesia timings, audio master clock). Layout authored in 1080 × 1920, scaled to the composition.
// Lessons from the failed CHRONICLE / VISUALINVESTIGATION juries applied here: framing varies per scene (aerial,
// sea cross-section with sandbank, deck close-up, interiors, maps), every VO verb gets a physical action, figures
// are rimmed + textured, text never sits under objects (all callouts are HTML on top), headlines start ≥ 380 px
// from the top, and the bottom third always carries a foreground layer.
import React from "react";
import { AbsoluteFill, continueRender, delayRender, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { WORDS } from "./words.ts";
import {
  C, Defs, Lit, MapView, Territory, Route, Dot, FortPin, Sky, Sea, FGWaves, Fort, SealandFlag, FortTop, Figure, Tug, Launch,
  Patrol, Heli, Bomber, Mine, type Cam, toScreen, lerpCam, hash, clamp01, ease, easeOut, expoOut, ramp, lerp, ellipse, SHADOW,
} from "./hmPieces.tsx";
import { PLACES, proj } from "./hmGeo.ts";

export const HM_SECONDS = 91;
const OUTRO_SECONDS = 2.6;
const END_VO = HM_SECONDS - OUTRO_SECONDS;
const XFADE = 0.3;

// ---------- fonts ----------
if (typeof document !== "undefined") {
  const h = delayRender("historymap fonts");
  Promise.all(
    [
      ["Anton", "fonts/Anton-Regular.ttf"],
      ["Jakarta", "fonts/PlusJakartaSans_800ExtraBold.ttf"],
    ].map(async ([fam, file]) => {
      const f = new FontFace(fam, `url(${staticFile(file)})`);
      await f.load();
      (document.fonts as unknown as { add(f: FontFace): void }).add(f);
    }),
  ).then(() => continueRender(h), () => continueRender(h));
}

const T = (word: string, n = 0): number => {
  let k = 0;
  for (const w of WORDS) if (w.t === word && k++ === n) return w.s;
  throw new Error(`word not found: ${word} #${n}`);
};

type SP = { t: number; lt: number };
const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <Defs />
    <defs>
      <linearGradient id="beamG" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#FFF1C8" stopOpacity="0.9" />
        <stop offset="1" stopColor="#FFF1C8" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="sandG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.sand} />
        <stop offset="1" stopColor={C.sandDk} />
      </linearGradient>
      <linearGradient id="woodG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7A5232" />
        <stop offset="1" stopColor="#3E2717" />
      </linearGradient>
    </defs>
    {children}
  </svg>
);
const cam = (s: number, ox: number, oy: number, tx = 0, ty = 0, rot = 0) =>
  `translate(${ox + tx},${oy + ty}) rotate(${rot}) scale(${s}) translate(${-ox},${-oy})`;
const ID: Cam = { cx: 540, cy: 960, s: 1 };

/** Screen-space tag on a dark plate with red border-left (HTML, always above the art). */
const Tag: React.FC<{ c?: Cam; p: readonly [number, number]; text: string; t: number; t0: number; until?: number; dy?: number; dx?: number; gold?: boolean }> = ({ c = ID, p, text, t, t0, until = 1e9, dy = -70, dx = 0, gold }) => {
  if (t < t0 || t > until) return null;
  const k = expoOut(ramp(t, t0, t0 + 0.45)) * (1 - ramp(t, until - 0.25, until));
  const [sx, sy] = toScreen(c, p);
  const w = text.length * 27 + 64;
  const x = Math.max(50, Math.min(1030 - w, sx + dx - w / 2));
  const y = Math.max(700, Math.min(1330, sy + dy));
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: w, height: 70, background: "rgba(14,18,26,.9)", borderLeft: `9px solid ${gold ? C.goldHi : C.red}`,
      color: C.cream, fontFamily: "Anton", fontSize: 44, letterSpacing: 2, display: "flex", alignItems: "center", justifyContent: "center",
      opacity: k, transform: `translateY(${(1 - k) * 18}px)`, boxShadow: "0 10px 24px rgba(0,0,0,.45)", whiteSpace: "nowrap",
    }}>{text}</div>
  );
};

// =====================================================================================
// EXTRA SET PIECES
// =====================================================================================
const Bubbles: React.FC<{ x: number; w: number; y0: number; y1: number; t: number; n?: number; seed?: number; op?: number }> = ({ x, w, y0, y1, t, n = 14, seed = 1, op = 1 }) => (
  <g opacity={op}>
    {Array.from({ length: n }, (_, i) => {
      const p = (t * (0.35 + hash(seed + i) * 0.4) + hash(seed * 3 + i)) % 1;
      const bx = x + (hash(seed + i * 7) - 0.5) * w + Math.sin(t * 3 + i) * 8;
      return <circle key={i} cx={bx} cy={lerp(y0, y1, p)} r={3 + hash(i + seed) * 7} fill="none" stroke={C.foam} strokeWidth={2} opacity={0.65 * (1 - p)} />;
    })}
  </g>
);

const Underwater: React.FC<{ y: number; t: number; id: string; x0?: number; x1?: number; y1?: number }> = ({ y, t, id, x0 = -40, x1 = 1120, y1 = 1960 }) => (
  <g>
    <defs>
      <linearGradient id={`uw-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2A5878" />
        <stop offset="0.45" stopColor="#163452" />
        <stop offset="1" stopColor="#0A1628" />
      </linearGradient>
    </defs>
    <rect x={x0} y={y} width={x1 - x0} height={y1 - y} fill={`url(#uw-${id})`} />
    {[0, 1, 2, 3, 4].map((i) => {
      const cx = x0 + (x1 - x0) * (0.1 + i * 0.2) + Math.sin(t * 0.5 + i) * 30;
      return <path key={i} d={`M${cx - 30},${y} L${cx + 30},${y} L${cx + 150},${y + (y1 - y) * 0.7} L${cx + 40},${y + (y1 - y) * 0.7}Z`} fill="#BFE3F0" opacity={0.07} />;
    })}
  </g>
);

const Surface: React.FC<{ y: number; t: number; x0?: number; x1?: number }> = ({ y, t, x0 = -40, x1 = 1120 }) => {
  const d = "M" + Array.from({ length: 49 }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / 48;
    return `${x.toFixed(1)},${(y + Math.sin(x * 0.02 + t * 2.2) * 6).toFixed(1)}`;
  }).join("L");
  return (
    <g>
      <path d={d} stroke="#9CC9DC" strokeWidth={24} fill="none" opacity={0.16} transform="translate(0,14)" />
      <path d={d} stroke="#E4F2F4" strokeWidth={5} fill="none" opacity={0.85} />
    </g>
  );
};

const Sandbank: React.FC<{ peak: number; base: number; cx?: number; half?: number; x0?: number; x1?: number; y1?: number }> = ({ peak, base, cx = 560, half = 430, x0 = -40, x1 = 1120, y1 = 1960 }) => {
  const d = `M${x0},${base} C${cx - half},${base} ${cx - half * 0.55},${peak} ${cx},${peak} C${cx + half * 0.55},${peak} ${cx + half},${base} ${x1},${base} L${x1},${y1} L${x0},${y1}Z`;
  return (
    <g>
      <path d={d} fill="url(#sandG)" />
      <path d={d} fill="#000" filter="url(#grit)" opacity={0.75} />
      <path d={d} fill="none" stroke="#F0D9A4" strokeWidth={6} opacity={0.65} transform="translate(-3,-3)" />
      {Array.from({ length: 16 }, (_, i) => {
        const x = x0 + ((x1 - x0) * (i + 0.5)) / 16;
        const yy = base + 60 + (i % 3) * 70;
        return <path key={i} d={`M${x - 40},${yy} q20,-12 40,0 q20,-12 40,0`} stroke="#6E5530" strokeWidth={4} fill="none" opacity={0.5} />;
      })}
      {Array.from({ length: 10 }, (_, i) => (
        <path key={`r${i}`} d={ellipse(x0 + hash(i + 4) * (x1 - x0), base + 120 + hash(i) * (y1 - base - 160), 18 + hash(i * 3) * 26, 10 + hash(i * 5) * 12)} fill="#4E4436" />
      ))}
    </g>
  );
};

const Gull: React.FC<{ x: number; y: number; s: number; t: number; blur?: boolean; ph?: number }> = ({ x, y, s, t, blur, ph = 0 }) => {
  const f = Math.sin(t * 9 + ph) * 16;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} filter={blur ? "url(#blur6)" : undefined}>
      <path d={`M-52,${-f} Q-24,-20 0,0 Q24,-20 52,${-f} Q24,-6 0,8 Q-24,-6 -52,${-f}Z`} fill="#ECE8DE" />
      <path d={`M-52,${-f} Q-40,-14 -30,-8`} stroke="#3A3A3A" strokeWidth={4} fill="none" />
      <path d={`M52,${-f} Q40,-14 30,-8`} stroke="#3A3A3A" strokeWidth={4} fill="none" />
    </g>
  );
};

const Splash: React.FC<{ x: number; y: number; t: number; t0: number; s?: number }> = ({ x, y, t, t0, s = 1 }) => {
  const k = ramp(t, t0, t0 + 0.8);
  if (k <= 0 || k >= 1) return null;
  const h = 150 * Math.sin(Math.PI * Math.min(1, k * 1.3)) * s;
  return (
    <g opacity={1 - k * 0.6}>
      <path d={`M${x - 22 * s},${y} Q${x - 12 * s},${y - h} ${x},${y - h * 1.1} Q${x + 12 * s},${y - h} ${x + 22 * s},${y}Z`} fill={C.foam} />
      <path d={ellipse(x, y, 60 * s * (0.5 + k), 9 * s)} fill={C.foam} opacity={0.6} />
    </g>
  );
};

const Sparks: React.FC<{ x: number; y: number; t: number; t0: number; n?: number; seed?: number }> = ({ x, y, t, t0, n = 18, seed = 3 }) => {
  if (t < t0) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const period = 0.7;
        const l = ((t - t0) + hash(seed + i) * period) % period;
        const a = -Math.PI * (0.15 + 0.7 * hash(i * 3 + seed));
        const v = 220 + 180 * hash(i + seed * 5);
        const px = x + Math.cos(a) * v * l, py = y + Math.sin(a) * v * l + 700 * l * l;
        return <path key={i} d={`M${px},${py} l${-Math.cos(a) * 12},${-Math.sin(a) * 12 - 8}`} stroke="#FFD27A" strokeWidth={3} opacity={1 - l / period} />;
      })}
      <circle cx={x} cy={y} r={16} fill="#FFE2A0" filter="url(#glow)" opacity={0.6 + 0.4 * Math.sin(t * 40)} />
    </g>
  );
};

const Beam: React.FC<{ x: number; y: number; ang: number; len?: number; w?: number; op?: number }> = ({ x, y, ang, len = 1800, w = 170, op = 0.2 }) => (
  <g transform={`translate(${x},${y}) rotate(${ang})`} style={{ mixBlendMode: "screen" }}>
    <path d={`M-10,0 L10,0 L${w},${-len} L${-w},${-len}Z`} fill="url(#beamG)" opacity={op} />
    <circle r={26} fill="#FFF4D0" filter="url(#glow)" />
  </g>
);

const Crane: React.FC<{ x: number; base: number; top: number; jibTo: number }> = ({ x, base, top, jibTo }) => (
  <g>
    <Lit draw={(c) => (
      <g stroke={c ?? "#2E2924"} fill="none">
        <rect x={x - 30} y={top} width={60} height={base - top} strokeWidth={7} />
        {Array.from({ length: Math.floor((base - top) / 60) }, (_, i) => (
          <path key={i} d={`M${x - 30},${top + i * 60} L${x + 30},${top + i * 60 + 60} M${x + 30},${top + i * 60} L${x - 30},${top + i * 60 + 60}`} strokeWidth={3} />
        ))}
        <path d={`M${x - 160},${top} L${jibTo},${top} M${x - 160},${top + 36} L${jibTo},${top + 8}`} strokeWidth={7} />
        {Array.from({ length: Math.floor((jibTo - x + 160) / 50) }, (_, i) => (
          <path key={`j${i}`} d={`M${x - 160 + i * 50},${top + 36 - i * 1.2} L${x - 110 + i * 50},${top}`} strokeWidth={3} />
        ))}
        <path d={`M${x - 160},${top} L${x},${top - 110} L${jibTo},${top}`} strokeWidth={4} />
      </g>
    )} />
    <rect x={x - 200} y={top + 10} width={90} height={70} fill="#3A332C" />
    <rect x={x - 34} y={top} width={4} height={base - top} fill={C.rim} opacity={0.45} />
  </g>
);

const Ladder: React.FC<{ x: number; y0: number; y1: number }> = ({ x, y0, y1 }) => (
  <g stroke="#2A2622" strokeWidth={6}>
    <line x1={x} y1={y0} x2={x} y2={y1} />
    <line x1={x + 40} y1={y0} x2={x + 40} y2={y1} />
    {Array.from({ length: Math.floor((y1 - y0) / 36) }, (_, i) => <line key={i} x1={x} x2={x + 40} y1={y0 + 18 + i * 36} y2={y0 + 18 + i * 36} strokeWidth={4} />)}
    <line x1={x - 3} y1={y0} x2={x - 3} y2={y1} stroke={C.rim} strokeOpacity={0.5} strokeWidth={2} />
  </g>
);

const TopGulls: React.FC<{ t: number; lt: number }> = ({ t, lt }) => (
  <g>
    <Gull x={lerp(-200, 1300, lt / 5)} y={1720} s={3.2} t={t} blur />
    <Gull x={lerp(1250, -150, lt / 6)} y={1560} s={2.2} t={t} blur ph={2} />
    <Gull x={lerp(200, 520, lt / 5)} y={760} s={0.8} t={t} ph={1} />
  </g>
);

const SeaTop: React.FC<{ t: number; dusk?: boolean }> = ({ t, dusk }) => (
  <g>
    <defs>
      <radialGradient id={dusk ? "seatopD" : "seatopA"} cx="0.4" cy="0.35" r="0.9">
        <stop offset="0" stopColor={dusk ? "#5A4656" : "#2F5878"} />
        <stop offset="0.6" stopColor={dusk ? "#2A2638" : "#1C3550"} />
        <stop offset="1" stopColor={dusk ? "#121420" : "#0F1F33"} />
      </radialGradient>
    </defs>
    <rect x={-700} y={-700} width={2480} height={3320} fill={`url(#${dusk ? "seatopD" : "seatopA"})`} />
    {Array.from({ length: 30 }, (_, i) => {
      const y = -600 + i * 110 + ((t * 20) % 110);
      return <path key={i} d={Array.from({ length: 11 }, (_, j) => `M${-700 + j * 240 + (i % 2) * 120},${y} q60,-14 120,0`).join("")} stroke={dusk ? "#F2B37A" : C.foam} strokeOpacity={0.09 + 0.06 * hash(i)} strokeWidth={3} fill="none" />;
    })}
    {Array.from({ length: 24 }, (_, i) => (
      <path key={`g${i}`} d={ellipse(hash(i) * 1080, hash(i + 9) * 1920, 14, 3)} fill={dusk ? "#FFD08A" : "#E8F4F8"} opacity={0.5 * Math.max(0, Math.sin(t * 3 + i * 1.7))} />
    ))}
  </g>
);

/** Brass dividers + pencil lying on the chart table, out of focus: the map scenes' bottom-third foreground. */
const ChartFG: React.FC<{ t: number }> = ({ t }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <Defs />
    <g transform={`translate(${Math.sin(t * 0.4) * 14},${Math.cos(t * 0.3) * 6})`} filter="url(#blur6)">
      <path d="M352,1640 L110,1990 L560,1995 L374,1632Z" fill={SHADOW} transform="translate(30,34)" />
      <path d="M352,1634 L104,1990 L134,2000 L372,1650Z" fill="#B8893A" />
      <path d="M356,1642 L548,2000 L578,1990 L376,1634Z" fill="#9C722C" />
      <path d="M352,1634 L104,1990" stroke={C.rim} strokeWidth={4} opacity={0.7} />
      <circle cx={364} cy={1638} r={26} fill="#D9A848" />
      <circle cx={358} cy={1632} r={10} fill="#FFE3A0" />
      <path d="M640,1930 L1110,1712 L1124,1740 L654,1958Z" fill={SHADOW} transform="translate(20,26)" />
      <path d="M640,1920 L1110,1702 L1122,1728 L652,1946Z" fill="#C7902E" />
      <path d="M640,1920 L600,1946 L652,1946Z" fill="#E7C89A" />
      <path d="M640,1920 L1110,1702" stroke="#FFE0A0" strokeWidth={3} opacity={0.6} />
      <rect x={-20} y={1840} width={1120} height={14} fill="#C9A45C" opacity={0.35} transform="rotate(-3 540 1846)" />
    </g>
  </svg>
);

/** Small gold crown icon (screen-constant inside a map). */
const Crown: React.FC<{ p: readonly [number, number]; u: number; k: number }> = ({ p, u, k }) => (k <= 0 ? null : (
  <g transform={`translate(${p[0]},${p[1] - 70 * u}) scale(${u * expoOut(k) * 1.4})`}>
    <path d="M-40,20 L-48,-24 L-22,0 L0,-34 L22,0 L48,-24 L40,20Z" fill={C.goldHi} stroke={C.ink} strokeWidth={4} />
    <rect x={-40} y={18} width={80} height={12} fill={C.gold} stroke={C.ink} strokeWidth={4} />
    <circle cx={0} cy={-38} r={6} fill={C.red} />
  </g>
));

// =====================================================================================
// SCENES
// =====================================================================================

// S1 0–4.85 aerial hook: the whole country is one deck, measured in gold.
const S1: React.FC<SP> = ({ t, lt }) => {
  const s = lerp(1.32, 1.04, easeOut(ramp(lt, 0, 4.8)));
  const k = ease(ramp(t, 2.1, 3.0)), k2 = ease(ramp(t, 2.6, 3.5));
  return (
    <Frame>
      <g transform={cam(s, 540, 1000, 0, 0, lerp(-4, 2, ramp(lt, 0, 4.8)))}>
        <SeaTop t={t} />
        <g transform="translate(540,1000) scale(1.08)">
          <FortTop t={t} />
          <g stroke={C.goldHi} strokeWidth={6} fill="none" strokeLinecap="round">
            {k > 0 ? <path d={`M-260,-196 L${-260 + 520 * k},-196 M-260,-214 v36`} /> : null}
            {k >= 1 ? <path d="M260,-214 v36" /> : null}
            {k2 > 0 ? <path d={`M306,-150 L306,${-150 + 300 * k2} M288,-150 h36`} /> : null}
            {k2 >= 1 ? <path d="M288,150 h36" /> : null}
          </g>
          <rect x={-260} y={-150} width={520} height={300} fill={C.goldHi} opacity={0.14 * ease(ramp(t, 3.0, 3.6))} />
        </g>
      </g>
      <TopGulls t={t} lt={lt} />
    </Frame>
  );
};

// S1b 4.85–7.55 sea cross-section: two concrete legs standing on a sandbank, tilt down below the waterline.
const S1b: React.FC<SP> = ({ t, lt }) => {
  const ty = lerp(-170, 0, easeOut(ramp(lt, 0, 2.2)));
  const lead = ease(ramp(t, 5.2, 5.7));
  return (
    <Frame>
      <g transform={cam(1 + lt * 0.025, 540, 1000, 0, ty, lerp(-1.5, 0.6, ramp(lt, 0, 2.7)))}>
        <Sky id="s1b" top="#1A2436" mid="#41506A" glow="#C98A55" horizon={1000} />
        <Underwater y={1000} t={t} id="s1b" y1={2200} />
        <Sandbank peak={1238} base={1520} y1={2200} />
        <g transform="translate(560,1000) scale(0.85)"><Fort under t={t} flag={1} /></g>
        <rect x={-40} y={1006} width={1160} height={1200} fill="#1E4A6A" opacity={0.3} />
        <Bubbles x={560} w={360} y0={1220} y1={1010} t={t} n={18} />
        <Surface y={1000} t={t} />
        {lead > 0 ? (
          <g stroke={C.goldHi} strokeWidth={4} strokeDasharray="10 8" fill="none" opacity={lead}>
            <path d="M470,570 L462,1100" /><path d="M610,570 L658,1100" />
            <circle cx={462} cy={1100} r={12} /><circle cx={658} cy={1100} r={12} />
          </g>
        ) : null}
      </g>
      <g filter="url(#blur6)">
        {[120, 980].map((x, i) => <path key={x} d={`M${x},1960 q${-30 + i * 60},-200 ${10 - i * 20},-380`} stroke="#2E4A2A" strokeWidth={26} fill="none" opacity={0.85} transform={`rotate(${Math.sin(t * 1.6 + i) * 4} ${x} 1960)`} />)}
        <path d={ellipse(200, 1900, 260, 90)} fill="#3E3428" />
        <path d={ellipse(930, 1930, 240, 100)} fill="#352C22" />
      </g>
    </Frame>
  );
};

// S2 7.55–11.25 chart zoom-out from the fort to the North Sea; country named, prince crown.
const S2: React.FC<SP> = ({ t, lt }) => {
  const c = lerpCam({ cx: 0, cy: 0, s: 40 }, { cx: -60, cy: -190, s: 1.35 }, expoOut(ramp(lt, 0, 2.6)));
  c.s *= 1 + ramp(lt, 2.6, 3.7) * 0.05;
  const u = 1 / c.s;
  return (
    <>
      <MapView cam={c} t={t}>
        {[0, 1, 2].map((i) => {
          const k = ((t * 0.6 + i / 3) % 1);
          return <circle key={i} cx={0} cy={0} r={(30 + 160 * k) * u} fill="none" stroke={C.red} strokeWidth={4 * u} opacity={(1 - k) * 0.8} />;
        })}
        <FortPin p={PLACES.sealand} u={u} t={t} size={1.3} />
        <Crown p={PLACES.sealand} u={u} k={ramp(t, T("punya"), T("punya") + 0.5)} />
      </MapView>
      <Tag c={c} p={PLACES.sealand} text="SEALAND" t={t} t0={T("Sealand.")} dy={70} dx={60} />
      <Tag c={c} p={proj(-2, 53.4)} text="INGGRIS" t={t} t0={9.0} dy={0} gold />
      <Tag c={c} p={proj(3.2, 55.3)} text="LAUT UTARA" t={t} t0={9.3} dy={0} gold />
      <ChartFG t={t} />
    </>
  );
};

// S3a 11.25–15.6 1943 night yard: a crane lowers the deck onto the legs, sparks fly, searchlights sweep.
const S3a: React.FC<SP> = ({ t, lt }) => {
  const lift = 220 * (1 - ease(ramp(t, 12.0, T("benteng"))));
  const deckY = 1300 - (310 + lift) * 0.85;
  return (
    <Frame>
      <g transform={cam(1.04 + lt * 0.02, 540, 1200, -lt * 10, 0)}>
        <Sky id="s3a" top="#05080F" mid="#121C30" glow="#2A3550" horizon={1300} />
        {[0, 1, 2].map((i) => <circle key={i} cx={180 + i * 330} cy={300 + i * 60} r={2.5} fill="#E8EEF8" opacity={0.6} />)}
        <Beam x={80} y={1640} ang={20 + Math.sin(t * 0.8) * 14} />
        <Beam x={1020} y={1680} ang={-18 + Math.sin(t * 0.6 + 2) * 12} op={0.16} />
        <Sea y={1300} t={t} col="#0E1A2A" light="#2A3A55" />
        <Crane x={130} base={1600} top={600} jibTo={720} />
        <path d={`M600,600 L${600 - 200},${deckY} M600,600 L${600 + 200},${deckY}`} stroke="#1E1B18" strokeWidth={4} />
        <path d="M600,600 v-10" stroke="#1E1B18" strokeWidth={10} />
        <g transform="translate(600,1300) scale(0.85)"><Fort t={t} lift={lift} rust={0.1} lights={0.6} /></g>
        <Sparks x={600 - 98} y={1300 - 262 * 0.85} t={t} t0={T("benteng") - 0.05} seed={3} />
        <Sparks x={600 + 98} y={1300 - 262 * 0.85} t={t} t0={T("benteng")} seed={9} />
        <path d={ellipse(600, 1300, 260, 16)} fill={C.foam} opacity={0.18} />
      </g>
      <g>
        <rect x={-20} y={1580} width={1120} height={360} fill="url(#woodG)" />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-20} y={1600 + i * 56} width={1120} height={4} fill="#1C120A" opacity={0.6} />)}
        <rect x={-20} y={1580} width={1120} height={6} fill={C.rim} opacity={0.4} />
        <path d="M860,1600 h80 v-60 q-40,-24 -80,0z" fill="#2A2A2A" />
        <g transform="translate(250,1640)"><Figure o={{ coat: "#4A5040", hat: "helmet" }} s={0.62} /></g>
        <g transform="translate(400,1660)"><Figure o={{ coat: "#3E4652", hat: "cap" }} s={0.66} arm={0.7} /></g>
      </g>
    </Frame>
  );
};

// S3b 15.6–18.6 chart: German mine-laying bomber over the Thames approaches, flak from the forts, mines dropped.
const S3b: React.FC<SP> = ({ t, lt }) => {
  const c: Cam = { cx: 95 - lt * 6, cy: 14, s: 2.75 * (1 + lt * 0.02) };
  const u = 1 / c.s;
  const k = easeOut(ramp(t, 15.6, 18.4));
  const from: [number, number] = [250, -30], to: [number, number] = [-40, 40];
  const bp: [number, number] = [lerp(from[0], to[0], k), lerp(from[1], to[1], k)];
  const ang = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;
  const drops = [17.26, 17.5, 17.75, 18.0];
  return (
    <>
      <MapView cam={c} t={t}>
        <Route from={from} to={bp} bend={0.02} k={1} u={u} col="#8A93A0" w={4} />
        {drops.map((d, i) => {
          if (t < d) return null;
          const kk = d >= 18 ? 0.83 : (d - 15.6) / 2.8;
          const p: [number, number] = [lerp(from[0], to[0], kk), lerp(from[1], to[1], kk) + 8];
          const r = ramp(t, d + 0.3, d + 1.4);
          return (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r={(10 + 50 * r) * u} fill="none" stroke={C.foam} strokeWidth={3 * u} opacity={r > 0 ? 1 - r : 0} />
              <g transform={`translate(${p[0]},${p[1]}) scale(${u * (1.2 - 0.4 * ramp(t, d, d + 0.3))})`}><Mine /></g>
            </g>
          );
        })}
        {[16.0, 16.35, 16.7, 17.05].map((f, i) => {
          const kk = ramp(t, f, f + 0.9);
          if (kk <= 0) return null;
          const p: [number, number] = [bp[0] + (hash(i) - 0.5) * 40 + 20, bp[1] + (hash(i + 3) - 0.5) * 40];
          const fp = i === 0 ? p : [lerp(from[0], to[0], (f - 15.6) / 2.8) + (hash(i) - 0.5) * 40, lerp(from[1], to[1], (f - 15.6) / 2.8) + (hash(i + 3) - 0.5) * 40];
          return (
            <g key={`f${i}`}>
              <path d={`M0,0 L${fp[0]},${fp[1]}`} stroke="#FFD27A" strokeWidth={3 * u} opacity={kk < 0.2 ? 1 : 0} />
              <circle cx={fp[0]} cy={fp[1]} r={(10 + 26 * kk) * u} fill="#2A2A2A" opacity={0.75 * (1 - kk * 0.6)} />
              <circle cx={fp[0]} cy={fp[1]} r={18 * u} fill="#FFB050" opacity={kk < 0.25 ? 1 - kk * 4 : 0} filter="url(#glow)" />
            </g>
          );
        })}
        <FortPin p={PLACES.sealand} u={u} t={t} />
        <g transform={`translate(${bp[0]},${bp[1]}) rotate(${ang}) scale(${u * 1.1})`}>
          <g transform="translate(14,22)" opacity={0.45}><Bomber col="#000" /></g>
          <Bomber />
        </g>
      </MapView>
      <Tag c={c} p={PLACES.thames} text="MUARA THAMES" t={t} t0={15.8} dy={40} gold />
      <Tag c={c} p={PLACES.rotterdam} text="BELANDA" t={t} t0={16.0} dy={40} gold />
      <ChartFG t={t} />
    </>
  );
};

// S4 18.6–24.2 cross-section: tugs tow the floating fort, it is sunk onto the sandbank; pull back to show 7 nm.
const S4: React.FC<SP> = ({ t, lt }) => {
  const tow = easeOut(ramp(t, 18.6, 20.4));
  const fx = lerp(-300, 560, tow);
  const sink = ease(ramp(t, T("ditenggelamkan"), T("gosong")));
  const oy = lerp(750, 900, sink);
  const tugsGo = ramp(t, 20.3, 22.4);
  const zs = lerp(1, 0.62, ease(ramp(t, T("tujuh"), T("tujuh") + 1.1)));
  const ruler = ease(ramp(t, T("tujuh") + 0.3, T("pantai.")));
  const plume = ramp(t, T("gosong") - 0.05, T("gosong") + 1.6);
  const s = 0.7;
  return (
    <Frame>
      <g transform={cam(zs * (1 + lt * 0.01), 560, 1000)}>
        <Sky id="s4" top="#3A4552" mid="#7D8790" glow="#C9C2AE" horizon={900} />
        <rect x={-1200} y={-900} width={3400} height={1100} fill="#3A4552" />
        <Underwater y={900} t={t} id="s4" x0={-1200} x1={2200} y1={2700} />
        <Sandbank peak={1096} base={1330} cx={560} half={430} x0={-1200} x1={2200} y1={2700} />
        {/* Essex coast (clay cliff) on the far left, revealed by the pull-back */}
        <path d="M-1200,770 L-420,770 Q-330,780 -290,840 L-250,900 L-200,1100 L-120,1330 L-1200,1330Z" fill="#7A5A3A" />
        <path d="M-1200,770 L-420,770 Q-330,780 -290,840" stroke="#5E6B3A" strokeWidth={22} fill="none" />
        <path d="M-1200,770 L-420,770" stroke={C.rim} strokeWidth={4} opacity={0.6} transform="translate(0,-12)" />
        {/* tugs + tow lines */}
        {[0, 1].map((i) => {
          const tx = fx + 420 + i * 300 + tugsGo * 900;
          return (
            <g key={i}>
              {tugsGo < 0.15 ? <path d={`M${fx + 150 * s},${oy - 280 * s} Q${(fx + tx) / 2},${900 - 10} ${tx - 150},${880}`} stroke="#1E1B18" strokeWidth={4} fill="none" /> : null}
              <g transform={`translate(${tx},${900 + Math.sin(t * 2 + i) * 5}) scale(0.62)`}><Tug t={t} /></g>
            </g>
          );
        })}
        <g transform={`translate(${fx},${oy}) scale(${s})`}><Fort under t={t} gun rust={0.15} /></g>
        <rect x={-1200} y={906} width={3400} height={1800} fill="#1E4A6A" opacity={0.3} />
        {sink > 0 && sink < 1 ? <Bubbles x={fx} w={380} y0={oy + 200 * s} y1={905} t={t} n={22} seed={4} /> : null}
        {plume > 0 && plume < 1 ? [0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={ellipse(fx + (i - 2.5) * 70 * (1 + plume), 1092 - plume * 60 * hash(i), 60 + plume * 90, 26 + plume * 30)} fill={C.sand} opacity={0.55 * (1 - plume)} />
        )) : null}
        <Splash x={fx - 80} y={900} t={t} t0={T("ditenggelamkan")} s={1.2} />
        <Splash x={fx + 80} y={900} t={t} t0={T("ditenggelamkan") + 0.15} s={1.1} />
        <Surface y={900} t={t} x0={-1200} x1={2200} />
        {ruler > 0 ? (
          <g opacity={ruler}>
            <path d={`M-250,840 L${-250 + 790 * ruler},840`} stroke={C.goldHi} strokeWidth={8} />
            {Array.from({ length: 8 }, (_, i) => (i / 7 <= ruler ? <path key={i} d={`M${-250 + (790 * i) / 7},820 v40`} stroke={C.goldHi} strokeWidth={6} /> : null))}
          </g>
        ) : null}
      </g>
      <g filter="url(#blur6)">
        {[60, 300, 820, 1040].map((x, i) => <path key={x} d={`M${x},1960 q${-30 + i * 20},-220 ${12 - i * 6},-${330 + i * 40}`} stroke="#2E4A2A" strokeWidth={24} fill="none" opacity={0.85} transform={`rotate(${Math.sin(t * 1.5 + i) * 5} ${x} 1960)`} />)}
        <path d={ellipse(520, 1940, 420, 110)} fill="#3A3024" />
      </g>
    </Frame>
  );
};

// S5 24.2–27.1 chart: the 3-nm territorial limit grows from the coast and stops short of the fort.
const S5: React.FC<SP> = ({ t, lt }) => {
  const c: Cam = { cx: -7 + lt * 0.35, cy: -1, s: 26 * (1 + lt * 0.02) };
  const u = 1 / c.s;
  const nm = 3 * easeOut(ramp(t, T("batas"), T("tiga") + 0.15));
  const edge = -14.5 + nm * 1.852;
  return (
    <>
      <MapView cam={c} t={t} under={nm > 0 ? <Territory nm={nm} u={u} /> : null}>
        {nm > 0.2 ? (
          <g>
            <path d={`M-14.5,4 L${edge},4`} stroke={C.blueTag} strokeWidth={5 * u} />
            <path d={`M${edge},4 L-0.9,4`} stroke={C.goldHi} strokeWidth={4 * u} strokeDasharray={`${12 * u} ${8 * u}`} opacity={ramp(t, T("tiga"), T("tiga") + 0.3)} />
          </g>
        ) : null}
        <FortPin p={PLACES.sealand} u={u} t={t} size={1.3} />
      </MapView>
      <Tag c={c} p={proj(0.9, 51.98)} text="INGGRIS" t={t} t0={24.4} dy={-30} gold />
      <Tag c={c} p={PLACES.sealand} text="BENTENG" t={t} t0={24.6} dy={70} />
      <ChartFG t={t} />
    </>
  );
};

// S6 27.1–29.55 close-up of the abandoned deck: fog, rust, a door swinging, gulls take the railing.
const S6: React.FC<SP> = ({ t, lt }) => {
  const door = Math.sin(t * 1.7) * 0.35 + 0.45;
  return (
    <Frame>
      <g transform={cam(1.02 + lt * 0.03, 540, 1100, -lt * 8, 0)}>
        <Sky id="s6" top="#3A4552" mid="#7D8790" glow="#B8B2A0" horizon={1200} />
        <Lit draw={(c) => (
          <g>
            <rect x={60} y={760} width={700} height={560} fill={c ?? C.concrete} />
            <path d="M40,760 L380,640 L780,760Z" fill={c ?? "#5E3A2A"} />
          </g>
        )} />
        <rect x={60} y={760} width={700} height={560} fill="#000" filter="url(#grit)" />
        <rect x={60} y={760} width={700} height={560} fill="url(#keylit)" />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={90 + hash(i) * 640} y={770} width={4 + hash(i + 2) * 6} height={120 + hash(i * 3) * 300} fill={C.rust} opacity={0.4 + hash(i) * 0.3} />)}
        <rect x={60} y={760} width={6} height={560} fill={C.rim} opacity={0.6} />
        <rect x={120} y={860} width={150} height={110} fill="#1E242C" />
        <path d="M120,860 L200,930 L170,970 M200,930 L270,880" stroke="#9AA4AE" strokeWidth={3} opacity={0.6} />
        <rect x={430} y={960} width={170} height={360} fill="#121418" />
        <g transform={`translate(430,960) scale(${door},1)`}>
          <rect width={170} height={360} fill="#6A4A34" />
          <rect width={170} height={360} fill="url(#keylit)" />
          <rect x={20} y={30} width={130} height={130} fill="#000" opacity={0.18} />
          <circle cx={150} cy={190} r={8} fill="#2A2A2A" />
        </g>
        <rect x={-40} y={1320} width={1160} height={700} fill="#4A443E" />
        {Array.from({ length: 7 }, (_, i) => <rect key={i} x={-40} y={1340 + i * 90} width={1160} height={3} fill="#000" opacity={0.3} />)}
        <path d={ellipse(700, 1480, 160, 26)} fill="#7D8790" opacity={0.35} />
        <path d={ellipse(300, 1700, 220, 30)} fill="#7D8790" opacity={0.3} />
        {[0, 1, 2].map((i) => {
          const x = ((t * (30 + i * 12) + i * 500) % 1700) - 400;
          return <path key={i} d={ellipse(x, 900 + i * 260, 520, 90)} fill="#D8D4C8" opacity={0.22} filter="url(#soft)" />;
        })}
        <Gull x={lerp(1150, 860, ease(ramp(lt, 0.2, 1.8)))} y={lerp(700, 1352, ease(ramp(lt, 0.2, 1.8)))} s={0.9} t={lt < 1.8 ? t : 0.2} />
      </g>
      <g filter="url(#blur6)">
        <rect x={-20} y={1560} width={1120} height={22} fill="#3A2A22" />
        <rect x={-20} y={1690} width={1120} height={22} fill="#3A2A22" />
        {[80, 380, 680, 980].map((x) => <rect key={x} x={x} y={1540} width={26} height={400} fill="#2E221C" />)}
        <rect x={-20} y={1556} width={1120} height={5} fill={C.rim} opacity={0.4} />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={60 + i * 180} y={1582} width={12} height={60} fill={C.rust} opacity={0.6} />)}
      </g>
    </Frame>
  );
};

// S7 29.55–36.5 dawn 1967: Roy Bates's launch arrives with its radio mast, he climbs the ladder and occupies the fort.
const S7: React.FC<SP> = ({ t, lt }) => {
  const lx = lerp(-260, 470, easeOut(ramp(t, 29.6, 32.7)));
  const climb = ease(ramp(t, T("mendudukinya"), T("mendudukinya") + 0.95));
  const onLadder = t >= T("mendudukinya") - 0.05;
  const radio = ramp(t, T("radio"), T("radio") + 1.3);
  const bob = Math.sin(t * 2.2) * 6;
  return (
    <Frame>
      <g transform={cam(1 + lt * 0.018, 600, 1300, -lt * 6, 0)}>
        <Sky id="s7" top="#20304A" mid="#6A6A7A" glow="#F0B070" horizon={1320} sunX={0.2} />
        <Sea y={1320} t={t} col="#2A3A50" light="#C88A5A" />
        <g transform="translate(860,1320) scale(1.3)"><Fort t={t} rust={0.6} gun={false} /></g>
        <Ladder x={640} y0={917} y1={1330} />
        <g transform={`translate(${lx},${1320 + bob})`}>
          <rect x={60} y={-200} width={6} height={170} fill="#2A2622" />
          <path d="M40,-170 h46 M48,-140 h30" stroke="#2A2622" strokeWidth={4} />
          {radio > 0 ? [0, 1, 2].map((i) => {
            const k = ((radio * 2 + i / 3) % 1);
            return <path key={i} d={`M${63 - 30 - k * 80},${-200 - 10 - k * 40} Q63,${-200 - 60 - k * 90} ${63 + 30 + k * 80},${-200 - 10 - k * 40}`} stroke={C.goldHi} strokeWidth={5} fill="none" opacity={1 - k} />;
          }) : null}
          <Launch />
          {!onLadder ? <g transform="translate(-30,-36)"><Figure o={{ coat: "#5A4A38", hat: "beret" }} s={0.42} arm={ramp(t, 32.7, 33.2) * 0.4} /></g> : null}
        </g>
        {onLadder ? <g transform={`translate(660,${lerp(1290, 925, climb)})`}><Figure o={{ coat: "#5A4A38", hat: "beret" }} s={0.42} pose={climb < 1 ? t * 9 : 0} arm={climb >= 1 ? 0.9 : 0.6} /></g> : null}
      </g>
      <FGWaves t={t} y={1580} />
    </Frame>
  );
};

// S7b 36.5–38.75 low angle: the Sealand flag is hoisted, Roy raises his arm in the foreground.
const S7b: React.FC<SP> = ({ t, lt }) => {
  const up = ease(ramp(t, T("memproklamasikan"), T("memproklamasikan") + 0.9));
  return (
    <Frame>
      <g transform={cam(1 + lt * 0.03, 540, 1200, 0, lt * 10, -2)}>
        <Sky id="s7b" top="#2B2038" mid="#B85E34" glow="#FFBF6A" horizon={1500} sunX={0.75} />
        <rect x={634} y={560} width={12} height={1400} fill="#2A2622" />
        <rect x={634} y={560} width={3} height={1400} fill={C.rim} opacity={0.6} />
        <SealandFlag x={646} y={lerp(1300, 620, up)} w={380} t={t} />
        <rect x={-40} y={1500} width={1160} height={460} fill="#3A2A26" />
        <rect x={-40} y={1500} width={1160} height={8} fill={C.rim} opacity={0.5} />
      </g>
      <g transform="translate(250,2060)"><Figure o={{ coat: "#5A4A38", hat: "beret" }} s={2.6} arm={0.35 + 0.6 * ease(ramp(t, 36.9, 37.5))} /></g>
    </Frame>
  );
};

// S8 38.75–42.95 deck POV 1968: Michael fires warning shots that splash ahead of a British vessel.
const S8: React.FC<SP> = ({ t, lt }) => {
  const shots = [T("melepas"), T("melepas") + 0.38, T("melepas") + 0.8];
  const tip: [number, number] = [796, 1491];
  const target: [number, number] = [520, 1170];
  const px = lerp(260, 340, lt / 4.2);
  return (
    <Frame>
      <g transform={cam(1.02 + lt * 0.015, 540, 1150, -lt * 5, 0)}>
        <Sky id="s8" top="#3A4552" mid="#8A929A" glow="#D8CDB4" horizon={1150} />
        <Sea y={1150} t={t} col="#3F5A6C" light="#8FA2AE" />
        <g transform={`translate(${px},1160) scale(0.5)`}><Patrol /></g>
        {shots.map((s, i) => <Splash key={i} x={target[0] + i * 40 - 20} y={1172} t={t} t0={s + 0.22} s={0.9} />)}
      </g>
      {shots.map((s, i) => {
        const k = ramp(t, s, s + 0.22);
        if (k <= 0 || k >= 1) return null;
        const x = lerp(tip[0], target[0] + i * 40 - 20, k), y = lerp(tip[1], target[1], k);
        return <path key={i} d={`M${x},${y} L${x + (tip[0] - target[0]) * 0.12},${y + (tip[1] - target[1]) * 0.12}`} stroke="#FFE08A" strokeWidth={5} strokeLinecap="round" />;
      })}
      <g>
        <rect x={-20} y={1600} width={1120} height={400} fill="#4A443E" />
        <rect x={-20} y={1560} width={1120} height={18} fill="#2E2A26" />
        <rect x={-20} y={1556} width={1120} height={5} fill={C.rim} opacity={0.45} />
        {[60, 360, 660].map((x) => <rect key={x} x={x} y={1560} width={20} height={80} fill="#2E2A26" />)}
      </g>
      <g transform={`translate(880,${1960 + (shots.some((s) => t > s && t < s + 0.1) ? 8 : 0)})`}><Figure o={{ coat: "#3E4A36", hat: "cap", prop: "rifle" }} s={1.9} flip /></g>
      {shots.map((s, i) => (t > s && t < s + 0.09 ? <circle key={i} cx={tip[0]} cy={tip[1]} r={44} fill="#FFD27A" filter="url(#glow)" /> : null))}
    </Frame>
  );
};

// S9 42.95–48.75 Essex courtroom: the judge's gavel falls, window light across the bench.
const S9: React.FC<SP> = ({ t, lt }) => {
  const slam = T("memutuskan,");
  const arm = t < slam ? 0.2 + 0.8 * ease(ramp(t, 43.9, 44.45)) : 1 - 0.85 * ease(ramp(t, slam, slam + 0.08));
  const ring = ramp(t, slam + 0.06, slam + 0.8);
  const ring2 = ramp(t, T("gugur.") , T("gugur.") + 0.7);
  return (
    <Frame>
      <g transform={cam(1.03 + lt * 0.012, 540, 1100, 0, -lt * 4)}>
        <rect width={1080} height={1920} fill="url(#woodG)" />
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={i * 140} y={0} width={4} height={1920} fill="#1C120A" opacity={0.5} />)}
        <rect x={0} y={1040} width={1080} height={10} fill="#1C120A" opacity={0.5} />
        <path d="M770,1000 L770,560 Q875,420 980,560 L980,1000Z" fill="#E8DCC0" />
        <path d="M875,460 L875,1000 M770,720 L980,720" stroke="#3A2A1C" strokeWidth={10} />
        <path d="M780,1000 L970,1000 L560,1500 L120,1500Z" fill="#FFE6B0" opacity={0.12} style={{ mixBlendMode: "screen" }} />
        <g opacity={1 - ramp(t, 46.9, 47.2)}><circle cx={380} cy={760} r={86} fill="#5A3A22" stroke={C.gold} strokeWidth={6} />
        <text x={380} y={776} textAnchor="middle" fontFamily="Anton" fontSize={44} fill={C.goldHi} style={{ color: C.goldHi }}>ESSEX</text></g>
        <g transform="translate(540,1400)"><Figure o={{ coat: "#16161C", hat: "wig", prop: "gavel" }} s={1.35} arm={arm} /></g>
        <Lit draw={(c) => <rect x={110} y={1240} width={860} height={300} fill={c ?? "#5A3A22"} />} />
        <rect x={110} y={1240} width={860} height={300} fill="url(#keylit)" />
        <rect x={110} y={1240} width={860} height={8} fill={C.rim} opacity={0.6} />
        {[150, 420, 690].map((x) => <rect key={x} x={x} y={1280} width={240} height={220} fill="none" stroke="#2E1E12" strokeWidth={6} />)}
        <rect x={600} y={1218} width={70} height={24} fill="#3A2614" />
        {ring > 0 && ring < 1 ? <path d={ellipse(635, 1222, 40 + 260 * ring, 12 + 70 * ring)} fill="none" stroke={C.goldHi} strokeWidth={6 * (1 - ring)} /> : null}
        {ring2 > 0 && ring2 < 1 ? <path d={ellipse(635, 1222, 40 + 300 * ring2, 12 + 80 * ring2)} fill="none" stroke={C.red} strokeWidth={6 * (1 - ring2)} /> : null}
      </g>
      <g filter="url(#blur6)">
        <rect x={-20} y={1600} width={1120} height={30} fill="#3A2614" />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={20 + i * 112} y={1630} width={30} height={320} fill="#4A3020" />)}
        <path d="M640,1760 l300,-40 l20,140 l-300,40z" fill="#E8E0CC" />
        <path d="M660,1790 l250,-34 M664,1820 l250,-34" stroke="#888" strokeWidth={4} />
      </g>
    </Frame>
  );
};

// S10 48.75–56.4 chart of Europe 1978: Roy flies to Austria; mercenary routes from Germany and the Netherlands.
const S10: React.FC<SP> = ({ t, lt }) => {
  const c0: Cam = { cx: 520, cy: 210, s: 0.74 };
  const c = lerpCam(c0, { cx: 190, cy: -40, s: 1.25 }, ease(ramp(t, 54.3, 56.3)));
  c.s *= 1 + lt * 0.035;
  const u = 1 / c.s;
  const kRoy = easeOut(ramp(t, T("Roy", 1), T("Roy", 1) + 1.1));
  const kDE = easeOut(ramp(t, T("Jerman", 1) - 0.4, T("Jerman", 1) + 0.7));
  const kNL = easeOut(ramp(t, T("Belanda."), T("Belanda.") + 0.8));
  return (
    <>
      <MapView cam={c} t={t}>
        <Route from={PLACES.sealand} to={PLACES.wien} bend={-0.18} k={kRoy} u={u} col={C.blueTag} />
        {kRoy >= 1 ? <Dot p={PLACES.wien} u={u} t={t} col={C.blueTag} /> : null}
        <Route from={PLACES.hamburg} to={[14, -8]} bend={0.15} k={kDE} u={u} />
        <Route from={PLACES.amsterdam} to={[16, 6]} bend={-0.2} k={kNL} u={u} />
        {kDE > 0 ? <Dot p={PLACES.hamburg} u={u} t={t} col={C.red} /> : null}
        {kNL > 0 ? <Dot p={PLACES.amsterdam} u={u} t={t} col={C.red} /> : null}
        <FortPin p={PLACES.sealand} u={u} t={t} size={1.2} />
      </MapView>
      <Tag c={c} p={PLACES.wien} text="AUSTRIA" t={t} t0={51.1} until={54.4} dy={30} gold />
      <Tag c={c} p={PLACES.hamburg} text="JERMAN" t={t} t0={55.2} dy={-90} />
      <Tag c={c} p={PLACES.amsterdam} text="BELANDA" t={t} t0={55.7} dy={30} dx={60} />
      <ChartFG t={t} />
    </>
  );
};

// Shared fort-deck set for the 1978 raid (S11, S12).
const RaidSet: React.FC<{ t: number; zoom: number; children: React.ReactNode }> = ({ t, zoom, children }) => (
  <g transform={cam(zoom, 650, 1035)}>
    <Sky id="raid" top="#2E3A4A" mid="#6E7682" glow="#B8B2A4" horizon={1500} />
    {[0, 1].map((i) => <path key={i} d={ellipse(((t * 20 + i * 600) % 1600) - 300, 420 + i * 200, 380, 60)} fill="#C8C4BA" opacity={0.25} filter="url(#soft)" />)}
    <Sea y={1500} t={t} col="#2C3E50" light="#6E7F8E" />
    <g transform="translate(760,1500) scale(1.5)"><Fort t={t} flag={1} gun={false} helipad /></g>
    {children}
  </g>
);

// S11 56.4–60.35 helicopter raid: mercenaries rope down, Michael is taken hostage.
const S11: React.FC<SP> = ({ t, lt }) => {
  const hk = easeOut(ramp(t, 56.4, 57.3));
  const hx = lerp(150, 680, hk), hy = lerp(330, 840, hk) + Math.sin(t * 3) * 6;
  const deck = 1035;
  return (
    <Frame>
      <RaidSet t={t} zoom={1 + lt * 0.02}>
        <path d={ellipse(hx, deck, 260 * hk, 20)} fill="#E8E4DA" opacity={0.25 * hk} />
        {hk >= 1 ? <path d={`M${hx + 20},${hy + 40} L${hx + 20},${deck}`} stroke="#1E1B18" strokeWidth={3} /> : null}
        {[0, 1, 2].map((i) => {
          const k = ease(ramp(t, 57.0 + i * 0.25, 57.4 + i * 0.25));
          if (t < 57.0 + i * 0.25) return null;
          const x = k < 1 ? hx + 20 : 600 + i * 70;
          const y = lerp(hy + 60, deck, k);
          return <g key={i} transform={`translate(${x},${y})`}><Figure o={{ coat: "#3E4A36", hat: "helmet", prop: "rifle" }} s={0.4} flip pose={k >= 1 ? 0 : 0.6} /></g>;
        })}
        <g transform={`translate(500,${deck})`}><Figure o={{ coat: "#6A5A44", hat: "none" }} s={0.4} arm={ease(ramp(t, T("menyandera"), T("menyandera") + 0.3))} /></g>
        <g transform={`translate(${hx},${hy}) scale(1.1)`}><Heli t={t} /></g>
      </RaidSet>
      <FGWaves t={t} y={1600} />
    </Frame>
  );
};

// S12 60.35–61.6 Michael storms back with a rifle, the mercenaries' helicopter lifts off.
const S12: React.FC<SP> = ({ t, lt }) => {
  const run = easeOut(ramp(lt, 0, 1.2));
  const deck = 1035;
  return (
    <Frame>
      <RaidSet t={t} zoom={1.35 + lt * 0.05}>
        <g transform={`translate(${lerp(680, 920, lt / 1.25)},${lerp(840, 620, lt / 1.25)}) scale(1.1)`}><Heli t={t} /></g>
        {[0, 1].map((i) => <g key={i} transform={`translate(${lerp(640 + i * 60, 820 + i * 50, run)},${deck})`}><Figure o={{ coat: "#3E4A36", hat: "helmet" }} s={0.4} pose={t * 14 + i} arm={0.9} /></g>)}
        <g transform={`translate(${lerp(420, 600, run)},${deck})`}><Figure o={{ coat: "#6A5A44", hat: "none", prop: "rifle" }} s={0.42} pose={run < 1 ? t * 14 : 0} /></g>
      </RaidSet>
      <FGWaves t={t} y={1600} />
    </Frame>
  );
};

// S13 61.6–64.6 cell: the bars slam shut on Achenbach, charged with treason.
const S13: React.FC<SP> = ({ t, lt }) => {
  const close = ease(ramp(t, T("menahan"), T("menahan") + 0.4));
  const shake = t > T("menahan") + 0.4 ? (1 - ramp(t, T("menahan") + 0.4, T("menahan") + 0.9)) * 10 : 0;
  return (
    <Frame>
      <g transform={cam(1.03 + lt * 0.06, 540, 1200, Math.sin(t * 60) * shake, 0)}>
        <rect width={1080} height={1920} fill="#55524C" />
        <rect width={1080} height={1920} fill="#000" filter="url(#grit)" opacity={0.6} />
        <rect x={0} y={1420} width={1080} height={520} fill="#3A3833" />
        <rect x={700} y={560} width={220} height={170} fill="#E8DEC4" />
        {[740, 790, 840, 880].map((x) => <rect key={x} x={x} y={560} width={10} height={170} fill="#2A2824" />)}
        <path d="M700,730 L920,730 L620,1500 L180,1500Z" fill="#FFE8B8" opacity={0.14} style={{ mixBlendMode: "screen" }} />
        <rect x={120} y={1260} width={360} height={60} fill="#5A3E28" />
        <rect x={140} y={1320} width={14} height={110} fill="#3A2A1C" /><rect x={446} y={1320} width={14} height={110} fill="#3A2A1C" />
        <g transform="translate(560,1460)"><Figure o={{ coat: "#3A3F4A", hat: "none", hair: "#6A5A4A" }} s={1.45} pose={0} arm={0} flip /></g>
      </g>
      <g transform={`translate(${lerp(1100, 0, close)},0)`}>
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i}>
            <rect x={40 + i * 110 + 10} y={0} width={30} height={1920} fill={SHADOW} />
            <rect x={40 + i * 110} y={0} width={28} height={1920} fill="#2A2C30" />
            <rect x={40 + i * 110} y={0} width={6} height={1920} fill={C.rim} opacity={0.5} />
          </g>
        ))}
        <rect x={0} y={660} width={1120} height={30} fill="#2A2C30" />
        <rect x={0} y={1560} width={1120} height={30} fill="#2A2C30" />
        <rect x={0} y={1560} width={1120} height={5} fill={C.rim} opacity={0.4} />
      </g>
    </Frame>
  );
};

// S14 64.6–67.45 a West German launch delivers a diplomat with a briefcase to the fort.
const S14: React.FC<SP> = ({ t, lt }) => {
  const lx = lerp(1250, 640, easeOut(ramp(t, 64.6, 65.9)));
  const climb = ease(ramp(t, 66.2, 67.35));
  const onLadder = t >= 66.2;
  const bob = Math.sin(t * 2.3) * 5;
  return (
    <Frame>
      <g transform={cam(1 + lt * 0.05, 400, 1250, lt * 14, 0)}>
        <Sky id="s14" top="#3A4552" mid="#8A929A" glow="#CFC7B2" horizon={1250} />
        <Sea y={1250} t={t} col="#3C4A58" light="#8A98A4" />
        <g transform="translate(160,1250) scale(1.7)"><Fort t={t} flag={0} gun={false} /></g>
        <Ladder x={445} y0={723} y1={1260} />
        <g transform={`translate(${lx},${1250 + bob})`}>
          <rect x={110} y={-130} width={5} height={100} fill="#2A2622" />
          <g transform={`translate(115,-130)`}>
            <rect width={70} height={14} fill="#111" /><rect y={14} width={70} height={14} fill="#C8202A" /><rect y={28} width={70} height={14} fill="#E8B830" />
          </g>
          <Launch />
          {!onLadder ? <g transform="translate(-20,-36)"><Figure o={{ coat: "#2C2F38", hat: "none", prop: "briefcase" }} s={0.42} /></g> : null}
        </g>
        {onLadder ? <g transform={`translate(470,${lerp(1220, 735, climb)})`}><Figure o={{ coat: "#2C2F38", hat: "none", prop: "briefcase" }} s={0.42} pose={climb < 1 ? t * 9 : 0} /></g> : null}
      </g>
      <FGWaves t={t} y={1590} />
    </Frame>
  );
};

// S15 67.45–76.7 PAYOFF chart 1987: territorial waters 3 → 12 nm sweep over the fort; nobody recognises it.
const S15: React.FC<SP> = ({ t, lt }) => {
  const zk = ease(ramp(t, 70.4, 73.2));
  const c: Cam = { cx: lerp(-6, -10, zk), cy: lerp(-2, -4, zk), s: lerp(19, 12.5, zk) * (1 + lt * 0.004) };
  const u = 1 / c.s;
  const nm = 3 + 9 * ease(ramp(t, T("memperluas"), T("mil.", 1)));
  const inside = nm >= 6.6;
  const flash = inside ? clamp01(1 - (nm - 6.6) / 2.2) : 0;
  const deny = ramp(t, T("tak"), T("tak") + 0.4);
  return (
    <>
      <MapView cam={c} t={t} under={<Territory nm={nm} u={u} />}>
        {flash > 0 ? <circle cx={0} cy={0} r={(40 + 260 * (1 - flash)) * u} fill="none" stroke={C.goldHi} strokeWidth={10 * u} opacity={flash} /> : null}
        <FortPin p={PLACES.sealand} u={u} t={t} size={1.4} col={inside ? C.blueTag : C.red} />
        {deny > 0 ? <path d={`M${-30 * u},${-30 * u} L${30 * u},${30 * u} M${30 * u},${-30 * u} L${-30 * u},${30 * u}`} stroke={C.red} strokeWidth={10 * u} opacity={deny} transform={`translate(${80 * u},${-70 * u})`} /> : null}
      </MapView>
      <Tag c={c} p={PLACES.sealand} text={inside ? "SEALAND · DI DALAM" : "SEALAND"} t={t} t0={67.7} dy={60} dx={60} gold={inside} />
      <ChartFG t={t} />
    </>
  );
};

// S16 76.7–82.25 desk: a Sealand "Lord" title certificate slides in, the title is lit, the price appears.
const S16: React.FC<SP> = ({ t, lt }) => {
  const k = easeOut(ramp(t, 76.75, 77.6));
  const glow = ramp(t, T("Lord"), T("Lord") + 0.3) * (1 - 0.5 * ramp(t, 81, 82));
  const sweep = ramp(t, T("Lord"), T("Lord") + 0.9);
  return (
    <Frame>
      <g transform={cam(1.02 + lt * 0.02, 540, 1000, 0, -lt * 6)}>
        <rect width={1080} height={1920} fill="url(#woodG)" />
        {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M-20,${100 + i * 140} q540,${30 * Math.sin(i)} 1120,0`} stroke="#2A180C" strokeWidth={3} fill="none" opacity={0.5} />)}
        <g transform={`translate(540,${lerp(-700, 1060, k)}) rotate(${lerp(-14, -3, k)}) scale(0.85)`}>
          <rect x={-350} y={-400} width={700} height={800} fill={SHADOW} transform="translate(24,30)" filter="url(#cast)" />
          <rect x={-350} y={-400} width={700} height={800} fill="#EADCB8" />
          <rect x={-350} y={-400} width={700} height={800} fill="#000" filter="url(#mottle)" opacity={0.7} />
          <rect x={-320} y={-370} width={640} height={740} fill="none" stroke={C.gold} strokeWidth={6} />
          <rect x={-306} y={-356} width={612} height={712} fill="none" stroke={C.gold} strokeWidth={2} />
          <text x={0} y={-260} textAnchor="middle" fontFamily="Jakarta" fontSize={34} letterSpacing={4} fill="#5A3A1C" style={{ color: "#5A3A1C" }}>PRINCIPALITY OF SEALAND</text>
          <rect x={-230} y={-180} width={460} height={190} fill={C.goldHi} opacity={0.35 * glow} filter="url(#glow)" />
          <text x={0} y={-30} textAnchor="middle" fontFamily="Anton" fontSize={200} fill="#2A1A0C" style={{ color: "#2A1A0C" }}>LORD</text>
          {sweep > 0 && sweep < 1 ? <rect x={-300 + 600 * sweep} y={-200} width={60} height={220} fill="#FFF6D8" opacity={0.5} transform="skewX(-18)" /> : null}
          <text x={0} y={60} textAnchor="middle" fontFamily="Jakarta" fontSize={40} fill="#5A3A1C" style={{ color: "#5A3A1C" }}>OF SEALAND</text>
          <path d="M-220,240 h200 M40,240 h200" stroke="#5A3A1C" strokeWidth={3} />
          <circle cx={200} cy={300} r={56} fill="#A02020" />
          <circle cx={200} cy={300} r={38} fill="none" stroke="#6A1010" strokeWidth={5} />
          <circle cx={186} cy={286} r={14} fill="#E06060" opacity={0.6} />
        </g>
      </g>
      <g filter="url(#blur6)">
        <path d="M600,1980 L1100,1560 L1130,1590 L640,2010Z" fill={SHADOW} transform="translate(20,24)" />
        <path d="M600,1960 L1100,1540 L1126,1566 L630,1990Z" fill="#1A1A22" />
        <path d="M600,1960 L560,1994 L630,1990Z" fill="#C9A45C" />
        <path d="M900,1708 L940,1674" stroke={C.gold} strokeWidth={14} />
        {[0, 1, 2, 3].map((i) => <g key={i}><path d={ellipse(200, 1800 - i * 22, 90, 30)} fill="#9A7A34" /><path d={ellipse(200, 1794 - i * 22, 90, 30)} fill="#D9B04E" /></g>)}
      </g>
    </Frame>
  );
};

// S17 82.25–88.4 aerial dusk: the fort lights up, AUDIRA painted on the roof; the question to the viewer.
const S17: React.FC<SP> = ({ t, lt }) => (
  <Frame>
    <g transform={cam(lerp(1.15, 0.92, ease(ramp(lt, 0, 6))), 540, 1000, 0, 0, lerp(3, -3, ramp(lt, 0, 6)))}>
      <SeaTop t={t} dusk />
      <g transform="translate(540,1000) scale(1.08)"><FortTop t={t} lights={ramp(lt, 0.3, 1.2)} label="AUDIRA" /></g>
    </g>
    <TopGulls t={t} lt={lt} />
  </Frame>
);

// =====================================================================================
// TIMING
// =====================================================================================
type SceneDef = { id: string; start: number; C: React.FC<SP>; kicker: string };
const SCENES: SceneDef[] = [
  { id: "S1", start: 0, C: S1, kicker: "LAUT UTARA // 51°53'N 1°28'E" },
  { id: "S1b", start: 4.97, C: S1b, kicker: "LAUT UTARA // 51°53'N 1°28'E" },
  { id: "S2", start: 7.55, C: S2, kicker: "SEALAND // LAUT UTARA" },
  { id: "S3a", start: 11.25, C: S3a, kicker: "1943 // PERANG DUNIA II" },
  { id: "S3b", start: 15.77, C: S3b, kicker: "MUARA THAMES // 1943" },
  { id: "S4", start: 18.6, C: S4, kicker: "GOSONG ROUGHS // 7 MIL LAUT" },
  { id: "S5", start: 24.2, C: S5, kicker: "BATAS LAUT INGGRIS // 1943" },
  { id: "S6", start: 27.1, C: S6, kicker: "1945 // PERANG USAI" },
  { id: "S7", start: 29.55, C: S7, kicker: "2 SEPTEMBER 1967" },
  { id: "S7b", start: 36.5, C: S7b, kicker: "KEPANGERANAN SEALAND" },
  { id: "S8", start: 38.75, C: S8, kicker: "1968 // TEMBAKAN PERINGATAN" },
  { id: "S9", start: 42.95, C: S9, kicker: "PENGADILAN ESSEX // 1968" },
  { id: "S10", start: 48.75, C: S10, kicker: "1978 // KUDETA" },
  { id: "S11", start: 56.4, C: S11, kicker: "1978 // SERBUAN HELIKOPTER" },
  { id: "S12", start: 60.35, C: S12, kicker: "1978 // REBUT KEMBALI" },
  { id: "S13", start: 61.6, C: S13, kicker: "1978 // TAHANAN" },
  { id: "S14", start: 64.6, C: S14, kicker: "1978 // DIPLOMAT JERMAN" },
  { id: "S15", start: 67.45, C: S15, kicker: "1987 // 12 MIL LAUT" },
  { id: "S16", start: 76.7, C: S16, kicker: "GELAR BANGSAWAN // KINI" },
  { id: "S17", start: 82.25, C: S17, kicker: "AUDIRA // FAKTA DUNIA" },
];
const endOf = (i: number) => (i < SCENES.length - 1 ? SCENES[i + 1].start : HM_SECONDS);

type Kind = "card" | "big" | "stamp" | "chip";
type Callout = { t: number; until: number; text: string; sub?: string; kind: Kind; x?: number; y: number; rot?: number; count?: number; countTo?: number };
const CALLOUTS: Callout[] = [
  { t: 2.1, until: 4.8, text: " m²", count: 400, countTo: 3.2, sub: "LUAS SELURUH NEGARA", kind: "big", y: 500 },
  { t: 4.97, until: 7.45, text: "2 TIANG BETON", sub: "DI TENGAH LAUT UTARA", kind: "card", y: 480 },
  { t: 7.97, until: 9.65, text: "SEALAND", kind: "big", y: 500 },
  { t: 9.77, until: 11.15, text: "PUNYA PANGERAN", sub: "NEGARA MIKRO · LAUT UTARA", kind: "card", y: 480 },
  { t: 11.7, until: 13.9, text: "1943", sub: "PERANG DUNIA II", kind: "big", y: 500 },
  { t: 14.33, until: 15.5, text: "HM FORT ROUGHS", sub: "DIBANGUN INGGRIS", kind: "card", y: 480 },
  { t: 16.13, until: 18.5, text: "PESAWAT JERMAN", kind: "chip", x: 680, y: 450 },
  { t: 17.65, until: 18.5, text: "RANJAU LAUT", kind: "chip", x: 360, y: 560 },
  { t: 19.13, until: 20.4, text: "DITARIK KE LAUT", kind: "chip", y: 450 },
  { t: 20.48, until: 22.3, text: "DITENGGELAMKAN", kind: "stamp", y: 480, rot: -5 },
  { t: 22.42, until: 24.1, text: "7 MIL LAUT", sub: "±13 KM DARI PANTAI", kind: "big", y: 500 },
  { t: 25.42, until: 26.4, text: "BATAS LAUT: 3 MIL", kind: "card", y: 480 },
  { t: 26.44, until: 27.05, text: "DI LUAR BATAS", kind: "stamp", y: 480, rot: -6 },
  { t: 27.2, until: 29.5, text: "1945", sub: "PERANG USAI", kind: "big", y: 500 },
  { t: 28.59, until: 29.5, text: "DITINGGALKAN", kind: "stamp", y: 690, rot: -5 },
  { t: 30.28, until: 32.6, text: "2 SEP 1967", kind: "big", y: 500 },
  { t: 32.69, until: 36.4, text: "ROY BATES", sub: "PEMILIK RADIO BAJAK LAUT", kind: "card", y: 480 },
  { t: 37.5, until: 38.7, text: "KEPANGERANAN SEALAND", kind: "card", y: 480 },
  { t: 38.79, until: 40.4, text: "1968", kind: "big", y: 500 },
  { t: 40.79, until: 42.9, text: "TEMBAKAN PERINGATAN", kind: "stamp", y: 480, rot: -4 },
  { t: 43.86, until: 46.0, text: "PENGADILAN ESSEX", kind: "chip", y: 450 },
  { t: 46.12, until: 47.4, text: "DI LUAR WILAYAH", sub: "INGGRIS · PUTUSAN 1968", kind: "card", y: 480 },
  { t: 47.82, until: 48.7, text: "KASUS GUGUR", kind: "stamp", y: 650, rot: -6 },
  { t: 48.96, until: 50.4, text: "1978", kind: "big", y: 500 },
  { t: 51.47, until: 54.35, text: "ALEXANDER ACHENBACH", sub: "PERDANA MENTERI SEALAND", kind: "card", y: 480 },
  { t: 54.78, until: 56.35, text: "TENTARA BAYARAN", kind: "chip", y: 450 },
  { t: 56.66, until: 57.7, text: "BENTENG DIREBUT", kind: "chip", y: 450 },
  { t: 57.79, until: 60.3, text: "MICHAEL DISANDERA", sub: "PUTRA ROY BATES", kind: "card", y: 480 },
  { t: 60.65, until: 61.55, text: "DIREBUT KEMBALI", kind: "chip", y: 450 },
  { t: 62.2, until: 63.25, text: "ACHENBACH DITAHAN", kind: "chip", y: 450 },
  { t: 63.3, until: 64.55, text: "TUDUHAN MAKAR", kind: "stamp", y: 480, rot: -5 },
  { t: 64.64, until: 66.2, text: "JERMAN KIRIM DIPLOMAT", kind: "card", y: 480 },
  { t: 66.25, until: 67.4, text: "UNTUK BERNEGOSIASI", kind: "chip", y: 450 },
  { t: 68.55, until: 70.4, text: "1987", kind: "big", y: 500 },
  { t: 70.53, until: 72.2, text: "3 → 12 MIL", kind: "chip", y: 450 },
  { t: 72.28, until: 73.0, text: "12 MIL", kind: "big", y: 500 },
  { t: 73.05, until: 75.2, text: "SEALAND KINI", sub: "DI PERAIRAN INGGRIS", kind: "card", y: 480 },
  { t: 75.28, until: 76.65, text: "0 NEGARA MENGAKUI", kind: "stamp", y: 480, rot: -5 },
  { t: 78.36, until: 79.85, text: "JADI BANGSAWAN", kind: "card", y: 480 },
  { t: 80.79, until: 82.2, text: "Rp560 RIBU", sub: "GELAR LORD · MULAI", kind: "big", y: 500 },
  { t: 82.29, until: 83.1, text: "NEGARA SUNGGUHAN?", kind: "card", y: 480 },
  { t: 83.13, until: 85.0, text: "ATAU BENTENG TUA", sub: "+ TOKO SUVENIR?", kind: "card", y: 480 },
  { t: 85.06, until: 86.6, text: "TULIS DI KOMENTAR", kind: "card", y: 480 },
  { t: 86.67, until: 88.3, text: "AUDIRA", sub: "FAKTA DUNIA", kind: "big", y: 500 },
];

// =====================================================================================
// OVERLAY TEXT + FINISH
// =====================================================================================
const TXT_SHADOW = "0 4px 18px rgba(0,0,0,.6), 0 2px 4px rgba(0,0,0,.6)";
const PLATE = "rgba(14,18,26,.9)";

const CalloutView: React.FC<{ c: Callout; t: number; fps: number }> = ({ c, t, fps }) => {
  if (t < c.t || t > c.until) return null;
  const pop = spring({ frame: (t - c.t) * fps, fps, config: { damping: 13, stiffness: 190, mass: 0.8 } });
  const out = 1 - ramp(t, c.until - 0.22, c.until);
  const base: React.CSSProperties = {
    position: "absolute", left: c.x ?? 540, top: c.y, whiteSpace: "nowrap", color: C.cream, opacity: out * Math.min(1, pop * 1.6),
    textAlign: "left", boxShadow: "0 14px 34px rgba(0,0,0,.5)",
  };
  const text = c.count ? `${Math.round(c.count * easeOut(ramp(t, c.t, c.countTo ?? c.t + 1)))}${c.text}` : c.text;
  if (c.kind === "stamp") {
    return (
      <div style={{ ...base, transform: `translate(-50%,-50%) rotate(${c.rot ?? -5}deg) scale(${1.4 - 0.4 * pop})`, padding: "10px 30px", fontFamily: "Anton", fontSize: 76, color: "#FF5A5E", border: "6px solid #FF5A5E", letterSpacing: 3, background: "rgba(14,10,12,.84)" }}>
        {text}
      </div>
    );
  }
  const big = c.kind === "big", chip = c.kind === "chip";
  return (
    <div style={{ ...base, transform: `translate(-50%,-50%) translateX(${(1 - pop) * -40}px)`, background: PLATE, borderLeft: `${chip ? 8 : 12}px solid ${C.red}`, padding: chip ? "10px 26px" : big ? "14px 40px 18px" : "16px 36px" }}>
      <div style={{ fontFamily: "Anton", fontSize: big ? 132 : chip ? 52 : 76, lineHeight: 1.02, letterSpacing: 1.5, textShadow: TXT_SHADOW }}>{text}</div>
      {c.sub ? <div style={{ fontFamily: "Jakarta", fontSize: 38, color: "#FF6A6E", letterSpacing: 2, marginTop: 6 }}>{c.sub}</div> : null}
    </div>
  );
};

type W = { id: number; text: string; start: number; end: number };
const KW: W[] = WORDS.map((w, i) => ({ id: i, text: w.t.replace(/^Audira/, "AUDIRA"), start: w.s, end: w.e }));
const CHUNKS: W[][] = (() => {
  const out: W[][] = [];
  let cur: W[] = [];
  KW.forEach((w, i) => {
    cur.push(w);
    const next = KW[i + 1];
    const len = cur.map((x) => x.text).join(" ").length;
    if (!next || /[.,:!?]$/.test(w.text) || cur.length >= 4 || len > 20 || next.start - w.end > 0.35) { out.push(cur); cur = []; }
  });
  return out.reduce<W[][]>((acc, ch) => {
    const prev = acc[acc.length - 1];
    if (prev && ch.length === 1 && !/[.,:!?]$/.test(prev[prev.length - 1].text) && [...prev, ...ch].map((x) => x.text).join(" ").length <= 24) prev.push(...ch);
    else acc.push(ch);
    return acc;
  }, []);
})();

const Karaoke: React.FC<{ t: number }> = ({ t }) => {
  if (t > END_VO) return null;
  const idx = CHUNKS.findIndex((ch, i) => t >= ch[0].start - 0.08 && (i === CHUNKS.length - 1 ? t <= ch[ch.length - 1].end + 0.6 : t < CHUNKS[i + 1][0].start - 0.08));
  if (idx < 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1428, height: 112, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Jakarta", fontSize: 58, textShadow: TXT_SHADOW }}>
      {CHUNKS[idx].map((w) => {
        const active = t >= w.start && t < w.end + 0.05;
        const b = active ? 1 + 0.04 * Math.sin(Math.PI * ramp(t, w.start, w.start + 0.18)) : 1;
        return <span key={w.id} style={{ margin: "0 0.2em", color: active ? C.goldHi : "#FFFFFF", transform: `scale(${b})`, display: "inline-block" }}>{w.text}</span>;
      })}
    </div>
  );
};

const Kicker: React.FC<{ t: number }> = ({ t }) => {
  if (t > END_VO) return null;
  const sc = [...SCENES].reverse().find((s) => t >= s.start) ?? SCENES[0];
  const k = ease(ramp(t, sc.start, sc.start + 0.4));
  return (
    <div style={{ position: "absolute", left: 60, top: 280, fontFamily: "Jakarta", fontSize: 38, letterSpacing: 3, color: "#FF6A6E", opacity: k, background: "rgba(14,18,26,.75)", padding: "6px 16px", textShadow: TXT_SHADOW, whiteSpace: "nowrap" }}>
      ● <span style={{ color: C.cream }}>{sc.kicker}</span>
    </div>
  );
};

const Grain: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.22, pointerEvents: "none" }}>
    <filter id="grain03" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={1080} height={1920} filter="url(#grain03)" />
  </svg>
);
const Paper: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.3, pointerEvents: "none" }}>
    <filter id="paper03" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035 0.06" numOctaves={4} seed={3} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.62  0 0 0 0 0.5  0 0 0 0 0.36  0 0 0 0.9 -0.1" />
    </filter>
    <rect width={1080} height={1920} filter="url(#paper03)" />
  </svg>
);

const Stage: React.FC<{ t: number; fps: number; withText?: boolean }> = ({ t, fps, withText = true }) => (
  <>
    {SCENES.map((sc, i) => {
      if (t < sc.start || t > endOf(i) + XFADE) return null;
      const op = i === 0 ? 1 : ease((t - sc.start) / XFADE);
      const Comp = sc.C;
      return (
        <div key={sc.id} style={{ position: "absolute", inset: 0, opacity: op }}>
          <Comp t={t} lt={t - sc.start} />
        </div>
      );
    })}
    <div style={{ position: "absolute", inset: 0, mixBlendMode: "soft-light", opacity: 0.55 + 0.45 * ramp(t, 4, 7), background: "radial-gradient(ellipse 75% 50% at 28% 30%, rgba(255,206,140,0.9) 0%, rgba(255,206,140,0) 70%), linear-gradient(150deg, rgba(0,0,0,0) 45%, rgba(4,10,24,0.6) 100%)" }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 44%, rgba(0,0,0,0) 50%, rgba(3,5,10,0.55) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1320, height: 600, background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.28) 45%, rgba(0,0,0,.45) 100%)" }} />
    <Paper />
    <Grain />
    {withText ? <Kicker t={t} /> : null}
    {withText ? CALLOUTS.map((c, i) => <CalloutView key={i} c={c} t={t} fps={fps} />) : null}
    {withText ? <Karaoke t={t} /> : null}
  </>
);

export const Historymap: React.FC<{ cover?: boolean }> = ({ cover }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = cover ? 3.6 : frame / fps;
  return (
    <AbsoluteFill style={{ background: C.navy, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0", overflow: "hidden" }}>
        {/* G13 2026-11-23: global handheld sway (X ±30 px, Y 0..-16 px, origin at caption line so captions stay above the 380 px UI zone) lifts medianSpeed past 0.04 and removes parked holds; scale 1.06 hides the edges */}
        <div style={{ position: "absolute", inset: 0, transform: cover ? undefined : `translate(${Math.sin(t * 0.9) * 30}px,${-(1 + Math.sin(t * 0.37 + 1)) * 8}px) scale(1.06)`, transformOrigin: "540px 1500px" }}>
          <Stage t={t} fps={fps} withText={!cover} />
        </div>
        {cover ? <CoverText /> : null}
      </div>
      {cover ? null : <AudiraOutro seconds={OUTRO_SECONDS} code="FAKTADUNIA" />}
      {cover ? null : <AudiraSignature seed="sealand-ep03" code="FAKTADUNIA" outroSeconds={OUTRO_SECONDS} />}
    </AbsoluteFill>
  );
};

const CoverText: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 60, top: 280, fontFamily: "Jakarta", fontSize: 38, letterSpacing: 3, color: "#FF6A6E", background: "rgba(14,18,26,.8)", padding: "6px 16px", whiteSpace: "nowrap" }}>
      ● <span style={{ color: C.cream }}>LAUT UTARA // 51°53'N 1°28'E</span>
    </div>
    <div style={{ position: "absolute", left: 540, top: 500, transform: "translate(-50%,-50%)", background: PLATE, borderLeft: `12px solid ${C.red}`, padding: "14px 40px 18px", color: C.cream, whiteSpace: "nowrap" }}>
      <div style={{ fontFamily: "Anton", fontSize: 132, lineHeight: 1.02 }}>400 m²</div>
      <div style={{ fontFamily: "Jakarta", fontSize: 38, color: "#FF6A6E", letterSpacing: 2 }}>LUAS SELURUH NEGARA</div>
    </div>
    <div style={{ position: "absolute", left: 60, right: 60, top: 1300, background: PLATE, borderLeft: `12px solid ${C.red}`, padding: "26px 36px 30px", textShadow: TXT_SHADOW }}>
      <div style={{ fontFamily: "Jakarta", fontSize: 32, color: C.goldHi, letterSpacing: 6 }}>NEGARA DI ATAS BENTENG LAUT</div>
      <div style={{ fontFamily: "Anton", fontSize: 150, color: C.cream, lineHeight: 1.02, marginTop: 6 }}>SEALAND</div>
      <div style={{ fontFamily: "Jakarta", fontSize: 40, color: "#E6DCC6", marginTop: 8 }}>punya pangeran · tak diakui siapa pun</div>
    </div>
  </>
);

export const HistorymapCover: React.FC = () => <Historymap cover />;
