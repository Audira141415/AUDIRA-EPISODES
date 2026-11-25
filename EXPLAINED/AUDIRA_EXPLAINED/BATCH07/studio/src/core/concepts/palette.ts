// Palet konsep: netral style. Kit mengirim warnanya sendiri lewat prop `palette`, dan resep
// material POLISH lewat prop `material`; komponen hanya menentukan bentuk dan gerak.
//
//   <AirMolecule gas="O2" palette={{ primary: KIT.red }} material="clay" f={f} />

import { POLISH } from "../polish/Polish.tsx";

export type V3 = [number, number, number];

export type ConceptPalette = {
  /** Warna utama subjek (badan molekul, daun, bodi mobil). */
  primary: string;
  /** Warna pendamping (atom kedua, urat daun, aksen livery). */
  secondary: string;
  /** Aksen kecil yang harus menonjol (nomor, sorotan, ujung panah). */
  accent: string;
  /** Warna cahaya/emisi (sinar matahari, gelombang). */
  glow: string;
  /** Garis gelap: mata, ban, ventilasi. */
  ink: string;
};

export type MaterialName = keyof typeof POLISH;

/** Props bersama semua komponen konsep. */
export type ConceptProps = {
  /** Jam film 60 fps (sama dengan ToyPerson): `f = frame / fps * 60`. */
  f?: number;
  position?: V3;
  rotation?: V3;
  scale?: number;
  palette?: Partial<ConceptPalette>;
  /** Resep POLISH untuk permukaan padat (default toyPlastic). */
  material?: MaterialName;
};

export const DEFAULT_PALETTE: ConceptPalette = {
  primary: "#2f6fde",
  secondary: "#e8423f",
  accent: "#f2b400",
  glow: "#fff1b8",
  ink: "#15100d",
};

export const pal = (p?: Partial<ConceptPalette>, base: Partial<ConceptPalette> = {}): ConceptPalette => ({ ...DEFAULT_PALETTE, ...base, ...p });

/** Warna cahaya tampak per nama/panjang gelombang (nm), untuk WaveRibbon dan ScatterBurst. */
export const SPECTRUM = {
  violet: "#8a5cff",
  blue: "#3d8bff",
  cyan: "#3fd6e6",
  green: "#3fcf6a",
  yellow: "#ffd83d",
  orange: "#ff9a2e",
  red: "#ff4a3d",
} as const;

export function wavelengthColor(nm: number): string {
  if (nm < 440) return SPECTRUM.violet;
  if (nm < 485) return SPECTRUM.blue;
  if (nm < 510) return SPECTRUM.cyan;
  if (nm < 565) return SPECTRUM.green;
  if (nm < 590) return SPECTRUM.yellow;
  if (nm < 625) return SPECTRUM.orange;
  return SPECTRUM.red;
}

export const sec = (f = 0) => f / 60;
