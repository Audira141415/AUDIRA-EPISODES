# STORYBOARD — AE-062 Bagaimana Stadion Menampung Puluhan Ribu Penonton dengan Aman? (TACTICBOARD)

Komposisi `Ep062Preview` / `Ep062Final`, durasi 60,386 dtk (timeline.json). Semua detik = detik VO.
Kode: `studio/src/scenes/ep062/Film.tsx` (kamera, HUD, caption), `Corridor.tsx` (papan detail lorong 1:1 m, model antrean deterministik), `StadiumBoard.tsx` (dunia cover, mode `film`).
Layer tetap: BG = void studio + bokeh lampu; MG = papan taktik stadion / papan detail lorong; FG = bidak dekat kamera (blur DOF), tiang lampu; HUD = kicker kiri-atas (y 262) + kartu angka; caption karaoke kuning di atas batas 380 px bawah.

| # | Detik | Bagian | Visual | Kamera | Teks layar | SFX |
|---|---|---|---|---|---|---|
| 1 | 0.00–6.37 | HOOK | Stadion penuh bidak di papan taktik, LED AUDIRA di tribun jauh. Di "delapan menit" (3.63) jam 8:00 muncul dan mulai mundur; di "keluar" (4.62) aliran bidak kuning mulai turun gangway. | Crane turun + orbit (d 29→23.5, elevasi 60°→43°, az -30°→-8°) | 8:00 KELUAR DARI TRIBUN | riser 0.0, impact 3.63 |
| 2 | 6.37–11.06 | KONTEKS | Buku hijau "Green Guide" jatuh ke tengah lapangan (7.47), label + kartu "pedoman keselamatan stadion · Inggris". | Orbit ke sisi tribun hero (d 20, az -24°) | Green Guide / GREEN GUIDE (INGGRIS) | pop 7.37 |
| 3 | 11.06–16.73 | KONTEKS | Panah telestrator menggambar dirinya: tribun → gangway → vomitory → concourse, berhenti dengan cincin "JALUR KELUAR LANCAR" (13.43). Di "bukan sampai luar stadion" (14.81) panah putus-putus ke gerbang dicoret X merah. | Dolly masuk ke sisi hero (d 12.5, az -46°) | JALUR KELUAR LANCAR · 8 MENIT BERHENTI DI SINI / ~~sampai luar stadion~~ | whoosh 11.26, glitch 14.81 |
| 4 | 16.73–19.52 | MEKANISME | Close-up gangway: pita ukur kuning keluar dari wadah merah melintang tangga, label "1 m". | Dolly masuk tajam (d 3.8, el 50°) | 1 m LEBAR TANGGA | click 17.06 |
| 5 | 19.52–23.40 | MEKANISME | Bidak mengalir turun tangga; penghitung naik 0→66 tepat di "enam puluh enam". | Orbit pelan di tangga (d 3.3, az -74°→-58°) | 66 ORANG / MENIT · TANGGA 1 m | pop 21.92 |
| 6 | 23.40–25.46 | MEKANISME | Pindah ke concourse datar: pita ukur kedua, bidak lebih cepat (kecepatan ×82/66). | Pan + crane ke concourse (el 50°) | 82 ORANG / MENIT · DATAR 1 m | — |
| 7 | 25.46–29.03 | MEKANISME | Kartu "66 × 8 menit = 528 orang (per 1 m lebar tangga)"; di "kapasitas sektor" (27.41) blok kursi yang dilayani gangway menyala kuning. | Tarik mundur (d 8.2) | 66 × 8 menit = 528 orang / KAPASITAS SEKTOR | click 25.66 |
| 8 | 29.03–30.43 | REVEAL | Cincin merah berdenyut di vomitory; kamera menukik masuk ke mulut lorong yang gelap (zoom-through). | Dive ease-in (d 8→0.32, el 74°) | Kuncinya: titik tersempit, ~~bukan gerbang terbesar~~ | riser 29.2, whoosh 30.43 |
| 9 | 30.43–33.56 | REVEAL | Keluar dari terowongan ke papan detail 1:1 m: landing → lorong 1,5 m (portal atap) → plaza → gerbang 3 m. Lorong menyala merah di "titik" (31.36); gerbang diberi label "GERBANG TERBESAR" (32.61). | Crane naik dari dalam terowongan (d 2→17.5, el 12°→52°) | TITIK TERSEMPIT / GERBANG TERBESAR | impact 31.36 |
| 10 | 33.56–38.58 | REVEAL | Bidak tersendat di mulut lorong, mengalir dua jalur, plaza di depan gerbang lengang. Braket merah 1,5 m dan hijau 3 m; kartu "LEBAR YANG DIHITUNG: 1,5 m ~~3 m~~" (36.73). | Orbit pelan (az -90°→-76°) | LORONG 1,5 m / GERBANG 3 m / 1,5 m ~~3 m~~ | — |
| 11 | 38.58–45.62 | PAYOFF | Grid 1 m² muncul di landing, antrean memadat (jarak kisi 0,62→0,44 m ≈ 3→6 org/m²), heatmap kuning→merah, aliran di lorong melambat (laju turun). Meter kepadatan 1–6 dengan garis ±5; "Risiko terhimpit naik tajam" (43.73). Tanpa korban. | Orbit + crane ke landing (d 10.5, el 62°, az -112°) | KEPADATAN (ORANG/M²) · ±5 · ALIRAN / GRID 1 m² | riser 41.07 |
| 12 | 45.62–47.37 | PAYOFF | Zoom-through balik: naik keluar dari lorong, muncul dari vomitory hero di stadion. | Ascend ease-in lalu pull-back ease-out | INDONESIA · ATURAN POLISI SEJAK 2022 | whoosh 45.97 |
| 13 | 47.37–52.30 | PAYOFF | Stadion penuh, pintu semua gerbang berayun terbuka di "pintu" (49.25) dengan denyut hijau; ikon jam dengan irisan 15 menit terakhir. | Pull-back lebar (d 21, el 44°) | Pintu dibuka · 15 menit sebelum laga berakhir | impact 49.25 |
| 14 | 52.30–56.59 | OUTRO | Stadion dengan aliran keluar; cincin merah di vomitory hero + label "TITIK PALING SEMPIT"; LED AUDIRA jelas di frame (≥4 dtk). | Dolly + orbit pelan (d 13.5, az -28°) | TITIK PALING SEMPIT · DI SINI KAPASITAS DIHITUNG | — |
| 15 | 56.59–60.39 | OUTRO | `<Outro>` kartu AUDIRA (Created by Agus Dwi R.). | — | — | — |

Catatan akurasi: 8 menit = keluar dari tribun ke jalur keluar (bukan luar stadion); 66/82 org/m/menit; 528 = 66 × 8 (hitungan sendiri, ditulis "per 1 m lebar tangga"); 1,5 m vs 3 m dari contoh SGSA; ±5 org/m² ditulis sebagai rentang; aturan polisi 2022 (Perpol 10/2022) tanpa nama stadion/klub/korban. Angka laju aliran di papan detail tidak ditampilkan sebagai angka (hanya bar).
