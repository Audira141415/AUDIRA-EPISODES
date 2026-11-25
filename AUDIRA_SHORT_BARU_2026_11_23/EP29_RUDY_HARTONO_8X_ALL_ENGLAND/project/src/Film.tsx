// EP29 Rudy Hartono — 8x All England. CHRONICLE 2D, multi-scene director on the VO clock (film t = VO t + OFF).
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Figure, Pose } from "./lib/fig";
import { Finish, Fog, MOODS, Mood, Sky, Skyline, W, H } from "./lib/set";
import { BrandPlate, C, Card, Counter, DateStamp, Medal, NameTag, useFonts, useIn } from "./lib/hud";
import { Court, Hall, Shuttle, Trophy } from "./lib/badminton";
import { AudiraOutro } from "./brand/AudiraOutro";
import { AudiraSignature } from "./brand/AudiraSignature";
import words from "../public/audio/vo-words.json";

export const OFF = 0.3;
export const FILM_SEC = 83.3;
const EO = Easing.bezier(0.33, 0, 0.2, 1);

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};
const lerp = (t: number, a: number, b: number, v0: number, v1: number) =>
  interpolate(t, [a, b], [v0, v1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

type Cam = { s?: [number, number]; x?: [number, number]; y?: [number, number] };
const Shot: React.FC<{ a: number; b: number; cam?: Cam; hud?: React.ReactNode; children: React.ReactNode }> = ({ a, b, cam = {}, hud, children }) => {
  const t = useT();
  if (t < a || t >= b + 0.25) return null;
  const op = lerp(t, a, a + 0.25, 0, 1);
  const s = cam.s ?? [1, 1.08], x = cam.x ?? [0, 0], y = cam.y ?? [0, 0];
  // camera never parks: near-linear ramp (amplified) + slow continuous sway
  const k = (v: [number, number]) => interpolate(t, [a, b + 0.25], [v[0], v[1]], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.2, 0, 0.8, 1) });
  const sc = 1 + (k(s) - 1) * 1.5;
  const cx = k(x) * 1.6 + 26 * Math.sin(t * 0.9 + a), cy = k(y) * 1.6 + 18 * Math.sin(t * 0.7 + a * 1.3);
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <AbsoluteFill style={{ transform: `translate(${cx}px,${cy}px) scale(${Math.max(sc, 1.04 + 2.2 * Math.max(Math.abs(cx) / W, Math.abs(cy) / H))})`, transformOrigin: "50% 55%" }}>{children}</AbsoluteFill>
      {hud}
    </AbsoluteFill>
  );
};

const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, ...style }}>{children}</svg>
);

// Directional light: god-ray beams from the roof lamps, screen-blended.
const Rays: React.FC<{ xs?: number[]; color?: string; o?: number }> = ({ xs = [160, 380, 700, 920], color = "#FFE6B0", o = 0.16 }) => {
  const t = useT();
  return (
    <Svg style={{ mixBlendMode: "screen" }}>
      <defs>
        <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.9" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {xs.map((x, i) => {
        const sw = Math.sin(t * 0.4 + i * 1.7) * 30;
        return <path key={i} d={`M${x - 14},232 L${x + 14},232 L${x + 150 + sw},1350 L${x - 120 + sw},1350 Z`} fill="url(#ray)" opacity={o * (0.8 + 0.2 * Math.sin(t * 1.3 + i))} />;
      })}
      {/* dust motes drifting inside the beams: gives the light a volume */}
      {xs.flatMap((x, i) => Array.from({ length: 14 }).map((_, j) => {
        const k = i * 14 + j, u = ((k * 0.618) % 1), yy = 300 + ((u * 1000 + t * (18 + (k % 5) * 6)) % 1000);
        const spread = 30 + (yy - 232) * 0.12;
        return <circle key={`d${k}`} cx={x + 15 + Math.sin(k * 2.3 + t * 0.5) * spread} cy={yy} r={1.6 + (k % 3)} fill={color} opacity={o * 2.6 * (0.4 + 0.6 * Math.abs(Math.sin(k + t)))} />;
      }))}
    </Svg>
  );
};

