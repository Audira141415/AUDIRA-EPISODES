# NOTES — EP17 Uang Batu Pulau Yap (Rai)

Channel: AUDIRA Fakta Dunia (@AudiraFaktaDunia) · Style: PAPERWORLD · Engine: Remotion 2D (SVG, tanpa R3F) · Label memori: `short-baru-11-23-EP17` · Slug: `uang-batu-yap`

## Hasil final (2026-11-23)
- `FINAL_VIDEO.mp4`: 1080×1920 @ 60 fps, 85,0 dtk, 5.100 frame, h264 + aac (65 MB). 14 adegan + outro AUDIRA 3 dtk (82–85).
- Audio: −13,9 LUFS integrated, true peak −1,9 dBFS. G18c: VO −17,7 LUFS, SFX ter-duck −31,6 LUFS, gap 13,9 LU.
- Metadata (ffprobe): title "Uang Batu Pulau Yap: 4 Ton, Tenggelam, Tapi Masih Sah", artist "AUDIRA (Agus Dwi R.)", copyright "© 2026 AUDIRA - Agus Dwi R. All rights reserved.", comment "AUDIRA-uang-batu-yap-EP17 | audira.my.id", date 2026-11-23.
- Tanda tangan Ed25519: VALID (key 498c3302271aadce), sidecar `FINAL_VIDEO.mp4.sig.json`.
- `audira_qa_video` hardOnly: PASS. Dua LONCAT di 33,02 dan 33,18 dtk di-`allow`: kilat petir putih 0,18 dtk yang sengaja dibuat di adegan S8 (badai, batu jatuh ke laut).
- Contact sheet final (8 frame dari MP4): `draft/final-contact-sheet.jpg`.
- Skor: juri buta terbaik **3.67** (putaran 1: 3.17). **Diterima 3.67 setelah 2 putaran** (aturan pengguna 2026-11-23: ≥ 3.5 setelah 2 putaran = final langsung, tanpa poles lagi, tanpa ganti style). Final self 3.83 (lighting 3, material 4, depth 3, composition 4, motion 5, readability 4).
- Offset VO: 0 (VO 81,6 dtk mulai frame 0).
- Subtitle: `SUBTITLES.srt` (28 cue dari vo-words.json).

## Pelajaran
- **Gagal**: juri buta 2 putaran tidak tembus 3.8. Aspek lemah: lighting datar (tanpa arah cahaya kuat) dan depth hanya 2–3 lapis. Lesson failed + fix PAPERWORLD sudah dicatat di sesi sebelumnya.
- **Perbaikan (G18c)**: stem SFX diturunkan ke −29 LUFS (`public/audio/sfx.wav`; asli di `sfx.orig-26lufs.wav`) supaya gap VO–SFX ≥ 12 LU.
- **Perbaikan (G13 kamera)**: drift sinus per sumbu dengan frekuensi berbeda punya titik kecepatan nol → parked 13 %, median 0,022 (gagal). Diganti orbit elips frekuensi sama (`dx = sin(1.1·lt)·24`, `dy = cos(1.1·lt)·28`) + zoom maju `1.05 + 0.012·lt` di director `Yap.tsx`. Klip 50–65 dtk: parked 0 %, median 0,049, 0 jerk. Zoom awal 1,05 menutup tepi kertas saat geser; komposisi tidak berubah.
- **Gagal (tool)**: channel gate `render:final` memindai semua `src/`, jadi file starter tak terpakai `src/scenes/news/PenggantiGibranWapres.tsx` (`handle="@audira"`) memblokir final. Prop `handle` dihapus di salinan EP17. Starter kit masih membawa file itu.
- **Gagal (tool)**: `render:final` tidak menulis metadata kepemilikan atau signature di run ini. Ditambah manual (ffmpeg + `npm run sign`).
- **Gagal (tool, berulang dari EP16)**: `scripts/sign-video.mjs` memanggil `signFile`/`verifyFile` tanpa `await`. Ditambah `await` (4 baris) di salinan EP17. Starter kit belum diperbaiki.
- **Catatan**: kilat putih keras (flash on/off) terbaca sebagai LONCAT oleh `qa_video`. Lain kali ramp 2–3 frame atau beri `allow` sejak awal.

## Review terjadwal
Slot upload pertama: TikTok Rabu 25 Nov 2026 19.00 WIB.
- `review-uang-batu-yap-24h` → 26 Nov 2026 19.00 WIB
- `review-uang-batu-yap-72h` → 28 Nov 2026 19.00 WIB
- `review-uang-batu-yap-7d` → 2 Des 2026 19.00 WIB

Task hanya jalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi). Jika upload diundur, ubah dengan `update_scheduled_task`.
