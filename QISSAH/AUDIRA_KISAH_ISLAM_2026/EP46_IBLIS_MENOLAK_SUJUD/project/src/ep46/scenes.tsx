// EP46 Iblis Menolak Sujud — scenes S1–S9. Each gets global t (s) and local lt (s since scene start), draws in 1080 × 1920.
// Lighting rule: key light upper-left on every set (Rays + LightPool), long cast shadows via P/Layered, cream haze only
// between BG and MG, FG plane blurred (DOF 9) in the lower corners, camera = elliptical orbit + slow zoom (never parks).
import React from "react";
import {
  C, P, PaperDefs, Hill, LightPool, Rays, Stars, Haze, FG, Cloud, Flame, LongShadow, Pillar, ClayMound, IconCard,
  Balance, Hourglass, Person, CreepShadow, LightRibbon, HeartLantern, Banner, Tree,
  blob, circle, rect, ramp, ease, easeOut, lerp, mix, type IconKind,
} from "./pieces";

export type SceneProps = { t: number; lt: number };

const Frame: React.FC<{ children: React.ReactNode; bg?: [string, string]; id: string; vig?: number; horiz?: string[] }> = ({ children, bg, id, vig = 0.42, horiz }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <PaperDefs />
    <defs>
      {bg ? (
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bg[0]} />
          <stop offset="0.72" stopColor={bg[1]} />
        </linearGradient>
      ) : null}
      {horiz ? (
        <linearGradient id={`bh-${id}`} x1="0" y1="0" x2="1" y2="0">
          {horiz.map((c, i) => <stop key={i} offset={i / (horiz.length - 1)} stopColor={c} />)}
        </linearGradient>
      ) : null}
      <radialGradient id={`vig-${id}`} cx="0.5" cy="0.44" r="0.75">
        <stop offset="0.5" stopColor="#1E1430" stopOpacity="0" />
        <stop offset="1" stopColor="#1E1430" stopOpacity={vig} />
      </radialGradient>
    </defs>
    {bg ? <rect width={1080} height={1920} fill={`url(#bg-${id})`} /> : null}
    {horiz ? <rect width={1080} height={1920} fill={`url(#bh-${id})`} /> : null}
    {children}
    <rect width={1080} height={1920} fill={`url(#vig-${id})`} />
  </svg>
);

/** Elliptical orbit (same frequency on both axes → speed never zero) + slow forward zoom. */
const orb = (lt: number, f = 1) => [Math.sin(1.1 * lt) * 24 * f, Math.cos(1.1 * lt) * 28 * f];
const cam = (lt: number, s: number, ox: number, oy: number, tx = 0, ty = 0, rot = 0) => {
  const [dx, dy] = orb(lt);
  const z = s * (1.05 + 0.012 * lt);
  return `translate(${ox + tx + dx},${oy + ty + dy}) rotate(${rot}) scale(${z}) translate(${-ox},${-oy})`;
};
/** BG parallax at 0.35× of the orbit. */
const bgCam = (lt: number) => { const [dx, dy] = orb(lt, 0.35); return `translate(${dx},${dy})`; };

const FGLeaves: React.FC<{ seed: number; col?: string; col2?: string }> = ({ seed, col = "#5E7F5A", col2 = "#7FA36E" }) => (
  <FG>
    <g transform="translate(40,1760)"><P d={blob(200, seed, 10, 0.2, 1.4, 0.8)} fill={col} depth={0.8} /></g>
    <g transform="translate(1050,1700)"><P d={blob(180, seed + 4, 10, 0.2, 1.2, 0.9)} fill={col2} depth={0.8} /></g>
    <g transform="translate(-20,1530) rotate(-30)"><P d="M0,0 C60,-120 160,-150 220,-140 C180,-60 90,-10 0,0Z" fill={col2} depth={0.6} /></g>
    <g transform="translate(1100,1520) rotate(200)"><P d="M0,0 C60,-120 160,-150 220,-140 C180,-60 90,-10 0,0Z" fill={col} depth={0.6} /></g>
  </FG>
);

