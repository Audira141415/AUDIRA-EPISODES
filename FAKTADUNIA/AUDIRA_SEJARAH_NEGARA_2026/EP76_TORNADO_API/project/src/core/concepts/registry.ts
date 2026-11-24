// Registri konsep: kata kunci naskah/VO (Indonesia + Inggris) → komponen core/concepts atau ID
// GLB katalog lokal (E:/ASET/ASSET-AUDIRA/downloads/glb, dimuat lewat <AssetModel id=... />).
//
// Dipakai di tahap 4 (storyboard: kolom subjek tiap scene) dan G22 (THEME_CHECK: subjek di layar
// harus cocok dengan kata VO). Tanpa dependensi React, jadi aman diimpor dari skrip Node:
//
//   import { findConcepts } from "../src/core/concepts/registry.ts";
//   findConcepts("Molekul nitrogen menghamburkan cahaya biru")
//   // → [AirMolecule (gas N2), ScatterBurst, WaveRibbon (short), LightBeam]

export type ConceptDomain = "sains" | "olahraga" | "kendaraan";

export type ConceptEntry = {
  id: string;
  domain: ConceptDomain;
  /** Komponen di core/concepts (atau core/sport), mis. "AirMolecule". */
  component?: string;
  /** Props yang membuat komponen cocok dengan kata kunci, mis. { gas: "O2" }. */
  props?: Record<string, string | number | boolean>;
  /** ID GLB katalog (alternatif atau pelengkap komponen). */
  glb?: string[];
  /** Kata kunci huruf kecil; frasa boleh. Dicocokkan sebagai kata utuh. */
  keywords: string[];
  /** ID konsep umum yang disingkirkan bila konsep ini cocok (era spesifik menang atas umum). */
  overrides?: string[];
  /** Apa yang harus terlihat di layar, untuk kolom subjek THEME_CHECK. */
  reads: string;
};

