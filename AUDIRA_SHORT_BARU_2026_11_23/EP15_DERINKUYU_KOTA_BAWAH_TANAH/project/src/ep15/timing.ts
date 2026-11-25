// EP15 Derinkuyu — timing locked to the Cartesia VO (public/audio/vo.wav, 84.75 s).
// Film second = VO second (offset 0). Outro card fills 85.0–88.0.

export const FILM_SECONDS = 88.0;
export const OUTRO_SECONDS = 3.0;
export const XFADE = 0.45;

export type SceneId = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9";
export const SCENES: { id: SceneId; start: number; end: number }[] = [
  { id: "S1", start: 0, end: 8.6 },
  { id: "S2", start: 8.6, end: 19.1 },
  { id: "S3", start: 19.1, end: 29.0 },
  { id: "S4", start: 29.0, end: 38.8 },
  { id: "S5", start: 38.8, end: 47.2 },
  { id: "S6", start: 47.2, end: 58.0 },
  { id: "S7", start: 58.0, end: 70.2 },
  { id: "S8", start: 70.2, end: 76.3 },
  { id: "S9", start: 76.3, end: FILM_SECONDS },
];

export type CalloutKind = "card" | "big" | "stamp" | "chip";
export type Callout = { t: number; until: number; text: string; kind: CalloutKind; x?: number; y: number; rot?: number; sub?: string; size?: number };

export const CALLOUTS: Callout[] = [
  { t: 0.9, until: 4.7, text: "1963", kind: "big", y: 300, sub: "DINDING RUMAH DIJEBOL" },
  { t: 5.0, until: 8.5, text: "LORONG MENUJU KOTA", kind: "card", y: 290 },
  { t: 9.2, until: 12.1, text: "DERINKUYU · KAPADOKIA", kind: "card", y: 290 },
  { t: 12.6, until: 15.9, text: "±85 M", kind: "big", y: 300, sub: "KEDALAMAN" },
  { t: 16.6, until: 19.0, text: "20.000 ORANG", kind: "big", y: 300, sub: "+ TERNAK" },
  { t: 22.4, until: 25.3, text: "ABU VULKANIK", kind: "card", y: 290 },
  { t: 25.4, until: 28.9, text: "→ BATU TUF", kind: "big", y: 300, sub: "LUNAK, MUDAH DIPAHAT" },
  { t: 30.8, until: 33.9, text: "FRIGIA · ±2.700 TH LALU", kind: "card", y: 290 },
  { t: 34.6, until: 38.7, text: "ERA BIZANTIUM", kind: "card", y: 290 },
  { t: 49.3, until: 51.2, text: "±500 KG", kind: "big", y: 300, sub: "PINTU BATU BULAT" },
  { t: 51.3, until: 53.2, text: "HANYA DARI DALAM", kind: "stamp", y: 300, rot: -5 },
  { t: 53.6, until: 57.9, text: "SEMPIT & RENDAH", kind: "card", y: 290 },
  { t: 58.4, until: 60.8, text: "BERNAPAS?", kind: "big", y: 300 },
  { t: 61.0, until: 65.2, text: ">50 LUBANG UDARA", kind: "big", y: 300, size: 108, sub: "SAMPAI KE DASAR" },
  { t: 65.5, until: 68.6, text: "SUMUR TAK TEMBUS PERMUKAAN", kind: "card", y: 290, size: 46 },
  { t: 68.9, until: 70.1, text: "ANTI-RACUN", kind: "stamp", y: 300, rot: -6 },
  { t: 71.2, until: 73.6, text: "DIHUNI S/D 1923", kind: "big", y: 300, size: 112 },
  { t: 74.0, until: 76.2, text: "BARU ±10% DIBUKA", kind: "big", y: 300, size: 104 },
  { t: 77.4, until: 80.7, text: "150–200 KOTA BAWAH TANAH", kind: "card", y: 290, size: 52 },
  { t: 81.1, until: 84.7, text: "IKUTI AUDIRA FAKTA DUNIA", kind: "card", y: 290 },
];
