// EP18 scenes S6a–S8b. Film seconds (t) are VO seconds; lt = seconds since the scene started.
import React from "react";
import { C, P, K, Pool, Rays, Haze, FG, Rings, Ground, Peaks, Sun, Boulder, Pebbles, Scraps, Fig, Seated, House, Palm, Kaaba, Minaret, Stars, Cloud, Leaf, Flower, ease, easeOut, ramp, lerp, mix, hash, rect, poly, wave, arch, ellipse, blob, circle } from "./pieces";
import { Svg, L, Sky, type SP, type Cam } from "./set";
import { shake } from "./scenes1";

const EAR_R: [[number, number], [number, number]] = [[132, -340], [58, -396]];

// ── S6a Madinah before dawn: the camera passes over the roofs, people come out ──
export const S6a: React.FC<SP> = ({ t, lt }) => {
  const cam: Cam = { x: -120 + 70 * lt, y: -60 + 14 * lt, z: 1.08 + 0.03 * lt };
  const out = (i: number) => easeOut(ramp(t, 52.0 + i * 0.35, 52.8 + i * 0.35));
  const houses: [number, number, number, number, number][] = [[-160, 1160, 220, 200, 1], [90, 1130, 200, 250, 2], [320, 1170, 240, 190, 3], [590, 1140, 200, 240, 4], [820, 1165, 230, 200, 5], [1080, 1150, 210, 230, 6]];
  return (
    <Svg>
      <L cam={cam} k={0.2}><Sky cols={["#1C2340", "#26315A", "#3E4C7A", "#6A6A94", "#B88E8E"]} y0={330} gap={170} seed={20} /><Stars t={t} n={36} h={600} y0={80} op={0.8} /></L>
      <L cam={cam} k={0.35}><Peaks peaks={[[100, 860, 220], [700, 820, 260], [1200, 880, 200]]} base={1100} col="#3A3E66" seed={33} depth={0.5} /></L>
      <Haze y={1020} h={140} op={0.35} col="#C4A6B0" />
      <L cam={cam} k={0.65}>{[[-80, 1050], [260, 1040], [560, 1060], [900, 1045], [1250, 1050]].map(([x, y], i) => <g key={i} transform={`translate(${x},${y})`}><House w={170} h={150} seed={20 + i} col="#5A5480" win={2} lit={0.6 * ease(ramp(t, 51.6 + i * 0.3, 52.4 + i * 0.3))} depth={0.4} /></g>)}<g transform="translate(420,1060)"><Palm s={0.8} t={t} seed={4} col="#3E5A44" /></g><g transform="translate(1100,1060)"><Palm s={0.7} t={t} seed={9} col="#3E5A44" /></g></L>
      <L cam={cam}>
        <Ground y={1180} seed={13} cols={["#6A5A7A", "#56486A", "#433858"]} gap={140} amp={10} />
        {houses.map(([x, y, w, h, s], i) => <g key={i} transform={`translate(${x},${y})`}><House w={w} h={h} seed={s + 40} col="#8A7898" win={2} door lit={ease(ramp(t, 51.8 + i * 0.25, 52.6 + i * 0.25))} depth={0.6} /></g>)}
        {houses.map(([x, y, w], i) => {
          const k = out(i);
          return <g key={i} transform={`translate(${(x + w * 0.5 + 60 * k).toFixed(1)},${(y + 70 * k).toFixed(1)})`} opacity={k}><Fig col={i % 2 ? "#4A5478" : "#6A4A5A"} wrap="#D8CDBE" s={0.62} lean={-4} sway={Math.sin(t * 1.4 + i) * 0.6} shLen={0.4} shadow={0.2} /></g>;
        })}
        <Pebbles n={10} seed={101} x0={-200} x1={1400} y0={1360} y1={1600} r={20} col="#3A3050" />
      </L>
      <Pool x={540} y={1100} rx={600} ry={160} col="#FFB86A" op={0.18} />
      <L cam={cam} k={1.7}><FG><path d={wave(1720, 30, 5, 2400, -500, 2000)} fill="#2A2440" /><g transform="translate(200,1900)"><Palm s={1.4} t={t} seed={12} col="#2A3A30" /></g></FG></L>
    </Svg>
  );
};

