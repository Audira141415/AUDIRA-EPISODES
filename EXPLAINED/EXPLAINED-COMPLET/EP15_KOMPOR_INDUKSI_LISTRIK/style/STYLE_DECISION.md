# STYLE_DECISION — EP15_KOMPOR_INDUKSI_LISTRIK

- **Style terpilih**: `THERMALFORGE` (kit `F:/AUDIRA-SKILL-MOTION/kits/thermalforge/KIT.md`), diterjemahkan ke pipeline seri HyperFrames + Three.js (`_tools/`).
- **Alasan**: inti episode adalah "kacanya tetap dingin, pancinya yang panas". Tampilan kamera termal (ironbow: ungu gelap = dingin, oranye-kuning = panas) membuat perbedaan suhu itu terlihat langsung: kaca ungu, dasar panci menyala oranye, panci aluminium tetap ungu, lalu padam saat kompor dimatikan.
- **Alternatif dari `audira_recommend_style`** (2026-11-14):
  - `INNERWORKS` (peringkat 1 untuk kueri umum "cara kerja"): tidak dipakai. Sudah dipakai EP09, dan sesi paralel EP10–14 kemungkinan besar memakainya; dihindari supaya tidak berulang (Zero Visual Template).
  - `GLASSCRAFT` (peringkat 2 kueri topik): ditolak, kelemahan tercatat (kaca terbaca datar, juri 3.33), dan fokusnya kaca, bukan panas.
  - `CIRCUITFORGE`: cocok untuk arus dan medan, tetapi dipakai EP16 (layar sentuh) di batch yang sama.
- **Zero Visual Template**: EP06–09 = PAPERWORLD, COMICFORGE, PRECISION, INNERWORKS. EP12–14 belum menulis keputusan saat dipilih (dikerjakan paralel); gaya EP15–17 dicatat di catatan bersama sesi supaya EP18 menghindarinya.
- **Memori gaya diterapkan**: ironbow dengan inti panas maksimal oranye-kuning, putih hanya titik kecil; emissive scene diturunkan, bukan bloom; label di pelat gelap solid; tiap beat subjek berbeda (kompor, kumparan, medan, arus pusar, tiga panci, gelombang frekuensi); bagian bawah frame diisi meja hangat, bukan hitam; exposure 1, env 0.55.
- **Cover referensi**: `style/cover-reference.jpg` (quality bar kit). Cover topik belum dibuat (fase SIAP RENDER, nol render).
- **Format**: 9:16, 1080×1920, final 60 fps.
- **Tanggal**: 2026-11-14
- **approved: menunggu konfirmasi cover di gerbang render**
