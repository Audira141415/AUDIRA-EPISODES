// EP16 scenes S1–S15. Each gets global t (s) and local lt (s since scene start), draws in 1080 × 1920.
import React from "react";
import {
  C, Defs, P, Lit, MapView, Route, Arrowhead, Dot, MapIsland, Sky, Sea, Volcano, Cloud, Caravel, Person, House,
  Lobster, Potato, Stamp, Ship, Plane, type Cam, lerpCam, toScreen, hash, ramp, ease, easeOut, expoOut, lerp, circle, ellipse,
} from "./pieces";
import { PLACES, arc, partial, polyD, proj } from "./geo";

export type SceneProps = { t: number; lt: number };

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <Defs />
    {children}
  </svg>
);

const cam = (s: number, ox: number, oy: number, tx = 0, ty = 0, rot = 0) =>
  `translate(${ox + tx},${oy + ty}) rotate(${rot}) scale(${s}) translate(${-ox},${-oy})`;

/** Screen-space place tag on a dark plate with red border-left, clamped inside the frame. */
const Tag: React.FC<{ c: Cam; p: [number, number]; text: string; t: number; t0: number; until?: number; dy?: number; dx?: number; gold?: boolean }> = ({ c, p, text, t, t0, until = 1e9, dy = -70, dx = 0, gold }) => {
  if (t < t0 || t > until) return null;
  const k = expoOut(ramp(t, t0, t0 + 0.5)) * (1 - ramp(t, until - 0.3, until));
  const [sx, sy] = toScreen(c, p);
  const w = text.length * 31 + 70;
  const x = Math.max(60, Math.min(1020 - w, sx + dx - w / 2));
  const y = Math.max(300, Math.min(1300, sy + dy));
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: w, height: 78, background: "rgba(14,18,26,.9)", borderLeft: `9px solid ${gold ? C.goldHi : C.red}`,
      color: C.cream, fontFamily: "Anton", fontSize: 50, letterSpacing: 2, display: "flex", alignItems: "center", justifyContent: "center",
      opacity: k, transform: `translateY(${(1 - k) * 18}px)`, boxShadow: "0 10px 24px rgba(0,0,0,.45)", whiteSpace: "nowrap",
    }}>{text}</div>
  );
};

const T = PLACES.tristan, SH = PLACES.stHelena, CT = PLACES.capeTown, UK = PLACES.calshot;
const dist = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// ── S1 Hook: lone island → ring grows to St Helena ────────────────────────────────────────
export const S1: React.FC<SceneProps> = ({ t, lt }) => {
  const mid: [number, number] = [(T[0] + SH[0]) / 2 + 40, (T[1] + SH[1]) / 2 + 30];
  const c = lerpCam({ cx: T[0], cy: T[1] - 10, s: 6.5 }, { cx: mid[0], cy: mid[1], s: 1.55, rot: -4 }, expoOut(ramp(lt, 1.3, 4.6)));
  c.s *= 1 + lt * 0.012;
  const u = 1 / c.s;
  const ringK = easeOut(ramp(lt, 1.6, 3.8));
  const route = arc(T, SH, 0.12);
  return (
    <>
      <MapView cam={c} t={t}>
        <circle cx={T[0]} cy={T[1]} r={dist(T, SH) * ringK} fill="none" stroke={C.goldHi} strokeWidth={4 * u} strokeDasharray={`${16 * u} ${10 * u}`} opacity={0.85 * (1 - ramp(lt, 6.5, 7.8) * 0.5)} />
        <circle cx={T[0]} cy={T[1]} r={dist(T, SH) * ringK} fill={C.goldHi} opacity={0.05} />
        <Route d={polyD(partial(route, ramp(lt, 2.3, 3.8)))} u={u} />
        {lt > 3.8 ? <Arrowhead p={route[route.length - 2]} q={SH} u={u} /> : null}
        {lt > 2.3 ? <Dot p={SH} u={u} t={t} /> : null}
        {[0, 1, 2, 3].map((i) => {
          const k = (t * 0.35 + i / 4) % 1;
          const R = 9 * 4 * Math.max(1, c.s / 1.1);
          return <circle key={i} cx={T[0]} cy={T[1]} r={R * (1.3 + 1.6 * k) * u} fill="none" stroke={C.foam} strokeWidth={(5 - 3 * k) * u} opacity={(1 - k) * 0.45 * (1 - ramp(lt, 2, 4))} />;
        })}
        <MapIsland p={T} u={u} size={4 * Math.max(1, c.s / 1.1)} />
        <Dot p={T} u={u} t={t} col={C.red} r={8} />
      </MapView>
      <Tag c={c} p={SH} text="ST HELENA" t={t} t0={3.2} dy={-90} />
      <Tag c={c} p={T} text="???" t={t} t0={0.6} until={4.8} dy={60} gold />
    </>
  );
};

