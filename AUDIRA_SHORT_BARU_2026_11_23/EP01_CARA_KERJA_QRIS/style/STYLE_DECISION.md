# STYLE_DECISION — Cara Kerja QRIS (EP01)

Style: BONGKAR

- **Tanggal:** 2026-11-23
- **Engine:** Remotion 2D (SVG/DOM, tanpa R3F) — pola gold EP12 Sensor Sidik Jari (juri 4,0).
- **Style terpilih:** `BONGKAR`
- **Alasan (awam, terkait topik):** QRIS terasa sederhana ("scan, bayar, beres"), padahal di baliknya ada lapisan: isi kode QR (EMVCo, data pedagang, NMID) dan jalur issuer → GPN/switching → acquirer. Gaya BONGKAR membedah benda sehari-hari jadi lapisan isometrik berlabel di studio abu terang, jadi tiap pihak dan tiap lapisan bisa dibaca jelas.
- **Perbaikan dari kelemahan BONGKAR (EP12, lighting 3):** cahaya kunci dari kiri atas (gradien satu sisi), sisi kanan objek lebih gelap, garis rim/specular di tepi lapisan.
- **Riwayat:**
  - `ISOCRAFT` (acc 2026-11-23) gagal juri buta 2 putaran (r4 3,5: lighting 3, composition 3, readability 2; jaringan switching berupa kuboid generik). Final ISOCRAFT 3,67 tidak diterima (G16).
  - `CIRCUITFORGE` (acc 2026-11-23) gagal juri buta 2 putaran (2,67 → 3,0: cahaya rata, objek seperti plastik, kamera terlalu cepat, label terpotong, frame Acquirer menampilkan warung bukan bank).
- **Alternatif ditolak:** `INNERWORKS`, `CERDIK` — tidak dipilih pengguna.
- **Cover referensi:** `cover-reference.jpg` (dari `F:/AUDIRA-ALL-SKILL/assets/style-covers/bongkar.jpg`)
- **Cover topik:** `cover-topic.png` (komposisi `QrisCover`)
- **approved:** `yes` (pengguna: "BONGKAR", 2026-11-23)
