// EP27 Nadia Comăneci — nilai 10 tampil "1.00" (Montréal 1976). CHRONICLE 2D, multi-scene director on the VO clock (OFF = 0).
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Figure } from "./lib/fig";
import { Finish, W, H } from "./lib/set";
import { BrandPlate, C, Card, Counter, DateStamp, NameTag, useFonts, useIn, useOut, usePop } from "./lib/hud";
import { Arena, BARS, BarGymnast, Beam, Digit, Gymnast, JudgeCard, Scoreboard, UnevenBars } from "./lib/gym";
import { AudiraOutro } from "./brand/AudiraOutro";
import { AudiraSignature } from "./brand/AudiraSignature";
import words from "../public/audio/vo-words.json";

export const OFF = 0;
export const FILM_SEC = 82;
export const FLASHES = [5.84, 47.9];
const M = (top: string, mid: string, low: string, fog: string) => ({ top, mid, low, sun: "#FFE6B0", fog });
const LOOK = {
  navy: { mood: M("#060A1A", "#13235A", "#2B3F8C", "#22356E"), light: "#FFC860", floor: "#1F4E9A" },
  crimson: { mood: M("#12040A", "#4A0F1E", "#8C2430", "#6A1A26"), light: "#FFB43C", floor: "#6A1A22" },
  warm: { mood: M("#140A06", "#4A2410", "#A0521E", "#7A3E1C"), light: "#FFD58A", floor: "#8C4A1E" },
  teal: { mood: M("#04121A", "#0E3E4E", "#1E7A86", "#16606A"), light: "#CFF6FF", floor: "#1E8C9A" },
  red: { mood: M("#1A0606", "#6A1410", "#C0381E", "#8A2414"), light: "#FFC040", floor: "#7A1E14" },
  gold: { mood: M("#1A1006", "#6A4210", "#D08A2A", "#A86A20"), light: "#FFE6A0", floor: "#A06A1E" },
  purple: { mood: M("#0E0618", "#3A1A5A", "#6E3A9A", "#4E2A7A"), light: "#FFD8A0", floor: "#4A2A7A" },
  cold: { mood: M("#05070D", "#1A2230", "#3A4658", "#2E3A4A"), light: "#D6DEE8", floor: "#2E3A4A" },
  orange: { mood: M("#160806", "#5A1E0E", "#D0602A", "#A04A22"), light: "#FFD08A", floor: "#B04A22" },
};
const FEET = 1400; // figures stand above the karaoke band and the 380 px bottom zone
const EO = Easing.bezier(0.33, 0, 0.2, 1);

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};
const lerp = (t: number, a: number, b: number, v0: number, v1: number, ease = EO) =>
  interpolate(t, [a, b], [v0, v1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

// One shot: crossfades in over 0.25 s, keeps drawing 0.25 s past its end; camera moves the world, not the HUD.
type Cam = { s?: [number, number]; x?: [number, number]; y?: [number, number]; o?: string; d?: number };
const Shot: React.FC<{ a: number; b: number; cam?: Cam; hud?: React.ReactNode; children: React.ReactNode }> = ({ a, b, cam = {}, hud, children }) => {
  const t = useT();
  if (t < a || t >= b + 0.25) return null;
  const op = lerp(t, a, a + 0.25, 0, 1);
  const s = cam.s ?? [1, 1.08], x = cam.x ?? [0, 0], y = cam.y ?? [0, 0], d = cam.d ?? 1;
  const k = (v: [number, number]) => lerp(t, a, b + 0.25, v[0], v[1], Easing.linear);
  // handheld-style drift on top of the travel keeps the frame moving (G13: no parked holds)
  const px = k(x) + 34 * d * Math.sin(1.25 * t + a), py = k(y) + 22 * d * Math.sin(0.9 * t + 1.7 * a);
  const sc = k(s) * (1 + 0.025 * d * Math.sin(0.7 * t + a));
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <AbsoluteFill style={{ transform: `translate(${px}px,${py}px) scale(${Math.max(sc, 1.03 + 2.2 * Math.max(Math.abs(px) / W, Math.abs(py) / H))})`, transformOrigin: cam.o ?? "50% 50%" }}>{children}</AbsoluteFill>
      {hud}
    </AbsoluteFill>
  );
};

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>{children}</svg>
);

// Big kinetic title (HUD).
const BigTitle: React.FC<{ at: number; out?: number; top?: number; text: string; sub?: string; size?: number; color?: string }> = ({ at, out = 99, top = 220, text, sub, size = 130, color = C.gold }) => {
  const a = useIn(at, 0.35) * useOut(out);
  const p = usePop(at);
  return (
    <div style={{ position: "absolute", top, left: 0, width: W, textAlign: "center", opacity: a }}>
      <div style={{ fontFamily: "Anton", fontSize: size, lineHeight: 1.02, color, transform: `scale(${0.85 + 0.15 * p})`, textShadow: "0 8px 40px rgba(0,0,0,.7)" }}>{text}</div>
      {sub ? <div style={{ display: "inline-block", marginTop: 12, padding: "8px 26px", background: "rgba(11,12,16,.8)", border: `2px solid ${color}`, fontFamily: "BarlowX", fontSize: 46, letterSpacing: 4, color: C.cream }}>{sub}</div> : null}
    </div>
  );
};