// ── S2 Wide Atlantic, island named ────────────────────────────────────────────────────────
export const S2: React.FC<SceneProps> = ({ t, lt }) => {
  const c = lerpCam({ cx: 1420, cy: 1380, s: 1.2 }, { cx: 1250, cy: 1150, s: 0.52 }, expoOut(ramp(lt, 0, 2.6)));
  c.s *= 1 + ramp(lt, 2.6, 8) * 0.12;
  c.cy += ramp(lt, 2.6, 8) * 60;
  const u = 1 / c.s;
  const pulse = ramp(lt, 5.0, 8);
  return (
    <>
      <MapView cam={c} t={t}>
        {[0, 1, 2].map((i) => {
          const k = (pulse * 1.6 + i / 3) % 1;
          return pulse > 0 ? <circle key={i} cx={T[0]} cy={T[1]} r={(40 + 520 * k)} fill="none" stroke={C.red} strokeWidth={4 * u} opacity={(1 - k) * 0.8} /> : null;
        })}
        <Dot p={SH} u={u} t={t} />
        <MapIsland p={T} u={u} size={1.6} />
        <Dot p={T} u={u} t={t} col={C.red} r={10} />
      </MapView>
      <Tag c={c} p={T} text="TRISTAN DA CUNHA" t={t} t0={8.3} dy={50} />
      <Tag c={c} p={SH} text="ST HELENA" t={t} t0={8.6} dy={-90} gold />
      <Tag c={c} p={proj(20, 5)} text="AFRIKA" t={t} t0={9.4} dy={0} gold />
      <Tag c={c} p={proj(-55, -10)} text="AMERIKA SELATAN" t={t} t0={9.8} dy={120} dx={40} gold />
    </>
  );
};


// ── S3 1506: Portuguese caravel sights the island, rough sea ──────────────────────────────
export const S3: React.FC<SceneProps> = ({ t, lt }) => {
  const bob = Math.sin(t * 2.1) * 10;
  return (
    <Frame>
      <Sky id="s3" top="#1A2233" mid="#3A3F55" glow="#D98E4E" horizon={1080} />
      <g transform={cam(1 + lt * 0.03, 540, 1080, -lt * 12)}>
        <g transform="translate(300,1090) scale(0.42)" opacity={0.9}><Volcano silhouette="#2E3448" /></g>
        <Cloud x={300} y={900} w={260} o={0.5} />
        <Sea y={1080} t={t} col="#22344A" light="#5A6A7A" />
        <g transform={`translate(${lerp(980, 640, easeOut(ramp(lt, 0, 4.5)))},${1230 + bob}) rotate(${Math.sin(t * 1.6) * 3}) scale(1.05)`}><Caravel /></g>
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={ellipse(80 + i * 160 + Math.sin(t * 1.3 + i) * 20, 1330 + (i % 2) * 40, 90, 14)} fill={C.foam} opacity={0.35} />
        ))}
      </g>
    </Frame>
  );
};

