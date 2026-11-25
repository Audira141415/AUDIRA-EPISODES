// EP44 Yusuf Dibuang ke Sumur (QS Yusuf 4–20) — scenes. Each gets global t (s) and local lt (s since scene start), draws in 1080 × 1920.
// Lighting rule: key light upper-left on every set (Rays + LightPool), long cast shadows via P/Layered, camera never parks
// (elliptic orbit, same frequency per axis, + slow zoom: PAPERWORLD G13 lesson). Adab: Yusuf & Ya'qub faceless silhouettes.
import React from "react";
import {
  P, Layered, PaperDefs, LightPool, Rays, Stars, Y, Star5, Moon, SunDisc, Robed, WellMouth, Dune, FGBrush,
  circle, hash, ramp, ease, easeOut, lerp, mix, rect,
} from "./pieces";
import { Tent2, Lamp, Camel, Bucket, Shirt, Coin, Palm, DarkTree, WolfEyes, Scroll, WellSection } from "./props";

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
/** Elliptic orbit: speed never hits zero (G13). */
const orbit = (lt: number, ax = 14, ay = 16, f = 1.1) => [Math.sin(f * lt) * ax, Math.cos(f * lt) * ay];

// ── S1 Hook: 11 stars, sun and moon bow to the boy on the hill → camera sinks to the dark well ───────
const CHILD = { x: 540, y: 960 };
const STAR_POS = Array.from({ length: 11 }, (_, i) => {
  const a = Math.PI * (1.08 + (i / 10) * 0.84);
  return { x: 540 + Math.cos(a) * 430, y: 770 + Math.sin(a) * 250 + (hash(i * 2.7) - 0.5) * 24, r: 26 + hash(i * 5.1) * 10 };
});

export const S1: React.FC<SceneProps> = ({ t, lt }) => {
  const bow = ease(ramp(lt, 0.5, 2.4));
  const sink = ease(ramp(lt, 3.3, 7.8));
  const [ox, oy] = orbit(lt);
  const s = 1 + lt * 0.018 + 0.2 * sink;
  const skyY = -260 * sink;
  const worldY = -430 * sink;
  const toward = (x: number, y: number, k: number) => [lerp(x, CHILD.x, 0.1 * k), lerp(y, CHILD.y - 300, 0.08 * k) + 26 * k];
  return (
    <Frame id="s1" bg={[Y.night, "#8E86C4"]}>
      <g transform={cam(1 + lt * 0.015, 540, 700, ox * 0.4, skyY + oy * 0.4)}>
        <Stars t={t} n={46} h={760} />
        {STAR_POS.map((p, i) => {
          const [x, y] = toward(p.x, p.y, bow);
          const tw = 0.85 + 0.15 * Math.sin(t * 2.2 + i * 1.3);
          return (
            <g key={i} transform={`translate(${x},${y}) rotate(${(x < 540 ? 1 : -1) * 22 * bow}) scale(${tw})`}>
              <Star5 R={p.r} glow={0.8 + 0.4 * bow} />
            </g>
          );
        })}
        <g transform={`translate(${lerp(170, 205, bow)},${lerp(560, 600, bow)}) rotate(${18 * bow})`}><SunDisc r={72} t={t} /></g>
        <g transform={`translate(${lerp(910, 875, bow)},${lerp(540, 585, bow)}) rotate(${-24 * bow})`}><Moon r={66} /></g>
      </g>
      <g transform={cam(s, 540, 1250, ox, worldY + oy)}>
        <Dune y={1120} seed={2.1} col="#B9A2B8" amp={22} depth={0.7} />
        <Dune y={1130} seed={0.6} col={Y.sandDk} amp={18} depth={1} peakX={CHILD.x} peakH={150} />
        <LightPool x={CHILD.x} y={CHILD.y - 110} rx={260} ry={220} col="#FFE3A3" op={0.55 + 0.25 * bow} />
        <path d={circle(CHILD.x, CHILD.y - 120, 120)} fill={Y.goldLt} opacity={0.45 * bow} filter="url(#pglow)" style={{ mixBlendMode: "screen" }} />
        <g transform={`translate(${CHILD.x},${CHILD.y + 6}) scale(2.5)`}><Robed col={Y.robeY} pose="stand" /></g>
        <Dune y={1250} seed={3.4} col={Y.sand} amp={26} depth={1.1} />
        <LightPool x={540} y={1215} rx={330} ry={90} col="#5A4A9A" op={0.35} />
        <g transform="translate(540,1205)"><WellMouth rx={230} frame={false} dark={0.85 + 0.15 * sink} /></g>
        <Dune y={1540} seed={5.2} col={Y.sandLt} amp={22} depth={1.2} />
      </g>
      <FGBrush side="l" y={1820} col="#4A3A52" />
      <FGBrush side="r" y={1860} col="#4A3A52" s={0.9} />
      <Rays x={-120} y={-80} op={0.14 + 0.06 * bow} col="#F7E6FF" t={t} />
    </Frame>
  );
};

