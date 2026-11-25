# Timing — EP10 Wilt Chamberlain 100 Poin 1962 (VO terkunci 2026-11-24)

Audio Master Clock. Sumber: `studio/src/scenes/ep10/timeline.json` (dibuat `_tools/make-timeline.py` dari `audio/timeline.json`).

- VO: Cartesia via MCP `audira_generate_voiceover` (satu take dari `audio/work/vo-timed.txt`, 6 bagian dari `docs/script-lines.json`), voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, lang `id`. Take mentah 84,24 dtk dirapatkan `_tools/vo_tighten.py`.
- Ucapan selesai **76,40 dtk** · 203 kata ucap / 178 kata tampil · ±160 WPM (cepat, masih wajar untuk short).
- Film total **80,40 dtk** (voEnd + 4,0). Kartu outro AUDIRA (Root `signed`) ≈ 76,6 dtk.
- File: `audio/vo.wav`, `audio/timeline.json`, `studio/public/audio/ep10/vo.wav`, `studio/src/scenes/ep10/timeline.json`.
- Ejaan ucap fonetik: Hersyi, Pensilvania, Woriors, Niks, Chemberlen, Giv it tu Wilt, Raklik, Audira. Caption memakai ejaan tulis.

## Rencana potongan → detik VO (indeks kata `W(id, i, prefix)`)

| Scene | Mulai (dtk) | Kata pemicu | Visual + HUD |
|---|---|---|---|
| A HOOK | 0,00 | awal = cover | Arena tua gelap, papan skor manual kayu "100", figur Wilt (ToyPerson tinggi, jersey krem polos tanpa nomor/logo) di pool light; Card "100 POIN" 0,1; Stamp "0 REKAMAN VIDEO" di `hook[12] rekaman` 3,83; AUDIRA 4,85 |
| B1 KOTA | 5,72 | `konteks[0] Hershey` | Kota pabrik cokelat: gedung pabrik + cerobong (`cowled-chimney-stack-de5055`, `chimney-roof-passage-90dedd`), salju tipis Maret; Card "2 MARET 1962 · HERSHEY, PENNSYLVANIA" @ `konteks[2]` 7,28; Card "±4.000 PENONTON" @ `konteks[10]` 10,84 |
| B2 ARENA | 12,14 | `konteks[12] Philadelphia` | Interior arena: lapangan parket (FG), tribun sepi, dua ring (`basketball-backboard-2624e9`), dua tim figur krem vs cokelat tua; Card "WARRIORS vs KNICKS" (teks saja) 12,14; Stamp "TV: TIDAK ADA" @ `konteks[18]` 14,45; Stamp "WARTAWAN NY: 0" @ `konteks[22]` 15,61; @ `konteks[27]` 17,55 kamera dorong ke meja radio (`field-radio-set-b6f3fd` + `vintage-microphone-stand-c5ba82`), Card "HANYA RADIO" |
| C1 PAPAN SKOR | 19,02 | `pengembangan[0] Wilt` | Papan skor manual kayu dengan kartu angka gantung + figur Wilt; NameCard "WILT CHAMBERLAIN · 2,16 M" 19,02–22,2; angka balik Q1 "23" @ `[7]` 23,47, HT "41" @ `[11]` 25,61, Q3 "69" @ `[15]` 27,85 (Card label kuarter + angka besar) |
| C2 TRIBUN | 28,89 | `pengembangan[16] Penonton` | Tribun penonton figur `cheer`, spanduk kain; Stamp "GIVE IT TO WILT!" @ `[19]` 30,33 |
| D1 LEMPARAN BEBAS | 32,79 | `penjelasan[0] Anehnya` | Garis lemparan bebas close-up, Wilt melempar berulang, bola masuk ring; Card "KARIER: 51%" @ `[9]` 36,91; Card "MALAM ITU: 28 / 32" @ `[14]` 39,46 + tally 32 bola (28 terisi) |
| D2 SALING LANGGAR | 42,26 | `penjelasan[20] Knicks` | Lapangan dari atas, figur Knicks menarik pemain Warriors lain, peluit; Card "SENGAJA MELANGGAR" 43,09; Card "DIBALAS MELANGGAR" @ `[32]` 46,06 |
| E1 POIN KE-100 | 50,10 | `payoff[0] 46` | Jam pertandingan "0:46" turun; NameCard "JOE RUKLICK · UMPAN" @ `[4]` 52,23; Wilt memasukkan bola dari dekat ring (tanpa klaim jenis tembakan); IMPACT + Flash + papan skor "100" @ `[12]` 55,23 |
| E2 RUANG GANTI | 56,19 | `payoff[13] Di` | Ruang ganti: meja, lampu, humas menulis "100" di kertas (Sign berputar masuk seperti PressScene ep02); Card "HUMAS TIM · KERTAS \"100\"" 57,52; flash fotografer 60,33 |
| E3 ARSIP | 60,33 | `payoff[24] Foto` | Radio tabung close + rak arsip (`bookshelf-5e881a`) + foto berbingkai kertas "100"; Card "DIABADIKAN PERPUSTAKAAN KONGRES AS" @ `[31]` 62,57; Card "BUKTI: FOTO · RADIO · BOX SCORE" 64,68 |
| OUT MUSEUM | 66,57 | `outro[0] Enam` | Vitrin "MUSEUM AUDIRA" (brand di dalam adegan): tiga alas bertingkat 100 · 83 · 81; Card "64 TAHUN" 66,57; label "BAM ADEBAYO · 2026 · 83" @ `[8]` 69,60; label kecil "KOBE BRYANT · 2006 · 81"; Card "100 · BELUM TERSENTUH" @ `[14]` 72,35; outro card Root 76,6 |

Aturan wajib VINTAGEFORGE dari `style/STYLE_DECISION.md`: PoolLight, cam lift ±0.09, FG terang (parket/bangku/meja), rim + fog, label 3D ≤ 1 per shot, kartu ≥ 42 px, karaoke non-aktif ≥ 70%, figur non-subjek keluar frame di close-up. Kode: `studio/src/scenes/ep10/` (Film.tsx, sets.tsx, timing.ts, index.ts, Cover.tsx), impor ulang `../ep02/sets.tsx` (Cam, camAt, ToyPerson, LOOK, Sign, LampLights, SunLights, useWood, useBrass), `../ep02/hud.tsx` (Frame, Card, NameCard, Stamp, Flash, DustWipe, Captions), `../ep02/Model.tsx` (GLB dari `studio/public/glb/<id>.glb`, salin dari `E:/ASET/ASSET-AUDIRA/downloads/glb/prop/`). Pola Stage/PoolLight salin dari `../ep02/Film.tsx` baris 34–75.
