# AUDIO PLAN — SEJARAH MAKKAH · EP04 · Kiswah

## Sumber
- **VO (master clock, terkunci):** `audio/vo.wav`, Cartesia suara Galang, 48 kHz mono, -16 LUFS, 654,7 dtk (narasi berakhir 634,7 dtk; 20 dtk end screen sunyi). Disalin ke `project/public/audio/vo.wav`.
- **Bed:** `project/src/scenes/kiswah/mix.py` (numpy) → `public/audio/bed.wav`, panjang = total, loudnorm -24 LUFS. Tanpa suara manusia, tanpa nyanyian.
- **Gabungan:** `public/audio/full.wav` = bed -5 dB + `sidechaincompress` (threshold 0.02, ratio 4, attack 20 ms, release 450 ms) dari VO + VO di atas. Dipakai render final lewat `--vo=public/audio/full.wav`.

## Identitas musik episode: "benang dan alat tenun"
| Lapisan | Isi | Penempatan |
|---|---|---|
| Drone | D2 + A2 + D3 + A3 dengan detune pelan, napas LFO 23 dtk | seluruh film; naik di jeda antar chapter, fade di awal dan sebelum outro |
| Udara | noise lowpass sangat pelan, LFO 17 dtk | seluruh film |
| Ney sintetis | 4–6 nada maqam Hijaz (D Eb F# G A Bb C D), vibrato 5,2 Hz, napas | 1,25 dtk sebelum tiap chapter |
| Qanun sintetis | petikan Karplus-Strong naik D–A–D–F# | momen emas: "emasnya", "kiswah" (intro), kain bergaris, kiswah hitam, "membiayai", "terpasang" 1927, "sebenarnya" (perak), 54 bagian emas, tirai pintu, "lapisan sejarah" |
| Rebana lembut | satu "dum" rendah + pantulan | di awal tiap chapter isi (c02–c09) |
| Detak benang | klik kain pendek acak | saat jarum bekerja: hook, sulam pabrik, huruf timbul, payoff |

## SFX library (`shared/assets/sfx/`)
| SFX | Gain | Waktu |
|---|---|---|
| whoosh-cinematic | 0.14 | 1,1 dtk sebelum tiap chapter (perpindahan stasiun) |
| sparkle | 0.08 | tiap momen emas |
| impact-bass-1 | 0.10–0.12 | "satu ton" (hook), "kiswah darurat" (c06) |
| riser | 0.08 | 3,2 dtk sebelum "lapisan sejarah" (terbang balik) |
| chime | 0.10–0.12 | awal end screen, awal outro |

## Short
- VO short: `public/audio/short0N_vo.wav` = klip `sNN_hook` + jeda 0,4 dtk + potongan `vo.wav` (kata pertama s.d. terakhir) + jeda 0,4 dtk + klip `sNN_outro` + ekor sunyi untuk outro, loudnorm -16 LUFS (`shorts.py`).
- Bed short: potongan kontinu dari bed panjang mulai `srcStart - bodyStart`, sehingga musik hook mengalir ke bagian yang dipakai ulang; fade in 0,6 dtk, fade out 2,5 dtk. Digabung dengan cara yang sama → `short0N_full.wav`.

## Target master
- Render final: integrated -14 LUFS, true peak < -1 dBFS (langkah render-final). Bed ±15 dB di bawah suara.
- Hasil ukur: lihat bagian "Pengukuran" di bawah. Bed −25,2 LUFS, −5 dB lalu diduck: ±14–15 dB di bawah VO.

## Pengukuran (ffmpeg ebur128, 2026-11-10)
| File | Loudness / peak | Durasi |
|---|---|---|
| bed.wav | −25,2 LUFS / −4,6 dBFS | 654,65 dtk |
| full.wav | −16,1 LUFS / −4,3 dBFS | 654,68 dtk (= total) |
| short01_vo.wav | −15,9 LUFS / −1,5 dBTP | 85,31 dtk |
| short01_full.wav | −16,0 LUFS / −4,4 dBFS | 85,31 dtk |
| short02_vo.wav | −15,8 LUFS / −1,5 dBTP | 63,19 dtk |
| short02_full.wav | −15,9 LUFS / −4,2 dBFS | 63,19 dtk |

Catatan: `full.wav` dan `short0N_full.wav` dipad dengan `apad` di akhir rantai snippet, karena `amix duration=first` memotong ±0,2–0,7 dtk. Mix belum didengar manusia; cek telinga saat review draf.
