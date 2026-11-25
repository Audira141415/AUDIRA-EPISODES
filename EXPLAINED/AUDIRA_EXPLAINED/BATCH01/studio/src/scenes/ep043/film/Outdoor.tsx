// Outdoor worlds: the two suspects (konteks), the river intake, the overloaded plant, the valve.
import React from "react";
import { C, mulberry32, ribbon, spline, P } from "../Cover.tsx";
import { BROWN, CLEAR, PipeRun, SedTank, TankBox } from "./Plant.tsx";
import { Dial, Tag } from "./ui.tsx";
import { Key, SEC, camAt, clamp01, cs, layerT, lerp, proj, ramp, shake, wt } from "./util.ts";

const Sky: React.FC<{ y1: number; tint?: string }> = ({ y1, tint }) => (
  <g>
    <rect x={-600} y={-600} width={2300} height={y1 + 600} fill="url(#skyG)" filter="url(#wcBig)" />
    {tint && <rect x={-600} y={-600} width={2300} height={y1 + 600} fill={tint} opacity={0.35} filter="url(#wcBig)" />}
  </g>
);

const House: React.FC<{ x: number; y: number; s: number; roof?: string; lit?: boolean }> = ({ x, y, s, roof = C.roof, lit }) => (
  <g filter="url(#wcSoft)">
    <rect x={x - s / 2} y={y - s * 0.62} width={s} height={s * 0.62} fill="#F2E5CC" />
    <path d={`M${x - s * 0.64},${y - s * 0.56} L${x},${y - s * 1.02} L${x + s * 0.64},${y - s * 0.56} Z`} fill={roof} />
    <rect x={x - s * 0.3} y={y - s * 0.44} width={s * 0.22} height={s * 0.2} fill={lit ? C.ochre : "#9DB5BF"} />
    <rect x={x + s * 0.08} y={y - s * 0.38} width={s * 0.18} height={s * 0.38} fill={C.umber} />
  </g>
);

const Ripples: React.FC<{ pts: P[]; t: number; speed?: number; color?: string; n?: number; seed?: number }> = ({ pts, t, speed = 1, color = C.riverLight, n = 12, seed = 1 }) => {
  const r = mulberry32(seed);
  const items = Array.from({ length: n }, () => [r(), r()] as const);
  return (
    <g filter="url(#pencil)" stroke={color} strokeWidth={3.5} strokeLinecap="round" fill="none" opacity={0.9}>
      {items.map(([a, b], i) => {
        const u = (a + t * 0.05 * speed) % 1;
        const p = pts[Math.floor(u * (pts.length - 1))];
        const w = 14 + u * 40;
        return <path key={i} d={`M${p[0] - w + (b - 0.5) * w * 2},${p[1] + (b - 0.5) * 30 * (0.4 + u)} q${w * 0.25},-7 ${w * 0.5},0 q${w * 0.25},7 ${w * 0.5},0`} />;
      })}
    </g>
  );
};

// ------------------------------------------------------------------------------------------
const K_RIVER = spline([
  [-120, 560],
  [200, 600],
  [520, 650],
  [820, 690],
  [1200, 740],
]);

