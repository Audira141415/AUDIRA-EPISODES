# READY_TO_RENDER — EP29_BOLA_PEMADAM_API_OTOMATIS

Status: **SIAP RENDER**
Posisi: menuju gerbang render. Nol render di fase ini (tanpa MP4, still, snapshot, contact sheet).
Aturan: `F:/AUDIRA-ALL-SKILL/.agents/rules/10_ready_to_render.md`
Diperbarui: 2026-11-14

| # | Syarat | Status | Bukti / catatan |
|---|---|---|---|
| 1 | Riset | ✅ | `research/SOURCE_REGISTER.md` (8 sumber ber-URL) + `RESEARCH_REPORT.md` |
| 2 | Naskah 6 tahap disetujui | ✅ | `docs/SCRIPT.md` (197 kata, acc 2026-11-13) + `docs/script-lines.json` |
| 3 | Gaya dipilih | ✅ | NANOFORGE — `style/STYLE_DECISION.md`, cover referensi di `style/cover-reference.jpg`. Cover topik di gerbang render. |
| 4 | VO terkunci | ✅ | `audio/VO_MASTER.wav` + `project/timeline.json` (87.64 dtk, 8 scene) |
| 5 | Proyek dibangun + branding | ✅ | `project/world3d.js` (288 baris, NANOFORGE 3D), `build-video.mjs` (87 baris, 8 panel HUD), `mix.py` (78 baris, celesta+pad+pizz). AudiraSignature seed, AudiraOutro, AUDIRA brand in-scene. |
| 6 | Build + mix lolos | ✅ | `node build-video.mjs` exit 0 (36 reveals, 58 caption groups), `python mix.py` exit 0 (peak 0.691). 36 AT anchors di beats.json, semua terpakai. |
| 7 | Catatan proses | ✅ | file ini |

## Gerbang render (langkah berikutnya, urut)
1. Cover topik (still 1080×1920) → konfirmasi gaya oleh pengguna.
2. Draf: contact sheet → `record_score` draft → juri buta (maks 3 putaran, aturan 6c).
3. Final sekali lewat `audira_render_batch` → `npm run deliver` → caption 6 platform.
