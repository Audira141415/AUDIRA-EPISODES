# Asset Candidates — Cara Kerja Detektor Asap

> Dicari via `audira_search_assets` (2026-11-26). Katalog TIDAK punya GLB detektor asap, ruang deteksi, LED/sensor, pelat ionisasi, maupun baterai 9 volt. Yang ada: perabot kamar/dapur, lilin, rumah deretan. Inti mekanisme (c01–c05) harus dibuat procedural/2D cutaway.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Kamar tidur malam, detektor bulat di plafon, asap tipis, bara kecil, siluet orang tidur | `bedside-table-740c6b` / prop, `table-candle-lantern-a7b5af` / prop | Detektor dimodel procedural (silinder + kisi ventilasi) tanpa merek; siluet tanpa wajah (rule 15) |
| c01_intro | Ikon hidung dicoret, zoom menembus casing, partikel asap | — | 2D/procedural; ikon lucide; HUD split "Fotolistrik / Ionisasi" |
| c02 | Ruang deteksi labirin, LED, berkas cahaya, sensor, hamburan | — | Cutaway procedural; berkas cahaya volumetrik; HUD label alur cahaya |
| c03 | Dua pelat, sumber Am-241, ion +/−, meteran arus, sirene | — | Procedural/2D; partikel alfa sebagai aksen kecil, bukan visual utama; HUD "≤ 1 mikrokuri" |
| c04 | Penggaris jangkauan alfa, lapisan foil + casing | — | 2D diagram berlapis; ikon gembok "jangan dibongkar"; tanpa instruksi membongkar |
| c05 | Split: api menyala cepat vs bara membara pelan, stopwatch | `kitchen-island-47f4c8` / prop, `kitchen-extraction-canopy-94df44` / prop, `candle-spike-cluster-d7c566` / prop | Sofa/bantal belum dicari (cari "sofa" saat produksi); api/asap procedural |
| c06 | Diorama deretan rumah, grafik batang −60%, grid 5 rumah | `townhouse-row-unit-b9544b` / building, `gabled-farmhouse-c7534f` / building | Infografis 2D di atas diorama; label "AS, 2018–2022" wajib |
| c07_payoff | Tangan menekan tombol tes, checklist perawatan, rumah malam tenang, outro | `townhouse-row-unit-b9544b` / building | Tangan siluet; checklist kinetik dengan ikon lucide; outro `audira-outro-card.svg` |

Saran engine: 2D — mekanisme inti (cahaya terhambur, arus ion, partikel alfa) paling jelas sebagai cutaway diagram (BONGKAR/INNERWORKS-2D look), dan katalog GLB tidak punya detektor asap maupun komponennya; 3D (INNERWORKS) hanya layak bila detektor dimodel khusus.
