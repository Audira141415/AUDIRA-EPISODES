// EP28 Derek Redmond — Barcelona 1992. CHRONICLE 2D, multi-scene director on the VO clock (film t = VO t + OFF).
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Figure } from "./lib/fig";
import { Fog, Haze, LightRays, MOODS, Mood, Occluder, Sky, Stadium, Track, Finish, W, H } from "./lib/set";
import { BrandPlate, C, Card, Citation, Counter, DateStamp, NameTag, Quote, useFonts, useIn } from "./lib/hud";
import { AudiraOutro } from "./brand/AudiraOutro";
import { AudiraSignature } from "./brand/AudiraSignature";
import { DEREK_HOP, JIM_HOLD } from "./Cover";
import words from "../public/audio/vo-words.json";

export const OFF = 0.3;
export const FILM_SEC = 76.0;
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

// Side-on track for tracking shots: lanes recede up, distance posts stream left; optional labelled marker post.
const SideTrack: React.FC<{ y0: number; scroll: number; color?: string; line?: string; marker?: { x: number; text: string } }> = ({ y0, scroll, color = "#8A3B24", line = "#F1E3C8", marker }) => {
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
      {Array.from({ length: 8 }).map((_, i) => {
        const x = ((i * 190 - scroll) % 1520 + 1520) % 1520 - 220;
        return <rect key={i} x={x} y={y0 + 20} width={10} height={520} fill={line} opacity={0.14} transform={`skewX(-28)`} />;
      })}
      {marker ? (
        <g transform={`translate(${marker.x},${y0 - 10})`}>
          <rect x={-6} y={-150} width={12} height={160} fill={line} />
          <rect x={-90} y={-230} width={180} height={84} rx={8} fill="#0B0C10" stroke={C.gold} strokeWidth={5} />
          <text x={0} y={-170} textAnchor="middle" fontFamily="Anton" fontSize={58} fill={C.gold}>{marker.text}</text>
        </g>
      ) : null}
    </Svg>
  );
};

