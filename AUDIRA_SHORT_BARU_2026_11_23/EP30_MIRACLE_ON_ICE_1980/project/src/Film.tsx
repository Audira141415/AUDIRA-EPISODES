// EP30 Miracle on Ice — Lake Placid 1980. CHRONICLE 2D, 12-scene director on the VO clock (film t = VO t).
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Figure } from "./lib/fig";
import { Finish, Fog, MOODS, rng as rngF, Sky, Skyline, Stadium, W, H } from "./lib/set";
import { Arena, Boards, Goal, Paper, Puck, Rink, Scoreboard, Spray } from "./lib/rink";
import { BrandPlate, C, Card, Citation, Counter, DateStamp, Medal, NameTag, Quote, useFonts, useIn, usePop } from "./lib/hud";
import { AudiraOutro } from "./brand/AudiraOutro";
import { AudiraSignature } from "./brand/AudiraSignature";
import timeline from "./timeline.json";

export const FILM_SEC = 82;
const OUTRO = 77.6;
const FEET = 1400; // figures stand above the karaoke band and the 380 px bottom zone
const EO = Easing.bezier(0.33, 0, 0.2, 1);
const RED = C.red, BLUE = C.blue, GOLD = C.gold;

const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return f / fps; };
const lerp = (t: number, a: number, b: number, v0: number, v1: number) =>
  interpolate(t, [a, b], [v0, v1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
const step = (t: number, marks: [number, number][], v0: number) => marks.reduce((v, [at, val]) => (t >= at ? val : v), v0);
const hit = (t: number, at: number) => (t >= at && t < at + 0.35 ? Math.sin(((t - at) / 0.35) * Math.PI) : 0);

// One shot: crossfades in over 0.25 s, keeps drawing 0.25 s past its end; camera moves the world, not the HUD.
type Cam = { s?: [number, number]; x?: [number, number]; y?: [number, number]; shake?: number[] };
const Shot: React.FC<{ a: number; b: number; cam?: Cam; hud?: React.ReactNode; children: React.ReactNode }> = ({ a, b, cam = {}, hud, children }) => {
  const t = useT();
  if (t < a || t >= b + 0.25) return null;
  const op = lerp(t, a, a + 0.25, 0, 1);
  const s = cam.s ?? [1, 1.08], x = cam.x ?? [0, 0], y = cam.y ?? [0, 0];
  const k = (v: [number, number]) => lerp(t, a, b + 0.25, v[0], v[1]);
  const sh = (cam.shake ?? []).reduce((m, at) => Math.max(m, t >= at && t < at + 0.5 ? 1 - (t - at) / 0.5 : 0), 0);
  const jx = Math.sin(t * 73) * 18 * sh, jy = Math.cos(t * 61) * 14 * sh;
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <AbsoluteFill style={{ transform: `translate(${k(x) + jx}px,${k(y) + jy}px) scale(${Math.max(k(s), 1.02 + 2.2 * Math.max(Math.abs(k(x)) / W, Math.abs(k(y)) / H))})`, transformOrigin: "50% 55%" }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${jx * 0.5}px,${jy * 0.5}px)` }}>{hud}</AbsoluteFill>
    </AbsoluteFill>
  );
};
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>{children}</svg>;

// Karaoke: phrase groups from the VO words; active word gold, others cream ≥ 0.75.
type Wd = { text: string; start: number; end: number };
const GROUPS: Wd[][] = (() => {
  const out: Wd[][] = [];
  let g: Wd[] = [];
  (timeline.words as Wd[]).forEach((w, i, arr) => {
    g.push(w);
    const nx = arr[i + 1];
    if (!nx || /[.:,!?]$/.test(w.text) || g.length >= 4 || nx.start - w.end > 0.25) { out.push(g); g = []; }
  });
  return out;
})();
const Karaoke: React.FC = () => {
  const t = useT();
  const g = GROUPS.find((gr, i) => t >= gr[0].start - 0.05 && t < (GROUPS[i + 1]?.[0].start ?? gr[gr.length - 1].end + 0.6) - 0.05 && t < gr[gr.length - 1].end + 0.6);
  if (!g) return null;
  return (
    <div style={{ position: "absolute", top: 1470, left: 40, width: W - 80, textAlign: "center" }}>
      <span style={{ display: "inline-block", background: "rgba(7,8,11,.74)", padding: "10px 26px", borderRadius: 12 }}>
        {g.map((w, i) => {
          const on = t >= w.start && t < w.end + 0.05;
          const done = t >= w.end;
          return <span key={i} style={{ display: "inline-block", margin: "0 0.2em", fontFamily: "Jakarta", fontSize: 58, color: on ? GOLD : C.cream, opacity: on || done ? 1 : 0.75, transform: `scale(${on ? 1.04 : 1})` }}>{w.text}</span>;
        })}
      </span>
    </div>
  );
};

const BigTitle: React.FC<{ at: number; top: number; text: string; size?: number; color?: string; sub?: string; out?: number }> = ({ at, top, text, size = 200, color = GOLD, sub, out = 99 }) => {
  const a = useIn(at, 0.4);
  const t = useT();
  const o = lerp(t, out, out + 0.3, 1, 0);
  return (
    <div style={{ position: "absolute", top, width: W, textAlign: "center", opacity: a * o, transform: `scale(${1.25 - 0.25 * a})` }}>
      <div style={{ fontFamily: "Anton", fontSize: size, lineHeight: 0.95, color, textShadow: "0 10px 50px rgba(0,0,0,.65)" }}>{text}</div>
      {sub ? <div style={{ fontFamily: "Anton", fontSize: size * 0.42, color: C.cream, textShadow: "0 6px 30px rgba(0,0,0,.7)" }}>{sub}</div> : null}
    </div>
  );
};

const Stamp: React.FC<{ at: number; x: number; y: number; text: string; color?: string; size?: number; rot?: number; out?: number }> = ({ at, x, y, text, color = RED, size = 120, rot = -8, out = 99 }) => {
  const t = useT();
  if (t < at || t > out + 0.3) return null;
  const p = lerp(t, at, at + 0.18, 1.6, 1);
  return <div style={{ position: "absolute", left: x, top: y, opacity: lerp(t, out, out + 0.3, 1, 0), transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${p})`, fontFamily: "Anton", fontSize: size, color, border: `8px solid ${color}`, padding: "0 26px", lineHeight: 1.15, background: "rgba(7,8,11,.45)", whiteSpace: "nowrap" }}>{text}</div>;
};

