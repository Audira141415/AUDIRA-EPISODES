# Asset Candidates — Cara Kerja Hitung Cepat Pemilu: Kenapa Sampel Kecil Bisa Akurat

> Dicari via `audira_search_assets` (2026-11-27). Katalog tidak punya kotak suara, bilik suara, atau panci sup; pencarian "ballot box" hanya memberi kotak umum. Topik ini sebagian besar diagram, rumus, dan peta titik, jadi lebih cocok 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Peta Indonesia generik penuh titik TPS, segelintir menyala | — | Peta 2D, titik procedural; HUD "820.161 TPS" + "contoh 2.000 = 0,24% · hitungan sendiri" |
| c01_intro | Mesin undian, bola bernomor, TPS generik, relawan tanpa wajah memotret papan hasil | `commuter-381e7f` / character (clip Point/Idle), `cardboard-delivery-box-59cc68` / prop (pengganti kotak suara, opsional) | Kotak suara dan papan hasil lebih aman digambar 2D (tanpa logo KPU); angka di papan diburamkan |
| c02 | Panci sup diaduk, sendok diangkat | `clay-storage-pot-626452` / prop (opsional) | Tidak ada panci masak di katalog; ilustrasi 2D lebih jelas |
| c03 | Papan tulis rumus, grafik galat menyusut | — | Tipografi kinetik + grafik batang 2D; label "hitungan sendiri" |
| c04 | Tiga panci beda ukuran, sendok sama | — | Ilustrasi 2D; HUD "n, bukan N" |
| c05 | Deretan rumah tetangga satu TPS, peta dibagi strata | `brownstone-row-house-1b84fd` / building, `brick-tenement-7d2014` / building | Warna pilihan netral (abu/biru/oranye), tanpa simbol partai; strata di peta 2D |
| c06 | Jam 13.00 → 15.00 WIB, stempel "BUKAN HASIL RESMI", dokumen UU generik | `laptop-e775ba` / prop, `small-server-rack-8ae0a4` / prop | Dokumen dan stempel 2D; tanpa logo lembaga |
| c07_payoff | Papan skor netral "Pilihan A 52% ± 1" (ILUSTRASI), garis rentang 51–53, kembali ke peta titik | `computer-bench-run-lit-87d9cf` / prop (ruang data, opsional) | Label ILUSTRASI besar dan tetap terlihat; outro `audira-outro-card.svg` |

Saran engine: 2D — isinya rumus, grafik galat, peta titik, dan analogi sup; katalog GLB tidak punya kotak suara, bilik, atau panci, dan 2D (DATAPHYSICAL/CERDIK) lebih tajam untuk angka dan label ILUSTRASI.
