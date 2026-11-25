// EP18 Longyearbyen, Svalbard — timing locked to the Cartesia VO (public/audio/vo.wav, 88.72 s, pauses ≤ 0.45 s).
// Film second = VO second (offset 0). Outro card fills 88.9–91.8.

export const FILM_SECONDS = 91.8;
export const OUTRO_SECONDS = 2.9;
export const XFADE = 0.45;

export type SceneId = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9" | "S10";
export const SCENES: { id: SceneId; start: number; end: number }[] = [
  { id: "S1", start: 0, end: 5.2 },
  { id: "S2", start: 5.2, end: 17.1 },
  { id: "S3", start: 17.1, end: 30.4 },
  { id: "S4", start: 30.4, end: 35.6 },
  { id: "S5", start: 35.6, end: 44.9 },
  { id: "S6", start: 44.9, end: 54.9 },
  { id: "S7", start: 54.9, end: 64.1 },
  { id: "S8", start: 64.1, end: 70.8 },
  { id: "S9", start: 70.8, end: 83.3 },
  { id: "S10", start: 83.3, end: FILM_SECONDS },
];

export type CalloutKind = "card" | "big" | "stamp" | "chip";
export type Callout = { t: number; until: number; text: string; kind: CalloutKind; x?: number; y: number; rot?: number };

export const CALLOUTS: Callout[] = [
  { t: 2.0, until: 5.1, text: "DILARANG MATI?", kind: "stamp", y: 420, rot: -7 },
  { t: 5.6, until: 9.6, text: "LONGYEARBYEN · SVALBARD", kind: "card", y: 290 },
  { t: 9.8, until: 12.1, text: "78° LU", kind: "big", y: 320 },
  { t: 12.2, until: 15.7, text: "1.300 KM KE KUTUB", kind: "card", y: 300 },
  { t: 15.8, until: 17.0, text: "±2.500 JIWA", kind: "big", y: 320 },
  { t: 17.7, until: 20.4, text: "PERMAFROST", kind: "card", y: 300 },
  { t: 20.6, until: 24.1, text: "1918 · 7 PENAMBANG", kind: "card", y: 300 },
  { t: 24.2, until: 27.0, text: "FLU SPANYOL", kind: "chip", y: 300 },
  { t: 29.3, until: 30.3, text: "BELUM TERURAI", kind: "chip", y: 300 },
  { t: 31.6, until: 35.5, text: "±1950 · PEMAKAMAN BERHENTI", kind: "stamp", y: 360, rot: -5 },
  { t: 36.0, until: 42.9, text: "1998", kind: "big", y: 320 },
  { t: 43.0, until: 44.8, text: "TIDAK ADA VIRUS HIDUP", kind: "stamp", y: 360, rot: -4 },
  { t: 47.5, until: 51.0, text: "BUKAN PIDANA", kind: "stamp", y: 360, rot: -6 },
  { t: 51.1, until: 54.8, text: "UU PEMAKAMAN: TIDAK BERLAKU", kind: "card", y: 300 },
  { t: 56.6, until: 58.9, text: "TANPA RUANG BERSALIN", kind: "card", y: 300 },
  { t: 59.2, until: 61.9, text: "→ DARATAN NORWEGIA", kind: "card", y: 300 },
  { t: 62.1, until: 64.0, text: "ABU KREMASI + IZIN", kind: "card", y: 300 },
  { t: 66.0, until: 68.6, text: "WAJIB ALAT PENGUSIR", kind: "card", y: 300 },
  { t: 68.8, until: 70.7, text: "±300 BERUANG", kind: "big", y: 320 },
  { t: 76.8, until: 78.7, text: "GLOBAL SEED VAULT", kind: "card", y: 300 },
  { t: 78.8, until: 81.9, text: "1,4 JUTA SAMPEL", kind: "big", y: 320 },
  { t: 82.0, until: 83.2, text: "−18 °C", kind: "big", y: 320 },
  { t: 85.5, until: 88.8, text: "BENIH UNTUK DUNIA", kind: "card", y: 330 },
];
