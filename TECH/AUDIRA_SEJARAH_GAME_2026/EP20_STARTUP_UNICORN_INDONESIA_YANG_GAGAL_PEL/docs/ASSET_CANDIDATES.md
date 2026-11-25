# Asset Candidates — Startup Unicorn Indonesia yang Gagal: Pelajaran dari Ruangguru

Dicari 2026-11-25 lewat `audira_search_assets`. Semua nama perusahaan tampil sebagai teks; tanpa logo dan wajah asli.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Menara koin di meja kantor, kursi kosong, stempel PHK | `gold-coin-stack-a9ef52` (prop), `office-desk-021eb3` (prop), `bench-desk-module-23c16f` (prop) | HUD "> US$200 JUTA" + stempel merah 2D |
| c01_intro | Ruang kerja kecil 2014, dua siluet pendiri | `faculty-office-desk-a6575a` (prop), `seated-office-worker-854671` (character, Idle) | Siluet tanpa wajah, name plate teks |
| c02 | Uang masuk, lalu anak belajar dari rumah via ponsel | `gold-coin-29afc1` (prop), `coin-pouch-be4dd8` (ultra), `classroom-globe-16a96e` (prop) | Kamar anak + grafik permintaan naik (2D overlay) |
| c03 | Kantor open-plan penuh, counter 22 juta siswa | `bench-desk-module-23c16f` (prop), `sit-stand-desk-3ff7b8` (prop), `standing-worker-on-a-8a0f9a` (character, Walk) | Meja bertambah = rekrutmen; callout US$55 juta |
| c04 | Kalender 18 Nov 2022, kotak kardus, kursi kosong; gedung GoTo | `cardboard-delivery-box-59cc68` (prop), `office-desk-021eb3` (prop) | Gedung kedua cukup massing generik + label teks "GoTo" |
| c05 | Kurva rekrutmen terlalu curam lalu patah, globe ekonomi | `classroom-globe-16a96e` (prop) | Kurva + kutipan = infografis 2D |
| c06 | Timbangan US$1 miliar, gedung Zenius padam | `ingot-stack-73e1e8` (prop), `school-wall-module-a09ccd` (building), `school-door-set-2523aa` (building) | Lampu padam + kartu "JAN 2024" |
| c07_payoff | Kantor ditata ulang, lampu hangat, outro AUDIRA | `office-desk-021eb3` (prop), `seated-office-worker-854671` (character, Cheer) | Outro card `audira-outro-card.svg` |

Saran engine: hybrid — kantor, meja, koin, dan kardus pakai GLB (R3F) supaya ada subjek fisik; angka, kurva, dan timbangan unicorn lebih terbaca sebagai HUD/infografis 2D di atasnya.