const BRO = (i: number) => mix(Y.robeB[i % 5], "#1A1030", 0.35 + 0.1 * (i % 2));
const walk = (t: number, ph = 0) => Math.sin(t * 6 + ph);

// ── S2 Camp of Kan'an at night: father (staff) and Yusuf by the lamp ─────────────────────────────
export const S2: React.FC<SceneProps> = ({ t, lt }) => {
  const [ox, oy] = orbit(lt);
  const s = 1.02 + lt * 0.016;
  const close = ease(ramp(lt, 4.4, 8.8));
  return (
    <Frame id="s2" bg={[Y.night, "#7D6FA8"]}>
      <Stars t={t} n={40} h={600} />
      <g transform="translate(860,420)"><Moon r={48} glow={0.8} /></g>
      <g transform={cam(s + 0.14 * close, 470, 1250, ox - 60 * close, oy)}>
        <Dune y={1080} seed={1.7} col="#8E7BA8" amp={30} depth={0.7} />
        <Dune y={1170} seed={4.4} col={Y.sandDk} amp={16} depth={1} />
        <g transform="translate(700,1250) scale(1.25)"><Tent2 sign="AUDIRA QISSAH" glow={0.9 + 0.1 * Math.sin(t * 3)} /></g>
        <LightPool x={420} y={1220} rx={330} ry={150} col="#FFC86A" op={0.7} />
        <g transform="translate(470,1290)"><Lamp t={t} s={1.3} /></g>
        <g transform="translate(300,1330) scale(4.4)"><Robed col={Y.robeA} cloth="#F3EAD6" pose="staff" /></g>
        <g transform="translate(560,1340) scale(3.2)"><Robed col={Y.robeY} pose={lt > 4.6 ? "reach" : "stand"} armRot={-10 * Math.sin(lt * 2)} /></g>
        <Dune y={1420} seed={6.1} col={Y.sand} amp={20} depth={1.1} />
      </g>
      <FGBrush side="l" y={1850} col="#3E3048" />
      <FGBrush side="r" y={1820} col="#3E3048" s={1.1} />
      <Rays x={-120} y={-80} op={0.12} col="#F7E6FF" t={t} />
    </Frame>
  );
};

