# Asset Candidates — Cara Kerja Panci Presto: Memasak Daging Keras Jadi Empuk

> Dicari via `audira_search_assets` (2026-11-26; kata kunci: topik presto, pot, meat, stove, kitchen, cooking, valve gauge). Katalog **tidak punya** panci presto, panci masak biasa, atau potongan daging mentah. Yang ada hanya properti dapur pendukung, kompor kemah, dan panel gauge industri.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Presto generik dibelah (cutaway), termometer naik ke ±120 | — | Tidak ada GLB presto; ilustrasi 2D cutaway. Tanpa merek. HUD "±120 °C, bukan 100 °C" |
| c01_intro | Panci terbuka di kompor, daging berurat, uap kabur | `two-burner-camp-stove-3e83f5` / prop, `kitchen-island-47f4c8` / prop, `kitchen-extraction-canopy-94df44` / prop | Kompor kemah kurang cocok untuk dapur rumah; lebih aman 2D. HUD "mentok 100 °C" |
| c02 | Close-up tutup + karet seal, panah uap, jarum gauge naik | `gauge-and-valve-panel-f2164c` / prop (simbolis) | Gauge panci digambar 2D; HUD "±1 bar / 15 psi" |
| c03 | Kurva tekanan–titik didih | — | Grafik 2D (papan tulis/diagram), HUD "NIST ±121 °C", "USDA 116–121 °C" |
| c04 | Serat daging + tali kolagen mengerut lalu meleleh jadi gelatin | `charred-meat-haunch-be1ea2` / prop (hanya establishing, bentuknya daging panggang) | Mikro-anatomi 2D lebih jelas; HUD "±60 °C", "kolagen → gelatin" |
| c05 | Dua jam pasir: rebus biasa vs presto | — | Ikon 2D/lucide; HUD "½–¼ waktu" |
| c06 | Checklist keselamatan: batas isi 2/3, seal, katup pengaman, tangan tanpa wajah, jarum turun ke nol | — | Ikon checklist 2D; jangan tampilkan semburan uap dramatis yang bisa ditiru |
| c07_payoff | Daging empuk tersuir, presto utuh, 3 ikon rantai sebab | `kitchen-island-47f4c8` / prop, `open-kitchen-shelf-f751de` / prop | Outro card `audira-outro-card.svg` |

Saran engine: 2D — objek utama (presto, gasket, katup, serat kolagen) tidak ada sebagai GLB, dan inti cerita adalah cutaway + diagram tekanan–suhu + mikro-anatomi daging, yang paling tajam sebagai ilustrasi 2D berlapis (CERDIK/BONGKAR); INNERWORKS 3D baru layak bila model presto dibuat khusus.
