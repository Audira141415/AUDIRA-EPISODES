# Asset Candidates — Cara Kerja Donor Darah: Perjalanan Sekantong Darah

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya kit rumah sakit (ambulans, ranjang, kursi, perawat/dokter/pasien ber-rig) dan kit lab riset (sentrifus, rak tabung, kulkas sampel, mikroskop). Tidak ada GLB kantong darah, agitator trombosit, atau freezer plasma: itu dibuat 2D/procedural. Semua aset wajib dicek tanpa lambang palang merah/logo nyata (rule 15).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Kantong darah membelah jadi tiga warna | — | Tidak ada GLB kantong darah; ilustrasi 2D/procedural. HUD "3 komponen*" |
| c01_intro | Sentrifus berputar, tiga lapisan darah | `centrifuge-benchtop-b76ef2` / prop | Lapisan merah/buffy/kuning dibuat cutaway 2D di atas model |
| c02 | Ruang donor, siluet pendonor, petugas | `waiting-room-chair-5e20cc` / prop, `ward-nurse-84b61d` / character (Idle/Point), `clinical-wall-module-935f50` / building, `hand-sanitiser-dispenser-a48460` / prop | Kursi donor khusus tidak ada; pakai kursi + lengan 2D. Wajah karakter dibuat tanpa detail. HUD kartu syarat |
| c03 | Lab uji saring, rak tabung, lampu 4 uji | `sample-tube-rack-3a32bd` / prop, `research-microscope-77ce04` / prop, `lab-wall-solid-8bd631` / building, `lab-floor-tile-ad0da8` / building | Label uji = HUD teks; tanpa merek reagen |
| c04 | Jam 24 jam, sentrifus, kantong satelit | `centrifuge-benchtop-b76ef2` / prop, `cleanroom-partition-solid-a2afb1` / building | Kantong satelit 2D; jam digital HUD |
| c05 | Kulkas 2–6 °C, agitator trombosit, freezer −25 °C | `glass-door-sample-fridge-386715` / prop, `fridge-freezer-fb9b5a` / prop | Agitator/rak goyang belum ada di katalog; buat 2D. Termometer HUD |
| c06 | Pasien di ranjang (siluet), penggabungan trombosit, peta Indonesia | `patient-in-gown-fdab75` / character (Idle), `bed-6e10e8` / prop, `bed-head-service-panel-67f6f6` / prop, `multi-storey-ward-block-2bac82` / building | Peta Indonesia generik 2D; penghitung "5,6 juta (per 2024)" |
| c07_payoff | Rute donor → lab → pasien, kalender 2 bulan, outro | `ambulance-van-29919a` / vehicle, `multi-storey-ward-block-2bac82` / building, `waiting-room-chair-5e20cc` / prop | Cek tekstur ambulans: hapus/ganti lambang palang merah bila ada. Outro card `audira-outro-card.svg` |

Saran engine: 2D — inti cerita (kantong darah, lapisan sentrifus, kantong satelit, suhu simpan, penggabungan trombosit) tidak ada sebagai GLB dan lebih terbaca sebagai diagram/ilustrasi (CERDIK/CHAINREACTION); 3D hybrid hanya bila ingin diorama rumah sakit dan lab dari kit yang tersedia.
