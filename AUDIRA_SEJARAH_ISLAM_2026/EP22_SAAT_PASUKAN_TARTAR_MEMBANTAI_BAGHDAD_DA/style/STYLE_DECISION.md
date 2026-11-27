# STYLE_DECISION — Saat Pasukan Tartar Membantai Bagdad (EP22)

Style: HISTORYMAP

- **Episode:** sejarah-islam-EP22 (`EP22_SAAT_PASUKAN_TARTAR_MEMBANTAI_BAGHDAD_DA`), channel AUDIRA QISSAH
- **Tanggal:** 2026-11-27
- **Engine:** Remotion + React Three Fiber (3D), basis kode EP19 HISTORYMAP (`project/src/scenes/khalid`) → `src/scenes/baghdad`
- engine: remotion
- **Style terpilih:** HISTORYMAP — meja peta perang 3D, kota Bagdad bundar di dua tepi Tigris
- **Alasan (awam, terkait topik):** Kejatuhan Bagdad adalah cerita peta: pasukan datang dari timur, mengepung dari dua tepi Sungai Tigris, tanggul dijebol lalu air membanjiri. Meja peta membuat pengepungan terbaca tanpa suara, dan pasukan cukup diwakili panji, tenda, dan kuda, jadi tidak ada wajah, tubuh, atau darah di layar.
- **Skor tercatat:** juri final Remotion HISTORYMAP 4.11 (3 episode, 3 lolos); gold sejarah-sepak-bola-EP01 4.33. Topik Islam: EP19 Khalid juri 3.50 (readability 2). Kelemahan EP19 sudah dimasukkan ke storyboard ini (lihat Parameter).
- **Alternatif ditolak:** `HD2D` — diorama kota terbakar akan kuat, tetapi pengepungan dua tepi sungai dan panah pasukan sulit terbaca dari sudut tilt-shift dekat; juri HD2D 3.84 (1 dari 3 lolos), dan sudah dipakai EP17 serta EP20. `MOSAICFORGE` — ornamen Islam cocok, tetapi hook mural abstrak pernah gagal G22 (readability 3), dan topik ini butuh geografi, bukan pola.
- **Cover referensi:** `cover-reference.png` (quality-bar HISTORYMAP, sama dengan EP19)
- **Cover topik:** `cover-topic.png` — dirender di Sesi B dari frame hook film (proyek Remotion belum ada di fase A; preseden EP19)
- **approved:** yes (dipilih AI dan dilaporkan; aturan 2026-11-23, acc pengguna hanya di gerbang render final)

## Parameter dari motion memory (HISTORYMAP + pelajaran EP19/EP17)
- Wajib: Finish DOCUMENTARY_WARM, exposure 1, envIntensity 0.55, ao=false; serat kertas di sheet peta; relief dari seeded peak, dikali 0.3 supaya rute terbaca.
- **Readability (kelemahan EP19):** satu objek 3D tegas per beat abstrak (surat bersegel, banjir, asap, karpet, buku di sungai), bukan kartu teks; label peta HTML ≥ 46 px, jauh dari pita karaoke y 1200–1450; satu prop + satu kartu per frame; kartu di dalam frame (≥ 64 px dari tepi).
- Kamera: jarak ≥ 8 untuk adegan peta; sudut berubah nyata (oblique, top-down, eye-level di kota, macro di karpet/buku) supaya diversity ≥ 30; push-in lt*0.035–0.06, jangan diam; potong scene ≥ 0.5 dtk setelah kata terakhir babak.
- Look (EP17): crush per frame ≤ 2%, clipHi 0; set malam/asap (s5, s6) wajib rim + haze untuk separasi subjek.
- Audio: TARGET_LUFS -28 di `sfx/cues/auto.py`, jalankan `PYTHONUTF8=1 npm run sfx`, ukur G18c (≥ 12 LU).
- Outro: `<AudiraOutro code="QISSAH" />`, cek `node scripts/channel.mjs --check`; hapus handle "@audira" sisa starter.
- Hindari: stempel 3D di atas prop, label padat, glyph `≠`, caption satu kata yatim, tanda tangan menimpa judul, dua frame yang hanya beda zoom, balok polos sebagai data.
- Render: `--jobs=3` bila GPU dibagi sesi lain; GLB ber-rig di-clone lewat `SkeletonUtils.clone`.
