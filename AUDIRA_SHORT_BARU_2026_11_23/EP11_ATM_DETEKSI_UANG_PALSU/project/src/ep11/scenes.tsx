// EP11 scenes — INNERWORKS 2D cutaway. Each scene gets film time t and local time lt (seconds).
import React from "react";
import { K, Defs, Studio, Machine, Bill, RollerTop, RollerEnd, Gear, IndoMap, Tag, Cam, hash, clamp01, ease, expo, ramp, lerp, pop } from "./pieces";
import type { SceneId } from "./timing";

type SP = { t: number; lt: number };

const Svg: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <Defs />
    <pattern id="ep11grid" width={40} height={40} patternUnits="userSpaceOnUse">
      <path d="M40,0 L0,0 L0,40" fill="none" stroke="#1d2b33" strokeWidth={1} opacity={0.07} />
      <circle cx={0} cy={0} r={2.2} fill="#1d2b33" opacity={0.12} />
    </pattern>
    {bg ? <rect x={0} y={0} width={1080} height={1920} fill={bg} /> : null}
    {bg ? <rect x={0} y={0} width={1080} height={1920} fill="url(#ep11grid)" opacity={bg === "#151a2c" ? 0 : 1} /> : null}
    {children}
    <rect x={0} y={0} width={1080} height={1920} fill="url(#keyShade)" />
    <rect x={0} y={0} width={1080} height={1920} fill="url(#vignette)" />
  </svg>
);

const fadeIn = (lt: number, a: number, d = 0.45) => ease((lt - a) / d);
const fadeOut = (lt: number, a: number, d = 0.45) => 1 - ease((lt - a) / d);

// ---------------- S1 Hook: machine + two notes ----------------
const S1: React.FC<SP> = ({ t, lt }) => {
  const k = ease(lt / 7.8);
  const s = lerp(0.92, 1.2, k);
  const cy = lerp(1000, 820, k);
  const enter = expo(lt / 1.1);
  const fly = ease(ramp(lt, 2.9, 3.9));
  const notes = [
    { kind: "fake" as const, hx: 205, hy: 700, sx: -360, rot: -9, tx: -40 },
    { kind: "real" as const, hx: 875, hy: 780, sx: 1440, rot: 8, tx: 40 },
  ];
  const eye = fadeIn(lt, 5.5, 0.5);
  return (
    <Svg>
      <Cam s={s} x={540} y={cy}>
        <Studio floorY={1360} />
        <g transform="translate(540,1360)">
          <Machine t={t} slotGlow={ramp(lt, 3.5, 3.9) * (1 - ramp(lt, 5.2, 5.6)) + eye * (0.5 + 0.5 * Math.sin(t * 9))} screen={lt > 5.4 ? "MEMERIKSA…" : "MASUKKAN UANG"} />
        </g>
        {notes.map((n, i) => {
          const x = lerp(lerp(n.sx, n.hx, enter), 540, fly);
          const y = lerp(n.hy + Math.sin(t * 2.2 + i) * 14, 975, fly);
          const sc = lerp(0.5, 0.22, fly);
          const op = 1 - ramp(lt, 3.6, 3.95);
          return (
            <g key={i} opacity={op} transform={`translate(${x},${y}) rotate(${lerp(n.rot, 0, fly)}) scale(${sc})`}>
              <Bill kind={n.kind} />
              <g transform={`translate(${n.tx * 2},-230) scale(1.6)`}><Tag x={0} y={0} text="ASLI?" k={pop(lt, 1.0 + i * 0.35)} color={K.ink} size={44} /></g>
            </g>
          );
        })}
        {/* the machine's "eye": scanning lens over the screen */}
        <g transform="translate(540,640)" opacity={eye}>
          {[150, 112, 76].map((r, i) => (
            <circle key={i} r={r * (0.9 + 0.1 * eye)} fill="none" stroke={K.cyan} strokeWidth={6 - i} strokeDasharray={i === 0 ? "30 16" : undefined} transform={`rotate(${t * (40 + i * 30) * (i % 2 ? -1 : 1)})`} />
          ))}
          <circle r={40} fill={K.ink} stroke={K.cyan} strokeWidth={4} />
          <circle r={14} fill={K.cyan} transform={`translate(${Math.sin(t * 3) * 12},0)`} />
          <rect x={-170} y={-4 + Math.sin(t * 4) * 120} width={340} height={8} fill={K.cyan} opacity={0.6} />
        </g>
      </Cam>
    </Svg>
  );
};

