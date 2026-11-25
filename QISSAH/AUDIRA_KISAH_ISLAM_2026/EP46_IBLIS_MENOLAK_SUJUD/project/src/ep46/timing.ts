// EP46 Iblis Menolak Sujud — timing locked to the Cartesia VO (public/audio/vo.wav, 80.76 s).
// Film second = VO second (offset 0). Outro card fills 80.9–83.8.

export const FILM_SECONDS = 83.8;
export const OUTRO_SECONDS = 2.9;
export const XFADE = 0.45;

export type SceneId = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9";
export const SCENES: { id: SceneId; start: number; end: number }[] = [
  { id: "S1", start: 0, end: 8.85 }, // hook: sombong, api tegak vs barisan cahaya
  { id: "S2", start: 8.85, end: 20.45 }, // khalifah di bumi, malaikat bertanya
  { id: "S3", start: 20.45, end: 27.0 }, // Adam dari tanah, nama-nama
  { id: "S4", start: 27.0, end: 37.5 }, // sujud — kecuali satu
  { id: "S5", start: 37.5, end: 49.25 }, // api vs tanah, qiyas pertama
  { id: "S6", start: 49.25, end: 53.2 }, // penangguhan
  { id: "S7", start: 53.2, end: 60.8 }, // empat arah
  { id: "S8", start: 60.8, end: 75.2 }, // dua jalan, tobat Adam (payoff)
  { id: "S9", start: 75.2, end: FILM_SECONDS }, // hati yang merasa lebih baik + outro
];

export type CalloutKind = "card" | "big" | "stamp" | "chip" | "quote";
export type Callout = { t: number; until: number; text: string; ref?: string; kind: CalloutKind; x?: number; y: number; rot?: number };

export const CALLOUTS: Callout[] = [
  { t: 2.7, until: 4.85, text: "BUKAN MENCURI · BUKAN MEMBUNUH", kind: "chip", y: 330 },
  { t: 5.0, until: 8.6, text: "DOSA PERTAMA: SOMBONG", kind: "stamp", y: 420, rot: -6 },
  { t: 10.75, until: 13.2, text: "KHALIFAH DI BUMI", ref: "QS AL-BAQARAH: 30", kind: "card", y: 330 },
  { t: 13.35, until: 17.35, text: "YANG BERBUAT KERUSAKAN?", ref: "PERTANYAAN PARA MALAIKAT", kind: "card", y: 330 },
  { t: 17.5, until: 20.35, text: "AKU MENGETAHUI APA YANG TIDAK KALIAN KETAHUI", ref: "QS AL-BAQARAH: 30", kind: "card", y: 350 },
  { t: 21.1, until: 22.9, text: "DARI TANAH", kind: "big", y: 340 },
  { t: 23.05, until: 26.9, text: "NAMA-NAMA SELURUHNYA", ref: "QS AL-BAQARAH: 31", kind: "card", y: 330 },
  { t: 28.3, until: 31.45, text: "SUJUDLAH KEPADA ADAM", ref: "QS AL-BAQARAH: 34", kind: "card", y: 330 },
  { t: 31.55, until: 32.6, text: "SEMUA SUJUD", kind: "chip", y: 330 },
  { t: 32.65, until: 34.3, text: "KECUALI IBLIS", kind: "stamp", y: 400, rot: -5 },
  { t: 34.35, until: 37.4, text: "DARI GOLONGAN JIN", ref: "QS AL-KAHFI: 50", kind: "card", y: 330 },
  { t: 39.5, until: 43.8, text: "“AKU LEBIH BAIK DARINYA”", ref: "QS AL-A'RAF: 12", kind: "quote", y: 360 },
  { t: 43.9, until: 46.7, text: "API vs TANAH", kind: "big", y: 340 },
  { t: 46.75, until: 49.15, text: "QIYAS PERTAMA", kind: "stamp", y: 400, rot: -6 },
  { t: 49.9, until: 53.1, text: "DITANGGUHKAN SAMPAI HARI KEBANGKITAN", ref: "QS AL-A'RAF: 15", kind: "card", y: 340 },
  { t: 53.4, until: 57.5, text: "SUMPAH IBLIS", ref: "QS AL-A'RAF: 17", kind: "card", y: 300 },
  { t: 57.7, until: 60.7, text: "KEBANYAKAN TAK BERSYUKUR", ref: "QS AL-A'RAF: 17", kind: "card", y: 300 },
  { t: 63.15, until: 65.2, text: "DUA KESALAHAN · DUA JALAN", kind: "chip", y: 330 },
  { t: 66.2, until: 69.2, text: "BEBERAPA KALIMAT DARI TUHANNYA", ref: "QS AL-BAQARAH: 37", kind: "card", y: 340 },
  { t: 69.35, until: 70.65, text: "TOBAT DITERIMA", kind: "stamp", y: 400, rot: -5 },
  { t: 70.7, until: 75.1, text: "IBLIS: MERASA BENAR", kind: "chip", y: 300 },
  { t: 73.15, until: 75.1, text: "ADAM: MENGAKU SALAH", kind: "chip", y: 420 },
  { t: 77.1, until: 80.8, text: "HATI YANG MERASA LEBIH BAIK", kind: "card", y: 330 },
];
