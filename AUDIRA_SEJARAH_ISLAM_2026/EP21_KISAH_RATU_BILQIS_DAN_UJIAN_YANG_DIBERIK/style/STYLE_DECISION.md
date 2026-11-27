# STYLE_DECISION — Kisah Ratu Bilqis dan Ujian yang Diberikan Nabi Sulaiman (`EP21`)

Style: HD2D

- **Episode:** sejarah-islam-EP21 (`EP21_KISAH_RATU_BILQIS_DAN_UJIAN_YANG_DIBERIK`), channel AUDIRA QISSAH
- **Tanggal:** 2026-11-27
- **Engine:** Remotion + React Three Fiber (3D diorama + sprite piksel), basis kode EP20 HD2D (`scenes/yusuf`) dan EP17 (`scenes/umar`) → `src/scenes/bilqis`
- **Style terpilih:** `HD2D` — sprite piksel 2D di dalam diorama 3D tilt-shift, cahaya per set (fajar Saba, obor majelis, kilau kaca biru)
- **Alasan (awam, terkait topik):** inti kisah ini adalah lantai kaca yang terlihat seperti air. Diorama 3D bisa memantulkan cahaya dan riak air sungguhan di bawah kaca, sesuatu yang lemah di ilustrasi datar. Tokohnya sprite piksel kecil berkerudung tanpa wajah, jadi adab visual Nabi Sulaiman dan sang ratu terjaga. Juri HD2D di kisah Islam terakhir (EP17 Umar) 4.33 di draf, dan kode set + sprite EP17/EP20 bisa dipakai ulang.
- **Alternatif ditolak:** `ISLAMICDOCUMENTARY` (2D) — skor topik tinggi di recommender, tetapi rata-rata juri 3.59 dan dua kali gagal di kisah tanpa figur; efek kaca-air jadi datar. `WORLDFORGE` (3D) — dunia luas cocok untuk peta Saba ke Syam, tetapi kisah ini banyak ruang dalam (majelis, aula singgasana, istana kaca) dan WORLDFORGE lemah di interior.
- **Cover referensi:** `cover-reference.png` (quality-bar HD2D, `F:/AUDIRA-ALL-SKILL/assets/style-covers/hd2d.png`)
- **Cover topik:** `cover-topic.png` (frame hook film: lorong istana kaca di atas air mengalir, sosok ratu berkerudung dari belakang menyingkap ujung jubah) — dirender di Sesi B setelah scaffold, sama seperti EP17/EP20
- **approved:** `no`  (gerbang tunggal di tahap 9; style dipilih AI per keputusan pengguna 2026-11-23)

## Parameter dari motion memory (`audira_style_memory get HD2D`)
- Wajib diterapkan: tekstur seeded map+bump untuk batu/kayu/pasir; backer outline pucat di belakang sprite; tilt-shift aperture 0.006 / maxBlur 0.03; vignette + scrim atas/bawah; FG diberi practical hangat (sepertiga bawah tidak keruh); suhu cahaya beda tiap set; audit rig kamera per segmen (`draft/rig-audit.json`) karena film ber-hard-cut.
- Parameter terbaik: Finish DOCUMENTARY_WARM, exposure 1, envIntensity 0.55, AO, hdri warmStudio, key #FFC98A + rim #8FA6FF.
- Hindari: hero prosedural yang terbaca plastik (singgasana dan peti pakai GLB), punggung sprite gumpal hitam (fill dari arah kamera 0.9), subjek terpotong tepi di frame kunci, set yang sama di > 2 frame contact sheet, chip HUD terpotong (min 64 px dari tepi), lantai kosong.
- Khusus EP21: lantai kaca = `MeshPhysicalMaterial` transmission/clearcoat di atas bidang air bergerak (normal map seeded bergulir) dan ikan kecil; kaca harus terbaca "air" di frame hook (G22).
- Pelajaran EP17 untuk Sesi B: stem SFX `TARGET_LUFS = -28` (G18c gap ≥ 12 LU), outro `<AudiraOutro code="QISSAH" />` + `node scripts/channel.mjs --check`, look.json crush ≤ 2% / clipHi 0 / diversity ≥ 30, separasi subjek set malam (rim/haze).
