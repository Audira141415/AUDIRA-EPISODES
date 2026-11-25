# STYLE_DECISION — Cara Kerja Vaksin (EP33)

Style: TUBUH

- **Tanggal:** 2026-11-23
- **Engine:** Remotion 2D (kit mograph `engines/remotion-starter/src/styles/tubuh`, F:/AUDIRA-2D-SKILL-MOTION)
- **Style terpilih:** `TUBUH`
- **Alasan (awam, terkait topik):** kartun "di dalam tubuh" dengan sel dan kuman bermata besar; proses vaksin (antigen, antibodi, sel memori) bisa digambar langsung sebagai karakter, paling mudah dipahami penonton awam.
- **Alternatif ditolak:** `BLUEPRINT` — diagram lab terasa dingin, tanpa karakter; `SKETSA` — kurang detail untuk bentuk sel dan antibodi.
- **Cover referensi:** `cover-reference.png` · papan pilihan `style-options.jpg`
- **Cover topik:** `cover-topic.png` (dari komposisi film, frame hook)
- **approved:** `yes` (jawaban pengguna "TUBUH", 2026-11-23)

## Parameter dari motion memory
- Wajib diterapkan: tulis "Audira" (bukan AUDIRA) di teks VO; true peak final ≤ −1 dBTP (limiter); tanda tangan lewat skrip yang await; rename EPERM → mv bash.
- Parameter terbaik: belum ada untuk TUBUH (style 2D, episode pertama).
- Hindari: render MP4 sebelum VO dikunci; Math.random() (pakai rnd seeded dari kit).
