# Asset Candidates — Cara Kerja Sistem Jaminan Kesehatan: Gotong Royong dalam Angka

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya hospital kit (ambulans, karakter dokter/perawat ber-rig, modul dinding klinik, panel kepala ranjang) dan prop koin. Tidak ada GLB puskesmas utuh, ranjang rumah sakit lengkap, kolam dana, atau diagram iuran: dibuat 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Siluet pelari sehat, pasien di ranjang, koin melompat | `gold-coin-29afc1` / prop, `bed-head-service-panel-67f6f6` / prop, `overbed-table-7409a5` / prop | Siluet 2D tanpa wajah; kartu peserta generik tanpa logo |
| c01_intro | Lembar UU generik, tiga panah gotong royong | — | Tipografi kinetik 2D; HUD "UU 40/2004" |
| c02 | Peta Indonesia titik peserta, slip gaji terbelah 4% + 1% | — | Peta 2D generik; counter "±285,8 juta · per 1 Nov 2026" |
| c03 | Diagram lingkaran PBI sepertiga, tiga kartu kelas iuran | `gold-coin-stack-a9ef52` / prop | Diagram 2D; label "hitungan sendiri" pada "≈ 1 dari 3" |
| c04 | Tiga pipa koin mengisi kolam "Dana Jaminan Sosial", gedung kantor generik | `coin-hoard-heap-07b6e4` / prop, `gold-balance-scale-66497b` / prop | Papan teks "BPJS Kesehatan" tanpa logo/warna korporat |
| c05 | Puskesmas/klinik (kapitasi) vs rumah sakit (INA-CBG) | `clinical-wall-module-935f50` / building, `glazed-partition-module-91d966` / building, `doctor-d49de0` / character (Idle/Point), `ward-nurse-84b61d` / character, `ambulance-van-29919a` / vehicle | Karakter low-poly tanpa wajah nyata; tanpa logo RS/puskesmas |
| c06 | Counter 725,3 juta layanan, tabung Rp118 T vs Rp132 T, balok +Rp20 T | `gold-coin-stack-a9ef52` / prop | Grafik 2D netral, label "per akhir Sep 2026" |
| c07_payoff | Peta pipa rumah → kolam → faskes, outro AUDIRA | `ambulance-van-29919a` / vehicle, `air-ambulance-helicopter-ed9acc` / vehicle | Outro card `audira-outro-card.svg` |

Saran engine: 2D — topik ini aliran uang dan diagram (iuran, porsi PBI, kapitasi vs INA-CBG, arus kas), paling terbaca sebagai infografis DATAPHYSICAL/CHAINREACTION; GLB hospital kit cukup sebagai aksen dan tidak ada aset puskesmas atau kolam dana.
