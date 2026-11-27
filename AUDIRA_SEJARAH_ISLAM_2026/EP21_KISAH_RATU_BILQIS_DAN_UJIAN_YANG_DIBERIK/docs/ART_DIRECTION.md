# Art Direction — Kisah Ratu Bilqis dan Ujian yang Diberikan Nabi Sulaiman (`HD2D`)

Style: HD2D  <!-- G21 -->

## Idea
Dua diorama di atas meja gelap yang dihubungkan jalur gurun: negeri Saba di selatan (kota bata lumpur, bendungan Marib, kuil matahari) dan istana Sulaiman di utara (perkemahan barisan burung, aula singgasana, istana kaca di atas air). Tokoh sprite piksel kecil berkerudung tanpa wajah. Kamera mengikuti perjalanan Hud-hud, surat, hadiah, singgasana, lalu sang ratu sendiri dari selatan ke utara, dari cahaya matahari yang disembah ke fajar penyerahan diri.

## Look
- **Stage:** dua diorama di papan kayu gelap, tepi memudar ke vignette; jalur gurun bertekstur di antara keduanya; kabut tipis memisahkan stasiun.
- **Floors and stations:** pasir bertekstur dengan jejak kaki (gurun, perkemahan); bata lumpur + plester (kota Saba, majelis); lantai batu pualam bertekstur (aula Sulaiman); lantai kaca di atas air mengalir (istana kaca). Lantai tidak pernah polos.
- **Lighting:** key directional hangat #FFC98A + rim dingin #8FA6FF, Finish DOCUMENTARY_WARM, exposure 1, envIntensity 0.55, AO, hdri warmStudio, DOF tilt-shift aperture 0.006–0.012 / maxBlur 0.03. Api/obor/riak seeded (bukan Math.random).
- **Light by chapter (tiap set beda suhu):** c00 istana kaca = biru-hijau dingin dari air di bawah lantai + satu lampu gantung emas; c01 Saba = siang terik emas dari kuil matahari, bendungan Marib berkilau; c02 perkemahan Sulaiman = pagi pucat, lalu kuil Saba senja oranye (matahari besar di langit); c03 majelis Saba = obor 2400K, latar gelap, satu berkas cahaya di kursi ratu; c04 gurun = siang putih, kilatan cahaya singgasana berpindah, lalu aula Sulaiman hangat; c05 aula = lampu minyak + berkas cahaya jendela, permata berkilau; c06 istana kaca = biru-hijau (lebih terang dari c00, kamera dari sudut lain); c07 bukit/aula fajar = biru ke emas.
- Tiap set punya satu sumber cahaya jelas; tidak ada adegan gelap total. Target look.json: crush per frame ≤ 2%, clipHi 0, diversity ≥ 30.

## Materials
- **Lantai kaca (hero c00/c06):** `MeshPhysicalMaterial` transmission 0.9, roughness 0.05, clearcoat 1, ior 1.5; di bawahnya bidang air biru-hijau dengan normal map seeded bergulir + ikan sprite kecil + tiang pantul; garis sambungan panel kaca tipis emas supaya "kaca" terbaca setelah koreksi Sulaiman.
- **Singgasana Bilqis (c04/c05):** GLB `looted-gilded-throne-008fc3` (prop), emas metalness 0.85 roughness 0.3, buang aksen naga bila ada; permata GLB `cut-ruby-3ded3a` + `cut-emerald-74d180` sebagai hiasan yang terlepas satu per satu di c05.
- **Peti hadiah (c03/c04):** GLB `chest-dais-d2bc39`, isi `coin-hoard-heap-07b6e4`; satu peti diberi cap "AUDIRA" (anti-reupload lapis 2).
- **Surat bercap:** gulungan perkamen krem bertekstur, segel lilin merah tanpa tulisan lafaz.
- **Kuil matahari Saba + bendungan Marib:** batu kapur kuning bertekstur, pilar persegi (gaya Arab Selatan), bendungan tanah-batu dengan pintu air.
- **Burung:** barisan burung sprite piksel (merpati, elang), Hud-hud sprite piksel dengan jambul oranye-hitam khas.
- **Tokoh:** sprite piksel voxel (`pixel.tsx`) berkerudung, tidak ada mata/hidung/mulut; selalu dari belakang/samping/jauh. Bilqis: jubah merah-anggur + selendang emas; Sulaiman: jubah putih + selendang hijau, hanya dari jauh/belakang; pembesar Saba jubah coklat; utusan hadiah jubah biru. Fill dingin dari arah kamera (pointLight 0.9) supaya punggung sprite tidak gumpal hitam.

## Palette
| Token | Hex | Kegunaan |
|---|---|---|
| night | #141B33 | latar, langit malam |
| sand | #D8B880 | gurun, bata lumpur |
| gold | #E8C46A | emas, singgasana, angka HUD |
| lamp | #FFB347 | obor, kata aktif caption |
| glass | #5FC7C2 | air di bawah kaca, aksen kaca |
| wine | #7A2338 | jubah Bilqis |
| moon | #8FA6FF | rim |
| card | #0E1222 | kartu HUD (88%) |

## Typography (bundled)
- **Judul hook / chapter card:** Anton 96–120 px, kapital, putih + kata kunci #FFB347.
- **Callout HUD:** kartu #0E1222 88% border emas 2 px, label Silkscreen Bold 30 px kapital, angka Anton 72–96 px #E8C46A.
- **Caption 9:16:** Space Grotesk 600 52 px, karaoke per kata, kata aktif #FFB347, bounce ≤ 1.04, jarak kata ≥ 0.4em, pusat y 1300, kartu gelap di belakang.
- **Kutipan ayat:** Instrument Serif Italic 60 px di kartu krem (27:40, 27:42, 27:44).

## Depiction rules
- Tidak ada wajah Nabi Sulaiman, Bilqis, pembesar, atau utusan. Sulaiman hanya dari jauh atau dari belakang, tidak pernah close-up.
- Adab perempuan: "menyingkap betis" digambar sebagai ujung jubah terangkat sebatas mata kaki dari belakang; betis tidak diperlihatkan.
- Tidak ada lafaz Allah pada objek dunia (surat, langit, dinding); kutipan ayat hanya di kartu HUD dengan terjemah Indonesia. Payoff c07 memakai cahaya fajar menggantikan matahari yang disembah, bukan kaligrafi di langit.
- Penyembahan matahari (c02) digambar sebagai barisan sprite kecil dari belakang menghadap disk matahari, tanpa ritual detail.
- Jin/ifrit (27:39) tidak digambar. "Orang yang punya ilmu dari Kitab" hanya kartu HUD, tanpa figur.
- Nama "Bilqis" ditandai "riwayat ulama" (kartu c01); hadis Abu Bakrah dan riwayat Israiliyat tidak dipakai.
- AUDIRA di dunia: cap pada peti hadiah + papan gerbang kota Saba. AudiraSignature `seed="ratu-bilqis-ujian"` handle `@AUDIRAQISSAH`, outro `<AudiraOutro code="QISSAH" />`.
