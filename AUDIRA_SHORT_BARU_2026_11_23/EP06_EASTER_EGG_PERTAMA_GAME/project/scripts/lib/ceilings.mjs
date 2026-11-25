// Turn look metrics into score ceilings per rubric aspect. Most rules compare the draft with the
// style's own quality-bar cover, because styles differ wildly (a PRECISION studio frame is 80 %
// flat background, MEMPHISDIORAMA clips 70 % of its pixels to white on purpose). Only hard faults
// are judged without a cover. Thresholds were set by measuring all 70 covers (2026-11-09).

export const ASPECTS = ["lighting", "material", "depth", "composition", "motion", "readability"];

const mean = (list, k) => list.reduce((a, m) => a + m[k], 0) / list.length;
const sep = (m) => m.sepLum + 20 * Math.abs(Math.log(Math.max(0.05, m.sepDetail)));

/**
 * @param {{ frames: object[], cover: object[], diversity: number|null, motion: object|null, flatStyle?: boolean }} x
 * @returns {{ ceil: Record<string, number|null>, why: Record<string, string[]>, notes: string[] }}
 */
export function ceilings({ frames, cover, diversity, motion, flatStyle = false }) {
  const ceil = Object.fromEntries(ASPECTS.map((a) => [a, 5]));
  const why = Object.fromEntries(ASPECTS.map((a) => [a, []]));
  const notes = [];
  const cap = (a, v, reason) => { ceil[a] = Math.min(ceil[a], v); why[a].push(`max ${v}: ${reason}`); };
  const f = (k) => mean(frames, k), c = (k) => mean(cover, k);
  const r1 = (v) => +v.toFixed(1);

  // ---- absolute hard faults (any style) ----
  const washed = frames.filter((m) => m.range < 70);
  if (washed.length) cap("lighting", washed.length > frames.length / 3 ? 2 : 3, `${washed.length} frame(s) with tonal range < 70 (washed out, no light shape)`);
  const empty = frames.filter((m) => m.detail < 0.9);
  if (empty.length) cap("composition", 2, `${empty.length} near-empty frame(s) (detail < 0.9)`);
  if (diversity !== null && frames.length >= 4) {
    if (diversity < 6) cap("composition", 2, `key frames almost identical (diversity ${diversity}; Zero Visual Template)`);
    else if (diversity < 10) cap("composition", 3, `key frames look alike (diversity ${diversity}, want ≥ 10): vary framing, scale or subject`);
  }
  if (motion) {
    if (motion.stillPct > 40) cap("motion", 2, `camera/subject still for ${motion.stillSeconds}/${motion.seconds} s (Anti-PPT)`);
    else if (motion.stillPct > 20) cap("motion", 3, `still for ${motion.stillSeconds}/${motion.seconds} s (> 20 %)`);
  } else {
    ceil.motion = null;
    why.motion.push("needs --video (stills cannot show motion)");
  }
  ceil.readability = null;
  why.readability.push("text legibility and Mute Test are judged by eye on the phone-size sheet");
  const busy = frames.filter((m) => m.bottomBusy > 2.5);
  if (busy.length) notes.push(`${busy.length} frame(s) carry heavy detail in the bottom 380 px (platform UI covers it): keep subjects and text above it`);

  // ---- relative to the style cover ----
  if (!cover.length) {
    // without a reference frame nobody can claim "same class as the cover"
    for (const a of ["lighting", "material", "depth", "composition"]) cap(a, 4, "style has no quality-bar cover yet");
    notes.push("no cover: only hard faults are measured; see references/quality-bar/README.md for kits without a reference");
    return { ceil, why, notes };
  }
  const dr = f("range") / c("range");
  if (dr < 0.6) cap("lighting", 2, `tonal range ${r1(f("range"))} vs cover ${r1(c("range"))} (${Math.round(dr * 100)} %)`);
  else if (dr < 0.78) cap("lighting", 3, `tonal range ${r1(f("range"))} vs cover ${r1(c("range"))} (${Math.round(dr * 100)} %)`);
  if (f("clipHi") > c("clipHi") + 8) cap("lighting", 3, `${r1(f("clipHi"))} % blown highlights vs cover ${r1(c("clipHi"))} %`);
  if (f("crushLo") > c("crushLo") + 20) cap("lighting", 3, `${r1(f("crushLo"))} % crushed blacks vs cover ${r1(c("crushLo"))} %`);

  const det = f("detail") / c("detail");
  if (det < 0.45) cap("material", 2, `surface detail ${r1(f("detail"))} vs cover ${r1(c("detail"))} (${Math.round(det * 100)} %)`);
  else if (det < 0.65) cap("material", 3, `surface detail ${r1(f("detail"))} vs cover ${r1(c("detail"))} (${Math.round(det * 100)} %): add texture, grain, bevels`);
  if (!flatStyle && f("flat") > c("flat") + 15) cap("material", 3, `${r1(f("flat"))} % flat planes vs cover ${r1(c("flat"))} %: large untextured areas`);

  const sd = mean(frames.map((m) => ({ s: sep(m) })), "s"), sc = mean(cover.map((m) => ({ s: sep(m) })), "s");
  if (sd < sc * 0.45) cap("depth", 2, `subject separation ${r1(sd)} vs cover ${r1(sc)}: subject melts into the background`);
  else if (sd < sc * 0.65) cap("depth", 3, `subject separation ${r1(sd)} vs cover ${r1(sc)}: add rim light, haze, DOF or value contrast`);

  if (Math.abs(f("saturation") - c("saturation")) > 0.25) notes.push(`palette saturation ${f("saturation").toFixed(2)} vs cover ${c("saturation").toFixed(2)}: check the look still reads as this style`);
  return { ceil, why, notes };
}