// ── S1 Hook: rows of light bow, one paper flame stays upright ────────────────────────────
export const S1: React.FC<SceneProps> = ({ t, lt }) => {
  const pride = ease(ramp(t, 5.0, 6.2));
  const PIL = [[110, 1100, 300], [230, 1080, 330], [350, 1100, 300], [470, 1075, 340], [580, 1100, 300]];
  return (
    <Frame id="s1" bg={[C.indigo, "#5E4E92"]}>
      <g transform={bgCam(lt)}>
        <Stars t={t} n={46} h={640} y0={180} />
        <LightPool x={160} y={380} rx={420} ry={300} col="#F7E3B0" op={0.35} />
        <Hill y={990} amp={50} seed={1.1} col="#3A3168" depth={0.8} />
      </g>
      <Haze y={900} h={220} op={0.3} col="#CFC3E6" />
      <g transform={cam(lt, 1 + lt * 0.025, 780, 1000)}>
        <Hill y={1120} amp={16} seed={2.4} col="#4A3F7A" depth={0.9} />
        <LightPool x={330} y={1080} rx={360} ry={120} col="#FFE7B0" op={0.45} />
        {PIL.map(([x, y, h], i) => (
          <g key={i} transform={`translate(${x},${y})`}>
            <Pillar h={h} w={52} bow={0.82 * ease(ramp(lt, 0.4 + i * 0.22, 1.7 + i * 0.22))} dir={-1} t={t} seed={i} />
          </g>
        ))}
        <g transform="translate(800,1150)">
          <LongShadow len={560 + 220 * pride} w={80} skew={-220} />
          <LightPool x={0} y={-150} rx={300} ry={260} col="#FF9A4A" op={0.55} />
          <Flame t={t} s={1.2} pride={pride} />
        </g>
        <g transform="translate(470,1105)"><Banner text="AUDIRA QISSAH" w={360} size={36} /></g>
      </g>
      <Rays x={-120} y={-80} op={0.15} col="#FFE9B8" t={t} />
      <FG>
        <Cloud x={70} y={1720} r={190} seed={3} col="#8F84BE" />
        <Cloud x={1020} y={1780} r={170} seed={9} col="#7E72B0" />
      </FG>
    </Frame>
  );
};

// ── S2 Khalifah: crane down from a sky of light onto a new paper earth ───────────────────
export const S2: React.FC<SceneProps> = ({ t, lt }) => {
  const down = ease(ramp(lt, 0, 3.6));
  const ask = ease(ramp(t, 13.3, 14.4)) * (1 - ease(ramp(t, 17.4, 18.2)));
  const answer = ease(ramp(t, 17.45, 18.4));
  const beam = ease(ramp(t, 10.7, 11.8));
  const earthY = lerp(560, 0, down);
  return (
    <Frame id="s2" bg={["#F1D79E", "#F8ECD8"]} vig={0.3}>
      <g transform={bgCam(lt)}>
        <Cloud x={200} y={360 + earthY * 0.3} r={130} seed={5} col="#FFF6E6" depth={0.5} />
        <Cloud x={870} y={300 + earthY * 0.3} r={150} seed={7} col="#FFF6E6" depth={0.5} />
      </g>
      <Rays x={-100} y={-80} op={0.22 + 0.25 * answer} col="#FFF1CC" t={t} />
      <g transform={cam(lt, 1, 540, 1000)}>
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 190 + i * 175;
          const lean = (x < 540 ? 1 : -1) * 0.28 * ask;
          return (
            <g key={i} transform={`translate(${x},${lerp(640, 820, down) + Math.sin(t + i) * 8 - earthY * 0.15})`}>
              <Pillar h={260} w={44} bow={Math.abs(lean)} dir={Math.sign(lean) || 1} t={t} seed={i + 3} glow={0.9} />
            </g>
          );
        })}
        <Haze y={860 + earthY} h={200} op={0.45} />
        <g transform={`translate(0,${earthY})`}>
          <Hill y={980} amp={46} seed={0.7} col="#A9D1C0" depth={0.8} />
          <g transform="translate(170,1000)"><Tree s={0.7} col="#7FB08A" /></g>
          <g transform="translate(930,985)"><Tree s={0.8} col="#7FB08A" /></g>
          <Hill y={1070} amp={34} seed={2.2} col={C.teal} depth={1} />
          <P d={`M-200,1150 C200,1100 300,1210 560,1160 C800,1110 900,1200 1300,1150 L1300,1190 C900,1240 800,1150 560,1200 C300,1250 200,1140 -200,1190Z`} fill={C.river} depth={0.3} edge="#D8EEF8" />
          <g transform="translate(300,1110)"><Tree s={0.9} /></g>
          <g transform="translate(780,1100)"><Tree s={1.0} /></g>
          <Hill y={1240} amp={26} seed={4.4} col={C.tealDk} depth={1} />
          <path d={`M470,0 L610,0 L640,1150 L440,1150Z`} fill="#FFF1C8" opacity={0.45 * beam} filter="url(#pglow)" style={{ mixBlendMode: "screen" }} />
          <LightPool x={540} y={1150} rx={260} ry={80} col="#FFE7A0" op={0.8 * beam} />
        </g>
      </g>
      <FGLeaves seed={21} />
    </Frame>
  );
};

