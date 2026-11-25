// EP13 FILMNOIR 2D kit: 1080 x 1920 layout, everything is a pure function of t (seconds).
import React from "react";
import { random, Img, AbsoluteFill } from "remotion";
import tl from "./timeline.json";
import plaster from "./tex/plaster.jpg";
import brick from "./tex/brick.jpg";
import wood from "./tex/wood.jpg";
import paper from "./tex/paper.jpg";
import leather from "./tex/leather.jpg";
import cloth from "./tex/cloth.jpg";
import brushed from "./tex/brushed.jpg";
import floor from "./tex/floor.jpg";
import smoke from "./tex/smoke.png";
import grain from "./tex/grain.jpg";
import crowd from "./tex/crowd.jpg";
import { F_CAPTION, F_LABEL, F_STAMP } from "../ep05/chronicle/fonts.ts";

export { F_CAPTION, F_LABEL, F_STAMP };
export const TEX = { plaster, brick, wood, paper, leather, cloth, brushed, floor, smoke, grain, crowd };
export const C = { ink: "#07080a", wall: "#23272e", steel: "#aab4c0", cloth: "#d9d6cd", key: "#ffe3a0", rim: "#a3bfdb", red: "#ff2b3a", bone: "#f1ece0" };
export const TOTAL: number = tl.total;
export const OUTRO_AT = TOTAL - 3.8;

// ---- timing
type Word = { w: string; s: number; e: number };
const CLIPS = tl.clips as { id: string; words: Word[] }[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "");
/** Start (s) of the nth word in section `id` starting with `prefix` (throws on drift). */
export const W = (id: string, prefix: string, nth = 0) => {
  const ws = CLIPS.find((c) => c.id === id)!.words.filter((w) => norm(w.w).startsWith(prefix));
  if (!ws[nth]) throw new Error(`timing drift: ${id} "${prefix}"#${nth}`);
  return ws[nth].s;
};
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (k: number) => { const x = clamp(k); return x * x * (3 - 2 * x); };
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const lin = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const win = (t: number, a: number, b: number, fi = 0.2, fo = 0.2) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
export const pop = (t: number, a: number) => { const k = clamp((t - a) / 0.26); return k <= 0 ? 0 : k < 0.6 ? (k / 0.6) * 1.08 : 1.08 - ((k - 0.6) / 0.4) * 0.08; };

