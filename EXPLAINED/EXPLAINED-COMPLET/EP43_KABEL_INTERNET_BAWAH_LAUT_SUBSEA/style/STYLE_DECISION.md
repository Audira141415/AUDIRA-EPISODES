# STYLE_DECISION — EP43_KABEL_INTERNET_BAWAH_LAUT_SUBSEA

- **Style terpilih**: `ABYSSFORGE` (kit `F:/AUDIRA-SKILL-MOTION/kits/abyssforge/KIT.md`), diterjemahkan ke pipeline seri HyperFrames + Three.js (`_tools/`).
- **Alasan**: kabelnya berbaring di dasar laut dalam yang gelap; dunia laut dalam dengan salju laut, kabut biru-tinta, dan cahaya hidup (bloom hanya pada cahaya) membuat kedipan laser di serat kaca dan repeater yang "menyala" kembali terbaca sebagai satu-satunya cahaya di kegelapan.
- **Sumber**: `audira_recommend_style` peringkat #1 (skor 71.7: samudra, laut, palung).
- **Alternatif yang dipertimbangkan**:
  - `GLITCHFORGE` (#2, 49.3): ditolak, menekankan dunia digital/eror; topik ini fisik (kabel di dasar laut).
  - `LIDARFORGE` (#3, 41.3): ditolak, cocok kata "laser" saja; ada crash render tercatat di memori.
- **Zero Visual Template**: 3 episode sebelumnya EP39 `STAINEDGLASS`, EP40 dan EP42 belum memilih saat keputusan ini (2026-11-14, dicek tepat sebelum memilih); ABYSSFORGE tidak dipakai di seri ini.
- **Motion memory diterapkan**: wajib — glow hanya pada cahaya hidup (laser, repeater, lampu kapal), exposure ±1.15, envIntensity 0.35, objek hard-surface (repeater, jangkar, lambung kapal) diberi bevel; kamera turun kontinu (kedalaman = jam).
- **Cover referensi**: `style/cover-reference.png` (quality bar kit). Cover topik: belum (dikerjakan di gerbang render).
- **Format**: 9:16, 1080×1920, final @ 60 fps.
- **Tanggal**: 2026-11-14
- **approved: menunggu konfirmasi cover di gerbang render**
