# STYLE_DECISION — EP75 Son Doong, Gua Raksasa

Style: WORLDFORGE
- Engine: 3D Remotion + React Three Fiber (ENGINE_DECISION.md: remotion default).
- Alasan: topiknya lanskap raksasa yang nyata (hutan karst, mulut gua berkabut, lorong 200 m, doline bercahaya). WORLDFORGE adalah resep dunia sinematik skala nyata dengan matahari rendah, kabut berlapis dan sinar volumetrik — persis yang dibutuhkan untuk berkas cahaya yang jatuh ke hutan di dalam gua. Masuk 17 style unggulan; EP59 Finlandia lolos juri 3.83.
- Alternatif ditolak:
  - SCALEFORGE: pas untuk perbandingan ukuran (747, gedung), tapi look studio bersih kehilangan mood gua berkabut; juri final terakhir 3.33.
  - CHRONICLE (2D): cocok untuk kisah penemuan 1990, tapi lorong 200 m dan berkas cahaya doline jauh lebih kuat dalam 3D.
- Wajib dari motion memory (WORLDFORGE): matahari rendah samping/belakang dengan bayangan panjang, kabut berlapis (FG/MG/BG), finish DOCUMENTARY_WARM, exposure ~1.0, envIntensity 0.55, AO on. Hindari: siang datar, rumput/batu polos tanpa tekstur (pakai normal/bump batu kapur berlapis), subjek kecil di frame kosong (hero ≥ 50% lebar), figur ToyPerson polos (beri headlamp emisif + helm, kontras siluet). Portrait: lebar frame 0,56× tinggi — hitung sebelum menaruh objek. Uap/kabut = sprite lembut, bukan bola transparan. GLB async: advance() setelah model termuat.
- Kit bukan jebakan lingkungan: tiap babak ikut fakta (hutan karst di atas → mulut gua → lorong raksasa → doline hutan → tembok kalsit → kamp wisata → lanskap pagi).
- Dipilih AI sendiri tanpa acc (keputusan pengguna 2026-11-23). Gerbang render final sudah pre-approved pengguna 2026-11-25 (batch 10 short otonom).
- Tanggal: 2026-11-25
- approved: yes (pilihan AI, dilaporkan satu baris)
- Cover referensi: style/cover-reference.jpg (quality-bar worldforge.jpg).
- Cover topik: style/cover-topic.png dirender di Sesi B setelah adegan lorong + doline jadi.
