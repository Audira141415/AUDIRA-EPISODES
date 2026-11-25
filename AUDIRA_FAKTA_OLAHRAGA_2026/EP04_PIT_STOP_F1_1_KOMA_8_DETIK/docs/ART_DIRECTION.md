# Art Direction — Pit Stop F1 1,80 Detik (`TOYDIORAMA`)

Style: TOYDIORAMA

## Idea
Satu diorama mainan di atas panggung kayu walnut. Kotak pit F1 ada di tengahnya, dan tiap babak cerita adalah set kecil yang naik ke panggung yang sama: pit box modern, lintasan malam Qatar, meja perbandingan ban, pit 1957 bernuansa sepia, lalu kembali ke pit box untuk payoff.

## Look
- **Stage:** papan walnut (`#3A291E` / `#4E3628`) dengan apron gelap dan lampu kaki hangat di tepi depan. Latar belakang void `#0E141D`. Set dibuat seperti mainan: aspal tanah liat abu-abu, garis kotak pit putih, dan garis kuning jalur pit.
- **Floors and stations:**
  - S1/S3/S6 pit box: aspal clay `#4A4D52`, garasi GLB di belakang, papan kertas "AUDIRA · PIT 04".
  - S2 lintasan malam: pita lintasan clay melengkung, tiang lampu sorot, dan pintu masuk jalur pit.
  - S4 meja ukur: dua ban di atas penggaris kayu, kartu kertas berselotip untuk angka.
  - S5 pit 1957: lantai papan kayu dan karung jerami, mobil cerutu bermesin depan, palu, mur bersayap.
- **Lighting:** Finish `DOCUMENTARY_WARM`, exposure 1, envIntensity 0.55, AO aktif. Key spot hangat 3200K dari atas kiri (lampu gantry pit), rim dingin `#8EB8E5` dari belakang garasi, dan wash lampu kaki di apron.
- **Light by chapter:**
  - Hook: kontras tinggi, spot sempit di mobil.
  - Qatar: malam biru dengan lampu sorot putih.
  - Penjelasan peran: netral hangat dengan sorotan per peran.
  - Perbandingan ban: studio terang dan lembut.
  - Fangio 1957: sepia hangat dengan vignette lebih berat.
  - Payoff: golden hour hangat dan bloom halus di angka.

## Materials
- **Mobil F1 mainan (hero, prosedural):** plastik mainan satin (`POLISH.toyPlastic`, clearcoat 0.45), bump grain 0.12. Livery generik teal `#14A3A0` + krem `#F4EFE6`. Tanpa logo, sponsor, atau nomor asli. Helm pembalap kuning polos dengan visor gelap.
- **Ban 18 inci:** karet matte (roughness 0.82), garis sidewall kuning, velg logam (metalness 0.7), dan mur pengunci tunggal merah.
- **Kru (ToyPerson):** baju kain (`POLISH.fabric`) teal dan celana navy, helm krem (cap), kulit vinyl mainan. Wajah mainan bermata manik, bukan wajah realistis.
- **Wheel gun:** logam satin dan pegangan plastik merah.
- **Mobil 1957 (prosedural):** cat merah tua matte dengan gores, roda jari-jari, dan mur bersayap dari kuningan.
- **Close-up detail:** mur pengunci, tuas jack depan, garis sidewall, velg 13 vs 18 inci, dan palu kayu.

## Palette
| Token | Hex | Kegunaan |
|---|---|---|
| primary | #14A3A0 | livery mobil dan seragam kru (generik) |
| secondary | #F4EFE6 | krem: sayap, helm kru, kartu kertas |
| accent | #F2C230 | kuning: angka kunci, garis sidewall, garis pit |
| alert | #E2442F | merah: mur, pegangan, penanda selisih waktu |
| bg | #0E141D | void panggung |
| rival | #2B3A67 | navy generik untuk "tim rekor lama" (tanpa logo) |
| sepia | #C79A5B | grade babak 1957 |

## Typography (Anton + Space Grotesk, bundled)
- **Chapter card:** Anton 96 px, kuning `#F2C230`, di atas kartu krem bertape miring −2°.
- **Callout / timer:** Anton 160–200 px untuk angka (`1,80`), dan Space Grotesk 700 40 px untuk label. Minimal 34 px.
- **Caption 9:16:** Space Grotesk 700 52 px, kata aktif kuning dengan bounce ≤ 1,04 dan jarak antar kata ≥ 0,4em, di y ≈ 1300 dengan pita gelap 40%.
- **Label di panggung:** kartu kertas di lantai depan kaki figur, teks tinta hitam ≥ 34 px (pelajaran juri TOYDIORAMA).

## Depiction rules
- Tim nyata (McLaren, Red Bull, Ferrari) tampil dengan warna generik tanpa logo. Nama tim hanya muncul di teks dan VO.
- Pembalap nyata (Norris, Verstappen, Fangio) tampil sebagai figur mainan stilasi berhelm, tanpa wajah realistis.
- Tidak ada logo DHL. Penghargaan ditampilkan sebagai piala generik dengan label "Penghargaan pit stop musiman".
- AUDIRA muncul di dunia 3D sebagai papan "AUDIRA · PIT 04" di garasi (S1, S3, S6) dan di VO hook.
- Satu subjek utama per frame. Stamp dan caption tidak boleh menutupi mobil atau kru yang sedang beraksi.