// ── S3 Adam from clay; the names orbit as cards ────────────────────────────────────────
const ICONS: IconKind[] = ["tree", "star", "river", "bird", "mountain"];
export const S3: React.FC<SceneProps> = ({ t, lt }) => {
  const rise = easeOut(ramp(lt, 0.2, 1.5));
  const dim = ease(ramp(t, 24.8, 25.6));
  const cards = ICONS.map((k, i) => {
    const a = (i / 5) * Math.PI * 2 + lt * 0.35;
    return { k, i, x: 540 + Math.cos(a) * 360, y: 800 + Math.sin(a) * 150, d: Math.sin(a), on: easeOut(ramp(t, 22.7 + i * 0.3, 23.3 + i * 0.3)) };
  }).sort((a, b) => a.d - b.d);
  return (
    <Frame id="s3" bg={["#E6C08E", "#F6E3C6"]}>
      <g transform={bgCam(lt)}>
        <Hill y={940} amp={60} seed={3.1} col="#DDB98E" depth={0.7} />
        {[100, 980].map((x, i) => (
          <g key={i} transform={`translate(${x},${960})`} opacity={0.75}><Pillar h={300} w={40} bow={0.25 * dim} dir={i ? 1 : -1} t={t} seed={i} glow={1 - 0.5 * dim} /></g>
        ))}
      </g>
      <Haze y={860} h={220} op={0.45} />
      <Rays x={540} y={-120} op={0.25} col="#FFF1CC" t={t} a0={1.33} />
      <g transform={cam(lt, 1, 540, 1080)}>
        <Hill y={1060} amp={28} seed={5.3} col="#C99A6A" depth={1} />
        <LightPool x={540} y={1040} rx={420} ry={150} col="#FFE7B0" op={0.6} />
        <g transform={`translate(540,${1150 + (1 - rise) * 220})`}><ClayMound s={0.75 + 0.25 * rise} t={t} glow={rise} /></g>
        {cards.map((c) => (
          <g key={c.k} transform={`translate(${c.x},${c.y}) scale(${(0.72 + 0.18 * c.d) * (0.3 + 0.7 * c.on)}) rotate(${Math.sin(t + c.i) * 6})`} opacity={c.on}>
            <IconCard kind={c.k} />
          </g>
        ))}
        <Hill y={1250} amp={20} seed={7.7} col="#A97A52" depth={1} />
      </g>
      <FG>
        {[[60, 1700, 90], [180, 1800, 60], [960, 1720, 100], [1050, 1600, 50]].map(([x, y, r], i) => (
          <g key={i} transform={`translate(${x},${y})`}><P d={blob(r, i * 5 + 2, 9, 0.2, 1.3, 0.8)} fill={i % 2 ? "#8A6448" : "#B98458"} depth={0.6} /></g>
        ))}
      </FG>
    </Frame>
  );
};

