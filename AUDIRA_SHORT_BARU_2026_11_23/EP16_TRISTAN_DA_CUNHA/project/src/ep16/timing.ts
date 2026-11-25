// EP16 Tristan da Cunha — timing locked to the Cartesia VO (public/audio/vo.wav, 85.03 s).
// Film second = VO second (offset 0). Scene cuts sit on word anchors from vo-words.json. Outro card fills 85.2–88.1.

export const FILM_SECONDS = 88.1;
export const OUTRO_SECONDS = 2.9;
export const XFADE = 0.35;

export type SceneId =
  | "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9" | "S10" | "S11" | "S12" | "S13" | "S14" | "S15";

// Anchors (word @ s): Ini 8.05 · Namanya 16.02 · Kota 20.51 · Pulau 25.37 · Penghuninya 29.72 · Semuanya 34.43 ·
// Mereka 38.75 · Tidak 43.67 · Tanahnya 51.89 · Lalu 56.78 · Seluruh 63.89 · Dua 69.19 · Pelabuhan 72.94 · Rumah 77.99
export const SCENES: { id: SceneId; start: number; end: number }[] = [
  { id: "S1", start: 0, end: 7.9 }, // hook: lone island, 2.437 km ring to St Helena
  { id: "S2", start: 7.9, end: 15.9 }, // Atlantic map, island named
  { id: "S3", start: 15.9, end: 20.4 }, // 1506 Portuguese caravel
  { id: "S4", start: 20.4, end: 25.25 }, // route to Cape Town 2.810 km
  { id: "S5", start: 25.25, end: 29.6 }, // volcano 2.062 m
  { id: "S6", start: 29.6, end: 34.3 }, // ±220 people, 11 surnames
  { id: "S7", start: 34.3, end: 38.6 }, // Edinburgh of the Seven Seas village
  { id: "S8", start: 38.6, end: 43.5 }, // lobster, potatoes, stamps
  { id: "S9", start: 43.5, end: 51.75 }, // no airport, ship from Cape Town
  { id: "S10", start: 51.75, end: 56.6 }, // communal land
  { id: "S11", start: 56.6, end: 63.75 }, // 1961 eruption (payoff impact 61.45)
  { id: "S12", start: 63.75, end: 69.05 }, // evacuation route to England
  { id: "S13", start: 69.05, end: 72.8 }, // 1963 return route
  { id: "S14", start: 72.8, end: 77.85 }, // Calshot Harbour
  { id: "S15", start: 77.85, end: FILM_SECONDS }, // dusk outro + cartouche
];

export type CalloutKind = "card" | "big" | "stamp" | "chip";
export type Callout = { t: number; until: number; text: string; sub?: string; kind: CalloutKind; x?: number; y: number; rot?: number };

export const CALLOUTS: Callout[] = [
  { t: 2.35, until: 4.85, text: "2.437 KM", sub: "KE TETANGGA TERDEKAT · ST HELENA", kind: "big", y: 420 },
  { t: 4.9, until: 7.8, text: "TANPA BANDARA", kind: "stamp", y: 380, rot: -6 },
  { t: 13.0, until: 15.8, text: "PALING TERPENCIL", sub: "TEMPAT BERPENGHUNI · DUNIA", kind: "card", y: 330 },
  { t: 17.2, until: 19.1, text: "PELAUT PORTUGIS", kind: "chip", y: 300 },
  { t: 19.2, until: 20.35, text: "1506", kind: "big", y: 400 },
  { t: 22.3, until: 25.2, text: "2.810 KM", sub: "KE CAPE TOWN · KOTA DARATAN TERDEKAT", kind: "big", y: 420 },
  { t: 27.6, until: 29.55, text: "2.062 M", sub: "QUEEN MARY'S PEAK · GUNUNG API", kind: "big", y: 400 },
  { t: 30.6, until: 34.25, text: "±220 WARGA", kind: "card", y: 300 },
  { t: 32.9, until: 34.25, text: "11 NAMA KELUARGA", kind: "chip", y: 470 },
  { t: 36.1, until: 38.55, text: "EDINBURGH OF THE SEVEN SEAS", sub: "SATU-SATUNYA DESA", kind: "card", y: 330 },
  { t: 39.8, until: 43.45, text: "LOBSTER BATU", kind: "chip", x: 300, y: 300 },
  { t: 40.9, until: 43.45, text: "KENTANG", kind: "chip", x: 800, y: 300 },
  { t: 41.9, until: 43.45, text: "PRANGKO", kind: "chip", x: 540, y: 420 },
  { t: 43.7, until: 46.3, text: "TIDAK ADA BANDARA", kind: "stamp", y: 380, rot: -5 },
  { t: 48.2, until: 50.0, text: "±10 KAPAL / TAHUN", kind: "card", y: 330 },
  { t: 50.05, until: 51.7, text: "±7 HARI", sub: "SEKALI JALAN", kind: "big", y: 400 },
  { t: 52.4, until: 53.9, text: "MILIK BERSAMA", kind: "card", y: 320 },
  { t: 54.0, until: 56.55, text: "ORANG LUAR DILARANG BELI", kind: "stamp", y: 400, rot: -4 },
  { t: 57.7, until: 61.3, text: "10 OKT 1961", kind: "big", y: 400 },
  { t: 61.45, until: 63.7, text: "MELETUS", kind: "stamp", y: 380, rot: -7 },
  { t: 64.45, until: 66.6, text: "264 WARGA", sub: "SELURUH PULAU DIEVAKUASI", kind: "big", y: 400 },
  { t: 66.7, until: 69.0, text: "→ INGGRIS", kind: "card", y: 330 },
  { t: 69.2, until: 70.5, text: "1963", kind: "big", y: 400 },
  { t: 70.55, until: 72.75, text: "±200 PULANG", kind: "card", y: 330 },
  { t: 73.4, until: 77.7, text: "PELABUHAN TRISTAN", sub: "DINAMAI DARI KAMP CALSHOT · INGGRIS", kind: "card", y: 330 },
  { t: 78.0, until: 80.5, text: "BUKAN SOAL JARAK", kind: "card", y: 340 },
  { t: 80.65, until: 85.0, text: "BERANI TINGGAL DI SANA?", kind: "card", y: 340 },
];
