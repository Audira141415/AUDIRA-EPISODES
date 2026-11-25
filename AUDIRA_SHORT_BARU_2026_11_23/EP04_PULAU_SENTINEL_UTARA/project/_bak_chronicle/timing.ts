// EP04 Pulau Sentinel Utara — timing locked to the Cartesia VO (public/audio/vo.wav, 86.52 s).
// Film second = VO second (offset 0). Outro card fills 86.6–89.5.

export const FILM_SECONDS = 89.5;
export const OUTRO_SECONDS = 2.9;
export const XFADE = 0.45;

export type SceneId = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9" | "S10" | "S11";
export const SCENES: { id: SceneId; start: number; end: number }[] = [
  { id: "S1", start: 0, end: 6.4 },
  { id: "S2", start: 6.4, end: 17.1 },
  { id: "S3", start: 17.1, end: 26.2 },
  { id: "S4", start: 26.2, end: 32.3 },
  { id: "S5", start: 32.3, end: 38.2 },
  { id: "S6", start: 38.2, end: 44.9 },
  { id: "S7", start: 44.9, end: 56.6 },
  { id: "S8", start: 56.6, end: 67.1 },
  { id: "S9", start: 67.1, end: 74.3 },
  { id: "S10", start: 74.3, end: 80.5 },
  { id: "S11", start: 80.5, end: FILM_SECONDS },
];

export type CalloutKind = "card" | "big" | "stamp" | "chip";
export type Callout = { t: number; until: number; text: string; kind: CalloutKind; x?: number; y: number; rot?: number };

export const CALLOUTS: Callout[] = [
  { t: 1.9, until: 6.3, text: "DILARANG MENDEKAT", kind: "stamp", y: 470, rot: -7 },
  { t: 9.4, until: 12.9, text: "KEP. ANDAMAN · INDIA", kind: "card", y: 300 },
  { t: 13.0, until: 17.0, text: "±60 KM²", kind: "big", y: 320 },
  { t: 20.7, until: 23.3, text: "50–200 ORANG", kind: "big", y: 320 },
  { t: 23.4, until: 26.1, text: "BAHASA: ???", kind: "card", y: 300 },
  { t: 29.6, until: 32.2, text: "TOMBAK", kind: "chip", x: 540, y: 250 },
  { t: 30.5, until: 32.2, text: "BUSUR", kind: "chip", x: 230, y: 250 },
  { t: 31.7, until: 32.2, text: "KANO", kind: "chip", x: 850, y: 250 },
  { t: 34.7, until: 38.1, text: "1981 · MV PRIMROSE", kind: "card", y: 300 },
  { t: 38.4, until: 41.0, text: "1880", kind: "big", y: 320 },
  { t: 41.1, until: 44.8, text: "6 WARGA → PORT BLAIR", kind: "card", y: 300 },
  { t: 45.5, until: 48.5, text: "ANTROPOLOG INDIA", kind: "card", y: 300 },
  { t: 48.6, until: 54.9, text: "4 JAN 1991", kind: "big", y: 320 },
  { t: 55.0, until: 56.5, text: "KUNJUNGAN DIHENTIKAN", kind: "stamp", y: 330, rot: -5 },
  { t: 57.4, until: 64.9, text: "TSUNAMI 2004", kind: "card", y: 290 },
  { t: 65.0, until: 67.0, text: "KAMI SELAMAT", kind: "big", y: 320 },
  { t: 67.7, until: 70.0, text: "UU 1956", kind: "chip", x: 290, y: 250 },
  { t: 70.0, until: 71.8, text: "RADIUS 5 KM", kind: "card", x: 700, y: 360 },
  { t: 71.8, until: 74.2, text: "PENYAKIT DARI LUAR", kind: "stamp", y: 1320, rot: -4 },
  { t: 74.6, until: 77.2, text: "2018", kind: "big", y: 320 },
  { t: 77.3, until: 80.4, text: "MASUK ILEGAL", kind: "stamp", y: 320, rot: -6 },
  { t: 82.6, until: 86.5, text: "BIARKAN MEREKA SENDIRI", kind: "card", y: 360 },
];
