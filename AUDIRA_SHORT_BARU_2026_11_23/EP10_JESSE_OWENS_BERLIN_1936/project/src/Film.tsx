// EP10 Jesse Owens — Berlin 1936. CHRONICLE 2D, multi-scene director on the VO clock (film t = VO t + OFF).
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Figure } from "./lib/fig";
import { Finish, Fog, MOODS, Mood, Occluder, rng, Sky, Skyline, Stadium, Track, W, H } from "./lib/set";
import { BrandPlate, C, Card, Citation, Counter, DateStamp, Medal, NameTag, Quote, useFonts, useIn } from "./lib/hud";
import { AudiraOutro } from "./brand/AudiraOutro";
import { AudiraSignature } from "./brand/AudiraSignature";
import words from "../public/audio/vo-words.json";

export const OFF = 0.3;
export const FILM_SEC = 81.5;
const FEET = 1410; // figures stand above the karaoke band and the 380 px bottom zone
const EO = Easing.bezier(0.33, 0, 0.2, 1);

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};
const lerp = (t: number, a: number, b: number, v0: number, v1: number) =>
  interpolate(t, [a, b], [v0, v1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });

// One shot: crossfades in over 0.25 s, keeps drawing 0.25 s past its end; camera moves the world, not the HUD.
type Cam = { s?: [number, number]; x?: [number, number]; y?: [number, number] };
const Shot: React.FC<{ a: number; b: number; cam?: Cam; hud?: React.ReactNode; children: React.ReactNode }> = ({ a, b, cam = {}, hud, children }) => {
  const t = useT();
  if (t < a || t >= b + 0.25) return null;
  const op = lerp(t, a, a + 0.25, 0, 1);
  const s = cam.s ?? [1, 1.08], x = cam.x ?? [0, 0], y = cam.y ?? [0, 0];
  const k = (v: [number, number]) => lerp(t, a, b + 0.25, v[0], v[1]);
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <AbsoluteFill style={{ transform: `translate(${k(x)}px,${k(y)}px) scale(${Math.max(k(s), 1.02 + 2.2 * Math.max(Math.abs(k(x)) / W, Math.abs(k(y)) / H))})`, transformOrigin: "50% 55%" }}>{children}</AbsoluteFill>
      {hud}
    </AbsoluteFill>
  );
};

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>{children}</svg>
);

