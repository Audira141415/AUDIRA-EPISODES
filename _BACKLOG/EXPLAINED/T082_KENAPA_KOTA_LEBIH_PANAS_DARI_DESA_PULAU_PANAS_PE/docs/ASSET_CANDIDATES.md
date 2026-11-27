# Asset Candidates — Kenapa Kota Lebih Panas dari Desa: Pulau Panas Perkotaan

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya gedung kota, kendaraan, jalan aspal, dan karakter. Tidak ada pohon tropis rindang, unit AC outdoor, atau citra satelit termal: itu dibuat 2D/procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Split kota vs desa, termometer animasi | `brick-tenement-7d2014` / building, `office-tower-1538cc` / building, `asphalt-road-tile-f6593c` / prop, `pine-tree-3ea075` / ultra | Sisi desa = hijau procedural + pohon; sisi kota = gedung + aspal. Termometer 2D overlay |
| c01_intro | Kota dari atas, zona merah, 4 ikon penyebab | `art-deco-setback-tower-b3a788` / building, `compact-hatchback-386417` / vehicle | Peta termal palsu = 2D overlay. Ikon penyebab = lucide-react (Trees, Sun, Building2, Car) |
| c02 | Pohon menyusut diganti aspal, diagram sinar matahari, ikon "2.000×" | `pine-tree-3ea075` / ultra, `asphalt-road-tile-f6593c` / prop, `alley-concrete-tile-56117b` / prop | Diagram panah sinar = 2D. Animasi pohon menghilang = scale-down procedural |
| c03 | Canyon gedung tinggi, panah panas memantul, AC + kendaraan | `office-tower-1538cc` / building, `monolith-office-tower-422420` / building, `corner-tenement-92fb62` / building, `compact-hatchback-386417` / vehicle, `city-bus-49fd97` / vehicle | Canyon = dua baris gedung tinggi berhadapan. Panah panas = 2D animated. AC unit tidak ada GLB: pakai box sederhana |
| c04 | Split "suhu udara" vs "suhu permukaan", diagram batang | — | Murni 2D infografis: termometer, citra termal palsu, angka +37 °C. Tidak butuh GLB |
| c05 | Peta Jawa generik, Jakarta menyala merah | — | Peta 2D (batas generik, tanpa logo). Counter SUHII ~6 °C = HUD animasi |
| c06 | Atap gelap → putih, pohon tumbuh, diagram RTH 30% | `brownstone-row-house-1b84fd` / building (atap bisa di-recolor), `pine-tree-3ea075` / ultra, `staked-street-sapling-51ffb4` / prop | Efek cat putih = material swap di runtime. Diagram RTH = 2D |
| c07_payoff | Kota masa depan (atap putih, pohon rindang), outro AUDIRA | `brownstone-row-house-1b84fd` / building, `pine-tree-3ea075` / ultra, `commuter-381e7f` / character | Outro card `audira-outro-card.svg` |

Saran engine: **2D** (SATELLITEBRIEFING atau DATAPHYSICAL) — topik ini sangat data-driven (selisih suhu, grafik, citra termal, peta), dan 4 dari 8 chapter murni infografis 2D. Aset 3D kota tersedia (kit NYC City) tetapi kontribusinya terbatas karena visual utama adalah diagram, peta termal, dan angka HUD. Bila hybrid, 3D hanya di c00/c03 (canyon) dan c06–c07 (transformasi kota).
