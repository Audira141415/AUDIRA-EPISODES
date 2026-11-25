// EP15 scenes S1–S9. Each gets global t (s) and local lt (s since scene start), draws in 1080 × 1920.
import React from "react";
import {
  C, Defs, Studio, Slab, Strata, Inclusions, Cavity, Lamp, Person, Goat, Chimney, Tag, Flow, StoneDoor, chunk,
  vault, rrect, turkeyPath, projTR, cam, keys, hash, ramp, ease, easeOut, easeIn, lerp, pulse, mix,
} from "./pieces";
import { City, CW, LEVEL_Y, WELL_X } from "./city";

export type SceneProps = { t: number; lt: number };

const Frame: React.FC<{ children: React.ReactNode; id: string }> = ({ children, id }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <Defs />
    {children}
    <defs>
      <radialGradient id={`vig-${id}`} cx="0.5" cy="0.45" r="0.78">
        <stop offset="0.55" stopColor="#13222a" stopOpacity="0" />
        <stop offset="1" stopColor="#13222a" stopOpacity="0.38" />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill={`url(#vig-${id})`} />
  </svg>
);

const Dust: React.FC<{ t: number; n?: number; seed?: number; col?: string; area?: [number, number, number, number] }> = ({ t, n = 26, seed = 1, col = "#fff2dc", area = [0, 0, 1080, 1920] }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = area[0] + ((hash(seed + i) * area[2] + t * (8 + hash(i * 3) * 14)) % area[2]);
      const y = area[1] + ((hash(seed * 7 + i) * area[3] - t * (10 + hash(i * 5) * 18) + area[3] * 4) % area[3]);
      const r = 2 + hash(i * 11 + seed) * 4;
      return <circle key={i} cx={x} cy={y} r={r} fill={col} opacity={0.25 + 0.3 * hash(i * 13)} />;
    })}
  </g>
);

/** Foreground out-of-focus rock edge (depth). */
const FgRock: React.FC<{ x: number; y: number; s: number; flip?: boolean }> = ({ x, y, s, flip }) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`} filter="url(#blur18)" opacity={0.9}>
    <path d="M0,0 C80,-40 160,-10 210,60 C260,140 230,260 160,320 C90,380 -20,360 -60,280 C-100,200 -80,40 0,0 Z" fill={C.t4} />
    <path d="M20,30 C80,0 150,20 180,80" stroke={C.t1} strokeWidth={14} fill="none" opacity={0.5} />
  </g>
);

const House: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x},${y})`}>
    <ellipse cx={210} cy={4} rx={240} ry={18} fill="#000" opacity={0.18} filter="url(#blur8)" />
    <rect x={0} y={-300} width={420} height={300} fill={C.stone} />
    <rect x={0} y={-300} width={420} height={300} fill="#fff" filter="url(#grain)" opacity={0.35} />
    <rect x={0} y={-300} width={420} height={300} fill="url(#sheen)" />
    {/* cut-open interior */}
    <Cavity d={rrect(30, -270, 360, 250, 10)} glow={[120, -40, 90]} outline />
    <rect x={-14} y={-318} width={448} height={22} fill="#d8c4a2" />
    <rect x={-14} y={-318} width={448} height={22} fill="url(#sheen)" />
    <path d={vault(260, -150, 70, 130)} fill="#2a1d16" stroke="#f7dcb4" strokeOpacity={0.45} strokeWidth={3} />
    <path d={vault(70, -230, 70, 80)} fill="#7fb4c9" opacity={0.75} />
    <rect x={160} y={-120} width={70} height={30} rx={6} fill={C.t3} />
    <Lamp x={120} y={-80} t={t} s={0.8} ph={2} />
    {/* stairs down to the basement */}
    {Array.from({ length: 5 }, (_, i) => <rect key={i} x={40 + i * 26} y={-20 + i * 0} width={26} height={20 + i * 2} fill={C.t2} opacity={0.0} />)}
  </g>
);

/* ───────────── S1 Hook: 1963, wall smashed, tunnel down to a city ───────────── */
const S1: React.FC<SceneProps> = ({ t }) => {
  const dive = ease(ramp(t, 4.4, 8.6));
  const s = 1.0 + 0.06 * ease(ramp(t, 0, 4.4)) + 0.28 * dive;
  const oy = lerp(900, 1300, dive);
  const ty = -lerp(0, 360, dive);
  const hits = [2.1, 3.1, 3.65];
  const shake = hits.reduce((a, h) => a + pulse(t, h, 0.22), 0);
  const sx = Math.sin(t * 90) * 7 * shake;
  const broken = ramp(t, 3.65, 3.75);
  let ang = -14;
  for (const h of hits) {
    if (t >= h - 0.5 && t <= h) { ang = -14 - 100 * Math.sin(((h - t) / 0.5) * Math.PI / 2); break; }
  }
  if (t > 3.65) ang = lerp(-14, 40, ease(ramp(t, 3.9, 4.7)));
  const tunnel = ease(ramp(t, 4.2, 7.7));
  const ghost = ease(ramp(t, 6.9, 8.3));
  const hint = ease(ramp(t, 1.0, 2.2)) * (1 - broken);
  const tunnelD = "M600,175 L790,175 L850,330 L380,470 L300,620 L760,770 L700,960";
  const SX = 70, SY = 820; // slab origin
  return (
    <Frame id="s1">
      <g transform={`translate(${sx},0)`}>
        <g transform={cam(s, 540, oy, 0, ty)}>
          <Studio id="s1" />
          <Chimney x={120} y={SY - 40} h={260} col="#e4bf92" />
          <Chimney x={880} y={SY - 46} h={330} col={C.t1} />
          <Chimney x={990} y={SY - 52} h={200} col="#e4bf92" />
          <Slab x={SX} y={SY} w={900} h={1180} id="s1" seed={5}>
            {/* basement */}
            <Cavity d={rrect(140, 40, 470, 220, 14)} glow={[230, 240, 120]} />
            <Lamp x={220} y={214} t={t} s={0.9} />
            {/* hidden passage hint (x-ray ghost) */}
            <path d={tunnelD} fill="none" stroke={C.cyan} strokeWidth={4} strokeDasharray="16 12" opacity={0.55 * hint} />
            {/* tunnel reveal */}
            <g opacity={broken}>
              <Cavity d={rrect(610, 105, 200, 150, 12)} />
              <path d={tunnelD} pathLength={1} fill="none" stroke={C.cyan} strokeWidth={98} strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - tunnel} />
              <path d={tunnelD} pathLength={1} fill="none" stroke={C.cav2} strokeWidth={92} strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - tunnel} />
              <path d={tunnelD} pathLength={1} fill="none" stroke={C.cav} strokeWidth={44} strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - tunnel} opacity={0.8} />
            </g>
            {/* the wall between basement and passage */}
            <g opacity={1 - broken}>
              <rect x={606} y={105} width={10} height={150} fill={C.t2} />
            </g>
            {/* cracks */}
            {hits.map((h, i) => (
              <path key={i} d={["M612,150 l-26,-30 l-10,-26 M612,150 l-34,10 l-22,18", "M612,170 l-30,34 l-8,30 M612,140 l-40,-6", "M612,160 l-50,4 M612,190 l-24,46"][i]}
                stroke={C.cav2} strokeWidth={4} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ease(ramp(t, h, h + 0.12))} opacity={1 - broken} />
            ))}
            {/* debris */}
            {broken > 0 ? Array.from({ length: 9 }, (_, i) => {
              const dt = t - 3.65;
              const vx = -(90 + hash(i) * 240), vy = -(60 + hash(i + 9) * 200);
              const x = 612 + vx * dt;
              const y = Math.min(250, 160 + vy * dt + 700 * dt * dt);
              return <path key={i} d={chunk(10 + hash(i * 3) * 14, i * 7)} transform={`translate(${x},${y}) rotate(${dt * 300 * (hash(i) - 0.5)})`} fill={i % 2 ? C.t3 : C.t2} stroke={C.t5} strokeWidth={2} />;
            }) : null}
            {/* worker with hammer */}
            <g>
              <Person x={480} y={258} s={1.15} col={C.ink} />
              <g transform={`translate(${492},${258 - 76 * 1.15}) rotate(${ang})`}>
                <rect x={0} y={-5} width={108} height={10} rx={5} fill="#8a5a3a" />
                <rect x={96} y={-22} width={26} height={44} rx={5} fill="#58606a" />
              </g>
            </g>
            {/* the city below (ghost → real) */}
            {[[60, 980, 220], [330, 1000, 250], [640, 975, 220]].map(([x, y, w], i) => (
              <g key={i}>
                <path d={vault(x, y, w, 100)} fill="none" stroke={C.cyan} strokeWidth={4} strokeDasharray="14 10" opacity={ghost} />
                <Cavity d={vault(x, y, w, 100)} glow={[x + w / 2, y + 90, 70]} opacity={ease(ramp(t, 7.6, 8.6))} />
              </g>
            ))}
            {[[160, 1060], [450, 1080], [750, 1055]].map(([x, y], i) => <Lamp key={i} x={x} y={y} t={t} s={0.7} ph={i} />)}
          </Slab>
          <House x={SX + 120} y={SY - 8} t={t} />
          <Dust t={t} n={18} seed={3} area={[SX + 120, SY + 40, 500, 230]} col="#f7e2c2" />
        </g>
      </g>
    </Frame>
  );
};

