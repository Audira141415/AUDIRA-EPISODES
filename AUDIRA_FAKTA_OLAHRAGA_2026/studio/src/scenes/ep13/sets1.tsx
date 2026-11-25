// EP13 shots 1-11 (hook, context, development). Boris always stands right facing left (left-handed), opponents left.
import React from "react";
import { Img } from "remotion";
import { Beam, C, Dust, EN_GARDE, F_LABEL, Fencer, Fig, Glow, LUNGE, Layer, Limb, MaskG, PROTEST, Plane, STAND, Shot, Smoke, Svg, TEX, W, clamp, lerp, lin, mix, pop, seg, smooth, type Pose } from "./lib.tsx";
import { Arena, Blinds, CUT, Current, Floor, Handle, Lamp, P, Pool, Tip, lit, wob } from "./kit.tsx";

type T = { t: number };
const K = "konteks", D = "pengembangan";
/** Jacket torso in macro, lit from upper right (hook, circuit). */
const Torso: React.FC<{ red?: number }> = ({ red = 0 }) => (
  <>
    <Svg>
      <defs>
        <linearGradient id="tor13" x1="0" y1="0" x2="1" y2="0.25"><stop offset="0" stopColor="#0c0d10" /><stop offset="0.42" stopColor="#4a4a48" /><stop offset="0.78" stopColor="#d8d3c4" /><stop offset="0.95" stopColor="#f6f0de" /><stop offset="1" stopColor="#8f9aa6" /></linearGradient>
        <clipPath id="torc13"><path d="M-400 420 L120 470 Q250 520 300 640 Q372 800 366 980 Q352 1200 300 1420 L270 2100 L-400 2100 Z" /></clipPath>
      </defs>
      <path d="M-400 420 L120 470 Q250 520 300 640 Q372 800 366 980 Q352 1200 300 1420 L270 2100 L-400 2100 Z" fill="url(#tor13)" />
      <g clipPath="url(#torc13)">
        <image href={TEX.cloth} x={-400} y={400} width={800} height={1700} preserveAspectRatio="xMidYMid slice" style={{ mixBlendMode: "overlay" }} opacity={0.95} />
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${-60 + i * 12} ${700 + i * 170} Q160 ${660 + i * 170} 350 ${760 + i * 165}`} stroke="#1a1a1a" strokeOpacity={0.3} strokeWidth={15} fill="none" style={{ filter: "blur(5px)" }} />)}
        <path d="M60 470 Q150 900 90 1500 L80 2100" stroke="#1d1d1d" strokeOpacity={0.6} strokeWidth={6} fill="none" /><path d="M82 470 Q172 900 112 1500 L102 2100" stroke="#fff" strokeOpacity={0.2} strokeWidth={4} strokeDasharray="16 10" fill="none" />
        <rect x={-400} y={400} width={900} height={1700} fill={C.red} opacity={0.26 * red} style={{ mixBlendMode: "multiply" }} />
        <path d="M120 470 Q250 520 300 640 Q372 800 366 980 Q352 1200 300 1420" stroke={red > 0.3 ? "#ff8a80" : "#ffffff"} strokeWidth={10} fill="none" opacity={0.7} style={{ filter: "blur(3px)" }} />
      </g>
    </Svg>
  </>
);

// ---- 1 hook: blade from the right stops short of the chest, the lamp still lights
export const S1: React.FC<T> = ({ t }) => {
  const a = CUT[0], b = CUT[1];
  const thrust = 1 - Math.pow(1 - clamp(t / 0.7), 3);
  const tipX = lerp(900, 486, thrust) + wob(t, 3.1, 5) + 34 * seg(t, 2.2, 3.5);
  const red = lit(t, W("hook", "lampu"));
  const gap = seg(t, 0.75, 1.0);
  return (
    <Shot t={t} a={a} b={b} from={{ x: 46, y: 20, z: 1.16 }} to={{ x: -34, y: -16, z: 1.04 }}>
      <Layer d={0.15}><Plane tex={TEX.brick} tint="#39414c" size={1000} light="radial-gradient(ellipse 900px 900px at 1120px 1200px, #fff, #596270 45%, #121418 100%)" /></Layer>
      <Layer d={0.3} blur={3}><div style={{ position: "absolute", left: -400, top: 960, width: 1900, height: 560, backgroundImage: `url(${TEX.crowd})`, backgroundSize: "760px auto", mixBlendMode: "screen", filter: "brightness(2)" }} /></Layer>
      <Layer d={0.4}><Smoke t={t} x={-200} y={500} w={1600} o={0.4} /><Beam x={1010} y={-60} len={1700} w0={60} w1={760} deg={24} o={0.55} /></Layer>
      <Layer d={0.6}><Lamp x={610} y={690} w={300} on={red} spread={2.7} /></Layer>
      <Layer d={1}><Torso red={red} /></Layer>
      <Layer d={1.12}>
        <Glow x={tipX + 60} y={1040} r={330} o={0.28} />
        <Tip x={tipX} y={1040} s={1.15} flip />
        <Svg style={{ opacity: gap }}>
          <line x1={366} y1={950} x2={366} y2={1150} stroke={C.bone} strokeWidth={5} strokeDasharray="16 12" /><line x1={tipX - 2} y1={950} x2={tipX - 2} y2={1150} stroke={C.bone} strokeWidth={5} strokeDasharray="16 12" />
          <path d={`M374 1180 H${tipX - 10} M392 1164 L374 1180 L392 1196 M${tipX - 28} 1164 L${tipX - 10} 1180 L${tipX - 28} 1196`} stroke={C.bone} strokeWidth={7} fill="none" />
        </Svg>
      </Layer>
      <Layer d={1}><Pool x={520} y={900} rx={760} ry={900} o={0.8} hold={40} /></Layer>
      <Layer d={1.8} blur={16}><Svg><path d="M1300 1500 Q1120 1380 980 1480 Q820 1600 800 2100 L1400 2100 Z" fill="#07080b" /><path d="M1200 1440 Q1080 1400 980 1480 Q850 1580 820 1800" stroke="#a3bfdb" strokeWidth={10} fill="none" opacity={0.7} /></Svg></Layer>
      <Layer d={1.4}><Dust t={t} seed="s1" /></Layer>
      <div style={{ position: "absolute", inset: 0, background: C.red, mixBlendMode: "soft-light", opacity: 0.4 * red }} />
    </Shot>
  );
};

// ---- 2 archive folder
export const S2: React.FC<T> = ({ t }) => {
  const a = CUT[1], b = CUT[2];
  const open = smooth((t - a - 0.1) / 0.9);
  return (
    <Shot t={t} a={a} b={b} from={{ x: -70, y: 30, z: 1.02, r: -3 }} to={{ x: 60, y: -20, z: 1.14, r: 2 }}>
      <Layer d={0.5}><Plane tex={TEX.wood} tint="#857b6c" size={900} light="radial-gradient(ellipse 980px 1150px at 1060px 1280px, #fff, #777 50%, #17181b 100%)" /><Blinds t={t} x={-200} y={200} w={1500} h={1500} o={0.3} skew={-18} /></Layer>
      <Layer d={1}>
        <div style={{ position: "absolute", left: 180, top: 540, width: 740, height: 700, perspective: 2200, transform: "rotate(-4deg)" }}>
          <div style={{ position: "absolute", inset: 0, background: "#8f8a7c", backgroundImage: `url(${TEX.paper})`, backgroundBlendMode: "multiply", boxShadow: "0 50px 60px rgba(0,0,0,0.75)" }} />
          <div style={{ position: "absolute", left: 34, top: 26, width: 660, height: 640, background: "#efe9d9", backgroundImage: `url(${TEX.paper})`, backgroundBlendMode: "multiply", boxShadow: "0 10px 20px rgba(0,0,0,0.5)", transform: "rotate(1.6deg)" }}>
            <div style={{ position: "absolute", left: 40, top: 40, width: 250, height: 300, background: "linear-gradient(135deg,#5a626c,#15181c)", border: "12px solid #fbf7ea", boxShadow: "0 8px 16px rgba(0,0,0,0.5)", overflow: "hidden" }}><svg viewBox="-115 -125 230 330" width={226} height={280} style={{ position: "absolute", left: 0, top: 14 }}><MaskG tone={0.9} /></svg></div>
            <div style={{ position: "absolute", left: 330, top: 44, fontFamily: F_LABEL, fontWeight: 800, fontSize: 62, lineHeight: 1.05, color: "#17191c" }}>PEDANG<br />BUKTI</div>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} style={{ position: "absolute", left: i < 3 ? 330 : 40, top: 216 + i * 48 + (i > 2 ? 30 : 0), width: (i < 3 ? 270 : 560) * (0.72 + 0.28 * Math.abs(Math.sin(i * 2.3))), height: 15, background: "#4a4a48", opacity: 0.7 }} />)}
          </div>
          <div style={{ position: "absolute", inset: 0, transformOrigin: "0 50%", transform: `rotateY(${-150 * open}deg)`, background: "#b5ae9c", backgroundImage: `url(${TEX.paper})`, backgroundBlendMode: "multiply", boxShadow: "0 20px 40px rgba(0,0,0,0.6)", backfaceVisibility: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F_LABEL, fontWeight: 800, fontSize: 92, letterSpacing: 8, color: "#1d1f22" }}>ARSIP AUDIRA</div>
        </div>
      </Layer>
      <Layer d={1}><Pool x={560} y={920} rx={800} ry={1000} o={0.78} hold={44} /></Layer>
      <Layer d={1.6} blur={12}><Svg><circle cx={960} cy={1560} r={260} fill="none" stroke="#0a0b0e" strokeWidth={70} /><path d="M800 1400 A260 260 0 0 1 1010 1306" stroke="#a3bfdb" strokeWidth={14} fill="none" opacity={0.8} /></Svg></Layer>
      <Layer d={1.3}><Dust t={t} seed="s2" n={30} /></Layer>
    </Shot>
  );
};

// ---- 3 Boris steps into the light
export const S3: React.FC<T> = ({ t }) => {
  const a = CUT[2], b = CUT[3], k = smooth((t - a) / 1.5);
  const step = Math.sin((t - a) * 7) * (1 - k);
  const pose = mix({ ...STAND, footF: [44 + 70 * step, 0], footB: [-44 - 70 * step, 0] }, { ...EN_GARDE, sword: -14 }, smooth((t - a - 1.2) / 0.9));
  return (
    <Shot t={t} a={a} b={b} from={{ x: 60, y: -30, z: 1 }} to={{ x: -10, y: 0, z: 1.12 }}>
      <Arena t={t} seed="s3" spot={600} beams={[600]} banner={[250, 800]} fgSide="r" pool={{ rx: 520, ry: 700, y: 980 }}>
        <Fig x={lerp(930, 640, k)} y={1240} s={0.8} flip pose={pose} tone={lerp(0.35, 0.86, k)} rim={0.7} />
      </Arena>
    </Shot>
  );
};

// ---- 4 five events on light boxes
const RUN: Pose = { hip: [0, -410], lean: 14, hand: [170, -640], rear: [-190, -520], footF: [210, -150], footB: [-230, -60], noSword: true };
export const S4: React.FC<T> = ({ t }) => {
  const a = CUT[3], b = CUT[4];
  const at = [0, 1, 2, 3].map((i) => a + 0.1 + i * 0.24).concat(W(K, "anggar"));
  const box = (i: number, x: number, y: number, w: number, h: number, kids: React.ReactNode) => {
    const on = seg(t, at[i], at[i] + 0.18), hero = i === 4;
    return (
      <div key={i} style={{ position: "absolute", left: x, top: y, width: w, height: h, background: "#14171b", border: "12px solid #2c323a", boxShadow: `0 24px 40px rgba(0,0,0,0.7), 0 0 ${110 * on}px rgba(255,227,160,${hero ? 0.6 : 0.16})`, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: on * (hero ? 1 : 0.42), background: "radial-gradient(ellipse at 50% 40%, #fff3cf, #c9b27a 60%, #57492c)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${TEX.plaster})`, mixBlendMode: "overlay", opacity: 0.6 }} />
        <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ position: "absolute", left: -12, top: -12, opacity: 0.35 + 0.65 * on }}>{kids}</svg>
      </div>
    );
  };
  const ink = "#0b0c0f";
  return (
    <Shot t={t} a={a} b={b} from={{ x: -60, y: 10, z: 1.0 }} to={{ x: 60, y: 10, z: 1.08 }}>
      <Layer d={0.3}><Plane tex={TEX.plaster} tint="#323a44" light="radial-gradient(ellipse 900px 900px at 1040px 1300px, #fff, #5d6570 50%, #121418 100%)" /></Layer>
      <Layer d={1}>
        {box(0, 80, 480, 440, 220, <><path d="M110 210 Q120 130 170 96 L176 60 L206 84 Q262 100 300 160 L286 186 L244 176 L220 168 Q206 190 214 210 Z" fill={ink} /></>)}
        {box(1, 560, 480, 440, 220, <>{[86, 60, 34].map((r, i) => <circle key={r} cx={220} cy={110} r={r} fill={i % 2 ? "#d8c690" : ink} />)}<circle cx={220} cy={110} r={12} fill={ink} /></>)}
        {box(2, 80, 730, 440, 220, <><circle cx={250} cy={84} r={28} fill={ink} /><path d="M90 128 L160 76 Q206 80 236 120" stroke={ink} strokeWidth={24} fill="none" strokeLinecap="round" />{[140, 176].map((y, i) => <path key={y} d={`M40 ${y} q45 -30 90 0 t90 0 t90 0 t90 0`} stroke={ink} strokeWidth={14} fill="none" transform={`translate(${Math.sin(t * 2 + i) * 14} 0)`} />)}</>)}
        {box(3, 560, 730, 440, 220, <g style={{ filter: "brightness(0.12)" }}><Fencer x={220} y={208} s={0.23} pose={RUN} shadow={0} /></g>)}
        {box(4, 80, 980, 920, 300, <g style={{ filter: "brightness(0.16) contrast(1.4)" }}><Fencer x={690} y={278} s={0.31} flip pose={mix(EN_GARDE, LUNGE, 0.5 + 0.5 * Math.sin(t * 4))} shadow={0} /><Fencer x={215} y={278} s={0.31} pose={EN_GARDE} shadow={0} /></g>)}
      </Layer>
      <Layer d={1}><Glow x={540} y={1130} r={620} ry={320} o={0.32 * seg(t, at[4], at[4] + 0.2)} /><Pool x={540} y={900} rx={720} ry={800} o={0.85} hold={40} /></Layer>
      <Layer d={1.4}><Dust t={t} seed="s4" /></Layer>
    </Shot>
  );
};

