// EP18 scenes S1–S3b. Film seconds (t) are VO seconds; lt = seconds since the scene started.
import React from "react";
import { C, P, K, Pool, Rays, Haze, FG, Rings, Ground, Peaks, Sun, Boulder, Pebbles, Scraps, Fig, Lying, House, Palm, Leaf, Cloud, ease, easeOut, ramp, lerp, mix, hash, rect, poly, wave, arch, ellipse, sleeve, blob } from "./pieces";
import { Svg, L, Sky, Txt, type SP, type Cam } from "./set";

export const shake = (t: number, t0: number, a: number) => (t < t0 ? 0 : Math.sin((t - t0) * 46) * a * Math.exp(-(t - t0) * 5));

// ── S1 hook: low macro, the stone comes down on the chest ──
export const S1: React.FC<SP> = ({ t, lt }) => {
  const fall = Math.pow(ramp(t, 0.0, 0.9), 2.2), hit = t >= 0.9;
  const press = hit ? 1 - 0.25 * Math.exp(-(t - 0.9) * 6) : 0;
  const lift = ease(ramp(t, 4.34, 4.75));
  const by = lerp(470, 832, fall) + (hit ? 12 * (1 - Math.exp(-(t - 0.9) * 2)) : 0) - 46 * lift;
  const cam: Cam = { x: -30 + 12 * lt, y: -34 + 8 * lt + shake(t, 0.9, 16), z: 1.02 + 0.028 * lt };
  return (
    <Svg>
      <L cam={cam} k={0.2}><Sky cols={["#FFF8E6", "#FCEBC4", "#F8DCA4", "#F2C988"]} y0={300} gap={230} seed={2} /></L>
      <L cam={cam} k={0.35}><Sun x={700} y={500} r={300} t={t} glow={0.9} /></L>
      <L cam={cam} k={0.5}><Peaks peaks={[[60, 700, 330], [960, 640, 380], [520, 820, 300]]} base={1120} col="#E2AE7C" seed={5} depth={0.6} /></L>
      <Haze y={940} h={150} op={0.5} col="#FFF0CE" />
      <L cam={cam}>
        <Ground y={1085} seed={1.2} cols={["#E6BC7C", "#D79F5C", "#C38649"]} gap={120} amp={18} />
        <path d={ellipse(590, 1210, lerp(180, 420, fall), lerp(26, 60, fall))} fill="#2A140C" opacity={0.3 + 0.28 * fall} filter="url(#psh)" />
        <g transform="translate(508,1196)"><Lying s={1.24} sunk={press} breathe={hit ? Math.sin(t * 5) * 0.7 : Math.sin(t * 3)} /></g>
        {t > 4.3 ? <g transform="translate(540,1040)"><Rings t={t} t0={4.36} every={0.28} n={4} life={1.5} r0={180} r1={900} w={30} sy={0.46} /></g> : null}
        {t > 4.3 ? <Pool x={540} y={1070} rx={360} ry={90} col="#FFD468" op={0.7 * lift} /> : null}
        <g transform={`translate(540,${by.toFixed(1)}) rotate(${(lerp(-16, 0, fall) + shake(t, 4.34, 2.4)).toFixed(2)})`}><Boulder r={296} seed={7} /></g>
        <g transform="translate(500,1170)">
          <K d={sleeve([[-60, -60], [40, 20], [170, 46]], 46, 40)} fill={mix(C.ivory, "#8A6A48", 0.08)} />
          <path d="M-40,-50 Q30,0 60,40 M0,-30 Q60,10 110,46" stroke="#6E5238" strokeWidth={4} opacity={0.4} fill="none" />
          <g transform="translate(198,50)"><K d={`M-28,-26 C0,-34 34,-26 ${62 - 12 * press},-22 l4,10 C40,-10 60,-4 ${72 - 14 * press},0 l0,10 C50,10 60,14 ${62 - 12 * press},20 l-4,9 C20,30 -10,30 -30,22Z`} fill={C.skin} /></g>
        </g>
        <g transform="translate(540,1180)"><Scraps k={(t - 0.9) / 1.5} n={34} reach={620} up={0.6} size={20} seed={4} /></g>
        <g transform="translate(540,1180)"><Scraps k={(t - 4.36) / 1.3} n={26} reach={560} up={0.8} size={17} seed={9} col={[C.goldLt, C.gold, "#FFF3DA"]} /></g>
        <Pebbles n={14} seed={3} x0={-60} x1={1140} y0={1250} y1={1600} r={22} />
      </L>
      <Rays op={0.2} t={t} x={860} y={120} a0={1.5} step={0.22} />
      <L cam={cam} k={1.7}>
        <FG>
          <g transform="translate(30,1720)"><Boulder r={250} seed={21} tone="#8A6A50" /></g>
          <g transform="translate(1080,1780)"><Boulder r={230} seed={33} tone="#7A5A44" /></g>
          <Pebbles n={10} seed={40} x0={200} x1={900} y0={1700} y1={1900} r={44} />
        </FG>
      </L>
    </Svg>
  );
};