// ---- camera: linear pan/zoom per shot (no ease-out at the ends, G13); parallax per layer depth d (0 far .. 1 subject .. >1 near)
export type CamKey = { x: number; y: number; z: number; r?: number };
const CamCtx = React.createContext<CamKey>({ x: 0, y: 0, z: 1, r: 0 });
export const Shot: React.FC<{ t: number; a: number; b: number; from: CamKey; to: CamKey; shakeAt?: number; children: React.ReactNode }> = ({ t, a, b, from, to, shakeAt, children }) => {
  if (t < a || t >= b) return null;
  const k = (t - a) / (b - a);
  const sh = shakeAt !== undefined && t >= shakeAt ? Math.exp(-(t - shakeAt) * 9) * 16 : 0;
  const cam = {
    x: lerp(from.x, to.x, k) + Math.sin(t * 0.9) * 6 + sh * Math.sin(t * 71),
    y: lerp(from.y, to.y, k) + Math.cos(t * 0.7) * 5 + sh * Math.cos(t * 83),
    z: lerp(from.z, to.z, k),
    r: lerp(from.r ?? 0, to.r ?? 0, k),
  };
  return <CamCtx.Provider value={cam}><AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>{children}</AbsoluteFill></CamCtx.Provider>;
};
/** Parallax layer. Camera x/y in px: positive x moves the view right (content goes left). */
export const Layer: React.FC<{ d: number; blur?: number; o?: number; blend?: React.CSSProperties["mixBlendMode"]; children: React.ReactNode }> = ({ d, blur = 0, o = 1, blend, children }) => {
  const c = React.useContext(CamCtx);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: o, mixBlendMode: blend, filter: blur ? `blur(${blur}px)` : undefined, transformOrigin: "540px 860px", transform: `translate(${-c.x * d}px, ${-c.y * d}px) scale(${1 + (c.z - 1) * (0.35 + 0.65 * d)}) rotate(${(c.r ?? 0) * (0.5 + d / 2)}deg)` }}>
      {children}
    </div>
  );
};
export const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, overflow: "visible", ...style }}>{children}</svg>
);
/** Textured plane with a base tint and a light pool. size = texture px; light = css gradient multiplied on top. */
export const Plane: React.FC<{ tex: string; x?: number; y?: number; w?: number; h?: number; tint?: string; size?: number; light?: string; k?: number; style?: React.CSSProperties }> = ({ tex, x = -500, y = -400, w = 2080, h = 2720, tint = C.wall, size = 1100, light, k = 1, style }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: tint, isolation: "isolate", overflow: "hidden", ...style }}>
    <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${tex})`, backgroundSize: `${size}px auto`, mixBlendMode: "overlay", opacity: k }} />
    {light && <div style={{ position: "absolute", inset: 0, background: light, mixBlendMode: "multiply" }} />}
  </div>
);
/** Volumetric beam from (x,y): width w0 to w1 over length len, rotated deg (0 = straight down). */
export const Beam: React.FC<{ x: number; y: number; len: number; w0?: number; w1: number; deg?: number; o?: number; color?: string; blur?: number }> = ({ x, y, len, w0 = 40, w1, deg = 0, o = 0.4, color = C.key, blur = 14 }) => {
  const id = `bm${x}${y}${w1}${deg}`.replace(/[^a-z0-9]/gi, "");
  return (
    <Svg style={{ mixBlendMode: "screen", filter: `blur(${blur}px)`, opacity: o }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity="0.95" /><stop offset="0.5" stopColor={color} stopOpacity="0.42" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path transform={`translate(${x} ${y}) rotate(${deg})`} d={`M${-w0 / 2} 0 L${w0 / 2} 0 L${w1 / 2} ${len} L${-w1 / 2} ${len} Z`} fill={`url(#${id})`} />
    </Svg>
  );
};
export const Glow: React.FC<{ x: number; y: number; r: number; color?: string; o?: number; ry?: number }> = ({ x, y, r, color = C.key, o = 0.5, ry }) => (
  <div style={{ position: "absolute", left: x - r, top: y - (ry ?? r), width: 2 * r, height: 2 * (ry ?? r), opacity: o, mixBlendMode: "screen", background: `radial-gradient(closest-side, ${color}, transparent)` }} />
);
export const Smoke: React.FC<{ t: number; x: number; y: number; w: number; o?: number; v?: number }> = ({ t, x, y, w, o = 0.25, v = 18 }) => (
  <Img src={smoke} style={{ position: "absolute", left: x + t * v, top: y, width: w, opacity: o, mixBlendMode: "screen" }} />
);
export const Dust: React.FC<{ t: number; n?: number; seed: string; o?: number; box?: [number, number, number, number] }> = ({ t, n = 46, seed, o = 0.6, box = [-60, 100, 1200, 1500] }) => (
  <Svg style={{ mixBlendMode: "screen", opacity: o }}>
    {Array.from({ length: n }, (_, i) => {
      const r = (k: number) => random(`${seed}-${i}-${k}`);
      const x = box[0] + ((r(0) * box[2] + t * (14 + r(1) * 34)) % box[2]);
      const y = box[1] + ((r(2) * box[3] + t * (-6 + r(3) * 26) + box[3]) % box[3]);
      return <circle key={i} cx={x} cy={y} r={1.2 + r(4) ** 3 * 5} fill={C.bone} opacity={(0.18 + r(5) * 0.5) * (0.6 + 0.4 * Math.sin(t * (1 + r(6) * 2) + r(7) * 6))} />;
    })}
  </Svg>
);
/** Film finish on top of the picture, under the HUD. */
export const Finish: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 84% 78% at 50% 46%, transparent 56%, rgba(2,3,5,0.62) 100%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,5,7,0.62) 0%, transparent 16%, transparent 66%, rgba(4,5,7,0.5) 92%)" }} />
    <AbsoluteFill style={{ backgroundImage: `url(${grain})`, backgroundPosition: `${Math.floor(random(`gx${Math.floor(frame / 2)}`) * 512)}px ${Math.floor(random(`gy${Math.floor(frame / 2)}`) * 512)}px`, mixBlendMode: "overlay", opacity: 0.16 }} />
  </>
);

