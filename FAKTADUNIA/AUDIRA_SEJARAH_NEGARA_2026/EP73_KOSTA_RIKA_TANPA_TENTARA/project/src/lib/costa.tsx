// EP73 Kosta Rika: procedural SVG props (all seeded, no Math.random). Coordinates in the 1080x1920 frame.
import React from "react";
import { rng, W } from "./set";

const INK = "#07080B";

// Volcano range with mist bands (Central Valley backdrop).
export const Volcanoes: React.FC<{ y: number; ink?: string; rim?: string; o?: number; smoke?: number }> = ({ y, ink = "#141A22", rim = "#F3B262", o = 1, smoke = 0 }) => (
  <g opacity={o}>
    <path d={`M-40,${y} L180,${y - 260} L250,${y - 300} L300,${y - 290} L520,${y - 60} L640,${y - 140} L760,${y - 380} L830,${y - 400} L880,${y - 380} L1120,${y - 80} L1120,${y + 400} L-40,${y + 400} Z`} fill={ink} />
    <path d={`M180,${y - 260} L250,${y - 300} L300,${y - 290}`} stroke={rim} strokeWidth={3} fill="none" opacity={0.6} />
    <path d={`M760,${y - 380} L830,${y - 400} L880,${y - 380}`} stroke={rim} strokeWidth={3} fill="none" opacity={0.6} />
    {smoke > 0 ? [0, 1, 2].map((i) => <ellipse key={i} cx={830 + i * 30 + smoke * 20} cy={y - 440 - i * 50} rx={50 + i * 25} ry={22 + i * 8} fill="#C9B9A0" opacity={0.18 - i * 0.04} />) : null}
  </g>
);

// Palm silhouette (trunk curve + fronds).
export const Palm: React.FC<{ x: number; y: number; h?: number; lean?: number; sway?: number; ink?: string }> = ({ x, y, h = 420, lean = 30, sway = 0, ink = INK }) => {
  const tx = x + lean, ty = y - h;
  const fr = [-160, -120, -70, -20, 30, 80, 130, 170];
  return (
    <g>
      <path d={`M${x - 10},${y} Q${x + lean * 0.2},${y - h * 0.5} ${tx - 5},${ty} L${tx + 5},${ty} Q${x + lean * 0.2 + 14},${y - h * 0.5} ${x + 10},${y} Z`} fill={ink} />
      {fr.map((a, i) => {
        const r = (a + sway * 6) * (Math.PI / 180);
        const L = 150 + (i % 3) * 30;
        const ex = tx + Math.sin(r) * L, ey = ty - Math.cos(r) * L * 0.45 + 40;
        return <path key={i} d={`M${tx},${ty} Q${(tx + ex) / 2},${ty - 70} ${ex},${ey} Q${(tx + ex) / 2},${ty - 40} ${tx},${ty + 6} Z`} fill={ink} />;
      })}
    </g>
  );
};

// Foreground leaves (blurred occluder) at a screen edge.
export const Leaves: React.FC<{ side?: "L" | "R"; y?: number; seed?: number; dx?: number }> = ({ side = "L", y = 1500, seed = 3, dx = 0 }) => {
  const r = rng(seed);
  const x0 = side === "L" ? -60 + dx : W + 60 + dx;
  const dir = side === "L" ? 1 : -1;
  return (
    <g style={{ filter: "blur(9px)" }}>
      {Array.from({ length: 7 }).map((_, i) => {
        const yy = y + i * 70 - 200 + r() * 40;
        const L = 220 + r() * 160;
        const ang = (-30 + r() * 60) * (Math.PI / 180);
        const ex = x0 + dir * Math.cos(ang) * L, ey = yy + Math.sin(ang) * L;
        return <path key={i} d={`M${x0},${yy} Q${(x0 + ex) / 2},${yy - 60} ${ex},${ey} Q${(x0 + ex) / 2},${yy + 50} ${x0},${yy} Z`} fill="#04120C" />;
      })}
    </g>
  );
};

