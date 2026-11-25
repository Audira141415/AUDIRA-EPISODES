# STYLE_DECISION — EP16_LAYAR_SENTUH_HP

- **Style terpilih**: `CIRCUITFORGE` (kit `F:/AUDIRA-SKILL-MOTION/kits/circuitforge/KIT.md`), diterjemahkan ke pipeline seri HyperFrames + Three.js (`_tools/`).
- **Alasan**: layar sentuh kapasitif adalah jaring sirkuit: baris dan kolom penghantar, kapasitor di tiap persilangan, chip pengendali yang memindai denyut tegangan. Gaya papan sirkuit (solder mask hijau, jalur emas, denyut listrik amber dan cyan) membuat jaring yang "tidak terlihat mata" itu tampil dan bisa diikuti.
- **Alternatif dari `audira_recommend_style`** (2026-11-14, peringkat):
  1. `CIRCUITFORGE` (44.3): dipilih.
  2. `INNERWORKS` (44.1): tidak dipakai; sudah EP09 dan kemungkinan dipakai EP10–14 yang dikerjakan paralel.
  3. `LIDARFORGE` (41.3): ditolak, kesannya pemindaian laser/peta, bukan sentuhan listrik.
- **Zero Visual Template**: 3 episode sebelumnya EP13, EP14 (belum menulis keputusan saat dipilih, paralel) dan EP15 = THERMALFORGE. CIRCUITFORGE berbeda dari semua gaya yang tercatat di seri.
- **Memori gaya diterapkan**: environment map untuk semua logam (PMREM dari ruang cahaya buatan, environmentIntensity 0.6) supaya emas dan logam tidak hitam; kamera dilebarkan (papan selebar ±5 unit butuh jarak ≥ 12 pada FOV 38); kontras hangat (rim amber) di atas solder mask gelap.
- **Cover referensi**: `style/cover-reference.jpg` (quality bar kit). Cover topik belum dibuat (fase SIAP RENDER, nol render).
- **Format**: 9:16, 1080×1920, final 60 fps.
- **Tanggal**: 2026-11-14
- **approved: menunggu konfirmasi cover di gerbang render**