// Side-on track for tracking shots: lanes recede up, distance posts stream left.
const SideTrack: React.FC<{ y0: number; scroll: number; color?: string; line?: string; posts?: boolean }> = ({ y0, scroll, color = "#8A3B24", line = "#F1E3C8", posts = true }) => {
  const lanes = [0, 0.08, 0.18, 0.31, 0.47, 0.67, 0.9];
  return (
    <Svg>
      <defs>
        <linearGradient id={`st${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.7" />
          <stop offset="1" stopColor={color} />
        </linearGradient>
      </defs>
      <rect x={0} y={y0} width={W} height={H - y0} fill={`url(#st${color.replace("#", "")})`} />
      {lanes.map((u, i) => <rect key={i} x={0} y={y0 + u * 560} width={W} height={3 + u * 6} fill={line} opacity={0.6} />)}
      {posts
        ? Array.from({ length: 8 }).map((_, i) => {
            const x = ((i * 190 - scroll) % 1520 + 1520) % 1520 - 220;
            return <rect key={i} x={x} y={y0 + 20} width={10} height={520} fill={line} opacity={0.14} transform={`skewX(-28)`} />;
          })
        : null}
    </Svg>
  );
};

// Simple horse silhouette with galloping legs (contour like the figures).
const Horse: React.FC<{ x: number; y: number; h: number; phase: number; contour?: string }> = ({ x, y, h, phase, contour = C.dim }) => {
  const th = phase * Math.PI * 2;
  const leg = (bx: number, off: number, key: string) => {
    const a = Math.sin(th + off) * 32;
    const D = Math.PI / 180;
    const kx = bx + 34 * Math.sin(a * D), ky = -70 + 34 * Math.cos(a * D);
    const fx = kx + 34 * Math.sin((a - 25 * Math.max(0, Math.cos(th + off))) * D), fy = ky + 34;
    return <path key={key} d={`M${bx},-70 L${kx},${ky} L${fx},${fy}`} strokeWidth={9} strokeLinecap="round" fill="none" />;
  };
  const body = (
    <>
      <ellipse cx={0} cy={-92} rx={62} ry={26} />
      <path d="M44,-104 L78,-150 L96,-146 L84,-118 L60,-88 Z" />
      <path d="M78,-150 L112,-136 L108,-124 L84,-132 Z" />
      <path d="M-60,-100 Q-90,-96 -96,-62 L-88,-62 Q-82,-88 -58,-88 Z" />
    </>
  );
  const s = h / 160;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <g fill={contour} stroke={contour} strokeWidth={6} opacity={0.9}>{body}{leg(-40, 0, "a")}{leg(-30, 2.2, "b")}{leg(40, 1.1, "c")}{leg(50, 3.3, "d")}</g>
      <g fill="#07080B" stroke="#07080B">{body}{leg(-40, 0, "a2")}{leg(-30, 2.2, "b2")}{leg(40, 1.1, "c2")}{leg(50, 3.3, "d2")}</g>
    </g>
  );
};

const Confetti: React.FC<{ seed: number; n?: number }> = ({ seed, n = 140 }) => {
  const t = useT();
  const r = rng(seed);
  return (
    <Svg>
      {Array.from({ length: n }).map((_, i) => {
        const x0 = r() * W, sp = 120 + r() * 160, ph = r() * 20, w = 8 + r() * 10;
        const y = ((t + ph) * sp) % (H + 200) - 100;
        const x = x0 + Math.sin(t * 2 + i) * 30;
        return <rect key={i} x={x} y={y} width={w} height={w * 2.2} fill={r() > 0.5 ? "#F6E9CF" : "#E8D9B0"} opacity={0.85} transform={`rotate(${(t * 120 + i * 37) % 360} ${x} ${y})`} />;
      })}
    </Svg>
  );
};

const Stamp: React.FC<{ at: number; x: number; y: number; text: string; color?: string; size?: number; rot?: number }> = ({ at, x, y, text, color = C.red, size = 120, rot = -10 }) => {
  const t = useT();
  if (t < at) return null;
  const p = lerp(t, at, at + 0.18, 1.6, 1);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${p})`, fontFamily: "Anton", fontSize: size, color, border: `8px solid ${color}`, padding: "0 26px", lineHeight: 1.15, background: "rgba(11,12,16,.35)", whiteSpace: "nowrap" }}>{text}</div>
  );
};

const BigTitle: React.FC<{ at: number; top: number; text: string; size?: number; color?: string; sub?: string }> = ({ at, top, text, size = 200, color = C.gold, sub }) => {
  const a = useIn(at, 0.4);
  return (
    <div style={{ position: "absolute", top, width: W, textAlign: "center", opacity: a, transform: `scale(${1.25 - 0.25 * a})` }}>
      <div style={{ fontFamily: "Anton", fontSize: size, lineHeight: 0.95, color, textShadow: "0 10px 50px rgba(0,0,0,.65)" }}>{text}</div>
      {sub ? <div style={{ fontFamily: "Anton", fontSize: size * 0.45, color: C.cream, textShadow: "0 6px 30px rgba(0,0,0,.7)" }}>{sub}</div> : null}
    </div>
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
    <div style={{ position: "absolute", top: 1400, left: 40, width: W - 80, textAlign: "center" }}>
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

const Bg: React.FC<{ m: Mood; sunX?: number; sunY?: number; sunR?: number }> = ({ m, sunX, sunY, sunR }) => (
  <>
    <AbsoluteFill style={{ background: m.top }} />
    <Sky mood={m} sunX={sunX} sunY={sunY} sunR={sunR} />
  </>
);

export const Film: React.FC = () => {
  useFonts();
  const t = useT();
  const dusk = MOODS.dusk, amber = MOODS.amber, noon = MOODS.noon, gold = MOODS.gold, night = MOODS.night, steel = MOODS.steel;
  const v = (x: number) => x + OFF; // VO second -> film second

  return (
    <AbsoluteFill style={{ background: "#0B0C10" }}>
      {/* S1a Hook: four medals drop over a dusk stadium */}
      <Shot a={0} b={v(2.1)} cam={{ s: [1.15, 1.0] }} hud={<>
        <BigTitle at={0.05} top={240} text="4 EMAS" size={260} sub="DALAM 7 HARI" />
        {[0, 1, 2, 3].map((i) => <Medal key={i} x={225 + i * 210} y={1010} r={80} at={0.5 + i * 0.32} n={`${i + 1}`} spin={i} />)}
      </>}>
        <Bg m={dusk} sunX={540} sunY={900} sunR={300} />
        <Stadium y0={760} y1={1180} mood={dusk} seed={11} flash rayX={540} />
        <Fog color={dusk.fog} y={1170} h={300} opacity={0.6} />
        <Track yH={1170} scroll={t / 1.2} />
      </Shot>

      {/* S1b Hook: golden sprinter in the dusk stadium, AUDIRA board in-world */}
      <Shot a={v(2.1)} b={v(6.9)} cam={{ s: [1.0, 1.12], y: [0, -30] }} hud={<>
        <DateStamp at={v(2.3)} top={230} small="BERLIN" big="AGUSTUS 1936" />
        <NameTag at={v(2.8)} x={70} y={560} name="JESSE OWENS" sub="AMERIKA SERIKAT" />
      </>}>
        <Bg m={dusk} sunX={560} sunY={860} sunR={300} />
        <Stadium y0={740} y1={1170} mood={dusk} seed={11} flash blur={1.5} rayX={560} />
        <BrandPlate x={70} y={830} scale={0.9} />
        <Fog color={dusk.fog} y={1160} h={300} opacity={0.6} />
        <Track yH={1170} scroll={t / 1.0} />
        <Svg>
          <Figure x={290} y={FEET - 60} h={260} pose="run" phase={t * 1.45 + 0.5} contour={C.dim} glow={0.4} opacity={0.75} />
          <Figure x={560} y={FEET} h={520} pose="run" phase={t * 1.5} contour={C.gold} glow={1.2} />
          <Figure x={850} y={FEET - 80} h={240} pose="run" phase={t * 1.4 + 0.3} contour={C.dim} glow={0.4} opacity={0.7} />
        </Svg>
      </Shot>

      {/* S2 Context: 100,000 crowd, host's race propaganda (no symbols), sharecropper's son from Alabama */}
      <Shot a={v(6.9)} b={v(14.3)} cam={{ s: [1.05, 1.12], x: [40, -40] }} hud={<>
        <Counter at={v(7.4)} out={v(10.0)} to={100000} label="PENONTON DI STADION" top={260} />
        <Card at={v(10.2)} out={v(12.1)} top={300} title="PROPAGANDA TUAN RUMAH" lines={["Nazi ingin memamerkan", "\"keunggulan ras\" lewat Olimpiade."]} color={C.red} />
        <Card at={v(12.3)} top={300} title="ANAK PETANI PENGGARAP" lines={["Lahir di Oakville, Alabama, 1913.", "Anak ke-10 keluarga miskin."]} />
      </>}>
        <Bg m={amber} sunX={760} sunY={780} sunR={220} />
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${(t - 7) * -8}px)` }}>
          <Stadium y0={620} y1={1240} mood={amber} seed={29} flash banners rayX={760} />
        </div>
        <Fog color={amber.fog} y={1240} h={260} opacity={0.5} />
        <Svg>
          <rect x={0} y={1240} width={W} height={700} fill="#3A1C10" />
          {[140, 300, 460, 780, 940].map((x, i) => <Figure key={x} x={x} y={FEET} h={300} pose="stand" contour={C.dim} glow={0.3} opacity={0.6} />)}
          <Figure x={620} y={FEET} h={330} pose="stand" contour={C.gold} glow={lerp(t, v(12.2), v(13), 0.3, 1.3)} />
        </Svg>
      </Shot>

      {/* S3 100 m, 3 August: side tracking, gold pulls ahead */}
      <Shot a={v(14.3)} b={v(18.4)} cam={{ s: [1.0, 1.1], x: [0, -30] }} hud={<>
        <DateStamp at={v(14.4)} top={220} small="3 AGUSTUS" big="100 METER" />
        <Counter at={v(15.9)} to={10.3} dec={1} suffix=" DTK" label="EMAS PERTAMA" top={500} size={170} roll={0.6} />
        <Medal x={900} y={960} r={70} at={v(17.3)} n="1" />
      </>}>
        <Bg m={dusk} sunX={300} sunY={760} sunR={200} />
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${(t - 14) * -60}px)` }}>
          <Stadium y0={640} y1={1020} mood={dusk} seed={41} flash banners={false} rayX={300} />
        </div>
        <SideTrack y0={1020} scroll={(t - 14) * 900} />
        <Svg>
          <Figure x={lerp(t, v(14.3), v(18.4), 360, 260)} y={1230} h={280} pose="run" phase={t * 1.6 + 0.4} contour={C.dim} glow={0.4} opacity={0.75} />
          <Figure x={lerp(t, v(14.3), v(18.4), 420, 300)} y={1330} h={300} pose="run" phase={t * 1.6 + 0.7} contour={C.dim} glow={0.4} opacity={0.8} />
          <Figure x={lerp(t, v(14.3), v(18.4), 470, 640)} y={FEET} h={400} pose="run" phase={t * 1.7} contour={C.gold} glow={1.2} />
        </Svg>
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${lerp(t, v(14.3), v(18.4), 0, -700)}px)` }}><Occluder side="right" flagY={700} /></div>
      </Shot>

      {/* S4a Long jump qualifying: two fouls, one chance left */}
      <Shot a={v(18.4)} b={v(24.6)} cam={{ s: [1.12, 1.0] }} hud={<>
        <DateStamp at={v(18.5)} top={220} small="4 AGUSTUS" big="LOMPAT JAUH" />
        <Stamp at={v(20.9)} x={330} y={640} text="FOUL 1" />
        <Stamp at={v(21.6)} x={750} y={720} text="FOUL 2" rot={8} />
        <Card at={v(23.0)} top={860} title="1 KESEMPATAN TERSISA" lines={["Kualifikasi: lolos atau pulang."]} width={760} />
      </>}>
        <Bg m={noon} sunX={820} sunY={700} sunR={200} />
        <Stadium y0={560} y1={1000} mood={noon} seed={53} flash banners={false} rayX={820} />
        <Svg>
          <rect x={0} y={1000} width={W} height={920} fill="#6E4A2E" />
          <rect x={0} y={1180} width={W} height={120} fill="#8A3B24" />
          <rect x={600} y={1180} width={14} height={120} fill="#F1E3C8" />
          <rect x={614} y={1180} width={470} height={120} fill="#D9B97E" />
          <Figure x={lerp(t, v(18.4), v(20.6), 60, 640)} y={FEET} h={360} pose={t < v(20.6) ? "run" : "stand"} phase={t * 1.6} contour={C.gold} glow={1} angles={t >= v(22.6) ? { head: 25, lean: 6 } : undefined} />
        </Svg>
        <Occluder side="right" flagY={560} />
      </Shot>

      {/* S4b Luz Long (blue): the disputed "advice" story */}
      <Shot a={v(24.6)} b={v(30.7)} cam={{ s: [1.0, 1.1], x: [30, -30] }} hud={<>
        <NameTag at={v(25.0)} x={1010} y={560} name="LUZ LONG" sub="JERMAN" color={C.blue} align="right" />
        <Card at={v(26.6)} top={250} title="KONON: SARAN ANCANG-ANCANG" lines={["Kisah dari Owens sendiri,", "diragukan para sejarawan."]} color={C.blue} />
        <Citation at={v(28.0)} top={1360} text="NPR 2009 · DIPERDEBATKAN" />
      </>}>
        <Bg m={noon} sunX={540} sunY={720} sunR={220} />
        <Stadium y0={560} y1={1000} mood={noon} seed={53} flash banners={false} blur={1.5} rayX={540} />
        <Fog color={noon.fog} y={1000} h={240} opacity={0.5} />
        <Svg>
          <rect x={0} y={1000} width={W} height={920} fill="#6E4A2E" />
          <path d={`M420,1000 Q540,960 660,1000`} stroke={C.blue} strokeWidth={4} strokeDasharray="14 14" fill="none" opacity={lerp(t, v(26), v(27), 0, 0.9)} />
          <Figure x={360} y={FEET} h={430} pose="stand" contour={C.gold} glow={1} />
          <Figure x={720} y={FEET} h={460} pose="wave" phase={t * 0.6} contour={C.blue} glow={1} facing={-1} />
        </Svg>
        <Occluder side="left" flagY={760} accent="#2E5A7A" />
      </Shot>

      {/* S4c The final jump: 8.06 m Olympic record */}
      <Shot a={v(30.7)} b={v(35.6)} cam={{ s: [1.05, 1.0], x: [60, -60] }} hud={<>
        <Counter at={v(32.6)} to={8.06} dec={2} suffix=" M" label="REKOR OLIMPIADE" top={240} size={200} roll={0.7} />
        <Medal x={160} y={760} r={70} at={v(34.6)} n="2" />
      </>}>
        <Bg m={gold} sunX={540} sunY={760} sunR={260} />
        <Stadium y0={600} y1={1000} mood={gold} seed={61} flash rayX={540} />
        <Svg>
          <rect x={0} y={1000} width={W} height={920} fill="#5A3A22" />
          <rect x={0} y={1300} width={W} height={130} fill="#8A3B24" />
          <rect x={220} y={1300} width={14} height={130} fill="#F1E3C8" />
          <rect x={234} y={1300} width={850} height={130} fill="#D9B97E" />
          {(() => {
            const T0 = v(31.8), T1 = v(33.0);
            const flying = t >= T0 && t < T1, landed = t >= T1;
            const u = lerp(t, T0, T1, 0, 1);
            const x = t < T0 ? lerp(t, v(30.7), T0, -80, 220) : landed ? 700 : 220 + 480 * u;
            const y = flying ? FEET - Math.sin(u * Math.PI) * 330 : FEET;
            return (
              <>
                {landed ? <rect x={234} y={1352} width={lerp(t, T1, T1 + 0.6, 0, 466)} height={6} fill={C.gold} /> : null}
                {flying ? Array.from({ length: 4 }).map((_, i) => {
                  const uu = Math.max(0, u - (i + 1) * 0.07);
                  return <Figure key={i} x={220 + 480 * uu} y={FEET - Math.sin(uu * Math.PI) * 330} h={380} pose="jump" phase={uu} contour={C.gold} glow={0.3} opacity={0.18 - i * 0.03} />;
                }) : null}
                <Figure x={x} y={y} h={380} pose={flying ? "jump" : landed ? "crouch" : "run"} phase={flying ? u : t * 1.7} contour={C.gold} glow={1.3} />
              </>
            );
          })()}
        </Svg>
        <Occluder side="right" flagY={620} />
      </Shot>

      {/* S4d Long congratulates first, they walk arm in arm */}
      <Shot a={v(35.6)} b={v(39.8)} cam={{ s: [1.0, 1.08], y: [0, -20] }} hud={<>
        <Card at={v(36.2)} top={250} title="LAWAN JADI SAHABAT" lines={["Long (perak, 7,87 m) yang pertama", "memberi selamat, lalu bergandengan."]} color={C.blue} />
      </>}>
        <Bg m={gold} sunX={540} sunY={820} sunR={300} />
        <Stadium y0={680} y1={1080} mood={gold} seed={61} flash blur={1.5} rayX={540} />
        <Fog color={gold.fog} y={1080} h={260} opacity={0.6} />
        <Svg>
          <rect x={0} y={1080} width={W} height={840} fill="#4A2E1A" />
          <g transform={`translate(${lerp(t, v(35.6), v(39.8), -40, 40)},0)`}>
            <Figure x={470} y={FEET} h={470} pose="walk" phase={t * 0.8} contour={C.gold} glow={1.1} angles={{ uaB: -40, faB: 40 }} />
            <Figure x={600} y={FEET} h={490} pose="walk" phase={t * 0.8 + 0.5} contour={C.blue} glow={1.1} angles={{ uaA: 40, faA: -40 }} />
          </g>
        </Svg>
      </Shot>

      {/* S5a 200 m on the bend, 5 August */}
      <Shot a={v(39.8)} b={v(44.6)} cam={{ s: [1.1, 1.0], x: [-40, 40] }} hud={<>
        <DateStamp at={v(39.9)} top={220} small="5 AGUSTUS" big="200 METER" />
        <Counter at={v(43.3)} to={20.7} dec={1} suffix=" DTK" label="REKOR OLIMPIADE" top={500} size={170} roll={0.5} />
        <Medal x={900} y={980} r={70} at={v(44.0)} n="3" />
      </>}>
        <Bg m={gold} sunX={300} sunY={740} sunR={220} />
        <Stadium y0={620} y1={1060} mood={gold} seed={71} flash banners={false} rayX={300} />
        <Track yH={1060} curve={-0.6} scroll={t / 0.8} />
        <Svg>
          <Figure x={360} y={FEET - 90} h={250} pose="run" phase={t * 1.6 + 0.3} contour={C.dim} glow={0.4} opacity={0.75} />
          <Figure x={560} y={FEET} h={440} pose="run" phase={t * 1.7} contour={C.gold} glow={1.2} angles={{ lean: 20 }} />
        </Svg>
      </Shot>

      {/* S5b Relay, 9 August: baton hand-off, world record, four golds */}
      <Shot a={v(44.6)} b={v(50.6)} cam={{ s: [1.0, 1.1] }} hud={<>
        <DateStamp at={v(44.7)} out={v(46.3)} top={220} small="9 AGUSTUS" big="ESTAFET 4×100" />
        <Counter at={v(46.4)} out={v(48.9)} to={39.8} dec={1} suffix=" DTK" label="REKOR DUNIA" top={240} size={190} roll={0.7} />
        <Citation at={v(46.8)} out={v(48.6)} top={640} text="OWENS · METCALFE · DRAPER · WYKOFF" />
        <BigTitle at={v(48.9)} top={260} text="4 EMAS" size={200} />
        {[0, 1, 2, 3].map((i) => <Medal key={i} x={225 + i * 210} y={820} r={72} at={v(49.0) + i * 0.15} n={`${i + 1}`} spin={i} />)}
      </>}>
        <Bg m={gold} sunX={760} sunY={760} sunR={240} />
        <Stadium y0={640} y1={1020} mood={gold} seed={83} flash rayX={760} />
        <BrandPlate x={60} y={960} scale={0.8} text="AUDIRA · PAPAN SKOR" />
        <SideTrack y0={1020} scroll={(t - 44) * 1000} />
        <Svg>
          <Figure x={lerp(t, v(44.6), v(46.2), 300, 420)} y={FEET} h={400} pose="run" phase={t * 1.7} contour={C.gold} glow={1.1} angles={{ uaA: 80, faA: 0 }} />
          <Figure x={lerp(t, v(44.6), v(46.2), 560, 700)} y={FEET} h={400} pose="run" phase={t * 1.7 + 0.5} contour={C.gold} glow={0.7} opacity={0.85} angles={{ uaB: -80, faB: 0 }} />
          <rect x={lerp(t, v(44.6), v(46.2), 430, 640)} y={FEET - 210} width={46} height={12} rx={6} fill={C.cream} />
        </Svg>
      </Shot>

      {/* S6a New York homecoming: ticker-tape, then the freight elevator */}
      <Shot a={v(50.6)} b={v(56.5)} cam={{ s: [1.0, 1.1], y: [-30, 20] }} hud={<>
        <Card at={v(50.8)} out={v(52.9)} top={250} title="PULANG KE AMERIKA" lines={["Parade ticker-tape di New York."]} />
        <Card at={v(53.4)} top={250} title="LEWAT LIFT BARANG" lines={["Ke resepsi untuk dirinya sendiri", "di hotel Waldorf Astoria."]} color={C.red} />
      </>}>
        <Bg m={night} sunX={540} sunY={500} sunR={120} />
        <Skyline y={1120} seed={5} layer={0.8} ink="#141A26" />
        <Skyline y={1200} seed={9} layer={1} windows="#F5C46A" />
        <Svg>
          <rect x={0} y={1200} width={W} height={720} fill="#0A0D14" />
          {t >= v(53.1) ? (
            <g opacity={lerp(t, v(53.1), v(53.6), 0, 1)}>
              <rect x={640} y={900} width={300} height={510} fill="#1C232E" stroke={C.dim} strokeWidth={6} />
              <rect x={660 + lerp(t, v(54.4), v(55.6), 0, 0)} y={920} width={130 - lerp(t, v(54.6), v(56), 0, 120)} height={490} fill="#2A3240" />
              <rect x={810 + lerp(t, v(54.6), v(56), 0, 120)} y={920} width={130 - lerp(t, v(54.6), v(56), 0, 120)} height={490} fill="#2A3240" />
              <text x={790} y={880} textAnchor="middle" fontFamily="BarlowX" fontSize={44} fill={C.red} letterSpacing={4}>LIFT BARANG</text>
            </g>
          ) : null}
          <Figure x={t < v(53.1) ? 540 : lerp(t, v(53.4), v(56.3), 300, 790)} y={FEET} h={430} pose={t < v(53.1) ? "wave" : "walk"} phase={t * 0.9} contour={C.gold} glow={1} />
        </Svg>
        {t < v(53.6) ? <Confetti seed={7} /> : null}
      </Shot>

      {/* S6b No telegram from the president */}
      <Shot a={v(56.5)} b={v(58.7)} cam={{ s: [1.08, 1.0] }} hud={<>
        <Stamp at={v(57.4)} x={540} y={980} text="TIDAK ADA" size={110} />
      </>}>
        <Bg m={night} sunX={540} sunY={700} sunR={160} />
        <Fog color={night.fog} y={1000} h={600} opacity={0.6} />
        <div style={{ position: "absolute", left: 190, top: 560, width: 700, height: 760, background: "#E9DCC0", transform: `rotate(-3deg)`, boxShadow: "0 30px 80px rgba(0,0,0,.6)", padding: 50, boxSizing: "border-box" }}>
          <div style={{ fontFamily: "Anton", fontSize: 92, color: "#2A1C10", letterSpacing: 6 }}>TELEGRAM</div>
          <div style={{ fontFamily: "Barlow", fontSize: 40, color: "#5A4630", marginTop: 6 }}>DARI: GEDUNG PUTIH</div>
          {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ height: 6, background: "#B9A98A", marginTop: 62, width: `${90 - i * 12}%` }} />)}
        </div>
      </Shot>

      {/* S6c Owens' quote */}
      <Shot a={v(58.7)} b={v(62.8)} cam={{ s: [1.0, 1.08], x: [20, -20] }} hud={<>
        <Quote at={v(58.9)} top={260} text="Bukan Hitler yang menghina saya, tapi presiden kami sendiri." who="JESSE OWENS, OKT 1936" />
      </>}>
        <Bg m={night} sunX={820} sunY={980} sunR={200} />
        <Skyline y={1260} seed={13} layer={0.9} windows="#F5C46A" />
        <Svg>
          <rect x={0} y={1260} width={W} height={660} fill="#0A0D14" />
          <rect x={420} y={1150} width={240} height={260} fill="#1A120C" stroke={C.gold} strokeWidth={4} />
          <Figure x={540} y={1150} h={300} pose="stand" contour={C.gold} glow={1.1} />
        </Svg>
      </Shot>

      {/* S6d Amateur status revoked: racing a horse for money */}
      <Shot a={v(62.8)} b={v(67.2)} cam={{ s: [1.0, 1.08], x: [-30, 30] }} hud={<>
        <Card at={v(62.9)} top={250} title="STATUS AMATIR DICABUT" lines={["Bertahan hidup dengan", "berlomba lari melawan kuda."]} color={C.red} />
      </>}>
        <Bg m={steel} sunX={760} sunY={760} sunR={180} />
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${(t - 62) * -50}px)` }}>
          <Stadium y0={700} y1={1020} mood={steel} seed={97} flash={false} banners={false} rays={0.18} rayX={760} />
        </div>
        <SideTrack y0={1020} scroll={(t - 62) * 800} color="#5A4630" line="#C8B898" />
        <Svg>
          <Horse x={380} y={1300} h={330} phase={t * 2.2} />
          <Figure x={700} y={FEET} h={380} pose="run" phase={t * 1.6} contour={C.gold} glow={1} />
        </Svg>
      </Shot>

      {/* S7a Luz Long falls, Sicily 1943 */}
      <Shot a={v(67.2)} b={v(71.2)} cam={{ s: [1.1, 1.0] }} hud={<>
        <Card at={v(67.5)} top={250} title="LUZ LONG · 1943" lines={["Gugur di Sisilia,", "Perang Dunia II."]} color={C.blue} />
      </>}>
        <Bg m={steel} sunX={540} sunY={900} sunR={160} />
        <Fog color={steel.fog} y={1100} h={700} opacity={0.75} />
        <Svg>
          <rect x={0} y={1250} width={W} height={670} fill="#12161C" />
          <Figure x={540} y={FEET} h={480} pose="stand" contour={C.blue} glow={1.2} opacity={lerp(t, v(68.5), v(71.0), 1, 0.25)} />
        </Svg>
        <Fog color={steel.fog} y={1380} h={300} opacity={0.6} />
      </Shot>

      {/* S7b Congressional Gold Medal 1990, posthumous */}
      <Shot a={v(71.2)} b={v(74.6)} cam={{ s: [1.0, 1.1] }} hud={<>
        <Medal x={540} y={800} r={130} at={v(71.6)} n="1990" />
        <Card at={v(72.4)} top={240} title="CONGRESSIONAL GOLD MEDAL" lines={["Anumerta, 10 tahun setelah wafat."]} width={900} />
      </>}>
        <Bg m={gold} sunX={540} sunY={760} sunR={320} />
        <Stadium y0={1080} y1={1300} mood={gold} seed={19} flash banners={false} blur={1.5} rayX={540} />
        <Fog color={gold.fog} y={1260} h={360} opacity={0.5} />
        <Svg>
          <rect x={0} y={1300} width={W} height={620} fill="#3A2414" />
          <Figure x={540} y={FEET} h={380} pose="armsUp" contour={C.gold} glow={1.2} />
        </Svg>
        <Occluder side="left" flagY={1000} />
      </Shot>

      {/* S7c Finale: two silhouettes walk into the golden stadium */}
      <Shot a={v(74.6)} b={FILM_SEC - 3} cam={{ s: [1.12, 1.0] }} hud={<>
        <BigTitle at={v(75.0)} top={260} text="JUARA SEJATI" size={150} sub="DIAKUI TERLAMBAT" />
      </>}>
        <Bg m={gold} sunX={540} sunY={900} sunR={320} />
        <Stadium y0={760} y1={1180} mood={gold} seed={11} flash blur={1.5} rayX={540} />
        <BrandPlate x={70} y={830} scale={0.9} />
        <Fog color={gold.fog} y={1170} h={300} opacity={0.6} />
        <Track yH={1170} scroll={t / 3} />
        <Svg>
          <Figure x={450} y={FEET} h={580} pose="walk" phase={t * 0.8} contour={C.gold} glow={1.3} angles={{ uaB: -40, faB: 40 }} />
          <Figure x={620} y={FEET} h={600} pose="walk" phase={t * 0.8 + 0.5} contour={C.blue} glow={1.3} angles={{ uaA: 40, faA: -40 }} />
        </Svg>
        <Occluder side="right" flagY={700} />
      </Shot>

      <Finish />
      {t < FILM_SEC - 3 ? <Karaoke /> : null}
      <AudiraOutro code="SPORTFACTS" />
      <AudiraSignature seed="jesse-owens-berlin-1936" handle="@AudiraSportFacts" />
    </AbsoluteFill>
  );
};
