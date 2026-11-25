# NOTES — EP03 Sealand: Negara di Atas Benteng Laut

Channel: AUDIRA Fakta Dunia (@AudiraFaktaDunia) · Style: HISTORYMAP (Remotion 2D) · label memori `short-baru-11-23-EP03`

## Hasil
- Final: `FINAL_VIDEO.mp4` 1080×1920 @ 60, 91,0 dtk, 5460 frame, h264 + aac.
- Audio: −13,7 LUFS, true peak −1,8 dBFS. G18c: VO −16,5 LUFS, SFX ter-duck −29,9 LUFS, gap 13,4 LU.
- QA: `audira_qa_video` hardOnly PASS (0 KEDIP/LONCAT/BLACK/WHITE). Look audit final: semua ceiling 5.
- Metadata kepemilikan (title, artist, copyright, comment `AUDIRA-sealand-ep03-EP03 | audira.my.id`, date) dicek dengan ffprobe.
- Tanda tangan Ed25519: VALID (`FINAL_VIDEO.mp4.sig.json`).
- Skor: juri buta draf r1 4,0 (LOLOS); final self 4,17.
- Offset VO: 0 dtk. VO Cartesia, 202 kata.

## Style
- Terpilih: HISTORYMAP (acc pengguna). Ditolak/diganti: VISUALINVESTIGATION, CHRONICLE (lihat `style/STYLE_DECISION.md`).

## Pelajaran
- G18c: stem SFX `TARGET_LUFS` −26 memberi gap 11,4 LU (< 12). −28 → gap 13,4 LU, lolos.
- G13: `draft/camera.json` dari klip lama gagal (deadPct 11 %, medianSpeed 0,019) walau audit:camera skor 5. Sway global di `Historymap` (X ±30 px sin 0,9·t, Y 0..−16 px, scale 1,06) → deadPct 0, medianSpeed 0,05.
- Sway dengan `transformOrigin` di tengah (960 px) mendorong caption ke 380 px bawah (composition turun ke 2). Origin di garis caption (`540px 1500px`) dan Y hanya ke atas → composition kembali 5.
- `npm run sign` / `npm run verify` di kit: `signFile`/`verifyFile` async tidak di-await → signature kosong dan verify mencetak `undefined`; rename `.signing.mp4` juga EPERM. Ditandatangani dengan skrip yang await + fallback copy.

## Gagal / catatan
- Render final pertama gagal G18c, kedua gagal G13; ketiga lolos.

## Review terjadwal (tahap 11)
- `review-sealand-ep03-24h` — 2026-11-25 19.00 WIB
- `review-sealand-ep03-72h` — 2026-11-27 19.00 WIB
- `review-sealand-ep03-7d` — 2026-12-01 19.00 WIB
Task hanya jalan saat aplikasi Claude terbuka; bila tertutup, jalan saat dibuka lagi.
