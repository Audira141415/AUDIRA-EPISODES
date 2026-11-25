// EP13 shared set pieces (arena, lamp, sword assembly, light helpers) and the cut list.
import React from "react";
import { Img } from "remotion";
import guardPng from "./tex/guard.png";
import collarPng from "./tex/collar.png";
import leatherPng from "./tex/grip_leather.png";
import barePng from "./tex/grip_bare.png";
import pommelPng from "./tex/pommel.png";
import bladePng from "./tex/blade.png";
import barrelPng from "./tex/tip_barrel.png";
import tipPng from "./tex/tip_button.png";
import buttonPng from "./tex/button.png";
import fingerPng from "./tex/finger.png";
import offPng from "./tex/lamp_off.png";
import onPng from "./tex/lamp_on.png";
import { Beam, C, Dust, F_LABEL, Glow, Layer, Plane, Smoke, Svg, TEX, W, OUTRO_AT, TOTAL, clamp, lerp } from "./lib.tsx";

export const P = { guard: guardPng, collar: collarPng, leather: leatherPng, bare: barePng, pommel: pommelPng, blade: bladePng, barrel: barrelPng, tip: tipPng, button: buttonPng, finger: fingerPng };
// cut list: every cut leads its VO word slightly
const K = "konteks", D = "pengembangan", E = "penjelasan", Y = "payoff";
export const CUT = [
  0, W(K, "montreal") - 0.08, W(K, "boris") - 0.08, W(K, "bertanding") - 0.05, W(K, "di", 1) - 0.04, W(D, "lawan") - 0.1, W(D, "wasit") - 0.15,
  W(D, "berikutnya") - 0.17, W(D, "saat") - 0.1, W(D, "boris", 1) - 0.1, W(D, "tapi") - 0.1, W(E, "lalu") - 0.12, W(E, "dalamnya") - 0.28, W(E, "cukup") - 0.06, W(E, "sirkuit") - 0.1,
  W(Y, "boris") - 0.12, W(Y, "tapi") - 0.06, W(Y, "putusan") - 0.08, W(Y, "hasilnya") - 0.12, W(Y, "dan", 1) - 0.06, W(Y, "emas") - 0.06, W("outro", "kalau") - 0.12, W("outro", "ikuti") - 0.1, OUTRO_AT - 0.1, TOTAL,
];

