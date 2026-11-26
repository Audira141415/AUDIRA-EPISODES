# Asset Candidates — Cara Kerja Pengering Tangan di Toilet Umum

> Dicari via `audira_search_assets` (2026-11-26). Katalog punya toilet, wastafel, dispenser sanitizer, tempat sampah kertas, dan blok toilet. Tidak ada GLB pengering tangan, dispenser tisu, kipas/motor, atau tangan close-up: itu dibuat procedural/2D (cutaway generik, tanpa merek).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Tangan basah close-up, celah pengering, tirai udara menyapu air | — | Tangan stilasi tanpa identitas; simulasi air/udara procedural (gaya FLUIDFORGE). Unit pengering generik dibuat sendiri, tanpa logo |
| c01_intro | Interior toilet umum, dua unit pengering di dinding | `classroom-sink-unit-26fe09` / prop, `scrub-sink-station-3cefec` / prop, `toilet-2edbd9` / prop, `toilet-block-da51a4` / building | Pengering hangat & jet: model procedural sederhana (rounded box + celah), bukan kubus polos; label "Tipe A/B" |
| c02 | Cutaway pengering hangat: kipas, pemanas, uap | — | Cutaway 2D/procedural lebih jelas; HUD timer 40 dtk |
| c03 | Cutaway pengering jet: motor, celah sempit, lembaran udara, air tersapu | — | Simulasi fluida/partikel air sebagai FG, bukan visual utama; HUD speedometer >150 m/dtk ≈ 540 km/jam |
| c04 | Lomba 3 lajur: tisu, jet, hangat; bar kering % | `wastepaper-bin-8f76b5` / prop | Bar chart 2D; siluet orang tanpa wajah pergi dengan tangan menetes |
| c05 | Timbangan dua sisi pendanaan, mikroba ilustratif | `hand-sanitiser-dispenser-a48460` / prop (latar) | Infografis 2D netral; tanpa nama/logo European Tissue Symposium atau produsen |
| c06 | Telapak basah vs kering menyentuh gagang pintu, kuman pindah | — | Ilustrasi mikro 2D; kartu kutipan CDC tanpa logo |
| c07_payoff | Wastafel, sabun, timer 20 dtk, tangan kering, outro | `classroom-sink-unit-26fe09` / prop, `kitchen-sink-7ea438` / prop | Outro card `audira-outro-card.svg` |

Saran engine: hybrid — interior toilet dan wastafel tersedia sebagai GLB, tetapi inti cerita (cutaway mesin, aliran udara, air tersapu, grafik waktu dan debat studi) tidak ada di katalog dan lebih tajam di 2D/procedural; bila harus satu engine, 2D (BONGKAR) lebih aman, FLUIDFORGE 3D hanya bila simulasi air bisa dibuat meyakinkan.
