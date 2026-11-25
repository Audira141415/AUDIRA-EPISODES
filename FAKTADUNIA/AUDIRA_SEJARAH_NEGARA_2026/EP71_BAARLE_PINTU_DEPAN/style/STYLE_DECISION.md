# STYLE_DECISION — EP71 Baarle, Pintu Depan Menentukan Negaramu

Style: SATELLITEBRIEFING
- Engine: Remotion + R3F (3D), FilmScene + Finish `CYBER_NEON_VOID`, kit `F:/AUDIRA-SKILL-MOTION/kits/satellitebriefing/`.
- Alasan: Baarle adalah teka-teki peta. Pandangan satelit analis dengan kotak target amber membuat 22 kepingan Belgia dan 7+1 kepingan Belanda terbaca dalam satu tatapan, lalu turun (logarithmic descent) dari peta ke satu pintu rumah. Turun dari orbit ke pintu = struktur cerita "dari peta ke pintu depan".
- Alternatif ditolak:
  - TOYDIORAMA: rumah terbelah dan meja kafe sangat cocok, tapi kehilangan kekuatan peta tambal-sulam dari atas yang jadi hook visual; dipakai sebagai cadangan bila juri SATELLITEBRIEFING < 3.5 setelah 2 putaran.
  - HISTORYMAP: peta kuat, tapi sudah sering dipakai di channel dan juri mencatat datar; tidak bisa turun ke skala rumah/kafe.
- Risiko dari motion memory (wajib diterapkan di Sesi B):
  - selfBias +0,78 (material +1,2, komposisi +1,2, lighting +1,0): koreksi skor self sebelum percaya; andalkan juri buta.
  - Panel emisif latar (#1976D2, emissiveIntensity ~2.2, z ≈ -4.5), grid emissive ~3, cap emisif amber pada target, satu scan line amber (emissive ~4).
  - Siluet FG gelap (#0F1418, z ≈ 3.5) berkap emisif amber.
  - Terrain bertekstur (relief/useSurfaceGrain, sisi gelap vs atas terang), BUKAN kotak abu-abu RoundedBox polos.
  - Sway kamera ≤ 1,2 (yaw pelan), tidak ada objek/label di 380 px bawah, tanpa altitude ladder yang menimpa terrain.
  - Finish exposure 1.35, envIntensity 0.7, fog 9…30.
- Kit style = shader/mood, bukan lingkungan: lingkungan episode adalah kota kecil Flandria/Brabant (atap bata, jalan, padang rumput), bukan pelabuhan/selat default kit.
- Dipilih oleh sesi orkestrator (keputusan pengguna 2026-11-23: style dipilih AI tanpa acc). Acc hanya di gerbang render final.
- Tanggal: 2026-11-24
- approved: yes (pilihan AI, dilaporkan satu baris)
- Cover referensi: `style/cover-reference.png` (quality-bar kit). Cover topik: `style/cover-topic.png` dirender di Sesi B setelah scaffold (tahap 5–7), pola EP60.
