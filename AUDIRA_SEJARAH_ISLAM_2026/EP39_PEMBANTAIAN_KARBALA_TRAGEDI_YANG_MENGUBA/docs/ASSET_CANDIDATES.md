# Asset Candidates — Pembantaian Karbala: Tragedi yang Mengubah Sejarah Islam Selamanya

> Dicari via `audira_search_assets` (2026-11-25). Katalog Polyfork minim aset Timur Tengah abad ke-7: tidak ada unta, kuda, masjid, atau tenda Arab. Tokoh wajib siluet tanpa wajah (aturan QISSAH).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | padang pasir senja, dua kelompok siluet berhadapan, HUD ±72 vs ±4.000 | `desert-floor-tile-cf69a2` (prop) | siluet 2D tanpa wajah lebih aman daripada karakter GLB |
| c01_intro | peta Irak, pin Karbala di tepi Eufrat, kafilah siluet | `campaign-map-scroll-d4a382` (prop) | peta 2D (HISTORYMAP) lebih akurat; HUD tanggal |
| c02 | istana Damaskus, stempel kekhalifahan berpindah, rute Madinah → Makkah | belum ada aset istana Arab | ilustrasi 2D arsitektur Umayyah tanpa tokoh |
| c03 | gulungan surat terbang Kufah → Makkah, utusan berkuda (siluet) | `spell-scroll-29d32d` (prop), `scroll-rack-f465dd` (prop) | kuda tidak tersedia; siluet 2D |
| c04 | kemah di dataran tandus, barisan berkuda menutup sungai, kantong air kosong | `soldiers-tent-4bd5b9` (building), `canvas-wall-tent-de8a04` (prop), `river-reed-cluster-cba87e` (prop), `palm-tree-a307da` (prop) | tenda Three Kingdoms perlu retexture kain gurun |
| c05 | fajar merah, debu, panji berkibar, tanpa kekerasan grafis | `soldiers-tent-4bd5b9` (building), `desert-floor-tile-cf69a2` (prop) | hanya panji dan debu; tidak ada jenazah/darah |
| c06 | kitab terbuka + kaligrafi, kartu "HR. Bukhari 3753", dua jalur cahaya bertemu | `scroll-rack-f465dd` (prop) | kaligrafi dan kartu sumber 2D |
| c07_payoff | kamera naik ke langit senja, garis waktu 680 → Fitnah Kedua → Asyura, outro AUDIRA | `palm-tree-a307da` (prop) | outro card brand standar |

Saran engine: 2D — tokoh suci wajib siluet tanpa wajah, katalog GLB tidak punya aset Arab abad ke-7 (unta, kuda, tenda, masjid), dan peta + kaligrafi lebih kuat dalam ISLAMICDOCUMENTARY/HISTORYMAP 2D.