// ── S6b Bilal on the roof, hand to ear, rings to the dawn ──
export const S6b: React.FC<SP> = ({ t, lt }) => {
  const cam: Cam = { x: 20 - 6 * lt, y: 80 - 22 * lt, z: 1.0 + 0.035 * lt };
  const hand = ease(ramp(t, 55.0, 55.7));
  const dawn = ease(ramp(t, 54.8, 58.8));
  return (
    <Svg>
      <L cam={cam} k={0.2}><Sky cols={[mix("#26315A", "#4A4A7A", dawn), "#5A5A8A", "#A07A94", "#E8A684", "#FFD39A"]} y0={420} gap={150} seed={24} /><Stars t={t} n={24} h={360} y0={60} op={0.6 * (1 - dawn)} /></L>
      <L cam={cam} k={0.3}><Sun x={300} y={lerp(1120, 1000, dawn)} r={150} t={t} hot="#FFE4A8" glow={0.9} /></L>
      <L cam={cam} k={0.45}>{Array.from({ length: 8 }, (_, i) => <g key={i} transform={`translate(${-120 + i * 170},${1180 + (i % 2) * 30})`}><House w={150} h={120 + (i % 3) * 30} seed={60 + i} col="#6A6088" win={2} lit={ease(ramp(t, 55.6 + i * 0.32, 56.2 + i * 0.32))} depth={0.4} /></g>)}</L>
      <Haze y={1150} h={120} op={0.35} col="#F2C4A0" />
      <L cam={cam}>
        {/* the roof Bilal stands on */}
        <P d={rect(-300, 1520, 1700, 600)} fill="#8A7090" tex="krf" th={2} />
        <P d={poly([[-300, 1500], [1400, 1500], [1400, 1540], [-300, 1540]])} fill="#A88EA8" depth={0.4} />
        {Array.from({ length: 12 }, (_, i) => <P key={i} d={rect(-280 + i * 150, i % 2 ? 1476 : 1460, 120, i % 2 ? 26 : 42)} fill="#9A82A0" depth={0.3} />)}
        {t > 55.4 ? <g transform="translate(560,640)"><Rings t={t} t0={55.5} every={0.5} n={7} life={2.2} r0={80} r1={1100} w={26} sy={0.62} /></g> : null}
        <g transform="translate(560,1510)"><Fig col={C.ivory} cloak="#DCC59C" wrap="#F2E8D2" s={2.3} armR={[[lerp(104, 132, hand), lerp(-230, -340, hand)], [lerp(100, 58, hand), lerp(-130, -396, hand)]]} sway={Math.sin(t * 1.1) * 0.4} shLen={0.6} /></g>
      </L>
      <Rays op={0.26} t={t} x={300} y={1000} a0={4.6} step={0.2} col="#FFE0B0" />
      <L cam={cam} k={1.7}><FG><Leaf x={-80} y={1900} r={-20} s={1.8} col="#3A3A58" /><Leaf x={1160} y={1880} r={-140} s={1.6} col="#4A3A58" /></FG></L>
    </Svg>
  );
};

