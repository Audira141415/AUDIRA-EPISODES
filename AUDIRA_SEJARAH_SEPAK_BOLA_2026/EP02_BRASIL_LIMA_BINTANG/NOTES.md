# NOTES — EP02_BRASIL_LIMA_BINTANG

- Seri: AUDIRA Sejarah Sepak Bola (channel AUDIRA Sport Facts, @AudiraSportFacts). Style: TIMEFORGE.
- VO: Cartesia sonic-3 id, voice 04b567df (Galang), speed 1.0, teks fonetik di docs/script-lines.json (_tools/write_lines.py). Durasi film 85.439 s (VO selesai 81.439 s + 4 s outro). Offset VO 0.
- Mix: _tools/mix.py (VO -16 LUFS, bed prosedural _tools/synth_bgm.py ducking -9 dB, 14 SFX dari shared/assets/sfx) -> -14 LUFS, TP <= -1.5 dBTP.
- Juri buta draf: 4.0 (ronde 3).
- Pelajaran: Kedalaman terkunci 3 di studio pucat -> vignette + DOF + kabut. Juri: bola cokelat terbaca bola basket (tambah jahitan panel + tali), kata caption belum diucap terlalu pucat (#5a5a5a), payoff bintang ke-6 dibangun ulang tanpa pita lantai.
- Outro: <AudiraOutro> (channel dari src/brand/channel.json) dipasang di Root.tsx; _shared/Outro.tsx jadi no-op sejak 2026-11-12. AudiraSignature mulai 3 s agar frame cover bersih.
- Fakta yang bisa berubah ditulis "per November 2026"; cek ulang bila upload tertunda.