// ---------------- S2 Cutaway: casing lifts, validator module with 5 stations ----------------
const STATIONS = [
  { x: 210, label: "UV", c: K.uv },
  { x: 370, label: "MAGNET", c: K.mag },
  { x: 530, label: "IR", c: K.ir },
  { x: 690, label: "TEBAL", c: K.brass },
  { x: 850, label: "KAMERA", c: K.cyan },
];
const Validator: React.FC<{ t: number; lt: number; labels: number }> = ({ t, lt, labels }) => (
  <g>
    <rect x={70} y={630} width={960} height={660} rx={44} fill="rgba(29,43,51,.25)" filter="url(#soft)" />
    <rect x={60} y={620} width={960} height={660} rx={40} fill={K.mintLt} stroke={K.steel} strokeWidth={8} />
    <rect x={60} y={620} width={960} height={660} rx={40} fill="url(#brush)" />
    <rect x={60} y={620} width={960} height={660} rx={40} fill="url(#panelShade)" />
    <rect x={40} y={600} width={1000} height={700} rx={52} fill="none" stroke={K.cyan} strokeWidth={4} strokeDasharray="20 12" />
    <rect x={80} y={880} width={920} height={160} fill="#f8fbfa" />
    <clipPath id="pathclip"><rect x={80} y={880} width={920} height={160} /></clipPath>
    <g clipPath="url(#pathclip)">
      {[0, 1, 2].map((i) => {
        const x = ((lt * 300 + i * 420) % 1260) - 180;
        const edge = clamp01(Math.min(x - 150, 930 - x) / 120);
        return <g key={i} opacity={edge} transform={`translate(${x},960) scale(0.4)`}><Bill kind={i === 1 ? "fake" : "real"} /></g>;
      })}
    </g>
    {[130, 290, 450, 610, 770, 930].map((x, i) => <RollerTop key={x} x={x} y={960} w={36} h={250} phase={lt * 160} kind={i % 2 ? "steel" : "brass"} />)}
    {STATIONS.map((s, i) => (
      <g key={s.label}>
        <polygon points={`${s.x - 30},770 ${s.x + 30},770 ${s.x + 70},1040 ${s.x - 70},1040`} fill={s.c} opacity={0.16 + 0.08 * Math.sin(t * 6 + i)} />
        <rect x={s.x - 55} y={690} width={110} height={86} rx={16} fill={K.ink} />
        <rect x={s.x - 55} y={690} width={110} height={10} rx={5} fill="#fff" opacity={0.25} />
        <circle cx={s.x} cy={744} r={20} fill={s.c} />
        <circle cx={s.x - 6} cy={738} r={6} fill="#fff" opacity={0.7} />
        <Tag x={s.x} y={i % 2 ? 1215 : 1135} text={s.label} k={pop(labels, i * 0.42)} color={K.ink} size={30} />
      </g>
    ))}
    <Gear x={130} y={700} r={44} a={t * 80} />
    <Gear x={190} y={665} r={26} a={-t * 135} teeth={9} />
    <text x={540} y={1345} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={38} letterSpacing={4} fill={K.cyanTx}>VALIDATOR · AUDIRA</text>
  </g>
);
const S2: React.FC<SP> = ({ t, lt }) => {
  const open = ease(ramp(lt, 0.2, 1.4));
  const pushA = ease(ramp(lt, 0, 2.0));
  const b = fadeIn(lt, 1.6, 0.7);
  const sb = lerp(0.68, 0.92, expo(ramp(lt, 1.6, 2.6))) + 0.04 * ramp(lt, 2.6, 6.7);
  return (
    <Svg>
      <g opacity={1 - b}>
        <Cam s={lerp(1.0, 1.55, pushA)} x={540} y={lerp(860, 820, pushA)}>
          <Studio floorY={1360} />
          <g transform="translate(540,1360)"><Machine t={t} open={open} /></g>
        </Cam>
      </g>
      <g opacity={b}>
        <rect width={1080} height={1920} fill={K.paper} />
        <Cam s={sb} x={lerp(552, 532, ramp(lt, 2, 6.7))} y={980}>
          <Studio floorY={1500} />
          <Validator t={t} lt={lt} labels={lt - 4.15} />
        </Cam>
      </g>
    </Svg>
  );
};

