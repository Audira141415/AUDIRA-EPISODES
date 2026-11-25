# STYLE_DECISION — Bobsled Jamaika, Calgary 1988 (`EP09`)

Style: CINESTORY

> Ganti style (G21) setelah TOYDIORAMA gagal juri buta 2× (3,33 dan 3,33 < 3,5). Tahap 4 diulang untuk style ini. Pilihan AI, tanpa acc (keputusan pengguna 2026-11-23).

- **Tanggal:** `2026-11-24` (keputusan s4, kode s5, poles + docs s6)
- **Engine:** Remotion + R3F (3D), studio seri bersama `AUDIRA_FAKTA_OLAHRAGA_2026/studio`, kode `studio/src/scenes/ep09/` (+ `cine/`)
- **Style terpilih:** `CINESTORY` (unggulan, dipilih AI)
- **Alasan (awam, terkait topik):** Ini kisah underdog nyata yang dramatis: kereta terguling di depan jutaan penonton, lalu tim kembali dan mengalahkan Amerika 0,01 detik. Look film sinematik (cahaya malam realistis, grading teal-oranye, fokus dangkal, kamera bergerak dengan motivasi) membuat momen jatuh dan bangkit terasa seperti adegan film, bukan mainan.
- **Alternatif ditolak:**
  - `PAINTERLY`: pernah dinilai juri 3,67 di seri ini, tetapi overlay sapuan kuasnya membuat frame keruh dan angka HUD kurang terbaca.
  - `PANELVERSE`: gaya komik cocok untuk aksi, tetapi panel dan garis tinta bersaing dengan chip data dan papan skor yang jadi inti payoff.
  - `TOYDIORAMA` (style sebelumnya): ditolak juri buta 2× (lantai kosong, crash S1/S4 tampak sama).
- **Cover referensi:** `cover-reference.jpg` (salinan `F:/AUDIRA-SKILL-MOTION/references/quality-bar/cinestory.jpg`)
- **Cover topik:** `cover-topic.png` (komposisi `Ep09Cover`)
- **Batas fakta visual:** setelah terguling, atlet BERJALAN di samping kereta (tangan bebas), tidak memikul/mendorong. Tanpa materi/nama film. 1994: Jamaika ke-14 dari 30, di atas USA 1 (3:29,96 vs 3:29,97). Kecepatan "sekitar 130 km/jam". Four-man 1988 tidak finis.
- **approved:** `no` (gerbang hanya di render final)

## Perbaikan visual yang diterapkan (s6)
- Salju abu-biru `#c3cfdc` / tekstur dasar `#dfe6ee`, sheen 0,12; subject spot 40 (bukan 70) → bawah frame tidak lagi putih terbakar.
- `ForeDrift` diperkecil (tinggi 0,05–0,14) dan diwarnai bayangan salju `#9fadbf`.
- Gradien gelap bawah (y 1380–1920) di atas zona UI.
- Gunung: punggung batu gelap 7 sisi + tudung salju, lebih rendah dan jauh (z −16…−18).
- Kamera: S1 head-on lebih jauh (fov 26→34), S4 crane 3,9 m, S5/S7 tim dirapatkan + kamera mundur, S6 fov 50 agar 4 atlet + papan skor utuh.
