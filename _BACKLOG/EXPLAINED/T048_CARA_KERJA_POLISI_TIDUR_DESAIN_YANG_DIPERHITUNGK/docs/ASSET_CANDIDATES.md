# Asset Candidates — Cara Kerja Polisi Tidur: Desain yang Diperhitungkan

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya mobil, motor, ambulans, ubin jalan/parkir, rambu, kerucut, rumah toko, dan karakter ber-rig. Tidak ada GLB polisi tidur belang kuning-hitam (yang paling dekat `concrete-skate-bump-c47f03`), jadi gundukan dibuat procedural (penampang ekstrusi + tekstur belang) supaya ukuran bisa dicocokkan dengan angka aturan.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Roda motor mendekati gundukan belang, penggaris & busur HUD | `touring-motorcycle-3b1ad3` / vehicle, `scooter-b4b718` / ultra, `asphalt-road-tile-f6593c` / prop | Gundukan procedural; motor generik, tanpa merek. HUD "tinggi · lebar · kemiringan" |
| c01_intro | Tiga maket gundukan berlabel, dokumen aturan generik | `concrete-skate-bump-c47f03` / prop (referensi bentuk saja) | Maket procedural di meja gambar; dokumen tanpa logo kementerian |
| c02 | Area parkir, mobil keluar-masuk, penampang speed bump | `parking-lot-tile-227439` / prop, `hatchback-80s-e95554` / vehicle, `boxy-sedan-70s-7d55f7` / vehicle, `parking-meter-e9cf71` / prop | HUD "5–9 cm · 35–39 cm · < 10 km/jam"; penampang irisan 2D di atas 3D |
| c03 | Jalan perumahan, rumah berderet, speed hump landai | `two-storey-shophouse-183790` / building, `wide-shophouse-089f20` / building, `asphalt-road-tile-f6593c` / prop, `street-sign-post-c621b4` / prop | Kit jalan suburban Jepang: ganti tekstur/papan agar terasa Indonesia; HUD "8–15 cm · 30–90 cm · ≤ 15%" |
| c04 | Jalan kolektor, speed table panjang jadi penyeberangan, pejalan kaki tanpa wajah | `road-tile-286319` / prop, `lane-marking-decal-d1a212` / prop, `traffic-signal-2a517e` / prop, karakter ber-rig (cari saat produksi) | Wajah karakter disederhanakan/siluet (rule 15); meteran 6,6 m |
| c05 | Tampak atas belang 20/30 cm miring, deretan gundukan berjarak 90–180 m | `road-tile-286319` / prop, `site-traffic-cone-d3ce94` / prop | Belang & pita jarak procedural; kamera drone |
| c06 | Split screen pelan vs ngebut, gundukan tidak standar, motor oleng | `hatchback-80s-e95554` / vehicle, `pickup-truck-70s-8c0080` / vehicle, `touring-motorcycle-3b1ad3` / vehicle, `ambulance-van-29919a` / vehicle (opsional) | Grafik guncangan 2D; gundukan "tidak standar" tanpa lokasi/identitas nyata |
| c07_payoff | Peta status jalan, gedung pemerintahan generik, roda melambat golden hour, outro | `speed-limit-sign-1c55a2` / prop, `traffic-cone-33e81e` / prop, `touring-motorcycle-3b1ad3` / vehicle | Peta & ikon gedung 2D tanpa lambang; outro card `audira-outro-card.svg` |

Saran engine: hybrid — 3D (URBANFORGE) cocok untuk jalan, kendaraan, dan simulasi suspensi yang benar-benar "terhentak", tetapi inti cerita adalah penampang berukuran (cm, %, sudut) yang lebih tajam sebagai diagram 2D; bila harus satu engine, 3D dengan gundukan procedural + overlay HUD ukur, karena payoff pelan vs ngebut butuh gerak fisik.