// ── S4 Sujud — all of them, except one ───────────────────────────────────────────────────
const ROWS: [number, number, number][] = [[200, 1010, 240], [340, 1000, 250], [480, 1010, 240], [620, 1000, 250], [130, 1170, 320], [300, 1160, 330], [470, 1170, 320], [640, 1160, 330], [770, 1015, 240]];
export const S4: React.FC<SceneProps> = ({ t, lt }) => {
  const focus = ease(ramp(t, 32.6, 33.8));
  const pride = ease(ramp(t, 35.5, 36.9));
  const tx = lerp(110, -50, ease(ramp(lt, 0, 5.4)));
  return (
    <Frame id="s4" bg={["#FFF3D8", "#F0D094"]} vig={0.34}>
      <g transform={bgCam(lt)}>
        <LightPool x={460} y={620} rx={520} ry={420} col="#FFF4DE" op={0.62} />
        <Rays x={460} y={560} op={0.3} col="#FFF6DA" t={t} a0={-0.2} />
        <Rays x={460} y={560} op={0.3} col="#FFF6DA" t={t} a0={2.4} />
      </g>
      <Haze y={820} h={200} op={0.5} />
      <g transform={cam(lt, 1 + 0.32 * focus, lerp(540, 900, focus), 1080, tx * (1 - focus))}>
        <Hill y={950} amp={10} seed={1.3} col="#EBD3A6" depth={0.8} />
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${460 + (i - 2.5) * 40},950 L${460 + (i - 2.5) * 260},1920`} stroke="#D7B984" strokeWidth={3} opacity={0.5} />)}
        <g transform="translate(460,930)"><ClayMound s={0.5} t={t} glow={1.2} /></g>
        {ROWS.map(([x, y, h], i) => {
          const bow = ease(ramp(t, 31.0 + i * 0.12, 31.9 + i * 0.12));
          return (
            <g key={i} transform={`translate(${x},${y})`}>
              <Pillar h={h} w={46} bow={0.85 * bow} dir={x < 460 ? 1 : -1} t={t} seed={i * 2} />
            </g>
          );
        })}
        <g transform="translate(930,1180)">
          <LongShadow len={420 + 380 * pride} w={70} skew={-320} op={0.5} />
          <LightPool x={0} y={-160} rx={260} ry={240} col="#FF9A4A" op={0.6} />
          <Flame t={t} s={0.95} pride={pride * 0.8} />
        </g>
      </g>
      <FG>
        <P d="M-100,1640 C200,1580 400,1660 600,1620 L600,2000 L-100,2000Z" fill="#E2C38E" depth={0.7} />
        <P d="M700,1700 C850,1640 1000,1680 1200,1640 L1200,2000 L700,2000Z" fill="#D8B47A" depth={0.7} />
      </FG>
    </Frame>
  );
};

// ── S5 Fire vs clay on a balance — the first false analogy ────────────────────────────────
export const S5: React.FC<SceneProps> = ({ t, lt }) => {
  const claim = ease(ramp(t, 39.3, 40.4));
  const turn = ease(ramp(t, 47.5, 48.7));
  const tilt = 13 * claim * (1 - turn) - 11 * turn + Math.sin(t * 2.4) * 1.2;
  return (
    <Frame id="s5" horiz={["#D9653A", "#EE9A5C", "#F6D49C", "#EBC27A"]} vig={0.4}>
      <rect width={1080} height={1920} fill="url(#plight)" opacity={0.6} />
      <g transform={bgCam(lt)}>
        <Rays x={-60} y={300} op={0.22} col="#FFB070" t={t} a0={0.1} />
        <Rays x={1140} y={260} op={0.3} col="#FFF1CC" t={t} a0={2.2} />
        <Hill y={1160} amp={40} seed={2.9} col="#C77A48" depth={0.7} />
      </g>
      <Haze y={1000} h={200} op={0.4} />
      <g transform={cam(lt, 1 + 0.1 * ease(ramp(lt, 0, 8)), 540, 900, 0, 0, Math.sin(lt * 0.5) * 1.2)}>
        <LightPool x={250} y={820} rx={260} ry={260} col="#FF8A3A" op={0.5} />
        <LightPool x={830} y={820} rx={260} ry={260} col="#FFE7A0" op={0.5 + 0.3 * turn} />
        <g transform="translate(560,1230) scale(0.86)"><Balance t={t} tilt={tilt} /></g>
      </g>
      <FG>
        {[[70, 1760, 110, "#E2572B"], [180, 1850, 70, "#F59A3A"], [980, 1760, 120, "#A0704C"], [880, 1860, 70, "#C99A6A"]].map(([x, y, r, col], i) => (
          <g key={i} transform={`translate(${x},${y})`}><P d={blob(r as number, i * 3 + 1, 9, 0.22, 1.3, 0.8)} fill={col as string} depth={0.6} /></g>
        ))}
      </FG>
    </Frame>
  );
};

// ── S6 Respite: the hourglass until the Day of Resurrection ───────────────────────────────
export const S6: React.FC<SceneProps> = ({ t, lt }) => (
  <Frame id="s6" bg={["#4A3F7A", "#B58AB0"]}>
    <g transform={bgCam(lt)}>
      <Stars t={t} n={30} h={500} y0={200} />
      <Hill y={1080} amp={60} seed={6.1} col="#5B4A86" depth={0.7} />
    </g>
    <Haze y={980} h={200} op={0.3} col="#E7D3E6" />
    <g transform={cam(lt, 1.02 + lt * 0.02, 540, 900, 0, 0, Math.sin(lt * 0.8) * 2.5)}>
      <Hill y={1180} amp={14} seed={3.3} col="#6E5A92" depth={0.9} />
      <LightPool x={540} y={800} rx={340} ry={420} col="#FFE7B0" op={0.35} />
      <g transform="translate(540,1180) scale(0.95)"><Hourglass t={t} k={0.2 + 0.6 * ramp(lt, 0, 3.95)} /></g>
      <g transform="translate(210,1190)">
        <LongShadow len={300} w={40} skew={-90} op={0.5} />
        <Flame t={t} s={0.34} />
      </g>
    </g>
    <Rays x={-120} y={-80} op={0.14} col="#FFE9D0" t={t} />
    <FG>
      <Cloud x={60} y={1740} r={170} seed={13} col="#7E6AA0" />
      <Cloud x={1030} y={1700} r={160} seed={17} col="#8E78AE" />
    </FG>
  </Frame>
);

// ── S7 The oath: shadows from front, back, right and left ─────────────────────────────────
const DIRS = [
  { k: "DEPAN", at: 54.91, x: 540, y: 1470, rot: 0, len: 300, lx: 810, ly: 1215 },
  { k: "BELAKANG", at: 55.48, x: 540, y: 700, rot: 180, len: 260, lx: 540, ly: 640 },
  { k: "KANAN", at: 56.19, x: 1030, y: 1010, rot: -90, len: 360, lx: 900, ly: 860 },
  { k: "KIRI", at: 56.92, x: 50, y: 1010, rot: 90, len: 360, lx: 180, ly: 860 },
];
export const S7: React.FC<SceneProps> = ({ t, lt }) => {
  const crowd = ease(ramp(t, 57.7, 58.6));
  return (
    <Frame id="s7" bg={["#352A58", "#7A5A86"]}>
      <g transform={bgCam(lt)}>
        <Stars t={t} n={24} h={320} y0={180} />
        <Hill y={700} amp={36} seed={8.2} col="#4D3F72" depth={0.7} />
      </g>
      <Haze y={650} h={160} op={0.25} col="#E7D3E6" />
      <g transform={cam(lt, lerp(1.22, 1.0, ease(ramp(lt, 0, 7))), 540, 1050)}>
        <Hill y={760} amp={20} seed={9.4} col="#5E4E82" depth={0.9} />
        <P d="M470,760 L610,760 L1000,1920 L80,1920Z" fill="#C9B08A" depth={0.6} edge="#EAD8B4" />
        {Array.from({ length: 8 }, (_, i) => {
          const y0 = 780 + i * 140, y1 = y0 + 60;
          return <path key={i} d={`M540,${y0} L540,${y1}`} stroke="#F6EFE4" strokeWidth={6 + i * 2} opacity={0.75} />;
        })}
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${470 + i * 45},${800 + (i % 2) * 18}) scale(${0.7 + (i % 2) * 0.1})`} opacity={crowd * 0.85}>
            <Person color="#5A5A86" />
          </g>
        ))}
        <LightPool x={540} y={1060} rx={200} ry={90} col="#FFE7B0" op={0.45} />
        {DIRS.map((d) => {
          const g = easeOut(ramp(t, d.at - 0.1, d.at + 0.6));
          return (
            <g key={d.k} opacity={Math.min(1, g * 2)}>
              <g transform={`translate(${d.x},${d.y}) rotate(${d.rot})`}><CreepShadow len={d.len * g} t={t} seed={d.rot} /></g>
            </g>
          );
        })}
        <g transform="translate(540,1080) scale(2.2)"><Person color="#3F4A78" step={Math.sin(t * 3) * 0.6} /></g>
        {DIRS.map((d) => {
          const g = easeOut(ramp(t, d.at, d.at + 0.4));
          if (g <= 0) return null;
          const w = d.k.length * 30 + 110;
          return (
            <g key={d.k + "l"} transform={`translate(${d.lx},${d.ly}) scale(${0.5 + 0.5 * g}) rotate(${d.rot === 0 ? -3 : 3})`} opacity={g}>
              <path d={rect(-w / 2 - 6, -62, w + 12, 124)} fill={C.ink} /><P d={rect(-w / 2, -56, w, 112)} fill={C.paper} depth={0.5} edge="#E6D6BC" />
              <path d={rect(-w / 2, -56, w, 10)} fill={C.flame} />
              <text x={0} y={20} textAnchor="middle" fontFamily="Anton" fontSize={50} fill={C.ink} letterSpacing={2} style={{ textShadow: "0 0 6px #FFF6E6" }}>{d.k}</text>
            </g>
          );
        })}
      </g>
      <FGLeaves seed={33} col="#3E3A5E" col2="#55507A" />
    </Frame>
  );
};

