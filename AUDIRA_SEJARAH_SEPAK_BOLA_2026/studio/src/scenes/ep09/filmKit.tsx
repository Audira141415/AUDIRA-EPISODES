// EP09 film toolkit: materials, pose blending, camera paths, screen projection, comic panels and HUD lettering.
// Layout units are 1080x1920; canvases are sized in real pixels (x k) so halftone dots match the cover.
import React, { useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { COMIC_PALETTE as P } from "../../kits/comicforge/lib/palette.ts";
import { rng } from "../../kits/comicforge/core/motion.ts";
import { ANTON, GROT, GREEN, burstPoints, useKits } from "./Cover.tsx";
import { FigurePose, Kit, Limb, V3, tone } from "./comic.tsx";
import { pop, seg, win } from "./timing.ts";

export { ANTON, GROT, GREEN, P };
export const GOLD = "#FFC21A";

// ---------- materials ----------
export const useFilmMats = (dotPx: number) => {
  const base = useKits(dotPx);
  return useMemo(() => {
    const skin = base.arg.skin;
    const black = tone(dotPx, "#2A2C36", "#0E0F14");
    const ref: Kit = { shirt: black, sleeve: black, shorts: black, socks: black, skin, hair: tone(dotPx, "#2A1E18", "#121014"), boot: base.arg.boot, face: true };
    const engNum: Kit = { ...base.eng, number: "10", numberColor: "#1E2A6E" };
    const suit: Kit = { ...base.arg, number: undefined, shirt: tone(dotPx, "#2346B0", "#0F2160"), sleeve: tone(dotPx, "#2346B0", "#0F2160"), longSleeves: true };
    return {
      ...base,
      ref,
      engNum,
      suit,
      yellow: tone(dotPx, P.yellow, P.yellowShade, { spec: 1 }),
      red: tone(dotPx, P.red, "#8E0010"),
      gold: tone(dotPx, "#FFD24A", "#B07A10", { spec: 1 }),
      steel: tone(dotPx, "#C9D3E0", "#56607A", { spec: 1 }),
      dark: tone(dotPx, "#2A2E3A", "#0E1018"),
      cloth: tone(dotPx, "#1E3A8A", "#0B1A4A"),
      wood: tone(dotPx, "#C98A5E", "#7A4A2A"),
      sea: tone(dotPx, "#36A6E6", "#1B5FA0"),
      land: tone(dotPx, "#F4D9A0", "#C29A5A"),
      island: tone(dotPx, P.yellow, P.yellowShade),
      tvBody: tone(dotPx, "#E5007D", "#8E0050", { spec: 1 }),
      white: tone(dotPx, "#FFFFFF", "#9DB0C8"),
      dotPx,
    };
  }, [base, dotPx]);
};
export type FilmMats = ReturnType<typeof useFilmMats>;

// ---------- pose blending ----------
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpLimb = (a: Limb, b: Limb, k: number): Limb => ({ x: lerp(a.x, b.x, k), z: lerp(a.z ?? 0, b.z ?? 0, k), bend: lerp(a.bend, b.bend, k) });
export const lerpPose = (a: FigurePose, b: FigurePose, k: number): FigurePose => ({
  lean: lerp(a.lean ?? 0, b.lean ?? 0, k),
  side: lerp(a.side ?? 0, b.side ?? 0, k),
  head: lerp(a.head ?? 0, b.head ?? 0, k),
  armL: lerpLimb(a.armL, b.armL, k),
  armR: lerpLimb(a.armR, b.armR, k),
  legL: lerpLimb(a.legL, b.legL, k),
  legR: lerpLimb(a.legR, b.legR, k),
});
/** Alternating run cycle around RUN-like pose (phase in radians). */
export const runCycle = (ph: number, lean = 0.28): FigurePose => {
  const s = Math.sin(ph);
  return {
    lean,
    head: 0.05,
    armL: { x: 0.8 * s, z: 0.3, bend: -1.2 },
    armR: { x: -0.8 * s, z: 0.3, bend: -1.2 },
    legL: { x: -0.85 * s, bend: 0.5 + 0.6 * Math.max(0, s) },
    legR: { x: 0.85 * s, bend: 0.5 + 0.6 * Math.max(0, -s) },
  };
};
export const STAND: FigurePose = {
  lean: 0.04,
  head: 0,
  armL: { x: 0.05, z: 0.18, bend: -0.3 },
  armR: { x: -0.05, z: 0.18, bend: -0.3 },
  legL: { x: 0.05, z: 0.06, bend: 0.12 },
  legR: { x: -0.05, z: 0.06, bend: 0.12 },
};
export const CHEER: FigurePose = {
  lean: -0.08,
  head: -0.3,
  armL: { x: -2.7, z: 0.45, bend: -0.2 },
  armR: { x: -2.7, z: 0.45, bend: -0.2 },
  legL: { x: 0.1, bend: 0.2 },
  legR: { x: -0.35, bend: 0.9 },
};

// ---------- camera paths ----------
export type CamKey = { t: number; pos: V3; target: V3; fov?: number };
/** Centripetal Catmull-Rom through keys, time-parameterised (piecewise-linear time -> curve parameter). */
export const camPath = (keys: CamKey[], t: number) => {
  const pc = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.pos)), false, "centripetal");
  const tc = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.target)), false, "centripetal");
  const n = keys.length - 1;
  let i = 0;
  while (i < n - 1 && t > keys[i + 1].t) i++;
  const f = Math.min(1, Math.max(0, (t - keys[i].t) / (keys[i + 1].t - keys[i].t)));
  const u = Math.min(1, Math.max(0, (i + f) / n));
  const p = pc.getPoint(u);
  const q = tc.getPoint(u);
  const fov = (keys[i].fov ?? 45) + ((keys[i + 1].fov ?? 45) - (keys[i].fov ?? 45)) * f;
  return { pos: [p.x, p.y, p.z] as V3, target: [q.x, q.y, q.z] as V3, fov };
};