// Crenellated barracks / fortress wall with two watchtowers. crack = 0..1 grows the fracture at crackX.
export const Fortress: React.FC<{ y: number; x0?: number; x1?: number; h?: number; ink?: string; brick?: string; rim?: string; crack?: number; crackX?: number; towers?: boolean; banner?: React.ReactNode; window?: string }> = ({ y, x0 = -40, x1 = 1120, h = 520, ink = "#1A1512", brick = "#2A211B", rim = "#F5B54A", crack = 0, crackX = 560, towers = true, banner, window }) => {
  const top = y - h;
  const merl: React.ReactNode[] = [];
  for (let x = x0; x < x1; x += 80) merl.push(<rect key={x} x={x} y={top - 46} width={48} height={50} fill={ink} />);
  const bricks: React.ReactNode[] = [];
  for (let row = 0; row < h / 44; row++) {
    const yy = top + row * 44;
    bricks.push(<line key={`r${row}`} x1={x0} y1={yy} x2={x1} y2={yy} stroke={brick} strokeWidth={3} />);
    for (let x = x0 + (row % 2 ? 40 : 0); x < x1; x += 90) bricks.push(<line key={`c${row}_${x}`} x1={x} y1={yy} x2={x} y2={yy + 44} stroke={brick} strokeWidth={3} />);
  }
  // fracture: jagged polyline growing from the impact point down and up
  const r = rng(73);
  const pts: [number, number][] = [[crackX, top + h * 0.42]];
  for (let i = 0; i < 9; i++) pts.push([crackX + (r() - 0.5) * 90, top + h * 0.42 + (i + 1) * 40 * (i % 2 ? 1 : -1) * 0.9 + i * 12]);
  const n = Math.round(crack * pts.length);
  const branch = pts.slice(0, Math.max(1, n));
  return (
    <g>
      <rect x={x0} y={top} width={x1 - x0} height={h + 400} fill={ink} />
      {bricks}
      {merl}
      <line x1={x0} y1={top} x2={x1} y2={top} stroke={rim} strokeWidth={4} opacity={0.55} />
      {towers ? [x0 + 90, x1 - 230].map((tx, i) => (
        <g key={i}>
          <rect x={tx} y={top - 220} width={140} height={260} fill={ink} />
          {[0, 1, 2].map((k) => <rect key={k} x={tx + k * 50} y={top - 262} width={36} height={44} fill={ink} />)}
          <rect x={tx + 56} y={top - 160} width={26} height={60} rx={13} fill={window ?? "#0A0806"} />
          <line x1={tx} y1={top - 220} x2={tx + 140} y2={top - 220} stroke={rim} strokeWidth={3} opacity={0.5} />
        </g>
      )) : null}
      {/* arched gate */}
      <path d={`M${(x0 + x1) / 2 - 110},${y} L${(x0 + x1) / 2 - 110},${y - 200} Q${(x0 + x1) / 2},${y - 300} ${(x0 + x1) / 2 + 110},${y - 200} L${(x0 + x1) / 2 + 110},${y} Z`} fill="#050403" />
      {banner}
      {crack > 0 ? (
        <g>
          <polyline points={branch.map((p) => p.join(",")).join(" ")} fill="none" stroke="#FFE2A0" strokeWidth={7} strokeLinejoin="round" opacity={0.95} />
          <polyline points={branch.map((p) => p.join(",")).join(" ")} fill="none" stroke="#FFE2A0" strokeWidth={22} strokeLinejoin="round" opacity={0.18} />
          {branch.slice(1, 6).map((p, i) => <line key={i} x1={p[0]} y1={p[1]} x2={p[0] + (i % 2 ? 60 : -60)} y2={p[1] + 30} stroke="#FFE2A0" strokeWidth={3} opacity={0.7 * crack} />)}
        </g>
      ) : null}
    </g>
  );
};

// Dust burst at impact (seeded particles radiating with age 0..1).
export const Dust: React.FC<{ x: number; y: number; age: number; n?: number; color?: string }> = ({ x, y, age, n = 26, color = "#E8D2A8" }) => {
  if (age <= 0 || age > 1.6) return null;
  const r = rng(11);
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const a = r() * Math.PI * 2, sp = 120 + r() * 260, s = 6 + r() * 16;
        const d = sp * Math.min(1, age * 1.4);
        return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d * 0.7 + age * age * 120} r={s * (1 + age)} fill={color} opacity={Math.max(0, 0.55 * (1 - age / 1.6))} />;
      })}
    </g>
  );
};

// Guard post + helmet on the ground (empty post, hook).
export const GuardPost: React.FC<{ x: number; y: number; rim?: string }> = ({ x, y, rim = "#D9503A" }) => (
  <g>
    <path d={`M${x - 70},${y} L${x - 70},${y - 230} L${x - 95},${y - 230} L${x},${y - 300} L${x + 95},${y - 230} L${x + 70},${y - 230} L${x + 70},${y} Z`} fill={INK} stroke={rim} strokeWidth={3} strokeOpacity={0.55} />
    <rect x={x - 40} y={y - 190} width={80} height={60} fill="#1C140E" />
    <g transform={`translate(${x + 170},${y - 18})`}>
      <path d="M-46,10 Q-46,-40 0,-42 Q46,-40 46,10 Z" fill={INK} stroke={rim} strokeWidth={4} />
      <rect x={-58} y={8} width={116} height={10} rx={5} fill={INK} stroke={rim} strokeWidth={3} />
    </g>
  </g>
);

