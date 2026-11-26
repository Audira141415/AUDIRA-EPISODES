// EP18 Bilal bin Rabah — timing locked to the Cartesia VO (public/audio/vo.wav, 87.68 s). Film second = VO second.
// No imports: read by the shot list, SFX cue sheet and rig audit.

export const FILM_SECONDS = 91.0;
export const OUTRO_SECONDS = 3.0;
export const XFADE = 0.4;

export type SceneId = "S1" | "S2" | "S3a" | "S3b" | "S4a" | "S4b" | "S5a" | "S5b" | "S6a" | "S6b" | "S6c" | "S7a" | "S7b" | "S8a" | "S8b";
export const SCENES: { id: SceneId; start: number; end: number }[] = [
  { id: "S1", start: 0, end: 5.6 }, // hook: the stone, "Ahad"
  { id: "S2", start: 5.6, end: 14.7 }, // Makkah, the book
  { id: "S3a", start: 14.7, end: 18.2 }, // Umayyah
  { id: "S3b", start: 18.2, end: 28.2 }, // the valley, the stone, the choice
  { id: "S4a", start: 28.2, end: 32.8 }, // one finger, "Ahad, Ahad"
  { id: "S4b", start: 32.8, end: 39.2 }, // Waraqah on the cliff path
  { id: "S5a", start: 39.2, end: 44.55 }, // the exchange
  { id: "S5b", start: 44.55, end: 51.45 }, // the chain breaks
  { id: "S6a", start: 51.45, end: 54.8 }, // Madinah looks for a call
  { id: "S6b", start: 54.8, end: 58.8 }, // the azan at dawn
  { id: "S6c", start: 58.8, end: 65.3 }, // the dream, taught to Bilal
  { id: "S7a", start: 65.3, end: 73.85 }, // Makkah, the Ka'bah (payoff)
  { id: "S7b", start: 73.85, end: 77.85 }, // golden footsteps
  { id: "S8a", start: 77.85, end: 81.3 }, // Damaskus
  { id: "S8b", start: 81.3, end: FILM_SECONDS }, // five times a day + outro
];

export type CalloutKind = "letters" | "ribbon" | "tag" | "plate" | "cite" | "note" | "stamp" | "sign";
export type Callout = { t: number; until: number; text: string; ref?: string; kind: CalloutKind; x?: number; y: number; rot?: number; size?: number; w?: number; from?: "l" | "r" | "t"; col?: string };

export const CALLOUTS: Callout[] = [
  { t: 4.34, until: 5.6, text: "AHAD", kind: "letters", y: 400, size: 340 },

  { t: 6.1, until: 10.4, text: "BILAL BIN RABAH", kind: "ribbon", y: 360, size: 104 },
  { t: 8.0, until: 10.5, text: "± 580", ref: "MAKKAH", kind: "tag", x: 800, y: 560, size: 96 },
  { t: 12.76, until: 14.65, text: "KITAB SIRAH + HADIS", ref: "SUMBER KISAH INI", kind: "note", x: 540, y: 380, size: 78, rot: -2 },

  { t: 15.54, until: 18.15, text: "UMAYYAH BIN KHALAF", ref: "MAJIKAN", kind: "plate", x: 390, y: 400, size: 84, col: "terracotta", rot: -2 },

  { t: 18.75, until: 21.0, text: "SIRAH IBNU ISHAQ", kind: "cite", x: 330, y: 330, size: 58 },
  { t: 21.45, until: 24.4, text: "JAM PALING TERIK", kind: "tag", x: 290, y: 420, size: 84 },
  { t: 25.32, until: 28.1, text: "TINGGALKAN", kind: "sign", x: 290, y: 430, size: 88, rot: -4 },
  { t: 27.21, until: 28.1, text: "MATI DI SANA", kind: "sign", x: 770, y: 560, size: 88, rot: 4, col: "terracotta" },

  { t: 30.6, until: 32.75, text: "AHAD", kind: "letters", x: 320, y: 330, size: 190 },
  { t: 31.15, until: 32.75, text: "AHAD", kind: "letters", x: 740, y: 450, size: 190 },
  { t: 32.07, until: 32.75, text: "YANG MAHA ESA", kind: "ribbon", y: 640, size: 80 },

  { t: 34.18, until: 36.4, text: "WARAQAH BIN NAUFAL", kind: "plate", x: 640, y: 350, size: 82, col: "indigo", rot: 2 },
  { t: 36.52, until: 39.15, text: "“AHAD, DEMI ALLAH, BILAL.”", ref: "IBNU ISHAQ", kind: "note", x: 620, y: 400, w: 680, size: 92, rot: 2 },

  { t: 39.45, until: 41.9, text: "ABU BAKAR", kind: "plate", x: 290, y: 400, size: 96, col: "teal", rot: -3 },
  { t: 41.95, until: 43.4, text: "DITUKAR", kind: "tag", x: 540, y: 420, size: 104 },
  { t: 43.48, until: 44.5, text: "MERDEKA", kind: "stamp", x: 540, y: 420, size: 150, rot: -6 },

  { t: 45.22, until: 49.7, text: "“Abu Bakar pemimpin kita, dan dia memerdekakan pemimpin kita.”", ref: "UMAR BIN KHATTAB", kind: "note", x: 560, y: 410, w: 840, size: 76, rot: -1.5 },
  { t: 49.85, until: 51.4, text: "BUKHARI 3754 · SAHIH", kind: "cite", x: 540, y: 400, size: 78 },

  { t: 51.8, until: 53.2, text: "MADINAH", kind: "ribbon", y: 350, size: 116 },
  { t: 53.27, until: 54.75, text: "BAGAIMANA MEMANGGIL SALAT?", kind: "note", x: 500, y: 390, w: 720, size: 84, rot: 2 },

  { t: 57.43, until: 58.75, text: "BUKHARI 604 · SAHIH", kind: "cite", x: 360, y: 330, size: 64 },

  { t: 59.51, until: 62.4, text: "MIMPI ABDULLAH BIN ZAID", kind: "plate", x: 560, y: 1080, size: 66, col: "indigo", rot: -1 },
  { t: 60.88, until: 62.7, text: "IBNU MAJAH 706 · HASAN", kind: "cite", x: 590, y: 330, size: 62 },
  { t: 64.21, until: 65.25, text: "LEBIH LANTANG", kind: "ribbon", y: 380, size: 108 },

  { t: 65.75, until: 68.0, text: "630", ref: "MAKKAH DITAKLUKKAN", kind: "letters", y: 330, size: 250 },
  { t: 70.6, until: 71.7, text: "AZAN", kind: "letters", y: 360, size: 260 },
  { t: 71.84, until: 73.8, text: "IBNU KATSIR: DARI ATAPNYA", kind: "cite", x: 540, y: 340, size: 66 },

  { t: 74.0, until: 77.8, text: "BUKHARI 1149 · SAHIH", kind: "cite", x: 370, y: 1130, size: 62 },

  { t: 78.9, until: 81.25, text: "± 640", ref: "DAMASKUS", kind: "tag", x: 740, y: 450, size: 116 },

  { t: 84.75, until: 87.8, text: "5× SEHARI", kind: "letters", y: 400, size: 180, col: "gold" },
  { t: 86.49, until: 88.0, text: "AUDIRA QISSAH", kind: "ribbon", y: 1120, size: 104 },
];