// ── S4 Route to Cape Town 2.810 km ────────────────────────────────────────────────────────
export const S4: React.FC<SceneProps> = ({ t, lt }) => {
  const mid: [number, number] = [(T[0] + CT[0]) / 2, (T[1] + CT[1]) / 2 - 20];
  const c = lerpCam({ cx: T[0] + 40, cy: T[1], s: 2.4 }, { cx: mid[0], cy: mid[1], s: 1.45, rot: 2 }, expoOut(ramp(lt, 0.2, 2.8)));
  c.cx += lt * 6;
  const u = 1 / c.s;
  const route = arc(T, CT, -0.16);
  return (
    <>
      <MapView cam={c} t={t}>
        <Route d={polyD(partial(route, ramp(lt, 0.9, 2.6)))} u={u} />
        {lt > 2.6 ? <Arrowhead p={route[route.length - 2]} q={CT} u={u} /> : null}
        <Dot p={CT} u={u} t={t} />
        <MapIsland p={T} u={u} size={2} />
        <Dot p={T} u={u} t={t} col={C.red} r={9} />
      </MapView>
      <Tag c={c} p={CT} text="CAPE TOWN" t={t} t0={22.2} dy={-100} dx={-60} />
      <Tag c={c} p={T} text="TRISTAN" t={t} t0={20.5} dy={50} gold />
    </>
  );
};

// ── S5 Volcano, tilt up from sea to crater, height scale ──────────────────────────────────
const Plate: React.FC<{ x: number; y: number; w: number; text: string; k: number; gold?: boolean; fs?: number }> = ({ x, y, w, text, k, gold, fs = 48 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: fs + 34, background: "rgba(14,18,26,.92)", borderLeft: `10px solid ${C.red}`, color: gold ? C.goldHi : C.cream,
    fontFamily: "Anton", fontSize: fs, letterSpacing: 3, display: "flex", alignItems: "center", justifyContent: "center", opacity: k, transform: `translateX(${(1 - k) * -40}px)`, boxShadow: "0 10px 24px rgba(0,0,0,.45)", whiteSpace: "nowrap" }}>{text}</div>
);

export const S5: React.FC<SceneProps> = ({ t, lt }) => {
  const tilt = ease(ramp(lt, 0, 3.6));
  return (
    <>
    <Frame>
      <Sky id="s5" top="#121A2A" mid="#33405A" glow="#D7965A" horizon={1320} />
      <g transform={cam(1.05 + lt * 0.02, 540, 1300, 0, lerp(-260, 160, tilt))}>
        <Cloud x={220} y={760} w={240} o={0.55} />
        <g transform="translate(540,1330) scale(1.12)"><Volcano t={t} /></g>
        <Cloud x={700} y={1020} w={330} o={0.8} />
        <Sea y={1320} t={t} />
      </g>
      {/* height scale */}
      <g opacity={ramp(lt, 1.6, 2.2)}>
        <line x1={960} x2={960} y1={1240} y2={lerp(1240, 640, easeOut(ramp(t, 27.5, 28.9)))} stroke={C.goldHi} strokeWidth={6} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={940} x2={980} y1={1240 - i * 120} y2={1240 - i * 120} stroke={C.goldHi} strokeWidth={4} opacity={0.7} />)}
        <path d="M960,620 l-20,30 h40z" fill={C.red} transform={`translate(0,${lerp(620, 0, easeOut(ramp(t, 27.5, 28.9))) })`} />
      </g>
    </Frame>
    <Plate x={790} y={1250} w={230} text="2.062 M" k={ramp(lt, 1.6, 2.2)} fs={42} />
    </>
  );
};

