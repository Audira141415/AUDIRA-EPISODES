# SOURCE_REGISTER — EP047 "Mengapa Sinyal HP Bisa Hilang di Dalam Gedung?"

Tanggal akses semua sumber: 2026-11-07 (kecuali ditandai lain).
Jalur riset: unduh PDF langsung (ITU, ETSI, NIST) + pdftotext; Wikipedia API; Google News RSS + dekode batchexecute; Python urllib untuk detik/CNN/Tirto/IndoTelko/KonstruksiMedia. WebFetch dan WebSearch error ("cc/claude-haiku-4-5" tidak tersedia).

## Daftar sumber

| Kode | Sumber | Penerbit | URL |
|---|---|---|---|
| S1 | Rec. ITU-R P.2109-2 (08/2023) "Prediction of building entry loss" | ITU-R (standar) | https://www.itu.int/rec/R-REC-P.2109/en (PDF: https://www.itu.int/dms_pubrec/itu-r/rec/p/R-REC-P.2109-2-202308-I!!PDF-E.pdf) |
| S2 | 3GPP TR 38.901 v17.0.0 (ETSI TR 138 901 V17.0.0, 2022-04), Sub-bab 7.4.3 "O2I building penetration loss" | 3GPP / ETSI (standar) | https://www.etsi.org/deliver/etsi_tr/138900_138999/138901/17.00.00_60/tr_138901v170000p.pdf |
| S3 | Rec. ITU-R P.2040-4 (09/2025) "Effects of building materials and structures on radiowave propagation above about 100 MHz" | ITU-R (standar) | https://www.itu.int/rec/R-REC-P.2040/en |
| S4 | Holloway dkk., NIST Technical Note 1545 (Agustus 2008) "Attenuation of Radio Wave Signals Coupled Into Twelve Large Building Structures", DOI 10.6028/NIST.TN.1545 | NIST (lembaga pemerintah AS) | https://nvlpubs.nist.gov/nistpubs/Legacy/TN/nbstechnicalnote1545.pdf |
| S5 | Wikipedia EN "Faraday cage" | Wikipedia (konteks) | https://en.wikipedia.org/wiki/Faraday_cage |
| S6 | Wikipedia EN "Distributed antenna system" | Wikipedia (konteks) | https://en.wikipedia.org/wiki/Distributed_antenna_system |
| S7 | Wikipedia EN "Femtocell" | Wikipedia (konteks) | https://en.wikipedia.org/wiki/Femtocell |
| S8 | Wikipedia EN "Wi-Fi calling" | Wikipedia (konteks) | https://en.wikipedia.org/wiki/Wi-Fi_calling |
| S9 | "Make a call with Wi-Fi Calling" | Apple Support (produsen) | https://support.apple.com/en-us/108066 |
| S10 | "Small cells" (halaman produk Radio Dot System) | Ericsson (vendor) | https://www.ericsson.com/en/small-cells |
| S11 | "Pakai Repeater Ilegal? Siap-siap Didenda Rp 600 Juta!" (26 Feb 2014) | detikInet | https://inet.detik.com/telecommunication/d-2509152/pakai-repeater-ilegal-siap-siap-didenda-rp-600-juta |
| S12 | "Penjual Alat Penguat Sinyal Ilegal bakal Dikriminalkan" (11/12 Mar 2015) | CNN Indonesia | https://www.cnnindonesia.com/teknologi/20150311153033-185-38413/penjual-alat-penguat-sinyal-ilegal-bakal-dikriminalkan |
| S13 | "Tower Bersama akan sediakan layanan telekomunikasi bagi MRT Jakarta" (23 Jan 2018) | IndoTelko | https://www.indotelko.com/read/1516673255/tower-bersama-mrt-jakarta |
| S14 | "Melawan Sinyal Mati: Nasib XL Hingga Indosat di Terowongan MRT" (8 Apr 2019) | Tirto.id | https://tirto.id/melawan-sinyal-mati-nasib-xl-hingga-indosat-di-terowongan-mrt-dluG |
| S15 | "Indosat: Biaya Pasang Jaringan Telko di MRT Jakarta Mahal" (25 Mar 2019) | CNN Indonesia | https://www.cnnindonesia.com/teknologi/20190325182953-213-380551/indosat-biaya-pasang-jaringan-telko-di-mrt-jakarta-mahal |
| S16 | "IBS Dorong Efisiensi Infrastruktur Jaringan Gedung dengan Konsep Neutral Host" (13 Sep 2026) | KonstruksiMedia | https://konstruksimedia.com/ibs-dorong-efisiensi-infrastruktur-jaringan-gedung-dengan-konsep-neutral-host/ |
| S17 | "Teknologi Ini Bikin Sinyal Anti Lelet di Gedung Tinggi" (15 Agu 2021, **advertorial Tri**) | Tirto.id | https://tirto.id/teknologi-ini-bikin-sinyal-anti-lelet-di-gedung-tinggi-giD6 |
| S18 | Stone, NISTIR 6055 (1997) "Electromagnetic Signal Attenuation in Construction Materials" (hanya abstrak/daftar isi terbaca) | NIST | https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir6055.pdf |

