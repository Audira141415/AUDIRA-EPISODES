# NOTES — EP02 Cara Kerja Kartu e-Toll / NFC

Style: BLUEPRINT · Engine: Remotion 2D · Channel: AUDIRA Explained (@AudiraExplained)

## Final
- `FINAL_EP02_ETOLL_NFC.mp4` — 1080×1920 @ 60, 84,0 dtk, 5.040 frame, render 301 dtk (`--jobs=3`).
- Audio: −13,7 LUFS, true peak −1,8 dBFS. G18c: VO −16,4 LUFS, SFX ter-duck −31,6 LUFS (gap 15,2 LU).
- Metadata kepemilikan ditulis (title, artist, copyright, comment `AUDIRA-cara-kerja-etoll-nfc-EP02`, date 2026-11-23), dicek ffprobe.
- Tanda tangan Ed25519 VALID + C2PA Content Credentials (wrapper `await signFile`).
- qa_video (hardOnly): PASS, 0 glitch.
- Skor draf juri: 3,67 (putaran 1) → 4,0 (putaran 2, LOLOS). Skor final dicatat di motion memory.
- Contact sheet final: `out/FINAL_SHEET.jpg`. Subtitle: `SUBTITLES.srt` (27 cue).

## Pelajaran
- G13 gagal di medianSpeed 0,031 (klip 44–62 dtk, adegan data/palang). Fix: drift `camFor` x 14→30 px @0,55→0,85 rad/dtk, y 10→22 @0,47→0,75, zoom wobble 0,012→0,02 @1,1; adegan data diberi geser a→b x −70→70. Hasil medianSpeed 0,048, parked 0%, jerk 0.
- Channel gate render:final tersandung adegan starter `src/scenes/news/PenggantiGibranWapres.tsx` (handle "@audira") yang tidak dipakai EtollFinal. Dilewati dengan `--skip-channel` + alasan; EP02 `AudiraSignature` tanpa prop handle (ikut channel).
- Render paralel `--jobs=4` gagal 1 part: `net::ERR_SOCKET_NOT_CONNECTED` saat memuat font (PC dipakai banyak sesi). Ulang `--jobs=3` lolos.
- `npm run sign` starter: rename EPERM + `signFile` tidak di-await. Pakai wrapper await + retry rename (F:/AUDIRA-TMP/ep02/sign-await.mjs). `audira_verify_signature` tetap mencetak `undefined` karena bug yang sama di `--verify`; verifikasi asli lewat wrapper: VALID.
- Minus kecil visual: judul konteks ("SEMUA RUAS…") sempat tertutup kalender saat masuk.

## Jadwal & review
- Upload: Rabu 25 Nov 2026, TikTok 19.00 WIB lalu platform lain tiap 20 menit (lihat SOCIAL_CAPTIONS.md).
- Scheduled review: `review-etoll-nfc-24h`, `review-etoll-nfc-72h`, `review-etoll-nfc-7d`.

## Review pasca-tayang
(diisi oleh scheduled task tahap 11)
