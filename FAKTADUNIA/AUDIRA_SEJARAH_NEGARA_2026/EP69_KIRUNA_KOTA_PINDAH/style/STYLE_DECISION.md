# STYLE_DECISION — EP69 Kiruna, Kota yang Dipindah karena Tambang

Style: HD2D
- Engine: Remotion + R3F (3D), hero GLB `clapboard-church-03a6f5` (recolor merah Falu), sprite pixel warga sebagai billboard.
- Alasan: diorama kota kayu mini dengan tilt-shift membuat "satu kota dipindah" terbaca seperti miniatur di atas meja; gereja merah di atas trailer menjadi gambar kunci yang langsung kebaca di HP.
- Alternatif ditolak:
  - TOYDIORAMA: cocok untuk kota mainan, tapi kurang punya cahaya dramatis dual-temperature dan sprite warga yang memberi skala manusia di sebelah gereja 35 m.
  - SCALEFORGE: kuat untuk perbandingan ukuran, tapi lemah untuk alur cerita kota → tambang → perjalanan.
- Di luar 17 style unggulan sesuai brief sesi induk (5 topik FAKTADUNIA baru, style non-unggulan).
- Kelemahan memori HD2D yang wajib ditambal: depth (ceiling terukur 2.5), sepertiga bawah keruh di adegan malam, fakta-olahraga-EP08 juri 3.33 (readability: frame tanpa subjek yang cocok VO). Perbaikan: tekstur batu/kayu map+bump 0.5, apron lebih terang, lampu hangat di prop FG, tilt-shift aperture 0.006, adegan utama di siang/sore Agustus (bukan malam), THEME_CHECK per frame (G22).
- Dipilih AI sendiri tanpa acc (keputusan pengguna 2026-11-23). Acc hanya di gerbang render final.
- Tanggal: 2026-11-24
- approved: yes (pilihan AI, dilaporkan satu baris)
- Cover referensi: `style/cover-reference.png` (quality-bar hd2d). Cover topik: `style/cover-topic.png` dirender di sesi B setelah scaffold (tahap 5–7), sebelum VO tidak ada render MP4.