// Film grain: breaks the flat vector fills into a printed/photographic surface.
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.22, pointerEvents: "none" }}>
      <filter id="grainF"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 24} /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width={W} height={H} filter="url(#grainF)" />
    </svg>
  );
};

// Foreground occluder: blurred heads of front-row spectators, frames the court (depth cue).
const Heads: React.FC<{ y?: number; seed?: number; dx?: number }> = ({ y = 1760, seed = 3, dx = 0 }) => {
  const xs = [-40, 90, 210, 860, 980, 1110].map((x, i) => x + ((seed * 37 + i * 53) % 40) + dx);
  return (
    <Svg style={{ filter: "blur(10px)" }}>
      {xs.map((x, i) => (
        <g key={i} fill="#020306">
          <circle cx={x} cy={y - 40 + (i % 2) * 30} r={70} />
          <rect x={x - 110} y={y + 10 + (i % 2) * 30} width={220} height={260} rx={90} />
        </g>
      ))}
    </Svg>
  );
};

// Rally: shuttle flies between two hitters; returns shuttle + each hitter's pose/phase.
type Hit = { pose: Pose; phase: number };
function rally(t: number, t0: number, P: number, xL: number, xR: number, yHit: number, arc: number) {
  const q = Math.max(0, (t - t0) / P);
  const n = Math.floor(q), u = q - n;
  const fromL = n % 2 === 0;
  const xa = fromL ? xL : xR, xb = fromL ? xR : xL;
  const x = xa + (xb - xa) * u;
  const y = yHit - Math.sin(u * Math.PI) * arc + u * 40;
  const dir = (Math.atan2(arc * Math.PI * Math.cos(u * Math.PI) * -1 + 40, xb - xa) * 180) / Math.PI;
  const trail: [number, number][] = [0.18, 0.12, 0.06].map((d) => {
    const uu = Math.max(0, u - d);
    return [xa + (xb - xa) * uu, yHit - Math.sin(uu * Math.PI) * arc + uu * 40];
  });
  trail.push([x, y]);
  const hit = (mine: boolean): Hit => {
    if (mine && u < 0.3) return { pose: "smash", phase: 0.5 + u / 0.6 };
    if (!mine && u > 0.6) return { pose: "smash", phase: (u - 0.6) / 0.8 };
    return { pose: "ready", phase: t * 0.8 };
  };
  return { x, y, dir, trail, L: hit(fromL), R: hit(!fromL) };
}

