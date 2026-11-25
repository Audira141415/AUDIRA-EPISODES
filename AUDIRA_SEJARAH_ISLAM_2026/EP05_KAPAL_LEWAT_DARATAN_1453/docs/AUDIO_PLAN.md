# Audio Plan — EP05 Kapal Lewat Daratan 1453

- **VO (terkunci, master clock):** `audio/vo.wav` (Cartesia, Galang), -16 LUFS, voEnd 90,94 dtk; salinan `project/public/audio/vo.wav`.
- **Bed:** `project/src/scenes/galata/mix.py` (jalankan dari `project/`) → `public/audio/bed.wav`, 94,94 dtk, 48 kHz stereo, -17,6 LUFS, tanpa suara manusia. Semua cue ditambatkan ke kata di `timeline.json`.
- **Mix:** sidechain ffmpeg (brief Stage B) → `public/audio/full.wav`, -16,4 LUFS, peak -3,9 dBFS. Bed setelah ducking -31,8 LUFS, ±15,6 dB di bawah suara. File ini yang diberikan ke render final lewat `--vo`; mastering -14 LUFS di render final.

## Musik (identitas EP05)
Maqam Hijaz di D (D Eb F# G A Bb C), 72 bpm, sintesis numpy:
| Lapisan | Isi | Masuk |
|---|---|---|
| Drone | D2 + A2 + D3, beating pelan, low-pass 900 Hz | sepanjang film, naik di payoff |
| Qanun | petikan Karplus-Strong, pola tenang / bergerak / naik | hook→outro, makin rapat di explanation dan payoff |
| Ney | sinus bernapas + noise band-pass, vibrato | awal context, "Mehmed" (l07), "Trik" (l13), outro |
| Daf | frame drum lembut | "ditutup" (rantai), "Kapal-kapal" (l09), payoff sampai "jatuh" |

## Ambience
Desir laut (noise low-pass, napas 0,11 Hz) di bawah peta; derit kayu periodik selama penarikan kapal (l09–l10).

## Cue SFX (`F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/`)
| Kata / waktu | SFX | Gain |
|---|---|---|
| "Pelabuhan" 0,62 | impact-bass-1 | 0,30 |
| akhir "bukit" (l01) | whoosh-cinematic | 0,22 |
| "1204" | pop | 0,18 |
| "Mehmed" (l03) | pop | 0,16 |
| "Hadis" | whoosh-short | 0,20 |
| awal main | whoosh-cinematic | 0,22 |
| "rantai" (l05) | impact-bass-1 | 0,18 |
| "tertahan" | click + impact-bass-1 | 0,25 / 0,14 |
| "memutarinya" | whoosh-short | 0,20 |
| "dilumasi" | sparkle | 0,12 |
| "setinggi" | pop | 0,14 |
| "layarnya" | whoosh-short | 0,16 |
| "seolah" | riser | 0,16 |
| "meluncur" | impact-bass-1 | 0,24 |
| "Rantai" (l11) | whoosh-cinematic | 0,20 |
| "Tahun" (l13) | whoosh-short | 0,18 |
| voEnd + 0,55 (kartu outro) | chime | 0,22 |