/** World point -> panel pixel (1080 units) for HTML labels pinned to 3D objects. */
export const project = (p: V3, cam: { pos: V3; target: V3; fov: number }, w: number, h: number) => {
  const c = new THREE.PerspectiveCamera(cam.fov, w / h, 0.05, 500);
  c.position.set(...cam.pos);
  c.lookAt(...cam.target);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h };
};

// ---------- layout ----------
export const useK = () => {
  const { width } = useVideoConfig();
  return width / 1080;
};

/** HTML stage in 1080x1920 units, scaled to the composition. */
export const Stage: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const k = useK();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0", ...style }}>{children}</div>
    </AbsoluteFill>
  );
};

export type Rect = { x: number; y: number; w: number; h: number };
/** Slants: how far each corner is pulled in (top-left, top-right, bottom-right, bottom-left) in px. */
export type Slant = [number, number, number, number];

/**
 * A comic panel: slanted clip, 2D background, transparent 3D canvas, thick ink border.
 * `reveal` 0..1 wipes the panel in from the left with a slanted edge (reading direction).
 */
export const Panel: React.FC<{
  r: Rect;
  slant?: Slant;
  reveal?: number;
  bg?: React.ReactNode;
  children?: React.ReactNode;
  camera?: V3;
  style?: React.CSSProperties;
}> = ({ r, slant = [0, 0, 0, 0], reveal = 1, bg, children, camera = [0, 2, 8], style }) => {
  const k = useK();
  if (reveal <= 0.001) return null;
  const [tl, tr, br, bl] = slant;
  const pts = `${0},${tl} ${r.w},${tr} ${r.w},${r.h - br} ${0},${r.h - bl}`;
  const shape = `polygon(0px ${tl * k}px, ${r.w * k}px ${tr * k}px, ${r.w * k}px ${(r.h - br) * k}px, 0px ${(r.h - bl) * k}px)`;
  const slope = 0.22 * r.h;
  const edge = reveal * (r.w + slope + 40) - 20;
  const wipe =
    reveal >= 0.999
      ? undefined
      : `polygon(-20px -20px, ${(edge + slope / 2) * k}px -20px, ${(edge - slope / 2) * k}px ${(r.h + 20) * k}px, -20px ${(r.h + 20) * k}px)`;
  return (
    <div style={{ position: "absolute", left: r.x * k, top: r.y * k, width: r.w * k, height: r.h * k, clipPath: wipe, ...style }}>
      <div style={{ position: "absolute", inset: 0, clipPath: shape }}>
        {bg && (
          <svg width={r.w * k} height={r.h * k} viewBox={`0 0 ${r.w} ${r.h}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
            {bg}
          </svg>
        )}
        {children && (
          <ThreeCanvas width={Math.round(r.w * k)} height={Math.round(r.h * k)} gl={{ antialias: true, alpha: true }} camera={{ position: camera, fov: 40 }} style={{ position: "absolute", inset: 0 }}>
            {children}
          </ThreeCanvas>
        )}
      </div>
      <svg width={r.w * k} height={r.h * k} viewBox={`0 0 ${r.w} ${r.h}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <polygon points={pts} fill="none" stroke={P.ink} strokeWidth={9} strokeLinejoin="miter" />
      </svg>
    </div>
  );
};

// ---------- 2D panel backgrounds (SVG children; viewBox = panel size) ----------
let bgId = 0;
export const RaysBg: React.FC<{ w: number; h: number; cx: number; cy: number; inner: string; outer: string; ray: string; ray2?: string; dot: string; n?: number; seed?: number; rot?: number }> = ({
  w,
  h,
  cx,
  cy,
  inner,
  outer,
  ray,
  ray2 = P.yellow,
  dot,
  n = 30,
  seed = 1,
  rot = 0,
}) => {
  const id = useMemo(() => `rb${bgId++}`, []);
  const rays = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + r() * 0.05;
      const wd = 0.035 + r() * 0.03;
      const L = 3000;
      return { d: `M0,0 L${Math.cos(a - wd) * L},${Math.sin(a - wd) * L} L${Math.cos(a + wd) * L},${Math.sin(a + wd) * L} Z`, c: i % 3 === 0 ? ray2 : ray };
    });
  }, [n, seed, ray, ray2]);
  return (
    <>
      <defs>
        <pattern id={`${id}d`} width={22} height={22} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx={11} cy={11} r={6} fill={dot} />
        </pattern>
        <radialGradient id={`${id}g`} cx={cx} cy={cy} r={Math.max(w, h) * 0.8} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={inner} />
          <stop offset="1" stopColor={outer} />
        </radialGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#${id}g)`} />
      <rect width={w} height={h} fill={`url(#${id}d)`} opacity={0.5} />
      <g transform={`translate(${cx},${cy}) rotate(${rot})`}>
        {rays.map((x, i) => (
          <path key={i} d={x.d} fill={x.c} opacity={0.6} />
        ))}
      </g>
    </>
  );
};

