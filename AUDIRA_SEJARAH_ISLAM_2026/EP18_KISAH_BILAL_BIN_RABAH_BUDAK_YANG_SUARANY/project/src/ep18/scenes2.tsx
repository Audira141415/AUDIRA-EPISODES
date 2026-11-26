// EP18 scenes S4a–S5b. Film seconds (t) are VO seconds; lt = seconds since the scene started.
import React from "react";
import { C, P, K, Pool, Rays, Haze, FG, Rings, Ground, Peaks, Sun, Boulder, Pebbles, Scraps, Fig, Lying, Palm, Leaf, Cloud, ease, easeOut, ramp, lerp, mix, hash, rect, poly, wave, arch, ellipse, sleeve, circle } from "./pieces";
import { Svg, L, Sky, Arrow, type SP, type Cam } from "./set";
import { shake } from "./scenes1";

// ── S4a side macro: the stone fills the top, one finger rises ──
export const S4a: React.FC<SP> = ({ t, lt }) => {
  const up = easeOut(ramp(t, 28.6, 29.9));
  const cam: Cam = { x: 40 - 16 * lt, y: -40 + 14 * lt + shake(t, 30.6, 6) + shake(t, 31.15, 6), z: 1.06 + 0.035 * lt };
  const sh = mix(C.ivory, "#8A6A48", 0.08);
  // forearm from bottom-left, wrist rises, one index finger up
  const wx = lerp(470, 520, up), wy = lerp(1460, 1210, up);
  return (
    <Svg>
      <L cam={cam} k={0.2}><Sky cols={["#FFF1D2", "#FBDDA6", "#F4C47E", "#E9A962"]} y0={900} gap={170} seed={10} /></L>
      <L cam={cam} k={0.35}><Sun x={900} y={1040} r={160} t={t} glow={0.9} /></L>
      <L cam={cam} k={0.5}><Peaks peaks={[[120, 1020, 200], [700, 980, 240], [1100, 1040, 180]]} base={1260} col="#D9925C" seed={19} depth={0.5} /></L>
      <Haze y={1150} h={140} op={0.5} col="#FFE6B8" />
      <L cam={cam}>
        <Ground y={1330} seed={9} cols={["#E1A764", "#CC8A4A", "#B47238"]} gap={130} amp={14} />
        {/* the stone: huge, cut off at the top */}
        <g transform="translate(600,560) rotate(-6)"><Boulder r={640} seed={7} /></g>
        <path d={wave(1130, 24, 2, 1240, -200, 1300)} fill="#2A140C" opacity={0.32} filter="url(#psh)" />
        {/* chest under the stone */}
        <g transform="translate(560,1330)"><Lying s={1.5} sunk={1} breathe={Math.sin(t * 4.5) * 0.7} /></g>
        <g transform="translate(0,0)">
          <K d={sleeve([[260, 1560], [380, 1500], [wx, wy]], 58, 46)} fill={sh} />
          <path d={`M300,1540 Q360,1500 ${wx - 30},${wy + 40}`} stroke="#6E5238" strokeWidth={4} opacity={0.35} fill="none" />
          <g transform={`translate(${wx.toFixed(1)},${wy.toFixed(1)}) rotate(${(lerp(40, 4, up)).toFixed(1)})`}>
            <K d="M-44,10 C-50,-30 -36,-58 -6,-62 C24,-62 44,-40 42,-4 C40,22 -30,34 -44,10Z" fill={C.skin} />
            <K d="M-30,-40 C-34,-58 -20,-66 -14,-50 L-12,-36Z M-6,-48 C-8,-66 6,-70 10,-52 L8,-40Z M14,-44 C14,-60 28,-62 28,-46 L24,-34Z" fill={mix(C.skin, "#000000", 0.18)} />
            <g transform={`translate(-14,-56) scale(1,${lerp(0.3, 1, up).toFixed(3)})`}><K d="M-12,4 C-14,-60 -12,-112 0,-120 C12,-112 14,-60 12,4Z" fill={mix(C.skin, "#FFE0C0", 0.1)} /></g>
          </g>
        </g>
        {t > 30.5 ? <g transform={`translate(${(wx - 14).toFixed(0)},${(wy - 180).toFixed(0)})`}><Rings t={t} t0={30.6} every={0.55} n={4} life={1.6} r0={50} r1={560} w={22} sy={0.4} /></g> : null}
        {t > 30.5 ? <Pool x={wx} y={wy - 160} rx={260} ry={260} col="#FFE08A" op={0.5 * ease(ramp(t, 30.6, 31.0))} /> : null}
        <g transform={`translate(${wx.toFixed(0)},${(wy - 170).toFixed(0)})`}><Scraps k={(t - 30.6) / 1.4} n={20} reach={420} up={0.9} size={14} seed={22} col={[C.goldLt, C.gold, "#FFF3DA"]} /></g>
        <Pebbles n={12} seed={13} x0={-60} x1={1140} y0={1420} y1={1700} r={22} col="#A9662F" />
      </L>
      <Rays op={0.22} t={t} x={980} y={900} a0={3.6} step={0.18} />
      <L cam={cam} k={1.7}><FG><g transform="translate(980,1800)"><Boulder r={260} seed={52} tone="#7A4A30" /></g><Pebbles n={10} seed={61} x0={0} x1={760} y0={1760} y1={1940} r={40} col="#8A4A2E" /></FG></L>
    </Svg>
  );
};

