// EP18 Longyearbyen, Svalbard — scenes S1–S10. Each gets global t (s) and local lt (s since scene start), draws in 1080 × 1920.
// Lighting rule: key light upper-left on every set (Rays + LightPool), long cast shadows via P/Layered, camera never parks.
import React from "react";
import {
  C, P, PaperDefs, Layered, Drift, Mountain, House, Aurora, LightPool, Rays, Stars, Snowfall, Figure, Cross, Coffin, Crystal,
  Tent, Magnifier, VirusIcon, Plane, Urn, Bear, BearSign, FlareGlow, VaultDoor, SeedBox, Thermometer,
  blob, circle, ellipse, rect, wave, waveLine, hash, ramp, ease, easeOut, lerp, mix,
} from "./pieces";

export type SceneProps = { t: number; lt: number };

const Frame: React.FC<{ children: React.ReactNode; bg?: [string, string]; id: string; vig?: number }> = ({ children, bg, id, vig = 0.45 }) => (
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
        <stop offset="0.5" stopColor="#1E1430" stopOpacity="0" />
        <stop offset="1" stopColor="#1E1430" stopOpacity={vig} />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill={`url(#vig-${id})`} />
  </svg>
);

const cam = (s: number, ox: number, oy: number, tx = 0, ty = 0, rot = 0) =>
  `translate(${ox + tx},${oy + ty}) rotate(${rot}) scale(${s}) translate(${-ox},${-oy})`;

const Sun: React.FC<{ x: number; y: number; r: number; col?: string }> = ({ x, y, r, col = C.gold }) => (
  <g>
    <path d={circle(x, y, r * 1.7)} fill={mix(col, "#ffffff", 0.55)} opacity={0.3} filter="url(#psoft)" />
    <P d={circle(x, y, r)} fill={col} noShadow />
  </g>
);

const HOUSE_X = [110, 255, 400, 540, 690, 835, 975];

/** Row of 7 Longyearbyen houses on a ground line; pop-up rise per house. */
const Town: React.FC<{ y: number; rise: (i: number) => number; lit: number; centerSign?: string; scale?: number }> = ({ y, rise, lit, centerSign, scale = 1 }) => (
  <g>
    {HOUSE_X.map((x, i) => {
      const r = rise(i);
      const big = i === 3;
      return (
        <g key={i} transform={`translate(${x},${y + (1 - r) * 260}) scale(${scale * (0.6 + 0.4 * r)})`} opacity={Math.min(1, r * 2)}>
          <House w={big && centerSign ? 300 : 120 + hash(i * 5) * 40} h={110 + hash(i * 3) * 50} col={C.house[i]} seed={i + 1} lit={lit} sign={big ? centerSign : undefined} />
        </g>
      );
    })}
  </g>
);

// ── S1 Hook: polar-night town pops up under the aurora ───────────────────────────────
export const S1: React.FC<SceneProps> = ({ t, lt }) => {
  const s = 1 + lt * 0.035;
  return (
    <Frame id="s1" bg={[C.night, C.lav]}>
      <Stars t={t} n={46} h={700} />
      <Aurora t={t} y={360} op={0.9} />
      <g transform={cam(s, 540, 1200, -lt * 6)}>
        <g transform="translate(260,1130)"><Mountain w={900} h={560} seed={3} col="#B4AFD6" cap={0.36} depth={1.2} /></g>
        <g transform="translate(860,1170)"><Mountain w={820} h={640} seed={8} col="#9F9AC8" cap={0.34} depth={1.2} /></g>
        <Drift y={1150} seed={1.3} col={C.snowSh} amp={26} depth={0.8} />
        <LightPool x={540} y={1170} rx={520} ry={170} col="#FFD98A" op={0.55} />
        <Town y={1260} lit={1} rise={(i) => easeOut(ramp(lt, 0.15 + i * 0.16, 0.75 + i * 0.16))} centerSign="AUDIRA" />
        <Drift y={1300} seed={4.1} col={C.snow} amp={30} depth={1} />
      </g>
      <Rays x={-120} y={-80} op={0.16} col="#E9E4FF" t={t} />
      <Snowfall t={t} n={36} op={0.65} />
    </Frame>
  );
};

// ── S2 Paper map: Norway → Svalbard, pin Longyearbyen ───────────────────────────────
const proj = ([lon, lat]: number[]) => [120 + lon * 24, 200 + (82.5 - lat) * 60];
const poly = (pts: number[][]) => "M" + pts.map((p) => proj(p).map((v) => v.toFixed(1)).join(",")).join(" L") + "Z";
const NORWAY = poly([[5.5, 58.9], [5, 60.4], [5, 61.9], [6.5, 62.6], [8, 63.5], [10.5, 64.5], [12.5, 66], [13.5, 67.5], [15.5, 68.5], [17, 69.3], [19, 70], [22, 70.6], [25.5, 71.1], [28, 71], [31, 70.3], [29, 69.6], [28.5, 69], [26, 69.8], [24, 68.8], [20, 69], [18, 68.3], [16, 67], [14.3, 65.5], [13.8, 64.5], [12, 63], [12.3, 61.5], [12.6, 60.5], [11.5, 59], [10.5, 59.2], [8, 58.1], [6.5, 58.1]]);
const SWEDEN = poly([[12.6, 60.5], [12.3, 61.5], [12, 63], [13.8, 64.5], [14.3, 65.5], [16, 67], [18, 68.3], [20, 69], [24, 68.8], [24, 65.8], [21, 64], [17.5, 62.3], [17.2, 60.7], [18.8, 59.8], [16.5, 57.5], [14.5, 56.2], [12.8, 56.6], [11.2, 58.4], [11.5, 59]]);
const SPITS = poly([[11, 78.9], [12.5, 79.6], [14, 79.8], [16, 79.9], [18, 79.7], [18.5, 79.2], [17.5, 78.5], [19, 77.6], [17, 76.6], [16, 76.8], [14.5, 77.2], [13.8, 77.7], [13.2, 78.2], [11.8, 78.5]]);
const NORDAUST = poly([[18.5, 79.8], [20, 80.4], [23, 80.4], [27, 80.1], [24, 79.3], [20, 79.4]]);
const EDGE = poly([[21, 78.2], [23.5, 78.4], [24, 77.6], [22.5, 77.3], [21, 77.6]]);
const LYB = proj([15.6, 78.22]);
const BEAR_I = proj([19, 74.4]);