const Stamp: React.FC<{ at: number; x: number; y: number; text: string; color?: string; size?: number; rot?: number }> = ({ at, x, y, text, color = C.red, size = 120, rot = -10 }) => {
  const t = useT();
  if (t < at) return null;
  const p = lerp(t, at, at + 0.18, 1.6, 1);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${p})`, fontFamily: "Anton", fontSize: size, color, border: `10px solid ${color}`, padding: "0 30px", lineHeight: 1.15, background: "rgba(11,12,16,.45)", whiteSpace: "nowrap" }}>{text}</div>
  );
};

const BigTitle: React.FC<{ at: number; out?: number; top: number; text: string; size?: number; color?: string; sub?: string }> = ({ at, out = 99, top, text, size = 200, color = C.gold, sub }) => {
  const t = useT();
  const a = useIn(at, 0.4) * lerp(t, out, out + 0.3, 1, 0);
  return (
    <div style={{ position: "absolute", top, width: W, textAlign: "center", opacity: a, transform: `scale(${1.25 - 0.25 * a})` }}>
      <div style={{ fontFamily: "Anton", fontSize: size, lineHeight: 0.95, color, textShadow: "0 10px 50px rgba(0,0,0,.65)" }}>{text}</div>
      {sub ? <div style={{ fontFamily: "Anton", fontSize: size * 0.45, color: C.cream, textShadow: "0 6px 30px rgba(0,0,0,.7)" }}>{sub}</div> : null}
    </div>
  );
};

// Full-frame flash (pistol, muscle snap).
const Flash: React.FC<{ at: number; color?: string; peak?: number; dur?: number }> = ({ at, color = "#FFF6E0", peak = 0.75, dur = 0.35 }) => {
  const t = useT();
  if (t < at || t > at + dur) return null;
  return <AbsoluteFill style={{ background: color, opacity: peak * (1 - (t - at) / dur) }} />;
};

// Red burst on the right thigh: rings + crack lines.
const Snap: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const t = useT();
  if (t < at) return null;
  const u = Math.min(1, (t - at) / 0.5);
  return (
    <g transform={`translate(${x},${y})`} opacity={1 - 0.5 * u}>
      <circle r={30 + 120 * u} fill="none" stroke={C.red} strokeWidth={10 * (1 - u) + 2} />
      <circle r={18 + 60 * u} fill="none" stroke="#FFB0A0" strokeWidth={5} opacity={1 - u} />
      {[0, 60, 130, 200, 270, 320].map((a) => {
        const r1 = 26, r2 = 26 + 90 * Math.min(1, u * 2);
        const c = Math.cos((a * Math.PI) / 180), s = Math.sin((a * Math.PI) / 180);
        return <path key={a} d={`M${r1 * c},${r1 * s} L${((r1 + r2) / 2) * c + 8},${((r1 + r2) / 2) * s - 6} L${r2 * c},${r2 * s}`} stroke={C.red} strokeWidth={7} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};

// Stretcher carried at hand height between two officials.
const Stretcher: React.FC<{ x0: number; x1: number; y: number }> = ({ x0, x1, y }) => (
  <g>
    <rect x={x0} y={y - 10} width={x1 - x0} height={20} rx={8} fill="#E9DCC0" stroke="#07080B" strokeWidth={4} />
    <rect x={x0 - 24} y={y - 4} width={x1 - x0 + 48} height={8} rx={4} fill="#5A4630" />
  </g>
);

// Results board (dot-matrix look).
const Board: React.FC<{ x: number; y: number; dnf: boolean }> = ({ x, y, dnf }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 860, background: "#0A0C10", border: `6px solid #2A3240`, borderRadius: 14, padding: "26px 34px", boxShadow: "0 30px 80px rgba(0,0,0,.6)", fontFamily: "BarlowX", color: "#F5C46A", letterSpacing: 4 }}>
    <div style={{ fontSize: 46, color: C.cream, borderBottom: "3px solid #2A3240", paddingBottom: 10 }}>SEMIFINAL 400 M · 3.8.1992</div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 64, marginTop: 18 }}>
      <span>LANE 5</span><span>REDMOND GBR</span><span style={{ color: dnf ? C.red : "#3A3F48" }}>{dnf ? "DNF" : "---"}</span>
    </div>
  </div>
);

