# STORYBOARD — EP05 Klub Raja Liga (TACTICBOARD)

Komposisi: `Ep05Preview` / `Ep05Final`, durasi 78,307 dtk (VO 74,307 + 4 dtk outro). Semua detik diambil dari `studio/src/scenes/ep05/timeline.json` (fungsi `W()` di `timing.ts`).
Dunia: satu papan taktik 3D yang sama dengan cover. Satu keping = satu gelar liga (tumpukan) atau satu musim juara beruntun (lajur). Kamera satu gerakan kontinu (Catmull-Rom lewat key di `timing.ts`), tanpa cut keras.
Layer: BG = stadion bokeh + menara lampu + papan LED AUDIRA; MG = papan lapangan, tumpukan/lajur keping; FG = keping lepas + bola (blur DOF); HUD = chip klub, kapur telestrator, tag hijau; caption karaoke di atas batas 380 px bawah.

| Detik | Bagian | Visual | Kamera | Teks layar | SFX |
|---|---|---|---|---|---|
| 0,00–2,6 | HOOK | Frame cover: tumpukan Celtic 56, Linfield 57, Rangers 55, garis rekor emas, lingkar kapur di keping ke-57 | Dolly maju pelan dari pose cover | `SEJARAH SEPAK BOLA #05`, RAJA LIGA DUNIA, "bukan klub yang kamu kira", chip 56/57/55 (hilang 0,45 dtk sebelum caption) | — |
| 3,33–5,64 | HOOK | Kapur mencoret raksasa; Linfield tetap dilingkari | Dolly maju ke Linfield | BUKAN REAL MADRID (dicoret), BUKAN BAYERN (dicoret), LINFIELD. | click 3,33 / 3,90, ping 5,24 |
| 5,8–10,4 | KONTEKS | Celtic & Rangers tenggelam ke papan; Linfield sendirian | Crane turun ke close-up tumpukan | Kartu LINFIELD · BELFAST · IRLANDIA UTARA | whoosh 6,0 |
| 10,4–12,9 | KONTEKS | Cincin emas naik menyusuri tumpukan, penghitung 0→57 | Close-up, naik ke puncak | 57 GELAR LIGA, REKOR DUNIA | riser 10,4, chime 11,9 |
| 12,9–15,0 | KONTEKS | Tumpukan putih Real Madrid naik di sebelah: 36 | Dolly mundur ke kanan, dua tumpukan | REAL MADRID · SPANYOL 36, LINFIELD 57 | pop 12,9 |
| 15,2–22,7 | PENGEMBANGAN | Real tenggelam; Linfield mundur ke belakang; Celtic & Rangers naik di depan (keduanya 55); lingkar kapur di lapangan | Mundur, lalu orbit kiri | GLASGOW · SKOTLANDIA, chip CELTIC / RANGERS, "> 100 TAHUN BERSAING" | whoosh 15,4 |
| 22,8–28,9 | PENGEMBANGAN | Keping ke-56 jatuh di tumpukan Celtic saat "menyalip" | Orbit kiri, turun | MEI 2026 · CELTIC JUARA, score bug CELTIC 56 – 55 RANGERS | impact 25,2, pop 26,3 |
| 29,2–31,9 | PENGEMBANGAN | Garis rekor 57 emas tepat di atas Celtic, Linfield di belakang | Crane naik ke puncak tumpukan | −1 dari rekor, LINFIELD 57 | ping 30,1 |
| 32,0–41,4 | PENJELASAN | Semua tumpukan tenggelam; lajur Bayern: 11 keping merah berbaris; garis emas di musim ke-11 | Crane tinggi ±55° di atas lajur kiri | 1 KEPING = 1 MUSIM JUARA, JUARA BERUNTUN, 2013 / 2023, 11 REKOR LIGA TOP EROPA, ~~REKOR DUNIA~~ | whoosh 32,1, click 34,2 |
| 41,5–48,9 | PENJELASAN | Lajur Skonto Riga, Lincoln Red Imps, Ludogorets berbaris 14 keping; garis kapur di 14 | Mundur ke tampilan semua lajur | nama + negara di samping lajur, angka 14 di ujung | pop 41,5 / 43,3 / 45,6 |
| 49,9–55,4 | PENJELASAN | Lajur JDT 12 keping; dua cincin kapur berdenyut di slot 13–14 | Geser kanan ke JDT | JOHOR DARUL TA'ZIM · MALAYSIA 12, "masih berjalan" | chime 54,0 |
| 55,6–57,2 | PAYOFF | Swoop dari atas ke sisi lapangan rendah | Crane turun cepat ke pitch-side | TAK ADA RAJA YANG ABADI | riser 55,6 |
| 57,8–61,4 | PAYOFF | Keping Leverkusen meluncur menutup lajur Bayern (slot 12), lajur Bayern meredup | Rendah, menyusuri ujung lajur | BAYERN 11× · DIPATAHKAN LEVERKUSEN, LEVERKUSEN 2023–24 · TANPA KALAH | impact 58,4 |
| 61,4–63,4 | PAYOFF | Keping Levski menutup lajur Ludogorets (slot 15) | Pan ke ujung lajur Ludogorets | LUDOGORETS 14× · DIHENTIKAN LEVSKI, LEVSKI 2025–26 | impact 62,0 |
| 63,5–66,6 | PAYOFF | Semua lajur dari atas | Crane naik tinggi (reveal) | JUARA SEKALI = bisa kebetulan, JUARA TERUS-MENERUS = DINASTI | impact 66,1 |
| 66,8–74,5 | OUTRO | Papan dari depan, LED AUDIRA di belakang lajur | Turun ke shot lebar depan, dolly pelan | AUDIRA · SEJARAH SEPAK BOLA, EPISODE BERIKUTNYA · LAHIRNYA SEPAK BOLA MODERN · 1863 | whoosh 66,9, chime 72,6 |
| 74,5–78,3 | OUTRO | Kartu `<Outro>` AUDIRA (Created by Agus Dwi R.) | — | — | — |

Catatan fakta (HIGH, `research/RESEARCH_REPORT.md`): Linfield 57, Celtic 56 (2025–26), Rangers 55, Real Madrid 36, Bayern 11 (2012/13–2022/23, rekor liga top-5, bukan rekor dunia), Skonto / Lincoln / Ludogorets 14, JDT 12 masih aktif, Leverkusen 2023–24 tanpa kalah, Ludogorets putus 2025–26 oleh Levski. Tanpa logo/lambang klub: warna klub + nama teks saja.