export const S2: React.FC<SceneProps> = ({ t, lt }) => {
  const z = ease(ramp(lt, 1.2, 5.4));
  const k = lerp(1.05, 2.35, z) + lt * 0.012;
  const cx = lerp(560, 500, z) + Math.sin(lt * 0.4) * 6;
  const cy = lerp(1190, 400, z) - lt * 2;
  const P2 = (x: number, y: number) => [540 + (x - cx) * k, 900 + (y - cy) * k];
  const [px, py] = P2(LYB[0], LYB[1]);
  const pin = easeOut(ramp(lt, 4.2, 4.8));
  const arrow = ease(ramp(lt, 6.8, 8.4));
  const latLine = ease(ramp(lt, 4.4, 5.4));
  const people = easeOut(ramp(lt, 10.5, 11.1));
  const inv = 1 / k;
  const tipY = py - 520 * arrow;
  return (
    <Frame id="s2" bg={["#CFE3EE", "#A9CBE0"]} vig={0.35}>
      {Array.from({ length: 13 }, (_, i) => (
        <path key={i} d={waveLine(240 + i * 130, 5, 280, t * 0.5 + i)} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.35} />
      ))}
      <g transform={`translate(540,900) scale(${k}) translate(${-cx},${-cy})`}>
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${i * 120 + 60},0 L${i * 120 + 60},1800 M0,${i * 200 + 100} L1100,${i * 200 + 100}`} stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={1.5} vectorEffect="non-scaling-stroke" fill="none" />
        ))}
        <P d={SWEDEN} fill="#E9DCC3" depth={1.6 * inv} />
        <P d={NORWAY} fill={C.peach} depth={1.6 * inv} />
        <path d={NORWAY} fill="none" stroke={C.coral} strokeWidth={3} vectorEffect="non-scaling-stroke" opacity={0.55} />
        <P d={SPITS} fill={C.snow} depth={1.6 * inv} />
        <P d={NORDAUST} fill={C.snow} depth={1.4 * inv} />
        <P d={EDGE} fill={C.snow} depth={1.4 * inv} />
        <path d={SPITS} fill="none" stroke={C.perma} strokeWidth={3} vectorEffect="non-scaling-stroke" />
        <P d={circle(BEAR_I[0], BEAR_I[1], 8)} fill={C.snow} depth={inv} />
        {[[430, 420], [520, 380], [470, 500]].map(([x, y], i) => (
          <path key={i} d={`M${x - 18},${y + 8} L${x},${y - 14} L${x + 18},${y + 8}Z`} fill={C.rock} opacity={0.75} />
        ))}
        <path d={`M100,${LYB[1]} L1000,${LYB[1]}`} stroke={C.coral} strokeWidth={3} strokeDasharray="10 9" vectorEffect="non-scaling-stroke" opacity={0.8 * latLine} />
      </g>
      {(() => {
        const lab = (x: number, y: number, txt: string, size: number, col: string, op: number, ls = 0) => {
          const [sx, sy] = P2(x, y);
          if (sy < 200 || sy > 1400 || op <= 0) return null;
          return <text x={Math.min(Math.max(sx, 170), 910)} y={sy} textAnchor="middle" fontFamily="Anton" fontSize={size} fill={col} opacity={op} letterSpacing={ls}>{txt}</text>;
        };
        return (
          <g>
            {lab(640, 1060, "NORWEGIA", 54, C.ink, 0.85 * (1 - ramp(z, 0.4, 0.8)))}
            {lab(700, 720, "LAUT BARENTS", 36, C.permaDk, 0.75, 3)}
            {lab(600, 330, "SVALBARD", 46, C.ink, 0.85 * ramp(lt, 4.5, 5.0))}
          </g>
        );
      })()}
      {[[140, 560, 1.1, 0.6], [860, 720, 1.25, 0.9], [220, 1300, 0.95, 1.2]].map(([x, y, s, sp], i) => (
        <g key={`cl${i}`} transform={`translate(${x + lt * 22 * sp},${y}) scale(${s})`} opacity={0.9}>
          <P d={blob(100, 40 + i * 7, 10, 0.25, 1.9, 0.6)} fill="#FFFDF8" depth={1.3} />
        </g>
      ))}
      <g transform="translate(905,1300) rotate(-12)">
        <Layered depth={0.6} draw={(o) => (
          <g>
            <path d={circle(0, 0, 70)} fill={o ?? C.ivory} />
            <path d="M0,-62 L14,0 L0,62 L-14,0Z" fill={o ?? C.coral} />
            <path d="M-62,0 L0,-12 L62,0 L0,12Z" fill={o ?? C.perma} />
          </g>
        )} />
        <text x={0} y={-80} textAnchor="middle" fontFamily="Anton" fontSize={34} fill={C.ink}>U</text>
      </g>
      {arrow > 0 ? (
        <g>
          <path d={`M${px},${py - 40} L${px},${tipY}`} stroke={C.ink} strokeWidth={8} strokeDasharray="22 16" fill="none" strokeLinecap="round" />
          <g transform={`translate(${px},${tipY})`} opacity={arrow}>
            <Layered depth={0.4} draw={(o) => <path d="M-36,30 L0,-30 L36,30Z" fill={o ?? C.ink} />} />
            <text x={50} y={20} fontFamily="Anton" fontSize={48} fill={C.ink}>KE KUTUB</text>
          </g>
        </g>
      ) : null}
      {pin > 0 ? (
        <g transform={`translate(${px},${py}) scale(${pin})`}>
          <path d={circle(0, 0, 30 + Math.sin(t * 5) * 5)} fill="none" stroke={C.red} strokeWidth={5} />
          <Layered draw={(o) => <path d="M0,-12 C-26,-46 -26,-82 0,-90 C26,-82 26,-46 0,-12Z" fill={o ?? C.red} />} />
          <path d={circle(0, -60, 10)} fill={C.ivory} />
          <text x={-44} y={-40} textAnchor="end" fontFamily="Anton" fontSize={44} fill={C.ink}>LONGYEARBYEN</text>
        </g>
      ) : null}
      {people > 0 ? (
        <g transform={`translate(${px + 150},${py + 240}) scale(${people * 0.62})`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${(i - 2) * 70},${i % 2 ? 12 : 0}) scale(1.6)`}><Figure color={C.house[i]} /></g>
          ))}
        </g>
      ) : null}
      <Rays x={-100} y={-60} op={0.14} t={t} />
    </Frame>
  );
};

