# Art Direction — Saat Pasukan Tartar Membantai Bagdad (EP22)

Style: HISTORYMAP

## Idea
Satu meja peta perang Irak 1258: Bagdad bundar di tengah, Sungai Tigris membelahnya, Persia di timur. Semua babak hidup di meja ini; kota tumbuh dari peta lalu hancur, dan kamera terbang dari stasiun ke stasiun. Panji, tenda, dan kuda menggantikan manusia.

## Look
- **Stage:** meja kayu gelap bervernis, sheet peta potret 3.6 × 6.4 (utara = −z), tepi tali emas, latar malam #10151E, kabut 12–26.
- **Stasiun:** (A) Bagdad di tengah: tembok bundar, kubah dan menara prosedural, perpustakaan bertiang, Tigris mengalir utara–selatan membelah kota; (B) Persia/Hamadan di timur: tenda dan panji tug Mongol; (C) baki surat di sisi barat: dua gulungan dan segel lilin; (D) tepi Tigris selatan: tanggul tanah yang jebol; (E) baki karpet di sisi selatan meja; (F) dermaga buku di tepi sungai utara.
- **Lighting:** key lampu hangat dari barat rendah, fill biru 0.38, rim #7FA6D8 0.6, HDRI warmStudio.

### Cahaya per chapter
| Scene | Mood |
|---|---|
| s1 | kota emas senja, lalu bayangan panji timur menutup peta |
| s2 | peta terang merata, kolam cahaya di Bagdad |
| s3 | redup, satu lilin hangat di atas surat |
| s4 | biru dingin, air berkilau, kabut rendah di tepi sungai |
| s5 | jingga asap, cahaya api dari bawah, rim dingin dan haze untuk separasi |
| s6 | spot sempit dingin di karpet, sisa tetap gelap tetapi crush ≤ 2% |
| s7 | sungai abu kehitaman, lalu lampu perpustakaan menyala hangat |
| s8 | fajar emas menyapu seluruh peta dari timur |

## Materials
- **Sheet peta:** POLISH.paper krem, serat dan noda seeded (bump + roughness), lipatan samar.
- **Kota Bagdad:** tembok bundar POLISH.stone tint bata #B08A5A; kubah prosedural (lathe) tint pirus #2E7D7A dan emas #C9A24A; menara silinder bata.
- **Sungai Tigris:** pita air metalness 0.2, roughness 0.15, normal riak bergerak; berubah abu-kehitaman di s7.
- **Banjir (s4):** lembar air transparan 0.7 yang meluas dari tanggul, tepi buih krem.
- **Panji Abbasiyah:** kain hitam dengan tepi emas, POLISH.fabric + sheen, tanpa tulisan sakral.
- **Panji tug Mongol:** tiang kayu dengan jumbai bulu kuda merah-coklat #8B3A1E.
- **Asap (s5):** puff memanjang 2.5:1 searah angin, abu-hangat, alpha rendah; bukan hitam pekat.
- **Karpet (s6):** GLB wool rug, tekstur tenun bump, tergulung lewat deformasi lengkung.
- **Buku (s7):** sampul kulit, tepi lembar krem, jatuh dan mengapung.
- **Detail close-up:** segel lilin merah retak, pin emas, pelat kuningan "AUDIRA QISSAH" di tepi meja.

## Palette
| Token | Hex | Kegunaan |
|---|---|---|
| void | #10151E | latar, kabut |
| paper | #D9C6A0 | sheet peta |
| brick | #B08A5A | tembok dan menara Bagdad |
| dome | #2E7D7A | kubah pirus |
| gold | #E8B84A | angka HUD, kata aktif, rute |
| abbasid | #15161A | panji Abbasiyah (tepi emas) |
| mongol | #8B3A1E | panji tug, panah serbuan |
| river | #254B77 | Tigris |
| ink | #F4EBD8 | teks |

## Typography (font kit HISTORYMAP, bundled)
- **Judul hook / tahun:** 150–200 px tebal emas, garis kiri emas.
- **Nama tokoh:** 96–112 px, kartu gelap.
- **Angka HUD:** 150–200 px emas; sub ≥ 40 px di plat gelap; angka korban selalu bertulis "PERKIRAAN".
- **Label peta:** ≥ 46 px HTML, bukan teks SVG; tidak di y 1200–1450.
- **Caption karaoke:** 56 px di y=1300, kata aktif #E8B84A, jarak kata ≥ 0.4em, bounce ≤ 1.04; potong di tanda baca.

## Depiction rules
- Tidak ada figur manusia sama sekali: khalifah, Hulagu, pasukan, dan warga hanya lewat panji, tenda, kuda, dan bangunan.
- Tidak ada darah, mayat, senjata menusuk, atau wajah. Pembantaian = asap dan bangunan runtuh di kejauhan, angka di kartu.
- Eksekusi khalifah = karpet tergulung diam di lantai, tanpa kuda menginjak, tanpa tubuh.
- Angka korban selalu rentang dan "perkiraan"; tidak memakai klaim "40 hari" maupun klaim Hulagu.
- Tinta Tigris wajib diberi kartu "GAMBARAN SASTRA" sebelum perpustakaan menyala lagi.
- Ayat QS Ali Imran 3:140 ditampilkan sebagai terjemah Kemenag, tanpa kaligrafi Arab buatan.
- Tidak menyinggung tuduhan pengkhianatan wazir Ibn al-Alqami (diperdebatkan) atau polemik mazhab.
- AUDIRA di dunia 3D: pelat kuningan tepi meja (s2 dan s8).