// ---------------- S3 UV chamber ----------------
const S3: React.FC<SP> = ({ t, lt }) => {
  const flick = lt < 1.25 ? 0 : lt < 1.65 ? (hash(Math.floor(lt * 30)) > 0.4 ? 1 : 0.2) : 1;
  const fakeIn = expo(ramp(lt, 3.0, 3.9));
  const realIn = expo(ramp(lt, 7.1, 8.0));
  const fakeUv = flick * ease(ramp(lt, 5.8, 6.5));
  const toReal = ease(ramp(lt, 10.0, 11.2));
  const map = ease(ramp(lt, 12.6, 13.5));
  const s = lerp(lerp(1, 1.05, lt / 10), 1.5, toReal);
  const cy = lerp(1000, 1150, toReal);
  return (
    <Svg bg="#151a2c">
      <Cam s={s} x={lerp(540 - 3 * lt, 540, toReal)} y={cy}>
        <rect x={-400} y={-400} width={1880} height={2720} fill="#151a2c" />
        <rect x={-400} y={-400} width={1880} height={2720} fill="#211a44" opacity={0.8} />
        <ellipse cx={540} cy={560} rx={620} ry={260} fill={K.uv} opacity={0.45 * flick} filter="url(#glow)" />
        <polygon points="160,580 920,580 1180,1500 -100,1500" fill={K.uv} opacity={0.13 * flick} />
        {/* lamp housing + tube */}
        <rect x={110} y={470} width={860} height={130} rx={30} fill={K.steel} />
        <rect x={110} y={470} width={860} height={130} rx={30} fill="url(#steelH)" opacity={0.6} />
        <rect x={140} y={545} width={800} height={42} rx={21} fill={flick > 0.5 ? "#d8ccff" : "#5b5470"} />
        <rect x={140} y={545} width={800} height={42} rx={21} fill="#b8a4ff" opacity={flick} filter="url(#soft4)" />
        <text x={540} y={525} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={30} letterSpacing={6} fill={K.ink} opacity={1 - toReal}>LAMPU ULTRAVIOLET</text>
        {/* fake (HVS) note */}
        <g transform={`translate(${lerp(-420, 540, fakeIn)},820)`} opacity={1 - toReal}>
          <Bill kind="fake" uv={fakeUv} />
          <Tag x={0} y={-190} text="KERTAS HVS" k={pop(lt, 4.0)} color="#1f5fbf" size={38} />
        </g>
        {/* real (cotton) note */}
        <g transform={`translate(${lerp(1500, 540, realIn)},1150)`}>
          <Bill kind="real" uv={flick * realIn} map={map} />
          <g opacity={1 - toReal}><Tag x={0} y={190} text="UANG ASLI · KAPAS" k={pop(lt, 8.1)} color={K.ink} size={38} /></g>
          {map > 0 ? Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2 + t * 0.6;
            const r = 210 + 30 * Math.sin(t * 3 + i);
            const tw = 0.5 + 0.5 * Math.sin(t * 8 + i * 2);
            return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.45} r={5 + 4 * tw} fill="#dcff63" opacity={map * tw} />;
          }) : null}
        </g>
      </Cam>
    </Svg>
  );
};