// ── S4b dusk cliff path: Waraqah stops, far below the stone ──
export const S4b: React.FC<SP> = ({ t, lt }) => {
  const walk = ramp(t, 32.8, 35.0), stop = t >= 35.0;
  const wx = lerp(80, 390, easeOut(walk));
  const cam: Cam = { x: -30 + 10 * lt, y: 40 - 10 * lt, z: 1.0 + 0.03 * lt };
  const turn = ease(ramp(t, 35.2, 36.0));
  return (
    <Svg>
      <L cam={cam} k={0.2}><Sky cols={["#3C3A66", "#6A4F7E", "#B4677A", "#E5916C", "#F4B47A"]} y0={260} gap={170} seed={14} /></L>
      <L cam={cam} k={0.3}><Sun x={800} y={980} r={120} t={t} hot="#FFD9A0" glow={0.8} rays={false} /><Cloud x={260} y={420} r={80} seed={5} col="#D99A9A" /><Cloud x={860 - lt * 6} y={560} r={70} seed={8} col="#E8B29A" /></L>
      <L cam={cam} k={0.45}><Peaks peaks={[[200, 900, 300], [900, 860, 320], [580, 980, 260]]} base={1200} col="#8A5070" seed={23} depth={0.7} /></L>
      <Haze y={1080} h={140} op={0.4} col="#F2B48C" />
      {/* the valley far below: small stone + Bilal + rings */}
      <L cam={cam} k={0.6}>
        <P d={wave(1180, 16, 7, 2400, -400, 1500)} fill="#B4683E" tex="krf" />
        <g transform="translate(700,1250)"><Lying s={0.3} sunk={1} /></g>
        <g transform="translate(700,1222)"><Boulder r={58} seed={7} /></g>
        {t > 36.5 ? <g transform="translate(700,1220)"><Rings t={t} t0={36.6} every={0.6} n={4} life={1.6} r0={30} r1={260} w={10} sy={0.5} /></g> : null}
        <Pool x={700} y={1210} rx={160} ry={70} col="#FFD27A" op={0.55} />
      </L>
      <L cam={cam}>
        {/* cliff edge foreground left */}
        <P d={poly([[-400, 1180], [120, 1150], [420, 1190], [600, 1290], [560, 2100], [-400, 2100]])} fill="#5A3048" tex="krf" th={2} />
        <P d={poly([[-400, 1240], [160, 1214], [440, 1250], [520, 1320], [480, 2100], [-400, 2100]])} fill="#6E3A52" depth={0.5} tex="krf" />
        {[0, 1, 2].map((i) => <path key={i} d={`M-300,${1300 + i * 110} Q100,${1270 + i * 110} ${460 - i * 20},${1330 + i * 120}`} stroke="#3A1C2E" strokeWidth={5} opacity={0.4} fill="none" />)}
        <g transform={`translate(${wx.toFixed(1)},1214)`}>
          <Fig col={C.indigo} cloak={C.indigo2} wrap="#D8CBB0" s={1.75} step={stop ? 0 : Math.sin(t * 7) * 0.6} sway={stop ? Math.sin(t * 1.2) * 0.4 : Math.sin(t * 7) * 1.2} lean={lerp(4, -3, turn)} armR={[[132, -250], [lerp(196, 214, turn), lerp(-150, -200, turn)]]} shLen={1.2} />
          {/* staff */}
          <g transform={`translate(${(lerp(196, 214, turn) * 1.75).toFixed(0)},${(lerp(-150, -200, turn) * 1.75).toFixed(0)}) rotate(${(4 + (stop ? 0 : Math.sin(t * 7) * 3)).toFixed(1)})`}><K d="M-7,-300 L7,-300 L10,520 L-10,520Z" fill={C.brown} /><K d={circle(0, -306, 14)} fill={mix(C.brown, "#FFE0B0", 0.2)} /></g>
        </g>
        <Pebbles n={10} seed={71} x0={-60} x1={460} y0={1300} y1={1560} r={24} col="#4A2438" />
      </L>
      <Rays op={0.18} t={t} x={820} y={980} a0={3.5} step={0.22} col="#FFD8B0" />
      <L cam={cam} k={1.7}><FG><Leaf x={1150} y={1820} r={-150} s={1.8} col="#3A3048" /><Leaf x={720} y={1960} r={-80} s={1.4} col="#4A3A58" /><g transform="translate(980,1700)"><Boulder r={220} seed={81} tone="#4A2E44" /></g></FG></L>
    </Svg>
  );
};