// ---- 5 tip circuit cross-section
export const S5: React.FC<T> = ({ t }) => {
  const a = CUT[4], b = CUT[5], p0 = W(K, "ditekan");
  const come = smooth((t - a) / 1.4), press = seg(t, p0, p0 + 0.35), cur = lin(t, W(K, "menutup"), W(K, "lalu"));
  const on = lit(t, W(K, "lampu")) ;
  const tip = lerp(690, 832, come) - 10 + 8 * press, shut = t > W(K, "menutup") + 0.1;
  return (
    <Shot t={t} a={a} b={b} from={{ x: 70, y: 30, z: 1.22 }} to={{ x: -40, y: -30, z: 1.0 }}>
      <Layer d={0.2}><Plane tex={TEX.plaster} tint="#333b46" light="radial-gradient(ellipse 800px 800px at 1000px 1350px, #fff, #596270 50%, #101216 100%)" /></Layer>
      <Layer d={0.4}><Smoke t={t} x={-300} y={500} w={1600} o={0.32} /><Beam x={240} y={-40} len={1500} w0={60} w1={800} deg={-22} o={0.5} /></Layer>
      <Layer d={0.7}><Lamp x={250} y={650} w={220} on={on} spread={2.5} /><Current d="M252 800 L252 880 Q252 960 190 960 L-60 960 M250 800 L250 800" k={0} t={t} w={1} /></Layer>
      <Layer d={1}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: "translateX(66px) scaleX(-1)" }}><Torso red={on} /></div>
        <Current d={`M ${tip - 330} 1050 L -80 1050 Q -140 1050 -140 940 L -140 860 Q -140 826 -60 826 L 250 826 L 250 790`} k={cur} t={t} w={12} />
        <Tip x={tip + 14 * press} y={1050} s={2.2} press={press} />
        {/* cut-away window: spring + contacts */}
        <Svg>
          <defs><linearGradient id="win13" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a0b0d" /><stop offset="0.5" stopColor="#2b2f35" /><stop offset="1" stopColor="#08090b" /></linearGradient></defs>
          <g transform={`translate(${tip - 596} 978)`}>
            <rect x={0} y={0} width={320} height={144} rx={16} fill="url(#win13)" stroke="#ded7c4" strokeWidth={7} />
            <polyline points={Array.from({ length: 15 }, (_, i) => `${66 + i * ((200 - 62 * press) / 14)},${i % 2 ? 36 : 108}`).join(" ")} fill="none" stroke="#d9d3c3" strokeWidth={11} strokeLinejoin="round" />
            <rect x={14} y={34} width={42} height={76} fill="#8d867a" /><rect x={262 - 62 * press} y={24} width={50} height={96} rx={6} fill="#f1ead6" />
            <rect x={40} y={60} width={92} height={24} fill={shut ? C.red : "#b5ad9c"} /><rect x={194 - 62 * press} y={60} width={80} height={24} fill={shut ? C.red : "#efe8d4"} />
          </g>
        </Svg>
        <Glow x={tip - 450} y={1050} r={240} color={C.red} o={0.7 * press * seg(t, W(K, "menutup"), W(K, "menutup") + 0.2)} />
      </Layer>
      <Layer d={1}><Pool x={560} y={950} rx={760} ry={800} o={0.85} hold={40} /></Layer>
      <Layer d={1.5} blur={12}><Svg><path d="M-200 2100 L-200 1560 Q200 1470 560 1600 Q900 1720 1300 1600 L1300 2100 Z" fill="#08090c" /><path d="M-200 1560 Q200 1470 560 1600 Q900 1720 1300 1600" stroke="#a3bfdb" strokeWidth={7} fill="none" opacity={0.5} /></Svg></Layer>
      <Layer d={1.4}><Dust t={t} seed="s5" /></Layer>
      <div style={{ position: "absolute", inset: 0, background: C.red, mixBlendMode: "soft-light", opacity: 0.3 * on }} />
    </Shot>
  );
};

