# Audio Plan: EP01 Al-Qarawiyyin

- **VO (terkunci):** `audio/vo.wav` (Cartesia, suara Galang, -16 LUFS), salinan di `project/public/audio/vo.wav`. Jam induk: `audio/timeline.json` (lead 0,6 dtk, voEnd 90,33 dtk, total 94,33 dtk).
- **Bed:** `project/src/scenes/qarawiyyin/mix.py` (jalankan dari `project/`) -> `public/audio/bed.wav` (94,33 dtk, musik + ambience + SFX, tanpa suara). Diukur: -25,7 LUFS, peak -7,0 dBFS.
- **Mix:** `public/audio/full.wav` = bed -5 dB, sidechain ke VO (threshold 0,02, ratio 4, attack 20 ms, release 450 ms), VO di atas. Diukur: -16,2 LUFS, peak -4,2 dBFS; bed sekitar 15 dB di bawah suara. Render final memakai `--vo public/audio/full.wav` lalu loudnorm ke -14 LUFS / true peak < -1 dBFS.

## Identitas musik (beda dari bed Makkah yang Hijaz)
Warna maqam Bayati pada G (G, A seperempat-turun, Bb, C, D), sintesis numpy:
- drone G2/D3/G3 bernapas pelan, sedikit naik saat pintu dibuka;
- frasa ney (nada sinus + napas noise, vibrato) di awal tiap bagian (context, main, explanation, payoff, outro) dan setelah VO selesai;
- petikan qanun (Karplus-Strong G-Bb-D-G-Bb) di setiap gelombang mosaik (7 kali);
- bendir teredam hanya di hook dan payoff; tanpa nyanyian.

## Ambience
- Gemericik air halaman: dari "airnya" (35,90) sampai perpustakaan (55,57).
- Room tone perpustakaan: "Tahun" 1349 (55,57) sampai "Ruang" (65,15).

## SFX (`F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/`)
| Waktu (kata) | SFX | Gain |
|---|---|---|
| 0,62 | impact-bass-1 | 0,30 |
| "Empat" kedua (3,04) | impact-bass-1 | 0,20 |
| tiap gelombang mosaik ("bukan", "Abad", "Menurut", "tumbuh", "Tahun" 1349, "dijaga", "tempat") | whoosh-cinematic -0,9 dtk + 6 click-soft (keping mendarat) | 0,16 / 0,10 |
| "Kairouan", "perempuan", "Sultan", "dalamnya" | sparkle | 0,10-0,12 |
| "859" | pop | 0,14 |
| dinding naik ("membangun" + 1,3 dtk x5) | click-soft | 0,09 |
| "ijazah" | chime | 0,14 |
| kunci masuk (4 kata) dan berputar ("keempatnya") | click | 0,22 / 0,16 |
| "membukanya" | riser -1,6 dtk, impact-bass-1 +0,2 dtk | 0,14 / 0,26 |
| "1963" | whoosh-cinematic | 0,16 |
| outro card (90,93) | chime | 0,18 |
