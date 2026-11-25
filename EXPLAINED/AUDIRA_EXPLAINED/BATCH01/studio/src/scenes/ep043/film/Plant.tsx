// Water treatment plant (IPA) as a vertical storybook cutaway: water cascades down
// koagulasi -> flokulasi -> sedimentasi -> filter pasir -> klor -> reservoir.
import React from "react";
import { C, mulberry32 } from "../Cover.tsx";
import { Tag } from "./ui.tsx";
import { Key, camAt, cs, layerT, wt } from "./util.ts";

export const BROWN = "#A57548";
export const CLEAR = "#A9CDE0";

/** Concrete cutaway box (open top). Inner rect x,y,w,h. */
export const TankBox: React.FC<{ x: number; y: number; w: number; h: number; wall?: number; children?: React.ReactNode }> = ({
  x,
  y,
  w,
  h,
  wall = 24,
  children,
}) => (
  <g>
    <rect x={x - wall + 10} y={y + 14} width={w + wall * 2} height={h + wall} fill="#4a3424" opacity={0.22} filter="url(#blur14)" />
    <rect x={x - wall} y={y} width={w + wall * 2} height={h + wall} fill="#BDB3A3" filter="url(#wcSoft)" />
    <rect x={x} y={y} width={w} height={h} fill="#EFE7D8" filter="url(#wcFine)" />
    {children}
    <rect x={x - wall} y={y} width={w + wall * 2} height={h + wall} fill="none" stroke={C.graphite} strokeWidth={2.4} opacity={0.6} filter="url(#pencil)" />
    <rect x={x} y={y} width={w} height={h} fill="none" stroke={C.graphite} strokeWidth={1.8} opacity={0.45} filter="url(#pencil)" />
  </g>
);

/** Straight pipe run with outline + highlight (polyline). */
export const PipeRun: React.FC<{ pts: [number, number][]; w?: number; color?: string; flow?: string; t?: number }> = ({ pts, w = 34, color = C.steel, flow, t = 0 }) => {
  const d = "M" + pts.map((p) => p.join(",")).join(" L");
  return (
    <g filter="url(#wcSoft)" fill="none" strokeLinejoin="round">
      <path d={d} stroke={C.graphite} strokeWidth={w + 6} />
      <path d={d} stroke={color} strokeWidth={w} />
      <path d={d} stroke={C.steelLight} strokeWidth={w * 0.2} transform={`translate(${-w * 0.18} ${-w * 0.18})`} opacity={0.8} />
      {flow && <path d={d} stroke={flow} strokeWidth={w * 0.32} strokeDasharray="18 22" strokeDashoffset={-t * 90} strokeLinecap="round" opacity={0.9} />}
    </g>
  );
};

