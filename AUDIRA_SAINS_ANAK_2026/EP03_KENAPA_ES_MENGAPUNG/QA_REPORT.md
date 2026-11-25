# QA Report — EP03_KENAPA_ES_MENGAPUNG (2026-11-24)

- [x] 1080×1920, 60 fps, 87,217 dtk (5232 frame), tanpa frame hitam di contact sheet, outro AUDIRA (frame 8)
- [x] VO jelas, −13,6 LUFS (target −14 ±1), true peak −1,9 dBFS; G18c gap 15,7 LU
- [x] Subtitle karaoke sinkron, di atas safe zone bawah; `SUBTITLES.srt` 28 cue
- [x] Signature AUDIRA aktif, hilang saat outro; Ed25519 VALID + C2PA (`npm run verify`)
- [x] Metadata MP4 dicek ffprobe: artist AUDIRA (Agus Dwi R.), comment AUDIRA-kenapa-es-mengapung-EP03 | audira.my.id
- [x] SOCIAL_CAPTIONS.md lolos audira_validate_social_captions
- [ ] `audira_project_layout` check: tidak dijalankan