// Chip that pops in at a given place (HUD).
const Chip: React.FC<{ at: number; out?: number; x: number; y: number; text: string; size?: number; color?: string }> = ({ at, out = 99, x, y, text, size = 96, color = C.gold }) => {
  const a = useIn(at, 0.3) * useOut(out);
  const p = usePop(at);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: a, transform: `translate(-50%,0) scale(${0.6 + 0.4 * p})`, background: "rgba(11,12,16,.85)", border: `4px solid ${color}`, padding: "6px 26px", fontFamily: "Anton", fontSize: size, color, whiteSpace: "nowrap", boxShadow: "0 14px 40px rgba(0,0,0,.6)" }}>{text}</div>
  );
};

// Red rubber stamp (HUD).
const Stamp: React.FC<{ at: number; out?: number; top: number; text: string; size?: number; rot?: number }> = ({ at, out = 99, top, text, size = 110, rot = -8 }) => {
  const a = useIn(at, 0.15) * useOut(out);
  const p = usePop(at);
  return (
    <div style={{ position: "absolute", top, left: 0, width: W, textAlign: "center", opacity: a }}>
      <span style={{ display: "inline-block", transform: `rotate(${rot}deg) scale(${1.8 - 0.8 * p})`, border: `8px solid ${C.red}`, color: C.red, fontFamily: "Anton", fontSize: size, padding: "4px 30px", letterSpacing: 3, background: "rgba(11,12,16,.55)" }}>{text}</span>
    </div>
  );
};

// Coloured medal (gold/silver/bronze) without Olympic marks.
const MEDAL = { emas: ["#8F6420", "#F5B54A", "#6A4410"], perak: ["#6E7480", "#D9DEE6", "#3E4450"], perunggu: ["#6A3A1C", "#C9793E", "#4A2410"] } as const;
const MedalC: React.FC<{ x: number; y: number; r?: number; at: number; kind: keyof typeof MEDAL; label: string; spin?: number }> = ({ x, y, r = 80, at, kind, label, spin = 0 }) => {
  const p = usePop(at);
  const a = useIn(at, 0.25);
  const f = useCurrentFrame();
  const sx = Math.cos(f / 40 + spin) * 0.18 + 0.82;
  const [rim, face, ink] = MEDAL[kind];
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r * 2.2, width: r * 2, height: r * 3.4, opacity: a, transform: `translateY(${(1 - p) * -140}px) scale(${0.6 + 0.4 * p})` }}>
      <svg width={r * 2} height={r * 3.4} viewBox={`0 0 ${r * 2} ${r * 3.4}`}>
        <path d={`M${r * 0.45},0 L${r * 0.85},${r * 1.25} L${r * 1.15},${r * 1.25} L${r * 1.55},0 Z`} fill="#B5452E" />
        <path d={`M${r * 0.8},0 L${r},${r * 1.2} L${r * 1.2},0 Z`} fill="#1E4E8C" opacity={0.9} />
        <g transform={`translate(${r},${r * 2.2}) scale(${sx},1)`}>
          <circle r={r * 0.95} fill={rim} />
          <circle r={r * 0.88} fill={face} />
          <circle r={r * 0.7} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={0.45} />
          <text y={r * 0.26} textAnchor="middle" fontFamily="Anton" fontSize={r * 0.62} fill={ink}>76</text>
        </g>
      </svg>
      <div style={{ position: "absolute", top: r * 3.45, left: -50, width: r * 2 + 100, textAlign: "center", fontFamily: "BarlowX", fontSize: 38, color: C.cream, textShadow: "0 3px 10px #000" }}>{label}</div>
    </div>
  );
};

