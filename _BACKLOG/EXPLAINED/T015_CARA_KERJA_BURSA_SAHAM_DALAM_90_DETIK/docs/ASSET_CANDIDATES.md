# Asset Candidates — Cara Kerja Bursa Saham dalam 90 Detik

> Dicari via `audira_search_assets` (2026-11-26). Katalog punya menara kantor, monitor, brankas, dan koin. Tidak ada ponsel ber-UI trading, order book, atau gedung bursa generik: itu dibuat 2D. Semua label generik, tanpa logo BEI/KSEI/KPEI/OJK/sekuritas (rule 15).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Tombol BELI di ponsel, gedung pecah jadi keping, keping ke tangan siluet | `monolith-office-tower-422420` / building | Ponsel + UI 2D tanpa logo aplikasi; siluet tanpa wajah |
| c01_intro | Perusahaan butuh modal, penawaran umum, papan "TERCATAT" | `monolith-office-tower-422420` / building, `gold-coin-29afc1` / prop | Counter "963 · per 13 Nov 2026" |
| c02 | Investor → perusahaan efek → bursa; balok 1 lot = 100 lembar | `office-desk-021eb3` / prop, `desk-monitor-32cfce` / prop | Gedung "PERUSAHAAN EFEK" tanpa nama; chip "Izin OJK" teks saja |
| c03 | Order book beli/jual, kartu bertemu, timbangan permintaan-penawaran | `computer-bench-run-lit-87d9cf` / prop | Order book 2D, kode & harga fiktif berlabel ilustrasi |
| c04 | Konveyor uang ↔ saham, stasiun kliring, brankas kustodian, kalender T+2 | `iron-vault-safe-8b8f29` / prop, `spilled-coin-pile-caccf6` / prop, `silver-coin-64ab27` / prop | Label "KLIRING & PENJAMINAN" dan "KUSTODIAN SENTRAL" generik |
| c05 | Peta Indonesia generik dengan titik investor, bar chart | — | 2D; HUD "10,37 juta · per akhir Okt 2026" + "33,5 juta SID" |
| c06 | Koin dividen menetes, grafik fiktif naik-turun | `gold-coin-29afc1` / prop, `coin-pouch-be4dd8` / ultra | Grafik 2D tanpa nama saham; disclaimer "Bukan rekomendasi investasi" |
| c07_payoff | Diorama rantai lengkap menyala berurutan, outro | `monolith-office-tower-422420` / building, `iron-vault-safe-8b8f29` / prop, `desk-monitor-32cfce` / prop | Outro card `audira-outro-card.svg` |

Saran engine: 2D — topik berupa alur proses dan data (order book, kliring, angka investor) yang paling terbaca sebagai infografis/terminal 2D (TRADINGTERMINAL atau DATAPHYSICAL); aset 3D yang tersedia hanya pendukung (brankas, koin, menara kantor) dan bisa dipakai sebagai render still bila perlu.
