# Asset Candidates — Negara yang Tidak Punya Sungai Sama Sekali

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00 hook | Peta Arab Saudi, ikon minyak, tanah retak | `desert-floor-tile-cf69a2` (prop), `sandstone-outcrop-75800b` (prop) | Peta dan ikon minyak perlu dibuat sebagai 2D overlay/HUD |
| c01 intro | Globe 3D, titik-titik negara | — | Globe prosedural (R3F sphere + titik), bukan GLB |
| c02 raksasa | Peta Semenanjung Arab, wadi kering, lanskap gurun | `desert-floor-tile-cf69a2` (prop), `dry-soft-sand-tile-4a1df7` (prop), `camel-base` (animal), `sandstone-outcrop-75800b` (prop), `marram-dune-tile-56cdf8` (prop) | Katalog tidak punya model arsitektur Arab/Timur Tengah (masjid, menara, kota modern) |
| c03 yang kecil | Vatikan mini, Sungai Tiber, gelembung air bawah laut | `domed-church-dcbe85` (building), `water-blob-e2cdf2` (prop), `anakena-beach-tile-e07759` (prop) | Domed church bisa representasi Vatikan; gelembung air tawar dari water-blob |
| c04 desalinasi | Pabrik desalinasi, pipa besar, air laut → air bersih | `brass-water-tower-b0c6d9` (building), `water-tower-7eb7ec` (building), `horizontal-tank-6e9b8b` (prop), `fuel-tank-3a0111` (prop), `plaza-water-basin-8c8185` (prop) | Tidak ada model pabrik desalinasi; gunakan kombinasi water tower + tank sebagai representasi |
| c05 harga mahal | Pipa melintasi gurun, kilang minyak, grafik air tanah | `horizontal-tank-6e9b8b` (prop), `fuel-tank-3a0111` (prop), `desert-floor-tile-cf69a2` (prop) | Grafik batang air tanah sebagai 2D HUD overlay |
| c06 kenapa | Diagram hujan→sungai, Kuwait Towers 1951 | `water-blob-f266b8` (prop), `rooftop-water-tower-b38362` (prop) | Kuwait Towers tidak ada di katalog; bisa pakai water tower sebagai representasi |
| c07 payoff | Globe + 17 titik, logo AUDIRA | — | Globe prosedural, outro card SVG |

Saran engine: **2D** — HISTORYMAP atau DATAPHYSICAL. Alasan: topik ini sangat bergantung pada peta dunia, peta regional, callout data/angka, dan infografis. Katalog GLB tidak punya model arsitektur Timur Tengah, pabrik desalinasi, atau lanskap gurun yang memadai. Engine 2D (ilustrasi berlayer, peta bergerak, tipografi kinetik, diagram data) jauh lebih cocok dan menghasilkan visual yang lebih informatif daripada 3D dengan aset terbatas.
