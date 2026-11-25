// EP12 Sensor Sidik Jari HP — timing locked to the Cartesia VO (public/audio/vo.wav, 85.58 s).
// Film second = VO second (offset 0). Outro card fills 85.7–88.6.

export const FILM_SECONDS = 88.6;
export const OUTRO_SECONDS = 2.9;
export const XFADE = 0.35;

export type SceneId = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9" | "S10";
export const SCENES: { id: SceneId; start: number; end: number }[] = [
  { id: "S1", start: 0, end: 6.5 }, // hook: thumb unlocks phone
  { id: "S2", start: 6.5, end: 10.0 }, // what is matched? + AUDIRA EXPLAINED
  { id: "S3", start: 10.0, end: 19.7 }, // ridges, valleys, minutiae
  { id: "S4", start: 19.7, end: 25.6 }, // 1/3 capacitive: Home button exploded
  { id: "S5", start: 25.6, end: 32.9 }, // capacitor cross-section -> electric map
  { id: "S6", start: 32.9, end: 44.4 }, // 2/3 optical stack
  { id: "S7", start: 44.4, end: 58.2 }, // 3/3 ultrasonic stack + 3D relief
  { id: "S8", start: 58.2, end: 70.7 }, // template -> secure chip
  { id: "S9", start: 70.7, end: 80.5 }, // 1:50,000 + PIN + twins
  { id: "S10", start: 80.5, end: FILM_SECONDS }, // phone reassembles
];

export type CalloutKind = "big" | "chip" | "stamp";
export type Callout = { t: number; until: number; text: string; sub?: string; kind: CalloutKind; x?: number; y: number; rot?: number };

export const CALLOUTS: Callout[] = [
  { t: 1.3, until: 3.5, text: "1 DETIK", kind: "chip", y: 430 },
  { t: 5.4, until: 6.45, text: "BUKAN FOTO", kind: "stamp", y: 470, rot: -6 },
  { t: 22.1, until: 25.5, text: "2013", sub: "iPhone 5s", kind: "big", y: 1290 },
  { t: 41.7, until: 43.5, text: "2D", sub: "datar", kind: "big", y: 1290 },
  { t: 46.6, until: 50.0, text: "2019", sub: "Galaxy S10", kind: "big", y: 1290 },
  { t: 54.2, until: 56.5, text: "3D", sub: "relief", kind: "big", y: 1290 },
  { t: 73.3, until: 75.0, text: "1 : 50.000", sub: "peluang", kind: "big", y: 1290 },
  { t: 75.1, until: 77.5, text: "5× GAGAL → PIN", kind: "chip", y: 440 },
];
