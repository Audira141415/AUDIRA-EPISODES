# NOTES — EP13 Cara Kerja PLTA (AUDIRA Explained, @AudiraExplained)

Style: BLUEPRINT · Engine: Remotion 2D (project/ = salinan engines/remotion-starter) · Durasi 88,9 dtk (film 85,9 + outro 3).

## Ringkas
- VO Cartesia `audio/vo.wav` 85,59 dtk, offset 0, 200 kata. Brand "Audira" diucap di hook (6,4 dtk) dan outro.
- 10 sheet blueprint, cut 7.1/14.2/26.0/36.9/46.1/56.8/66.1/75.1/80.7, payoff flash + impact 69,95 (1.000 MW Cirata).
- SFX prosedural `project/sfx/make_sfx.py` (cue dari kolom Audio STORYBOARD) → `audio/sfx.wav` −19,8 LUFS.
- Stills/cover: `project/stills.mjs` (bundle sekali, PltaEP13-Draft + PltaEP13-Cover) → `draft/stills/`, `draft/contact-sheet.jpg`, `style/cover-topic.png`.

## Juri draf
- Self 3,83. Juri buta r1 3,50 (L3 M4 D3 C3 Mo4 R4): sepertiga bawah kosong, cahaya datar, kedalaman tipis, caption karaoke 4 kata = fragmen, teks mikro 22–25 px, stempel LISTRIK! menutup rotor.
- Poles r2: key light radial kiri-atas (#CFEBFF 0,2) + vignette lebih kuat; grid drift 0,4 (parallax), gambar MG `feDropShadow` (lift), FG penggaris + segitiga blur 5 px drift 1,6; caption `buildPages(WORDS, 7, 38)` 2 baris; title block & Dim 28 px; stempel LISTRIK! ke y 1190.
- Juri buta r2 3,83 (L4 M4 D3 C4 Mo4 R4) → LOLOS ambang CLAUDE.md G16 (≥3,8, tidak ada aspek <3). Catatan: tool `audira_style_memory` memakai ambang 4,0 dan menyebut "PERLU POLES / ganti style"; diputuskan mengikuti ambang tertulis pengguna. Sisa kelemahan: depth datar khas blueprint, frame hook (2,5) & trafo agak jarang, signature kadang di atas label.

## Masalah teknis
- Render final pertama gagal: drive C: penuh (0 byte) → Remotion `Error: write EOF`. Solusi: set `TEMP`/`TMP`/`TMPDIR` ke `draft/tmp` di F: sebelum `npx remotion render`.

## Pelajaran
- worked: BLUEPRINT untuk "cara kerja" infrastruktur — satu sheet teknik per beat + kartu angka besar kuning terbaca di HP.
- failed: komposisi blueprint polos (1 lapis + grid) dinilai juri datar (depth 3) dan bawah kosong.
- fix: lapisan kedalaman 2D (grid parallax, drop shadow MG, FG alat gambar blur) + key light arah menaikkan lighting 3→4, composition 3→4.

## Final (2026-11-23)
- `FINAL_VIDEO.mp4` 1080×1920 @ 60, 88,9 dtk, 65 MB. Master −14,1 LUFS, true peak −1,3 dBFS. Metadata kepemilikan dicek ffprobe (title/artist/copyright/comment/date).
- Mix G18 lewat `draft/mix_final.sh`: VO `loudnorm=I=-16`, SFX stem −19,8 LUFS `volume=-10dB`, duck sidechain ratio 8 / 5 ms / 350 ms / thr 0,015, master loudnorm −14 + koreksi gain pass kedua + alimiter 0,84.
- Render ulang dengan TEMP di `F:\temp\ep13`, concurrency 2 (sukses). Temp lama `draft/tmp` dihapus.
- Bug mix pertama: `sidechaincompress` berhenti saat VO habis (85,6 dtk) → outro 3 dtk terpotong. Fix: `apad=whole_dur=88.9` pada VO + `-t 88.9` (bukan `-shortest`).
- Skor final self 3,83 (sama dengan draf juri r2 3,83, L4 M4 D3 C4 Mo4 R4).

## Review terjadwal (tahap 11)
- Upload: Sabtu 28 Nov 2026 19.00 WIB (slot pertama Jadwal Upload).
- Scheduled task: `review-cara-kerja-plta-24h` (29 Nov 19.00), `review-cara-kerja-plta-72h` (1 Des 19.00), `review-cara-kerja-plta-7d` (5 Des 19.00). Jalan hanya saat aplikasi Claude terbuka.
