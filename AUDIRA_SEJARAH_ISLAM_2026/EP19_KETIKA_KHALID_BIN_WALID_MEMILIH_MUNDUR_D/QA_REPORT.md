# QA Report — EP19_KETIKA_KHALID_BIN_WALID_MEMILIH_MUNDUR_D

- [x] 1080×1920, 60 fps, 5460 frame, 91.0 dtk; cek 8 frame dari MP4 tanpa frame hitam; outro AUDIRA QISSAH tampil
- [x] VO jelas; master −13.7 LUFS, true peak −1.8 dBFS; G18c VO 14.7 LU di atas SFX ter-duck
- [x] Subtitle karaoke sinkron, di dalam safe zone; SUBTITLES.srt 30 cue (angka digit)
- [x] Signature AUDIRA aktif (AudiraSignature @AUDIRAQISSAH, gerbang channel render:final lolos), hilang saat outro
- [x] Metadata MP4 dicek dengan ffprobe (title, artist, copyright, comment, date)
- [x] SOCIAL_CAPTIONS.md lolos audira_validate_social_captions (errors kosong)
- [ ] `audira_project_layout` check: tidak dijalankan di sesi C