/** Sedimentation basin; over 0 = working (clear top, sludge bottom), 1 = overloaded (brown to the brim). */
export const SedTank: React.FC<{ x: number; y: number; w: number; h: number; t: number; over: number }> = ({ x, y, w, h, t, over }) => {
  const r = mulberry32(3301);
  const level = y + 50;
  const flocs = Array.from({ length: 60 }, () => [r(), r(), 5 + r() * 8] as const);
  const sludgeH = 50 + over * 30;
  return (
    <TankBox x={x} y={y} w={w} h={h}>
      <defs>
        <linearGradient id={`sedG${over > 0.5 ? 1 : 0}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={over > 0.5 ? "#8C5E38" : "#B48A62"} />
          <stop offset="0.5" stopColor={over > 0.5 ? BROWN : "#C9C3AE"} />
          <stop offset="1" stopColor={over > 0.5 ? "#94663F" : CLEAR} />
        </linearGradient>
      </defs>
      <rect x={x} y={level} width={w} height={h - (level - y)} fill={`url(#sedG${over > 0.5 ? 1 : 0})`} opacity={0.88} filter="url(#wcSoft)" />
      {/* lamella plates */}
      <g opacity={0.45} filter="url(#wcFine)">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={x + w * 0.58 + i * 46} y={level + 60} width={10} height={h * 0.45} fill="#F4EEE2" transform={`rotate(30 ${x + w * 0.58 + i * 46} ${level + 60})`} />
        ))}
      </g>
      <g filter="url(#wcFine)">
        {flocs.map(([a, b, s], i) => {
          const fall = (b + t * (0.07 + a * 0.04)) % 1;
          const fx = x + 30 + a * (w - 60) + Math.sin(t + i) * 6;
          const fy = level + 20 + fall * (h - (level - y) - sludgeH - 30) * (1 - over * 0.6) + over * b * 120;
          return <circle key={i} cx={fx} cy={fy} r={s * (1 + over * 0.4)} fill={i % 3 ? "#6E4A2E" : "#8E6340"} opacity={0.85} />;
        })}
      </g>
      <path
        d={`M${x},${y + h} L${x},${y + h - sludgeH} C${x + w * 0.25},${y + h - sludgeH - 18} ${x + w * 0.5},${y + h - sludgeH + 10} ${x + w * 0.75},${y + h - sludgeH - 8} C${x + w * 0.9},${y + h - sludgeH - 14} ${x + w},${y + h - sludgeH} ${x + w},${y + h - sludgeH} L${x + w},${y + h} Z`}
        fill="#5E3E26"
        opacity={0.9}
        filter="url(#wcSoft)"
      />
      {/* surface ripples */}
      <path d={`M${x},${level} ${Array.from({ length: 12 }, (_, i) => `q${w / 24},${-6} ${w / 12},0`).join(" ")}`} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.7} transform={`translate(${Math.sin(t) * 6} 0)`} />
      {/* V-notch weir on the right wall */}
      <g filter="url(#wcFine)">
        <path d={`M${x + w - 6},${level - 24} l18,0 l0,40 l-18,0 Z`} fill="#BDB3A3" />
        <path d={`M${x + w + 2},${level - 22} l10,14 l10,-14 l10,14 l10,-14`} stroke={C.graphite} strokeWidth={2} fill="none" />
        <path
          d={`M${x + w + 12},${level - 8} C${x + w + 40},${level - 6} ${x + w + 50},${level + 30} ${x + w + 52},${level + 70}`}
          stroke={over > 0.5 ? BROWN : CLEAR}
          strokeWidth={14 + over * 10}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="22 10"
          strokeDashoffset={-t * 80}
        />
      </g>
    </TankBox>
  );
};

const PaddleWheel: React.FC<{ cx: number; cy: number; r: number; a: number }> = ({ cx, cy, r, a }) => (
  <g transform={`rotate(${a} ${cx} ${cy})`} filter="url(#wcFine)">
    {[0, 90, 180, 270].map((d) => (
      <g key={d} transform={`rotate(${d} ${cx} ${cy})`}>
        <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={C.graphite} strokeWidth={8} />
        <rect x={cx + r * 0.62} y={cy - 26} width={r * 0.4} height={52} rx={4} fill={C.wood} stroke={C.graphite} strokeWidth={2} />
      </g>
    ))}
    <circle cx={cx} cy={cy} r={16} fill={C.chromeDark} stroke={C.graphite} strokeWidth={2} />
  </g>
);

const KEYS = (): Key[] => [
  [cs("l06") - 0.1, 540, 1780, 0.5],
  [wt("lumpur") - 0.35, 540, 1740, 0.54],
  [wt("digumpalkan") - 0.1, 450, 540, 1.3],
  [wt("diaduk") - 0.35, 500, 560, 1.27],
  [wt("diaduk") + 0.25, 540, 1100, 1.05],
  [wt("diendapkan") - 0.35, 540, 1130, 1.07],
  [wt("diendapkan") + 0.25, 560, 1700, 1.05],
  [wt("disaring") - 0.35, 560, 1730, 1.07],
  [wt("disaring") + 0.25, 540, 2390, 1.15],
  [wt("lalu") - 0.05, 540, 2420, 1.17],
  [wt("diberi") + 0.2, 560, 2990, 1.0],
  [cs("l07"), 560, 3030, 0.96],
];

