# STYLE_DECISION — Susi Susanti, emas Olimpiade pertama Indonesia (Barcelona 1992) (`EP01`)

> ✅ Gerbang tahap 3. Cover = quality-bar penilaian skor.

- **Tanggal:** `2026-11-22`
- **Engine:** Remotion (kit PIXELSTORY: pixel art 2.5D, relight CPU, tanpa WebGL), studio seri `AUDIRA_FAKTA_OLAHRAGA_2026/studio`
- **Style terpilih:** `PIXELSTORY` (dipilih pengguna 2026-11-22)
- **Alasan (awam, terkait topik):** Gaya game retro yang sezaman dengan 1992; comeback 5–11 → 11–5, 11–3 bisa dibaca seperti "naik level", dengan papan skor ala arcade dan arena malam yang dramatis.
- **Alternatif ditolak:** `TACTICBOARD` — rekomendasi utama (taktik reli panjang), tidak dipilih pengguna; `TIMEFORGE` — kuat untuk podium/diorama tapi lemah untuk adegan pertandingan, komposisi sering ramai.
- **Cover referensi:** `candidates/2-pixelstory.jpg` (salinan `F:/AUDIRA-ALL-SKILL/assets/style-covers/pixelstory.jpg`)
- **Cover topik:** `cover-topic.png` (komposisi `Ep01Cover`, `studio/src/scenes/ep01/Cover.tsx`; set + teks di `ArenaShot.tsx` sehingga film dibuka tepat di frame ini)
- **approved:** `yes` (pengguna: "Acc cover", 2026-11-22)

## Parameter dari motion memory (`audira_style_memory` PIXELSTORY, juri 3.79)
- Wajib diterapkan (kelemahan EP45): stamp/caption tidak boleh menutupi subjek; lebar stamp ≤ 860 px tanpa rotasi pada adegan aksi; sprite pemain di wide shot scale ≥ 1.4; prop bertulisan tidak boleh terpotong frame; label ≥ 34 px.
- Parameter terbaik (dari EP45): satu cahaya dominan (spot atas) + rim dingin kanan atas; ambient 0.11–0.12; exposure 1.1; dither 0.45; Layer z 1500/1000/620; Grade + Vignette 0.6 + Grain.
- Hindari: deretan objek setara tanpa hero; teks di 380 px bawah; frame cover (≤2 dtk) dengan objek terpotong di zona bawah.

## Cover topik (look development)
- Satu hero: pemain Indonesia generik tampak belakang di puncak jump smash (tanpa wajah, tanpa logo), kostum putih dengan pita merah di bahu.
- Lawan kecil di lapangan seberang (kostum merah, tanpa wajah), kok di atas raket.
- Bendera merah-putih di tribun; AUDIRA di papan iklan arena (brand di dalam adegan).
- Teks: kicker `FAKTA OLAHRAGA #01` 34 px, judul `KALAH DULU, / LALU EMAS`, chip `EMAS PERTAMA INDONESIA` dan `BARCELONA 1992` 34 px; semua di atas hero, tidak ada teks di 380 px bawah.
