# NOTES — EP05_GUIDED_LEARNING

Tanggal: 2026-11-08/09 · Style: SKETCHFORGE · Seri AUDIRA AI TUTORIAL 2026 (EP05/05)

## Produksi
- Studio bersama: `../studio` (Remotion 4 + R3F starter v4.2, node_modules junction ke studio Cerita Hikmah). Scene: `studio/src/scenes/ep05`.
- VO: Cartesia sonic-3 Galang (04b567df), `_tools/make_vo_requests.py` → `tts-cartesia.mjs` → `_tools/build_vo.py`. Tempo x1.15, VO selesai 86.03 dtk, film 90.23 dtk. Offset VO di film: 0 (lead 0,6 dtk sudah di dalam vo.wav).
- Ejaan TTS: "AI"→"ei-ai" (e-ai terbaca "i/saya"), AUDIRA→"Audira", Gemini→"Jemini", Google→"Gugel", SynthID→"Sint-ai-di"; istilah Inggris (NotebookLM, PDF, PR, Add image, Add files, More tools, Guided Learning) dibiarkan asli karena ejaan fonetik justru salah dibaca (diuji dengan Whisper base).
- Musik: bed prosedural `_tools/synth_bgm.py` (bebas lisensi), SFX `shared/assets/sfx`, mix `_tools/mix.py` −14 LUFS, TP < −1,5 dBTP.
- Final: `_tools/render_finals.sh` (1080×1920@60, concurrency 8, skrip render tanpa cache webpack), `_tools/finalize.sh` (metadata + arsip), `_tools/qa_final.py`.

## Catatan episode
- Lampu terpotong tepi kanan atas (16 s, 80 s) → target kamera digeser; X merah mulai 0,6 s agar hook kuat. Halo lampu = lapisan glow 2D.

## Pelajaran lintas seri
- Cache webpack bersama (node_modules junction) bisa merender kode lama: pakai salinan stills/render-final dengan `enableCaching:false`.
- Contact sheet harus dirender ulang setelah setiap perubahan kode sebelum dinilai.

## Review pasca-tayang (isi nanti)
- 24 jam: —
- 72 jam: —
- 7 hari: —
