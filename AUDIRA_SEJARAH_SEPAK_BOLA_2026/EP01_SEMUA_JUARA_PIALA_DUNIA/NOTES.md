# NOTES — EP01_SEMUA_JUARA_PIALA_DUNIA

- Seri: AUDIRA Sejarah Sepak Bola (channel AUDIRA Sport Facts, @AudiraSportFacts). Style: HISTORYMAP.
- VO: Cartesia sonic-3 id, voice 04b567df (Galang), speed 1.0, teks fonetik di docs/script-lines.json (_tools/write_lines.py). Durasi film 82.489 s (VO selesai 78.489 s + 4 s outro). Offset VO 0.
- Mix: _tools/mix.py (VO -16 LUFS, bed prosedural _tools/synth_bgm.py ducking -9 dB, 14 SFX dari shared/assets/sfx) -> -14 LUFS, TP <= -1.5 dBTP.
- Juri buta draf: 4.33 (ronde 2).
- Pelajaran: Ronde 1 juri 3.83: stempel 3D dan kartu Pickles terpotong di tepi, stempel merah di atas cangkir wireframe kurang kontras. Fix: stempel/kartu HTML screen-space dengan plat gelap, satu prop per momen, pin hanya negara yang sedang disebut. Kamera 26.7-29.3 s tersentak (audit 3) -> dihaluskan jadi 5.
- Outro: <AudiraOutro> (channel dari src/brand/channel.json) dipasang di Root.tsx; _shared/Outro.tsx jadi no-op sejak 2026-11-12. AudiraSignature mulai 3 s agar frame cover bersih.
- Fakta yang bisa berubah ditulis "per November 2026"; cek ulang bila upload tertunda.
