# QA Report — EP128_KENAPA_TIMNAS_INDONESIA_U_23_2024_DISEBU

- [ ] 1080×1920, 60 fps, tanpa frame hitam, outro AUDIRA
- [ ] VO jelas, -14 LUFS, true peak < -1 dBFS
- [ ] Subtitle sinkron, di dalam safe zone
- [ ] signature AUDIRA aktif (shell.mjs sig / AudiraSignature), hilang saat outro
- [ ] Metadata MP4 dicek dengan ffprobe
- [ ] SOCIAL_CAPTIONS.md lolos audira_validate_social_captions
- [ ] `audira_project_layout` check: errors kosong