// Rifle lying on the ground (S8 morphs into a book via m 0..1).
export const GroundRifle: React.FC<{ x: number; y: number; m?: number; rim?: string }> = ({ x, y, m = 0, rim = "#D9503A" }) => (
  <g>
    <g opacity={1 - m}>
      <path d={`M${x - 160},${y} L${x + 60},${y - 6} L${x + 170},${y - 10} L${x + 170},${y - 2} L${x + 60},${y + 8} L${x - 40},${y + 14} L${x - 120},${y + 34} L${x - 160},${y + 26} Z`} fill={INK} stroke={rim} strokeWidth={3} />
    </g>
    <g opacity={m} transform={`translate(${x},${y}) scale(${0.6 + 0.4 * m})`}>
      <path d="M-120,-10 L0,10 L120,-10 L120,40 L0,60 L-120,40 Z" fill="#F6E9CF" stroke="#F5B54A" strokeWidth={4} />
      <line x1={0} y1={10} x2={0} y2={60} stroke="#8A5A2B" strokeWidth={4} />
      {[0, 1, 2].map((i) => <line key={i} x1={-100} y1={6 + i * 12} x2={-20} y2={20 + i * 12} stroke="#8A7A5A" strokeWidth={2} />)}
      {[0, 1, 2].map((i) => <line key={`r${i}`} x1={20} y1={20 + i * 12} x2={100} y2={6 + i * 12} stroke="#8A7A5A" strokeWidth={2} />)}
    </g>
  </g>
);

// Central America map (stylised): neighbours dim, Costa Rica lit by `lit` 0..1.
export const CAMap: React.FC<{ lit: number; sea?: string; land?: string; rim?: string }> = ({ lit, sea = "#0B2234", land = "#C9B48A", rim = "#F5B54A" }) => {
  const nic = "M60,420 L300,360 L520,330 L610,420 L640,560 L620,760 L560,830 L430,810 L330,720 L210,620 L120,560 Z";
  const hon = "M-40,200 L200,160 L420,200 L540,260 L520,330 L300,360 L60,420 L-40,380 Z";
  const cr = "M430,810 L560,830 L620,760 L690,860 L770,980 L760,1070 L700,1040 L640,1000 L600,1070 L560,1040 L520,960 L450,900 Z";
  const pan = "M760,1070 L770,980 L850,1020 L940,990 L1020,1040 L1120,1010 L1120,1130 L1010,1150 L920,1110 L840,1160 L790,1120 Z";
  return (
    <g>
      <rect x={-100} y={0} width={1300} height={1920} fill={sea} />
      {Array.from({ length: 14 }).map((_, i) => <line key={i} x1={-100} y1={120 + i * 120} x2={1200} y2={120 + i * 120} stroke="#1D4058" strokeWidth={2} opacity={0.6} />)}
      {Array.from({ length: 10 }).map((_, i) => <line key={`v${i}`} x1={i * 130} y1={0} x2={i * 130} y2={1920} stroke="#1D4058" strokeWidth={2} opacity={0.6} />)}
      <path d={hon} fill={land} opacity={0.35} />
      <path d={nic} fill={land} opacity={0.55} stroke="#0B2234" strokeWidth={4} />
      <path d={pan} fill={land} opacity={0.55} stroke="#0B2234" strokeWidth={4} />
      <path d={cr} fill={rim} opacity={0.35 + 0.6 * lit} stroke="#FFE7A8" strokeWidth={4 + 4 * lit} />
      <path d={cr} fill="none" stroke={rim} strokeWidth={26} opacity={0.25 * lit} style={{ filter: "blur(8px)" }} />
      <circle cx={600} cy={930} r={12} fill="#0B0C10" stroke="#FFE7A8" strokeWidth={4} opacity={lit} />
    </g>
  );
};