// ── S3 Cross-section: graves on snow → active layer → permafrost → frozen coffin ──────
export const S3: React.FC<SceneProps> = ({ t, lt }) => {
  const down = ease(ramp(lt, 3.6, 8.2));
  const ty = -down * 820 - ease(ramp(lt, 8.2, 12.5)) * 180;
  const zs = 1 + lt * 0.012 + ease(ramp(lt, 9, 13)) * 0.12;
  const crosses = (i: number) => easeOut(ramp(lt, 3.3 + i * 0.12, 3.8 + i * 0.12));
  const frost = ramp(lt, 9.2, 12.0);
  return (
    <Frame id="s3" bg={["#C9DDF0", C.skyIce]}>
      <g transform={`${cam(zs, 540, 1500 + ty * -0.2)} translate(0,${ty})`}>
        <g transform="translate(300,1000)"><Mountain w={800} h={520} seed={11} col={C.rock} cap={0.55} /></g>
        <g transform="translate(900,1030)"><Mountain w={700} h={430} seed={5} col={C.rockDk} cap={0.5} /></g>
        <Sun x={170} y={430} r={70} col="#FFE3A8" />
        <P d={wave(1150, 14, 520, 1.1, -160, 1240, 3600)} fill={C.earth} depth={0.6} />
        <P d={wave(1450, 22, 380, 2.3, -160, 1240, 3600)} fill={C.perma} depth={0.8} edge={C.ice} />
        <P d={wave(2250, 26, 460, 0.4, -160, 1240, 3600)} fill={C.permaDk} depth={0.8} edge={C.ice} />
        {Array.from({ length: 14 }, (_, i) => (
          <g key={i} transform={`translate(${hash(i * 2.2) * 1080},${1200 + hash(i * 3.7) * 220})`}>
            <P d={blob(14 + hash(i) * 16, i * 9, 8, 0.25, 1.4, 0.8)} fill={C.earthDk} depth={0.3} />
          </g>
        ))}
        {Array.from({ length: 16 }, (_, i) => (
          <g key={`c${i}`} transform={`translate(${60 + hash(i * 5.1) * 960},${1540 + hash(i * 1.9) * 1100}) rotate(${hash(i) * 60})`}>
            <Crystal r={14 + hash(i * 7) * 22} op={0.55 + 0.35 * Math.sin(t * 2 + i)} />
          </g>
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <path key={`v${i}`} d={waveLine(1600 + i * 170, 18, 260 + i * 30, i * 1.3, -160, 1240)} stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={3} fill="none" />
        ))}
        <P d={wave(1120, 20, 300, 0.6, -160, 1240, 1170)} fill={C.snow} depth={0.5} edge="#FFFFFF" />
        {Array.from({ length: 7 }, (_, i) => (
          <g key={`x${i}`} transform={`translate(${160 + i * 125},${1150 + (1 - crosses(i)) * 120}) scale(${0.8 * crosses(i)})`} opacity={crosses(i)}>
            <Cross h={130} />
          </g>
        ))}
        <g transform="translate(250,1170) scale(3.4)"><Figure color={C.coat} /></g>
        <g transform="translate(860,1175) scale(3.2)"><Figure color="#5A4A7A" /></g>
        <text x={130} y={1250} fontFamily="Anton" fontSize={40} fill={C.ivory} opacity={0.85 * ramp(lt, 2, 3) * (1 - ramp(lt, 4.2, 5.2))}>LAPISAN AKTIF</text>
        <text x={130} y={1570} fontFamily="Anton" fontSize={40} fill={C.ivory} opacity={0.9 * down}>PERMAFROST</text>
        <LightPool x={560} y={2020} rx={360} ry={180} col="#E6F7FF" op={0.55 * down} />
        <g transform={`translate(560,${2030}) scale(2.8) rotate(${Math.sin(t * 0.7) * 1.2})`}><Coffin frost={frost} /></g>
        {frost > 0 ? [[-200, -40], [220, 30], [-140, 110], [180, -120]].map(([dx, dy], i) => (
          <g key={`f${i}`} transform={`translate(${560 + dx},${2030 + dy}) rotate(${t * 20 + i * 30})`}><Crystal r={26 * frost} op={frost} /></g>
        )) : null}
      </g>
      <Rays x={-120} y={-80} op={0.2} t={t} />
    </Frame>
  );
};

