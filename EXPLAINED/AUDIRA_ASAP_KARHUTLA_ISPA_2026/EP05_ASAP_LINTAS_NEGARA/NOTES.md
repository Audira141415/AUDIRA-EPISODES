# NOTES — EP05_ASAP_LINTAS_NEGARA

## Produksi
- VO: Cartesia sonic-3, suara Galang (04b567df), speed 1.0, tanpa atempo. Teks TTS di `docs/script-lines.json` (angka dibaca kata, singkatan dieja Indonesia, "Audira").
- Offset VO: 0,1 dtk lead; film = VO + 4 dtk outro. Timeline: `audio/timeline.json` → `studio/src/scenes/ep05/timeline.json` (`_tools/make-timeline.py`).
- Film: Remotion + R3F di `studio/src/scenes/ep05/`, dibangun subagen dari `_style/FILM_BRIEF.md`.
- Audio: bed prosedural `_tools/synth_bgm.py ep05`, mix `_tools/mix.py ep05` (−14 LUFS), SFX `audio/sfx-cues.json`.
- Final: `_tools/render_finals.sh ep05` (NVENC, concurrency 8); arsip di `archive/2026-11-10/`.
- Klip risiko draf: 22–40 dtk.

## Pelajaran
- Hook dimundurkan (d≈8) agar pantai Sumatra terbaca, asap memanjang searah angin, detail peta (sungai, laut, kota). Sisa: asap dekat kadang seperti lembaran abu.
- Caption karaoke tidak boleh memisahkan angka dari satuannya; label HUD minimal 26 px @1080.
- Angka layar hanya dari naskah / riset HIGH.

## Review pasca-tayang (isi nanti)
- 24 jam: views, rata-rata durasi tonton, retensi 3 dtk, komentar.
- 72 jam:
- 7 hari:
