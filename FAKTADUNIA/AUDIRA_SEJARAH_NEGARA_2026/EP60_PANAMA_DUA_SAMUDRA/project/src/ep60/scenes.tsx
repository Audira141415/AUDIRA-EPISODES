// EP60 Panama — scenes S1–S11. Each gets global t (s) and local lt (s since scene start), draws in 1080 × 1920.
// Lighting rule: key light upper-left on every set (Rays + LightPool), long cast shadows via P/Layered, camera never parks.
// Sensitive: worker deaths = calm number + lanterns only (no bodies). Real people = faceless figures (+ callout card).
import React from "react";
import {
  C, P, PaperDefs, Layered, LightPool, Rays, Figure, Water, Ship, Wall, GateLeaf, Tree, Palm, Forest, Mosquito, Lantern, Flag,
  Hut, Drum, SteamShovel, Rail, ClockTower, Swimmer, Scale, Coin, NameCard, Rain,
  blob, circle, ellipse, rect, wave, waveLine, hash, ramp, ease, easeOut, lerp, mix, clamp01,
} from "./pieces";

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

const cam = (s: number, ox: number, oy: number, tx = 0, ty = 0, rot = 0) =>
  `translate(${ox + tx},${oy + ty}) rotate(${rot}) scale(${s}) translate(${-ox},${-oy})`;

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

/** Atmospheric haze band (sits between BG and MG planes). */
const Haze: React.FC<{ y: number; h?: number; col?: string; op?: number }> = ({ y, h = 260, col = "#F7EBD6", op = 0.7 }) => (
  <rect x={-300} y={y - h / 2} width={1700} height={h} fill={col} opacity={op} filter="url(#psoft)" />
);

/** Out-of-focus FG foliage at frame corners (DOF plane, drifts faster than camera). */
const FGFoliage: React.FC<{ t: number; col?: string; side?: "both" | "left" | "right"; y?: number }> = ({ t, col = "#2F5A38", side = "both", y = 1700 }) => {
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

/** Polyline drawn up to fraction f of its length. */
const partial = (pts: number[][], f: number) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = total * clamp01(f);
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  let tip = pts[0];
  for (let i = 0; i < seg.length && left > 0; i++) {
    const k = Math.min(1, left / seg[i]);
    tip = [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)];
    d += ` L${tip[0].toFixed(1)},${tip[1].toFixed(1)}`;
    left -= seg[i];
  }
  return { d, tip };
};

// ── S1 Hook: cargo ship lifted inside a lock chamber, AUDIRA control house ───────────
export const S1: React.FC<SceneProps> = ({ t, lt }) => {
  const rise = ease(ramp(lt, 0.2, 5.8));
  const wy = lerp(1330, 985, rise);
  const s = 1.0 + lt * 0.018;
  const ty = rise * 110;
  const open = ease(ramp(lt, 5.9, 7.4));
  return (
    <Frame id="s1" bg={[C.sky, C.skyWarm]}>
      <Sun x={190} y={560} r={64} />
      <Cloud x={820} y={560} s={0.9} seed={2} />
      <g transform={cam(1.0 + lt * 0.007, 540, 1100, 0, ty * 0.4)}>
        <Mountains y={900} seed={3.3} h={470} col="#86A8A2" />
        <Haze y={890} h={160} op={0.45} />
      </g>
      <g transform={cam(s, 540, 1100, 0, ty)}>
        <Hills y={880} seed={1.2} col={C.leafLt} amp={40} />
        <Forest y={930} seed={3} n={10} scale={0.62} t={t} />
        <P d={rect(170, 860, 740, 900)} fill={C.concreteDk} depth={1} />
        <Water y={975} t={t} col={C.carib} amp={5} x0={200} x1={880} />
        <g transform="translate(200,1330)"><GateLeaf w={340} h={440} open={open} /></g>
        <g transform="translate(880,1330)"><GateLeaf w={340} h={440} open={open} flip /></g>
        <g transform="translate(540,870)">
          <Layered depth={0.9} draw={(o) => (
            <g>
              <path d={rect(-170, -160, 340, 160)} fill={o ?? "#EADCC2"} />
              <path d="M-196,-160 L0,-236 L196,-160Z" fill={o ?? C.laterite} />
            </g>
          )} />
          {[-110, 70].map((x) => <path key={x} d={rect(x, -60, 40, 44)} fill="#FFD978" stroke="#FBF7F0" strokeWidth={3} />)}
          <g transform="translate(0,-112)">
            <Layered depth={0.4} draw={(o) => <path d={rect(-150, -34, 300, 70)} fill={o ?? C.paper} />} />
            <path d={rect(-150, -34, 300, 10)} fill={C.red} />
            <text x={0} y={28} textAnchor="middle" fontFamily="Anton" fontSize={50} fill={C.ink} letterSpacing={8}>AUDIRA</text>
          </g>
        </g>
        <LightPool x={540} y={wy} rx={420} ry={110} col="#FFF1CC" op={0.4} />
        <Water y={wy} t={t} col={C.carib} amp={8} x0={170} x1={910} />
        {Array.from({ length: 14 }, (_, i) => {
          const yy = 1700 - ((t * 140 + hash(i) * 600) % 600);
          return yy > wy + 40 ? <path key={i} d={circle(220 + hash(i * 3) * 640, yy, 6 + hash(i * 7) * 8)} fill="#FFFFFF" opacity={0.45} /> : null;
        })}
        <g transform={`translate(540,${wy + 26})`}><Ship s={1.04} /></g>
        <P d={wave(wy + 36, 7, 170, t * 2.2, 170, 910)} fill={mix(C.carib, "#1A3050", 0.12)} depth={0.3} light={false} />
        <Wall x={-40} y={700} w={230} h={1300} />
        <Wall x={890} y={700} w={230} h={1300} />
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            <path d={`M890,${1330 - i * 49} L${i % 2 ? 920 : 940},${1330 - i * 49}`} stroke={C.ink} strokeWidth={4} />
          </g>
        ))}
        <path d={`M955,${wy} L990,${wy - 22} L990,${wy + 22}Z`} fill={C.gold} />
        <path d={`M972,1330 L972,${wy}`} stroke={C.gold} strokeWidth={8} strokeLinecap="round" />
      </g>
      <FGFoliage t={t} />
      <Rays x={-120} y={-80} op={0.24} t={t} />
    </Frame>
  );
};

