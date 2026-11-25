# EP05 draf putaran 1 → daftar poles (s3, 2026-11-24)

Draft: `draft/DRAFT_SHEET.jpg` (12 frame: 2.4, 8.5, 19, 30, 37.5, 44.5, 50, 54, 62.5, 67.8, 74.5, 81 s).
Ceilings audit: lighting 3 · material 5 · depth 5 · composition 3 · readability 2 · camera motion 5/5 · diversity 46.1 → PERLU POLES.
Belum ada record_score (self/juri) untuk putaran ini — jangan hitung sebagai putaran juri. Juri maks 2 putaran.

Kode: `project/src/episodes/moon/{timeline.ts, bodies.tsx, scenes.tsx, Hud.tsx, MoonFilm.tsx}`. Root.tsx sudah benar (MOON_SECONDS 87.5). Typecheck OK (satu error lama di PenggantiGibranWapres.tsx, bukan EP05). SHOTLIST lint 0 red. `public/audio/sfx.wav` −26 LUFS (jalankan `npm run sfx` lagi hanya bila waktu shot berubah).

## Wajib diperbaiki
1. **Subtitle tanpa spasi antar kata** ("limapuluhsembilan") + kontras kata belum aktif 1.8:1 + baris ke-3 masuk 380 px bawah ("terkunci."). Ganti `<Subtitle>` di MoonFilm.tsx dengan karaoke sendiri (contoh siap pakai: `work/_dup/moon/MoonFilm.tsx` komponen `Karaoke`: columnGap 0.4em, plate rgba(8,12,20,0.72), top 1300). Warna kata belum diucap ≥ rgba(255,255,255,0.75), maks 4 kata/frasa, ukuran 50, bounce aktif ≤ 1.04. Map "Cang-e" → "Chang'e".
2. **Hud.tsx overlap**: "+3,8 cm/tahun" (y 250, 104 px) menimpa "Bulan menjauh dari Bumi" (y 410) → pindah sub ke y 470. Cek pasangan besar+sub lain sama (1959/sub 430 ok; 27,3 HARI/400 sempit → 420; ≈59%/410 → 440; 1.935 gram/530 ok; 21,5 jam/430 → 450). "GRAVITASI BUMI" terbungkus jadi 2 baris: maxWidth 430 → 560. Label "ilustrasi · skala tidak sebanding" size 36 → 38.
3. **Adegan missions (50–64 s) gagal**: `crater-terrain-blob` GLB tampil sebagai dinding oranye-cokelat raksasa memenuhi layar, rover tak terlihat, tint tidak menimpa warna. Ganti: buang crater-terrain GLB dari `Ground`, pakai lantai abu (circle) + kawah prosedural (cincin torus/cekungan abu) + boulder GLB; atau tint lewat `polish`. Kamera lebih tinggi (y ~2.5) agar rover + kapsul terbaca. Frame 54 s = THEME_CHECK `tidak` saat ini.
4. **Adegan laser (64–75 s)**: astronaut GLB tergeletak horizontal & raksasa di depan kamera, cermin tak terlihat. Perbaiki rotasi (coba rotation [−π/2,0,0] atau cek bounding box), size 1.2, posisi agak jauh (z −1). Pastikan cermin + papan AUDIRA LAB + sinar laser terbaca di 67.8 s. Lantai juga oranye (sama seperti #3).
5. **Nights 8.5 s**: label "Malam 3" tertutup subtitle → label LabelPlate pindah ke atas Bulan (y +1.2) atau kamera naik.
6. **Lighting ceiling 3** (1 frame tonal range < 70): kemungkinan frame 50 s (dinding oranye datar) — selesai dengan #3.
7. Tekstur Bulan: cincin kawah terlalu besar/kartun pada close-up (frame 2.4/44.5). Opsional: kurangi radius kawah maks (26→14 sisi jauh, 18→10 sisi dekat) dan tebal rim.

## Lalu
`npm run draft -- MoonPreview --frames=2.4s,8.5s,19s,30s,37.5s,44.5s,50s,54s,62.5s,67.8s,74.5s,81s --out=../draft` (background) → isi `draft/THEME_CHECK.md` (12 baris, semua `ya`) → self `record_score` (stage draft, ceilings dari draft/DRAFT_REPORT.json, camera dari draft/camera.json) → juri buta (prompt di `F:/AUDIRA-SKILL-MOTION/qa/jury.md`, cover `F:/AUDIRA-SKILL-MOTION/references/quality-bar/scaleforge.png`, `draft/jury_input.json`, hanya kolom Frame|Detik|Kata VO dari THEME_CHECK) → record_score judge jury → **berhenti di gerbang 9** (contact sheet, skor juri, durasi 87,5 dtk, cek G18c) dan tunggu acc pengguna.
