# STYLE_DECISION — Cara Kerja Mesin X-ray Bagasi Bandara (EP14)

Style: INNERWORKS

- **Tanggal:** 2026-11-23
- **Engine:** Remotion 2D (skill `audira-2d-motion`, SVG/React; bukan R3F)
- **Style terpilih:** `INNERWORKS`
- **Alasan (awam, terkait topik):** mesin X-ray "dibelah" sehingga tabung, sabuk berjalan, dan detektor dua lapisnya terlihat bekerja; pas untuk "cara kerja".
- **Alternatif ditolak:** `BLUEPRINT` — gambar teknik biru monokrom kurang menonjolkan kode warna oranye/hijau/biru; `THERMALFORGE` — memori style: label kontras rendah dan objek terang jadi gumpalan.
- **Cover referensi:** `cover-reference.png` (contoh INNERWORKS EP05 Bola Golf)
- **Cover topik:** `cover-topic.png` (frame hook film)
- **approved:** `yes` (jawaban pengguna "1 INNERWORKS", 2026-11-23)

## Parameter dari motion memory (`audira_style_memory get INNERWORKS`)
- Wajib diterapkan: mekanisme terlihat sejak frame 0 (casing tembus/terpotong, bukan tutup buram); judul hook di plat gelap, satu subjek.
- Parameter terbaik: latar cream-mint terang, aksen oranye + hijau, label pil putih dengan titik warna (cover EP05 Bola Golf).
- Hindari: close-up yang sama setengah film; objek terpotong tepi; HUD di 420 px atas bertabrakan dengan subjek; teks tipis kontras rendah. Dari TUBUH EP33 (2D): kamera diam >30% → drift kamera kontinu tiap adegan; beri gradien/gloss/bayangan kontak agar lighting tidak flat; jangan tumpuk 3 kartu HUD.