// ── S6 People: ±220 residents, 11 surnames ────────────────────────────────────────────────
const NAMES = ["GLASS", "GREEN", "SWAIN", "REPETTO"];
export const S6: React.FC<SceneProps> = ({ t, lt }) => {
  const rows = 4, cols = 11;
  return (
    <>
    <Frame>
      <Sky id="s6" top="#141C2C" mid="#2E3B52" glow="#C98A52" horizon={1380} />
      <g transform={cam(1 + lt * 0.025, 540, 1200, lt * -6)}>
        <g transform="translate(540,1390) scale(1.6)" opacity={0.55}><Volcano silhouette="#2A3246" /></g>
        <rect x={-40} y={1370} width={1160} height={600} fill="#3D4A33" />
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, i) => {
            const n = r * cols + i;
            const k = easeOut(ramp(t, 30.4 + n * 0.035, 30.8 + n * 0.035));
            const x = 90 + i * 90 + (r % 2) * 40 + (hash(n) - 0.5) * 18;
            const y = 1080 + r * 85;
            const s = 0.42 + r * 0.06;
            return (
              <g key={n} transform={`translate(${x},${y + (1 - k) * 40}) scale(${s})`} opacity={k}>
                <g transform="translate(14,10)" filter="url(#cast)"><Person col="rgba(4,6,12,.55)" v={n} /></g>
                <Person col={r % 2 ? "#E8DCC2" : C.cream} v={n} />
              </g>
            );
          }),
        )}
      </g>
    </Frame>
    {NAMES.map((nm, i) => <Plate key={nm} x={i % 2 ? 580 : 110} y={600 + Math.floor(i / 2) * 110} w={390} text={nm} k={expoOut(ramp(t, 33.0 + i * 0.18, 33.5 + i * 0.18))} />)}
    <Plate x={345} y={830} w={390} text="+ 7 NAMA LAIN" k={expoOut(ramp(t, 33.8, 34.2))} gold fs={42} />
    </>
  );
};

// ── S7 Village: Edinburgh of the Seven Seas below the volcano ─────────────────────────────
const HOUSES = Array.from({ length: 13 }, (_, i) => ({ x: 70 + i * 150 + hash(i + 3) * 40, y: 1250 + (i % 3) * 34 + hash(i) * 14, roof: i % 3 === 1 ? C.roofGrn : C.roofRed, s: 0.55 + (i % 3) * 0.08 }));
export const S7: React.FC<SceneProps> = ({ t, lt }) => {
  const pan = lerp(0, -560, ease(ramp(lt, 0, 4.3)));
  return (
    <Frame>
      <Sky id="s7" top="#16203A" mid="#3C4766" glow="#E0A060" horizon={1220} />
      <g transform={`translate(${pan * 0.35},0)`}>
        <g transform="translate(560,1240) scale(1.45)"><Volcano t={t} /></g>
        <Cloud x={420} y={640} w={360} o={0.85} />
      </g>
      <g transform={`translate(${pan},0)`}>
        <path d="M-60,1230 C300,1190 900,1200 1800,1230 L1800,1460 L-60,1460Z" fill="#5C6B3E" />
        <path d="M-60,1230 C300,1190 900,1200 1800,1230" stroke={C.oliveLt} strokeWidth={6} fill="none" opacity={0.6} />
        <path d="M-60,1372 C400,1350 1100,1360 1800,1380" stroke="#A89C80" strokeWidth={16} fill="none" />
        {HOUSES.map((h, i) => (
          <g key={i} transform={`translate(${h.x},${h.y + (1 - easeOut(ramp(lt, 0.1 + i * 0.05, 0.5 + i * 0.05))) * 30})`}><House roof={h.roof} s={h.s} /></g>
        ))}
        <path d="M-60,1440 L1800,1440 L1800,1520 L-60,1520Z" fill="#3A3A34" />
      </g>
      <Sea y={1500} t={t} />
    </Frame>
  );
};

