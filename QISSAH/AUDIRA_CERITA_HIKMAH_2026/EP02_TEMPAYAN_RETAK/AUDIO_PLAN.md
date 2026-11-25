# AUDIO PLAN — EP02 (draf bisu: musik + ambience + SFX; suara menyusul setelah naskah disetujui)

**Pemeran (Cartesia sonic-3, id):** Narator = Risa `6a3fe952` (speed 0,9–1,0); Tukang air = Galang `04b567df` (0,92–1,0); Tempayan retak = Andi `a053f6bc` (0,92–0,95); Tempayan utuh = Risa speed 1,08 (label caption berbeda). Maks 3 suara.

**Musik (numpy, `mix.py`):** tanpura (drone D, siklus Pa–Sa–Sa–Sa rendah, 3 dtk) + seruling bansuri sintetis (sinus + napas + vibrato) di raga Bhupali (pentatonik pagi). Frasa per beat: open (hook), walk (s2d, s3a), proud (s3d), sad (s3f, s4e, s5c), bloom (s5a, s6d), gold (s6a, s6f), end (s7d, outro). Kendang tangan lembut 72 bpm hanya saat berjalan. Musik turun ~50% di bawah setiap baris (envelope dari timeline), naik setelah s6a. Mix draf: -23,9 LUFS terintegrasi, peak 0,36 (headroom untuk VO).

**Ambience:** angin (noise low-pass), gemericik mata air (band-pass, hanya di adegan mata air), kicau burung FM acak (lebih ramai di adegan bunga), langkah kaki di tanah kering saat berjalan, plink tetes di close-up retakan dan macro.

**SFX:** chime (judul, s7a, outro), whoosh-short (s2a, s4a, s5a, s7b), whoosh-cinematic (time-lapse), riser berakhir di emas pertama (s6a + 1,2 dtk), sparkle (emas s6a, benih s6c, s7a), ping (mekar s5a, s6d), pop lembut ×6 (mekar).

**Setelah suara terkunci:** timeline nyata menggantikan estimasi, jalankan `python src/scenes/ep02/mix.py` lagi, lalu VO di atas (VO -16 LUFS, musik ~15 dB di bawah, master -14 LUFS).
