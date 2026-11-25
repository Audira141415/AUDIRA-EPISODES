# Batch handoff — AUDIRA_SHORT_BARU_2026_11_23 (orkestrator)

Diperbarui: 2026-11-23 sore. Sesi orkestrator: "periska sudha berapa yg selesai" (F:\AUDIRA-2D-SKILL-MOTION).

## Instruksi pengguna
- 2026-11-23: selesaikan SEMUA episode batch ini tanpa bertanya.
- 2026-11-23 (ditulis pengguna di sesi EP30): "jgn ganti style langsung render". Jangan ganti style. Bila juri draf belum ≥3.8 setelah 2 putaran poles, catat lalu render final dengan style yang sama.
- TEMP sudah dipindah ke `F:\temp`. Sesi pagi mati karena C: penuh.

## Status
- Review (selesai, 13): EP05, EP06, EP07, EP09, EP10, EP12, EP13, EP15, EP16, EP20 (juri 3.17, override), EP21 (juri final 3.50), EP29, EP30 (juri 3.67, override).
- EP08: juri 3.33/3.17 diterima tanpa ganti style; render:final tertahan gate kamera G13 (medianSpeed 0.03 < 0.04). Handover ada di STATUS.json + HANDOFF.md episode. Perlu sesi baru: naikkan gerak kamera, render final, tahap 10.
- Dikerjakan sesi lama sendiri (jangan diganggu): EP01, EP02, EP03, EP04.
- Belum dimulai: EP17, EP11, EP14, EP18, EP19, EP22, EP27, EP23, EP24, EP25, EP26, EP28.

## Next
- Aplikasi membatasi 5 sesi sekaligus. Mulai sisa episode per 5 saat slot kosong.
- Brief tiap sesi: path episode + isi handover dari STATUS.json, aturan di atas, `--concurrency=2`, render di background, `--skip-channel` bila hanya SERIES.json yang hilang, jam upload = slot pertama.
- Cek progres: baca `stages`/`handover` tiap `*/STATUS.json` dan keberadaan `FINAL_VIDEO.mp4`.