// ── S2 Makkah valley, then the valley stands on an open book ──
const City: React.FC<{ t: number }> = ({ t }) => {
  const rows: [number, number, number, number, number, string][] = [
    [150, 800, 120, 96, 1, "#D9B184"], [290, 782, 110, 120, 2, "#E2C298"], [430, 792, 120, 92, 3, "#CDA071"], [570, 776, 110, 118, 4, "#DDB98C"], [710, 790, 130, 100, 5, "#CFA678"], [860, 800, 110, 90, 6, "#DDB98C"],
    [80, 884, 140, 110, 7, "#E6C79C"], [245, 876, 120, 96, 8, "#D0A174"], [640, 880, 130, 112, 9, "#E2BF92"], [800, 888, 140, 104, 10, "#CFA071"],
    [150, 972, 150, 108, 11, "#DDB384"], [720, 972, 160, 116, 12, "#E6C79C"],
  ];
  return (
    <g>
      {rows.map(([x, y, w, h, s, col], i) => {
        const k = easeOut(ramp(t, 5.5 + i * 0.07, 6.1 + i * 0.07));
        return <g key={i} transform={`translate(${x},${y}) scale(1,${Math.max(0.02, k).toFixed(3)})`}><House w={w} h={h} seed={s} col={col} win={2} door={i > 5} lit={0.15} depth={0.5} /></g>;
      })}
      <g transform="translate(395,930)"><Palm s={0.62} t={t} seed={2} /></g>
      <g transform="translate(560,965)"><Palm s={0.78} t={t} seed={5} /></g>
      <g transform="translate(960,940)"><Palm s={0.6} t={t} seed={8} /></g>
    </g>
  );
};
export const S2: React.FC<SP> = ({ t, lt }) => {
  const zo = ease(ramp(t, 10.3, 11.7));
  const cam: Cam = { x: lerp(-40 + lt * 8, 0, zo), y: lerp(-150 + 250 * ease(ramp(lt, 0, 4.6)) + lt * 6, 10, zo), z: lerp(1.34 + 0.02 * lt, 0.97 + 0.022 * (lt - 5), zo) };
  return (
    <Svg>
      <L cam={cam} k={0.2}><Sky cols={["#F8E7C4", "#F6D9A6", "#F0C78C", "#E9B878"]} y0={200} gap={190} seed={4} /></L>
      <L cam={cam} k={0.3}><Sun x={250} y={330} r={130} t={t} glow={0.6} /><Cloud x={820 + lt * 8} y={330} r={90} seed={3} col="#FFF3DC" /></L>
      <L cam={cam} k={0.55}><Peaks peaks={[[-40, 520, 330], [330, 560, 300], [760, 470, 360], [1120, 560, 300]]} base={960} col="#C98A5E" seed={12} depth={0.7} /></L>
      <L cam={cam}>
        <P d={wave(1080, 20, 3, 2800, -900, 2000)} fill="#8A5A3A" tex="krf" shade="down" />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M-900,${1230 + i * 170} H2000`} stroke="#4A2A18" strokeWidth={5} opacity={0.4} />)}
        <P d={poly([[-60, 1000], [540, 1060], [1140, 1000], [1190, 1250], [540, 1290], [-110, 1250]])} fill={C.terraDk} th={3} depth={1.3} tex="krf" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <P d={`M${-30 - i},${1216 - i * 9} L-10,${990 - i * 6} Q300,${960 - i * 6} 540,${1030 - i * 6} L540,${1256 - i * 9} Q280,${1190 - i * 9} ${-30 - i},${1216 - i * 9}Z`} fill={i % 2 ? "#F6E7C6" : "#FFF6E0"} depth={i ? 0.12 : 0.6} />
            <P d={`M${1110 + i},${1216 - i * 9} L1090,${990 - i * 6} Q780,${960 - i * 6} 540,${1030 - i * 6} L540,${1256 - i * 9} Q800,${1190 - i * 9} ${1110 + i},${1216 - i * 9}Z`} fill={i % 2 ? "#EBD9B4" : "#F8EBD0"} depth={i ? 0.12 : 0.6} />
          </g>
        ))}
        <path d="M540,990 V1222" stroke="#5A3A24" strokeWidth={10} opacity={0.5} filter="url(#pct)" />
        {[0, 1, 2, 3].map((i) => <g key={i} opacity={0.35}><path d={`M${40 - i * 4},${1080 + i * 28} Q280,${1044 + i * 28} 490,${1096 + i * 26}`} stroke="#8A6A48" strokeWidth={5} fill="none" /><path d={`M${1040 + i * 4},${1080 + i * 28} Q800,${1044 + i * 28} 590,${1096 + i * 26}`} stroke="#8A6A48" strokeWidth={5} fill="none" /></g>)}
        <Peaks peaks={[[120, 560, 260], [520, 620, 260], [930, 540, 280]]} base={860} col="#D79A66" seed={31} depth={0.8} />
        <P d={wave(800, 14, 2, 1000, 0, 1080)} fill="#E6BE86" depth={0.4} tex="krf" />
        <City t={t} />
        <P d={poly([[404, 1216], [676, 1216], [668, 1290], [412, 1290]])} fill={C.gold} depth={0.5} th={1.6} />
        <g opacity={ease(ramp(t, 10.4, 11.2))}><Txt x={540} y={1276} s={62} ls={8} col="#4A2410" sh>AUDIRA</Txt></g>
      </L>
      <Pool x={300} y={700} rx={460} ry={300} op={0.4} />
      <Rays op={0.22} t={t} />
      <L cam={{ x: cam.x - 480 * zo, y: cam.y * 0.3, z: 1 + 0.02 * lt }} k={1.2}>
        <P d={wave(1240, 16, 6, 2600, -900, 2000)} fill={mix("#B9803F", "#5A3A24", 0.2)} tex="krf" shade="down" opacity={1 - zo} />
        <g transform="translate(250,1300)" opacity={1 - ease(ramp(t, 11.0, 11.5))}>
          <Fig col={C.ivory} s={1.62} armR={[[132, -318], [84, -432]]} sway={Math.sin(t * 1.6) * 0.9} cloak="#D9C39A" />
          <g transform="translate(150,-760)"><K d={blob(76, 4, 10, 0.12, 1.25, 0.85)} fill={C.brown} /><K d="M70,-30 l46,-16 l8,24 l-44,22Z" fill={mix(C.brown, "#1A0E08", 0.3)} /></g>
        </g>
      </L>
      <L cam={cam} k={1.7}><FG><Leaf x={-60} y={1800} r={-30} s={1.6} col={C.leafDk} /><Leaf x={1140} y={1860} r={-120} s={1.7} col="#5A7A44" /></FG></L>
    </Svg>
  );
};

// ── S3a Umayyah towers, low angle ──
export const S3a: React.FC<SP> = ({ t, lt }) => {
  const cam: Cam = { x: 50 - 34 * lt, y: 60 - 26 * lt, z: 1.0 + 0.04 * lt };
  const pt = ease(ramp(t, 15.0, 15.7));
  return (
    <Svg>
      <L cam={cam} k={0.3}><Sky cols={["#E8A66A", "#DC8C56", "#CC7448"]} y0={240} gap={260} seed={6} /></L>
      <L cam={cam} k={0.6}>
        <P d={rect(-400, 250, 1900, 1200)} fill="#A9573A" tex="krf" shade="down" th={2} />
        {Array.from({ length: 34 }, (_, i) => <path key={i} d={rect(-380 + (i % 7) * 260 + (Math.floor(i / 7) % 2) * 120, 330 + Math.floor(i / 7) * 180, 190, 84)} fill="#7E3524" opacity={0.16 + 0.12 * hash(i)} />)}
        {[-200, 60, 330, 620, 900, 1180].map((x, i) => <P key={i} d={rect(x, 196, 150, 90)} fill="#B4633F" depth={0.4} />)}
      </L>
      <L cam={cam} k={0.8}>
        <P d={arch(40, 1260, 440, 720)} fill="#C77B4E" depth={0.6} th={2} />
        <path d={arch(84, 1260, 352, 664)} fill="#FFE3A6" />
        <path d={arch(84, 1260, 352, 664)} fill="url(#fib)" />
        <Pool x={260} y={940} rx={230} ry={380} col="#FFF2C4" op={0.85} />
        <Peaks peaks={[[150, 1010, 120], [320, 960, 140]]} base={1180} col="#E8B276" seed={4} depth={0.3} />
        <path d={poly([[84, 1260], [436, 1260], [820, 1600], [-160, 1600]])} fill="#FFE3A6" opacity={0.5} filter="url(#psh)" style={{ mixBlendMode: "screen" }} />
      </L>
      <L cam={cam}>
        <Ground y={1256} seed={2} cols={["#8E4530", "#74321F", "#5A2416"]} gap={130} amp={8} />
        <g transform="translate(262,1272)"><Fig col={C.ivory} s={1.32} cloak="#E0CBA2" sway={Math.sin(t * 2) * 0.6} shLen={0.8} /></g>
      </L>
      <L cam={cam} k={1.25}>
        <path d={ellipse(820, 1830, 520, 90)} fill="#1A0A06" opacity={0.5} filter="url(#psh)" />
        <g transform="translate(822,1850)">
          <Fig col={C.terracotta} cloak={C.terraDk} wrap="#E7C27A" s={2.95} armL={[[lerp(-104, -158, pt), lerp(-230, -286, pt)], [lerp(-100, -262, pt), lerp(-130, -300, pt)]]} lean={-2 - 2 * pt} sway={Math.sin(t * 1.3) * 0.5} shadow={0} />
        </g>
      </L>
      <Rays op={0.24} t={t} x={-60} y={300} a0={0.2} step={0.16} col="#FFE0A0" />
      <L cam={cam} k={1.8}><FG><path d={rect(-420, -200, 400, 2400)} fill="#2E120C" /></FG></L>
    </Svg>
  );
};

// ── S3b ravine at noon ──
export const S3b: React.FC<SP> = ({ t, lt }) => {
  const sunK = ease(ramp(t, 18.6, 21.6));
  const push = ease(ramp(t, 22.5, 23.85)), hit = t >= 23.85;
  const bx = lerp(905, 470, push), by = lerp(860, 1010, push) - 28 * Math.sin(Math.PI * push);
  const z2 = ease(ramp(t, 24.0, 25.6));
  const cam: Cam = { x: -20 + 5 * lt - 40 * z2, y: -150 * (1 - ease(ramp(lt, 0, 4))) + 6 * lt + 60 * z2 + shake(t, 23.85, 14), z: 1.0 + 0.012 * lt + 0.2 * z2 };
  const point = ease(ramp(t, 19.4, 20.0));
  const rest = ease(ramp(t, 24.0, 24.5));
  return (
    <Svg>
      <L cam={cam} k={0.2}><Sky cols={["#F7C26A", "#F2AE56", "#EB9A48", "#E28840"]} y0={180} gap={230} seed={8} /></L>
      <L cam={cam} k={0.3}><Sun x={lerp(250, 600, sunK)} y={lerp(900, 420, sunK)} r={lerp(150, 190, sunK)} t={t} hot="#FFF3C0" glow={1} /></L>
      <L cam={cam} k={0.5}><Peaks peaks={[[-40, 420, 380], [1120, 360, 400], [250, 640, 240], [860, 620, 250]]} base={1120} col="#D2703E" seed={17} depth={0.9} /></L>
      <Haze y={930} h={120} op={0.4} col="#FFD896" />
      <L cam={cam} k={0.8}><Peaks peaks={[[-120, 760, 260], [1220, 720, 280]]} base={1250} col="#A94E2E" seed={27} depth={0.9} /></L>
      <L cam={cam}>
        <Ground y={1080} seed={5} cols={["#EBB26A", "#DB9850", "#C47F3E"]} gap={130} amp={16} />
        {[0, 1, 2].map((i) => <path key={i} d={wave(1010 - i * 36 + Math.sin(t * 2 + i) * 6, 8, t * 1.4 + i, 1030 - i * 36, -320, 1400)} fill="#FFE7AE" opacity={0.2} />)}
        <g transform="translate(120,1190)"><Fig col={C.terracotta} cloak={C.terraDk} wrap="#E7C27A" s={1.34} armR={[[lerp(104, 150, point), lerp(-230, -270, point)], [lerp(100, 232, point), lerp(-130, -262, point)]]} sway={Math.sin(t * 1.4) * 0.6} /></g>
        <g transform="translate(500,1200)"><Lying s={0.95} sunk={hit ? 1 : 0} breathe={Math.sin(t * (hit ? 5 : 2.6)) * 0.8} /></g>
        <path d={ellipse(bx + 40, 1200, 220, 30)} fill="#2A140C" opacity={0.2 + 0.3 * push} filter="url(#psh)" />
        {[0, 1].map((i) => {
          const fx = lerp(1010 + i * 120, 690 + i * 130, push), st = push > 0 && push < 1 ? Math.abs(Math.sin(t * 9 + i * 1.6)) : 0;
          return <g key={i} transform={`translate(${fx.toFixed(1)},${(1180 + i * 46 - st * 12).toFixed(1)})`}><Fig col={i ? "#7A5A3C" : "#8C6A46"} wrap={i ? "#C9A368" : "#B98D58"} s={1.14} armL={[[lerp(-150, -110, rest), lerp(-268, -230, rest)], [lerp(-214, -104, rest), lerp(-282, -134, rest)]]} armR={[[lerp(-40, 104, rest), lerp(-270, -230, rest)], [lerp(-150, 100, rest), lerp(-250, -130, rest)]]} lean={lerp(-11, 0, rest)} shLen={0.7} /></g>;
        })}
        <g transform={`translate(${bx.toFixed(1)},${by.toFixed(1)}) rotate(${(-150 * push).toFixed(1)})`}><Boulder r={172} seed={7} /></g>
        <g transform="translate(470,1190)"><Scraps k={(t - 23.85) / 1.3} n={26} reach={430} size={17} seed={14} /></g>
        <Pebbles n={16} seed={8} x0={-60} x1={1140} y0={1250} y1={1650} r={24} col="#B06A36" />
      </L>
      <Rays op={0.22} t={t} x={600} y={300} a0={1.1} step={0.3} />
      <L cam={cam} k={1.7}><FG><g transform="translate(-20,1760)"><Boulder r={260} seed={41} tone="#8A4A2E" /></g><g transform="translate(1110,1700)"><Boulder r={210} seed={44} tone="#7A3E28" /></g><Pebbles n={9} seed={50} x0={250} x1={850} y0={1740} y1={1900} r={40} col="#8A4A2E" /></FG></L>
    </Svg>
  );
};
