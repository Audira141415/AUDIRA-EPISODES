# STORYBOARD — AE-042 Banjir Kiriman (LIDARFORGE)

Komposisi: `Ep042Preview` / `Ep042Final`, durasi 62,68 dtk (`timeline.total`). Semua detik = detik VO dari `studio/src/scenes/ep042/timeline.json`; kode membaca waktu kata langsung dari JSON.
Dunia: lembah DAS Ciliwung sebagai point cloud LiDAR (warna = ketinggian), hulu di −Z dengan awan badai + hujan, kota di +Z. Ada 3 pos TMA (bendung + papan duga merah-putih + suar): Katulampa, Depok, Manggarai. Kamera bergerak satu alur drone kontinu (blend antar-shot), dengan 2 potongan keras yang ditandai sapuan laser.
Layer: BG langit (gradien cerah → badai), MG point cloud + air + pos, FG vinyet/fade, HUD (label tertambat 3D, panel), caption karaoke (Space Grotesk, kata aktif dalam sel cyan), Outro AUDIRA dari 58,88 dtk.

| # | Detik | Bagian | Visual | Kamera | Teks layar | SFX |
|---|---|---|---|---|---|---|
| 1 | 0,0–2,4 | HOOK | Siluet kota point cloud, langit hangat cerah, gunung di belakang | Dolly rendah menyusuri skyline | KOTA · Cerah | riser 0,0 |
| 2 | 2,4–8,0 | HOOK | Langit menggelap, awan badai di hulu, hujan turun, denyut air mulai bergerak dari mata air | Crane naik + tilt ke hulu | HULU · Hujan deras | whoosh 3,3 |
| 3 | 8,0–10,0 | KONTEKS | Seluruh DAS dari atas (bingkai cover), sapuan laser menyapu lembah hilir→hulu | Crane mundur tinggi | Kartu "Banjir kiriman" | whoosh 7,9, impact 8,98 |
| 4 | 10,0–16,0 | KONTEKS | Kepala air (titik cyan padat) menyusuri alur menuju Katulampa | Drone mengikuti kepala air | Sungai Ciliwung; jam tanpa angka "Berjam-jam" | click 14,15 |
| 5 | 16,0–20,0 | MEKANISME | Pos pantau: bendung, papan duga, garis muka air | Orbit pelan di pos pertama | Pos pantau TMA | pop 17,44 |
| 6 | 20,0–24,0 | MEKANISME | Pos menyala berurutan saat namanya disebut | Meluncur di sepanjang sungai pos ke pos | KATULAMPA / DEPOK / MANGGARAI | pop 20,37 · 21,84 · 23,31 |
| 7 | 24,0–27,0 | MEKANISME | Close-up papan duga Manggarai | Orbit rapat | Tangga ambang Siaga 4→1 (hijau, kuning, oranye, merah) | — |
| 8 | 27,0–30,8 | MEKANISME | Paket data amber melengkung dari Katulampa ke kota, lebih dulu daripada air | Naik tinggi, sudut lebar | "Data hulu · Dibaca lebih dulu" | riser 26,9 |
| 9 | 30,8–34,3 | REVEAL | Air di papan duga Katulampa naik, suar berganti warna status | Orbit dekat Katulampa | KATULAMPA + status Siaga | — |
| 10 | 34,3–37,3 | REVEAL | Pandangan samping seluruh alur; garis putus amber Katulampa→Manggarai | Dolly samping lebar | **±6–9 jam (perkiraan BPBD)** | impact 35,22 |
| 11 | 37,3–44,3 | REVEAL | Kota bersiap: rumah pompa menyala, 3 petugas, menara sirene memancarkan cincin suara, notifikasi peringatan generik | Orbit kota | Pompa / Petugas siaga / Sirene / kartu peringatan | glitch 42,65 |
| 12 | 44,3–48,5 | PAYOFF | Katulampa: air tetap mengalir melewati bendung | Potong keras + sapuan laser, orbit rendah | ✓ Titik ukur · ✕ Keran banjir | whoosh 44,26 |
| 13 | 48,5–52,9 | PAYOFF | Awan turun di atas kota, hujan lokal, genangan cyan menyebar di jalan | Potong keras + sapuan laser, high angle kota | Genangan · Hujan lokal | whoosh 48,47 |
| 14 | 52,9–58,9 | OUTRO | Tarik mundur ke seluruh DAS, sapuan laser hulu→hilir | Crane mundur | ✓ Diperkirakan · ✕ Dipastikan; label HULU/pos/KOTA | — |
| 15 | 58,9–62,68 | OUTRO | Kartu outro AUDIRA (`_shared/Outro.tsx`) | — | Created by Agus Dwi R. | — |

Batasan klaim: angka di layar hanya "±6–9 jam (perkiraan BPBD)" dan label Siaga 4→1. Tidak ada angka cm, tidak ada kecepatan aliran, tidak ada logo instansi. Kartu notifikasi bergaya generik dan tidak meniru UI JAKI.