/* ───────────── S2 Context: map → section, 85 m, 28 floors, 20.000 ───────────── */
const S2: React.FC<SceneProps> = ({ t }) => {
  const mapOut = ease(ramp(t, 11.4, 12.5));
  const pinP = ramp(t, 9.85, 10.35);
  const [px, py] = projTR(34.73, 38.37, 90, 700, 900);
  const ms = (1 + 0.1 * ease(ramp(t, 8.6, 11.4))) * (1 + 2.6 * easeIn(mapOut));
  const secIn = ease(ramp(t, 11.7, 12.9));
  const ss = lerp(0.86, 1.0, secIn) * (1 + 0.035 * ease(ramp(t, 12.9, 19.1)));
  const ruler = ease(ramp(t, 12.4, 13.5));
  const floors = ramp(t, 14.0, 15.3);
  const people = ramp(t, 16.4, 18.7);
  const CX = 130, CY = 650, CS = 0.68;
  const bot = CY + 930 * CS;
  return (
    <Frame id="s2">
      <Studio id="s2" />
      {/* map */}
      {mapOut < 1 ? (
        <g opacity={1 - mapOut} transform={cam(ms, px, py)}>
          <rect x={76} y={560} width={940} height={640} rx={28} fill="#1d2b33" opacity={0.2} filter="url(#blur18)" transform="translate(10,16)" />
          <rect x={70} y={556} width={940} height={640} rx={28} fill="#d7ecf1" stroke={C.cyan} strokeWidth={3} />
          <g stroke={C.cyan} strokeOpacity={0.18} strokeWidth={1.5}>
            {Array.from({ length: 12 }, (_, i) => <line key={i} x1={70 + i * 80} y1={556} x2={70 + i * 80} y2={1196} />)}
            {Array.from({ length: 8 }, (_, i) => <line key={`h${i}`} x1={70} y1={556 + i * 80} x2={1010} y2={556 + i * 80} />)}
          </g>
          <path d={turkeyPath(96, 706, 900)} fill={C.t4} opacity={0.5} transform="translate(6,9)" />
          <path d={turkeyPath(90, 700, 900)} fill={C.t1} stroke={C.t5} strokeWidth={3} strokeLinejoin="round" />
          <path d={turkeyPath(90, 700, 900)} fill="#fff" filter="url(#grain)" opacity={0.4} />
          <text x={540} y={640} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={34} fill={C.inkSoft} letterSpacing={6}>LAUT HITAM</text>
          <text x={330} y={1150} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={30} fill={C.inkSoft} letterSpacing={5}>LAUT TENGAH</text>
          <text x={760} y={900} textAnchor="middle" fontFamily="Anton" fontSize={92} fill={C.t5} opacity={0.55} letterSpacing={8}>TURKI</text>
          <circle cx={px} cy={py} r={70 * pinP + 40 * pulse(t, 10.35, 0.9)} fill="none" stroke={C.orange} strokeWidth={4} opacity={pinP * (1 - ramp(t, 10.8, 11.6))} />
          <g transform={`translate(${px},${py - 200 * (1 - easeOut(pinP))})`} opacity={Math.min(1, pinP * 3)}>
            <ellipse cx={0} cy={4} rx={16} ry={6} fill="#000" opacity={0.3} />
            <path d="M0,0 C-10,-22 -30,-40 -30,-62 a30,30 0 1,1 60,0 C30,-40 10,-22 0,0 Z" fill={C.orange} stroke="#fff" strokeWidth={4} />
            <circle cx={0} cy={-62} r={11} fill="#fff" />
          </g>
          <Tag x={px - 180} y={py + 120} ax={px} ay={py} text="KAPADOKIA" p={ramp(t, 10.0, 10.6)} size={38} accent={C.orange} />
        </g>
      ) : null}
      {/* section */}
      {secIn > 0 ? (
        <g opacity={secIn} transform={cam(ss, 520, 980)}>
          <City x={CX} y={CY} s={CS} t={t} id="s2" fx={{ people }} />
          {/* depth ruler */}
          <g>
            <rect x={80} y={CY} width={22} height={930 * CS} rx={6} fill="#c9d6d2" />
            <rect x={80} y={CY} width={22} height={930 * CS * ruler} rx={6} fill={C.cyan} />
            {[0, 20, 40, 60, 85].map((m) => {
              const yy = CY + (m / 85) * 930 * CS;
              return (
                <g key={m} opacity={ramp(ruler, (m / 85) * 0.9, (m / 85) * 0.9 + 0.1)}>
                  <line x1={74} y1={yy} x2={118} y2={yy} stroke={C.ink} strokeWidth={3} />
                  <text x={70} y={yy + 10} textAnchor="end" fontFamily="Space Grotesk" fontWeight={700} fontSize={26} fill={C.ink}>{m}</text>
                </g>
              );
            })}
            <text x={90} y={CY - 24} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={26} fill={C.inkSoft}>M</text>
          </g>
          {/* ghost 28-floor building */}
          <g opacity={ease(ramp(t, 13.8, 14.3))}>
            <rect x={876} y={CY} width={150} height={930 * CS} fill={C.cyan} fillOpacity={0.08} stroke={C.cyan} strokeWidth={3} strokeDasharray="12 8" />
            {Array.from({ length: 28 }, (_, i) => {
              const yy = bot - (i + 1) * ((930 * CS) / 28);
              const on = ramp(floors, i / 28, i / 28 + 0.06);
              return (
                <g key={i} opacity={on}>
                  <line x1={876} y1={yy} x2={1026} y2={yy} stroke={C.cyan} strokeWidth={2} />
                  {[0, 1, 2].map((w) => <rect key={w} x={892 + w * 44} y={yy + 6} width={30} height={9} fill={C.cyan} opacity={0.45} />)}
                </g>
              );
            })}
            <text x={951} y={CY - 22} textAnchor="middle" fontFamily="Anton" fontSize={44} fill={C.ink} opacity={ramp(floors, 0.6, 1)}>28 LANTAI</text>
          </g>
          <Tag x={360} y={bot + 90} ax={460} ay={bot - 30} text="8 LANTAI TERBUKA" p={ramp(t, 15.2, 15.8)} size={34} />
        </g>
      ) : null}
    </Frame>
  );
};