// ── S8 Two mistakes, two roads: Adam's repentance (payoff) ───────────────────────────────
export const S8: React.FC<SceneProps> = ({ t, lt }) => {
  const dawn = ease(ramp(t, 66.0, 70.2));
  const slip = ease(ramp(t, 61.4, 62.2)) * (1 - ease(ramp(t, 66.2, 67.5)));
  const impact = ease(ramp(t, 69.5, 70.1)) * (1 - 0.6 * ease(ramp(t, 70.4, 72)));
  const fall = ease(ramp(t, 70.8, 72.4));
  const rise = ease(ramp(t, 73.1, 74.6));
  const top = mix("#352A58", "#F2B98E", dawn), bot = mix("#7A5A86", "#FBE6C4", dawn);
  return (
    <Frame id="s8" bg={[top, bot]} vig={0.4 - 0.15 * dawn}>
      <g transform={bgCam(lt)}>
        <Stars t={t} n={26} h={500} y0={180} />
        <path d={circle(540, 1500, 900)} fill="#FFF1C8" opacity={0.42 * impact} filter="url(#psoft)" style={{ mixBlendMode: "screen" }} />
        <Hill y={760} amp={44} seed={4.7} col={mix("#4D3F72", "#E9B48E", dawn)} depth={0.7} />
      </g>
      <Haze y={700} h={200} op={0.3 + 0.2 * dawn} />
      <Rays x={-100} y={-80} op={0.1 + 0.3 * dawn} col="#FFE9B8" t={t} />
      <g transform={cam(lt, 1, 540, 1000, 0, 140 * ease(ramp(t, 66, 75)))}>
        <Hill y={880} amp={18} seed={5.9} col={mix("#5E4E82", "#E3B98A", dawn)} depth={0.9} />
        <P d="M470,1920 L610,1920 L600,1150 C620,1050 720,920 860,840 L800,800 C680,880 590,960 540,1060 C490,960 380,880 250,850 L200,900 C340,940 460,1040 480,1150Z" fill={mix("#B79E80", "#F2DDB6", dawn)} depth={0.6} edge="#F6E6C8" />
        <g transform={`translate(230,${880 + fall * 260}) scale(${0.55 * (1 - 0.55 * fall)})`} opacity={1 - 0.5 * fall}>
          <LongShadow len={260 + 400 * fall} w={60} skew={-200} op={0.5} />
          <Flame t={t} dim={fall} glow={1 - fall} />
        </g>
        {[0, 1, 2].map((i) => (
          <LightRibbon key={i} x0={640 + i * 140} y0={-60} x1={830} y1={690} k={ease(ramp(t, 66.2 + i * 0.35, 68.0 + i * 0.35))} t={t} seed={i * 4} w={20 - i * 3} />
        ))}
        <path d={`M${830 - 70},${-200} L${830 + 70},${-200} L${830 + 110},780 L${830 - 110},780Z`} fill="#FFF6DA" opacity={0.45 * rise} filter="url(#pglow)" style={{ mixBlendMode: "screen" }} />
        <LightPool x={830} y={760} rx={260} ry={130} col="#FFE7A0" op={0.35 + 0.35 * impact + 0.2 * rise} />
        <g transform={`translate(830,${830 - 30 * rise}) rotate(${-7 * slip})`}>
          <ClayMound s={0.52} t={t} glow={0.6 + 0.9 * impact + 0.5 * rise} seed={41} />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={blob(14 + i * 3, i, 7, 0.2)} fill={C.clay} transform={`translate(${-90 + i * 30},${-20 + slip * (60 + i * 25)})`} opacity={slip} />
          ))}
        </g>
      </g>
      <FGLeaves seed={47} col={mix("#3E3A5E", "#9A7A5A", dawn)} col2={mix("#55507A", "#B8946A", dawn)} />
    </Frame>
  );
};

