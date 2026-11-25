# Timing — EP45 Denmark, Juara Tanpa Lolos (VO terkunci 2026-11-22)

Audio Master Clock. Sumber: `studio/src/scenes/ep45/timeline.json` (dibuat `_tools/make-timeline.py` dari `audio/timeline.json`).

- VO: Cartesia sonic via `audira_generate_voiceover`, voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, lang `id`, 6 klip per bagian (`docs/script-lines.json`), jeda dirapatkan dan disambung dengan `_tools/vo.py` (tts-tightening + build, loudnorm −16 LUFS).
- Ucapan mulai 0,10 dtk, selesai **82,83 dtk** · 200 kata tampil · 145 WPM.
- Film total **86,83 dtk** (voEnd + 4,0 dtk). Kartu outro AUDIRA mulai ≈ 83,03 dtk (OUTRO_AT = akhir OUTRO + 0,2).
- File: `audio/vo.wav`, `audio/timeline.json`, `studio/public/audio/ep45/vo.wav`, `studio/public/audio/ep45/vo.timing.json` (`npm run vo`: 13 frasa, 13 jeda).
- Ejaan ucap: Rikard Muler Nilsen, Smaikel, fan Basten, Yoteborg, Jon Yensen, Vilfort, raner ap, pe be be, Audira. Caption memakai ejaan tulis.

## Potongan storyboard → detik VO

| Scene | Mulai–Selesai (dtk) | Kata pemicu potongan | Beat di dalam adegan (kata @ dtk) |
|---|---|---|---|
| A HOOK | 0,00–5,88 | (awal) | "Piala Eropa" 2,52 → chip EURO 1992 · "juara" 4,46 · "Ini AUDIRA" 5,12 |
| B1 KONTEKS | 5,88–17,07 | "Tahun" | "sembilan…dua" 6,28 · "Yugoslavia" 7,97 · "dicoret" 10,75 (coretan merah) · "PBB" 12,21 (kartu SANKSI PBB) · "Denmark" 14,75 (slot menyala) · "runner-up" 15,56 |
| B2 KONTEKS | 17,07–22,43 | "Kabar" | "tiga puluh satu Mei" 17,93 · "sepuluh hari" 19,36 (chip 10 HARI) · "delapan tim" 20,76 · "Swedia" 21,82 |
| C1 PENGEMBANGAN | 22,43–28,44 | "Pelatih" | "Richard Møller Nielsen" 22,80 (kartu nama) · "Laga pertama" 25,36 (LEVEL 1) · "nol-nol" 26,80 · "Inggris" 27,79 |
| C2 PENGEMBANGAN | 28,44–39,23 | "Lalu" | "nol-satu" 29,14 (LEVEL 2, glitch) · "Kesempatan" 31,60 · "Prancis" 34,30 (LEVEL 3) · "dua-satu" 35,84 (impact) · "lolos" 37,01 (chip LOLOS) · "runner-up grup" 38,30 |
| D PENJELASAN | 39,23–54,92 | "Di semifinal" | "Belanda" 40,32 · "dua-dua" 42,11 · "perpanjangan waktu" 43,46 · "Adu penalti" 44,99 · "meleset" 46,71 (hening/dolly lambat) · "Schmeichel" 49,01 (kartu nama) · "menepis" 49,78 (impact + shake) · "van Basten" 51,31 · "lima-empat" 53,18 (stempel 5–4) |
| E1 PAYOFF | 54,92–61,32 | "Final" | "dua puluh enam Juni" 55,35 · "Göteborg" 56,60 · "37.800" 58,08 · "Jerman" 60,71 |
| E2 PAYOFF | 61,32–68,79 | "Menit delapan belas" | "18'" 61,60 · "John Jensen" 62,28 (gol 1) · "78'" 63,90 · "Kim Vilfort" 64,68 · kartu putri 65,52 · "dua-nol" 68,31 (**impact besar payoff**) |
| E3 PAYOFF | 68,79–71,44 | "Tim yang tadinya" | "juara Eropa" 70,54 (stempel JUARA EROPA 1992) |
| OUT | 71,44–86,83 | "Kadang" | papan skor AUDIRA 71,44–83,03 (> 2 dtk) · "Menurutmu" 75,85 · "ikuti AUDIRA" 81,97 · kartu outro 83,03–86,83 |

Catatan: E3 hanya 2,65 dtk; boleh ditahan sampai "Siap" 73,59 bila pose angkat piala butuh napas, dengan papan skor OUT masuk sesudahnya (masih > 9 dtk sebelum kartu outro).
