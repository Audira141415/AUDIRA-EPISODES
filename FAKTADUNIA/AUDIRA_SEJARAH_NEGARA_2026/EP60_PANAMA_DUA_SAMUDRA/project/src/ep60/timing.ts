// EP60 Panama — timing locked to the Cartesia VO (public/audio/vo.wav, 85.4 s). Film second = VO second (offset 0).
// Outro card fills 85.7–88.6.

export const FILM_SECONDS = 88.6;
export const OUTRO_SECONDS = 2.9;
export const XFADE = 0.45;

export type SceneId = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9" | "S10" | "S11";
export const SCENES: { id: SceneId; start: number; end: number }[] = [
  { id: "S1", start: 0, end: 7.4 },
  { id: "S2", start: 7.4, end: 16.3 },
  { id: "S3", start: 16.3, end: 24.5 },
  { id: "S4", start: 24.5, end: 34.7 },
  { id: "S5", start: 34.7, end: 45.4 },
  { id: "S6", start: 45.4, end: 49.8 },
  { id: "S7", start: 49.8, end: 60.3 },
  { id: "S8", start: 60.3, end: 66.0 },
  { id: "S9", start: 66.0, end: 71.9 },
  { id: "S10", start: 71.9, end: 81.2 },
  { id: "S11", start: 81.2, end: FILM_SECONDS },
];

export type CalloutKind = "card" | "big" | "stamp" | "chip";
export type Callout = { t: number; until: number; text: string; kind: CalloutKind; x?: number; y: number; rot?: number };

export const CALLOUTS: Callout[] = [
  { t: 1.4, until: 5.4, text: "±26 METER", kind: "big", y: 330 },
  { t: 8.6, until: 12.6, text: "ATLANTIK → PASIFIK", kind: "card", y: 300 },
  { t: 13.6, until: 16.2, text: "PANAMA: PALING SEMPIT", kind: "card", y: 300 },
  { t: 16.6, until: 20.8, text: "1881 · PRANCIS", kind: "big", y: 320 },
  { t: 21.0, until: 24.4, text: "F. DE LESSEPS · PEMBANGUN SUEZ", kind: "card", y: 300 },
  { t: 25.0, until: 28.7, text: "MALARIA · DEMAM KUNING · LONGSOR", kind: "chip", y: 300 },
  { t: 29.0, until: 31.3, text: "±22.000 PEKERJA", kind: "card", y: 320 },
  { t: 31.6, until: 34.6, text: "1889 · BANGKRUT", kind: "stamp", y: 380, rot: -6 },
  { t: 35.0, until: 37.9, text: "1904 · AS AMBIL ALIH", kind: "card", y: 300 },
  { t: 38.1, until: 39.8, text: "KUNCINYA: NYAMUK", kind: "chip", y: 300 },
  { t: 40.0, until: 45.3, text: "KELAMBU · KASA · MINYAK", kind: "card", y: 300 },
  { t: 46.0, until: 49.7, text: ">100 SEKOP UAP", kind: "big", y: 320 },
  { t: 50.2, until: 53.3, text: "TIDAK SERATA LAUT", kind: "stamp", y: 370, rot: -4 },
  { t: 55.3, until: 57.3, text: "±26 M", kind: "big", y: 320 },
  { t: 57.4, until: 60.2, text: "DANAU GATUN", kind: "card", y: 300 },
  { t: 60.4, until: 63.4, text: "15 AGUSTUS 1914", kind: "big", y: 320 },
  { t: 63.5, until: 65.9, text: "82 KM", kind: "big", y: 320 },
  { t: 66.3, until: 71.8, text: "31 DES 1999 · 12.00", kind: "card", y: 300 },
  { t: 72.2, until: 73.3, text: "TARIF TERMURAH?", kind: "chip", y: 300 },
  { t: 73.4, until: 75.0, text: "36 SEN", kind: "big", y: 320 },
  { t: 75.1, until: 81.1, text: "R. HALLIBURTON · 1928", kind: "card", y: 300 },
  { t: 81.5, until: 85.6, text: "DUA SAMUDRA · SATU JALAN PINTAS", kind: "card", y: 310 },
];
