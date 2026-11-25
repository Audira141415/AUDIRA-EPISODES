# Art Direction — Kenapa Kita Selalu Melihat Sisi Bulan yang Sama (`SCALEFORGE`)

Style: SCALEFORGE

## Idea
Satu "laboratorium ruang angkasa" bergaya alat ukur sains: Bumi, Bulan, dan Matahari diletakkan di ruang gelap yang bersih, dan setiap babak memakai satu instrumen ukur (penggaris oranye, cincin derajat, penghitung hari, jam) untuk membuat gerak Bulan terbaca tanpa suara.

## Look
- **Stage:** ruang angkasa biru-hitam bergradasi (bukan hitam pekat), bintang halus, kabut tipis di belakang supaya ada kedalaman.
- **Stations:** 7 adegan berbeda (lihat STORYBOARD): close-up Bulan, deretan Bulan malam, diagram orbit atas, Bulan lonjong, sisi jauh + misi di permukaan kawah, cermin laser Apollo, Bumi–Bulan outro.
- **Lighting:** satu key light "Matahari" hangat dari kiri (warna #FFE2B0), fill biru lemah dari kanan, rim tipis. `<Finish profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1} envIntensity={0.55} ao={false} />` (motion memory SCALEFORGE).
- **Light by chapter:** hook = rim dramatis, sisi Bulan setengah gelap; konteks = cahaya rata malam; orbit = cahaya atas datar seperti diagram; penjelasan = merah-oranye untuk panah gravitasi; payoff = Matahari menyinari sisi jauh penuh, permukaan kawah terang; outro = cahaya keemasan.

## Materials
- **Bulan:** sphere 128 segmen, tekstur kawah prosedural (canvas: maria gelap + kawah berbingkai), bump dari tekstur yang sama, roughness 0.95. Satu penanda wajah (panah oranye) di sisi dekat.
- **Bumi:** `makeEarthTextures` dari kit scaleforge (benua, awan, atmosfer `makeGlow` biru).
- **Matahari:** `makeSunTexture` + `makeGlow` oranye.
- **GLB nyata:** rover (Chang'e 4 / Yutu-2 sebagai rover umum, tanpa logo), kawah dan bongkah regolit, cermin pemantul (phase-mirror), sinar laser, astronaut, satelit komunikasi, asteroid. Semua low-poly Polyfork, dipakai apa adanya.
- **Close-up detail:** bongkah regolit di FG adegan kawah, panel cermin, roda rover.

## Palette
| Token | Hex | Kegunaan |
|---|---|---|
| primary | #FF8A2B | penggaris, panah wajah, kartu angka |
| secondary | #4FC3F7 | Bumi, garis orbit, label sekunder |
| accent | #FFE2B0 | cahaya Matahari, sorotan payoff |
| bg | #070B18 | ruang angkasa |
| ink | #F4F6FB | teks kartu |

## Typography (font bundel starter)
- **Kartu angka (callout):** `SafeLabel` ≥ 36 px, angka 96–120 px tebal, kartu gelap transparan bertepi oranye.
- **Judul babak:** 44 px, letter-spacing 0.04em.
- **Caption 9:16:** karaoke per kata di y=1300, 52 px, kata aktif oranye, bounce ≤ 1.04, jarak kata ≥ 0.4em.

## Depiction rules
- Tidak ada logo badan antariksa nyata, bendera, atau wajah orang. Misi disebut lewat teks kartu ("Luna 3", "Chang'e 4", "Chang'e 6").
- Ukuran dan jarak Bumi–Bulan tidak sebanding: kartu kecil "skala tidak sebanding" wajib terbaca di adegan orbit dan outro (pelajaran SCALEFORGE).
- Sisi jauh Bulan tidak boleh digambar gelap saat dibahas; tampilkan disinari Matahari.
- AUDIRA muncul di dalam dunia 3D: label "AUDIRA LAB" di pelat cermin pemantul dan di kartu penghitung orbit, plus outro card AUDIRA Sains.