// ---------------- S4 Magnetic head + IR split ----------------
const S4: React.FC<SP> = ({ t, lt }) => {
  const a = fadeOut(lt, 4.0, 0.5);
  const b = fadeIn(lt, 4.2, 0.5);
  const billX = lerp(260, 820, lt / 4.6);
  const wipe = expo(ramp(lt, 5.2, 6.2));
  const hide = ease(ramp(lt, 8.85, 9.5));
  const trace = clamp01((lt - 1.2) / 2.6);
  const pts: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const x = 140 + i * 10;
    if (i / 80 > trace) break;
    const spike = hash(i * 3.1) > 0.55 ? (hash(i * 7.7) - 0.5) * 120 : (hash(i) - 0.5) * 18;
    pts.push(`${x},${1250 + spike * (0.6 + 0.4 * Math.sin(t * 5 + i))}`);
  }
  return (
    <Svg bg={K.paper}>
      <g opacity={a}>
        <Cam s={lerp(1.08, 1.0, lt / 4.6)} x={lerp(520, 560, lt / 4.6)} y={960}>
          <Studio floorY={2000} />
          <rect x={80} y={560} width={920} height={840} rx={40} fill="#0d1a20" opacity={0.22} filter="url(#soft)" transform="translate(14,22)" />
          <rect x={80} y={560} width={920} height={840} rx={40} fill={K.mintLt} stroke={K.cyan} strokeWidth={4} strokeDasharray="20 12" />
          <rect x={80} y={560} width={920} height={840} rx={40} fill="url(#panelShade)" />
          <g transform={`translate(${billX},1000)`}><Bill kind="real" w={620} h={290} /></g>
          {/* field lines */}
          {[0, 1, 2, 3].map((i) => (
            <ellipse key={i} cx={540} cy={880} rx={90 + i * 46} ry={40 + i * 22} fill="none" stroke={K.mag} strokeWidth={4} opacity={0.7 - i * 0.14} strokeDasharray="14 10" strokeDashoffset={-t * 60 * (i % 2 ? 1 : -1)} />
          ))}
          {/* magnetic head */}
          <rect x={410} y={640} width={260} height={210} rx={22} fill="url(#steelV)" stroke={K.steelDk} strokeWidth={3} />
          {Array.from({ length: 7 }, (_, i) => <rect key={i} x={430} y={680 + i * 20} width={220} height={14} rx={7} fill={K.copper} stroke="#8a4a1f" strokeWidth={1.5} />)}
          <path d="M500,850 L580,850 L556,890 L524,890 Z" fill={K.ink} />
          <rect x={536} y={884} width={8} height={10} fill={K.orange} />
          <Tag x={540} y={600} text="KEPALA MAGNETIK" k={pop(lt, 1.4)} color={K.mag} size={34} />
          {/* oscilloscope */}
          <rect x={120} y={1150} width={840} height={200} rx={20} fill={K.ink} />
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={140 + i * 100} y={1165} width={2} height={170} fill={K.cyan} opacity={0.15} />)}
          <rect x={140} y={1249} width={800} height={2} fill={K.cyan} opacity={0.25} />
          {pts.length > 1 ? <polyline points={pts.join(" ")} fill="none" stroke="#7ef0c4" strokeWidth={4} /> : null}
          <text x={940} y={1190} textAnchor="end" fontFamily="Space Grotesk" fontWeight={700} fontSize={38} fill="#7ef0c4">SINYAL TINTA</text>
        </Cam>
      </g>
      <g opacity={b}>
        <Cam s={lerp(1.0, 1.06, ramp(lt, 4.2, 10))} x={540} y={lerp(950, 970, ramp(lt, 4.2, 10))}>
          <Studio floorY={2000} />
          <rect x={60} y={570} width={960} height={350} rx={30} fill="#0d1a20" opacity={0.2} filter="url(#soft)" transform="translate(12,18)" />
          <rect x={60} y={570} width={960} height={350} rx={30} fill="#fdfdfb" stroke={K.steel} strokeWidth={4} />
          <rect x={60} y={570} width={960} height={350} rx={30} fill="url(#panelShade)" />
          <g transform="translate(540,760)"><Bill kind="real" w={560} h={260} /></g>
          <Tag x={540} y={600} text="CAHAYA TAMPAK" color={K.ink} size={36} />
          <clipPath id="irwipe"><rect x={60} y={960} width={960 * wipe} height={350} rx={30} /></clipPath>
          <rect x={60} y={960} width={960} height={350} rx={30} fill="none" stroke={K.steel} strokeWidth={4} strokeDasharray="14 10" />
          <g clipPath="url(#irwipe)">
            <rect x={60} y={960} width={960} height={350} fill="#1a0a0e" />
            <ellipse cx={540} cy={1135} rx={460} ry={170} fill={K.ir} opacity={0.6} filter="url(#glow)" />
            <g transform="translate(540,1150)"><Bill kind="real" w={560} h={260} ir={1} irHide={hide} /></g>
            {hide > 0 ? <rect x={540 + 560 * 0.28 - 90} y={1150 - 140} width={180} height={190} rx={16} fill="none" stroke="#ff8a8a" strokeWidth={4} strokeDasharray="12 8" opacity={hide} /> : null}
          </g>
          <rect x={60 + 960 * wipe - 3} y={960} width={6} height={350} fill={K.cyan} opacity={wipe < 1 ? 1 : 0} />
          <Tag x={540} y={990} text="INFRAMERAH" k={pop(lt, 5.6)} color={K.ir} size={36} />
        </Cam>
      </g>
    </Svg>
  );
};

