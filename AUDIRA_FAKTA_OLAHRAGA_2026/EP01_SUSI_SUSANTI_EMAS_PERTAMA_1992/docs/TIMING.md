# Timing — EP01 Susi Susanti, Emas Pertama 1992 (VO terkunci 2026-11-22)

Audio Master Clock. Sumber: `studio/src/scenes/ep01/timeline.json` (dibuat `_tools/make-timeline.py` dari `audio/timeline.json`).

- VO: Cartesia via MCP `audira_generate_voiceover` (satu take, 6 bagian dari `docs/script-lines.json`, file bertimestamp `audio/work/vo-timed.txt`), voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, lang `id`. Take mentah 94,69 dtk (128 WPM) dirapatkan dengan `_tools/vo_tighten.py`: jeda dalam bagian ≤ 0,34 dtk, antarbagian 0,45 dtk, lead 0,1 dtk, loudnorm −16 LUFS (terukur −16,3 LUFS, peak −1,5 dBFS).
- `_tools/vo.py tts` tidak dipakai karena `scripts/tts-cartesia.mjs` butuh `CARTESIA_API_KEY` di `.env` workspace, yang tidak tersedia di sesi ini.
- Ucapan mulai 0,10 dtk, selesai **85,72 dtk** · 200 kata tampil · 140 WPM.
- Film total **89,72 dtk** (voEnd + 4,0 dtk). Kartu outro AUDIRA mulai ≈ 85,77 dtk.
- File: `audio/vo.wav`, `audio/timeline.json`, `studio/public/audio/ep01/vo.wav`, `studio/public/audio/ep01/vo.timing.json` (`npm run vo`).
- Ejaan ucap: Suharto, Su hyun, Audira. Caption memakai ejaan tulis (Soeharto, Soo-hyun, AUDIRA).

## Potongan storyboard → detik VO

| Scene | Mulai–Selesai (dtk) | Kata pemicu potongan | Beat di dalam adegan (kata @ dtk) |
|---|---|---|---|
| A HOOK | 0,00–8,15 | (awal) | "lima-sebelas" 0,39 (skor 5–11 berkedip) · "final Olimpiade" 2,05 · "dua puluh satu tahun" 4,08 (kartu 21 TAHUN) · "emas pertama Indonesia" 5,63 (chip) · smash lepas ≈ 6,8 · "Ini AUDIRA" 7,05 |
| B KONTEKS | 8,15–27,13 | "Barcelona" | "sembilan…dua" 8,86 · "Bulu tangkis…resmi" 10,46 (chip CABANG MEDALI RESMI) · "sejak…lima puluh dua" 15,78 (papan waktu 1952) · "empat puluh tahun" 17,90 (penghitung 40 TAHUN · 0 EMAS) · "instruksi…Soeharto" 21,18 (kartu instruksi) · "Malam sebelum final" 24,32 (sprite di ranjang, jam berganti) · "tidur" 26,27 |
| C PENGEMBANGAN | 27,13–40,76 | "Susi, unggulan pertama" | "unggulan pertama" 27,61 (chip UNGGULAN 1) · "tanpa kehilangan satu gim" 29,80 (bagan menyala) · "Empat Agustus" 31,52 (kartu tanggal/venue) · "Bang Soo-hyun" 32,93 (kartu nama) · "unggulan keempat" 34,63 (chip UNGGULAN 4) · "semifinal" 35,79 · "gim pertama berjalan buruk" 37,73 (skor lawan naik) · "lima-sebelas" 39,71 (buzzer + glitch, bar nyawa merah) |
| D PENJELASAN | 40,76–56,67 | "Satu gim lagi" | "lepas" 42,56 · "bangkit" 44,25 · "sebelas-lima" 46,54 (GIM 2, jingle naik level) · "sebelas-tiga" 48,50 (**IMPACT payoff**, match point dolly lambat ≈ 47,6) · "selesai paling dulu" 51,15 · "pertama di dunia" 55,39 (stempel EMAS BULU TANGKIS PERTAMA DI DUNIA) |
| E1 PAYOFF | 56,67–61,25 | "Di podium" | "Indonesia Raya" 57,45 (chip, bendera naik) · "menangis" 60,31 |
| E2 PAYOFF | 61,25–67,80 | "Hari yang sama" | "Alan Budikusuma" 63,36 (kartu nama + skor 15–12, 18–13) · "Dua emas dalam sehari" 66,11 (chip 2 EMAS · 1 HARI) |
| F PAYOFF | 67,80–75,63 | "Pulang ke Jakarta" | "mobil terbuka" 70,23 · "sejuta orang" 72,43 (chip HINGGA ±1 JUTA ORANG) · "menikah" 74,77 (kartu MENIKAH 1997) |
| OUT | 75,63–89,72 | "Kalah di awal" | papan skor AUDIRA 75,63–85,77 (> 2 dtk) · "Berikutnya di AUDIRA" 77,68 · "maraton paling kacau" 79,45 (kartu teaser EP02 · 1904) · "Ikuti terus" 84,38 · kartu outro 85,77–89,72 |

Catatan: E1 hanya 4,6 dtk; tilt bendera harus selesai sebelum 61,25. Hook 8,15 dtk, judul cover memudar di 2,5 dtk.