export const Konteks: React.FC<{ t: number }> = ({ t }) => {
  const keys: Key[] = [
    [SEC.KONTEKS[0] - 0.25, 540, 700, 1.12],
    [wt("sungai") - 0.2, 470, 640, 1.32],
    [wt("hulu") + 0.35, 450, 660, 1.36],
    [wt("pipa") - 0.35, 560, 920, 1.05],
    [wt("jalanmu") + 0.15, 600, 1230, 1.36],
    [SEC.MEKANISME[0] + 0.1, 610, 1250, 1.42],
  ];
  const cam = camAt(keys, t);
  const riverPt = proj(cam, 200, 600, 0.85);
  const pipePt = proj(cam, 520, 1290, 1);
  return (
    <g>
      <g transform={layerT(cam, 0.55)}>
        <Sky y1={760} />
        <path d="M-300,520 C0,440 260,480 480,450 C700,420 900,470 1400,430 L1400,800 L-300,800 Z" fill={C.hillFar} opacity={0.8} filter="url(#wcBig)" />
      </g>
      <g transform={layerT(cam, 0.82)}>
        <path d="M-300,600 C100,560 380,600 640,580 C900,560 1100,600 1400,580 L1400,1100 L-300,1100 Z" fill={C.hillMid} opacity={0.85} filter="url(#wc)" />
        <path d={ribbon(K_RIVER, 40, 200)} fill={BROWN} opacity={0.95} filter="url(#wc)" />
        <Ripples pts={K_RIVER} t={t} seed={7} />
        <path d="M-300,770 C200,740 600,770 1400,750 L1400,1100 L-300,1100 Z" fill={C.field} opacity={0.92} filter="url(#wc)" />
        {[120, 300, 470, 640].map((x, i) => (
          <House key={i} x={x} y={930} s={110 + (i % 2) * 20} roof={i % 2 ? C.roof : "#B5573E"} />
        ))}
        <House x={900} y={935} s={150} lit />
      </g>
      <g transform={layerT(cam, 1)}>
        {/* road */}
        <rect x={-400} y={930} width={1900} height={90} fill="#8E8A86" filter="url(#wcSoft)" />
        <g stroke="#F4EEE2" strokeWidth={6} strokeDasharray="40 36" opacity={0.85}>
          <line x1={-400} y1={975} x2={1500} y2={975} />
        </g>
        {/* soil cutaway under the road */}
        <rect x={-400} y={1016} width={1900} height={1000} fill="#C9A27A" filter="url(#wcBig)" />
        <path d="M-400,1180 C0,1160 400,1200 800,1170 C1100,1150 1300,1190 1500,1170 L1500,2100 L-400,2100 Z" fill="#B08860" opacity={0.8} filter="url(#wc)" />
        <path d="M-400,1500 C0,1480 500,1520 900,1490 C1200,1470 1400,1500 1500,1490 L1500,2100 L-400,2100 Z" fill="#9A7350" opacity={0.75} filter="url(#wc)" />
        <path d="M-400,1016 L1500,1016" stroke="#FCF8EF" strokeWidth={14} filter="url(#tear)" />
        <PipeRun pts={[[-400, 1290], [900, 1290], [900, 940]]} w={56} flow="#D6B48C" t={t} />
      </g>
      <Tag t={t} at={wt("dua") - 0.05} until={wt("sungai") - 0.1} x={540} y={300} text="2 tersangka" />
      <Tag t={t} at={wt("sungai")} until={wt("pipa") - 0.15} x={600} y={300} text="1 · Sungai di hulu" anchor={riverPt} />
      <Tag t={t} at={wt("pipa")} x={560} y={300} text="2 · Pipa di bawah jalan" anchor={pipePt} accent={C.steel} />
    </g>
  );
};

// ------------------------------------------------------------------------------------------