/* ───────────── S3 Tuff: volcano ash → compacted tuff → carved ───────────── */
const S3: React.FC<SceneProps> = ({ t }) => {
  const pA = 1 - ease(ramp(t, 21.0, 21.6));
  const pB = ease(ramp(t, 21.0, 21.6)) * (1 - ease(ramp(t, 26.4, 26.9)));
  const pD = ease(ramp(t, 26.4, 26.9));
  const comp = ease(ramp(t, 25.0, 26.4));
  const ashCols = ["#d6d0c6", "#c8c1b6", "#bdb5aa", "#cfc8bd"];
  const tuffCols = [C.t1, C.t2, C.t3, "#e2bb8c"];
  let acc = 0;
  const layers = [0, 1, 2, 3].map((i) => {
    const th = 52 * ease(ramp(t, 23.0 + i * 0.6, 23.7 + i * 0.6)) * (1 - 0.3 * comp);
    const y = 1220 - acc - th;
    acc += th;
    return { y, th, col: mix(ashCols[i], tuffCols[i], comp) };
  });
  const erupt = t - 22.3;
  const w = 130 + 360 * ease(ramp(t, 26.6, 29.0));
  const hitT = [27.4, 27.8, 28.2, 28.6];
  const tap = hitT.reduce((a, h) => a + pulse(t, h - 0.12, 0.24), 0);
  return (
    <Frame id="s3">
      {/* A: close-up rock face */}
      {pA > 0 ? (
        <g opacity={pA} transform={cam(1 + 0.08 * ease(ramp(t, 19.1, 21.6)), 540, 1000)}>
          <Studio id="s3a" grid={false} />
          <Slab x={-60} y={560} w={1200} h={1500} id="s3a" seed={21} />
          {/* magnifier: porous volcanic tuff grains */}
          <circle cx={540} cy={1000} r={220} fill={C.t2} />
          {Array.from({ length: 70 }, (_, i) => {
            const a = hash(i + 3) * Math.PI * 2, r = Math.sqrt(hash(i + 91)) * 200;
            const g = ease(ramp(t, 19.6 + hash(i + 7) * 1.0, 20.0 + hash(i + 7) * 1.0));
            return <circle key={i} cx={540 + Math.cos(a) * r} cy={1000 + Math.sin(a) * r} r={(6 + hash(i + 40) * 16) * g} fill={i % 3 === 0 ? C.t4 : i % 3 === 1 ? C.t1 : C.cav} opacity={0.85} />;
          })}
          <circle cx={540} cy={1000} r={220} fill="none" stroke={C.cyan} strokeWidth={5} />
          <text x={540} y={1290} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={34} fill={C.ink} opacity={ramp(t, 20.2, 20.6)}>BERPORI · RINGAN · LUNAK</text>
          <circle cx={540} cy={1000} r={240} fill="none" stroke={C.cyan} strokeWidth={2} strokeDasharray="10 10" transform={`rotate(${t * 20},540,1000)`} />
          <Tag x={540} y={700} ax={540} ay={1000} text="RAHASIANYA: BATU" p={ramp(t, 19.8, 20.4)} size={44} />
        </g>
      ) : null}
      {/* B/C: volcano and ash layers */}
      {pB > 0 ? (
        <g opacity={pB} transform={cam(1 + 0.05 * ease(ramp(t, 21.0, 26.8)), 540, 1100, -30 * ease(ramp(t, 21, 26.8)))}>
          <defs>
            <linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={mix("#cfe3ea", "#a9a39b", ramp(t, 22.6, 24.5) * 0.7)} />
              <stop offset="1" stopColor="#f2e6d4" />
            </linearGradient>
          </defs>
          <rect x={-200} y={-200} width={1480} height={2400} fill="url(#sky3)" />
          {/* distant ridges */}
          <path d="M-200,1225 L-40,1010 L90,1080 L250,905 L390,1040 L520,960 L640,1225 Z" fill="#9a9087" />
          <path d="M-200,1225 L-40,1010 L90,1080 L250,905 L390,1040 L520,960 L640,1225 Z" fill="#fff" filter="url(#grain)" opacity={0.35} />
          <path d="M250,905 L300,1225 M520,960 L470,1225 M-40,1010 L20,1225" stroke="#6f655d" strokeOpacity={0.45} strokeWidth={4} fill="none" />
          {/* volcano */}
          <path d="M470,1225 L770,700 L880,700 L1180,1225 Z" fill="#6d625a" />
          <path d="M470,1225 L770,700 L880,700 L1180,1225 Z" fill="#fff" filter="url(#grain)" opacity={0.45} />
          <g stroke="#4a413b" strokeOpacity={0.55} strokeLinecap="round" fill="none">
            {[[790, 730, 640, 1225, 5], [812, 724, 760, 1225, 4], [836, 722, 880, 1225, 4.5], [858, 726, 1010, 1225, 5], [872, 740, 1120, 1225, 3.5], [800, 760, 560, 1225, 3]].map(([x1, y1, x2, y2, sw], i) => (
              <path key={i} d={`M${x1},${y1} Q${(x1 + x2) / 2 + (i % 2 ? 18 : -18)},${(y1 + y2) / 2} ${x2},${y2}`} strokeWidth={sw} />
            ))}
          </g>
          <g stroke="#a39990" strokeOpacity={0.5} strokeLinecap="round" fill="none">
            {[[783, 735, 620, 1180], [826, 726, 830, 1200], [866, 735, 1060, 1200]].map(([x1, y1, x2, y2], i) => (
              <path key={i} d={`M${x1 - 6},${y1} Q${(x1 + x2) / 2 - 24},${(y1 + y2) / 2} ${x2 - 10},${y2}`} strokeWidth={2.5} />
            ))}
          </g>
          {[[640, 1150, 46], [980, 1160, 38], [560, 1200, 30], [1090, 1205, 34], [760, 1190, 26]].map(([x, y, r], i) => (
            <g key={`b${i}`}><ellipse cx={x + 4} cy={y + 6} rx={r} ry={r * 0.6} fill="#3c3430" opacity={0.35} /><ellipse cx={x} cy={y} rx={r} ry={r * 0.6} fill="#857a71" /><ellipse cx={x - r * 0.3} cy={y - r * 0.2} rx={r * 0.4} ry={r * 0.2} fill="#a39990" opacity={0.7} /></g>
          ))}
          <path d="M825,700 L880,700 L1180,1225 L900,1225 Z" fill="#000" opacity={0.18} />
          <path d="M770,700 L880,700 L860,716 L790,716 Z" fill="#3c3430" />
          {erupt > 0 ? (
            <g>
              <ellipse cx={825} cy={700} rx={70} ry={26} fill={C.orange} opacity={0.6 + 0.3 * Math.sin(t * 12)} filter="url(#blur8)" />
              {Array.from({ length: 22 }, (_, i) => {
                const age = erupt - i * 0.13;
                if (age <= 0) return null;
                const r = 34 + age * 30;
                const x = 825 - age * (40 + hash(i) * 60) + Math.sin(i * 2.1) * 30;
                const y = 690 - age * (150 + hash(i + 3) * 60);
                return <g key={i}><circle cx={x + 8} cy={y + 10} r={r} fill="#77706a" opacity={0.6} /><circle cx={x} cy={y} r={r} fill={i % 2 ? "#a49d94" : "#b8b1a7"} /></g>;
              })}
              {[0, 1, 2].map((i) => (
                <path key={i} d={`M${810 + i * 12},716 q${-20 + i * 20},${60 + i * 20} ${-30 + i * 30},${160 + i * 30}`} stroke={C.orange} strokeWidth={10} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ease(ramp(t, 22.6 + i * 0.3, 23.6 + i * 0.3))} />
              ))}
            </g>
          ) : null}
          {/* ash fall */}
          <g opacity={ramp(t, 22.9, 23.5) * (1 - ramp(t, 25.4, 26.0))}>
            {Array.from({ length: 110 }, (_, i) => {
              const x = hash(i) * 1080 - 60;
              const y = 520 + ((t * (120 + hash(i + 7) * 80) + hash(i + 50) * 700) % 700);
              return <circle key={i} cx={x} cy={y} r={2.5 + hash(i * 3) * 3.5} fill="#8f8a84" opacity={0.55} />;
            })}
          </g>
          {/* ground section */}
          <rect x={-200} y={1220} width={1480} height={700} fill="#5f5853" />
          <rect x={-200} y={1220} width={1480} height={700} fill="#fff" filter="url(#grain)" opacity={0.5} />
          <g transform="translate(-200,1220)"><Strata w={1480} h={700} seed={33} n={9} /><Inclusions w={1480} h={700} seed={34} /></g>
          {layers.map((L, i) => (
            <g key={i}>
              <rect x={-200} y={L.y} width={1480} height={L.th} fill={L.col} />
              <rect x={-200} y={L.y} width={1480} height={L.th} fill="#fff" filter="url(#grain)" opacity={0.35} />
              <line x1={-200} y1={L.y} x2={1280} y2={L.y} stroke="#fff6e6" strokeOpacity={0.5} strokeWidth={2} />
            </g>
          ))}
          <line x1={-200} y1={1220 - acc} x2={1280} y2={1220 - acc} stroke={C.cyan} strokeWidth={3} />
          {comp > 0 ? [180, 420, 660].map((x, i) => (
            <g key={i} opacity={comp * (1 - ramp(t, 26.2, 26.6))} transform={`translate(${x},${1220 - acc - 90 + 18 * Math.sin(t * 6 + i)})`}>
              <path d="M-14,-40 h28 v34 h18 l-32,36 l-32,-36 h18 z" fill={C.cyan} />
            </g>
          )) : null}
          <Tag x={300} y={1450} ax={360} ay={1220 - acc / 2} text={comp > 0.5 ? "BATU TUF" : "LAPISAN ABU"} p={ramp(t, 24.2, 24.8)} size={40} accent={comp > 0.5 ? C.orange : C.cyan} />
        </g>
      ) : null}
      {/* D: carving */}
      {pD > 0 ? (
        <g opacity={pD} transform={cam(1.04 - 0.04 * ease(ramp(t, 26.6, 29)), 540, 1000)}>
          <Studio id="s3d" grid={false} />
          <Slab x={-40} y={460} w={1160} h={1500} id="s3d" seed={9}>
            <Cavity d={vault(580 - w / 2, 640 - w * 0.4, w, w * 0.8)} glow={[580, 640 + w * 0.36, w * 0.5]} />
            <Lamp x={580 - w * 0.25} y={640 + w * 0.3} t={t} s={0.8} />
            {hitT.map((h) => t > h ? Array.from({ length: 6 }, (_, i) => {
              const dt = t - h;
              if (dt > 1.1) return null;
              const x0 = 580 + w / 2 + 8, y0 = 640 - w * 0.12;
              return <path key={`${h}-${i}`} d={chunk(6 + hash(i + h) * 8, i + h * 10)} transform={`translate(${x0 - dt * (60 + hash(i) * 160)},${y0 - dt * (80 + hash(i + 4) * 120) + 600 * dt * dt})`} fill={C.t2} stroke={C.t5} strokeWidth={1.5} />;
            }) : null)}
          </Slab>
          {/* chisel + hammer */}
          <g transform={`translate(${-40 + 580 + w / 2 + 14},${460 + 640 - w * 0.12})`}>
            <g transform="rotate(-28)">
              <rect x={0} y={-8} width={150} height={16} rx={3} fill="#7b828a" />
              <path d="M0,-8 L-22,0 L0,8 Z" fill="#9aa1a8" />
              <rect x={150} y={-12} width={30} height={24} rx={4} fill="#5c4632" />
            </g>
            <g transform={`rotate(-28) translate(${236 - 40 * tap},0)`}>
              <rect x={0} y={-30} width={46} height={60} rx={8} fill="#58606a" />
              <rect x={14} y={30} width={14} height={120} rx={6} fill="#8a5a3a" />
            </g>
          </g>
          <Dust t={t} n={20} seed={8} area={[400, 900, 500, 400]} col="#f3dcb8" />
        </g>
      ) : null}
    </Frame>
  );
};

