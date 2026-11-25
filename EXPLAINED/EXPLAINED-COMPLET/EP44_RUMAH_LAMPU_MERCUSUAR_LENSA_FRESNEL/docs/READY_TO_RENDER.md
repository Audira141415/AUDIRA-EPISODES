# READY_TO_RENDER — EP44_RUMAH_LAMPU_MERCUSUAR_LENSA_FRESNEL

Status: **BELUM** (syarat yang kurang: Gaya dipilih, VO terkunci, Proyek dibangun + branding, Build + mix lolos, layout check bersih)
Posisi: menuju gerbang render. Belum ada render apa pun di fase ini.
Aturan: `F:/AUDIRA-ALL-SKILL/.agents/rules/10_ready_to_render.md`
Diperbarui: 2026-11-14

| # | Syarat | Status | Bukti / catatan |
|---|---|---|---|
| 1 | Riset | ✅ | `research/SOURCE_REGISTER.md` (5 sumber ber-URL) + `RESEARCH_REPORT.md` |
| 2 | Naskah 6 tahap disetujui | ✅ | `docs/SCRIPT.md` (194 kata, acc 2026-11-13) + `docs/script-lines.json` |
| 3 | Gaya dipilih | ☐ | belum: pilih rekomendasi #1 `audira_recommend_style`, beda dari 3 episode sebelumnya |
| 4 | VO terkunci | ☐ | belum: `audira_generate_voiceover` (Cartesia, `lang: "id"`) |
| 5 | Proyek dibangun + branding | ☐ | belum: tulis `project/world3d.js`, `build-video.mjs`, `mix.py` (brief `_tools/BRIEF_COMMON.md`) |
| 6 | Build + mix lolos, layout check bersih | ☐ | belum |
| 7 | Catatan proses | ✅ | file ini |

## Gerbang render (langkah berikutnya, urut)
1. Cover topik (still 1080×1920) → konfirmasi gaya oleh pengguna.
2. Draf: contact sheet → `record_score` draft → juri buta (maks 3 putaran, aturan 6c).
3. Final sekali lewat `audira_render_batch` → `npm run deliver` → caption 6 platform.