export const SkyBg: React.FC<{ w: number; h: number; top: string; low: string; dot: string; dotOpacity?: number }> = ({ w, h, top, low, dot, dotOpacity = 0.35 }) => {
  const id = useMemo(() => `sb${bgId++}`, []);
  return (
    <>
      <defs>
        <pattern id={`${id}d`} width={22} height={22} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx={11} cy={11} r={5.5} fill={dot} />
        </pattern>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={low} />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#${id}g)`} />
      <rect width={w} height={h} fill={`url(#${id}d)`} opacity={dotOpacity} />
    </>
  );
};

/** Full page backdrop: night-purple newsprint with Ben-Day dots (same as the cover). */
export const PageBg: React.FC = () => (
  <svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <pattern id="ep09page" width={26} height={26} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <circle cx={13} cy={13} r={7} fill="#5A2E9C" />
      </pattern>
    </defs>
    <rect width={1080} height={1920} fill={P.skyTop} />
    <rect width={1080} height={1920} fill="url(#ep09page)" />
  </svg>
);

// ---------- HUD lettering (1080 units, inside <Stage>) ----------
/** Yellow comic narration box (caption box) for place/time facts. */
export const NarrBox: React.FC<{ t: number; a: number; b: number; x: number; y: number; size?: number; rot?: number; bg?: string; color?: string; children: React.ReactNode; right?: boolean }> = ({
  t,
  a,
  b,
  x,
  y,
  size = 46,
  rot = -1.5,
  bg = P.yellow,
  color = P.ink,
  children,
  right,
}) => {
  const o = win(t, a, b, 0.18, 0.22);
  if (o <= 0.001) return null;
  const s = 0.85 + 0.15 * pop(t, a, 0.3);
  return (
    <div
      style={{
        position: "absolute",
        [right ? "right" : "left"]: x,
        top: y,
        opacity: o,
        transform: `rotate(${rot}deg) scale(${s})`,
        transformOrigin: right ? "right top" : "left top",
        background: bg,
        border: `5px solid ${P.ink}`,
        boxShadow: `8px 8px 0 ${P.ink}`,
        padding: "6px 20px 4px",
        fontFamily: ANTON,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: 1,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

/** Player / official name card: name, country, number, small kit swatch. */
export const NameCard: React.FC<{ t: number; a: number; b: number; x: number; y: number; name: string; sub: string; num?: string; shirt: string; numColor?: string; right?: boolean }> = ({
  t,
  a,
  b,
  x,
  y,
  name,
  sub,
  num,
  shirt,
  numColor = "#FFFFFF",
  right,
}) => {
  const o = win(t, a, b, 0.2, 0.25);
  if (o <= 0.001) return null;
  const dx = (1 - seg(t, a, a + 0.3)) * (right ? 60 : -60);
  return (
    <div
      style={{
        position: "absolute",
        [right ? "right" : "left"]: x,
        top: y,
        opacity: o,
        transform: `translateX(${dx}px) rotate(${right ? 1.5 : -1.5}deg)`,
        display: "flex",
        alignItems: "stretch",
        background: "#FFF6E0",
        border: `5px solid ${P.ink}`,
        boxShadow: `7px 7px 0 ${P.ink}`,
      }}
    >
      <div style={{ width: 92, background: shirt, borderRight: `5px solid ${P.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 58, color: numColor, WebkitTextStroke: `3px ${P.ink}`, paintOrder: "stroke fill" }}>
        {num ?? ""}
      </div>
      <div style={{ padding: "6px 18px 6px", lineHeight: 1.04 }}>
        <div style={{ fontFamily: ANTON, fontSize: 46, letterSpacing: 1, color: P.ink }}>{name}</div>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 32, color: P.ink }}>{sub}</div>
      </div>
    </div>
  );
};

/** Rubber stamp (screen space). */
export const Stamp: React.FC<{ t: number; a: number; b: number; y: number; text: string; sub?: string; color?: string; rot?: number; size?: number }> = ({
  t,
  a,
  b,
  y,
  text,
  sub,
  color = P.red,
  rot = -6,
  size = 110,
}) => {
  const o = win(t, a, b, 0.08, 0.25);
  if (o <= 0.001) return null;
  const s = 1.35 - 0.35 * seg(t, a, a + 0.16);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ transform: `rotate(${rot}deg) scale(${s})`, background: "#FFF6E0", border: `6px solid ${P.ink}`, boxShadow: `9px 9px 0 ${P.ink}`, padding: "10px 16px" }}>
        <div style={{ border: `8px solid ${color}`, padding: "2px 26px 6px", textAlign: "center" }}>
          <div style={{ fontFamily: ANTON, fontSize: size, lineHeight: 1.02, letterSpacing: 3, color }}>{text}</div>
          {sub && <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 36, color: P.ink, marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
};

/** Onomatopoeia burst (TAP!, GOL!). cx/cy = centre in 1080 units. */
export const Burst: React.FC<{ t: number; a: number; b: number; cx: number; cy: number; text: string; fill?: string; ring?: string; color?: string; size?: number; seed?: number; rot?: number }> = ({
  t,
  a,
  b,
  cx,
  cy,
  text,
  fill = P.yellow,
  ring = P.red,
  color = P.red,
  size = 1,
  seed = 77,
  rot = -8,
}) => {
  const o = win(t, a, b, 0.05, 0.2);
  if (o <= 0.001) return null;
  const s = size * (0.4 + 0.6 * pop(t, a, 0.28));
  return (
    <div style={{ position: "absolute", left: cx - 230, top: cy - 160, width: 460, height: 320, opacity: o, transform: `scale(${s}) rotate(${rot}deg)` }}>
      <svg width={460} height={320} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <polygon points={burstPoints(230, 160, 16, 230, 150, seed)} fill={P.ink} transform="translate(10,10)" />
        <polygon points={burstPoints(230, 160, 16, 230, 150, seed)} fill={ring} stroke={P.ink} strokeWidth={7} />
        <polygon points={burstPoints(230, 160, 14, 172, 126, seed + 2)} fill={fill} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 92, textAlign: "center", fontFamily: ANTON, fontSize: 128, lineHeight: 1, color, WebkitTextStroke: `7px ${P.ink}`, paintOrder: "stroke fill", textShadow: `7px 7px 0 ${P.ink}` }}>{text}</div>
    </div>
  );
};

/** Mini score chip (top right). */
export const ScoreChip: React.FC<{ o: number; score: string; minute: string }> = ({ o, score, minute }) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", right: 56, top: 290, opacity: o, display: "flex", border: `5px solid ${P.ink}`, boxShadow: `7px 7px 0 ${P.ink}`, fontFamily: ANTON, fontSize: 44, lineHeight: 1 }}>
      <div style={{ background: "#74ACDF", color: P.ink, padding: "10px 14px 6px" }}>ARG</div>
      <div style={{ background: P.ink, color: "#FFFFFF", padding: "10px 16px 6px" }}>{score}</div>
      <div style={{ background: "#FFFFFF", color: P.ink, padding: "10px 14px 6px" }}>ING</div>
      <div style={{ background: GREEN, color: P.ink, padding: "10px 14px 6px", borderLeft: `5px solid ${P.ink}` }}>{minute}</div>
    </div>
  );

/** Speech balloon with tail pointing to (tx, ty). */
export const Balloon: React.FC<{ o: number; x: number; y: number; w: number; h: number; tx: number; ty: number; children: React.ReactNode }> = ({ o, x, y, w, h, tx, ty, children }) => {
  if (o <= 0.001) return null;
  const cx = x + w / 2;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <ellipse cx={cx + 10} cy={y + h / 2 + 10} rx={w / 2} ry={h / 2} fill={P.ink} />
        <path d={`M${cx - 60},${y + h - 30} L${tx},${ty} L${cx + 40},${y + h - 20} Z`} fill="#FFFFFF" stroke={P.ink} strokeWidth={7} strokeLinejoin="round" />
        <ellipse cx={cx} cy={y + h / 2} rx={w / 2} ry={h / 2} fill="#FFFFFF" stroke={P.ink} strokeWidth={7} />
        <path d={`M${cx - 52},${y + h - 34} L${cx + 36},${y + h - 26}`} stroke="#FFFFFF" strokeWidth={12} />
      </svg>
      <div style={{ position: "absolute", left: x + w * 0.12, top: y, width: w * 0.76, height: h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>{children}</div>
    </div>
  );
};
