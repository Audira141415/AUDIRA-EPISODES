# STYLE_DECISION — Detik-Detik Nabi Yusuf Memaafkan Saudara-Saudaranya (`EP20`)

Style: HD2D

- **Episode:** sejarah-islam-EP20 (`EP20_DETIK_DETIK_NABI_YUSUF_MEMAFKAN_SAUDARA`), channel AUDIRA QISSAH
- **Tanggal:** 2026-11-27
- **Engine:** Remotion + React Three Fiber (3D diorama + sprite piksel), basis kode EP17 HD2D (`scenes/umar`) → `src/scenes/yusuf`
- **Style terpilih:** `HD2D` — sprite piksel 2D di dalam diorama 3D tilt-shift, cahaya lampu/obor hangat vs malam biru
- **Alasan (awam, terkait topik):** kisah ini berpindah dari mimpi malam, gudang ber-obor, aula istana, sampai fajar. HD2D paling kuat memainkan cahaya per adegan, dan tokohnya sprite piksel kecil berkerudung tanpa wajah, jadi adab visual para nabi terjaga. Skor juri HD2D di episode Islam terakhir (EP17 Umar) 4.33 di draf, tertinggi untuk kisah Islam saat ini; kode set dan sprite EP17 bisa dipakai ulang.
- **Alternatif ditolak:** `ISLAMICDOCUMENTARY` — skor topik tertinggi di recommender (51.5), tetapi rata-rata juri 3.59 dan dua kali gagal di kisah satu lokasi tanpa figur (EP23, EP25); kisah ini banyak adegan ruang tertutup. `MOSAICFORGE` — ubin mosaik cocok untuk peradaban Islam, tetapi adegan emosional (pengungkapan, maaf) butuh cahaya dan figur, bukan pola.
- **Cover referensi:** `cover-reference.png` (quality-bar HD2D, `F:/AUDIRA-ALL-SKILL/assets/style-covers/hd2d.png`)
- **Cover topik:** `cover-topic.png` (frame hook film: aula istana malam, sosok berjubah di singgasana dari belakang, sebelas bayangan memanjang) — dirender di Sesi B setelah scaffold, sama seperti EP17
- **approved:** `no`  (gerbang tunggal di tahap 9; style dipilih AI per keputusan pengguna 2026-11-23)

## Parameter dari motion memory (`audira_style_memory get HD2D`)
- Wajib diterapkan: tekstur seeded map+bump untuk batu/kayu; backer outline pucat di belakang sprite; tilt-shift aperture 0.006 / maxBlur 0.03; vignette + scrim atas/bawah; FG diberi practical hangat (sepertiga bawah tidak keruh); suhu cahaya beda tiap set malam (bulan biru vs lampu hangat); audit rig kamera per segmen (draft/rig-audit.json) karena film ber-hard-cut.
- Parameter terbaik: Finish DOCUMENTARY_WARM, exposure 1, envIntensity 0.55, AO, hdri warmStudio, key #FFC98A + rim #8FA6FF.
- Hindari: hero prosedural yang terbaca plastik (pakai GLB karung/piala), punggung sprite gumpal hitam (fill dari arah kamera 0.9), subjek terpotong tepi di frame kunci, set yang sama di > 2 frame contact sheet, chip HUD terpotong (min 64 px dari tepi), lantai kosong.
- Pelajaran EP17 untuk Sesi B: stem SFX `TARGET_LUFS = -28` (G18c gap ≥ 12 LU), outro `<AudiraOutro code="QISSAH" />` + `node scripts/channel.mjs --check`, look.json crush ≤ 2% / clipHi 0 / diversity ≥ 30, audit separasi set malam sebelum juri.
