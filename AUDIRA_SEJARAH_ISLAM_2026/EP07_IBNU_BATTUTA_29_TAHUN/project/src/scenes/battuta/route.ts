// EP07 route timing: how far the red thread has been drawn at time t (0–1 of ROUTE_CURVE), from word times.
import { ROUTE_U, routePoint } from "./map.tsx";
import { W, WE, ramp } from "./time.ts";

export const routeProgress = (t: number) => {
  const U = ROUTE_U;
  if (t < W("l04", "timur") - 0.4) return U.makkah * ramp(t, W("l03", "haji"), WE("l03", "bulan"));
  if (t < W("l05", "sultan")) return U.makkah + (U.delhi - U.makkah) * ramp(t, W("l04", "timur") - 0.4, W("l04", "delhi"));
  if (t < W("l05", "ia")) return U.delhi + (U.calicut - U.delhi) * ramp(t, W("l05", "sultan"), W("l05", "hancur"));
  // the sea leg is drawn slowly across the whole Bay of Bengal shot (34.8 → 39.0 s)
  if (t < W("l05", "sumatra")) return U.calicut + (U.burma - U.calicut) * ramp(t, W("l05", "ia"), W("l05", "sumatra"));
  return U.burma + (1 - U.burma) * ramp(t, W("l05", "sumatra"), W("l05", "1345"));
};

/** Head of the thread at time t (where the traveller / junk marker stands). */
export const headAt = (t: number) => routePoint(routeProgress(t));