// ── S2 Paper map of the Americas: long red route round Cape Horn vs gold shortcut ────
const proj = ([lon, lat]: number[]) => [60 + (lon + 130) * 9.6, 260 + (60 - lat) * 11];
const poly = (pts: number[][]) => "M" + pts.map((p) => proj(p).map((v) => v.toFixed(1)).join(",")).join(" L") + "Z";
const AMERICAS = poly([
  [-130, 60], [-130, 55], [-124, 48], [-124, 42], [-121, 36], [-117, 32.5], [-114, 30], [-112, 26], [-110, 23], [-105, 20], [-100, 17],
  [-95, 16], [-92, 14.5], [-88, 13], [-85.5, 11], [-85, 10], [-84, 9.5], [-82.5, 8.2], [-80, 7.3], [-78, 8], [-77.5, 7], [-77.3, 4],
  [-79, 1], [-80.5, -1], [-81.2, -5], [-79, -8], [-76, -14], [-71, -18], [-70.3, -24], [-71.5, -30], [-73.5, -37], [-73.7, -42],
  [-75, -48], [-74, -52], [-70, -55], [-67, -55], [-68.5, -52.5], [-69, -50], [-67.5, -46], [-65, -42], [-62, -39], [-57.5, -38],
  [-57, -35], [-53, -34], [-48.5, -26], [-44, -23], [-41, -22], [-39, -17], [-35, -9], [-35, -5.5], [-40, -3], [-44, -2.5], [-50, 0],
  [-52, 5], [-57, 6], [-61, 8.5], [-64, 10.5], [-68, 10.5], [-72, 11.5], [-75, 10.8], [-77, 8.8], [-79.5, 9.6], [-81.5, 9],
  [-83.5, 10.8], [-83.7, 15], [-86, 15.9], [-88.3, 15.7], [-88, 18.5], [-87.5, 21.5], [-90.3, 21], [-90.5, 19], [-94, 18.2],
  [-97.3, 21], [-97.5, 25.8], [-94, 29.5], [-89, 30], [-84, 29.8], [-82.7, 27.5], [-80.5, 25], [-80, 27], [-81.2, 30.5], [-76, 35],
  [-74, 40.5], [-70, 41.7], [-66, 44.5], [-64, 45.5], [-60, 46], [-55.5, 52], [-60, 55.5], [-62, 58], [-64.5, 60],
]);
const CUBA = poly([[-85, 21.8], [-82, 23.1], [-77, 21.8], [-74.2, 20.2], [-77.7, 19.9], [-80.5, 21.7]]);
const LONG = [[-58, 24], [-45, 3], [-33, -10], [-45, -40], [-60, -57.5], [-72, -57.5], [-82, -48], [-84, -28], [-90, -8], [-97, 6]].map(proj);
const SHORT = [[-58, 24], [-72, 15], [-79.4, 9.5], [-80, 8.4], [-86, 5.5], [-97, 6]].map(proj);
const PANAMA = proj([-79.6, 9.0]);

