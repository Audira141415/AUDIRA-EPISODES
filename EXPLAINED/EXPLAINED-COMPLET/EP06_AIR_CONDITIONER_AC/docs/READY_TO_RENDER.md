# READY_TO_RENDER — EP06_AIR_CONDITIONER_AC

Status: **SIAP RENDER**
Posisi: berhenti di DEPAN GERBANG RENDER. Belum ada render apa pun di fase ini.
Aturan: `F:/AUDIRA-ALL-SKILL/.agents/rules/10_ready_to_render.md`
Diperbarui: 2026-11-14

| # | Syarat | Status | Bukti / catatan |
|---|---|---|---|
| 1 | Riset | ✅ | `research/SOURCE_REGISTER.md` (12 sumber ber-URL) + `RESEARCH_REPORT.md` |
| 2 | Naskah 6 tahap disetujui | ✅ | `docs/SCRIPT.md` (212 kata, acc 2026-11-13) + `docs/script-lines.json` |
| 3 | Gaya dipilih | ✅ | PAPERWORLD (`style/STYLE_DECISION.md`) |
| 4 | VO terkunci | ✅ | `audio/VO_MASTER.wav` + `audio/voiceover.json` |
| 5 | Proyek dibangun + branding | ✅ | `project/world3d.js`, `build-video.mjs`, `mix.py` |
| 6 | Build + mix lolos, layout check bersih | ✅ | `node build-video.mjs && python mix.py` lolos 2026-11-14 (anchor `s2:meleset`, `s6:membuang` ditambah ke `extraAt`); `audira_project_layout check` errors kosong |
| 7 | Catatan proses | ✅ | file ini |

## Gerbang render (langkah berikutnya, urut)
1. Cover topik dan draf sudah disetujui pengguna 2026-11-13 (`style/cover-topic.png`, `draft/contact-sheet.jpg`).
2. Final sekali: `bash _tools/final.sh EP06_AIR_CONDITIONER_AC` (dari folder seri) atau `audira_render_batch`.
3. `npm run sign` + `npm run deliver` → `NOTES.md`, caption 6 platform, `record_score` final.
