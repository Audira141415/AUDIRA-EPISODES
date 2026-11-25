# Asset Candidates — Kenapa Tubuh Kita Butuh Tidur REM

Dicari lewat `audira_search_assets` (2026-11-25). Katalog tidak punya model otak, mata, atau tikus hewan: perlu dibuat prosedural/2D overlay.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | kamar tidur malam, anak tidur, mata bergerak | `bed-6e10e8` (prop), `bedside-table-740c6b` (prop) | anak tidur: karakter rig tidak punya pose tidur; pakai `<ToyPerson>` rebah atau ilustrasi 2D; close-up mata = shader/2D |
| c01_intro | lab tidur 1950-an, grafik EEG | `vital-signs-monitor-632560` (prop), `bed-head-service-panel-67f6f6` (prop) | siluet peneliti tanpa wajah; kertas EEG prosedural |
| c02 | hipnogram, jam malam ke pagi | belum ada GLB cocok | grafik data 2D/HUD (DATAPHYSICAL-like) |
| c03 | diagram seperempat, gelembung mimpi | belum ada GLB cocok | ilustrasi 2D dalam gelembung |
| c04 | tubuh transparan, gembok saraf, orang menendang selimut | `bed-6e10e8` (prop), `doctor-d49de0` (character, opsional) | tubuh transparan prosedural / x-ray shader |
| c05 | otak + amigdala berdenyut | belum ada (hanya `brain-coral-head-7db21a` koral, tidak cocok) | model otak perlu dibuat prosedural atau aset luar berlisensi |
| c06 | tikus di arena uji, dua benda, gelombang theta | `desk-mouse-2c7d42` adalah mouse komputer, TIDAK cocok | tikus ilustrasi 2D/kartun; arena = bidang sederhana + 2 props |
| c07_payoff | kamar saat fajar, rak memori, outro | `bed-6e10e8` (prop), `bedside-table-3f2b80` (prop) | outro card AUDIRA |

Saran engine: hybrid — kamar tidur 3D (GLB bed/bedside) untuk hook dan payoff, sedangkan hipnogram, otak/amigdala, dan riset tikus lebih jelas sebagai 2D/infografis karena katalog tidak punya GLB otak atau tikus (BEDAH 2D atau ANATOMIX bila model otak dibuat).
