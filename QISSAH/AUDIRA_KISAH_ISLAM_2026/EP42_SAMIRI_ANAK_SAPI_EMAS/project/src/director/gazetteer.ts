// Place names a script may mention → lon/lat (historical + modern names, Indonesian spelling first).
// Pure data; matching is case-insensitive on whole words, longest name first. Add places freely.

export type Place = { name: string; lon: number; lat: number; kind?: "city" | "volcano" | "sea" | "island" | "river" | "region"; km?: number };

const P = (name: string, lon: number, lat: number, kind: Place["kind"] = "city", km?: number): Place => ({ name, lon, lat, kind, km });

export const PLACES: Place[] = [
  // Jawa
  P("Batavia", 106.83, -6.13), P("Jakarta", 106.83, -6.17), P("Sunda Kelapa", 106.81, -6.12), P("Banten", 106.15, -6.03), P("Serang", 106.15, -6.12),
  P("Bogor", 106.8, -6.6), P("Buitenzorg", 106.8, -6.6), P("Bandung", 107.61, -6.91), P("Sumedang", 107.92, -6.86), P("Cirebon", 108.55, -6.71), P("Tegal", 109.14, -6.87),
  P("Pekalongan", 109.67, -6.89), P("Semarang", 110.42, -6.97), P("Demak", 110.64, -6.89), P("Kudus", 110.84, -6.81), P("Jepara", 110.67, -6.59),
  P("Rembang", 111.34, -6.71), P("Tuban", 112.05, -6.9), P("Gresik", 112.65, -7.16), P("Surabaya", 112.75, -7.25), P("Sidoarjo", 112.72, -7.45),
  P("Pasuruan", 112.9, -7.64), P("Probolinggo", 113.22, -7.75), P("Malang", 112.63, -7.98), P("Ngantang", 112.37, -7.84), P("Kediri", 112.01, -7.82),
  P("Madiun", 111.52, -7.63), P("Ponorogo", 111.46, -7.87), P("Surakarta", 110.82, -7.57), P("Solo", 110.82, -7.57), P("Kartasura", 110.74, -7.56),
  P("Yogyakarta", 110.37, -7.8), P("Jogja", 110.37, -7.8), P("Tegalrejo", 110.35, -7.78), P("Kotagede", 110.4, -7.83), P("Plered", 110.42, -7.87),
  P("Selarong", 110.3, -7.93), P("Magelang", 110.22, -7.47), P("Mataram", 110.4, -7.83), P("Banyumas", 109.3, -7.51), P("Kebumen", 109.65, -7.67),
  P("Banyuwangi", 114.37, -8.21), P("Blambangan", 114.37, -8.21), P("Jember", 113.7, -8.17), P("Lumajang", 113.22, -8.13),
  P("Madura", 113.3, -7.05, "island"), P("Sumenep", 113.86, -7.01), P("Bangkalan", 112.73, -7.04), P("Pamekasan", 113.48, -7.16),
  P("Trowulan", 112.38, -7.56), P("Majapahit", 112.38, -7.56), P("Sungai Brantas", 112.78, -7.3, "river"), P("Bengawan Solo", 112.5, -6.95, "river"),
  P("Jawa", 110.0, -7.4, "island"), P("Java", 110.0, -7.4, "island"),
  // Bali & Nusa Tenggara
  P("Bali", 115.15, -8.4, "island"), P("Klungkung", 115.4, -8.54), P("Gelgel", 115.41, -8.56), P("Buleleng", 115.09, -8.11), P("Singaraja", 115.09, -8.11),
  P("Denpasar", 115.22, -8.65), P("Badung", 115.17, -8.62), P("Karangasem", 115.61, -8.45), P("Lombok", 116.3, -8.6, "island"),
  P("Ampenan", 116.07, -8.57), P("Cakranegara", 116.14, -8.59), P("Sumbawa", 117.4, -8.65, "island"), P("Sumbawa Besar", 117.42, -8.49),
  P("Bima", 118.72, -8.46), P("Dompu", 118.46, -8.54), P("Sanggar", 118.27, -8.32), P("Pekat", 117.9, -8.18), P("Flores", 121.0, -8.65, "island"),
  P("Ende", 121.66, -8.84), P("Larantuka", 122.98, -8.34), P("Kupang", 123.6, -10.17), P("Timor", 124.5, -9.6, "island"), P("Dili", 125.57, -8.56),
  P("Sumba", 120.0, -9.7, "island"), P("Solor", 123.1, -8.45, "island"),
  // Sulawesi
  P("Makassar", 119.42, -5.14), P("Ujung Pandang", 119.42, -5.14), P("Benteng Rotterdam", 119.405, -5.134), P("Gowa", 119.45, -5.21), P("Somba Opu", 119.41, -5.19),
  P("Tallo", 119.43, -5.1), P("Maros", 119.57, -5.0), P("Bone", 120.33, -4.54), P("Watampone", 120.33, -4.54), P("Wajo", 120.0, -4.0),
  P("Soppeng", 119.89, -4.35), P("Luwu", 120.2, -3.0), P("Palopo", 120.19, -2.99), P("Mandar", 119.0, -3.5), P("Bulukumba", 120.2, -5.55),
  P("Buton", 122.6, -5.47, "island"), P("Bau-Bau", 122.61, -5.47), P("Kendari", 122.51, -3.97), P("Manado", 124.84, 1.49), P("Minahasa", 124.9, 1.3),
  P("Gorontalo", 123.06, 0.54), P("Palu", 119.87, -0.9), P("Sulawesi", 120.3, -2.0, "island"),
  // Maluku & Papua
  P("Ambon", 128.18, -3.7), P("Saparua", 128.65, -3.57), P("Banda", 129.9, -4.53), P("Banda Neira", 129.9, -4.53), P("Ternate", 127.38, 0.79),
  P("Tidore", 127.4, 0.68), P("Halmahera", 128.0, 0.9, "island"), P("Seram", 129.5, -3.1, "island"), P("Maluku", 128.5, -3.2, "region"),
  P("Jayapura", 140.7, -2.53), P("Hollandia", 140.7, -2.53), P("Fakfak", 132.3, -2.92), P("Merauke", 140.4, -8.5), P("Papua", 138.0, -4.5, "island"),
  // Kalimantan
  P("Banjarmasin", 114.59, -3.32), P("Martapura", 114.85, -3.41), P("Pontianak", 109.33, -0.03), P("Sambas", 109.3, 1.36), P("Kutai", 116.99, -0.43),
  P("Tenggarong", 116.99, -0.41), P("Samarinda", 117.15, -0.5), P("Balikpapan", 116.83, -1.27), P("Kalimantan", 114.0, -0.5, "island"), P("Borneo", 114.0, -0.5, "island"),
  // Sumatra
  P("Aceh", 95.32, 5.55), P("Banda Aceh", 95.32, 5.55), P("Kutaraja", 95.32, 5.55), P("Pidie", 96.0, 5.1), P("Medan", 98.67, 3.59), P("Deli", 98.67, 3.6),
  P("Padang", 100.35, -0.95), P("Bukittinggi", 100.37, -0.3), P("Pagaruyung", 100.62, -0.47), P("Minangkabau", 100.4, -0.6, "region"),
  P("Palembang", 104.75, -2.98), P("Sriwijaya", 104.75, -2.98), P("Jambi", 103.61, -1.61), P("Bengkulu", 102.26, -3.79), P("Bencoolen", 102.26, -3.79),
  P("Lampung", 105.26, -5.43), P("Siak", 102.05, 0.8), P("Pekanbaru", 101.45, 0.51), P("Riau", 104.45, 0.92, "region"), P("Bangka", 106.1, -2.2, "island"),
  P("Belitung", 107.9, -2.85, "island"), P("Nias", 97.7, 1.1, "island"), P("Sumatra", 101.5, -0.5, "island"), P("Sumatera", 101.5, -0.5, "island"),
  // Semenanjung & sekitarnya
  P("Malaka", 102.25, 2.19), P("Melaka", 102.25, 2.19), P("Johor", 103.75, 1.48), P("Singapura", 103.82, 1.29), P("Temasek", 103.82, 1.29),
  P("Nanjing", 118.8, 32.06), P("Fujian", 119.6, 26.05), P("Guangzhou", 113.26, 23.13), P("Kanton", 113.26, 23.13), P("Hainan", 109.8, 19.2, "island"),
  P("Samudra Hindia", 92.5, 5.5, "sea"), P("Laut Cina Selatan", 113.0, 12.0, "sea"), P("Semenanjung Malaya", 102.0, 4.5, "region"),
  P("Penang", 100.33, 5.41), P("Kedah", 100.37, 6.12), P("Manila", 120.98, 14.6), P("Sulu", 121.0, 6.05), P("Brunei", 114.94, 4.89), P("Darwin", 130.84, -12.46),
  // seas & straits (labels)
  P("Selat Sunda", 105.8, -6.0, "sea"), P("Selat Malaka", 100.5, 3.0, "sea"), P("Laut Jawa", 111.0, -5.2, "sea"), P("Selat Makassar", 118.0, -2.0, "sea"),
  P("Selat Bali", 114.45, -8.3, "sea"), P("Laut Banda", 127.0, -6.0, "sea"), P("Laut Flores", 120.5, -7.5, "sea"),
  // volcanoes (km = summit height)
  P("Tambora", 117.99, -8.25, "volcano", 2.85), P("Gunung Tambora", 117.99, -8.25, "volcano", 2.85), P("Krakatau", 105.42, -6.1, "volcano", 0.8),
  P("Merapi", 110.44, -7.54, "volcano", 2.9), P("Bromo", 112.95, -7.94, "volcano", 2.3), P("Semeru", 112.92, -8.11, "volcano", 3.67),
  P("Kelud", 112.31, -7.93, "volcano", 1.7), P("Rinjani", 116.46, -8.41, "volcano", 3.7), P("Agung", 115.51, -8.34, "volcano", 3.1),
  P("Galunggung", 108.06, -7.25, "volcano", 2.17), P("Papandayan", 107.73, -7.32, "volcano", 2.66), P("Toba", 98.9, 2.6, "volcano", 1.9),
  P("Sinabung", 98.39, 3.17, "volcano", 2.46), P("Tangkuban Parahu", 107.6, -6.77, "volcano", 2.08),
];

