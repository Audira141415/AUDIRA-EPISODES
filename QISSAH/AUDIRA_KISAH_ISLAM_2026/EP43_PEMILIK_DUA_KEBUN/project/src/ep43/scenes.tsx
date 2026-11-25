// EP43 Pemilik Dua Kebun (QS Al-Kahfi 32–45) — scenes S1–S11. Each gets global t (s) and local lt (s since scene start),
// draws in 1080 × 1920. Lighting rule: key light upper-left on every set (Rays + LightPool), long cast shadows via P/Layered.
// Camera never parks: elliptic orbit (same frequency on both axes) + forward zoom, with parallax factor per plane.
// Adab: every person is a faceless paper silhouette (Robed). In-scene brand: AUDIRA board on the garden gate (S1, S5) + plaque (S11).
import React from "react";
import { C, P, PaperDefs, Layered, LightPool, Rays, Coin, Rain, blob, circle, ellipse, rect, wave, hash, ramp, ease, easeOut, lerp, mix, clamp01 } from "./pieces";
import { Robed, Vineyard, DatePalm, Field, Basket, AyahCard, Hand, Plant, Leaf, Gate, River, star8, dropPath, Grapes } from "./garden";

export type SceneProps = { t: number; lt: number };

const Frame: React.FC<{ children: React.ReactNode; bg?: [string, string]; id: string; vig?: number }> = ({ children, bg, id, vig = 0.4 }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <PaperDefs />
    {bg ? (
      <>
        <defs>
          <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={bg[0]} />
            <stop offset="0.7" stopColor={bg[1]} />
          </linearGradient>
        </defs>
        <rect width={1080} height={1920} fill={`url(#bg-${id})`} />
      </>
    ) : null}
    {children}
    <defs>
      <radialGradient id={`vig-${id}`} cx="0.5" cy="0.44" r="0.75">
        <stop offset="0.5" stopColor="#2A1A10" stopOpacity="0" />
        <stop offset="1" stopColor="#2A1A10" stopOpacity={vig} />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill={`url(#vig-${id})`} />
  </svg>
);

/** Camera: elliptic orbit (dx=sin(1.1lt)*24, dy=cos(1.1lt)*28, speed never zero) + zoom s0+k*lt. f = parallax factor. */
const orb = (lt: number, f = 1, ox = 540, oy = 1000, s0 = 1.05, k = 0.012, tx = 0, ty = 0, rot = 0) =>
  `translate(${(ox + tx + Math.sin(1.1 * lt) * 24 * f).toFixed(2)},${(oy + ty + Math.cos(1.1 * lt) * 28 * f).toFixed(2)}) rotate(${rot}) scale(${(s0 + k * lt * f).toFixed(4)}) translate(${-ox},${-oy})`;

const Sun: React.FC<{ x: number; y: number; r: number; col?: string }> = ({ x, y, r, col = C.gold }) => (
  <g>
    <path d={circle(x, y, r * 1.7)} fill={mix(col, "#ffffff", 0.55)} opacity={0.3} filter="url(#psoft)" />
    <P d={circle(x, y, r)} fill={col} noShadow />
  </g>
);

const Cloud: React.FC<{ x: number; y: number; s?: number; seed?: number; col?: string }> = ({ x, y, s = 1, seed = 1, col = "#FFFFFF" }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <P d={blob(80, seed, 12, 0.2, 1.9, 0.75)} fill={col} depth={0.6} />
    <g transform="translate(-60,10)"><P d={blob(60, seed + 4, 10, 0.2, 1.4, 0.8)} fill={mix(col, "#ffffff", 0.3)} depth={0.4} /></g>
  </g>
);

const Hills: React.FC<{ y: number; seed: number; col?: string; amp?: number; depth?: number }> = ({ y, seed, col = C.leafLt, amp = 50, depth = 1 }) => {
  let d = `M-200,2200 L-200,${y}`;
  for (let x = -200; x <= 1300; x += 30) d += ` L${x},${(y + Math.sin(x / 240 + seed) * amp + Math.sin(x / 90 + seed * 2.1) * amp * 0.25).toFixed(1)}`;
  return <P d={d + " L1300,2200Z"} fill={col} depth={depth} />;
};

/** Far paper mountain range (BG plane): jagged ridges, pale + cool, sun-lit left faces. */
const Mountains: React.FC<{ y: number; seed: number; col?: string; h?: number; x0?: number; x1?: number }> = ({ y, seed, col = "#9DB9B4", h = 260, x0 = -200, x1 = 1300 }) => {
  let d = `M${x0},${y + 400} L${x0},${y}`;
  let lit = "";
  for (let x = x0, i = 0; x <= x1; x += 260, i++) {
    const peak = y - h * (0.5 + 0.5 * hash(seed + i * 3.1));
    const xp = x + 110 + 40 * hash(seed + i * 9.2);
    const sad = y - h * (0.12 + 0.2 * hash(seed + i * 5.7));
    d += ` L${(xp - 30).toFixed(1)},${(peak + 18).toFixed(1)} L${xp.toFixed(1)},${peak.toFixed(1)} L${(xp + 36).toFixed(1)},${(peak + 26).toFixed(1)} L${x + 260},${sad.toFixed(1)}`;
    lit += `M${xp.toFixed(1)},${peak.toFixed(1)} L${(xp - 30).toFixed(1)},${(peak + 18).toFixed(1)} L${x + 20},${y} L${(xp + 10).toFixed(1)},${y}Z `;
  }
  return (
    <g>
      <P d={d + ` L${x1},${y + 400}Z`} fill={col} depth={0.5} />
      <path d={lit} fill="#FFF3D6" opacity={0.28} />
    </g>
  );
};