// ── S3 Inside the tent: father and son, the dream bubble, "don't tell" ───────────────────────────
export const S3: React.FC<SceneProps> = ({ t, lt }) => {
  const [ox, oy] = orbit(lt, 10, 12);
  const s = 1.03 + lt * 0.014;
  const bub = easeOut(ramp(lt, 0.5, 1.6)) * (1 - ease(ramp(lt, 5.0, 6.6)));
  const hush = ease(ramp(lt, 4.6, 5.4));
  return (
    <Frame id="s3" bg={["#5A3440", "#B9764E"]} vig={0.55}>
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M${i * 170 - 40},0 L${i * 170 + 40},0 L${i * 170 + 90},1920 L${i * 170 - 10},1920Z`} fill={i % 2 ? Y.terra : "#E3CFAE"} opacity={0.22} />
      ))}
      <g transform={cam(s, 540, 1100, ox, oy)}>
        <LightPool x={540} y={1150} rx={420} ry={360} col="#FFC86A" op={0.75} />
        <g transform="translate(540,1330)"><Lamp t={t} s={1.6} /></g>
        <g transform="translate(300,1420) scale(6.2)"><Robed col={Y.robeA} cloth="#F3EAD6" pose={hush > 0.5 ? "reach" : "sit"} armRot={-30 * hush} /></g>
        <g transform="translate(790,1420) scale(4.6)"><Robed col={Y.robeY} pose="sit" /></g>
        <g transform={`translate(560,${740 - 20 * bub}) scale(${0.3 + 0.7 * bub})`} opacity={bub}>
          <P d={"M-250,40 C-300,-60 -200,-170 -90,-140 C-40,-220 120,-210 150,-130 C260,-150 310,-20 230,50 C240,130 100,160 40,120 C-20,170 -180,150 -190,90 C-260,100 -280,60 -250,40Z"} fill="#FFF6E6" depth={0.6} />
          {Array.from({ length: 11 }, (_, i) => {
            const a = Math.PI * (1.1 + (i / 10) * 0.8);
            return <g key={i} transform={`translate(${Math.cos(a) * 190},${30 + Math.sin(a) * 120})`}><Star5 R={16} glow={0.6} /></g>;
          })}
          <g transform="translate(-80,30)"><SunDisc r={34} t={t} /></g>
          <g transform="translate(90,30)"><Moon r={32} glow={0.5} /></g>
        </g>
      </g>
      <g filter="url(#pshadow)" opacity={0.85}><path d={rect(-40, 0, 90, 1920)} fill="#3A2420" /><path d={rect(1030, 0, 90, 1920)} fill="#3A2420" /></g>
      <Rays x={-120} y={-80} op={0.12} t={t} />
    </Frame>
  );
};

// ── S4 Jealous brothers in the shadow; father's tent glows far away ─────────────────────────────
export const S4: React.FC<SceneProps> = ({ t, lt }) => {
  const [ox, oy] = orbit(lt);
  const pan = lerp(140, -140, ease(ramp(lt, 0, 8.2)));
  const s = 1.04 + lt * 0.012;
  return (
    <Frame id="s4" bg={["#3A2E5E", "#B47A8E"]}>
      <Stars t={t} n={24} h={400} />
      <g transform={cam(1 + lt * 0.006, 540, 1100, pan * 0.3 + ox * 0.4, oy * 0.4)}>
        <Dune y={1000} seed={2.4} col="#8A6E98" amp={34} depth={0.6} />
        <g transform="translate(860,1040) scale(0.55)"><Tent2 glow={1} /></g>
        <LightPool x={860} y={1000} rx={240} ry={140} col="#FFC86A" op={0.8} />
        <g transform="translate(800,1030) scale(1.2)"><Robed col={Y.robeA} pose="staff" /></g>
        <g transform="translate(900,1030) scale(0.95)"><Robed col={Y.robeY} /></g>
      </g>
      <g transform={cam(s, 540, 1350, pan + ox, oy)}>
        <Dune y={1250} seed={5.5} col="#6E5A6E" amp={24} depth={1} />
        <LightPool x={540} y={1300} rx={500} ry={80} col="#2A1E40" op={0.5} />
        {Array.from({ length: 10 }, (_, i) => {
          const x = -40 + i * 118 + (i % 2) * 20;
          const turn = Math.sin(t * 1.2 + i) * 4;
          return <g key={i} transform={`translate(${x},${1380 + (i % 2) * 40}) scale(${3.4 + (i % 3) * 0.3}) rotate(${turn})`}><Robed col={BRO(i)} cloth={mix(BRO(i), "#ffffff", 0.2)} pose={i === 4 ? "reach" : "stand"} armRot={-20} /></g>;
        })}
        <Dune y={1500} seed={7.3} col="#5A4658" amp={18} depth={1.1} />
      </g>
      <FGBrush side="l" y={1860} col="#2A2034" />
      <FGBrush side="r" y={1840} col="#2A2034" />
      <Rays x={-120} y={-80} op={0.08} t={t} />
    </Frame>
  );
};

// ── S5 The plot on the hill: one brother says "don't kill him", the well sketched on a scroll ─────
export const S5: React.FC<SceneProps> = ({ t, lt }) => {
  const [ox, oy] = orbit(lt, 12, 14);
  const zoom = ease(ramp(lt, 3.8, 6.5));
  const s = 1.02 + lt * 0.012 + 0.22 * zoom;
  const sketch = ease(ramp(lt, 4.2, 6.4));
  const arrow = ease(ramp(lt, 6.6, 7.6));
  return (
    <Frame id="s5" bg={["#5E3E6E", "#E39A72"]}>
      <g transform="translate(820,560)"><SunDisc r={90} t={t} glow={0.8} /></g>
      <g transform={cam(s, 540, 860, ox, oy)}>
        <Dune y={1080} seed={3.1} col="#B07A6A" amp={26} depth={0.7} />
        <LightPool x={540} y={860} rx={360} ry={260} col="#FFE3A3" op={0.55} />
        <g transform="translate(540,820)"><Scroll draw={sketch} arrow={arrow} /></g>
        <Dune y={1250} seed={0.9} col={Y.sandDk} amp={18} depth={1} />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const x = [110, 260, 420, 660, 820, 970][i];
          const speaker = i === 2;
          return <g key={i} transform={`translate(${x},${1400 + (i % 2) * 30}) scale(${speaker ? 4.4 : 3.8})`}><Robed col={speaker ? mix(Y.robeB[3], "#ffffff", 0.1) : BRO(i)} pose={speaker && lt > 2.4 ? "reach" : "stand"} armRot={speaker ? -40 + 10 * Math.sin(lt * 3) : 0} /></g>;
        })}
        <Dune y={1500} seed={4.7} col={Y.sand} amp={20} depth={1.1} />
      </g>
      <FGBrush side="l" y={1860} col="#5A3E3A" />
      <FGBrush side="r" y={1850} col="#5A3E3A" />
      <Rays x={-120} y={-80} op={0.16} t={t} />
    </Frame>
  );
};

// ── S6 Morning departure; Ya'qub worries — wolf eyes in the dark wood ───────────────────────────
export const S6: React.FC<SceneProps> = ({ t, lt }) => {
  const [ox, oy] = orbit(lt);
  const dark = ease(ramp(lt, 3.6, 5.6));
  const eyes = ease(ramp(lt, 5.8, 6.6));
  const s = 1.02 + lt * 0.012 + 0.35 * ease(ramp(lt, 5.4, 7.7));
  const march = lt * 46;
  return (
    <Frame id="s6" bg={[mix("#9FC6E0", "#1E1A34", dark), mix("#F3D9B0", "#3A2E4A", dark)]}>
      <g transform={cam(s, lerp(540, 820, dark), 1150, ox - 80 * dark, oy)}>
        <Dune y={1060} seed={1.2} col={mix("#D8B78E", "#3A3048", dark)} amp={26} depth={0.7} />
        <g transform="translate(140,1150) scale(0.75)"><Tent2 glow={0.3} /></g>
        <g transform="translate(250,1160) scale(2.2)"><Robed col={Y.robeA} pose="staff" /></g>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i} transform={`translate(${330 + i * 92 + march},${1290 + (i % 2) * 20}) scale(${i === 3 ? 2.6 : 3.2})`}>
            <Robed col={i === 3 ? Y.robeY : BRO(i)} pose="walk" step={walk(t, i)} />
          </g>
        ))}
        <g opacity={0.25 + 0.75 * dark}>
          {[[760, 1180, 1.3, 3], [930, 1220, 1.6, 7], [1060, 1170, 1.2, 11], [860, 1300, 1.0, 13]].map(([x, y, sc, sd], i) => (
            <g key={i} transform={`translate(${x},${y})`}><DarkTree s={sc} seed={sd} /></g>
          ))}
          <g transform="translate(900,1020)"><WolfEyes open={eyes} s={0.9} /></g>
        </g>
        <Dune y={1380} seed={6.6} col={mix(Y.sand, "#2E2640", dark)} amp={18} depth={1.1} />
      </g>
      <FGBrush side="l" y={1860} col="#2E2A3A" />
      <FGBrush side="r" y={1850} col="#2E2A3A" />
      <Rays x={-120} y={-80} op={0.18 * (1 - dark)} t={t} />
    </Frame>
  );
};

// ── S7 HERO: the well in section; Yusuf at the bottom; a shaft of revelation light ─────────────
export const S7: React.FC<SceneProps> = ({ t, lt }) => {
  const crane = ease(ramp(lt, 0, 3.4));
  const beam = ease(ramp(lt, 1.8, 3.6));
  const [ox, oy] = orbit(lt, 14, 16);
  const ty = lerp(560, -260, crane);
  // G13: after the crane lands, keep a steady push-in on Yusuf (was parked 54.6–57 s: deadPct 11%).
  const push = 1.02 + lt * 0.01 + Math.max(0, lt - 2.6) * 0.05;
  return (
    <Frame id="s7" bg={["#3A3270", "#7A6E9A"]} vig={0.6}>
      <g transform={`translate(${ox},${ty + oy}) ${cam(push, 540, 1420)}`}>
        <Stars t={t} n={20} h={300} />
        <g transform="translate(0,560)">
          <g transform="translate(540,0)"><WellSection depth={1080} t={t} /></g>
          <g transform="translate(540,-6)"><WellMouth rx={190} frame={false} dark={0} /></g>
          <g opacity={beam} style={{ mixBlendMode: "screen" }}>
            <path d="M440,-120 L640,-120 L700,1080 L380,1080Z" fill="#FFE9B0" opacity={0.55} filter="url(#pglow)" />
            <path d="M500,-120 L580,-120 L610,1080 L470,1080Z" fill="#FFF6DA" opacity={0.6} filter="url(#pglow)" />
          </g>
          <LightPool x={540} y={1000} rx={200} ry={90} col="#FFE3A3" op={0.8 * beam} />
          <g transform="translate(540,976) scale(2.6)"><Robed col={Y.robeY} pose="sit" /></g>
          <path d={circle(540, 880, 120)} fill={Y.goldLt} opacity={0.4 * beam} filter="url(#pglow)" style={{ mixBlendMode: "screen" }} />
        </g>
      </g>
      <FGBrush side="l" y={1880} col="#2A2034" />
      <FGBrush side="r" y={1880} col="#2A2034" />
    </Frame>
  );
};

// ── S8 Dusk: brothers come home weeping with the shirt — close-up of the fake blood ──────────────
export const S8: React.FC<SceneProps> = ({ t, lt }) => {
  const [ox, oy] = orbit(lt);
  const push = ease(ramp(lt, 2.4, 4.4));
  const s = 1.02 + lt * 0.01 + 1.35 * push;
  const stain = ease(ramp(lt, 3.0, 4.4));
  return (
    <Frame id="s8" bg={["#7A3A4A", "#F0A06A"]}>
      <g transform="translate(300,880)"><SunDisc r={110} t={t} glow={0.9} /></g>
      <g transform={cam(s, 560, 1180, ox, oy)}>
        <Dune y={1080} seed={2.2} col="#B8665A" amp={30} depth={0.7} />
        <LightPool x={560} y={1170} rx={300} ry={160} col="#FFD08A" op={0.6} />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(${340 + i * 110 - lt * 14},${1320 + (i % 2) * 24}) scale(3.3) rotate(${-6})`}>
            <Robed col={BRO(i)} pose={i === 2 ? "carry" : "walk"} step={walk(t * 0.6, i)} />
          </g>
        ))}
        <g transform={`translate(${560 - lt * 14},1165) scale(0.42)`}><Shirt stain={stain} /></g>
        <Dune y={1400} seed={5.9} col="#C98E62" amp={18} depth={1.1} />
      </g>
      <FGBrush side="l" y={1860} col="#4A2A2A" />
      <FGBrush side="r" y={1850} col="#4A2A2A" />
      <Rays x={-120} y={-80} op={0.16} col="#FFE0C0" t={t} />
    </Frame>
  );
};

