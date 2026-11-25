# Template episode (tanpa judul)

Salin folder `EP00_JUDUL` lalu ganti namanya jadi `EP<NN>_<JUDUL_SINGKAT>`, atau pakai `audira_project_layout add_episode` lalu salin isi file dari sini.
Semua `{{...}}` wajib diganti dengan isi nyata. Jangan menyalin isi episode lain, dan jangan menandai sesuatu "lolos/OK" sebelum benar-benar dicek.

| File | Diisi di tahap | Oleh |
|---|---|---|
| research/SOURCE_REGISTER.md | 2 Riset | tangan / agen riset |
| research/RESEARCH_REPORT.md | 2 Riset | tangan / agen riset |
| style/STYLE_DECISION.md | 3 Gerbang style | tangan, `approved: yes` hanya setelah acc pengguna |
| docs/SCRIPT.md | 4 Naskah | `_tools/scripts_batchN.py` |
| docs/STORYBOARD.md | 7 Animasi | agen film |
| NOTES.md | 6–10 | tangan |
| QA_REPORT.md | 9 Final | **otomatis** `node studio/scripts/qa-gate.mjs <EP>/FINAL_VIDEO.mp4` — jangan ditulis tangan |
| SOCIAL_CAPTIONS.md | 10 Delivery | `_tools/write_captions.py` + `audira_validate_social_captions` |
| STATUS.json | semua | MCP `audira_episode_status` (`init`) — jangan disalin dari template |