// ── S6c the dream, then two seated men: the gold ribbon passes to Bilal ──
export const S6c: React.FC<SP> = ({ t, lt }) => {
  const pan = ease(ramp(t, 62.1, 63.2));
  const cam: Cam = { x: lerp(-200, 420, pan) + 6 * lt, y: -10 + 6 * lt, z: 1.06 + 0.02 * lt };
  const dream = easeOut(ramp(t, 59.0, 60.0));
  const pass = ease(ramp(t, 62.9, 64.0));
  const rx = lerp(800, 1180, pass), ry = 1080 - 120 * Math.sin(Math.PI * pass);
  return (
    <Svg>
      <L cam={cam} k={0.2}><Sky cols={["#2E3458", "#3E4670", "#5A5884"]} y0={500} gap={320} seed={26} /><Stars t={t} n={30} h={500} y0={100} op={0.7} /></L>
      <L cam={cam} k={0.6}>
        <P d={rect(-500, 300, 2700, 1200)} fill="#4A4470" tex="krf" shade="down" />
        <path d={arch(-160, 1100, 260, 420)} fill="#2A2848" /><path d={arch(-140, 1100, 220, 390)} fill="#7A86B8" opacity={0.5} />
        <path d={arch(1660, 1100, 260, 420)} fill="#2A2848" /><path d={arch(1680, 1100, 220, 390)} fill="#FFD39A" opacity={0.55} />
      </L>
      <L cam={cam}>
        <P d={rect(-600, 1280, 2800, 900)} fill="#5A4A6A" tex="krf" th={2} />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M-600,${1360 + i * 150} H2200`} stroke="#3A2E4A" strokeWidth={4} opacity={0.4} />)}
        {/* sleeper (lying, wrapped) left */}
        <P d={poly([[-120, 1290], [460, 1290], [470, 1330], [-130, 1330]])} fill="#8A7A9A" depth={0.5} />
        <g transform="translate(120,1260)"><K d="M-150,30 C-170,-20 -120,-70 -40,-80 C60,-90 200,-70 300,-40 C340,-26 350,10 330,30Z" fill="#C8B89A" /><K d="M-150,30 C-180,-30 -150,-80 -100,-80 C-60,-76 -40,-30 -50,30Z" fill="#E2D4B6" /></g>
        {/* dream cloud of paper with a gold ring inside */}
        <g transform={`translate(240,${(820 - 20 * Math.sin(t * 1.2)).toFixed(1)}) scale(${dream.toFixed(3)})`}>
          <P d={blob(250, 14, 12, 0.14, 1.5, 0.95)} fill="#E8E2F2" depth={0.7} />
          <P d={blob(170, 17, 10, 0.12, 1.4, 0.9)} fill="#F6F2FA" depth={0.3} />
          <g transform="translate(0,0)"><Rings t={t} t0={59.3} every={0.6} n={5} life={1.8} r0={30} r1={220} w={16} sy={0.7} /></g>
          <K d={circle(0, 0, 40)} fill={C.gold} />
        </g>
        {[0, 1, 2].map((i) => <g key={i} transform={`translate(${(160 + i * 36).toFixed(0)},${(1180 - i * 60).toFixed(0)})`} opacity={dream}><K d={circle(0, 0, 12 + i * 8)} fill="#E8E2F2" /></g>)}
        {/* two seated men face each other at right (seen from behind/side) */}
        <Pool x={980} y={1060} rx={460} ry={320} col="#FFD27A" op={0.3 * pass + 0.22} />
        <g transform="translate(980,700)"><K d="M-6,-500 L6,-500 L6,-40 L-6,-40Z" fill="#2A2040" /><K d={circle(0, 0, 44)} fill="#FFC95A" /><path d={ellipse(0, 0, 160, 160)} fill="#FFD27A" opacity={0.45} filter="url(#psoft)" style={{ mixBlendMode: "screen" }} /></g>
        <g transform="translate(780,1320)"><Seated col="#4A5478" wrap="#E2D8C4" s={1.45} sway={Math.sin(t * 1.3) * 0.6} /></g>
        <g transform="translate(1180,1320)"><Seated col={C.ivory} wrap="#F2E8D2" s={1.45} flip sway={Math.sin(t * 1.2 + 1) * 0.6} /></g>
        {pass > 0 ? <g>
          <path d={`M800,1080 Q${((800 + rx) / 2).toFixed(0)},${(ry - 140).toFixed(0)} ${rx.toFixed(0)},${ry.toFixed(0)}`} stroke={C.gold} strokeWidth={24} fill="none" strokeLinecap="round" />
          <path d={`M800,1076 Q${((800 + rx) / 2).toFixed(0)},${(ry - 146).toFixed(0)} ${rx.toFixed(0)},${(ry - 4).toFixed(0)}`} stroke="#FFF3C8" strokeWidth={4} fill="none" opacity={0.7} />
        </g> : null}
        {t > 64.1 ? <g transform="translate(1180,900)"><Rings t={t} t0={64.21} every={0.4} n={3} life={1.4} r0={80} r1={900} w={30} /></g> : null}
      </L>
      <L cam={cam} k={1.6}><FG><path d={rect(460, -200, 120, 2400)} fill="#241E38" /><Leaf x={-300} y={1900} r={-20} s={1.6} col="#2E2A48" /></FG></L>
    </Svg>
  );
};

// ── S7a the old stone now in light, tilt up to the Ka'bah at dawn (payoff 70.64) ──
export const S7a: React.FC<SP> = ({ t, lt }) => {
  const tilt = ease(ramp(t, 66.0, 69.4));
  const cam: Cam = { x: -10 + 4 * lt, y: lerp(560, -40, tilt) + shake(t, 70.64, 14), z: 1.0 + 0.026 * lt + 0.08 * ease(ramp(t, 70.5, 73.8)) };
  const hit = t >= 70.64;
  return (
    <Svg>
      <L cam={cam} k={0.2}><Sky cols={["#8FA0C8", "#C8B4C0", "#F2C8A0", "#FFDCA0", "#FFEBC0"]} y0={240} gap={180} seed={28} /></L>
      <L cam={cam} k={0.3}><Sun x={540} y={760} r={190} t={t} hot="#FFF4D0" glow={1} /></L>
      <L cam={cam} k={0.45}><Peaks peaks={[[-40, 700, 340], [1120, 680, 360], [300, 840, 240], [800, 820, 260]]} base={1120} col="#B98C78" seed={37} depth={0.7} /></L>
      <Haze y={1000} h={150} op={0.45} col="#FFE6C4" />
      <L cam={cam}>
        <Ground y={1120} seed={17} cols={["#E8C89C", "#D8B282", "#C49A6A"]} gap={150} amp={10} />
        {/* courtyard and crowd from behind */}
        <P d={ellipse(540, 1160, 560, 110)} fill="#F2E2C4" depth={0.4} />
        <g transform="translate(540,1130)"><Kaaba w={300} light={0.6} /></g>
        <g transform="translate(450,824)"><Fig col={C.ivory} cloak="#DCC59C" wrap="#F2E8D2" s={0.36} armR={EAR_R} shadow={0} /></g>
        {hit ? <g transform="translate(470,690)"><Rings t={t} t0={70.64} every={0.42} n={6} life={2.4} r0={60} r1={1300} w={34} sy={0.6} /></g> : null}
        {hit ? <Pool x={470} y={720} rx={500} ry={420} col="#FFE08A" op={0.5 * ease(ramp(t, 70.64, 71.2))} /> : null}
        {Array.from({ length: 22 }, (_, i) => {
          const row = Math.floor(i / 8), x = -40 + (i % 8) * 160 + (row % 2) * 80 + hash(i) * 30, y = 1250 + row * 70;
          return <g key={i} transform={`translate(${x.toFixed(0)},${y})`}><Fig col={["#F0E6D4", "#E2D4BC", "#D8C8AE", "#4A5478"][i % 4]} wrap="#F4EEE2" s={0.5 + row * 0.08} sway={Math.sin(t * 1.3 + i) * 0.5} shadow={0.2} shLen={0.4} /></g>;
        })}
        {/* the old stone, now warm and lit, with flowers — first in view, low */}
        <g transform="translate(260,1830)"><Boulder r={300} seed={7} tone="#B8A088" /></g>
        <Pool x={260} y={1760} rx={320} ry={180} col="#FFE0A0" op={0.45} />
        {[[120, 1640, -20], [190, 1610, 10], [330, 1620, 26], [400, 1660, -8], [70, 1700, -30]].map(([x, y, r], i) => <Flower key={i} x={x} y={y} s={0.9 + (i % 2) * 0.3} r={r} col={i % 2 ? C.rose : C.goldLt} />)}
        <Pebbles n={10} seed={111} x0={480} x1={1140} y0={1600} y1={1950} r={26} col="#B48A5E" />
      </L>
      <Rays op={0.24 + (hit ? 0.12 * Math.exp(-(t - 70.64) * 1.5) : 0)} t={t} x={540} y={760} a0={0.4} step={0.38} n={6} col="#FFF0C8" />
      <L cam={cam} k={1.7}><FG><Leaf x={1160} y={1950} r={-130} s={1.8} col={C.leafDk} /><Flower x={980} y={1900} s={2.2} col={C.rose} /></FG></L>
    </Svg>
  );
};

// ── S7b golden footsteps up the hill into the light ──
export const S7b: React.FC<SP> = ({ t, lt }) => {
  const cam: Cam = { x: 30 - 10 * lt, y: 120 - 60 * lt, z: 1.0 + 0.04 * lt };
  const steps = Array.from({ length: 11 }, (_, i) => {
    const u = i / 10;
    return { x: lerp(380, 640, u) + (i % 2 ? 60 : -60) * (1 - u * 0.6), y: lerp(1720, 900, u), s: lerp(2.4, 0.8, u), k: ease(ramp(t, 74.0 + i * 0.3, 74.35 + i * 0.3)) };
  });
  const bu = Math.min(0.78, 0.1 + ((t - 74.0) / 0.3 + 1) / 10); // one step ahead of the last lit footprint, stops mid-hill
  const bx = lerp(380, 640, bu), by = lerp(1720, 900, bu) - 20, bs = lerp(1.9, 1.05, bu);
  return (
    <Svg>
      <L cam={cam} k={0.2}><Sky cols={["#FFE8B8", "#FFF1D0", "#FFF8E6"]} y0={500} gap={200} seed={30} /></L>
      <Pool x={620} y={640} rx={460} ry={360} col="#FFFFFF" op={0.45} />
      <L cam={cam} k={0.35}><Peaks peaks={[[100, 860, 240], [1000, 840, 260]]} base={1100} col="#F0D2A0" seed={41} depth={0.4} /></L>
      <L cam={cam}>
        <P d="M-400,2200 L-400,1500 C0,1300 380,900 620,800 C860,900 1180,1300 1500,1500 L1500,2200Z" fill="#E8C08A" tex="krf" th={2} />
        <P d="M-400,2200 L-400,1700 C40,1500 400,1100 620,960 C860,1100 1180,1500 1500,1700 L1500,2200Z" fill="#DCAE74" depth={0.5} tex="krf" />
        {steps.map((s, i) => s.k > 0 && i / 10 < bu ? (
          <g key={i} transform={`translate(${s.x.toFixed(1)},${s.y.toFixed(1)}) scale(${(s.s * (0.6 + 0.4 * s.k)).toFixed(3)},${(s.s * 0.62 * (0.6 + 0.4 * s.k)).toFixed(3)}) rotate(${i % 2 ? 8 : -8})`}>
            <path d={ellipse(0, 0, 70, 50)} fill="#FFE08A" opacity={0.6 * s.k} filter="url(#pglow)" style={{ mixBlendMode: "screen" }} />
            <path d="M-22,30 C-30,0 -24,-34 0,-40 C24,-34 30,0 22,30 C14,42 -14,42 -22,30Z" fill="none" stroke="#8A5A1E" strokeWidth={8} />
            <K d="M-22,30 C-30,0 -24,-34 0,-40 C24,-34 30,0 22,30 C14,42 -14,42 -22,30Z" fill={C.gold} />
            {[-16, -6, 4, 13].map((x, j) => <g key={j} transform={`translate(${x},${-50 - (j === 1 ? 4 : 0)})`}><K d={circle(0, 0, 6 + (j === 0 ? 2 : 0))} fill={C.goldLt} sh={0.4} /></g>)}
          </g>) : null)}
        {/* Bilal from behind, walking up ahead of the lit footsteps into the light (jury r1: subject was missing) */}
        <g transform={`translate(${bx.toFixed(1)},${by.toFixed(1)})`}><Fig col={C.ivory} cloak="#DCC59C" wrap="#F2E8D2" s={bs} step={Math.sin(t * 6) * 0.6} sway={Math.sin(t * 6) * 1.0} lean={-3} shLen={0.5} shadow={0.3} /></g>
        <g transform="translate(620,900)"><Scraps k={(t - 75.5) / 2} n={10} reach={380} up={1} size={12} seed={44} col={[C.goldLt, "#FFF3DA", C.gold]} /></g>
      </L>
      <Rays op={0.32} t={t} x={620} y={640} a0={0.8} step={0.3} n={6} col="#FFF6D8" />
      <L cam={cam} k={1.7}><FG><Leaf x={-60} y={1900} r={-30} s={1.8} col={C.leafDk} /><Flower x={1040} y={1880} s={2} col={C.goldLt} /></FG></L>
    </Svg>
  );
};

// ── S8a Damascus at dusk (no minaret: c. 640) ──
const Cypress: React.FC<{ x: number; y: number; h: number; col?: string }> = ({ x, y, h, col = "#3E5A4A" }) => (
  <g transform={`translate(${x},${y})`}><K d={`M0,${-h} C26,${-h * 0.7} 34,${-h * 0.3} 22,0 L-22,0 C-34,${-h * 0.3} -26,${-h * 0.7} 0,${-h}Z`} fill={col} /><path d={`M0,${-h + 20} Q8,${-h * 0.5} 4,-10`} stroke="#FFF3DC" strokeWidth={3} opacity={0.25} fill="none" /></g>
);
export const S8a: React.FC<SP> = ({ t, lt }) => {
  const cam: Cam = { x: 80 - 30 * lt, y: -30 + 10 * lt, z: 1.06 + 0.03 * lt };
  return (
    <Svg>
      <L cam={cam} k={0.2}><Sky cols={["#5E5A94", "#8C82B8", "#B496BE", "#E2A8A8", "#F4C49C"]} y0={300} gap={170} seed={32} /></L>
      <L cam={cam} k={0.3}><Sun x={780} y={1000} r={110} t={t} hot="#FFE0B0" glow={0.7} rays={false} /><Cloud x={300} y={460} r={80} seed={11} col="#C4A6CC" /></L>
      <L cam={cam} k={0.45}><Peaks peaks={[[-60, 780, 360], [480, 720, 420], [1100, 800, 340]]} base={1150} col="#6E6496" seed={45} depth={0.7} /></L>
      <Haze y={1080} h={140} op={0.4} col="#E8BCC0" />
      <L cam={cam} k={0.7}>{[[-140, 1160, 180, 150], [60, 1150, 160, 190], [600, 1150, 180, 160], [800, 1160, 200, 200], [1020, 1150, 170, 150]].map(([x, y, w, h], i) => <g key={i} transform={`translate(${x},${y})`}><House w={w} h={h} seed={80 + i} col="#C8AAB4" win={2} lit={0.7} depth={0.5} /></g>)}<Cypress x={250} y={1160} h={300} /><Cypress x={560} y={1160} h={260} /><Cypress x={990} y={1160} h={280} /></L>
      <L cam={cam}>
        <Ground y={1240} seed={19} cols={["#A88AA0", "#8E7290", "#745A7A"]} gap={150} amp={10} />
        {/* arched city gate, stone courses */}
        <P d={rect(160, 700, 760, 600)} fill="#B4A0A8" tex="krf" th={2} />
        {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M160,${760 + i * 90} H920`} stroke="#7A6474" strokeWidth={4} opacity={0.45} />)}
        {Array.from({ length: 9 }, (_, i) => <P key={i} d={rect(160 + i * 88, i % 2 ? 668 : 650, 70, i % 2 ? 34 : 52)} fill="#C4B0B6" depth={0.3} />)}
        <path d={arch(360, 1300, 360, 480)} fill="#3A2A44" />
        <path d={arch(384, 1300, 312, 450)} fill="#FFC88A" opacity={0.75} />
        <Pool x={540} y={1120} rx={220} ry={260} col="#FFD8A0" op={0.6} />
        <g transform="translate(540,1300)"><Fig col={C.ivory} cloak="#DCC59C" wrap="#F2E8D2" s={0.78} sway={Math.sin(t * 1.2) * 0.5} step={Math.sin(t * 6) * 0.4} shLen={0.5} /></g>
        <Pebbles n={10} seed={121} x0={-60} x1={1140} y0={1380} y1={1640} r={22} col="#5A4466" />
      </L>
      <Rays op={0.18} t={t} x={780} y={1000} a0={3.6} step={0.2} col="#FFD8C0" />
      <L cam={cam} k={1.7}><FG><Cypress x={-30} y={2000} h={900} col="#2A3A34" /><Leaf x={1160} y={1920} r={-140} s={1.7} col="#3E3A58" /></FG></L>
    </Svg>
  );
};