/** Atmospheric haze band (only between BG and MG planes). */
const Haze: React.FC<{ y: number; h?: number; col?: string; op?: number }> = ({ y, h = 260, col = "#F7EBD6", op = 0.6 }) => (
  <rect x={-300} y={y - h / 2} width={1700} height={h} fill={col} opacity={op} filter="url(#psoft)" />
);

/** Out-of-focus FG vine leaves at frame corners (DOF plane, drifts faster than camera). */
const FGFoliage: React.FC<{ t: number; col?: string; side?: "both" | "left" | "right"; y?: number }> = ({ t, col = "#3F6A3A", side = "both", y = 1700 }) => {
  const sway = Math.sin(t * 0.9) * 10;
  const leaf = (i: number) => blob(120, 90 + i * 3, 10, 0.3, 1.9, 0.6);
  return (
    <g filter="url(#pdof)" opacity={0.92}>
      {side !== "right" ? [0, 1, 2].map((i) => (
        <path key={`l${i}`} d={leaf(i)} fill={mix(col, "#000000", i * 0.08)} transform={`translate(${-40 + i * 70 + sway},${y + 60 - i * 110}) rotate(${-28 + i * 16})`} />
      )) : null}
      {side !== "left" ? [0, 1, 2].map((i) => (
        <path key={`r${i}`} d={leaf(i + 4)} fill={mix(col, "#000000", i * 0.08)} transform={`translate(${1120 - i * 70 - sway},${y + 40 - i * 120}) rotate(${200 - i * 16})`} />
      )) : null}
    </g>
  );
};

/** Paper label tag on a string (in-scene label, ≥ 34 px). */
const Tag: React.FC<{ x: number; y: number; text: string; op?: number; col?: string; size?: number }> = ({ x, y, text, op = 1, col = C.teal, size = 40 }) => {
  if (op <= 0.01) return null;
  const w = text.length * size * 0.5 + 56;
  return (
    <g transform={`translate(${x},${y + (1 - op) * 24})`} opacity={op}>
      <Layered depth={0.4} draw={(o) => <path d={rect(-w / 2, -size * 0.8, w, size * 1.45)} fill={o ?? C.paper} />} />
      <path d={rect(-w / 2, -size * 0.8, 12, size * 1.45)} fill={col} />
      <text x={6} y={size * 0.38} textAnchor="middle" fontFamily="Anton" fontSize={size} fill={C.ink} letterSpacing={2}>{text}</text>
    </g>
  );
};

/** Wind-blown paper leaves crossing the frame left → right while k in 0..1. */
const Gust: React.FC<{ k: number; n?: number; y0?: number; h?: number; seed?: number; big?: number }> = ({ k, n = 12, y0 = 600, h = 800, seed = 1, big = 1 }) => {
  if (k <= 0 || k >= 1) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = -200 + (k * 1.6 - hash(seed + i) * 0.5) * 1500;
        const y = y0 + hash(seed + i * 3.7) * h + Math.sin(k * 9 + i) * 40;
        const col = i % 3 === 0 ? C.vine : i % 3 === 1 ? C.ochre : C.straw;
        return <g key={i} transform={`translate(${x},${y})`}><Leaf col={col} s={(0.8 + hash(seed + i * 9) * 0.9) * big} rot={k * 720 + i * 40} /></g>;
      })}
    </g>
  );
};

/** Back row of date palms (ring behind the vines). */
const PalmRow: React.FC<{ t: number; y: number; xs: number[]; s?: number; dry?: number; bend?: number }> = ({ t, y, xs, s = 0.6, dry = 0, bend = 0 }) => (
  <g>
    {xs.map((x, i) => (
      <g key={i} transform={`translate(${x},${y + (i % 2) * 18}) scale(${s * (0.9 + hash(i * 2.2) * 0.2)})`}><DatePalm h={320} t={t} seed={i + 1} dry={dry} bend={bend} /></g>
    ))}
  </g>
);

// ── S1 Hook 0–10.1: two vineyards, a river through the AUDIRA gate, full basket; "Ia keliru" gust ──────────
export const S1: React.FC<SceneProps> = ({ t, lt }) => {
  const gust = ramp(lt, 8.6, 10.1);
  const dim = 0.2 * ease(ramp(lt, 8.8, 9.6));
  return (
    <Frame id="s1" bg={[C.sky, C.skyWarm]}>
      <g transform={orb(lt, 0.4, 540, 1000, 1.03, 0.006)}>
        <Sun x={210} y={560} r={66} />
        <Cloud x={830} y={540} s={0.9} seed={2} />
        <Mountains y={880} seed={4.1} h={420} />
        <Haze y={870} h={170} op={0.5} />
      </g>
      <g transform={orb(lt, 1, 540, 1150, 1.05, 0.02)}>
        <Hills y={900} seed={1.7} col={C.leafLt} amp={30} depth={0.6} />
        <P d={wave(960, 8, 520, 0.6)} fill={C.land} depth={0.5} />
        <PalmRow t={t} y={975} xs={[40, 170, 300, 790, 920, 1050]} s={0.62} />
        <g transform="translate(540,980) scale(0.62)"><Gate /></g>
        <River t={t} x={540} y0={975} y1={2000} w0={60} w1={380} />
        <g transform="translate(30,1260)"><Vineyard w={390} h={250} t={t} seed={1} /></g>
        <g transform="translate(660,1260)"><Vineyard w={390} h={250} t={t} seed={5} /></g>
        <g transform="translate(900,1400) scale(0.85)"><Basket /></g>
        <LightPool x={420} y={1120} rx={480} ry={220} op={0.4} />
      </g>
      <Gust k={gust} n={14} y0={640} h={760} seed={3} big={1.3} />
      <FGFoliage t={t} />
      <Rays x={-120} y={-80} op={0.24} t={t} />
      <rect width={1080} height={1920} fill={C.night} opacity={dim} />
    </Frame>
  );
};

