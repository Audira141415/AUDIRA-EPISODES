// EP44 Yusuf Dibuang ke Sumur — timing locked to the Cartesia VO (public/audio/vo.wav, 90.50 s, 196 words).
// Film second = VO second (offset 0). Outro card fills 90.5–93.4.

export const FILM_SECONDS = 93.4;
export const OUTRO_SECONDS = 2.9;
export const XFADE = 0.45;

export type SceneId = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9" | "S10" | "S11" | "S12";
export const SCENES: { id: SceneId; start: number; end: number }[] = [
  { id: "S1", start: 0, end: 9.1 },
  { id: "S2", start: 9.1, end: 18.3 },
  { id: "S3", start: 18.3, end: 25.7 },
  { id: "S4", start: 25.7, end: 33.9 },
  { id: "S5", start: 33.9, end: 42.5 },
  { id: "S6", start: 42.5, end: 50.2 },
  { id: "S7", start: 50.2, end: 57.4 },
  { id: "S8", start: 57.4, end: 62.8 },
  { id: "S9", start: 62.8, end: 69.6 },
  { id: "S10", start: 69.6, end: 77.3 },
  { id: "S11", start: 77.3, end: 83.4 },
  { id: "S12", start: 83.4, end: FILM_SECONDS },
];

export type CalloutKind = "card" | "big" | "stamp" | "chip";
export type Callout = { t: number; until: number; text: string; kind: CalloutKind; x?: number; y: number; rot?: number };

export const CALLOUTS: Callout[] = [
  { t: 0.3, until: 2.2, text: "11 BINTANG", kind: "big", y: 300 },
  { t: 6.9, until: 9.0, text: "KE DASAR SUMUR", kind: "stamp", y: 400, rot: -6 },
  { t: 10.6, until: 13.6, text: "QS YUSUF 4–20", kind: "card", y: 300 },
  { t: 16.8, until: 18.2, text: "NABI YAKUB", kind: "chip", y: 300 },
  { t: 20.9, until: 22.8, text: "TAKWIL MIMPI", kind: "card", y: 300 },
  { t: 23.0, until: 25.6, text: "JANGAN CERITAKAN", kind: "stamp", y: 380, rot: -5 },
  { t: 26.9, until: 29.4, text: "CEMBURU", kind: "big", y: 320 },
  { t: 30.5, until: 32.2, text: "LEBIH DICINTAI AYAH", kind: "card", y: 300 },
  { t: 32.8, until: 33.8, text: "INGIN MEMBUNUH", kind: "chip", y: 300 },
  { t: 36.4, until: 38.0, text: "JANGAN BUNUH", kind: "stamp", y: 380, rot: -6 },
  { t: 38.1, until: 40.4, text: "LEMPAR KE SUMUR", kind: "card", y: 300 },
  { t: 40.6, until: 42.4, text: "DIPUNGUT MUSAFIR", kind: "chip", y: 300 },
  { t: 44.5, until: 46.4, text: "DIAJAK BERMAIN", kind: "card", y: 300 },
  { t: 48.3, until: 50.1, text: "TAKUT SERIGALA", kind: "stamp", y: 380, rot: -5 },
  { t: 52.2, until: 54.0, text: "WAHYU ALLAH", kind: "card", y: 300 },
  { t: 54.1, until: 57.3, text: "KELAK KAU KABARKAN", kind: "card", y: 300 },
  { t: 57.6, until: 60.0, text: "PULANG MENANGIS", kind: "chip", y: 300 },
  { t: 61.5, until: 62.7, text: "DARAH PALSU", kind: "stamp", y: 380, rot: -6 },
  { t: 63.8, until: 65.4, text: "REKAYASA", kind: "chip", y: 300 },
  { t: 70.5, until: 72.3, text: "KAFILAH", kind: "card", y: 300 },
  { t: 74.5, until: 77.2, text: "KABAR GEMBIRA!", kind: "stamp", y: 380, rot: -6 },
  { t: 78.4, until: 79.9, text: "BARANG DAGANGAN", kind: "chip", y: 300 },
  { t: 81.0, until: 81.9, text: "HARGA MURAH", kind: "chip", y: 300 },
  { t: 82.0, until: 83.4, text: "BEBERAPA DIRHAM", kind: "card", y: 310 },
  { t: 85.6, until: 88.0, text: "MIMPI ITU BARU DIMULAI", kind: "card", y: 300 },
  { t: 88.6, until: 90.5, text: "AUDIRA QISSAH", kind: "card", y: 300 },
];
