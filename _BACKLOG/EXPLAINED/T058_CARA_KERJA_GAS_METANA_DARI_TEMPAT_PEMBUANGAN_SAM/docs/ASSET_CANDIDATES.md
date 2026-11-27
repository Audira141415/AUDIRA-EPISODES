# Asset Candidates — Cara Kerja Gas Metana dari Tempat Pembuangan Sampah

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya truk sampah, tempat sampah, pipa, generator, dan tabung gas. Tidak ada gunungan sampah/TPA, sumur gas, flare, atau bakteri: itu dibuat procedural/2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Gunungan sampah malam, gelembung CH₄ naik | — | Tidak ada GLB gunungan sampah; timbunan procedural (heightfield + tekstur) atau ilustrasi 2D |
| c01_intro | Truk sampah menuang, penampang timbunan berlapis | `garbage-truck-a7ffbf` / vehicle, `street-bin-770173` / prop | Truk tanpa logo/merek; penampang 2D |
| c02 | Indikator O₂ turun, 4 stasiun tahap penguraian | — | Diagram 2D (molekul, bakteri kartun); garis waktu "< 1 tahun" |
| c03 | Donat 50/50 CH₄/CO₂, meteran 5–15% | — | Infografis 2D; tanpa demonstrasi api |
| c04 | Peta panas penampang timbunan, segitiga api | — | Thermal shader 2D/3D; ikon lucide `Flame`, `Thermometer`, `Wind` |
| c05 | Peta Jawa Barat generik, kalender, lereng runtuh, lilin | — | Siluet lereng tanpa manusia; tanpa visual korban; kartu HPSN teks saja |
| c06 | Sumur gas, pipa, blower, flare, generator, kompor | `surface-pipe-run-62c4b3` / prop, `pipe-junction-5b146a` / prop, `site-generator-298792` / prop, `medical-gas-cylinder-a2d6a7` / prop (hanya sebagai tabung generik) | Flare dan sumur gas procedural; tanpa logo lembaga |
| c07_payoff | Timbunan tertutup berpipa, rumah menyala, 3 tempat sampah terpilah | `kitchen-bin-ac6752` / prop, `street-bin-770173` / prop | Outro card `audira-outro-card.svg` |

Saran engine: 2D — inti cerita adalah proses tak kasatmata (bakteri, gas, kadar, panas) yang lebih terbaca sebagai diagram berlapis (CHAINREACTION), dan katalog tidak punya gunungan sampah, sumur gas, maupun flare; 3D hanya layak sebagai hybrid untuk c01 dan c06 (truk, pipa, generator).
