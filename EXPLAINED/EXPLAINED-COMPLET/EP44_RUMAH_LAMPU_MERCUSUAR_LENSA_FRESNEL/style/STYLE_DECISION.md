# STYLE_DECISION — EP44_RUMAH_LAMPU_MERCUSUAR_LENSA_FRESNEL

- **Style terpilih**: `GLASSCRAFT` (kit `F:/AUDIRA-SKILL-MOTION/kits/glasscraft/KIT.md`), diterjemahkan ke pipeline seri HyperFrames + Three.js (`_tools/`).
- **Alasan**: tokoh utamanya kaca: lensa Fresnel, cincin bertingkat, dan prisma yang membelokkan cahaya. Gaya kaca bening dengan pembiasan nyata, pantulan tepi, dan cahaya prisma membuat cara kerja lensa terbaca tanpa suara.
- **Sumber**: `audira_recommend_style` peringkat #1 (skor 55.8: kaca, prisma).
- **Alternatif yang dipertimbangkan**:
  - `STAINEDGLASS` (#2, 51): ditolak, dipakai EP39 (3 episode sebelumnya), Zero Visual Template.
  - `BUILDFORGE` (#3, 41.2): ditolak, fokus konstruksi; topiknya optik, bukan bangunan.
- **Zero Visual Template**: 3 episode sebelumnya EP40, EP42 (belum memilih saat keputusan ini, 2026-11-14) dan EP43 `ABYSSFORGE`; GLASSCRAFT belum dipakai di seri ini.
- **Motion memory diterapkan** (termasuk "hindari" dari EP02 Cara Pembuatan, juri 3.33): kaca hero memakai material transmisif sungguhan (MeshPhysicalMaterial transmission, IOR 1.5, thickness, clearcoat), bukan panel emisif datar; satu key light directional tegas + rim cyan/magenta; tiap kaca hero punya backplate berwarna di belakangnya (cakram bulan amber, lampu mercusuar); kaki figur tidak terpotong; exposure 1.0, envIntensity 0.55.
- **Cover referensi**: `style/cover-reference.jpg` (quality bar kit). Cover topik: belum (dikerjakan di gerbang render).
- **Format**: 9:16, 1080×1920, final @ 60 fps.
- **Tanggal**: 2026-11-14
- **approved: menunggu konfirmasi cover di gerbang render**