// Horizontal stat bars that grow to their value (max = full width).
const StatBar: React.FC<{ at: number; top: number; label: string; v: number; max: number; color: string; out?: number }> = ({ at, top, label, v, max, color, out = 99 }) => {
  const t = useT();
  const p = lerp(t, at, at + 0.9, 0, 1);
  const a = useIn(at, 0.3) * lerp(t, out, out + 0.3, 1, 0);
  const pop = usePop(at + 0.9);
  return (
    <div style={{ position: "absolute", top, left: 80, width: 920, opacity: a }}>
      <div style={{ fontFamily: "BarlowX", fontSize: 44, letterSpacing: 4, color: C.cream }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ height: 70, width: 720 * (v / max) * p, background: color, boxShadow: `0 0 30px ${color}88` }} />
        <div style={{ fontFamily: "Anton", fontSize: 110, color, transform: `scale(${0.85 + 0.15 * pop})`, textShadow: "0 6px 24px rgba(0,0,0,.6)" }}>{Math.round(v * p)}</div>
      </div>
    </div>
  );
};

// MAHASISWA vs RAKSASA title block.
const Versus: React.FC<{ at: number; top: number; out?: number }> = ({ at, top, out = 99 }) => {
  const t = useT();
  const a = useIn(at, 0.4), b = useIn(at + 1.4, 0.4), o = lerp(t, out, out + 0.3, 1, 0);
  return (
    <div style={{ position: "absolute", top, width: W, textAlign: "center", opacity: o }}>
      <div style={{ fontFamily: "Anton", fontSize: 150, lineHeight: 1, color: BLUE, opacity: a, transform: `translateX(${(1 - a) * -200}px)`, textShadow: "0 8px 40px rgba(0,0,0,.7)" }}>MAHASISWA</div>
      <div style={{ fontFamily: "Serif", fontSize: 90, color: C.cream, opacity: b, lineHeight: 1 }}>vs</div>
      <div style={{ fontFamily: "Anton", fontSize: 170, lineHeight: 1, color: RED, opacity: b, transform: `scale(${1.3 - 0.3 * b})`, textShadow: "0 8px 40px rgba(0,0,0,.7)" }}>RAKSASA</div>
    </div>
  );
};