// World map as seeded dot grid (equirectangular). Returns <g>; highlight points light up.
const CONT: [number, number, number, number][] = [
  [-100, 48, 32, 18], [-85, 22, 10, 9], [-60, -14, 16, 24], [15, 52, 20, 10], [20, 6, 22, 28], [90, 48, 46, 18], [78, 20, 9, 10], [105, 12, 10, 8], [134, -25, 17, 10], [-42, 72, 14, 8],
];
export const worldXY = (lon: number, lat: number, x0: number, y0: number, w: number): [number, number] => [x0 + ((lon + 180) / 360) * w, y0 + ((90 - lat) / 180) * (w / 2)];
export const WorldDots: React.FC<{ x0: number; y0: number; w: number; color?: string }> = ({ x0, y0, w, color = "#3E5A70" }) => {
  const dots: React.ReactNode[] = [];
  for (let lat = 78; lat > -50; lat -= 3.2) for (let lon = -170; lon < 180; lon += 3.2) {
    const inside = CONT.some(([cx, cy, rx, ry]) => ((lon - cx) / rx) ** 2 + ((lat - cy) / ry) ** 2 < 1);
    if (!inside) continue;
    const [x, y] = worldXY(lon, lat, x0, y0, w);
    dots.push(<circle key={`${lon}_${lat}`} cx={x} cy={y} r={w / 420} fill={color} />);
  }
  return <g>{dots}</g>;
};
// ~21 states without a standing army (approximate positions; only three are labelled on screen).
export const NO_ARMY: [number, number][] = [
  [-84, 10], [-80, 8.6], [-19, 65], [9.5, 47.1], [1.5, 42.5], [7.4, 43.7], [12.4, 41.9], [12.4, 43.9], [-61.7, 12.1], [-61.4, 15.4],
  [-61, 13.9], [-61.2, 13.2], [-62.7, 17.3], [-172, -13.8], [179, -8], [173, 1.4], [166.9, -0.5], [134.5, 7.5], [171, 7], [158, 6.9], [160, -9.6],
];

// Colonnaded hall (diplomacy): pillars, long table, warm lamps.
export const HallPillars: React.FC<{ floor: number; ink?: string; rim?: string }> = ({ floor, ink = "#120F14", rim = "#BFE9FF" }) => (
  <g>
    <rect x={0} y={floor} width={W} height={900} fill="#1A1418" />
    {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={540} y1={floor} x2={-400 + i * 170} y2={1920} stroke="#2A2228" strokeWidth={3} />)}
    {[60, 300, 780, 1020].map((x, i) => (
      <g key={i}>
        <rect x={x - 46} y={floor - 1100} width={92} height={1100} fill={ink} />
        <rect x={x - 62} y={floor - 1120} width={124} height={34} fill={ink} />
        <rect x={x - 62} y={floor - 30} width={124} height={30} fill={ink} />
        <line x1={x + 46} y1={floor - 1086} x2={x + 46} y2={floor - 30} stroke={rim} strokeWidth={3} opacity={0.35} />
      </g>
    ))}
    <path d={`M-20,${floor - 1150} L1100,${floor - 1150} L1100,${floor - 1220} L540,${floor - 1360} L-20,${floor - 1220} Z`} fill={ink} />
  </g>
);

// Tropical school building (payoff): red tile roof, veranda columns, board reading AUDIRA.
export const School: React.FC<{ x: number; y: number; w?: number; lamp?: number }> = ({ x, y, w = 760, lamp = 0.6 }) => {
  const h = 330;
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} fill="#E8D8B8" />
      <rect x={x} y={y - h} width={w} height={h} fill="#0B0C10" opacity={0.25} />
      <path d={`M${x - 60},${y - h + 10} L${x + w / 2},${y - h - 170} L${x + w + 60},${y - h + 10} Z`} fill="#8E3A22" />
      {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={x - 40 + i * ((w + 80) / 8)} y1={y - h + 6} x2={x + w / 2} y2={y - h - 164} stroke="#6A2A18" strokeWidth={3} />)}
      {Array.from({ length: 6 }).map((_, i) => (
        <g key={`c${i}`}>
          <rect x={x + 40 + i * ((w - 100) / 5)} y={y - h + 30} width={22} height={h - 30} fill="#F6E9CF" />
          {i < 5 ? <rect x={x + 90 + i * ((w - 100) / 5)} y={y - h + 90} width={70} height={100} fill="#FFD58A" opacity={lamp} /> : null}
        </g>
      ))}
      <rect x={x + w / 2 - 130} y={y - h - 70} width={260} height={56} fill="#1A120C" stroke="#F5B54A" strokeWidth={3} />
      <text x={x + w / 2} y={y - h - 28} textAnchor="middle" fontFamily="BarlowX" fontSize={40} letterSpacing={5} fill="#F5B54A" style={{ color: "#F5B54A" }}>ESCUELA · AUDIRA</text>
      <rect x={x - 30} y={y} width={w + 60} height={24} fill="#3A2A1C" />
    </g>
  );
};
