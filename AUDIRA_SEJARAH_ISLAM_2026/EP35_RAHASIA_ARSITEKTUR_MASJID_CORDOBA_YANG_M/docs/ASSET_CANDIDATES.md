# Asset Candidates — Rahasia Arsitektur Masjid Córdoba

Dicari via `audira_search_assets` (2026-11-25). Katalog tidak punya model masjid, lengkung tapal kuda, atau mihrab; pencarian "masjid/cordoba/arch" kosong atau tidak relevan. Arsitektur inti harus dibangun prosedural (lengkung + tiang instanced) atau ilustrasi 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Hutan tiang + lengkung merah-putih berlapis | — | Bangun prosedural: arkade instanced (tiang silinder + lengkung tapal kuda + setengah lingkaran, voussoir merah/putih) |
| c01_intro | Peta Mediterania Damaskus → Córdoba, siluet pangeran berkuda tanpa wajah | — | Peta 2D/HUD; siluet flat, tanpa wajah (aturan QISSAH) |
| c02 | Reruntuhan Romawi/Visigoth, tiang bekas diangkut | `broken-stone-column-c91287` (prop) | Tiang patah cocok untuk reruntuhan; derek kayu belum dicari |
| c03 | Diagram potongan lengkung dua tingkat + saluran air Mérida | — | Diagram blueprint 2D lebih jelas daripada GLB |
| c04 | Close-up voussoir bata merah + batu putih | — | Material prosedural pada geometri lengkung |
| c05 | Kompas di atas denah masjid, kartu kitab Tirmidzi | — | HUD/infografis 2D |
| c06 | Mihrab mosaik emas, keping mosaik berjatuhan, siluet perajin | `gilded-column-casing-72e846` (prop) | Hanya aksen emas; mihrab tetap prosedural/ilustrasi |
| c07_payoff | Hero shot atap + menara, kota tepi sungai, pohon palem halaman | `palm-tree-a307da` (prop) | Halaman jeruk/palem; bangunan masjid prosedural |

Saran engine: hybrid — arkade lengkung berulang paling kuat sebagai 3D prosedural R3F (kedalaman "hutan tiang"), sementara peta, diagram lengkung, dan kartu hadis lebih terbaca sebagai lapisan 2D; katalog GLB hampir tidak punya aset arsitektur Islam.
