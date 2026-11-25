// EP053 cue times, all read from the VO timeline (Audio Master Clock). Seconds on the film clock.
import TL from "./timeline.json";

type Word = { w: string; s: number; e: number };
export const WORDS: Word[] = (TL.clips as { words: Word[] }[]).flatMap((c) => c.words);
export const SEC = TL.sections as Record<"HOOK" | "KONTEKS" | "MEKANISME" | "REVEAL" | "PAYOFF" | "OUTRO", [number, number]>;
export const TOTAL = TL.total as number;

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
/** Start of the n-th occurrence (1-based) of a word, optionally only after `after` seconds. */
export const T = (w: string, n = 1, after = 0) => {
  let k = 0;
  for (const x of WORDS) if (x.s >= after && norm(x.w) === norm(w) && ++k === n) return x.s;
  throw new Error(`word not in timeline: ${w}`);
};

const M = SEC.MEKANISME[0];
const go = T("hijau", 1, T("waktu", 1, M)) + 0.45; // the south queue moves once its green is on
export const TM = {
  // fixed schedule: east green on an empty road, south red with a long countdown
  fixedE: T("waktu", 1, M) + 6,
  fixedS: T("waktu", 1, M) + 20,
  amberE: T("mengurangi") - 0.1,
  redE: T("mengurangi") + 0.6,
  greenS: T("hijau", 1, T("waktu", 1, M)),
  go,
  membaca: T("membaca"),
  aspal: T("aspal"),
  kawat: T("kawat"),
  kamera: T("kamera"),
  radar: T("radar"),
  antrean: T("antrean"),
  menambah: T("menambah"),
  selaras: T("menyelaraskan"),
  reveal: SEC.REVEAL[0],
  payoff: SEC.PAYOFF[0],
  jakarta: T("jakarta"),
  boardFrom: T("seratus"),
  boardTo: T("belas") + 0.35,
  petugas: T("petugas"),
  outro: SEC.OUTRO[0],
  /** when the camera-analytics box lands on the i-th south vehicle (front to back) */
  boxAt: (i: number) => T("kamera") + 0.2 + i * ((T("antrean") + 0.3 - T("kamera") - 0.2) / 11),
};
