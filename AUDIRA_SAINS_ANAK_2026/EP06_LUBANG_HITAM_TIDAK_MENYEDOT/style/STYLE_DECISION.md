# STYLE_DECISION — Lubang Hitam Tidak Menyedot (`EP06`)

Style: SCALEFORGE

- **Tanggal:** `2026-11-25`
- **Engine:** `remotion` (Remotion 4 + React Three Fiber, 3D)
- **Style terpilih:** `SCALEFORGE`
- **Alasan (awam, terkait topik):** Inti ceritanya soal ukuran dan jarak: Matahari "dipadatkan" jadi bola selebar 6 km, Bumi tetap di orbitnya, bintang S2 mengitari raksasa 4 juta Matahari. SCALEFORGE adalah bahasa visual "alat ukur sains" di ruang angkasa gelap: Bumi dan Matahari bertekstur, penggaris oranye, kartu HUD angka. Itu pas untuk membuktikan "tidak menyedot" lewat perbandingan skala yang terbaca tanpa suara.
- **Skor rekomendasi (G3):** BONGKAR 40,8 (topik 0, kualitas tinggi), SCALEFORGE 39,8 (topik astronomi 22, kategori science), PANELVERSE 38. Ranking override: BONGKAR adalah teardown benda sehari-hari di studio, tidak punya set luar angkasa.
- **Alternatif ditolak:** `ABYSSFORGE` (saran bank topik): set laut dalam/CYBER_NEON_VOID, terbukti untuk kabel bawah laut; mood-nya horor gelap, kurang ramah anak dan tidak membawa Bumi/Matahari. `WORLDFORGE` (unggulan): diorama peradaban di planet, bukan mekanika gravitasi. `BONGKAR` (unggulan, skor teratas): studio teardown, tidak cocok untuk ruang angkasa.
- **Hukum Mutlak 5:** dari kit diambil material (tekstur Bumi/Matahari, glow), palet oranye/biru, HUD penggaris, dan grade APPLE_STUDIO_CLEAN. Film memakai 7 adegan sesuai naskah (lubang hitam + cakram, bintang dipadatkan, tukar Matahari, horizon + spagetifikasi, cakram akresi, Sgr A* + S2, outro), bukan zoom logaritmik kit.
- **Cover referensi:** `F:/AUDIRA-ALL-SKILL/assets/style-covers/scaleforge.png`
- **Cover topik:** `cover-topic.png` (frame hook dari film)
- **approved:** `yes` (style dipilih AI dan dilaporkan, aturan 2026-11-23; acc render final sudah diberikan lebih dulu oleh pengguna 2026-11-25, batch 10 short otonom)

## Parameter dari motion memory (`audira_style_memory get SCALEFORGE`)
- Wajib: `<Finish profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1} envIntensity={0.55} ao={false} />` (lewat FilmScene, sama seperti EP05).
- Kelemahan tercatat (EP05): permukaan prosedural terbaca plastik di cahaya rata; fill tinggi terasa datar; fragmen kata terpotong di tepi frame; SERIES.json proyek harus akun @AudiraSains. Penerapan: fill rendah + cahaya samping, subjek hero lubang hitam bercahaya sendiri (emissive), kartu teks diberi maxWidth, SERIES.json proyek dicek.
- Teks informasi lewat `SafeLabel` ≥ 36 px.