// Karaoke: phrase groups from the VO words; active word gold, others cream ≥ 0.75.
type Wd = { text: string; start: number; end: number };
const GROUPS: Wd[][] = (() => {
  const out: Wd[][] = [];
  let g: Wd[] = [];
  (words as Wd[]).forEach((w, i, arr) => {
    g.push(w);
    const nx = arr[i + 1];
    // one line only: a two-line pill at top 1400 runs into the 380 px bottom zone
    const long = g.map((x) => x.text).join(" ").length + 1 + (nx?.text.length ?? 0) > 24;
    if (!nx || /[.:,]$/.test(w.text) || g.length >= 4 || long || nx.start - w.end > 0.25) { out.push(g); g = []; }
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

// Hop cycle for Derek on one leg: bob up/down, small forward surges.
const hopY = (t: number, rate = 1.3) => -Math.abs(Math.sin(t * Math.PI * rate)) * 26;

export const Film: React.FC = () => {
  useFonts();
  const t = useT();
  const dusk = MOODS.dusk, amber = MOODS.amber, night = MOODS.night, gold = MOODS.gold, steel = MOODS.steel;
  const v = (x: number) => x + OFF; // VO second -> film second

  return (
    <AbsoluteFill style={{ background: "#0B0C10" }}>
      {/* S1a Hook: father carries son (cover frame), 65,000 stand */}
      <Shot a={0} b={v(3.6)} cam={{ s: [1.14, 1.0] }} hud={<>
        <BigTitle at={0.05} top={230} text="TIDAK FINIS" size={190} sub="SENDIRIAN" />
        <Counter at={v(2.3)} to={65000} label="PENONTON BERDIRI" top={700} size={150} roll={0.8} />
      </>}>
        <Bg m={dusk} sunX={540} sunY={860} sunR={300} />
        <Stadium y0={740} y1={1170} mood={dusk} seed={28} flash rayX={540} />
        <Fog color={dusk.fog} y={1150} h={300} opacity={0.6} />
        <Track yH={1160} scroll={t / 3} />
        <Svg>
          <g transform={`translate(${lerp(t, 0, v(3.6), -20, 30)},0)`}>
            <Figure x={600} y={FEET} h={540} pose="walk" contour={C.blue} glow={1} angles={JIM_HOLD} />
            <Figure x={510} y={FEET + 15 + hopY(t, 0.9)} h={540} pose="stand" contour={C.gold} glow={1.3} angles={DEREK_HOP} badge="GBR" />
          </g>
        </Svg>
        <Occluder side="right" flagY={720} />
      </Shot>

      {/* S1b Hook: the stadium, AUDIRA board in-world */}
      <Shot a={v(3.6)} b={v(6.1)} cam={{ s: [1.0, 1.1], y: [0, -30] }} hud={<>
        <BigTitle at={v(3.7)} top={250} text="AUDIRA" size={170} color={C.cream} sub="SPORT FACTS" />
      </>}>
        <Bg m={night} sunX={540} sunY={760} sunR={180} />
        <LightRays x={540} y={420} y1={1300} color="#CFE0FF" opacity={0.28} />
        <Stadium y0={700} y1={1180} mood={night} seed={92} flash rayX={540} />
        <BrandPlate x={250} y={1000} scale={1.1} />
        <Fog color={night.fog} y={1170} h={300} opacity={0.6} />
        <Track yH={1180} scroll={t / 1.5} />
      </Shot>

      {/* S2 Context: Barcelona night, semifinal 400 m, Derek at 26, British record holder */}
      <Shot a={v(6.1)} b={v(13.9)} cam={{ s: [1.04, 1.12], x: [40, -40] }} hud={<>
        <DateStamp at={v(6.2)} out={v(10.6)} top={230} small="BARCELONA" big="3 AGUSTUS 1992" />
        <Card at={v(8.9)} out={v(10.7)} top={520} title="SEMIFINAL 400 M" lines={["Olimpiade Barcelona."]} width={700} />
        <NameTag at={v(10.9)} x={70} y={300} name="DEREK REDMOND" sub="26 TAHUN · INGGRIS" />
        <Card at={v(12.6)} top={520} title="PEMEGANG REKOR INGGRIS" lines={["400 meter putra."]} width={760} />
      </>}>
        <Bg m={night} sunX={760} sunY={640} sunR={160} />
        <LightRays x={760} y={300} y1={1240} color="#CFE0FF" opacity={0.3} />
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${(t - 6) * -8}px)` }}>
          <Stadium y0={640} y1={1200} mood={night} seed={41} flash rayX={760} />
        </div>
        <Haze y={1120} color={night.fog} h={220} opacity={0.5} />
        <Track yH={1200} scroll={t / 6} />
        <Svg>
          <Figure x={330} y={FEET - 70} h={300} pose="stand" contour={C.dim} glow={0.3} opacity={0.55} />
          <Figure x={830} y={FEET - 60} h={310} pose="stand" contour={C.dim} glow={0.3} opacity={0.55} />
          <Figure x={570} y={FEET} h={520} pose="stand" contour={C.gold} glow={lerp(t, v(10.8), v(11.6), 0.5, 1.4)} badge="GBR" angles={{ uaA: 20, uaB: -20 }} />
        </Svg>
        <Occluder side="left" flagY={760} />
      </Shot>

      {/* S3a Flashback Seoul 1988: Achilles, withdrew minutes before the race */}
      <Shot a={v(13.9)} b={v(19.2)} cam={{ s: [1.1, 1.0] }} hud={<>
        <DateStamp at={v(14.0)} top={230} small="KILAS BALIK" big="SEOUL 1988" color={C.dim} />
        <Card at={v(16.0)} top={520} title="MUNDUR — CEDERA ACHILLES" lines={["Beberapa menit sebelum lomba."]} color={C.red} width={820} />
      </>}>
        <Bg m={steel} sunX={540} sunY={860} sunR={160} />
        <Stadium y0={760} y1={1160} mood={steel} seed={88} flash={false} banners={false} blur={2} rays={0.15} rayX={540} />
        <Fog color={steel.fog} y={1100} h={500} opacity={0.7} />
        <Svg>
          <rect x={0} y={1180} width={W} height={740} fill="#1A1E24" />
          <Figure x={540} y={FEET} h={430} pose="crouch" contour={C.gold} glow={0.8} opacity={0.9} angles={{ uaA: 60, faA: 70, head: 30 }} />
          {t >= v(16.1) ? <circle cx={600} cy={FEET - 12} r={lerp(t, v(16.1), v(16.6), 10, 46)} fill="none" stroke={C.red} strokeWidth={8} opacity={lerp(t, v(16.1), v(18.5), 1, 0.4)} /> : null}
        </Svg>
        <Fog color={steel.fog} y={1400} h={300} opacity={0.5} />
      </Shot>

      {/* S3b Barcelona round 1: fastest, 45.03 s */}
      <Shot a={v(19.2)} b={v(24.9)} cam={{ s: [1.0, 1.1], x: [0, -30] }} hud={<>
        <BigTitle at={v(19.3)} out={v(20.6)} top={260} text="KALI INI SIAP" size={150} />
        <DateStamp at={v(20.8)} out={v(22.7)} top={230} small="BABAK 1" big="TERCEPAT" />
        <Counter at={v(22.8)} to={45.03} dec={2} suffix=" DTK" label="TERCEPAT · BABAK 1" top={240} size={180} roll={0.7} />
      </>}>
        <Bg m={dusk} sunX={300} sunY={760} sunR={200} />
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${(t - 19) * -60}px)` }}>
          <Stadium y0={640} y1={1020} mood={dusk} seed={51} flash banners={false} rayX={300} />
        </div>
        <SideTrack y0={1020} scroll={(t - 19) * 900} />
        <Svg>
          <Figure x={lerp(t, v(19.2), v(24.9), 380, 250)} y={1230} h={280} pose="run" phase={t * 1.6 + 0.4} contour={C.dim} glow={0.4} opacity={0.75} />
          <Figure x={lerp(t, v(19.2), v(24.9), 430, 300)} y={1330} h={300} pose="run" phase={t * 1.6 + 0.7} contour={C.dim} glow={0.4} opacity={0.8} />
          <Figure x={lerp(t, v(19.2), v(24.9), 470, 660)} y={FEET} h={420} pose="run" phase={t * 1.7} contour={C.gold} glow={1.2} badge="GBR" />
        </Svg>
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${lerp(t, v(19.2), v(24.9), 0, -700)}px)` }}><Occluder side="right" flagY={700} /></div>
      </Shot>

      {/* S4a Semifinal start: lane 5, the pistol */}
      <Shot a={v(24.9)} b={v(28.2)} cam={{ s: [1.12, 1.0] }} hud={<>
        <DateStamp at={v(25.0)} top={230} small="SEMIFINAL" big="LANE 5" />
      </>}>
        <Bg m={dusk} sunX={760} sunY={740} sunR={220} />
        <Stadium y0={620} y1={1060} mood={dusk} seed={61} flash rayX={760} />
        <Track yH={1060} scroll={t < v(26.4) ? 0 : (t - v(26.4)) / 0.6} />
        <Svg>
          <text x={560} y={1500} textAnchor="middle" fontFamily="Anton" fontSize={150} fill="#F1E3C8" opacity={0.35} transform="skewX(-12)">5</text>
          {[300, 800].map((x, i) => <Figure key={x} x={x} y={FEET - 40} h={300} pose={t < v(26.4) ? "set" : "run"} phase={t * 1.6 + i * 0.4} contour={C.dim} glow={0.4} opacity={0.7} />)}
          <Figure x={t < v(26.4) ? 560 : lerp(t, v(26.4), v(28.2), 560, 900)} y={FEET} h={440} pose={t < v(26.4) ? "set" : "run"} phase={t * 1.7} contour={C.gold} glow={1.2} badge="GBR" />
          {t >= v(25.1) && t < v(25.6) ? <circle cx={140} cy={700} r={lerp(t, v(25.1), v(25.6), 20, 120)} fill="#FFF3D2" opacity={lerp(t, v(25.1), v(25.6), 1, 0)} /> : null}
        </Svg>
        <Flash at={v(25.1)} peak={0.55} />
      </Shot>

      {/* S4b Back straight, 150 m: the pop in the right thigh */}
      <Shot a={v(28.2)} b={v(34.4)} cam={{ s: [1.0, 1.12], x: [0, -20] }} hud={<>
        <Card at={v(33.6)} top={250} title="&quot;SAYA KIRA DITEMBAK&quot;" lines={["Bunyi letupan di paha kanan."]} color={C.red} width={820} />
      </>}>
        <Bg m={dusk} sunX={300} sunY={760} sunR={200} />
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${(t - 28) * -60 * (t < v(31.0) ? 1 : 0.4)}px)` }}>
          <Stadium y0={640} y1={1020} mood={dusk} seed={71} flash banners={false} rayX={300} />
        </div>
        <SideTrack y0={1020} scroll={(t < v(31.0) ? t - 28 : v(31.0) - 28 + (t - v(31.0)) * 0.25) * 900} marker={{ x: lerp(t, v(28.6), v(31.0), 1150, 560), text: "150 M" }} />
        <Svg>
          <Figure x={lerp(t, v(28.2), v(34.4), 520, 1200)} y={1250} h={280} pose="run" phase={t * 1.6 + 0.4} contour={C.dim} glow={0.4} opacity={0.75} />
          <Figure x={lerp(t, v(29.5), v(34.4), 300, 1150)} y={1340} h={300} pose="run" phase={t * 1.6 + 0.7} contour={C.dim} glow={0.4} opacity={0.8} />
          <Figure x={560} y={FEET} h={440} pose={t < v(31.0) ? "run" : "stand"} phase={t * 1.7} contour={C.gold} glow={1.2} badge="GBR" angles={t < v(31.0) ? undefined : { lean: 22, head: 15, thA: 10, flA: 20, thB: 40, flB: 90, uaA: 40, faA: 60, uaB: -30, faB: 30 }} />
          <Snap at={v(31.0)} x={575} y={FEET - 155} />
        </Svg>
        <Flash at={v(31.0)} color={C.red} peak={0.45} dur={0.4} />
      </Shot>

      {/* S4c Hamstring torn: Derek drops to his knees, the field runs on */}
      <Shot a={v(34.4)} b={v(37.3)} cam={{ s: [1.15, 1.0] }} hud={<>
        <Card at={v(34.5)} top={250} title="HAMSTRING KANAN PUTUS" lines={["150 m dari start."]} color={C.red} width={820} />
      </>}>
        <Bg m={amber} sunX={540} sunY={760} sunR={220} />
        <Stadium y0={620} y1={1060} mood={amber} seed={71} flash banners={false} blur={1.5} rayX={540} />
        <Track yH={1060} scroll={0.3} />
        <Svg>
          <Figure x={lerp(t, v(34.4), v(37.3), 700, 1200)} y={FEET - 120} h={260} pose="run" phase={t * 1.6} contour={C.dim} glow={0.3} opacity={0.6} />
          <Figure x={540} y={FEET} h={460} pose={t < v(36.2) ? "stand" : "crouch"} contour={C.gold} glow={1.2} badge="GBR" angles={t < v(36.2) ? { lean: 28, head: 20, thA: 15, flA: 30, thB: 50, flB: 100, uaA: 60, faA: 60 } : { lean: 25, head: 35, uaA: 70, faA: 50, uaB: 20, faB: 40 }} />
          <circle cx={560} cy={FEET - 140} r={40} fill="none" stroke={C.red} strokeWidth={6} opacity={0.7} />
        </Svg>
        <Fog color={amber.fog} y={1380} h={280} opacity={0.4} />
      </Shot>

      {/* S5a Officials bring a stretcher, Derek refuses */}
      <Shot a={v(37.3)} b={v(40.1)} cam={{ s: [1.0, 1.08], x: [30, -30] }} hud={<>
        <Stamp at={v(39.3)} x={540} y={520} text="DITOLAK" size={130} rot={-8} />
      </>}>
        <Bg m={amber} sunX={760} sunY={760} sunR={220} />
        <Stadium y0={620} y1={1060} mood={amber} seed={83} flash banners={false} rayX={760} />
        <Track yH={1060} scroll={0.3} />
        <Svg>
          {(() => {
            const dx = lerp(t, v(37.3), v(39.1), 700, 0);
            const xa = 640 + dx, xb = 900 + dx;
            return (
              <>
                <Figure x={xa} y={FEET} h={400} pose="walk" phase={t * 0.9} contour={C.red} glow={0.8} facing={-1} angles={{ uaA: -40, faA: -50 }} />
                <Figure x={xb} y={FEET} h={400} pose="walk" phase={t * 0.9 + 0.5} contour={C.red} glow={0.8} facing={-1} angles={{ uaB: 40, faB: 50 }} />
                <Stretcher x0={xa - 10} x1={xb + 10} y={FEET - 200} />
              </>
            );
          })()}
          <Figure x={330} y={FEET} h={440} pose="crouch" contour={C.gold} glow={1.2} badge="GBR" angles={t >= v(39.1) ? { head: -10, uaA: 120, faA: 10, lean: 20 } : { head: 30, uaA: 70, faA: 50 }} />
        </Svg>
        <Occluder side="right" flagY={700} accent="#7A2E22" />
      </Shot>

      {/* S5b He gets up and hops on one leg: 250 m to go */}
      <Shot a={v(40.1)} b={v(44.1)} cam={{ s: [1.0, 1.1], x: [-30, 30] }} hud={<>
        <Counter at={v(41.9)} to={250} suffix=" M" label="MASIH TERSISA" top={250} size={190} roll={0.7} />
      </>}>
        <Bg m={amber} sunX={540} sunY={780} sunR={240} />
        <LightRays x={540} y={400} y1={1200} color="#FFD58A" opacity={0.25} />
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${(t - 40) * -14}px)` }}>
          <Stadium y0={640} y1={1040} mood={amber} seed={97} flash banners={false} rayX={540} />
        </div>
        <SideTrack y0={1040} scroll={(t - 40) * 120} />
        <Svg>
          <Figure x={lerp(t, v(40.1), v(41.0), 520, 470) + Math.max(0, t - v(41.0)) * 40} y={FEET + (t < v(40.7) ? 0 : hopY(t))} h={460} pose={t < v(40.7) ? "crouch" : "stand"} contour={C.gold} glow={1.3} badge="GBR" angles={t < v(40.7) ? { lean: 30, head: -10 } : DEREK_HOP} />
        </Svg>
        <Fog color={amber.fog} y={1380} h={260} opacity={0.35} />
      </Shot>

      {/* S6a A man breaks through security from the stands: Jim, his father */}
      <Shot a={v(44.1)} b={v(48.9)} cam={{ s: [1.08, 1.0], y: [-20, 20] }} hud={<>
        <NameTag at={v(47.2)} x={1010} y={380} name="JIM REDMOND" sub="AYAH DEREK" color={C.blue} align="right" />
      </>}>
        <Bg m={amber} sunX={300} sunY={700} sunR={200} />
        <Stadium y0={520} y1={1000} mood={amber} seed={33} flash rayX={300} />
        <Svg>
          <rect x={0} y={1000} width={W} height={40} fill="#3A2A1E" />
          {Array.from({ length: 23 }).map((_, i) => <rect key={i} x={i * 48} y={940} width={8} height={70} fill="#5A4630" />)}
          <rect x={0} y={940} width={W} height={10} fill="#7A6450" />
          <rect x={0} y={1040} width={W} height={880} fill="#8A3B24" />
          {(() => {
            const u = lerp(t, v(44.2), v(46.4), 0, 1);
            const jx = 200 + 360 * u, jy = u < 0.35 ? 980 + (FEET - 980) * (u / 0.35) - Math.sin((u / 0.35) * Math.PI) * 80 : FEET;
            const push = lerp(t, v(45.6), v(46.4), 0, 1);
            return (
              <>
                <Figure x={600 + push * 120} y={FEET} h={400} pose="stand" contour={C.red} glow={0.8} facing={-1} angles={{ uaA: 70, faA: 10, lean: -push * 18 }} />
                <Figure x={760 + push * 90} y={FEET + 10} h={400} pose="stand" contour={C.red} glow={0.8} facing={-1} angles={{ uaA: 60, faA: 20, lean: -push * 12 }} />
                <Figure x={t < v(46.4) ? jx : lerp(t, v(46.4), v(48.9), 560, 760)} y={jy} h={440} pose={t < v(46.4) ? "run" : "walk"} phase={t * 1.4} contour={C.blue} glow={1.3} />
              </>
            );
          })()}
        </Svg>
        <Occluder side="left" flagY={620} accent="#2E5A7A" />
      </Shot>

      {/* S6b Father and son: the paraphrased exchange, they finish together */}
      <Shot a={v(48.9)} b={v(54.8)} cam={{ s: [1.0, 1.12], x: [20, -20] }} hud={<>
        <Quote at={v(48.95)} out={v(50.9)} top={250} text="Kamu tidak perlu melakukan ini." who="JIM REDMOND · PARAFRASE" color={C.blue} />
        <Quote at={v(51.0)} out={v(53.0)} top={250} text="Aku harus finis." who="DEREK REDMOND · PARAFRASE" />
        <BigTitle at={v(53.1)} top={280} text="BERSAMA" size={190} />
      </>}>
        <Bg m={gold} sunX={540} sunY={820} sunR={280} />
        <Stadium y0={680} y1={1080} mood={gold} seed={28} flash blur={1.5} rayX={540} />
        <Fog color={gold.fog} y={1070} h={260} opacity={0.55} />
        <Track yH={1080} scroll={t / 4} />
        <Svg>
          <g transform={`translate(${lerp(t, v(48.9), v(54.8), -60, 60)},0)`}>
            <Figure x={600} y={FEET} h={560} pose="walk" contour={C.blue} glow={1.1} angles={JIM_HOLD} />
            <Figure x={510} y={FEET + 15 + hopY(t, 0.9)} h={560} pose="stand" contour={C.gold} glow={1.3} angles={DEREK_HOP} badge="GBR" />
          </g>
        </Svg>
        <Occluder side="right" flagY={700} />
      </Shot>

      {/* S7a 65,000 stand: wide gold stadium, flashes, AUDIRA board */}
      <Shot a={v(54.8)} b={v(56.6)} cam={{ s: [1.15, 1.0] }} hud={<>
        <Counter at={v(54.85)} to={65000} label="PENONTON BERDIRI" top={250} size={190} roll={0.6} />
      </>}>
        <Bg m={gold} sunX={540} sunY={700} sunR={300} />
        <LightRays x={540} y={300} y1={1250} color="#FFF0C0" opacity={0.3} />
        <Stadium y0={560} y1={1250} mood={gold} seed={19} flash rayX={540} />
        <BrandPlate x={60} y={1120} scale={0.9} />
        <Track yH={1250} scroll={t / 4} />
        <Svg>
          <g transform="translate(0,0)">
            <Figure x={560} y={FEET + 20} h={240} pose="walk" contour={C.blue} glow={1} angles={JIM_HOLD} />
            <Figure x={520} y={FEET + 26 + hopY(t, 0.9) * 0.5} h={240} pose="stand" contour={C.gold} glow={1.2} angles={DEREK_HOP} />
          </g>
        </Svg>
      </Shot>

      {/* S7b Steps before the line Jim lets go; Derek crosses alone */}
      <Shot a={v(56.6)} b={v(61.6)} cam={{ s: [1.0, 1.1], x: [-30, 30] }} hud={<>
        <Card at={v(58.2)} out={v(60.6)} top={250} title="JIM MELEPAS PEGANGAN" lines={["Derek menyeberang sendiri."]} color={C.blue} width={820} />
      </>}>
        <Bg m={gold} sunX={760} sunY={780} sunR={260} />
        <Stadium y0={640} y1={1040} mood={gold} seed={61} flash blur={1.2} rayX={760} />
        <Fog color={gold.fog} y={1030} h={220} opacity={0.5} />
        <Svg>
          <rect x={0} y={1040} width={W} height={880} fill="#8A3B24" />
          <rect x={780} y={1040} width={22} height={880} fill="#F1E3C8" />
          <text x={830} y={1120} fontFamily="BarlowX" fontSize={46} fill="#F1E3C8" letterSpacing={6}>FINISH</text>
          {(() => {
            const rel = v(58.2);
            const dx = t < rel ? lerp(t, v(56.6), rel, 160, 380) : 380 + (t - rel) * 120;
            const jx = t < rel ? dx + 90 : 470 - lerp(t, rel, rel + 0.8, 0, 150);
            return (
              <>
                <Figure x={jx} y={FEET} h={480} pose={t < rel ? "walk" : "stand"} contour={C.blue} glow={1.1} angles={t < rel ? JIM_HOLD : { uaA: 40, faA: 30, uaB: -40, faB: -30, head: -8 }} />
                <Figure x={Math.min(dx, 960)} y={FEET + 15 + hopY(t, 1.1)} h={480} pose="stand" contour={C.gold} glow={lerp(t, v(60.2), v(61.0), 1.2, 1.8)} angles={DEREK_HOP} badge="GBR" />
              </>
            );
          })()}
        </Svg>
        <Flash at={v(60.6)} peak={0.3} />
      </Shot>

      {/* S7c Official result: DNF — no time, no place */}
      <Shot a={v(61.6)} b={v(66.1)} cam={{ s: [1.1, 1.0] }} hud={<>
        <Stamp at={v(63.85)} x={540} y={880} text="DNF" size={230} rot={-8} />
        <Card at={v(64.5)} top={1110} title="DID NOT FINISH" lines={["Tanpa waktu, tanpa peringkat."]} color={C.red} width={880} />
      </>}>
        <Bg m={night} sunX={540} sunY={600} sunR={140} />
        <LightRays x={540} y={200} y1={1100} color="#CFE0FF" opacity={0.2} />
        <Stadium y0={900} y1={1300} mood={night} seed={41} flash={false} banners={false} blur={2.5} rayX={540} />
        <Board x={110} y={320} dnf={t >= v(63.85)} />
        <Haze y={1250} color={night.fog} h={300} opacity={0.5} />
      </Shot>

      {/* S8 Outro: the world remembers a father and his son */}
      <Shot a={v(66.1)} b={FILM_SEC - 3} cam={{ s: [1.12, 1.0] }} hud={<>
        <Card at={v(66.2)} out={v(68.3)} top={250} title="AUDIRA · SPORT FACTS" lines={["3 Agustus 1992 · Barcelona", "Derek & Jim Redmond"]} width={860} />
        <BigTitle at={v(68.4)} top={260} text="AYAH & ANAK" size={170} sub="YANG DIINGAT DUNIA" />
        <Citation at={v(70.4)} top={1300} text="OLYMPICS.COM · OLYMPEDIA" />
      </>}>
        <Bg m={gold} sunX={540} sunY={900} sunR={320} />
        <Stadium y0={760} y1={1180} mood={gold} seed={11} flash blur={1.5} rayX={540} />
        <BrandPlate x={70} y={830} scale={0.9} />
        <Fog color={gold.fog} y={1170} h={300} opacity={0.6} />
        <Track yH={1170} scroll={t / 5} />
        <Svg>
          <g transform={`translate(${lerp(t, v(66.1), FILM_SEC - 3, -40, 50)},0)`}>
            <Figure x={610} y={FEET} h={600} pose="walk" contour={C.blue} glow={1.3} angles={JIM_HOLD} />
            <Figure x={515} y={FEET + 15 + hopY(t, 0.9)} h={600} pose="stand" contour={C.gold} glow={1.4} angles={DEREK_HOP} badge="GBR" />
          </g>
        </Svg>
        <Occluder side="right" flagY={700} />
      </Shot>

      <Finish />
      {t < FILM_SEC - 3 ? <Karaoke /> : null}
      <AudiraOutro code="SPORTFACTS" />
      <AudiraSignature seed="ep28-derek-redmond" handle="@AudiraSportFacts" />
    </AbsoluteFill>
  );
};