// ---- 6 Parker protests
export const S6: React.FC<T> = ({ t }) => {
  const a = CUT[5], b = CUT[6], up = smooth((t - W(D, "langsung") + 0.1) / 0.4);
  const at = 0.45 + 0.25 * Math.sin((t - a) * 2.2);
  const lean: Pose = { ...EN_GARDE, lean: -12, hand: [150, -470], sword: 40 };
  return (
    <Shot t={t} a={a} b={b} from={{ x: 90, y: 0, z: 1.02 }} to={{ x: -90, y: -10, z: 1.14 }}>
      <Arena t={t} seed="s6" spot={lerp(540, 330, up)} beams={[330, 820]} lamp={[600, 620, 190]} red={lit(t, a + 0.3)} banner={[860, 850]} fgSide="r" pool={{ y: 960, rx: 640, ry: 720 }}>
        <Fig x={965} y={1236} s={0.76} flip pose={mix(mix(EN_GARDE, LUNGE, at), STAND, up * 0.8)} tone={lerp(0.6, 0.36, up)} rim={0.75} />
        <Fig x={lerp(210, 300, up)} y={1236} s={0.78} pose={mix(lean, { ...PROTEST, rear: [-60 + wob(t, 9, 14), -940] }, up)} tone={0.92} rim={0.6} />
      </Arena>
    </Shot>
  );
};

