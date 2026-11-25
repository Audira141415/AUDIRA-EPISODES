# ART DIRECTION — EP15 Derinkuyu

Style: INNERWORKS
Engine: Remotion 2D murni (SVG/DOM), desain 1080×1920, final 1080×1920 @60, preview 540×960 @30.

## Konsep
"Membelah bumi Kapadokia." Satu bahasa visual potongan melintang: tanah dipotong seperti kue lapis, muka potong tuf hangat berstrata, rongga ruangan gelap dengan bayangan dalam, garis section cyan di tepi potongan. Setiap babak narasi = adegan berbeda (rumah 1963, peta + penampang kota, gunung berapi, garis waktu, menara ruangan, pintu batu, payoff udara/sumur, senja 1923, peta ratusan kota).

## Palet
| Peran | Warna |
|---|---|
| Studio latar | #e8eeeb → #d6dfdb |
| Tuf (atas → bawah) | #e9c9a0, #d9ad7c, #c48d5e, #9c6a43 |
| Rongga | #4a3426 → #2a1d16 |
| Section / ghost | #00b8d4 |
| Aksen / api / bahaya | #ff7a3d, merah #e2483d |
| Chip | rgba(244,247,246,.93), teks #1d2b33 |

## Tipografi
Angka besar: Anton. Label/chip: Space Grotesk 700. Karaoke: Manrope 800, plate gelap lebar penuh, gap 0.4em, opacity 1, bounce ≤1.04, di atas zona 380 px bawah (top 1428).

## Lapisan
BG studio + ghost outline → MG penampang tuf + ruangan → FG batu buram/tepi potongan, debu → HUD chip + leader line cyan, callout kinetik (top 180–520) → karaoke.

## Kamera
Kamera virtual 2D (translate/scale) selalu bergerak: push masuk di hook, turun menyusuri menara ruangan, zoom-out penuh di payoff. Tanpa hold > 1.5 dtk.

## Brand
Papan tuf berukir "AUDIRA · FAKTA DUNIA" di pintu masuk (S9), VO menyebut "Audira", outro card 3 dtk, AudiraSignature seed `derinkuyu-ep15`.
