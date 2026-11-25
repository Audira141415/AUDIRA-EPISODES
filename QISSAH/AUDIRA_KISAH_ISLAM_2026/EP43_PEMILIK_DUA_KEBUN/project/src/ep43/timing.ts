// EP43 Pemilik Dua Kebun — timing locked to the Cartesia VO (public/audio/vo.wav, 83.5 s). Film second = VO second (offset 0).
// Outro card fills 83.6–86.6.

export const FILM_SECONDS = 86.6;
export const OUTRO_SECONDS = 3.0;
export const XFADE = 0.45;

export type SceneId = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9" | "S10" | "S11";
export const SCENES: { id: SceneId; start: number; end: number }[] = [
  { id: "S1", start: 0, end: 10.1 }, // hook: two vineyards, river, "Ia keliru"
  { id: "S2", start: 10.1, end: 15.45 }, // QS 18:32 card + two men
  { id: "S3", start: 15.45, end: 25.9 }, // garden layout: vines, date palms, field, river → full clusters
  { id: "S4", start: 25.9, end: 31.2 }, // boast: wealth + followers
  { id: "S5", start: 31.2, end: 41.0 }, // enters garden: "tidak akan binasa"
  { id: "S6", start: 41.0, end: 46.5 }, // friend: from soil, then a drop of water
  { id: "S7", start: 46.5, end: 55.75 }, // Masya Allah, la quwwata illa billah
  { id: "S8", start: 55.75, end: 59.8 }, // destruction: storm, trellis collapses
  { id: "S9", start: 59.8, end: 71.0 }, // regret: hands turned over, alone in the ruins
  { id: "S10", start: 71.0, end: 79.3 }, // payoff: rain → grow → dry → wind
  { id: "S11", start: 79.3, end: FILM_SECONDS }, // question + AUDIRA plaque + outro
];

export type CalloutKind = "card" | "big" | "stamp" | "chip";
export type Callout = { t: number; until: number; text: string; kind: CalloutKind; x?: number; y: number; rot?: number };

export const CALLOUTS: Callout[] = [
  { t: 0.9, until: 3.9, text: "2 KEBUN ANGGUR", kind: "big", y: 330 },
  { t: 4.3, until: 6.0, text: "PANEN TAK PERNAH BERKURANG", kind: "card", y: 310 },
  { t: 6.2, until: 8.8, text: "ABADI?", kind: "big", y: 330 },
  { t: 9.0, until: 10.05, text: "IA KELIRU", kind: "stamp", y: 380, rot: -6 },
  { t: 15.7, until: 21.3, text: "ANGGUR · KURMA · LADANG", kind: "card", y: 310 },
  { t: 22.3, until: 25.8, text: "BERBUAH PENUH · QS 18:33", kind: "card", y: 310 },
  { t: 27.8, until: 29.6, text: "\"HARTAKU LEBIH BANYAK\"", kind: "card", y: 310 },
  { t: 29.7, until: 31.15, text: "\"PENGIKUTKU LEBIH KUAT\"", kind: "card", y: 310 },
  { t: 31.5, until: 35.4, text: "MASUK KE KEBUNNYA · QS 18:35", kind: "chip", y: 300 },
  { t: 35.7, until: 38.4, text: "TIDAK AKAN BINASA?", kind: "stamp", y: 390, rot: -5 },
  { t: 38.6, until: 40.95, text: "KIAMAT TAK DATANG? · 18:36", kind: "card", y: 310 },
  { t: 41.3, until: 42.5, text: "QS 18:37", kind: "chip", y: 300 },
  { t: 42.6, until: 45.1, text: "DARI TANAH", kind: "big", y: 330 },
  { t: 45.2, until: 46.45, text: "LALU SETETES AIR", kind: "card", y: 310 },
  { t: 56.1, until: 59.75, text: "DIBINASAKAN · QS 18:42", kind: "stamp", y: 390, rot: -5 },
  { t: 60.1, until: 64.2, text: "MEMBOLAK-BALIKKAN TANGAN", kind: "chip", y: 300 },
  { t: 69.0, until: 70.95, text: "TAK ADA PENOLONG · 18:43", kind: "card", y: 310 },
  { t: 71.4, until: 73.4, text: "QS 18:45 · SEPERTI AIR HUJAN", kind: "card", y: 310 },
  { t: 73.55, until: 74.6, text: "TUMBUH", kind: "chip", y: 300 },
  { t: 74.75, until: 75.85, text: "KERING", kind: "chip", y: 300 },
  { t: 75.9, until: 77.0, text: "DITERBANGKAN ANGIN", kind: "chip", y: 300 },
  { t: 77.1, until: 79.25, text: "SEMUA AKAN LAYU", kind: "big", y: 330 },
  { t: 81.7, until: 83.55, text: "KISAH DALAM AL-QUR'AN", kind: "chip", y: 300 },
];
