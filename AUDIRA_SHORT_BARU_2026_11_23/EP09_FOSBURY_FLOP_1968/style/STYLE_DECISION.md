# STYLE_DECISION — Fosbury Flop 1968 (`EP09`)

> ✅ Gerbang tahap 3. Cover = quality-bar penilaian skor.

Style: CHRONICLE

- **Tanggal:** `2026-11-23`
- **Engine:** 2D — Remotion tanpa R3F (SVG/CSS), 1080×1920 @ 60
- **Style terpilih:** `CHRONICLE` (dipilih pengguna 2026-11-23, setelah TACTICBOARD gagal juri)
- **Alasan (awam, terkait topik):** gaya dokumenter siluet: atlet hitam berkontur emas di stadion senja 1968, dengan sinar lampu dari balik tribun, tanggal, angka rekor, dan kliping koran. Cocok untuk kisah sejarah olahraga "diejek lalu jadi standar dunia".
- **Alternatif ditolak:**
  - `TACTICBOARD` — sempat dipilih dan diproduksi, tetapi juri buta 2 putaran gagal (3.33 lalu 3.50 < 3.8): papan hijau datar, kurang kedalaman dan cahaya.
  - `FILM16` — nuansa arsip kuat, tetapi diagram pusat massa sulit terbaca di butiran film.
  - `RISOFORGE` — cetak riso menarik untuk poster, lemah untuk kedalaman dan cahaya berarah.
- **Cover referensi:** `cover-reference.jpg` (= `F:/AUDIRA-SKILL-MOTION/references/quality-bar/chronicle.jpg`)
- **Cover topik:** `cover-topic.png` (komposisi `Ep09Cover`); cover lama TACTICBOARD disimpan sebagai `cover-topic-tacticboard.png`
- **approved:** `yes`

## Parameter dari motion memory (`audira_style_memory get CHRONICLE`)
- Hindari (EP10 juri 3.50): langit gradasi + siluet glow saja → lighting/material/depth 3.
- Diterapkan: matahari/floodlight di satu sisi (sunX berganti kiri/kanan per scene) + god-rays `LightRays`, `Haze` antara tribun dan lintasan, kerumunan massa lembut (blur di bawah kepala), siluet hitam berkontur warna + glow rim dari sisi matahari, bayangan jatuh, occluder FG blur (tiang + papan tepi lintasan), grain 0.09 + vignette sudut.
- Komponen set disalin dari EP10 (`project/src/lib/set.tsx` → `project/src/scenes/ep09/set.tsx`).
