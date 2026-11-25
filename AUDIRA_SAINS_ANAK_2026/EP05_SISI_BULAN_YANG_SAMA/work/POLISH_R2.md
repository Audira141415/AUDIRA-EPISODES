# EP05 draf putaran 2 → poles terakhir (s4, 2026-11-24)

Status: R1 poles selesai (karaoke baru, Hud y, kawah prosedural, astronot dibuang, Luna 3 + papan AUDIRA LAB dibingkai). Audit draf: semua ceiling 5, camera 4/5, diversity 55.3. THEME_CHECK 12/12 ya.
Skor: self 4.0 (draft), **juri putaran 1 = 3.17 PERLU POLES** (lighting 3, material 3, depth 3, composition 3, motion 4, readability 3). Tersisa **1 putaran juri**. Setelah itu: juri terbaik ≥ 3.5 → langsung gerbang 9; < 3.5 → AI pilih style baru (G21).
G18c: SFX stem diturunkan ke TARGET_LUFS −29 (sfx/cues/auto.py) + `npm run sfx` sudah jalan. Gap VO −16.8 vs SFX ducked −29.7 = **12.9 LU (lolos ≥12)**.

## Keluhan juri
- F1/F6/F7 close-up Bulan abu datar, tanpa terminator, terpotong kartu → terasa monolitik.
- Tanah Bulan beige polos seperti plastik, kawah cincin berulang.
- F9 rover terpotong di 380 px bawah; F10 cermin di zona bawah.
- F8 Luna 3: rover di layar (Luna 3 tak punya rover); satelit kecil.
- F12 VO "Ia (Bulan) berputar seirama" tapi hanya Bumi terlihat.
- Teks sekunder kecil.

## Poles (scenes.tsx / Hud.tsx / bodies.tsx)
1. hook/wobble/farside: `fill` 0.18/0.15/0.1 → 0.05; sunPos lebih ke samping (hook [-12,1,-3], wobble [-9,2,3]) supaya terminator tegas; kamera mundur (hook d 7.4→5.6 jadi 9→7.2; wobble z ~8.5) agar piringan utuh tak terpotong kartu.
2. bodies.tsx kawah: `2 + Math.pow(r(), 3) * (far ? 26 : 18)` → `(far ? 14 : 10)` (baris ~71).
3. Ground: lantai `#77746F` + tekstur noise (DataTexture/canvas, repeat ~20) + bumpMap; kurangi CRATERS jadi 4 dengan ukuran beragam.
4. missions: rover baru masuk 55.8 s: `rx = lerp(-6, 1.0, ramp(t, 55.8, 63.5))`; kamera pakai `cx = lerp(-2.4, 1.0, ramp(t, 52.5, 63.5))` (bukan rx); satelit size 1.6. Kamera up-phase: pos y 3.0, target y `0.4 + 1.6*up` agar rover tidak di 380 px bawah.
5. outro: `a = (t - 75.35) * 0.35 - 1.4`, Moon radius 0.55 → 0.75 (di 81 s Bulan di depan-kanan Bumi).
6. Hud: sub size 40 → 46; "ilustrasi · skala tidak sebanding" 38 → 42.

## Lalu
`cd project && npm run draft -- MoonPreview --frames=2.4s,8.5s,19s,30s,37.5s,44.5s,50s,54s,62.5s,67.8s,74.5s,81s --out=../draft` → perbarui THEME_CHECK (kolom Subjek) → self record_score → juri buta (prompt qa/jury.md; contoh prompt lengkap dengan tabel VO di sesi s4 transcript, ringkasnya: sheet + cover `F:/AUDIRA-SKILL-MOTION/references/quality-bar/scaleforge.png` + ceilings + camera + kolom Frame|Detik|Kata VO) → record_score jury → append_lesson failed (lighting close-up datar, tanah plastik) → **gerbang 9**: contact sheet, skor juri, durasi 87,5 dtk, G18c 12.9 LU. Tunggu acc pengguna. Jangan render final tanpa acc.