// ── S9 Ya'qub's patience: dim tent, seated silhouette, golden ribbon "FA SABRUN JAMIL" ──────────
export const S9: React.FC<SceneProps> = ({ t, lt }) => {
  const [ox, oy] = orbit(lt, 10, 12);
  const s = 1.03 + lt * 0.016;
  const rib = easeOut(ramp(lt, 3.6, 4.6));
  return (
    <Frame id="s9" bg={["#241E40", "#5E4458"]} vig={0.6}>
      <g transform={cam(s, 540, 1100, ox, oy)}>
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M${i * 200 - 60},0 L${i * 200 + 40},0 L${i * 200 + 100},1920 L${i * 200},1920Z`} fill={i % 2 ? Y.terra : "#E3CFAE"} opacity={0.12} />
        ))}
        <LightPool x={600} y={1230} rx={380} ry={260} col="#FFC86A" op={0.6} />
        <g transform="translate(700,1340)"><Lamp t={t} s={1.5} /></g>
        <g transform="translate(380,1400) scale(6.4)"><Robed col={mix(Y.robeA, "#2A1A30", 0.35)} cloth={mix("#F3EAD6", "#2A1A30", 0.3)} pose="staff" /></g>
        <g transform="translate(640,1395) scale(0.5) rotate(-8)"><Shirt stain={1} /></g>
        <g transform={`translate(540,${700 + (1 - rib) * 40})`} opacity={rib}>
          <path d="M-470,-80 L470,-80 L430,0 L470,80 L-470,80 L-430,0Z" fill={Y.gold} opacity={0.35} filter="url(#psoft)" />
          <P d="M-460,-74 L460,-74 L420,0 L460,74 L-460,74 L-420,0Z" fill="#F2B75B" depth={0.6} edge="#FFE3A3" />
          <text x={0} y={22} textAnchor="middle" fontFamily="Anton" fontSize={84} fill={Y.ink} letterSpacing={3}>FA SABRUN JAMIL</text>
          <text x={0} y={140} textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize={46} fill="#FFF6E6">maka kesabaran yang baik</text>
        </g>
      </g>
      <Rays x={-120} y={-80} op={0.1} t={t} />
    </Frame>
  );
};

// ── S10 The caravan: camels pass, the water-drawer lowers his bucket — Yusuf comes up ────────────
export const S10: React.FC<SceneProps> = ({ t, lt }) => {
  const [ox, oy] = orbit(lt);
  const pan = lerp(120, -80, ease(ramp(lt, 0, 7.6)));
  const lower = ease(ramp(lt, 2.0, 3.6));
  const up = ease(ramp(lt, 4.2, 5.4));
  const rope = 120 + 300 * lower - 380 * up;
  const s = 1.02 + lt * 0.012;
  return (
    <Frame id="s10" bg={["#8FBEDC", "#F6DDB2"]} vig={0.3}>
      <g transform="translate(860,520)"><SunDisc r={80} t={t} /></g>
      <g transform={cam(1 + lt * 0.006, 540, 1000, pan * 0.4 + ox * 0.4, oy * 0.4)}>
        <Dune y={980} seed={3.3} col="#E7C79A" amp={34} depth={0.6} />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${-80 + i * 260 + lt * 40},${1030 + i * 6}) scale(0.9)`}><Camel t={t} ph={i * 1.3} col={["#C9955E", "#B88250", "#D2A06A"][i]} /></g>
        ))}
      </g>
      <g transform={cam(s, 620, 1250, pan + ox, oy)}>
        <Dune y={1150} seed={1.8} col={Y.sandDk} amp={16} depth={1} />
        <LightPool x={640} y={1180} rx={340} ry={170} col="#FFE3A3" op={0.45 + 0.4 * up} />
        <g transform="translate(640,1230)"><WellMouth rx={200} frame dark={0.9} /></g>
        <g transform={`translate(640,${1230 + rope - 120})`}><Bucket ropeLen={rope + 180} glow={up} /></g>
        {up > 0.05 ? (
          <g transform={`translate(640,${1230 - 260 * up}) scale(${2.4 * up})`} opacity={up}><Robed col={Y.robeY} pose="reach" armRot={-6} /></g>
        ) : null}
        <g transform="translate(400,1330) scale(3.6)"><Robed col="#94704A" cloth="#E8DCC4" pose="reach" armRot={20 - 25 * up} /></g>
        <Dune y={1420} seed={4.9} col={Y.sand} amp={20} depth={1.1} />
      </g>
      <FGBrush side="l" y={1860} col="#7A5A3E" />
      <FGBrush side="r" y={1850} col="#7A5A3E" />
      <Rays x={-120} y={-80} op={0.2} t={t} />
    </Frame>
  );
};

