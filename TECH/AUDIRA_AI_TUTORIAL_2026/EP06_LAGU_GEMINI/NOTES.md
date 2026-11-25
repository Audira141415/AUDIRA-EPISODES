# NOTES — EP06_LAGU_GEMINI

Tanggal: 2026-11-10 · Style: RETROWAVE · Seri AUDIRA AI TUTORIAL 2026 (EP06/10, batch 2)

## Produksi
- Studio bersama `../studio` (Remotion 4 + R3F starter v4.2). Scene: `studio/src/scenes/ep06`; dibangun subagen dari `FILM_BRIEF.md` (bagian batch 2).
- VO: Cartesia sonic-3 Galang (04b567df), `_tools/make_vo_requests.py SCRIPTS_DRAFT_B2.md` → `tts-cartesia.mjs` → `_tools/build_vo.py`. Tempo x1.032, VO selesai 86,0 dtk, film 90,2 dtk. Offset VO di film: 0 (lead 0,6 dtk di dalam vo.wav).
- Ejaan TTS khusus: Belum cocok?" ditolak TTS → "Kurang pas?"; " & "→"en", lo-fi→"lo-fai". Diperiksa dengan Whisper small (base terlalu sering salah dengar).
- Musik: bed prosedural `_tools/synth_bgm.py` tema ep06 (bebas lisensi), SFX `shared/assets/sfx` (14 cue), mix `_tools/mix.py` −14 LUFS; final terukur −13,6 s.d. −13,7 LUFS, TP ≤ −1,7 dBTP.
- Final: `_tools/render_finals.sh` (1080×1920@60, concurrency 8, tanpa cache webpack), `_tools/finalize.sh` (metadata + arsip `archive/2026-11-10/`), `_tools/qa_final.py` (sheet dari MP4 di `qc/`). Skor final motion memory: LOLOS 4,0.

## Catatan episode
- Panggung 3D diam di balik panel UI 18–47 dtk; label Unduh/Bagikan berbahasa Indonesia; genre pop/rock adalah contoh buatan sendiri.

## Pelajaran lintas seri
- Kata yang gagal dibaca TTS berulang lebih cepat diganti di naskah daripada dieja fonetik.
- `node` di dalam loop `while read` memakan stdin: tambahkan `</dev/null`.
- FFmpeg exit 3221225794 (0xC0000142) saat render = gagal init DLL Windows, transien; cukup render ulang episode itu.

## Review pasca-tayang (isi nanti)
- 24 jam: —
- 72 jam: —
- 7 hari: —
