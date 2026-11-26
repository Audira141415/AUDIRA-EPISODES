# Art Direction — Dua Kali Khalid bin Walid Mundur (EP19)

Style: HISTORYMAP

## Idea
Satu meja peta perang dari Madinah (selatan) sampai Syria (utara). Semua babak hidup di meja ini; kamera terbang dari stasiun ke stasiun. Panji menggantikan manusia.

## Look
- **Stage:** meja kayu gelap bervernis, sheet peta potret 3.6 × 6.4 (utara = −z), tepi tali emas, latar malam #121822, kabut 12–26.
- **Stasiun:** (A) Mu'tah di tengah, lembah berrelief dan pasir; (B) Madinah di selatan, dinding tanah dan palem; (C) Syria di utara, tenda komando; (D) baki kitab di sisi timur; (E) baki pasir pedang di sisi barat.
- **Lighting:** key lampu hangat dari barat rendah (bayangan panjang), fill biru 0.38, rim #7FA6D8 0.6, HDRI warmStudio.

### Cahaya per chapter
| Scene | Mood |
|---|---|
| s1 | key keras dari samping, debu, hampir senja |
| s2 | peta terang merata, kolam cahaya di Mu'tah |
| s3 | redup, satu lilin hangat di kitab |
| s4 | spot sempit dingin, kilau logam |
| s5 | fajar berdebu, cahaya menyapu ke selatan |
| s6 | senja jingga di Madinah |
| s7 | siang netral di Syria, kolam cahaya pada tiang panji |
| s8 | fajar emas menyapu seluruh peta |

## Materials
- **Sheet peta:** POLISH.paper krem, serat dan noda seeded (bump + roughness), lipatan samar.
- **Relief gunung:** POLISH.stone, seeded peak, tepi lebih gelap.
- **Panji:** POLISH.fabric + sheen di tiang kayu, lipatan vertex deterministik dari t; warna per pihak, tanpa tulisan sakral.
- **Pedang:** logam metalness 0.9, roughness 0.3, env reflection; bilah patah dipotong clipping plane.
- **Pasir:** bump grain halus, riak angin, butir instanced di FG.
- **Kitab:** lembar melengkung berserat, sampul kulit, tepi emas.
- **Dinding Madinah:** GLB adobe, tint tanah, grain.
- **Detail close-up:** pin emas, paku tali, pelat kuningan "AUDIRA QISSAH" di tepi meja.

## Palette
| Token | Hex | Kegunaan |
|---|---|---|
| void | #121822 | latar, kabut |
| paper | #D9C6A0 | sheet peta |
| relief | #8C7A5C | gunung |
| muslim | #2F6B4F | panji pasukan Muslim |
| byzantine | #8B1E1E | panji lawan |
| retreat | #E8B84A | panah mundur, angka HUD |
| steel | #C9D1D9 | bilah |
| ink | #F4EBD8 | teks |
| river | #254B77 | Sungai Yordan |

## Typography (font kit HISTORYMAP, bundled)
- **Judul hook / nama:** 96–112 px tebal, garis kiri emas.
- **Angka HUD:** 150–200 px emas; sub ≥ 40 px di plat gelap.
- **Label peta:** ≥ 46 px HTML, bukan teks SVG.
- **Caption karaoke:** 56 px di y=1300, kata aktif #E8B84A, jarak kata ≥ 0.4em, bounce ≤ 1.04.

## Depiction rules
- Tidak ada figur manusia sama sekali: Nabi, sahabat, dan pasukan hanya lewat panji, kuda, tenda, pedang, kitab.
- Tidak ada darah, mayat, atau wajah. Komandan gugur = panji rebah perlahan.
- Hasil Mu'tah netral (tanpa cap menang atau kalah). s6 wajib label "RIWAYAT BELAKANGAN, LEMAH".
- Tidak ada jumlah pasukan lawan; tidak membahas Malik bin Nuwayrah atau polemik Sunni/Syiah.
- AUDIRA di dunia 3D: pelat kuningan tepi meja (s2 dan s8).
