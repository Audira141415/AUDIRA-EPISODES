# Art Direction — Abu Bakar as-Siddiq: Orang Pertama yang Berkata "Dia Benar" (`HD2D`)

Style: HD2D  <!-- G21 -->

## Idea
Satu diorama Hijaz di atas meja kayu gelap: alun-alun Makkah di tengah, meja juru tulis di sisi utara, jalan batu siang di timur, Gunung Tsur di selatan, dan masjid Madinah di ujung barat yang diterangi fajar. Kamera menempuh perjalanan dari malam penolakan ke fajar kepemimpinan, mengikuti satu sosok kecil yang selalu melangkah ke arah cahaya.

## Look
- **Stage:** diorama di atas papan kayu gelap, langit malam #141B33 ke #1F2A4A, kabut biru tipis jauh, tepi diorama memudar ke gelap (vignette radial dimask dari pita bawah).
- **Floors and stations:** batu alun-alun bertekstur (canvas map seeded cobble, bump 0.5), pasir di tepi, lantai papan di meja juru tulis, jalan batu kapur pucat di set siang, batuan granit kasar di Tsur, tikar anyaman di masjid. Lantai tidak pernah polos: kendi, karung, jejak kaki, semak kering, lentera kecil di FG.
- **Lighting:** key directional hangat #FFC98A + rim dingin bulan #8FA6FF; lentera/obor point light 2400K berkedip seeded (bukan Math.random); lampu minyak 2200K; fill bulan di posisi kamera 0.9. Finish DOCUMENTARY_WARM, exposure 1, envIntensity 0.55, AO, hdri warmStudio, DOF tilt-shift aperture 0.006–0.012 / maxBlur 0.03.
- **Light by chapter:**
  - c00 hook: alun-alun biru bulan, satu berkas cahaya hangat kuning di tengah (satu-satunya sumber panas), kerumunan siluet dingin.
  - c01 intro: peta relief disinari lampu meja tembaga, pin Makkah emas menyala.
  - c02: lampu minyak 2200K di meja juru tulis, gelap di sekeliling.
  - c03: siang terik pucat, matahari keras dari kiri atas, bayangan pendek tajam (satu-satunya set siang penuh).
  - c04a: lereng Tsur biru bulan + barisan obor oranye mendaki; c04b: dalam gua hampir gelap, cahaya lembut putih-emas di samping sprite, obor di mulut gua.
  - c05: masjid sore keemasan, berkas cahaya miring dari atap pelepah ke mimbar.
  - c06: meja netral hangat, timbangan kuningan berkilau, latar gelap.
  - c07: fajar biru-emas, matahari naik di belakang menara sederhana.

## Materials
- **Tokoh:** sprite piksel voxel (`pixel.tsx`) berjubah tanpa wajah: kepala tertutup sorban/kerudung, selalu dari belakang atau samping jauh, tanpa mata/hidung/mulut. Abu Bakar = jubah putih gading + sorban krem (warna konsisten antar set). Bilal = jubah coklat tua. Kerumunan Quraisy = jubah abu-merah tua.
- **Berkas cahaya (Nabi):** cone additive lembut putih-emas + partikel debu emas lambat; tidak pernah berbentuk tubuh.
- **Rumah & Kakbah:** kotak bevel tekstur batu/plester (#8A6A4C, bump 0.4); Kakbah hanya siluet kubus hitam kecil di BG jauh, tanpa detail kiswah/tulisan.
- **Gulungan manuskrip:** kertas krem (roughness 0.95, tepi gelap), tongkat kayu POLISH.wood, wadah gulungan kayu dengan cap ukir "AUDIRA".
- **Rantai:** cincin torus logam besi gelap (metalness 0.8, roughness 0.5), terlepas berurutan.
- **Gua Tsur:** batu granit tak beraturan (displacement noise, bukan lengkung runcing supaya tidak terbaca mihrab), mulut gua rendah dan lebar.
- **Timbangan:** kuningan (metalness 0.9, roughness 0.3), koin emas, piring cekung.
- **Masjid:** tiang batang kurma bertekstur serat, atap pelepah, mimbar tiga anak tangga kayu.
- **Close-up detail:** tetes air jatuh ke tikar, cincin rantai jatuh ke batu, nyala obor di mulut gua, pin peta, tinta di gulungan.

## Palette
| Token | Hex | Kegunaan |
|---|---|---|
| night | #141B33 | langit, latar |
| lantern | #FF9A3C | lentera/obor, kata aktif caption |
| gold | #E8C46A | angka HUD, cahaya, "DIA BENAR" |
| ivory | #EFE6D2 | jubah Abu Bakar, kertas |
| clay | #8A6A4C | rumah, tanah |
| moon | #8FA6FF | rim, bulan |
| denial | #B2473A | chip "PENDUSTA / BERDUSTA" |
| card | #0E1222 | kartu HUD (88%) |

## Typography (bundled)
- **Judul hook / chapter card:** Anton 96–120 px, kapital, putih + kata kunci #E8C46A.
- **Callout HUD:** kartu #0E1222 88% border emas 2 px, label Silkscreen Bold 30 px kapital, angka Anton 72–96 px #E8C46A. Min 64 px dari tepi, di bawah y 236, tinggi kartu atas ≤ 20% frame.
- **Caption 9:16:** Space Grotesk 600 52 px, karaoke per kata, kata aktif #FF9A3C, bounce ≤ 1.04, jarak kata ≥ 0.4em, pusat y 1300, kartu gelap di belakang.
- **Kutipan:** Instrument Serif Italic 60 px di kartu krem, untuk "dia benar", "pemimpin kami", "dua orang, yang ketiganya Allah", "jangan bersedih".

## Depiction rules
- Nabi ﷺ tidak digambarkan dalam bentuk apa pun: hanya berkas cahaya / cahaya lembut. Tidak ada wajah Abu Bakar, Bilal, Umar, atau siapa pun; sprite dari belakang/samping, kepala tertutup.
- Momen tangis hanya bahu bergetar + satu tetes air. Pengejar di gua hanya kaki bayangan dan obor.
- Tidak ada lafaz Allah atau ayat Arab pada objek 3D; kutipan dan rujukan ayat hanya di kartu HUD berbahasa Indonesia.
- Isu urutan masuk Islam: dibingkai "Ibnu Katsir menyebutnya laki-laki dewasa merdeka pertama" (bukan "orang pertama mutlak"); netral, tanpa menyinggung sahabat lain.
- AUDIRA di dunia: cap ukir "AUDIRA" pada wadah gulungan kayu di meja juru tulis (c02), plus `AudiraSignature` @AUDIRAQISSAH dan `<AudiraOutro code="QISSAH" />`.
