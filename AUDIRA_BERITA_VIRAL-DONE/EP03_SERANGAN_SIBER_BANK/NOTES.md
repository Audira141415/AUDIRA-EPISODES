# NOTES — EP03_SERANGAN_SIBER_BANK

- Style: CYBERFORGE · short 9:16 1080×1920 @ 60 · final 2026-11-11 · `FINAL_VIDEO.mp4` (yuv420p limited range, metadata AUDIRA)
- VO: Cartesia sonic-3 id, voice 04b567df (Galang), lead 0,1 dtk (offset 0 di mix), speech 81.575 dtk, film 85.575 dtk (outro AUDIRA ±4 dtk).
- Audio: VO -16 LUFS → mix -14 LUFS (final terukur -13,7 LUFS, TP ≤ -1,7 dBTP); bed prosedural `_tools/synth_bgm.py` tema ep03, ducking -9 dB di bawah suara, 14 SFX cue (`audio/sfx-cues.json`).
- Skor style memory: cover / draf / final LOLOS (lihat motion-memory CYBERFORGE.md).
- Arsip: `archive/2026-11-11/` (FINAL_VIDEO.mp4, vo.wav, mix.wav, project-ep03.tar).
- Catatan produksi: Render CLI gagal "ThreeLine is not part of the THREE namespace" (CyberGrid kit); diperbaiki di scene dengan extend({ ThreeLine: THREE.Line }). Re-voice baris payoff ("aiti").
- NVENC menghasilkan yuvj420p (full range); dikonversi dengan `_tools/fix_range.sh` ke yuv420p tv. Ukuran file ±260–330 MB (±27–34 Mbps).
- Belum: VO belum didengar manusia; review pasca-tayang 24 jam / 72 jam / 7 hari (tahap 11) setelah upload.