const Stamp: React.FC<{ at: number; x: number; y: number; text: string; color?: string; size?: number; rot?: number }> = ({ at, x, y, text, color = C.red, size = 110, rot = -8 }) => {
  const t = useT();
  if (t < at) return null;
  const p = lerp(t, at, at + 0.18, 1.6, 1);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${p})`, fontFamily: "Anton", fontSize: size, color, border: `8px solid ${color}`, padding: "0 26px", lineHeight: 1.15, background: "rgba(11,12,16,.45)", whiteSpace: "nowrap" }}>{text}</div>
  );
};

const BigTitle: React.FC<{ at: number; top: number; text: string; size?: number; color?: string; sub?: string; subAt?: number }> = ({ at, top, text, size = 200, color = C.gold, sub, subAt }) => {
  const a = useIn(at, 0.4);
  const b = useIn(subAt ?? at, 0.4);
  return (
    <div style={{ position: "absolute", top, width: W, textAlign: "center", opacity: a, transform: `scale(${1.25 - 0.25 * a})` }}>
      <div style={{ fontFamily: "Anton", fontSize: size, lineHeight: 0.95, color, textShadow: "0 10px 50px rgba(0,0,0,.65)" }}>{text}</div>
      {sub ? <div style={{ fontFamily: "Anton", fontSize: size * 0.45, color: C.cream, opacity: b, textShadow: "0 6px 30px rgba(0,0,0,.7)" }}>{sub}</div> : null}
    </div>
  );
};

// Row of trophies that light up one by one (lit times in film seconds).
const TrophyRow: React.FC<{ y: number; at: number[]; labels?: string[]; s?: number; x0?: number; dx?: number; n?: number; broken?: number }> = ({ y, at, labels, s = 0.62, x0 = 120, dx = 120, n = 8, broken }) => {
  const t = useT();
  return (
    <Svg>
      {Array.from({ length: n }).map((_, i) => {
        const lit = at[i] === undefined ? 0 : clamp01((t - at[i]) / 0.25);
        const pop = at[i] !== undefined && t >= at[i] ? 1 + 0.25 * Math.max(0, 1 - (t - at[i]) / 0.3) : 1;
        return (
          <g key={i} transform={`translate(${x0 + i * dx},${y}) scale(${pop}) translate(${-(x0 + i * dx)},${-y})`}>
            <Trophy x={x0 + i * dx} y={y} s={s} lit={lit} label={labels?.[i]} />
          </g>
        );
      })}
      {broken !== undefined ? (
        <g opacity={clamp01((t - (at[broken - 1] ?? 0)) / 0.3)}>
          <line x1={x0 + broken * dx - 55} y1={y - 110} x2={x0 + broken * dx + 55} y2={y + 10} stroke={C.red} strokeWidth={12} strokeLinecap="round" />
          <line x1={x0 + broken * dx + 55} y1={y - 110} x2={x0 + broken * dx - 55} y2={y + 10} stroke={C.red} strokeWidth={12} strokeLinecap="round" />
        </g>
      ) : null}
    </Svg>
  );
};

// Karaoke: phrase groups from the VO words; active word gold, others cream ≥ 0.75.
type Wd = { text: string; start: number; end: number };
const GROUPS: Wd[][] = (() => {
  const out: Wd[][] = [];
  let g: Wd[] = [];
  (words as Wd[]).forEach((w, i, arr) => {
    g.push(w);
    const nx = arr[i + 1];
    if (!nx || /[.:,]$/.test(w.text) || g.length >= 4 || nx.start - w.end > 0.25) { out.push(g); g = []; }
  });
  return out;
})();
const Karaoke: React.FC = () => {
  const t = useT() - OFF;
  const g = GROUPS.find((gr, i) => t >= gr[0].start - 0.05 && t < (GROUPS[i + 1]?.[0].start ?? gr[gr.length - 1].end + 0.6) - 0.05 && t < gr[gr.length - 1].end + 0.6);
  if (!g) return null;
  return (
    <div style={{ position: "absolute", top: 1438, left: 40, width: W - 80, textAlign: "center" }}>
      <span style={{ display: "inline-block", background: "rgba(11,12,16,.72)", padding: "10px 26px", borderRadius: 12 }}>
        {g.map((w, i) => {
          const on = t >= w.start && t < w.end + 0.05;
          const done = t >= w.end;
          return (
            <span key={i} style={{ display: "inline-block", margin: "0 0.2em", fontFamily: "Jakarta", fontSize: 58, color: on ? C.gold : C.cream, opacity: on || done ? 1 : 0.75, transform: `scale(${on ? 1.04 : 1})` }}>{w.text}</span>
          );
        })}
      </span>
    </div>
  );
};

const Tint: React.FC<{ color: string; o: number }> = ({ color, o }) => <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: "multiply" }} />;

// A full badminton match set: hall + court + rally between gold (left) and opponent (right).
const Match: React.FC<{ t0: number; P?: number; opp?: string; seed?: number; spotX?: number; brand?: boolean; oppOpacity?: number }> = ({ t0, P = 1.1, opp = C.blue, seed = 29, spotX = 540, brand = true, oppOpacity = 0.9 }) => {
  const t = useT();
  const r = rally(t, t0, P, 300, 790, 1010, 200);
  return (
    <>
      <Hall floorY={1150} spotX={spotX} tiers={[700, 1140]} seed={seed} />
      <Rays />
      <Fog color="#22304A" y={1060} h={220} opacity={0.45} />
      <Svg>
        <Court yN={1470} yF={1190} cx={540} half={560} netH={300} />
        <Figure x={250} y={1400} h={400} pose={r.L.pose} phase={r.L.phase} contour={C.gold} glow={1.3} racket={0} />
        <Figure x={840} y={1380} h={380} pose={r.R.pose} phase={r.R.phase} contour={opp} glow={0.8} facing={-1} racket={0} opacity={oppOpacity} />
        <Shuttle x={r.x} y={r.y} dir={r.dir} trail={r.trail} s={1.05} />
      </Svg>
      {brand ? <BrandPlate x={60} y={860} scale={0.8} /> : null}
    </>
  );
};

export const Film: React.FC = () => {
  useFonts();
  const t = useT();
  const v = (x: number) => x + OFF; // VO second -> film second
  const dusk: Mood = MOODS.dusk;

  return (
    <AbsoluteFill style={{ background: "#05070D" }}>
      {/* S1a Hook: gold jump smash, "8×", eight cups light up */}
      <Shot a={0} b={v(4.2)} cam={{ s: [1.18, 1.0] }} hud={<>
        <BigTitle at={0.1} top={210} text="8× JUARA" size={210} sub="ALL ENGLAND" />
        <TrophyRow y={780} at={[0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25].map((x) => v(x))} />
        <Stamp at={v(3.0)} x={540} y={980} text="7 BERUNTUN" color={C.gold} size={90} rot={-6} />
      </>}>
        <Hall floorY={1150} spotX={640} tiers={[700, 1140]} />
        <Rays />
        <Fog color="#22304A" y={1060} h={220} opacity={0.45} />
        <Svg>
          <Court yN={1470} yF={1190} cx={540} half={560} netH={300} />
          <Figure x={250} y={1420} h={300} pose="ready" phase={t} contour={C.dim} glow={0.4} opacity={0.7} racket={-20} />
          <Figure x={700} y={1400 - Math.sin(clamp01(t / 1.4) * Math.PI) * 120} h={460} pose="smash" phase={clamp01(t / 1.6)} contour={C.gold} glow={1.4} facing={-1} racket={0} />
          {t > 0.8 ? <Shuttle x={lerp(t, 0.8, 2.0, 640, 260)} y={lerp(t, 0.8, 2.0, 1060, 1380)} dir={140} s={1.2} trail={[[640, 1060], [lerp(t, 0.8, 2.0, 640, 260) + 80, lerp(t, 0.8, 2.0, 1060, 1380) - 60]]} /> : null}
        </Svg>
        <BrandPlate x={60} y={860} scale={0.8} />
        <Heads />
      </Shot>

      {/* S1b Name: Rudy Hartono, rally in the lit hall */}
      <Shot a={v(4.2)} b={v(8.6)} cam={{ s: [1.0, 1.1], x: [30, -30] }} hud={<>
        <NameTag at={v(5.3)} x={70} y={300} name="RUDY HARTONO" sub="INDONESIA · TUNGGAL PUTRA" />
        <Card at={v(6.6)} top={520} title="AUDIRA SPORT FACTS" lines={["Kisah juara, fakta bersumber."]} width={700} />
      </>}>
        <Match t0={v(4.2)} />
        <Heads dx={-30} />
      </Shot>

      {/* S2 Surabaya 1949: father trains the boy at dusk */}
      <Shot a={v(8.6)} b={v(15.0)} cam={{ s: [1.05, 1.12], x: [40, -40] }} hud={<>
        <DateStamp at={v(8.8)} top={230} small="SURABAYA" big="18 AGUSTUS 1949" />
        <NameTag at={v(12.0)} x={70} y={560} name="NIO HAP LIANG" sub="NAMA LAHIR" />
        <Card at={v(13.4)} top={760} title="DILATIH AYAH SEJAK KECIL" width={720} />
      </>}>
        <AbsoluteFill style={{ background: dusk.top }} />
        <Sky mood={dusk} sunX={760} sunY={980} sunR={240} />
        <Skyline y={1160} seed={7} layer={0.4} ink="#1A1420" />
        <Skyline y={1230} seed={12} layer={0.5} windows="#F5C46A" />
        <Fog color={dusk.fog} y={1180} h={240} opacity={0.5} />
        <Svg>
          <rect x={0} y={1230} width={W} height={690} fill="#2A1C14" />
          <line x1={540} y1={1230} x2={540} y2={1430} stroke="#C9B48A" strokeWidth={5} opacity={0.6} />
          <line x1={540} y1={1250} x2={540} y2={1330} stroke="#C9B48A" strokeWidth={30} opacity={0.18} />
          {(() => {
            const r = rally(t, v(8.6), 1.3, 330, 760, 1120, 160);
            return (
              <>
                <Figure x={300} y={1410} h={250} pose={r.L.pose} phase={r.L.phase} contour={C.gold} glow={1.3} racket={0} />
                <Figure x={790} y={1410} h={420} pose={r.R.pose} phase={r.R.phase} contour={C.dim} glow={0.6} facing={-1} racket={0} />
                <Shuttle x={r.x} y={r.y} dir={r.dir} trail={r.trail} s={0.9} />
              </>
            );
          })()}
        </Svg>
      </Shot>

      {/* S3 All England since 1899: empty misty hall, unofficial world championship */}
      <Shot a={v(15.0)} b={v(21.3)} cam={{ s: [1.12, 1.0], y: [-20, 20] }} hud={<>
        <DateStamp at={v(15.2)} top={230} small="ALL ENGLAND" big="SEJAK 1899" />
        <Card at={v(19.3)} top={540} title="KEJUARAAN DUNIA TIDAK RESMI" lines={["Sampai Kejuaraan Dunia resmi", "pertama digelar tahun 1977."]} />
      </>}>
        <Hall floorY={1150} spotX={540} tiers={[700, 1140]} seed={41} spot={0.7} />
        <Rays o={0.22} />
        <Fog color="#2A3550" y={900} h={600} opacity={0.6} />
        <Svg>
          <Court yN={1470} yF={1190} cx={540} half={560} netH={300} />
          <g transform={`translate(${lerp(t, v(15), v(21.3), 0, 0)},0)`}>
            <Trophy x={540} y={1300} s={1.6 + 0.15 * Math.sin(t)} lit={lerp(t, v(16.2), v(17.4), 0.2, 1)} />
          </g>
        </Svg>
        <Fog color="#2A3550" y={1300} h={300} opacity={0.5} />
        <Heads seed={9} />
      </Shot>

      {/* S4a London 1968: 18-year-old reaches the final */}
      <Shot a={v(21.3)} b={v(27.8)} cam={{ s: [1.0, 1.1], x: [-40, 40] }} hud={<>
        <DateStamp at={v(21.5)} out={v(25.6)} top={230} small="LONDON" big="ALL ENGLAND 1968" />
        <Counter at={v(25.9)} to={18} suffix=" TAHUN" label="USIA RUDY DI FINAL" top={240} size={190} roll={0.5} />
      </>}>
        <Match t0={v(21.3)} P={1.0} seed={53} />
        <Tint color="#9FB4D8" o={0.12} />
        <Heads seed={5} />
      </Shot>

      {/* S4b Beats Tan Aik Huang: youngest champion */}
      <Shot a={v(27.8)} b={v(33.7)} cam={{ s: [1.05, 1.15] }} hud={<>
        <NameTag at={v(28.6)} x={1010} y={300} name="TAN AIK HUANG" sub="MALAYSIA" color={C.blue} align="right" />
        <Stamp at={v(31.8)} x={470} y={520} text="JUARA TERMUDA" color={C.gold} size={100} />
        <TrophyRow y={700} at={[v(30.9)]} n={1} x0={540} s={1.1} />
      </>}>
        <Hall floorY={1150} spotX={330} tiers={[700, 1140]} seed={53} />
        <Rays />
        <Fog color="#22304A" y={1060} h={220} opacity={0.45} />
        <Svg>
          <Court yN={1470} yF={1190} cx={540} half={560} netH={300} />
          <Figure x={330} y={1400 - Math.sin(clamp01((t - v(28)) / 1.2) * Math.PI) * 150} h={430} pose={t < v(30.6) ? "smash" : "armsUp"} phase={clamp01((t - v(28)) / 1.4)} contour={C.gold} glow={1.4} racket={0} />
          <Figure x={820} y={1390} h={380} pose={t < v(29.2) ? "lunge" : "stand"} contour={C.blue} glow={0.7} facing={-1} racket={-10} opacity={0.85} />
          {t > v(28.5) && t < v(29.6) ? <Shuttle x={lerp(t, v(28.5), v(29.3), 420, 900)} y={lerp(t, v(28.5), v(29.3), 1020, 1440)} dir={40} s={1.2} trail={[[420, 1020], [lerp(t, v(28.5), v(29.3), 420, 900) - 70, lerp(t, v(28.5), v(29.3), 1020, 1440) - 60]]} /> : null}
        </Svg>
        <BrandPlate x={620} y={1160} scale={0.75} />
        <Heads seed={2} />
      </Shot>

      {/* S5 Streak 1968–1974: seven cups light one by one */}
      <Shot a={v(33.7)} b={v(42.4)} cam={{ s: [1.0, 1.14], y: [20, -20] }} hud={<>
        <DateStamp at={v(33.9)} out={v(40.2)} top={230} small="ALL ENGLAND" big="1968 – 1974" />
        <Counter at={v(40.4)} to={7} suffix=" BERUNTUN" label="TANPA PUTUS" top={240} size={170} roll={0.4} />
      </>}>
        {/* Trophy cabinet: dark wood, glass with reflections, seven cups on two shelves */}
        <AbsoluteFill style={{ background: "linear-gradient(180deg,#1C120B 0%,#2E1D10 45%,#120A06 100%)" }} />
        <Svg>
          <defs>
            <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6B4321" /><stop offset="1" stopColor="#2A170A" /></linearGradient>
            <radialGradient id="cabGlow" cx="0.5" cy="0.2" r="0.7"><stop offset="0" stopColor="#FFD58A" stopOpacity="0.35" /><stop offset="1" stopColor="#FFD58A" stopOpacity="0" /></radialGradient>
          </defs>
          {Array.from({ length: 18 }).map((_, i) => <line key={i} x1={0} y1={480 + i * 70} x2={W} y2={470 + i * 70 + (i % 3) * 6} stroke="#0E0804" strokeWidth={2} opacity={0.35} />)}
          <rect x={70} y={560} width={940} height={980} fill="url(#cabGlow)" stroke="#8A5A2B" strokeWidth={14} />
          <rect x={70} y={940} width={940} height={26} fill="url(#wood)" />
          <rect x={70} y={1330} width={940} height={26} fill="url(#wood)" />
        </Svg>
        <TrophyRow y={900} at={[v(33.8), v(35.1), v(36.2), v(36.9)]} labels={["68", "69", "70", "71"]} n={4} x0={200} dx={227} s={0.95} />
        <TrophyRow y={1290} at={[v(37.5), v(38.1), v(38.9)]} labels={["72", "73", "74"]} n={3} x0={300} dx={240} s={0.95} />
        <Svg style={{ mixBlendMode: "screen" }}>
          {[0, 1, 2].map((i) => { const x = 120 + i * 330 + ((t * 40) % 200); return <path key={i} d={`M${x},560 L${x + 60},560 L${x - 160},1540 L${x - 220},1540 Z`} fill="#FFFFFF" opacity={0.07 - i * 0.015} />; })}
        </Svg>
        <Rays xs={[300, 780]} o={0.12} />
        <Heads seed={7} />
      </Shot>

      {/* S6 1975: the chain breaks — Svend Pri */}
      <Shot a={v(42.4)} b={v(50.6)} cam={{ s: [1.12, 1.0], x: [0, 20] }} hud={<>
        <DateStamp at={v(42.6)} out={v(45.6)} top={230} small="FINAL" big="1975" color={C.red} />
        <TrophyRow y={530} at={[0, 0, 0, 0, 0, 0, 0, v(44.3)]} n={8} x0={120} dx={120} s={0.45} broken={7} />
        <Stamp at={v(44.4)} x={540} y={640} text="RANTAI PATAH" size={96} />
        <NameTag at={v(46.6)} x={1010} y={300} name="SVEND PRI" sub="DENMARK" color={C.red} align="right" />
        <Card at={v(47.9)} top={730} title="SKOR FINAL" lines={["11–15  ·  14–17"]} color={C.red} width={640} />
      </>}>
        <Hall floorY={1150} spotX={800} tiers={[700, 1140]} seed={71} spot={0.8} />
        <Rays xs={[700, 920]} color="#BFD6FF" o={0.2} />
        <Fog color="#1A2238" y={1000} h={300} opacity={0.55} />
        <Svg>
          <Court yN={1470} yF={1190} cx={540} half={560} netH={300} />
          <Figure x={280} y={1410} h={400} pose={t < v(45.2) ? "ready" : "crouch"} phase={t} contour={C.gold} glow={0.6} racket={-30} opacity={0.9} />
          <Figure x={810} y={1400} h={420} pose="armsUp" contour={C.red} glow={1.2} facing={-1} racket={0} />
        </Svg>
        <Tint color="#6F86B8" o={0.28} />
        <Heads seed={4} />
      </Shot>

      {/* S7a 1976: comeback smash, eighth title */}
      <Shot a={v(50.6)} b={v(55.2)} cam={{ s: [1.15, 1.0], x: [40, -20] }} hud={<>
        <DateStamp at={v(50.8)} out={v(53.6)} top={230} small="ALL ENGLAND" big="1976" />
        <TrophyRow y={620} at={[0, 0, 0, 0, 0, 0, 0, v(54.1)]} n={8} x0={120} dx={120} s={0.55} />
        <BigTitle at={v(54.2)} top={330} text="GELAR KE-8" size={170} />
      </>}>
        <Hall floorY={1150} spotX={360} tiers={[700, 1140]} seed={83} />
        <Rays />
        <Fog color="#22304A" y={1060} h={220} opacity={0.45} />
        <Svg>
          <Court yN={1470} yF={1190} cx={540} half={560} netH={300} />
          {(() => {
            const p = clamp01((t - v(51.6)) / 1.6);
            const ghost = [0.12, 0.24, 0.36];
            return (
              <>
                {ghost.map((d, i) => <Figure key={i} x={360} y={1460 - Math.sin(clamp01(p - d) * Math.PI) * 170} h={560} pose="smash" phase={clamp01(p - d)} contour={C.gold} glow={0.3} racket={0} opacity={0.18 - i * 0.04} />)}
                <Figure x={360} y={1460 - Math.sin(p * Math.PI) * 170} h={560} pose={t < v(54.0) ? "smash" : "armsUp"} phase={p} contour={C.gold} glow={1.5} racket={0} />
                {p > 0.45 && p < 0.95 ? <Shuttle x={lerp(p, 0.45, 0.9, 460, 960)} y={lerp(p, 0.45, 0.9, 1000, 1420)} dir={40} s={1.3} trail={[[460, 1000], [lerp(p, 0.45, 0.9, 460, 960) - 80, lerp(p, 0.45, 0.9, 1000, 1420) - 70]]} /> : null}
              </>
            );
          })()}
        </Svg>
        <Heads seed={8} />
      </Shot>

      {/* S7b Jakarta 1980: world champion vs Liem Swie King */}
      <Shot a={v(55.2)} b={v(62.1)} cam={{ s: [1.0, 1.1], x: [-30, 30] }} hud={<>
        <DateStamp at={v(55.4)} top={230} small="JAKARTA" big="JUARA DUNIA 1980" />
        <NameTag at={v(60.2)} x={1010} y={560} name="LIEM SWIE KING" sub="INDONESIA" color={C.blue} align="right" />
        <Card at={v(57.9)} top={760} title="FINAL KEJUARAAN DUNIA" lines={["15–9  ·  15–9"]} width={640} />
      </>}>
        <Match t0={v(55.2)} P={0.95} seed={97} spotX={420} brand={false} />
        <BrandPlate x={620} y={1160} scale={0.75} text="AUDIRA · JAKARTA 1980" />
        <Tint color="#FF9A6A" o={0.22} />
        <Heads seed={6} />
      </Shot>

      {/* S8 Thomas Cup x4 + Hall of Fame 1997 */}
      <Shot a={v(62.1)} b={v(70.4)} cam={{ s: [1.0, 1.12], y: [30, -10] }} hud={<>
        <Card at={v(62.4)} out={v(65.8)} top={230} title="PIALA THOMAS · TIM INDONESIA" lines={["Juara 4 kali bersama Rudy"]} width={820} />
        <TrophyRow y={560} at={[v(64.3), v(64.6), v(64.9), v(65.2)]} labels={["1970", "1973", "1976", "1979"]} n={4} x0={240} dx={200} s={0.8} />
        <Medal x={540} y={1010} r={110} at={v(66.1)} n="1997" />
        <Card at={v(68.2)} top={1110} title="HALL OF FAME" lines={["IBF (kini BWF), angkatan pertama"]} width={620} />
      </>}>
        <Hall floorY={1200} spotX={540} tiers={[720, 1190]} seed={19} />
        <Rays o={0.2} />
        <Fog color="#22304A" y={1100} h={240} opacity={0.5} />
        <Svg>
          <rect x={150} y={1290} width={780} height={60} fill="#1A120C" stroke={C.gold} strokeWidth={3} />
          {[260, 400, 540, 680, 820].map((x, i) => (
            <Figure key={x} x={x} y={1290} h={i === 2 ? 330 : 280} pose={t > v(64.2) ? "armsUp" : "stand"} contour={i === 2 ? C.gold : C.dim} glow={i === 2 ? 1.4 : 0.5} opacity={i === 2 ? 1 : 0.8} />
          ))}
        </Svg>
        <Tint color="#B9A0E8" o={0.18} />
        <Heads seed={1} />
      </Shot>

      {/* S9 Payoff: 8 titles, one name — the men's singles record still stands */}
      <Shot a={v(70.4)} b={FILM_SEC - 3} cam={{ s: [1.14, 1.0] }} hud={<>
        <BigTitle at={v(70.6)} top={220} text="8 GELAR" size={200} sub="1 NAMA" subAt={v(71.7)} />
        <Card at={v(74.2)} top={560} title="REKOR TUNGGAL PUTRA" lines={["All England · milik Rudy Hartono"]} width={860} />
      </>}>
        <Hall floorY={1150} spotX={540} tiers={[700, 1140]} seed={11} />
        <AbsoluteFill style={{ opacity: 0.8 }}><TrophyRow y={1000} at={[0, 0, 0, 0, 0, 0, 0, 0]} n={8} x0={120} dx={120} s={0.5} /></AbsoluteFill>
        <Rays o={0.24} />
        <Fog color="#3A2A18" y={1060} h={260} opacity={0.5} />
        <Svg>
          <Court yN={1470} yF={1190} cx={540} half={560} netH={300} net={false} />
          <Figure x={540} y={1400} h={390} pose={t > v(71.7) ? "armsUp" : "stand"} contour={C.gold} glow={1.6} racket={0} />
        </Svg>
        <BrandPlate x={60} y={860} scale={0.8} />
        <Tint color="#FFC27A" o={0.1} />
        <Heads seed={3} />
      </Shot>

      <Finish />
      <Grain />
      {t < FILM_SEC - 3 ? <Karaoke /> : null}
      <AudiraOutro code="SPORTFACTS" />
      <AudiraSignature seed="rudy-hartono-8x-all-england" handle="@AudiraSportFacts" />
    </AbsoluteFill>
  );
};