// HUD scoreboard that fades in at `at` (scores passed in already resolved for this frame).
const HudBoard: React.FC<{ at: number; out?: number; y: number; a: string; sa: number; b: string; sb: number; clock?: string; dot?: number; hitA?: number; hitB?: number }> = ({ at, out = 99, y, dot = 9, ...p }) => {
  const t = useT();
  const o = useIn(at, 0.35) * lerp(t, out, out + 0.3, 1, 0);
  return <AbsoluteFill style={{ opacity: o, transform: `translateY(${(1 - o) * -40}px)` }}><Scoreboard cx={540} y={y} dot={dot} {...p} /></AbsoluteFill>;
};

// Crowd + boards + ice: the arena world used by most scenes.
const ArenaWorld: React.FC<{ yH?: number; scroll?: number; warm?: boolean; seed?: number; cones?: number }> = ({ yH = 1010, scroll = 0, warm = false, seed = 7, cones = 4 }) => {
  const m = warm ? MOODS.gold : MOODS.night;
  const tt = useT();
  return (
    <>
      <Arena warm={warm} seed={seed} cones={cones} low={warm ? "#5A3420" : "#1A2840"} />
      <Stadium y0={560} y1={yH - 70} mood={m} seed={seed + 4} flash banners={false} />
      <Fog color={warm ? "#F0A860" : "#3E5A80"} y={yH - 260} h={260} opacity={0.35} />
      <Rink yH={yH} scroll={scroll} warm={warm} />
      <Svg>
        <defs>
          <radialGradient id={`pool${seed}`}><stop offset="0" stopColor={warm ? "#FFE7B0" : "#E8F6FF"} stopOpacity="0.55" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></radialGradient>
          <linearGradient id={`mist${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={warm ? "#FFE2B0" : "#D8ECFA"} stopOpacity="0.5" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></linearGradient>
        </defs>
        {[0.2, 0.5, 0.8].map((u, i) => <ellipse key={i} cx={u * W + Math.sin(tt * 0.6 + i * 2) * 120} cy={yH + 260 + i * 40} rx={260} ry={70} fill={`url(#pool${seed})`} />)}
        <rect x={0} y={yH} width={W} height={220} fill={`url(#mist${seed})`} />
        {Array.from({ length: 40 }).map((_, i) => { const r = rngF(seed * 31 + i); const x = r() * W, y = yH + 60 + r() * (H - yH - 200); return <path key={i} d={`M${x},${y} l${30 + r() * 90},${-2 + r() * 4}`} stroke={warm ? "#B89870" : "#7FA3BC"} strokeWidth={1.2} opacity={0.35} />; })}
      </Svg>
      <Boards y={yH} scroll={scroll * 1.2 + 200} />
      <Fog color={warm ? "#FFD9A0" : "#9CC2E0"} y={yH - 220} h={200} opacity={0.22} />
    </>
  );
};

// Backlight pool behind the subject (depth separation).
const Halo: React.FC<{ x: number; y: number; r: number; color: string; o?: number }> = ({ x, y, r, color, o = 0.8 }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r * 0.7, width: r * 2, height: r * 1.4, borderRadius: "50%", background: `radial-gradient(closest-side, ${color} 0%, ${color}00 100%)`, opacity: o }} />
);