export const Intake: React.FC<{ t: number }> = ({ t }) => {
  const keys: Key[] = [
    [SEC.MEKANISME[0] - 0.1, 380, 1060, 1.4],
    [wt("berawal") - 0.2, 520, 980, 1.22],
    [cs("l06") - 0.05, 760, 860, 1.1],
  ];
  const cam = camAt(keys, t);
  const screen = proj(cam, 300, 1160, 1);
  const r = mulberry32(808);
  const motes = Array.from({ length: 30 }, () => [r(), r()] as const);
  const SURF = 820;
  return (
    <g>
      <g transform={layerT(cam, 0.6)}>
        <Sky y1={700} />
        <path d="M-400,640 C0,590 400,620 800,590 C1100,570 1300,600 1600,590 L1600,840 L-400,840 Z" fill={C.hillMid} opacity={0.9} filter="url(#wc)" />
        {[0, 160, 330, 520, 760, 980].map((x, i) => (
          <ellipse key={i} cx={x} cy={640} rx={60} ry={70} fill={i % 2 ? C.pine : C.sage} filter="url(#wcSoft)" />
        ))}
      </g>
      <g transform={layerT(cam, 1)}>
        {/* far bank strip */}
        <rect x={-500} y={760} width={2200} height={70} fill={C.field} filter="url(#wcSoft)" />
        {/* river in section: sheen at the surface, murky depth below */}
        <defs>
          <linearGradient id="riverDepth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#DDBE96" />
            <stop offset="0.5" stopColor="#C49A6C" />
            <stop offset="1" stopColor="#9C6E46" />
          </linearGradient>
        </defs>
        <rect x={-500} y={SURF} width={2200} height={700} fill="url(#riverDepth)" filter="url(#wcFlat)" />
        <g fill="#FFFFFF" opacity={0.35} filter="url(#wcSoft)">
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-500 + ((t * 60 + i * 700) % 2200)} y={SURF + 40 + i * 70} width={420} height={14} rx={7} />
          ))}
        </g>
        <rect x={-500} y={SURF - 6} width={2200} height={26} fill="#C9D9DF" opacity={0.85} filter="url(#wcSoft)" />
        <path d={`M-500,${SURF} ${Array.from({ length: 30 }, () => "q40,-10 80,0").join(" ")}`} stroke="#FFFFFF" strokeWidth={4} fill="none" opacity={0.85} transform={`translate(${-((t * 40) % 80)} 0)`} />
        <g stroke="#D9BC96" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.75} filter="url(#pencil)">
          {Array.from({ length: 16 }, (_, i) => {
            const u = ((i * 0.37 + t * 0.15) % 1) * 2200 - 500;
            const y = SURF + 50 + ((i * 53) % 520);
            return <path key={i} d={`M${u},${y} q30,-8 60,0 q30,8 60,0`} />;
          })}
        </g>
        <g filter="url(#wcFine)">
          {motes.map(([a, b], i) => {
            const u = (a + t * 0.12) % 1;
            const x = lerp(-300, 300, u);
            const y = SURF + 80 + b * 420;
            return <circle key={i} cx={x} cy={lerp(y, 1160, clamp01((x - 120) / 180))} r={4 + b * 5} fill="#DCC3A0" opacity={0.85} />;
          })}
        </g>
        {/* near bank rising on the right, above water */}
        <path d="M560,1600 C640,1300 720,1000 860,790 L1800,790 L1800,1700 L560,1700 Z" fill="#6E5236" filter="url(#wc)" />
        <path d="M600,1600 C680,1300 760,1000 880,830" stroke="#4A3424" strokeWidth={10} fill="none" opacity={0.6} filter="url(#wcFine)" />
        <g filter="url(#wcFine)">
          {Array.from({ length: 30 }, (_, i) => (
            <ellipse key={i} cx={900 + mulberry32(10 + i)() * 800} cy={860 + mulberry32(60 + i)() * 780} rx={10 + (i % 3) * 6} ry={7 + (i % 2) * 4} fill={i % 2 ? "#8C6A48" : "#C9B08C"} />
          ))}
        </g>
        <path d="M860,790 L1800,790 L1800,830 L840,830 Z" fill={C.field} filter="url(#wcSoft)" />
        <rect x={-500} y={1500} width={2300} height={500} fill="#4F3A26" filter="url(#wc)" />
        {/* intake: suction pipe with coarse bar screen under water, rising to the pump house */}
        <PipeRun pts={[[310, 1160], [600, 1160], [820, 900], [960, 760]]} w={44} flow="#D6B48C" t={t} />
        <g filter="url(#wcFine)">
          <rect x={220} y={1100} width={96} height={120} rx={8} fill="#6F8796" opacity={0.5} />
          {Array.from({ length: 7 }, (_, i) => (
            <line key={i} x1={226 + i * 14} y1={1102} x2={226 + i * 14} y2={1218} stroke={C.graphite} strokeWidth={5} />
          ))}
          <rect x={220} y={1100} width={96} height={120} rx={8} fill="none" stroke={C.graphite} strokeWidth={3} />
        </g>
        {/* pump house (generic, no marks) */}
        <g filter="url(#paperShadow)">
          <g filter="url(#wcSoft)">
            <rect x={930} y={580} width={280} height={210} fill="#EFE3CC" />
            <path d="M910,586 L1070,490 L1230,586 Z" fill={C.umber} />
            <rect x={1060} y={650} width={60} height={60} fill="#9DB5BF" />
            <rect x={1140} y={670} width={50} height={120} fill={C.woodDark} />
          </g>
        </g>
      </g>
      <Tag t={t} at={wt("berawal") - 0.2} x={560} y={300} text="air baku dari sungai" />
      <Tag t={t} at={wt("sungai", 1)} x={480} y={440} size={36} text="pipa hisap + saringan kasar" anchor={screen} accent={C.steel} />
    </g>
  );
};