// ---- lit limb: tapered capsule whose cross-gradient is computed from the light direction
export type V = [number, number];
const LIGHT = [-0.38, 0.74, 0.55];
const hexA = (v: number, warm: number) => `rgb(${Math.round(clamp(v * (1 + 0.04 * warm)) * 255)},${Math.round(clamp(v) * 255)},${Math.round(clamp(v * (1 - 0.06 * warm)) * 255)})`;
export const Limb: React.FC<{ a: V; b: V; r1: number; r2: number; bulge?: number; tone?: number; rim?: number; amb?: number; folds?: number }> = ({ a, b, r1, r2, bulge = 0, tone = 0.8, rim = 0.5, amb = 0.34, folds = 0 }) => {
  const id = `lb${React.useId().replace(/[^a-z0-9]/gi, "")}`;
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, ang = Math.atan2(dy, dx);
  const nx = -Math.sin(ang), ny = Math.cos(ang); // local +y axis in screen space (y down)
  const R = Math.max(r1, r2) + bulge;
  const stops = [-1, -0.86, -0.6, -0.3, 0, 0.3, 0.6, 0.86, 1].map((u) => {
    const z = Math.sqrt(1 - u * u), sx = nx * u, sy = -ny * u;
    const d = clamp(sx * LIGHT[0] + sy * LIGHT[1] + z * LIGHT[2]);
    const e = Math.abs(u) > 0.8 ? rim * (0.35 + 0.65 * clamp(sx * 0.8 - sy * 0.1 + 0.3)) : 0;
    return { u, v: tone * (amb + 0.8 * Math.pow(d, 1.1)) + e * 0.2, warm: d > 0.3 ? 1 : -0.9 };
  });
  const m = len * 0.4;
  const path = `M0 ${-r1} C ${m} ${-r1 - bulge}, ${len - m} ${-r2 - bulge * 0.6}, ${len} ${-r2} A ${r2} ${r2} 0 0 1 ${len} ${r2} C ${len - m} ${r2 + bulge * 0.4}, ${m} ${r1 + bulge}, 0 ${r1} A ${r1} ${r1} 0 0 1 0 ${-r1} Z`;
  return (
    <g transform={`translate(${a[0]} ${a[1]}) rotate(${(ang * 180) / Math.PI})`}>
      <defs><linearGradient id={id} gradientUnits="userSpaceOnUse" x1={0} y1={-R} x2={0} y2={R}>{stops.map((s) => <stop key={s.u} offset={(s.u + 1) / 2} stopColor={hexA(s.v, s.warm)} />)}</linearGradient></defs>
      <path d={path} fill={`url(#${id})`} stroke="#000" strokeOpacity={0.34} strokeWidth={3} />
      {Array.from({ length: folds }, (_, i) => { const x = len * (0.12 + (0.76 * (i + 0.5)) / folds); const s = i % 2 ? 1 : -1; return <path key={i} d={`M${x} ${-r1 * 0.75 * s} q ${10} ${r1 * 0.5 * s} ${-6} ${r1 * 1.1 * s}`} stroke="#000" strokeOpacity={0.22} strokeWidth={4} fill="none" strokeLinecap="round" />; })}
    </g>
  );
};
/** two-bone IK: joint position; bend = +1/-1 side */
const ik = (a: V, b: V, l1: number, l2: number, bend: number): V => {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.5) || 1;
  const k = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), g = Math.atan2(dy, dx) + bend * k;
  return [a[0] + Math.cos(g) * l1, a[1] + Math.sin(g) * l1];
};
export type Pose = { hip: V; lean: number; hand: V; rear: V; footF: V; footB: V; head?: number; sword?: number; noSword?: boolean };
// Local units: standing fencer about 760 tall, facing +x, feet on y = 0 (up is negative).
export const EN_GARDE: Pose = { hip: [0, -370], lean: 6, hand: [210, -560], rear: [-190, -690], footF: [150, 0], footB: [-150, 0], sword: -4 };
export const LUNGE: Pose = { hip: [60, -270], lean: 20, hand: [400, -520], rear: [-180, -420], footF: [330, 0], footB: [-270, 0], sword: 3 };
export const STAND: Pose = { hip: [0, -420], lean: 0, hand: [90, -420], rear: [-70, -400], footF: [44, 0], footB: [-44, 0], sword: 60 };
export const PROTEST: Pose = { hip: [0, -420], lean: -4, hand: [60, -400], rear: [-70, -960], footF: [60, 0], footB: [-60, 0], sword: 70, head: -10 };
export const mix = (p: Pose, q: Pose, k: number): Pose => {
  const m = (a: V, b: V): V => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  return { hip: m(p.hip, q.hip), lean: lerp(p.lean, q.lean, k), hand: m(p.hand, q.hand), rear: m(p.rear, q.rear), footF: m(p.footF, q.footF), footB: m(p.footB, q.footB), head: lerp(p.head ?? 0, q.head ?? 0, k), sword: lerp(p.sword ?? 0, q.sword ?? 0, k), noSword: p.noSword };
};
/** Fencing mask (facing +x), head centre at 0,0, about 170 wide. */
export const MaskG: React.FC<{ tone?: number; rim?: number }> = ({ tone = 0.8, rim = 0.6 }) => {
  const id = React.useId().replace(/[^a-z0-9]/gi, "");
  const c = (v: number) => hexA(v * (0.35 + 0.75 * tone), 0.6);
  const dome = "M-40 -86 C 12 -108, 84 -80, 92 -8 C 96 46, 70 88, 26 98 C -14 84, -46 52, -54 8 C -60 -30, -54 -64, -40 -86 Z";
  return (
    <g>
      <defs>
        <radialGradient id={`d${id}`} cx="0.36" cy="0.24" r="0.95"><stop offset="0" stopColor={c(0.86)} /><stop offset="0.22" stopColor={c(0.5)} /><stop offset="0.58" stopColor={c(0.2)} /><stop offset="1" stopColor={c(0.07)} /></radialGradient>
        <pattern id={`m${id}`} width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(8)"><rect width={7} height={7} fill="none" /><path d="M0 0H7M0 0V7" stroke="#000" strokeOpacity={0.62} strokeWidth={2.6} /><path d="M1.6 2.6H7" stroke="#fff" strokeOpacity={0.16} strokeWidth={1} /></pattern>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="1" y2="0.5"><stop offset="0" stopColor={c(0.62)} /><stop offset="0.4" stopColor={c(1)} /><stop offset="1" stopColor={c(0.36)} /></linearGradient>
      </defs>
      <path d="M-34 -70 C -84 -66, -92 0, -66 44 C -52 66, -30 70, -14 66 L-30 -60 Z" fill={c(0.16)} />
      <path d="M-60 30 C -40 70, 0 92, 40 92 C 66 96, 84 92, 86 70 C 100 110, 92 150, 66 178 C 10 196, -44 184, -80 150 C -84 110, -76 64, -60 30 Z" fill={`url(#b${id})`} stroke="#000" strokeOpacity={0.45} strokeWidth={3} />
      {[0, 1, 2].map((k) => <path key={k} d={`M${-44 + k * 34} ${80 + k * 10} Q ${-44 + k * 38} 130 ${-36 + k * 40} 178`} stroke="#000" strokeOpacity={0.28} strokeWidth={4} fill="none" />)}
      <path d="M-72 146 C -38 176, 10 186, 64 168" stroke="#000" strokeOpacity={0.4} strokeWidth={2.5} strokeDasharray="7 5" fill="none" />
      <path d={dome} fill={`url(#d${id})`} /><path d={dome} fill={`url(#m${id})`} />
      <path d="M-40 -86 C -54 -64, -60 -30, -54 8 C -46 52, -14 84, 26 98" stroke={c(0.95)} strokeWidth={15} fill="none" /><path d="M-40 -86 C -54 -64, -60 -30, -54 8 C -46 52, -14 84, 26 98" stroke="#000" strokeOpacity={0.4} strokeWidth={2.5} strokeDasharray="6 5" fill="none" />
      <path d={dome} fill="none" stroke="#0b0c0e" strokeWidth={5} />
      <path d="M14 -96 C 70 -84, 92 -40, 92 0 C 94 34, 82 64, 64 80" stroke="#a3bfdb" strokeWidth={4.5} fill="none" opacity={0.35 + 0.65 * rim} />
      <path d="M-22 -72 C 0 -84, 26 -82, 44 -70" stroke="#fff" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.5 * tone} style={{ filter: "blur(2.5px)" }} />
    </g>
  );
};
/** Masked fencer (no face). flip = face left. tone = cloth brightness (Boris 0.5, opponents 0.85). One silhouette is lit as a whole, with cloth wrinkles and a blue rim. */
export const Fencer: React.FC<{ x: number; y: number; s?: number; flip?: boolean; pose: Pose; tone?: number; rim?: number; bladeGlow?: boolean; shadow?: number }> = ({ x, y, s = 1, flip, pose, tone = 0.8, rim = 0.55, shadow = 0.75 }) => {
  const fid = `fn${React.useId().replace(/[^a-z0-9]/gi, "")}`;
  const L = (pose.lean * Math.PI) / 180;
  const at = (d: number, o = 0): V => [pose.hip[0] + Math.sin(L) * d + Math.cos(L) * o, pose.hip[1] - Math.cos(L) * d + Math.sin(L) * o];
  const chest = at(235), neck = at(290);
  const elF = ik(chest, pose.hand, 150, 160, 1), elB = ik(chest, pose.rear, 150, 160, -1);
  const kF = ik(pose.hip, pose.footF, 215, 220, -1), kB = ik(pose.hip, pose.footB, 215, 220, -1);
  const sw = pose.sword ?? 0;
  const shoe = (f: V, o: number) => <><path d={`M${f[0] - 36} ${f[1] + 4} q -4 -46 28 -54 q 30 6 48 24 q 48 4 52 30 Z`} fill={hexA(0.62 * o * tone, 0)} /><path d={`M${f[0] - 38} ${f[1] + 6} h132 v-9 h-131 Z`} fill="#0b0c0e" /><path d={`M${f[0] + 4} ${f[1] - 40} l34 22 M${f[0] - 4} ${f[1] - 30} l34 22`} stroke="#0b0c0e" strokeWidth={5} /></>;
  const cuff = (k: V, f: V, o: number) => { const dx = f[0] - k[0], dy = f[1] - k[1], n = Math.hypot(dx, dy) || 1, p: V = [k[0] + dx * 0.24, k[1] + dy * 0.24]; return <path d={`M${p[0] - (dy / n) * 47} ${p[1] + (dx / n) * 47} L${p[0] + (dy / n) * 47} ${p[1] - (dx / n) * 47}`} stroke="#0d0f12" strokeOpacity={0.85 * o} strokeWidth={9} />; };
  const arm = (p: V, q: V, k: number): V => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
  const belt = [at(6, -82), at(-8, 82)];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <filter id={fid} x="-40%" y="-25%" width="180%" height="150%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.013 0.022" numOctaves={3} seed={7} result="n" />
          <feGaussianBlur in="SourceAlpha" stdDeviation={13} result="bl" />
          <feComposite in="bl" in2="n" operator="arithmetic" k1={0} k2={1} k3={0.42} k4={0} result="h" />
          <feDiffuseLighting in="h" surfaceScale={17} diffuseConstant={1.5} lightingColor="#fff4de" result="l"><feDistantLight azimuth={228} elevation={44} /></feDiffuseLighting>
          <feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1={1.25} k2={0.1} k3={0} k4={0} result="c0" />
          <feComposite in="c0" in2="SourceAlpha" operator="in" result="c" />
          <feOffset in="SourceAlpha" dx={-8} dy={5} result="of" />
          <feComposite in="SourceAlpha" in2="of" operator="out" result="rm" />
          <feGaussianBlur in="rm" stdDeviation={1.6} result="rb" />
          <feFlood floodColor="#b9d4ee" floodOpacity={0.9 * rim} result="rf" />
          <feComposite in="rf" in2="rb" operator="in" result="r1" />
          <feComposite in="r1" in2="SourceAlpha" operator="in" result="r" />
          <feMerge><feMergeNode in="c" /><feMergeNode in="r" /></feMerge>
        </filter>
      </defs>
      <g transform={flip ? "scale(-1 1)" : undefined}><ellipse cx={(pose.footF[0] + pose.footB[0]) / 2 + 30} cy={14} rx={Math.abs(pose.footF[0] - pose.footB[0]) / 2 + 120} ry={26} fill="#000" opacity={shadow} style={{ filter: "blur(12px)" }} /></g>
      <g filter={`url(#${fid})`}>
        <g transform={flip ? "scale(-1 1)" : undefined}>
          <Limb a={chest} b={elB} r1={44} r2={34} bulge={3} tone={tone * 0.6} rim={rim} folds={2} />
          <Limb a={elB} b={pose.rear} r1={34} r2={24} tone={tone * 0.6} rim={rim} folds={1} />
          <circle cx={pose.rear[0]} cy={pose.rear[1]} r={26} fill={hexA(tone * 0.42, 0)} />
          <Limb a={kB} b={[pose.footB[0], pose.footB[1] - 26]} r1={40} r2={24} bulge={8} tone={tone * 0.5} rim={rim} />
          <Limb a={pose.hip} b={kB} r1={70} r2={50} bulge={9} tone={tone * 0.62} rim={rim} folds={2} />
          {cuff(kB, pose.footB, 1)}{shoe(pose.footB, 0.7)}
          <Limb a={kF} b={[pose.footF[0], pose.footF[1] - 26]} r1={43} r2={25} bulge={9} tone={tone * 0.8} rim={rim} />
          <Limb a={pose.hip} b={kF} r1={74} r2={53} bulge={10} tone={tone * 0.96} rim={rim} folds={2} />
          {cuff(kF, pose.footF, 1)}{shoe(pose.footF, 1)}
          <Limb a={[pose.hip[0], pose.hip[1] + 8]} b={chest} r1={82} r2={88} bulge={8} tone={tone} rim={rim} folds={3} />
          <path d={`M${belt[0][0]} ${belt[0][1]} Q${at(-34)[0]} ${at(-34)[1]} ${belt[1][0]} ${belt[1][1]}`} stroke="#0d0f12" strokeOpacity={0.7} strokeWidth={8} fill="none" />
          <path d={`M${at(0, 34)[0]} ${at(0, 34)[1]} Q${at(130, 62)[0]} ${at(130, 62)[1]} ${at(250, 30)[0]} ${at(250, 30)[1]}`} stroke="#0d0f12" strokeOpacity={0.5} strokeWidth={5} fill="none" />
          <g transform={`translate(${neck[0] + 4} ${neck[1] - 62}) rotate(${pose.lean * 0.5 + (pose.head ?? 0)}) scale(0.96)`}><MaskG tone={tone} rim={rim} /></g>
        </g>
      </g>
      <g transform={flip ? "scale(-1 1)" : undefined}>
      {!pose.noSword && (
        <g transform={`translate(${pose.hand[0]} ${pose.hand[1]}) rotate(${sw})`}>
          <path d="M30 -5 L490 -2 L490 2 L30 5 Z" fill="#e4ebf2" /><path d="M30 0 L490 0 L490 2 L30 5 Z" fill="#39414b" />
          <circle cx={491} cy={0} r={4.5} fill="#eef2f6" />
          <path d="M18 -47 Q66 -42 66 0 Q66 42 18 47 Q28 0 18 -47 Z" fill="#7e8894" /><path d="M20 -45 Q58 -40 62 -8 Q44 -26 24 -20 Z" fill="#f4f0e4" /><path d="M18 47 Q60 42 65 8" stroke="#a3bfdb" strokeWidth={3} fill="none" />
          <rect x={-62} y={-9} width={82} height={18} rx={8} fill="#15171a" />
        </g>
      )}
      </g>
      <g filter={`url(#${fid})`}><g transform={flip ? "scale(-1 1)" : undefined}>
        <Limb a={chest} b={elF} r1={50} r2={38} bulge={4} tone={tone} rim={rim} folds={2} />
        <Limb a={elF} b={pose.hand} r1={38} r2={28} tone={tone} rim={rim} folds={1} />
        <Limb a={arm(elF, pose.hand, 0.5)} b={pose.hand} r1={40} r2={30} tone={tone * 0.36} rim={rim} />
        <Limb a={[pose.hand[0] - 14, pose.hand[1]]} b={[pose.hand[0] + 14, pose.hand[1] + 2]} r1={31} r2={27} tone={tone * 0.36} rim={rim} />
      </g></g>
    </g>
  );
};
/** Fencer on its own svg, for use directly inside a Layer. */
export const Fig: React.FC<React.ComponentProps<typeof Fencer>> = (p) => <Svg><Fencer {...p} /></Svg>;