// ── S4 Cemetery gate closes, chained ──────────────────────────────────────────────
export const S4: React.FC<SceneProps> = ({ t, lt }) => {
  const close = ease(ramp(lt, 0.4, 1.9));
  const chain = easeOut(ramp(lt, 2.0, 2.6));
  const lock = easeOut(ramp(lt, 2.5, 3.0));
  const s = 1 + lt * 0.05;
  const door = (side: -1 | 1) => {
    const sx = lerp(0.22, 1, close);
    return (
      <g transform={`translate(${540 + side * 300},0) scale(${side * -sx},1)`}>
        <Layered depth={0.7} draw={(o) => (
          <g>
            <path d={rect(0, 820, 300, 26)} fill={o ?? C.wood} />
            <path d={rect(0, 1180, 300, 26)} fill={o ?? C.wood} />
            {Array.from({ length: 6 }, (_, i) => (
              <path key={i} d={`M${12 + i * 48},1300 L${12 + i * 48},${760 + (i % 2) * 20} L${30 + i * 48},${740 + (i % 2) * 20} L${48 + i * 48},${760 + (i % 2) * 20} L${48 + i * 48},1300Z`} fill={o ?? mix(C.wood, "#ffffff", 0.08 * (i % 2))} />
            ))}
            <path d="M0,1206 L300,846" stroke={o ?? C.earthDk} strokeWidth={18} />
          </g>
        )} />
      </g>
    );
  };
  return (
    <Frame id="s4" bg={["#8C8BBF", "#C9C3DC"]}>
      <g transform={cam(s, 540, 1050)}>
        <g transform="translate(540,1000)"><Mountain w={1300} h={520} seed={21} col={C.lavDk} cap={0.5} /></g>
        <Drift y={980} seed={2.2} col={C.snowSh} amp={30} depth={0.6} />
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i} transform={`translate(${70 + i * 135},${1010 + (i % 2) * 24}) scale(0.55)`}><Cross h={120} col={mix(C.wood, "#8C8BBF", 0.35)} /></g>
        ))}
        <LightPool x={420} y={1000} rx={420} ry={260} col="#FFE3B0" op={0.45} />
        <Drift y={1300} seed={6.6} col={C.snow} amp={18} depth={0.8} />
        {door(-1)}
        {door(1)}
        {[-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${540 + sd * 320},1320)`}>
            <Layered draw={(o) => (
              <g>
                <path d={rect(-30, -640, 60, 640)} fill={o ?? C.earthDk} />
                <path d={`M-40,-640 L0,-690 L40,-640Z`} fill={o ?? C.snow} />
              </g>
            )} />
          </g>
        ))}
        <g transform="translate(540,640)">
          <Layered depth={0.6} draw={(o) => <path d="M-300,40 Q0,-40 300,40 L300,80 Q0,0 -300,80Z" fill={o ?? C.wood} />} />
          <text x={0} y={52} textAnchor="middle" fontFamily="Anton" fontSize={44} fill={C.ivory} letterSpacing={6}>GRAVPLASS</text>
        </g>
        {chain > 0 ? (
          <g opacity={chain}>
            {[[-1, 1], [1, 1]].map(([a], i) => (
              <path key={i} d={`M${540 - 220 * chain},${1000 + a * -150 * chain} L${540 + 220 * chain},${1000 + a * 150 * chain}`} stroke={C.iron} strokeWidth={16} strokeDasharray="26 8" strokeLinecap="round" />
            ))}
          </g>
        ) : null}
        {lock > 0 ? (
          <g transform={`translate(540,1020) scale(${lock})`}>
            <Layered draw={(o) => (
              <g>
                <path d="M-34,-40 C-34,-100 34,-100 34,-40" stroke={o ?? C.iron} strokeWidth={14} fill="none" />
                <path d={rect(-52, -44, 104, 90)} fill={o ?? C.mustard} />
                <path d={circle(0, 0, 10)} fill={o ?? C.ink} />
              </g>
            )} />
          </g>
        ) : null}
      </g>
      <Rays x={-100} y={-60} op={0.16} t={t} />
      <Snowfall t={t} n={60} op={0.85} />
    </Frame>
  );
};

// ── S5 1998: scientists dig, magnifier over virus → no live virus ────────────────────
export const S5: React.FC<SceneProps> = ({ t, lt }) => {
  const tx = -lt * 16;
  const mag = easeOut(ramp(lt, 2.4, 3.4));
  const x1 = ramp(lt, 7.4, 7.7), x2 = ramp(lt, 7.7, 8.0);
  const zs = 1 + ramp(lt, 5.5, 9.3) * 0.14;
  return (
    <Frame id="s5" bg={["#EAF3F8", C.snow]} vig={0.3}>
      <Sun x={180} y={360} r={80} col="#FFF0C8" />
      <g transform={cam(zs, 540, 900, tx * 0.4)}>
        <g transform="translate(200,1060)"><Mountain w={760} h={480} seed={31} col={C.rock} cap={0.6} /></g>
        <g transform="translate(820,1080)"><Mountain w={820} h={560} seed={33} col={C.rockDk} cap={0.55} /></g>
      </g>
      <g transform={cam(zs, 540, 900, tx)}>
        <Drift y={1150} seed={3.5} col={C.snowSh} amp={22} depth={0.7} />
        <g transform="translate(820,1270)"><Tent glow={0.8 + 0.2 * Math.sin(t * 3)} /></g>
        <P d={ellipse(400, 1300, 260, 60)} fill={C.earthDk} depth={0.4} />
        <P d={ellipse(400, 1300, 200, 38)} fill={C.perma} depth={0.2} />
        <g transform="translate(400,1300) scale(0.9)"><Coffin frost={0.6} /></g>
        {[[200, 0], [560, 1.4], [330, 2.6]].map(([x, ph], i) => (
          <g key={i} transform={`translate(${x},${i === 2 ? 1420 : 1290}) scale(${i === 2 ? -3.1 : 3.1},3.1)`}>
            <Figure pose="dig" color={[C.coral, C.teal, C.coat][i]} armRot={Math.sin(t * 3 + ph) * 12} />
          </g>
        ))}
        <Drift y={1440} seed={8.1} col={C.snow} amp={20} depth={0.8} />
      </g>
      {mag > 0 ? (
        <g transform={`translate(${lerp(1200, 560, mag)},${830}) rotate(${(1 - mag) * 30})`}>
          <g transform="translate(0,0)"><Magnifier r={170} /></g>
          <g transform={`rotate(${t * 15})`}><VirusIcon r={58} col={C.lav} /></g>
          {x1 > 0 ? <path d={`M-90,-90 L${-90 + 180 * x1},${-90 + 180 * x1}`} stroke={C.red} strokeWidth={22} strokeLinecap="round" /> : null}
          {x2 > 0 ? <path d={`M90,-90 L${90 - 180 * x2},${-90 + 180 * x2}`} stroke={C.red} strokeWidth={22} strokeLinecap="round" /> : null}
        </g>
      ) : null}
      <Rays x={-100} y={-60} op={0.22} t={t} />
      <Snowfall t={t} n={18} op={0.6} />
    </Frame>
  );
};

// ── S6 Desk: "?" → law book "UU Pemakaman Norwegia" with Svalbard crossed ─────────────
const MINI = (() => {
  const pts = [[11, 78.9], [12.5, 79.6], [14, 79.8], [16, 79.9], [18, 79.7], [18.5, 79.2], [17.5, 78.5], [19, 77.6], [17, 76.6], [16, 76.8], [14.5, 77.2], [13.8, 77.7], [13.2, 78.2], [11.8, 78.5]];
  return "M" + pts.map(([lon, lat]) => `${((lon - 15) * 26).toFixed(1)},${((78.3 - lat) * 70).toFixed(1)}`).join(" L") + "Z";
})();

export const S6: React.FC<SceneProps> = ({ t, lt }) => {
  const q = easeOut(ramp(lt, 0.05, 0.6)) * (1 - ease(ramp(lt, 2.2, 2.8)));
  const book = easeOut(ramp(lt, 2.3, 3.2));
  const xMark = ramp(lt, 6.4, 7.0);
  const rot = lerp(-4, 2, ease(ramp(lt, 0, 10)));
  const zs = 1 + lt * 0.018;
  return (
    <Frame id="s6" bg={["#F3E3C8", "#E2C79E"]} vig={0.4}>
      <g transform={cam(zs, 540, 1000, 40 - lt * 8, 150 - lt * 36, rot * 0.5)}>
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M-100,${420 + i * 170} L1200,${400 + i * 170}`} stroke="#C9A97C" strokeWidth={4} opacity={0.35} />
        ))}
        <LightPool x={360} y={820} rx={520} ry={420} col="#FFF0C8" op={0.6} />
        <g transform={`translate(160,${1420}) rotate(-18)`}>
          <Layered depth={0.6} draw={(o) => (
            <g>
              <path d={rect(-200, -14, 360, 28)} fill={o ?? C.mustard} />
              <path d="M160,-14 L210,0 L160,14Z" fill={o ?? C.peach} />
              <path d={rect(-230, -14, 30, 28)} fill={o ?? C.coral} />
            </g>
          )} />
        </g>
        <g transform={`translate(880,700) rotate(${12 + Math.sin(t) * 2})`}>
          <Layered depth={0.5} draw={(o) => <path d={rect(-70, -70, 140, 140)} fill={o ?? "#FFE58A"} />} />
          <text x={0} y={10} textAnchor="middle" fontFamily="Anton" fontSize={34} fill={C.ink}>MITOS?</text>
        </g>
        {book > 0 ? (
          <g transform={`translate(540,${1000 + (1 - book) * 500}) rotate(${rot})`} opacity={book}>
            <Layered depth={1.1} draw={(o) => (
              <g>
                <path d="M-440,-330 L0,-300 L440,-330 L440,300 L0,330 L-440,300Z" fill={o ?? "#7A3A2E"} />
                <path d="M-420,-310 L-10,-282 L-10,300 L-420,282Z" fill={o ?? C.ivory} />
                <path d="M10,-282 L420,-310 L420,282 L10,300Z" fill={o ?? "#FBF5EA"} />
              </g>
            )} />
            <path d="M0,-290 L0,310" stroke="#C9B48E" strokeWidth={6} />
            <text x={-215} y={-210} textAnchor="middle" fontFamily="Anton" fontSize={40} fill={C.ink}>UU PEMAKAMAN</text>
            <text x={-215} y={-160} textAnchor="middle" fontFamily="Anton" fontSize={40} fill={C.red}>NORWEGIA</text>
            {Array.from({ length: 8 }, (_, i) => (
              <path key={i} d={rect(-380, -110 + i * 46, 300 - (i % 3) * 50, 14)} fill="#BDB2A0" />
            ))}
            <text x={-340} y={270} fontFamily="Anton" fontSize={34} fill={C.ink} opacity={0.7}>§ 1</text>
            <g transform="translate(215,20) scale(1.25)">
              <path d={rect(-150, -170, 300, 300)} fill="#D9EAF3" />
              <P d={MINI} fill={C.snow} depth={0.4} />
              <path d={MINI} fill="none" stroke={C.perma} strokeWidth={3} />
              <path d={circle((15.6 - 15) * 26, (78.3 - 78.22) * 70, 7)} fill={C.red} />
              {xMark > 0 ? (
                <g>
                  <path d={`M-110,-130 L${-110 + 220 * xMark},${-130 + 220 * xMark}`} stroke={C.red} strokeWidth={16} strokeLinecap="round" />
                  <path d={`M110,-130 L${110 - 220 * xMark},${-130 + 220 * xMark}`} stroke={C.red} strokeWidth={16} strokeLinecap="round" />
                </g>
              ) : null}
              <text x={0} y={120} textAnchor="middle" fontFamily="Anton" fontSize={26} fill={C.ink}>SVALBARD</text>
            </g>
          </g>
        ) : null}
        {q > 0 ? (
          <g transform={`translate(540,1050) scale(${q}) rotate(${Math.sin(t * 2) * 4})`}>
            <Layered depth={1.4} draw={(o) => (
              <g>
                <path d="M-125,-120 C-125,-290 135,-290 135,-140 C135,-40 0,-50 0,70" stroke={o ?? C.coral} strokeWidth={84} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d={circle(0, 165, 50)} fill={o ?? C.coral} />
              </g>
            )} />
          </g>
        ) : null}
      </g>
      <Rays x={-100} y={-60} op={0.2} t={t} />
    </Frame>
  );
};

