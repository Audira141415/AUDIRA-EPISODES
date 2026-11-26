# Asset Candidates — Cara Kerja Sinyal Kereta Api: Kenapa Kereta Tidak Bertabrakan

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya kit `countryside-railway` lengkap: rel lurus/lengkung, wesel, sinyal lampu warna, semafor, rumah sinyal, lokomotif, kereta penumpang. Tidak ada kereta listrik modern/LRT, relai, sensor axle counter, atau panel interlocking: itu dibuat 2D/procedural. Semua kereta tanpa logo operator nyata (rule 15).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Rel panjang terpotong jadi petak berwarna, dua kereta, satu tertahan | `straight-track-d4cf38` / prop, `train-engine-180979` / ultra, `passenger-carriage-de9d58` / vehicle | Petak blok = overlay warna di atas rel; HUD "1 blok = 1 kereta" |
| c01_intro | Kereta melaju, garis jarak pengereman, tikungan menutup pandangan | `curved-track-819ec6` / prop, `lineside-tree-97e02a` / prop, `train-engine-180979` / ultra | Masinis siluet saja; HUD "jarak pengereman bisa beberapa km" |
| c02 | Diagram dua stasiun: sinyal masuk, sinyal blok, sinyal keluar | `colour-light-signal-713276` / prop, `country-station-building-2d8f5e` / building, `platform-run-3738d0` / prop, `lineside-sign-post-7a08b9` / prop | Kartu "PM 44/2018" generik, tanpa logo Kemenhub |
| c03 | Cutaway rel: arus listrik, gandar baja, relai; sensor hitung gandar | `straight-track-d4cf38` / prop, `passenger-carriage-de9d58` / vehicle (close-up roda) | Relai, arus, dan axle counter = 2D/procedural; counter angka kinetik "1-2-3-4" |
| c04 | Tiang sinyal tiga lampu hijau/kuning/merah | `colour-light-signal-713276` / prop | Periksa jumlah lampu GLB; bila bukan 3 aspek, buat ulang procedural |
| c05 | Emplasemen dengan wesel, rute bersilangan, ikon gembok, rumah sinyal | `set-of-points-610126` / prop, `point-rodding-run-92081f` / prop, `signal-box-f57a2d` / building, `signalman-c561d7` / character (Idle/Point) | Petugas tanpa wajah detail; panel interlocking = HUD 2D |
| c06 | Jalur layang modern, zona aman bergerak, gelombang radio | — | Tidak ada GLB LRT/metro; kereta modern generik dibuat procedural atau 2D; jangan meniru livery LRT Jabodebek |
| c07_payoff | Jaringan rel menyala seperti sirkuit, kereta berjarak aman, outro | `straight-track-d4cf38` / prop, `curved-track-819ec6` / prop, `train-engine-180979` / ultra, `colour-light-signal-713276` / prop | Outro card `audira-outro-card.svg` |

Saran engine: hybrid — diorama 3D rel, wesel, sinyal, dan kereta tersedia di katalog untuk c00–c02 dan c05, tetapi inti penjelasan (arus track circuit, hitung gandar, moving block) lebih terbaca sebagai diagram 2D top-down; bila satu engine, 2D (DATAPHYSICAL/PRECISION) lebih aman karena kereta modern untuk adegan CBTC tidak ada sebagai GLB.
