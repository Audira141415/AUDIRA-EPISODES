# Audio Plan: EP05 (DEVFORGE)

- **VO (terkunci):** `audio/vo.wav` (Cartesia, -16 LUFS), salinan `studio/public/audio/ep05/vo.wav`. Selesai 90,83 dtk, film 94,83 dtk.
- **Bed:** `studio/src/scenes/ep05/mix.py` (numpy/scipy, seed tetap 505) menulis `public/audio/ep05/bed.wav` (48 kHz stereo, 94,83 dtk, puncak -6 dBFS, tanpa vokal):
  - arpeggio synth persegi 16th, 110 BPM, Am–F–C–G (2 bar per akor), pan kiri/kanan;
  - pad saw detune dengan lowpass 1,4 kHz;
  - sub-bass sinus per 8th; kick tiap ketukan; hi-hat noise halus;
  - klik keyboard sintetis saat mengetik (hook, "satu pesan", "Satu, tulis spesifik", outro).
- **SFX** (`shared/assets/sfx`, ditambatkan ke kata): whoosh-cinematic di setiap perpindahan stasiun; error ("asal-asalan"), glitch-1 ("hasilnya"); pop untuk 5 genre, 3 kunci, tag siapa/apa/kapan, 4 centang; whoosh-short (gelembung prompt, "edit", "jadi tata letak"); glitch-2 ("habis"); ping (koin kredit); impact-bass-1 ("14%", "permanen"); sparkle ("diterbitkan"); click ("pilih"); riser (2 dtk sebelum "Ingat"); chime ("jadi", outro card); click-soft ×2 ("rapikan").
- **Mix:** bed -5 dB, sidechain ke VO (threshold 0,02, ratio 4, attack 20 ms, release 450 ms), amix tanpa normalisasi → `public/audio/ep05/full.wav` (94,83 dtk, -16,4 LUFS, puncak -4,3 dBFS). Bed kira-kira 15 dB di bawah suara. Mastering ke -14 LUFS dilakukan render final (`--vo full.wav`).
