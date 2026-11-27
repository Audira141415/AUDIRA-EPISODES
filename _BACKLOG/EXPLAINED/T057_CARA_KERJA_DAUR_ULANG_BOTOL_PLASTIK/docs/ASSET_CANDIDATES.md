# Asset Candidates — Cara Kerja Daur Ulang Botol Plastik

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya botol generik, tutup botol, tempat sampah daur ulang, truk sampah, dan karakter ber-rig. Tidak ada mesin pencacah, tangki apung, ekstruder, mesin pintal, pelet, atau kaus: semua itu dibuat 2D/procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Botol bening jatuh ke tempat sampah, split dua jalur (botol vs kaus) | `bottle-ca0f79` / ultra, `street-bin-770173` / prop | Botol tanpa label merek; kaus polos ilustrasi 2D |
| c01_intro | Close-up dasar botol, segitiga kode 1 | `bottle-ca0f79` / ultra | Segitiga "1 PET" sebagai decal/HUD 2D; callout "bukan jaminan didaur ulang" |
| c02 | Pengumpulan, ban berjalan, pemilahan, pencacah, tangki apung/tenggelam | `garbage-truck-a7ffbf` / vehicle, `three-stream-recycling-station-14da24` / prop, `bottle-cap-cd96db` / prop, `water-bottle-crate-78c8db` / prop | Ban berjalan, pencacah, dan tangki air dibuat cutaway 2D; serpihan PET tenggelam, tutup mengapung |
| c03 | Cuci panas, busa, pengering | — | Belum ada GLB mesin cuci industri; ilustrasi 2D drum berputar |
| c04 | Ekstruder cutaway, lelehan, pelet | — | Cutaway 2D lebih jelas; HUD termometer ±256–260 °C |
| c05 | Persimpangan: mesin pintal → benang → kaus; tungku SSP → rantai molekul → botol | `bottle-ca0f79` / ultra | Rantai molekul ilustrasi manik 2D; HUD "SSP 190–210 °C" |
| c06 | Loop botol vs garis lurus kaus, counter 1%, peta Indonesia + chip 71% (klaim studi industri), papan teks aturan BPOM | `recycling-capsule-bin-348f5b` / prop | Tanpa logo BPOM/asosiasi/perusahaan; label sumber wajib di chip 71% |
| c07_payoff | Peta perjalanan utuh, tangan tanpa wajah buang botol kosong ke tempat sampah terpilah, outro | `three-stream-recycling-station-14da24` / prop, `garbage-truck-a7ffbf` / vehicle, `bottle-ca0f79` / ultra | Outro card `audira-outro-card.svg` |

Saran engine: 2D — inti cerita ada di dalam mesin (pencacah, tangki apung, ekstruder, SSP, rantai molekul) yang tidak tersedia sebagai GLB dan lebih terbaca sebagai cutaway/diagram; CHAINREACTION atau BONGKAR cocok. Hybrid mungkin bila botol dan tempat sampah 3D dipakai di hook dan payoff.
