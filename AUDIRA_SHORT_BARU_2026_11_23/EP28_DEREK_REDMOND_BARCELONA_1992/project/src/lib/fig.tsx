// CHRONICLE 2D: posable black silhouette with a coloured contour (no faces, no likeness).
import React from "react";

export type Pose = "run" | "walk" | "stand" | "jump" | "crouch" | "armsUp" | "wave" | "set";

const D = Math.PI / 180;
type P = { x: number; y: number };
const seg = (a: P, len: number, deg: number): P => ({ x: a.x + len * Math.sin(deg * D), y: a.y + len * Math.cos(deg * D) });

// Joint angles in degrees from straight down; positive = towards facing direction.
type Angles = { lean: number; thA: number; flA: number; thB: number; flB: number; uaA: number; faA: number; uaB: number; faB: number; bob: number; head: number };

export function poseAngles(pose: Pose, phase: number, k = 1): Angles {
  const th = phase * Math.PI * 2;
  switch (pose) {
    case "run": {
      const s = Math.sin(th), c = Math.cos(th);
      return {
        lean: 14, head: 0,
        thA: 42 * s * k, flA: 18 + 85 * Math.max(0, c) * k,
        thB: -42 * s * k, flB: 18 + 85 * Math.max(0, -c) * k,
        uaA: 8 - 62 * s * k, faA: 78, uaB: 8 + 62 * s * k, faB: 78,
        bob: -9 * Math.abs(Math.cos(th)) * k,
      };
    }
    case "walk": {
      const s = Math.sin(th), c = Math.cos(th);
      return {
        lean: 3, head: 0,
        thA: 22 * s, flA: 6 + 30 * Math.max(0, c),
        thB: -22 * s, flB: 6 + 30 * Math.max(0, -c),
        uaA: -18 * s, faA: 20, uaB: 18 * s, faB: 20,
        bob: -3 * Math.abs(Math.cos(th)),
      };
    }
    case "jump": // flight: hang/sail, phase 0..1 through the air
      return {
        lean: 10 - 25 * phase, head: -5,
        thA: 60 + 30 * phase, flA: 70 - 50 * phase,
        thB: 20 + 70 * phase, flB: 90 - 70 * phase,
        uaA: 150 - 110 * phase, faA: 10, uaB: 160 - 100 * phase, faB: 10,
        bob: 0,
      };
    case "crouch":
      return { lean: 40, head: 10, thA: 70, flA: 120, thB: 20, flB: 100, uaA: 5, faA: 0, uaB: -5, faB: 0, bob: 38 };
    case "set": // sprint start "set" position (hips up)
      return { lean: 70, head: 20, thA: 60, flA: 95, thB: 10, flB: 50, uaA: 12, faA: 0, uaB: -6, faB: 0, bob: 26 };
    case "armsUp":
      return { lean: -2, head: -12, thA: 4, flA: 2, thB: -4, flB: 2, uaA: 168, faA: 4, uaB: -168, faB: -4, bob: 0 };
    case "wave": {
      const w = Math.sin(th) * 18;
      return { lean: 0, head: -4, thA: 3, flA: 2, thB: -3, flB: 2, uaA: 150 + w, faA: 15, uaB: -8, faB: 10, bob: 0 };
    }
    default:
      return { lean: 0, head: 0, thA: 3, flA: 2, thB: -3, flB: 2, uaA: 8, faA: 6, uaB: -6, faB: 6, bob: 0 };
  }
}

export const Figure: React.FC<{
  x: number; y: number; h?: number; pose?: Pose; phase?: number; k?: number;
  contour?: string; facing?: 1 | -1; glow?: number; opacity?: number; fill?: string; angles?: Partial<Angles>; badge?: string;
}> = ({ x, y, h = 420, pose = "stand", phase = 0, k = 1, contour = "#F5B54A", facing = 1, glow = 1, opacity = 1, fill = "#07080B", angles, badge }) => {
  const A = { ...poseAngles(pose, phase, k), ...angles };
  // Figure units: ~200 tall from foot to head top.
  const T = 64, TH = 50, SH = 50, UA = 34, FA = 32;
  const hip: P = { x: 0, y: -100 + A.bob };
  const neck: P = { x: hip.x + T * Math.sin(A.lean * D), y: hip.y - T * Math.cos(A.lean * D) };
  const headC: P = { x: neck.x + 15 * Math.sin((A.lean + A.head) * D), y: neck.y - 15 * Math.cos((A.lean + A.head) * D) };
  const sh: P = { x: neck.x - 2 * Math.sin(A.lean * D), y: neck.y + 6 };
  // Tapered capsule between two joints (width wa at a, wb at b), as one closed path.
  const cap = (a: P, b: P, wa: number, wb: number) => {
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L;
    const ra = wa / 2, rb = wb / 2;
    return `M${a.x + nx * ra},${a.y + ny * ra} L${b.x + nx * rb},${b.y + ny * rb} A${rb},${rb} 0 0 0 ${b.x - nx * rb},${b.y - ny * rb} L${a.x - nx * ra},${a.y - ny * ra} A${ra},${ra} 0 0 0 ${a.x + nx * ra},${a.y + ny * ra} Z`;
  };
  const leg = (thigh: number, flex: number) => {
    const knee = seg(hip, TH, thigh);
    const ankle = seg(knee, SH, thigh - flex);
    const toe = seg(ankle, 15, thigh - flex + 95);
    return [cap(hip, knee, 24, 15), cap(knee, ankle, 15, 8), cap(ankle, toe, 8, 6)];
  };
  const arm = (ua: number, fa: number) => {
    const el = seg(sh, UA, ua);
    const hand = seg(el, FA, ua + fa);
    return [cap(sh, el, 14, 10), cap(el, hand, 10, 8)];
  };
  const back = [...leg(A.thB, A.flB), ...arm(A.uaB, A.faB)];
  const front = [...leg(A.thA, A.flA), ...arm(A.uaA, A.faA)];
  const chest = seg(hip, T * 0.72, 180 - A.lean);
  const torso = [cap(hip, chest, 26, 34), cap(chest, neck, 34, 14)];
  const s = h / 200;
  const id = `g${Math.round(x)}_${Math.round(y)}`;
  const parts = (paint: string, add: number, op = 1) => (
    <g fill={paint} stroke={add > 0 ? paint : "none"} strokeWidth={add} strokeLinejoin="round" opacity={op}>
      {back.map((d, i) => <path key={`b${i}`} d={d} />)}
      {torso.map((d, i) => <path key={`t${i}`} d={d} />)}
      {front.map((d, i) => <path key={`f${i}`} d={d} />)}
      <circle cx={headC.x} cy={headC.y} r={12.5} />
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${s * facing},${s})`} opacity={opacity}>
      <defs>
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={6 * glow} />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{parts(contour, 10, 0.75 * glow)}</g>
      {parts(contour, 5)}
      {parts(fill, 0)}
      {badge ? (
        <text x={neck.x - 2} y={hip.y - 24} fontFamily="Anton" fontSize={13} fill={contour} textAnchor="middle" transform={facing < 0 ? `scale(-1,1) translate(${-2 * (neck.x - 2)},0)` : undefined}>{badge}</text>
      ) : null}
    </g>
  );
};