// Score tile "10" (HUD).
const Tile: React.FC<{ at: number; x: number; y: number; color: string; s?: number }> = ({ at, x, y, color, s = 160 }) => {
  const p = usePop(at);
  const a = useIn(at, 0.2);
  return (
    <div style={{ position: "absolute", left: x - s / 2, top: y, width: s, height: s, opacity: a, transform: `scale(${0.4 + 0.6 * p}) rotate(${(1 - p) * -14}deg)`, background: "#0B0C10", border: `5px solid ${color}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton", fontSize: s * 0.62, color, boxShadow: `0 0 26px ${color}55` }}>10</div>
  );
};

// Blueprint backdrop for the scoreboard close-ups.
const Blueprint: React.FC<{ glow?: number; ink?: string; bg?: [string, string]; label?: string }> = ({ glow = 1, label = "PAPAN SKOR RESMI · 1976 · FORMAT X.XX", ink = "#6EC8FF", bg = ["#14263F", "#060A12"] }) => {
  const t = useT();
  const lines: React.ReactNode[] = [];
  for (let i = 0; i <= 18; i++) lines.push(<line key={`v${i}`} x1={i * 60} x2={i * 60} y1={0} y2={H} stroke={ink} strokeWidth={i % 5 ? 1 : 2} opacity={0.1} />);
  for (let i = 0; i <= 32; i++) lines.push(<line key={`h${i}`} y1={i * 60} y2={i * 60} x1={0} x2={W} stroke={ink} strokeWidth={i % 5 ? 1 : 2} opacity={0.1} />);
  return (
    <Svg>
      <defs>
        <radialGradient id={`bpG${ink.slice(1)}`} cx="0.5" cy="0.45" r="0.7">
          <stop offset="0" stopColor={bg[0]} />
          <stop offset="1" stopColor={bg[1]} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#bpG${ink.slice(1)})`} />
      {lines}
      <rect x={0} y={((t * 90) % (H + 200)) - 100} width={W} height={3} fill={ink} opacity={0.18 * glow} />
      <text x={60} y={1340} fontFamily="Barlow" fontSize={34} letterSpacing={4} fill={ink} opacity={0.55}>{label}</text>
    </Svg>
  );
};

// Technician booth: control desk with lamps, window onto the arena, monitor.
const Booth: React.FC = () => {
  const t = useT();
  const knobs: React.ReactNode[] = [];
  for (let i = 0; i < 24; i++) {
    const x = 120 + (i % 12) * 72, y = 1210 + Math.floor(i / 12) * 54;
    const on = Math.sin(t * 3 + i * 1.7) > 0.2;
    knobs.push(<circle key={i} cx={x} cy={y} r={12} fill={on ? (i % 3 ? "#FFB43C" : "#D9503A") : "#2A1E10"} style={on ? { filter: "drop-shadow(0 0 6px #FFB43C)" } : undefined} />);
  }
  return (
    <Svg>
      <defs>
        <linearGradient id="booth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B0F18" />
          <stop offset="1" stopColor="#1A1410" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#booth)" />
      <rect x={80} y={300} width={920} height={500} rx={10} fill="#05070D" stroke="#3A2E20" strokeWidth={10} />
      <rect x={90} y={310} width={900} height={480} fill="#121B2E" opacity={0.9} />
      <path d="M90,620 L990,560 L990,790 L90,790 Z" fill="#1F4E7A" opacity={0.6} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <circle key={i} cx={130 + i * 100} cy={470 + (i % 2) * 18} r={22} fill="#03050A" />)}
      <g opacity={0.9}>
        <Scoreboard x={330} y={350} w={420} digits="   " header="PAPAN SKOR" name="73" nat="" num="" />
      </g>
      <rect x={0} y={1120} width={W} height={300} fill="#15110D" />
      <rect x={0} y={1120} width={W} height={10} fill="#3A2E20" />
      {knobs}
      <rect x={760} y={940} width={220} height={170} rx={8} fill="#07070A" stroke="#3A2E20" strokeWidth={6} />
      <text x={870} y={1050} textAnchor="middle" fontFamily="Anton" fontSize={84} fill="#FFB43C" opacity={0.5 + 0.5 * (Math.floor(t * 2) % 2)}>_.__</text>
    </Svg>
  );
};

// Foreground crowd standing up: dark head/shoulder silhouettes with varied size, warm rim light, camera flashes.
const Crowd: React.FC<{ t: number }> = ({ t }) => {
  const people: React.ReactNode[] = [];
  for (let i = 0; i < 15; i++) {
    const row = i % 2;
    const x = -30 + i * 80 + row * 24;
    const r = 30 + ((i * 37) % 13);
    const y = 1260 + row * 70 + ((i * 53) % 30) - 8 * Math.abs(Math.sin(t * 2.2 + i));
    const ink = ["#07070A", "#120A0C", "#0B0C14", "#160C08"][i % 4];
    people.push(
      <g key={i}>
        <ellipse cx={x} cy={y + r * 3.1} rx={r * 2.1} ry={r * 1.9} fill={ink} />
        <circle cx={x} cy={y} r={r} fill={ink} stroke="#FF8A50" strokeOpacity={0.35} strokeWidth={3} />
        {i % 3 === 0 ? <rect x={x + r * 0.6} y={y - r * 2.6} width={14} height={r * 2.2} rx={6} fill={ink} transform={`rotate(${12 * Math.sin(t * 3 + i)},${x},${y})`} /> : null}
      </g>,
    );
  }
  const flashes: React.ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    const k = Math.floor(t * 6) + i * 7;
    if (k % 5 !== 0) continue;
    const fx = ((i * 197 + k * 61) % 1000) + 40, fy = 1180 + ((i * 89 + k * 31) % 160);
    flashes.push(<circle key={i} cx={fx} cy={fy} r={14} fill="#FFFFFF" style={{ filter: "drop-shadow(0 0 22px #FFF4DC) drop-shadow(0 0 44px #FFF4DC)" }} />);
  }
  return <g>{flashes}{people}</g>;
};

