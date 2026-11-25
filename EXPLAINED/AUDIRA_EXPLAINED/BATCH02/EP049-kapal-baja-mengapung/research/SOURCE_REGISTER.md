# SOURCE_REGISTER — EP049 "Mengapa Kapal Raksasa dari Baja Tidak Tenggelam?"

Tanggal akses semua sumber: 2026-11-07. Jalur: Python urllib (WebFetch error model di sesi ini), pdftotext untuk PDF USNA, Google News RSS via curl.

## Daftar sumber

| Kode | Judul | Penerbit | URL |
|---|---|---|---|
| S1 | Buoyancy: Archimedes Principle (K-12 lesson, ed. Aug 1996) | NASA Glenn Research Center | https://www.grc.nasa.gov/www/k-12/WindTunnel/Activities/buoy_Archimedes.html |
| S2 | Pressure / Buoyancy / Archimedes' Principle (HyperPhysics, R. Nave) | Georgia State University | http://hyperphysics.phy-astr.gsu.edu/hbase/pbuoy.html |
| S3 | EN400 Principles of Ship Performance, Chapter 3 Hydrostatics | U.S. Naval Academy, Naval Architecture & Ocean Engineering | https://www.usna.edu/NAOE/_files/documents/Courses/EN400/02.03%20Chapter%203.pdf |
| S4 | EN400 Principles of Ship Performance, Chapter 4 Stability | U.S. Naval Academy | https://www.usna.edu/NAOE/_files/documents/Courses/EN400/02.04%20Chapter%204.pdf |
| S5 | International Convention on Load Lines, 1966 | International Maritime Organization (IMO) | https://www.imo.org/en/OurWork/Safety/Pages/LoadLines.aspx |
| S6 | International Convention for the Safety of Life at Sea (SOLAS), 1974 | IMO | https://www.imo.org/en/About/Conventions/Pages/International-Convention-for-the-Safety-of-Life-at-Sea-(SOLAS),-1974.aspx |
| S7 | Metals and Alloys - Densities | The Engineering ToolBox | https://www.engineeringtoolbox.com/metal-alloys-densities-d_50.html |
| S8 | Water Density | USGS Water Science School | https://www.usgs.gov/special-topics/water-science-school/science/water-density |
| W1 | Buoyancy | Wikipedia EN | https://en.wikipedia.org/wiki/Buoyancy |
| W2 | Archimedes' principle | Wikipedia EN | https://en.wikipedia.org/wiki/Archimedes%27_principle |
| W3 | Load line (watercraft) | Wikipedia EN (mengutip Merchant Shipping Act 1876, legislation.gov.uk) | https://en.wikipedia.org/wiki/Load_line_(watercraft) |
| W4 | Seawater | Wikipedia EN | https://en.wikipedia.org/wiki/Seawater |
| W5 | Steel | Wikipedia EN | https://en.wikipedia.org/wiki/Steel |
| W6 | Ship stability | Wikipedia EN | https://en.wikipedia.org/wiki/Ship_stability |
| W7 | Metacentric height | Wikipedia EN | https://en.wikipedia.org/wiki/Metacentric_height |
| W8 | Compartment (ship) | Wikipedia EN | https://en.wikipedia.org/wiki/Compartment_(ship) |
| W9 | Draft (hull) | Wikipedia EN | https://en.wikipedia.org/wiki/Draft_(hull) |
| W10 | Samuel Plimsoll | Wikipedia EN | https://en.wikipedia.org/wiki/Samuel_Plimsoll |
| W11 | Prinsip Archimedes | Wikipedia ID | https://id.wikipedia.org/wiki/Prinsip_Archimedes |

## Register klaim