// ── S7 Small hospital → air ambulance to mainland → urn with permit ──────────────────
export const S7: React.FC<SceneProps> = ({ t, lt }) => {
  const fly = ease(ramp(lt, 2.0, 6.0));
  const pxP = lerp(420, 1260, fly), pyP = lerp(1180, 380, fly * fly * 0.7 + fly * 0.3);
  const aOp = 1 - ramp(lt, 6.0, 6.5);
  const bOp = ramp(lt, 6.0, 6.5);
  const bubble = easeOut(ramp(lt, 1.6, 2.1)) * (1 - ramp(lt, 3.9, 4.3));
  const urn = easeOut(ramp(lt, 6.1, 6.9));
  return (
    <Frame id="s7" bg={["#F7DCC8", C.peach]}>
      <Sun x={180} y={640} r={90} col="#FFC98A" />
      {aOp > 0 ? (
        <g opacity={aOp} transform={cam(1 + lt * 0.05, 540, 1100, 170 - lt * 52, -lt * 16)}>
          <g transform="translate(760,1120)"><Mountain w={900} h={480} seed={41} col="#B79AB5" cap={0.5} /></g>
          <Drift y={1180} seed={5.1} col="#FBEFE6" amp={20} depth={0.7} />
          <path d="M-100,1260 L1300,1240" stroke="#B9A8A0" strokeWidth={50} />
          <path d="M-100,1260 L1300,1240" stroke="#FFF6E6" strokeWidth={5} strokeDasharray="40 30" />
          <g transform="translate(300,1240)">
            <Layered depth={1} draw={(o) => (
              <g>
                <path d={rect(-200, -300, 400, 300)} fill={o ?? "#F4F1EA"} />
                <path d={rect(-220, -330, 440, 40)} fill={o ?? C.teal} />
                <path d={rect(-40, -120, 80, 120)} fill={o ?? "#6E8FB0"} />
              </g>
            )} />
            {[-130, 130].map((x) => <path key={x} d={rect(x - 40, -240, 80, 70)} fill="#FFD978" stroke="#E8DCC8" strokeWidth={4} />)}
            <path d={rect(-24, -280, 48, 14)} fill={C.red} /><path d={rect(-7, -297, 14, 48)} fill={C.red} />
            <g transform="translate(0,-360)">
              <Layered depth={0.4} draw={(o) => <path d={rect(-150, -50, 300, 56)} fill={o ?? C.ivory} />} />
              <text x={0} y={-8} textAnchor="middle" fontFamily="Anton" fontSize={40} fill={C.ink} letterSpacing={3}>SYKEHUS</text>
            </g>
            <LightPool x={0} y={-180} rx={260} ry={120} col="#FFE7B0" op={0.4} />
          </g>
          {bubble > 0 ? (
            <g transform={`translate(640,800) scale(${bubble})`}>
              <Layered draw={(o) => (
                <g>
                  <path d={circle(0, 0, 130)} fill={o ?? "#FFF6E6"} />
                  <path d="M-60,110 L-110,190 L-10,128Z" fill={o ?? "#FFF6E6"} />
                </g>
              )} />
              <path d="M-70,10 C-70,60 70,60 70,10Z" fill="#F2A7C3" />
              <path d="M-60,40 L-70,80 M60,40 L70,80" stroke={C.wood} strokeWidth={8} />
              <path d={circle(-10, -6, 22)} fill="#F4C9A8" />
              <path d="M-95,-95 L95,95" stroke={C.red} strokeWidth={18} strokeLinecap="round" />
              <path d={circle(0, 0, 118)} fill="none" stroke={C.red} strokeWidth={16} />
            </g>
          ) : null}
          <path d={`M420,1180 Q${lerp(420, 1260, 0.5)},${1100} ${pxP},${pyP}`} stroke={C.ink} strokeWidth={6} strokeDasharray="18 16" fill="none" opacity={0.6 * ramp(lt, 2.1, 2.5)} />
          <g transform={`translate(${pxP},${pyP}) rotate(${-24 * fly}) scale(${1.1 - fly * 0.3})`}><Plane /></g>
        </g>
      ) : null}
      {bOp > 0 ? (
        <g opacity={bOp} transform={cam(1.05 + (lt - 6) * 0.06, 540, 1050, (lt - 6) * 34, -(lt - 6) * 14)}>
          <P d={rect(140, 560, 800, 860)} fill="#E9C9B0" depth={1.2} />
          <P d={`M240,1420 L240,820 Q540,560 840,820 L840,1420Z`} fill="#C99C82" depth={0.6} />
          <LightPool x={540} y={1060} rx={300} ry={330} col="#FFE3B0" op={0.75} />
          <g transform={`translate(540,${1300}) scale(${1.25 * urn})`}><Urn /></g>
          <g transform={`translate(780,1330) rotate(${8 - urn * 4})`} opacity={urn}>
            <Layered depth={0.5} draw={(o) => <path d={rect(-80, -110, 160, 120)} fill={o ?? C.ivory} />} />
            <text x={0} y={-58} textAnchor="middle" fontFamily="Anton" fontSize={34} fill={C.ink}>IZIN</text>
            <path d={circle(30, -20, 22)} fill="none" stroke={C.red} strokeWidth={5} />
          </g>
          <P d={rect(80, 1400, 920, 60)} fill="#B98458" depth={0.8} />
        </g>
      ) : null}
      <Rays x={-100} y={-60} op={0.22} col="#FFE3C0" t={t} />
    </Frame>
  );
};

