# Asset Candidates — Cara Kerja Kaleng Makanan: Makanan Awet Tanpa Pengawet

> Dicari via `audira_search_assets` (2026-11-26; query: topic pengalengan, "can tin jar", "conveyor", "sailing ship", "bottle", "boiler tank", "pantry shelf"). Katalog tidak punya kaleng makanan, retort, lini pengalengan, atau toples kaca bergabus. Yang tersedia hanya pendukung (botol, rak dapur, tangki, konveyor bandara). Subjek utama (kaleng, cutaway segel, spora, skala pH) harus dibuat 2D/procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Kaleng polos tanpa merek, tutup terkunci, kaleng memanas | — | Tidak ada GLB kaleng; ilustrasi 2D atau silinder procedural ber-material logam (bukan visual utama kosong). HUD "DITUTUP DULU → BARU DIPANASKAN" |
| c01_intro | Dapur abad ke-19, siluet juru masak, botol kaca bergabus, panci mendidih, kaleng timah + stempel paten | `wine-bottle-75a822` / prop, `bottle-ca0f79` / ultra, `open-kitchen-shelf-f751de` / prop | Siluet tanpa wajah (rule 15). HUD "1810" ×2 |
| c02 | Interior kaleng gelap, bakteri batang + spora, air mendidih | — | Mikroskopis: 2D ilustratif. HUD "TANPA OKSIGEN" |
| c03 | Lini pabrik generik: pengisian, double seam cutaway, tabung retort bertekanan, termometer | `regolith-conveyor-b8a9fa` / prop, `horizontal-tank-6e9b8b` / prop | Konveyor/tangki hanya pengganti kasar; cutaway sambungan kaleng wajib 2D. HUD "121 °C" |
| c04 | Diagram log reduksi spora 12 langkah, counter 1 : 10^12 | — | Infografis 2D. HUD "12D" |
| c05 | Skala pH dengan garis 4,6, kaleng sayur/daging vs buah/acar | `reagent-bottle-shelf-8fd723` / prop | Opsional untuk nuansa lab; skala pH 2D |
| c06 | Cutaway kaleng tersegel sebagai perisai, label kecil garam/gula/asam | — | 2D. HUD "STERIL KOMERSIAL" |
| c07_payoff | Rak dapur, kaleng menggembung & penyok berkarat bertanda silang, garis waktu 1810 → 2026, outro | `open-kitchen-shelf-f751de` / prop, `back-bar-shelf-unit-11ab89` / prop | Kaleng rusak 2D. Outro card `audira-outro-card.svg` |

Saran engine: 2D — subjek utama (kaleng, sambungan, spora, skala pH, diagram 12D) tidak ada di katalog GLB dan paling jelas sebagai cutaway/infografis; BONGKAR (2D) paling cocok untuk "membongkar" isi kaleng, CHRONICLE untuk segmen sejarah 1810.