// ── S9 The heart that feels better than others + brand + outro ────────────────────────────
export const S9: React.FC<SceneProps> = ({ t, lt }) => {
  const s = lerp(1.25, 1.0, ease(ramp(lt, 0, 5.5)));
  const heart = easeOut(ramp(t, 77.1, 78.0));
  return (
    <Frame id="s9" bg={["#F2B98E", "#FCEBD0"]} vig={0.28}>
      <g transform={bgCam(lt)}>
        <path d={circle(800, 860, 120)} fill={C.gold} opacity={0.9} />
        <path d={circle(800, 860, 220)} fill="#FFE7B0" opacity={0.4} filter="url(#psoft)" />
        <Hill y={900} amp={50} seed={2.1} col="#E9B48E" depth={0.7} />
      </g>
      <Haze y={840} h={220} op={0.5} />
      <Rays x={-100} y={-80} op={0.28} col="#FFF1CC" t={t} />
      <g transform={cam(lt, s, 540, 1000)}>
        <Hill y={1000} amp={36} seed={3.8} col="#9CC8B4" depth={0.9} />
        <g transform="translate(160,1020)"><Tree s={0.8} col="#7FB08A" /></g>
        <g transform="translate(930,1010)"><Tree s={0.9} col="#7FB08A" /></g>
        <Hill y={1110} amp={26} seed={6.6} col={C.teal} depth={1} />
        <g transform={`translate(540,${lerp(560, 840, heart)})`} opacity={0.25 + 0.75 * heart}>
          <HeartLantern t={t} glow={heart} s={1.05} />
        </g>
        <LightPool x={540} y={1120} rx={300} ry={90} col="#FFC98A" op={0.5 * heart} />
        <g transform="translate(540,1205)"><Banner text="AUDIRA QISSAH" w={480} size={44} /></g>
      </g>
      <FGLeaves seed={59} />
    </Frame>
  );
};

export const SCENE_MAP: Record<string, React.FC<SceneProps>> = { S1, S2, S3, S4, S5, S6, S7, S8, S9 };