// ── S8 Livelihood: lobster, potatoes, stamps on the chart table ───────────────────────────
export const S8: React.FC<SceneProps> = ({ t, lt }) => {
  const pop = (t0: number) => { const k = expoOut(ramp(t, t0, t0 + 0.45)); return { k, s: 0.6 + 0.4 * k }; };
  const a = pop(39.8), b = pop(40.9), d = pop(41.9);
  return (
    <Frame>
      <defs>
        <radialGradient id="pool8" cx="0.45" cy="0.48" r="0.6">
          <stop offset="0" stopColor="#3B3424" />
          <stop offset="1" stopColor={C.navy} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#pool8)" />
      <g transform={cam(1 + lt * 0.025, 540, 960, 0, 0, Math.sin(lt * 0.5) * 1.2)}>
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 100} x2={i * 100} y1={0} y2={1920} stroke={C.gold} strokeOpacity={0.12} strokeWidth={2} />)}
        {Array.from({ length: 20 }, (_, i) => <line key={i} y1={i * 100} y2={i * 100} x1={0} x2={1080} stroke={C.gold} strokeOpacity={0.12} strokeWidth={2} />)}
        <g transform={`translate(300,${820}) rotate(-14) scale(${1.2 * a.s})`} opacity={a.k}><Lobster /></g>
        <g transform={`translate(800,${830}) rotate(10) scale(${1.3 * b.s})`} opacity={b.k}><Potato /></g>
        <g transform={`translate(800,${880}) rotate(-8) scale(${0.8 * b.s})`} opacity={b.k}><Potato /></g>
        <g transform={`translate(540,1150) rotate(${-6 + Math.sin(t) * 1.5}) scale(${1.05 * d.s})`} opacity={d.k}><Stamp /></g>
      </g>
    </Frame>
  );
};

// ── S9 No airport → ship from Cape Town (±10/yr, ±7 days) ─────────────────────────────────
export const S9: React.FC<SceneProps> = ({ t, lt }) => {
  const mid: [number, number] = [(T[0] + CT[0]) / 2, (T[1] + CT[1]) / 2];
  const c = lerpCam({ cx: T[0], cy: T[1] - 40, s: 3.6 }, { cx: mid[0], cy: mid[1] + 10, s: 1.5, rot: -2 }, expoOut(ramp(lt, 2.6, 5.2)));
  c.s *= 1 + lt * 0.008;
  const u = 1 / c.s;
  const route = arc(CT, T, 0.16);
  const sail = ease(ramp(lt, 4.6, 8.2));
  const pos = partial(route, sail);
  const sp = pos[pos.length - 1];
  const planeK = 1 - ramp(lt, 2.4, 2.9);
  return (
    <>
      <MapView cam={c} t={t} dim={0.25 * planeK}>
        <Route d={polyD(route)} u={u} col={C.gold} w={4} />
        <Route d={polyD(pos)} u={u} />
        <Dot p={CT} u={u} t={t} />
        <MapIsland p={T} u={u} size={2.4} />
        {lt > 4.4 ? <g transform={`translate(${sp[0]},${sp[1] - 26 * u}) scale(${0.2 * u})`}><Ship /></g> : null}
      </MapView>
      {planeK > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: planeK }}>
          <g transform={`translate(540,880) scale(${1.4 + lt * 0.05}) rotate(-20)`}>
            <Plane col={C.cream} />
          </g>
          <circle cx={540} cy={880} r={250} fill="none" stroke={C.red} strokeWidth={22} />
          <line x1={365} y1={1055} x2={715} y2={705} stroke={C.red} strokeWidth={22} strokeDasharray={`${500 * ramp(lt, 0.2, 0.6)} 600`} />
        </svg>
      ) : null}
      <Tag c={c} p={CT} text="CAPE TOWN" t={t} t0={46.8} dy={-100} dx={-60} />
    </>
  );
};