export const Film: React.FC<{ withAudio?: boolean }> = ({ withAudio = false }) => {
  useFonts();
  const t = useT();
  const sk = (sp = 1.6, off = 0) => (t * sp + off) % 1; // skate stride phase

  // Scene 8 shot: puck flight 52.5 -> 53.3 from the stick to the goal.
  const pf = lerp(t, 52.5, 53.3, 0, 1);
  // Scene 6 puck ping-pong across the rink.
  const p6 = (t - 32.6) / 1.7;
  const p6x = 540 + Math.sin(p6 * Math.PI) * 330, p6y = 1250 + Math.cos(p6 * 2.1) * 70;

  return (
    <AbsoluteFill style={{ background: "#07080B" }}>
      {withAudio ? <Audio src={staticFile("audio/vo.wav")} /> : null}

      {/* 1 Hook: faceoff, small blue student vs giant red, puck between them */}
      <Shot a={0} b={8.3} cam={{ s: [1.0, 1.16], y: [0, 40] }} hud={<>
        <DateStamp at={0.6} out={7.6} top={210} small="LAKE PLACID · FEBRUARI" big="1980" color={GOLD} />
        <Versus at={2.5} top={470} out={7.6} />
        <Stamp at={7.4} x={540} y={1100} text="SUDAH JELAS?" color={C.cream} size={92} rot={-6} />
      </>}>
        <ArenaWorld yH={1010} scroll={t * 6} />
        <Svg>
          <Figure x={230} y={FEET} h={300} pose="skate" phase={0.15} k={0.3} contour={BLUE} glow={1.1} stick />
          <Figure x={850} y={FEET + 20} h={560} pose="skate" phase={0.6} k={0.3} contour={RED} glow={1.2} facing={-1} stick />
          <Puck x={540} y={1330} r={18} />
        </Svg>
        <Spray x={260} y={FEET} at={0.2} dir={-1} />
      </Shot>

      {/* 2 Soviet dynasty: red curtain, four golds 1964–1976, veteran line-up */}
      <Shot a={8.3} b={16.7} cam={{ x: [70, -70], s: [1.06, 1.1] }} hud={<>
        <BigTitle at={9.6} top={220} text="4 EMAS" size={210} sub="BERUNTUN · USSR" color={GOLD} out={14.9} />
        {["1964", "1968", "1972", "1976"].map((y, i) => <Medal key={y} x={210 + i * 220} y={880} r={78} at={9.7 + i * 0.32} n={`${i + 1}`} label={y} spin={i} />)}
        <Counter at={15.2} to={26} label="RATA-RATA USIA · THN" top={240} color={RED} roll={0.6} />
      </>}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg,#14060A 0%,#4A1015 55%,#200608 100%)" }} />
        <Halo x={540} y={1150} r={620} color="#FFB08A" o={0.75} />
        <Svg>
          {Array.from({ length: 18 }).map((_, i) => <rect key={i} x={i * 62 - 20} y={0} width={34} height={H} fill="#000" opacity={0.18 + 0.1 * Math.sin(i * 1.7 + t * 0.8)} />)}
          <text x={540} y={1240} textAnchor="middle" fontFamily="Anton" fontSize={330} fill="#D9503A" opacity={0.16}>USSR</text>
          <rect x={0} y={FEET} width={W} height={H - FEET} fill="#0B0607" />
          {[0, 1, 2, 3, 4, 5].map((i) => <Figure key={i} x={120 + i * 168} y={FEET} h={380 + (i % 2) * 40} pose="stand" contour={RED} glow={0.8} stick facing={i < 3 ? 1 : -1} />)}
        </Svg>
      </Shot>

      {/* 3 College team: young blue skaters, 22 vs 26 */}
      <Shot a={16.7} b={22.2} cam={{ s: [1.18, 1.02] }} hud={<>
        <Card at={17.8} out={19.4} top={240} title="TIM TERMUDA" lines={["Pemain kampus, amatir"]} color={BLUE} />
        <Counter at={19.5} to={22} label="RATA-RATA USIA · THN" top={220} color={BLUE} roll={0.5} />
        <AbsoluteFill style={{ opacity: useIn(20.4, 0.4) }}>
          <div style={{ position: "absolute", top: 640, left: 160, width: 760, fontFamily: "BarlowX", fontSize: 40, color: C.cream, letterSpacing: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}><span style={{ width: 90 }}>USSR</span><div style={{ height: 34, width: 26 * 22 * useIn(20.4, 0.6), background: RED }} /><span>26</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 12 }}><span style={{ width: 90 }}>USA</span><div style={{ height: 34, width: 22 * 22 * useIn(20.6, 0.6), background: BLUE }} /><span>22</span></div>
          </div>
        </AbsoluteFill>
      </>}>
        <ArenaWorld yH={1040} scroll={t * 40} seed={21} />
        <Halo x={520} y={1250} r={560} color="#FFFFFF" o={0.6} />
        <Svg>
          <Figure x={lerp(t, 16.7, 22.4, 150, 330)} y={FEET} h={420} pose="skate" phase={sk(1.4)} contour={BLUE} stick />
          <Figure x={lerp(t, 16.7, 22.4, 480, 640)} y={FEET - 60} h={340} pose="skate" phase={sk(1.4, 0.4)} contour={BLUE} glow={0.8} stick />
          <Figure x={lerp(t, 16.7, 22.4, 760, 900)} y={FEET - 110} h={280} pose="skate" phase={sk(1.4, 0.7)} contour={BLUE} glow={0.6} stick />
        </Svg>
      </Shot>

      {/* 4 Herb Brooks: coach on the boards, sprints back and forth */}
      <Shot a={22.2} b={26.1} cam={{ x: [-60, 60], s: [1.08, 1.12] }} hud={<>
        <NameTag at={22.6} out={25.6} x={70} y={260} name="HERB BROOKS" sub="PELATIH" color={GOLD} />
        <Counter at={23.6} to={68} label="PEMAIN DISELEKSI" top={480} color={GOLD} roll={0.5} size={190} />
      </>}>
        <ArenaWorld yH={1000} scroll={Math.sin(t * 1.5) * 120} seed={31} cones={5} />
        <Svg>
          {[0, 1, 2].map((i) => {
            const u = Math.sin((t - 22.2) * 1.6 + i * 0.9);
            return <Figure key={i} x={540 + u * 330} y={FEET - 40 - i * 60} h={330 - i * 40} pose="skate" phase={sk(2, i * 0.3)} facing={Math.cos((t - 22.2) * 1.6 + i * 0.9) > 0 ? 1 : -1} contour={BLUE} glow={0.8} stick />;
          })}
          <Figure x={140} y={FEET + 10} h={470} pose="stand" contour={GOLD} glow={1.2} angles={{ uaA: 70, faA: 60 }} />
          <rect x={150} y={FEET - 330} width={70} height={90} rx={6} fill="#E8DCC0" transform={`rotate(-12 185 ${FEET - 285})`} />
        </Svg>
      </Shot>

      {/* 5 Madison Square Garden: New York night, bulb board slams 10–3 */}
      <Shot a={26.1} b={32.6} cam={{ s: [1.0, 1.3], y: [0, 80], shake: [31.5] }} hud={<>
        <DateStamp at={26.4} out={28.6} top={210} small="13 HARI SEBELUMNYA" big="9 FEB 1980" color={C.cream} />
        <NameTag at={28.9} out={32.3} x={70} y={230} name="MADISON SQUARE GARDEN" sub="NEW YORK · UJI COBA" color={GOLD} />
        <BigTitle at={31.5} top={1080} text="10–3" size={200} color={RED} />
      </>}>
        <AbsoluteFill style={{ background: MOODS.night.top }} />
        <Sky mood={MOODS.night} sunX={540} sunY={1000} sunR={420} />
        <Skyline y={1150} seed={5} layer={0} windows="#FFD58A" />
        <Skyline y={1250} seed={9} layer={1} windows="#FFB347" />
        <Fog color="#2B3A55" y={1150} h={300} opacity={0.5} />
        <AbsoluteFill style={{ opacity: lerp(t, 28.7, 29.1, 0, 1) }}>
          <Halo x={540} y={700} r={600} color="#FFB347" o={0.55} />
          <Scoreboard cx={540} y={520} dot={13} a="USSR" sa={Math.round(lerp(t, 29.6, 31.5, 0, 10))} b="USA" sb={t >= 31.8 ? 3 : Math.min(2, Math.round(lerp(t, 30, 31.4, 0, 2)))} hitA={hit(t, 31.5)} hitB={hit(t, 31.8)} />
        </AbsoluteFill>
      </Shot>

      {/* 6 Period 1 at Lake Placid: scores trade, 2–2 with one second left */}
      <Shot a={32.6} b={41.3} cam={{ x: [50, -50], s: [1.05, 1.12] }} hud={<>
        <DateStamp at={32.8} out={34.9} top={210} small="LAKE PLACID" big="22 FEB 1980" color={GOLD} />
        <HudBoard at={35.1} out={41.0} y={220} a="USSR" sa={step(t, [[35.4, 1], [36.1, 2]], 0)} b="USA" sb={step(t, [[35.8, 1], [40.0, 2]], 0)} clock={t < 37 ? " 5:21" : t < 40 ? " 0:01" : " 0:00"} hitA={hit(t, 35.4) + hit(t, 36.1)} hitB={hit(t, 35.8) + hit(t, 40.0)} />
        <NameTag at={39.1} out={40.5} x={1010} y={640} name="MARK JOHNSON" sub="GOL · SISA 1 DETIK" color={BLUE} align="right" />
        <BigTitle at={40.7} top={610} text="2–2" size={190} color={C.cream} />
      </>}>
        <ArenaWorld yH={980} scroll={t * 30} seed={41} cones={5} />
        <Svg>
          <Figure x={p6x - 160} y={FEET} h={360} pose="skate" phase={sk(1.8)} contour={BLUE} stick facing={Math.cos(p6 * Math.PI) > 0 ? 1 : -1} />
          <Figure x={1040 - p6x * 0.6} y={FEET - 80} h={310} pose="skate" phase={sk(1.8, 0.5)} contour={RED} stick facing={-1} glow={0.8} />
          <Figure x={180 + p6x * 0.3} y={FEET - 150} h={250} pose="skate" phase={sk(1.8, 0.2)} contour={RED} stick glow={0.6} />
          <Puck x={p6x} y={p6y} r={16} trail={[540 + Math.sin((p6 - 0.12) * Math.PI) * 330, 1250 + Math.cos((p6 - 0.12) * 2.1) * 70]} />
        </Svg>
      </Shot>

      {/* 7 Goalie pulled: Tretiak skates off, a second red goalie takes the net */}
      <Shot a={41.3} b={45.6} cam={{ s: [1.04, 1.2], y: [0, 60] }} hud={<>
        <Stamp at={42.9} x={540} y={420} text="KIPER DIGANTI" color={RED} size={110} rot={-5} out={44.2} />
        <NameTag at={44.4} x={70} y={300} name="VLADISLAV TRETIAK" sub="KIPER LEGENDARIS USSR · KELUAR" color={RED} />
      </>}>
        <ArenaWorld yH={940} scroll={0} seed={51} cones={3} />
        <Halo x={540} y={1180} r={520} color="#FFFFFF" o={0.6} />
        <Svg>
          <Goal x={540} y={1290} w={560} />
          <Figure x={lerp(t, 42.6, 45.4, 540, 930)} y={FEET - 40} h={400} pose={t < 42.6 ? "goalie" : "skate"} phase={sk(1.2)} contour={RED} stick opacity={lerp(t, 44.6, 45.4, 1, 0.3)} />
          <Figure x={lerp(t, 43.4, 45.4, 120, 540)} y={FEET - 30} h={400} pose={t < 45.2 ? "skate" : "goalie"} phase={sk(1.2, 0.5)} contour={RED} glow={0.7} stick />
        </Svg>
      </Shot>

      {/* 8 Period 3: 3–3, captain shoots, 4–3 */}
      <Shot a={45.6} b={53.9} cam={{ s: [1.02, 1.18], x: [-30, 30], shake: [53.3] }} hud={<>
        <HudBoard at={45.8} out={50.9} y={220} a="USSR" sa={3} b="USA" sb={t >= 48.3 ? 3 : 2} clock={t < 49.2 ? "12:50" : "10:00"} hitB={hit(t, 48.3)} />
        <Card at={49.2} out={50.9} top={680} title="10 MENIT TERSISA" color={GOLD} width={760} />
        <NameTag at={51.3} out={52.8} x={70} y={260} name="MIKE ERUZIONE" sub="KAPTEN TIM AS" color={GOLD} />
        <BigTitle at={53.3} top={300} text="4–3!" size={300} color={GOLD} />
      </>}>
        <ArenaWorld yH={960} scroll={t * 10} seed={61} cones={5} />
        <AbsoluteFill style={{ background: "#FFF2CC", opacity: hit(t, 53.3) * 0.7 }} />
        <Svg>
          <Goal x={800} y={1180} w={380} shake={hit(t, 53.3)} />
          <Figure x={830} y={1210} h={300} pose="goalie" contour={RED} glow={0.7} stick facing={-1} />
          <Figure x={lerp(t, 45.6, 51.5, 120, 300)} y={FEET} h={440} pose={t < 51.6 ? "skate" : "shoot"} phase={t < 51.6 ? sk(1.6) : lerp(t, 51.6, 52.8, 0, 1)} contour={GOLD} glow={1.3} stick />
          {t >= 52.5 && t < 54 ? <Puck x={430 + (760 - 430) * pf} y={1380 - (1380 - 1130) * pf - Math.sin(pf * Math.PI) * 60} r={16} trail={[430 + (760 - 430) * Math.max(0, pf - 0.35), 1380 - (1380 - 1130) * Math.max(0, pf - 0.35)]} color="#FFD58A" /> : <Puck x={440} y={1385} r={16} />}
        </Svg>
        <Spray x={760} y={1150} at={53.3} seed={8} n={40} dir={1} />
      </Shot>

      {/* 9 Stats: 39 shots vs 16, Jim Craig 36 saves */}
      <Shot a={53.9} b={60.2} cam={{ y: [90, -40], s: [1.12, 1.04] }} hud={<>
        <StatBar at={54.7} top={200} label="TEMBAKAN USSR" v={39} max={39} color={RED} out={59.9} />
        <StatBar at={56.7} top={380} label="TEMBAKAN AS" v={16} max={39} color={BLUE} out={59.9} />
        <Counter at={58.1} out={59.9} to={36} label="JIM CRAIG · 36 PENYELAMATAN" top={570} color={BLUE} roll={0.8} size={150} />
      </>}>
        <ArenaWorld yH={1000} scroll={-t * 8} seed={71} cones={3} />
        <AbsoluteFill style={{ background: "rgba(5,8,16,.35)" }} />
        <Svg>
          <Goal x={720} y={1300} w={460} />
          <Figure x={720} y={FEET - 60} h={420} pose="goalie" phase={t} contour={BLUE} glow={1.2} stick facing={-1} />
          {[0, 1, 2].map((i) => { const u = ((t - 53.9) * 0.9 + i / 3) % 1; return <Puck key={i} x={80 + u * 560} y={1180 + i * 70 - u * 40} r={13} trail={[20 + u * 500, 1190 + i * 70 - u * 40]} color="#FF9A7A" />; })}
        </Svg>
      </Shot>

      {/* 10 Final seconds: crowd erupts, paper flies, "Do you believe in miracles?" */}
      <Shot a={60.2} b={65.6} cam={{ y: [120, -80], s: [1.06, 1.16] }} hud={<>
        <HudBoard at={60.3} out={63.3} y={220} a="USSR" sa={3} b="USA" sb={4} clock={` 0:${String(Math.max(0, Math.ceil(lerp(t, 60.3, 61.4, 10, 0)))).padStart(2, "0")}`} dot={10} />
        <AbsoluteFill style={{ opacity: useIn(63.4, 0.4), background: "linear-gradient(180deg, rgba(7,8,11,0) 12%, rgba(7,8,11,.78) 22%, rgba(7,8,11,.78) 46%, rgba(7,8,11,0) 56%)" }} />
        <Quote at={63.6} top={280} text="Do you believe in miracles? YES!" who="AL MICHAELS · KOMENTATOR" color={GOLD} />
      </>}>
        <ArenaWorld yH={1040} scroll={0} seed={81} cones={6} warm={t > 61.4} />
        <AbsoluteFill style={{ background: "#FFE2A0", opacity: hit(t, 61.4) * 0.5 }} />
        <Halo x={540} y={1180} r={640} color="#FFF4DA" o={0.85} />
        <Svg>
          {[0, 1, 2, 3].map((i) => <Figure key={i} x={170 + i * 250} y={FEET - (i % 2) * 50} h={380 - (i % 2) * 50} pose={t > 61.4 ? (i % 2 ? "jump" : "armsUp") : "skate"} phase={t > 61.4 ? 0.5 + 0.3 * Math.sin(t * 6 + i) : sk(1.5, i * 0.25)} contour={BLUE} glow={1.1} stick={t <= 61.4} facing={i < 2 ? 1 : -1} />)}
        </Svg>
        <Paper seed={9} from={61.4} n={170} />
      </Shot>

      {/* 11 Not the final yet: Finland 2–1 -> USA 4–2, gold */}
      <Shot a={65.6} b={72.0} cam={{ s: [1.0, 1.15], x: [40, -20] }} hud={<>
        <Stamp at={66.0} x={540} y={520} text="BELUM FINAL" color={RED} size={130} rot={-7} out={66.8} />
        <DateStamp at={66.9} out={68.4} top={210} small="DUA HARI KEMUDIAN" big="24 FEB 1980" color={GOLD} />
        <HudBoard at={68.6} out={71.0} y={220} a="FIN" sa={2} b="USA" sb={step(t, [[69.9, 2], [70.2, 3], [70.6, 4]], 1)} hitB={hit(t, 69.9) + hit(t, 70.2) + hit(t, 70.6)} />
        <Medal x={540} y={700} r={150} at={71.3} n="1" label="EMAS · 1980" />
      </>}>
        <ArenaWorld yH={1020} scroll={t * 14} seed={91} cones={5} warm />
        <Svg>
          {[0, 1, 2].map((i) => <Figure key={i} x={lerp(t, 65.6, 72, 140 + i * 280, 220 + i * 280)} y={FEET - (i === 1 ? 0 : 50)} h={i === 1 ? 420 : 340} pose={t > 70.6 ? "armsUp" : "skate"} phase={sk(1.6, i * 0.33)} contour={BLUE} glow={1} stick={t <= 70.6} />)}
        </Svg>
      </Shot>

      {/* 12 Legacy: Sports Illustrated "greatest sports moment of the 20th century", AUDIRA sign */}
      <Shot a={72.0} b={OUTRO} cam={{ s: [1.02, 1.14] }} hud={<>
        <Card at={72.3} out={75.5} top={240} title="MOMEN OLAHRAGA TERBESAR ABAD KE-20" lines={["Versi Sports Illustrated, 1999"]} color={GOLD} />
        <Citation at={72.6} out={75.5} text="SUMBER: SPORTS ILLUSTRATED (1999) · IIHF" top={1360} />
        <AbsoluteFill style={{ opacity: useIn(75.6, 0.4) }}>
          <BrandPlate x={150} y={560} scale={1.6} />
        </AbsoluteFill>
      </>}>
        <ArenaWorld yH={1040} scroll={t * 8} seed={101} cones={5} warm />
        <Svg>
          {[0, 1, 2, 3, 4].map((i) => <Figure key={i} x={140 + i * 200} y={FEET - (i % 2) * 40} h={360 - (i % 2) * 40} pose="armsUp" contour={GOLD} glow={1.1} phase={0} />)}
        </Svg>
        <Paper seed={12} from={70} n={110} />
      </Shot>

      <Finish />
      {t < OUTRO ? <Karaoke /> : null}
      <AudiraOutro code="SPORTFACTS" seconds={FILM_SEC - OUTRO} />
      <AudiraSignature seed="miracle-on-ice-1980" handle="@AudiraSportFacts" outroSeconds={FILM_SEC - OUTRO} />
    </AbsoluteFill>
  );
};
