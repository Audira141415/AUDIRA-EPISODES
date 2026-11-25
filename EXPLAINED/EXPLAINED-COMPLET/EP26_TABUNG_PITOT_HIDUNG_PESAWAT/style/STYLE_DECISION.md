# STYLE_DECISION — EP26_TABUNG_PITOT_HIDUNG_PESAWAT

- **Style terpilih**: `INFLATABLE` (kit `F:/AUDIRA-SKILL-MOTION/kits/inflatable/KIT.md`), diterjemahkan ke pipeline seri HyperFrames + Three.js (`_tools/`).
- **Alasan**: peringkat #1 `audira_recommend_style` (43.6, cocok kata "udara", "tekanan"). Tabung pitot bekerja lewat tekanan udara yang masuk dan terhenti; gaya inflatable membuat tabung, angin, dan tekanan terbaca sebagai benda gemuk yang mengembung saat terisi tekanan, mengempis saat kosong. Kontras visual antara udara yang menabrak (mengembung) dan udara statis (kempes) langsung terlihat.
- **Alternatif** (dari `audira_recommend_style`):
  - `MANUSCRIPT` (#2, 29.0): skor tinggi (4.05, gold), tapi nuansa naskah kuno kurang pas untuk instrumen penerbangan modern.
  - `FELTCRAFT` (#3, 27.8): edukasi ramah, tapi kurang cocok untuk topik teknis penerbangan.
- **Zero Visual Template**: 3 episode sebelumnya EP23 `STAINEDGLASS`, EP24 `KINTSUGI`, EP25 `THERMALFORGE`; seri ini belum pernah memakai INFLATABLE.
- **Motion memory**: hook frames harus langsung terbaca sebagai objek (bukan blob abstrak), hindari flat star tanpa shading dan huruf datar di zona bawah 380 px. Buka dengan mainan yang sudah terbaca sebagai mainan.
- **Cover referensi**: `style/cover-reference.jpg` (quality bar kit). Cover topik dibuat di gerbang render.
- **Format**: 9:16, 1080×1920 @ 60 fps final.
- **Tanggal**: 2026-11-14
- **approved: menunggu konfirmasi cover di gerbang render**
