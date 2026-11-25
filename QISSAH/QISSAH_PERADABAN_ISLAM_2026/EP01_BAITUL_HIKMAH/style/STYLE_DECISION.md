# STYLE_DECISION — `BAITUL_HIKMAH` (`EP01`)

> ✅ Gerbang tahap 3.

- **Tanggal:** 2026-11-17
- **Engine:** Remotion (Remotion 4 + React Three Fiber, rule 14)
- **Style terpilih:** `MANUSCRIPT`
- **Alasan:** Baitul Hikmah = perpustakaan, naskah, gulungan, terjemahan. MANUSCRIPT punya bahasa visual parchment, huruf emas, tekstur kertas serat — semuanya IS Baitul Hikmah. GOLD episode (sejarah-islam-EP02, jury 4.67).
- **Alternatif ditolak:** `ISLAMICDOCUMENTARY` — skor topic match tinggi (86.5) tapi composition ceiling rendah (2.5–3), belum ada GOLD, visual terlalu generik untuk tema perpustakaan
- **Cover referensi:** `cover-reference.png`
- **Cover topik:** `cover-topic.png` (dari komposisi film, frame hook) · framing di `cover.json`
- **approved:** `yes`

## Parameter dari motion memory (`audira_style_memory get MANUSCRIPT`)
- Wajib diterapkan: DOCUMENTARY_WARM, exposure 0.9, envIntensity 0.35, AO on, canvas paper texture with fibres, warm candle key with low bloom, gold letters with dark ink edge, walnut desk + wax seal for brand
- Parameter terbaik: finishProfile DOCUMENTARY_WARM, exposure 0.9, envIntensity 0.35, ao true
- Hindari: >6 label kecil sekaligus; satu hero per frame (>= 50% lebar frame, satu label >= 40px); label dan tiles jangan menutupi teks, jangan keluar frame
