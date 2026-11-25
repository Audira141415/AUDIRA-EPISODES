// EP04 Kenapa Gunung Meletus — scene clock (seconds, locked to public/audio/vo-words.json).
export const FILM_SECONDS = 80.5;
export const OUTRO_SECONDS = 3;

/** Scene starts (s). Each scene owns its set, lights and camera; the director renders only the active one. */
export const SC = {
  s1: 0, // Krakatau 1883
  s2: 8.4, // globe + Cincin Api
  s3: 20.4, // balok bumi: subduksi -> magma
  s4a: 36.6, // kaleng soda
  s4b: 43.9, // Hawaii vs Merapi
  s5a: 53.9, // Tambora + salju 1816
  s5snow: 58.2, // salju Juni 1816 (sub-scene)
  s5b: 61.6, // pos pantau + status
  s6: 70.4, // sunrise sawah
  end: 80.5,
} as const;

/** VO beats (s) that drive actions and callouts. */
export const BEAT = {
  year1883: 0.7,
  letusan: 2.8,
  krakatau: 3.3,
  km5000: 4.1,
  question: 6.7,
  cincin: 10.0,
  km40000: 12.3,
  pct75: 14.4,
  n127: 16.7,
  terbanyak: 18.7,
  menyusup: 22.2,
  cm67: 25.1,
  air: 27.4,
  meleleh: 29.7,
  magmaNaik: 33.9,
  dapur: 35.9,
  gas: 37.1,
  soda: 38.3,
  naik: 39.7,
  turun: 41.1,
  memuai: 41.9,
  keluar: 43.1,
  kekentalan: 44.0,
  encer: 45.6,
  mengalir: 49.0,
  kental: 49.9,
  eksplosif: 52.5,
  y1815: 54.1,
  suhu: 57.2,
  salju: 59.2,
  pvmbg: 62.3,
  gempa: 64.0,
  gembung: 64.5,
  gasPantau: 65.9,
  normal: 67.7,
  waspada: 68.4,
  siaga: 69.1,
  awas: 69.8,
  subur: 71.2,
  kenali: 72.4,
  sampai: 74.7,
  outro: FILM_SECONDS - OUTRO_SECONDS,
} as const;

export const CUTS = [SC.s2, SC.s3, SC.s4a, SC.s4b, SC.s5a, SC.s5snow, SC.s5b, SC.s6];

export type SceneId = "s1" | "s2" | "s3" | "s4a" | "s4b" | "s5a" | "s5snow" | "s5b" | "s6";

export const sceneAt = (t: number): { id: SceneId; start: number } => {
  if (t < SC.s2) return { id: "s1", start: SC.s1 };
  if (t < SC.s3) return { id: "s2", start: SC.s2 };
  if (t < SC.s4a) return { id: "s3", start: SC.s3 };
  if (t < SC.s4b) return { id: "s4a", start: SC.s4a };
  if (t < SC.s5a) return { id: "s4b", start: SC.s4b };
  if (t < SC.s5snow) return { id: "s5a", start: SC.s5a };
  if (t < SC.s5b) return { id: "s5snow", start: SC.s5snow };
  if (t < SC.s6) return { id: "s5b", start: SC.s5b };
  return { id: "s6", start: SC.s6 };
};

/** Short dip to the lab colour around each cut (0..1). */
export const cutDip = (t: number) => {
  let d = 0;
  for (const c of CUTS) {
    const x = Math.abs(t - c);
    if (x < 0.14) d = Math.max(d, 1 - x / 0.14);
  }
  return d * 0.85;
};
