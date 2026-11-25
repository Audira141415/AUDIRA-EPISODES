# Audio Plan — EP03 RAHASIA SUMUR ZAMZAM

## Suara (terkunci, tidak diubah)
- `audio/vo.wav`: narasi panjang, Cartesia Galang (`04b567df-2923-4b0c-896b-4b7df0a07e1a`), −16 LUFS, 48 kHz mono, 674,085 dtk (suara selesai 654,085 dtk + 20 dtk end screen). Disalin ke `project/public/audio/vo.wav`.
- Short: `project/src/scenes/zamzam/shorts.py` menyusun `public/audio/short01_vo.wav` dan `short02_vo.wav`: klip hook `sNN_hook` + potongan `vo.wav` (dipotong di waktu kata pertama −0,06 dtk dan kata terakhir +0,18 dtk) + klip `sNN_outro`, jeda 0,4 dtk, ekor 1,2 dtk; loudnorm dua pass ke −16 LUFS (terukur −16,1 dan −16,0). Peta segmen dan kata ber-waktu-short di `short01.json` / `short02.json`.

## Bed (musik + ambience + SFX, tanpa suara)
`project/src/scenes/zamzam/mix.py` → `public/audio/bed.wav` (674,085 dtk, −25 LUFS).
- **Identitas "air di bawah batu":** drone D2 + A2 + D3, kwint bernapas pelan (LFO 23 dtk); frasa mirip ney (sinus + napas bandpass, vibrato 5,2 Hz) di maqam Hijaz D tiap ±14 dtk; pluck mirip qanun (D–F#–G–A) di tiap kartu bab; frame-drum sangat pelan hanya di c05–c06. Tanpa nyanyian.
- **Ambience:** room tone bawah tanah (noise low-pass) dan tetes air sintetis, keras-lunaknya mengikuti bab (paling rapat di c05–c06).
- **SFX (shared/assets/sfx):** whoosh-cinematic di tiap batas bab (−15 dB relatif), chime di kartu bab, riser di hook, impact-bass-1 saat suara selesai, sparkle di outro.
- **Level:** musik dinormalkan ke RMS 0,05, fade in 1 dtk, fade out 1,5 dtk, peak ≤ 0,9.

## Mix
`ffmpeg sidechaincompress` sesuai brief (bed −5 dB, threshold 0,02, ratio 4, attack 20, release 450, lalu amix tanpa normalisasi):
| File | Integrated | Peak |
|---|---|---|
| `public/audio/full.wav` (video panjang, dipakai `--vo` saat render final) | −16,5 LUFS | −4,3 dBFS |
| `public/audio/short01_full.wav` | −16,2 LUFS | −4,4 dBFS |
| `public/audio/short02_full.wav` | −16,0 LUFS | −4,4 dBFS |

Bed short dipotong dari bed panjang mengikuti segmen sumbernya (hook memakai bed pembuka, outro memakai bed penutup), crossfade 0,3 dtk.

Final: mastering ke −14 LUFS, true peak < −1 dBFS setelah render (tahap 9, belum dikerjakan).

## Cue utama
| Waktu | Cue |
|---|---|
| 0:01 | riser, drone masuk |
| 0:45,6 / 1:55,3 / 3:11,1 / 4:48,9 / 6:27,8 / 7:53,3 / 9:16,6 | whoosh + pluck + chime (kartu Bab 1–7) |
| 4:50–7:53 | frame-drum pelan, tetes air rapat |
| 10:54,3 | impact pelan (suara selesai, end screen) |
| 11:11 | sparkle (outro) |