| # | Klaim | Sumber | Tanggal akses | Tingkat | Catatan |
|---|---|---|---|---|---|
| 1 | Hukum Archimedes: gaya apung pada benda yang tercelup sama dengan berat fluida yang dipindahkan benda itu. | S1, S2, S3, W2 | 2026-11-07 | HIGH | Rumusan identik di NASA dan HyperPhysics. |
| 2 | Gaya apung muncul karena tekanan air naik seiring kedalaman, jadi dorongan ke atas di bagian bawah benda lebih besar daripada dorongan ke bawah di bagian atas. | S1, S2 | 2026-11-07 | HIGH | Dasar fisis untuk visual panah tekanan. |
| 3 | Agar mengapung, benda harus bisa memindahkan air yang beratnya sama dengan berat benda itu sendiri ("prinsip flotasi"). Benda terapung: berat = gaya apung. | S3, W2, W11 | 2026-11-07 | HIGH | USNA: "the object must be able to displace a volume of water equal in weight to the weight of the object itself." |
| 4 | Benda dengan massa jenis rata-rata lebih besar dari fluida cenderung tenggelam; kalau lebih kecil, gaya apung bisa membuatnya mengapung. | W1, S2 | 2026-11-07 | HIGH | HyperPhysics membahas "average density" (contoh mahkota berongga). Kata kunci: rata-rata, termasuk udara di dalam. |
| 5 | Massa jenis baja ≈ 7.850 kg/m³ (rentang umum 7.750–8.050 kg/m³ tergantung paduan). | S7 (Steel 7850), W5 (7.750–8.050) | 2026-11-07 | HIGH | Engineering ToolBox tabel lain (density-solids) mencantumkan 7,82 g/cm³; aman pakai "sekitar 7.850" atau "hampir 8 ton per meter kubik". |
| 6 | Air laut tipikal ≈ 1.025 kg/m³ (dipakai di aturan garis muat); air laut permukaan berkisar ~1.020–1.029 kg/m³ tergantung suhu & salinitas. | W3, W4 | 2026-11-07 | HIGH | W4: 1.023,6 kg/m³ pada 25 °C, salinitas 35 g/kg. Tidak ada sumber pemerintah yang terbuka di sesi ini; dua artikel Wikipedia dengan rujukan masing-masing. |
| 7 | Air tawar ≈ 1.000 kg/m³ (USGS: 0,9998395 g/mL pada 4 °C; aturan garis muat memakai 1.000 kg/m³). | S8, W3 | 2026-11-07 | HIGH | |
| 8 | Baja ±7,7× lebih padat dari air laut (7.850 / 1.025). | turunan #5 & #6 | 2026-11-07 | HIGH (hitungan) | Hitungan sendiri, bukan kutipan. Boleh dibulatkan "hampir 8 kali". |
| 9 | Kapal yang sama tenggelam lebih dalam di air tawar daripada di air laut; air hangat juga kurang padat sehingga kapal lebih dalam. | W3, W1, S3 | 2026-11-07 | HIGH | S3 menyebut koreksi displacement untuk massa jenis air sebenarnya. |
| 10 | Garis muat/Plimsoll line menandai batas legal kapal boleh dimuat (sarat maksimum) untuk jenis air dan musim tertentu; dicat di tengah kapal (amidships) di kedua sisi bersama garis geladak. | S5, W3 | 2026-11-07 | HIGH | IMO: "All assigned load lines must be marked amidships on each side of the ship, together with the deck line." |
| 11 | Tujuan garis muat: menjamin lambung timbul (freeboard) dan daya apung cadangan (reserve buoyancy) cukup. | S5, W3 | 2026-11-07 | HIGH | IMO: konvensi 1930 berbasis prinsip reserve buoyancy. |
| 12 | Konvensi Garis Muat Internasional 1966 diadopsi 5 April 1966, berlaku 21 Juli 1968; konvensi pertama 1930. | S5 | 2026-11-07 | MED | Satu sumber, tapi sumber primer (IMO). Aman dipakai. |
| 13 | Tanda Plimsoll: lingkaran dengan garis horizontal melintang; garis itu sejajar garis muat musim panas (S). Tanda lain: TF (tropis air tawar), F (air tawar), T (tropis), S (musim panas), W (musim dingin), WNA (musim dingin Atlantik Utara). | W3 | 2026-11-07 | MED | Hanya Wikipedia (merujuk UK Load Line Regulations 1998). Detail bentuk huruf cukup untuk visual; jangan sebut ukuran mm di naskah. |
| 14 | Samuel Plimsoll (anggota parlemen Inggris) mengampanyekan garis muat melawan "coffin ships" (kapal kelebihan muatan); Merchant Shipping Act 1876 mewajibkan tanda garis muat. | W3, W10 | 2026-11-07 | HIGH (dua artikel), sumber primer legislation.gov.uk dirujuk W3 | Klaim "ditemukan 1876 oleh Plimsoll" ada di W3, tetapi W3 juga mencatat ada aturan Lloyd's Register 1835 dan praktik Venesia lebih tua. Lebih aman: "dipopulerkan/diperjuangkan Plimsoll, jadi wajib hukum di Inggris 1876". |
| 15 | Sarat (draft/draught) = kedalaman kapal di bawah garis air, diukur vertikal sampai titik terendah lambung (lunas, baling-baling, dll.); berubah sesuai muatan. | W9, S3 | 2026-11-07 | HIGH | S3 membahas draft marks depan dan belakang (fwd/aft). |
| 16 | Sekat kedap air (watertight bulkhead) membagi lambung menjadi kompartemen; bila lambung bocor, air terkurung di sebagian kompartemen sehingga daya apung tidak hilang semua. | W8, S6 | 2026-11-07 | HIGH | SOLAS Bab II-1: kapal penumpang harus tetap mengapung dan stabil setelah kerusakan yang diasumsikan. |
| 17 | SOLAS: tingkat pembagian kompartemen diukur dari jarak maksimum antar sekat, tergantung panjang kapal dan jenis layanan; tertinggi untuk kapal penumpang. | S6 | 2026-11-07 | MED | Sumber primer tunggal (IMO). |
| 18 | Kapal baja tanpa sekat kedap air akan tenggelam bila air masuk lebih cepat daripada pompa membuangnya. | W8 | 2026-11-07 | MED | Logis secara fisika, tapi satu sumber. |
| 19 | Sekat kedap air sudah dipakai kapal jung Tiongkok (dinasti Han & Song). | W8 | 2026-11-07 | LOW-MED | Wikipedia saja; jangan dipakai di naskah tanpa sumber tambahan. |
| 20 | Berat kapal bekerja di pusat gravitasi (G); gaya apung bekerja di pusat apung (B, titik tengah volume air yang dipindahkan). Saat tegak, keduanya segaris vertikal. | S3, S4, W6 | 2026-11-07 | HIGH | |
| 21 | Saat kapal miring, sisi yang tercelup bertambah sehingga B bergeser ke sisi rendah; berat (di G) dan gaya apung (di B) membentuk momen pengembali (righting moment) yang menegakkan kapal. | S4, W6 | 2026-11-07 | HIGH | |
| 22 | Metasentrum (M): titik potong garis gaya apung saat kapal sedikit miring dengan garis tengah kapal. Selama M di atas G (GM positif), kapal stabil tegak; GM negatif = tidak stabil. | W6, W7, S4 | 2026-11-07 | HIGH | W6: pusat gravitasi bisa saja di atas pusat apung dan kapal tetap stabil, asalkan M di atas G. Penting: jangan bilang "G harus di bawah B". |
| 23 | GM terlalu besar membuat oleng cepat dan tidak nyaman bagi penumpang; kapal penumpang butuh GM cukup tapi tidak berlebihan. | W7 | 2026-11-07 | MED | |
| 24 | Contoh kapal Indonesia (KM Pelni): tonase, dimensi, sarat. | — | 2026-11-07 | TIDAK TERVERIFIKASI | Situs pelni.co.id tidak menampilkan spesifikasi kapal penumpang yang bisa dibaca; halaman /armada 404. Berita jadwal (KM Kelud, KM Dobonsolo, KM Tidar) ada, tapi tidak memberi angka resmi. Jangan pakai angka. |
| 25 | Ratifikasi Indonesia atas Konvensi Load Lines 1966 / aturan garis muat Kemenhub. | — | 2026-11-07 | TIDAK TERVERIFIKASI | JDIH Kemenhub tidak bisa dicari via skrip di sesi ini. |

## Musik & SFX

| Aset | Sumber | Lisensi |
|---|---|---|
| Musik latar | Prosedural numpy `_tools/synth_bgm.py` (dibuat AUDIRA) | Milik sendiri, bebas lisensi |
| SFX (whoosh, impact, pop, click, riser, glitch) | Pustaka AUDIRA `shared/assets/sfx` | Pustaka internal AUDIRA |
| VO | Cartesia sonic-3, suara Galang | Lisensi akun Cartesia AUDIRA |
