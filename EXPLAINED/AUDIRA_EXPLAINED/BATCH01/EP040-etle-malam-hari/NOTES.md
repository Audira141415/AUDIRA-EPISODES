# NOTES — EP040-etle-malam-hari

- VO: Cartesia sonic-3, Galang `04b567df…`, per kalimat; tepi klip dipangkas energi RMS, jeda internal >0,32 dtk dirapatkan, lalu atempo ×1.06 supaya VO berakhir ~61 dtk. Offset VO di final = 0 (mix sudah termasuk lead 0.6 dtk). Tool: `_tools/build_vo.py`.
- Musik: MusicGen tidak ada di cache (C: penuh, unduhan HF lambat) → bed prosedural numpy `_tools/synth_bgm.py` (tema unik per episode), ducking −9 dB di bawah suara, mix `_tools/mix.py` −14 LUFS.
- Film: Remotion + R3F di studio bersama `BATCH01/studio`, scene `src/scenes/ep040`; final `_tools/render_finals.sh` (concurrency 8, total 5 film ≈ 14 menit).
- Gagal/pelajaran: rate limit 5 jam menghentikan 5 agen paralel di tengah build (dilanjut via SendMessage); Galang membaca ~125–144 WPM sehingga naskah 132–152 kata → 70–81 dtk sebelum dirapatkan; whisper tidak andal menilai singkatan.
