import { BUCKET_LAND, ChainTiming, FLAG_UP, LAUNCH_M, MACHINE_END, actionPoint, filmTime, machineTime } from "../core/chain";
import { easeInOutCubic, lerp, smooth, win } from "../core/motion";

export interface ChainCamera {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  /** distance camera → target, for the DOF focus */
  focus: number;
}

const avgPoint = (m: number): [number, number, number] => {
  // lagging window average: the camera trails the action like a hand-held follow, never snaps
  let x = 0, y = 0, n = 0;
  for (let k = -5; k <= 1; k++) {
    const p = actionPoint(Math.min(MACHINE_END, Math.max(0, m + k * 0.07)));
    x += p[0]; y += p[1]; n++;
  }
  return [x / n, y / n, 0];
};

/**
 * Follow-cam for one machine run.
 *  - before the run: establishing glide onto the chute;
 *  - during: trails the action point at a close three-quarter angle, widens while the brass ball flies;
 *  - after the flag is up: pulls back to reveal the whole tower and the glowing route.
 */
export function getChainCamera(t: number, tm: ChainTiming): ChainCamera {
  const m = machineTime(t, tm);
  const follow = avgPoint(m);
  const intro = smooth(win(t, 0, tm.start + 0.6));
  const establish: [number, number, number] = [0.85, 2.55, 0];
  const flight = smooth(win(m, LAUNCH_M - 0.15, LAUNCH_M + 0.2)) * (1 - smooth(win(m, BUCKET_LAND + 0.1, BUCKET_LAND + 0.6)));
  const reveal = easeInOutCubic(win(t, filmTime(FLAG_UP, tm) + 0.15, filmTime(FLAG_UP, tm) + 2.1));

  // the tower plus banner is ~3.5 m wide but a 9:16 frame is narrow: swing to the side for the
  // reveal so the width foreshortens (cos 0.75 ≈ 0.73) instead of backing off until it is tiny
  const wideTarget: [number, number, number] = [0.5, 1.36, 0];
  const tgt = [0, 1, 2].map((i) => lerp(lerp(establish[i], follow[i], intro), wideTarget[i], reveal)) as [number, number, number];

  const dist = lerp(lerp(lerp(2.6, 1.7, intro), 2.35, flight), 8.2, reveal);
  const az = lerp(lerp(0.62, 0.38, intro) + Math.sin(t * 0.33) * 0.1, 0.75 + Math.sin(t * 0.33) * 0.03, reveal);
  const elev = lerp(0.26, 0.14, intro) * dist + 0.05;
  return {
    position: [tgt[0] + Math.sin(az) * dist, tgt[1] + elev, tgt[2] + Math.cos(az) * dist],
    target: tgt,
    fov: 34,
    focus: Math.hypot(Math.sin(az) * dist, elev, Math.cos(az) * dist),
  };
}