const Flash: React.FC = () => {
  const t = useT();
  const v = Math.max(0, ...FLASHES.map((s) => (t >= s && t < s + 0.3 ? 0.55 * (1 - (t - s) / 0.3) : 0)));
  return v > 0 ? <AbsoluteFill style={{ background: "#FFF4DC", opacity: v }} /> : null;
};

// Karaoke: phrase groups from the VO words; active word gold, others cream ≥ 0.75.
type Wd = { text: string; start: number; end: number };
const GROUPS: Wd[][] = (() => {
  const out: Wd[][] = [];
  let g: Wd[] = [];
  (words as Wd[]).forEach((w, i, arr) => {
    g.push(w);
    const nx = arr[i + 1];
    if (!nx || /[.:,?]$/.test(w.text) || g.length >= 4 || nx.start - w.end > 0.25) { out.push(g); g = []; }
  });
  return out;
})();
const Karaoke: React.FC = () => {
  const t = useT() - OFF;
  const g = GROUPS.find((gr, i) => t >= gr[0].start - 0.05 && t < (GROUPS[i + 1]?.[0].start ?? gr[gr.length - 1].end + 0.6) - 0.05 && t < gr[gr.length - 1].end + 0.6);
  if (!g) return null;
  return (
    <div style={{ position: "absolute", top: 1440, left: 40, width: W - 80, textAlign: "center" }}>
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

// Flickering scoreboard before the reveal: seeded by time, no Math.random.
const flick = (t: number) => ["888", "   ", "8 8", "   ", "888", " 8 "][Math.floor(t * 7) % 6];

// Bar routine on the VO clock: pendulum, two giant swings, release, flight, landing at 37.76.
const SWING0 = 35.53, REL = 37.25, LAND = 37.76;
const barTheta = (t: number) =>
  t < SWING0 ? 38 * Math.sin((t - 34.9) * 4.2) : lerp(t, SWING0, REL, 38 * Math.sin((SWING0 - 34.9) * 4.2), 780, Easing.inOut(Easing.quad));

export const Film: React.FC = () => {
  useFonts();
  const t = useT();
  const hx = BARS.highX - 60, hy = BARS.highY; // high bar in the S4 frame (UnevenBars ox=-60)

  // dismount flight (S4)
  const fu = Math.min(1, Math.max(0, (t - REL) / (LAND - REL)));
  const flyX = hx + 60 + (880 - hx - 60) * fu;
  const flyY = (hy + 120) + (FEET - hy - 120) * fu - 420 * Math.sin(Math.PI * fu) * (1 - fu * 0.35);

  return (
    <AbsoluteFill style={{ background: "#05070D" }}>
      {/* S1a Hook: dark arena, giant scoreboard flickering, gymnast swinging */}
      <Shot a={0} b={5.84} cam={{ s: [1.0, 1.1], o: "50% 40%" }} hud={<>
        <BigTitle at={0.1} top={285} text="NILAI 10 PERTAMA" size={100} sub="SENAM OLIMPIADE MODERN" />
      </>}>
        <Arena floorY={1400} spotX={620} tiers={[700, 1330]}  {...LOOK.navy} />
        <Svg>
          <Scoreboard x={220} y={500} w={640} digits={flick(t)} blink={0.75 + 0.25 * Math.sin(t * 20)} />
          <UnevenBars s={0.8} ox={150} oy={280} />
          <BarGymnast x={150 + BARS.highX * 0.8} y={280 + BARS.highY * 0.8} h={210} theta={t * 140} glow={1.5} />
        </Svg>
      </Shot>

      {/* S1b Hook: crash-zoom, 1.00 lights up, red question mark, AUDIRA plate in the stands */}
      <Shot a={5.84} b={11.0} cam={{ s: [1.3, 1.12], o: "50% 40%" }} hud={<>
        <Chip at={7.42} x={400} y={1120} text="KOK BISA?" size={110} color={C.red} />
        <BigTitle at={5.9} top={190} text="10 → 1.00" size={150} />
      </>}>
        <Arena floorY={1400} spotX={540} tiers={[700, 1330]}  {...LOOK.crimson} />
        <BrandPlate x={90} y={1290} scale={0.9} />
        <Svg>
          <Scoreboard x={90} y={480} w={900} digits="100" />
          <text x={880} y={1250} textAnchor="middle" fontFamily="Anton" fontSize={260} fill={C.red} opacity={lerp(t, 7.42, 7.6, 0, 1)} style={{ filter: "drop-shadow(0 0 20px #D9503A)" }}>?</text>
        </Svg>
      </Shot>

      {/* S2a Context: Montréal, 18 July 1976; golden silhouette walks to the uneven bars */}
      <Shot a={11.0} b={15.6} cam={{ x: [60, -40], s: [1.04, 1.1] }} hud={<>
        <DateStamp at={11.15} top={200} small="MONTRÉAL" big="18 JULI 1976" />
      </>}>
        <Arena floorY={1400} spotX={560} tiers={[640, 1330]}  {...LOOK.warm} />
        <Svg>
          <UnevenBars s={0.8} ox={150} oy={280} />
          <Figure x={lerp(t, 11.0, 15.8, 140, 470, Easing.linear)} y={FEET} h={330} pose="walk" phase={t * 0.9} contour={C.gold} glow={1.3} />
        </Svg>
      </Shot>

      {/* S2b Context: 14 years, 150 cm, 39 kg, name */}
      <Shot a={15.6} b={23.4} cam={{ s: [1.0, 1.12], o: "50% 60%" }} hud={<>
        <Counter at={15.6} out={18.15} top={210} to={14} label="TAHUN · RUMANIA" size={200} roll={0.6} />
        <Chip at={18.31} out={22.15} x={300} y={260} text="150 CM" size={120} />
        <Chip at={20.53} out={22.15} x={780} y={260} text="39 KG" size={120} />
        <NameTag at={22.31} x={70} y={560} name="NADIA COMĂNECI" sub="ROMANIA · 14 TAHUN" />
      </>}>
        <Arena floorY={1400} spotX={540} tiers={[640, 1330]}  {...LOOK.warm} />
        <Svg>
          <UnevenBars s={0.8} ox={150} oy={280} />
          <Figure x={520} y={FEET} h={420} pose="stand" contour={C.gold} glow={1.4} angles={{ uaA: 10 * Math.sin(t * 2), uaB: -8 }} />
          <g opacity={lerp(t, 18.31, 18.8, 0, 1)}>
            <line x1={720} x2={720} y1={FEET} y2={FEET - 430 * lerp(t, 18.31, 19.2, 0, 1)} stroke={C.gold} strokeWidth={6} />
            {Array.from({ length: 11 }).map((_, i) => <line key={i} x1={706} x2={734} y1={FEET - i * 43} y2={FEET - i * 43} stroke={C.gold} strokeWidth={3} opacity={i * 43 <= 430 * lerp(t, 18.31, 19.2, 0, 1) ? 1 : 0} />)}
            <text x={750} y={FEET - 410} fontFamily="Anton" fontSize={56} fill={C.gold}>150</text>
          </g>
        </Svg>
      </Shot>

      {/* S3a Development: the official board has only three digits */}
      <Shot a={23.4} b={30.4} cam={{ s: [1.15, 1.0] }} hud={<>
        <BigTitle at={24.27} out={30.2} top={200} text="MASALAHNYA:" size={110} sub="PAPAN SKOR" />
        <Card at={26.27} out={30.2} top={1140} title="OMEGA" lines={["Papan skor resmi Montréal 1976", "Kapasitas: hanya 3 digit"]} width={880} />
      </>}>
        <Blueprint label="" />
        {/* board turned in 3D (perspective) so this close-up differs from the hook boards */}
        <AbsoluteFill style={{ transform: `perspective(1400px) rotateY(${-14 + 3 * Math.sin(t * 0.6)}deg) rotateX(4deg)`, transformOrigin: "50% 45%", filter: "drop-shadow(-30px 40px 40px rgba(0,0,0,.65))" }}>
          <Svg>
            <Scoreboard x={160} y={470} w={760} digits={t < 27.52 ? "   " : t < 27.82 ? "1  " : t < 28.12 ? "10 " : "100"} />
            <g opacity={lerp(t, 27.52, 27.9, 0, 1)}>
              <path d="M300,960 L300,990 L780,990 L780,960" stroke="#6EC8FF" strokeWidth={5} fill="none" />
              <text x={540} y={1045} textAnchor="middle" fontFamily="BarlowX" fontSize={52} letterSpacing={6} fill="#6EC8FF">3 DIGIT · X.XX</text>
            </g>
          </Svg>
        </AbsoluteFill>
      </Shot>

      {/* S3b Development: "10 is impossible", the 4th slot was never built */}
      <Shot a={30.4} b={34.9} cam={{ s: [1.0, 1.1] }} hud={<>
        <Stamp at={30.4} top={220} text="10 = MUSTAHIL" />
        <Chip at={33.56} x={540} y={1100} text="TIDAK PERNAH DIBUAT" size={76} color={C.red} />
      </>}>
        <Blueprint />
        <Svg>
          <Scoreboard x={130} y={480} w={820} digits="999" ghost={Math.max(0.001, lerp(t, 32.65, 33.0, 0, 1))} />
          <g opacity={lerp(t, 33.56, 33.75, 0, 1)}>
            <line x1={190} y1={680} x2={360} y2={940} stroke={C.red} strokeWidth={12} strokeLinecap="round" />
            <line x1={360} y1={680} x2={190} y2={940} stroke={C.red} strokeWidth={12} strokeLinecap="round" />
          </g>
        </Svg>
      </Shot>

      {/* S4 Explanation: swing, giant circles, release, landing, judges' 10s */}
      <Shot a={34.9} b={41.9} cam={{ s: [1.0, 1.2], x: [60, -70], y: [-30, 30], o: "50% 45%", d: 1.4 }} hud={<>
        <Chip at={35.53} out={36.2} x={540} y={230} text="BERAYUN" />
        <Chip at={36.22} out={37.7} x={540} y={230} text="BERPUTAR" />
        <Chip at={37.76} out={40.0} x={540} y={230} text="MENDARAT" />
        <BigTitle at={40.12} top={210} text="JURI: 10" size={140} />
        {[0, 1, 2, 3].map((i) => <JudgeHud key={i} at={40.12 + i * 0.12} x={150 + i * 190} />)}
      </>}>
        <Arena floorY={1400} spotX={640} tiers={[620, 1330]}  {...LOOK.teal} />
        <Svg>
          <rect x={560} y={FEET - 8} width={480} height={30} rx={6} fill="#2F5F8C" />
          <UnevenBars ox={-60} />
          {t < REL ? <BarGymnast x={hx} y={hy} h={230} theta={barTheta(t)} glow={1.5} /> : null}
          {t >= REL && t < LAND ? <Gymnast x={flyX} y={flyY} h={230} pose="crouch" rot={-560 * fu} glow={1.5} /> : null}
          {t >= LAND ? <Gymnast x={880} y={FEET} h={230 + 0} pose="armsUp" glow={1.6} angles={{ flA: lerp(t, LAND, LAND + 0.3, 40, 4), flB: lerp(t, LAND, LAND + 0.3, 40, 4) }} /> : null}
          {t >= LAND ? [0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={880 + (i - 2.5) * 40 * lerp(t, LAND, LAND + 0.6, 0.3, 2)} cy={FEET - 6 - 30 * Math.sin(Math.PI * lerp(t, LAND, LAND + 0.6, 0, 1))} r={8} fill="#E8DCC0" opacity={lerp(t, LAND, LAND + 0.6, 0.8, 0)} />) : null}
        </Svg>
      </Shot>

      {/* S5a Explanation: a judge asks the board technician what to display */}
      <Shot a={41.9} b={47.9} cam={{ s: [1.02, 1.22], x: [-50, 50], o: "50% 60%", d: 1.4 }} hud={<>
        <BigTitle at={44.6} top={200} text="HARUS TAMPIL APA?" size={112} color={C.cream} />
        <NameTag at={42.11} x={90} y={860} name="JURI" color={C.dim} />
        <NameTag at={42.6} x={990} y={860} name="TEKNISI PAPAN" color={C.dim} align="right" />
      </>}>
        <Booth />
        <Svg>
          <Figure x={300} y={FEET - 40} h={420} pose="stand" contour={C.dim} glow={1.1} facing={1} angles={{ uaA: lerp(t, 42.2, 42.6, 0, 120), faA: lerp(t, 42.2, 42.6, 0, 40) }} />
          <g opacity={lerp(t, 42.3, 42.7, 0, 1)}><JudgeCard x={430} y={900} text="10" s={0.8} tilt={8} /></g>
          <Figure x={700} y={FEET - 40} h={400} pose="stand" contour={C.dim} glow={1.1} facing={-1} angles={{ head: 10 * Math.sin(t * 3), uaA: 30, faA: 60 }} />
          <text x={540} y={1060} textAnchor="middle" fontFamily="Anton" fontSize={200} fill={C.red} opacity={lerp(t, 44.6, 44.8, 0, 1) * (0.8 + 0.2 * Math.sin(t * 8))}>?</text>
        </Svg>
      </Shot>

      {/* S5b Explanation: crash-zoom, 1.00 lights up, camera flashes in the stands */}
      <Shot a={47.9} b={52.3} cam={{ s: [1.22, 1.05], y: [-30, 30], o: "50% 40%", d: 1.3 }} hud={<>
        <Card at={49.75} top={945} title="1.00 = 10 SEMPURNA" lines={["Nilai sempurna pertama", "di senam Olimpiade."]} width={760} />
        <BigTitle at={48.0} top={285} text="SATU KOMA NOL NOL" size={92} />
      </>}>
        <Arena floorY={1400} spotX={540} tiers={[600, 1330]}  {...LOOK.red} />
        <Svg>
          <Scoreboard x={180} y={420} w={720} digits={t < 47.9 ? "   " : "100"} />
          <Gymnast x={930} y={1420} h={260} pose="armsUp" glow={1.7} angles={{ uaA: 150 + 8 * Math.sin(t * 3), uaB: -150 }} />
          <Crowd t={t} />
        </Svg>
      </Shot>

      {/* S6a Payoff: balance beam, seven 10s (4 bars, 3 beam) */}
      <Shot a={52.3} b={62.0} cam={{ y: [40, -30], s: [1.04, 1.1] }} hud={<>
        <BigTitle at={52.4} out={56.4} top={210} text="BARU AWAL" size={130} sub="MONTRÉAL 1976" />
        <BigTitle at={56.58} top={190} text="7 NILAI 10" size={120} />
        {[0, 1, 2, 3].map((i) => <Tile key={i} at={57.96 + i * 0.15} x={225 + i * 210} y={360} color={C.gold} />)}
        <Chip at={58.3} x={540} y={540} text="4 · PALANG BERTINGKAT" size={56} />
        {[0, 1, 2].map((i) => <Tile key={i} at={59.46 + i * 0.15} x={330 + i * 210} y={650} color={C.cream} />)}
        <Chip at={59.8} x={540} y={830} text="3 · BALOK KESEIMBANGAN" size={56} color={C.cream} />
      </>}>
        <Arena floorY={1400} spotX={lerp(t, 52.3, 62, 320, 760, Easing.linear)} tiers={[620, 1330]}  {...LOOK.gold} />
        <Svg>
          <Beam y={1170} x0={60} x1={1020} />
          {(() => {
            const leap = (t % 2.4) / 2.4;
            const air = leap > 0.55 && leap < 0.85;
            const x = lerp(t, 52.3, 62, 220, 820, Easing.linear);
            return air
              ? <Gymnast x={x} y={1170 - 160 * Math.sin(Math.PI * (leap - 0.55) / 0.3)} h={250} pose="jump" phase={(leap - 0.55) / 0.3} glow={1.5} />
              : <Gymnast x={x} y={1170} h={250} pose="walk" phase={t * 0.7} glow={1.5} angles={{ uaA: 80, uaB: -80, faA: 0, faB: 0 }} />;
          })()}
        </Svg>
      </Shot>

      {/* S6b Payoff: 3 gold, 1 silver, 1 bronze */}
      <Shot a={62.0} b={65.3} cam={{ s: [1.12, 1.0] }} hud={<>
        <BigTitle at={62.0} top={200} text="5 MEDALI" size={130} sub="3 EMAS · 1 PERAK · 1 PERUNGGU" />
        {[0, 1, 2].map((i) => <MedalC key={i} at={62.03 + i * 0.2} x={140 + i * 200} y={660} r={78} kind="emas" label="EMAS" spin={i} />)}
        <MedalC at={62.94} x={740} y={660} r={78} kind="perak" label="PERAK" spin={3} />
        <MedalC at={64.26} x={940} y={660} r={78} kind="perunggu" label="PERUNGGU" spin={4} />
      </>}>
        <Arena floorY={1400} spotX={540} tiers={[640, 1330]}  {...LOOK.purple} />
        <Svg>
          <rect x={390} y={1150} width={300} height={250} fill="#0B0C10" stroke={C.gold} strokeWidth={3} />
          <rect x={150} y={1250} width={240} height={150} fill="#0B0C10" stroke={C.dim} strokeWidth={3} />
          <rect x={690} y={1290} width={240} height={110} fill="#0B0C10" stroke={C.dim} strokeWidth={3} />
          <text x={540} y={1300} textAnchor="middle" fontFamily="Anton" fontSize={110} fill={C.gold}>1</text>
          <Figure x={540} y={1150} h={250} pose="armsUp" contour={C.gold} glow={1.6} angles={{ uaA: 150 + 10 * Math.sin(t * 3), uaB: -150 }} />
        </Svg>
      </Shot>

      {/* S7a Legacy: timeline 1976 → 1997 → 2006 */}
      <Shot a={65.3} b={71.9} cam={{ x: [35, -35], s: [1.04, 1.08] }} hud={<>
        <Card at={65.7} out={68.9} top={1000} title="2006" lines={["Nilai senam tak lagi dibatasi 10."]} width={880} />
        <Card at={69.03} top={1000} title="1997" lines={["Pesenam elite minimal 16 tahun."]} width={880} color={C.blue} />
      </>}>
        <Blueprint glow={0.6} ink="#6A4A20" bg={["#F4E8CC", "#C8B084"]} label="ARSIP ATURAN SENAM · 1976 → 2006" />
        <Svg>
          <defs>
            <radialGradient id="archLamp" cx="0.42" cy="0.38" r="0.6">
              <stop offset="0" stopColor="#FFE2A0" stopOpacity={0.55} />
              <stop offset="0.55" stopColor="#FFC870" stopOpacity={0.08} />
              <stop offset="1" stopColor="#1A0E04" stopOpacity={0.55} />
            </radialGradient>
          </defs>
          <rect width={W} height={H} fill="url(#archLamp)" />
          <Figure x={230} y={610} h={280} pose="armsUp" contour={C.gold} glow={1.5} angles={{ uaA: 150 + 6 * Math.sin(t * 2.4), uaB: -150 }} />
          <g opacity={lerp(t, 69.03, 69.4, 0, 1)}>
            <Figure x={540} y={610} h={300} pose="stand" contour="#4AA0FF" glow={1.3} angles={{ uaA: 12 * Math.sin(t * 2), uaB: -10 }} />
          </g>
          <line x1={0} x2={W} y1={760} y2={760} stroke="#2A1E10" strokeWidth={6} opacity={0.7} />
          {[[230, "1976", 65.3, "#A8681A"], [540, "1997", 69.03, "#1E5E9A"], [850, "2006", 65.7, "#2A1E10"]].map(([x, y, at, col]) => (
            <g key={y as string} opacity={lerp(t, at as number, (at as number) + 0.3, 0.3, 1)}>
              <circle cx={x as number} cy={760} r={26} fill={col as string} style={{ filter: `drop-shadow(0 0 12px ${col})` }} />
              <text x={x as number} y={700} textAnchor="middle" fontFamily="Anton" fontSize={90} fill={col as string}>{y as string}</text>
            </g>
          ))}
          <g opacity={lerp(t, 65.3, 65.6, 0, 1)}><Digit x={185} y={800} w={40} ch="1" on="#C8781A" off="#DCC9A2" /><Digit x={240} y={800} w={40} ch="0" on="#C8781A" off="#DCC9A2" /></g>
          <g opacity={lerp(t, 67.56, 67.8, 0, 1)}>
            <text x={850} y={900} textAnchor="middle" fontFamily="Anton" fontSize={110} fill="#2A1E10">10</text>
            <line x1={780} y1={905} x2={920} y2={815} stroke={C.red} strokeWidth={12} strokeLinecap="round" />
          </g>
          <g opacity={lerp(t, 69.03, 69.3, 0, 1)}>
            <text x={540} y={900} textAnchor="middle" fontFamily="Anton" fontSize={110} fill="#1E5E9A">16+</text>
          </g>
        </Svg>
      </Shot>

      {/* S7b Legacy: the 14-year-old fades — never again */}
      <Shot a={71.9} b={76.1} cam={{ s: [1.0, 1.12], o: "50% 60%" }} hud={<>
        <Counter at={71.97} out={75.1} top={200} to={16} label="TAHUN MINIMAL" size={200} roll={0.6} color={C.blue} />
        <Stamp at={75.26} top={300} text="TAK AKAN TERULANG" size={96} />
      </>}>
        <Arena floorY={1400} spotX={540} spot={lerp(t, 72, 75.5, 1, 0.35)} tiers={[640, 1330]}  {...LOOK.cold} />
        <Svg>
          <UnevenBars s={0.8} ox={150} oy={280} />
          <Figure x={540} y={FEET} h={380} pose="stand" contour={C.gold} glow={1.4} opacity={lerp(t, 73.2, 75.3, 1, 0.18)} />
          <g opacity={lerp(t, 72.4, 72.8, 0, 1) * lerp(t, 73.2, 75.3, 1, 0.3)}>
            <rect x={640} y={1000} width={150} height={90} rx={8} fill="#0B0C10" stroke={C.gold} strokeWidth={4} />
            <text x={715} y={1068} textAnchor="middle" fontFamily="Anton" fontSize={64} fill={C.gold}>14</text>
          </g>
        </Svg>
      </Shot>

      {/* S8 Outro: warm arena, AUDIRA plate, salute */}
      <Shot a={76.1} b={FILM_SEC - 3} cam={{ s: [1.12, 1.0] }} hud={<>
        <BigTitle at={76.2} top={200} text="IKUTI" size={120} sub="AUDIRA SPORT FACTS" />
      </>}>
        <Arena floorY={1400} spotX={540} tiers={[640, 1330]}  {...LOOK.orange} />
        <BrandPlate x={90} y={1270} scale={0.9} />
        <Svg>
          <Scoreboard x={230} y={470} w={620} digits="100" />
          <Figure x={540} y={FEET} h={380} pose="armsUp" contour={C.gold} glow={1.6} />
        </Svg>
      </Shot>

      <Flash />
      <Finish warm="#FFB060" />
      {t < FILM_SEC - 3 ? <Karaoke /> : null}
      <AudiraOutro code="SPORTFACTS" />
      <AudiraSignature seed="comaneci-skor-sempurna-1976" />
    </AbsoluteFill>
  );
};

// Judge card rising from below (HUD layer so it stays readable).
const JudgeHud: React.FC<{ at: number; x: number }> = ({ at, x }) => {
  const p = usePop(at);
  const a = useIn(at, 0.2);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: a }}>
      <JudgeCard x={x} y={1130 + (1 - p) * 300} text="10" s={0.95} tilt={(x % 3) - 1} />
    </svg>
  );
};