// ── S10 Communal land: patchwork plots merge into one colour, red boundary ────────────────
const PLOTS = Array.from({ length: 30 }, (_, i) => ({ x: (i % 6) * 110 - 330, y: Math.floor(i / 6) * 100 - 250, c: ["#8C9A58", "#B5A766", "#6F7B4A", "#A6884E", "#7F8F5A"][Math.floor(hash(i + 9) * 5)] }));
export const S10: React.FC<SceneProps> = ({ t, lt }) => {
  const merge = ease(ramp(t, 52.4, 53.4));
  const ring = easeOut(ramp(t, 54.0, 55.2));
  return (
    <Frame>
      <rect width={1080} height={1920} fill={C.sea} />
      <g transform={cam(1 + lt * 0.035, 540, 960, 0, 0, lt * 1.2)}>
        <Sea y={0} t={t} />
        <g transform="translate(540,960)">
          <P d={circle(0, 0, 400)} fill={C.olive} depth={1.4} />
          <clipPath id="isl10"><path d={circle(0, 0, 370)} /></clipPath>
          <g clipPath="url(#isl10)">
            {PLOTS.map((p, i) => (
              <rect key={i} x={p.x} y={p.y} width={104} height={94} fill={p.c} opacity={1 - merge * 0.85} stroke={C.oliveDk} strokeWidth={4 * (1 - merge)} />
            ))}
            <rect x={-400} y={-400} width={800} height={800} fill="#8C9A58" opacity={merge * 0.85} />
          </g>
          <path d={circle(0, 0, 400)} fill="url(#keylit)" />
          <circle r={40} fill={C.oliveDk} /><circle r={18} fill={C.ink} />
          <circle r={470} fill="none" stroke={C.red} strokeWidth={10} strokeDasharray="34 20" strokeDashoffset={-t * 30} opacity={ring} />
        </g>
      </g>
    </Frame>
  );
};

// ── S11 1961 eruption beside the village (payoff impact at 61.45) ─────────────────────────
export const S11: React.FC<SceneProps> = ({ t, lt }) => {
  const e = easeOut(ramp(t, 61.4, 62.4));
  const red = ramp(t, 59.5, 61.6);
  const shake = e > 0 ? (1 - ramp(t, 61.45, 62.6)) * 14 : 0;
  const sx = Math.sin(t * 61) * shake, sy = Math.cos(t * 47) * shake;
  return (
    <Frame>
      <Sky id="s11" top={red > 0.5 ? "#2A0E10" : "#121A2A"} mid={red > 0.5 ? "#5A1C18" : "#2E3B52"} glow={red > 0.3 ? "#E0602E" : "#B87A4A"} horizon={1290} />
      <rect width={1080} height={1920} fill="#FF4A1E" opacity={0.18 * red + 0.2 * e} style={{ mixBlendMode: "overlay" }} />
      <g transform={cam(1.0 + lt * 0.045, 540, 1250, sx - lt * 16, sy - lt * 6)}>
        {/* ash plume */}
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={ellipse(520 + (hash(i) - 0.5) * 240 + e * i * 14, 520 - i * 44 * e - e * 60, 120 + i * 16, 60 + i * 8)} fill={C.ash} opacity={e * (0.75 - i * 0.03)} />
        ))}
        <g transform="translate(480,1300) scale(1.2)"><Volcano t={t} erupt={e} /></g>
        <path d="M640,1260 C760,1240 900,1240 1140,1250 L1140,1330 L640,1330Z" fill="#5C6B3E" />
        {[700, 800, 900, 1000].map((x, i) => (
          <g key={x} transform={`translate(${x},${1290 + (i % 2) * 14})`}><House roof={i % 2 ? C.roofGrn : C.roofRed} s={0.5} /></g>
        ))}
        {Array.from({ length: 26 }, (_, i) => {
          const k = ((t * 0.5 + hash(i)) % 1);
          return <circle key={i} cx={200 + hash(i + 40) * 760} cy={300 + k * 1000} r={3 + hash(i) * 4} fill="#D8CFC4" opacity={e * 0.6 * (1 - k)} />;
        })}
        <Sea y={1310} t={t} col="#1A2638" light="#7A3A2A" />
      </g>
    </Frame>
  );
};

