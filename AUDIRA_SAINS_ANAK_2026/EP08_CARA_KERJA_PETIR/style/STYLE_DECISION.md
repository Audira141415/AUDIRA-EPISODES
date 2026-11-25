# STYLE_DECISION — Cara Kerja Petir: Awan ke Tanah dalam 1/100 Detik (`EP08`)

Style: DISASTERSIM

- **Tanggal:** `2026-11-25`
- **Engine:** `remotion` (Remotion 4 + React Three Fiber, 3D)
- **Style terpilih:** `DISASTERSIM`
- **Alasan (awam):** Petir adalah fenomena cuaca/geohazard. DISASTERSIM punya bahasa "lab simulasi bencana": potongan penampang (cutaway awan badai), cincin gelombang (gelombang suara guntur), HUD angka, palet peringatan, dan nada tenang-edukatif tanpa sensasi. Pas untuk menjelaskan muatan di awan, leader, return stroke, dan guntur secara terbaca.
- **Skor rekomendasi (G3):** NEGERI 56 (topik 18, format seri "bikin negara", tidak cocok), DISASTERSIM 55,2 (topik 35, juri 3.65, final EP04 juri 3.83 LOLOS), FELTCRAFT 41,7.
- **Alternatif ditolak:** `FLUIDFORGE` (3D): kuat untuk aliran fluida, tapi tidak punya HUD/cutaway lab untuk muatan listrik. `CERDIK` (2D, unggulan): dunianya desa/pasar, tidak punya set badai malam dan efek cahaya volumetrik. `NEGERI`: format seri partisipatif, bukan explainer.
- **Hukum Mutlak 5:** dari kit diambil material, palet void/lab, cincin (ring `#9FE3FF` untuk gelombang suara), ramp warna peringatan (hanya untuk keselamatan di outro), dan Finish DOCUMENTARY_WARM. Balok bumi/tsunami kit TIDAK dipakai; lingkungan = langit badai malam, desa, pohon, antena.
- **Cover referensi:** `F:/AUDIRA-ALL-SKILL/assets/style-covers/disastersim.png`
- **Cover topik:** `cover-topic.png` (dirender dari frame hook film, sesi berikut)
- **approved:** `yes` (style dipilih AI, aturan 2026-11-23; gerbang render final di-pre-approve pengguna 2026-11-25 batch 10 short otonom)

## Parameter dari motion memory (`audira_style_memory get DISASTERSIM`)
- Finish: `profile DOCUMENTARY_WARM, exposure 1, envIntensity 0.55, ao`, `background="#0B141C"`.
- Hindari (EP04): tag bab HUD di top 190 px bertabrakan dengan signature → tag bab mulai y ≥ 262; maks satu kartu data per adegan; label in-scene ≥ 60 px dari tepi, teks ≥ 28 px; jangan `settle()` di akhir rig (deadPct); adegan gelap abu-abu tanpa foreground ditolak juri → tiap adegan punya FG + rim light; contact sheet wajib 1 frame per adegan.
- Objek bulat 9:16 + 2 kartu HUD: target kamera di atas pusat objek (+0.25 tinggi), kartu big 72/small 36 di top 262 & 432.
