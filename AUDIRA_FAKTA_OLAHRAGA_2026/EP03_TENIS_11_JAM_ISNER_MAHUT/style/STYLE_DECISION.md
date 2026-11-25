# STYLE_DECISION — Tenis 11 Jam: Isner vs Mahut, Wimbledon 2010 (`EP03`)

> ✅ Gerbang tahap 3. Cover = quality-bar penilaian skor.

- **Tanggal:** `2026-11-22`
- **Engine:** Remotion + R3F (studio bersama `AUDIRA_FAKTA_OLAHRAGA_2026/studio`, kode `src/scenes/ep03/`)
- **Style terpilih:** `BROADCASTFORGE` (dipilih pengguna 2026-11-22)
- **Alasan (awam, terkait topik):** cerita ini tentang angka yang terus bertambah sampai papan skor lapangan macet di 47–47. Grafis siaran TV (LIVE bug, score bug, ticker, jam durasi) adalah bahasa visual yang paling langsung untuk skor 70–68 dan durasi 11 jam 5 menit. Kit dipakai sebagai resep grafis + pencahayaan, bukan studio berita: lingkungannya lapangan rumput Court 18 saat senja (hari ke-2 dihentikan karena gelap).
- **Alternatif ditolak:** `TACTICBOARD` — skor topik tertinggi, tapi bahasa papan taktik kurang kuat untuk momen papan skor macet; `TIMEFORGE` — kuat untuk durasi, tapi riwayat juri menurunkan komposisi karena set diorama berulang.
- **Cover referensi:** `cover-reference.jpg` (kit quality-bar)
- **Cover topik:** `cover-topic.png` = variasi A (Isner servis dari belakang, judul "11 JAM"), frame hook film; B ditolak (wide telephoto "70–68"). Framing di `cover.json`, kamera `SHOT_A` di `src/scenes/ep03/Cover.tsx`.
- **approved:** `yes` — pengguna acc cover A ("11 JAM") 2026-11-22

## Parameter dari motion memory (`audira_style_memory get BROADCASTFORGE`)
- Wajib diterapkan: grafis siaran sebagai komponen HTML per babak (pola gold berita-viral-10-nov-EP01); still dirender dari komposisi 1080×1920, bukan preview.
- Parameter terbaik: exposure 1.0–1.05, envIntensity ~0.4–0.55, hdri studio/sky.
- Hindari: kamera statis di dalam scene (juri −1 motion) → dolly/pan pelan per scene; dua ticker bertumpuk yang masuk safe zone bawah; rim light tunggal di belakang subjek (pakai rim samping / matahari senja).
- Kelemahan terukur: depth (ceiling 3.38) → lapisan BG (langit senja, tribun GLB, dinding) / MG (net, lawan) / FG (pemain, grafis) + kabut.

## Aturan seri yang berlaku
- Tokoh nyata = figur stilasi (ToyPerson), tanpa wajah realistis, tanpa logo Wimbledon/sponsor.
- Label ≥ 34 px, satu subjek utama per frame, grafis tidak menutupi subjek.
- Brand AUDIRA ada di dalam adegan (papan dinding lapangan).
