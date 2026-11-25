# STYLE_DECISION — Usain Bolt 9,58 Detik (`EP06`)

Style: TOYDIORAMA

- **Tanggal:** `2026-11-23`
- **Engine:** Remotion 4 + React Three Fiber (3D), studio bersama seri `AUDIRA_FAKTA_OLAHRAGA_2026/studio`, scene `src/scenes/ep06/`
- **Style terpilih:** `TOYDIORAMA`
- **Alasan (awam, terkait topik):** Lomba 100 m dibangun sebagai diorama stadion mainan: delapan figur pelari di lintasan, papan waktu, tribun. Lari 9,58 detik bisa diperlambat, diulang, dan diukur di atas meja seperti mainan, jadi angka split, langkah, dan selisih waktu terbaca tanpa suara. Figur mainan juga menghindari wajah realistis atlet nyata.
- **Alternatif ditolak:** `BROADCASTFORGE` — juri EP03 dua kali 3,83 (figur matte, plakat kecil), dan nuansa studio berita kurang cocok untuk aksi lari; `DATAPHYSICAL` — kuat untuk angka, tetapi kehilangan aksi lomba dan stadion Berlin.
- **Cover referensi:** `F:/AUDIRA-SKILL-MOTION/references/quality-bar/` (TOYDIORAMA) + episode EP04 seri ini (juri final 3,83)
- **Cover topik:** `cover-topic.png` (komposisi `Ep06CoverA`, frame hook)
- **approved:** `no`  (style dipilih AI tanpa acc sesuai keputusan pengguna 2026-11-23; acc hanya di gerbang render final)

## Parameter dari motion memory (`audira_style_memory get TOYDIORAMA`)
- Wajib diterapkan: `<Finish>` profile `DOCUMENTARY_WARM`, exposure 1, envIntensity 0.55; karakter `ToyPerson` + material POLISH; set sisipan ambient ±0,2 + spot hangat sempit di subjek (angle 0.36, penumbra 0.55); vignette sedang (jangan diringankan: depth ceiling turun).
- Parameter terbaik: kamera rendah dan dekat untuk set sisipan; subjek mengisi 800–1250 px; jarak kamera tracking ±12 di fov 32 untuk subjek memanjang.
- Hindari: lantai kosong di 30% bawah frame; perbedaan ukuran yang tipis (pakai skala ≥ 1,4×); counter yang tertangkap di tengah hitungan pada contact sheet; teks terpotong di tepi; teks < 34 px.