// ── S2 10.1–15.45: verse card QS 18:32 + two men on a hill (owner purple-gold, friend ivory) ────────────────
export const S2: React.FC<SceneProps> = ({ t, lt }) => {
  const pan = lerp(60, -60, ease(lt / 5.35));
  const cardIn = easeOut(ramp(lt, 0.1, 0.7));
  const menIn = easeOut(ramp(lt, 0.5, 1.4));
  const tags = ease(ramp(lt, 3.9, 4.4));
  return (
    <Frame id="s2" bg={["#F4D9AE", C.skyWarm]}>
      <g transform={orb(lt, 0.4, 540, 1000, 1.03, 0.006, pan * 0.4)}>
        <Sun x={870} y={580} r={56} col="#F5C46B" />
        <Mountains y={1030} seed={7.7} h={380} col="#B4B6A2" />
        <Haze y={1020} h={180} op={0.5} />
      </g>
      <g transform={orb(lt, 1, 540, 1200, 1.05, 0.012, pan)}>
        <Hills y={1090} seed={2.4} col={C.leafLt} amp={50} />
        <g transform="translate(720,1120) scale(0.42)"><Vineyard w={520} h={260} t={t} seed={7} /></g>
        <g transform="translate(40,1130) scale(0.36)"><Vineyard w={520} h={260} t={t} seed={8} /></g>
        <Hills y={1230} seed={5.2} col={C.leaf} amp={26} depth={0.8} />
        <LightPool x={540} y={1250} rx={420} ry={160} op={0.45} />
        <g transform={`translate(360,${1330 + (1 - menIn) * 50})`} opacity={menIn}><Robed pose="stand" s={2.05} /></g>
        <g transform={`translate(740,${1330 + (1 - menIn) * 50})`} opacity={menIn}><Robed pose="staff" color={C.ivoryRobe} trim={C.teal} turban="#FFFFFF" s={1.9} /></g>
        <Tag x={360} y={1376} text="PEMILIK KEBUN" op={tags} col={C.robe} size={36} />
        <Tag x={740} y={1376} text="TEMANNYA" op={tags} size={36} />
      </g>
      <g transform={`translate(540,${480 - (1 - cardIn) * 80}) scale(${0.74 + 0.08 * cardIn})`} opacity={cardIn}>
        <AyahCard w={900} h={400} title="QS AL-KAHFI 18:32" lines={["PERUMPAMAAN", "DUA ORANG LELAKI"]} size={78} />
      </g>
      <FGFoliage t={t} side="left" />
      <Rays x={-120} y={-80} op={0.22} t={t} />
    </Frame>
  );
};

// ── S3 15.45–25.9: garden layout (vines, ring of date palms, fields, river) → close-up of full clusters ─────
export const S3: React.FC<SceneProps> = ({ t, lt }) => {
  const close = ease(ramp(lt, 6.5, 7.2));
  const fruit = easeOut(ramp(lt, 6.8, 8.6));
  return (
    <>
      {close < 1 ? (
        <Frame id="s3a" bg={[C.sky, C.skyWarm]}>
          <g opacity={1 - close}>
            <g transform={orb(lt, 0.4, 540, 900, 1.02, 0.006)}>
              <Cloud x={260} y={420} s={0.8} seed={4} />
              <Mountains y={700} seed={2.2} h={300} />
              <Haze y={700} h={150} op={0.5} />
            </g>
            <g transform={orb(lt, 1, 540, 1050, 1.04, 0.03)}>
              <P d={wave(720, 8, 500, 1.4)} fill={C.land} depth={0.5} />
              <PalmRow t={t} y={760} xs={[60, 190, 320, 450, 630, 760, 890, 1020]} s={0.55} />
              <River t={t} x={540} y0={740} y1={2000} w0={40} w1={260} />
              <g transform="translate(50,1020)"><Vineyard w={340} h={210} t={t} seed={2} grapeR={9} /></g>
              <g transform="translate(690,1020)"><Vineyard w={340} h={210} t={t} seed={6} grapeR={9} /></g>
              <Field x0={110} x1={450} y0={1090} y1={1330} t={t} />
              <Field x0={630} x1={970} y0={1090} y1={1330} t={t} />
              <g transform="translate(-30,1380) scale(0.72)"><DatePalm h={320} t={t} seed={9} /></g>
              <g transform="translate(1100,1380) scale(0.72)"><DatePalm h={320} t={t} seed={10} /></g>
              <LightPool x={420} y={1000} rx={480} ry={240} op={0.4} />
              <Tag x={225} y={760} text="ANGGUR" op={ease(ramp(lt, 1.4, 1.9))} col={C.grape} />
              <Tag x={860} y={560} text="KURMA" op={ease(ramp(lt, 2.9, 3.4))} col="#B8521F" />
              <Tag x={280} y={1220} text="LADANG" op={ease(ramp(lt, 5.1, 5.6))} col={C.leafDk} />
              <Tag x={800} y={1220} text="LADANG" op={ease(ramp(lt, 5.3, 5.8))} col={C.leafDk} />
            </g>
            <FGFoliage t={t} />
          </g>
          <Rays x={-120} y={-80} op={0.22} t={t} />
        </Frame>
      ) : null}
      {close > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: close }}>
          <Frame id="s3b" bg={["#CFE6C8", "#F3E6C6"]}>
            <g transform={orb(lt - 6.5, 0.4, 540, 1000, 1.04, 0.01)}>
              <Hills y={1150} seed={3.1} col={C.leafLt} amp={40} depth={0.5} />
              <g filter="url(#pdof)"><PalmRow t={t} y={1180} xs={[120, 380, 700, 960]} s={0.9} /></g>
              <Haze y={1150} h={200} op={0.45} />
            </g>
            <g transform={orb(lt - 6.5, 1, 540, 900, 1.06, 0.02)}>
              <P d={rect(-200, 470, 1480, 30)} fill={C.woodLt} depth={0.8} />
              {Array.from({ length: 9 }, (_, i) => (
                <g key={i} transform={`translate(${-80 + i * 150},${470 + Math.sin(t * 1.1 + i) * 4})`}>
                  <P d={blob(110, 30 + i, 10, 0.24, 1.3, 0.6)} fill={i % 2 ? C.vine : mix(C.vine, "#ffffff", 0.16)} depth={0.6} />
                </g>
              ))}
              {[150, 420, 690, 950].map((x, i) => (
                <g key={i} transform={`translate(${x},${510 + (i % 2) * 40}) scale(${0.3 + 0.7 * clamp01(fruit * 1.4 - i * 0.12)})`}>
                  <Grapes r={34} seed={i * 3} col={i % 2 ? C.grape : C.grapeLt} sway={Math.sin(t * 1.3 + i) * 4} />
                </g>
              ))}
              <g transform="translate(560,1400)"><Robed pose="stand" s={2.1} /></g>
              <g transform="translate(250,1380) scale(1.25)"><Basket /></g>
              <g transform="translate(820,1390) scale(1.05)">
                <Layered depth={0.5} draw={(o) => (
                  <g>{Array.from({ length: 12 }, (_, j) => <path key={j} d={ellipse((j % 4) * 26 - 40, -20 - Math.floor(j / 4) * 22, 13, 17)} fill={o ?? (j % 2 ? "#D9702C" : "#B8521F")} />)}</g>
                )} />
              </g>
              <LightPool x={420} y={760} rx={420} ry={260} op={0.45} />
            </g>
            <FGFoliage t={t} col="#4A7A40" />
            <Rays x={-120} y={-80} op={0.26} t={t} />
          </Frame>
        </div>
      ) : null}
    </>
  );
};

