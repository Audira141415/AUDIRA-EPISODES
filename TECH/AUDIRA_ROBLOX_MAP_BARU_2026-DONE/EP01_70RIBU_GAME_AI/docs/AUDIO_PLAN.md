# Audio Plan — EP01

## VO (terkunci)
`audio/vo.wav` (-16,5 LUFS) menjadi master clock dan tidak diubah.

## Bed
`studio/src/scenes/ep01/mix.py` menulis `studio/public/audio/ep01/bed.wav` (48 kHz stereo, 91,71 dtk, -23,6 LUFS). Semua bunyi disintesis dengan numpy:
- arpeggio marimba C–Am–F–G di 112 BPM, bass pluck, dan pad lembut;
- kick dan hi-hat masuk setelah "meledak";
- mode minor (Am–F–Dm–E, oktaf rendah, kerapatan separuh) dari "Tapi" sampai "Bikin" (l13);
- akord penutup yang berdengung sampai kartu outro;
- klik bata sintetis di momen merakit (l02, l04, l06, l07, l08, l12, l13);
- room tone tipis.

## SFX pustaka
Diambil dari `shared/assets/sfx/` dan ditempel pada waktu kata:

| SFX | Kata |
|---|---|
| sparkle | "Lebih", "80%", "beda" |
| impact-bass-1 | "70.000", "meledak" |
| typing | "tulis" |
| click | "merakitnya" |
| pop | "Juli", "9.000", "500.000", "70.000" (kedua), "Break", "Huss" |
| ping | "71%", "3%" |
| whoosh-cinematic | sebelum "meledak", "ledakan", "bongkar" |
| whoosh-short | "Dan" (l08) |
| chime | "tembus", "Ikuti" |
| click-soft | "turun" |
| glitch-1 | "gelapnya" |
| whoosh | "menjiplak" |
| glitch-2 | "bermunculan" |

## Mix
- Bed diturunkan -5 dB, lalu dikompres sidechain dari VO (threshold 0,02, ratio 4, attack 20, release 450).
- Hasilnya `public/audio/ep01/full.wav`: -16,5 LUFS integrated, bed ±13–15 dB di bawah suara.
- Render final memakai `--vo public/audio/ep01/full.wav`; target -14 LUFS dicapai di tahap final.
