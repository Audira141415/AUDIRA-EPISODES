# NOTES — EP03_PEMAIN_TERBAIK_SEPANJANG_MASA

- Seri: AUDIRA Sejarah Sepak Bola (channel AUDIRA Sport Facts, @AudiraSportFacts). Style: DATAPHYSICAL.
- VO: Cartesia sonic-3 id, voice 04b567df (Galang), speed 1.0, teks fonetik di docs/script-lines.json (_tools/write_lines.py). Durasi film 82.317 s (VO selesai 78.317 s + 4 s outro). Offset VO 0.
- Mix: _tools/mix.py (VO -16 LUFS, bed prosedural _tools/synth_bgm.py ducking -9 dB, 14 SFX dari shared/assets/sfx) -> -14 LUFS, TP <= -1.5 dBTP.
- Juri buta draf: 3.83 (4 ronde, tidak lolos; pengguna memilih lanjut).
- Pelajaran: Kedalaman terkunci 3 (separasi ~55 vs cover ~100): studio gelap tanpa lapisan MG/FG. Label 3D melayang terpotong -> diganti label HTML terproyeksi. Episode DATAPHYSICAL berikutnya: bangun lingkungan (lantai berpendar, baris pilar BG, prop FG) sejak awal.
- Outro: <AudiraOutro> (channel dari src/brand/channel.json) dipasang di Root.tsx; _shared/Outro.tsx jadi no-op sejak 2026-11-12. AudiraSignature mulai 3 s agar frame cover bersih.
- Fakta yang bisa berubah ditulis "per November 2026"; cek ulang bila upload tertunda.
