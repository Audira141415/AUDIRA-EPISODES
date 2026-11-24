# STYLE_DECISION — Kenapa Laut Dalam Lebih Misterius dari Luar Angkasa (`EP09`)

Style: ABYSSFORGE

- **Tanggal:** `2026-11-25`
- **Engine:** `remotion` (Remotion 4 + React Three Fiber, 3D)
- **Style terpilih:** `ABYSSFORGE`
- **Alasan (awam, terkait topik):** Topiknya menyelam dari permukaan ke dasar Palung Mariana. ABYSSFORGE adalah resep "laut dalam": kolom air yang makin gelap per zona, salju laut, makhluk bercahaya (bioluminesensi), dan ikan pemancing dengan lampu. Penonton bisa merasakan cahaya hilang dan tekanan naik tanpa suara.
- **Skor memori:** juri draf ABYSSFORGE terakhir 4,0 (fakta-dunia-EP02, lolos putaran 2); ceiling terlemah depth 3,3 — dijaga dengan kabut berlapis + salju laut FG + subjek MG.
- **Alternatif ditolak:** `TERRARIUM` (dunia dalam kaca, cocok ekosistem kecil, tapi tidak bisa menunjukkan kedalaman 11 km dan kegelapan total). `SCALEFORGE` (sudah dipakai EP05 untuk ruang angkasa; bagus untuk perbandingan skala, tapi palet studio terang melawan mood laut gelap). Perbandingan skala Everest vs Palung tetap dipinjam sebagai satu adegan.
- **Hukum Mutlak 5:** dari kit diambil palet kolom air (teal → hitam), material lumen/bell, tekstur god-ray, post ABYSS (kontras, vignette, grain) dan nama zona. Struktur film BUKAN satu turunan 12 dtk milik kit: film memakai 7 adegan sesuai naskah (Bulan vs laut, permukaan & 71%, turun per zona, tekanan, palung vs Everest, kenapa sulit dipetakan, makhluk bercahaya, outro).
- **Cover referensi:** `style/cover-reference.png`
- **Cover topik:** `style/cover-topic.png` (frame hook film)
- **approved:** `yes` (style dipilih AI dan dilaporkan, aturan 2026-11-23; acc pengguna untuk render final sudah diberikan lebih dulu 2026-11-25, batch 10 short otonom)

## Parameter dari motion memory (`audira_style_memory get ABYSSFORGE`)
- `<Finish profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1.15} envIntensity={0.35} ao />` (remotion).
- Glow hanya lewat emissive + bloom; objek hard-surface (kapal selam) jangan terlihat kotak.
- Cek framing dengan proyeksi sebelum menulis kamera.
