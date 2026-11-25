# Audio Plan — EP07

- **VO:** `audio/vo.wav` (Cartesia Galang, terkunci, -16,3 LUFS), juga `project/public/audio/vo.wav`.
- **Bed:** `project/src/scenes/battuta/mix.py` → `project/public/audio/bed.wav` (92.2 dtk, -25,9 LUFS). Maqam Rast pada C (pembulatan 12-TET), 66 bpm: drone C/G, petikan mirip oud (Karplus-Strong), ney di Tangier, Sumutra, payoff dan outro; riq ringan hanya saat rute bergerak; laut di pantai, angin saat terbang, guruh pada badai. Tanpa nyanyian.
- **SFX (shared/assets/sfx):** impact-bass-1 (hook, "hancur", "Sumatra"), whoosh-cinematic/short (terbang, Tiongkok, kembali ke Sumatra, ikhtisar), pop (papan, Tangier, tag, tiga matahari), click-soft (chip 16 bulan), riser ("memberi"), sparkle, chime ("Asar", outro). Semua ditambatkan ke kata.
- **Campur:** perintah sidechaincompress + amix dari brief → `project/public/audio/full.wav` (-16,3 LUFS, peak -4,3 dBFS); bed ±15 dB di bawah suara. Final dirender dengan `--vo public/audio/full.wav`.