// ---------------- S5 Thickness rollers + line camera ----------------
const SHEET = 300, GAP = 70, SPEED = 250;
const sheetThick = (i: number) => (i === 3 ? 26 : 8);
const liftAt = (time: number) => {
  // which sheet is under x = 540 at this time; sheet i spans [x0, x0 + SHEET]
  for (let i = 0; i < 8; i++) {
    const x0 = -700 + time * SPEED + i * (SHEET + GAP) - 3 * (SHEET + GAP);
    if (540 >= x0 && 540 <= x0 + SHEET) return sheetThick(i);
  }
  return 0;
};
const S5: React.FC<SP> = ({ t, lt }) => {
  const a = fadeOut(lt, 5.0, 0.5);
  const b = fadeIn(lt, 5.2, 0.5);
  const lift = liftAt(lt);
  const scan = ease(ramp(lt, 5.7, 8.1));
  const ok = pop(lt, 8.6);
  const hist: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const tau = lt - 3 + i * 0.05;
    const v = tau < 0 ? 0 : liftAt(tau);
    hist.push(`${160 + i * 12.6},${1300 - v * 4.6}`);
  }
  const spike = lift > 10;
  return (
    <Svg bg={K.paper}>
      <g opacity={a}>
        <Cam s={lerp(1.0, 1.08, lt / 5.3)} x={540} y={lerp(920, 940, lt / 5.3)}>
          <Studio floorY={2000} />
          <rect x={80} y={440} width={920} height={980} rx={40} fill="#0d1a20" opacity={0.22} filter="url(#soft)" transform="translate(14,22)" />
          <rect x={80} y={440} width={920} height={980} rx={40} fill={K.mintLt} stroke={K.cyan} strokeWidth={4} strokeDasharray="20 12" />
          <rect x={80} y={440} width={920} height={980} rx={40} fill="url(#panelShade)" />
          <clipPath id="s5rail"><rect x={110} y={700} width={860} height={200} /></clipPath>
          <rect x={110} y={812} width={860} height={10} rx={5} fill={K.steel} opacity={0.6} />
          {/* sheets passing through */}
          <g clipPath="url(#s5rail)">{Array.from({ length: 8 }, (_, i) => {
            const x0 = -700 + lt * SPEED + i * (SHEET + GAP) - 3 * (SHEET + GAP);
            const th = sheetThick(i);
            return (
              <g key={i}>
                <rect x={x0} y={790 - th / 2} width={SHEET} height={th} rx={3} fill={i === 3 ? "#f2d3cc" : "#f2d3cc"} stroke="#c45a52" strokeWidth={1.5} />
                {i === 3 ? <rect x={x0 + 90} y={790 - th / 2 - 2} width={110} height={th + 4} rx={3} fill="rgba(255,226,120,.8)" stroke="#b08a2a" strokeWidth={2} /> : null}
              </g>
            );
          })}</g>
          <RollerEnd x={540} y={790 + 4 + 110} r={110} a={-t * 200} kind="steel" />
          {/* spring arm + measuring roller */}
          <rect x={540} y={790 - 120 - lift * 3 - 14} width={300} height={28} rx={14} fill="url(#steelH)" stroke={K.steelDk} strokeWidth={2} transform={`rotate(${-lift * 0.5},540,${790 - 120 - lift * 3})`} />
          <path d={`M820,${560} l-20,20 l40,20 l-40,20 l40,20 l-40,20 l20,20`} fill="none" stroke={K.steelDk} strokeWidth={6} />
          <RollerEnd x={540} y={790 - 4 - 110 - lift * 3} r={110} a={t * 200} kind="brass" />
          {/* dial */}
          <g transform="translate(850,560)">
            <circle r={92} fill="#fff" stroke={K.steel} strokeWidth={8} />
            <path d="M-64,30 A70,70 0 1,1 64,30" fill="none" stroke={K.ok} strokeWidth={10} />
            <path d="M40,58 A70,70 0 0,0 64,30" fill="none" stroke={K.bad} strokeWidth={10} />
            <rect x={-4} y={-66} width={8} height={70} rx={4} fill={spike ? K.bad : K.ink} transform={`rotate(${-110 + lift * 8})`} />
            <circle r={10} fill={K.orange} />
          </g>
          <Tag x={300} y={540} text="ROL KETEBALAN" k={pop(lt, 0.4)} color={K.ink} size={36} />
          {/* graph */}
          <rect x={130} y={1130} width={820} height={220} rx={20} fill={K.ink} />
          <rect x={150} y={1300 - 12 * 4.6} width={780} height={2} fill={K.bad} opacity={0.6} strokeDasharray="6 6" />
          <polyline points={hist.join(" ")} fill="none" stroke={spike ? "#ff6b6b" : "#7ef0c4"} strokeWidth={5} />
          <text x={930} y={1170} textAnchor="end" fontFamily="Space Grotesk" fontWeight={700} fontSize={36} fill="#7ef0c4">TEBAL KERTAS</text>
          {spike ? <rect x={130} y={1130} width={820} height={220} rx={20} fill="none" stroke={K.bad} strokeWidth={6} opacity={0.6 + 0.4 * Math.sin(t * 20)} /> : null}
        </Cam>
      </g>
      <g opacity={b}>
        <Cam s={lerp(0.96, 1.04, ramp(lt, 5.2, 10.1))} x={540} y={940}>
          <Studio floorY={2000} />
          <g transform="translate(540,900)"><Bill kind="real" w={760} h={350} /></g>
          <clipPath id="scanned"><rect x={160} y={720} width={760 * scan} height={360} /></clipPath>
          <g clipPath="url(#scanned)">
            <rect x={160} y={725} width={760} height={350} fill={K.cyan} opacity={0.12} />
            {Array.from({ length: 38 }, (_, i) => <rect key={`v${i}`} x={160 + i * 20} y={725} width={1.5} height={350} fill={K.cyan} opacity={0.4} />)}
            {Array.from({ length: 18 }, (_, i) => <rect key={`h${i}`} x={160} y={725 + i * 20} width={760} height={1.5} fill={K.cyan} opacity={0.4} />)}
          </g>
          {scan > 0 && scan < 1 ? (
            <g>
              <rect x={160 + 760 * scan - 6} y={700} width={12} height={400} fill={K.cyan} />
              <rect x={160 + 760 * scan - 40} y={700} width={80} height={400} fill={K.cyan} opacity={0.25} filter="url(#soft4)" />
            </g>
          ) : null}
          {/* line camera module */}
          <g transform={`translate(${160 + 760 * scan},600)`}>
            <rect x={-80} y={-60} width={160} height={90} rx={16} fill={K.ink} />
            <circle cx={0} cy={-15} r={28} fill="#22414d" stroke={K.cyan} strokeWidth={5} />
            <circle cx={-8} cy={-23} r={8} fill="#fff" opacity={0.6} />
          </g>
          {/* match panel */}
          <g transform="translate(300,1240) scale(0.36)"><Bill kind="real" /></g>
          <g transform="translate(780,1240) scale(0.36)"><Bill kind="real" /></g>
          <text x={300} y={1175} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={34} fill={K.cyanTx}>POLA ASLI</text>
          <text x={780} y={1175} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={34} fill={K.cyanTx}>HASIL PINDAI</text>
          <g transform={`translate(540,1240) scale(${ok})`}>
            <circle r={54} fill={K.ok} />
            <path d="M-24,2 L-6,20 L26,-16" fill="none" stroke="#fff" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </Cam>
      </g>
    </Svg>
  );
};

