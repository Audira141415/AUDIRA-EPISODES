# Art Direction — Saat Umar bin Khattab Menangis di Depan Periuk Berisi Air (`HD2D`)

Style: HD2D  <!-- G21 -->

## Idea
Satu diorama malam Madinah di atas meja gelap: kota tanah liat di tengah, padang lava hitam Harrah di tepi barat dengan satu api kecil, gudang tepung di utara, dan masjid sederhana di timur. Kamera berjalan dari satu stasiun ke stasiun lain mengikuti langkah ronda malam, sehingga seluruh kisah terasa satu perjalanan malam yang berakhir di fajar.

## Look
- **Stage:** diorama di atas papan kayu gelap, langit biru malam #141B33 ke #1F2A4A, kabut biru tipis di kejauhan, tepi diorama memudar ke gelap (vignette).
- **Floors and stations:** jalan tanah padat bertekstur (canvas map seeded, bump 0.5), batu lava hitam (#22201F, kasar) di Harrah, pasir di sekitar api, lantai bata lumpur di gudang, tikar anyaman di masjid. Lantai tidak pernah polos: batu, jejak kaki, semak kering, kendi.
- **Lighting:** key directional hangat #FFC98A + rim dingin bulan #8FA6FF, api unggun = point light 2400K berkedip seeded (bukan Math.random), lampu minyak 2200K. Finish DOCUMENTARY_WARM, exposure 1, envIntensity 0.55, AO, hdri warmStudio, DOF tilt-shift aperture 0.006–0.012 / maxBlur 0.03.
- **Light by chapter:** hook = peta perang merah tembaga vs api kecil; ronda = biru bulan + titik api jauh; periuk = api oranye penuh, sisanya gelap; karung = obor gudang kuning; Ramadah = siang pucat abu-coklat, matahari keras; hisab = satu lampu minyak hampir padam, emas berkilau dingin; payoff = fajar biru-emas dari jendela masjid.

## Materials
- **Periuk:** logam tembaga gelap (metalness 0.7, roughness 0.45, bump goresan), uap = plane additive tipis, air di dalam = disk biru gelap reflektif (lalu bubur krem di payoff).
- **Api unggun:** kayu bakar bevel (POLISH.wood) + nyala = cone emisif berlapis 3 warna yang berdenyut, bara = titik emisif kecil, point light.
- **Rumah tanah liat:** kotak bevel bertekstur plester lumpur (#8A6A4C, bump 0.4), atap datar dengan balok kurma menonjol.
- **Karung tepung:** kain goni (canvas map serat, roughness 0.9), wadah lemak = kendi tanah liat.
- **Tokoh:** sprite piksel voxel (pixel.tsx) berjubah tanpa wajah: kepala tertutup sorban/kerudung, selalu dari belakang atau samping jauh; tidak ada detail mata/hidung/mulut.
- **Close-up detail:** setetes air jatuh ke pasir, sprite meniup api, mangkuk kayu, sepotong roti + mangkuk minyak, timbangan kuningan.

## Palette
| Token | Hex | Kegunaan |
|---|---|---|
| night | #141B33 | langit, latar |
| fire | #FF9A3C | api, kata aktif caption |
| gold | #E8C46A | angka HUD, emas |
| clay | #8A6A4C | rumah, tanah |
| moon | #8FA6FF | rim, bulan |
| card | #0E1222 | kartu HUD (88%) |

## Typography (bundled)
- **Judul hook / chapter card:** Anton 96–120 px, kapital, putih + kata kunci #FF9A3C.
- **Callout HUD:** kartu #0E1222 88% border emas 2 px, label Silkscreen Bold 30 px kapital, angka Anton 72–96 px #E8C46A. Min 64 px dari tepi, di bawah y 236.
- **Caption 9:16:** Space Grotesk 600 52 px, karaoke per kata, kata aktif #FF9A3C, bounce ≤ 1.04, jarak kata ≥ 0.4em, pusat y 1300, kartu gelap di belakang.
- **Kutipan:** Instrument Serif Italic 60 px di kartu krem, untuk "Allah antara kami dan Umar" dan "kamu mau memikul dosaku".

## Depiction rules
- Tidak ada wajah Umar, Aslam, ibu, anak, atau jamaah. Sprite selalu dari belakang/samping dengan kepala tertutup; momen tangis hanya bahu bergetar dan satu tetes air jatuh ke pasir.
- Tidak menggambar Nabi ﷺ. Tidak ada lafaz Allah pada objek; kutipan hanya di kartu HUD.
- Riwayat tanpa sanad dibingkai "Aslam bercerita" dan "katanya"; kartu sumber "Sahih al-Bukhari 3693" di beat hisab.
- AUDIRA di dunia: cap kayu "AUDIRA" pada karung tepung di gudang (anti-reupload lapis 2), plus AudiraSignature + outro card.
