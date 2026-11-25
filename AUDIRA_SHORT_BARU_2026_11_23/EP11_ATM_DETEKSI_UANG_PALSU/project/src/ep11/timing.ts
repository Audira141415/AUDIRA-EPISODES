// EP11 ATM & deteksi uang palsu — timing locked to the Cartesia VO (public/audio/vo.wav, 78.76 s).
// Film second = VO second (offset 0). Outro card fills 78.8–81.8.

export const FILM_SECONDS = 81.8;
export const OUTRO_SECONDS = 3.0;
export const XFADE = 0.4;

export type SceneId = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8";
export const SCENES: { id: SceneId; start: number; end: number }[] = [
  { id: "S1", start: 0, end: 7.8 },
  { id: "S2", start: 7.8, end: 14.5 },
  { id: "S3", start: 14.5, end: 29.9 },
  { id: "S4", start: 29.9, end: 39.9 },
  { id: "S5", start: 39.9, end: 50.0 },
  { id: "S6", start: 50.0, end: 61.1 },
  { id: "S7", start: 61.1, end: 72.2 },
  { id: "S8", start: 72.2, end: FILM_SECONDS },
];

export type CalloutKind = "plate" | "card" | "big" | "stamp" | "chip";
export type Callout = { t: number; until: number; text: string; kind: CalloutKind; x?: number; y: number; rot?: number; color?: string };

export const CALLOUTS: Callout[] = [
  { t: 0.3, until: 7.6, text: "MATA MESIN vs UANG PALSU", kind: "plate", y: 290 },
  { t: 8.6, until: 10.1, text: "MODUL VALIDATOR", kind: "card", y: 300 },
  { t: 10.4, until: 11.8, text: "SELEMBAR DEMI SELEMBAR", kind: "card", y: 300 },
  { t: 15.8, until: 17.5, text: "01 · SINAR UV", kind: "big", y: 320 },
  { t: 18.6, until: 21.5, text: "HVS = MENYALA", kind: "card", y: 300, color: "#1f5fbf" },
  { t: 22.7, until: 24.4, text: "SERAT KAPAS = KUSAM", kind: "card", y: 300 },
  { t: 24.6, until: 27.1, text: "Rp100.000 · TE 2022", kind: "card", y: 300 },
  { t: 27.3, until: 29.8, text: "PETA INDONESIA ✦ UV", kind: "card", y: 300, color: "#4d7c0f" },
  { t: 30.1, until: 31.2, text: "02 · MAGNET", kind: "big", y: 320 },
  { t: 31.4, until: 33.9, text: "TINTA MAGNETIK", kind: "card", y: 300, color: "#3949ab" },
  { t: 34.1, until: 35.9, text: "03 · INFRAMERAH", kind: "big", y: 320 },
  { t: 38.8, until: 39.8, text: "IR: HILANG", kind: "stamp", y: 330, rot: -6 },
  { t: 40.1, until: 42.2, text: "04 · KETEBALAN", kind: "big", y: 320 },
  { t: 42.4, until: 44.9, text: "SELOTIP!", kind: "stamp", y: 330, rot: -5 },
  { t: 45.3, until: 47.9, text: "05 · KAMERA GARIS", kind: "big", y: 320 },
  { t: 48.3, until: 49.9, text: "POLA ✓ COCOK", kind: "card", y: 300, color: "#15803d" },
  { t: 50.2, until: 51.7, text: "1 GAGAL = TOLAK", kind: "card", y: 300 },
  { t: 51.8, until: 53.4, text: "DITOLAK", kind: "stamp", y: 360, rot: -7 },
  { t: 53.6, until: 56.2, text: "WAJIB DITAHAN BANK", kind: "card", y: 300 },
  { t: 56.5, until: 59.7, text: "MESUJI · 26 LEMBAR", kind: "card", y: 300 },
  { t: 59.8, until: 61.0, text: "Rp1,3 MILIAR", kind: "big", y: 320 },
  { t: 62.9, until: 64.9, text: "DILIHAT · DIRABA · DITERAWANG", kind: "card", y: 300 },
  { t: 69.7, until: 72.1, text: "10 TAHUN PENJARA", kind: "big", y: 320 },
  { t: 70.5, until: 72.1, text: "DENDA s.d. Rp10 M · UU 7/2011", kind: "chip", y: 470 },
];