// ── S8 Golden low sun: polar bear on the hill, warning sign, resident with deterrent ──
export const S8: React.FC<SceneProps> = ({ t, lt }) => {
  const bx = lerp(250, 640, ease(ramp(lt, 0, 6.7)));
  const raise = easeOut(ramp(lt, 1.6, 2.4));
  return (
    <Frame id="s8" bg={["#F9E1B4", "#F2B75B"]}>
      <Sun x={190} y={720} r={110} col="#FFE08A" />
      <g transform={`translate(${-lt * 8},0)`}>
        <g transform="translate(700,1000)"><Mountain w={1100} h={500} seed={51} col="#C69A7E" cap={0.45} /></g>
      </g>
      <g transform={`translate(${-lt * 18},0)`}>
        <P d={wave(1080, 40, 640, 0.8, -160, 1400)} fill="#FCEBD2" depth={1} edge="#FFFFFF" />
        <g transform={`translate(${bx},${1110 + Math.sin(bx / 90) * 8}) scale(0.95)`}><Bear t={t} /></g>
      </g>
      <LightPool x={300} y={900} rx={560} ry={320} col="#FFE7B0" op={0.5} />
      <g transform={`translate(${-lt * 34},0)`}>
        <P d={wave(1420, 26, 420, 2.1, -160, 1500)} fill={C.snow} depth={1.2} edge="#FFFFFF" />
        <g transform="translate(220,1480) scale(1.0)"><BearSign /></g>
        <g transform="translate(900,1450) scale(3.4)"><Figure pose="raise" color={C.coral} armRot={-10 * raise} tool /></g>
        <g transform={`translate(${900 + 3.4 * 31},${1450 - 3.4 * 128})`} opacity={raise}><FlareGlow t={t} s={1.3} /></g>
      </g>
      <Rays x={-80} y={300} op={0.28} col="#FFE9B8" t={t} />
    </Frame>
  );
};