Tidak terbaca (dicatat untuk cek manual): Komdigi "Gangguan telekomunikasi akibat repeater ilegal" (29 Des 2024), https://www.komdigi.go.id/berita/berita-komdigi/detail/ganguan-telekomunikasi-akibat-repeater-ilegal, HTTP 403. ANTARA 11 Mar 2015 (operasi penertiban repeater) diputus server. Ericsson halaman indoor-connectivity HTTP 403.

## Tabel klaim

| # | Klaim | Sumber | Tanggal akses | Tingkat | Catatan |
|---|---|---|---|---|---|
| 1 | Sinyal yang masuk ke gedung mengalami "building entry loss" (BEL): tambahan redaman karena terminal berada di dalam gedung. | S1 (Annex 2 §3.1), S2 (§7.4.3), S4 | 2026-11-07 | HIGH | Definisi resmi ITU. |
| 2 | Gedung terbagi dua populasi: "traditional" dan "thermally-efficient" (kaca berlapis logam/metallised glass, panel berlapis foil, beton bertulang tebal, dinding berinsulasi). Gedung hemat energi umumnya redamannya jauh lebih tinggi. | S1 (§2.1), S2 (low-loss vs high-loss model; "metal-coated glass") | 2026-11-07 | HIGH | ITU menegaskan klasifikasi ini soal efisiensi termal, bukan usia/jenis gedung. |
| 3 | Median BEL (sudut horizontal) model ITU-R P.2109-2: gedung tradisional ≈14 dB @0,9 GHz, ≈15 dB @1,8–2,3 GHz, ≈16 dB @3,5 GHz, ≈20 dB @28 GHz; gedung hemat energi ≈31 dB @0,9 GHz, ≈31 dB @1,8–3,5 GHz, ≈42 dB @28 GHz. | S1 (Persamaan 1–9, Tabel 1) | 2026-11-07 | HIGH (satu standar, angka dihitung ulang) | Dihitung sendiri dari koefisien Tabel 1, P = 0,5, elevasi 0°. Ini median statistik, bukan nilai pasti satu gedung. Pembulatan "sekitar 15 dB vs sekitar 30 dB" aman. |
| 4 | Contoh redaman per material (3GPP, f dalam GHz): kaca biasa 2 + 0,2f dB; kaca IRR/berlapis logam 23 + 0,3f dB; beton 5 + 4f dB; kayu 4,85 + 0,12f dB. Hasil: @1,8 GHz kaca ≈2,4, kaca IRR ≈23,5, beton ≈12 dB; @3,5 GHz beton ≈19 dB; @28 GHz beton ≈117 dB. | S2 (Tabel 7.4.3-1) | 2026-11-07 | HIGH untuk tren (S1+S2 sejalan); angka spesifik MED (satu standar, "example values") | Nilai beton 3GPP ini untuk satu dinding beton model simulasi, bukan semua beton. Kaca IRR = Infrared Reflective. |
| 5 | Kaca low-e/berlapis logam bisa meredam ±10× lebih kuat dari kaca biasa (≈23 dB vs ≈2 dB). | S2, S1 (selisih dua kelas gedung ≈15 dB) | 2026-11-07 | HIGH | 10 dB = daya 1/10; 20 dB = 1/100; 30 dB = 1/1000 (matematika desibel). |
| 6 | Frekuensi lebih tinggi cenderung lebih teredam material bangunan (beton: redaman naik 4 dB per GHz di model 3GPP; median BEL ITU naik dari ≈14 dB ke ≈20 dB dari 0,9 ke 28 GHz untuk gedung tradisional). | S1, S2 | 2026-11-07 | HIGH | Lihat juga nuansa #8. |
| 7 | Semakin dalam ke tengah gedung, sinyal makin lemah: 3GPP memodelkan tambahan 0,5 dB per meter jarak masuk ke dalam gedung. | S2 (Tabel 7.4.3-2, PL_in = 0,5·d_2D-in) | 2026-11-07 | MED (anekdot pendukung S17: karyawan harus pindah ke dekat jendela) | Angka 0,5 dB/m adalah parameter model, bukan hukum fisika. |
| 8 | Logam (kerangka/dinding lift) bersifat konduktor sehingga memantulkan gelombang; ruang berdinding/berkerangka logam seperti lift meniru efek sangkar Faraday dan menimbulkan "dead zone". Lubang/celah yang jauh lebih kecil dari panjang gelombang tetap menghalangi; lubang yang lebih besar meloloskan gelombang (gelombang pendek lebih mudah lolos lewat jaring berukuran tetap). | S5 (bagian aplikasi & mesh), S3 (logam sebagai konduktor sangat tinggi di Tabel 3) | 2026-11-07 | MED | Tidak ketemu paper pengukuran khusus di dalam lift. Wikipedia menyebut petugas pemadam diperingatkan radio dua arah kemungkinan tak berfungsi di lift. Jangan pakai angka dB untuk lift. |
| 9 | Basement/bawah tanah: NIST mengamati sinyal 1830 MHz jatuh ke tingkat derau (noise floor) saat pemancar berada di basement sebuah gedung kantor (Gaithersburg, MD). | S4 (§6.6) | 2026-11-07 | MED | Pendukung Indonesia: #14 (terowongan MRT). |
| 10 | Redaman di dalam gedung sangat bervariasi; NIST (12 gedung, 2008) mencatat simpangan baku rata-rata 11,8–13,4 dB dan maksimum hingga 22,3 dB (di 900 MHz). | S4 (Executive Summary) | 2026-11-07 | HIGH untuk "sangat bervariasi" (S1 juga: "great variability"); angka MED | Data AS 2008. |
| 11 | DAS (distributed antenna system): banyak antena berdaya rendah tersebar di dalam gedung, terhubung ke satu sumber, menggantikan satu antena berdaya tinggi; mengurangi kerugian penetrasi dan menambah jalur pandang langsung. | S6, S10 (Radio Dot System sebagai sistem radio dalam ruang) | 2026-11-07 | HIGH | iDAS = DAS dalam gedung. |
| 12 | Femtocell/small cell: BTS mini berdaya rendah di rumah/kantor, tersambung ke jaringan operator lewat internet kabel (broadband); melayani sekitar 4–8 HP (rumah) atau 8–16 (perusahaan). | S7, S10 | 2026-11-07 | HIGH untuk konsep; kapasitas MED (S7 saja) | Ketersediaan femtocell untuk konsumen di Indonesia: tidak terverifikasi. |
| 13 | Wi-Fi Calling (VoWiFi): panggilan telepon biasa dialihkan lewat Wi-Fi + internet saat sinyal seluler lemah; butuh dukungan operator dan HP. | S8, S9 | 2026-11-07 | HIGH | Apple: "use Wi-Fi Calling ... in an area with little or no cellular coverage." Status dukungan per operator Indonesia 2026: tidak terverifikasi (Smartfren pernah uji/luncurkan VoWiFi 2016–2017 menurut CNN Indonesia; tidak dibaca penuh). |
| 14 | MRT Jakarta menunjuk Tower Bersama (TBIG) menyediakan sinyal seluler dan Wi-Fi di stasiun dan terowongan bawah tanah "hingga kedalaman lebih dari 20 meter"; kerja sama ditandatangani Des 2017, 10 tahun. Saat MRT mulai beroperasi (Maret 2019), di terowongan baru Telkomsel (48 BTS di 13 stasiun) yang tersedia, operator lain hilang sinyal sepanjang jalur bawah tanah. | S13, S14, S15 | 2026-11-07 | HIGH (data 2017–2019) | Kondisi operator di MRT saat ini (2026) tidak dicek: jangan klaim "sampai sekarang". |
| 15 | Di Indonesia, solusi in-building (IBS) disediakan perusahaan infrastruktur dengan konsep neutral host: satu infrastruktur antena/kabel dalam gedung dipakai bersama banyak operator dan ISP. | S16, S13, S17 | 2026-11-07 | HIGH | S17 adalah advertorial: pakai hanya sebagai pendukung. |
| 16 | Repeater/penguat sinyal yang dipasang sendiri tanpa sertifikat/izin dianggap ilegal di Indonesia karena memakai frekuensi tanpa izin dan bisa mengganggu jaringan publik; Kominfo menertibkannya sejak Des 2013. Ancaman pidana disebut merujuk UU 36/1999 Pasal 38 jo. 55 (pengguna, maks. 6 tahun/Rp600 juta) dan Pasal 32 jo. 52 (penjual, maks. 1 tahun/Rp100 juta). | S11, S12 | 2026-11-07 | HIGH untuk "harus legal/bersertifikat, konsultasi operator"; angka denda MED-LOW | Berita 2014–2015. Ketentuan pidana UU Telekomunikasi telah diubah oleh UU Cipta Kerja (UU 6/2023); angka denda terkini tidak terverifikasi. Berita Komdigi Des 2024 soal repeater ilegal ada tapi HTTP 403. |
| 17 | Lebih dari 80% data seluler dikonsumsi di dalam ruangan. | S10 (Ericsson); S17 (Tri: "sebagian besar lalu lintas data ... dari dalam ruangan") | 2026-11-07 | MED | Klaim vendor, tanpa metodologi. Bila dipakai, sebut "menurut Ericsson". |
| 18 | Kewajiban regulasi khusus (Kominfo/Komdigi/Pemda) agar mal/gedung memasang IBS. | — | 2026-11-07 | tidak terverifikasi | Tidak ditemukan aturan yang bisa dibaca. Jangan diklaim. |

## Musik & SFX

| Aset | Sumber | Lisensi |
|---|---|---|
| Musik latar | Prosedural numpy `_tools/synth_bgm.py` (dibuat AUDIRA) | Milik sendiri, bebas lisensi |
| SFX (whoosh, impact, pop, click, riser, glitch) | Pustaka AUDIRA `shared/assets/sfx` | Pustaka internal AUDIRA |
| VO | Cartesia sonic-3, suara Galang | Lisensi akun Cartesia AUDIRA |
