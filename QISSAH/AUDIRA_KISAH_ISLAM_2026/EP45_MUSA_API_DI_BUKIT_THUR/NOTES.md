# NOTES — Musa dan Api di Bukit Thur (`EP45`)

> Tahap 10–11. Pelajaran agar episode berikut mulai dari kualitas lebih tinggi. Disimpan juga ke motion memory PAPERWORLD (`append_lesson` fix + failed, 2026-11-25).

Style: PAPERWORLD · engine Remotion, mode 2D SVG · final `FINAL_EP45_MUSA_API_DI_BUKIT_THUR.mp4` (1080×1920 @ 60, 94,6 dtk).

## Yang berhasil (worked)
- Juri buta draf 3.83 LOLOS (L4 M3 D4 C3 Mo5 R4) di putaran pertama; motion 5 dari dolly ke api, crane naik saat pendakian, dan orbit ke fajar di payoff.
- Pita ayat kertas dengan sumber surat:ayat + stempel "9 MUKJIZAT" menjadi callout data yang terbaca.
- Adab visual: Musa dan Harun hanya siluet dari belakang, tanpa wajah.
- Render final: −13,7 LUFS, true peak −1,8 dBFS, metadata + tanda tangan Ed25519 + C2PA, `audira_qa_video` hardOnly PASS (tanpa KEDIP/LONCAT/BLACK/WHITE).

## Yang gagal (failed) + perbaikan (fix)
- G18c di `render-final.mjs` mengukur gap VO−SFX 11,5 LU (minimal 12), padahal cek draf melaporkan 14 LU. Fix: stem `public/audio/sfx.wav` diturunkan 2 dB (−26 → −28 LUFS, `ffmpeg volume=-2dB`); gap jadi 13,5 LU. Stem asli disimpan di `work/sfx_stem_-26.wav`.
- Gerbang channel membaca `SERIES.json` lain dengan handle @AudiraExplained. Signature episode memakai `code="QISSAH"` (@AUDIRAQISSAH) dan `SERIES.json` seri juga @AUDIRAQISSAH, jadi di-override dengan `--skip-channel` (alasan tercatat di `draft/final-render2.log`). Sumber @AudiraExplained perlu dibereskan di luar folder episode.
- Satu part (frame 2394) kena timeout `delayRender` di `--jobs=4 --concurrency=2`. Menjalankan ulang perintah yang sama melanjutkan dari 26 segmen tersimpan (38/64 sisa, 766 dtk).
- Material dan komposisi tetap 3 di juri: kertas perlu serat dan tepi sobek lebih tegas, subjek lebih besar di frame.

## Teknis
- Offset VO: 0 (VO 91,30 dtk, film 94,6 dtk termasuk outro card).
- Parameter render: `npm run render:final -- --comp=Ep45Final --out=out/EP45_final.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2 --gl=vulkan --encoder=nvenc --title="Musa dan Api di Bukit Thur" --slug=musa-api-di-bukit-thur --ep=EP45 --skip-channel="…"`.
- Mix G18: VO loudnorm −16, SFX stem −28 + volume=−4dB, duck ratio 8 / attack 5 ms / release 350 ms.

## Jadwal review (tahap 11)
Upload Sabtu 28 Nov 2026 19.00 WIB. Scheduled task: `review-musa-api-di-bukit-thur-24h` (29 Nov 19.00), `review-musa-api-di-bukit-thur-72h` (1 Des 19.00), `review-musa-api-di-bukit-thur-7d` (5 Des 19.00). Task hanya berjalan saat aplikasi Claude terbuka.

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
