# Style Decision — EP05 MAKKAH DULU DAN KINI

- **Tanggal:** 2026-11-10
- **Style terpilih:** VINTAGEFORGE (ukiran pelat tembaga, arsiran tinta, patina emas, rasa manuskrip kuno)
- **approved: yes** (style; dipilih pengguna lewat gerbang style `_review/STYLE_OPTIONS.jpg`, opsi utama)
- **Cover topik:** cover approved by user 2026-11-10 (disetujui bersama naskah; approved: yes).

## Kenapa VINTAGEFORGE cocok
Episode ini membandingkan Makkah lama (lembah, banjir, saluran Zubaidah, kapal layar, Benteng Ajyad) dengan kota modern. Gaya ukiran tembaga terasa seperti peta dan gravir perjalanan abad ke-18–19, zaman benteng dan kapal layar itu sendiri. Kota modern yang digambar dengan teknik yang sama membuat perbandingan "dulu dan kini" terasa dalam satu pelat, bukan dua dunia yang berbeda. Arsiran juga menyampaikan topografi lembah (garis kontur) dengan alami.

## Alternatif yang ditampilkan
1. **HISTORYMAP** (peta perang & geopolitik): kuat untuk rute haji laut, tetapi terlalu taktis/militer untuk kisah kota dan kurang cocok untuk arsitektur menara.
2. **POLYVERSE** (low-poly pastel): tenang, tetapi terlalu ringan dan generik untuk sejarah dan kurang memberi rasa "zaman dulu".

Pengguna memilih opsi utama (VINTAGEFORGE).

## Look development cover
- Pelat terbelah "DULU | KINI": kiri tinta sepia di kertas yang lebih tua (Benteng Ajyad di Bukit Bulbul, rumah batu, riwaq kubah kecil, menara lama); kanan tinta tembaga (Abraj Al-Bait dengan menara jam bermahkota emas, menara pendamping, blok hotel, menara masjid modern).
- Ka'bah di tengah sebagai kubus hitam utuh dengan pita kiswah emas, pintu, dan sudut Hajar Aswad. Tidak ada figur manusia, nabi, atau sosok apa pun.
- Lembah dengan garis kontur dan arsiran tonal, langit gravir dengan garis burin dan matahari rendah.
- Vinyet kapal layar jemaah dalam bingkai oval emas: "± 5 BULAN DI LAUT".
- Judul: "MAKKAH YANG TAK KAMU KENAL" + label "SEJARAH MAKKAH · EP05".
- Finish: VINTAGE_SEPIA_FILM, exposure 0.82, envIntensity 0.25 (memori style), HDRI warmStudio untuk emas; chromatic aberration diturunkan ke 0.0008 karena nilai bawaan 0.004 memberi pinggiran merah/biru di garis ukiran halus.

## Berkas
- `cover-reference.jpg`: quality bar kit (`F:\AUDIRA-ALL-SKILL\assets\style-covers\vintageforge.jpg`)
- `cover-topic-16x9.png`: 1920×1080 (komposisi `MakkahCoverWide`)
- `cover-topic-9x16.png`: 1080×1920 (komposisi `MakkahCover`)
- Scene: `project/src/scenes/makkah/`