/** Darkness with a hole: keeps exactly one bright subject. */
export const Pool: React.FC<{ x?: number; y?: number; rx?: number; ry?: number; o?: number; hold?: number }> = ({ x = 540, y = 860, rx = 560, ry = 760, o = 0.86, hold = 28 }) => (
  <div style={{ position: "absolute", inset: -300, background: `radial-gradient(ellipse ${rx}px ${ry}px at ${x + 300}px ${y + 300}px, transparent ${hold}%, rgba(4,5,8,${o}) 100%)` }} />
);
/** Venetian-blind light. */
export const Blinds: React.FC<{ x: number; y: number; w: number; h: number; o?: number; skew?: number; t: number }> = ({ x, y, w, h, o = 0.4, skew = -10, t }) => (
  <div style={{ position: "absolute", left: x + t * 7, top: y, width: w, height: h, opacity: o, mixBlendMode: "screen", filter: "blur(5px)", transform: `skewY(${skew}deg)`, background: "repeating-linear-gradient(180deg, rgba(255,227,160,0.85) 0 44px, transparent 52px 104px)", maskImage: "radial-gradient(closest-side, #000 35%, transparent)", WebkitMaskImage: "radial-gradient(closest-side, #000 35%, transparent)" }} />
);
export const Lamp: React.FC<{ x: number; y: number; w: number; on: number; spread?: number }> = ({ x, y, w, on, spread = 2.4 }) => {
  const h = (w * 400) / 300;
  return (
    <>
      <div style={{ position: "absolute", left: x - w * 0.62, top: y + h * 0.36, width: w * 1.24, height: h * 0.2, background: "radial-gradient(closest-side, rgba(0,0,0,0.8), transparent)" }} />
      <Img src={offPng} style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w }} />
      <Img src={onPng} style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, opacity: on }} />
      <Glow x={x} y={y - h * 0.1} r={w * spread} color={C.red} o={0.62 * on} />
      <Glow x={x} y={y - h * 0.1} r={w * 0.62} color="#ffd0c0" o={0.75 * on} />
    </>
  );
};
/** Lamp switch-on with a short filament flicker. */
export const lit = (t: number, a: number) => (t < a ? 0 : t < a + 0.05 ? 0.7 : t < a + 0.1 ? 0.25 : 0.86 + 0.14 * Math.sin(t * 23));
export const Floor: React.FC<{ y?: number; tint?: string; piste?: boolean; light?: string; k?: number }> = ({ y = 1130, tint = "#3b4048", piste, light = "radial-gradient(ellipse 900px 900px at 50% 300px, #fff 0%, #777 45%, #16181c 100%)", k = 1 }) => (
  <div style={{ position: "absolute", left: -900, top: y, width: 2880, height: 1300, perspective: 900, perspectiveOrigin: "50% -30%", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: -600, top: 0, width: 4080, height: 2200, transformOrigin: "50% 0", transform: "rotateX(56deg)", background: tint, isolation: "isolate" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${TEX.floor})`, backgroundSize: "900px auto", mixBlendMode: "overlay", opacity: k }} />
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(90deg, rgba(0,0,0,0.42) 0 5px, transparent 5px 230px)" }} />
      {piste && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 130, height: 560, background: "linear-gradient(180deg,#7d8691,#a8b1bb 45%,#636b75)", borderTop: "10px solid #dfe4ea", borderBottom: "14px solid #dfe4ea", isolation: "isolate" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${TEX.brushed})`, backgroundSize: "700px auto", mixBlendMode: "overlay", opacity: 0.9 }} />
          {[640, 1240, 2040, 2840, 3440].map((x) => <div key={x} style={{ position: "absolute", left: x, top: 0, bottom: 0, width: 16, background: "rgba(20,24,30,0.7)" }} />)}
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: light, mixBlendMode: "multiply" }} />
    </div>
  </div>
);
/** AUDIRA banner on the arena wall (brand inside the world). */
export const Banner: React.FC<{ x: number; y: number; w?: number; o?: number }> = ({ x, y, w = 620, o = 0.8 }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, height: w * 0.2, background: "linear-gradient(180deg,#9b978c,#c9c4b5 50%,#777368)", boxShadow: "0 18px 30px rgba(0,0,0,0.7)", opacity: o, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F_LABEL, fontWeight: 800, fontSize: w * 0.135, letterSpacing: w * 0.03, color: "#15181c" }}>AUDIRA</div>
);
/** Competition hall. `children` = figures (d 1). */
export const Arena: React.FC<{ t: number; spot?: number; red?: number; lamp?: [number, number, number]; banner?: [number, number]; beams?: number[]; pool?: { x?: number; y?: number; rx?: number; ry?: number; o?: number }; fgSide?: "l" | "r" | "none"; children?: React.ReactNode; seed: string }> = ({ t, spot = 540, red = 0, lamp, banner, beams = [spot], pool, fgSide = "l", children, seed }) => (
  <>
    <Layer d={0.15}>
      <Plane tex={TEX.brick} tint="#39414c" size={900} light={`radial-gradient(ellipse 760px 900px at ${spot + 500}px 1150px, #fff 0%, #6d7684 45%, #14171c 100%)`} />
    </Layer>
    <Layer d={0.28} blur={2}>
      <div style={{ position: "absolute", left: -500, top: 690, width: 2080, height: 470, backgroundImage: `url(${TEX.crowd})`, backgroundSize: "700px auto", mixBlendMode: "screen", opacity: 1, filter: "brightness(2.1)" }} />
      <div style={{ position: "absolute", left: -500, top: 1010, width: 2080, height: 150, background: "linear-gradient(180deg,#59626e,#20242b)" }} />
      <div style={{ position: "absolute", left: -500, top: 1000, width: 2080, height: 12, background: "#8b96a4" }} />
    </Layer>
    {banner && <Layer d={0.34}><Banner x={banner[0]} y={banner[1]} /></Layer>}
    <Layer d={0.4}>
      <Smoke t={t} x={-420} y={420} w={1700} o={0.3} />
      {beams.map((b, i) => <Beam key={i} x={b + (b - 540) * 0.1} y={40} len={1420} w0={50} w1={620} deg={(540 - b) * 0.012} o={0.5} blur={18} />)}
    </Layer>
    {lamp && <Layer d={0.5}><Lamp x={lamp[0]} y={lamp[1]} w={lamp[2]} on={red} /></Layer>}
    <Layer d={1}>
      <Floor piste light={`radial-gradient(ellipse 620px 620px at ${spot + 1500}px 330px, #fff 0%, #8b8b8b 40%, #1a1c21 100%)`} />
      <Glow x={spot} y={1240} r={560} ry={120} o={0.42} />
      <Glow x={spot} y={1240} r={700} ry={150} color={C.red} o={0.4 * red} />
      {children}
    </Layer>
    <Layer d={0.85}><Pool x={spot} {...pool} /></Layer>
    {fgSide !== "none" && (
      <Layer d={1.7} blur={14}>
        <Svg>
          {fgSide === "l" ? <path d="M-300 2100 L-300 1180 Q-160 1060 -40 1150 Q70 1240 96 1420 L130 2100 Z" fill="#07080b" /> : <path d="M1400 2100 L1400 1160 Q1250 1050 1120 1150 Q1010 1240 984 1420 L950 2100 Z" fill="#07080b" />}
          <path d={fgSide === "l" ? "M-40 1150 Q70 1240 96 1420" : "M1120 1150 Q1010 1240 984 1420"} stroke="#a3bfdb" strokeWidth={9} fill="none" opacity={0.75} />
          <rect x={-400} y={1640} width={1900} height={46} fill="#0b0d11" /><rect x={-400} y={1640} width={1900} height={8} fill="#7b8794" opacity={0.7} />
        </Svg>
      </Layer>
    )}
    <Layer d={1.3}><Smoke t={t + 4} x={-300} y={980} w={1500} o={0.2} v={-26} /><Dust t={t} seed={seed} /></Layer>
    <div style={{ position: "absolute", inset: 0, background: C.red, mixBlendMode: "soft-light", opacity: 0.34 * red }} />
  </>
);