// ── S4 25.9–31.2: low angle — owner boasting on a stone terrace, coins pile up, followers appear ─────────────
export const S4: React.FC<SceneProps> = ({ t, lt }) => {
  const coins = ease(ramp(lt, 1.7, 3.4));
  const fol = (i: number) => easeOut(ramp(lt, 3.7 + i * 0.12, 4.3 + i * 0.12));
  return (
    <Frame id="s4" bg={["#E9A86A", "#F8DDB0"]}>
      <g transform={orb(lt, 0.4, 540, 1100, 1.03, 0.008)}>
        <Sun x={830} y={720} r={80} col="#F7B85A" />
        <Cloud x={250} y={600} s={1.0} seed={6} col="#FFF1DC" />
        <Mountains y={1240} seed={5.5} h={300} col="#C79A86" />
        <Haze y={1230} h={160} col="#F7D9B6" op={0.5} />
      </g>
      <g transform={orb(lt, 1, 540, 1000, 1.05, 0.022, 0, 0, -1.5)}>
        <Hills y={1250} seed={6.6} col={C.leaf} amp={20} depth={0.6} />
        {Array.from({ length: 7 }, (_, i) => {
          const k = fol(i);
          if (k <= 0) return null;
          const x = 90 + i * 150;
          return <g key={i} transform={`translate(${x},${1270 + (1 - k) * 60})`} opacity={k}><Robed pose="stand" color={i % 2 ? "#4A3A5A" : "#5A4868"} trim="#9A7A50" turban="#D9CBB2" s={0.95} /></g>;
        })}
        <P d="M170,1300 L910,1300 L980,1600 L100,1600Z" fill={C.stone} depth={1} />
        <path d="M170,1300 L910,1300 L918,1334 L162,1334Z" fill={mix(C.stone, "#ffffff", 0.3)} />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M${230 + i * 190},1340 L${215 + i * 200},1600`} stroke={C.stoneDk} strokeWidth={4} opacity={0.6} />)}
        {[0, 1, 2].map((c) => {
          const n = Math.round(coins * (5 + c * 2));
          return (
            <g key={c} transform={`translate(${720 + c * 80},${1300 - c * 6})`}>
              {Array.from({ length: n }, (_, j) => (
                <g key={j} transform={`translate(0,${-j * 20})`}>
                  <Layered depth={0.25} draw={(o) => <g><path d={ellipse(0, 0, 46, 15)} fill={o ?? "#C98A2E"} /><path d={ellipse(0, -6, 46, 15)} fill={o ?? C.gold} /></g>} />
                </g>
              ))}
            </g>
          );
        })}
        {coins > 0.3 ? <g transform={`translate(800,${1080 - coins * 40})`}><Coin r={54} spin={t * 2.2} /></g> : null}
        <g transform="translate(470,1310)"><Robed pose="boast" s={2.5} /></g>
        <g transform="translate(130,1430)"><Robed pose="stand" color={C.ivoryRobe} trim={C.teal} turban="#FFFFFF" s={1.05} /></g>
        <LightPool x={470} y={1000} rx={300} ry={360} op={0.4} />
      </g>
      <Rays x={-120} y={-80} op={0.26} t={t} />
    </Frame>
  );
};

// ── S5 31.2–41.0: owner walks through the AUDIRA gate into his garden, arms spread under a hard sun ─────────
export const S5: React.FC<SceneProps> = ({ t, lt }) => {
  const track = lerp(0, 240, ease(ramp(lt, 0, 4.4)));
  const walkK = ease(ramp(lt, 0.2, 4.2));
  const ox = lerp(160, 640, walkK);
  const walking = lt < 4.2;
  const spreadArm = ease(ramp(lt, 4.3, 5.0)) * 30;
  const pose = lt < 4.2 ? "walk" : lt < 7.2 ? "spread" : "point";
  return (
    <Frame id="s5" bg={["#F4BE62", "#FBE6BC"]}>
      <g transform={orb(lt, 0.4, 540, 1000, 1.03, 0.006, -track * 0.25)}>
        <path d={circle(820, 560, 190)} fill="#FFF2C8" opacity={0.5} filter="url(#psoft)" />
        <Sun x={820} y={560} r={96} col="#FBC85A" />
        <Mountains y={1060} seed={9.1} h={330} col="#C7AE8A" x0={-200} x1={1800} />
        <Haze y={1050} h={170} op={0.55} />
      </g>
      <g transform={orb(lt, 1, 540, 1150, 1.05, 0.012, -track)}>
        <Hills y={1120} seed={8.2} col={C.leafLt} amp={30} depth={0.6} />
        <P d={rect(-200, 1180, 2000, 900)} fill={C.land} depth={0.4} />
        <PalmRow t={t} y={1190} xs={[700, 860, 1020, 1180, 1340]} s={0.6} />
        <g transform="translate(640,1290)"><Vineyard w={420} h={240} t={t} seed={11} /></g>
        <g transform="translate(1100,1290)"><Vineyard w={420} h={240} t={t} seed={12} /></g>
        <g transform="translate(420,1320) scale(0.95)"><Gate /></g>
        <g transform={`translate(${ox},1350)`}><Robed pose={pose} step={walking ? Math.sin(lt * 7) : 0} arm={pose === "point" ? -42 : spreadArm} s={1.7} /></g>
        <LightPool x={760} y={1150} rx={520} ry={200} col="#FFE9A8" op={0.5} />
      </g>
      <FGFoliage t={t} side="right" />
      <Rays x={-120} y={-80} op={0.3} t={t} col="#FFF0C0" />
    </Frame>
  );
};

// ── S6 41.0–46.5: dusk — the friend answers; soil cross-section → a figure from earth → a drop of water ──────
export const S6: React.FC<SceneProps> = ({ t, lt }) => {
  const rise = easeOut(ramp(lt, 1.6, 3.2));
  const drop = ramp(lt, 4.1, 4.9);
  const dropIn = ease(ramp(lt, 3.9, 4.3));
  const zoomK = ease(ramp(lt, 3.8, 5.5));
  return (
    <Frame id="s6" bg={["#C98E86", "#F2CBA8"]}>
      <g transform={orb(lt, 0.4, 540, 1000, 1.03, 0.006)}>
        <Sun x={180} y={980} r={70} col="#F3A066" />
        <Mountains y={1120} seed={3.9} h={300} col="#9A7E8E" />
        <Haze y={1110} h={170} col="#F2D0B8" op={0.5} />
      </g>
      <g transform={orb(lt, 1, 760, 900, 1.05 + zoomK * 0.14, 0.012)}>
        <Hills y={1160} seed={4.4} col="#7E9A6A" amp={30} />
        <g transform="translate(250,1390)"><Robed pose="staff" color={C.ivoryRobe} trim={C.teal} turban="#FFFFFF" s={1.9} /></g>
        <g transform="translate(560,600)">
          <Layered depth={0.8} draw={(o) => <path d={rect(0, 0, 460, 640)} fill={o ?? C.paper} />} />
          <defs><clipPath id="soilclip"><path d={rect(16, 16, 428, 608)} /></clipPath></defs>
          <g clipPath="url(#soilclip)">
            <rect x={16} y={16} width={428} height={200} fill="#CFE4E6" />
            <P d={wave(210, 6, 160, 0.5, 0, 460, 640)} fill={C.leaf} depth={0.3} />
            <P d={wave(250, 8, 200, 1.1, 0, 460, 640)} fill={C.earth} depth={0.4} />
            <P d={wave(380, 10, 240, 2.3, 0, 460, 640)} fill={C.earthDk} depth={0.4} />
            <P d={wave(510, 8, 180, 3.1, 0, 460, 640)} fill="#5A3C28" depth={0.4} />
            {Array.from({ length: 12 }, (_, i) => <path key={i} d={circle(40 + hash(i * 2.7) * 380, 300 + hash(i * 5.1) * 300, 6 + hash(i) * 9)} fill={C.stoneDk} />)}
            <g transform={`translate(230,${lerp(560, 250, rise)})`} opacity={clamp01(rise * 2)}>
              <Robed pose="stand" color={C.earth} trim={C.earthDk} turban={mix(C.earth, "#ffffff", 0.3)} s={0.85} />
            </g>
          </g>
          <path d={rect(16, 16, 428, 608)} fill="none" stroke={C.teal} strokeWidth={5} />
          {dropIn > 0 ? (
            <g opacity={dropIn}>
              <path d={circle(230, lerp(-60, 120, ease(drop)), 120)} fill="#BFF3F0" opacity={0.45} filter="url(#pglow)" />
              <g transform={`translate(230,${lerp(-60, 120, ease(drop))})`}><P d={dropPath(46)} fill="#5FC8D8" depth={0.5} /></g>
              {drop >= 1 ? [0, 1].map((i) => {
                const k = clamp01((lt - 4.9 - i * 0.2) / 0.8);
                return <path key={i} d={ellipse(230, 210, 40 + k * 150, 10 + k * 30)} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={1 - k} />;
              }) : null}
            </g>
          ) : null}
        </g>
        <LightPool x={420} y={1000} rx={420} ry={300} col="#FFD9A8" op={0.4} />
      </g>
      <FGFoliage t={t} side="left" col="#4A5A38" />
      <Rays x={-120} y={-80} op={0.18} t={t} col="#FFE0C0" />
    </Frame>
  );
};

// ── S7 46.5–55.75: ornament card MASYA ALLAH · LA QUWWATA ILLA BILLAH (18:39) over the golden garden ─────────
export const S7: React.FC<SceneProps> = ({ t, lt }) => {
  const tilt = lerp(140, 0, ease(ramp(lt, 0, 3)));
  const cardIn = easeOut(ramp(lt, 0.3, 1.0));
  const l1 = ease(ramp(lt, 2.6, 3.0));
  const l2 = ease(ramp(lt, 3.8, 4.3));
  const l3 = ease(ramp(lt, 6.5, 7.0));
  const track = lerp(110, -110, ease(ramp(lt, 0, 9.3)));
  return (
    <Frame id="s7" bg={["#F0BE84", "#F8E4C6"]}>
      <g transform={orb(lt, 0.4, 540, 1000, 1.03, 0.01, track * 0.35, tilt * 0.4)}>
        <Sun x={540} y={1050} r={110} col="#F8C870" />
        <Mountains y={1140} seed={6.3} h={320} col="#C7A28A" />
        <Haze y={1130} h={180} op={0.55} />
      </g>
      <g transform={orb(lt, 1.6, 540, 1200, 1.05, 0.03, track, tilt)}>
        <Hills y={1180} seed={7.1} col={C.leafLt} amp={30} depth={0.6} />
        <PalmRow t={t} y={1210} xs={[60, 200, 880, 1020]} s={0.6} />
        <g transform="translate(-60,1330) scale(0.8)"><Vineyard w={440} h={250} t={t} seed={14} /></g>
        <g transform="translate(760,1330) scale(0.8)"><Vineyard w={440} h={250} t={t} seed={15} /></g>
        <g transform="translate(400,1320)"><Robed pose="staff" color={C.ivoryRobe} trim={C.teal} turban="#FFFFFF" s={1.7} /></g>
        <g transform="translate(680,1320)"><Robed pose="stand" s={1.8} /></g>
        <LightPool x={540} y={1240} rx={420} ry={180} col="#FFE7B0" op={0.5} />
      </g>
      <g transform={`translate(${540 + Math.sin(0.9 * lt) * 14},${540 - (1 - cardIn) * 90 + Math.cos(0.9 * lt) * 10}) rotate(${Math.sin(0.6 * lt) * 1.2}) scale(${0.72 + 0.06 * cardIn + 0.004 * lt})`} opacity={cardIn}>
        <path d={star8(0, 0, 420, 0.8)} fill="#FFF3D0" opacity={0.5} filter="url(#pglow)" />
        <AyahCard w={960} h={560} title="QS AL-KAHFI 18:39" />
        <text x={0} y={-60} textAnchor="middle" fontFamily="Anton" fontSize={104} fill={C.teal} letterSpacing={4} opacity={l1}>MASYA ALLAH</text>
        <text x={0} y={46} textAnchor="middle" fontFamily="Anton" fontSize={66} fill={C.ink} letterSpacing={2} opacity={l2}>LA QUWWATA ILLA BILLAH</text>
        <text x={0} y={128} textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize={38} fill="#5A3E2C" opacity={l3}>Tiada kekuatan kecuali</text>
        <text x={0} y={176} textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize={38} fill="#5A3E2C" opacity={l3}>dengan pertolongan Allah</text>
      </g>
      <FGFoliage t={t} />
      <Rays x={-120} y={-80} op={0.24} t={t} />
    </Frame>
  );
};

// ── S8 55.75–59.8: storm — lightning, the trellises snap and fall, river shrinks; pull-back ──────────────────
export const S8: React.FC<SceneProps> = ({ t, lt }) => {
  const fall = ease(ramp(lt, 1.8, 3.4));
  const flash = Math.max(1 - Math.abs(lt - 0.4) / 0.18, 1 - Math.abs(lt - 2.2) / 0.18, 0);
  const shake = (0.4 + fall * 0.6) * (1 - ramp(lt, 3.5, 4.0));
  const sx = Math.sin(t * 43) * 7 * shake, sy = Math.cos(t * 37) * 5 * shake;
  return (
    <Frame id="s8" bg={[C.stormDk, C.storm]} vig={0.55}>
      <g transform={orb(lt, 0.4, 540, 1000, 1.06, -0.01)}>
        {[[200, 520, 1.5, 3], [760, 600, 1.4, 8], [480, 760, 1.2, 12]].map(([x, y, s, sd], i) => (
          <g key={i} transform={`translate(${Math.sin(t * 0.6 + i) * 30},0)`}><Cloud x={x} y={y} s={s} seed={sd} col={i % 2 ? "#6A7488" : "#56607A"} /></g>
        ))}
        {flash > 0 ? <path d="M640,420 L590,620 L650,640 L560,900 L700,600 L640,590 L700,420Z" fill="#FFFBE8" opacity={flash} filter="url(#pcontact)" /> : null}
        <Mountains y={1080} seed={1.9} h={300} col="#4E5A6E" />
      </g>
      <g transform={`translate(${sx},${sy})`}>
        <g transform={orb(lt, 1, 540, 1150, 1.2, -0.04)}>
          <Hills y={1100} seed={2.8} col="#4F6A52" amp={30} depth={0.6} />
          <P d={rect(-200, 1150, 1500, 900)} fill={mix(C.land, C.storm, 0.35)} depth={0.4} />
          <PalmRow t={t * 3} y={1160} xs={[80, 230, 850, 1000]} s={0.6} bend={-16} />
          <River t={t} x={540} y0={1150} y1={2000} w0={40} w1={300} level={lerp(1, 0.35, fall)} />
          <g transform="translate(20,1330)"><Vineyard w={430} h={250} t={t * 3} seed={1} collapse={fall} dry={fall * 0.3} /></g>
          <g transform="translate(630,1330)"><Vineyard w={430} h={250} t={t * 3} seed={5} collapse={fall} dry={fall * 0.3} /></g>
          {fall > 0.05 ? Array.from({ length: 10 }, (_, i) => {
            const k = clamp01(fall * 1.4 - hash(i) * 0.4);
            return <g key={i} transform={`translate(${80 + i * 95},${lerp(1110, 1400, k)}) rotate(${k * 120})`}><Grapes r={9} seed={i} /></g>;
          }) : null}
        </g>
      </g>
      <Gust k={ramp(lt, 0.2, 4.0)} n={16} y0={600} h={900} seed={21} />
      <Rain t={t} n={90} op={0.75} />
      <rect width={1080} height={1920} fill="#FFFFFF" opacity={flash * 0.35} />
    </Frame>
  );
};

// ── S9 59.8–71.0: close-up hands turning over → quote card 18:42 + kneeling owner → alone in the ruins ───────
export const S9: React.FC<SceneProps> = ({ t, lt }) => {
  const b = ease(ramp(lt, 4.3, 4.9));
  const c = ease(ramp(lt, 8.9, 9.5));
  const quote = ease(ramp(lt, 4.6, 5.2)) * (1 - ease(ramp(lt, 8.7, 9.0)));
  const coinsK = ramp(lt, 2.2, 4.4);
  return (
    <>
      {b < 1 ? (
        <Frame id="s9a" bg={["#4E4860", "#8E7E7A"]} vig={0.5}>
          <g transform={orb(lt, 0.4, 540, 1000, 1.05, 0.01)} filter="url(#pdof)">
            <P d={rect(-200, 1050, 1500, 900)} fill="#6E6058" depth={0.3} />
            <g transform="translate(-40,1150) scale(1.3)"><Vineyard w={430} h={250} t={0} seed={1} collapse={1} dry={0.7} /></g>
            <g transform="translate(560,1180) scale(1.2)"><Vineyard w={430} h={250} t={0} seed={5} collapse={1} dry={0.7} /></g>
          </g>
          <g transform={orb(lt, 1, 540, 1200, 1.04, 0.02)}>
            <LightPool x={540} y={1100} rx={460} ry={300} col="#FFE0B0" op={0.5} />
            <g transform="translate(330,1400)"><Hand flip={Math.cos(lt * 2.6)} s={1.4} mirror /></g>
            <g transform="translate(760,1400)"><Hand flip={Math.cos(lt * 2.6 + 0.5)} s={1.4} /></g>
            {coinsK > 0 && coinsK < 1 ? Array.from({ length: 6 }, (_, i) => {
              const k = clamp01(coinsK * 1.5 - i * 0.1);
              return <g key={i} transform={`translate(${380 + i * 70},${lerp(900, 1520, k * k)})`} opacity={1 - k}><Coin r={30} spin={t * 4 + i} /></g>;
            }) : null}
          </g>
          <Rays x={-120} y={-80} op={0.14} t={t} />
        </Frame>
      ) : null}
      {b > 0 && c < 1 ? (
        <div style={{ position: "absolute", inset: 0, opacity: b }}>
          <Frame id="s9b" bg={["#8C8494", "#CDBBA8"]}>
            <g transform={orb(lt - 4.3, 0.4, 540, 1000, 1.03, 0.006)}>
              <Mountains y={1120} seed={8.8} h={280} col="#8C8696" />
              <Haze y={1110} h={170} col="#E8DCCC" op={0.5} />
            </g>
            <g transform={orb(lt - 4.3, 1, 540, 1250, 1.05, 0.014)}>
              <P d={rect(-200, 1160, 1500, 900)} fill="#B9A688" depth={0.4} />
              <g transform="translate(-20,1330) scale(0.9)"><Vineyard w={430} h={250} t={0} seed={2} collapse={1} dry={0.8} /></g>
              <g transform="translate(700,1330) scale(0.9)"><Vineyard w={430} h={250} t={0} seed={6} collapse={1} dry={0.8} /></g>
              <g transform="translate(540,1340)"><Robed pose="kneel" arm={Math.sin(t * 2) * 6} s={2.0} /></g>
              <LightPool x={540} y={1200} rx={300} ry={180} op={0.45} />
            </g>
            <g transform={`translate(540,${500 - (1 - quote) * 70}) scale(0.78)`} opacity={quote}>
              <AyahCard w={960} h={480} title="QS AL-KAHFI 18:42" lines={["\"ADUHAI, SEKIRANYA DULU", "AKU TIDAK MEMPERSEKUTUKAN", "TUHANKU\""]} size={60} accent={C.robe} />
            </g>
            <FGFoliage t={t} col="#5A5040" />
          </Frame>
        </div>
      ) : null}
      {c > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: c }}>
          <Frame id="s9c" bg={["#7E7C8E", "#C4B4A2"]} vig={0.5}>
            <g transform={orb(lt - 8.9, 0.4, 540, 1000, 1.08, -0.02)}>
              <Cloud x={300} y={560} s={1.2} seed={14} col="#9A98A8" />
              <Mountains y={1000} seed={2.6} h={260} col="#86889A" />
              <Haze y={990} h={160} col="#E2D8CC" op={0.5} />
            </g>
            <g transform={orb(lt - 8.9, 1, 540, 1150, 1.16, -0.05)}>
              <P d={rect(-200, 1030, 1500, 900)} fill="#B0A084" depth={0.4} />
              {[[-40, 1150], [380, 1110], [760, 1160], [120, 1330], [700, 1340]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x},${y}) scale(0.62)`}><Vineyard w={430} h={250} t={0} seed={i + 3} collapse={1} dry={0.85} /></g>
              ))}
              <River t={t} x={540} y0={1040} y1={2000} w0={10} w1={60} level={0.3} />
              <path d={ellipse(540, 1250, 70, 16)} fill="rgba(30,20,50,.3)" filter="url(#pcontact)" />
              <g transform="translate(540,1250)"><Robed pose="kneel" s={0.8} /></g>
              <LightPool x={540} y={1180} rx={160} ry={120} col="#FFE7B0" op={0.55} />
            </g>
            <Gust k={ramp(lt, 9.0, 11.2)} n={6} y0={700} h={600} seed={33} />
          </Frame>
        </div>
      ) : null}
    </>
  );
};

