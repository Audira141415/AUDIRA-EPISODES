# Asset Candidates — Cara Kerja Gorong-gorong dan Saluran Kota

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya kit kota (bangunan, jalan, kendaraan, karakter), inlet drainase tepi jalan, tutup manhole, pipa beton, gorong-gorong jalan/tanggul, dan rumah pompa. Tidak ada saluran terbuka beton, pintu air, atau jaringan drainase bawah tanah: itu dibuat procedural/2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Jalan kota hujan malam, tetes air masuk lubang tepi jalan | `kerb-storm-drain-inlet-c721db` / prop, `curb-strip-28e992` / prop, `brick-tenement-7d2014` / building, `compact-hatchback-386417` / vehicle | Hujan + genangan procedural; tanpa papan nama/merek nyata |
| c01_intro | Cutaway jalan: pipa beton bulat dan kotak beton di bawah aspal | `concrete-full-pipe-section-00e1b6` / prop, `highway-culvert-71f3bf` / prop, `embankment-culvert-16df7f` / prop, `manhole-cover-137569` / prop | Kotak beton (box culvert) bisa procedural; HUD "Permen PU 12/PRT/M/2014" |
| c02 | Peta kota dari atas, hierarki tersier → sekunder → primer → laut | `corner-shop-5aec8c` / building, `brownstone-row-house-1b84fd` / building, `pipe-run-280a0d` / prop, `pipe-junction-5b146a` / prop | Garis saluran menyala lebih jelas sebagai overlay 2D di atas diorama kota |
| c03 | Grafik hujan 10 tahun, penampang saluran membesar | — | Diagram 2D; HUD "≥ 10 tahun", "> 500 ha: 10–25 tahun" |
| c04 | Kalender + dadu peluang 1/5 | — | Infografis 2D; label "hitungan sendiri" |
| c05 | Penampang saluran meluap, gelas ukur hujan | `standing-water-pool-daafcb` / prop, `city-bus-49fd97` / vehicle | Kota generik, tanpa landmark Jakarta/logo; HUD "per 2025" |
| c06 | Sungai meluap, rob di muara, mulut gorong-gorong tersumbat sampah | `embankment-culvert-16df7f` / prop, `construction-dumpster-2de7ae` / prop, `water-pump-house-121270` / building | Sampah plastik/ranting procedural; tanpa merek di kemasan |
| c07_payoff | Jalan kering setelah hujan, zoom out kota dengan jaringan saluran menyala, outro AUDIRA | `commuter-381e7f` / character (clip Walk), `bus-shelter-f786b4` / prop, `art-deco-setback-tower-b3a788` / building | Karakter generik tanpa wajah nyata; outro card `audira-outro-card.svg` |

Saran engine: 3D (hybrid ringan) — diorama kota dengan cutaway bawah tanah (URBANFORGE/BUILDFORGE) paling kuat untuk "aliran di bawah kakimu" dan aset kota/pipa/culvert tersedia; grafik kala ulang dan kapasitas mm/hari tetap sebagai overlay HUD 2D.
