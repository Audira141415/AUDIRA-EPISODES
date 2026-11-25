// Fleet timing (shared by the film and the camera follow): ship i sits at u = P − i·gap on the land
// route (0..1), then slides into the Golden Horn (1..1.6) and parks. All anchors are spoken words.
import * as THREE from "three";
import { W, ramp } from "./time.ts";
import { ROUTE, v3 } from "./world.ts";

export const FLEET_N = 70;
export const FLEET_GAP = 0.08;
const NAIK = W("l09", "dinaikkan"), LAYAR = W("l10", "layarnya"), PAGI = W("l11", "pagi"), JATUH = W("l12", "jatuh", 1, "e");

export const fleetP = (t: number) => {
  if (t < NAIK - 1) return -0.31;
  if (t < NAIK + 1.6) return -0.31 + 0.41 * ramp(t, NAIK - 1, NAIK + 1.6);
  if (t < LAYAR) return 0.1 + 0.26 * ramp(t, NAIK + 1.6, LAYAR);
  if (t < PAGI) return 0.36 + 0.12 * ramp(t, LAYAR, PAGI);
  const u = Math.min(1, (t - PAGI) / (JATUH - PAGI));
  return 0.48 + (1.62 + (FLEET_N - 1) * FLEET_GAP - 0.48) * (0.5 - 0.5 * Math.cos(Math.PI * u));
};

let RC: THREE.CatmullRomCurve3 | null = null;
/** Land route at ground level (cached). */
export const routeC = () => (RC ??= new THREE.CatmullRomCurve3(ROUTE.map(([x, y]) => v3(x, y, 0)), false, "centripetal"));
