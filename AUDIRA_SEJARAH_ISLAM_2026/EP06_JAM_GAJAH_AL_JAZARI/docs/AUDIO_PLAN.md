# Audio Plan — EP06 Jam Gajah Al-Jazari

- **VO (terkunci):** `audio/vo.wav` (Cartesia, Galang), −16,3 LUFS, puncak −1,5 dBFS; master clock. Disalin ke `project/public/audio/vo.wav`.
- **Bed:** `project/src/scenes/jazari/mix.py` → `project/public/audio/bed.wav` (92,49 s, −24,9 LUFS). Identitas: "jam air di istana yang tenang" — drone D + kuint, motif oud (Karplus-Strong) di D Hijaz pada tiap pembukaan part, tick kayu 1 dtk (jam) dari hook sampai payoff, gelembung air + tetes saat "lubang kecil", tanpa vokal/nyanyian.
- **SFX mekanisme (sintetis, tiap event = kata):** peluit burung ("bersiul" ×2, "peluit"), gelinding bola (hook, "bola", "melepas", "menunduk"), "tang" simbal ("simbal" ×2, bola mengangkat mangkuk), derit tali ("menarik").
- **SFX pustaka** (`shared/assets/sfx/`): whoosh-cinematic (pembuatnya, rahasianya, Al-Jazari menulis), pop (Artuqid, boneka), click-soft (50, kastil, lubang), sparkle (gambar), whoosh-short (terkenal, padahal), chime (pertunjukan, outro), impact-bass-1 (tenggelam, Dubai), riser (replika), ping (dewasa).
- **Mix:** bed −5 dB, sidechain ke VO (threshold 0,02, ratio 4, attack 20 ms, release 450 ms), amix tanpa normalisasi → `project/public/audio/full.wav` (92,485 s, −16,4 LUFS, puncak −4,2 dBFS). Bed ≈ −30 LUFS di bawah suara (≈ 14–15 dB di bawah VO). Normalisasi −14 LUFS saat render final.