export const Plant: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(KEYS(), t);
  const r = mulberry32(2207);
  const blobs = Array.from({ length: 16 }, () => [r() * 1300 - 100, r() * 3600, 120 + r() * 220, Math.floor(r() * 3)] as const);
  const flocs = Array.from({ length: 70 }, () => [r(), r(), r()] as const);
  const drops = Array.from({ length: 34 }, () => [r(), r()] as const);
  const RX = 540;
  const RY = 1780;
  const spin = Math.cos(t * 26);
  return (
    <g>
      {/* backdrop paper with soft washes, slower parallax */}
      <g transform={layerT(cam, 0.7, RX, RY)}>
        <rect x={-900} y={-900} width={2900} height={5400} fill="#F3E9D6" />
        <g filter="url(#wcBig)">
          {blobs.map(([x, y, s, k], i) => (
            <circle key={i} cx={x} cy={y} r={s} fill={[C.sage, C.ochre, C.clear][k]} opacity={0.22} />
          ))}
        </g>
      </g>
      <g transform={layerT(cam, 1, RX, RY)}>
        {/* raw water arriving */}
        <PipeRun pts={[[-300, 400], [210, 400]]} w={40} flow="#D6B48C" t={t} />
        <path d={`M214,400 C240,402 250,420 252,440`} stroke={BROWN} strokeWidth={22} fill="none" filter="url(#wcFine)" />
        {/* 1 koagulasi */}
        <TankBox x={180} y={330} w={440} h={430}>
          <rect x={180} y={420} width={440} height={340} fill={BROWN} opacity={0.9} filter="url(#wcSoft)" />
          <g filter="url(#wcFine)">
            {Array.from({ length: 6 }, (_, i) => {
              const a = t * 3 + i;
              return <ellipse key={i} cx={300 + Math.cos(a) * (60 + i * 18)} cy={600 + Math.sin(a) * (30 + i * 10)} rx={22} ry={6} fill="#D6B48C" opacity={0.6} />;
            })}
          </g>
          {/* flash mixer */}
          <rect x={250} y={292} width={100} height={46} rx={6} fill={C.chromeDark} stroke={C.graphite} strokeWidth={2} filter="url(#wcFine)" />
          <line x1={300} y1={338} x2={300} y2={650} stroke={C.graphite} strokeWidth={8} />
          <ellipse cx={300 - 40 * spin} cy={650} rx={Math.abs(44 * spin) + 4} ry={10} fill={C.chrome} stroke={C.graphite} strokeWidth={2} />
          <ellipse cx={300 + 40 * spin} cy={650} rx={Math.abs(44 * spin) + 4} ry={10} fill={C.chromeDark} stroke={C.graphite} strokeWidth={2} />
        </TankBox>
        {/* coagulant dosing: liquid injected, not powder */}
        <g filter="url(#wcSoft)">
          <rect x={700} y={140} width={170} height={190} rx={18} fill="#E9E6F0" stroke={C.graphite} strokeWidth={2.5} />
          <rect x={712} y={200} width={146} height={118} rx={10} fill="#D9D3E6" />
        </g>
        <PipeRun pts={[[785, 330], [785, 372], [430, 372]]} w={14} />
        <g filter="url(#wcFine)">
          {Array.from({ length: 5 }, (_, k) => {
            const u = (t * 1.8 + k / 5) % 1;
            return <ellipse key={k} cx={430} cy={384 + u * 34} rx={6} ry={8} fill="#F4F1FA" stroke="#8C8AA6" strokeWidth={2} opacity={1 - u * 0.5} />;
          })}
        </g>
        <PipeRun pts={[[620, 700], [720, 700], [720, 860], [130, 860], [130, 930]]} w={30} flow="#D6B48C" t={t} />
        {/* 2 flokulasi */}
        <TankBox x={80} y={900} w={920} h={400}>
          <defs>
            <linearGradient id="flocG" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={BROWN} />
              <stop offset="1" stopColor="#C4A27E" />
            </linearGradient>
          </defs>
          <rect x={80} y={950} width={920} height={350} fill="url(#flocG)" opacity={0.9} filter="url(#wcSoft)" />
          {[290, 540, 790].map((cx, i) => (
            <PaddleWheel key={i} cx={cx} cy={1125} r={130} a={t * 26 + i * 30} />
          ))}
          <g filter="url(#wcFine)">
            {flocs.map(([a, b, c], i) => {
              const u = a;
              const cx = 100 + u * 880 + Math.sin(t * 0.8 + i) * 10;
              const cy = 975 + b * 300 + Math.cos(t * 0.7 + i) * 8;
              const s = 2.5 + u * 11 * (0.7 + c * 0.6);
              return <circle key={i} cx={cx} cy={cy} r={s} fill={i % 2 ? "#6E4A2E" : "#7F5636"} opacity={0.88} />;
            })}
          </g>
        </TankBox>
        <PipeRun pts={[[1000, 1270], [1060, 1270], [1060, 1380], [120, 1380], [120, 1440]]} w={30} flow="#C9A47A" t={t} />
        {/* 3 sedimentasi */}
        <SedTank x={80} y={1420} w={920} h={540} t={t} over={0} />
        <PipeRun pts={[[1052, 1540], [1052, 2060], [250, 2060], [250, 2120]]} w={30} flow="#DDEFF6" t={t} />
        {/* 4 filter pasir cepat */}
        <TankBox x={200} y={2100} w={680} h={560}>
          <rect x={200} y={2150} width={680} height={150} fill={CLEAR} opacity={0.6} filter="url(#wcSoft)" />
          <rect x={200} y={2300} width={680} height={70} fill="#4E4B48" opacity={0.9} filter="url(#wcSoft)" />
          <rect x={200} y={2370} width={680} height={170} fill="#D9B77C" filter="url(#wcSoft)" />
          <g>
            {Array.from({ length: 260 }, (_, i) => {
              const a = mulberry32(5000 + i)();
              const b = mulberry32(9000 + i)();
              return <circle key={i} cx={206 + a * 668} cy={2376 + b * 158} r={2.2} fill="#9C7A48" opacity={0.7} />;
            })}
          </g>
          <g filter="url(#wcFine)">
            {Array.from({ length: 26 }, (_, i) => (
              <ellipse key={i} cx={215 + i * 26} cy={2580 + (i % 2) * 18} rx={16} ry={12} fill={i % 3 ? "#9A948C" : "#B5ADA2"} />
            ))}
          </g>
          <rect x={200} y={2622} width={680} height={36} fill={C.steel} filter="url(#wcFine)" />
          <g>
            {drops.map(([a, b], i) => {
              const u = (b + t * 0.28) % 1;
              return <circle key={i} cx={215 + a * 650} cy={2160 + u * 470} r={6} fill="#5E9CC0" opacity={0.9 * Math.sin(u * Math.PI)} />;
            })}
          </g>
        </TankBox>
        <PipeRun pts={[[880, 2640], [980, 2640], [980, 2790], [540, 2790], [540, 2880]]} w={30} flow="#EAF6FB" t={t} />
        {/* chlorine: injected, colourless */}
        <g filter="url(#wcSoft)">
          <rect x={690} y={2680} width={110} height={70} rx={10} fill="#F2F0EA" stroke={C.graphite} strokeWidth={2} />
        </g>
        <line x1={745} y1={2750} x2={745} y2={2775} stroke={C.graphite} strokeWidth={6} />
        {Array.from({ length: 3 }, (_, k) => {
          const u = (t * 2 + k / 3) % 1;
          return <circle key={k} cx={745} cy={2776 + u * 12} r={5} fill="none" stroke="#7F98A6" strokeWidth={2} opacity={1 - u} />;
        })}
        {/* 5 covered reservoir (clear well) */}
        <TankBox x={100} y={2900} w={880} h={460}>
          <rect x={100} y={2970} width={880} height={390} fill={CLEAR} opacity={0.85} filter="url(#wcSoft)" />
          <path d={`M100,2970 ${Array.from({ length: 11 }, () => `q40,-6 80,0`).join(" ")}`} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.8} transform={`translate(${Math.sin(t * 0.8) * 8} 0)`} />
        </TankBox>
        <rect x={70} y={2872} width={940} height={34} fill="#A9A092" filter="url(#wcSoft)" />
        <PipeRun pts={[[990, 3300], [1500, 3300]]} w={36} flow="#EAF6FB" t={t} />
      </g>
      {/* HUD labels, one per process step */}
      <Tag t={t} at={wt("instalasi") - 0.1} until={wt("digumpalkan") - 0.2} x={540} y={300} text="Instalasi Pengolahan Air" sub="air sungai masuk, air bersih keluar" />
      <Tag t={t} at={wt("digumpalkan") - 0.05} until={wt("diaduk") - 0.15} x={540} y={300} text="1 · Koagulasi" sub="koagulan cair, lumpur menggumpal" />
      <Tag t={t} at={wt("diaduk") + 0.15} until={wt("diendapkan") - 0.15} x={540} y={300} text="2 · Flokulasi" sub="diaduk pelan, flok membesar" />
      <Tag t={t} at={wt("diendapkan") + 0.15} until={wt("disaring") - 0.15} x={540} y={300} text="3 · Sedimentasi" sub="flok mengendap, air jernih melimpah" />
      <Tag t={t} at={wt("disaring") + 0.15} until={wt("lalu") + 0.3} x={540} y={300} text="4 · Filter pasir" sub="air turun lewat pasir" />
      <Tag t={t} at={wt("diberi") - 0.1} x={540} y={300} text="5 · Klor → reservoir" sub="klor tidak berwarna" accent={C.clear} />
    </g>
  );
};