// ---------------- S6 Verdict: rejected → bank → BI → Mesuji case ----------------
const Building: React.FC<{ x: number; y: number; s: number; color: string; label: string }> = ({ x, y, s, color, label }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={150} rx={170} ry={22} fill="rgba(29,43,51,.22)" filter="url(#soft4)" />
    <polygon points="-150,-60 0,-150 150,-60" fill={color} />
    <rect x={-150} y={-60} width={300} height={20} fill={K.ink} opacity={0.8} />
    {[-110, -55, 0, 55, 110].map((cx) => <rect key={cx} x={cx - 14} y={-40} width={28} height={160} fill="url(#steelV)" />)}
    <rect x={-170} y={120} width={340} height={26} rx={6} fill={K.plinth} stroke={K.steel} strokeWidth={2} />
    <text x={0} y={-82} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={34} fill={K.ink}>{label}</text>
  </g>
);
const S6: React.FC<SP> = ({ t, lt }) => {
  const a = fadeOut(lt, 2.6, 0.45);
  const b = fadeIn(lt, 2.7, 0.45) * fadeOut(lt, 6.2, 0.45);
  const c = fadeIn(lt, 6.3, 0.45);
  const rej = ramp(lt, 1.5, 1.8);
  const eject = expo(ramp(lt, 0.4, 1.6));
  const travel = ease(ramp(lt, 4.2, 5.6));
  const count = Math.round(26 * ease(ramp(lt, 6.8, 7.6)));
  const pin = expo(ramp(lt, 6.4, 7.0));
  return (
    <Svg bg={K.paper}>
      <g opacity={a}>
        <Cam s={lerp(1.18, 1.05, ease(lt / 2.8))} x={540} y={940}>
          <Studio floorY={1400} />
          <g transform="translate(540,1460)"><Machine t={t} reject={rej} screen={rej > 0 ? "DITOLAK" : "MEMERIKSA…"} /></g>
          <g transform={`translate(${lerp(540, 770, eject)},${lerp(1070, 1040, eject)}) rotate(${lerp(0, 10, eject)}) scale(${lerp(0.2, 0.52, eject)})`}>
            <Bill kind="fake" />
          </g>
          <rect x={-200} y={-200} width={1480} height={2320} fill={K.bad} opacity={0.12 * rej * (0.6 + 0.4 * Math.sin(t * 14))} />
        </Cam>
      </g>
      <g opacity={b}>
        <Cam s={lerp(0.96, 1.04, ramp(lt, 2.7, 6.5))} x={540} y={960}>
          <Studio floorY={1250} />
          <Building x={270} y={900} s={0.95} color={K.mintDk} label="BANK" />
          <Building x={800} y={880} s={1.15} color={K.orange} label="BI" />
          <path d="M420,860 C520,760 600,760 640,830" fill="none" stroke={K.cyan} strokeWidth={8} strokeDasharray="18 12" strokeDashoffset={-t * 60} />
          <polygon points="640,830 612,826 636,806" fill={K.cyan} transform="rotate(20,640,830)" />
          <g transform={`translate(${lerp(300, 780, travel)},${lerp(700, 690, travel) - Math.sin(Math.PI * travel) * 120}) rotate(${lerp(-8, 6, travel)}) scale(0.32)`}>
            <Bill kind="fake" />
            <path d="M-160,-90 L160,90 M160,-90 L-160,90" stroke={K.bad} strokeWidth={26} strokeLinecap="round" />
          </g>
          <Tag x={270} y={1130} text="BANK" k={pop(lt, 3.0)} color={K.ink} size={34} />
          <Tag x={800} y={1130} text="BANK INDONESIA" k={pop(lt, 4.9)} color={K.orangeTx} size={34} />
        </Cam>
      </g>
      <g opacity={c}>
        <Cam s={lerp(1.0, 1.08, ramp(lt, 6.3, 11.1))} x={540} y={lerp(960, 990, ramp(lt, 6.3, 11.1))}>
          <Studio floorY={2000} />
          <g transform="translate(540,720)"><IndoMap fill={K.mint} scale={4.6} /></g>
          <g transform={`translate(${540 - 54 * 4.6},${720 + 8 * 4.6 - (1 - pin) * 300})`} opacity={pin}>
            <path d="M0,0 C-30,-40 -40,-60 -40,-80 A40,40 0 1,1 40,-80 C40,-60 30,-40 0,0 Z" fill={K.bad} />
            <circle cx={0} cy={-80} r={15} fill="#fff" />
          </g>
          <Tag x={540 - 54 * 4.6 + 20} y={860} text="MESUJI, LAMPUNG" k={pop(lt, 6.9)} color={K.bad} size={30} />
          {/* case card */}
          <rect x={130} y={960} width={820} height={360} rx={30} fill="rgba(29,43,51,.22)" filter="url(#soft)" transform="translate(8,14)" />
          <rect x={130} y={960} width={820} height={360} rx={30} fill={K.chip} stroke={K.cyan} strokeWidth={4} />
          {Array.from({ length: Math.min(count, 12) }, (_, i) => (
            <g key={i} transform={`translate(${300 + i * 6},${1140 - i * 5}) rotate(${-8 + i * 1.4}) scale(0.4)`}><Bill kind="real" shadow={i === 0} /></g>
          ))}
          <text x={700} y={1150} textAnchor="middle" fontFamily="Anton" fontSize={150} fill={K.ink}>{count}</text>
          <text x={700} y={1215} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={30} fill={K.cyanTx}>LEMBAR TAK TERBACA</text>
          <text x={540} y={1290} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={32} fill={K.ink} opacity={0.8}>Kasus Okt 2022 · setor tunai</text>
        </Cam>
      </g>
    </Svg>
  );
};