// ── S5a the exchange at a shaded gate ──
export const S5a: React.FC<SP> = ({ t, lt }) => {
  const cam: Cam = { x: 30 * Math.sin(lt * 0.5) - 6 * lt, y: -20 + 6 * lt, z: 1.0 + 0.03 * lt };
  const mv1 = ease(ramp(t, 41.9, 43.0)), mv2 = ease(ramp(t, 42.6, 43.7));
  const a1 = ease(ramp(t, 41.85, 42.5)), a2 = ease(ramp(t, 42.55, 43.2));
  return (
    <Svg>
      <L cam={cam} k={0.2}><Sky cols={["#F4E2BE", "#EFD09E", "#E6BD84"]} y0={300} gap={220} seed={16} /></L>
      <L cam={cam} k={0.45}>
        <P d={rect(-400, 360, 1900, 1100)} fill="#C48A5A" tex="krf" shade="down" th={2} />
        {Array.from({ length: 28 }, (_, i) => <path key={i} d={rect(-380 + (i % 7) * 260 + (Math.floor(i / 7) % 2) * 120, 430 + Math.floor(i / 7) * 170, 190, 80)} fill="#8E5634" opacity={0.14 + 0.1 * hash(i + 3)} />)}
      </L>
      <L cam={cam} k={0.75}>
        <P d={arch(250, 1300, 580, 840)} fill="#9E6A42" depth={0.7} th={2} />
        <path d={arch(300, 1300, 480, 780)} fill="#5A3A24" />
        <path d={arch(330, 1300, 420, 740)} fill="#FFE6B0" opacity={0.85} />
        <Pool x={540} y={900} rx={280} ry={380} col="#FFF2C8" op={0.6} />
        <g transform="translate(150,1230)"><Palm s={0.9} t={t} seed={3} /></g>
        <g transform="translate(940,1240)"><Palm s={0.8} t={t} seed={6} /></g>
      </L>
      <L cam={cam}>
        <Ground y={1290} seed={11} cols={["#C9965E", "#B07E4A", "#94663A"]} gap={140} amp={10} />
        {/* Abu Bakar (teal) left, Umayyah (terracotta) right */}
        <g transform="translate(170,1430)"><Fig col={C.teal} cloak={mix(C.teal, "#0A1A18", 0.3)} wrap="#EFE6D0" s={1.6} sway={Math.sin(t * 1.2) * 0.5} armR={[[124, -250], [lerp(120, 190, a1), lerp(-150, -220, a1)]]} /></g>
        <g transform="translate(910,1430)"><Fig col={C.terracotta} cloak={C.terraDk} wrap="#E7C27A" s={1.7} sway={Math.sin(t * 1.1 + 1) * 0.5} armL={[[-124, -250], [lerp(-120, -190, a2), lerp(-150, -220, a2)]]} /></g>
        {/* ivory figure moves right → left; brown figure left → right */}
        <g transform={`translate(${lerp(700, 380, mv1).toFixed(1)},1470)`}><Fig col={C.ivory} cloak="#DCC59C" s={1.15} step={mv1 > 0 && mv1 < 1 ? Math.sin(t * 8) * 0.6 : 0} sway={mv1 > 0 && mv1 < 1 ? Math.sin(t * 8) : Math.sin(t * 1.6) * 0.5} /></g>
        <g transform={`translate(${lerp(380, 700, mv2).toFixed(1)},1500)`}><Fig col="#7A5A3C" wrap="#C9A368" s={1.12} step={mv2 > 0 && mv2 < 1 ? Math.sin(t * 8 + 1) * 0.6 : 0} sway={mv2 > 0 && mv2 < 1 ? Math.sin(t * 8 + 1) : Math.sin(t * 1.5) * 0.5} /></g>
        <Arrow x0={760} x1={400} y={980} h={120} k={a1} col={C.gold} />
        <Arrow x0={360} x1={720} y={1130} h={-90} k={a2} col={C.goldLt} />
        <Pebbles n={12} seed={91} x0={-60} x1={1140} y0={1540} y1={1800} r={22} col="#8E6234" />
      </L>
      <Rays op={0.2} t={t} x={540} y={300} a0={1.25} step={0.2} />
      <L cam={cam} k={1.7}><FG><path d={rect(-460, -200, 420, 2400)} fill="#3A2416" /><path d={rect(1120, -200, 420, 2400)} fill="#3A2416" /><Leaf x={-40} y={1880} r={-30} s={1.6} col={C.leafDk} /></FG></L>
    </Svg>
  );
};