// ------------------------------------------------------------------------------------------
export const Surge: React.FC<{ t: number }> = ({ t }) => {
  const kew = wt("kewalahan");
  const keys: Key[] = [
    [cs("l07") - 0.1, 540, 640, 1.12],
    [wt("ribuan"), 540, 700, 1.24],
    [wt("instalasi", 1) - 0.05, 540, 720, 1.24],
    [kew - 0.05, 540, 1560, 1.12],
    [wt("sebagian"), 560, 1580, 1.18],
  ];
  const c0 = camAt(keys, t);
  const [sx, sy] = shake(t, kew, 0.6, 12);
  const cam = { ...c0, x: c0.x + sx, y: c0.y + sy };
  const r = mulberry32(4242);
  const debris = Array.from({ length: 10 }, () => [r(), r(), r()] as const);
  const needle = lerp(0.12, 0.97, ramp(t, wt("sampai") - 0.1, wt("ntu") + 0.35)) + Math.sin(t * 9) * 0.01;
  const dialIn = ramp(t, wt("sangat") - 0.2, wt("sangat") + 0.2) * (1 - ramp(t, wt("instalasi", 1) - 0.3, wt("instalasi", 1)));
  const weir = proj(cam, 1020, 1300, 1);
  return (
    <g>
      <g transform={layerT(cam, 0.6)}>
        <Sky y1={430} tint="#9A9488" />
      </g>
      <g transform={layerT(cam, 1)}>
        <rect x={-500} y={360} width={2200} height={660} fill="#7E5232" filter="url(#wc)" />
        <rect x={-500} y={360} width={2200} height={120} fill="#946240" opacity={0.8} filter="url(#wcSoft)" />
        <Ripples pts={spline([[-200, 420], [500, 520], [1300, 640]])} t={t} speed={4} n={22} seed={9} color="#C9A47A" />
        <Ripples pts={spline([[-200, 700], [500, 800], [1300, 900]])} t={t} speed={5} n={18} seed={11} color="#B08155" />
        <g filter="url(#wcFine)">
          {debris.map(([a, b, c], i) => {
            const u = (a + t * 0.18) % 1;
            const x = lerp(-150, 1250, u);
            const y = 430 + b * 520 + Math.sin(t * 2 + i) * 8;
            return c > 0.5 ? (
              <rect key={i} x={x} y={y} width={70} height={9} rx={4} fill={C.umber} transform={`rotate(${c * 40 - 20} ${x} ${y})`} />
            ) : (
              <ellipse key={i} cx={x} cy={y} rx={16} ry={8} fill={C.sage} />
            );
          })}
        </g>
        <path d="M-500,1000 C200,980 700,1010 1700,990 L1700,1150 L-500,1150 Z" fill="#9C7A55" filter="url(#wc)" />
        <PipeRun pts={[[260, 980], [260, 1260], [90, 1260], [90, 1340]]} w={36} flow="#C9A47A" t={t} />
        <SedTank x={80} y={1300} w={920} h={540} t={t} over={1} />
        {t > kew && (
          <g filter="url(#wcFine)" opacity={ramp(t, kew, kew + 0.4)}>
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={`M${120 + i * 230},1352 q20,-40 50,-10`} stroke={BROWN} strokeWidth={12} fill="none" strokeLinecap="round" transform={`translate(0 ${-Math.abs(Math.sin(t * 6 + i)) * 10})`} />
            ))}
          </g>
        )}
      </g>
      {dialIn > 0 && (
        <g opacity={dialIn} transform={`translate(0 ${(1 - dialIn) * -40})`}>
          <Dial x={540} y={560} r={230} value={needle} labels={["1", "10", "100", "1.000+"]} title="kekeruhan (NTU)" />
        </g>
      )}
      <Tag t={t} at={wt("ribuan")} until={wt("instalasi", 1) - 0.2} x={810} y={720} size={40} text="ribuan NTU" accent={C.river} />
      <Tag t={t} at={kew} x={540} y={300} text="instalasi kewalahan" anchor={weir} accent={C.chili} />
    </g>
  );
};