// ---------------- S7 Check by hand: dilihat, diraba, diterawang ----------------
const Icon: React.FC<{ x: number; k: number; kind: "eye" | "touch" | "light"; label: string }> = ({ x, k, kind, label }) => (
  <g transform={`translate(${x},640) scale(${k})`} opacity={clamp01(k * 1.5)}>
    <circle r={78} fill="rgba(29,43,51,.22)" transform="translate(5,9)" filter="url(#soft4)" />
    <circle r={78} fill={K.ink} />
    {kind === "eye" ? (
      <g><path d="M-46,0 Q0,-40 46,0 Q0,40 -46,0 Z" fill="#fff" /><circle r={16} fill={K.cyan} /></g>
    ) : kind === "touch" ? (
      <g><rect x={-18} y={-44} width={36} height={74} rx={18} fill="#ffd9c2" /><rect x={-11} y={-38} width={22} height={18} rx={8} fill="#fff" opacity={0.8} />
        {[0, 1, 2].map((i) => <path key={i} d={`M-36,${40 + i * 0} A${30 + i * 10},${10 + i * 4} 0 0,0 36,40`} fill="none" stroke={K.orange} strokeWidth={4} opacity={0.8 - i * 0.2} />)}</g>
    ) : (
      <g><circle r={26} fill="#ffd23f" />{Array.from({ length: 8 }, (_, i) => <rect key={i} x={-3} y={-50} width={6} height={14} rx={3} fill="#ffd23f" transform={`rotate(${i * 45})`} />)}</g>
    )}
    <text x={0} y={122} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={32} fill={K.ink}>{label}</text>
  </g>
);
const S7: React.FC<SP> = ({ t, lt }) => {
  const back = ease(ramp(lt, 5.0, 5.8)) * fadeOut(lt, 8.3, 0.6);
  const thread = Math.max(0, Math.sin(Math.PI * ramp(lt, 4.0, 5.3)));
  const wm = ease(ramp(lt, 5.2, 6.0));
  const rough = ease(ramp(lt, 6.6, 7.2)) * fadeOut(lt, 8.4, 0.4);
  const law = ease(ramp(lt, 8.4, 8.9));
  const hit = ramp(lt, 9.4, 9.7);
  const px = Math.sin(lt * 0.5) * 18;
  return (
    <Svg bg={K.paper}>
      <Cam s={lerp(1.0, 1.06, lt / 11)} x={540 - px * 0.3} y={960} r={lerp(-0.6, 0.6, lt / 11)}>
        <Studio floorY={1500} />
        {/* window = backlight */}
        <g transform={`translate(${px * 0.4},0)`}>
          <rect x={150} y={760} width={780} height={560} rx={20} fill="#fffbe8" stroke="#c9d6d0" strokeWidth={14} />
          <rect x={530} y={760} width={14} height={560} fill="#c9d6d0" />
          <rect x={150} y={1033} width={780} height={14} fill="#c9d6d0" />
          <ellipse cx={540} cy={1040} rx={420} ry={300} fill="#fff6c8" opacity={0.5 + 0.5 * back} filter="url(#glow)" />
        </g>
        <g transform={`translate(${540 + px},1040) rotate(${-2 + Math.sin(lt * 0.7) * 1.5})`}>
          <Bill kind="real" w={820} h={380} thread={thread} wm={wm} />
          {back > 0 ? <rect x={-410} y={-190} width={820} height={380} rx={14} fill="#fff8d0" opacity={0.25 * back} /> : null}
          {thread > 0 ? <Tag x={820 * 0.07} y={-250} text="BENANG PENGAMAN" k={thread} color={K.cyanTx} size={30} /> : null}
          {wm > 0 ? <g opacity={fadeOut(lt, 6.6, 0.4)}><Tag x={-820 * 0.34} y={-250} text="TANDA AIR" k={wm} color={K.cyanTx} size={30} /></g> : null}
          {rough > 0 ? (
            <g opacity={rough}>
              <circle cx={250} cy={110} r={80 + 6 * Math.sin(t * 8)} fill="none" stroke={K.orange} strokeWidth={6} />
              {[0, 1, 2, 3].map((i) => <path key={i} d={`M${200},${80 + i * 18} q25,-10 50,0 t50,0`} fill="none" stroke={K.orangeTx} strokeWidth={3} />)}
              <Tag x={250} y={-250} text="CETAK KASAR" k={rough} color={K.orangeTx} size={30} />
            </g>
          ) : null}
        </g>
        <Icon x={270} k={pop(lt, 1.85) * fadeOut(lt, 8.3, 0.4)} kind="eye" label="DILIHAT" />
        <Icon x={540} k={pop(lt, 2.5) * fadeOut(lt, 8.3, 0.4)} kind="touch" label="DIRABA" />
        <Icon x={810} k={pop(lt, 3.3) * fadeOut(lt, 8.3, 0.4)} kind="light" label="DITERAWANG" />
        {/* law beat: gavel */}
        {law > 0 ? (
          <g opacity={law}>
            <rect x={-400} y={-400} width={1880} height={2720} fill={K.ink} opacity={0.35} />
            <g transform={`translate(760,${880 + hit * 20}) rotate(${lerp(-40, 0, hit)},0,0)`}>
              <rect x={-20} y={-10} width={40} height={300} rx={14} fill="#8a5a2b" transform="rotate(35)" />
              <rect x={-120} y={-80} width={240} height={110} rx={24} fill="#a8703a" stroke="#6b431c" strokeWidth={4} transform="rotate(35)" />
            </g>
            <ellipse cx={600} cy={1150} rx={180} ry={30} fill={K.ink} opacity={0.4} />
            {hit >= 1 ? [0, 1, 2].map((i) => <circle key={i} cx={600} cy={1150} r={40 + (lt - 9.7) * 400 + i * 40} fill="none" stroke="#fff" strokeWidth={4} opacity={clamp01(1 - (lt - 9.7) * 2)} />) : null}
          </g>
        ) : null}
      </Cam>
    </Svg>
  );
};

