// EP76 Tornado Api — scene clock (seconds, locked to public/audio/vo-words.json, VO 86.56 s).
export const OUTRO_SECONDS = 3;
export const FILM_SECONDS = 89.5;

/** Scene starts (s). Each scene owns its set, lights and camera; the director renders only the active one. */
export const SC = {
  s1: 0, // hook: hutan malam + pusaran
  s2: 5.0, // Redding 26 Juli 2018
  s3: 19.0, // pusaran raksasa di antara rumah
  s4a: 35.0, // lab: udara panas naik + inflow + menyempit
  s4b: 51.2, // penari es -> pusaran lahir
  s5a: 59.0, // Tokyo 1923
  s5b: 68.0, // pusaran di lapangan
  s6: 75.0, // pagi, hutan hangus, pyrocumulus
  end: FILM_SECONDS,
} as const;

/** VO beats (s) that drive actions and callouts. */
export const BEAT = {
  api: 3.96,
  tanggal: 5.16,
  redding: 7.29,
  carr: 10.34,
  asap: 14.98,
  kolom: 16.41,
  berputar: 17.8,
  melebar: 19.8,
  menjulang: 22.55,
  angin: 25.77,
  ef3: 28.3,
  menara: 30.59,
  pohon: 32.1,
  empat: 33.58,
  bagaimana: 35.25,
  memanaskan: 38.11,
  panasNaik: 39.95,
  tersedot: 42.26,
  permukaan: 45.67,
  tertarik: 48.27,
  menyempit: 50.14,
  penari: 51.33,
  kencang: 54.63,
  lahirlah: 55.6,
  seribu: 57.83,
  tokyo: 60.65,
  y1923: 61.28,
  gempa: 63.38,
  mengungsi: 65.51,
  apiKota: 68.19,
  topan: 69.97,
  pusaran: 71.18,
  k40: 72.51,
  kebanyakan: 75.26,
  gedung: 77.2,
  hilang: 77.83,
  besar: 81.02,
  cuaca: 82.96,
  ikuti: 84.23,
  outro: FILM_SECONDS - OUTRO_SECONDS,
} as const;

export const CUTS = [SC.s2, SC.s3, SC.s4a, SC.s4b, SC.s5a, SC.s5b, SC.s6];

export type SceneId = "s1" | "s2" | "s3" | "s4a" | "s4b" | "s5a" | "s5b" | "s6";
const ORDER: SceneId[] = ["s1", "s2", "s3", "s4a", "s4b", "s5a", "s5b", "s6"];

export const sceneAt = (t: number): { id: SceneId; start: number } => {
  let id: SceneId = "s1";
  for (const k of ORDER) if (t >= SC[k]) id = k;
  return { id, start: SC[id] };
};

/** Short dip around each cut (0..1). */
export const cutDip = (t: number) => {
  let d = 0;
  for (const c of CUTS) {
    const x = Math.abs(t - c);
    if (x < 0.14) d = Math.max(d, 1 - x / 0.14);
  }
  return d * 0.85;
};