// ── S5b the cardboard chain breaks ──
const Link: React.FC<{ x: number; y: number; r: number; col?: string }> = ({ x, y, r, col = "#8C7A64" }) => (
  <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${r.toFixed(1)})`}>
    <path d={ellipse(10, 14, 120, 62)} fill="none" stroke="rgba(30,14,8,.4)" strokeWidth={40} filter="url(#psh)" />
    <path d={ellipse(4, 6, 120, 62)} fill="none" stroke={mix(col, "#1A0C06", 0.5)} strokeWidth={40} />
    <path d={ellipse(0, 0, 120, 62)} fill="none" stroke={col} strokeWidth={36} />
    <path d={ellipse(-2, -4, 116, 58)} fill="none" stroke="#E8D8BC" strokeWidth={4} opacity={0.6} />
    <path d={ellipse(0, 0, 120, 62)} fill="none" stroke="url(#krf)" strokeWidth={36} opacity={0.5} />
  </g>
);
export const S5b: React.FC<SP> = ({ t, lt }) => {
  const brk = ramp(t, 47.91, 49.4), b = easeOut(brk), on = t >= 47.91;
  const cam: Cam = { x: -20 + 8 * lt, y: 30 - 10 * lt + shake(t, 47.91, 18), z: 1.04 + 0.03 * lt };
  const glow = ease(ramp(t, 47.9, 48.6));
  // diagonal chain from top-left to bottom-right, break between link 3 and 4
  const links = Array.from({ length: 8 }, (_, i) => {
    const u = i / 7, side = i <= 3 ? -1 : 1;
    const x = lerp(-80, 1160, u) + side * 120 * b, y = lerp(300, 1700, u) + side * 90 * b + (i <= 3 ? -1 : 1) * 40 * b * b;
    return { x, y, r: 48 + (i % 2) * 90 + side * 18 * b };
  });
  return (
    <Svg>
      <L cam={cam} k={0.2}><Sky cols={["#3A2A3E", "#4E3348", "#6A3E48"]} y0={500} gap={360} seed={18} /></L>
      <L cam={cam} k={0.35}>
        {Array.from({ length: 6 }, (_, i) => <P key={i} d={rect(-300 + i * 260, 200 + (i % 2) * 120, 200, 1700)} fill={mix("#3A2430", "#5A3A44", hash(i))} depth={0.5} tex="krf" />)}
      </L>
      <Pool x={540} y={980} rx={lerp(200, 620, glow)} ry={lerp(260, 820, glow)} col="#FFDB8A" op={on ? 0.75 * glow : 0.1} />
      <L cam={cam} k={0.6}>
        {on ? <g transform="translate(540,990)"><Rings t={t} t0={47.95} every={0.5} n={5} life={1.8} r0={60} r1={900} w={28} /></g> : null}
        <g transform="translate(540,1420)" opacity={0.3 + 0.7 * glow}><Fig col={C.ivory} cloak="#E0CBA2" s={1.25} sway={Math.sin(t * 1.4) * 0.5} armL={[[-140, -280], [lerp(-100, -190, glow), lerp(-130, -360, glow)]]} armR={[[140, -280], [lerp(100, 190, glow), lerp(-130, -360, glow)]]} shadow={0.2} /></g>
        <P d={wave(1430, 10, 4, 2400, -400, 1500)} fill="#4A2E2E" tex="krf" />
      </L>
      <L cam={cam}>
        {links.map((l, i) => <Link key={i} x={l.x} y={l.y} r={l.r} col={i === 3 || i === 4 ? "#9A866C" : "#7E6C58"} />)}
        {on ? <g transform="translate(540,1000)"><Scraps k={(t - 47.91) / 1.6} n={40} reach={700} up={0.5} size={20} seed={31} col={[C.goldLt, C.gold, "#FFF3DA"]} /></g> : null}
        {on ? <g transform="translate(540,1000)"><Scraps k={(t - 47.91) / 1.2} n={16} reach={420} up={0.3} size={26} seed={35} col={["#9A866C", "#7E6C58", "#B8A486"]} /></g> : null}
      </L>
      <Rays op={on ? 0.35 * glow : 0.08} t={t} x={540} y={980} a0={0} step={0.785} n={8} col="#FFE6A8" />
      <L cam={cam} k={1.7}><FG><Link x={-60} y={1820} r={20} col="#5A4C40" /><Link x={1140} y={180} r={60} col="#5A4C40" /></FG></L>
    </Svg>
  );
};