export const CONCEPTS: ConceptEntry[] = [
  // ---- sains: cahaya & langit
  { id: "light-beam", domain: "sains", component: "LightBeam", props: { source: true }, keywords: ["cahaya", "sinar", "berkas cahaya", "cahaya matahari", "sinar matahari", "foton", "light", "sunlight", "beam", "ray", "photon"], reads: "berkas cahaya bercahaya dengan panah foton, matahari di pangkal" },
  { id: "sun", domain: "sains", component: "SunDisc", keywords: ["matahari", "surya", "sun", "solar"], reads: "matahari dengan mahkota sinar" },
  { id: "wave-short", domain: "sains", component: "WaveRibbon", props: { wavelength: "short" }, overrides: ["wave"], keywords: ["gelombang pendek", "panjang gelombang pendek", "cahaya biru", "biru", "ungu", "short wavelength", "blue light", "violet"], reads: "gelombang biru rapat + penggaris satu panjang gelombang" },
  { id: "wave-long", domain: "sains", component: "WaveRibbon", props: { wavelength: "long" }, overrides: ["wave"], keywords: ["gelombang panjang", "panjang gelombang panjang", "cahaya merah", "merah", "jingga", "senja", "long wavelength", "red light", "sunset"], reads: "gelombang merah renggang + penggaris satu panjang gelombang" },
  { id: "wave", domain: "sains", component: "WaveRibbon", keywords: ["gelombang", "panjang gelombang", "spektrum", "warna cahaya", "wave", "wavelength", "spectrum"], reads: "tabung gelombang 3D berkepala panah" },
  { id: "scatter", domain: "sains", component: "ScatterBurst", keywords: ["hamburan", "menghamburkan", "dihamburkan", "terpantul", "rayleigh", "hamburan rayleigh", "scatter", "scattering", "langit biru", "blue sky"], reads: "berkas putih menabrak molekul, gelombang biru terpental ke segala arah, merah tembus" },
  // ---- sains: molekul & gas
  { id: "molecule-n2", domain: "sains", component: "AirMolecule", props: { gas: "N2" }, overrides: ["molecule"], keywords: ["nitrogen", "n2", "molekul udara", "udara", "atmosfer", "air molecule", "atmosphere"], reads: "molekul dua atom biru berwajah" },
  { id: "molecule-o2", domain: "sains", component: "AirMolecule", props: { gas: "O2" }, overrides: ["molecule"], keywords: ["oksigen", "o2", "oxygen"], reads: "molekul dua atom merah berwajah" },
  { id: "molecule-co2", domain: "sains", component: "AirMolecule", props: { gas: "CO2" }, overrides: ["molecule"], keywords: ["karbon dioksida", "karbondioksida", "co2", "carbon dioxide"], reads: "molekul tiga atom (merah-hitam-merah) berwajah" },
  { id: "molecule-h2o", domain: "sains", component: "AirMolecule", props: { gas: "H2O" }, overrides: ["molecule"], keywords: ["molekul air", "h2o", "uap air", "water molecule", "water vapor"], reads: "molekul huruf V: satu atom merah, dua putih" },
  { id: "molecule", domain: "sains", component: "AirMolecule", keywords: ["molekul", "atom", "partikel", "gas", "molecule", "particle"], reads: "molekul berwajah (pilih gas yang disebut VO)" },
  { id: "gas-bubble", domain: "sains", component: "GasBubble", props: { gas: "O2" }, glb: ["rising-bubble-column-253b4a"], keywords: ["gelembung", "gelembung oksigen", "bubble", "bubbles"], reads: "gelembung sabun berpelangi berisi molekul gas" },
  // ---- sains: air
  { id: "water-drop", domain: "sains", component: "WaterDrop", glb: ["dewdrop-18a51f"], keywords: ["air", "tetes", "tetesan", "tetes air", "embun", "hujan", "water", "drop", "droplet", "dew", "rain"], reads: "tetes air bening berbentuk tetesan dengan kilau" },
  // ---- sains: tumbuhan
  { id: "leaf", domain: "sains", component: "Leaf", glb: ["fallen-oak-leaf-5b15fe", "leafy-bush-d37bba", "broadleaf-oak-997c22"], keywords: ["daun", "dedaunan", "tumbuhan", "tanaman", "pohon", "leaf", "leaves", "plant", "tree"], reads: "helai daun hijau dengan tulang dan urat daun" },
  { id: "stoma", domain: "sains", component: "Stoma", props: { gasFlow: true }, keywords: ["stomata", "stoma", "mulut daun", "pori daun", "sel penjaga", "guard cell"], reads: "dua sel penjaga hijau mengapit celah, CO₂ masuk O₂ keluar" },
  { id: "chloroplast", domain: "sains", component: "Chloroplast", keywords: ["kloroplas", "klorofil", "fotosintesis", "zat hijau daun", "grana", "tilakoid", "chloroplast", "chlorophyll", "photosynthesis", "thylakoid"], reads: "kloroplas dibelah berisi tumpukan grana hijau" },
  { id: "flower", domain: "sains", glb: ["sunflower-80ce15", "wildflower-plant-cf4279"], keywords: ["bunga", "bunga matahari", "flower", "sunflower"], reads: "GLB bunga" },
  { id: "cloud", domain: "sains", glb: ["towering-cloud-2e00f1"], keywords: ["awan", "mendung", "cloud", "clouds"], reads: "GLB awan" },

  // ---- olahraga: atlet per cabang
  { id: "tennis-player", domain: "olahraga", component: "SportsPerson", props: { sport: "tennis" }, keywords: ["tenis", "petenis", "pemain tenis", "servis", "wimbledon", "tennis", "tennis player", "serve"], reads: "atlet berbaju putih, bando, raket tenis, pose servis" },
  { id: "badminton-player", domain: "olahraga", component: "SportsPerson", props: { sport: "badminton" }, keywords: ["bulu tangkis", "badminton", "pebulu tangkis", "smash", "kok", "shuttlecock", "thomas cup", "piala thomas"], reads: "atlet berkaus tim, raket bulu tangkis, kok, pose smash" },
  { id: "f1-crew", domain: "olahraga", component: "SportsPerson", props: { sport: "f1crew" }, keywords: ["pit stop", "pitstop", "kru pit", "mekanik", "ganti ban", "pit crew", "mechanic", "tyre change", "tire change"], reads: "kru bercoverall tim, helm penuh visor gelap, wheel gun, jongkok" },
  { id: "marathon-1904", domain: "olahraga", component: "SportsPerson", props: { sport: "marathon1904" }, overrides: ["runner"], keywords: ["maraton 1904", "olimpiade 1904", "st. louis", "st louis", "pelari kuno", "pelari zaman dulu", "1904", "marathon 1904", "1904 olympics"], reads: "pelari singlet krem, celana selutut, kaus kaki panjang, topi pet, kumis, nomor dada" },
  { id: "runner", domain: "olahraga", component: "Athlete", props: { action: "run" }, keywords: ["maraton", "pelari", "lari", "berlari", "marathon", "runner", "running", "sprint"], reads: "atlet berlari (core/sport Athlete)" },
  { id: "boxer", domain: "olahraga", component: "SportsPerson", props: { sport: "boxing" }, keywords: ["tinju", "petinju", "sarung tinju", "ring tinju", "pukulan", "boxing", "boxer", "punch", "gloves"], reads: "petinju bertelanjang dada, sarung tinju besar, kuda-kuda" },
  { id: "tyre", domain: "olahraga", component: "Tyre", keywords: ["ban", "ban balap", "ban slick", "roda", "tyre", "tire", "wheel", "slick"], reads: "ban slick lebar dengan garis warna di dinding ban" },
  { id: "checkered-flag", domain: "olahraga", glb: ["checkered-flag-81784a"], keywords: ["bendera finis", "bendera kotak", "garis finis", "finis", "checkered flag", "finish line"], reads: "GLB bendera kotak-kotak" },
  { id: "trophy", domain: "olahraga", glb: ["trophy-cabinet-e963ac"], keywords: ["piala", "trofi", "juara", "trophy", "champion"], reads: "GLB lemari trofi" },

  // ---- kendaraan per era
  { id: "f1-modern", domain: "kendaraan", component: "RaceCar", props: { era: "modern" }, keywords: ["formula 1", "formula satu", "f1", "mobil f1", "mobil balap", "grand prix", "race car", "formula one"], reads: "mobil formula modern: sayap depan/belakang, halo, ban slick" },
  { id: "f1-1950s", domain: "kendaraan", component: "RaceCar", props: { era: "1950s" }, overrides: ["f1-modern"], keywords: ["fangio", "1950", "1951", "1952", "1953", "1954", "1955", "1956", "1957", "1958", "1959", "tahun 1950-an", "mobil balap klasik", "grand prix klasik", "1950s", "vintage race car"], reads: "mobil cerutu merah, gril oval krom, roda jari-jari kawat, roundel nomor" },
  { id: "car-1960s", domain: "kendaraan", glb: ["muscle-car-60s-524d46", "convertible-60s-b76f89"], keywords: ["1960-an", "tahun 60-an", "mobil 60-an", "muscle car", "1960s", "convertible"], reads: "GLB mobil jalan 1960-an" },
  { id: "car-1970s", domain: "kendaraan", glb: ["boxy-sedan-70s-7d55f7", "station-wagon-70s-11d67b", "pickup-truck-70s-8c0080"], keywords: ["1970-an", "tahun 70-an", "mobil 70-an", "1970s"], reads: "GLB mobil jalan 1970-an" },
  { id: "car-1980s", domain: "kendaraan", glb: ["wedge-coupe-80s-9f8b5e", "hatchback-80s-e95554"], keywords: ["1980-an", "tahun 80-an", "mobil 80-an", "1980s"], reads: "GLB mobil jalan 1980-an" },
  { id: "car-gt", domain: "kendaraan", glb: ["model-of-a-gt3-32b70d"], keywords: ["mobil sport", "gt3", "le mans", "sports car", "supercar"], reads: "GLB mobil sport GT modern" },
  { id: "team-bus", domain: "kendaraan", glb: ["team-minibus-f14295"], keywords: ["bus tim", "minibus", "team bus"], reads: "GLB minibus tim" },
];

