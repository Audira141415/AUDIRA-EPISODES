# Asset Candidates — Masa Depan Internet: Starlink vs Jaringan Terestrial

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Satelit di orbit, Bumi | `comm-satellite-fdc2cd` / prop (Comm Satellite), `small-asteroid-7fc86a` / prop (debris orbit) | Bumi dan orbit bisa prosedural (sphere + shader); satelit perlu di-clone puluhan |
| c01_intro | Antena Starlink, peta dunia, angka | `rooftop-antenna-mast-6e4944` / prop (Rooftop Antenna Mast), `antenna-mast-0954b0` / prop (Antenna Mast) | Peta dunia dan HUD callout prosedural (SVG / Canvas) |
| c02 | Kabel bawah laut, dasar samudra, kapal | `one-person-submarine-0b9d14` / vehicle, `coral-rubble-seabed-tile-772a1f` / prop, `reef-rock-pavement-tile-879f47` / prop, `cargo-freighter-d89fdc` / vehicle (kapal kabel) | Kabel fiber = geometry prosedural (tube/curve). Seabed dari kit coral-reef |
| c03 | Fiber optik close-up, sinyal satelit | `comm-satellite-fdc2cd` / prop | Sinar di dalam fiber = shader/emissive tube prosedural; split screen perlu 2D overlay |
| c04 | Peta gelap, desa terpencil, siluet orang | `cube-house-module-a9b8e8` / building (rumah desa), `cave-house-front-ed6b36` / building | Peta gelap/menyala = prosedural. Character siluet dari AssetCharacter (Idle) |
| c05 | Antena kecil di atap, sinyal, laptop | `rooftop-antenna-mast-6e4944` / prop, `desk-monitor-32cfce` / prop, `computer-bench-run-lit-87d9cf` / prop | Sinyal naik-turun = partikel/line prosedural |
| c06 | Globe Bumi, kabel + orbit bersamaan | `comm-satellite-fdc2cd` / prop | Globe + kabel + orbit ring = prosedural scene |
| c07_payoff | Bumi megah, zoom out, outro card | — | Outro card dari `shared/assets/brand/audira-outro-card.svg` |

## Catatan

- Katalog GLB tidak memiliki model satelit Starlink spesifik, antena parabola kecil, atau kabel fiber optik. `comm-satellite-fdc2cd` (dari kit spaceship-wars) adalah proxy terdekat.
- Sebagian besar visual topik ini bersifat konseptual (peta data, orbit, kabel bersinar, angka HUD) yang lebih cocok dirender prosedural atau 2D.
- Tidak ada model globe/Bumi di katalog. Perlu dibuat prosedural (sphere + texture).

Saran engine: **2D** — alasan: topik didominasi data/infografis, peta, angka HUD, dan perbandingan visual. Aset 3D fisik terbatas (hanya satelit dan antena generik). BROADCASTFORGE atau DATAPHYSICAL lebih cocok untuk menyajikan data padat secara visual. 3D hanya bernilai tambah di scene dasar laut (c02) yang bisa di-hybrid.
