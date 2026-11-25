# NOTES — EP05_KLUB_RAJA_LIGA

- Seri: AUDIRA Sejarah Sepak Bola (channel AUDIRA Sport Facts, @AudiraSportFacts). Style: TACTICBOARD.
- VO: Cartesia sonic-3 id, voice 04b567df (Galang), speed 1.0, teks fonetik di docs/script-lines.json (_tools/write_lines.py). Durasi film 78.307 s (VO selesai 74.307 s + 4 s outro). Offset VO 0.
- Mix: _tools/mix.py (VO -16 LUFS, bed prosedural _tools/synth_bgm.py ducking -9 dB, 14 SFX dari shared/assets/sfx) -> -14 LUFS, TP <= -1.5 dBTP.
- Juri buta draf: 4.0 (ronde 5).
- Pelajaran: Komposisi 3 selama 4 ronde: kolom puck sejajar tanpa subjek. Fix: jalur hero (hanya yang disebut menyala, sisanya titik samar), tiga streak 14 digabung jadi satu jalur '14x', outro satu tumpukan hero. Label diputar 90 derajat tidak terbaca di HP.
- Outro: <AudiraOutro> (channel dari src/brand/channel.json) dipasang di Root.tsx; _shared/Outro.tsx jadi no-op sejak 2026-11-12. AudiraSignature mulai 3 s agar frame cover bersih.
- Fakta yang bisa berubah ditulis "per November 2026"; cek ulang bila upload tertunda.
