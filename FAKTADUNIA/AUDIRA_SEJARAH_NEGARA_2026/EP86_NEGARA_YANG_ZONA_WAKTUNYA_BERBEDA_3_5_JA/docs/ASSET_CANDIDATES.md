# Asset Candidates — Negara yang Zona Waktunya Berbeda 3,5 Jam dari Negara Tetangga

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Pendaki melangkah lewat garis perbatasan bersalju, close-up jam tangan | `mountaineer-13df29` / character (clip Walk), `piste-marker-pole-7480c3` / prop | Jam tangan dibuat sebagai HUD 2D; tidak ada GLB jam tangan |
| c01_intro | Peta Asia ke Pamir, Celah Wakhjir, garis perbatasan ±92 km | — | Peta/terrain dibuat 2D (HISTORYMAP) atau heightmap; tidak ada GLB terrain Pamir |
| c02 | Peta Tiongkok 5 pita zona runtuh jadi 1, jam Beijing | `wall-clock-0c555c` / prop | Peta 2D; jam dinding sebagai ikon jam Beijing |
| c03 | Gurun Xinjiang subuh, dua jam dinding beda 2 jam | `wall-clock-05f8ff` / prop, `desert-floor-tile-cf69a2` / prop | Lanskap gurun lebih baik ilustrasi 2D berlayer |
| c04 | Lembah Wakhan, pondok gunung, kalkulator kinetik 8 − 4,5 = 3,5 | `mountain-refuge-hut-32ab1e` / building, `bare-mountain-rowan-10e72e` / prop | Pencarian "yak" kosong; kafilah pakai siluet 2D |
| c05 | Peta India–Nepal, dua jam beda 15 menit, garis bujur Gaurishankar | `wall-clock-0c555c` / prop | Peta + garis bujur 2D |
| c06 | Bola dunia dengan pita zona waktu bergerigi | `classroom-globe-16a96e` / prop | Pita zona di-overlay sebagai tekstur/2D |
| c07_payoff | Hero shot celah gunung, sisi Afganistan pagi 08:30, sisi Tiongkok siang 12:00, outro AUDIRA | `mountaineer-13df29` / character (clip Wave), `mountain-refuge-hut-32ab1e` / building | Split lighting dua sisi |

Saran engine: 2D — inti cerita adalah peta, garis bujur, dan jam (HISTORYMAP/SATELLITEBRIEFING); GLB yang cocok sedikit (tidak ada terrain Pamir atau yak), jadi 3D hanya opsional untuk pendaki di hook/payoff.
