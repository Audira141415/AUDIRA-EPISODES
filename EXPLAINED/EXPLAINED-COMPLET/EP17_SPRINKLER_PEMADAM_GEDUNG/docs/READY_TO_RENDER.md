# READY_TO_RENDER — EP17_SPRINKLER_PEMADAM_GEDUNG

Status: **SIAP** — semua syarat terpenuhi. Nol render di fase ini.
Posisi: menuju gerbang render. Belum ada render apa pun di fase ini.
Aturan: `F:/AUDIRA-ALL-SKILL/.agents/rules/10_ready_to_render.md`
Diperbarui: 2026-11-14

| # | Syarat | Status | Bukti / catatan |
|---|---|---|---|
| 1 | Riset | ✅ | `research/SOURCE_REGISTER.md` (8 sumber ber-URL) + `RESEARCH_REPORT.md` |
| 2 | Naskah 6 tahap disetujui | ✅ | `docs/SCRIPT.md` (192 kata, acc 2026-11-13) + `docs/script-lines.json` |
| 3 | Gaya dipilih | ✅ | DISASTERSIM — `style/STYLE_DECISION.md`, `style/cover-reference.png` |
| 4 | VO terkunci | ✅ | `audio/VO_MASTER.wav` + `audio/voiceover.json` + `project/timeline.json` (77.33s) |
| 5 | Proyek dibangun + branding | ✅ | `project/world3d.js` (DISASTERSIM 3D), `project/build-video.mjs`, `project/mix.py`. Sig: EP17_SPRINKLER_PEMADAM_GEDUNG, outro: AudiraOutro EP17, AUDIRA label in 3D world |
| 6 | Build + mix lolos | ✅ | `node build-video.mjs` exit 0, `python mix.py` exit 0. Output: `hf/compositions/world.html`, `hf/compositions/captions.html`, `hf/assets/audio/mix.wav`, `hf/index.html`, `beats.json` |
| 7 | Catatan proses | ✅ | file ini |

## Gerbang render (langkah berikutnya, urut)
1. Cover topik (still 1080×1920) → konfirmasi gaya oleh pengguna.
2. Draf: contact sheet → `record_score` draft → juri buta (maks 3 putaran, aturan 6c).
3. Final sekali lewat `audira_render_batch` → `npm run deliver` → caption 6 platform.
