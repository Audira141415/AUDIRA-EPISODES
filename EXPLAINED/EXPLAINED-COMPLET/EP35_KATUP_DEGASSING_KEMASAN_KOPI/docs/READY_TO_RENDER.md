# READY_TO_RENDER — EP35_KATUP_DEGASSING_KEMASAN_KOPI

Status: **SIAP RENDER** — semua syarat terpenuhi. Nol render di fase ini.
Posisi: menunggu gerbang render (cover topik → draf → final).
Aturan: `F:/AUDIRA-ALL-SKILL/.agents/rules/10_ready_to_render.md`
Diperbarui: 2026-11-14

| # | Syarat | Status | Bukti / catatan |
|---|---|---|---|
| 1 | Riset | ✅ | `research/SOURCE_REGISTER.md` (9 sumber ber-URL) + `RESEARCH_REPORT.md` |
| 2 | Naskah 6 tahap disetujui | ✅ | `docs/SCRIPT.md` (215 kata, acc 2026-11-13) + `docs/script-lines.json` |
| 3 | Gaya dipilih | ✅ | FOODFORGE (dapur kopi hangat: keramik-kayu-tembaga). `style/STYLE_DECISION.md`. Rank #1 (68.4pts, cocok topik "kopi", quality 3.93). Beda dari EP31–33 (STAINEDGLASS, INFLATABLE, INNERWORKS). |
| 4 | VO terkunci | ✅ | `audio/VO_MASTER.wav` + `audio/voiceover.json` (Cartesia, id, 85.68s) |
| 5 | Proyek dibangun + branding | ✅ | `project/build-video.mjs` (panel FOODFORGE), `project/world3d.js` (coffee bag+valve cutaway+Goglio 3D), `project/mix.py` (marimba Bb major 88BPM). AudiraOutro+AudiraSignature via shell.mjs, AUDIRA di dunia 3D (label kantong + stempel). |
| 6 | Build + mix lolos | ✅ | `node build-video.mjs` exit 0 (37 reveals, 62 caption groups, 85.68s). `python mix.py` exit 0 (peak 0.739). |
| 7 | Catatan proses | ✅ | file ini + `style/STYLE_DECISION.md` |

## Gerbang render (langkah berikutnya, urut)
1. Cover topik (still 1080×1920) → konfirmasi gaya oleh pengguna.
2. Draf: contact sheet → `record_score` draft → juri buta (maks 3 putaran, aturan 6c).
3. Final sekali lewat `audira_render_batch` → `npm run deliver` → caption 6 platform.