// ── S11 Sold for a few dirhams: coins drop into the merchant's palm ──────────────────────────────
const COIN_T = [3.2, 3.7, 4.2, 4.7, 5.1];
export const S11: React.FC<SceneProps> = ({ t, lt }) => {
  const [ox, oy] = orbit(lt, 10, 12);
  const s = 1.03 + lt * 0.02;
  return (
    <Frame id="s11" bg={["#E7B27A", "#F4D7A8"]} vig={0.35}>
      <g transform={cam(1 + lt * 0.008, 540, 900, ox * 0.4, oy * 0.4)}>
        {[0, 1, 2].map((i) => <g key={i} transform={`translate(${150 + i * 390},980) scale(0.8)`}><Tent2 glow={0.2} sign={i === 1 ? "PASAR KAFILAH" : undefined} /></g>)}
        <g transform="translate(860,1000) scale(2.4)"><Robed col={Y.robeY} pose="stand" /></g>
        <Dune y={1000} seed={2.6} col="#D9AE7C" amp={14} depth={0.6} />
      </g>
      <g transform={cam(s, 540, 1250, ox, oy)}>
        <LightPool x={520} y={1080} rx={360} ry={240} col="#FFF1C9" op={0.6} />
        <g transform="translate(520,1360) scale(1.5)"><Palm /></g>
        {COIN_T.map((ct, i) => {
          const k = ramp(lt, ct - 0.7, ct);
          if (lt < ct - 0.7) return null;
          const y = lerp(520, 1010 - i * 14, easeOut(k * k));
          return <g key={i} transform={`translate(${470 + (i % 3) * 50 + (i > 2 ? 25 : 0)},${y})`}><Coin r={46} spin={k < 1 ? lt * 1.6 + i * 0.2 : 0.5} /></g>;
        })}
      </g>
      <FGBrush side="l" y={1860} col="#8A5A3A" />
      <FGBrush side="r" y={1850} col="#8A5A3A" />
      <Rays x={-120} y={-80} op={0.2} t={t} />
    </Frame>
  );
};