/** Volcanoes drawn on every relief map (lon, lat, summit km, base radius in map px). */
export const VOLCANOES: { lon: number; lat: number; km: number; r: number }[] = [
  { lon: 104.5, lat: -5.0, km: 2.1, r: 7 }, { lon: 105.42, lat: -6.1, km: 0.8, r: 3 }, { lon: 106.98, lat: -6.79, km: 2.95, r: 6 }, { lon: 107.64, lat: -7.15, km: 2.4, r: 6 },
  { lon: 108.4, lat: -6.89, km: 3.08, r: 6 }, { lon: 109.21, lat: -7.24, km: 3.4, r: 7 }, { lon: 109.9, lat: -7.2, km: 2.5, r: 5 }, { lon: 110.44, lat: -7.54, km: 2.9, r: 6 },
  { lon: 111.19, lat: -7.63, km: 3.2, r: 6 }, { lon: 112.59, lat: -7.76, km: 3.3, r: 6 }, { lon: 112.92, lat: -8.11, km: 3.67, r: 7 }, { lon: 113.6, lat: -7.98, km: 2.6, r: 6 },
  { lon: 114.04, lat: -8.12, km: 3.3, r: 7 }, { lon: 115.51, lat: -8.34, km: 3.1, r: 5 }, { lon: 116.46, lat: -8.41, km: 3.7, r: 6 }, { lon: 117.99, lat: -8.25, km: 2.85, r: 9 },
  { lon: 119.06, lat: -8.2, km: 1.9, r: 3 }, { lon: 120.1, lat: -8.6, km: 2.3, r: 6 }, { lon: 101.26, lat: -1.7, km: 3.8, r: 7 }, { lon: 100.47, lat: -0.38, km: 2.9, r: 6 },
  { lon: 98.39, lat: 3.17, km: 2.4, r: 5 }, { lon: 102.62, lat: -4.02, km: 3.1, r: 6 }, { lon: 120.0, lat: -2.5, km: 3.4, r: 8 }, { lon: 124.79, lat: 1.36, km: 1.9, r: 4 },
  { lon: 127.33, lat: 0.8, km: 1.7, r: 3 }, { lon: 137.2, lat: -4.1, km: 4.8, r: 10 },
];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const SORTED = [...PLACES].sort((a, b) => b.name.length - a.name.length);

/** All places named in a text, in order of appearance (no duplicates). */
export const findPlaces = (text: string): Place[] => {
  const t = " " + norm(text).replace(/[^a-z0-9\- ]/g, " ") + " ";
  const hits: { at: number; p: Place }[] = [];
  const taken: [number, number][] = [];
  for (const p of SORTED) {
    const n = " " + norm(p.name) + " ";
    let i = t.indexOf(n);
    while (i >= 0) {
      const a = i, b = i + n.length;
      if (!taken.some(([x, y]) => a < y && b > x)) {
        hits.push({ at: a, p });
        taken.push([a, b]);
      }
      i = t.indexOf(n, i + 1);
    }
  }
  hits.sort((a, b) => a.at - b.at);
  const out: Place[] = [];
  for (const h of hits) if (!out.some((o) => o.name === h.p.name)) out.push(h.p);
  return out;
};
