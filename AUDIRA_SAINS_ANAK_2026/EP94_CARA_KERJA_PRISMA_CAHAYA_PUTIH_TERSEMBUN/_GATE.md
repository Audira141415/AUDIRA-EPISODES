# ⛔ _GATE.md — HARGA MATI (baca & taati, tema apa pun)

> Template episode AUDIRA, reusable untuk tema apa pun. Copy folder ini → `EP94_CARA_KERJA_PRISMA_CAHAYA_PUTIH_TERSEMBUN/`, isi semua `<...>`, ikuti gate urut. **Isi file ini harga mati**: patuh = video skor bagus & nol render ulang. Centang `[x]` tiap gerbang + catat via `audira_episode_status update`.

## 3 ATURAN HARGA MATI
1. **GERBANG RENDER** — skor dibereskan di DRAF murah, **final cuma sekali**. Dilarang `render:final`/resolusi penuh sebelum juri LOLOS.
2. **RISET HEMAT TOKEN** — halaman web mentah JANGAN PERNAH masuk konteks utama. Delegasi ke subagent, balik hanya fakta+URL ke `research/SOURCE_REGISTER.md`.
3. **VERIFIKASI MURAH** — tiap gerbang = 1 perintah → 1 baris/exit-code/1 contact sheet ≤1200px. Dilarang baca `timeline.json`/log render utuh, banyak still, skrip Python ad-hoc.

## ISI TEMA (ganti sekali, dipakai semua file)
- Topik: `Sains "kenapa" untuk umum & pelajar: fisika, biologi, kimia, bumi, astronomi`
- Seri: `AUDIRA_SAINS_ANAK_2026` · Episode: `EP94_CARA_KERJA_PRISMA_CAHAYA_PUTIH_TERSEMBUN`
- Channel: `SAINS` (EXPLAINED/FAKTADUNIA/QISSAH/SPORTFACTS/TECH) · Handle: otomatis dari channel (JANGAN ketik @audira)
- Format: `9:16 1080x1920 @60` (world3d = 1 film 9:16; video panjang `16:9 1920x1080 @30` + 2 short / rule 09 ditangguhkan untuk world3d sampai world3d mendukung 16:9)

## 11 TAHAP (urut, ✅ = berhenti minta acc pengguna)
- [ ] **1. Memori** — `audira_motion_brain` + `audira_style_memory` (GLOBAL + `scope:channel`) + NOTES/STYLE_DECISION 2–3 ep terakhir. Anti-template.
- [ ] **2. Riset** → `research/SOURCE_REGISTER.md` (⛔ via subagent). Hanya fakta yang dibutuhkan naskah.
- [ ] **3. ✅ Style** — engine `world3d` (semua video 3D; Remotion hanya bila pengguna memaksa). `audira_recommend_style` (dengan `episodeDir`), tawarkan 1 utama + 1–2 alternatif + cover referensi. Pengguna pilih → `audira_style_memory get <style>` → baca `kits/<style>/KIT.md` (+ `gold/INDEX.md`) **hanya sebagai resep look** (palet, material, kamera, tipografi, post; TSX jangan disalin). Isi `style/STYLE_DECISION.md` (+ `engine: world3d`). ✅ acc.
- [ ] **4. ✅ Docs rule 12 + Naskah** — `docs/ART_DIRECTION.md` → `project/script-lines.json` (8 baris `s1`–`s8`, `{display|spoken}`, `{AUDIRA|Audira}`, 190–210 kata) + `docs/SCRIPT.md` + `docs/STORYBOARD.md` → `docs/ASSET_MANIFEST.md`. Konsep spasial satu dunia. ✅ acc semua sebelum VO dan kode adegan.
- [ ] **5. Pasang world3d** — `audira_project_layout` action `world3d` (biasanya sudah otomatis) → baca `<SERI>/_tools/BRIEF_WORLD3D.md` + 1–2 referensi gold di dalamnya. Timeline estimasi dari `project/`: `python ../../_tools/estimate.py EP94_CARA_KERJA_PRISMA_CAHAYA_PUTIH_TERSEMBUN`.
- [ ] **6. VO** — `audira_generate_voiceover` (lang id) → `audio/vo-words.json` → `audira_episode_status get` membangun `project/timeline.json` + `audio/VO_MASTER.wav`; `world3d.timeline.mismatches` harus 0 (perbaiki sisi `spoken`). **⛔ Dilarang render MP4 sebelum VO dikunci.**
- [ ] **7. Build** — tulis `project/world3d.js`, `build-video.mjs`, `mix.py`; dari `project/`: `node build-video.mjs && python mix.py`. Model nyata + satu post-pass style (bukan primitif), kamera gerak kontinu satu dunia (bukan slide), semua waktu dari anchor `K`/`AT`, fungsi murni dari `t`. Branding: `writeWorld` dengan `sig: "<folder EP>"` + `ep: "94"` (outro + tanda tangan bergerak `shell.mjs`), kata AUDIRA di dunia 3D.
- [ ] **8. ✅ Draf** — `bash ../../_tools/snap.sh EP94_CARA_KERJA_PRISMA_CAHAYA_PUTIH_TERSEMBUN "1,6,…"` (cek framing) → `style/cover-topic.png` (snapshot frame hook) → `bash ../../_tools/sheet.sh EP94_CARA_KERJA_PRISMA_CAHAYA_PUTIH_TERSEMBUN` → `draft/contact-sheet.jpg` → `record_score stage:draft` → poles → ulang → **juri buta**. ✅ acc **hanya setelah juri LOLOS**. (`look.json` belum ada untuk world3d; juri menilai gerak dari contact sheet.)
- [ ] **9. Final (sekali)** — `audira_render_batch` dengan project `EP94_CARA_KERJA_PRISMA_CAHAYA_PUTIH_TERSEMBUN/project/hf`, 60 fps, isi `title`/`slug`/`ep`; **satu film 3D pada satu waktu** (GPU, tidak paralel), jangan `render.sh`, `out/seg` jangan disentuh → `FINAL_VIDEO.mp4`. Cek: `node F:/AUDIRA-SKILL-MOTION/starter/scripts/deliver-check.mjs FINAL_VIDEO.mp4` (−14 LUFS, outro, tanda tangan, `FINAL_CHECK.jpg`, hanya RED/YELLOW).
- [ ] **10. Delivery** — `SOCIAL_CAPTIONS.md` 6 platform lolos `audira_validate_social_captions`, caption tampil di chat. Pelajaran → motion memory (`append_lesson`/`set_best`). Hapus perantara, sisakan final+contact sheet+VO+dokumen.
- [ ] **11. Pasca-tayang** — 24j/72j/7h → `NOTES.md` + motion memory `scope:channel`.

## JEBAKAN PEMBUNUH SKOR (jangan terulang)
Render sebelum VO dikunci · figur kapsul+stik · objek primitif (box/cone/poligon) tanpa shader style · slide statis (Anti-PPT) · cover lemah · akronim/CAPS dibaca huruf-per-huruf (pakai `{display|spoken}` + voice-lock) · black-frame NaN+bloom (cek FINAL_CHECK.jpg) · temp di C: (render temp di F:) · hapus `out/seg` · edit `_tools/` seri · edit `timeline.json` tangan · ketik @audira manual.

**RUMUS:** skor bagus = cover kuat × terapkan memori style × poles sampai juri LOLOS × nol jebakan × verifikasi murah.
