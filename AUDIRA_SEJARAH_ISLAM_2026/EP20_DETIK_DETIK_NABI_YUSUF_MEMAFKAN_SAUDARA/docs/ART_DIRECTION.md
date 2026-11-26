# Art Direction — Detik-Detik Nabi Yusuf Memaafkan Saudara-Saudaranya (`HD2D`)

Style: HD2D  <!-- G21 -->

## Idea
Diorama Mesir kuno di atas meja gelap: istana batu kapur di tengah, gerbang kota tepi Nil, gudang gandum, dan bukit fajar; atap rumah Kanaan melayang terpisah di balik kabut sebagai "kenangan". Tokoh sprite piksel kecil berkerudung tanpa wajah. Kamera berjalan dari kenangan malam ke pengungkapan siang lalu fajar, sehingga cerita terasa seperti satu perjalanan dari gelap ke terang.

## Look
- **Stage:** diorama di papan kayu gelap, tepi memudar ke vignette. Kabut tipis memisahkan stasiun.
- **Floors and stations:** lantai batu kapur bertekstur (canvas map seeded, bump 0.5) di aula; bata lumpur + pasir di gerbang; tanah liat atap Kanaan; lantai papan + jerami di gudang; pasir bertekstur dengan jejak kaki di jalan kafilah dan bukit. Lantai tidak pernah polos.
- **Lighting:** key directional hangat #FFC98A + rim dingin #8FA6FF, Finish DOCUMENTARY_WARM, exposure 1, envIntensity 0.55, AO, hdri warmStudio, DOF tilt-shift aperture 0.006–0.012 / maxBlur 0.03. Api/obor seeded (bukan Math.random).
- **Light by chapter (separasi set malam, pelajaran EP17):** c00 aula malam = lampu minyak 2200K + bulan biru dari jendela atap; c01 gerbang = senja oranye; c02 atap Kanaan = biru bulan penuh + bintang emisif (paling dingin); c03 gudang = obor kuning 2400K; c04 aula siang = berkas cahaya putih-emas tajam dari jendela atap, sekitar redup; c05 = cahaya siang hangat merata, jalan gurun terang; c06 meja kitab = satu lampu minyak, latar hitam; c07 = fajar biru ke emas.
- Tiap set punya satu sumber cahaya jelas; tidak ada adegan gelap total. Target look.json: crush per frame ≤ 2%, clipHi 0, diversity ≥ 30.

## Materials
- **Aula istana:** tiang papirus batu kapur (#D9C9A3, bump), relief lotus sederhana, singgasana kayu berlapis emas (metalness 0.8, roughness 0.35); opsi GLB `looted-gilded-throne-008fc3` (cek look, buang aksen naga bila ada).
- **Piala raja:** GLB `goblet-87c3ba`, material emas metal (metalness 0.9, roughness 0.3, env reflection).
- **Karung gandum:** GLB `grain-sack-401d96` / `hemp-grain-sack-f91edc`, roughness 1, cap "AUDIRA" pada satu karung (anti-reupload lapis 2). Jangan karung prosedural (terbaca jeriken, pelajaran EP17).
- **Timbangan:** kuningan prosedural (POLISH bevel).
- **Bintang/matahari/bulan:** emisif dengan glow bloom halus; bulan sabit, matahari disk emas. Bintang dan benda langit tidak digambar berwajah.
- **Gamis:** kain lipat roughness 0.9, warna putih gading dengan bordir emas tipis.
- **Kitab:** halaman krem bertekstur, sampul kulit coklat, jam pasir kaca + pasir emas.
- **Tokoh:** sprite piksel voxel (`pixel.tsx`) berkerudung, tidak ada mata/hidung/mulut; selalu dari belakang/samping/jauh. Sosok Yusuf dibedakan oleh jubah putih + selendang emas, sebelas saudara jubah coklat/abu, Yaqub jubah biru tua. Fill dingin dari arah kamera (pointLight 0.9) supaya punggung sprite tidak jadi gumpal hitam.

## Palette
| Token | Hex | Kegunaan |
|---|---|---|
| night | #141B33 | langit malam, latar |
| limestone | #D9C9A3 | aula, tiang |
| gold | #E8C46A | emas, angka HUD |
| lamp | #FFB347 | lampu, kata aktif caption |
| nile | #2E6F8E | sungai, aksen |
| moon | #8FA6FF | rim, bulan |
| card | #0E1222 | kartu HUD (88%) |

## Typography (bundled)
- **Judul hook / chapter card:** Anton 96–120 px, kapital, putih + kata kunci #FFB347.
- **Callout HUD:** kartu #0E1222 88% border emas 2 px, label Silkscreen Bold 30 px kapital, angka Anton 72–96 px #E8C46A.
- **Caption 9:16:** Space Grotesk 600 52 px, karaoke per kata, kata aktif #FFB347, bounce ≤ 1.04, jarak kata ≥ 0.4em, pusat y 1300, kartu gelap di belakang.
- **Kutipan ayat:** Instrument Serif Italic 60 px di kartu krem (12:89, 12:92).

## Depiction rules
- Tidak ada wajah Yusuf, Yaqub, Bunyamin, atau saudara-saudaranya. Nabi Muhammad ﷺ tidak digambarkan (c07 hanya kartu sumber).
- Tidak ada lafaz Allah pada objek dunia; kutipan ayat hanya di kartu HUD dengan terjemah Indonesia.
- Tafsir ditandai "Ibnu Katsir" dan "riwayat tafsir"; kata "hadis" hanya untuk Bukhari 3374. Israiliyyat (nama saudara, kisah Zulaikha, usia) tidak dipakai.
- Sujud di mimpi (12:4) hanya benda langit yang menunduk; adegan sujud manusia (12:100) tidak digambar.
- AUDIRA di dunia: papan gerbang kota + cap karung gandum. AudiraSignature `seed="nabi-yusuf-memaafkan"` handle `@AUDIRAQISSAH`, outro `<AudiraOutro code="QISSAH" />`.
