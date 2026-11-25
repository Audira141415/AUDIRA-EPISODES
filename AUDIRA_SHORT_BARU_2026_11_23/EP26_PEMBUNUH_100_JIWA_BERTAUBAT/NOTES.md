# NOTES — EP26 Lelaki Pembunuh 100 Jiwa yang Bertaubat

Channel: AUDIRA Qissah · Style: PAPERLANTERN · Engine: Remotion 2D (SVG/CSS) · Durasi film 86,5 dtk (VO 83,2 dtk, 191 kata)

## Kualitas
- Juri draf putaran 1: 3.33 (G22 F3 hanya kartu teks sumber → readability 2).
- Juri draf putaran 2: 3.50 → **diterima 3.50 setelah 2 putaran** (aturan pengguna 2026-11-23). Final dirender dengan `--skip-memory-gate` berisi alasan ini, karena gate render-final belum mengenal aturan auto-accept ≥ 3.5.
- Camera audit 5/5 (kontinu, 0 hold).
- **Final (2026-11-23, sesi s5)**: `FINAL_EP26_PEMBUNUH_100_JIWA_BERTAUBAT.mp4`, 1080×1920 @ 60, 86,5 dtk, 5190 frame. Skor final: self 3.67, juri buta 3.67 (lighting 4, material 3, depth 3, composition 4, motion 5, readability 3). Kelemahan terbesar menurut juri: F7 payoff "sejengkal" bertumpu pada kartu teks besar; negeri saleh dan penggaris kecil dan gelap. Tidak dipoles lagi: draf sudah diterima setelah 2 putaran, final dirender sekali.
- G13 camera gate awalnya gagal (medianSpeed 0.015 < 0.04). Perbaikan: drift kamera di level director `Taubat.tsx` (zoom dasar 1.12 + dolly 0.014/dtk + orbit pan radius 55 px @ 0,45 rad/dtk). Klip cek `draft/CHECK2_46-64s.mp4`: medianSpeed 0.041, 0 jerk, 0 parked → `draft/camera.json`.
- Channel gate di-skip dengan alasan: pelanggaran handle hanya ada di komposisi contoh starter `src/scenes/news/PenggantiGibranWapres.tsx`, tidak ikut dirender; Taubat.tsx memakai `AudiraSignature` (handle dari SERIES.json) + `AudiraOutro`.

## QA final
- Loudness: −13,7 LUFS integrated, true peak −1,9 dBFS (target −14 LUFS ±0,5, TP < −1 dBFS).
- Metadata ffprobe: title, artist "AUDIRA (Agus Dwi R.)", copyright © 2026, comment `AUDIRA-pembunuh-100-jiwa-bertaubat-EP26 | audira.my.id`, date. Tanda tangan Ed25519: VALID (sidecar `.mp4.sig.json`).
- Contact sheet frame dari MP4: `draft/FINAL_SHEET.jpg` (8 frame, outro AUDIRA ada, tepi tidak terbuka).
- Kendala teknis: `render-final.mjs` gagal `renameSync` (EPERM) saat menimpa MP4 dengan versi bertag; dipindah manual dengan `mv`. `scripts/sign-video.mjs` tidak `await` `signFile` (async) sehingga `npm run sign` menulis tanda tangan INVALID; ditandatangani ulang via `lib/sign.mjs` dengan `await`. Stamp `FINAL_*.mp4.render.json` tidak tertulis (script berhenti sebelum stamp).
- Validator caption: ok, 6 platform; versi long tidak berlaku (short 9:16 sejak 2026-11-16).

## Yang berhasil
- S2 sumber hadits diubah dari kartu teks menjadi dua kitab bersampul (label Bukhari 3470 / Muslim 2766) + rehal + lentera kertas: G22 lolos.
- Subjek dipindah keluar dari zona caption (y 1360+): kota asal di peta (S6) dan lelaki condong (S7, latar depan naik 250 px).

## Yang gagal / lemah (dicatat ke motion memory)
- Material dan depth 3: langit noise datar, adegan dua cahaya (rahmat/azab) di set kosong.
- Chip "ILUSTRASI · MALAIKAT SEBAGAI CAHAYA" tampil di semua frame, kecil; watermark AUDIRA menimpa chip di S4–S5.

## Audio
- G18c: VO −16,6 LUFS, SFX ter-duck −31,3 LUFS, selisih 14,7 LU. Tanpa musik.

## Upload
- Jadwal: Sabtu 28 Nov 2026, TikTok 19.30 WIB lalu tiap 20 menit (lihat SOCIAL_CAPTIONS.md).
- Review pasca-tayang (24 jam / 72 jam / 7 hari): belum dijadwalkan di sesi ini.