// ---- 7 referee checks the tip
export const S7: React.FC<T> = ({ t }) => {
  const a = CUT[6], b = CUT[7], k = lin(t, a, b), sx = lerp(60, 900, smooth(k * 1.25));
  return (
    <Shot t={t} a={a} b={b} from={{ x: -60, y: 10, z: 1.0 }} to={{ x: 50, y: 0, z: 1.22 }}>
      <Layer d={0.2}><Plane tex={TEX.plaster} tint="#272d35" light="radial-gradient(ellipse 700px 700px at 1050px 1300px, #ddd, #4d545e 50%, #101216 100%)" /><Blinds t={t} x={-100} y={300} w={1300} h={1000} o={0.22} /></Layer>
      <Layer d={0.5}><Svg><defs><linearGradient id="suit13" x1="0" x2="1"><stop offset="0" stopColor="#0c0e12" /><stop offset="0.5" stopColor="#3a414b" /><stop offset="1" stopColor="#0c0e12" /></linearGradient></defs><path d="M120 2000 L170 760 Q300 640 540 630 Q780 640 910 760 L960 2000 Z" fill="url(#suit13)" /><path d="M540 640 L440 1000 L540 1180 L640 1000 Z" fill="#b9b5aa" /><path d="M540 650 L504 720 L540 1120 L576 720 Z" fill="#14161a" /><path d="M170 760 Q300 640 540 630 Q780 640 910 760" stroke="#a3bfdb" strokeWidth={7} fill="none" opacity={0.7} /></Svg></Layer>
      <Layer d={0.9}><Glow x={sx} y={960} r={420} o={0.62} color="#fff3cf" /><Beam x={sx - 160} y={1560} len={760} w0={60} w1={420} deg={192} o={0.6} /></Layer>
      <Layer d={1.05}>
        <Img src={P.finger} style={{ position: "absolute", left: 280, top: 1000, width: 118, transform: "rotate(186deg)", filter: "brightness(2.2) drop-shadow(0 -16px 14px rgba(0,0,0,0.6))" }} />
        <Img src={P.finger} style={{ position: "absolute", left: 410, top: 1004, width: 112, transform: "rotate(178deg)", filter: "brightness(2)" }} />
        <Tip x={900 + wob(t, 2, 10)} y={960} s={1.75} press={0.5 + 0.5 * Math.sin(t * 5)} rot={wob(t, 1.6, 2)} />
        <Img src={P.finger} style={{ position: "absolute", left: 320, top: 530, width: 160, transform: "rotate(-5deg)", filter: "brightness(2.5) drop-shadow(0 26px 16px rgba(0,0,0,0.7))" }} />
        <div style={{ position: "absolute", left: 200, top: 520, width: 1000, height: 900, background: `radial-gradient(ellipse 300px 360px at ${sx - 160}px 440px, rgba(255,243,207,0.5), transparent)`, mixBlendMode: "overlay" }} />
      </Layer>
      <Layer d={1}><Pool x={lerp(sx, 540, 0.5)} y={950} rx={620} ry={700} o={0.9} hold={30} /></Layer>
      <Layer d={1.4}><Dust t={t} seed="s7" /></Layer>
    </Shot>
  );
};