const Rider: React.FC<{ x: number; y: number; t: number; ph: number }> = ({ x, y, t, ph }) => {
  const g = Math.sin(t * 12 + ph);
  return (
    <g transform={`translate(${x},${y + Math.abs(g) * -4})`}>
      <ellipse cx={0} cy={4} rx={60} ry={8} fill="#000" opacity={0.25} />
      {[-34, -20, 22, 36].map((lx, i) => <rect key={i} x={lx} y={-40} width={8} height={40} rx={3} fill="#5a2622" transform={`rotate(${(i % 2 ? g : -g) * 20},${lx + 4},-40)`} />)}
      <ellipse cx={0} cy={-52} rx={48} ry={20} fill="#6b2e2a" />
      <path d="M38,-60 l26,-22 l10,8 l-18,26 z" fill="#6b2e2a" />
      <Person x={-6} y={-60} s={0.5} col="#4a1f1c" helmet />
      <line x1={10} y1={-110} x2={60} y2={-150} stroke="#4a1f1c" strokeWidth={4} />
    </g>
  );
};

/* ───────────── S4 History: Phrygia → Byzantium, levels grow, raiders ───────────── */
const S4: React.FC<SceneProps> = ({ t }) => {
  const mk = keys(t, [[29.3, 140], [31.0, 260], [33.6, 300], [35.0, 760], [38.8, 830]]);
  const lv = keys(t, [[29.2, 0.4], [31.4, 1.4], [33.6, 2.3], [34.3, 2.4], [36.2, 6.0], [38.8, 6.4]]);
  const CX = 130, CY = 860, CS = 0.8;
  const L = Math.max(0, Math.min(7, Math.ceil(lv) - 1));
  const ly = CY + (LEVEL_Y(L) + 78) * CS;
  const raid = ramp(t, 35.9, 38.8);
  const ty = -keys(t, [[29, 0], [38.8, 150]]);
  return (
    <Frame id="s4">
      <g transform={cam(1 + 0.04 * ease(ramp(t, 29, 38.8)), 540, 1000, 0, ty)}>
        <Studio id="s4" />
        {/* timeline */}
        <g>
          <rect x={100} y={560} width={880} height={16} rx={8} fill="#c4d2ce" />
          <rect x={100} y={560} width={mk - 100} height={16} rx={8} fill={C.cyan} />
          {[[260, "±700 SM", "FRIGIA"], [760, "± ABAD 7–12 M", "BIZANTIUM"]].map(([x, a, b], i) => (
            <g key={i} opacity={ramp(mk, (x as number) - 60, (x as number))}>
              <circle cx={x as number} cy={568} r={20} fill={i ? C.orange : C.cyan} stroke="#fff" strokeWidth={5} />
              <text x={x as number} y={640} textAnchor="middle" fontFamily="Anton" fontSize={46} fill={C.ink}>{b as string}</text>
              <text x={x as number} y={680} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={36} fill={C.inkSoft}>{a as string}</text>
            </g>
          ))}
          <circle cx={mk} cy={568} r={12} fill="#fff" stroke={C.ink} strokeWidth={4} />
        </g>
        <City x={CX} y={CY} s={CS} t={t} id="s4" fx={{ levels: lv }} />
        {/* diggers at the newest level */}
        {[300, 560].map((x, i) => {
          const sw = Math.sin(t * 7 + i * 1.7);
          return (
            <g key={i}>
              <Person x={x} y={ly - 4} s={0.62} col={i ? "#8a3c20" : C.ink} />
              <g transform={`translate(${x + 8},${ly - 52}) rotate(${-40 + sw * 45})`}>
                <rect x={0} y={-3} width={50} height={6} fill="#8a5a3a" />
                <path d="M46,-16 q10,16 0,32 l6,0 q8,-16 0,-32 z" fill="#58606a" />
              </g>
            </g>
          );
        })}
        {/* raiders and villagers on the surface */}
        {raid > 0 ? [0, 1, 2].map((i) => <Rider key={i} x={lerp(-260, 330, easeOut(raid)) - i * 150} y={CY - 6} t={t} ph={i} />) : null}
        {raid > 0 ? (
          <path d={`M${lerp(-100, 420, easeOut(raid))},${CY - 150} l60,0 l-14,-14 M${lerp(-100, 420, easeOut(raid)) + 60},${CY - 150} l-14,14`} stroke={C.red} strokeWidth={8} fill="none" strokeLinecap="round" opacity={raid} />
        ) : null}
        {raid > 0 ? [0, 1, 2, 3].map((i) => {
          const k = ramp(t, 36.0 + i * 0.35, 37.6 + i * 0.35);
          const ex = CX + 470 * CS;
          const x = lerp(760 + i * 60, ex, ease(ramp(k, 0, 0.6)));
          const y = CY - 4 + 300 * ease(ramp(k, 0.6, 1));
          return <Person key={i} x={x} y={y} s={0.5} col="#f2e3cc" pose="walk" t={t} ph={i} />;
        }) : null}
      </g>
    </Frame>
  );
};

