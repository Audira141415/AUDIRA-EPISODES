# READY_TO_RENDER — EP11_TERMOS_AIR_PANAS

Status: **SIAP RENDER**
Posisi: menuju gerbang render. Belum ada render apa pun di fase ini.
Aturan: `F:/AUDIRA-ALL-SKILL/.agents/rules/10_ready_to_render.md`
Diperbarui: 2026-11-14

| # | Syarat | Status | Bukti / catatan |
|---|---|---|---|
| 1 | Riset | ✅ | `research/SOURCE_REGISTER.md` (6 sumber ber-URL) + `RESEARCH_REPORT.md` |
| 2 | Naskah 6 tahap disetujui | ✅ | `docs/SCRIPT.md` (196 kata, acc 2026-11-13) + `docs/script-lines.json` |
| 3 | Gaya dipilih | ✅ | THERMALFORGE — `style/STYLE_DECISION.md` |
| 4 | VO terkunci | ✅ | `audio/VO_MASTER.wav` + `project/voiceover.json` (via timeline.json) |
| 5 | Proyek dibangun + branding | ✅ | `project/world3d.js`, `project/build-video.mjs`, `project/mix.py` |
| 6 | Build + mix lolos, layout check bersih | ✅ | `node build-video.mjs` exit 0 (54 reveals, 62 captions), `python mix.py` exit 0 |
| 7 | Catatan proses | ✅ | file ini |

## Gerbang render (langkah berikutnya, urut)
1. Cover topik (still 1080×1920) → konfirmasi gaya oleh pengguna.
2. Draf: contact sheet → `record_score` draft → juri buta (maks 3 putaran, aturan 6c).
3. Final sekali lewat `audira_render_batch` → `npm run deliver` → caption 6 platform.