// ── S12 Evacuation: Tristan → Cape Town → England ─────────────────────────────────────────
export const S12: React.FC<SceneProps> = ({ t, lt }) => {
  const c = lerpCam({ cx: T[0] + 120, cy: T[1] - 60, s: 1.35 }, { cx: 1450, cy: 900, s: 0.62, rot: 0 }, ease(ramp(lt, 0.6, 4.6)));
  c.s *= 1 + 0.016 * lt;
  const u = 1 / c.s;
  const leg1 = arc(T, CT, -0.16);
  const leg2: [number, number][] = [CT, proj(10, -22), proj(4, -2), proj(-12, 10), proj(-22, 22), proj(-15, 38), proj(-9, 46), UK];
  const smooth = leg2.flatMap((p, i) => (i === 0 ? [p] : partial([leg2[i - 1], p], 1).slice(1)));
  const k1 = ramp(lt, 0.3, 1.8), k2 = ramp(lt, 1.8, 4.4);
  const p2 = partial(smooth, k2);
  const shipP = k2 > 0 ? p2[p2.length - 1] : partial(leg1, k1).slice(-1)[0];
  return (
    <>
      <MapView cam={c} t={t}>
        <Route d={polyD(partial(leg1, k1))} u={u} />
        {k2 > 0 ? <Route d={polyD(p2)} u={u} /> : null}
        {k2 >= 1 ? <Arrowhead p={smooth[smooth.length - 2]} q={UK} u={u} /> : null}
        <Dot p={CT} u={u} t={t} />
        {lt > 4 ? <Dot p={UK} u={u} t={t} col={C.red} /> : null}
        <MapIsland p={T} u={u} size={1.6} />
        <g transform={`translate(${shipP[0]},${shipP[1] - 20 * u}) scale(${0.16 * u})`}><Ship /></g>
      </MapView>
      <Tag c={c} p={UK} text="INGGRIS" t={t} t0={67.9} dy={40} dx={120} />
      <Tag c={c} p={CT} text="CAPE TOWN" t={t} t0={64.6} dy={-100} />
    </>
  );
};

// ── S13 1963: gold route home ─────────────────────────────────────────────────────────────
export const S13: React.FC<SceneProps> = ({ t, lt }) => {
  const c = lerpCam({ cx: 1450, cy: 900, s: 0.67 }, { cx: T[0] + 20, cy: T[1] - 60, s: 1.9 }, ease(ramp(lt, 0.1, 3.75)));
  const u = 1 / c.s;
  const home = arc(UK, T, 0.1, 60);
  const k = easeOut(ramp(lt, 0.15, 2.4));
  const p = partial(home, k);
  return (
    <>
      <MapView cam={c} t={t}>
        <Route d={polyD(p)} u={u} col={C.goldHi} w={8} />
        {k >= 1 ? <Arrowhead p={home[home.length - 2]} q={T} u={u} col={C.goldHi} /> : null}
        <Dot p={UK} u={u} t={t} />
        <MapIsland p={T} u={u} size={2} />
        <Dot p={T} u={u} t={t} col={C.goldHi} r={9} />
      </MapView>
      <Tag c={c} p={T} text="PULANG" t={t} t0={71.4} dy={50} gold />
    </>
  );
};