// ── S8b paper globe, minarets light up along the curve, five suns ──
export const S8b: React.FC<SP> = ({ t, lt }) => {
  const cam: Cam = { x: 0, y: 60 - 14 * Math.min(lt, 6), z: 0.96 + 0.025 * Math.min(lt, 7) };
  const spin = lt * 3.2;
  const five = (i: number) => easeOut(ramp(t, 84.75 + i * 0.22, 85.25 + i * 0.22));
  return (
    <Svg>
      <L cam={cam} k={0.2}><Sky cols={["#1E2448", "#2E3A66", "#4A5684"]} y0={600} gap={360} seed={34} /><Stars t={t} n={44} h={900} y0={60} op={0.8} /></L>
      <L cam={cam} k={0.4}>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = Math.PI * (0.15 + 0.175 * i), x = 540 - Math.cos(a) * 420, y = 640 - Math.sin(a) * 300, k = five(i);
          return k > 0 ? <g key={i} transform={`translate(${x.toFixed(0)},${y.toFixed(0)}) scale(${k.toFixed(3)})`}><Sun x={0} y={0} r={58} t={t + i} hot={["#FFE6B0", "#FFF4D0", "#FFD38A", "#F4A87A", "#C8B8E8"][i]} glow={0.7} rays={false} /></g> : null;
        })}
      </L>
      <L cam={cam}>
        <path d={circle(540, 1560, 640)} fill="#0E1228" opacity={0.5} filter="url(#psh)" transform="translate(20,30)" />
        <P d={circle(540, 1560, 620)} fill="#2F6B62" depth={1} th={2} />
        {/* continents as paper patches drifting with the spin */}
        {Array.from({ length: 7 }, (_, i) => {
          const x = ((hash(i * 4.1) * 1400 + spin * 18) % 1400) - 160, y = 1100 + hash(i * 2.3) * 420;
          return <g key={i} transform={`translate(${x.toFixed(0)},${y.toFixed(0)})`}><P d={blob(80 + hash(i) * 70, 50 + i, 10, 0.24, 1.5, 0.8)} fill={i % 2 ? "#D8B482" : "#C49A6A"} depth={0.4} tex="krf" /></g>;
        })}
        <path d={circle(540, 1560, 620)} fill="none" stroke="#9FD0C0" strokeWidth={6} opacity={0.4} />
        {Array.from({ length: 9 }, (_, i) => {
          const a = Math.PI * (0.2 + 0.075 * i), x = 540 - Math.cos(a) * 610, y = 1560 - Math.sin(a) * 610, rot = (a * 180) / Math.PI - 90;
          const lit = ease(ramp(t, 82.0 + i * 0.32, 82.5 + i * 0.32));
          return <g key={i} transform={`translate(${x.toFixed(0)},${y.toFixed(0)}) rotate(${rot.toFixed(1)})`}><Minaret s={0.36} lit={lit} />{lit > 0.9 ? <g transform="translate(0,-130)"><Rings t={t} t0={82.5 + i * 0.32} every={0.9} n={3} life={1.8} r0={20} r1={220} w={8} sy={0.6} /></g> : null}</g>;
        })}
      </L>
      <Pool x={540} y={940} rx={620} ry={300} col="#FFD27A" op={0.25 * five(4)} />
      <L cam={cam} k={1.7}><FG><Leaf x={-80} y={1940} r={-20} s={1.8} col="#1E2A3A" /><Leaf x={1160} y={1940} r={-150} s={1.8} col="#1E2A3A" /></FG></L>
    </Svg>
  );
};