// ── S12 Dawn on the caravan road: 11 stars fade into the rising sun; brand on the road sign ───────
export const S12: React.FC<SceneProps> = ({ t, lt }) => {
  const [ox, oy] = orbit(lt);
  const rise = ease(ramp(lt, 0, 6.5));
  const ty = lerp(-180, 120, ease(ramp(lt, 0, 7)));
  return (
    <Frame id="s12" bg={[mix("#5E5A9A", "#F6B98A", rise), "#FBE3B8"]} vig={0.3}>
      <g transform={`translate(${ox * 0.4},${ty * 0.5 + oy * 0.4})`}>
        {STAR_POS.map((p, i) => (
          <g key={i} transform={`translate(${p.x},${p.y - 60})`} opacity={1 - 0.85 * rise}><Star5 R={p.r * 0.8} glow={0.6} /></g>
        ))}
        <g transform={`translate(540,${lerp(1080, 820, rise)})`}><SunDisc r={120} t={t} glow={0.6 + 0.6 * rise} /></g>
      </g>
      <g transform={cam(1.02 + lt * 0.012, 540, 1200, ox, ty + oy)}>
        <Dune y={1000} seed={1.4} col="#E8A98A" amp={22} depth={0.6} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${380 + i * 120 + lt * 12},${1060 - i * 4}) scale(${0.42 - i * 0.04})`}><Camel t={t} ph={i} col="#9A6A50" /></g>
        ))}
        <g transform={`translate(${560 + lt * 10},1080) scale(1.4)`}><Robed col={Y.robeY} pose="walk" step={walk(t * 0.7)} /></g>
        <Dune y={1180} seed={3.8} col={Y.sandDk} amp={18} depth={1} />
        <g transform="translate(200,1300)"><WellMouth rx={110} frame={false} dark={0.8} /></g>
        {lt < 7.4 ? <g transform="translate(850,1330)">
          <path d="M0,0 L0,-170" stroke="#6B4A33" strokeWidth={12} />
          <Layered depth={0.5} draw={(o) => <path d={rect(-210, -280, 420, 120)} fill={o ?? "#FFF6E6"} />} />
          <path d={rect(-210, -280, 420, 12)} fill={Y.terra} />
          <text x={0} y={-198} textAnchor="middle" fontFamily="Anton" fontSize={46} fill={Y.ink} letterSpacing={2} stroke="#FFF6E6" strokeWidth={4} paintOrder="stroke">AUDIRA QISSAH</text>
        </g> : null}
        <Dune y={1400} seed={6.3} col={Y.sand} amp={20} depth={1.1} />
      </g>
      <FGBrush side="l" y={1860} col="#8A5A4A" />
      <FGBrush side="r" y={1860} col="#8A5A4A" />
      <Rays x={-120} y={-80} op={0.24 * rise} col="#FFF1CC" t={t} />
    </Frame>
  );
};

export const SCENE_MAP: Record<string, React.FC<SceneProps>> = { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12 };
