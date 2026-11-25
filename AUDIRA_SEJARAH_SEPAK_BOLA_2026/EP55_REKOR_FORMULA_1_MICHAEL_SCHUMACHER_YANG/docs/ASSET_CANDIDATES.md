# Kandidat Aset — Rekor Formula 1 Michael Schumacher yang Baru Disamai 15 Tahun Kemudian

> DRAF pra-produksi (backlog, 2026-11-25). Dicari lewat `audira_search_assets` (katalog Polyfork). Katalog TIDAK punya mobil F1 open-wheel; mobil di `racing-cars-kit` adalah mobil jalanan klasik. Tanpa wajah asli pembalap dan tanpa logo tim/sponsor (livery generik).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Counter 7 + 91, bendera finis, mobil F1 melintas | `checkered-flag-81784a` / prop | Mobil F1: ilustrasi 2D siluet atau model low-poly custom (tidak ada di katalog) |
| c01_intro | Peta Eropa, grid Spa, mobil hijau lalu biru-hijau | `road-tile-286319` / prop, `lane-marking-decal-d1a212` / prop | Peta 2D vektor; livery generik tanpa logo Jordan/Benetton |
| c02 | Rak trofi 1994–1995, diagram tabrakan top-down | `trophy-cabinet-e963ac` / prop, `natural-20-trophy-plinth-c31c9c` / prop | Diagram sirkuit 2D; tabrakan cukup dua titik bersenggolan |
| c03 | Garasi merah, timeline 1979–2000, 5 trofi beruntun | `trophy-cabinet-e963ac` / prop, `guardrail-d3bd42` / prop | Garasi: belum ada aset pit garage; bisa dibangun dari panel + lampu |
| c04 | Grid 18 kotak (13 menyala), sirkuit Spa di hutan, bendera finis | `checkered-flag-81784a` / prop, `road-tile-286319` / prop, `guardrail-d3bd42` / prop | Grid 18 kotak = data physical (bar/blok), bukan aset |
| c05 | Shanghai malam, finis, tiga kolom 91 / 68 / 155 | `checkered-flag-81784a` / prop, `two-lane-street-tile-fe56b6` / prop | Kolom data = geometri data physical berlabel |
| c06 | Nürburgring, bar race 91 vs 91 lalu 92, helm berpindah tangan | `flight-helmet-56f390` / ultra | Helm ini helm pilot, bukan helm balap; lebih aman ilustrasi 2D helm merah tanpa logo; tangan siluet |
| c07_payoff | Istanbul basah, dua rak 7 trofi, garis 16 tahun, outro AUDIRA | `trophy-cabinet-e963ac` / prop, `natural-20-trophy-plinth-c31c9c` / prop | Outro card `audira-outro-card.svg`; brand AUDIRA di papan skor HUD |

Saran engine: 2D — topik ini rangkaian angka, tanggal, dan perbandingan (counter, timeline, bar race), cocok DATAPHYSICAL/CINESTORY 2D; katalog GLB tidak punya mobil F1 sehingga 3D akan terlihat generik.
