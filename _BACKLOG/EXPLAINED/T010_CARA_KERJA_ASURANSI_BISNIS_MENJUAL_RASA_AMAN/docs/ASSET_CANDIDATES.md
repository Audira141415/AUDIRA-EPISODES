# Asset Candidates — Cara Kerja Asuransi: Bisnis Menjual Rasa Aman

> Dicari via `audira_search_assets` (2026-11-26). Katalog punya perahu, koin, brankas, peti kargo, gulungan, dan rumah. Tidak ada dokumen polis, kalkulator, grafik, atau peta Indonesia; itu dibuat 2D. Koin katalog bergaya fantasi: retexture netral, tanpa simbol mata uang asli. Tidak ada logo perusahaan asuransi, OJK, atau BPJS (rule 15).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Grid 1.000 figur siluet, koin jatuh ke wadah bersama, satu rumah retak | `silver-coin-64ab27` / prop, `gold-coin-stack-a9ef52` / prop, `porch-front-cottage-620c29` / building | Figur = siluet instanced tanpa wajah; label "ilustrasi" di chip 1.000:1 |
| c01_intro | Jeram sungai, muatan dibagi ke banyak perahu, satu terbalik; kontrak kuno Genoa | `wooden-rowboat-916981` / vehicle, `rowboat-c42d85` / vehicle, `cargo-crate-9afc44` / prop, `wooden-crate-e46521` / prop, `campaign-map-scroll-d4a382` / prop | Pedagang siluet tanpa wajah; HUD "Genoa, 1347" |
| c02 | Dua meja, koin premi ditukar dokumen polis generik | `righthand-item-410036` (Document Case) / ultra, `silver-coin-64ab27` / prop, `bistro-table-877a6d` / prop | Polis = kartu 2D tanpa logo; name plate "UU 40/2014" |
| c03 | Kerumunan membesar 10 → 1.000.000, grafik acak jadi stabil | — | Partikel titik DILARANG sebagai visual utama: pakai siluet figur instanced + grafik garis 2D |
| c04 | Dua menara data premi vs klaim 2024, aliran koin | `gold-coin-stack-a9ef52` / prop, `spilled-coin-pile-caccf6` / prop | Menara batang gaya DATAPHYSICAL; catatan kecil "termasuk BPJS"; name plate "OJK" teks saja |
| c05 | Dua roda mesin laba, brankas, rak SBN | `iron-vault-safe-8b8f29` / prop, `coin-pouch-be4dd8` / ultra | Roda gigi tidak ada di katalog: 2D/geometri berbentuk roda gigi; HUD "±42% di SBN (2025)" |
| c06 | Polis diperbesar dengan kaca pembesar "Pengecualian", peta Indonesia + meter 2,69% | — | Peta dan gauge 2D; "per 2024" wajib tampil |
| c07_payoff | Badai menghantam satu rumah, kerugian pecah jadi ribuan koin kecil, outro AUDIRA | `thatched-cottage-0e63f5` / building, `porch-front-cottage-620c29` / building, `silver-coin-64ab27` / prop | Outro card `audira-outro-card.svg` |

Saran engine: 2D — inti topik adalah konsep dan data (perjanjian, hukum bilangan besar, menara premi vs klaim, gauge penetrasi), dan objek kunci (polis, grafik, peta) tidak ada di katalog GLB. CERDIK/DATAPHYSICAL 2D lebih tajam; diorama 3D (TOYDIORAMA) hanya opsional untuk c01 perahu dan c07 rumah.
