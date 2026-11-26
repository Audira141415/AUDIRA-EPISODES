# Asset Candidates — Cara Kerja Palang Pintu Perlintasan Kereta

> Dicari via `audira_search_assets` (2026-11-27). Kit `countryside-railway` punya `crossing-gate` dan `level-crossing` siap pakai, ditambah rel, sinyal, rumah sinyal, lokomotif, gerbong, dan petugas (dipakai juga di T042). Tidak ada GLB motor bebek/mobil Indonesia modern, lampu perlintasan merah kembar, atau sensor rel: dibuat procedural/2D. Semua kereta dan kendaraan tanpa logo/merek nyata (rule 15).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Perlintasan dari atas, palang turun, rel kosong, garis kabar dari stasiun & sensor | `level-crossing-37d00b` / prop, `crossing-gate-50bcee` / prop, `straight-track-d4cf38` / prop | Garis kabar = overlay cahaya 2D; HUD "kabar datang lebih dulu" |
| c01_intro | Peta titik perlintasan, kereta melaju | `train-engine-180979` / ultra, `passenger-carriage-de9d58` / vehicle | Peta generik 2D; kartu "3.674 (data KAI, 2026)" tanpa logo KAI |
| c02 | Gardu jaga, petugas siluet, bel genta, jadwal | `signal-box-f57a2d` / building, `signalman-c561d7` / character (Idle/Point) | Petugas tanpa wajah detail; genta + jam = procedural |
| c03 | Rel menjauh, titik sensor, kabel ke gardu, buzzer, tombol, palang turun | `straight-track-d4cf38` / prop, `crossing-gate-50bcee` / prop, `colour-light-signal-713276` / prop | Sensor dan sinyal listrik = procedural; HUD "1–1,5 km", "4–7 detik" |
| c04 | Perlintasan otomatis, lampu merah berkedip, sirene, palang bertahap 3 kali, countdown | `crossing-gate-50bcee` / prop, `level-crossing-37d00b` / prop | Lampu kembar merah dibuat procedural (bukan `traffic-light` 3 warna); HUD "8 km", "≥ 60 detik", "2–4 detik" |
| c05 | Ekor kereta melindas sensor kedua, palang terangkat | `passenger-carriage-de9d58` / vehicle, `crossing-gate-50bcee` / prop | HUD "≥ 5 m" |
| c06 | Kendaraan berhenti di garis stop; perlintasan tanpa palang, berhenti-tengok-lewat | `boxy-sedan-70s-7d55f7` / vehicle, `road-tile-286319` / prop, `lineside-sign-post-7a08b9` / prop | Motor modern tidak ada di katalog: siluet 2D; kartu BERHENTI / TENGOK / LEWAT; tanpa adegan tabrakan |
| c07_payoff | Rantai kabar menyala (stasiun, sensor, alarm, palang), kereta lewat, outro | `country-station-building-2d8f5e` / building, `level-crossing-37d00b` / prop, `train-engine-180979` / ultra | Outro card `audira-outro-card.svg` |

Saran engine: hybrid — diorama 3D perlintasan, palang, gardu, dan kereta tersedia di katalog untuk adegan utama, sementara alur kabar (genta, sensor, kabel, timer 60 detik) paling terbaca sebagai overlay diagram 2D; bila satu engine, 3D (URBANFORGE) karena palang dan perlintasan GLB sudah ada.