// ── S10 71.0–79.3: payoff 18:45 — rain → plants grow → dry → blown by the wind → everything withers ──────────
export const S10: React.FC<SceneProps> = ({ t, lt }) => {
  const sun = ease(ramp(lt, 2.0, 3.4));
  const dry = ease(ramp(lt, 3.7, 4.9));
  const blow = ramp(lt, 4.9, 6.3);
  const strip = ease(ramp(lt, 5.0, 6.2));
  const top = mix(mix("#7F93A8", "#BFE3E8", sun), "#E8B878", dry);
  const bot = mix(mix("#B4C2CC", C.skyWarm, sun), "#F3D7A6", dry);
  const track = -lt * 26;
  const plants = Array.from({ length: 21 }, (_, i) => ({ x: 40 + (i % 7) * 165 + (Math.floor(i / 7) % 2) * 80, y: 1150 + Math.floor(i / 7) * 110, i }));
  return (
    <Frame id="s10">
      <defs>
        <linearGradient id="bg-s10" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="0.7" stopColor={bot} /></linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#bg-s10)" />
      <g transform={orb(lt, 0.4, 540, 1000, 1.03, 0.006, track * 0.3)}>
        <g opacity={sun}><Sun x={240} y={620} r={70} col={mix(C.gold, "#F39A4A", dry)} /></g>
        <g opacity={1 - sun}><Cloud x={300} y={540} s={1.4} seed={5} col="#8E9AAE" /><Cloud x={860} y={620} s={1.2} seed={9} col="#9AA6B8" /></g>
        <Mountains y={1050} seed={5.8} h={300} col={mix("#93A9A6", "#C9A27E", dry)} x0={-200} x1={1700} />
        <Haze y={1040} h={170} op={0.5} />
      </g>
      <g transform={orb(lt, 1, 540, 1250, 1.05, 0.012, track)}>
        <P d={rect(-300, 1070, 1900, 900)} fill={mix("#8A6A44", "#B89A64", dry)} depth={0.4} />
        <Field x0={-260} x1={1500} y0={1080} y1={1420} rows={5} t={t} dry={dry} />
        {plants.map((p) => {
          const g = ease(ramp(lt, 2.2 + hash(p.i) * 0.5, 3.6)) * (1 - strip * 0.65);
          return <g key={p.i} transform={`translate(${p.x},${p.y}) scale(${0.8 + Math.floor(p.i / 7) * 0.2})`}><Plant g={g} dry={dry} seed={p.i} h={150} t={t + blow * 6} /></g>;
        })}
        {lt < 3 ? Array.from({ length: 12 }, (_, i) => {
          const k = ((lt * 1.6 + hash(i)) % 1);
          return <path key={i} d={ellipse(60 + hash(i * 4.4) * 1000, 1120 + hash(i * 2.2) * 300, 10 + k * 40, 3 + k * 9)} fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={(1 - k) * 0.7 * (1 - ramp(lt, 2.4, 3))} />;
        }) : null}
        <LightPool x={360} y={1150} rx={460} ry={200} col="#FFE7B0" op={0.25 + 0.3 * sun} />
      </g>
      <g opacity={1 - ramp(lt, 2.2, 2.9)}><Rain t={t} n={100} op={0.8} /></g>
      <Gust k={blow} n={26} y0={500} h={1000} seed={41} big={1.5} />
      <Gust k={ramp(lt, 5.6, 7.6)} n={8} y0={800} h={500} seed={57} big={2.4} />
      <Rays x={-120} y={-80} op={0.12 + 0.18 * sun} t={t} />
    </Frame>
  );
};

