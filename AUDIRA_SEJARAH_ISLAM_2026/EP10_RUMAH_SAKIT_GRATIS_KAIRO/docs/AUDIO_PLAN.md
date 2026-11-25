# Audio Plan — EP10 Rumah Sakit Gratis Kairo

- **VO (terkunci):** `audio/vo.wav` (Cartesia, suara Galang), −16,4 LUFS, master clock; salinan di `project/public/audio/vo.wav`.
- **Bed:** `project/src/scenes/mansuri/mix.py` (jalankan dari `project/`) → `public/audio/bed.wav` (92,71 dtk, tanpa suara manusia), lalu `public/audio/full.wav` (bed −5 dB, sidechain di bawah VO, apad ke panjang film). Bed terintegrasi −24,7 LUFS sebelum ducking; di bawah suara ±15 dB.
- **Identitas musik "halaman dengan air mengalir":** drone D (D2 + A2 + D3), oud sintetis berjalan di maqam Bayati (D E½ F G A B♭ C D), qanun menjelang tiap bagian, satu frase ney per bagian, pulsa palu flanel lembut hanya di bagian kota wakaf, tanpa perkusi lain, tanpa nyanyian. Malam (Konon): drone turun, oud bermain sendiri lebih jelas.
- **Ambience:** gemericik pancuran + tetesan air sepanjang film; room tone lebih hangat di malam hari.
- **SFX** (`shared/assets/sfx`, dicari dari root workspace ke atas):

| Kata jangkar | SFX |
|---|---|
| awal tiap bagian | whoosh-cinematic |
| "gratis" | chime |
| "obat" (context) / "Damaskus" / "menjadi sultan" | sparkle / pop / chime |
| "pembangunan dimulai" | whoosh-short |
| demam, mata, luka, jiwa | pop |
| "Laki-laki" | click-soft |
| "Wakaf" | chime |
| pasar, toko, rumah sewa, pemandian, tanah | pop |
| obat, makanan, dokter, ahli bedah, pelayan | click-soft |
| "Pintunya" | whoosh-short |
| "pakaian" | sparkle |
| "uang saku" | ping ×3 (koin) |
| "Rumah sakit ini bekerja" | whoosh-short |
| "sejak 1915" | riser lalu chime |
| "Kalau kamu" | pop |
| kartu outro | impact-bass-1 + sparkle |

- **Mastering final:** −14 LUFS, true peak < −1 dBFS (oleh render:final / QA lead).
