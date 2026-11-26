# Asset Candidates — Kenapa Harga Tiket Pesawat Berubah Setiap Kali Kamu Cek

> Dicari via `audira_search_assets` (2026-11-26). Katalog punya pesawat generik (kit airport), ponsel, laptop, dan karakter duduk ber-rig. Tidak ada kursi pesawat, kabin cutaway, papan keberangkatan, atau truk avtur: itu dibuat 2D. Semua pesawat tanpa livery/logo maskapai (rule 15).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Ponsel dengan harga melonjak, ikon cookie dicoret | `smartphone-5f05e5` / ultra | UI aplikasi fiktif, tanpa logo OTA nyata; HUD "Dilacak? Belum terbukti" |
| c01_intro | Pesawat generik dibelah, blok kursi berhuruf | `narrow-body-airliner-619183` / vehicle, `widebody-airliner-ae0a5a` / vehicle | Livery polos; cutaway kabin & huruf kelas lebih jelas 2D; HUD hero "26" |
| c02 | Tangga harga berhuruf, kursi terisi, gembok | `seated-office-worker-854671` / character (siluet, clip Idle) | Kursi pesawat tidak ada di katalog; tangga + kursi 2D; siluet tanpa wajah |
| c03 | Ruang kontrol dengan 4 dial faktor harga | `laptop-e775ba` / prop | Dial/jarum = ilustrasi 2D + ikon lucide; HUD "sejak 1980-an" |
| c04 | Grid 66 browser, peta 2 titik, kalender 21 hari, counter 130.000+ | — | Murni infografis 2D; peta batas generik; HUD 2014 / 25 maskapai / 3 minggu / >130.000 |
| c05 | Grafik harga naik-turun, kursi berkedip, kartu "cache" | — | Grafik ilustratif, beri label "ilustrasi" (bukan data riil) |
| c06 | Peta Indonesia, plafon TBA 100/90/85%, chip FS 40% | `narrow-body-airliner-619183` / vehicle (ikon rute) | Teks saja, tanpa logo Kemenhub; tulis "per Nov 2026" di chip FS |
| c07_payoff | Pesawat utuh penuh, cookie jadi centang, outro AUDIRA | `narrow-body-airliner-619183` / vehicle | Outro card `audira-outro-card.svg` |

Saran engine: 2D — inti cerita adalah tangga harga, kelas berhuruf, grafik, dan data studi (infografis), sementara katalog tidak punya kursi/kabin pesawat; DATAPHYSICAL atau CHAINREACTION 2D paling aman, model pesawat GLB cukup sebagai aksen opsional.