/** Era → kendaraan. Mobil formula tidak ada di katalog GLB, jadi pakai komponen RaceCar. */
export const ERA_VEHICLES: Record<string, { component?: string; props?: Record<string, string>; glb?: string[] }> = {
  "f1-1950s": { component: "RaceCar", props: { era: "1950s" } },
  "f1-modern": { component: "RaceCar", props: { era: "modern" } },
  "road-1960s": { glb: ["muscle-car-60s-524d46", "convertible-60s-b76f89"] },
  "road-1970s": { glb: ["boxy-sedan-70s-7d55f7", "station-wagon-70s-11d67b"] },
  "road-1980s": { glb: ["wedge-coupe-80s-9f8b5e", "hatchback-80s-e95554"] },
  "gt-modern": { glb: ["model-of-a-gt3-32b70d"] },
};

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[₀-₉]/g, (d) => String(d.charCodeAt(0) - 0x2080));
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Konsep yang disebut dalam teks (satu kalimat VO atau baris naskah), diurutkan dari kecocokan
 * terpanjang (frasa spesifik menang atas kata umum: "gelombang pendek" > "gelombang"). Konsep
 * yang disingkirkan lewat `overrides` dibuang ("Fangio … mobil balap" → RaceCar 1950s saja).
 */
export function findConcepts(text: string): (ConceptEntry & { matched: string })[] {
  const t = ` ${norm(text)} `;
  const hits: (ConceptEntry & { matched: string })[] = [];
  for (const c of CONCEPTS) {
    let best = "";
    for (const k of c.keywords) {
      const re = new RegExp(`(^|[^\\p{L}\\p{N}])${escape(norm(k))}(?=$|[^\\p{L}\\p{N}])`, "u");
      if (re.test(t) && k.length > best.length) best = k;
    }
    if (best) hits.push({ ...c, matched: best });
  }
  const gone = new Set(hits.flatMap((h) => h.overrides ?? []));
  return hits.filter((h) => !gone.has(h.id)).sort((a, b) => b.matched.length - a.matched.length);
}

/** Konsep pertama yang cocok, atau undefined bila kalimat tidak menyebut konsep yang dikenal. */
export const conceptFor = (text: string) => findConcepts(text)[0];

/** Daftar semua komponen dan GLB untuk satu domain (untuk ASSET_MANIFEST). */
export const conceptsIn = (domain: ConceptDomain) => CONCEPTS.filter((c) => c.domain === domain);
