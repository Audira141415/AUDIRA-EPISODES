// EP11 Firnas camera: continuous orbit over a large sketchbook world.
// Seven shots following the VO beats. All times from beats.ts.
import { B } from "./beats";
import { clamp01, prog } from "./time";

type V3 = [number, number, number];

interface Shot {
  pos: V3;
  target: V3;
  fov: number;
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const easeInOut = (x: number) => { const c = clamp01(x); return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2; };

// Shot definitions: position, look-at target, fov
const SHOTS: { at: number; shot: Shot }[] = [
  // 1. Hook: close on a winged silhouette sketch
  { at: B.hookStart, shot: { pos: [0, 7, 4], target: [0, 0, 0], fov: 36 } },
  // 2. Context: pull back to reveal Córdoba panorama sketch
  { at: B.ctxStart, shot: { pos: [2, 8, 6], target: [2, 0, -1], fov: 34 } },
  // 3. Abbas introduced: orbit to inventor's desk area
  { at: B.abbas, shot: { pos: [5, 6.5, 5], target: [5, 0.5, 0], fov: 32 } },
  // 4. Main: move to wing workshop
  { at: B.mainStart, shot: { pos: [8, 5.5, 4.5], target: [8, 1, -0.5], fov: 33 } },
  // 5. Building wings: closer
  { at: B.membangun, shot: { pos: [9, 4, 3], target: [9, 1.5, 0], fov: 30 } },
  // 6. Cliff / jump: dramatic low angle
  { at: B.bukit, shot: { pos: [12, 3, 5], target: [13, 2.5, -1], fov: 35 } },
  // 7. Flight: follow arc upward
  { at: B.melompat + 0.5, shot: { pos: [14, 5, 6], target: [15, 3, 0], fov: 32 } },
  // 8. Explanation: orbit around flying figure
  { at: B.melayang, shot: { pos: [15, 6, 4], target: [15, 3.5, -1], fov: 30 } },
  // 9. Crash/landing: drop camera
  { at: B.mendarat, shot: { pos: [16, 3.5, 3.5], target: [16, 1, 0], fov: 34 } },
  // 10. Payoff: pull wide for timeline
  { at: B.payStart, shot: { pos: [19, 8, 7], target: [19, 0.5, 0], fov: 36 } },
  // 11. Moon crater: drift upward
  { at: B.namanya, shot: { pos: [22, 7, 6], target: [22, 1, 0], fov: 33 } },
  // 12. Outro: settle
  { at: B.audira, shot: { pos: [24, 6, 5], target: [24, 1, 0], fov: 34 } },
  // 13. Hold
  { at: B.total, shot: { pos: [24, 6, 5], target: [24, 1, 0], fov: 34 } },
];

export const firnasCamera = (f: number): Shot => {
  const t = f / 60;
  let i = 0;
  for (let j = 1; j < SHOTS.length; j++) {
    if (t >= SHOTS[j].at) i = j;
  }
  if (i >= SHOTS.length - 1) return SHOTS[SHOTS.length - 1].shot;
  const a = SHOTS[i];
  const b = SHOTS[i + 1];
  const k = easeInOut(prog(t, a.at, b.at));
  return {
    pos: lerp3(a.shot.pos, b.shot.pos, k),
    target: lerp3(a.shot.target, b.shot.target, k),
    fov: lerp(a.shot.fov, b.shot.fov, k),
  };
};
