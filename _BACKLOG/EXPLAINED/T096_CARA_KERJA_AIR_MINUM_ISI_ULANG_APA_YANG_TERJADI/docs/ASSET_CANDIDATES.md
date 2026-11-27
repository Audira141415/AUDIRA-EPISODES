# Asset Candidates — Cara Kerja Air Minum Isi Ulang: Apa yang Terjadi di Depot

> Dicari via `audira_search_assets` (2026-11-27). Katalog tidak memiliki galon air minum, mesin filter depot, atau pipa filtrasi khusus. Ada beberapa tangki, botol, dan keran yang bisa dipakai simbolis, tapi inti visual (proses filtrasi, diagram alur, cutaway filter, bar chart kepatuhan) lebih cocok 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Galon polos di bawah keran depot, air mengalir | `boiling-water-tap-e594db` / prop (keran simbolis), `water-carafe-6f1774` / prop | Galon tidak ada di katalog; buat 2D/prosedural. Keran bisa simbolis |
| c01_intro | Diagram alur depot: tangki → sedimen → karbon → UV/ozon → galon | `horizontal-tank-6e9b8b` / prop, `fuel-tank-3a0111` / prop (tangki simbolis) | Diagram alur = 2D lebih jelas. Filter dan lampu UV tidak ada GLB; ilustrasi 2D |
| c02 | Tiga depot berjejer: sederhana, standar, premium (RO) | `glazed-shopfront-screen-ecd5d3` / building (etalase depot simbolis) | Depot = bangunan sederhana, bisa pakai shopfront. Mesin RO = 2D cutaway |
| c03 | Stiker SLHS, bar chart 84.558 depot, 4,01% | — | Murni 2D: stiker, grafik batang, angka kinetik |
| c04 | Galon kusam, bakteri E. coli, siluet operator | `bottle-ca0f79` / ultra, `sample-container-c5dc43` / ultra | Galon kusam = efek shader; bakteri = ilustrasi 2D mikroskopik |
| c05 | Split screen: galon polos vs botol pabrik, checklist | `bottle-ca0f79` / ultra, `market-stall-94937d` / building | Checklist dan label = 2D overlay |
| c06 | Checklist konsumen: SLHS, kebersihan, uji lab | — | Murni 2D: ikon centang, teks kinetik |
| c07_payoff | Diagram alur lengkap menyala emas, outro AUDIRA | `horizontal-tank-6e9b8b` / prop | Diagram emas = 2D motion graphic; outro card `audira-outro-card.svg` |

Saran engine: **2D** — konten utama adalah diagram alur filtrasi, bar chart kepatuhan, checklist, dan cutaway filter yang semuanya lebih terbaca di 2D motion graphic. Katalog GLB tidak punya model depot, galon, atau mesin filter yang relevan. Style kandidat: BONGKAR (2D, cutaway/mekanisme), INNERWORKS (2D/3D, cara kerja), atau BEDAH (2D, pembedahan proses).
