# STYLE_DECISION — EP10_REM_ABS_KENDARAAN

- **Style terpilih**: `LIDARFORGE` (kit `F:/AUDIRA-SKILL-MOTION/kits/lidarforge/KIT.md`), diterjemahkan ke pipeline seri HyperFrames + Three.js (`_tools/`).
- **Alasan**: ABS adalah sistem sensor: ia "membaca" putaran roda puluhan kali per detik. Dunia point cloud (mobil, jalan basah, roda) dengan warna titik yang berubah sesuai kecepatan roda (hijau berputar, merah terkunci) membuat data sensor itu terlihat, dan grafik HUD membuat siklus lepas-tekan 15 kali per detik terbaca.
- **Sumber rekomendasi**: `audira_recommend_style` peringkat #1 adalah `INNERWORKS` (44.1), tetapi dipakai EP09 (episode tepat sebelumnya) → dilewati (Zero Visual Template). Diambil peringkat berikutnya `LIDARFORGE` (41.3; topik "sensor", skor 4.00).
- **Alternatif yang dipertimbangkan**:
  - `INNERWORKS`: ditolak, dipakai EP09.
  - `ANATOMIX` (35.3): ditolak, gaya organ/biologi, tidak cocok untuk sistem rem.
  - `THERMALFORGE` (34.4): ditolak, panas bukan inti cara kerja ABS; kelemahan tercatat (blob terang di bawah caption).
- **Zero Visual Template**: 3 episode sebelumnya EP07 COMICFORGE, EP08 PRECISION, EP09 INNERWORKS.
- **Motion memory diterapkan**: finish CYBER_NEON_VOID (exposure 1, environment 0.55, tanpa AO); palet dibedakan dari LIDARFORGE sebelumnya (indigo malam, cyan bodi, amber jalan, coral laser/roda terkunci); dunia nyata (mobil di jalan) dulu, lalu dikupas jadi diagram sistem; tidak ada `require` di render (pipeline HyperFrames, impor di atas file).
- **Cover referensi**: `style/cover-reference.jpg` (cover kit LIDARFORGE). Cover topik belum dibuat (fase SIAP RENDER, nol render).
- **Format**: 9:16, 1080×1920 @ 60 fps final.
- **Tanggal**: 2026-11-14
- **approved: menunggu konfirmasi cover di gerbang render**