// ---- HUD (y from 280, secondary text >= 40 px)
export const Title: React.FC<{ t: number; a: number; b: number; text: string; y?: number; size?: number; color?: string; kicker?: string }> = ({ t, a, b, text, y = 290, size = 132, color = C.bone, kicker }) => {
  const v = win(t, a, b, 0.12, 0.22);
  if (v <= 0) return null;
  const k = 1 - Math.pow(1 - clamp((t - a) / 0.22), 3);
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: y, textAlign: "center", opacity: v }}>
      {kicker && <div style={{ fontFamily: F_LABEL, fontWeight: 800, fontSize: 48, letterSpacing: 8, color: C.bone, textShadow: "0 2px 16px #000" }}>{kicker}</div>}
      <div style={{ fontFamily: F_STAMP, fontSize: size, lineHeight: 1.04, letterSpacing: 2, color, textShadow: "0 8px 34px rgba(0,0,0,0.8)", transform: `scale(${1.28 - 0.28 * k})` }}>{text}</div>
    </div>
  );
};
/** Ink stamp in a box (verdicts). */
export const Stamp: React.FC<{ t: number; a: number; b: number; text: string; y: number; color?: string; size?: number }> = ({ t, a, b, text, y, color = C.red, size = 118 }) => {
  const v = win(t, a, b, 0.06, 0.22);
  if (v <= 0) return null;
  const k = clamp((t - a) / 0.16);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: v }}>
      <span style={{ display: "inline-block", fontFamily: F_STAMP, fontSize: size, lineHeight: 1, letterSpacing: 4, color, border: `9px solid ${color}`, padding: "18px 34px 14px", background: "rgba(7,8,10,0.62)", transform: `scale(${1.7 - 0.7 * (1 - Math.pow(1 - k, 3))})` }}>{text}</span>
    </div>
  );
};
export const Tag: React.FC<{ t: number; a: number; b: number; text: string; x?: number; y: number; align?: "left" | "center"; size?: number; line?: V }> = ({ t, a, b, text, x = 540, y, align = "center", size = 56, line }) => {
  const v = win(t, a, b, 0.15, 0.2);
  if (v <= 0) return null;
  return (
    <>
      {line && <Svg style={{ opacity: v }}><line x1={x} y1={y + size} x2={lerp(x, line[0], seg(t, a, a + 0.35))} y2={lerp(y + size, line[1], seg(t, a, a + 0.35))} stroke={C.bone} strokeWidth={4} /><circle cx={line[0]} cy={line[1]} r={10 * seg(t, a + 0.3, a + 0.45)} fill="none" stroke={C.bone} strokeWidth={4} /></Svg>}
      <div style={{ position: "absolute", left: align === "center" ? x - 480 : x, width: 960, top: y, textAlign: align, opacity: v }}>
        <span style={{ display: "inline-block", fontFamily: F_LABEL, fontWeight: 800, fontSize: size, letterSpacing: 3, color: C.ink, background: C.bone, padding: "6px 26px 4px", transform: `scale(${pop(t, a)})`, boxShadow: "0 10px 34px rgba(0,0,0,0.6)" }}>{text}</span>
      </div>
    </>
  );
};
// ---- karaoke: one line, <= 24 characters, y 1300
const LINES: Word[][] = [];
for (const c of CLIPS) {
  let cur: Word[] = [];
  const len = (ws: Word[]) => ws.map((w) => w.w).join(" ").length;
  for (const w of c.words) {
    if (cur.length && len([...cur, w]) > 24) { LINES.push(cur); cur = []; }
    cur.push(w);
    if (/[.!?,]$/.test(w.w) && len(cur) > 8) { LINES.push(cur); cur = []; }
  }
  if (cur.length) LINES.push(cur);
}
export const Karaoke: React.FC<{ t: number; y?: number }> = ({ t, y = 1300 }) => {
  let i = -1;
  LINES.forEach((l, j) => { if (t >= l[0].s - 0.05) i = j; });
  if (i < 0) return null;
  const line = LINES[i], end = line[line.length - 1].e + 0.35;
  if (t > end) return null;
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: y, display: "flex", justifyContent: "center", gap: "0.42em", fontFamily: F_CAPTION, fontWeight: 800, fontSize: 62, lineHeight: 1.2, whiteSpace: "nowrap" }}>
      {line.map((w, j) => {
        const on = t >= w.s - 0.03 && t < w.e + 0.02, past = t >= w.s - 0.03;
        return <span key={j} style={{ color: on ? "#ffffff" : C.bone, opacity: past ? 1 : 0.5, transform: `scale(${on ? 1.04 : 1})`, textShadow: "0 3px 4px #000, 0 0 22px rgba(0,0,0,0.95), 0 0 46px rgba(0,0,0,0.8)" }}>{w.w}</span>;
      })}
    </div>
  );
};
