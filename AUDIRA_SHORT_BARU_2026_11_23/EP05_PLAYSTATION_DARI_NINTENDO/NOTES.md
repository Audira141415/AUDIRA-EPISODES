# NOTES — EP05 PlayStation Lahir karena Nintendo Membatalkan Kerja Sama

Channel: AUDIRA TECH (@AudiraTECH) · Style: ARCADECRT (HyperFrames 2D: canvas world2d.js + HTML/GSAP) · memoryEpisode: short-baru-11-23-EP05

## Final
- `FINAL_VIDEO.mp4`: 1080×1920 @ 60, 88,75 dtk, 5325 frame, h264 + AAC 48 kHz. Render 2026-11-23 (`npx hyperframes render -f 60 -q standard -w 6`, capture 4m13s).
- Audio: `project/mix.py` (chiptune numpy + SFX, SFX ikut di-duck di bawah VO) → `lib/master.py` 2 pass: **−14,0 LUFS**, true peak **−1,8 dBTP**, LRA 2,6. VO −16,2 LUFS, musik −31,7 LUFS.
- QC (`project/out/qc/qc.log`): 0 decode error, 0 freeze > 2,5 dtk, 0 black, caption 100% bersuara (gap maks 0,114 dtk). `audira_qa_video` hardOnly: PASS.
- Metadata ffprobe: title, artist `AUDIRA (Agus Dwi R.)`, copyright, comment `AUDIRA-playstation-dari-nintendo-EP05 | audira.my.id`, date 2026-11-23.
- Signature bergerak `sig` (shell.mjs) aktif, outro card AUDIRA TECH 3 dtk terakhir. Brand di adegan: marquee kabinet AUDIRA TECH + neon toko "AUDIRA TECH" (s7, s8). VO: "Ikuti AUDIRA TECH".
- Contact sheet final: `draft/FINAL_SHEET.jpg`. Cover/thumbnail: `style/cover-topic.png` (frame 6,5 dtk r2).

## Skor
- PIXELSTORY (style pertama): juri draf 2,67 → 3,0, gagal; pengguna memilih ARCADECRT.
- ARCADECRT draf: self 4,0 → juri r1 3,33 → poles (layar lebih besar, marquee overlay tanpa zoom, pita caption sendiri, hapus "1P START", panel tombol turun ke y1560+, push-in per bab) → juri r2 3,33.
- **Diterima 3,33 setelah 2 putaran** atas keputusan pengguna 2026-11-23 ("jgn ganti style langsung render"); tool memori menyarankan ganti style, tidak diikuti.
- Final: self 3,33, juri buta **3,50** (lighting 4, material 3, depth 4, composition 4, motion 3, readability 3).
- Kritik juri final: kabinet statis identik semua frame (adegan ~35% frame), f7–f8 mirip, label kecil tak terbaca di HP, caption putus di tengah frasa, outro hijau beda gaya.

## VO
- Cartesia per baris speed 0,88 → tighten → tempo 1,06 → `audio/VO_MASTER.wav` (speech 85,75 dtk, film 88,75 dtk, 175 kata tampil). Offset 0.

## Pelajaran
- Berhasil: buffer ImageData 180×270 + font 3×5 cepat; alpha-blend menggantikan dither; marquee digambar tanpa zoom (tak pernah terpotong); pita caption gelap sendiri.
- Gagal: bingkai kabinet statis penuh di semua frame menahan composition/motion/readability di 3.
- Berikutnya: kabinet hanya di hook/outro, badan video full-bleed CRT; label piksel ≥ k5; kartu HUD tidak menutup papan/tokoh; outro card bertema arcade.
- Fix: figur di balik meja, kaki ±10 px di bawah tepi meja.

## Jadwal & review
- Upload: Minggu 29 Nov 2026, TikTok 19.00 → Threads 20.40 WIB (lihat SOCIAL_CAPTIONS.md).
- Scheduled task: `review-ep05-playstation-24h` (2026-11-30 19.00), `review-ep05-playstation-72h` (2026-12-02 19.00), `review-ep05-playstation-7d` (2026-12-06 19.00). Task hanya berjalan saat aplikasi Claude terbuka.
