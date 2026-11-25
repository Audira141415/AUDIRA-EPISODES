# ART_DIRECTION — EP74 Darvaza, Lubang Api Sejak 1971

Style: WORLDFORGE · Remotion + R3F (3D) · 1080×1920 · 60 fps final

## Konsep

"Satu lubang, lima puluh tahun." Seluruh film berada di satu dunia gurun Karakum yang sama. Waktu bergerak: malam (hook) → senja (peta) → siang terik 1971 (pengeboran) → senja (api dinyalakan) → malam (penampang + penjelajah) → pra-fajar (sumur baru, api mengecil) → fajar (api meredup). Lubang yang sama terlihat dari jarak, sudut, dan waktu berbeda di tiap babak, jadi tidak ada adegan monolitik.

## Palet

- Pasir: #C9A26B / #A97C4A (siang), #5B4636 (senja), #2A2230 (malam)
- Api: inti #FFF1C1, tengah #FFA53A, tepi #E2531E; glow tidak lebih dari bloom 0,9
- Langit malam: #0C1020 → #1E2440; senja #E98A4F → #4A3A5E; fajar #F3C38B → #8DA6C8
- Kartu HUD: rgba(20,14,12,0.82), border #FF8A3D, teks #FFF4E3; angka besar #FFB04A

## Tipografi

- Judul/angka: font display kit (berat 800), angka ≥ 120 px
- Label: MONO ≥ 36 px, nowrap
- Subtitle karaoke y=1300, jarak kata ≥ 0,4em, bounce ≤ 1,04

## Cahaya per babak

| Babak | Matahari/sumber | Exposure | Catatan |
|---|---|---|---|
| Malam (S1, S5, S6) | bulan dingin lemah + point light api oranye dari dasar kawah | 1,1–1,3 | rim oranye pada bibir kawah, figur |
| Senja (S2, S4) | matahari rendah 6–10° dari samping-belakang | 1,0 | bayangan dune panjang |
| Siang 1971 (S3) | matahari 28° raking dari kiri | 0,9 | jangan datar: bayangan rig dan truk panjang |
| Pra-fajar/fajar (S7, S8) | langit fajar + api kecil | 1,0 | payoff: matahari terbit di belakang kawah |

## Brand di dunia (anti-reupload)

- Papan kayu kecil bertulisan "AUDIRA" ditancapkan di bibir kawah dekat tenda (S1, S8).
- Label HUD "AUDIRA · FAKTA DUNIA" kecil di kartu bab.
- VO menyebut "Audira" di outro.
- `AudiraSignature seed="darvaza-kawah-api" handle="@AudiraFaktaDunia"`.

## Larangan

Tanpa wajah orang nyata (penjelajah = figur berbaju perak tanpa wajah), tanpa logo/bendera negara asli di kartu (teks saja), tanpa partikel abstrak sebagai visual utama.
