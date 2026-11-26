# STYLE_DECISION — Saat Umar bin Khattab Menangis di Depan Periuk Berisi Air (`EP17`)

Style: HD2D

- **Episode:** sejarah-islam-EP17 (`EP17_SAAT_UMAR_BIN_KHATTAB_MENANGIS_SENDIRIAN`), channel AUDIRA QISSAH
- **Tanggal:** 2026-11-26
- **Engine:** Remotion + React Three Fiber (3D diorama + sprite piksel), basis kode EP04 HD2D (`scenes/mansamusa`) → `src/scenes/umar`
- **Style terpilih:** `HD2D` — sprite piksel 2D di dalam diorama 3D tilt-shift, lentera/api 2400K
- **Alasan (awam, terkait topik):** kisah ini terjadi malam hari, diterangi satu api kecil dan lampu minyak. HD2D paling kuat di cahaya hangat di tengah gelap, dan tokohnya sprite piksel kecil tanpa wajah, jadi adab visual sahabat terjaga. Skor HD2D di topik Islam 4.17 (EP04 Mansa Musa), tertinggi untuk kisah Islam.
- **Alternatif ditolak:** `FILMNOIR` — chiaroscuro cocok untuk malam, tetapi rata-rata juri 3.71 dan figur siluet sering terbaca plastik; `MOSAICFORGE` — utama untuk kisah Islam (3.92), tetapi ubin mosaik membuat adegan malam api unggun kehilangan kehangatan dan hook-nya rawan abstrak (G22).
- **Cover referensi:** `cover-reference.png` (quality-bar HD2D)
- **Cover topik:** `cover-topic.png` (frame hook film: periuk di atas api, sosok berjubah dari belakang) — dirender di Sesi B setelah scaffold
- **approved:** `no`  (gerbang tunggal di tahap 9; style dipilih AI per keputusan pengguna 2026-11-23)

## Parameter dari motion memory (`audira_style_memory get HD2D` + EP04)
- Wajib diterapkan: lantai jangan kosong (isi batu, pasir, jejak, semak); chip HUD jangan terpotong tepi (min 64 px dari tepi); shot top-down jangan memotong subjek di tepi.
- Parameter terbaik (EP04): Finish DOCUMENTARY_WARM, hdri warmStudio, key directional #FFC98A + rim biru #8FA6FF, DOF tilt-shift aperture 0.011–0.023, sprite piksel `pixel.tsx` (voxel bervertex-color, menerima cahaya 3D).
- Hindari: label teks di atas pola ramai tanpa kartu; adegan gelap total (simpan satu sumber cahaya di tiap shot).