// ── S11 79.3–86.6: warm empty field, one sprout, question card, AUDIRA plaque; outro card from 83.6 ─────────
export const S11: React.FC<SceneProps> = ({ t, lt }) => {
  const g = ease(ramp(lt, 0.4, 3.0));
  const cardIn = easeOut(ramp(lt, 0.3, 0.9));
  return (
    <Frame id="s11" bg={["#F3CF98", "#FBEBD0"]}>
      <g transform={orb(lt, 0.4, 540, 1000, 1.05, -0.004)}>
        <Sun x={800} y={1000} r={90} col="#F7B860" />
        <Mountains y={1080} seed={6.9} h={280} col="#D0A98A" />
        <Haze y={1070} h={170} op={0.6} />
      </g>
      <g transform={orb(lt, 1, 540, 1250, 1.12, -0.012)}>
        <Hills y={1110} seed={9.4} col="#C9B27A" amp={24} depth={0.6} />
        <Field x0={-200} x1={1280} y0={1150} y1={1600} rows={5} t={t} dry={0.85} />
        <path d={ellipse(540, 1290, 120, 26)} fill="#6B4A33" opacity={0.5} />
        <g transform="translate(540,1290) scale(1.5)"><Plant g={g} seed={3} h={150} t={t} /></g>
        <g transform="translate(830,1300)">
          <path d={rect(-7, -60, 14, 80)} fill={C.wood} />
          <g transform="translate(0,-90)">
            <Layered depth={0.5} draw={(o) => <path d={rect(-140, -46, 280, 84)} fill={o ?? C.paper} />} />
            <path d={rect(-140, -46, 280, 11)} fill={C.teal} />
            <text x={0} y={22} textAnchor="middle" fontFamily="Anton" fontSize={50} fill={C.ink} letterSpacing={8}>AUDIRA</text>
          </g>
        </g>
        <LightPool x={540} y={1220} rx={340} ry={200} col="#FFE7B0" op={0.55} />
      </g>
      <g transform={`translate(540,${700 - (1 - cardIn) * 80})`} opacity={cardIn}>
        <AyahCard w={940} h={400} title="RENUNGAN" lines={["APA YANG KAMU UCAPKAN", "SAAT MELIHAT MILIKMU?"]} size={68} />
      </g>
      <FGFoliage t={t} col="#7A6A38" />
      <Rays x={-120} y={-80} op={0.26} t={t} />
    </Frame>
  );
};

export const SCENE_MAP: Record<string, React.FC<SceneProps>> = { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11 };