// ── S9 Payoff: Seed Vault portal glows → dolly in → shelves of seed boxes, −18 °C ──────
const SEED_LABELS = ["NOR", "IDN", "BRA", "KEN", "IND", "PER", "AUDIRA", "MEX", "JPN", "ETH", "VNM", "TUR"];
export const S9: React.FC<SceneProps> = ({ t, lt }) => {
  const glow = ease(ramp(lt, 0.3, 4.5));
  const dolly = ease(ramp(lt, 3.5, 7.4));
  const outOp = 1 - ramp(lt, 7.1, 7.6);
  const inOp = ramp(lt, 7.1, 7.6);
  const impact = Math.max(0, 1 - Math.abs(lt - 8.0) / 0.5);
  const therm = easeOut(ramp(lt, 11.1, 11.7));
  const slide = (lt - 7.2) * 26;
  return (
    <Frame id="s9" bg={["#5E6FA6", "#9FB2D8"]}>
      {outOp > 0 ? (
        <g opacity={outOp}>
          <Stars t={t} n={28} h={500} />
          <Aurora t={t} y={330} op={0.55} />
          <g transform={cam(1 + dolly * 1.9 + lt * 0.01, 540, 1020)}>
            <g transform="translate(540,1180)"><Mountain w={1500} h={760} seed={61} col="#7182B5" cap={0.55} depth={1.3} /></g>
            <P d="M-200,1500 L-200,1160 Q300,980 1300,1240 L1300,1500Z" fill={C.snow} depth={1} edge="#FFFFFF" />
            <g transform="translate(540,1300)"><VaultDoor glow={glow} t={t} open={ramp(lt, 5.8, 7.2)} /></g>
            <path d="M380,1310 L700,1310" stroke="#8B93B8" strokeWidth={22} />
            <P d={wave(1420, 18, 360, 1.7, -160, 1240)} fill={C.snow} depth={0.9} edge="#FFFFFF" />
          </g>
          <Snowfall t={t} n={30} op={0.6} />
        </g>
      ) : null}
      {inOp > 0 ? (
        <g opacity={inOp}>
          <rect width={1080} height={1920} fill="#2E3E6E" />
          <path d="M0,300 L1080,300 L1080,1500 L0,1500Z" fill="#3A4F86" />
          <LightPool x={540} y={500} rx={560} ry={260} col={C.turq} op={0.45 + impact * 0.4} />
          <g transform={cam(1.08 + (lt - 7.2) * 0.02, 540, 960, -slide)}>
            {[620, 940, 1260].map((y, r) => (
              <g key={r}>
                <P d={rect(-200, y, 1600, 26)} fill="#B8C3D8" depth={0.6} />
                {Array.from({ length: 8 }, (_, i) => {
                  const idx = r === 1 && i === 2 ? 6 : (r * 5 + i + (r * 5 + i >= 6 ? 1 : 0)) % SEED_LABELS.length;
                  const sxB = 540 + (-60 + i * 190 - slide - 540) * (1.08 + (lt - 7.2) * 0.02);
                  const showLab = sxB > 130 && sxB < 950;
                  const pop = easeOut(ramp(lt, 7.8 + ((i + r) % 5) * 0.06, 8.3 + ((i + r) % 5) * 0.06));
                  return (
                    <g key={i} transform={`translate(${-60 + i * 190},${y}) scale(${0.85 + 0.15 * pop})`}>
                      <SeedBox col={C.house[(i + r * 3) % 7]} label={showLab && SEED_LABELS[idx] !== "AUDIRA" || (r === 1 && i === 2) ? SEED_LABELS[idx] : undefined} w={SEED_LABELS[idx] === "AUDIRA" ? 170 : 150} />
                    </g>
                  );
                })}
              </g>
            ))}
          </g>
          <rect width={1080} height={1920} fill="#FFFFFF" opacity={impact * 0.35} />
          {therm > 0 ? (
            <g>
              <g transform={`translate(${lerp(1260, 860, therm)},1330)`}><Thermometer level={0.18} /></g>
              <g transform={`translate(860,820) rotate(${t * 25})`}><Crystal r={70 * therm} op={therm} /></g>
            </g>
          ) : null}
        </g>
      ) : null}
      <Rays x={-100} y={-60} op={0.18} col="#DFFBF7" t={t} />
    </Frame>
  );
};

