// EP13 shots 12-21 (explanation, payoff, outro).
import React from "react";
import { Img } from "remotion";
import { Beam, C, Dust, EN_GARDE, F_LABEL, Fencer, Fig, Glow, Layer, MaskG, Plane, STAND, Shot, Smoke, Svg, TEX, W, clamp, lerp, lin, mix, seg, smooth, type Pose } from "./lib.tsx";
import { Arena, Blinds, CUT, Current, Handle, Lamp, P, Pool, lit, wob } from "./kit.tsx";

type T = { t: number };
const E = "penjelasan", Y = "payoff", O = "outro";
/** Bright lab bench: the reveal happens on a light surface. */
const Bench: React.FC<{ t: number; d?: number; lx?: number }> = ({ t, d = 0.6, lx = 560 }) => (
  <Layer d={d}>
    <Plane tex={TEX.wood} tint="#b5ab97" size={1200} light={`radial-gradient(ellipse 980px 1180px at ${lx + 500}px 1330px, #fff 0%, #ddd6c6 45%, #77716a 78%, #26262a 100%)`} />
    <Blinds t={t} x={-200} y={240} w={1500} h={1400} o={0.26} skew={-22} />
  </Layer>
);

// ---- 12a the sword is taken apart: guard off, leather lifted, hole; leather closes again, then lifts
const ROT = -33;
export const S12: React.FC<T> = ({ t }) => {
  const a = CUT[11], b = CUT[12], off = smooth((t - W(E, "dibongkar")) / 0.9), hole = W(E, "lubang"), kain = W(E, "kain");
  const flap = smooth((t - hole + 0.35) / 0.4) * (1 - smooth((t - kain + 0.25) / 0.4));
  return (
    <Shot t={t} a={a} b={b} from={{ x: 50, y: 20, z: 1.0 }} to={{ x: -40, y: -14, z: 1.16 }}>
      <Bench t={t} />
      <Layer d={0.7} blur={4}><Svg><rect x={720} y={380} width={460} height={300} fill="#1a1c20" transform="rotate(14 900 500)" /><rect x={740} y={392} width={420} height={8} fill="#8d98a6" transform="rotate(14 900 500)" /></Svg></Layer>
      <Layer d={1}><Handle x={150} y={1150} s={1.14} rot={ROT} off={420 * off} flap={flap} blade={off < 0.9} /></Layer>
      <Layer d={1}><Pool x={540} y={980} rx={840} ry={1060} o={0.72} hold={54} /></Layer>
      <Layer d={1.6} blur={12}><Svg><path d="M1240 1300 Q1050 1290 960 1480 Q900 1640 940 2100 L1400 2100 Z" fill="#0a0b0e" /><path d="M1200 1300 Q1050 1300 960 1480 Q920 1570 920 1700" stroke="#a3bfdb" strokeWidth={9} fill="none" opacity={0.7} /></Svg></Layer>
      <Layer d={1.3}><Dust t={t} seed="s12" n={34} /></Layer>
    </Shot>
  );
};
// ---- 12b macro: the metal button inside the hole
export const S12b: React.FC<T> = ({ t }) => {
  const a = CUT[12], b = CUT[13], flap = smooth((t - a - 0.05) / 0.5), cap = smooth((t - W(E, "tombol") + 0.1) / 0.3);
  return (
    <Shot t={t} a={a} b={b} from={{ x: -40, y: 16, z: 1.0 }} to={{ x: 30, y: -10, z: 1.3 }}>
      <Bench t={t} lx={540} />
      <Layer d={1}><Handle x={540 - 395 * 2.05 * Math.cos(0.16)} y={940 + 395 * 2.05 * Math.sin(0.16)} s={2.05} rot={-9} off={900} flap={0.6 * flap} cap={cap} blade={false} guard={false} /></Layer>
      <Layer d={1.02}><Glow x={540} y={940} r={260} color="#fff6da" o={0.16 * cap} /></Layer>
      <Layer d={1}><Pool x={540} y={980} rx={840} ry={1060} o={0.72} hold={54} /></Layer>
      <Layer d={1.3}><Dust t={t} seed="s12b" n={30} /></Layer>
    </Shot>
  );
};
// ---- 13a cross-section: finger presses, spring compresses, contacts meet
export const S13: React.FC<T> = ({ t }) => {
  const a = CUT[13], b = CUT[14], p = smooth((t - W(E, "tekan")) / 0.4) * (0.94 + 0.06 * Math.sin(t * 8)), p2 = smooth((t - W(E, "kelingking") + 0.1) / 0.35);
  const dy = 74 * Math.max(p * 0.72, p2);
  const spring = Array.from({ length: 13 }, (_, i) => `${i % 2 ? 450 : 630},${1000 + dy + i * ((130 - dy) / 12)}`).join(" ");
  return (
    <Shot t={t} a={a} b={b} from={{ x: -50, y: 30, z: 1.16 }} to={{ x: 50, y: -10, z: 1.0 }}>
      <Layer d={0.3}><Plane tex={TEX.plaster} tint="#5c6470" light="radial-gradient(ellipse 800px 860px at 1040px 1250px, #fff, #77808c 45%, #15181c 100%)" /><Blinds t={t} x={-100} y={260} w={1300} h={1000} o={0.2} /></Layer>
      <Layer d={1}>
        <Svg>
          <defs>
            <pattern id="hat13" width={26} height={26} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width={26} height={26} fill="#b9b2a2" /><rect width={7} height={26} fill="#8d8678" /></pattern>
            <linearGradient id="cav13" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#101216" /><stop offset="1" stopColor="#2c3138" /></linearGradient>
          </defs>
          <path d="M-300 880 H1400 V2200 H-300 Z" fill="url(#hat13)" /><path d="M-300 880 H1400" stroke="#f6efdd" strokeWidth={8} />
          <path d="M360 878 H720 V1230 H360 Z" fill="url(#cav13)" stroke="#f1ead7" strokeWidth={8} />
          {/* leather skin bends under the finger */}
          <path d={`M-300 862 H300 Q360 ${862} 420 ${862 + dy} H670 Q720 862 780 862 H1400`} stroke="#3a342c" strokeWidth={40} fill="none" /><path d={`M-300 848 H300 Q360 848 420 ${848 + dy} H670 Q720 848 780 848 H1400`} stroke="#8b8170" strokeWidth={6} fill="none" strokeDasharray="22 12" />
          <polyline points={spring} fill="none" stroke="#e8e1cf" strokeWidth={13} strokeLinejoin="round" />
          <rect x={430} y={1130} width={220} height={26} fill={p2 > 0.9 ? C.red : "#d8d0bd"} /><rect x={500} y={1156} width={80} height={76} fill="#9b9484" />
          <rect x={516} y={960 + dy} width={48} height={100} fill="#e9e2d0" />
        </Svg>
        <Img src={P.button} style={{ position: "absolute", left: 428, top: 872 + dy, width: 224, height: 150, objectFit: "fill", transform: "rotate(-90deg) scale(1,1.25)", filter: "brightness(1.1)" }} />
        <Img src={P.finger} style={{ position: "absolute", left: 358, top: 382 + dy * p, width: 172, transformOrigin: "50% 100%", transform: "rotate(-5deg)", filter: "brightness(2.3) drop-shadow(0 20px 18px rgba(0,0,0,0.7))" }} />
        <Img src={P.finger} style={{ position: "absolute", left: lerp(1180, 548, p2), top: lerp(330, 400, p2) + dy * p2, width: 160, transformOrigin: "50% 100%", transform: "rotate(5deg)", filter: "brightness(2.1) drop-shadow(0 20px 18px rgba(0,0,0,0.7))" }} />
        <Glow x={540} y={1140} r={320} color={C.red} o={0.85 * seg(p2, 0.85, 1)} />
        <Glow x={540} y={1140} r={110} color="#ffe6dc" o={0.9 * seg(p2, 0.85, 1)} />
      </Layer>
      <Layer d={1}><Pool x={540} y={940} rx={800} ry={1000} o={0.78} hold={44} /></Layer>
      <Layer d={1.3}><Dust t={t} seed="s13" n={30} /></Layer>
    </Shot>
  );
};
// ---- 13b the whole trick: two fingers, button, current, lamp
export const S13b: React.FC<{ t: number; a?: number; b?: number }> = ({ t, a = CUT[14], b = CUT[15] }) => {
  const c0 = W(E, "sirkuit"), cur = lin(t, c0, W(E, "lampu")), on = lit(t, W(E, "menyala") - 0.1);
  const pr = 0.8 + 0.2 * Math.sin(t * 6);
  const fing = (x: number, y: number, w: number, r: number, br: number) => <Img src={P.finger} style={{ position: "absolute", left: x, top: y, width: w, transform: `rotate(${r}deg)`, filter: `brightness(${br}) drop-shadow(14px 26px 16px rgba(0,0,0,0.65))` }} />;
  return (
    <Shot t={t} a={a} b={b} from={{ x: 30, y: -30, z: 1.14 }} to={{ x: -30, y: 20, z: 1.0 }} shakeAt={W(E, "menyala") - 0.1}>
      <Bench t={t} lx={520} d={0.55} />
      <Layer d={0.75}>
        <Lamp x={770} y={660} w={290} on={on} spread={2.6} />
        <Current d="M1300 960 Q1180 960 1100 910 Q1010 840 900 846 L776 846" k={seg(cur, 0.6, 1)} t={t} w={11} />
      </Layer>
      <Layer d={1}>
        <Handle x={120} y={985} s={0.98} off={0} flap={0.82} cap={1} pressed={pr} />
        <Current d="M505 989 L760 989 L1300 977" k={seg(cur, 0, 0.6)} t={t} w={8} />
        <Glow x={506} y={989} r={150} color={C.red} o={0.75 * cur} />
        {fing(330, 1003 + 8 * (1 - pr), 112, 196, 2.4)}
        {fing(470, 1005 + 8 * (1 - pr), 118, 172, 2.6)}
      </Layer>
      <Layer d={1}><Pool x={540} y={960} rx={840} ry={1060} o={0.72} hold={54} /></Layer>
      <Layer d={1.3}><Dust t={t} seed="s13b" n={34} /></Layer>
      <div style={{ position: "absolute", inset: 0, background: C.red, mixBlendMode: "soft-light", opacity: 0.36 * on }} />
    </Shot>
  );
};
// ---- 14 denial: seated silhouette under a swinging lamp
const SIT: Pose = { hip: [0, -232], lean: 10, hand: [170, -300], rear: [120, -290], footF: [190, 0], footB: [150, 0], noSword: true, head: 8 };
export const S14: React.FC<T> = ({ t }) => {
  const a = CUT[15], b = CUT[16], sw = Math.sin((t - a) * 2.4) * 11, rr = (sw * Math.PI) / 180, lx = 540 - Math.sin(rr) * 360, ly = 260 + Math.cos(rr) * 330;
  return (
    <Shot t={t} a={a} b={b} from={{ x: 46, y: 10, z: 1.0 }} to={{ x: -46, y: -20, z: 1.18 }}>
      <Layer d={0.2}><Plane tex={TEX.brick} tint="#333b46" size={950} light={`radial-gradient(ellipse 640px 760px at ${lx + 500}px 1300px, #fff, #566070 48%, #0f1115 100%)`} /></Layer>
      <Layer d={0.6}>
        <Svg><line x1={540} y1={-200} x2={lx} y2={ly - 40} stroke="#0b0c0f" strokeWidth={9} /><path d={`M-120 40 Q-110 -50 0 -62 Q110 -50 120 40 Z`} transform={`translate(${lx} ${ly}) rotate(${sw})`} fill="#1b1f25" stroke="#8d98a6" strokeWidth={5} /></Svg>
        <Glow x={lx} y={ly + 46} r={130} color="#fff1c8" o={0.95} /><Beam x={lx} y={ly + 40} len={1050} w0={180} w1={900} deg={sw} o={0.62} blur={16} /><Smoke t={t} x={-300} y={560} w={1600} o={0.3} />
      </Layer>
      <Layer d={1}>
        <div style={{ position: "absolute", left: -500, top: 1176, width: 2080, height: 900, background: "linear-gradient(180deg,#333a43,#0a0b0e 60%)" }} />
        <Glow x={lx} y={1236} r={520} ry={110} o={0.6} />
        <Svg style={{ top: -54 }}>
          <g transform="translate(540 1290) scale(0.86) translate(-540 -1290)">
          <ellipse cx={540} cy={1290} rx={330} ry={34} fill="#000" opacity={0.7} style={{ filter: "blur(12px)" }} />
          <path d="M420 1290 V1010 M412 720 V1030 H600 M590 1020 V1290" stroke="#121418" strokeWidth={22} fill="none" /><path d="M403 720 V1010" stroke="#a3bfdb" strokeWidth={4} opacity={0.8} />
          <Fencer x={500} y={1288} s={1.12} pose={SIT} tone={0.62 + 0.2 * Math.sin((t - a) * 2.4)} rim={0.95} shadow={0} />
          </g>
        </Svg>
      </Layer>
      <Layer d={1}><Pool x={lx} y={940} rx={600} ry={720} o={0.9} hold={32} /></Layer>
      <Layer d={1.7} blur={12}><Svg><path d="M-300 1560 H700 V2100 H-300 Z" fill="#08090c" /><path d="M-300 1560 H700" stroke="#ffe3a0" strokeWidth={8} opacity={0.6} /></Svg></Layer>
      <Layer d={1.3}><Dust t={t} seed="s14" /></Layer>
    </Shot>
  );
};
// ---- 15 line-up
export const S15: React.FC<T> = ({ t }) => {
  const a = CUT[16], b = CUT[17], k = smooth((t - W(Y, "kidal") + 0.3) / 0.35), mates = smooth((t - W(Y, "semua")) / 0.3);
  const sx = lerp(300, 800, k);
  const right: Pose = { ...STAND, hand: [150, -440], sword: -62 };
  return (
    <Shot t={t} a={a} b={b} from={{ x: -60, y: 0, z: 1.02 }} to={{ x: 60, y: 0, z: 1.12 }}>
      <Layer d={0.5}>
        <Plane tex={TEX.plaster} tint="#6d757f" light={`radial-gradient(ellipse 640px 900px at ${sx + 500}px 1300px, #fff, #79818c 45%, #191c21 100%)`} />
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{ position: "absolute", left: -500, top: 520 + i * 130, width: 2080, height: i % 2 ? 5 : 10, background: "#15181c", opacity: 0.6 }} />)}
        <div style={{ position: "absolute", left: -500, top: 1240, width: 2080, height: 900, background: "linear-gradient(180deg,#4a525c,#0c0d10 55%)" }} />
      </Layer>
      <Layer d={0.8}><Beam x={sx} y={-40} len={1380} w0={60} w1={520} o={0.55} /></Layer>
      <Layer d={1}>
        <Glow x={sx} y={1290} r={330} ry={80} o={0.6} />
        <Svg>
          <Fencer x={170} y={1240} s={0.72} pose={right} tone={0.3 + 0.28 * mates} rim={0.8} />
          <Fencer x={460} y={1240} s={0.72} pose={{ ...right, sword: -58 }} tone={0.3 + 0.28 * mates} rim={0.8} />
          <Fencer x={860} y={1240} s={0.78} flip pose={{ ...right, hand: [170, -470 + wob(t, 3, 10)], sword: -64 }} tone={lerp(0.3, 1, k)} rim={0.8} />
        </Svg>
        <Svg style={{ opacity: k }}><circle cx={727} cy={874} r={92} fill="none" stroke={C.bone} strokeWidth={9} strokeDasharray="30 14" strokeDashoffset={-t * 60} /></Svg>
      </Layer>
      <Layer d={1}><Pool x={sx} y={960} rx={620} ry={740} o={0.82} hold={36} /></Layer>
      <Layer d={1.3}><Dust t={t} seed="s15" /></Layer>
    </Shot>
  );
};
// ---- 16 gavel
export const S16: React.FC<T> = ({ t }) => {
  const a = CUT[17], b = CUT[18], hit = W(Y, "kasus"), dn = clamp((t - hit + 0.16) / 0.16), back = clamp((t - hit) / 0.5);
  const ang = -46 + 46 * dn * dn - 7 * Math.sin(back * Math.PI) * (t > hit ? 1 : 0) - 8 * seg(t, a, hit - 0.2) * (1 - dn);
  return (
    <Shot t={t} a={a} b={b} from={{ x: 30, y: 20, z: 1.0 }} to={{ x: -30, y: -10, z: 1.2 }} shakeAt={hit}>
      <Layer d={0.2}><Plane tex={TEX.plaster} tint="#39414c" light="radial-gradient(ellipse 800px 900px at 1040px 1250px, #fff, #5d6571 45%, #111317 100%)" /><Blinds t={t} x={-100} y={240} w={1300} h={1000} o={0.4} /></Layer>
      <Layer d={0.4}><Beam x={820} y={-60} len={1600} w0={60} w1={700} deg={14} o={0.5} /><Smoke t={t} x={-200} y={600} w={1500} o={0.3} /></Layer>
      <Layer d={1}>
        <Plane tex={TEX.wood} x={-500} y={1180} w={2080} h={1000} tint="#5b4f40" size={800} light="radial-gradient(ellipse 700px 420px at 1000px 70px, #fff, #777 50%, #141416 100%)" />
        <Svg>
          <defs>
            <linearGradient id="wd13" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6f5f4a" /><stop offset="0.22" stopColor="#e6d3ac" /><stop offset="0.5" stopColor="#7c6748" /><stop offset="0.85" stopColor="#211a12" /><stop offset="1" stopColor="#6f8296" /></linearGradient>
            <linearGradient id="wd13b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#241d14" /><stop offset="0.3" stopColor="#e6d3ac" /><stop offset="0.6" stopColor="#7c6748" /><stop offset="1" stopColor="#15110c" /></linearGradient>
          </defs>
          <ellipse cx={420} cy={1240} rx={300} ry={40} fill="#000" opacity={0.75} style={{ filter: "blur(10px)" }} />
          <path d="M210 1130 H630 V1200 Q420 1270 210 1200 Z" fill="url(#wd13b)" /><ellipse cx={420} cy={1130} rx={210} ry={46} fill="#c8b48a" /><ellipse cx={420} cy={1130} rx={176} ry={36} fill="#8f7a56" />
          <g transform={`translate(1060 960) rotate(${-ang})`}>
            <g transform="translate(-1060 -960)">
              <rect x={470} y={930} width={760} height={56} rx={26} fill="url(#wd13)" />
              <g transform="rotate(-2 420 960)"><rect x={290} y={820} width={260} height={280} rx={34} fill="url(#wd13b)" /><rect x={276} y={850} width={288} height={30} fill="url(#wd13b)" stroke="#1a140d" strokeWidth={3} /><rect x={276} y={1040} width={288} height={30} fill="url(#wd13b)" stroke="#1a140d" strokeWidth={3} /></g>
            </g>
          </g>
          {t > hit && [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const k = clamp((t - hit) / 0.45), an = Math.PI + (i / 7) * Math.PI; return <line key={i} x1={420 + Math.cos(an) * (230 + 120 * k)} y1={1120 + Math.sin(an) * (70 + 60 * k)} x2={420 + Math.cos(an) * (260 + 260 * k)} y2={1120 + Math.sin(an) * (90 + 150 * k)} stroke={C.bone} strokeWidth={8} opacity={1 - k} />; })}
        </Svg>
      </Layer>
      <Layer d={1}><Pool x={500} y={960} rx={680} ry={700} o={0.86} hold={36} /></Layer>
      <Layer d={1.3}><Dust t={t} seed="s16" /></Layer>
    </Shot>
  );
};
// ---- 17 results sheet struck out
export const S17: React.FC<T> = ({ t }) => {
  const a = CUT[18], b = CUT[19], s1 = seg(t, W(Y, "dihapus"), W(Y, "dihapus") + 0.5), s2 = seg(t, W(Y, "gugur") - 0.1, W(Y, "gugur") + 0.3);
  const row = (i: number, name: string, k: number) => (
    <div key={i} style={{ position: "absolute", left: 60, top: 200 + i * 150, width: 660, height: 120, borderBottom: "4px solid #8a8577", fontFamily: F_LABEL, fontWeight: 800, fontSize: 60, lineHeight: "120px", color: "#1a1c1f" }}>
      {name}
      <div style={{ position: "absolute", right: 0, top: 52, width: 150, height: 18, background: "#55534c" }} />
      <div style={{ position: "absolute", left: -16, top: 54, height: 20, width: 690 * k, background: "#0d0e10", transform: "rotate(-1.2deg)" }} />
    </div>
  );
  return (
    <Shot t={t} a={a} b={b} from={{ x: 60, y: 20, z: 1.0, r: 2 }} to={{ x: -50, y: -20, z: 1.15, r: -2 }}>
      <Layer d={0.5}><Plane tex={TEX.wood} tint="#7a7063" light="radial-gradient(ellipse 980px 1150px at 1060px 1300px, #fff, #777 50%, #141518 100%)" /><Blinds t={t} x={-200} y={200} w={1500} h={1500} o={0.3} skew={-18} /></Layer>
      <Layer d={1}>
        <div style={{ position: "absolute", left: 150, top: 500, width: 780, height: 770, background: "#ece5d3", backgroundImage: `url(${TEX.paper})`, backgroundBlendMode: "multiply", boxShadow: "0 40px 60px rgba(0,0,0,0.75)", transform: "rotate(-2.5deg)" }}>
          <div style={{ position: "absolute", left: 60, top: 44, fontFamily: F_LABEL, fontWeight: 800, fontSize: 58, letterSpacing: 3, color: "#1a1c1f" }}>HASIL BEREGU</div>
          <div style={{ position: "absolute", right: 50, top: 56, fontFamily: F_LABEL, fontWeight: 800, fontSize: 42, letterSpacing: 4, color: "#5c594f" }}>ARSIP AUDIRA</div>
          <div style={{ position: "absolute", left: 60, right: 60, top: 136, height: 8, background: "#1a1c1f" }} />
          {row(0, "ONISHCHENKO", s1)}{row(1, "REKAN SATU", s2)}{row(2, "REKAN DUA", s2)}
        </div>
      </Layer>
      <Layer d={1.2}><Svg><g transform={`translate(${lerp(120, 900, s1 < 1 ? s1 : s2)} ${s1 < 1 ? 800 : 1020}) rotate(38)`}><rect x={-16} y={-420} width={40} height={400} rx={14} fill="#15171b" /><rect x={-12} y={-416} width={9} height={390} fill="#a3bfdb" opacity={0.8} /><path d="M-16 -20 L24 -20 L4 30 Z" fill="#cfd5db" /></g></Svg></Layer>
      <Layer d={1}><Pool x={540} y={940} rx={800} ry={1000} o={0.78} hold={46} /></Layer>
      <Layer d={1.3}><Dust t={t} seed="s17" n={30} /></Layer>
    </Shot>
  );
};
// ---- 18 mask on the hook, the light goes out
export const S18: React.FC<T> = ({ t }) => {
  const a = CUT[19], b = CUT[20], off = seg(t, W(Y, "seumur") - 0.1, W(Y, "hidup") + 0.2), sw = Math.sin((t - a) * 2.6) * 4;
  return (
    <Shot t={t} a={a} b={b} from={{ x: -30, y: 20, z: 1.24 }} to={{ x: 30, y: 0, z: 1.02 }}>
      <Layer d={0.4}><Plane tex={TEX.brick} tint="#4a525d" size={1000} light="radial-gradient(ellipse 620px 760px at 1040px 1270px, #fff, #66707d 45%, #111317 100%)" /><Blinds t={t} x={-160} y={240} w={1400} h={1200} o={0.42 * (1 - 0.8 * off)} /></Layer>
      <Layer d={0.7}><Beam x={860} y={-40} len={1500} w0={60} w1={640} deg={14} o={0.55 * (1 - 0.85 * off)} /></Layer>
      <Layer d={1}>
        <div style={{ position: "absolute", left: 330, top: 640, width: 520, height: 660, background: "radial-gradient(closest-side, rgba(0,0,0,0.85), transparent)" }} />
        <div style={{ position: "absolute", left: 305, top: 560, transformOrigin: "240px -20px", transform: `rotate(${sw}deg)`, filter: `brightness(${1.3 - 0.75 * off})` }}>
          <svg viewBox="-115 -125 230 330" width={470} height={674} style={{ display: "block" }}><MaskG tone={0.95} rim={1} /></svg>
        </div>
        <Svg><path d="M540 500 V590 Q540 630 580 630" stroke="#cfd5db" strokeWidth={16} fill="none" strokeLinecap="round" /><circle cx={540} cy={500} r={30} fill="#59626d" stroke="#e7ebef" strokeWidth={5} /></Svg>
      </Layer>
      <Layer d={1}><Pool x={540} y={860} rx={560} ry={680} o={0.92} hold={30 - 6 * off} /></Layer>
      <Layer d={1.3}><Dust t={t} seed="s18" /></Layer>
    </Shot>
  );
};
// ---- 19 podium
export const S19: React.FC<T> = ({ t }) => {
  const a = CUT[20], b = CUT[21];
  const up = (d: number) => smooth((t - a - 0.4 - d) / 0.4);
  const p = (d: number): Pose => mix(STAND, { ...STAND, hand: [120, -930 + wob(t + d, 8, 16)], rear: [-130, -930 + wob(t + d, 7, 16)] }, up(d));
  return (
    <Shot t={t} a={a} b={b} from={{ x: 0, y: 40, z: 1.0 }} to={{ x: 0, y: -30, z: 1.1 }}>
      <Arena t={t} seed="s19" spot={540} beams={[220, 540, 860]} banner={[540, 760]} fgSide="none" pool={{ y: 900, rx: 720, ry: 800, o: 0.75 }}>
        <Svg>
          <Fencer x={280} y={1080} s={0.5} pose={{ ...p(0.2), noSword: true }} tone={0.82} rim={0.8} />
          <Fencer x={800} y={1080} s={0.5} flip pose={{ ...p(0.35), noSword: true }} tone={0.82} rim={0.8} />
          <Fencer x={540} y={1080} s={0.54} pose={{ ...p(0), noSword: true }} tone={1} rim={0.8} />
        </Svg>
        <div style={{ position: "absolute", left: 120, top: 1078, width: 840, height: 170, background: "linear-gradient(180deg,#ece6d6,#8f8c84 30%,#3a3d42)", boxShadow: "0 30px 50px rgba(0,0,0,0.7)" }}><div style={{ position: "absolute", inset: 0, backgroundImage: `url(${TEX.plaster})`, mixBlendMode: "overlay" }} /><div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F_LABEL, fontWeight: 800, fontSize: 110, color: "#16181b" }}>1</div></div>
      </Arena>
      <Layer d={1.5}><Svg>{Array.from({ length: 34 }, (_, i) => { const x = (i * 197) % 1180 - 40, y = ((i * 331 + (t - a) * (190 + (i % 5) * 50)) % 1400) + 60; return <rect key={i} x={x} y={y} width={16} height={9} fill={i % 3 ? C.bone : C.key} opacity={0.75} transform={`rotate(${(t * 160 + i * 40) % 360} ${x} ${y})`} />; })}</Svg></Layer>
    </Shot>
  );
};
// ---- 20 Parker and the question
export const S20: React.FC<T> = ({ t }) => {
  const up = smooth((t - W(O, "parker") + 0.1) / 0.5);
  const pose = mix({ ...STAND, sword: 64 }, { ...STAND, rear: [-80 + wob(t, 6, 14), -960], sword: 64, lean: -3 }, up);
  return (
    <>
      <Shot t={t} a={CUT[21]} b={CUT[22]} from={{ x: 50, y: -20, z: 1.0 }} to={{ x: -40, y: 10, z: 1.14 }}>
        <Arena t={t} seed="s20" spot={540} beams={[540]} banner={[540, 830]} lamp={[860, 690, 150]} red={0.9 * lit(t, W(O, "berani"))} fgSide="l" pool={{ y: 940, rx: 560, ry: 740 }}>
          <Fig x={540} y={1236} s={0.76} pose={pose} tone={0.95} rim={0.7} />
        </Arena>
      </Shot>
      <Shot t={t} a={CUT[22]} b={99} from={{ x: -50, y: 0, z: 1.0 }} to={{ x: 110, y: 0, z: 1.3 }}>
        <Arena t={t} seed="s21" spot={620} beams={[620]} banner={[540, 452]} fgSide="r" pool={{ y: 900, rx: 620, ry: 740 }}>
          <Fig x={560} y={1760} s={1.5} pose={{ ...EN_GARDE, sword: -50, hand: [180, -600 + wob(t, 2, 8)] }} tone={0.95} rim={0.8} />
        </Arena>
      </Shot>
    </>
  );
};