/** Épée handle. Local px: grip 0..640 on x, axis y = 0. off = guard slide, flap 0 closed .. 1 lifted, cap = metal button 0..1 raised. */
export const Handle: React.FC<{ x: number; y: number; s: number; rot?: number; off?: number; flap?: number; cap?: number; blade?: boolean; guard?: boolean; pressed?: number }> = ({ x, y, s, rot = 0, off = 0, flap = 0, cap = 0, blade = true, guard = true, pressed = 0 }) => {
  const im = (src: string, l: number, top: number, w: number, extra?: React.CSSProperties) => <Img src={src} style={{ position: "absolute", left: l, top, width: w, maxWidth: "none", ...extra }} />;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transform: `rotate(${rot}deg) scale(${s})` }}>
      <div style={{ position: "absolute", left: -150, top: 40, width: 1100 + (guard ? 0 : -260), height: 120, background: "radial-gradient(closest-side, rgba(0,0,0,0.75), transparent)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translateX(${off}px)` }}>
        {blade && im(P.blade, 880, -30, 1400, { filter: "drop-shadow(0 26px 14px rgba(0,0,0,0.55))" })}
        {guard && im(P.guard, 690, -210, 232, { filter: "drop-shadow(0 40px 26px rgba(0,0,0,0.6))" })}
        {guard && im(P.collar, 636, -75, 56)}
      </div>
      {im(P.pommel, -122, -70, 130)}
      {im(P.bare, 0, -85, 640)}
      {cap > 0 && (
        <div style={{ position: "absolute", left: 395 - 40, top: 4 - 40, width: 80, height: 80, borderRadius: 60, transform: `scale(${0.55 + 0.45 * cap - 0.14 * pressed})`, opacity: clamp(cap * 3), background: "radial-gradient(circle at 36% 28%, #ffffff 0%, #fff8e6 22%, #d9d0bc 48%, #6d675c 76%, #cfe2f5 100%)", boxShadow: "0 0 0 5px #1a1917, 0 10px 20px #000" }}>
          <div style={{ position: "absolute", inset: 18, borderRadius: 60, background: "radial-gradient(circle at 60% 70%, #fffaf0, #a39b8a 85%)" }} />
        </div>
      )}
      {im(P.leather, 0, -85, 640, { clipPath: "inset(0 366px 0 0)" })}
      {im(P.leather, 0, -85, 640, { clipPath: "inset(0 0 0 502px)" })}
      {flap > 0.02 && <div style={{ position: "absolute", left: 270, top: 4 - 190 * flap + 60, width: 240, height: 130, opacity: 0.6, background: "radial-gradient(closest-side, #000, transparent)", transform: `translate(${30 * flap}px, ${40 * flap}px)` }} />}
      {im(P.leather, 0, -85, 640, { clipPath: "inset(0 136px 0 272px)", transformOrigin: "390px 10px", transform: `translate(${-26 * flap}px, ${-232 * flap}px) rotate(${-16 * flap}deg) scale(${1 + 0.06 * Math.sin(Math.PI * flap)}, ${1 - 0.1 * Math.sin(Math.PI * flap)})`, filter: flap > 0 ? "brightness(1.25) drop-shadow(0 16px 10px rgba(0,0,0,0.6))" : undefined })}
    </div>
  );
};
/** Blade tip pointing right; tip end (button face) at (x, y). press 0..1. */
export const Tip: React.FC<{ x: number; y: number; s: number; press?: number; flip?: boolean; rot?: number }> = ({ x, y, s, press = 0, flip, rot = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transform: `rotate(${rot}deg) scale(${flip ? -s : s}, ${s})` }}>
    <Img src={P.blade} style={{ position: "absolute", left: -1640, top: -30, width: 1400, maxWidth: "none" }} />
    <Img src={P.barrel} style={{ position: "absolute", left: -290 + 0, top: -65, width: 260, maxWidth: "none" }} />
    <Img src={P.tip} style={{ position: "absolute", left: -70 - 34 * press, top: -65, width: 70, maxWidth: "none" }} />
  </div>
);
/** Running current along an SVG path: head position k 0..1. */
export const Current: React.FC<{ d: string; k: number; t: number; w?: number; color?: string }> = ({ d, k, t, w = 9, color = C.red }) => (
  <Svg>
    <path d={d} pathLength={1} fill="none" stroke="#0c0e11" strokeWidth={w + 8} strokeLinecap="round" />
    <path d={d} pathLength={1} fill="none" stroke="#5d6570" strokeWidth={w} strokeLinecap="round" />
    <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={w + 16} strokeLinecap="butt" strokeDasharray={`${k} 2`} opacity={k > 0 ? 0.35 : 0} style={{ filter: "blur(9px)" }} />
    <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={w} strokeDasharray={`${k} 2`} opacity={k > 0 ? 1 : 0} />
    {k > 0 && <path d={d} pathLength={100} fill="none" stroke="#ffe9e0" strokeWidth={w * 0.6} strokeDasharray="2 6" strokeDashoffset={-t * 22} opacity={0.9} style={{ clipPath: undefined }} mask={undefined} visibility={k >= 1 ? "visible" : "hidden"} />}
  </Svg>
);
export const wob = (t: number, f: number, a: number) => Math.sin(t * f) * a;
export { lerp };
