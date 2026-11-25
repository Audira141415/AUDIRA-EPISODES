# NOTES — EP04_REAL_MADRID_RAJA_EROPA

- Seri: AUDIRA Sejarah Sepak Bola (channel AUDIRA Sport Facts, @AudiraSportFacts). Style: MARBLEMUSEUM.
- VO: Cartesia sonic-3 id, voice 04b567df (Galang), speed 1.0, teks fonetik di docs/script-lines.json (_tools/write_lines.py). Durasi film 87.779 s (VO selesai 83.779 s + 4 s outro). Offset VO 0.
- Mix: _tools/mix.py (VO -16 LUFS, bed prosedural _tools/synth_bgm.py ducking -9 dB, 14 SFX dari shared/assets/sfx) -> -14 LUFS, TP <= -1.5 dBTP.
- Juri buta draf: 4.0 (ronde 2).
- Pelajaran: Alas krem polos terbaca plastik -> marmer berurat prosedural (roughness 0.3, clearcoat ringan); patung ToyPerson -> stele batu + plakat kuningan. Penanda 'setengah dari 15' (garis hijau) dihapus karena terbaca sisa guide.
- Outro: <AudiraOutro> (channel dari src/brand/channel.json) dipasang di Root.tsx; _shared/Outro.tsx jadi no-op sejak 2026-11-12. AudiraSignature mulai 3 s agar frame cover bersih.
- Fakta yang bisa berubah ditulis "per November 2026"; cek ulang bila upload tertunda.
