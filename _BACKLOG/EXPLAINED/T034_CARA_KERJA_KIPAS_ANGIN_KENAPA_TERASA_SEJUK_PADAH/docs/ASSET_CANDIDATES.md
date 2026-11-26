# Asset Candidates — Cara Kerja Kipas Angin: Kenapa Terasa Sejuk Padahal Suhunya Sama

> Dicari via `audira_search_assets` (2026-11-26). Katalog TIDAK punya GLB kipas angin, AC, termometer, kasur, atau motor listrik ("fan" hanya memberi sea fan/karang). Ada perabot kamar, karakter ber-rig, botol air, dan pohon teduh. Kipas, termometer, kulit/keringat, dan aliran udara harus dibuat sendiri (2D atau mesh prosedural sederhana).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Kamar malam gerah, kipas berdiri, termometer dinding diam | `bedside-table-740c6b` / prop, `lounge-armchair-5a72ca` / prop | Kipas & termometer belum ada di katalog: buat 2D/procedural (baling-baling + rumah motor generik tanpa merek) |
| c01_intro | Termometer di depan kipas, garis aliran udara | — | Garis aliran udara 2D/shader; HUD "Kipas = udara bergerak" |
| c02 | Kulit lengan dengan selubung udara hangat yang disapu angin | `student-in-a-hoodie-7c8223` / character (clip Idle) | Close-up kulit ilustrasi 2D lebih terbaca; karakter generik, tanpa wajah orang nyata |
| c03 | Butir keringat makro menguap membawa partikel panas | — | Makro keringat & uap: 2D/procedural; label "Penguapan" |
| c04 | Cutaway motor kipas, panas kecil; kamar kosong + kipas berputar | `bedside-table-3f2b80` / prop, `dorm-desk-chair-9b4076` / prop | Cutaway motor generik (kumparan, rotor) dibuat 2D; ikon lucide Power-off |
| c05 | Dua panel 27 °C diam vs angin 1 m/s, "terasa" turun ≈ 4 °C | `graduate-student-945ef0` / character (clip Idle) | Infografis split-screen 2D; callout besar "≈ 4 °C lebih sejuk (terasa)" |
| c06 | Termometer lewat garis 35 °C, angin jadi oranye; gelas air + pohon teduh | `water-fountain-bottle-filler-919fbb` / prop, `bottle-ca0f79` / ultra, `broad-canopy-shade-tree-e7c4a2` / prop | Nada tenang, bukan menakutkan; tanpa merek air minum |
| c07_payoff | Kamar hook, sungai angin biru membawa panas oranye keluar jendela, outro AUDIRA | `student-in-a-hoodie-7c8223` / character, `bedside-table-740c6b` / prop | Outro card `audira-outro-card.svg` |

Saran engine: 2D — inti cerita adalah fenomena tak kasat mata (lapisan udara hangat, keringat menguap, aliran panas) yang paling jelas sebagai diagram/ilustrasi berlapis, dan objek kunci (kipas, termometer, motor) tidak ada sebagai GLB; 3D (FLUIDFORGE) hanya layak bila kipas dan aliran udara dibangun prosedural.