export const S2: React.FC<SceneProps> = ({ t, lt }) => {
  const red = ease(ramp(lt, 1.0, 5.2));
  const z = ease(ramp(lt, 5.4, 7.6));
  const gold = ease(ramp(lt, 6.2, 8.3));
  const k = lerp(1.0, 2.3, z) + lt * 0.01;
  const cx = lerp(560, PANAMA[0], z) + Math.sin(lt * 0.5) * 5;
  const cy = lerp(930, PANAMA[1] + 20, z);
  const inv = 1 / k;
  const r = partial(LONG, red);
  const g = partial(SHORT, gold);
  const P2 = (x: number, y: number) => [540 + (x - cx) * k, 900 + (y - cy) * k];
  const lab = (pt: number[], txt: string, size: number, col: string, op: number, ls = 2) => {
    const [sx, sy] = P2(pt[0], pt[1]);
    if (op <= 0) return null;
    return <text x={Math.min(Math.max(sx, 170), 910)} y={Math.min(Math.max(sy, 520), 1360)} textAnchor="middle" fontFamily="Anton" fontSize={size} fill={col} opacity={op} letterSpacing={ls}>{txt}</text>;
  };
  const [px, py] = P2(PANAMA[0], PANAMA[1]);
  const pin = easeOut(ramp(lt, 6.0, 6.6));
  return (
    <Frame id="s2" bg={["#BFE0EA", "#9CC6DB"]} vig={0.32}>
      {Array.from({ length: 13 }, (_, i) => (
        <path key={i} d={waveLine(240 + i * 130, 5, 280, t * 0.5 + i)} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.3} />
      ))}
      <g transform={`translate(540,900) scale(${k}) translate(${-cx},${-cy})`}>
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M${i * 110 + 40},0 L${i * 110 + 40},1900 M0,${i * 180 + 120} L1100,${i * 180 + 120}`} stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={1.5} vectorEffect="non-scaling-stroke" fill="none" />
        ))}
        <P d={AMERICAS} fill={C.land} depth={1.6 * inv} />
        <path d={AMERICAS} fill="none" stroke={C.landDk} strokeWidth={3} vectorEffect="non-scaling-stroke" />
        <P d={CUBA} fill={C.land} depth={1.2 * inv} />
        {[[-100, 40], [-60, -10], [-65, -30], [-110, 50]].map(([lo, la], i) => {
          const [x, y] = proj([lo, la]);
          return <g key={i} transform={`translate(${x},${y}) scale(0.32)`}><Tree h={160} seed={i * 5} col={C.leafLt} /></g>;
        })}
        <path d={r.d} fill="none" stroke={C.red} strokeWidth={9} strokeDasharray="22 16" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={1 - 0.45 * z} />
        <path d={g.d} fill="none" stroke={C.gold} strokeWidth={14} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {red > 0 && red < 1 ? <g transform={`translate(${r.tip[0]},${r.tip[1]}) scale(${0.22 * inv * 2.3})`}><Ship s={0.5} /></g> : null}
        {gold > 0 ? <g transform={`translate(${g.tip[0]},${g.tip[1]}) scale(${0.22 * inv * 2.3})`}><Ship s={0.5} /></g> : null}
      </g>
      {lab(proj([-45, 22]), "ATLANTIK", 54, C.pacificDk, 1 - z * 0.3, 4)}
      {lab(proj([-112, 2]), "PASIFIK", 54, C.pacificDk, 1 - z * 0.3, 4)}
      {lab(proj([-62, -22]), "AMERIKA SELATAN", 48, C.earthDk, 0.9 * (1 - z), 2)}
      {pin > 0 ? (
        <g transform={`translate(${px},${py - 10}) scale(${pin})`}>
          <path d={circle(0, 0, 80)} fill={C.gold} opacity={0.35} filter="url(#pglow)" />
          <Layered depth={0.5} draw={(o) => <path d="M0,0 C-30,-40 -38,-60 -38,-80 A38,38 0 1,1 38,-80 C38,-60 30,-40 0,0Z" fill={o ?? C.red} />} />
          <path d={circle(0, -82, 14)} fill={C.paper} />
          <text x={0} y={-130} textAnchor="middle" fontFamily="Anton" fontSize={58} fill={C.ink} letterSpacing={3}>PANAMA</text>
        </g>
      ) : null}
      <Rays x={-120} y={-80} op={0.14} t={t} />
    </Frame>
  );
};

// ── S3 France 1881: jungle, red laterite trench, diggers, French flag, de Lesseps ────
const Trench: React.FC<{ y: number; deep?: number }> = ({ y, deep = 1 }) => (
  <g>
    <P d={`M-100,${y} L1180,${y} L1180,2100 L-100,2100Z`} fill={C.laterite} depth={1} />
    <P d={`M120,${y + 20} L960,${y + 20} L860,${y + 180 * deep} L220,${y + 180 * deep}Z`} fill={mix(C.laterite, "#3A1A10", 0.28)} depth={0.6} light={false} />
    <P d={`M-100,${y + 230} L1180,${y + 230} L1180,2100 L-100,2100Z`} fill={mix(C.laterite, "#ffffff", 0.12)} depth={0.8} />
  </g>
);

export const S3: React.FC<SceneProps> = ({ t, lt }) => {
  const pan = lerp(70, -70, ease(lt / 8.2));
  const lesseps = easeOut(ramp(lt, 4.6, 5.3));
  return (
    <Frame id="s3" bg={["#CFE9DF", "#F3E2C0"]}>
      <Sun x={160} y={560} r={58} />
      <g transform={cam(1.02 + lt * 0.004, 540, 1100, pan * 0.35)}>
        <Mountains y={830} seed={7.1} h={280} col="#9FBDB2" />
        <Haze y={820} h={180} op={0.5} />
      </g>
      <g transform={cam(1.08 + lt * 0.01, 540, 1100, pan)}>
        <Hills y={820} seed={2.2} col={mix(C.leafLt, "#ffffff", 0.2)} amp={60} depth={0.8} />
        <Forest y={880} seed={11} n={11} scale={0.75} t={t} col={C.leafDk} />
        <Forest y={1000} seed={17} n={8} scale={0.95} t={t} />
        <Trench y={1100} />
        {[260, 420, 600, 760].map((x, i) => {
          const sw = Math.sin(t * 3.2 + i * 1.7);
          const fly = ((t * 1.6 + i * 0.37) % 1);
          return (
            <g key={i}>
              <g transform={`translate(${x},${1260 + (i % 2) * 20}) scale(1.35)`}><Figure pose="dig" color={i % 2 ? "#F1E6D2" : "#E7D3B2"} armRot={sw * 14} /></g>
              <path d={circle(x + 60 + fly * 80, 1240 - Math.sin(fly * Math.PI) * 120, 10)} fill={C.laterite} opacity={1 - fly} />
            </g>
          );
        })}
        <g transform="translate(110,1150)"><Flag kind="fr" t={t} h={420} /></g>
        <g transform="translate(930,1180)">
          <path d={ellipse(0, -60, 120, 160)} fill="#FFE7B0" opacity={0.5 * lesseps} filter="url(#psoft)" />
          <g transform="scale(1.5)"><Figure pose="stand" color="#2E2A3A" /></g>
          <Layered depth={0.3} draw={(o) => <g><path d={rect(-16, -172, 32, 30)} fill={o ?? C.ink} /><path d={rect(-24, -146, 48, 6)} fill={o ?? C.ink} /></g>} />
        </g>
        <Rail y={1350} off={t * 30} />
      </g>
      <FGFoliage t={t} />
      <Rays x={-120} y={-80} op={0.2} t={t} />
    </Frame>
  );
};

// ── S4 The jungle fights back: rain, mosquitoes, landslide → calm lanterns, bankrupt ─
export const S4: React.FC<SceneProps> = ({ t, lt }) => {
  const slide = easeOut(ramp(lt, 3.0, 4.2));
  const aOp = 1 - ease(ramp(lt, 4.1, 4.8));
  const bOp = ease(ramp(lt, 4.1, 4.8));
  const drift = lt * 9;
  return (
    <Frame id="s4" bg={["#2E3858", "#5A5E7E"]} vig={0.5}>
      {bOp > 0 ? (
        <g opacity={bOp} transform={cam(1.04 + lt * 0.008, 540, 1150, 0, -drift + 60)}>
          {Array.from({ length: 30 }, (_, i) => <path key={i} d={circle(hash(i * 3.3) * 1080, 520 + hash(i * 7.1) * 300, 2 + hash(i) * 2.5)} fill="#FFF8E8" opacity={0.3 + 0.4 * Math.abs(Math.sin(t + i))} />)}
          <Hills y={900} seed={4.4} col="#3C4A5A" amp={50} depth={0.6} />
          <Forest y={960} seed={23} n={10} scale={0.8} col="#2F4A3A" t={t} />
          <g transform="translate(800,1060) rotate(-8) scale(0.8)" opacity={0.75}><SteamShovel dig={0.1} t={0} /></g>
          <P d={wave(1080, 16, 400, 0.4)} fill="#4A3A36" depth={0.8} />
          <LightPool x={540} y={1250} rx={520} ry={200} col="#FFD98A" op={0.35 * bOp} />
          {[0, 1, 2].map((row) =>
            Array.from({ length: 9 }, (_, i) => {
              const on = ease(ramp(lt, 4.5 + (row * 9 + i) * 0.06, 5.0 + (row * 9 + i) * 0.06));
              const sc = 0.8 + row * 0.22;
              return (
                <g key={`${row}-${i}`} transform={`translate(${110 + i * 108 + (row % 2) * 40},${1150 + row * 110}) scale(${sc})`}>
                  <Lantern glow={on} t={t} seed={i + row * 9} />
                </g>
              );
            }),
          )}
        </g>
      ) : null}
      {aOp > 0 ? (
        <g opacity={aOp}>
          <rect width={1080} height={1920} fill="#7E8EA0" />
          <g transform={cam(1.06 + lt * 0.01, 540, 1100, 0, -drift)}>
            <Cloud x={300} y={560} s={1.3} seed={5} col="#B8C2CE" />
            <Cloud x={820} y={620} s={1.1} seed={9} col="#A8B4C2" />
            <Hills y={820} seed={3.3} col={C.leafDk} amp={60} depth={0.8} />
            <Forest y={900} seed={31} n={11} scale={0.85} t={t * 2} col={C.leafDk} />
            <Trench y={1100} />
            {[300, 520, 740].map((x, i) => <g key={i} transform={`translate(${x},${1270}) scale(1.3)`}><Figure pose="carry" color="#E7D3B2" /></g>)}
            <g transform={`translate(${-300 * slide},${380 * slide})`}>
              <P d="M560,720 Q820,600 1240,700 L1240,1200 Q900,1180 640,1050Z" fill={mix(C.laterite, "#5A2A18", 0.2)} depth={1} />
              {Array.from({ length: 8 }, (_, i) => <path key={i} d={circle(700 + hash(i) * 400, 900 + hash(i * 3) * 200, 14 + hash(i * 5) * 14)} fill={C.earthDk} />)}
            </g>
            {Array.from({ length: 16 }, (_, i) => (
              <g key={i} transform={`translate(${(hash(i * 2.1) * 1000 + Math.sin(t * 2 + i) * 60 + 40)},${700 + hash(i * 4.3) * 500 + Math.cos(t * 2.6 + i) * 40})`}>
                <Mosquito t={t} s={0.9 + hash(i) * 0.6} seed={i} />
              </g>
            ))}
          </g>
          <Rain t={t} n={80} op={0.75} />
        </g>
      ) : null}
    </Frame>
  );
};

// ── S5 USA 1904: the key is the mosquito — nets, window screens, oil on puddles ──────
export const S5: React.FC<SceneProps> = ({ t, lt }) => {
  const lift = ease(ramp(lt, 0.2, 2.6));
  const bigM = ease(ramp(lt, 3.3, 3.8)) * (1 - ease(ramp(lt, 5.0, 5.5)));
  const net = ease(ramp(lt, 6.5, 7.2));
  const screen = ease(ramp(lt, 7.5, 8.1));
  const pour = ease(ramp(lt, 8.8, 9.4));
  const sheen = ease(ramp(lt, 9.2, 10.4));
  const s = lerp(1.0, 1.18, ease(ramp(lt, 5.5, 10.7)));
  const tx = lerp(0, -120, ease(ramp(lt, 8.0, 10.7)));
  return (
    <Frame id="s5" bg={["#CDE8E6", "#F6E5C6"]}>
      <Sun x={180} y={560} r={60} />
      <g transform={cam(1 + (s - 1) * 0.4, 600, 1200, tx * 0.35)}>
        <Mountains y={910} seed={12.4} h={260} col="#A2C2B8" />
        <Haze y={900} h={180} op={0.5} />
      </g>
      <g transform={cam(s, 600, 1200, tx)}>
        <Hills y={900} seed={5.5} col={C.leafLt} amp={40} />
        <Forest y={960} seed={41} n={10} scale={0.7} t={t} />
        <P d={wave(1180, 12, 500, 1.3)} fill="#C9A87A" depth={0.8} />
        <g transform="translate(120,1300)"><Flag kind="us" t={t} h={560} lift={lift} w={190} /></g>
        <g transform="translate(470,1290) scale(0.95)"><Hut net={net} screen={screen} /></g>
        <path d={ellipse(820, 1360, 170, 42)} fill={mix(C.carib, "#5A4A3A", 0.35)} />
        <path d={ellipse(820, 1360, 160 * sheen, 36 * sheen)} fill="url(#plight)" opacity={0.9} />
        <path d={ellipse(820, 1360, 150 * sheen, 32 * sheen)} fill="#C8A8E0" opacity={0.45 * sheen} style={{ mixBlendMode: "screen" }} />
        <g transform={`translate(900,1330)`}><Drum tilt={-pour * 62} label="MINYAK" /></g>
        {pour > 0.3 ? <path d={`M${830},${1240} Q${815},${1300} 820,${1352}`} stroke="#5A4A2A" strokeWidth={10 * (1 - sheen * 0.7)} fill="none" opacity={0.8} /> : null}
        <g transform="translate(700,1330) scale(1.35)"><Figure pose="stand" color="#F1E6D2" /></g>
        {Array.from({ length: 12 }, (_, i) => {
          const gone = ease(ramp(lt, 9.4 + i * 0.05, 10.2 + i * 0.05));
          const scr = i < 5 ? screen : 0;
          return (
            <g key={i} opacity={(1 - gone) * (1 - scr * 0.8)} transform={`translate(${620 + hash(i * 2) * 360 + Math.sin(t * 3 + i) * 40},${1100 + hash(i * 5) * 220 + Math.cos(t * 3.4 + i) * 30 - gone * 160})`}>
              <Mosquito t={t} s={0.8} seed={i} />
            </g>
          );
        })}
      </g>
      {bigM > 0 ? (
        <g opacity={bigM} transform={`translate(540,880) scale(${0.7 + 0.3 * bigM})`}>
          <Layered depth={1} draw={(o) => <path d={circle(0, 0, 300)} fill={o ?? C.paper} />} />
          <path d={circle(0, 0, 268)} fill="none" stroke={C.red} strokeWidth={14} />
          <g transform={`rotate(${Math.sin(t * 2) * 6}) scale(5.2)`}><Mosquito t={t} /></g>
        </g>
      ) : null}
      {lt > 5.2 && lt < 7.0 ? (
        <g transform="translate(540,620)"><NameCard name="DR. W. GORGAS" role="pemberantas nyamuk" op={ease(ramp(lt, 5.2, 5.6)) * (1 - ramp(lt, 6.7, 7.0))} /></g>
      ) : null}
      <FGFoliage t={t} />
      <Rays x={-120} y={-80} op={0.2} t={t} />
    </Frame>
  );
};

// ── S6 Culebra Cut: mountain split, terraced cliffs, steam shovels on rails ──────────
const Cliff: React.FC<{ side: -1 | 1 }> = ({ side }) => {
  const steps = [0, 1, 2, 3];
  const x0 = side < 0 ? -120 : 1200;
  const pts = steps.map((i) => {
    const y = 760 + i * 150;
    const x = side < 0 ? 300 + i * 70 : 780 - i * 70;
    return { x, y };
  });
  let d = `M${x0},2100 L${x0},700`;
  pts.forEach((p) => { d += ` L${p.x - side * 60},${p.y - 40} L${p.x - side * 60},${p.y + 80} L${p.x},${p.y + 80}`; });
  d += ` L${pts[3].x},2100Z`;
  return (
    <g>
      <P d={d} fill={side < 0 ? C.laterite : mix(C.laterite, "#3A1A10", 0.15)} depth={1} />
      {pts.map((p, i) => <path key={i} d={`M${x0},${p.y + 80} L${p.x},${p.y + 80}`} stroke={mix(C.laterite, "#ffffff", 0.25)} strokeWidth={6} opacity={0.6} />)}
    </g>
  );
};

export const S6: React.FC<SceneProps> = ({ t, lt }) => {
  const crane = ease(ramp(lt, 0, 4.4));
  const ty = lerp(260, -40, crane);
  return (
    <Frame id="s6" bg={["#F3D9B4", "#E9C69A"]}>
      <Sun x={170} y={500} r={56} />
      <g transform={cam(1.0 + crane * 0.12, 540, 1150, 0, ty)}>
        <Forest y={720} seed={51} n={11} scale={0.6} t={t} />
        <Cliff side={-1} />
        <Cliff side={1} />
        <P d={rect(-100, 1300, 1280, 800)} fill={mix(C.laterite, "#ffffff", 0.1)} depth={0.6} />
        <Rail y={1330} off={t * 40} />
        <g transform="translate(380,1320) scale(0.95)"><SteamShovel dig={0.5 + 0.5 * Math.sin(t * 2.2)} t={t} /></g>
        <g transform="translate(830,1050) scale(0.62)"><SteamShovel dig={0.5 + 0.5 * Math.sin(t * 2.2 + 1.5)} t={t + 1} /></g>
        <g transform="translate(160,900) scale(0.5)"><SteamShovel dig={0.5 + 0.5 * Math.sin(t * 2.2 + 3)} t={t + 2} /></g>
        <Rail y={1060} x0={600} x1={1180} />
        {[0, 1, 2].map((i) => {
          const x = 1300 - ((lt * 140 + i * 170) % 1500);
          return (
            <g key={i} transform={`translate(${x},1326)`}>
              <Layered depth={0.6} draw={(o) => <g><path d={rect(-70, -70, 140, 60)} fill={o ?? "#5A4A44"} /><path d={blob(50, i, 8, 0.2, 1.3, 0.5)} transform="translate(0,-74)" fill={o ?? C.laterite} /></g>} />
              {[-40, 40].map((xx) => <path key={xx} d={circle(xx, -6, 12)} fill="#3B3346" />)}
            </g>
          );
        })}
      </g>
      <Rays x={-120} y={-80} op={0.22} t={t} />
    </Frame>
  );
};

// ── S7 Cross-section: locks lift the ship ±26 m to Gatun Lake, then lower it ────────
const L0 = 1250, STEP = 125;
const LV = (i: number) => L0 - i * STEP;
const CH = [600, 820, 1040, 1900, 2120, 2340];
const CW = 220;
const WORLD_W = 3200;

export const S7: React.FC<SceneProps> = ({ t, lt }) => {
  const f = (a: number, b: number) => ease(ramp(lt, a, b));
  const lv = [
    lerp(LV(0), LV(1), f(3.6, 4.4)),
    lerp(LV(1), LV(2), f(5.0, 5.6)),
    lerp(LV(2), LV(3), f(6.0, 6.8)),
    lerp(LV(3), LV(2), f(9.0, 9.35)),
    lerp(LV(2), LV(1), f(9.7, 10.0)),
    lerp(LV(1), LV(0), f(10.2, 10.5)),
  ];
  // ship x along the cross-section
  const keys: [number, number][] = [[0, 260], [2.2, 710], [4.4, 710], [5.0, 930], [5.6, 930], [6.0, 1150], [6.8, 1150], [8.6, 1640], [9.0, 2010], [9.4, 2010], [9.7, 2230], [10.0, 2230], [10.2, 2450], [10.5, 2450]];
  let sx = keys[keys.length - 1][1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (lt <= keys[i + 1][0]) { sx = lerp(keys[i][1], keys[i + 1][1], ease((lt - keys[i][0]) / (keys[i + 1][0] - keys[i][0]))); break; }
  }
  const chamberOf = (x: number) => CH.findIndex((c) => x >= c && x <= c + CW);
  const ci = chamberOf(sx);
  const sy = ci >= 0 ? lv[ci] : sx < CH[0] ? LV(0) : sx < CH[3] ? LV(3) : LV(0);
  const k = lerp(0.88, 1.04, lt / 10.5) + 0.1 * ease(ramp(lt, 1.8, 4.6)) - 0.06 * ease(ramp(lt, 6.8, 8.8));
  const camX = Math.min(Math.max(sx + lerp(-170, 170, lt / 10.5), 540 / k - 300), WORLD_W - 540 / k);
  const camY = lerp(1150, 1080, ease(ramp(sy, LV(0), LV(3)) * 1));
  const stamp = 1 - ease(ramp(lt, 3.3, 3.8));
  const ruler = ease(ramp(lt, 5.4, 6.0)) * (1 - ease(ramp(lt, 7.4, 7.8)));
  return (
    <Frame id="s7" bg={["#CFE9F0", "#F4E3C6"]}>
      <Sun x={170} y={540} r={54} />
      <g transform={`translate(540,1100) scale(${k}) translate(${-camX},${-camY})`}>
        {/* mountains behind the lake */}
        {[1150, 1500, 1850].map((x, i) => <g key={i} transform={`translate(${x},${LV(3) - 10})`}><P d={blob(260, i * 4 + 1, 12, 0.15, 1.6, 1)} fill={mix(C.leafLt, "#ffffff", 0.15)} depth={0.6} /></g>)}
        <Forest y={LV(3) - 40} seed={61} n={9} scale={0.55} t={t} />
        {/* seas + lake water */}
        <Water y={LV(0)} t={t} col={C.carib} amp={6} x0={-700} x1={CH[0] + 4} />
        <Water y={LV(3)} t={t} col={mix(C.carib, C.leaf, 0.25)} amp={5} x0={CH[2] + CW - 4} x1={CH[3] + 4} />
        <Water y={LV(0)} t={t} col={C.pacific} amp={6} x0={CH[5] + CW - 4} x1={WORLD_W + 200} />
        {/* chambers */}
        {CH.map((x, i) => <Water key={i} y={lv[i]} t={t} col={i < 3 ? C.carib : C.pacific} amp={3} x0={x} x1={x + CW} />)}
        <P d={`M-700,${LV(0) + 120} L${WORLD_W + 200},${LV(0) + 120} L${WORLD_W + 200},2400 L-700,2400Z`} fill={C.laterite} depth={0.8} />
        {CH.map((x, i) => {
          const floor = i < 3 ? LV(i) : LV(5 - i);
          return <P key={i} d={rect(x, floor + 60, CW, LV(0) + 130 - floor - 60)} fill={mix(C.laterite, "#ffffff", 0.08)} depth={0.4} light={false} />;
        })}
        <P d={`M${CH[2] + CW},${LV(1) + 40} Q${(CH[2] + CW + CH[3]) / 2},${LV(0) + 60} ${CH[3]},${LV(1) + 40} L${CH[3]},${LV(0) + 130} L${CH[2] + CW},${LV(0) + 130}Z`} fill={mix(C.laterite, "#3A1A10", 0.12)} depth={0.4} />
        {/* lock walls + gates */}
        {[...CH, CH[5] + CW].map((x, i) => {
          const top = i <= 3 ? LV(Math.min(i, 3)) - 40 : LV(Math.max(0, 6 - i)) - 40;
          const tt = i === 3 ? LV(3) - 40 : top;
          return <P key={i} d={rect(x - 14, tt, 28, LV(0) + 130 - tt)} fill={C.concrete} depth={0.5} />;
        })}
        {/* ship */}
        <g transform={`translate(${sx},${sy + 12})`}><Ship s={0.5} /></g>
        {/* level labels: clamped inside the visible window so they never crop */}
        {([[-700, CH[0], LV(0) + 210, "ATLANTIK", 44], [CH[2] + CW, CH[3], LV(3) + 200, "DANAU GATUN", 50], [CH[5] + CW, WORLD_W + 200, LV(0) + 210, "PASIFIK", 44]] as [number, number, number, string, number][]).map(([r0, r1, y, label, fs]) => {
          const half = label.length * fs * 0.27 + 40;
          const v0 = camX - 540 / k + half, v1 = camX + 540 / k - half;
          const a = Math.max(r0 + half + 24, v0), b = Math.min(r1 - half - 24, v1);
          if (a > b) return null;
          const x = 0.5 * (a + b);
          return <text key={label} x={x} y={y} textAnchor="middle" fontFamily="Anton" fontSize={fs} fill={C.paper} letterSpacing={3}>{label}</text>;
        })}
        {/* flat sea-level line with an X: not dug at sea level */}
        <g opacity={stamp}>
          <path d={`M-700,${LV(0)} L${WORLD_W + 200},${LV(0)}`} stroke={C.red} strokeWidth={6} strokeDasharray="24 16" />
        </g>
        {/* ±26 m ruler */}
        <g opacity={ruler}>
          <path d={`M${CH[2] + CW + 40},${LV(0)} L${CH[2] + CW + 40},${LV(3)}`} stroke={C.gold} strokeWidth={12} strokeLinecap="round" />
          <path d={`M${CH[2] + CW + 14},${LV(3) + 30} L${CH[2] + CW + 40},${LV(3) - 6} L${CH[2] + CW + 66},${LV(3) + 30}Z`} fill={C.gold} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M${CH[2] + CW + 14},${LV(i)} L${CH[2] + CW + 66},${LV(i)}`} stroke={C.ink} strokeWidth={4} />)}
        </g>
      </g>
      <FGFoliage t={t} col="#3A5A3A" />
      <Rays x={-120} y={-80} op={0.18} t={t} />
    </Frame>
  );
};

