# STYLE_DECISION — Cara Kerja Sensor Sidik Jari di HP (EP12)

- **Tanggal:** 2026-11-23
- **Engine:** Remotion 2D murni (SVG/DOM berlapis, tanpa R3F) — skill `audira-2d-motion`
- **Style terpilih:** `BONGKAR`
- Style: BONGKAR
- **Alasan (awam, terkait topik):** HP "dibongkar" jadi lapisan berlabel (kaca, layar OLED, sensor, chip) di studio terang, jadi penonton langsung melihat di mana sensor bersembunyi dan beda tiga jenis sensor. Label chip hitam besar mudah dibaca di HP.
- **Alternatif ditolak:** `CIRCUITFORGE` — papan sirkuit gelap; cocok untuk kapasitor tapi risiko frame terlalu gelap (kelemahan tercatat), ditolak pengguna; `LIDARFORGE` — pemindaian titik; hanya cocok untuk babak ultrasonik, belum ada skor juri, ditolak pengguna.
- **Cover referensi:** `cover-reference.jpg` (cover kit BONGKAR)
- **Cover topik:** `cover-topic.png` (frame hook film)
- **approved:** `yes` (pengguna memilih "BONGKAR (Recommended)" 2026-11-23)

## Resep look BONGKAR → 2D
- Latar studio abu hangat gradasi `#eceef0` → `#dddbd6`, bayangan kontak lembut di bawah objek.
- Label: chip `#1b1b1c` teks putih Plus Jakarta Sans 700, titik merah `#c0141c` + garis penunjuk ke bagian.
- Aksen merah `#c0141c` (wordmark, judul kecil), oranye `#ef9420` untuk sinyal/energi, logam `#bfc2c6`/`#80858b`, tinta `#1e1f22`.
- Penghitung "n / N" besar ala "15 / 15 part" untuk angka kunci.
- Gerak: bagian terangkat satu per satu (exploded view isometrik), tahan dengan label, lalu menyatu kembali.

## Parameter dari motion memory (`audira_style_memory get BONGKAR`)
- Belum ada episode/skor BONGKAR sebelumnya (episode pertama). Terapkan pelajaran GLOBAL: Karaoke lokal lebar penuh gap 0.4em, kata mendatang opacity 1; "Audira" di teks VO; signature skrip await; loudnorm TP −1.5.
