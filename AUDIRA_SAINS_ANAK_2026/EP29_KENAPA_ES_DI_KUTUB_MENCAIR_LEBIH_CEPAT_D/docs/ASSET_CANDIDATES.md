# Asset Candidates — Kenapa Es di Kutub Mencair Lebih Cepat dari Prediksi

Dicari 2026-11-25 lewat `audira_search_assets` (topic) + listing katalog lokal `E:/ASET/ASSET-AUDIRA/downloads/glb/`. Katalog tidak punya GLB es/gletser/beruang kutub/satelit khusus: es, laut, gletser dibuat prosedural (material es/air), bukan partikel abstrak.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Bongkahan es retak, layar grafik model vs observasi | — (es prosedural) | Mesh es low-poly custom + HUD grafik 2D |
| c01_intro | Satelit di orbit atas Arktik | — | Tidak ada GLB satelit di katalog; cari ulang di tahap 5 atau model sederhana |
| c02 | Peta Arktik mengerut, globe + termometer | — | Peta/globe prosedural + HUD; termometer sebagai callout |
| c03 | Tiga permukaan (es, salju, laut) + sinar Matahari | — | Panel material PBR (albedo beda) + panah cahaya |
| c04 | Lingkaran umpan balik, beruang di es | `bear-base` (animal), `penguin-base` (animal, hanya untuk Antartika, jangan di Arktik) | `bear-base` diberi material putih jadi beruang kutub; cek proporsi |
| c05 | Tebing gletser Greenland, potongan tanah permafrost, gelembung gas | `mountain-refuge-hut-32ab1e` (building), `camp-tent-3c5c89` (building) | Pos peneliti sebagai skala di tundra; tebing es prosedural |
| c06 | Peneliti di depan layar data | `bench-researcher-d0f1b9` (character, ada versi character-anim) | Pakai `<AssetCharacter>` klip Point ke grafik |
| c07_payoff | Hero shot Arktik golden hour, kapal riset opsional | `naval-officer-93027f` (character), `boathouse-cf20e6` (building) | Opsional; fokus lanskap es vs laut gelap |

Saran engine: hybrid — 3D (R3F) untuk es/laut/gletser dengan material albedo nyata dan beruang GLB, ditambah HUD/grafik 2D kinetik untuk angka (12,2%, 4x, 50–70/90/6%, 3.902 miliar ton); DATAPHYSICAL atau DISASTERSIM cocok.
