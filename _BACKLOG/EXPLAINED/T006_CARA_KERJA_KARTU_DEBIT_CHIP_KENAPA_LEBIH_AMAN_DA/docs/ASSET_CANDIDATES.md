# Asset Candidates — Cara Kerja Kartu Debit Chip

Dicari via `audira_search_assets` (2026-11-26). Katalog tidak punya kartu pembayaran, chip, ATM, atau mesin EDC; objek utama perlu dibuat sebagai mesh/ilustrasi custom (kartu polos tanpa merek). Hindari aset kit `casino-*` (konotasi judi).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Makro kartu polos + chip emas, karakter kode menyala | — | Tidak ada di katalog; kartu ID-1 (85,60 × 53,98 mm) dibuat custom, tanpa logo |
| c01_intro | Sisi belakang kartu, pita magnetik dengan data statis | — | Custom; kalender bergulir bisa pakai `wall-clock-0c555c` (prop) sebagai penanda waktu |
| c02 | Konsep data disalin ke kartu kedua, mesin pembaca centang | — | Ilustrasi abstrak saja; jangan tampilkan alat skimming |
| c03 | Exploded view chip: kontak 8 pin, inti silikon "kota mini", ikon kunci | — | Custom (2D diagram atau mesh sederhana); ikon kunci dari lucide (`ICON_HUD`) |
| c04 | Mesin pembayaran generik, paket data mengalir ke chip, token kriptogram | — | Tidak ada mesin EDC/ATM di katalog ("atm" = 0 hasil); buat terminal generik custom |
| c05 | Jalur jaringan ke bank, server memeriksa, stempel cocok/ditolak | `small-server-rack-8ae0a4` (prop); `computer-bench-run-lit-87d9cf` (prop) | Gedung bank generik tidak ada di katalog ("bank" hanya memberi locker/bench); pakai ruang server sebagai representasi bank penerbit |
| c06 | Peta Indonesia + timeline 2015 → 2021, bar progres 30/50/80/100% | — | Peta 2D vektor + infografis; tanpa logo BI (rule 15), pakai teks "Bank Indonesia" saja |
| c07_payoff | Kode berganti, kartu tiruan memudar, ikon belanja online + PIN, outro card | — | Ikon lucide; outro `audira-outro-card.svg` |

Saran engine: 2D — objek utama (kartu, chip, terminal, peta, timeline) tidak ada di katalog GLB dan topiknya diagram/proses data, cocok untuk explainer 2D berlapis (BONGKAR/infografis); opsi hybrid bila ingin chip 3D custom di c03.
