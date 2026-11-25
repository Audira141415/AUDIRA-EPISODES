# Audio Plan — EP09 Kopi Para Sufi Yaman

- **VO (master clock):** `audio/vo.wav` (Cartesia, Galang), -16,2 LUFS, dikunci 2026-11-12; salinan `project/public/audio/vo.wav`. Timeline `audio/timeline.json` (lead 0,60, voEnd 88,32, total 92,32).
- **Bed:** `project/src/scenes/qahwa/mix.py` → `project/public/audio/bed.wav` (-26,9 LUFS, 92,32 dtk, tanpa suara manusia).
- **Mix:** sidechain duck (bed -5 dB, threshold 0,02, ratio 4) + amix → `project/public/audio/full.wav` (-16,3 LUFS, 92,32 dtk). Bed duduk ±15 dB di bawah suara. Final dirender dengan `--vo=public/audio/full.wav`; normalisasi -14 LUFS / true peak < -1 dBFS di render final.

## Musik (sintesis numpy, identitas episode)
| Bagian | Isi |
|---|---|
| Seluruh film | drone D1 + A1 bernapas pelan |
| Hook + context | oud (Karplus-Strong) maqam Hijaz di D, 72 bpm, jarang |
| Main | oud naik-turun tangga Hijaz; ney di "Menurut"; daf pelan tiap ketukan dari "Malam" sampai akhir main; jangkrik malam |
| Explanation | oud turun sampai "dilarang", diam saat larangan, kembali di "Tapi sultan" |
| Payoff | oud setengah ketukan, lebih terang |
| Outro | oud oktaf atas, ney penutup di "Jadi" |

## SFX (berjangkar kata)
| Kata | Cue |
|---|---|
| 1,2–4,5 dtk | tick 7 biji mendarat di nampan (jadwal sama dengan FallingBeans) |
| "diadili" | impact-bass-1 |
| "Bukti" -0,4 | whoosh-cinematic (cut ke peta) |
| "Yaman", "Tanamannya", "Kaldi" | tick benda mendarat di peta |
| "legenda" +0,6 | whoosh-short (cut ke zawiyah) |
| "dituang" | suara tuang kopi |
| "dibagikan" | tick 7 mangkuk |
| "berzikir" +0,5 | whoosh-short (cut ke peta) |
| "Tahun" (1511) +0,3 | whoosh-cinematic (cut ke meja dewan) |
| "ahli", "dokter", "musik", "permainan" | knock kayu |
| "taruhan" | denting koin |
| "dilarang" | thud stempel |
| "dibakar" | kretek api |
| "dibatalkan" | chime |
| "Namanya" -0,6, "kita" +0,1, "Eropa" -0,2 | whoosh-short (cut) |
| "qahwa", "kahve", "koffie", "kopi" | knock ubin kayu |
| "banjir" | air |
| "tumbuh" | sparkle |
| "1711" | knock peti |
| "pagimu" | tick gelas |
| voEnd + 0,55 | chime kartu outro |

SFX library: `F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/` (impact-bass-1, whoosh-cinematic, whoosh-short, chime, sparkle). Foley lain disintesis di mix.py.