// ── S10 Outro: aurora pink + mint over the town, AUDIRA · FAKTA DUNIA sign, pull-out ──
export const S10: React.FC<SceneProps> = ({ t, lt }) => {
  const s = lerp(1.3, 1.0, ease(ramp(lt, 0, 5.5)));
  return (
    <Frame id="s10" bg={["#4E4A86", "#B39BD0"]}>
      <Stars t={t} n={50} h={700} />
      <Aurora t={t} y={300} op={0.95} pink />
      <Aurora t={t + 2} y={420} op={0.7} />
      <g transform={cam(s, 540, 1200)}>
        <g transform="translate(220,1130)"><Mountain w={900} h={600} seed={71} col="#B4AFD6" cap={0.36} depth={1.2} /></g>
        <g transform="translate(880,1160)"><Mountain w={820} h={560} seed={73} col="#9F9AC8" cap={0.34} depth={1.2} /></g>
        <Drift y={1150} seed={9.3} col={C.snowSh} amp={26} depth={0.8} />
        <LightPool x={540} y={1160} rx={560} ry={190} col="#FFD98A" op={0.6} />
        <Town y={1260} lit={0.85 + 0.15 * Math.sin(t * 2)} rise={() => 1} centerSign="AUDIRA · FAKTA DUNIA" />
        <Drift y={1300} seed={2.7} col={C.snow} amp={30} depth={1} />
      </g>
      <Rays x={-120} y={-80} op={0.14} col="#F7E6FF" t={t} />
      <Snowfall t={t} n={30} op={0.6} />
    </Frame>
  );
};

export const SCENE_MAP: Record<string, React.FC<SceneProps>> = { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10 };
