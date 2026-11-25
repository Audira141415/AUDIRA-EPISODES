# STYLE_DECISION — Kenapa Kita Selalu Melihat Sisi Bulan yang Sama (`EP05`)

- **Tanggal:** `2026-11-23`
- **Engine:** `remotion` (Remotion 4 + React Three Fiber, 3D)
- **Style terpilih:** `SCALEFORGE`
- **Alasan (awam, terkait topik):** Topiknya astronomi: Bumi, Bulan, dan Matahari di ruang angkasa. SCALEFORGE punya bahasa visual "alat ukur sains": Bumi bertekstur, Matahari bercahaya, ruang angkasa gelap, penggaris oranye, dan kartu HUD angka. Itu pas untuk menjelaskan angka kunci (27,3 hari, 59%, 3,8 cm/tahun) dengan diagram orbit yang terbaca tanpa suara.
- **Skor rekomendasi (G3):** SCALEFORGE 55,2 (topik astronomi 33) vs WORLDFORGE 43,7 vs SATELLITEBRIEFING 42,2. SCALEFORGE dipilih karena ia satu-satunya kandidat yang kitnya sudah membawa Bumi, Matahari, dan transisi studio ke ruang angkasa.
- **Alternatif ditolak:** `WORLDFORGE`: setnya diorama peradaban/kota di planet, bukan mekanika orbit. `SATELLITEBRIEFING`: estetika intel/OSINT berwarna abu dingin dan zoom ke target darat, tidak cocok untuk edukasi anak dan pelajar. `CERDIK` (unggulan): dunianya hanya desa/pasar/pantai/rumah/istana, tidak punya set luar angkasa.
- **Hukum Mutlak 5:** dari kit diambil material (tekstur Bumi/Matahari, glow), palet, HUD penggaris, dan grade APPLE_STUDIO_CLEAN. Zoom logaritmik kontinu milik kit TIDAK dipakai sebagai struktur film. Film memakai 6 adegan sesuai naskah: Bulan purnama, deretan malam, diagram orbit atas, Bulan lonjong ditarik gravitasi, sisi jauh disinari plus misi, lalu Bumi dan Bulan saat outro.
- **Cover referensi:** `F:/AUDIRA-ALL-SKILL/assets/style-covers/scaleforge.png`
- **Cover topik:** `cover-topic.png` (dari komposisi film, frame hook) · framing di `cover.json`
- **approved:** `yes` (style dipilih AI dan dilaporkan, aturan 2026-11-23; acc pengguna hanya di gerbang render final)

## Parameter dari motion memory (`audira_style_memory get SCALEFORGE`)
- Wajib diterapkan: `<Finish profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1} envIntensity={0.55} ao={false} />`. Teks informasi lewat `SafeLabel` ≥ 36 px, bukan di baris overlay 15–30 px.
- Parameter terbaik: APPLE_STUDIO_CLEAN, exposure 1, envIntensity 0.55, ao off.
- Hindari: zoom 7–11 dekade dalam ~2 dtk (frame putih/hitam). Hindari juga ukuran tanpa sumber dan jarak tidak sebanding yang tidak diberi catatan. Catatan "jarak tidak sebanding" wajib terbaca.

## Catatan teknis
- Folder `kits/scaleforge/project/` di AUDIRA-SKILL-MOTION ternyata berisi proyek BONGKAR (salah kemas). Karena itu `new-project.mjs --kit=scaleforge` menghasilkan proyek BONGKAR. Proyek episode ini disalin dari `starter/` (kit ada di `starter/src/kits/scaleforge`).