// ── S8 15 Aug 1914: SS Ancon sails the canal, crowd cheers, 82 km ribbon ─────────────
export const S8: React.FC<SceneProps> = ({ t, lt }) => {
  const par = lt * 70;
  const ribbon = ease(ramp(lt, 3.2, 4.6));
  const flash = 1 - ramp(lt, 0.05, 0.6);
  return (
    <Frame id="s8" bg={["#BFE3EE", "#F7E2C4"]}>
      <Sun x={180} y={540} r={60} />
      <Cloud x={((900 - par * 0.3) % 1300) + 100} y={600} s={0.8} seed={3} />
      <g transform={cam(1.0 + 0.22 * easeOut(ramp(lt, 0, 5.7)), 540, 1150, -150 * easeOut(ramp(lt, 0, 5.7)), 50 * easeOut(ramp(lt, 0, 5.7)))}>
        <g transform={`translate(${-par * 0.15},0)`}>
          <Mountains y={940} seed={21.7} h={300} col="#98B8B6" x0={-200} x1={1900} />
          <Haze y={930} h={180} op={0.5} />
        </g>
        <g transform={`translate(${-par * 0.4},0)`}>
          <Hills y={930} seed={8.1} col={C.leafLt} amp={50} />
          <Forest y={980} seed={71} n={14} scale={0.6} t={t} />
        </g>
        <g transform={`translate(${-(par % 400)},0)`}>
          <P d={wave(1040, 8, 300, 0.5, -200, 1700)} fill={C.leaf} depth={0.6} />
          {Array.from({ length: 16 }, (_, i) => (
            <g key={i} transform={`translate(${i * 100 - 100},1070) scale(0.85)`}>
              <Figure pose={i % 3 === 0 ? "raise" : "stand"} color={C.box[i % 7]} armRot={Math.sin(t * 6 + i) * 18} />
            </g>
          ))}
          {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${i * 60 - 100},990 l20,26 l20,-26`} fill={C.box[i % 7]} />)}
          <path d={`M-200,990 Q${700},1020 1700,990`} stroke={C.ink} strokeWidth={2} fill="none" />
        </g>
        <Water y={1110} t={t} col={C.carib} amp={7} />
        <g transform={`translate(${400 + lt * 50},1150)`}><Ship s={1.15} liner name="SS ANCON" /></g>
        <P d={wave(1170, 6, 200, t * 2)} fill={mix(C.carib, "#1A3050", 0.15)} depth={0.3} light={false} />
        <g transform={`translate(${-(par % 400)},0)`}>
          <P d={wave(1300, 8, 260, 1.7, -200, 1700)} fill={C.leafDk} depth={0.6} />
        </g>
        {ribbon > 0 ? (
          <g>
            <P d={rect(80, 1330, 920 * ribbon, 60)} fill={C.gold} depth={0.5} />
            {Array.from({ length: 9 }, (_, i) => (i / 8 <= ribbon ? <path key={i} d={`M${80 + i * 115},1330 L${80 + i * 115},${i % 4 === 0 ? 1372 : 1352}`} stroke={C.ink} strokeWidth={4} /> : null))}
          </g>
        ) : null}
      </g>
      <rect width={1080} height={1920} fill="#FFFFFF" opacity={flash * 0.45} />
      <FGFoliage t={t} />
      <Rays x={-120} y={-80} op={0.2} t={t} />
    </Frame>
  );
};

// ── S9 31 Dec 1999, 12.00: clock tower strikes noon, Panama flag rises ───────────────
export const S9: React.FC<SceneProps> = ({ t, lt }) => {
  const hour = lerp(11.75, 12, ease(ramp(lt, 0.3, 1.6)));
  const lift = ease(ramp(lt, 1.4, 5.0));
  const tilt = ease(ramp(lt, 0, 5.9));
  const glow = ramp(lt, 1.5, 1.9) * (1 - 0.5 * ramp(lt, 2.5, 4));
  return (
    <Frame id="s9" bg={["#9FD0E6", "#F7DDB8"]}>
      <Sun x={540} y={430 + tilt * 120} r={70} />
      <g transform={cam(1.06, 540, 1150, 0, lerp(-170, 130, tilt))}>
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i} transform={`translate(${60 + i * 160},1220)`}>
            <P d={rect(-50, -160 - hash(i) * 220, 100, 160 + hash(i) * 220)} fill={mix("#C9D4E0", "#ffffff", hash(i * 3) * 0.4)} depth={0.5} />
          </g>
        ))}
        <Hills y={1210} seed={9.1} col={C.leafLt} amp={20} />
        <g transform="translate(780,1360) scale(0.85)"><ClockTower hour={hour} glow={glow} /></g>
        <g transform="translate(270,1380)"><Flag kind="pa" t={t} h={760} lift={lift} w={230} /></g>
        {[150, 400].map((x, i) => <g key={i} transform={`translate(${x},1390) scale(0.8)`}><Palm h={320} t={t} seed={i} /></g>)}
        <Water y={1400} t={t} col={C.carib} amp={6} />
      </g>
      <Rays x={-120} y={-80} op={0.2} t={t} />
    </Frame>
  );
};

// ── S10 Cheapest toll: 36 cents, Richard Halliburton swam the canal (1928) ──────────
export const S10: React.FC<SceneProps> = ({ t, lt }) => {
  const coinIn = easeOut(ramp(lt, 1.5, 2.3));
  const swim = ramp(lt, 2.6, 9.3);
  const weigh = ease(ramp(lt, 7.3, 8.0));
  const tip = -0.8 * ease(ramp(lt, 2.2, 2.8)) * (1 - weigh);
  return (
    <Frame id="s10" bg={["#CFE9F0", "#F6E5C6"]}>
      <g transform={cam(1.03 + lt * 0.008, 540, 1100, -lt * 6)}>
        <P d={rect(-100, 1050, 1300, 900)} fill={C.concreteDk} depth={0.6} />
        <Water y={1150} t={t} col={C.carib} amp={6} x0={-100} x1={1180} />
        <g transform={`translate(${lerp(120, 980, swim)},${1166})`}><Swimmer t={t} /></g>
        {Array.from({ length: 6 }, (_, i) => {
          const ph = (t * 2 + i * 0.3) % 1;
          return <path key={i} d={circle(lerp(120, 980, swim) - 130 - ph * 90, 1160 - Math.sin(ph * Math.PI) * 30, 6 + i)} fill="#FFFFFF" opacity={0.7 * (1 - ph)} />;
        })}
        <Wall x={-60} y={1250} w={1200} h={700} />
        <g transform="translate(540,1030) scale(1.5)">
          <Scale tip={tip} />
          {lt >= 1.5 ? <g transform={`translate(-190,${lerp(-470, -150, coinIn)}) rotate(${-tip * 9})`}><Coin r={52} label="36¢" spin={(1 - coinIn) * 8} /></g> : null}
          {weigh > 0 ? <g transform={`translate(190,-150) scale(${0.9 * weigh})`} opacity={weigh}><Figure pose="stand" color="#C98E6A" /></g> : null}
        </g>
      </g>
      {lt < 1.6 ? (
        <g transform={`translate(540,600) scale(${0.8 * easeOut(ramp(lt, 0.1, 0.5))})`} opacity={1 - ramp(lt, 1.3, 1.6)}>
          <Coin r={130} label="?" spin={t * 3} />
        </g>
      ) : null}
      <Rays x={-120} y={-80} op={0.2} t={t} />
    </Frame>
  );
};

// ── S11 Payoff: isthmus between two oceans, glowing gold canal, AUDIRA plaque ───────
export const S11: React.FC<SceneProps> = ({ t, lt }) => {
  const s = lerp(1.35, 1.0, ease(ramp(lt, 0, 4.4)));
  const glow = 0.6 + 0.4 * Math.sin(t * 2.4);
  const canal = [[420, 740], [470, 860], [560, 930], [640, 1000], [600, 1080], [650, 1200]];
  const shipP = partial(canal, ramp(lt, 0.4, 4.4)).tip;
  const canalD = "M" + canal.map((p) => p.join(",")).join(" L");
  return (
    <Frame id="s11" bg={[C.carib, C.pacific]}>
      <g transform={cam(s, 540, 970)}>
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={waveLine(420 + i * 110, 6, 240, t * 0.8 + i)} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.3} />
        ))}
        <P d={`M-200,800 Q300,720 560,800 Q800,880 1300,790 L1300,1150 Q900,1240 600,1150 Q300,1080 -200,1180Z`} fill={C.leafLt} depth={1.3} />
        <P d={`M-200,840 Q300,770 560,850 Q800,920 1300,840 L1300,1100 Q900,1180 600,1110 Q300,1040 -200,1130Z`} fill={C.leaf} depth={0.5} />
        {Array.from({ length: 14 }, (_, i) => (
          <g key={i} transform={`translate(${-20 + i * 85 + hash(i) * 30},${900 + hash(i * 3) * 160}) scale(0.32)`}><Tree h={220} seed={i} col={i % 2 ? C.leafDk : C.leaf} /></g>
        ))}
        <path d={canalD} stroke={C.gold} strokeWidth={70} fill="none" opacity={0.45 * glow} filter="url(#pglow)" strokeLinecap="round" />
        <path d={canalD} stroke={C.gold} strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={ellipse(600, 960, 90, 46)} fill={mix(C.carib, C.gold, 0.4)} />
        <g transform={`translate(${shipP[0]},${shipP[1]}) scale(0.18)`}><Ship s={1} /></g>
        <g transform="translate(860,1030)">
          <path d={rect(-6, 0, 12, 60)} fill={C.wood} />
          <Layered depth={0.5} draw={(o) => <path d={rect(-130, -50, 260, 64)} fill={o ?? C.paper} />} />
          <path d={rect(-130, -50, 260, 9)} fill={C.red} />
          <text x={0} y={2} textAnchor="middle" fontFamily="Anton" fontSize={36} fill={C.ink} letterSpacing={4}>AUDIRA</text>
        </g>
        <text x={540} y={640} textAnchor="middle" fontFamily="Anton" fontSize={60} fill={C.paper} letterSpacing={6}>ATLANTIK</text>
        <text x={540} y={1330} textAnchor="middle" fontFamily="Anton" fontSize={60} fill={C.paper} letterSpacing={6}>PASIFIK</text>
        <LightPool x={560} y={960} rx={360} ry={220} col="#FFE7B0" op={0.35} />
      </g>
      <Rays x={-120} y={-80} op={0.2} t={t} />
    </Frame>
  );
};

export const SCENE_MAP: Record<string, React.FC<SceneProps>> = { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11 };