// ── S14 Calshot Harbour ───────────────────────────────────────────────────────────────────
export const S14: React.FC<SceneProps> = ({ t, lt }) => {
  const sign = expoOut(ramp(t, 74.2, 74.8));
  const bob = Math.sin(t * 2) * 6;
  return (
    <Frame>
      <Sky id="s14" top="#16203A" mid="#465070" glow="#E8A964" horizon={1200} />
      <g transform={cam(1.08 - lt * 0.012, 540, 1100, lt * 14)}>
        <g transform="translate(700,1210) scale(1.2)"><Volcano t={t} /></g>
        <Cloud x={620} y={700} w={330} o={0.8} />
        <path d="M-80,1200 C300,1180 800,1190 1200,1205 L1200,1260 L-80,1260Z" fill="#5C6B3E" />
        {[180, 330, 980].map((x, i) => <g key={x} transform={`translate(${x},${1226})`}><House roof={i % 2 ? C.roofGrn : C.roofRed} s={0.45} /></g>)}
        <Sea y={1250} t={t} />
        {/* breakwater + quay */}
        <P d="M-80,1300 L520,1300 L560,1360 L-80,1360Z" fill={C.stone} />
        <P d="M520,1300 L760,1240 L800,1270 L560,1360Z" fill={C.stoneLt} depth={0.8} />
        <g transform={`translate(760,${1370 + bob}) scale(0.42)`}><Ship /></g>
        {/* sign board */}
        <g transform={`translate(270,${1300 - 260 * sign}) rotate(${(1 - sign) * -8})`} opacity={sign}>
          <rect x={-8} y={60} width={16} height={200} fill="#3E2A19" />
          <rect x={150} y={60} width={16} height={200} fill="#3E2A19" />
          <Lit draw={(cl) => <rect x={-110} y={-70} width={380} height={140} rx={8} fill={cl ?? "#EFE2C4"} />} />
          <rect x={-100} y={-60} width={360} height={120} fill="none" stroke={C.redDk} strokeWidth={5} />
          <text x={80} y={-6} textAnchor="middle" fontFamily="Anton" fontSize={56} fill={C.ink} letterSpacing={2}>CALSHOT</text>
          <text x={80} y={46} textAnchor="middle" fontFamily="Anton" fontSize={42} fill={C.redDk} letterSpacing={6}>HARBOUR</text>
        </g>
      </g>
    </Frame>
  );
};

// ── S15 Outro: dusk silhouette + cartouche AUDIRA · FAKTA DUNIA ───────────────────────────
export const S15: React.FC<SceneProps> = ({ t, lt }) => {
  const k = expoOut(ramp(lt, 0.4, 1.3));
  return (
    <>
    <Frame>
      <Sky id="s15" top="#141A2E" mid="#5A4A66" glow="#F0A15A" horizon={1240} />
      <circle cx={190} cy={1150} r={100} fill="#FFC27A" opacity={0.9} />
      <circle cx={190} cy={1150} r={200} fill="#FFC27A" opacity={0.2} />
      <g transform={cam(1 + lt * 0.018, 540, 1240, -lt * 6)}>
        <g transform="translate(660,1250) scale(0.85)"><Volcano silhouette="#1A1E2C" /></g>
        {[560, 620, 690].map((x) => <rect key={x} x={x} y={1228} width={14} height={10} fill="#FFD08A" />)}
        <Sea y={1245} t={t} col="#2A2B3E" light="#B77B55" />
        <path d="M190,1250 L250,1600 L130,1600Z" fill="#FFC27A" opacity={0.22} />
      </g>
      {/* cartouche */}
      <g transform={`translate(540,600) scale(${0.85 + 0.15 * k})`} opacity={k}>
        <Lit draw={(c) => <path d="M-380,-70 L380,-70 L420,0 L380,70 L-380,70 L-420,0Z" fill={c ?? "rgba(14,18,26,.94)"} />} />
        <path d="M-370,-58 L370,-58 L404,0 L370,58 L-370,58 L-404,0Z" fill="none" stroke={C.gold} strokeWidth={4} />
      </g>
    </Frame>
    <div style={{ position: "absolute", left: 540 - 380, top: 600 - 58, width: 760, height: 116, display: "flex", alignItems: "center", justifyContent: "center",
      color: C.cream, fontFamily: "Anton", fontSize: 64, letterSpacing: 6, whiteSpace: "nowrap", opacity: k, transform: `scale(${0.85 + 0.15 * k})` }}>AUDIRA · FAKTA DUNIA</div>
    </>
  );
};

export const SCENE_MAP: Record<string, React.FC<SceneProps>> = { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15 };
