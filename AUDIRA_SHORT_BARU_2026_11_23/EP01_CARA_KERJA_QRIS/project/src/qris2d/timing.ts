// EP01 Cara Kerja QRIS — BONGKAR timing. Film second = VO second + OFFSET (VO 77.63 s, public/audio/vo.wav).
// Outro card fills 78.2–81.2.

export const OFFSET = 0.3;
export const FILM_SECONDS = 81.2;
export const OUTRO_SECONDS = 3.0;
export const XFADE = 0.35;

export type SceneId = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9" | "S10" | "S11";
export const SCENES: { id: SceneId; start: number; end: number }[] = [
  { id: "S1", start: 0, end: 8.3 }, // hook: scan, pay, merchant phone "berhasil"
  { id: "S2", start: 8.3, end: 10.85 }, // where does the money go?
  { id: "S3", start: 10.85, end: 19.4 }, // this is QRIS: BI + ASPI, 17·08·2019
  { id: "S4", start: 19.4, end: 25.6 }, // before: many QR stickers -> one QRIS
  { id: "S5", start: 25.6, end: 34.6 }, // QR taken apart: pattern, EMVCo, merchant data, NMID
  { id: "S6", start: 34.6, end: 41.3 }, // phone -> issuer bank
  { id: "S7", start: 41.3, end: 50.15 }, // GPN hub + 4 switching racks
  { id: "S8", start: 50.15, end: 57.55 }, // acquirer bank, code 00, notification
  { id: "S9", start: 57.55, end: 66.9 }, // inside Indonesia + 71.91 M users / 51.31 M merchants
  { id: "S10", start: 66.9, end: 71.66 }, // MDR 0% micro business <= Rp500k
  { id: "S11", start: 71.66, end: FILM_SECONDS - OUTRO_SECONDS }, // three parties + AUDIRA EXPLAINED
];

export type CalloutKind = "big" | "chip" | "stamp";
export type Callout = { t: number; until: number; text: string; sub?: string; kind: CalloutKind; x?: number; y: number; rot?: number };

export const CALLOUTS: Callout[] = [
  { t: 16.35, until: 19.2, text: "17·08·2019", sub: "diluncurkan", kind: "big", y: 1290 },
  { t: 27.95, until: 29.7, text: "EMVCo", sub: "format standar", kind: "big", y: 1290 },
  { t: 31.0, until: 33.2, text: "NMID", sub: "ID merchant nasional", kind: "big", y: 1290 },
  { t: 45.4, until: 47.0, text: "4 PERUSAHAAN SWITCHING", kind: "chip", y: 450 },
  { t: 54.05, until: 56.0, text: "00 = BERHASIL", kind: "stamp", y: 1200, rot: -6 },
  { t: 60.3, until: 62.4, text: "DI DALAM NEGERI", kind: "stamp", y: 1150, rot: -5 },
  { t: 63.8, until: 65.4, text: "71,91 JT", sub: "pengguna", kind: "big", y: 1290 },
  { t: 65.5, until: 66.85, text: "51,31 JT", sub: "merchant", kind: "big", y: 1290 },
  { t: 70.3, until: 71.6, text: "MDR 0%", sub: "≤ Rp500 rb", kind: "big", y: 1290 },
  { t: 74.05, until: 75.6, text: "3 PIHAK", kind: "chip", y: 450 },
];