// ---- 8 arena clock, Fox below
export const S8: React.FC<T> = ({ t }) => {
  const a = CUT[7], b = CUT[8], at = W(D, "waktu"), k40 = W(D, "40");
  const ang = lerp(0, 120, seg(t, a + 0.3, k40)) + Math.floor(Math.max(0, t - k40) * 2) * 6;
  const R = 280, rad = (d: number) => ((d - 90) * Math.PI) / 180;
  const pt = (d: number, r: number) => [Math.cos(rad(d)) * r, Math.sin(rad(d)) * r];
  const [ex, ey] = pt(ang, R - 30);
  return (
    <Shot t={t} a={a} b={b} from={{ x: -40, y: 50, z: 1.0 }} to={{ x: 30, y: -30, z: 1.16 }}>
      <Arena t={t} seed="s8" spot={540} beams={[540]} fgSide="l" pool={{ y: 860, rx: 600, ry: 760, o: 0.84 }}>
        <div style={{ position: "absolute", left: 250, top: 500, width: 580, height: 490, background: "linear-gradient(180deg,#2d333b,#0f1216)", border: "14px solid #424a55", boxShadow: "0 40px 60px rgba(0,0,0,0.7)" }} />
        <Svg>
          <g transform="translate(540 745) scale(0.82)">
            <circle r={R - 20} fill="#f0e7cd" /><image href={TEX.paper} x={-R} y={-R} width={2 * R} height={2 * R} style={{ mixBlendMode: "multiply" }} clipPath="circle(260px at 280px 280px)" opacity={0.8} />
            <path d={`M0 0 L${ex} ${ey} A${R - 30} ${R - 30} 0 ${360 - ang > 180 ? 1 : 0} 1 0 ${-(R - 30)} Z`} fill="#1a1d22" opacity={0.28 * seg(t, at, k40)} />
            {Array.from({ length: 60 }, (_, i) => { const [x1, y1] = pt(i * 6, R - 34), [x2, y2] = pt(i * 6, R - (i % 5 ? 52 : 80)); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#16181b" strokeWidth={i % 5 ? 4 : 11} />; })}
            <line x1={0} y1={0} x2={pt(ang, R - 58)[0]} y2={pt(ang, R - 58)[1]} stroke="#16181b" strokeWidth={14} strokeLinecap="round" /><circle r={24} fill="#16181b" />
            <circle r={R - 20} fill="none" stroke="#8c95a0" strokeWidth={18} />
          </g>
        </Svg>
        <Fig x={540} y={1240} s={0.46} pose={{ ...EN_GARDE, hand: [210, -560 + wob(t, 5, 14)] }} tone={0.95} rim={0.8} />
      </Arena>
    </Shot>
  );
};

// ---- 9 tip points up, lamp lights
export const S9: React.FC<T> = ({ t }) => {
  const a = CUT[8], b = CUT[9], on = lit(t, W(D, "menyala")), up = smooth((t - W(D, "ujung") + 0.1) / 0.9);
  const pose: Pose = mix({ ...EN_GARDE, sword: 4 }, { ...EN_GARDE, hand: [180, -640], sword: -72, lean: -2 }, up);
  return (
    <Shot t={t} a={a} b={b} from={{ x: 30, y: 60, z: 1.02 }} to={{ x: -20, y: -70, z: 1.14 }}>
      <Arena t={t} seed="s9" spot={720} beams={[720]} lamp={[250, 640, 210]} red={on} fgSide="l" pool={{ y: 900, rx: 640, ry: 740 }}>
        <Fig x={60} y={1236} s={0.88} pose={{ ...EN_GARDE, lean: -4, sword: -10, hand: [170, -520] }} tone={0.42} rim={0.6} />
        <Fig x={810} y={1236} s={0.92} flip pose={pose} tone={0.9} rim={0.75} />
        <Svg style={{ opacity: seg(t, W(D, "mengarah"), W(D, "mengarah") + 0.3) }}><path d="M470 780 L440 480 M410 528 L438 478 L480 520" stroke={C.bone} strokeWidth={12} fill="none" strokeDasharray="34 18" strokeDashoffset={-t * 90} /></Svg>
      </Arena>
    </Shot>
  );
};

// ---- 10 apology and replacement sword
export const S10: React.FC<T> = ({ t }) => {
  const a = CUT[9], b = CUT[10], bow = smooth((t - W(D, "minta")) / 0.6), offer = smooth((t - W(D, "menawarkan")) / 0.7), team = smooth((t - W(D, "tim") - 0.1) / 1.0);
  const hand: [number, number] = [lerp(120, 230, offer), lerp(-420, -500, offer)];
  const ax = lerp(-460, 250, team), ay = 1010;
  return (
    <Shot t={t} a={a} b={b} from={{ x: 70, y: 10, z: 1.02 }} to={{ x: -80, y: -20, z: 1.14 }}>
      <Layer d={0.15}><Plane tex={TEX.plaster} tint="#38404b" light="radial-gradient(ellipse 760px 900px at 1180px 1250px, #fff, #636c79 45%, #121418 100%)" /><Blinds t={t} x={100} y={260} w={1300} h={1100} o={0.42} skew={-12} /></Layer>
      <Layer d={0.4}><Smoke t={t} x={-300} y={500} w={1700} o={0.3} /><Beam x={860} y={-40} len={1600} w0={60} w1={760} deg={8} o={0.45} /></Layer>
      <Layer d={1}>
        <Svg>
          <Fencer x={790} y={1700} s={1.42} flip pose={{ ...STAND, lean: 8 * bow, hand, rear: [-60, -400], head: 26 * bow, sword: lerp(50, -8, offer) }} tone={0.8} rim={0.75} shadow={0} />
        </Svg>
      </Layer>
      <Layer d={1.15}>
        <Svg>
          <g transform={`translate(${ax} ${ay + wob(t, 3, 6)}) rotate(-24)`}>
            <path d="M30 -7 L690 -3 L690 3 L30 7 Z" fill="#e4e9ee" /><path d="M30 0 L690 0 L690 3 L30 7 Z" fill="#4b535d" />
            <path d="M18 -66 Q92 -58 92 0 Q92 58 18 66 Q30 0 18 -66 Z" fill="#8b95a1" /><path d="M20 -62 Q80 -54 86 -10 Q60 -36 26 -28 Z" fill="#fbf5e4" />
            <rect x={-110} y={-14} width={130} height={28} rx={12} fill="#191b1f" />
          </g>
          <Limb a={[ax - 560, ay + 330]} b={[ax - 70, ay + 34]} r1={92} r2={54} tone={0.36} rim={0.9} folds={3} />
          <Limb a={[ax - 92, ay + 40]} b={[ax - 6, ay + 4]} r1={58} r2={46} tone={0.62} rim={0.8} />
        </Svg>
      </Layer>
      <Layer d={1}><Pool x={600} y={900} rx={680} ry={760} o={0.86} hold={34} /></Layer>
      <Layer d={1.4}><Dust t={t} seed="s10" /></Layer>
    </Shot>
  );
};

// ---- 11 confiscated
export const S11: React.FC<T> = ({ t }) => {
  const a = CUT[10], b = CUT[11], drop = clamp((t - a) / 0.55), y = 1 - Math.pow(drop, 2);
  return (
    <Shot t={t} a={a} b={b} from={{ x: -20, y: 20, z: 1.0, r: -2 }} to={{ x: 20, y: -10, z: 1.2, r: 2 }} shakeAt={W(D, "menyita")}>
      <Layer d={0.5}><Plane tex={TEX.wood} tint="#6d655a" size={1000} light="radial-gradient(ellipse 960px 1120px at 1040px 1290px, #fff, #666 50%, #131416 100%)" /></Layer>
      <Layer d={0.9}>
        <div style={{ position: "absolute", left: 110, top: 560, width: 860, height: 680, borderRadius: 40, background: "linear-gradient(150deg,#cfd5db,#6c757f 45%,#2d333a)", boxShadow: "0 50px 70px rgba(0,0,0,0.8)" }}>
          <div style={{ position: "absolute", inset: 34, borderRadius: 24, background: "radial-gradient(ellipse at 45% 35%, #9aa3ad, #444c56 80%)", boxShadow: "inset 0 18px 40px rgba(0,0,0,0.65)" }}><div style={{ position: "absolute", inset: 0, backgroundImage: `url(${TEX.brushed})`, mixBlendMode: "overlay", opacity: 0.8 }} /></div>
        </div>
        <Handle x={lerp(270, 270, drop)} y={1030 - 340 * y} s={0.62 + 0.3 * y} rot={-24 + 14 * y} />
        <div style={{ position: "absolute", left: 640, top: 1030, width: 270, height: 130, background: "#e9e2cf", backgroundImage: `url(${TEX.paper})`, backgroundBlendMode: "multiply", transform: "rotate(7deg)", boxShadow: "0 12px 20px rgba(0,0,0,0.55)", fontFamily: F_LABEL, fontWeight: 800, fontSize: 48, lineHeight: 1.05, color: "#17191c", textAlign: "center", paddingTop: 14 }}>BARANG<br />BUKTI</div>
      </Layer>
      <Layer d={1}><Pool x={540} y={940} rx={800} ry={1000} o={0.78} hold={44} /></Layer>
      <Layer d={1.5} blur={14}><Svg><path d="M-200 1400 Q60 1330 200 1480 Q330 1640 300 2100 L-200 2100 Z" fill="#08090c" /><path d="M-60 1370 Q110 1390 200 1480 Q290 1590 300 1760" stroke="#a3bfdb" strokeWidth={8} fill="none" opacity={0.6} /></Svg></Layer>
      <Layer d={1.3}><Dust t={t} seed="s11" n={30} /></Layer>
    </Shot>
  );
};
export { pop, Floor };