/* ───────────── S5 Inside the city: descending through the rooms ───────────── */
const ROOM_TOP = (i: number) => 140 + i * 520;
const RW = 880, RH5 = 380;
const S5: React.FC<SceneProps> = ({ t }) => {
  const SX = 60, SY = 300;
  const cen = (i: number) => SY + ROOM_TOP(i) + RH5 / 2;
  const cy = keys(t, [[38.8, cen(0) - 260], [39.9, cen(0)], [41.1, cen(1)], [42.2, cen(2)], [43.8, cen(3)], [45.4, cen(4)], [47.2, cen(4) + 70]]);
  const tx = keys(t, [[43.6, 0], [44.1, 70], [44.6, -90], [45.2, -60], [45.6, 0]]);
  const ty = 900 - cy;
  const fire = (k: number) => 1 + 0.15 * Math.sin(t * 15 + k) + 0.08 * Math.sin(t * 31 + k * 2);
  const room = (i: number) => vault(40, ROOM_TOP(i), RW, RH5);
  const fl = (i: number) => ROOM_TOP(i) + RH5;
  return (
    <Frame id="s5">
      <g transform={`translate(${tx},${ty})`}>
        <g transform={`translate(0,${-ty * 0.85})`}><Studio id="s5" /></g>
        <Slab x={SX} y={SY} w={960} h={2900} id="s5" seed={13}>
          {[0, 1, 2, 3, 4].map((i) => <Cavity key={i} d={room(i)} glow={[480, fl(i) - 20, 260]} />)}
          {/* connecting ramps + air shaft */}
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M${i % 2 ? 820 : 80},${fl(i) - 4} L${i % 2 ? 900 : 140},${fl(i) - 4} L${i % 2 ? 860 : 120},${ROOM_TOP(i + 1) + 200} L${i % 2 ? 780 : 60},${ROOM_TOP(i + 1) + 200} Z`} fill="url(#cavG)" />
          ))}
          <rect x={918} y={0} width={18} height={2900} fill="url(#cavG)" />
          <Flow d="M927,0 L927,2900" t={t} p={1} w={5} speed={160} />
          {/* 0 · livestock pen */}
          <g>
            {[180, 300, 420, 540, 660].map((x, i) => <rect key={i} x={x} y={fl(0) - 110} width={10} height={110} fill="#8a5a3a" />)}
            <rect x={170} y={fl(0) - 96} width={510} height={10} fill="#8a5a3a" />
            <rect x={170} y={fl(0) - 50} width={510} height={10} fill="#8a5a3a" />
            <ellipse cx={780} cy={fl(0) - 20} rx={100} ry={36} fill="#d9b85a" />
            <ellipse cx={780} cy={fl(0) - 34} rx={70} ry={20} fill="#ecd27a" />
            <Goat x={260} y={fl(0) - 4} s={1.3} t={t} />
            <Goat x={470} y={fl(0) - 4} s={1.15} t={t} ph={2} />
            <Goat x={640} y={fl(0) - 4} s={1.0} t={t} ph={4} />
            <Lamp x={120} y={ROOM_TOP(0) + 170} t={t} s={1} />
            <Tag x={420} y={ROOM_TOP(0) + 90} ax={470} ay={fl(0) - 70} text="KANDANG TERNAK" p={ramp(t, 39.4, 39.8)} size={44} />
          </g>
          {/* 1 · shared kitchen with tandır */}
          <g>
            <ellipse cx={480} cy={fl(1) - 6} rx={130} ry={22} fill="#000" opacity={0.4} />
            <path d={`M360,${fl(1)} C360,${fl(1) - 120} 600,${fl(1) - 120} 600,${fl(1)} Z`} fill={C.t3} />
            <path d={`M360,${fl(1)} C360,${fl(1) - 120} 600,${fl(1) - 120} 600,${fl(1)} Z`} fill="#fff" filter="url(#grain)" opacity={0.4} />
            <path d={vault(430, fl(1) - 64, 100, 64)} fill="#2a120a" />
            <ellipse cx={480} cy={fl(1) - 30} rx={90} ry={60} fill="url(#lampG)" />
            {[0, 1, 2].map((k) => (
              <path key={k} transform={`translate(${458 + k * 22},${fl(1) - 8}) scale(${0.8 + k * 0.15},${fire(k)})`} d="M0,0 q-14,-20 0,-48 q14,22 0,48 z" fill={k === 1 ? "#ffd36b" : C.orange} />
            ))}
            {Array.from({ length: 9 }, (_, k) => {
              const age = (t * 0.6 + k / 9) % 1;
              return <circle key={k} cx={480 + Math.sin(age * 6 + k) * 30} cy={fl(1) - 110 - age * 230} r={18 + age * 30} fill="#cfc4b6" opacity={0.35 * (1 - age)} />;
            })}
            <rect x={110} y={ROOM_TOP(1) + 190} width={180} height={12} fill="#8a5a3a" />
            {[130, 180, 235].map((x, k) => <path key={k} d={`M${x},${ROOM_TOP(1) + 190} q-6,-40 20,-44 q26,4 20,44 z`} fill={k % 2 ? C.t3 : "#b8734a"} />)}
            <Person x={690} y={fl(1) - 4} s={1.15} col="#f2e3cc" pose="crouch" t={0} />
            <Person x={800} y={fl(1) - 4} s={1.2} col="#e9c9a0" t={t} />
            <Tag x={480} y={ROOM_TOP(1) + 80} ax={480} ay={fl(1) - 70} text="DAPUR BERSAMA · TANDIR" p={ramp(t, 41.1, 41.6)} size={50} accent={C.cyan} />
          </g>
          {/* 2 · wine press */}
          <g>
            <rect x={110} y={fl(2) - 120} width={330} height={120} fill={C.t3} />
            <rect x={110} y={fl(2) - 120} width={330} height={120} fill="#fff" filter="url(#grain)" opacity={0.4} />
            <rect x={126} y={fl(2) - 104} width={298} height={40} fill="#5b2a4a" />
            {Array.from({ length: 22 }, (_, k) => <circle key={k} cx={140 + (k % 11) * 26} cy={fl(2) - 112 - Math.floor(k / 11) * 18} r={13} fill={k % 3 ? "#6d3460" : "#8a4a7a"} />)}
            <Person x={270} y={fl(2) - 120 - Math.abs(Math.sin(t * 5)) * 10} s={1.0} col="#f2e3cc" pose="walk" t={t} />
            <Flow d={`M440,${fl(2) - 70} Q560,${fl(2) - 60} 640,${fl(2) - 40}`} t={t} p={1} col="#8a2f6a" w={9} speed={90} />
            <path d={`M640,${fl(2)} q-30,-10 -26,-60 q4,-30 34,-40 h24 q30,10 34,40 q4,50 -26,60 z`} fill="#b8734a" />
            <rect x={650} y={fl(2) - 116} width={36} height={14} rx={4} fill="#8f5636" />
            <Tag x={600} y={ROOM_TOP(2) + 90} ax={300} ay={fl(2) - 120} text="PERASAN ANGGUR" p={ramp(t, 42.2, 42.7)} size={44} accent="#a2457f" />
          </g>
          {/* 3 · storage + well */}
          <g>
            {Array.from({ length: 8 }, (_, k) => {
              const x = 110 + (k % 4) * 100, y = fl(3) - (k < 4 ? 0 : 0);
              const sc = k < 4 ? 1 : 0.8;
              const xx = k < 4 ? x : x + 50;
              const yy = k < 4 ? y : y - 140;
              return <g key={k} transform={`translate(${xx},${yy}) scale(${sc})`}>
                <path d="M0,0 q-40,-30 -36,-80 q4,-34 28,-44 v-14 h16 v14 q24,10 28,44 q4,50 -36,80 z" fill={k % 2 ? "#c07a4c" : "#a9653e"} />
                <path d="M-20,-90 q10,-20 30,-10" stroke="#fff" strokeOpacity={0.35} strokeWidth={5} fill="none" />
              </g>;
            })}
            <rect x={100} y={fl(3) - 140} width={420} height={10} fill="#8a5a3a" />
            {/* well */}
            <rect x={710} y={fl(3) - 4} width={90} height={400} fill="url(#cavG)" />
            <rect x={710} y={fl(3) + 330} width={90} height={70} fill={C.water} />
            <rect x={690} y={fl(3) - 46} width={130} height={46} rx={8} fill={C.t3} stroke={C.t5} strokeWidth={3} />
            <rect x={700} y={fl(3) - 190} width={10} height={150} fill="#8a5a3a" />
            <rect x={800} y={fl(3) - 190} width={10} height={150} fill="#8a5a3a" />
            <rect x={694} y={fl(3) - 196} width={122} height={14} rx={6} fill="#6e4a30" />
            {(() => { const by = fl(3) - 120 + (Math.sin(t * 1.6) * 0.5 + 0.5) * 380; return (<g><line x1={755} y1={fl(3) - 190} x2={755} y2={by} stroke="#d8c4a2" strokeWidth={3} /><path d={`M738,${by} h34 l-5,34 h-24 z`} fill="#8f5636" /></g>); })()}
            <Tag x={300} y={ROOM_TOP(3) + 80} ax={300} ay={fl(3) - 150} text="GUDANG" p={ramp(t, 44.0, 44.5)} size={44} />
            <Tag x={720} y={ROOM_TOP(3) + 80} ax={755} ay={fl(3) - 50} text="SUMUR" p={ramp(t, 44.4, 44.9)} size={44} accent={C.water} />
          </g>
          {/* 4 · church at the bottom */}
          <g>
            <Cavity d={vault(380, ROOM_TOP(4) - 60, 200, 140)} outline />
            {[200, 360, 600, 760].map((x, k) => <rect key={k} x={x - 18} y={ROOM_TOP(4) + 150} width={36} height={RH5 - 150} fill={C.t3} opacity={0.9} />)}
            {[200, 360, 600, 760].map((x, k) => <path key={`a${k}`} d={`M${x - 80},${ROOM_TOP(4) + 156} q80,-70 160,0`} stroke={C.t3} strokeWidth={14} fill="none" />)}
            <g transform={`translate(480,${ROOM_TOP(4) + 150})`}>
              <circle r={120} fill="url(#lampG)" opacity={0.8 + 0.2 * Math.sin(t * 3)} />
              <rect x={-12} y={-70} width={24} height={150} fill="#f7dcb4" />
              <rect x={-55} y={-30} width={110} height={24} fill="#f7dcb4" />
            </g>
            <Lamp x={280} y={ROOM_TOP(4) + 260} t={t} s={0.9} />
            <Lamp x={680} y={ROOM_TOP(4) + 260} t={t} s={0.9} ph={3} />
            {[300, 420, 540, 660].map((x, k) => <Person key={k} x={x} y={fl(4) - 4} s={0.9} col="#f2e3cc" t={t} ph={k} />)}
            <Tag x={480} y={fl(4) + 70} ax={480} ay={fl(4) - 120} text="GEREJA · LANTAI TERBAWAH" p={ramp(t, 45.6, 46.1)} size={40} accent={C.orange} />
          </g>
        </Slab>
      </g>
    </Frame>
  );
};

/* ───────────── S6 Rolling stone door + narrow corridor ───────────── */
const S6: React.FC<SceneProps> = ({ t }) => {
  const pA = 1 - ease(ramp(t, 52.9, 53.5));
  const pB = ease(ramp(t, 52.9, 53.5));
  const dx = keys(t, [[48.4, 270], [50.5, 640]]);
  const rot = ((dx - 270) / 220) * (180 / Math.PI);
  const thud = pulse(t, 50.45, 0.25);
  return (
    <Frame id="s6">
      {pA > 0 ? (
        <g opacity={pA} transform={`translate(${Math.sin(t * 80) * 6 * thud},0)`}>
          <g transform={cam(1 + 0.12 * ease(ramp(t, 47.2, 52.9)), 600, 1020)}>
            <Studio id="s6" />
            <Slab x={-40} y={400} w={1160} h={1500} id="s6" seed={17}>
              <Cavity d={rrect(-20, 400, 1200, 440, 30)} glow={[900, 820, 200]} />
              <Cavity d={rrect(40, 380, 470, 480, 30)} outline />
              <Lamp x={960} y={560} t={t} s={1.1} />
              <rect x={-20} y={836} width={1200} height={10} fill="#1a110c" opacity={0.5} />
              <StoneDoor x={dx} y={620} r={218} rot={rot} />
              {t > 51.0 ? <Person x={lerp(1100, 900, ease(ramp(t, 51.0, 51.8)))} y={838} s={1.5} col={C.cyanLt} pose="push" /> : null}
              {t > 51.4 ? (
                <g opacity={ease(ramp(t, 51.4, 51.9))}>
                  <Person x={300} y={838} s={1.45} col="#6b2e2a" helmet />
                  <g transform="translate(330,620)" stroke={C.red} strokeWidth={16} strokeLinecap="round">
                    <line x1={-40} y1={-40} x2={40} y2={40} />
                    <line x1={40} y1={-40} x2={-40} y2={40} />
                  </g>
                </g>
              ) : null}
              <Flow d="M1000,330 L700,330" t={t} p={ramp(t, 51.4, 51.9)} col={C.orange} w={10} />
            </Slab>
            <FgRock x={-120} y={1520} s={1.4} />
          </g>
        </g>
      ) : null}
      {pB > 0 ? (
        <g opacity={pB} transform={cam(1.0, 540, 1000, -keys(t, [[53.2, -40], [58, 160]]))}>
          <Studio id="s6b" />
          <Slab x={-120} y={420} w={1400} h={1500} id="s6b" seed={19}>
            <Cavity d={rrect(-40, 520, 1500, 230, 40)} glow={[700, 740, 220]} />
            <Lamp x={300} y={600} t={t} s={0.8} />
            <Lamp x={1000} y={600} t={t} s={0.8} ph={2} />
            {[0, 1, 2, 3].map((i) => {
              const x = 120 + (t - 53.2) * 70 + i * 230;
              return (
                <g key={i}>
                  <Person x={x} y={748} s={1.2} col="#6b2e2a" pose="crouch" t={t} ph={i * 1.3} helmet />
                  {t > 56.6 + i * 0.2 ? (
                    <g transform={`translate(${x + 30},${470})`} opacity={ease(ramp(t, 56.6 + i * 0.2, 56.9 + i * 0.2))}>
                      <circle r={34} fill={C.orange} stroke="#fff" strokeWidth={4} />
                      <text y={14} textAnchor="middle" fontFamily="Anton" fontSize={40} fill="#fff">{i + 1}</text>
                    </g>
                  ) : null}
                </g>
              );
            })}
            <line x1={-40} y1={515} x2={1460} y2={515} stroke={C.cyan} strokeWidth={4} />
            <line x1={-40} y1={755} x2={1460} y2={755} stroke={C.cyan} strokeWidth={4} />
            <g opacity={ramp(t, 54.0, 54.5)}>
              <path d="M1240,520 v230 M1220,520 h40 M1220,750 h40" stroke={C.orange} strokeWidth={5} fill="none" />
              <text x={1205} y={650} textAnchor="end" fontFamily="Space Grotesk" fontWeight={700} fontSize={34} fill="#fff" style={{ color: "#fff" }}>RENDAH</text>
            </g>
          </Slab>
          <FgRock x={1080} y={1600} s={1.5} flip />
          <Tag x={540} y={1300} ax={460} ay={1100} text="MEMBUNGKUK, SATU-SATU" p={ramp(t, 55.4, 55.9)} size={40} accent={C.red} />
        </g>
      ) : null}
    </Frame>
  );
};

/* ───────────── S7 Payoff: air shafts, well, poison blocked ───────────── */
const S7: React.FC<SceneProps> = ({ t }) => {
  const CX = 70, CY = 590, CS = 0.88;
  const s = keys(t, [[58, 1.2], [60.6, 1.0], [65.2, 1.17], [67.2, 1.22], [70.2, 1.24]]);
  const oy = keys(t, [[58, 900], [65.2, 1060], [67.2, 820]]);
  const ox = keys(t, [[58, 540], [65.2, 500], [67.2, 640]]);
  const wellX = CX + WELL_X * CS;
  const pour = ramp(t, 67.8, 69.4);
  const blocked = ease(ramp(t, 69.3, 69.6));
  const shake = pulse(t, 69.6, 0.3);
  return (
    <Frame id="s7">
      <g transform={`translate(${Math.sin(t * 90) * 8 * shake},0)`}>
        <g transform={cam(s, ox, oy)}>
          <Studio id="s7" />
          <City x={CX} y={CY} s={CS} t={t} id="s7" fx={{ people: 1, air: ramp(t, 60.9, 64.6), airLit: t > 61 ? t - 61 : undefined, well: ramp(t, 65.4, 66.8) }} />
          {/* air intakes on the surface */}
          {[210, 470, 900].map((ax, i) => (
            <g key={i} opacity={ramp(t, 60.8, 61.3)}>
              <circle cx={CX + ax * CS} cy={CY - 24} r={30 + 6 * Math.sin(t * 4 + i)} fill="url(#cyanG)" />
              <path d={`M${CX + ax * CS},${CY - 110} v60 m-16,-16 l16,16 l16,-16`} stroke={C.cyan} strokeWidth={7} fill="none" strokeLinecap="round" />
            </g>
          ))}
          <Tag x={wellX + 190} y={CY + 140} ax={wellX + 36} ay={CY + 110} text="TAK TEMBUS" p={ramp(t, 66.4, 66.9)} size={34} accent={C.red} />
          {/* enemy pours poison */}
          {t > 67.5 ? (
            <g opacity={ease(ramp(t, 67.5, 67.9))}>
              <Person x={wellX + 40} y={CY - 6} s={0.95} col="#6b2e2a" helmet />
              <path d={`M${wellX + 10},${CY - 82} q-10,-20 4,-34 h18 q14,14 4,34 z`} fill="#4f7a2e" transform={`rotate(${-50 * ease(pour)},${wellX + 20},${CY - 90})`} />
              {Array.from({ length: 8 }, (_, i) => {
                const a = ((t - 67.9) * 1.6 + i / 8) % 1;
                if (t < 67.9) return null;
                return <circle key={i} cx={wellX - 4 + Math.sin(i) * 4} cy={CY - 80 + a * 74} r={7} fill="#6fbf3a" opacity={1 - blocked * 0.6} />;
              })}
              <ellipse cx={wellX - 4} cy={CY - 4} rx={40 * pour} ry={8} fill="#6fbf3a" opacity={0.8} />
            </g>
          ) : null}
          {blocked > 0 ? (
            <g transform={`translate(${wellX},${CY + 60}) scale(${1.5 - 0.5 * blocked})`} opacity={blocked} stroke={C.red} strokeWidth={22} strokeLinecap="round">
              <line x1={-60} y1={-60} x2={60} y2={60} />
              <line x1={60} y1={-60} x2={-60} y2={60} />
            </g>
          ) : null}
        </g>
      </g>
    </Frame>
  );
};

/* ───────────── S8 1923 golden hour, only 10% opened ───────────── */
const S8: React.FC<SceneProps> = ({ t }) => {
  const ty = keys(t, [[70.2, 300], [72.6, 0], [76.3, -50]]);
  const CX = 80, CY = 900, CS = 0.84;
  return (
    <Frame id="s8">
      <g transform={`translate(0,${ty})`}>
        <defs>
          <linearGradient id="sky8" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6c98c" />
            <stop offset="0.5" stopColor="#f2a56c" />
            <stop offset="1" stopColor="#dd8a62" />
          </linearGradient>
        </defs>
        <rect x={-100} y={-600} width={1280} height={2800} fill="url(#sky8)" />
        <circle cx={760} cy={560} r={200} fill="#fff1c8" opacity={0.35} filter="url(#blur40)" />
        <circle cx={760} cy={560} r={96} fill="#fff1c8" />
        {[[40, 230], [170, 320], [300, 190], [620, 280], [760, 360], [930, 240], [1040, 300]].map(([x, h], i) => (
          <Chimney key={i} x={x} y={CY - 40} h={h} col="#c98a62" cap={false} />
        ))}
        {[[110, 200], [380, 260], [850, 220]].map(([x, h], i) => <Chimney key={`f${i}`} x={x} y={CY - 10} h={h} col="#e3a774" />)}
        <City x={CX} y={CY} s={CS} t={t} id="s8" top="#d9a46a" fx={{ people: 1 - ramp(t, 71.6, 73.0), tenPct: ramp(t, 73.9, 74.8) }} />
        <Dust t={t} n={22} seed={21} col="#fff1c8" area={[0, 300, 1080, 600]} />
      </g>
    </Frame>
  );
};

/* ───────────── S9 Hundreds of cities + entrance with AUDIRA plaque ───────────── */
const S9: React.FC<SceneProps> = ({ t }) => {
  const pA = 1 - ease(ramp(t, 80.5, 81.1));
  const pB = ease(ramp(t, 80.5, 81.1));
  const dk = [540, 1010];
  return (
    <Frame id="s9">
      {pA > 0 ? (
        <g opacity={pA} transform={cam(1 + 0.08 * ease(ramp(t, 76.3, 81)), dk[0], dk[1])}>
          <Studio id="s9" />
          <rect x={86} y={536} width={920} height={860} rx={28} fill="#1d2b33" opacity={0.2} filter="url(#blur18)" transform="translate(8,14)" />
          <rect x={80} y={530} width={920} height={860} rx={28} fill="#ead2ad" stroke={C.cyan} strokeWidth={3} />
          <g fill="none" stroke={C.t4} strokeOpacity={0.35} strokeWidth={2}>
            {Array.from({ length: 7 }, (_, i) => (
              <ellipse key={i} cx={720 + i * 6} cy={760 + i * 4} rx={60 + i * 42} ry={36 + i * 26} />
            ))}
            {Array.from({ length: 5 }, (_, i) => (
              <ellipse key={`b${i}`} cx={300} cy={1180} rx={40 + i * 40} ry={26 + i * 22} />
            ))}
          </g>
          <path d="M80,640 C260,600 380,700 560,640 S860,580 1000,620" stroke={C.water} strokeWidth={10} fill="none" opacity={0.75} />
          <text x={540} y={1360} textAnchor="middle" fontFamily="Anton" fontSize={60} fill={C.t5} opacity={0.6} letterSpacing={10}>KAPADOKIA</text>
          {Array.from({ length: 170 }, (_, i) => {
            const x = 120 + hash(i * 3 + 1) * 840, y = 570 + hash(i * 7 + 2) * 740;
            const p = ramp(t, 77.4 + (i / 170) * 2.8, 77.6 + (i / 170) * 2.8);
            if (p <= 0) return null;
            const sc = p < 1 ? 1 + 0.6 * Math.sin(Math.PI * p) : 1;
            return <g key={i} transform={`translate(${x},${y}) scale(${sc * p})`}><circle r={10} fill={C.orange} opacity={0.9} /><circle r={10} fill="none" stroke="#fff" strokeWidth={3} /></g>;
          })}
          <circle cx={dk[0]} cy={dk[1]} r={22} fill={C.cyan} stroke="#fff" strokeWidth={5} />
          <circle cx={590} cy={880} r={16} fill={C.cyan} stroke="#fff" strokeWidth={4} />
          <Tag x={330} y={1120} ax={dk[0]} ay={dk[1]} text="DERINKUYU" p={ramp(t, 76.6, 77.1)} size={38} />
          <Tag x={800} y={800} ax={590} ay={880} text="KAYMAKLI" p={ramp(t, 77.0, 77.5)} size={34} />
        </g>
      ) : null}
      {pB > 0 ? (
        <g opacity={pB} transform={cam(1 + 0.12 * ease(ramp(t, 80.5, 86)), 540, 1060)}>
          <defs>
            <linearGradient id="sky9" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f7dcb0" />
              <stop offset="1" stopColor="#efb98a" />
            </linearGradient>
          </defs>
          <rect x={-200} y={-200} width={1480} height={2400} fill="url(#sky9)" />
          {[[60, 420], [250, 520], [860, 560], [1030, 400]].map(([x, h], i) => <Chimney key={i} x={x} y={1200} h={h} col={i % 2 ? C.t1 : "#e4bf92"} />)}
          <path d="M140,1700 L140,980 C200,720 420,640 540,640 C660,640 880,720 940,980 L940,1700 Z" fill={C.t2} />
          <path d="M140,1700 L140,980 C200,720 420,640 540,640 C660,640 880,720 940,980 L940,1700 Z" fill="#fff" filter="url(#mottle)" opacity={0.5} />
          <path d="M140,1700 L140,980 C200,720 420,640 540,640 C660,640 880,720 940,980 L940,1700 Z" fill="#fff" filter="url(#grain)" opacity={0.5} />
          <path d="M140,1700 L140,980 C200,720 420,640 540,640 C660,640 880,720 940,980 L940,1700 Z" fill="none" stroke={C.cyan} strokeWidth={3} />
          {/* plaque */}
          <g transform="translate(540,900)">
            <rect x={-330} y={-74} width={660} height={148} rx={18} fill="#000" opacity={0.25} filter="url(#blur8)" transform="translate(8,12)" />
            <rect x={-330} y={-74} width={660} height={148} rx={18} fill={C.t1} stroke={C.t4} strokeWidth={6} />
            <rect x={-330} y={-74} width={660} height={148} rx={18} fill="#fff" filter="url(#grain)" opacity={0.5} />
            <text x={0} y={20} stroke="#fff4e0" strokeWidth={4} style={{ paintOrder: "stroke" }} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={60} fill={C.t5} letterSpacing={4}>AUDIRA · FAKTA DUNIA</text>
          </g>
          {/* entrance */}
          <Cavity d={vault(400, 1030, 280, 330)} glow={[540, 1330, 160]} />
          <Lamp x={470} y={1150} t={t} s={1} />
          <Lamp x={610} y={1150} t={t} s={1} ph={2} />
          {Array.from({ length: 4 }, (_, i) => <rect key={i} x={380 - i * 20} y={1360 + i * 22} width={320 + i * 40} height={22} fill={mix(C.t2, "#ffffff", 0.15 + i * 0.05)} />)}
          {[0, 1, 2].map((i) => {
            const k = ((t - 80.6) * 0.18 + i / 3) % 1;
            return <Person key={i} x={lerp(860, 560, k)} y={lerp(1450, 1360, k)} s={lerp(1.0, 0.7, k)} col={i === 1 ? C.orange : C.ink} pose="walk" t={t} ph={i} />;
          })}
        </g>
      ) : null}
    </Frame>
  );
};

export const SCENE_MAP: Record<string, React.FC<SceneProps>> = { S1, S2, S3, S4, S5, S6, S7, S8, S9 };
export { CW };
