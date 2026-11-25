# SOURCE REGISTER — EP11 ATM & Deteksi Uang Palsu
Tanggal akses: 2026-11-23

Semua URL di bawah benar-benar dibuka saat riset (teks halaman/PDF dibaca langsung).

## A. Cara kerja sensor validator (prinsip umum)

| # | Fakta (1 kalimat, Indonesia) | Sumber (judul + URL) | Keyakinan (tinggi/sedang) |
|---|---|---|---|
| 1 | Kertas uang kertas tidak mengandung pemutih optik (optical brightener), sedangkan banyak kertas biasa memakainya sehingga berpendar kuat di bawah UV; karena itu cek pendaran UV jadi cara umum mendeteksi uang palsu. | Wikipedia — Optical brightener — https://en.wikipedia.org/wiki/Optical_brightener | tinggi |
| 2 | Pemutih optik menyerap sinar UV/violet (sekitar 340–370 nm) lalu memancarkan cahaya biru (sekitar 420–470 nm); inilah sebab kertas biasa "menyala" kebiruan di bawah lampu UV. | Wikipedia — Optical brightener — https://en.wikipedia.org/wiki/Optical_brightener | tinggi |
| 3 | Uang rupiah asli memakai bahan kertas 100% cotton, sedangkan uang palsu yang ditemukan umumnya memakai kertas biasa seperti HVS; Botasupal menyebut belum ada kasus uang palsu berbahan kertas cotton. | Tirto — Rasio Uang Palsu 2024-2025 Capai 1-4/Sejuta Lembar Uang Beredar (14 Agu 2026) — https://tirto.id/rasio-uang-palsu-2024-2025-capai-1-4sejuta-lembar-uang-beredar-hBir | tinggi |
| 4 | Sensor optik (fotosel atau kamera mini) membaca pola cetak uang, dan sebagian mesin menyinari uang dengan UV lalu mengukur pendarannya untuk menilai bahan kertas. | Wikipedia — Currency detector — https://en.wikipedia.org/wiki/Currency_detector | tinggi |
| 5 | Sensor magnetik bekerja dengan melewatkan uang di atas magnet permanen lalu membaca sisa medan magnet partikel tinta (tinta mengandung partikel feromagnetik). | Wikipedia — Currency detector — https://en.wikipedia.org/wiki/Currency_detector | tinggi |
| 6 | Ketebalan dan dimensi uang ikut diuji: saat uang lewat di antara rol, tegangan sensor berubah sesuai ketebalannya, sehingga lembar ganda/terlipat/tempelan terdeteksi. | Wikipedia — Currency detector — https://en.wikipedia.org/wiki/Currency_detector ; Easy-Banker — UV, MG, IR or CIS? — https://www.easy-banker.com/blog/uv-mg-ir-or-cis-how-banknote-detection-technologies-differ-and-what-your-business-actually-needs_b0033.html | tinggi (rol & tegangan) / sedang (lembar ganda/tempelan, sumber vendor) |
| 7 | Tinta bisa berwarna sama di cahaya tampak tetapi berbeda di spektrum inframerah; di bawah sensor IR sebagian gambar uang asli "menghilang" dan bagian lain tetap gelap. | Wikipedia — Security printing — https://en.wikipedia.org/wiki/Security_printing ; Easy-Banker (link di #6) | tinggi (prinsip) / sedang (detail "menghilang") |
| 8 | Contact Image Sensor (CIS) adalah kamera garis yang memotret seluruh muka uang saat bergerak lalu membandingkannya dengan templat tersimpan (potret, posisi tanda air, mikroteks, seri). | Easy-Banker (link di #6) | sedang |
| 9 | Selain fitur yang bisa dicek publik, banyak bank sentral memakai fitur rahasia "Level 3" yang hanya bisa dibaca mesin; M-Feature (Giesecke+Devrient) dipakai lebih dari 70 bank sentral. | Wikipedia — Security printing — https://en.wikipedia.org/wiki/Security_printing | sedang |

## B. Mesin setor tunai (CRM/CDM) di Indonesia & aturan BI

| # | Fakta (1 kalimat, Indonesia) | Sumber (judul + URL) | Keyakinan (tinggi/sedang) |
|---|---|---|---|
| 10 | BI (Marlison Hakim, Des 2024): ATM, CDM, dan CRM dirancang mengenali fitur keaslian rupiah dan diuji berdasarkan seluruh fitur keamanan rupiah oleh bank dan vendor sebelum dipakai. | Kompas.com — Bisakah Mesin ATM Setor Tarik Tunai Deteksi Uang Palsu? (2 Jan 2025) — https://www.kompas.com/jawa-tengah/read/2025/01/02/121828088/bisakah-mesin-atm-setor-tarik-tunai-deteksi-uang-palsu | tinggi |
| 11 | Presdir BCA (April 2021): CRM BCA mendeteksi uang palsu dan uang tidak layak edar — "akan ditolak, dia tidak akan masuk" — memakai sensor UV yang dikalibrasi untuk rupiah beredar. | Kontan — Presdir BCA: ATM setor tunai kami bisa deteksi uang palsu — https://keuangan.kontan.co.id/news/presdir-bca-atm-setor-tunai-kami-bisa-deteksi-uang-palsu | tinggi |
| 12 | Bank Mandiri (Nov 2020): seluruh mesin setor tunai dan setor-tarik tunai sudah dilengkapi pendeteksi uang palsu yang dikalibrasi dengan rupiah. | Detik Finance — Jadi Sasaran Uang Palsu, Mesin ATM Dilengkapi Alat Sensor? — https://finance.detik.com/moneter/d-5273722/jadi-sasaran-uang-palsu-mesin-atm-dilengkapi-alat-sensor | tinggi |
| 13 | Kasus Mesuji, Lampung (Okt 2022): 26 lembar Rp100.000 "tidak terbaca" mesin setor tunai BRI, korban melapor, dan kasus uang palsu Rp1,3 miliar terbongkar. | CNN Indonesia — Setor Tunai ATM Jadi Pembongkar Kasus Uang Palsu Rp1,3 Miliar — https://www.cnnindonesia.com/nasional/20221029152414-12-866926/setor-tunai-atm-jadi-pembongkar-kasus-uang-palsu-rp13-miliar | tinggi |
| 14 | Kasus Semarang (Nov 2020): pelaku menempelkan uang asli dengan uang palsu lalu menyetornya ke ATM; kasus terungkap karena bank menemukan uang palsu di dalam mesin. | Detik Finance — Modus Setor Uang Palsu Via ATM Terbongkar — https://finance.detik.com/moneter/d-5273150/modus-setor-uang-palsu-via-atm-terbongkar-hati-hati-ya | tinggi |
| 15 | PBI 21/10/PBI/2019 Pasal 36: bank harus menerima, MENAHAN, dan meneruskan uang rupiah yang diragukan keasliannya ke Bank Indonesia untuk diklarifikasi. | Peraturan Bank Indonesia No. 21/10/PBI/2019 tentang Pengelolaan Uang Rupiah (PDF) — https://www.bi.go.id/id/publikasi/peraturan/Documents/PBI_211019.pdf | tinggi |
| 16 | Hasil klarifikasi BI: bila asli, diganti sebesar nilai nominal; bila palsu, tidak diganti dan diproses sesuai ketentuan. | PBI 21/10/PBI/2019 (link di #15) ; Buku Panduan Uang Rupiah TE 2022 (link di #18) | tinggi |
| 17 | Uang untuk mengisi ATM/CDM/CRM adalah uang hasil pemrosesan (sortasi) bank atau PJPUR, yang wajib dipastikan tidak mengandung uang diragukan keasliannya. | PBI 21/10/PBI/2019, Pasal 32 & penjelasan pasal terkait PJPUR (link di #15) | tinggi |

## C. Ciri keaslian Uang Rupiah Tahun Emisi 2022

| # | Fakta (1 kalimat, Indonesia) | Sumber (judul + URL) | Keyakinan (tinggi/sedang) |
|---|---|---|---|
| 18 | Uang Rupiah TE 2022 terdiri atas 7 pecahan kertas (Rp1.000 s.d. Rp100.000), diluncurkan 18 Agustus 2022 bertepatan HUT RI ke-77. | CNN Indonesia — Fakta-fakta Uang Baru Tahun Emisi 2022 — https://www.cnnindonesia.com/ekonomi/20220819065354-78-836309/fakta-fakta-uang-baru-tahun-emisi-2022 ; BI — Buku Panduan Uang Rupiah TE 2022 (PDF) — https://www.bi.go.id/id/edukasi/Documents/Buku-Panduan-Uang-Rupiah-Tahun-Emisi-2022.pdf | tinggi |
| 19 | Cara mengecek keaslian adalah 3D: Dilihat (gambar utama, benang pengaman, tinta berubah warna), Diraba (cetak intaglio terasa kasar, blind code), Diterawang (tanda air + electrotype, rectoverso). | NU Online — Ciri-ciri Uang Baru 2022 — https://nu.or.id/nasional/ciri-ciri-uang-baru-2022-kenali-keasliannya-tAvfD ; Antara (link di #25) | tinggi |
| 20 | Benang pengaman ditanam atau dianyam pada kertas sehingga tampak sebagai garis dari atas ke bawah, dan pada pecahan tertentu memendar di bawah sinar UV. | BI — Buku Panduan Uang Rupiah TE 2022 (PDF), hlm. 6 (link di #18) | tinggi |
| 21 | Rp100.000 dan Rp50.000 TE 2022 memakai benang pengaman baru teknologi microlens (benang lama sudah dipakai ±20 tahun), yang tampak berubah-ubah dan bergerak. | Merdeka.com — Anti Dipalsukan, Ini Ragam Keistimewaan Uang Baru Emisi 2022 — https://www.merdeka.com/uang/anti-dipalsukan-ini-ragam-keistimewaan-uang-baru-emisi-2022.html ; CNBC Indonesia (link di #23) | tinggi |
| 22 | Optically Variable Magnetic Ink: gambar bunga di Rp100.000 & Rp50.000 berubah warna dengan efek gerak dinamis bila dilihat dari sudut berbeda; Rp20.000 memakai OVI bunga anggrek hitam yang berubah warna. | BI — Buku Panduan Uang Rupiah TE 2022 (PDF), hlm. 7 (link di #18) | tinggi |
| 23 | Di bawah sinar UV, Rp100.000 TE 2022 menampilkan peta Indonesia yang menyala, dan Rp50.000 (Djuanda, asal Jawa Barat) membuat pulau Jawa tampak lebih terang. | CNBC Indonesia — Tak Kasat Mata! Ada Gambar 'Misterius' di Uang Rupiah Baru — https://www.cnbcindonesia.com/news/20220818154940-4-364806/tak-kasat-mata-ada-gambar-misterius-di-uang-rupiah-baru | tinggi |
| 24 | Unsur cetak lain: rectoverso (cetakan depan-belakang saling isi tepat saat diterawang), mikroteks (perlu kaca pembesar), gambar tersembunyi/latent image (terlihat dari sudut tertentu), blind code tunanetra, dan gambar raster tulisan "NKRI". | BI — Buku Panduan Uang Rupiah TE 2022 (PDF), hlm. 7 (link di #18) | tinggi |
| 25 | Pecahan Rp50.000 TE 2022 meraih peringkat kedua dunia sebagai uang kertas paling aman/paling sulit dipalsukan (Nov 2024), dan seri TE 2022 meraih Best New Banknote Series IACA 2023. | Humas Polri — Polri dan BI Musnahkan 466.535 Lembar Uang Rupiah Palsu — https://humas.polri.go.id/news/detail/2386719-polri-dan-bank-indonesia-musnahkan-466535-lembar-uang-rupiah-palsu-perkuat-sinergi-jaga-kedaulatan-rupiah (cuplikan hasil pencarian; teks penuh tidak termuat) | sedang |

## D. Statistik & hukum

| # | Fakta (1 kalimat, Indonesia) | Sumber (judul + URL) | Keyakinan (tinggi/sedang) |
|---|---|---|---|
| 26 | Data BI: temuan uang palsu turun dari 5 ppm (5 lembar per 1 juta uang beredar) pada 2023 menjadi 4 ppm pada 2024–2025, dan 1 ppm pada April 2026. | CNBC Indonesia — BI dan Bareskrim Cs Musnahkan 466.535 Lembar Uang Palsu di 2017-2025 (13 Mei 2026) — https://www.cnbcindonesia.com/market/20260513112818-17-734663/bi-dan-bareskrim-cs-musnahkan-466535-lembar-uang-palsu-di-2017-2025 | tinggi |
| 27 | Sebagai pembanding, Botasupal menyebut pemalsuan dolar AS mencapai 14–20 ppm, jauh di atas rupiah (1–4 ppm pada 2024–2025). | Tirto (link di #3) | sedang (klaim narasumber, belum dicek ke sumber AS) |
| 28 | BI dan Polri memusnahkan 466.535 lembar uang palsu temuan 2017–November 2025 dari laporan masyarakat, perbankan, PJPUR, dan setoran bank. | CNBC Indonesia (link di #26) | tinggi |
| 29 | Pecahan Rp100.000 paling banyak dipalsukan, disusul Rp50.000 (contoh BI Tegal: 12.262 lembar Rp100.000 dan 5.704 lembar Rp50.000 dari 19.834 lembar). | Tirto — Polda Bali Musnahkan 3.731 Lembar Uang Palsu — https://tirto.id/polda-bali-musnahkan-3731-lembar-uang-palsu-berbagai-pecahan-hEjb ; Pikiran Rakyat Kabar Tegal — https://kabartegal.pikiran-rakyat.com/kabar-tegal/pr-9310003828/bi-tegal-musnahkan-19834-lembar-uang-palsu-pecahan-rp100-ribu-paling-dominan (cuplikan hasil pencarian) | sedang-tinggi (pola konsisten di banyak daerah; data nasional per pecahan tidak ditemukan) |
| 30 | UU 7/2011 Pasal 36 ayat (1): memalsu rupiah dipidana penjara paling lama 10 tahun dan denda paling banyak Rp10 miliar. | BI — Buku Panduan Uang Rupiah TE 2022 (PDF), hlm. 9 (link di #18) | tinggi |
| 31 | UU 7/2011 Pasal 36 ayat (3): mengedarkan/membelanjakan rupiah yang diketahui palsu dipidana penjara paling lama 15 tahun dan denda paling banyak Rp50 miliar. | BI — Buku Panduan Uang Rupiah TE 2022 (PDF), hlm. 10 (link di #18) | tinggi |
| 32 | UU 7/2011 Pasal 36 ayat (5): mengimpor/mengekspor rupiah palsu diancam penjara seumur hidup dan denda paling banyak Rp100 miliar. | BI — Buku Panduan Uang Rupiah TE 2022 (PDF), hlm. 10 (link di #18) | tinggi |

## E. Kandidat hook (akurat)

| # | Fakta (1 kalimat, Indonesia) | Sumber (judul + URL) | Keyakinan (tinggi/sedang) |
|---|---|---|---|
| 33 | Di bawah lampu UV, kertas HVS (bahan umum uang palsu) justru menyala kebiruan karena pemutih optik, sedangkan kertas cotton uang asli tetap kusam — mesin "melihat" bedanya, mata kita tidak. | Gabungan #1, #2, #3 | tinggi |
| 34 | Rp100.000 TE 2022 menyimpan peta Indonesia yang tak terlihat mata dan baru menyala di bawah sinar UV. | CNBC Indonesia (link di #23) | tinggi |

## Catatan

- **JANGAN dipakai di naskah — kecepatan mesin (lembar/detik, ms/lembar):** tidak ditemukan spesifikasi pabrikan (Glory, Hitachi-Omron, NCR, Diebold Nixdorf, Hyosung, JCM, CPI) yang bisa dibuka; mesin pencari memblokir permintaan otomatis dan tebakan URL produk JCM gagal (404). Klaim "deteksi dalam 1 detik" hanya ada di video TikTok — bukan sumber. Jika butuh angka, pakai frasa umum "dalam sekejap" tanpa angka.
- **JANGAN dipakai — "belasan sensor":** jumlah sensor per modul tidak terverifikasi. Pakai "beberapa jenis sensor: UV, magnetik, inframerah, ketebalan, dan kamera".
- **JANGAN dipakai — uang palsu DITAHAN otomatis oleh mesin CRM dan nasabah tidak dikreditkan:** tidak ditemukan halaman resmi bank (BCA/BRI/Mandiri) yang menjelaskan alur ini. Yang terverifikasi: (a) BCA menyatakan uang palsu "ditolak, tidak akan masuk" (#11); (b) PBI mewajibkan bank menahan dan meneruskan uang diragukan ke BI (#15). Aman ditulis: "uang yang dicurigai ditolak mesin; uang yang diragukan wajib ditahan bank dan dikirim ke BI untuk diperiksa".
- **Konflik angka ppm 2024:** Antara (Agu 2024, pejabat BI) menyebut 2 ppm untuk 2024 — https://www.antaranews.com/berita/4259439/rasio-peredaran-uang-palsu-tahun-ini-dua-ppm — sedangkan data BI terbaru di CNBC (Mei 2026) menyebut 4 ppm untuk 2024–2025. Pakai versi CNBC/BI terbaru (#26); hindari menyebut "2 ppm 2024".
- **Fitur "spark live"** disebut Botasupal belum berhasil dipalsukan (Tirto, #3), tetapi pecahan yang memakainya tidak disebut di sumber dan tidak tercantum di Buku Panduan BI — JANGAN dipakai tanpa verifikasi.
- **Warna OVMI (mis. "merah ke hijau")** tidak tercantum di sumber BI yang dibuka; Buku Panduan hanya menyebut "berubah warna dengan efek gerak dinamis". JANGAN sebut warna spesifik.
- **Gambar tersembunyi "tulisan BI"**: Buku Panduan menyebut latent image secara umum (gambar/tulisan tersembunyi dari sudut tertentu) tanpa merinci isinya untuk TE 2022. JANGAN sebut isi spesifik.
- **Cara kerja sensor IR/CIS/ketebalan** detail bersumber dari blog vendor (easy-banker.com) — keyakinan sedang; prinsip dasar (IR beda serapan tinta, magnet, ketebalan via rol) didukung Wikipedia.
- **Fitur IR/magnetik spesifik pada rupiah** (area mana yang bertinta magnetik/IR) tidak dipublikasikan BI di sumber yang dibuka. Bicarakan secara umum ("bagian tertentu dicetak dengan tinta khusus yang hanya terbaca mesin").
- Halaman bi.go.id (HTML) memerlukan JavaScript; isi diambil dari PDF resmi BI yang tertaut di halaman tersebut.
