# Asset Candidates — Cara Kerja Triase IGD: Kenapa Pasien Terakhir Bisa Dilayani Duluan

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya `hospital-kit-2ebfcb` lengkap (ambulans, pintu IGD, ruang tunggu, tempat tidur, monitor, karakter dokter/perawat ber-rig). Karakter nyata tetap dipakai tanpa detail wajah (rule 15). Label warna, tiket antrean, tangga 5 level, dan kartu pasal lebih jelas sebagai 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Ruang tunggu IGD, kursi berderet, brankar masuk dari pintu darurat | `waiting-room-chair-5e20cc` / prop, `emergency-entrance-block-9e5caf` / building, `hospital-bed-31132d` / prop, `ambulance-van-29919a` / vehicle | Tiket nomor 2D; pasien siluet tanpa wajah; tanpa logo RS di ambulans |
| c01_intro | Meja triase, tiket berubah jadi label warna | `reception-desk-3d6913` / prop, `ward-nurse-84b61d` / character (Idle/Point) | Label warna 2D overlay |
| c02 | Penilaian ABCDE, monitor tanda vital | `vital-signs-monitor-632560` / prop, `examination-couch-1ab5b9` / prop, `hospital-nurse-base` / character | Checklist ABCDE + timer "2–5 menit" 2D |
| c03 | Empat kartu warna merah/kuning/hijau/hitam | — | 2D (kartu + ikon lucide); HUD "Permenkes 47/2018" |
| c04 | Tangga 5 level + jam pasir | — | 2D infografis; label "contoh ATS", tanpa bendera |
| c05 | Pasien menunggu memburuk, label naik jadi merah | `waiting-room-chair-5e20cc` / prop, `vital-signs-monitor-632560` / prop, `wheelchair-0584dc` / prop | Grafik denyut 2D |
| c06 | Kartu pasal hukum, kartu peserta generik | `multi-storey-ward-block-2bac82` / building, `clinic-annexe-0f56d1` / building | Tanpa logo BPJS/Kemenkes; kartu peserta generik |
| c07_payoff | Denah IGD dengan jalur warna, outro | `wayfinding-stripe-decal-017b76` / prop, `operating-table-af1a83` / prop, `doctor-d49de0` / character (Walk) | Jalur merah/kuning/hijau; outro card `audira-outro-card.svg` |

Saran engine: 2D — inti cerita adalah label warna, tiket antrean, tangga waktu tunggu, dan kartu pasal (semua infografis); hybrid dengan diorama `hospital-kit` hanya bila style 3D dipilih untuk hook dan payoff.
