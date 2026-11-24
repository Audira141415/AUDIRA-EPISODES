// EP73 Kosta Rika tanpa tentara. CHRONICLE 2D, multi-scene director on the VO clock (film t = VO t + OFF).
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Figure } from "./lib/fig";
import { Finish, Fog, MOODS, Mood, Sky, Skyline, W, H } from "./lib/set";
import { BrandPlate, C, Card, Counter, DateStamp, Medal, NameTag, useFonts, useIn } from "./lib/hud";
import { CAMap, Dust, Fortress, GroundRifle, GuardPost, HallPillars, Leaves, NO_ARMY, Palm, School, Volcanoes, WorldDots, worldXY } from "./lib/costa";
import { AudiraOutro } from "./brand/AudiraOutro";
import { AudiraSignature } from "./brand/AudiraSignature";
import words from "../public/audio/vo-words.json";

export const OFF = 0.3;
export const FILM_SEC = 77.2;
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

// Karaoke: phrase groups from the VO words; active word gold, others cream ≥ 0.75.
type Wd = { text: string; start: number; end: number };
// TTS phonetic spellings -> on-screen spelling.
const SPELL: Record<string, string> = { "Hosé": "José", "Hosé,": "José,", "Figeres,": "Figueres,", "Beyavista": "Bellavista", "Oskar": "Óscar", "Lihtenstain,": "Liechtenstein,", "Audira": "AUDIRA" };
const GROUPS: Wd[][] = (() => {
  const out: Wd[][] = [];
  let g: Wd[] = [];
  (words as Wd[]).forEach((w, i, arr) => {
    g.push({ ...w, text: SPELL[w.text] ?? w.text });
    const nx = arr[i + 1];
    const len = g.map((x) => x.text).join(" ").length + (nx ? nx.text.length + 1 : 0);
    if (!nx || /[.:,?]$/.test(w.text) || g.length >= 4 || nx.start - w.end > 0.25 || len > 24) { out.push(g); g = []; }
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

const Tint: React.FC<{ color: string; o: number }> = ({ color, o }) => <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: "multiply" }} />;


// Foreground occluder: blurred tropical leaves at both edges (depth cue).
const FG: React.FC<{ seed?: number; y?: number }> = ({ seed = 3, y = 1560 }) => {
  const t = useT();
  return (
    <Svg>
      <Leaves side="L" y={y} seed={seed} dx={Math.sin(t * 0.6) * 12} />
      <Leaves side="R" y={y + 80} seed={seed + 5} dx={Math.sin(t * 0.5 + 1) * 12} />
    </Svg>
  );
};

const Label: React.FC<{ at: number; x: number; y: number; text: string; color?: string; size?: number }> = ({ at, x, y, text, color = C.cream, size = 46 }) => {
  const a = useIn(at, 0.35);
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${0.8 + 0.2 * a})`, opacity: a, fontFamily: "BarlowX", fontSize: size, letterSpacing: 4, color, background: "rgba(11,12,16,.78)", padding: "4px 18px", border: `2px solid ${color}`, whiteSpace: "nowrap" }}>{text}</div>;
};

// Budget bars: weapons drain to zero, three civic lines grow.
const Budget: React.FC<{ at: number; top: number; t: number; marks: number[] }> = ({ at, top, t, marks }) => {
  const a = useIn(at, 0.4);
  const rows: [string, string, number][] = [
    ["SENJATA", C.red, 1 - clamp01((t - marks[0]) / 0.6)],
    ["KEAMANAN", C.blue, clamp01((t - marks[1]) / 0.5) * 0.62],
    ["PENDIDIKAN", C.gold, clamp01((t - marks[2]) / 0.5) * 0.9],
    ["BUDAYA", "#9BE3A8", clamp01((t - marks[3]) / 0.5) * 0.55],
  ];
  return (
    <div style={{ position: "absolute", top, left: 90, width: 900, opacity: a, background: "rgba(11,12,16,.84)", borderLeft: `10px solid ${C.gold}`, padding: "22px 30px", boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
      <div style={{ fontFamily: "BarlowX", fontSize: 40, letterSpacing: 6, color: C.cream, marginBottom: 10 }}>ANGGARAN NEGARA</div>
      {rows.map(([n, c, val]) => (
        <div key={n} style={{ display: "flex", alignItems: "center", gap: 18, margin: "10px 0" }}>
          <div style={{ width: 250, fontFamily: "BarlowX", fontSize: 42, color: c, letterSpacing: 2 }}>{n}</div>
          <div style={{ flex: 1, height: 38, background: "rgba(255,255,255,.08)" }}>
            <div style={{ width: `${val * 100}%`, height: "100%", background: c, boxShadow: `0 0 18px ${c}` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

// Constitution page on a desk (S4).
const Page: React.FC<{ t: number; hi: number }> = ({ t, hi }) => {
  const u = clamp01((t - hi) / 0.8);
  return (
    <div style={{ position: "absolute", left: 130, top: 470, width: 820, height: 820, transform: "rotate(-3deg)", background: "linear-gradient(160deg,#F6E9CF,#E2CFA6)", boxShadow: "0 40px 90px rgba(0,0,0,.65), inset 0 0 80px rgba(120,80,30,.35)", padding: "56px 64px" }}>
      <div style={{ fontFamily: "BarlowX", fontSize: 40, letterSpacing: 6, color: "#6A4A22", textAlign: "center" }}>CONSTITUCIÓN POLÍTICA · 1949</div>
      <div style={{ height: 3, background: "#8A6A3A", margin: "16px 0 30px" }} />
      {[0, 1, 2].map((i) => <div key={i} style={{ height: 14, background: "#B9A27A", opacity: 0.5, margin: "16px 0", width: `${90 - i * 12}%` }} />)}
      <div style={{ fontFamily: "Anton", fontSize: 118, color: "#3A2410", marginTop: 26, lineHeight: 1 }}>ARTÍCULO 12</div>
      <div style={{ position: "relative", fontFamily: "Serif", fontSize: 62, lineHeight: 1.12, color: "#2A1A0C", marginTop: 18 }}>
        <span style={{ position: "absolute", left: -8, top: 8, height: 130, width: `${u * 100}%`, background: "#F5B54A", opacity: 0.45 }} />
        <span style={{ position: "relative" }}>“Se proscribe el Ejército como institución permanente.”</span>
      </div>
      {[0, 1].map((i) => <div key={`b${i}`} style={{ height: 14, background: "#B9A27A", opacity: 0.5, margin: "22px 0", width: `${80 - i * 20}%` }} />)}
    </div>
  );
};

const WX = (lon: number, lat: number) => worldXY(lon, lat, -200, 640, 1480);

export const Film: React.FC = () => {
  useFonts();
  const t = useT();
  const v = (x: number) => x + OFF; // VO second -> film second
  const dusk: Mood = MOODS.dusk, night: Mood = MOODS.night, gold: Mood = MOODS.gold, noon: Mood = MOODS.noon;
  const hit = v(24.62); // hammer contact
  const shake = t > hit && t < hit + 0.5 ? Math.sin((t - hit) * 90) * 18 * (1 - (t - hit) / 0.5) : 0;

  return (
    <AbsoluteFill style={{ background: "#05070D" }}>
      {/* S1 Hook: empty barracks gate at dusk, abandoned helmet. 0 soldiers, 70+ years safe */}
      <Shot a={0} b={v(5.4)} cam={{ s: [1.16, 1.0], y: [-20, 10] }} hud={<>
        <BigTitle at={0.15} top={230} text="0 TENTARA" size={190} />
        <Counter at={v(2.9)} to={70} suffix="+ TAHUN" label="DAN TETAP AMAN" top={500} size={150} roll={0.6} />
      </>}>
        <AbsoluteFill style={{ background: dusk.top }} />
        <Sky mood={dusk} sunX={300} sunY={1000} sunR={230} />
        <Svg><Volcanoes y={1080} ink="#2A1C22" smoke={t} /></Svg>
        <Fog color={dusk.fog} y={1050} h={260} opacity={0.5} />
        <Svg>
          <Fortress y={1420} h={480} ink="#16110E" rim={C.gold} window="#3A2A1C" />
          <GuardPost x={200} y={1440} />
          <Palm x={980} y={1460} h={560} lean={-60} sway={Math.sin(t)} />
        </Svg>
        <Rays xs={[120, 330, 560]} o={0.14} />
        <Tint color="#FF9A6A" o={0.12} />
        <FG seed={2} />
      </Shot>

      {/* S2a Map: Central America, Costa Rica lights up between Nicaragua and Panama */}
      <Shot a={v(5.4)} b={v(9.3)} cam={{ s: [1.0, 1.22], x: [0, -40], y: [0, -60] }} hud={<>
        <DateStamp at={v(5.6)} top={230} small="AMERIKA TENGAH" big="KOSTA RIKA" />
      </>}>
        <Svg><CAMap lit={lerp(t, v(5.8), v(6.6), 0, 1)} /></Svg>
        <Label at={v(7.86)} x={330} y={720} text="NIKARAGUA" color={C.dim} />
        <Label at={v(5.9)} x={420} y={1000} text="KOSTA RIKA" color={C.gold} size={54} />
        <Label at={v(8.62)} x={920} y={1210} text="PANAMA" color={C.dim} />
        <Rays xs={[600]} o={0.1} />
      </Shot>

      {/* S2b Civil war 1948: night, burning roofs, red soldiers running */}
      <Shot a={v(9.3)} b={v(15.2)} cam={{ s: [1.04, 1.12], x: [50, -50] }} hud={<>
        <DateStamp at={v(9.5)} out={v(12.9)} top={230} small="PERANG SAUDARA" big="1948" color={C.red} />
        <Counter at={v(13.1)} to={2000} prefix="±" label="ORANG TEWAS" top={240} size={170} color={C.red} roll={0.6} />
        <Card at={v(14.3)} top={620} title="DALAM 6 MINGGU" color={C.red} width={620} />
      </>}>
        <AbsoluteFill style={{ background: night.top }} />
        <Sky mood={{ ...night, low: "#6A2418", sun: "#FF7A40" }} sunX={760} sunY={1150} sunR={200} />
        <Skyline y={1200} seed={19} layer={0.45} ink="#0D0709" windows="#FF8A4A" />
        <Svg>
          {[[230, 1060], [610, 1010], [880, 1080]].map(([x, y], i) => {
            const fl = 0.75 + 0.25 * Math.sin(t * 9 + i * 2);
            return (
              <g key={i}>
                <ellipse cx={x} cy={y} rx={110 * fl} ry={160 * fl} fill="#FF6A2A" opacity={0.28} style={{ filter: "blur(20px)" }} />
                <path d={`M${x - 50},${y + 60} Q${x - 30},${y - 60 * fl} ${x},${y - 120 * fl} Q${x + 30},${y - 50 * fl} ${x + 50},${y + 60} Z`} fill="#FFB060" opacity={0.85} />
                {[0, 1, 2].map((k) => <ellipse key={k} cx={x + 20 + k * 25 + ((t * 30) % 60)} cy={y - 200 - k * 70 - ((t * 40) % 80)} rx={60 + k * 20} ry={30 + k * 10} fill="#2A1A18" opacity={0.5} />)}
              </g>
            );
          })}
          <rect x={0} y={1290} width={W} height={700} fill="#140A0A" />
        </Svg>
        <Fog color="#5A2A22" y={1250} h={260} opacity={0.6} />
        <Svg>
          {[0, 1, 2].map((i) => {
            const x = ((t - v(9.3)) * 150 + i * 320) % 1300 - 120;
            return <Figure key={i} x={x} y={1440 + i * 18} h={360 - i * 30} pose="run" phase={t * 1.6 + i * 0.3} contour={C.red} glow={1.1} tool="rifle" />;
          })}
        </Svg>
        <Tint color="#FF5A3A" o={0.15} />
        <FG seed={8} />
      </Shot>

      {/* S3 The hammer: San José, Figueres (gold) strikes the barracks wall, crack + dust */}
      <Shot a={v(15.2)} b={v(27.9)} cam={{ s: [1.0, 1.14], x: [-30, 20] }} hud={<>
        <NameTag at={v(16.1)} out={v(19.3)} x={70} y={300} name="JOSÉ FIGUERES" sub="PEMENANG PERANG 1948" />
        <DateStamp at={v(19.6)} out={v(25.9)} top={230} small="SAN JOSÉ" big="1 DESEMBER 1948" />
        <Stamp at={v(26.6)} x={540} y={330} text="TENTARA DIBUBARKAN" color={C.gold} size={86} rot={-5} />
      </>}>
        <AbsoluteFill style={{ background: dusk.top }} />
        <Sky mood={gold} sunX={880} sunY={760} sunR={260} />
        <Svg><Volcanoes y={900} ink="#3A2430" o={0.8} /></Svg>
        <Fog color={gold.fog} y={860} h={240} opacity={0.4} />
        <AbsoluteFill style={{ transform: `translate(${shake}px,${shake * 0.4}px)` }}>
          <Svg>
            <Fortress y={1380} h={700} ink="#1C1512" brick="#2E241C" rim={C.gold} crack={lerp(t, hit, v(26.8), 0, 1)} crackX={640} towers={false} />
            <Dust x={640} y={980} age={t - hit} />
            <Figure x={lerp(t, v(15.2), v(17.6), 120, 400)} y={1390} h={540} pose={t < v(17.6) ? "walk" : t < v(23.3) ? "stand" : "smash"} phase={t < v(17.6) ? t * 1.2 : clamp01((t - v(23.3)) / 2.6)} contour={C.gold} glow={1.4} tool="hammer" />
            {t > v(20.0) ? <Figure x={940} y={1390} h={380} pose="stand" contour={C.cream} glow={0.5} opacity={0.75} facing={-1} /> : null}
            {t > v(20.4) ? <Figure x={1030} y={1395} h={340} pose="stand" contour={C.cream} glow={0.5} opacity={0.6} facing={-1} /> : null}
          </Svg>
        </AbsoluteFill>
        <Rays xs={[700, 900]} o={0.18} />
        <Svg style={{ mixBlendMode: "screen" }}>{t > hit && t < hit + 0.3 ? <rect width={W} height={H} fill="#FFE2A0" opacity={0.25 * (1 - (t - hit) / 0.3)} /> : null}</Svg>
        <FG seed={4} />
      </Shot>

      {/* S4 Article 12: constitution page on a desk under a lamp, police (blue) only */}
      <Shot a={v(27.9)} b={v(33.8)} cam={{ s: [1.08, 1.0], y: [-30, 30] }} hud={<>
        <Card at={v(30.3)} out={v(32.4)} top={230} title="TENTARA TETAP DILARANG" color={C.gold} width={820} />
        <Card at={v(32.6)} top={230} title="YANG BOLEH: HANYA POLISI" color={C.blue} width={860} />
      </>}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg,#140C08 0%,#2A1A10 55%,#120A06 100%)" }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 45% at 45% 45%, rgba(255,200,120,.35), transparent 70%)" }} />
        <Page t={t} hi={v(30.0)} />
        <Svg>
          <Figure x={lerp(t, v(32.0), v(33.4), 1180, 900)} y={1390} h={500} pose={t < v(33.2) ? "walk" : "stand"} phase={t * 1.1} contour={C.blue} glow={1.3} facing={-1} tool="cap" />
        </Svg>
        <Rays xs={[480]} color="#FFD58A" o={0.2} />
        <Svg style={{ filter: "blur(12px)" }}><rect x={-40} y={1640} width={W + 80} height={300} fill="#0A0604" /><circle cx={140} cy={1650} r={90} fill="#0A0604" /></Svg>
      </Shot>

      {/* S5 Bellavista barracks becomes the National Museum; budget moves from weapons to schools */}
      <Shot a={v(33.8)} b={v(41.5)} cam={{ s: [1.18, 1.0], y: [30, -20] }} hud={<>
        <DateStamp at={v(34.0)} out={v(37.0)} top={230} small="MARKAS BELLAVISTA" big="MUSEUM NASIONAL" />
        <Budget at={v(37.3)} top={230} t={t} marks={[v(38.3), v(39.2), v(39.75), v(40.6)]} />
      </>}>
        <AbsoluteFill style={{ background: noon.top }} />
        <Sky mood={noon} sunX={220} sunY={820} sunR={240} />
        <Svg><Volcanoes y={1000} ink="#3E4E52" o={0.7} /></Svg>
        <Fog color={noon.fog} y={980} h={240} opacity={0.5} />
        <Svg>
          <Fortress y={1400} h={470} ink="#C9B28A" brick="#A8916A" rim="#FFF3D2" window="#5A4A3A"
            banner={<g opacity={lerp(t, v(35.6), v(36.4), 0, 1)}><rect x={300} y={960} width={480} height={90} fill="#1A120C" stroke={C.gold} strokeWidth={4} /><text x={540} y={1022} textAnchor="middle" fontFamily="Anton" fontSize={58} fill={C.gold}>MUSEO NACIONAL</text></g>} />
          {[0, 1, 2, 3].map((i) => <Figure key={i} x={180 + i * 210 + ((t * 40 + i * 50) % 120)} y={1385 + (i % 2) * 12} h={280} pose="walk" phase={t * 0.9 + i * 0.25} contour={C.cream} glow={0.6} facing={i % 2 ? -1 : 1} />)}
          <Palm x={60} y={1500} h={600} lean={50} sway={Math.sin(t * 0.8)} />
        </Svg>
        <BrandPlate x={500} y={1180} scale={0.92} text="AUDIRA · FAKTA DUNIA" />
        <Rays xs={[180, 380]} o={0.16} />
        <FG seed={6} />
      </Shot>

      {/* S6 Diplomacy: colonnaded hall, Arias (cyan) stands, Nobel medal 1987 */}
      <Shot a={v(41.5)} b={v(53.7)} cam={{ s: [1.0, 1.12], y: [40, -20] }} hud={<>
        <Card at={v(41.7)} out={v(43.4)} top={230} title="LALU SIAPA YANG MENJAGA?" width={880} />
        <Card at={v(43.6)} out={v(46.5)} top={230} title="DIPLOMASI" lines={["+ hukum internasional"]} color={C.blue} width={720} />
        <DateStamp at={v(46.8)} out={v(49.3)} top={230} small="NOBEL PERDAMAIAN" big="1987" color="#BFE9FF" />
        <NameTag at={v(49.5)} out={v(51.8)} x={70} y={260} name="ÓSCAR ARIAS" sub="PRESIDEN KOSTA RIKA" color="#BFE9FF" />
        <Medal x={800} y={700} r={110} at={v(50.9)} n="1987" label="NOBEL PERDAMAIAN" />
        <Card at={v(52.0)} top={230} title="DAMAI AMERIKA TENGAH" color="#BFE9FF" width={760} />
      </>}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg,#0E1420 0%,#1E2433 60%,#140F14 100%)" }} />
        <Svg><HallPillars floor={1330} /></Svg>
        <Rays xs={[180, 540, 900]} color="#CFE6FF" o={0.15} />
        <Fog color="#3A4A66" y={1200} h={280} opacity={0.5} />
        <Svg>
          {[160, 330, 750, 920].map((x) => <Figure key={x} x={x} y={1300} h={330} pose="stand" contour={C.dim} glow={0.4} opacity={0.75} facing={x > 540 ? -1 : 1} />)}
          <Figure x={540} y={1285} h={420} pose={t > v(50.6) ? "wave" : "stand"} phase={t * 0.6} contour="#BFE9FF" glow={1.4} />
          <rect x={60} y={1290} width={960} height={50} fill="#2A1E16" stroke="#BFE9FF" strokeOpacity={0.35} strokeWidth={3} />
          <rect x={100} y={1340} width={24} height={200} fill="#1A120C" /><rect x={956} y={1340} width={24} height={200} fill="#1A120C" />
        </Svg>
        <Svg style={{ filter: "blur(12px)" }}><rect x={-60} y={1600} width={220} height={400} fill="#05070A" /><rect x={930} y={1580} width={220} height={400} fill="#05070A" /></Svg>
      </Shot>

      {/* S7 Not alone: world dot map, ~21 states without a standing army light up */}
      <Shot a={v(53.7)} b={v(61.9)} cam={{ s: [1.0, 1.1], x: [60, -60] }} hud={<>
        <Counter at={v(56.4)} to={21} prefix="±" label="NEGARA TANPA TENTARA TETAP" top={240} size={190} roll={0.5} />
      </>}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, #22405A, #0A1622)" }} />
        <Svg>
          <WorldDots x0={-200} y0={640} w={1480} color="#5A86A8" />
          {NO_ARMY.map(([lon, lat], i) => {
            const at = i === 0 ? v(53.9) : v(56.0) + i * 0.08;
            const a = clamp01((t - at) / 0.25);
            const [x, y] = WX(lon, lat);
            return <g key={i} opacity={a}><circle cx={x} cy={y} r={20 * a} fill={C.gold} opacity={0.3} /><circle cx={x} cy={y} r={7} fill={i === 0 ? C.gold : "#FFE7A8"} /></g>;
          })}
          {([[-19, 65, v(59.06), 1040], [9.5, 47.1, v(59.78), 1130], [12.4, 41.9, v(60.82), 1220]] as [number, number, number, number][]).map(([lon, lat, at, ly], i) => {
            const [x, y] = WX(lon, lat);
            const a = clamp01((t - at) / 0.3);
            return <line key={i} x1={x} y1={y} x2={x + (760 - x) * a} y2={y + (ly - y) * a} stroke={C.gold} strokeWidth={3} opacity={0.8} />;
          })}
          <line x1={WX(-84, 10)[0]} y1={WX(-84, 10)[1]} x2={WX(-84, 10)[0]} y2={WX(-84, 10)[1] + 120 * clamp01((t - v(53.9)) / 0.3)} stroke={C.gold} strokeWidth={3} />
        </Svg>
        <Label at={v(53.9)} x={WX(-84, 10)[0] + 110} y={WX(-84, 10)[1] + 160} text="KOSTA RIKA" color={C.gold} />
        <Label at={v(59.06)} x={860} y={1040} text="ISLANDIA" />
        <Label at={v(59.78)} x={860} y={1130} text="LIECHTENSTEIN" />
        <Label at={v(60.82)} x={860} y={1220} text="VATIKAN" />
        <Rays xs={[300, 760]} color="#9FD0FF" o={0.08} />
      </Shot>

      {/* S8 Payoff: school, children with books, the rifle on the ground becomes a book */}
      <Shot a={v(61.9)} b={v(68.2)} cam={{ s: [1.15, 1.0], y: [-40, 10] }} hud={<>
        <Card at={v(62.1)} out={v(64.6)} top={230} title="BISA AMAN TANPA TENTARA?" width={900} />
        <BigTitle at={v(65.7)} top={230} text="SEKOLAH," size={190} sub="BUKAN SENAPAN" subAt={v(66.85)} />
      </>}>
        <AbsoluteFill style={{ background: gold.top }} />
        <Sky mood={gold} sunX={540} sunY={860} sunR={280} />
        <Svg><Volcanoes y={1000} ink="#4A2E36" o={0.8} /></Svg>
        <Fog color={gold.fog} y={980} h={260} opacity={0.45} />
        <Svg>
          <School x={160} y={1300} w={760} lamp={0.5} />
          <Palm x={70} y={1480} h={640} lean={60} sway={Math.sin(t * 0.7)} />
          <Palm x={1010} y={1500} h={600} lean={-50} sway={Math.sin(t * 0.6 + 1)} />
          <rect x={0} y={1320} width={W} height={600} fill="#2A1C14" />
          <GroundRifle x={540} y={1360} m={lerp(t, v(66.8), v(67.5), 0, 1)} />
          {[0, 1, 2].map((i) => <Figure key={i} x={lerp(t, v(61.9), v(68.2), 120 + i * 140, 360 + i * 140)} y={1360 + i * 6} h={240 - i * 10} pose="walk" phase={t * 1.1 + i * 0.3} contour={C.cream} glow={0.8} tool="book" />)}
          {[0, 1].map((i) => <Figure key={`r${i}`} x={lerp(t, v(61.9), v(68.2), 960 - i * 130, 760 - i * 130)} y={1365} h={230} pose="walk" phase={t * 1.1 + i * 0.4} contour={C.cream} glow={0.8} facing={-1} tool="book" />)}
        </Svg>
        <Rays xs={[300, 540, 780]} o={0.2} />
        <Svg style={{ mixBlendMode: "screen" }}>{t > v(67.1) && t < v(67.5) ? <rect width={W} height={H} fill="#FFE2A0" opacity={0.25 * (1 - (t - v(67.1)) / 0.4)} /> : null}</Svg>
        <FG seed={9} y={1640} />
      </Shot>

      {/* S9 Outro: same school at dusk, lamps on, the question to the viewer */}
      <Shot a={v(68.2)} b={FILM_SEC} cam={{ s: [1.0, 1.1] }} hud={<>
        <Card at={v(68.5)} top={230} title="BERANI MENCOBA?" lines={["Tulis negaramu di komentar."]} width={820} />
      </>}>
        <AbsoluteFill style={{ background: dusk.top }} />
        <Sky mood={dusk} sunX={860} sunY={1040} sunR={200} />
        <Svg><Volcanoes y={1000} ink="#24161E" o={0.9} /></Svg>
        <Fog color={dusk.fog} y={1000} h={240} opacity={0.4} />
        <Svg>
          <School x={160} y={1300} w={760} lamp={0.95} />
          <Palm x={70} y={1480} h={640} lean={60} sway={Math.sin(t * 0.7)} />
          <Palm x={1010} y={1500} h={600} lean={-50} sway={Math.sin(t * 0.6 + 1)} />
          <rect x={0} y={1320} width={W} height={600} fill="#1A120C" />
          <GroundRifle x={540} y={1360} m={1} />
        </Svg>
        <BrandPlate x={300} y={1180} scale={0.9} text="AUDIRA · FAKTA DUNIA" />
        <Rays xs={[760, 940]} o={0.14} />
        <FG seed={10} y={1640} />
      </Shot>

      <Finish vignette={0.55} />
      <Grain />
      {t < FILM_SEC - 3 ? <Karaoke /> : null}
      <AudiraOutro />
      <AudiraSignature seed="kosta-rika-tanpa-tentara-ep73" />
    </AbsoluteFill>
  );
};
