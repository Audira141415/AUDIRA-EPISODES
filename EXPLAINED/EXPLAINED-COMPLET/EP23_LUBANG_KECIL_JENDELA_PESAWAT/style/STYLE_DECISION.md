# STYLE_DECISION — EP23_LUBANG_KECIL_JENDELA_PESAWAT

- **Style terpilih**: `STAINEDGLASS` (kit `F:/AUDIRA-SKILL-MOTION/kits/stainedglass/KIT.md`), diterjemahkan ke pipeline seri HyperFrames + Three.js (`_tools/`).
- **Alasan**: peringkat #1 `audira_recommend_style` (44.0, cocok kata "jendela"). Jendela pesawat adalah tumpukan panel bening yang disinari dari belakang; gaya leadlight membuat tiap lapisan kaca, lubang kecil, dan aliran tekanan terbaca sebagai kaca bercahaya dengan garis timah gelap. Tanpa figur suci; hanya panel, simbol, dan label.
- **Alternatif** (dari `audira_recommend_style`):
  - `GLASSCRAFT` (37.8): ditolak, juri buta EP02 seri ini (kaca jendela) memberi 3.33 karena kaca terbaca datar; topik mirip, hindari pengulangan.
  - `INFLATABLE` (29.6): ditolak, nuansa mainan kurang pas untuk keselamatan kabin.
- **Zero Visual Template**: beda dari EP20 (belum tercatat saat dipilih), EP21 CIRCUITFORGE, EP22 TACTICBOARD; seri ini belum pernah memakai STAINEDGLASS.
- **Motion memory**: DOCUMENTARY_WARM, exposure 0.9, envIntensity 0.3, bloom threshold 0.86, panel emisif dengan came timah gelap, berkas cahaya; kaca harus objek paling terang di frame.
- **Cover referensi**: `style/cover-reference.png` (quality bar kit). Cover topik dibuat di gerbang render.
- **Format**: 9:16, 1080×1920 @ 60 fps final.
- **Tanggal**: 2026-11-14
- **approved: menunggu konfirmasi cover di gerbang render**
