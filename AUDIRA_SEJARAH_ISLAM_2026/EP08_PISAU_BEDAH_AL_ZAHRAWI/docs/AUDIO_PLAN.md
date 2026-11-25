# Audio Plan — EP08

- **VO:** `audio/vo.wav` (Cartesia Galang, terkunci, -16 LUFS) = master clock; disalin ke `project/public/audio/vo.wav`.
- **Bed:** `project/src/scenes/zahrawi/mix.py` → `public/audio/bed.wav` (94,19 s, 48 kHz). Maqam Nahawand di C, 66 bpm: drone C/G, petikan mirip qanun (Karplus-Strong), frase ney di context, payoff (Abad ke-12) dan outro; daf ringan hanya di payoff; room tone studio; "tick" logam saat tiap alat naik; petikan oud sungguhan saat "senar".
- **SFX (shared/assets/sfx):** impact-bass-1 (hook, "200"), sparkle ("tinta"), whoosh-cinematic (transit buku↔peta↔nampan), pop (Kordoba, Toledo, Salerno, Montpellier), whoosh-short, click-soft (tab ke-30, gunting), click (pisau keluar sarung), chime (kartu outro).
- **Mix:** bed -5 dB, sidechain ke VO (threshold 0,02, ratio 4, attack 20, release 450) → `public/audio/full.wav`. Terukur: VO -16,2 LUFS, full -16,3 LUFS (master ke -14 LUFS di render final).
- **Catatan:** `full.wav` 93,95 s (amix `duration=first` mengikuti aliran bed yang dikompres); 0,24 s terakhir kartu outro tanpa audio — cek di render final.
