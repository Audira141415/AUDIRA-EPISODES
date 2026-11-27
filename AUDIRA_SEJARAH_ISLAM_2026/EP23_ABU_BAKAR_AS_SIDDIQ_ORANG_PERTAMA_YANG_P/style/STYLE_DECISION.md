# STYLE_DECISION — Abu Bakar as-Siddiq: Orang Pertama yang Berkata "Dia Benar" (`EP23`)

Style: HD2D

- **Episode:** sejarah-islam-EP23 (`EP23_ABU_BAKAR_AS_SIDDIQ_ORANG_PERTAMA_YANG_P`), channel AUDIRA QISSAH
- **Tanggal:** 2026-11-27
- **Engine:** Remotion + React Three Fiber (3D diorama + sprite piksel), basis kode EP17 HD2D (`scenes/umar`) → `src/scenes/abubakar`
- **Style terpilih:** `HD2D` — sprite piksel 2D di dalam diorama 3D tilt-shift, lentera/obor 2400K vs bulan biru
- **Alasan (awam, terkait topik):** kisahnya berpindah dari alun-alun Makkah malam, gua Tsur bercahaya bulan, sampai masjid Madinah saat fajar. HD2D kuat di cahaya hangat di tengah gelap, tiap babak bisa jadi diorama berbeda, dan tokohnya sprite piksel kecil tanpa wajah sehingga adab visual sahabat terjaga. Skor juri HD2D di kisah Islam terakhir: draf EP17 4.33 (lolos).
- **Alternatif ditolak:** `ISLAMICDOCUMENTARY` — palet dan motifnya paling cocok, tetapi juri 2D flat 3.67 di dua episode dan memori mencatat lemah untuk kisah ruang tertutup tanpa figur (EP25 gua: mulut gua terbaca mihrab); `PAPERWORLD` — dipakai EP18 Bilal (kertas berlapis), tetapi adegan malam gua dan cahaya lentera kurang dramatis di kertas datar.
- **Cover referensi:** `cover-reference.png` (quality-bar HD2D, sama dengan EP17)
- **Cover topik:** `cover-topic.png` (frame hook film: alun-alun Makkah malam, kerumunan berpaling, satu sosok kecil melangkah ke arah cahaya, chip "DIA BENAR") — dirender di Sesi B setelah scaffold (kode adegan diblokir selama fase A)
- **approved:** `no`  (gerbang tunggal di tahap 9; style dipilih AI per keputusan pengguna 2026-11-23)

## Parameter dari motion memory (`audira_style_memory get HD2D`)
- Wajib diterapkan:
  - Diorama bertekstur: canvas map seeded (batu/bata/kayu) sebagai map + bump 0.5, bevel kotak; lentera emisif dibiarkan.
  - Tilt-shift aperture 0.006 / maxBlur 0.03 (0.0014 tidak terlihat).
  - Set malam: vignette radial + gradien atas/bawah di overlay (vignette dimask dari pita bawah), apron lebih terang (#34405A), jalan batu kena bulan, praktikal hangat kecil di FG (bokeh), point light bulan dingin.
  - Bedakan suhu cahaya tiap set malam (bulan biru #7F9CFF vs lampu minyak/obor hangat) supaya diversity ≥ 30.
  - Fill bulan dari arah kamera (pointLight di posisi kamera, 0.9) agar punggung sprite tidak jadi gumpal hitam.
  - Film ber-hard-cut (8 set): audit rig kamera per segmen (`draft/rig-audit.json`).
  - Kartu data besar per angka VO (573 M, 622 M, 632–634 M, nomor hadis).
- Parameter terbaik: Finish `DOCUMENTARY_WARM`, exposure 1, envIntensity 0.55, AO on, hdri warmStudio; key #FFC98A + rim #8FA6FF.
- Hindari:
  - Lantai kosong polos; chip HUD terpotong tepi (min 64 px dari tepi); subjek terpotong tepi di frame kunci (9:16 ≈ 23° FOV horizontal: hero 3–4 unit butuh jarak kamera ≈ 9–10).
  - Teaser outro tanpa visual subjek; kabut menutupi adegan; dua sudut hero yang nyaris sama.
  - Satu lokasi (gua) dengan variasi zoom saja: gua dibagi dua set berbeda (lereng luar dengan obor pengejar, dalam gua menatap keluar).
  - Prop prosedural yang terbaca plastik (pakai GLB atau roughness 1 + kerutan untuk kain/karung).
- Pelajaran EP17 (lintas sesi): stem SFX `TARGET_LUFS = -28` di `sfx/cues/auto.py` (G18c gap ≥ 12 LU); outro `<AudiraOutro code="QISSAH" />` (cek `node scripts/channel.mjs --check`); sebelum juri cek look.json (crush per frame ≤ 2%, clipHi 0, diversity ≥ 30).