// ---------------- S8 Outro hero: 4 per million ----------------
const S8: React.FC<SP> = ({ t, lt }) => {
  const pull = ease(lt / 4);
  const n = Math.round(4 * ease(ramp(lt, 0.6, 1.2)));
  const panel = pop(lt, 0.4, 0.5);
  return (
    <Svg>
      <Cam s={lerp(1.22, 0.98, pull)} x={540} y={lerp(1060, 980, pull)}>
        <Studio floorY={1440} />
        <g transform="translate(540,1440) scale(0.78)"><Machine t={t} slotGlow={0.6 + 0.4 * Math.sin(t * 4)} screen="TERIMA KASIH" /></g>
        <g transform={`translate(540,560) scale(${panel})`} opacity={clamp01(panel * 1.5)}>
          <rect x={-410} y={-170} width={820} height={330} rx={34} fill="rgba(29,43,51,.25)" filter="url(#soft)" transform="translate(8,14)" />
          <rect x={-410} y={-170} width={820} height={330} rx={34} fill={K.chip} stroke={K.cyan} strokeWidth={4} />
          <text x={-170} y={60} textAnchor="middle" fontFamily="Anton" fontSize={230} fill={K.bad}>{n}</text>
          <text x={110} y={-40} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={40} fill={K.ink}>LEMBAR PALSU</text>
          <text x={110} y={10} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={34} fill={K.ink}>per</text>
          <text x={110} y={72} textAnchor="middle" fontFamily="Anton" fontSize={64} fill={K.cyanTx}>1.000.000</text>
          <text x={0} y={136} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={38} fill={K.ink} opacity={0.8}>DATA BI · 2025</text>
        </g>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2 + t * 0.4;
          const tw = 0.5 + 0.5 * Math.sin(t * 5 + i * 1.7);
          return <circle key={i} cx={540 + Math.cos(a) * 420} cy={1060 + Math.sin(a) * 150} r={4 + 4 * tw} fill={K.cyan} opacity={0.5 * tw} />;
        })}
      </Cam>
    </Svg>
  );
};

export const SCENE_MAP: Record<SceneId, React.FC<SP>> = { S1, S2, S3, S4, S5, S6, S7, S8 };
