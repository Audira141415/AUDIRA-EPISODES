# Audio Plan — EP04 Mansa Musa: Emas di Kairo

- **VO (master clock):** `audio/vo.wav` (Cartesia, Galang, -16 LUFS), salinan di `project/public/audio/vo.wav`. Tidak diubah.
- **Bed:** `project/src/scenes/mansamusa/mix.py` (jalankan dari `project/`) → `public/audio/bed.wav` 94,192 dtk, 48 kHz stereo, -27,0 LUFS. Musik + ambience + SFX saja, tanpa suara.
- **Mix akhir:** perintah ffmpeg dari brief (bed -5 dB, sidechain ke VO, amix) → `public/audio/full.wav`: -16,0 LUFS terintegrasi, true peak -4,3 dBFS, 94,192 dtk. Bed ±15 dB di bawah suara. File ini yang dipakai render final (`--vo`).

## Identitas musik
Afrika Barat bertemu Kairo, 84 bpm: harpa mirip kora (Karplus-Strong, F pentatonik, ostinato dua tangan) di atas drone F/C; oud rendah menjawab dalam maqam Rast di F (terts dan septim seperempat nada) sejak rombongan masuk Kairo; ney pendek untuk al-Umari, Atlas Katalan, dan penutup; perkusi sangat ringan (daf + shaker) hanya di bagian Main. Tanpa nyanyian.

## Cue sheet (semua terikat kata)
| Kata | Cue |
|---|---|
| hook 0,3–4,0 | gemerincing koin hujan emas |
| "jatuh" | impact-bass-1 |
| "Namanya" | whoosh-cinematic (naik ke peta), angin gurun masuk |
| "garam" / "Bambuk" | pop / sparkle |
| "berangkat", "Makkah" | whoosh-short, pop |
| "1324" | whoosh-cinematic (terbang ke Giza); daf + shaker mulai |
| "menyeberangi" | whoosh-short, air Nil |
| "mengirim" … "Sultan" | koin di peti, impact kecil pada "Sultan" |
| "setiap" … "emas" | koin ke tiap pejabat |
| "pasar" | whoosh-cinematic kembali ke pasar, keramaian pasar |
| "mencatatnya" | typing lembut (pena), ney |
| "mitsqal" | click-soft |
| "dua puluh lima dirham" | 25 koin perak bertumpuk |
| "turun" | impact-bass-1, 3 koin jatuh |
| "Sederhananya" | riser kecil, banjir koin |
| "dua belas" | pop |
| "twist" | glitch-1 sangat pelan |
| "bekal" | impact-bass-1 |
| "berutang", "pada pedagang Kairo" | click (segel), koin bergeser |
| "Eropa" | whoosh-cinematic ke peta |
| "bongkah" | sparkle |
| voEnd + 0,55 | chime (kartu outro) |

SFX dari `F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/` (catalog.json). Koin, angin, keramaian, dan air disintesis numpy (seeded, deterministik).
