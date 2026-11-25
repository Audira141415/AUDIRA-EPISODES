# AUDIO PLAN — EP08

- **Suara (terkunci):** `public/audio/ep08/vo.wav`, -16 LUFS. Narator Risa `6a3fe952`; pria/suami Galang `04b567df` (surat dibacakan dengan suaranya); gadis/istri Risa.
- **Bed `public/audio/ep08/mix.wav`** (283,7 dtk, 48 kHz stereo, sekitar -24 LUFS, tanpa suara), dibuat dengan `python src/scenes/ep08/mix.py` dari `studio_16x9/`:
  - Musik: waltz gitar nilon 3/4, F mayor (F–Dm–Bb–C), sekitar 66 bpm, petikan aditif dengan ketukan badan gitar; melodi kecil di pesta dan di hikmah. Saat surat (s10): pad lembut Dm–Bb–F–C dan kotak musik yang jarang-jarang. Turun saat kepergian (s9), naik penuh di hikmah.
  - Ambience per set: murmur kedai, obrolan pesta (memudar saat tamu pulang), ombak dan camar di pantai, burung pagi dan detak jam di dapur, room tone dan jam pelan saat surat.
  - SFX: whoosh-short di setiap sapuan panel flanel; chime di pembuka, di "Aku tidak suka kopi asin", di hikmah dan di outro; pop saat garam diletakkan; klik halus untuk butiran garam dan kalender; ping saat kepala menoleh dan air mata jatuh; sparkle untuk sulaman kenangan dan "Manis"; riser sebelum surat.
  - Ducking: musik turun 50% dan ambience 35% di bawah setiap baris suara (envelope dari timeline.json).
- **Mix akhir (oleh lead):** `bash scripts/combine-vo.sh ep08` menghasilkan `full.wav`, lalu render final dengan `--vo`. Film tidak memutar audio sendiri.