// ------------------------------------------------------------------------------------------
export const Valve: React.FC<{ t: number }> = ({ t }) => {
  const keys: Key[] = [
    [cs("l08") - 0.1, 470, 930, 1.28],
    [wt("mengurangi") - 0.2, 560, 880, 1.16],
    [wt("mengalirkan") - 0.2, 600, 950, 1.06],
    [SEC.REVEAL[0], 650, 990, 1.0],
  ];
  const cam = camAt(keys, t);
  const close = ramp(t, wt("memilih") - 0.1, wt("produksi") + 0.6);
  const flowW = lerp(64, 16, close);
  const prod = lerp(0.9, 0.42, close);
  const tank = proj(cam, 200, 820, 1);
  return (
    <g>
      <g transform={layerT(cam, 0.6)}>
        <rect x={-600} y={-600} width={2300} height={3200} fill="#E9DCC2" filter="url(#wcFlat)" />
        <g filter="url(#wcBig)" opacity={0.3}>
          <circle cx={900} cy={420} r={260} fill={C.ochre} />
          <circle cx={120} cy={1500} r={300} fill={C.sage} />
        </g>
      </g>
      <g transform={layerT(cam, 1)}>
        {/* tank holding back brown water */}
        <TankBox x={-80} y={620} w={340} h={560}>
          <rect x={-80} y={lerp(700, 660, close)} width={340} height={560} fill={BROWN} opacity={0.92} filter="url(#wcSoft)" />
        </TankBox>
        <PipeRun pts={[[260, 1060], [940, 1060]]} w={92} />
        {/* gate valve body */}
        <g filter="url(#wcSoft)">
          <rect x={500} y={980} width={130} height={160} rx={18} fill={C.chromeDark} stroke={C.graphite} strokeWidth={3} />
          <rect x={548} y={760} width={34} height={230} fill={C.chrome} stroke={C.graphite} strokeWidth={2} />
        </g>
        {/* outflow (treated water, now thinner) */}
        <path d={`M944,1060 C990,1062 1010,1100 1012,1180 L1012,1420`} stroke={CLEAR} strokeWidth={flowW} fill="none" filter="url(#wcSoft)" strokeLinecap="round" />
        <path d={`M944,1060 C990,1062 1010,1100 1012,1180 L1012,1420`} stroke="#FFFFFF" strokeWidth={flowW * 0.25} fill="none" strokeDasharray="20 24" strokeDashoffset={-t * 120} opacity={0.8} />
        <rect x={700} y={1400} width={700} height={120} fill="#BDB3A3" filter="url(#wcSoft)" />
        <rect x={720} y={1410} width={680} height={60} fill={CLEAR} opacity={0.8} filter="url(#wcSoft)" />
      </g>
      {/* handwheel in the foreground, turning shut */}
      <g transform={layerT(cam, 1.12)}>
        <g transform={`rotate(${-close * 540 + Math.sin(t * 3) * 2} 565 760)`} filter="url(#wcSoft)">
          <circle cx={565} cy={760} r={190} fill="none" stroke={C.graphite} strokeWidth={46} />
          <circle cx={565} cy={760} r={190} fill="none" stroke={C.chili} strokeWidth={36} />
          {[0, 60, 120].map((d) => (
            <line key={d} x1={565} y1={570} x2={565} y2={950} stroke={C.graphite} strokeWidth={18} transform={`rotate(${d} 565 760)`} />
          ))}
          <circle cx={565} cy={760} r={40} fill={C.chromeDark} stroke={C.graphite} strokeWidth={3} />
          <circle cx={565 - 120} cy={760 - 130} r={14} fill="#F4F8FA" opacity={0.8} />
        </g>
      </g>
      {/* production meter */}
      <g transform="translate(930 560)" opacity={ramp(t, wt("mengurangi") - 0.3, wt("mengurangi"))}>
        <rect x={-40} y={-200} width={80} height={400} rx={14} fill="#FBF5EA" stroke={C.graphite} strokeWidth={3} filter="url(#wcFine)" />
        <rect x={-26} y={186 - 372 * prod} width={52} height={372 * prod} rx={8} fill={C.sage} filter="url(#wcFine)" />
        <text x={0} y={250} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontWeight={700} fontSize={34} fill="#2C2723">
          produksi
        </text>
        <path d={`M-70,${-60 + close * 80} l0,60 m-14,-16 l14,16 l14,-16`} stroke={C.chili} strokeWidth={7} fill="none" strokeLinecap="round" opacity={close} />
      </g>
      <Tag t={t} at={wt("sebagian") - 0.05} until={wt("mengalirkan") - 0.15} x={430} y={300} text="sebagian PDAM memilih…" />
      <Tag t={t} at={wt("mengalirkan")} x={430} y={300} text="air keruh tidak dialirkan" anchor={tank} accent={C.river} />
    </g>
  );
};
